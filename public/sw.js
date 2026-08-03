// Auto Update & Cache Revalidation Service Worker for Aarambh Education PWA
const CACHE_NAME = 'aarambh-v' + Date.now();

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => caches.delete(cache))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always fetch fresh network content for API calls and HTML pages to guarantee real-time updates across mobile devices
  if (event.request.url.includes('/api/') || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    fetch(event.request).then((response) => {
      return response;
    }).catch(() => caches.match(event.request))
  );
});
