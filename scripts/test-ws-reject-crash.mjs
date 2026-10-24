#!/usr/bin/env node
// A WebSocket turned away by the bridge (host or port not allowed, server at
// capacity, LAN per-IP cap) used to have no 'error' listener: the handler
// returned before _attachWs, which is where the listener was added. The
// socket stays open during the close handshake, so a frame over maxPayload
// (64 KiB) or an unmasked frame raised an unhandled 'error' event and killed
// the whole process — every game on the instance dropped, no login needed.
// The connection handler now listens for 'error' before any early return.
// Run: node scripts/test-ws-reject-crash.mjs   (~5 s)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import http from 'node:http';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const WebSocket = require('ws');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(join(tmpdir(), 'pth-wsrej-'));
writeFileSync(join(tmp, 'admin-config.json'), '{}');
const PORT = 18000 + Math.floor(Math.random() * 900);
const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls', String(PORT)], {
  env: Object.assign({}, process.env, { ADMIN_CONFIG_FILE: join(tmp, 'admin-config.json'), VISITS_FILE: join(tmp, 'visits.json'), NO_PROXY: '*' }),
  stdio: ['ignore', 'ignore', 'pipe'] });
let stderr = ''; child.stderr.on('data', (d) => { stderr += d; });
let exited = false; child.on('exit', () => { exited = true; });
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const alive = () => new Promise((res) => http.get({ host: '127.0.0.1', port: PORT, path: '/robots.txt' }, (r) => { r.resume(); res(r.statusCode > 0); }).on('error', () => res(false)));

// Oversized frame on a socket rejected for its host.
function oversized(q) {
  return new Promise((res) => {
    const ws = new WebSocket('ws://127.0.0.1:' + PORT + '/?' + q);
    ws.on('open', () => { try { ws.send(Buffer.alloc(100 * 1024)); } catch (e) {} });
    ws.on('error', () => {}); ws.on('close', () => res());
    setTimeout(() => { try { ws.terminate(); } catch (e) {} res(); }, 2000);
  });
}
// Unmasked client frame (protocol violation) right after the handshake.
function unmasked(q) {
  return new Promise((res) => {
    const s = net.connect(PORT, '127.0.0.1', () => {
      s.write('GET /?' + q + ' HTTP/1.1\r\nHost: 127.0.0.1\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
        'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\n\r\n');
    });
    let sent = false;
    s.on('data', () => { if (!sent) { sent = true; s.write(Buffer.from([0x81, 0x02, 0x68, 0x69])); } });
    s.on('error', () => {}); s.on('close', () => res());
    setTimeout(() => { s.destroy(); res(); }, 2000);
  });
}

try {
  for (let i = 0; i < 60 && !(await alive()); i++) await sleep(250);
  ok(await alive(), 'proxy is up');
  await oversized('host=evil.example.com&port=7234');
  await sleep(300);
  ok(!exited && await alive(), 'host not allowed + 100 KB frame: the process survives');
  await unmasked('host=evil.example.com&port=7234');
  await sleep(300);
  ok(!exited && await alive(), 'host not allowed + unmasked frame: the process survives');
  await oversized('host=pokerth.net&port=22');
  await sleep(300);
  ok(!exited && await alive(), 'port not allowed + 100 KB frame: the process survives');
  ok(!/Unhandled 'error' event/.test(stderr), 'no unhandled error event on stderr');
} finally { child.kill(); rmSync(tmp, { recursive: true, force: true }); }
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
