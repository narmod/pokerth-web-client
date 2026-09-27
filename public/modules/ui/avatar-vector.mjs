// Avatar vector engine — layered SVG portrait renderer for the Create tab.
//
// "Toon" style validated with narmod (2026-09-27), replacing the realistic
// bust of 2026-07-31: big round head, large expressive eyes, short rounded
// body, soft volume gradients (skin, hair, clothes), pastel backdrop and the
// double gold border of the login-screen avatar trigger. Shoulder
// accessories (chips, cards, glass...) were dropped with the new style: the
// 'shoulder' axis is kept for recipe compatibility but hidden (avVisible).
//
// avSvg(recipe) -> full <svg> string (viewBox 0 0 200 200, self-contained,
// no external refs -> canvas-rasterizable on iOS Safari).
// AV_AXES describes every axis for the UI (id, i18n label key, option count,
// kind 'color'|'shape', and whether option 0 means "none"). Axis ids and
// option counts are unchanged from the previous engine, so every saved
// recipe (pth_avatar_vec) re-opens in the new style.
//
// Layer order: backdrop -> back hair -> neck + outfit -> ears -> head ->
// marks -> cheeks -> nose -> beard -> mouth -> eyes -> brows -> earrings ->
// front hair -> glasses -> hat -> gold border.

'use strict';

// [base, shadow]
const AV_SKIN = [
  ['#ffe0c7', '#f0c1a0'], ['#f7c9a2', '#e5aa80'], ['#eeb987', '#d99c69'],
  ['#d99d6c', '#c08253'], ['#b87a4b', '#9c6238'], ['#8d5a35', '#724426'],
  ['#fff0e3', '#f3d6c1'], ['#6e4527', '#57341a'],
  ['#553219', '#41240e'], ['#3d2412', '#2b1809']
];
// [base, highlight]
const AV_HAIRC = [
  ['#2b2118', '#4d3d2f'], ['#4a3222', '#6f4f37'], ['#7a5530', '#a07848'],
  ['#b14a22', '#d8703f'], ['#dcae50', '#f3d68b'], ['#a9a9a9', '#d4d4d4'],
  ['#ecd7a2', '#fff3cf'], ['#eeeeee', '#ffffff']
];
const AV_EYEC = ['#6b4526', '#3a7bb5', '#3f8a4a', '#6b7078', '#9a7236', '#2a1c12'];
// [base, centre glow] — pastel backdrops (same count/order as the former
// felts: greens, blues, reds, purples, greys, teals, browns, then the
// light ones).
const AV_FELT = [
  ['#b9dfbe', '#e2f4e4'], ['#b7cff0', '#e1ecfb'], ['#f2bcc0', '#fbe2e3'],
  ['#d3c1ef', '#ede4fa'], ['#d2d6dc', '#eef0f2'], ['#b0ded8', '#dff3f0'],
  ['#efcfa9', '#faeadb'], ['#ffffff', '#ffffff'], ['#e9edf2', '#fafbfc'],
  ['#f8eac0', '#fff9e8'], ['#cae0f4', '#eaf3fb']
];
// Index of the white background: forced by the random dice (narmod
// 2026-07-31: random draws always land on the white backdrop).
const AV_BG_WHITE = 7;

const AV_AXES = [
  { id: 'sex',   label: 'avmSex',       n: 2,               kind: 'shape', none: false },
  { id: 'face',  label: 'avmFace',      n: 3,               kind: 'shape', none: false },
  { id: 'bg',    label: 'avmBg',        n: AV_FELT.length,  kind: 'color', none: false },
  { id: 'outfit',label: 'avmOutfit',    n: 17,              kind: 'shape', none: false },
  { id: 'skin',  label: 'avmSkin',      n: AV_SKIN.length,  kind: 'color', none: false },
  { id: 'marks', label: 'avmMarks',     n: 6,               kind: 'shape', none: true  },
  { id: 'hair',  label: 'avmHair',      n: 26,              kind: 'shape', none: true  },
  { id: 'hairc', label: 'avmHairColor', n: AV_HAIRC.length, kind: 'color', none: false },
  { id: 'beard', label: 'avmBeard',     n: 7,               kind: 'shape', none: true  },
  { id: 'eyes',  label: 'avmEyeShape',  n: 7,               kind: 'shape', none: false },
  { id: 'eyec',  label: 'avmEyeColor',  n: AV_EYEC.length,  kind: 'color', none: false },
  { id: 'nose',  label: 'avmNose',      n: 5,               kind: 'shape', none: false },
  { id: 'mouth', label: 'avmMouth',     n: 8,               kind: 'shape', none: false },
  { id: 'glasses', label: 'avmGlasses', n: 6,               kind: 'shape', none: true  },
  { id: 'shoulder', label: 'avmShoulder', n: 5,             kind: 'shape', none: true  },
  { id: 'ears',  label: 'avmEarrings',  n: 6,               kind: 'shape', none: true  },
  { id: 'hat',   label: 'avmHat',       n: 10,              kind: 'shape', none: true  }
];

// Per-option silhouette tags (0 = masculine-leaning, 1 = feminine-leaning,
// missing = universal). The 'beard' axis is masculine-only as a whole.
// avVisible() lets the UI filter rows coherently with the selected sex
// while the engine still renders any recipe (old recipes stay valid).
const AV_SEXTAG = {
  hair: { 2: 0, 3: 1, 5: 1, 6: 0, 7: 1, 8: 1, 9: 0, 11: 1, 12: 1, 14: 1, 16: 0, 19: 1, 21: 1, 22: 1, 23: 1, 24: 1, 25: 1 },
  mouth: { 3: 1 },
  outfit: { 6: 1, 9: 1, 12: 1, 13: 1, 14: 1 }
};

function avVisible(axId, i, recipe) {
  // Option 0 of an optional axis ('none') is always a valid value --
  // it is what recipes are sanitized to when an axis gets filtered out.
  // Shoulder accessories are retired with the toon style (narmod
  // 2026-09-27): only 'none' stays, which hides the row in the studio.
  if (axId === 'shoulder') return i === 0;
  if (axId === 'beard') return i === 0 || !(recipe && recipe.sex === 1);
  if (recipe && axId === 'hat' && i !== 0) {
    // Voluminous hairstyles (bun, afro) don't fit under a hat.
    if (recipe.hair === 7 || recipe.hair === 10) return false;
  }
  if (recipe && axId === 'eyec') {
    // Eye color is meaningless behind closed eyes or sunglasses.
    if (recipe.eyes === 2 || recipe.glasses === 5) return false;
  }
  var tags = AV_SEXTAG[axId];
  if (!tags || !(i in tags) || !recipe) return true;
  return tags[i] === recipe.sex;
}

