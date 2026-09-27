// Avatar parts — eyes, eyebrows, noses, mouths, skin marks, beards
// (2.1.9-web.209).
//
// Every part is { id, [sex], [weight], draw(ctx, r, L) } — L carries the
// palette and the landmarks: L.fem, L.k (face key), L.hw (ear-level
// half-width), L.pts (FACE_PTS row), L.skin [base, shadow], L.hc [base,
// highlight], L.hcN (natural hair colour for brows and beards), L.ec (iris
// colour). Ids are stable: they are what saved portraits store.

'use strict';
import { _mix, EYE_LINE, _eye, _closed, _headClip, _beardMask, _facePts } from './helpers.mjs';

// ── Eyes ─────────────────────────────────────────────────────────────────
// Each shape draws both eyes (L = 78, R = 122, y = 98); `lashes` says which
// outer corners get lashes on the feminine silhouette ('both', 'left',
// 'right'); hidesEyec hides the eye-colour row (no iris to colour).
var L_ = 78, R_ = 122, Y_ = 98;
function heavyLids(ec, skin, narrowed, dx) {
  return [L_, R_].map(function (x, k) {
    var y = Y_;
    var lid = !narrowed
      ? 'M' + (x - 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 1) + ' Q' + x + ' ' + (y + 2) + ' ' + (x - 11) + ' ' + (y - 1) + 'z'
      : (k === 0
        ? 'M' + (x - 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 1) + ' L' + (x - 11) + ' ' + (y - 6) + 'z'
        : 'M' + (x - 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 6) + ' L' + (x - 11) + ' ' + (y - 1) + 'z');
    var edge = !narrowed
      ? 'M' + (x - 9) + ' ' + (y - 1) + ' Q' + x + ' ' + (y + 2) + ' ' + (x + 9) + ' ' + (y - 1)
      : (k === 0 ? 'M' + (x - 9) + ' ' + (y - 5.5) + ' L' + (x + 9) + ' ' + (y - 1.5) : 'M' + (x - 9) + ' ' + (y - 1.5) + ' L' + (x + 9) + ' ' + (y - 5.5));
    return _eye(x, y, ec) + '<path d="' + lid + '" fill="' + skin[0] + '"/>'
      + '<path d="' + edge + '" stroke="' + EYE_LINE + '" stroke-width="3.4" stroke-linecap="round" fill="none"/>';
  }).join('');
}
const EYES = [
  { id: 'round', lashes: 'both', draw: function (ctx, r, L) { return _eye(L_, Y_, L.ec) + _eye(R_, Y_, L.ec); } },
  { id: 'almond', lashes: 'both', draw: function (ctx, r, L) {
    return [L_, R_].map(function (x) {
      var y = Y_, ec = L.ec;
      return '<path d="M' + (x - 10) + ' ' + y + ' Q' + x + ' ' + (y - 11) + ' ' + (x + 10) + ' ' + y + ' Q' + x + ' ' + (y + 8) + ' ' + (x - 10) + ' ' + y + 'z" fill="#fff" stroke="' + EYE_LINE + '" stroke-width="1.4"/>'
        + '<circle cx="' + x + '" cy="' + y + '" r="5" fill="' + ec + '"/><circle cx="' + x + '" cy="' + y + '" r="2.7" fill="#15100b"/>'
        + '<circle cx="' + (x + 2) + '" cy="' + (y - 2) + '" r="1.6" fill="#fff"/>'
        + '<path d="M' + (x - 10) + ' ' + y + ' Q' + x + ' ' + (y - 12) + ' ' + (x + 10) + ' ' + y + '" stroke="' + EYE_LINE + '" stroke-width="3" stroke-linecap="round" fill="none"/>';
    }).join('');
  } },
  { id: 'closed', lashes: null, hidesEyec: true, draw: function () { return _closed(L_, Y_) + _closed(R_, Y_); } }, // closed, smiling (no lashes: the lids are the lash line)
  { id: 'wink', lashes: 'left', draw: function (ctx, r, L) { return _eye(L_, Y_, L.ec) + _closed(R_, Y_); } }, // left open, right closed
  { id: 'wide', lashes: 'both', draw: function (ctx, r, L) { return _eye(L_, Y_, L.ec, 9.5, 11, 4.4) + _eye(R_, Y_, L.ec, 9.5, 11, 4.4); } }, // surprised
  { id: 'heavy', lashes: 'both', draw: function (ctx, r, L) { return heavyLids(L.ec, L.skin, false); } }, // heavy-lidded
  { id: 'narrowed', lashes: 'both', draw: function (ctx, r, L) { return heavyLids(L.ec, L.skin, true); } }, // determined
  // 2.1.9-web.206 — scarred shut eye, bloodshot, side glance
  { id: 'scarred', lashes: 'right', weight: 0.3, draw: function (ctx, r, L) {
    return '<path d="M70 98 L86 98" stroke="' + EYE_LINE + '" stroke-width="3.8" stroke-linecap="round"/>'
      + '<path d="M73 84 L83 112" stroke="#f6d3d0" stroke-width="3" stroke-linecap="round"/><path d="M74 90 L79 89 M77 100 L82 99" stroke="#f6d3d0" stroke-width="1.6" stroke-linecap="round"/>'
      + _eye(R_, Y_, L.ec);
  } },
  { id: 'bloodshot', lashes: 'both', weight: 0.35, draw: function (ctx, r, L) {
    return [L_, R_].map(function (x) {
      var y = Y_;
      return _eye(x, y, L.ec, 8, 9.5, 5.4, '#f3d4d4')
        + '<path d="M' + (x - 7) + ' ' + (y + 3) + ' L' + (x - 3) + ' ' + (y + 1) + ' M' + (x + 3) + ' ' + (y + 4) + ' L' + (x + 7) + ' ' + (y + 2) + ' M' + (x - 6) + ' ' + (y - 3) + ' L' + (x - 3) + ' ' + (y - 2) + '" stroke="#c0392b" stroke-width=".9" stroke-linecap="round"/>'
        + '<path d="M' + (x - 7) + ' ' + (y + 11) + ' Q' + x + ' ' + (y + 15) + ' ' + (x + 7) + ' ' + (y + 11) + '" stroke="#5a3a4a" stroke-width="3" fill="none" opacity=".3"/>';
    }).join('');
  } },
  { id: 'side-glance', lashes: 'both', weight: 0.6, draw: function (ctx, r, L) {
    return [L_, R_].map(function (x) {
      var y = Y_;
      return _eye(x, y, L.ec, 8, 9.5, 5.4, null, 3.5)
        + '<path d="M' + (x - 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 2) + ' Q' + x + ' ' + (y + 1) + ' ' + (x - 11) + ' ' + (y - 2) + 'z" fill="' + L.skin[0] + '"/>'
        + '<path d="M' + (x - 9) + ' ' + (y - 2) + ' Q' + x + ' ' + (y + 1) + ' ' + (x + 9) + ' ' + (y - 2) + '" stroke="' + EYE_LINE + '" stroke-width="3.4" stroke-linecap="round" fill="none"/>';
    }).join('');
  } },
  // 2.1.9-web.209 — expression shapes: shut (flat lids), hearts, stars, crossed
  { id: 'shut', lashes: null, hidesEyec: true, weight: 0.2, draw: function () {
    return '<path d="M70 99 L86 99 M114 99 L130 99" stroke="' + EYE_LINE + '" stroke-width="3.8" stroke-linecap="round"/>';
  } },
  { id: 'hearts', lashes: 'both', hidesEyec: true, weight: 0.2, draw: function () {
    return [L_, R_].map(function (x) {
      var y = Y_ + 1, s = 9;
      return '<path d="M' + x + ' ' + (y + s) + ' Q' + (x - s * 1.2) + ' ' + (y + s * 0.2) + ' ' + (x - s) + ' ' + (y - s * 0.3) + ' Q' + (x - s) + ' ' + (y - s) + ' ' + (x - s * 0.5) + ' ' + (y - s) + ' Q' + x + ' ' + (y - s) + ' ' + x + ' ' + (y - s * 0.4) + ' Q' + x + ' ' + (y - s) + ' ' + (x + s * 0.5) + ' ' + (y - s) + ' Q' + (x + s) + ' ' + (y - s) + ' ' + (x + s) + ' ' + (y - s * 0.3) + ' Q' + (x + s * 1.2) + ' ' + (y + s * 0.2) + ' ' + x + ' ' + (y + s) + 'z" fill="#e0405a"/>'
        + '<circle cx="' + (x - 3) + '" cy="' + (y - 4) + '" r="1.6" fill="#fff" opacity=".8"/>';
    }).join('');
  } },
  { id: 'stars', lashes: 'both', hidesEyec: true, weight: 0.2, draw: function () {
    return [L_, R_].map(function (x) {
      var y = Y_ + 1, o = 9, i = 4, d = '', k;
      for (k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? i : o; d += (k ? ' L' : 'M') + (x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1); }
      return '<path d="' + d + 'z" fill="#f2c94c" stroke="#d9a520" stroke-width="1"/>';
    }).join('');
  } },
  { id: 'x', lashes: 'both', hidesEyec: true, weight: 0.2, draw: function () {
    return [L_, R_].map(function (x) {
      var y = Y_;
      return '<path d="M' + (x - 7) + ' ' + (y - 7) + ' L' + (x + 7) + ' ' + (y + 7) + ' M' + (x + 7) + ' ' + (y - 7) + ' L' + (x - 7) + ' ' + (y + 7) + '" stroke="' + EYE_LINE + '" stroke-width="3.6" stroke-linecap="round"/>';
    }).join('');
  } }
];
// Lashes on the outer corners, feminine silhouette only.
function lashes(which) {
  var l = 'M69 93 L64 89 M71 90 L67 85', r = 'M131 93 L136 89 M129 90 L133 85';
  var d = which === 'left' ? l : which === 'right' ? r : l + ' ' + r;
  return '<path d="' + d + '" stroke="' + EYE_LINE + '" stroke-width="2" stroke-linecap="round"/>';
}

