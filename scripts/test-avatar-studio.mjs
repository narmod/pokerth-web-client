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
  'const AV_AXES = window._AV_AXES, avSvg = window._avSvg, avSwatch = window._avSwatch, avNormalize = window._avNormalize, avRandom = window._avRandom, avVisible = window._avVisible, AV_DEFAULT = window._AV_DEFAULT, AV_CROP = window._AV_CROP;');
studio = studio.replace(/export \{[^}]*\};?/, '');
(0, eval)(studio.replace(/^'use strict';/m, ''));

// 1. APIs
ok(typeof window.avStudioTab === 'function', 'avStudioTab exposed');
ok(typeof window._avSvg === 'function', 'vector engine exposed');
const AXES = window._AV_AXES;
ok(Array.isArray(AXES) && AXES.length === 17, '17 axes defined (' + AXES.length + ')');

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

// 2b. Isolated-part vignettes: every option of every framed axis renders
// a clean standalone SVG containing only that layer over the felt rect.
const CROP = window._AV_CROP;
ok(CROP && Object.keys(CROP).length >= 10, 'AV_CROP defines part frames');
ok(Object.values(CROP).every(c => c.length === 3 && c[0] >= 0 && c[1] >= 0 && c[0] + c[2] <= 200 && c[1] + c[2] <= 200), 'every part frame fits the 200x200 canvas');
let partsClean = true, badPart = '';
for (const ax of AXES.filter(a => a.kind === 'shape' && a.id !== 'sex')) {
  for (let i = 0; i < ax.n; i++) {
    const svg = window._avPartSvg(ax.id, i, window._avNormalize(null), 40);
    if (!svg.startsWith('<svg') || !svg.endsWith('</svg>') || svg.includes('undefined') || svg.includes('NaN')) { partsClean = false; badPart = ax.id + '#' + i; }
  }
}
ok(partsClean, 'every part vignette renders clean' + (partsClean ? '' : ' (bad: ' + badPart + ')'));
const nosePart = window._avPartSvg('nose', 3, window._avNormalize(null), 40);
ok(nosePart.indexOf('viewBox="82 76 36 36"') !== -1, 'nose vignette framed');
const mouthPart = window._avPartSvg('mouth', 0, window._avNormalize(null), 40);
ok(mouthPart.indexOf('viewBox="76 90 48 48"') !== -1 && mouthPart.indexOf('<ellipse cx="100" cy="84"') === -1, 'mouth vignette is framed and contains no head');

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

// 4b. Silhouette filtering
const vis = window._avVisible;
ok(typeof vis === 'function', 'avVisible exposed');
ok(vis('hair', 3, { sex: 1 }) && !vis('hair', 3, { sex: 0 }), 'ponytail is feminine-only');
ok(vis('hair', 2, { sex: 0 }) && !vis('hair', 2, { sex: 1 }), 'slicked-back is masculine-only');
ok(vis('hair', 4, { sex: 0 }) && vis('hair', 4, { sex: 1 }), 'curly is universal');
ok(!vis('beard', 2, { sex: 1 }) && vis('beard', 2, { sex: 0 }) && vis('beard', 0, { sex: 1 }), 'beard filtered on feminine silhouette (none stays valid)');
ok(!vis('hat', 1, { hair: 10 }) && !vis('hat', 2, { hair: 7 }) && vis('hat', 0, { hair: 10 }) && vis('hat', 1, { hair: 1 }), 'hats filtered out on afro/bun (none stays valid)');
ok(!vis('eyec', 1, { eyes: 2 }) && !vis('eyec', 1, { glasses: 5 }) && vis('eyec', 1, { eyes: 0, glasses: 1 }), 'eye color hidden behind closed eyes or sunglasses');
ok(vis('mouth', 3, { sex: 1 }) && !vis('mouth', 3, { sex: 0 }), 'lipstick mouth is feminine-only');
ok(vis('outfit', 6, { sex: 1 }) && !vis('outfit', 6, { sex: 0 }), 'V-neck blouse is feminine-only');
const wholeAxisHidden = (ax, rr) => { for (let i = 0; i < ax.n; i++) if (vis(ax.id, i, rr)) return false; return true; };
let sexKept = true;
for (let k = 0; k < 10; k++) { if (window._avRandom(1).sex !== 1 || window._avRandom(0).sex !== 0) sexKept = false; }
ok(sexKept, 'avRandom(fixedSex) keeps the chosen silhouette (10 draws each)');
let bgWhite = true;
for (let k = 0; k < 10; k++) if (window._avRandom().bg !== 7) bgWhite = false;
ok(bgWhite, 'avRandom always lands on the white background (10 draws)');
for (let k = 0; k < 20; k++) {
  const rr = window._avRandom();
  if (!AXES.every(ax => vis(ax.id, rr[ax.id], rr) || wholeAxisHidden(ax, rr))) { ok(false, 'random recipe respects the coherence filter'); break; }
  if (k === 19) ok(true, 'random recipe respects the coherence filter (20 draws)');
}

