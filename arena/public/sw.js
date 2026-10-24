// ═══════════════════════════════════════════════════════════════════
// Arena — the app's service worker (service 0.30.0), scope /arena/.
//
// Installable on phones and computers (manifest.json). Network first, always:
// a page, a script or a style comes from the server when it can be reached
// (what the director says changes all the time), and from this cache only
// when it cannot — then the app still opens and says it is offline. The API
// (/arena/api/…) is never cached: an answer kept here would be stale.
// The organizer's tools are left alone. The service fills in its version:
// a new release, a new cache, the old ones cleared.
// ═══════════════════════════════════════════════════════════════════
const CACHE = 'arena-__ARENA_VERSION__';
const SHELL = ['/arena/', '/arena/arena.css', '/arena/public.mjs', '/arena/home.mjs', '/arena/theme.mjs', '/arena/lang-meta.mjs', '/arena/lang/en.mjs', '/arena/icons/icon-192.png', '/arena/manifest.json'];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.indexOf('arena-') === 0 && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.indexOf('/arena/') !== 0) return;
  if (url.pathname.indexOf('/arena/api/') === 0 || url.pathname.indexOf('/arena/organize') === 0 || url.pathname === '/arena/sw.js') return;
  const nav = req.mode === 'navigate';
  ev.respondWith(fetch(req).then((res) => {
    if (res && res.ok && (nav || /\.(?:mjs|js|css|json|png|svg|jpg)$/.test(url.pathname))) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(nav ? '/arena/' : req, copy)).catch(() => {});
    }
    return res;
  }).catch(() => caches.match(nav ? '/arena/' : req).then((hit) => hit || caches.match('/arena/')).then((hit) => hit || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))));
});
