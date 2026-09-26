// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/net/invite-link.mjs — invite links to a table (web).
//
// ONE place for the canonical invite link, used by every entry point:
//   · the « Invite friends » button of the waiting room (App.shareTableLink)
//   · the 🔗 button of the game-info panel (App.copyTableLink)
//   · a link opened while the app is already open (hashchange, PWA share)
//   · the landing of a freshly opened link (parseShareLink in pokerth.js)
//
// Canonical format (also parseable by the QML client):
//   <origin><path>#join=<gameName>&s=pokerth.net
//   <origin><path>#join=<gameName>&s=<host[:port]>[&tls=1]
// The game NAME (stable while the table exists, unlike the numeric id) and
// the target server, in the URL FRAGMENT so it never reaches server/CDN
// logs. The password is NEVER part of the link: joinGame() prompts for it.
//
// The pure helpers (build / parse / pick / warnings / watch) take all their
// inputs as arguments so scripts/test-invite-link.mjs can pin them offline.
// ─────────────────────────────────────────────────────────────────────────
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';

export const PTHNET = 'pokerth.net';
const DEFAULT_PORT = '7234';

// ── Pure helpers ────────────────────────────────────────────────────────

// Where the invitee must connect, derived from how *I* am connected.
// 'pokerth.net' is a symbolic token: the receiving install resolves it
// onto its own configured Internet server.
export function inviteTarget(loginMode, host, port, tls) {
  if (loginMode === 'guest' || loginMode === 'auth') return { s: PTHNET, tls: false };
  var h = String(host || '').trim(), p = String(port || '').trim();
  return { s: h + (p ? ':' + p : ''), tls: !!tls };
}

export function buildInviteUrl(base, name, target) {
  var s = (target && target.s) || PTHNET;
  return String(base || '') + '#join=' + encodeURIComponent(String(name || '')) +
    '&s=' + encodeURIComponent(s) + ((target && target.tls && s !== PTHNET) ? '&tls=1' : '');
}

// '#join=…&s=…[&tls=1]' → { name, s, tls } ; null when there is no table.
// tls: null (absent) or the raw string ('1' / '0').
export function parseInviteHash(hash) {
  try {
    var hp = new URLSearchParams(String(hash || '').replace(/^#/, ''));
    var name = hp.get('join') || '';
    if (!name) return null;
    return { name: name, s: hp.get('s') || '', tls: hp.get('tls') };
  } catch (e) { return null; }
}

// 'pokerth.net', 'host', 'host:port' → comparable key (port 7234 implied).
export function normServer(s) {
  var v = String(s || '').trim().toLowerCase();
  if (!v || v === PTHNET) return PTHNET;
  var m = v.match(/^\[([^\]]+)\](?::(\d+))?$/) || v.match(/^([^:]+)(?::(\d+))?$/);
  if (!m) return v;
  return m[1] + ':' + (m[2] || DEFAULT_PORT);
}

export function sameServer(a, b) { return normServer(a) === normServer(b); }

export function isLoopbackHost(s) {
  var v = String(s || '').trim().toLowerCase();
  var m = v.match(/^\[([^\]]+)\]/);
  var h = m ? m[1] : v.replace(/:\d+$/, '');
  return h === 'localhost' || h === '::1' || h === '0.0.0.0' || /^127\./.test(h);
}

export function namesMatch(a, b) {
  var x = String(a == null ? '' : a), y = String(b == null ? '' : b);
  return !!y && (x === y || x.trim() === y.trim());
}

// Which table of the lobby list the link means. Several tables may share a
// name: a table still waiting for players wins (one with a free seat first,
// the newest otherwise); a table already running is only watchable, so it
// is picked for spectating when nothing is waiting. Closed tables never.
export function pickInviteTable(games, name) {
  var open = [], running = [];
  Object.keys(games || {}).forEach(function (k) {
    var g = games[k];
    if (!g || !namesMatch(g.name, name)) return;
    var id = parseInt(k, 10);
    if (!(id > 0)) return;
    if (g.mode === 1) open.push(id);
    else if (g.mode === 2) running.push(id);
  });
  function newest(a) { return a.slice().sort(function (x, y) { return y - x; })[0]; }
  var free = open.filter(function (id) {
    var g = games[id];
    return !(g.maxPlayers > 0 && g.players >= g.maxPlayers);
  });
  if (free.length) return { id: newest(free), action: 'join' };
  if (open.length) return { id: newest(open), action: 'join' };
  if (running.length) return { id: newest(running), action: 'spectate' };
  return null;
}

// Why a link may not work for the friend — shown to the HOST when sharing.
// Game types: 1 normal, 2 registered only, 3 invite only, 4 ranking.
export function inviteWarnings(game, target) {
  var w = [], type = (game && game.type) || 1, s = (target && target.s) || PTHNET;
  if (type === 3) w.push('invWarnInviteOnly');
  if ((type === 2 || type === 4) && s === PTHNET) w.push('invWarnGuests');
  if (s !== PTHNET && isLoopbackHost(s)) w.push('invWarnLocalhost');
  return w;
}

