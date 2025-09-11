self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open('listou-cache').then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/app.js',
                '/manifest.json'
            ]);
        })
    );
});

// Fallback offline: mostra uma página customizada se offline
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') {
                    return new Response('<h1>Você está offline</h1><p>Conecte-se à internet para acessar novas páginas.</p>', {
                        headers: { 'Content-Type': 'text/html' }
                    });
                }
            });
        })
    );
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});