const AV_DEFAULT = { sex: 0, face: 0, bg: 0, outfit: 0, skin: 1, marks: 0, hair: 1, hairc: 1,
                     beard: 0, eyes: 0, eyec: 0, nose: 0, mouth: 0, glasses: 0, shoulder: 0, ears: 0, hat: 0 };

function avNormalize(r) {
  var out = {};
  AV_AXES.forEach(function (ax) {
    var v = r && typeof r[ax.id] === 'number' ? Math.floor(r[ax.id]) : AV_DEFAULT[ax.id];
    out[ax.id] = (v >= 0 && v < ax.n) ? v : AV_DEFAULT[ax.id];
  });
  return out;
}

// Dice-only rules (the studio still offers every option to everyone):
// options that read as the other silhouette are never DRAWN at random, and
// optional extras are rarer, so random portraits stay coherent instead of
// piling a hat, glasses, earrings and marks on every face (narmod
// 2026-09-27).
const AV_RANDSEX = {
  hair: { 0: 0, 1: 0, 13: 0, 17: 0 },   // bald, short, close curls, mohawk
  outfit: { 1: 0, 2: 0, 4: 0 },         // tie, vest + tie, tuxedo bow tie
  glasses: { 3: 1 },                    // cat-eye
  ears: { 1: 1 }                        // pearl studs
};
// Probability that an optional axis stays on 'none' ([masculine, feminine]).
const AV_RANDNONE = { marks: [0.65, 0.65], beard: [0.45, 1], glasses: [0.7, 0.7], ears: [0.85, 0.45], hat: [0.7, 0.75] };

function _randOk(axId, i, r) {
  var tags = AV_RANDSEX[axId];
  if (tags && (i in tags) && tags[i] !== r.sex) return false;
  // Tall styles (high ponytail, mohawk) are not drawn under a hat.
  if (axId === 'hat' && i !== 0 && (r.hair === 3 || r.hair === 17)) return false;
  return true;
}

function avRandom(fixedSex) {
  // When a silhouette is already chosen, the dice keeps it and only
  // randomizes within compatible options (narmod 2026-07-31).
  var r = { sex: (fixedSex === 0 || fixedSex === 1) ? fixedSex : Math.floor(Math.random() * 2) };
  var draw = function (ax) {
    var opts = [];
    for (var i = 0; i < ax.n; i++) if (avVisible(ax.id, i, r) && _randOk(ax.id, i, r)) opts.push(i);
    var pNone = AV_RANDNONE[ax.id];
    if (ax.none && opts.length > 1 && pNone) {
      if (Math.random() < pNone[r.sex]) { r[ax.id] = 0; return; }
      opts = opts.filter(function (v) { return v !== 0; });
    }
    r[ax.id] = opts.length ? opts[Math.floor(Math.random() * opts.length)] : 0;
  };
  // 'eyec' depends on 'eyes' and 'glasses': draw it last.
  AV_AXES.forEach(function (ax) { if (ax.id !== 'sex' && ax.id !== 'eyec') draw(ax); });
  draw(AV_AXES.filter(function (ax) { return ax.id === 'eyec'; })[0]);
  r.bg = AV_BG_WHITE;
  return r;
}

// ── Colour helpers + gradient registry ───────────────────────────────────
function _mix(hex, f) { // f > 1 lightens (towards white), f < 1 darkens
  var n = parseInt(hex.slice(1), 16);
  var c = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) {
    v = f >= 1 ? v + (255 - v) * (f - 1) : v * f;
    return Math.max(0, Math.min(255, Math.round(v)));
  });
  return '#' + c.map(function (v) { return (v < 16 ? '0' : '') + v.toString(16); }).join('');
}

// One render context per SVG: collects the <defs> (vertical volume
// gradients) under ids derived from the SVG's unique prefix.
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

// ── Outfits ──────────────────────────────────────────────────────────────
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

function _outfit(ctx, i, skin) {
  var sk = ctx.v(skin[0]);
  switch (i) {
    case 5: // open-collar shirt, no jacket (casual)
      return _torso(ctx, '#e6dfcf')
        + '<path d="M92 158 L100 172 L108 158z" fill="' + sk + '"/>'
        + '<path d="M86 156 Q92 166 99 170 L92 178 Q84 168 84 158z" fill="#f6f1e6"/>'
        + '<path d="M114 156 Q108 166 101 170 L108 178 Q116 168 116 158z" fill="#ece5d6"/>';
    case 6: // V-neck blouse (feminine)
      return _torso(ctx, '#b34a7f')
        + '<path d="M86 157 L100 184 L114 157 Q100 162 86 157z" fill="' + sk + '"/>'
        + '<path d="M84 157 L100 186 L116 157" stroke="#c9679a" stroke-width="3" fill="none" stroke-linejoin="round"/>';
    case 7: // dark turtleneck
      return _torso(ctx, '#2f343d')
        + '<rect x="84" y="140" width="32" height="24" rx="10" fill="' + ctx.v('#3b414c') + '"/>'
        + '<path d="M86 150 L114 150 M86 156 L114 156" stroke="#2a2f37" stroke-width="1.6"/>';
    case 8: // white dinner jacket, dark shirt, no tie
      return _torso(ctx, '#efe8d8') + _shirtV(ctx, '#2a2e36') + _lapels(ctx, '#f7f2e6');
    case 9: // strapless evening dress (feminine)
      return _skinTorso(ctx, skin)
        + '<path d="M44 204 L46 182 Q70 172 100 172 Q130 172 154 182 L156 204z" fill="' + ctx.v('#b3264a') + '"/>'
        + '<path d="M46 182 Q70 172 100 172 Q130 172 154 182" stroke="#e5b94e" stroke-width="2.4" fill="none"/>';
    case 10: // rock: leather jacket, dark tee
      return _torso(ctx, '#26262c')
        + '<path d="M84 158 Q100 170 116 158 L116 204 L84 204z" fill="#3a3a42"/>'
        + _lapels(ctx, '#18181c')
        + '<path d="M78 172 L78 200 M122 172 L122 200" stroke="#9aa0aa" stroke-width="1.8"/>';
    case 11: // hoodie
      return _torso(ctx, '#6a7380')
        + '<path d="M74 158 Q70 176 100 180 Q130 176 126 158 Q116 170 100 170 Q84 170 74 158z" fill="' + ctx.v('#7d8795') + '"/>'
        + '<path d="M94 176 L92 194 M106 176 L108 194" stroke="#eef1f4" stroke-width="2.4" stroke-linecap="round"/>'
        + '<circle cx="92" cy="196" r="2" fill="#eef1f4"/><circle cx="108" cy="196" r="2" fill="#eef1f4"/>';
    case 12: // V-neck dress with deep neckline (feminine)
      return _torso(ctx, '#2e5b8a')
        + '<path d="M82 157 L100 196 L118 157 Q100 163 82 157z" fill="' + sk + '"/>'
        + '<path d="M82 158 L100 197 L118 158" stroke="#e5b94e" stroke-width="2" fill="none" stroke-linejoin="round"/>';
    case 13: // halter dress, bare shoulders + neck strap (feminine)
      return _skinTorso(ctx, skin)
        + '<path d="M54 204 L58 184 Q74 172 100 172 Q126 172 142 184 L146 204z" fill="' + ctx.v('#1f7a5c') + '"/>'
        + '<path d="M90 146 L100 174 L110 146" stroke="#1f7a5c" stroke-width="5" fill="none" stroke-linecap="round"/>';
    case 14: // scoop-neck top + gold necklace (feminine)
      return _torso(ctx, '#8a3f86')
        + '<path d="M78 158 Q100 186 122 158 Q100 164 78 158z" fill="' + sk + '"/>'
        + '<path d="M84 160 Q100 180 116 160" stroke="#e5b94e" stroke-width="2" fill="none"/>'
        + '<circle cx="100" cy="176" r="3.2" fill="#e5b94e"/>';
    case 15: // shirt worn open at the collar (universal)
      return _torso(ctx, '#a9cbe6')
        + '<path d="M88 157 L100 184 L112 157 Q100 162 88 157z" fill="' + sk + '"/>'
        + '<path d="M86 156 Q92 170 99 178 L90 184 Q82 170 84 157z" fill="#c9e0f1"/>'
        + '<path d="M114 156 Q108 170 101 178 L110 184 Q118 170 116 157z" fill="#bcd6ec"/>'
        + '<circle cx="100" cy="192" r="1.8" fill="#6f8ca3"/>';
    case 16: // blazer + draped scarf (universal)
      return _torso(ctx, '#56604f')
        + _shirtV(ctx, '#e9e3d6') + _lapels(ctx, '#46503f')
        + '<path d="M84 154 Q100 166 116 154 L118 162 Q100 174 82 162z" fill="' + ctx.v('#c0703a') + '"/>'
        + '<path d="M94 166 L106 166 L110 198 L100 204 L90 198z" fill="' + ctx.v('#b0622f') + '"/>';
    default: { // 0 charcoal suit, 1 navy + tie, 2 grey + vest + tie, 3 burgundy, 4 tux + bow tie
      var J = ['#3a3f47', '#2c4470', '#5b6069', '#8a2d3a', '#1f2126'][i] || '#3a3f47';
      var s = _torso(ctx, J) + _shirtV(ctx, '#f4f0e6');
      if (i === 2) s += '<path d="M88 170 L78 176 L90 204 L100 196z M112 170 L122 176 L110 204 L100 196z" fill="' + ctx.v('#43474f') + '"/>';
      s += _lapels(ctx, _mix(J, 0.82));
      if (i === 1) s += _tie('#1b2a4d');
      else if (i === 2) s += _tie('#8e2632');
      else if (i === 4) s += _bowtie('#a8262f');
      return s;
    }
  }
}

