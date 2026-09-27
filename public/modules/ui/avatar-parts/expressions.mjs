// Avatar parts — expressions and their overlays (2.1.9-web.209).
//
// An expression sets the brows, the eyes and the mouth in one go
// (`set`: part ids of those axes) and may add overlays (`fx`: ids of FX,
// drawn over the hat, under the badge). 'neutral' leaves the player's own
// brows / eyes / mouth. The studio hides the three rows while an
// expression is active; the table can also pass one at render time
// (avSvg(recipe, size, { expression: 'tilt' })) without touching the
// saved recipe.
//
// Adding an expression: an entry with a stable id, the three ids it sets
// (any part of face-parts.mjs) and the overlays it wants; a new overlay is
// an entry of FX with draw(ctx, r, L).

'use strict';
import { _suit } from './helpers.mjs';

function star(x, y, o, i, fill) {
  var d = '';
  for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? i : o; d += (k ? ' L' : 'M') + (x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1); }
  return '<path d="' + d + 'z" fill="' + fill + '"/>';
}

const FX = [
  { id: 'vein', draw: function () { // anger cross on the right temple
    return '<path d="M134 64 q4 -4 8 0 q4 4 8 0 M142 56 q4 4 0 8 q-4 4 0 8" stroke="#c0392b" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  } },
  { id: 'tear', draw: function () { // a tear under the left eye
    return '<path d="M74 110 Q69 119 74 124 Q79 119 74 110z" fill="#5fa8e8"/><circle cx="72.5" cy="117" r="1.2" fill="#fff" opacity=".8"/>';
  } },
  { id: 'sweat', draw: function () { // a drop at the right temple
    return '<path d="M146 60 Q140 71 146 76 Q152 71 146 60z" fill="#8fd0f5" stroke="#5fa8e8" stroke-width="1"/><circle cx="144.5" cy="68" r="1.2" fill="#fff" opacity=".8"/>';
  } },
  { id: 'zzz', draw: function () { // three Zs floating up on the right
    return '<path d="M148 42 L160 42 L148 54 L160 54" stroke="#4a6fa5" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<path d="M164 28 L173 28 L164 37 L173 37" stroke="#4a6fa5" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<path d="M176 14 L183 14 L176 21 L183 21" stroke="#4a6fa5" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  } },
  { id: 'hearts', draw: function () {
    return _suit(1, 152, 48, 7, '#e0405a') + _suit(1, 168, 30, 5, '#e87a90') + _suit(1, 36, 40, 4.5, '#e87a90');
  } },
  { id: 'stars', draw: function () {
    return star(152, 44, 9, 4, '#f2c94c') + star(170, 26, 6, 2.6, '#f2c94c') + star(38, 40, 6.5, 2.8, '#f2c94c');
  } },
  { id: 'dizzy', draw: function () { // little stars circling above the head
    return '<ellipse cx="100" cy="24" rx="46" ry="11" fill="none" stroke="#7d8594" stroke-width="1.4" stroke-dasharray="4 3" opacity=".7"/>'
      + star(56, 26, 5, 2.2, '#f2c94c') + star(100, 12, 5, 2.2, '#f2c94c') + star(144, 26, 5, 2.2, '#f2c94c');
  } }
];

const EXPRESSIONS = [
  { id: 'neutral', weight: 20 },
  { id: 'joy', weight: 0.5, set: { brows: 'raised', eyes: 'closed', mouth: 'laugh' } },
  { id: 'anger', weight: 0.35, set: { brows: 'angry', eyes: 'narrowed', mouth: 'gritted' }, fx: ['vein'] },
  { id: 'sadness', weight: 0.3, set: { brows: 'sad', eyes: 'round', mouth: 'frown' }, fx: ['tear'] },
  { id: 'surprise', weight: 0.35, set: { brows: 'raised', eyes: 'wide', mouth: 'small-o' } },
  { id: 'bluff', weight: 0.5, set: { brows: 'one-raised', eyes: 'side-glance', mouth: 'smirk' } },
  { id: 'tilt', weight: 0.3, set: { brows: 'angry', eyes: 'bloodshot', mouth: 'gritted' }, fx: ['vein', 'sweat'] },
  { id: 'sleep', weight: 0.25, set: { brows: 'neutral', eyes: 'shut', mouth: 'neutral' }, fx: ['zzz'] },
  { id: 'fear', weight: 0.3, set: { brows: 'worried', eyes: 'wide', mouth: 'wavy' }, fx: ['sweat'] },
  { id: 'love', weight: 0.3, set: { brows: 'raised', eyes: 'hearts', mouth: 'smile' }, fx: ['hearts'] },
  { id: 'win', weight: 0.4, set: { brows: 'raised', eyes: 'stars', mouth: 'grin' }, fx: ['stars'] },
  { id: 'ko', weight: 0.25, set: { brows: 'sad', eyes: 'x', mouth: 'wavy' }, fx: ['dizzy'] }
];

export { EXPRESSIONS, FX };
