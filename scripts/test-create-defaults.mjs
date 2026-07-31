#!/usr/bin/env node
// Deterministic tests for the create-game defaults precedence.
// Run: node scripts/test-create-defaults.mjs
//
// Four sources feed the form, and the order between them is the whole point:
//
//   per-mode baseline  (QML configfile.cpp values)
//     → admin table defaults   (/app-config, this server's house rules)
//       → saved preferences    (pth_prefs_*, written with the 💾 button)
//         → last form used     (pth_last_create, captured on every create)
//
// The last form used wins, and that is deliberate: a player who tweaks the
// form and starts a game must find those choices again next time, with nothing
// silently placed on top. Preferences are the floor underneath — they dress the
// form until a game has been created in this mode, and fill the fields the last
// form does not cover. Reloading them on demand is what the star button is for.
//
// Before this layer existed the preferences were applied nowhere but that
// button, which is what the forum report was about: 5 s / 5 s saved in the
// Internet preferences, a form opening at 20 s / 7 s.
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
  ok(body.includes('withSaved(withPrefs(withAdmin(' + m + ')))'),
     m + ': the last form used is applied last, over the preferences');
});
ok(!/withPrefs\(withSaved\(/.test(body),
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

// Préférences seules : elles habillent le formulaire tant qu'aucune partie
// n'a été créée dans ce mode. C'est le cas du rapport du forum.
store['pth_prefs_internet'] = JSON.stringify({ timeout: 5, delayHands: 5, stack: 7000, name: 'saved name' });
d = host._getCreateDefaults(false);
ok(d.timeout === 5 && d.delayHands === 5, 'saved preferences dress the form over the baseline');
ok(d.name === 'fresh name', 'the table name is never restored, from either source');

// Puis une partie est créée : les choix du joueur reprennent la main.
store['pth_last_create'] = JSON.stringify({ timeout: 30, delayHands: 12 });
d = host._getCreateDefaults(false);
ok(d.timeout === 30 && d.delayHands === 12, 'what the player last used wins over the preferences');
ok(d.stack === 7000, 'fields the last form does not cover still come from the preferences');

// Réinitialisation.
d = host._getCreateDefaults(true);
ok(d.timeout === 20 && d.delayHands === 7, 'a reset ignores both personal layers');

// Défauts admin : au-dessus du baseline, sous les deux couches personnelles.
delete store['pth_prefs_internet'];
delete store['pth_last_create'];
window._adminTableDefaults = { timeout: 15 };
d = host._getCreateDefaults(false);
ok(d.timeout === 15, 'admin table defaults override the baseline');
store['pth_prefs_internet'] = JSON.stringify({ timeout: 5 });
d = host._getCreateDefaults(false);
ok(d.timeout === 5, 'a saved preference still wins over the admin default');
store['pth_last_create'] = JSON.stringify({ timeout: 25 });
d = host._getCreateDefaults(false);
ok(d.timeout === 25, 'and what the player last used wins over everything');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
