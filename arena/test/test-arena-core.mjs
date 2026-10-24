#!/usr/bin/env node
// Deterministic tests for the tournament director core (prototype):
// arena/lib/journal.mjs (sealed journal, Ed25519) and
// arena/lib/tracker.mjs (ranking from spectator events).
// No I/O, fixed clock. Run: node arena/test/test-arena-core.mjs
import { Journal, verifyJournal, canonical, generateKeys, signPayload, verifyPayload, publicKeyFromPrivate, publicKeyRawB64, GENESIS } from '../lib/journal.mjs';
import { GameTracker } from '../lib/tracker.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const order = (res) => res.ranking.map((r) => r.id).join(',');
function run(events) {
  const t = new GameTracker();
  for (const ev of events) t.apply(ev);
  return t.result();
}

// ── 1. canonical JSON ───────────────────────────────────────────────
ok(canonical({ b: 1, a: [1, { d: 2, c: undefined }] }) === '{"a":[1,{"d":2}],"b":1}', 'canonical: sorted keys, undefined dropped');
ok(canonical({ x: 'é' }) === canonical(JSON.parse('{"x":"é"}')), 'canonical: UTF-8 stable');
let threw = false; try { canonical({ x: NaN }); } catch (e) { threw = true; }
ok(threw, 'canonical: refuses non-finite numbers');

// ── 2. journal chain ───────────────────────────────────────────────
let clock = 1700000000000;
const j = new Journal({ now: () => clock++ });
ok(j.head === GENESIS, 'empty journal head = genesis');
j.append('game', { type: 'gameStart', seats: [1, 2] });
j.append('game', { type: 'handStart', seatStates: [0, 0] });
j.append('game', { type: 'endOfGame', winnerId: 1 });
const v = verifyJournal(j.entries);
ok(v.ok && v.head === j.head, 'journal verifies, head matches');
const j2 = new Journal({ now: (() => { let c = 1700000000000; return () => c++; })() });
j2.append('game', { seats: [1, 2], type: 'gameStart' });
j2.append('game', { seatStates: [0, 0], type: 'handStart' });
j2.append('game', { winnerId: 1, type: 'endOfGame' });
ok(j2.head === j.head, 'same events, same clock → same head (key order irrelevant)');

const tampered = JSON.parse(JSON.stringify(j.entries));
tampered[1].data.seatStates = [0, 2];
ok(verifyJournal(tampered).badSeq === 1, 'tampered data detected at its seq');
const removed = JSON.parse(JSON.stringify(j.entries)); removed.splice(1, 1);
ok(!verifyJournal(removed).ok, 'removed entry detected');
const swapped = JSON.parse(JSON.stringify(j.entries)); [swapped[1], swapped[2]] = [swapped[2], swapped[1]];
ok(!verifyJournal(swapped).ok, 'reordered entries detected');
const resumed = new Journal({ entries: j.entries, now: () => clock++ });
resumed.append('note', { x: 1 });
ok(verifyJournal(resumed.entries).ok && resumed.entries.length === 4, 'journal resumes from verified entries');
threw = false; try { new Journal({ entries: tampered }); } catch (e) { threw = true; }
ok(threw, 'resuming from a broken journal is refused');

// ── 3. signatures ──────────────────────────────────────────────────
const keys = generateKeys();
const payload = { head: j.head, result: { winner: 1 } };
const sig = signPayload(payload, keys.privateKeyPem);
ok(verifyPayload(payload, sig, keys.publicKeyPem), 'signature verifies');
ok(verifyPayload({ result: { winner: 1 }, head: j.head }, sig, keys.publicKeyPem), 'signature independent of key order');
ok(!verifyPayload({ head: j.head, result: { winner: 2 } }, sig, keys.publicKeyPem), 'altered payload rejected');
ok(!verifyPayload(payload, sig, generateKeys().publicKeyPem), 'other key rejected');
ok(publicKeyFromPrivate(keys.privateKeyPem) === keys.publicKeyPem, 'public key derived from private key');
ok(Buffer.from(publicKeyRawB64(keys.publicKeyPem), 'base64').length === 32, 'raw public key is 32 bytes (DNS TXT k=)');

