// Avatar vector engine — layered SVG portrait renderer for the Create tab.
//
// Style validated with narmod (2026-07-31): dark felt disc with faint card
// suits, double gold ring, elegant bust, two-tone flat shading per surface,
// optional accessories. Replaces the pre-generated photo matrix.
//
// avSvg(recipe) -> full <svg> string (viewBox 0 0 200 200, self-contained,
// no external refs -> canvas-rasterizable on iOS Safari).
// AV_AXES describes every axis for the UI (id, i18n label key, option count,
// kind 'color'|'shape', and whether option 0 means "none").
//
// Frame: SQUARE with a double gold border (matches the login-screen
// avatar trigger, narmod 2026-07-31) -- also removes the black JPEG
// corners a disc would produce when rasterized.
// Layer order: felt -> suit motifs -> neck -> outfit -> head -> marks ->
// nose -> mouth -> eyes -> brows -> beard -> hair -> glasses -> earrings ->
// shoulder accessory -> gold ring.

'use strict';

// [base, shadow]
const AV_SKIN = [
  ['#f6d7c0', '#e3bda1'], ['#e8b48c', '#d19a72'], ['#dfa876', '#c68e5c'],
  ['#c98d5f', '#b07748'], ['#a56a3e', '#8c5730'], ['#7a4b28', '#63391c'],
  ['#fce4d2', '#ecccb4'], ['#5c3a20', '#472a14'],
  ['#452812', '#331c0a'], ['#2f1b0d', '#201106']
];
// [base, highlight]
const AV_HAIRC = [
  ['#241a12', '#3a2b1e'], ['#362519', '#4d3826'], ['#5b4023', '#75552f'],
  ['#8c3d1e', '#a85428'], ['#c29a4a', '#d8b566'], ['#b6afa2', '#d6d0c4'],
  ['#e6d3a3', '#f2e6c2'], ['#efece6', '#fbfaf7']
];
const AV_EYEC = ['#5a3b22', '#3e6b8c', '#4e7a4a', '#6b6f75', '#8a6b3a', '#23180f'];
// [felt, motif]
const AV_FELT = [
  ['#223a1f', '#2b4726'], ['#1d2a44', '#26365a'], ['#4a1b20', '#5c262c'],
  ['#33234a', '#40305c'], ['#26292e', '#31353c'],
  ['#173a38', '#1f4a47'], ['#3d2a1a', '#4d3624']
];

const AV_AXES = [
  { id: 'sex',   label: 'avmSex',       n: 2,               kind: 'shape', none: false },
  { id: 'face',  label: 'avmFace',      n: 3,               kind: 'shape', none: false },
  { id: 'bg',    label: 'avmBg',        n: AV_FELT.length,  kind: 'color', none: false },
  { id: 'outfit',label: 'avmOutfit',    n: 9,               kind: 'shape', none: false },
  { id: 'skin',  label: 'avmSkin',      n: AV_SKIN.length,  kind: 'color', none: false },
  { id: 'marks', label: 'avmMarks',     n: 6,               kind: 'shape', none: true  },
  { id: 'hair',  label: 'avmHair',      n: 17,              kind: 'shape', none: true  },
  { id: 'hairc', label: 'avmHairColor', n: AV_HAIRC.length, kind: 'color', none: false },
  { id: 'beard', label: 'avmBeard',     n: 7,               kind: 'shape', none: true  },
  { id: 'eyes',  label: 'avmEyeShape',  n: 4,               kind: 'shape', none: false },
  { id: 'eyec',  label: 'avmEyeColor',  n: AV_EYEC.length,  kind: 'color', none: false },
  { id: 'mouth', label: 'avmMouth',     n: 5,               kind: 'shape', none: false },
  { id: 'glasses', label: 'avmGlasses', n: 6,               kind: 'shape', none: true  },
  { id: 'shoulder', label: 'avmShoulder', n: 5,             kind: 'shape', none: true  },
  { id: 'ears',  label: 'avmEarrings',  n: 4,               kind: 'shape', none: true  },
  { id: 'hat',   label: 'avmHat',       n: 7,               kind: 'shape', none: true  }
];

// Per-option silhouette tags (0 = masculine-leaning, 1 = feminine-leaning,
// missing = universal). The 'beard' axis is masculine-only as a whole.
// avVisible() lets the UI filter rows coherently with the selected sex
// while the engine still renders any recipe (old recipes stay valid).
const AV_SEXTAG = {
  hair: { 2: 0, 3: 1, 5: 1, 6: 0, 7: 1, 8: 1, 9: 0, 11: 1, 12: 1, 14: 1, 16: 0 },
  mouth: { 3: 1 },
  outfit: { 6: 1 }
};

function avVisible(axId, i, recipe) {
  // Option 0 of an optional axis ('none') is always a valid value --
  // it is what recipes are sanitized to when an axis gets filtered out.
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
                     beard: 0, eyes: 0, eyec: 0, mouth: 0, glasses: 0, shoulder: 1, ears: 0, hat: 0 };

function avNormalize(r) {
  var out = {};
  AV_AXES.forEach(function (ax) {
    var v = r && typeof r[ax.id] === 'number' ? Math.floor(r[ax.id]) : AV_DEFAULT[ax.id];
    out[ax.id] = (v >= 0 && v < ax.n) ? v : AV_DEFAULT[ax.id];
  });
  return out;
}

function avRandom() {
  var r = { sex: Math.floor(Math.random() * 2) };
  var draw = function (ax) {
    var opts = [];
    for (var i = 0; i < ax.n; i++) if (avVisible(ax.id, i, r)) opts.push(i);
    r[ax.id] = opts.length ? opts[Math.floor(Math.random() * opts.length)] : 0;
  };
  // 'eyec' depends on 'eyes' and 'glasses': draw it last.
  AV_AXES.forEach(function (ax) { if (ax.id !== 'sex' && ax.id !== 'eyec') draw(ax); });
  draw(AV_AXES.filter(function (ax) { return ax.id === 'eyec'; })[0]);
  return r;
}