// ── Eyebrows (axis 'brows', 2.1.9-web.204) — in the hair colour ──────────
function brow(d, wM, wF) {
  return function (ctx, r, L) {
    var w = L.fem ? (wF || 4) : (wM || 5.4);
    return '<path d="' + d + '" stroke="' + L.hcN[0] + '" stroke-width="' + w + '" stroke-linecap="round" fill="none"/>';
  };
}
const BROWS = [
  { id: 'neutral', draw: brow('M68 80 Q78 74 88 79 M112 79 Q122 74 132 80') },
  { id: 'angry', weight: 0.5, draw: brow('M68 75 Q80 77 90 84 M110 84 Q120 77 132 75') },            // V: inner ends down on the lids
  { id: 'one-raised', weight: 0.6, draw: brow('M68 80 Q78 74 88 79 M112 75 Q122 65 132 74') },       // sceptical
  { id: 'thick', weight: 0.5, draw: brow('M66 83 Q78 79 90 83 M110 83 Q122 79 134 83', 7.2, 5.5) },  // low and thick (brute)
  { id: 'thin-arched', sex: 1, weight: 0.6, draw: brow('M68 79 Q80 66 90 78 M110 78 Q120 66 132 79', 2.6, 2.6) },
  // 2.1.9-web.209 — expression shapes
  { id: 'raised', weight: 0.4, draw: brow('M68 74 Q78 66 88 72 M112 72 Q122 66 132 74') },          // both up (joy, surprise)
  { id: 'sad', weight: 0.3, draw: brow('M68 83 Q78 80 90 75 M110 75 Q122 80 132 83') },             // inner ends up (sadness)
  { id: 'worried', weight: 0.3, draw: brow('M68 78 Q78 72 90 70 M110 70 Q122 72 132 78') }          // inner ends up and raised (fear)
];

