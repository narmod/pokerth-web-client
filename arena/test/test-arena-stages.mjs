#!/usr/bin/env node
// Tests of tournaments on several tables (service 0.12.0): up to 40 players,
// the draw into tables of at most 10 (checked-in players only; flagged pairs
// kept apart with « separate »), each table a Sit & Go of its own, the final
// table with the first N of each, the tournament's ranking (final, then the
// same place at the other tables shared), sealed; a table corrected later;
// what players see; the witness lookup's parent key.
// Run: node arena/test/test-arena-stages.mjs
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const dir = mkdtempSync(join(tmpdir(), 'arena-stg-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.309', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const A = { Authorization: 'Bearer master', 'Content-Type': 'application/json' };
const admin = async (p, b) => (await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: A, body: JSON.stringify(b) } : { headers: A })).json();
const pub = async (p) => (await fetch(base + '/arena/api' + p)).json();
const T = svc.manager.tournaments;
const nicks = (n, pre) => Array.from({ length: n }, (_, i) => (pre || 'P') + String(i + 1).padStart(2, '0'));

// ── a club tournament on three tables ──────────────────────────────
let t, info;
{
  t = await admin('/t/create', { name: 'Autumn cup', profile: 'club', format: 'multi', run: { finalists: 2 } });
  ok(t.format === 'multi' && t.run.finalists === 2, 'created: several tables, two finalists per table');
  for (const n of nicks(23)) await admin('/t/player', { id: t.id, nick: n });
  const card = (await pub('/list')).tournaments.find((x) => x.name === 'Autumn cup');
  ok(card.maxPlayers === 40 && card.players === 23, 'up to 40 players (4 tables)');
  ok(!(await admin('/t/table/open', { id: t.id })).ok, 'not opened as one table');
  const d = await admin('/t/draw', { id: t.id });
  ok(d.ok && d.stagesInfo.tables.length === 3 && d.stagesInfo.tables.map((x) => x.players.length).sort().join() === '7,8,8', 'drawn: 23 players on 3 tables (8, 8, 7)');
  const all = d.stagesInfo.tables.flatMap((x) => x.players);
  ok(new Set(all).size === 23 && d.history.some((h) => h.type === 'tablesDrawn'), 'everyone once, the draw in the journal');
  ok(!(await admin('/t/draw', { id: t.id })).ok && !(await admin('/t/player', { id: t.id, nick: 'Late' })).ok, 'drawn once; no more players');
  const p = await pub('/t/' + t.publicKey);
  ok(p.phase === 'table' && p.multi.tables.length === 3 && p.multi.tables[0].key && p.closedBecause === 'tableOpen', 'players\' page: the tables, registration closed');
  ok(!(await pub('/list')).tournaments.some((x) => /— table/.test(x.name)), 'the tables are not listed on their own');
  const c1 = await pub('/t/' + p.multi.tables[0].key);
  ok(c1.ok && c1.parent && c1.parent.key === t.publicKey && c1.stage.kind === 'qualifier', 'a table\'s page links back to its tournament');
  info = d.stagesInfo;
}

// ── results of the tables, the final, the tournament's ranking ─────
{
  for (const tb of info.tables) await admin('/t/result', { id: tb.id, source: 'manual', ranking: tb.players });   // club: validated at once
  await svc.sweep();
  let v = await admin('/t/get?id=' + t.id);
  ok(v.stagesInfo.allValidated && v.stagesInfo.finalists.length === 6 && !v.stagesInfo.final, 'every table validated: six finalists known; the final waits for the organizer (not opening by itself)');
  const f = await admin('/t/final', { id: t.id, open: false });
  ok(f.ok && f.stagesInfo.final && f.stagesInfo.final.players.length === 6, 'the final table: the first two of each table');
  ok(f.stagesInfo.final.players.join() === info.tables.flatMap((x) => x.players.slice(0, 2)).join(), 'finalists in table order');
  ok(!(await admin('/t/final', { id: t.id })).ok, 'one final table');
  const finalOrder = f.stagesInfo.final.players.slice().reverse();
  await admin('/t/result', { id: f.stagesInfo.final.id, source: 'manual', ranking: finalOrder });
  await svc.sweep();
  v = await admin('/t/get?id=' + t.id);
  const r = v.result;
  ok(v.status === 'validated' && r.source === 'stages' && v.checks.signature, 'final validated: the tournament\'s ranking, validated and signed');
  ok(r.ranking.slice(0, 6).map((x) => x.nick).join() === finalOrder.join() && r.ranking[0].winner, 'places 1–6: the final table');
  const third = r.ranking.filter((x) => x.place === 7);
  ok(third.length === 3 && third.every((x) => x.tie && x.tablePlace === 3), 'place 7 shared by the three thirds of their tables');
  ok(r.ranking.length === 23 && r.ranking[r.ranking.length - 1].tablePlace === 8, 'everyone ranked (the eighths last)');
  ok(!(await admin('/t/correct', { id: t.id, ranking: r.ranking.map((x) => x.nick), reason: 'nope' })).ok, 'the ranking is corrected at its table, not here');
  // A table corrected afterwards: the tournament's ranking follows.
  const tb1 = info.tables[0];
  const swapped = tb1.players.slice(); const x = swapped[2]; swapped[2] = swapped[3]; swapped[3] = x;
  await admin('/t/correct', { id: tb1.id, ranking: swapped, reason: 'appeal at table 1' });
  v = await admin('/t/get?id=' + t.id);
  ok(v.result.corrected && v.result.ranking.find((y) => y.nick === swapped[2]).tablePlace === 3 && v.history.some((h) => h.type === 'stagesRecomputed') && v.checks.signature, 'a table corrected later: the ranking recomputed and signed again');
  const pp = await pub('/t/' + t.publicKey);
  ok(pp.phase === 'validated' && pp.multi.final.winner === finalOrder[0], 'players\' page: the final and its winner');
}

