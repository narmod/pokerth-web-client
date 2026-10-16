// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Cover pictures of the arcade's games (web extension, narmod 2026-10-16,
// web.89) — one small SVG scene per game for its card on the arcade's home
// (menu.mjs): the Ace on his run, at the top of his house of cards, beside
// his solitaire grid. Painted with the games' own palette (common.mjs ink)
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

function runner(c) {
  const G = 112;
  return room(c, 'ar' + (c.light ? 'l' : 'd'), G)
    + '<ellipse cx="160" cy="' + (G - 6) + '" rx="54" ry="8" fill="' + c.farFelt + '" opacity=".8"/>'
    + '<ellipse cx="290" cy="' + (G - 4) + '" rx="40" ry="6" fill="' + c.farFelt + '" opacity=".8"/>'
    + stack(208, G, 16, 5, '#2b6cb0') + stack(226, G, 16, 3, '#c62828')
    + card(146, 30, 15, 'J', 'h', -12)
    + chip(118, 42, 10, '#d8b25a')
    + '<text x="118" y="64" font-size="7" font-weight="700" text-anchor="middle" fill="' + c.gold + '" font-family="Inter,system-ui,sans-serif">ALL-IN</text>'
    + ace(72, G - 26, 22, 'jump', limbOf(c), G)
    + '<path d="M40 ' + (G - 40) + ' q-10 2 -20 0 M44 ' + (G - 30) + ' q-12 2 -24 0" stroke="' + c.gold + '" stroke-width="1.5" fill="none" opacity=".6" stroke-linecap="round"/>'
    + [0, 1, 2, 3, 4].map((i) => i < 2 ? card(234 + i * 16, 8, 13, i ? 'A' : 'K', i ? 's' : 'd')
      : '<rect x="' + (234 + i * 16) + '" y="8" width="13" height="18.2" rx="1.6" fill="none" stroke="' + c.gold + '" stroke-dasharray="2 2" opacity=".7"/>').join('');
}

function house(c) {
  const G = 120, w = 18, h = w * 1.4;
  const frame = (x, y) => card(x - 10, y - h, w, '8', 'd', -16) + card(x + 2, y - h, w, '3', 'h', 16);
  const floor1 = G - 2, floor2 = floor1 - h - 3;
  return room(c, 'hc' + (c.light ? 'l' : 'd'), G)
    + '<path d="M70 18 H250" stroke="' + c.gold + '" stroke-width="2.5" stroke-linecap="round"/>'
    + chip(196, 18, 6, '#c62828')
    + '<path d="M196 24 V30" stroke="' + c.gold + '" stroke-width="1"/>'
    + card(187, 30, 18, 'Q', 's', 8)
    + back(266, 12, 20) + back(268, 14, 20) + card(270, 16, 20, '6', 'h')
    + frame(132, floor1) + frame(172, floor1)
    + '<rect x="122" y="' + (floor1 - h - 3) + '" width="76" height="3" rx="1" fill="#fffdf8" stroke="rgba(0,0,0,.3)" stroke-width=".6"/>'
    + frame(152, floor2)
    + '<rect x="140" y="' + (floor2 - h - 3) + '" width="40" height="3" rx="1" fill="#fffdf8" stroke="rgba(0,0,0,.3)" stroke-width=".6"/>'
    + ace(160, floor2 - h - 3, 16, 'wave', limbOf(c))
    + '<text x="16" y="24" font-size="9" font-weight="700" fill="' + c.text + '" font-family="Inter,system-ui,sans-serif" letter-spacing=".08em">TILT</text>'
    + '<rect x="16" y="29" width="52" height="5" rx="2.5" fill="' + c.shade + '" opacity=".5"/><rect x="16" y="29" width="18" height="5" rx="2.5" fill="' + c.gold + '"/>';
}

