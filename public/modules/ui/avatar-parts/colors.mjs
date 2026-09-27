// Avatar parts — colour axes: skin tones, hair colours, eye colours,
// outfit colours, backdrops (2.1.9-web.209).
//
// A colour part is { id, colors: [...], [swatch], [weight] } — colors holds
// what the drawings use ([base, shadow] for skins, [base, highlight] for
// hair, [base, glow] for backdrops, one hex for eyes and outfits), swatch
// the CSS background of the studio chip (defaults to colors[0]). A
// backdrop may add pattern(ctx): SVG drawn over its gradient. Ids are
// stable: they are what saved portraits store.

'use strict';
import { _mix, _suit } from './helpers.mjs';

// Seven skin tones, light → dark (2.1.9-web.207: on the darkest of the
// former ten the scars, bruises and tattoos vanished). 'light' is the default.
const SKINS = [
  { id: 'porcelain', colors: ['#fff0e3', '#f3d6c1'] },
  { id: 'light', colors: ['#f7c9a2', '#e5aa80'] },
  { id: 'medium', colors: ['#eeb987', '#d99c69'] },
  { id: 'tan', colors: ['#d99d6c', '#c08253'] },
  { id: 'brown', colors: ['#b87a4b', '#9c6238'] },
  { id: 'dark', colors: ['#8d5a35', '#724426'] },
  { id: 'deep', colors: ['#75482a', '#5c3618'] }
];

// [base, highlight]; fantasy colours (blue, pink) keep dark-brown brows
// and beards (natural: 'dark-brown').
const HAIRCS = [
  { id: 'black', colors: ['#2b2118', '#4d3d2f'] },
  { id: 'dark-brown', colors: ['#4a3222', '#6f4f37'] },
  { id: 'brown', colors: ['#7a5530', '#a07848'] },
  { id: 'auburn', colors: ['#b14a22', '#d8703f'] },
  { id: 'blonde', colors: ['#dcae50', '#f3d68b'] },
  { id: 'grey', colors: ['#a9a9a9', '#d4d4d4'] },
  { id: 'light-blonde', colors: ['#ecd7a2', '#fff3cf'] },
  { id: 'white', colors: ['#eeeeee', '#ffffff'] },
  { id: 'light-brown', colors: ['#9c7b52', '#c2a075'] },
  { id: 'light-red', colors: ['#d2874f', '#eeae7c'] },
  { id: 'blue', colors: ['#3b6fd6', '#6f9af0'], fantasy: true, weight: 0.25 },
  { id: 'pink', colors: ['#e88ac2', '#f8bfe0'], fantasy: true, weight: 0.25 }
];

const EYECS = [
  { id: 'brown', colors: ['#6b4526'] },
  { id: 'blue', colors: ['#3a7bb5'] },
  { id: 'green', colors: ['#3f8a4a'] },
  { id: 'grey', colors: ['#6b7078'] },
  { id: 'hazel', colors: ['#9a7236'] },
  { id: 'black', colors: ['#2a1c12'] }
];

// Outfit colours: 'auto' keeps the garment as drawn; the others apply to
// the colourable garments.
const OUTFITCS = [
  { id: 'auto', colors: [null], swatch: '#888' },
  { id: 'red', colors: ['#c0392b'] },
  { id: 'blue', colors: ['#2d6aa3'] },
  { id: 'green', colors: ['#2e8b57'] },
  { id: 'yellow', colors: ['#e6b422'] },
  { id: 'purple', colors: ['#8e44ad'] },
  { id: 'black', colors: ['#1f1f24'] },
  { id: 'white', colors: ['#f2f2f2'] },
  { id: 'pink', colors: ['#e07aa0'] }
];

