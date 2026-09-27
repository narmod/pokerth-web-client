// Avatar parts — glasses, earrings / piercings, hats, badges, the retired
// shoulder accessories (2.1.9-web.209).
//
// Every part is { id, [sex], [weight], draw(ctx, r, L) }. Hats may also
// carry back(ctx, r, L) — a layer drawn BEHIND the hair and the head (the
// hood's dark inside) — and covers:true when the hat hides the hair above
// the hat line (the visor, bandana, hood and crown leave it). A hat built
// on the face outline returns a `data-fit` group: the engine then neither
// warps nor scales it.

'use strict';
import { _mix, _suit, _card, _earring, BROW_RING, _headScaled } from './helpers.mjs';

// ── Glasses ──────────────────────────────────────────────────────────────
var lens = ' fill="#fff" fill-opacity=".18"';
const GLASSES = [
  { id: 'none', draw: function () { return ''; } },
  { id: 'round', draw: function () {
    return '<circle cx="78" cy="98" r="14"' + lens + ' stroke="#2b2f36" stroke-width="3.2"/><circle cx="122" cy="98" r="14"' + lens + ' stroke="#2b2f36" stroke-width="3.2"/>'
      + '<path d="M92 96 Q100 92 108 96" stroke="#2b2f36" stroke-width="3" fill="none"/>';
  } },
  { id: 'rect', draw: function () {
    return '<rect x="62" y="88" width="32" height="21" rx="4"' + lens + ' stroke="#2b2f36" stroke-width="3.2"/><rect x="106" y="88" width="32" height="21" rx="4"' + lens + ' stroke="#2b2f36" stroke-width="3.2"/>'
      + '<path d="M94 96 L106 96" stroke="#2b2f36" stroke-width="3"/>';
  } },
  { id: 'cat-eye', sex: 1, draw: function () {
    return '<path d="M60 88 Q78 84 94 92 Q94 110 78 110 Q62 108 60 88z"' + lens + ' stroke="#8e2548" stroke-width="3.2" stroke-linejoin="round"/>'
      + '<path d="M140 88 Q122 84 106 92 Q106 110 122 110 Q138 108 140 88z"' + lens + ' stroke="#8e2548" stroke-width="3.2" stroke-linejoin="round"/>'
      + '<path d="M94 95 L106 95" stroke="#8e2548" stroke-width="3"/>';
  } },
  { id: 'gold-round', draw: function () {
    return '<circle cx="78" cy="98" r="13"' + lens + ' stroke="#d4a437" stroke-width="2.6"/><circle cx="122" cy="98" r="13"' + lens + ' stroke="#d4a437" stroke-width="2.6"/>'
      + '<path d="M91 96 Q100 92 109 96" stroke="#d4a437" stroke-width="2.4" fill="none"/>';
  } },
  { id: 'sunglasses', hidesEyec: true, draw: function () { // opaque lenses
    return '<rect x="61" y="87" width="33" height="21" rx="9" fill="#15171c"/><rect x="106" y="87" width="33" height="21" rx="9" fill="#15171c"/>'
      + '<path d="M94 95 L106 95" stroke="#15171c" stroke-width="3.4"/>'
      + '<path d="M67 93 L76 93 M112 93 L121 93" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>';
  } },
  // 2.1.9-web.204 — eye patch, monocle, mirrored aviators
  { id: 'eye-patch', weight: 0.3, draw: function () { // over the right eye, strap across the forehead
    return '<path d="M111 91 L58 67 M133 91 L152 84" stroke="#1b1b20" stroke-width="3" stroke-linecap="round"/>'
      + '<path d="M108 88 Q122 83 136 89 L135 107 Q122 113 109 107z" fill="#1b1b20"/>'
      + '<path d="M114 93 Q122 91 130 94" stroke="#44444c" stroke-width="1.4" fill="none" opacity=".9"/>';
  } },
  { id: 'monocle', sex: 0, weight: 0.4, draw: function () {
    return '<circle cx="122" cy="98" r="14"' + lens + ' stroke="#d4a437" stroke-width="2.6"/>'
      + '<path d="M133 107 Q144 120 138 136" stroke="#d4a437" stroke-width="1.6" fill="none" stroke-dasharray="2 1.6"/>';
  } },
  { id: 'aviators', hidesEyec: true, draw: function () { // mirrored teardrop lenses, gold frame
    var av = function (x0) { return 'M' + x0 + ' 90 Q' + (x0 + 16) + ' 85 ' + (x0 + 32) + ' 90 Q' + (x0 + 33) + ' 112 ' + (x0 + 16) + ' 114 Q' + (x0 + 1) + ' 112 ' + x0 + ' 90z'; };
    return '<path d="' + av(62) + '" fill="#6ea6dd"/><path d="' + av(106) + '" fill="#6ea6dd"/>'
      + '<path d="M67 107 L87 91 M111 107 L131 91" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>'
      + '<path d="' + av(62) + '" fill="none" stroke="#d4a437" stroke-width="1.8"/><path d="' + av(106) + '" fill="none" stroke="#d4a437" stroke-width="1.8"/>'
      + '<path d="M94 92 Q100 88 106 92 M60 88 L140 88" stroke="#d4a437" stroke-width="2" fill="none"/>';
  } }
];

