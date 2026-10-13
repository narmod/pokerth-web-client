#!/usr/bin/env node
// Day / night on the admin world map (Traffic › World, « Day / night »): the
// sun position (NOAA formulas: declination and equation of time, so seasons
// and hemispheres come out right), the browser-side Natural Earth I projection
// against reference points computed with d3-geo when the asset was built, the
// night shape, real sunsets in legal time (summer time included), polar day and
// night, the map asset (proj, centroids, zones) and the admin wiring.
// The functions are lifted out of public/admin.html and run as they are.
// Run: node scripts/test-world-night.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}
const admin = fs.readFileSync(path.join(root, 'public/admin.html'), 'utf8');
function lift(name) {
  const h = admin.indexOf('function ' + name + '(');
  if (h < 0) return '';
  let i = admin.indexOf('{', h), depth = 0;
  for (; i < admin.length; i++) { if (admin[i] === '{') depth++; else if (admin[i] === '}' && --depth === 0) break; }
  return admin.slice(h, i + 1);
}
const names = ['_sunPos', '_sunAlt', '_neProj', '_geoNightSpan', '_geoNightPath', '_geoSphere', '_geoSunset', '_geoLegalTime', '_geoNightSvg', '_geoNightCard'];
ok(names.every((n) => lift(n)), 'every day/night helper is in admin.html');
const M = JSON.parse(fs.readFileSync(path.join(root, 'public/vendor/world-110m.json'), 'utf8'));
const api = new Function('_geoMap', '_geoNight', 'Date',
  'var _RAD=Math.PI/180, _geoTzFmt={};\n' + names.map(lift).join('\n') +
  '\nreturn { ' + names.map((n) => n + ':' + n).join(', ') + ' };');
const fixedNow = (t) => { const D = function (...a) { return a.length ? new Date(...a) : new Date(t); }; D.now = () => t; D.UTC = Date.UTC; return D; };
const at = (iso) => api(M, true, fixedNow(Date.parse(iso)));
const X = at('2026-10-13T21:55:00Z');

// ── sun ──
const dJun = X._sunPos(Date.parse('2026-06-21T12:00:00Z')), dDec = X._sunPos(Date.parse('2026-12-21T12:00:00Z')), dMar = X._sunPos(Date.parse('2026-03-20T12:00:00Z'));
ok(Math.abs(dJun.dec - 23.44) < 0.2 && Math.abs(dDec.dec + 23.44) < 0.2, 'solstices: the sun stands over the tropics (' + dJun.dec.toFixed(2) + '°, ' + dDec.dec.toFixed(2) + '°)');
ok(Math.abs(dMar.dec) < 0.6, 'equinox: over the equator (' + dMar.dec.toFixed(2) + '°)');
const nov = X._sunPos(Date.parse('2026-11-03T12:00:00Z'));
ok(nov.lon < -3.5 && nov.lon > -4.6, 'equation of time: early November the sun is ~16 min early, so 4° west of Greenwich at 12:00 UTC (' + nov.lon.toFixed(2) + '°)');
const s0 = X._sunPos(Date.parse('2026-10-13T21:55:00Z'));
ok(X._sunAlt(48.86, 2.35, s0) < -18 && X._sunAlt(-33.87, 151.21, s0) > 0, '13 Oct 21:55 UTC: Paris in full night, Sydney in daylight');

// ── projection ──
const REF = [[[2.35, 48.86], [485.55, 119.32]], [[-74, 40.7], [297.86, 144.25]], [[151.2, -33.9], [862.45, 376.08]], [[-179.5, 66], [105.17, 70.16]], [[0, 89.9], [480, 20.23]], [[20, -85], [513.49, 515.89]]];
ok(REF.every(([g, p]) => { const q = X._neProj(M, g[0], g[1]); return Math.abs(q[0] - p[0]) < 0.06 && Math.abs(q[1] - p[1]) < 0.06; }), 'the browser projection lands where d3-geo put the map (6 reference points, < 0.06 px)');

