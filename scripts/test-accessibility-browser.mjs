#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { checkCanonicalScreenshot } from './accessibility-screenshot-policy.mjs';

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
const browserTarget = process.env.PTH_BROWSER || 'chromium';
const browserTargets = {
  chromium: [chromium, {}],
  chrome: [chromium, { channel: 'chrome' }],
  msedge: [chromium, { channel: 'msedge' }],
  firefox: [firefox, {}],
  webkit: [webkit, {}],
};
if (!browserTargets[browserTarget]) throw new Error(`unsupported PTH_BROWSER: ${browserTarget}`);
const [browserType, browserOptions] = browserTargets[browserTarget];
const browser = await browserType.launch({ headless: true, ...browserOptions });
const context = await browser.newContext({ acceptDownloads: true, serviceWorkers: 'block' });
const page = await context.newPage();
page.on('dialog', (dialog) => dialog.dismiss());

let passed = 0;
async function check(name, action) {
  await action();
  console.log('ok  -', name);
  passed++;
}

async function waitForAppSessionReady(page) {
  await page.waitForLoadState('load');
  await page.waitForFunction(() => document.readyState === 'complete'
    && window.App && typeof window.App.connect === 'function'
    && window.PthState && typeof window.applyAccessibilityPreferences === 'function'
    && document.querySelector('#s-connect .btn-primary'));
  const readiness = await page.evaluate(async () => {
    const session = await import('/modules/net/session.mjs');
    return {
      document: document.readyState,
      appConnect: typeof window.App.connect,
      sessionShow: typeof session.show,
      state: !!window.PthState,
      connectScreen: !!document.querySelector('#s-connect .btn-primary'),
    };
  });
  assert.deepEqual(readiness, {
    document: 'complete', appConnect: 'function', sessionShow: 'function', state: true, connectScreen: true,
  }, 'application/session boundary was not ready after navigation');
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
      static connections = 0;
      constructor(url) {
        super();
        this.url = url;
        this.readyState = FixtureSocket.OPEN;
        this.sent = [];
        FixtureSocket.connections += 1;
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

function channel(value) {
  value /= 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function colorChannels(value) {
  const match = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  assert.ok(match, `expected a computed RGB color, got ${value}`);
  return match.slice(1, 4).map(Number);
}

function contrastRatio(first, second) {
  const luminances = [first, second].map((value) => {
    const [red, green, blue] = colorChannels(value).map(channel);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  }).sort((a, b) => b - a);
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

async function presentationColors(page, foregroundSelector, backgroundSelector = foregroundSelector) {
  return page.evaluate(({ foregroundSelector, backgroundSelector }) => {
    const foreground = getComputedStyle(document.querySelector(foregroundSelector));
    const background = getComputedStyle(document.querySelector(backgroundSelector));
    return { foreground: foreground.color, background: background.backgroundColor, border: background.borderColor };
  }, { foregroundSelector, backgroundSelector });
}

async function setHighContrast(page, surface, enabled) {
  await page.locator(`#accessibility-open-${surface}`).click();
  const toggle = page.locator('#accessibility-high-contrast');
  if (enabled) await toggle.check();
  else await toggle.uncheck();
  await page.keyboard.press('Escape');
}

async function openPlayerSettings(page) {
  await page.locator('#g-overflow-btn').click();
  await page.locator('#adv-opts-mob').click();
  await page.locator('#adv-modal').waitFor();
}

async function choosePlayerCosmetics(page) {
  await openPlayerSettings(page);
  await page.locator('#adv-darkmode').selectOption({ label: 'Light' });
  await page.getByRole('tab', { name: 'Style', exact: true }).click();
  const style = page.locator('#adv-theme-host');
  await style.getByRole('button', { name: 'Table', exact: true }).click();
  await style.getByText('Saloon QML table style', { exact: true }).click();
  await style.getByRole('button', { name: 'Cards', exact: true }).click();
  await style.getByText('PokerTH', { exact: true }).click();
}

async function selectedPlayerCosmetics(page) {
  const ui = (await page.locator('#adv-darkmode option:checked').textContent()).trim();
  const style = page.locator('#adv-theme-host');
  const selected = async (tab) => {
    await style.getByRole('button', { name: tab, exact: true }).click();
    const marker = style.getByText('Selected', { exact: false });
    return (await marker.locator('..').innerText()).split('\n')[0].trim();
  };
  return { ui, felt: await selected('Table'), deck: await selected('Cards') };
}

async function closePlayerSettings(page) {
  await page.locator('#adv-modal').getByRole('button', { name: 'Close' }).click();
}

async function takeStableScreenshot(page, path) {
  await checkCanonicalScreenshot({
    browserTarget,
    canonicalPath: path,
    updateCanonical: process.env.PTH_UPDATE_ACCESSIBILITY_SCREENSHOTS === '1',
    capture: async () => {
      await page.evaluate(() => document.fonts.ready);
      if (await page.locator('#s-game.active').count()) await waitForStableTableLayout(page);
      const stable = await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}.seat-timeout-bar{visibility:hidden!important}' });
      try {
        return await page.screenshot({ animations: 'disabled', caret: 'hide' });
      } finally {
        await stable.evaluate((element) => element.remove());
      }
    },
  });
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

async function startActiveHand(page, seatCount, options = {}) {
  const { interfaceSize = 'standard', viewport = { width: 1440, height: 900 } } = options;
  await page.setViewportSize(viewport);
  await page.evaluate((size) => {
    localStorage.removeItem('pth_resume');
    localStorage.setItem('pth_interface_size', size);
  }, interfaceSize);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForAppSessionReady(page);
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
      blinds: rect(document.querySelector('.blinds-next')),
      actions: rect(document.querySelector('#g-actions .action-grid')),
      activeSeat: rect(document.querySelector('.seat.active .seat-plate')),
      activeTimer: rect(document.querySelector('.seat.active .seat-timeout-bar')),
      status: rect(document.querySelector('#pot-strip')),
      statusContent: [...document.querySelectorAll('#pot-strip .gsb-lbl, #pot-strip .gsb-total, #pot-strip .gsb-bets, #pot-strip .gsb-phase, #pot-strip .gsb-val, #pot-strip .blinds-next')]
        .filter((element) => { const value = element.getBoundingClientRect(); return value.width > 0 && value.height > 0; }).map(rect),
      drawerBar: rect(document.querySelector('.adaptive-drawer-bar')),
    };
  });
}

async function waitForStableTableLayout(page) {
  await page.evaluate(() => new Promise((resolve, reject) => {
    const started = performance.now();
    let prior = '';
    let stableSince = started;
    const sample = (now) => {
      const selectors = ['#g-table-zone', '#g-table-scaler', '#g-comm', '#g-comm .pk', '#g-seats .seat'];
      const values = selectors.flatMap((selector) => [...document.querySelectorAll(selector)]).flatMap((element) => {
        const rect = element.getBoundingClientRect();
        return [rect.left, rect.top, rect.width, rect.height].map((value) => Math.round(value * 20) / 20);
      });
      values.push(getComputedStyle(document.documentElement).getPropertyValue('--comm-scale').trim());
      const current = JSON.stringify(values);
      if (current !== prior) stableSince = now;
      prior = current;
      if (now - stableSince >= 180) resolve();
      else if (now - started >= 2000) reject(new Error('table layout did not stabilize within 2 seconds'));
      else requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
}

async function exerciseLoupeRestoration(page, label) {
  await waitForStableTableLayout(page);
  assert.equal(await page.locator('html').getAttribute('data-interface-size'), 'extra-large', `${label} lost Extra Large`);
  assert.equal(await page.locator('html').getAttribute('data-adaptive-play'), 'constrained-extra-large', `${label} lost adaptive play`);
  const base = await activeHandRects(page);
  for (const [name, rect] of Object.entries({ cards: base.cards, pot: base.pot, blinds: base.blinds, currentTurn: base.activeSeat, timer: base.activeTimer, actions: base.actions, status: base.status })) {
    assertReachable(rect, base.viewport, `${label} ${name}`);
  }
  await page.locator('#g-zoom-toggle').click();
  await waitForStableTableLayout(page);
  const magnified = await activeHandRects(page);
  assert.equal(await page.locator('#g-zoom-toggle').getAttribute('aria-pressed'), 'true', `${label} loupe did not activate`);
  assert.ok(magnified.cards.width >= base.cards.width * 1.8, `${label} loupe did not visibly enlarge cards`);
  await page.locator('#g-zoom-toggle').click();
  await waitForStableTableLayout(page);
  const restored = await activeHandRects(page);
  assert.equal(await page.locator('#g-zoom-toggle').getAttribute('aria-pressed'), 'false', `${label} loupe did not deactivate`);
  assert.ok(Math.abs(restored.cards.width - base.cards.width) <= 1,
    `${label} loupe did not restore cards: ${base.cards.width} -> ${restored.cards.width}`);
  for (const [index, seat] of restored.seats.entries()) {
    assert.ok(Math.abs(seat.width - base.seats[index].width) <= 1 && Math.abs(seat.height - base.seats[index].height) <= 1,
      `${label} loupe did not restore seat ${index + 1}`);
  }
  return restored;
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

function assertCriticalUnoccluded(geometry, drawer, label) {
  for (const [name, rect] of Object.entries({
    cards: geometry.cards,
    pot: geometry.pot,
    blinds: geometry.blinds,
    currentTurn: geometry.activeSeat,
    timer: geometry.activeTimer,
    actions: geometry.actions,
  })) {
    assertReachable(rect, geometry.viewport, `${label} ${name}`);
    assert.equal(overlaps(rect, drawer), false,
      `${label} ${name} is occluded by the open drawer: ${JSON.stringify({ critical: rect, drawer })}`);
  }
}

async function assertActionOperable(page, label) {
  const before = await page.evaluate(() => window.WebSocket.instance.sent.length);
  await page.locator('#g-actions .btn-fold').click();
  await page.waitForFunction((start) => window.WebSocket.instance.sent.length > start, before);
  const sent = await page.evaluate(async (start) => {
    const { MSG } = await import('/modules/net/messages.mjs');
    return window.WebSocket.instance.sent.slice(start)
      .filter((frame) => frame instanceof ArrayBuffer)
      .some((frame) => MSG.parse(new Uint8Array(frame).slice(4)).type === MSG.T.MyActionRequest);
  }, before);
  assert.equal(sent, true, `${label} action did not cross the production message boundary`);
}

async function triggerPresentation(page, selector) {
  return page.locator(selector).evaluate((trigger) => {
    const style = getComputedStyle(trigger);
    return {
      expanded: trigger.getAttribute('aria-expanded'),
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      color: style.color,
    };
  });
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

async function assertVisibleInteractiveTargets(page, panelSelector, label) {
  const targets = await page.locator(panelSelector).locator('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])').evaluateAll((elements) =>
    elements.filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    }).map((element) => {
      const rect = element.getBoundingClientRect();
      return { name: element.id || element.className || element.tagName, width: rect.width, height: rect.height, top: rect.top };
    }));
  assert.ok(targets.length > 0, `${label} has no visible interactive controls`);
  for (const target of targets) {
    assert.ok(target.width >= 44 && target.height >= 44,
      `${label} ${target.name} is ${target.width}x${target.height}`);
  }
  return targets;
}

async function assertDenseActiveHand(page, options) {
  const { viewport, label, fontSelectors, enhancedTargets, requireSeatValues = false, includeBlinds = false, beforeAction } = options;
  const timerSelector = '.seat.active .seat-timeout-bar';
  await startActiveHand(page, 10);
  await page.setViewportSize(viewport);
  await page.waitForTimeout(300);
  const standard = await visibleMetrics(page, [...fontSelectors, timerSelector]);
  const standardCue = await turnCueOutcome(page);

  await chooseInterfaceSize(page, 'game', 'extra-large');
  await page.locator('#g-actions .btn-fold').waitFor();
  await page.waitForTimeout(300);
  const extraLarge = await visibleMetrics(page, [...fontSelectors, timerSelector]);
  const geometry = await activeHandRects(page);

  assert.equal(geometry.seats.length, 10, `${label} did not render all ten seat plates`);
  for (const [index, seat] of geometry.seats.entries()) {
    assertReachable(seat, geometry.viewport, `${label} seat ${index + 1}`);
    if (requireSeatValues) {
      const values = geometry.seatValues[index];
      assert.ok(values.left >= seat.left - 1 && values.top >= seat.top - 1 && values.right <= seat.right + 1 && values.bottom <= seat.bottom + 1,
        `${label} seat ${index + 1} values escape their plate`);
    }
    for (let other = index + 1; other < geometry.seats.length; other += 1) {
      assert.equal(overlaps(seat, geometry.seats[other]), false,
        `${label} seats ${index + 1} and ${other + 1} overlap: ${JSON.stringify({ seat, other: geometry.seats[other] })}`);
    }
  }
  for (const selector of fontSelectors) {
    assert.equal(extraLarge[selector].visible, true, `${label} ${selector} is outside the viewport`);
    assertExactScaled(extraLarge[selector].fontSize, standard[selector].fontSize, 2, `${label} ${selector}`);
  }
  assert.equal(extraLarge[timerSelector].visible, true, `${label} turn timer is outside the viewport`);
  assertExactScaled(extraLarge[timerSelector].cssHeight, standard[timerSelector].cssHeight, 2, `${label} turn-timer height`);
  const critical = { cards: geometry.cards, pot: geometry.pot, currentTurn: geometry.activeSeat, timer: geometry.activeTimer, actions: geometry.actions, status: geometry.status };
  if (includeBlinds) critical.blinds = geometry.blinds;
  for (const [name, rect] of Object.entries(critical)) assertReachable(rect, geometry.viewport, `${label} ${name}`);
  for (const [index, rect] of geometry.statusContent.entries()) {
    assert.ok(rect.left >= geometry.status.left - 1 && rect.top >= geometry.status.top - 1
        && rect.right <= geometry.status.right + 1 && rect.bottom <= geometry.status.bottom + 1,
    `${label} status value ${index + 1} escapes the status bar: ${JSON.stringify({ value: rect, status: geometry.status })}`);
    assert.equal(overlaps(rect, geometry.drawerBar), false, `${label} status value ${index + 1} overlaps the drawer bar`);
  }
  for (const [first, second] of [['cards', 'actions'], ['pot', 'cards'], ['pot', 'actions']]) {
    assert.equal(overlaps(geometry[first], geometry[second]), false,
      `${label} ${first} overlap ${second}: ${JSON.stringify({ [first]: geometry[first], [second]: geometry[second] })}`);
  }
  for (const [cardIndex, card] of geometry.communityCardFaces.entries()) {
    for (const [seatIndex, seat] of geometry.seats.entries()) {
      assert.equal(overlaps(card, seat), false,
        `${label} card ${cardIndex + 1} overlaps seat ${seatIndex + 1}: ${JSON.stringify({ card, seat })}`);
    }
  }
  for (const [seatIndex, seat] of geometry.seats.entries()) {
    assert.equal(overlaps(geometry.actions, seat), false,
      `${label} actions overlap seat ${seatIndex + 1}: ${JSON.stringify({ actions: geometry.actions, seat })}`);
  }
  const extraLargeCue = await turnCueOutcome(page);
  assert.equal(extraLargeCue.visible, true, `${label} current-turn indication is not visible`);
  assert.equal(extraLargeCue.distinctFromInactive, true, `${label} current-turn cue is ambiguous`);
  assert.ok(extraLargeCue.prominence > standardCue.prominence, `${label} current-turn cue did not grow`);
  await assertEnhancedTargets(page, enhancedTargets, label);
  await assertKeyboardFocusVisible(page, ['#accessibility-open-game', '#g-actions .btn-fold', '#g-actions .act-buttons-row .btn-action:nth-child(2)', '#g-actions .raise-btn'], label);
  if (beforeAction) await beforeAction();
  await assertActionOperable(page, label);
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

console.log(`test-accessibility-browser (${browserTarget} ${browser.version()})`);
try {
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded' });
  await waitForAppSessionReady(page);
  await page.waitForFunction(() => typeof window.exportWebBackup === 'function');

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
  await check('Accessibility closes over a populated login form before High contrast toggles live', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
    await page.locator('.login-card').first().click();
    await page.locator('#nick').fill('Preserved login draft');
    const loginStep = page.locator('#login-step2');
    const accessibilityEntry = page.locator('#accessibility-open-connect');
    assert.equal(await loginStep.isVisible(), true);
    assert.equal(await accessibilityEntry.isVisible(), true);
    await accessibilityEntry.click();
    await page.locator('input[name="interface-size"][value="large"]').check();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#accessibility-modal').getAttribute('aria-hidden'), 'true');
    assert.equal(await page.locator('#s-connect.active').isVisible(), true);
    assert.equal(await loginStep.isVisible(), true);
    assert.equal(await page.locator('#login-step1').isVisible(), false);
    assert.equal(await page.locator('#nick').inputValue(), 'Preserved login draft');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'accessibility-open-connect');
    await setHighContrast(page, 'connect', false);
    await setHighContrast(page, 'connect', true);
    assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'true');
    assert.equal(await page.locator('html').getAttribute('data-interface-size'), 'large');
    assert.equal(await page.locator('#nick').inputValue(), 'Preserved login draft');
    const title = await presentationColors(page, '#s-connect .login-lead', '#s-connect');
    assert.ok(contrastRatio(title.foreground, title.background) >= 7,
      `High-contrast login text is ${contrastRatio(title.foreground, title.background).toFixed(2)}:1`);
    await takeStableScreenshot(page, join(process.cwd(), 'docs/screenshots/24-high-contrast-desktop.png'));
    await page.locator('.login-back').click();
  });
  await check('High contrast toggles live in the populated lobby without reconnecting or losing player state', async () => {
    await populateLobby(page);
    await page.locator('#g-filter-select').selectOption('2');
    await page.locator('#chat-in').fill('Preserved lobby draft');
    const before = await page.evaluate(() => ({ connections: window.WebSocket.connections, sent: window.WebSocket.instance.sent.length }));
    await setHighContrast(page, 'lobby', false);
    await setHighContrast(page, 'lobby', true);
    assert.equal(await page.locator('#g-filter-select').inputValue(), '2');
    assert.equal(await page.locator('#chat-in').inputValue(), 'Preserved lobby draft');
    assert.ok(await page.locator('.game-row.gcard').count() >= 1, 'the filtered lobby lost its table list');
    assert.equal(await page.evaluate(() => window.WebSocket.connections), before.connections);
    assert.deepEqual(await outboundSizeChangeTraffic(page, before.sent), [], 'High contrast sent gameplay traffic');
    const filter = await presentationColors(page, '#g-filter-select');
    assert.ok(contrastRatio(filter.foreground, filter.background) >= 7,
      `High-contrast lobby text is ${contrastRatio(filter.foreground, filter.background).toFixed(2)}:1`);
    assert.ok(contrastRatio(filter.border, filter.background) >= 3,
      `High-contrast lobby control boundary is ${contrastRatio(filter.border, filter.background).toFixed(2)}:1`);
  });
  await check('High contrast toggles live during play without reconnecting, traffic, or lost hand state', async () => {
    await startActiveHand(page, 10, { interfaceSize: 'extra-large', viewport: { width: 390, height: 844 } });
    await setHighContrast(page, 'game', false);
    const before = await page.evaluate(() => ({
      connections: window.WebSocket.connections,
      sent: window.WebSocket.instance.sent.length,
      seats: document.querySelectorAll('#g-seats .seat').length,
      pot: document.querySelector('#g-potbar').textContent,
    }));
    await setHighContrast(page, 'game', true);
    const after = await page.evaluate(() => ({
      connections: window.WebSocket.connections,
      seats: document.querySelectorAll('#g-seats .seat').length,
      pot: document.querySelector('#g-potbar').textContent,
    }));
    assert.deepEqual(after, { connections: before.connections, seats: before.seats, pot: before.pot });
    assert.deepEqual(await outboundSizeChangeTraffic(page, before.sent), [], 'High contrast sent gameplay traffic');
    assert.equal(await page.locator('html').getAttribute('data-interface-size'), 'extra-large');
    const turnCue = await turnCueOutcome(page);
    assert.equal(turnCue.visible && turnCue.distinctFromInactive, true, 'current turn lacks a non-color boundary cue');
    const cards = await visibleCardOutcomes(page);
    assert.ok(cards.length >= 3 && cards.every((card) => card.rankVisible && card.suitVisible && !card.imageFace),
      'High contrast does not expose semantic rank and suit glyphs');
    const action = await presentationColors(page, '#g-actions .btn-fold');
    assert.ok(contrastRatio(action.foreground, action.background) >= 7,
      `High-contrast action text is ${contrastRatio(action.foreground, action.background).toFixed(2)}:1`);
    assert.ok(contrastRatio(action.border, action.background) >= 3,
      `High-contrast action boundary is ${contrastRatio(action.border, action.background).toFixed(2)}:1`);
    await page.locator('#g-actions .btn-fold').focus();
    const focus = await page.locator('#g-actions .btn-fold').evaluate((element) => {
      const style = getComputedStyle(element);
      return { outline: style.outlineColor, adjacent: getComputedStyle(element.parentElement).backgroundColor, width: parseFloat(style.outlineWidth) };
    });
    assert.ok(focus.width >= 3 && contrastRatio(focus.outline, focus.adjacent) >= 3,
      `High-contrast focus is ${contrastRatio(focus.outline, focus.adjacent).toFixed(2)}:1 at ${focus.width}px`);
    for (const button of await page.locator('#g-actions .btn-action').all()) {
      const box = await button.boundingBox();
      assertReachable(box && { left: box.x, top: box.y, right: box.x + box.width, bottom: box.y + box.height, width: box.width, height: box.height }, { width: 390, height: 844 }, 'High-contrast mobile action');
    }
    await page.waitForTimeout(4300);
    assert.equal(await page.locator('.fly-card').count(), 0, 'deal animation remained active before the canonical screenshot');
    await takeStableScreenshot(page, join(process.cwd(), 'docs/screenshots/25-high-contrast-mobile.png'));
  });
  await check('High contrast remains independent across every Interface size and supported viewport', async () => {
    const cases = [
      ['desktop', { width: 1440, height: 900 }],
      ['mobile portrait', { width: 390, height: 844 }],
      ['mobile landscape', { width: 844, height: 390 }],
    ];
    for (const [label, viewport] of cases) {
      await page.setViewportSize(viewport);
      for (const size of ['standard', 'large', 'extra-large']) {
        await chooseInterfaceSize(page, 'game', size);
        assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'true', `${label} ${size} lost High contrast`);
        assert.equal(await page.locator('html').getAttribute('data-interface-size'), size, `${label} did not apply ${size}`);
        assert.ok(await page.locator('#s-game').evaluate((screen) => screen.scrollWidth <= screen.clientWidth + 1), `${label} ${size} overflows horizontally`);
      }
    }
  });
  await check('High contrast temporarily overrides and exactly restores prior UI, felt, deck, and theme choices', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setHighContrast(page, 'game', false);
    await choosePlayerCosmetics(page);
    const choices = { ui: 'Light', felt: 'Saloon QML table style', deck: 'PokerTH' };
    assert.deepEqual(await selectedPlayerCosmetics(page), choices, 'Settings did not apply the chosen cosmetics');
    await closePlayerSettings(page);
    const presentation = () => page.evaluate(() => {
      const felt = getComputedStyle(document.querySelector('.felt-oval'));
      const card = getComputedStyle(document.querySelector('#s-game .pk:not(.back):not(.comm-slot)'));
      return {
        browserTheme: document.querySelector('meta[name="theme-color"]').content,
        feltImage: felt.backgroundImage,
        feltColor: felt.backgroundColor,
        cardImage: card.backgroundImage,
      };
    });
    const before = await presentation();
    const headerIcons = ['#sound-toggle-btn', '#g-overflow-btn'];
    const headerPresentation = async () => Object.fromEntries(await Promise.all(headerIcons.map(async (selector) => [
      selector, await presentationColors(page, selector, '#s-game .header'),
    ])));
    const beforeHeader = await headerPresentation();
    await setHighContrast(page, 'game', true);
    await page.waitForFunction(() => document.querySelector('meta[name="theme-color"]').content === '#000000');
    const overridden = await presentation();
    assert.notDeepEqual(overridden, before, 'High contrast did not override incompatible cosmetics');
    assert.equal(overridden.browserTheme, '#000000', 'High contrast did not override the browser theme');
    await openPlayerSettings(page);
    assert.deepEqual(await selectedPlayerCosmetics(page), choices, 'High contrast changed the player-visible cosmetic selections');
    await closePlayerSettings(page);
    const highContrastHeader = await headerPresentation();
    for (const selector of headerIcons) {
      const ratio = contrastRatio(highContrastHeader[selector].foreground, highContrastHeader[selector].background);
      assert.ok(ratio >= 3, `High-contrast ${selector} graphic is ${ratio.toFixed(2)}:1`);
      assert.notEqual(highContrastHeader[selector].foreground, beforeHeader[selector].foreground,
        `${selector} did not visibly override the Light UI icon color`);
    }
    await setHighContrast(page, 'game', false);
    await openPlayerSettings(page);
    assert.deepEqual(await selectedPlayerCosmetics(page), choices, 'disabling High contrast did not restore the selected cosmetics');
    await closePlayerSettings(page);
    await page.waitForFunction((theme) => document.querySelector('meta[name="theme-color"]').content === theme, before.browserTheme);
    assert.deepEqual(await presentation(), before, 'disabling High contrast did not exactly restore rendered cosmetics');
    assert.deepEqual(await headerPresentation(), beforeHeader, 'disabling High contrast did not restore Light UI header icons');
  });
  await check('installed-PWA presentation applies the same High-contrast palette', async () => {
    const pwaContext = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    try {
      await pwaContext.addInitScript(() => {
        Object.defineProperty(navigator, 'standalone', { configurable: true, value: true });
      });
      const pwaPage = await pwaContext.newPage();
      await pwaPage.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded' });
      await waitForAppSessionReady(pwaPage);
      assert.equal(await pwaPage.locator('html').getAttribute('data-pwa'), '1');
      await setHighContrast(pwaPage, 'connect', true);
      await pwaPage.waitForFunction(() => document.querySelector('meta[name="theme-color"]').content === '#000000');
      const presentation = await pwaPage.evaluate(() => ({
        highContrast: document.documentElement.dataset.highContrast,
        themeColor: document.querySelector('meta[name="theme-color"]').content,
        bodyBackground: getComputedStyle(document.body).backgroundColor,
      }));
      assert.deepEqual(presentation, { highContrast: 'true', themeColor: '#000000', bodyBackground: 'rgb(0, 0, 0)' });
    } finally {
      await pwaContext.close();
    }
  });
  await check('installed-PWA approximation keeps Extra Large play operable in portrait and landscape', async () => {
    const pwaContext = await browser.newContext({ serviceWorkers: 'block' });
    try {
      await pwaContext.addInitScript(() => {
        Object.defineProperty(navigator, 'standalone', { configurable: true, value: true });
      });
      const pwaPage = await pwaContext.newPage();
      await pwaPage.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded' });
      await waitForAppSessionReady(pwaPage);
      for (const [label, viewport] of [
        ['portrait', { width: 390, height: 844 }],
        ['landscape', { width: 844, height: 390 }],
      ]) {
        await startActiveHand(pwaPage, 10, { interfaceSize: 'extra-large', viewport });
        assert.equal(await pwaPage.locator('html').getAttribute('data-pwa'), '1', `${label} lost standalone presentation`);
        assert.equal(await pwaPage.locator('html').getAttribute('data-interface-size'), 'extra-large', `${label} lost Extra Large`);
        assert.equal(await pwaPage.locator('html').getAttribute('data-adaptive-play'), 'constrained-extra-large', `${label} did not use adaptive play`);
        const geometry = await activeHandRects(pwaPage);
        for (const [name, rect] of Object.entries({
          cards: geometry.cards,
          pot: geometry.pot,
          blinds: geometry.blinds,
          currentTurn: geometry.activeSeat,
          timer: geometry.activeTimer,
          actions: geometry.actions,
          drawers: geometry.drawerBar,
        })) assertReachable(rect, geometry.viewport, `installed-PWA approximation ${label} ${name}`);
        await pwaPage.locator('#adaptive-info-toggle').click();
        await pwaPage.locator('#g-log-panel').waitFor({ state: 'visible' });
        await pwaPage.keyboard.press('Escape');
        await pwaPage.locator('#g-log-panel').waitFor({ state: 'hidden' });
        await assertActionOperable(pwaPage, `installed-PWA approximation ${label}`);
      }
    } finally {
      await pwaContext.close();
    }
  });
  await check('desktop login remains readable and operable at every Interface size', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => {
      localStorage.removeItem('pth_resume');
      localStorage.setItem('pth_interface_size', 'standard');
      localStorage.setItem('pth_high_contrast', '0');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForAppSessionReady(page);
    await page.locator('#s-connect.active').waitFor();
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
  await check('Standard remains operable in a 200%-browser-zoom-equivalent layout with chat visible', async () => {
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
  await check('Extra Large mobile landscape keeps a ten-seat decision readable and operable', async () => {
    await assertDenseActiveHand(page, {
      viewport: { width: 844, height: 390 },
      label: 'mobile landscape Extra Large',
      fontSelectors: ['#g-potbar', '.blinds-next', '#g-comm .pk .c-rank', '#g-comm .pk .c-suit', '#g-actions .btn-fold', '#g-actions .act-buttons-row .btn-action:nth-child(2)', '#g-actions .raise-btn'],
      enhancedTargets: ['#accessibility-open-game', '#raise-amt', '#raise-slider', '#g-actions .btn-fold', '#g-actions .act-buttons-row .btn-action:nth-child(2)', '#g-actions .raise-btn'],
      requireSeatValues: true,
      includeBlinds: true,
      beforeAction: async () => {
        const sliderBefore = await page.locator('#raise-slider').inputValue();
        await page.locator('#raise-slider').focus();
        await page.keyboard.press('ArrowRight');
        assert.notEqual(await page.locator('#raise-slider').inputValue(), sliderBefore, 'mobile landscape Extra Large betting slider is not keyboard operable');
      },
    });
  });
  await check('Extra Large mobile landscape drawers remain operable without occluding a decision', async () => {
    for (const drawer of [
      { trigger: '#adaptive-chat-toggle', panel: '#g-chat-panel', close: '#g-chat-close', label: 'chat' },
      { trigger: '#adaptive-info-toggle', panel: '#g-log-panel', close: '#g-log-close', label: 'information' },
    ]) {
      await startActiveHand(page, 10);
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(300);
      await chooseInterfaceSize(page, 'game', 'extra-large');
      await page.locator(drawer.trigger).click();
      await page.locator(drawer.panel).waitFor({ state: 'visible' });
      await page.waitForTimeout(300);
      const box = await page.locator(drawer.panel).boundingBox();
      const drawerRect = { left: box.x, top: box.y, right: box.x + box.width, bottom: box.y + box.height, width: box.width, height: box.height };
      assertReachable(drawerRect, { width: 844, height: 390 }, `mobile landscape Extra Large ${drawer.label} drawer`);
      assertCriticalUnoccluded(await activeHandRects(page), drawerRect, `mobile landscape Extra Large open ${drawer.label} drawer`);
      await assertVisibleInteractiveTargets(page, drawer.panel, `mobile landscape Extra Large ${drawer.label} drawer`);
      await assertActionOperable(page, `mobile landscape Extra Large open ${drawer.label} drawer`);
      await page.keyboard.press('Escape');
      await page.locator(drawer.panel).waitFor({ state: 'hidden' });
      await page.waitForFunction((id) => document.activeElement && document.activeElement.id === id, drawer.trigger.slice(1));
      assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), drawer.trigger.slice(1),
        `mobile landscape Extra Large ${drawer.label} drawer did not return focus to its trigger`);
      await page.locator(drawer.trigger).click();
      await page.locator(drawer.close).click();
      await page.locator(drawer.panel).waitFor({ state: 'hidden' });
    }

    for (const drawer of [
      { trigger: '#adaptive-hands-toggle', panel: '#hands-card-inner', visible: '#hands-overlay', close: '#hands-card-inner .g-chat-panel-header button', label: 'hands' },
      { trigger: '#adaptive-reactions-toggle', panel: '#g-reaction-panel', visible: '#g-reaction-panel', close: '#g-reaction-panel .react-panel-close', label: 'reactions' },
    ]) {
      await startActiveHand(page, 10);
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(300);
      await chooseInterfaceSize(page, 'game', 'extra-large');
      await page.locator(drawer.trigger).click();
      await page.locator(drawer.visible).waitFor({ state: 'visible' });
      await page.waitForTimeout(300);
      assert.equal(await page.locator(drawer.panel).getAttribute('role'), 'dialog',
        `mobile landscape Extra Large ${drawer.label} drawer lacks dialog semantics`);
      const box = await page.locator(drawer.panel).boundingBox();
      const drawerRect = { left: box.x, top: box.y, right: box.x + box.width, bottom: box.y + box.height, width: box.width, height: box.height };
      assertReachable(drawerRect, { width: 844, height: 390 }, `mobile landscape Extra Large ${drawer.label} drawer`);
      assertCriticalUnoccluded(await activeHandRects(page), drawerRect, `mobile landscape Extra Large open ${drawer.label} drawer`);
      const targets = await assertVisibleInteractiveTargets(page, drawer.panel, `mobile landscape Extra Large ${drawer.label} drawer`);
      if (drawer.label === 'reactions') {
        const choices = targets.filter((target) => String(target.name).includes('react-btn'));
        assert.ok(choices.length >= 15, 'mobile landscape Extra Large reactions expose fewer than 15 choices');
        assert.ok(new Set(choices.slice(0, 15).map((target) => Math.round(target.top))).size > 1,
          'mobile landscape Extra Large reaction choices did not reflow into multiple rows');
      }
      await page.keyboard.press('Escape');
      await page.locator(drawer.visible).waitFor({ state: 'hidden' });
      await page.waitForFunction((id) => document.activeElement && document.activeElement.id === id, drawer.trigger.slice(1));
      assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), drawer.trigger.slice(1),
        `mobile landscape Extra Large ${drawer.label} drawer did not return focus to its trigger`);
      await page.locator(drawer.trigger).click();
      await page.locator(drawer.close).click();
      await page.locator(drawer.visible).waitFor({ state: 'hidden' });
      if (drawer.label === 'reactions') {
        await page.locator(drawer.trigger).click();
        await page.locator(drawer.visible).waitFor({ state: 'visible' });
        const sentBefore = await page.evaluate(() => window.WebSocket.instance.sent.length);
        await page.locator('#g-reaction-panel .react-grid:not([hidden]) .react-btn').first().click();
        await page.locator(drawer.visible).waitFor({ state: 'hidden' });
        await page.waitForFunction((before) => window.WebSocket.instance.sent.length > before, sentBefore);
      }
    }
  });
  await check('Extra Large mobile portrait keeps a dense active hand readable and operable', async () => {
    await assertDenseActiveHand(page, {
      viewport: { width: 390, height: 844 },
      label: 'mobile portrait Extra Large',
      fontSelectors: ['#g-pot', '#g-bets', '#g-potbar', '.blinds-next', '#g-comm .pk .c-rank', '#g-comm .pk .c-suit', '#g-actions .btn-fold', '#g-actions .act-buttons-row .btn-action:nth-child(2)', '#g-actions .raise-btn'],
      enhancedTargets: ['#accessibility-open-game', '#g-actions .btn-fold', '#g-actions .act-buttons-row .btn-action:nth-child(2)', '#g-actions .raise-btn'],
    });
  });
  await check('Extra Large mobile portrait drawers reflow around critical play', async () => {
    for (const drawer of [
      { trigger: '#adaptive-chat-toggle', panel: '#g-chat-panel', close: '#g-chat-close', label: 'chat' },
      { trigger: '#adaptive-info-toggle', panel: '#g-log-panel', close: '#g-log-close', label: 'information' },
    ]) {
      await startActiveHand(page, 10);
      assert.equal(await page.locator(drawer.panel).getAttribute('role'), null,
        `${drawer.label} panel exposes dialog semantics outside adaptive portrait play`);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(300);
      await chooseInterfaceSize(page, 'game', 'extra-large');
      await page.locator(drawer.trigger).click();
      await page.locator(drawer.panel).waitFor({ state: 'visible' });
      await page.waitForTimeout(300);
      const box = await page.locator(drawer.panel).boundingBox();
      const drawerRect = { left: box.x, top: box.y, right: box.x + box.width, bottom: box.y + box.height, width: box.width, height: box.height };
      const geometry = await activeHandRects(page);
      assertCriticalUnoccluded(geometry, drawerRect, `mobile portrait Extra Large open ${drawer.label} drawer`);
      const cue = await turnCueOutcome(page);
      assert.equal(cue.visible, true, `mobile portrait Extra Large open ${drawer.label} drawer hides the current-turn cue`);
      assert.equal(cue.distinctFromInactive, true, `mobile portrait Extra Large open ${drawer.label} drawer makes the current-turn cue ambiguous`);
      await assertActionOperable(page, `mobile portrait Extra Large open ${drawer.label} drawer`);
      await page.locator(drawer.close).click();
      await page.locator(drawer.panel).waitFor({ state: 'hidden' });
    }
  });
  await check('open drawers preserve state across live constrained-screen and Interface-size transitions', async () => {
    for (const drawer of [
      { trigger: '#chat-toggle-btn', adaptiveTrigger: '#adaptive-chat-toggle', panel: '#g-chat-panel', close: '#g-chat-close', label: 'chat', focus: 'g-chat-in' },
      { trigger: '#log-toggle-btn', adaptiveTrigger: '#adaptive-info-toggle', panel: '#g-log-panel', close: '#g-log-close', label: 'information', focus: 'gip-tab-stats' },
    ]) {
      await startActiveHand(page, 10);
      await chooseInterfaceSize(page, 'game', 'extra-large');
      await page.locator(drawer.trigger).click();
      await page.locator(drawer.panel).waitFor({ state: 'visible' });
      if (drawer.label === 'chat') await page.locator('#g-chat-in').fill('Draft survives adaptive transitions');
      else await page.locator('#gip-tab-stats').click();

      assert.equal(await page.locator(drawer.panel).getAttribute('role'), null,
        `${drawer.label} drawer exposes adaptive dialog semantics before portrait entry`);
      assert.equal(await page.locator(drawer.panel).isVisible(), true, `${drawer.label} drawer is unavailable before portrait entry`);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(400);
      assert.equal(await page.locator(drawer.panel).isVisible(), true, `${drawer.label} drawer closed during portrait entry`);
      assert.equal(await page.locator(drawer.panel).getAttribute('role'), 'dialog', `${drawer.label} drawer lacks adaptive dialog semantics`);
      const adaptiveLabel = (await visibleMetrics(page, [drawer.adaptiveTrigger]))[drawer.adaptiveTrigger];
      assert.ok(Math.abs(adaptiveLabel.fontSize - 22.4) <= 0.05,
        `${drawer.label} drawer label does not use the 2x public small-text scale: ${adaptiveLabel.fontSize}px`);
      await assertTextFits(page, drawer.adaptiveTrigger, `${drawer.label} adaptive drawer label`);
      assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), drawer.focus,
        `${drawer.label} drawer did not receive focus on portrait entry`);
      if (drawer.label === 'chat') assert.equal(await page.locator('#g-chat-in').inputValue(), 'Draft survives adaptive transitions');
      else assert.equal(await page.locator('#g-stats-body').isVisible(), true, 'information drawer lost its active Stats tab on portrait entry');
      await assertEnhancedTargets(page,
        drawer.label === 'chat' ? ['#g-chat-in', '#g-chat-close'] : ['#gip-tab-stats', '#g-log-close'],
        `live-transition ${drawer.label} drawer`);
      const panelBox = await page.locator(drawer.panel).boundingBox();
      const drawerRect = { left: panelBox.x, top: panelBox.y, right: panelBox.x + panelBox.width, bottom: panelBox.y + panelBox.height, width: panelBox.width, height: panelBox.height };
      assertCriticalUnoccluded(await activeHandRects(page), drawerRect, `live-transition ${drawer.label} drawer`);
      await assertActionOperable(page, `live-transition ${drawer.label} drawer`);

      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(400);
      assert.equal(await page.locator(drawer.panel).isVisible(), true, `${drawer.label} drawer closed during landscape entry`);
      assert.equal(await page.locator(drawer.panel).getAttribute('role'), 'dialog', `${drawer.label} drawer lost adaptive dialog semantics in mobile landscape`);
      const landscapeBox = await page.locator(drawer.panel).boundingBox();
      const landscapeRect = { left: landscapeBox.x, top: landscapeBox.y, right: landscapeBox.x + landscapeBox.width, bottom: landscapeBox.y + landscapeBox.height, width: landscapeBox.width, height: landscapeBox.height };
      assertCriticalUnoccluded(await activeHandRects(page), landscapeRect, `live-transition landscape ${drawer.label} drawer`);
      if (drawer.label === 'chat') assert.equal(await page.locator('#g-chat-in').inputValue(), 'Draft survives adaptive transitions');
      else assert.equal(await page.locator('#g-stats-body').isVisible(), true, 'information drawer lost its active Stats tab on landscape entry');

      await page.locator('#accessibility-open-game').click();
      await page.locator('input[name="interface-size"][value="standard"]').check();
      await page.locator('#accessibility-close').click();
      await page.waitForTimeout(400);
      assert.equal(await page.locator(drawer.panel).isVisible(), true, `${drawer.label} drawer closed when leaving Extra Large`);
      assert.equal(await page.locator(drawer.panel).getAttribute('role'), null, `${drawer.label} drawer retained adaptive dialog semantics at Standard`);
      if (drawer.label === 'chat') assert.equal(await page.locator('#g-chat-in').inputValue(), 'Draft survives adaptive transitions');
      else assert.equal(await page.locator('#g-stats-body').isVisible(), true, 'information drawer lost its active Stats tab when leaving Extra Large');

      await page.locator('#accessibility-open-game').click();
      await page.locator('input[name="interface-size"][value="extra-large"]').check();
      await page.locator('#accessibility-close').click();
      await page.waitForTimeout(400);
      assert.equal(await page.locator(drawer.panel).isVisible(), true, `${drawer.label} drawer closed when returning to Extra Large`);
      assert.equal(await page.locator(drawer.panel).getAttribute('role'), 'dialog', `${drawer.label} drawer did not restore adaptive dialog semantics in Extra Large`);
      assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), drawer.focus,
        `${drawer.label} drawer did not restore focus when returning to Extra Large`);
      if (drawer.label === 'information') await page.locator('#gip-tab-log').click();
      await page.locator(drawer.close).click();
      await page.locator(drawer.panel).waitFor({ state: 'hidden' });
    }
  });
  await check('drawer triggers return to their inactive appearance across live transitions', async () => {
    for (const drawer of [
      { normal: '#chat-toggle-btn', adaptive: '#adaptive-chat-toggle', panel: '#g-chat-panel', label: 'chat' },
      { normal: '#log-toggle-btn', adaptive: '#adaptive-info-toggle', panel: '#g-log-panel', label: 'information' },
    ]) {
      await page.setViewportSize({ width: 1280, height: 800 });
      await startActiveHand(page, 10);
      await chooseInterfaceSize(page, 'game', 'extra-large');
      const normalInactive = await triggerPresentation(page, drawer.normal);

      await page.locator(drawer.normal).click();
      await page.locator(drawer.panel).waitFor({ state: 'visible' });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(400);
      await page.locator(drawer.adaptive).click();
      await page.locator(drawer.panel).waitFor({ state: 'hidden' });
      await page.waitForTimeout(100);
      const adaptiveInactive = await triggerPresentation(page, drawer.adaptive);
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(400);
      assert.deepEqual(await triggerPresentation(page, drawer.normal), normalInactive,
        `${drawer.label} desktop trigger retained its open appearance after adaptive close`);
      assert.equal(await page.locator(drawer.adaptive).getAttribute('aria-expanded'), 'false',
        `${drawer.label} adaptive trigger remained expanded after adaptive close`);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(400);
      await page.locator(drawer.adaptive).click();
      await page.locator(drawer.panel).waitFor({ state: 'visible' });
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(400);
      await page.locator(drawer.normal).click();
      await page.locator(drawer.panel).waitFor({ state: 'hidden' });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(400);
      assert.deepEqual(await triggerPresentation(page, drawer.adaptive), adaptiveInactive,
        `${drawer.label} adaptive trigger retained its open appearance after desktop close`);
      assert.equal(await page.locator(drawer.normal).getAttribute('aria-expanded'), 'false',
        `${drawer.label} desktop trigger remained expanded after desktop close`);
    }
  });
  await check('Hands and Reactions triggers share open state across compact transitions', async () => {
    for (const drawer of [
      { normal: '#hands-toggle-btn', adaptive: '#adaptive-hands-toggle', visible: '#hands-overlay', label: 'hands' },
      { normal: '#react-toggle-btn', adaptive: '#adaptive-reactions-toggle', visible: '#g-reaction-panel', label: 'reactions' },
    ]) {
      await page.setViewportSize({ width: 1280, height: 800 });
      await startActiveHand(page, 10);
      await chooseInterfaceSize(page, 'game', 'extra-large');
      const adaptiveInactive = await triggerPresentation(page, drawer.adaptive);
      const normalInactive = await triggerPresentation(page, drawer.normal);

      await page.locator(drawer.normal).click();
      await page.locator(drawer.visible).waitFor({ state: 'visible' });
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(400);
      assert.equal(await page.locator(drawer.adaptive).getAttribute('aria-expanded'), 'true',
        `${drawer.label} adaptive trigger lost expanded state during compact entry`);
      assert.notDeepEqual(await triggerPresentation(page, drawer.adaptive), adaptiveInactive,
        `${drawer.label} adaptive trigger did not reflect a window opened by the normal trigger`);

      await page.locator(drawer.adaptive).click();
      await page.locator(drawer.visible).waitFor({ state: 'hidden' });
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(400);
      assert.equal(await page.locator(drawer.normal).getAttribute('aria-expanded'), 'false',
        `${drawer.label} normal trigger retained expanded state after adaptive close`);
      assert.deepEqual(await triggerPresentation(page, drawer.normal), normalInactive,
        `${drawer.label} normal trigger retained its open appearance after adaptive close`);
    }
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
  await check('pinch permission and table magnification remain independently operable across Interface sizes', async () => {
    await startActiveHand(page, 10);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(300);
    await chooseInterfaceSize(page, 'game', 'extra-large');

    await page.evaluate(() => {
      const nativeMatchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query) => query === '(pointer: coarse)'
        ? { matches: true, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; } }
        : nativeMatchMedia(query);
      localStorage.setItem('pth_table_zoom', '1');
      window.applyAdvOpts();
      window._loupeBtnSync();
    });
    assert.equal(await page.locator('#g-zoom-toggle').isVisible(), true, 'table magnifier is unavailable on a compact touch layout');
    await assertEnhancedTargets(page, ['#g-zoom-toggle'], 'mobile landscape Extra Large table magnifier');
    await waitForStableTableLayout(page);
    const baseGeometry = await activeHandRects(page);
    await page.locator('#g-zoom-toggle').click();
    await waitForStableTableLayout(page);
    assert.equal(await page.locator('#g-zoom-toggle').getAttribute('aria-pressed'), 'true', 'table magnifier did not activate');
    const magnifiedGeometry = await activeHandRects(page);
    assert.ok(magnifiedGeometry.cards.width >= baseGeometry.cards.width * 1.8,
      `table magnifier did not visibly enlarge cards: ${baseGeometry.cards.width} -> ${magnifiedGeometry.cards.width}`);
    assert.ok(magnifiedGeometry.seats.some((seat, index) => seat.width >= baseGeometry.seats[index].width * 1.5),
      'table magnifier did not visibly enlarge any opponent seat');
    assert.equal(await page.locator('html').getAttribute('data-interface-size'), 'extra-large', 'table magnification changed Interface size');

    const restrictedViewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    assert.equal(restrictedViewport.includes('user-scalable=no'), true, 'pinch zoom began enabled unexpectedly');
    await page.locator('#accessibility-open-game').click();
    await page.locator('#accessibility-browser-zoom').check();
    const permissiveViewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    assert.equal(permissiveViewport.includes('user-scalable=no'), false, 'enabling pinch zoom did not release the viewport restriction');
    assert.equal(permissiveViewport.includes('maximum-scale=1'), false, 'enabling pinch zoom retained the maximum-scale restriction');
    assert.equal(await page.locator('#adv-browserzoom').isChecked(), true, 'Advanced lost the pinch-zoom alias');
    assert.equal(await page.locator('html').getAttribute('data-interface-size'), 'extra-large', 'pinch permission changed Interface size');
    assert.equal(await page.locator('#g-zoom-toggle').getAttribute('aria-pressed'), 'true', 'pinch permission changed table magnification');
    const permissionGeometry = await activeHandRects(page);
    assert.ok(Math.abs(permissionGeometry.cards.width - magnifiedGeometry.cards.width) <= 1,
      'pinch permission changed rendered table magnification');
    await page.locator('input[name="interface-size"][value="standard"]').check();
    await page.locator('input[name="interface-size"][value="extra-large"]').check();
    assert.equal(await page.locator('#accessibility-browser-zoom').isChecked(), true, 'Interface size changed pinch-zoom permission');
    assert.equal(await page.locator('#g-zoom-toggle').getAttribute('aria-pressed'), 'true', 'Interface size deactivated table magnification');
    await page.locator('#accessibility-browser-zoom').uncheck();
    assert.equal((await page.locator('meta[name="viewport"]').getAttribute('content')).includes('user-scalable=no'), true,
      'disabling pinch zoom did not restore the viewport restriction');
    assert.equal(await page.locator('#adv-browserzoom').isChecked(), false, 'Advanced pinch-zoom alias did not follow the user control');
    assert.equal(await page.locator('#g-zoom-toggle').getAttribute('aria-pressed'), 'true', 'disabling pinch permission changed table magnification');
    await page.locator('#accessibility-close').click();
    await page.locator('#g-zoom-toggle').click();
    await waitForStableTableLayout(page);
    assert.equal(await page.locator('#g-zoom-toggle').getAttribute('aria-pressed'), 'false', 'table magnifier did not deactivate');
    const restoredGeometry = await activeHandRects(page);
    assert.ok(Math.abs(restoredGeometry.cards.width - baseGeometry.cards.width) <= 1,
      `table magnifier did not restore card geometry: ${baseGeometry.cards.width} -> ${restoredGeometry.cards.width}`);
  });
  await check('persisted Extra Large cold start keeps magnifier geometry stable', async () => {
    const viewport = { width: 844, height: 390 };
    await page.evaluate(() => {
      localStorage.setItem('pth_browser_zoom', '0');
      localStorage.setItem('pth_table_zoom', '1');
    });
    await startActiveHand(page, 10, { interfaceSize: 'extra-large', viewport });
    await page.evaluate(() => {
      const nativeMatchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query) => query === '(pointer: coarse)'
        ? { matches: true, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; } }
        : nativeMatchMedia(query);
      window.applyAdvOpts();
      window._loupeBtnSync();
    });
    await waitForStableTableLayout(page);
    assert.equal(await page.locator('html').getAttribute('data-interface-size'), 'extra-large', 'cold start did not apply persisted Extra Large');
    assert.equal(await page.locator('html').getAttribute('data-adaptive-play'), 'constrained-extra-large', 'cold start did not enter adaptive landscape play');
    assert.equal(await page.evaluate(() => localStorage.getItem('pth_interface_size')), 'extra-large', 'cold start changed the persisted Interface size');
    await assertEnhancedTargets(page, ['#g-zoom-toggle'], 'cold-start Extra Large table magnifier');
    const baseGeometry = await activeHandRects(page);
    for (const [name, rect] of Object.entries({ cards: baseGeometry.cards, pot: baseGeometry.pot, blinds: baseGeometry.blinds, currentTurn: baseGeometry.activeSeat, timer: baseGeometry.activeTimer, actions: baseGeometry.actions, status: baseGeometry.status })) {
      assertReachable(rect, baseGeometry.viewport, `cold-start Extra Large ${name}`);
    }
    const sentBefore = await page.evaluate(() => window.WebSocket.instance.sent.length);

    await page.locator('#g-zoom-toggle').click();
    await waitForStableTableLayout(page);
    const magnifiedGeometry = await activeHandRects(page);
    assert.ok(magnifiedGeometry.cards.width >= baseGeometry.cards.width * 1.8, 'cold-start magnifier did not visibly enlarge cards');
    assert.equal(await page.locator('#g-zoom-toggle').getAttribute('aria-pressed'), 'true', 'cold-start magnifier did not activate');
    await page.locator('#accessibility-open-game').click();
    await page.locator('#accessibility-browser-zoom').check();
    await page.locator('input[name="interface-size"][value="standard"]').check();
    await page.locator('input[name="interface-size"][value="extra-large"]').check();
    await waitForStableTableLayout(page);
    const activeRoundTrip = await activeHandRects(page);
    assert.ok(Math.abs(activeRoundTrip.cards.width - magnifiedGeometry.cards.width) <= 1,
      `cold-start active magnifier geometry was contaminated: ${magnifiedGeometry.cards.width} -> ${activeRoundTrip.cards.width}`);
    assert.equal(await page.locator('#g-zoom-toggle').getAttribute('aria-pressed'), 'true', 'Interface-size round trip deactivated the cold-start magnifier');
    assert.equal(await page.locator('#accessibility-browser-zoom').isChecked(), true, 'Interface-size round trip changed pinch permission');
    await page.locator('#accessibility-browser-zoom').uncheck();
    await page.locator('#accessibility-close').click();

    await page.locator('#g-zoom-toggle').click();
    await waitForStableTableLayout(page);
    const restoredGeometry = await activeHandRects(page);
    assert.equal(await page.locator('#g-zoom-toggle').getAttribute('aria-pressed'), 'false', 'cold-start magnifier did not deactivate');
    assert.ok(Math.abs(restoredGeometry.cards.width - baseGeometry.cards.width) <= 1,
      `cold-start magnifier did not restore card geometry: ${baseGeometry.cards.width} -> ${restoredGeometry.cards.width}`);
    for (const [index, seat] of restoredGeometry.seats.entries()) {
      assert.ok(Math.abs(seat.width - baseGeometry.seats[index].width) <= 1 && Math.abs(seat.height - baseGeometry.seats[index].height) <= 1,
        `cold-start magnifier did not restore seat ${index + 1} geometry`);
    }

    await page.locator('#accessibility-open-game').click();
    await page.locator('input[name="interface-size"][value="standard"]').check();
    await waitForStableTableLayout(page);
    await page.locator('input[name="interface-size"][value="extra-large"]').check();
    await page.locator('#accessibility-close').click();
    await waitForStableTableLayout(page);
    const offRoundTrip = await activeHandRects(page);
    assert.ok(Math.abs(offRoundTrip.cards.width - baseGeometry.cards.width) <= 1,
      `cold-start off geometry was contaminated by Interface sizes: ${baseGeometry.cards.width} -> ${offRoundTrip.cards.width}`);
    assert.equal(await page.locator('html').getAttribute('data-interface-size'), 'extra-large', 'cold-start round trip lost Extra Large');
    assert.equal(await page.evaluate(() => localStorage.getItem('pth_browser_zoom')), '0', 'Interface-size round trip changed pinch permission storage');
    assert.deepEqual(await outboundSizeChangeTraffic(page, sentBefore), [], 'cold-start accessibility controls sent network traffic');
    for (const [name, rect] of Object.entries({ cards: offRoundTrip.cards, pot: offRoundTrip.pot, blinds: offRoundTrip.blinds, currentTurn: offRoundTrip.activeSeat, timer: offRoundTrip.activeTimer, actions: offRoundTrip.actions, status: offRoundTrip.status })) {
      assertReachable(rect, offRoundTrip.viewport, `cold-start restored Extra Large ${name}`);
    }
  });
  await check('persisted Extra Large refreshes Standard metrics across orientation changes', async () => {
    await page.evaluate(() => localStorage.setItem('pth_table_zoom', '1'));
    await startActiveHand(page, 10, { interfaceSize: 'extra-large', viewport: { width: 390, height: 844 } });
    await page.evaluate(() => {
      const nativeMatchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query) => query === '(pointer: coarse)'
        ? { matches: true, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; } }
        : nativeMatchMedia(query);
      window.applyAdvOpts();
      window._loupeBtnSync();
    });
    const portraitBefore = await exerciseLoupeRestoration(page, 'cold portrait');
    await page.setViewportSize({ width: 844, height: 390 });
    const landscape = await exerciseLoupeRestoration(page, 'rotated landscape');
    await page.setViewportSize({ width: 390, height: 844 });
    const portraitAfter = await exerciseLoupeRestoration(page, 'returned portrait');
    assert.ok(Math.abs(portraitAfter.cards.width - portraitBefore.cards.width) <= 1,
      `portrait geometry did not return to its current-viewport baseline: ${portraitBefore.cards.width} -> ${portraitAfter.cards.width}`);
    await startActiveHand(page, 10, { interfaceSize: 'extra-large', viewport: { width: 844, height: 390 } });
    await page.evaluate(() => {
      const nativeMatchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query) => query === '(pointer: coarse)'
        ? { matches: true, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; } }
        : nativeMatchMedia(query);
      window.applyAdvOpts();
      window.renderSeats();
    });
    await waitForStableTableLayout(page);
    const freshLandscape = await activeHandRects(page);
    assert.ok(Math.abs(landscape.cards.width - freshLandscape.cards.width) <= 1,
      `rotated landscape retained a stale viewport baseline: ${landscape.cards.width} -> ${freshLandscape.cards.width}`);
    await page.addStyleTag({ content: ':root { --standard-pot-font-base: 14px; --standard-pot-font-min: 11px; --standard-community-font-base: 1.1rem; }' });
    await page.setViewportSize({ width: 390, height: 844 });
    await waitForStableTableLayout(page);
    const canonicalTokenFonts = await visibleMetrics(page, ['#g-potbar', '#g-comm .pk']);
    assert.ok(Math.abs(canonicalTokenFonts['#g-potbar'].fontSize - 32.2) <= 0.1,
      `persisted Extra Large ignored the canonical Standard pot token: ${canonicalTokenFonts['#g-potbar'].fontSize}`);
    assert.ok(Math.abs(canonicalTokenFonts['#g-comm .pk'].fontSize - 40.48) <= 0.1,
      `persisted Extra Large ignored the canonical Standard community token: ${canonicalTokenFonts['#g-comm .pk'].fontSize}`);
  });
  console.log(`PASS ${passed}/${passed}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
