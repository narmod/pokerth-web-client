// ═══════════════════════════════════════════════════════════════════
// Session : navigation d'écrans (show), cycle de connexion (bouton,
// wake lock), reconnexion/rejoin après coupure, statut, envoi trames
// — chantier ESM #9f-10 (dernière vague du plan).
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t (i18n.mjs), acquireWakeLock/releaseWakeLock (misc.mjs) importés ;
// _showBanner / _lang via window.* ; `App` reste nu ; directWS via window (9g-A2)
// (résolus par l'environnement global, comme dans le script classique) ;
// $( réécrit en document.getElementById(.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { acquireWakeLock, releaseWakeLock } from '../ui/misc.mjs';

// Track mode + name of last Init sent so we can detect 'rapid mode swap'
// patterns that the PokerTH server's anti-brute-force flags as
// suspicious. When the user switches between login modes (guest /
// unauth / auth / LAN) without enough time between Init messages, the
// server temporarily blocks the IP. We enforce a minimum gap if the
// mode or nickname changes between two connect() calls.
function _connectBtnEl(){ return document.querySelector('#s-connect .btn-primary'); }
function _beginConnecting(){
  // Lock the WHOLE connection attempt (click → success OR failure), not just
  // the short pre-flight waits. Otherwise a re-click DURING the slow auth
  // handshake tears down the in-flight socket and reopens a fresh one — a
  // connect/close storm that makes the PokerTH server block the IP (err 7).
  S._connectingNow = true;
  var _fr = (typeof window._lang === 'undefined' || window._lang !== 'en');
  var b = _connectBtnEl();
  if (b) {
    if (S._connectBtnLabel === null) S._connectBtnLabel = b.textContent;
    b.disabled = true;
    b.textContent = _fr ? '⏳ Connexion…' : '⏳ Connecting…';
  }
  if (S._connectTimeout) clearTimeout(S._connectTimeout);
  S._connectTimeout = setTimeout(function(){
    // If auth never resolves, free the button so the user isn't stuck. We do
    // NOT close the socket: it may still complete, and a manual re-click will
    // now cleanly close+reopen (single cycle) via the lingering-WS path.
    if (!S._connectingNow) return;
    _endConnecting();
    try { setStatus(_fr ? 'La connexion prend du temps… réessaie si besoin.' : 'Connection is taking a while… retry if needed.', 'err'); } catch(e) {}
  }, 20000);
}
function _endConnecting(){
  S._connectingNow = false;
  if (S._connectTimeout) { clearTimeout(S._connectTimeout); S._connectTimeout = null; }
  var b = _connectBtnEl();
  if (b) {
    b.disabled = false;
    if (S._connectBtnLabel !== null) { b.textContent = S._connectBtnLabel; S._connectBtnLabel = null; }
  }
}

// ── DOM ──
// (const $ retiré — ligne avalée par l'extraction 9f-10, restaurée dans l'IIFE ; hotfix 0.3.849)

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  // Fenetre de classement : fermee a chaque changement d'ecran (ne traine
  // jamais). Boutons trophee visibles dans TOUS les modes (internet,
  // entrainement, LAN) — le classement passe par le relais /api/ranking,
  // independant du mode de connexion (restriction pokerth.net levee).
  if (window.closeRankingModal) window.closeRankingModal();
  if (window.closeTableRanking) window.closeTableRanking();
  try {
    var _rkb = document.getElementById('ranking-btn-lobby');
    if (_rkb) _rkb.style.display = (id === 's-lobby') ? '' : 'none';
    // Trophee aussi dans le header de jeu (entre le son et la roue crantee).
    var _rkg = document.getElementById('ranking-btn-game');
    if (_rkg) _rkg.style.display = (id === 's-game') ? '' : 'none';
    // Podium « classement de la table » (parite QML : lien du nom de table
    // dans la GameStatusBar) — masque en mode entrainement (bots sans saison).
    var _rkt = document.getElementById('tableranking-btn-game');
    if (_rkt) _rkt.style.display = (id === 's-game' && !window._offlineMode) ? '' : 'none';
  } catch (e) {}
  if (window._syncOverlayTop) window._syncOverlayTop();
  // Keep the screen awake only while at the table.
  if (id === 's-game') acquireWakeLock(); else releaseWakeLock();
  // PWA shortcut intent (?go=play|create): fire ONCE when the lobby first
  // appears (i.e. right after a successful connect). Cleared immediately so
  // later returns to the lobby (e.g. leaving a game) don't re-trigger it.
  if (id === 's-lobby' && window._pendingGo) {
    var _go = window._pendingGo; window._pendingGo = null;
    setTimeout(function () {
      try {
        if (_go === 'create') {
          if (App && App.toggleCreateForm) App.toggleCreateForm();
        } else if (App && App.autoJoinOrCreate) {
          App.autoJoinOrCreate();
        }
      } catch (e) {}
    }, 700);
  }
}

