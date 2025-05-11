const CACHE_NAME = 'songbook-poc-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/main.css',
  '/assets/main.js',
];

// Cache song data
const SONG_DATA_CACHE = 'song-data-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(ASSETS_TO_CACHE)),
      caches.open(SONG_DATA_CACHE)
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Handle Supabase API requests
  if (event.request.url.includes('supabase.co')) {
    event.respondWith(
      caches.open(SONG_DATA_CACHE).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          (response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
  );
}); 