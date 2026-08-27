const CACHE_NAME = 'polarity-vfieldcapital-v2';

const CORE_ASSETS = [
    '/index.html',
    '/cross.html',
    '/flash.html',
    '/match.html',
    '/life.html',
    '/spark.html',
    '/capital.html',
    '/clock.html',
    '/syntax.html',
    '/words.html',
    '/jetpack.html',
    '/media.html',
    '/paramount.html',
    '/manifest-cross.json',
    '/manifest-flash.json',
    '/manifest-match.json',
    '/manifest-life.json',
    '/manifest-spark.json',
    '/manifest-capital.json',
    '/manifest-syntax.json',
    '/manifest-words.json',
    '/manifest-jetpack.json',
    '/manifest-media.json',
    '/manifest-index.json',
    '/manifest-paramount.json',
    '/handle.png',
    '/ladybug-icon-10.png',
    '/handle-black.png',
    '/logo.png',
    '/fleurdelis.png',
    '/break.png',
    '/onlyyou.png',
    '/spark.png',
    '/clock.PNG',
    '/syntax.png',
    '/words.png',
    '/media.png',
    '/bitfufu.png',
    '/bybit.png',
    '/binance.PNG',
    '/star.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Кешируем все сразу, игнорируя ошибки
                return Promise.allSettled(
                    CORE_ASSETS.map(url => 
                        cache.add(url).catch(err => {
                            console.warn('[SW] Failed to cache:', url, err);
                        })
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys.filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    
    // Пропускаем не-GET запросы
    if (request.method !== 'GET') return;
    
    // Пропускаем запросы к аналитике и API
    if (request.url.includes('chrome-extension')) return;
    if (request.url.includes('analytics')) return;
    
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                // Если есть в кеше — возвращаем
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Иначе загружаем из сети
                return fetch(request)
                    .then(response => {
                        // Проверяем, что ответ валидный
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        
                        // Кешируем только GET запросы к нашим ресурсам
                        const url = new URL(request.url);
                        if (url.origin === self.location.origin) {
                            const copy = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, copy)
                                        .catch(err => console.warn('[SW] Cache put error:', err));
                                });
                        }
                        
                        return response;
                    })
                    .catch(() => {
                        // Если нет сети и нет кеша — показываем офлайн страницу
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Обработка сообщений от клиента
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
