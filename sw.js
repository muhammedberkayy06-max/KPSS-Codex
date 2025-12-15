// KPSS Dijital Koç – Ultimate Service Worker
const CACHE = 'kpss-ultimate-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './turkce.json',
  './matematik.json',
  './tarih.json',
  './cografya.json',
  './vatandaslik.json',
  './iktisat.json',
  './hukuk.json',
  './kamuyönetimi.json',
  './calismaekonomisi.json',
  './uluslararasiiliskiler.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k === CACHE) ? null : caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      const cache = await caches.open(CACHE);
      cache.put(req, res.clone());
      return res;
    } catch (e) {
      // Offline fallback: try root
      return cached || new Response('Offline', {status: 503, statusText: 'Offline'});
    }
  })());
});
