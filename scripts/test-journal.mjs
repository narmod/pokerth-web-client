#!/usr/bin/env node
// Deterministic guards for public/modules/journal.mjs — Logs window.
// Run: node scripts/test-journal.mjs
//
// Scope: the two invariants that are easy to break and expensive to notice.
//  1. Loading is lazy: the session list reads the 'meta' store only, and the
//     detail stores are read per selected session through a key range, so the
//     window opens in time proportional to the number of sessions, not to the
//     total number of hands ever stored.
//  2. Retention never removes the running session nor an imported one, and
//     offers the full set of durations.
// The DOM and IndexedDB layers are not exercised here; the module is a single
// self-contained file, so the source is read and asserted directly.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'public', 'modules', 'journal.mjs'), 'utf8');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Body of a top-level function declaration (brace matching, good enough here).
function body(name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = src.indexOf('{', head), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(i, j + 1); }
  }
  return '';
}

// ── 1. Lazy loading ───────────────────────────────────────────────────────
ok(!/\b_loadAll\b/.test(src), 'no global _loadAll() left');
ok(/async function _loadMetas\(/.test(src), '_loadMetas() exists');
ok(/async function _loadSession\(/.test(src), '_loadSession() exists');

const meta = body('_loadMetas');
ok(/transaction\(\['meta'\], 'readonly'\)/.test(meta), '_loadMetas reads the meta store only');
ok(!/games|players|hands|actions/.test(meta), '_loadMetas touches no detail store');

const one = body('_loadSession');
ok(/IDBKeyRange\.bound\(sid \+ ':', sid \+ ';', false, true\)/.test(one),
  '_loadSession bounds the range to the session prefix');
ok(/getAll\(range\)/.test(one), '_loadSession passes the range to getAll()');
ok(/DETAIL_STORES\.map\(get\)/.test(one), '_loadSession reads the four detail stores');
ok(/const DETAIL_STORES = \['games', 'players', 'hands', 'actions'\];/.test(src),
  'DETAIL_STORES excludes meta');

const reload = body('_reload');
ok(/_loadMetas\(\)/.test(reload) && !/_loadSession\(/.test(reload),
  '_reload() loads metas and defers the detail load');
ok(/_loadSelected\(\)/.test(reload), '_reload() hands over to _loadSelected()');

const sel = body('_loadSelected');
ok(/if \(sid !== _sel/.test(sel), '_loadSelected() drops a result made stale by a newer click');

// ── 2. Retention ──────────────────────────────────────────────────────────
const purge = body('purgeOldSessions');
ok(/const metas = await _loadMetas\(\);/.test(purge), 'purge reads metas only');
ok(/if \(sid === cur\) continue;/.test(purge), 'purge keeps the running session');
ok(/if \(m\.imported\) continue;/.test(purge), 'purge keeps imported sessions');
ok(/const cutoff = Date\.now\(\) - days \* 86400000;/.test(purge)
  && /sid\.match\(\/\^\(\\d\{4\}\)-\(\\d\{2\}\)-\(\\d\{2\}\)\//.test(purge),
  'purge compares the play date carried by the session id, not the import date');

for (const d of ['7', '30', '90', '180', '365']) {
  ok(src.includes('<option value="' + d + '">'), 'retention offers ' + d + ' days');
}
ok(src.includes('<option value="0">'), 'retention offers Forever');

ok(/sessionId: sid, imported: true/.test(src), 'the .pdb importer flags sessions as imported');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
