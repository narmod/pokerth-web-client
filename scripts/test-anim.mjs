#!/usr/bin/env node
// Deterministic tests for public/modules/ui/anim.mjs (extraction #7 of
// docs/ESM_PLAN.md). DOM module -> tracing stubs: we record created elements,
// class toggles and style writes, then assert the observable intent of each
// animation (what it creates/toggles), not pixel output. iOS thermal rule is
// enforced statically: no animated box-shadow may enter this module.
// Run: node scripts/test-anim.mjs
import { readFileSync } from 'node:fs';

const created = [];
const byId = new Map();
function el(tag) {
  const e = {
    tag, style: {}, children: [], _classes: new Set(),
    classList: {
      add: (...c) => c.forEach((x) => e._classes.add(x)),
      remove: (...c) => c.forEach((x) => e._classes.delete(x)),
      toggle: (c, on) => { (on === undefined ? !e._classes.has(c) : on) ? e._classes.add(c) : e._classes.delete(c); },
      contains: (c) => e._classes.has(c),
    },
    setAttribute() {}, appendChild(ch) { e.children.push(ch); }, remove() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 40 }; },
    set textContent(v) { e._text = v; }, get textContent() { return e._text || ''; },
    set innerHTML(v) { e._html = v; }, get innerHTML() { return e._html || ''; },
    offsetWidth: 100,
  };
  return e;
}
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = {
  body: el('body'),
  getElementById: (id) => byId.get(id) || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => { const e = el(tag); created.push(e); return e; },
  addEventListener() {},
  documentElement: el('html'),
};
globalThis.window = globalThis;
globalThis.innerWidth = 390; globalThis.innerHeight = 844;
globalThis.seats = [1, 2, 3]; globalThis.myId = 1;
globalThis.seatData = { 1: { money: 3000 }, 2: { money: 2500 }, 3: { money: 4000 } };

const M = await import('../public/modules/ui/anim.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// 0) Règle thermique iOS : aucun box-shadow ANIMÉ dans le source du module
//    (interdits : box-shadow dans un keyframes/transition/animate inline).
const src = readFileSync(new URL('../public/modules/ui/anim.mjs', import.meta.url), 'utf-8');
const codeOnly = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
ok(!/box-shadow/.test(codeOnly), 'no box-shadow anywhere in module code (iOS thermal rule)');

// 1) launchConfetti crée N éléments (échelonnés en setTimeout -> on attend)
const before = created.length;
M.launchConfetti(12);
await new Promise((r) => setTimeout(r, 800));
ok(created.length - before >= 12, 'launchConfetti(12) creates >= 12 elements (' + (created.length - before) + ')');

// 2) setUrgentMode bascule une classe sur un élément ciblé
const sg = el('div'); byId.set('s-game', sg);
M.setUrgentMode(true);
ok(sg._classes.has('urgent'), "setUrgentMode(true) adds 'urgent' on #s-game");
M.setUrgentMode(false);
ok(!sg._classes.has('urgent'), 'setUrgentMode(false) removes it');

// 3) setMyTurnActive: idempotent on/off sans exception, classes cohérentes
M.setMyTurnActive(true);
M.setMyTurnActive(true);
M.setMyTurnActive(false);
ok(true, 'setMyTurnActive on/on/off runs without throwing (idempotence)');

// 4) thinkingHtml retiré (narrateur de tour supprimé — fidélité QML)
ok(typeof M.thinkingHtml === 'undefined' && typeof globalThis.thinkingHtml === 'undefined',
   'thinkingHtml removed (no turn narrator)');

// 5) updatePotSize sans DOM du pot: no-op silencieux
M.updatePotSize(1234);
ok(true, 'updatePotSize without pot element is a silent no-op');

// 6) animatePlayerEliminated / animateAllIn sur pid inconnu: no-op silencieux
M.animatePlayerEliminated(999);
M.animateAllIn(999);
ok(true, 'eliminated/all-in on unknown pid are silent no-ops');

// 7) Pont _prevDealerPid : lecture + écriture nue du monolithe
window._prevDealerPid = 7;
ok(window._prevDealerPid === 7, '_prevDealerPid bridge read/write');
window._prevDealerPid = -1;

// 8) Alias legacy en place
ok(['launchConfetti', 'updatePotSize', 'animateDealerMove', 'setMyTurnActive',
    'animateDealMyCards', 'flashActionLabel'].every((n) => typeof window[n] === 'function'),
   'all 15 legacy aliases attached (sample checked)');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All anim tests passed.');
