const CACHE_VERSION = 'v5';
const CACHE_NAME = `paramount-cache-${CACHE_VERSION}`;

const APP_SHELL = [
    '/',
    './index.html',
    './poster.html',
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
    './essence.html',
    './manifest-index.json',
    './manifest-essence.json',
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
'./star.png',
'./breakthrough.png',
'./Verge.jpeg',
'https://code.jquery.com/jquery-3.6.0.min.js',
'https://unpkg.com/mqtt@4.3.7/dist/mqtt.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.allSettled(
                APP_SHELL.map(url =>
                    cache.add(url).catch(err => {
                        console.warn('[SW] Failed to cache:', url, err.message);
                    })
                )
            );
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key.startsWith('paramount-cache-') && key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then(cached => cached || caches.match('./index.html'));
                })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cachedResponse => {
            const networkFetch = fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => cachedResponse);

            return cachedResponse || networkFetch;
        })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