// ── Hair ─────────────────────────────────────────────────────────────────
// Each style = [back layer (behind head/body), front layer (over the
// forehead)]. c = [base, highlight]. Shapes are drawn for the oval face.
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
function _braid(x0, y0, x1, y1, n, fill, line) {
  var s = '';
  for (var k = 0; k < n; k++) {
    var t = k / (n - 1), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, r = 9 - 3 * t;
    s += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + r.toFixed(1) + '" ry="' + (r * 0.9).toFixed(1) + '" fill="' + fill + '" stroke="' + line + '" stroke-width="1.2"/>';
  }
  return s;
}

function _hair(ctx, i, hc) {
  var f = ctx.v(hc[0]), dk = _mix(hc[0], 0.78), bk = _mix(hc[0], 0.85), hl = hc[1];
  var P = function (d, fill) { return '<path d="' + d + '" fill="' + (fill || f) + '"/>'; };
  switch (i) {
    case 0: // bald: just a shine on the scalp
      return ['', '<ellipse cx="84" cy="50" rx="14" ry="7" fill="#fff" opacity=".35"/>'];
    case 1: // short
      return ['', P('M44 94 Q38 26 100 24 Q162 26 156 94 Q154 74 146 66 Q136 70 126 62 Q114 70 100 62 Q86 70 74 62 Q64 70 54 66 Q46 74 44 94z') + _shine(hl)];
    case 2: // slicked back
      return ['', P('M46 88 Q42 24 100 22 Q158 24 154 88 Q152 60 138 52 Q100 42 62 52 Q48 60 46 88z')
        + '<path d="M70 40 Q100 30 130 40 M66 48 Q100 36 134 48" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>' + _shine(hl)];
    case 3: // high ponytail
      return [P('M112 30 Q152 4 172 30 Q188 62 166 112 Q160 126 150 130 Q166 84 140 44z', bk),
        P(CAP_SMOOTH) + '<circle cx="128" cy="30" r="8" fill="#d9536a"/>' + _shine(hl)];
    case 4: // curly
      return ['', P(CAP_SMOOTH) + _bumps(100, 84, 50, 190, 350, 11, 12, f) + _bumps(100, 84, 50, 200, 340, 6, 4, hl)];
    case 5: // mid-length bob
      return [P('M38 100 Q34 24 100 22 Q166 24 162 100 L164 140 Q150 150 136 142 L64 142 Q50 150 36 140z', bk),
        P(CAP_SIDE) + _shine(hl)];
    case 7: // bun
      return ['', '<circle cx="100" cy="22" r="20" fill="' + f + '"/>' + P(CAP_SMOOTH)
        + '<path d="M84 36 Q100 30 116 36" stroke="#d9536a" stroke-width="4" stroke-linecap="round" fill="none"/>' + _shine(hl)];
    case 8: // long, middle part
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L166 184 Q146 192 132 178 L68 178 Q54 192 34 184z', bk),
        P(CAP_MID) + _shine(hl)];
    case 9: // undercut: tight sides, volume swept on top
      return ['', P('M46 92 Q44 60 58 50 L142 50 Q156 60 154 92 Q150 72 140 66 L60 66 Q50 72 46 92z', dk)
        + P('M52 64 Q44 18 104 16 Q152 16 162 44 Q146 40 140 54 Q112 50 88 64 Q70 58 52 64z') + _shine(hl)];
    case 10: // afro
      return ['<circle cx="100" cy="72" r="68" fill="' + f + '"/>',
        P('M42 92 Q36 20 100 14 Q164 20 158 92 Q150 64 100 58 Q50 64 42 92z')
        + _bumps(100, 72, 58, 200, 340, 9, 5, hl).replace(/fill=/g, 'opacity=".25" fill=')];
    case 11: // side braid over the shoulder
      return ['', P(CAP_SIDE) + _braid(44, 110, 56, 190, 8, f, dk) + _shine(hl)];
    case 12: // pixie cut with fringe
      return ['', P('M44 90 Q40 26 100 24 Q160 26 156 86 Q152 70 146 66 Q120 56 70 86 Q62 70 52 70 Q46 78 44 90z') + _shine(hl)];
    case 13: // tight curls, close cut
      return ['', P('M46 86 Q44 32 100 30 Q156 32 154 86 Q150 64 100 58 Q50 64 46 86z')
        + _bumps(100, 80, 40, 200, 340, 9, 2.2, dk) + _bumps(100, 80, 30, 215, 325, 6, 2.2, dk)];
    case 14: // long wavy
      return [P('M40 96 Q34 24 100 22 Q166 24 160 96 Q170 116 160 136 Q172 158 162 186 Q146 192 132 178 L68 178 Q54 192 38 186 Q28 158 40 136 Q30 116 40 96z', bk),
        P(CAP_SIDE) + _shine(hl)];
    case 15: { // dreadlocks
      var locks = '';
      [42, 51, 60, 140, 149, 158].forEach(function (x, k) {
        locks += '<rect x="' + (x - 4.5) + '" y="78" width="9" height="' + (64 + (k % 3) * 10) + '" rx="4.5" fill="' + bk + '"/>';
      });
      return [locks, P(CAP_SMOOTH) + _bumps(100, 84, 48, 200, 340, 8, 6, f)];
    }
    case 16: // balding crown (masculine)
      return ['', '<ellipse cx="84" cy="48" rx="14" ry="7" fill="#fff" opacity=".35"/>',
        P('M0 58 L66 58 Q58 80 64 108 L0 108z M200 58 L134 58 Q142 80 136 108 L200 108z')];
    case 17: // mohawk crest
      return ['', P('M86 60 L80 30 L90 34 L92 6 L100 20 L108 6 L110 34 L120 30 L114 60z'),
        '<path d="M0 0 L200 0 L200 96 Q152 62 100 56 Q48 62 0 96z" fill="' + hc[0] + '" opacity=".4"/>'];
    case 18: // tousled mid-length (surfer)
      return [P('M40 96 Q36 26 100 24 Q164 26 160 96 L160 128 Q148 136 138 126 L62 126 Q52 136 40 128z', bk),
        P('M42 100 Q34 22 100 20 Q166 22 158 100 L150 70 L140 76 L132 60 L118 70 L106 56 L94 70 L80 58 L70 74 L58 64 L50 80z') + _shine(hl)];
    case 19: // pigtails (feminine)
      return ['', P('M46 80 Q14 88 18 140 Q22 160 34 166 Q28 120 52 96z') + P('M154 80 Q186 88 182 140 Q178 160 166 166 Q172 120 148 96z')
        + P(CAP_MID) + '<circle cx="44" cy="84" r="5" fill="#d9536a"/><circle cx="156" cy="84" r="5" fill="#d9536a"/>' + _shine(hl)];
    case 20: { // thin box braids
      var lines = '';
      for (var x = 42; x <= 158; x += 8) if (x < 70 || x > 130) lines += '<path d="M' + x + ' 80 L' + (x + (x < 100 ? -4 : 4)) + ' 188" stroke="' + dk + '" stroke-width="1.6"/>';
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L168 190 L32 190z', bk) + lines, P(CAP_MID)];
    }
    case 21: // elegant low side bun + face-framing strands
      return ['<circle cx="150" cy="132" r="17" fill="' + bk + '"/>',
        P(CAP_SIDE) + '<path d="M52 78 Q42 112 56 136 M148 78 Q158 112 144 136" stroke="' + f + '" stroke-width="5" fill="none" stroke-linecap="round"/>' + _shine(hl)];
    case 22: // sleek asymmetric long bob, deep side part
      return [P('M38 100 Q34 24 100 22 Q166 24 162 100 L164 128 L136 130 L64 150 L36 152z', bk),
        P('M40 120 Q34 24 100 22 Q160 24 156 96 Q150 64 130 54 Q96 60 70 86 Q56 104 58 140z') + _shine(hl)];
    case 23: // long voluminous curls
      return [P('M36 96 Q32 22 100 20 Q168 22 164 96 L168 180 L32 180z', bk)
        + [100, 124, 148, 172].map(function (y) { return '<circle cx="32" cy="' + y + '" r="12" fill="' + bk + '"/><circle cx="168" cy="' + y + '" r="12" fill="' + bk + '"/>'; }).join(''),
        P(CAP_SIDE) + _bumps(100, 84, 50, 195, 250, 4, 10, f)];
    case 24: // low ponytail swept over one shoulder
      return ['', P(CAP_SMOOTH) + P('M142 118 Q172 130 162 192 Q152 198 146 188 Q156 150 134 132z')
        + '<circle cx="142" cy="124" r="5" fill="#d9536a"/>' + _shine(hl)];
    case 25: // vintage hollywood waves
      return [P('M40 100 Q36 24 100 22 Q164 24 160 100 Q168 118 158 136 L142 140 L58 140 L42 136 Q32 118 40 100z', bk),
        P('M42 108 Q36 24 100 22 Q160 24 156 96 Q150 64 128 56 Q108 62 96 52 Q82 76 64 70 Q50 82 58 104 Q44 112 42 108z')
        + '<path d="M60 76 Q72 64 86 72 M112 58 Q126 50 140 62" stroke="' + hl + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>'];
    default: // 6: wavy senior sweep
      return ['', P('M46 90 Q40 28 100 24 Q156 26 156 88 Q150 62 132 56 Q126 64 112 58 Q96 70 80 56 Q66 64 56 60 Q48 70 46 90z') + _shine(hl)];
  }
}

