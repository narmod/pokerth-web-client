// Avatar vector engine — layered SVG portrait renderer for the Create tab.
//
// "Toon" style validated with narmod (2026-09-27): big round head, large
// expressive eyes, short rounded body, soft volume gradients, pastel or
// poker backdrop and the double gold border of the login-screen avatar
// trigger.
//
// Since 2.1.9-web.209 the catalogue is DECLARATIVE: every option of every
// axis is a part object in public/modules/ui/avatar-parts/ (one file per
// family), with a stable string id, its silhouette tag, its dice weight,
// its flags and its own draw(ctx, r, L). This file only knows the layer
// pipeline, the landmarks it hands to the parts, the recipe format and the
// dice. Adding a hat is one object in extras.mjs; nothing here changes.
//
// Recipe v3: { v: 3, sex: 0|1, <axis>: <part id>, ... }. Recipes v1/v2
// stored numeric indices — avNormalize() migrates them through the frozen
// tables of avatar-parts/legacy.mjs, so every saved portrait re-opens.
//
// avSvg(recipe, size, opts) → full <svg> string (viewBox 0 0 200 200,
// self-contained, canvas-rasterizable). opts.expression overrides the
// recipe's expression at render time (table reactions).
//
// Layer order: backdrop (+ pattern) → hat back (hood inside) → back hair +
// underlay → neck + outfit → ears → head → scalp hair → marks → cheeks →
// nose → beard → mouth → eyes (+ lashes) → brows → earrings → front hair →
// glasses → hat → expression overlays → badge → gold border.

'use strict';
import { AXES } from './avatar-parts/index.mjs';
import { FX } from './avatar-parts/expressions.mjs';
import { PRESETS } from './avatar-parts/presets.mjs';
import { lashes } from './avatar-parts/face-parts.mjs';
import { V1_SKIN, V2, V2_FACE } from './avatar-parts/legacy.mjs';
import { _mix, _ctx, _sx, _warp, _hatFit, _headClip, _head, _earsSkin, _neck, _cid, _wrap, _headHW, _facePts, _earring, BROW_RING, HAT_LINE, HAT_SHORT_BOTTOM } from './avatar-parts/helpers.mjs';

const AV_AXES = AXES;
const AV_PRESETS = PRESETS;
const AV_RECIPE_V = 3;

// Lookups: axis by id, part by (axis, id).
const _AX = {};
AXES.forEach(function (ax) {
  _AX[ax.id] = ax;
  ax.byId = {};
  ax.opts.forEach(function (p) { ax.byId[p.id] = p; });
});
function avAxis(axId) { return _AX[axId]; }
function avPart(axId, id) { var ax = _AX[axId]; return ax ? ax.byId[id] : undefined; }

const AV_DEFAULT = { v: AV_RECIPE_V };
AXES.forEach(function (ax) { AV_DEFAULT[ax.id] = ax.def; });
// Vignette frames (square [x, y, size] in the 200×200 space) per axis.
const AV_CROP = {};
AXES.forEach(function (ax) { if (ax.crop) AV_CROP[ax.id] = ax.crop; });
const _FX = {};
FX.forEach(function (f) { _FX[f.id] = f; });

// ── Recipes ──────────────────────────────────────────────────────────────
// v1 (no `v`, ten-tone skins) and v2 recipes hold numeric indices: map them
// through the frozen v2 order; strings pass through (already ids).
function _migrate(r) {
  var o = {}, sex = r.sex === 1 ? 1 : 0;
  o.sex = sex;
  var skin = typeof r.skin === 'number' ? Math.floor(r.skin) : undefined;
  if (skin !== undefined && !(r.v >= 2)) skin = V1_SKIN[skin] !== undefined ? V1_SKIN[skin] : 1;
  Object.keys(V2).forEach(function (ax) {
    var n = (ax === 'skin' && skin !== undefined) ? skin : r[ax];
    if (typeof n === 'number') { var id = V2[ax][Math.floor(n)]; if (id !== undefined) o[ax] = id; }
    else if (typeof n === 'string') o[ax] = n;
  });
  if (typeof r.face === 'number') { var f = V2_FACE[sex][Math.floor(r.face)]; if (f) o.face = f; }
  else if (typeof r.face === 'string') o.face = r.face;
  if (typeof r.expression === 'string') o.expression = r.expression;
  return o;
}
function avNormalize(r) {
  var out = {};
  if (r && !(r.v >= AV_RECIPE_V)) r = _migrate(r);
  AXES.forEach(function (ax) {
    var v = r ? r[ax.id] : undefined;
    out[ax.id] = (v !== undefined && ax.byId[v] !== undefined) ? v : ax.def;
  });
  // the default face is the oval of the recipe's own silhouette
  if (!(r && r.face !== undefined && _AX.face.byId[r.face])) out.face = V2_FACE[out.sex][0];
  out.v = AV_RECIPE_V;
  return out;
}

