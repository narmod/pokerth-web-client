// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Cover pictures of the arcade's games (web extension, narmod 2026-10-16,
// web.89) — one small SVG scene per game for its card on the arcade's home
// (menu.mjs): the Ace on his run, at the top of his house of cards, beside
// his solitaire grid, from behind on the three lanes of Ace Dash, at the wheel
// of his convertible on the road of Poker Run. Painted with the games' own palette (common.mjs ink)
// so they follow the light / dark theme; no image file to load or cache.
// art(id, light) → SVG markup (viewBox 320 × 140), '' for an unknown game.
// ═══════════════════════════════════════════════════════════════════

import { ink } from './common.mjs';

const RED = '#c62828';
const limbOf = (c) => (c.light ? '#1d222b' : '#d9d2c3');
const SUITS = { s: ['♠', '#1d222b'], h: ['♥', RED], d: ['♦', RED], c: ['♣', '#1d222b'] };

/** A face-up card, top-left corner at (x, y), w wide, turned by rot degrees. */
function card(x, y, w, rank, suit, rot = 0) {
  const h = w * 1.4, [sym, col] = SUITS[suit];
  const tr = rot ? ' transform="rotate(' + rot + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')"' : '';
  return '<g' + tr + '><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (w * 0.12).toFixed(1)
    + '" fill="#fffdf8" stroke="rgba(0,0,0,.28)" stroke-width=".8"/>'
    + '<text x="' + (x + w * 0.14) + '" y="' + (y + w * 0.36) + '" font-size="' + (w * 0.32).toFixed(1) + '" font-weight="700" fill="' + col + '" font-family="Georgia,serif">' + rank + '</text>'
    + '<text x="' + (x + w / 2) + '" y="' + (y + h * 0.66) + '" font-size="' + (w * 0.56).toFixed(1) + '" text-anchor="middle" fill="' + col + '">' + sym + '</text></g>';
}
/** A card seen from the back, the deck's red pattern. */
function back(x, y, w, rot = 0) {
  const h = w * 1.4;
  const tr = rot ? ' transform="rotate(' + rot + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')"' : '';
  return '<g' + tr + '><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (w * 0.12).toFixed(1) + '" fill="#fffdf8" stroke="rgba(0,0,0,.28)" stroke-width=".8"/>'
    + '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="' + (w - 4) + '" height="' + (h - 4) + '" rx="' + (w * 0.08).toFixed(1) + '" fill="#a3262a"/>'
    + '<rect x="' + (x + 4) + '" y="' + (y + 4) + '" width="' + (w - 8) + '" height="' + (h - 8) + '" rx="2" fill="none" stroke="rgba(255,255,255,.45)" stroke-width=".8"/></g>';
}
/** A casino chip seen from above. */
function chip(cx, cy, r, col) {
  let d = '';
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    d += '<rect x="' + (cx - r * 0.13).toFixed(1) + '" y="' + (cy - r).toFixed(1) + '" width="' + (r * 0.26).toFixed(1) + '" height="' + (r * 0.3).toFixed(1)
      + '" fill="#fff" transform="rotate(' + (a * 180 / Math.PI).toFixed(0) + ' ' + cx + ' ' + cy + ')"/>';
  }
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + col + '"/>' + d
    + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.58).toFixed(1) + '" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="' + (r * 0.1).toFixed(1) + '"/>';
}
/** A stack of n chips seen from the side, bottom at y. */
function stack(x, y, w, n, col) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const yy = y - (i + 1) * 4.2;
    s += '<rect x="' + x + '" y="' + yy.toFixed(1) + '" width="' + w + '" height="4" rx="1.5" fill="' + col + '" stroke="rgba(0,0,0,.35)" stroke-width=".5"/>'
      + '<rect x="' + (x + w * 0.2) + '" y="' + yy.toFixed(1) + '" width="' + (w * 0.14) + '" height="4" fill="#fff" opacity=".85"/>'
      + '<rect x="' + (x + w * 0.66) + '" y="' + yy.toFixed(1) + '" width="' + (w * 0.14) + '" height="4" fill="#fff" opacity=".85"/>';
  }
  return s;
}
/**
 * The Ace: a card with a face, arms and legs; feet at (x, y), card s px wide.
 * pose 'run' | 'jump' | 'wave'.
 */
