/* 生字词语听写 · Service Worker
 * 提供 PWA 安装能力 + 页面/索引离线缓存
 * 说明：COS 音频为跨域资源，不做离线缓存（在线播放），只缓存本站静态资源。 */
const CACHE_NAME = 'tingxie-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './data/%E4%B8%89%E5%B9%B4%E7%BA%A7%E4%B8%8A%E5%86%8C_index.json',
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
