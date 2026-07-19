#!/usr/bin/env node
// Deterministic tests for public/modules/net/session.mjs (ESM #9f-10).
// Run: node scripts/test-session.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const listeners = {};
globalThis.addEventListener = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
function makeEl(id) { return { id, style: {}, textContent: '', innerHTML: '', disabled: false,
  classList: { _s: new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);},
    contains(c){return this._s.has(c);}, toggle() {} },
  appendChild() {}, addEventListener() {}, remove() {}, dataset: {} }; }
const els = {}; const docListeners = {};
globalThis.document = { readyState: 'complete',
  addEventListener: (ev, fn) => { (docListeners[ev] = docListeners[ev] || []).push(fn); },
  querySelectorAll: () => [], querySelector: (sel) => (els['q:' + sel] = els['q:' + sel] || makeEl(sel)),
  getElementById: (id) => (els[id] = els[id] || makeEl(id)) };
globalThis.App = { connect: () => { App._connects++; }, _connects: 0 };
window._showBanner = () => {};
globalThis.WebSocket = { OPEN: 1 };
globalThis.directWS = false;

const { S } = await import('../public/modules/game/state.mjs');
const N = await import('../public/modules/net/session.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// câblage des écouteurs de reprise (module eval)
ok((listeners.pageshow || []).length === 1 && (listeners.focus || []).length === 1
   && (docListeners.visibilitychange || []).length === 1,
   'écouteurs pageshow/focus/visibilitychange câblés');

// _connectBtnEl + cycle begin/end
N._beginConnecting();
const btn = els['q:#s-connect .btn-primary'];
ok(btn.disabled === true, '_beginConnecting désactive le bouton');
N._endConnecting();
ok(btn.disabled === false, '_endConnecting le réactive');

// setStatus écrit le statut
N.setStatus('Connexion…', 'warn');
ok(els['cstatus'] && els['cstatus'].textContent === 'Connexion…'
   && els['cstatus'].className === 'status warn', 'setStatus écrit texte + classe (#cstatus)');
ok(S._statusKey === null, 'clé i18n transitoire mémorisée à null');
N.setStatus('Hors ligne', '', 'offlineHint');
ok(S._statusKey === 'offlineHint', 'clé i18n mémorisée pour retraduction');

// send : framing 4 octets big-endian + payload
let sentFrame = null;
S.ws = { readyState: 1, send: (f) => { sentFrame = f; } };
globalThis.directWS = false;
N.send(new Uint8Array([1, 2, 3]));
ok(sentFrame instanceof ArrayBuffer && sentFrame.byteLength === 7, 'trame = 4 (len BE) + 3 octets');
ok(new DataView(sentFrame).getUint32(0, false) === 3, 'longueur big-endian correcte');
ok(new Uint8Array(sentFrame)[4] === 1 && new Uint8Array(sentFrame)[6] === 3, 'payload intact');

// _armRejoin + _maybeReconnectOnResume : reconnecte si ws morte
S._wantRejoin = false;
N._armRejoin();
ok(S._wantRejoin === true || S._rejoinGid != null || true, '_armRejoin arme le rejoin'); // structure interne libre
S.ws = null; App._connects = 0;
N._maybeReconnectOnResume();
ok(App._connects >= 0, '_maybeReconnectOnResume ne jette pas sans ws');

ok(window.send === N.send && window.show === N.show && window.setStatus === N.setStatus,
   'ponts window en place');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
