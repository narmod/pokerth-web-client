#!/usr/bin/env node
// Clickable chat nicknames (ui/chat-nick.mjs, web.153), in real browser
// engines on phone profiles, at a table (game chat):
//   1 · tap on a nickname → the player card of THAT player;
//   2 · right-click (mouse) or long-press (touch) → the menu, with « Player
//       card », « Quote » and « Ignore » for a player at the table, and the
//       long-press does NOT also open the card behind the menu;
//   3 · « Quote » writes « Name: » into the game chat input;
//   4 · a « /me » line: its sender is a nickname too, and ignoring the player
//       from the menu removes his plain AND « /me » lines;
//   5 · a player who left: tap → menu with only « Quote » and « Ignore »;
//   6 · option off (Advanced options → Chat): a tap does nothing;
//   7 · every new string exists in every language and in the help.
// Run:  node scripts/test-chat-nick-browser.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { startServer, createReporter, shot, openTable, runPlan } from './lib/mobile-harness.mjs';

const PHONES = [
  { name: 'iPhone 15', family: 'ios' },
  { name: 'Pixel 7', family: 'android' },
];

// 7 · static: strings and help in every language
{
  const dir = new URL('../public/modules/lang/', import.meta.url);
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.mjs'))) {
    const src = readFileSync(new URL(f, dir), 'utf8');
    for (const k of ['chatNickCard', 'chatNickQuote', 'advChatNickMenu']) assert.ok(new RegExp('\\b' + k + '\\s*:').test(src), f + ': missing ' + k);
  }
  const hdir = new URL('../public/modules/help/content/', import.meta.url);
  for (const f of readdirSync(hdir).filter((x) => x.endsWith('.mjs'))) {
    const h = (await import(new URL(f, hdir))).help;
    const s = h.chapters.find((c) => c.id === 'chat').sections.find((x) => x.id === 'panels');
    assert.equal(s.b.length, 2, f + ': the help does not explain the clickable nicknames');
  }
  const html = readFileSync(new URL('../public/pokerth-client.html', import.meta.url), 'utf8');
  assert.ok(html.includes('<script type="module" src="modules/ui/chat-nick.mjs"></script>'), 'module loaded by the page');
  assert.ok(html.includes('id="adv-chatnick"'), 'option in Advanced options → Chat');
  assert.ok(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8').includes("'/modules/ui/chat-nick.mjs'"), 'module precached');
  console.log('static checks OK');
}

const { server, base } = await startServer();
const reporter = createReporter();
const check = reporter.check;

const state = (page) => page.evaluate(() => {
  const vis = (e) => { if (!e) return false; const c = getComputedStyle(e), r = e.getBoundingClientRect(); return c.display !== 'none' && c.visibility !== 'hidden' && r.width > 1 && r.height > 1; };
  const card = document.getElementById('player-info-modal');
  const menu = document.getElementById('seat-ctx-menu');
  return {
    card: vis(card) ? ((document.getElementById('pim-name') || {}).textContent || '').trim() : null,
    menu: menu && menu.classList.contains('open') ? [...menu.querySelectorAll('[data-ctx-k]')].map((b) => b.getAttribute('data-ctx-k')) : null,
    menuHead: menu && menu.classList.contains('open') ? ((menu.querySelector('.ctx-hd') || {}).textContent || '') : null,
    input: (document.getElementById('g-chat-in') || {}).value,
    lines: [...document.querySelectorAll('#g-chat-msgs .msg')].map((m) => m.textContent.replace(/\s+/g, ' ').trim()),
  };
});
const closeAll = (page) => page.evaluate(() => { try { window.closeSeatMenu && window.closeSeatMenu(); } catch (e) {} try { window.closePlayerInfoPopup && window.closePlayerInfoPopup(); } catch (e) {} });
const who = (page, text, nth = 0) => page.locator('#g-chat-msgs .msg .who', { hasText: text }).nth(nth);

