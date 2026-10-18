// Admin › Community in a real DOM, since web.128.
// Run: node scripts/test-admin-community.mjs   (needs jsdom)
//
// Leaderboard: tiles, one sortable table, the board picker. Polls: tiles, one
// card per poll with its bars, the editor below. Broadcasts: tiles, one card
// per scheduled message. LAN directory: tiles, a filter and « show » chips.
// Every call is stubbed.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'public', 'admin.html'), 'utf8');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push(e.message));

const NOW = Date.now();
const CANNED = {
  '/admin/whoami': { ok: true, master: true, scopes: [] },
  '/admin/status': { ok: true, version: '2.1.10-web.128', uptimeSec: 60, sockets: 0, resetPeriod: 'weekly', update: {} },
  '/admin/lan-boards': { ok: true, resetPeriod: 'weekly', defaultPlayers: 4, boards: [{ id: 'lan_bbbbbb01', name: 'Berlin', host: 'berlin.example.org', port: 7234, visible: true, resetPeriod: 'off', players: 1 }] },
  '/stats': { 'Ann': { net: 1200, gamesWon: 4, gamesPlayed: 10, handsWon: 50, handsPlayed: 200, bestStreak: 3 },
              '<img src=x>': { net: -50, gamesWon: 9, gamesPlayed: 9, handsWon: 10, handsPlayed: 20, bestStreak: 0 },
              'Carla': { net: 300, gamesWon: 1, gamesPlayed: 5, handsWon: 90, handsPlayed: 300, bestStreak: 8 },
              'Dan': { net: 0, gamesWon: 0, gamesPlayed: 0, handsWon: 0, handsPlayed: 0 } },
  '/admin/polls': { ok: true, polls: [
    { id: 'p1', enabled: true, 'default': 'en', question: { en: 'Next <b>feature</b>?', fr: 'Ensuite ?' }, options: [{ id: 'o1', label: { en: 'Tournaments' } }, { id: 'o2', label: { en: 'Bots' } }], tally: { o1: 3, o2: 1 }, total: 4, updatedAt: NOW },
    { id: 'p2', enabled: false, 'default': 'fr', question: { fr: 'Thème ?' }, options: [{ id: 'o1', label: { fr: 'Oui' } }, { id: 'o2', label: { fr: 'Non' } }], tally: { o1: 0, o2: 0 }, total: 0 } ] },
  '/admin/config': { ok: true, welcome: { enabled: true, 'default': 'en', langs: {} }, guestNotice: { enabled: false, 'default': 'en', langs: {} },
    authNotice: { enabled: false, 'default': 'en', langs: {} }, lanNotice: { enabled: true, 'default': 'en', langs: {} } },
  '/admin/broadcasts': { ok: true, serverNow: NOW, tz: 'UTC', lanTargets: [],
    jobs: [{ id: 'bc_1', message: 'Club <i>night</i>', icon: '', target: 'all', schedule: { type: 'daily', time: '20:00' }, enabled: true, runCount: 5, nextRun: NOW + 36e5 },
           { id: 'bc_2', message: 'Old one', icon: '', target: 'pthnet', schedule: { type: 'daily', time: '21:00' }, enabled: false, runCount: 2, maxRuns: 4 }] },
  '/admin/lan-directory': { ok: true, settings: { acceptRequests: false, checkMinutes: 5 }, pending: [{ id: 'lan_p1', name: 'New', host: 'n.example.org', port: 7234, submittedAt: NOW, probe: {} }], refused: [], limits: {}, ipCap: {},
    entries: [{ id: 'lan_a1', name: 'Club Lyon', host: 'lyon.example.org', port: 7234, country: 'FR', visible: true, status: { online: true, players: 6 }, lastSeen: NOW },
              { id: 'lan_a2', name: 'Berlin', host: 'berlin.example.org', port: 7234, country: 'DE', visible: true, status: { online: false }, lastSeen: NOW - 864e5 },
              { id: 'lan_a3', name: 'Hidden', host: 'h.example.org', port: 7234, visible: false, status: { online: true, players: 2 }, lastSeen: NOW }] },
};
const posts = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', url: 'https://example.org/admin', virtualConsole: vc, pretendToBeVisual: true,
  beforeParse(w) {
    w.fetch = (url, opts) => {
      if (opts && opts.method === 'POST') { try { posts.push({ url: String(url), body: JSON.parse(opts.body) }); } catch (e) {} }
      const p = String(url).split('?')[0];
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(CANNED[p] || { ok: true }), text: () => Promise.resolve('') });
    };
    w.confirm = () => true;
    w.localStorage.setItem('pth_admin_tok', 'test-token');
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
  },
});
const { window } = dom;
const doc = window.document;
const $ = (id) => doc.getElementById(id);
const tiles = (id) => [...doc.querySelectorAll('#' + id + ' .ovmode')].map((m) => [...m.children].map((c) => c.textContent.trim()).join(' ')).join(' | ');
const tick = (ms) => new Promise((r) => setTimeout(r, ms || 60));
await tick(400);

