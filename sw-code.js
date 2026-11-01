// sw.js
const CACHE = 'shell-v1';

// Только оболочка. Ничего из проверяемого кода здесь быть не должно.
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './research.html',
  './logo.png',
  // + иконки, указанные в manifest.json
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // 1) Не-GET и не-http(s) — не трогаем
  if (req.method !== 'GET') return;
  if (!/^https?:$/.test(new URL(req.url).protocol)) return;

  // 2) Запросы из srcdoc-iframe — только сеть, без кэша
  if (req.referrer === 'about:srcdoc') return;

  // 3) Всё, чего нет в whitelist, — тоже мимо кэша
  const url = new URL(req.url);
  const isShell = SHELL.some(p => url.pathname.endsWith(p.replace(/^\.\//, '')));
  if (!isShell) return;

  // 4) Оболочка: network-first с офлайн-фолбэком.
  //    Так обновления index.html/research.html видны сразу при онлайне.
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
