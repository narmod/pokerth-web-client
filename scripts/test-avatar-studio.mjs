// Deterministic tests for the avatar studio (tabs) + vector engine.
// Run: node scripts/test-avatar-studio.mjs   (needs: npm i jsdom --no-save)
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(__dirname, '..', 'public');
let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  \u2713 ' + msg); }
  else { fail++; console.log('  \u2717 ' + msg); }
}

const dom = new JSDOM(`<!DOCTYPE html><body>
  <div id="avatar-popup">
    <div id="avp-pane-gallery"></div>
    <button id="avp-tab-gallery" class="selected"></button>
    <button id="avp-tab-create"></button>
    <button id="avp-tab-import"></button>
    <div id="avp-pane-create" style="display:none"></div>
    <div id="avp-pane-import" style="display:none"></div>
  </div></body>`, { url: 'https://localhost/' });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.Image = dom.window.Image;
window.t = (k) => k;

// Load both modules in dependency order, stripping ESM import/export.
function load(p) {
  let src = fs.readFileSync(path.join(PUB, p), 'utf8');
  src = src.replace(/^import .*$/m, '').replace(/export \{[^}]*\};?/, '');
  (0, eval)(src.replace(/^'use strict';/m, ''));
}
load('modules/ui/avatar-vector.mjs');
// avatar-studio consumes the engine's window._-prefixed exports in the harness.
let studio = fs.readFileSync(path.join(PUB, 'modules/ui/avatar-studio.mjs'), 'utf8');
studio = studio.replace(/^import .*$/m,
  'const AV_AXES = window._AV_AXES, avSvg = window._avSvg, avSwatch = window._avSwatch, avNormalize = window._avNormalize, avRandom = window._avRandom;');
studio = studio.replace(/export \{[^}]*\};?/, '');
(0, eval)(studio.replace(/^'use strict';/m, ''));

// 1. APIs
ok(typeof window.avStudioTab === 'function', 'avStudioTab exposed');
ok(typeof window._avSvg === 'function', 'vector engine exposed');
const AXES = window._AV_AXES;
ok(Array.isArray(AXES) && AXES.length === 13, '13 axes defined (' + AXES.length + ')');

// 2. Engine coherence: every option of every axis renders a clean SVG.
let clean = true, badMsg = '';
for (const ax of AXES) {
  for (let i = 0; i < ax.n; i++) {
    const r = {}; r[ax.id] = i;
    const svg = window._avSvg(window._avNormalize(r), 96);
    if (!svg.startsWith('<svg') || !svg.endsWith('</svg>') || svg.includes('undefined') || svg.includes('NaN')) {
      clean = false; badMsg = ax.id + '#' + i;
    }
  }
}
ok(clean, 'every axis option renders a clean SVG' + (clean ? '' : ' (bad: ' + badMsg + ')'));

// 3. Recipes normalize + randomize stay in range
const rnd = window._avRandom();
const norm = window._avNormalize(rnd);
ok(AXES.every(ax => norm[ax.id] >= 0 && norm[ax.id] < ax.n), 'random recipe normalizes in range');
ok(window._avNormalize({ bg: 99, hair: -3 }).bg >= 0, 'out-of-range values fall back to defaults');

// 4. Distinct options produce distinct output (spot check per shape axis)
let distinct = true;
for (const ax of AXES.filter(a => a.kind === 'shape')) {
  const a = window._avSvg(window._avNormalize({ [ax.id]: 0 }), 96);
  const b = window._avSvg(window._avNormalize({ [ax.id]: 1 }), 96);
  const strip = s => s.replace(/avc\d+/g, 'avc');
  if (strip(a) === strip(b)) distinct = false;
}
ok(distinct, 'shape options produce visually distinct SVG');

// 5. Tabs + panes
window.avStudioTab('create');
ok(document.getElementById('avp-pane-create').style.display === '', 'create pane visible');
ok(document.getElementById('avm-rows').children.length === 13, 'create pane renders 13 axis rows');
ok(document.querySelectorAll('#avm-rows .avm-swatch').length > 0, 'color axes render swatches');
ok(document.querySelectorAll('#avm-rows .avm-mini').length > 0, 'shape axes render mini previews');
window.avStudioTab('import');
ok(!!document.getElementById('avi-drop'), 'import drop zone rendered');
window.avStudioReset();
ok(document.getElementById('avp-pane-gallery').style.display === '', 'reset returns to gallery');
document.body.classList.add('adv-no-avcreate');
window.avStudioTab('create');
ok(document.getElementById('avp-pane-gallery').style.display === '', 'adv-no-avcreate falls back to gallery');
document.body.classList.remove('adv-no-avcreate');

// 6. Recipe persistence
window.avStudioTab('create');
document.querySelectorAll('#avm-rows .avm-axis')[0].querySelectorAll('button')[2].click();
const persisted = JSON.parse(localStorage.getItem('pth_avatar_vec'));
ok(persisted && persisted.bg === 2, 'clicking an option persists the recipe (pth_avatar_vec)');

// 7. i18n: axis label keys present in every language file
const KEYS = ['avmBg','avmOutfit','avmSkin','avmMarks','avmHair','avmHairColor','avmBeard',
  'avmEyeShape','avmEyeColor','avmMouth','avmShoulder','avmEarrings','avmNone',
  'avTabGallery','avTabCreate','avTabImport','avmRandom','avmUse','avmGlasses',
  'avImportDrop','avImportOr','avImportBtn','avImportHint','advAvatarCreate'];
const langDir = path.join(PUB, 'modules/lang');
let langsOk = true;
for (const f of fs.readdirSync(langDir).filter(f => f.endsWith('.mjs'))) {
  const ls = fs.readFileSync(path.join(langDir, f), 'utf8');
  for (const k of KEYS) if (!ls.includes(k + ':')) { langsOk = false; console.log('    missing ' + k + ' in ' + f); }
}
ok(langsOk, 'all avatar keys present in all 36 language files');

console.log(fail === 0 ? 'ALL OK (' + pass + ')' : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
