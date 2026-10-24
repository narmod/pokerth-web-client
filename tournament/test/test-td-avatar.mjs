#!/usr/bin/env node
// Tests of the director's avatar: announced by its MD5 in the Init, sent in
// 256-byte blocks when the server asks for it (an unknown hash answered as
// such), the server's 32 B – 30 KB limit, the default robot and an
// organizer's own image, the routes (page image, change, reset).
// Run: node tournament/test/test-td-avatar.mjs
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import http from 'node:http';
import * as pb from '../../public/proto/pokerth-bundle.mjs';
import { SpectatorDirector, avatarOf } from '../lib/spectator.mjs';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';
import { S, msg, fakeServer, answerNames, wait } from './lib/td-fake-server.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const here = dirname(fileURLToPath(import.meta.url));
const ROBOT = readFileSync(join(here, '..', 'public', 'img', 'director-avatar.png'));

// ── the image ──────────────────────────────────────────────────────
{
  const a = avatarOf({ bytes: ROBOT });
  ok(a && a.type === 1 && ROBOT.length <= 30720 && a.md5.length === 16, 'the robot: a PNG within the server\'s 30 KB (' + ROBOT.length + ' bytes)');
  ok(!avatarOf({ bytes: Buffer.alloc(40000, 0x89) }) && !avatarOf({ bytes: Buffer.from('tiny') }) && !avatarOf({ b64: Buffer.from('not an image at all, but long enough to pass the size').toString('base64') }), 'refused: over 30 KB, under 32 B, not PNG/JPEG/GIF');
  ok(avatarOf({ bytes: Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(100)]) }).type === 2, 'JPEG accepted');
}

// ── the protocol ───────────────────────────────────────────────────
async function login(askHash) {
  const { server, port, seen } = await fakeServer((conn) => {
    answerNames(conn);
    conn.sock.write(S.announce());
    conn.after = async (m) => {
      if (m.initMessage) {
        const h = askHash || m.initMessage.avatarHash;
        conn.sock.write(msg(0, 'avatarRequestMessage', { requestId: 42, avatarHash: Buffer.from(h) }));
        await wait(60);
        conn.sock.write(S.initAck());
      }
    };
  });
  const d = new SpectatorDirector({ host: '127.0.0.1', port, nick: 'TD-av', gameName: 'Nothing', version: '2.1.10-web.307', reconnects: 0, avatar: { b64: ROBOT.toString('base64') } });
  d.on('error', () => {});
  d.start();
  await wait(300);
  d.stop('test');
  server.close();
  return seen[0].got;
}
{
  const got = await login(null);
  const init = got.find((m) => m.initMessage).initMessage;
  ok(Buffer.from(init.avatarHash).equals(createHash('md5').update(ROBOT).digest()), 'Init: the avatar\'s MD5');
  const head = got.find((m) => m.avatarHeaderMessage);
  const data = got.filter((m) => m.avatarDataMessage).map((m) => Buffer.from(m.avatarDataMessage.avatarBlock));
  ok(head && head.avatarHeaderMessage.requestId === 42 && head.avatarHeaderMessage.avatarType === 1 && head.avatarHeaderMessage.avatarSize === ROBOT.length, 'asked: header with the request id, PNG, its size');
  ok(data.every((b) => b.length <= 256) && Buffer.concat(data).equals(ROBOT) && got.some((m) => m.avatarEndMessage && m.avatarEndMessage.requestId === 42), 'then the image in blocks of 256 bytes at most, and the end');
  const other = await login(Buffer.alloc(16, 7));
  ok(other.some((m) => m.unknownAvatarMessage && m.unknownAvatarMessage.requestId === 42) && !other.some((m) => m.avatarHeaderMessage), 'another hash asked: « unknown avatar »');
}

