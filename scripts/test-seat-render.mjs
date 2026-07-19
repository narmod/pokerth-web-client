#!/usr/bin/env node
// Deterministic tests for public/modules/game/seat-render.mjs (ESM #9g-C6).
// Run: node scripts/test-seat-render.mjs
globalThis.window = globalThis;
const store = {};
globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null),
  setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
function makeEl(tag) {
  const el = { tagName: (tag || 'div').toUpperCase(), style: {}, children: [], attrs: {},
    textContent: '', _html: '', value: '', dataset: {}, offsetWidth: 100, offsetHeight: 40,
    clientWidth: 800, clientHeight: 600,
    appendChild(c) { this.children.push(c); return c; }, removeChild() {}, remove() {},
    addEventListener() {}, removeEventListener() {},
    setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k] ?? null; },
    classList: { _s: new Set(), add(...c) { c.forEach((x) => this._s.add(x)); },
      remove(...c) { c.forEach((x) => this._s.delete(x)); },
      toggle(c, f) { (f ?? !this._s.has(c)) ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); } },
    querySelector: () => null, querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 40, right: 100, bottom: 40 }) };
  Object.defineProperty(el, 'innerHTML', { get() { return this._html; },
    set(v) { this._html = v; this.children = []; } });
  return el;
}
const els = {};
const feltOval = null; // rempli après makeEl
globalThis.document = { readyState: 'complete', addEventListener() {}, removeEventListener() {},
  querySelectorAll: () => [],
  querySelector: (sel) => (sel === '.felt-oval' ? (els['__felt'] = els['__felt'] || makeEl()) : null),
  documentElement: { getAttribute: () => null, style: { setProperty() {} } },
  body: { appendChild() {}, classList: { add() {}, remove() {}, contains: () => false } },
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: (t) => makeEl(t) };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.requestAnimationFrame = (fn) => { rafQueue.push(fn); return rafQueue.length; };
const rafQueue = [];
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
globalThis.WebSocket = { OPEN: 1 };
window._offlineMode = false; window._lang = 'en';
window.innerWidth = 1024; window.innerHeight = 768;
// Globaux consommés
window._sdWinners = new Set(); window._sdLosers = new Set();
window._advGet = () => true;
window._getTableZoom = () => 1; window._tableZoomGate = () => 1;
window._seatTraitsNow = () => ({});
window.getAvatarColor = () => '#446688';
window._isIgnored = () => false;
window.pkTerm = (b) => b;
window._timerSvg = () => '<svg class="tsvg"></svg>';
window._pthPuck = (k) => '<svg class="puck-' + k + '"></svg>';
window._deckCardUrl = null; window._pthPuckUrls = null;

const { S } = await import('../public/modules/game/state.mjs');
const M = await import('../public/modules/game/seat-render.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

S.myId = 5; S.myName = 'Moi';
S.players = { 5: 'Moi', 9: 'Bob', 11: 'computer3', 13: 'Zoé' };

// ── getPlayerName / isBot / getPlayerInitial / getPlayerTypeBadge
ok(M.getPlayerName(9) === 'Bob', 'getPlayerName : nom connu');
ok(M.getPlayerName(77) === '#77', 'getPlayerName : inconnu → #pid');
ok(M.isBot(11) === true && M.isBot(9) === false, 'isBot : préfixe computer détecté');
store['pth_avatar'] = '__pth__'; S._myAvatarCache = '';
const init = M.getPlayerInitial(5);
ok(init !== '__pth__' && !String(init).includes('__pth__'),
   'getPlayerInitial : la sentinelle __pth__ ne fuit jamais');
ok(typeof M.getPlayerTypeBadge(11) === 'string', 'getPlayerTypeBadge : renvoie du HTML');

// ── renderSeatsImmediate : rendu de base, rotation vue-joueur
S.gId = 12; S.seats = [9, 5, 11, 13];
S.seatData = { 5: { money: 3000, bet: 0 }, 9: { money: 2500, bet: 50 },
  11: { money: 1000, bet: 0, folded: true }, 13: { money: 4000, bet: 100 } };
S.dealerPid = 9; S.turnPid = 13; S.commCards = [null, null, null, null, null];
S._gameStarted = true; S._amSpectator = false; S.smallBlind = 50;
document.getElementById('g-seats'); // le conteneur cible réel
let threw = null;
try { M.renderSeatsImmediate(); } catch (e) { threw = e; }
ok(!threw, 'renderSeatsImmediate : rendu 4 sièges sans exception' + (threw ? ' — ' + threw.message : ''));
ok((els['g-seats'].innerHTML || '').length > 0 || els['g-seats'].children.length > 0,
   'renderSeatsImmediate : #g-seats rempli');
ok((els['g-seats'].innerHTML || '').includes('Bob'),
   'renderSeatsImmediate : le siège de Bob est rendu');

// ── renderSeats : débounce rAF — N appels, 1 rendu
rafQueue.length = 0; S._seatsRenderPending = false;
M.renderSeats(); M.renderSeats(); M.renderSeats();
ok(rafQueue.length === 1, 'renderSeats : 3 appels → 1 seul rAF planifié');
threw = null;
try { rafQueue[0](); } catch (e) { threw = e; }
ok(!threw && S._seatsRenderPending === false,
   'renderSeats : le tick rAF rend et libère le verrou');

// ── Estompage perdants / surbrillance gagnants consommés sans crash
window._sdLosers.add(11); window._sdWinners.add(13);
threw = null;
try { M.renderSeatsImmediate(); } catch (e) { threw = e; }
ok(!threw, 'renderSeatsImmediate : _sdLosers/_sdWinners consommés sans exception');

// ── Spectateur : rendu sans mon siège dans seats[]
S._amSpectator = true; S.seats = [9, 11, 13];
threw = null;
try { M.renderSeatsImmediate(); } catch (e) { threw = e; }
ok(!threw, 'renderSeatsImmediate : mode spectateur sans exception');
S._amSpectator = false;

// Ponts window
ok(window.renderSeatsImmediate === M.renderSeatsImmediate && window.renderSeats === M.renderSeats &&
   window.getPlayerName === M.getPlayerName && window.isBot === M.isBot,
   'ponts window.* en place');

console.log(fail ? `\n${fail}/${n} ÉCHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
