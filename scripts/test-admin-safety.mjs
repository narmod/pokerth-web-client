#!/usr/bin/env node
// Admin data safety (web.171), against the real proxy:
//  · a restore that changes the reset period moves the period marker too
//    (left on the old one, the hourly rotation wiped the leaderboard);
//  · a restore cleans the game servers, the proxy allowlist and the ban list
//    as their own Save buttons do;
//  · every admin write is audited, brute-force limiter or not, and the
//    leaderboard wipe / player removal (through /stats) are audited and guarded;
//  · a refused /admin/config changes nothing (SEO, time zone…), and values out
//    of range are refused instead of silently dropped;
//  · big playlists and multilingual polls fit; a past end date is refused.
// Run: node scripts/test-admin-safety.mjs
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';
import { fileURLToPath } from 'url';
import { freePort, waitForServer } from './lib/free-port.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TOK = 'tok-admin-safety-123';

async function start(cfg, extraEnv) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'admsafe-'));
  fs.writeFileSync(path.join(tmp, 'cfg.json'), JSON.stringify(cfg));
  const PORT = await freePort();
  const env = { PORT: String(PORT), STATS_ADMIN_TOKEN: TOK, ADMIN_CONFIG_FILE: path.join(tmp, 'cfg.json') };
  for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'DEPLOY_HISTORY_FILE']) env[k] = path.join(tmp, k.toLowerCase() + '.json');
  const px = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, env: Object.assign({}, process.env, env, extraEnv || {}), stdio: 'ignore' });
  const base = 'http://127.0.0.1:' + PORT;
  const post = (p, body) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ token: TOK }, body)) }).then(async (r) => ({ status: r.status, d: await r.json().catch(() => null) }));
  const get = (p) => fetch(base + p + (p.includes('?') ? '&' : '?') + 'token=' + TOK).then((r) => r.json());
  return { px, tmp, base, post, get, env };
}