// The brows, eyes and mouth actually drawn: the expression's, when one is
// active (from the recipe or from opts.expression at render time).
function avEffective(r, opts) {
  var exId = (opts && opts.expression) || r.expression, ex = avPart('expression', exId);
  var e = { brows: r.brows, eyes: r.eyes, mouth: r.mouth, fx: [] };
  if (ex && ex.set) { e.brows = ex.set.brows; e.eyes = ex.set.eyes; e.mouth = ex.set.mouth; e.fx = ex.fx || []; }
  return e;
}

// Is this option offered for this recipe? Silhouette tags (every hairstyle
// and outfit belongs to one silhouette; small extras are shared), the
// masculine-only beard axis, hats hidden under tall hairstyles, the eye
// colour hidden behind closed eyes / opaque lenses, the brows / eyes /
// mouth rows hidden while an expression sets them. The engine still
// renders any recipe (old recipes stay valid).
function avVisible(axId, id, recipe) {
  var ax = _AX[axId], p = ax && ax.byId[id];
  if (!p) return false;
  if (!recipe) return true;
  if (axId === 'beard' && recipe.sex === 1) return id === 'none';
  if (axId === 'hat' && id !== 'none') { var h = avPart('hair', recipe.hair); if (h && h.noHat) return false; }
  if (axId === 'eyec') {
    var e = avPart('eyes', avEffective(recipe).eyes), g = avPart('glasses', recipe.glasses);
    if ((e && e.hidesEyec) || (g && g.hidesEyec)) return false;
  }
  if ((axId === 'brows' || axId === 'eyes' || axId === 'mouth') && recipe.expression && recipe.expression !== 'neutral') return false;
  if (p.sex !== undefined && recipe.sex !== undefined && p.sex !== recipe.sex) return false;
  return true;
}

// After a silhouette switch (or a photo), options filtered out for the new
// sex are replaced: the same slot when the axis has slots (face shapes),
// else the first visible option; an axis with nothing visible (rows hidden
// by an expression) keeps its value.
function avSanitize(r) {
  AXES.forEach(function (ax) {
    if (avVisible(ax.id, r[ax.id], r)) return;
    var cur = ax.byId[r[ax.id]], vis = ax.opts.filter(function (p) { return avVisible(ax.id, p.id, r); });
    if (!vis.length) return;
    var same = cur && cur.slot !== undefined ? vis.filter(function (p) { return p.slot === cur.slot; })[0] : null;
    r[ax.id] = (same || vis[0]).id;
  });
  return r;
}

// ── Unlockable options (2.1.9-web.210) ────────────────────────────────────
// A part or a preset may carry `unlock: '<requirement id>'`: it stays
// visible but greyed out in the studio and skipped by the dice until the
// requirement is reported earned. The future rewards system (achievements,
// actions at the table…) publishes what is earned as window._avUnlocks — an
// array / Set of requirement ids, or a function(id) → boolean. Nothing is
// locked today; saved portraits always render whatever they hold.
function _unlocked(req) {
  var u = (typeof window !== 'undefined') ? window._avUnlocks : null;
  if (!u) return false;
  if (typeof u === 'function') return !!u(req);
  if (typeof u.has === 'function') return u.has(req);
  return Array.isArray(u) ? u.indexOf(req) !== -1 : !!u[req];
}
function avLocked(axId, id) { var p = avPart(axId, id); return !!(p && p.unlock && !_unlocked(p.unlock)); }
function avPresetLocked(id) { var p = PRESETS.filter(function (q) { return q.id === id; })[0]; return !!(p && p.unlock && !_unlocked(p.unlock)); }

