#!/usr/bin/env node
// Deterministic guards for the admin world-clock strip.
// Run: node scripts/test-admin-clock.mjs
//
// The strip answers one question — which continents are in their evening, i.e.
// where the tables are about to fill. Two things make it wrong in ways nobody
// notices: reading the server row off the browser clock (a laptop 40 minutes
// adrift then reports the wrong server time), and a peak window that quietly
// stops straddling midnight. Both are pinned here.
import { readFileSync } from 'node:fs';
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
ok(/\/admin\/clock' && req\.method === 'GET'\)[^]*?now: Date\.now\(\), tz: _serverTz\(\)/.test(proxy),
  'the answer carries the server instant and its real zone');
ok(/reqPathOnly === '\/admin\/clock'\)\) res\._rlNoPenalty = true/.test(proxy),
  'and a stale token polling it never counts toward the brute-force block');

ok(/now: Date\.now\(\), tz: _serverTz\(\), clockZones: _clockZones\(\)/.test(proxy),
  '/admin/status carries the same three fields, so the picker syncs like every other control');
ok(/function _validTz\(/.test(proxy) && /new Intl\.DateTimeFormat\('en-US', \{ timeZone: z \}\)/.test(proxy),
  'a zone is validated by Intl, not by a hand-kept list');
ok(/if \(Array\.isArray\(d\.clockZones\)\) \{[^]*?_adminConfig\.clockZones = d\.clockZones\.filter\(_validTz\)\.slice\(0, CLOCK_ZONES_MAX\)/.test(proxy),
  'a saved selection is filtered and capped before it lands in the config');
ok(/'serverTagline', 'clockZones',/.test(proxy),
  'and survives an export -> import round-trip, which silently wiped seo once');

// An explicit empty list means "server clock only" and must not be mistaken for
// "unset", or ticking nothing would spring the defaults back.
const zones = body(proxy, '_clockZones');
ok(/if \(!Array\.isArray\(z\)\) return CLOCK_ZONES_DEFAULT/.test(zones),
  'only a missing list falls back to the defaults');
ok(!/z\.length/.test(zones), 'an empty one is honoured as a deliberate choice');

// -- The strip lives outside the tabs --------------------------------------
const iTop = admin.indexOf('<div class="top">');
const iBar = admin.indexOf('id="clockBar"');
const iTabs = admin.indexOf('<div class="tabs gtabs"');
ok(iBar > 0, 'the dashboard has a clock strip');
ok(iTop < iBar && iBar < iTabs, 'sitting between the header and the families, so no tab can hide it');
ok(/clkStart\(\);/.test(admin), 'it starts when the dashboard opens');
ok(/function doLogout\(reason\)\{ srvStop\(\); seStop\(\); clkStop\(\);/.test(admin),
  'and its timers stop on logout, like every other poll');

// -- The server row is not the browser clock -------------------------------
const sync = body(admin, 'clkSync');
ok(/_clkSkew\s*=\s*d\.now\s*-\s*Date\.now\(\)/.test(sync),
  'the skew is the gap between the server instant and this browser');
const render = body(admin, 'clkRender');
ok(/Date\.now\(\)\s*\+\s*_clkSkew/.test(render), 'and every row is drawn through it');
ok(/_clkTz\|\|'UTC'/.test(render), 'a server without a resolvable zone falls back to UTC, not to the browser one');
ok(/setInterval\(clkRender,\s*5000\)/.test(admin) && /setInterval\(clkSync,\s*300000\)/.test(admin),
  'the ticking is local; the network is touched every five minutes, not every second');

// -- Peak hours ------------------------------------------------------------
const peakSrc = body(admin, 'clkPeak');
ok(peakSrc !== '', 'the evening window is a named rule');
const peak = new Function('h', peakSrc.slice(1, -1));
ok(peak(18) && peak(21) && peak(23), 'an evening is peak');
ok(peak(0) && !peak(1), 'and it straddles midnight, stopping at 01:00');
ok(!peak(2) && !peak(9) && !peak(17), 'a night or a working day is not');

// -- Zones read through Intl, in 24-hour form ------------------------------
const at = body(admin, 'clkAt');
ok(/timeZone:z/.test(at) && /hour12:false/.test(at),
  'a zone is read through Intl on a 24-hour clock, so the strip lines up');
ok(/if\(h===24\) h=0/.test(at), "and midnight comes back as 00, which 'en-GB' otherwise gives as 24");
ok(/weekday:'short'/.test(at) && /at\.d!==refDay/.test(body(admin, 'clkChip')),
  'a weekday is shown only where the region is already on another day');
ok(/catch\(e\)\{ return null; \}/.test(at), 'an unknown zone is dropped rather than throwing mid-render');

// -- The picker ------------------------------------------------------------
ok(/id="clkPick"/.test(admin) && /id="saveClocks"/.test(admin), 'Identity & reach carries the picker');
ok(/JSON\.stringify\(\{clockZones:sel,token:tok\(\)\}\)/.test(admin), 'Save posts just the selection');
ok(/clkPickSel\(\)\.slice\(0,CLOCK_MAX\)/.test(admin), 'capped client-side too, so the message matches what is stored');
ok(/if\(\$\('clkPick'\) && Array\.isArray\(d\.clockZones\)\) clkPickRender\(d\.clockZones\)/.test(admin),
  'and the boxes are filled from the server, not from a local guess');

// The two default sets are written out in both files; they have to agree, or a
// fresh install shows one strip and the Default set button restores another.
const pd = /const CLOCK_ZONES_DEFAULT = \[([^\]]+)\]/.exec(proxy);
const ad = /var CLOCK_DEFAULT=\[([^\]]+)\]/.exec(admin);
ok(pd && ad, 'both files name a default set');
const norm = s => s.replace(/[\s']/g, '').split(',').filter(Boolean).join(',');
ok(pd && ad && norm(pd[1]) === norm(ad[1]), 'and they are the same set');
const pmax = /const CLOCK_ZONES_MAX = (\d+)/.exec(proxy);
const amax = /var CLOCK_MAX=(\d+)/.exec(admin);
ok(pmax && amax && pmax[1] === amax[1], 'and the same cap');

// Every zone offered by the picker must be one Intl can actually resolve.
const cat = /var CLOCK_CAT=\[([^]*?)\n  \];/.exec(admin);
ok(!!cat, 'the catalogue is readable');
const ids = cat ? [...cat[1].matchAll(/\['([A-Za-z_/]+)',/g)].map(m => m[1]) : [];
ok(ids.length >= 20, 'it offers enough of the world to answer the question (' + ids.length + ')');
let bad = ids.filter(z => { try { new Intl.DateTimeFormat('en-GB', { timeZone: z }); return false; } catch (e) { return true; } });
ok(bad.length === 0, 'every offered zone resolves' + (bad.length ? ' \u2014 ' + bad.join(', ') : ''));
ok(ids.length === new Set(ids).size, 'and none is listed twice');
const dflt = ad ? norm(ad[1]).split(',') : [];
ok(dflt.every(z => ids.includes(z)), 'the default set is entirely selectable in the picker');

// -- Icons -----------------------------------------------------------------
const gtabs = admin.slice(iTabs, admin.indexOf('</div>', iTabs));
ok((gtabs.match(/class="ti"/g) || []).length === 3, 'each family button carries an icon');
const tabButtons = [...admin.matchAll(/<button class="tab(?: on)?" data-t="[a-z]+"(?: data-scope="[a-z]+")?>(.)/g)];
ok(tabButtons.length === 17, 'every section still has a tab (' + tabButtons.length + ')');
ok(admin.match(/<button class="tab(?: on)?" data-t="[a-z]+"(?: data-scope="[a-z]+")?><span class="ti"/g).length === 17,
  'and every one of them opens with an icon');
ok(/aria-hidden="true"/.test(gtabs), 'the icons are decorative, so a screen reader reads the label alone');
ok(/\.ti\{margin-right:6px\}/.test(admin), 'the spacing is in the sheet, not repeated in seventeen tags');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
