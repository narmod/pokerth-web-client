#!/usr/bin/env node
// LAN directory, player side (modules/ui/lan-directory.mjs), in a real browser
// against the real proxy.js and a fake PokerTH server that answers with a
// genuine AnnounceMessage:
//   1. the LAN form lists the approved servers (online first, offline greyed
//      with ○), the first one fills #host / #port and locks the address fields;
//   2. « Enter an address… » unlocks them and opens the ⚙ block;
//   3. « Propose my server »: Send stays disabled until the test passes for
//      the values on screen, editing the address disables it again, the
//      request lands in the admin queue and the dialog says thanks;
//   4. manual entry off: no « Enter an address… », fields stay hidden;
//   5. the drop-down and the dialog follow the language (French).
// Plus the pure planner (plan / normalizeConfig) without a browser.
// Run: node scripts/test-lan-directory-browser.mjs   (needs Playwright Chromium)
import net from 'net';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { chromium } from 'playwright';
import * as P from '../public/proto/index.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let fails = 0, checks = 0;
function ok(cond, label) { checks++; console.log((cond ? '  ✓ ' : '  ✗ ') + label); if (!cond) fails++; }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── pure planner ───────────────────────────────────────────────────
console.log('Planner');
const M = await import(pathToFileURL(path.join(root, 'public/modules/ui/lan-directory.mjs')).href);
const A = { id: 'a', name: 'A', host: 'a.example.org', port: 7234, online: true, players: 3 };
const B = { id: 'b', name: 'B', host: 'b.example.org', port: 7236, tls: true, online: false };
const cfg = (o) => M.normalizeConfig(Object.assign({ acceptRequests: true, manualEntry: true, servers: [A, B] }, o));
ok(M.normalizeConfig(null) === null && M.normalizeConfig({}) === null, 'an old proxy (no directory) gives no config');
ok(M.normalizeConfig({ servers: [{ host: '', port: 1 }, { host: 'x', port: 0 }, A] }).servers.length === 1, 'malformed entries are dropped');
let p = M.plan({ cfg: cfg(), isLan: false });
ok(!p.show, 'not in LAN mode: nothing shown');
p = M.plan({ cfg: null, isLan: true });
ok(!p.show && !p.locked, 'no directory on this proxy: the form is unchanged');
p = M.plan({ cfg: M.normalizeConfig({ servers: [], manualEntry: true, acceptRequests: false }), isLan: true });
ok(!p.show && !p.locked, 'empty directory, manual entry on, requests closed: unchanged form');
p = M.plan({ cfg: M.normalizeConfig({ servers: [], manualEntry: true, acceptRequests: true }), isLan: true });
ok(p.show && !p.list && p.propose && !p.locked, 'empty directory, requests open: only « Propose my server »');
p = M.plan({ cfg: M.normalizeConfig({ servers: [], manualEntry: false, acceptRequests: true }), isLan: true });
ok(p.show && p.empty && p.locked, 'empty directory, manual entry off: « no server listed yet », fields hidden');
p = M.plan({ cfg: cfg(), isLan: true, host: 'b.example.org', port: '7236', remembered: true });
ok(p.select === 'b' && p.locked && !p.apply, 'the remembered address selects its entry');
p = M.plan({ cfg: cfg(), isLan: true, host: 'mybox', port: '7234', remembered: true });
ok(p.select === '__manual__' && !p.locked, 'a remembered address outside the list keeps manual entry');
p = M.plan({ cfg: cfg(), isLan: true, host: 'localhost', port: '7234', remembered: false });
ok(p.select === 'a' && p.apply && p.apply.id === 'a' && p.locked, 'first visit: the first (online) server is picked');
p = M.plan({ cfg: cfg({ manualEntry: false }), isLan: true, host: 'mybox', port: '7234', remembered: true });
ok(p.select === 'a' && p.locked && !p.manual, 'manual entry off: a stray address falls back to the list');
// « Local server » (web.44)
const LOC = { host: 'MyBox.lan', port: '7234', tls: false };
let L = M.withLocal(cfg({ localEntry: true }), LOC, 'Local server');
ok(L.servers[0].id === 'local' && L.servers[0].host === 'mybox.lan' && L.servers.length === 3, 'local server listed first, before the directory');
ok(M.withLocal(cfg(), LOC, 'x').servers.length === 2, 'not listed when the admin turned it off');
M.setConfig({ acceptRequests: true, manualEntry: false, localEntry: true, servers: [Object.assign({}, A, { id: 'lan_abcdef01', resetPeriod: 'weekly' })] });
ok(M.boardFor('a.example.org', '7234') === 'lan_abcdef01' && M.boardFor('mybox.lan', 7234) === '' , 'a listed server has its own board, the local / typed ones use the main board');
ok(M.boardInfo('lan_abcdef01').resetPeriod === 'weekly' && M.boardInfo('nope') === null, 'board info carries the reset period');
M.setConfig(null);
ok(M.normalizeConfig({ servers: [] }).localEntry === false, 'a proxy that does not send the switch gets no local entry');
ok(M.withLocal(cfg({ localEntry: true }), { host: 'a.example.org', port: 7234 }, 'x').servers.length === 2, 'no duplicate when a listed server has the same address');
p = M.plan({ cfg: L, isLan: true, host: 'mybox.lan', port: '7234', remembered: false });
ok(p.select === 'local' && p.locked, 'first visit on a self-hosted install: the local server is pre-selected');
p = M.plan({ cfg: M.withLocal(M.normalizeConfig({ servers: [], localEntry: true, manualEntry: false, acceptRequests: false }), LOC, 'x'), isLan: true, host: 'mybox.lan', port: '7234' });
ok(p.show && p.list && !p.empty && p.select === 'local', 'empty directory: the list still offers the local server');

