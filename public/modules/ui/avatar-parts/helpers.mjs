// Avatar parts — shared drawing helpers (2.1.9-web.209).
//
// Everything a part's draw(ctx, r, L) may need: colour mixing, the body
// and garment primitives, card-suit glyphs, hair cap outlines and curl
// helpers, eye primitives, the ten head outlines with their landmarks
// (FACE_PTS), the height-dependent warp that fits hair to an outline, the
// head clip used by beards and scalps. Parts import what they use by name;
// the engine (avatar-vector.mjs) imports the rest.

'use strict';

function _mix(hex, f) { // f > 1 lightens (towards white), f < 1 darkens
  var n = parseInt(hex.slice(1), 16);
  var c = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) {
    v = f >= 1 ? v + (255 - v) * (f - 1) : v * f;
    return Math.max(0, Math.min(255, Math.round(v)));
  });
  return '#' + c.map(function (v) { return (v < 16 ? '0' : '') + v.toString(16); }).join('');
}
function _ctx(cid) {
  var defs = [], seen = {};
  return {
    cid: cid,
    defs: defs,
    // Vertical gradient: light top -> base -> darker bottom.
    v: function (c) {
      var id = cid + 'v' + c.slice(1);
      if (!seen[id]) {
        seen[id] = 1;
        defs.push('<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">'
          + '<stop offset="0" stop-color="' + _mix(c, 1.22) + '"/>'
          + '<stop offset=".55" stop-color="' + c + '"/>'
          + '<stop offset="1" stop-color="' + _mix(c, 0.8) + '"/></linearGradient>');
      }
      return 'url(#' + id + ')';
    }
  };
}

// ── Body / garment primitives ────────────────────────────────────────────
// Body silhouette shared by every outfit: short, rounded shoulders.
var BODY = 'M34 204 Q34 160 100 157 Q166 160 166 204z';
var BODY_R = 'M100 157 Q166 160 166 204 L100 204z'; // right half, shaded