// ── Beard / moustache (drawn under the mouth) ────────────────────────────
// Jaw beards are the lower part of the HEAD SHAPE itself (clipped to the
// face outline, grown a little so they overhang the jaw): they follow the
// oval, round and square faces exactly. Moustache and goatee are local.
// Outer corners taper under the ears so the grown outline never shows a
// flat cut beside the temples.
var BEARD_SHORT = 'M20 170 L38 124 Q42 100 48 98 Q52 128 70 134 Q86 124 100 126 Q114 124 130 134 Q148 128 152 98 Q158 100 162 124 L180 170 L180 220 L20 220z';
var BEARD_FULL = 'M20 170 L36 120 Q40 94 47 92 Q52 124 72 130 Q86 122 100 124 Q114 122 128 130 Q148 124 153 92 Q160 94 164 120 L180 170 L180 220 L20 220z';

function _beard(ctx, i, hc, face) {
  var f = ctx.v(hc[0]);
  var MOUS = '<path d="M82 124 Q92 116 100 121 Q108 116 118 124 Q116 131 106 127 Q100 126 94 127 Q84 131 82 124z" fill="' + f + '"/>';
  var jaw = function (mask, grow, extra) {
    return '<g clip-path="url(#' + _headClip(ctx, face, grow) + ')"><path d="' + mask + '" fill="' + (extra || f) + '"/></g>';
  };
  switch (i) {
    case 0: return '';
    case 1: return MOUS; // moustache
    case 2: return '<path d="M88 140 Q100 162 112 140 Q106 146 100 146 Q94 146 88 140z" fill="' + f + '"/>' + MOUS; // goatee
    case 3: return jaw(BEARD_SHORT, 1.05) + MOUS; // short beard
    case 5: return '<g opacity=".3">' + jaw(BEARD_SHORT, 1, hc[0]) // stubble
      + '<path d="M84 124 Q100 118 116 124" stroke="' + hc[0] + '" stroke-width="4" fill="none" stroke-linecap="round"/></g>';
    case 6: return jaw(BEARD_FULL, 1.09) // long beard
      + '<path d="M62 142 Q100 156 138 142 Q130 178 100 198 Q70 178 62 142z" fill="' + f + '"/>' + MOUS;
    default: return jaw(BEARD_FULL, 1.1) + MOUS; // 4: full beard
  }
}

