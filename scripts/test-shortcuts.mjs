#!/usr/bin/env node
// Deterministic tests for public/modules/ui/shortcuts.mjs (extraction #5 of
// docs/ESM_PLAN.md). This is a DOM module: we install minimal document /
// localStorage stubs that CAPTURE the keydown listeners, then drive them with
// synthetic events. Browser behaviour itself is covered by the manual
// checklist (play a hand, press keys) — this guards the pure logic:
// defaults, persistence, rebind flow, conflict swap, Escape cancel.
// Run: node scripts/test-shortcuts.mjs

// ── Stubs (before import: the module registers listeners at load) ──
const listeners = [];            // { fn, capture }
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.document = {
  body: { classList: { add() {}, contains() { return false; } } },
  addEventListener(type, fn, capture) { if (type === 'keydown') listeners.push({ fn, capture: !!capture }); },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  getElementById() { return null; },
  createElement() { return { style: {}, classList: { add() {} }, remove() {}, set textContent(v) {} }; },
  activeElement: null,
};
globalThis.window = globalThis;   // le module attache ses alias sur window

const M = await import('../public/modules/ui/shortcuts.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const ev = (key) => ({ key, target: {}, preventDefault() {}, stopPropagation() {} });
const rebindHandler = listeners.filter((l) => l.capture)[1] || listeners.filter((l) => l.capture)[0];

// 1) Wiring: three keydown listeners registered at load (detect, rebind, actions)
ok(listeners.length === 3, '3 keydown listeners registered at module load (' + listeners.length + ')');
ok(listeners.filter((l) => l.capture).length === 2, 'detect + rebind listeners use capture phase');

// 2) Defaults
const kb0 = window._keyBindings();
ok(kb0.fold === 'f' && kb0.call === 'c' && kb0.raise === 'r' && kb0.allin === 'a',
   'default bindings f/c/r/a');
ok(kb0.bet1 === '1' && kb0.bet2 === '2' && kb0.bet3 === '3', 'default quick-bet keys 1/2/3');

// 3) Rebind flow via the captured handler: fold -> 'x'
M.rebindKey('fold');
ok(window._rebindAction === 'fold', 'rebindKey arms _rebindAction (bridge readable)');
rebindHandler.fn(ev('x'));
ok(window._keyBindings().fold === 'x', "rebind: fold now 'x'");
ok(window._rebindAction === null, 'rebind: disarmed after assignment');
ok(JSON.parse(store.get('pth_keys')).fold === 'x', 'rebind persisted to pth_keys');

// 4) Conflict swap: assigning call -> 'x' must give fold the old 'c'
M.rebindKey('call');
rebindHandler.fn(ev('x'));
const kb1 = window._keyBindings();
ok(kb1.call === 'x' && kb1.fold === 'c', "conflict swap: call='x', fold takes back 'c'");

// 5) Escape cancels without touching bindings
M.rebindKey('raise');
rebindHandler.fn(ev('Escape'));
ok(window._rebindAction === null && window._keyBindings().raise === 'r',
   'Escape cancels rebind, raise unchanged');

// 6) Non-alphanumeric keys are ignored while armed
M.rebindKey('allin');
rebindHandler.fn(ev('F5'));
ok(window._rebindAction === 'allin', 'multi-char key ignored, still armed');
rebindHandler.fn(ev('Escape'));

// 7) resetKeys restores defaults
M.resetKeys();
const kb2 = window._keyBindings();
ok(kb2.fold === 'f' && kb2.call === 'c', 'resetKeys restores defaults');

// 8) Legacy bridges + bare-assignment path (sloppy monolith writes)
ok(typeof window.rebindKey === 'function' && typeof window.showKeyHint === 'function',
   'window.rebindKey / window.showKeyHint bridged');
window._rebindAction = 'fold';           // écriture nue du monolithe -> setter
ok(window._rebindAction === 'fold', 'defineProperty bridge: bare write reaches module state');
rebindHandler.fn(ev('Escape'));

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All shortcuts tests passed.');