function solitaire(c) {
  const felt = c.light ? ['#4fa478', '#2f7a52'] : ['#25875a', '#0f4a31'];
  const x0 = 94, y0 = 12, cw = 18, ch = 23, gx = 3, gy = 1.6;
  const placed = { '0,0': ['10', 's'], '1,0': ['J', 's'], '2,0': ['Q', 's'], '3,0': ['K', 's'], '4,0': ['A', 's'],
    '0,1': ['7', 'h'], '2,1': ['7', 'c'], '4,1': ['9', 'd'], '0,2': ['7', 'd'], '1,2': ['5', 'c'], '3,3': ['2', 'h'], '0,3': ['4', 'c'], '2,4': ['8', 'h'] };
  let grid = '';
  for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++) {
    const x = x0 + k * (cw + gx), y = y0 + r * (ch + gy), p = placed[k + ',' + r];
    grid += p ? card(x + 0.5, y, cw - 1, p[0], p[1])
      : '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" rx="2" fill="rgba(0,0,0,.18)" stroke="rgba(255,255,255,.12)"/>';
  }
  const fid = 'psf' + (c.light ? 'l' : 'd');
  return '<defs><radialGradient id="' + fid + '" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="' + felt[0] + '"/><stop offset="1" stop-color="' + felt[1] + '"/></radialGradient></defs>'
    + '<rect width="320" height="140" fill="url(#' + fid + ')"/>' + grid
    + '<rect x="' + (x0 - 2) + '" y="' + (y0 - 2) + '" width="' + (5 * cw + 4 * gx + 4) + '" height="' + (ch + 3) + '" rx="3" fill="none" stroke="#f0c75e" stroke-width="1.6"/>'
    + '<text x="' + (x0 + 5 * (cw + gx) + 4) + '" y="' + (y0 + 16) + '" font-size="8" font-weight="700" fill="#f0c75e" font-family="Inter,system-ui,sans-serif">100</text>'
    + back(236, 30, 26) + card(240, 34, 26, 'K', 'd')
    + ace(262, 128, 15, 'wave', limbOf(c))
    + '<text x="16" y="22" font-size="8" font-weight="700" fill="rgba(255,255,255,.75)" font-family="Inter,system-ui,sans-serif" letter-spacing=".08em">5 × 5</text>';
}

/** The green felt of the card games (lighter in the light theme). */
function feltBg(c, id) {
  const f = c.light ? ['#4fa478', '#2f7a52'] : ['#25875a', '#0f4a31'];
  const fid = id + (c.light ? 'l' : 'd');
  return '<defs><radialGradient id="' + fid + '" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="' + f[0] + '"/><stop offset="1" stop-color="' + f[1] + '"/></radialGradient></defs>'
    + '<rect width="320" height="140" fill="url(#' + fid + ')"/>';
}
const TXT = 'font-family="Inter,system-ui,sans-serif" font-weight="700"';

function videopoker(c) {
  const rows = [['ROYAL', '4000'], ['ST.FLUSH', '250'], ['QUADS', '125'], ['FULL', '45'], ['FLUSH', '30'], ['STRAIGHT', '20'], ['TRIPS', '15'], ['2 PAIR', '10'], ['J+', '5']];
  let pt = '<rect x="10" y="12" width="84" height="116" rx="6" fill="rgba(8,24,16,.55)" stroke="rgba(216,178,90,.5)"/>';
  rows.forEach(([n, v], i) => {
    const y = 24 + i * 12;
    if (i === 3) pt += '<rect x="13" y="' + (y - 8) + '" width="78" height="11" rx="3" fill="#d8b25a"/>';
    pt += '<text x="17" y="' + y + '" font-size="7" ' + TXT + ' fill="' + (i === 3 ? '#141414' : '#f5f0e3') + '">' + n + '</text>'
      + '<text x="87" y="' + y + '" font-size="7" ' + TXT + ' text-anchor="end" fill="' + (i === 3 ? '#141414' : '#d8b25a') + '">' + v + '</text>';
  });
  const hand = [['9', 'h', 1], ['9', 'c', 1], ['9', 's', 1], ['4', 'd', 0], ['4', 'h', 0]];
  let cards = '';
  hand.forEach(([r, su, held], i) => {
    const x = 106 + i * 33;
    cards += card(x, 38 - (held ? 4 : 0), 29, r, su);
    if (held) cards += '<rect x="' + (x + 1) + '" y="' + 80 + '" width="27" height="9" rx="2" fill="#d8b25a"/><text x="' + (x + 14.5) + '" y="87" font-size="6" ' + TXT + ' text-anchor="middle" fill="#141414">HELD</text>';
  });
  return feltBg(c, 'vpf') + pt + cards
    + '<rect x="134" y="104" width="100" height="22" rx="8" fill="#d8b25a" stroke="#8a6510"/><text x="184" y="118" font-size="10" ' + TXT + ' text-anchor="middle" fill="#141414">DRAW</text>'
    + '<text x="186" y="24" font-size="12" text-anchor="middle" fill="#f5d77a" font-family="Cinzel,Georgia,serif" font-weight="700">+45</text>'
    + ace(292, 128, 15, 'wave', limbOf(c));
}

