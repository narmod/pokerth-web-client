// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Poker Run's own scenery for the pyramid's 16 new circuits (web.116,
// narmod: lot 2 of the OutRun map — « each scene its own things »).
//
// skyLayer(): the skyline of a scene named by its theme's `skyX`, drawn
//   after poker-run.mjs's sky (gradient, sun, sea line) — the same
//   parallax: items on a fixed period, shifted by the road's bends.
// drawProp(): the roadside things of the new `side` kinds; a kind that
//   mixes in an older one asks for it back through `fallback(kind)`.
// snowfall(): the falling snow of the Alps' last stages, in screen space.
//
// Everything is flat filled shapes, as the rest of the game: cheap enough
// to draw every frame.
// ═══════════════════════════════════════════════════════════════════

const P = 1800;   // the skyline's period (px), as poker-run.mjs's SKY_P

/** A small seeded generator, the skylines the same every run. */
function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

/** How each skyline is laid out: widths, gaps and heights (fractions of the horizon's height). */
const LAYOUT = {
  desert: { w: [180, 320], gap: [0, 30], h: [0.05, 0.1] },
  canyon: { w: [140, 280], gap: [10, 60], h: [0.1, 0.22] },
  dome: { w: [70, 150], gap: [-30, 10], h: [0.1, 0.26] },
  hills: { w: [120, 240], gap: [-60, -10], h: [0.06, 0.15] },
  cliffs: { w: [90, 200], gap: [20, 90], h: [0.12, 0.3] },
  spires: { w: [70, 140], gap: [30, 120], h: [0.18, 0.4] },
  snow: { w: [90, 190], gap: [-50, 10], h: [0.16, 0.36] },
  forest: { w: [120, 230], gap: [-70, -20], h: [0.07, 0.15] },
  neon: { w: [30, 80], gap: [2, 10], h: [0.1, 0.42] },
  pier: { w: [40, 90], gap: [30, 120], h: [0.06, 0.16] },
  deco: { w: [40, 80], gap: [40, 140], h: [0.05, 0.11] },
  lighthouse: { w: [40, 110], gap: [80, 260], h: [0.02, 0.05] },
  rivtown: { w: [140, 260], gap: [20, 120], h: [0.08, 0.17] },
  normandy: { w: [40, 70], gap: [60, 200], h: [0.06, 0.1] },
};
const ITEMS = {};
function items(key, typ) {
  if (ITEMS[key]) return ITEMS[key];
  const L = LAYOUT[typ], r = seeded(key + ':' + typ), out = [];
  let x = 0;
  while (x < P) {
    const w = L.w[0] + r() * (L.w[1] - L.w[0]);
    out.push({ x, w, h: L.h[0] + r() * (L.h[1] - L.h[0]), l: r(), v: Math.floor(r() * 1e6) });
    x += w + L.gap[0] + r() * (L.gap[1] - L.gap[0]);
  }
  // One landmark per period (Half Dome, the Ventoux, the Ferris wheel …): on the widest item.
  let big = 0; out.forEach((it, i) => { if (it.w > out[big].w) big = i; }); out[big].mark = true;
  return (ITEMS[key] = out);
}

const tri = (g, x0, y0, x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineTo(x2, y2); g.fill(); };
const box = (g, x, y, w, h, r) => { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); };

/**
 * The skyline of theme `th` (its `skyX`), on the horizon `cy`, shifted by `o` (the parallax); `now` in seconds
 * for what moves (the Ferris wheel, the neon).
 */
