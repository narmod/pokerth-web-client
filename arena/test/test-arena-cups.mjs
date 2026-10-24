#!/usr/bin/env node
// Tests of the cups (service 0.13.0): points (players beaten + 1, shared
// places averaged, best N results, tie-breaks), only validated results, a
// correction followed by itself; stages (the first Q go on, several feeding
// one), a final from the points standings; the cup's ranking; closing and
// signing; what players see.
// Run: node arena/test/test-arena-cups.mjs
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';
import { pointsFor } from '../lib/cups.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// ── the points ─────────────────────────────────────────────────────
{
  const p = pointsFor([1, 2, 3, 4, 5, 6, 7, 8].map((place) => ({ nick: 'P' + place, place })));
  ok(p.get('p1').points === 8 && p.get('p8').points === 1 && p.get('p4').points === 5, '8 players: the winner 8, the last 1 (players behind + 1)');
  const s = pointsFor([{ nick: 'A', place: 1 }, { nick: 'B', place: 2 }, { nick: 'C', place: 3 }, { nick: 'D', place: 3 }, { nick: 'E', place: 5 }]);
  ok(s.get('c').points === 2.5 && s.get('d').points === 2.5 && s.get('e').points === 1 && s.get('a').points === 5, 'a shared place: the average of the positions (3rd–4th of 5 → 2.5 each)');
  const big = pointsFor(Array.from({ length: 20 }, (_, i) => ({ nick: 'X' + i, place: i + 1 })));
  ok(big.get('x0').points === 20 && pointsFor([{ nick: 'a', place: 1 }, { nick: 'b', place: 2 }]).get('a').points === 2, 'a bigger field is worth more: winning among 20 = 20, among 2 = 2');
}

const dir = mkdtempSync(join(tmpdir(), 'arena-cup-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.310', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const A = { Authorization: 'Bearer master', 'Content-Type': 'application/json' };
const admin = async (p, b) => (await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: A, body: JSON.stringify(b) } : { headers: A })).json();
const pub = async (p) => { const r = await fetch(base + '/arena/api' + p); const d = await r.json(); d.status = r.status; return d; };
async function tourney(name, ranking, profile) {
  const t = await admin('/t/create', { name, profile: profile || 'club' });
  for (const n of ranking) await admin('/t/player', { id: t.id, nick: n });
  await admin('/t/result', { id: t.id, source: 'manual', ranking });
  return t;
}
const row = (cup, nick) => cup.standings.rows.find((r) => r.nick === nick);