// ── Noses ────────────────────────────────────────────────────────────────
function _nose(i, sh) {
  var st = ' stroke="' + sh + '" stroke-width="3" stroke-linecap="round" fill="none"';
  switch (i) {
    case 1: return '<path d="M100 100 L98 114 Q100 118 104 115"' + st + '/>'; // straight, long
    case 2: return '<ellipse cx="100" cy="112" rx="5.5" ry="4.5" fill="' + sh + '"/>'; // upturned button
    case 3: return '<path d="M90 114 Q100 122 110 114"' + st + '/><circle cx="92" cy="113" r="2" fill="' + sh + '"/><circle cx="108" cy="113" r="2" fill="' + sh + '"/>'; // wide
    case 4: return '<path d="M98 98 Q108 108 104 116 Q100 119 96 116"' + st + '/>'; // aquiline
    default: return '<path d="M95 114 Q100 118 105 114"' + st + '/>'; // fine
  }
}

// ── Eyes (shape x iris color) ────────────────────────────────────────────
function _eye(x, y, ec, open) { // open: vertical scale of the sclera
  return '<ellipse cx="' + x + '" cy="' + y + '" rx="8.5" ry="' + (9.5 * open).toFixed(1) + '" fill="#fff"/>'
    + '<circle cx="' + x + '" cy="' + (y + 1) + '" r="5.6" fill="' + ec + '"/>'
    + '<circle cx="' + x + '" cy="' + (y + 1) + '" r="2.8" fill="#15100b"/>'
    + '<circle cx="' + (x + 2.4) + '" cy="' + (y - 2) + '" r="2" fill="#fff"/>';
}
function _closed(x, y) {
  return '<path d="M' + (x - 8) + ' ' + (y + 2) + ' Q' + x + ' ' + (y - 7) + ' ' + (x + 8) + ' ' + (y + 2) + '" stroke="#2a1d14" stroke-width="3.6" stroke-linecap="round" fill="none"/>';
}
function _eyes(shape, ec, skin, fem) {
  var L = 78, R = 122, y = 98, s = '';
  if (shape === 2) return _closed(L, y) + _closed(R, y); // closed smiling
  if (shape === 3) { // wink: left open, right closed
    s = _eye(L, y, ec, 1) + _closed(R, y);
  } else if (shape === 4) { // wide, surprised
    s = [L, R].map(function (x) {
      return '<ellipse cx="' + x + '" cy="' + y + '" rx="10" ry="11.5" fill="#fff"/>'
        + '<circle cx="' + x + '" cy="' + y + '" r="4.4" fill="' + ec + '"/><circle cx="' + x + '" cy="' + y + '" r="2.2" fill="#15100b"/>'
        + '<circle cx="' + (x + 2) + '" cy="' + (y - 2) + '" r="1.5" fill="#fff"/>';
    }).join('');
  } else if (shape === 5 || shape === 6) { // heavy-lidded / narrowed, determined
    s = [L, R].map(function (x, k) {
      var lid = shape === 5
        ? 'M' + (x - 10) + ' ' + (y - 11) + ' L' + (x + 10) + ' ' + (y - 11) + ' L' + (x + 10) + ' ' + (y - 1) + ' Q' + x + ' ' + (y + 2) + ' ' + (x - 10) + ' ' + (y - 1) + 'z'
        : (k === 0
          ? 'M' + (x - 10) + ' ' + (y - 12) + ' L' + (x + 10) + ' ' + (y - 12) + ' L' + (x + 10) + ' ' + (y - 1) + ' L' + (x - 10) + ' ' + (y - 6) + 'z'
          : 'M' + (x - 10) + ' ' + (y - 12) + ' L' + (x + 10) + ' ' + (y - 12) + ' L' + (x + 10) + ' ' + (y - 6) + ' L' + (x - 10) + ' ' + (y - 1) + 'z');
      var edge = shape === 5
        ? 'M' + (x - 9) + ' ' + (y - 1) + ' Q' + x + ' ' + (y + 2) + ' ' + (x + 9) + ' ' + (y - 1)
        : (k === 0 ? 'M' + (x - 9) + ' ' + (y - 5.5) + ' L' + (x + 9) + ' ' + (y - 1.5) : 'M' + (x - 9) + ' ' + (y - 1.5) + ' L' + (x + 9) + ' ' + (y - 5.5));
      return _eye(x, y, ec, 1) + '<path d="' + lid + '" fill="' + skin[0] + '"/>'
        + '<path d="' + edge + '" stroke="#2a1d14" stroke-width="2.6" stroke-linecap="round" fill="none"/>';
    }).join('');
  } else if (shape === 1) { // almond
    s = [L, R].map(function (x) {
      return '<path d="M' + (x - 10) + ' ' + y + ' Q' + x + ' ' + (y - 11) + ' ' + (x + 10) + ' ' + y + ' Q' + x + ' ' + (y + 8) + ' ' + (x - 10) + ' ' + y + 'z" fill="#fff"/>'
        + '<circle cx="' + x + '" cy="' + y + '" r="5" fill="' + ec + '"/><circle cx="' + x + '" cy="' + y + '" r="2.5" fill="#15100b"/>'
        + '<circle cx="' + (x + 2) + '" cy="' + (y - 2) + '" r="1.6" fill="#fff"/>';
    }).join('');
  } else { // 0: round
    s = _eye(L, y, ec, 1) + _eye(R, y, ec, 1);
  }
  if (fem && shape !== 3) { // lashes on the outer corners
    s += '<path d="M69 93 L64 89 M71 90 L67 85 M131 93 L136 89 M129 90 L133 85" stroke="#2a1d14" stroke-width="2" stroke-linecap="round"/>';
  } else if (fem) {
    s += '<path d="M69 93 L64 89 M71 90 L67 85" stroke="#2a1d14" stroke-width="2" stroke-linecap="round"/>';
  }
  return s;
}

