const CACHE_NAME = 'terminarz-cache-v1';
const urlsToCache = [
    '/terminarz/',
    '/terminarz/index.html',
    '/terminarz/styles.css',
    '/terminarz/script.js',
    '/terminarz/manifest.json',
    '/terminarz/service-worker.js',
    '/terminarz/icons/site.webmanifest',
    '/terminarz/icons/icon-192x192.png',
    '/terminarz/icons/icon-512x512.png',
    '/terminarz/icons/favicon-48x48.png',
    '/terminarz/icons/favicon.svg',
    '/terminarz/icons/favicon.ico',
    '/terminarz/icons/apple-touch-icon.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    'https://unpkg.com/@fullcalendar/core@6.1.8/index.global.min.js',
    'https://unpkg.com/@fullcalendar/daygrid@6.1.8/index.global.min.js',
    'https://unpkg.com/@fullcalendar/core@6.1.8/index.global.min.css'
];

// Instalacja Service Worker i cache'owanie zasobów
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

// Interceptowanie żądań i serwowanie z cache lub sieci
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Zwróć cache, jeśli istnieje
                if (response) {
                    return response;
                }
                // W przeciwnym razie, pobierz z sieci
                return fetch(event.request);
            })
    );
});

// Aktualizacja Service Worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Obsługa powiadomień push
self.addEventListener('push', event => {
    const data = event.data.json();
    const title = data.title || 'Nowe Powiadomienie';
    const options = {
        body: data.body || 'Otrzymałeś nowe powiadomienie.',
        icon: '/terminarz/icons/icon-192x192.png',
        badge: '/terminarz/icons/icon-192x192.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});