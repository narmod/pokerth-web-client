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
// and fails if any of them is absent from ASSETS. Dependency-free.
// Run: node scripts/test-precache.mjs
import fs from 'fs';
import path from 'path';

const PUB = path.resolve('public');
const sw = fs.readFileSync(path.join(PUB, 'sw.js'), 'utf8');
const block = sw.match(/const ASSETS = \[([\s\S]*?)\n\];/);
if (!block) { console.log('  \u2717 ASSETS array not found in sw.js'); process.exit(1); }
const assets = new Set([...block[1].matchAll(/'([^']+)'/g)].map(m => m[1]));

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

const dupes = block[1].match(/'([^']+)'/g).filter((v, i, a) => a.indexOf(v) !== i);
ok(dupes.length === 0, 'no duplicate ASSETS entry' + (dupes.length ? ': ' + dupes.join(', ') : ''));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
