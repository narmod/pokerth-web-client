#!/usr/bin/env node
// Deploy › Update automatically › « Check now » (web.170). The check's reply
// had no gitUpdatable / installKind, so the shared painter read « this install
// cannot self-update » (in red) after every check, even on a git install up to
// date; a second click during a check got the previous reading at once.
// Run: node scripts/test-admin-update-check.mjs
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proxy = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public', 'admin.html'), 'utf8');
const chk = proxy.slice(proxy.indexOf("reqPathOnly === '/admin/update-check'"), proxy.indexOf("reqPathOnly === '/admin/auto-update'"));
ok((chk.match(/_autoUpdView\(\)/g) || []).length === 2, 'Check now answers like GET /admin/auto-update (one view for both)');
ok(/function updateCheck\(cb\) \{[\s\S]{0,600}_updWaiters\.push\(cb\);\s*if \(_upd\.checking\) return;/.test(proxy), 'a check already running is joined, not answered with the old reading');
const btn = html.slice(html.indexOf("$('btnUpdCheck').addEventListener"), html.indexOf("$('btnUpdCheck').addEventListener") + 700);
ok(/btn\.disabled=true/.test(btn) && /btn\.disabled=false/.test(btn), 'the button is busy while it checks');
ok(/loadStatus\(false\)/.test(btn), 'the Deploy status tile is refreshed with it');
ok(/Update \(no restart\)\\u201d applies it/.test(html) && /Update & restart\\u201d applies it/.test(html), 'automatic updates off: the message says which button applies it');

// Live: the real proxy, two checks at once.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'updchk-'));
fs.writeFileSync(path.join(tmp, 'cfg.json'), '{}');
const PORT = 18700 + Math.floor(Math.random() * 90);
const env = { PORT: String(PORT), STATS_ADMIN_TOKEN: 'tok-update-check-1', ADMIN_CONFIG_FILE: path.join(tmp, 'cfg.json') };
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'DEPLOY_HISTORY_FILE']) env[k] = path.join(tmp, k.toLowerCase() + '.json');
const px = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, env: Object.assign({}, process.env, env), stdio: 'ignore' });
try {
  await sleep(2500);
  const base = 'http://127.0.0.1:' + PORT, q = '?token=tok-update-check-1';
  const g = await (await fetch(base + '/admin/auto-update' + q)).json();
  if (!g.gitUpdatable) {
    const r = await fetch(base + '/admin/update-check' + q + '&force=1');
    ok(r.status === 409, 'not a git checkout: Check now says so (409)');
  } else {
    const [a, b] = await Promise.all([fetch(base + '/admin/update-check' + q + '&force=1').then((r) => r.json()), sleep(30).then(() => fetch(base + '/admin/update-check' + q + '&force=1').then((r) => r.json()))]);
    ok(a.gitUpdatable === true && a.installKind === g.installKind && a.branch === g.branch && 'enabled' in a && 'armed' in a, 'the reply carries what the painter reads (gitUpdatable, installKind, branch, enabled, armed)');
    ok(!a.state.checking && !b.state.checking && a.state.checkedAt > 0 && a.state.checkedAt === b.state.checkedAt, 'the second click gets the same fresh reading, not the old one');
  }
} finally { px.kill(); }
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
