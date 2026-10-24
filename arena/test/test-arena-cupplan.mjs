#!/usr/bin/env node
// Tests of a cup's programme (service 0.23.0): the four ways a cup runs, the
// tournaments it makes (or the organizer makes from dated slots), registering
// once for the cup (every tournament, or the one picked), a player who
// leaves one tournament, the final from the standings, the cup closing by
// itself; changing the programme afterwards; the routes and who may use them.
// Run: node arena/test/test-arena-cupplan.mjs
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';
import { cleanPlan, eventsOf, slotName } from '../lib/cupplan.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const throws = (fn) => { try { fn(); return null; } catch (e) { return e.message; } };
const refuse = (m) => { throw new Error(m); };
const H = 3600e3, D = 24 * H;
const base0 = Math.round((Date.now() + 10 * D) / 60000) * 60000;   // far enough: nothing opens by itself
const days = (n, from) => Array.from({ length: n }, (_, i) => (from || base0) + i * 7 * D);

// ── pure checks (cupplan.mjs) ──────────────────────────────────────
ok(/pick how/.test(throws(() => cleanPlan({}, null, () => false, refuse))), 'a format is needed');
ok(/follow one another/.test(throws(() => cleanPlan({ format: 'series', series: [base0 + D, base0] }, null, () => false, refuse))), 'dates in order');
ok(/after the last/.test(throws(() => cleanPlan({ format: 'seriesFinal', series: days(2), final: { at: base0, top: 4 } }, null, () => false, refuse))), 'the final after the series');
ok(/would receive 12/.test(throws(() => cleanPlan({ format: 'stages', steps: [{ dates: days(4), qualify: 3 }, { dates: [base0 + 40 * D], qualify: 2 }, { dates: [base0 + 50 * D] }] }, null, () => false, refuse))), 'steps: a one-table tournament cannot receive 12');
{
  const { plan } = cleanPlan({ format: 'stages', steps: [{ dates: days(3), qualify: 2 }, { dates: [base0 + 30 * D, base0 + 31 * D], qualify: 2 }, { dates: [base0 + 40 * D] }] }, null, () => false, refuse);
  plan.slots.forEach((s, i) => { s.tournamentId = 't' + i; });
  const ev = eventsOf(plan, []);
  ok(ev.length === 6 && ev[0].next === 3 && ev[1].next === 4 && ev[2].next === 3 && ev[3].next === 5 && ev[4].next === 5 && ev[5].final, 'steps: #n of a step feeds #(n mod k) of the next, up to the final');
  ok(slotName('A cup with a rather long name, longer than sixty characters', plan.slots[0]).length <= 60, 'tournament names fit in 60');
}

// ── the service ────────────────────────────────────────────────────
const dir = mkdtempSync(join(tmpdir(), 'arena-cupplan-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.320', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const call = async (p, b, tok) => { const r = await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer ' + (tok || 'master'), 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer ' + (tok || 'master') } }); const d = await r.json(); d.http = r.status; return d; };
const pub = async (key, b) => { const r = await fetch(base + '/arena/api/c/' + key, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.' + (1 + Math.floor(Math.random() * 200)) }, body: JSON.stringify(b) }); const d = await r.json(); d.http = r.status; return d; };
const pubT = async (key, op, b) => (await fetch(base + '/arena/api/t/' + key + '/' + op, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '203.0.113.' + (1 + Math.floor(Math.random() * 200)) }, body: JSON.stringify(b) })).json();
const C = svc.manager.cups, T = svc.manager.tournaments;
const result = (tid, ranking) => call('/t/result', { id: tid, source: 'manual', ranking });
const common = { profile: 'club', autoOpen: false, server: { ref: 'local', name: 'Local', host: '127.0.0.1', port: 7234 } };

