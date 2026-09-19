#!/usr/bin/env node
// Nobody posts the big blind twice in a row (upstream b6f5f7c, pokerth#541).
// On the way down to heads-up the button is the small blind and the other
// player the big blind; a plain "next live seat" shift could hand the big blind
// to the player who had just posted it - typically when the button busts. The
// offline engine now gives that player the button (small blind) instead.
// Run: node scripts/test-offline-button.mjs
import { OfflineTable } from '../public/modules/offline/engine.mjs';
import { decide, pickArchetype } from '../public/modules/offline/bots.mjs';

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── 1) Scripted: three players, one of them gone before the next hand ───────
// Hand 1 always opens with seat 1 on the button, 2 = SB, 3 = BB.
function afterBust(outId) {
  const players = [1, 2, 3].map((i) => ({ id: i, name: 'P' + i, stack: 3000, isBot: true, in: true }));
  const starts = [];
  const table = new OfflineTable({
    players, smallBlind: 10, gameId: 1, rng: mulberry32(7), now: () => 0,
    onEvent: (ev) => { if (ev.type === 'handStart') starts.push(ev); },
  });
  table.start();
  players.find((p) => p.id === outId).in = false;
  table.nextHand();
  return starts;
}
let h = afterBust(1);
ok(h[0].dealerId === 1 && h[0].sbId === 2 && h[0].bbId === 3, 'hand 1: button 1, SB 2, BB 3');
ok(h[1].bbId === 2 && h[1].sbId === 3 && h[1].dealerId === 3,
  'button busts: previous BB (3) takes the button/SB, 2 posts the BB');
h = afterBust(2);
ok(h[1].dealerId === 3 && h[1].sbId === 3 && h[1].bbId === 1, 'SB busts: 3 is button/SB, 1 posts the BB');
h = afterBust(3);
ok(h[1].dealerId === 2 && h[1].sbId === 2 && h[1].bbId === 1, 'BB busts: plain shift, 2 is button/SB, 1 posts the BB');

// ── 2) Full bot games: the rule holds everywhere, heads-up still alternates ─
let toHU = 0, twice = 0, huHands = 0, huNotAlt = 0, huBtnNotSb = 0, errs = 0;
for (let seed = 1; seed <= 120; seed++) {
  const rng = mulberry32(seed);
  const players = [1, 2, 3, 4].map((i) => ({ id: i, name: 'B' + i, stack: 1500, isBot: true, in: true }));
  const cfg = {};
  players.forEach((p) => {
    const st = pickArchetype(rng);
    cfg[p.id] = { aggr: st.aggr, rng, skill: 'normal', arch: st.arch, callMargin: st.callMargin,
      bluffMul: st.bluffMul, entryEq: st.entryEq, openMul: st.openMul,
      _barrelOn: true, _barrels: 0, _barrelStreet: null };
  });
  let prev = null, hands = 0, stop = false;
  const q = [];
  const table = new OfflineTable({
    players, smallBlind: 50, raiseEvery: 3, gameId: 1, rng, now: () => 0,
    onEvent: (ev) => {
      if (stop) return;
      if (ev.type === 'handStart') {
        if (++hands > 400) { stop = true; return; }
        const n = ev.seats.length;
        if (prev && ev.bbId === prev.bb) twice++;
        if (prev && n === 2 && prev.n > 2) toHU++;
        if (n === 2) {
          huHands++;
          if (ev.dealerId !== ev.sbId) huBtnNotSb++;
          if (prev && prev.n === 2 && ev.bbId !== prev.sb) huNotAlt++;
        }
        prev = { bb: ev.bbId, sb: ev.sbId, n };
      } else if (ev.type === 'turn' || ev.type === 'handComplete') q.push(ev);
      else if (ev.type === 'gameOver') stop = true;
    },
  });
  table.start();
  let guard = 0;
  while (q.length && !stop && guard++ < 100000) {
    const ev = q.shift();
    if (ev.type === 'handComplete') { table.nextHand(); continue; }
    rng();
    const d = decide(ev, cfg[ev.playerId]);
    try { table.act(ev.playerId, d.action, d.amountTo); } catch (e) { errs++; stop = true; }
  }
}
ok(toHU > 50, 'bot games reached heads-up from 3+ players (' + toHU + ' transitions)');
ok(twice === 0, 'no player ever posted the big blind twice in a row');
ok(huHands > 100 && huBtnNotSb === 0, 'heads-up: the button is always the small blind (' + huHands + ' hands)');
ok(huNotAlt === 0, 'heads-up: blinds keep alternating once it is running');
ok(errs === 0, 'no engine errors');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All offline button tests passed.');
