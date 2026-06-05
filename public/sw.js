/**
 * PokerTH Service Worker — v4
 * ⚠ Bump CACHE_VERSION on every static deploy to force clients to update.
 *    Format: 'pokerth-v{MAJOR}.{MINOR}.{N}' where {N} is a monotonic deploy
 *    counter that doubles as the release patch number. A release tag equals
 *    this string without the 'pokerth-' prefix (cache pokerth-v0.2.91 ↔ v0.2.91).
 *
 * Strategy (v4):
 *   • install   — precache the critical app shell (HTML, JS, CSS, modules,
 *                 manifest, key PWA icons)
 *   • activate  — drop stale caches, enable navigation preload, claim clients,
 *                 notify pages
 *   • fetch     — split by request type for the best of both worlds:
 *                   – navigations (the HTML document) → NETWORK-FIRST, so a
 *                     fresh deploy is picked up immediately; falls back to the
 *                     cached shell when offline. Uses navigationPreload to
 *                     start the network request in parallel with SW boot.
 *                   – static assets (js, css, mjs, svg, png, fonts, proto…) →
 *                     STALE-WHILE-REVALIDATE: served instantly from cache and
 *                     refreshed in the background. Repeat loads are near
 *                     instant and work fully offline; the CACHE_VERSION bump on
 *                     each deploy still guarantees clients get the new files.
 *                 Cross-origin requests and WS upgrades are left untouched.
 *                 (Fonts are now self-hosted and handled by SWR above.)
 */
const CACHE_VERSION = 'pokerth-v0.2.205';

// Where navigations fall back to when the network is unavailable.
const NAV_FALLBACK = '/pokerth-client.html';

// Critical app shell precached on install. Keep this list tight — anything
// large or rarely used (e.g. the protobuf bundle, individual flags) is fetched
// on demand and then served from cache thanks to the SWR handler below.
const ASSETS = [
  '/',
  '/pokerth-client.html',
  '/pokerth.js',
  '/pokerth.css',
  // Self-hosted fonts (Cinzel + Inconsolata) — offline + privacy
  '/fonts/fonts.css',
  '/fonts/cinzel-latin-400-normal.woff2',
  '/fonts/cinzel-latin-600-normal.woff2',
  '/fonts/cinzel-latin-700-normal.woff2',
  '/fonts/cinzel-latin-ext-400-normal.woff2',
  '/fonts/cinzel-latin-ext-600-normal.woff2',
  '/fonts/cinzel-latin-ext-700-normal.woff2',
  '/fonts/inconsolata-latin-300-normal.woff2',
  '/fonts/inconsolata-latin-400-normal.woff2',
  '/fonts/inconsolata-latin-500-normal.woff2',
  '/fonts/inconsolata-latin-ext-300-normal.woff2',
  '/fonts/inconsolata-latin-ext-400-normal.woff2',
  '/fonts/inconsolata-latin-ext-500-normal.woff2',
  '/manifest.json',
  '/modules/i18n.mjs',
  // Offline (vs bots) mode modules
  '/modules/offline/engine.mjs',
  '/modules/offline/bots.mjs',
  '/modules/offline/proto.mjs',
  '/modules/offline/server.mjs',
  '/modules/offline/index.mjs',
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
  // Remaining UI languages — i18n.mjs imports all of them statically,
  // so they must be cached for the app to boot offline.
  '/modules/lang/af.mjs',
  '/modules/lang/bg.mjs',
  '/modules/lang/ca.mjs',
  '/modules/lang/cs.mjs',
  '/modules/lang/da.mjs',
  '/modules/lang/el.mjs',
  '/modules/lang/fi.mjs',
  '/modules/lang/gd.mjs',
  '/modules/lang/gl.mjs',
  '/modules/lang/hi.mjs',
  '/modules/lang/hr.mjs',
  '/modules/lang/hu.mjs',
  '/modules/lang/ja.mjs',
  '/modules/lang/ko.mjs',
  '/modules/lang/lt.mjs',
  '/modules/lang/nb.mjs',
  '/modules/lang/ro.mjs',
  '/modules/lang/sk.mjs',
  '/modules/lang/sr.mjs',
  '/modules/lang/sv.mjs',
  '/modules/lang/ta.mjs',
  '/modules/lang/tr.mjs',
  '/modules/lang/uk.mjs',
  '/modules/lang/vi.mjs',
  '/modules/lang/zh.mjs',
  '/modules/lang/zh-tw.mjs',
  '/modules/sounds.mjs',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-32.png',
  '/favicon-192.png',
  '/favicon-512.png',
  '/logo-chip.png',
  // PWA install icons referenced by manifest.json
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png'
];

// ── Install : precache the app shell ──
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function(c) { return c.addAll(ASSETS.map(function(u){ return new Request(u, { cache: 'reload' }); })); })
      .catch(function() { /* offline during install — skip */ })
  );
  // Take over immediately without waiting for all tabs to close.
  self.skipWaiting();
});

// ── Activate : drop old caches, enable nav preload ──
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
      // Let the browser fetch the navigation request in parallel with SW
      // startup so network-first navigations stay fast.
      if (self.registration.navigationPreload) {
        return self.registration.navigationPreload.enable();
      }
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

// Network-first, used for navigations (the HTML document). Prefers the preload
// response when available, refreshes the cached shell, and falls back to cache
// (then a tiny offline notice) when the network is down.
function handleNavigation(e) {
  return (async function() {
    try {
      var preload = await e.preloadResponse;
      var response = preload || await fetch(e.request);
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_VERSION).then(function(c) { c.put(e.request, clone); });
      }
      return response;
    } catch (err) {
      var cached = await caches.match(e.request);
      if (cached) return cached;
      var shell = await caches.match(NAV_FALLBACK);
      if (shell) return shell;
      return new Response('Offline — reload when you are back online', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })();
}

// Stale-while-revalidate, used for static assets. Serve from cache at once and
// refresh in the background; if nothing is cached, go to network and store it.
function handleAsset(e) {
  return caches.open(CACHE_VERSION).then(function(cache) {
    return cache.match(e.request).then(function(cached) {
      var network = fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          cache.put(e.request, response.clone());
        }
        return response;
      }).catch(function() { return null; });
      // Cache hit → instant response, network refresh happens in the background.
      // Cache miss → wait for the network (and a real Response on failure).
      return cached || network.then(function(r) {
        return r || new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    });
  });
}

// Network-first for app CODE (.js/.mjs/.css). `cache:'reload'` bypasses the
// HTTP disk cache so a deployed change is always picked up when online; falls
// back to the SW cache when offline (training mode keeps working on a plane).
function handleCode(e) {
  return (async function () {
    try {
      var fresh = await fetch(e.request, { cache: 'reload' });
      if (fresh && fresh.status === 200) {
        var clone = fresh.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put(e.request, clone); });
      }
      return fresh;
    } catch (err) {
      var cached = await caches.match(e.request);
      if (cached) return cached;
      return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })();
}

// ── Fetch : route by request type ──
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  // Don't intercept WebSocket upgrades or cross-origin requests (fonts etc.)
  if (url.origin !== self.location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(handleNavigation(e));
  } else if (/\.(?:js|mjs|css)$/.test(url.pathname)) {
    e.respondWith(handleCode(e));
  } else {
    e.respondWith(handleAsset(e));
  }
});
