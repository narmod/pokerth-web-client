#!/usr/bin/env node
// Admin ergonomics (web.175), in a browser against the real proxy:
//  · the upstream is read without automatic updates too (read-only, 2 min after
//    the start then hourly) — never applied;
//  · a planned restart opens its folded card, so its time and Cancel show;
//  · Health & logs: the Status list no longer repeats the tiles above it.
// Run: node scripts/test-admin-ergonomics.mjs
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const proxy = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
const rd = proxy.slice(proxy.indexOf('function _upstreamRead()'), proxy.indexOf('function _upstreamRead()') + 400);
ok(/_autoUpdateCfg\(\)\.enabled/.test(rd) && /updateCheck\(\);/.test(rd) && !/_autoUpdateApply|runDetached/.test(rd), 'without automatic updates, a read-only upstream check (it never applies anything)');
ok(/setTimeout\(_upstreamRead, 2 \* 60 \* 1000\)/.test(proxy) && /setInterval\(_upstreamRead, UPSTREAM_READ_MS\)/.test(proxy), '2 minutes after the start, then hourly');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ergo-'));
fs.writeFileSync(path.join(tmp, 'cfg.json'), '{}');
const TOK = 'tok-ergo-test-12', PORT = 18300 + Math.floor(Math.random() * 90);
const env = { PORT: String(PORT), STATS_ADMIN_TOKEN: TOK, ADMIN_CONFIG_FILE: path.join(tmp, 'cfg.json') };
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'DEPLOY_HISTORY_FILE']) env[k] = path.join(tmp, k.toLowerCase() + '.json');
const px = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, env: Object.assign({}, process.env, env), stdio: 'ignore' });
const base = 'http://127.0.0.1:' + PORT;
const b = await chromium.launch();
try {
  await sleep(2500);
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
  await pg.addInitScript((t) => { try { localStorage.setItem('pth_admin_tok', t); } catch (e) {} }, TOK);
  await pg.goto(base + '/admin'); await sleep(2500);
  await pg.evaluate(() => document.querySelector('.tab[data-t="server"]').click()); await sleep(1500);
  const rows = await pg.evaluate(() => [...document.querySelectorAll('#status .srow span')].map((s) => s.textContent));
  ok(rows.length && !rows.includes('Uptime') && !rows.includes('Connected sockets') && !rows.includes('Active sessions') && !rows.includes('Build version'), 'Status no longer repeats the tiles (' + rows.join(', ') + ')');
  ok(rows.includes('Server time') && rows.includes('Install') && rows.includes('Node'), 'and keeps what they do not show');
  await pg.evaluate(() => document.querySelector('.tab[data-t="deploy"]').click()); await sleep(1200);
  const folded = () => pg.evaluate(() => { const h = [...document.querySelectorAll('#panel-deploy h2')].find((x) => /Schedule a restart/.test(x.textContent)); return h.classList.contains('collapsed'); });
  ok(await folded(), 'Schedule a restart starts folded');
  // Planned elsewhere (another operator, the automatic updates): on the way back to Deployment…
  await pg.evaluate(() => document.querySelector('.tab[data-t="server"]').click()); await sleep(500);
  await fetch(base + '/admin/schedule-restart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seconds: 3600, kind: 'restart', token: TOK }) });
  await pg.evaluate(() => document.querySelector('.tab[data-t="deploy"]').click()); await sleep(1500);
  ok(!(await folded()), 'a planned restart opens it');
  ok(await pg.evaluate(() => document.getElementById('schedCancel').offsetParent !== null), 'its Cancel button shows');
  await fetch(base + '/admin/cancel-restart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: TOK }) });
  ok(errs.length === 0, 'nothing threw' + (errs[0] ? ': ' + errs[0] : ''));
} finally { await b.close(); px.kill(); }
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
