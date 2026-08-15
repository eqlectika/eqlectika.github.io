const CACHE_NAME = 'polarity-sanctuary-v2';

const CORE_ASSETS = [
    './',
    './index.html',

    './cross.html',
    './match.html',
    './life.html',

    './manifest-cross.json',
    './manifest-ranking.json',
    './manifest-match.json',
    './manifest-life.json',

    './handle.png',
    './handle-black.png',
    './logo.png',
    './fleurdelis.png',
    './break.png',
    './onlyyou.png',
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
        ).then(() => self.clients.claim())
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
