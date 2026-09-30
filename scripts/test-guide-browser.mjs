#!/usr/bin/env node
// Ace's Help (L1) in a real browser, on phones and a desktop:
//   · without ?guide=1 nothing shows (L1 is hidden): no Ace, no button;
//   · with it, the Ace offers his help ONCE on first launch (D3), docked at
//     the bottom right, bubble and buttons inside the screen, big enough for a
//     finger; « Yes » turns the help on and he says what he does; « Got it »
//     folds the bubble and he stays; a tap on him opens his menu; the offer
//     never comes back after a reload;
//   · the idle scenes are paused while he is there (D6);
//   · in the lobby he is docked; the moment a hand starts he leaves (D8);
//   · switching the option off in Advanced options sends him away;
//   · with reduced motion there is no Ace, only a plain bubble (D4);
//   · no page error along the way.
// Run: node scripts/test-guide-browser.mjs   (PTH_MOBILE / PTH_DEVICES as the other browser tests)
import assert from 'node:assert/strict';
import { startServer, createReporter, shot, openTable, enterTable, runPlan } from './lib/mobile-harness.mjs';

const MATRIX = [
  { name: 'iPhone SE (3rd gen)', family: 'ios' },
  { name: 'Pixel 7', family: 'android' },
  { name: 'Galaxy A55 landscape', family: 'android' },
  { name: 'Desktop Chrome', family: 'android' },
];
const { server, base } = await startServer();
const reporter = createReporter();
const check = reporter.check;

const DEV = () => { try { localStorage.setItem('pth_guide_dev', '1'); } catch (_e) {} };
const bubble = '#ace-dock .ad-bubble.ad-open';
const text = (page) => page.locator(bubble + ' .ad-text').innerText();
const store = (page) => page.evaluate(() => ({ on: localStorage.getItem('pth_guide_on'), offered: localStorage.getItem('pth_guide_offered'), seen: localStorage.getItem('pth_guide_seen') }));
const box = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight }; }, sel);
const inside = (b, what) => {
  assert.ok(b, what + ': missing');
  assert.ok(b.left >= -0.5 && b.top >= -0.5 && b.right <= b.vw + 0.5 && b.bottom <= b.vh + 0.5, `${what}: outside the screen (${Math.round(b.left)},${Math.round(b.top)} → ${Math.round(b.right)},${Math.round(b.bottom)} in ${b.vw}x${b.vh})`);
};
const click = async (page, sel) => { const l = page.locator(sel).first(); await l.click(); };
// What the docked Ace covers among the controls really visible on screen (should be nothing).
const underAce = (page) => page.evaluate(() => {
  const a = document.querySelector('#ace-dock .ad-ace').getBoundingClientRect();
  const out = [];
  document.querySelectorAll('button,a[href],input,select,textarea').forEach((el) => {
    if (el.closest('#ace-dock')) return;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return;
    const hit = document.elementFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1));
    if (!hit || !(hit === el || el.contains(hit) || hit.closest('#ace-dock'))) return;   // not visible there anyway
    if (r.left < a.right - 1 && a.left < r.right - 1 && r.top < a.bottom - 1 && a.top < r.bottom - 1) out.push(el.id || el.className || el.tagName);
  });
  return out;
});
// The first-run « local backup » banner (Chromium) — the offer waits for it: close it like a player.
const noBanner = async (page) => { const b = page.locator('#bak-restore-banner button').last(); if (await b.count()) { try { await b.click({ timeout: 2000 }); } catch (_e) {} } };
const btn = (id) => `${bubble} [data-ad-btn="${id}"]`;

