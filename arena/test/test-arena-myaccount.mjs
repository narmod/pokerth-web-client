#!/usr/bin/env node
// Tests of « My account » (service 0.32.0): the profile (since, devices,
// this one marked), signing out everywhere else, the preferences kept with
// the account (language, theme), my tournaments (coming / finished, private
// ones too), my cups, my tickets, closing the account (password asked again;
// the nickname free afterwards, its results kept).
// Run: node arena/test/test-arena-myaccount.mjs
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

const dir = mkdtempSync(join(tmpdir(), 'arena-myaccount-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.322', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
let ipn = 1;
const call = async (p, b) => (await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer master', 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer master' } })).json();
const api = async (p, b) => { const r = await fetch(base + '/arena/api' + p, b ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.' + (ipn++ % 250) }, body: JSON.stringify(b) } : {}); const d = await r.json(); d.http = r.status; return d; };

await call('/players/settings', { signup: 'open' });
const s1 = (await api('/players/signup', { nick: 'Alice', password: 'alice pass 1' })).token;
const s2 = (await api('/players/login', { nick: 'alice', password: 'alice pass 1' })).token;
const pr = await api('/players/profile', { session: s1 });
ok(pr.ok && pr.player.nick === 'Alice' && pr.accountSince > 0 && pr.sessions.length === 2 && pr.sessions.filter((x) => x.current).length === 1, 'profile: since when, two devices, this one marked');
ok((await api('/players/profile', { session: 'ps_nope' })).http === 401, 'profile: no session, 401');

// Preferences.
const pf = await api('/players/prefs', { session: s1, lang: 'fr', theme: 'dark' });
ok(pf.ok && pf.prefs.lang === 'fr' && pf.prefs.theme === 'dark', 'preferences saved');
ok((await api('/players/me', { session: s2 })).prefs.theme === 'dark', 'found again on the other device');
ok((await api('/players/prefs', { session: s1, lang: '../x', theme: 'pink' })).prefs.lang === null, 'a bad language or theme: none');

// My tournaments and cups.
const open = await call('/t/create', { name: 'Open night', profile: 'club', visibility: 'public' });
const priv = await call('/t/create', { name: 'Members only', profile: 'club', visibility: 'private' });
const done = await call('/t/create', { name: 'Last week', profile: 'club', visibility: 'public' });
for (const t of [open, priv]) await call('/t/player', { id: t.id, nick: 'Alice' });
for (const nk of ['Alice', 'Bob', 'Cat']) await call('/t/player', { id: done.id, nick: nk });
await call('/t/result', { id: done.id, source: 'manual', ranking: ['Bob', 'Alice', 'Cat'] });
await call('/t/validate', { id: done.id });
const kind = (await call('/tickets/type/add', { name: 'Step 2' })).type;
await call('/tickets/adjust', { nick: 'Alice', type: kind.id, delta: 1 });
const mi = await api('/players/mine', { session: s1 });
ok(mi.ok && mi.now.map((c) => c.name).sort().join() === 'Members only,Open night', 'my tournaments: the coming ones, the private one too');
ok(mi.past.length === 1 && mi.past[0].name === 'Last week' && mi.past[0].place === 2, 'my tournaments: the finished one, my place');
ok(mi.tickets[0].name === 'Step 2' && mi.tickets[0].count === 1 && typeof mi.season === 'string', 'my tickets of the season');
ok(Array.isArray(mi.cups) && mi.groups && Array.isArray(mi.groups.member), 'my cups, my groups');

// Signed out everywhere else.
const lo = await api('/players/logoutothers', { session: s1 });
ok(lo.ok && lo.ended === 1 && (await api('/players/me', { session: s2 })).http === 401 && (await api('/players/me', { session: s1 })).ok, 'everywhere else signed out, this device still in');

// Closing the account.
ok((await api('/players/close', { session: s1, password: 'wrong one 1' })).code === 'badPassword', 'closing: the password asked again');
const cl = await api('/players/close', { session: s1, password: 'alice pass 1' });
ok(cl.ok && cl.closed && (await api('/players/me', { session: s1 })).http === 401, 'closed: signed out');
ok(!(await api('/players/Alice')).account && (await api('/players/Alice')).results.length === 1, 'the nickname without an account, its results kept');
ok((await api('/players/signup', { nick: 'Alice', password: 'new alice 22' })).ok, 'the nickname free to claim again');

srv.close(); svc.close();
rmSync(dir, { recursive: true, force: true });
if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all arena-myaccount tests passed');
process.exit(0);