// [Phase 2 / 9d] Wake lock (acquire/release + _wakeLock) déplacé dans
// public/modules/ui/misc.mjs (toujours global via window.*).
// [Phase 2 / 9d] _sidStore/_getSessionId déplacées dans public/modules/ui/misc.mjs.

function _armRejoin() {
  if (S._intentionalDisconnect) return;
  var sgEl = document.getElementById('s-game');
  if (S.gId && sgEl && sgEl.classList.contains('active')) {
    S._pendingRejoin = S.gId;
    // Spectateur : pas de siège côté serveur → à la reconnexion il faudra
    // re-SPECTATER (JoinExistingGame spectateOnly) et non RejoinExistingGame,
    // sinon le serveur retire la session (RemovedFromGame onRequest) → lobby.
    S._pendingRejoinSpec = !!S._amSpectator;
  }
}

function _maybeReconnectOnResume() {
  if (S._intentionalDisconnect) return;
  if (window._offlineMode) return;                        // entraînement : aucun réseau à réparer
  if (!S._lastConnectParams) return;                      // jamais connecté cette session
  if (S.ws && S.ws.readyState === WebSocket.OPEN) {
    // Socket encore vivant. Réarmer l'horloge du watchdog : en arrière-plan
    // les timers sont gelés/throttlés → _lastRxTime est PÉRIMÉ au réveil, et
    // sans ce reset le watchdog « présume mort » un socket sain dans les 5 s
    // qui suivent le retour d'onglet → reconnexion forcée → éjection au lobby.
    // Un socket réellement zombie sera quand même détecté : il restera muet
    // pendant tout le seuil suivant (≥ 45 s) et le watchdog re-déclenchera.
    S._lastRxTime = Date.now();
    return;
  }
  var sg = document.getElementById('s-game');
  var sl = document.getElementById('s-lobby');
  var inSession = (sg && sg.classList.contains('active'))
               || (sl && sl.classList.contains('active'));
  if (!inSession) return;
  _armRejoin();
  // Annuler tout backoff déjà programmé par un onclose.
  clearTimeout(window._reconnectTimer);
  clearInterval(window._reconnectCountdown);
  S._reconnectAttempts = 0;
  // Refermer proprement un éventuel socket zombie avant de rouvrir.
  if (S.ws && S.ws.readyState !== WebSocket.CLOSED) {
    try { S.ws.onclose = null; S.ws.onerror = null; S.ws.onmessage = null; S.ws.close(); } catch(e) {}
    S.ws = null;
  }
  try { window._showBanner(t('reconnInProgress')); } catch(e) {}
  // preserve:true → on garde l'état de la table ; le proxy rebranche le
  // WebSocket sur la session PokerTH toujours vivante (même sid) → la partie
  // continue sans nouvel Init (pas de collision de pseudo, pas de blocage IP).
  try { App.connect({ preserve: true }); } catch(e) {}
}

