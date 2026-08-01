#!/usr/bin/env node
// Deterministic tests for public/modules/net/msg-game-join.mjs (ESM #9g-C4).
// Run: node scripts/test-msg-game-join.mjs
globalThis.window = globalThis;
const store = {};
globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null),
  setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  value: '', appendChild(c) { this.children.push(c); }, remove() {}, addEventListener() {},
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  querySelector: () => null, querySelectorAll: () => [] }; }
const els = {};
globalThis.document = { readyState: 'complete', addEventListener() {}, removeEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  documentElement: { getAttribute: () => null },
  body: { appendChild() {}, removeChild() {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false } },
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: () => makeEl() };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.WebSocket = { OPEN: 1 };
globalThis.directWS = false;
window._offlineMode = false;
window._lang = 'en';
// Fonctions pontées consommées par les handlers
let wp = 0; window.renderWaitingPanel = () => wp++;
let strip = 0; window.updateSpectatorStrip = () => strip++;
let potSet = null; window.setPot = (v) => { potSet = v; };
window.clearSpectatorActions = () => {};
window._rebroadcastAvatar = () => {};
let seatsR = 0; window.renderSeats = () => seatsR++;
window._hideBanner = () => {};
window._applyReactMuteUI = () => {};
window.animateTableEnter = () => {};
let dingJoin = 0; window.notifyPlayerConnected = () => dingJoin++;
let dingReady = 0; window.notifyGameReady = () => dingReady++;
window.getPlayerName = (pid) => 'J' + pid;
window._isIgnored = () => false; window._chatTs = () => '[00:00:00]';
window.isBot = () => false; window._pthAvatarFor = () => null;
window.setUrgentMode = () => {};
globalThis.App = { _resetGameState() {} };

const { S } = await import('../public/modules/game/state.mjs');
const { Proto } = await import('../public/modules/net/proto.mjs');
const { MSG } = await import('../public/modules/net/messages.mjs');
const M = await import('../public/modules/net/msg-game-join.mjs');
const T = MSG.T;

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function subOf(inner) { return Proto.decode(Proto.encode(inner)); }

S.myId = 5; S.myName = 'Moi'; S.players = { 5: 'Moi', 9: 'Bob' };
S.games = { 12: { name: 'Ma table', timeout: 20, startMoney: 3000, seats: [] } };
S.seats = []; S.seatData = {}; S._specPids = new Set();
S.ws = { readyState: 1, send() {}, close() {} };
S.screens = S.screens || {};

// ── onJoinGameAck : entrée à la table 12 en tant qu'admin
S._pendingRejoin = 17; S._amSpectator = false;
let sub = subOf([[1, 0, 12], [2, 0, 1]]);
M.onJoinGameAck(sub);
ok(S.gId === 12, 'onJoinGameAck : gId appris (12)');
ok(S._pendingRejoin === 0, 'onJoinGameAck : rejoin en attente nettoyé');
ok(S.amGameAdmin === true, 'onJoinGameAck : admin appris');
ok(S.gameTimeout === 20 && S.gameStartMoney === 3000,
   'onJoinGameAck : timeout + stack repris de games[12]');
const resume = JSON.parse(store['pth_resume']);
ok(resume && resume.g === 12 && resume.n === 'Moi', 'onJoinGameAck : marqueur pth_resume écrit');
ok(S._specPids.size === 0, 'onJoinGameAck : set de spectateurs réinitialisé');

// En entraînement : pas de marqueur de reprise
window._offlineMode = true;
delete store['pth_resume'];
M.onJoinGameAck(subOf([[1, 0, 12], [2, 0, 0]]));
ok(!('pth_resume' in store) || store['pth_resume'] === null,
   'onJoinGameAck (offline) : aucun marqueur pth_resume');
window._offlineMode = false;

// ── onGamePlayerJoined : siège occupé + son + re-rendus
S.gId = 12; S._gameStarted = false; S.seats = []; S.seatData = {};
wp = 0; seatsR = 0; dingJoin = 0;
sub = subOf([[1, 0, 12], [2, 0, 9]]);
M.onGamePlayerJoined(sub);
ok(S.seatData[9] && !S.seatData[9].gone, 'onGamePlayerJoined : seatData initialisé');
// Arrivée tardive pendant une partie démarrée : réservée au mode SPECTATEUR
// (bootstrap). Côté joueur, un pid inconnu en cours de partie est toujours la
// nouvelle session d'un revenant — il ne doit PAS créer de chaise.
S._gameStarted = true; S._amSpectator = true;
M.onGamePlayerJoined(subOf([[1, 0, 12], [2, 0, 11]]));
ok(S.seats.includes(11), 'onGamePlayerJoined (spectateur) : arrivée tardive ajoutée aux sièges');
S._amSpectator = false;
M.onGamePlayerJoined(subOf([[1, 0, 12], [2, 0, 13]]));
ok(!S.seats.includes(13), 'onGamePlayerJoined (joueur) : un pid inconnu en cours de partie ne crée pas de chaise');
S._gameStarted = false;
ok(wp >= 1, 'onGamePlayerJoined : panneau d\'attente re-rendu');
ok(dingJoin >= 1, 'onGamePlayerJoined : son playerconnected');

