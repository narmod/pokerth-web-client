#!/usr/bin/env node
// Tests of the medals (service 0.14.0): the first three of a validated
// tournament (Club/Official/Custom, at least 4 players) and of a closed cup
// (at least 2 tournaments); shared places; no medal from Friendly, small or
// private tournaments, nor from the tables of a tournament on several tables;
// a correction moves a medal; the open API (one player, several, everyone,
// any origin); the player's page.
// Run: node arena/test/test-arena-badges.mjs
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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
const dir = mkdtempSync(join(tmpdir(), 'arena-bdg-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.311', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const A = { Authorization: 'Bearer master', 'Content-Type': 'application/json' };
const admin = async (p, b) => (await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: A, body: JSON.stringify(b) } : { headers: A })).json();
const api = async (p) => { const r = await fetch(base + '/arena/api' + p); const d = await r.json(); d.status = r.status; d.cors = r.headers.get('access-control-allow-origin'); return d; };
async function tourney(name, ranking, extra) {
  const t = await admin('/t/create', Object.assign({ name, profile: 'club' }, extra || {}));
  for (const n of ranking) await admin('/t/player', { id: t.id, nick: n });
  await admin('/t/result', { id: t.id, source: 'manual', ranking });
  return t;
}
const fresh = () => svc.manager.badges.clear();

// ── tournaments ────────────────────────────────────────────────────
const t1 = await tourney('Friday 1', ['Ann', 'Bob', 'Cat', 'Dan']);
await tourney('Friendly', ['Ann', 'Bob', 'Cat', 'Dan'], { profile: 'friendly' });
await tourney('Small', ['Dan', 'Cat', 'Bob']);
await tourney('Secret', ['Dan', 'Cat', 'Bob', 'Ann'], { visibility: 'private' });
const ul = await tourney('Link only', ['Eve', 'Ann', 'Bob', 'Cat'], { visibility: 'unlisted' });
{
  fresh();
  const ann = await api('/players/Ann');
  ok(ann.ok && ann.v === 1 && ann.cors === '*', 'API: open to any origin, versioned');
  ok(ann.counts.gold === 1 && ann.counts.silver === 1 && ann.counts.bronze === 0, 'Ann: gold (Friday 1), silver (Link only) — nothing from Friendly, Small (3 players) or Secret (private)');
  const g = ann.medals.find((m) => m.medal === 'gold');
  ok(g.kind === 'tournament' && g.name === 'Friday 1' && g.key === t1.publicKey && g.place === 1 && g.of === 4, 'a medal says where, which place of how many, with its link');
  ok(ann.medals.find((m) => m.name === 'Link only').key === null, 'unlisted: the medal, without the link');
  const bob = await api('/players/Bob');
  ok(!ann.results.some((x) => x.name === 'Secret') && bob.results.some((x) => x.name === 'Small' && x.place === 3) && bob.results.some((x) => x.name === 'Friendly'), 'results: every place (also without a medal), private tournaments left out');
  const dan = await api('/players/dan');
  ok(dan.nick === 'Dan' && dan.counts.gold + dan.counts.silver + dan.counts.bronze === 0, 'any case; Dan: no medal (4th; Small and Secret give none)');
  const nobody = await api('/players/' + encodeURIComponent('Zoé the unknown'));
  ok(nobody.ok && nobody.medals.length === 0 && nobody.nick === 'Zoé the unknown', 'an unknown player: an empty answer');
}
// Shared place: both get the medal.
{
  const t = await admin('/t/create', { name: 'Shared', profile: 'club' });
  for (const n of ['P1', 'P2', 'P3', 'P4', 'P5']) await admin('/t/player', { id: t.id, nick: n });
  // A log-like ranking with a tie for 2nd (set through the model: manual results have no ties).
  await admin('/t/result', { id: t.id, source: 'manual', ranking: ['P1', 'P2', 'P3', 'P4', 'P5'] });
  const f = join(dir, 'tournaments', t.id, 'tournament.json');
  const { readFileSync } = await import('node:fs');
  const j = JSON.parse(readFileSync(f, 'utf8'));
  j.result.ranking[2].place = 2; j.result.ranking[2].tie = true; j.result.ranking[1].tie = true;
  writeFileSync(f, JSON.stringify(j));
  fresh();
  ok((await api('/players/P2')).counts.silver === 1 && (await api('/players/P3')).counts.silver === 1 && (await api('/players/P4')).counts.bronze === 0, 'a shared 2nd place: both silver; no bronze for the 4th');
}
// A correction moves the medal.
{
  await admin('/t/correct', { id: t1.id, ranking: ['Bob', 'Ann', 'Cat', 'Dan'], reason: 'appeal' });
  fresh();
  ok((await api('/players/Bob')).medals.some((m) => m.name === 'Friday 1' && m.medal === 'gold') && (await api('/players/Ann')).medals.find((m) => m.name === 'Friday 1').medal === 'silver', 'a correction moves the medals (Bob gold, Ann silver)');
}
// No waiting: a new result shows at once (the medals are rebuilt when a tournament is saved).
{
  await api('/players/Gus');
  await tourney('Saturday', ['Gus', 'Hal', 'Ivy', 'Jo']);
  ok((await api('/players/Gus')).counts.gold === 1, 'a new validated result: the medal at once, not after the cache time');
}