export function skyLayer(g, th, W, cy, o, alpha, now) {
  const typ = th.skyX;
  if (!typ || !LAYOUT[typ]) return;
  g.globalAlpha = alpha;
  // The plain skies get their sun (or moon) here; the sea ones have it already.
  if (th.skyT === 'plain') {
    g.fillStyle = th.night ? '#f4eedf' : typ === 'snow' ? '#ffffff' : '#fff1c8';
    g.beginPath(); g.arc(W * 0.78, cy * (th.night ? 0.25 : 0.33), Math.min(W, cy) * (th.night ? 0.03 : 0.05), 0, 7); g.fill();
  }
  if (typ === 'normandy') clouds(g, W, cy, o, th);
  if (typ === 'snow' && th.lake) { g.fillStyle = '#cfe3f2'; g.fillRect(-10, cy - cy * 0.022, W + 20, cy * 0.022 + 1); }
  if (typ === 'cliffs') { g.fillStyle = '#2f9e8e'; g.fillRect(-10, cy - cy * 0.012, W + 20, cy * 0.012 + 1); }
  for (const it of items(th.key, typ)) for (const rep of [0, P]) {
    const x = it.x - o + rep - (P - W) / 2;
    if (x + it.w * 1.6 < -60 || x - it.w * 0.6 > W + 60) continue;
    const h = it.h * cy;
    PAINT[typ](g, th, x, it.w, h, cy, it, now);
  }
  g.globalAlpha = 1;
}

function clouds(g, W, cy, o, th) {
  g.fillStyle = 'rgba(255,255,255,.75)';
  for (let i = 0; i < 6; i++) {
    const x = ((i * 337 - o * 0.4) % (W + 300) + W + 300) % (W + 300) - 150, y = cy * (0.18 + (i % 3) * 0.12), s = 30 + (i * 17) % 40;
    for (const [dx, dy, r] of [[0, 0, 1], [s * 0.7, -s * 0.15, 0.8], [-s * 0.7, 0.05 * s, 0.7], [s * 1.3, s * 0.1, 0.6]]) { g.beginPath(); g.ellipse(x + dx, y + dy, s * 0.55 * r, s * 0.32 * r, 0, 0, 7); g.fill(); }
  }
}

