// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/misc.mjs
//
// Reliquat déménageable de l'IIFE App (étape 9d du plan docs/ESM_PLAN.md) :
//   • esc — échappement HTML (utilisé partout dans le rendu).
//   • _sidStore/_getSessionId — identifiant de session PAR ONGLET
//     (sessionStorage, crypto.randomUUID).
//   • acquireWakeLock/releaseWakeLock (+ _wakeLock) — écran allumé en jeu,
//     no-op propre si l'API manque.
//   • _handleCtrlFrame — trames de contrôle du proxy (SYNCTOK/INFO/NOTICE/
//     RESTART) partagées socket principale + canal notify-only ; s'appuie
//     sur showToast/_showBroadcast/showRestartNotice (window, module
//     shortcuts/monolithe).
//   • setPct — mises rapides 1/3·1/2·Pot (relaie window._syncRaiseBtnAmt).
//   • _attachPanelDrag — panneaux déplaçables (Pointer Events, position
//     mémorisée, bornée à l'écran).
//
// Verbatim modulo dédentation. EXCLUS volontairement (appellent des internes
// immobiles de l'App) : show (autoJoinOrCreate/_pendingGo), confirmCall
// (doAction/fmtChips), addChat ; la famille life/pet partira entière plus tard.
// ─────────────────────────────────────────────────────────────────────────

