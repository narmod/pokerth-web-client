#!/usr/bin/env node
// Dumps en.mjs as `key<TAB>value` lines (catalogue order, evaluated strings)
// into $LANG_WORK/en.tsv — the reference to translate from, chunk by chunk.
import fs from 'fs';
import path from 'path';
import { LANG_DIR, WORK, tokenizeCatalogue } from './_lib.mjs';

const segs = tokenizeCatalogue(fs.readFileSync(path.join(LANG_DIR, 'en.mjs'), 'utf8'));
const seen = new Set(), out = [];
for (const s of segs) if (s.t === 'val' && !seen.has(s.key)) {
  seen.add(s.key);
  out.push(s.key + '\t' + (0, eval)(s.src).replace(/\n/g, '\\n'));
}
fs.mkdirSync(WORK, { recursive: true });
fs.writeFileSync(path.join(WORK, 'en.tsv'), out.join('\n') + '\n');
console.log(out.length + ' keys → ' + path.join(WORK, 'en.tsv'));
