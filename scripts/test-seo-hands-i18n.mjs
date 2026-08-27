#!/usr/bin/env node
// Deterministic guards for seo-i18n/hands.js, the translation table behind
// /hand-rankings. Run: node scripts/test-seo-hands-i18n.mjs
//
// Two things are checked that a human reader would not catch reliably. First,
// completeness: a language whose entry is half-written would still be
// advertised in the hreflang set and the sitemap, and would publish a page
// that is half English — worse than not translating it at all. Second,
// terminology: the ten hand names here must be the ones the client itself
// shows under the board (h1n…h10n in public/modules/lang/<code>.mjs), or the
// page and the game would disagree on what a full house is called.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const hands = require(join(root, 'seo-i18n', 'hands.js'));
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const PARTS = hands.PARTS;
const codes = Object.keys(PARTS);
ok(codes.length > 0, `${codes.length} language(s) translated`);
ok(!('en' in PARTS), 'English is not in the table — it lives in proxy.js');

// Every field the builder reads must be present and non-empty.
const scalars = ['title', 'desc', 'ldHeadline', 'ldDesc', 'h1', 'lead',
  'dealt', 'tiesH2', 'tiesP', 'wrongH2', 'seeH2', 'seeP'];
for (const code of codes) {
  const p = PARTS[code];
  const missing = scalars.filter(k => typeof p[k] !== 'string' || !p[k].trim());
  ok(missing.length === 0, `${code}: every text field is filled${missing.length ? ' — missing ' + missing.join(', ') : ''}`);
  ok(Array.isArray(p.names) && p.names.length === 10, `${code}: ten hand names`);
  ok(Array.isArray(p.texts) && p.texts.length === 10 && p.texts.every(t => t && t.trim()),
    `${code}: ten hand descriptions, none empty`);
  ok(Array.isArray(p.wrong) && p.wrong.length >= 3, `${code}: at least three misconceptions`);
  ok(p.dealt.indexOf('%s') !== -1, `${code}: the frequency placeholder survived translation`);
}

// The hand names must match the client catalogue, which is the terminology a
// player already sees in the app.
const langDir = join(root, 'public', 'modules', 'lang');
const fileFor = (code) => {
  const files = readdirSync(langDir);
  const want = code.toLowerCase() + '.mjs';
  return files.find(f => f.toLowerCase() === want);
};
for (const code of codes) {
  const f = fileFor(code);
  if (!f) { ok(false, `${code}: a client language file exists`); continue; }
  const src = readFileSync(join(langDir, f), 'utf8');
  const app = [];
  for (let i = 1; i <= 10; i++) {
    const m = new RegExp(`h${i}n:\\s*(['"])((?:\\\\.|(?!\\1).)*)\\1`).exec(src);
    app.push(m ? m[2] : null);
  }
  const same = app.every((name, i) => name === PARTS[code].names[i]);
  const diff = app.map((name, i) => name === PARTS[code].names[i] ? null : `${name} ≠ ${PARTS[code].names[i]}`)
    .filter(Boolean);
  ok(same, `${code}: hand names match the client${same ? '' : ' — ' + diff.join(', ')}`);
}

// The builder output is what proxy.js actually serves.
const sd = (t) => '<span class="cards">' + t + '</span>';
const SAMPLE = Array.from({ length: 10 }, (_, i) => ['', '', 'A\u2660 K\u2660', (i + 1) + '%']);
const built = hands.build(SAMPLE, sd);
ok(Object.keys(built).length === codes.length, 'the builder emits one entry per language');
for (const code of codes) {
  const b = built[code];
  ok(typeof b.body === 'string' && b.body.length > 1500, `${code}: the assembled body has real content`);
  ok(b.body.indexOf('%s') === -1, `${code}: no placeholder is left in the output`);
  ok((b.body.match(/<li>/g) || []).length >= 15, `${code}: ten hands plus the misconceptions are listed`);
  ok((b.body.match(/<h2>/g) || []).length === 3, `${code}: the three sections are present`);
  // A stray unclosed tag would break the page layout for that language only.
  ok((b.body.match(/<em>/g) || []).length === (b.body.match(/<\/em>/g) || []).length, `${code}: <em> tags balance`);
  ok((b.body.match(/<li>/g) || []).length === (b.body.match(/<\/li>/g) || []).length, `${code}: <li> tags balance`);
  ok(b.title.length <= 70, `${code}: the title stays within what search results show (${b.title.length})`);
  ok(b.desc.length >= 80 && b.desc.length <= 320, `${code}: the description is a usable length (${b.desc.length})`);
}

// And proxy.js has to read the module rather than its own empty object.
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
ok(/SEO_HANDS_I18N = require\('\.\/seo-i18n\/hands\.js'\)\.build\(_SEO_HANDS, _sd\);/.test(proxy),
  'proxy.js builds SEO_HANDS_I18N from the module');
ok(proxy.indexOf("SEO_HANDS_I18N = require('./seo-i18n/hands.js')") > proxy.indexOf('var _SEO_HANDS = ['),
  'and does so after _SEO_HANDS is assigned');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