function ace(x, y, s, pose, limb = '#1d222b', shadowY = y) {
  const h = s * 1.4, top = y - h - s * 0.7, l = x - s / 2;
  const leg = s * 0.7, hip = top + h;
  const legs = pose === 'jump'
    ? 'M' + (x - s * 0.18) + ' ' + hip + ' l' + (-s * 0.28) + ' ' + (leg * 0.55) + ' M' + (x + s * 0.18) + ' ' + hip + ' l' + (s * 0.3) + ' ' + (leg * 0.5)
    : pose === 'run'
      ? 'M' + (x - s * 0.15) + ' ' + hip + ' l' + (-s * 0.32) + ' ' + leg + ' M' + (x + s * 0.15) + ' ' + hip + ' l' + (s * 0.3) + ' ' + (leg * 0.9)
      : 'M' + (x - s * 0.18) + ' ' + hip + ' l0 ' + leg + ' M' + (x + s * 0.18) + ' ' + hip + ' l0 ' + leg;
  const ay = top + h * 0.5;
  const arms = pose === 'wave'
    ? [[l, ay, l - s * 0.35, ay + s * 0.35], [l + s, ay, l + s * 1.35, ay - s * 0.6]]
    : pose === 'jump'
      ? [[l, ay, l - s * 0.4, ay - s * 0.5], [l + s, ay, l + s * 1.4, ay - s * 0.5]]
      : [[l, ay, l - s * 0.4, ay + s * 0.2], [l + s, ay, l + s * 1.4, ay - s * 0.15]];
  const ex = s * 0.17, ey = top + h * 0.42, er = s * 0.065;
  return '<g>'
    + '<ellipse cx="' + x + '" cy="' + (shadowY + 1) + '" rx="' + (s * 0.6) + '" ry="' + (s * 0.12) + '" fill="rgba(0,0,0,.28)"/>'
    + '<path d="' + legs + '" stroke="' + limb + '" stroke-width="' + (s * 0.09).toFixed(1) + '" stroke-linecap="round" fill="none"/>'
    + arms.map(([x1, y1, x2, y2]) => '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="' + limb + '" stroke-width="' + (s * 0.07).toFixed(1) + '" stroke-linecap="round"/>'
      + '<circle cx="' + x2 + '" cy="' + y2 + '" r="' + (s * 0.12).toFixed(1) + '" fill="#fff" stroke="#1d222b" stroke-width="' + (s * 0.05).toFixed(1) + '"/>').join('')
    + '<rect x="' + l + '" y="' + top + '" width="' + s + '" height="' + h + '" rx="' + (s * 0.12).toFixed(1) + '" fill="#fffdf8" stroke="#1d222b" stroke-width="' + (s * 0.05).toFixed(1) + '"/>'
    + '<text x="' + (l + s * 0.1) + '" y="' + (top + s * 0.3) + '" font-size="' + (s * 0.26).toFixed(1) + '" font-weight="700" fill="#1d222b" font-family="Georgia,serif">A</text>'
    + '<text x="' + (l + s * 0.12) + '" y="' + (top + s * 0.54) + '" font-size="' + (s * 0.22).toFixed(1) + '" fill="#1d222b">♠</text>'
    + '<circle cx="' + (x - ex) + '" cy="' + ey + '" r="' + er + '" fill="#1d222b"/><circle cx="' + (x + ex) + '" cy="' + ey + '" r="' + er + '" fill="#1d222b"/>'
    + '<circle cx="' + (x - ex * 1.9) + '" cy="' + (ey + s * 0.16) + '" r="' + (s * 0.08) + '" fill="#f2a0a0" opacity=".8"/><circle cx="' + (x + ex * 1.9) + '" cy="' + (ey + s * 0.16) + '" r="' + (s * 0.08) + '" fill="#f2a0a0" opacity=".8"/>'
    + '<path d="M' + (x - s * 0.15) + ' ' + (ey + s * 0.14) + ' q' + (s * 0.15) + ' ' + (s * 0.16) + ' ' + (s * 0.3) + ' 0" stroke="#1d222b" stroke-width="' + (s * 0.05).toFixed(1) + '" fill="none" stroke-linecap="round"/>'
    + '</g>';
}
/** Sky of the casino, its lamps and the felt with its wooden rim. */
function room(c, id, ground) {
  const lamps = [70, 250].map((lx) => '<circle cx="' + lx + '" cy="34" r="34" fill="url(#' + id + 'g)"/>'
    + '<path d="M' + lx + ' 0 V22" stroke="' + c.shade + '" stroke-width="1"/><path d="M' + (lx - 9) + ' 28 L' + lx + ' 20 L' + (lx + 9) + ' 28 Z" fill="' + c.shade + '"/>').join('');
  return '<defs><linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c.skyTop + '"/><stop offset="1" stop-color="' + c.skyBot + '"/></linearGradient>'
    + '<radialGradient id="' + id + 'g"><stop offset="0" stop-color="rgb(' + c.lamp + ')" stop-opacity=".45"/><stop offset="1" stop-color="rgb(' + c.lamp + ')" stop-opacity="0"/></radialGradient></defs>'
    + '<rect width="320" height="140" fill="url(#' + id + 's)"/>' + lamps
    + '<rect y="' + ground + '" width="320" height="' + (140 - ground) + '" fill="#2f7a52"/>'
    + '<path d="M0 ' + (ground + 6) + ' H320" stroke="rgba(255,255,255,.35)" stroke-width="1" stroke-dasharray="6 5"/>'
    + '<rect y="' + (ground + 14) + '" width="320" height="' + (140 - ground - 14) + '" fill="' + c.rim + '"/>';
}

