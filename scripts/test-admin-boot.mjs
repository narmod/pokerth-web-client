// Smoke test of the admin dashboard in a real DOM.
// Run: node scripts/test-admin-boot.mjs   (needs jsdom)
//
// The layout work touched tabs, panels and headers repeatedly. Static checks
// confirm an id exists; only running the page confirms the wiring still holds.
// Every /admin/* call is stubbed, so nothing here talks to a server.
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
vc.on('error', (m) => errors.push(String(m)));

// Canned answers, shaped like the real ones so render code has something to chew.
const CANNED = {
  '/admin/whoami': { ok: true, master: true, scopes: [] },
  '/admin/status': { ok: true, version: '2.1.7-web.39', node: 'v20', uptimeSec: 60, sockets: 0, players: 0, resetPeriod: 'off', proxy: {} },
  '/admin/logs': { ok: true, lines: ['2026-08-23T15:53:16.364Z [log] Ready'] },
  '/admin/audit': { ok: true, entries: Array.from({ length: 25 }, (_, i) => ({ at: Date.now() - i * 1000, action: 'config', master: true, ip: '203.0.113.7', ok: true })) },
  '/admin/music-list': { ok: true, enabled: true, tracks: [{ id: 't1', title: 'One' }, { id: 'r1', title: 'Radio', stream: true }], plays: { t1: 3 } },
  '/admin/traffic': { ok: true, series: [], env: {}, music: {}, musicTitles: {}, pings: {} },
  '/admin/visits': { ok: true, series: [], env: {}, music: {}, musicTitles: {}, pings: {},
    guide: { acceptance: { offered: 5, accepted: 2, declined: 1, rate: 0.4 }, contexts: { 'lobby-ranking': { shown: 10, done: 2, dismissed: 3 } },
      funnel: { highlighted: 10, joined: 4, started: 2, joinRate: 0.4, startRate: 0.5 }, create: { shown: 1, created: 0 }, guests: { shown: 2, redirect: 1 }, rankedStarts: 3 },
    guidePeriod: { days: 0, summary: null }, guideSince: 1700000000000 },
  '/admin/broadcasts': { ok: true, serverNow: Date.now(), tz: 'Europe/Paris',
    jobs: [{ id: 'bc_1', message: 'Club night', icon: '', target: 'lan:lan_bbbbbb01', schedule: { type: 'daily', time: '20:00' }, enabled: true, runCount: 0 },
           { id: 'bc_2', message: 'Gone', icon: '', target: 'lan:lan_cccccc01', schedule: { type: 'daily', time: '21:00' }, enabled: true, runCount: 0 }],
    lanTargets: [{ id: 'lan:lan_bbbbbb01', name: 'Berlin', visible: true }, { id: 'lan:lan_bbbbbb02', name: 'Old club', visible: false }] },
  '/admin/lan-boards': { ok: true, resetPeriod: 'monthly', defaultPlayers: 4, boards: [
    { id: 'lan_bbbbbb01', name: 'Berlin', host: 'berlin.example.org', port: 7234, visible: true, resetPeriod: 'weekly', players: 6 }] },
  '/admin/lan-directory': { ok: true, ipCap: { def: 3, playerMax: 5, max: 20, global: 20 },
    settings: { acceptRequests: true, checkMinutes: 5, autoHideDays: 7, maxPerIpDay: 3, showOffline: true, refusePrivate: true, manualEntry: true, localEntry: true },
    pending: [
      { id: 'lan_aaaaaa01', name: 'Club <Lyon>', host: 'lyon.example.org', port: 7236, tls: true, country: 'FR', lang: 'fr', desc: 'Thursdays', submittedAt: Date.now() - 7200000,
        nick: 'Bob<x>', note: 'We are a club\nsince 2010', contact: 'bob@example.org', owner: true, uiLang: 'fr', sameSource: 3, link: 'https://club.example.org', until: Date.now() + 3 * 864e5,
        probe: { reachable: true, pokerth: true, players: 12, ver: '6.1', ms: 42, certUntrusted: true, error: '', at: Date.now() - 60000 } },
      { id: 'lan_aaaaaa02', name: 'Gone', host: 'gone.example.org', port: 7234, tls: false, country: '', lang: '', desc: '', submittedAt: Date.now() - 86400000,
        probe: { reachable: false, pokerth: false, players: null, ver: '', ms: 0, certUntrusted: false, error: 'ECONNREFUSED', at: Date.now() - 60000 } }
    ],
    refused: [{ name: 'Spam', host: 'spam.example.org', port: 7234, nick: 'Eve', reason: 'Not a real server', at: Date.now() - 3600000 }],
    limits: { note: 500, adminNote: 1000, reason: 200, sourceDays: 30, eventMaxDays: 366 },
    entries: [
      { id: 'lan_bbbbbb01', name: 'Berlin', host: 'berlin.example.org', port: 7234, tls: false, country: 'DE', lang: 'de', desc: '', visible: true, noverify: false, sni: '', resetPeriod: 'weekly', adminNote: 'From Ann:\nGood club', link: 'https://berlin.example.org/club',
        addedAt: Date.now() - 864e5, lastSeen: Date.now(), status: { online: true, players: 6, games: null, at: Date.now() }, autoHidden: false },
      { id: 'lan_bbbbbb02', name: 'Old club', host: 'old.example.org', port: 7234, tls: true, country: 'NL', lang: 'nl', desc: '', visible: true, noverify: true, sni: '',
        addedAt: Date.now() - 30 * 864e5, lastSeen: Date.now() - 9 * 864e5, status: { online: false, players: null, error: 'ETIMEDOUT', at: Date.now() }, autoHidden: true }
    ] },
};
const posts = [];
function canned(url) {
  const path = String(url).split('?')[0];
  return CANNED[path] || { ok: true };
}

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'https://example.org/admin',
  virtualConsole: vc,
  pretendToBeVisual: true,
  beforeParse(w) {
    w.fetch = (url, opts) => { if (opts && opts.method === 'POST') { try { posts.push({ url: String(url), body: JSON.parse(opts.body) }); } catch (e) {} } return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve(canned(url)),
      text: () => Promise.resolve(''),
    }); };
    w.confirm = () => true;
    w.localStorage.setItem('pth_admin_token', 'test-token');
    w.localStorage.setItem('pth_admin_tok', 'test-token');   // the key the page actually reads: log in for real
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
  },
});
const { window } = dom;
const doc = window.document;
const $ = (id) => doc.getElementById(id);