function t(key, opts) {
  return (typeof window !== 'undefined' && window.t) ? window.t(key, opts) : key;
}

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}
// ── Reconnexion immédiate au retour au premier plan ───────────────────
// iOS suspend la page en arrière-plan et FERME le WebSocket. Sans ça, on ne
// se reconnectait qu'au bout du backoff (5–30 s) → table « gelée » plusieurs
// secondes au retour. Dès qu'on redevient visible (ou qu'on récupère le
// réseau), si on est en session et que le socket n'est plus OPEN, on annule
// le backoff et on relance la connexion tout de suite (même chemin que la
// reconnexion auto, donc même re-join de table — juste sans l'attente).
// Avant TOUTE reconnexion en cours de partie : mémoriser la table où l'on
// était (gId). Sans ça _pendingRejoin reste à 0 et, au pseudo « déjà pris »
// (Error 4, fantôme encore assis), le client se renomme et ABANDONNE la
// table au lieu de la réclamer. Avec _pendingRejoin armé, le handler Error(4)
// attend que le fantôme tombe (heartbeat proxy) puis réessaie le MÊME pseudo
// → InitAck → buildRejoinGame → on récupère notre siège.
// ── Identifiant de session proxy (persistance réseau) ─────────────────
// Choix du stockage selon le contexte :
//  • PWA « standalone » (ajoutée à l'écran d'accueil — iOS notamment) : une
//    seule instance, mais iOS vide sessionStorage quand il tue/relance l'app.
//    → localStorage, pour que le sid survive au relancement et que le client
//    se REBRANCHE sur sa session vivante (sinon : nouvel Init qui se heurte à
//    son propre fantôme → initPlayerNameInUse → collision → initBlocked).
//  • Onglet de navigateur classique (desktop multi-onglets) : on veut un sid
//    PAR ONGLET pour que chaque onglet soit une session/joueur distinct.
//    → sessionStorage (unique par onglet, survit au rechargement de l'onglet).
function _sidStore() {
  try {
    var standalone = (window.navigator && window.navigator.standalone === true)
      || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    return standalone ? window.localStorage : window.sessionStorage;
  } catch (e) {
    return window.sessionStorage;
  }
}
function _getSessionId() {
  try {
    var store = _sidStore();
    var s = store.getItem('pth_sid');
    if (!s) {
      s = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : (Date.now() + '-' + Math.random().toString(36).slice(2));
      store.setItem('pth_sid', s);
    }
    return s;
  } catch (e) {
    return 'sid-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  }
}
// ── Screen Wake Lock ──────────────────────────────────────────────────
// Keeps the phone screen from dimming/locking while seated at a table (a
// turn-based game means long idle waits). The OS releases the lock when the
// tab is hidden, so we re-acquire it when the game screen regains focus.
// No-ops gracefully where the API is unavailable (older browsers).
var _wakeLock = null;
function acquireWakeLock() {
  if (!('wakeLock' in navigator) || _wakeLock) return;
  navigator.wakeLock.request('screen').then(function (wl) {
    _wakeLock = wl;
    wl.addEventListener('release', function () { _wakeLock = null; });
  }).catch(function () { /* denied or not visible — ignore */ });
}
function releaseWakeLock() {
  if (_wakeLock) { try { _wakeLock.release(); } catch (e) {} _wakeLock = null; }
}
// ── Trames de contrôle du proxy (texte) ─────────────────────────────
// NOTICE: (redémarrage programmé / annulation) et INFO: (diffusions admin).
// Retourne true si la trame a été consommée. Partagé entre la socket
// principale (mode proxy) et le canal notify-only (mode pokerth.net direct).
function _handleCtrlFrame(data) {
  if (typeof data !== 'string') return false;
  if (data.startsWith('NOTICE:')) {
    var nbody = data.slice(7);
    if (nbody === 'CANCEL') { if (typeof hideRestartNotice === 'function') hideRestartNotice(); if (typeof showToast === 'function') showToast(t('srvRestartCancelled'), { icon: '', duration: 4000 }); return true; }
    if (nbody.startsWith('RESTART:')) {
      var nr = nbody.slice(8), ns1 = nr.indexOf(':');
      if (ns1 > 0) {
        var ndead = parseInt(nr.slice(0, ns1), 10), nrest = nr.slice(ns1 + 1), ns2 = nrest.indexOf(':');
        var nkind = ns2 >= 0 ? nrest.slice(0, ns2) : nrest, nnote = ns2 >= 0 ? nrest.slice(ns2 + 1) : '';
        if (ndead && typeof showRestartNotice === 'function') showRestartNotice(ndead, nkind, nnote);
      }
    }
    return true;
  }
  if (data.startsWith('INFOCD:')) {
    // INFOCD:<échéance epoch ms>:<icône>:<message> — diffusion avec compte à rebours.
    var cb = data.slice(7), cs1 = cb.indexOf(':');
    if (cs1 > 0) {
      var cdAt = parseInt(cb.slice(0, cs1), 10), crest = cb.slice(cs1 + 1), cs2 = crest.indexOf(':');
      var cicon = cs2 >= 0 ? crest.slice(0, cs2) : '';
      var cmsg = cs2 >= 0 ? crest.slice(cs2 + 1) : crest;
      if (cmsg && cdAt && typeof _showBroadcast === 'function') _showBroadcast(cmsg, cicon, cdAt);
    }
    return true;
  }
  if (data.startsWith('INFO:')) {
    var ib = data.slice(5), is1 = ib.indexOf(':');
    var iicon = is1 >= 0 ? ib.slice(0, is1) : '';
    var imsg = is1 >= 0 ? ib.slice(is1 + 1) : ib;
    if (imsg && typeof _showBroadcast === 'function') _showBroadcast(imsg, iicon);
    return true;
  }
  return false;
}
function setPct(v) {
  const el = document.getElementById('raise-amt');
  if (!el) return;
  el.value = v;
  if (window.innerWidth < 640) {
    // Mobile : synchroniser slider + display, l'utilisateur valide avec le bouton Raise
    var slider  = document.getElementById('raise-slider');
    var display = document.getElementById('raise-display');
    if (slider)  slider.value       = v;
    if (display) display.textContent = v;
  } else {
    el.focus(); // Desktop : focus pour permettre l'ajustement
  }
  if (window._syncRaiseBtnAmt) window._syncRaiseBtnAmt();
}
// Moniteur d'odds (option pth_odds_monitor) : panneau compact listant la
// probabilité d'obtenir chaque catégorie de main au showdown. Calcul découpé
// (voir _oddsCompute) et abandonné si une street plus récente survient. Les
// anciennes valeurs restent affichées pendant le recalcul (pas de clignotement).
// Rend le moniteur d'odds déplaçable sur tous les appareils (souris + tactile +
// stylet) via la Pointer Events API. Position mémorisée (pth_odds_pos) et bornée à
// l'écran. Attaché à #odds-monitor lui-même -> survit aux reconstructions d'innerHTML.
function _attachPanelDrag(el, posKey, dragClass) {
  var drag = null;
  var BASE_W = (el.id === 'odds-monitor') ? 132 : 150;
  var SZKEY = posKey.replace('_pos', '_w');
  function _canResize() { try { return window.matchMedia('(min-width:600px)').matches; } catch (e) { return false; } }
  function applyWs() {
    if (!_canResize()) { el.style.removeProperty('--ws'); el.style.removeProperty('width'); return; }
    var w = el.offsetWidth || BASE_W;
    el.style.setProperty('--ws', (w / BASE_W).toFixed(3));
  }
  function clampPos(left, top) {
    var w = el.offsetWidth || 132, h = el.offsetHeight || 60;
    var maxL = Math.max(0, window.innerWidth - w), maxT = Math.max(0, window.innerHeight - h);
    return [Math.max(0, Math.min(left, maxL)), Math.max(0, Math.min(top, maxT))];
  }
  function applyPos(left, top) {
    var c = clampPos(left, top);
    el.style.left = c[0] + 'px'; el.style.top = c[1] + 'px';
    el.style.right = 'auto'; el.style.bottom = 'auto';
  }
  try { var s = localStorage.getItem(posKey); if (s) { var o = JSON.parse(s); if (o && typeof o.left === 'number') applyPos(o.left, o.top); } } catch (e) {}
  // Redimensionnement (desktop) : restaurer la largeur sauvee + ancrer a gauche
  // (left/top) pour que resize:horizontal fonctionne meme si l'ancrage CSS etait a droite.
  if (_canResize()) {
    try { var sw0 = localStorage.getItem(SZKEY); if (sw0) { var wv = parseInt(sw0, 10); if (wv > 0) el.style.width = wv + 'px'; } } catch (e) {}
    if (!el.style.left) { var rr = el.getBoundingClientRect(); el.style.left = Math.round(rr.left) + 'px'; el.style.top = Math.round(rr.top) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; }
  }
  applyWs();
  if (typeof ResizeObserver === 'function') {
    var _rt = null;
    var _ro = new ResizeObserver(function () {
      applyWs();
      if (_canResize()) { clearTimeout(_rt); _rt = setTimeout(function () { try { localStorage.setItem(SZKEY, String(Math.round(el.offsetWidth))); } catch (e) {} }, 250); }
    });
    try { _ro.observe(el); } catch (e) {}
  }
  el.addEventListener('pointerdown', function (e) {
    if (e.target && e.target.closest && e.target.closest('.win-x')) return;
    var r = el.getBoundingClientRect();
    if (_canResize() && (r.right - e.clientX) <= 18 && (r.bottom - e.clientY) <= 18) return;
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    el.classList.add(dragClass); e.preventDefault();
  });
  el.addEventListener('pointermove', function (e) {
    if (!drag) return; e.preventDefault();
    applyPos(e.clientX - drag.dx, e.clientY - drag.dy);
  });
  function end(e) {
    if (!drag) return; drag = null; el.classList.remove(dragClass);
    try { el.releasePointerCapture(e.pointerId); } catch (_) {}
    try { var r = el.getBoundingClientRect(); localStorage.setItem(posKey, JSON.stringify({ left: Math.round(r.left), top: Math.round(r.top) })); } catch (_) {}
  }
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  window.addEventListener('resize', function () { applyWs(); var r = el.getBoundingClientRect(); applyPos(r.left, r.top); });
}
// ─── Exports ES + alias legacy ───────────────────────────────────────────
export { esc, _getSessionId, acquireWakeLock, releaseWakeLock, _handleCtrlFrame, setPct, _attachPanelDrag };
if (typeof window !== 'undefined') {
  window.esc = esc;
  window._sidStore = _sidStore;
  window._getSessionId = _getSessionId;
  window.acquireWakeLock = acquireWakeLock;
  window.releaseWakeLock = releaseWakeLock;
  window._handleCtrlFrame = _handleCtrlFrame;
  window.setPct = setPct;
  window._attachPanelDrag = _attachPanelDrag;
}
