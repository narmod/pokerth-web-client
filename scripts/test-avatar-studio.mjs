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
load('modules/ui/avatar-photo.mjs');
global.AV_SEX_SAMPLE = window._AV_SEX_SAMPLE; global.avSvg = window._avSvg; global.avSexIcon = window._avSexIcon;
load('modules/ui/avatar-capture.mjs');
// avatar-studio consumes the engines' window._-prefixed exports in the harness.
let studio = fs.readFileSync(path.join(PUB, 'modules/ui/avatar-studio.mjs'), 'utf8');
studio = studio.replace(/^import .*$/mg, '');
studio = 'const AV_AXES = window._AV_AXES, avSvg = window._avSvg, avSwatch = window._avSwatch, avNormalize = window._avNormalize, avRandom = window._avRandom, avVisible = window._avVisible, AV_DEFAULT = window._AV_DEFAULT, AV_CROP = window._AV_CROP, avPartSvg = window._avPartSvg, avPhotoRecipe = window._avPhotoRecipe, avCaptureOpen = window._avCaptureOpen, avSexIcon = window._avSexIcon;\n' + studio;
studio = studio.replace(/export \{[^}]*\};?/, '');
(0, eval)(studio.replace(/^'use strict';/m, ''));

// 1. APIs
ok(typeof window.avStudioTab === 'function', 'avStudioTab exposed');
ok(typeof window._avSvg === 'function', 'vector engine exposed');
const AXES = window._AV_AXES;
ok(Array.isArray(AXES) && AXES.length === 18, '18 axes defined, incl. the outfit colour (' + AXES.length + ')');
const axOutfit = AXES.find(a => a.id === 'outfit'), axHair = AXES.find(a => a.id === 'hair'), axOc = AXES.find(a => a.id === 'outfitc');
ok(axOutfit.n === 33 && axHair.n === 50, '2026-09-27 catalogue: 33 outfits, 50 hairstyles (' + axOutfit.n + '/' + axHair.n + ')');
const axHairc = AXES.find(a => a.id === 'hairc');
ok(axHairc && axHairc.n === 12 && window._avSwatch('hairc', 11) === '#e88ac2' && window._avSwatch('hairc', 8) === '#9c7b52', '12 hair colours (light brown, light red, blue, pink added)');
ok(window._avSvg({ sex: 0, hair: 1, hairc: 10, beard: 3 }).indexOf('#3b6fd6') !== -1 && window._avSvg({ sex: 0, hair: 1, hairc: 10, beard: 3 }).indexOf('stroke="#4a3222"') !== -1, 'blue hair keeps dark-brown brows and beard');
ok(axOc && axOc.kind === 'color' && axOc.none && axOc.n === 9, 'outfit colour axis: colour kind, option 0 = as drawn, 8 colours');
// the colour changes a colourable garment and leaves a fixed one alone
const stripIds = s => s.replace(/avc\d+/g, 'avc');
ok(stripIds(window._avSvg(window._avNormalize({ outfit: 17, outfitc: 1 }), 96)) !== stripIds(window._avSvg(window._avNormalize({ outfit: 17, outfitc: 2 }), 96)), 'outfit colour changes the plain tee');
ok(stripIds(window._avSvg(window._avNormalize({ outfit: 0, outfitc: 1 }), 96)) === stripIds(window._avSvg(window._avNormalize({ outfit: 0, outfitc: 2 }), 96)), 'outfit colour leaves the suit as drawn');
ok(window._avSwatch('outfitc', 1) === '#c0392b' && window._avSwatch('outfitc', 0) === '#888', 'outfit colour swatches');

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
ok(nosePart.indexOf('viewBox="80 94 40 40"') !== -1, 'nose vignette framed');
const mouthPart = window._avPartSvg('mouth', 0, window._avNormalize(null), 40);
ok(mouthPart.indexOf('viewBox="74 110 52 52"') !== -1 && mouthPart.indexOf('<ellipse cx="100" cy="94"') === -1, 'mouth vignette is framed and contains no head');