// ── Noses — solid Mii-like shapes in the skin shadow ─────────────────────
function nose(fn) { return function (ctx, r, L) { return fn(L.skin[1], _mix(L.skin[1], 0.88)); }; }
const NOSES = [
  { id: 'bulb', draw: nose(function (sh) { return '<path d="M97 104 Q92 115 95 118 Q100 121 105 118 Q108 115 103 104z" fill="' + sh + '"/>'; }) },
  { id: 'long', draw: nose(function (sh) { return '<path d="M98 98 L95 116 Q100 121 105 116 L102 98z" fill="' + sh + '"/>'; }) },
  { id: 'button', draw: nose(function (sh) { return '<circle cx="100" cy="114" r="5.5" fill="' + sh + '"/><circle cx="98" cy="112" r="1.6" fill="#fff" opacity=".35"/>'; }) },
  { id: 'wide', draw: nose(function (sh, dk) { return '<path d="M89 112 Q100 104 111 112 Q113 121 100 122 Q87 121 89 112z" fill="' + sh + '"/>' + '<circle cx="93" cy="116" r="1.8" fill="' + dk + '"/><circle cx="107" cy="116" r="1.8" fill="' + dk + '"/>'; }) },
  { id: 'aquiline', draw: nose(function (sh) { return '<path d="M99 98 Q112 110 105 119 Q100 122 95 118 Q99 110 99 98z" fill="' + sh + '"/>'; }) }
];

