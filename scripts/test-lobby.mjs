#!/usr/bin/env node
// Deterministic tests for public/modules/ui/lobby.mjs (ESM #9f-8).
// Run: node scripts/test-lobby.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  className: '', dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
  appendChild(c) { this.children.push(c); }, addEventListener() {}, remove() {} }; }
const els = {};
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: () => makeEl() };
let sentReqs = 0;
window.send = () => { sentReqs++; };
window.renderPlayersList = () => {};
window.isBot = () => false;
window.getPlayerName = (pid) => null;

const { S } = await import('../public/modules/game/state.mjs');
const L = await import('../public/modules/ui/lobby.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// _tableMatches : filtres numériques 0-5 (parité QML)
const gOpen = { mode: 1, players: 2, maxPlayers: 5, type: 1 };
const gFull = { mode: 1, players: 5, maxPlayers: 5, type: 1 };
const gRun  = { mode: 2, players: 4, maxPlayers: 5, type: 1 };
const gPriv = { mode: 1, players: 1, maxPlayers: 5, type: 3 };
ok(L._tableMatches(gRun, 0) && L._tableMatches(gOpen, 0), 'filtre 0 (aucun) accepte tout');
ok(L._tableMatches(gOpen, 1) && !L._tableMatches(gRun, 1), 'filtre 1 : ouvertes seulement');
ok(!L._tableMatches(gFull, 2) && L._tableMatches(gOpen, 2), 'filtre 2 : + non complètes');
ok(!L._tableMatches(gPriv, 3) && L._tableMatches(gPriv, 4), 'filtres 3/4 : privées exclues/seules');

// _gamePresentPids : seatData vivant + moi si absent
S.myId = 3; S._amSpectator = false;
S.seatData = { 5: { money: 100 }, 9: { money: 0, gone: true } };
const pids = L._gamePresentPids();
ok(pids.indexOf(5) >= 0 && pids.indexOf(9) < 0 && pids.indexOf(3) >= 0,
   '_gamePresentPids : seatData sans les partis + moi inclus');

// renderTablePlayers : demande les pseudos inconnus (dédupliqué)
S.gId = 8; S.games = { 8: { seats: [3, 5], mode: 1, players: 2 } };
S.players = { 3: 'Ana' }; S._pendingNameRequests = new Set(); S._playerCountries = {};
S._pthAvatarHashes = {}; S._pthDataUrls = {}; S.myId = 3; S.myName = 'Ana';
const html = L.renderTablePlayers(8);
ok(html.includes('Ana') && html.includes('#5'), 'renderTablePlayers rend pseudo + placeholder');
ok(S._pendingNameRequests.has(5) && !S._pendingNameRequests.has(3),
   'pseudo inconnu marqué pending, connu non redemandé');
ok(sentReqs === 1, 'fix 0.3.845 : la PlayerInfoRequest part réellement (MSG.T)');

// _guestJoinBlocked : invité bloqué sur registered-only
S._currentLoginMode = 'guest';
ok(L._guestJoinBlocked({ type: 2 }) === true, 'invité bloqué sur registered-only');
S._currentLoginMode = 'auth';
ok(L._guestJoinBlocked({ type: 2 }) === false, 'authentifié non bloqué');

ok(window.renderGames === L.renderGames && window.MODE_LABEL === L.MODE_LABEL
   && window._updateLobbyWaitStatus === L._updateLobbyWaitStatus, 'ponts window en place');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
