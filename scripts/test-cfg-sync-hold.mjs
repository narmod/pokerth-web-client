#!/usr/bin/env node
// A preferences save that has not been pushed yet must survive a newer
// config.xml coming down from the account sync. The descent applies the server
// file through mergePrefs, which overwrites pth_prefs_* field by field; the
// protection is a hold list — keys removed from the descending snapshot when
// the prefs are locally dirty — and it is only as good as its coverage:
// any key mergePrefs reads that the list forgets is a field the player loses.
// This test derives the set of keys mergePrefs actually reads FROM THE SOURCE
// and checks the hold list covers every one of them, so the two can never
// drift apart. It also pins the dirty marks to the writers' vocabulary and
// the double-'Net' regression (n() prepends the prefix itself).
// Run: node scripts/test-cfg-sync-hold.mjs
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

// ── Extract the hold tables ─────────────────────────────────────────
function grab(marker, endMarker) {
  const a = src.indexOf(marker);
  ok(a > 0, marker.split(' ')[1] + ' is still where the test expects it');
  return a > 0 ? src.slice(a, src.indexOf(endMarker, a) + endMarker.length) : '';
}
const scalarsSrc = grab('var PTH_CFG_PREFS_SCALARS', '})();');
const marksSrc   = grab('var PTH_CFG_PREFS_DIRTY_MARKS', '};');
const listsSrc   = grab('var PTH_CFG_PREFS_LISTS', '];');
const SCALARS = eval('(' + scalarsSrc.replace('var PTH_CFG_PREFS_SCALARS =', '').replace(/;\s*$/, '') + ')');
const MARKS   = eval('(' + marksSrc.replace('var PTH_CFG_PREFS_DIRTY_MARKS =', '').replace(/;\s*$/, '') + ')');
const LISTS   = eval('(' + listsSrc.replace('var PTH_CFG_PREFS_LISTS =', '').replace(/;\s*$/, '') + ')');

// ── Derive what mergePrefs reads, from its own source ───────────────
const mpStart = src.indexOf('var mergePrefs = function (storageKey, net) {');
ok(mpStart > 0, 'mergePrefs is still where the test expects it');
const mpBody = src.slice(mpStart, src.indexOf('\n  };', mpStart));

const reads = new Set();
// n('Key') — the helper prepends the prefix, so 'Key' and 'NetKey' are both read
for (const m of mpBody.matchAll(/\bn\('([A-Za-z]+)'\)/g)) { reads.add(m[1]); reads.add('Net' + m[1]); }
// S[P + 'Key'] — same, both prefixes
for (const m of mpBody.matchAll(/S\[P \+ '([A-Za-z]+)'\]/g)) { reads.add(m[1]); reads.add('Net' + m[1]); }
// S.Key — direct scalar reads (S.InternetGameName & co)
for (const m of mpBody.matchAll(/\bS\.([A-Z][A-Za-z]+)\b/g)) reads.add(m[1]);
// L[P + 'Key'] — lists, both prefixes
const listReads = new Set();
for (const m of mpBody.matchAll(/L\[P \+ '([A-Za-z]+)'\]/g)) { listReads.add(m[1]); listReads.add('Net' + m[1]); }

ok(reads.size >= 20, 'mergePrefs reads were found in the source (' + reads.size + ' scalar keys)');
const missing = [...reads].filter((k) => !SCALARS.includes(k));
ok(missing.length === 0,
   'every scalar mergePrefs reads is on the hold list'
     + (missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''));
const missingLists = [...listReads].filter((k) => !LISTS.includes(k));
ok(missingLists.length === 0,
   'every list mergePrefs reads is on the hold list'
     + (missingLists.length ? ' (missing: ' + missingLists.join(', ') + ')' : ''));

// ── The double-'Net' regression stays fixed ─────────────────────────
// n() prepends P; passing the already-prefixed name read S.NetNetGameSpeed,
// a key that never exists, so the internet speed/timeout/delay never merged.
ok(!/\bn\('Net[A-Za-z]+'\)/.test(mpBody),
   "mergePrefs never calls n() with an already-'Net'-prefixed key");

