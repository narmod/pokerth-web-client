#!/usr/bin/env node
// Retention of hashed device ids (proxy.js pruneVisitDays / pruneVisitIds).
// The privacy page promises visit data is deleted after about 13 months: a
// hashed id must disappear from the all-time sets once no retained daily
// bucket holds it, and never before the retention is reached.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
function fn(name) {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('missing ' + name);
  let d = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}' && --d === 0) return src.slice(i, k + 1); }
  throw new Error('unbalanced ' + name);
}
function make(store) {
  const ctx = { visitsStore: store, VISIT_RETENTION_DAYS: 3 };
  vm.createContext(ctx);
  vm.runInContext(fn('pruneVisitDays') + '\n' + fn('pruneVisitIds') + '\nthis.pruneVisitDays = pruneVisitDays; this.pruneVisitIds = pruneVisitIds;', ctx);
  return ctx;
}
const day = (d) => '2026-09-' + String(d).padStart(2, '0');

// Young store: below retention nothing is touched, orphan or not.
let st = { days: { [day(1)]: { v: 1, ids: { a: 1 } } }, allU: { a: 1, ghost: 2 }, allLU: { g: 1 } };
let c = make(st); c.pruneVisitDays();
ok(st.allU.ghost !== undefined && st.allLU.g === 1, 'below retention: no id is pruned');

// Retention reached: oldest bucket expires, its only device goes; devices still
// seen in a retained bucket stay, with their first-day value intact.
st = {
  days: {
    [day(1)]: { v: 2, ids: { old: 1, keep: 1 }, lids: { lold: 1 } },
    [day(2)]: { v: 1, ids: { keep: 1 }, lids: { lkeep: 1 } },
    [day(3)]: { v: 1, ids: { fresh: 1 } },
    [day(4)]: { v: 1, ids: { fresh: 1 } }
  },
  allU: { old: 1001, keep: 1001, fresh: 1003, orphan: 900 },
  allLU: { lold: 1, lkeep: 1, lorphan: 1 }
};
c = make(st); c.pruneVisitDays();
ok(!st.days[day(1)] && Object.keys(st.days).length === 3, 'oldest bucket expires at retention');
ok(st.allU.old === undefined, 'device only seen in the expired bucket is dropped');
ok(st.allU.keep === 1001 && st.allU.fresh === 1003, 'devices seen in retained buckets stay, first day intact');
ok(st.allU.orphan === undefined, 'ids orphaned by older builds are cleared at the first expiry');
ok(st.allLU.lold === undefined && st.allLU.lorphan === undefined && st.allLU.lkeep === 1, '/live ids follow the same rule');
ok(c.pruneVisitIds() === 0, 'second pass removes nothing');
ok(/keys\.slice\(0, keys\.length - VISIT_RETENTION_DAYS\)\.forEach[^\n]*\n  pruneVisitIds\(\);/.test(src), 'pruneVisitDays calls pruneVisitIds right after expiring buckets');

console.log(`\n${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
