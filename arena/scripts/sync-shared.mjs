#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// Arena — copy what the Arena takes from the PokerTH web client into its own
// shared/ folder (service 0.37.0), so that it runs without the web client
// around it (lib/platform.mjs looks in shared/ first).
//
//   node scripts/sync-shared.mjs [<web client folder>]
//
// Default folder: the one around the Arena (when it still lives in the web
// client's repository). Run it again when the web client changes the PokerTH
// protocol, the create-table lists, its languages or its version, and commit
// shared/ in the Arena's own repository (the web client's repository ignores
// arena/shared/).
// What it copies (each file's licence travels with it):
//   proto/pokerth-bundle.mjs, proto/protobuf-minimal.mjs   protobuf.js (BSD-3)
//   create-presets.mjs                                      the create-table lists
//   vendor/sql-wasm.js, vendor/sql-wasm.wasm                sql.js (MIT)
//   lang-meta.mjs                                           languages and flags
//   img/hero.webp                                           the start screen picture
//   fonts/inter-*.woff2, fonts/InterVariable.woff2,
//   fonts/Inter-OFL.txt                                     Inter (OFL 1.1)
//   vendor/package.json                                     sql-wasm.js is CommonJS
//   client-version.json                                     the web client's version
//   SOURCE.json                                             where and when it was copied
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ARENA = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(process.argv[2] || path.join(ARENA, '..'));
const DST = path.join(ARENA, 'shared');
const FILES = [
  ['public/proto/pokerth-bundle.mjs', 'proto/pokerth-bundle.mjs'],
  ['public/proto/protobuf-minimal.mjs', 'proto/protobuf-minimal.mjs'],
  ['public/modules/create-presets.mjs', 'create-presets.mjs'],
  ['public/vendor/sql-wasm.js', 'vendor/sql-wasm.js'],
  ['public/vendor/sql-wasm.wasm', 'vendor/sql-wasm.wasm'],
  ['public/modules/lang-meta.mjs', 'lang-meta.mjs'],
  ['public/img/pokerth-login-bg.webp', 'img/hero.webp'],
  ['public/fonts/inter-latin-wght-normal.woff2', 'fonts/inter-latin-wght-normal.woff2'],
  ['public/fonts/inter-latin-ext-wght-normal.woff2', 'fonts/inter-latin-ext-wght-normal.woff2'],
  ['public/fonts/InterVariable.woff2', 'fonts/InterVariable.woff2'],
  ['public/fonts/Inter-OFL.txt', 'fonts/Inter-OFL.txt'],
];

const missing = FILES.filter(([from]) => !fs.existsSync(path.join(SRC, from)));
if (missing.length) {
  console.error('Not a PokerTH web client folder (' + SRC + '): missing ' + missing.map((m) => m[0]).join(', '));
  process.exit(2);
}
let version = '';
try { version = JSON.parse(fs.readFileSync(path.join(SRC, 'package.json'), 'utf8')).version || ''; } catch (e) {}
if (!/^\d+\.\d+\.\d+/.test(version)) { console.error('The web client\'s package.json has no version'); process.exit(2); }

let changed = 0;
for (const [from, to] of FILES) {
  const a = path.join(SRC, from), b = path.join(DST, to);
  fs.mkdirSync(path.dirname(b), { recursive: true });
  const buf = fs.readFileSync(a);
  let same = false;
  try { same = fs.readFileSync(b).equals(buf); } catch (e) {}
  if (!same) { fs.writeFileSync(b, buf); changed++; console.log('  copied  ' + to); }
}
const write = (name, obj) => {
  const s = JSON.stringify(obj, null, 2) + '\n';
  let old = null; try { old = fs.readFileSync(path.join(DST, name), 'utf8'); } catch (e) {}
  if (old !== s) { fs.writeFileSync(path.join(DST, name), s); changed++; console.log('  wrote   ' + name); }
};
write('client-version.json', { version });
// sql-wasm.js is CommonJS; the Arena's package.json says « type: module »,
// so the nearest package.json must say otherwise for it to load with require().
write('vendor/package.json', { type: 'commonjs' });
write('SOURCE.json', { webClientVersion: version, files: FILES.map((f) => f[1]), note: 'Copied from the PokerTH web client by scripts/sync-shared.mjs. Do not edit: run it again.' });
console.log(changed ? 'shared/: ' + changed + ' file(s) updated from web client ' + version : 'shared/: up to date with web client ' + version);
