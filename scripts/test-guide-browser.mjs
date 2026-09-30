#!/usr/bin/env node
// Ace's Help (L1) in a real browser, on phones and a desktop:
//   · without ?guide=1 nothing shows (L1 is hidden): no Ace, no button;
//   · with it, the Ace offers his help ONCE on first launch (D3), docked at
//     the bottom right, bubble and buttons inside the screen, big enough for a
//     finger; « Yes » turns the help on and he says what he does; « Got it »
//     folds the bubble and he stays; a tap on him opens his menu; the offer
//     never comes back after a reload;
//   · the idle scenes wait while he offers his help (D6); with the help on
//     they start from his spot and bring him back, one size for both (web.265);
//   · in the lobby he is docked; the moment a hand starts he leaves (D8);
//   · switching the option off in Advanced options sends him away;
//   · with reduced motion there is no Ace, only a plain bubble (D4);
//   · no page error along the way.
// Run: node scripts/test-guide-browser.mjs   (PTH_MOBILE / PTH_DEVICES as the other browser tests)
import assert from 'node:assert/strict';
import { startServer, createReporter, shot, openTable, enterTable, runPlan, turnTo, ME } from './lib/mobile-harness.mjs';

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

  // ── C5: the game creation page and a window, first opening ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('g5')) { sessionStorage.setItem('g5', '1'); localStorage.setItem('pth_guide_on', '1'); localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_guide_seen', JSON.stringify({ r: 0, s: { welcome: 1, login: 1, 'login-profile': 1 } })); } } catch (_e) {} });
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'lobby', seats: 6 });
    const bubbleText = () => page.evaluate(() => (document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || '');
    await check(`${name}: C5 — first opening of Help: he explains it, on top of the window`, async () => {
      await page.evaluate(() => window.openHelp()   /* the window itself (the Help entries now bring the Ace, H1) */);
      await page.waitForFunction(() => /Everything about the app/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 5000 });
      const onTop = await page.evaluate(() => { const b = document.querySelector('#ace-dock .ad-bubble.ad-open').getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!(e && e.closest('#ace-dock')); });
      assert.ok(onTop, 'the bubble is under the window');
      inside(await box(page, bubble), 'bubble');
    });
    await shot(page, name, 'guide-c5-help');
    await check(`${name}: C5 — the window closes: the bubble folds; reopened: not explained twice`, async () => {
      await click(page, btn('gotIt'));
      await page.evaluate(() => window.closeHelp && window.closeHelp());
      await page.waitForTimeout(1600);
      await page.evaluate(() => window.openHelp()   /* the window itself (the Help entries now bring the Ace, H1) */);
      await page.waitForTimeout(2200);
      assert.doesNotMatch(await bubbleText(), /Everything about the app/);
      await page.evaluate(() => window.closeHelp && window.closeHelp());
    });
    await check(`${name}: C5 — the game creation page: the four types, Ranking for players with an account`, async () => {
      await page.waitForTimeout(800);
      await page.evaluate(() => window.App.openCreatePage());
      await page.waitForFunction(() => /Four game types/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 5000 });
    });
    await shot(page, name, 'guide-c5-create');
    await ctx.close();
  }

  // ── C6: « ? » mode — a tap explains, a second tap acts ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('g6')) { sessionStorage.setItem('g6', '1'); localStorage.setItem('pth_guide_on', '1'); localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_guide_seen', JSON.stringify({ r: 0, s: { welcome: 1, login: 1, 'login-profile': 1, 'w-ranking': 1 } })); } } catch (_e) {} });
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'lobby', seats: 6 });
    const txt = () => page.evaluate(() => (document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || '');
    await check(`${name}: C6 — the menu opens « ? » mode`, async () => {
      await page.evaluate(() => window.guideToggle());
      await page.locator(btn('askMenu')).waitFor({ timeout: 4000 });
      await click(page, btn('askMenu'));
      await page.waitForFunction(() => /second time to use it/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 3000 });
      assert.ok(await page.evaluate(() => document.body.classList.contains('guide-ask')));
    });
    await check(`${name}: C6 — first tap on Ranking: explained, nothing opens`, async () => {
      await page.locator('#ranking-btn-lobby').click();
      await page.waitForTimeout(400);
      assert.match(await txt(), /official PokerTH ranking/);
      assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('ranking-modal')).display), 'none', 'the ranking opened on the first tap');
      await page.waitForFunction(() => { const r = document.getElementById('ag-ring'); return !!(r && r.classList.contains('ag-on')); }, null, { timeout: 2000 });
    });
    await shot(page, name, 'guide-c6');
    await check(`${name}: C6 — second tap: it opens`, async () => {
      await page.locator('#ranking-btn-lobby').click();
      await page.waitForFunction(() => getComputedStyle(document.getElementById('ranking-modal')).display !== 'none', null, { timeout: 3000 });
      await page.evaluate(() => window.closeRankingModal && window.closeRankingModal());
    });
    await check(`${name}: C6 — « Done » ends the mode, taps act again`, async () => {
      await click(page, btn('askDone'));
      await page.waitForTimeout(300);
      assert.ok(!(await page.evaluate(() => document.body.classList.contains('guide-ask'))), 'still in « ? » mode');
      await page.locator('#ranking-btn-lobby').click();
      await page.waitForFunction(() => getComputedStyle(document.getElementById('ranking-modal')).display !== 'none', null, { timeout: 3000 });
      await page.evaluate(() => window.closeRankingModal && window.closeRankingModal());
    });
    await check(`${name}: H2 — in Advanced options an option says its own name; « More about it » opens the help section`, async () => {
      await page.evaluate(() => window.toggleAdvancedOptions());
      await page.waitForTimeout(700);
      await page.evaluate(() => window.guideAsk());
      await page.waitForFunction(() => document.body.classList.contains('guide-ask'), null, { timeout: 3000 });
      const row = page.locator('#adv-modal label.adv-row:visible').first();
      const name = (await row.locator('span').first().innerText()).trim();
      const before = await row.locator('input[type="checkbox"]').isChecked();
      await row.locator('span').first().click();
      await page.waitForTimeout(400);
      assert.ok((await txt()).includes(name), `the option's name « ${name} » is not said: ${await txt()}`);
      assert.equal(await row.locator('input[type="checkbox"]').isChecked(), before, 'the option changed on the first tap');
      await click(page, btn('moreAbout'));
      await page.waitForFunction(() => /›/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-kicker') || {}).textContent || ''), null, { timeout: 3000 });
      assert.match(await page.evaluate(() => document.querySelector('#ace-dock .ad-bubble.ad-open .ad-kicker').textContent), /Options & shortcuts/);
      assert.ok(!(await page.evaluate(() => document.body.classList.contains('guide-ask'))), '« ? » mode still on');
      await click(page, btn('close'));
      await page.evaluate(() => window.closeAdvancedOptions && window.closeAdvancedOptions());
    });
    await shot(page, name, 'guide-h2-more');
    await ctx.close();
  }

  // ── idle scenes from his spot (web.265): same size, out and back, tapped, called back by a tip ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('g7')) { sessionStorage.setItem('g7', '1'); localStorage.setItem('pth_guide_on', '1'); localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_guide_seen', JSON.stringify({ r: 0, s: { welcome: 1, login: 1, 'login-profile': 1 } })); } } catch (_e) {} });
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'lobby', seats: 6 });
    await page.locator('#ace-dock .ad-ace').waitFor({ timeout: 5000 });
    await page.waitForTimeout(800);
    for (let i = 0; i < 5 && await page.locator(bubble).count(); i++) {   // tips of this screen first
      const g = page.locator(btn('gotIt'));
      if (await g.count()) await g.first().click(); else await page.locator(bubble + ' .ad-btns [data-ad-btn]').last().click();
      await page.waitForTimeout(600);
    }
    const aceVisible = () => page.evaluate(() => { const a = document.querySelector('#ace-dock .ad-ace'); return !!a && getComputedStyle(a).visibility !== 'hidden'; });
    await check(`${name}: scenes — one size for the docked Ace and the scenes (80–110 px)`, async () => {
      const a = await box(page, '#ace-dock .ad-ace');
      const h = Math.max(80, Math.min(110, Math.min(a.vh * 0.15, a.vw * 0.22)));
      assert.ok(Math.abs(a.h - h) <= 1.5, `docked Ace ${a.h}px, scenes ${h}px`);
    });
    await check(`${name}: scenes — ready when no tip waits, not with a bubble open`, async () => {
      assert.equal(await page.evaluate(() => window._guideScene.ready()), true);
      await page.evaluate(() => window.guideToggle());
      await page.locator(bubble).waitFor({ timeout: 3000 });
      assert.equal(await page.evaluate(() => window._guideScene.ready()), false);
      await click(page, btn('close'));
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => window._guideScene.ready()), true);
    });
    await check(`${name}: scenes — he leaves his spot, plays, and walks back to it`, async () => {
      const home = await box(page, '#ace-dock .ad-ace');
      await page.evaluate(() => { window.__demo = window.mascotDemo('grim', { home: true, exit: 'home' }); });
      await page.locator('#mascot-root .mc-pos').waitFor({ state: 'attached', timeout: 3000 });
      const start = await page.evaluate(() => { const m = new DOMMatrixReadOnly(getComputedStyle(document.querySelector('#mascot-root .mc-pos')).transform); return { x: m.m41, y: m.m42 }; });
      assert.ok(Math.abs(start.x - home.left) < 40 && Math.abs(start.y - home.top) < 40, `starts at ${Math.round(start.x)},${Math.round(start.y)}, his spot is ${Math.round(home.left)},${Math.round(home.top)}`);
      assert.equal(await aceVisible(), false, 'two Aces on screen');
      const seq = await page.evaluate(() => window.__demo.then((s) => ({ entry: s.entry, exit: s.exit })));
      assert.deepEqual(seq, { entry: 'home', exit: 'home' });
      assert.equal(await page.locator('#mascot-root').count(), 0, 'scene still on screen');
      assert.equal(await aceVisible(), true, 'the docked Ace did not come back');
      const back = await box(page, '#ace-dock .ad-ace');
      assert.ok(Math.abs(back.left - home.left) < 2 && Math.abs(back.top - home.top) < 2, 'not back at his spot');
    });
    await check(`${name}: scenes — a tap while he is out: he walks back (~1 s), no puff`, async () => {
      await page.evaluate(() => { window.__demo = window.mascotDemo('sleep', { home: true }); });
      await page.locator('#mascot-root .mc-pos').waitFor({ state: 'attached', timeout: 3000 });
      await page.waitForTimeout(2500);
      const t0 = Date.now();
      await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
      assert.equal(await page.locator('#mascot-root .mc-puff').count(), 0, 'vanished in a puff');
      await page.waitForFunction(() => !document.getElementById('mascot-root'), null, { timeout: 2500 });
      assert.ok(Date.now() - t0 < 2000, 'too slow: ' + (Date.now() - t0) + ' ms');
      assert.equal(await aceVisible(), true);
      await page.evaluate(() => window.__demo);
    });
    await check(`${name}: scenes — a tip calls him back, then he speaks`, async () => {
      await page.evaluate(() => { window.__demo = window.mascotDemo('sleep', { home: true }); });
      await page.locator('#mascot-root .mc-pos').waitFor({ state: 'attached', timeout: 3000 });
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.guideResetTips());
      await page.waitForFunction(() => /every tip/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 4000 });
      assert.equal(await page.locator('#mascot-root').count(), 0, 'still out');
      assert.equal(await aceVisible(), true);
      await page.evaluate(() => window.__demo);
      await click(page, btn('close'));
      await page.waitForTimeout(400);
    });
    await shot(page, name, 'guide-scene-back');
    const waitScene = (ms) => page.waitForFunction(() => /Well done/.test((document.querySelector('#mascot-root .mc-bubble') || {}).textContent || ''), null, { timeout: ms });
    const sceneGone = () => page.waitForFunction(() => !document.getElementById('mascot-root'), null, { timeout: 12000 });
    await check(`${name}: « Well done! » — a game won: he cheers from his spot, then comes back`, async () => {
      await page.evaluate(() => window.mascotCheer('win'));
      await waitScene(7000);
      assert.equal(await aceVisible(), false, 'two Aces on screen');
      await sceneGone();
      await page.waitForTimeout(200);
      assert.equal(await aceVisible(), true);
    });
    await check(`${name}: « Well done! » — waits while a bubble is open (the tip first)`, async () => {
      await page.evaluate(() => window.guideToggle());
      await page.locator(bubble).waitFor({ timeout: 3000 });
      await page.evaluate(() => window.dispatchEvent(new CustomEvent('pth-achievement', { detail: { id: 'x' } })));
      await page.waitForTimeout(2500);
      assert.equal(await page.locator('#mascot-root').count(), 0, 'cheered over the bubble');
      await click(page, btn('close'));
      await waitScene(7000);
      await sceneGone();
    });
    await check(`${name}: « Well done! » — nothing with Ace’s Help off`, async () => {
      await page.evaluate(() => { window.setAdvOpt('guide_on', false); });
      await page.waitForTimeout(600);
      await page.evaluate(() => window.mascotCheer('win'));
      await page.waitForTimeout(2500);
      assert.equal(await page.locator('#mascot-root').count(), 0);
    });
    await ctx.close();
  }

  // ── « More help » (H1): the help window in the Ace's bubble, even with the tips off ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('g8')) { sessionStorage.setItem('g8', '1'); localStorage.setItem('pth_guide_on', '0'); localStorage.setItem('pth_guide_offered', '1'); } } catch (_e) {} });
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'lobby', seats: 6 });
    await page.waitForTimeout(600);
    await noBanner(page);
    const helpShown = () => page.evaluate(() => { const m = document.getElementById('help-modal'); return !!m && getComputedStyle(m).display !== 'none'; });
    const kicker = () => page.evaluate(() => (document.querySelector('#ace-dock .ad-bubble.ad-open .ad-kicker') || {}).textContent || '');
    await check(`${name}: More help — the Help entry brings the Ace with the help (tips off), not the window`, async () => {
      assert.equal(await page.locator('#ace-dock').count(), 0, 'Ace already there with the tips off');
      await page.evaluate(() => window.toggleHelp());
      await page.locator(bubble + ' .ad-search').waitFor({ timeout: 5000 });
      assert.equal(await helpShown(), false, 'the help window opened');
      assert.match(await kicker(), /More help · .*Lobby/);
      assert.ok(await page.locator(bubble + ' .ad-item').count() >= 3, 'no sections listed');
      inside(await box(page, bubble), 'bubble');
      const it = await box(page, bubble + ' .ad-item'); assert.ok(it.h >= 34, `items ${Math.round(it.h)}px tall`);
    });
    await shot(page, name, 'guide-morehelp');
    await check(`${name}: More help — a section read page by page, then back to the topics`, async () => {
      await page.locator(bubble + ' .ad-item').first().click();
      await page.waitForFunction(() => /›/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-kicker') || {}).textContent || ''), null, { timeout: 3000 });
      let guard = 0;
      while (await page.locator(btn('next')).count() && guard++ < 12) { await click(page, btn('next')); await page.waitForTimeout(80); }
      assert.equal(await page.locator(btn('close')).count(), 1, 'no Close on the last page');
      inside(await box(page, bubble), 'bubble on the last page');
      await click(page, btn('allTopics'));
      await page.locator(bubble + ' .ad-search').waitFor({ timeout: 3000 });
    });
    await check(`${name}: More help — search and chapters`, async () => {
      await page.locator(bubble + ' .ad-search').fill('side pot');
      await page.waitForTimeout(150);
      const hits = await page.locator(bubble + ' .ad-item').allInnerTexts();
      assert.ok(hits.length >= 1, 'no result for « side pot »');
      await page.locator(bubble + ' .ad-search').fill('zzzqqq');
      await page.waitForTimeout(150);
      assert.equal(await page.locator(bubble + ' .ad-empty').count(), 1, 'no « no results »');
      await page.locator(bubble + ' .ad-search').fill('');
      await page.locator(bubble + ' .ad-chap[data-ad-btn="ch:rules"]').click();
      await page.waitForFunction(() => /Poker rules/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-kicker') || {}).textContent || ''), null, { timeout: 3000 });
    });
    await check(`${name}: More help — « Help window » opens the classic window; Close sends him away`, async () => {
      await click(page, btn('helpWindow'));
      await page.waitForFunction(() => { const m = document.getElementById('help-modal'); return !!m && getComputedStyle(m).display !== 'none'; }, null, { timeout: 3000 });
      await page.waitForFunction(() => !document.getElementById('ace-dock'), null, { timeout: 3000 });
      await page.evaluate(() => window.closeHelp());
      await page.evaluate(() => window.toggleHelp());
      await page.locator(bubble + ' .ad-search').waitFor({ timeout: 5000 });
      await click(page, btn('close'));
      await page.waitForFunction(() => !document.getElementById('ace-dock'), null, { timeout: 3000 });
      assert.equal((await store(page)).on, '0', 'the tips were switched on');
    });
    await check(`${name}: More help — tips on: first entry of his menu`, async () => {
      await page.evaluate(() => { window.setAdvOpt('guide_on', true); });
      await page.waitForTimeout(900);
      for (let i = 0; i < 4 && await page.locator(bubble).count(); i++) { const g = page.locator(btn('gotIt')); if (await g.count()) await g.first().click(); else await page.locator(bubble + ' .ad-btns [data-ad-btn]').last().click(); await page.waitForTimeout(400); }
      await page.evaluate(() => window.guideToggle());
      await page.locator(btn('moreHelp')).waitFor({ timeout: 3000 });
      await click(page, btn('moreHelp'));
      await page.locator(bubble + ' .ad-search').waitFor({ timeout: 3000 });
      await click(page, btn('close'));
      await page.waitForTimeout(300);
      assert.equal(await page.locator('#ace-dock .ad-ace').count(), 1, 'he left with the tips on');
    });
    await enterTable(page, { seats: 6, turn: 'other' });
    await page.waitForTimeout(600);
    await check(`${name}: H3 — at the table, silent by himself; the Help entry brings him with « The game screen »`, async () => {
      assert.equal(await page.locator('#ace-dock').count(), 0, 'he came by himself during a hand');
      await page.evaluate(() => window.toggleHelp());
      await page.locator(bubble + ' .ad-search').waitFor({ timeout: 5000 });
      assert.match(await kicker(), /The game screen/);
      assert.equal(await helpShown(), false, 'the help window opened');
      inside(await box(page, bubble), 'bubble');
      await click(page, btn('close'));
      await page.waitForFunction(() => !document.getElementById('ace-dock'), null, { timeout: 3000 });
    });
    await check(`${name}: H3 — « ? » at the table during a hand: the info panel button explained, not opened`, async () => {
      await page.evaluate(() => window.guideAsk());
      await page.waitForFunction(() => document.body.classList.contains('guide-ask'), null, { timeout: 3000 });
      const shownBefore = await page.evaluate(() => { const p = document.getElementById('g-log-panel'); return !!p && getComputedStyle(p).display !== 'none'; });
      await page.locator('#log-toggle-btn').click();
      await page.waitForTimeout(400);
      assert.match(await page.evaluate(() => (document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), /info panel/);
      const shownAfter = await page.evaluate(() => { const p = document.getElementById('g-log-panel'); return !!p && getComputedStyle(p).display !== 'none'; });
      assert.equal(shownAfter, shownBefore, 'the panel toggled on the first tap');
      assert.equal(await page.locator(btn('moreAbout')).count(), 1, 'no « More about it »');
    });
    await shot(page, name, 'guide-h3-table');
    await check(`${name}: H3 — my turn comes: « ? » mode ends and he leaves, the action buttons are free`, async () => {
      await turnTo(page, ME);
      await page.waitForFunction(() => !document.body.classList.contains('guide-ask') && !document.getElementById('ace-dock'), null, { timeout: 3000 });
    });
    await check(`${name}: H3 — « ? » at my turn: a tap on Fold acts at once and ends the mode`, async () => {
      await page.evaluate(() => window.guideAsk());
      await page.waitForFunction(() => document.body.classList.contains('guide-ask'), null, { timeout: 3000 });
      await page.locator('.btn-action.btn-fold').first().click();
      await page.waitForTimeout(400);
      assert.ok(!(await page.evaluate(() => document.body.classList.contains('guide-ask'))), 'still in « ? » mode');
      assert.doesNotMatch(await page.evaluate(() => (document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), /Fold:/, 'Fold was explained instead of acting');
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
