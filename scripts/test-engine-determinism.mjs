#!/usr/bin/env node
// Deterministic full-game integration test for the offline engine + bot brain.
// Plays a headless Sit'n'Go entirely with bots, driving each 'turn' through
// decide(), and records the exact action trace. Running the SAME seed twice
// must yield a BIT-IDENTICAL trace — this is the guard that the multi-street
// barrelling logic (bot._barrels state, new branch in decide) never shifts the
// this.rng() draw order that the determinism of the offline mode relies on.
// Run: node scripts/test-engine-determinism.mjs
import { OfflineTable, ACT } from '../public/modules/offline/engine.mjs';
import { decide, pickArchetype } from '../public/modules/offline/bots.mjs';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GS = { preflop: 0, flop: 1, turn: 2, river: 3 };

// Play a full game with a fixed seed; return the action trace as a string.
function playGame(seed, maxHands) {
  const rng = mulberry32(seed);
  const players = [];
  for (let i = 1; i <= 4; i++) players.push({ id: i, name: 'B' + i, stack: 1500, isBot: true, in: true });

  // Per-bot config built exactly like server.mjs (archetype from the SAME rng,
  // then the barrel flag doped by skill+archetype). Order of pickArchetype
  // draws mirrors the real fill so the deck-and-decide stream stays aligned.
  const skills = ['normal', 'hard', 'normal', 'hard'];
  const cfg = {};
  for (let i = 0; i < players.length; i++) {
    const st = pickArchetype(rng);
    const skill = skills[i];
    const _barrelOn = (skill !== 'easy') && (st.arch !== 'station');
    cfg[players[i].id] = { aggr: st.aggr, rng, skill, arch: st.arch,
      callMargin: st.callMargin, bluffMul: st.bluffMul, entryEq: st.entryEq,
      openMul: st.openMul, _barrelOn, _barrels: 0, _barrelStreet: null };
  }

  const trace = [];
  let hands = 0, stop = false;
  let table;
  const onEvent = (ev) => {
    if (stop) return;
    if (ev.type === 'handStart') {
      hands++;
      for (const id in cfg) { cfg[id]._barrels = 0; cfg[id]._barrelStreet = null; cfg[id]._hadDraw = false; }
      return;
    }
    if (ev.type === 'turn') {
      // Mirror server ordering: one rng() jitter is drawn BEFORE decide().
      rng();
      const d = decide(ev, cfg[ev.playerId]);
      trace.push(ev.playerId + ':' + GS[ev.gameState] + ':' + d.action + (d.amountTo != null ? '@' + d.amountTo : ''));
      // Apply synchronously (headless: no pacing timers).
      try { table.act(ev.playerId, d.action, d.amountTo); } catch (e) { trace.push('ERR:' + e.message); stop = true; }
      return;
    }
    if (ev.type === 'handComplete') {
      // The engine leaves it to the driver to deal the next hand (server.mjs
      // does this after a pace timer). Headless: chain immediately until the
      // hand cap, so the game plays out deterministically.
      if (hands >= maxHands) { stop = true; return; }
      const live = table.players.filter(p => p.in && p.stack > 0);
      if (live.length < 2) { stop = true; return; }   // Sit'n'Go finished
      try { table.nextHand(); } catch (e) { trace.push('NEXT-ERR:' + e.message); stop = true; }
      return;
    }
  };

  table = new OfflineTable({ players, smallBlind: 10, rng, now: () => 0, gameId: 1, onEvent });
  try { table.start(); } catch (e) { trace.push('START-ERR:' + e.message); }
  return trace.join('|');
}

let fails = 0;
function ok(cond, label) { if (!cond) { console.error('FAIL ' + label); fails++; } else console.log('ok   ' + label); }

// 1) Same seed → identical trace (the core determinism guarantee)
const A = playGame(20260719, 12);
const B = playGame(20260719, 12);
ok(A === B, 'same seed → bit-identical action trace (' + A.split('|').length + ' actions)');

// 2) The game actually ran (non-trivial trace, multiple streets reached)
ok(A.split('|').length > 20, 'game produced a substantial trace');
ok(/:(2|3):/.test(A), 'reached turn/river at least once (barrel branch reachable)');

// 3) Different seed → different trace (sanity: not a constant)
const C = playGame(1234567, 12);
ok(C !== A, 'different seed → different trace');

// 4) No engine errors in the trace
ok(A.indexOf('ERR:') === -1 && A.indexOf('START-ERR:') === -1, 'no engine errors during play');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All engine determinism tests passed.');
