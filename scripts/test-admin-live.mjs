// Admin › Live (Sessions and Errors) in a real DOM, since the web.127 redesign.
// Run: node scripts/test-admin-live.mjs   (needs jsdom)
//
// One table for every connection (bridges and notice channels), tiles by
// entry mode, a filter; error groups as cards with tiles, a filter and
// « Hide robot-only errors ». Every /admin/* call is stubbed.
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
const UA_AND = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36';
const UA_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
const UA_BOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const CANNED = {
  '/admin/whoami': { ok: true, master: true, scopes: [] },
  '/admin/status': { ok: true, version: '2.1.10-web.127', uptimeSec: 60, sockets: 0, update: {} },
  '/admin/sessions': { ok: true, now: NOW, maxClients: 500,
    bridges: [
      { id: 11, mode: 'pthnet', host: 'pthsrv.pokerth.net', port: 7236, tls: true, nick: 'Ann<b>', auth: true, cc: 'DE', ua: UA_WIN, ver: '2.1.10-web.126', ip: '203.0.113.x', startedAt: NOW - 65000, bIn: 2048, bOut: 4096, upstream: true, attached: true },
      { id: 12, mode: 'lan', host: 'club.example.org', port: 7234, tls: false, nick: '', cc: 'FR', ua: UA_AND, ver: '2.1.10-web.126', ip: '198.51.100.x', startedAt: NOW - 5000, bIn: 10, bOut: 20, upstream: true, attached: true, grace: true },
      { id: 13, mode: 'lan', host: 'other.example.org', port: 7234, startedAt: NOW - 3000, upstream: false },
    ],
    notify: [
      { id: 21, mode: 'pthnet', cc: 'BR', ua: UA_WIN, ver: '2.1.10-web.126', ip: '192.0.2.x', startedAt: NOW - 1000, attached: true },
      { id: 22, mode: 'offline', cc: 'JP', ua: UA_AND, startedAt: NOW - 900, attached: true },
      { id: 23, mode: 'pthnet', live: true, cc: 'ZZ', startedAt: NOW - 800, attached: false },
    ] },
  '/admin/errors': { ok: true, now: NOW, since: NOW - 864e5,
    groups: [
      { sig: 'a', msg: "TypeError: x is <undefined>", src: 'https://example.org/pokerth.js', line: 10, col: 2, stack: 'at f (pokerth.js:10:2)', first: NOW - 2 * 864e5, last: NOW - 60000, count: 7, vers: ['2.1.10-web.126', '2.1.10-web.125'], uas: [UA_WIN, UA_BOT], bots: 1, modes: ['pthnet', 'offline'], ips: 3, ipsMore: false },
      { sig: 'b', msg: 'Script error.', src: '', line: 0, col: 0, stack: '', first: NOW - 3 * 864e5, last: NOW - 3 * 864e5, count: 2, vers: [], uas: [UA_BOT], bots: 1, modes: [], ips: 1 },
    ] },
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
const tick = (ms) => new Promise((r) => setTimeout(r, ms || 60));
await tick(400);

// ── Sessions ──────────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="sessions"]').click();
await tick(150);
ok(errors.length === 0, 'opening Sessions throws nothing' + (errors.length ? ': ' + errors[0] : ''));
ok(!$('seBridges') && !$('seNotify'), 'the two old lists are gone, one table holds every connection');
const rows = () => [...doc.querySelectorAll('#seList .lrow:not(.lhd)')];
ok(rows().length === 6, 'six rows: three bridges and three notice channels, found ' + rows().length);
ok(doc.querySelectorAll('#seList .lhd').length === 1, 'with one header row');
const tiles = [...doc.querySelectorAll('#seTiles .setile')];
ok(tiles.length === 4, 'four tiles, one per entry mode');
const tn = (k) => doc.querySelector('#seTiles [data-sm="' + k + '"] .ovmn').textContent;
ok(tn('net') === '2' && tn('lan') === '2' && tn('off') === '1' && tn('live') === '1', 'Internet 2 · LAN 2 · Training 1 · Live 1 (' + ['net', 'lan', 'off', 'live'].map(tn).join(',') + ')');
ok(/1 through this proxy · 1 direct/.test($('seTiles').textContent), 'Internet splits bridged and direct');
ok(/on 2 servers/.test($('seTiles').textContent), 'LAN counts its servers');
ok(/6 connections · 3 bridges · 3 notice channels · cap 500/.test($('seSum').textContent), 'the head note counts everything');
const txt = $('seList').textContent;
ok(/Ann<b>/.test(txt) && !doc.querySelector('#seList b b'), 'a nickname is text, never markup');
ok(/Germany/.test(txt) && doc.querySelector('#seList img.ckf'), 'the country shows with its flag');
ok(/pthsrv\.pokerth\.net:7236 · TLS/.test(txt), 'a bridge says where it goes');
ok(/reconnect grace/.test(txt) && /connecting/.test(txt) && /detached/.test(txt), 'every state reads in words');
ok(/↑2\.0 KB ↓4\.0 KB/.test(txt), 'a bridge shows its traffic');
ok(/Spectator/.test(txt) && /Training/.test(txt) && /Direct client/.test(txt), 'notice channels say what they are');
ok(rows()[0].textContent.indexOf('Ann') >= 0, 'oldest connection first');
ok(rows().every((r) => r.querySelector('.lact .del')), 'every row can be disconnected');
rows()[0].querySelector('.lact .del').click();
await tick();
ok(posts.some((p) => /\/admin\/sessions/.test(p.url) && p.body.kick === 11), 'Disconnect posts the right id');

doc.querySelector('#seModes [data-sm="lan"]').click();
ok(rows().length === 2 && rows().every((r) => /LAN/.test(r.querySelector('.lmode').textContent)), 'the LAN chip keeps the LAN rows');
ok(doc.querySelector('#seTiles [data-sm="lan"]').classList.contains('on'), 'and its tile shows it');
doc.querySelector('#seTiles [data-sm="lan"]').click();
ok(rows().length === 6 && doc.querySelector('#seModes [data-sm="all"]').classList.contains('on'), 'the same tile clicked again goes back to All');
doc.querySelector('#seTiles [data-sm="off"]').click();
ok(rows().length === 1 && /Training/.test(rows()[0].textContent), 'a tile filters too');
ok(window.localStorage.getItem('pth_admin_se_mode') === 'off', 'the choice is remembered');
doc.querySelector('#seModes [data-sm="all"]').click();
$('seFilter').value = 'brazil';
$('seFilter').dispatchEvent(new window.Event('input'));
ok(rows().length === 1 && /Brazil/.test(rows()[0].textContent), 'the filter finds a country by name');
$('seFilter').value = 'android';
$('seFilter').dispatchEvent(new window.Event('input'));
ok(rows().length === 2, 'and a device');
$('seFilter').value = 'zzzz';
$('seFilter').dispatchEvent(new window.Event('input'));
ok(/No connection matches/.test($('seList').textContent), 'nothing found says so');
$('seFilter').value = '';
$('seFilter').dispatchEvent(new window.Event('input'));

// ── Errors ────────────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="errors"]').click();
await tick(150);
ok(errors.length === 0, 'opening Errors throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const cards = () => [...doc.querySelectorAll('#erList > .errow')];
ok(cards().length === 2, 'one card per error group');
const et = $('erTiles').textContent;
ok(/Distinct errors\s*2/.test(et) && /Occurrences\s*9/.test(et) && /Last 24 h\s*1/.test(et) && /Robots only\s*1/.test(et), 'tiles: 2 distinct, 9 occurrences, 1 recent, 1 robot-only (' + et.replace(/\s+/g, ' ') + ')');
ok(/2 distinct errors · 9 occurrences/.test($('erSum').textContent), 'the head note counts them');
const c0 = cards()[0];
ok(/×7/.test(c0.querySelector('.ercount').textContent), 'the count is a badge');
ok(/TypeError: x is <undefined>/.test(c0.querySelector('.ermsg').textContent) && !c0.querySelector('.ermsg *'), 'the message is text, never markup');
ok(/^\/pokerth\.js:10:2$/.test(c0.querySelector('.ersrc').textContent), 'our own origin is shortened in the source line');
ok(/incl\. robots/.test(c0.textContent) && /Robots only/.test(cards()[1].textContent), 'robots are marked, mixed or alone');
ok(/v2\.1\.10-web\.126 \+1/.test(c0.textContent), 'builds fold into the first plus a count');
ok(/3 players/.test(c0.textContent) && /Internet, Training/.test(c0.textContent), 'players and modes, in words');
ok(cards()[1].classList.contains('bot'), 'a robot-only card is dimmed');
const pre = c0.querySelector('pre.erstack');
ok(pre && pre.hidden, 'the stack is folded');
const stackBtn = [...c0.querySelectorAll('.eract .use')].find((b) => b.textContent === 'Stack');
stackBtn.click();
ok(!pre.hidden && stackBtn.textContent === 'Hide stack', 'and opens on demand');
ok(!cards()[1].querySelector('pre') && ![...cards()[1].querySelectorAll('.eract .use')].some((b) => /Stack/.test(b.textContent)), 'no Stack button without a stack');
ok([...c0.querySelectorAll('.eract .use')].some((b) => b.textContent === 'Copy'), 'each card can be copied');
c0.querySelector('.eract .del').click();
await tick();
ok(posts.some((p) => /\/admin\/errors/.test(p.url) && p.body.sig === 'a'), 'Dismiss posts the signature');
$('erHideBots').checked = true;
$('erHideBots').dispatchEvent(new window.Event('change'));
ok(cards().length === 1 && !cards()[0].classList.contains('bot'), 'Hide robot-only errors hides them');
ok(window.localStorage.getItem('pth_admin_err_hidebots') === '1', 'and is remembered');
$('erHideBots').checked = false;
$('erHideBots').dispatchEvent(new window.Event('change'));
$('erFilter').value = 'script error';
$('erFilter').dispatchEvent(new window.Event('input'));
ok(cards().length === 1 && /Script error/.test(cards()[0].textContent), 'the filter finds a message');
$('erFilter').value = 'nothing-like-this';
$('erFilter').dispatchEvent(new window.Event('input'));
ok(/No error matches/.test($('erList').textContent), 'nothing found says so');
$('erFilter').value = '';
$('erFilter').dispatchEvent(new window.Event('input'));

// ── Error types: filter chips and colour code ─────────────────────────────
// Same messages as the client collector (pokerth-client.html) and i18n.mjs.
const G = (sig, msg, src, extra) => Object.assign({ sig, msg, src: src || '', line: 0, col: 0, stack: '', first: NOW - 6e5, last: NOW - 6e5, count: 1, vers: ['2.1.10-web.140'], uas: [UA_AND], bots: 0, modes: [], ips: 1 }, extra || {});
const S = 'https://example.org';
CANNED['/admin/errors'] = { ok: true, now: NOW, since: NOW - 864e5, groups: [
  G('k1', "Uncaught ReferenceError: App is not defined", S + '/', { line: 1413, col: 146 }),
  G('k2', 'Unhandled rejection: Failed to fetch', '', { count: 3, stack: 'TypeError: Failed to fetch' }),
  G('k3', 'Failed to load script', S + '/modules/theme.mjs'),
  G('k4', 'Load-failure retry #2 failed, giving up', S + '/modules/theme.mjs'),
  G('k5', 'Lang load failed, giving up', '/modules/lang/zh.mjs'),
  G('k6', 'Load-failure probe: HTTP 404 online sw', S + '/modules/theme.mjs'),
  G('k7', 'Load-failure probe: HTTP 200 online sw', S + '/modules/guide/index.mjs'),
  G('k8', 'Load-failure retry #1 recovered', S + '/pokerth.css'),
  G('k9', 'Lang load retry recovered', '/modules/lang/zh.mjs'),
  G('k10', 'Failed to load script', S + '/modules/ui/fmt.mjs', { uas: [UA_BOT], bots: 1 }),
] };
window.localStorage.removeItem('pth_admin_err_kind');
$('erRefresh').click();
await tick(150);
const kinds = () => cards().map((c) => (c.className.match(/\bk-(\w+)/) || [])[1]).join(',');
ok(kinds() === 'crash,reject,load,load,load,load,diag,ok,ok,load', 'each card is typed from its message (' + kinds() + ')');
const chip = (k) => doc.querySelector('#erKinds [data-ek="' + k + '"]');
ok(['all', 'crash', 'reject', 'load', 'ok', 'diag'].every((k) => chip(k)), 'one chip per type, plus All');
const cn = (k) => chip(k).querySelector('.chn').textContent;
ok(cn('all') === '10' && cn('crash') === '1' && cn('reject') === '1' && cn('load') === '5' && cn('ok') === '2' && cn('diag') === '1',
  'each chip counts its groups (' + ['all', 'crash', 'reject', 'load', 'ok', 'diag'].map(cn).join(',') + ')');
ok(chip('all').classList.contains('on'), 'All is selected by default');
ok(/Load failure/.test(cards()[2].querySelector('.erchip.kind').textContent) && /Recovered/.test(cards()[7].querySelector('.erchip.kind').textContent),
  'every card says its type in words, not only in colour');
chip('load').click();
ok(cards().length === 5 && cards().every((c) => c.classList.contains('k-load')), 'Load failures keeps the five load failures');
ok(chip('load').classList.contains('on') && chip('load').getAttribute('aria-pressed') === 'true', 'and shows it is selected');
ok(window.localStorage.getItem('pth_admin_err_kind') === 'load', 'the choice is remembered');
$('erHideBots').checked = true;
$('erHideBots').dispatchEvent(new window.Event('change'));
ok(cards().length === 4 && cn('load') === '4' && cn('all') === '9', 'hiding robots lowers the counts too');
$('erHideBots').checked = false;
$('erHideBots').dispatchEvent(new window.Event('change'));
$('erFilter').value = 'theme.mjs';
$('erFilter').dispatchEvent(new window.Event('input'));
ok(cards().length === 3 && cn('diag') === '0' && chip('diag').classList.contains('none'), 'the text filter narrows within the type; an empty type is greyed');
$('erFilter').value = '';
$('erFilter').dispatchEvent(new window.Event('input'));
chip('ok').click();
ok(cards().length === 2 && cards().every((c) => c.classList.contains('k-ok')), 'Recovered keeps the retries that worked');
chip('all').click();
ok(cards().length === 10, 'All shows everything again');
ok(errors.length === 0, 'switching types throws nothing' + (errors.length ? ': ' + errors[0] : ''));

$('erClear').click();
await tick();
ok(posts.some((p) => /\/admin\/errors/.test(p.url) && p.body.clear === 1), 'Clear all still clears');
ok(errors.length === 0, 'nothing threw' + (errors.length ? ': ' + errors[0] : ''));

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
