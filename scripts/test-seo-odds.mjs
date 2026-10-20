#!/usr/bin/env node
// Deterministic guards for /poker-odds, its figures and its translation table
// (seo-i18n/odds.js). Run: node scripts/test-seo-odds.mjs   (~10 s)
//
// 1. figures: seo-i18n/odds-data.json is exactly what
//    scripts/gen-poker-odds.mjs computes (exact enumeration of every board
//    for the matchups, combinatorics for outs and starting hands), and a few
//    of them match independent arithmetic;
// 2. English: snippet-sized title and description, every {placeholder} known,
//    one label per draw, starting hand and column;
// 3. translations: every field, the same {placeholders} as the English in
//    each text, no digits typed into the prose that carries placeholders,
//    no HTML, attribute-safe head fields;
// 4. wiring: route, nav (gated on the language), crawler block, sitemap,
//    IndexNow, llms.txt, admin coverage.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { compute } from './gen-poker-odds.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const src = readFileSync(join(root, 'proxy.js'), 'utf8');
const T = require(join(root, 'seo-i18n', 'odds.js'));
const DATA = JSON.parse(readFileSync(join(root, 'seo-i18n', 'odds-data.json'), 'utf8'));
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
ok(JSON.stringify(compute()) === JSON.stringify(DATA), 'odds-data.json matches a fresh computation');
const m = Object.fromEntries(DATA.matchups.map((r) => [r.id, r]));
ok(DATA.matchups.every((r) => r.boards === 1712304), 'every matchup counted over C(48,5) = 1,712,304 boards');
ok(DATA.matchups.every((r) => Math.abs(r.winA + r.tie + r.winB - 1) < 1e-12), 'win + tie + lose = 1');
ok(m['aa-kk'].winA > 0.8 && m['aa-kk'].winA < 0.82, 'AA beats KK about 81% of the time');
const o9 = DATA.outs.find((r) => r.outs === 9);
ok(Math.abs(o9.flopToRiver - (1 - 38 * 37 / (47 * 46))) < 1e-12 && Math.abs(o9.river - 9 / 46) < 1e-12, '9 outs: 1 − 38·37/(47·46) by the river, 9/46 on the river');
ok(DATA.starting.find((r) => r.id === 'specificPair').combos * 221 === 1326, 'a given pocket pair: 1 in 221');

