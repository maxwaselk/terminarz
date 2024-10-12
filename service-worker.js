// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Firebase configuration (replace with your own)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Caching assets
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
    'https://unpkg.com/@fullcalendar/core@6.1.8/index.global.min.css',
    'https://unpkg.com/@fullcalendar/daygrid@6.1.8/index.global.min.css',
    'https://unpkg.com/@fullcalendar/core@6.1.8/index.global.min.js',
    'https://unpkg.com/@fullcalendar/daygrid@6.1.8/index.global.min.js',
];

// Install event: cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
    console.log('[service-worker.js] Received background message ', payload);
    const notificationTitle = payload.notification.title || 'Nowe powiadomienie';
    const notificationOptions = {
        body: payload.notification.body || 'Otrzymałeś nowe powiadomienie.',
        icon: '/terminarz/icons/icon-192x192.png',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});