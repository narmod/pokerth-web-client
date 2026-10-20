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
const need = ['_chartSig', '_chartK', '_chartMount', '_chartVisible', '_chartLegend', '_chartDraw',
  '_chartIndex', '_chartCentre', '_chartHide', '_chartRead',
  '_lineChart', '_stackChart', '_barChart', '_mean', '_niceAxis', '_axLab', '_isInt', '_xTicks', '_annEsc', '_round1'];
ok(!need.some(x => !whole(x)), 'every chart helper is liftable');
const env = grab(/var CHART_W=700;/) + grab(/var CHART_GEO=\{[^;]*;/) + grab(/var CHART_TXT=\d+;/) + 'var _chartUid=0,_charts={};';

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


// -- Single-series bars ----------------------------------------------------
// The hourly and daily bar charts of the traffic tabs used to be frozen SVG:
// a <title> per bar, so a hover tooltip with a mouse and nothing at all under
// a finger. They now go through the same mount as every other chart.
ok(/kind==='bar'/.test(body(admin, '_chartDraw')), 'the mount knows a single-series bar kind');
ok(/_chartMount\(b48,/.test(admin), 'the last-48-hours visits chart is mounted');
ok(/_chartMount\(\$\('trafHoursV'\)/.test(admin) && /_chartMount\(\$\('trafHoursN'\)/.test(admin),
  'and both time-of-day charts');
ok(/_chartMount\(\$\('trafRetAct'\)/.test(admin) && /_chartMount\(nb,/.test(admin),
  'and the active-days and new-devices charts');
ok((admin.match(/_barChart\(/g) || []).length === 2, 'no bar chart is left as a static picture (the helper is only called by the mount)');
const bh = w.document.createElement('div'); bh.id = 'barhost'; w.document.body.appendChild(bh);
w._chartMount(bh, ['00:00', '01:00', '02:00'], [{ k: 'v', n: 'Visits', c: '#4080d8', vals: [3, 0, 7] }], 150, 'bar',
  { c: '#4080d8', xl: ['00', '01', '02'], colFn: (v, i) => i === 2 ? '#2c5896' : '#4080d8' });
ok(!bh.querySelector('.lgi'), 'one series needs no legend');
ok(bh.querySelector('.chartro') && bh.querySelector('.chartgd') && bh.classList.contains('chartbox'),
  'but it gets the readout and the guide line');
ok(bh.querySelectorAll('svg rect').length === 3, 'one bar per slot, a zero included');
ok([...bh.querySelectorAll('svg text')].some(t => t.textContent === '02') &&
   ![...bh.querySelectorAll('svg text')].some(t => t.textContent === '02:00'),
  'the axis keeps the short labels, the readout gets the long ones');
const gb = w.eval('CHART_GEO.bar');
const bst = { labels: ['a', 'b', 'c'], kind: 'bar' };
ok(w._chartIndex(bst, (gb.l + 1) / W) === 0 && w._chartIndex(bst, (W - gb.r - 1) / W) === 2,
  'and the pointer is matched to the bar under it, by slot');


// -- Readout rows ------------------------------------------------------------
// The value used to float right after the bare label: in a bubble measured
// narrow (near the right edge, on a phone), the float dropped to the next row
// and every value read against the wrong series.
ok(!/\.chartro s\{[^}]*float/.test(admin), 'a readout value is not floated');
ok(/\.chartro span\{display:flex/.test(admin), 'each readout row is one flex line: swatch, label, value');
ok(/\.chartro i\{[^}]*min-width:0[^}]*text-overflow:ellipsis/.test(admin), 'a long label shortens itself instead of pushing the value away');
ok(/ro\.style\.left='0px';\s*ro\.style\.display='block';/.test(body(admin, '_chartRead')),
  'the bubble is measured at full width before it is placed');
ok(/<i>'\+_annEsc\(l\.n\|\|l\.k\)\+'<\/i>/.test(body(admin, '_chartRead')), 'the label sits in its own element, value beside it');

// -- Round axis steps and labels that stay in the frame (audit 2026-10-20, S1, S2)
{
  const ax = new Function(whole('_annEsc') + whole('_niceAxis') + whole('_axLab') + whole('_isInt') + whole('_xTicks') +
    '\nreturn { _niceAxis, _axLab, _isInt, _xTicks };')();
  const ticks = (m, int) => { const a = ax._niceAxis(m, int), t = []; for (let i = 0; i <= a.n; i++) t.push(ax._axLab(a, i)); return t.join(' '); };
  ok(ticks(50, true) === '0 10 20 30 40 50', 'a top of 50 reads 0 10 20 30 40 50, not 0 13 25 38 50 (' + ticks(50, true) + ')');
  ok(ticks(10, true) === '0 2 4 6 8 10' && ticks(3, true) === '0 1 2 3', 'small counts step by whole units');
  ok(ticks(302, true) === '0 100 200 300 400', 'the top stays close to the data (Daily visits: 400, not 500)');
  ok(ticks(1.6, false) === '0.0 0.5 1.0 1.5 2.0', 'a ratio gets decimal steps, not 0 0 1 1 1');
  ok(ticks(0, true) === '0 1', 'nothing to draw still gives an axis');
  ok([7, 13, 29, 110, 519, 1003, 12345].every(m => { const a = ax._niceAxis(m, true); return a.n <= 5 && a.max >= m && a.step >= 1; }),
    'never more than five intervals, always above the data');
  const lab = Array.from({ length: 14 }, (_, i) => '10-' + String(7 + i).padStart(2, '0'));
  const svg = ax._xTicks(14, i => 38 + i * 652 / 13, lab, 170, 700);
  const last = /<text x="([\d.]+)" y="164\.0" text-anchor="(\w+)"[^>]*>10-20<\/text>/.exec(svg);
  ok(last && last[2] === 'end' && +last[1] <= 699, 'the last label is anchored inside the right edge');
  ok(!/>10-19</.test(svg), 'and the label just before it is left out rather than collide');
  ok(/>10-07</.test(svg) && (svg.match(/<text/g) || []).length === 7, 'one label in two (07 09 11 13 15 17), plus the last');
  ok(!/_lineNiceMax/.test(admin), 'no chart cuts its top in four any more');
  // -- New devices per day: averages in the header, lines under the figures (S5)
  const bc = body(admin, '_barChart');
  ok(!/>avg '/.test(bc) && bc.indexOf('(opt.segs||[]).forEach') < bc.indexOf('vals.forEach(function(v,i)'),
    'the per-half lines carry no « avg » label and are drawn under the bars and their figures');
  ok(/paint-order:stroke;stroke:var\(--panel\)/.test(bc), 'figures keep a halo in the card colour where a line runs behind');
  ok(/: 'avg '\+_round1\(f\)\+' \\u2192 '\+_round1\(l\)\+' per '\+U\.one\+' \\u00b7 '/.test(admin), 'both averages are in the header note');
  // -- Readable on a phone (S4): text scaled by k, fewer x labels so they never touch
  const k = 2.35, svgM = ax._xTicks(14, i => 38 * k + i * (700 - 48 * k) / 13, lab, 170 * k, 700, k);
  const xs = [...svgM.matchAll(/<text x="([\d.]+)"[^>]*text-anchor="(\w+)"[^>]*font-size:([\d.]+)px">([^<]+)</g)];
  ok(xs.length >= 3 && xs.every(m => +m[3] === 21.15), 'x labels grow with the scale (9 x 2.35 = 21.15 units, ~10 px on a phone)');
  const box = m => { const w = m[4].length * 5.4 * k, x = +m[1]; return m[2] === 'end' ? [x - w, x] : m[2] === 'start' ? [x, x + w] : [x - w / 2, x + w / 2]; };
  ok(xs.every((m, i) => !i || box(xs[i - 1])[1] <= box(m)[0]), 'and are spaced so none overlaps the next (' + xs.map(m => m[4]).join(' ') + ')');
  const chk = new Function('var CHART_W=700, CHART_TXT=10;' + whole('_chartK') + '\nreturn _chartK;')();
  ok(chk({ clientWidth: 1090 }) === 1 && chk({ clientWidth: 330 }) === 2.35 && chk({ clientWidth: 0 }, { k: 1.5 }) === 1.5,
    'k is 1 on a wide desktop chart, ~2.35 at phone width, and kept when the width is unknown (hidden)');
  ok(/new ResizeObserver\(function\(\)\{\n\s+var st=_charts\[host\.id\]; if\(st && host\.clientWidth && _chartK\(host,st\)!==st\.k\) _chartDraw\(host\.id\);/.test(admin),
    'a chart drawn hidden or resized is drawn again at its real width');
  ok(/var n=st\.labels\.length, geo=CHART_GEO\[st\.kind\]\|\|CHART_GEO\.line, k=st\.k\|\|1, gl=geo\.l\*k;/.test(admin),
    'the pointer reading uses the scaled margins');
}

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
