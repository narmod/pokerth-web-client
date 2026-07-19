#!/usr/bin/env node
// Deterministic tests for public/modules/net/msg-lobby.mjs (ESM #9g-C3).
// Run: node scripts/test-msg-lobby.mjs
globalThis.window = globalThis;
const store = {};
globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null),
  setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  value: '', appendChild(c) { this.children.push(c); }, remove() {}, addEventListener() {},
  classList: { add() {}, remove() {}, toggle() {} }, querySelector: () => null, querySelectorAll: () => [] }; }
const els = {};
globalThis.document = { readyState: 'complete', addEventListener() {}, removeEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  documentElement: { getAttribute: () => null },
  body: { appendChild() {}, removeChild() {} },
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: () => makeEl() };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.WebSocket = { OPEN: 1 };
globalThis.directWS = false;
// Globaux du script / IIFE consommés via window.*
window._lang = 'en';
const toasts = []; window.showToast = (m) => toasts.push(m);
window._showBanner = () => {}; window._hideBanner = () => {};
window._startIpBlockCountdown = () => {};
let plRendered = 0; window.renderPlayersList = () => plRendered++;
window.getPlayerName = (pid) => 'J' + pid;
window._defaultNameForMode = () => 'Table de Moi';
window._tableHasPid = () => false;
let wpRendered = 0; window.renderWaitingPanel = () => wpRendered++;
window._isIgnored = () => false; window._chatTs = () => '[00:00:00]';
window.isBot = () => false; window._pthAvatarFor = () => null;
window._offlineMode = false;
globalThis.App = { _resetGameState() {}, openCreatePage() {} };

const { S } = await import('../public/modules/game/state.mjs');
const { Proto } = await import('../public/modules/net/proto.mjs');
const { MSG } = await import('../public/modules/net/messages.mjs');
const M = await import('../public/modules/net/msg-lobby.mjs');
const T = MSG.T;

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function subOf(inner) { return Proto.decode(Proto.encode(inner)); }
function str(sv) { return new TextEncoder().encode(sv); }

S.myName = 'Moi'; S.players = {}; S.games = {}; S._openTables = new Set();
S._lobbyPids = new Set(); S._lobbyPlayerCount = 0;
S._playerCountries = {}; S._playerRights = {}; S._selectedGame = null;
S._pendingNameRequests = new Set(); S._pthAvatarHashes = {}; S._pthAvatarsByHash = {};
S._pthDataUrls = {}; S._pthCountry = {}; S._pthRights = {}; S._pendingRejoin = 0;

// ── onAnnounce : serveur LAN → buildInit envoyé avec la bonne version
const sent = [];
S.ws = { readyState: 1, send: (f) => sent.push(new Uint8Array(f).slice(4)), close() {} };
for (const id of ['login-mode', 'user-pass', 'pass', 'server-pass', 'cf-name']) document.getElementById(id);
els['login-mode'].value = 'lan';
let sub = subOf([[1, 2, Proto.encode([[1, 0, 5], [2, 0, 1]])],
                 [2, 2, Proto.encode([[1, 0, 2], [2, 0, 1]])],
                 [4, 0, 0], [5, 0, 3]]);
M.onAnnounce(sub);
ok(sent.length === 1 && MSG.parse(sent[0]).type === T.Init,
   'onAnnounce (LAN) : InitMessage envoyé');
ok(S.lastMajor === 5 && S.lastMinor === 1 && S.lastLoginType === 0,
   'onAnnounce : version protocole + loginType LAN mémorisés');

// Serveur auth-only + mode LAN (sans mot de passe) → erreur fatale, fermeture
let closed = 0;
S.ws = { readyState: 1, send: () => {}, close: () => closed++ };
els['login-mode'].value = 'lan';
sub = subOf([[1, 2, Proto.encode([[1, 0, 5], [2, 0, 1]])],
             [2, 2, Proto.encode([[1, 0, 2], [2, 0, 1]])],
             [4, 0, 2], [5, 0, 0]]);
M.onAnnounce(sub);
ok(closed === 1 && S._intentionalDisconnect === true,
   'onAnnounce : serveur auth-only en invité → déconnexion volontaire');

