#!/usr/bin/env node
// Deployment reliability (web.172), on a throw-away clone with a real git
// origin and the real proxy:
//  · a rollback sets its version aside: the automatic updates leave it alone
//    until a newer one is published; going forward by hand clears that;
//  · a release whose package.json only moved its version (plus client files) is
//    « client files only », and the proxy code is not « restart needed »;
//  · one deploy action at a time; pending writes (the audit entry of the very
//    restart click) reach the disk before the process exits;
//  · plus the wiring: the automatic flag goes with the planned action, the
//    automatic restart sends its notice, the panel locks during a rollback.
// Run: node scripts/test-admin-deploy.mjs
import { spawn, execFileSync } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';
import { fileURLToPath } from 'url';
import { freePort, waitForServer } from './lib/free-port.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const proxySrc = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
const fnSrc = (name) => { const a = proxySrc.indexOf('function ' + name + '('); const b = proxySrc.indexOf('\n}\n', a); return proxySrc.slice(a, b + 2); };

// ── Pure rules ──────────────────────────────────────────────────────────
const rules = new Function(fnSrc('_pathNeedsRestart') + fnSrc('_pkgDiffNeedsRestart') + fnSrc('_filesNeedRestart') + 'return { _pathNeedsRestart, _pkgDiffNeedsRestart, _filesNeedRestart };')();
const vOnly = '@@ -3 +3 @@\n-  "version": "2.1.10-web.170",\n+  "version": "2.1.10-web.171",\n@@ -24,0 +25 @@\n+    "test:admin-safety": "node scripts/test-admin-safety.mjs",';
const dep = '@@ -40 +40 @@\n-    "ws": "^8.17.0"\n+    "ws": "^8.18.0"';
ok(!rules._filesNeedRestart(['package.json', 'public/pokerth.js', 'scripts/test-x.mjs', 'CHANGELOG.md'], vOnly), 'version bump + client files + tests: no restart');
ok(rules._filesNeedRestart(['package.json'], dep), 'a dependency change: restart');
ok(rules._filesNeedRestart(['proxy.js'], '') && rules._filesNeedRestart(['server/lan-boards.js'], ''), 'proxy.js or server/: restart');
ok(/function clearScheduledRestart\(\) \{[^}]*\}\s*_restartAt = 0; _restartKind = ''; _restartNotice = ''; _autoArmed = false;/.test(proxySrc), 'the automatic flag goes with the planned action');
ok(/_autoArmed = true;[\s\S]{0,400}broadcastNotice\(_restartNotice\)/.test(proxySrc), 'an automatic restart sends its notice when armed');
ok(/reqPathOnly === '\/admin\/cancel-restart'[\s\S]{0,400}if \(_autoArmed && _upd\.remote\) _autoSkipSet\(\[_upd\.remote\], 'cancel'\)/.test(proxySrc), 'cancelling an automatic restart sets that version aside (no re-arm a minute later)');
ok(/if \(_autoSkipped\(\)\) return;/.test(fnSrc('_autoUpdateApply')), 'the automatic updates skip a version set aside');
const html = fs.readFileSync(path.join(root, 'public', 'admin.html'), 'utf8');
ok(/function rbGo[\s\S]{0,700}maintBusy\(true\)/.test(html), 'a rollback locks the deploy buttons');
ok(/btn\.disabled=srvBusy\|\|!_canSelfUpdate/.test(html), 'Check now does not unlock what a running action locked');
ok(/maintCaps\(d\.gitUpdatable, d\.canUpdate\)/.test(html), 'an install with UPDATE_CMD keeps « Update & restart »');