// ── Earrings / piercings ─────────────────────────────────────────────────
// Earrings sit on the ear lobes, 6 px inside the outline (L.hw); `kind` is
// the _earring index the vignette reuses; `side` limits a hoop to one ear.
function ears(kind, side) {
  return function (ctx, r, L) {
    var xl = 100 - (L.hw || 53) + 6, xr = 200 - xl;
    if (side === 'left') return _earring(kind, xl - 1);
    if (side === 'right') return _earring(kind, xr + 1);
    return _earring(kind, xl - 1) + _earring(kind, xr + 1);
  };
}
const EARS = [
  { id: 'none', draw: function () { return ''; } },
  { id: 'pearl-studs', sex: 1, kind: 1, draw: ears(1) },
  { id: 'gold-studs', sex: 1, kind: 2, draw: ears(2) },
  { id: 'hoops', sex: 1, kind: 3, draw: ears(3) },
  { id: 'hoop-left', sex: 1, kind: 4, draw: ears(4, 'left') },
  { id: 'hoop-right', sex: 1, kind: 5, draw: ears(5, 'right') },
  // 2.1.9-web.206 — skull studs (both ears), eyebrow ring (right brow): shared with men
  { id: 'skull-studs', kind: 6, weight: 0.5, draw: ears(6) },
  { id: 'brow-ring', kind: 7, weight: 0.5, onBrow: true, draw: function () { return BROW_RING; } }
];

