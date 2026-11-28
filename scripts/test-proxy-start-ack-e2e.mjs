#!/usr/bin/env node
// End-to-end check of server/start-ack.js through the real proxy: a fake
// PokerTH upstream sends StartEvent and records every StartEventAck it gets.
//   1. browser gone (bridge in grace)   → the bridge acknowledges at once;
//   2. browser live and answering       → exactly one ack, the browser's;
//   3. browser live but silent          → the bridge acknowledges after ~3 s,
//      and the browser's late ack for that game never reaches the server.
// Run: node scripts/test-proxy-start-ack-e2e.mjs   (about 20 s: the proxy
// spaces new upstream connections to the same server by 5 s, on purpose)
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

const startEvent = (gid) => frame(Buffer.concat([fVar(1, 36), fLen(37, Buffer.concat([fVar(1, gid), fVar(2, 0)]))]));
const ackOf = (gid) => frame(Buffer.concat([fVar(1, 37), fLen(38, fVar(1, gid))]));

// ── Fake PokerTH server ───────────────────────────────────────────────
const conns = [];   // { nick, sock, acks: [{ gid, at }] }
let pidSeq = 100;
const fake = net.createServer((sock) => {
  const c = { nick: '', sock, acks: [] };
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
        c.nick = im[6] ? im[6][0].toString() : '';
        sock.write(frame(Buffer.concat([fVar(1, 6), fLen(7, Buffer.concat([fLen(1, crypto.randomBytes(16)), fVar(2, ++pidSeq)]))])));
      } else if (o[1] && o[1][0] === 37 && o[38]) {
        c.acks.push({ gid: decode(o[38][0])[1][0], at: Date.now() });
      }
    }
  });
  sock.on('error', () => {});
});
await new Promise((res) => fake.listen(0, '127.0.0.1', res));
const FAKE_PORT = fake.address().port;

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
// Logs in; `answer` = reply to StartEvent at once like the web client does.
function page(sid, nick, answer) {
  return new Promise((resolve) => {
    const ws = new WebSocket(url(sid)); ws.binaryType = 'nodebuffer';
    const res = { ws, ack: false };
    ws.on('message', (d) => {
      const b = Buffer.from(d);
      if (b.includes(Buffer.from('ANNOUNCE'))) { ws.send(initFrame(nick, null)); return; }
      const o = decode(b.slice(4));
      if (o[1] && o[1][0] === 6) { res.ack = true; setTimeout(() => resolve(res), 50); }
      if (o[1] && o[1][0] === 36 && answer) ws.send(ackOf(decode(o[37][0])[1][0]));
    });
    ws.on('error', () => {});
    setTimeout(() => resolve(res), 15000);
  });
}
const connOf = (nick) => conns.find((c) => c.nick === nick);

try {
  // 1. browser gone
  const p1 = await page('sid-sa-one-00000001', 'Gone1', true);
  ok(p1.ack, 'page 1 logged in');
  p1.ws.terminate(); await wait(400);
  const c1 = connOf('Gone1'); const t1 = Date.now();
  c1.sock.write(startEvent(5)); await wait(500);
  ok(c1.acks.length === 1 && c1.acks[0].gid === 5 && c1.acks[0].at - t1 < 400, 'browser gone → the bridge acknowledges game 5 at once');
  ok(/\[start-ack\] game 5: acknowledged for the browser \(no browser attached\)/.test(plog), 'logged');

  // 2. browser live and answering
  const p2 = await page('sid-sa-two-00000002', 'Live2', true);
  const c2 = connOf('Live2');
  c2.sock.write(startEvent(6)); await wait(3600);
  ok(c2.acks.length === 1 && c2.acks[0].gid === 6, 'live browser → one ack, its own');

  // 3. browser live but silent; its own ack comes late
  const p3 = await page('sid-sa-three-000003', 'Asleep3', false);
  const c3 = connOf('Asleep3'); const t3 = Date.now();
  c3.sock.write(startEvent(7)); await wait(1000);
  ok(c3.acks.length === 0, 'silent browser: no ack in the first second');
  await wait(2600);
  ok(c3.acks.length === 1 && c3.acks[0].at - t3 >= 2900, 'silent browser → the bridge acknowledges after ~3 s (' + (c3.acks[0] ? c3.acks[0].at - t3 : '?') + ' ms)');
  p3.ws.send(ackOf(7)); await wait(400);
  ok(c3.acks.length === 1, 'the browser’s late ack for game 7 never reaches the server');
  p2.ws.close(4001, 'bye'); p3.ws.close(4001, 'bye');
} finally {
  await wait(200);
  try { proxy.kill('SIGTERM'); } catch (e) {}
  try { fake.close(); conns.forEach((c) => { try { c.sock.destroy(); } catch (e) {} }); } catch (e) {}
}
await wait(200);
console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
