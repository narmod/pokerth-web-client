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
// [base, highlight] — black, dark brown, brown, auburn, golden blonde,
// grey, light blonde, white, then (2.1.9-web.189) light brown, light red,
// blue, pink. Brows and beards keep a natural colour on the last two.
const AV_HAIRC = [
  ['#2b2118', '#4d3d2f'], ['#4a3222', '#6f4f37'], ['#7a5530', '#a07848'],
  ['#b14a22', '#d8703f'], ['#dcae50', '#f3d68b'], ['#a9a9a9', '#d4d4d4'],
  ['#ecd7a2', '#fff3cf'], ['#eeeeee', '#ffffff'], ['#9c7b52', '#c2a075'],
  ['#d2874f', '#eeae7c'], ['#3b6fd6', '#6f9af0'], ['#e88ac2', '#f8bfe0']
];
const AV_HAIRC_FANTASY = 10; // from this index on, brows/beard use dark brown
function _hcNatural(i) { return i >= AV_HAIRC_FANTASY ? AV_HAIRC[1] : AV_HAIRC[i]; }
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
// Outfit colours (axis 'outfitc': 0 = as drawn, 1.. = these), applied to
// the plain garments listed in AV_OUTFIT_COLORABLE (narmod 2026-09-27).
const AV_OUTFITC = ['#c0392b', '#2d6aa3', '#2e8b57', '#e6b422', '#8e44ad', '#1f1f24', '#f2f2f2', '#e07aa0'];
const AV_OUTFIT_COLORABLE = { 3: 1, 6: 1, 7: 1, 11: 1, 14: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 1, 23: 1, 24: 1, 25: 1, 26: 1, 27: 1, 28: 1, 29: 1, 30: 1, 31: 1, 32: 1 };

const AV_AXES = [
  { id: 'sex',   label: 'avmSex',       n: 2,               kind: 'shape', none: false },
  { id: 'face',  label: 'avmFace',      n: 5,               kind: 'shape', none: false },
  { id: 'bg',    label: 'avmBg',        n: AV_FELT.length,  kind: 'color', none: false },
  { id: 'outfit',label: 'avmOutfit',    n: 33,              kind: 'shape', none: false },
  { id: 'outfitc', label: 'avmOutfitColor', n: AV_OUTFITC.length + 1, kind: 'color', none: true },
  { id: 'skin',  label: 'avmSkin',      n: AV_SKIN.length,  kind: 'color', none: false },
  { id: 'marks', label: 'avmMarks',     n: 7,               kind: 'shape', none: true  },
  { id: 'hair',  label: 'avmHair',      n: 52,              kind: 'shape', none: true  },
  { id: 'hairc', label: 'avmHairColor', n: AV_HAIRC.length, kind: 'color', none: false },
  { id: 'beard', label: 'avmBeard',     n: 7,               kind: 'shape', none: true  },
  { id: 'eyes',  label: 'avmEyeShape',  n: 7,               kind: 'shape', none: false },
  { id: 'eyec',  label: 'avmEyeColor',  n: AV_EYEC.length,  kind: 'color', none: false },
  { id: 'nose',  label: 'avmNose',      n: 5,               kind: 'shape', none: false },
  { id: 'mouth', label: 'avmMouth',     n: 11,              kind: 'shape', none: false },
  { id: 'glasses', label: 'avmGlasses', n: 6,               kind: 'shape', none: true  },
  { id: 'shoulder', label: 'avmShoulder', n: 5,             kind: 'shape', none: true  },
  { id: 'ears',  label: 'avmEarrings',  n: 6,               kind: 'shape', none: true  },
  { id: 'hat',   label: 'avmHat',       n: 10,              kind: 'shape', none: true  }
];

// Per-option silhouette tags (0 = masculine, 1 = feminine, missing =
// universal). Since 2026-09-27 (narmod: « plus paritaire, quitte à en avoir
// moins ») EVERY hairstyle and EVERY outfit belongs to exactly one
// silhouette; only the small extras (most hats, glasses, earrings, marks,
// eyes, noses, mouths) stay shared. The 'beard' axis is masculine-only as a
// whole. avVisible() lets the UI filter rows coherently with the selected
// sex while the engine still renders any recipe (old recipes stay valid).
const AV_SEXTAG = {
  // 12 masculine: bald, short, slicked back, curly, senior sweep, undercut,
  // afro, close curls, dreadlocks, balding, mohawk, surfer.
  // 14 feminine: high ponytail, bob, bun, long middle part, side braid,
  // pixie, long wavy, pigtails, box braids, low side bun, asymmetric bob,
  // voluminous curls, low ponytail, hollywood waves.
  hair: { 0: 0, 1: 0, 2: 0, 3: 1, 4: 0, 5: 1, 6: 0, 7: 1, 8: 1, 9: 0, 10: 0, 11: 1, 12: 1, 13: 0,
          14: 1, 15: 0, 16: 0, 17: 0, 18: 0, 19: 1, 20: 1, 21: 1, 22: 1, 23: 1, 24: 1, 25: 1,
          // 2026-09-27 additions — masculine: side part, mid-length, ponytail,
          // buzz cut, long curly, curtain fringe; feminine: short bob, crown
          // braid, straight fringe, very long straight, cropped, messy high
          // bun, long locs
          26: 0, 27: 0, 28: 0, 29: 0, 30: 0, 31: 0, 32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1,
          // 2.1.9-web.192 — masculine: short voluminous curls, side part with
          // a wavy quiff, fade, man bun, long straight middle part; feminine:
          // curly ponytail, wavy lob, long curls with a fringe, low braided
          // bun, short natural afro, half-up
          39: 0, 40: 0, 41: 0, 42: 0, 43: 0, 44: 1, 45: 1, 46: 1, 47: 1, 48: 1, 49: 1,
          // 2.1.9-web.201 — bed head (just out of bed), one per silhouette
          50: 0, 51: 1 },
  // 9 masculine: charcoal suit, navy + tie, vest + tie, tux + bow tie, open
  // shirt, white dinner jacket, leather jacket, hoodie, open-collar shirt.
  // 8 feminine: collared sweater, V-neck blouse, turtleneck, strapless
  // dress, V-neck dress, halter dress, scoop top + necklace, blazer + scarf.
  outfit: { 0: 0, 1: 0, 2: 0, 3: 1, 4: 0, 5: 0, 6: 1, 7: 1, 8: 0, 9: 1, 10: 0, 11: 0, 12: 1, 13: 1, 14: 1, 15: 0, 16: 1,
            // 2026-09-27 additions — masculine: tee, polo, plaid shirt,
            // crew-neck sweater, denim jacket, bomber (was a tank top), football jersey, zip
            // hoodie; feminine: floral blouse, strap dress, bow blouse,
            // tailored blazer, cardigan, sweatshirt, swimsuit, tee
            17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 1, 26: 1, 27: 1, 28: 1, 29: 1, 30: 1, 31: 1, 32: 1 },
  // 2.1.9-web.193 (narmod: "some men look too feminine"): every earring,
  // the pout, the small 'o' and the beauty mark are feminine; men get a
  // cigar (mouth 10) and a cheek scar (marks 6) instead.
  mouth: { 3: 1, 5: 1, 7: 1, 10: 0 },      // lipstick, pout, small o | cigar
  marks: { 2: 1, 6: 0 },                    // beauty mark | cheek scar
  glasses: { 3: 1 },                        // cat-eye
  ears: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },   // pearl studs, gold studs, hoops, single hoops
  hat: { 4: 0, 7: 0 }                       // bowler, flat cap
};

function avVisible(axId, i, recipe) {
  // Option 0 of an optional axis ('none') is always a valid value --
  // it is what recipes are sanitized to when an axis gets filtered out.
  // Shoulder accessories are retired with the toon style (narmod
  // 2026-09-27): only 'none' stays, which hides the row in the studio.
  if (axId === 'shoulder') return i === 0;
  if (axId === 'beard') return i === 0 || !(recipe && recipe.sex === 1);
  if (recipe && axId === 'hat' && i !== 0) {
    // Voluminous or tall hairstyles (bun, afro, mohawk, crown braid, high
    // bun) don't fit under a hat.
    if (recipe.hair === 7 || recipe.hair === 10 || recipe.hair === 17 || recipe.hair === 33 || recipe.hair === 37 || recipe.hair === 42) return false;
  }
  if (recipe && axId === 'eyec') {
    // Eye color is meaningless behind closed eyes or sunglasses.
    if (recipe.eyes === 2 || recipe.glasses === 5) return false;
  }
  var tags = AV_SEXTAG[axId];
  if (!tags || !(i in tags) || !recipe) return true;
  return tags[i] === recipe.sex;
}

