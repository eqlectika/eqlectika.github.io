const CACHE_NAME = 'version-refresh-v1'; 
const REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; 

const CORE_ASSETS = [
    '/',
    './index.html',
    './manifest-index.json',
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
        caches.open(CACHE_NAME).then(async cache => {
            const existingTime = await cache.match('__install_timestamp');
            if (!existingTime) {
                await cache.put('__install_timestamp', new Response(Date.now().toString()));
            }

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
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(async keys => {
            let shouldUpdate = false;
            
            for (const key of keys) {
                if (key === CACHE_NAME) continue;
                const oldCache = await caches.open(key);
                const timeResponse = await oldCache.match('__install_timestamp');
                if (timeResponse) {
                    const installTime = parseInt(await timeResponse.text(), 10);
                    if (Date.now() - installTime > REFRESH_INTERVAL) {
                        shouldUpdate = true; 
                    }
                } else {
                    shouldUpdate = true; 
                }
            }

            if (!shouldUpdate && keys.includes(CACHE_NAME)) {
                return;
            }

            await Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );

            self.clients.claim();
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'SW_ACTIVATED',
                    version: CACHE_NAME
                });
            });
        })
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/index.html') {
        event.respondWith(
            caches.match('/').then(cached => {
                return cached || fetch(request);
            })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                if (request.url.includes('__install_timestamp')) return cachedResponse;
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
                            console.warn('[SW] Could not cache:', request.url, error);
                        });
                    });
                }
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