// ── Dice ─────────────────────────────────────────────────────────────────
// Optional extras are rarer (axis pNone), striking options carry a lower
// weight, the backdrop is always white, a chosen silhouette is kept and
// locked options are never drawn.
function _randOk(axId, p, r) {
  if (p.unlock && !_unlocked(p.unlock)) return false;
  if (axId === 'hat' && p.id !== 'none') { var h = avPart('hair', r.hair); if (h && h.noHatDice) return false; }
  return true;
}
function avRandom(fixedSex) {
  var r = { v: AV_RECIPE_V, sex: (fixedSex === 0 || fixedSex === 1) ? fixedSex : Math.floor(Math.random() * 2) };
  var draw = function (ax) {
    var opts = ax.opts.filter(function (p) { return avVisible(ax.id, p.id, r) && _randOk(ax.id, p, r); });
    var noneId = ax.opts[0].id;
    if (ax.none && opts.length > 1 && ax.pNone) {
      if (Math.random() < ax.pNone[r.sex]) { r[ax.id] = noneId; return; }
      opts = opts.filter(function (p) { return p.id !== noneId; });
    }
    var total = 0;
    opts.forEach(function (p) { total += p.weight !== undefined ? p.weight : 1; });
    var pick = Math.random() * total;
    r[ax.id] = opts.length ? opts[opts.length - 1].id : ax.def;
    for (var k = 0; k < opts.length; k++) {
      pick -= opts[k].weight !== undefined ? opts[k].weight : 1;
      if (pick < 0) { r[ax.id] = opts[k].id; break; }
    }
  };
  // 'eyec' depends on the eyes, the glasses and the expression: last.
  AXES.forEach(function (ax) { if (ax.id !== 'sex' && ax.id !== 'eyec') draw(ax); });
  draw(_AX.eyec);
  r.bg = 'white';
  return r;
}

// ── Render context: palette + landmarks handed to every part ─────────────
function _L(r) {
  var face = avPart('face', r.face) || _AX.face.opts[0], k = face.key;
  var skin = avPart('skin', r.skin).colors, hcP = avPart('hairc', r.hairc), hc = hcP.colors;
  return {
    fem: r.sex === 1, k: k, pts: _facePts(k), hw: _headHW(k),
    skin: skin, hc: hc, hcN: hcP.fantasy ? avPart('hairc', 'dark-brown').colors : hc,
    ec: avPart('eyec', r.eyec).colors[0], oc: avPart('outfitc', r.outfitc).colors[0], felt: avPart('bg', r.bg).colors
  };
}

