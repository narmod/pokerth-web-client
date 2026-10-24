#!/usr/bin/env node
// Tests of the images of tournaments and cups (service 0.17.0): the library
// (two shipped, organizers add more), the choice on a tournament and a cup
// (defaults, refused unknown ids, changed after validation), the images on
// the public API, the image route, the picture of a shared link (og:image).
// Run: node arena/test/test-arena-images.mjs
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';
import { jpegSize } from '../lib/images.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const here = dirname(fileURLToPath(import.meta.url));
const EV = join(here, '..', 'public', 'img', 'events');
const full = readFileSync(join(EV, 'cup.jpg')), small = readFileSync(join(EV, 'cup.t.jpg'));
ok(JSON.stringify(jpegSize(full)) === '{"h":600,"w":800}' && JSON.stringify(jpegSize(readFileSync(join(EV, 'tournament.t.jpg')))) === '{"h":192,"w":192}', 'shipped images: 800 px pictures, 192 px thumbnails');

const dir = mkdtempSync(join(tmpdir(), 'arena-img-'));
writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.314', sweepMs: 600000, servers: async () => [] });
const srv = http.createServer(svc.handler);
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const A = { Authorization: 'Bearer master', 'Content-Type': 'application/json' };
const admin = async (p, b) => (await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: A, body: JSON.stringify(b) } : { headers: A })).json();

// ── the library ────────────────────────────────────────────────────
{
  const l = await admin('/images');
  ok(l.ok && l.images.map((x) => x.id).join(',') === 'tournament,cup' && l.images[0].thumb === '/arena/img/tournament.t.jpg', 'library: the two shipped images');
  const add = await admin('/images/add', { name: 'Spring league', full: full.toString('base64'), thumb: small.toString('base64') });
  ok(add.ok && /^u[0-9a-f]{10}$/.test(add.image.id) && add.image.by === 'admin' && !add.image.builtin, 'an organizer adds one (named, with who added it)');
  ok(!(await admin('/images/add', { name: 'x', full: full.toString('base64'), thumb: small.toString('base64') })).ok, 'a name is needed');
  ok(!(await admin('/images/add', { name: 'PNG', full: readFileSync(join(here, '..', 'public', 'img', 'director-avatar.png')).toString('base64'), thumb: small.toString('base64') })).ok, 'JPEG only');
  ok((await fetch(base + '/admin/arena/images')).status === 403, 'organizers only');
  const r = await fetch(base + '/arena/img/' + add.image.id + '.jpg');
  ok(r.status === 200 && r.headers.get('content-type') === 'image/jpeg' && Buffer.from(await r.arrayBuffer()).equals(full) && /max-age/.test(r.headers.get('cache-control')), 'served: /arena/img/<id>.jpg (cached)');
  ok((await fetch(base + '/arena/img/tournament.t.jpg')).status === 200 && (await fetch(base + '/arena/img/nothing.jpg')).status === 404, 'thumbnails too; an unknown id: 404');
  globalThis.SPRING = add.image.id;
}
// ── on a tournament and a cup ──────────────────────────────────────
{
  const t1 = await admin('/t/create', { name: 'Plain', profile: 'club' });
  const t2 = await admin('/t/create', { name: 'Spring 1', profile: 'club', image: SPRING });
  ok(!(await admin('/t/create', { name: 'Bad', profile: 'club', image: 'u0000000000' })).ok, 'an image not in the library: refused');
  const list = await (await fetch(base + '/arena/api/list')).json();
  const c1 = list.tournaments.find((x) => x.name === 'Plain'), c2 = list.tournaments.find((x) => x.name === 'Spring 1');
  ok(c1.image === '/arena/img/tournament.jpg' && c1.thumb === '/arena/img/tournament.t.jpg' && c2.image === '/arena/img/' + SPRING + '.jpg', 'public list: each tournament with its image (the default otherwise)');
  for (const n of ['Ann', 'Bob']) await admin('/t/player', { id: t1.id, nick: n });
  await admin('/t/result', { id: t1.id, source: 'manual', ranking: ['Ann', 'Bob'] });
  const up = await admin('/t/update', { id: t1.id, patch: { image: SPRING } });
  ok(up.ok && up.image === SPRING, 'the image changes even once validated');
  ok(!(await admin('/t/update', { id: t1.id, patch: { name: 'Renamed' } })).ok, 'the rest does not');
  const cup = await admin('/cups/create', { name: 'Spring cup' });
  const cv = await (await fetch(base + '/arena/api/c/' + cup.publicKey)).json();
  ok(cv.image === '/arena/img/cup.jpg', 'a cup: the cup image by default');
  await admin('/cups/update', { id: cup.id, patch: { image: SPRING } });
  await admin('/cups/close', { id: cup.id });
  ok((await admin('/cups/update', { id: cup.id, patch: { image: 'tournament' } })).ok && (await (await fetch(base + '/arena/api/cups')).json()).cups[0].thumb === '/arena/img/tournament.t.jpg', 'a closed cup can still change its image');
  globalThis.T2 = t2;
}
// ── the picture of a shared link ───────────────────────────────────
{
  const page = (p, o) => fetch(base + p, { headers: o ? { 'x-td-origin': o } : {} }).then((r) => r.text());
  const h = await page('/arena/t/' + T2.publicKey, 'https://example.org');
  ok(h.includes('<meta property="og:title" content="Spring 1">') && h.includes('<meta property="og:image" content="https://example.org/arena/img/' + SPRING + '.jpg">') && h.includes('twitter:card'), 'a tournament\'s page: og:title and og:image (absolute)');
  ok(!(await page('/arena/t/' + T2.publicKey)).includes('og:image'), 'no address known: no og:image');
  ok(!(await page('/arena/t/' + T2.publicKey, 'javascript:alert(1)')).includes('og:image'), 'a strange address: ignored');
  const pv = await admin('/t/create', { name: 'Secret <b>', profile: 'club', visibility: 'private' });
  ok(!(await page('/arena/t/' + pv.publicKey, 'https://example.org')).includes('og:'), 'a private tournament says nothing');
  ok(!(await page('/arena', 'https://example.org')).includes('og:title'), 'the start page: unchanged');
}
// ── several tables: the tables take the tournament's image ─────────
{
  const m = await admin('/t/create', { name: 'Big', profile: 'club', format: 'multi', image: SPRING });
  for (let i = 1; i <= 12; i++) await admin('/t/player', { id: m.id, nick: 'P' + i });
  const d = await admin('/t/draw', { id: m.id });
  const tb = await admin('/t/get?id=' + d.stagesInfo.tables[0].id);
  ok(tb.image === SPRING, 'several tables: each table takes the tournament\'s image');
}
svc.close(); srv.close();
rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nall arena-images tests passed');
process.exit(fails ? 1 : 0);
