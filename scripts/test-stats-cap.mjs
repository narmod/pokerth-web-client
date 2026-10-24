#!/usr/bin/env node
// POST /stats upserts a player's snapshot without any token. Without a ceiling,
// endless new names grew the store and stats.json (rewritten on every save)
// without limit. A brand-new name is now refused (409 « board full ») once the
// historical board holds STATS_MAX_PLAYERS players (50000 by default); a known
// name is still updated. '__proto__' is refused: it would replace the store's
// prototype instead of adding a player.
// Run: node scripts/test-stats-cap.mjs   (~3 s)
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { freePort } from './lib/free-port.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const tmp = mkdtempSync(join(tmpdir(), 'statscap-'));
const F = (x) => join(tmp, x);
writeFileSync(F('a.json'), '{}');
const PORT = await freePort();
const env = Object.assign({}, process.env, { PORT: String(PORT), STATS_MAX_PLAYERS: '3', ADMIN_CONFIG_FILE: F('a.json'),
  VISITS_FILE: F('v.json'), STATS_FILE: F('s.json'), STATS_META_FILE: F('sm.json'), LAN_BOARDS_FILE: F('lb.json'), NO_PROXY: '*' });
const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls'], { cwd: root, stdio: 'ignore', env });
const base = 'http://127.0.0.1:' + PORT;
const post = (body) => fetch(base + '/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
try {
  let up = false;
  for (let i = 0; i < 80 && !up; i++) { try { up = (await fetch(base + '/robots.txt')).ok; } catch (e) {} if (!up) await new Promise((r) => setTimeout(r, 250)); }
  ok(up, 'the proxy starts');
  for (const nm of ['ann', 'bob', 'cat']) ok((await post({ name: nm, handsPlayed: 10 })).status === 200, nm + ' is added');
  const r4 = await post({ name: 'dan', handsPlayed: 5 });
  ok(r4.status === 409 && (await r4.json()).error === 'board full', 'a fourth name is refused once the board is full');
  ok((await post({ name: 'bob', handsPlayed: 20 })).status === 200, 'a known name is still updated');
  ok((await post({ name: '__proto__', handsPlayed: 1 })).status === 400, "'__proto__' is refused");
  const all = await (await fetch(base + '/stats')).json();
  ok(Object.keys(all).sort().join(',') === 'ann,bob,cat' && all.bob.handsPlayed === 20, 'the board holds the three players, bob updated');
} finally {
  await new Promise((r) => { child.once('exit', r); child.kill(); setTimeout(r, 3000); });
  try { rmSync(tmp, { recursive: true, force: true, maxRetries: 5 }); } catch (e) {}
}
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
