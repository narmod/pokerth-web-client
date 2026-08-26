// Regression guard: renderPlayersList and its helpers live OUTSIDE the App
// IIFE, where `S` does not exist. A bare `S.` there throws a ReferenceError
// per row, which silently leaves the whole players list empty (2.1.7-web.97).
import { readFileSync } from 'fs';
const src = readFileSync('public/pokerth.js', 'utf8');
const lines = src.split('\n');

// Region: from the players-list helpers to the end of renderPlayersList.
const start = lines.findIndex(l => l.includes('var _PL_TRACK = {'));
let end = lines.findIndex((l, i) => i > start && l.startsWith('function renderPlayersList'));
if (start < 0 || end < 0) { console.log('ANCHORS NOT FOUND'); process.exit(1); }
// walk to the closing brace of renderPlayersList
let depth = 0, started = false;
for (; end < lines.length; end++) {
  for (const ch of lines[end]) {
    if (ch === '{') { depth++; started = true; }
    else if (ch === '}') depth--;
  }
  if (started && depth === 0) break;
}

const bad = [];
for (let i = start; i <= end; i++) {
  const l = lines[i].replace(/\/\/.*$/, '');
  // bare S.x — not window.S, not PthState.S, not a quoted string fragment
  if (/(^|[^\w.$'"])S\s*\./.test(l)) bad.push((i + 1) + ': ' + lines[i].trim().slice(0, 90));
}
if (bad.length) { console.log('BARE `S.` OUTSIDE App IIFE:'); bad.forEach(b => console.log('  ' + b)); process.exit(1); }
console.log(`OK — no bare S. between lines ${start + 1} and ${end + 1}`);
