#!/usr/bin/env node
// scripts/decks-manifest.mjs
// Scan a "cards" directory for installed gallery card decks and (re)write
// <cardsDir>/decks.json — the manifest the web client reads at runtime to
// populate the Theme → Cards list.
//
// A gallery deck = a sub-folder containing 0.png..51.png + flipside.png
// (the PokerTH community deck format). The built-in "svg" folder (vector deck,
// rank+suit filenames) and loose files are ignored. The display name comes from
// the deck's XML <StyleDescription>, falling back to the folder name.
//
//   node scripts/decks-manifest.mjs /path/to/public/cards
//
// Invoked automatically by install.sh (deck-add / deck-remove / update).

import { readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('usage: decks-manifest.mjs <cardsDir>');
  process.exit(1);
}
if (!existsSync(dir)) {
  console.error('no such directory: ' + dir);
  process.exit(1);
}

function deckExt(p) {
  if (existsSync(join(p, '0.png')) && existsSync(join(p, 'flipside.png'))) return 'png';
  if (existsSync(join(p, '0.svg')) && existsSync(join(p, 'flipside.svg'))) return 'svg';
  return null;
}
function isGalleryDeck(p, ext) {
  if (!ext || !existsSync(join(p, 'flipside.' + ext))) return false;
  for (let i = 0; i < 52; i++) if (!existsSync(join(p, i + '.' + ext))) return false;
  return true;
}

function deckName(p, fallback) {
  let name = fallback;
  let entries = [];
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
  if (name === 'svg' || name === 'pokerth' || name === 'pokerth-new' || name === 'casino-vert' || name === 'pokerth-1-0') continue;            // built-in vector deck (different format)
  const p = join(dir, name);
  let st;
  try { st = statSync(p); } catch { continue; }
  if (!st.isDirectory()) continue;
  const ext = deckExt(p);
  if (!isGalleryDeck(p, ext)) continue;
  out.push({
    id: name,
    name: deckName(p, name),
    preview: existsSync(join(p, 'preview.png')) ? ('/cards/' + name + '/preview.png') : (existsSync(join(p, 'preview.svg')) ? ('/cards/' + name + '/preview.svg') : null),
    ext: ext,
  });
}

out.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(join(dir, 'decks.json'), JSON.stringify(out, null, 2) + '\n');
console.log('decks.json updated: ' + out.length + ' deck(s)' + (out.length ? ' (' + out.map((d) => d.id).join(', ') + ')' : ''));
