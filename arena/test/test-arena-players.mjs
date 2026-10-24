#!/usr/bin/env node
// Tests of the players and their accounts (service 0.25.0): accounts by
// invitation (the default) or made by the players themselves when the super
// admin opens sign-up; sign-in, sessions, password; an account claims its
// nickname (any case) across the install; registering, checking in, the
// table password and leaving with the account instead of the code; identity
// « accounts »; bans everywhere (tournaments, cups, organizer); the organizer's
// list with the counts from the results; who may do what.
// Run: node arena/test/test-arena-players.mjs
import { mkdtempSync, rmSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';
import { allowed } from '../lib/accounts.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const dir = mkdtempSync(join(tmpdir(), 'arena-players-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.320', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
let ipn = 1;
const call = async (p, b, tok) => { const r = await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer ' + (tok || 'master'), 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer ' + (tok || 'master') } }); const d = await r.json(); d.http = r.status; return d; };
const api = async (p, b) => { const r = await fetch(base + '/arena/api' + p, b ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.' + (ipn++ % 250) }, body: JSON.stringify(b) } : {}); const d = await r.json(); d.http = r.status; return d; };

// ── the rules ──────────────────────────────────────────────────────
ok(allowed('organizer', 'POST', '/players/ban') && allowed('organizer', 'POST', '/players/create') && !allowed('organizer', 'POST', '/players/settings') && !allowed('referee', 'POST', '/players/ban') && allowed('viewer', 'GET', '/players'), 'rules: organizers manage players, the sign-up mode is the super admin\'s');

// ── invitation (the default) ───────────────────────────────────────
ok((await api('/players')).signup === 'invite', 'sign-up: by invitation by default');
const closed = await api('/players/signup', { nick: 'Eve', password: 'secret pass 1' });
ok(!closed.ok && closed.code === 'signupClosed', 'by invitation: nobody makes his own account');
const cr = await call('/players/create', { nick: 'Alice', account: true });
ok(cr.ok && /^pi_/.test(cr.invite) && cr.player.account === 'invited', 'an organizer creates Alice\'s account: an invitation link');
const inv = await api('/players/invite', { token: cr.invite, password: 'alice pass 1' });
ok(inv.ok && /^ps_/.test(inv.token) && inv.player.nick === 'Alice', 'the link: password chosen, signed in');
ok(!(await api('/players/invite', { token: cr.invite, password: 'other pass 1' })).ok, 'the link works once');
const sA = (await api('/players/login', { nick: 'ALICE', password: 'alice pass 1' })).token;
ok(/^ps_/.test(sA) && (await api('/players/me', { session: sA })).player.nick === 'Alice', 'sign in with the nickname (any case): the session says who');
ok((await api('/players/login', { nick: 'Alice', password: 'wrong one!' })).code === 'badLogin', 'a wrong password: refused');
ok((await api('/players/me', { session: 'ps_nope' })).http === 401, 'an unknown session: 401');

// ── open sign-up ───────────────────────────────────────────────────
ok((await call('/players/settings', { signup: 'open' })).signup === 'open', 'the super admin opens sign-up');
const bob = await api('/players/signup', { nick: 'Bob', password: 'bob pass 12' });
ok(bob.ok && /^ps_/.test(bob.token), 'open: Bob makes his own account');
ok((await api('/players/signup', { nick: 'bob', password: 'other pass 1' })).code === 'nickClaimed', 'the same nickname in another case: claimed');
ok((await api('/players/signup', { nick: 'Carl', password: 'short' })).code === 'shortPassword', 'a short password: refused');
ok((await api('/players/password', { session: bob.token, old: 'bob pass 12', password: 'bob pass 34' })).ok && (await api('/players/login', { nick: 'Bob', password: 'bob pass 34' })).ok, 'a new password');

// ── registering with the account ───────────────────────────────────
const t = await call('/t/create', { name: 'Club night', profile: 'club' });
const r1 = await api('/t/' + t.publicKey + '/register', { session: sA, nick: 'Mallory' });
ok(r1.ok && r1.nick === 'Alice' && /^[A-Z2-9]{8}$/.test(r1.code), 'signed in: registered under the account\'s nickname (whatever is typed), a code all the same');
const claimed = await api('/t/' + t.publicKey + '/register', { nick: 'bob' });
ok(!claimed.ok && claimed.code === 'nickClaimed', 'Bob\'s nickname without his session: refused');
const out = await api('/t/' + t.publicKey + '/unregister', { session: sA });
ok(out.ok && !(await call('/t/get?id=' + t.id)).players.length, 'leaving with the session, without the code');
const off = await call('/t/create', { name: 'Official night', profile: 'official' });
await api('/t/' + off.publicKey + '/register', { session: sA });
const ck = await api('/t/' + off.publicKey + '/checkin', { session: sA });
ok(ck.ok && ck.nick === 'Alice', 'check-in with the session');
svc.manager.tournaments.hostOpened(off.id, 'wfake1', {}, 'admin', 'nonce');
const tp = await api('/t/' + off.publicKey + '/tablepass', { session: sA });
ok(tp.ok && tp.password === svc.manager.tournaments.passFor(off.id, 'nonce'), 'the table password with the session');
ok((await api('/t/' + off.publicKey + '/tablepass', { session: 'ps_gone' })).http === 401, 'an ended session: 401, not a silent fallback');

// ── identity « accounts » ──────────────────────────────────────────
const acc = await call('/t/create', { name: 'Members night', profile: 'custom', settings: { identity: 'accounts' } });
ok(acc.settings.identity === 'accounts', 'identity « accounts »');
ok((await api('/t/' + acc.publicKey + '/register', { nick: 'Zed' })).code === 'accountNeeded', 'without an account: refused');
ok((await api('/t/' + acc.publicKey + '/register', { session: bob.token })).ok, 'signed in: registered');

// ── bans ───────────────────────────────────────────────────────────
const ban = await call('/players/ban', { nick: 'Troll', reason: 'insults at the table', days: 30 });
ok(ban.ok && ban.player.ban && ban.player.ban.until > Date.now() + 29 * 864e5, 'an organizer bans a nickname (no account needed), 30 days');
const bt = await api('/t/' + t.publicKey + '/register', { nick: 'troll' });
ok(!bt.ok && bt.code === 'banned' && /insults/.test(bt.error), 'banned: refused at registration, any case, with the reason');
const cup = await call('/cups/create', { name: 'Spring', plan: { format: 'series', series: [Date.now() + 10 * 864e5], common: { autoOpen: false } } });
ok((await api('/c/' + cup.publicKey, { op: 'register', nick: 'Troll' })).code === 'banned', 'banned: refused by the cups too');
ok(!(await call('/t/player', { id: t.id, nick: 'Troll' })).ok, 'banned: the organizer cannot add him either until the ban is lifted');
const cupA = await api('/c/' + cup.publicKey, { op: 'register', session: sA });
ok(cupA.ok && cupA.nick === 'Alice', 'a cup with the account');
ok((await api('/c/' + cup.publicKey, { op: 'unregister', session: sA })).ok, 'and leaving it with the account');
const tid = ban.player.id;
ok((await call('/players/unban', { id: tid })).ok && (await api('/t/' + t.publicKey + '/register', { nick: 'Troll' })).ok, 'ban lifted: he registers');

// ── the organizer's list ───────────────────────────────────────────
for (const n of ['Ann', 'Ben', 'Cid', 'Dan']) await call('/t/player', { id: t.id, nick: n });
await call('/t/result', { id: t.id, source: 'manual', ranking: ['Ann', 'Troll', 'Ben', 'Cid', 'Dan'] });
const L = await call('/players');
const row = (n) => L.players.find((p) => p.nick === n);
ok(L.ok && L.signup === 'open' && row('Alice').account === 'active' && row('Ann').account === null && row('Ann').stats.tournaments === 1 && row('Ann').stats.wins === 1, 'list: accounts, and every nickname of the results with its counts');
ok(!JSON.stringify(L).includes('passHash') && !JSON.stringify(L).includes('inviteHash'), 'list: no hash');
const dis = await call('/players/disable', { id: row('Bob').id });
ok(dis.ok && (await api('/players/me', { session: bob.token })).http === 401, 'account turned off: its sessions end');
const re = await call('/players/reinvite', { id: row('Bob').id });
ok(re.ok && /^pi_/.test(re.invite), 'a new invitation link');
ok((await call('/players/create', { nick: 'Ref', account: true }, 'nope')).http === 403, 'a wrong key: refused');
const file = readFileSync(join(dir, 'players.json'), 'utf8');
ok((statSync(join(dir, 'players.json')).mode & 0o777) === 0o600 && !file.includes('alice pass 1') && !file.includes(sA), 'players.json: mode 600, no password, no session token');

srv.close(); svc.close();
rmSync(dir, { recursive: true, force: true });
if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all arena-players tests passed');
