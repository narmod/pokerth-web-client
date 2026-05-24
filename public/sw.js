/**
 * PokerTH Service Worker — v2
 * ⚠ Bumper CACHE_VERSION à chaque déploiement pour forcer la mise à jour
 *    ex: 'pokerth-v2025-05-24' ou juste incrémenter le numéro
 */
const CACHE_VERSION = 'pokerth-v2';
const ASSETS = [
  '/',
  '/pokerth-client.html',
  '/pokerth.js',
  '/pokerth.css',
  '/manifest.json'
];

// ── Install : précharger les assets ──
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function(c) { return c.addAll(ASSETS); })
      .catch(function() { /* ignore si hors-ligne */ })
  );
  // Prendre la main immédiatement (sans attendre fermeture des onglets)
  self.skipWaiting();
});

// ── Activate : supprimer les anciens caches ──
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(k) { return k !== CACHE_VERSION; })
          .map(function(k) {
            console.log('[SW] Suppression ancien cache:', k);
            return caches.delete(k);
          })
      );
    }).then(function() {
      // Contrôler toutes les pages ouvertes immédiatement
      return self.clients.claim();
    }).then(function() {
      // Notifier les clients qu'une nouvelle version est active
      return self.clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

// ── Message : SKIP_WAITING (depuis la page) ──
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Fetch : Network-first, cache en fallback offline ──
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  // Ne pas intercepter les WebSocket ni les requêtes cross-origin
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  // Stratégie : réseau d'abord, cache si réseau indisponible
  e.respondWith(
    fetch(e.request).then(function(response) {
      // Mettre à jour le cache si la réponse est valide
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_VERSION).then(function(c) { c.put(e.request, clone); });
      }
      return response;
    }).catch(function() {
      // Hors-ligne : servir depuis le cache
      return caches.match(e.request).then(function(cached) {
        return cached || new Response('Offline — rechargez quand vous êtes connecté', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});