// 2. English
const EN = lift('_SEO_ODDS');
const keys = Object.keys(EN);
const VARS = ['f9turn', 'f9one', 'f9river', 'f15river', 'boards', 'combos', 'aakk', 'kkaa', 'qqak', '22ak'];
// {n} is filled by the calculator itself (number of deals), only in its texts.
const CALC_VARS = ['n'];
const ph = (s) => (String(s).match(/\{([a-z0-9]+)\}/gi) || []).map((x) => x.slice(1, -1)).sort();
const flat = (v) => Array.isArray(v) ? v.flat().join(' ') : (v && typeof v === 'object') ? Object.values(v).join(' ') : String(v);
ok([...EN.title].length <= 60, `English title fits a snippet (${[...EN.title].length})`);
ok([...EN.desc].length <= 160, `English description fits a snippet (${[...EN.desc].length})`);
ok(keys.every((k) => ph(flat(EN[k])).every((p) => (k === 'calc' ? CALC_VARS : VARS).includes(p))), 'English: every {placeholder} is one the page or the calculator fills');
ok(['h2', 'intro', 'you', 'board', 'opp', 'players', 'pick', 'clear', 'win', 'tie', 'lose', 'exact', 'sim', 'working', 'need', 'boardHint', 'oppHint', 'final', 'noscript'].every((k) => String(EN.calc[k] || '').trim()), 'English: every calculator text');
ok(/<script type="module" src="\/modules\/seo\/odds-calc\.mjs"><\/script>/.test(src) && /replace\(\/<\/g, '\\\\u003c'\)/.test(src), 'calculator loaded, its JSON cannot close the script element');
ok(DATA.outs.every((r) => EN.draws[r.id]) && DATA.starting.every((r) => EN.starting[r.id]), 'English: a label for every draw and starting hand');
ok(EN.outsCols.length === 5 && EN.matchCols.length === 5 && EN.startCols.length === 3 && EN.faq.length === 5, 'English: column and question counts');
ok(/function seoOddsPage\(/.test(src) && /_seoOddsVars\(lang\)/.test(src), 'page builder fills the placeholders per language');

// 3. Translations
const codes = Object.keys(T);
ok(!('en' in T), 'English is not in the table — it lives in proxy.js');
console.log(`  · ${codes.length} translation(s)`);
for (const code of codes) {
  const p = T[code];
  const miss = keys.filter((k) => {
    const e = EN[k], v = p[k];
    if (Array.isArray(e)) return !Array.isArray(v) || v.length !== e.length || flat(v).trim() === '' ||
      (Array.isArray(e[0]) && v.some((x) => !Array.isArray(x) || x.length !== e[0].length || x.some((y) => !String(y || '').trim())));
    if (e && typeof e === 'object') return !v || Object.keys(e).some((kk) => !String(v[kk] || '').trim());
    return typeof v !== 'string' || !v.trim();
  });
  ok(miss.length === 0, `${code}: complete${miss.length ? ' — missing ' + miss.join(', ') : ''}`);
  const phOff = keys.filter((k) => {
    if (Array.isArray(EN[k]) && Array.isArray(EN[k][0])) return EN[k].some((pair, i) => pair.some((s, j) => JSON.stringify(ph(s)) !== JSON.stringify(ph(p[k] && p[k][i] && p[k][i][j]))));
    return JSON.stringify(ph(flat(EN[k]))) !== JSON.stringify(ph(flat(p[k])));
  });
  ok(phOff.length === 0, `${code}: same {placeholders} as English${phOff.length ? ' — ' + phOff.join(', ') : ''}`);
  ok(!/[<>]/.test(keys.map((k) => flat(p[k])).join(' ')), `${code}: no HTML`);
  ok(!/["<>]/.test(p.title + p.desc + p.ldHeadline + p.ldDesc), `${code}: head fields are attribute-safe`);
  ok(Object.keys(p).every((k) => keys.includes(k)), `${code}: no unknown field`);
}

// 4. Wiring
ok(/reqPathOnly === '\/poker-odds'/.test(src), 'route /poker-odds');
ok(/_seoOddsIn\(lang\) \? '<a href="' \+ _seoLangHref\('\/poker-odds', SEO_ODDS_I18N, lang\)/.test(src), 'nav link gated on the language');
ok((src.match(/_seoLangHref\('\/poker-odds', SEO_ODDS_I18N, lang\)/g) || []).length >= 3, 'nav, crawler block and page-href resolver link to it');
ok(/_seoPageUrls\(_sBase, '\/poker-odds'/.test(src), 'listed in the sitemap');
ok(/base \+ '\/poker-odds'/.test(src) && /'\/poker-odds\?lang=' \+ c/.test(src), 'submitted through IndexNow, with its languages');
ok(/\/poker-odds\\n/.test(src), 'linked from llms.txt');
ok(/\['\/poker-odds', seoPageLangs\(SEO_ODDS_I18N\)\.length\]/.test(src), 'counted in the admin translation coverage');
ok(/body \+= _seoOddsLink\(lang\)[^\n]*\n  seoContentPage\(res, method, title, desc, '\/hand-rankings'/.test(src) && /body \+= _seoOddsLink\(lang\);[^\n]*\n  seoContentPage\(res, method, title, desc, '\/glossary'/.test(src), '/hand-rankings and /glossary link to it, in the reader\u2019s language');
ok(/SEO_ODDS_I18N = require\('\.\/seo-i18n\/odds\.js'\)/.test(src) && /require\('\.\/seo-i18n\/odds-data\.json'\)/.test(src), 'translation table and figures loaded');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