const AV_DEFAULT = { sex: 0, face: 0, bg: 0, outfit: 0, outfitc: 0, skin: 1, marks: 0, hair: 1, hairc: 1,
                     beard: 0, eyes: 0, eyec: 0, nose: 0, mouth: 0, glasses: 0, shoulder: 0, ears: 0, hat: 0 };

function avNormalize(r) {
  var out = {};
  AV_AXES.forEach(function (ax) {
    var v = r && typeof r[ax.id] === 'number' ? Math.floor(r[ax.id]) : AV_DEFAULT[ax.id];
    out[ax.id] = (v >= 0 && v < ax.n) ? v : AV_DEFAULT[ax.id];
  });
  return out;
}

// Dice-only rules: optional extras are rarer, so random portraits stay
// coherent instead of piling a hat, glasses, earrings and marks on every
// face (narmod 2026-09-27). Silhouette coherence itself comes from
// AV_SEXTAG through avVisible(), shared with the studio rows.
// Relative dice weights (default 1): striking styles stay possible but rare.
const AV_RANDWEIGHT = {
  hair: { 0: 0.35, 10: 0.6, 11: 0.6, 15: 0.5, 16: 0.4, 17: 0.2, 23: 0.6, 28: 0.5, 29: 0.5, 30: 0.5, 33: 0.6, 38: 0.6, 42: 0.4, 48: 0.6 },
  hairc: { 10: 0.25, 11: 0.25 },
  mouth: { 10: 0.35 },
  outfit: { 31: 0.4 }
};
// Probability that an optional axis stays on 'none' ([masculine, feminine]).
const AV_RANDNONE = { marks: [0.65, 0.65], beard: [0.45, 1], glasses: [0.7, 0.7], ears: [0.85, 0.45], hat: [0.7, 0.75] };

