#!/usr/bin/env node
// Admin settings backup & restore: nothing is lost, nothing secret leaks.
// Run: node scripts/test-admin-config-io.mjs
//
// A restore REPLACES the whole configuration and keeps only the listed keys,
// so every key the code writes must be listed (musicVotesPublic was not, and a
// round-trip wiped it). The file leaves out the Discord webhook and the
// contact of pending LAN requests unless asked, and a restore of such a file
// keeps the current values instead of erasing them. The server list keeps its
// TLS pins through the dashboard's "Save all".
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const proxySrc = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
const admin = fs.readFileSync(path.join(root, 'public', 'admin.html'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── Static: the key catalogue covers every key the code writes ────────────
const cat = /const ADMIN_CONFIG_KEYS = Object\.freeze\(\[([\s\S]*?)\]\);/.exec(proxySrc);
ok(!!cat, 'ADMIN_CONFIG_KEYS is found');
const KEYS = cat ? [...cat[1].matchAll(/'([A-Za-z]+)'/g)].map(m => m[1]) : [];
const srcs = [proxySrc].concat(fs.readdirSync(path.join(root, 'server')).filter(f => f.endsWith('.js'))
  .map(f => fs.readFileSync(path.join(root, 'server', f), 'utf8')));
const written = new Set();
for (const s of srcs) for (const m of s.matchAll(/_adminConfig\.([A-Za-z]+)\s*=(?!=)/g)) written.add(m[1]);
for (const k of written) ok(KEYS.includes(k), 'written key "' + k + '" survives a restore');
ok(/const ALLOWED = ADMIN_CONFIG_KEYS;/.test(proxySrc), 'the import filters on that catalogue, not on a copy of it');

// ── Static: the dashboard side ────────────────────────────────────────────
ok(!/config\/export\?token=/.test(admin), 'the backup download never puts the token in the URL');
ok(/api\('\/admin\/config\/export'/.test(admin), 'it is fetched with the Authorization header like every other call');
ok(/pins:Array\.isArray\(s\.pins\)/.test(admin), 'the server rows keep their TLS pins when loaded, so Save all cannot erase them');
ok(!/10\.7\.7\.150|ddns\.net/.test(admin.slice(admin.indexOf('function renderServers'), admin.indexOf('function loadServers'))),
  'no private address or personal host name in the server form');

// ── Live: export, redaction, restore ──────────────────────────────────────
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cfgio-'));
const F = (n) => path.join(tmp, n);
const HOOK = 'https://discord.com/api/webhooks/123/abc';
const PIN = 'A'.repeat(43) + '=';
const start = {
  discordChatWebhookUrl: HOOK, musicVotesPublic: true, serverName: 'Before',
  servers: [{ id: 'srv_a', name: 'A', host: 'game.example.org', port: 7236, tls: true, sni: '', noverify: false, pins: [PIN] }],
  lanDirectory: { settings: {}, entries: [], pending: [{ id: 'req1', host: 'lan.example.org', port: 7234, nick: 'Bob', contact: 'bob@example.org' }] },
};
fs.writeFileSync(F('admin-config.json'), JSON.stringify(start));
const PORT = 18000 + Math.floor(Math.random() * 900);
const TOKEN = 'cfgio-test-token';
const env = Object.assign({}, process.env, {
  PORT: String(PORT), ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN,
  ADMIN_CONFIG_FILE: F('admin-config.json'), VISITS_FILE: F('visits.json'), STATS_FILE: F('stats.json'),
  STATS_META_FILE: F('stats.meta.json'), BROADCASTS_FILE: F('broadcasts.json'), POLLS_FILE: F('polls.json'),
  DB_CONFIG_FILE: F('db-config.json'), DEPLOY_HISTORY_FILE: F('deploy-history.json'),
  SCOPED_TOKENS_FILE: F('scoped-tokens.json'), AUDIT_FILE: F('admin-audit.json'), LAN_BOARDS_FILE: F('lan-boards.json'),
});
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env });
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; }); proxy.stderr.on('data', (d) => { plog += d; });
const base = 'http://127.0.0.1:' + PORT;
const H = { Authorization: 'Bearer ' + TOKEN };
const get = (p) => fetch(base + p, { headers: H }).then(r => r.json()).catch(() => null);
const post = (p, body) => fetch(base + p, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, H), body: JSON.stringify(body) }).then(r => r.json()).catch(() => null);
let up = false;
for (let i = 0; i < 80 && !up; i++) { await new Promise(r => setTimeout(r, 150)); up = !!((await get('/admin/whoami')) || {}).ok; }
try {
  ok(up, 'proxy up');
  const plain = await get('/admin/config/export');
  ok(plain && plain.config && !('discordChatWebhookUrl' in plain.config), 'the export leaves the Discord webhook out by default');
  const pend = plain && plain.config.lanDirectory && plain.config.lanDirectory.pending;
  ok(Array.isArray(pend) && pend.length === 1 && !pend[0].contact && pend[0].nick === 'Bob', 'and the requester\'s contact, keeping the request itself');
  ok(plain && plain.redacted.includes('discordChatWebhookUrl') && plain.redacted.includes('lanDirectory.pending.contact'), 'the file lists what it left out');
  ok(plain && plain.config.musicVotesPublic === true, 'musicVotesPublic is exported');
  const full = await get('/admin/config/export?secrets=1');
  ok(full && full.config.discordChatWebhookUrl === HOOK && full.config.lanDirectory.pending[0].contact === 'bob@example.org' && full.redacted.length === 0,
    'with secrets=1 everything is in the file');

  // Restore the redacted file after changing a plain setting.
  const file = JSON.parse(JSON.stringify(plain)); file.config.serverName = 'After';
  const imp = await post('/admin/config/import', { file, config: file.config });
  ok(imp && imp.ok && imp.kept.length === 2, 'the restore succeeds and reports what it kept');
  await new Promise(r => setTimeout(r, 200));
  const back = JSON.parse(fs.readFileSync(F('admin-config.json'), 'utf8'));
  ok(back.serverName === 'After', 'the restored settings are applied');
  ok(back.discordChatWebhookUrl === HOOK, 'the current webhook is kept, not erased');
  ok(back.lanDirectory.pending[0].contact === 'bob@example.org', 'the current contact of the pending request is kept');
  ok(back.musicVotesPublic === true, 'musicVotesPublic survives the round-trip');
  ok(Array.isArray(back.servers) && back.servers[0].pins[0] === PIN, 'the server keeps its TLS pin');

  // A file that does not say it left something out restores exactly what it holds.
  const bare = { config: { serverName: 'Bare' } };
  const imp2 = await post('/admin/config/import', bare);
  await new Promise(r => setTimeout(r, 200));
  const back2 = JSON.parse(fs.readFileSync(F('admin-config.json'), 'utf8'));
  ok(imp2 && imp2.ok && back2.serverName === 'Bare' && !back2.discordChatWebhookUrl, 'a file without a "redacted" list replaces everything, as before');

  // Save all from the dashboard sends the rows it loaded, pins included.
  const srv = await post('/admin/servers', { servers: [{ id: 'srv_b', name: 'B', host: 'b.example.org', port: 7236, tls: true, pins: [PIN, 'bad'] }], activeServerId: 'srv_b' });
  const list = await get('/admin/servers');
  ok(srv && srv.ok && list.servers[0].pins.length === 1 && list.servers[0].pins[0] === PIN, 'pins are stored and an invalid one is dropped');
} finally {
  proxy.kill('SIGTERM');
  if (fail) console.error(plog.slice(-1500));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