// ── several tables: the tournament gives medals, its tables none ───
{
  const m = await admin('/t/create', { name: 'Big night', profile: 'club', format: 'multi', run: { finalists: 2 } });
  for (let i = 1; i <= 12; i++) await admin('/t/player', { id: m.id, nick: 'M' + String(i).padStart(2, '0') });
  const d = await admin('/t/draw', { id: m.id });
  for (const tb of d.stagesInfo.tables) await admin('/t/result', { id: tb.id, source: 'manual', ranking: tb.players });
  await svc.sweep();
  const f = await admin('/t/final', { id: m.id, open: false });
  await admin('/t/result', { id: f.stagesInfo.final.id, source: 'manual', ranking: f.stagesInfo.final.players });
  await svc.sweep();
  fresh();
  const w = f.stagesInfo.final.players[0];
  const me = await api('/players/' + w);
  ok(me.medals.length === 1 && me.medals[0].name === 'Big night' && me.medals[0].medal === 'gold', 'several tables: one gold for the tournament, nothing for winning a table or the final table');
}

// ── a cup ──────────────────────────────────────────────────────────
{
  const a = await tourney('League 1', ['Ann', 'Bob', 'Cat', 'Dan']);
  const b = await tourney('League 2', ['Cat', 'Ann', 'Bob', 'Dan']);
  const c = await admin('/cups/create', { name: 'Autumn league', bestOf: 0 });
  await admin('/cups/event', { id: c.id, tournamentId: a.id });
  fresh();
  const before = (await api('/players/Ann')).medals.filter((x) => x.kind === 'cup').length;
  await admin('/cups/close', { id: c.id });
  fresh();
  ok(before === 0 && !(await api('/players/Ann')).medals.some((x) => x.kind === 'cup'), 'a cup of one tournament: no cup medal, even closed');
  const c2 = await admin('/cups/create', { name: 'Winter league' });
  await admin('/cups/event', { id: c2.id, tournamentId: a.id });
  await admin('/cups/event', { id: c2.id, tournamentId: b.id });
  fresh();
  ok(!(await api('/players/Ann')).medals.some((x) => x.name === 'Winter league'), 'not closed yet: no cup medal');
  await admin('/cups/close', { id: c2.id });
  fresh();
  // Ann 4+3 = 7, Cat 2+4 = 6, Bob 3+2 = 5, Dan 2.
  const ann = await api('/players/Ann');
  ok(ann.medals[0].kind === 'cup' && ann.medals[0].name === 'Winter league' && ann.medals[0].medal === 'gold' && ann.medals[0].key === c2.publicKey, 'closed cup of two tournaments: Ann gold, listed first');
  ok((await api('/players/Cat')).medals.some((x) => x.name === 'Winter league' && x.medal === 'silver') && (await api('/players/Bob')).medals.some((x) => x.name === 'Winter league' && x.medal === 'bronze'), 'Cat silver, Bob bronze');
}

// ── several players at once; everyone ──────────────────────────────
{
  const many = await api('/badges?nicks=' + encodeURIComponent('Ann,Bob,Nobody,dan'));
  ok(many.ok && many.cors === '*' && many.players.Ann && many.players.Ann.counts.gold >= 1 && many.players.Ann.latest.length <= 3 && !many.players.Nobody && !many.players.Dan, 'several players (a lobby): only those with medals, counts and the latest three');
  const all = await api('/badges');
  ok(all.ok && all.players[0].nick === 'Ann' && all.rules.minPlayers === 4 && all.players.every((p) => p.counts.gold + p.counts.silver + p.counts.bronze > 0), 'everyone with a medal, most gold first, with the rules');
}

// ── the player's page ──────────────────────────────────────────────
{
  const p = await fetch(base + '/arena/p/' + encodeURIComponent('Ann'));
  ok(p.status === 200 && /public\.mjs/.test(await p.text()), 'the player\'s page: /arena/p/<nick>');
}

svc.close(); srv.close();
rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nall arena-badges tests passed');
process.exit(fails ? 1 : 0);