async function runDevice(browser, name, descriptor) {
  // the app keeps the first-launch offer away from automated browsers (other
  // tests' screenshots); this test is about that offer: opt in.
  const _newContext = browser.newContext.bind(browser);
  browser = Object.create(browser);
  browser.newContext = async (o) => { const c = await _newContext(o); await c.addInitScript(() => { try { localStorage.setItem('pth_guide_webdriver', '1'); } catch (_e) {} }); return c; };
  const errors = [];
  const watch = (page) => page.on('pageerror', (e) => errors.push(String(e && e.message || e)));

  // ── no flag needed any more (L2) ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'login' }); await noBanner(page);
    await check(`${name}: public since L2 — offered without any flag, login button shown`, async () => {
      await page.locator(bubble).waitFor({ timeout: 6000 });
      assert.equal(await page.locator('.guide-login-btn').isVisible(), true, 'login button hidden');
    });
    await ctx.close();
  }

  // ── first launch: the offer ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    await ctx.addInitScript(DEV);
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'login' }); await noBanner(page);
    await check(`${name}: the Ace offers his help on first launch`, async () => {
      await page.locator(bubble).waitFor({ timeout: 9000 });
      assert.match(await text(page), /New here/);
      assert.equal(await page.locator('#ace-dock .ad-ace .mc-pos').count(), 1, 'no Ace drawn');
    });
    await check(`${name}: Ace, bubble and buttons inside the screen, finger-sized`, async () => {
      inside(await box(page, '#ace-dock .ad-ace'), 'Ace');
      inside(await box(page, bubble), 'bubble');
      for (const id of ['offerNo', 'offerYes']) { const b = await box(page, btn(id)); inside(b, id); assert.ok(b.h >= 32, `${id} is ${Math.round(b.h)}px tall`); }
      const ace = await box(page, '#ace-dock .ad-ace'), bub = await box(page, bubble);
      assert.ok(bub.bottom <= ace.top + 1 || bub.right <= ace.left + 1, 'the bubble covers the Ace');
    });
    await check(`${name}: the login button shows with ?guide=1`, async () => {
      assert.equal(await page.locator('.guide-login-btn').isVisible(), true);
    });
    await shot(page, name, 'guide-offer');
    await check(`${name}: scenes paused while he is there (D6)`, async () => {
      assert.equal(await page.evaluate(() => window._guideBusy), true);
    });
    await check(`${name}: « Yes » turns the help on, he explains himself`, async () => {
      await click(page, btn('offerYes'));
      await page.waitForFunction(() => /pop up/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 4000 });
      const s = await store(page);
      assert.equal(s.on, '1'); assert.equal(s.offered, '1');
    });
    const waitText = (re, ms = 4000) => page.waitForFunction((src) => new RegExp(src).test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), re.source, { timeout: ms });
    await check(`${name}: « Got it » — then C3 on the login screen: the three modes, highlighted`, async () => {
      await click(page, btn('gotIt'));
      assert.match((await store(page)).seen || '', /"welcome"/);
      await waitText(/Three ways to play/);
      assert.equal(await page.locator('#ace-dock .ad-ace').count(), 1, 'Ace gone');
      await page.waitForFunction(() => { const r = document.getElementById('ag-ring'), c = document.querySelector('#login-step1 .login-cards');
        if (!r || !c || !r.classList.contains('ag-on')) return false; const a = r.getBoundingClientRect(), b = c.getBoundingClientRect(); return Math.abs(a.top - b.top) < 10; }, null, { timeout: 3000 });
    });
    await shot(page, name, 'guide-c3');
    await check(`${name}: C3 — « Next »: account versus guest, with « Create an account »`, async () => {
      await click(page, btn('next'));
      await waitText(/Guest mode/);
      assert.equal(await page.locator(btn('signup')).count(), 1);
    });
    await check(`${name}: « Later » folds it into a badge; a tap on the Ace shows it again`, async () => {
      await click(page, btn('later'));
      await page.waitForTimeout(300);
      assert.equal(await page.locator(bubble).count(), 0, 'bubble still open');
      assert.equal(await page.locator('#ace-dock .ad-ace.ad-has-badge').count(), 1, 'no badge');
      await click(page, '#ace-dock .ad-ace');
      await waitText(/Three ways to play/);
      await click(page, btn('next')); await click(page, btn('gotIt'));
      await page.waitForTimeout(300);
      assert.match((await store(page)).seen || '', /"login"/);
    });
    await check(`${name}: the « Ace’s Help » button opens his menu (show all tips again)`, async () => {
      await page.evaluate(() => window.guideToggle());
      await waitText(/is on/, 3000);
      assert.equal(await page.locator(btn('resetTips')).count(), 1);
      await click(page, btn('resetTips'));
      await waitText(/every tip/, 3000);
      assert.doesNotMatch((await store(page)).seen || '', /"welcome"|"login"/);
      await click(page, btn('close'));
    });
    await shot(page, name, 'guide-menu');
    await check(`${name}: C3 — a mode chosen: nickname and avatar, the avatar highlighted`, async () => {
      await page.waitForTimeout(600);
      if (await page.locator(bubble).count()) { await click(page, btn('later')); }
      await page.locator('.login-card').nth(2).click();
      await waitText(/nickname and your avatar/, 5000);
      await page.waitForFunction(() => { const r = document.getElementById('ag-ring'); return !!(r && r.classList.contains('ag-on')); }, null, { timeout: 3000 });
      await click(page, btn('gotIt'));
    });
    await check(`${name}: the offer never comes back after a reload`, async () => {
      await page.evaluate(() => localStorage.setItem('pth_guide_on', '0'));
      await openTable(page, base, { stopAt: 'login' }); await noBanner(page);
      await page.waitForTimeout(4000);
      assert.equal(await page.locator(bubble).count(), 0);
    });
    await ctx.close();
  }

  // ── lobby → a hand starts: he leaves (D8); option off sends him away ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { localStorage.setItem('pth_guide_dev', '1'); if (!sessionStorage.getItem('g1')) { sessionStorage.setItem('g1', '1'); localStorage.setItem('pth_guide_on', '1'); localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_guide_seen', JSON.stringify({ r: 0, s: { welcome: 1, login: 1, 'login-profile': 1 } })); } } catch (_e) {} });
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'lobby', seats: 6 });
    await check(`${name}: docked in the lobby`, async () => {
      await page.locator('#ace-dock .ad-ace').waitFor({ timeout: 5000 });
      inside(await box(page, '#ace-dock .ad-ace'), 'Ace');
    });
    await check(`${name}: the docked Ace hides no button or link (Create, chat send, status bar…)`, async () => {
      const under = await underAce(page);
      assert.deepEqual(under, []);
    });
    await shot(page, name, 'guide-lobby');
    await check(`${name}: C4 — seated at a Normal table: the host starts, invite friends`, async () => {
      await page.evaluate(() => { const f = window.__fx; f.socket.receive(f.envelope(f.MSG.T.JoinGameAck, 25, [[1, 0, f.GAME], [2, 0, 0]])); });
      await page.locator('#s-lobby.lobby-waiting').waitFor({ timeout: 4000 });
      await page.waitForFunction(() => /host of the table starts/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 5000 });
      const u = await underAce(page); assert.equal(u.length, 0, 'covered: ' + u.join(', '));
    });
    await shot(page, name, 'guide-c4');
    await enterTable(page, { seats: 6 });
    await check(`${name}: silent during a hand — he leaves the table (D8)`, async () => {
      await page.waitForFunction(() => !document.getElementById('ace-dock'), null, { timeout: 3000 });
      assert.equal(await page.evaluate(() => window._guideBusy), false);
    });
    await check(`${name}: the option in Advanced options turns him off`, async () => {
      await page.evaluate(() => { window.setAdvOpt('guide_on', false); });
      assert.equal((await store(page)).on, '0');
      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
      await page.waitForTimeout(1200);
      assert.equal(await page.locator('#ace-dock').count(), 0, 'Ace still docked with the help off');
    });
    await ctx.close();
  }

  // ── C1 → C2: a Ranking table on pokerth.net, joined, filled, started ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('g2')) { sessionStorage.setItem('g2', '1'); localStorage.setItem('pth_guide_on', '1'); localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_guide_seen', JSON.stringify({ r: 0, s: { welcome: 1, login: 1, 'login-profile': 1 } })); } } catch (_e) {} });
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'lobby', seats: 6 });
    // pokerth.net login, two open Ranking tables: 404 (7 players) and 405 (3)
    await page.evaluate(() => {
      const f = window.__fx; window.PthState._currentLoginMode = 'auth';
      const info = (name) => f.Proto.encode([[1, 2, name], [2, 0, 4], [3, 0, 10], [4, 0, 1], [5, 0, 11], [10, 0, 5], [11, 0, 5], [12, 0, 50], [13, 0, 10000]]);
      const list = (id, pids) => f.socket.receive(f.envelope(f.MSG.T.GameListNew, 14, [[1, 0, id], [2, 0, 1], [3, 0, 0], ...pids.map((p) => [4, 0, p]), [5, 0, pids[0]], [6, 2, info('Ranked ' + id)]]));
      list(404, [60, 61, 62, 63, 64, 65, 66]);
      list(405, [70, 71, 72]);
    });
    await check(`${name}: C1 — the Ace points at the fullest Ranking table`, async () => {
      await page.waitForFunction(() => /7\/10/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 5000 });
      await page.waitForFunction(() => { const r = document.getElementById('ag-ring'), row = document.querySelector('#g-list .game-row[data-gid="404"]');
        if (!r || !row || !r.classList.contains('ag-on')) return false; const a = r.getBoundingClientRect(), b = row.getBoundingClientRect();
        return Math.abs(a.left - b.left) < 8 && Math.abs(a.top - b.top) < 8; }, null, { timeout: 3000 });
      assert.equal(await page.locator(btn('join')).count(), 1);
    });
    await shot(page, name, 'guide-c1');
    await check(`${name}: C1 — live: the highlight moves when another table gets fuller`, async () => {
      await page.evaluate(() => { const f = window.__fx; for (const p of [73, 74, 75, 76, 77]) f.socket.receive(f.envelope(f.MSG.T.GameListPlayerJoined, 16, [[1, 0, 405], [2, 0, p]])); });
      await page.waitForFunction(() => /8\/10/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 3000 });
      await page.waitForFunction(() => { const r = document.getElementById('ag-ring'), row = document.querySelector('#g-list .game-row[data-gid="405"]');
        if (!r || !row) return false; const a = r.getBoundingClientRect(), b = row.getBoundingClientRect(); return Math.abs(a.top - b.top) < 8; }, null, { timeout: 3000 });
    });
    await check(`${name}: C1 — [Join] joins that table`, async () => {
      await page.evaluate(() => { window.__joined = null; const j = window.App.joinGame; window.App.joinGame = function (id) { window.__joined = id; return j.apply(this, arguments); }; });
      await click(page, btn('join'));
      assert.equal(await page.evaluate(() => window.__joined), 405);
      assert.match((await store(page)).seen || '', /lobby-ranking/);
    });
    await check(`${name}: C2 — in the ranked waiting room he highlights x/10 and explains`, async () => {
      await page.evaluate(() => { const f = window.__fx;
        f.socket.receive(f.envelope(f.MSG.T.JoinGameAck, 25, [[1, 0, 405], [2, 0, 0]]));
        for (const p of [70, 71, 72, 73, 74, 75, 76, 77]) f.socket.receive(f.envelope(f.MSG.T.GamePlayerJoined, 27, [[1, 0, 405], [2, 0, p]]));
        window.renderGames(); });
      await page.locator('#s-lobby.lobby-waiting').waitFor({ timeout: 4000 });
      await page.waitForFunction(() => /Ranked game/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 5000 });
      assert.match(await text(page), /9\/10/);
      await page.waitForFunction(() => { const r = document.getElementById('ag-ring'); return !!(r && r.classList.contains('ag-on')); }, null, { timeout: 3000 });
    });
    await check(`${name}: C2 — in the waiting-room layout the Ace hides no button or link`, async () => {
      const u = await underAce(page); assert.equal(u.length, 0, 'covered: ' + u.join(', '));
    });
    await shot(page, name, 'guide-c2');
    await check(`${name}: C2 — « Next » walks through the facts`, async () => {
      await click(page, btn('next'));
      assert.match(await text(page), /15, 9, 6, 4, 3, 2, 1/);
    });
    await check(`${name}: C2 — the game starts: « Good luck! », then he leaves (D8)`, async () => {
      await page.evaluate(() => { const f = window.__fx; const ids = [42, 70, 71, 72, 73, 74, 75, 76, 77, 78];
        f.socket.receive(f.envelope(f.MSG.T.GameStartInitial, 39, [[1, 0, 405], [2, 0, 70], [3, 2, new Uint8Array(ids)]])); });
      await page.locator('#s-game.active').waitFor({ timeout: 4000 });
      await page.waitForFunction(() => /Good luck/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 2000 });
      await page.waitForFunction(() => !document.getElementById('ace-dock'), null, { timeout: 4000 });
    });
    await check(`${name}: C2.4 — out in 3rd place, back in the lobby he tells the points`, async () => {
      await page.evaluate(() => { const S = window.PthState; for (const p of S.seats) { S.seatData[p] = S.seatData[p] || {}; S.seatData[p].money = 0; } S.seatData[42].money = 500; S.seatData[70].money = 5000; S.seatData[71].money = 4500; S.handNum = 7; });
      await page.waitForTimeout(1300);
      await page.evaluate(() => { const S = window.PthState; for (const p of S.seats) S.seatData[p].money = 0; S.seatData[70].money = 6000; S.seatData[71].money = 4000; S.handNum = 8; });
      await page.waitForTimeout(1300);
      assert.equal(await page.evaluate(() => window.guideDebug().result && window.guideDebug().result.place), 3);
      await page.evaluate(async () => { const S = window.PthState; S.gId = 0; S._gameStarted = false; S.amInGame = false; (await import('/modules/net/session.mjs')).show('s-lobby'); });
      await page.waitForFunction(() => /\+6/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 5000 });
      assert.equal(await page.locator(btn('seeRanking')).count(), 1);
    });
    await ctx.close();
  }

  // ── C1 for a guest: no Ranking table pointed at, a free account instead (D16) ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('g3')) { sessionStorage.setItem('g3', '1'); localStorage.setItem('pth_guide_on', '1'); localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_guide_seen', JSON.stringify({ r: 0, s: { welcome: 1, login: 1, 'login-profile': 1 } })); } } catch (_e) {} });
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'lobby', seats: 6 });
    await page.evaluate(() => {
      const f = window.__fx; window.PthState._currentLoginMode = 'guest';
      const info = f.Proto.encode([[1, 2, 'Ranked 404'], [2, 0, 4], [3, 0, 10], [4, 0, 1], [5, 0, 11], [10, 0, 5], [11, 0, 5], [12, 0, 50], [13, 0, 10000]]);
      f.socket.receive(f.envelope(f.MSG.T.GameListNew, 14, [[1, 0, 404], [2, 0, 1], [3, 0, 0], [4, 0, 60], [4, 0, 61], [5, 0, 60], [6, 2, info]]));
    });
    await check(`${name}: guest — one bubble about a free account, no Join, no highlight`, async () => {
      await page.waitForFunction(() => /free\) pokerth\.net account/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 5000 });
      assert.equal(await page.locator(btn('join')).count(), 0);
      assert.equal(await page.locator(btn('signup')).count(), 1);
      assert.equal(await page.locator('#ag-ring.ag-on').count(), 0);
    });
    await check(`${name}: guest — tapping a Ranking table anyway brings the explanation back`, async () => {
      await click(page, btn('gotIt'));
      await page.waitForTimeout(300);
      assert.equal(await page.locator(bubble).count(), 0);
      await page.locator('#g-list .game-row[data-gid="404"] .game-name').click();
      await page.waitForFunction(() => /free\) pokerth\.net account/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 3000 });
    });
    await ctx.close();
  }

  // ── the Ace speaks the player's language (French, and Arabic right to left) ──
  for (const [lang, re] of [['fr', /Tu débutes ici/], ['ar', /[\u0600-\u06FF]/]]) {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    await ctx.addInitScript((l) => { try { localStorage.setItem('pth_lang', l); } catch (_e) {} }, lang);
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'login' }); await noBanner(page);
    await check(`${name}: ${lang} — the offer comes in the player’s language, inside the screen`, async () => {
      await page.locator(bubble).waitFor({ timeout: 9000 });
      assert.match(await text(page), re);
      inside(await box(page, bubble), 'bubble');
      for (const id of ['offerNo', 'offerYes']) inside(await box(page, btn(id)), id);
    });
    await ctx.close();
  }

  // ── reduced motion: plain bubble, no Ace (D4) ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await ctx.addInitScript(DEV);
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'login' }); await noBanner(page);
    await check(`${name}: reduced motion — a plain bubble, no Ace (D4)`, async () => {
      await page.locator(bubble).waitFor({ timeout: 9000 });
      assert.equal(await page.locator('#ace-dock .mc-pos').count(), 0, 'the Ace is drawn');
      assert.equal(await page.locator('#ace-dock .ad-chip').count(), 1, 'no chip to reopen');
      inside(await box(page, bubble), 'bubble');
      const chip = await box(page, '#ace-dock .ad-ace'), bub = await box(page, bubble);
      assert.ok(bub.bottom <= chip.top + 1 || bub.right <= chip.left + 1, 'the bubble and the chip overlap');
    });
    await shot(page, name, 'guide-plain');
    await ctx.close();
  }

  await check(`${name}: no page error`, async () => {
    assert.deepEqual(errors.filter((e) => !/ResizeObserver loop/.test(e)), []);
  });
}

const code = await runPlan('Ace’s Help', reporter, runDevice, MATRIX, 15);
server.close();
process.exit(code);