// ── The dirty marks match the writers' vocabulary ───────────────────
ok(MARKS.create_prefs === 1, "the disk button's mark ('create_prefs') triggers the hold");
// advPrefSet marks with the raw field names of the advanced-options panel;
// the authoritative list of those fields is the _advSyncPrefs table.
const asStart = src.indexOf('function _advSyncPrefs() {');
ok(asStart > 0, '_advSyncPrefs is still where the test expects it');
const asBody = src.slice(asStart, src.indexOf('\n}', asStart));
const fieldSet = new Set();
for (const m of asBody.matchAll(/'([a-zA-Z]+)'/g)) fieldSet.add(m[1]);
// keep only the pref FIELD names (the table also holds element-id fragments)
const prefFields = ['players', 'stack', 'blind', 'raiseEvery', 'timeout',
                    'delayHands', 'guiSpeed', 'name', 'gameType', 'allowSpectators']
  .filter((f) => fieldSet.has(f));
const unmarked = prefFields.filter((f) => MARKS[f] !== 1);
ok(prefFields.length >= 8 && unmarked.length === 0,
   'every field advPrefSet can mark dirty triggers the hold'
     + (unmarked.length ? ' (unmarked: ' + unmarked.join(', ') + ')' : ''));

// ── The hold lives in the shared descent, before the apply ──────────
// (extracted into _cfgSyncApplyDescent so the login pull AND the
// pre-push reconciliation run the exact same protections)
const dStart = src.indexOf('function _cfgSyncApplyDescent(');
ok(dStart > 0, '_cfgSyncApplyDescent is still where the test expects it');
const dBody = src.slice(dStart, src.indexOf('\n}', dStart));
const iHold  = dBody.indexOf('PTH_CFG_PREFS_DIRTY_MARKS');
const iApply = dBody.indexOf('_cfgApplyImported(cfg)');
ok(iHold > 0 && iApply > iHold, 'the prefs hold runs inside the descent, before the snapshot is applied');
ok(/PTH_CFG_PREFS_SCALARS[\s\S]*held\+\+/.test(dBody) && /PTH_CFG_PREFS_LISTS[\s\S]*held\+\+/.test(dBody),
   'held keys count as held — the dirty flag survives and the local values are pushed back');
ok(dBody.indexOf('_advSyncPrefs()') > 0,
   'the preferences panel is refreshed after a descent, so it never shows ghosts');

// ── The login pull and the pre-push reconciliation share that descent ──
const pullStart = src.indexOf('function _cfgSyncPull() {');
ok(pullStart > 0, '_cfgSyncPull is still where the test expects it');
const pullBody = src.slice(pullStart, src.indexOf('\n}', pullStart));
ok(pullBody.indexOf('_cfgSyncApplyDescent(d, true)') > 0, 'the login pull applies the shared descent (with the toast)');

// A push is a FULL xml rebuilt from local storage: from a tab left open for
// days it re-sent stale preferences and flattened what another device had
// set meanwhile — the forum report's endless 'My online game'. The push must
// therefore reconcile first: GET, apply the descent (holds protect what was
// just edited here), then push the merged state. Keepalive (pagehide) pushes
// have no time for a round-trip and go straight out.
const pushStart = src.indexOf('function _cfgSyncPushNow(');
ok(pushStart > 0, '_cfgSyncPushNow is still where the test expects it');
const pushBody = src.slice(pushStart, src.indexOf('\n}', pushStart));
const iRecon = pushBody.indexOf('_cfgSyncApplyDescent(d, false)');
const iPut   = pushBody.indexOf("method: 'PUT'");
ok(iRecon > 0 && iPut > iRecon, 'the push reconciles (silent descent) before the PUT');
ok(/if \(!keepalive && !_cfgPushReconciled\)/.test(pushBody),
   'keepalive pushes skip the round-trip, and the guard prevents a reconcile loop');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
