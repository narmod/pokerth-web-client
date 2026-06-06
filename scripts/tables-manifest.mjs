#!/usr/bin/env node
// scripts/tables-manifest.mjs
// Scan a "table" directory for imported gallery table styles and (re)write
// <tableDir>/tables.json — the manifest the web client reads at runtime to
// populate Theme → Table (felt) and its matching dealer/SB/BB pucks.
//
// A gallery table = a sub-folder containing felt.jpg | felt.png (the felt),
// optionally dealer/sb/bb puck images and preview.png. Loose files (e.g. the
// built-in felt-green.jpg) are ignored. The display name comes from the
// table style's *tablestyle.xml <StyleDescription>, falling back to the folder.
//
//   node scripts/tables-manifest.mjs /path/to/public/table
//
// Invoked automatically by install.sh (table-add / table-remove / update).

import { readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: tables-manifest.mjs <tableDir>'); process.exit(1); }
if (!existsSync(dir)) { console.error('no such directory: ' + dir); process.exit(1); }

function pick(p, names) { for (const n of names) if (existsSync(join(p, n))) return n; return null; }
function feltFile(p) { return pick(p, ['felt.jpg', 'felt.png', 'felt.webp']); }
function puckFile(p, base) { return pick(p, [base + '.svg', base + '.png', base + '.webp']); }
function tableName(p, fallback) {
  let name = fallback, entries = [];
  try { entries = readdirSync(p); } catch { return name; }
  for (const f of entries) {
    if (!f.toLowerCase().endsWith('.xml')) continue;
    try {
      const xml = readFileSync(join(p, f), 'utf8');
      const m = xml.match(/StyleDescription[^>]*value\s*=\s*"([^"]+)"/i);
      if (m && m[1].trim()) { name = m[1].trim(); break; }
    } catch { /* ignore */ }
  }
  return name;
}

const out = [];
let names = [];
try { names = readdirSync(dir); } catch { names = []; }
for (const name of names) {
  const p = join(dir, name);
  let st; try { st = statSync(p); } catch { continue; }
  if (!st.isDirectory()) continue;          // skip loose files (felt-green.jpg)
  const felt = feltFile(p);
  if (!felt) continue;                      // a gallery table must carry a felt
  const base = '/table/' + name + '/';
  const d = puckFile(p, 'dealer'), s = puckFile(p, 'sb'), b = puckFile(p, 'bb');
  const pucks = (d || s || b) ? { dealer: d ? base + d : null, sb: s ? base + s : null, bb: b ? base + b : null } : null;
  out.push({
    id: name,
    name: tableName(p, name),
    feltUrl: base + felt,
    pucks: pucks,
    preview: d ? base + d : (existsSync(join(p, 'preview.png')) ? base + 'preview.png' : null),
  });
}
out.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(join(dir, 'tables.json'), JSON.stringify(out, null, 2) + '\n');
console.log('tables.json updated: ' + out.length + ' table(s)' + (out.length ? ' (' + out.map((t) => t.id).join(', ') + ')' : ''));
