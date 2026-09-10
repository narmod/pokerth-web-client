#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const root = join(process.cwd(), 'public');
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const relative = pathname === '/' ? 'pokerth-client.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
    const file = normalize(join(root, relative));
    if (!file.startsWith(root) || !statSync(file).isFile()) throw new Error('not found');
    response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    response.end(readFileSync(file));
  } catch (_error) {
    response.writeHead(404);
    response.end('not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true, serviceWorkers: 'block' });
const page = await context.newPage();
page.on('dialog', (dialog) => dialog.dismiss());

let passed = 0;
async function check(name, action) {
  await action();
  console.log('ok  -', name);
  passed++;
}

async function chooseInterfaceSize(page, surface, value) {
  await page.locator(`#accessibility-open-${surface}`).click();
  await page.locator(`input[name="interface-size"][value="${value}"]`).check();
  await page.keyboard.press('Escape');
}

async function connectFixtureSocket(page) {
  await page.evaluate(() => {
    class FixtureSocket extends EventTarget {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSING = 2;
      static CLOSED = 3;
      constructor(url) {
        super();
        this.url = url;
        this.readyState = FixtureSocket.OPEN;
        this.sent = [];
        FixtureSocket.instance = this;
        setTimeout(() => this.onopen && this.onopen({ target: this }), 0);
      }
      send(data) { this.sent.push(data); }
      close() {
        this.readyState = FixtureSocket.CLOSED;
        if (this.onclose) this.onclose({ code: 1000, target: this });
      }
      receive(payload) {
        const frame = new ArrayBuffer(4 + payload.byteLength);
        new DataView(frame).setUint32(0, payload.byteLength, false);
        new Uint8Array(frame).set(payload, 4);
        this.onmessage({ data: frame, target: this });
      }
    }
    window.WebSocket = FixtureSocket;
  });
  await page.locator('.btn-primary[data-i18n="connect"]').click();
  await page.waitForFunction(() => window.WebSocket.instance && typeof window.WebSocket.instance.onmessage === 'function');
  await page.waitForFunction(() => window.WebSocket.instance.readyState === window.WebSocket.OPEN);
}

async function populateLobby(page) {
  if (await page.locator('.game-row.gcard').count()) return;
  await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
  await page.locator('#s-connect.active').waitFor();
  await page.locator('.login-card').nth(2).click();
  await page.locator('#nick').fill('OutcomeTester');
  await connectFixtureSocket(page);
  const sawInit = await page.evaluate(async () => {
    const { Proto } = await import('/modules/net/proto.mjs');
    const { MSG } = await import('/modules/net/messages.mjs');
    const socket = window.WebSocket.instance;
    const envelope = (type, field, inner) => Proto.encode([[1, 0, type], [field, 2, Proto.encode(inner)]]);
    const version = Proto.encode([[1, 0, 2], [2, 0, 1]]);
    socket.receive(envelope(MSG.T.Announce, 2, [[1, 2, version], [2, 2, version], [4, 0, 0], [5, 0, 0]]));
    const sentTypes = socket.sent.filter((frame) => frame instanceof ArrayBuffer).map((frame) => {
      const bytes = new Uint8Array(frame);
      return MSG.parse(bytes.slice(4)).type;
    });
    socket.receive(envelope(MSG.T.InitAck, 7, [[1, 2, new Uint8Array([1, 2, 3, 4])], [2, 0, 42]]));
    for (const [pid, name] of [[11, 'Alex'], [12, 'Blair'], [13, 'Casey']]) {
      socket.receive(envelope(MSG.T.PlayerList, 13, [[1, 0, pid], [2, 0, 0]]));
      const info = Proto.encode([[1, 2, name], [3, 0, 2]]);
      socket.receive(envelope(MSG.T.PlayerInfoReply, 20, [[1, 0, pid], [2, 2, info]]));
    }
    const game = (id, mode, name, maxPlayers, type, seats, timeout, delay) => envelope(MSG.T.GameListNew, 14, [
      [1, 0, id], [2, 0, mode], [3, 0, 0], ...seats.map((pid) => [4, 0, pid]), [5, 0, seats[0]],
      [6, 2, Proto.encode([[1, 2, name], [2, 0, type], [3, 0, maxPlayers], [10, 0, delay], [11, 0, timeout]])],
    ]);
    socket.receive(game(101, 1, 'Accessible Open Table', 8, 1, [11, 12], 15, 5));
    socket.receive(game(202, 2, 'Accessible Running Table', 10, 4, [11, 12, 13, 14, 15], 10, 7));
    socket.sent.length = 0;
    return sentTypes.includes(MSG.T.Init);
  });
  assert.equal(sawInit, true, 'the production session did not answer Announce with Init');
  await page.locator('#s-lobby.active').waitFor();
  await page.locator('#g-filter-select').selectOption('0');
  await page.locator('.game-row.gcard').first().waitFor();
}

async function startActiveHand(page, seatCount) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => {
    localStorage.removeItem('pth_resume');
    localStorage.setItem('pth_interface_size', 'standard');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.applyAccessibilityPreferences === 'function');
  await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
  await page.locator('#s-connect.active').waitFor();
  await page.locator('.login-card').nth(2).click();
  await page.locator('#nick').fill('OutcomeTester');
  await connectFixtureSocket(page);
  await page.waitForTimeout(300);
  await page.evaluate(async (count) => {
    const { Proto } = await import('/modules/net/proto.mjs');
    const { MSG } = await import('/modules/net/messages.mjs');
    const socket = window.WebSocket.instance;
    const envelope = (type, field, inner) => Proto.encode([[1, 0, type], [field, 2, Proto.encode(inner)]]);
    const version = Proto.encode([[1, 0, 2], [2, 0, 1]]);
    const ids = [42, ...Array.from({ length: count - 1 }, (_, index) => 50 + index)];
    socket.receive(envelope(MSG.T.Announce, 2, [[1, 2, version], [2, 2, version], [4, 0, 0], [5, 0, 0]]));
    socket.receive(envelope(MSG.T.InitAck, 7, [[1, 2, new Uint8Array([1, 2, 3, count])], [2, 0, 42]]));
    for (const [index, pid] of ids.entries()) {
      socket.receive(envelope(MSG.T.PlayerList, 13, [[1, 0, pid], [2, 0, 0]]));
      const info = Proto.encode([[1, 2, pid === 42 ? 'OutcomeTester' : `Player ${index + 1}`], [3, 0, 2]]);
      socket.receive(envelope(MSG.T.PlayerInfoReply, 20, [[1, 0, pid], [2, 2, info]]));
    }
    const gameInfo = Proto.encode([
      [1, 2, `Accessibility ${count}-seat table`], [2, 0, 1], [3, 0, count],
      [4, 0, 1], [5, 0, 7], [10, 0, 5], [11, 0, 30], [12, 0, 10], [13, 0, 3000],
    ]);
    socket.receive(envelope(MSG.T.GameListNew, 14, [
      [1, 0, 303], [2, 0, 1], [3, 0, 0], ...ids.map((pid) => [4, 0, pid]),
      [5, 0, ids[1]], [6, 2, gameInfo],
    ]));
    socket.receive(envelope(MSG.T.JoinGameAck, 25, [[1, 0, 303], [2, 0, 0]]));
    socket.receive(envelope(MSG.T.GameStartInitial, 39, [
      [1, 0, 303], [2, 0, ids[1]], [3, 2, new Uint8Array(ids)],
    ]));
    socket.receive(envelope(MSG.T.HandStart, 41, [
      [1, 0, 303], [2, 2, Proto.encode([[1, 0, 12], [2, 0, 25]])], [4, 0, 10], [6, 0, ids[1]],
    ]));
    socket.receive(envelope(MSG.T.PlayersActionDone, 45, [
      [1, 0, 303], [2, 0, ids[1]], [3, 0, 0], [4, 0, 0], [5, 0, 20], [6, 0, 2980], [7, 0, 20], [8, 0, 20],
    ]));
    socket.receive(envelope(MSG.T.PlayersActionDone, 45, [
      [1, 0, 303], [2, 0, 42], [3, 0, 0], [4, 0, 0], [5, 0, 10], [6, 0, 2990], [7, 0, 20], [8, 0, 20],
    ]));
    socket.receive(envelope(MSG.T.DealFlop, 46, [[1, 0, 303], [2, 0, 10], [3, 0, 22], [4, 0, 35]]));
    socket.receive(envelope(MSG.T.PlayersTurn, 42, [[1, 0, 303], [2, 0, 42], [3, 0, 1]]));
  }, seatCount);
  await page.locator('#s-game.active .act-buttons-row .btn-action').first().waitFor();
  await page.locator(`#g-seats .seat[data-pid="42"]`).waitFor();
  await page.waitForFunction((count) => document.querySelectorAll('#g-seats .seat').length === count, seatCount);
  await page.waitForTimeout(700);
  await page.evaluate(() => { window.WebSocket.instance.sent.length = 0; });
}

async function activeHandRects(page) {
  return page.evaluate(() => {
    const rect = (element) => {
      const value = element.getBoundingClientRect();
      return { left: value.left, top: value.top, right: value.right, bottom: value.bottom, width: value.width, height: value.height };
    };
    const contentRect = (element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const value = range.getBoundingClientRect();
      return { left: value.left, top: value.top, right: value.right, bottom: value.bottom, width: value.width, height: value.height };
    };
    const union = (elements) => {
      const values = [...elements].map((element) => typeof element.getBoundingClientRect === 'function' ? rect(element) : element);
      return {
        left: Math.min(...values.map((value) => value.left)),
        top: Math.min(...values.map((value) => value.top)),
        right: Math.max(...values.map((value) => value.right)),
        bottom: Math.max(...values.map((value) => value.bottom)),
        width: Math.max(...values.map((value) => value.right)) - Math.min(...values.map((value) => value.left)),
        height: Math.max(...values.map((value) => value.bottom)) - Math.min(...values.map((value) => value.top)),
      };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      seats: [...document.querySelectorAll('#g-seats .seat-plate')].map(rect),
      seatValues: [...document.querySelectorAll('#g-seats .seat')].map((seat) => union([...seat.querySelectorAll('.seat-name, .seat-money')].map(contentRect))),
      cards: union(document.querySelectorAll('#g-comm .pk')),
      cardFaces: [...document.querySelectorAll('#s-game .pk:not(.back):not(.comm-slot)')]
        .filter((card) => { const value = card.getBoundingClientRect(); return value.width > 0 && value.height > 0; }).map(rect),
      communityCardFaces: [...document.querySelectorAll('#g-comm .pk:not(.back):not(.comm-slot)')]
        .filter((card) => { const value = card.getBoundingClientRect(); return value.width > 0 && value.height > 0; }).map(rect),
      pot: rect(document.querySelector('#g-potbar')),
      actions: rect(document.querySelector('#g-actions .action-grid')),
      status: rect(document.querySelector('#pot-strip')),
      statusContent: [...document.querySelectorAll('#pot-strip .gsb-lbl, #pot-strip .gsb-total, #pot-strip .gsb-bets, #pot-strip .gsb-phase, #pot-strip .gsb-val, #pot-strip .blinds-next')]
        .filter((element) => { const value = element.getBoundingClientRect(); return value.width > 0 && value.height > 0; }).map(rect),
      drawerBar: rect(document.querySelector('.adaptive-drawer-bar')),
    };
  });
}

async function visibleCardOutcomes(page) {
  return page.evaluate(() => {
    const rect = (element) => {
      const value = element.getBoundingClientRect();
      return { left: value.left, top: value.top, right: value.right, bottom: value.bottom, width: value.width, height: value.height };
    };
    const contentRect = (element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return rect(range);
    };
    return [...document.querySelectorAll('#s-game .pk:not(.back):not(.comm-slot)')]
      .filter((card) => { const value = card.getBoundingClientRect(); return value.width > 0 && value.height > 0; })
      .map((card) => {
        const rank = card.querySelector('.c-rank');
        const suit = card.querySelector('.c-suit');
        const style = getComputedStyle(card);
        return {
          card: rect(card),
          rank: contentRect(rank),
          suit: contentRect(suit),
          rankVisible: getComputedStyle(rank).display !== 'none',
          suitVisible: getComputedStyle(suit).display !== 'none',
          imageFace: style.backgroundImage !== 'none',
        };
      });
  });
}

async function seatCenters(page) {
  return page.evaluate(() => [...document.querySelectorAll('#g-seats .seat:not(.me)')].map((seat) => {
    const rect = seat.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }));
}

async function turnCueOutcome(page) {
  return page.evaluate(() => {
    const active = document.querySelector('.seat.active .seat-plate');
    const inactive = document.querySelector('.seat:not(.active) .seat-plate');
    const style = getComputedStyle(active, '::after');
    const inactiveStyle = inactive ? getComputedStyle(inactive, '::after') : null;
    const borderWidth = parseFloat(style.borderWidth);
    const renderedWidth = parseFloat(style.width) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    const renderedHeight = parseFloat(style.height) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    return {
      borderWidth,
      prominence: Math.max(renderedWidth - active.offsetWidth, renderedHeight - active.offsetHeight),
      visible: borderWidth > 0 && style.borderStyle !== 'none' && style.content !== 'none',
      distinctFromInactive: !inactiveStyle || inactiveStyle.content === 'none' || inactiveStyle.borderStyle === 'none',
    };
  });
}

async function outboundSizeChangeTraffic(page, before) {
  return page.evaluate(async (start) => {
    const { MSG } = await import('/modules/net/messages.mjs');
    return window.WebSocket.instance.sent.slice(start)
      .filter((frame) => frame instanceof ArrayBuffer)
      .map((frame) => MSG.parse(new Uint8Array(frame).slice(4)).type)
      .filter((type) => type !== MSG.T.ResetTimeout);
  }, before);
}

function overlaps(a, b, tolerance = 1) {
  return Math.min(a.right, b.right) - Math.max(a.left, b.left) > tolerance &&
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > tolerance;
}

function assertReachable(rect, viewport, label) {
  assert.ok(rect.width > 0 && rect.height > 0 && rect.left >= -1 && rect.top >= -1 && rect.right <= viewport.width + 1 && rect.bottom <= viewport.height + 1,
    `${label} is outside ${viewport.width}x${viewport.height}: ${JSON.stringify(rect)}`);
}

async function takeLobbyJoinOutcomes(page) {
  return page.evaluate(async () => {
    const { Proto } = await import('/modules/net/proto.mjs');
    const { MSG } = await import('/modules/net/messages.mjs');
    return window.WebSocket.instance.sent.splice(0)
      .filter((frame) => frame instanceof ArrayBuffer)
      .map((frame) => MSG.parse(new Uint8Array(frame).slice(4)))
      .filter((message) => message.type === MSG.T.JoinExisting)
      .map((message) => `${Proto.u32(message.sub, 4) ? 'spectate' : 'join'}:${Proto.u32(message.sub, 1)}`);
  });
}

async function visibleMetrics(page, selectors) {
  return page.evaluate((entries) => Object.fromEntries(entries.map((selector) => {
    const element = document.querySelector(selector);
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return [selector, {
      fontSize: parseFloat(style.fontSize),
      cssWidth: parseFloat(style.width),
      cssHeight: parseFloat(style.height),
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      visible: rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth,
    }];
  })), selectors);
}

function assertScaled(actual, baseline, multiplier, label) {
  assert.ok(actual >= baseline * (multiplier - 0.05), `${label}: expected ${multiplier}x ${baseline}, got ${actual}`);
}

function assertExactScaled(actual, baseline, multiplier, label) {
  assert.ok(Math.abs(actual - baseline * multiplier) <= 0.05,
    `${label}: expected exactly ${multiplier}x ${baseline}, got ${actual}`);
}

async function assertTextFits(page, selector, label) {
  const fits = await page.locator(selector).first().evaluate((element) =>
    element.scrollWidth <= element.clientWidth + 1 && element.scrollHeight <= element.clientHeight + 1);
  assert.equal(fits, true, `${label} is clipped`);
}

async function assertEnhancedTargets(page, selectors, label) {
  for (const selector of selectors) {
    const target = page.locator(selector).first();
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44,
      `${label} ${selector} is ${box ? `${box.width}x${box.height}` : 'not rendered'}`);
  }
}

