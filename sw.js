// KPSS Dijital Koç – Ultimate Service Worker
const STATIC_CACHE = 'kpss-ultimate-static-v10';
const RUNTIME_CACHE = 'kpss-ultimate-runtime-v10';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './banks.js',
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
  './kamuyonetimi.json',
  './calismaekonomisi.json',
  './uluslararasiiliskiler.json',
];

const CDN_ALLOWLIST = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net',
];

async function precache(){
  const cache = await caches.open(STATIC_CACHE);
  await cache.addAll(STATIC_ASSETS);
}

async function cleanupOldCaches(){
  const keys = await caches.keys();
  await Promise.all(keys.map(k => {
    if (k !== STATIC_CACHE && k !== RUNTIME_CACHE){
      return caches.delete(k);
    }
  }));
}

async function cacheFirst(req){
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  cache.put(req, res.clone());
  return res;
}

async function networkFirst(req, cacheKeyOverride){
  const cache = await caches.open(RUNTIME_CACHE);
  const cacheKey = cacheKeyOverride || req;
  try {
    const fresh = await fetch(req);
    cache.put(cacheKey, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(cacheKey) || await caches.match(cacheKey);
    if (cached) return cached;
    return new Response('Offline', {status: 503, statusText: 'Offline'});
  }
}

async function staleWhileRevalidate(req){
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then(res => {
    cache.put(req, res.clone());
    return res;
  }).catch(()=>null);
  return cached || fetchPromise || new Response('Offline', {status: 503});
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    await precache();
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await cleanupOldCaches();
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const path = url.pathname.startsWith('/') ? '.' + url.pathname : url.pathname;

  if (url.origin === location.origin && STATIC_ASSETS.includes(path)){
    event.respondWith(cacheFirst(req));
    return;
  }

  if (url.origin === location.origin && url.pathname.endsWith('.json')){
    const cacheKey = new Request(url.origin + url.pathname);
    event.respondWith(networkFirst(req, cacheKey));
    return;
  }

  if (CDN_ALLOWLIST.some(prefix => req.url.startsWith(prefix))){
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  event.respondWith(networkFirst(req));
});
