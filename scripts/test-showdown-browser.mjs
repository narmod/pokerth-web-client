#!/usr/bin/env node
// End of hand in real browser engines (phone profiles): the part of a hand the
// other mobile tests stop short of.
//
//   A · classic showdown (6 players, 3 folded): winner window (fits the screen,
//       amounts, "-$20" not "$-20", Continue reachable), then the table: winner
//       class + badge, winning-hand badge, cards of the players who show,
//       backs for the folded ones, loser fade, stacks, dead action bar,
//       translated waiting text, geometry (boxes / badges / board), then the
//       NEXT HAND wipes all of it and the action bar is live again.
//   B · all-in with cards shown mid-hand + side pot: faces up before the river
//       without any winner mark, then two winners.
//   C · hand won without showdown (everybody folds): winner marked, stack
//       updated, no opponent card revealed.
//
// Run:  node scripts/test-showdown-browser.mjs     (npm run test:showdown-browser)
// Env:  PTH_MOBILE / PTH_DEVICES / PTH_ENGINE / PTH_VIEWPORT / PTH_SHOTS (see harness).
// Card codes: n = suit*13 + rank, suits 0 diamonds 1 hearts 2 spades 3 clubs, rank 0 = '2' ... 12 = 'A'.
import assert from 'node:assert/strict';
import { startServer, createReporter, shot, overlap, settle, openTable, runPlan, ME, GAME } from './lib/mobile-harness.mjs';

const PHONES = [
  { name: 'iPhone 15', family: 'ios' },
  { name: 'iPhone 15 landscape', family: 'ios' },
  { name: 'Pixel 7', family: 'android' },
  { name: 'Galaxy A55 landscape', family: 'android' },
];
const { server, base } = await startServer();
const reporter = createReporter();
const check = reporter.check;

// Send fixture messages: [[typeName, envelopeField, fields], ...]; a field
// ['res', pid, c1, c2, won, money, value] expands to a PlayerResult, ['allin', pid, c1, c2] to a PlayerAllIn.
const send = (page, messages) => page.evaluate(({ messages, GAME }) => {
  const f = window.__fx, P = f.Proto;
  for (const [type, field, fields] of messages) {
    const inner = [[1, 0, GAME]];
    for (const x of fields) {
      if (x[0] === 'res') inner.push([2, 2, P.encode([[1, 0, x[1]], [2, 0, x[2]], [3, 0, x[3]], [5, 0, x[4]], [6, 0, x[5]], [7, 0, x[6]]])]);
      else if (x[0] === 'allin') inner.push([2, 2, P.encode([[1, 0, x[1]], [2, 0, x[2]], [3, 0, x[3]]])]);
      else if (x[0] === 'cards') inner.push([2, 2, P.encode([[1, 0, x[1]], [2, 0, x[2]]])]);
      else inner.push(x);
    }
    f.socket.receive(f.envelope(f.MSG.T[type], field, inner));
  }
}, { messages, GAME });
const action = (pid, code, bet, money, state = 3) => ['PlayersActionDone', 45, [[2, 0, pid], [3, 0, state], [4, 0, code], [5, 0, bet], [6, 0, money], [7, 0, bet], [8, 0, 20]]];

