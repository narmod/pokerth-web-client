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
// The tests too (0.37.0: they must run in the Arena's own repository), but
// the three that look for the web client around and skip without it, and this one.
const AROUND = ['test-arena-route.mjs', 'test-arena-public-browser.mjs', 'test-arena-play-browser.mjs', 'test-arena-platform.mjs'];
const list = [join(ARENA, 'server.mjs'), ...files(join(ARENA, 'lib')), ...files(join(ARENA, 'bin')), ...files(join(ARENA, 'test')).filter((p) => AROUND.indexOf(p.split(/[\\/]/).pop()) < 0)]
  .filter((p) => !p.endsWith(join('lib', 'platform.mjs')));
// An import that resolves outside arena/, or a path built from the file's
// folder that climbs out of it (join(here, '..', '..') — one '..' is enough
// from arena/ itself or a direct sub-folder's file, two from test/lib/).
import { resolve as resolvePath, sep } from 'node:path';
const inside = (f) => f === ARENA || f.indexOf(ARENA + sep) === 0;
const SPEC = /(?:from\s+|import\(\s*)['"](\.\.?\/[^'"]+)['"]/g;
for (const p of list) {
  const src = readFileSync(p, 'utf8');
  let bad = null, m;
  SPEC.lastIndex = 0;
  while ((m = SPEC.exec(src))) { if (!inside(resolvePath(dirname(p), m[1]))) { bad = m[1]; break; } }
  if (!bad) {
    // join(…, '..', '..', …) from a file's folder: count the '..' against its depth.
    const depth = relative(ARENA, dirname(p)).split(sep).filter(Boolean).length;
    const J = /join\(\s*(?:HERE|here|dirname\([^)]*\))\s*((?:,\s*['"]\.\.['"]\s*)+)/g;
    let j;
    while ((j = J.exec(src))) { if ((j[1].match(/\.\./g) || []).length > depth) { bad = j[0]; break; } }
  }
  ok(!bad, relative(ARENA, p) + ': nothing outside arena/ but through platform.mjs' + (bad ? ' (' + bad + ')' : ''));
}

ok(P.pb && P.pb.PokerTHMessage && typeof P.pb.PokerTHMessage.encode === 'function', 'platform: the PokerTH protocol');
ok(Array.isArray(P.STYLES) && P.STYLES.length > 0 && P.LIMITS && P.LIMITS.players && typeof P.createPresets === 'function', 'platform: the create-table lists and limits');
ok(existsSync(join(P.SQL_VENDOR_DIR, 'sql-wasm.js')) && existsSync(join(P.SQL_VENDOR_DIR, 'sql-wasm.wasm')), 'platform: sql.js found');
ok(existsSync(P.LANG_META_FILE), 'platform: the languages and their flags');
ok(existsSync(P.HERO_IMAGE_FILE), 'platform: the picture behind the titles');
ok(/^\d+\.\d+\.\d+/.test(P.webClientVersion()), 'platform: the web client version (' + P.webClientVersion() + ')');
process.env.ARENA_CLIENT_VERSION = '9.9.9-web.0';
ok(P.webClientVersion() === '9.9.9-web.0', 'platform: ARENA_CLIENT_VERSION wins');
delete process.env.ARENA_CLIENT_VERSION;
ok(typeof P.DEFAULT_DATA_DIR === 'string' && (P.STANDALONE ? /[\\/]data$/.test(P.DEFAULT_DATA_DIR) : P.DEFAULT_DATA_DIR.endsWith('arena-data')), 'platform: default data folder (' + (P.STANDALONE ? 'on its own: arena/data' : 'in the web client: arena-data') + ')');
ok(existsSync(join(P.FONTS_DIR, 'InterVariable.woff2')), 'platform: the Inter font');

if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all platform tests passed');
