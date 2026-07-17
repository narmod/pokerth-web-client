#!/usr/bin/env node
// scripts/seats-manifest.mjs
// Scan a "seats" directory for imported seat packs (9-slice plate images) and
// (re)write <seatsDir>/seats.json — the manifest the web client reads at runtime
// to populate Theme → Seats (gallery packs, beside the built-in CSS packs).
//
// A seat pack = a sub-folder with plate.(png|svg|webp|jpg) — the 9-slice frame
// drawn behind a seat; the CSS border-image `fill` keyword makes that same image
// paint the box background too. Optional extras in the folder:
//   • self.(png|svg|…)     a distinct frame for the hero player-bar
//   • preview.(png|svg|…)  the selector thumbnail
//   • seat.json            { name, by, slice, width, pad, swatch, self:{slice,width,pad},
//                            traits:{...} — traits comportementaux (voir theme.mjs
//                            SEAT_TRAIT_KEYS : holePlate, betOut, pucksSide, …) }
//
// slice = border-image-slice as a percentage of the source image (default 34),
// width = rendered frame thickness in px (default 15), pad = inner padding.
// Loose files are ignored. The display name comes from seat.json → folder name.
//
//   node scripts/seats-manifest.mjs /path/to/public/seats
//
// Invoked automatically by proxy.js (seat upload / remove).

import { readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: seats-manifest.mjs <seatsDir>'); process.exit(1); }
if (!existsSync(dir)) { console.error('no such directory: ' + dir); process.exit(1); }

function pick(p, names) { for (const n of names) if (existsSync(join(p, n))) return n; return null; }
function plateFile(p) { return pick(p, ['plate.png', 'plate.svg', 'plate.webp', 'plate.jpg', 'plate.jpeg']); }
function selfFile(p)  { return pick(p, ['self.png', 'self.svg', 'self.webp', 'self.jpg', 'self.jpeg']); }
function prevFile(p)  { return pick(p, ['preview.png', 'preview.svg', 'preview.webp', 'preview.jpg']); }
function num(v, d) { const n = Number(v); return (isFinite(n) && n > 0) ? n : d; }

const out = [];
let names = [];
try { names = readdirSync(dir); } catch { names = []; }
for (const name of names) {
  const p = join(dir, name);
  let st; try { st = statSync(p); } catch { continue; }
  if (!st.isDirectory()) continue;          // skip loose files / seats.json itself
  const plate = plateFile(p);
  if (!plate) continue;                     // a seat pack must carry a plate image
  const base = '/seats/' + name + '/';
  let cfg = {};
  try { if (existsSync(join(p, 'seat.json'))) cfg = JSON.parse(readFileSync(join(p, 'seat.json'), 'utf8')) || {}; } catch { cfg = {}; }
  const self = selfFile(p), prev = prevFile(p);
  const sc = (cfg.self && typeof cfg.self === 'object') ? cfg.self : {};
  const slice = num(cfg.slice, 34), width = num(cfg.width, 15);
  out.push({
    id: name,
    name: (cfg.name && String(cfg.name).trim()) || name,
    by: (cfg.by && String(cfg.by).trim()) || null,
    traits: (cfg.traits && typeof cfg.traits === 'object') ? cfg.traits : null,
    plateUrl: base + plate,
    selfUrl: self ? base + self : null,
    preview: prev ? base + prev : null,
    slice: slice,
    width: width,
    pad: (cfg.pad && String(cfg.pad)) || '6px 12px',
    selfSlice: num(sc.slice, slice),
    selfWidth: num(sc.width, width),
    selfPad: (sc.pad && String(sc.pad)) || (cfg.pad && String(cfg.pad)) || '6px 12px',
    swatch: (cfg.swatch && String(cfg.swatch)) || '#394150',
  });
}
out.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(join(dir, 'seats.json'), JSON.stringify(out, null, 2) + '\n');
console.log('seats.json updated: ' + out.length + ' seat pack(s)' + (out.length ? ' (' + out.map((s) => s.id).join(', ') + ')' : ''));
