#!/usr/bin/env node
// Tests of who may register (service 0.26.0): tournaments played (at least,
// at most), points, medals (any, gold, none), a place in a cup, a player
// account; all combined; the refusal says what is missing and what the
// player has; the eligibility check; a cup's conditions on its registration
// and on the tournaments players enter; the organizer and the qualifiers are
// not held back.
// Run: node arena/test/test-arena-access.mjs
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';
import { cleanAccess, missingFor } from '../lib/access.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// ── pure ───────────────────────────────────────────────────────────
ok(cleanAccess({}) === null && cleanAccess({ minTournaments: '0', medal: 'x' }) === null, 'no condition: null');
const ca = cleanAccess({ identity: 'account', minTournaments: '10', maxTournaments: 5, minPoints: 30, medal: 'gold', noMedal: true, cup: { id: 'cabc123', top: '8', name: 'Spring' } });
ok(ca.identity === 'account' && ca.minTournaments === 10 && ca.maxTournaments === undefined && ca.minPoints === 30 && ca.medal === 'gold' && !ca.noMedal && ca.cup.top === 8, 'cleaned: numbers, a minimum above the maximum drops the maximum, a medal wins over « no medal »');
const facts = { tournaments: 4, points: 12, medals: { gold: 0, silver: 1, bronze: 0 }, cupPlace: () => 12 };
const miss = missingFor(ca, facts, { account: false });
ok(miss.map((m) => m.code).join() === 'account,minTournaments,minPoints,gold,cup' && miss[1].need === 10 && miss[1].have === 4 && miss[4].have === 12, 'everything missing is listed, with what the player has');
ok(missingFor({ maxTournaments: 3, noMedal: true }, facts, {}).map((m) => m.code).join() === 'maxTournaments,noMedal', 'beginners: too many tournaments, a medal already');