// ── a points cup, best 2 of 3 ──────────────────────────────────────
{
  const t1 = await tourney('Night 1', ['Ann', 'Bob', 'Cat', 'Dan']);          // Ann 4, Bob 3, Cat 2, Dan 1
  const t2 = await tourney('Night 2', ['Bob', 'Ann', 'Dan', 'Cat', 'Eve']);   // Bob 5, Ann 4, Dan 3, Cat 2, Eve 1
  const t3 = await tourney('Night 3', ['Cat', 'Dan', 'Ann']);                 // Cat 3, Dan 2, Ann 1
  const c = await admin('/cups/create', { name: 'Autumn league', bestOf: 2 });
  ok(c.ok && c.bestOf === 2 && c.publicKey, 'cup created: best 2 results');
  for (const t of [t1, t2, t3]) await admin('/cups/event', { id: c.id, tournamentId: t.id });
  let v = await admin('/cups/get?id=' + c.id);
  ok(row(v, 'Ann').total === 8 && row(v, 'Ann').played === 3 && row(v, 'Ann').results.find((x) => x.points === 1).counted === false, 'Ann: 4 + 4, her third result (1) dropped');
  ok(row(v, 'Bob').total === 8 && row(v, 'Cat').total === 5 && row(v, 'Dan').total === 5 && row(v, 'Eve').total === 1, 'Bob 8, Cat 5, Dan 5, Eve 1');
  // Ann and Bob both 8: best result first — Bob 5 > Ann 4.
  ok(v.standings.rows[0].nick === 'Bob' && row(v, 'Bob').place === 1 && row(v, 'Ann').place === 2, 'equal totals: the best single result decides (Bob 5 > Ann 4)');
  ok(row(v, 'Cat').place === 3 && row(v, 'Dan').place === 3 && row(v, 'Cat').tie, 'Cat and Dan: same totals, same best results → same place');
  ok(!(await admin('/cups/event', { id: c.id, tournamentId: t1.id })).ok, 'a tournament once in a cup');
  // A tournament not validated yet does not count.
  const t4 = await tourney('Night 4', ['Eve', 'Ann'], 'official');
  await admin('/cups/event', { id: c.id, tournamentId: t4.id });
  v = await admin('/cups/get?id=' + c.id);
  ok(row(v, 'Eve').total === 1 && v.standings.validated === 3, 'not validated yet: no points');
  await admin('/t/validate', { id: t4.id, override: 'seen by the organizer' });
  v = await admin('/cups/get?id=' + c.id);
  ok(row(v, 'Eve').total === 3, 'validated: counted (Eve 2 + 1)');
  // A correction changes the standings by itself.
  await admin('/t/correct', { id: t3.id, ranking: ['Dan', 'Cat', 'Ann'], reason: 'appeal' });
  v = await admin('/cups/get?id=' + c.id);
  ok(row(v, 'Dan').total === 6 && row(v, 'Cat').total === 4, 'a tournament corrected: the standings follow (Dan 3 + 3, Cat 2 + 2)');
  ok((await admin('/cups/close', { id: c.id })).ok, 'closing');
  const cl = await admin('/cups/get?id=' + c.id);
  ok(cl.status === 'closed' && cl.checks.signature && cl.history.some((h) => /cup closed: won by Bob/.test(h.summary)), 'closed: the standings signed, won by Bob');
  const pc = await pub('/c/' + c.publicKey);
  ok(pc.ok && pc.standings[0].nick === 'Bob' && pc.sealed && pc.sealed.signature && pc.events.length === 4, 'players\' page of the cup: standings, its tournaments, the signature');
  ok((await pub('/cups')).cups.some((x) => x.name === 'Autumn league'), 'listed with the cups');
  ok(!(await admin('/cups/event', { id: c.id, tournamentId: (await tourney('Night 5', ['Ann', 'Bob'])).id })).ok, 'closed: no more tournaments');
}

// ── a cup by stages: two steps feed the final ──────────────────────
{
  const s1 = await admin('/t/create', { name: 'Step 1a', profile: 'club' });
  const s2 = await admin('/t/create', { name: 'Step 1b', profile: 'club' });
  const fin = await admin('/t/create', { name: 'Grand final', profile: 'club' });
  const c = await admin('/cups/create', { name: 'Spring cup' });
  await admin('/cups/event', { id: c.id, tournamentId: fin.id, final: true });
  ok(!(await admin('/cups/event', { id: c.id, tournamentId: s1.id, next: 0 })).ok, 'a stage needs how many go on');
  await admin('/cups/event', { id: c.id, tournamentId: s1.id, next: 0, qualify: 2 });
  await admin('/cups/event', { id: c.id, tournamentId: s2.id, next: 0, qualify: 2 });
  for (const n of ['A1', 'A2', 'A3', 'A4']) await admin('/t/player', { id: s1.id, nick: n });
  for (const n of ['B1', 'B2', 'B3', 'B4', 'B5']) await admin('/t/player', { id: s2.id, nick: n });
  await admin('/t/result', { id: s1.id, source: 'manual', ranking: ['A1', 'A2', 'A3', 'A4'] });
  await admin('/t/result', { id: s2.id, source: 'manual', ranking: ['B1', 'B2', 'B3', 'B4', 'B5'] });
  await svc.sweep();
  const f = await admin('/t/get?id=' + fin.id);
  ok(f.players.map((p) => p.nick).sort().join() === 'A1,A2,B1,B2' && f.history.some((h) => h.author === 'cup'), 'validated steps: their first two go on to the final, added by « cup »');
  let v = await admin('/cups/get?id=' + c.id);
  ok(v.history.filter((h) => h.type === 'qualified').length === 2 && row(v, 'A1').stage === 2 && row(v, 'A3').stage === 1, 'in the cup\'s journal; the finalists reached stage 2');
  await svc.sweep();
  ok((await admin('/cups/get?id=' + c.id)).history.filter((h) => h.type === 'qualified').length === 2, 'once only');
  await admin('/t/result', { id: fin.id, source: 'manual', ranking: ['B2', 'A1', 'B1', 'A2'] });
  v = await admin('/cups/get?id=' + c.id);
  ok(v.standings.rows.slice(0, 4).map((r) => r.nick).join() === 'B2,A1,B1,A2', 'the final\'s places first');
  // Then the step players, by points: B3 (3 of 5) ahead of A3 (2 of 4), then B4 = A3? B4 2, A3 2 → shared; A4 1 = B5 1.
  const rest = v.standings.rows.slice(4).map((r) => r.nick + ':' + r.place);
  ok(rest[0] === 'B3:5' && v.standings.rows.find((r) => r.nick === 'A3').place === v.standings.rows.find((r) => r.nick === 'B4').place, 'then the others by points: B3, then A3 and B4 sharing a place');
}

