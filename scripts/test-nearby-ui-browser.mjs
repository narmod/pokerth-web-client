#!/usr/bin/env node
// « Play nearby », step 4: the real client, two phones, nothing but the UI.
// The page is served with no proxy behind it (no /app-config, no Internet:
// the way it will be used), in two Chrome contexts. Host: LAN → « 👥 Play
// nearby » → Host a game → lobby → Add a player → Copy link. Guest: LAN →
// Play nearby → Join a game → paste the host's link → Copy link. Host: paste
// the answer. The guest lands in the host's lobby; lobby chat crosses; the
// header buttons follow the roles; the admin switch hides the entry.
// Run: node scripts/test-nearby-ui-browser.mjs   (needs Chrome / Chromium)
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { fileURLToPath } from 'url';
import { freePort } from './lib/free-port.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };

const TYPES = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.wasm': 'application/wasm' };
const port = await freePort();
const server = http.createServer((req, res) => {
  let u = decodeURIComponent((req.url || '/').split('?')[0]);
  if (u === '/' || u === '/index.html') u = '/pokerth-client.html';
  if (u === '/sw.js') { res.writeHead(404); return res.end(); }        // no service worker in this test
  const f = path.join(pub, path.normalize(u).replace(/^([/\\])+/, ''));
  if (!f.startsWith(pub) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(port, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + port + '/';

let browser = null;
for (const opts of [{}, { executablePath: '/usr/bin/google-chrome' }, { channel: 'chrome' }]) {
  try { browser = await chromium.launch(Object.assign({ args: ['--no-sandbox'] }, opts)); break; } catch (e) {}
}
if (!browser) { console.log('  - no Chrome / Chromium available: skipped'); server.close(); process.exit(0); }

const errors = [];
async function phone(nick) {
  const ctx = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 420, height: 860 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('pth_lang', 'en'); localStorage.setItem('pth_guide_offered', '1'); } catch (e) {} });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(nick + ': ' + e.message));
  await p.goto(base);
  await p.waitForFunction(() => window.App && window.NearbyUI && window.LanDirUI, null, { timeout: 30000 });
  // First-visit banners (backup restore, install…) are not what is tested here.
  await p.addStyleTag({ content: '#bak-restore-banner, #install-popup, .poll-back { display: none !important; }' });
  // LAN mode, « Play nearby », nickname.
  await p.evaluate((nk) => {
    // The login screen's LAN card, as a player taps it.
    window.loginPickMode(document.querySelector('.login-card[onclick*="lan-dedi"]'), 'lan-dedi');
    document.getElementById('nick').value = nk;
    window.LanDirUI.sync();
  }, nick);
  return p;
}
const until = async (page, fn, ms, arg) => { try { await page.waitForFunction(fn, arg === undefined ? null : arg, { timeout: ms || 15000, polling: 100 }); return true; } catch (e) { return false; } };
const visible = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.offsetParent !== null && getComputedStyle(e).display !== 'none'); }, sel);

const host = await phone('Hosty');
ok(await until(host, () => !!document.querySelector('#lan-dir-sel option[value="__nearby__"]')), 'LAN list: « Play nearby » is offered (no directory, no network)');
// Pick it through the drop-down, like a player.
await host.click('#lan-dir-btn');
await host.click('.lan-dd-item.nearby');
ok(await host.evaluate(() => document.body.classList.contains('lan-nearby')), 'picking it switches the form to « Play nearby »');
ok(await visible(host, '#nb-host-btn') && await visible(host, '#nb-join-btn') && !(await visible(host, '#s-connect button.btn-primary[onclick="App.connect()"]')),
  'Host / Join replace the Connect button');
ok(/Wi-Fi/.test(await host.evaluate(() => document.getElementById('lan-dir-detail').textContent)), 'the line under the list says: no Internet · same Wi-Fi');
await host.click('#nb-host-btn');
ok(await until(host, () => document.getElementById('s-lobby').classList.contains('active'), 20000), 'Host a game → the host is in his own lobby');
ok(await host.evaluate(() => document.body.classList.contains('nb-host') && window._nearbyMode === 'host'), 'host role set');
ok(await visible(host, '#nb-add-btn') && await visible(host, '#nb-board-btn'), 'host header: Add a player + scoreboard');

