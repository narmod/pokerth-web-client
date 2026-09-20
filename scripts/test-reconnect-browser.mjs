#!/usr/bin/env node
// Connection loss in the middle of a hand, in real browser engines (phone
// profiles). The socket is a fixture, so the link can be cut and brought back
// at will - what a phone does when it leaves Wi-Fi for 4G.
//
//   A · the link dies on my turn, comes back at the first retry:
//       the table STAYS on screen (no jump to the lobby or the login), a
//       "reconnecting" notice appears on the table, translated, inside the
//       screen, says the seat is kept and counts down; one retry, to the same
//       URL (a rebind, never a fresh login that would kill the seat); the hand
//       goes on over the new socket, the notice goes away, the action bar is
//       live and my click leaves on the NEW socket.
//   B · the network stays down: six attempts with a growing delay (5 s, then
//       6 · 12 · 24 · 30 · 30 s) and NOT ONE MORE (hammering the server gets the
//       IP blocked), the counter reads n/6 from the first to the last, then
//       back to the login screen with a translated error - never a frozen table.
//   C · I leave on purpose: no reconnection is attempted.
//
// Timers are driven with Playwright's clock (the real delays add up to ~110 s).
// Run:  node scripts/test-reconnect-browser.mjs   (npm run test:reconnect-browser)
import assert from 'node:assert/strict';
import { startServer, createReporter, shot, openTable, settle, runPlan, ME, GAME } from './lib/mobile-harness.mjs';

const PHONES = [
  { name: 'iPhone 15', family: 'ios' },
  { name: 'Pixel 7', family: 'android' },
  { name: 'Galaxy A55 landscape', family: 'android' },
];
const { server, base } = await startServer();
const reporter = createReporter();
const check = reporter.check;

const snap = (page) => page.evaluate(() => {
  const vis = (e) => { if (!e) return false; const c = getComputedStyle(e), r = e.getBoundingClientRect(); return c.display !== 'none' && c.visibility !== 'hidden' && parseFloat(c.opacity) > 0.05 && r.width > 1 && r.height > 1; };
  const rect = (e) => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; };
  const pill = document.getElementById('g-conn-pill'), bar = document.getElementById('reconnect-banner');
  const note = vis(pill) ? pill : (bar && bar.classList.contains('visible') && vis(bar) ? bar : null);
  const WS = window.WebSocket;
  return { screen: (document.querySelector('.screen.active') || {}).id, seats: document.querySelectorAll('#g-seats .seat:not(.seat-ghost)').length,
    myCards: [...document.querySelectorAll('#g-seats .seat.me .pk[data-c]')].map((c) => Number(c.getAttribute('data-c'))),
    note: note ? { where: note.id, text: note.innerText.replace(/\s+/g, ' ').trim(), ...rect(note) } : null, vw: innerWidth, vh: innerHeight,
    actions: [...document.querySelectorAll('.act-buttons-row .btn-action')].filter((b) => vis(b) && !b.disabled).length,
    sockets: WS.count || 0, url: WS.instance && WS.instance.url, sent: WS.instance ? WS.instance.sent.length : 0, open: !!(WS.instance && WS.instance.readyState === 1),
    status: ((document.querySelector('#s-connect .status, #status, .conn-status') || {}).textContent || '').trim(),
    keys: ['reconnIn', 'reconnInProgress', 'reauthBanner', 'reconnSeatKept', 'reconnFailed'].filter((k) => typeof window.t === 'function' && window.t(k) === k) };
});
async function fresh(browser, descriptor) {
  const context = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  await openTable(page, base, { seats: 6, board: 'flop', turn: 'me' });
  await page.locator('#s-game.active .act-buttons-row .btn-action').first().waitFor();
  await page.clock.install();
  return { context, page, errors };
}
const tick = async (page, ms) => { await page.clock.runFor(ms); await page.waitForTimeout(300); };   // fake time for the app's timers, a little real time for CSS fades

