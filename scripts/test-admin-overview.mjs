#!/usr/bin/env node
// Admin › Overview: the figures it derives and the page it paints.
// Run: node scripts/test-admin-overview.mjs   (needs jsdom)
//
// The module is read-only and fed by endpoints other sections already use, so
// the risk is in the arithmetic (who counts as Internet, LAN, Training, Live),
// in what it calls urgent, and in a card that never leaves "Loading…".
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
const src = readFileSync(join(root, 'public', 'modules', 'admin', 'overview.mjs'), 'utf8');
const OV = await import(join(root, 'public', 'modules', 'admin', 'overview.mjs'));

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── Right now, by entry mode ──────────────────────────────────────────────
const SESS = { ok: true, now: 1e6,
  bridges: [
    { mode: 'pthnet', host: 'pthsrv.pokerth.net', port: 7236, startedAt: 1e6 - 60000, nick: 'Ann' },
    { mode: 'lan', host: 'Club.example.org', port: 7234, startedAt: 1e6 - 5000, nick: 'Bob' },
    { mode: 'lan', host: 'club.example.org', port: 7234, startedAt: 1e6 - 4000 },
    { mode: 'lan', host: 'other.example.org', port: 7234, startedAt: 1e6 - 3000 },
    { mode: 'pthnet', live: true, host: 'pthsrv.pokerth.net', port: 7236, startedAt: 1e6 - 2000 },
  ],
  notify: [
    { mode: 'pthnet', startedAt: 1e6 - 1000 },
    { mode: 'offline', startedAt: 1e6 - 900 },
    { mode: 'offline', startedAt: 1e6 - 800 },
    { mode: 'pthnet', live: true, startedAt: 1e6 - 700 },
  ] };
const now = OV.nowByMode(SESS);
ok(now.net.n === 2 && now.net.bridged === 1 && now.net.direct === 1, 'Internet counts the bridged and the direct players');
ok(now.lan.n === 3 && now.lan.servers === 2, 'LAN counts players and distinct servers, host case aside');
ok(now.off.n === 2, 'Training is the offline notice channels');
ok(now.live.n === 2, '/live spectators are counted apart, bridged or not');
ok(OV.nowByMode({ ok: false }) === null, 'a failed read yields nothing rather than zeros');

// ── Connections per day ───────────────────────────────────────────────────
const rows = OV.dailyByMode([
  { date: '2026-10-16', m: { pokerthnet: 5, lan: 2, offline: 1, live: 1 } },
  { date: '2026-10-17', m: { pokerthnet: 1 } },
  { date: '2026-10-18' },
], '2026-10-17');
ok(rows[0].net === 5 && rows[0].lan === 2 && rows[0].off === 1 && rows[0].live === 1 && rows[0].total === 9, 'a day adds its four modes');
ok(rows[1].today && !rows[0].today, 'today is marked, by the server\'s day key');
ok(!rows[2].has && rows[2].total === 0, 'a day without counts says so');
ok((proxy.match(/m: \(b && b\.m\) \? b\.m : undefined, lo: \(b && b\.lo\) \? b\.lo : undefined \}\)\);/g) || []).length === 2,
  'the visit series carries the per-mode counts, daily and hourly');

// ── What needs attention ──────────────────────────────────────────────────
const T = 1e12;
let a = OV.alertsFrom({ now: T, status: { ok: true, version: 'b', runningVersion: 'a', update: { available: true, remote: '0123456789', needsRestart: false }, restartAt: T + 6e5 },
  landir: { ok: true, pending: [{}, {}] },
  errors: { ok: true, groups: [{ uas: ['x'], bots: 0, last: T - 1000 }, { uas: ['Googlebot'], bots: 1, last: T - 1000 }] } });
