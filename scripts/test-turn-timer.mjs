#!/usr/bin/env node
// Deterministic tests for public/modules/game/turn-timer.mjs (ESM #9f-3).
// Run: node scripts/test-turn-timer.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const els = {}; const removed = [];
function el(id) { return els[id] = els[id] || { textContent: '', style: {}, setAttribute() {}, remove() { removed.push(id); } }; }
globalThis.document = {
  readyState: 'complete', addEventListener() {}, querySelectorAll: () => [],
  querySelector: () => null, getElementById: (id) => el(id),
};
let urgentCalls = [], ticks = 0, finals = 0, renders = 0;
window.setUrgentMode = (a) => urgentCalls.push(a);
window.notifyTick = () => ticks++;
window.notifyTickFinal = () => finals++;
window.renderSeats = () => renders++;
globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);

const { S } = await import('../public/modules/game/state.mjs');
const T = await import('../public/modules/game/turn-timer.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// _timerRectSvg : couleurs officielles + depletion
const svgMe = T._timerRectSvg(15, 30, true), svgOpp = T._timerRectSvg(30, 30, false);
ok(svgMe.includes('#6E9CEC') && svgOpp.includes('#4070D0'), 'couleurs self/adversaire QML');
ok(svgMe.includes('stroke-dashoffset="50.0"'), 'depletion 50% à mi-temps');
ok(svgOpp.includes('stroke-dashoffset="0.0"'), 'depletion 0% au départ');

// startTurnTimer : arme l\'état + rendu
S.gameTimeout = 12; S.myId = 1; S.turnPid = 1;
T.startTurnTimer();
ok(S._timerSec === 12 && S._timerTot === 12 && S._timerID !== null, 'startTurnTimer arme 12 s');
ok(renders === 1, 'startTurnTimer déclenche renderSeats');
clearInterval(S._timerID);

// _updateTimer : décompte, urgence, tics sonores (timeout >= 10)
S._timerSec = 6; S._timerTot = 12; ticks = 0; finals = 0; urgentCalls = [];
T._updateTimer();   // 6 → 5 : tic + urgent (<= 8)
ok(S._timerSec === 5 && ticks === 1, 'tic sonore à 5 s');
ok(urgentCalls[urgentCalls.length - 1] === true, 'mode urgent actif (mon tour, ≤8 s)');
S._timerSec = 2; T._updateTimer();  // 2 → 1 : bip final
ok(finals === 1, 'bip final à 1 s');
S._timerID = setInterval(() => {}, 60000);
S._timerSec = 1; T._updateTimer();  // 1 → 0 : stop + urgent off
ok(S._timerSec === 0 && urgentCalls[urgentCalls.length - 1] === false, 'arrêt à 0 + urgent off');

// pas de tics si timeout de table < 10 s
S.gameTimeout = 5; S._timerSec = 6; ticks = 0;
T._updateTimer();
ok(ticks === 0, 'pas de tic sur table rapide (<10 s)');
S.gameTimeout = 15;

// stopTurnTimer : purge complète
S._timerID = setInterval(() => {}, 60000); S._timerSec = 7;
T.stopTurnTimer();
ok(S._timerID === null && S._timerSec === 0, 'stopTurnTimer remet à zéro');
ok(urgentCalls[urgentCalls.length - 1] === false, 'stop → urgent off');

ok(window.startTurnTimer === T.startTurnTimer && window.stopTurnTimer === T.stopTurnTimer
   && window._updateTimer === T._updateTimer && window._timerRectSvg === T._timerRectSvg,
   'ponts window en place');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