function _torso(ctx, c) {
  return '<path d="' + BODY + '" fill="' + ctx.v(c) + '"/>'
    + '<path d="' + BODY_R + '" fill="#000" opacity=".07"/>';
}
function _skinTorso(ctx, skin) { // bare shoulders (strapless / halter)
  return '<path d="' + BODY + '" fill="' + ctx.v(skin[0]) + '"/>'
    + '<path d="' + BODY_R + '" fill="' + skin[1] + '" opacity=".45"/>';
}
function _shirtV(ctx, c) { // shirt V under a jacket
  return '<path d="M84 158 L100 196 L116 158 Q100 166 84 158z" fill="' + ctx.v(c) + '"/>';
}
function _lapels(ctx, c) {
  return '<path d="M85 158 L68 166 L94 204 L100 196z" fill="' + ctx.v(c) + '"/>'
    + '<path d="M115 158 L132 166 L106 204 L100 196z" fill="' + ctx.v(_mix(c, 0.88)) + '"/>';
}
function _tie(c) {
  return '<path d="M100 168 l-5 4 3 20 2 5 2-5 3-20z" fill="' + c + '"/>'
    + '<path d="M96 163 l8 0 -1 6 -6 0z" fill="' + _mix(c, 0.85) + '"/>';
}
function _bowtie(c) {
  return '<path d="M100 166 l-11-6 0 12z M100 166 l11-6 0 12z" fill="' + c + '"/>'
    + '<circle cx="100" cy="166" r="3" fill="' + _mix(c, 0.7) + '"/>';
}
function _suit(kind, x, y, s, fill) {
  var f = ' fill="' + fill + '"';
  if (kind === 1) return '<path d="M' + x + ' ' + (y + s) + ' Q' + (x - s * 1.2) + ' ' + (y + s * 0.2) + ' ' + (x - s) + ' ' + (y - s * 0.3) + ' Q' + (x - s) + ' ' + (y - s) + ' ' + (x - s * 0.5) + ' ' + (y - s) + ' Q' + x + ' ' + (y - s) + ' ' + x + ' ' + (y - s * 0.4) + ' Q' + x + ' ' + (y - s) + ' ' + (x + s * 0.5) + ' ' + (y - s) + ' Q' + (x + s) + ' ' + (y - s) + ' ' + (x + s) + ' ' + (y - s * 0.3) + ' Q' + (x + s * 1.2) + ' ' + (y + s * 0.2) + ' ' + x + ' ' + (y + s) + 'z"' + f + '/>';
  if (kind === 2) return '<path d="M' + x + ' ' + (y - s) + ' L' + (x + s * 0.75) + ' ' + y + ' L' + x + ' ' + (y + s) + ' L' + (x - s * 0.75) + ' ' + y + 'z"' + f + '/>';
  if (kind === 3) return '<circle cx="' + x + '" cy="' + (y - s * 0.45) + '" r="' + (s * 0.42) + '"' + f + '/><circle cx="' + (x - s * 0.45) + '" cy="' + (y + s * 0.15) + '" r="' + (s * 0.42) + '"' + f + '/><circle cx="' + (x + s * 0.45) + '" cy="' + (y + s * 0.15) + '" r="' + (s * 0.42) + '"' + f + '/>'
    + '<path d="M' + x + ' ' + y + ' L' + (x + s * 0.3) + ' ' + (y + s) + ' L' + (x - s * 0.3) + ' ' + (y + s) + 'z"' + f + '/>';
  return '<path d="M' + x + ' ' + (y - s) + ' Q' + (x + s * 1.2) + ' ' + (y - s * 0.2) + ' ' + (x + s) + ' ' + (y + s * 0.3) + ' Q' + (x + s) + ' ' + (y + s * 0.8) + ' ' + (x + s * 0.4) + ' ' + (y + s * 0.6) + ' Q' + x + ' ' + (y + s * 0.4) + ' ' + x + ' ' + (y + s * 0.2) + ' Q' + x + ' ' + (y + s * 0.4) + ' ' + (x - s * 0.4) + ' ' + (y + s * 0.6) + ' Q' + (x - s) + ' ' + (y + s * 0.8) + ' ' + (x - s) + ' ' + (y + s * 0.3) + ' Q' + (x - s * 1.2) + ' ' + (y - s * 0.2) + ' ' + x + ' ' + (y - s) + 'z"' + f + '/>'
    + '<path d="M' + x + ' ' + (y + s * 0.2) + ' L' + (x + s * 0.32) + ' ' + (y + s) + ' L' + (x - s * 0.32) + ' ' + (y + s) + 'z"' + f + '/>';
}
function _card(x, y, w, kind, red) {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (w * 1.4) + '" rx="' + (w * 0.14) + '" fill="#fff" stroke="#b9b3a8" stroke-width=".6"/>'
    + _suit(kind, x + w / 2, y + w * 0.7, w * 0.3, red ? '#c62828' : '#1f1f24');
}
function _bodyClip(ctx) {
  var id = ctx.cid + 'bd';
  if (!ctx.seenClip) ctx.seenClip = {};
  if (!ctx.seenClip[id]) { ctx.seenClip[id] = 1; ctx.defs.push('<clipPath id="' + id + '"><path d="' + BODY + '"/></clipPath>'); }
  return 'url(#' + id + ')';
}
function _crew(ctx, sk, c) { // crew neck: a sliver of neck + a rib band
  return '<path d="M86 157 Q100 168 114 157z" fill="' + sk + '"/>'
    + '<path d="M84 156 Q100 172 116 156" stroke="' + _mix(c, 0.78) + '" stroke-width="4" fill="none"/>';
}
function _collarFlaps(ctx, sk, c) { // open collar: skin V + two flaps
  return '<path d="M90 157 L100 178 L110 157 Q100 162 90 157z" fill="' + sk + '"/>'
    + '<path d="M87 156 Q92 168 99 174 L91 181 Q83 170 84 158z" fill="' + _mix(c, 1.12) + '"/>'
    + '<path d="M113 156 Q108 168 101 174 L109 181 Q117 170 116 158z" fill="' + _mix(c, 0.94) + '"/>';
}