// ── Full portrait ────────────────────────────────────────────────────────
// bare: no frame, no backdrop (vignettes).
function _render(r, ctx, opts, bare) {
  var L = _L(r), cid = ctx.cid, fem = L.fem, ex = avEffective(r, opts);
  var hairP = avPart('hair', r.hair), hatP = avPart('hat', r.hat), outfitP = avPart('outfit', r.outfit), bgP = avPart('bg', r.bg);
  var eyesP = avPart('eyes', ex.eyes), browsP = avPart('brows', ex.brows), mouthP = avPart('mouth', ex.mouth);
  L.oc = outfitP.colorable ? L.oc : null;
  // Hair, underlay and hats are drawn for a ±53 oval: _warp fits them to
  // the outline's temple and ear widths (FACE_PTS), _hatFit to its skull.
  var hair = hairP.draw(ctx, r, L);
  var covers = !!hatP.covers, hatLine = hatP.line || HAT_LINE; // a hat whose brim edges sit low lowers the hair line (witch hat)
  var hatClip = hairP.short ? 'hs' : 'hl';
  var clipHair = function (s) { return covers && s ? '<g clip-path="url(#' + cid + hatClip + ')">' + s + '</g>' : s; };
  ctx.defs.push('<clipPath id="' + cid + '"><rect x="6" y="6" width="188" height="188"/></clipPath>'
    + '<clipPath id="' + cid + 'hl"><rect x="0" y="' + hatLine + '" width="200" height="' + (200 - hatLine) + '"/></clipPath>'
    + '<clipPath id="' + cid + 'hs"><rect x="0" y="' + hatLine + '" width="200" height="' + (HAT_SHORT_BOTTOM - hatLine) + '"/></clipPath>'
    + (bare ? '' : '<radialGradient id="' + cid + 'bg" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="' + L.felt[1] + '"/><stop offset="1" stop-color="' + L.felt[0] + '"/></radialGradient>'));
  var fx = '';
  ex.fx.forEach(function (id) { var f = _FX[id]; if (f) fx += f.draw(ctx, r, L); });
  return (bare ? '' : '<rect width="200" height="200" fill="#8f6a1d"/>'
      + '<rect x="2.5" y="2.5" width="195" height="195" fill="#c9992e"/>'
      + '<rect x="6" y="6" width="188" height="188" fill="url(#' + cid + 'bg)"/>')
    + '<g clip-path="url(#' + cid + ')">'
    + (!bare && bgP.pattern ? bgP.pattern(ctx) : '')
    + (hatP.back ? hatP.back(ctx, r, L) : '')
    + clipHair(_warp(hair[0]
        // Underlay: the hair mass behind the head fills the temples, so
        // the hairline hugs every face shape (no backdrop between hair
        // and skin). Bald, balding, buzz, flat top and mohawk have none.
        + (hairP.underlay === false ? '' : '<path d="M45 98 Q42 30 100 28 Q158 30 155 98z" fill="' + _mix(L.hc[0], 0.85) + '"/>'), L.k))
    + _sx(fem ? 0.86 : 1, _neck(L.skin) + outfitP.draw(ctx, r, L))
    + _earsSkin(L.skin, L.hw)
    + _head(ctx, L.k, L.skin)
    + (hair[2] ? clipHair('<g clip-path="url(#' + _headClip(ctx, L.k, 1.02) + ')">' + _warp(hair[2], L.k) + '</g>') : '')
    + avPart('marks', r.marks).draw(ctx, r, L)
    // (blush: a feminine touch, barely there on men)
    + '<ellipse cx="68" cy="117" rx="9" ry="5.5" fill="#ff7f86" opacity="' + (fem ? '.32' : '.1') + '"/>'
    + '<ellipse cx="132" cy="117" rx="9" ry="5.5" fill="#ff7f86" opacity="' + (fem ? '.32' : '.1') + '"/>'
    + avPart('nose', r.nose).draw(ctx, r, L)
    + avPart('beard', r.beard).draw(ctx, r, L)
    + mouthP.draw(ctx, r, L)
    + eyesP.draw(ctx, r, L) + (fem && eyesP.lashes ? lashes(eyesP.lashes) : '')
    // Brows follow hair colour (a natural one on fantasy hair)
    + browsP.draw(ctx, r, L)
    + avPart('ears', r.ears).draw(ctx, r, L)
    + clipHair(_warp(hair[1], L.k))
    + avPart('glasses', r.glasses).draw(ctx, r, L)
    + _hatFit(hatP.draw(ctx, r, L), L.k)
    + fx
    + avPart('badge', r.badge).draw(ctx, r, L)
    + '</g>'
    + (bare ? '' : '<rect x="6" y="6" width="188" height="188" fill="none" stroke="#8f6a1d" stroke-width="1"/>');
}

function avSvg(recipe, size, opts) {
  var r = avNormalize(recipe), ctx = _ctx(_cid());
  return _wrap('0 0 200 200', size || 200, ctx, _render(r, ctx, opts, false));
}

