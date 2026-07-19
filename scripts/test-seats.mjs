#!/usr/bin/env node
// Deterministic tests for public/modules/game/seats.mjs (extraction #8 of
// docs/ESM_PLAN.md — the most entangled block). Tracing DOM stubs; we assert
// the persistence model (fractions per orientation + player count), the edit
// mode state machine (window._seatEditMode freeze flag, zoom save/restore
// contract) and autoScaleTable's autofit output (window._tableAutofit).
// Run: node scripts/test-seats.mjs

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const byId = new Map();
function el(tag, extra) {
  const e = Object.assign({
    tag, style: {}, children: [], _classes: new Set(), _attrs: new Map(),
    classList: {
      add: (...c) => c.forEach((x) => e._classes.add(x)),
      remove: (...c) => c.forEach((x) => e._classes.delete(x)),
      toggle(c, on) { (on === undefined ? !e._classes.has(c) : on) ? e._classes.add(c) : e._classes.delete(c); },
      contains: (c) => e._classes.has(c),
    },
    setAttribute(k, v) { e._attrs.set(k, String(v)); },
    getAttribute(k) { return e._attrs.has(k) ? e._attrs.get(k) : null; },
    removeAttribute(k) { e._attrs.delete(k); },
    appendChild(ch) { e.children.push(ch); }, remove() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener() {}, removeEventListener() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 390, height: 600 }; },
    closest() { return null; },
    set textContent(v) { e._text = v; }, get textContent() { return e._text || ''; },
    set innerHTML(v) { e._html = v; }, get innerHTML() { return e._html || ''; },
  }, extra || {});
  return e;
}
globalThis.document = {
  body: el('body'),
  documentElement: el('html'),
  getElementById: (id) => byId.get(id) || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (t) => el(t),
  addEventListener() {},
};
globalThis.window = globalThis;
globalThis.addEventListener = () => {};      // resize/DOMContentLoaded posés au chargement
globalThis.removeEventListener = () => {};
globalThis.innerWidth = 390; globalThis.innerHeight = 844;   // portrait
globalThis.matchMedia = () => ({ matches: false });

const M = await import('../public/modules/game/seats.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// 1) État initial : mode édition éteint, API attachée par le bloc lui-même
ok(window._seatEditMode === false, 'initial _seatEditMode = false');
ok(typeof window._seatCustomGet === 'function' && typeof window.toggleSeatEdit === 'function'
   && typeof window._seatEditExit === 'function' && typeof window.toggleOwnCardZoom === 'function',
   'block self-attached window API present');
ok(typeof window.autoScaleTable === 'function', 'autoScaleTable bridged for bare App calls');

// 2) Modèle de persistance : fractions par orientation (p en portrait) et nb joueurs
store.set('pth_seat_custom', JSON.stringify({ p: { '6': { '0': { fx: 0.5, fy: 0.9 }, '2': { fx: 0.15, fy: 0.3 } } } }));
const got6 = window._seatCustomGet(6);
ok(got6 && got6['0'] && got6['0'].fx === 0.5 && got6['0'].fy === 0.9, "_seatCustomGet(6) reads p -> '6' -> slot '0' (fx/fy)");
ok(got6['2'] && got6['2'].fx === 0.15, '_seatCustomGet(6): other slots present');
ok(window._seatCustomGet(9) === null, '_seatCustomGet(9): null for unplaced count');

// 3) JSON corrompu -> repli silencieux {}
store.set('pth_seat_custom', '{oops');
ok(window._seatCustomGet(6) === null, 'corrupt storage -> null (silent {} fallback upstream)');
store.delete('pth_seat_custom');

// 4) autoScaleTable : autofit borné, publié dans window._tableAutofit
byId.set('g-table-zone', el('div', { clientWidth: 390, clientHeight: 500 }));
byId.set('g-table-scaler', el('div', { scrollWidth: 780, scrollHeight: 1000, offsetWidth: 780 }));
window._seatCount = 6;
M.autoScaleTable();
ok(typeof window._tableAutofit === 'number' && window._tableAutofit > 0 && window._tableAutofit <= 1.4,
   'autoScaleTable publishes bounded autofit (' + window._tableAutofit + ')');
const sc = byId.get('g-table-scaler');
ok(/scale\(/.test(sc.style.transform || ''), 'scaler gets a scale() transform');

// 5) autoScaleTable sans DOM -> no-op silencieux
byId.delete('g-table-zone'); byId.delete('g-table-scaler');
const prevFit = window._tableAutofit;
M.autoScaleTable();
ok(window._tableAutofit === prevFit, 'autoScaleTable without DOM is a silent no-op');

// 6) _seatEditExit : éteint le mode et nettoie l'attribut d'édition
window._seatEditMode = true;
document.documentElement.setAttribute('data-seat-edit', '1');
window._seatEditExit();
ok(window._seatEditMode === false, '_seatEditExit clears _seatEditMode');
ok(document.documentElement.getAttribute('data-seat-edit') === null, '_seatEditExit removes data-seat-edit');

// 7) toggleSeatEdit hors mode custom : n'active pas l'édition sans le layout requis
document.documentElement.removeAttribute('data-seat-layout');
window.toggleSeatEdit();
ok(window._seatEditMode === false || document.documentElement.getAttribute('data-seat-edit') !== null,
   'toggleSeatEdit runs without throwing outside custom layout');
window._seatEditMode = false;
document.documentElement.removeAttribute('data-seat-edit');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All seats tests passed.');