// ── real proxy + fake PokerTH server ───────────────────────────────
function frame(buf) { const b = Buffer.alloc(4 + buf.length); b.writeUInt32BE(buf.length, 0); Buffer.from(buf).copy(b, 4); return b; }
const announce = P.PokerTHMessage.encode(P.PokerTHMessage.create({
  messageType: P.MessageType.Type_AnnounceMessage,
  announceMessage: { protocolVersion: { majorVersion: 6, minorVersion: 1 }, latestGameVersion: { majorVersion: 2, minorVersion: 1 },
    latestBetaRevision: 0, serverType: 0, numPlayersOnServer: 5 } })).finish();
const fake = net.createServer((s) => { s.write(frame(announce)); s.on('error', () => {}); });
await new Promise((r) => fake.listen(0, '127.0.0.1', r));
const FAKE = fake.address().port;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lan-ui-'));
const cfgFile = path.join(tmp, 'admin-config.json');
fs.writeFileSync(cfgFile, JSON.stringify({ lanDirectory: {
  settings: { refusePrivate: false, manualEntry: true, localEntry: false, checkMinutes: 1 },
  entries: [
    { id: 'lan_aaaaaa01', name: 'Club local', host: '127.0.0.1', port: FAKE, tls: false, country: 'FR', lang: 'fr', desc: 'Thursday nights', visible: true, addedAt: 1, lastSeen: 0 },
    { id: 'lan_aaaaaa02', name: 'Gone club', host: 'gone.invalid', port: FAKE, tls: false, visible: true, addedAt: 1, lastSeen: Date.now() - 3600000 }
  ] } }));
