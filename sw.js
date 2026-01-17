const CACHE_NAME = 'polarity-sanctuary-v12';

const ASSETS = [
  './word.html',
  './orbit.html',
  './flash.html',
  './about.html',
  './book.html',
  './me.jpeg',
  './3d.html',
  './print.html',
  './smart.html',
  './size.html',
  './index.html',
  './code.html',
  './logo.png',
  './manifest.json',
  './icon-192x192.png', 
  './icon-512x512.png', 
  
  'https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three/examples/js/controls/OrbitControls.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