// ── the routes ─────────────────────────────────────────────────────
{
  const dir = mkdtempSync(join(tmpdir(), 'td-av-'));
  writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
  const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.308', sweepMs: 600000, servers: async () => [] });
  const srv = http.createServer(svc.handler);
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port;
  const A = { Authorization: 'Bearer master', 'Content-Type': 'application/json' };
  const page = await fetch(base + '/tournament/avatar');
  ok(page.status === 200 && page.headers.get('content-type') === 'image/png' && Buffer.from(await page.arrayBuffer()).equals(ROBOT), 'players\' page: the robot by default');
  ok((await (await fetch(base + '/admin/tournaments/avatar', { headers: A })).json()).custom === false, 'organizer: the default');
  const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(500, 1)]);
  const set = await (await fetch(base + '/admin/tournaments/avatar', { method: 'POST', headers: A, body: JSON.stringify({ image: jpg.toString('base64') }) })).json();
  const now = await fetch(base + '/tournament/avatar');
  ok(set.ok && now.headers.get('content-type') === 'image/jpeg' && Buffer.from(await now.arrayBuffer()).equals(jpg), 'an organizer\'s image replaces it');
  ok(svc.manager.avatar().custom && svc.manager.avatar().bytes.equals(jpg), 'and the next directors take it');
  const bad = await fetch(base + '/admin/tournaments/avatar', { method: 'POST', headers: A, body: JSON.stringify({ image: Buffer.alloc(31000, 0x89).toString('base64') }) });
  ok(bad.status === 400 && /30 KB/.test((await bad.json()).error), 'over the server\'s limit: refused');
  ok((await fetch(base + '/admin/tournaments/avatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reset: true }) })).status === 403, 'changing it needs a key');
  await fetch(base + '/admin/tournaments/avatar', { method: 'POST', headers: A, body: JSON.stringify({ reset: true }) });
  ok(Buffer.from(await (await fetch(base + '/tournament/avatar')).arrayBuffer()).equals(ROBOT), 'back to the robot');
  // The four shipped robots: each under 30 KB, shown by ?preset=N, one click picks one.
  const st = await (await fetch(base + '/admin/tournaments/avatar?images=1', { headers: A })).json();
  ok(JSON.stringify(st.presets) === '[1,2,3,4]' && st.preset === 3 && st.defaultPreset === 3, 'four robots, robot 3 by default');
  const imgs = [];
  for (const n of st.presets) { const u = st.images[n] || ''; imgs.push(/^data:image\/png;base64,/.test(u) ? Buffer.from(u.split(',')[1], 'base64') : null); }
  ok(imgs.every((b) => b && avatarOf({ bytes: b }) && b.length <= 30720) && new Set(imgs.map((b) => b.toString('base64'))).size === 4, 'each robot given to the organizer\'s picker, valid for the server, all different');
  ok(!(await (await fetch(base + '/admin/tournaments/avatar', { headers: A })).json()).images, 'the images only when asked');
  const pick = await (await fetch(base + '/admin/tournaments/avatar', { method: 'POST', headers: A, body: JSON.stringify({ preset: 1 }) })).json();
  ok(pick.ok && svc.manager.avatar().preset === 1 && svc.manager.avatar().bytes.equals(imgs[0]) && Buffer.from(await (await fetch(base + '/tournament/avatar')).arrayBuffer()).equals(imgs[0]), 'robot 1 picked: the director and the pages show it');
  ok((await fetch(base + '/admin/tournaments/avatar', { method: 'POST', headers: A, body: JSON.stringify({ preset: 7 }) })).status === 400, 'no such robot: refused');
  await fetch(base + '/admin/tournaments/avatar', { method: 'POST', headers: A, body: JSON.stringify({ image: jpg.toString('base64') }) });
  ok(svc.manager.avatar().custom && svc.manager.avatar().preset === null, 'an image of its own wins over the robot');
  await fetch(base + '/admin/tournaments/avatar', { method: 'POST', headers: A, body: JSON.stringify({ preset: 4 }) });
  ok(!svc.manager.avatar().custom && svc.manager.avatar().bytes.equals(imgs[3]), 'picking a robot again drops the image');
  await fetch(base + '/admin/tournaments/avatar', { method: 'POST', headers: A, body: JSON.stringify({ reset: true }) });
  ok(svc.manager.avatar().preset === 3, 'back to the default: robot 3');
  svc.close(); srv.close();
  rmSync(dir, { recursive: true, force: true });
}

console.log(fails ? `\n${fails} FAILED` : '\nall td-avatar tests passed');
process.exit(fails ? 1 : 0);
