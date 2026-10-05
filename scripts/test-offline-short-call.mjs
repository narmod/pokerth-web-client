#!/usr/bin/env node
// A call that commits a player's whole remaining stack is an all-in. Since
// upstream 660eaed (PokerTH 2.1.10, acts-1631) the server turns such a call
// into netActionAllIn, so online the table shows « All-In ». The offline
// engine already moved the whole stack and flagged the player all-in, but it
// still reported the action as a call: in training the seat read « Call ».
//
// Three hands: a short stack facing a bet larger than its stack, a stack that
// exactly matches the bet, and an ordinary call that must stay a call.
// Run: node scripts/test-offline-short-call.mjs
import { OfflineTable, ACT } from '../public/modules/offline/engine.mjs';

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + label);
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

// One pre-flop: the first big stack to speak raises to `raiseTo(table)`,
// everybody else calls. Returns the short stack's actionDone event.
function playHand(shortStack, raiseTo) {
  const SHORT = 3;
  const players = [1, 2, 3].map((i) => ({
    id: i, name: 'P' + i, stack: i === SHORT ? shortStack : 3000, isBot: true, in: true,
  }));
  const evs = [];
  const pending = [];
  const table = new OfflineTable({
    players, smallBlind: 10, raiseEvery: 8, gameId: 1, rng: mulberry32(11),
    onEvent: (ev) => { evs.push(ev); if (ev.type === 'turn') pending.push(ev.playerId); },
  });
  table.start();
  let raised = false, guard = 0;
  while (pending.length && guard++ < 40) {
    if (evs.some((e) => e.type === 'dealFlop' || e.type === 'handComplete')) break;
    const pid = pending.shift();
    if (pid !== SHORT && !raised) { raised = true; table.act(pid, ACT.RAISE, raiseTo(table, players[SHORT - 1])); }
    else table.act(pid, ACT.CALL);
  }
  return evs.find((e) => e.type === 'actionDone' && e.playerId === SHORT && e.paid > 0
    && e.totalStreetBet > 20) || {};
}

// 1. Short stack (60) faces a raise to 500.
const a = playHand(60, () => 500);
ok(a.action === ACT.ALLIN, 'a call for less than the bet is reported as all-in');
ok(a.stack === 0 && a.totalStreetBet < a.currentBet, 'the whole stack went in, short of the bet');

// 2. The raise is exactly what the short stack has behind.
const b = playHand(400, (t, short) => t.h.streetCommit[short.id] + short.stack);
ok(b.action === ACT.ALLIN, 'a call that exactly empties the stack is reported as all-in');
ok(b.stack === 0 && b.totalStreetBet === b.currentBet, 'the bet is matched and nothing is left');

// 3. Deep stack: an ordinary call stays a call.
const c = playHand(3000, () => 500);
ok(c.action === ACT.CALL, 'an ordinary call is still a call');
ok(c.stack > 0 && c.totalStreetBet === c.currentBet, 'chips are left behind');

console.log(fails ? `\n${fails} check(s) failed` : '\nall checks passed');
process.exit(fails ? 1 : 0);
