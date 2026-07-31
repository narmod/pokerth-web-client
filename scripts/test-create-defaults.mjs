#!/usr/bin/env node
// Deterministic tests for the create-game defaults precedence.
// Run: node scripts/test-create-defaults.mjs
//
// Four sources feed the form, and the order between them is the whole point:
//
//   per-mode baseline  (QML configfile.cpp values)
//     → admin table defaults   (/app-config, this server's house rules)
//       → last form used       (pth_last_create, captured automatically)
//         → saved preferences  (pth_prefs_*, saved deliberately with 💾)
//
// Preferences last, because saving them is a deliberate act while the last
// form is captured behind the player's back. Getting this backwards makes the
// preferences invisible to anyone who has ever created a game — which is
// exactly the bug reported on the forum: a ranking game opening at 20 s / 7 s
// instead of the player's own 5 s / 5 s.
//
// The resolver is a self-contained slice of pokerth.js, so the test rebuilds it
// from the source rather than booting the whole client.
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

// ── Extraction ────────────────────────────────────────────────────
const start = src.indexOf('    _getCreateDefaults(skipSaved) {');
const end = src.indexOf('\n    },', start);
ok(start > 0 && end > start, '_getCreateDefaults is still where the test expects it');
if (start < 0) { console.log('\nFAIL 1'); process.exit(1); }
const body = src.slice(start, end + 6);

// L'ordre lui-même, lisible dans le source : la garantie la plus directe.
const modes = ['baseOffline', 'basePublic', 'baseLan'];
modes.forEach((m) => {
  ok(body.includes('withPrefs(withSaved(withAdmin(' + m + ')))'),
     m + ': preferences applied last, over the last form used');
});
ok(!/withSaved\(withPrefs\(/.test(body),
   'the reverse order is nowhere to be found');
// Le bouton « réinitialiser » doit rendre les défauts d'usine, pas les goûts
// du joueur : skipSaved court-circuite les deux couches personnelles.
modes.forEach((m) => {
  ok(body.includes('skipSaved ? withAdmin(' + m + ')'),
     m + ': a reset falls back to baseline + admin only');
});

// ── Exécution ─────────────────────────────────────────────────────
const store = {};
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
};
globalThis.window = { _adminTableDefaults: null, _offlineMode: false };
globalThis.S = { _currentLoginMode: 'auth' };

const host = {
  _createPrefsKey() { return 'pth_prefs_internet'; },
  _readCreatePrefsRaw() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(this._createPrefsKey()) || 'null'); } catch (e) {}
    return (d && typeof d === 'object') ? d : null;
  },
};
// _defaultNameForMode est une fonction libre de pokerth.js, pas une méthode :
// on la fournit dans la portée globale, comme à l'exécution réelle.
globalThis._defaultNameForMode = () => 'fresh name';
// La méthode est extraite telle quelle et rattachée à `host` : `this` y désigne
// donc bien l'objet porteur, comme dans App.
const fnSrc = body.trim().replace(/^_getCreateDefaults\s*\(/, 'function (').replace(/,$/, '');
host._getCreateDefaults = eval('(' + fnSrc + ')');

// Baseline seule.
let d = host._getCreateDefaults(false);
ok(d.timeout === 20 && d.delayHands === 7, 'bare baseline is the QML 20 s / 7 s');

// Dernier formulaire utilisé.
store['pth_last_create'] = JSON.stringify({ timeout: 30, delayHands: 12, stack: 4000 });
d = host._getCreateDefaults(false);
ok(d.timeout === 30 && d.delayHands === 12, 'the last form used wins over the baseline');

// Préférences enregistrées : le cas du rapport.
store['pth_prefs_internet'] = JSON.stringify({ timeout: 5, delayHands: 5, name: 'saved name' });
d = host._getCreateDefaults(false);
ok(d.timeout === 5 && d.delayHands === 5, 'saved preferences win over the last form used');
ok(d.stack === 4000, 'fields absent from the preferences keep the last value used');
ok(d.name === 'fresh name', 'the table name is never restored, from either source');

// Réinitialisation.
d = host._getCreateDefaults(true);
ok(d.timeout === 20 && d.delayHands === 7, 'a reset ignores both personal layers');

// Défauts admin : sous les couches personnelles, au-dessus du baseline.
delete store['pth_prefs_internet'];
delete store['pth_last_create'];
window._adminTableDefaults = { timeout: 15 };
d = host._getCreateDefaults(false);
ok(d.timeout === 15, 'admin table defaults override the baseline');
store['pth_prefs_internet'] = JSON.stringify({ timeout: 5 });
d = host._getCreateDefaults(false);
ok(d.timeout === 5, 'the player\u2019s own preference still wins over the admin default');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
