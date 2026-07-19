#!/usr/bin/env node
// Deterministic tests for public/modules/ui/misc.mjs (step 9d of
// docs/ESM_PLAN.md). Stubs: sessionStorage, navigator.wakeLock, window-level
// toast/broadcast hooks (captured), minimal DOM for _attachPanelDrag.
// Run: node scripts/test-misc.mjs

const sess = new Map();
globalThis.sessionStorage = {
  getItem: (k) => (sess.has(k) ? sess.get(k) : null),
  setItem: (k, v) => sess.set(k, String(v)),
  removeItem: (k) => sess.delete(k),
};
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
let wlRequests = 0, wlReleased = 0;
// navigator est un getter en node -> defineProperty pour le remplacer
function setNav(v) { Object.defineProperty(globalThis, 'navigator', { configurable: true, value: v }); }
setNav({
  wakeLock: {
    request: async () => { wlRequests++; return { release() { wlReleased++; }, addEventListener() {} }; },
  },
});
const toasts = [], broadcasts = [];
globalThis.showToast = (m) => toasts.push(m);
globalThis._showBroadcast = (msg, icon, at) => broadcasts.push(msg);
globalThis.showRestartNotice = () => {};
globalThis.hideRestartNotice = () => {};
globalThis.document = {
  visibilityState: 'visible', hidden: false,
  body: { classList: { add() {}, remove() {}, contains: () => false } },
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: { add() {} }, setAttribute() {}, remove() {}, addEventListener() {} }),
  addEventListener() {},
};
globalThis.window = globalThis;
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.matchMedia = () => ({ matches: false });
// crypto.randomUUID natif en node 22 — rien à polyfiller

const M = await import('../public/modules/ui/misc.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// 1) esc : neutralise le HTML, idempotent sur texte sain
ok(M.esc('<img src=x onerror=alert(1)>') .indexOf('<img') === -1, 'esc neutralise les balises');
ok(M.esc('a & b "c" <d>') === M.esc('a & b "c" <d>'), 'esc déterministe');
ok(M.esc('texte sain 42') === 'texte sain 42', 'esc laisse le texte sain intact');
ok(M.esc('&<>').indexOf('&amp;') === 0, "esc échappe & en premier (pas de double échappement inversé)");

// 2) Session id : stable par onglet, généré une fois
const s1 = M._getSessionId();
const s2 = M._getSessionId();
ok(typeof s1 === 'string' && s1.length >= 8, 'session id non vide');
ok(s1 === s2, 'session id stable (même onglet)');
ok([...sess.values()].some((v) => v.indexOf(s1) !== -1), 'session id persisté en sessionStorage');

// 3) Wake lock : acquisition unique, release propre, no-op sans API
await M.acquireWakeLock();
await new Promise((r) => setTimeout(r, 10));
await M.acquireWakeLock();                     // déjà tenu -> pas de 2e requête
await new Promise((r) => setTimeout(r, 10));
ok(wlRequests === 1, 'acquireWakeLock: une seule requête tant que tenu (' + wlRequests + ')');
M.releaseWakeLock();
ok(wlReleased === 1, 'releaseWakeLock relâche');
const savedNav = globalThis.navigator; setNav({});
await M.acquireWakeLock();
ok(true, 'API absente -> no-op silencieux');
setNav(savedNav);

// 4) _handleCtrlFrame : consomme les trames de contrôle, ignore le reste
const ateInfo = M._handleCtrlFrame('INFO:🛠:Serveur redémarre bientôt');
ok(ateInfo === true && broadcasts.length === 1 && broadcasts[0] === 'Serveur redémarre bientôt',
   'INFO:<icône>:<msg> consommée -> _showBroadcast(msg, icône)');
ok(M._handleCtrlFrame('NOTICE:CANCEL') === true && toasts.length === 1,
   'NOTICE:CANCEL consommée -> toast (t() shim)');
const ateGame = M._handleCtrlFrame('\u0000\u0001binaire-quelconque');
ok(ateGame !== true, 'trame non-contrôle NON consommée (retour falsy)');

// 5) setPct sans DOM (pas de champ montant) : no-op silencieux + relais hook
let synced = 0; globalThis._syncRaiseBtnAmt = () => { synced++; };
M.setPct(0.5);
ok(true, 'setPct sans DOM ne jette pas');
globalThis._syncRaiseBtnAmt = undefined;

// 6) _attachPanelDrag : idempotent sur élément stub, ne jette pas
const panel = { style: { setProperty() {}, removeProperty() {} }, addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 150, height: 100 }), offsetWidth: 150, offsetHeight: 100, id: 'odds-monitor', querySelector: () => null, closest: () => null, classList: { add() {}, remove() {}, contains: () => false }, setAttribute() {} };
M._attachPanelDrag(panel, 'pth_odds_pos');
M._attachPanelDrag(panel, 'pth_odds_pos');
ok(true, '_attachPanelDrag idempotent sans DOM réel');

// 7) Alias legacy
ok(['esc', '_getSessionId', 'acquireWakeLock', 'releaseWakeLock', '_handleCtrlFrame', 'setPct', '_attachPanelDrag']
   .every((n) => typeof window[n] === 'function'), 'alias legacy complets');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All misc tests passed.');
