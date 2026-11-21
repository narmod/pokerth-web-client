#!/usr/bin/env node
// End-to-end check of the same-device re-login (web.151,
// claude/AUDIT_FANTOMES_2026-11-21.md). A page closed or killed and reopened
// gets a NEW sid: its old bridge stays in grace and the server refuses the
// same guest nickname. The new Init carries myLastSessionId = the GUID the
// server gave the old session; the proxy closes that ghost, then forwards the
// Init a moment later. A fake PokerTH upstream answers every Init with an
// InitAck carrying a fresh 16-byte GUID and records what it sees.
//   1. page 1 logs in as « Guest1 », then dies (abrupt close → grace);
//   2. another page, same nick, WRONG GUID      → the ghost is left alone;
//   3. another page, OTHER nick, right GUID     → the ghost is left alone;
//   4. another page, same nick, right GUID      → the ghost is closed BEFORE
//      its Init reaches the server, which comes about 1 s later;
//   5. a LIVE page (browser attached) is never closed, even with its GUID.
// Run: node scripts/test-proxy-ghost.mjs   (about 40 s: the proxy spaces new
// upstream connections to the same server by 5 s, on purpose)
import net from 'net';
import crypto from 'crypto';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';
import { freePort } from './lib/free-port.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let fails = 0;
function ok(cond, label) { console.log((cond ? '  ✓ ' : '  ✗ ') + label); if (!cond) fails++; }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Minimal protobuf ──────────────────────────────────────────────────
function varint(n) { const o = []; n >>>= 0; while (n > 0x7f) { o.push((n & 0x7f) | 0x80); n >>>= 7; } o.push(n); return Buffer.from(o); }
function fVar(fn, v) { return Buffer.concat([varint(fn << 3), varint(v)]); }
function fLen(fn, b) { b = Buffer.isBuffer(b) ? b : Buffer.from(String(b), 'utf8'); return Buffer.concat([varint((fn << 3) | 2), varint(b.length), b]); }
function frame(p) { const h = Buffer.alloc(4); h.writeUInt32BE(p.length, 0); return Buffer.concat([h, p]); }
function readVarint(b, pos) { let r = 0, s = 0, x; do { x = b[pos++]; r |= (x & 0x7f) << s; s += 7; } while (x & 0x80); return { v: r >>> 0, pos }; }
function decode(b) {
  const f = {}; let pos = 0;
  while (pos < b.length) {
    const t = readVarint(b, pos); pos = t.pos; const fn = t.v >>> 3, wt = t.v & 7;
    (f[fn] = f[fn] || []);
    if (wt === 0) { const v = readVarint(b, pos); pos = v.pos; f[fn].push(v.v); }
    else if (wt === 2) { const l = readVarint(b, pos); pos = l.pos; f[fn].push(b.slice(pos, pos + l.v)); pos += l.v; }
    else break;
  }
  return f;
}
const ANNOUNCE = frame(Buffer.concat([fVar(1, 1), fLen(2, Buffer.from('ANNOUNCE'))]));
function initFrame(nick, guid) {
  const parts = [fVar(5, 0), fLen(6, nick)];
  if (guid) parts.unshift(fLen(3, guid));
  return frame(Buffer.concat([fVar(1, 2), fLen(3, Buffer.concat(parts))]));
}

// ── Fake PokerTH server ───────────────────────────────────────────────
const conns = [];   // { idx, closedAt, inits: [{ nick, guid, at }], guid }
let pidSeq = 100;
const fake = net.createServer((sock) => {
  const c = { idx: conns.length + 1, closedAt: 0, inits: [], guid: null, sock };
  conns.push(c);
  sock.write(ANNOUNCE);
  let rx = Buffer.alloc(0);
  sock.on('data', (d) => {
    rx = Buffer.concat([rx, d]);
    while (rx.length >= 4 && rx.length >= 4 + rx.readUInt32BE(0)) {
      const n = rx.readUInt32BE(0), p = rx.slice(4, 4 + n); rx = rx.slice(4 + n);
      const o = decode(p);
      if (o[1] && o[1][0] === 2 && o[3]) {
        const im = decode(o[3][0]);
        c.inits.push({ nick: im[6] ? im[6][0].toString() : '', guid: im[3] ? Buffer.from(im[3][0]) : null, at: Date.now() });
        c.guid = crypto.randomBytes(16);
        sock.write(frame(Buffer.concat([fVar(1, 6), fLen(7, Buffer.concat([fLen(1, c.guid), fVar(2, ++pidSeq)]))])));
      }
    }
  });
  sock.on('close', () => { c.closedAt = Date.now(); });
  sock.on('error', () => {});
});
await new Promise((res) => fake.listen(0, '127.0.0.1', res));
const FAKE_PORT = fake.address().port;

