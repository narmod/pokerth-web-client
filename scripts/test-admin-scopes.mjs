#!/usr/bin/env node
// Delegate keys and scheduled messages (web.173):
//  · the CLI (install.sh token add) knows every scope the server has;
//  · whoami gives a delegate key's name, which the sidebar shows;
//  · a message sent by hand counts toward its « max runs », and the timer
//    already armed does not send one more.
// Run: node scripts/test-admin-scopes.mjs
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const proxy = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
const sh = fs.readFileSync(path.join(root, 'install.sh'), 'utf8');
const server = JSON.parse((/const ADMIN_SCOPES = (\[[^\]]*\])/.exec(proxy) || [, '[]'])[1].replace(/'/g, '"')).sort();
const cli = ((/^TOKEN_SCOPES="([^"]*)"/m.exec(sh) || [, ''])[1]).split(/\s+/).filter(Boolean).sort();
ok(server.length > 0 && JSON.stringify(server) === JSON.stringify(cli), 'install.sh token add knows the same scopes as the server (' + cli.join(' ') + ')');
const html = fs.readFileSync(path.join(root, 'public', 'admin.html'), 'utf8');
ok(/info\.label \? 'key \\u201c'\+info\.label/.test(html), 'the sidebar shows the key name when whoami gives it');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scopes-'));
fs.writeFileSync(path.join(tmp, 'cfg.json'), '{}');
const TOK = 'tok-scopes-test-1', PORT = 18400 + Math.floor(Math.random() * 90);
const env = { PORT: String(PORT), STATS_ADMIN_TOKEN: TOK, ADMIN_CONFIG_FILE: path.join(tmp, 'cfg.json') };
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'DEPLOY_HISTORY_FILE']) env[k] = path.join(tmp, k.toLowerCase() + '.json');
const px = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, env: Object.assign({}, process.env, env), stdio: 'ignore' });
const base = 'http://127.0.0.1:' + PORT;
const post = (p, b, t) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ token: t || TOK }, b)) }).then((r) => r.json());
try {
  await sleep(2500);
  const k = await post('/admin/tokens', { name: 'music-partner', scopes: ['music', 'polls'] });
  ok(k.ok && k.token, 'a delegate key with the polls scope');
  const who = await fetch(base + '/admin/whoami?token=' + k.token).then((r) => r.json());
  ok(who.ok && who.master === false && who.label === 'music-partner' && who.scopes.join() === 'music,polls', 'whoami names it (' + who.label + ')');
  // Every minute, at most once: sent by hand, nothing more is planned.
  const b = await post('/admin/broadcasts', { message: 'Hello', schedule: { type: 'interval', minutes: 1 }, maxRuns: 1 });
  ok(b.ok, 'a scheduled message, at most once');
  const id = b.id || (b.job && b.job.id) || ((await fetch(base + '/admin/broadcasts?token=' + TOK).then((r) => r.json())).jobs || [])[0].id;
  const f = await post('/admin/broadcasts/fire', { id });
  ok(f.ok, 'sent by hand');
  const list = await fetch(base + '/admin/broadcasts?token=' + TOK).then((r) => r.json());
  const j = (list.jobs || list.broadcasts || []).find((x) => x.id === id);
  ok(j && j.runCount === 1 && j.nextRun === null, 'it counts: 1/1 sent, nothing planned after (' + (j && j.nextRun) + ')');
} finally { px.kill(); }
ok(/_bcTimers\[job\.id\] = setTimeout\(function \(\) \{\s*if \(job\.maxRuns && \(job\.runCount \|\| 0\) >= job\.maxRuns\)/.test(proxy), 'a timer armed before the maximum was reached does not send one more');
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
