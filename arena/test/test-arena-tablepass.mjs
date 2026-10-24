#!/usr/bin/env node
// Tests of the table password (service 0.24.0): on by default with the
// identity « personal code » (Official), a choice elsewhere; worked out from
// the install key, never stored; given on the players' page to a registered
// (checked-in) player with his personal code only; the organizer sees it;
// the public page never shows it.
// Run: node arena/test/test-arena-tablepass.mjs
import { mkdtempSync, rmSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
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
const dir = mkdtempSync(join(tmpdir(), 'arena-tpass-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.320', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const call = async (p, b) => { const r = await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer master', 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer master' } }); return r.json(); };
let ipn = 1;
const pub = async (key, op, b) => (await fetch(base + '/arena/api/t/' + key + (op ? '/' + op : ''), op ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.' + (ipn++) }, body: JSON.stringify(b) } : {})).json();
const T = svc.manager.tournaments;

// ── on or off ──────────────────────────────────────────────────────
const off = await call('/t/create', { name: 'Club night', profile: 'club' });
const on = await call('/t/create', { name: 'Official night', profile: 'official' });
const forced = await call('/t/create', { name: 'Club locked', profile: 'club', run: { tablePassword: true } });
const unforced = await call('/t/create', { name: 'Official open', profile: 'official', run: { tablePassword: false } });
ok(!off.run.tablePassword && on.run.tablePassword && forced.run.tablePassword && !unforced.run.tablePassword, 'on by default with the personal code identity (Official), the organizer\'s choice otherwise');
const ed = await call('/t/update', { id: off.id, patch: { run: { tablePassword: true } } });
ok(ed.ok && ed.run.tablePassword && ed.run.announce === true, 'turned on later, the rest of the run settings kept');

// ── the password ───────────────────────────────────────────────────
const p1 = T.passFor(on.id, 'nonce-a'), p2 = T.passFor(on.id, 'nonce-a'), p3 = T.passFor(on.id, 'nonce-b'), p4 = T.passFor(off.id, 'nonce-a');
ok(/^[a-hjkmnp-z2-9]{10}$/.test(p1) && p1 === p2 && p1 !== p3 && p1 !== p4, 'worked out from the install key: 10 easy characters, the same each time, another for each opening and each tournament');

// ── given to a registered, checked-in player with his code ─────────
const key = on.publicKey;
const ra = await pub(key, 'register', { nick: 'Alice' });
const rb = await pub(key, 'register', { nick: 'Bob' });
ok((await pub(key, 'tablepass', { nick: 'Alice', code: ra.code })).code === 'tableNotOpen', 'before the table opens: nothing');
await pub(key, 'checkin', { nick: 'Alice', code: ra.code });
T.hostOpened(on.id, 'wtest01', { server: 'Fake' }, 'admin', 'nonce-open');
const want = T.passFor(on.id, 'nonce-open');
ok((await pub(key, 'tablepass', { nick: 'Alice', code: 'WRONGCOD' })).code === 'badCode', 'a wrong code: refused');
ok((await pub(key, 'tablepass', { nick: 'Mallory', code: ra.code })).code === 'badCode', 'someone else\'s code: refused');
ok((await pub(key, 'tablepass', { nick: 'Bob', code: rb.code })).code === 'notCheckedIn', 'not checked in: refused');
const got = await pub(key, 'tablepass', { nick: 'alice', code: ra.code.toLowerCase() });
ok(got.ok && got.password === want && got.nick === 'Alice', 'Alice, checked in, with her code: the password');
ok((await pub(unforced.publicKey, 'tablepass', { nick: 'x', code: 'y' })).code === 'noTablePass', 'a table without password: says so');

// ── who sees it ────────────────────────────────────────────────────
const pg = await pub(key);
ok(pg.tablePassword === true && !JSON.stringify(pg).includes(want), 'public page: says there is one, never shows it');
const og = await call('/t/get?id=' + on.id);
ok(og.tablePasswordNow === want && og.host && !('passNonce' in og.host), 'organizer: sees the password of the open table, not its nonce');
ok(og.history.some((h) => h.type === 'tablePassShown' && /Alice/.test(h.summary)) && og.history.some((h) => /with a password/.test(h.summary)), 'journal: the opening with a password, each time it is shown, to whom');
const files = readdirSync(join(dir, 'tournaments', on.id)).map((f) => readFileSync(join(dir, 'tournaments', on.id, f), 'utf8')).join('');
ok(!files.includes(want), 'never written to disk');

srv.close(); svc.close();
rmSync(dir, { recursive: true, force: true });
if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all arena-tablepass tests passed');