// ── onInitAck : identité + demande de notre PlayerInfo + écran lobby
const sent2 = [];
S.ws = { readyState: 1, send: (f) => sent2.push(new Uint8Array(f).slice(4)), close() {} };
S._pendingRejoin = 0; store['pth_resume'] = null;
S.screens = S.screens || {};
sub = subOf([[1, 0, 1], [2, 0, 42]]);
M.onInitAck(sub);
ok(S.myId === 42, 'onInitAck : myId appris (42)');
ok(sent2.some((b) => MSG.parse(b).type === T.PlayerInfoRequest),
   'onInitAck : PlayerInfoRequest pour notre propre avatar');
ok(S._pendingNameRequests.has(42), 'onInitAck : notre pid en attente de nom');

// Rejoin en attente : RejoinGame envoyé au lieu du lobby
sent2.length = 0;
S._pendingRejoin = 17;
M.onInitAck(subOf([[1, 0, 1], [2, 0, 42]]));
const rj = MSG.parse(MSG.buildRejoinGame(17)).type;
ok(sent2.some((b) => MSG.parse(b).type === rj),
   'onInitAck : _pendingRejoin → RejoinExistingGame (sortie anticipée break→return)');
S._pendingRejoin = 0;

// ── onPlayerList : ajout et retrait
sub = subOf([[1, 0, 9], [2, 0, 0]]); // pid 9, notification=ADD(0)
S._lobbyPids = new Set(); S._lobbyPlayerCount = 0;
M.onPlayerList(sub);
ok(S._lobbyPids.has(9) && S._lobbyPlayerCount === 1, 'onPlayerList : joueur 9 compté au lobby');
sub = subOf([[1, 0, 9], [2, 0, 1]]); // REMOVE
M.onPlayerList(sub);
ok(!S._lobbyPids.has(9), 'onPlayerList : joueur 9 retiré');

// ── onPlayerInfoReply : nom + drapeau + hash avatar pokerth.net
S._pendingNameRequests.add(9);
plRendered = 0;
sub = subOf([[1, 0, 9], [2, 2, Proto.encode([
  [1, 2, str('Bob')], [3, 0, 0], [4, 2, str('FR')],
  [5, 2, Proto.encode([[1, 0, 1], [2, 2, new Uint8Array([0xaa, 0xbb])]])]])]]);
M.onPlayerInfoReply(sub);
ok(S.players[9] === 'Bob', 'onPlayerInfoReply : nom appris');
ok(S._playerCountries[9] === 'FR', 'onPlayerInfoReply : code pays FR');
ok(S._pthAvatarHashes[9] && S._pthAvatarHashes[9].hashHex === 'aabb',
   'onPlayerInfoReply : hash avatar enregistré (aabb)');

// ── onGameListNew : table ouverte enregistrée + rendu lobby
S.games = {};
sub = subOf([[1, 0, 12], [2, 0, 1], [3, 0, 0],
  [6, 2, Proto.encode([[1, 2, str('Ma table')], [2, 0, 1], [3, 0, 6]])]]);
M.onGameListNew(sub);
ok(S.games[12] && S.games[12].name === 'Ma table', 'onGameListNew : table 12 enregistrée');

// onGameListPlayerJoined / Left : compte des sièges
sub = subOf([[1, 0, 12], [2, 0, 9]]);
M.onGameListPlayerJoined(sub);
ok((S.games[12].seats || []).includes(9), 'onGameListPlayerJoined : pid 9 assis à la table 12');
M.onGameListPlayerLeft(sub);
ok(!(S.games[12].seats || []).includes(9), 'onGameListPlayerLeft : pid 9 retiré');

// ── onError : code affiché + bannière masquée
S._intentionalDisconnect = false;
sub = subOf([[1, 0, 3]]);
M.onError(sub);
ok(true, 'onError : traité sans exception');

// ── onReportGameAck : toast selon le code
toasts.length = 0;
sub = subOf([[1, 0, 12], [2, 0, 0]]);
M.onReportGameAck(sub);
ok(toasts.length === 1, 'onReportGameAck : toast affiché');

// Ponts window
ok(window.onAnnounce === M.onAnnounce && window.onInitAck === M.onInitAck &&
   window.onPlayerInfoReply === M.onPlayerInfoReply && window.onGameListNew === M.onGameListNew,
   'ponts window.* en place');

console.log(fail ? `\n${fail}/${n} ÉCHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
