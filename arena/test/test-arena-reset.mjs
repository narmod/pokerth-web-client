#!/usr/bin/env node
// Tests of « start again from zero » (service 0.22.0): the super admin only;
// what there is; RESET to confirm; refused while a table it would take is
// still watched; what is kept stays whole (a kept tournament keeps its watch,
// a kept cup keeps its image); everything moves to <dir>/reset-<date>/, the
// medals follow, accounts and the key stay.
// Run: node arena/test/test-arena-reset.mjs
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';
import { allowed } from '../lib/accounts.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const EV = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img', 'events');
const full = readFileSync(join(EV, 'cup.jpg')).toString('base64'), small = readFileSync(join(EV, 'cup.t.jpg')).toString('base64');
const dir = mkdtempSync(join(tmpdir(), 'arena-reset-'));
const key = generateKeys().privateKeyPem;
writeFileSync(join(dir, 'td-key.pem'), key);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.320', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const call = async (p, b, tok) => { const r = await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: { Authorization: 'Bearer ' + (tok || 'master'), 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : { headers: { Authorization: 'Bearer ' + (tok || 'master') } }); const d = await r.json(); d.http = r.status; return d; };
const open = async (p) => (await fetch(base + '/arena/api' + p)).json();
// A Table check on disk, as the manager writes it.
function watch(id, status, extra) {
  mkdirSync(join(dir, 'watches', id), { recursive: true });
  writeFileSync(join(dir, 'watches', id, 'meta.json'), JSON.stringify(Object.assign({ id, startedAt: Date.now(), gameName: 'Game ' + id, nick: 'TD', server: { ref: 'local' }, pid: process.pid }, extra || {})));
  writeFileSync(join(dir, 'watches', id, 'state.json'), JSON.stringify({ status, pid: process.pid, logs: [] }));
}