// 5. Tabs + panes
window.avStudioTab('create');
ok(document.getElementById('avp-pane-create').style.display === '', 'create pane visible');
ok(!!document.getElementById('avm-step-label') && document.getElementById('avm-step-label').textContent.indexOf('1/5') !== -1, 'step header shows category 1/5');
ok(document.getElementById('avm-rows').children.length === 2, 'active group (Silhouette) renders its 2 axis rows');
const next = document.getElementById('avm-step-next'), prev = document.getElementById('avm-step-prev');
next.click(); next.click();
ok(document.getElementById('avm-rows').children.length === 3, 'stepping to Hair (3/5) renders 3 rows');
next.click(); next.click();
ok(document.getElementById('avm-rows').children.length === 4, 'Extras (5/5) renders 4 rows (incl. hat)');
next.click();
ok(document.getElementById('avm-step-label').textContent.indexOf('1/5') !== -1, 'next wraps around to 1/5');
next.click();
ok(document.querySelectorAll('#avm-rows .avm-swatch').length > 0, 'color axes render swatches (Face group)');
prev.click();
ok(document.querySelectorAll('#avm-rows .avm-mini').length > 0, 'shape axes render mini previews');
window.avStudioTab('import');
ok(!!document.getElementById('avi-drop'), 'import drop zone rendered');
window.avStudioReset();
ok(document.getElementById('avp-pane-gallery').style.display === '', 'reset returns to gallery');
document.body.classList.add('adv-no-avcreate');
window.avStudioTab('create');
ok(document.getElementById('avp-pane-gallery').style.display === '', 'adv-no-avcreate falls back to gallery');
document.body.classList.remove('adv-no-avcreate');

// 5b. Feminine silhouette hides the facial-hair row in the Hair group
document.querySelectorAll('#avm-rows .avm-axis')[0].querySelectorAll('button')[1].click(); // sex -> F
ok(document.querySelectorAll('#avm-rows .avm-sex-opt').length === 2, 'sex axis renders 2 pictogram chips');
next.click(); next.click();
ok(document.getElementById('avm-rows').children.length === 2, 'feminine silhouette: Hair step shows 2 rows (no facial hair)');
prev.click(); prev.click();
document.querySelectorAll('#avm-rows .avm-axis')[0].querySelectorAll('button')[0].click(); // sex -> M
next.click(); next.click();
ok(document.getElementById('avm-rows').children.length === 3, 'masculine silhouette: Hair step shows 3 rows again');
prev.click(); prev.click();

// 5c. Reset button restores the default recipe
ok(!!document.getElementById('avm-reset'), 'reset button rendered');
document.querySelectorAll('#avm-rows .avm-axis')[0].querySelectorAll('button')[1].click(); // sex -> F
document.getElementById('avm-reset').click();
const afterReset = JSON.parse(localStorage.getItem('pth_avatar_vec'));
ok(afterReset.sex === 0 && afterReset.hair === 1 && afterReset.glasses === 0, 'reset restores AV_DEFAULT');

// 6. Recipe persistence
window.avStudioTab('create');
document.querySelectorAll('#avm-rows .avm-axis')[0].querySelectorAll('button')[1].click();
const persisted = JSON.parse(localStorage.getItem('pth_avatar_vec'));
ok(persisted && persisted.sex === 1, 'clicking an option persists the recipe (pth_avatar_vec)');

// 7. i18n: axis label keys present in every language file
const KEYS = ['avmSex','avmFace','avmHat','avmGrpBody','avmGrpFace','avmGrpHair','avmGrpStyle','avmGrpExtra',
  'avmNose','avmBg','avmOutfit','avmSkin','avmMarks','avmHair','avmHairColor','avmBeard',
  'avmEyeShape','avmEyeColor','avmMouth','avmShoulder','avmEarrings','avmNone',
  'avTabGallery','avTabCreate','avTabImport','avmRandom','avmReset','avmUse','avmGlasses',
  'avImportDrop','avImportOr','avImportBtn','avImportHint','advAvatarCreate'];
const langDir = path.join(PUB, 'modules/lang');
let langsOk = true;
for (const f of fs.readdirSync(langDir).filter(f => f.endsWith('.mjs'))) {
  const ls = fs.readFileSync(path.join(langDir, f), 'utf8');
  for (const k of KEYS) if (!ls.includes(k + ':')) { langsOk = false; console.log('    missing ' + k + ' in ' + f); }
}
ok(langsOk, 'all avatar keys present in all 45 language files');

console.log(fail === 0 ? 'ALL OK (' + pass + ')' : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