// ── Mouths ───────────────────────────────────────────────────────────────
function _mouth(i) {
  var ln = ' stroke="#6b3a2a" stroke-width="3.6" stroke-linecap="round" fill="none"';
  switch (i) {
    case 1: // wide grin with teeth
      return '<path d="M84 128 L116 128 Q114 146 100 146 Q86 146 84 128z" fill="#6b1f24"/>'
        + '<path d="M92 139 Q100 135 108 139 Q104 146 100 146 Q96 146 92 139z" fill="#ef7b7f"/>'
        + '<path d="M85 128 L115 128 L114 132 L86 132z" fill="#fff"/>';
    case 2: return '<path d="M90 134 L110 134"' + ln + '/>'; // neutral
    case 3: // lipstick smile
      return '<path d="M86 132 Q93 126 100 129 Q107 126 114 132 Q107 142 100 142 Q93 142 86 132z" fill="#d9375a"/>'
        + '<path d="M88 132 Q100 136 112 132" stroke="#a8243f" stroke-width="1.4" fill="none"/>';
    case 4: return '<path d="M88 135 Q102 137 114 126"' + ln + '/>'; // smirk
    case 5: // pout
      return '<ellipse cx="100" cy="135" rx="7" ry="5" fill="#d86a6a"/><path d="M95 134 L105 134" stroke="#9c3f3f" stroke-width="1.4"/>';
    case 6: // open laugh
      return '<path d="M84 128 Q100 128 116 128 Q114 150 100 150 Q86 150 84 128z" fill="#6b1f24"/>'
        + '<path d="M90 142 Q100 136 110 142 Q106 150 100 150 Q94 150 90 142z" fill="#ef7b7f"/>';
    case 7: return '<ellipse cx="100" cy="135" rx="5" ry="6" fill="#6b1f24"/>'; // small o (surprise)
    default: return '<path d="M86 129 Q100 144 114 129"' + ln + '/>'; // soft smile
  }
}

// ── Skin marks ───────────────────────────────────────────────────────────
function _marks(i, sh) {
  switch (i) {
    case 1: { // freckles
      var d = '';
      [[64, 110], [70, 114], [76, 110], [124, 110], [130, 114], [136, 110], [70, 106], [130, 106]].forEach(function (p) {
        d += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.5" fill="' + _mix(sh, 0.8) + '"/>';
      });
      return d;
    }
    case 2: return '<circle cx="124" cy="124" r="2.2" fill="#3a2418"/>'; // beauty mark
    case 3: return '<path d="M86 66 Q100 62 114 66 M90 71 Q100 68 110 71 M60 96 L55 94 M60 101 L55 102 M140 96 L145 94 M140 101 L145 102" stroke="' + _mix(sh, 0.85) + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>'; // age lines
    case 4: return '<path d="M124 72 L130 86" stroke="#f6d3d0" stroke-width="3" stroke-linecap="round"/>'; // eyebrow scar
    case 5: return '<path d="M80 130 Q82 134 80 137 M120 130 Q118 134 120 137" stroke="' + _mix(sh, 0.85) + '" stroke-width="2" fill="none" stroke-linecap="round"/>'; // dimples
    default: return '';
  }
}

// ── Glasses ──────────────────────────────────────────────────────────────
function _glasses(i) {
  var lens = ' fill="#fff" fill-opacity=".18"';
  switch (i) {
    case 0: return '';
    case 1: // round
      return '<circle cx="78" cy="98" r="14"' + lens + ' stroke="#2b2f36" stroke-width="3.2"/><circle cx="122" cy="98" r="14"' + lens + ' stroke="#2b2f36" stroke-width="3.2"/>'
        + '<path d="M92 96 Q100 92 108 96" stroke="#2b2f36" stroke-width="3" fill="none"/>';
    case 2: // rectangular
      return '<rect x="62" y="88" width="32" height="21" rx="4"' + lens + ' stroke="#2b2f36" stroke-width="3.2"/><rect x="106" y="88" width="32" height="21" rx="4"' + lens + ' stroke="#2b2f36" stroke-width="3.2"/>'
        + '<path d="M94 96 L106 96" stroke="#2b2f36" stroke-width="3"/>';
    case 3: // cat-eye
      return '<path d="M60 88 Q78 84 94 92 Q94 110 78 110 Q62 108 60 88z"' + lens + ' stroke="#8e2548" stroke-width="3.2" stroke-linejoin="round"/>'
        + '<path d="M140 88 Q122 84 106 92 Q106 110 122 110 Q138 108 140 88z"' + lens + ' stroke="#8e2548" stroke-width="3.2" stroke-linejoin="round"/>'
        + '<path d="M94 95 L106 95" stroke="#8e2548" stroke-width="3"/>';
    case 5: // sunglasses (opaque lenses)
      return '<rect x="61" y="87" width="33" height="21" rx="9" fill="#15171c"/><rect x="106" y="87" width="33" height="21" rx="9" fill="#15171c"/>'
        + '<path d="M94 95 L106 95" stroke="#15171c" stroke-width="3.4"/>'
        + '<path d="M67 93 L76 93 M112 93 L121 93" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>';
    default: // 4: gold round
      return '<circle cx="78" cy="98" r="13"' + lens + ' stroke="#d4a437" stroke-width="2.6"/><circle cx="122" cy="98" r="13"' + lens + ' stroke="#d4a437" stroke-width="2.6"/>'
        + '<path d="M91 96 Q100 92 109 96" stroke="#d4a437" stroke-width="2.4" fill="none"/>';
  }
}

// ── Hats (drawn over the hair) ───────────────────────────────────────────
// Hats that sit on the crown hide the hair above HAT_LINE (see avSvg);
// the visor and the bandana leave it visible.
var HAT_LINE = 60;
// Hairstyles drawn without the temple underlay (bald, balding, mohawk).
var AV_NO_UNDERLAY = { 0: 1, 16: 1, 17: 1 };
function _hatCovers(i) { return i !== 0 && i !== 3 && i !== 6; }

