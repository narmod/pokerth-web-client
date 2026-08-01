#!/usr/bin/env node
// The blinds are money already on the table when the first player speaks, and
// the client only ever learns that from a PlayersActionDone. The offline engine
// used to post them in silence: the client opened every pre-flop believing the
// highest bet was zero and that nobody had put a chip in, which is what the
// forum report described in a training game — Check/Bet offered under the gun,
// Call/Raise in the big blind, and a small blind quoted a call worth a whole
// big blind instead of the difference.
//
// This test walks a real hand through the engine and replays the events the way
// modules/game/msg-hand.mjs does (highestBet from field 7, each seat's bet from
// field 5), then checks the three labels the report named.
// Run: node scripts/test-offline-blinds.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OfflineTable, ACT } from '../public/modules/offline/engine.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
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

// ── A hand, everyone limping, so every seat gets to speak pre-flop ──────────
const SB = 10, BB = 20;
const players = [1, 2, 3, 4, 5].map((i) => ({ id: i, name: 'P' + i, stack: 3000, isBot: true, in: true }));
const evs = [];
let table = null;
const pending = [];
table = new OfflineTable({
  players, smallBlind: SB, raiseEvery: 8, gameId: 1, rng: mulberry32(7),
  onEvent: (ev) => { evs.push(ev); if (ev.type === 'turn') pending.push(ev.playerId); },
});
table.start();
// Limp/check the whole pre-flop: act() re-enters onEvent, so drain a queue.
let guard = 0;
while (pending.length && guard++ < 40) {
  const pid = pending.shift();
  const seen = evs.filter((e) => e.type === 'dealFlop').length;
  if (seen) break;
  table.act(pid, ACT.CALL);
}

// ── Order: the blinds are announced after HandStart and before the first turn ──
const types = evs.map((e) => e.type);
const iHand = types.indexOf('handStart');
const iSb = types.indexOf('blindPosted');
const iBb = types.indexOf('blindPosted', iSb + 1);
const iTurn = types.indexOf('turn');
ok(iHand >= 0 && iSb > iHand, 'the small blind is announced after HandStart, which resets the bets');
ok(iBb > iSb && iTurn > iBb, 'then the big blind, and only then the first player speaks');

const sbEv = evs[iSb] || {}, bbEv = evs[iBb] || {};   // {} keeps a missing event a plain failure, not a crash
const hs = evs[iHand] || {};
ok(sbEv.playerId === hs.sbId && bbEv.playerId === hs.bbId, 'the two events name the small and the big blind');
ok(sbEv.totalStreetBet === SB && bbEv.totalStreetBet === BB, 'each one carries what that seat actually put in');
ok(sbEv.currentBet === BB && bbEv.currentBet === BB, 'the highest set is the big blind from the first event on');
ok(sbEv.gameState === 'preflop' && bbEv.gameState === 'preflop', 'both are pre-flop events');

// ── Replay as the client does ───────────────────────────────────────────────
// msg-hand.mjs: HandStart zeroes pot/highestBet/bets; PlayersActionDone sets
// S.highestBet (field 7) and S.seatData[pid].bet (field 5); the pot is the sum
// of the seats' bets. Nothing else feeds those numbers.
let highestBet = 0;
const bet = {};
const seen = {};   // pid -> what the action bar would have offered
for (const ev of evs) {
  if (ev.type === 'handStart') { highestBet = 0; for (const k in bet) delete bet[k]; continue; }
  if (ev.type === 'turn') {
    const toCall = Math.max(0, highestBet - (bet[ev.playerId] || 0));
    if (!(ev.playerId in seen)) seen[ev.playerId] = { toCall, canCheck: toCall === 0, engine: ev.legal };
    continue;
  }
  if (ev.type === 'blindPosted' || ev.type === 'actionDone') {
    highestBet = ev.currentBet;
    bet[ev.playerId] = ev.totalStreetBet;
    continue;
  }
  if (ev.type === 'dealFlop') break;
}

const potAfterBlinds = SB + BB;
ok(Object.values(seen).length >= 3, 'at least three seats spoke pre-flop');

// Under the gun: first to act, nothing invested, the big blind to match.
const utg = seen[evs[iTurn].playerId];
ok(utg && utg.toCall === BB && !utg.canCheck,
   'under the gun the bar offers Call/Raise, not Check/Bet');

// Big blind: already has the highest set in front of them — a free check.
const bbSeat = seen[hs.bbId];
ok(bbSeat && bbSeat.toCall === 0 && bbSeat.canCheck,
   'in the big blind the bar offers Check/Bet, not Call/Raise');

// Small blind: owes the difference, not a whole big blind.
const sbSeat = seen[hs.sbId];
ok(sbSeat && sbSeat.toCall === BB - SB,
   'in the small blind the call is quoted at the difference (' + (BB - SB) + '), not the big blind');

// And what the client computes now agrees with what the engine already knew.
const disagree = Object.keys(seen).filter((pid) => {
  const s = seen[pid];
  return s.engine.canCheck !== s.canCheck || (!s.canCheck && s.engine.callAmt !== s.toCall);
});
ok(disagree.length === 0,
   'every seat: the bar and the engine agree on the amount owed'
     + (disagree.length ? ' (differ for ' + disagree.join(', ') + ')' : ''));

// The pot the player reads is the sum of the seats' bets, so it now counts the
// blinds instead of ignoring them until someone spoke.
let potAtFirstTurn = 0;
{
  let hb = 0; const b = {};
  for (const ev of evs) {
    if (ev.type === 'handStart') { hb = 0; continue; }
    if (ev.type === 'blindPosted') { b[ev.playerId] = ev.totalStreetBet; continue; }
    if (ev.type === 'turn') break;
  }
  potAtFirstTurn = Object.values(b).reduce((a, x) => a + x, 0);
}
ok(potAtFirstTurn === potAfterBlinds,
   'the pot shows ' + potAfterBlinds + ' before the first action, not 0');

// ── The adapter must carry them as netActionNone, like the real server ──────
const srv = fs.readFileSync(path.join(root, 'public', 'modules', 'offline', 'server.mjs'), 'utf8');
const caseIdx = srv.indexOf("case 'blindPosted':");
ok(caseIdx > 0, 'the offline server still maps blindPosted');
const caseBody = srv.slice(caseIdx, srv.indexOf('break;', caseIdx));
ok(/PlayersActionDone/.test(caseBody), 'it sends a PlayersActionDone');
ok(/\[4,0,0\]/.test(caseBody), 'with action netActionNone (0), which prints no label and no log line');
ok(/\[5,0,ev\.totalStreetBet\][\s\S]*\[7,0,ev\.currentBet\]/.test(caseBody),
   'carrying the seat bet in field 5 and the highest set in field 7');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
