#!/usr/bin/env node
// Table sweep in real browser engines: every table size (2-10 players), seated
// AND as a spectator, on portrait and landscape phones. This is where seat
// placement bugs hide: the layout is a bisection over measured boxes, and each
// player count x orientation x mode is its own geometry (the QML delta notes
// flagged the spectator mode as never tested).
//
// Per configuration (full board dealt = worst case for the centre):
//   · the expected number of seats is drawn, each plate inside the table zone;
//   · no two player boxes overlap;
//   · no player box covers a community card slot or the pot badge;
//   · no player box sits under a floating zone button (chat, reactions, ...);
//   · dealer / blind pucks and bet chips stay inside the zone;
//   · seated: self box centred, clear of the action bar - spectator: no self
//     box, no action button, every seat still inside the zone.
//
// Run:   node scripts/test-table-sweep.mjs            (npm run test:table-sweep)
// Env:   PTH_MOBILE, PTH_DEVICES, PTH_ENGINE, PTH_SHOTS as test-mobile-browser,
//        PTH_SEATS="2,6,10"  PTH_MODES="seated,spectator"  to narrow the sweep.
// Shots: test-artifacts/mobile/<device>-sweep-<mode>-<n>.png
import assert from 'node:assert/strict';
import { startServer, createReporter, shot, overlap, openTable, runPlan } from './lib/mobile-harness.mjs';

// Portrait + landscape of each family is enough here: the sweep multiplies by
// 18 configurations, the per-device detail lives in test-mobile-browser.
const SWEEP = [
  { name: 'iPhone SE (3rd gen)', family: 'ios' },
  { name: 'iPhone 15', family: 'ios' },
  { name: 'iPhone 15 landscape', family: 'ios' },
  { name: 'Pixel 7', family: 'android' },
  { name: 'Galaxy A55 landscape', family: 'android' },
];
const SEATS = (process.env.PTH_SEATS || '2,3,4,5,6,7,8,9,10').split(',').map(Number).filter((n) => n >= 2 && n <= 10);
const MODES = (process.env.PTH_MODES || 'seated,spectator').split(',').map((s) => s.trim());

const { server, base } = await startServer();
const reporter = createReporter();

const measure = (page) => page.evaluate(() => {
  const rect = (e) => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  const vis = (e) => { if (!e) return false; const c = getComputedStyle(e), r = e.getBoundingClientRect();
    return c.display !== 'none' && c.visibility !== 'hidden' && parseFloat(c.opacity) > 0.05 && r.width > 1 && r.height > 1; };
  const seats = [...document.querySelectorAll('#g-seats .seat:not(.seat-ghost)')];
  const me = document.querySelector('#g-seats .seat.me');
  return {
    viewport: { width: innerWidth, height: innerHeight },
    overflowX: document.documentElement.scrollWidth - innerWidth,
    zone: rect(document.getElementById('g-table-zone')),
    plates: seats.map((s) => ({ name: (s.querySelector('.seat-name') || {}).textContent || s.getAttribute('data-pid'), me: s.classList.contains('me'), ...rect(s.querySelector('.seat-plate') || s) })),
    me: me ? rect(me.querySelector('.seat-plate') || me) : null,
    slots: [...document.querySelectorAll('#g-comm .pk')].filter(vis).map(rect),
    pot: vis(document.getElementById('g-potbar')) ? rect(document.getElementById('g-potbar')) : null,
    pucks: [...document.querySelectorAll('#g-seats .seat-pucks > *, #g-seats .seat-bet')].filter(vis).map((e) => ({ owner: seats.indexOf(e.closest('.seat')), kind: e.classList.contains('seat-bet') ? 'bet chip' : 'puck', ...rect(e) })),
    floating: ['chat-toggle-btn', 'react-toggle-btn', 'hands-toggle-btn', 'log-toggle-btn', 'g-zoom-toggle'].map((id) => document.getElementById(id)).filter(vis).map((e) => ({ id: e.id, ...rect(e) })),
    actionBar: vis(document.querySelector('.my-zone')) ? rect(document.querySelector('.my-zone')) : null,
    actions: [...document.querySelectorAll('.act-buttons-row .btn-action')].filter(vis).length,
    dbg: (function () { const d = window._seatDbg || {}, m = d.dims || {}; return `zone ${d.zone} - box ${m.w}x${m.h} self ${m.sh} - scale ${d.boxScale} - comm ${d.commScale && d.commScale.toFixed ? d.commScale.toFixed(2) : d.commScale}` + ['.my-zone .bet-row', '.my-zone .mid-row', '.my-zone .act-buttons-row'].map((q) => { const e = document.querySelector(q); if (!e) return ''; const r = e.getBoundingClientRect(); return ` - ${q.split(' .')[1]} ${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.left)},${Math.round(r.top)}`; }).join(''); })(),
  };
});