// ── night shape ──
const sJun = X._sunPos(Date.parse('2026-06-21T00:00:00Z'));
const span0 = X._geoNightSpan(0, sJun, -0.833);
ok(span0 && span0[0] === -90 && span0[1] > 60 && span0[1] < 70, 'June, midnight on Greenwich: night from the South Pole up to ~66° N, the Arctic stays lit');
ok(X._sunAlt(89.9, 0, sJun) > 0 && X._sunAlt(-89.9, 0, sJun) < 0, 'midnight sun in the north, polar night in the south');
const dJ = X._geoNightPath(M, sJun, -0.833);
ok(/^M[\d.,L-]+Z/.test(dJ) && (dJ.match(/M/g) || []).length <= 2, 'one solid shape per layer (two at most across the antimeridian), no strips');
const svg = X._geoNightSvg(M);
ok((svg.match(/class="geonight"/g) || []).length === 4 && /class="geosun"/.test(svg), 'four layers (sunset, civil, nautical, astronomical) and the sun');
ok(api(M, false, fixedNow(Date.now()))._geoNightSvg(M) === '', 'nothing drawn when « Day / night » is off');

// ── sunsets, legal time ──
const hm = (t, z) => X._geoLegalTime(t, z);
const mins = (s) => +s.slice(0, 2) * 60 + +s.slice(3);
const between = (s, a, b) => mins(s) >= mins(a) && mins(s) <= mins(b);
const ssOslo = hm(X._geoSunset(Date.parse('2026-06-21T20:00:00Z'), 59.91, 10.75), 'Europe/Oslo');
const ssSyd = hm(X._geoSunset(Date.parse('2026-12-21T09:00:00Z'), -33.87, 151.21), 'Australia/Sydney');
const ssPar = hm(X._geoSunset(Date.parse('2026-10-13T20:00:00Z'), 48.86, 2.35), 'Europe/Paris');
ok(between(ssOslo, '22:40', '22:48'), 'Oslo, 21 June: sunset ' + ssOslo + ' (summer time)');
ok(between(ssSyd, '20:02', '20:10'), 'Sydney, 21 December: sunset ' + ssSyd + ' (southern summer time)');
ok(between(ssPar, '19:01', '19:08'), 'Paris, 13 October: sunset ' + ssPar);
ok(X._geoSunset(Date.parse('2026-12-21T12:00:00Z'), 69.65, 18.96) === null && X._geoSunset(Date.parse('2026-06-21T12:00:00Z'), 69.65, 18.96) === null, 'Tromsø: no sunset at either solstice (polar night, polar day)');
const card = X._geoNightCard('NO');
ok(/^<p class="muted note">Local time 23:55 · sunset 1[78]:\d\d · night<\/p>$/.test(card), 'country card: local time, sunset, state (' + card.replace(/<[^>]+>/g, '') + ')');
ok(/\(main zone of \d+\)/.test(X._geoNightCard('US')), 'a country on several zones says its main zone is used');

// ── asset ──
const keys = Object.keys(M.c);
ok(M.proj && M.proj.k > 0 && keys.every((k) => Array.isArray(M.ct[k]) && M.tz[k]), 'asset: projection, centroid and zone for every country drawn');
ok(keys.every((k) => { const z = Array.isArray(M.tz[k]) ? M.tz[k][0] : M.tz[k]; try { new Intl.DateTimeFormat('en', { timeZone: z }); return true; } catch (e) { return false; } }), 'every zone is a valid IANA name');
ok((Array.isArray(M.tz.US) ? M.tz.US[0] : M.tz.US) === 'America/New_York' && M.tz.FR === 'Europe/Paris', 'multi-zone countries use their main zone (US → New York, FR → Paris)');

// ── admin wiring ──
ok(/<button id="geoNightBtn" class="use" type="button" aria-pressed="true"[^>]*>Day \/ night<\/button>/.test(admin), 'the World card has the « Day / night » button, on by default');
ok(/_geoNight=localStorage\.getItem\('pth_admin_geo_night'\)!=='0'/.test(admin) && /localStorage\.setItem\('pth_admin_geo_night'/.test(admin), 'remembered per browser');
ok(/\+\(_geoNight&&M\.proj\?_geoSphere\(M\):''\)\+paths\.join\(''\)\+_geoNightSvg\(M\)\+'<\/svg>'/.test(admin), 'drawn over the countries, under nothing clickable');
ok(/setInterval\(function\(\)\{ var m=\$\('geoMap'\); if\(_geoNight && _geoData && m && m\.offsetParent\) renderGeo\(\); \},60000\);/.test(admin), 'moves on every minute, only while the map is on screen');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