async function assertKeyboardFocusVisible(page, selectors, label) {
  for (const selector of selectors) {
    const target = page.locator(selector).first();
    await target.scrollIntoViewIfNeeded();
    await page.keyboard.press('Tab');
    await target.focus();
    const focus = await target.evaluate((element) => {
      const style = getComputedStyle(element);
      return { active: document.activeElement === element, width: parseFloat(style.outlineWidth), style: style.outlineStyle };
    });
    assert.ok(focus.active && focus.width >= 2 && focus.style !== 'none', `${label} ${selector} has no visible focus outline`);
  }
}

console.log('test-accessibility-browser');
try {
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.applyAccessibilityPreferences === 'function' && typeof window.exportWebBackup === 'function');

  await check('the pre-login entry point discovers and opens the accessibility panel', async () => {
    await page.locator('#accessibility-open-connect').click();
    await page.locator('#accessibility-modal[aria-hidden="false"]').waitFor();
  });
  await check('keyboard focus stays in the modal and returns to its invoker', async () => {
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.value), 'standard');
    await page.locator('#accessibility-reset').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'accessibility-close');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'accessibility-reset');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#accessibility-modal').getAttribute('aria-hidden'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'accessibility-open-connect');
  });
  await check('the lobby Accessibility entry is visibly operable', async () => {
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    const entry = page.locator('#accessibility-open-lobby');
    assert.equal(await entry.isVisible(), true);
    assert.equal(await entry.isEnabled(), true);
    await entry.click();
    await page.locator('#accessibility-modal[aria-hidden="false"]').waitFor();
    await page.keyboard.press('Escape');
  });
  await check('the game Accessibility entry is visibly operable', async () => {
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-game'));
    await page.locator('#s-game.active').waitFor();
    const entry = page.locator('#accessibility-open-game');
    assert.equal(await entry.isVisible(), true);
    assert.equal(await entry.isEnabled(), true);
    await entry.click();
    await page.locator('#accessibility-modal[aria-hidden="false"]').waitFor();
  });
  await check('interface size and high contrast apply live', async () => {
    await page.locator('input[name="interface-size"][value="large"]').check();
    await page.locator('#accessibility-high-contrast').check();
    assert.equal(await page.locator('html').getAttribute('data-interface-size'), 'large');
    assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'true');
  });
  await check('valid preferences survive a real page reload', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.interfaceSize === 'large');
    assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'true');
  });

  const downloadPromise = page.waitForEvent('download');
  await page.evaluate(() => window.exportWebBackup());
  const download = await downloadPromise;
  const backupPath = await download.path();
  const backup = JSON.parse(readFileSync(backupPath, 'utf8'));
  await check('the real full-backup export carries accessibility preferences', async () => {
    assert.equal(backup.keys.pth_interface_size, 'large');
    assert.equal(backup.keys.pth_high_contrast, '1');
  });

  await page.evaluate(() => {
    localStorage.removeItem('pth_interface_size');
    localStorage.removeItem('pth_high_contrast');
  });
  const chooserPromise = page.waitForEvent('filechooser');
  await page.evaluate(() => window.importWebBackupPick());
  const chooser = await chooserPromise;
  await chooser.setFiles(backupPath);
  await page.waitForFunction(() => localStorage.getItem('pth_interface_size') === 'large' && localStorage.getItem('pth_high_contrast') === '1');
  await check('the real full-backup import restores and reapplies preferences', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.interfaceSize === 'large');
    assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'true');
  });

  await page.evaluate(() => {
    localStorage.setItem('pth_interface_size', 'giant');
    localStorage.setItem('pth_high_contrast', '1');
    localStorage.setItem('pth_browser_zoom', 'broken');
  });
  await check('malformed properties recover independently after reload', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.interfaceSize === 'standard');
    assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'true');
    assert.equal(await page.locator('#accessibility-browser-zoom').isChecked(), false);
  });
  await check('desktop login remains readable and operable at every Interface size', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const selectors = ['#login-step1 .login-lead', '.login-card .lc-t', '.login-card .lc-d', '.login-card .lc-ic'];
    const samples = {};
    for (const [value, multiplier] of [['standard', 1], ['large', 1.5], ['extra-large', 2]]) {
      await chooseInterfaceSize(page, 'connect', value);
      samples[value] = await visibleMetrics(page, selectors);
      for (const selector of selectors) {
        assert.equal(samples[value][selector].visible, true, `${value} ${selector} is outside the viewport`);
        assertScaled(samples[value][selector].fontSize, samples.standard[selector].fontSize, multiplier, `${value} ${selector}`);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${value} login overflows horizontally`);
      await page.locator('.login-card').first().click();
      await page.locator('#nick').fill('OutcomeTester');
      assert.equal(await page.locator('#nick').isVisible(), true);
      assert.equal(await page.locator('.btn-primary[data-i18n="connect"]').isVisible(), true);
      await page.locator('.login-back').click();
    }
  });
  await check('desktop lobby remains readable and operable at every Interface size', async () => {
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    const selectors = ['#g-filter-select', '#chat-in', '.lobby-footbar .lfb-create', '#accessibility-open-lobby svg'];
    const samples = {};
    for (const [value, multiplier] of [['standard', 1], ['large', 1.5], ['extra-large', 2]]) {
      await chooseInterfaceSize(page, 'lobby', value);
      samples[value] = await visibleMetrics(page, selectors);
      for (const selector of selectors.slice(0, 3)) {
        assert.equal(samples[value][selector].visible, true, `${value} ${selector} is outside the viewport`);
        assertScaled(samples[value][selector].fontSize, samples.standard[selector].fontSize, multiplier, `${value} ${selector}`);
      }
      assertScaled(samples[value][selectors[3]].width, samples.standard[selectors[3]].width, multiplier, `${value} lobby Accessibility icon`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${value} lobby overflows horizontally`);
      await page.locator('#g-filter-select').selectOption('1');
      assert.equal(await page.locator('#g-filter-select').inputValue(), '1');
      await page.locator('#chat-in').fill(`Lobby chat ${value}`);
      await page.locator('.lobby-footbar .lfb-create').click();
      await page.locator('#s-create.active #create-form').waitFor();
      await page.locator('#cf-name').fill(`Outcome ${value}`);
      assert.equal(await page.locator('#cf-name').inputValue(), `Outcome ${value}`);
      await page.locator('#s-create .cp-back').click();
      await page.locator('#s-lobby.active').waitFor();
    }
  });
  await check('mobile login and lobby remain usable at Extra Large', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
    await page.locator('#s-connect.active').waitFor();
    await chooseInterfaceSize(page, 'connect', 'standard');
    const standardLogin = await visibleMetrics(page, ['.login-card .lc-t', '.login-card .lc-d', '.login-card .lc-ic']);
    await chooseInterfaceSize(page, 'connect', 'extra-large');
    const extraLargeLogin = await visibleMetrics(page, ['.login-card .lc-t', '.login-card .lc-d', '.login-card .lc-ic']);
    for (const selector of Object.keys(standardLogin)) {
      assertScaled(extraLargeLogin[selector].fontSize, standardLogin[selector].fontSize, 2, `mobile Extra Large ${selector}`);
      await assertTextFits(page, selector, `mobile Extra Large ${selector}`);
    }
    assert.ok(await page.locator('#s-connect').evaluate((screen) => screen.scrollWidth <= screen.clientWidth + 1), 'mobile Extra Large login overflows horizontally');
    await page.locator('.login-card').first().click();
    await page.locator('#nick').fill('MobileOutcome');
    await page.locator('.btn-primary[data-i18n="connect"]').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('.btn-primary[data-i18n="connect"]').isVisible(), true);
    await page.locator('.login-back').click();

    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    const standardLobby = await chooseInterfaceSize(page, 'lobby', 'standard').then(() =>
      visibleMetrics(page, ['#g-filter-select', '#chat-in', '.lobby-footbar .lfb-create']));
    await chooseInterfaceSize(page, 'lobby', 'extra-large');
    const extraLargeLobby = await visibleMetrics(page, ['#g-filter-select', '#chat-in', '.lobby-footbar .lfb-create']);
    for (const selector of Object.keys(standardLobby)) {
      assertScaled(extraLargeLobby[selector].fontSize, standardLobby[selector].fontSize, 2, `mobile Extra Large ${selector}`);
    }
    await assertTextFits(page, '.lobby-footbar .lfb-create', 'mobile Extra Large Create Table action');
    const lobbyOverflow = await page.locator('#s-lobby').evaluate((screen) => ({
      clientWidth: screen.clientWidth,
      scrollWidth: screen.scrollWidth,
      offenders: [...screen.querySelectorAll('*')].filter((element) => {
        const rect = element.getBoundingClientRect();
        return getComputedStyle(element).display !== 'none' && rect.right > screen.clientWidth + 1;
      }).slice(0, 8).map((element) => `${element.tagName.toLowerCase()}#${element.id}.${element.className}`),
    }));
    assert.ok(lobbyOverflow.scrollWidth <= lobbyOverflow.clientWidth + 1, `mobile Extra Large lobby overflows horizontally: ${JSON.stringify(lobbyOverflow)}`);
    await page.locator('#g-filter-select').selectOption('2');
    await page.locator('#chat-in').fill('Mobile lobby chat');
    await page.locator('.lobby-footbar .lfb-create').click();
    await page.locator('#s-create.active #create-form').waitFor();
    await page.locator('#cf-name').fill('Mobile Outcome');
    await page.locator('#s-create .cp-back').click();
    await page.locator('#s-lobby.active').waitFor();
  });
  await check('principal login and lobby targets are enhanced in Large and Extra Large', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const value of ['large', 'extra-large']) {
      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
      await page.locator('#s-connect.active').waitFor();
      await chooseInterfaceSize(page, 'connect', value);
      await assertEnhancedTargets(page, ['#accessibility-open-connect', '.login-card'], `${value} login`);
      await page.locator('.login-card').first().click();
      await assertEnhancedTargets(page, ['.login-back', '#av-trigger', '#nick', '.btn-primary[data-i18n="connect"]'], `${value} login form`);

      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
      await page.locator('#s-lobby.active').waitFor();
      await assertEnhancedTargets(page, ['#live-leave-anchor', '#accessibility-open-lobby', '#l-overflow-btn', '#g-filter-select', '#l-chat-emoji-toggle', '#lobby-chat-panel .chat-send', '.lobby-footbar .lfb-create'], `${value} lobby`);
      await page.locator('.lobby-footbar .lfb-create').click();
      await page.locator('#s-create.active #create-form').waitFor();
      await assertEnhancedTargets(page, ['#s-create .cp-back', '#cf-name', '.cf-create-btn'], `${value} Create Table`);
    }
  });
  await check('short mobile landscape keeps principal login and lobby header targets enhanced', async () => {
    await page.setViewportSize({ width: 844, height: 390 });
    for (const value of ['large', 'extra-large']) {
      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
      await page.locator('#s-connect.active').waitFor();
      await chooseInterfaceSize(page, 'connect', value);
      await assertEnhancedTargets(page, ['#cl-links-connect > summary', '#accessibility-open-connect', '#connect-overflow-btn'], `${value} short-landscape login header`);
      await page.locator('#accessibility-open-connect').click();
      await page.locator('#accessibility-modal[aria-hidden="false"]').waitFor();
      await page.keyboard.press('Escape');

      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
      await page.locator('#s-lobby.active').waitFor();
      await assertEnhancedTargets(page, ['#live-leave-anchor', '#accessibility-open-lobby', '#l-overflow-btn'], `${value} short-landscape lobby header`);
      await page.locator('#accessibility-open-lobby').click();
      await page.locator('#accessibility-modal[aria-hidden="false"]').waitFor();
      await page.keyboard.press('Escape');
    }
  });
  await check('visible login branding and lobby headings follow the exact Interface size multiplier', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const loginSelectors = ['.card-chip', '.card-suits-row', '.card-subtitle', '.login-card .lc-go'];
    const loginSamples = {};
    const backSamples = {};
    for (const [value, multiplier] of [['standard', 1], ['large', 1.5], ['extra-large', 2]]) {
      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
      await page.locator('#s-connect.active').waitFor();
      await chooseInterfaceSize(page, 'connect', value);
      loginSamples[value] = await visibleMetrics(page, loginSelectors);
      for (const selector of loginSelectors) {
        assert.equal(loginSamples[value][selector].visible, true, `${value} ${selector} is outside the viewport`);
        if (selector === '.card-chip') {
          assertExactScaled(loginSamples[value][selector].width, loginSamples.standard[selector].width, multiplier, `${value} login branding width`);
          assertExactScaled(loginSamples[value][selector].height, loginSamples.standard[selector].height, multiplier, `${value} login branding height`);
        } else {
          assertExactScaled(loginSamples[value][selector].fontSize, loginSamples.standard[selector].fontSize, multiplier, `${value} ${selector}`);
          if (selector !== '.login-card .lc-go') await assertTextFits(page, selector, `${value} ${selector}`);
        }
      }
      await page.locator('.login-card').first().click();
      backSamples[value] = await visibleMetrics(page, ['.login-back .lb-chev']);
      assert.equal(backSamples[value]['.login-back .lb-chev'].visible, true, `${value} login chevron is outside the viewport`);
      assertExactScaled(backSamples[value]['.login-back .lb-chev'].fontSize, backSamples.standard['.login-back .lb-chev'].fontSize, multiplier, `${value} login chevron`);
      await page.locator('#nick').fill(`Scale ${value}`);
      await page.locator('.login-back').click();
      assert.ok(await page.locator('#s-connect').evaluate((screen) => screen.scrollWidth <= screen.clientWidth + 1), `${value} login branding overflows horizontally`);
    }

    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    const headingSelectors = [
      '#s-lobby .games-col > .g-chat-panel-header > span:first-child',
      '#lobby-chat-panel > .g-chat-panel-header > span:first-child',
      '#lobby-gameinfo > .g-chat-panel-header > span:first-child',
    ];
    const headingSamples = {};
    for (const [value, multiplier] of [['standard', 1], ['large', 1.5], ['extra-large', 2]]) {
      await chooseInterfaceSize(page, 'lobby', value);
      headingSamples[value] = await visibleMetrics(page, headingSelectors);
      for (const selector of headingSelectors) {
        assert.equal(headingSamples[value][selector].visible, true, `${value} ${selector} is outside the viewport`);
        assertExactScaled(headingSamples[value][selector].fontSize, headingSamples.standard[selector].fontSize, multiplier, `${value} ${selector}`);
        await assertTextFits(page, selector, `${value} ${selector}`);
      }
      await page.locator('#g-filter-select').selectOption('1');
      await page.locator('#chat-in').fill(`Scale ${value}`);
      assert.ok(await page.locator('#s-lobby').evaluate((screen) => screen.scrollWidth <= screen.clientWidth + 1), `${value} lobby headings overflow horizontally`);
    }
  });
  await check('populated mobile lobby keeps Players, Join, and Spectate actions enhanced and operable', async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    await populateLobby(page);
    for (const value of ['large', 'extra-large']) {
      await chooseInterfaceSize(page, 'lobby', value);
      await assertEnhancedTargets(page, ['.fbar-players', '.game-row .btn-join:not(.btn-spectate)', '.game-row .btn-spectate'], `${value} populated mobile lobby`);
      await page.locator('.fbar-players').click();
      assert.equal(await page.locator('#players-panel').isVisible(), true, `${value} Players control did not open the player list`);
      await page.locator('#players-panel .g-chat-panel-header button').click();
      await page.locator('.game-row .btn-join:not(.btn-spectate)').click();
      await page.locator('.game-row .btn-spectate').click();
      assert.deepEqual(await takeLobbyJoinOutcomes(page), ['join:101', 'spectate:202']);
    }
  });
  await check('populated lobby names and player counts follow exact Interface sizes without clipping', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    await populateLobby(page);
    const desktopSelectors = ['.game-row.gcard .game-name', '.game-row.gcard .game-meta > span:first-child', '#players-panel-count', '#g-count'];
    const desktopSamples = {};
    for (const [value, multiplier] of [['standard', 1], ['large', 1.5], ['extra-large', 2]]) {
      await chooseInterfaceSize(page, 'lobby', value);
      desktopSamples[value] = await visibleMetrics(page, desktopSelectors);
      for (const selector of desktopSelectors) {
        assert.equal(desktopSamples[value][selector].visible, true, `${value} populated desktop ${selector} is outside the viewport`);
        assertExactScaled(desktopSamples[value][selector].fontSize, desktopSamples.standard[selector].fontSize, multiplier, `${value} populated desktop ${selector}`);
      }
      await assertTextFits(page, '.game-row.gcard .game-name', `${value} populated desktop table name`);
      await assertTextFits(page, '#players-panel-title', `${value} populated desktop online-player count`);
      assert.ok(await page.locator('#s-lobby').evaluate((screen) => screen.scrollWidth <= screen.clientWidth + 1), `${value} populated desktop lobby overflows horizontally`);
    }

    await page.setViewportSize({ width: 375, height: 812 });
    await populateLobby(page);
    const mobileSelectors = ['.game-row.gcard .game-name', '.game-row.gcard .game-meta > span:first-child', '#g-count'];
    const mobileSamples = {};
    const playerCountSamples = {};
    for (const [value, multiplier] of [['standard', 1], ['large', 1.5], ['extra-large', 2]]) {
      await chooseInterfaceSize(page, 'lobby', value);
      mobileSamples[value] = await visibleMetrics(page, mobileSelectors);
      for (const selector of mobileSelectors) {
        assert.equal(mobileSamples[value][selector].visible, true, `${value} populated mobile ${selector} is outside the viewport`);
        assertExactScaled(mobileSamples[value][selector].fontSize, mobileSamples.standard[selector].fontSize, multiplier, `${value} populated mobile ${selector}`);
      }
      await assertTextFits(page, '.game-row.gcard .game-name', `${value} populated mobile table name`);
      await page.locator('.fbar-players').click();
      await page.waitForFunction(() => {
        const element = document.querySelector('#players-panel-count');
        const rect = element && element.getBoundingClientRect();
        return rect && rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
      });
      playerCountSamples[value] = await visibleMetrics(page, ['#players-panel-count']);
      assert.equal(playerCountSamples[value]['#players-panel-count'].visible, true, `${value} populated mobile online-player count is outside the viewport`);
      assertExactScaled(playerCountSamples[value]['#players-panel-count'].fontSize, playerCountSamples.standard['#players-panel-count'].fontSize, multiplier, `${value} populated mobile online-player count`);
      await page.locator('#players-panel .g-chat-panel-header button').click();
      assert.ok(await page.locator('#s-lobby').evaluate((screen) => screen.scrollWidth <= screen.clientWidth + 1), `${value} populated mobile lobby overflows horizontally`);
    }
  });
  await check('keyboard focus remains visible throughout login and lobby controls', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
    await page.locator('#s-connect.active').waitFor();
    await chooseInterfaceSize(page, 'connect', 'standard');
    await assertKeyboardFocusVisible(page, ['#accessibility-open-connect', '.login-card'], 'login');
    await page.locator('.login-card').first().click();
    await assertKeyboardFocusVisible(page, ['.login-back', '#nick', '.btn-primary[data-i18n="connect"]'], 'login form');

    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    await assertKeyboardFocusVisible(page, ['#accessibility-open-lobby', '#g-filter-select', '#chat-in', '.lobby-footbar .lfb-create'], 'lobby');
    await page.locator('.lobby-footbar .lfb-create').click();
    await page.locator('#s-create.active #create-form').waitFor();
    await assertKeyboardFocusVisible(page, ['#s-create .cp-back', '#cf-name', '.cf-create-btn'], 'Create Table');
  });
  await check('Standard remains operable in a 200% browser-zoom layout with chat visible', async () => {
    await page.setViewportSize({ width: 640, height: 450 });
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    await chooseInterfaceSize(page, 'lobby', 'standard');
    const chat = page.locator('#lobby-chat-panel');
    const create = page.locator('.lobby-footbar .lfb-create');
    assert.equal(await chat.isVisible(), true, 'lobby chat must remain visible before opening Create Table');
    assert.equal(await create.isVisible(), true, 'Create Table must remain reachable at 200% browser zoom');
    const pointerOutcome = await create.evaluate((button) => {
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        receivesPointer: hit === button || button.contains(hit),
        hit: hit ? `${hit.tagName.toLowerCase()}#${hit.id}.${hit.className}` : 'none',
        buttonRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        hitRect: hit ? (() => { const value = hit.getBoundingClientRect(); return { left: value.left, top: value.top, width: value.width, height: value.height }; })() : null,
      };
    });
    assert.equal(pointerOutcome.receivesPointer, true, `another lobby surface intercepts Create Table: ${JSON.stringify(pointerOutcome)}`);
    await create.click();
    await page.locator('#s-create.active #create-form').waitFor();
    await page.locator('#cf-name').fill('Zoom Outcome');
    assert.equal(await page.locator('#cf-name').inputValue(), 'Zoom Outcome');
  });
  await check('desktop active-hand critical information follows every Interface size live', async () => {
    await startActiveHand(page, 2);
    const initialCards = await visibleCardOutcomes(page);
    assert.ok(initialCards.length && initialCards.every((card) => card.imageFace && !card.rankVisible && !card.suitVisible),
      'Standard did not begin the active hand with the selected image-card presentation');
    const fontSelectors = [
      '#g-pot', '#g-bets', '#g-potbar', '.blinds-next',
      '.seat.active .seat-name', '.seat.active .seat-money',
      '#g-actions .btn-fold', '#g-actions .act-buttons-row .btn-action:nth-child(2)', '#g-actions .raise-btn',
    ];
    const cardSelector = '#g-comm .pk';
    const cardInfoSelectors = ['#g-comm .pk .c-rank', '#g-comm .pk .c-suit'];
    const timerSelector = '.seat.active .seat-timeout-bar';
    const samples = {};
    const sentBefore = await page.evaluate(() => window.WebSocket.instance.sent.length);
    for (const [value, multiplier] of [['standard', 1], ['large', 1.5], ['extra-large', 2]]) {
      if (value !== 'standard') await chooseInterfaceSize(page, 'game', value);
      await page.locator('#g-actions .btn-fold').waitFor();
      for (const selector of [...fontSelectors, cardSelector, ...cardInfoSelectors, timerSelector]) assert.ok(await page.locator(selector).count(), `active-hand fixture did not render ${selector}`);
      samples[value] = await visibleMetrics(page, [...fontSelectors, cardSelector, ...cardInfoSelectors, timerSelector]);
      for (const selector of fontSelectors) {
        assert.equal(samples[value][selector].visible, true, `${value} active hand ${selector} is outside the viewport: ${JSON.stringify(samples[value][selector])}`);
        assertExactScaled(samples[value][selector].fontSize, samples.standard[selector].fontSize, multiplier, `${value} active hand ${selector}`);
      }
      assert.equal(samples[value][cardSelector].visible, true, `${value} active-hand card face is outside the viewport`);
      if (value !== 'standard') {
        for (const selector of cardInfoSelectors) {
          assert.equal(samples[value][selector].visible, true, `${value} active-hand ${selector} is not visible`);
          assertExactScaled(samples[value][selector].fontSize, samples.standard[selector].fontSize, multiplier, `${value} active-hand ${selector}`);
        }
      }
      assert.equal(samples[value][timerSelector].visible, true, `${value} active-hand turn timer is outside the viewport`);
      assertExactScaled(samples[value][timerSelector].cssHeight, samples.standard[timerSelector].cssHeight, multiplier, `${value} active-hand turn-timer height`);
      assert.equal(await page.evaluate(() => window.WebSocket.instance.readyState), 1, `${value} disconnected the active socket`);
      const outbound = await outboundSizeChangeTraffic(page, sentBefore);
      assert.deepEqual(outbound, [], `${value} sent network traffic while changing Interface size`);
      assert.equal(await page.locator('#g-gameid').textContent(), '303', `${value} lost the game identity`);
      assert.equal(await page.locator('#g-handn').textContent(), '1', `${value} lost the hand identity`);
      assert.equal(await page.locator('#g-actions .btn-fold').isEnabled(), true, `${value} lost an operable principal action`);
      for (const [selector, label] of [['.gsb-left', 'pot and bet status'], ['.gsb-right', 'game and hand status'], ['.blinds-next', 'blind status']]) {
        await assertTextFits(page, selector, `${value} active-hand ${label}`);
      }
    }
    const extraLargeCue = await turnCueOutcome(page);
    await chooseInterfaceSize(page, 'game', 'standard');
    const restoredCards = await visibleCardOutcomes(page);
    assert.ok(restoredCards.length && restoredCards.every((card) => card.imageFace && !card.rankVisible && !card.suitVisible),
      'Standard did not restore the image-card presentation during the active hand');
    assert.deepEqual(await outboundSizeChangeTraffic(page, sentBefore), [], 'restoring Standard sent network traffic');
    assert.equal(extraLargeCue.visible, true, 'Extra Large lost the visible current-turn indication');
    assert.ok(extraLargeCue.distinctFromInactive, 'the current-turn cue is not visually distinct from inactive seats');
  });
  await check('desktop two-seat and ten-seat hands keep critical play reachable and operable', async () => {
    const actionSelectors = ['#g-actions .btn-fold', '#g-actions .act-buttons-row .btn-action:nth-child(2)', '#g-actions .raise-btn'];
    for (const seatCount of [2, 10]) {
      await startActiveHand(page, seatCount);
      const standardCenters = await seatCenters(page);
      const standardCue = await turnCueOutcome(page);
      assert.equal(standardCue.visible, true, `${seatCount}-seat Standard current-turn indication is not visible`);
      assert.equal(standardCue.distinctFromInactive, true, `${seatCount}-seat Standard current-turn cue is ambiguous`);
      let previousCue = standardCue;
      for (const value of ['standard', 'large', 'extra-large']) {
        await chooseInterfaceSize(page, 'game', value);
        if (value !== 'standard') {
          await page.waitForFunction((before) => {
            const now = [...document.querySelectorAll('#g-seats .seat:not(.me)')].map((seat) => {
              const rect = seat.getBoundingClientRect();
              return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            });
            return now.some((point, index) => before[index] && (Math.abs(point.x - before[index].x) > 2 || Math.abs(point.y - before[index].y) > 2));
          }, standardCenters);
        }
        const geometry = await activeHandRects(page);
        for (const [index, rect] of geometry.seats.entries()) assertReachable(rect, geometry.viewport, `${seatCount}-seat ${value} seat ${index + 1}`);
        for (const [index, rect] of geometry.seatValues.entries()) assertReachable(rect, geometry.viewport, `${seatCount}-seat ${value} player value ${index + 1}`);
        for (let left = 0; left < geometry.seats.length; left += 1) {
          for (let right = left + 1; right < geometry.seats.length; right += 1) {
            assert.equal(overlaps(geometry.seats[left], geometry.seats[right]), false,
              `${seatCount}-seat ${value} seats ${left + 1} and ${right + 1} overlap`);
            assert.equal(overlaps(geometry.seatValues[left], geometry.seatValues[right]), false,
              `${seatCount}-seat ${value} player values ${left + 1} ${JSON.stringify(geometry.seatValues[left])} and ${right + 1} ${JSON.stringify(geometry.seatValues[right])} overlap`);
          }
        }
        for (const [label, rect] of Object.entries({ cards: geometry.cards, pot: geometry.pot, actions: geometry.actions, status: geometry.status })) {
          assertReachable(rect, geometry.viewport, `${seatCount}-seat ${value} ${label}`);
        }
        assert.equal(overlaps(geometry.cards, geometry.actions), false, `${seatCount}-seat ${value} cards overlap actions`);
        for (const [cardIndex, card] of geometry.cardFaces.entries()) {
          assert.equal(overlaps(card, geometry.pot), false, `${seatCount}-seat ${value} card ${cardIndex + 1} overlaps the pot`);
          assert.equal(overlaps(card, geometry.actions), false, `${seatCount}-seat ${value} card ${cardIndex + 1} overlaps actions`);
          for (const [playerIndex, player] of geometry.seatValues.entries()) {
            assert.equal(overlaps(card, player), false, `${seatCount}-seat ${value} card ${cardIndex + 1} overlaps player value ${playerIndex + 1}`);
          }
        }
        assert.equal(overlaps(geometry.pot, geometry.actions), false, `${seatCount}-seat ${value} pot overlaps actions`);
        for (const [index, rect] of geometry.seatValues.entries()) {
          assert.equal(overlaps(rect, geometry.cards), false, `${seatCount}-seat ${value} player value ${index + 1} ${JSON.stringify(rect)} overlaps cards ${JSON.stringify(geometry.cards)}; all values ${JSON.stringify(geometry.seatValues)}`);
          assert.equal(overlaps(rect, geometry.actions), false, `${seatCount}-seat ${value} player value ${index + 1} ${JSON.stringify(rect)} overlaps actions ${JSON.stringify(geometry.actions)}`);
        }
        if (value !== 'standard') {
          const cards = await visibleCardOutcomes(page);
          assert.ok(cards.length > 0, `${seatCount}-seat ${value} rendered no visible face cards`);
          for (const [index, card] of cards.entries()) {
            assert.equal(card.rankVisible && card.suitVisible, true, `${seatCount}-seat ${value} card ${index + 1} hid its accessible rank or suit`);
            for (const [label, glyph] of [['rank', card.rank], ['suit', card.suit]]) {
              assert.ok(glyph.left >= card.card.left - 1 && glyph.top >= card.card.top - 1 && glyph.right <= card.card.right + 1 && glyph.bottom <= card.card.bottom + 1,
                `${seatCount}-seat ${value} card ${index + 1} ${label} escapes its card: ${JSON.stringify({ card: card.card, glyph })}`);
            }
            assert.equal(overlaps(card.rank, card.suit), false, `${seatCount}-seat ${value} card ${index + 1} rank and suit overlap`);
          }
          const cue = await turnCueOutcome(page);
          assert.equal(cue.visible, true, `${seatCount}-seat ${value} current-turn indication is not visible`);
          assert.equal(cue.distinctFromInactive, true, `${seatCount}-seat ${value} current-turn cue is ambiguous`);
          assert.ok(cue.prominence > previousCue.prominence, `${seatCount}-seat ${value} current-turn cue did not grow`);
          previousCue = cue;
          await assertEnhancedTargets(page, actionSelectors, `${seatCount}-seat ${value} action`);
          await assertKeyboardFocusVisible(page, actionSelectors, `${seatCount}-seat ${value} action`);
        }
      }
      const sentBefore = await page.evaluate(() => window.WebSocket.instance.sent.length);
      await page.locator('#g-actions .btn-fold').click();
      await page.waitForFunction((before) => window.WebSocket.instance.sent.length > before, sentBefore);
      const sentAction = await page.evaluate(async (before) => {
        const { MSG } = await import('/modules/net/messages.mjs');
        return window.WebSocket.instance.sent.slice(before)
          .filter((frame) => frame instanceof ArrayBuffer)
          .some((frame) => MSG.parse(new Uint8Array(frame).slice(4)).type === MSG.T.MyActionRequest);
      }, sentBefore);
      assert.equal(sentAction, true, `${seatCount}-seat Fold did not cross the production message boundary`);
    }
  });
  await check('Extra Large mobile portrait keeps a dense active hand readable and operable', async () => {
    await startActiveHand(page, 10);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    const fontSelectors = [
      '#g-pot', '#g-bets', '#g-potbar', '.blinds-next',
      '#g-comm .pk .c-rank', '#g-comm .pk .c-suit',
      '#g-actions .btn-fold', '#g-actions .act-buttons-row .btn-action:nth-child(2)', '#g-actions .raise-btn',
    ];
    const timerSelector = '.seat.active .seat-timeout-bar';
    const standard = await visibleMetrics(page, [...fontSelectors, timerSelector]);
    const standardCue = await turnCueOutcome(page);

    await chooseInterfaceSize(page, 'game', 'extra-large');
    await page.locator('#g-actions .btn-fold').waitFor();
    await page.waitForTimeout(300);
    const extraLarge = await visibleMetrics(page, [...fontSelectors, timerSelector]);
    const geometry = await activeHandRects(page);

    for (const selector of fontSelectors) {
      assert.equal(extraLarge[selector].visible, true, `mobile portrait Extra Large ${selector} is outside the viewport`);
      assertExactScaled(extraLarge[selector].fontSize, standard[selector].fontSize, 2, `mobile portrait Extra Large ${selector}`);
    }
    assert.equal(extraLarge[timerSelector].visible, true, 'mobile portrait Extra Large turn timer is outside the viewport');
    assertExactScaled(extraLarge[timerSelector].cssHeight, standard[timerSelector].cssHeight, 2, 'mobile portrait Extra Large turn-timer height');
    for (const [label, rect] of Object.entries({ cards: geometry.cards, pot: geometry.pot, actions: geometry.actions, status: geometry.status })) {
      assertReachable(rect, geometry.viewport, `mobile portrait Extra Large ${label}`);
    }
    for (const [index, rect] of geometry.statusContent.entries()) {
      assert.ok(rect.left >= geometry.status.left - 1 && rect.top >= geometry.status.top - 1
          && rect.right <= geometry.status.right + 1 && rect.bottom <= geometry.status.bottom + 1,
      `mobile portrait Extra Large status value ${index + 1} escapes the status bar`);
      assert.equal(overlaps(rect, geometry.drawerBar), false, `mobile portrait Extra Large status value ${index + 1} overlaps the drawer bar`);
    }
    assert.equal(overlaps(geometry.cards, geometry.actions), false, 'mobile portrait Extra Large cards overlap actions');
    assert.equal(overlaps(geometry.pot, geometry.cards), false, 'mobile portrait Extra Large pot overlaps cards');
    assert.equal(overlaps(geometry.pot, geometry.actions), false, 'mobile portrait Extra Large pot overlaps actions');
    for (const [cardIndex, card] of geometry.communityCardFaces.entries()) {
      for (const [seatIndex, seat] of geometry.seats.entries()) {
        assert.equal(overlaps(card, seat), false, `mobile portrait Extra Large card ${cardIndex + 1} overlaps seat ${seatIndex + 1}`);
      }
    }
    for (const [seatIndex, seat] of geometry.seats.entries()) {
      assert.equal(overlaps(geometry.actions, seat), false, `mobile portrait Extra Large actions overlap seat ${seatIndex + 1}`);
    }
    const extraLargeCue = await turnCueOutcome(page);
    assert.equal(extraLargeCue.visible, true, 'mobile portrait Extra Large current-turn indication is not visible');
    assert.equal(extraLargeCue.distinctFromInactive, true, 'mobile portrait Extra Large current-turn cue is ambiguous');
    assert.ok(extraLargeCue.prominence > standardCue.prominence, 'mobile portrait Extra Large current-turn cue did not grow');
    await assertEnhancedTargets(page, ['#accessibility-open-game', '#g-actions .btn-fold', '#g-actions .act-buttons-row .btn-action:nth-child(2)', '#g-actions .raise-btn'], 'mobile portrait Extra Large');
    await assertKeyboardFocusVisible(page, ['#accessibility-open-game', '#g-actions .btn-fold', '#g-actions .act-buttons-row .btn-action:nth-child(2)', '#g-actions .raise-btn'], 'mobile portrait Extra Large');

    const sentBefore = await page.evaluate(() => window.WebSocket.instance.sent.length);
    await page.locator('#g-actions .btn-fold').click();
    await page.waitForFunction((before) => window.WebSocket.instance.sent.length > before, sentBefore);
    const sentAction = await page.evaluate(async (before) => {
      const { MSG } = await import('/modules/net/messages.mjs');
      return window.WebSocket.instance.sent.slice(before)
        .filter((frame) => frame instanceof ArrayBuffer)
        .some((frame) => MSG.parse(new Uint8Array(frame).slice(4)).type === MSG.T.MyActionRequest);
    }, sentBefore);
    assert.equal(sentAction, true, 'mobile portrait Extra Large Fold did not cross the production message boundary');
  });
  await check('Extra Large mobile portrait secondary drawers preserve content and focus', async () => {
    await startActiveHand(page, 10);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await chooseInterfaceSize(page, 'game', 'extra-large');

    const chatButton = page.locator('#adaptive-chat-toggle');
    await assertEnhancedTargets(page, ['#adaptive-chat-toggle', '#adaptive-info-toggle', '#adaptive-hands-toggle', '#adaptive-reactions-toggle'], 'mobile portrait Extra Large drawer');
    await chatButton.click();
    const chatDrawer = page.locator('#g-chat-panel');
    await chatDrawer.waitFor({ state: 'visible' });
    const chatRect = await chatDrawer.boundingBox();
    assertReachable(chatRect && { left: chatRect.x, top: chatRect.y, right: chatRect.x + chatRect.width, bottom: chatRect.y + chatRect.height, width: chatRect.width, height: chatRect.height }, { width: 390, height: 844 }, 'mobile portrait Extra Large chat drawer');
    assert.equal(await chatDrawer.getAttribute('role'), 'dialog');
    assert.equal(await chatDrawer.getAttribute('aria-modal'), 'false');
    assert.equal(await chatButton.getAttribute('aria-expanded'), 'true');
    await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'g-chat-in');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'g-chat-in');
    await page.locator('#g-chat-in').fill('Preserved portrait draft');
    await page.keyboard.press('Escape');
    await chatDrawer.waitFor({ state: 'hidden' });
    await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'adaptive-chat-toggle');
    assert.equal(await chatButton.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'adaptive-chat-toggle');
    await chatButton.click();
    assert.equal(await page.locator('#g-chat-in').inputValue(), 'Preserved portrait draft');
    await assertEnhancedTargets(page, ['#g-chat-in', '#g-chat-emoji-toggle', '#g-chat-panel .chat-send', '#g-chat-close'], 'mobile portrait Extra Large chat drawer');
    await page.locator('#g-chat-close').click();
    await chatDrawer.waitFor({ state: 'hidden' });

    const logButton = page.locator('#adaptive-info-toggle');
    await logButton.click();
    const infoDrawer = page.locator('#g-log-panel');
    await infoDrawer.waitFor({ state: 'visible' });
    const infoRect = await infoDrawer.boundingBox();
    assertReachable(infoRect && { left: infoRect.x, top: infoRect.y, right: infoRect.x + infoRect.width, bottom: infoRect.y + infoRect.height, width: infoRect.width, height: infoRect.height }, { width: 390, height: 844 }, 'mobile portrait Extra Large information drawer');
    assert.equal(await infoDrawer.getAttribute('role'), 'dialog');
    assert.equal(await infoDrawer.getAttribute('aria-modal'), 'false');
    assert.equal(await logButton.getAttribute('aria-expanded'), 'true');
    await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'gip-tab-log');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'gip-tab-log');
    assert.ok((await page.locator('#g-log-body').textContent()).trim().length > 0, 'history drawer lost the active hand log');
    await assertEnhancedTargets(page, ['#gip-tab-log', '#gip-tab-odds', '#gip-tab-stats', '#g-log-close'], 'mobile portrait Extra Large information drawer');
    await page.locator('#gip-tab-stats').click();
    assert.equal(await page.locator('#g-stats-body').isVisible(), true, 'statistics are unavailable from the secondary drawer');
    await page.keyboard.press('Escape');
    await infoDrawer.waitFor({ state: 'hidden' });
    await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'adaptive-info-toggle');
    assert.equal(await logButton.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'adaptive-info-toggle');
    await logButton.click();
    assert.equal(await page.locator('#g-stats-body').isVisible(), true, 'secondary drawer did not preserve its selected statistics tab');
    await page.locator('#g-log-close').click();
    await infoDrawer.waitFor({ state: 'hidden' });

    await page.locator('#adaptive-hands-toggle').click();
    await page.locator('#hands-overlay').waitFor({ state: 'visible' });
    await assertEnhancedTargets(page, ['#hands-card-inner .g-chat-panel-header button'], 'mobile portrait Extra Large hands help');
    await page.locator('#hands-card-inner .g-chat-panel-header button').click();
    await page.locator('#hands-overlay').waitFor({ state: 'hidden' });
    await page.locator('#adaptive-reactions-toggle').click();
    await page.locator('#g-reaction-panel').waitFor({ state: 'visible' });
    await assertEnhancedTargets(page, ['#g-reaction-panel .react-panel-close'], 'mobile portrait Extra Large reactions');
    await page.locator('#g-reaction-panel .react-panel-close').click();
    await page.locator('#g-reaction-panel').waitFor({ state: 'hidden' });
    assert.ok(await page.locator('.adaptive-drawer-bar').evaluate((bar) => bar.scrollWidth <= bar.clientWidth + 1), 'mobile portrait Extra Large drawer controls overflow horizontally');
  });
  console.log(`PASS ${passed}/${passed}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