function whowins(c) {
  const board = [['K', 'h'], ['9', 'h'], ['4', 'c'], ['K', 's'], ['2', 'h']];
  let s = feltBg(c, 'wwf');
  s += '<rect x="60" y="10" width="200" height="5" rx="2.5" fill="rgba(0,0,0,.3)"/><rect x="60" y="10" width="120" height="5" rx="2.5" fill="#e0a33a"/>';
  board.forEach(([r, su], i) => { s += card(103 + i * 23, 30, 21, r, su); });
  s += '<rect x="14" y="78" width="66" height="44" rx="8" fill="rgba(216,178,90,.3)" stroke="#f0c75e" stroke-width="1.6"/>' + card(20, 82, 25, 'A', 'h') + card(49, 82, 25, 'J', 'h');
  s += '<rect x="240" y="78" width="66" height="44" rx="8" fill="rgba(0,0,0,.2)"/>' + card(246, 82, 25, 'K', 'd') + card(275, 82, 25, 'Q', 'c');
  s += '<text x="160" y="96" font-size="22" ' + TXT + ' text-anchor="middle" fill="#7ee2a0">✓</text>';
  s += '<rect x="122" y="108" width="76" height="20" rx="8" fill="rgba(11,18,16,.55)" stroke="rgba(245,240,227,.55)"/><text x="160" y="122" font-size="9" ' + TXT + ' text-anchor="middle" fill="#f5f0e3">SPLIT</text>';
  s += '<text x="47" y="74" font-size="8" ' + TXT + ' text-anchor="middle" fill="#f5d77a">FLUSH</text><text x="273" y="74" font-size="8" ' + TXT + ' text-anchor="middle" fill="rgba(245,240,227,.75)">TRIPS</text>';
  return s;
}

function hilo(c) {
  let s = feltBg(c, 'hlf');
  [['4', 'c'], ['9', 'd'], ['Q', 's'], ['7', 'h'], ['2', 'c'], ['J', 'd']].forEach(([r, su], i) => { s += card(104 + i * 19, 8, 14, r, su); });
  s += card(112, 34, 40, '8', 'h');
  s += back(170, 30, 40) + back(168, 32, 40) + card(166, 34, 40, 'K', 's');
  s += '<rect x="164" y="32" width="44" height="60" rx="6" fill="none" stroke="#7ee2a0" stroke-width="2"/>';
  s += '<rect x="20" y="104" width="86" height="24" rx="8" fill="#d8b25a" stroke="#8a6510"/><text x="63" y="120" font-size="10" ' + TXT + ' text-anchor="middle" fill="#141414">▲ 46%</text>';
  s += '<rect x="117" y="104" width="86" height="24" rx="8" fill="rgba(11,18,16,.55)" stroke="rgba(245,240,227,.55)"/><text x="160" y="120" font-size="10" ' + TXT + ' text-anchor="middle" fill="#f5f0e3">34</text>';
  s += '<rect x="214" y="104" width="86" height="24" rx="8" fill="#d8b25a" stroke="#8a6510"/><text x="257" y="120" font-size="10" ' + TXT + ' text-anchor="middle" fill="#141414">▼ 50%</text>';
  s += '<text x="238" y="70" font-size="14" text-anchor="middle" fill="#f5d77a" font-family="Cinzel,Georgia,serif" font-weight="700">×3</text>';
  return s + ace(292, 96, 13, 'wave', limbOf(c));
}

