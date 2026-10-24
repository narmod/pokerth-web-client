#!/usr/bin/env node
// The service reaches the web client through arena/lib/platform.mjs only
// (service 0.21.2): no other file of arena/lib, arena/bin or arena/server.mjs
// imports or reads a path outside arena/. Keeps the day the Arena becomes an
// application of its own a matter of changing one file.
// Run: node arena/test/test-arena-platform.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as P from '../lib/platform.mjs';

const ARENA = join(dirname(fileURLToPath(import.meta.url)), '..');
let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

function files(dir) {
  const out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...files(p));
    else if (/\.(mjs|js)$/.test(n)) out.push(p);
  }
  return out;
}
const list = [join(ARENA, 'server.mjs'), ...files(join(ARENA, 'lib')), ...files(join(ARENA, 'bin'))]
  .filter((p) => !p.endsWith(join('lib', 'platform.mjs')));
// An import or a path built from the file's folder that climbs out of arena/.
const OUT = [
  /from\s+['"](\.\.\/){2,}/,                               // lib/x.mjs → ../../
  /import\(\s*['"](\.\.\/){2,}/,
  /['"]\.\.['"]\s*,\s*['"]\.\.['"]/,                     // join(here, '..', '..')
];
// server.mjs sits in arena/ itself: one '..' is already outside.
const OUT_ROOT = /join\(\s*HERE\s*,\s*['"]\.\.['"]/;
for (const p of list) {
  const src = readFileSync(p, 'utf8');
  const bad = OUT.find((re) => re.test(src)) || (p === join(ARENA, 'server.mjs') && OUT_ROOT.test(src));
  ok(!bad, relative(ARENA, p) + ': nothing outside arena/ but through platform.mjs');
}

ok(P.pb && P.pb.PokerTHMessage && typeof P.pb.PokerTHMessage.encode === 'function', 'platform: the PokerTH protocol');
ok(Array.isArray(P.STYLES) && P.STYLES.length > 0 && P.LIMITS && P.LIMITS.players && typeof P.createPresets === 'function', 'platform: the create-table lists and limits');
ok(existsSync(join(P.SQL_VENDOR_DIR, 'sql-wasm.js')) && existsSync(join(P.SQL_VENDOR_DIR, 'sql-wasm.wasm')), 'platform: sql.js found');
ok(existsSync(P.LANG_META_FILE), 'platform: the languages and their flags');
ok(/^\d+\.\d+\.\d+/.test(P.webClientVersion()), 'platform: the web client version (' + P.webClientVersion() + ')');
process.env.ARENA_CLIENT_VERSION = '9.9.9-web.0';
ok(P.webClientVersion() === '9.9.9-web.0', 'platform: ARENA_CLIENT_VERSION wins');
delete process.env.ARENA_CLIENT_VERSION;
ok(typeof P.DEFAULT_DATA_DIR === 'string' && P.DEFAULT_DATA_DIR.endsWith('arena-data'), 'platform: default data folder');

if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all platform tests passed');
