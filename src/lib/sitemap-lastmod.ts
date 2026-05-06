import { stat } from "node:fs/promises";
import path from "node:path";
import { keywordPageOrder } from "@/lib/keyword-targets";

type Locale = "en" | "fr";

type RouteKind =
  | "home"
  | "currentWeek"
  | "isoWeek"
  | "about"
  | "privacy"
  | "keyword"
  | "calendarYear"
  | "weekYear";

const sourceLastmodCache = new Map<RouteKind, string | undefined>();

function formatDateOnlyUtc(value: Date): string | undefined {
  if (!Number.isFinite(value.getTime())) {
    return undefined;
  }
  const yyyyMmDd = value.toISOString().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd) ? yyyyMmDd : undefined;
}

async function getSourceLastmod(kind: RouteKind): Promise<string | undefined> {
  if (sourceLastmodCache.has(kind)) {
    return sourceLastmodCache.get(kind);
  }

  const filePath = getSourcePathForKind(kind);
  try {
    const fileStat = await stat(filePath);
    const lastmod = formatDateOnlyUtc(fileStat.mtime);
    sourceLastmodCache.set(kind, lastmod);
    return lastmod;
  } catch {
    sourceLastmodCache.set(kind, undefined);
    return undefined;
  }
}

function getSourcePathForKind(kind: RouteKind): string {
  switch (kind) {
    case "home":
      return path.join(/*turbopackIgnore: true*/ process.cwd(), "src/app/[locale]/page.tsx");
    case "currentWeek":
      return path.join(/*turbopackIgnore: true*/ process.cwd(), "src/app/[locale]/current-week-number-canada/page.tsx");
    case "isoWeek":
      return path.join(/*turbopackIgnore: true*/ process.cwd(), "src/app/[locale]/iso-week-number-canada/page.tsx");
    case "about":
      return path.join(/*turbopackIgnore: true*/ process.cwd(), "src/app/[locale]/about/page.tsx");
    case "privacy":
      return path.join(/*turbopackIgnore: true*/ process.cwd(), "src/app/[locale]/privacy/page.tsx");
    case "keyword":
      return path.join(/*turbopackIgnore: true*/ process.cwd(), "src/app/[locale]/[keywordSlug]/page.tsx");
    case "calendarYear":
      return path.join(/*turbopackIgnore: true*/ process.cwd(), "src/app/[locale]/calendar/[year]/page.tsx");
    case "weekYear":
      return path.join(/*turbopackIgnore: true*/ process.cwd(), "src/app/[locale]/week/[year]/[week]/page.tsx");
    default: {
      const unreachable: never = kind;
      throw new Error(`Unhandled route kind: ${unreachable}`);
    }
  }
}

function getKindFromPath(pathWithoutLocale: string): RouteKind | undefined {
  if (pathWithoutLocale === "") {
    return "home";
  }
  if (pathWithoutLocale === "/current-week-number-canada") {
    return "currentWeek";
  }
  if (pathWithoutLocale === "/iso-week-number-canada") {
    return "isoWeek";
  }
  if (pathWithoutLocale === "/about") {
    return "about";
  }
  if (pathWithoutLocale === "/privacy") {
    return "privacy";
  }
  if (/^\/calendar\/\d{4}$/.test(pathWithoutLocale)) {
    return "calendarYear";
  }
  if (/^\/week\/\d{4}\/\d{1,2}$/.test(pathWithoutLocale)) {
    return "weekYear";
  }
  if (keywordPageOrder.some((slug) => pathWithoutLocale === `/${slug}`)) {
    return "keyword";
  }
  return undefined;
}

export async function getSitemapLastmod(_locale: Locale, pathWithoutLocale: string): Promise<string | undefined> {
  const kind = getKindFromPath(pathWithoutLocale);
  if (!kind) {
    return undefined;
  }
  return getSourceLastmod(kind);
}
