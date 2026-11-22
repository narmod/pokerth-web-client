#!/usr/bin/env node
// Game server down (restart, maintenance): the proxy must close the browser
// socket with the dedicated code 4504 « game-server-unreachable », and the
// reason must not leak the server's internal address. A server that is up
// keeps the usual flow (the browser receives the Announce, no 4504).
// The client side (modules/net/reconn-hold.mjs) keys on that code to show
// « the PokerTH server is not responding — your connection works » and keep
// waiting instead of giving up after 6 attempts.
// Run: node scripts/test-proxy-server-down.mjs
import net from 'net';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';
import { freePort } from './lib/free-port.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + label);
  if (!cond) fails++;
}
function frame(payload) {
  const b = Buffer.alloc(4 + payload.length);
  b.writeUInt32BE(payload.length, 0);
  payload.copy(b, 4);
  return b;
}

// A port with nothing listening: take a free one and leave it closed.
const DEAD_PORT = await freePort();
// A live fake server for the control case.
const fake = net.createServer((sock) => { sock.write(frame(Buffer.from('ANNOUNCE-HELLO'))); sock.on('error', () => {}); });
await new Promise((res) => fake.listen(0, '127.0.0.1', res));
const LIVE_PORT = fake.address().port;

const PROXY_PORT = await freePort();
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js')], {
  cwd: root,
  env: Object.assign({}, process.env, {
    PORT: String(PROXY_PORT),
    ALLOWED_HOSTS: '127.0.0.1',
    ALLOWED_PORTS: DEAD_PORT + ',' + LIVE_PORT,
    ADMIN_ENABLED: '0',
  }),
  stdio: ['ignore', 'pipe', 'pipe'],
});
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; });
proxy.stderr.on('data', (d) => { plog += d; });
await new Promise((res) => {
  const t0 = Date.now();
  (function poll() {
    if (/listening|ready|démarré/i.test(plog) || Date.now() - t0 > 4000) return res();
    setTimeout(poll, 100);
  })();
});
await new Promise((r) => setTimeout(r, 400));

function attempt(port, sid, ms) {
  return new Promise((resolve) => {
    const ws = new WebSocket('ws://127.0.0.1:' + PROXY_PORT + '/?host=127.0.0.1&port=' + port +
      '&tls=0&sid=' + sid + '&mode=lan&v=test&fresh=1');
    ws.binaryType = 'arraybuffer';
    const got = [];
    let done = false;
    const finish = (code, reason) => { if (!done) { done = true; resolve({ ws, got, code, reason }); } };
    ws.on('message', (d) => got.push(Buffer.from(d)));
    ws.on('close', (code, reason) => finish(code, String(reason || '')));
    ws.on('error', () => {});
    setTimeout(() => finish(null, ''), ms);
  });
}

try {
  // 1. Server down → 4504, reason without address.
  const down = await attempt(DEAD_PORT, 'downsid-1234567890', 9000);
  ok(down.code === 4504, 'server down: browser socket closed with 4504 (got ' + down.code + ')');
  ok(down.reason === 'game-server-unreachable', 'server down: reason is « game-server-unreachable » (got « ' + down.reason + ' »)');
  ok(down.reason.indexOf('127.0.0.1') === -1 && down.reason.indexOf(String(DEAD_PORT)) === -1,
    'server down: the reason does not leak the server address');

  // 2. Server up → normal flow, no 4504.
  const up = await attempt(LIVE_PORT, 'upsid-12345678901', 7000);
  ok(up.got.some((b) => b.includes('ANNOUNCE-HELLO')), 'server up: the Announce reaches the browser');
  ok(up.code !== 4504, 'server up: no 4504');
  try { up.ws.close(4001, 'bye'); } catch (e) {}
} finally {
  try { proxy.kill('SIGTERM'); } catch (e) {}
  try { fake.close(); } catch (e) {}
}
await new Promise((r) => setTimeout(r, 200));
console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
