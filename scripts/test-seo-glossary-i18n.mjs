#!/usr/bin/env node
// Deterministic guards for seo-i18n/glossary.js, the translation table behind
// /glossary. Run: node scripts/test-seo-glossary-i18n.mjs
//
// The failure mode specific to this page is silent misalignment. Each
// translation is a positional array of 54 entries matched against
// _SEO_GLOSSARY by index, so one missing or extra entry shifts every
// definition after it onto the wrong headword. The page still renders, still
// validates, and is wrong from that point down — nothing but an index check
// catches it.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const glossary = require(join(root, 'seo-i18n', 'glossary.js'));
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const WIDE = /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;
function width(s) { let w = 0; for (const ch of s) w += WIDE.test(ch) ? 2 : 1; return w; }

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
const TERMS = liftArray('_SEO_GLOSSARY');
ok(Array.isArray(TERMS) && TERMS.length > 40, `_SEO_GLOSSARY carries ${TERMS ? TERMS.length : 0} terms`);

const PARTS = glossary.PARTS;
const codes = Object.keys(PARTS);
ok(codes.length > 0, `${codes.length} language(s) translated`);
ok(!('en' in PARTS), 'English is not in the table — it lives in proxy.js');

const scalars = ['title', 'desc', 'ldHeadline', 'ldDesc', 'h1', 'lead'];
for (const code of codes) {
  const p = PARTS[code];
  const missing = scalars.filter(k => typeof p[k] !== 'string' || !p[k].trim());
  ok(missing.length === 0, `${code}: every text field is filled${missing.length ? ' — missing ' + missing.join(', ') : ''}`);
  ok(typeof p.footer === 'function', `${code}: the link-bearing closing line is a resolver, not a fixed string`);
  // The alignment check. Length alone is what keeps definition i on term i.
  ok(Array.isArray(p.terms) && p.terms.length === TERMS.length,
    `${code}: exactly ${TERMS.length} entries, one per term (${p.terms ? p.terms.length : 0})`);
  const shape = (p.terms || []).every(t =>
    Array.isArray(t) && t.length === 2 &&
    (t[0] === null || (typeof t[0] === 'string' && t[0].trim())) &&
    typeof t[1] === 'string' && t[1].trim());
  ok(shape, `${code}: every entry is [localEquivalent | null, non-empty definition]`);
}

const asked = {};
const href = (page, lang) => { (asked[lang] = asked[lang] || []).push(page); return '/@' + page + '@' + lang; };
const built = glossary.build(TERMS, href);
ok(Object.keys(built).length === codes.length, 'the builder emits one entry per language');

for (const code of codes) {
  const b = built[code];
  ok((b.body.match(/<dt>/g) || []).length === TERMS.length, `${code}: one <dt> per term`);
  ok((b.body.match(/<dd>/g) || []).length === TERMS.length, `${code}: one <dd> per term`);
  ok((b.body.match(/<dt>/g) || []).length === (b.body.match(/<\/dt>/g) || []).length, `${code}: <dt> tags balance`);
  ok((b.body.match(/<dd>/g) || []).length === (b.body.match(/<\/dd>/g) || []).length, `${code}: <dd> tags balance`);
  // The English headword is the key: it must appear, in order, unaltered.
  const heads = (b.body.match(/<span class="en">([^<]*)<\/span>/g) || [])
    .map(h => h.replace(/<[^>]+>/g, ''));
  const drift = heads.filter((h, i) => h !== TERMS[i][0]);
  ok(drift.length === 0, `${code}: headwords match _SEO_GLOSSARY in order${drift.length ? ' — ' + drift.slice(0, 3).join(', ') : ''}`);
  // "Ante (ante)" is noise; the builder drops an equivalent that only differs
  // by case, so none may survive into the output.
  const echoed = heads.filter((h, i) => {
    const loc = PARTS[code].terms[i][0];
    return loc && loc.toLowerCase() === h.toLowerCase() &&
      b.body.indexOf('<span class="en">' + h + '</span> <span class="loc">') !== -1;
  });
  ok(echoed.length === 0, `${code}: no entry repeats the English word as its own equivalent`);
  const hrefs = (b.body.match(/href="([^"]*)"/g) || []).map(h => h.slice(6, -1));
  const bad = hrefs.filter(h => h.indexOf('/@') !== 0 || h.slice(h.lastIndexOf('@') + 1) !== code);
  ok(bad.length === 0, `${code}: every internal link is resolved in this language${bad.length ? ' — ' + bad.join(', ') : ''}`);
  ok(hrefs.length >= 2, `${code}: the rules and the hand rankings are both linked (${hrefs.length})`);
  const tw = width(b.title), dw = width(b.desc);
  ok(tw <= 70, `${code}: the title stays within what search results show (width ${tw})`);
  ok(dw >= 80 && dw <= 320, `${code}: the description is a usable length (width ${dw})`);
}