function _hat(ctx, i) {
  switch (i) {
    case 0: return '';
    case 1: // cap
      return '<path d="M44 70 Q44 16 100 16 Q156 16 156 70z" fill="' + ctx.v('#c63b2e') + '"/>'
        + '<path d="M44 66 L178 64 Q182 76 152 76 L44 74z" fill="' + ctx.v('#a8302a') + '"/><circle cx="100" cy="18" r="5" fill="#a8302a"/>';
    case 2: // fedora
      return '<ellipse cx="100" cy="66" rx="72" ry="12" fill="' + ctx.v('#3a3a42') + '"/>'
        + '<path d="M60 66 Q58 22 80 18 Q100 28 120 18 Q142 22 140 66z" fill="' + ctx.v('#4a4a54') + '"/>'
        + '<path d="M60 52 L140 52 L140 62 L60 62z" fill="#8e2632"/>';
    case 4: // bowler
      return '<ellipse cx="100" cy="66" rx="60" ry="9" fill="' + ctx.v('#26262c') + '"/>'
        + '<path d="M58 66 Q58 14 100 14 Q142 14 142 66z" fill="' + ctx.v('#303038') + '"/><path d="M58 56 L142 56 L142 64 L58 64z" fill="#1a1a1f"/>';
    case 5: // panama
      return '<ellipse cx="100" cy="66" rx="74" ry="13" fill="' + ctx.v('#e9d9ae') + '"/>'
        + '<path d="M60 66 Q58 24 80 20 Q100 28 120 20 Q142 24 140 66z" fill="' + ctx.v('#f1e4c0') + '"/><path d="M60 52 L140 52 L140 62 L60 62z" fill="#26262c"/>';
    case 6: // bandana
      return '<path d="M44 72 Q100 44 156 72 L156 84 Q100 58 44 84z" fill="' + ctx.v('#c02a2a') + '"/>'
        + '<path d="M152 74 Q170 72 174 86 Q164 86 156 80 M154 78 Q166 90 162 100 Q156 92 152 84z" fill="#a02222"/>'
        + '<g fill="#fff" opacity=".75"><circle cx="70" cy="68" r="1.6"/><circle cx="90" cy="62" r="1.6"/><circle cx="110" cy="62" r="1.6"/><circle cx="130" cy="68" r="1.6"/></g>';
    case 7: // flat cap
      return '<path d="M42 72 Q44 26 100 24 Q154 26 158 62 Q180 64 172 74 L42 76z" fill="' + ctx.v('#7d6a52') + '"/>'
        + '<path d="M44 70 L172 70" stroke="#5f4f3c" stroke-width="2"/>';
    case 8: // backwards cap
      return '<path d="M20 50 Q40 40 60 46 L56 58 Q40 52 24 60z" fill="' + ctx.v('#2d6aa3') + '"/>'
        + '<path d="M44 72 Q44 16 100 16 Q156 16 156 72z" fill="' + ctx.v('#3a7cc0') + '"/>'
        + '<path d="M86 72 Q100 56 114 72z" fill="#245784"/>';
    case 9: // beanie
      return '<path d="M44 70 Q42 16 100 16 Q158 16 156 70z" fill="' + ctx.v('#8a2c44') + '"/>'
        + '<rect x="40" y="58" width="120" height="18" rx="9" fill="' + ctx.v('#9e3450') + '"/>'
        + '<path d="M54 60 L54 74 M66 60 L66 74 M78 60 L78 74 M90 60 L90 74 M102 60 L102 74 M114 60 L114 74 M126 60 L126 74 M138 60 L138 74 M150 60 L150 74" stroke="#7a263c" stroke-width="1.6"/>';
    default: // 3: dealer visor
      return '<path d="M44 66 Q100 46 156 66 L156 74 Q100 56 44 74z" fill="#0f5a35"/>'
        + '<path d="M48 70 Q100 52 152 70 L166 88 Q100 66 34 88z" fill="#1f9e5c" opacity=".78"/>';
  }
}

// ── Earrings ─────────────────────────────────────────────────────────────
function _earring(i, x) {
  if (i === 3 || i === 4 || i === 5) return '<circle cx="' + x + '" cy="117" r="5.5" fill="none" stroke="#e0b240" stroke-width="2.4"/>';
  return '<circle cx="' + x + '" cy="111" r="3.4" fill="' + (i === 1 ? '#f4f0e8' : '#e0b240') + '"/>';
}
function _ears(i) {
  if (i === 0) return '';
  if (i === 4) return _earring(i, 46);  // single hoop, left ear only
  if (i === 5) return _earring(i, 154); // single hoop, right ear only
  return _earring(i, 46) + _earring(i, 154);
}

// ── Head shapes ──────────────────────────────────────────────────────────
function _headD(i) {
  if (i === 1) return 'M43 94 A57 55 0 1 0 157 94 A57 55 0 1 0 43 94z'; // round
  if (i === 2) return 'M46 82 Q46 36 100 36 Q154 36 154 82 L154 112 Q154 152 100 152 Q46 152 46 112z'; // square jaw
  return 'M47 94 A53 58 0 1 0 153 94 A53 58 0 1 0 47 94z'; // oval
}
// clipPath of the head outline, scaled by `grow` around the face centre.
function _headClip(ctx, face, grow) {
  var id = ctx.cid + 'hc' + face + '_' + Math.round(grow * 100);
  if (!ctx.seenClip) ctx.seenClip = {};
  if (!ctx.seenClip[id]) {
    ctx.seenClip[id] = 1;
    ctx.defs.push('<clipPath id="' + id + '"><path d="' + _headD(face) + '"'
      + (grow !== 1 ? ' transform="translate(100,94) scale(' + grow + ') translate(-100,-94)"' : '') + '/></clipPath>');
  }
  return id;
}
function _head(ctx, i, skin) {
  var id = ctx.cid + 'hd', g = 'url(#' + id + ')';
  ctx.defs.push('<radialGradient id="' + id + '" cx=".38" cy=".32" r=".8">'
    + '<stop offset="0" stop-color="' + _mix(skin[0], 1.12) + '"/><stop offset=".62" stop-color="' + skin[0] + '"/>'
    + '<stop offset="1" stop-color="' + skin[1] + '"/></radialGradient>');
  return '<path d="' + _headD(i) + '" fill="' + g + '"/>';
}
function _earsSkin(skin) {
  return '<circle cx="47" cy="100" r="10.5" fill="' + skin[0] + '"/><circle cx="153" cy="100" r="10.5" fill="' + skin[1] + '"/>'
    + '<path d="M44 96 Q49 100 45 105 M156 96 Q151 100 155 105" stroke="' + _mix(skin[1], 0.88) + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
}
function _neck(skin) {
  return '<rect x="87" y="134" width="26" height="30" rx="6" fill="' + skin[1] + '"/>';
}

// Wide shapes (round face) and narrow shapes (feminine body) are the same
// drawings scaled around the vertical axis.
function _sx(k, body) {
  return k === 1 ? body : '<g transform="translate(100,0) scale(' + k + ',1) translate(-100,0)">' + body + '</g>';
}

// ── Full portrait ────────────────────────────────────────────────────────
// Frames (square [x, y, size] in the 200x200 space) for the ISOLATED-part
// vignettes rendered by avPartSvg(): each option chip draws ONLY the layer
// being chosen (a lone mouth, a lone hat, an outfit "on a hanger"...) with
// the current recipe's palette (narmod 2026-07-31). Exception: skin marks
// keep the bare head as canvas, they are unreadable alone.
const AV_CROP = {
  face:     [38, 30, 124],
  outfit:   [34, 68, 132],
  marks:    [38, 30, 124],
  hair:     [20, 4, 160],
  beard:    [40, 80, 120],
  eyes:     [58, 66, 84],
  nose:     [80, 94, 40],
  mouth:    [74, 110, 52],
  glasses:  [52, 62, 96],
  shoulder: [116, 116, 80],
  ears:     [30, 86, 40],
  hat:      [16, 2, 168]
};

