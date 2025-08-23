
const CACHE_NAME = 'listou-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  // logos e ícones removidos
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  // HTML: network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(r => {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return r;
      }).catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  // Others: stale-while-revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(networkResponse => {
        caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
        return networkResponse;
      }).catch(()=>cached);
      return cached || fetchPromise;
    })
  );
});