// A. Series, made by the cup, registration for the cup.
{
  const c = await call('/cups/create', { name: 'Autumn series', plan: { format: 'series', create: 'auto', registration: 'cup', series: days(3), common: Object.assign({}, common, { autoOpen: true }) } });
  const p = c.planView;
  ok(c.ok && p && p.slots.length === 3 && p.slots.every((s) => s.tournamentId && s.auto), 'series: the cup makes its three tournaments');
  const t1 = T.get(p.slots[0].tournamentId);
  ok(t1.name === 'Autumn series #1' && t1.startsAt === days(3)[0] && t1.run.autoOpen && !t1.run.selfRegister && t1.format === 'sitngo' && t1.server.ref === 'local', 'each: its name, its date, opened by the director, no registration of its own');
  ok(c.events.length === 3 && c.events.every((e) => e.counts && !e.final), 'events: three counted tournaments');
  const key = c.publicKey;
  const regs = {};
  for (const n of ['Ann', 'Ben', 'Cid', 'Dan']) { const r = await pub(key, { op: 'register', nick: n }); regs[n] = r.code; }
  ok(Object.values(regs).every((x) => /^[A-Z2-9]{8}$/.test(x)), 'registering for the cup: a personal code each');
  ok(p.slots.every((s) => T.get(s.tournamentId).players.length === 4), 'registered once: in every tournament of the cup');
  ok((await pub(key, { op: 'register', nick: 'ann' })).code === 'taken', 'the same nickname twice: refused');
  // The cup's code works on a tournament's page: Dan leaves #2 only.
  const k2 = T.get(p.slots[1].tournamentId).publicKey;
  const un = await pubT(k2, 'unregister', { nick: 'Dan', code: regs.Dan });
  ok(un.ok && T.get(p.slots[1].tournamentId).players.length === 3, 'the cup\'s code on a tournament: Dan leaves #2');
  C.tick();
  ok(T.get(p.slots[1].tournamentId).players.length === 3 && T.get(p.slots[2].tournamentId).players.length === 4, 'he is not put back in #2, still in #3');
  const pg = await (await fetch(base + '/arena/api/c/' + key)).json();
  ok(pg.plan && pg.plan.slots.length === 3 && pg.plan.registrationState.mode === 'cup' && pg.plan.registrationState.count === 4 && pg.plan.next === p.slots[0].key && pg.from === days(3)[0] && pg.to === days(3)[2], 'public page: the programme, the next date, from … to …, registered players');
  const tp = await (await fetch(base + '/arena/api/t/' + T.get(p.slots[0].tournamentId).publicKey)).json();
  ok(tp.closedBecause === 'organizer' && tp.cups && tp.cups[0].register === true, 'a tournament of the cup: its page sends players to the cup\'s registration');
  const og = await call('/cups/get?id=' + c.id);
  ok(og.registrants.length === 4 && !JSON.stringify(og).includes('codeHash'), 'organizer view: the players, never their code\'s hash');
  // Capacity: one table → 10.
  for (let i = 0; i < 6; i++) await pub(key, { op: 'register', nick: 'P' + i });
  ok((await pub(key, { op: 'register', nick: 'Late' })).code === 'closed_full', 'one table: 10 players at most');
  ok((await pub(key, { op: 'unregister', nick: 'P5', code: 'WRONGCOD' })).code === 'badCode', 'leaving the cup needs the code');
  // Results, then the cup closes by itself.
  const all10 = ['Ann', 'Ben', 'Cid', 'Dan', 'P0', 'P1', 'P2', 'P3', 'P4', 'P5'];
  await result(p.slots[0].tournamentId, all10);
  await result(p.slots[1].tournamentId, all10.filter((n) => n !== 'Dan'));
  C.tick();
  ok(C.get(c.id).status === 'open', 'not closed while a tournament is missing');
  await result(p.slots[2].tournamentId, all10.slice().reverse());
  C.tick();
  const done = C.get(c.id);
  ok(done.status === 'closed' && done.checks.signature && done.history.some((h) => /by itself/.test(h.summary)), 'every result in: the cup closes by itself, standings signed');
  ok(!(await call('/cups/plan', { id: c.id, plan: { format: 'series', series: days(3) } })).ok, 'a closed cup: its programme stays');
}

