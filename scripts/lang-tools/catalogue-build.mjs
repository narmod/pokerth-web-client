#!/usr/bin/env node
// Builds public/modules/lang/<code>.mjs from en.mjs (layout, comments and key
// order preserved) and the translation chunks $LANG_WORK/<code>N.txt.
//   node scripts/lang-tools/catalogue-build.mjs <code> <native label> <English name> [rtl]
// The flag is read from $LANG_WORK/<code>.flag (one inline <svg class="lang-flag">…).
// Keys absent from the chunks keep the English value and are listed at the end:
// that list should only hold what legitimately stays English (action terms,
// pack names, copyright line…). Run catalogue-parity.mjs afterwards.
import fs from 'fs';
import path from 'path';
import { LANG_DIR, WORK, tokenizeCatalogue, readChunks, sq, die } from './_lib.mjs';

const [code, label, enName, dir] = process.argv.slice(2);
if (!code || !label || !enName) die('usage: catalogue-build.mjs <code> <native label> <English name> [rtl]');
const tr = readChunks(code);
const segs = tokenizeCatalogue(fs.readFileSync(path.join(LANG_DIR, 'en.mjs'), 'utf8'));
const enKeys = new Set(segs.filter(s => s.t === 'val').map(s => s.key));
const unknown = Object.keys(tr).filter(k => !enKeys.has(k));
if (unknown.length) die('keys not in en.mjs: ' + unknown.join(', '));

let out = ''; const fallback = new Set();
for (const s of segs) {
  if (s.t === 'raw') out += s.s;
  else if (s.key in tr) out += sq(tr[s.key]);
  else { out += s.src; fallback.add(s.key); }
}
const flag = fs.readFileSync(path.join(WORK, code + '.flag'), 'utf8').trim();
out = out.replace('public/modules/lang/en.mjs — English catalogue (self-contained).',
  `public/modules/lang/${code}.mjs — ${enName} catalogue (self-contained).`);
out = out.replace(/export const meta = \{[\s\S]*?\n\};/,
  `export const meta = {\n  label: ${sq(label)},\n  dir: ${sq(dir === 'rtl' ? 'rtl' : 'ltr')},\n  flag: ${sq(flag)},\n};`);
fs.writeFileSync(path.join(LANG_DIR, code + '.mjs'), out);
console.log('translated ' + Object.keys(tr).length + ', kept English ' + fallback.size + ':');
console.log([...fallback].join(' '));
