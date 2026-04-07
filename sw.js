// IMPORTANTE: Incrementar a versão a cada atualização do app
const APP_VERSION = '1.0.50';
const CACHE_NAME = `listou-v${APP_VERSION}`;
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  // logos e ícones removidos
];

// Forçar instalação imediata do novo service worker
self.addEventListener('install', (event) => {
  console.log(`[SW] Instalando versão ${APP_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Limpar caches antigos e assumir controle imediatamente
self.addEventListener('activate', (event) => {
  console.log(`[SW] Ativando versão ${APP_VERSION}`);
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.filter(k => k !== CACHE_NAME).map(k => {
            console.log(`[SW] Deletando cache antigo: ${k}`);
            return caches.delete(k);
          })
        );
      })
      .then(() => self.clients.claim())
      .then(() => {
        // Notificar todos os clientes sobre a atualização
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: APP_VERSION
            });
          });
        });
      })
  );
});
// Receber mensagem para pular espera e ativar imediatamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Ativação imediata solicitada');
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // HTML: network-first com cache burst
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' }).then(r => {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return r;
      }).catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  
  // CSS/JS: network-first para forçar atualização
  if (request.url.match(/\.(css|js)$/)) {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
          return networkResponse;
        })
        .catch(() => caches.match(request))
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