// ── Hats (drawn over the hair, fitted to the ear-level width) ────────────
function hoodHole(L) { return _headScaled(L.k || 0, 1.17, 1.15, 100, 108); }
const HATS = [
  { id: 'none', draw: function () { return ''; } },
  { id: 'cap', covers: true, draw: function (ctx) {
    return '<path d="M44 70 Q44 16 100 16 Q156 16 156 70z" fill="' + ctx.v('#c63b2e') + '"/>'
      + '<path d="M44 66 L178 64 Q182 76 152 76 L44 74z" fill="' + ctx.v('#a8302a') + '"/><circle cx="100" cy="18" r="5" fill="#a8302a"/>';
  } },
  { id: 'fedora', covers: true, draw: function (ctx) { // crown as wide as the skull (2.1.9-web.208)
    return '<ellipse cx="100" cy="67" rx="76" ry="12" fill="' + ctx.v('#3a3a42') + '"/>'
      + '<path d="M51 67 Q49 22 76 17 Q100 27 124 17 Q151 22 149 67z" fill="' + ctx.v('#4a4a54') + '"/>'
      + '<path d="M51 52 L149 52 L149 62 L51 62z" fill="#8e2632"/>';
  } },
  { id: 'visor', draw: function () { // dealer visor: leaves the hair
    return '<path d="M44 66 Q100 46 156 66 L156 74 Q100 56 44 74z" fill="#0f5a35"/>'
      + '<path d="M48 70 Q100 52 152 70 L166 88 Q100 66 34 88z" fill="#1f9e5c" opacity=".78"/>';
  } },
  { id: 'bowler', sex: 0, covers: true, draw: function (ctx) {
    return '<ellipse cx="100" cy="68" rx="66" ry="9" fill="' + ctx.v('#26262c') + '"/>'
      + '<path d="M50 68 Q50 14 100 14 Q150 14 150 68z" fill="' + ctx.v('#303038') + '"/><path d="M50 57 L150 57 L150 65 L50 65z" fill="#1a1a1f"/>';
  } },
  { id: 'panama', covers: true, draw: function (ctx) {
    return '<ellipse cx="100" cy="67" rx="78" ry="13" fill="' + ctx.v('#e9d9ae') + '"/>'
      + '<path d="M51 67 Q49 24 76 19 Q100 27 124 19 Q151 24 149 67z" fill="' + ctx.v('#f1e4c0') + '"/><path d="M51 52 L149 52 L149 62 L51 62z" fill="#26262c"/>';
  } },
  { id: 'bandana', draw: function (ctx) { // leaves the hair
    return '<path d="M44 72 Q100 44 156 72 L156 84 Q100 58 44 84z" fill="' + ctx.v('#c02a2a') + '"/>'
      + '<path d="M152 74 Q170 72 174 86 Q164 86 156 80 M154 78 Q166 90 162 100 Q156 92 152 84z" fill="#a02222"/>'
      + '<g fill="#fff" opacity=".75"><circle cx="70" cy="68" r="1.6"/><circle cx="90" cy="62" r="1.6"/><circle cx="110" cy="62" r="1.6"/><circle cx="130" cy="68" r="1.6"/></g>';
  } },
  { id: 'flat-cap', sex: 0, covers: true, draw: function (ctx) {
    return '<path d="M42 72 Q44 26 100 24 Q154 26 158 62 Q180 64 172 74 L42 76z" fill="' + ctx.v('#7d6a52') + '"/>'
      + '<path d="M44 70 L172 70" stroke="#5f4f3c" stroke-width="2"/>';
  } },
  { id: 'cap-back', covers: true, draw: function (ctx) { // backwards cap
    return '<path d="M20 50 Q40 40 60 46 L56 58 Q40 52 24 60z" fill="' + ctx.v('#2d6aa3') + '"/>'
      + '<path d="M44 72 Q44 16 100 16 Q156 16 156 72z" fill="' + ctx.v('#3a7cc0') + '"/>'
      + '<path d="M86 72 Q100 56 114 72z" fill="#245784"/>';
  } },
  { id: 'beanie', covers: true, draw: function (ctx) {
    return '<path d="M44 70 Q42 16 100 16 Q158 16 156 70z" fill="' + ctx.v('#8a2c44') + '"/>'
      + '<rect x="40" y="58" width="120" height="18" rx="9" fill="' + ctx.v('#9e3450') + '"/>'
      + '<path d="M54 60 L54 74 M66 60 L66 74 M78 60 L78 74 M90 60 L90 74 M102 60 L102 74 M114 60 L114 74 M126 60 L126 74 M138 60 L138 74 M150 60 L150 74" stroke="#7a263c" stroke-width="1.6"/>';
  } },
  // 2.1.9-web.205 — hood, stetson, top hat, spade cap, ace fedora, crown
  { id: 'hood', weight: 0.5, // hood up: its opening is the face outline grown (data-fit) — the hair shows inside, the hood lies on the shoulders round the chest
    back: function (ctx, r, L) { return '<path d="' + hoodHole(L) + '" fill="#1c1e23"/>'; }, // the hood's dark inside, behind the hair and the head
    draw: function (ctx, r, L) {
      var hole = hoodHole(L);
      return '<g data-fit="1"><path d="M18 200 Q14 116 38 58 Q56 12 100 8 Q144 12 162 58 Q186 116 182 200 L154 200 Q146 176 100 170 Q54 176 46 200z ' + hole + '" fill-rule="evenodd" fill="' + ctx.v('#2a2d33') + '"/>'
        + '<path d="' + hole + '" fill="none" stroke="#1c1e23" stroke-width="5" opacity=".55"/>'
        + '<path d="' + hole + '" fill="none" stroke="#3d414a" stroke-width="2.4"/>'
        + '<path d="M46 60 Q40 100 44 150 M154 60 Q160 100 156 150" stroke="#1c1e23" stroke-width="1.6" fill="none" opacity=".5"/>'
        + '<path d="M88 176 L84 198 M112 176 L116 198" stroke="#eef1f4" stroke-width="2.2" stroke-linecap="round"/></g>';
    } },
  { id: 'stetson', covers: true, draw: function (ctx) { // black, outlaw
    return '<path d="M20 78 Q100 100 180 78 Q166 66 140 64 L60 64 Q34 66 20 78z" fill="' + ctx.v('#1e1e22') + '"/>'
      + '<path d="M50 66 Q48 30 72 22 Q100 30 128 22 Q152 30 150 66z" fill="' + ctx.v('#26262c') + '"/>'
      + '<path d="M50 54 L150 54 L150 62 L50 62z" fill="#3b2f26"/><path d="M96 54 L104 54 L104 62 L96 62z" fill="#c9a24a"/>';
  } },
  { id: 'top-hat', sex: 0, covers: true, weight: 0.4, draw: function (ctx) {
    return '<ellipse cx="100" cy="68" rx="68" ry="9" fill="' + ctx.v('#1a1a1f') + '"/>'
      + '<path d="M52 68 L50 10 Q100 3 150 10 L148 68z" fill="' + ctx.v('#26262c') + '"/>'
      + '<path d="M51 55 L149 55 L149 64 L51 64z" fill="#8e2632"/>';
  } },
  { id: 'cap-spade', covers: true, draw: function (ctx) { // black cap with a spade logo
    return '<path d="M44 70 Q44 16 100 16 Q156 16 156 70z" fill="' + ctx.v('#1f1f24') + '"/>'
      + '<path d="M44 66 L178 64 Q182 76 152 76 L44 74z" fill="' + ctx.v('#16161a') + '"/><circle cx="100" cy="18" r="5" fill="#16161a"/>'
      + _suit(0, 100, 44, 9, '#f2eee6');
  } },
  { id: 'fedora-ace', covers: true, draw: function (ctx) { // an ace of spades tucked in the band
    return '<ellipse cx="100" cy="67" rx="76" ry="12" fill="' + ctx.v('#3a3a42') + '"/>'
      + '<path d="M51 67 Q49 22 76 17 Q100 27 124 17 Q151 22 149 67z" fill="' + ctx.v('#4a4a54') + '"/>'
      + '<path d="M51 52 L149 52 L149 62 L51 62z" fill="#1f1f24"/>'
      + '<g transform="rotate(-14 134 48)">' + _card(128, 34, 12, 0, false) + '</g>';
  } },
  // 2.1.9-web.211 (starter characters, lot 2) — headphones, witch hat, chef's toque, sailor cap, headset mic
  { id: 'headphones', draw: function (ctx) { // over the hair, cups on the ears — leaves the hair
    return '<path d="M48 98 Q44 28 100 24 Q156 28 152 98" stroke="' + ctx.v('#2a2d33') + '" stroke-width="6" fill="none"/>'
      + '<rect x="36" y="84" width="20" height="28" rx="8" fill="' + ctx.v('#2a2d33') + '"/><rect x="144" y="84" width="20" height="28" rx="8" fill="' + ctx.v('#2a2d33') + '"/>'
      + '<rect x="40" y="89" width="12" height="18" rx="5" fill="#4a4f5a"/><rect x="148" y="89" width="12" height="18" rx="5" fill="#4a4f5a"/>'
      + '<path d="M70 34 Q100 26 130 34" stroke="#5d626e" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>';
  } },
  { id: 'witch-hat', covers: true, line: 66, weight: 0.4, draw: function (ctx) { // wide brim, tall head-wide cone with concave sides, tip flopped to the right, purple band (redrawn web.212); line 66: the brim's ends sit low, the hair is hidden down to them
    return '<ellipse cx="100" cy="72" rx="82" ry="13" fill="' + ctx.v('#1c1526') + '"/>'
      + '<ellipse cx="100" cy="71" rx="77" ry="10.5" fill="' + ctx.v('#2b2135') + '"/>'
      // crown: the lower sides wrap the skull (outside the ±53 oval's top, y 36–61, by 3–8 px), then taper to the flopped tip
      + '<path d="M46 72 C50 50 66 34 86 22 Q90 8 104 4 Q126 2 132 20 Q124 10 112 11 Q110 14 114 22 C134 34 150 50 154 72z" fill="' + ctx.v('#2f2439') + '"/>'
      + '<path d="M92 10 Q100 6 112 11" stroke="#1c1526" stroke-width="1.6" fill="none" opacity=".5"/>'
      + '<path d="M49 61 L151 61 L154 72 L46 72z" fill="#6a2a8a"/><path d="M49 61 L151 61 L152 64 L48 64z" fill="#8a3ab0" opacity=".6"/>'
      + '<rect x="93" y="58" width="14" height="16" rx="2" fill="#e0b23c"/><rect x="97" y="62" width="6" height="8" rx="1" fill="#6a2a8a"/>';
  } },
  { id: 'chef-toque', covers: true, weight: 0.4, draw: function (ctx) { // white pleated toque
    return '<path d="M52 56 Q40 30 60 22 Q70 6 100 8 Q130 6 140 22 Q160 30 148 56z" fill="' + ctx.v('#f4f0e6') + '"/>'
      + '<path d="M72 20 L70 54 M86 12 L86 54 M100 10 L100 54 M114 12 L114 54 M128 20 L130 54" stroke="#d8d2c4" stroke-width="1.6" fill="none"/>'
      + '<rect x="50" y="52" width="100" height="18" rx="4" fill="' + ctx.v('#fbf8f2') + '"/><path d="M50 54 L150 54" stroke="#d8d2c4" stroke-width="1.4"/>';
  } },
  { id: 'sailor-cap', covers: true, weight: 0.4, draw: function (ctx) { // white « bachi », navy band, red pompom
    return '<path d="M44 70 Q44 24 100 22 Q156 24 156 70z" fill="' + ctx.v('#f4f0e6') + '"/>'
      + '<rect x="42" y="60" width="116" height="12" rx="3" fill="' + ctx.v('#1f2f4a') + '"/>'
      + '<circle cx="100" cy="22" r="7" fill="#c62828"/>';
  } },
  { id: 'headset-mic', draw: function (ctx) { // thin band, ear piece, boom mic at the mouth — leaves the hair
    return '<path d="M52 92 Q48 34 100 30 Q152 34 148 92" stroke="#2a2d33" stroke-width="3" fill="none"/>'
      + '<rect x="146" y="92" width="12" height="18" rx="5" fill="' + ctx.v('#2a2d33') + '"/>'
      + '<path d="M150 110 Q140 142 120 138" stroke="#2a2d33" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="119" cy="137" r="3.6" fill="#4a4f5a"/>';
  } },
  // 2.1.9-web.215 — balaclava: knitted hood over the whole head (grown outline, data-fit) with an eye slit; hides nose, mouth and beard
  { id: 'balaclava', covers: true, hideHair: true, weight: 0.3, draw: function (ctx, r, L) {
    var c = ctx.v('#23262d'), slit = 'M69 89 Q100 85 131 89 L131 105 Q100 107 69 105z';
    return '<g data-fit="1"><rect x="82" y="120" width="36" height="52" rx="10" fill="' + c + '"/>'
      + '<path d="' + _headScaled(L.k || 0, 1.12, 1.05, 100, 100) + ' ' + slit + '" fill-rule="evenodd" fill="' + c + '"/>'
      + '<path d="' + slit + '" fill="none" stroke="#3a3e47" stroke-width="2"/>'
      + '<path d="M70 70 Q100 62 130 70 M68 122 Q100 130 132 122" stroke="#2f333b" stroke-width="1.6" fill="none" opacity=".8"/></g>';
  } },
  { id: 'crown', weight: 0.3, draw: function (ctx) { // king of the table — sits on the hair, does not cover it
    return '<path d="M50 72 L48 36 L68 52 L84 26 L100 46 L116 26 L132 52 L152 36 L150 72z" fill="' + ctx.v('#e0b23c') + '"/>'
      + '<path d="M50 65 L150 65 L150 72 L50 72z" fill="#b8892a"/>'
      + '<circle cx="48" cy="36" r="3" fill="#c62828"/><circle cx="84" cy="26" r="3" fill="#2d6aa3"/><circle cx="116" cy="26" r="3" fill="#2d6aa3"/><circle cx="152" cy="36" r="3" fill="#c62828"/>'
      + '<circle cx="100" cy="58" r="3.5" fill="#2e8b57"/>';
  } }
];

