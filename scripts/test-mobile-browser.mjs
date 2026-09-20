#!/usr/bin/env node
// Mobile verification in REAL browser engines (Playwright): iOS Safari is
// approximated by WebKit with iPhone profiles, Android Chrome by Chromium with
// Pixel / Galaxy profiles (viewport, DPR, touch, user agent, pointer: coarse).
//
// What it guards (the mobile regressions of web.89 - web.91 and their kin):
//   · boot without a page error, no horizontal page overflow;
//   · table: every seat inside the zone, self box centred above the action bar,
//     action buttons reachable and finger-sized, community cards in the zone;
//   · loupe (x2): button offered, layer scaled; after the view FOLLOWED A SIDE
//     SEAT, "my turn" shows the self box centred and magnified (web.90 bug:
//     it landed at left = W/2 + panX, off-screen);
//   · mini-board (web.91): shown on my turn when the board is out of view,
//     inside the zone, clear of the floating buttons, mirrors the dealt cards,
//     tap = cards <-> self box, hidden with the loupe off;
//   · loupe off: the layout comes back exactly.
// The hand is driven through a fixture WebSocket (same technique as
// test-accessibility-browser): deterministic, no bots, no network.
//
// Run:            node scripts/test-mobile-browser.mjs        (npm run test:mobile)
// Engines once:   npx playwright install chromium webkit
// Options (env):  PTH_MOBILE=all|ios|android     (default all)
//                 PTH_DEVICES="iPhone 15,Pixel 7" (exact Playwright device names)
//                 PTH_SHOTS=0                     (no screenshots)
//                 PTH_ENGINE=chromium|webkit      (force one engine for every profile,
//                                                  e.g. iPhone viewports without WebKit)
// Screenshots:    test-artifacts/mobile/<device>-<step>.png (git-ignored) - open
//                 them after a UI change: the assertions catch geometry, the eye
//                 catches the rest.
// An engine that is not installed is SKIPPED with a notice (exit code 0 if at
// least one engine ran and everything passed). WebKit is close to, but not,
// Safari on a real iPhone: audio, the collapsing toolbar, the notch safe area
// and the on-screen keyboard still need a real device before a release.
import assert from 'node:assert/strict';
import { startServer, createReporter, shot, overlap, settle, openTable, turnTo, acted, dealTurn, runPlan, ME } from './lib/mobile-harness.mjs';

const SEATS = 10;
const { server, base } = await startServer();
const reporter = createReporter();
const check = reporter.check;

const geometry = (page) => page.evaluate(() => {
  const rect = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  const vis = (e) => { if (!e) return false; const c = getComputedStyle(e), r = e.getBoundingClientRect();   // offsetParent is null for position:fixed
    return c.display !== 'none' && c.visibility !== 'hidden' && r.width > 1 && r.height > 1; };
  const mb = document.getElementById('g-miniboard');
  const layer = document.getElementById('g-zoom-layer'), lr = layer.getBoundingClientRect();
  const me = document.querySelector('#g-seats .seat.me');
  return {
    viewport: { width: innerWidth, height: innerHeight },
    overflowX: document.documentElement.scrollWidth - innerWidth,
    zone: rect(document.getElementById('g-table-zone')),
    layerScale: lr.width / layer.offsetWidth,
    layerLeft: lr.left,
    me: rect(me.querySelector('.seat-plate') || me),
    meLeft: me.style.left,
    plates: [...document.querySelectorAll('#g-seats .seat:not(.seat-ghost)')].map((s) => rect(s.querySelector('.seat-plate') || s)),
    comm: [...document.querySelectorAll('#g-comm .pk[data-c]')].map(rect),
    actionBar: rect(document.querySelector('.my-zone')),
    actions: [...document.querySelectorAll('.act-buttons-row .btn-action')].filter(vis).map(rect),
    loupeBtn: vis(document.getElementById('g-zoom-toggle')) ? rect(document.getElementById('g-zoom-toggle')) : null,
    floating: ['chat-toggle-btn', 'react-toggle-btn', 'hands-toggle-btn', 'log-toggle-btn'].map((id) => document.getElementById(id)).filter(vis).map(rect),
    mini: { hidden: mb.hidden, rect: rect(mb), cards: mb.querySelectorAll('.pk[data-c]').length, aria: mb.getAttribute('aria-label') },
  };
});

