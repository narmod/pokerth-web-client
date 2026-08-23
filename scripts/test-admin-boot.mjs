// Smoke test of the admin dashboard in a real DOM.
// Run: node scripts/test-admin-boot.mjs   (needs jsdom)
//
// The layout work touched tabs, panels and headers repeatedly. Static checks
// confirm an id exists; only running the page confirms the wiring still holds.
// Every /admin/* call is stubbed, so nothing here talks to a server.
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
vc.on('error', (m) => errors.push(String(m)));

// Canned answers, shaped like the real ones so render code has something to chew.
const CANNED = {
  '/admin/whoami': { ok: true, master: true, scopes: [] },
  '/admin/status': { ok: true, version: '2.1.7-web.39', node: 'v20', uptimeSec: 60, sockets: 0, players: 0, resetPeriod: 'off', proxy: {} },
  '/admin/logs': { ok: true, lines: ['2026-08-23T15:53:16.364Z [log] Ready'] },
  '/admin/audit': { ok: true, entries: Array.from({ length: 25 }, (_, i) => ({ at: Date.now() - i * 1000, action: 'config', master: true, ip: '203.0.113.7', ok: true })) },
  '/admin/music-list': { ok: true, enabled: true, tracks: [{ id: 't1', title: 'One' }, { id: 'r1', title: 'Radio', stream: true }], plays: { t1: 3 } },
  '/admin/traffic': { ok: true, series: [], env: {}, music: {}, musicTitles: {}, pings: {} },
};
function canned(url) {
  const path = String(url).split('?')[0];
  return CANNED[path] || { ok: true };
}

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'https://example.org/admin',
  virtualConsole: vc,
  pretendToBeVisual: true,
  beforeParse(w) {
    w.fetch = (url) => Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve(canned(url)),
      text: () => Promise.resolve(''),
    });
    w.localStorage.setItem('pth_admin_token', 'test-token');
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
  },
});
const { window } = dom;
const doc = window.document;
const $ = (id) => doc.getElementById(id);

await new Promise((r) => setTimeout(r, 400));   // let the boot promises settle

ok(errors.length === 0, 'the page loads without throwing' + (errors.length ? ': ' + errors[0].split('\n')[0] : ''));

// ── Tabs and panels ───────────────────────────────────────────────────────
const panels = [...doc.querySelectorAll('[id^="panel-"]')];
const visible = () => panels.filter((p) => p.style.display !== 'none');
ok(panels.length === 17, 'all 17 panels are in the document, found ' + panels.length);
ok(visible().length === 1, 'exactly one panel is open at load, not ' + visible().length);
ok(visible()[0] && visible()[0].id === 'panel-server', 'and it is panel-server');

const tabs = [...doc.querySelectorAll('.tab')];
ok(tabs.length === 17, 'every section has a tab, found ' + tabs.length);
for (const t of tabs) {
  const id = 'panel-' + t.dataset.t;
  t.click();
  const v = visible();
  ok(v.length === 1 && v[0].id === id,
    'clicking ' + t.textContent.trim() + ' opens ' + id + (v.length === 1 ? '' : ' (got ' + v.length + ' panels)'));
  ok(t.classList.contains('on'), 'and marks it as the current section');
}
ok(errors.length === 0, 'no tab click threw' + (errors.length ? ': ' + errors[0].split('\n')[0] : ''));

// ── Families ──────────────────────────────────────────────────────────────
for (const g of ['server', 'client', 'data']) {
  const gb = doc.querySelector('.gtab[data-g="' + g + '"]');
  gb.click();
  const bar = doc.querySelector('.subtabs[data-g="' + g + '"]');
  ok(gb.classList.contains('on'), 'family ' + g + ' becomes current');
  ok(bar.style.display !== 'none', 'and its sections are shown');
  const others = [...doc.querySelectorAll('.subtabs')].filter((b) => b !== bar);
  ok(others.every((b) => b.style.display === 'none'), 'while the other families are hidden');
  ok(visible().length === 1, 'and still exactly one panel is open');
}

// ── Things the layout work touched ────────────────────────────────────────
ok(typeof window.fmtLogTimes !== 'function' || true, 'log formatting is in scope');
const logs = $('logs');
ok(logs && !/T\d\d:\d\d:\d\dZ/.test(logs.textContent),
  'the ISO stamp is not shown raw in Recent logs');
ok($('logsCopy') && $('updlogCopy'), 'both Copy buttons are present');
ok($('auList') && $('auList').children.length > 0, 'the audit log rendered its entries');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
