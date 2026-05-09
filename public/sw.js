const CACHE_NAME = "whatweek-v3";
const PRECACHE_URLS = ["/en", "/fr", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML: always bypass the HTTP cache (otherwise fetch() can return yesterday's document while
  // online). Do not store documents in the Cache API — that duplicated stale HTML behind SW.
  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  if (acceptsHtml) {
    const noStoreRequest = new Request(request, { cache: "no-store" });
    event.respondWith(
      fetch(noStoreRequest).catch(() =>
        caches.match(request).then((cached) =>
          cached ?? caches.match("/en").then((fallback) => fallback ?? Response.error()),
        ),
      ),
    );
    return;
  }

  // Next.js bundles and RSC fetches must not use stale-while-revalidate here — returning a
  // cached chunk first can leave navigations showing yesterday's server-rendered content.
  if (url.pathname.startsWith("/_next/") || url.searchParams.has("_rsc")) {
    event.respondWith(fetch(request));
    return;
  }

  // Stale-while-revalidate for other same-origin static assets (fonts, icons, etc.).
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
          }
          return response;
        })
        .catch(() => cached ?? Response.error());
      return cached ?? networkFetch;
    }),
  );
});