// ── Hair primitives ──────────────────────────────────────────────────────
// Hair cap outlines drawn for the ±53 oval (fitted per outline by _warp).
var CAP_SMOOTH = 'M44 96 Q40 26 100 24 Q160 26 156 96 Q152 62 100 56 Q48 62 44 96z';
var CAP_MID = 'M44 100 Q40 26 100 24 Q160 26 156 100 Q150 60 104 52 L100 60 L96 52 Q50 60 44 100z';
var CAP_SIDE = 'M44 100 Q40 26 100 24 Q160 26 156 100 Q152 70 142 60 Q112 64 88 46 Q78 66 52 72 Q46 84 44 100z';
function _shine(hl) {
  return '<path d="M68 44 Q90 30 118 36" stroke="' + hl + '" stroke-width="6" stroke-linecap="round" fill="none" opacity=".55"/>';
}
function _bumps(cx, cy, rad, from, to, n, r, fill) { // circles along an arc
  var s = '';
  for (var k = 0; k < n; k++) {
    var a = (from + (to - from) * k / (n - 1)) * Math.PI / 180;
    s += '<circle cx="' + (cx + rad * Math.cos(a)).toFixed(1) + '" cy="' + (cy + rad * Math.sin(a)).toFixed(1) + '" r="' + r + '" fill="' + fill + '"/>';
  }
  return s;
}
function _dots(list, fill, extra) { // [[cx, cy, r], ...] circles
  var s = '';
  for (var k = 0; k < list.length; k++) s += '<circle cx="' + list[k][0] + '" cy="' + list[k][1] + '" r="' + list[k][2] + '" fill="' + fill + '"' + (extra || '') + '/>';
  return s;
}
function _braid(x0, y0, x1, y1, n, fill, line, yMin) {
  var s = '';
  for (var k = 0; k < n; k++) {
    var t = k / (n - 1), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, r = 9 - 3 * t;
    if (yMin && y < yMin) continue;
    s += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + r.toFixed(1) + '" ry="' + (r * 0.9).toFixed(1) + '" fill="' + fill + '" stroke="' + line + '" stroke-width="1.2"/>';
  }
  return s;
}

// ── Eye primitives ───────────────────────────────────────────────────────
var EYE_LINE = '#241a12';
function _eye(x, y, ec, rx, ry, ir, sc, dx) { // sc: sclera colour, dx: iris shift (side glance)
  rx = rx || 8; ry = ry || 9.5; ir = ir || 5.4; dx = dx || 0;
  return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + (sc || '#fff') + '" stroke="' + EYE_LINE + '" stroke-width="1.6"/>'
    + '<circle cx="' + (x + dx) + '" cy="' + (y + 1) + '" r="' + ir + '" fill="' + ec + '"/>'
    + '<circle cx="' + (x + dx) + '" cy="' + (y + 1) + '" r="' + (ir * 0.55).toFixed(1) + '" fill="#15100b"/>'
    + '<circle cx="' + (x + dx + ir * 0.4).toFixed(1) + '" cy="' + (y - ir * 0.35).toFixed(1) + '" r="' + (ir * 0.32).toFixed(1) + '" fill="#fff"/>'
    + '<path d="M' + (x - rx) + ' ' + (y - 1) + ' Q' + x + ' ' + (y - 2 * ry + 1) + ' ' + (x + rx) + ' ' + (y - 1) + '" stroke="' + EYE_LINE + '" stroke-width="3.2" stroke-linecap="round" fill="none"/>';
}
function _closed(x, y) {
  return '<path d="M' + (x - 8) + ' ' + (y + 2) + ' Q' + x + ' ' + (y - 8) + ' ' + (x + 8) + ' ' + (y + 2) + '" stroke="' + EYE_LINE + '" stroke-width="3.8" stroke-linecap="round" fill="none"/>';
}