// ── Official: checked-in players only; flagged pairs kept apart ────
{
  // An earlier tournament flagged P01–P02 and P03–P04.
  const old = await admin('/t/create', { name: 'Old', profile: 'club' });
  const f = join(dir, 'tournaments', old.id, 'tournament.json');
  const j = JSON.parse(readFileSync(f, 'utf8'));
  j.collusion = { pairs: [{ a: 'Q01', b: 'Q02', level: 'flag' }, { a: 'Q03', b: 'Q04', level: 'flag' }] };
  writeFileSync(f, JSON.stringify(j));
  const o = await admin('/t/create', { name: 'Official cup', profile: 'official', format: 'multi' });
  for (const n of nicks(14, 'Q')) await admin('/t/player', { id: o.id, nick: n });
  for (const n of nicks(12, 'Q')) await admin('/t/checkin', { id: o.id, nick: n });
  const d = await admin('/t/draw', { id: o.id });
  ok(d.ok && d.stagesInfo.tables.length === 2 && d.stagesInfo.tables.flatMap((x) => x.players).length === 12, 'only the twelve checked-in players are drawn');
  ok(d.players.filter((p) => p.absent).map((p) => p.nick).join() === 'Q13,Q14', 'the others are absent');
  const same = (a, b) => d.stagesInfo.tables.some((x) => x.players.includes(a) && x.players.includes(b));
  ok(!same('Q01', 'Q02') && !same('Q03', 'Q04') && d.history.some((h) => /flagged pairs kept apart: all/.test(h.summary)), '« separate »: pairs flagged before are at different tables');
  const child = await admin('/t/get?id=' + d.stagesInfo.tables[0].id);
  ok(child.players.every((p) => p.checkedIn) && child.parent.id === o.id && child.settings.identity === 'code', 'a table keeps the identity, the check-in and the personal codes');
  // The witness lookup of a table gives its tournament's key (the code was kept under it).
  const w = join(dir, 'watches', 'wstg0001');
  mkdirSync(w, { recursive: true });
  writeFileSync(join(w, 'meta.json'), JSON.stringify({ id: 'wstg0001', mode: 'host', startedAt: Date.now() }));
  writeFileSync(join(w, 'state.json'), JSON.stringify({ id: 'wstg0001', status: 'running', host: { gameId: 12, tableName: child.name }, logs: [] }));
  T.hostOpened(child.id, 'wstg0001', {}, 'admin');
  const lk = await pub('/table?game=12&name=' + encodeURIComponent(child.name));
  ok(lk.ok && lk.key === child.publicKey && lk.parentKey === o.publicKey, 'witness lookup: the table, and its tournament\'s key');
  const few = await admin('/t/create', { name: 'Small', profile: 'club', format: 'multi' });
  for (const n of nicks(9, 'S')) await admin('/t/player', { id: few.id, nick: n });
  ok(/one table is enough/.test((await admin('/t/draw', { id: few.id })).error), 'ten players or fewer: one table is enough');
}

svc.close(); srv.close();
rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nall arena-stages tests passed');
process.exit(fails ? 1 : 0);