// Backdrops: [base, centre glow] pastels, then (2.1.9-web.206) the poker
// felts drawn over their gradient by pattern(ctx). The dice always lands
// on 'white'.
const BGS = [
  { id: 'green', colors: ['#b9dfbe', '#e2f4e4'] },
  { id: 'blue', colors: ['#b7cff0', '#e1ecfb'] },
  { id: 'pink', colors: ['#f2bcc0', '#fbe2e3'] },
  { id: 'purple', colors: ['#d3c1ef', '#ede4fa'] },
  { id: 'grey', colors: ['#d2d6dc', '#eef0f2'] },
  { id: 'teal', colors: ['#b0ded8', '#dff3f0'] },
  { id: 'peach', colors: ['#efcfa9', '#faeadb'] },
  { id: 'white', colors: ['#ffffff', '#ffffff'] },
  { id: 'offwhite', colors: ['#e9edf2', '#fafbfc'] },
  { id: 'cream', colors: ['#f8eac0', '#fff9e8'] },
  { id: 'sky', colors: ['#cae0f4', '#eaf3fb'] },
  { id: 'felt-green', colors: ['#1f6b42', '#2f8f5a'], weight: 0.6,
    swatch: 'radial-gradient(circle at 68% 68%, #d33 0 20%, #fff 21% 26%, transparent 27%), linear-gradient(#2f8f5a, #1f6b42)',
    pattern: function () { // chip stack in the bottom-right corner (beside the shoulder)
      var o = '';
      for (var k = 0; k < 5; k++) {
        var cy = 182 - k * 5, col = k % 2 ? '#f2eee6' : '#c62828';
        o += '<ellipse cx="176" cy="' + cy + '" rx="14" ry="5.5" fill="' + _mix(col, 0.8) + '"/>'
          + '<ellipse cx="176" cy="' + (cy - 2) + '" rx="14" ry="5.5" fill="' + col + '"/>';
      }
      return o + '<ellipse cx="176" cy="160" rx="9" ry="3.4" fill="none" stroke="#f2eee6" stroke-width="1.2" opacity=".8"/>';
    } },
  { id: 'felt-burgundy', colors: ['#4d1420', '#7a1f2e'], weight: 0.6,
    swatch: 'radial-gradient(circle at 50% 50%, #e0b23c 0 18%, transparent 19%), linear-gradient(#7a1f2e, #4d1420)',
    pattern: function () { // gold suits scattered on the felt
      var o = '';
      for (var gy = 22; gy <= 190; gy += 30) for (var gx = ((gy / 30) % 2 ? 22 : 37); gx <= 190; gx += 30) o += _suit(((gx + gy) / 15) % 4 | 0, gx, gy, 6, '#e0b23c');
      return '<g opacity=".3">' + o + '</g>';
    } },
  { id: 'card-back', colors: ['#b32236', '#c9364a'], weight: 0.5,
    swatch: 'repeating-linear-gradient(45deg, #b32236 0 3px, #d84a5c 3px 6px)',
    pattern: function (ctx) { // white margin, lattice inside
      var o = '', id = ctx.cid + 'cb';
      ctx.defs.push('<clipPath id="' + id + '"><rect x="14" y="14" width="172" height="172" rx="6"/></clipPath>');
      for (var k = -200; k <= 200; k += 14) o += '<path d="M' + k + ' 6 L' + (k + 200) + ' 206 M' + (k + 200) + ' 6 L' + k + ' 206"/>';
      return '<rect x="6" y="6" width="188" height="188" fill="#fff"/><rect x="14" y="14" width="172" height="172" rx="6" fill="#b32236"/>'
        + '<g clip-path="url(#' + id + ')" stroke="#e8707f" stroke-width="1.6" opacity=".7">' + o + '</g>'
        + '<rect x="18" y="18" width="164" height="164" rx="5" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/>';
    } },
  { id: 'neon', colors: ['#2b1250', '#6a2aa0'], weight: 0.5,
    swatch: 'linear-gradient(135deg, #3b1d6e, #8e2bb5 60%, #ff4fd8)',
    pattern: function () { // casino neon: glowing lines
      return '<path d="M6 30 L194 30" stroke="#ff4fd8" stroke-width="6" opacity=".25"/><path d="M6 30 L194 30" stroke="#ff9cf0" stroke-width="1.8"/>'
        + '<path d="M6 44 L194 44" stroke="#3fe0ff" stroke-width="6" opacity=".2"/><path d="M6 44 L194 44" stroke="#9cf0ff" stroke-width="1.6"/>'
        + '<path d="M6 190 Q100 150 194 190" stroke="#ff4fd8" stroke-width="10" opacity=".18" fill="none"/>';
    } }
];

export { SKINS, HAIRCS, EYECS, OUTFITCS, BGS };