// « Shared table not found » watch. Starts counting only once CONNECTED
// (the old 20 s timer ran from page load: a friend slower than that to type
// a nickname never got the message, and the stale name could later join an
// unrelated table of the same name). tick(now, env) is pure:
//   env = { pending, connected, resolve() → true when a join was sent }
// → 'done' (nothing pending any more) | 'wait' | 'joined' | 'notfound' | 'expired'
export function createNotFoundWatch(start, settleMs, maxMs) {
  var connectedAt = 0;
  return function tick(now, env) {
    if (!env.pending) return 'done';
    if (now - start > maxMs) return 'expired';
    if (!env.connected) { connectedAt = 0; return 'wait'; }
    if (!connectedAt) connectedAt = now;
    if (now - connectedAt < settleMs) return 'wait';
    return env.resolve() ? 'joined' : 'notfound';
  };
}

// ── Runtime (browser) ───────────────────────────────────────────────────

function _chat(key) {
  try { if (typeof window.addChat === 'function') window.addChat(null, t(key), 'sys', { key: key }); } catch (e) {}
}
function _hint(txt) {
  try { if (typeof window.showKeyHint === 'function') window.showKeyHint(txt); } catch (e) {}
}
function _connected() {
  return !!(S.myId && S.ws && S.ws.readyState === 1);
}

// Join (or watch) the table the pending link points at, if it is listed.
export function resolvePendingInvite() {
  var name = window._pendingAutoJoinName;
  if (!name || S.amInGame || S.gId) return false;
  var pick = pickInviteTable(S.games, name);
  if (!pick) return false;
  window._pendingAutoJoinName = '';
  var App = /** @type {any} */ (window).App;
  if (!App) return false;
  var watch = pick.action === 'spectate' || !!window.LIVE_MODE;
  _chat(pick.action === 'spectate' ? 'sharedTableRunning' : 'sharedTableJoining');
  try {
    if (watch && App.spectateGame) App.spectateGame(pick.id);
    else if (App.joinGame) App.joinGame(pick.id);
  } catch (e) {}
  return true;
}

// GameListNew brings the tables one by one right after login: wait a beat so
// every homonym is known before choosing (debounced).
var _resolveTimer = 0;
export function scheduleInviteResolve(delay) {
  clearTimeout(_resolveTimer);
  _resolveTimer = setTimeout(resolvePendingInvite, delay == null ? 400 : delay);
}

var _watchTimer = 0;
export function armNotFoundWatch(settleMs) {
  clearInterval(_watchTimer);
  var tick = createNotFoundWatch(Date.now(), settleMs == null ? 6000 : settleMs, 30 * 60 * 1000);
  _watchTimer = setInterval(function () {
    var r = tick(Date.now(), {
      pending: !!window._pendingAutoJoinName,
      connected: _connected(),
      resolve: resolvePendingInvite
    });
    if (r === 'wait') return;
    clearInterval(_watchTimer);
    if (r === 'notfound' || r === 'expired') {
      window._pendingAutoJoinName = '';
      if (r === 'notfound') _hint(t('sharedTableNotFound'));
    }
  }, 1000);
}

// A link opened while the app is ALREADY open (same tab, installed PWA via
// the share target): only the fragment changes, the page does not reload,
// so the landing code never runs. Handle it here.
export function onInviteHashChange() {
  var link = parseInviteHash(window.location.hash);
  if (!link) return false;
  // At a table: never leave it on our own — just tell the player.
  if (S.gId || S.amInGame) {
    try { window.history.replaceState({}, '', window.location.pathname); } catch (e) {}
    try {
      if (typeof window.showToast === 'function')
        window.showToast(t('invitedBanner') + ' \u00ab ' + link.name + ' \u00bb');
    } catch (e) {}
    return false;
  }
  var cur = null;
  if (_connected()) {
    var host = '', port = '', tls = false;
    try { host = (/** @type {any} */ (document.getElementById('host')) || {}).value || ''; } catch (e) {}
    try { port = (/** @type {any} */ (document.getElementById('port')) || {}).value || ''; } catch (e) {}
    try { var te = /** @type {any} */ (document.getElementById('use-tls')); tls = !!(te && te.checked); } catch (e) {}
    cur = inviteTarget(S._currentLoginMode || '', host, port, tls);
  }
  // Not connected, or connected to another server: reload on the link so
  // the regular landing (login mode, server fields, banner) takes over.
  if (!cur || !sameServer(link.s || PTHNET, cur.s)) {
    try { window.location.reload(); } catch (e) {}
    return true;
  }
  try { window.history.replaceState({}, '', window.location.pathname); } catch (e) {}
  window._pendingAutoJoinName = link.name;
  if (!resolvePendingInvite()) armNotFoundWatch(1500);
  return true;
}

export const InviteLink = {
  PTHNET, inviteTarget, buildInviteUrl, parseInviteHash, normServer, sameServer,
  isLoopbackHost, namesMatch, pickInviteTable, inviteWarnings, createNotFoundWatch,
  resolvePendingInvite, scheduleInviteResolve, armNotFoundWatch, onInviteHashChange
};

if (typeof window !== 'undefined') {
  /** @type {any} */ (window).InviteLink = InviteLink;
  try { window.addEventListener('hashchange', onInviteHashChange); } catch (e) {}
}
