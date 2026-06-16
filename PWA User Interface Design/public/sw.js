const CACHE_NAME = 'agbant-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation : on met en cache les fichiers de base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation : on nettoie les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Stratégie Stale-While-Revalidate
// On sert le cache immédiatement, et on met à jour en arrière-plan si possible
self.addEventListener('fetch', (event) => {
  // On ne gère pas les requêtes non-GET (comme les futurs exports si ajoutés)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          // On met à jour le cache avec la nouvelle réponse
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Si réseau coupé, fetch échoue, on ne fait rien, le cache a déjà été servi ou matchera null
        });

        // On retourne la réponse du cache si elle existe, sinon on attend le réseau
        return cachedResponse || fetchedResponse;
      });
    })
  );
});