async function runDevice(browser, name, descriptor) {
  // ── A · link lost on my turn, back at the first retry ───────────────────
  {
    const { context, page, errors } = await fresh(browser, descriptor);
    try {
      const before = await snap(page);
      await page.evaluate(() => window.WebSocket.instance.drop());
      await tick(page, 300);
      const lost = await snap(page);
      await shot(page, name, 'reconnect-a1-lost');
      await check('A link lost: the table stays, a translated notice appears on it and keeps the seat', async () => {
        assert.deepEqual(before.keys, [], 'reconnection strings missing from the catalogue: ' + before.keys.join(' '));
        assert.equal(lost.screen, 's-game', `the app jumped to ${lost.screen}`);
        assert.equal(lost.seats, before.seats); assert.deepEqual(lost.myCards, before.myCards);
        assert.ok(lost.note, 'no reconnection notice is shown');
        assert.ok(lost.note.left >= -1 && lost.note.right <= lost.vw + 1 && lost.note.top >= -1 && lost.note.bottom <= lost.vh + 1, `notice leaves the screen: ${JSON.stringify(lost.note)}`);
        assert.match(lost.note.text, /5\s*s/, `no 5 s countdown in "${lost.note.text}"`);
        assert.match(lost.note.text, /1\s*\/\s*6/, `attempt counter is not 1/6 in "${lost.note.text}"`);
        assert.equal(lost.sockets, before.sockets, 'a new socket was opened at once (no back-off)');
      });
      await tick(page, 5200);
      const back = await snap(page);
      await check('A retry after 5 s: ONE new socket, same URL (rebind, not a fresh login)', async () => {
        assert.equal(back.sockets, before.sockets + 1, `${back.sockets - before.sockets} sockets opened`);
        const strip = (u) => String(u || '').replace(/([?&])fresh=1(&|$)/, '$1').replace(/[?&]$/, '');
        assert.equal(strip(back.url), strip(before.url), `the retry goes to another URL: ${back.url} (session: ${before.url})`);
        assert.ok(!/fresh=1/.test(back.url || ''), 'the retry asks the proxy for a FRESH session: the seat would be lost');
        assert.ok(back.open);
      });
      // the proxy re-attached the upstream: the hand simply goes on
      await page.evaluate(({ ME, GAME }) => { const f = window.__fx, s = window.WebSocket.instance, opp = f.ids[1];
        const frame = (payload) => { const b = new ArrayBuffer(4 + payload.byteLength); new DataView(b).setUint32(0, payload.byteLength, false); new Uint8Array(b).set(payload, 4); s.onmessage({ data: b, target: s }); };
        frame(f.envelope(f.MSG.T.PlayersActionDone, 45, [[1, 0, GAME], [2, 0, opp], [3, 0, 1], [4, 0, 4], [5, 0, 100], [6, 0, 2880], [7, 0, 100], [8, 0, 100]]));
        frame(f.envelope(f.MSG.T.PlayersTurn, 42, [[1, 0, GAME], [2, 0, ME], [3, 0, 1]])); }, { ME, GAME });
      await tick(page, 2500);
      const live = await snap(page);
      await shot(page, name, 'reconnect-a2-back');
      await check('A back: notice gone, same table, action bar live, my click leaves on the new socket', async () => {
        assert.equal(live.note, null, `notice still shown: "${live.note && live.note.text}"`);
        assert.equal(live.screen, 's-game'); assert.equal(live.seats, before.seats); assert.deepEqual(live.myCards, before.myCards);
        assert.ok(live.actions >= 2, 'action bar is not live after the reconnection');
        await page.locator('.act-buttons-row .btn-action').first().tap();
        await tick(page, 300);
        const after = await snap(page);
        assert.ok(after.sent > live.sent, 'my action was not sent on the new socket');
      });
      await check('A: no JavaScript error', async () => assert.equal(errors.length, 0, errors.join(' | ')));
    } catch (error) { reporter.fail('A aborted', String(error && error.message || error).split('\n')[0]); await shot(page, name, 'reconnect-a-aborted'); }
    finally { await context.close(); }
  }
  // ── B · the network stays down ──────────────────────────────────────────
  {
    const { context, page, errors } = await fresh(browser, descriptor);
    try {
      const before = await snap(page);
      await page.evaluate(() => { window.__fxRefuse = true; window.WebSocket.instance.drop(); });
      const seen = [];
      for (const ms of [5300, 6300, 12300, 24300, 30300, 30300, 90000]) { await tick(page, ms); const s = await snap(page); seen.push({ sockets: s.sockets - before.sockets, screen: s.screen, note: s.note && s.note.text }); }
      const end = await snap(page);
      await shot(page, name, 'reconnect-b-gave-up');
      await check('B network down: six attempts with a growing delay and no more, counter n/6 throughout, then the login screen with a translated error', async () => {
        assert.deepEqual(seen.map((x) => x.sockets), [1, 2, 3, 4, 5, 6, 6], 'attempts over time: ' + JSON.stringify(seen.map((x) => [x.sockets, x.note])));
        seen.filter((x) => x.note && /\d\s*\/\s*\d/.test(x.note)).forEach((x) => assert.match(x.note, /\d\s*\/\s*6/, `counter not out of 6: "${x.note}"`));
        assert.equal(end.screen, 's-connect', `the app is stuck on ${end.screen}`);
        assert.equal(end.note, null, 'the reconnection notice is still shown on the login screen');
        const msg = await page.evaluate(() => { const want = window.t('reconnFailed', { n: 6 }); const m = document.getElementById('conn-lost-modal'), r = m && m.getBoundingClientRect();
          return { want, found: document.body.innerText.includes(want), modal: !!m && getComputedStyle(m).display !== 'none' && r.width > 10, translated: want !== 'reconnFailed' }; });
        assert.ok(msg.translated && msg.found && msg.modal, `the player is thrown out of his table without a word: "${msg.want}" is not shown (${JSON.stringify(msg)})`);
      });
      await check('B: no JavaScript error', async () => assert.equal(errors.length, 0, errors.join(' | ')));
    } catch (error) { reporter.fail('B aborted', String(error && error.message || error).split('\n')[0]); await shot(page, name, 'reconnect-b-aborted'); }
    finally { await context.close(); }
  }
  // ── C · leaving on purpose ──────────────────────────────────────────────
  {
    const { context, page, errors } = await fresh(browser, descriptor);
    try {
      const before = await snap(page);
      await page.evaluate(() => { window.PthState._intentionalDisconnect = true; window.WebSocket.instance.close(); });
      await tick(page, 40000);
      const s = await snap(page);
      await check('C leaving on purpose: no notice, no reconnection attempt', async () => {
        assert.equal(s.sockets, before.sockets, 'a socket was reopened after a voluntary disconnect');
        assert.equal(s.note, null);
      });
      await check('C: no JavaScript error', async () => assert.equal(errors.length, 0, errors.join(' | ')));
    } catch (error) { reporter.fail('C aborted', String(error && error.message || error).split('\n')[0]); }
    finally { await context.close(); }
  }
}

const code = await runPlan('test-reconnect-browser', reporter, runDevice, PHONES, 15);
server.close();
process.exit(code);
