const CACHE_NAME = 'polarity-sanctuary-vlink';

const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',

    './cross.html',
    './flash.html',
    './match.html',
    './life.html',
    './spark.html',
    './capital.html',
    './clock.html',
    './syntax.html',
    './words.html',
    './jetpack.html',



    './manifest-cross.json',
    './manifest-flash.json',
    './manifest-match.json',
    './manifest-life.json',
    './manifest-spark.json',
    './manifest-capital.json',
    './manifest-syntax.json',
    './manifest-words.json',
    './manifest-jetpack.json',

    

    './handle.png',
    './ladybug-icon-10.png',
    './handle-black.png',
    './logo.png',
    './fleurdelis.png',
    './break.png',
    './onlyyou.png',
    './spark.png',
    './clock.PNG',
    './syntax.png',
    './words.png',
    './star.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            await Promise.all(
                CORE_ASSETS.map(async url => {
                    try {
                        const response = await fetch(url, { cache: 'no-cache' });

                        if (response.ok) {
                            await cache.put(url, response);
                        }
                    } catch (error) {
                        console.warn('[SW] Core asset skipped:', url, error);
                    }
                })
            );
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => {
            self.clients.claim();
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_ACTIVATED',
                        version: CACHE_NAME
                    });
                });
            });
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
                if (!response) {
                    return response;
                }

                if (response.ok || response.type === 'opaque') {
                    const copy = response.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, copy).catch(error => {
                            console.warn(
                                '[SW] Could not cache:',
                                request.url,
                                error
                            );
                        });
                    });
                }

                return response;
            });
        }).catch(() => {
            if (request.mode === 'navigate') {
                return caches.match('./index.html');
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
