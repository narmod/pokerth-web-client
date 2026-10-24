#!/usr/bin/env node
// Tests of the organizer accounts (service 0.21.0): the super admin creates
// an account and its invitation link; the organizer chooses a password and
// signs in; sessions; the roles (organizer, referee, read only) and what each
// may do; turned off, new link, deleted; sign-in limits; nothing secret in
// the file.
// Run: node arena/test/test-arena-accounts.mjs
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
const dir = mkdtempSync(join(tmpdir(), 'arena-acc-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.318', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const call = async (p, b, tok) => { const r = await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer ' + (tok || 'master'), 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer ' + (tok || 'master') } }); const d = await r.json(); d.http = r.status; return d; };
const pub = async (p, b, ip) => { const r = await fetch(base + '/arena/api' + p, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': ip || '198.51.100.7' }, body: JSON.stringify(b) }); const d = await r.json(); d.http = r.status; return d; };

// ── the rules ──────────────────────────────────────────────────────
ok(allowed('admin', 'POST', '/t/delete') && !allowed('organizer', 'POST', '/t/delete') && !allowed('organizer', 'GET', '/accounts') && allowed('organizer', 'POST', '/t/create'), 'rules: deletions and accounts for the super admin only');
ok(allowed('referee', 'POST', '/t/validate') && allowed('referee', 'POST', '/t/correct/approve') && !allowed('referee', 'POST', '/t/create') && !allowed('referee', 'POST', '/cups/create') && allowed('referee', 'GET', '/t/list'), 'rules: the referee validates and handles corrections, creates nothing');
ok(allowed('viewer', 'GET', '/t/list') && !allowed('viewer', 'POST', '/t/validate') && allowed('viewer', 'POST', '/me/password'), 'rules: read only reads (and changes its own password)');

// ── create, invite, sign in ────────────────────────────────────────
const cr = await call('/accounts/create', { login: 'Elise', name: 'Élise', role: 'organizer' });
ok(cr.ok && cr.account.login === 'elise' && cr.account.status === 'invited' && /^ai_/.test(cr.invite), 'the super admin creates an account: login in lowercase, invited, a link token');
ok(!(await call('/accounts/create', { login: 'elise', name: 'Other' })).ok && !(await call('/accounts/create', { login: 'admin', name: 'Admin' })).ok && !(await call('/accounts/create', { login: 'bob', name: 'élise' })).ok, 'a login or a name taken, or kept for the Arena: refused');
ok((await pub('/account/login', { login: 'elise', password: 'whatever-long' })).http === 400, 'no password yet: no sign-in');
ok(!(await pub('/account/invite', { token: cr.invite, password: 'short' })).ok, 'a password of fewer than 10 characters: refused');
const inv = await pub('/account/invite', { token: cr.invite, password: 'correct horse battery' });
ok(inv.ok && /^as_/.test(inv.token) && inv.account.status === 'active', 'the invitation link: password chosen, signed in');
ok(!(await pub('/account/invite', { token: cr.invite, password: 'another long one' })).ok, 'the link works once');
const lg = await pub('/account/login', { login: 'ELISE', password: 'correct horse battery' });
ok(lg.ok && lg.token !== inv.token, 'sign in with login (any case) and password: a new session');
const st = await call('/status', null, lg.token);
ok(st.ok && st.you === 'Élise' && st.role === 'organizer' && st.account.login === 'elise', 'the session: who and the role');
const t = await call('/t/create', { name: 'Elise night', profile: 'club' }, lg.token);
const tv = await call('/t/get?id=' + t.id, null, 'master');
ok(t.ok && tv.history.some((h) => h.author === 'Élise'), 'an organizer creates; the journal says « Élise »');
ok((await call('/accounts', null, lg.token)).http === 403 && (await call('/t/delete', { id: t.id, confirm: 'Elise night' }, lg.token)).code === 'role', 'an organizer: no accounts, no deletion (403, « role »)');

// ── roles ──────────────────────────────────────────────────────────
const ref = await call('/accounts/create', { login: 'ref', name: 'Rémi', role: 'referee' });
const refS = (await pub('/account/invite', { token: ref.invite, password: 'referee password 1' })).token;
const view = await call('/accounts/create', { login: 'look', name: 'Lou', role: 'viewer' });
const viewS = (await pub('/account/invite', { token: view.invite, password: 'viewer password 1' })).token;
for (const n of ['Ann', 'Ben']) await call('/t/player', { id: t.id, nick: n }, lg.token);
const off = await call('/t/create', { name: 'Official', profile: 'official' }, lg.token);
for (const n of ['Ann', 'Ben']) await call('/t/player', { id: off.id, nick: n }, lg.token);
await call('/t/result', { id: off.id, source: 'manual', ranking: ['Ann', 'Ben'] }, lg.token);
const rc = await call('/t/create', { name: 'Nope' }, refS);
const rv = await call('/t/validate', { id: off.id, override: 'checked by the referee' }, refS);
ok(rc.http === 403 && rc.code === 'role' && /referee/.test(rc.error) && rv.ok && rv.status === 'validated', 'a referee: creates nothing, validates');
const vg = await call('/t/list', null, viewS), vp = await call('/t/validate', { id: t.id }, viewS);
ok(vg.ok && vp.http === 403 && vp.code === 'role', 'read only: reads, changes nothing');

// ── off, new link, password, delete ────────────────────────────────
await call('/accounts/update', { id: view.account.id, patch: { disabled: true } });
ok((await call('/t/list', null, viewS)).http === 401 && (await pub('/account/login', { login: 'look', password: 'viewer password 1' })).http === 400, 'turned off: the session ends (401), no sign-in');
const ri = await call('/accounts/reinvite', { id: ref.account.id });
ok(ri.ok && ri.account.status === 'invited' && (await call('/t/list', null, refS)).http === 401, 'a new link: password cleared, sessions ended');
await call('/accounts/update', { id: cr.account.id, patch: { role: 'referee' } });
ok((await call('/status', null, lg.token)).role === 'referee', 'a role changed: at once');
ok(!(await call('/me/password', { old: 'wrong one here', password: 'brand new password' }, lg.token)).ok && (await call('/me/password', { old: 'correct horse battery', password: 'brand new password' }, lg.token)).ok, 'one\'s own password: the current one first');
ok((await pub('/account/login', { login: 'elise', password: 'brand new password' })).ok, 'and the new one works');
ok((await pub('/account/logout', { token: lg.token })).ok && (await call('/t/list', null, lg.token)).http === 401, 'sign out: the session ends');
// Sign-in limits: 8 failures for a login, then a quarter of an hour.
let last = null;
for (let i = 0; i < 9; i++) last = await pub('/account/login', { login: 'elise', password: 'nope nope nope' }, '203.0.113.' + i);
ok(last.http === 429 && (await pub('/account/login', { login: 'elise', password: 'brand new password' }, '203.0.113.50')).http === 429, 'too many failures for a login: refused for a while, even with the right password');
const del = await call('/accounts/delete', { id: view.account.id });
ok(del.ok && !(await call('/accounts')).accounts.some((a) => a.login === 'look'), 'deleted');
// The file: no password, no token in clear; mode 600.
const raw = readFileSync(join(dir, 'accounts.json'), 'utf8');
ok(!/correct horse|brand new password|as_[A-Za-z0-9_-]{40}|ai_[A-Za-z0-9_-]{40}/.test(raw) && (statSync(join(dir, 'accounts.json')).mode & 0o777) === 0o600, 'accounts.json: hashes only, mode 600');

svc.close(); srv.close();
rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nall arena-accounts tests passed');
process.exit(fails ? 1 : 0);