// ── 4. tracker: normal game ────────────────────────────────────────
// 4 players, 1000 each. Hand 1: 14 busts. Hand 2: 12 (600) and 13 (400)
// bust together, 11 wins → 12 ahead of 13 (bigger stack at start of hand 2).
const normal = [
  { type: 'gameInfo', gameId: 7, name: 'SnG', startMoney: 1000, maxPlayers: 4 },
  { type: 'playerName', id: 11, name: 'Alice' }, { type: 'playerName', id: 12, name: 'Bob' },
  { type: 'playerName', id: 13, name: 'Carol' }, { type: 'playerName', id: 14, name: 'Dave' },
  { type: 'gameStart', dealer: 11, seats: [11, 12, 13, 14] },
  { type: 'handStart', seatStates: [0, 0, 0, 0] },
  { type: 'money', id: 14, money: 0 }, { type: 'money', id: 12, money: 600 }, { type: 'money', id: 13, money: 400 },
  { type: 'money', id: 11, money: 2000 },
  { type: 'handStart', seatStates: [0, 0, 0, 2] },
  { type: 'money', id: 12, money: 0 }, { type: 'money', id: 13, money: 0 }, { type: 'money', id: 11, money: 4000 },
  { type: 'endOfGame', winnerId: 11 },
];
const rn = run(normal);
ok(order(rn) === '11,12,13,14', 'normal: 11 > 12 > 13 > 14');
ok(rn.status === 'complete' && rn.finished && rn.hands === 2, 'normal: complete, 2 hands');
ok(rn.ranking[3].elimHand === 1 && rn.ranking[3].stackAtHandStart === 1000, 'normal: 14 out in hand 1 with 1000');
ok(rn.ranking[1].elimHand === 2 && rn.ranking[1].stackAtHandStart === 600, 'normal: 12 out in hand 2 with 600');
ok(rn.winner && rn.winner.name === 'Alice' && rn.ranking[0].place === 1, 'normal: winner named, place 1');

// Same game where hand 3 starts before the end (server flags 12, 13 NoMoney).
const viaHandStart = normal.slice(0, -1).concat([
  { type: 'handStart', seatStates: [0, 2, 2, 2] },
  { type: 'endOfGame', winnerId: 11 },
]);
const rh = run(viaHandStart);
ok(order(rh) === '11,12,13,14' && rh.status === 'complete', 'NoMoney flags at next hand give the same ranking');

// ── 5. exact tie ───────────────────────────────────────────────────
const tie = [
  { type: 'gameInfo', gameId: 8, startMoney: 500 },
  { type: 'gameStart', seats: [1, 2, 3] },
  { type: 'handStart', seatStates: [0, 0, 0] },
  { type: 'money', id: 2, money: 0 }, { type: 'money', id: 3, money: 0 }, { type: 'money', id: 1, money: 1500 },
  { type: 'endOfGame', winnerId: 1 },
];
const rt = run(tie);
ok(rt.ranking[1].tie && rt.ranking[2].tie, 'tie: both flagged');
ok(rt.status === 'incomplete', 'tie: result needs an organizer (incomplete)');
ok(order(rt) === '1,2,3', 'tie: deterministic order (seat)');

// ── 6. joining a running game (gap) ────────────────────────────────
const late = [
  { type: 'gameInfo', gameId: 9, startMoney: 1000 },
  { type: 'rejoin', handNum: 5, players: [{ id: 1, money: 1800 }, { id: 2, money: 0 }, { id: 3, money: 1200 }] },
  { type: 'handStart', seatStates: [0, 2, 0] },
  { type: 'money', id: 3, money: 0 }, { type: 'money', id: 1, money: 3000 },
  { type: 'endOfGame', winnerId: 1 },
];
const rl = run(late);
ok(rl.gaps.length === 1 && rl.gaps[0].fromHand === 1 && rl.gaps[0].toHand === 5, 'late join: gap 1..5 recorded');
ok(order(rl) === '1,3,2', 'late join: unknown elimination ranked last');
ok(rl.ranking[1].elimHand === 6 && rl.ranking[1].stackAtHandStart === 1200, 'late join: stacks of the rejoin used for hand 6');
ok(rl.ranking[2].unknown && rl.status === 'incomplete', 'late join: incomplete');

// Reconnect without missing a hand: no gap.
const reco = normal.slice(0, 11).concat([
  { type: 'disconnected' },
  { type: 'rejoin', handNum: 1, players: [{ id: 11, money: 2000 }, { id: 12, money: 600 }, { id: 13, money: 400 }, { id: 14, money: 0 }] },
  { type: 'handStart', seatStates: [0, 0, 0, 2] },
  { type: 'money', id: 12, money: 0 }, { type: 'money', id: 13, money: 0 }, { type: 'money', id: 11, money: 4000 },
  { type: 'endOfGame', winnerId: 11 },
]);
const rr = run(reco);
ok(rr.gaps.length === 0 && rr.status === 'complete' && order(rr) === '11,12,13,14', 'reconnect without missed hand: complete');

// ── 7. player id change (a player rejoined) ────────────────────────
const idc = normal.slice(0, 11).concat([
  { type: 'idChange', oldId: 12, newId: 22 },
  { type: 'handStart', seatStates: [0, 0, 0, 2] },
  { type: 'money', id: 22, money: 0 }, { type: 'money', id: 13, money: 0 }, { type: 'money', id: 11, money: 4000 },
  { type: 'endOfGame', winnerId: 11 },
]);
const ri = run(idc);
ok(order(ri) === '11,22,13,14' && ri.ranking[1].name === 'Bob', 'id change keeps name, stack and place');

// ── 8. unfinished game ─────────────────────────────────────────────
const ru = run(normal.slice(0, 12));
ok(ru.status === 'running' && !ru.finished && ru.ranking[3].id === 14, 'unfinished: running, eliminations so far');

console.log(fails ? `\n${fails} FAILED` : '\nall arena-core tests passed');
process.exit(fails ? 1 : 0);
