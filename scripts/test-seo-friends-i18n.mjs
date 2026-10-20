#!/usr/bin/env node
// Deterministic guards for /play-with-friends and its translation table,
// seo-i18n/friends.js. Run: node scripts/test-seo-friends-i18n.mjs
//
// 1. English: title and description fit a result snippet (≤ 60 / ≤ 160
//    characters), three steps, five questions, attribute-safe head fields;
// 2. completeness of every translation: every English field, filled, with the
//    same number of steps and questions — a half-filled entry would publish a
//    half-English page under a localized URL;
// 3. markup: no HTML beyond the <strong> tags (UI labels) and links; every
//    field carries exactly the English hrefs, in order (a mistyped install
//    guide URL would send readers nowhere); attribute-safe title/description;
// 4. wiring: route, nav, crawler block, sitemap, IndexNow, llms.txt and the
//    admin coverage check all know the page, and the nav/crawler links are
//    gated on the reader's language.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const src = readFileSync(join(root, 'proxy.js'), 'utf8');
const T = require(join(root, 'seo-i18n', 'friends.js'));
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

const EN = lift('_SEO_FRIENDS');
const keys = Object.keys(EN);
const pairs = (a, len) => Array.isArray(a) && a.length === len &&
  a.every(x => Array.isArray(x) && x.length === 2 && x.every(y => String(y || '').trim()));
const extraHtml = (s) => /<(?!\/?strong>|a href="https:\/\/[^"<>]+">|\/a>)[^>]*>/.test(String(s));
const hrefs = (v) => (String(Array.isArray(v) ? v.flat().join(' ') : v).match(/href="[^"]*"/g) || []);

// 1. English
ok([...EN.title].length <= 60, `English title fits a snippet (${[...EN.title].length} chars)`);
ok([...EN.desc].length <= 160, `English description fits a snippet (${[...EN.desc].length} chars)`);
ok(pairs(EN.steps, 3), 'English: three steps');
ok(pairs(EN.faq, 5), 'English: five questions');
ok(!/["<>]/.test(EN.title + EN.desc + EN.ldHeadline + EN.ldDesc), 'English head fields are attribute-safe');
ok(!keys.some(k => extraHtml(Array.isArray(EN[k]) ? EN[k].flat().join(' ') : EN[k])), 'English: no HTML beyond <strong> and links');
ok(hrefs(EN.ownP).includes('href="https://github.com/narmod/pokerth-web-client#self-hosting"'), 'English: self-hosting section links to the install guide');

// 2–3. Translations
const codes = Object.keys(T);
ok(!('en' in T), 'English is not in the table — it lives in proxy.js');
console.log(`  · ${codes.length} translation(s)`);
for (const code of codes) {
  const p = T[code];
  const missing = keys.filter(k => {
    if (k === 'steps') return !pairs(p.steps, EN.steps.length);
    if (k === 'faq') return !pairs(p.faq, EN.faq.length);
    return typeof p[k] !== 'string' || !p[k].trim();
  });
  ok(missing.length === 0, `${code}: complete${missing.length ? ' — missing ' + missing.join(', ') : ''}`);
  ok(!keys.some(k => extraHtml(Array.isArray(p[k]) ? p[k].flat().join(' ') : p[k])), `${code}: no HTML beyond <strong> and links`);
  ok(keys.every(k => JSON.stringify(hrefs(p[k])) === JSON.stringify(hrefs(EN[k]))), `${code}: links identical to English`);
  ok(!/["<>]/.test(p.title + p.desc + p.ldHeadline + p.ldDesc), `${code}: head fields are attribute-safe`);
  ok(Object.keys(p).every(k => keys.includes(k)), `${code}: no unknown field`);
}

// 4. Wiring
ok(/reqPathOnly === '\/play-with-friends'/.test(src), 'route /play-with-friends');
ok(/function seoFriendsPage\(/.test(src), 'page builder');
ok(/_seoFriendsIn\(lang\) \? '<a href="' \+ _seoLangHref\('\/play-with-friends', SEO_FRIENDS_I18N, lang\)/.test(src), 'nav link gated on the language');
ok((src.match(/_seoLangHref\('\/play-with-friends', SEO_FRIENDS_I18N, lang\)/g) || []).length >= 2, 'nav and crawler block both link to it');
ok(/_seoPageUrls\(_sBase, '\/play-with-friends'/.test(src), 'listed in the sitemap');
ok(/base \+ '\/play-with-friends'/.test(src) && /'\/play-with-friends\?lang=' \+ c/.test(src), 'submitted through IndexNow, with its languages');
ok(/\/play-with-friends\\n/.test(src), 'linked from llms.txt');
ok(/\['\/play-with-friends', seoPageLangs\(SEO_FRIENDS_I18N\)\.length\]/.test(src), 'counted in the admin translation coverage');
ok(/SEO_FRIENDS_I18N = require\('\.\/seo-i18n\/friends\.js'\)/.test(src), 'translation table loaded');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