// ── Suit motifs on the felt ──────────────────────────────────────────────
function _motifs(c) {
  return '<g fill="' + c + '" opacity="0.55">'
    + '<path d="M150 40 c0-6 10-6 10 0 c0 0 0-6 10-4 c8 2 4 12-10 20 c-14-8-18-14-10-16z" opacity="0.5"/>'
    + '<path d="M42 58 l8 11 -8 11 -8-11z" opacity="0.5"/>'
    + '<path d="M158 132 q6-10 12 0 q4 8-4 10 l2 5 -8 0 2-5 q-8-2-4-10z" opacity="0.6"/>'
    + '<path d="M40 138 q5-9 11 0 q4 7-3 9 q7-1 10 5 q2 7-7 7 l2 5 -7 0 2-5 q-9 0-7-7 q3-6 10-5 q-7-2-3-9z" opacity="0.5"/>'
    + '</g>';
}

// ── Outfits (neck is drawn first by avSvg; outfits wrap it) ──────────────
function _outfit(i, skin) {
  if (i === 6) { // V-neck blouse (feminine-tagged)
    return '<path d="M50 200 q2-44 50-46 q48 2 50 46z" fill="#6d2f4f"/>'
      + '<path d="M50 200 q2-44 50-46 l0 46z" fill="#5c2742"/>'
      + '<path d="M100 154 l-14 8 6 14 8-10 8 10 6-14z" fill="#7d3a5c"/>'
      + '<path d="M100 154 l-9 22 9 12 9-12z" fill="' + skin[1] + '"/>';
  }
  if (i === 7) { // dark turtleneck
    return '<path d="M50 200 q2-44 50-46 q48 2 50 46z" fill="#22262c"/>'
      + '<path d="M50 200 q2-44 50-46 l0 46z" fill="#1a1e23"/>'
      + '<path d="M86 136 q0-8 14-8 q14 0 14 8 l0 16 q-14 6-28 0z" fill="#2c313a"/>'
      + '<path d="M86 142 l28 0 M86 147 l28 0" stroke="#22262c" stroke-width="1.4" fill="none"/>';
  }
  if (i === 8) { // white dinner jacket, dark shirt, no tie
    return '<path d="M50 200 q2-44 50-46 q48 2 50 46z" fill="#e9e2d2"/>'
      + '<path d="M50 200 q2-44 50-46 l0 46z" fill="#ddd5c2"/>'
      + '<path d="M86 150 q-2-6 3-9 l11 5 11-5 q5 3 3 9 l-14 40z" fill="#20242a"/>'
      + '<path d="M100 146 l11-5 q5 3 3 9 l-14 36z" fill="#181c22"/>'
      + '<path d="M84 145 l-22 10 12 45 22-40 q-9-4-12-15z" fill="#f2ecdd"/>'
      + '<path d="M116 145 l22 10 -12 45 -22-40 q9-4 12-15z" fill="#e4dccb"/>';
  }
  if (i === 5) { // open-collar shirt, no jacket (casual)
    return '<path d="M50 200 q2-44 50-46 q48 2 50 46z" fill="#dfd8c8"/>'
      + '<path d="M50 200 q2-44 50-46 l0 46z" fill="#d2cab8"/>'
      + '<path d="M88 143 q6 9 12 10 l-7 9 q-9-7-10-16z" fill="#efe9dd"/>'
      + '<path d="M112 143 q-6 9-12 10 l7 9 q9-7 10-16z" fill="#e3dccd"/>'
      + '<path d="M96 152 l8 0 -4 8z" fill="' + skin[1] + '"/>';
  }
  var jacketPairs = [
    ['#23272d', '#171a1f', '#1b1f24'],
    ['#1d2942', '#141d31', '#18233a'],
    ['#2b2f36', '#1e2126', '#24282e'],
    ['#5a2027', '#471820', '#511c24'],
    ['#181a1e', '#0e1013', '#131519']
  ];
  var j = jacketPairs[i];
  var s = '<path d="M50 200 q2-44 50-46 q48 2 50 46z" fill="' + j[0] + '"/>'
        + '<path d="M50 200 q2-44 50-46 l0 46z" fill="' + j[2] + '"/>';
  // Shirt V + wrap-around collar wings (validated neck junction).
  s += '<path d="M86 150 q-2-6 3-9 l11 5 11-5 q5 3 3 9 l-14 40z" fill="#efe9dd"/>'
     + '<path d="M100 146 l11-5 q5 3 3 9 l-14 36z" fill="#e3dccd"/>'
     + '<path d="M89 141 q5 8 11 9 l-6 8 q-8-6-9-14z" fill="#fbf7ef"/>'
     + '<path d="M111 141 q-5 8-11 9 l6 8 q8-6 9-14z" fill="#ece5d6"/>';
  // Lapels over the shirt.
  s += '<path d="M84 145 l-22 10 12 45 22-40 q-9-4-12-15z" fill="' + j[1] + '"/>'
     + '<path d="M116 145 l22 10 -12 45 -22-40 q9-4 12-15z" fill="' + _dk(j[1]) + '"/>';
  if (i === 1) { // navy + tie
    s += '<path d="M100 152 l-7 6 5 24 2 6 2-6 5-24z" fill="#16203a"/>';
  } else if (i === 2) { // vest + burgundy tie
    s += '<path d="M100 152 l-7 6 5 24 2 6 2-6 5-24z" fill="#6b1f24"/>'
       + '<path d="M78 154 l-8 6 12 40 12-32 q-11-3-16-14z" fill="#33383f"/>'
       + '<path d="M122 154 l8 6 -12 40 -12-32 q11-3 16-14z" fill="#2b3037"/>';
  } else if (i === 4) { // tux + bow tie
    s += '<path d="M100 149 l-9-5 0 10 z M100 149 l9-5 0 10z" fill="#6b1f24"/>'
       + '<path d="M100 149 l-9 5 0-10 z M100 149 l9 5 0-10z" fill="#571a1e"/>'
       + '<circle cx="100" cy="149" r="2.6" fill="#3f1114"/>';
  }
  return s;
}
function _dk(hex) { // slightly darker variant for the right lapel
  var n = parseInt(hex.slice(1), 16);
  var r = Math.max(0, (n >> 16) - 10), g = Math.max(0, ((n >> 8) & 255) - 10), b = Math.max(0, (n & 255) - 10);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ── Hair (drawn over the head) ───────────────────────────────────────────
function _hair(i, hc) {
  var b = hc[0], h = hc[1];
  switch (i) {
    case 0: return ''; // bald
    case 1: // short
      return '<path d="M66 74 q-2-34 34-34 q36 0 34 34 q-2 6-5 8 q1-24-9-30 q-6 8-20 8 q-14 0-20-8 q-10 6-9 30 q-3-2-5-8z" fill="' + b + '"/>'
           + '<path d="M74 46 q10-8 26-6 q-14 2-20 10z" fill="' + h + '"/>';
    case 2: // slicked back
      return '<path d="M65 76 q-3-38 35-38 q38 0 35 38 q-2 6-5 7 q3-30-12-35 q-8 6-18 6 q-10 0-18-6 q-15 5-12 35 q-3-1-5-7z" fill="' + b + '"/>'
           + '<path d="M76 44 q8-4 18-4 M74 50 q9-5 20-5" stroke="' + h + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
    case 3: // high ponytail (validated sample)
      return '<path d="M118 38 q14 10 15 40 l-4 16 q-2-36-11-56z" fill="' + h + '"/>'
           + '<path d="M63 76 q0-44 37-44 q37 0 37 44 l-3 20 q-4-34-12-40 q-7 10-22 10 q-15 0-22-10 q-8 6-12 40z" fill="' + b + '"/>';
    case 4: // curly
      return '<g fill="' + b + '"><circle cx="76" cy="58" r="13"/><circle cx="92" cy="46" r="14"/><circle cx="110" cy="46" r="14"/><circle cx="126" cy="58" r="13"/><circle cx="68" cy="76" r="10"/><circle cx="132" cy="76" r="10"/></g>'
           + '<g fill="' + h + '" opacity="0.6"><circle cx="88" cy="44" r="4"/><circle cx="114" cy="46" r="4"/><circle cx="72" cy="60" r="3.5"/></g>';
    case 5: // mid-length bob
      return '<path d="M62 78 q-2-46 38-46 q40 0 38 46 l-4 34 q-8 4-12 0 q4-20 0-38 q-6 8-22 8 q-16 0-22-8 q-4 18 0 38 q-4 4-12 0z" fill="' + b + '"/>'
           + '<path d="M70 52 q8-12 24-12 q-14 4-18 16z" fill="' + h + '"/>';
    case 7: // bun
      return '<circle cx="100" cy="36" r="12" fill="' + b + '"/>'
        + '<circle cx="96" cy="33" r="4" fill="' + h + '" opacity="0.6"/>'
        + '<path d="M66 74 q-2-32 34-32 q36 0 34 32 q-2 7-5 9 q2-24-9-30 q-6 8-20 8 q-14 0-20-8 q-11 6-9 30 q-3-2-5-9z" fill="' + b + '"/>';
    case 8: // long, middle part
      return '<path d="M60 80 q-2-48 40-48 q42 0 40 48 l-4 44 q-7 5-12 0 q3-26 0-46 q-4 6-11 7 l-13-11 -13 11 q-7-1-11-7 q-3 20 0 46 q-5 5-12 0z" fill="' + b + '"/>'
        + '<path d="M100 34 l-11 11 q-8-2-11 5 q2-14 22-16z" fill="' + h + '" opacity="0.45"/>';
    case 9: // undercut: tight sides, volume swept on top
      return '<path d="M68 72 q-1-14 8-22 l0 24 q-5 1-8-2z" fill="' + b + '" opacity="0.55"/>'
        + '<path d="M132 72 q1-14-8-22 l0 24 q5 1 8-2z" fill="' + b + '" opacity="0.55"/>'
        + '<path d="M74 56 q-2-22 30-24 q26 2 26 20 q0 8-4 12 q0-16-10-20 q2 8-4 10 q-2-12-14-14 q-16 2-18 22 q-4-2-6-6z" fill="' + b + '"/>'
        + '<path d="M84 38 q10-5 22-2 q-12 1-18 8z" fill="' + h + '"/>';
    case 10: // afro
      return '<g fill="' + b + '"><circle cx="100" cy="48" r="26"/><circle cx="76" cy="60" r="16"/><circle cx="124" cy="60" r="16"/><circle cx="86" cy="42" r="14"/><circle cx="114" cy="42" r="14"/></g>'
        + '<g fill="' + h + '" opacity="0.4"><circle cx="90" cy="40" r="4"/><circle cx="112" cy="46" r="4"/><circle cx="78" cy="58" r="3.5"/></g>'
        + '<path d="M70 66 q30-14 60 0 l0 6 q-30-12-60 0z" fill="' + b + '"/>';
    case 11: // side braid over the shoulder
      return '<path d="M63 76 q0-44 37-44 q37 0 37 44 l-3 18 q-4-32-12-38 q-7 10-22 10 q-15 0-22-10 q-8 6-12 38z" fill="' + b + '"/>'
        + '<g fill="' + b + '"><circle cx="70" cy="96" r="7"/><circle cx="68" cy="108" r="7"/><circle cx="67" cy="120" r="7"/><circle cx="66" cy="132" r="7"/><circle cx="66" cy="143" r="6"/></g>'
        + '<g fill="' + h + '" opacity="0.5"><circle cx="68" cy="98" r="2.4"/><circle cx="66" cy="110" r="2.4"/><circle cx="65" cy="122" r="2.4"/><circle cx="64" cy="134" r="2.2"/></g>';
    case 12: // pixie cut with fringe
      return '<path d="M64 78 q-2-42 36-42 q38 0 36 42 q-2 6-6 8 q3-26-8-32 q1 8-6 11 l-4-9 -6 8 -6-9 -6 9 -4-8 q-7-3-6-11 q-11 6-8 32 q-4-2-6-8z" fill="' + b + '"/>'
        + '<path d="M72 46 q9-8 22-8 q-11 4-16 12z" fill="' + h + '"/>';
    case 13: // tight curls, close cut
      return '<path d="M66 72 q-2-30 34-30 q36 0 34 30 q-2 6-5 8 q1-22-9-28 q-6 8-20 8 q-14 0-20-8 q-10 6-9 28 q-3-2-5-8z" fill="' + b + '"/>'
        + '<g fill="' + h + '" opacity="0.5"><circle cx="80" cy="52" r="3"/><circle cx="92" cy="46" r="3"/><circle cx="106" cy="46" r="3"/><circle cx="118" cy="52" r="3"/><circle cx="86" cy="56" r="2.5"/><circle cx="112" cy="56" r="2.5"/><circle cx="99" cy="50" r="2.5"/></g>';
    case 14: // long wavy
      return '<path d="M60 80 q-2-48 40-48 q42 0 40 48 l-2 40 q-6 8-13 3 q5-10 1-18 q4-8 0-16 q-5 7-13 8 q-15-2-26 0 q-8-1-13-8 q-4 8 0 16 q-4 8 1 18 q-7 5-13-3z" fill="' + b + '"/>'
        + '<path d="M70 52 q9-11 24-12 q-13 5-17 15 M130 52 q-9-11-24-12 q13 5 17 15" fill="' + h + '" opacity="0.45"/>';
    case 15: // dreadlocks
      return '<path d="M66 72 q-2-30 34-30 q36 0 34 30 q-2 6-5 8 q1-22-9-28 q-6 8-20 8 q-14 0-20-8 q-10 6-9 28 q-3-2-5-8z" fill="' + b + '"/>'
        + '<g fill="' + b + '"><rect x="62" y="66" width="7" height="34" rx="3.5"/><rect x="72" y="72" width="7" height="30" rx="3.5" transform="rotate(4 75 72)"/><rect x="121" y="72" width="7" height="30" rx="3.5" transform="rotate(-4 125 72)"/><rect x="131" y="66" width="7" height="34" rx="3.5"/></g>'
        + '<g fill="' + h + '" opacity="0.45"><rect x="64" y="70" width="3" height="26" rx="1.5"/><rect x="133" y="70" width="3" height="26" rx="1.5"/></g>';
    case 16: // balding crown (masculine)
      return '<path d="M64 82 q0-8 8-10 l0 18 q-7-1-8-8z" fill="' + b + '"/>'
        + '<path d="M136 82 q0-8-8-10 l0 18 q7-1 8-8z" fill="' + b + '"/>'
        + '<path d="M72 72 q4-6 10-7 l-2 6 q-5 1-8 5z" fill="' + b + '" opacity="0.8"/>'
        + '<path d="M128 72 q-4-6-10-7 l2 6 q5 1 8 5z" fill="' + b + '" opacity="0.8"/>';
    default: // wavy senior sweep
      return '<path d="M66 74 q-2-32 34-32 q36 0 34 32 q-2 8-6 10 q2-22-8-28 q-6 8-20 8 q-14 0-20-8 q-10 6-8 28 q-4-2-6-10z" fill="' + b + '"/>'
           + '<path d="M74 46 q6-6 16-7 q-8 5-11 12 M104 40 q9 1 15 7 q-8-2-13-1" stroke="' + h + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  }
}

// ── Beard / moustache (mouth stays visible; drawn after mouth) ──────────
function _beard(i, hc) {
  var b = hc[0], h = hc[1];
  switch (i) {
    case 0: return '';
    case 1: // moustache
      return '<path d="M100 101 q-4-5-13-2 q3 6 13 4 q10 2 13-4 q-9-3-13 2z" fill="' + b + '"/>';
    case 2: // goatee
      return '<path d="M100 101 q-4-5-13-2 q3 6 13 4 q10 2 13-4 q-9-3-13 2z" fill="' + b + '"/>'
           + '<path d="M92 114 q8 6 16 0 q0 10-8 10 q-8 0-8-10z" fill="' + b + '"/>';
    case 3: // short beard
      return '<path d="M72 92 q2 20 14 25 q8 4 14 4 q6 0 14-4 q12-5 14-25 q-3 14-10 17 q3-5 2-9 q-8 7-20 7 q-12 0-20-7 q-1 4 2 9 q-7-3-10-17z" fill="' + b + '" opacity="0.92"/>'
           + '<path d="M100 101 q-4-5-13-2 q3 6 13 4 q10 2 13-4 q-9-3-13 2z" fill="' + b + '"/>';
    case 5: // three-day stubble
      return '<g fill="' + b + '" opacity="0.35">'
        + '<path d="M72 92 q2 20 14 25 q8 4 14 4 q6 0 14-4 q12-5 14-25 q-3 14-10 17 q3-5 2-9 q-8 7-20 7 q-12 0-20-7 q-1 4 2 9 q-7-3-10-17z"/>'
        + '<path d="M100 101 q-4-5-13-2 q3 6 13 4 q10 2 13-4 q-9-3-13 2z"/></g>';
    case 6: // long beard
      return '<path d="M70 88 q0 30 14 40 q7 8 16 12 q9-4 16-12 q14-10 14-40 q-4 20-12 26 q4-7 2-13 q-8 8-20 8 q-12 0-20-8 q-2 6 2 13 q-8-6-12-26z" fill="' + b + '"/>'
        + '<path d="M88 116 q6 8 12 8 q6 0 12-8 l-3 18 q-4 6-9 8 q-5-2-9-8z" fill="' + h + '" opacity="0.3"/>'
        + '<path d="M100 101 q-4-5-13-2 q3 6 13 4 q10 2 13-4 q-9-3-13 2z" fill="' + b + '"/>';
    default: // full beard
      return '<path d="M70 88 q0 26 14 32 q8 4 16 4 q8 0 16-4 q14-6 14-32 q-4 18-12 22 q4-6 2-11 q-8 8-20 8 q-12 0-20-8 q-2 5 2 11 q-8-4-12-22z" fill="' + b + '"/>'
           + '<path d="M86 112 q6 6 14 6 q8 0 14-6 l-2 12 q-5 5-12 5 q-7 0-12-5z" fill="' + h + '" opacity="0.35"/>'
           + '<path d="M100 101 q-4-5-13-2 q3 6 13 4 q10 2 13-4 q-9-3-13 2z" fill="' + b + '"/>';
  }
}

// ── Eyes (shape x iris color) ────────────────────────────────────────────
function _eyes(shape, ec) {
  if (shape === 2) { // closed smiling
    return '<path d="M76 80 q7.5-6 15 0 M109 80 q7.5-6 15 0" stroke="#3a2a1c" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  }
  if (shape === 3) { // wink: left open, right closed
    return '<path d="M76 80 q7.5-6 15 0 q-7.5 6-15 0z" fill="#f6f1e8"/>'
      + '<circle cx="83.5" cy="80" r="3.4" fill="' + ec + '"/>'
      + '<circle cx="83.5" cy="80" r="1.6" fill="#1c110a"/>'
      + '<circle cx="85" cy="78.7" r="0.9" fill="#fff"/>'
      + '<path d="M109 80 q7.5-6 15 0" stroke="#3a2a1c" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  }
  var ry = shape === 1 ? 4.5 : 6; // almond vs round
  function one(cx) {
    return '<path d="M' + (cx - 7.5) + ' 80 q7.5-' + ry + ' 15 0 q-7.5 ' + ry + '-15 0z" fill="#f6f1e8"/>'
      + '<circle cx="' + cx + '" cy="80" r="3.4" fill="' + ec + '"/>'
      + '<circle cx="' + cx + '" cy="80" r="1.6" fill="#1c110a"/>'
      + '<circle cx="' + (cx + 1.4) + '" cy="78.7" r="0.9" fill="#fff"/>';
  }
  return one(83.5) + one(116.5);
}

// ── Mouths ───────────────────────────────────────────────────────────────
function _mouth(i, skinShadow) {
  switch (i) {
    case 1: // wide grin with teeth
      return '<path d="M87 105 q13 12 26 0 q-4 10-13 10 q-9 0-13-10z" fill="#7e4034"/>'
           + '<path d="M89 105.5 q11 5 22 0 l-2 4 q-9 3-18 0z" fill="#f6f1e8"/>';
    case 2: // neutral
      return '<path d="M91 108 q9 4 18 0" stroke="#8a5a44" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    case 3: // lipstick smile
      return '<path d="M88 106 q5-4 12-1 q7-3 12 1 q-5 9-12 9 q-7 0-12-9z" fill="#a83b48"/>'
           + '<path d="M90 106 q10 5 20 0 q-10 4-20 0z" fill="#c9576a"/>';
    case 4: // smirk
      return '<path d="M90 108 q7 3 14 1 q4-1 6-4" stroke="#8a5a44" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    default: // soft smile (validated sample)
      return '<path d="M89 106 q11 7 22 0 q-4 7-11 7 q-7 0-11-7z" fill="#a85847"/>'
           + '<path d="M91 106 q9 4 18 0 q-9 3-18 0z" fill="#c96f5c"/>';
  }
}

// ── Skin marks ───────────────────────────────────────────────────────────
function _marks(i, skinShadow) {
  switch (i) {
    case 1: // freckles
      return '<g fill="' + skinShadow + '" opacity="0.85">'
        + '<circle cx="76" cy="94" r="1.1"/><circle cx="81" cy="97" r="1"/><circle cx="72" cy="98" r="0.9"/>'
        + '<circle cx="124" cy="94" r="1.1"/><circle cx="119" cy="97" r="1"/><circle cx="128" cy="98" r="0.9"/>'
        + '<circle cx="96" cy="96" r="0.8"/><circle cx="104" cy="96" r="0.8"/></g>';
    case 2: // beauty mark
      return '<circle cx="112" cy="99" r="1.6" fill="#3a2a1c"/>';
    case 3: // age lines
      return '<g stroke="' + skinShadow + '" stroke-width="1.2" fill="none" stroke-linecap="round">'
        + '<path d="M84 62 q16-4 32 0 M86 57 q14-3 28 0"/>'
        + '<path d="M72 84 q-3 3-3 6 M128 84 q3 3 3 6"/>'
        + '<path d="M88 96 q-2 4-1 7 M112 96 q2 4 1 7"/></g>';
    case 5: // dimples
      return '<path d="M84 108 q-2 3 0 6 M116 108 q2 3 0 6" stroke="' + skinShadow + '" stroke-width="1.4" stroke-linecap="round" fill="none"/>';
    case 4: // eyebrow scar
      return '<path d="M108 64 l6 10 M112 63 l6 10" stroke="' + skinShadow + '" stroke-width="1.6" stroke-linecap="round" fill="none"/>';
    default: return '';
  }
}

// ── Glasses ──────────────────────────────────────────────────────────────
function _glasses(i) {
  if (i === 0) return '';
  var frames = ['', '#1d1d1f', '#1d1d1f', '#1d1d1f', '#c9992e'];
  var c = frames[i];
  var bridge = '<path d="M94 78 l12 0 M72 76 l-8-3 M128 76 l8-3"/>';
  if (i === 1) { // round
    return '<g fill="none" stroke="' + c + '" stroke-width="2.4"><circle cx="83.5" cy="80" r="10"/><circle cx="116.5" cy="80" r="10"/>' + bridge + '</g>';
  }
  if (i === 2) { // rectangular
    return '<g fill="none" stroke="' + c + '" stroke-width="2.4"><rect x="73" y="72.5" width="21" height="15" rx="3"/><rect x="106" y="72.5" width="21" height="15" rx="3"/>' + bridge + '</g>';
  }
  if (i === 3) { // cat-eye (validated sample)
    return '<g fill="none" stroke="' + c + '" stroke-width="2.6">'
      + '<path d="M72 76 q11-6 22 0 q0 12-11 12 q-11 0-11-12z"/>'
      + '<path d="M106 76 q11-6 22 0 q0 12-11 12 q-11 0-11-12z"/>' + bridge + '</g>';
  }
  if (i === 5) { // sunglasses (opaque lenses)
    return '<g stroke="#14100c" stroke-width="2.4">'
      + '<path d="M72 74 l23 0 0 6 q0 10-11.5 10 q-11.5 0-11.5-10z" fill="#181410"/>'
      + '<path d="M105 74 l23 0 0 6 q0 10-11.5 10 q-11.5 0-11.5-10z" fill="#181410"/>'
      + '<path d="M95 76 l10 0 M72 75 l-8-3 M128 75 l8-3" fill="none"/></g>'
      + '<path d="M76 78 q6-3 12 0" stroke="#3a332c" stroke-width="1.6" fill="none" opacity="0.8"/>';
  }
  // gold round
  return '<g fill="none" stroke="' + c + '" stroke-width="2"><circle cx="83.5" cy="80" r="10"/><circle cx="116.5" cy="80" r="10"/>' + bridge + '</g>';
}

// ── Shoulder accessory ───────────────────────────────────────────────────
function _chipStack(x, y, top, side) {
  return '<g transform="translate(' + x + ',' + y + ')">'
    + '<ellipse cx="0" cy="6" rx="15" ry="5.5" fill="' + side + '"/><rect x="-15" y="0" width="30" height="6" fill="' + side + '"/>'
    + '<ellipse cx="0" cy="0" rx="15" ry="5.5" fill="' + top + '"/><ellipse cx="0" cy="0" rx="9" ry="3.2" fill="#eee6d6"/></g>';
}
function _shoulder(i) {
  if (i === 0) return '';
  var chips = _chipStack(147, 154, '#1d8552', '#0f5a35') + _chipStack(147, 142, '#c23434', '#8d1f1f');
  if (i === 1) return chips;
  if (i === 2) {
    return chips + '<g transform="translate(164,150)"><circle r="11" fill="#8f6a1d"/><circle r="9" fill="#14100a"/>'
      + '<path d="M0-5 q3.5-5 3.5 4 q2.5 4-2.5 4 l0.8 2.5 -3.6 0 0.8-2.5 q-5 0-2.5-4 q0-9 3.5-4z" fill="#c9992e"/></g>';
  }
  if (i === 4) { // whisky tumbler
    return '<g transform="translate(149,150)">'
      + '<path d="M-11-12 l22 0 -2 24 q-9 4-18 0z" fill="#cfd8dd" opacity="0.55"/>'
      + '<path d="M-9 0 l18 0 -1.5 11 q-7.5 3-15 0z" fill="#b5651d"/>'
      + '<rect x="-5" y="-9" width="7" height="7" rx="1.5" fill="#e8f1f5" opacity="0.7" transform="rotate(12)"/>'
      + '<ellipse cx="0" cy="-12" rx="11" ry="2.6" fill="none" stroke="#e5edf1" stroke-width="1.4" opacity="0.8"/></g>';
  }
  return '<g transform="translate(150,148) rotate(8)">'
    + '<rect x="-20" y="-14" width="20" height="28" rx="2.5" fill="#efe9dd" stroke="#c9bfa8" stroke-width="0.8"/>'
    + '<text x="-16.5" y="-5" font-size="8" font-family="serif" fill="#1d1d1f">A</text>'
    + '<path d="M-13 2 q2.6-3.6 2.6 2.6 q1.8 3-1.8 3 l0.5 1.8 -2.6 0 0.5-1.8 q-3.6 0-1.8-3 q0-6.2 2.6-2.6z" fill="#1d1d1f"/>'
    + '<rect x="-4" y="-12" width="20" height="28" rx="2.5" fill="#efe9dd" stroke="#c9bfa8" stroke-width="0.8"/>'
    + '<text x="-0.5" y="-3" font-size="8" font-family="serif" fill="#b02525">K</text>'
    + '<path d="M6 4 c0-2.6 3.6-2.6 3.6 0 c0 0 0-2.6 3.6-1.4 c2.6 1 1 4.4-3.6 7 c-4.6-2.6-5.6-4.6-3.6-5.6z" fill="#b02525"/></g>';
}

// ── Hats (drawn over the hair) ───────────────────────────────────────────
function _hat(i) {
  if (i === 0) return '';
  if (i === 1) { // cap
    return '<g transform="translate(0,3)">' + '<path d="M68 52 q0-24 32-24 q32 0 32 24 l0 4 -64 0z" fill="#8d1f1f"/>'
      + '<path d="M100 28 q32 0 32 24 l0 4 -12 0 q4-20-20-28z" fill="#711818"/>'
      + '<path d="M100 52 l40 0 q4 0 3 5 l-43 0z" fill="#5c1313"/>'
      + '<circle cx="100" cy="30" r="3" fill="#5c1313"/>' + '</g>';
  }
  if (i === 2) { // fedora
    return '<g transform="translate(0,3)">' + '<path d="M56 56 q0 6 12 8 q16 3 32 3 q16 0 32-3 q12-2 12-8 q0-4-8-5 l-80 0 q-8 1-8 5z" fill="#2c2620"/>'
      + '<path d="M72 51 q0-24 28-24 q28 0 28 24 l0 3 -56 0z" fill="#3a332b"/>'
      + '<path d="M72 48 l56 0 0 5 -56 0z" fill="#1d1915"/>' + '</g>';
  }
  if (i === 4) { // bowler
    return '<g transform="translate(0,3)">' + '<path d="M60 58 q0 5 10 6 q15 2 30 2 q15 0 30-2 q10-1 10-6 q0-3-7-4 l-66 0 q-7 1-7 4z" fill="#17130f"/>'
      + '<path d="M72 54 q1-24 28-24 q27 0 28 24z" fill="#242019"/>'
      + '<path d="M72 50 l56 0 0 4 -56 0z" fill="#0e0b08"/>' + '</g>';
  }
  if (i === 5) { // panama
    return '<g transform="translate(0,3)">' + '<path d="M56 57 q0 6 12 7 q16 2 32 2 q16 0 32-2 q12-1 12-7 q0-4-8-5 l-72 0 q-8 1-8 5z" fill="#d9cba4"/>'
      + '<path d="M72 52 q0-24 28-24 q28 0 28 24 l0 2 -56 0z" fill="#e8dcbb"/>'
      + '<path d="M72 48 l56 0 0 5 -56 0z" fill="#6b2020"/>' + '</g>';
  }
  if (i === 6) { // bandana
    return '<path d="M68 58 q32-16 64 0 l-2 8 q-30-13-60 0z" fill="#8d1f1f"/>'
      + '<path d="M70 57 q30-13 60 0" stroke="#5c1313" stroke-width="1.6" fill="none"/>'
      + '<g fill="#eee6d6" opacity="0.7"><circle cx="84" cy="56" r="1.2"/><circle cx="98" cy="53" r="1.2"/><circle cx="112" cy="54" r="1.2"/><circle cx="124" cy="58" r="1.2"/></g>'
      + '<path d="M132 60 q8 2 9 9 q-6-1-10-5 M133 62 q5 6 4 12 q-5-3-7-8" fill="#8d1f1f"/>';
  }
  // dealer visor
  return '<path d="M66 56 q34-14 68 0 l-4 9 q-30-12-60 0z" fill="#0f5a35"/>'
    + '<path d="M70 55 q30-11 60 0" stroke="#08341f" stroke-width="2" fill="none"/>';
}

// ── Earrings ─────────────────────────────────────────────────────────────
function _ears(i) {
  if (i === 0) return '';
  if (i === 3) { // gold hoops
    return '<circle cx="68" cy="103" r="4.2" fill="none" stroke="#d4a437" stroke-width="1.8"/>'
      + '<circle cx="132" cy="103" r="4.2" fill="none" stroke="#d4a437" stroke-width="1.8"/>';
  }
  var c = i === 1 ? '#ece7dd' : '#d4a437';
  return '<circle cx="68" cy="100" r="2.4" fill="' + c + '"/><circle cx="132" cy="100" r="2.4" fill="' + c + '"/>';
}

// ── Head shapes ──────────────────────────────────────────────────────────
function _head(i, skin) {
  if (i === 1) { // round: wider, fuller cheeks
    return '<ellipse cx="100" cy="85" rx="33" ry="31" fill="' + skin[0] + '"/>'
      + '<path d="M100 54 q33 0 33 31 q0 18-13 25 q17-27 4-46 q-9-8-24-10z" fill="' + skin[1] + '"/>';
  }
  if (i === 2) { // square jaw
    return '<path d="M70 78 q0-28 30-28 q30 0 30 28 l0 16 q0 22-30 22 q-30 0-30-22z" fill="' + skin[0] + '"/>'
      + '<path d="M100 50 q30 0 30 28 l0 16 q0 16-14 20 q10-10 8-36 q-2-22-24-28z" fill="' + skin[1] + '"/>';
  }
  return '<ellipse cx="100" cy="84" rx="30" ry="34" fill="' + skin[0] + '"/>'
    + '<path d="M100 50 q30 0 30 34 q0 20-12 28 q16-30 4-52 q-8-8-22-10z" fill="' + skin[1] + '"/>';
}

// ── Full portrait ────────────────────────────────────────────────────────
// Frames (square [x, y, size] in the 200x200 space) for the ISOLATED-part
// vignettes rendered by avPartSvg(): each option chip draws ONLY the layer
// being chosen (a lone mouth, a lone hat, an outfit "on a hanger"...) over
// the felt color, with the current recipe's palette (narmod 2026-07-31).
// Exception: skin marks keep the bare head as canvas, they are unreadable
// alone.
const AV_CROP = {
  face:     [54, 40, 94],
  outfit:   [52, 104, 96],
  marks:    [54, 40, 94],
  hair:     [42, 12, 116],
  beard:    [58, 82, 84],
  eyes:     [62, 56, 76],
  mouth:    [76, 90, 48],
  glasses:  [56, 54, 88],
  shoulder: [116, 116, 80],
  ears:     [56, 88, 28],
  hat:      [48, 16, 104]
};

// Isolated-part vignette: only the chosen layer, on the felt backdrop.
function avPartSvg(axId, i, recipe, size) {
  var r = avNormalize(recipe);
  r[axId] = i;
  var skin = AV_SKIN[r.skin], hc = AV_HAIRC[r.hairc];
  var vb = AV_CROP[axId];
  if (!vb) return avSvg(r, size);
  var body = '';
  switch (axId) {
    case 'face':    body = _head(i, skin); break;
    case 'marks':   body = _head(r.face, skin) + _marks(i, skin[1]); break;
    case 'outfit':  body = (r.sex === 1
      ? '<g transform="translate(100,0) scale(0.86,1) translate(-100,0)">' + _outfit(i, skin) + '</g>'
      : _outfit(i, skin)); break;
    case 'hair':    body = _hair(i, hc); break;
    case 'beard':   body = _beard(i, hc); break;
    case 'eyes':    body = _eyes(i, AV_EYEC[r.eyec]); break;
    case 'mouth':   body = _mouth(i, skin[1]); break;
    case 'glasses': body = _glasses(i); break;
    case 'hat':     body = _hat(i); break;
    case 'shoulder':body = _shoulder(i); break;
    case 'ears':    body = _ears(i); break;
    default: return avSvg(r, size);
  }
  // No backdrop: the part floats on the chip's theme background so the
  // vignette stays readable in every palette (narmod 2026-07-31).
  return '<svg viewBox="' + vb[0] + ' ' + vb[1] + ' ' + vb[2] + ' ' + vb[2] + '" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">'
    + body + '</svg>';
}

function avSvg(recipe, size) {
  var r = avNormalize(recipe);
  var felt = AV_FELT[r.bg], skin = AV_SKIN[r.skin], hc = AV_HAIRC[r.hairc];
  var sz = size || 200;
  var cid = 'avc' + Math.floor(Math.random() * 1e9);
  var s = '<svg viewBox="0 0 200 200" width="' + sz + '" height="' + sz + '" xmlns="http://www.w3.org/2000/svg">'
    + '<defs><clipPath id="' + cid + '"><rect x="6" y="6" width="188" height="188"/></clipPath></defs>'
    + '<rect width="200" height="200" fill="#8f6a1d"/>'
    + '<rect x="2.5" y="2.5" width="195" height="195" fill="#c9992e"/>'
    + '<rect x="6" y="6" width="188" height="188" fill="' + felt[0] + '"/>'
    + '<g clip-path="url(#' + cid + ')">'
    + _motifs(felt[1])
    // Neck (short, validated 2026-07-31) — plunges into the collar.
    + '<path d="M90 114 l20 0 1 30 -22 0z" fill="' + skin[0] + '"/>'
    + '<path d="M90 114 l20 0 0 11 q-10 8-20 0z" fill="' + skin[1] + '"/>'
    // Sex axis: feminine silhouette narrows the whole outfit (shoulders,
    // lapels, collar) around the vertical centre; everything else is shared.
    + (r.sex === 1
        ? '<g transform="translate(100,0) scale(0.86,1) translate(-100,0)">' + _outfit(r.outfit, skin) + '</g>'
        : _outfit(r.outfit, skin))
    // Head (3 face shapes: oval / round / square jaw)
    + _head(r.face, skin)
    + '<path d="M70 84 q-6-2-6 6 q0 8 7 8z" fill="' + skin[0] + '"/>'
    + '<path d="M130 84 q6-2 6 6 q0 8-7 8z" fill="' + skin[1] + '"/>'
    + _marks(r.marks, skin[1])
    // Nose + cheeks
    + '<path d="M99 88 q3 6 1 10 l-4 0" fill="none" stroke="' + skin[1] + '" stroke-width="1.8" stroke-linecap="round"/>'
    + '<ellipse cx="78" cy="98" rx="5" ry="3" fill="#dd9576" opacity="0.35"/>'
    + '<ellipse cx="122" cy="98" rx="5" ry="3" fill="#c88463" opacity="0.35"/>'
    + _mouth(r.mouth, skin[1])
    + _eyes(r.eyes, AV_EYEC[r.eyec])
    // Brows follow hair color
    + '<path d="M74 68 q8-5 16-1 l-1 3 q-7-3-14 0z" fill="' + hc[0] + '"/>'
    + '<path d="M110 67 q8-4 16 1 l-1 2 q-7-3-14 0z" fill="' + hc[0] + '"/>'
    // Round face (face 1) is ~10% wider than the oval the hair and beard
    // were drawn for: widen both around the vertical centre so they hug
    // the head instead of floating like a too-narrow hairpiece.
    + (r.face === 1
        ? '<g transform="translate(100,0) scale(1.1,1) translate(-100,0)">' + _beard(r.beard, hc) + _hair(r.hair, hc) + '</g>'
        : _beard(r.beard, hc) + _hair(r.hair, hc))
    + _glasses(r.glasses)
    + _ears(r.ears)
    + _hat(r.hat)
    + _shoulder(r.shoulder)
    + '</g>'
    + '<rect x="6" y="6" width="188" height="188" fill="none" stroke="#8f6a1d" stroke-width="1"/>'
    + '</svg>';
  return s;
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