// ── a points season and a final for the top 2 of the standings ─────
{
  const n1 = await tourney('Season 1', ['Ann', 'Bob', 'Cat', 'Dan']);
  const n2 = await tourney('Season 2', ['Cat', 'Bob', 'Ann', 'Dan']);
  const fin = await admin('/t/create', { name: 'Season final', profile: 'club' });
  const c = await admin('/cups/create', { name: 'Season', bestOf: 0 });
  await admin('/cups/event', { id: c.id, tournamentId: n1.id });
  await admin('/cups/event', { id: c.id, tournamentId: n2.id });
  await admin('/cups/event', { id: c.id, tournamentId: fin.id, final: true, fromStandings: 2, counts: false });
  // Ann 4+2=6, Bob 3+3=6, Cat 2+4=6, Dan 1+1=2: three tied on 6; best results: Ann 4, Cat 4, Bob 3 → Ann & Cat share 1st.
  let v = await admin('/cups/get?id=' + c.id);
  ok(row(v, 'Ann').place === 1 && row(v, 'Cat').place === 1 && row(v, 'Bob').place === 3, 'season: Ann and Cat first (6, best 4), Bob third (6, best 3)');
  const q = await admin('/cups/qualify', { id: c.id, index: 2 });
  const f = await admin('/t/get?id=' + fin.id);
  ok(q.ok && f.players.map((p) => p.nick).sort().join() === 'Ann,Cat', 'the final takes the top 2 of the standings');
  await admin('/t/result', { id: fin.id, source: 'manual', ranking: ['Cat', 'Ann'] });
  v = await admin('/cups/get?id=' + c.id);
  ok(v.standings.rows[0].nick === 'Cat' && v.standings.rows[1].nick === 'Ann' && row(v, 'Cat').total === 6 && v.standings.rows[2].nick === 'Bob', 'the final decides the winner (it gives no points: « counts » off); the others by points');
}

// ── private cup ────────────────────────────────────────────────────
{
  const c = await admin('/cups/create', { name: 'Club only', visibility: 'private' });
  ok((await pub('/c/' + c.publicKey)).status === 404 && (await pub('/c/' + c.publicKey + '?invite=' + c.inviteCode)).ok, 'private: with its invitation code only');
  ok(!(await pub('/cups')).cups.some((x) => x.name === 'Club only'), 'private: not listed');
}

svc.close(); srv.close();
rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nall arena-cups tests passed');
process.exit(fails ? 1 : 0);
