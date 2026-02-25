const CACHE_NAME = 'polarity-sanctuary-v28';

const ASSETS = [
  './beta.html',
  './matrix.html',
  './blueprint.html',
  './telegram.PNG',
  './loop.html',
  './clock.html',
  './flash.html',
  './about.html',
  './print.html',
  './book.html',
  './me.jpeg',
  './cube.html',
  './print.html',
  './spark.html',
  './square.html',
  './vacuum.html',
  './size.html',
  './index.html',
  './code.html',
  './logo.png',
  './demo.html',
  './wire.html',
  './resume.html',
  './peer.html',
  './manifest.json',
  './db.json',
  './events.json',
  './lexicon.json',
  './matrix.html',
  './wave.html',
  './drop.html',
  './db.html',
  './icon-192x192.png', 
  './icon-512x512.png', 
  './quant.html',
  './nomad.html',
  './ray.html',
  './sharp.html',
  './blob.html',
  './pwa-init.js',
  
  'https://telegra.ph/An-Architectural-Anchor-in-the-Ocean-of-Semantic-Chaos-A-Survival-Guide-for-Virtual-Environments-02-11',
  'https://telegra.ph/On-Butterflies-Storms-and-Fatal-Negligence-02-13',
  'https://telegra.ph/Neural-Matrix-Operacionnyj-protokol-02-20',
  'https://telegra.ph/The-Crew-of-Samsara-in-the-London-Fog-01-13',
  'https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap',
  'https://unpkg.com/three@0.128.0/build/three.min.js',
  'https://fonts.googleapis.com/css2?family=Ubuntu&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three/examples/js/controls/OrbitControls.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Ubuntu&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.4.7/peerjs.min.js',

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
