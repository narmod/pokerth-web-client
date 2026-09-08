#!/usr/bin/env node
// Deterministic guards for the admin world clock.
// Run: node scripts/test-admin-clock.mjs
//
// The strip answers one question — which continents are in their evening, i.e.
// where the tables are about to fill. Several things make it wrong in ways
// nobody notices: a peak window that quietly stops straddling midnight, an
// order that stops following the offset, a reference zone that vanishes when
// it is not ticked, and — for the server's own time, which now heads the
// status list — reading the clock off the browser instead of off the server.
// All of them are pinned here.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  \u2717', msg); } else console.log('  \u2713', msg); }

function body(src, name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = src.indexOf('{', head), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(i, j + 1); }
  }
  return '';
}

// -- Server side -----------------------------------------------------------
ok(/reqPathOnly === '\/admin\/clock' && req\.method === 'GET'/.test(proxy), 'the proxy serves /admin/clock');
ok(/function _anyAdminKey\(/.test(proxy), 'and gates it on any valid key');
ok(/if \(!_anyAdminKey\(query\)\) return adminJson\(res, 403/.test(proxy),
  'rather than on a scope, so a delegate key does not see a row of dashes');
ok(/now: Date\.now\(\), tz: _serverTz\(\), zones: _clockZones\(\), ref: _clockRef\(\)/.test(proxy),
  'the answer carries the instant, the zone, the selection and the reference');
ok(/reqPathOnly === '\/admin\/clock'\)\) res\._rlNoPenalty = true/.test(proxy),
  'and a stale token polling it never counts toward the brute-force block');

ok(/now: Date\.now\(\), tz: _serverTz\(\), clockZones: _clockZones\(\), clockRef: _clockRef\(\)/.test(proxy),
  '/admin/status carries the same fields, so the controls sync like every other one');
