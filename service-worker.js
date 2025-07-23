const CACHE_NAME = 'friction-loss-calculator-v1';
// NOTE: You will need to create the /icons/icon-192.png and /icons/icon-512.png files yourself.
const urlsToCache = [
    '/',
    '/index.html',
    '/index.tsx',
    '/App.tsx',
    '/types.ts',
    '/constants.ts',
    '/services/frictionCalculator.ts',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    'https://cdn.tailwindcss.com',
    'https://esm.sh/react@^19.1.0',
    'https://esm.sh/react-dom@^19.1.0/client',
    'https://esm.sh/react@^19.1.0/',
    'https://esm.sh/react-dom@^19.1.0/'
];

// Install event: opens a cache and adds all specified URLs to it.
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and caching files');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event: serves responses from the cache first, falling back to the network.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Not in cache - fetch from network
                return fetch(event.request);
            })
    );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