// ── web.56 (narmod: « refresh the pictures, on the model of Ace Dash »): every
// cover is a scene in the club at night — the dark room and its two lamps,
// the felt in perspective with its wooden rim — and nothing of the game's
// screen (no buttons, no pay table): the game's things on the table.

/** The club at night: the dark room and its two lamps (id: unique per picture). */
function club(c, id) {
  return '<defs><linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c.skyTop + '"/><stop offset="1" stop-color="' + c.skyBot + '"/></linearGradient>'
    + '<radialGradient id="' + id + 'g"><stop offset="0" stop-color="rgb(' + c.lamp + ')" stop-opacity=".45"/><stop offset="1" stop-color="rgb(' + c.lamp + ')" stop-opacity="0"/></radialGradient></defs>'
    + '<rect width="320" height="140" fill="url(#' + id + 's)"/>'
    + [60, 260].map((lx) => '<circle cx="' + lx + '" cy="22" r="30" fill="url(#' + id + 'g)"/>'
      + '<path d="M' + lx + ' 0 V12" stroke="' + c.shade + '" stroke-width="1"/><path d="M' + (lx - 8) + ' 18 L' + lx + ' 11 L' + (lx + 8) + ' 18 Z" fill="' + c.shade + '"/>').join('');
}
/** The felt in perspective from the horizon vy: half widths top (far) and bot (near). */
function table(c, vy, top, bot) {
  const at = (f, y) => 160 + f * (top + (bot - top) * (y - vy) / (140 - vy));
  const q = (f) => 'M' + at(-f, vy) + ' ' + vy + ' L' + at(f, vy) + ' ' + vy + ' L' + at(f, 140) + ' 140 L' + at(-f, 140) + ' 140 Z';
  return { at, svg: '<path d="' + q(1.12) + '" fill="' + c.rim + '"/><path d="' + q(1) + '" fill="#2f7a52"/>'
    + '<path d="M' + at(-0.86, vy + 6) + ' ' + (vy + 6) + ' L' + at(0.86, vy + 6) + ' ' + (vy + 6) + '" stroke="rgba(216,178,90,.35)" stroke-width="1" stroke-dasharray="5 4"/>' };
}
/** A soft gold glow (a hand that wins, a line that scores). */
const glow = (x, y, w, h) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="none" stroke="#f0c75e" stroke-width="1.6" opacity=".9"/>';

function runner(c) {
  // Ace Runner: the club seen from the side, the Ace jumping a stack of chips,
  // a card to catch in the air.
  const G = 112;
  return room(c, 'ar' + (c.light ? 'l' : 'd'), G)
    + '<ellipse cx="160" cy="' + (G - 6) + '" rx="54" ry="8" fill="' + c.farFelt + '" opacity=".8"/>'
    + '<ellipse cx="290" cy="' + (G - 4) + '" rx="40" ry="6" fill="' + c.farFelt + '" opacity=".8"/>'
    + stack(122, G, 16, 3, '#2b6cb0') + stack(206, G, 16, 5, '#c62828') + stack(224, G, 16, 2, '#2b6cb0')
    + card(150, 34, 16, 'J', 'h', -12) + card(262, 50, 14, 'A', 's', 10)
    + ace(92, G - 26, 22, 'jump', limbOf(c), G)
    + '<path d="M60 ' + (G - 40) + ' q-10 2 -20 0 M64 ' + (G - 30) + ' q-12 2 -24 0" stroke="' + c.gold + '" stroke-width="1.5" fill="none" opacity=".6" stroke-linecap="round"/>';
}