document.addEventListener('visibilitychange', function () {
  if (document.hidden) return;
  var sg = document.getElementById('s-game');
  if (sg && sg.classList.contains('active')) acquireWakeLock();
  _maybeReconnectOnResume();
});
window.addEventListener('pageshow', _maybeReconnectOnResume);
// 'focus' : certains navigateurs mobiles déclenchent 'focus' (et pas toujours
// 'visibilitychange') quand on revient sur l'onglet après une autre appli.
// Idempotent : _maybeReconnectOnResume ne fait rien si le socket est vivant.
window.addEventListener('focus', _maybeReconnectOnResume);

// ── Détection d'un socket MORT (bascule réseau, ex. wifi → 5G) ─────────
// Sur un changement de réseau, l'ancien WebSocket peut rester readyState
// === OPEN tout en étant un « zombie » (TCP mort). _maybeReconnectOnResume
// ne suffit pas (il fait confiance à OPEN). Ici on FORCE : on démonte le
// socket quel que soit son état, puis on relance une connexion propre
// (même chemin que la reconnexion auto → même re-join de table).
function _forceReconnect() {
  if (S._intentionalDisconnect || !S._lastConnectParams) return;
  // Entraînement (offline) : il n'y a AUCUN réseau — le FakeServer vit dans la
  // page. « Reconnecter » ici détruit la partie en cours et rejoue Init/InitAck
  // → retour lobby/page création. Or l'event 'online' (bascule wifi/VPN, portail
  // captif…) et le watchdog RX peuvent se déclencher n'importe quand → c'était
  // une cause d'éjection aléatoire en pleine partie. On ne touche à rien.
  if (window._offlineMode) return;
  var sg = document.getElementById('s-game');
  var sl = document.getElementById('s-lobby');
  if (!((sg && sg.classList.contains('active')) || (sl && sl.classList.contains('active')))) return;
  _armRejoin();
  clearTimeout(window._reconnectTimer);
  clearInterval(window._reconnectCountdown);
  S._reconnectAttempts = 0;
  if (S.ws) {
    try { S.ws.onclose = null; S.ws.onerror = null; S.ws.onmessage = null; S.ws.onopen = null; S.ws.close(); } catch(e) {}
    S.ws = null;
  }
  S._lastRxTime = Date.now(); // éviter que le watchdog ne re-déclenche aussitôt
  try { window._showBanner(t('reconnInProgress')); } catch(e) {}
  try { App.connect({ preserve: true }); } catch(e) {}
}

function setStatus(txt, cls='', key) {
  // Mémorise la clé i18n du message courant (null pour les messages
  // transitoires : erreurs, « Initialisation… »), afin que _refreshConnectStatus
  // puisse le retraduire à la volée lors d'un changement de langue.
  S._statusKey = key || null;
  const el = document.getElementById('cstatus');
  el.textContent = txt;
  el.className = 'status ' + cls;
}

// ── RÉSEAU ──
function send(data) {
  if (!S.ws || S.ws.readyState !== WebSocket.OPEN) return;
  if (window.directWS) {
    // Direct WSS to pokerth.net: raw protobuf, no length prefix
    S.ws.send(data);
    return;
  }
  // Proxy mode: 4-byte big-endian length prefix + data
  const frame = new ArrayBuffer(4 + data.byteLength);
  new DataView(frame).setUint32(0, data.byteLength, false);
  new Uint8Array(frame).set(data, 4);
  S.ws.send(frame);
}

export { _connectBtnEl, _beginConnecting, _endConnecting, show, _armRejoin,
         _maybeReconnectOnResume, _forceReconnect, setStatus, send };

for (const [k, v] of Object.entries({ _connectBtnEl, _beginConnecting,
  _endConnecting, show, _armRejoin, _maybeReconnectOnResume, _forceReconnect,
  setStatus, send })) window[k] = v;
