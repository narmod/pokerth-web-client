/**
 * PokerTH Service Worker — v4
 * ⚠ Bump CACHE_VERSION on every static deploy to force clients to update.
 *    Format: 'pokerth-v{MAJOR}.{MINOR}.{N}' where {N} is a monotonic deploy
 *    counter that doubles as the release patch number. A release tag equals
 *    this string without the 'pokerth-' prefix (cache pokerth-v0.2.378 ↔ v0.2.91).
 *
 * Strategy (v4):
 *   • install   — precache the critical app shell (HTML, JS, CSS, modules,
 *                 manifest, key PWA icons)
 *   • activate  — drop stale caches, enable navigation preload, notify pages
 *                 (clients.claim is intentionally omitted — see activate note)
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
const CACHE_VERSION = 'pokerth-v0.3.781-beta';

// Where navigations fall back to when the network is unavailable.
const NAV_FALLBACK = '/pokerth-client.html';

// Critical app shell precached on install. Keep this list tight — anything
// large or rarely used (e.g. the protobuf bundle, individual flags) is fetched
// on demand and then served from cache thanks to the SWR handler below.
const ASSETS = [
  '/',
  '/pokerth-client.html',
  '/pokerth.js',
  '/chat-emotes.js',
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
  '/fonts/inter-latin-wght-normal.woff2',
  '/fonts/inter-latin-ext-wght-normal.woff2',
  '/manifest.json',
  '/modules/i18n.mjs',
  '/modules/handlog.mjs',
  '/modules/journal.mjs',
  '/vendor/sql-wasm.js',
  '/vendor/sql-wasm.wasm',
  '/modules/theme.mjs',
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
  '/modules/music.mjs',
  // Sons de jeu PokerTH (MP3, AGPL-3.0)
  '/sounds/pokerth/fold.mp3',
  '/sounds/pokerth/check.mp3',
  '/sounds/pokerth/call.mp3',
  '/sounds/pokerth/bet.mp3',
  '/sounds/pokerth/raise.mp3',
  '/sounds/pokerth/allin.mp3',
  '/sounds/pokerth/dealtwocards.mp3',
  '/sounds/pokerth/yourturn.mp3',
  '/sounds/pokerth/blinds_raises_level1.mp3',
  '/sounds/pokerth/blinds_raises_level2.mp3',
  '/sounds/pokerth/blinds_raises_level3.mp3',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-32.png',
  '/favicon-192.png',
  '/favicon-512.png',
  '/logo-chip.png',
  '/bbc-icon.png',
  '/wec-icon.png',
  '/img/pokerth-login-bg.webp',
  // PWA install icons referenced by manifest.json
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png'
];

// Precache one asset with a couple of retries so a single flaky request
// doesn't leave a hole. addAll() is all-or-nothing (one failure rejects the
// whole batch) and its rejection used to be swallowed, so a hiccup during
// install could leave the cache empty without any signal. Per-asset with
// allSettled below means a miss is isolated, retried, and logged.
function precacheOne(cache, url, tries) {
  tries = tries || 3;
  return (async function () {
    for (var i = 0; i < tries; i++) {
      try {
        var res = await fetch(new Request(url, { cache: 'reload' }));
        if (res && res.status === 200) { await cache.put(url, res.clone()); return true; }
      } catch (e) { /* retry */ }
      await new Promise(function (r) { setTimeout(r, 400 * (i + 1)); });
    }
    console.warn('[SW] precache miss:', url);
    return false;
  })();
}

// ── Install : precache the app shell (per-asset, resilient) ──
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function (c) {
      return Promise.allSettled(ASSETS.map(function (u) { return precacheOne(c, u); }))
        .then(function (results) {
          var miss = results.filter(function (r) { return r.status === 'fulfilled' && r.value === false; }).length;
          if (miss) console.warn('[SW] precache incomplete:', miss, 'of', ASSETS.length, 'asset(s) missing');
          else console.log('[SW] precache complete:', ASSETS.length, 'assets');
        });
    })
  );
  // NOTE: skipWaiting() is deliberately NOT called here. A freshly installed SW
  // must WAIT until the user applies the update via the /__ver banner (which
  // posts SKIP_WAITING below, then reloads). Auto-activating would let the new
  // SW take over a live page and fire controllerchange, which can drop an
  // in-flight WebSocket to the proxy (close 1005) → the PokerTH server reads it
  // as a connect-then-drop and blocks the IP for a few minutes (the bug seen
  // when reconnecting after a reload with a cleared cache). Waiting also keeps
  // registration.waiting populated so the banner button has a worker to message.
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
      // NOTE: clients.claim() is deliberately NOT called. Taking control of an
      // already-loaded page fires controllerchange, which can drop an in-flight
      // WebSocket to the proxy (close 1005) and make the PokerTH server treat it
      // as a connect-then-drop → temporary IP block. This is the root cause of
      // the buggy reconnect after a reload (reliably reproduced once the cache
      // is cleared, since the SW then re-installs from scratch). Updates are
      // user-driven (the /__ver banner → SKIP_WAITING → reload), so the SW only
      // ever controls a freshly-navigated page, never a live one.
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
  // The admin dashboard + its API are authenticated and no-store: never let the
  // SW cache or serve them (otherwise the package list, status, logs… show stale
  // after a change). Network only — admin is an online-only tool.
  if (/^\/admin(?:\/|$)/.test(url.pathname)) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(handleNavigation(e));
  } else if (/\.(?:js|mjs|css)$/.test(url.pathname) || /^\/(?:table\/tables|cards\/decks|themes\/themes|music\/tracks)\.json$/.test(url.pathname) || url.pathname === '/app-config') {
    // Code, the runtime gallery manifests, AND the live /app-config are
    // network-first: a freshly imported package or a changed admin default must
    // be visible on the next load, never served stale from the SW cache.
    e.respondWith(handleCode(e));
  } else {
    e.respondWith(handleAsset(e));
  }
});
