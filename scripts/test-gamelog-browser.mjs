#!/usr/bin/env node
// Game log in a real browser: the incremental render (one new row inserted at
// the head, the oldest dropped at the 500 cap) must leave EXACTLY what a full
// re-render would write — same rows, same text, same role classes, including
// role functions re-resolved after the fact (main pot vs side pot) and a thunk
// that throws — and a paused reader keeps the same row under the same pixel.
//
// Run:  node scripts/test-gamelog-browser.mjs     (npm run test:gamelog-browser)
// Env:  PTH_MOBILE / PTH_DEVICES / PTH_ENGINE / PTH_VIEWPORT (see harness).
import assert from 'node:assert/strict';
import { startServer, createReporter, openTable, runPlan } from './lib/mobile-harness.mjs';

const MATRIX = [
  { name: 'Desktop Chrome', family: 'android', engine: 'chromium' },
  { name: 'Pixel 7', family: 'android' },
  { name: 'iPhone 15', family: 'ios' },
];
const { server, base } = await startServer();
const reporter = createReporter();
const check = reporter.check;

await runPlan('Game log (browser)', reporter, async (browser, name, descriptor) => {
  const context = await browser.newContext(descriptor);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await openTable(page, base, { seats: 6, turn: 'other' });
    await page.evaluate(() => {
      localStorage.setItem('pth_log_interval', '0');          // every action is logged
      const p = document.getElementById('g-log-panel'); if (p) p.style.display = 'flex';
      // Expected rows, computed the way a full render does.
      window.__logDiff = () => {
        const el = document.getElementById('g-log-body'), exp = window.PthState.actionLog.slice().reverse();
        if (el.children.length !== exp.length) return 'rows ' + el.children.length + ' vs ' + exp.length;
        for (let i = 0; i < exp.length; i++) {
          const fn = exp[i]; let r = fn.role; if (typeof r === 'function') { try { r = r(); } catch (e) { r = null; } }
          const cls = 'log-line' + ((r === 'board' || r === 'win' || r === 'win-side') ? ' lg-' + r : '');
          let tx; try { tx = fn(); } catch (e) { tx = ''; }
          if (el.children[i].className !== cls) return 'row ' + i + ' class ' + el.children[i].className + ' vs ' + cls;
          if (el.children[i].textContent !== tx) return 'row ' + i + ' text';
        }
        return '';
      };
    });

    await check('1300 random lines (cap, roles, side pots, a throwing thunk): same DOM as a full render', async () => {
      const bad = await page.evaluate(() => {
        window.clearGameLog();
        let winners = [], seed = 7;
        const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
        for (let i = 0; i < 1300; i++) {
          const x = rnd();
          if (x < 0.5) window.logAction('P' + i + ': Call <b>&', true);
          else if (x < 0.6) window.logAction(function () { return '--- ' + window.t('flop') + ' ' + i; }, false, 'board');
          else if (x < 0.7) window.logAction(function () { return window.t('handOf') + ' ' + i; });
          else if (x < 0.8) winners = [];
          else if (x < 0.9) {
            const w = Math.floor(rnd() * 100) + 1, ws = winners; ws.push(w);
            window.logAction('W' + w, false, function () { let t = 0; ws.forEach((v) => { if (v > t) t = v; }); return w >= t ? 'win' : 'win-side'; });
          } else window.logAction(function () { throw new Error('boom'); }, false, 'win');
          const d = window.__logDiff(); if (d) return 'step ' + i + ': ' + d;
        }
        return '';
      });
      assert.equal(bad, '');
    });

    await check('retranslation (full render) then more lines: still consistent', async () => {
      const bad = await page.evaluate(() => {
        window._retranslateLog(); let d = window.__logDiff(); if (d) return 'full: ' + d;
        for (let i = 0; i < 30; i++) window.logAction('after ' + i, true);
        d = window.__logDiff(); if (d) return 'after: ' + d;
        window.clearGameLog(); d = window.__logDiff(); if (d) return 'clear: ' + d;
        window.logAction('first', true); return window.__logDiff();
      });
      assert.equal(bad, '');
    });

    await check('a paused reader keeps the same row under the same pixel', async () => {
      const r = await page.evaluate(async () => {
        for (let i = 0; i < 499; i++) window.logAction('L' + i, true);
        const el = document.getElementById('g-log-body');
        el.scrollTop = 300; el.dispatchEvent(new Event('scroll'));
        await new Promise((res) => setTimeout(res, 50));
        const topAt = () => { for (const c of el.children) if (c.offsetTop + c.offsetHeight > el.scrollTop) return c.textContent + '@' + Math.round(el.scrollTop - c.offsetTop); return ''; };
        const before = topAt();
        for (let i = 0; i < 5; i++) window.logAction('new ' + i, true);
        return { before, after: topAt() };
      });
      assert.ok(r.before, 'the log scrolls');
      assert.equal(r.after, r.before);
    });

    await check('no page errors', async () => { assert.deepEqual(errors, []); });
  } finally { await context.close(); }
}, MATRIX);

server.close();
process.exit(reporter.failed ? 1 : 0);