function house(c) {
  // House of Cards: the house standing on the felt, the Ace waving at the top,
  // the dealer's rail above it and the next card hanging.
  const w = 18, h = w * 1.4;
  const T = table(c, 96, 120, 200), base = 128;
  const frame = (x, y) => card(x - 10, y - h, w, '8', 'd', -16) + card(x + 2, y - h, w, '3', 'h', 16);
  const f1 = base, f2 = f1 - h - 3, f3 = f2 - h - 3;
  return club(c, 'hc' + (c.light ? 'l' : 'd')) + T.svg
    + '<path d="M96 10 H224" stroke="' + c.gold + '" stroke-width="2.5" stroke-linecap="round"/>'
    + chip(198, 10, 6, '#c62828') + '<path d="M198 16 V22" stroke="' + c.gold + '" stroke-width="1"/>' + card(189, 22, 18, 'Q', 's', 8)
    + frame(122, f1) + frame(160, f1) + frame(198, f1)
    + '<rect x="110" y="' + (f1 - h - 3) + '" width="100" height="3" rx="1" fill="#fffdf8" stroke="rgba(0,0,0,.3)" stroke-width=".6"/>'
    + frame(141, f2) + frame(179, f2)
    + '<rect x="130" y="' + (f2 - h - 3) + '" width="60" height="3" rx="1" fill="#fffdf8" stroke="rgba(0,0,0,.3)" stroke-width=".6"/>'
    + ace(160, f2 - h - 3, 15, 'wave', limbOf(c))
    + stack(236, 134, 16, 4, '#2b6cb0') + stack(254, 134, 16, 2, '#c62828');
}

function solitaire(c) {
  // Poker Solitaire: the 5 × 5 grid laid on the felt, a line lit gold, the Ace
  // beside it with the next card.
  const T = table(c, 40, 70, 150);
  let s = club(c, 'ps' + (c.light ? 'l' : 'd')) + T.svg;
  const placed = { '0,0': ['10', 's'], '1,0': ['J', 's'], '2,0': ['Q', 's'], '3,0': ['K', 's'], '4,0': ['A', 's'],
    '0,1': ['7', 'h'], '2,1': ['7', 'c'], '4,1': ['9', 'd'], '0,2': ['7', 'd'], '1,2': ['5', 'c'], '3,3': ['2', 'h'], '0,3': ['4', 'c'], '2,4': ['8', 'h'] };
  const rows = [44, 58, 74, 92, 112];
  rows.forEach((y, r) => {
    const sc = 0.62 + r * 0.12, cw = 16 * sc, ch = cw * 1.32;
    for (let k = 0; k < 5; k++) {
      const x = T.at((k - 2) * 0.33, y + ch / 2) - cw / 2, p = placed[k + ',' + r];
      s += p ? card(x, y, cw, p[0], p[1]) : '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" rx="2" fill="rgba(0,0,0,.2)" stroke="rgba(255,255,255,.14)"/>';
    }
    if (r === 0) s += glow(T.at(-0.66, y) - cw / 2 - 3, y - 2.5, T.at(0.66, y) - T.at(-0.66, y) + cw + 6, cw * 1.4 + 5);
  });
  return s + card(262, 66, 22, 'K', 'd', 8) + ace(276, 132, 15, 'wave', limbOf(c));
}

function videopoker(c) {
  // Video Poker (narmod's pick C): at the bar — a bar-top poker machine on the
  // counter showing a royal flush, the bottles on the shelves behind, chips
  // beside it and the Ace on his stool.
  const id = 'vp' + (c.light ? 'l' : 'd');
  let s = club(c, id);
  const glass = ['#2e6b4a', '#7a3b2a', '#b48a3a', '#3b4f7a'];
  for (const [y, n] of [[34, 12], [58, 11]]) {
    s += '<rect x="0" y="' + (y + 10) + '" width="320" height="2" fill="' + c.shade + '"/>';
    for (let i = 0; i < n; i++) {
      const x = 12 + i * 27 + (y > 40 ? 12 : 0), col = glass[i % 4];
      s += '<rect x="' + x + '" y="' + (y - 4) + '" width="7" height="14" rx="2" fill="' + col + '" opacity=".75"/><rect x="' + (x + 2) + '" y="' + (y - 8) + '" width="3" height="5" fill="' + col + '" opacity=".75"/>';
    }
  }
  s += '<rect y="96" width="320" height="10" fill="#6b4426"/><rect y="106" width="320" height="34" fill="' + c.rim + '"/>'
    + '<path d="M0 106 H320" stroke="rgba(216,178,90,.35)" stroke-width="1"/>';
  s += '<circle cx="168" cy="44" r="26" fill="url(#' + id + 'g)"/>'
    + '<path d="M122 96 L130 50 H206 L214 96 Z" fill="#3a1418" stroke="#d8b25a" stroke-width="1.3"/>'
    + '<rect x="136" y="56" width="64" height="30" rx="3" fill="#0e1a14" stroke="rgba(216,178,90,.6)"/>';
  [['10', 's'], ['J', 's'], ['Q', 's'], ['K', 's'], ['A', 's']].forEach(([r, su], i) => { s += card(139 + i * 12.2, 61, 11, r, su); });
  s += '<text x="168" y="93" font-size="6" ' + TXT + ' text-anchor="middle" fill="#f5d77a">ROYAL</text>';
  s += stack(222, 96, 14, 5, '#d8b25a') + stack(238, 96, 14, 3, '#c62828');
  // The stool, the Ace sitting on it beside the machine.
  const stool = c.light ? '#4a3220' : '#8a6a4a';
  s += '<path d="M89 117 V138 M80 138 H98" stroke="' + stool + '" stroke-width="3" stroke-linecap="round"/><rect x="74" y="111" width="30" height="6" rx="3" fill="' + stool + '"/>';
  return s + ace(89, 112, 15, 'wave', limbOf(c));
}

