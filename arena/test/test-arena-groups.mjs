#!/usr/bin/env node
// Tests of groups (service 0.29.0): an organizer makes groups (invitation,
// request, code, open), adds and takes out nicknames, answers requests; a
// signed-in player joins, asks, leaves; a banned player cannot; every group
// is public; a tournament kept for a group's members; a group still asked
// for cannot be deleted; the reset takes the groups away.
// Run: node arena/test/test-arena-groups.mjs
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
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

// The rule alone.
const G1 = 'g0123456789', G2 = 'gabcdefabcd';
const r = cleanAccess({ groups: [{ id: G1, name: 'Club' }, { id: G1, name: 'dup' }, { id: 'nope', name: 'x' }, { id: G2, name: 'Team' }] });
ok(r.groups.length === 2 && r.groups[0].name === 'Club', 'cleanAccess: groups kept once, bad ids dropped');
const facts = (gs) => ({ tournaments: 0, points: 0, medals: { gold: 0, silver: 0, bronze: 0 }, cupPlace: () => null, groups: gs });
ok(missingFor(r, facts([G2]), {}).length === 0, 'a member of one of the groups: in');
const m0 = missingFor(r, facts([]), {});
ok(m0.length === 1 && m0[0].code === 'group' && m0[0].name === 'Club / Team', 'no group: « group » missing, with the names');

const dir = mkdtempSync(join(tmpdir(), 'arena-groups-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.320', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((res) => srv.listen(0, '127.0.0.1', res));
const base = 'http://127.0.0.1:' + srv.address().port;
let ipn = 1;
const call = async (p, b) => (await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer master', 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer master' } })).json();
const api = async (p, b) => { const res = await fetch(base + '/arena/api' + p, b ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.' + (ipn++ % 250) }, body: JSON.stringify(b) } : {}); const d = await res.json(); d.http = res.status; return d; };

await call('/players/settings', { signup: 'open' });
const sA = (await api('/players/signup', { nick: 'Alice', password: 'alice pass 1' })).token;
const sB = (await api('/players/signup', { nick: 'Bob', password: 'bob pass 12' })).token;
const sM = (await api('/players/signup', { nick: 'Mallory', password: 'mallory pass' })).token;

const inv = (await call('/groups/create', { name: 'Guests', join: 'invite', about: 'by hand' })).group;
const req = (await call('/groups/create', { name: 'Club', join: 'request' })).group;
const cod = (await call('/groups/create', { name: 'Team', join: 'code' })).group;
const opn = (await call('/groups/create', { name: 'Open house', join: 'open' })).group;
ok(inv && req && opn && cod && /^[A-Z2-9]{8}$/.test(cod.code) && !opn.code, 'four groups, the code group with its code');
ok(!(await call('/groups/create', { name: 'club' })).ok, 'a name taken (any case): refused');

// Players' side.
ok((await api('/players/groupjoin', { session: 'ps_x', id: opn.id })).http === 401, 'not signed in: no joining');
ok((await api('/players/groupjoin', { session: sA, id: opn.id })).status === 'member', 'open: Alice is in at once');
ok((await api('/players/groupjoin', { session: sA, id: inv.id })).code === 'groupInvite', 'by invitation: Alice cannot join herself');
ok((await api('/players/groupjoin', { session: sA, id: cod.id, code: 'WRONG123' })).code === 'groupCode', 'with a code: a wrong code refused');
const jc = await api('/players/groupjoin', { session: sA, id: cod.id, code: cod.code.toLowerCase() });
ok(jc.status === 'member' && jc.mine.member.length === 2, 'with a code: the right one (any case), in');
const rq = await api('/players/groupjoin', { session: sB, id: req.id });
ok(rq.status === 'requested' && rq.mine.requested[0] === req.id, 'on request: Bob asks');
ok((await call('/groups')).groups.find((g) => g.id === req.id).requests[0].nick === 'Bob', 'the organizer sees the request');
await call('/groups/approve', { id: req.id, nick: 'bob' });
ok((await api('/players/me', { session: sB })).groups.member[0] === req.id, 'accepted: Bob is a member');
await api('/players/groupjoin', { session: sM, id: req.id });
await call('/groups/decline', { id: req.id, nick: 'Mallory' });
const mm = (await api('/players/me', { session: sM })).groups;
ok(!mm.member.length && !mm.requested.length, 'declined: Mallory is out, her request gone');
await call('/groups/add', { id: inv.id, nick: 'Zed' });
await call('/groups/add', { id: inv.id, nick: 'zed' });
ok((await call('/groups')).groups.find((g) => g.id === inv.id).members.length === 1, 'the organizer adds a nickname without an account (once, any case)');
ok((await api('/players/groupleave', { session: sA, id: opn.id })).status === 'out', 'Alice leaves the open group');
await call('/players/ban', { nick: 'Mallory', reason: 'cheating', days: 0 });
ok((await api('/players/groupjoin', { session: sM, id: opn.id })).code === 'banned', 'banned: no joining');

// Everyone sees them.
const pub = await api('/players');
ok(pub.groups.length === 4 && pub.groups.find((g) => g.id === req.id).members.join() === 'Bob' && !('code' in pub.groups[0]), 'public: every group with its members, never its code');
ok((await api('/players/Alice')).groups.map((g) => g.name).join() === 'Team', 'the player\'s page shows her groups');
ok((await call('/players')).players.find((p) => p.nick === 'Bob').groups[0] === 'Club', 'the organizer\'s list shows them too');
ok((await call('/players')).players.find((p) => p.nick === 'Zed').groups[0] === 'Guests', 'a nickname only in a group is in the organizer\'s list');

// A tournament kept for the Club.
const t = await call('/t/create', { name: 'Club night', profile: 'club', access: { groups: [{ id: req.id, name: 'Club' }] } });
ok((await api('/t/' + t.publicKey + '/register', { session: sA })).missing[0].code === 'group', 'Club night: Alice (not in the Club) refused, « group » missing');
ok((await api('/t/' + t.publicKey + '/register', { session: sB })).ok, 'Club night: Bob registered');
const rm = await call('/groups/remove', { id: req.id });
ok(!rm.ok && /Club night/.test(rm.error), 'a group a tournament still asks for: not deleted');
ok((await call('/groups')).groups.find((g) => g.id === req.id).usedBy[0] === 'Club night', 'the organizer sees what asks for it');
ok((await call('/groups/remove', { id: opn.id })).ok && (await call('/groups')).groups.length === 3, 'another group deleted');
ok((await call('/groups/update', { id: cod.id, patch: { newCode: true } })).group.code !== cod.code, 'a new code');
ok((await call('/groups/update', { id: req.id, patch: { join: 'open' } })).group.join === 'open', 'how one gets in changed');

// The reset.
const sum = await call('/reset');
ok(sum.parts.indexOf('groups') >= 0 && sum.counts.groups === 3, 'reset: groups listed, with their count');
const rs = await call('/reset', { parts: ['groups'], confirm: 'RESET' });
ok(rs.ok && rs.reset.done.groups === 3 && existsSync(join(dir, rs.reset.archive, 'groups.json')) && !(await call('/groups')).groups.length, 'reset: the groups archived, none left');

srv.close(); svc.close();
rmSync(dir, { recursive: true, force: true });
if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all arena-groups tests passed');
process.exit(0);
