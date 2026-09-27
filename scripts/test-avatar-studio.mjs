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
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
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

// Load the modules in dependency order, stripping ESM import/export.
function load(p) {
  let src = fs.readFileSync(path.join(PUB, p), 'utf8');
  // ESM → one global scope: drop imports, unwrap exports (the parts files
  // export their lists, the engine its API)
  src = src.replace(/^import .*$/mg, '').replace(/^export \{[^}]*\};?$/mg, '').replace(/^export (const|var|let|function) /mg, '$1 ').replace(/^(const|let) /mg, 'var ');
  (0, eval)(src.replace(/^'use strict';/m, ''));
}
['helpers', 'faces', 'colors', 'hair', 'outfits', 'face-parts', 'extras', 'expressions', 'presets', 'legacy', 'index'].forEach(f => load('modules/ui/avatar-parts/' + f + '.mjs'));
load('modules/ui/avatar-vector.mjs');
load('modules/ui/avatar-photo.mjs');
global.AV_SEX_SAMPLE = window._AV_SEX_SAMPLE; global.avSvg = window._avSvg; global.avSexIcon = window._avSexIcon;
load('modules/ui/avatar-capture.mjs');
// avatar-studio consumes the engines' window._-prefixed exports in the harness.
let studio = fs.readFileSync(path.join(PUB, 'modules/ui/avatar-studio.mjs'), 'utf8');
studio = studio.replace(/^import .*$/mg, '');
studio = 'const AV_AXES = window._AV_AXES, AV_PRESETS = window._AV_PRESETS, avLocked = window._avLocked, avPresetLocked = window._avPresetLocked, avSvg = window._avSvg, avSwatch = window._avSwatch, avNormalize = window._avNormalize, avRandom = window._avRandom, avVisible = window._avVisible, avSanitize = window._avSanitize, AV_DEFAULT = window._AV_DEFAULT, AV_CROP = window._AV_CROP, avPartSvg = window._avPartSvg, avPhotoRecipe = window._avPhotoRecipe, avCaptureOpen = window._avCaptureOpen, avSexIcon = window._avSexIcon;\n' + studio;
studio = studio.replace(/export \{[^}]*\};?/, '');
(0, eval)(studio.replace(/^'use strict';/m, ''));

const svg = window._avSvg, part = window._avPartSvg, vis = window._avVisible, norm = window._avNormalize;
const ax = id => AXES.find(a => a.id === id);
const n = id => ax(id).opts.length;
const strip = s => s.replace(/avc\d+/g, 'avc');

// 1. APIs and the declarative catalogue (2.1.9-web.209)
ok(typeof window.avStudioTab === 'function', 'avStudioTab exposed');
ok(typeof svg === 'function' && typeof window._avPart === 'function' && typeof window._avSanitize === 'function', 'vector engine exposed (avSvg, avPart, avSanitize)');
const AXES = window._AV_AXES;
ok(Array.isArray(AXES) && AXES.length === 21, '21 axes defined, incl. the outfit colour, the eyebrows, the expression and the badge (' + AXES.length + ')');
// every axis: unique string ids (sex is numeric), a default that exists, a draw on every shape part
let catOk = true, catMsg = '';
for (const a of AXES) {
  const ids = a.opts.map(p => p.id);
  if (new Set(ids).size !== ids.length) { catOk = false; catMsg += a.id + ':dup '; }
  if (a.id !== 'sex' && ids.some(i => typeof i !== 'string' || !i)) { catOk = false; catMsg += a.id + ':id '; }
  if (!a.opts.some(p => p.id === a.def)) { catOk = false; catMsg += a.id + ':def '; }
  if (a.kind === 'shape' && a.id !== 'sex' && a.id !== 'face' && a.id !== 'expression' && a.opts.some(p => typeof p.draw !== 'function')) { catOk = false; catMsg += a.id + ':draw '; }
  if (a.kind === 'color' && a.opts.some(p => !Array.isArray(p.colors))) { catOk = false; catMsg += a.id + ':colors '; }
}
ok(catOk, 'catalogue: unique stable ids, existing defaults, drawable parts, colour swatches' + (catOk ? '' : ' (' + catMsg + ')'));
ok(n('hair') === 52 && n('outfit') === 59 && n('hat') === 22 && n('bg') === 15 && n('skin') === 7 && n('hairc') === 12 && n('eyec') === 6 && n('outfitc') === 9 && n('marks') === 11 && n('beard') === 7 && n('nose') === 6 && n('glasses') === 9 && n('ears') === 8 && n('badge') === 6 && n('shoulder') === 1,
  'catalogue counts: 52 hairstyles, 59 outfits, 22 hats, 15 backdrops, 7 skins, 12 hair colours, 6 eye colours, 9 outfit colours, 11 marks, 7 beards, 6 noses, 9 glasses, 8 piercings, 6 badges, shoulder retired');
ok(n('eyes') === 14 && n('brows') === 8 && n('mouth') === 17 && n('expression') === 15, 'expressions: 14 eyes (+ shut, hearts, stars, x), 8 brows (+ raised, sad, worried), 16 mouths (+ wavy), 15 expressions (+ proud, bored, playful)');
const axBadge = ax('badge'), axBrows = ax('brows'), axOc = ax('outfitc');
ok(axBadge.none && AXES[AXES.length - 1] === axBadge && AXES.indexOf(axBrows) === AXES.findIndex(a => a.id === 'eyec') + 1 && AXES.indexOf(ax('expression')) === AXES.findIndex(a => a.id === 'mouth') + 1, 'axis order: brows after the eye colour, expression after the mouth, badge last');
ok(axOc.kind === 'color' && axOc.none && axOc.opts[0].id === 'auto', 'outfit colour axis: colour kind, option « auto » = as drawn');

// 1b. Recipes v3 (ids) and the migration of v1 / v2 (numeric) recipes
ok(norm(null).v === 3 && norm(null).sex === 0 && norm(null).face === 'm-oval' && norm(null).hair === 'short' && norm(null).skin === 'light' && norm(null).expression === 'neutral', 'default recipe: v3, masculine oval, short dark-brown hair, light skin, neutral expression');
ok(norm({ v: 2, sex: 0, hair: 43, hat: 15, outfit: 42, skin: 6, bg: 13, marks: 9, eyes: 9, mouth: 14, glasses: 8, ears: 7, badge: 5, brows: 4 }).hair === 'long-straight-m'
  && norm({ v: 2, hat: 15 }).hat === 'crown' && norm({ v: 2, outfit: 42 }).outfit === 'biker-vest-f' && norm({ v: 2, skin: 6 }).skin === 'deep' && norm({ v: 2, bg: 13 }).bg === 'card-back'
  && norm({ v: 2, marks: 9 }).marks === 'tattoo-temple' && norm({ v: 2, eyes: 9 }).eyes === 'side-glance' && norm({ v: 2, mouth: 14 }).mouth === 'gold-tooth' && norm({ v: 2, glasses: 8 }).glasses === 'aviators'
  && norm({ v: 2, ears: 7 }).ears === 'brow-ring' && norm({ v: 2, badge: 5 }).badge === 'stack' && norm({ v: 2, brows: 4 }).brows === 'thin-arched', 'v2 recipes (numeric) migrate to the ids of the frozen v2 order');
