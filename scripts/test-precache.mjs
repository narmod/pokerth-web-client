#!/usr/bin/env node
// Offline guard for the service worker precache (public/sw.js → ASSETS).
//
// The web client must boot and run the offline training mode with no network.
// A CACHE_VERSION bump drops every runtime-cached file, so anything the app
// loads that is NOT in ASSETS is only back in cache once it has been fetched
// online again. Lazily imported modules (offline mode, achievements) are then
// missing until the feature is used online → "Offline init failed".
//
// Walks the ES module graph from every <script src> of pokerth-client.html
// (static imports, re-exports and literal dynamic imports), adds the per-
// language files loaded by computed dynamic imports (lang/, help/content/),
// and fails if any of them is absent from ASSETS. Also guards the default deck
// and table style (cards and felt of an offline game) and checks every ASSETS
// entry exists on disk. Dependency-free.
// Run: node scripts/test-precache.mjs
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const PUB = path.resolve('public');
// Evaluate sw.js (ASSETS is built with expressions, not only literals).
const sw = fs.readFileSync(path.join(PUB, 'sw.js'), 'utf8');
const ctx = { self: { addEventListener() {}, location: { origin: '' }, registration: {}, clients: {} } };
vm.runInNewContext(sw + '\n;self.__out = { ASSETS, CACHE_VERSION, BUILD_ID: typeof BUILD_ID === \'undefined\' ? null : BUILD_ID };', ctx);
const { ASSETS: ASSET_LIST, BUILD_ID } = ctx.self.__out;
const assets = new Set(ASSET_LIST);

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  \u2713 ' + label); }
  else { fail++; console.log('  \u2717 ' + label); }
}

// Drop comments without touching string contents such as 'wss://…'.
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
}

const seen = new Map(); // url path → importer
const IMPORT_RE = /(?:\bimport\s*(?:[\w*{}\s,$]+\s*from\s*)?|\bexport\s*[\w*{}\s,$]+\s*from\s*|\bimport\s*\(\s*)['"]([^'"]+)['"]/g;
function walk(url, from) {
  if (seen.has(url)) return;
  seen.set(url, from);
  const file = path.join(PUB, url);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    ok(false, 'imported file exists: ' + url + ' (from ' + from + ')');
    return;
  }
  if (!/\.(?:m?js)$/.test(url)) return;
  const src = stripComments(fs.readFileSync(file, 'utf8'));
  for (const m of src.matchAll(IMPORT_RE)) {
    let spec = m[1].split('?')[0];
    if (!spec.startsWith('.') && !spec.startsWith('/')) continue; // bare / remote
    if (!/\.(?:m?js)$/.test(spec)) continue;                      // computed prefix
    const next = spec.startsWith('/') ? spec : path.posix.normalize(path.posix.join(path.posix.dirname(url), spec));
    walk(next, url);
  }
}

const html = fs.readFileSync(path.join(PUB, 'pokerth-client.html'), 'utf8');
const entries = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)]
  .map(m => m[1].split('?')[0])
  .filter(s => !/^(?:https?:)?\/\//.test(s))
  .map(s => (s.startsWith('/') ? s : '/' + s));
ok(entries.includes('/pokerth.js'), 'pokerth-client.html loads pokerth.js');
for (const e of entries) walk(e, 'pokerth-client.html');

// Computed dynamic imports: one file per language.
for (const dir of ['modules/lang', 'modules/help/content']) {
  for (const f of fs.readdirSync(path.join(PUB, dir))) {
    if (f.endsWith('.mjs')) seen.set('/' + dir + '/' + f, '(per-language import)');
  }
}

// The offline mode entry must be part of the graph (lazy import in pokerth.js).
ok(seen.has('/modules/offline/index.mjs'), 'offline mode entry is reachable');
ok(seen.has('/modules/achievements/index.mjs'), 'offline achievements are reachable');

const missing = [...seen].filter(([u]) => !assets.has(u));
for (const [u, from] of missing) ok(false, 'precached: ' + u + '  <= ' + from);
ok(missing.length === 0, seen.size + ' loaded file(s) all precached');

// Every precached entry must exist, or install logs a miss on each deploy.
const absent = ASSET_LIST.filter(u => u !== '/' && !fs.existsSync(path.join(PUB, u.split('?')[0])));
ok(absent.length === 0, 'every ASSETS entry exists on disk' + (absent.length ? ': ' + absent.join(', ') : ''));

// Default deck + table style: what an offline game draws.
const theme = fs.readFileSync(path.join(PUB, 'modules/theme.mjs'), 'utf8');
ok(/storeKey: 'pth_deck',\s*attr: 'data-deck',\s*def: 'pokerth-new'/.test(theme), "theme.mjs default deck is still 'pokerth-new'");
ok(/\{ id: '',[^\n]*dir: 'pokerth-official-fs'/.test(theme), "theme.mjs default table ('') is still pokerth-official-fs");
ok(html.includes("_dk='pokerth-new';_dx='svg'"), 'inline boot default deck is still pokerth-new (svg)');
const deck = [];
for (let n = 0; n < 52; n++) deck.push('/cards/pokerth-new/' + n + '.svg');
deck.push('/cards/pokerth-new/flipside.svg', '/cards/pokerth-new/flipside.svg?v=' + BUILD_ID);
const deckMiss = deck.filter(u => !assets.has(u));
ok(deckMiss.length === 0, 'default deck precached (52 faces + back, plain and ?v=)' + (deckMiss.length ? ': ' + deckMiss.join(', ') : ''));
const tbl = ['felt.png', 'dealerPuck.svg', 'smallblindPuck.svg', 'bigblindPuck.svg',
  'actionFold.svg', 'actionCall.svg', 'actionRaise.svg', 'actionAllIn.svg'].map(f => '/table/pokerth-official-fs/' + f);
const tblMiss = tbl.filter(u => !assets.has(u));
ok(tblMiss.length === 0, 'default table style precached (felt, pucks, buttons)' + (tblMiss.length ? ': ' + tblMiss.join(', ') : ''));
const bv = (fs.readFileSync(path.join(PUB, 'pokerth.js'), 'utf8').match(/window\.BUILD_VERSION='([^']+)'/) || [])[1];
ok(bv && bv === BUILD_ID, 'sw.js BUILD_ID (' + BUILD_ID + ') equals pokerth.js BUILD_VERSION (' + bv + ')');

const dupes = ASSET_LIST.filter((v, i, a) => a.indexOf(v) !== i);
ok(dupes.length === 0, 'no duplicate ASSETS entry' + (dupes.length ? ': ' + dupes.join(', ') : ''));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
