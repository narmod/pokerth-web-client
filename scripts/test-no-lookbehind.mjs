// Served code must not use regex lookbehind `(?<=…)` / `(?<!…)`: Safari before 16.4 (iOS 16.3 and
// older) rejects it at parse time, so the whole module — and everything importing it — fails to load.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../public/', import.meta.url).pathname;
const skip = new Set(['vendor']);
const hits = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!skip.has(name)) walk(p); continue; }
    if (!/\.(m?js)$/.test(name)) continue;
    readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
      if (/\(\?<[=!]/.test(line)) hits.push(relative(root, p) + ':' + (i + 1));
    });
  }
})(root);
if (hits.length) { console.error('lookbehind in served code (breaks Safari < 16.4):\n  ' + hits.join('\n  ')); process.exit(1); }
console.log('1 passed, 0 failed');