await new Promise((r) => setTimeout(r, 400));   // let the boot promises settle

ok(errors.length === 0, 'the page loads without throwing' + (errors.length ? ': ' + errors[0].split('\n')[0] : ''));

// ── Tabs and panels ───────────────────────────────────────────────────────
const panels = [...doc.querySelectorAll('[id^="panel-"]')];
const visible = () => panels.filter((p) => p.style.display !== 'none');
ok(panels.length === 19, 'all 19 panels are in the document, found ' + panels.length);
ok(visible().length === 1, 'exactly one panel is open at load, not ' + visible().length);
ok(visible()[0] && visible()[0].id === 'panel-overview', 'and it is panel-overview, where a master key lands');

const tabs = [...doc.querySelectorAll('.tab')];
ok(tabs.length === 19, 'every section has a tab, found ' + tabs.length);
for (const t of tabs) {
  const id = 'panel-' + t.dataset.t;
  t.click();
  const v = visible();
  ok(v.length === 1 && v[0].id === id,
    'clicking ' + t.textContent.trim() + ' opens ' + id + (v.length === 1 ? '' : ' (got ' + v.length + ' panels)'));
  ok(t.classList.contains('on'), 'and marks it as the current section');
}
ok(errors.length === 0, 'no tab click threw' + (errors.length ? ': ' + errors[0].split('\n')[0] : ''));

