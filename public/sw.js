/**
 * PokerTH Service Worker — v3
 * ⚠ Bump CACHE_VERSION on every deploy to force update.
 *    e.g. 'pokerth-v70-05-26' or just increment the number.
 *
 * Strategy:
 *   • install   — precache the critical app shell (HTML, JS, CSS, modules,
 *                 manifest, key PWA icons)
 *   • activate  — drop stale caches, claim clients, notify pages
 *   • fetch     — network-first for same-origin GETs, cache fallback when
 *                 offline; cross-origin (fonts, etc.) and WS upgrades are
 *                 left untouched
 */
const CACHE_VERSION = 'pokerth-v77';

// Critical app shell precached on install. Keep this list tight — anything
// large or rarely used (e.g. the protobuf bundle) is fetched on demand and
// served from cache afterward thanks to the network-first handler below.
const ASSETS = [
  '/',
  '/pokerth-client.html',
  '/pokerth.js',
  '/pokerth.css',
  '/manifest.json',
  '/modules/i18n.mjs',
  '/modules/lang/en.mjs',
  '/modules/lang/fr.mjs',
  '/modules/lang/de.mjs',
  '/modules/lang/es.mjs',
  '/modules/lang/it.mjs',
  '/modules/lang/pt-br.mjs',
  '/modules/lang/pt-pt.mjs',
  '/modules/lang/nl.mjs',
  '/modules/lang/pl.mjs',
  '/modules/lang/ru.mjs',
  '/modules/sounds.mjs',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-32.png',
  '/favicon-192.png',
  '/favicon-512.png',
  '/logo-chip.png'
];

// ── Install : precache the app shell ──
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function(c) { return c.addAll(ASSETS); })
      .catch(function() { /* offline during install — skip */ })
  );
  // Take over immediately without waiting for all tabs to close.
  self.skipWaiting();
});

// ── Activate : drop old caches ──
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(k) { return k !== CACHE_VERSION; })
          .map(function(k) {
            console.log('[SW] Dropping old cache:', k);
            return caches.delete(k);
          })
      );
    }).then(function() {
      // Start controlling all open pages immediately.
      return self.clients.claim();
    }).then(function() {
      // Tell pages a new version is live so they can offer a reload prompt.
      return self.clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

// ── Message : SKIP_WAITING (from the page) ──
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Fetch : network-first, cache fallback when offline ──
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  // Don't intercept WebSocket upgrades or cross-origin requests (fonts etc.)
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  // Strategy: network first, fall back to cache when offline.
  e.respondWith(
    fetch(e.request).then(function(response) {
      // Refresh the cache when we got a valid response.
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_VERSION).then(function(c) { c.put(e.request, clone); });
      }
      return response;
    }).catch(function() {
      // Offline — serve from cache if we have it.
      return caches.match(e.request).then(function(cached) {
        return cached || new Response('Offline — reload when you are back online', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});