ok(norm({ skin: 9 }).skin === 'deep' && norm({ skin: 6 }).skin === 'porcelain' && norm({ skin: 0 }).skin === 'light' && norm({ v: 2, skin: 6 }).skin === 'deep', 'v1 recipes (no v): the ten-tone skin palette is remapped first (9 → deep, porcelain 6 → porcelain, very light 0 → light)');
ok(norm({ v: 2, sex: 1, face: 2 }).face === 'f-heart' && norm({ v: 2, sex: 0, face: 2 }).face === 'm-square' && norm({ sex: 1 }).face === 'f-oval' && norm({ v: 3, sex: 1, face: 'm-square' }).face === 'm-square', 'face slots migrate per silhouette; the default face follows the silhouette; a v3 face id is kept as saved');
ok(norm({ skin: 'deep', hair: 'lob' }).skin === 'deep' && norm({ skin: 'deep', hair: 'lob' }).hair === 'lob' && norm({ v: 3, hair: 'no-such-style', bg: 'nope' }).hair === 'short' && norm({ v: 3, hair: 'no-such-style' }).bg === 'green' && norm({ bg: 99, hair: -3 }).bg === 'green', 'unknown ids and out-of-range indices fall back to the defaults');
ok(norm({ v: 2, shoulder: 3 }).shoulder === 'none' && vis('shoulder', 'none', {}) && !vis('shoulder', 'x', {}), 'shoulder accessories retired (only none stays valid)');
ok(window._avRandom(0).v === 3 && typeof window._avRandom(0).hair === 'string', 'the dice produces v3 recipes');

