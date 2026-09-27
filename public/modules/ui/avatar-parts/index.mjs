// Avatar parts — the axes (2.1.9-web.209).
//
// One entry per axis, in the order the engine, the studio rows and the
// dice use: id, i18n label key, kind ('shape' rows show vignettes,
// 'color' rows show swatches), none (the first option means « none » and
// is shown as a text chip), def (default part id), opts (the parts),
// crop ([x, y, size] of the vignette in the 200×200 space, or null when the
// whole portrait is shown), pNone ([masculine, feminine] probability that
// the dice leaves the axis on « none »).
//
// Adding an axis: an entry here, a label in every lang file, a draw slot in
// the engine's layer pipeline, and the studio group that shows it.

'use strict';
import { FACES } from './faces.mjs';
import { SKINS, HAIRCS, EYECS, OUTFITCS, BGS } from './colors.mjs';
import { HAIR } from './hair.mjs';
import { OUTFITS } from './outfits.mjs';
import { EYES, BROWS, NOSES, MOUTHS, MARKS, BEARDS } from './face-parts.mjs';
import { GLASSES, EARS, HATS, BADGES, SHOULDER } from './extras.mjs';
import { EXPRESSIONS } from './expressions.mjs';

const SEXES = [{ id: 0 }, { id: 1 }];

const AXES = [
  { id: 'sex',        label: 'avmSex',         kind: 'shape', none: false, def: 0,               opts: SEXES,       crop: null },
  { id: 'face',       label: 'avmFace',        kind: 'shape', none: false, def: 'm-oval',        opts: FACES,       crop: [38, 30, 124] },
  { id: 'bg',         label: 'avmBg',          kind: 'color', none: false, def: 'green',         opts: BGS,         crop: null },
  { id: 'outfit',     label: 'avmOutfit',      kind: 'shape', none: false, def: 'suit-charcoal', opts: OUTFITS,     crop: [34, 68, 132] },
  { id: 'outfitc',    label: 'avmOutfitColor', kind: 'color', none: true,  def: 'auto',          opts: OUTFITCS,    crop: null },
  { id: 'skin',       label: 'avmSkin',        kind: 'color', none: false, def: 'light',         opts: SKINS,       crop: null },
  { id: 'marks',      label: 'avmMarks',       kind: 'shape', none: true,  def: 'none',          opts: MARKS,       crop: [38, 30, 124], pNone: [0.65, 0.65] },
  { id: 'hair',       label: 'avmHair',        kind: 'shape', none: true,  def: 'short',         opts: HAIR,        crop: [20, 4, 160] },
  { id: 'hairc',      label: 'avmHairColor',   kind: 'color', none: false, def: 'dark-brown',    opts: HAIRCS,      crop: null },
  { id: 'beard',      label: 'avmBeard',       kind: 'shape', none: true,  def: 'none',          opts: BEARDS,      crop: [40, 80, 120], pNone: [0.45, 1] },
  { id: 'eyes',       label: 'avmEyeShape',    kind: 'shape', none: false, def: 'round',         opts: EYES,        crop: [58, 66, 84] },
  { id: 'eyec',       label: 'avmEyeColor',    kind: 'color', none: false, def: 'brown',         opts: EYECS,       crop: null },
  { id: 'brows',      label: 'avmBrows',       kind: 'shape', none: false, def: 'neutral',       opts: BROWS,       crop: [54, 30, 92] },
  { id: 'nose',       label: 'avmNose',        kind: 'shape', none: false, def: 'bulb',          opts: NOSES,       crop: [80, 94, 40] },
  { id: 'mouth',      label: 'avmMouth',       kind: 'shape', none: false, def: 'smile',         opts: MOUTHS,      crop: [74, 110, 52] },
  { id: 'expression', label: 'avmExpression',  kind: 'shape', none: false, def: 'neutral',       opts: EXPRESSIONS, crop: [38, 30, 124] },
  { id: 'glasses',    label: 'avmGlasses',     kind: 'shape', none: true,  def: 'none',          opts: GLASSES,     crop: [52, 62, 96], pNone: [0.7, 0.7] },
  { id: 'shoulder',   label: 'avmShoulder',    kind: 'shape', none: true,  def: 'none',          opts: SHOULDER,    crop: [116, 116, 80] },
  { id: 'ears',       label: 'avmEarrings',    kind: 'shape', none: true,  def: 'none',          opts: EARS,        crop: [30, 86, 40], pNone: [0.85, 0.45] },
  { id: 'hat',        label: 'avmHat',         kind: 'shape', none: true,  def: 'none',          opts: HATS,        crop: [16, 2, 168], pNone: [0.7, 0.75] },
  { id: 'badge',      label: 'avmBadge',       kind: 'shape', none: true,  def: 'none',          opts: BADGES,      crop: [6, 148, 48], pNone: [0.8, 0.8] }
];

export { AXES };
