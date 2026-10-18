// Admin › Operations (Health & logs, Deployment, Access & backup) in a real
// DOM, since web.133. Run: node scripts/test-admin-ops.mjs   (needs jsdom)
//
// Tiles from /admin/status and /admin/blocked, a filter and « Problems only »
// over the log lines. Every call is stubbed.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'public', 'admin.html'), 'utf8');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push(e.message));

const NOW = Date.now();
const CANNED = {
  '/admin/whoami': { ok: true, master: true, scopes: [] },
  '/admin/status': { ok: true, version: '2.1.10-web.133', runningVersion: '2.1.10-web.132', installKind: 'docker', gitUpdatable: true, uptimeSec: 90061, sockets: 12, liveSessions: 3, maxClients: 500,
    fd: { soft: '20000', softN: 20000, approxPlayers: 9968 }, update: { available: true, remote: '0123456789abcdef', needsRestart: true, checkedAt: NOW },
    autoUpdate: { enabled: true, noticeSec: 90 }, restartAt: NOW + 36e5, restartKind: 'restart', proxyCfg: {} },
  '/admin/logs': { ok: true, lines: ['2026-10-18T10:00:00.000Z [log] Ready', '2026-10-18T10:00:01.000Z [i] Bob joined', '2026-10-18T10:00:02.000Z [e] upstream error ECONNRESET', '2026-10-18T10:00:03.000Z [i] Ann <b>left</b>'] },
  '/admin/blocked': { ok: true, you: '198.51.100.7', limiter: true, blocked: [{ ip: '203.0.113.9', failed: 5, until: NOW + 6e5, last: NOW }, { ip: '203.0.113.10', failed: 1, until: 0, last: NOW }], banned: ['192.0.2.66'] },
};
const posts = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', url: 'https://example.org/admin', virtualConsole: vc, pretendToBeVisual: true,
  beforeParse(w) {
    w.fetch = (url, opts) => {
      if (opts && opts.method === 'POST') { try { posts.push({ url: String(url), body: JSON.parse(opts.body) }); } catch (e) {} }
      const p = String(url).split('?')[0];
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(CANNED[p] || { ok: true }), text: () => Promise.resolve('') });
    };
    w.confirm = () => true;
    w.localStorage.setItem('pth_admin_tok', 'test-token');
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
  },
});
const { window } = dom;
const doc = window.document;
const $ = (id) => doc.getElementById(id);
const tiles = (id) => [...doc.querySelectorAll('#' + id + ' .ovmode')].map((m) => [...m.children].map((c) => c.textContent.trim()).join(' ')).join(' | ');
const tick = (ms) => new Promise((r) => setTimeout(r, ms || 60));
await tick(400);

// ── Health & logs ─────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="server"]').click();
await tick(300);
ok(errors.length === 0, 'opening Health & logs throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const o = tiles('opTiles');
ok(/Uptime 1d 1h 1m/.test(o) && /Connected 12 3 game sessions · cap 500/.test(o) && /Open files 20,000 about 9,968 players at once/.test(o), 'uptime, connections, open files (' + o + ')');
ok(/Build 2\.1\.10-web\.133 still running 2\.1\.10-web\.132 — restart needed/.test(o), 'a build waiting for a restart says so');
const logs = () => $('logs').textContent.split('\n');
ok(logs().length === 4 && /4 lines/.test($('logCount').textContent), 'every line shows at first, counted');
$('logProblems').checked = true;
$('logProblems').dispatchEvent(new window.Event('change'));
ok(logs().length === 1 && /ECONNRESET/.test(logs()[0]) && /1 of 4 lines/.test($('logCount').textContent), 'Problems only keeps the error line');
$('logProblems').checked = false;
$('logProblems').dispatchEvent(new window.Event('change'));
$('logFilter').value = 'ann';
$('logFilter').dispatchEvent(new window.Event('input'));
ok(logs().length === 1 && /Ann <b>left<\/b>/.test(logs()[0]), 'the filter finds a nickname, shown as text');
$('logFilter').value = 'zzz';
$('logFilter').dispatchEvent(new window.Event('input'));
ok($('logs').textContent === '(no line matches)', 'nothing found says so');
$('logFilter').value = '';
$('logFilter').dispatchEvent(new window.Event('input'));
ok(!/T\d\d:\d\d:\d\d/.test($('logs').textContent), 'times stay in local form, not raw ISO');

// ── Deployment ────────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="deploy"]').click();
await tick(300);
const d = tiles('dpTiles');
ok(/Running 2\.1\.10-web\.132 docker · self-update/.test(d) && /Update Available 01234567 · needs a restart/.test(d), 'running build and the update waiting (' + d + ')');
ok(/Auto-update On notice 90 s before a restart/.test(d) && /Scheduled \d\d:\d\d restart only/.test(d), 'auto-update and the scheduled restart (' + d + ')');
ok(!/rgba\(255,255,255,\.12\)/.test(html.slice(html.indexOf('<div id="panel-deploy"'), html.indexOf('<div id="panel-access"'))), 'no fixed white separator left in Deployment');

// ── Access & backup ───────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="access"]').click();
await tick(300);
const a = tiles('acTiles');
ok(/Your address 198\.51\.100\.7/.test(a) && /Failed sign-ins 2/.test(a) && /Blocked now 1 locked out/.test(a) && /Banned 1 refused at the WebSocket upgrade/.test(a), 'address, failed, blocked now, banned (' + a + ')');
ok($('ipBlockedN').textContent === '2' && $('ipBannedN').textContent === '1', 'each list heading carries its count');
ok(errors.length === 0, 'nothing threw' + (errors.length ? ': ' + errors[0] : ''));

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