ok(a.map(x => x.t).join(',') === 'errors,deploy,landir,deploy,deploy', 'most urgent first: errors, then warnings, then news (' + a.map(x => x.kind + ':' + x.t).join(',') + ')');
ok(a[0].title === '1 client error', 'an error seen from robots only is left out');
ok(a.some(x => x.title === 'Restart needed' && /still runs a/.test(x.sub)), 'files newer than the running proxy ask for a restart');
ok(a.some(x => x.title === 'Update available' && /01234567/.test(x.sub) && /no restart/.test(x.sub)), 'an update says what it needs');
ok(a.some(x => x.title === '2 LAN servers waiting'), 'LAN proposals waiting are counted');
ok(a.some(x => x.title === 'Restart scheduled'), 'a scheduled restart is announced');
a = OV.alertsFrom({ now: T, status: { ok: true, version: 'a', runningVersion: 'a', update: {} }, landir: { ok: true, pending: [] }, errors: { ok: true, groups: [{ uas: ['x'], bots: 0, last: T - 3 * 864e5 }] } });
ok(a.length === 1 && a[0].kind === 'info', 'old errors stay visible, without alarm');
a = OV.alertsFrom({ now: T, status: { ok: true, version: 'a', runningVersion: 'a', update: {} }, landir: { ok: true, pending: [] }, errors: { ok: true, groups: [] } });
ok(a.length === 1 && a[0].title === 'All clear' && !a[0].t, 'nothing to do says so');
ok(OV.alertsFrom({ status: { ok: false } }).length === 0, 'no "All clear" when the status could not be read');
// A failed read of the upstream is shown, not hidden behind « All clear » (web.336).
{
  const st = (u, extra) => OV.alertsFrom({ now: T, status: Object.assign({ ok: true, version: 'a', runningVersion: 'a', update: u }, extra || {}), landir: { ok: true, pending: [] }, errors: { ok: true, groups: [] } });
  let fa = st({ error: "fatal: unable to access 'https://github.com/x/y/': Could not resolve host", checkedAt: T - 5 * 60000 });
  ok(fa.length === 1 && fa[0].kind === 'warn' && fa[0].title === 'Update check failed' && /Could not resolve host/.test(fa[0].sub)
    && /checked 5 min ago/.test(fa[0].sub) && fa[0].t === 'deploy', 'a failed update check: amber card with the error and when, instead of « All clear »');
  ok(st({ error: 'x'.repeat(300) })[0].sub.length === 120, 'a long error is cut');
  ok(st({ error: 'no git checkout (docker)' }, { gitUpdatable: false })[0].title === 'All clear', 'an install without git says nothing about it');
  ok(!st({ checkedAt: T }).some(x => x.title === 'Update check failed'), 'a check that worked says nothing');
}

