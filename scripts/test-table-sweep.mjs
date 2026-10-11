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
import { startServer, createReporter, shot, openTable, runPlan } from './lib/mobile-harness.mjs';
import { measureTable as measure, auditTable as audit } from './lib/layout-audit.mjs';

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