function whowins(c) {
  // Who Wins?: the Ace deals across the felt, the board in the middle, two
  // hands face up — the flush glows gold.
  const T = table(c, 50, 90, 170);
  let s = club(c, 'ww' + (c.light ? 'l' : 'd')) + T.svg;
  s += ace(160, 52, 13, 'wave', limbOf(c)) + back(178, 40, 10) + back(180, 38, 10);
  [['K', 'h'], ['9', 'h'], ['4', 'c'], ['K', 's'], ['2', 'h']].forEach(([r, su], i) => { s += card(T.at((i - 2) * 0.27, 80) - 10, 64, 20, r, su); });
  s += card(52, 100, 24, 'A', 'h', -8) + card(74, 100, 24, 'J', 'h', 6) + glow(46, 96, 56, 40);
  s += card(222, 100, 24, 'K', 'd', -6) + card(244, 100, 24, 'Q', 'c', 8);
  s += '<text x="160" y="124" font-size="18" ' + TXT + ' text-anchor="middle" fill="#f0c75e">?</text>';
  return s;
}

function hilo(c) {
  // Higher or Lower: the card on the felt, the next one coming off the shoe,
  // the gold arrows above and below, the Ace at the shoe.
  const T = table(c, 52, 90, 170);
  let s = club(c, 'hl' + (c.light ? 'l' : 'd')) + T.svg;
  s += card(118, 62, 34, '8', 'h', -4);
  s += back(214, 70, 26, 4) + back(212, 68, 26, 4);
  s += back(168, 52, 28, 14) + '<path d="M204 58 q-8 -6 -18 -4" stroke="rgba(245,240,227,.45)" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
  const arrow = (y, up) => '<path d="M' + (180) + ' ' + y + ' l12 ' + (up ? -12 : 12) + ' l12 ' + (up ? 12 : -12) + ' z" fill="#f0c75e" stroke="#8a6510" stroke-width="1"/>';
  s += arrow(40, true) + arrow(104, false);
  return s + stack(60, 134, 16, 5, '#2b6cb0') + stack(78, 134, 16, 3, '#d8b25a') + ace(262, 108, 14, 'wave', limbOf(c));
}

function bluff(c) {
  // The Ace's Bluff: the Ace across the table behind his two hidden cards, a
  // drop of sweat, the chips in the pot, the board 3 + 1 + 1, your two cards.
  const T = table(c, 58, 100, 180);
  let s = club(c, 'bl' + (c.light ? 'l' : 'd')) + T.svg;
  s += ace(150, 72, 16, 'idle', limbOf(c)) + '<path d="M163 32 q4 6 0 9 q-4 -3 0 -9z" fill="#7fc8ff"/>';
  s += back(172, 56, 14, -8) + back(186, 56, 14, 8);
  const xs = [-0.5, -0.31, -0.12, 0.13, 0.38];
  [['A', 'h'], ['8', 'c'], ['8', 'd'], ['3', 's'], ['J', 'h']].forEach(([r, su], i) => { s += card(T.at(xs[i], 92) - 9, 80, 18, r, su); });
  s += stack(250, 132, 14, 4, '#c62828') + stack(265, 132, 14, 6, '#2b6cb0') + stack(56, 132, 14, 3, '#d8b25a');
  s += card(138, 108, 22, 'A', 's', -6) + card(160, 108, 22, 'K', 'd', 6);
  return s;
}