function audit(g, n, spectator) {
  const problems = [];
  const inZone = (r, pad = 2) => r.left >= g.zone.left - pad && r.right <= g.zone.right + pad && r.top >= g.zone.top - pad && r.bottom <= g.zone.bottom + pad;
  const who = (p) => (p.me ? 'self box' : p.name);
  if (g.plates.length !== n) problems.push(`${g.plates.length} seats drawn instead of ${n}`);
  if (g.overflowX > 1) problems.push(`page overflows horizontally by ${g.overflowX}px`);
  g.plates.forEach((p) => { if (!inZone(p)) problems.push(`${who(p)} leaves the table zone (${Math.round(p.left)},${Math.round(p.top)} - ${Math.round(p.right)},${Math.round(p.bottom)} / zone ${Math.round(g.zone.left)},${Math.round(g.zone.top)} - ${Math.round(g.zone.right)},${Math.round(g.zone.bottom)})`); });
  for (let i = 0; i < g.plates.length; i++) for (let j = i + 1; j < g.plates.length; j++)
    if (overlap(g.plates[i], g.plates[j], 2)) problems.push(`${who(g.plates[i])} overlaps ${who(g.plates[j])}`);
  if (g.slots.length !== 5) problems.push(`${g.slots.length} community slots visible instead of 5`);
  g.slots.forEach((c, i) => { if (!inZone(c, 1)) problems.push(`community card ${i + 1} leaves the zone`);
    g.plates.forEach((p) => { if (overlap(c, p, 2)) problems.push(`${who(p)} covers community card ${i + 1}`); }); });
  if (g.pot) g.plates.forEach((p) => { if (overlap(g.pot, p, 2)) problems.push(`${who(p)} covers the pot badge`); });
  g.floating.forEach((f) => g.plates.forEach((p) => { if (overlap(f, p, 3)) problems.push(`${who(p)} sits under the ${f.id} button`); }));
  g.pucks.forEach((k) => {
    const owner = g.plates[k.owner] ? who(g.plates[k.owner]) : '?';
    if (!inZone(k, 3)) problems.push(`the ${k.kind} of ${owner} leaves the zone`);
    g.plates.forEach((p, i) => { if (i !== k.owner && overlap(k, p, 4)) problems.push(`the ${k.kind} of ${owner} covers ${who(p)}`); });
    g.slots.forEach((c, i) => { if (overlap(k, c, 4)) problems.push(`the ${k.kind} of ${owner} covers community card ${i + 1}`); });
  });
  if (spectator) {
    if (g.me) problems.push('a self box is drawn in spectator mode');
    if (g.actions) problems.push('action buttons are shown to a spectator');
  } else {
    if (!g.me) problems.push('no self box');
    else {
      const mid = (g.me.left + g.me.right) / 2, cx = g.zone.left + g.zone.width / 2;
      if (Math.abs(mid - cx) > 2) problems.push(`self box not centred (${mid.toFixed(1)} vs ${cx.toFixed(1)})`);
      if (g.actionBar && overlap(g.me, g.actionBar, 1)) problems.push('self box is covered by the action bar');
    }
  }
  return [...new Set(problems)];
}

async function runDevice(browser, name, descriptor) {
  for (const mode of MODES) {
    const spectator = mode === 'spectator';
    for (const n of SEATS) {
      const label = `${mode} ${String(n).padStart(2)} players`;
      const tag = `sweep-${mode}-${String(n).padStart(2, '0')}`;
      // A run that ABORTS (navigation, timeout) is retried once: that is the
      // harness hiccuping, not a layout finding. Audit problems never retry.
      for (let attempt = 1; attempt <= 2; attempt++) {
        const context = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
        page.on('dialog', (d) => d.dismiss().catch(() => {}));
        try {
          await openTable(page, base, { seats: n, spectator, board: 'river', turn: 'first' });
          // Let the deal / chip animations land: they do not move the layout, but
          // the screenshots are meant to be looked at.
          await page.waitForFunction(() => !document.querySelector('.fly-card, .fly-chip'), null, { timeout: 3000 }).catch(() => {});
          const g = await measure(page);
          await shot(page, name, tag);
          const problems = audit(g, n, spectator).concat(errors.map((e) => 'JavaScript error: ' + e));
          if (problems.length) reporter.fail(label, problems.join('\n      ') + '\n      [' + g.dbg + (g.actionBar ? ' - action bar ' + Math.round(g.actionBar.height) + 'px' : '') + ']');
          else reporter.pass(label);
          attempt = 3;
        } catch (error) {
          if (attempt === 2) {
            reporter.fail(label, 'aborted twice: ' + String(error && error.message || error).split('\n')[0]);
            await shot(page, name, tag + '-aborted');
          }
        } finally { await context.close(); }
      }
    }
  }
}

const code = await runPlan('test-table-sweep', reporter, runDevice, SWEEP);
server.close();
process.exit(code);
