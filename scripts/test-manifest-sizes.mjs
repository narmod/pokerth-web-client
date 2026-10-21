#!/usr/bin/env node
// Every image public/manifest.json declares (icons, shortcut icons,
// screenshots) exists and has the size it is declared with. The wide
// screenshot was declared 1280x640 while the file is 1200x630 (web.238):
// browsers and stores that check reject or skip a screenshot whose size does
// not match. Reads the PNG header, no dependency.
// Run: node scripts/test-manifest-sizes.mjs
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const m = JSON.parse(readFileSync(join(pub, 'manifest.json'), 'utf8'));
const imgs = [].concat(m.icons || [], m.screenshots || [], ...(m.shortcuts || []).map((s) => s.icons || []));
let n = 0, fail = 0;
for (const im of imgs) {
  n++;
  const f = join(pub, im.src.replace(/^\//, ''));
  let msg = '';
  if (!existsSync(f)) msg = 'missing';
  else {
    const b = readFileSync(f);
    if (b.toString('latin1', 1, 4) !== 'PNG') msg = 'not a PNG';
    else {
      const got = b.readUInt32BE(16) + 'x' + b.readUInt32BE(20);
      if (!im.sizes.split(' ').includes(got)) msg = 'declared ' + im.sizes + ', file is ' + got;
    }
  }
  if (msg) { fail++; console.error('  ✗', im.src, msg); } else console.log('  ✓', im.src, im.sizes);
}
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