// 1c. Spot checks of the drawings (unchanged output, verified byte for byte against the previous engine on 1642 portraits at the refactor)
ok(svg({ bg: 'card-back' }).indexOf('<rect x="14" y="14" width="172" height="172" rx="6" fill="#b32236"/>') !== -1 && svg({ bg: 'felt-green' }).indexOf('<ellipse cx="176" cy="182"') !== -1 && svg({ bg: 'neon' }).indexOf('stroke="#ff9cf0"') !== -1 && svg({ bg: 'green' }).indexOf('<ellipse cx="176"') === -1, 'patterned backdrops: chip stack on the green felt, card back, neon lines; plain felts unchanged');
ok(window._avSwatch('bg', 'card-back').indexOf('repeating-linear-gradient') === 0 && window._avSwatch('bg', 'white') === '#ffffff' && window._avSwatch('skin', 'porcelain') === '#fff0e3' && window._avSwatch('skin', 'deep') === '#75482a' && window._avSwatch('hairc', 'pink') === '#e88ac2' && window._avSwatch('outfitc', 'red') === '#c0392b' && window._avSwatch('outfitc', 'auto') === '#888', 'swatches: CSS gradient for a patterned backdrop, plain colours otherwise, auto outfit colour grey');
ok(svg({ badge: 'dealer' }).indexOf('<circle cx="30" cy="172" r="14" fill="#f4f0e6"') !== -1 && svg({ badge: 'aces' }).indexOf('rotate(-12 30 172)') !== -1 && svg({ badge: 'dice' }).split('<rect').length === svg({ badge: 'none' }).split('<rect').length + 2 && part('badge', 'stack', { sex: 0 }, 40).indexOf('viewBox="6 148 48 48"') !== -1, 'badge tokens: dealer button, pair of aces, two dice, chip stack vignette');
ok(svg({ sex: 0, eyes: 'scarred' }).indexOf('M70 98 L86 98') !== -1 && svg({ sex: 1, eyes: 'scarred' }).indexOf('M69 93 L64 89') === -1 && svg({ sex: 1, eyes: 'scarred' }).indexOf('M131 93 L136 89') !== -1 && svg({ eyes: 'bloodshot' }).indexOf('fill="#f3d4d4"') !== -1 && svg({ eyes: 'side-glance' }).indexOf('<circle cx="81.5" cy="99"') !== -1 && svg({ sex: 1, eyes: 'closed' }).indexOf('M69 93 L64 89') === -1, 'scarred eye (lashes only on the open eye), bloodshot sclera, side glance shifts the irises, no lashes on closed eyes');
ok(svg({ mouth: 'toothpick' }).indexOf('M106 132.5 L128 126') !== -1 && svg({ mouth: 'gold-tooth' }).indexOf('fill="#e0b23c"') !== -1 && svg({ ears: 'brow-ring' }).indexOf('<circle cx="128" cy="79.5" r="3.4"') !== -1 && svg({ face: 'm-oval', ears: 'skull-studs' }).indexOf('<circle cx="50" cy="111" r="3.8" fill="#f2eee6"/>') !== -1, 'toothpick, gold tooth, brow ring, skull studs on the outline');
ok(svg({ brows: 'angry' }).indexOf('M68 75 Q80 77 90 84') !== -1 && svg({}).indexOf('M68 80 Q78 74 88 79 M112 79 Q122 74 132 80') !== -1 && part('brows', 'thick', { sex: 0 }, 60).indexOf('stroke-width="7.2"') !== -1 && part('brows', 'thick', { sex: 1 }, 60).indexOf('stroke-width="5.5"') !== -1, 'brows: neutral = the former fixed brows, angry V, thick brows heavier on men (vignettes too)');
ok(svg({ glasses: 'eye-patch' }).indexOf('M108 88 Q122 83 136 89') !== -1 && svg({ glasses: 'monocle' }).indexOf('stroke-dasharray="2 1.6"') !== -1 && svg({ mouth: 'sneer' }).indexOf('M107 130 L111 137 L113 129z') !== -1 && svg({ mouth: 'gritted' }).indexOf('<rect x="87" y="130" width="26" height="8"') !== -1, 'eye patch, monocle chain, sneer canine and gritted teeth are drawn');
ok(svg({ sex: 0, face: 'm-oval', marks: 'tattoo-temple' }).indexOf('M141 66 Q153 78 143 92') !== -1 && svg({ sex: 1, face: 'f-slim', marks: 'tattoo-temple' }).indexOf('M135 66 Q147 78 137 92') !== -1 && svg({ marks: 'black-eye' }).indexOf('fill="#6a3d8f"') !== -1, 'temple tattoo follows the outline width (oval man x 141, slim woman x 135), black eye is a purple bruise');
ok(svg({ sex: 0, face: 'm-round', hat: 'hood', hair: 'short' }).indexOf('data-fit="1"><path d="M18 200') !== -1 && svg({ hat: 'hood' }).indexOf('fill-rule="evenodd"') !== -1 && svg({ hat: 'hood' }).indexOf('" fill="#1c1e23"/>') !== -1, 'the hood is built on the face outline (opening + dark inside behind the head), not warped');
ok(!svg({ hat: 'hood', hair: 'short' }).match(/clip-path="url\(#[a-z0-9]+h[ls]\)"/) && !!svg({ hat: 'cap', hair: 'short' }).match(/clip-path="url\(#[a-z0-9]+hs\)"/) && !!svg({ hat: 'cap', hair: 'long-middle' }).match(/clip-path="url\(#[a-z0-9]+hl\)"/), 'the hood leaves the hair unclipped, a cap clips a short style to a band and a long one at the hat line');
ok(svg({ outfit: 'dealer-vest' }).indexOf('M60 166 L84 158 L100 190') !== -1 && svg({ outfit: 'tee-royal-flush' }).split('<rect').length === svg({ outfit: 'tee' }).split('<rect').length + 5 && svg({ outfit: 'pinstripe' }).indexOf('<line x1="40" y1="150"') !== -1 && svg({ outfit: 'biker-vest' }).indexOf('<circle cx="64" cy="186" r="8"') !== -1, 'dealer vest, five cards on the Royal Flush tee, pinstripes, spade patch');
ok(svg({ hat: 'cap-spade' }).indexOf('<path d="M100 35 Q110.8 42.2') !== -1 && svg({ hat: 'fedora-ace' }).indexOf('rotate(-14 134 48)') !== -1 && svg({ hat: 'crown' }).indexOf('L84 26 L100 46 L116 26') !== -1, 'spade logo on the cap, ace in the fedora band, crown');
ok(svg({ hair: 'short', hairc: 'blue', beard: 'short' }).indexOf('#3b6fd6') !== -1 && svg({ hair: 'short', hairc: 'blue', beard: 'short' }).indexOf('stroke="#4a3222"') !== -1, 'blue hair keeps dark-brown brows and beard');
ok(strip(svg({ outfit: 'tee', outfitc: 'red' }, 96)) !== strip(svg({ outfit: 'tee', outfitc: 'blue' }, 96)) && strip(svg({ outfit: 'suit-charcoal', outfitc: 'red' }, 96)) === strip(svg({ outfit: 'suit-charcoal', outfitc: 'blue' }, 96)), 'the outfit colour changes the plain tee and leaves the suit as drawn');
ok(svg({ mouth: 'cigar' }).indexOf('#ff6a2a') !== -1 && svg({ sex: 0 }).indexOf('opacity=".1"') !== -1 && svg({ sex: 1 }).indexOf('opacity=".32"') !== -1, 'cigar ember drawn; blush faint on men, full on women');
// faces and landmarks
ok(svg({ sex: 0, face: 'm-rugged' }).indexOf('L124 150') !== -1 && svg({ sex: 1, face: 'f-slim' }).indexOf('Q51 132') !== -1 && part('face', 'f-slim', { sex: 1 }, 60).indexOf('Q51 132') !== -1 && svg({ sex: 1, face: 'f-diamond' }).indexOf('cx="53" cy="100"') !== -1 && svg({ sex: 0, face: 'm-square' }).indexOf('L154 118') !== -1 && svg({ sex: 1, face: 'f-heart' }).indexOf('Q45 112') !== -1, '5 face shapes per silhouette (rugged man, slim woman, square jaw, heart) with their own ear positions (vignettes too)');
ok(svg({ sex: 1, face: 'f-oval' }).indexOf('cx="55" cy="100"') !== -1 && svg({ sex: 0, face: 'm-round' }).indexOf('cx="47" cy="100"') !== -1, 'the ears sit on the outline (narrow feminine oval → 55, wide round → 47)');
ok(svg({ face: 'm-oval', hair: 'short' }).indexOf('M 42.9 98 Q 39.8 30 100 28') !== -1 && svg({ face: 'm-round', hair: 'short' }).indexOf('M 38.8 98 Q 36.1 30 100 28') !== -1 && svg({ face: 'm-rugged', hair: 'short' }).indexOf('M 41.1 98 Q 42.3 30 100 28') !== -1, 'hair follows the outline at every height (round man wider, rugged man narrower at the crown than at the ears)');
ok(/scale\(1\.1132[\d]*,1\)[^>]*><ellipse cx="100" cy="67" rx="76"/.test(svg({ face: 'm-round', hat: 'fedora' })) && /scale\(1\.0754[\d]*,1\)[^>]*><ellipse cx="100" cy="68" rx="66"/.test(svg({ face: 'm-rugged', hat: 'bowler' })) && !/scale\(1\.0754[\d]*,1\)/.test(svg({ face: 'm-rugged', hat: 'hood' })), 'hats follow the ear-level width uniformly (round man ×1.113, rugged ×1.075), the hood is built on the outline');
ok(svg({ face: 'm-round', beard: 'full' }).indexOf('M10 170 L27 126 Q35 106 43 103') !== -1 && svg({ face: 'm-long', beard: 'full' }).indexOf('M10 170 L35 126 Q43 106 51 103') !== -1 && svg({ face: 'm-long', beard: 'full' }).indexOf('scale(1.02,1.12)') !== -1 && svg({ face: 'm-long', beard: 'short' }).indexOf('scale(1.01,1.06)') !== -1, 'beards are built from the landmarks: sideburn tip on the edge under the ear, chin-heavy clip');
ok(svg({ face: 'm-rugged', beard: 'goatee' }).indexOf('M88 142 Q100 164 112 142') !== -1 && svg({ face: 'm-oval', beard: 'goatee' }).indexOf('M88 140 Q100 162 112 140') !== -1 && svg({ face: 'm-rugged', beard: 'long' }).indexOf('M64 128 Q78 146 100 146') !== -1 && svg({ face: 'm-oval', beard: 'long' }).indexOf('M56 128 Q70 146 100 146') !== -1, 'goatee hangs from the chin landmark, long beard as wide as the jaw');
ok(/data-fit="1"[^>]*><path d="M41 92/.test(svg({ face: 'm-round', hair: 'balding' })), 'the balding ring is the outline itself, not warped');

// 1d. Expressions (2.1.9-web.209): an expression sets brows + eyes + mouth and adds overlays; opts.expression overrides at render time
const eff = window._avEffective;
ok(eff(norm({ expression: 'tilt' })).eyes === 'bloodshot' && eff(norm({ expression: 'tilt' })).fx.join() === 'vein,sweat' && eff(norm({ eyes: 'wink' })).eyes === 'wink' && eff(norm({ eyes: 'wink' }), { expression: 'joy' }).eyes === 'closed', 'avEffective resolves the drawn brows / eyes / mouth (recipe, or opts.expression)');
ok(svg({ expression: 'anger' }).indexOf('M68 75 Q80 77 90 84') !== -1 && svg({ expression: 'anger' }).indexOf('<rect x="87" y="130" width="26" height="8"') !== -1 && svg({ expression: 'anger' }).indexOf('q4 -4 8 0 q4 4 8 0') !== -1, 'anger: angry brows, gritted teeth, the vein overlay');
ok(svg({ expression: 'sleep' }).indexOf('M70 99 L86 99 M114 99 L130 99') !== -1 && svg({ expression: 'sleep' }).indexOf('M148 42 L160 42 L148 54 L160 54') !== -1 && svg({ expression: 'love' }).indexOf('fill="#e0405a"') !== -1 && svg({ expression: 'win' }).indexOf('fill="#f2c94c"') !== -1 && svg({ expression: 'ko' }).indexOf('M71 91 L85 105') !== -1 && svg({ expression: 'sadness' }).indexOf('fill="#5fa8e8"') !== -1, 'sleep (shut eyes + zzz), love (heart eyes), win (star eyes), ko (crossed eyes), sadness (tear)');
ok(strip(svg({ eyes: 'wink', mouth: 'grin' }, 96, { expression: 'fear' })) === strip(svg({ eyes: 'wink', mouth: 'grin', expression: 'fear' }, 96)) && strip(svg({ eyes: 'wink' }, 96, { expression: 'neutral' })) === strip(svg({ eyes: 'wink' }, 96)), 'opts.expression renders like the recipe expression and leaves the recipe alone; neutral keeps the player\'s own features');
ok(!vis('mouth', 'grin', { expression: 'joy' }) && !vis('eyes', 'wink', { expression: 'joy' }) && !vis('brows', 'angry', { expression: 'joy' }) && vis('mouth', 'grin', { expression: 'neutral' }) && !vis('eyec', 'blue', { expression: 'joy' }) && vis('eyec', 'blue', { expression: 'anger' }), 'an active expression hides the brows / eyes / mouth rows, and the eye colour behind closed eyes');
ok(part('expression', 'tilt', { sex: 0 }, 40).indexOf('viewBox="38 30 124 124"') !== -1 && part('expression', 'tilt', { sex: 0 }, 40).indexOf('fill="#f3d4d4"') !== -1 && part('expression', 'tilt', { sex: 0 }, 40).indexOf('#8f6a1d') === -1, 'expression vignettes show the whole face with the expression, without the frame');
const sanit = window._avSanitize(norm({ expression: 'joy', mouth: 'grin', sex: 1, hair: 'short', face: 'm-square' }));
ok(sanit.mouth === 'grin' && sanit.hair === 'ponytail-high' && sanit.face === 'f-heart', 'avSanitize keeps hidden-row values, replaces a foreign hairstyle by the first feminine one and keeps the face slot (square → heart)');

// 1e. Starter characters (2.1.9-web.210): ten coherent recipes; unlock plumbing for the future rewards system
const PRE = window._AV_PRESETS;
ok(Array.isArray(PRE) && PRE.length === 30 && new Set(PRE.map(p => p.id)).size === 30 && PRE.every(p => p.label && p.recipe), '30 starter characters with unique ids, labels and recipes');
// 2.1.9-web.211 — lot 2 parts: headphones and the headset mic leave the hair, the witch hat / toque / sailor cap cover it; pipe; wart; new garments in pairs
ok(!ax('hat').byId.headphones.covers && !ax('hat').byId['headset-mic'].covers && ax('hat').byId['witch-hat'].covers && ax('hat').byId['chef-toque'].covers && ax('hat').byId['sailor-cap'].covers && !vis('hat', 'headphones', { hair: 'afro' }) && svg({ hat: 'headphones', hair: 'short' }).indexOf('<rect x="36" y="84"') !== -1, 'lot 2 hats: covering flags, headphones offered only where a hat fits, ear cups drawn');
// 2.1.9-web.214 — the witch hat's crown wraps the skull and lowers the hair line to its brim; the fedora / panama / stetson crowns start 3 px wider (no skull sliver on the square face)
ok(ax('hat').byId['witch-hat'].line === 66 && !!svg({ hat: 'witch-hat', hair: 'long-middle' }).match(/clip-path="url\(#[a-z0-9]+hl\)"/) && svg({ hat: 'witch-hat' }).indexOf('<rect x="0" y="66" width="200" height="134"/>') !== -1 && svg({ hat: 'cap', hair: 'long-middle' }).indexOf('<rect x="0" y="60" width="200" height="140"/>') !== -1
  && svg({ hat: 'witch-hat' }).indexOf('M46 72 C50 50 66 34 86 22') !== -1 && svg({ hat: 'fedora' }).indexOf('M51 67 Q49 22 76 17') !== -1 && svg({ hat: 'stetson' }).indexOf('M50 66 Q48 30 72 22') !== -1,
  'witch hat: hair line lowered to 66 (others keep 60), crown wrapping the skull; fedora and stetson crowns widened');
// 2.1.9-web.215 — lot 3 (fun): clown nose, balaclava built on the outline (eye slit, hides the mouth), hawaiian / clown suit pairs, Vegas jumpsuit
ok(ax('nose').byId.clown && svg({ nose: 'clown' }).indexOf('<circle cx="100" cy="115" r="8.5" fill="#e0312c"/>') !== -1
  && ax('hat').byId.balaclava.covers && svg({ face: 'm-round', hat: 'balaclava' }).indexOf('data-fit="1"><rect x="82" y="120"') !== -1 && svg({ hat: 'balaclava' }).indexOf('fill-rule="evenodd"') !== -1 && !/scale\(1\.1132[\d]*,1\)/.test(svg({ face: 'm-round', hat: 'balaclava' }))
  && ax('outfit').byId.hawaiian.sex === 0 && ax('outfit').byId['hawaiian-f'].sex === 1 && ax('outfit').byId['clown-suit'].sex === 0 && ax('outfit').byId['clown-suit-f'].sex === 1 && ax('outfit').byId['vegas-jumpsuit'].sex === 0
  && svg({ outfit: 'hawaiian' }).indexOf('fill="#ffd54a"') !== -1 && svg({ outfit: 'clown-suit' }).indexOf('M100 172 l-26 -13 0 26z') !== -1 && svg({ outfit: 'vegas-jumpsuit' }).indexOf('<rect x="34" y="196" width="132" height="8" fill="#e0b23c"/>') !== -1,
  'lot 3 parts: clown nose, balaclava on the outline (unscaled), garment pairs, rhinestone jumpsuit');
ok(svg({ mouth: 'pipe' }).indexOf('M121 137 Q135 134 134 148') !== -1 && svg({ marks: 'wart' }).indexOf('<circle cx="117" cy="141" r="2.7"') !== -1 && svg({ outfit: 'breton' }).indexOf('<line x1="30" y1="166"') !== -1 && svg({ outfit: 'tracksuit-chain' }).indexOf('M84 160 Q100 192 116 160') !== -1 && svg({ sex: 1, outfit: 'sequin-dress' }).split('<circle').length > 12, 'pipe, wart, breton stripes, gold chain, sequins are drawn');
let preOk = true, preMsg = '';
for (const p of PRE) {
  const r = norm(p.recipe);
  for (const a of AXES) if (p.recipe[a.id] !== undefined && r[a.id] !== p.recipe[a.id]) { preOk = false; preMsg += p.id + ':' + a.id + ' '; }
  const s = window._avSanitize(Object.assign({}, r));
  for (const a of AXES) if (s[a.id] !== r[a.id]) { preOk = false; preMsg += p.id + ':' + a.id + '(sex) '; }
  const sv = svg(r, 96);
  if (sv.includes('NaN') || sv.includes('undefined')) { preOk = false; preMsg += p.id + ':svg '; }
}
ok(preOk, 'every starter character uses known ids, is coherent with its silhouette and renders' + (preOk ? '' : ' (' + preMsg + ')'));
ok(!window._avLocked('hat', 'crown') && !window._avPresetLocked('queen') && !window._avLocked('hat', 'nope'), 'nothing is locked today');
(function () {
  const hats = ax('hat'), crown = hats.byId.crown;
  crown.unlock = 'test-req';
  const lockedNow = window._avLocked('hat', 'crown');
  let drawn = 0; for (let k = 0; k < 150; k++) if (window._avRandom(0).hat === 'crown') drawn++;
  window._avUnlocks = ['test-req'];
  const afterUnlock = window._avLocked('hat', 'crown');
  window._avUnlocks = (id) => id === 'test-req';
  const fnUnlock = window._avLocked('hat', 'crown');
  delete window._avUnlocks; delete crown.unlock;
  ok(lockedNow && drawn === 0 && !afterUnlock && !fnUnlock && svg({ hat: 'crown' }).indexOf('L84 26 L100 46 L116 26') !== -1, 'a part with `unlock` is locked until window._avUnlocks (array or function) reports the requirement, the dice skips it, saved portraits still render it');
})();

// 2. Engine coherence: every option of every axis renders a clean SVG, on both silhouettes and every face slot.
let clean = true, badMsg = '';
for (const a of AXES) for (const p of a.opts) for (const sex of [0, 1]) for (const slot of [0, 2, 4]) {
  const r = { v: 3, sex, face: (sex ? 'f-' : 'm-') + ['oval', 'round', 'square', 'long', 'rugged'][slot].replace('square', sex ? 'heart' : 'square').replace('long', sex ? 'slim' : 'long').replace('rugged', sex ? 'diamond' : 'rugged') };
  r[a.id] = p.id;
  const s = svg(norm(r), 96);
  if (!s.startsWith('<svg') || !s.endsWith('</svg>') || s.includes('undefined') || s.includes('NaN') || s.includes('null')) { clean = false; badMsg = a.id + '#' + p.id + ' ' + sex + '/' + slot; }
}
ok(clean, 'every part renders a clean SVG on both silhouettes and three face slots' + (clean ? '' : ' (bad: ' + badMsg + ')'));

// 2b. Isolated-part vignettes: every option of every framed axis renders
// a clean standalone SVG containing only that layer.
const CROP = window._AV_CROP;
ok(CROP && Object.keys(CROP).length >= 10, 'AV_CROP defines part frames');
ok(Object.values(CROP).every(c => c.length === 3 && c[0] >= 0 && c[1] >= 0 && c[0] + c[2] <= 200 && c[1] + c[2] <= 200), 'every part frame fits the 200x200 canvas');
let partsClean = true, badPart = '';
for (const a of AXES.filter(a => a.kind === 'shape' && a.id !== 'sex')) for (const p of a.opts) for (const sex of [0, 1]) {
  const s = part(a.id, p.id, norm({ sex }), 40);
  if (!s.startsWith('<svg') || !s.endsWith('</svg>') || s.includes('undefined') || s.includes('NaN')) { partsClean = false; badPart = a.id + '#' + p.id; }
}
ok(partsClean, 'every part vignette renders clean' + (partsClean ? '' : ' (bad: ' + badPart + ')'));
ok(part('nose', 'wide', norm(null), 40).indexOf('viewBox="80 94 40 40"') !== -1, 'nose vignette framed');
const mouthPart = part('mouth', 'smile', norm(null), 40);
ok(mouthPart.indexOf('viewBox="74 110 52 52"') !== -1 && mouthPart.indexOf('<ellipse cx="100" cy="94"') === -1, 'mouth vignette is framed and contains no head');
ok(part('hair', 'nope', norm(null), 40) === '', 'a vignette of an unknown part is empty, never a crash');

// 3. Recipes normalize + randomize stay in the catalogue
const rnd = window._avRandom();
ok(AXES.every(a => a.opts.some(p => p.id === norm(rnd)[a.id])), 'random recipe normalizes inside the catalogue');

// 4. Distinct options produce distinct output (spot check per shape axis)
let distinct = true;
for (const a of AXES.filter(a => a.kind === 'shape' && a.id !== 'shoulder')) {
  const s1 = svg(norm({ [a.id]: a.opts[0].id }), 96), s2 = svg(norm({ [a.id]: a.opts[1].id }), 96);
  if (strip(s1) === strip(s2)) distinct = false;
}
ok(distinct, 'shape options produce visually distinct SVG');

// 4b. Silhouette filtering
ok(vis('hair', 'ponytail-high', { sex: 1 }) && !vis('hair', 'ponytail-high', { sex: 0 }), 'ponytail is feminine-only');
ok(vis('hair', 'slicked', { sex: 0 }) && !vis('hair', 'slicked', { sex: 1 }) && vis('hair', 'curly', { sex: 0 }) && !vis('hair', 'curly', { sex: 1 }), 'slicked-back and curly are masculine-only');
// Strict parity (narmod 2026-09-27): every hairstyle and every outfit belongs
// to exactly one silhouette, and both sides keep a decent choice.
let oneSided = true, nM = { hair: 0, outfit: 0 }, nF = { hair: 0, outfit: 0 };
for (const axId of ['hair', 'outfit']) for (const p of ax(axId).opts) {
  const m = vis(axId, p.id, { sex: 0 }), f = vis(axId, p.id, { sex: 1 });
  if (m === f) oneSided = false;
  if (m) nM[axId]++; if (f) nF[axId]++;
}
ok(oneSided, 'every hairstyle and outfit is visible for exactly one silhouette');
ok(nM.hair === 24 && nF.hair === 28 && nM.outfit === 31 && nF.outfit === 28, 'catalogue split: 24 / 28 hairstyles, 31 / 28 outfits (' + nM.hair + '/' + nF.hair + ', ' + nM.outfit + '/' + nF.outfit + ')');
ok(vis('outfit', 'sweater-collar', { sex: 1 }) && !vis('outfit', 'sweater-collar', { sex: 0 }) && vis('outfit', 'turtleneck', { sex: 1 }) && vis('outfit', 'blazer-scarf', { sex: 1 }) && vis('outfit', 'blouse-v', { sex: 1 }) && !vis('outfit', 'blouse-v', { sex: 0 }), 'collared sweater, turtleneck, blazer + scarf and V-neck blouse are feminine');
ok(!vis('glasses', 'cat-eye', { sex: 0 }) && !vis('ears', 'pearl-studs', { sex: 0 }) && !vis('hat', 'bowler', { sex: 1 }) && vis('hat', 'cap', { sex: 1 }) && !vis('hat', 'top-hat', { sex: 1 }) && vis('hat', 'hood', { sex: 1 }) && vis('hat', 'stetson', { sex: 1 }), 'cat-eye glasses and pearls hidden for men, bowler and top hat hidden for women, cap / hood / stetson shared');
ok(!vis('beard', 'goatee', { sex: 1 }) && vis('beard', 'goatee', { sex: 0 }) && vis('beard', 'none', { sex: 1 }), 'beard filtered on feminine silhouette (none stays valid)');
ok(['afro', 'bun', 'mohawk', 'crown-braid', 'messy-bun', 'man-bun'].every(h => !vis('hat', 'cap', { hair: h }) && vis('hat', 'none', { hair: h })) && vis('hat', 'cap', { hair: 'short' }), 'hats filtered out on afro/bun/mohawk/crown braid/high bun/man bun (none stays valid)');
ok(!vis('eyec', 'blue', { eyes: 'closed' }) && !vis('eyec', 'blue', { glasses: 'sunglasses' }) && !vis('eyec', 'blue', { glasses: 'aviators' }) && vis('eyec', 'blue', { eyes: 'round', glasses: 'round' }) && vis('eyec', 'blue', { glasses: 'eye-patch' }), 'eye color hidden behind closed eyes, sunglasses or mirrored aviators (not behind an eye patch)');
ok(!vis('brows', 'thin-arched', { sex: 0 }) && vis('brows', 'thin-arched', { sex: 1 }) && vis('brows', 'angry', { sex: 1 }) && !vis('glasses', 'monocle', { sex: 1 }) && vis('glasses', 'eye-patch', { sex: 1 }), 'thin arched brows are feminine, the monocle masculine, the eye patch shared');
ok(vis('mouth', 'lipstick', { sex: 1 }) && !vis('mouth', 'lipstick', { sex: 0 }) && !vis('mouth', 'pout', { sex: 0 }) && !vis('mouth', 'small-o', { sex: 0 }) && vis('mouth', 'cigar', { sex: 0 }) && !vis('mouth', 'cigar', { sex: 1 }), 'lipstick, pout and small o are feminine, the cigar masculine');
ok(['pearl-studs', 'gold-studs', 'hoops', 'hoop-left', 'hoop-right'].every(k => !vis('ears', k, { sex: 0 }) && vis('ears', k, { sex: 1 })) && vis('ears', 'none', { sex: 0 }) && vis('ears', 'skull-studs', { sex: 0 }) && vis('ears', 'brow-ring', { sex: 0 }), 'every earring is feminine-only; skull studs and the brow ring are shared');
ok(!vis('marks', 'beauty-mark', { sex: 0 }) && vis('marks', 'cheek-scar', { sex: 0 }) && !vis('marks', 'cheek-scar', { sex: 1 }), 'beauty mark is feminine, the cheek scar masculine');
let sexKept = true;
for (let k = 0; k < 10; k++) { if (window._avRandom(1).sex !== 1 || window._avRandom(0).sex !== 0) sexKept = false; }
ok(sexKept, 'avRandom(fixedSex) keeps the chosen silhouette (10 draws each)');
let bgWhite = true;
for (let k = 0; k < 10; k++) if (window._avRandom().bg !== 'white') bgWhite = false;
ok(bgWhite, 'avRandom always lands on the white background (10 draws)');
// Dice-only silhouette rules: 200 draws per silhouette never pick an option
// that reads as the other one (no bald/mohawk woman, no cat-eye man...).
let diceSex = true, neutralN = 0;
const MASC_ONLY = { hair: ['bald', 'short', 'close-curls', 'mohawk'], outfit: ['suit-navy-tie', 'vest-tie', 'tux'] }, FEM_ONLY = { glasses: ['cat-eye'], ears: ['pearl-studs'] };
for (let k = 0; k < 200; k++) {
  const f = window._avRandom(1), m = window._avRandom(0);
  for (const a in MASC_ONLY) if (MASC_ONLY[a].includes(f[a])) diceSex = false;
  for (const a in FEM_ONLY) if (FEM_ONLY[a].includes(m[a])) diceSex = false;
  if (f.beard !== 'none' || f.shoulder !== 'none' || m.shoulder !== 'none') diceSex = false;
  if (f.hat !== 'none' && f.hair === 'ponytail-high') diceSex = false;
  if (m.expression === 'neutral') neutralN++;
  // (eye color is a whole hidden axis behind closed eyes / sunglasses; brows / eyes / mouth hide under an expression)
  const coherent = rr => AXES.every(a => a.id === 'eyec' || (rr.expression !== 'neutral' && ['brows', 'eyes', 'mouth'].indexOf(a.id) !== -1) || vis(a.id, rr[a.id], rr));
  if (!coherent(f) || !coherent(m)) diceSex = false;
}
ok(diceSex, 'dice keeps silhouette-coherent options (200 draws each)');
ok(neutralN > 120, 'the dice mostly leaves the expression neutral (' + neutralN + '/200)');

// 5. Tabs + panes
window.avStudioTab('create');
ok(document.getElementById('avp-pane-create').style.display === '', 'create pane visible');
ok(!!document.getElementById('avm-step-label') && document.getElementById('avm-step-label').textContent.indexOf('1/6') !== -1, 'step header shows category 1/6 (starter characters first)');
const preCards = document.querySelectorAll('#avm-rows .avm-preset');
ok(preCards.length === 30 && preCards[0].querySelector('svg') && preCards[0].querySelector('.avm-preset-name').textContent === 'avmPreGodfather' && preCards[19].querySelector('.avm-preset-name').textContent === 'avmPreStreamer' && preCards[29].querySelector('.avm-preset-name').textContent === 'avmPreKing', 'the first step shows the 30 starter characters as portrait cards with their names');
preCards[2].click(); // the Diva
const afterPreset = JSON.parse(localStorage.getItem('pth_avatar_vec'));
ok(afterPreset.sex === 1 && afterPreset.hair === 'hollywood' && afterPreset.glasses === 'cat-eye' && afterPreset.v === 3, 'tapping a character loads its whole recipe (the Diva: feminine, hollywood waves, cat-eye glasses)');
preCards[0].click(); // back to the Godfather (masculine) for the row counts below
const next = document.getElementById('avm-step-next'), prev = document.getElementById('avm-step-prev');
next.click();
ok(document.getElementById('avm-rows').children.length === 2, 'Silhouette (2/6) renders its 2 axis rows');
ok(document.querySelectorAll('#avm-rows .avm-sex-opt svg').length === 2, 'silhouette chips carry SVG icons instead of glyphs');
next.click();
ok(document.getElementById('avm-rows').children.length === 8, 'Face (3/6) renders 8 rows (skin, marks, eyes, eye colour, brows, nose, mouth, expression)');
next.click();
ok(document.getElementById('avm-rows').children.length === 3, 'stepping to Hair (4/6) renders 3 rows');
next.click(); next.click();
ok(document.getElementById('avm-rows').children.length === 4, 'Extras (6/6) renders 4 rows on the masculine silhouette (glasses, hat, piercings — skull studs and brow ring are shared —, badge; shoulder accessory retired)');
next.click();
ok(document.getElementById('avm-step-label').textContent.indexOf('1/6') !== -1, 'next wraps around to 1/6');
next.click(); next.click();
ok(document.querySelectorAll('#avm-rows .avm-swatch').length > 0, 'color axes render swatches (Face group)');
// picking an expression hides the brows / eyes / mouth rows; back to neutral shows them again
const exRow = Array.from(document.querySelectorAll('#avm-rows .avm-axis')).find(d => d.querySelector('.avm-axis-label').textContent === 'avmExpression');
ok(!!exRow && exRow.querySelectorAll('button').length === 15, 'the expression row shows its 15 vignettes');
exRow.querySelectorAll('button')[2].click();
ok(document.getElementById('avm-rows').children.length === 5 && JSON.parse(localStorage.getItem('pth_avatar_vec')).expression === 'anger', 'picking « anger » hides brows / eyes / mouth (5 rows left) and persists the id');
Array.from(document.querySelectorAll('#avm-rows .avm-axis')).find(d => d.querySelector('.avm-axis-label').textContent === 'avmExpression').querySelectorAll('button')[0].click();
ok(document.getElementById('avm-rows').children.length === 8, 'back to neutral: the 8 rows return');
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
const LIGHT = ['porcelain', 'light', 'medium'];
const resHair = window._avPhotoAnalyze(synthFace({ hair: true }), { sex: 0 });
ok(!!resHair && !!resHair.recipe && resHair.recipe.v === 3, 'photo analysis finds the synthetic face and emits a v3 recipe (part ids)');
if (resHair) {
  ok(resHair.debug.eyesOk, 'both pupils found (box rebuilt from the eyes)');
  ok(LIGHT.indexOf(resHair.recipe.skin) !== -1, 'light skin tone mapped to a light palette entry (' + resHair.recipe.skin + ')');
  ok(resHair.recipe.hair !== 'bald' && ['black', 'dark-brown'].indexOf(resHair.recipe.hairc) !== -1, 'dark hair cap → not bald, dark hair colour (' + resHair.recipe.hair + '/' + resHair.recipe.hairc + ')');
  ok(resHair.recipe.eyes === 'round' || resHair.recipe.eyes === 'almond', 'open eyes (' + resHair.recipe.eyes + ')');
  ok(resHair.recipe.beard === 'none' && resHair.recipe.glasses === 'none' && resHair.recipe.hat === 'none', 'no beard, glasses or hat on the plain face');
  ok(AXES.every(a => !(a.id in resHair.recipe) || a.id === 'sex' || a.opts.some(p => p.id === resHair.recipe[a.id])), 'every estimated axis is a catalogue id');
}
const resBald = window._avPhotoAnalyze(synthFace({ hair: false }), { sex: 0 });
ok(!!resBald && resBald.recipe.hair === 'bald', 'no hair cap → bald');
// guided: the synthetic face oval (cx 80/160, cy 100/200, rx 46, ry 58) as template
const GS = { cx: 0.5, cy: 0.5, rx: 46 / 160, ry: 58 / 200 };
const resGuided = window._avPhotoAnalyze(synthFace({ hair: true }), { sex: 0, guide: GS });
ok(!!resGuided && resGuided.debug.guided && LIGHT.indexOf(resGuided.recipe.skin) !== -1 && resGuided.recipe.hair !== 'bald', 'guided analysis uses the template and finds the same face');
ok(!!resGuided && resGuided.recipe.face === 'm-oval' && !('nose' in resGuided.recipe), 'guided: a face as wide as the oval is oval; no nose shadow → the nose is left alone (' + (resGuided && resGuided.recipe.face) + ')');
// a wider synthetic face (rx 56 on the same template) reads round
const wideFace = synthFace({ hair: true, thick: true }); (function () { const W = 160; for (let y = 0; y < 200; y++) for (let x = 0; x < W; x++) { const ex = (x - 80) / 56, ey = (y - 100) / 58; if (ex * ex + ey * ey <= 1 && y >= 62) { const i = (y * W + x) * 4; wideFace.data[i] = 232; wideFace.data[i + 1] = 190; wideFace.data[i + 2] = 160; } } })();
const resWide = window._avPhotoAnalyze(wideFace, { sex: 0, guide: GS, guessSex: false });
ok(!!resWide && resWide.recipe.face === 'm-round', 'guided: a face wider than the oval is round (' + (resWide && resWide.recipe.face) + ')');
const resWideF = window._avPhotoAnalyze(wideFace, { sex: 1, guide: GS, guessSex: false });
ok(!!resWideF && resWideF.recipe.face === 'f-round', 'guided, feminine: the same photo → the feminine round outline (' + (resWideF && resWideF.recipe.face) + ')');
ok(window._avPhotoAnalyze(synthFace({ hair: true }), { sex: 0, guide: { cx: 0.1, cy: 0.9, rx: 0.05, ry: 0.05 } }) === null, 'guided analysis with nobody in the oval → no face');
// guided hair (2.1.9-web.189): the band above the oval top is read as the
// hair — a bald crown (skin keeps going up), blonde hair (close to the skin
// in lightness, not in chroma), a fringe inside the oval top, and a photo
// that stops above the hairline (guide.valid) which says nothing.
const gBald = window._avPhotoAnalyze(synthFace({ hair: false }), { sex: 0, guide: GS });
ok(!!gBald && gBald.recipe.hair === 'bald', 'guided: skin above the hairline → bald (' + (gBald && gBald.recipe.hair) + ')');
const gBlonde = window._avPhotoAnalyze(synthFace({ hair: true, blonde: true, thick: true }), { sex: 1, guide: GS, guessSex: false });
ok(!!gBlonde && gBlonde.recipe.hair !== 'cropped' && ['blonde', 'light-blonde', 'light-brown'].indexOf(gBlonde.recipe.hairc) !== -1, 'guided: light hair on light skin → not bald, a blonde/light-brown colour (' + (gBlonde && gBlonde.recipe.hair) + '/' + (gBlonde && gBlonde.recipe.hairc) + ')');
const gFringe = window._avPhotoAnalyze(synthFace({ hair: true, sides: true, thick: true }), { sex: 0, guide: GS, guessSex: false });
ok(!!gFringe && gFringe.recipe.hair === 'curtain', 'guided: hair over the forehead and down the sides → curtain fringe, mid length (' + (gFringe && gFringe.recipe.hair) + ')');
const gFringeF = window._avPhotoAnalyze(synthFace({ hair: true, sides: true, thick: true }), { sex: 1, guide: GS, guessSex: false });
ok(!!gFringeF && gFringeF.recipe.hair === 'fringe-long', 'guided, feminine: the same photo → straight fringe (' + (gFringeF && gFringeF.recipe.hair) + ')');
// grey stubble: the chin is not darker as a whole, but a third of it is dark colourless grain
const stubbly = synthFace({ hair: true, thick: true }); (function () { let seed = 7; for (let y = 139; y <= 156; y++) for (let x = 44; x <= 116; x++) { const ex = (x - 80) / 46, ey = (y - 100) / 58; seed = (seed * 1103515245 + 12345) & 0x7fffffff; if (ex * ex + ey * ey <= 1 && (seed % 100) < 32) { const i = (y * 160 + x) * 4; stubbly.data[i] = 42; stubbly.data[i + 1] = 42; stubbly.data[i + 2] = 42; } } })();
const gStubble = window._avPhotoAnalyze(stubbly, { sex: 0, guide: GS, guessSex: false });
ok(!!gStubble && gStubble.recipe.beard === 'stubble', 'guided: grey stubble grain under the lip → stubble (' + (gStubble && gStubble.recipe.beard) + ')');
const gCut = window._avPhotoAnalyze(synthFace({ hair: false }), { sex: 0, guide: Object.assign({ valid: [0, 0.3, 1, 1] }, GS) });
ok(!!gCut && gCut.recipe.hair !== 'bald', 'guided: photo cut above the hairline → the default hair stays, never bald (' + (gCut && gCut.recipe.hair) + ')');
// silhouette guess: the plain synthetic face has no cue → no `sex` in the recipe;
// a dark hair-coloured band under the chin (beard) → masculine even when analysed as feminine
const noCue = window._avPhotoAnalyze(synthFace({ hair: true }), { sex: 1 });
ok(!!noCue && !('sex' in noCue.recipe) && noCue.recipe.beard === 'none', 'no clear cue → the chosen silhouette stands (no sex in the recipe)');
const bearded = synthFace({ hair: true });
for (let y = 139; y <= 162; y++) for (let x = 44; x <= 116; x++) { const ex = (x - 80) / 46, ey = (y - 100) / 58; if (ex * ex + ey * ey <= 1) { const i = (y * 160 + x) * 4; bearded.data[i] = 40; bearded.data[i + 1] = 35; bearded.data[i + 2] = 32; } } // (a beard starts right under the lip)
const withBeard = window._avPhotoAnalyze(bearded, { sex: 1 });
ok(!!withBeard && withBeard.recipe.sex === 0 && ['short', 'full'].indexOf(withBeard.recipe.beard) !== -1, 'a beard → masculine silhouette guessed with the beard (' + (withBeard && withBeard.recipe.sex) + '/' + (withBeard && withBeard.recipe.beard) + ')');
const noGuess = window._avPhotoAnalyze(bearded, { sex: 1, guessSex: false });
ok(!!noGuess && !('sex' in noGuess.recipe) && noGuess.recipe.beard === 'none', 'guessSex:false keeps the feminine silhouette (and no beard on it)');
// 2.1.9-web.207 — eyebrows from the dark runs above the pupils, long beard below the oval, felt backdrop
const paintBrows = (img, kind) => { const W = 160; const bar = (x0, y0, x1, y1, th) => { for (let x = x0; x <= x1; x++) { const yy = y0 + (y1 - y0) * (x - x0) / (x1 - x0); for (let k = 0; k < th; k++) { const i = (Math.round(yy + k) * W + x) * 4; img.data[i] = 30; img.data[i + 1] = 20; img.data[i + 2] = 15; } } };
  if (kind === 'angry') { bar(47, 74, 77, 82, 4); bar(83, 82, 113, 74, 4); } else if (kind === 'thick') { bar(47, 76, 77, 76, 8); bar(83, 76, 113, 76, 8); } else if (kind === 'flat') { bar(47, 78, 77, 78, 4); bar(83, 78, 113, 78, 4); } return img; };
const gPlain = window._avPhotoAnalyze(synthFace({ hair: true, thick: true }), { sex: 0, guide: GS, guessSex: false });
ok(!!gPlain && gPlain.recipe.brows === 'neutral' && gPlain.debug.browsDbg === 'no brows', 'guided: no brows painted → neutral brows (' + (gPlain && gPlain.debug.browsDbg) + ')');
const gAngry = window._avPhotoAnalyze(paintBrows(synthFace({ hair: true, thick: true }), 'angry'), { sex: 0, guide: GS, guessSex: false });
ok(!!gAngry && gAngry.recipe.brows === 'angry', 'guided: inner ends of the brows lower than the outer ones → angry V (' + (gAngry && gAngry.recipe.brows) + ' ' + (gAngry && gAngry.debug.browsDbg) + ')');
const gThick = window._avPhotoAnalyze(paintBrows(synthFace({ hair: true, thick: true }), 'thick'), { sex: 0, guide: GS, guessSex: false });
ok(!!gThick && gThick.recipe.brows === 'thick', 'guided: thick flat brows → low thick brows (' + (gThick && gThick.recipe.brows) + ' ' + (gThick && gThick.debug.browsDbg) + ')');
const gFlat = window._avPhotoAnalyze(paintBrows(synthFace({ hair: true, thick: true }), 'flat'), { sex: 0, guide: GS, guessSex: false });
ok(!!gFlat && gFlat.recipe.brows === 'neutral', 'guided: ordinary flat brows → neutral (' + (gFlat && gFlat.recipe.brows) + ' ' + (gFlat && gFlat.debug.browsDbg) + ')');
const longB = synthFace({ hair: true, thick: true }); (function () { let seed = 3; for (let y = 139; y <= 190; y++) for (let x = 50; x <= 110; x++) { const ex = (x - 80) / 46, ey = (y - 100) / 58; seed = (seed * 1103515245 + 12345) & 0x7fffffff; if (ex * ex + ey * ey <= 1 || (y > 158 && Math.abs(x - 80) < 26)) { const i = (y * 160 + x) * 4; const g = 30 + (seed % 22); longB.data[i] = g + 8; longB.data[i + 1] = g; longB.data[i + 2] = g - 4; } } })(); // a grainy dark mass from the lip down to 32 px below the oval, narrower than the face
const gLong = window._avPhotoAnalyze(longB, { sex: 0, guide: GS, guessSex: false });
ok(!!gLong && gLong.recipe.beard === 'long', 'guided: the beard mass goes on below the oval, bounded on both sides → long beard (' + (gLong && gLong.recipe.beard) + ' ' + (gLong && gLong.debug.beardDbg.replace(/^.*long=/, 'long=')) + ')');
const greenBg = synthFace({ hair: true, thick: true }); (function () { for (let i = 0; i < greenBg.data.length; i += 4) if (greenBg.data[i] === 245 && greenBg.data[i + 1] === 245 && greenBg.data[i + 2] === 245) { greenBg.data[i] = 30; greenBg.data[i + 1] = 110; greenBg.data[i + 2] = 60; } })();
const gGreen = window._avPhotoAnalyze(greenBg, { sex: 0, guide: GS, guessSex: false });
ok(!!gGreen && gGreen.recipe.bg === 'felt-green' && gPlain.recipe.bg === 'white', 'guided: a saturated green backdrop → the green felt, white stays white (' + (gGreen && gGreen.recipe.bg) + ')');
const blank = { width: 64, height: 64, data: new Uint8ClampedArray(64 * 64 * 4).fill(255) };
ok(window._avPhotoAnalyze(blank, { sex: 0 }) === null, 'blank image → no face');
window.avStudioReset();
ok(document.getElementById('avp-pane-gallery').style.display === '', 'reset returns to gallery');
document.body.classList.add('adv-no-avcreate');
window.avStudioTab('create');
ok(document.getElementById('avp-pane-gallery').style.display === '', 'adv-no-avcreate falls back to gallery');
document.body.classList.remove('adv-no-avcreate');

// 5b. Feminine silhouette hides the facial-hair row in the Hair group
window.avStudioTab('create');
// (the pane re-opens on the current group — Silhouette after the steps above)
const sexRow = () => document.querySelectorAll('#avm-rows .avm-axis')[0];
ok(document.getElementById('avm-step-label').textContent.indexOf('2/6') !== -1 && document.querySelectorAll('#avm-rows .avm-sex-opt').length === 2, 'Silhouette step: sex axis renders 2 pictogram chips');
sexRow().querySelectorAll('button')[1].click(); // sex -> F
next.click(); next.click();
ok(document.getElementById('avm-rows').children.length === 2, 'feminine silhouette: Hair step shows 2 rows (no facial hair)');
prev.click(); prev.click();
sexRow().querySelectorAll('button')[0].click(); // sex -> M
next.click(); next.click();
ok(document.getElementById('avm-rows').children.length === 3, 'masculine silhouette: Hair step shows 3 rows again');
prev.click(); prev.click();

// 5c. Reset button restores the default recipe
ok(!!document.getElementById('avm-reset'), 'reset button rendered');
sexRow().querySelectorAll('button')[1].click(); // sex -> F
document.getElementById('avm-reset').click();
const afterReset = JSON.parse(localStorage.getItem('pth_avatar_vec'));
ok(afterReset.v === 3 && afterReset.sex === 0 && afterReset.hair === 'short' && afterReset.glasses === 'none', 'reset restores AV_DEFAULT (v3 ids)');

// 6. Recipe persistence
window.avStudioTab('create');
sexRow().querySelectorAll('button')[1].click();
const persisted = JSON.parse(localStorage.getItem('pth_avatar_vec'));
ok(persisted && persisted.sex === 1 && persisted.face === 'f-oval' && persisted.hair === 'ponytail-high', 'clicking the feminine silhouette persists the recipe (pth_avatar_vec) with the feminine oval and hairstyle');

// 7. i18n: axis label keys present in every language file
const KEYS = ['avmSex','avmFace','avmHat','avmGrpBody','avmGrpFace','avmGrpHair','avmGrpStyle','avmGrpExtra',
  'avmNose','avmBg','avmOutfit','avmSkin','avmMarks','avmHair','avmHairColor','avmBeard',
  'avmEyeShape','avmEyeColor','avmMouth','avmShoulder','avmEarrings','avmNone',
  'avTabGallery','avTabCreate','avTabImport','avmRandom','avmReset','avmUse','avmGlasses','avmBrows','avmBadge','avmExpression','avmOutfitColor',
  'avmGrpPresets','avmLocked','avmPreGodfather','avmPreCowboy','avmPreDiva','avmPreShark','avmPreDealer','avmPrePirate','avmPreRocker','avmPreGeek','avmPreQueen','avmPrePro',
  'avmPreDetective','avmPreMagician','avmPreVampire','avmPreWitch','avmPreChef','avmPreSailor','avmPrePopstar','avmPreRapper','avmPreBoxer','avmPreStreamer',
  'avmPreFish','avmPreManiac','avmPreSurfer','avmPreGranny','avmPreGrandpa','avmPreTycoon','avmPreClown','avmPreTourist','avmPreNinja','avmPreKing',
  'avImportDrop','avImportOr','avImportBtn','avImportHint','advAvatarCreate'];
// every axis label must be in the list (a new axis without a label would show its key)
ok(AXES.every(a => KEYS.indexOf(a.label) !== -1) && PRE.every(p => KEYS.indexOf(p.label) !== -1), 'every axis and character label key is covered by the i18n check');
const langDir = path.join(PUB, 'modules/lang');
let langsOk = true, nLang = 0;
for (const f of fs.readdirSync(langDir).filter(f => f.endsWith('.mjs'))) {
  nLang++;
  const ls = fs.readFileSync(path.join(langDir, f), 'utf8');
  for (const k of KEYS) if (!ls.includes(k + ':')) { langsOk = false; console.log('    missing ' + k + ' in ' + f); }
}
ok(langsOk, 'all avatar keys present in all ' + nLang + ' language files');

console.log(fail === 0 ? 'ALL OK (' + pass + ')' : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
