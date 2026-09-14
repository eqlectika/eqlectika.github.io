// sw.js — версия 2.0
const CACHE_VERSION = 'v2';
const CACHE_NAME = `paramount-cache-${CACHE_VERSION}`;

// Стратегия: 
// - APP_SHELL кэшируется при install (атомарно, через Promise.allSettled)
// - Пользовательские данные (localStorage) НЕ трогаются SW вообще
// - При activate удаляются ТОЛЬКО старые кэши SW, localStorage не трогается

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
    './breakthrough.png'
];

// ============ INSTALL ============
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Promise.allSettled — не падаем если один ресурс 404
            return Promise.allSettled(
                APP_SHELL.map(url =>
                    cache.add(url).catch(err => {
                        console.warn('[SW] Failed to cache:', url, err.message);
                    })
                )
            );
        }).then(() => {
            console.log('[SW] Install complete, version:', CACHE_VERSION);
            // НЕ вызываем skipWaiting() автоматически — ждём команды
        })
    );
});

// ============ ACTIVATE ============
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key.startsWith('paramount-cache-') && key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    })
            );
        }).then(() => {
            console.log('[SW] Activate complete');
            return self.clients.claim();
        })
    );
});

// ============ FETCH ============
self.addEventListener('fetch', event => {
    const request = event.request;

    // Игнорируем не-GET
    if (request.method !== 'GET') return;

    // Игнорируем внешние запросы (MQTT, шрифты, jQuery CDN)
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Навигационные запросы — offline-first
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Обновляем кэш свежей версией
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    return response;
                })
                .catch(() => {
                    // Offline fallback
                    return caches.match(request)
                        .then(cached => cached || caches.match('./index.html'));
                })
        );
        return;
    }

    // Остальные ресурсы — cache-first с фоновым обновлением
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

// ============ MESSAGE ============
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    // Новый тип: запрос версии
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});