// ── the service ────────────────────────────────────────────────────
const dir = mkdtempSync(join(tmpdir(), 'arena-access-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.320', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
let ipn = 1;
const call = async (p, b) => { const r = await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer master', 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer master' } }); return r.json(); };
const api = async (p, b) => { const r = await fetch(base + '/arena/api' + p, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.' + (ipn++ % 250) }, body: JSON.stringify(b) }); return r.json(); };
// A played and validated Club tournament: the ranking given.
async function played(name, ranking) {
  const t = await call('/t/create', { name, profile: 'club' });
  for (const n of ranking) await call('/t/player', { id: t.id, nick: n });
  await call('/t/result', { id: t.id, source: 'manual', ranking });
  return t;
}
await played('Night 1', ['Ann', 'Ben', 'Cid', 'Dan']);
await played('Night 2', ['Ben', 'Ann', 'Cid', 'Dan']);
await played('Night 3', ['Cid', 'Ann', 'Ben', 'Eve']);
// Ann: 3 tournaments, 4+3+3 = 10 points, a gold and two silvers; Ben: 3, 3+4+2 = 9, a gold;
// Dan: 2 tournaments, 1+1 = 2 points, no medal; Eve: 1.

const veterans = await call('/t/create', { name: 'Veterans', profile: 'club', access: { minTournaments: 3 } });
ok(veterans.access && veterans.access.minTournaments === 3, 'a tournament with a condition');
const rd = await api('/t/' + veterans.publicKey + '/register', { nick: 'Dan' });
ok(!rd.ok && rd.code === 'access' && rd.missing[0].code === 'minTournaments' && rd.missing[0].need === 3 && rd.missing[0].have === 2, 'Dan (2 tournaments): refused, « 3 needed, 2 played »');
ok((await api('/t/' + veterans.publicKey + '/register', { nick: 'ann' })).ok, 'Ann (3 tournaments, any case): registered');
ok((await api('/t/' + veterans.publicKey + '/register', { nick: 'Newbie' })).missing[0].have === 0, 'a nickname never seen: 0 tournaments');

const beginners = await call('/t/create', { name: 'Beginners', profile: 'club', access: { maxTournaments: 1, noMedal: true } });
const rb = await api('/t/' + beginners.publicKey + '/register', { nick: 'Ben' });
ok(!rb.ok && rb.missing.map((m) => m.code).join() === 'maxTournaments,noMedal', 'beginners: Ben refused (3 tournaments, medals)');
ok((await api('/t/' + beginners.publicKey + '/register', { nick: 'Eve' })).ok && (await api('/t/' + beginners.publicKey + '/register', { nick: 'Zoe' })).ok, 'beginners: Eve (1 tournament, no medal) and a newcomer registered');

const stars = await call('/t/create', { name: 'Stars', profile: 'club', access: { medal: 'gold', minPoints: 10 } });
const rs = await api('/t/' + stars.publicKey + '/register', { nick: 'Ben' });
ok(!rs.ok && rs.missing.map((m) => m.code).join() === 'minPoints' && rs.missing[0].have === 9, 'a gold and 10 points: Ben (a gold, 9 points) refused for the points only');
ok((await api('/t/' + stars.publicKey + '/register', { nick: 'Ann' })).ok && !(await api('/t/' + stars.publicKey + '/register', { nick: 'Dan' })).ok, 'Ann (a gold, 10 points) registered; Dan (no medal) not');

const el = await api('/t/' + veterans.publicKey + '/eligible', { nick: 'Dan' });
ok(el.ok && el.missing.length === 1 && el.access.minTournaments === 3, 'eligibility check before registering');

// The organizer is not held back.
ok((await call('/t/player', { id: veterans.id, nick: 'Dan' })).players.some((p) => p.nick === 'Dan'), 'the organizer adds Dan all the same');

// A player account required.
await call('/players/settings', { signup: 'open' });
const sDan = (await api('/players/signup', { nick: 'Dan', password: 'dan pass 12' })).token;
const members = await call('/t/create', { name: 'Members', profile: 'club', access: { identity: 'account' } });
ok((await api('/t/' + members.publicKey + '/register', { nick: 'Eve' })).missing[0].code === 'account', 'an account required: Eve without one refused');
ok((await api('/t/' + members.publicKey + '/register', { session: sDan })).ok, 'Dan signed in: registered');

// Conditions edited afterwards.
const up = await call('/t/update', { id: veterans.id, patch: { access: { minTournaments: 2 } } });
ok(up.ok && up.access.minTournaments === 2 && (await api('/t/' + veterans.publicKey + '/register', { nick: 'Cid' })).ok, 'conditions changed later: Cid now registers');

// A cup's conditions; a place in a cup.
const D = 864e5, at0 = Math.round((Date.now() + 10 * D) / 60000) * 60000;
const league = await call('/cups/create', { name: 'League', plan: { format: 'seriesFinal', create: 'auto', registration: 'cup', series: [at0], final: { at: at0 + 7 * D, top: 2 }, common: { autoOpen: false }, access: { minTournaments: 2 } } });
ok(league.planView.access.minTournaments === 2, 'a cup with conditions');
ok((await api('/c/' + league.publicKey, { op: 'register', nick: 'Eve' })).code === 'access', 'the cup: Eve (1 tournament) refused');
ok((await api('/c/' + league.publicKey, { op: 'register', nick: 'Ann' })).ok, 'the cup: Ann registered');
const [s1, fin] = league.planView.slots;
const ts1 = svc.manager.tournaments.get(s1.tournamentId), tfin = svc.manager.tournaments.get(fin.tournamentId);
ok(ts1.access && ts1.access.minTournaments === 2 && !tfin.access, 'its tournaments: the entry one takes the conditions, the final does not');
const ce = await api('/c/' + league.publicKey, { op: 'eligible', nick: 'Eve' });
ok(ce.ok && ce.missing[0].code === 'minTournaments', 'the cup\'s eligibility check');
// The qualifiers go to the final whatever the conditions.
await call('/t/player', { id: s1.tournamentId, nick: 'Eve' });
await call('/t/result', { id: s1.tournamentId, source: 'manual', ranking: ['Eve', 'Ann'] });
svc.manager.cups.tick();
ok(svc.manager.tournaments.get(fin.tournamentId).players.some((p) => p.nick === 'Eve'), 'Eve qualified for the final: not held back');

const spring = await call('/cups/create', { name: 'Spring cup' });
for (const t of svc.manager.tournaments.list().filter((x) => /^Night/.test(x.name))) await call('/cups/event', { id: spring.id, tournamentId: t.id });
const elite = await call('/t/create', { name: 'Elite', profile: 'club', access: { cup: { id: spring.id, top: 2, name: 'Spring cup' } } });
const rc = await api('/t/' + elite.publicKey + '/register', { nick: 'Cid' });
ok(!rc.ok && rc.missing[0].code === 'cup' && rc.missing[0].have === 3 && rc.missing[0].name === 'Spring cup', 'top 2 of a cup: Cid (3rd) refused, his place said');
ok((await api('/t/' + elite.publicKey + '/register', { nick: 'Ann' })).ok, 'Ann (in the top 2 of the cup): registered');
const pub = await (await fetch(base + '/arena/api/t/' + elite.publicKey)).json();
ok(pub.access && pub.access.cup.top === 2, 'the players\' page shows the conditions');

srv.close(); svc.close();
rmSync(dir, { recursive: true, force: true });
if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all arena-access tests passed');
