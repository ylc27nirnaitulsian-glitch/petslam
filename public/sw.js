// PET SLAM Service Worker - High-Performance PWA & Offline Arena Cache
const CACHE_NAME = 'petslam-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './app-logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[PET SLAM SW] Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests from the same origin or static assets
  if (req.method !== 'GET') return;

  // Skip analytics, clarity, or external live sync requests
  if (
    url.hostname.includes('clarity.ms') ||
    url.hostname.includes('google-analytics') ||
    url.hostname.includes('supabase.co')
  ) {
    return;
  }

  // Stale-While-Revalidate strategy for lightning-fast loads + background update
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is navigation, return cached index.html
          if (req.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('/');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
