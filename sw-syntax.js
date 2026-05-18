const CACHE_NAME = 'syntax-cache-v1';
const ASSETS_TO_CACHE = [
  './syntax.html',
  './manifest-syntax.json',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js',
  'https://cdn.jsdelivr.net/npm/typo-js@1.2.4/typo.min.js',
  'https://cdn.jsdelivr.net/jsdelivr/gh/cfinke/Typo.js@master/typo/dictionaries/en_US/en_US.aff',
  'https://cdn.jsdelivr.net/jsdelivr/gh/cfinke/Typo.js@master/typo/dictionaries/en_US/en_US.dic'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
