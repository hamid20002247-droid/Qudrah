/* Minimal offline shell for قُدرة PWA — bump CACHE when icons/assets change */
const CACHE = "qudrah-v4";
const PRECACHE = ["/", "/skills", "/manifest.webmanifest"];

function shouldBypassCache(url) {
  const path = new URL(url).pathname;
  return (
    path === "/favicon.ico" ||
    path.startsWith("/icons/") ||
    path.endsWith(".webmanifest") ||
    path.startsWith("/_next/") ||
    path.startsWith("/ingest")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Icons & Next assets: always network-first so favicon updates stick
  if (shouldBypassCache(req.url)) {
    event.respondWith(
      fetch(req)
        .then((res) => res)
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((res) => {
          const copy = res.clone();
          if (res.ok && req.url.startsWith(self.location.origin)) {
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
