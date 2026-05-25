const CACHE_NAME = "trainer-v2";
const ASSETS = [
  "capital.html",
  "manifest-capital.json",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