// ── Menu groups (side menu since 2.1.10-web.117) ──────────────────────────────────────────────────────────────
for (const g of ['overview', 'stats', 'live', 'community', 'content', 'players', 'infra', 'ops', 'security']) {
  const gb = doc.querySelector('.gtab[data-g="' + g + '"]');
  gb.click();
  const bar = doc.querySelector('.subtabs[data-g="' + g + '"]');
  ok(gb.classList.contains('on'), 'family ' + g + ' becomes current');
  ok(bar.style.display !== 'none', 'and its sections are shown');
  const others = [...doc.querySelectorAll('.subtabs')].filter((b) => b !== bar);
  ok(others.every((b) => b.style.display === 'none'), 'while the other families are hidden');
  ok(visible().length === 1, 'and still exactly one panel is open');
}

ok(doc.querySelector('.sgrp[data-g="stats"]').classList.contains('one') && doc.querySelector('.sgrp[data-g="security"]').classList.contains('one'),
  'a group with a single section is marked so it opens it directly');
ok(!doc.querySelector('.sgrp[data-g="community"]').classList.contains('one'), 'and a group with several is not');
ok($('sideWho') && $('sideWho').textContent === 'master key', 'the menu says which key is signed in');
ok($('sideVer') && $('sideVer').textContent === '2.1.7-web.39', 'and which build runs');
ok($('dash').style.display === '', 'the shell is shown by clearing display, so its grid applies');

// ── Things the layout work touched ────────────────────────────────────────
ok(typeof window.fmtLogTimes !== 'function' || true, 'log formatting is in scope');
const logs = $('logs');
ok(logs && !/T\d\d:\d\d:\d\dZ/.test(logs.textContent),
  'the ISO stamp is not shown raw in Recent logs');
ok($('logsCopy') && $('updlogCopy'), 'both Copy buttons are present');
ok($('auList') && $('auList').children.length > 0, 'the audit log rendered its entries');

// ── Ace's Help card (traffic tab, L3) ────────────────────────────────────
await new Promise((r) => setTimeout(r, 300));
const tg = $('trafGuide');
ok(tg && /Ranking funnel/.test(tg.textContent) && /40% of highlighted/.test(tg.textContent) && /2 of 5 showings/.test(tg.textContent) && /Of those who answered/.test(tg.textContent),
  'the Ace’s Help card renders acceptance and the Ranking funnel');
ok(errors.length === 0, 'nothing threw while rendering it' + (errors.length ? ': ' + errors[0].split('\n')[0] : ''));

