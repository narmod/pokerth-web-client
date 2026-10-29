#!/usr/bin/env node
// Audit of 2026-10-29 (web.340) — the proxy:
//   · one request with a target url.parse() cannot read (`GET //%C0@x/`,
//     `GET http://[::1/`) used to kill the process, every game with it;
//   · same-origin SVG (packs are imported by delegate keys) opened as a page
//     could run script next to /admin's stored token → sandboxing CSP;
//   · /admin is never framed;
//   · music credit links: http(s) only (javascript: was served to players);
//   · anonymous 403s could push every real entry out of the audit log;
//   · large admin bodies were buffered in full before the token check;
//   · a UTF-8 character split between two chunks was saved as two U+FFFD.
// Run: node scripts/test-proxy-hardening.mjs   (~6 s)
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import net from 'node:net';
import http from 'node:http';
import { freePort, waitForServer } from './lib/free-port.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tmp = mkdtempSync(join(tmpdir(), 'pxhard-'));
const F = (x) => join(tmp, x);
writeFileSync(F('cfg.json'), '{}');
const TOK = 'master-tok-0123456789abcdef', PORT = await freePort();
const env = { PORT: String(PORT), STATS_ADMIN_TOKEN: TOK, ADMIN_ENABLED: '1', ADMIN_CONFIG_FILE: F('cfg.json'), PREFS_DIR: F('prefs'), DB_CONFIG_FILE: F('db.json'), NO_PROXY: '*' };
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'DEPLOY_HISTORY_FILE', 'LAN_BOARDS_FILE']) env[k] = F(k.toLowerCase() + '.json');
const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls'], { cwd: root, env: Object.assign({}, process.env, env), stdio: 'ignore' });
let exited = false; child.once('exit', () => { exited = true; });
const base = 'http://127.0.0.1:' + PORT;
const raw = (line, extra) => new Promise((res) => {
  const s = net.connect(PORT, '127.0.0.1', () => s.write(line + '\r\nHost: x\r\n' + (extra || '') + '\r\n'));
  let d = ''; s.on('data', (c) => { d += c; }); s.on('error', () => res(d)); s.on('close', () => res(d));
  setTimeout(() => { s.destroy(); res(d); }, 1500);
});
const head = (p) => new Promise((res) => http.get({ host: '127.0.0.1', port: PORT, path: p }, (r) => { r.resume(); res(r); }).on('error', () => res(null)));
const adminPost = (p, body, hdr) => fetch(base + p, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOK }, hdr || {}), body: JSON.stringify(body) });