// Isolated-part vignette: only the chosen layer, over the chip's own
// themed background (no backdrop, readable in every palette), drawn with
// the current recipe's palette. Exceptions: skin marks keep the bare head
// as canvas (unreadable alone), an expression shows the whole face.
function avPartSvg(axId, id, recipe, size) {
  var ax = _AX[axId];
  if (!ax || !ax.byId[id]) return '';
  var r = avNormalize(recipe);
  r[axId] = id;
  var vb = ax.crop;
  if (!vb) return avSvg(r, size);
  var ctx = _ctx(_cid()), L = _L(r), part = ax.byId[id], body = '', h;
  switch (axId) {
    case 'face':    body = _earsSkin(L.skin, L.hw) + _head(ctx, L.k, L.skin); break;
    case 'marks':   body = _earsSkin(L.skin, L.hw) + _head(ctx, L.k, L.skin) + part.draw(ctx, r, L); break;
    case 'outfit':  L.oc = part.colorable ? L.oc : null; body = _sx(r.sex === 1 ? 0.86 : 1, _neck(L.skin) + part.draw(ctx, r, L)); break;
    case 'hair':    h = part.draw(ctx, r, L);
      body = h[0] + (h[2] ? '<g clip-path="url(#' + _headClip(ctx, L.k, 1.02) + ')">' + h[2] + '</g>' : '') + h[1]; break;
    case 'eyes':    body = part.draw(ctx, r, L) + (L.fem && part.lashes ? lashes(part.lashes) : ''); break;
    case 'hat':     body = (part.back ? part.back(ctx, r, L) : '') + part.draw(ctx, r, L); break;
    case 'ears':    // one ear + its earring (the right-only hoop is mirrored); the brow ring shows on a brow
      body = '<circle cx="47" cy="100" r="10.5" fill="' + L.skin[0] + '"/>' + (part.kind ? _earring(part.kind, 46) : '');
      if (part.onBrow) { body = '<path d="M112 79 Q122 74 132 80" stroke="' + L.hcN[0] + '" stroke-width="5.4" stroke-linecap="round" fill="none"/>' + BROW_RING; vb = [108, 60, 40]; }
      break;
    case 'expression': body = _render(r, ctx, null, true); break;
    default:        body = part.draw ? part.draw(ctx, r, L) : '';
  }
  return _wrap(vb[0] + ' ' + vb[1] + ' ' + vb[2] + ' ' + vb[2], size, ctx, body);
}

// Silhouette icons (♂ / ♀) as inline SVG: the Unicode glyphs sit off-centre
// and vary by platform font (narmod 2026-09-27).
function avSexIcon(sex) {
  if (sex === 1) return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 14v8M8.5 18.5h7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="14" r="5.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M14.2 9.8L20 4M20 4h-5.5M20 4v5.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
// Portraits used as silhouette pickers (framing panel).
const AV_SEX_SAMPLE = [
  { v: 3, sex: 0, face: 'm-oval', hair: 'short', hairc: 'dark-brown', outfit: 'tee', outfitc: 'blue', mouth: 'smile', bg: 'white' },
  { v: 3, sex: 1, face: 'f-oval', hair: 'bob', hairc: 'dark-brown', outfit: 'tee-scoop', outfitc: 'pink', mouth: 'smile', bg: 'white' }
];

// Swatch (CSS background) shown on the option chip of a 'color' axis.
function avSwatch(axId, id) {
  var p = avPart(axId, id);
  if (!p) return '#888';
  return p.swatch || (p.colors && p.colors[0]) || '#888';
}

export { AV_AXES, AV_PRESETS, AV_DEFAULT, AV_CROP, AV_SEX_SAMPLE, AV_RECIPE_V, avSvg, avPartSvg, avSwatch, avNormalize, avRandom, avVisible, avSanitize, avEffective, avAxis, avPart, avLocked, avPresetLocked, avSexIcon };
for (const [k, v] of Object.entries({ AV_AXES, AV_PRESETS, AV_DEFAULT, AV_CROP, AV_SEX_SAMPLE, AV_RECIPE_V, avSvg, avPartSvg, avSwatch, avNormalize, avRandom, avVisible, avSanitize, avEffective, avAxis, avPart, avLocked, avPresetLocked, avSexIcon }))
  window['_' + k] = v;