function pokerdrop(c) {
  // Poker Drop: the upright frame standing on the felt, the cards in its
  // columns, a line of five lit gold, a card dropping in, the Ace beside.
  const T = table(c, 98, 120, 190);
  let s = club(c, 'pd' + (c.light ? 'l' : 'd')) + T.svg;
  const x0 = 112, y0 = 26, cw = 12, ch = 15, g = 2;
  s += '<rect x="' + (x0 - 6) + '" y="' + (y0 - 6) + '" width="' + (7 * cw + 6 * g + 12) + '" height="' + (6 * ch + 5 * g + 12) + '" rx="6" fill="#2a3a8a" stroke="#d8b25a" stroke-width="1.2"/>'
    + '<rect x="' + (x0 - 12) + '" y="' + (y0 + 6 * ch + 5 * g + 4) + '" width="10" height="12" fill="#1d2766"/><rect x="' + (x0 + 7 * cw + 6 * g + 2) + '" y="' + (y0 + 6 * ch + 5 * g + 4) + '" width="10" height="12" fill="#1d2766"/>';
  const cols = [[['9', 'h'], ['3', 'c']], [['10', 's'], ['K', 'd'], ['2', 'h']], [['J', 'h'], ['5', 's']], [['Q', 'd'], ['8', 'c'], ['4', 'h'], ['A', 's']],
    [['K', 'c'], ['7', 'd']], [['6', 's']], []];
  for (let k = 0; k < 7; k++) for (let r = 0; r < 6; r++) {
    const x = x0 + k * (cw + g), y = y0 + (5 - r) * (ch + g), p = cols[k][r];
    s += p ? card(x, y, cw, p[0], p[1]) : '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" rx="3" fill="#0e1a3a"/>';
  }
  const by = y0 + 5 * (ch + g);
  s += glow(x0 - 2, by - 2, 5 * cw + 4 * g + 4, ch + 4);
  s += card(x0 + 5 * (cw + g), 2, cw, 'A', 'h');
  return s + stack(52, 136, 16, 4, '#c62828') + ace(262, 132, 15, 'wave', limbOf(c));
}

const TXT = 'font-family="Inter,system-ui,sans-serif" font-weight="700"';

/** The Ace seen from behind (Ace Dash): his card back, arms and legs; feet at (x, y). */
function aceBack(x, y, s, limb) {
  const h = s * 1.4, top = y - h - s * 0.6, l = x - s / 2, hip = top + h, ay = top + h * 0.5;
  return '<ellipse cx="' + x + '" cy="' + (y + 1) + '" rx="' + (s * 0.6) + '" ry="' + (s * 0.14) + '" fill="rgba(0,0,0,.3)"/>'
    + '<path d="M' + (x - s * 0.18) + ' ' + hip + ' l' + (-s * 0.12) + ' ' + (s * 0.6) + ' M' + (x + s * 0.18) + ' ' + hip + ' l' + (s * 0.1) + ' ' + (s * 0.45)
    + '" stroke="' + limb + '" stroke-width="' + (s * 0.09).toFixed(1) + '" stroke-linecap="round" fill="none"/>'
    + [[l, ay, l - s * 0.38, ay + s * 0.3], [l + s, ay, l + s * 1.38, ay - s * 0.1]].map(([x1, y1, x2, y2]) => '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2
      + '" stroke="' + limb + '" stroke-width="' + (s * 0.07).toFixed(1) + '" stroke-linecap="round"/><circle cx="' + x2 + '" cy="' + y2 + '" r="' + (s * 0.12).toFixed(1)
      + '" fill="#fff" stroke="#1d222b" stroke-width="' + (s * 0.05).toFixed(1) + '"/>').join('')
    + back(l, top, s);
}

function dash(c) {
  // The felt runs to a vanishing point; three lanes, the rails on both sides.
  const vy = 40, top = 30, bot = 140;   // half-width of the felt at the horizon and at the bottom
  const at = (f, y) => 160 + f * (top + (bot - top) * (y - vy) / (140 - vy));   // f: -1 … 1 across the felt
  const lamps = [60, 260].map((lx) => '<circle cx="' + lx + '" cy="22" r="30" fill="url(#adg)"/>').join('');
  let s = '<defs><linearGradient id="ads" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c.skyTop + '"/><stop offset="1" stop-color="' + c.skyBot + '"/></linearGradient>'
    + '<radialGradient id="adg"><stop offset="0" stop-color="rgb(' + c.lamp + ')" stop-opacity=".45"/><stop offset="1" stop-color="rgb(' + c.lamp + ')" stop-opacity="0"/></radialGradient></defs>'
    + '<rect width="320" height="140" fill="url(#ads)"/>' + lamps
    + '<path d="M' + at(-1.25, vy) + ' ' + vy + ' L' + at(1.25, vy) + ' ' + vy + ' L' + at(1.25, 140) + ' 140 L' + at(-1.25, 140) + ' 140 Z" fill="' + c.rim + '"/>'
    + '<path d="M' + at(-1, vy) + ' ' + vy + ' L' + at(1, vy) + ' ' + vy + ' L' + at(1, 140) + ' 140 L' + at(-1, 140) + ' 140 Z" fill="#2f7a52"/>';
  for (const f of [-0.33, 0.33]) s += '<path d="M' + at(f, vy) + ' ' + vy + ' L' + at(f, 140) + ' 140" stroke="rgba(216,178,90,.55)" stroke-width="1.2" stroke-dasharray="7 6"/>';
  s += stack(at(-0.66, 86) - 9, 86, 18, 5, '#2b6cb0');
  s += back(at(0.66, 64) - 5, 50, 10, 90);
  s += '<path d="M' + (at(0.66, 64) + 12) + ' 54 h8 M' + (at(0.66, 64) + 14) + ' 59 h7" stroke="rgba(245,240,227,.5)" stroke-width="1" stroke-linecap="round"/>';
  [[60, 2.4], [72, 3.2], [87, 4.2], [104, 5.2]].forEach(([y, r]) => { s += chip(at(0, y), y, r, '#c62828'); });
  return s + aceBack(160, 134, 20, limbOf(c));
}