const PAINT = {
  // Route 66: a long low ridge far away, and now and then a water tower by the road.
  desert(g, th, x, w, h, cy, it) {
    g.fillStyle = th.a; g.beginPath(); g.moveTo(x - 20, cy); g.lineTo(x + w * 0.25, cy - h); g.lineTo(x + w * 0.55, cy - h * 0.7); g.lineTo(x + w * 0.8, cy - h * 1.15); g.lineTo(x + w + 20, cy); g.fill();
    if (it.mark) {
      const tx = x + w * 0.5, th2 = cy * 0.16;
      g.fillStyle = '#6b5a4a'; g.fillRect(tx - 9, cy - th2 * 0.55, 2, th2 * 0.55); g.fillRect(tx + 7, cy - th2 * 0.55, 2, th2 * 0.55);
      g.fillStyle = '#d8d0c0'; box(g, tx - 12, cy - th2, 24, th2 * 0.45, 4); tri(g, tx - 13, cy - th2, tx, cy - th2 - 8, tx + 13, cy - th2);
    }
  },
  // The Grand Canyon: wide stepped plateaus, banded red and ochre.
  canyon(g, th, x, w, h, cy) {
    g.fillStyle = th.a; g.beginPath(); g.moveTo(x, cy);
    for (const [fx, fy] of [[0.06, 0.5], [0.12, 0.5], [0.18, 1], [0.82, 1], [0.88, 0.5], [0.94, 0.5], [1, 0]]) g.lineTo(x + w * fx, cy - h * fy);
    g.fill();
    g.fillStyle = th.b; g.fillRect(x + w * 0.18, cy - h * 0.82, w * 0.64, h * 0.1); g.fillRect(x + w * 0.12, cy - h * 0.4, w * 0.76, h * 0.08);
    g.globalAlpha *= 0.5; g.fillRect(x + w * 0.06, cy - h * 0.18, w * 0.88, h * 0.06); g.globalAlpha /= 0.5;
  },
  // Yosemite: grey granite, Half Dome once, a dark fir forest along the horizon.
  dome(g, th, x, w, h, cy, it) {
    g.fillStyle = th.a;
    if (it.mark) {
      // Half Dome: a rounded back, its sheer face cut on the right (a shade darker).
      const hh = cy * 0.3;
      g.beginPath(); g.moveTo(x - w * 0.3, cy); g.bezierCurveTo(x - w * 0.15, cy - hh * 0.75, x + w * 0.2, cy - hh * 1.08, x + w * 0.58, cy - hh); g.lineTo(x + w * 0.64, cy); g.fill();
      g.fillStyle = 'rgba(0,0,0,.18)'; tri(g, x + w * 0.58, cy - hh, x + w * 0.64, cy, x + w * 0.5, cy);
    }
    else tri(g, x - w * 0.2, cy, x + w / 2, cy - h, x + w * 1.2, cy);
    g.fillStyle = '#1f4a2e';
    for (let k = 0; k < w; k += 7) tri(g, x + k - 4, cy, x + k, cy - 6 - ((k * 13 + it.v) % 7), x + k + 4, cy);
  },
  // Provence (its bald Mont Ventoux once) and Tuscany (a hill village, its bell tower).
  hills(g, th, x, w, h, cy, it) {
    if (it.mark && th.ventoux) {
      const hh = cy * 0.3; g.fillStyle = th.a; tri(g, x - w * 0.5, cy, x + w * 0.5, cy - hh, x + w * 1.5, cy);
      g.fillStyle = th.b; tri(g, x + w * 0.5 - w * 0.25, cy - hh * 0.72, x + w * 0.5, cy - hh, x + w * 0.5 + w * 0.25, cy - hh * 0.72);
      return;
    }
    g.fillStyle = th.a; g.beginPath(); g.ellipse(x + w / 2, cy, w * 0.7, h, 0, Math.PI, 0); g.fill();
    if (th.village && it.l > 0.55) {
      const vx = x + w / 2, vy = cy - h * 0.92;
      for (let i = -2; i <= 2; i++) { g.fillStyle = '#e8d8b8'; g.fillRect(vx + i * 7 - 3, vy - 6, 6, 6); g.fillStyle = '#b0502c'; tri(g, vx + i * 7 - 4, vy - 6, vx + i * 7, vy - 9, vx + i * 7 + 4, vy - 6); }
      g.fillStyle = '#e8d8b8'; g.fillRect(vx + 1, vy - 20, 4, 14); g.fillStyle = '#b0502c'; tri(g, vx, vy - 20, vx + 3, vy - 25, vx + 6, vy - 20);
    }
  },
  // The Verdon: pale limestone walls, sheer and ragged, above the emerald water.
  cliffs(g, th, x, w, h, cy, it) {
    g.fillStyle = th.a; g.beginPath(); g.moveTo(x, cy); g.lineTo(x + w * 0.04, cy - h * 0.9);
    const n = 5; for (let i = 1; i <= n; i++) g.lineTo(x + w * (0.04 + 0.92 * i / n), cy - h * (0.78 + 0.22 * (((it.v >> i) & 3) / 3)));
    g.lineTo(x + w, cy); g.fill();
    g.fillStyle = 'rgba(0,0,0,.12)';
    for (let i = 1; i < 4; i++) g.fillRect(x + w * i / 4, cy - h * 0.8, Math.max(1, w * 0.012), h * 0.8);
  },
  // The Dolomites: tall pale spires in a crown, snow in their gullies.
  spires(g, th, x, w, h, cy, it) {
    g.fillStyle = th.a; tri(g, x - w * 0.3, cy, x + w / 2, cy - h * 0.45, x + w * 1.3, cy);
    const n = 3 + (it.v % 3);
    for (let i = 0; i < n; i++) {
      const sx = x + w * (0.12 + 0.76 * i / (n - 1)), sh = h * (0.6 + 0.4 * (((it.v >> (i * 2)) & 3) / 3)), sw = w * 0.11;
      g.fillStyle = th.a; tri(g, sx - sw, cy - h * 0.3, sx, cy - sh, sx + sw, cy - h * 0.3);
      g.fillStyle = th.b; tri(g, sx - sw * 0.25, cy - sh * 0.7, sx, cy - sh * 0.82, sx + sw * 0.15, cy - sh * 0.62);
    }
  },
  // The high Alps (Stelvio, St. Moritz): big peaks white down to their shoulders.
  snow(g, th, x, w, h, cy) {
    const pw = w * 1.6, top = cy - h * 1.2, cx = x + w / 2;
    g.fillStyle = th.a; tri(g, x - pw * 0.2, cy, cx, top, x + w + pw * 0.2, cy);
    g.fillStyle = th.b; g.beginPath(); g.moveTo(cx, top);
    const lx = cx - (cx - (x - pw * 0.2)) * 0.55, rx = cx + (x + w + pw * 0.2 - cx) * 0.55, by = top + (cy - top) * 0.55;
    g.lineTo(rx, by); g.lineTo(cx + (rx - cx) * 0.5, by - (by - top) * 0.15); g.lineTo(cx + (rx - cx) * 0.2, by + 4); g.lineTo(cx - (cx - lx) * 0.3, by - (by - top) * 0.2); g.lineTo(lx, by); g.fill();
  },
  // Baden-Baden: the Black Forest's dark rounded hills, the spa's white colonnade once.
  forest(g, th, x, w, h, cy, it) {
    g.fillStyle = th.a; g.beginPath(); g.ellipse(x + w / 2, cy, w * 0.75, h, 0, Math.PI, 0); g.fill();
    g.fillStyle = th.b;
    for (let k = -w * 0.6; k < w * 0.6; k += 9) { const yy = cy - h * Math.sqrt(Math.max(0, 1 - (k / (w * 0.75)) ** 2)); tri(g, x + w / 2 + k - 4, yy + 2, x + w / 2 + k, yy - 8, x + w / 2 + k + 4, yy + 2); }
    if (it.mark) {
      const kx = x + w / 2 - 40, ky = cy;
      g.fillStyle = '#f2ece0'; g.fillRect(kx, ky - 22, 80, 22); tri(g, kx + 26, ky - 22, kx + 40, ky - 31, kx + 54, ky - 22);
      g.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 8; i++) g.fillRect(kx + 5 + i * 10, ky - 18, 2, 18);
    }
  },
  // Macau: neon towers, the Grand Lisboa's golden lotus once.
  neon(g, th, x, w, h, cy, it, now) {
    if (it.mark) {
      const tx = x + w / 2, hh = cy * 0.62;
      g.fillStyle = '#c99a2e'; g.beginPath(); g.moveTo(tx - 9, cy); g.lineTo(tx - 7, cy - hh * 0.6); g.quadraticCurveTo(tx - 26, cy - hh * 0.85, tx - 16, cy - hh); g.lineTo(tx, cy - hh * 0.9); g.lineTo(tx + 16, cy - hh); g.quadraticCurveTo(tx + 26, cy - hh * 0.85, tx + 7, cy - hh * 0.6); g.lineTo(tx + 9, cy); g.fill();
      g.fillStyle = '#ffe28a'; for (let yy = cy - hh * 0.55; yy < cy - 6; yy += 7) g.fillRect(tx - 5, yy, 10, 2);
      return;
    }
    g.fillStyle = th.a; g.fillRect(x, cy - h, w, h + 2);
    const cols = ['#ff5ab0', '#45e0ff', '#ffe066'], c = cols[it.v % 3];
    g.fillStyle = c; g.globalAlpha *= 0.75;
    for (let wy = cy - h + 6; wy < cy - 5; wy += 8) for (let wx = x + 4; wx < x + w - 4; wx += 7) if (((wx * 7 + wy * 13) | 0) % 4 === 0) g.fillRect(wx, wy, 3, 3);
    g.globalAlpha /= 0.75;
    if (it.l > 0.5) {   // a sign on the roof, blinking now and then
      const on = (Math.floor(now * 1.5 + it.v) % 5) !== 0;
      g.fillStyle = on ? c : 'rgba(255,255,255,.15)'; g.fillRect(x + w * 0.15, cy - h - 7, w * 0.7, 5);
    }
  },
  // Atlantic City: the boardwalk's casinos, the Ferris wheel of the pier once, turning.
  pier(g, th, x, w, h, cy, it, now) {
    if (it.mark) {
      const r = cy * 0.16, wx = x + w / 2, wy = cy - r - 4, a0 = now * 0.25;
      g.fillStyle = '#3a3050'; g.fillRect(x - 40, cy - 3, w + 80, 3);
      g.strokeStyle = th.b; g.lineWidth = 1.2; g.beginPath(); g.arc(wx, wy, r, 0, 7); g.stroke();
      for (let i = 0; i < 8; i++) { const a = a0 + i * Math.PI / 4; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a) * r, wy + Math.sin(a) * r); g.stroke(); g.fillStyle = i % 2 ? '#ffe066' : th.b; g.fillRect(wx + Math.cos(a) * r - 2, wy + Math.sin(a) * r - 2, 4, 4); }
      g.fillStyle = th.a; tri(g, wx - r * 0.5, cy - 3, wx, wy, wx + r * 0.5, cy - 3);
      return;
    }
    g.fillStyle = th.a; g.fillRect(x, cy - h, w, h + 2);
    g.fillStyle = th.b; g.globalAlpha *= 0.6;
    for (let wy = cy - h + 5; wy < cy - 4; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 6) if (((wx * 5 + wy * 11) | 0) % 3 === 0) g.fillRect(wx, wy, 2, 3);
    g.globalAlpha /= 0.6;
  },
  // Miami Beach: low art deco hotels in sugared-almond colours, with palms between.
  deco(g, th, x, w, h, cy, it) {
    const cols = ['#f4a6b8', '#9fe0cf', '#f6e08a', '#bfe0f4'], c = cols[it.v % 4];
    g.fillStyle = c; box(g, x, cy - h, w, h + 1, 3); g.fillRect(x + w * 0.3, cy - h - h * 0.25, w * 0.4, h * 0.3);
    g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(x, cy - h * 0.62, w, 2); g.fillRect(x, cy - h * 0.32, w, 2);
    g.fillStyle = '#2a5a3a'; const px = x + w + 18;
    g.fillRect(px - 1, cy - h * 1.2, 2, h * 1.2);
    for (let k = 0; k < 5; k++) { const a = Math.PI + 0.3 + k * 0.6; tri(g, px, cy - h * 1.2, px + Math.cos(a) * 12, cy - h * 1.2 + Math.sin(a) * 6 + 4, px + Math.cos(a) * 10, cy - h * 1.2 + Math.sin(a) * 6 + 7); }
  },
  // Biarritz: rocks out in the ocean, the lighthouse on its headland once.
  lighthouse(g, th, x, w, h, cy, it) {
    g.fillStyle = '#3a3f4a'; g.beginPath(); g.ellipse(x + w / 2, cy, w / 2, h + 4, 0, Math.PI, 0); g.fill();
    if (it.mark) {
      const lx = x + w / 2, lh = cy * 0.2;
      g.fillStyle = '#4a5040'; g.beginPath(); g.ellipse(lx, cy, w * 1.4, h + 14, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#f4f2ec'; g.beginPath(); g.moveTo(lx - 6, cy - h - 12); g.lineTo(lx - 4, cy - h - 12 - lh); g.lineTo(lx + 4, cy - h - 12 - lh); g.lineTo(lx + 6, cy - h - 12); g.fill();
      g.fillStyle = '#2b3038'; g.fillRect(lx - 5, cy - h - 18 - lh, 10, 6); g.fillStyle = '#ffe9a0'; g.fillRect(lx - 3, cy - h - 17 - lh, 6, 4);
    }
  },
  // Sanremo: the hills over the sea, its pastel houses stacked up them.
  rivtown(g, th, x, w, h, cy, it) {
    g.fillStyle = th.a; g.beginPath(); g.ellipse(x + w / 2, cy, w * 0.62, h * 1.4, 0, Math.PI, 0); g.fill();
    const cols = ['#f2c48a', '#e89a8a', '#f4e2a8', '#f2ece0'];
    for (let i = 0; i < 14; i++) {
      const fx = ((it.v >> i) & 7) / 7, hx = x + w * (0.2 + 0.6 * ((i * 0.37 + fx * 0.3) % 1)), top = cy - h * 1.4 * Math.sqrt(Math.max(0, 1 - ((hx - x - w / 2) / (w * 0.62)) ** 2));
      const hy = top + 4 + ((i * 5) % 9) * (cy - top - 8) / 14;
      g.fillStyle = cols[(i + it.v) % 4]; g.fillRect(hx - 3, hy - 4, 6, 5);
    }
    if (it.mark) { const dx = x + w / 2, dy = cy - h * 1.4; g.fillStyle = '#e8d6b0'; g.fillRect(dx - 5, dy, 10, 8); g.beginPath(); g.arc(dx, dy, 5, Math.PI, 0); g.fill(); }
  },
  // Deauville: half-timbered villas facing the Channel, under its clouds.
  normandy(g, th, x, w, h, cy) {
    g.fillStyle = '#f2ece0'; g.fillRect(x, cy - h, w, h + 1);
    g.fillStyle = '#5a3e2c'; tri(g, x - 3, cy - h, x + w / 2, cy - h - h * 0.8, x + w + 3, cy - h);
    g.fillRect(x, cy - h, w, 2); g.fillRect(x, cy - h * 0.5, w, 2);
    for (let i = 0; i <= 3; i++) g.fillRect(x + (w - 2) * i / 3, cy - h, 2, h);
  },
};