// ── onGamePlayerLeft : marqué parti
wp = 0;
sub = subOf([[1, 0, 12], [2, 0, 9]]);
M.onGamePlayerLeft(sub);
ok(S.seatData[9] && S.seatData[9].gone === true, 'onGamePlayerLeft : pid 9 marqué gone');
ok(wp >= 1, 'onGamePlayerLeft : panneau d\'attente re-rendu');

// ── onGameSpectatorJoined / Left : strip + set
strip = 0; S._specPids = new Set();
sub = subOf([[1, 0, 12], [2, 0, 77]]);
M.onGameSpectatorJoined(sub);
ok(S._specPids.has(77), 'onGameSpectatorJoined : spectateur 77 enregistré');
ok(strip >= 1, 'onGameSpectatorJoined : strip mise à jour');
M.onGameSpectatorLeft(sub);
ok(!S._specPids.has(77), 'onGameSpectatorLeft : spectateur 77 retiré');

// ── onStartEvent : ack renvoyé + son « partie prête »
const sent = [];
S.ws.send = (f) => sent.push(new Uint8Array(f).slice(4));
dingReady = 0;
sub = subOf([[1, 0, 12], [2, 0, 0]]);
M.onStartEvent(sub);
ok(sent.some((b) => MSG.parse(b).type === T.StartEventAck), 'onStartEvent : StartEventAck renvoyé');
ok(dingReady >= 1, 'onStartEvent : son onlinegameready');

// ── onGameAdminChanged : je deviens admin
S.amGameAdmin = false;
sub = subOf([[1, 0, 12], [2, 0, 5]]);
M.onGameAdminChanged(sub);
ok(S.amGameAdmin === true, 'onGameAdminChanged : je suis le nouvel admin');

// ── onJoinGameFailed : retour lobby + statut
S._pendingRejoin = 12;
sub = subOf([[1, 0, 12], [2, 0, 2]]);
M.onJoinGameFailed(sub);
ok(S._pendingRejoin === 0, 'onJoinGameFailed : rejoin abandonné');

// ── Rejoin en cours de partie (rapport forum : « Hondo » en double, deux
// pucks SB/BB/D). Flux serveur réel (servergamestate.cpp) : AcceptNewSession
// envoie GamePlayerJoined(nouveauPid) pendant que l'ancien pid occupe encore
// la chaise, puis PlayerIdChanged(ancien→nouveau) au début de la main
// suivante. Quel que soit l'ordre, il ne doit rester qu'UNE chaise.
S._gameStarted = true; S._amSpectator = false;
S.seats = [1, 2, 3];
S.seatData = { 1: { money: 500 }, 2: { money: 17150 }, 3: { money: 300 } };
S.players = { 1: 'A', 2: 'Hondo', 3: 'C' };
S.dealerPid = 2;
// 1. Côté JOUEUR : l'annonce de la nouvelle session ne crée pas de chaise…
M.onGamePlayerJoined(subOf([[1, 0, 12], [2, 0, 9]]));
ok(!S.seats.includes(9) && S.seats.length === 3,
   'rejoin (joueur) : le nouveau pid du revenant ne crée pas de chaise');
// …et PlayerIdChanged renomme la chaise d'origine, stack et donneur compris.
M.onPlayerIdChanged(subOf([[1, 0, 2], [2, 0, 9]]));
ok(S.seats.join(',') === '1,9,3',
   'rejoin (joueur) : PlayerIdChanged renomme la chaise d\'origine, à sa place');
ok(S.seatData[9] && S.seatData[9].money === 17150 && !S.seatData[2],
   'rejoin (joueur) : le stack suit le nouveau pid, l\'ancien est purgé');
ok(S.dealerPid === 9, 'rejoin (joueur) : le bouton donneur suit');
// 2. Côté SPECTATEUR : l'append bootstrap ajoute bien une chaise temporaire…
S._amSpectator = true;
M.onGamePlayerJoined(subOf([[1, 0, 12], [2, 0, 14]]));
ok(S.seats.includes(14) && S.seats.length === 4,
   'rejoin (spectateur) : append bootstrap conservé (chaise temporaire)');
// …que PlayerIdChanged retire au profit de la chaise d'origine — jamais deux.
M.onPlayerIdChanged(subOf([[1, 0, 9], [2, 0, 14]]));
ok(S.seats.join(',') === '1,14,3',
   'rejoin (spectateur) : la chaise ajoutée est retirée, l\'originale renommée');
ok(S.seats.filter((p) => p === 14).length === 1,
   'rejoin : le même pid n\'est jamais assis deux fois');
S._gameStarted = false; S._amSpectator = false;

// Ponts window
ok(window.onJoinGameAck === M.onJoinGameAck && window.onGamePlayerJoined === M.onGamePlayerJoined &&
   window.onStartEvent === M.onStartEvent, 'ponts window.* en place');

console.log(fail ? `\n${fail}/${n} ÉCHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
