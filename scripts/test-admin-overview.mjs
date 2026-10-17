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
ok(/m: \(b && b\.m\) \? b\.m : undefined \}\);/.test(proxy) && (proxy.match(/m: \(b && b\.m\) \? b\.m : undefined \}\);/g) || []).length === 2,
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
ok(/window\.PthAdmin=\{ api:/.test(admin) && /open:function\(t\)\{ var b=document\.querySelector\('\.tab\[data-t="'\+t\+'"\]'\); if\(b && b\.style\.display!=='none'\) b\.click\(\); \}/.test(admin),
  'the page lends its api() and opens a section by its own button');
ok(/sectionEvent\(t\);\n  \}\); \}\);/.test(admin), 'every section change is announced');
ok(/function doLogout\(reason\)\{[^\n]*sectionEvent\(''\)/.test(admin), 'and logging out stops the polling');
ok(/if\(_t==='server'\) srvStart\(\);/.test(admin), 'the log poller no longer runs behind the Overview');
ok(/e\.detail\.t === 'overview'\) start\(\); else stop\(\)/.test(src), 'the module polls only while Overview is open');
ok(/document\.hidden/.test(src), 'and not while the page is hidden');
ok(/if \(seq !== _seq\) return;/.test(src), 'a late answer from a previous visit is dropped');
ok(!/method: 'POST'|method:'POST'/.test(src), 'Overview writes nothing');
ok(!/<div id="panel-overview" data-master/.test(admin), 'the panel is not data-master: that would show it under every section');

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
