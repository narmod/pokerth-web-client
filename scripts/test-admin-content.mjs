// Admin › Content (Packages and Music) in a real DOM, since web.129.
// Run: node scripts/test-admin-content.mjs   (needs jsdom)
//
// Packages: tiles per kind, « show » chips, filter, rows marked when hidden;
// table and deck names decoded from their XML. Music: tiles, a library
// filter. Every call is stubbed.
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
  '/admin/status': { ok: true, version: '2.1.10-web.129', uptimeSec: 60, sockets: 0, update: {} },
  '/admin/pkg-list': { ok: true,
    tables: [{ id: 'casino', name: 'Green Casino' }, { id: 'ivoire', name: 'Ivoire & Chene' }, { id: 'old', name: 'Old <b>felt</b>', disabled: true }],
    decks: [{ id: 'd1', name: 'Bella' }], seats: [], themes: [{ id: 'pokerth-new', name: 'PokerTH new', builtin: true }] },
  '/admin/music-list': { ok: true, enabled: true, votesPublic: false, plays: { t1: 40, t2: 2 }, votes: { t1: { up: 3, down: 1 }, r1: { up: 1, down: 0 } },
    tracks: [{ id: 't1', title: 'Lounge', artist: 'Kai Engel' }, { id: 't2', title: 'Late night', artist: 'Komiku', active: false }, { id: 'r1', title: 'Swiss Jazz', stream: true }] },
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

