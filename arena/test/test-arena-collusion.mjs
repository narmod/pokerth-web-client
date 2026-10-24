#!/usr/bin/env node
// Tests of the collusion check (service 0.10.0): signals read from the
// director's journal — soft play, no pressure, folds to one player, chip
// passing — with their minimum samples; no signal for ordinary play; the
// spectator records one « handLog » per hand; the organizer route, what the
// journal keeps (counts, not names) and what players never see.
// Run: node arena/test/test-arena-collusion.mjs
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { analyzeCollusion } from '../lib/collusion.mjs';
import { replayJournal } from '../lib/spectator.mjs';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// A game: Ann 1, Bob 2, Cat 3, Dan 4, 1000 chips each.
const F = 1, X = 2, C = 3, B = 4, R = 5;
function game(hands) {
  const ev = [
    { type: 'gameInfo', gameId: 7, name: 'Cup', startMoney: 1000, maxPlayers: 4 },
    { type: 'playerName', id: 1, name: 'Ann' }, { type: 'playerName', id: 2, name: 'Bob' },
    { type: 'playerName', id: 3, name: 'Cat' }, { type: 'playerName', id: 4, name: 'Dan' },
    { type: 'gameStart', seats: [1, 2, 3, 4] },
  ];
  hands.forEach((h, i) => { ev.push({ type: 'handStart', seatStates: [0, 0, 0, 0] }); ev.push({ type: 'handLog', hand: i + 1, actions: h.a, winners: h.w, showdown: !!h.sd }); });
  return ev.map((data, i) => ({ seq: i + 1, type: 'game', data }));
}
// Ann and Bob heads-up after the flop, both checking to the end.
const softAB = { a: [[3, 0, F, 0], [4, 0, F, 0], [1, 0, C, 20], [2, 0, X, 20], [1, 1, X, 0], [2, 1, X, 0], [1, 2, X, 0], [2, 2, X, 0], [1, 3, X, 0], [2, 3, X, 0]], w: [[1, 40]], sd: true };
// Ann against Cat: bets after the flop.
const fightAC = { a: [[2, 0, F, 0], [4, 0, F, 0], [1, 0, C, 20], [3, 0, X, 20], [1, 1, B, 40], [3, 1, C, 40], [1, 2, X, 0], [3, 2, B, 80], [1, 2, C, 80]], w: [[3, 280]], sd: true };
// Bob against Dan, the same.
const fightBD = { a: [[1, 0, F, 0], [3, 0, F, 0], [2, 0, C, 20], [4, 0, X, 20], [2, 1, B, 40], [4, 1, R, 120], [2, 1, C, 120]], w: [[2, 280]], sd: true };
// Cat puts 600 in, Dan re-raises, Cat folds: Dan takes it without a showdown.
const passCD = { a: [[1, 0, F, 0], [2, 0, F, 0], [3, 0, R, 600], [4, 0, R, 900], [3, 0, F, 600]], w: [[4, 1520]], sd: false };

