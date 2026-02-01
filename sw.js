const CACHE_NAME = 'mammoth-packer-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// External assets to cache (Firebase SDK)
const CDN_ASSETS = [
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js'
];

// Install: cache all static + CDN assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([...STATIC_ASSETS, ...CDN_ASSETS])
    )
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategies
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Let Firebase handle its own requests (RTDB uses WebSockets + REST)
  // Network-only for Firebase — its built-in offline persistence handles caching
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebaseinstallations')) {
    return;
  }

  // Cache-first for CDN assets (Firebase SDK JS files)
  if (url.hostname === 'www.gstatic.com') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for the main HTML (so updates propagate), fallback to cache
  if (e.request.mode === 'navigate' || url.pathname === '/index.html' || url.pathname === '/') {
    e.respondWith(
      fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for all other static assets (manifest, icons, etc.)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Return a basic offline fallback for unmatched requests
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