// ── Earring primitives ───────────────────────────────────────────────────
function _earring(i, x) {
  if (i === 3 || i === 4 || i === 5) return '<circle cx="' + x + '" cy="117" r="5.5" fill="none" stroke="#e0b240" stroke-width="2.4"/>';
  if (i === 6) return '<circle cx="' + x + '" cy="111" r="3.8" fill="#f2eee6"/><circle cx="' + (x - 1.3) + '" cy="110.4" r=".9" fill="#1f1f24"/><circle cx="' + (x + 1.3) + '" cy="110.4" r=".9" fill="#1f1f24"/><rect x="' + (x - 1.8) + '" y="112.6" width="3.6" height="1.8" fill="#f2eee6"/><path d="M' + (x - 1) + ' 112.8 L' + (x - 1) + ' 114.2 M' + x + ' 112.8 L' + x + ' 114.2 M' + (x + 1) + ' 112.8 L' + (x + 1) + ' 114.2" stroke="#1f1f24" stroke-width=".5"/>'; // skull stud
  return '<circle cx="' + x + '" cy="111" r="3.4" fill="' + (i === 1 ? '#f4f0e8' : '#e0b240') + '"/>';
}
var BROW_RING = '<circle cx="128" cy="79.5" r="3.4" fill="none" stroke="#d4a437" stroke-width="1.9"/><circle cx="128" cy="83" r="1.1" fill="#f2eee6"/>';

// ── Head outlines and landmarks ──────────────────────────────────────────
// Head outline by face key k = face slot + (feminine ? 5 : 0): the same
// five slots read differently per silhouette — the masculine shapes carry
// a wider, flatter jaw; the feminine ones taper to a softer chin. Features
// stay put: eyes ≈ y 94, mouth ≈ 133, chin ≈ 152.
var AV_FACE_N = 5;
function _headD(k) {
  switch (k) {
    // masculine
    case 1: return 'M41 92 Q41 36 100 36 Q159 36 159 92 Q159 136 132 150 Q100 158 68 150 Q41 136 41 92z';        // round, flat chin
    case 2: return 'M46 80 Q46 36 100 36 Q154 36 154 80 L154 118 Q154 148 120 152 L80 152 Q46 148 46 118z';       // square jaw
    case 3: return 'M50 84 Q50 36 100 36 Q150 36 150 84 L150 122 Q150 152 118 155 L82 155 Q50 152 50 122z';       // long, rectangular
    case 4: return 'M46 88 Q48 40 100 36 Q152 40 154 88 Q158 100 152 112 L124 150 Q112 155 100 155 Q88 155 76 150 L48 112 Q42 100 46 88z'; // rugged: wide cheekbones, angular chin
    // feminine
    case 5: return 'M49 92 Q49 36 100 36 Q151 36 151 92 Q151 126 126 145 Q112 155 100 155 Q88 155 74 145 Q49 126 49 92z'; // oval, tapered chin
    case 6: return 'M44 94 A56 55 0 1 0 156 94 A56 55 0 1 0 44 94z';                                                   // round
    case 7: return 'M45 84 Q45 36 100 36 Q155 36 155 84 Q155 112 130 138 Q114 156 100 156 Q86 156 70 138 Q45 112 45 84z'; // heart
    case 8: return 'M51 90 Q51 36 100 36 Q149 36 149 90 Q149 132 126 150 Q112 158 100 158 Q88 158 74 150 Q51 132 51 90z'; // long, slim
    case 9: return 'M48 86 Q52 40 100 36 Q148 40 152 86 Q156 100 148 114 Q132 146 112 155 Q100 158 88 155 Q68 146 52 114 Q44 100 48 86z'; // soft diamond: high cheekbones, small chin
    default: return 'M45 90 Q45 36 100 36 Q155 36 155 90 Q155 132 130 148 Q114 153 100 153 Q86 153 70 148 Q45 132 45 90z'; // masculine oval, firm jaw
  }
}
// ── Face landmarks ──────────────────────────────────────────────────────
// Per outline (face key): half-widths at the temples (y 60 — hat brim,
// hairline), at ear level (y 100), under the ear (y 104), on the cheek
// (y 120), at the jaw angle (y 134) and along the jaw (y 142), then the
// chin's y. Hair, hats, the temple underlay, the beards and the ears are
// fitted from these instead of one ear-level width (2.1.9-web.203; the
// ear-level values are the former HEAD_HW).
var FACE_PTS = [
  [49, 55, 54, 51, 44, 38, 153], // 0 masculine oval, firm jaw
  [52, 59, 58, 55, 49, 43, 154], // 1 round, flat chin
  [50, 54, 54, 54, 51, 45, 152], // 2 square jaw
  [46, 50, 50, 50, 48, 45, 155], // 3 long, rectangular
  [47, 57, 55, 46, 36, 30, 155], // 4 rugged: wide cheekbones, angular chin
  [45, 51, 50, 46, 37, 30, 155], // 5 feminine oval, tapered chin
  [44, 56, 55, 49, 38, 27, 149], // 6 round
  [50, 55, 52, 44, 34, 26, 156], // 7 heart
  [44, 49, 48, 45, 40, 34, 158], // 8 long, slim
  [44, 53, 52, 45, 36, 29, 156]  // 9 soft diamond
];
function _facePts(k) { return FACE_PTS[k] || FACE_PTS[0]; }
var HEAD_HW = FACE_PTS.map(function (p) { return p[1]; });
function _headHW(k) { return HEAD_HW[k] || 53; }
// The hair, the underlay and the hats are drawn for a ±53 oval. Each
// outline widens or narrows them by a factor that VARIES WITH THE
// HEIGHT: the temple factor above the brow line (y ≤ 60), the ear factor
// at ear level (y ≥ 100), blended in between — so a narrow crown over
// wide cheekbones (rugged) and a wide crown over a narrow jaw (heart)
// both wear the same drawing. Below the ears the ear factor is kept:
// hair falls straight, it does not hug the jaw. The masculine oval keeps
// the single 55/53 factor it always had.