// ── Badges (2.1.9-web.206): a poker token pinned in the bottom-left corner
var BX = 30, BY = 172;
const BADGES = [
  { id: 'none', draw: function () { return ''; } },
  { id: 'dealer', draw: function () { // dealer button
    var x = BX, y = BY;
    return '<circle cx="' + x + '" cy="' + y + '" r="14" fill="#f4f0e6" stroke="#c9a24a" stroke-width="2.4"/>'
      + '<path d="M' + (x - 4.5) + ' ' + (y - 6.5) + ' L' + (x - 4.5) + ' ' + (y + 6.5) + ' L' + (x + 0.5) + ' ' + (y + 6.5) + ' Q' + (x + 7.5) + ' ' + (y + 6.5) + ' ' + (x + 7.5) + ' ' + y + ' Q' + (x + 7.5) + ' ' + (y - 6.5) + ' ' + (x + 0.5) + ' ' + (y - 6.5) + 'z" fill="none" stroke="#1f1f24" stroke-width="2.6" stroke-linejoin="round"/>';
  } },
  { id: 'chip', draw: function () { // red chip
    var x = BX, y = BY, o = '';
    for (var k = 0; k < 6; k++) o += '<rect x="' + (x - 2.4) + '" y="' + (y - 14.5) + '" width="4.8" height="5" fill="#f2eee6" transform="rotate(' + (k * 60) + ' ' + x + ' ' + y + ')"/>';
    return '<circle cx="' + x + '" cy="' + y + '" r="14.5" fill="#c62828"/>' + o
      + '<circle cx="' + x + '" cy="' + y + '" r="9" fill="none" stroke="#f2eee6" stroke-width="1.4" stroke-dasharray="3 2"/>'
      + '<circle cx="' + x + '" cy="' + y + '" r="6" fill="#a81f1f"/>';
  } },
  { id: 'aces', draw: function () { // pair of aces
    var x = BX, y = BY;
    return '<g transform="rotate(-12 ' + x + ' ' + y + ')">' + _card(x - 13, y - 12, 15, 0, false) + '</g>'
      + '<g transform="rotate(10 ' + x + ' ' + y + ')">' + _card(x - 3, y - 12, 15, 1, true) + '</g>';
  } },
  { id: 'dice', draw: function () {
    var x = BX, y = BY;
    var die = function (cx, cy, rot, pips) {
      var d = '<rect x="' + (cx - 8) + '" y="' + (cy - 8) + '" width="16" height="16" rx="3" fill="#f4f0e6" stroke="#b9b3a8" stroke-width=".8"/>';
      pips.forEach(function (q) { d += '<circle cx="' + (cx + q[0]) + '" cy="' + (cy + q[1]) + '" r="1.6" fill="#1f1f24"/>'; });
      return '<g transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')">' + d + '</g>';
    };
    return die(x - 7, y + 3, -15, [[-4, -4], [0, 0], [4, 4]]) + die(x + 9, y - 3, 12, [[-4, -4], [4, -4], [-4, 4], [4, 4], [0, 0]]);
  } },
  { id: 'stack', draw: function () { // chip stack
    var x = BX, y = BY, o = '', cols = ['#2d6aa3', '#c62828', '#2e8b57', '#1f1f24'];
    for (var j = 0; j < 4; j++) {
      var cy = y + 9 - j * 5, col = cols[j];
      o += '<ellipse cx="' + x + '" cy="' + cy + '" rx="14" ry="5.5" fill="' + _mix(col, 0.75) + '"/><ellipse cx="' + x + '" cy="' + (cy - 2) + '" rx="14" ry="5.5" fill="' + col + '"/>'
        + '<path d="M' + (x - 14) + ' ' + (cy - 2) + ' L' + (x - 14) + ' ' + cy + ' M' + (x + 14) + ' ' + (cy - 2) + ' L' + (x + 14) + ' ' + cy + ' M' + (x - 5) + ' ' + (cy + 3) + ' L' + (x - 5) + ' ' + (cy + 5) + ' M' + (x + 5) + ' ' + (cy + 3) + ' L' + (x + 5) + ' ' + (cy + 5) + '" stroke="#f2eee6" stroke-width="1.6"/>';
    }
    return o + '<ellipse cx="' + x + '" cy="' + (y - 8) + '" rx="8.5" ry="3.2" fill="none" stroke="#f2eee6" stroke-width="1.2" opacity=".85"/>';
  } }
];

// Shoulder accessories were retired with the toon style: only 'none' is
// left (the row hides itself), old recipes fall back to it.
const SHOULDER = [{ id: 'none', draw: function () { return ''; } }];

export { GLASSES, EARS, HATS, BADGES, SHOULDER };
