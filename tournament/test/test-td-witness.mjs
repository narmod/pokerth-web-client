#!/usr/bin/env node
// Tests of the witnesses (service 0.7.0): a web client's public summary of a
// game, compared with the director's journal hand by hand, or with a ranking
// set without a director; the table lookup, the report through the API (a
// private tournament reached from its table), who counts, and « witnesses
// required »: one agrees and none disagrees, or the organizer gives a reason.
// Run: node tournament/test/test-td-witness.mjs
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys, Journal } from '../lib/journal.mjs';
import { cleanReport, directorFacts, compareWithDirector, compareWithRanking } from '../lib/witness.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// A small game as the director saw it: Bob out in hand 2, Cat in hand 3, Ann wins.
const EVENTS = [
  { type: 'gameInfo', gameId: 7, name: 'Cup', startMoney: 1000, maxPlayers: 4 },
  { type: 'playerName', id: 1, name: 'Ann' }, { type: 'playerName', id: 2, name: 'Bob' }, { type: 'playerName', id: 3, name: 'Cat' },
  { type: 'gameStart', seats: [1, 2, 3] },
  { type: 'handStart', seatStates: [0, 0, 0] },
  { type: 'money', id: 1, money: 1500 }, { type: 'money', id: 2, money: 500 },
  { type: 'handStart', seatStates: [0, 0, 0] },
  { type: 'money', id: 2, money: 0 }, { type: 'money', id: 1, money: 2000 },
  { type: 'handStart', seatStates: [0, 2, 0] },
  { type: 'money', id: 3, money: 0 }, { type: 'money', id: 1, money: 3000 },
  { type: 'endOfGame', winnerId: 1 },
];
const entries = EVENTS.map((data, i) => ({ seq: i + 1, type: 'game', data }));
// What a web client saw, in its compact form.
const GOOD = { players: ['Ann', 'Bob', 'Cat'], hands: [[1, 1000, 1000, 1000], [2, 1500, 500, 1000], [3, 2000, null, 1000]], winner: 'Ann', complete: true };

// ── comparison ─────────────────────────────────────────────────────
{
  const f = directorFacts(entries);
  ok(f.hands.size === 3 && f.hands.get(2).get('bob').stack === 500 && !f.hands.get(3).has('bob') && f.winner === 'Ann', 'director: stacks at the start of each hand, the winner, from its journal');
  const r = cleanReport(GOOD);
  ok(r.hands.length === 3 && r.hands[2].s.Ann === 2000 && !('Bob' in r.hands[2].s) && r.winner === 'Ann', 'report: the compact form read back');
  ok(compareWithDirector(r, f).verdict === 'agrees' && compareWithDirector(r, f).common === 3, 'the same game: agrees, 3 hands compared');
  const bad = cleanReport(Object.assign({}, GOOD, { hands: [[1, 1000, 1000, 1000], [2, 1500, 600, 1000]] }));
  const c = compareWithDirector(bad, f);
  ok(c.verdict === 'disagrees' && c.diff.hand === 2 && c.diff.nick === 'Bob' && c.diff.director === 500 && c.diff.witness === 600, 'a stack differs: disagrees, says where');
  ok(compareWithDirector(cleanReport({ players: ['Ann'], hands: [[1, 1000]], winner: 'Ann' }), f).verdict === 'disagrees', 'a player missing in a hand: disagrees');
  ok(compareWithDirector(cleanReport(Object.assign({}, GOOD, { winner: 'Cat' })), f).diff.winner === true, 'another winner: disagrees');
  ok(compareWithDirector(cleanReport({ players: ['Ann'], hands: [[9, 5]] }), f).verdict === 'nothing', 'no hand in common: nothing to compare');
  const late = cleanReport({ players: ['Ann', 'Cat'], hands: [[3, 2000, 1000]], winner: 'Ann' });
  ok(compareWithDirector(late, f).verdict === 'agrees', 'a witness who saw only the end agrees on what it saw');
  // Without a director: the ranking set by hand.
  const rk = [{ place: 1, nick: 'Ann' }, { place: 2, nick: 'Cat' }, { place: 3, nick: 'Bob' }];
  ok(compareWithRanking(r, rk).verdict === 'agrees', 'manual ranking: agrees with the order the witness saw');
  ok(compareWithRanking(r, [{ place: 1, nick: 'Ann' }, { place: 2, nick: 'Bob' }, { place: 3, nick: 'Cat' }]).diff.order === true, 'manual ranking: Bob before Cat, but Bob went out first: disagrees');
  ok(compareWithRanking(r, [{ place: 1, nick: 'Cat' }, { place: 2, nick: 'Ann' }, { place: 3, nick: 'Bob' }]).diff.winner === true, 'manual ranking: another winner: disagrees');
  let threw = 0;
  for (const x of [null, {}, { hands: 'x' }, { hands: new Array(3001).fill([1, 1]) , players: ['A'] }]) { try { cleanReport(x); } catch (e) { threw++; } }
  ok(threw === 4, 'garbage reports are refused');
  ok(cleanReport({ players: ['A', 'B'], hands: [[1, -5, 10], [2, 3, 3], [2, 4, 4], [0, 1, 1], [3, 1.5, 2]] }).hands.length === 1, 'bad hands are dropped (negative, repeated, 0, not whole)');
}

