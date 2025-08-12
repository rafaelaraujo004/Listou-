// sw.js - Service Worker avançado para PWA Listou
// Cache inteligente, funcionalidade offline e background sync

const CACHE_NAME = 'listou-cache-v2';
const OFFLINE_CACHE = 'listou-offline-v2';
const DYNAMIC_CACHE = 'listou-dynamic-v2';

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/db.js',
    '/qr.js',
    '/intelligence.js',
    '/analytics.js',
    '/notifications.js',
    '/gestures.js',
    '/mobile-optimizations.js',
    '/manifest.webmanifest',
    '/icon-192.png',
    '/icon-512.png',
    '/logo.svg'
];

// Dados offline para funcionar sem internet
const OFFLINE_DATA = {
    lists: [],
    products: [],
    settings: {
        theme: 'light',
        currency: 'BRL',
        notifications: true
    },
    lastSync: Date.now()
};

// Install - Cache arquivos essenciais
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(cache => {
                console.log('[SW] Caching app shell');
                return cache.addAll(FILES_TO_CACHE);
            }),
            caches.open(OFFLINE_CACHE).then(cache => {
                console.log('[SW] Setting up offline data');
                return cache.put('/offline-data', 
                    new Response(JSON.stringify(OFFLINE_DATA), {
                        headers: { 'Content-Type': 'application/json' }
                    })
                );
            })
        ])
    );
    self.skipWaiting();
});

// Activate - Limpar caches antigos
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    event.waitUntil(
        Promise.all([
            caches.keys().then(keys =>
                Promise.all(
                    keys.filter(key => 
                        key !== CACHE_NAME && 
                        key !== OFFLINE_CACHE && 
                        key !== DYNAMIC_CACHE
                    ).map(key => {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    })
                )
            ),
            self.clients.claim()
        ])
    );
});

// Fetch - Strategy: Cache First para recursos estáticos, Network First para dados
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Strategy para diferentes tipos de recursos
    if (FILES_TO_CACHE.includes(url.pathname) || 
        event.request.destination === 'image' ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js')) {
        // Cache First para recursos estáticos
        event.respondWith(cacheFirst(event.request));
    } else if (url.pathname.includes('/api/') || 
               url.pathname.includes('/data/')) {
        // Network First para dados da API
        event.respondWith(networkFirst(event.request));
    } else {
        // Stale While Revalidate para outros recursos
        event.respondWith(staleWhileRevalidate(event.request));
    }
});

// Background Sync - Sincronizar dados quando a conexão voltar
self.addEventListener('sync', event => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-lists') {
        event.waitUntil(syncLists());
    } else if (event.tag === 'sync-purchases') {
        event.waitUntil(syncPurchases());
    } else if (event.tag === 'periodic-sync') {
        event.waitUntil(periodicSync());
    }
});

// Periodic Background Sync
self.addEventListener('periodicsync', event => {
    console.log('[SW] Periodic sync triggered:', event.tag);
    
    if (event.tag === 'update-data') {
        event.waitUntil(periodicSync());
    }
});

// Push notifications
self.addEventListener('push', event => {
    console.log('[SW] Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'Nova atualização disponível!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'Abrir App'
            },
            {
                action: 'dismiss',
                title: 'Dispensar'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Listou', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked');
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            self.clients.openWindow('/')
        );
    }
});

// ============== STRATEGIES ==============

async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Cache first failed:', error);
        return await getOfflineFallback(request);
    }
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network first failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        return cachedResponse || await getOfflineFallback(request);
    }
}

async function staleWhileRevalidate(request) {
    try {
        const cachedResponse = await caches.match(request);
        const networkResponsePromise = fetch(request).then(response => {
            if (response.ok) {
                const cache = caches.open(DYNAMIC_CACHE);
                cache.then(c => c.put(request, response.clone()));
            }
            return response;
        });
        
        return cachedResponse || await networkResponsePromise;
    } catch (error) {
        console.log('[SW] Stale while revalidate failed:', error);
        return await getOfflineFallback(request);
    }
}

async function getOfflineFallback(request) {
    const url = new URL(request.url);
    
    if (request.destination === 'document') {
        return await caches.match('/index.html');
    }
    
    if (url.pathname.includes('/api/') || url.pathname.includes('/data/')) {
        return await caches.match('/offline-data');
    }
    
    return new Response('Offline - Recurso não disponível', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// ============== SYNC FUNCTIONS ==============

async function syncLists() {
    try {
        console.log('[SW] Syncing lists...');
        
        // Buscar dados pendentes do IndexedDB
        const pendingData = await getPendingData('lists');
        
        if (pendingData.length > 0) {
            for (const item of pendingData) {
                await fetch('/api/lists', {
                    method: 'POST',
                    body: JSON.stringify(item),
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // Limpar dados pendentes após sincronização
            await clearPendingData('lists');
        }
        
        // Notificar sucesso
        await showSyncNotification('Listas sincronizadas com sucesso!');
        
    } catch (error) {
        console.log('[SW] Sync lists failed:', error);
    }
}

async function syncPurchases() {
    try {
        console.log('[SW] Syncing purchases...');
        
        const pendingData = await getPendingData('purchases');
        
        if (pendingData.length > 0) {
            for (const item of pendingData) {
                await fetch('/api/purchases', {
                    method: 'POST',
                    body: JSON.stringify(item),
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            await clearPendingData('purchases');
        }
        
        await showSyncNotification('Compras sincronizadas com sucesso!');
        
    } catch (error) {
        console.log('[SW] Sync purchases failed:', error);
    }
}

async function periodicSync() {
    try {
        console.log('[SW] Periodic sync running...');
        
        // Atualizar cache com dados mais recentes
        const response = await fetch('/api/sync');
        if (response.ok) {
            const data = await response.json();
            
            const cache = await caches.open(OFFLINE_CACHE);
            await cache.put('/offline-data', 
                new Response(JSON.stringify({
                    ...OFFLINE_DATA,
                    ...data,
                    lastSync: Date.now()
                }), {
                    headers: { 'Content-Type': 'application/json' }
                })
            );
        }
        
    } catch (error) {
        console.log('[SW] Periodic sync failed:', error);
    }
}

// ============== HELPER FUNCTIONS ==============

async function getPendingData(type) {
    // Simulação - em um app real, isso viria do IndexedDB
    return [];
}

async function clearPendingData(type) {
    // Simulação - em um app real, isso limparia o IndexedDB
    console.log(`[SW] Clearing pending ${type} data`);
}

async function showSyncNotification(message) {
    try {
        await self.registration.showNotification('Listou - Sincronização', {
            body: message,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'sync-notification',
            requireInteraction: false,
            silent: true
        });
    } catch (error) {
        console.log('[SW] Could not show sync notification:', error);
    }
}

console.log('[SW] Service Worker loaded successfully!');
