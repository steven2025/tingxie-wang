/* 生字词语听写 · Service Worker
 * 提供 PWA 安装能力 + 静态资源离线缓存
 * 说明：index.html 与 data/*.json 采用 network-first（页面/索引始终取最新，不受缓存卡住）；
 *       icons 等静态资源 cache-first。COS 音频为跨域资源，不缓存（在线播放）。 */
const CACHE_NAME = 'tingxie-v2';
const CORE_ASSETS = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
  './icons/icon-144.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // 跨域请求（COS 音频/索引）不拦截，直连
  if (url.origin !== location.origin) return;
  // 仅 GET
  if (e.request.method !== 'GET') return;

  const isPage = e.request.mode === 'navigate'
    || url.pathname.endsWith('/index.html')
    || url.pathname === '/'
    || url.pathname.endsWith('.json');

  if (isPage) {
    // 页面/JSON：network-first，保证总是拿到最新版本
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 静态资源：cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
