
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open('listou-cache').then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/app.js',
                '/manifest.json',
                '/manifest.webmanifest',
                '/icon-72.png',
                '/icon-96.png',
                '/icon-128.png',
                '/icon-144.png',
                '/icon-152.png',
                '/icon-192.png',
                '/icon-384.png',
                '/icon-512.png',
                '/icon-192-maskable.png',
                '/icon-512-maskable.png'
            ]);
        })
    );
});

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