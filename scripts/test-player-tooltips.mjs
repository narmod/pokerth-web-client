#!/usr/bin/env node
// Interop of the player notes with the official clients through the config
// list "PlayerTooltips" (Nom(!#$%)Note(!#$%)Étoiles(!#$%)), shared by the
// Qt-Widgets client (myavatarlabel.cpp) and, since upstream b77ad47, the QML
// client.
//
// The format carries no timestamp and no colour, which is why it is an
// EXCHANGE format here and not the storage: the web merge across devices needs
// the per-entry t. Two things therefore have to hold and are pinned below:
// the serialisation matches what the official clients parse, and the exchange
// only runs where it is safe — the downloaded file and an explicit file
// import, never the account sync, which replays the same config.xml on every
// connection and would flatten notes taken meanwhile on another device.
//
// The two functions are lifted from the source and run against the REAL notes
// store, so a change in either side fails here.
// Run: node scripts/test-player-tooltips.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}

// ── Lift the two exchange functions out of the source ──────────────────
function grab(startMarker, endMarker) {
  const a = src.indexOf(startMarker);
  ok(a > 0, startMarker.split('(')[0].trim() + ' is still where the test expects it');
  return a > 0 ? src.slice(a, src.indexOf(endMarker, a) + endMarker.length) : '';
}
const sepSrc = grab("var PTH_TIP_SEP =", ";");
const linesSrc = grab('function _cfgTipLines() {', '\n}');
const applySrc = grab('function _cfgApplyTipLines(list) {', '\n}');

const { createNotes } = await import('../public/modules/notes/store.mjs');
function mem() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
}
const store = createNotes({ backend: mem() });
const scope = { window: { _nvStore: store } };
// eslint-disable-next-line no-new-func
const build = new Function('window', sepSrc + '\n' + linesSrc + '\n' + applySrc +
  '\nreturn { tipLines: _cfgTipLines, applyTips: _cfgApplyTipLines, SEP: PTH_TIP_SEP };');
const { tipLines, applyTips, SEP } = build(scope.window);

ok(SEP === '(!#$%)', 'the separator is the one the official clients use');

// ── Serialisation ──────────────────────────────────────────────────────
store.set('Alice', { note: 'calls any 3-bet', stars: 3 });
let lines = tipLines();
ok(lines.length === 1 && lines[0] === 'Alice' + SEP + 'calls any 3-bet' + SEP + '3' + SEP,
   'one line per player, three fields and a trailing separator');

// A note holding the separator would come back in pieces on the other side.
store.set('Bob', { note: 'weird' + SEP + 'text', stars: 1 });
lines = tipLines();
ok(lines.some((l) => l.startsWith('Bob' + SEP) && l.split(SEP).length === 4),
   'the separator is stripped from the note text');

// Attribute values normalise newlines to spaces when parsed back as XML.
store.set('Cara', { note: 'line one\nline two', stars: 0 });
ok(tipLines().some((l) => l.indexOf('line one line two') > 0), 'newlines become spaces');

// A colour-only entry has nothing to say to a client that knows no colours.
store.set('Dave', { tag: 'red' });
ok(!tipLines().some((l) => l.startsWith('Dave' + SEP)), 'a colour-only entry is not exported');

// A nickname containing the separator cannot be serialised at all.
store.set('Ev' + SEP + 'il', { note: 'x', stars: 2 });
ok(!tipLines().some((l) => l.indexOf('Ev' + SEP + 'il') === 0),
   'a nickname holding the separator is left out rather than exported broken');

// ── Reading an imported file ───────────────────────────────────────────
const fresh = createNotes({ backend: mem() });
scope.window._nvStore = fresh;
const build2 = new Function('window', sepSrc + '\n' + linesSrc + '\n' + applySrc +
  '\nreturn { tipLines: _cfgTipLines, applyTips: _cfgApplyTipLines };');
const io2 = build2(scope.window);

fresh.set('Zoe', { tag: 'blue', note: 'old note', stars: 1 });
const read = io2.applyTips({ values: [
  'Zoe' + SEP + 'from the desktop' + SEP + '4' + SEP,
  'New' + SEP + 'seen there' + SEP + '2' + SEP,
  'Clamp' + SEP + 'over the top' + SEP + '99' + SEP,
  'Junk line with no separator',
  SEP + 'no name' + SEP + '1' + SEP,
] });
ok(read === 3, 'malformed and nameless lines are skipped, the three good ones are read');
ok(fresh.noteOf('Zoe') === 'from the desktop' && fresh.starsOf('Zoe') === 4,
   'an explicit import wins on note and rating');
ok(fresh.tagOf('Zoe') === 'blue',
   'the local colour survives: the format does not carry it, so it must not erase it');
ok(fresh.starsOf('Clamp') === 5, 'a rating past the maximum is clamped, not stored raw');
ok(fresh.noteOf('New') === 'seen there', 'an unknown player is created');

// Round-trip through the two functions.
const round = createNotes({ backend: mem() });
scope.window._nvStore = round;
const io3 = build2(scope.window);
round.set('Ivy', { note: 'tight, folds to pressure', stars: 5 });
const out = io3.tipLines();
const back = createNotes({ backend: mem() });
scope.window._nvStore = back;
build2(scope.window).applyTips({ values: out });
ok(back.noteOf('Ivy') === 'tight, folds to pressure' && back.starsOf('Ivy') === 5,
   'export then import gives the same note and rating back');

// ── Where the exchange is wired ────────────────────────────────────────
const exportFn = src.slice(src.indexOf('function exportPokerthConfig()'),
                           src.indexOf('window.exportPokerthConfig ='));
ok(/_cfgBuildXml\(true\)/.test(exportFn), 'the downloaded config.xml carries the notes');

const pushFn = src.slice(src.indexOf('function _cfgSyncPushNow'),
                         src.indexOf('function _cfgSyncPushNow') + 2000);
ok(/_cfgBuildXml\(\)/.test(pushFn) && !/_cfgBuildXml\(true\)/.test(pushFn),
   'the config.xml pushed to the account does not: pth_notes already syncs, with its dates');

const importFn = src.slice(src.indexOf('function _importPokerthConfigFile'),
                           src.indexOf('window._importPokerthConfigFile ='));
ok(/_cfgApplyTipLines\(/.test(importFn), 'an imported file feeds the notes');

const descent = src.slice(src.indexOf('function _cfgSyncApplyDescent'),
                          src.indexOf('function _cfgSyncApplyDescent') + 3000);
ok(!/_cfgApplyTipLines\(/.test(descent),
   'the sync descent does NOT: replaying an older desktop file would flatten newer notes');

console.log(fails ? `FAILED ${fails}` : 'ALL OK');
process.exit(fails ? 1 : 0);