// ── who may ────────────────────────────────────────────────────────
ok(!allowed('organizer', 'GET', '/reset') && !allowed('organizer', 'POST', '/reset') && !allowed('viewer', 'GET', '/reset') && allowed('admin', 'POST', '/reset'), 'rules: the reset is the super admin\'s only, even to look');
const acc = await call('/accounts/create', { login: 'elise', name: 'Élise', role: 'organizer' });
const sess = (await (await fetch(base + '/arena/api/account/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: acc.invite, password: 'correct horse battery' }) })).json()).token;
const og = await call('/reset', null, sess), op = await call('/reset', { parts: ['watches'], confirm: 'RESET' }, sess);
ok(og.http === 403 && og.code === 'role' && op.http === 403, 'an organizer: neither sees nor runs it (403)');

// ── data ───────────────────────────────────────────────────────────
const img = await call('/images/add', { name: 'Spring', full, thumb: small });
const img2 = await call('/images/add', { name: 'Autumn', full, thumb: small });
const kept = await call('/t/create', { name: 'Kept night', profile: 'club', image: img2.image.id });
const t = await call('/t/create', { name: 'Club night', profile: 'club' });
for (const n of ['Ann', 'Ben', 'Cid', 'Dan']) await call('/t/player', { id: t.id, nick: n });
await call('/t/result', { id: t.id, source: 'manual', ranking: ['Ann', 'Ben', 'Cid', 'Dan'] });
const v = await call('/t/get?id=' + t.id);   // a Club result is validated at once
const cup = await call('/cups/create', { name: 'Spring cup', image: img.image.id });
watch('w1aaaaaa', 'finished', { tournamentId: kept.id });   // the table of a tournament
watch('w2bbbbbb', 'finished');
watch('w3cccccc', 'running');                               // still watching
ok(v.ok && v.status === 'validated' && img.ok && cup.ok && kept.ok, 'data: two tournaments (one validated), a cup, two images, three watches');
ok((await open('/badges')).players.some((p) => p.nick === 'Ann'), 'medals: Ann has one');

const s = await call('/reset');
ok(s.ok && s.counts.watches === 3 && s.counts.tournaments === 2 && s.counts.cups === 1 && s.counts.images === 2 && s.confirm === 'RESET', 'what there is: counts');
ok(s.running.length === 1 && /Game w3cccccc/.test(s.running[0]), 'what is still running is said');

// ── refusals ───────────────────────────────────────────────────────
ok(!(await call('/reset', { parts: ['watches'] })).ok && !(await call('/reset', { parts: ['watches'], confirm: 'reset' })).ok, 'RESET (in capitals) needed');
ok(!(await call('/reset', { parts: [], confirm: 'RESET' })).ok && !(await call('/reset', { parts: ['accounts'], confirm: 'RESET' })).ok, 'something to take away needed (accounts are never one)');
const busy = await call('/reset', { parts: ['watches'], confirm: 'RESET' });
ok(!busy.ok && /still running/.test(busy.error) && existsSync(join(dir, 'watches', 'w2bbbbbb')), 'a watch still running: refused, nothing moved');

// ── watches only: the kept tournament's watch stays ────────────────
watch('w3cccccc', 'stopped');
const r1 = await call('/reset', { parts: ['watches'], confirm: 'RESET' });
ok(r1.ok && r1.reset.done.watches === 2 && r1.reset.kept.watches === 1, 'watches: two taken away, the tournament\'s one kept');
ok(existsSync(join(dir, 'watches', 'w1aaaaaa')) && !existsSync(join(dir, 'watches', 'w2bbbbbb')) && existsSync(join(dir, r1.reset.archive, 'watches', 'w2bbbbbb', 'meta.json')), 'moved to the dated folder, not thrown away');
ok((await call('/t/list')).tournaments.length === 2, 'tournaments untouched');

// ── images only: the ones in use stay ──────────────────────────────
const r2 = await call('/reset', { parts: ['images'], confirm: 'RESET' });
ok(r2.ok && r2.reset.done.images === 0 && r2.reset.kept.images === 2, 'images: both still shown (a cup, a tournament), both kept');

// ── everything ─────────────────────────────────────────────────────
const r3 = await call('/reset', { parts: ['watches', 'tournaments', 'cups', 'images'], confirm: 'RESET' });
ok(r3.ok && r3.reset.done.tournaments === 2 && r3.reset.done.cups === 1 && r3.reset.done.watches === 1 && r3.reset.done.images === 2, 'everything: 2 tournaments, 1 cup, the last watch, 2 images');
ok(r3.counts.watches === 0 && r3.counts.tournaments === 0 && r3.counts.cups === 0 && r3.counts.images === 0, 'the summary after: nothing left');
ok((await call('/t/list')).tournaments.length === 0 && (await call('/cups/list')).cups.length === 0 && (await call('/watches')).watches.length === 0, 'lists empty');
ok((await call('/images')).images.map((x) => x.id).join(',') === 'tournament,cup', 'images: the two shipped ones only');
ok(!(await open('/badges')).players.length, 'medals: gone with the tournament');
const arc = join(dir, r3.reset.archive);
ok(existsSync(join(arc, 'tournaments', t.id, 'tournament.json')) && existsSync(join(arc, 'cups')) && existsSync(join(arc, 'images', img.image.id + '.jpg')), 'all in the dated folder');
ok(readFileSync(join(dir, 'td-key.pem'), 'utf8') === key && (await call('/accounts')).accounts.length === 1, 'the install key and the accounts stay');
const lines = readFileSync(join(dir, 'resets.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
ok(lines.length === 3 && lines[2].by === 'admin' && r3.last && r3.last.archive === r3.reset.archive, 'each reset is a line of resets.jsonl, the last one shown');
ok(readdirSync(dir).filter((n) => /^reset-/.test(n)).length === 3, 'one folder per reset, never overwritten');
const again = await call('/t/create', { name: 'New season', profile: 'club' });
ok(again.ok && (await call('/t/list')).tournaments.length === 1, 'after a reset: a new tournament works');

srv.close(); svc.close && svc.close();
rmSync(dir, { recursive: true, force: true });
if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all arena-reset tests passed');