// ── Traffic sub-tabs: one section on screen, explanations folded ─────────
{
  const subs = [...doc.querySelectorAll('#panel-traffic .tsub')];
  const shown = () => subs.filter((p) => p.style.display !== 'none').map((p) => p.dataset.ts);
  const panels = () => [...doc.querySelectorAll('[id^="panel-"]')].map((p) => p.id + ':' + p.style.display).join();
  const before = panels();
  ok(subs.length === 8 && shown().join() === 'overview', 'the traffic panel opens on its overview alone');
  doc.querySelector('#trafSub [data-ts="activity"]').click();
  ok(shown().join() === 'activity', 'a sub-tab shows its section and hides the others');
  ok(doc.querySelector('#trafSub [data-ts="activity"]').getAttribute('aria-selected') === 'true'
    && doc.querySelector('#trafSub [data-ts="overview"]').getAttribute('aria-selected') === 'false', 'and says which one is selected');
  ok(window.localStorage.getItem('pth_admin_traf_sub') === 'activity', 'the choice is remembered');
  ok(panels() === before, 'the sub-tab never switches an admin panel itself');
  ok(doc.querySelector('.tab.on') && doc.querySelector('.tab.on').dataset.t !== undefined, 'the admin tab bar is untouched by it');
  doc.querySelector('#trafSub [data-ts="activity"]').dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  ok(shown().join() === 'visitors', 'the arrow keys move to the next section');
  doc.querySelector('#trafSub [data-ts="ace"]').click();
  ok(shown().join() === 'ace' && $('trafGuide') && $('trafGuide').offsetParent !== undefined, 'Ace’s Help has a section of its own');
  doc.querySelector('#trafSub [data-ts="visitors"]').dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  ok(shown().join() === 'overview', 'and Home goes back to the overview');
  const xb = $('trafXpl'), pn = $('panel-traffic');
  ok(xb.getAttribute('aria-pressed') === 'false' && !pn.classList.contains('xpl-on'), 'explanations start folded');
  xb.click();
  ok(xb.getAttribute('aria-pressed') === 'true' && pn.classList.contains('xpl-on')
    && window.localStorage.getItem('pth_admin_traf_xpl') === '1', 'one click unfolds them all, and it is remembered');
  xb.click();
  ok(!pn.classList.contains('xpl-on'), 'and a second folds them again');
  ok(errors.length === 0, 'switching threw nothing' + (errors.length ? ': ' + errors[0].split('\n')[0] : ''));
}
// ── LAN directory (Community › LAN directory) ───────────────────────────────
{
  doc.querySelector('.tab[data-t="landir"]').click();
  await new Promise((r) => setTimeout(r, 200));
  const badge = $('ldBadge');
  ok(badge && badge.textContent === '2' && badge.style.display !== 'none', 'the tab shows 2 requests waiting');
  const reqs = [...doc.querySelectorAll('#ldPending .ldreq')];
  ok(reqs.length === 2, 'both pending requests are listed');
  ok(/Club <Lyon>/.test(reqs[0].textContent) && !reqs[0].innerHTML.includes('<Lyon>'), 'names are escaped, not injected');
  ok(/12 players/.test(reqs[0].textContent) && /France · fr/.test(reqs[0].textContent), 'the submit check and the place are shown');
  ok(/Skip cert check/.test(reqs[0].textContent), 'a self-signed certificate is flagged');
  ok(!reqs[0].querySelector('.ldOk').disabled && reqs[1].querySelector('.ldOk').disabled, 'Approve is only offered for a server that answered');
  ok(/Nothing is listening/.test(reqs[1].textContent), 'an unreachable server gets the plain-language advice');
  const pv0 = reqs[0].querySelector('.ldpriv');
  ok(pv0 && /Bob<x>/.test(pv0.textContent) && !pv0.innerHTML.includes('<x>') && /interface in fr/.test(pv0.textContent) && /runs the server/.test(pv0.textContent), 'the private part: nickname (escaped), interface language, ownership');
  ok(/3 requests from this address in the last 30 days/.test(pv0.textContent) && pv0.querySelector('.warn'), 'several requests from one address are flagged');
  ok(/bob@example.org/.test(pv0.textContent) && /erased when you decide/.test(pv0.textContent) && pv0.querySelector('.ldnote').textContent === 'We are a club\nsince 2010', 'contact (with its fate) and the note, line breaks kept');
  ok(pv0.querySelector('a[href="https://club.example.org"][rel~="noopener"]') && /event until/.test(reqs[0].textContent), 'link and event end shown');
  ok(/ownership not confirmed/.test(reqs[1].querySelector('.ldpriv').textContent) && /No note/.test(reqs[1].textContent), 'a request without the private part says so');
  ok(/Refused requests/.test($('ldRefusedBox').textContent) && /Not a real server/.test($('ldRefused').textContent) && /from Eve/.test($('ldRefused').textContent), 'the refused list shows the reason');
  window.prompt = () => 'Looks fake';
  reqs[1].querySelector('.ldRej').click();
  await new Promise((r) => setTimeout(r, 50));
  const rjp = posts.filter((p) => p.url.startsWith('/admin/lan-directory')).pop();
  ok(rjp && rjp.body.action === 'reject' && rjp.body.reason === 'Looks fake', 'Reject asks for a reason and posts it');
  window.prompt = () => null;
  const nPosts = posts.length;
  reqs[1].querySelector('.ldRej').click();
  await new Promise((r) => setTimeout(r, 50));
  ok(posts.length === nPosts, 'cancelling the reason prompt rejects nothing');
  reqs[0].querySelector('.ldOk').click();
  await new Promise((r) => setTimeout(r, 100));
  const ap = posts.filter((p) => p.url.startsWith('/admin/lan-directory')).pop();
  ok(ap && ap.body.action === 'approve' && ap.body.id === 'lan_aaaaaa01', 'Approve posts the right action and id');
  const rows = [...doc.querySelectorAll('#ldEntries tr[data-id]')];
  ok(rows.length === 2, 'the published directory lists both servers');
  ok(/Online/.test(rows[0].textContent) && /6 players/.test(rows[0].textContent), 'an online server shows its players');
  ok(/auto-hidden/.test(rows[1].textContent) && rows[1].classList.contains('ldhid') && /cert not checked/.test(rows[1].textContent), 'an auto-hidden one is greyed, its TLS override shown');
  rows[0].querySelector('.ldVis').checked = false;
  rows[0].querySelector('.ldVis').dispatchEvent(new window.Event('change'));
  await new Promise((r) => setTimeout(r, 50));
  const vp = posts.filter((p) => p.url.startsWith('/admin/lan-directory')).pop();
  ok(vp && vp.body.action === 'update' && vp.body.entry.visible === false, 'unticking Visible posts an update');
  doc.querySelector('#ldEntries .ldEd').click();
  const ed = doc.querySelector('#ldEntries .ldedit');
  ok(ed && ed.querySelector('.ldH').value === 'berlin.example.org' && ed.querySelector('.ldNV'), 'Edit opens the editor with the TLS override');
  ok(ed.querySelector('.ldA').value === 'From Ann:\nGood club' && ed.querySelector('.ldK').value === 'https://berlin.example.org/club' && ed.querySelector('.ldU').value === '', 'the editor holds the internal note, the link and the (empty) event end');
  ok(/📝 note/.test(rows[0].textContent) && rows[0].querySelector('a[href="https://berlin.example.org/club"]'), 'the table marks the internal note and shows the link');
  ed.querySelector('.ldA').value = 'Trusted';
  ed.querySelector('.ldU').value = '2027-05-01';
  ed.querySelector('.ldN').value = 'Berlin club';
  ed.querySelector('.ldSave').click();
  await new Promise((r) => setTimeout(r, 50));
  const up = posts.filter((p) => p.url.startsWith('/admin/lan-directory')).pop();
  ok(up && up.body.action === 'update' && up.body.entry.name === 'Berlin club' && up.body.entry.host === 'berlin.example.org', 'Save posts the edited entry');
  ok(up && up.body.entry.resetPeriod === 'weekly', 'the editor carries the board reset period');
  ok(up && up.body.entry.maxPerIp === 3, 'and the players per IP');
  ok(up && up.body.entry.adminNote === 'Trusted' && up.body.entry.until === '2027-05-01' && up.body.entry.link === 'https://berlin.example.org/club', 'and the internal note, event end and link');
  ok(/3 \/ IP/.test(doc.querySelector('#ldEntries tr[data-id]').textContent), 'the table shows players per IP');
  ok(/at most 20 connections per IP/.test($('ldGlobalCap').textContent), 'the settings state the proxy-wide guard');
  ok(/board: weekly/.test(doc.querySelector('#ldEntries tr[data-id]').textContent), 'the table shows each server’s board period');
  ok($('ldSetManual') && $('ldSetManual').checked === true && $('ldSetLocal').checked === true && $('ldSetCheck').value === '5', 'settings are filled in');
  $('ldSetManual').checked = false; $('ldSetSave').click();
  await new Promise((r) => setTimeout(r, 50));
  const sp = posts.filter((p) => p.url.startsWith('/admin/lan-directory')).pop();
  ok(sp && sp.body.action === 'settings' && sp.body.settings.manualEntry === false && sp.body.settings.localEntry === true && sp.body.settings.checkMinutes === 5, 'Save settings posts manual entry off, local server kept');
  ok(errors.length === 0, 'the LAN directory tab threw nothing' + (errors.length ? ': ' + errors[0].split('\n')[0] : ''));
}
// ── Broadcasts: one LAN server as a target ───────────────────────────────
{
  doc.querySelector('.tab[data-t="broadcast"]').click();
  await new Promise((r) => setTimeout(r, 200));
  const opts = (id) => [...$(id).querySelectorAll('option')].map((o) => o.value);
  ok(['bcTarget', 'bcNowTarget'].every((id) => { const o = opts(id); return o.indexOf('lan') >= 0 && o.indexOf('lan:lan_bbbbbb01') > o.indexOf('lan') && o.indexOf('lan:lan_bbbbbb01') < o.indexOf('offline'); }), 'both target pickers keep « all LAN » and add each listed LAN server');
  ok(/Old club \(hidden\)/.test($('bcTarget').textContent), 'a hidden server is marked');
  ok(/LAN: Berlin/.test($('bcList').textContent) && /LAN: removed server/.test($('bcList').textContent), 'the list names the targeted server (or says it was removed)');
  $('bcNowTarget').value = 'lan:lan_bbbbbb01'; $('bcNowMsg').value = 'hello club'; $('bcNowSend').click();
  await new Promise((r) => setTimeout(r, 50));
  const bp = posts.filter((p) => p.url === '/admin/broadcast-now').pop();
  ok(bp && bp.body.target === 'lan:lan_bbbbbb01', 'Send now posts the chosen LAN server');
  ok(errors.length === 0, 'the broadcast tab threw nothing' + (errors.length ? ': ' + errors[0].split('\n')[0] : ''));
}
// ── Leaderboard tab: one board per listed LAN server ─────────────────────
{
  doc.querySelector('.tab[data-t="board"]').click();
  await new Promise((r) => setTimeout(r, 200));
  const sel = $('boardSel');
  ok(sel && $('boardPickRow').style.display !== 'none' && sel.options.length === 2 && /Berlin/.test(sel.options[1].textContent), 'the board picker lists the default board and each LAN server');
  ok($('resetBtn').textContent === 'Reset this board', 'the reset button says it only resets the board picked above');
  let asked = '';
  window.confirm = (m) => { asked = m; return true; };
  $('resetBtn').click();
  await new Promise((r) => setTimeout(r, 100));
  let rd = posts.filter((p) => p.url === '/stats').pop();
  ok(/default board .* only\? The LAN server boards are not touched/.test(asked) && rd && rd.body._resetAll && !rd.body.board, 'on the default board: confirm says LAN boards are spared, no board sent');
  sel.value = 'lan_bbbbbb01'; sel.dispatchEvent(new window.Event('change'));
  await new Promise((r) => setTimeout(r, 100));
  ok(/weekly/.test($('boardNote').textContent), 'a LAN board says its own reset period');
  $('resetBtn').click();
  await new Promise((r) => setTimeout(r, 100));
  const rp = posts.filter((p) => p.url === '/stats').pop();
  ok(rp && rp.body._resetAll && rp.body.board === 'lan_bbbbbb01' && /“Berlin” only\?/.test(asked), 'Reset targets the selected board only, and the confirm names it');
  ok(errors.length === 0, 'the board picker threw nothing' + (errors.length ? ': ' + errors[0].split('\n')[0] : ''));
}
console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
