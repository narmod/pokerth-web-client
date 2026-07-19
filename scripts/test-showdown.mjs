#!/usr/bin/env node
// Deterministic tests for public/modules/game/showdown.mjs (ESM #9f-9).
// Run: node scripts/test-showdown.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  className: '', dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
  appendChild(c) { this.children.push(c); }, addEventListener() {}, remove() {},
  querySelector: () => null, querySelectorAll: () => [] }; }
const els = {};
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: () => makeEl() };
window.getPlayerName = (pid) => 'J' + pid;
window.isBot = () => false;
window._lifeRecordGame = () => {};
window._advGet = () => true;
window.cardHtml = (c) => '<span class="card">' + c + '</span>';
window.notifyWinner = () => {};
let bigWins = 0; window.notifyBigWin = () => bigWins++;

const { S } = await import('../public/modules/game/state.mjs');
const W = await import('../public/modules/game/showdown.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// _snapshotHandResults : nets exacts avant reset de la main suivante
S.seats = [1, 2]; S.myId = 1;
S.seatData = { 1: { money: 1500, folded: false, active: true },
               2: { money:  500, folded: true,  active: true } };
S._seatStackAtHandStart = { 1: 1000, 2: 1000 };
W._snapshotHandResults();
ok(S._handResultSnapshot[1] && S._handResultSnapshot[1].money === 1500, 'snapshot stack final');
ok(S._handResultSnapshot[1].net === 500 && S._handResultSnapshot[2].net === -500,
   'nets exacts (+500 / −500)');

// showWinHandBadge + _hideWinHandBadge
W.showWinHandBadge('Full House');
ok(els['g-win-hand'] && els['g-win-hand'].style.display !== 'none', 'badge main gagnante affiché');
window._hideWinHandBadge();
ok(els['g-win-hand'].style.display === 'none', '_hideWinHandBadge le masque');

// _hlEliminatedPids : joueurs présents au snapshot mais plus actifs
S._handResultSnapshot = { 1: { inHand: true }, 2: { inHand: true } };
S.seatData = { 1: { money: 2000, active: true }, 2: { money: 0, active: false } };
const elim = W._hlEliminatedPids();
ok(Array.isArray(elim), '_hlEliminatedPids renvoie une liste');

// showWinnerOverlay : rend l'overlay + timer d'auto-dismiss
S.smallBlind = 10; S._winnerTimer = null;
W.showWinnerOverlay([{ pid: 1, won: 800 }]);
ok(els['g-winner-overlay'].innerHTML.includes('J1'), 'overlay vainqueur avec le pseudo');
ok(!!window._winnerTimer, 'timer auto-dismiss armé');
clearTimeout(window._winnerTimer);

// gros gain → notifyBigWin
bigWins = 0;
W.showWinnerOverlay([{ pid: 1, won: 99999 }]);
ok(bigWins === 1, 'gros gain → fanfare notifyBigWin');
clearTimeout(window._winnerTimer);

// dismissWinner nettoie
W.dismissWinner();
ok(els['g-winner-overlay'].style.display === 'none', 'dismissWinner masque l\'overlay');

ok(window.showWinnerOverlay === W.showWinnerOverlay
   && window.showEndGameOverlay === W.showEndGameOverlay
   && window._snapshotHandResults === W._snapshotHandResults, 'ponts window en place');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