// ── Client errors: severity by type, bar and legend (web.328) ─────────────
const ST = { ok: true, version: 'a', runningVersion: 'a', update: {} }, LD = { ok: true, pending: [] };
const G = (msg, ago) => ({ msg, uas: ['x'], bots: 0, last: T - ago });
const errAlert = (groups) => OV.alertsFrom({ now: T, status: ST, landir: LD, errors: { ok: true, groups } }).find(x => x.t === 'errors');
ok(OV.errKind({ msg: 'Uncaught TypeError: x' }) === 'crash' && OV.errKind({ msg: 'Unhandled rejection: y' }) === 'reject'
  && OV.errKind({ msg: 'Failed to load script' }) === 'load' && OV.errKind({ msg: 'Load-failure retry #1 recovered' }) === 'ok'
  && OV.errKind({ msg: 'Load-failure probe: HTTP 200 online sw' }) === 'diag' && OV.errKind({ msg: 'Load-failure probe: HTTP 404 online sw' }) === 'load'
  && OV.errKind({ msg: 'Boot stall: up=7s' }) === 'diag', 'the five types read as on Admin › Errors');
{
  // Same rules as admin.html _erKind: every regex literal of one is in the other.
  const body = (txt, start) => { const i = txt.indexOf(start); return i < 0 ? '' : txt.slice(i, txt.indexOf('\n  }', i)); };
  const rx = (t) => (t.match(/\/\^[^\n]*?\/(?=\.test)/g) || []).sort().join('\n');
  const a1 = rx(body(admin, 'function _erKind(e){')), o1 = rx(body(src, 'export function errKind(e) {'));
  ok(a1 && a1 === o1, 'Overview and Admin › Errors classify with the same rules');
  ok(/\['crash',[^\]]*'var\(--err-text\)'[\s\S]*?\['reject',[^\]]*'var\(--warn-text\)'[\s\S]*?\['load',[^\]]*'var\(--m-live\)'[\s\S]*?\['ok',[^\]]*'var\(--ok-text\)'[\s\S]*?\['diag',[^\]]*'var\(--muted\)'/.test(admin)
    && OV.ERR_KINDS.map(k => k.id + k.color).join() === 'crashvar(--err-text),rejectvar(--warn-text),loadvar(--m-live),okvar(--ok-text),diagvar(--muted)',
    'same order and colours as the Admin › Errors chips');
}
let ea = errAlert([G('Uncaught ReferenceError: App is not defined', 1000), G('Failed to load script', 1000), G('Load-failure retry #1 recovered', 1000), G('Boot stall: up=7s', 1000)]);
ok(ea.kind === 'err' && ea.title === '2 client errors', 'an exception in the last 24 h is red; recovered and diagnostics are not counted (' + ea.kind + ', ' + ea.title + ')');
ok(ea.kinds.crash === 1 && ea.kinds.load === 1 && ea.kinds.ok === 1 && ea.kinds.diag === 1 && ea.kinds.reject === 0, 'the card carries the count of each type');
ea = errAlert([G('Unhandled rejection: z', 1000)]);
ok(ea.kind === 'err', 'a rejection in the last 24 h is red too');
ea = errAlert([G('Failed to load script', 1000), G('Uncaught Error: old', 3 * 864e5)]);
ok(ea.kind === 'warn' && ea.title === '2 client errors', 'only a file that never arrived in the last 24 h: amber');
ea = errAlert([G('Load-failure retry #1 recovered', 1000), G('Load-failure probe: HTTP 200 online sw', 1000)]);
ok(ea.kind === 'info' && ea.title === 'No client error to act on' && /recovered/.test(ea.sub), 'only recoveries and diagnostics: calm, and says so');
ok(errAlert([G('Uncaught Error: a', 1000)]).ek === 'all', '« Open » shows every type');
{
  const h = OV.errKindsHtml({ crash: 2, reject: 0, load: 5, ok: 1, diag: 0 });
  ok((h.match(/data-ek="(crash|load|ok)"/g) || []).length === 6 && !/data-ek="(reject|diag)"/.test(h), 'bar and legend show only the types present, each once in each');
  ok(/flex:2;[^"]*var\(--err-text\)/.test(h) && /flex:5;[^"]*var\(--m-live\)/.test(h), 'each segment is sized by its count, in its type colour');
  ok(/aria-label="8 by type: 2 script, 5 load, 1 recovered"/.test(h), 'the bar reads aloud');
  ok(OV.errKindsHtml({ crash: 0, reject: 0, load: 0, ok: 0, diag: 0 }) === '' && OV.errKindsHtml(null) === '', 'nothing to split: no bar');
}
ok(/window\.PthAdmin\.errKindPick=function\(k\)\{/.test(admin) && /errKindPick\(ek\)/.test(src), 'a legend entry opens Admin › Errors on its type');
ok(/\.ovebar\{/.test(admin) && /\.ovekinds button\{/.test(admin), 'the bar and the legend are styled');

// ── Small helpers ─────────────────────────────────────────────────────────
ok(OV.auditLabel('config') === 'Settings saved' && OV.auditLabel('weird-path') === 'weird-path', 'audit actions read as words, unknown ones as they are');
ok(OV.fmtUptime(90061) === '1d 1h 1m', 'uptime in days, hours, minutes');
ok(OV.esc('<b>"x"</b>') === '&lt;b&gt;&quot;x&quot;&lt;/b&gt;', 'names are escaped');
ok(OV.ago(30 * 60000) === '30 min ago' && OV.ago(3 * 3600000) === '3 h ago', 'times read as "ago"');

// ── Painting ──────────────────────────────────────────────────────────────
const dom = new JSDOM(admin);   // scripts off: only the markup
const doc = dom.window.document;
const panel = doc.getElementById('panel-overview');
ok(!!panel, 'the Overview panel exists');
for (const id of ['ovAlerts', 'ovModes', 'ovChart', 'ovHealth', 'ovNow', 'ovNowN', 'ovAudit']) ok(!!doc.getElementById(id), '#' + id + ' is there to fill');
global.document = doc;
OV.render(panel, {
  now: T,
  status: { ok: true, version: 'v1', runningVersion: 'v1', uptimeSec: 3600, installKind: 'docker', gitUpdatable: false, sockets: 7, maxClients: 500, fd: { soft: '20000', softN: 20000, approxPlayers: 9968 }, update: {} },
  sessions: Object.assign({}, SESS, { bridges: SESS.bridges.concat([{ mode: 'pthnet', nick: '<img src=x>', startedAt: 1e6 }]) }),
  visits: { ok: true, todayKey: '2026-10-17', series: [{ date: '2026-10-16', m: { pokerthnet: 4, lan: 1 } }, { date: '2026-10-17', m: { offline: 2 } }] },
  landir: { ok: true, pending: [] }, errors: { ok: true, groups: [] },
  audit: { ok: true, entries: [{ at: Date.now(), action: 'config', master: true, ok: true }, { at: Date.now(), action: 'tokens', actor: 'radio', ok: false, status: 403 }] },
  live: { ok: true, online: 321, tables: 12 },
});
const txt = (id) => doc.getElementById(id).textContent;
ok(/All clear/.test(txt('ovAlerts')), 'the alert row paints');
ok(doc.querySelectorAll('#ovModes .ovmode').length === 4, 'four mode cards');
ok(/321 online on the server · 12 tables/.test(txt('ovModes')), 'Internet adds the server-wide figure when the server publishes one');
ok(/on 2 servers/.test(txt('ovModes')), 'LAN names its servers');
ok(doc.querySelectorAll('#ovChart .ovbar').length === 2 && doc.querySelector('#ovChart .ovbar.today'), 'one bar per day, today marked');
ok(/Internet 4/.test(txt('ovChart')) && /Training 2/.test(txt('ovChart')), 'the legend carries the totals');
ok(doc.querySelector('#ovChart .ovchart').getAttribute('role') === 'img' && /Internet 4/.test(doc.querySelector('#ovChart .ovchart').getAttribute('aria-label')), 'and a screen reader gets them too');
ok(/docker · no self-update/.test(txt('ovHealth')) && /7 of 500/.test(txt('ovHealth')), 'the server card paints');
ok(/20,000 · ~9,968 players/.test(txt('ovHealth')), 'open files read as a number');
ok(/peak 5 a day/.test(txt('ovChart')), 'the chart states its scale');
OV.render(panel, { now: T, status: { ok: true, version: 'v1', runningVersion: 'v1', update: {} }, landir: { ok: true, pending: [] },
  errors: { ok: true, groups: [G('Failed to load script', 1000), G('Failed to load link', 1000), G('Load-failure retry #1 recovered', 1000)] } });
{
  const c = doc.querySelector('#ovAlerts .ovalert');
  ok(c && c.classList.contains('ov-warn') && /2 client errors/.test(c.textContent), 'the painted card: amber, real errors only');
  ok(c.querySelectorAll('.ovebar i[data-ek]').length === 2 && c.querySelectorAll('.ovekinds button[data-go="errors"]').length === 2
    && /2 load/.test(c.textContent) && /1 recovered/.test(c.textContent), 'with its bar and its legend');
  ok(c.querySelector('.ovgo[data-ek="all"]'), '« Open » carries the « all » type');
}
// Daily totals and the reading (2.1.10-web.146): a total on each bar, no
// title (a phone never shows one), a tap or the mouse reads a day.
ok(doc.querySelectorAll('#ovChart .ovbar .ovtot').length === 2 && !doc.querySelector('#ovChart .ovbar[title]'), 'each day carries its total, no title left');
ok(doc.querySelector('#ovChart .ovchartw .chartro.ovtip') && doc.querySelector('#ovChart .chartgd'), 'with the reading bubble and guide of the Statistics charts');
ok(OV.compact(652) === '652' && OV.compact(1022) === '1k' && OV.compact(1550) === '1.6k' && OV.compact(23456) === '23k', 'a phone gets totals in four characters');
const tip = OV.tipHtml({ date: '2026-10-14', today: true, net: 125, lan: 42, off: 85, live: 0, total: 252 });
ok(/Wed,? 14 Oct · so far/.test(tip) && /Internet<\/i><s>125/.test(tip) && /Live\/spectator tool<\/i><s>0/.test(tip) && /Total<\/i><s>252/.test(tip), 'the bubble: the day, each mode, then the total');
ok(/tipWire\(q\('ovChart'\)\)/.test(src) && /addEventListener\('pointerdown', read/.test(src) && /e\.pointerType === 'mouse'\) tipHide/.test(src), 'a tap leaves it open; the mouse takes it away when it leaves');
ok(/if \(!host\.contains\(e\.target\)\) tipHide/.test(src), 'a tap outside the chart puts it away');
ok(/class="ovtop"/.test(src) && !/class="top"/.test(src), 'the top segment is not the page header\'s .top (sticky on a phone)');
ok(/spectator/.test(txt('ovNow')), 'a /live viewer is a spectator, not a guest');
ok(doc.querySelectorAll('#ovNow .ovrow').length === 6 && /and \d+ more/.test(txt('ovNow')), 'six live connections, then a count');
ok(!doc.querySelector('#ovNow img') && /<img src=x>/.test(txt('ovNow')), 'a nickname is shown as text, never as markup');
ok(/10 connections/.test(txt('ovNowN')), 'the header counts every connection');
ok(/Settings saved/.test(txt('ovAudit')) && /\(403\)/.test(txt('ovAudit')) && /radio/.test(txt('ovAudit')), 'recent changes in words, a refusal marked, the key named');
OV.render(panel, { visits: { ok: true, todayKey: 'x', series: [{ date: '2026-10-01' }] } });
ok(/No connection counted/.test(txt('ovChart')), 'an empty fortnight says so instead of drawing nothing');
OV.render(panel, { visits: { ok: false } });
ok(/Could not load/.test(txt('ovChart')), 'a failed read says so instead of loading forever');

// ── Wiring ────────────────────────────────────────────────────────────────
ok(/<script type="module" src="\/modules\/admin\/overview\.mjs"><\/script>/.test(admin), 'the module is loaded');
ok(/window\.PthAdmin=\{ api:/.test(admin) && /open:function\(t\)\{ var p=String\(t\|\|''\)\.split\('\/'\)/.test(admin) && /if\(b && b\.style\.display!=='none'\) b\.click\(\); \}/.test(admin),
  'the page lends its api() and opens a section (or a page of one) by its own button');
ok(/sectionEvent\(t\+\(b\.dataset\.ts\?'\/'\+b\.dataset\.ts:''\)\);\n  \}\); \}\);/.test(admin), 'every section change is announced');
ok(/function doLogout\(reason\)\{[^\n]*sectionEvent\(''\)/.test(admin), 'and logging out stops the polling');
ok(/if\(_t==='server'\) srvStart\(\);/.test(admin), 'the log poller no longer runs behind the Overview');
ok(/e\.detail\.t === 'overview'\) start\(\); else stop\(\)/.test(src), 'the module polls only while Overview is open');
ok(/document\.hidden/.test(src), 'and not while the page is hidden');
ok(/if \(seq !== _seq\) return;/.test(src), 'a late answer from a previous visit is dropped');
ok(!/method: 'POST'|method:'POST'/.test(src), 'Overview writes nothing');
ok(!/<div id="panel-overview" data-master/.test(admin), 'the panel is not data-master: that would show it under every section');

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
