/**
 * Lightweight API-key + rate-limit utilities for whatweek.ca public APIs.
 *
 * Storage strategy:
 *   - Valid API keys come from the `WHATWEEK_API_KEYS` env var (comma-separated).
 *     Each key may optionally be suffixed with a per-key minute limit using `:`
 *     (e.g. `key1:600,key2:6000`). Default keyed limit is 600/min.
 *   - Rate-limit counters are stored in an in-memory Map keyed by token + UTC
 *     minute window. This is per-instance only — when multiple regions or
 *     instances are running, limits are roughly multiplied. Acceptable for a
 *     stretch / first-release implementation; swap in Vercel KV / Upstash for
 *     globally-consistent counts when partner traffic grows.
 */

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** UNIX timestamp (seconds) when the current window resets. */
  resetAt: number;
  bucket: "anonymous" | "key";
  /** Identifier echoed to the caller for debugging. */
  identifier: string;
};

const ANONYMOUS_LIMIT_PER_MINUTE = 60;
const DEFAULT_KEYED_LIMIT_PER_MINUTE = 600;

type Counter = { count: number; resetAt: number };

const counters: Map<string, Counter> = new Map();

function parseKeyedLimits(): Map<string, number> {
  const raw = process.env.WHATWEEK_API_KEYS ?? "";
  const map = new Map<string, number>();
  for (const item of raw.split(",")) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const [token, limitStr] = trimmed.split(":");
    const limit = Number(limitStr);
    map.set(token, Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_KEYED_LIMIT_PER_MINUTE);
  }
  return map;
}

function getRequestApiKey(request: Request): string | null {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("api_key") ?? url.searchParams.get("apiKey");
  if (fromQuery) return fromQuery.trim() || null;
  const header = request.headers.get("x-api-key") ?? request.headers.get("authorization");
  if (!header) return null;
  const trimmed = header.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) return trimmed.slice(7).trim() || null;
  return trimmed || null;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function bumpCounter(token: string, windowMs: number, limit: number): {
  count: number;
  resetAt: number;
  allowed: boolean;
} {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetAt = windowStart + windowMs;
  const key = `${token}:${windowStart}`;
  const existing = counters.get(key);
  const next = existing && existing.resetAt === resetAt ? existing.count + 1 : 1;
  counters.set(key, { count: next, resetAt });
  // Periodic cleanup to prevent unbounded memory growth.
  if (counters.size > 5000) {
    for (const [k, v] of counters) {
      if (v.resetAt <= now) counters.delete(k);
    }
  }
  return { count: next, resetAt, allowed: next <= limit };
}

export function checkApiAccess(request: Request): RateLimitDecision {
  const apiKey = getRequestApiKey(request);
  const keyedLimits = parseKeyedLimits();
  const windowMs = 60_000;

  if (apiKey && keyedLimits.has(apiKey)) {
    const limit = keyedLimits.get(apiKey)!;
    const bumped = bumpCounter(`key:${apiKey}`, windowMs, limit);
    return {
      allowed: bumped.allowed,
      limit,
      remaining: Math.max(0, limit - bumped.count),
      resetAt: Math.floor(bumped.resetAt / 1000),
      bucket: "key",
      identifier: `key:${apiKey.slice(0, 6)}…`,
    };
  }

  const ip = getClientIp(request);
  const bumped = bumpCounter(`ip:${ip}`, windowMs, ANONYMOUS_LIMIT_PER_MINUTE);
  return {
    allowed: bumped.allowed,
    limit: ANONYMOUS_LIMIT_PER_MINUTE,
    remaining: Math.max(0, ANONYMOUS_LIMIT_PER_MINUTE - bumped.count),
    resetAt: Math.floor(bumped.resetAt / 1000),
    bucket: "anonymous",
    identifier: `ip:${ip}`,
  };
}

export function rateLimitHeaders(decision: RateLimitDecision): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(decision.limit),
    "X-RateLimit-Remaining": String(decision.remaining),
    "X-RateLimit-Reset": String(decision.resetAt),
    "X-RateLimit-Bucket": decision.bucket,
  };
}

export function rateLimitResponse(decision: RateLimitDecision): Response {
  const retryAfter = Math.max(1, decision.resetAt - Math.floor(Date.now() / 1000));
  return new Response(
    JSON.stringify({
      error: "rate_limited",
      message:
        decision.bucket === "anonymous"
          ? "Anonymous rate limit exceeded. Register an API key for higher limits at https://whatweek.ca/en/api-keys."
          : "API key rate limit exceeded. Slow down or contact support.",
      limit: decision.limit,
      retryAfterSeconds: retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Retry-After": String(retryAfter),
        ...rateLimitHeaders(decision),
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
