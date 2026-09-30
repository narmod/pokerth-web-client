#!/usr/bin/env node
// Ace's Help — texts. The Ace's own catalogues (modules/guide/lang/<code>.mjs,
// separate from the UI catalogues, D12) must each hold every English key with
// the same {placeholders}, and only for languages the client ships. The two
// keys that live in the UI catalogues (login / menu button, option) must be
// in all of them. Guide catalogues are not UI catalogues: test-lang-count and
// test-lang-lazy only read modules/lang/.
// Run: node scripts/test-guide-lang.mjs
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const imp = (p) => import(pathToFileURL(path.resolve(p)).href);
let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}

const { LANG_CODES } = await imp('public/modules/lang-meta.mjs');
const codes = new Set(LANG_CODES.map((c) => c.toLowerCase()));
const EN = (await imp('public/modules/guide/lang/en.mjs')).default;
const vars = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(',');
const enKeys = Object.keys(EN).sort();

ok(enKeys.length > 0, 'English guide catalogue has keys (' + enKeys.length + ')');
for (const k of enKeys) ok(typeof EN[k] === 'string' && EN[k].trim() !== '', 'en.' + k + ' is a non-empty string');

const dir = 'public/modules/guide/lang';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mjs'));
for (const f of files) {
  const code = f.replace(/\.mjs$/, '');
  ok(codes.has(code), 'guide catalogue ' + f + ' is a language the client ships');
  if (code === 'en') continue;
  const L = (await imp(path.join(dir, f))).default;
  const keys = Object.keys(L).sort();
  const missing = enKeys.filter((k) => !(k in L));
  const extra = keys.filter((k) => !(k in EN));
  ok(!missing.length, code + ': every key present' + (missing.length ? ' — missing ' + missing.join(', ') : ''));
  ok(!extra.length, code + ': no unknown key' + (extra.length ? ' — ' + extra.join(', ') : ''));
  const bad = enKeys.filter((k) => k in L && vars(L[k]) !== vars(EN[k]));
  ok(!bad.length, code + ': same {placeholders}' + (bad.length ? ' — ' + bad.join(', ') : ''));
}
ok(files.length === codes.size, 'a guide catalogue for every language the client ships (' + files.length + '/' + codes.size + ')');

// UI catalogue keys
for (const f of fs.readdirSync('public/modules/lang').filter((x) => x.endsWith('.mjs'))) {
  const m = await imp('public/modules/lang/' + f);
  const s = m.strings || m.default || {};
  ok(typeof s.guideBtn === 'string' && s.guideBtn && typeof s.advGuide === 'string' && s.advGuide, f + ': guideBtn + advGuide');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
