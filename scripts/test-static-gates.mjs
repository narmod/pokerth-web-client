#!/usr/bin/env node
// Route gates in proxy.js test the raw request path, but the static branch
// resolves files from the DECODED path. '/%6Dusic/tracks.json' used to skip the
// « music off » gate and be served anyway, and '/%61dmin.html' served the admin
// page past handleAdmin. The static branch now applies both gates again on the
// resolved file.
// Run: node scripts/test-static-gates.mjs   (~3 s)
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { freePort } from './lib/free-port.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const tmp = mkdtempSync(join(tmpdir(), 'statgate-'));
const F = (x) => join(tmp, x);
writeFileSync(F('a.json'), JSON.stringify({ musicEnabled: false }));
const PORT = await freePort();
const env = Object.assign({}, process.env, { PORT: String(PORT), ADMIN_CONFIG_FILE: F('a.json'),
  VISITS_FILE: F('v.json'), STATS_FILE: F('s.json'), STATS_META_FILE: F('sm.json'), NO_PROXY: '*' });
const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls'], { cwd: root, stdio: 'ignore', env });
// http.get keeps the path exactly as written (fetch would normalise '//' and '%6D').
const status = (p) => new Promise((res) => http.get({ host: '127.0.0.1', port: PORT, path: p }, (r) => { r.resume(); res(r.statusCode); }).on('error', () => res(0)));
try {
  let up = false;
  for (let i = 0; i < 80 && !up; i++) { up = (await status('/robots.txt')) === 200; if (!up) await new Promise((r) => setTimeout(r, 250)); }
  ok(up, 'the proxy starts (music turned off by the admin)');
  ok(await status('/music/tracks.json') === 404, '/music/tracks.json: 404');
  ok(await status('/%6Dusic/tracks.json') === 404, '/%6Dusic/tracks.json: 404 too');
  ok(await status('/%6dusic/tracks.json') === 404, '/%6dusic/tracks.json: 404 too');
  ok(await status('//music/tracks.json') === 404, '//music/tracks.json: 404 too');
  ok(await status('/x/../music/tracks.json') === 404, '/x/../music/tracks.json: 404 too');
  ok(await status('/%61dmin.html') === 404, '/%61dmin.html is not served by the static branch');
  ok(await status('/manifest.json') === 200 || await status('/sw.js') === 200, 'an ordinary static file is still served');
} finally {
  await new Promise((r) => { child.once('exit', r); child.kill(); setTimeout(r, 3000); });
  try { rmSync(tmp, { recursive: true, force: true, maxRetries: 5 }); } catch (e) {}
}
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
