#!/usr/bin/env node
// The players' page (/tournament) in a real browser, through a real proxy
// that runs the tournament service: the list, a tournament, registration with
// the personal code kept in the browser, unregistration, a private tournament
// opened with its invitation code, the language picker, the check-in of an
// Official tournament.
// Needs Chromium (Playwright). PW_CHROMIUM=<path> picks a binary; without a
// browser the test says so and stops without failing.
// Run: node tournament/test/test-td-public-browser.mjs   (SHOTS=<dir> keeps screenshots)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { freePort } from '../../scripts/lib/free-port.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(path.join(root, 'package.json'));
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.log('No browser engine available (playwright missing): skipped.'); process.exit(0); }

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'td-pubb-'));
const F = (x) => path.join(tmp, x);
fs.writeFileSync(F('admin-config.json'), JSON.stringify({ tournaments: { enabled: true } }));
const PORT = await freePort(), TOKEN = 'pubb-token';
const env = Object.assign({}, process.env, {
  PORT: String(PORT), ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN, RATE_LIMIT_DISABLED: '1',
  ADMIN_CONFIG_FILE: F('admin-config.json'), VISITS_FILE: F('v.json'), STATS_FILE: F('s.json'), STATS_META_FILE: F('sm.json'),
  BROADCASTS_FILE: F('b.json'), POLLS_FILE: F('p.json'), DB_CONFIG_FILE: F('db.json'), DEPLOY_HISTORY_FILE: F('d.json'),
  SCOPED_TOKENS_FILE: F('st.json'), AUDIT_FILE: F('a.json'), LAN_BOARDS_FILE: F('lb.json'), TD_DIR: F('td'),
});
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, env, stdio: 'ignore' });
const base = 'http://127.0.0.1:' + PORT;
const A = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };
const admin = async (p, b) => (await fetch(base + '/admin/tournaments' + p, { method: 'POST', headers: A, body: JSON.stringify(b) })).json();
let up = false;
for (let i = 0; i < 80 && !up; i++) { await wait(200); try { up = ((await (await fetch(base + '/admin/tournaments/settings', { headers: A })).json()).service || {}).status === 'running'; } catch (e) {} }

let browser = null;
const exe = process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
try { browser = await chromium.launch(exe ? { executablePath: exe } : {}); } catch (e) { console.log('No browser engine available: skipped.'); proxy.kill('SIGTERM'); fs.rmSync(tmp, { recursive: true, force: true }); process.exit(0); }
const shots = process.env.SHOTS || null;

