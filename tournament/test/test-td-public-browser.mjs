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

  // Several tables: the tournament's page lists its tables, each with its page.
  {
    const m = await admin('/t/create', { name: 'Big night', profile: 'club', format: 'multi', run: { finalists: 2 } });
    for (let i = 1; i <= 14; i++) await admin('/t/player', { id: m.id, nick: 'M' + i });
    await admin('/t/draw', { id: m.id });
    await pg.goto(base + '/tournament/t/' + m.publicKey);
    await pg.waitForFunction(() => /Table 2/.test(document.getElementById('view').textContent), null, { timeout: 8000 });
    const txt = await pg.textContent('#view');
    ok(/Tables/.test(txt) && /Table 1/.test(txt) && /the first 2 of each table play the final table/.test(txt), 'several tables: the tables listed, how the final is made');
    await pg.click('a.tcard[href*="/tournament/t/"]');
    await pg.waitForFunction(() => /Table 1 of « Big night »/.test(document.getElementById('view').textContent), null, { timeout: 8000 });
    ok(true, 'a table\'s page links back to « Big night »');
    if (shots) await pg.screenshot({ path: path.join(shots, 'pub-table.png'), fullPage: true });
  }

  // A cup: listed on the start page, its standings with the points.
  {
    const c1 = await admin('/t/create', { name: 'League night', profile: 'club' });
    for (const nk of ['Lia', 'Max', 'Noa']) await admin('/t/player', { id: c1.id, nick: nk });
    await admin('/t/result', { id: c1.id, source: 'manual', ranking: ['Max', 'Lia', 'Noa'] });
    const cup = await admin('/cups/create', { name: 'Winter league', bestOf: 4, description: 'Every Friday' });
    await admin('/cups/event', { id: cup.id, tournamentId: c1.id });
    await pg.goto(base + '/tournament');
    await pg.waitForSelector('a.tcard[href*="/tournament/c/"]', { timeout: 8000 });
    ok(/Cups/.test(await pg.textContent('#view')) && /Winter league/.test(await pg.textContent('#view')), 'start page: the cups');
    await pg.click('a.tcard[href*="/tournament/c/"]');
    await pg.waitForFunction(() => /Standings/.test(document.getElementById('view').textContent), null, { timeout: 8000 });
    const ct = await pg.textContent('#view');
    ok(/Only the 4 best results/.test(ct) && /Max\s*3/.test(ct) && /Lia\s*2/.test(ct) && /League night/.test(ct), 'cup page: the rules, the standings (Max 3, Lia 2), its tournaments');
    if (shots) await pg.screenshot({ path: path.join(shots, 'pub-cup.png'), fullPage: true });
    await pg.click('a.tcard[href*="/tournament/t/"]');
    await pg.waitForFunction(() => /Part of the cup « Winter league »/.test(document.getElementById('view').textContent), null, { timeout: 8000 });
    ok(true, 'a tournament\'s page links to its cup');
  }

  // Images: the thumbnail on the cards, the picture at the top of the page.
  {
    await pg.goto(base + '/tournament');
    await pg.waitForSelector('a.tcard.has-img img.tc-img', { timeout: 8000 });
    const th = await pg.$$eval('a.tcard.has-img img.tc-img', (l) => l.map((i) => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 })));
    ok(th.length > 0 && th.every((x) => x.ok) && th.some((x) => /tournament\.t\.jpg/.test(x.src)) && th.some((x) => /cup\.t\.jpg/.test(x.src)), 'start page: tournaments and cups with their thumbnail');
    await pg.click('a.tcard[href*="/tournament/c/"]');
    await pg.waitForFunction(() => document.getElementById('heroImg').classList.contains('evimg') && /cup\.jpg/.test(document.getElementById('heroImg').src) && document.getElementById('heroImg').naturalWidth === 800, null, { timeout: 8000 });
    ok(true, 'a cup\'s page: its picture at the top');
    if (shots) await pg.screenshot({ path: path.join(shots, 'pub-cup-img.png') });
    await pg.click('a[href="/tournament"]');
    await pg.waitForFunction(() => !document.getElementById('heroImg').classList.contains('evimg') && /\/tournament\/avatar/.test(document.getElementById('heroImg').src), null, { timeout: 8000 });
    ok(true, 'back to the list: the director\'s avatar again');
  }

  // Medals: after the nicknames of a ranking, and a page per player.
  {
    const m = await admin('/t/create', { name: 'Medal night', profile: 'club' });
    for (const nk of ['Max', 'Lia', 'Noa', 'Zed']) await admin('/t/player', { id: m.id, nick: nk });
    await admin('/t/result', { id: m.id, source: 'manual', ranking: ['Max', 'Lia', 'Noa', 'Zed'] });
    await pg.goto(base + '/tournament/t/' + m.publicKey);
    await pg.waitForFunction(() => { const s = document.querySelector('#view .md[data-nick="Max"]'); return s && /🥇/.test(s.textContent); }, null, { timeout: 8000 });
    const zed = await pg.textContent('#view .md[data-nick="Zed"]');
    ok(zed === '', 'ranking: a medal after the winner, none after the 4th');
    await pg.click('#view a.nick[href$="/p/Max"]');
    await pg.waitForFunction(() => /Medal night/.test(document.getElementById('view').textContent) && /Medals/.test(document.getElementById('view').textContent), null, { timeout: 8000 });
    const pt = await pg.textContent('#view');
    ok(new URL(pg.url()).pathname === '/tournament/p/Max' && /gold\s*1/.test(pt) && /1 of 4/.test(pt) && /League night/.test(pt), 'player page: the medal (1 of 4), and every result (League night, no medal: 3 players)');
    if (shots) await pg.screenshot({ path: path.join(shots, 'pub-player.png'), fullPage: true });
    const cors = await fetch(base + '/tournament/api/badges?nicks=Max,Zed', { headers: { Origin: 'https://example.org' } });
    const cj = await cors.json();
    ok(cors.headers.get('access-control-allow-origin') === '*' && cj.v === 1 && cj.players.Max && !cj.players.Zed, 'the medals API through the web client: any origin, versioned');
  }

  // Organizer: the director's chat language, every language of the app.
  const og = await ctx.newPage();
  await og.addInitScript((t) => { try { localStorage.setItem('pth_admin_tok', t); } catch (e) {} }, TOKEN);
  await og.goto(base + '/tournament/organize');
  await og.waitForFunction(() => document.getElementById('tChatLang') && document.getElementById('tChatLang').options.length > 1, null, { timeout: 8000 });
  const cl = await og.$$eval('#tChatLang option', (o) => o.map((x) => x.value));
  // Table settings: the web client's create-game choices (styles, templates, manual blinds).
  await og.waitForFunction(() => document.querySelector('#tTable .tform .tf-style'), null, { timeout: 8000 });
  const styles = await og.$$eval('#tTable .tf-style', (l) => l.map((x) => x.textContent.trim()));
  const tpls = await og.$$eval('#tt_tpl option', (l) => l.map((x) => x.textContent));
  ok(styles.length === 6 && /Relaxed/.test(styles[0]) && /BBC/.test(styles[5]) && tpls.length === 10 && tpls[1] === 'BBC Step 1' && tpls[9] === 'WEC Grand Final', 'organizer: the six game styles and the nine community templates of the web client');
  await og.evaluate(() => { const d = document.getElementById('tTable').closest('details'); if (d) d.open = true; });
  await og.click('#tTable .tf-style[data-style="bbc"]');
  ok(await og.$eval('#tt_startMoney', (e) => e.value) === '5000' && await og.$eval('input[name="tt_rm"][value="minutes"]', (e) => e.checked) && await og.$eval('#tt_raiseEvery', (e) => e.value) === '5', 'organizer: style « BBC » fills 5000, every 5 minutes');
  await og.selectOption('#tt_tpl', 'BBC Step 3');
  ok(await og.$$eval('#tTable .tf-chip', (l) => l.length) === 30 && await og.$eval('input[name="tt_mb"][value="1"]', (e) => e.checked) && await og.$eval('#tt_firstSmallBlind', (e) => e.value) === '25', 'organizer: template « BBC Step 3 » fills its 30 manual blinds');
  await og.click('#tTable .tf-chip[data-mbdel="25000"]');
  ok(await og.$$eval('#tTable .tf-chip', (l) => l.length) === 29 && await og.$eval('#tt_tpl', (e) => e.value) === '', 'organizer: a level removed by hand: « Custom settings »');
  if (shots) await og.locator('#tTable').screenshot({ path: path.join(shots, 'org-table.png') });

  // Images: picked in the form, added to the library by an organizer.
  await og.evaluate(() => { const d = document.getElementById('tImg').closest('details'); if (d) d.open = true; });
  await og.waitForFunction(() => document.querySelectorAll('#tImg .ip-opt').length >= 2, null, { timeout: 8000 });
  ok(await og.$eval('#tImg .ip-opt.on', (b) => b.dataset.img) === 'tournament', 'organizer: the tournament image chosen by default');
  await og.evaluate(() => { const d = document.querySelector('#tImg .ip-add'); if (d) d.open = true; });
  await og.fill('#tim_new_n', 'Felt night');
  await og.setInputFiles('#tim_new_f', path.join(root, 'tournament', 'public', 'img', 'director-avatar.png'));
  await og.click('#tImg [data-ipadd]');
  await og.waitForFunction(() => /Image added/.test((document.querySelector('#tImg [data-ipmsg]') || {}).textContent || ''), null, { timeout: 8000 });
  const lib = await (await fetch(base + '/admin/tournaments/images', { headers: A })).json();
  const felt = lib.images.find((x) => x.name === 'Felt night');
  ok(felt && await og.$eval('#tImg .ip-opt.on', (b) => b.dataset.img) === felt.id, 'organizer: an image added (made into a JPEG in the page) and chosen');
  ok(await og.$$eval('#tImg .ip-opt img', (l) => l.every((i) => i.complete && i.naturalWidth > 0)), 'organizer: every thumbnail shows');
  if (shots) await og.locator('#tImg').screenshot({ path: path.join(shots, 'org-images.png') });

  // The director's avatar: one of the robots, no image of one's own.
  ok(!(await og.$('#avFile')), 'organizer: no upload of an avatar of one\'s own');
  await og.click('#avReset');
  await og.waitForFunction(() => /Back to the default robot/.test(document.getElementById('avMsg').textContent), null, { timeout: 8000 });
  // The four robots: shown, the default marked; a click picks one.
  await og.waitForFunction(() => document.querySelectorAll('#avPick img').length === 4 && [...document.querySelectorAll('#avPick img')].every((i) => i.complete && i.naturalWidth === 96), null, { timeout: 8000 });
  ok(await og.$eval('#avPick .avopt.on', (b) => b.dataset.preset) === '3' && await og.$$eval('#avPick img', (l) => new Set(l.map((i) => i.src)).size) === 4, 'organizer: the four robots (four different images), robot 3 marked by default');
  await og.click('#avPick button[data-preset="2"]');
  await og.waitForFunction(() => /Robot 2 chosen/.test(document.getElementById('avMsg').textContent) && document.querySelector('#avPick .avopt.on[data-preset="2"]'), null, { timeout: 8000 });
  ok((await (await fetch(base + '/admin/tournaments/avatar', { headers: A })).json()).preset === 2, 'organizer: robot 2 picked with a click');
  if (shots) await og.locator('section:has(#avH)').screenshot({ path: path.join(shots, 'org-avatar.png') });
  await og.click('#avReset');
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
