#!/usr/bin/env node
// Deterministic guards for seo-i18n/howto.js, the translation table behind
// /how-to-play. Run: node scripts/test-seo-howto-i18n.mjs
//
// Beyond completeness, the thing worth guarding here is the internal links.
// This page points at the rules, the hand rankings and the FAQ, and those
// pointers are written once per language at load time. If a translation
// hard-codes an English URL, a French reader following "voir les règles"
// lands on the English rules and the language chain breaks silently — the
// page still renders, so nothing else would catch it.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const howto = require(join(root, 'seo-i18n', 'howto.js'));
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Display width: CJK ideographs, kana and Hangul are full-width. A search
// result truncates on a pixel budget, not a character count.
const WIDE = /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;
function width(s) { let w = 0; for (const ch of s) w += WIDE.test(ch) ? 2 : 1; return w; }

// The step list is language-neutral data in proxy.js; lift it so the test
// runs against the same shape the server does.
function liftArray(name) {
  const i = proxy.indexOf('var ' + name + ' = [');
  if (i < 0) return null;
  let d = 0, j = proxy.indexOf('[', i), k = j;
  for (; k < proxy.length; k++) {
    if (proxy[k] === '[') d++;
    else if (proxy[k] === ']') { d--; if (!d) break; }
  }
  return new Function('return ' + proxy.slice(j, k + 1))();
}
const STEPS = liftArray('_SEO_HOWTO');
ok(Array.isArray(STEPS) && STEPS.length === 6, `_SEO_HOWTO carries ${STEPS ? STEPS.length : 0} steps`);

const PARTS = howto.PARTS;
const codes = Object.keys(PARTS);
ok(codes.length > 0, `${codes.length} language(s) translated`);
ok(!('en' in PARTS), 'English is not in the table — it lives in proxy.js');

const scalars = ['title', 'desc', 'ldHeadline', 'ldDesc', 'h1',
  'phoneH2', 'phoneP', 'friendsH2', 'friendsP', 'faqH2'];
for (const code of codes) {
  const p = PARTS[code];
  const missing = scalars.filter(k => typeof p[k] !== 'string' || !p[k].trim());
  ok(missing.length === 0, `${code}: every text field is filled${missing.length ? ' — missing ' + missing.join(', ') : ''}`);
  ok(typeof p.lead === 'function' && typeof p.faqP === 'function',
    `${code}: the two link-bearing paragraphs are resolvers, not fixed strings`);
  ok(Array.isArray(p.steps) && p.steps.length === STEPS.length,
    `${code}: one step for each of the ${STEPS.length} in proxy.js`);
  ok(p.steps.every(s => Array.isArray(s) && s.length === 2 && s[0].trim() && s[1].trim()),
    `${code}: every step has a heading and a body`);
}

// Build with a resolver that records what was asked for, so a hard-coded URL
// in a translation shows up as a link nobody requested.
const asked = {};
const href = (page, lang) => {
  (asked[lang] = asked[lang] || []).push(page);
  return '/@' + page + '@' + lang;
};
const built = howto.build(STEPS, href);
ok(Object.keys(built).length === codes.length, 'the builder emits one entry per language');

for (const code of codes) {
  const b = built[code];
  ok(typeof b.body === 'string' && b.body.length > 800, `${code}: the assembled body has real content`);
  ok((b.body.match(/<h2>/g) || []).length === STEPS.length + 3,
    `${code}: six numbered steps plus the three closing sections`);
  ok(b.body.indexOf('{rules}') === -1 && b.body.indexOf('{hands}') === -1 && b.body.indexOf('{faq}') === -1,
    `${code}: no placeholder survived into the output`);
  ok((b.body.match(/<p>/g) || []).length === (b.body.match(/<\/p>/g) || []).length, `${code}: <p> tags balance`);
  ok((b.body.match(/<strong>/g) || []).length === (b.body.match(/<\/strong>/g) || []).length, `${code}: <strong> tags balance`);
  // Every link in the body must have come through the resolver in this
  // language — never a bare /rules, and never another language's variant.
  const hrefs = (b.body.match(/href="([^"]*)"/g) || []).map(h => h.slice(6, -1));
  const bad = hrefs.filter(h => h.indexOf('/@') !== 0 || h.slice(h.lastIndexOf('@') + 1) !== code);
  ok(bad.length === 0, `${code}: every internal link is resolved in this language${bad.length ? ' — ' + bad.join(', ') : ''}`);
  ok(hrefs.length >= 3, `${code}: the rules, hand rankings and FAQ are all linked (${hrefs.length})`);
  const tw = width(b.title), dw = width(b.desc);
  ok(tw <= 70, `${code}: the title stays within what search results show (width ${tw})`);
  ok(dw >= 80 && dw <= 320, `${code}: the description is a usable length (width ${dw})`);
}

// And proxy.js has to wire the module up, after the data it needs exists.
ok(/SEO_HOWTO_I18N = require\('\.\/seo-i18n\/howto\.js'\)\.build\(_SEO_HOWTO, _seoPageHref\);/.test(proxy),
  'proxy.js builds SEO_HOWTO_I18N from the module');
ok(proxy.indexOf("SEO_HOWTO_I18N = require('./seo-i18n/howto.js')") > proxy.indexOf('var _SEO_HOWTO = ['),
  'and does so after _SEO_HOWTO is assigned');
ok(proxy.indexOf("SEO_HANDS_I18N = require('./seo-i18n/hands.js')") <
   proxy.indexOf("SEO_HOWTO_I18N = require('./seo-i18n/howto.js')"),
  'the hand-rankings table is built first, so this page can link into it');
ok(/function _seoPageHref\(page, lang\)/.test(proxy), 'the link resolver exists');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
