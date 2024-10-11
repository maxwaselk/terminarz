const CACHE_NAME = 'terminarz-cache-v1';
const urlsToCache = [
    '/terminarz/',
    '/terminarz/index.html',
    '/terminarz/styles.css',
    '/terminarz/script.js',
    '/terminarz/manifest.json',
    '/terminarz/icons/icon-192x192.png',
    '/terminarz/icons/icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
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