function _cid() { return 'avc' + Math.floor(Math.random() * 1e9); }
function _wrap(vb, size, ctx, body) {
  return '<svg viewBox="' + vb + '" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">'
    + (ctx.defs.length ? '<defs>' + ctx.defs.join('') + '</defs>' : '') + body + '</svg>';
}

// Isolated-part vignette: only the chosen layer, over the chip's own
// themed background (no backdrop, readable in every palette).
function avPartSvg(axId, i, recipe, size) {
  var r = avNormalize(recipe);
  r[axId] = i;
  var skin = AV_SKIN[r.skin], hc = AV_HAIRC[r.hairc];
  var vb = AV_CROP[axId];
  if (!vb) return avSvg(r, size);
  var ctx = _ctx(_cid()), body = '', h;
  switch (axId) {
    case 'face':    body = _earsSkin(skin) + _head(ctx, i, skin); break;
    case 'marks':   body = _earsSkin(skin) + _head(ctx, r.face, skin) + _marks(i, skin[1]); break;
    case 'outfit':  body = _sx(r.sex === 1 ? 0.86 : 1, _neck(skin) + _outfit(ctx, i, skin)); break;
    case 'hair':    h = _hair(ctx, i, hc);
      body = h[0] + (h[2] ? '<g clip-path="url(#' + _headClip(ctx, r.face, 1.02) + ')">' + h[2] + '</g>' : '') + h[1]; break;
    case 'beard':   body = _beard(ctx, i, hc, r.face); break;
    case 'eyes':    body = _eyes(i, AV_EYEC[r.eyec], skin, r.sex === 1); break;
    case 'nose':    body = _nose(i, skin[1]); break;
    case 'mouth':   body = _mouth(i); break;
    case 'glasses': body = _glasses(i); break;
    case 'hat':     body = _hat(ctx, i); break;
    case 'shoulder':body = ''; break;
    case 'ears':    // one ear + its earring (the right-only hoop is mirrored)
      body = '<circle cx="47" cy="100" r="10.5" fill="' + skin[0] + '"/>' + _earring(i, 46);
      if (i === 0) body = '<circle cx="47" cy="100" r="10.5" fill="' + skin[0] + '"/>';
      break;
    default: return avSvg(r, size);
  }
  return _wrap(vb[0] + ' ' + vb[1] + ' ' + vb[2] + ' ' + vb[2], size, ctx, body);
}

function avSvg(recipe, size) {
  var r = avNormalize(recipe);
  var felt = AV_FELT[r.bg], skin = AV_SKIN[r.skin], hc = AV_HAIRC[r.hairc];
  var sz = size || 200;
  var cid = _cid(), ctx = _ctx(cid);
  var fem = r.sex === 1;
  // Round face (face 1) is wider than the oval the hair, beard and hats
  // were drawn for: widen them so they hug the head.
  var wk = r.face === 1 ? 1.075 : 1;
  var hair = _hair(ctx, r.hair, hc);
  var covers = _hatCovers(r.hat);
  var clipHair = function (s) { return covers && s ? '<g clip-path="url(#' + cid + 'hl)">' + s + '</g>' : s; };
  ctx.defs.push('<clipPath id="' + cid + '"><rect x="6" y="6" width="188" height="188"/></clipPath>'
    + '<clipPath id="' + cid + 'hl"><rect x="0" y="' + HAT_LINE + '" width="200" height="' + (200 - HAT_LINE) + '"/></clipPath>'
    + '<radialGradient id="' + cid + 'bg" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="' + felt[1] + '"/><stop offset="1" stop-color="' + felt[0] + '"/></radialGradient>');
  var body = '<rect width="200" height="200" fill="#8f6a1d"/>'
    + '<rect x="2.5" y="2.5" width="195" height="195" fill="#c9992e"/>'
    + '<rect x="6" y="6" width="188" height="188" fill="url(#' + cid + 'bg)"/>'
    + '<g clip-path="url(#' + cid + ')">'
    + _sx(wk, clipHair(hair[0]
        // Underlay: the hair mass behind the head fills the temples, so
        // the hairline hugs every face shape (no backdrop between hair
        // and skin). Bald, balding and mohawk styles have none.
        + (AV_NO_UNDERLAY[r.hair] ? '' : '<path d="M45 98 Q42 30 100 28 Q158 30 155 98z" fill="' + _mix(hc[0], 0.85) + '"/>')))
    + _sx(fem ? 0.86 : 1, _neck(skin) + _outfit(ctx, r.outfit, skin))
    + _earsSkin(skin)
    + _head(ctx, r.face, skin)
    + (hair[2] ? clipHair('<g clip-path="url(#' + _headClip(ctx, r.face, 1.02) + ')">' + hair[2] + '</g>') : '')
    + _marks(r.marks, skin[1])
    + '<ellipse cx="68" cy="117" rx="9" ry="5.5" fill="#ff7f86" opacity=".32"/>'
    + '<ellipse cx="132" cy="117" rx="9" ry="5.5" fill="#ff7f86" opacity=".32"/>'
    + _nose(r.nose, skin[1])
    + _beard(ctx, r.beard, hc, r.face)
    + _mouth(r.mouth)
    + _eyes(r.eyes, AV_EYEC[r.eyec], skin, fem)
    // Brows follow hair color
    + '<path d="M68 80 Q78 74 88 79 M112 79 Q122 74 132 80" stroke="' + hc[0] + '" stroke-width="4.6" stroke-linecap="round" fill="none"/>'
    + _ears(r.ears)
    + _sx(wk, clipHair(hair[1]))
    + _glasses(r.glasses)
    + _sx(wk, _hat(ctx, r.hat))
    + '</g>'
    + '<rect x="6" y="6" width="188" height="188" fill="none" stroke="#8f6a1d" stroke-width="1"/>';
  return _wrap('0 0 200 200', sz, ctx, body);
}

// Swatch color shown on the option chip for 'color' axes.
function avSwatch(axId, i) {
  if (axId === 'bg') return AV_FELT[i][0];
  if (axId === 'skin') return AV_SKIN[i][0];
  if (axId === 'hairc') return AV_HAIRC[i][0];
  if (axId === 'eyec') return AV_EYEC[i];
  return '#888';
}

export { AV_AXES, AV_DEFAULT, AV_CROP, avSvg, avPartSvg, avSwatch, avNormalize, avRandom, avVisible };
for (const [k, v] of Object.entries({ AV_AXES, AV_DEFAULT, AV_CROP, avSvg, avPartSvg, avSwatch, avNormalize, avRandom, avVisible }))
  window['_' + k] = v;
