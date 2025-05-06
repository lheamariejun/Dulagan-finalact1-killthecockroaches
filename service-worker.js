const CACHE_NAME = 'kill-the-cockroach-cache-v7'; // Updated cache version
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js', // Ensure the updated app.js is cached
  '/manifest.json',
  '/images/cockroach.png',
  '/images/cockroach-dead.png',
  '/images/kitchen-background.jpg',
  '/images/slipper-cursor.png',
  '/audio/background-music.mp3',
  '/audio/kill-sound.mp3',
  '/images/icons/icon-192.png',
  '/images/icons/icon-512.png',
  '/images/icons/icon-72.png',
  '/images/icons/icon-96.png',
  '/images/icons/icon-144.png',
];

// Install event: Cache all necessary files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: Serve cached files if available, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found, otherwise fetch from network
        return response || fetch(event.request).catch(() => {
          // Fallback for offline scenarios
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Activate event: Clean up old caches
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