// 3. Recipes normalize + randomize stay in range
const rnd = window._avRandom();
const norm = window._avNormalize(rnd);
ok(AXES.every(ax => norm[ax.id] >= 0 && norm[ax.id] < ax.n), 'random recipe normalizes in range');
ok(window._avNormalize({ bg: 99, hair: -3 }).bg >= 0, 'out-of-range values fall back to defaults');

// 4. Distinct options produce distinct output (spot check per shape axis)
let distinct = true;
// 'shoulder' is retired with the toon style (kept for recipe compatibility).
for (const ax of AXES.filter(a => a.kind === 'shape' && a.id !== 'shoulder')) {
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
ok(vis('hair', 4, { sex: 0 }) && !vis('hair', 4, { sex: 1 }), 'curly is masculine-only');
// Strict parity (narmod 2026-09-27): every hairstyle and every outfit belongs
// to exactly one silhouette, and both sides keep a decent choice.
let oneSided = true, nM = { hair: 0, outfit: 0 }, nF = { hair: 0, outfit: 0 };
for (const axId of ['hair', 'outfit']) {
  const ax = AXES.find(a => a.id === axId);
  for (let i = 0; i < ax.n; i++) {
    const m = vis(axId, i, { sex: 0 }), f = vis(axId, i, { sex: 1 });
    if (m === f) oneSided = false;
    if (m) nM[axId]++; if (f) nF[axId]++;
  }
}
ok(oneSided, 'every hairstyle and outfit is visible for exactly one silhouette');
ok(nM.hair === 23 && nF.hair === 27 && nM.outfit === 17 && nF.outfit === 16, 'catalogue split: 23 / 27 hairstyles, 17 / 16 outfits (' + nM.hair + '/' + nF.hair + ', ' + nM.outfit + '/' + nF.outfit + ')');
ok(vis('outfit', 3, { sex: 1 }) && !vis('outfit', 3, { sex: 0 }) && vis('outfit', 7, { sex: 1 }) && vis('outfit', 16, { sex: 1 }), 'collared sweater, turtleneck and blazer + scarf are feminine');
ok(!vis('glasses', 3, { sex: 0 }) && !vis('ears', 1, { sex: 0 }) && !vis('hat', 4, { sex: 1 }) && vis('hat', 1, { sex: 1 }), 'cat-eye glasses and pearls hidden for men, bowler hidden for women, cap shared');
ok(!vis('beard', 2, { sex: 1 }) && vis('beard', 2, { sex: 0 }) && vis('beard', 0, { sex: 1 }), 'beard filtered on feminine silhouette (none stays valid)');
ok(!vis('hat', 1, { hair: 10 }) && !vis('hat', 2, { hair: 7 }) && !vis('hat', 1, { hair: 17 }) && !vis('hat', 1, { hair: 33 }) && !vis('hat', 1, { hair: 37 }) && !vis('hat', 1, { hair: 42 }) && vis('hat', 0, { hair: 10 }) && vis('hat', 1, { hair: 1 }), 'hats filtered out on afro/bun/mohawk/crown braid/high bun (none stays valid)');
ok(!vis('eyec', 1, { eyes: 2 }) && !vis('eyec', 1, { glasses: 5 }) && vis('eyec', 1, { eyes: 0, glasses: 1 }), 'eye color hidden behind closed eyes or sunglasses');
ok(vis('shoulder', 0, {}) && !vis('shoulder', 1, {}) && !vis('shoulder', 4, {}), 'shoulder accessories retired (only none stays valid)');
ok(vis('mouth', 3, { sex: 1 }) && !vis('mouth', 3, { sex: 0 }), 'lipstick mouth is feminine-only');
ok(!vis('mouth', 5, { sex: 0 }) && !vis('mouth', 7, { sex: 0 }) && vis('mouth', 10, { sex: 0 }) && !vis('mouth', 10, { sex: 1 }), 'pout and small o are feminine, the cigar is masculine');
ok([1, 2, 3, 4, 5].every(k => !vis('ears', k, { sex: 0 }) && vis('ears', k, { sex: 1 })) && vis('ears', 0, { sex: 0 }), 'every earring is feminine-only (none stays for men)');
ok(!vis('marks', 2, { sex: 0 }) && vis('marks', 6, { sex: 0 }) && !vis('marks', 6, { sex: 1 }), 'beauty mark is feminine, the cheek scar masculine');
ok(AXES.find(a => a.id === 'face').n === 5 && window._avSvg({ sex: 0, face: 4 }).indexOf('L124 150') !== -1 && window._avSvg({ sex: 1, face: 3 }).indexOf('Q51 132') !== -1 && window._avPartSvg('face', 3, { sex: 1 }, 60).indexOf('Q51 132') !== -1 && window._avSvg({ sex: 1, face: 4 }).indexOf('cx="53" cy="100"') !== -1, '5 face shapes per silhouette (rugged man, slim woman) with their own ear positions');
ok(window._avSvg({ sex: 0, face: 2 }).indexOf('L154 118') !== -1 && window._avSvg({ sex: 1, face: 2 }).indexOf('Q45 112') !== -1 && window._avPartSvg('face', 2, { sex: 1 }, 60).indexOf('Q45 112') !== -1, 'face shapes differ by silhouette: square jaw for men, heart for women (vignettes too)');
ok(window._avSvg({ sex: 0, face: 1 }).indexOf('scale(1.1132') !== -1 && window._avSvg({ sex: 1, face: 0 }).indexOf('cx="55" cy="100"') !== -1 && window._avSvg({ sex: 0, face: 1 }).indexOf('cx="47" cy="100"') !== -1, 'hair scales with the outline width (round man ×1.11) and the ears sit on the outline (narrow feminine oval → 55, wide round → 47)');
ok(window._avSvg({ sex: 0, mouth: 10 }).indexOf('#ff6a2a') !== -1 && window._avSvg({ sex: 0 }).indexOf('opacity=".1"') !== -1 && window._avSvg({ sex: 1 }).indexOf('opacity=".32"') !== -1, 'cigar ember drawn; blush faint on men, full on women');
ok(vis('outfit', 6, { sex: 1 }) && !vis('outfit', 6, { sex: 0 }), 'V-neck blouse is feminine-only');
const wholeAxisHidden = (ax, rr) => { for (let i = 0; i < ax.n; i++) if (vis(ax.id, i, rr)) return false; return true; };
let sexKept = true;
for (let k = 0; k < 10; k++) { if (window._avRandom(1).sex !== 1 || window._avRandom(0).sex !== 0) sexKept = false; }
ok(sexKept, 'avRandom(fixedSex) keeps the chosen silhouette (10 draws each)');
let bgWhite = true;
for (let k = 0; k < 10; k++) if (window._avRandom().bg !== 7) bgWhite = false;
ok(bgWhite, 'avRandom always lands on the white background (10 draws)');
// Dice-only silhouette rules: 200 draws per silhouette never pick an option
// that reads as the other one (no bald/mohawk woman, no cat-eye man...).
let diceSex = true;
const MASC_ONLY = { hair: [0, 1, 13, 17], outfit: [1, 2, 4] }, FEM_ONLY = { glasses: [3], ears: [1] };
for (let k = 0; k < 200; k++) {
  const f = window._avRandom(1), m = window._avRandom(0);
  for (const ax in MASC_ONLY) if (MASC_ONLY[ax].includes(f[ax])) diceSex = false;
  for (const ax in FEM_ONLY) if (FEM_ONLY[ax].includes(m[ax])) diceSex = false;
  if (f.beard !== 0 || f.shoulder !== 0 || m.shoulder !== 0) diceSex = false;
  if (f.hat && f.hair === 3) diceSex = false;
  // (eye color is a whole hidden axis behind closed eyes / sunglasses)
  const coherent = rr => AXES.every(ax => ax.id === 'eyec' || vis(ax.id, rr[ax.id], rr));
  if (!coherent(f) || !coherent(m)) diceSex = false;
}
ok(diceSex, 'dice keeps silhouette-coherent options (200 draws each)');
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
ok(document.querySelectorAll('#avm-rows .avm-sex-opt svg').length === 2, 'silhouette chips carry SVG icons instead of glyphs');
const next = document.getElementById('avm-step-next'), prev = document.getElementById('avm-step-prev');
next.click(); next.click();
ok(document.getElementById('avm-rows').children.length === 3, 'stepping to Hair (3/5) renders 3 rows');
next.click(); next.click();
ok(document.getElementById('avm-rows').children.length === 2, 'Extras (5/5) renders 2 rows on the masculine silhouette (glasses, hat; earrings are feminine, shoulder accessory retired)');
next.click();
ok(document.getElementById('avm-step-label').textContent.indexOf('1/5') !== -1, 'next wraps around to 1/5');
next.click();
ok(document.querySelectorAll('#avm-rows .avm-swatch').length > 0, 'color axes render swatches (Face group)');
prev.click();
ok(document.querySelectorAll('#avm-rows .avm-mini').length > 0, 'shape axes render mini previews');
ok(!!document.getElementById('avm-photo') && !!document.getElementById('avm-photo-input'), 'From-a-photo (beta) button and hidden file input rendered');
ok(document.querySelector('#avm-photo sup.avm-beta').textContent === 'avmBeta', 'beta badge uses the i18n key');
// 5b. Framing panel: opens on the button (camera mode, no camera in jsdom →
// photo mode), shows the template, closes on cancel.
document.getElementById('avm-photo').click();
const cam = document.getElementById('avm-cam');
ok(!!cam && !!cam.querySelector('.avm-cam-guide svg ellipse'), 'framing panel opens with the face template');

const G = window._AV_GUIDE;
ok(G && G.cx === 0.5 && G.rx > 0 && G.ry > G.rx && G.cy + G.ry < 0.8, 'template oval sits in the upper part of the square with room for shoulders');
const sexCards = cam.querySelectorAll('.avm-cam-sexcard');
ok(cam.classList.contains('is-choosing') && sexCards.length === 2 && sexCards[0].classList.contains('selected') && !!sexCards[1].querySelector('svg'), 'framing panel opens on the silhouette step: two big cards with portraits, preset to the current one (masculine)');
ok(document.getElementById('avm-cam-title').textContent === 'Silhouette', 'silhouette step title (fallback)');
sexCards[1].click();
ok(!cam.classList.contains('is-choosing') && sexCards[1].classList.contains('selected') && document.getElementById('avm-cam-sexbtn').textContent.indexOf('Woman') !== -1, 'tapping a card picks the silhouette and moves on to the framing step');
document.getElementById('avm-cam-sexbtn').click();
ok(cam.classList.contains('is-choosing'), 'the silhouette button reopens the choice');
sexCards[0].click();
ok(document.getElementById('avm-cam-title').textContent === 'Frame your face', 'framing step title falls back to English when the key is untranslated (harness t() echoes keys)');
document.getElementById('avm-cam-cancel').click();
ok(!document.getElementById('avm-cam'), 'cancel closes the framing panel');
window.avStudioTab('import');
ok(!!document.getElementById('avi-drop'), 'import drop zone rendered');

// 6. Photo analysis (headless, synthetic ImageData): a light-skinned face
// with dark hair, two dark eyes and a red mouth on a white background.
function synthFace(opts) {
  const W = 160, H = 200, data = new Uint8ClampedArray(W * H * 4);
  const put = (x, y, r, g, b) => { const i = (y * W + x) * 4; data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    put(x, y, 245, 245, 245);
    const ex = (x - 80) / 46, ey = (y - 100) / (opts.hair ? 58 : 72); // a bald crown climbs higher
    if (ex * ex + ey * ey <= 1) put(x, y, 232, 190, 160);            // skin oval
    const hc = opts.blonde ? [205, 170, 115] : [60, 40, 30];
    if (opts.hair && ex * ex + ey * ey <= (opts.thick ? 2.2 : 1.35) && y < 62) put(x, y, hc[0], hc[1], hc[2]); // hair cap (thick: fills the band above the hairline, as a framed photo does)
    if (opts.sides && y >= 60 && y <= 140 && (x < 36 || x > 124) && x >= 12 && x <= 148) put(x, y, hc[0], hc[1], hc[2]); // hair down the sides
  }
  for (const cx of [62, 98]) for (let y = 88; y <= 96; y++) for (let x = cx - 7; x <= cx + 7; x++) put(x, y, 255, 255, 255); // sclera
  for (const cx of [62, 98]) for (let y = 89; y <= 95; y++) for (let x = cx - 3; x <= cx + 3; x++) put(x, y, 20, 15, 10);   // pupils
  for (let y = 134; y <= 140; y++) for (let x = 64; x <= 96; x++) put(x, y, 200, 70, 70);                                  // lips
  return { width: W, height: H, data };
}
const resHair = window._avPhotoAnalyze(synthFace({ hair: true }), { sex: 0 });
ok(!!resHair && !!resHair.recipe, 'photo analysis finds the synthetic face');
if (resHair) {
  ok(resHair.debug.eyesOk, 'both pupils found (box rebuilt from the eyes)');
  ok(resHair.recipe.skin <= 2, 'light skin tone mapped to a light palette entry (' + resHair.recipe.skin + ')');
  ok(resHair.recipe.hair !== 0 && resHair.recipe.hairc <= 1, 'dark hair cap → not bald, dark hair colour (' + resHair.recipe.hair + '/' + resHair.recipe.hairc + ')');
  ok(resHair.recipe.eyes === 0 || resHair.recipe.eyes === 1, 'open eyes (' + resHair.recipe.eyes + ')');
  ok(resHair.recipe.beard === 0 && resHair.recipe.glasses === 0 && resHair.recipe.hat === 0, 'no beard, glasses or hat on the plain face');
  ok(AXES.every(ax => !(ax.id in resHair.recipe) || (resHair.recipe[ax.id] >= 0 && resHair.recipe[ax.id] < ax.n)), 'every estimated axis is in range');
}
const resBald = window._avPhotoAnalyze(synthFace({ hair: false }), { sex: 0 });
ok(!!resBald && resBald.recipe.hair === 0, 'no hair cap → bald');
// guided: the synthetic face oval (cx 80/160, cy 100/200, rx 46, ry 58) as template
const resGuided = window._avPhotoAnalyze(synthFace({ hair: true }), { sex: 0, guide: { cx: 0.5, cy: 0.5, rx: 46 / 160, ry: 58 / 200 } });
ok(!!resGuided && resGuided.debug.guided && resGuided.recipe.skin <= 2 && resGuided.recipe.hair !== 0, 'guided analysis uses the template and finds the same face');
ok(!!resGuided && resGuided.recipe.face === 0 && !('nose' in resGuided.recipe), 'guided: a face as wide as the oval is oval; no nose shadow → the nose is left alone (' + (resGuided && resGuided.recipe.face) + ')');
// a wider synthetic face (rx 56 on the same template) reads round
const wideFace = synthFace({ hair: true, thick: true }); (function () { const W = 160; for (let y = 0; y < 200; y++) for (let x = 0; x < W; x++) { const ex = (x - 80) / 56, ey = (y - 100) / 58; if (ex * ex + ey * ey <= 1 && y >= 62) { const i = (y * W + x) * 4; wideFace.data[i] = 232; wideFace.data[i + 1] = 190; wideFace.data[i + 2] = 160; } } })();
const resWide = window._avPhotoAnalyze(wideFace, { sex: 0, guide: { cx: 0.5, cy: 0.5, rx: 46 / 160, ry: 58 / 200 }, guessSex: false });
ok(!!resWide && resWide.recipe.face === 1, 'guided: a face wider than the oval is round (' + (resWide && resWide.recipe.face) + ')');
ok(window._avPhotoAnalyze(synthFace({ hair: true }), { sex: 0, guide: { cx: 0.1, cy: 0.9, rx: 0.05, ry: 0.05 } }) === null, 'guided analysis with nobody in the oval → no face');
// guided hair (2.1.9-web.189): the band above the oval top is read as the
// hair — a bald crown (skin keeps going up), blonde hair (close to the skin
// in lightness, not in chroma), a fringe inside the oval top, and a photo
// that stops above the hairline (guide.valid) which says nothing.
const GS = { cx: 0.5, cy: 0.5, rx: 46 / 160, ry: 58 / 200 };
const gBald = window._avPhotoAnalyze(synthFace({ hair: false }), { sex: 0, guide: GS });
ok(!!gBald && gBald.recipe.hair === 0, 'guided: skin above the hairline → bald (' + (gBald && gBald.recipe.hair) + ')');
const gBlonde = window._avPhotoAnalyze(synthFace({ hair: true, blonde: true, thick: true }), { sex: 1, guide: GS, guessSex: false });
ok(!!gBlonde && gBlonde.recipe.hair !== 36 && [4, 6, 8].indexOf(gBlonde.recipe.hairc) !== -1, 'guided: light hair on light skin → not bald, a blonde/light-brown colour (' + (gBlonde && gBlonde.recipe.hair) + '/' + (gBlonde && gBlonde.recipe.hairc) + ')');
const gFringe = window._avPhotoAnalyze(synthFace({ hair: true, sides: true, thick: true }), { sex: 0, guide: GS, guessSex: false });
ok(!!gFringe && gFringe.recipe.hair === 31, 'guided: hair over the forehead and down the sides → curtain fringe, mid length (' + (gFringe && gFringe.recipe.hair) + ')');
const gFringeF = window._avPhotoAnalyze(synthFace({ hair: true, sides: true, thick: true }), { sex: 1, guide: GS, guessSex: false });
ok(!!gFringeF && gFringeF.recipe.hair === 34, 'guided, feminine: the same photo → straight fringe (' + (gFringeF && gFringeF.recipe.hair) + ')');
const gCut = window._avPhotoAnalyze(synthFace({ hair: false }), { sex: 0, guide: Object.assign({ valid: [0, 0.3, 1, 1] }, GS) });
ok(!!gCut && gCut.recipe.hair !== 0, 'guided: photo cut above the hairline → the default hair stays, never bald (' + (gCut && gCut.recipe.hair) + ')');
// silhouette guess: the plain synthetic face has no cue → no `sex` in the recipe;
// a dark hair-coloured band under the chin (beard) → masculine even when analysed as feminine
const noCue = window._avPhotoAnalyze(synthFace({ hair: true }), { sex: 1 });
ok(!!noCue && !('sex' in noCue.recipe) && noCue.recipe.beard === 0, 'no clear cue → the chosen silhouette stands (no sex in the recipe)');
const bearded = synthFace({ hair: true });
for (let y = 142; y <= 162; y++) for (let x = 44; x <= 116; x++) { const ex = (x - 80) / 46, ey = (y - 100) / 58; if (ex * ex + ey * ey <= 1) { const i = (y * 160 + x) * 4; bearded.data[i] = 40; bearded.data[i + 1] = 35; bearded.data[i + 2] = 32; } }
const withBeard = window._avPhotoAnalyze(bearded, { sex: 1 });
ok(!!withBeard && withBeard.recipe.sex === 0 && withBeard.recipe.beard >= 3, 'a beard → masculine silhouette guessed with the beard (' + (withBeard && withBeard.recipe.sex) + '/' + (withBeard && withBeard.recipe.beard) + ')');
const noGuess = window._avPhotoAnalyze(bearded, { sex: 1, guessSex: false });
ok(!!noGuess && !('sex' in noGuess.recipe) && noGuess.recipe.beard === 0, 'guessSex:false keeps the feminine silhouette (and no beard on it)');
const blank = { width: 64, height: 64, data: new Uint8ClampedArray(64 * 64 * 4).fill(255) };
ok(window._avPhotoAnalyze(blank, { sex: 0 }) === null, 'blank image → no face');
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