function _wfac(k) {
  var p = _facePts(k), r = FACE_PTS[0];
  return [p[0] / r[0] * (r[1] / 53), p[1] / 53];
}
function _N(v) { return String(Math.round(v * 10) / 10); }
function _mapD(d, X, Y, RX, RY) {
  var t = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [], o = '', i = 0, c = '', cx = 0, cy = 0;
  while (i < t.length) {
    if (/[A-Za-z]/.test(t[i])) { c = t[i++]; o += (o ? ' ' : '') + c; continue; }
    if (c === 'H') { cx = +t[i]; o += ' ' + _N(X(cx, cy)); i += 1; }
    else if (c === 'V') { cy = +t[i]; o += ' ' + _N(Y(cx, cy)); i += 1; }
    else if (c === 'A') { // rx ry rot large sweep x y
      cx = +t[i + 5]; cy = +t[i + 6];
      o += ' ' + _N(RX(+t[i], cy)) + ' ' + _N(RY(+t[i + 1], cy)) + ' ' + t[i + 2] + ' ' + t[i + 3] + ' ' + t[i + 4] + ' ' + _N(X(cx, cy)) + ' ' + _N(Y(cx, cy)); i += 7;
    } else { cx = +t[i]; cy = +t[i + 1]; o += ' ' + _N(X(cx, cy)) + ' ' + _N(Y(cx, cy)); i += 2; } // M L T Q S C: pairs
  }
  return o;
}
function _headScaled(k, sx, sy, cx, cy) {
  return _mapD(_headD(k), function (x) { return cx + (x - cx) * sx; }, function (x, y) { return cy + (y - cy) * sy; },
    function (r) { return r * sx; }, function (r) { return r * sy; });
}
function _sx(k, body) {
  return k === 1 ? body : '<g transform="translate(100,0) scale(' + k + ',1) translate(-100,0)">' + body + '</g>';
}
function _hatFit(svg, k) {
  if (!svg || svg.indexOf('data-fit') !== -1) return svg;
  return _sx(_headHW(k) / 53, svg);
}
function _warp(svg, k) {
  if (!svg || svg.indexOf('data-fit') !== -1) return svg;
  var fk = _wfac(k), a = fk[0], b = fk[1];
  if (Math.abs(a - 1) < 0.003 && Math.abs(b - 1) < 0.003) return svg;
  var S = function (y) { return y <= 60 ? a : y >= 100 ? b : a + (b - a) * (y - 60) / 40; };
  var N = _N;
  var X = function (x, y) { return N(100 + (x - 100) * S(y)); };
  var I = function (x, y) { return y; };
  var at = function (el, n) { var m = el.match(new RegExp(' ' + n + '="(-?[\\d.]+)"')); return m ? +m[1] : null; };
  var set = function (el, n, v) { return el.replace(new RegExp(' ' + n + '="-?[\\d.]+"'), ' ' + n + '="' + v + '"'); };
  svg = svg.replace(/ d="([^"]*)"/g, function (m, d) {
    return ' d="' + _mapD(d, function (x, y) { return 100 + (x - 100) * S(y); }, I, function (r, y) { return r * S(y); }, function (r) { return r; }) + '"';
  });
  return svg.replace(/<(circle|ellipse|rect|line)\b[^>]*>/g, function (el, tag) {
    var x, y, w, h;
    if (tag === 'circle' || tag === 'ellipse') {
      x = at(el, 'cx'); y = at(el, 'cy');
      if (x === null || y === null) return el;
      el = set(el, 'cx', X(x, y));
      if (tag === 'ellipse' && (w = at(el, 'rx')) !== null) el = set(el, 'rx', N(w * S(y)));
    } else if (tag === 'rect') {
      x = at(el, 'x'); y = at(el, 'y') || 0; w = at(el, 'width'); h = at(el, 'height') || 0;
      if (x === null || w === null) return el;
      y += h / 2;
      el = set(set(el, 'x', X(x, y)), 'width', N(w * S(y)));
    } else { // line
      x = at(el, 'x1'); y = at(el, 'y1'); w = at(el, 'x2'); h = at(el, 'y2');
      if (x === null || y === null || w === null || h === null) return el;
      el = set(set(el, 'x1', X(x, y)), 'x2', X(w, h));
    }
    return el;
  });
}
function _headClip(ctx, face, grow) {
  var pair = grow && grow.length === 2, tr = '';
  var id = ctx.cid + 'hc' + face + '_' + (pair ? Math.round(grow[0] * 100) + '_' + Math.round(grow[1] * 100) : Math.round(grow * 100));
  if (!ctx.seenClip) ctx.seenClip = {};
  if (!ctx.seenClip[id]) {
    ctx.seenClip[id] = 1;
    if (pair) tr = ' transform="translate(100,100) scale(' + grow[0] + ',' + grow[1] + ') translate(-100,-100)"';
    else if (grow !== 1) tr = ' transform="translate(100,94) scale(' + grow + ') translate(-100,-94)"';
    ctx.defs.push('<clipPath id="' + id + '"><path d="' + _headD(face) + '"' + tr + '/></clipPath>');
  }
  return id;
}
function _beardMask(k, full) {
  var p = _facePts(k), e = p[2], c = p[3], j = p[4];
  var tx = 100 - e + 1, ty = full ? 103 : 106, cx = 100 - c + (full ? 3 : 5), cy = full ? 124 : 128, jx = 100 - j + (full ? 16 : 18), jy = full ? 132 : 134, ly = full ? 122 : 124;
  return 'M10 170 L' + (tx - 16) + ' 126 Q' + (tx - 8) + ' ' + (ty + 3) + ' ' + tx + ' ' + ty
    + ' Q' + cx + ' ' + cy + ' ' + jx + ' ' + jy + ' Q86 ' + ly + ' 100 ' + (ly + 2) + ' Q114 ' + ly + ' ' + (200 - jx) + ' ' + jy
    + ' Q' + (200 - cx) + ' ' + cy + ' ' + (200 - tx) + ' ' + ty + ' Q' + (200 - tx + 8) + ' ' + (ty + 3) + ' ' + (200 - tx + 16) + ' 126 L190 170 L190 220 L10 220z';
}
function _head(ctx, i, skin) {
  var id = ctx.cid + 'hd', g = 'url(#' + id + ')';
  ctx.defs.push('<radialGradient id="' + id + '" cx=".38" cy=".32" r=".8">'
    + '<stop offset="0" stop-color="' + _mix(skin[0], 1.12) + '"/><stop offset=".62" stop-color="' + skin[0] + '"/>'
    + '<stop offset="1" stop-color="' + skin[1] + '"/></radialGradient>');
  return '<path d="' + _headD(i) + '" fill="' + g + '"/>';
}
function _earsSkin(skin, hw) {
  var xl = 100 - (hw || 53) + 6, xr = 200 - xl; // ear centres 6 inside the outline
  return '<circle cx="' + xl + '" cy="100" r="10.5" fill="' + skin[0] + '"/><circle cx="' + xr + '" cy="100" r="10.5" fill="' + skin[1] + '"/>'
    + '<path d="M' + (xl - 3) + ' 96 Q' + (xl + 2) + ' 100 ' + (xl - 2) + ' 105 M' + (xr + 3) + ' 96 Q' + (xr - 2) + ' 100 ' + (xr + 2) + ' 105" stroke="' + _mix(skin[1], 0.88) + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
}
function _neck(skin) {
  return '<rect x="87" y="134" width="26" height="30" rx="6" fill="' + skin[1] + '"/>';
}
function _cid() { return 'avc' + Math.floor(Math.random() * 1e9); }
function _wrap(vb, size, ctx, body) {
  return '<svg viewBox="' + vb + '" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">'
    + (ctx.defs.length ? '<defs>' + ctx.defs.join('') + '</defs>' : '') + body + '</svg>';
}