// ── 1. Limiter on ────────────────────────────────────────────────────────
let s = await start({ resetPeriod: 'weekly', bannedIps: ['5.6.7.8'] });
try {
  await waitForServer(s.base, s.px);
  // Restore: reset period, servers, proxy allowlist, bans.
  let r = await s.post('/admin/config/import', { config: {
    resetPeriod: 'monthly',
    servers: [{ host: 'bad host!', port: 7234 }, { host: 'Game.Example.org', port: 99999, name: 'G' }],
    proxyCfg: { allowedHosts: ['evil host/x', 'good.example'], graceSec: 3, maxClients: 50 },
    bannedIps: ['127.0.0.1', '::1', '1.2.3.4', '1.2.3.4', 'not-an-ip'],
  } });
  ok(r.status === 200 && r.d && r.d.ok, 'a restore goes through');
  await sleep(300);
  const meta = JSON.parse(fs.readFileSync(s.env.STATS_META_FILE, 'utf8'));
  ok(/^\d{4}-\d{2}$/.test(String(meta.period)), 'the period marker follows the restored period (' + meta.period + '): no wipe at the next rotation');
  const cfg = JSON.parse(fs.readFileSync(path.join(s.tmp, 'cfg.json'), 'utf8'));
  ok(cfg.servers.length === 1 && cfg.servers[0].host === 'game.example.org' && cfg.servers[0].port === 7234, 'servers cleaned as the Save button does (bad host dropped, port fixed)');
  ok(JSON.stringify(cfg.proxyCfg.allowedHosts) === '["good.example"]' && cfg.proxyCfg.graceSec === undefined && cfg.proxyCfg.maxClients === 50, 'the proxy allowlist keeps only valid hosts, out-of-range values dropped');
  ok(JSON.stringify(cfg.bannedIps) === '["1.2.3.4"]', 'the ban list never holds the loopback, junk or duplicates');

  // A refused config changes nothing.
  r = await s.post('/admin/config', { serverName: 'Changed', seo: { enabled: true, publicUrl: 'not a url' } });
  let c2 = await s.get('/admin/config');
  ok(r.status === 400 && c2.serverName === '' && !(c2.seo && c2.seo.enabled), 'a refused SEO save leaves everything as it was (server name, indexing)');
  const robots = await fetch(s.base + '/robots.txt').then((x) => x.text());
  ok(/Disallow: \//.test(robots), 'robots.txt still says no indexing');
  r = await s.post('/admin/config', { resetPeriod: 'daily', clockRef: 'Nowhere/Zone' });
  c2 = await s.get('/admin/config');
  ok(r.status === 400 && c2.resetPeriod === 'monthly', 'a refused request does not change the reset period either');
  r = await s.post('/admin/config', { proxyCfg: { allowedHosts: [], graceSec: '5' } });
  ok(r.status === 400 && /between 10 and 900/.test(r.d.error), 'grace out of range: refused with a reason (' + r.d.error + ')');
  r = await s.post('/admin/config', { tableDefaults: { players: 20 } });
  ok(r.status === 400 && /players/.test(r.d.error), 'table default out of range: refused');
  r = await s.post('/admin/config', { loginDefaults: { proxyUrl: 'http://x.example' } });
  ok(r.status === 400 && /proxy URL/.test(r.d.error), 'a proxy URL that is not ws(s):// is refused, not emptied');
  r = await s.post('/admin/config', { proxyCfg: { allowedHosts: ['ok.example'], graceSec: '60' }, tableDefaults: { players: 6 } });
  ok(r.status === 200 && r.d.ok, 'valid values are still saved');

  // Audit: config writes and the leaderboard's admin actions.
  await s.post('/stats', { name: 'Alice', handsPlayed: 3 });
  r = await s.post('/stats', { name: 'Alice', _delete: true });
  ok(r.status === 200, 'remove a player from the leaderboard');
  r = await s.post('/stats', { _resetAll: true });
  ok(r.status === 200, 'wipe the leaderboard');
  await sleep(200);
  let au = await s.get('/admin/audit');
  const acts = (au.entries || au.log || []).map((x) => x.action);
  ok(acts.includes('leaderboard/delete') && acts.includes('leaderboard/reset'), 'both are in the audit log');
  ok(acts.includes('config/import') && acts.includes('config'), 'and the settings writes');
  // Bodies the routes allow.
  const big = {}; for (let i = 0; i < 80; i++) big['l' + i] = 'Q'.repeat(290);
  const opts = []; for (let j = 0; j < 8; j++) { const o = {}; for (let i = 0; i < 80; i++) o['l' + i] = 'O'.repeat(110); opts.push({ id: 'o' + (j + 1), label: o }); }
  r = await s.post('/admin/polls', { question: big, options: opts, default: 'l0' }).catch(() => ({ status: 0 }));
  ok(r.status === 200 && r.d && r.d.ok, 'a poll in 80 languages gets an answer (' + r.status + '), not a cut connection');
  const m3u = '#EXTM3U\n' + Array.from({ length: 700 }, (_, i) => '#EXTINF:-1,Radio ' + i + '\nhttps://radio' + i + '.example/stream.mp3').join('\n');
  r = await s.post('/admin/music-radio-import', { m3u }).catch(() => ({ status: 0 }));
  ok(r.status === 200 && r.d && r.d.ok, 'a ' + Math.round(m3u.length / 1024) + ' KB playlist gets an answer (' + r.status + ')');
  r = await s.post('/admin/broadcasts', { message: 'Hi', schedule: { type: 'once', at: Date.now() + 3600e3 }, endAt: Date.now() - 60e3 });
  ok(r.status === 400 && /end date/.test((r.d && r.d.error) || ''), 'a past end date is refused (' + (r.d && r.d.error) + ')');
  // Wrong tokens on /stats count toward the brute-force block.
  let last = 0;
  for (let i = 0; i < 11; i++) { last = (await fetch(s.base + '/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _resetAll: true, token: 'wrong' }) })).status; }
  ok(last === 429, 'ten wrong tokens on the leaderboard wipe block the address (' + last + ')');

} finally { s.px.kill(); }

// ── 2. Limiter off: writes are still audited ────────────────────────────
s = await start({}, { RATE_LIMIT_DISABLED: '1' });
try {
  await waitForServer(s.base, s.px);
  await s.post('/admin/config', { serverName: 'No limiter' });
  await sleep(200);
  const au = await s.get('/admin/audit');
  ok((au.entries || au.log || []).some((x) => x.action === 'config'), 'without the brute-force limiter, a settings write is still audited');
} finally { s.px.kill(); }

// ── 3. Dashboard ────────────────────────────────────────────────────────
const html = fs.readFileSync(path.join(root, 'public', 'admin.html'), 'utf8');
ok(/id="plListMsg"/.test(html) && /function plPost[\s\S]{0,700}Failed: /.test(html) && /function plPost[\s\S]{0,900}Network error/.test(html), 'poll actions say when they fail');
const ov = fs.readFileSync(path.join(root, 'public', 'modules', 'admin', 'overview.mjs'), 'utf8');
ok(/'leaderboard\/reset': /.test(ov) && /'leaderboard\/delete': /.test(ov), 'the audit log names the leaderboard actions');
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
