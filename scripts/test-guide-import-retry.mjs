#!/usr/bin/env node
// Ace's Help (web.8): the docked Ace's code (modules/mascot/guide.mjs) is a
// dynamic import. A failed import used to surface as an unhandled rejection
// (« Failed to fetch dynamically imported module », error journal) and the
// Ace stayed silent all page. Now:
//   · one failed request → retried with ?r=1, the Ace docks, one
//     « Load-failure retry #1 recovered » line in the journal;
//   · every request fails → no unhandled rejection, no Ace, one
//     « Load-failure retry #2 failed, giving up » line.
// Run: node scripts/test-guide-import-retry.mjs
import { chromium, devices } from 'playwright';
import { startServer, openTable } from './lib/mobile-harness.mjs';

const { server, base } = await startServer();
const browser = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };

// Help on and already offered (the offer has its own tests); every line the
// page queues for the error journal is copied to window.__journal before
// modules/errreport.mjs drains the queue.
const init = () => {
  try { localStorage.setItem('pth_guide_webdriver', '1'); localStorage.setItem('pth_guide_on', '1'); localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_bak_auto', '0'); } catch (_e) {}
  window.__journal = [];
  let q;
  Object.defineProperty(window, '__pthErrQ', {
    configurable: true,
    get() { return q; },
    set(v) {
      q = v;
      if (v && typeof v.push === 'function') {
        const push = v.push.bind(v);
        v.push = (...items) => { for (const it of items) window.__journal.push(String(it && it.msg)); return push(...items); };
      }
    },
  });
  window.addEventListener('unhandledrejection', (e) => { window.__journal.push('REJECTION ' + String(e.reason && e.reason.message || e.reason)); });
};

async function run(label, failWhen) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  let hits = 0;
  await ctx.route('**/modules/mascot/guide.mjs*', async (r) => {
    hits++;
    if (failWhen(r.request().url())) await r.abort('connectionreset'); else await r.continue();
  });
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await openTable(page, base, { stopAt: 'login' });
  let docked = false;
  for (let t = 0; t < 30 && !docked; t++) {
    await page.waitForTimeout(300);
    docked = await page.evaluate(() => !!document.querySelector('#ace-dock .ad-ace')).catch(() => false);
  }
  if (!docked) await page.waitForTimeout(3500);    // let both retries (0.7 s, then 2 s) run out
  const journal = await page.evaluate(() => window.__journal.slice()).catch(() => []);
  await ctx.close();
  return { docked, hits, journal, errors };
}

console.log("Ace's Help — failed import of mascot/guide.mjs");

const once = await run('once', (u) => !/[?&]r=\d/.test(u));
ok(once.docked, 'first request fails: the Ace still docks');
ok(once.journal.some((m) => m === 'Load-failure retry #1 recovered'), 'journal: « Load-failure retry #1 recovered »');
ok(!once.journal.some((m) => /^REJECTION|giving up/.test(m)), 'no unhandled rejection, no « giving up »');

const always = await run('always', () => true);
ok(!always.docked, 'every request fails: no Ace');
ok(always.hits === 3, `three attempts, then it stops (${always.hits})`);
ok(always.journal.filter((m) => m === 'Load-failure retry #2 failed, giving up').length === 1, 'journal: one « Load-failure retry #2 failed, giving up »');
ok(!always.journal.some((m) => /^REJECTION/.test(m)), 'no unhandled rejection');
ok(!always.errors.length, 'no page error' + (always.errors.length ? ' (' + always.errors[0] + ')' : ''));

await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