function run(c) {
  // Poker Run: one straight road at dusk to the city, a card to pick up on it
  // and chips on the verge, the Ace's red convertible from behind, his card
  // back at the wheel (web.56: no fork, no direction any more).
  const id = 'prn' + (c.light ? 'l' : 'd');
  const sky = c.light ? ['#2e63a8', '#f3c98a'] : ['#0a1322', '#c8743a'];
  const vy = 58, at = (f, y) => 160 + f * (8 + 150 * (y - vy) / (140 - vy));   // f: -1 … 1 across the road
  let s = '<defs><linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + sky[0] + '"/><stop offset="1" stop-color="' + sky[1] + '"/></linearGradient></defs>'
    + '<rect width="320" height="' + vy + '" fill="url(#' + id + 's)"/>'
    + '<circle cx="250" cy="' + (vy - 4) + '" r="12" fill="' + (c.light ? '#ffd27a' : '#f0a050') + '" opacity=".8"/>'
    + '<rect y="' + vy + '" width="320" height="' + (140 - vy) + '" fill="' + (c.light ? '#3f8f5a' : '#1c5639') + '"/>';
  [[8, 22, 18], [34, 30, 26], [70, 26, 14], [102, 20, 22], [208, 28, 24], [242, 22, 16], [270, 34, 28], [300, 20, 18]].forEach(([x, w, h]) => {
    s += '<rect x="' + x + '" y="' + (vy - h) + '" width="' + w + '" height="' + h + '" fill="' + (c.light ? '#5b6f8a' : '#101a2b') + '"/>';
    if (!c.light) for (let k = 0; k < 3; k++) s += '<rect x="' + (x + 4 + k * 6) + '" y="' + (vy - h + 5) + '" width="2" height="3" fill="#e8b84a" opacity=".7"/>';
  });
  s += '<path d="M' + at(-1, vy) + ' ' + vy + ' L' + at(1, vy) + ' ' + vy + ' L' + at(1, 140) + ' 140 L' + at(-1, 140) + ' 140 Z" fill="#2b3038"/>';
  s += '<path d="M' + at(-1, vy) + ' ' + vy + ' L' + at(-1, 140) + ' 140 M' + at(1, vy) + ' ' + vy + ' L' + at(1, 140) + ' 140" stroke="#e9e4d6" stroke-width="1.4" opacity=".7"/>';
  for (const y of [66, 78, 94, 116]) s += '<rect x="' + (at(0, y) - 0.6 - (y - vy) * 0.02) + '" y="' + y + '" width="' + (1.2 + (y - vy) * 0.04) + '" height="' + (3 + (y - vy) * 0.12) + '" fill="#e9e4d6" opacity=".8"/>';
  s += card(at(0.4, 84) - 6, 72, 12, 'A', 's', -8) + '<ellipse cx="' + at(0.4, 88) + '" cy="90" rx="7" ry="1.5" fill="rgba(0,0,0,.3)"/>';
  s += chip(at(-1.25, 100), 100, 4, '#e8b84a') + chip(at(-1.35, 112), 112, 5, '#e8b84a') + chip(at(1.3, 106), 106, 4.5, '#c62828');
  const cx = 160, by = 136, w = 64, h = 27;
  s += '<ellipse cx="' + cx + '" cy="' + (by + 1) + '" rx="34" ry="4" fill="rgba(0,0,0,.4)"/>'
    + '<rect x="' + (cx - 31) + '" y="' + (by - 16) + '" width="12" height="16" rx="5" fill="#0b0e12"/><rect x="' + (cx + 19) + '" y="' + (by - 16) + '" width="12" height="16" rx="5" fill="#0b0e12"/>'
    + '<path d="M' + (cx - 20) + ' ' + (by - h) + ' L' + (cx - 17) + ' ' + (by - h - 20) + ' H' + (cx + 17) + ' L' + (cx + 20) + ' ' + (by - h) + '" fill="rgba(160,200,230,.25)" stroke="#d7dce2" stroke-width="1.2"/>'
    + '<g transform="rotate(-6 ' + (cx - 11) + ' ' + (by - 30) + ')"><rect x="' + (cx - 19) + '" y="' + (by - 50) + '" width="16" height="23" rx="2.5" fill="#b3261e" stroke="#141414" stroke-width="1"/>'
    + '<rect x="' + (cx - 17.5) + '" y="' + (by - 48.5) + '" width="13" height="20" rx="1.8" fill="none" stroke="#fbf7ee" stroke-width=".7"/>'
    + '<circle cx="' + (cx - 11) + '" cy="' + (by - 38.5) + '" r="4.2" fill="#f5f0e3"/><circle cx="' + (cx - 11) + '" cy="' + (by - 38.5) + '" r="2.4" fill="#b3261e"/></g>'
    + '<rect x="' + (cx - 20) + '" y="' + (by - 34) + '" width="17" height="10" rx="3" fill="#3a1c1e"/><rect x="' + (cx + 3) + '" y="' + (by - 38) + '" width="17" height="14" rx="3" fill="#3a1c1e"/>'
    + '<path d="M' + (cx - w / 2) + ' ' + (by - 7) + ' C' + (cx - w / 2 - 3) + ' ' + (by - 20) + ' ' + (cx - w / 2) + ' ' + (by - h - 3) + ' ' + (cx - 22) + ' ' + (by - h - 3)
    + ' Q' + cx + ' ' + (by - h + 1) + ' ' + (cx + 22) + ' ' + (by - h - 3) + ' C' + (cx + w / 2) + ' ' + (by - h - 3) + ' ' + (cx + w / 2 + 3) + ' ' + (by - 20) + ' ' + (cx + w / 2) + ' ' + (by - 7)
    + ' Q' + (cx + w / 2 - 1) + ' ' + (by - 2) + ' ' + (cx + 20) + ' ' + (by - 2) + ' H' + (cx - 20) + ' Q' + (cx - w / 2 + 1) + ' ' + (by - 2) + ' ' + (cx - w / 2) + ' ' + (by - 7) + ' Z" fill="#c2303a"/>'
    + '<circle cx="' + (cx - 20) + '" cy="' + (by - 17) + '" r="4.5" fill="#ff3b3f" stroke="#3a0d10" stroke-width="1"/><circle cx="' + (cx + 20) + '" cy="' + (by - 17) + '" r="4.5" fill="#ff3b3f" stroke="#3a0d10" stroke-width="1"/>'
    + '<rect x="' + (cx - 7) + '" y="' + (by - 15) + '" width="14" height="6" rx="3" fill="#f4eedf"/>'
    + '<rect x="' + (cx - 26) + '" y="' + (by - 8) + '" width="52" height="4.5" rx="2.2" fill="#262b32"/>';
  return s;
}