try {
  await waitForServer(base, child);
  ok(true, 'the proxy starts');

  // ── malformed request targets ──
  for (const t of ['//t[.]@%@', '//%C0@x/', '//x@[x/admin', 'http://[::1/']) {
    await raw('GET ' + t + ' HTTP/1.1');
    await sleep(100);
    ok(!exited, 'GET ' + t + ': the process is still up');
  }
  await raw('GET //%C0@x/?host=pokerth.net HTTP/1.1', 'Upgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n');
  await sleep(150);
  ok(!exited, 'WebSocket upgrade to //%C0@x/: the process is still up');
  ok((await fetch(base + '/robots.txt')).status === 200, 'and it still answers');

  // ── SVG and admin headers ──
  const svg = await head('/favicon.svg');
  ok(svg && /sandbox/.test(svg.headers['content-security-policy'] || '') && /default-src 'none'/.test(svg.headers['content-security-policy']), 'an SVG is served with a sandboxing CSP');
  const png = await head('/favicon-32.png');
  ok(png && !png.headers['content-security-policy'], 'a PNG is not');
  const adm = await head('/admin');
  ok(adm && /frame-ancestors 'none'/.test(adm.headers['content-security-policy'] || ''), '/admin cannot be framed');

  // ── music credit links ──
  let r = await adminPost('/admin/music-radio-add', { title: 'R', url: 'https://radio.example.org/live.mp3', credit: 'c', licenseUrl: 'javascript:alert(1)', sourceUrl: 'https://ok.example.org/' });
  const tracks = await fetch(base + '/music/tracks.json').then((x) => x.json()).catch(() => null);
  const list = tracks && (tracks.tracks || tracks);
  const rad = Array.isArray(list) ? list.find((t) => t && t.title === 'R' || t && t.name === 'R') : null;
  if (r.status === 200 && rad) {
    ok(rad.licenseUrl === '' && rad.sourceUrl === 'https://ok.example.org/', 'music: javascript: link dropped, https kept');
  } else {
    // route shape changed: check the sanitiser directly
    ok(false, 'music radio-add reachable for the check (status ' + r.status + ')');
  }

  // ── audit log: anonymous entries capped ──
  await adminPost('/admin/clear-logs', {});
  const ps = [];
  for (let i = 0; i < 120; i++) ps.push(fetch(base + '/admin/restart', { method: 'POST', body: '{}', headers: { 'X-Forwarded-For': '198.51.100.' + (i % 250) } }).then((x) => x.status));
  await Promise.all(ps);
  const a = await fetch(base + '/admin/audit', { headers: { Authorization: 'Bearer ' + TOK } }).then((x) => x.json());
  const anon = (a.entries || []).filter((e) => e.actor === 'unauthenticated').length;
  ok(anon > 0 && anon <= 50, 'audit: anonymous attempts kept but capped (' + anon + ')');
  ok((a.entries || []).some((e) => e.master), 'audit: the master entry is still there');

  // ── anonymous large admin bodies: at most two read in full at a time ──
  const bigOne = () => new Promise((res) => {
    const rq = http.request({ host: '127.0.0.1', port: PORT, path: '/admin/config/import', method: 'POST', agent: false, headers: { 'Content-Type': 'application/json', 'Content-Length': 2 * 1024 * 1024 } }, (rr) => { rr.resume(); res('answered ' + rr.statusCode); });
    rq.on('error', () => res('cut'));
    rq.write('{"x":"' + 'a'.repeat(64 * 1024));
    setTimeout(() => { try { rq.end('"}'); } catch (e) {} }, 400);
    setTimeout(() => { res('still reading'); rq.destroy(); }, 3000);   // allowed through: waits for the rest
  });
  const bigs = await Promise.all(Array.from({ length: 8 }, bigOne));
  const cutN = bigs.filter((x) => x === 'cut').length;
  ok(cutN >= 6, 'eight anonymous 2 MB admin bodies at once: ' + cutN + ' cut after 16 KB');
  r = await fetch(base + '/admin/polls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: TOK, question: { l0: 'Q'.repeat(30000) }, options: [{ id: 'o1', label: { l0: 'a' } }, { id: 'o2', label: { l0: 'b' } }], default: 'l0' }) }).catch(() => ({ status: 0 }));
  ok(r.status !== 0, 'a large body with the key in the body only (older scripts) still gets an answer (' + r.status + ')');

  // ── UTF-8 split between two chunks ──
  const title = 'Bienvenue à la table é';
  const buf = Buffer.from(JSON.stringify({ welcome: { enabled: true, langs: { fr: { title, body: 'x' } } } }));
  const cut = buf.indexOf(Buffer.from('à')) + 1;
  await new Promise((res) => {
    const rq = http.request({ host: '127.0.0.1', port: PORT, path: '/admin/config', method: 'POST', agent: false, headers: { 'Content-Type': 'application/json', 'Content-Length': buf.length, Authorization: 'Bearer ' + TOK } }, (rr) => { rr.resume(); rr.on('end', res); });
    rq.write(buf.subarray(0, cut)); setTimeout(() => rq.end(buf.subarray(cut)), 200);
  });
  const c = await fetch(base + '/admin/config', { headers: { Authorization: 'Bearer ' + TOK } }).then((x) => x.json());
  const got = c.welcome && c.welcome.langs && c.welcome.langs.fr && c.welcome.langs.fr.title;
  ok(got === title, 'UTF-8 split between chunks: saved intact (' + JSON.stringify(got) + ')');
} finally {
  await new Promise((r) => { child.once('exit', r); child.kill(); setTimeout(r, 3000); });
  try { rmSync(tmp, { recursive: true, force: true, maxRetries: 5 }); } catch (e) {}
}
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
