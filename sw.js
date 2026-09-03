const CACHE_NAME = 'version-invertion'; 
const CORE_ASSETS = [
    '/',
    './index.html',
    './manifest-index.json',
    './cross.html',
    './flash.html',
    './life.html',
    './spark.html',
    './capital.html',
    './moon.html',
    './syntax.html',
    './words.html',
    './jetpack.html',
    './media.html',
    './paramount.html',
    './fields.html',
    './cube.html',
    './bismuth.html',
    './manifest-cross.json',
    './manifest-flash.json',
    './manifest-match.json',
    './manifest-life.json',
    './manifest-spark.json',
    './manifest-capital.json',
    './manifest-syntax.json',
    './manifest-words.json',
    './manifest-jetpack.json',
    './manifest-media.json',
    './manifest-paramount.json',
    './manifest-fields.json',
    './manifest-cube.json',
    './manifest-bismuth.json',
    './handle.png',
    './ladybug-icon-10.png',
    './handle-black.png',
    './logo.png',
    './fleurdelis.png',
    './fleurdelis-black.png',
    './florence.png',
    './capital.png',
    './fields.png',
    './break.png',
    './spark.png',
    './clock.PNG',
    './syntax.png',
    './words.png',
    './media.png',
    './bybit.png',
    './bitfufu.png',
    './binance.PNG',
    './star.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CORE_ASSETS);
        })
    );
    self.skipWaiting(); 
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request).then(response => {
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, copy);
                });
                return response;
            });
        }).catch(() => {
            if (request.mode === 'navigate') {
                return caches.match('/');
            }
            return Response.error();
        })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
