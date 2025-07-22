const CACHE_NAME = 'hexashift-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './alice.html',
  './libs/zxcvbn.js',
  './libs/qrcode.min.js',
  './libs/jsQR.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