// ── through the service ────────────────────────────────────────────
const dir = mkdtempSync(join(tmpdir(), 'td-wit-'));
const keys = generateKeys();
writeFileSync(join(dir, 'td-key.pem'), keys.privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.305', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const A = { Authorization: 'Bearer master', 'Content-Type': 'application/json' };
const admin = async (p, b) => (await fetch(base + '/admin/tournaments' + p, b ? { method: 'POST', headers: A, body: JSON.stringify(b) } : { headers: A })).json();
const pub = async (p, b, ip) => {
  const r = await fetch(base + '/tournament/api' + p, b ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': ip || '10.0.0.1' }, body: JSON.stringify(b) } : {});
  const d = await r.json(); d.status = r.status; return d;
};
// A director at a table: its watch folder, as the manager keeps it.
function fakeWatch(wid, gameId, tableName, status) {
  const w = join(dir, 'watches', wid);
  mkdirSync(w, { recursive: true });
  writeFileSync(join(w, 'meta.json'), JSON.stringify({ id: wid, mode: 'host', startedAt: Date.now() }));
  writeFileSync(join(w, 'state.json'), JSON.stringify({ id: wid, status: status || 'running', host: { gameId, tableName, phase: 'watch' }, logs: [] }));
  writeFileSync(join(w, 'journal.json'), JSON.stringify({ entries }));
}

// Club (witnesses informative), director at the table.
{
  const t = await admin('/t/create', { name: 'Club cup', profile: 'club' });
  for (const n of ['Ann', 'Bob', 'Cat']) await admin('/t/player', { id: t.id, nick: n });
  ok((await pub('/table?game=7&name=Cup')).status === 404, 'lookup: no table yet');
  fakeWatch('wclub01', 7, 'Club cup');
  svc.manager.tournaments.hostOpened(t.id, 'wclub01', {}, 'admin');
  const lk = await pub('/table?game=7&name=' + encodeURIComponent('Club cup'));
  ok(lk.ok && lk.key === t.publicKey && lk.witnesses === 'informative' && (await pub('/table?game=8&name=Club%20cup')).status === 404, 'lookup: the table by game id and name → the tournament, its witness setting');
  const r1 = await pub('/t/' + t.publicKey + '/witness', { nick: 'bob', game: 7, name: 'Club cup', report: GOOD });
  ok(r1.ok && r1.nick === 'Bob' && r1.verdict === 'agrees', 'report: from a player, compared with the director: agrees');
  ok((await pub('/t/' + t.publicKey + '/witness', { nick: 'Zed', report: GOOD })).code === 'notPlayer', 'only the tournament\'s players are witnesses');
  ok((await pub('/t/' + t.publicKey + '/witness', { nick: 'Cat', report: { players: ['Ann'], hands: [] } })).code === 'badReport', 'an empty report is refused');
  const r2 = await pub('/t/' + t.publicKey + '/witness', { nick: 'Cat', report: Object.assign({}, GOOD, { hands: [[1, 1000, 1000, 1000], [2, 1500, 600, 1000]] }) });
  ok(r2.ok && r2.verdict === 'disagrees', 'a report that differs: disagrees');
  const g = await pub('/t/' + t.publicKey);
  ok(g.witnesses && g.witnesses.agree === 1 && g.witnesses.disagree === 1 && g.witnesses.list.length === 2 && g.witnesses.mode === 'informative', 'public page: the witnesses and their verdicts');
  const o = await admin('/t/get?id=' + t.id);
  ok(o.witnesses.find((w) => w.nick === 'Cat').diff.hand === 2 && o.history.some((h) => h.type === 'witnessReport' && /Bob: 3 hands, winner Ann — agrees/.test(h.summary)), 'organizer: where they differ; the journal keeps each report (its fingerprint)');
  const again = await pub('/t/' + t.publicKey + '/witness', { nick: 'Cat', report: GOOD });
  ok(again.verdict === 'agrees' && (await pub('/t/' + t.publicKey)).witnesses.total === 2, 'a new report from the same player: the same hands are replaced');
  // A client reloaded mid-game sends only the hands since: added to the earlier ones.
  await pub('/t/' + t.publicKey + '/witness', { nick: 'Ann', game: 7, name: 'Club cup', report: { players: ['Ann', 'Bob', 'Cat'], hands: [[1, 1000, 1000, 1000]] } });
  await pub('/t/' + t.publicKey + '/witness', { nick: 'Ann', game: 7, name: 'Club cup', report: { players: ['Ann', 'Cat'], hands: [[3, 2000, 1000]], winner: 'Ann', complete: true } });
  const ann = (await admin('/t/get?id=' + t.id)).witnesses.find((w) => w.nick === 'Ann');
  ok(ann.hands === 2 && ann.from === 1 && ann.to === 3 && ann.common === 2 && ann.verdict === 'agrees', 'reports of the same player add up (hands 1 and 3)');
}

// Private tournament: the report comes from its table, without the invitation code.
{
  const t = await admin('/t/create', { name: 'Private cup', profile: 'club', visibility: 'private' });
  for (const n of ['Ann', 'Bob', 'Cat']) await admin('/t/player', { id: t.id, nick: n });
  fakeWatch('wpriv01', 9, 'Private cup');
  svc.manager.tournaments.hostOpened(t.id, 'wpriv01', {}, 'admin');
  ok((await pub('/t/' + t.publicKey + '/witness', { nick: 'Ann', report: GOOD })).status === 404, 'private: no report from anywhere');
  ok((await pub('/t/' + t.publicKey + '/witness', { nick: 'Ann', game: 9, name: 'Private cup', report: GOOD })).ok, 'private: a report from its table is taken');
  ok((await pub('/t/' + t.publicKey + '/witness', { nick: 'Ann', game: 9, name: 'Other', report: GOOD })).status === 404, 'private: not with another table name');
}

// Off: no reports.
{
  const t = await admin('/t/create', { name: 'Friendly', profile: 'friendly' });
  await admin('/t/player', { id: t.id, nick: 'Ann' });
  svc.manager.tournaments.hostOpened(t.id, 'wclub01', {}, 'admin');
  ok((await pub('/t/' + t.publicKey + '/witness', { nick: 'Ann', report: GOOD })).code === 'noWitness' && (await pub('/t/' + t.publicKey)).witnesses === null, 'witnesses off (friendly): no report taken, nothing shown');
}

// Official: witnesses required, identity « code »; manual result.
{
  const t = await admin('/t/create', { name: 'Official', profile: 'official' });
  const codes = {};
  for (const n of ['Ann', 'Bob', 'Cat']) codes[n] = (await admin('/t/player', { id: t.id, nick: n })).issuedCode.code;
  ok((await pub('/t/' + t.publicKey + '/witness', { nick: 'Ann', report: GOOD })).code === 'noTable', 'no report before a table or a result');
  await admin('/t/result', { id: t.id, source: 'manual', ranking: ['Ann', 'Cat', 'Bob'] });
  let v = await admin('/t/validate', { id: t.id });
  ok(!v.ok && /no witness agrees yet/.test(v.error), 'required: no validation without a witness');
  const un = await pub('/t/' + t.publicKey + '/witness', { nick: 'Bob', report: GOOD });
  ok(un.ok && un.verdict === 'agrees' && !(await pub('/t/' + t.publicKey)).witnesses.list[0].counts, 'identity « code »: a report without the personal code is shown, does not count');
  ok((await pub('/t/' + t.publicKey + '/witness', { nick: 'Cat', code: 'ABCDEFGH', report: GOOD })).code === 'badCode', 'a wrong code is refused');
  const vr = await pub('/t/' + t.publicKey + '/witness', { nick: 'Cat', code: codes.Cat, report: GOOD });
  ok(vr.ok && (await pub('/t/' + t.publicKey)).witnesses.agree === 1, 'with the personal code: counts, agrees');
  v = await admin('/t/validate', { id: t.id });
  ok(v.ok && v.status === 'validated' && !v.witnessOverride, 'required: validated once one agrees and none disagrees');
  ok((await pub('/t/' + t.publicKey + '/witness', { nick: 'Ann', code: codes.Ann, report: GOOD })).code === 'closed_finished', 'no report once validated');
  // A contested result: the organizer validates anyway, with a reason.
  const t2 = await admin('/t/create', { name: 'Official 2', profile: 'official' });
  const c2 = (await admin('/t/player', { id: t2.id, nick: 'Ann' })).issuedCode.code;
  for (const n of ['Bob', 'Cat']) await admin('/t/player', { id: t2.id, nick: n });
  await admin('/t/result', { id: t2.id, source: 'manual', ranking: ['Ann', 'Bob', 'Cat'] });
  const d2 = await pub('/t/' + t2.publicKey + '/witness', { nick: 'Ann', code: c2, report: GOOD });
  ok(d2.verdict === 'disagrees', 'a witness disagrees with the typed ranking');
  v = await admin('/t/validate', { id: t2.id });
  ok(!v.ok && /1 disagree/.test(v.error), 'required: refused while a witness disagrees');
  v = await admin('/t/validate', { id: t2.id, override: 'checked the log with both players' });
  ok(v.ok && v.status === 'validated' && v.witnessOverride.reason === 'checked the log with both players' && v.history.some((h) => h.type === 'validated'), 'the organizer validates anyway with a reason, kept');
}

// Custom: automatic validation that waits for its witnesses.
{
  const t = await admin('/t/create', { name: 'Auto wait', profile: 'custom', settings: { identity: 'simple', witnesses: 'required', validation: 'auto', corrections: 'free', visibility: 'public', archiveDays: 0, collusion: 'off' } });
  for (const n of ['Ann', 'Bob', 'Cat']) await admin('/t/player', { id: t.id, nick: n });
  const s = await admin('/t/result', { id: t.id, source: 'manual', ranking: ['Ann', 'Cat', 'Bob'] });
  ok(s.status === 'finished', 'automatic validation waits for a witness');
  await pub('/t/' + t.publicKey + '/witness', { nick: 'Bob', report: GOOD });
  ok((await admin('/t/get?id=' + t.id)).status === 'validated', 'then validates by itself when one agrees');
}

// Rate limit.
{
  const t = await admin('/t/create', { name: 'Flood', profile: 'club' });
  await admin('/t/player', { id: t.id, nick: 'Ann' });
  const st = [];
  for (let i = 0; i < 62; i++) st.push((await pub('/t/' + t.publicKey + '/witness', { nick: 'Ann', report: GOOD }, '10.7.7.7')).status);
  ok(st.slice(0, 60).every((x) => x !== 429) && st[60] === 429, 'sixty reports per address in ten minutes, then 429');
}

svc.close(); srv.close();
rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nall td-witness tests passed');
process.exit(fails ? 1 : 0);