const state = (page) => page.evaluate(() => {
  const rect = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  const vis = (e) => { if (!e) return false; const c = getComputedStyle(e), r = e.getBoundingClientRect(); return c.display !== 'none' && c.visibility !== 'hidden' && parseFloat(c.opacity) > 0.05 && r.width > 1 && r.height > 1; };
  const ov = document.getElementById('g-winner-overlay'), card = ov && ov.firstElementChild, wh = document.getElementById('g-win-hand');
  return {
    viewport: { width: innerWidth, height: innerHeight }, zone: rect(document.getElementById('g-table-zone')),
    seats: [...document.querySelectorAll('#g-seats .seat:not(.seat-ghost)')].map((s) => ({ pid: Number(s.getAttribute('data-pid')), me: s.classList.contains('me'),
      winner: s.classList.contains('winner'), loser: s.classList.contains('loser-fade'), folded: s.classList.contains('folded'),
      faces: [...s.querySelectorAll('.pk[data-c]')].map((c) => Number(c.getAttribute('data-c'))), backs: s.querySelectorAll('.pk.back').length,
      money: ((s.querySelector('.seat-money') || {}).textContent || '').trim(), plate: rect(s.querySelector('.seat-plate') || s),
      badge: vis(s.querySelector('.seat-winner-badge')) ? rect(s.querySelector('.seat-winner-badge')) : null })),
    board: [...document.querySelectorAll('#g-comm .pk[data-c]')].map((c) => Number(c.getAttribute('data-c'))),
    slots: [...document.querySelectorAll('#g-comm .pk')].filter(vis).map(rect),
    winHand: vis(wh) ? { text: wh.textContent.trim(), ...rect(wh) } : null,
    popup: vis(ov) && card ? { card: rect(card), name: ((ov.querySelector('.wc-name') || {}).textContent || '').trim(), gain: ((ov.querySelector('.wc-gain') || {}).textContent || '').trim(),
      deltas: [...ov.querySelectorAll('.wc-players .neg, .wc-players .pos')].map((e) => e.textContent.trim()), faces: ov.querySelectorAll('.wc-players .pk[data-c]').length,
      button: rect(ov.querySelector('.winner-dismiss')) } : null,
    actions: [...document.querySelectorAll('.act-buttons-row .btn-action')].filter((b) => vis(b) && !b.disabled).length,
    waiting: (document.querySelector('.my-zone') || { innerText: '' }).innerText.trim(), nextHandText: typeof window.t === 'function' ? window.t('nextHand') : null,
    inShowdown: !!(window.PthState && window.PthState._inShowdown),
  };
});
const seat = (s, pid) => s.seats.find((x) => x.pid === pid);
const inZone = (r, z, pad = 2) => r.left >= z.left - pad && r.right <= z.right + pad && r.top >= z.top - pad && r.bottom <= z.bottom + pad;
function geometry(s, label) {
  s.seats.forEach((a) => assert.ok(inZone(a.plate, s.zone), `${label}: seat ${a.pid} leaves the zone`));
  for (let i = 0; i < s.seats.length; i++) for (let j = i + 1; j < s.seats.length; j++)
    assert.ok(!overlap(s.seats[i].plate, s.seats[j].plate, 2), `${label}: seats ${s.seats[i].pid} and ${s.seats[j].pid} overlap`);
  s.slots.forEach((c, i) => s.seats.forEach((a) => assert.ok(!overlap(c, a.plate, 2), `${label}: seat ${a.pid} covers community card ${i + 1}`)));
  s.seats.filter((a) => a.badge).forEach((a) => { assert.ok(inZone(a.badge, s.zone, 3), `${label}: winner badge of ${a.pid} leaves the zone`);
    s.seats.forEach((o) => { if (o.pid !== a.pid) assert.ok(!overlap(a.badge, o.plate, 2), `${label}: winner badge of ${a.pid} covers seat ${o.pid}`); }); });
  if (s.winHand) { assert.ok(inZone(s.winHand, s.zone, 3), `${label}: winning-hand badge leaves the zone`);
    s.seats.forEach((a) => assert.ok(!overlap(s.winHand, a.plate, 2), `${label}: seat ${a.pid} covers the winning-hand badge`)); }
}
async function dismissPopup(page) {
  const b = page.locator('#g-winner-overlay .winner-dismiss');
  if (await b.count() && await b.isVisible()) { await b.tap(); await page.waitForFunction(() => getComputedStyle(document.getElementById('g-winner-overlay')).display === 'none', null, { timeout: 3000 }).catch(() => {}); }
  await settle(page);
}
async function fresh(browser, descriptor, options) {
  const context = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  const ids = await openTable(page, base, options);
  return { context, page, errors, ids };
}