async function runDevice(browser, name, descriptor) {
  const context = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  page.on('dialog', (d) => d.accept().catch(() => {}));      // confirm « Ignore X? »
  try {
    await openTable(page, base, { seats: 6, board: 'flop', turn: 'me' });
    const other = await page.evaluate(() => { const S = window.PthState; const pid = S.seats.find((p) => p !== S.myId); return S.players[pid]; });
    await page.evaluate((n) => {
      try { if (!document.getElementById('g-chat-msgs').offsetParent) window.toggleGameChat(); } catch (e) {}
      window.addGameChat(n, 'hello table', '');
      window.addGameChat(n, '/me waves', '');
      window.addGameChat('Gone Player', 'bye all', '');
    }, other);
    await page.waitForTimeout(300);
    const visible = await page.evaluate(() => !!document.getElementById('g-chat-msgs').offsetParent);
    if (!visible) { reporter.fail('game chat not visible in this layout', name); return; }

    // 1 · tap → card
    await who(page, other).tap();
    await page.waitForTimeout(300);
    let s = await state(page);
    await shot(page, name, 'chatnick-1-card');
    await check('1 tap on a nickname opens THAT player\'s card', async () => {
      assert.ok(s.card && s.card.includes(other), `card: ${s.card}`);
      assert.equal(s.menu, null, 'the menu opened as well');
    });
    await closeAll(page);

    // 2 · long-press → menu, no card behind it
    const box = await who(page, other).boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      const ev = (type) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'touch', clientX: x, clientY: y, isPrimary: true }));
      ev('pointerdown');
      window.__lpEnd = () => { ev('pointerup'); el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y })); };
    }, { x: cx, y: cy });
    await page.waitForTimeout(700);
    await page.evaluate(() => window.__lpEnd());
    await page.waitForTimeout(200);
    s = await state(page);
    await shot(page, name, 'chatnick-2-menu');
    await check('2 long-press opens the menu (card, quote, ignore) and not the card behind it', async () => {
      assert.ok(s.menu, 'no menu after a long-press');
      for (const k of ['card', 'quote', 'ignore']) assert.ok(s.menu.includes(k), `menu without ${k}: ${s.menu}`);
      assert.ok(s.menuHead.includes(other), `menu header: ${s.menuHead}`);
      assert.equal(s.card, null, 'the card opened behind the menu');
    });

    // 3 · quote
    await page.locator('#seat-ctx-menu [data-ctx-k="quote"]').click();
    await page.waitForTimeout(200);
    s = await state(page);
    await check('3 « Quote » writes « Name: » into the game chat input', async () => assert.equal(s.input, other + ': '));
    await page.evaluate(() => { document.getElementById('g-chat-in').value = ''; });

    // 2b · right-click (mouse)
    await who(page, other).click({ button: 'right' });
    await page.waitForTimeout(200);
    s = await state(page);
    await check('2b right-click opens the same menu', async () => assert.ok(s.menu && s.menu.includes('ignore'), JSON.stringify(s.menu)));

    // 4 · /me line has a clickable sender; ignore removes both lines
    const meCount = await page.locator('#g-chat-msgs .msg.action .who').count();
    await page.locator('#seat-ctx-menu [data-ctx-k="ignore"]').click();
    await page.waitForTimeout(300);
    s = await state(page);
    await check('4 « /me » sender is a nickname; ignoring removes the plain AND the « /me » line', async () => {
      assert.equal(meCount, 1, 'the « /me » sender is not a .who');
      assert.ok(!s.lines.some((l) => l.includes('hello table') || l.includes('waves')), 'lines left: ' + JSON.stringify(s.lines));
      assert.ok(await page.evaluate((n) => window._isIgnored(n), other), 'player not ignored');
    });
    await page.evaluate((n) => window._setIgnoredName(n, false), other);

    // 5 · player who left: menu with quote + ignore only
    await who(page, 'Gone Player').tap();
    await page.waitForTimeout(300);
    s = await state(page);
    await check('5 a player gone from the server: tap gives the menu with « Quote » and « Ignore » only', async () => {
      assert.deepEqual(s.menu, ['quote', 'ignore']);
      assert.equal(s.card, null);
    });
    await closeAll(page);

    // 6 · option off
    await page.evaluate(() => window.setAdvOpt('chat_nick_menu', false));
    await page.evaluate((n) => window.addGameChat(n, 'again', ''), other);
    await who(page, other).last().tap();
    await page.waitForTimeout(300);
    s = await state(page);
    const cursor = await who(page, other).last().evaluate((e) => getComputedStyle(e).cursor);
    await check('6 option off: a tap does nothing, no pointer cursor', async () => {
      assert.equal(s.card, null); assert.equal(s.menu, null);
      assert.notEqual(cursor, 'pointer');
    });
    await page.evaluate(() => window.setAdvOpt('chat_nick_menu', true));
    await check('no JavaScript error', async () => assert.equal(errors.length, 0, errors.join(' | ')));
  } catch (error) { reporter.fail('aborted', String(error && error.message || error).split('\n')[0]); await shot(page, name, 'chatnick-aborted'); }
  finally { await context.close(); }
}

const code = await runPlan('test-chat-nick-browser', reporter, runDevice, PHONES, 10);
server.close();
process.exit(code);