// ── the analysis ───────────────────────────────────────────────────
{
  const r = analyzeCollusion(game([softAB, fightAC, softAB, fightBD, softAB, fightAC, softAB, passCD, fightBD]));
  ok(r.hands === 9 && r.players === 4, 'reads every hand of the journal');
  const ab = r.pairs.find((p) => p.a === 'Ann' && p.b === 'Bob');
  ok(ab && ab.level === 'flag' && ab.signals[0].kind === 'softPlay' && ab.signals[0].n === 4 && ab.signals[0].share === 1 && ab.signals[0].others === 0, 'soft play: Ann and Bob checked down 4 heads-up hands, while betting against the others → flagged');
  const cd = r.pairs.find((p) => p.a === 'Cat' && p.b === 'Dan');
  ok(cd && cd.level === 'flag' && cd.signals[0].kind === 'chipPassing' && /Cat put 60 % of his stack in, then folded to Dan \(hand 8, no showdown\)/.test(cd.signals[0].text), 'chip passing: Cat put 60 % in, folded to Dan, no showdown → flagged, with the hand');
  ok(!r.pairs.some((p) => p.a === 'Ann' && p.b === 'Cat') && !r.pairs.some((p) => p.a === 'Bob' && p.b === 'Dan') && r.flags === 2, 'ordinary play: nothing (2 pairs flagged, no others)');
  const few = analyzeCollusion(game([softAB, softAB, fightAC]));
  ok(!few.pairs.length, 'two heads-up hands prove nothing (at least 3)');
  ok(analyzeCollusion(game([])).hands === 0 && analyzeCollusion([]).pairs.length === 0, 'no hand: nothing');
  // Folding to one player, again and again (not to the others).
  const foldToB = { a: [[3, 0, F, 0], [4, 0, F, 0], [2, 0, R, 60], [1, 0, F, 20]], w: [[2, 90]] };
  const foldToC = { a: [[2, 0, F, 0], [4, 0, F, 0], [3, 0, R, 60], [1, 0, C, 60], [1, 1, X, 0], [3, 1, X, 0]], w: [[1, 120]], sd: true };
  const many = [];
  for (let i = 0; i < 7; i++) many.push(foldToB, foldToC);
  const fr = analyzeCollusion(game(many));
  const sig = (fr.pairs.find((p) => p.a === 'Ann' && p.b === 'Bob') || { signals: [] }).signals.find((s) => s.kind === 'foldsTo');
  ok(sig && sig.from === 'Ann' && sig.to === 'Bob' && sig.n === 7 && sig.rate === 1 && sig.others === 0, 'folds to one player: Ann folded to Bob 7 times out of 7, never to Cat → note');
  // The ranking never depends on it.
  const ev = game([softAB, passCD]);
  ok(JSON.stringify(replayJournal(ev)) === JSON.stringify(replayJournal(ev.filter((e) => e.data.type !== 'handLog'))), 'the ranking ignores the hand logs');
}

// ── through the service ────────────────────────────────────────────
const dir = mkdtempSync(join(tmpdir(), 'arena-col-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.308', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const A = { Authorization: 'Bearer master', 'Content-Type': 'application/json' };
const admin = async (p, b) => (await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: A, body: JSON.stringify(b) } : { headers: A })).json();
{
  const w = join(dir, 'watches', 'wcol0001');
  mkdirSync(w, { recursive: true });
  writeFileSync(join(w, 'meta.json'), JSON.stringify({ id: 'wcol0001', mode: 'host', startedAt: Date.now() }));
  writeFileSync(join(w, 'state.json'), JSON.stringify({ id: 'wcol0001', status: 'running', host: { gameId: 7, tableName: 'Club night' }, logs: [] }));
  writeFileSync(join(w, 'journal.json'), JSON.stringify({ entries: game([softAB, fightAC, softAB, fightBD, softAB, passCD]) }));
  const t = await admin('/t/create', { name: 'Club night', profile: 'club' });
  for (const n of ['Ann', 'Bob', 'Cat', 'Dan']) await admin('/t/player', { id: t.id, nick: n });
  svc.manager.tournaments.hostOpened(t.id, 'wcol0001', {}, 'admin');
  const c = await admin('/t/collusion', { id: t.id });
  ok(c.ok && c.collusion.hands === 6 && c.collusion.flags === 2 && c.collusion.pairs.length === 2, 'organizer: « Check again » reads the director\'s journal while the table runs');
  const j = JSON.parse(readFileSync(join(dir, 'tournaments', t.id, 'journal.json'), 'utf8'));
  const e = j.entries.find((x) => x.type === 'collusionChecked');
  ok(e && e.data.flags === 2 && !/Ann|Bob|Cat|Dan/.test(JSON.stringify(e.data)) && c.history.some((h) => /collusion check: 6 hands read, 2 pairs flagged/.test(h.summary)), 'the journal keeps the counts, not the names');
  const pub = await (await fetch(base + '/arena/api/t/' + t.publicKey)).json();
  ok(pub.ok && !('collusion' in pub) && !/softPlay|chipPassing/.test(JSON.stringify(pub)), 'players never see it');
  const f = await admin('/t/create', { name: 'Friendly', profile: 'friendly' });
  ok(!(await admin('/t/collusion', { id: f.id })).ok, 'off (friendly): refused');
  const n = await admin('/t/create', { name: 'No table', profile: 'club' });
  const nr = await admin('/t/collusion', { id: n.id });
  ok(!nr.ok && /director/.test(nr.error), 'without the director\'s journal: says so');
}
svc.close(); srv.close();
rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nall arena-collusion tests passed');
process.exit(fails ? 1 : 0);