try {
  ok(up, 'proxy and tournament service up');
  const cup = await admin('/t/create', { name: 'Friday night cup', profile: 'club', server: { ref: 'local', name: 'Local server', host: '127.0.0.1', port: 7234 }, startsAt: Date.now() + 2 * 3600e3, run: { autoOpen: true } });
  await admin('/t/player', { id: cup.id, nick: 'Bob' });
  const secret = await admin('/t/create', { name: 'Members only', profile: 'club', visibility: 'private' });

  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, locale: 'en-US' });
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('pageerror', (e) => errors.push(e.message));
  await pg.goto(base + '/tournament');
  await pg.waitForSelector('.tcard', { timeout: 8000 });
  const list = await pg.textContent('#view');
  ok(/Open for registration/.test(list) && /Friday night cup/.test(list) && !/Members only/.test(list), 'list: the public tournament under « Open for registration », not the private one');
  if (shots) await pg.screenshot({ path: path.join(shots, 'pub-list.png'), fullPage: true });
  await pg.click('.tcard');
  await pg.waitForSelector('#regForm', { timeout: 8000 });
  ok(new URL(pg.url()).pathname === '/tournament/t/' + cup.publicKey, 'a tournament has its own address');
  ok(/How it works/.test(await pg.textContent('#view')) && /1\/10 players/.test(await pg.textContent('#view')), 'tournament: how it works, players');
  await pg.fill('#regNick', 'Alice');
  await pg.click('#regForm button');
  await pg.waitForSelector('[data-copy]', { timeout: 8000 });
  const msg = await pg.textContent('#view');
  const code = (/Your personal code: ([A-Z2-9]{8})/.exec(msg) || [])[1];
  ok(/You are registered as Alice/.test(msg) && !!code, 'register: done, the personal code shown');
  const stored = await pg.evaluate(() => localStorage.getItem('pth_td_regs'));
  ok(stored && stored.indexOf(code) >= 0, 'the code is kept in this browser');
  ok(/Alice\s*you/.test(await pg.textContent('.chips')), 'the list marks « you »');
  if (shots) await pg.screenshot({ path: path.join(shots, 'pub-registered.png'), fullPage: true });
  await pg.click('[data-unreg="Alice"]');
  await pg.waitForFunction(() => /no longer registered/.test(document.getElementById('view').textContent), null, { timeout: 8000 });
  ok(!/Alice/.test(await pg.textContent('.chips')), 'unregister: one click, with the code kept here');

  // Private: the invitation code opens it.
  await pg.goto(base + '/tournament/t/' + secret.publicKey);
  await pg.waitForSelector('#invForm', { timeout: 8000 });
  ok(/private/i.test(await pg.textContent('#view')), 'private: asks for the invitation code');
  await pg.fill('#invIn', secret.inviteCode);
  await pg.click('#invForm button');
  await pg.waitForSelector('#regForm', { timeout: 8000 });
  ok(/Members only/.test(await pg.textContent('#view')), 'private: open with its code');

  // Languages: the app's list, the page follows.
  const opts = await pg.$$eval('#langSel option', (o) => o.map((x) => x.value));
  ok(opts.length >= 80 && opts.indexOf('fr') >= 0, 'language picker: every language of the app (' + opts.length + ')');
  const fr = fs.existsSync(path.join(root, 'tournament', 'public', 'lang', 'fr.mjs')) ? (await import(path.join(root, 'tournament', 'public', 'lang', 'fr.mjs'))).strings : null;
  if (fr) {
    await pg.selectOption('#langSel', 'fr');
    await pg.waitForFunction((tt) => document.getElementById('heroTitle').textContent === 'Members only' && document.documentElement.lang === 'fr', fr.title, { timeout: 8000 });
    ok((await pg.textContent('#view')).indexOf(fr.howTitle) >= 0 && await pg.evaluate(() => localStorage.getItem('pth_lang')) === 'fr', 'French: the page and the app share the choice');
    await pg.selectOption('#langSel', 'ar');
    await pg.waitForFunction(() => document.documentElement.dir === 'rtl', null, { timeout: 8000 });
    ok(true, 'Arabic: right to left');
    if (shots) await pg.screenshot({ path: path.join(shots, 'pub-ar.png'), fullPage: true });
    await pg.selectOption('#langSel', 'en');
  }
  // Official: check-in with the code kept in this browser, one click.
  const off = await admin('/t/create', { name: 'Official night', profile: 'official' });
  await pg.goto(base + '/tournament/t/' + off.publicKey);
  await pg.waitForSelector('#regForm', { timeout: 8000 });
  ok(/Confirm your presence below/.test(await pg.textContent('.how')) && /0 of 0 players checked in/.test(await pg.textContent('#ckCard')), 'Official: how it works has the check-in step; the check-in card');
  await pg.fill('#regNick', 'Zoe');
  await pg.click('#regForm button');
  await pg.waitForSelector('[data-ckin="Zoe"]', { timeout: 8000 });
  ok(/check in before the start/.test(await pg.textContent('#view')), 'Official: the code is needed for the check-in, the page says so');
  await pg.click('[data-ckin="Zoe"]');
  await pg.waitForFunction(() => /Zoe is checked in/.test(document.getElementById('view').textContent), null, { timeout: 8000 });
  ok(/Zoe\s*checked in/.test(await pg.textContent('.chips')) && /1 of 1 players checked in/.test(await pg.textContent('#ckCard')) && !(await pg.$('[data-ckin]')), 'check-in: one click, the list shows « checked in »');
  if (shots) await pg.screenshot({ path: path.join(shots, 'pub-checkin.png'), fullPage: true });
  ok(errors.length === 0, 'no script error' + (errors.length ? ': ' + errors[0] : ''));

  // A QML player sends his log after the game (manual result here).
  {
    const { buildPdb } = await import('./lib/td-pdb-fixture.mjs');
    const q = await admin('/t/create', { name: 'Log night', profile: 'official', run: { qmlWitnesses: true } });   // an organizer validates: still open to witnesses
    for (const nk of ['Ann', 'Bob', 'Cat']) await admin('/t/player', { id: q.id, nick: nk });
    await admin('/t/result', { id: q.id, source: 'manual', ranking: ['Ann', 'Cat', 'Bob'] });
    const lp = await buildPdb([{ uniqueGameId: 1, gameId: 7, startMoney: 1000, seats: ['Ann', 'Bob', 'Cat'], hands: [
      { cash: { 1: 1000, 2: 1000, 3: 1000 } }, { cash: { 1: 1500, 2: 500, 3: 1000 } }, { cash: { 1: 2000, 3: 1000 }, actions: [[1, 'wins game']] }] }]);
    const lf = path.join(tmp, 'pokerth-log.pdb');
    fs.writeFileSync(lf, lp);
    await pg.goto(base + '/tournament/t/' + q.publicKey);
    await pg.waitForSelector('#logBox', { timeout: 8000 });
    await pg.click('#logBox summary');
    await pg.fill('#logNick', 'Bob');
    await pg.setInputFiles('#logFile', lf);
    await pg.click('#logForm button');
    await pg.waitForFunction(() => /Log of Bob received: agrees/.test(document.getElementById('view').textContent), null, { timeout: 8000 });
    ok(/Bob\s*agrees\s*log/.test(await pg.textContent('#view')), 'QML player: the log sent from the page, compared, listed as « log »');
    if (shots) await pg.screenshot({ path: path.join(shots, 'pub-log.png'), fullPage: true });
  }

  // Organizer: the director's chat language, every language of the app.
  const og = await ctx.newPage();
  await og.addInitScript((t) => { try { localStorage.setItem('pth_admin_tok', t); } catch (e) {} }, TOKEN);
  await og.goto(base + '/tournament/organize');
  await og.waitForFunction(() => document.getElementById('tChatLang') && document.getElementById('tChatLang').options.length > 1, null, { timeout: 8000 });
  const cl = await og.$$eval('#tChatLang option', (o) => o.map((x) => x.value));
  ok(cl.length >= 80 && cl.indexOf('fr') >= 0 && cl.indexOf('pt-br') >= 0 && cl.indexOf('en') >= 0, 'organizer: the chat language offers every language of the app (' + cl.length + ')');
  await og.close();

  // Phone.
  const ph = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'light' });
  const pp = await ph.newPage();
  await pp.goto(base + '/tournament/t/' + cup.publicKey);
  await pp.waitForSelector('#regForm', { timeout: 8000 });
  const wide = await pp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  ok(wide, 'phone: no sideways scroll');
  if (shots) await pp.screenshot({ path: path.join(shots, 'pub-phone.png'), fullPage: true });
} finally {
  await browser.close();
  proxy.kill('SIGTERM');
  await wait(200);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