ok(/function _validTz\(/.test(proxy) && /new Intl\.DateTimeFormat\('en-US', \{ timeZone: z \}\)/.test(proxy),
  'a zone is validated by Intl, not by a hand-kept list');
ok(/_adminConfig\.clockZones = d\.clockZones\.filter\(_validTz\)\.slice\(0, CLOCK_ZONES_MAX\)/.test(proxy),
  'a saved selection is filtered and capped before it lands in the config');
ok(/if \(!_validTz\(d\.clockRef\)\) return adminJson\(res, 400/.test(proxy),
  'and an unknown reference is refused rather than dropped, which would look like a save that did nothing');
ok(/'clockZones', 'clockRef',/.test(proxy),
  'both survive an export -> import round-trip, which silently wiped seo once');

const zones = body(proxy, '_clockZones');
ok(/if \(!Array\.isArray\(z\)\) return CLOCK_ZONES_DEFAULT/.test(zones),
  'only a missing list falls back to the defaults');
ok(!/z\.length/.test(zones), 'an empty one is honoured as a deliberate choice');
ok(/_validTz\(r\) \? r : CLOCK_REF_DEFAULT/.test(body(proxy, '_clockRef')),
  'and a reference left unset, or gone stale, falls back to UTC');

// -- The strip lives outside the tabs --------------------------------------
const iTop = admin.indexOf('<div class="top">');
const iBar = admin.indexOf('id="clockBar"');
const iTabs = admin.indexOf('<div class="tabs gtabs"');
ok(iBar > 0, 'the dashboard has a clock strip');
ok(iTop < iBar && iBar < iTabs, 'sitting between the header and the families, so no tab can hide it');
ok(/clkStart\(\);/.test(admin), 'it starts when the dashboard opens');
ok(/function doLogout\(reason\)\{ srvStop\(\); seStop\(\); clkStop\(\);/.test(admin),
  'and its timers stop on logout, like every other poll');

// -- Order and reference ---------------------------------------------------
const render = body(admin, 'clkRender');
ok(/if\(list\.indexOf\(_clkRef\)<0\) list\.push\(_clkRef\)/.test(render),
  'the reference is always in the strip, ticked or not — it is the axis, not a choice');
ok(/clkOffset\(z,ms\)/.test(render) && /sort\(function\(a,b\)\{ return a\.o-b\.o/.test(render),
  'the row is ranked by real offset, earliest on the left');
ok(/a\.z\.localeCompare\(b\.z\)/.test(render),
  'and two zones on the same offset keep a stable order rather than shuffling every tick');
ok(/z===_clkRef/.test(render), 'the reference is marked out where it lands');
const off = body(admin, 'clkOffset');
ok(/Intl\.DateTimeFormat\('en-US'/.test(off) && /Date\.UTC\(/.test(off),
  'the offset is measured through Intl, so summer time is not a table to maintain');
ok(/catch\(e\)\{ return 0; \}/.test(off), 'and an unreadable zone sorts as UTC rather than throwing');

// -- Local ticking, server-anchored ----------------------------------------
const sync = body(admin, 'clkSync');
ok(/_clkSkew\s*=\s*d\.now\s*-\s*Date\.now\(\)/.test(sync), 'the skew is the gap between the server instant and this browser');
ok(/Date\.now\(\)\s*\+\s*_clkSkew/.test(render), 'and every dial is drawn through it');
ok(/setInterval\(clkRender,\s*5000\)/.test(admin) && /setInterval\(clkSync,\s*300000\)/.test(admin),
  'the ticking is local; the network is touched every five minutes, not every second');

// -- The server clock moved to the status list -----------------------------
ok(!/'Server'/.test(render), 'the strip no longer carries a Server row of its own');
ok(/var items=\[\['Server time',clkServerStamp\(d\.now,d\.tz\)\],\['Build version'/.test(admin),
  'it heads the status list under Health & logs instead');
const stamp = body(admin, 'clkServerStamp');
ok(/timeZone:tz\|\|'UTC'/.test(stamp), 'and is formatted in the server zone, not the browser one');
ok(/typeof now!=='number'/.test(stamp), 'an older proxy without the field shows a dash rather than 1970');
ok(/catch\(e\)\{ return new Date\(now\)\.toISOString\(\)/.test(stamp),
  'and a zone Intl refuses falls back to an ISO stamp rather than blanking the row');

// -- Peak hours ------------------------------------------------------------
const peakSrc = body(admin, 'clkPeak');
ok(peakSrc !== '', 'the evening window is a named rule');
const peak = new Function('h', peakSrc.slice(1, -1));
ok(peak(18) && peak(21) && peak(23), 'an evening is peak');
ok(peak(0) && !peak(1), 'and it straddles midnight, stopping at 01:00');
ok(!peak(2) && !peak(9) && !peak(17), 'a night or a working day is not');

// -- Dials -----------------------------------------------------------------
const dial = body(admin, 'clkDial');
ok(/createElementNS\(SVGNS,'svg'\)/.test(dial), 'the dial is real SVG, built node by node');
ok(/'currentColor'/.test(dial) && !/var\(--/.test(dial),
  'hands and ticks use currentColor — a stroke attribute cannot resolve a CSS var');
ok(/\(\(at\.h%12\)\+at\.m\/60\)\*30/.test(dial), 'the hour hand creeps with the minutes instead of jumping on the hour');
ok(/at\.m\*6/.test(dial), 'and the minute hand is six degrees a minute');
ok(/if\(at\)\{/.test(dial), 'a zone that would not read shows an empty face rather than hands at midnight');

// -- Reading a zone --------------------------------------------------------
const at = body(admin, 'clkAt');
ok(/timeZone:z/.test(at) && /hour12:false/.test(at),
  'a zone is read through Intl on a 24-hour clock, so the strip lines up');
ok(/if\(h===24\) h=0/.test(at), "and midnight comes back as 00, which 'en-GB' otherwise gives as 24");
ok(/m:m/.test(at), 'the minute is returned as a number, since the dial needs an angle and not a label');
ok(/weekday:'short'/.test(at) && /at\.d!==refDay/.test(body(admin, 'clkCell')),
  'a weekday is shown only where the region is already on another day');
ok(/catch\(e\)\{ return null; \}/.test(at), 'an unknown zone is dropped rather than throwing mid-render');

// -- Flags come from the bundled set, not from emoji ------------------------
const cell = body(admin, 'clkCell');
ok(/src='\/flags\/'\+meta\[2\]\+'\.svg'/.test(cell),
  'flags are the self-hosted SVGs the app already ships, not regional-indicator emoji Windows cannot draw');
ok(/addEventListener\('error'/.test(cell), 'and a missing file hides the image instead of leaving a broken icon');
const cat = /var CLOCK_CAT=\[([^]*?)\n  \];/.exec(admin);
ok(!!cat, 'the catalogue is readable');
const rows = cat ? [...cat[1].matchAll(/\['([A-Za-z_/]+)','([^']*)','([a-z]*)'/g)] : [];
ok(rows.length >= 20, 'it offers enough of the world to answer the question (' + rows.length + ')');
const ids = rows.map(r => r[1]);
const badTz = ids.filter(z => { try { new Intl.DateTimeFormat('en-GB', { timeZone: z }); return false; } catch (e) { return true; } });
ok(badTz.length === 0, 'every offered zone resolves' + (badTz.length ? ' \u2014 ' + badTz.join(', ') : ''));
ok(ids.length === new Set(ids).size, 'and none is listed twice');
const missing = rows.map(r => r[3]).filter(Boolean)
  .filter(cc => !existsSync(join(root, 'public', 'flags', cc + '.svg')));
ok(missing.length === 0, 'every country code has a flag on disk' + (missing.length ? ' \u2014 ' + missing.join(', ') : ''));

// -- The two files have to agree -------------------------------------------
const pd = /const CLOCK_ZONES_DEFAULT = \[([^\]]+)\]/.exec(proxy);
const ad = /var CLOCK_DEFAULT=\[([^\]]+)\]/.exec(admin);
ok(pd && ad, 'both files name a default set');
const norm = s => s.replace(/[\s']/g, '').split(',').filter(Boolean).join(',');
ok(pd && ad && norm(pd[1]) === norm(ad[1]), 'and they are the same set');
const pmax = /const CLOCK_ZONES_MAX = (\d+)/.exec(proxy);
const amax = /var CLOCK_MAX=(\d+)/.exec(admin);
ok(pmax && amax && pmax[1] === amax[1], 'and the same cap');
const pref = /const CLOCK_REF_DEFAULT = '([^']+)'/.exec(proxy);
const aref = /var CLOCK_REF_DEFAULT='([^']+)'/.exec(admin);
ok(pref && aref && pref[1] === aref[1], 'and the same default reference');
ok(aref && ids.includes(aref[1]), 'which is itself offered in the picker');

// -- Controls --------------------------------------------------------------
ok(/id="clkPick"/.test(admin) && /id="saveClocks"/.test(admin) && /id="clkRef"/.test(admin),
  'Identity & reach carries the picker and the reference');
ok(/JSON\.stringify\(\{clockZones:sel,clockRef:rf,token:tok\(\)\}\)/.test(admin), 'Save posts both');
ok(/clkPickSel\(\)\.slice\(0,CLOCK_MAX\)/.test(admin), 'capped client-side too, so the message matches what is stored');
ok(/if\(\$\('clkPick'\) && Array\.isArray\(d\.clockZones\)\) clkPickRender\(d\.clockZones\)/.test(admin)
  && /if\(\$\('clkRef'\)\) clkRefRender\(d\.clockRef\|\|CLOCK_REF_DEFAULT\)/.test(admin),
  'and both are filled from the server, not from a local guess');

// -- Icons -----------------------------------------------------------------
const gtabs = admin.slice(iTabs, admin.indexOf('</div>', iTabs));
ok((gtabs.match(/class="ti"/g) || []).length === 3, 'each family button carries an icon');
ok(admin.match(/<button class="tab(?: on)?" data-t="[a-z]+"(?: data-scope="[a-z]+")?><span class="ti"/g).length === 17,
  'and so does every one of the seventeen sections');
ok(/aria-hidden="true"/.test(gtabs), 'the icons are decorative, so a screen reader reads the label alone');
ok(/\.ti\{margin-right:6px\}/.test(admin), 'the spacing is in the sheet, not repeated in seventeen tags');

// -- No escape sequence ever reaches the screen ----------------------------
// A card shipped once reading "locally \u2014 the hours", because the text was
// written through a layer that ate one backslash. A text node is HTML, not
// JavaScript: an escape there is just characters.
const markup = admin.replace(/<script[^]*?<\/script>/g, '').replace(/<style[^]*?<\/style>/g, '');
const textNodes = [...markup.matchAll(/>([^<>]{4,})</g)].map(m => m[1]);
const leaked = textNodes.filter(t => /\\u[0-9a-fA-F]{4}/.test(t));
ok(leaked.length === 0, 'no \\uXXXX escape is left sitting in visible text' + (leaked.length ? ' \u2014 ' + leaked[0].slice(0, 60) : ''));

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
