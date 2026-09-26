const CACHE_NAME = 'version-flash'; 
const CORE_ASSETS = [
    '/',
    './index.html',
    './auction.html', 
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
    './manifest-auction.json',

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
    './planet.png',
    './cross.png',
    './flash-blur.png',
    './book.png',
    './clock.png',
    './matrix-v5.png',
    './fields.png',
    './break.png',
    './spark.png',
    './bismuth.png',
    './quaternion.PNG',
    './cube.png',
    './capital.png',
    './syntax.png',
    './words.png',
    './media.png',
    './bybit.png',
    './bitfufu.png',
    './binance.PNG',
    './star.png',
    './man.PNG',
    './woman.PNG'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            for (const asset of CORE_ASSETS) {
                try {
                    await cache.add(asset);
                } catch (err) {
                    console.warn('Failed to cache asset during install:', asset, err);
                }
            }
        })
    );
    self.self?.skipWaiting?.() || self.skipWaiting();
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

    const url = new URL(request.url);

    // API Binance — не кэшируем вообще
    if (url.hostname.includes('binance.com')) return;

    // HTML-навигация — stale-while-revalidate
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        // Обновляем кэш свежей версией
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => {
                        // Сеть упала — оставляем кэш как есть
                        return cachedResponse;
                    });

                    // Отдаём кэш СРАЗУ (если есть), сеть идёт в фоне
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // Всё остальное (картинки, шрифты, манифесты) — cache-first
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            return fetch(request).then(response => {
                if (!response || response.status !== 200 || response.type === 'error') return response;
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                return response;
            });
        })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