// ── Leaderboard ───────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="board"]').click();
await tick(200);
ok(errors.length === 0, 'opening Leaderboard throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const lb = () => [...doc.querySelectorAll('#players .lbrow:not(.lhd)')];
ok(lb().length === 4, 'one row per player');
ok(lb().map((r) => r.querySelector('.lbrk').textContent).join(',') === '1,2,3,4', 'ranked by net');
ok(/Ann/.test(lb()[0].textContent) && lb()[0].querySelector('.lbrk.rk1'), 'the leader gets the first medal');
ok(!doc.querySelector('#players img') && /<img src=x>/.test($('players').textContent), 'a player name is text, never markup');
ok(/4 \/ 10/.test(lb()[0].textContent) && /40% of games/.test(lb()[0].textContent), 'games won out of played, with the share');
ok(lb()[0].querySelector('.lbnet.pos') && doc.querySelector('#players .lbnet.neg'), 'net in green or red');
const tt = tiles('lbTiles');
ok(/Players 4 default board/.test(tt) && /Leader \+1,200 Ann/.test(tt) && /Best streak 8 Carla/.test(tt) && /Reset Weekly/.test(tt), 'tiles: players, leader, best streak, reset (' + tt + ')');
ok(/4 players · by net/.test($('boardcount').textContent), 'the head note says the order');
doc.querySelector('#players .lbsort[data-k="gw"]').click();
ok(/^.*<img src=x>/.test(lb()[0].querySelector('.lbname').textContent) && lb()[0].querySelector('.lbrk').textContent === '4', 'a header sorts by its column, the rank stays the board\'s');
ok(/by games won/.test($('boardcount').textContent) && window.localStorage.getItem('pth_admin_lb_sort') === 'gw', 'said and remembered');
doc.querySelector('#players .lbsort[data-k="net"]').click();
$('boardFilter').value = 'car';
$('boardFilter').dispatchEvent(new window.Event('input'));
ok(lb().length === 1 && /Carla/.test(lb()[0].textContent) && /1 of 4 players/.test($('boardcount').textContent), 'the filter narrows the rows');
$('boardFilter').value = '';
$('boardFilter').dispatchEvent(new window.Event('input'));
lb()[0].querySelector('.lact .del').click();
await tick();
ok(posts.some((p) => p.url === '/stats' && p.body.name === 'Ann' && p.body._delete), 'Remove posts the player');
ok($('boardPickRow').style.display !== 'none' && $('boardSel').options.length === 2, 'the board picker shows when LAN boards exist');
$('boardSel').value = 'lan_bbbbbb01';
$('boardSel').dispatchEvent(new window.Event('change'));
await tick(150);
ok(/Reset Never set in LAN directory/.test(tiles('lbTiles')) && /Players 4 Berlin/.test(tiles('lbTiles')), 'a LAN board shows its own name and reset');

// ── Polls ─────────────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="polls"]').click();
await tick(200);
ok(errors.length === 0, 'opening Polls throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const pl = () => [...doc.querySelectorAll('#plList > .plrow')];
ok(pl().length === 2, 'one card per poll');
ok(pl()[0].classList.contains('live') && pl()[0].querySelector('.plbadge.on').textContent === 'Live', 'the live poll is marked');
ok(/Next <b>feature<\/b>\?/.test(pl()[0].querySelector('.plq').textContent) && !pl()[0].querySelector('.plq *'), 'the question is text, never markup');
ok(/2 languages: en, fr/.test(pl()[0].textContent) && /4 answers/.test(pl()[0].textContent), 'languages and answers as chips');
const bars = pl()[0].querySelectorAll('.plbar');
ok(bars.length === 2 && bars[0].classList.contains('ahead') && !bars[1].classList.contains('ahead'), 'one bar per option, the one ahead marked');
ok(bars[0].querySelector('.pltrack i').style.width === '75%' && /3 · 75%/.test(bars[0].textContent), 'bars in percent of the answers');
ok(!pl()[1].querySelector('.plbar.ahead'), 'no option is ahead without answers');
const pt = tiles('plTiles');
ok(/Live poll · answers 4/.test(pt) && /Ahead 75% Tournaments/.test(pt) && /Polls 2 1 inactive/.test(pt), 'tiles: the live poll, the option ahead, the polls (' + pt + ')');
ok(!doc.querySelector('#plTiles b b'), 'a tile shows the question as text');
ok(/2 polls · one live/.test($('plSum').textContent), 'the head note');
[...pl()[1].querySelectorAll('.plact .use')].find((b) => b.textContent === 'Activate').click();
await tick();
ok(posts.some((p) => /\/admin\/polls\/activate/.test(p.url) && p.body.id === 'p2' && p.body.enabled === true), 'Activate posts the poll');
[...pl()[0].querySelectorAll('.plact .use')].find((b) => b.textContent === 'Edit').click();
ok($('plFormTitle').textContent === 'Edit poll' && $('plQuestion').value === 'Next <b>feature</b>?', 'Edit loads the poll into the editor below');
ok(doc.querySelectorAll('#plOpts .ploptrow').length === 2 && doc.querySelector('#plOpts .plnum').textContent === '1', 'options are numbered');
$('plNew').click();
ok($('plFormTitle').textContent === 'New poll' && $('plQuestion').value === '', '+ New poll clears the editor');
ok(doc.getElementById('plForm').compareDocumentPosition($('plList')) & window.Node.DOCUMENT_POSITION_PRECEDING, 'the list comes first, the editor below');
// ── Broadcasts ────────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="broadcast"]').click();
await tick(250);
ok(errors.length === 0, 'opening Broadcasts throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const bc = () => [...doc.querySelectorAll('#bcList > .bcrow')];
ok(bc().length === 2, 'one card per scheduled message');
ok(bc()[0].querySelector('.plbadge.on').textContent === 'Active' && bc()[1].classList.contains('off') && /Paused/.test(bc()[1].textContent), 'active and paused are marked');
ok(/Club <i>night<\/i>/.test(bc()[0].querySelector('.plq').textContent) && !bc()[0].querySelector('.plq *'), 'the message is text, never markup');
ok(/Daily at 20:00/.test(bc()[0].textContent) && /→ All modes/.test(bc()[0].textContent) && /5 sent/.test(bc()[0].textContent), 'schedule, target and count as chips');
ok(/2\/4 sent/.test(bc()[1].textContent) && /→ pokerth\.net/.test(bc()[1].textContent), 'a capped message shows its cap');
const bt = tiles('bcTiles');
ok(/Scheduled 1 1 paused/.test(bt) && /Sent 7/.test(bt) && /Notices on 2 \/ 4 Welcome, LAN/.test(bt) && /Next send .*Club <i>night<\/i>/.test(bt), 'tiles: scheduled, next send, sent, notices on (' + bt + ')');
ok(!doc.querySelector('#bcTiles i'), 'a tile shows the message as text');
ok(/2 messages · 1 active/.test($('bcSum').textContent), 'the head note');
[...bc()[1].querySelectorAll('.use')].find((b) => b.textContent === 'Enable').click();
await tick();
ok(posts.some((p) => /\/admin\/broadcasts\/toggle/.test(p.url) && p.body.id === 'bc_2' && p.body.enabled === true), 'Enable posts the message');

// ── LAN directory ─────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="landir"]').click();
await tick(250);
ok(errors.length === 0, 'opening LAN directory throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const lt = tiles('ldTiles');
ok(/Listed 2 of 3 in the directory/.test(lt) && /Online 2 checked every 5 min/.test(lt) && /Players now 8/.test(lt) && /Waiting 1 requests are closed/.test(lt), 'tiles: listed, online, players, waiting (' + lt + ')');
const vis = () => [...doc.querySelectorAll('#ldEntries tr[data-id]')].filter((r) => !r.hidden).map((r) => r.getAttribute('data-id')).join(',');
ok(vis() === 'lan_a1,lan_a2,lan_a3', 'every server shows at first');
doc.querySelector('#ldShow [data-ls="on"]').click();
ok(vis() === 'lan_a1,lan_a3', 'Online keeps the servers that answer');
doc.querySelector('#ldShow [data-ls="hid"]').click();
ok(vis() === 'lan_a3' && window.localStorage.getItem('pth_admin_ld_show') === 'hid', 'Not listed keeps the hidden ones, and is remembered');
doc.querySelector('#ldShow [data-ls="all"]').click();
$('ldFilter').value = 'germany';
$('ldFilter').dispatchEvent(new window.Event('input'));
ok(vis() === 'lan_a2', 'the filter finds a server by country');
$('ldFilter').value = 'nothing-here';
$('ldFilter').dispatchEvent(new window.Event('input'));
ok(vis() === '' && /No server matches/.test($('ldEntries').textContent), 'nothing found says so');
$('ldFilter').value = '';
$('ldFilter').dispatchEvent(new window.Event('input'));
ok(!doc.querySelector('#ldEntries .ldnomatch') && vis().split(',').length === 3, 'and clearing it brings every row back');
ok(errors.length === 0, 'nothing threw' + (errors.length ? ': ' + errors[0] : ''));

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