// ── Real proxy ────────────────────────────────────────────────────────
const PROXY_PORT = await freePort();
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js')], {
  cwd: root,
  env: Object.assign({}, process.env, { PORT: String(PROXY_PORT), ALLOWED_HOSTS: '127.0.0.1', ALLOWED_PORTS: String(FAKE_PORT), ADMIN_ENABLED: '0' }),
  stdio: ['ignore', 'pipe', 'pipe'],
});
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; });
proxy.stderr.on('data', (d) => { plog += d; });
await new Promise((res) => { const t0 = Date.now(); (function poll() { if (/ready/i.test(plog) || Date.now() - t0 > 5000) return res(); setTimeout(poll, 100); })(); });
await wait(300);

const url = (sid) => 'ws://127.0.0.1:' + PROXY_PORT + '/?host=127.0.0.1&port=' + FAKE_PORT + '&tls=0&sid=' + sid + '&mode=lan&v=test&fresh=1';
// Opens a page, waits for the announce, sends an Init, waits for its InitAck (or a timeout).
function page(sid, nick, guid, ackMs) {
  return new Promise((resolve) => {
    const ws = new WebSocket(url(sid)); ws.binaryType = 'nodebuffer';
    const res = { ws, ack: false, sentAt: 0 };
    let done = false; const fin = () => { if (!done) { done = true; resolve(res); } };
    ws.on('message', (d) => {
      const b = Buffer.from(d);
      if (!res.sentAt && b.includes(Buffer.from('ANNOUNCE'))) { res.sentAt = Date.now(); ws.send(initFrame(nick, guid)); setTimeout(fin, ackMs); }
      else if (res.sentAt) { const o = decode(b.slice(4)); if (o[1] && o[1][0] === 6) { res.ack = true; setTimeout(fin, 50); } }
    });
    ws.on('error', () => {});
    setTimeout(fin, 15000);
  });
}
const connOf = (nick, i) => conns.filter((c) => c.inits.some((x) => x.nick === nick))[i || 0];

try {
  // 1. page 1 logs in, then dies
  const p1 = await page('sid-one-0000000001', 'Guest1', null, 1500);
  ok(p1.ack, 'page 1: logged in (InitAck)');
  const ghost = connOf('Guest1');
  ok(ghost && ghost.guid && ghost.guid.length === 16, 'page 1: the server gave it a 16-byte session id');
  p1.ws.terminate();
  await wait(400);
  ok(ghost.closedAt === 0, 'page 1 gone: its bridge stays in grace (upstream still open)');

  // 2. same nick, wrong GUID → untouched
  const p2 = await page('sid-two-0000000002', 'Guest1', crypto.randomBytes(16), 1600);
  ok(ghost.closedAt === 0, 'wrong session id: the ghost is left alone');
  p2.ws.close(4001, 'bye'); await wait(200);

  // 3. other nick, right GUID → untouched
  const p3 = await page('sid-three-00000003', 'Guest2', ghost.guid, 1600);
  ok(ghost.closedAt === 0, 'other nickname: the ghost is left alone');
  p3.ws.close(4001, 'bye'); await wait(200);

  // 4. same nick, right GUID → ghost closed first, Init forwarded ~1 s later
  const before = conns.length;
  const p4 = await page('sid-four-000000004', 'Guest1', ghost.guid, 2500);
  const c4 = conns.slice(before).find((c) => c.inits.length);
  ok(ghost.closedAt > 0, 'same nickname + session id: the ghost is closed');
  ok(c4 && c4.inits[0].at >= ghost.closedAt, 'the server sees the close BEFORE the new Init');
  ok(c4 && c4.inits[0].at - p4.sentAt >= 900, 'the Init is held about 1 s (' + (c4 ? c4.inits[0].at - p4.sentAt : '?') + ' ms)');
  ok(c4 && c4.inits[0].guid && c4.inits[0].guid.equals(ghost.guid), 'the Init reaches the server intact (myLastSessionId kept)');
  ok(p4.ack, 'the new page is logged in');
  ok(/Same-device re-login/.test(plog) && plog.indexOf(ghost.guid.toString('hex')) < 0, 'logged, without the session id');

  // 5. a LIVE page is never closed
  const p5 = await page('sid-five-000000005', 'Live1', null, 1500);
  const live = connOf('Live1');
  const p6 = await page('sid-six-0000000006', 'Live1', live.guid, 1800);
  ok(live.closedAt === 0, 'a session with its browser attached is never closed, even with its session id');
  p5.ws.close(4001, 'bye'); p6.ws.close(4001, 'bye'); p4.ws.close(4001, 'bye');
} finally {
  await wait(200);
  try { proxy.kill('SIGTERM'); } catch (e) {}
  try { fake.close(); conns.forEach((c) => { try { c.sock.destroy(); } catch (e) {} }); } catch (e) {}
}
await wait(200);
console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
