#!/usr/bin/env node
// Deterministic guards for /starting-hands, its figures and its translation
// table (seo-i18n/starting.js). Run: node scripts/test-seo-starting.mjs (~15 s)
//
// 1. figures: seo-i18n/starting-hands.json holds the 169 hand types in chart
//    order (pairs on the diagonal, suited above, offsuit below), 1,326 combos,
//    ranks 1..169 by heads-up chance; a few hands re-simulated with the
//    client's own evaluator (game/cards.mjs) land within sampling error, and
//    each hand reproduces exactly from the generator's seed (spot check).
//    The full recomputation is `node scripts/gen-starting-hands.mjs --check`.
// 2. English: snippet-sized head, every {placeholder} known, the claims the
//    text makes about the data (who climbs, who falls, the last hand) hold;
// 3. translations: every field, the same {placeholders} as English, no HTML;
// 4. wiring: route, nav (gated), crawler block, sitemap, IndexNow, llms.txt,
//    admin coverage, links from /hand-rankings and /poker-odds.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { hands, equity, TRIALS } from './gen-starting-hands.mjs';
import { evaluateBestHand, _cmpHand } from '../public/modules/game/cards.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const src = readFileSync(join(root, 'proxy.js'), 'utf8');
const T = require(join(root, 'seo-i18n', 'starting.js'));
const DATA = JSON.parse(readFileSync(join(root, 'seo-i18n', 'starting-hands.json'), 'utf8'));
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

// 1. Figures
const H = DATA.hands, by = Object.fromEntries(H.map((h) => [h.name, h]));
ok(H.length === 169 && H.reduce((a, h) => a + h.combos, 0) === 1326, '169 hand types, 1,326 combinations');
ok(H.filter((h) => h.kind === 'pair').length === 13 && H.filter((h) => h.kind === 'suited').length === 78, '13 pairs, 78 suited, 78 offsuit');
ok(H.every((h, k) => h.row === Math.floor(k / 13) && h.col === k % 13 && (h.kind === 'pair') === (h.row === h.col) && (h.kind === 'suited') === (h.col > h.row)), 'chart order: pairs on the diagonal, suited above, offsuit below');
ok(JSON.stringify(H.map((h) => h.rank).sort((a, b) => a - b)) === JSON.stringify(Array.from({ length: 169 }, (_, i) => i + 1)), 'ranks 1..169, each once');
ok(H.every((a) => H.every((b) => a.rank >= b.rank || a.vs1 >= b.vs1)), 'ranked by heads-up chance');
ok(H.every((h) => h.vs1 > h.vs3 && h.vs3 > h.vs6), 'every hand wins less often against more opponents');
const gen = hands();
const spot = ['AA', '72o', 'T9s'].map((nm) => { const k = gen.findIndex((h) => h.name === nm); return [nm, Math.round(equity(gen[k].cards, 1, TRIALS[1] / 10, 1000 * (k + 1) + 1) * 1e5) / 1e5]; });
ok(spot.every(([nm, v]) => Math.abs(v - by[nm].vs1) < 0.004), 'generator spot check (a tenth of the deals, same seed) agrees within 0.4 point');
// Independent check with the client's evaluator.
const R = '23456789TJQKA', idx = (c) => 'dhsc'.indexOf(c[1]) * 13 + R.indexOf(c[0]);
let seed = 99; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
for (const [nm, hole] of [['AA', ['As', 'Ah']], ['AKo', ['As', 'Kh']], ['76s', ['7s', '6s']]]) {
  const me = hole.map(idx), deck = []; for (let c = 0; c < 52; c++) if (!me.includes(c)) deck.push(c);
  let eq = 0; const N = 40000;
  for (let t = 0; t < N; t++) {
    const d = deck.slice(); for (let i = 0; i < 7; i++) { const j = i + Math.floor(rnd() * (d.length - i)); [d[i], d[j]] = [d[j], d[i]]; }
    const c = _cmpHand(evaluateBestHand(me, d.slice(0, 5)), evaluateBestHand([d[5], d[6]], d.slice(0, 5)));
    eq += c > 0 ? 1 : c === 0 ? 0.5 : 0;
  }
  ok(Math.abs(eq / N - by[nm].vs1) < 0.01, `${nm} heads-up: ${(by[nm].vs1 * 100).toFixed(1)}% here, ${(eq / N * 100).toFixed(1)}% with game/cards.mjs`);
}

// 2. English
const EN = lift('_SEO_START'), keys = Object.keys(EN);
const VARS = ['combos', 'aa1', 'aa6', 'ako1', 'ako6', 'aks1', 'qq1', 'qqak', 'suitGain', 'suitMin', 'suitMax', 'w32', 'w72', 'r72',
  'r76s1', 'r76s6', 'rjts1', 'rjts6', 'r77_1', 'r77_6', 'rk6o1', 'rk6o6', 'pairCombos', 'suitedCombos', 'offCombos', 'pairPct', 'suitedPct', 'offPct'];
