#!/usr/bin/env node
// Deterministic guards for /competitions and its translation table,
// seo-i18n/competitions.js. Run: node scripts/test-seo-competitions-i18n.mjs
//
// 1. completeness: every language has every field of the English _SEO_COMP,
//    filled, with four "how to take part" steps — a half-filled entry would
//    publish a half-English page under a localized URL;
// 2. links: the *Links fields carry exactly the English hrefs, in order, and
//    no other HTML — a mistyped calendar URL would send readers nowhere;
// 3. head safety: title and description go into attributes unescaped, so they
//    must hold no quote or angle bracket;
// 4. coming dates: the pure helpers of the page (lifted from proxy.js) keep
//    only future dates within the window, add the next WeCup daily game at
//    22:00 Berlin time, and drop it when a WeCup final takes that evening.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const src = readFileSync(join(root, 'proxy.js'), 'utf8');
const T = require(join(root, 'seo-i18n', 'competitions.js'));
const communityEvents = require(join(root, 'server', 'community-events.js'));
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

function lift(name) {
  const i = src.indexOf('var ' + name + ' = ');
  if (i < 0) throw new Error('no ' + name);
  let j = i + ('var ' + name + ' = ').length, d = 0, k = j;
  for (; k < src.length; k++) {
    const ch = src[k];
    if (ch === "'" || ch === '"') { const q = ch; k++; while (src[k] !== q) { if (src[k] === '\\') k++; k++; } continue; }
    if (ch === '{' || ch === '[') d++;
    else if (ch === '}' || ch === ']') { d--; if (!d) break; }
  }
  return new Function('return ' + src.slice(j, k + 1))();
}
function fn(name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let depth = 0;
  for (let j = src.indexOf('{', head); j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(head, j + 1); }
  }
  return '';
}

const EN = lift('_SEO_COMP');
const keys = Object.keys(EN);
const hrefs = (s) => (String(s).match(/href="[^"]*"/g) || []);
const codes = Object.keys(T);
ok(codes.length >= 82, `${codes.length} languages translated`);
ok(!('en' in T), 'English is not in the table — it lives in proxy.js');

for (const code of codes) {
  const p = T[code];
  const missing = keys.filter(k => {
    if (k === 'join') return !Array.isArray(p.join) || p.join.length !== EN.join.length || p.join.some(x => !String(x || '').trim());
    if (k === 'up') return !p.up || Object.keys(EN.up).some(u => !String(p.up[u] || '').trim());
    return typeof p[k] !== 'string' || !p[k].trim();
  });
  ok(missing.length === 0, `${code}: complete${missing.length ? ' — missing ' + missing.join(', ') : ''}`);
  const linkKeys = keys.filter(k => /Links$/.test(k));
  ok(linkKeys.every(k => JSON.stringify(hrefs(p[k])) === JSON.stringify(hrefs(EN[k]))), `${code}: links identical to English`);
  const noHtml = keys.filter(k => !/Links$/.test(k) && k !== 'join' && k !== 'up').every(k => !/[<>]/.test(p[k]));
  ok(noHtml && p.join.every(x => !/[<>]/.test(x)), `${code}: no HTML outside the link fields`);
  ok(!/["<>]/.test(p.title + p.desc), `${code}: title and description are attribute-safe`);
  ok(p.bbcH2 === 'BBC' && p.mcH2 === 'Monthly Cup' && p.wecH2 === 'WeCup (WEC)', `${code}: competition names untouched`);
}

// Wiring: route, nav, sitemap, IndexNow and llms.txt all know the page.
ok(/reqPathOnly === '\/competitions'/.test(src), 'route /competitions');
ok(/_seoLangHref\('\/competitions', SEO_COMP_I18N, lang\)/.test(src), 'nav and crawler block link to it, language kept');
ok(/_seoPageUrls\(_sBase, '\/competitions'/.test(src), 'listed in the sitemap');
ok(/base \+ '\/competitions'/.test(src), 'submitted through IndexNow');
ok(/\/competitions\\n/.test(src), 'linked from llms.txt');

// Coming dates (pure helpers, run against a fixed clock).
const S = (0, eval)(`(function (communityEvents) {
  var _SEO_COMP_DAYS = 45, _SEO_COMP_MAX = 8;
  ${fn('_seoCompUpcoming')}
  ${fn('_seoCompLabel')}
  return { up: _seoCompUpcoming, label: _seoCompLabel };
})`)(communityEvents);
const now = communityEvents.zonedToEpoch('2026-10-15 15:00');
const at = (s) => communityEvents.zonedToEpoch(s);
let list = S.up([
  { src: 'bbc', kind: 'step', at: at('2026-10-16 20:00') },
  { src: 'bbc', kind: 'step', at: at('2026-10-14 20:00') },
  { src: 'mc', kind: 'cup', at: at('2027-03-01 20:00') },
  { src: 'mc', kind: 'cup', at: at('2026-11-01 19:00') }
], now);
ok(list.length === 3, 'past dates and dates beyond the window are dropped');
ok(list[0].src === 'wec' && list[0].kind === 'daily' && list[0].at === at('2026-10-15 22:00'), 'next WeCup daily game: tonight 22:00 Berlin');
ok(list[1].src === 'bbc' && list[2].src === 'mc', 'sorted by date');
list = S.up([], at('2026-10-15 22:30'));
ok(list.length === 1 && list[0].at === at('2026-10-16 22:00'), 'after 22:00 the daily game is tomorrow’s');
list = S.up([{ src: 'wec', kind: 'final', grand: false, at: at('2026-10-15 22:00') }], now);
ok(list.length === 1 && list[0].kind === 'final', 'no daily game on the evening of a WeCup final');
ok(S.label({ src: 'wec', kind: 'final', grand: true }, EN.up) === EN.up.wecGrand, 'grand final labelled as such');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