// ── Mouths — filled Mii-like shapes (mouth dark + lower lip) ─────────────
var M_ = '#5e2521', LIP_ = '#e4837c', TEETH_ = '#fff';
function line(d) { return '<path d="' + d + '" stroke="' + M_ + '" stroke-width="4" stroke-linecap="round" fill="none"/>'; }
var GRIN = '<path d="M82 126 Q100 129 118 126 Q116 150 100 150 Q84 150 82 126z" fill="' + M_ + '"/>'
  + '<path d="M85 127 Q100 130 115 127 Q114 136 100 137 Q86 136 85 127z" fill="' + TEETH_ + '"/>';
var GRIN_LIP = '<path d="M90 141 Q100 148 110 141 Q100 147 90 141z" fill="' + LIP_ + '"/>';
const MOUTHS = [
  { id: 'smile', draw: function () { return '<path d="M84 127 Q100 151 116 127 Q100 137 84 127z" fill="' + M_ + '"/>' + '<path d="M90 133 Q100 143 110 133 Q100 139 90 133z" fill="' + LIP_ + '"/>'; } },
  { id: 'grin', draw: function () { return GRIN + GRIN_LIP; } }, // wide grin with teeth
  { id: 'neutral', draw: function () { return line('M89 133 L111 133'); } },
  { id: 'lipstick', sex: 1, draw: function () {
    return '<path d="M85 131 Q92 123 100 129 Q108 123 115 131 Q108 145 100 145 Q92 145 85 131z" fill="#d8304e"/>'
      + '<path d="M86 131 Q100 135 114 131" stroke="#a1203a" stroke-width="1.5" fill="none"/>'
      + '<path d="M94 139 Q100 142 106 139" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".45"/>';
  } },
  { id: 'smirk', draw: function () { return '<path d="M86 133 Q100 141 116 126 Q104 137 86 133z" fill="' + M_ + '"/>'; } },
  { id: 'pout', sex: 1, draw: function () { return '<ellipse cx="100" cy="134" rx="6.5" ry="5" fill="#c8635f"/><path d="M95 134 Q100 136 105 134" stroke="#8e3a3a" stroke-width="1.5" fill="none"/>'; } }, // pout / kiss
  { id: 'laugh', draw: function () {
    return '<path d="M82 126 Q100 124 118 126 Q118 154 100 154 Q82 154 82 126z" fill="' + M_ + '"/>'
      + '<path d="M84 127 L116 127 L115 132 L85 132z" fill="' + TEETH_ + '"/>'
      + '<path d="M90 143 Q100 135 110 143 Q108 154 100 154 Q92 154 90 143z" fill="#ef6f75"/>';
  } }, // open laugh
  { id: 'small-o', sex: 1, draw: function () { return '<ellipse cx="100" cy="134" rx="5" ry="6.5" fill="' + M_ + '"/>'; } }, // surprise
  { id: 'frown', draw: function () { return '<path d="M86 139 Q100 123 114 139 Q100 133 86 139z" fill="' + M_ + '"/>'; } },
  { id: 'tongue', draw: function () {
    return line('M89 131 L111 131')
      + '<path d="M94 132 L106 132 Q107 146 100 146 Q93 146 94 132z" fill="#ef6f75"/><path d="M100 136 L100 144" stroke="#c94d58" stroke-width="1.2"/>';
  } },
  { id: 'cigar', sex: 0, weight: 0.35, draw: function () {
    return line('M89 133 L109 133')
      + '<path d="M106 133 L124 138" stroke="#5a3a22" stroke-width="6.5" stroke-linecap="round"/>'
      + '<path d="M113 134.8 L116 135.6" stroke="#d9b26b" stroke-width="6.5"/>'
      + '<circle cx="124.5" cy="138.2" r="2.8" fill="#ff6a2a"/><circle cx="124.5" cy="138.2" r="1.3" fill="#ffd27a"/>'
      + '<path d="M126 132 Q130 128 127 123" stroke="#c8c8c8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>';
  } },
  // 2.1.9-web.204 — sneer, gritted teeth
  { id: 'sneer', weight: 0.5, draw: function () { return line('M86 136 Q100 138 114 128') + '<path d="M107 130 L111 137 L113 129z" fill="' + TEETH_ + '"/>'; } },
  { id: 'gritted', weight: 0.4, draw: function () {
    return '<path d="M84 128 Q100 125 116 128 Q116 141 100 142 Q84 141 84 128z" fill="' + M_ + '"/>'
      + '<rect x="87" y="130" width="26" height="8" rx="2" fill="' + TEETH_ + '"/>'
      + '<path d="M93 130 L93 138 M100 130 L100 138 M107 130 L107 138 M87 134 L113 134" stroke="#c9c2b4" stroke-width="1.2"/>';
  } },
  // 2.1.9-web.206 — toothpick, gold tooth
  { id: 'toothpick', weight: 0.5, draw: function () {
    return line('M89 133 L109 133')
      + '<path d="M106 132.5 L128 126" stroke="#e8d9b0" stroke-width="2.4" stroke-linecap="round"/><path d="M106 132.5 L128 126" stroke="#b9a476" stroke-width=".8" stroke-linecap="round"/>';
  } },
  { id: 'gold-tooth', weight: 0.4, draw: function () {
    return GRIN + '<path d="M103 128.5 L108 128.5 L107.5 135.5 L103.5 136z" fill="#e0b23c"/><path d="M104 130 L106.5 130" stroke="#fff" stroke-width=".9" opacity=".8"/>' + GRIN_LIP;
  } },
  // 2.1.9-web.209 — expression shape: wavy (fear, KO)
  { id: 'wavy', weight: 0.2, draw: function () { return line('M87 134 Q92 128 97 134 Q100 138 103 134 Q108 128 113 134'); } }
];

