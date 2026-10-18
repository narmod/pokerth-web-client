// Admin › Player experience (Modes & features, Defaults) in a real DOM, since
// web.131. Run: node scripts/test-admin-players.mjs   (needs jsdom)
//
// Tiles, the entry modes with their colour, the kill switches as a grid where
// a feature switched off stands out, and the base style every bare text or
// number field now gets. Every call is stubbed.
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
  '/admin/status': { ok: true, version: '2.1.10-web.131', uptimeSec: 60, sockets: 0, modes: { offline: true, lan: false, pokerthnet: true }, update: {} },
  '/admin/config': { ok: true, featureSwitches: [{ key: 'polls', label: 'Product polls' }, { key: 'odds', label: 'Odds <i>tab</i>' }, { key: 'chat', label: 'Lobby chat' }],
    featureOff: ['odds'], liveStats: { on: true, sec: 90 }, communityEvents: { on: false, sec: 300 } },
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

// ── Modes & features ──────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="clients"]').click();
await tick(250);
ok(errors.length === 0, 'opening Modes & features throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const t = tiles('pxTiles');
ok(/Entry modes 2 \/ 3 Offline practice \(bots\), pokerth\.net/.test(t), 'the modes tile counts and names what is offered (' + t + ')');
ok(/Features off 1 Odds <i>tab<\/i>/.test(t) && !doc.querySelector('#pxTiles i i'), 'the features tile names what is off, as text');
ok(/Live figures On read every 90 s/.test(t) && /Community events Off no Events tab/.test(t), 'the two relays say whether they run');
const modes = [...doc.querySelectorAll('#modes .pxmode')];
ok(modes.length === 3 && modes.every((r) => r.querySelector('.lvdot') && r.style.getPropertyValue('--mc')), 'each mode row has its colour');
ok(modes[1].classList.contains('off') && /hidden from the login screen/.test(modes[1].textContent), 'a mode switched off says so in words');
const fs = [...doc.querySelectorAll('#fsList.fsgrid .fsitem')];
ok(fs.length === 3 && fs[1].classList.contains('off') && fs[1].querySelector('input').checked, 'the switches are a grid, the one off marked');
ok(/1 of 3 off for everyone/.test($('fsSum').textContent), 'the head note counts them');
fs[0].querySelector('input').checked = true;
fs[0].querySelector('input').dispatchEvent(new window.Event('change'));
ok(fs[0].classList.contains('off'), 'ticking a box marks the row at once');
ok(!$('fsList').getAttribute('style'), 'no inline layout left on the list');

// ── Defaults ──────────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="defaults"]').click();
await tick(150);
ok(errors.length === 0, 'opening Defaults throws nothing' + (errors.length ? ': ' + errors[0] : ''));
ok(doc.querySelectorAll('#panel-defaults > .card').length === 6, 'the six defaults cards are all there');

// ── Bare fields ───────────────────────────────────────────────────────────
ok(/:where\(\.card\) input:where\(:not\(\[type\]\),\[type=text\],\[type=number\]/.test(html), 'a text or number field without a class gets the base field style');
ok(/:where\(:root\[data-admin-theme="light"\] \.card\) input:where\(/.test(html), 'with its light-theme background');
ok(errors.length === 0, 'nothing threw' + (errors.length ? ': ' + errors[0] : ''));

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
