#!/usr/bin/env node
// Two dials to the same server are spaced by an anti-throttle gap (5 s by
// default). A browser that closed its WebSocket while its dial was still
// waiting had its session destroyed with no socket to close — then the
// deferred dial fired anyway and left an upstream socket nobody owned, held
// until the game server dropped it. _openUpstream now gives up when the
// session is gone.
// Run: node scripts/test-upstream-defer-leak.mjs   (~10 s)
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { createRequire } from 'node:module';
import { freePort } from './lib/free-port.mjs';
const require = createRequire(import.meta.url);
const WebSocket = require('ws');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Dummy game server: counts the connections it holds open, never closes them.
let open = 0, total = 0;
const up = net.createServer((s) => { open++; total++; s.on('close', () => { open--; }); s.on('error', () => {}); });
const UP = await freePort();
await new Promise((r) => up.listen(UP, '127.0.0.1', r));

const tmp = mkdtempSync(join(tmpdir(), 'deferleak-'));
const F = (x) => join(tmp, x);
writeFileSync(F('a.json'), JSON.stringify({ proxyCfg: { connGapMs: 1500 } }));
const PORT = await freePort();
const env = Object.assign({}, process.env, { PORT: String(PORT), ALLOWED_HOSTS: '127.0.0.1', ALLOWED_PORTS: String(UP), ADMIN_CONFIG_FILE: F('a.json'),
  VISITS_FILE: F('v.json'), STATS_FILE: F('s.json'), STATS_META_FILE: F('sm.json'), NO_PROXY: '*' });
const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls'], { cwd: root, stdio: 'ignore', env });
try {
  let ready = false;
  for (let i = 0; i < 80 && !ready; i++) { try { ready = (await fetch('http://127.0.0.1:' + PORT + '/robots.txt')).ok; } catch (e) {} if (!ready) await sleep(250); }
  ok(ready, 'the proxy starts');
  // The first client dials at once and stays; the next four are deferred and leave at once.
  const keep = new WebSocket('ws://127.0.0.1:' + PORT + '/?host=127.0.0.1&port=' + UP + '&tls=0');
  keep.on('error', () => {});
  await new Promise((r) => keep.on('open', r));
  await sleep(300);
  for (let i = 0; i < 4; i++) {
    const w = new WebSocket('ws://127.0.0.1:' + PORT + '/?host=127.0.0.1&port=' + UP + '&tls=0');
    w.on('error', () => {});
    await new Promise((r) => w.on('open', r));
    w.close(4001);
    await sleep(100);
  }
  await sleep(1500 * 4 + 1000);   // past every deferred dial
  ok(total === 1, 'only the client still there reached the game server (' + total + ' dial(s))');
  ok(open === 1, 'one upstream socket held, not one per departed client (' + open + ')');
  keep.close();
} finally {
  await new Promise((r) => { child.once('exit', r); child.kill(); setTimeout(r, 3000); });
  up.close();
  try { rmSync(tmp, { recursive: true, force: true, maxRetries: 5 }); } catch (e) {}
}
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