function bluff(c) {
  let s = feltBg(c, 'blf');
  s += ace(132, 58, 18, 'idle', limbOf(c));
  s += '<path d="M145 16 q4 6 0 9 q-4 -3 0 -9z" fill="#7fc8ff"/>';
  s += back(160, 16, 20) + back(183, 16, 20);
  s += '<rect x="204" y="4" width="62" height="18" rx="8" fill="#f5f0e3"/><text x="235" y="16" font-size="8" ' + TXT + ' text-anchor="middle" fill="#141414">BET 20</text>';
  [['A', 'h'], ['8', 'c'], ['8', 'd'], ['3', 's'], ['J', 'h']].forEach(([r, su], i) => { s += card(103 + i * 23, 62, 21, r, su); });
  s += card(134, 96, 23, 'A', 's') + card(160, 96, 23, 'K', 'd');
  s += '<rect x="20" y="106" width="70" height="22" rx="8" fill="#b3261e"/><text x="55" y="121" font-size="10" ' + TXT + ' text-anchor="middle" fill="#f5f0e3">Fold</text>';
  s += '<rect x="230" y="106" width="70" height="22" rx="8" fill="#d8b25a" stroke="#8a6510"/><text x="265" y="121" font-size="10" ' + TXT + ' text-anchor="middle" fill="#141414">Call</text>';
  s += '<text x="40" y="60" font-size="34" ' + TXT + ' text-anchor="middle" fill="rgba(245,240,227,.5)">?</text>';
  return s;
}

function preflop(c) {
  let s = feltBg(c, 'ppf');
  s += '<ellipse cx="96" cy="66" rx="70" ry="38" fill="rgba(8,40,26,.55)" stroke="rgba(216,178,90,.6)" stroke-width="2"/>';
  const seats = ['UTG', '+1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
  seats.forEach((p, k) => {
    const a = Math.PI / 2 + ((k - 6) * 2 * Math.PI) / 9 + 0.35, x = 96 + Math.cos(a) * 72, y = 66 + Math.sin(a) * 40;
    const me = p === 'CO', folded = k < 5;
    s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="10" fill="' + (me ? '#d8b25a' : folded ? 'rgba(60,70,66,.85)' : '#f5f0e3') + '" stroke="rgba(0,0,0,.4)"/>'
      + '<text x="' + x.toFixed(1) + '" y="' + (y + 2.5).toFixed(1) + '" font-size="6" ' + TXT + ' text-anchor="middle" fill="' + (folded ? 'rgba(245,240,227,.6)' : '#141414') + '">' + p + '</text>';
  });
  s += card(184, 30, 34, 'A', 'h') + card(222, 30, 34, '9', 'h');
  s += '<rect x="174" y="104" width="56" height="22" rx="8" fill="#b3261e"/><text x="202" y="119" font-size="10" ' + TXT + ' text-anchor="middle" fill="#f5f0e3">Fold</text>';
  s += '<rect x="238" y="104" width="56" height="22" rx="8" fill="#d8b25a" stroke="#8a6510"/><text x="266" y="119" font-size="10" ' + TXT + ' text-anchor="middle" fill="#141414">Raise</text>';
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) s += '<rect x="' + (272 + j * 7) + '" y="' + (8 + i * 7) + '" width="6" height="6" fill="' + (i + j < 6 || i === j ? '#d8b25a' : 'rgba(0,0,0,.3)') + '"/>';
  return s;
}