// ── Hats / hair interplay ────────────────────────────────────────────────
// Hats that sit on the crown hide the hair above HAT_LINE (see the engine);
// short styles show only a thin band under the brim (down to
// HAT_SHORT_BOTTOM), long styles keep everything below the hat line.
var HAT_LINE = 60;
var HAT_SHORT_BOTTOM = 86;

// ── Draw wrappers ────────────────────────────────────────────────────────
// hairDraw(fn): fn(ctx, f, dk, bk, hl, P, hc, face) returns [back, front,
// scalp] — f the volume-gradient fill, dk/bk darker tones, hl the highlight,
// P(d, fill) a filled path, hc the [base, highlight] pair, face the key.
function hairDraw(fn) {
  return function (ctx, r, L) {
    var hc = L.hc, f = ctx.v(hc[0]), dk = _mix(hc[0], 0.78), bk = _mix(hc[0], 0.85), hl = hc[1];
    var P = function (d, fill) { return '<path d="' + d + '" fill="' + (fill || f) + '"/>'; };
    return fn(ctx, f, dk, bk, hl, P, hc, L.k);
  };
}
// outfitDraw(fn): fn(ctx, sk, C, skin) — sk the skin gradient (collar
// openings), C(def) the outfit colour override for colourable garments (def
// otherwise), skin the [base, shadow] pair.
function outfitDraw(fn) {
  return function (ctx, r, L) {
    var sk = ctx.v(L.skin[0]);
    var C = function (def) { return L.oc || def; };
    return fn(ctx, sk, C, L.skin);
  };
}

export { _mix, _ctx, BODY, BODY_R, _torso, _skinTorso, _shirtV, _lapels, _tie, _bowtie, _suit, _card, _bodyClip, _crew, _collarFlaps,
  CAP_SMOOTH, CAP_MID, CAP_SIDE, _shine, _bumps, _dots, _braid, EYE_LINE, _eye, _closed, _earring, BROW_RING,
  AV_FACE_N, _headD, FACE_PTS, _facePts, HEAD_HW, _headHW, _wfac, _N, _mapD, _headScaled, _sx, _hatFit, _warp, _headClip, _beardMask, _head, _earsSkin, _neck, _cid, _wrap,
  HAT_LINE, HAT_SHORT_BOTTOM, hairDraw, outfitDraw };