// Untranslated English leaking into a definition. In a Latin-script language
// a stray English word is visible on sight; in Japanese, Russian or Arabic it
// sits unnoticed inside a wall of another script — "players" survived a full
// read-through of one of these entries. Anything in a non-Latin definition
// that is not deliberate jargon is flagged.
const JARGON = /^(PokerTH|No-Limit|Fold|Check|Call|Raise|All-In|all-in|set|trips|wheel|LAN|PWA)$/;
const NON_LATIN = /[\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF\u0E00-\u0E7F\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7A3]/;
for (const code of codes) {
  const leaks = [];
  PARTS[code].terms.forEach((t, i) => {
    // Strip markup first: a definition may legitimately carry <span class="ltr">
    // around a rank sequence, and its tag names are not untranslated prose.
    const text = t[1].replace(/<[^>]+>/g, '');
    if (!NON_LATIN.test(text)) return;
    // Trailing hyphens are not part of the word: Bengali and Tamil attach case
    // endings to a Latin name with one (PokerTH-এ, PokerTH-இல்), which would
    // otherwise read as an unknown word rather than as PokerTH.
    (text.match(/[A-Za-z][A-Za-z-]*[A-Za-z]/g) || []).filter(w => w.length >= 3).forEach(w => {
      if (!JARGON.test(w)) leaks.push(`${TERMS[i][0]}: ${w}`);
    });
  });
  ok(leaks.length === 0, `${code}: no English left untranslated in a definition${leaks.length ? ' — ' + leaks.slice(0, 3).join(', ') : ''}`);
}

// Right-to-left languages: a rank sequence dropped into an Arabic or Hebrew
// definition gets reordered by the bidi algorithm at its boundaries, so
// A-2-3-4-5 reads backwards and the entry for the wheel teaches the wrong
// straight. The English headword is isolated by the builder; sequences inside
// a definition have to be wrapped by the translation itself.
const RTL = ['ar', 'fa', 'he', 'ur'];
const SEQ = /(?:10|[AKQJ2-9])(?:-(?:10|[AKQJ2-9])){2,}/g;
for (const code of RTL) {
  if (!(code in built)) continue;
  const stripped = built[code].body.replace(/<span class="(?:ltr|en)">[\s\S]*?<\/span>/g, '');
  const loose = stripped.match(SEQ) || [];
  ok(loose.length === 0,
    `${code}: rank sequences in definitions are isolated from bidi reordering${loose.length ? ' — ' + loose.join(', ') : ''}`);
}

ok(/SEO_GLOSSARY_I18N = require\('\.\/seo-i18n\/glossary\.js'\)\.build\(_SEO_GLOSSARY, _seoPageHref\);/.test(proxy),
  'proxy.js builds SEO_GLOSSARY_I18N from the module');
ok(proxy.indexOf("SEO_GLOSSARY_I18N = require('./seo-i18n/glossary.js')") > proxy.indexOf('var _SEO_GLOSSARY = ['),
  'and does so after _SEO_GLOSSARY is assigned');
ok(/dt \.loc\{/.test(proxy), 'the page CSS styles the local equivalent');
ok(/dt \.en\{direction:ltr;unicode-bidi:isolate\}/.test(proxy),
  'and isolates the English headword, which is a Latin run inside an RTL line');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
