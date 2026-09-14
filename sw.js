// sw.js — ЗАМЕНИТЬ ПОЛНОСТЬЮ

const CACHE_VERSION = 'v2.0.1'; // ← МЕНЯЙТЕ при каждом обновлении!
const CACHE_NAME = 'version-target-' + CACHE_VERSION;
const RUNTIME_CACHE = 'runtime-' + CACHE_VERSION;

const CORE_ASSETS = [
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
    './Verge.jpeg'
];

// ==================== INSTALL ====================
// Кэшируем всё, НО не удаляем старые кэши — они нужны для отката
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            console.log('[SW] Installing version:', CACHE_VERSION);
            // Кэшируем параллельно с обработкой ошибок
            await Promise.allSettled(
                CORE_ASSETS.map(asset =>
                    cache.add(asset).catch(err => {
                        console.warn('[SW] Failed to cache:', asset, err);
                    })
                )
            );
        })
    );
    // НЕ вызываем skipWaiting() здесь — ждём решения пользователя
});

// ==================== ACTIVATE ====================
// Удаляем ТОЛЬКО старые версии этого же приложения,
// но НЕ трогаем localStorage и данные пользователя
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    // Удаляем только старые кэши НАШЕГО приложения
                    // (начинающиеся с version-target- или runtime-)
                    const isOurCache = key.startsWith('version-target-') || 
                                       key.startsWith('runtime-');
                    const isCurrent = key === CACHE_NAME || key === RUNTIME_CACHE;
                    
                    if (isOurCache && !isCurrent) {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    }
                    // ВАЖНО: кэши других приложений НЕ трогаем
                })
            );
        }).then(() => {
            console.log('[SW] Activated version:', CACHE_VERSION);
            return self.clients.claim();
        })
    );
});

// ==================== FETCH ====================
// Стратегия: Cache First для навигации и статики,
// Network First для данных с последующим fallback на кэш.
self.addEventListener('fetch', event => {
    const request = event.request;

    // Игнорируем не-GET запросы
    if (request.method !== 'GET') return;

    // Игнорируем запросы к MQTT-брокерам и внешним API
    const url = new URL(request.url);
    if (url.protocol === 'wss:' || url.protocol === 'ws:') return;
    if (url.hostname.includes('mqtt') || 
        url.hostname.includes('broker') ||
        url.hostname.includes('emqx') ||
        url.hostname.includes('hivemq') ||
        url.hostname.includes('mosquitto')) return;

    // Навигационные запросы (страницы) — Cache First с fallback на index.html
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, copy);
                        });
                    }
                    return response;
                }).catch(() => {
                    // Offline fallback — пытаемся вернуть index.html
                    return caches.match('./index.html').then(idx => {
                        return idx || caches.match('/') || new Response(
                            '<h1>Offline</h1><p>Нет соединения и нет кэша.</p>',
                            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                        );
                    });
                });
            })
        );
        return;
    }

    // Для всех остальных запросов — Stale-While-Revalidate
    // (отдаём из кэша, параллельно обновляем)
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            const fetchPromise = fetch(request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200 && 
                    networkResponse.type !== 'error') {
                    const copy = networkResponse.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, copy);
                    });
                }
                return networkResponse;
            }).catch(() => null);

            // Возвращаем кэш сразу, если он есть; иначе ждём сеть
            return cachedResponse || fetchPromise;
        }).catch(() => {
            return Response.error();
        })
    );
});

// ==================== MESSAGE ====================
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Skipping waiting, activating new version...');
        self.skipWaiting();
    }
    
    // Опционально: запрос версии от клиента
    if (event.data && event.data.type === 'GET_VERSION') {
        event.source.postMessage({ type: 'VERSION', version: CACHE_VERSION });
    }
});
