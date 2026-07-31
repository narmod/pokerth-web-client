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
ok(d.name === 'saved name', 'the table name IS restored from the preferences');

// Puis une partie est créée : les choix du joueur reprennent la main.
store['pth_last_create'] = JSON.stringify({ timeout: 30, delayHands: 12, name: 'last name' });
d = host._getCreateDefaults(false);
ok(d.timeout === 30 && d.delayHands === 12, 'what the player last used wins over the preferences');
ok(d.name === 'last name', 'the name follows the same rule: what was last used wins');
ok(d.stack === 7000, 'fields the last form does not cover still come from the preferences');

// Un nom vide, dans l'une ou l'autre mémoire, n'écrase pas le nom du mode.
store['pth_last_create'] = JSON.stringify({ timeout: 30, name: '' });
d = host._getCreateDefaults(false);
ok(d.name === 'saved name', 'a blank last-used name does not wipe the saved one');
delete store['pth_last_create'];

// Un nom de préférence vide n'écrase pas le nom par défaut du mode.
store['pth_prefs_internet'] = JSON.stringify({ timeout: 5, name: '   ' });
d = host._getCreateDefaults(false);
ok(d.name === 'fresh name', 'a blank saved name falls back to the default');
store['pth_prefs_internet'] = JSON.stringify({ timeout: 5, delayHands: 5, stack: 7000, name: 'saved name' });

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

// ── Un seul jeu de défauts ────────────────────────────────────────
// Le panneau Options avancées (_advPrefsBaseline) et le formulaire de création
// décrivent la même chose. Deux baselines divergentes ne peuvent produire
// qu'une contradiction : le panneau annonce une valeur, la création en montre
// une autre, et le joueur en conclut que ses préférences sont ignorées alors
// qu'il n'a jamais rien enregistré. C'est le rapport du forum.
const advStart = src.indexOf('function _advPrefsBaseline(mode) {');
ok(advStart > 0, '_advPrefsBaseline is still where the test expects it');
const advBody = src.slice(advStart, src.indexOf('\n}', advStart) + 2);
globalThis._advPrefsBaseline = eval('(' + advBody.trim().replace(/^function _advPrefsBaseline/, 'function') + ')');

// Le formulaire, mêmes conditions : rien d'enregistré, aucun défaut admin.
delete store['pth_prefs_internet'];
delete store['pth_last_create'];
window._adminTableDefaults = null;

const shared = ['players', 'stack', 'blind', 'raiseEvery', 'timeout', 'delayHands'];
const pairs = [['net', 'auth', false], ['lan', 'lan', false], ['local', 'lan', true]];
pairs.forEach(([advMode, loginMode, offline]) => {
  S._currentLoginMode = loginMode;
  window._offlineMode = offline;
  const form = host._getCreateDefaults(false);
  const panel = _advPrefsBaseline(advMode);
  const off = shared.filter((k) => String(panel[k]) !== String(form[k]));
  ok(off.length === 0,
     advMode + ': the panel and the create form open on the same values'
       + (off.length ? ' (differ on ' + off.map((k) => k + ' ' + panel[k] + '\u2260' + form[k]).join(', ') + ')' : ''));
});
S._currentLoginMode = 'auth';
window._offlineMode = false;

// Et la valeur elle-même reste celle du client officiel.
ok(_advPrefsBaseline('net').timeout === 20 && _advPrefsBaseline('net').delayHands === 7,
   'the Internet panel no longer announces a timeout the create form will not use');

// ── Nom déjà pris dans le lobby ───────────────────────────────────
// Mémoriser le nom ne doit pas ressusciter le refus « nom déjà pris » : à
// l'ouverture, un nom encore visible dans le lobby est décalé.
const freeStart = src.indexOf('    _freeGameName(name) {');
ok(freeStart > 0, '_freeGameName is still where the test expects it');
const freeBody = src.slice(freeStart, src.indexOf('\n    },', freeStart) + 6);
const freeName = eval('(' + freeBody.trim().replace(/^_freeGameName\s*\(/, 'function (').replace(/,$/, '') + ')');

window.S = { games: {} };
ok(freeName('Chez Bob') === 'Chez Bob', 'a free name is left alone');

window.S.games = { 1: { name: 'Chez Bob' } };
ok(freeName('Chez Bob') === 'Chez Bob 2', 'a name already on the lobby list is shifted');
ok(freeName('chez bob') === 'chez bob 2', 'the comparison ignores case');

window.S.games = { 1: { name: 'Chez Bob' }, 2: { name: 'Chez Bob 2' }, 3: { name: ' Chez Bob 3 ' } };
ok(freeName('Chez Bob') === 'Chez Bob 4', 'it keeps counting past the ones taken, trimmed');

// Le champ QML plafonne à 48 caractères : le suffixe doit tenir dedans.
const long = 'x'.repeat(48);
window.S.games = {};
window.S.games[1] = { name: long };
ok(freeName(long).length <= 48, 'the shifted name still fits the 48-character field');

// Pas de lobby chargé : on n'invente rien.
window.S = {};
ok(freeName('Chez Bob') === 'Chez Bob', 'with no lobby list loaded the name is untouched');
ok(freeName('') === '', 'an empty name stays empty');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
