#!/usr/bin/env node
// A pack upload (/admin/pkg-upload, also open to a delegate key with the
// « packages » scope) must never publish a file from outside the archive.
// `unzip -j` stops path traversal on write, but it still recreates symlink
// entries: a member « felt.png » pointing at admin-config.json or /etc/passwd
// was then followed by copyFileSync and served from /table/<id>/felt.png.
// importPackage now keeps regular files only after extraction.
// The proxy runs from a scratch copy whose public/table is a real folder, so
// the upload never touches the repository. Needs `zip` (skipped otherwise).
// Run: node scripts/test-pkg-symlink.mjs   (~5 s)
import { mkdtempSync, writeFileSync, readdirSync, symlinkSync, copyFileSync, cpSync, existsSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { freePort } from './lib/free-port.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const proxySrc = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

ok(/lstatSync\(fp\)[^\n]*if \(!st\.isFile\(\)\) fs\.rmSync\(fp/.test(proxySrc), 'importPackage drops every non-regular file after unzip');

if (spawnSync('zip', ['-v'], { stdio: 'ignore' }).status !== 0 || spawnSync('unzip', ['-v'], { stdio: 'ignore' }).status !== 0) {
  console.log('  · zip/unzip unavailable here: upload check skipped');
  console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
  process.exit(fail ? 1 : 0);
}

// Scratch copy: proxy.js copied (so __dirname is here), every other entry linked,
// public/ rebuilt with links except table/, which is a real copy.
const run = mkdtempSync(join(tmpdir(), 'pkgsym-'));
for (const e of readdirSync(root)) {
  if (e === 'proxy.js' || e === 'public' || e === '.git') continue;
  symlinkSync(join(root, e), join(run, e));
}
copyFileSync(join(root, 'proxy.js'), join(run, 'proxy.js'));
mkdirSync(join(run, 'public'));
for (const e of readdirSync(join(root, 'public'))) {
  if (e === 'table') cpSync(join(root, 'public', 'table'), join(run, 'public', 'table'), { recursive: true });
  else symlinkSync(join(root, 'public', e), join(run, 'public', e));
}
const F = (x) => join(run, x);
const SECRET = 'top-secret-' + Math.random().toString(36).slice(2);
writeFileSync(F('a.json'), JSON.stringify({ note: SECRET }));

// The malicious pack: felt.png -> the admin config (absolute link).
const zdir = join(run, 'zipsrc'); mkdirSync(zdir);
symlinkSync(F('a.json'), join(zdir, 'felt.png'));
writeFileSync(join(zdir, 'preview.png'), 'not really a png');
const zipPath = join(run, 'evil.zip');
spawnSync('zip', ['-q', '-y', zipPath, 'felt.png', 'preview.png'], { cwd: zdir });
ok(existsSync(zipPath), 'the test archive (with a symlink member) is built');

const PORT = await freePort(), TOKEN = 'pkg-symlink-token';
const env = Object.assign({}, process.env, { PORT: String(PORT), ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN, ADMIN_CONFIG_FILE: F('a.json'),
  VISITS_FILE: F('v.json'), STATS_FILE: F('s.json'), STATS_META_FILE: F('sm.json'), BROADCASTS_FILE: F('b.json'), POLLS_FILE: F('p.json'),
  DB_CONFIG_FILE: F('db.json'), DEPLOY_HISTORY_FILE: F('dh.json'), SCOPED_TOKENS_FILE: F('st.json'), AUDIT_FILE: F('au.json'), LAN_BOARDS_FILE: F('lb.json') });
const child = spawn(process.execPath, [F('proxy.js'), '--notls'], { cwd: run, stdio: 'ignore', env });
const base = 'http://127.0.0.1:' + PORT;
try {
  let up = false;
  for (let i = 0; i < 80 && !up; i++) { try { up = (await fetch(base + '/admin')).ok; } catch (e) {} if (!up) await new Promise((r) => setTimeout(r, 250)); }
  ok(up, 'the proxy starts');
  const r = await fetch(base + '/admin/pkg-upload?kind=table&name=evilpack', { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN }, body: readFileSync(zipPath) });
  const j = await r.json();
  ok(j.ok === false && /felt\.png/.test(j.error || ''), 'a pack whose felt is a symlink is refused as having no felt (' + (j.error || 'accepted') + ')');
  const dest = join(run, 'public', 'table', 'evilpack');
  const leaked = existsSync(dest) && readdirSync(dest).some((f) => { try { return readFileSync(join(dest, f), 'utf8').includes(SECRET); } catch (e) { return false; } });
  ok(!leaked, 'nothing from outside the archive lands in public/table');
  const g = await fetch(base + '/table/evilpack/felt.png');
  const body = g.ok ? await g.text() : '';
  ok(!body.includes(SECRET), 'and /table/evilpack/felt.png does not serve the admin config');
} finally {
  await new Promise((r) => { child.once('exit', r); child.kill(); setTimeout(r, 3000); });
  try { rmSync(run, { recursive: true, force: true, maxRetries: 5 }); } catch (e) {}
}
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