// ── Roadside props ──────────────────────────────────────────────────
/** The new `side` kinds (a scene's roadside things). */
export const PROPS = new Set(['route66', 'miami', 'lavender', 'snowpine', 'neon']);

/**
 * A roadside thing of a new kind at (X, y) (its foot), u = its scale (100 world units), vv its variant,
 * side -1 left / 1 right. `fallback(kind)` draws an older kind in its place.
 */
export function drawProp(g, kind, X, y, u, vv, side, fallback) {
  if (kind === 'route66') {
    if (vv % 3 === 2) { fallback('cactus'); return; }
    if (vv % 3 === 1) {   // a telephone pole
      const h = u * 15; g.fillStyle = '#5a3e28'; g.fillRect(X - u * 0.35, y - h, u * 0.7, h); g.fillRect(X - u * 3, y - h * 0.9, u * 6, u * 0.5);
      return;
    }
    // The Route 66 shield on its post.
    const h = u * 7, s = u * 4.2;
    g.fillStyle = '#6b6b6b'; g.fillRect(X - u * 0.25, y - h, u * 0.5, h);
    g.fillStyle = '#f4eedf'; g.strokeStyle = '#141414'; g.lineWidth = Math.max(1, u * 0.3);
    g.beginPath(); g.moveTo(X - s / 2, y - h - s * 0.9); g.lineTo(X + s / 2, y - h - s * 0.9); g.lineTo(X + s / 2, y - h - s * 0.45); g.quadraticCurveTo(X + s / 2, y - h, X, y - h + s * 0.05); g.quadraticCurveTo(X - s / 2, y - h, X - s / 2, y - h - s * 0.45); g.closePath(); g.fill(); g.stroke();
    if (s > 9) { g.fillStyle = '#141414'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 ' + Math.round(s * 0.42) + 'px Inter, system-ui, sans-serif'; g.fillText('66', X, y - h - s * 0.45); }
  } else if (kind === 'miami') {
    if (vv % 2) { fallback('palm'); return; }
    // A lifeguard tower: a pastel hut on stilts, its ramp.
    const h = u * 4, w = u * 5, cols = ['#f4a6b8', '#9fe0cf', '#f6e08a'];
    g.fillStyle = '#e9e4d6'; for (const fx of [-0.4, 0.4]) g.fillRect(X + w * fx - u * 0.2, y - h, u * 0.4, h);
    g.fillStyle = cols[vv % 3]; box(g, X - w / 2, y - h - u * 3.4, w, u * 3.4, u * 0.6);
    g.fillStyle = '#c2303a'; g.fillRect(X - w / 2, y - h - u * 3.8, w, u * 0.6);
    g.fillStyle = 'rgba(20,30,40,.55)'; g.fillRect(X - w * 0.3, y - h - u * 2.6, w * 0.6, u * 1.2);
  } else if (kind === 'lavender') {
    if (vv % 4 === 3) { fallback('cypress'); return; }
    // A row of lavender tufts.
    for (let i = -2; i <= 2; i++) {
      const bx = X + i * u * 2.6;
      g.fillStyle = '#4e6b3a'; g.beginPath(); g.ellipse(bx, y - u * 0.6, u * 1.3, u * 0.7, 0, 0, 7); g.fill();
      g.fillStyle = i % 2 ? '#8a6cc8' : '#7c5cbc'; g.beginPath(); g.ellipse(bx, y - u * 1.5, u * 1.15, u * 0.9, 0, 0, 7); g.fill();
    }
  } else if (kind === 'snowpine') {
    if (vv % 3 === 2) {   // a snow pole: the red and white marker of a mountain road
      const h = u * 8; g.fillStyle = '#f4eedf'; g.fillRect(X - u * 0.3, y - h, u * 0.6, h);
      g.fillStyle = '#c2303a'; for (let i = 0; i < 4; i++) g.fillRect(X - u * 0.3, y - h + i * h / 4, u * 0.6, h / 8);
      return;
    }
    const h = u * 14, w = u * 6;
    g.fillStyle = '#4a3424'; g.fillRect(X - u * 0.5, y - h * 0.2, u, h * 0.2);
    for (let k = 0; k < 3; k++) {
      const ty = y - h * (0.2 + k * 0.25), ww = w * (1 - k * 0.25);
      g.fillStyle = vv % 2 ? '#1f4a2e' : '#245636'; tri(g, X - ww / 2, ty, X, ty - h * 0.42, X + ww / 2, ty);
      g.fillStyle = '#f4f7fa'; tri(g, X - ww * 0.22, ty - h * 0.24, X, ty - h * 0.42, X + ww * 0.22, ty - h * 0.24);
    }
  } else if (kind === 'neon') {
    if (vv % 2) { fallback('lamp'); return; }
    // A neon sign on its pole, glowing.
    const h = u * 9, w = u * 6, cols = ['#ff5ab0', '#45e0ff', '#ffe066'], c = cols[vv % 3];
    g.fillStyle = '#14161c'; g.fillRect(X - u * 0.3, y - h, u * 0.6, h);
    const gr = Math.min(w, 60), gl = g.createRadialGradient(X, y - h - u * 1.6, 0, X, y - h - u * 1.6, gr);
    gl.addColorStop(0, c + '66'); gl.addColorStop(1, c + '00'); g.fillStyle = gl; g.fillRect(X - gr, y - h - u * 1.6 - gr, gr * 2, gr * 2);
    g.fillStyle = '#1b1430'; box(g, X - w / 2, y - h - u * 3.2, w, u * 3.2, u * 0.5);
    g.strokeStyle = c; g.lineWidth = Math.max(1, u * 0.35); g.strokeRect(X - w / 2 + u * 0.5, y - h - u * 2.7, w - u, u * 2.2);
  }
}

// ── Falling snow ────────────────────────────────────────────────────
/**
 * Snow over the screen (St. Moritz heavy, the Stelvio light): `amount` 0 … 1, `drift` the sideways pull of the
 * road's bends, `now` in seconds. Flakes on fixed paths (no state), so nothing to reset.
 */
export function snowfall(g, W, H, amount, drift, now) {
  if (amount <= 0.01) return;
  const n = Math.round(90 * amount);
  g.fillStyle = 'rgba(255,255,255,.85)';
  for (let i = 0; i < n; i++) {
    const sp = 0.35 + ((i * 37) % 23) / 23 * 0.65, size = 1 + ((i * 13) % 5) / 2.2;
    const y = ((i * 97.3 + now * 90 * sp) % (H + 20)) - 10;
    const x = (((i * 211.7 + Math.sin(now * 0.8 + i) * 14 + drift * sp * 40 + now * 12) % (W + 20)) + W + 20) % (W + 20) - 10;
    g.globalAlpha = 0.5 + 0.5 * sp;
    g.beginPath(); g.arc(x, y, size * sp, 0, 7); g.fill();
  }
  g.globalAlpha = 1;
}
