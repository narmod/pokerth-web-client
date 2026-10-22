// ═══════════════════════════════════════════════════════════════════
// Waiting room alerts (web.270).
//
// A Ranking table only starts once its 10 seats are full, which can take
// minutes: the player goes to another tab, the game starts without him and,
// with 5 s per action, he is folded hand after hand. The sounds were there
// (playerconnected / onlinegameready, QML parity) but nothing visible.
//
// While the tab is in the background (document.hidden), and only then:
//   · a Ranking table reaches max-1 (« 9/10 ») → « One more player! »,
//     once per table;
//   · my table starts (StartEvent) → « Your table is starting! »;
// each as a system notification (when the player allowed them) AND a
// blinking tab title, stopped as soon as the tab is back in front. Never in
// the offline training mode, never for a spectator.
//
// Permission: asked on the player's own click — « 🔔 Notify me » in the
// waiting room (modules/ui/lobby.mjs) — instead of cold on entering the
// lobby, which browsers silence (quiet UI) or hold against the site. The
// same permission serves the « your turn » notification (action-bar.mjs).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';

const RANKED_TYPE = 4;
const TAG = 'pokerth-wait';
let almostFor = 0;          // gid already told « one more player »

/** 'granted' | 'denied' | 'default' | 'unsupported' (iOS Safari outside an installed app…) */
export function notifState() {
  try {
    if (typeof window.Notification !== 'function' || window.isSecureContext === false) return 'unsupported';
    return window.Notification.permission || 'default';
  } catch (e) { return 'unsupported'; }
}

/** « 🔔 Notify me »: called in the click's own tick (the browser ties its prompt to the gesture). */
export function askNotify() {
  if (notifState() !== 'default') return Promise.resolve(notifState());
  let p;
  try { p = window.Notification.requestPermission(); } catch (e) { p = Promise.resolve(notifState()); }
  return Promise.resolve(p).catch(() => notifState()).then((r) => {
    try { if (typeof window._renderLobbyWaitActions === 'function') window._renderLobbyWaitActions(); } catch (e) {}
    return r;
  });
}

function sysNotify(title, body) {
  if (notifState() !== 'granted') return;
  const opts = { body, icon: '/icon-192.png', badge: '/icon-192.png', tag: TAG, renotify: true, silent: false };
  const plain = () => { try { new window.Notification(title, opts); } catch (e) {} };
  // Android Chrome only shows notifications through the service worker
  // (new Notification() throws there); no worker registered → the plain one.
  let sw = null;
  try { sw = navigator.serviceWorker; } catch (e) {}
  if (sw && typeof sw.getRegistration === 'function') {
    sw.getRegistration().then((reg) => { if (reg && typeof reg.showNotification === 'function') return reg.showNotification(title, opts); plain(); })
      .catch(plain);
    return;
  }
  plain();
}

function blinkTitle(msg) {
  try {
    clearInterval(S._titleBlinkID);
    let on = true;
    document.title = msg + ' — PokerTH';
    S._titleBlinkID = setInterval(() => {
      document.title = on ? (msg + ' — PokerTH') : S._origTitle;
      on = !on;
    }, 900);
    const back = () => {
      if (document.hidden) return;
      clearInterval(S._titleBlinkID);
      document.title = S._origTitle;
      document.removeEventListener('visibilitychange', back);
    };
    document.addEventListener('visibilitychange', back);
  } catch (e) {}
}

function alertAway(title, body) {
  if (!document.hidden) return;          // in front: the sound and the screen say it already
  sysNotify(title, body);
  blinkTitle(title);
}

function seatedOnline() { return !!S.gId && !S._amSpectator && !window._offlineMode; }
function myGame() { return (S.games && S.games[S.gId]) || {}; }

/** A player joined my waiting table (msg-game-join.mjs::onGamePlayerJoined). */
export function waitPlayerJoined() {
  if (!seatedOnline() || S._gameStarted) return;
  const g = myGame();
  const type = g.type || (S._gameMeta && S._gameMeta.type) || 1;
  if (type !== RANKED_TYPE || almostFor === S.gId) return;
  const max = g.maxPlayers || (S._gameMeta && S._gameMeta.maxPlayers) || 10;
  let n = 0;
  try { n = typeof window._gamePresentPids === 'function' ? window._gamePresentPids().length : 0; } catch (e) { n = 0; }
  if (max < 3 || n !== max - 1) return;
  almostFor = S.gId;
  alertAway(t('notifAlmostTitle'), t('notifAlmostBody', { n, max }));
}

/** My table starts (msg-game-join.mjs::onStartEvent). */
export function waitGameReady() {
  if (!seatedOnline()) return;
  alertAway(t('notifStartTitle'), t('notifStartBody'));
}

if (typeof window !== 'undefined') {
  window.notifState = notifState;
  window.askNotify = askNotify;
}