// ── A throw-away clone: A (this code) → B (version bump + a client file) ──
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-'));
const bare = path.join(T, 'origin.git'), clone = path.join(T, 'app');
const g = (cwd, ...a) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...a], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
execFileSync('git', ['init', '-q', '--bare', '-b', 'main', bare]);
// The working tree as it is (this checkout may be shallow: a fresh history).
fs.mkdirSync(clone);
execFileSync('sh', ['-c', 'git -C "$0" archive HEAD | tar -x -C "$1"', root, clone]);
for (const f of ['proxy.js', 'public/admin.html', 'public/modules/admin/overview.mjs', 'package.json']) fs.copyFileSync(path.join(root, f), path.join(clone, f));
execFileSync('git', ['init', '-q', '-b', 'main', clone]);
g(clone, 'remote', 'add', 'origin', bare);
g(clone, 'add', '-A'); g(clone, 'commit', '-q', '-m', 'A');
const A = g(clone, 'rev-parse', 'HEAD');
const pj = JSON.parse(fs.readFileSync(path.join(clone, 'package.json'), 'utf8'));
fs.writeFileSync(path.join(clone, 'package.json'), fs.readFileSync(path.join(clone, 'package.json'), 'utf8').replace('"version": "' + pj.version + '"', '"version": "' + pj.version + '-b"'));
fs.appendFileSync(path.join(clone, 'public', 'ChangeLog-web'), '\n');
g(clone, 'commit', '-q', '-am', 'B');
const B = g(clone, 'rev-parse', 'HEAD');
g(clone, 'push', '-q', 'origin', 'main');
fs.symlinkSync(path.join(root, 'node_modules'), path.join(clone, 'node_modules'));
const tmpd = path.join(T, 'tmp'); fs.mkdirSync(tmpd);
fs.writeFileSync(path.join(T, 'cfg.json'), '{}');
fs.writeFileSync(path.join(T, 'hist.json'), JSON.stringify([{ sha: A, version: pj.version, subject: 'A', seen: Date.now() - 6e4, last: Date.now() - 6e4, reason: 'seed' }]));
const TOK = 'tok-deploy-test-1';
const PORT = await freePort();
const env = { PORT: String(PORT), STATS_ADMIN_TOKEN: TOK, ADMIN_CONFIG_FILE: path.join(T, 'cfg.json'), DEPLOY_HISTORY_FILE: path.join(T, 'hist.json'), TMPDIR: tmpd, RATE_LIMIT_DISABLED: '1' };
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE']) env[k] = path.join(T, k.toLowerCase() + '.json');
const base = 'http://127.0.0.1:' + PORT;
const post = (p, b) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ token: TOK }, b || {})) }).then(async (r) => ({ status: r.status, d: await r.json().catch(() => null) }));
const get = (p) => fetch(base + p + (p.includes('?') ? '&' : '?') + 'token=' + TOK).then((r) => r.json());
const waitLog = async (tag) => { for (let i = 0; i < 40; i++) { await sleep(500); const l = await get('/admin/update-log'); const m = new RegExp('^\\[' + tag + '\\] (ok|failed)', 'm').exec((l && l.log) || ''); if (m) return m[1]; } return 'timeout'; };
const start = () => { const px = spawn(process.execPath, [path.join(clone, 'proxy.js'), '--notls'], { cwd: clone, env: Object.assign({}, process.env, env), stdio: 'ignore' }); return px; };
let px = start();
try {
  await waitForServer(base, px);
  let st = await get('/admin/status');
  ok(st.ok && st.gitUpdatable === true && st.codeStale === false && st.supervised === false, 'status: git install, code as booted, no supervisor detected (started by hand)');
  // Rollback B → A, without restart.
  let r = await post('/admin/deploys', { rollback: A, restart: false });
  ok(r.status === 200 && r.d.ok, 'rollback to the previous version starts');
  ok((await waitLog('rollback')) === 'ok' && g(clone, 'rev-parse', 'HEAD') === A, 'the rollback ends with its outcome line, on A');
  const cfg = JSON.parse(fs.readFileSync(path.join(T, 'cfg.json'), 'utf8'));
  ok(cfg.autoUpdate && cfg.autoUpdate.skip && cfg.autoUpdate.skip.shas.includes(B) && cfg.autoUpdate.skip.why === 'rollback', 'the version rolled back from is set aside (kept on disk)');
  r = await fetch(base + '/admin/update-check?force=1&token=' + TOK).then((x) => x.json());
  ok(r.state.available && r.state.remote === B, 'the check sees B upstream');
  ok(r.state.needsRestart === false, 'B (version bump + a client file) is « client files only »: the no-restart path can apply it');
  ok(r.state.skipped === true && r.state.skipWhy === 'rollback', 'and the automatic updates leave it alone');
  st = await get('/admin/status');
  ok(st.version !== st.runningVersion && st.codeStale === false, 'the version moved but the proxy code did not: no « restart needed »');
  // Going forward by hand clears the skip.
  r = await post('/admin/update-nr');
  ok(r.status === 200 && (await waitLog('update-nr')) === 'ok' && g(clone, 'rev-parse', 'HEAD') === B, 'Update (no restart) brings B back');
  r = await fetch(base + '/admin/update-check?force=1&token=' + TOK).then((x) => x.json());
  const cfg2 = JSON.parse(fs.readFileSync(path.join(T, 'cfg.json'), 'utf8'));
  ok(!r.state.available && !(cfg2.autoUpdate && cfg2.autoUpdate.skip), 'up to date, nothing set aside any more');
  // One action at a time; the restart's own audit entry survives the exit.
  r = await post('/admin/restart');
  const r2 = await post('/admin/update-nr');
  ok(r.status === 200 && r2.status === 409 && r2.d.busy, 'a second deploy action during the first is refused (' + r2.status + ')');
  for (let i = 0; i < 20 && px.exitCode === null; i++) await sleep(250);
  ok(px.exitCode !== null, 'the restart stopped the process (nothing supervises it here)');
  const au = JSON.parse(fs.readFileSync(env.AUDIT_FILE, 'utf8'));
  ok(au.some((x) => x.action === 'restart'), 'the audit entry of the restart click reached the disk before the exit');
} finally { try { px.kill(); } catch (e) {} try { fs.rmSync(T, { recursive: true, force: true }); } catch (e) {} }
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