const ph = (s) => (String(s).match(/\{([a-z0-9_]+)\}/gi) || []).map((x) => x.slice(1, -1)).sort();
const flat = (v) => Array.isArray(v) ? v.flat().join(' ') : String(v);
ok([...EN.title].length <= 60, `English title fits a snippet (${[...EN.title].length})`);
ok([...EN.desc].length <= 170, `English description (${[...EN.desc].length})`);
ok(keys.every((k) => ph(flat(EN[k])).every((p) => VARS.includes(p))), 'English: every {placeholder} is one the page fills');
ok(VARS.every((v) => (src.match(new RegExp('[{,\\s]' + v + ': ')) || []).length), 'every placeholder has a value in _seoStartVars');
// …and the page's filler really replaces them (it once skipped names with '_').
{ const fill = new Function((src.match(/function _seoFill\(s, v\) \{[^\n]*\}/) || [''])[0] + '; return _seoFill;')();
  const v = Object.fromEntries(VARS.map((k) => [k, 'X']));
  ok(keys.every((k) => !/\{[a-z0-9_]+\}/i.test(fill(flat(EN[k]), v))), 'every placeholder is replaced by the page\u2019s filler'); }
const r6 = Object.fromEntries(H.slice().sort((a, b) => b.vs6 - a.vs6 || (a.name < b.name ? -1 : 1)).map((h, i) => [h.name, i + 1]));
ok(r6['76s'] < by['76s'].rank && r6.JTs < by.JTs.rank, 'claim: suited connectors climb against six opponents');
ok(r6['77'] > by['77'].rank && r6.K6o > by.K6o.rank, 'claim: medium pairs and weak-kicker offsuit hands drop');
ok(r6['72o'] === 169 && by['32o'].rank === 169 && r6.AA === 1, 'claim: 32o last heads-up, 72o last against six, AA first in both');
ok(EN.cols.length === 5 && EN.faq.length === 5 && !/[<>]/.test(keys.map((k) => flat(EN[k])).join(' ')), 'English: 5 columns, 5 questions, no HTML');

// 3. Translations
const codes = Object.keys(T);
ok(!('en' in T), 'English is not in the table — it lives in proxy.js');
console.log(`  · ${codes.length} translation(s)`);
for (const code of codes) {
  const p = T[code];
  const miss = keys.filter((k) => Array.isArray(EN[k])
    ? (!Array.isArray(p[k]) || p[k].length !== EN[k].length || (Array.isArray(EN[k][0]) && p[k].some((x) => !Array.isArray(x) || x.length !== 2 || x.some((y) => !String(y || '').trim()))) || flat(p[k]).trim() === '')
    : (typeof p[k] !== 'string' || !p[k].trim()));
  ok(miss.length === 0, `${code}: complete${miss.length ? ' — missing ' + miss.join(', ') : ''}`);
  const off = keys.filter((k) => Array.isArray(EN[k]) && Array.isArray(EN[k][0])
    ? EN[k].some((pair, i) => pair.some((s, j) => JSON.stringify(ph(s)) !== JSON.stringify(ph(p[k] && p[k][i] && p[k][i][j]))))
    : JSON.stringify(ph(flat(EN[k]))) !== JSON.stringify(ph(flat(p[k]))));
  ok(off.length === 0, `${code}: same {placeholders} as English${off.length ? ' — ' + off.join(', ') : ''}`);
  ok(!/[<>]/.test(keys.map((k) => flat(p[k])).join(' ')) && !/["<>]/.test(p.title + p.desc + p.ldHeadline + p.ldDesc), `${code}: no HTML, attribute-safe head`);
  ok(Object.keys(p).every((k) => keys.includes(k)), `${code}: no unknown field`);
}

// 4. Wiring
ok(/reqPathOnly === '\/starting-hands'/.test(src) && /function seoStartPage\(/.test(src), 'route and page builder');
ok(/_seoStartIn\(lang\) \? '<a href="' \+ _seoLangHref\('\/starting-hands', SEO_START_I18N, lang\)/.test(src), 'nav link gated on the language');
ok(/_seoPageUrls\(_sBase, '\/starting-hands'/.test(src) && /base \+ '\/starting-hands'/.test(src) && /'\/starting-hands\?lang=' \+ c/.test(src), 'sitemap and IndexNow, with its languages');
ok(/\/starting-hands\\n/.test(src) && /\['\/starting-hands', seoPageLangs\(SEO_START_I18N\)\.length\]/.test(src), 'llms.txt and admin coverage');
ok(/body \+= _seoOddsLink\(lang\) \+ _seoStartLink\(lang\);/.test(src) && /tr\.startP\) \+ '<\/p>' \+ _seoStartLink\(lang\)/.test(src), 'linked from /hand-rankings and from the starting-hand section of /poker-odds');
ok(/SEO_START_I18N = require\('\.\/seo-i18n\/starting\.js'\)/.test(src) && /require\('\.\/seo-i18n\/starting-hands\.json'\)/.test(src), 'translation table and figures loaded');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
