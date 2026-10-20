#!/usr/bin/env node
// Deterministic guards for /play-against-computer and its translation table,
// seo-i18n/bots.js. Run: node scripts/test-seo-bots.mjs
//
// 1. facts: what the page says about the bots matches the code it describes —
//    the four difficulty levels and the mixed split (modules/offline/server.mjs
//    and bots.mjs), the five playing styles (ARCHETYPES), up to 9 opponents
//    (maxPlayers clamp), « more than thirty » trophies in six categories
//    (achievements/defs.mjs);
// 2. English: snippet-sized title/description, pair counts, no HTML;
// 3. translations: every field, same pair counts, no HTML, attribute-safe head;
// 4. wiring: route, nav (gated on the language), crawler block, sitemap,
//    IndexNow, llms.txt, admin coverage, the /faq link.
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const src = readFileSync(join(root, 'proxy.js'), 'utf8');
const T = require(join(root, 'seo-i18n', 'bots.js'));
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
const EN = lift('_SEO_BOTS');
const keys = Object.keys(EN);
const PAIRS = { steps: 3, levels: 4, styles: 5, faq: 5 };

// 1. Facts
const bots = await import(pathToFileURL(join(root, 'public/modules/offline/bots.mjs')).href);
const server = readFileSync(join(root, 'public/modules/offline/server.mjs'), 'utf8');
const defs = await import(pathToFileURL(join(root, 'public/modules/achievements/defs.mjs')).href);
ok(bots.skillOf('easy').samples < bots.skillOf('normal').samples && bots.skillOf('normal').samples < bots.skillOf('hard').samples && bots.skillOf('nope') === bots.skillOf('normal'), 'easy, normal and hard skill levels exist, in order of precision');
ok(/skill = r < 0\.30 \? 'easy' : \(r < 0\.80 \? 'normal' : 'hard'\)/.test(server) && /opts\.botSkill \|\| 'mixed'/.test(server), 'mixed is the default: 30% easy, 50% normal, 20% hard');
ok(Object.keys(bots.ARCHETYPES).length === EN.styles.length, `${EN.styles.length} playing styles, as many as ARCHETYPES`);
ok(/Math\.min\(10, n\(3, this\.cfg\.maxPlayers\)\)/.test(server) && /up to 9/i.test(EN.desc + EN.faq[2][1]), 'up to 10 seats, so 9 computer opponents');
const cats = new Set(defs.ACHIEVEMENTS.map((a) => a.cat));
ok(defs.ACHIEVEMENTS.length > 30 && cats.size === 6 && /more than thirty trophies in six categories/.test(EN.trophiesP), `« more than thirty trophies in six categories » (${defs.ACHIEVEMENTS.length} in ${cats.size})`);
ok(defs.ACHIEVEMENTS.some((a) => a.id === 'nine_hard'), 'the « nine hard bots » trophy exists');
ok(bots.skillOf('easy').pushfold === false && bots.skillOf('normal').pushfold === true, 'all-in-or-fold play from the normal level up');

// 2. English
ok([...EN.title].length <= 60, `English title fits a snippet (${[...EN.title].length})`);
ok([...EN.desc].length <= 160, `English description fits a snippet (${[...EN.desc].length})`);
const pairsOk = (v, len) => Array.isArray(v) && v.length === len && v.every((x) => Array.isArray(x) && x.length === 2 && x.every((y) => String(y || '').trim()));
ok(Object.entries(PAIRS).every(([k, len]) => pairsOk(EN[k], len)), 'English: 3 steps, 4 levels, 5 styles, 5 questions');
const flat = (v) => Array.isArray(v) ? v.flat().join(' ') : String(v);
ok(!/[<>]/.test(keys.map((k) => flat(EN[k])).join(' ')), 'English: no HTML');

// 3. Translations
const codes = Object.keys(T);
ok(!('en' in T), 'English is not in the table — it lives in proxy.js');
console.log(`  · ${codes.length} translation(s)`);
for (const code of codes) {
  const p = T[code];
  const miss = keys.filter((k) => PAIRS[k] ? !pairsOk(p[k], PAIRS[k]) : (typeof p[k] !== 'string' || !p[k].trim()));
  ok(miss.length === 0, `${code}: complete${miss.length ? ' — missing ' + miss.join(', ') : ''}`);
  ok(!/[<>]/.test(keys.map((k) => flat(p[k])).join(' ')), `${code}: no HTML`);
  ok(!/["<>]/.test(p.title + p.desc + p.ldHeadline + p.ldDesc), `${code}: head fields are attribute-safe`);
  ok(Object.keys(p).every((k) => keys.includes(k)), `${code}: no unknown field`);
}

// 4. Wiring
ok(/reqPathOnly === '\/play-against-computer'/.test(src) && /function seoBotsPage\(/.test(src), 'route and page builder');
ok(/_seoBotsIn\(lang\) \? '<a href="' \+ _seoLangHref\('\/play-against-computer', SEO_BOTS_I18N, lang\)/.test(src), 'nav link gated on the language');
ok((src.match(/_seoLangHref\('\/play-against-computer', SEO_BOTS_I18N, lang\)/g) || []).length >= 4, 'nav, crawler block, page-href resolver and /faq link');
ok(/_seoPageUrls\(_sBase, '\/play-against-computer'/.test(src), 'listed in the sitemap');
ok(/base \+ '\/play-against-computer'/.test(src) && /'\/play-against-computer\?lang=' \+ c/.test(src), 'submitted through IndexNow, with its languages');
ok(/\/play-against-computer\\n/.test(src), 'linked from llms.txt');
ok(/\['\/play-against-computer', seoPageLangs\(SEO_BOTS_I18N\)\.length\]/.test(src), 'counted in the admin translation coverage');
const FAQ = lift('_SEO_FAQ'), ix = Number((src.match(/var _SEO_FAQ_BOTS_IX = (\d+);/) || [])[1]);
ok(FAQ[ix] && /against the computer\?$/.test(FAQ[ix][0]), `/faq links to it under « ${FAQ[ix] && FAQ[ix][0]} »`);
ok(/SEO_BOTS_I18N = require\('\.\/seo-i18n\/bots\.js'\)/.test(src), 'translation table loaded');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