async function runDevice(browser, name, descriptor) {
  // ── A · classic showdown ────────────────────────────────────────────────
  {
    const { context, page, errors, ids } = await fresh(browser, descriptor, { seats: 6, board: 'river', turn: 'me' });
    try {
      await send(page, [...ids.slice(3).map((p) => action(p, 1, 0, 3000)),
        ['EndOfHandShow', 50, [['res', ME, 12, 25, 60, 3050, 700], ['res', ids[1], 37, 50, 0, 2980, 600], ['res', ids[2], 5, 20, 0, 2990, 100],
          ['res', ids[3], 1, 2, 0, 3000, 0], ['res', ids[4], 4, 6, 0, 3000, 0], ['res', ids[5], 7, 8, 0, 3000, 0]]]]);
      await page.waitForFunction(() => getComputedStyle(document.getElementById('g-winner-overlay')).display !== 'none', null, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
      const pop = await state(page);
      await shot(page, name, 'showdown-a1-window');
      await check('A showdown: winner window fits the screen, amounts read right, Continue reachable', async () => {
        assert.ok(pop.popup, 'winner window is not shown');
        const v = pop.viewport, c = pop.popup.card, b = pop.popup.button;
        assert.ok(c.left >= -1 && c.right <= v.width + 1, `window is wider than the screen: ${Math.round(c.left)}..${Math.round(c.right)} / ${v.width}`);
        assert.ok(b && b.top >= 0 && b.bottom <= v.height + 1 && b.height >= 32, `Continue button is off-screen or tiny: ${JSON.stringify(b)}`);
        assert.equal(pop.popup.name, 'MobileTester'); assert.equal(pop.popup.gain, '+$60');
        assert.deepEqual(pop.popup.deltas.filter((d) => /^\$-|^\$\s*-/.test(d)), [], 'a loss is written "$-20" instead of "-$20"');
        assert.ok(pop.popup.deltas.includes('-$20') && pop.popup.deltas.includes('-$10'), `losses shown: ${pop.popup.deltas.join(' ')}`);
        assert.equal(pop.popup.faces, 6, 'only the three players who show have face-up cards in the list');
      });
      await dismissPopup(page);
      const s = await state(page);
      await shot(page, name, 'showdown-a2-table');
      await check('A showdown: winner marked, the right cards revealed, stacks updated', async () => {
        const me = seat(s, ME), p2 = seat(s, ids[1]), p3 = seat(s, ids[2]);
        assert.ok(me.winner && me.badge, 'winner class / badge missing on the winner');
        assert.deepEqual(s.seats.filter((x) => x.winner).map((x) => x.pid), [ME]);
        assert.deepEqual(p2.faces, [37, 50]); assert.deepEqual(p3.faces, [5, 20]);
        ids.slice(3).forEach((p) => { const f = seat(s, p); assert.deepEqual(f.faces, [], `folded player ${p} shows cards`); assert.ok(f.backs >= 2 || f.folded, `folded player ${p} lost his card backs`); });
        assert.ok(p2.loser && p3.loser, 'losers are not faded');
        assert.equal(me.money, '$3,050'); assert.equal(p2.money, '$2,980');
        assert.ok(s.winHand && s.winHand.text.length > 3, 'winning-hand badge missing');
      });
      await check('A showdown: action bar dead, waiting text translated', async () => {
        assert.equal(s.actions, 0, 'action buttons are live during the showdown');
        assert.ok(s.inShowdown);
        assert.equal(s.waiting, s.nextHandText, `waiting text "${s.waiting}" is not the translated "${s.nextHandText}"`);
      });
      await check('A showdown: boxes, badges and board keep clear of one another', async () => geometry(s, 'showdown'));
      // Next hand
      await page.evaluate(({ GAME, ME }) => { const f = window.__fx, P = f.Proto;   // HandStart with my new cards (plain cards = field 2)
        f.socket.receive(f.envelope(f.MSG.T.HandStart, 41, [[1, 0, GAME], [2, 2, P.encode([[1, 0, 30], [2, 0, 44]])], [4, 0, 10], [6, 0, window.__fx.ids[2]]]));
        f.socket.receive(f.envelope(f.MSG.T.PlayersTurn, 42, [[1, 0, GAME], [2, 0, ME], [3, 0, 0]])); }, { GAME, ME });
      await page.locator('#s-game.active .act-buttons-row .btn-action').first().waitFor({ timeout: 5000 }).catch(() => {});
      await settle(page);
      const n = await state(page);
      await shot(page, name, 'showdown-a3-next-hand');
      await check('A next hand: every showdown mark is gone, the action bar is live again', async () => {
        assert.deepEqual(n.seats.filter((x) => x.winner || x.loser).map((x) => x.pid), [], 'winner / loser marks survive into the next hand');
        assert.equal(n.winHand, null, 'winning-hand badge survives into the next hand');
        assert.deepEqual(n.board, [], 'community cards of the previous hand are still on the table');
        n.seats.filter((x) => !x.me).forEach((x) => assert.deepEqual(x.faces, [], `seat ${x.pid} still shows the cards of the previous hand`));
        assert.deepEqual(seat(n, ME).faces, [30, 44], 'my new cards are not shown');
        assert.ok(n.actions >= 2 && !n.inShowdown, 'action bar is not live on my turn');
        assert.equal(n.popup, null, 'winner window is still open');
      });
      await check('A: no JavaScript error', async () => assert.equal(errors.length, 0, errors.join(' | ')));
    } catch (error) { reporter.fail('A aborted', String(error && error.message || error).split('\n')[0]); await shot(page, name, 'showdown-a-aborted'); }
    finally { await context.close(); }
  }
  // ── B · all-in, cards shown mid-hand, side pot with two winners ─────────
  {
    const { context, page, errors, ids } = await fresh(browser, descriptor, { seats: 4, board: 'flop', turn: 'me' });
    try {
      await send(page, [action(ME, 6, 500, 0, 1), action(ids[1], 6, 3000, 0, 1), action(ids[2], 3, 3000, 0, 1), action(ids[3], 1, 0, 3000, 1),
        ['AllInShowCards', 49, [['allin', ME, 12, 25], ['allin', ids[1], 37, 50], ['allin', ids[2], 5, 20]]]]);
      await settle(page);
      const mid = await state(page);
      await shot(page, name, 'showdown-b1-allin');
      await check('B all-in: cards face up before the river, nobody marked as winner yet', async () => {
        assert.deepEqual(seat(mid, ids[1]).faces, [37, 50]); assert.deepEqual(seat(mid, ids[2]).faces, [5, 20]); assert.deepEqual(seat(mid, ME).faces, [12, 25]);
        assert.deepEqual(seat(mid, ids[3]).faces, [], 'the folded player shows cards');
        assert.deepEqual(mid.seats.filter((x) => x.winner).map((x) => x.pid), []); assert.equal(mid.winHand, null); assert.equal(mid.board.length, 3);
        geometry(mid, 'all-in');
      });
      await send(page, [['DealTurn', 47, [[2, 0, 48]]], ['DealRiver', 48, [[2, 0, 3]]],
        ['EndOfHandShow', 50, [['res', ME, 12, 25, 1500, 1500, 700], ['res', ids[1], 37, 50, 5000, 5000, 600], ['res', ids[2], 5, 20, 0, 0, 100], ['res', ids[3], 1, 2, 0, 3000, 0]]]]);
      await page.waitForTimeout(900); await dismissPopup(page);
      const s = await state(page);
      await shot(page, name, 'showdown-b2-sidepot');
      await check('B side pot: both winners marked, board complete, layout clean', async () => {
        assert.deepEqual(s.seats.filter((x) => x.winner).map((x) => x.pid).sort(), [ME, ids[1]].sort());
        assert.equal(s.board.length, 5); assert.equal(seat(s, ids[1]).money, '$5,000'); assert.equal(seat(s, ME).money, '$1,500');
        geometry(s, 'side pot');
      });
      await check('B: no JavaScript error', async () => assert.equal(errors.length, 0, errors.join(' | ')));
    } catch (error) { reporter.fail('B aborted', String(error && error.message || error).split('\n')[0]); await shot(page, name, 'showdown-b-aborted'); }
    finally { await context.close(); }
  }
  // ── C · hand won without showdown ───────────────────────────────────────
  {
    const { context, page, errors, ids } = await fresh(browser, descriptor, { seats: 5, board: 'flop', turn: 'me' });
    try {
      await send(page, [action(ME, 1, 10, 2990, 1), ...ids.slice(2).map((p) => action(p, 1, 0, 3000, 1)), ['EndOfHandHide', 51, [[2, 0, ids[1]], [3, 0, 30], [4, 0, 3010]]]]);
      await page.waitForTimeout(900); await dismissPopup(page);
      const s = await state(page);
      await shot(page, name, 'showdown-c-no-showdown');
      await check('C no showdown: winner marked and paid, no opponent card revealed', async () => {
        assert.deepEqual(s.seats.filter((x) => x.winner).map((x) => x.pid), [ids[1]]);
        assert.equal(seat(s, ids[1]).money, '$3,010');
        s.seats.filter((x) => !x.me).forEach((x) => assert.deepEqual(x.faces, [], `seat ${x.pid} shows cards although nobody had to`));
        geometry(s, 'no showdown');
      });
      await check('C: no JavaScript error', async () => assert.equal(errors.length, 0, errors.join(' | ')));
    } catch (error) { reporter.fail('C aborted', String(error && error.message || error).split('\n')[0]); await shot(page, name, 'showdown-c-aborted'); }
    finally { await context.close(); }
  }
}

const code = await runPlan('test-showdown-browser', reporter, runDevice, PHONES);
server.close();
process.exit(code);
