const CACHE_NAME = 'nail-master-v3';
const OFFLINE_URL = '/offline.html';

// Не кешируем index.html при install — для HTML используем network-first
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/logo192.png',
  '/logo512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) =>
            name !== CACHE_NAME ? caches.delete(name) : Promise.resolve()
          )
        )
      )
      .then(() => self.clients.claim())
  );
});

const isNavigationRequest = (request) =>
  request.mode === 'navigate' ||
  (request.method === 'GET' &&
    request.headers.get('accept')?.includes('text/html'));

const isDataRequest = (url) => url.pathname.startsWith('/data/');

const isStaticAsset = (url) =>
  /\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2?)$/i.test(url.pathname);

/** HTML / навигация: сначала сеть, кеш только как fallback */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (isNavigationRequest(request)) {
      const offline = await cache.match(OFFLINE_URL);
      if (offline) return offline;
    }

    throw error;
  }
}

/** JS/CSS/картинки: кеш-first (имена с hash меняются при каждом build) */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.status === 200 && response.type === 'basic') {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

/** JSON прайса/галереи: отдать кеш сразу, параллельно обновить */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkUpdate = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkUpdate.catch(() => {});
    return cached;
  }

  const response = await networkUpdate;
  if (response) return response;
  throw new Error('Network error and no cache');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (request.method !== 'GET') return;

  if (
    isNavigationRequest(request) ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html')
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isDataRequest(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Посмотреть',
        icon: '/logo192.png',
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/logo192.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('SmartNails Stuttgart', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(Promise.resolve());
  }
});