// ── Skin marks ───────────────────────────────────────────────────────────
const MARKS = [
  { id: 'none', draw: function () { return ''; } },
  { id: 'freckles', draw: function (ctx, r, L) {
    var d = '';
    [[64, 110], [70, 114], [76, 110], [124, 110], [130, 114], [136, 110], [70, 106], [130, 106]].forEach(function (p) {
      d += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.5" fill="' + _mix(L.skin[1], 0.8) + '"/>';
    });
    return d;
  } },
  { id: 'beauty-mark', sex: 1, draw: function () { return '<circle cx="124" cy="124" r="2.2" fill="#3a2418"/>'; } },
  { id: 'age-lines', draw: function (ctx, r, L) { return '<path d="M86 66 Q100 62 114 66 M90 71 Q100 68 110 71 M60 96 L55 94 M60 101 L55 102 M140 96 L145 94 M140 101 L145 102" stroke="' + _mix(L.skin[1], 0.85) + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>'; } },
  { id: 'brow-scar', draw: function () { return '<path d="M124 72 L130 86" stroke="#f6d3d0" stroke-width="3" stroke-linecap="round"/>'; } },
  { id: 'dimples', draw: function (ctx, r, L) { return '<path d="M80 130 Q82 134 80 137 M120 130 Q118 134 120 137" stroke="' + _mix(L.skin[1], 0.85) + '" stroke-width="2" fill="none" stroke-linecap="round"/>'; } },
  { id: 'cheek-scar', sex: 0, draw: function () { return '<path d="M132 104 L138 124" stroke="#f6d3d0" stroke-width="3" stroke-linecap="round"/><path d="M131 110 L136 109 M133 116 L138 115" stroke="#f6d3d0" stroke-width="1.6" stroke-linecap="round"/>'; } },
  // 2.1.9-web.204 — nose-bridge scar, black eye, tribal temple tattoo (placed from the outline's ear-level width)
  { id: 'nose-scar', draw: function () { return '<path d="M95 91 L105 96" stroke="#f6d3d0" stroke-width="3" stroke-linecap="round"/><path d="M98 90 L97 95 M102 93 L101 98" stroke="#f6d3d0" stroke-width="1.6" stroke-linecap="round"/>'; } },
  { id: 'black-eye', weight: 0.4, draw: function () { return '<ellipse cx="78" cy="101" rx="16" ry="14" fill="#b8a13a" opacity=".2"/><ellipse cx="78" cy="101" rx="13.5" ry="11.5" fill="#6a3d8f" opacity=".38"/>'; } },
  { id: 'tattoo-temple', weight: 0.5, draw: function (ctx, r, L) {
    var b = 100 + (L.hw || 53) - 4;
    return '<path d="M' + (b - 10) + ' 66 Q' + (b + 2) + ' 78 ' + (b - 8) + ' 92 M' + (b - 5) + ' 72 Q' + (b + 3) + ' 82 ' + (b - 3) + ' 90" stroke="#2a2f3a" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  } }
];

// ── Beard / moustache (drawn under the mouth) ────────────────────────────
// Jaw beards are the lower part of the HEAD SHAPE itself (clipped to the
// face outline, grown a little so they overhang the jaw); their cheek line
// comes from the landmarks (_beardMask). Moustache and goatee are local;
// the goatee hangs from the chin landmark. The axis is masculine-only.
function beardDraw(fn) {
  return function (ctx, r, L) {
    var hc = L.hcN, f = ctx.v(hc[0]), p = _facePts(L.k), chin = p[6], w = p[5] + 6, dy = chin - 153;
    var MOUS = '<path d="M82 124 Q92 116 100 121 Q108 116 118 124 Q116 131 106 127 Q100 126 94 127 Q84 131 82 124z" fill="' + f + '"/>';
    var jaw = function (full, grow, extra) {
      return '<g clip-path="url(#' + _headClip(ctx, L.k, grow) + ')"><path d="' + _beardMask(L.k, full) + '" fill="' + (extra || f) + '"/></g>';
    };
    return fn(ctx, f, hc, MOUS, jaw, chin, w, dy);
  };
}
const BEARDS = [
  { id: 'none', draw: function () { return ''; } },
  { id: 'moustache', draw: beardDraw(function (ctx, f, hc, MOUS) { return MOUS; }) },
  { id: 'goatee', draw: beardDraw(function (ctx, f, hc, MOUS, jaw, chin) {
    return '<path d="M88 ' + (chin - 13) + ' Q100 ' + (chin + 9) + ' 112 ' + (chin - 13) + ' Q106 ' + (chin - 7) + ' 100 ' + (chin - 7) + ' Q94 ' + (chin - 7) + ' 88 ' + (chin - 13) + 'z" fill="' + f + '"/>' + MOUS;
  }) },
  { id: 'short', draw: beardDraw(function (ctx, f, hc, MOUS, jaw) { return jaw(false, [1.01, 1.06]) + MOUS; }) },
  { id: 'full', draw: beardDraw(function (ctx, f, hc, MOUS, jaw) { return jaw(true, [1.02, 1.12]) + MOUS; }) },
  { id: 'stubble', draw: beardDraw(function (ctx, f, hc, MOUS, jaw) {
    return '<g opacity=".3">' + jaw(false, 1, hc[0]) + '<path d="M84 124 Q100 118 116 124" stroke="' + hc[0] + '" stroke-width="4" fill="none" stroke-linecap="round"/></g>';
  }) },
  { id: 'long', draw: beardDraw(function (ctx, f, hc, MOUS, jaw, chin, w, dy) { // grows out of the jaw beard and tapers to a rounded point on the chest; width from the jaw landmark, length from the chin
    return jaw(true, [1.02, 1.14])
      + '<path d="M' + (100 - w) + ' 128 Q' + (114 - w) + ' 146 100 146 Q' + (86 + w) + ' 146 ' + (100 + w) + ' 128 Q' + (98 + w) + ' ' + (164 + dy) + ' ' + (80 + w) + ' ' + (186 + dy) + ' Q110 ' + (202 + dy) + ' 100 ' + (204 + dy) + ' Q90 ' + (202 + dy) + ' ' + (120 - w) + ' ' + (186 + dy) + ' Q' + (102 - w) + ' ' + (164 + dy) + ' ' + (100 - w) + ' 128z" fill="' + f + '"/>'
      + '<path d="M84 156 Q88 176 86 ' + (192 + dy) + ' M100 152 Q102 176 100 ' + (198 + dy) + ' M116 156 Q112 176 114 ' + (192 + dy) + '" stroke="' + _mix(hc[0], 0.78) + '" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".75"/>'
      + '<path d="M' + (114 - w) + ' 146 Q' + (112 - w) + ' ' + (168 + dy) + ' ' + (122 - w) + ' ' + (184 + dy) + ' M' + (86 + w) + ' 146 Q' + (88 + w) + ' ' + (168 + dy) + ' ' + (78 + w) + ' ' + (184 + dy) + '" stroke="' + _mix(hc[0], 1.25) + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".45"/>' + MOUS;
  }) }
];

export { EYES, lashes, BROWS, NOSES, MOUTHS, MARKS, BEARDS };