function nuts(c) {
  let s = feltBg(c, 'ntf');
  [['9', 'h'], ['T', 'h'], ['J', 'h'], ['2', 'c'], ['5', 's']].forEach(([r, su], i) => { s += card(103 + i * 23, 10, 21, r === 'T' ? '10' : r, su); });
  const opts = [[['A', 'h'], ['Q', 'h']], [['K', 'h'], ['Q', 'h']], [['Q', 'd'], ['8', 'c']], [['J', 'd'], ['J', 's']]];
  opts.forEach((p, i) => {
    const x = 18 + i * 74, nut = i === 1;
    s += '<rect x="' + x + '" y="54" width="66" height="70" rx="8" fill="' + (nut ? 'rgba(63,174,106,.35)' : 'rgba(0,0,0,.2)') + '"' + (nut ? ' stroke="#7ee2a0" stroke-width="2"' : '') + '/>';
    s += '<text x="' + (x + 5) + '" y="64" font-size="7" ' + TXT + ' fill="rgba(245,240,227,.7)">' + 'ABCD'[i] + '</text>';
    s += card(x + 9, 62, 23, p[0][0], p[0][1]) + card(x + 35, 62, 23, p[1][0], p[1][1]);
    if (nut) s += '<text x="' + (x + 33) + '' + '" y="120" font-size="7" ' + TXT + ' text-anchor="middle" fill="#f5d77a">ST.FLUSH</text>';
  });
  return s;
}

function outs(c) {
  let s = feltBg(c, 'otf');
  [['7', 'h'], ['6', 'c'], ['K', 'h']].forEach(([r, su], i) => { s += card(98 + i * 25, 8, 23, r, su); });
  s += '<rect x="173" y="8" width="23" height="32" rx="3" fill="none" stroke="rgba(245,240,227,.3)" stroke-dasharray="3 3"/>';
  s += '<rect x="198" y="8" width="23" height="32" rx="3" fill="none" stroke="rgba(245,240,227,.3)" stroke-dasharray="3 3"/>';
  s += card(132, 46, 26, '9', 'h') + card(162, 46, 26, '8', 'h');
  [9, 12, 15, 17].forEach((n, i) => {
    const x = 70 + i * 47, ok = n === 15;
    s += '<rect x="' + x + '" y="94" width="40" height="22" rx="6" fill="' + (ok ? 'rgba(63,174,106,.55)' : 'rgba(0,0,0,.28)') + '"' + (ok ? ' stroke="#7ee2a0" stroke-width="2"' : '') + '/>';
    s += '<text x="' + (x + 20) + '" y="109" font-size="11" ' + TXT + ' text-anchor="middle" fill="' + (ok ? '#f5d77a' : '#f5f0e3') + '">' + n + '</text>';
  });
  s += '<text x="160" y="131" font-size="7" ' + TXT + ' text-anchor="middle" fill="#f5d77a">15 × 4 ≈ 60 %</text>';
  return s;
}

function potodds(c) {
  let s = feltBg(c, 'pdf');
  s += ace(58, 100, 24, 'idle', limbOf(c)) + back(96, 22, 20) + back(118, 22, 20);
  s += '<rect x="84" y="2" width="70" height="16" rx="7" fill="#f5f0e3"/><text x="119" y="13" font-size="8" ' + TXT + ' text-anchor="middle" fill="#141414">BET 30</text>';
  [['9', 'h'], ['K', 'h'], ['4', 'c'], ['2', 's']].forEach(([r, su], i) => { s += card(150 + i * 25, 10, 23, r, su); });
  s += '<rect x="250" y="10" width="23" height="32" rx="3" fill="none" stroke="rgba(245,240,227,.35)" stroke-dasharray="3 3"/>';
  s += card(178, 54, 24, 'A', 'h') + card(205, 54, 24, '7', 'h');
  s += '<text x="210" y="100" font-size="8" ' + TXT + ' text-anchor="middle" fill="#f5d77a">20 % &lt; 25 %</text>';
  s += '<rect x="96" y="108" width="62" height="24" rx="8" fill="#b3261e" stroke="#7ee2a0" stroke-width="2"/><text x="127" y="124" font-size="10" ' + TXT + ' text-anchor="middle" fill="#f5f0e3">Fold</text>';
  s += '<rect x="164" y="108" width="62" height="24" rx="8" fill="#d8b25a"/><text x="195" y="124" font-size="10" ' + TXT + ' text-anchor="middle" fill="#141414">Call 30</text>';
  return s;
}

const SCENES = { 'ace-runner': runner, house, solitaire, videopoker, whowins, hilo, bluff, preflop, nuts, outs, potodds };

/** The cover picture of game `id` for the light or dark theme. */
export function art(id, light) {
  const f = SCENES[id];
  if (!f) return '';
  return '<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' + f(ink(!!light)) + '</svg>';
}