await host.click('#nb-add-btn');
ok(await until(host, () => { const c = document.querySelector('#nb-dialog canvas.nb-qr'); return !!(c && c.width > 100); }, 20000), 'Add a player: the invitation QR code is drawn');
await until(host, () => [...document.querySelectorAll('#nb-dialog .inv-sbtn')].some(b => /Copy/.test(b.textContent)));
await host.evaluate(() => [...document.querySelectorAll('#nb-dialog .inv-sbtn')].find(b => /Copy/.test(b.textContent)).click());
await host.waitForTimeout(300);
const offerLink = await host.evaluate(() => navigator.clipboard.readText());
ok(/#lan-offer=/.test(offerLink), 'Copy link: the invitation link is on the clipboard (' + offerLink.length + ' characters)');

const guest = await phone('Guesty');
await guest.click('#lan-dir-btn');
await guest.click('.lan-dd-item.nearby');
await guest.click('#nb-join-btn');
ok(await until(guest, () => !!document.querySelector('#nb-dialog .nb-input')), 'Join a game: the reader opens (scan or paste)');
await guest.fill('#nb-dialog .nb-input', offerLink);
await guest.press('#nb-dialog .nb-input', 'Enter');
ok(await until(guest, () => { const c = document.querySelector('#nb-dialog canvas.nb-qr'); return !!(c && c.width > 100); }, 20000), 'the guest\'s answer QR code is drawn');
ok(/Hosty/.test(await guest.evaluate(() => document.getElementById('nb-body').textContent)), 'the guest sees whose game it is');
await until(guest, () => [...document.querySelectorAll('#nb-dialog .inv-sbtn')].some(b => /Copy/.test(b.textContent)));
await guest.evaluate(() => [...document.querySelectorAll('#nb-dialog .inv-sbtn')].find(b => /Copy/.test(b.textContent)).click());
await guest.waitForTimeout(300);
const answerLink = await guest.evaluate(() => navigator.clipboard.readText());
ok(/#lan-answer=/.test(answerLink), 'the answer link is on the guest\'s clipboard');

await host.fill('#nb-dialog .nb-input', answerLink);
await host.press('#nb-dialog .nb-input', 'Enter');
ok(await until(guest, () => document.getElementById('s-lobby').classList.contains('active'), 30000), 'paired: the guest is in the host\'s lobby');
ok(await until(host, () => /Player connected|✓/.test((document.getElementById('nb-body') || {}).textContent || '') || document.getElementById('nb-dialog').style.display === 'none', 15000), 'the host sees the player connected');
ok(await guest.evaluate(() => window._nearbyMode === 'guest' && !document.body.classList.contains('nb-host')), 'guest role set');
ok(!(await visible(guest, '#nb-add-btn')) && await visible(guest, '#nb-board-btn'), 'guest header: scoreboard only');
ok(await until(host, () => Object.values(window.PthState.players || {}).includes('Guesty'), 15000), 'the host knows the guest by name');

// Lobby chat, guest → host.
await guest.evaluate(() => { document.getElementById('chat-in').value = 'hello nearby'; window.App.sendChat(); });
ok(await until(host, () => /hello nearby/.test(document.getElementById('chat').textContent), 15000), 'lobby chat crosses the link');

// The evening scoreboard opens (empty for now).
await guest.click('#nb-board-btn');
ok(await until(guest, () => !!document.querySelector('#nb-board-body .stat-empty, #nb-board-body .board-list')), 'the scoreboard window opens');
await guest.evaluate(() => window.NearbyUI.closeDialog());

// A table across the link: the host creates it with the usual form, the
// guest joins from his lobby, the host starts with bots, both are dealt in.
await host.evaluate(() => { window.App.openCreatePage(); });
await host.waitForTimeout(800);
await host.evaluate(() => { const mp = document.getElementById('cf-players'); if (mp) mp.value = '3'; window.App.createGame(); });
ok(await until(guest, () => Object.keys(window.PthState.games || {}).length === 1, 20000), 'the host creates a table: it shows in the guest\'s lobby');
const gid = await guest.evaluate(() => +Object.keys(window.PthState.games)[0]);
await guest.evaluate((id) => window.App.joinGame(id), gid);
ok(await until(host, () => Object.values(window.PthState.seatData || {}).length >= 2 || (window.PthState.games[Object.keys(window.PthState.games)[0]] || {}).players >= 2, 20000), 'the guest joins the host\'s table');
await host.evaluate(() => window.App.startWithBots());
ok(await until(guest, () => window.PthState._gameStarted && Array.isArray(window.PthState.myCards) && window.PthState.myCards[0] != null, 30000), 'the game starts: the guest is dealt his own cards');
ok(await until(host, () => window.PthState._gameStarted && Array.isArray(window.PthState.myCards) && window.PthState.myCards[0] != null, 30000), '…and so is the host');
const cardsDiffer = await Promise.all([host.evaluate(() => window.PthState.myCards.join()), guest.evaluate(() => window.PthState.myCards.join())]);
ok(cardsDiffer[0] !== cardsDiffer[1], 'host and guest hold different cards');

// The host leaves: the guest is told and offered to pair again.
await host.evaluate(() => window.App.disconnect());
ok(await host.evaluate(() => !window._nearbyMode && !document.body.classList.contains('nb-on')), 'the host leaves: his server stops, roles cleared');
ok(await until(guest, () => document.getElementById('s-connect').classList.contains('active') && document.getElementById('nb-dialog').style.display !== 'none', 30000),
  'the guest is back on the login screen with the join dialog');
ok(/2 minutes/.test(await guest.evaluate(() => document.getElementById('nb-body').textContent)), '…telling him the link was lost');

// The admin switch hides the entry.
const off = await phone('Nobody');
await off.evaluate(() => { window._pthFeatureOff = { nearby_play: true }; window.LanDirUI.sync(); });
ok(await off.evaluate(() => (getComputedStyle(document.getElementById('lan-dir')).display === 'none' || !document.querySelector('#lan-dir-sel option[value="__nearby__"]'))
  && !document.body.classList.contains('lan-nearby')), 'admin switch nearby_play off → no « Play nearby » entry');

ok(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await browser.close(); server.close();
console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
