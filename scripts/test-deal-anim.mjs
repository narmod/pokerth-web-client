#!/usr/bin/env node
// The card-dealing animation earned two complaints on the forum: no way to
// switch it off, and cards flying to the chairs of knocked-out players late
// in the game. This test drives animateCardDeal with immediate timers and
// checks both: the advanced option (pth_deal_anim, web, default ON) silences
// it entirely, and the targets are only the seats actually dealt this hand —
// derived from the pid list the seat renderer publishes alongside the pixel
// positions. Run: node scripts/test-deal-anim.mjs
globalThis.window = globalThis;
const store = {};
globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null),
  setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  className: '', dataset: {}, _cls: new Set(),
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  appendChild(c) { this.children.push(c); }, remove() {}, addEventListener() {},
  querySelector: () => null, querySelectorAll: () => [] }; }
const els = {};
const bodyKids = [];
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  documentElement: { getAttribute: () => null },
  body: { appendChild(el) { bodyKids.push(el); } },
  getElementById: (id) => (els[id] = els[id] || makeEl()),
  createElement: () => makeEl() };
globalThis.requestAnimationFrame = (fn) => fn();
window.renderSeats = () => {};
window.renderMyTurnActions = () => {};

const { S } = await import('../public/modules/game/state.mjs');
const T = await import('../public/modules/ui/table-cards.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  \u2717', msg); } else console.log('  \u2713', msg); }

// Four chairs around the felt: me (10), two live opponents, one busted.
S.myId = 10;
S._potCenter = { x: 200, y: 150 };
S._lastPixPos  = [{ left: 100, top: 300 }, { left: 60, top: 80 }, { left: 340, top: 80 }, { left: 200, top: 40 }];
S._lastPixPids = [10, 20, 30, 40];
S.seatData = {
  10: { money: 3000, active: true },
  20: { money: 1500, active: true },
  30: { money: 2200, active: true },
  40: { money: 0, active: false },        // knocked out last hand
};

// Immediate timers so the whole choreography runs synchronously.
const realSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = (fn) => { fn(); return 0; };

// 1. Option off → not a single flying card.
store['pth_deal_anim'] = '0';
T.animateCardDeal();
ok(bodyKids.length === 0, 'option off: no flying card is created');

// 2. Default (no stored value) → animation on, but only for seats dealt in.
delete store['pth_deal_anim'];
T.animateCardDeal();
ok(bodyKids.length === 6, '2 cards for each of the 3 live seats, none for the busted one (got ' + bodyKids.length + ')');
const bustedTargets = bodyKids.filter((el) => el.style.left === (200 - 13) + 'px' && el.style.top === (40 - 18) + 'px');
ok(bustedTargets.length === 0, 'no card lands on the knocked-out chair');
const mine = bodyKids.filter((el) => /\bmine\b/.test(el.className));
ok(mine.length === 2, 'my two cards carry the .mine class (got ' + mine.length + ')');
const liveTargets = [[100, 300], [60, 80], [340, 80]];
const missed = liveTargets.filter(([L, Tp]) =>
  bodyKids.filter((el) => el.style.left === (L - 13) + 'px' && el.style.top === (Tp - 18) + 'px').length !== 2);
ok(missed.length === 0, 'each live seat receives exactly two cards');

// 3. Renderer predates the pid list (length mismatch) → legacy behaviour, all seats.
bodyKids.length = 0;
S._lastPixPids = [10, 20];              // stale, misaligned
T.animateCardDeal();
ok(bodyKids.length === 8, 'without an aligned pid list, the legacy all-seats behaviour is kept');

globalThis.setTimeout = realSetTimeout;
console.log(fail ? `\n${fail}/${n} \u00c9CHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