const PORT = 18000 + Math.floor(Math.random() * 900);
const TOKEN = 'ui-' + Math.random().toString(36).slice(2);
const env = { PORT: String(PORT), ALLOWED_PORTS: String(FAKE), STATS_ADMIN_TOKEN: TOKEN, ADMIN_CONFIG_FILE: cfgFile };
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'DEPLOY_HISTORY_FILE', 'DB_CONFIG_FILE'])
  env[k] = path.join(tmp, k.toLowerCase() + '.json');
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js')], { cwd: root, env: Object.assign({}, process.env, env), stdio: ['ignore', 'pipe', 'pipe'] });
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; });
proxy.stderr.on('data', (d) => { plog += d; });
const base = 'http://127.0.0.1:' + PORT;
for (let i = 0; i < 80 && !/Ready/.test(plog); i++) await sleep(100);
// First health check runs 10 s after start: wait for it so the statuses are real.
await sleep(11500);

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_lang', 'en'); localStorage.setItem('pth_bak_auto', '0'); } catch (e) {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/');
  await page.waitForSelector('.login-card');
  await page.click('.login-card[onclick*="lan-dedi"]');
  await page.waitForSelector('#lan-dir-sel', { state: 'visible', timeout: 5000 }).catch(() => {});
  await sleep(500);

  console.log('LAN drop-down');
  const st = await page.evaluate(() => ({
    shown: getComputedStyle(document.getElementById('lan-dir')).display !== 'none',
    opts: [...document.querySelectorAll('#lan-dir-sel option')].map((o) => o.value + '=' + o.textContent),
    val: document.getElementById('lan-dir-sel').value,
    host: document.getElementById('host').value, port: document.getElementById('port').value,
    locked: document.body.classList.contains('lan-dir-locked'),
    detail: document.getElementById('lan-dir-detail').textContent
  }));
  ok(st.shown, 'the LAN form shows the server list');
  ok(st.opts.length === 3 && /^lan_aaaaaa01=● Club local$/.test(st.opts[0]) && /=○ Gone club$/.test(st.opts[1]) && /^__manual__=Enter an address/.test(st.opts[2]),
    'online server first, offline one marked, names only, manual entry last (' + st.opts.join(' | ') + ')');
  ok(st.val === 'lan_aaaaaa01' && st.host === '127.0.0.1' && st.port === String(FAKE), 'the first server fills the address fields');
  ok(st.locked, 'and the address fields are locked (hidden)');
  ok(/Online · France · Français · Players: 5/.test(st.detail) && /Thursday nights/.test(st.detail), 'status line: online, country, language, players, description');
  ok(await page.evaluate(() => { const p = document.querySelector('#lan-dir-detail .lan-dir-reset'); return !!p && !document.querySelector('.lan-dir-pill') && /Leaderboard reset — Every month/.test(p.textContent); }), 'a plain line (no pill) gives the leaderboard reset period');
  await page.screenshot({ path: path.join(tmp, 'list.png') });

  await page.selectOption('#lan-dir-sel', '__manual__');
  await sleep(300);
  const man = await page.evaluate(() => ({
    locked: document.body.classList.contains('lan-dir-locked'),
    adv: getComputedStyle(document.getElementById('conn-advanced')).display !== 'none',
    hp: getComputedStyle(document.getElementById('f-hostport')).display !== 'none'
  }));
  ok(!man.locked && man.adv && man.hp, '« Enter an address… » unlocks the fields and opens the ⚙ block');
  await page.selectOption('#lan-dir-sel', 'lan_aaaaaa01');
  ok(await page.evaluate(() => document.body.classList.contains('lan-dir-locked')), 'picking a server locks them again');

  console.log('Propose my server');
  await page.click('#lan-dir-propose');
  await sleep(300);
  ok(await page.isVisible('#lan-prop-dialog'), 'the dialog opens');
  ok(await page.isDisabled('#lan-prop-send'), 'Send is disabled before any test');
  ok(await page.evaluate(() => document.querySelectorAll('#lan-prop-country option').length > 150 && document.querySelectorAll('#lan-prop-lang option').length > 50), 'country and language lists are filled');
  await page.fill('#lan-prop-name', 'My home club');
  ok(await page.inputValue('#lan-prop-reset') === 'monthly', 'leaderboard reset defaults to every month');
  await page.selectOption('#lan-prop-reset', 'weekly');
  ok(await page.inputValue('#lan-prop-ipcap') === '3' && (await page.$$eval('#lan-prop-ipcap option', (o) => o.map((x) => x.value).join())) === '1,2,3,4,5', 'players per IP: 3 by default, 1 to 5 in the form');
  await page.selectOption('#lan-prop-ipcap', '4');
  await page.fill('#lan-prop-host', 'localhost');
  await page.fill('#lan-prop-port', String(FAKE));
  await page.click('#lan-prop-test');
  await page.waitForSelector('#lan-prop-status.ok', { timeout: 8000 }).catch(() => {});
  ok(/PokerTH server reachable/.test(await page.textContent('#lan-prop-status')), 'the test finds the PokerTH server');
  ok(!(await page.isDisabled('#lan-prop-send')), 'Send is enabled after a passing test');
  await page.fill('#lan-prop-port', '7234');
  ok(await page.isDisabled('#lan-prop-send'), 'changing the port disables Send again');
  await page.fill('#lan-prop-port', String(FAKE));
  await page.click('#lan-prop-test');
  await page.waitForSelector('#lan-prop-status.ok', { timeout: 8000 }).catch(() => {});
  await page.screenshot({ path: path.join(tmp, 'propose.png') });
  await page.click('#lan-prop-send');
  await page.waitForSelector('#lan-prop-sent', { state: 'visible', timeout: 8000 }).catch(() => {});
  ok(/My home club/.test(await page.textContent('#lan-prop-sent-msg')), 'the dialog thanks the player, naming the server');
  const adm = await (await fetch(base + '/admin/lan-directory', { headers: { Authorization: 'Bearer ' + TOKEN } })).json();
  ok(adm.pending && adm.pending.length === 1 && adm.pending[0].name === 'My home club' && adm.pending[0].host === 'localhost', 'the request is in the admin queue');
  ok(adm.pending[0].resetPeriod === 'weekly', 'with the leaderboard reset period chosen in the form');
  ok(adm.pending[0].maxPerIp === 4, 'and the players per IP chosen in the form');
  const keys = await page.evaluate(() => Object.keys(localStorage).concat(Object.keys(sessionStorage)).filter((k) => /prop|lan[-_]?dir/i.test(k)));
  ok(keys.length === 0, 'nothing about the request is stored on the device' + (keys.length ? ' (' + keys.join(', ') + ')' : ''));
  await page.click('#lan-prop-sent .ld-btn');
  ok(!(await page.isVisible('#lan-prop-dialog')), 'Close shuts the dialog');

  console.log('Language');
  await page.evaluate(() => window.setLang && window.setLang('fr'));
  await sleep(1200);
  const fr = await page.evaluate(() => ({ lab: document.querySelector('#lan-dir-sel-wrap label').textContent, prop: document.querySelector('#lan-dir-propose').textContent, opt0: document.querySelector('#lan-dir-sel option').textContent, detail: document.getElementById('lan-dir-detail').textContent, pill: (document.querySelector('#lan-dir-detail .lan-dir-reset') || {}).textContent || '' }));
  ok(/Serveur LAN/i.test(fr.lab) && /Proposer mon serveur/.test(fr.prop) && !/Chaque mois/.test(fr.opt0) && /Chaque mois/.test(fr.pill) && !/Joueurs/.test(fr.opt0) && /Joueurs : 5/.test(fr.detail || ''), 'the block follows the language (' + fr.opt0 + ')');

  console.log('Manual entry off');
  await fetch(base + '/admin/lan-directory', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN }, body: JSON.stringify({ action: 'settings', settings: { manualEntry: false } }) });
  await page.reload();
  await page.waitForSelector('.login-card');
  await page.click('.login-card[onclick*="lan-dedi"]');
  await sleep(800);
  const off = await page.evaluate(() => ({ opts: [...document.querySelectorAll('#lan-dir-sel option')].map((o) => o.value), locked: document.body.classList.contains('lan-dir-locked') }));
  ok(off.opts.indexOf('__manual__') < 0 && off.locked, 'no « Enter an address… » and the fields stay hidden');

  console.log('Local server');
  await fetch(base + '/admin/lan-directory', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN }, body: JSON.stringify({ action: 'settings', settings: { localEntry: true } }) });
  await page.reload();
  await page.waitForSelector('.login-card');
  await page.click('.login-card[onclick*="lan-dedi"]');
  await sleep(800);
  const loc = await page.evaluate(() => ({
    opts: [...document.querySelectorAll('#lan-dir-sel option')].map((o) => o.value + '=' + o.textContent),
    val: document.getElementById('lan-dir-sel').value, host: document.getElementById('host').value, port: document.getElementById('port').value,
    locked: document.body.classList.contains('lan-dir-locked'), detail: document.getElementById('lan-dir-detail').textContent }));
  ok(/^local=★ Local server$/.test(loc.opts[0]) && loc.opts.length === 3, 'the local server comes first (' + loc.opts[0] + ')');
  ok(loc.val === 'local' && loc.host === '127.0.0.1' && loc.port === '7234' && loc.locked, 'and is pre-selected: the page host on 7234, fields hidden');
  ok(/Local server · 127\.0\.0\.1:7234/.test(loc.detail), 'its status line names it with its address');
  await page.screenshot({ path: path.join(tmp, 'local.png') });
  ok(errors.length === 0, 'no page error' + (errors.length ? ': ' + errors[0] : ''));
  if (process.env.LAN_SHOTS) { for (const f of ['list.png', 'propose.png', 'local.png']) fs.copyFileSync(path.join(tmp, f), path.join(process.env.LAN_SHOTS, f)); }
} finally {
  await browser.close();
  proxy.kill('SIGTERM');
  fake.close();
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}
if (fails) console.log(plog.split('\n').slice(-20).join('\n'));
console.log('\n' + (fails ? fails + ' FAILED' : 'All ' + checks + ' checks passed'));
process.exit(fails ? 1 : 0);