function tapis(c) {
  // Tapis!: stacks of chips on the felt, one of the Ace's friends on each and a
  // hole in the felt under each; one friend jumps into his hole.
  const T = table(c, 92, 120, 200), base = 124, pal = ['#c62828', '#2b6cb0', '#2f9a55', '#2a2d33'];
  let s = club(c, 'tp' + (c.light ? 'l' : 'd')) + T.svg;
  const hole = (x) => '<ellipse cx="' + x + '" cy="' + (base + 1) + '" rx="11" ry="4" fill="#d8b25a"/><ellipse cx="' + x + '" cy="' + (base + 1) + '" rx="9.5" ry="3.2" fill="#120c06"/>';
  const cols = [[84, [0, 0, 1, 2, 2, 1]], [118, [1, 1, 3, 3, 0, 0, 2, 1]], [152, [2, 0, 0, 1]], [220, [3, 2, 2, 0, 1, 1, 3]], [254, [1, 0, 0, 2, 2]]];
  for (const [x, ks] of cols) {
    s += hole(x);
    ks.forEach((k, i) => { s += stack(x - 9, base - i * 4.2, 18, 1, pal[k]); });
    s += ace(x, base - ks.length * 4.2, 11, x === 152 ? 'wave' : 'idle', limbOf(c));
  }
  s += hole(186) + ace(186, base - 18, 11, 'jump', limbOf(c), base)
    + '<path d="M178 ' + (base - 44) + ' q8 -6 16 0" stroke="' + c.gold + '" stroke-width="1.4" fill="none" opacity=".7" stroke-linecap="round"/>';
  return s;
}

const SCENES = { 'ace-runner': runner, 'ace-dash': dash, 'poker-run': run, house, tapis, solitaire, videopoker, whowins, hilo, bluff, pokerdrop };

/** The cover picture of game `id` for the light or dark theme. */
export function art(id, light) {
  const f = SCENES[id];
  if (!f) return '';
  return '<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' + f(ink(!!light)) + '</svg>';
}