// ── Packages ──────────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="packages"]').click();
await tick(200);
ok(errors.length === 0, 'opening Packages throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const pt = tiles('pkTiles');
ok(/Table styles 2 \/ 3 1 hidden from players/.test(pt) && /Card decks 1 \/ 1 all offered to players/.test(pt) && /Seats 0 \/ 0/.test(pt) && /Themes 1 \/ 1/.test(pt), 'one tile per kind, offered out of installed (' + pt + ')');
ok(/^5 installed$/.test($('pkSum').textContent), 'the head note counts everything');
ok($('pkNtable').textContent === '3' && $('pkNdeck').textContent === '1', 'each kind says how many it holds');
const rows = (id) => [...doc.querySelectorAll('#' + id + ' .pkrow')];
ok(rows('tables').length === 3 && rows('tables')[2].classList.contains('off') && /hidden from players/.test(rows('tables')[2].textContent), 'a hidden entry is marked in words, not only dimmed');
ok(!doc.querySelector('#tables .nm b b') && /Old <b>felt<\/b>/.test(rows('tables')[2].textContent), 'a package name is text, never markup');
ok(/built-in/.test(rows('themes')[0].textContent) && !rows('themes')[0].querySelector('.del'), 'a built-in theme says so and has no Remove');
doc.querySelector('#pkKinds [data-pk="deck"]').click();
ok(doc.querySelector('.pksec[data-pk="table"]').hidden && !doc.querySelector('.pksec[data-pk="deck"]').hidden, 'a chip keeps one kind on screen');
ok(window.localStorage.getItem('pth_admin_pk_kind') === 'deck' && /1 shown/.test($('pkSum').textContent), 'remembered, and the head note says how many are shown');
const seg = () => doc.querySelector('#panel-packages .seg button.on').dataset.k;
ok(seg() === 'deck', 'a kind picked in the library preselects it for the import');
doc.querySelector('#pkKinds [data-pk="all"]').click();
ok(seg() === 'deck' && !doc.querySelector('.pksec[data-pk="table"]').hidden, 'All shows everything and leaves the import kind alone');
// The tiles filter too, and a tile clicked again lets go.
const tile = (k) => doc.querySelector('#pkTiles .setile[data-pk="' + k + '"]');
ok(['table', 'deck', 'seat', 'theme'].every((k) => tile(k) && tile(k).tagName === 'BUTTON'), 'each tile is a button');
tile('table').click();
ok(!doc.querySelector('.pksec[data-pk="table"]').hidden && doc.querySelector('.pksec[data-pk="deck"]').hidden, 'a tile keeps its kind on screen');
ok(tile('table').classList.contains('on') && tile('table').getAttribute('aria-pressed') === 'true' && doc.querySelector('#pkKinds [data-pk="table"]').classList.contains('on'), 'tile and chip both show the choice');
ok(seg() === 'table', 'and the import follows');
tile('table').click();
ok(doc.querySelector('#pkKinds [data-pk="all"]').classList.contains('on') && !doc.querySelector('.pksec[data-pk="deck"]').hidden, 'the same tile clicked again goes back to All');
// The import kind filters the library.
doc.querySelector('#panel-packages .seg button[data-k="seat"]').click();
ok(seg() === 'seat' && !doc.querySelector('.pksec[data-pk="seat"]').hidden && doc.querySelector('.pksec[data-pk="table"]').hidden, 'picking what to import shows that kind in the library');
ok(window.localStorage.getItem('pth_admin_pk_kind') === 'seat' && tile('seat').classList.contains('on'), 'remembered, tile lit');
doc.querySelector('#pkKinds [data-pk="all"]').click();
ok(errors.length === 0, 'the package filters throw nothing' + (errors.length ? ': ' + errors[0] : ''));
$('pkgFilter').value = 'ivoire';
$('pkgFilter').dispatchEvent(new window.Event('input'));
ok(rows('tables').length === 1 && $('pkNtable').textContent === '1 of 3', 'the filter narrows and the counts follow');
$('pkgFilter').value = '';
$('pkgFilter').dispatchEvent(new window.Event('input'));
// Table and deck names come from the pack's XML, where « & » is « &amp; ».
for (const f of ['tables-manifest.mjs', 'decks-manifest.mjs']) {
  const src = readFileSync(join(root, 'scripts', f), 'utf8');
  const fn = src.slice(src.indexOf('function xmlText'), src.indexOf('\nfunction ', src.indexOf('function xmlText') + 10));
  const x = new Function(fn + '\nreturn xmlText;')();
  ok(x('Ivoire &amp; Chene') === 'Ivoire & Chene' && x('a &amp;lt; b') === 'a &lt; b' && x('&#233;t&#xE9;') === 'été', f + ' decodes XML entities in the name, &amp; last');
  ok(/name = xmlText\(m\[1\]\.trim\(\)\)/.test(src), f + ' uses it for the display name');
}

// ── Music ─────────────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="music"]').click();
await tick(250);
ok(errors.length === 0, 'opening Music throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const mt = tiles('mzTiles');
ok(/Player On in every player menu/.test(mt) && /Tracks 1 \/ 2 1 hidden/.test(mt) && /Radios 1 \/ 1 0 hidden/.test(mt) && /Plays 42 votes ▲ 4 · ▼ 1/.test(mt), 'tiles: player, tracks, radios, plays and votes (' + mt + ')');
const mr = () => [...doc.querySelectorAll('#mzList .mzrow')];
ok(mr().length === 2 && mr()[1].classList.contains('off'), 'one row per track, a hidden one marked');
ok(/40 plays/.test(mr()[0].textContent) && /▲ 3 · ▼ 1/.test(mr()[0].textContent), 'plays and votes stay on each row');
$('mzFilter').value = 'komiku';
$('mzFilter').dispatchEvent(new window.Event('input'));
ok(mr().length === 1 && /Late night/.test(mr()[0].textContent) && mr()[0].querySelector('.mzpos').value === '2', 'the filter finds an artist and keeps the real position');
$('mzFilter').value = 'zzz';
$('mzFilter').dispatchEvent(new window.Event('input'));
ok(/No entry matches/.test($('mzList').textContent), 'nothing found says so');
$('mzFilter').value = '';
$('mzFilter').dispatchEvent(new window.Event('input'));
$('mzEnabled').value = '0';
$('mzEnabled').dispatchEvent(new window.Event('change'));
ok(/Player Off/.test(tiles('mzTiles')), 'the Player tile follows the setting');
ok(errors.length === 0, 'nothing threw' + (errors.length ? ': ' + errors[0] : ''));

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