// B. Series + final from the standings.
{
  const c = await call('/cups/create', { name: 'Winter league', plan: { format: 'seriesFinal', create: 'auto', registration: 'tournament', series: days(2), final: { at: base0 + 20 * D, top: 3 }, common } });
  const [s1, s2, f] = c.planView.slots;
  ok(f.kind === 'final' && T.get(f.tournamentId).name === 'Winter league – final' && T.get(s1.tournamentId).run.selfRegister && !T.get(f.tournamentId).run.selfRegister, 'series + final: registration per tournament, none for the final');
  ok(c.events[2].final && c.events[2].fromStandings === 3 && !c.events[2].counts, 'the final takes the top 3 of the standings');
  for (const n of ['A', 'B', 'C', 'D']) { await call('/t/player', { id: s1.tournamentId, nick: n }); await call('/t/player', { id: s2.tournamentId, nick: n }); }
  await result(s1.tournamentId, ['A', 'B', 'C', 'D']);
  C.tick();
  ok(T.get(f.tournamentId).players.length === 0, 'the series not over: the final waits');
  await result(s2.tournamentId, ['B', 'A', 'C', 'D']);   // C third alone (a shared place would take both)
  C.tick();
  const fin = T.get(f.tournamentId);
  ok(fin.players.length === 3 && ['A', 'B'].every((n) => fin.players.some((p) => p.nick === n)), 'the series validated: the top 3 are in the final, by themselves');
  await result(f.tournamentId, fin.players.map((p) => p.nick));
  C.tick();
  ok(C.get(c.id).status === 'closed', 'the final validated: the cup closes');
  // An hour before the final at the latest, even with a result missing.
  const soon = Math.round((Date.now() + 30 * 60000) / 60000) * 60000;
  const late = await call('/cups/create', { name: 'Late league', plan: { format: 'seriesFinal', create: 'auto', series: [soon - 3 * D, soon - 2 * D], final: { at: soon, top: 2 }, common } });
  const [l1, , lf] = late.planView.slots;
  for (const n of ['A', 'B', 'C']) await call('/t/player', { id: l1.tournamentId, nick: n });
  await result(l1.tournamentId, ['C', 'B', 'A']);
  C.tick();
  const lv = C.get(late.id);
  ok(T.get(lf.tournamentId).players.map((p) => p.nick).join(',') === 'C,B' && lv.history.some((h) => /not validated yet: #2/.test(h.summary)), 'an hour before the final: the top 2 go in, the missing result is noted');
  const big = await call('/cups/create', { name: 'Big league', plan: { format: 'seriesFinal', create: 'auto', series: days(1), final: { at: base0 + 9 * D, top: 12 }, common } });
  ok(T.get(big.planView.slots[1].tournamentId).format === 'multi', 'a final for 12: on several tables');
}

// C. Steps, the player picks his date.
{
  const c = await call('/cups/create', { name: 'Spring steps', plan: { format: 'stages', create: 'auto', registration: 'cup', stageEntry: 'choose',
    steps: [{ dates: days(2), qualify: 2 }, { dates: [base0 + 30 * D] }], common } });
  const [a, b, f] = c.planView.slots;
  const key = c.publicKey;
  ok((await pub(key, { op: 'register', nick: 'Zed' })).code === 'pickDate', 'choose: the date is needed');
  const r1 = await pub(key, { op: 'register', nick: 'Zed', choice: a.key });
  await pub(key, { op: 'register', nick: 'Yan', choice: a.key });
  await pub(key, { op: 'register', nick: 'Xia', choice: b.key });
  await pub(key, { op: 'register', nick: 'Wil', choice: b.key });
  ok(T.get(a.tournamentId).players.length === 2 && T.get(b.tournamentId).players.length === 2 && T.get(f.tournamentId).players.length === 0, 'each in the tournament he picked; nobody in the final');
  const ch = await pub(key, { op: 'choose', nick: 'Zed', code: r1.code, choice: b.key });
  ok(ch.ok && T.get(a.tournamentId).players.length === 1 && T.get(b.tournamentId).players.length === 3, 'changing the date: moved from one to the other');
  const pv = (await (await fetch(base + '/arena/api/c/' + key)).json()).plan.registrationState;
  ok(pv.choose && pv.choices.length === 2 && pv.choices[1].taken === 3, 'public page: the dates to pick and how many in each');
  await call('/t/player', { id: a.tournamentId, nick: 'Vic' });
  await result(a.tournamentId, ['Yan', 'Vic']);
  await result(b.tournamentId, ['Xia', 'Zed', 'Wil']);
  C.tick();
  const fp = T.get(f.tournamentId).players.map((p) => p.nick).sort().join(',');
  ok(fp === 'Vic,Xia,Yan,Zed', 'the first 2 of each step tournament go to the final');
  await result(f.tournamentId, ['Zed', 'Yan', 'Xia', 'Vic']);
  C.tick();
  const cc = C.get(c.id);
  ok(cc.status === 'closed' && cc.standings.rows[0].nick === 'Zed', 'the final decides, the cup closes');
}

// D. One tournament on several tables; E. the organizer makes them.
{
  const one = await call('/cups/create', { name: 'Grand night', plan: { format: 'single', create: 'auto', tables: 'several', single: { at: base0 }, common } });
  ok(T.get(one.planView.slots[0].tournamentId).format === 'multi' && one.events[0].final, 'one tournament, several tables');
  const org = await call('/cups/create', { name: 'Hand made', plan: { format: 'series', create: 'organizer', registration: 'cup', series: days(2), common } });
  ok(org.planView.slots.every((s) => !s.tournamentId) && !org.events.length, 'organizer: dated slots, no tournament yet');
  const r = await pub(org.publicKey, { op: 'register', nick: 'Early' });
  ok(r.ok, 'registering before any tournament exists');
  const mk = await call('/cups/slot/create', { id: org.id, key: '1-1' });
  ok(mk.ok && mk.planView.slots[0].tournamentId && !mk.planView.slots[0].auto && T.get(mk.planView.slots[0].tournamentId).players.some((p) => p.nick === 'Early'), 'made from the slot: the cup\'s settings, the registered player in it');
  const mine = await call('/t/create', { name: 'My own night', profile: 'club', startsAt: base0 + 3 * D });
  const at = await call('/cups/slot/attach', { id: org.id, key: '1-2', tournamentId: mine.id });
  ok(at.ok && T.get(mine.id).startsAt === days(2)[1], 'a tournament of his own attached: it takes the date');
  ok(!(await call('/cups/slot/attach', { id: org.id, key: '1-2', tournamentId: mine.id })).ok, 'a date with its tournament: no second one');
  const dt = await call('/cups/slot/detach', { id: org.id, key: '1-2' });
  ok(dt.ok && !dt.planView.slots[1].tournamentId && T.get(mine.id), 'detached: the tournament stays, out of the cup');
  ok(!(await call('/cups/event', { id: org.id, tournamentId: mine.id })).ok, 'a cup with a programme: no tournament added by hand');
}

// F. Changing the programme afterwards.
{
  const c = await call('/cups/create', { name: 'Moving dates', plan: { format: 'series', create: 'auto', series: days(3), common } });
  const ids = c.planView.slots.map((s) => s.tournamentId);
  const moved = [days(3)[0] + H, days(3)[1]];
  const up = await call('/cups/plan', { id: c.id, plan: { format: 'series', create: 'auto', series: moved, common: Object.assign({}, common, { openBefore: 25 }) } });
  ok(up.ok && T.get(ids[0]).startsAt === moved[0] && T.get(ids[0]).run.openBefore === 25, 'a date moved, a setting changed: the tournament follows');
  ok(up.planView.slots.length === 2 && !T.list().some((t) => t.id === ids[2]), 'a date taken off: the cup\'s tournament goes (nothing had started)');
  await call('/t/player', { id: ids[0], nick: 'A' }); await call('/t/player', { id: ids[0], nick: 'B' });
  await result(ids[0], ['A', 'B']);
  const no = await call('/cups/plan', { id: c.id, plan: { format: 'series', series: [moved[0] + H, moved[1]], common } });
  ok(!no.ok && /has started/.test(no.error), 'a tournament played: its date stays');
  const no2 = await call('/cups/plan', { id: c.id, plan: { format: 'single', single: { at: moved[1] }, common } });
  ok(!no2.ok && /has started/.test(no2.error), 'nor can it be taken off');
  const manual = await call('/cups/create', { name: 'Old style' });
  await call('/cups/event', { id: manual.id, tournamentId: ids[1] });
  ok(/added by hand/.test((await call('/cups/plan', { id: manual.id, plan: { format: 'series', series: days(1) } })).error), 'a cup made the old way keeps its way');
}

// G. Who may.
{
  const acc = await call('/accounts/create', { login: 'remi', name: 'Rémi', role: 'referee' });
  const sess = (await (await fetch(base + '/arena/api/account/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: acc.invite, password: 'referee password 1' }) })).json()).token;
  const c = await call('/cups/create', { name: 'Referee test' });
  const r = await call('/cups/plan', { id: c.id, plan: { format: 'series', series: days(1) } }, sess);
  ok(r.http === 403 && r.code === 'role', 'a referee: no programme');
  ok((await pub(c.publicKey, { op: 'register', nick: 'Nope' })).code === 'noCupRegistration', 'no programme: no registration for the cup');
}

srv.close(); svc.close();
rmSync(dir, { recursive: true, force: true });
if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all arena-cupplan tests passed');