async function runDevice(browser, name, descriptor) {
  const context = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  try {
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await check('boots, login screen has no horizontal overflow', async () => {
      await page.waitForFunction(() => document.readyState === 'complete' && window.App && document.querySelector('#s-connect .btn-primary'));
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(over <= 1, `page is ${over}px wider than the screen`);
    });
    await openTable(page, base, { seats: SEATS, board: 'flop', turn: 'me' });
    await page.locator('#s-game.active .act-buttons-row .btn-action').first().waitFor();
    const base0 = await geometry(page);
    await shot(page, name, '1-table');
    const cx = base0.zone.left + base0.zone.width / 2;

    await check(`table: ${SEATS} seats inside the zone, no page overflow`, async () => {
      assert.equal(base0.plates.length, SEATS);
      assert.ok(base0.overflowX <= 1, `page overflows by ${base0.overflowX}px`);
      base0.plates.forEach((p, i) => assert.ok(p.left >= base0.zone.left - 2 && p.right <= base0.zone.right + 2
        && p.top >= base0.zone.top - 2 && p.bottom <= base0.zone.bottom + 2, `seat ${i + 1} leaves the table zone: ${JSON.stringify(p)}`));
    });
    await check('table: self box centred, clear of the action bar', async () => {
      const mid = (base0.me.left + base0.me.right) / 2;
      assert.ok(Math.abs(mid - cx) <= 2, `self box centre ${mid.toFixed(1)} vs zone centre ${cx.toFixed(1)}`);
      assert.ok(!overlap(base0.me, base0.actionBar), 'self box is covered by the action bar');
    });
    await check('table: action buttons reachable and finger-sized', async () => {
      assert.ok(base0.actions.length >= 2, 'fewer than two action buttons');
      base0.actions.forEach((a, i) => { assert.ok(a.left >= -1 && a.right <= base0.viewport.width + 1 && a.bottom <= base0.viewport.height + 1, `action ${i + 1} is off-screen`);
        const min = base0.viewport.height < 600 && base0.viewport.width > base0.viewport.height ? 28 : 36;   // landscapeCompact: flattened row
        assert.ok(a.height >= min, `action ${i + 1} is only ${a.height.toFixed(0)}px high (min ${min})`); });
    });
    await check('table: the three flop cards are inside the zone, hidden by no seat', async () => {
      assert.equal(base0.comm.length, 3);
      base0.comm.forEach((c, i) => { assert.ok(c.left >= base0.zone.left && c.right <= base0.zone.right, `card ${i + 1} leaves the zone`);
        base0.plates.forEach((p, j) => assert.ok(!overlap(c, p), `card ${i + 1} is under seat ${j + 1}`)); });
    });
    await check('loupe: offered on this phone, mini-board hidden while it is off', async () => {
      assert.ok(base0.loupeBtn, 'magnifier button is not visible');
      assert.equal(base0.mini.hidden, true);
    });

    // Loupe on, let the view follow a side seat, then give the turn back to me.
    await page.locator('#g-zoom-toggle').tap();
    await settle(page);
    const side = await page.evaluate(() => { const z = document.getElementById('g-table-zone').clientWidth; let best = null, d = -1;
      document.querySelectorAll('#g-seats .seat:not(.me)').forEach((s) => { const x = Math.abs((parseFloat(s.style.left) || 0) - z / 2); if (x > d) { d = x; best = s.getAttribute('data-pid'); } });
      return Number(best); });
    await turnTo(page, side); await page.waitForTimeout(250);   // the render plans the deferred pan...
    await acted(page, side);                                   // ...and "acted" makes it happen at once
    await settle(page);
    const followed = await geometry(page);
    await shot(page, name, '2-loupe-follow');
    await check('loupe: x2 layer, the view followed the side seat', async () => {
      assert.ok(Math.abs(followed.layerScale - 2) < 0.02, `layer scale is ${followed.layerScale.toFixed(2)}`);
      const centred = followed.zone.left - followed.zone.width / 2;   // layer left when panX = 0
      assert.ok(Math.abs(followed.layerLeft - centred) > 8, 'the view did not pan sideways');
    });
    await turnTo(page, ME);
    await settle(page);
    const mine = await geometry(page);
    await shot(page, name, '3-loupe-my-turn');
    await check('loupe: on my turn the self box is centred and magnified (web.90)', async () => {
      const mid = (mine.me.left + mine.me.right) / 2;
      assert.ok(Math.abs(mid - cx) <= 3, `self box centre ${mid.toFixed(1)} vs zone centre ${cx.toFixed(1)} (style.left ${mine.meLeft})`);
      assert.ok(mine.me.width >= base0.me.width * 1.8, `self box is not magnified: ${base0.me.width.toFixed(0)} -> ${mine.me.width.toFixed(0)}`);
      assert.ok(mine.me.bottom <= mine.zone.bottom + 2 && mine.me.top >= mine.zone.top - 2, 'self box is cut off vertically');
      assert.ok(!overlap(mine.me, mine.actionBar), 'self box is covered by the action bar');
    });
    await check('mini-board: shown, mirrors the flop, inside the zone, clear of the buttons (web.91)', async () => {
      assert.equal(mine.mini.hidden, false, 'mini-board is hidden although the board is out of view');
      assert.equal(mine.mini.cards, 3);
      assert.match(mine.mini.aria || '', /: .+ .+ .+$/);
      const r = mine.mini.rect;
      assert.ok(r.left >= mine.zone.left && r.right <= mine.zone.right && r.top >= mine.zone.top && r.bottom <= mine.zone.bottom, `mini-board leaves the zone: ${JSON.stringify(r)}`);
      mine.floating.forEach((f, i) => assert.ok(!overlap(r, f), `mini-board overlaps floating button ${i + 1}`));
      assert.ok(!overlap(r, mine.me), 'mini-board covers the self box');
    });
    await check('mini-board: tap goes to the cards, tap again comes back; a new card is mirrored', async () => {
      await page.locator('#g-miniboard').tap(); await settle(page);
      const onBoard = await geometry(page);
      assert.ok(onBoard.me.top > mine.me.top + 20, 'the view did not move to the community cards');
      await shot(page, name, '4-loupe-board');
      if (onBoard.mini.hidden) {   // wide screen: every real card is readable now, so no duplicate - by design
        onBoard.comm.forEach((c, i) => assert.ok(c.left >= onBoard.zone.left - 1 && c.top >= onBoard.zone.top - 1, `mini-board hidden but card ${i + 1} is cut off`));
        await page.evaluate(() => window._loupeMyTurn());
      } else await page.locator('#g-miniboard').tap();
      await settle(page);
      const back = await geometry(page);
      assert.ok(Math.abs(back.me.top - mine.me.top) <= 2, 'the view did not come back to the self box');
      await dealTurn(page, 48); await turnTo(page, ME); await settle(page);
      const turn = await geometry(page);
      assert.equal(turn.mini.hidden, false); assert.equal(turn.mini.cards, 4);
    });
    await check('loupe off: mini-board hidden, layout restored exactly', async () => {
      await page.locator('#g-zoom-toggle').tap(); await settle(page);
      const ref = await geometry(page);          // reference: loupe off, current game state
      assert.equal(ref.mini.hidden, true);
      assert.ok(Math.abs(ref.layerScale - 1) < 0.01, `layer scale is ${ref.layerScale.toFixed(2)} with the loupe off`);
      ref.plates.forEach((p, i) => assert.ok(p.left >= ref.zone.left - 2 && p.right <= ref.zone.right + 2, `seat ${i + 1} leaves the zone after the loupe`));
      await page.locator('#g-zoom-toggle').tap(); await settle(page);   // on...
      await page.locator('#g-zoom-toggle').tap(); await settle(page);   // ...and off again
      const off = await geometry(page);
      assert.ok(Math.abs(off.me.left - ref.me.left) <= 1 && Math.abs(off.me.top - ref.me.top) <= 1 && Math.abs(off.me.width - ref.me.width) <= 1, `self box ${JSON.stringify(ref.me)} -> ${JSON.stringify(off.me)}`);
      off.plates.forEach((p, i) => assert.ok(Math.abs(p.left - ref.plates[i].left) <= 1 && Math.abs(p.top - ref.plates[i].top) <= 1, `seat ${i + 1} moved`));
    });
    await check('no JavaScript error during the whole run', async () => { assert.deepEqual(errors, []); });
  } catch (error) {
    reporter.fail('run aborted', String(error && error.message || error).split('\n')[0]);
    await shot(page, name, 'aborted');
  } finally { await context.close(); }
}

const code = await runPlan('test-mobile-browser', reporter, runDevice);
server.close();
process.exit(code);
