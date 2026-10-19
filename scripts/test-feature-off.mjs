#!/usr/bin/env node
// Admin kill switches (/app-config.featureOff) really switch features off.
// Run: node scripts/test-feature-off.mjs
//
// The quiet failure this guards: a module reads its option straight from
// localStorage, the admin ticks the switch, the checkbox in Advanced options
// greys out — and the feature keeps running. Every direct reader of a switched
// key must ask featureOff() (or _pthFeatureOff / _advGet) first, and every key
// the client checks must exist on the server, which drops unknown keys.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');
const proxy = readFileSync(join(ROOT, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── Server catalogue ──────────────────────────────────────────────────────
const cat = /const FEATURE_SWITCHES = \[([\s\S]*?)\n\];/.exec(proxy);
ok(!!cat, 'FEATURE_SWITCHES is found in proxy.js');
const KEYS = cat ? [...cat[1].matchAll(/key: '([a-z_0-9]+)'/g)].map(m => m[1]) : [];
ok(KEYS.length >= 23, 'the catalogue lists every switch (' + KEYS.length + ')');
ok(KEYS.includes('ace_scenes') && KEYS.includes('ace_dance'), 'the Ace\'s scenes and dance can be switched off');

// ── Client sources ────────────────────────────────────────────────────────
const SKIP = /[\\/](lang|help|vendor|labs)[\\/]/;
function walk(dir, out) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f), st = statSync(p);
    if (st.isDirectory()) { if (!SKIP.test(p + '/')) walk(p, out); }
    else if (/\.(m?js|html)$/.test(f) && !/admin\.html$|studio\.html$/.test(f)) out.push(p);
  }
  return out;
}
const files = walk(PUB, []).map(p => ({ p, rel: relative(ROOT, p), src: readFileSync(p, 'utf8') }));
const GUARD = /featureOff\(|_pthFeatureOff|_advGet\(/;

for (const k of KEYS) {
  const rx = new RegExp("localStorage\\.getItem\\('pth_" + k + "'\\)", 'g');
  for (const f of files) {
    for (const m of f.src.matchAll(rx)) {
      // The guard sits at the top of the reader, a few lines above the read.
      const before = f.src.slice(Math.max(0, m.index - 320), m.index);
      const line = f.src.slice(0, m.index).split('\n').length;
      ok(GUARD.test(before), 'pth_' + k + ' read at ' + f.rel + ':' + line + ' honours the admin switch');
    }
  }
}

// Every key the client checks is one the server can actually send.
const asked = new Set();
for (const f of files) {
  for (const m of f.src.matchAll(/featureOff\('([a-z_0-9]+)'\)/g)) asked.add(m[1]);
  for (const m of f.src.matchAll(/_pthFeatureOff\.([a-z_0-9]+)/g)) asked.add(m[1]);
}
for (const k of asked) ok(KEYS.includes(k), 'client switch "' + k + '" exists in FEATURE_SWITCHES');

// ── feature-off.mjs behaviour ─────────────────────────────────────────────
globalThis.window = {};
const { featureOff } = await import(pathToFileURL(join(PUB, 'modules', 'feature-off.mjs')).href);
ok(featureOff('polls') === false, 'no list yet: nothing is off');
window._pthFeatureOff = { polls: true };
ok(featureOff('polls') === true && featureOff('err_report') === false, 'a listed key is off, the others are not');
window._pthFeatureOff = null;
ok(featureOff('polls') === false, 'a missing map never throws');
delete globalThis.window;
ok(featureOff('polls') === false, 'and neither does a missing window (Node tests)');

// ── Boot, cache and side paths ────────────────────────────────────────────
const client = readFileSync(join(PUB, 'pokerth-client.html'), 'utf8');
const js = readFileSync(join(PUB, 'pokerth.js'), 'utf8');
const sw = readFileSync(join(PUB, 'sw.js'), 'utf8');
ok(/localStorage\.getItem\('pth_feature_off'\)/.test(client), 'boot restores the last known list before the modules load');
ok(/_pthFeatureOff\.splash/.test(client), 'the splash screen follows its switch');
ok(/localStorage\.setItem\('pth_feature_off'/.test(js), '/app-config stores the list for the next boot');
ok(/refreshBackGuard\(\)/.test(js.slice(js.indexOf('function _applyFeatureOff'), js.indexOf('function _applyFeatureOff') + 1500)),
  'the back guard, installed at boot, re-reads its switch when the list arrives');
ok(/pth_feature_off: 1/.test(js), 'the list is server state: left out of the player backup');
// web.167: eight more switches. Two of their checkboxes do not call setAdvOpt
// (chat translation, account sync): they name their key in data-feat, so the
// lock and the « off (admin) » tag reach them too.
for (const k of ['winner_popup', 'deal_anim', 'forum_news', 'invite_link', 'chat_translate', 'avatar_create', 'cfg_sync', 'bak_auto']) ok(KEYS.includes(k), 'switch ' + k + ' is in the catalogue');
ok(/data-feat="chat_translate"/.test(client) && /data-feat="cfg_sync"/.test(client), 'the two checkboxes without setAdvOpt name their switch');
ok(/getAttribute\('data-feat'\)/.test(js.slice(js.indexOf('function _applyFeatureOff'), js.indexOf('function _applyFeatureOff') + 2500)), 'and the lock reads it');
ok(/function _netTrOn\(\) \{\s*try \{ if \(window\._pthFeatureOff && window\._pthFeatureOff\.chat_translate\) return false;/.test(js), 'switched off, nothing is sent to Google, operator texts included');
const coll = js.slice(js.indexOf('function _cfgCollectWebSettings'), js.indexOf('function _cfgCollectWebSettings') + 4000);
ok(!/_advGet\(advKey/.test(coll), 'account sync writes the player\'s own choice, not the admin override');
ok(sw.includes("'/modules/feature-off.mjs'"), 'the helper is precached for offline play');

// ── First-visit defaults reach the live game state ────────────────────────
const def = js.slice(js.indexOf('function _applyDefaultSettings'), js.indexOf('function _applyDefaultSettings') + 2000);
const mapKeys = [...(/var MAP = \{([^}]*)\}/.exec(def) || ['', ''])[1].matchAll(/(\w+):/g)].map(m => m[1]);
const liveKeys = [...(/var LIVE = \{([\s\S]*?)\n\s*\};/.exec(def) || ['', ''])[1].matchAll(/^\s*(\w+): function/gm)].map(m => m[1]);
ok(mapKeys.length === 6 && mapKeys.every(k => liveKeys.includes(k)), 'every admin default is pushed into the game state on the first visit');
ok(/getItem\(MAP\[k\]\) !== null\) return/.test(def), 'and only when the player never chose: a stored choice is never overridden');

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