function _randOk(axId, i, r) {
  // The high ponytail is not drawn under a hat (the studio still allows it).
  if (axId === 'hat' && i !== 0 && r.hair === 3) return false;
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
    var w = AV_RANDWEIGHT[ax.id] || {}, total = 0;
    opts.forEach(function (v) { total += (v in w) ? w[v] : 1; });
    var pick = Math.random() * total;
    r[ax.id] = opts.length ? opts[opts.length - 1] : 0;
    for (var k = 0; k < opts.length; k++) {
      pick -= (opts[k] in w) ? w[opts[k]] : 1;
      if (pick < 0) { r[ax.id] = opts[k]; break; }
    }
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

// Clip to the body silhouette (patterns: plaid, stripes, flowers).
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

// oc: outfit colour override (hex) for the colourable garments, or null.
function _outfit(ctx, i, skin, oc) {
  var sk = ctx.v(skin[0]);
  var C = function (def) { return (oc && AV_OUTFIT_COLORABLE[i]) ? oc : def; };
  var c;
  switch (i) {
    case 17: // plain tee (masculine)
      c = C('#3d7bd6');
      return _torso(ctx, c) + _crew(ctx, sk, c);
    case 18: // polo
      c = C('#2e8b57');
      return _torso(ctx, c) + _collarFlaps(ctx, sk, c)
        + '<circle cx="100" cy="184" r="1.6" fill="' + _mix(c, 0.6) + '"/><circle cx="100" cy="192" r="1.6" fill="' + _mix(c, 0.6) + '"/>';
    case 19: { // plaid shirt
      c = C('#b0233f');
      var ln = _mix(c, 0.62), grid = '';
      for (var gx = 40; gx <= 166; gx += 14) grid += '<line x1="' + gx + '" y1="150" x2="' + gx + '" y2="206"/>';
      for (var gy = 160; gy <= 206; gy += 14) grid += '<line x1="30" y1="' + gy + '" x2="170" y2="' + gy + '"/>';
      return _torso(ctx, c)
        + '<g clip-path="' + _bodyClip(ctx) + '" stroke="' + ln + '" stroke-width="3" opacity=".55">' + grid + '</g>'
        + _collarFlaps(ctx, sk, c);
    }
    case 20: // crew-neck sweater
      c = C('#5b6bb0');
      return _torso(ctx, c) + _crew(ctx, sk, c)
        + '<path d="M40 198 L160 198 M38 202 L162 202" stroke="' + _mix(c, 0.8) + '" stroke-width="1.4" opacity=".7"/>';
    case 21: { // denim jacket over a tee (the tee takes the colour)
      c = C('#e8e4da');
      var dn = '#4a6fa5', st = '#c9d3e6';
      return _torso(ctx, c) + _crew(ctx, sk, c)
        + '<path d="M84 158 L58 170 L86 204 L94 176z" fill="' + ctx.v(dn) + '"/>'
        + '<path d="M116 158 L142 170 L114 204 L106 176z" fill="' + ctx.v(_mix(dn, 0.9)) + '"/>'
        + '<path d="M34 204 Q34 160 84 158 L58 170 L86 204z M166 204 Q166 160 116 158 L142 170 L114 204z" fill="' + ctx.v(dn) + '"/>'
        + '<path d="M62 172 L88 202 M138 172 L112 202" stroke="' + st + '" stroke-width="1.2" fill="none" opacity=".8"/>'
        + '<rect x="48" y="180" width="14" height="11" rx="2" fill="none" stroke="' + st + '" stroke-width="1.2"/>';
    }
    case 22: // bomber jacket over a white tee (masculine) — was a tank top,
      // which read as a strapless top on the cropped torso (2.1.9-web.196)
      c = C('#4b5a3a');
      return _torso(ctx, c)
        + '<path d="M88 157 L100 174 L112 157 Q100 162 88 157z" fill="#eeeeee"/>'
        + '<path d="M78 157 Q100 172 122 157" stroke="' + _mix(c, 0.62) + '" stroke-width="7" fill="none"/>'
        + '<path d="M82 160 Q100 174 118 160" stroke="' + _mix(c, 0.82) + '" stroke-width="1.2" fill="none" stroke-dasharray="1.5 2"/>'
        + '<path d="M100 172 L100 204" stroke="#c8c8c8" stroke-width="2.6"/><path d="M100 172 L100 204" stroke="#6a6a6a" stroke-width="1" stroke-dasharray="1 2.2"/>'
        + '<circle cx="100" cy="176" r="2" fill="#9a9a9a"/>'
        + '<path d="M48 188 L64 188 M136 188 L152 188" stroke="' + _mix(c, 0.62) + '" stroke-width="3" stroke-linecap="round"/>';
    case 23: { // football jersey (vertical stripes)
      c = C('#1f6fd6');
      var sp = '';
      for (var sx = 46; sx <= 154; sx += 24) sp += '<rect x="' + sx + '" y="150" width="10" height="60"/>';
      return _torso(ctx, c)
        + '<g clip-path="' + _bodyClip(ctx) + '" fill="#f4f4f4" opacity=".85">' + sp + '</g>'
        + '<path d="M88 157 L100 176 L112 157 Q100 162 88 157z" fill="' + sk + '"/>'
        + '<path d="M86 156 L100 178 L114 156" stroke="#f4f4f4" stroke-width="3" fill="none" stroke-linejoin="round"/>';
    }
    case 24: // zip hoodie (light)
      c = C('#c9ced6');
      return _torso(ctx, c)
        + '<path d="M74 158 Q70 176 100 180 Q130 176 126 158 Q116 170 100 170 Q84 170 74 158z" fill="' + ctx.v(_mix(c, 1.1)) + '"/>'
        + '<path d="M100 178 L100 204" stroke="' + _mix(c, 0.6) + '" stroke-width="2" stroke-dasharray="2 1.5"/>'
        + '<path d="M93 176 L90 194 M107 176 L110 194" stroke="' + _mix(c, 0.7) + '" stroke-width="2" stroke-linecap="round"/>';
    case 25: { // floral blouse (feminine)
      c = C('#e9c4d3');
      var fl = '', pts = [[52, 176], [70, 194], [88, 172], [112, 190], [132, 172], [150, 192], [60, 200], [100, 202], [140, 204]];
      pts.forEach(function (pt) {
        fl += '<circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="3.2" fill="' + _mix(c, 0.72) + '"/><circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="1.2" fill="#fff6c8"/>';
      });
      return _torso(ctx, c) + '<g clip-path="' + _bodyClip(ctx) + '">' + fl + '</g>'
        + '<path d="M84 157 Q100 174 116 157 Q100 162 84 157z" fill="' + sk + '"/>';
    }
    case 26: // strap dress (feminine)
      c = C('#d9536a');
      return _skinTorso(ctx, skin)
        + '<path d="M58 204 L62 180 Q80 172 100 174 Q120 172 138 180 L142 204z" fill="' + ctx.v(c) + '"/>'
        + '<path d="M76 160 L78 180 M124 160 L122 180" stroke="' + _mix(c, 0.85) + '" stroke-width="3" stroke-linecap="round"/>';
    case 27: // pussy-bow blouse (feminine)
      c = C('#f3efe6');
      return _torso(ctx, c)
        + '<path d="M86 156 Q100 166 114 156 L112 162 Q100 172 88 162z" fill="' + _mix(c, 0.9) + '"/>'
        + '<path d="M100 168 Q84 158 82 170 Q84 180 100 170 Q116 180 118 170 Q116 158 100 168z" fill="' + _mix(c, 0.82) + '"/>'
        + '<path d="M96 170 L92 196 M104 170 L108 196" stroke="' + _mix(c, 0.82) + '" stroke-width="4" stroke-linecap="round"/>'
        + '<circle cx="100" cy="169" r="3" fill="' + _mix(c, 0.7) + '"/>';
    case 28: // tailored blazer (feminine)
      c = C('#3a3f5c');
      return _torso(ctx, c) + _shirtV(ctx, '#f4f0e6') + _lapels(ctx, _mix(c, 0.85))
        + '<circle cx="100" cy="198" r="2" fill="' + _mix(c, 0.6) + '"/>';
    case 29: // cardigan over a light top (feminine)
      c = C('#7a5c9a');
      return _torso(ctx, '#f4f0e6')
        + '<path d="M86 157 Q100 174 114 157 Q100 162 86 157z" fill="' + sk + '"/>'
        + '<path d="M34 204 Q34 160 90 157 L92 204z" fill="' + ctx.v(c) + '"/>'
        + '<path d="M166 204 Q166 160 110 157 L108 204z" fill="' + ctx.v(_mix(c, 0.9)) + '"/>'
        + '<circle cx="90" cy="176" r="1.8" fill="' + _mix(c, 0.6) + '"/><circle cx="90" cy="188" r="1.8" fill="' + _mix(c, 0.6) + '"/><circle cx="90" cy="200" r="1.8" fill="' + _mix(c, 0.6) + '"/>';
    case 30: // sweatshirt (feminine)
      c = C('#e07aa0');
      return _torso(ctx, c) + _crew(ctx, sk, c)
        + '<path d="M40 200 L160 200" stroke="' + _mix(c, 0.8) + '" stroke-width="1.6" opacity=".7"/>';
    case 31: // one-piece swimsuit (feminine)
      c = C('#2d6aa3');
      return _skinTorso(ctx, skin)
        + '<path d="M64 204 L68 178 Q84 170 100 172 Q116 170 132 178 L136 204z" fill="' + ctx.v(c) + '"/>'
        + '<path d="M80 160 L82 178 M120 160 L118 178" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/>';
    case 32: // scoop tee (feminine)
      c = C('#e5b94e');
      return _torso(ctx, c)
        + '<path d="M82 157 Q100 180 118 157 Q100 163 82 157z" fill="' + sk + '"/>'
        + '<path d="M80 156 Q100 182 120 156" stroke="' + _mix(c, 0.78) + '" stroke-width="3.4" fill="none"/>';
    case 5: // open-collar shirt, no jacket (casual)
      return _torso(ctx, '#e6dfcf')
        + '<path d="M92 158 L100 172 L108 158z" fill="' + sk + '"/>'
        + '<path d="M86 156 Q92 166 99 170 L92 178 Q84 168 84 158z" fill="#f6f1e6"/>'
        + '<path d="M114 156 Q108 166 101 170 L108 178 Q116 168 116 158z" fill="#ece5d6"/>';
    case 6: // V-neck blouse (feminine)
      c = C('#b34a7f');
      return _torso(ctx, c)
        + '<path d="M86 157 L100 184 L114 157 Q100 162 86 157z" fill="' + sk + '"/>'
        + '<path d="M84 157 L100 186 L116 157" stroke="' + _mix(c, 1.18) + '" stroke-width="3" fill="none" stroke-linejoin="round"/>';
    case 7: // dark turtleneck
      c = C('#2f343d');
      return _torso(ctx, c)
        + '<rect x="84" y="140" width="32" height="24" rx="10" fill="' + ctx.v(_mix(c, 1.2)) + '"/>'
        + '<path d="M86 150 L114 150 M86 156 L114 156" stroke="' + _mix(c, 0.85) + '" stroke-width="1.6"/>';
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
      c = C('#6a7380');
      return _torso(ctx, c)
        + '<path d="M74 158 Q70 176 100 180 Q130 176 126 158 Q116 170 100 170 Q84 170 74 158z" fill="' + ctx.v(_mix(c, 1.15)) + '"/>'
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
      return _torso(ctx, C('#8a3f86'))
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
    case 3: // teal sweater with a round white collar (feminine)
      c = C('#2a8f86');
      return _torso(ctx, c)
        + '<path d="M80 160 Q100 178 120 160 Q100 168 80 160z" fill="' + ctx.v(_mix(c, 0.8)) + '"/>'
        + '<path d="M78 156 Q88 172 100 170 Q112 172 122 156 Q112 164 100 162 Q88 164 78 156z" fill="#f7f4ec"/>'
        + '<circle cx="100" cy="176" r="2.2" fill="#f7f4ec"/><circle cx="100" cy="186" r="2.2" fill="#f7f4ec"/>';
    default: { // 0 charcoal suit, 1 navy + tie, 2 grey + vest + tie, 4 tux + bow tie
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

function _hair(ctx, i, hc, face) {
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
      return ['', '<circle cx="100" cy="28" r="17" fill="' + f + '"/>' + P(CAP_SMOOTH)
        + '<path d="M86 38 Q100 32 114 38" stroke="#d9536a" stroke-width="4" stroke-linecap="round" fill="none"/>' + _shine(hl)];
    case 8: // long, middle part
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L166 184 Q146 192 132 178 L68 178 Q54 192 34 184z', bk),
        P(CAP_MID) + _shine(hl)];
    case 9: // undercut: tight sides, volume swept on top
      return ['', P('M46 92 Q44 60 58 50 L142 50 Q156 60 154 92 Q150 72 140 66 L60 66 Q50 72 46 92z', dk)
        + P('M52 64 Q44 18 104 16 Q152 16 162 44 Q146 40 140 54 Q112 50 88 64 Q70 58 52 64z') + _shine(hl)];
    case 10: // afro
      return ['<circle cx="100" cy="76" r="64" fill="' + f + '"/>',
        P('M42 92 Q36 24 100 18 Q164 24 158 92 Q150 64 100 58 Q50 64 42 92z')
        + _bumps(100, 76, 54, 200, 340, 9, 5, hl).replace(/fill=/g, 'opacity=".25" fill=')];
    case 11: // side braid over the shoulder
      // The braid comes out from behind the ear (back layer) and its lower
      // part lies over the shoulder (same beads redrawn in the front layer).
      return [_braid(50, 100, 46, 190, 8, f, dk), P(CAP_SIDE) + _braid(50, 100, 46, 190, 8, f, dk, 150) + _shine(hl)];
    case 12: // pixie cut with fringe
      return ['', P('M44 90 Q40 26 100 24 Q160 26 156 86 Q152 70 146 66 Q120 52 70 74 Q62 64 52 68 Q46 78 44 90z') + _shine(hl)];
    case 13: // tight curls, close cut
      return ['', P('M46 86 Q44 32 100 30 Q156 32 154 86 Q150 64 100 58 Q50 64 46 86z')
        + _bumps(100, 80, 40, 200, 340, 9, 2.2, dk) + _bumps(100, 80, 30, 215, 325, 6, 2.2, dk)];
    case 14: // long wavy
      return [P('M40 96 Q34 24 100 22 Q166 24 160 96 Q170 116 160 136 Q172 158 162 186 Q146 192 132 178 L68 178 Q54 192 38 186 Q28 158 40 136 Q30 116 40 96z', bk),
        P(CAP_SIDE) + _shine(hl)];
    case 15: { // dreadlocks (masculine): twists radiating from the crown, locks of
      // uneven length down both sides, each with its knotted texture (2.1.9-web.198)
      var locks = '', tw = '';
      [[40, 74], [50, 96], [60, 88], [70, 70], [130, 70], [140, 88], [150, 96], [160, 74]].forEach(function (p, k) {
        locks += '<rect x="' + (p[0] - 5) + '" y="72" width="10" height="' + p[1] + '" rx="5" fill="' + (k % 2 ? bk : f) + '"/>'
          + '<path d="M' + p[0] + ' 84 L' + p[0] + ' ' + (62 + p[1]) + '" stroke="' + dk + '" stroke-width="1.4" stroke-dasharray="2.5 3.5" opacity=".7"/>';
      });
      for (var ta = 196; ta <= 344; ta += 18.5) {
        var ang = ta * Math.PI / 180;
        tw += '<path d="M100 62 Q' + (100 + 28 * Math.cos(ang)).toFixed(1) + ' ' + (74 + 20 * Math.sin(ang)).toFixed(1) + ' ' + (100 + 53 * Math.cos(ang)).toFixed(1) + ' ' + (86 + 48 * Math.sin(ang)).toFixed(1) + '" stroke="' + dk + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      }
      return [locks, P('M44 96 Q40 24 100 22 Q160 24 156 96 Q152 62 100 56 Q48 62 44 96z') + tw + _bumps(100, 84, 50, 205, 335, 6, 3.4, hl).replace(/fill=/g, 'opacity=".45" fill=')];
    }
    case 16: { // balding crown (masculine): a crown of hair hugging the head outline
      var band = ctx.cid + 'bb';
      if (!ctx.seenClip) ctx.seenClip = {};
      if (!ctx.seenClip[band]) {
        ctx.seenClip[band] = 1;
        ctx.defs.push('<clipPath id="' + band + '"><path d="M0 68 Q30 58 60 70 L60 122 L0 122z M200 68 Q170 58 140 70 L140 122 L200 122z"/></clipPath>');
      }
      // Back: the hair round the back of the head peeks out on both sides
      // (the head outline itself, grown, so it hugs every face); the crown
      // keeps its shine. (The former temple tufts read as blocks beside
      // the wider masculine outlines — gone in 2.1.9-web.195.)
      return ['<g clip-path="url(#' + band + ')"><path d="' + _headD(face || 0) + '" fill="' + f + '" transform="translate(100,94) scale(1.1) translate(-100,-94)"/></g>',
        '<ellipse cx="84" cy="48" rx="14" ry="7" fill="#fff" opacity=".35"/>'];
    }
    case 17: // mohawk crest
      return ['', P('M86 62 L80 36 L90 40 L92 12 L100 26 L108 12 L110 40 L120 36 L114 62z'),
        '<path d="M0 0 L200 0 L200 96 Q152 62 100 56 Q48 62 0 96z" fill="' + hc[0] + '" opacity=".4"/>'];
    case 18: // tousled mid-length (surfer)
      return [P('M40 96 Q36 26 100 24 Q164 26 160 96 Q164 116 152 126 Q148 112 142 104 L58 104 Q52 112 48 126 Q36 116 40 96z', bk),
        P('M42 100 Q34 22 100 20 Q166 22 158 100 L150 64 L140 68 L132 54 L118 64 L106 50 L94 64 L80 52 L70 66 L58 58 L50 76z') + _shine(hl)];
    case 19: // pigtails (feminine)
      // Pigtails hang BEHIND the head and the ears (back layer): only the
      // part outside the head outline shows, so they hug the cheeks.
      return [P('M58 74 Q22 84 24 136 Q26 172 42 178 Q58 172 56 130z', bk) + P('M142 74 Q178 84 176 136 Q174 172 158 178 Q142 172 144 130z', bk),
        P(CAP_MID) + '<circle cx="40" cy="86" r="5" fill="#d9536a"/><circle cx="160" cy="86" r="5" fill="#d9536a"/>' + _shine(hl)];
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
        P('M40 120 Q34 24 100 22 Q160 24 156 96 Q150 64 130 54 Q94 56 72 70 Q56 90 58 140z') + _shine(hl)];
    case 23: // long voluminous curls
      return [P('M36 96 Q32 22 100 20 Q168 22 164 96 L168 180 L32 180z', bk)
        + [100, 124, 148, 172].map(function (y) { return '<circle cx="32" cy="' + y + '" r="12" fill="' + bk + '"/><circle cx="168" cy="' + y + '" r="12" fill="' + bk + '"/>'; }).join(''),
        P(CAP_SIDE) + _bumps(100, 84, 50, 195, 250, 4, 10, f)];
    case 24: // low ponytail swept over one shoulder
      return ['', P(CAP_SMOOTH) + P('M146 104 Q176 118 168 190 Q158 198 150 188 Q160 150 142 134 Q150 120 146 104z')
        + '<circle cx="150" cy="112" r="5" fill="#d9536a"/>' + _shine(hl)];
    case 25: // vintage hollywood waves
      return [P('M40 100 Q36 24 100 22 Q164 24 160 100 Q168 118 158 136 L142 140 L58 140 L42 136 Q32 118 40 100z', bk),
        P('M42 108 Q36 24 100 22 Q160 24 156 96 Q150 64 128 56 Q108 62 96 52 Q82 68 64 64 Q50 78 58 104 Q44 112 42 108z')
        + '<path d="M60 70 Q72 58 86 66 M112 58 Q126 50 140 62" stroke="' + hl + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>'];
    // ── 2026-09-27 additions ──
    case 26: // side part (masculine)
      return ['', P('M44 96 Q40 26 100 24 Q160 26 156 96 Q152 62 140 56 Q116 52 96 60 Q80 52 60 66 Q48 74 44 96z')
        + '<path d="M70 54 Q78 42 96 38" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>' + _shine(hl)];
    case 27: // mid-length, tucked behind the ears (masculine)
      return [P('M40 96 Q36 26 100 24 Q164 26 160 96 L162 150 Q150 158 138 148 L62 148 Q50 158 38 150z', bk),
        P('M44 100 Q40 26 100 24 Q160 26 156 100 Q152 62 130 56 Q104 66 88 50 Q76 66 54 70 Q46 82 44 100z') + _shine(hl)];
    case 28: // ponytail (masculine): slicked back + a low tail
      return [P('M136 108 Q170 122 160 176 Q150 184 144 176 Q152 146 132 122z', bk),
        P('M46 88 Q42 24 100 22 Q158 24 154 88 Q152 60 138 52 Q100 42 62 52 Q48 60 46 88z')
        + '<path d="M70 40 Q100 30 130 40" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
        + '<circle cx="138" cy="118" r="4.5" fill="' + dk + '"/>' + _shine(hl)];
    case 29: // buzz cut (masculine): a shadow of hair on the scalp
      return ['', '', '<path d="M0 0 L200 0 L200 100 Q152 62 100 56 Q48 62 0 100z" fill="' + hc[0] + '" opacity=".55"/>'];
    case 30: // long curly (masculine): a wavy mass to the shoulders, curls along its edge (no side sausages: 2.1.9-web.201)
      return [P('M38 96 Q34 22 100 20 Q166 22 162 96 Q168 118 160 134 Q170 152 158 164 Q142 170 134 160 L66 160 Q58 170 42 164 Q30 152 40 134 Q32 118 38 96z', bk)
        + '<circle cx="46" cy="164" r="9" fill="' + bk + '"/><circle cx="62" cy="168" r="8" fill="' + bk + '"/><circle cx="154" cy="164" r="9" fill="' + bk + '"/><circle cx="138" cy="168" r="8" fill="' + bk + '"/>'
        + '<path d="M44 120 Q38 134 46 148 M156 120 Q162 134 154 148" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>',
        P(CAP_SMOOTH) + _bumps(100, 84, 50, 190, 350, 11, 12, f) + _bumps(100, 84, 50, 200, 340, 6, 4, hl)];
    case 31: // curtain fringe (masculine)
      return ['', P('M44 100 Q40 26 100 24 Q160 26 156 100 Q150 70 128 88 Q116 66 100 58 Q84 66 72 88 Q50 70 44 100z') + _shine(hl)];
    case 32: // short bob, chin length (feminine)
      return [P('M40 100 Q36 24 100 22 Q164 24 160 100 L162 124 Q150 134 138 126 L62 126 Q50 134 38 124z', bk),
        P(CAP_SIDE) + _shine(hl)];
    case 33: // crown braid (feminine)
      return ['', P(CAP_SMOOTH) + _bumps(100, 84, 52, 200, 340, 12, 6, f)
        + _bumps(100, 84, 52, 200, 340, 12, 6, f).replace(/fill="[^"]*"/g, 'fill="none" stroke="' + dk + '" stroke-width="1.2"') + _shine(hl)];
    case 34: // straight fringe, long hair (feminine)
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L164 184 Q146 192 132 178 L68 178 Q54 192 36 184z', bk),
        P('M44 100 Q40 26 100 24 Q160 26 156 100 L154 78 L46 78z') + _shine(hl)];
    case 35: // very long straight hair (feminine)
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L168 204 L32 204z', bk), P(CAP_MID) + _shine(hl)];
    case 36: // cropped (feminine)
      return ['', P('M46 88 Q42 28 100 26 Q158 28 154 88 Q150 64 134 58 Q112 66 96 54 Q80 66 66 60 Q50 66 46 88z') + _shine(hl)];
    case 37: // messy high bun + loose strands (feminine)
      return ['', '<circle cx="100" cy="24" r="17" fill="' + f + '"/>'
        + '<path d="M86 14 Q90 6 98 10 M104 8 Q112 6 114 14" stroke="' + f + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
        + P(CAP_SMOOTH)
        + '<path d="M52 76 Q40 100 50 128 M148 76 Q160 100 150 128" stroke="' + f + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
        + '<path d="M86 38 Q100 32 114 38" stroke="#d9536a" stroke-width="4" stroke-linecap="round" fill="none"/>' + _shine(hl)];
    case 38: { // long locs (feminine): twists from the crown, rounded locks of uneven length down to the chest
      var locks2 = '', tw2 = '';
      [[36, 118], [46, 132], [56, 124], [66, 110], [76, 100], [124, 100], [134, 110], [144, 124], [154, 132], [164, 118]].forEach(function (p, k) {
        locks2 += '<rect x="' + (p[0] - 5.5) + '" y="70" width="11" height="' + p[1] + '" rx="5.5" fill="' + (k % 2 ? bk : f) + '"/>'
          + '<path d="M' + p[0] + ' 84 L' + p[0] + ' ' + (60 + p[1]) + '" stroke="' + dk + '" stroke-width="1.4" stroke-dasharray="2.5 3.5" opacity=".6"/>';
      });
      for (var ta2 = 196; ta2 <= 344; ta2 += 18.5) {
        var ang2 = ta2 * Math.PI / 180;
        tw2 += '<path d="M100 62 Q' + (100 + 28 * Math.cos(ang2)).toFixed(1) + ' ' + (74 + 20 * Math.sin(ang2)).toFixed(1) + ' ' + (100 + 53 * Math.cos(ang2)).toFixed(1) + ' ' + (86 + 48 * Math.sin(ang2)).toFixed(1) + '" stroke="' + dk + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      }
      return [locks2, P('M44 96 Q40 24 100 22 Q160 24 156 96 Q152 62 100 56 Q48 62 44 96z') + tw2 + _bumps(100, 84, 50, 205, 335, 6, 3.4, hl).replace(/fill=/g, 'opacity=".45" fill=')];
    }
    // ── 2.1.9-web.192 additions ──
    case 39: // short voluminous curls (masculine): a tall mop of curls of uneven size, cut above the ears
      return ['', P('M40 90 Q36 18 100 14 Q164 18 160 90 Q152 62 100 56 Q48 62 40 90z')
        + _dots([[50, 72, 11], [58, 52, 12], [72, 36, 13], [90, 26, 12], [110, 24, 13], [128, 32, 12], [142, 46, 13], [152, 66, 11], [68, 62, 9], [86, 46, 10], [106, 40, 9], [124, 48, 10], [138, 64, 9]], f)
        + _dots([[74, 32, 3.5], [110, 20, 3.5], [144, 44, 3.5], [58, 50, 3]], hl, ' opacity=".5"')];
    case 40: // pompadour (masculine): a high front swept back, combed sides
      return ['', P('M46 90 Q42 34 60 26 Q76 6 112 8 Q146 14 154 90 Q152 60 138 52 Q100 44 62 52 Q48 60 46 90z')
        + '<path d="M70 42 Q100 28 132 40 M66 50 Q100 38 136 50" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
        + '<path d="M70 26 Q90 14 112 18" stroke="' + hl + '" stroke-width="6" stroke-linecap="round" fill="none" opacity=".55"/>'];
    case 41: // flat top (masculine): a squared block of hair, the sides shaved to a shadow
      return ['', P('M54 64 L52 30 Q100 22 148 30 L146 64 Q100 56 54 64z') + '<path d="M60 32 L140 32" stroke="' + hl + '" stroke-width="4" stroke-linecap="round" opacity=".45"/>',
        '<path d="M0 60 L200 60 L200 100 Q152 72 100 66 Q48 72 0 100z" fill="' + hc[0] + '" opacity=".32"/>'
        + '<path d="M0 100 L200 100 L200 118 Q152 94 100 90 Q48 94 0 118z" fill="' + hc[0] + '" opacity=".14"/>'];
    case 42: // man bun (masculine): slicked back, a small knot at the crown
      return ['<circle cx="100" cy="30" r="13" fill="' + bk + '"/>',
        P('M46 88 Q42 24 100 22 Q158 24 154 88 Q152 60 138 52 Q100 42 62 52 Q48 60 46 88z')
        + '<path d="M70 40 Q100 30 130 40 M66 48 Q100 36 134 48" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
        + '<path d="M90 30 Q100 26 110 30" stroke="' + dk + '" stroke-width="3" fill="none" stroke-linecap="round"/>' + _shine(hl)];
    case 43: // long straight hair, middle part (masculine): the lengths taper and round off
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L158 150 Q154 172 136 168 L64 168 Q46 172 42 150z', bk),
        P(CAP_MID) + _shine(hl)];
    case 44: // curly ponytail (feminine): a tied cluster of curls behind
      return [_dots([[150, 46, 10], [166, 56, 11], [178, 76, 12], [172, 98, 12], [182, 118, 11], [170, 138, 11], [158, 154, 10], [174, 158, 9]], bk)
        + _dots([[168, 52, 3.5], [176, 96, 3.5], [172, 136, 3.5]], hl, ' opacity=".4"'),
        P(CAP_SMOOTH) + _bumps(100, 84, 50, 200, 340, 7, 5, hl).replace(/fill=/g, 'opacity=".5" fill=') + '<circle cx="146" cy="40" r="6" fill="#d9536a"/>' + _shine(hl)];
    case 45: // wavy lob (feminine): mid-length with waved edges
      return [P('M38 100 Q34 24 100 22 Q166 24 162 100 Q170 116 160 130 Q170 146 158 156 Q142 158 134 148 L66 148 Q58 158 42 156 Q30 146 40 130 Q30 116 38 100z', bk),
        P(CAP_SIDE) + '<path d="M56 100 Q50 116 56 132 M144 100 Q150 116 144 132" stroke="' + hl + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>' + _shine(hl)];
    case 46: // long curls with a fringe (feminine)
      return [P('M36 96 Q32 22 100 20 Q168 22 164 96 L168 180 L32 180z', bk)
        + [100, 124, 148, 172].map(function (y) { return '<circle cx="32" cy="' + y + '" r="12" fill="' + bk + '"/><circle cx="168" cy="' + y + '" r="12" fill="' + bk + '"/>'; }).join(''),
        P('M44 100 Q40 26 100 24 Q160 26 156 100 L154 70 L46 70z') + _bumps(100, 70, 54, 180, 360, 10, 6, f) + _shine(hl)];
    case 47: // low braided bun (feminine): a plaited knot at the nape, one side
      return ['<circle cx="50" cy="134" r="18" fill="' + bk + '"/>' + _bumps(50, 134, 11, 0, 300, 6, 4.5, f).replace(/\/>/g, ' stroke="' + hl + '" stroke-width="1.2" opacity=".85"/>')
        + '<circle cx="50" cy="134" r="18" fill="none" stroke="' + hl + '" stroke-width="1.2" opacity=".5"/>',
        P(CAP_SMOOTH) + '<path d="M62 30 Q100 22 138 30 M56 44 Q100 34 144 44" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>' + _shine(hl)];
    case 48: // short natural afro (feminine): a curly outline, a little volume
      return ['', P('M40 92 Q36 20 100 16 Q164 20 160 92 Q152 60 100 54 Q48 60 40 92z')
        + _bumps(100, 84, 58, 188, 352, 21, 4.5, f) + _bumps(100, 84, 62, 192, 348, 19, 4, f) + _bumps(100, 84, 50, 205, 335, 6, 3.5, hl).replace(/fill=/g, 'opacity=".3" fill=')];
    case 49: // half-up (feminine): the top tied at the crown, the rest down
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L166 184 Q146 192 132 178 L68 178 Q54 192 34 184z', bk)
        + '<ellipse cx="100" cy="22" rx="14" ry="8" fill="' + bk + '"/>',
        P(CAP_SMOOTH) + '<path d="M86 34 Q100 28 114 34" stroke="#d9536a" stroke-width="4" stroke-linecap="round" fill="none"/>' + _shine(hl)];
    case 50: // bed head (masculine): tufts sticking out every which way, a flattened side
      return ['', P('M42 96 Q38 40 56 30 L48 12 L66 24 L74 6 L84 22 L98 0 L106 20 L120 6 L124 24 L142 10 L140 30 L158 22 L152 40 Q160 60 156 96 Q152 66 100 58 Q48 66 42 96z')
        + '<path d="M46 76 Q30 70 34 58 M154 72 Q170 68 168 56 M146 42 Q160 34 168 42" stroke="' + f + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
        + '<path d="M60 40 Q70 28 84 32 M108 30 Q122 22 134 34" stroke="' + hl + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>'];
    case 51: // bed head (feminine): mid-length, tousled, flyaway strands
      return [P('M38 100 Q34 24 100 22 Q166 24 162 100 Q170 118 158 136 Q166 156 150 160 Q138 156 132 146 L68 146 Q62 156 50 160 Q34 156 42 136 Q30 118 38 100z', bk)
        + '<path d="M40 110 Q30 104 32 96 M160 106 Q170 100 168 92 M46 140 Q36 146 38 154 M154 140 Q164 146 162 154 M36 126 Q26 128 28 136" stroke="' + bk + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
        P('M42 100 Q38 34 62 28 L58 12 L72 26 L86 8 L94 26 L108 4 L114 26 L130 12 L134 30 Q160 34 156 100 Q152 70 142 60 Q112 64 88 46 Q78 66 52 72 Q46 84 42 100z')
        + '<path d="M56 48 Q68 34 84 38" stroke="' + hl + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>'];
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
// (the outer edges sit well outside every head outline — the clip draws
// the sideburn line — only the cheek line in the middle matters)
// (sideburns start at ear-lobe level, y ≈ 104–106 — the former y 90–96
// framed the face up to the eyes: 2.1.9-web.201)
var BEARD_SHORT = 'M10 170 L24 126 Q30 108 40 106 Q52 130 70 134 Q86 124 100 126 Q114 124 130 134 Q148 130 160 106 Q170 108 176 126 L190 170 L190 220 L10 220z';
var BEARD_FULL = 'M10 170 L22 124 Q26 104 40 102 Q52 126 72 130 Q86 122 100 124 Q114 122 128 130 Q148 126 160 102 Q174 104 178 124 L190 170 L190 220 L10 220z';

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
    case 6: return jaw(BEARD_FULL, 1.09) // long beard: grows out of the jaw beard and tapers to a rounded point on the chest (2.1.9-web.202)
      + '<path d="M56 128 Q70 146 100 146 Q130 146 144 128 Q142 164 124 186 Q110 202 100 204 Q90 202 76 186 Q58 164 56 128z" fill="' + f + '"/>'
      + '<path d="M84 156 Q88 176 86 192 M100 152 Q102 176 100 198 M116 156 Q112 176 114 192" stroke="' + _mix(hc[0], 0.78) + '" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".75"/>'
      + '<path d="M70 146 Q68 168 78 184 M130 146 Q132 168 122 184" stroke="' + _mix(hc[0], 1.25) + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".45"/>' + MOUS;
    default: return jaw(BEARD_FULL, 1.1) + MOUS; // 4: full beard
  }
}

// ── Noses — solid Mii-like shapes in the skin shadow ─────────────────────
function _nose(i, sh) {
  var dk = _mix(sh, 0.88);
  switch (i) {
    case 1: return '<path d="M98 98 L95 116 Q100 121 105 116 L102 98z" fill="' + sh + '"/>'; // straight, long
    case 2: return '<circle cx="100" cy="114" r="5.5" fill="' + sh + '"/><circle cx="98" cy="112" r="1.6" fill="#fff" opacity=".35"/>'; // upturned button
    case 3: return '<path d="M89 112 Q100 104 111 112 Q113 121 100 122 Q87 121 89 112z" fill="' + sh + '"/>' // wide
      + '<circle cx="93" cy="116" r="1.8" fill="' + dk + '"/><circle cx="107" cy="116" r="1.8" fill="' + dk + '"/>';
    case 4: return '<path d="M99 98 Q112 110 105 119 Q100 122 95 118 Q99 110 99 98z" fill="' + sh + '"/>'; // aquiline
    default: return '<path d="M97 104 Q92 115 95 118 Q100 121 105 118 Q108 115 103 104z" fill="' + sh + '"/>'; // small bulb
  }
}

// ── Eyes (shape x iris color) — bold Mii-like outlines ───────────────────
var EYE_LINE = '#241a12';
// Open eye: outlined sclera, big iris, pupil, highlight, thick upper lid.
function _eye(x, y, ec, rx, ry, ir) {
  rx = rx || 8; ry = ry || 9.5; ir = ir || 5.4;
  return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" stroke="' + EYE_LINE + '" stroke-width="1.6"/>'
    + '<circle cx="' + x + '" cy="' + (y + 1) + '" r="' + ir + '" fill="' + ec + '"/>'
    + '<circle cx="' + x + '" cy="' + (y + 1) + '" r="' + (ir * 0.55).toFixed(1) + '" fill="#15100b"/>'
    + '<circle cx="' + (x + ir * 0.4).toFixed(1) + '" cy="' + (y - ir * 0.35).toFixed(1) + '" r="' + (ir * 0.32).toFixed(1) + '" fill="#fff"/>'
    + '<path d="M' + (x - rx) + ' ' + (y - 1) + ' Q' + x + ' ' + (y - 2 * ry + 1) + ' ' + (x + rx) + ' ' + (y - 1) + '" stroke="' + EYE_LINE + '" stroke-width="3.2" stroke-linecap="round" fill="none"/>';
}
function _closed(x, y) {
  return '<path d="M' + (x - 8) + ' ' + (y + 2) + ' Q' + x + ' ' + (y - 8) + ' ' + (x + 8) + ' ' + (y + 2) + '" stroke="' + EYE_LINE + '" stroke-width="3.8" stroke-linecap="round" fill="none"/>';
}
function _eyes(shape, ec, skin, fem) {
  var L = 78, R = 122, y = 98, s = '';
  if (shape === 2) return _closed(L, y) + _closed(R, y); // closed smiling
  if (shape === 3) { // wink: left open, right closed
    s = _eye(L, y, ec) + _closed(R, y);
  } else if (shape === 4) { // wide, surprised
    s = _eye(L, y, ec, 9.5, 11, 4.4) + _eye(R, y, ec, 9.5, 11, 4.4);
  } else if (shape === 5 || shape === 6) { // heavy-lidded / narrowed, determined
    s = [L, R].map(function (x, k) {
      var lid = shape === 5
        ? 'M' + (x - 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 1) + ' Q' + x + ' ' + (y + 2) + ' ' + (x - 11) + ' ' + (y - 1) + 'z'
        : (k === 0
          ? 'M' + (x - 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 1) + ' L' + (x - 11) + ' ' + (y - 6) + 'z'
          : 'M' + (x - 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 13) + ' L' + (x + 11) + ' ' + (y - 6) + ' L' + (x - 11) + ' ' + (y - 1) + 'z');
      var edge = shape === 5
        ? 'M' + (x - 9) + ' ' + (y - 1) + ' Q' + x + ' ' + (y + 2) + ' ' + (x + 9) + ' ' + (y - 1)
        : (k === 0 ? 'M' + (x - 9) + ' ' + (y - 5.5) + ' L' + (x + 9) + ' ' + (y - 1.5) : 'M' + (x - 9) + ' ' + (y - 1.5) + ' L' + (x + 9) + ' ' + (y - 5.5));
      return _eye(x, y, ec) + '<path d="' + lid + '" fill="' + skin[0] + '"/>'
        + '<path d="' + edge + '" stroke="' + EYE_LINE + '" stroke-width="3.4" stroke-linecap="round" fill="none"/>';
    }).join('');
  } else if (shape === 1) { // almond
    s = [L, R].map(function (x) {
      return '<path d="M' + (x - 10) + ' ' + y + ' Q' + x + ' ' + (y - 11) + ' ' + (x + 10) + ' ' + y + ' Q' + x + ' ' + (y + 8) + ' ' + (x - 10) + ' ' + y + 'z" fill="#fff" stroke="' + EYE_LINE + '" stroke-width="1.4"/>'
        + '<circle cx="' + x + '" cy="' + y + '" r="5" fill="' + ec + '"/><circle cx="' + x + '" cy="' + y + '" r="2.7" fill="#15100b"/>'
        + '<circle cx="' + (x + 2) + '" cy="' + (y - 2) + '" r="1.6" fill="#fff"/>'
        + '<path d="M' + (x - 10) + ' ' + y + ' Q' + x + ' ' + (y - 12) + ' ' + (x + 10) + ' ' + y + '" stroke="' + EYE_LINE + '" stroke-width="3" stroke-linecap="round" fill="none"/>';
    }).join('');
  } else { // 0: round
    s = _eye(L, y, ec) + _eye(R, y, ec);
  }
  if (fem && shape !== 3) { // lashes on the outer corners
    s += '<path d="M69 93 L64 89 M71 90 L67 85 M131 93 L136 89 M129 90 L133 85" stroke="' + EYE_LINE + '" stroke-width="2" stroke-linecap="round"/>';
  } else if (fem) {
    s += '<path d="M69 93 L64 89 M71 90 L67 85" stroke="' + EYE_LINE + '" stroke-width="2" stroke-linecap="round"/>';
  }
  return s;
}

// ── Mouths — filled Mii-like shapes (mouth dark + lower lip) ─────────────
function _mouth(i) {
  var M = '#5e2521', LIP = '#e4837c', TEETH = '#fff';
  var line = function (d) { return '<path d="' + d + '" stroke="' + M + '" stroke-width="4" stroke-linecap="round" fill="none"/>'; };
  switch (i) {
    case 1: // wide grin with teeth
      return '<path d="M82 126 Q100 129 118 126 Q116 150 100 150 Q84 150 82 126z" fill="' + M + '"/>'
        + '<path d="M85 127 Q100 130 115 127 Q114 136 100 137 Q86 136 85 127z" fill="' + TEETH + '"/>'
        + '<path d="M90 141 Q100 148 110 141 Q100 147 90 141z" fill="' + LIP + '"/>';
    case 2: return line('M89 133 L111 133'); // neutral
    case 3: // lipstick
      return '<path d="M85 131 Q92 123 100 129 Q108 123 115 131 Q108 145 100 145 Q92 145 85 131z" fill="#d8304e"/>'
        + '<path d="M86 131 Q100 135 114 131" stroke="#a1203a" stroke-width="1.5" fill="none"/>'
        + '<path d="M94 139 Q100 142 106 139" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".45"/>';
    case 4: return '<path d="M86 133 Q100 141 116 126 Q104 137 86 133z" fill="' + M + '"/>'; // smirk
    case 5: // pout / kiss
      return '<ellipse cx="100" cy="134" rx="6.5" ry="5" fill="#c8635f"/><path d="M95 134 Q100 136 105 134" stroke="#8e3a3a" stroke-width="1.5" fill="none"/>';
    case 6: // open laugh
      return '<path d="M82 126 Q100 124 118 126 Q118 154 100 154 Q82 154 82 126z" fill="' + M + '"/>'
        + '<path d="M84 127 L116 127 L115 132 L85 132z" fill="' + TEETH + '"/>'
        + '<path d="M90 143 Q100 135 110 143 Q108 154 100 154 Q92 154 90 143z" fill="#ef6f75"/>';
    case 7: return '<ellipse cx="100" cy="134" rx="5" ry="6.5" fill="' + M + '"/>'; // small o (surprise)
    case 8: return '<path d="M86 139 Q100 123 114 139 Q100 133 86 139z" fill="' + M + '"/>'; // frown
    case 9: // tongue out
      return line('M89 131 L111 131')
        + '<path d="M94 132 L106 132 Q107 146 100 146 Q93 146 94 132z" fill="#ef6f75"/><path d="M100 136 L100 144" stroke="#c94d58" stroke-width="1.2"/>';
    case 10: // cigar in the corner of the mouth (masculine)
      return line('M89 133 L109 133')
        + '<path d="M106 133 L124 138" stroke="#5a3a22" stroke-width="6.5" stroke-linecap="round"/>'
        + '<path d="M113 134.8 L116 135.6" stroke="#d9b26b" stroke-width="6.5"/>'
        + '<circle cx="124.5" cy="138.2" r="2.8" fill="#ff6a2a"/><circle cx="124.5" cy="138.2" r="1.3" fill="#ffd27a"/>'
        + '<path d="M126 132 Q130 128 127 123" stroke="#c8c8c8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>';
    default: // smile: filled crescent with a lower lip
      return '<path d="M84 127 Q100 151 116 127 Q100 137 84 127z" fill="' + M + '"/>'
        + '<path d="M90 133 Q100 143 110 133 Q100 139 90 133z" fill="' + LIP + '"/>';
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
    case 6: return '<path d="M132 104 L138 124" stroke="#f6d3d0" stroke-width="3" stroke-linecap="round"/><path d="M131 110 L136 109 M133 116 L138 115" stroke="#f6d3d0" stroke-width="1.6" stroke-linecap="round"/>'; // cheek scar (masculine)
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
var AV_NO_UNDERLAY = { 0: 1, 16: 1, 17: 1, 29: 1, 41: 1 };
// Short styles: under a covering hat only a thin band below the brim shows
// (temple tips), long styles keep everything below the hat line.
var AV_SHORT_HAIR = { 1: 1, 2: 1, 4: 1, 6: 1, 9: 1, 12: 1, 13: 1, 16: 1, 18: 1, 26: 1, 29: 1, 31: 1, 36: 1, 39: 1, 40: 1, 41: 1, 48: 1, 50: 1 };
var HAT_SHORT_BOTTOM = 86;
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
function _ears(i, hw) {
  if (i === 0) return '';
  var xl = 100 - (hw || 53) + 6, xr = 200 - xl;
  if (i === 4) return _earring(i, xl - 1);  // single hoop, left ear only
  if (i === 5) return _earring(i, xr + 1); // single hoop, right ear only
  return _earring(i, xl - 1) + _earring(i, xr + 1);
}

// ── Head shapes ──────────────────────────────────────────────────────────
// Head outline by face key k = face + (feminine ? 5 : 0) — the same five
// options read differently per silhouette (2.1.9-web.194/197): the
// masculine shapes carry a wider, flatter jaw; the feminine ones taper to
// a softer chin. Features stay put: eyes ≈ y 94, mouth ≈ 133, chin ≈ 152.
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
function _faceKey(r) { return (r.face || 0) + (r.sex === 1 ? AV_FACE_N : 0); }
// Half-width of each outline at ear level (y ≈ 100): hair, hats, the
// temple underlay and the ears follow it, so nothing floats off a wide
// jaw or pokes out beside a narrow one (drawings are made for ±53).
var HEAD_HW = [55, 59, 54, 50, 57, 51, 56, 55, 49, 53];
function _headHW(k) { return HEAD_HW[k] || 53; }
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
function _earsSkin(skin, hw) {
  var xl = 100 - (hw || 53) + 6, xr = 200 - xl; // ear centres 6 inside the outline
  return '<circle cx="' + xl + '" cy="100" r="10.5" fill="' + skin[0] + '"/><circle cx="' + xr + '" cy="100" r="10.5" fill="' + skin[1] + '"/>'
    + '<path d="M' + (xl - 3) + ' 96 Q' + (xl + 2) + ' 100 ' + (xl - 2) + ' 105 M' + (xr + 3) + ' 96 Q' + (xr - 2) + ' 100 ' + (xr + 2) + ' 105" stroke="' + _mix(skin[1], 0.88) + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
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
  var skin = AV_SKIN[r.skin], hc = AV_HAIRC[r.hairc], hcN = _hcNatural(r.hairc);
  var vb = AV_CROP[axId];
  if (!vb) return avSvg(r, size);
  var ctx = _ctx(_cid()), body = '', h;
  switch (axId) {
    case 'face':    body = _earsSkin(skin, _headHW(i + (r.sex === 1 ? AV_FACE_N : 0))) + _head(ctx, i + (r.sex === 1 ? AV_FACE_N : 0), skin); break;
    case 'marks':   body = _earsSkin(skin, _headHW(_faceKey(r))) + _head(ctx, _faceKey(r), skin) + _marks(i, skin[1]); break;
    case 'outfit':  body = _sx(r.sex === 1 ? 0.86 : 1, _neck(skin) + _outfit(ctx, i, skin, r.outfitc ? AV_OUTFITC[r.outfitc - 1] : null)); break;
    case 'hair':    h = _hair(ctx, i, hc, _faceKey(r));
      body = h[0] + (h[2] ? '<g clip-path="url(#' + _headClip(ctx, _faceKey(r), 1.02) + ')">' + h[2] + '</g>' : '') + h[1]; break;
    case 'beard':   body = _beard(ctx, i, hcN, _faceKey(r)); break;
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
  var felt = AV_FELT[r.bg], skin = AV_SKIN[r.skin], hc = AV_HAIRC[r.hairc], hcN = _hcNatural(r.hairc);
  var sz = size || 200;
  var cid = _cid(), ctx = _ctx(cid);
  var fem = r.sex === 1;
  // Round face (face 1) is wider than the oval the hair, beard and hats
  // were drawn for: widen them so they hug the head.
  var fk = _faceKey(r), hair = _hair(ctx, r.hair, hc, fk);
  var wk = _headHW(fk) / 53; // hair and hats are drawn for the ±53 oval
  var covers = _hatCovers(r.hat);
  var hatClip = AV_SHORT_HAIR[r.hair] ? 'hs' : 'hl';
  var clipHair = function (s) { return covers && s ? '<g clip-path="url(#' + cid + hatClip + ')">' + s + '</g>' : s; };
  ctx.defs.push('<clipPath id="' + cid + '"><rect x="6" y="6" width="188" height="188"/></clipPath>'
    + '<clipPath id="' + cid + 'hl"><rect x="0" y="' + HAT_LINE + '" width="200" height="' + (200 - HAT_LINE) + '"/></clipPath>'
    + '<clipPath id="' + cid + 'hs"><rect x="0" y="' + HAT_LINE + '" width="200" height="' + (HAT_SHORT_BOTTOM - HAT_LINE) + '"/></clipPath>'
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
    + _sx(fem ? 0.86 : 1, _neck(skin) + _outfit(ctx, r.outfit, skin, r.outfitc ? AV_OUTFITC[r.outfitc - 1] : null))
    + _earsSkin(skin, _headHW(fk))
    + _head(ctx, fk, skin)
    + (hair[2] ? clipHair('<g clip-path="url(#' + _headClip(ctx, fk, 1.02) + ')">' + _sx(wk, hair[2]) + '</g>') : '')
    + _marks(r.marks, skin[1])
    // (blush: a feminine touch, barely there on men)
    + '<ellipse cx="68" cy="117" rx="9" ry="5.5" fill="#ff7f86" opacity="' + (fem ? '.32' : '.1') + '"/>'
    + '<ellipse cx="132" cy="117" rx="9" ry="5.5" fill="#ff7f86" opacity="' + (fem ? '.32' : '.1') + '"/>'
    + _nose(r.nose, skin[1])
    + _beard(ctx, r.beard, hcN, fk)
    + _mouth(r.mouth)
    + _eyes(r.eyes, AV_EYEC[r.eyec], skin, fem)
    // Brows follow hair color (a natural one on fantasy hair)
    + '<path d="M68 80 Q78 74 88 79 M112 79 Q122 74 132 80" stroke="' + hcN[0] + '" stroke-width="' + (fem ? 4 : 5.4) + '" stroke-linecap="round" fill="none"/>'
    + _ears(r.ears, _headHW(fk))
    + _sx(wk, clipHair(hair[1]))
    + _glasses(r.glasses)
    + _sx(wk, _hat(ctx, r.hat))
    + '</g>'
    + '<rect x="6" y="6" width="188" height="188" fill="none" stroke="#8f6a1d" stroke-width="1"/>';
  return _wrap('0 0 200 200', sz, ctx, body);
}

// Silhouette icons (♂ / ♀) as inline SVG: the Unicode glyphs sit off-centre
// and vary by platform font (narmod 2026-09-27).
function avSexIcon(sex) {
  if (sex === 1) return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 14v8M8.5 18.5h7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="14" r="5.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M14.2 9.8L20 4M20 4h-5.5M20 4v5.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
// Portraits used as silhouette pickers (framing panel).
const AV_SEX_SAMPLE = [
  { sex: 0, face: 0, hair: 1, hairc: 1, outfit: 17, outfitc: 2, mouth: 0, bg: 7 },
  { sex: 1, face: 0, hair: 5, hairc: 1, outfit: 32, outfitc: 8, mouth: 0, bg: 7 }
];

// Swatch color shown on the option chip for 'color' axes.
function avSwatch(axId, i) {
  if (axId === 'bg') return AV_FELT[i][0];
  if (axId === 'skin') return AV_SKIN[i][0];
  if (axId === 'hairc') return AV_HAIRC[i][0];
  if (axId === 'outfitc') return i ? AV_OUTFITC[i - 1] : '#888';
  if (axId === 'eyec') return AV_EYEC[i];
  return '#888';
}

export { AV_AXES, AV_DEFAULT, AV_CROP, AV_SEX_SAMPLE, avSvg, avPartSvg, avSwatch, avNormalize, avRandom, avVisible, avSexIcon };
for (const [k, v] of Object.entries({ AV_AXES, AV_DEFAULT, AV_CROP, AV_SEX_SAMPLE, avSvg, avPartSvg, avSwatch, avNormalize, avRandom, avVisible, avSexIcon }))
  window['_' + k] = v;
