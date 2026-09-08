#!/usr/bin/env node
// Deterministic guards for the admin charts.
// Run: node scripts/test-admin-charts.mjs
//
// The charts were frozen SVG: a <title> per point, which is a mouse tooltip
// and nothing at all under a finger, and no way to set aside a series whose
// scale flattens the others. Both are fixed in the same place — a mount that
// keeps the series, redraws on change, and reads out under any pointer. The
// details that break quietly are pinned here: a toggle surviving the five
// second auto-refresh, the scale actually recomputing, and the last visible
// series refusing to go.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  \u2717', msg); } else console.log('  \u2713', msg); }

function body(src, name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = src.indexOf('{', head), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(i, j + 1); }
  }
  return '';
}
const whole = name => { const h = admin.indexOf('function ' + name + '('); const b = body(admin, name); return b ? admin.slice(h, admin.indexOf(b, h) + b.length) : ''; };
const grab = re => { const m = re.exec(admin); return m ? m[0] : ''; };

// -- Source-level guards ---------------------------------------------------
// The page's own <title> stays, obviously; what must go is the per-point kind
// inside the chart builders, which only ever showed under a mouse.
ok(!/<title>/.test(body(admin, '_lineChart') + body(admin, '_stackChart') + body(admin, '_dailyBars')),
  'no <title> tooltip is left in any chart builder — they were mouse-only');
ok(/touch-action:pan-y/.test(admin),
  'the plot lets a vertical swipe scroll the page; only a sideways one moves the readout');
ok(/\.chartbox\{position:relative\}/.test(admin), 'the readout is positioned against its own chart');
ok(/pointerdown/.test(admin) && /pointermove/.test(admin),
  'the readout listens on pointer events, so a finger and a mouse take the same path');
ok(/e\.pointerType!=='mouse'&&!\(e\.buttons&1\)/.test(admin),
  'a finger only reads while it is down; a mouse reads on hover');
ok(/\{passive:true\}/.test(admin), 'and never blocks scrolling to do it');

const mount = body(admin, '_chartMount');
ok(/prev&&prev\.sig===sig/.test(mount),
  'a redraw with the same series keeps what was hidden — traffic refreshes on a timer, and a toggle undone five seconds later is worse than no toggle');
ok(/host\._chartWired/.test(mount), 'listeners are attached once, not once per redraw');
ok(/visible\.length<=1/.test(mount), 'the last visible series will not switch itself off, which would leave an empty grid');

