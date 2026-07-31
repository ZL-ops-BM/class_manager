// 班级管家 Service Worker —— 缓存应用外壳，实现离线可用与秒开
// 注意：每次修改静态资源（js/css）后，请把下面的版本号 +1，
// 否则旧缓存不会被清掉，页面会一直显示旧内容。
const CACHE = 'class-manager-v13';

// 应用外壳：首次访问后即被缓存，之后断网也能打开
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './css/styles.css',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // 网络优先，失败再回退缓存（保证改完代码刷新即可见，离线时仍可用缓存）
  event.respondWith(
    fetch(req).then((resp) => {
      if (resp && resp.status === 200 && resp.type === 'basic') {
        const copy = resp.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
      }
      return resp;
    }).catch(() => caches.match(req))
  );
});
