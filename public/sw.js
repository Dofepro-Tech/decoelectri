/**
 * Service Worker Principal para Decoelectric
 * Proporciona:
 * 1. Funcionamiento offline completo (Caché de App Shell, activos y datos de la empresa)
 * 2. Página de respaldo fuera de línea (/offline.html)
 * 3. Compatibilidad con Firebase Cloud Messaging (Notificaciones Push en segundo plano)
 */

const CACHE_NAME = 'decoelectric-static-v1';
const DYNAMIC_CACHE_NAME = 'decoelectric-dynamic-v1';

// Activos esenciales pre-cacheados durante la instalación
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/LogoPrincipal.png',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/splash-mobile.jpg'
];

// 1. INSTALACIÓN: Pre-cachear el App Shell y la página offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-cacheando App Shell y recursos esenciales...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Algunos recursos estáticos no pudieron ser cacheados:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN: Limpiar cachés antiguas y tomar control de los clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[SW] Eliminando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Estrategias de red y caché resilientes
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorar peticiones no GET (POST, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar esquemas no soportados (extensiones, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // APIs externas y Firebase (Firestore, Auth, AI, Analytics) se manejan por red
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('fcm.googleapis.com') ||
    url.hostname.includes('generativelanguage.googleapis.com') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // A. Peticiones de Navegación HTML (páginas): Network-First con Fallback a Caché y a /offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Si no hay red, buscar en caché
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Intentar devolver el App Shell '/' o '/index.html'
          const appShell = await caches.match('/');
          if (appShell) {
            return appShell;
          }
          // Si el App Shell no está, devolver la página offline de la empresa
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) {
            return offlinePage;
          }
          return new Response('Sin conexión a internet. Por favor llama al 809-303-1738 para asistencia de Decoelectric.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // B. Fuentes de Google (Google Fonts & Gstatic): Cache-First
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // C. Activos estáticos locales (JS, CSS, imágenes, logos, favicons): Stale-While-Revalidate o Cache-First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla la red y no hay caché para una imagen, intentar devolver el logo
          if (request.destination === 'image') {
            return caches.match('/LogoPrincipal.png');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. FIREBASE CLOUD MESSAGING (Notificaciones Push en segundo plano)
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: "AIzaSyCwUPJJX1xwaohe52c6mDAMeJr5sOwFax8",
    authDomain: "gen-lang-client-0698477222.firebaseapp.com",
    projectId: "gen-lang-client-0698477222",
    storageBucket: "gen-lang-client-0698477222.firebasestorage.app",
    messagingSenderId: "903003354582",
    appId: "1:903003354582:web:9678dbeb6628a87d682077"
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Push recibido en segundo plano:', payload);

    const title = payload.notification?.title || payload.data?.title || 'Decoelectric Notificaciones';
    const body = payload.notification?.body || payload.data?.body || 'Nueva actualización sobre promociones o presupuestos.';

    const notificationOptions = {
      body: body,
      icon: '/LogoPrincipal.png',
      badge: '/icon.png',
      image: payload.notification?.image || payload.data?.image || undefined,
      data: payload.data || {},
      tag: payload.data?.tag || 'decoelectric-notification',
      renotify: true,
      actions: [
        { action: 'open_app', title: 'Ver en Decoelectric' },
        { action: 'dismiss', title: 'Cerrar' }
      ]
    };

    self.registration.showNotification(title, notificationOptions);
  });
} catch (fcmErr) {
  console.log('[SW] Firebase messaging compat no cargado o sin red en inicio:', fcmErr);
}

// 5. Clic en Notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification?.data?.click_action || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