const draw = body(admin, '_chartDraw');
ok(/_chartVisible\(st\)/.test(draw) && /_stackChart\(st\.labels,vis/.test(draw) && /_lineChart\(st\.labels,vis/.test(draw),
  'only the visible series are drawn, so the scale is computed from them');

const leg = body(admin, '_chartLegend');
ok(/<button type="button" class="lgi/.test(leg), 'a legend entry is a button, not a span');
ok(/aria-pressed="/.test(leg), 'and says whether it is on');
ok(/_annEsc\(l\.n\|\|l\.k\)/.test(leg), 'labels are escaped — some of them are language and track names');

// -- Run it -----------------------------------------------------------------
const need = ['_chartSig', '_chartMount', '_chartVisible', '_chartLegend', '_chartDraw',
  '_chartIndex', '_chartCentre', '_chartHide', '_chartRead',
  '_lineChart', '_stackChart', '_lineNiceMax', '_annEsc', '_round1'];
ok(!need.some(x => !whole(x)), 'every chart helper is liftable');
const env = grab(/var CHART_W=700;/) + grab(/var CHART_GEO=\{[^;]*;/) + 'var _chartUid=0,_charts={};';

const dom = new JSDOM('<div id="host"></div>', { url: 'http://localhost/admin', runScripts: 'outside-only' });
const w = dom.window;
w.eval(env + need.map(whole).join('\n')
  + 'window._chartMount=_chartMount;window._charts=_charts;window._chartRead=_chartRead;'
  + 'window._chartIndex=_chartIndex;window._lineChart=_lineChart;');

const labels = ['08-26', '08-27', '08-28', '08-29'];
const lines = [
  { k: 'visits', n: 'Visits', c: '#4080d8', vals: [250, 310, 255, 205] },
  { k: 'unique', n: 'Unique', c: '#7fd17f', vals: [160, 175, 185, 140] },
  { k: 'new', n: 'New', c: '#e0b050', vals: [110, 128, 125, 90] },
];
const host = w.document.getElementById('host');
w._chartMount(host, labels, lines, 170, 'line');

const btns = () => [...host.querySelectorAll('.lgi')];
ok(btns().length === 3, 'the legend has one button per series');
ok(btns()[0].dataset.k === 'visits' && btns()[0].textContent.includes('Visits'),
  'carrying the display name, not the internal key');
const yLabels = () => [...host.querySelectorAll('svg text')].map(t => t.textContent).filter(t => /^\d+$/.test(t)).map(Number);
const topBefore = Math.max(...yLabels());
ok(topBefore >= 310, 'the axis reaches the tallest series (' + topBefore + ')');

btns()[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
ok(host.querySelector('.lgi').classList.contains('off'), 'clicking a legend entry marks it off');
ok(host.querySelector('.lgi').getAttribute('aria-pressed') === 'false', 'and says so to a screen reader');
const topAfter = Math.max(...yLabels());
ok(topAfter < topBefore, 'the scale drops to fit what is left (' + topBefore + ' \u2192 ' + topAfter + ')');
ok(host.querySelectorAll('svg polyline').length === 2, 'and the hidden line is gone from the plot');

// The traffic panel redraws itself every few seconds. A toggle that does not
// survive that is a toggle nobody can use.
w._chartMount(host, labels, lines.map(l => Object.assign({}, l)), 170, 'line');
ok(host.querySelector('.lgi').classList.contains('off'), 'a redraw with the same series keeps it off');
ok(Math.max(...yLabels()) === topAfter, 'and keeps the scale that went with it');

// A different set of series is a different chart; starting it half hidden
// would be baffling.
w._chartMount(host, labels, [{ k: 'plays', n: 'Plays', c: '#a', vals: [1, 2, 3, 4] }], 170, 'line');
ok(!host.querySelector('.lgi').classList.contains('off'), 'a different set of series starts fully visible');

w._chartMount(host, labels, lines.map(l => Object.assign({}, l)), 170, 'line');
// Re-query each time: a redraw replaces the buttons, and a click on a
// detached node reaches nothing.
['visits', 'unique', 'new'].forEach(k =>
  host.querySelector('.lgi[data-k="' + k + '"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true })));
ok(btns().filter(b => !b.classList.contains('off')).length === 1,
  'switching every entry off in turn leaves exactly one alight');

// -- Which column the pointer is over --------------------------------------
// jsdom has no layout, so the arithmetic is checked directly rather than
// through a fake bounding box that would only be testing my own stub.
const st = { labels: ['a', 'b', 'c', 'd', 'e'], kind: 'line' };
const geo = w.eval('CHART_GEO.line'), W = w.eval('CHART_W');
const at = f => w._chartIndex(st, f);
ok(at((geo.l) / W) === 0, 'the left edge of the plot is the first day');
ok(at((W - geo.r) / W) === 4, 'the right edge is the last');
ok(at(0.5) === 2, 'the middle is the middle');
ok(at(-0.5) === 0 && at(1.5) === 4, 'and a pointer past either end clamps rather than reading nothing');
const stk = { labels: ['a', 'b', 'c', 'd'], kind: 'stack' };
const gs = w.eval('CHART_GEO.stack');
ok(w._chartIndex(stk, (gs.l + 1) / W) === 0 && w._chartIndex(stk, (W - gs.r - 1) / W) === 3,
  'bars are indexed by slot, not by vertex');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
