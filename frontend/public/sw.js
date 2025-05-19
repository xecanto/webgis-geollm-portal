// Service worker for GeoLLM - enables offline capabilities and faster loading
const CACHE_NAME = 'geollm-cache-v1';

// Resources to cache immediately on service worker install
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/app.js',
  '/earth-grid.svg',
  '/globe-visualization.svg',
  '/vite.svg'
];

// Install event - cache core resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network with cache update
self.addEventListener('fetch', event => {
  // Skip cross-origin requests and non-GET requests
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // For HTML pages - use network-first strategy
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to be able to use it both in the cache and as the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For other resources - use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          // Update cache in background for next time
          fetch(event.request)
            .then(response => {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, response.clone());
                });
            })
            .catch(() => {});
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Clone the response to be able to use it both in the cache and as the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  // Force update of all cached resources
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
