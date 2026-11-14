// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Ace Runner's scenery (web.39, narmod 2026-11-14): a venue for every
// VENUE_EVERY blind levels and the day going by.
//   Venues  1-10 the local club · 11-20 Las Vegas · 21-30 the cruise ·
//           31-40 Monte-Carlo · 41-50 Macao · 51+ the final table
//           (VENUES; venueOf(level)); the new one fades in.
//   Day     the sky turns from dawn to day, dusk and night (skyAt(p), p the
//           time of day in [0, 1), DAY_S seconds a day); stars, the sun and
//           the moon; windows, neon and lamps light up at night.
// Everything here is drawn behind the felt (the runner's ground), with the
// parallax of `scroll`; no image, canvas paths only. « Reduce animations »:
// no stars twinkling, no sweeping spotlights.
// Easy on the eyes (web.42, narmod: « too hard on the eyes, the windows »):
// soft, muted colours; far things fade into the haze of the sky; no tall
// bright stripes or dense grids of lit windows going by; a light veil over
// the whole scenery so the Ace and the obstacles stand out.
// ═══════════════════════════════════════════════════════════════════

export const VENUE_EVERY = 10;
export const DAY_S = 150;            // seconds of running for a whole day
export const DAY_START = 0.3;        // a run starts in the morning
export const VENUES = ['arVenue1', 'arVenue2', 'arVenue3', 'arVenue4', 'arVenue5', 'arVenue6'];
/** The venue (index) for a blind level. */
export const venueOf = (level) => Math.min(VENUES.length - 1, Math.floor((Math.max(1, level) - 1) / VENUE_EVERY));

// The sky through the day: [p, top, bottom, light 0 night … 1 day].
const SKY = [
  [0.00, '#141b33', '#262e4a', 0],
  [0.18, '#141b33', '#262e4a', 0],
  [0.24, '#4a4a70', '#c99a7c', 0.45],
  [0.32, '#7ca2bf', '#c9d9e0', 1],
  [0.66, '#7ca2bf', '#c9d9e0', 1],
  [0.74, '#554a74', '#c98e78', 0.45],
  [0.82, '#141b33', '#262e4a', 0],
  [1.00, '#141b33', '#262e4a', 0],
];
/** [r, g, b] of '#rrggbb' or 'rgb(r,g,b)'. */
const hex = (h) => (h[0] === '#' ? [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] : h.slice(4, -1).split(',').map(Number));
const mix = (a, b, f) => { const x = hex(a), y = hex(b); return 'rgb(' + x.map((v, i) => Math.round(v + (y[i] - v) * f)).join(',') + ')'; };
/** The sky at time of day p: { top, bottom, light } (light 0 at night, 1 by day). */
export function skyAt(p) {
  const q = ((p % 1) + 1) % 1;
  let i = 0;
  while (i < SKY.length - 2 && SKY[i + 1][0] <= q) i++;
  const a = SKY[i], b = SKY[i + 1], f = (q - a[0]) / Math.max(1e-6, b[0] - a[0]);
  return { top: mix(a[1], b[1], f), bottom: mix(a[2], b[2], f), light: a[3] + (b[3] - a[3]) * f };
}
/** The time of day after `t` seconds of running. */
export const dayAt = (t) => (DAY_START + t / DAY_S) % 1;

// A fixed pseudo-random value per index (the skylines don't flicker).
const rnd = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const STARS = Array.from({ length: 70 }, (_, i) => ({ x: rnd(i, 2) * 1600, y: rnd(i, 3), r: 0.6 + rnd(i, 4) * 1.2, tw: rnd(i, 5) * 6 }));

/** The sky, its stars, the sun or the moon. */
function sky(g, w, gy, p, sc, now, reduced) {
  const s = skyAt(p);
  const gr = g.createLinearGradient(0, 0, 0, gy); gr.addColorStop(0, s.top); gr.addColorStop(1, s.bottom);
  g.fillStyle = gr; g.fillRect(0, 0, w, gy);
  const night = 1 - s.light;
  if (night > 0.05) {
    for (const st of STARS) {
      const x = (((st.x - sc * 0.02) % 1600) + 1600) % 1600 - 100;
      if (x > w) continue;
      const tw = reduced ? 1 : 0.6 + 0.4 * Math.sin(now * 2 + st.tw);
      g.globalAlpha = night * tw * 0.6; g.fillStyle = '#e8ecf8'; g.fillRect(x, st.y * gy * 0.7, st.r, st.r);
    }
    g.globalAlpha = 1;
  }
  // The sun by day, the moon by night, on an arc across the sky.
  const sunUp = p > 0.2 && p < 0.8, f = sunUp ? (p - 0.2) / 0.6 : ((p + 0.2) % 1) / 0.4;
  const x = w * (0.1 + 0.8 * Math.min(1, Math.max(0, f))), y = gy * (0.75 - 0.6 * Math.sin(Math.PI * Math.min(1, Math.max(0, f))));
  const halo = g.createRadialGradient(x, y, 0, x, y, sunUp ? 56 : 36);
  halo.addColorStop(0, sunUp ? 'rgba(255,236,190,.35)' : 'rgba(220,230,255,.22)'); halo.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = halo; g.fillRect(x - 60, y - 60, 120, 120);
  g.fillStyle = sunUp ? '#f6e6bd' : '#d9dff0'; g.beginPath(); g.arc(x, y, sunUp ? 14 : 10, 0, Math.PI * 2); g.fill();
  if (!sunUp) { g.fillStyle = s.top; g.beginPath(); g.arc(x + 5, y - 3, 10, 0, Math.PI * 2); g.fill(); }
  return s;
}
const shade = (light, day, night) => mix(night, day, light);
/** A colour faded into the haze of the sky (k 0 … 1): the farther, the softer. */
const haze = (c, s, k) => mix(c, s.bottom, k);

// ── The venues ─────────────────────────────────────────────────────
/** 1. The local club: a wood-panelled room, a few small windows with
 *  curtains (the sky, tinted, through the glass), wall lamps, tables. */
function club(g, w, gy, sc, s, C, seq) {
  const lit = 1 - s.light;
  const wall = shade(s.light, '#6a5444', '#2a2019'), panel = shade(s.light, '#574436', '#221a14');
  g.fillStyle = wall; g.fillRect(0, 0, w, gy);
  // Wainscoting along the bottom, a thin rail above it.
  g.fillStyle = panel; g.fillRect(0, gy - 66, w, 66);
  g.fillStyle = 'rgba(216,178,90,.18)'; g.fillRect(0, gy - 68, w, 2);
  const span = 300, off = sc * 0.1, i0 = Math.floor(off / span);
  for (let k = -1; k < Math.ceil(w / span) + 2; k++) {
    const x = (i0 + k) * span - off;
    // A small arched window: the sky through tinted glass, a cross of muntins.
    const wx = x + 60, wy = 34, ww = 64, wh = Math.min(96, gy - 140);
    if (wh > 30) {
      g.save(); g.beginPath(); g.moveTo(wx, wy + ww / 2); g.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); g.lineTo(wx + ww, wy + wh); g.lineTo(wx, wy + wh); g.closePath();
      const gl = g.createLinearGradient(0, wy, 0, wy + wh); gl.addColorStop(0, mix(s.top, wall, 0.35)); gl.addColorStop(1, mix(s.bottom, wall, 0.35));
      g.fillStyle = gl; g.fill();
      g.strokeStyle = shade(s.light, '#8a7058', '#3a2d22'); g.lineWidth = 4; g.stroke();
      g.lineWidth = 2; g.beginPath(); g.moveTo(wx + ww / 2, wy + 2); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh * 0.55); g.lineTo(wx + ww, wy + wh * 0.55); g.stroke();
      g.restore();
      // Curtains on both sides.
      g.fillStyle = shade(s.light, '#7a4a42', '#2e1a18');
      for (const cx of [wx - 12, wx + ww - 4]) { g.beginPath(); g.moveTo(cx, wy - 6); g.lineTo(cx + 16, wy - 6); g.quadraticCurveTo(cx + 10, wy + wh * 0.5, cx + 14, wy + wh + 6); g.lineTo(cx - 2, wy + wh + 6); g.quadraticCurveTo(cx + 4, wy + wh * 0.5, cx, wy - 6); g.fill(); }
    }
    // A wall lamp between the windows: a soft warm glow, more at night.
    const lx = x + 230, ly = 70;
    const gl2 = g.createRadialGradient(lx, ly, 0, lx, ly, 46); gl2.addColorStop(0, 'rgba(255,205,140,' + (0.12 + 0.28 * lit) + ')'); gl2.addColorStop(1, 'rgba(255,205,140,0)');
    g.fillStyle = gl2; g.fillRect(lx - 46, ly - 46, 92, 92);
    g.fillStyle = shade(s.light, '#c9a46a', '#8a6a3a'); g.fillRect(lx - 1, ly + 4, 2, 10); g.beginPath(); g.moveTo(lx - 7, ly + 4); g.lineTo(lx + 7, ly + 4); g.lineTo(lx + 4, ly - 5); g.lineTo(lx - 4, ly - 5); g.closePath(); g.fill();
  }
  tables(g, w, gy, sc, s, C, seq);
}
/** The club's furniture going by, one piece every `span` px, in this order
 *  (web.43, narmod's pick): a table with its players, the bar, the pool
 *  table, slot machines, the jukebox, a lounge corner, the darts. The final
 *  table keeps its plain card tables. */
export const CLUB_PROPS = ['players', 'bar', 'billiard', 'slots', 'jukebox', 'lounge', 'darts'];
function tables(g, w, gy, sc, s, C, seq) {
  const list = seq && seq.length ? seq : CLUB_PROPS;
  const span = 330, off2 = sc * 0.3, i0 = Math.floor(off2 / span);
  for (let k = -1; k < Math.ceil(w / span) + 2; k++) {
    const i = i0 + k, x = i * span - off2, kind = list[((i % list.length) + list.length) % list.length];
    (PROPS[kind] || PROPS.table)(g, x + 120, gy, s, C, i);
  }
}
/** A hanging lamp's warm pool of light (more at night). */
function lampGlow(g, cx, y, s, C, r = 120) {
  const a = 0.12 + 0.22 * (1 - s.light);
  const lamp = g.createRadialGradient(cx, y - 40, 0, cx, y - 10, r);
  lamp.addColorStop(0, 'rgba(' + C.lamp + ',' + a + ')'); lamp.addColorStop(1, 'rgba(' + C.lamp + ',0)');
  g.fillStyle = lamp; g.fillRect(cx - r - 10, y - r, 2 * r + 20, r + 50);
}
function hangLamp(g, cx, ty, C, wide) {
  g.strokeStyle = 'rgba(216,178,90,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, ty - 130); g.lineTo(cx, ty - 62); g.stroke();
  const h = wide ? 30 : 18;
  g.fillStyle = C.shade; g.beginPath(); g.moveTo(cx - h, ty - 50); g.lineTo(cx + h, ty - 50); g.lineTo(cx + h / 2, ty - 63); g.lineTo(cx - h / 2, ty - 63); g.closePath(); g.fill();
}
const PROPS = {
  /** A round card table under its lamp (web.39). */
  table(g, cx, gy, s, C) {
    const ty = gy - 46;
    lampGlow(g, cx, ty, s, C);
    g.fillStyle = C.rim; g.beginPath(); g.ellipse(cx, ty + 4, 96, 20, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = C.farFelt; g.beginPath(); g.ellipse(cx, ty, 86, 15, 0, 0, Math.PI * 2); g.fill();
    hangLamp(g, cx, ty, C);
  },
  /** The same table with players seated round it, chips and cards. */
  players(g, cx, gy, s, C, i) {
    const ty = gy - 46, body = shade(s.light, '#3e3530', '#15110f');
    lampGlow(g, cx, ty, s, C);
    // The players behind the table: heads and shoulders.
    for (const [dx, hy] of [[-62, 0], [-22, -4], [22, -3], [62, 1]]) {
      if (rnd(i * 4 + dx, 31) < 0.2) continue;   // an empty seat now and then
      g.fillStyle = body; g.beginPath(); g.ellipse(cx + dx, ty - 12 + hy, 15, 14, 0, Math.PI, 0); g.fill(); g.fillRect(cx + dx - 15, ty - 12 + hy, 30, 12);
      g.beginPath(); g.arc(cx + dx, ty - 32 + hy, 8, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = C.rim; g.beginPath(); g.ellipse(cx, ty + 4, 96, 20, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = C.farFelt; g.beginPath(); g.ellipse(cx, ty, 86, 15, 0, 0, Math.PI * 2); g.fill();
    // Chips and two cards on the felt.
    const chips = ['#b8463c', '#3d6aa8', '#d9cfb8', '#3c3c3c'];
    for (let k = 0; k < 4; k++) { const x = cx - 50 + k * 30 + (k > 1 ? 20 : 0), n = 2 + Math.floor(rnd(i + k, 33) * 3); g.fillStyle = chips[k]; for (let h = 0; h < n; h++) { g.beginPath(); g.ellipse(x, ty + 2 - h * 2.2, 5, 2, 0, 0, Math.PI * 2); g.fill(); } }
    g.fillStyle = 'rgba(240,236,226,.85)'; g.fillRect(cx - 9, ty - 4, 7, 9); g.fillRect(cx + 1, ty - 4, 7, 9);
    hangLamp(g, cx, ty, C);
  },
  /** The bar: a counter, stools, a shelf of bottles on the wall. */
  bar(g, cx, gy, s, C, i) {
    const lit = 1 - s.light, wood = shade(s.light, '#7a5440', '#2e1f17'), top = shade(s.light, '#9a7458', '#3e2c20');
    // Shelf with bottles, a soft strip of light under it.
    const sy = gy - 132;
    const strip = g.createLinearGradient(0, sy, 0, sy + 40); strip.addColorStop(0, 'rgba(255,205,140,' + (0.1 + 0.25 * lit) + ')'); strip.addColorStop(1, 'rgba(255,205,140,0)');
    g.fillStyle = strip; g.fillRect(cx - 100, sy, 200, 40);
    g.fillStyle = top; g.fillRect(cx - 100, sy - 3, 200, 4);
    const glass = ['#5d7a5a', '#7a5a3a', '#8a7a4a', '#4a5f78', '#6e4a4a'];
    for (let k = 0; k < 11; k++) {
      const bx = cx - 92 + k * 17, bh = 16 + rnd(i * 11 + k, 41) * 10;
      g.fillStyle = shade(s.light, glass[k % glass.length], '#1e1a18');
      g.fillRect(bx, sy - 3 - bh, 9, bh); g.fillRect(bx + 3, sy - 3 - bh - 6, 3, 6);
    }
    // The counter and its top.
    g.fillStyle = wood; g.fillRect(cx - 110, gy - 46, 220, 46);
    g.fillStyle = top; g.fillRect(cx - 116, gy - 50, 232, 6);
    g.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 1; k < 5; k++) g.fillRect(cx - 110 + k * 44, gy - 42, 2, 38);
    g.fillStyle = 'rgba(216,178,90,.45)'; g.fillRect(cx - 110, gy - 10, 220, 2);
    // Stools in front.
    g.fillStyle = shade(s.light, '#3a2e26', '#120e0b');
    for (const dx of [-70, 0, 70]) { g.fillRect(cx + dx - 1.5, gy - 30, 3, 30); g.beginPath(); g.ellipse(cx + dx, gy - 31, 11, 4, 0, 0, Math.PI * 2); g.fill(); }
  },
  /** A pool table under a long lamp. */
  billiard(g, cx, gy, s, C, i) {
    const ty = gy - 44;
    lampGlow(g, cx, ty, s, C, 140);
    g.fillStyle = C.rim; g.beginPath(); g.moveTo(cx - 98, ty + 14); g.lineTo(cx + 98, ty + 14); g.lineTo(cx + 84, ty - 12); g.lineTo(cx - 84, ty - 12); g.closePath(); g.fill();
    g.fillStyle = C.farFelt; g.beginPath(); g.moveTo(cx - 88, ty + 9); g.lineTo(cx + 88, ty + 9); g.lineTo(cx + 77, ty - 8); g.lineTo(cx - 77, ty - 8); g.closePath(); g.fill();
    g.fillStyle = C.rim; g.fillRect(cx - 90, ty + 14, 8, 30); g.fillRect(cx + 82, ty + 14, 8, 30);
    const balls = ['#e8e2d2', '#c9a032', '#3d5f9a', '#a84038', '#5a3a6e', '#c46a2e', '#2f6a44', '#7a2a2a', '#222'];
    for (let k = 0; k < 7; k++) { g.fillStyle = balls[(k + i) % balls.length]; g.beginPath(); g.arc(cx - 50 + rnd(i * 7 + k, 51) * 100, ty - 4 + rnd(i * 7 + k, 52) * 10, 2.6, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = 'rgba(216,178,90,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 50, ty - 130); g.lineTo(cx - 50, ty - 66); g.moveTo(cx + 50, ty - 130); g.lineTo(cx + 50, ty - 66); g.stroke();
    g.fillStyle = C.shade; rrect(g, cx - 66, ty - 68, 132, 10); g.fill();
  },
  /** A row of slot machines, their screens softly lit. */
  slots(g, cx, gy, s, C, i) {
    const lit = 1 - s.light;
    for (let k = -1; k <= 1; k++) {
      const x = cx + k * 52, top = gy - 104;
      g.fillStyle = shade(s.light, '#6a5a6e', '#221c26'); rrect(g, x - 21, top, 42, 104); g.fill();
      const sc2 = g.createLinearGradient(0, top + 26, 0, top + 52); sc2.addColorStop(0, 'rgba(255,236,190,' + (0.35 + 0.35 * lit) + ')'); sc2.addColorStop(1, 'rgba(240,200,140,' + (0.25 + 0.3 * lit) + ')');
      g.fillStyle = sc2; g.fillRect(x - 15, top + 26, 30, 24);
      g.fillStyle = 'rgba(90,60,40,.75)'; for (let r = 0; r < 3; r++) g.fillRect(x - 12 + r * 9, top + 31, 6, 14);
      g.fillStyle = 'rgba(' + (k ? '220,120,140' : '120,190,220') + ',' + (0.25 + 0.35 * lit) + ')'; g.fillRect(x - 15, top + 8, 30, 10);
      g.fillStyle = shade(s.light, '#4a3e4e', '#16121a'); g.fillRect(x - 21, top + 62, 42, 6);
      g.strokeStyle = shade(s.light, '#8a8a8a', '#3a3a3a'); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 21, top + 46); g.lineTo(x + 27, top + 46); g.lineTo(x + 27, top + 28); g.stroke();
      g.fillStyle = '#a84038'; g.beginPath(); g.arc(x + 27, top + 26, 3, 0, Math.PI * 2); g.fill();
    }
    void i;
  },
  /** A jukebox, its arch glowing. */
  jukebox(g, cx, gy, s, C, i) {
    const lit = 1 - s.light, x = cx, top = gy - 100;
    const halo = g.createRadialGradient(x, top + 40, 0, x, top + 40, 80); halo.addColorStop(0, 'rgba(240,170,110,' + (0.06 + 0.16 * lit) + ')'); halo.addColorStop(1, 'rgba(240,170,110,0)');
    g.fillStyle = halo; g.fillRect(x - 80, top - 40, 160, 160);
    g.fillStyle = shade(s.light, '#6a4a38', '#241914'); g.beginPath(); g.moveTo(x - 30, gy); g.lineTo(x - 30, top + 30); g.arc(x, top + 30, 30, Math.PI, 0); g.lineTo(x + 30, gy); g.closePath(); g.fill();
    const arc = ['#c46a5a', '#d9a75a', '#7aa07a', '#6a8ab0'];
    arc.forEach((c, k) => { g.strokeStyle = c; g.globalAlpha = 0.45 + 0.35 * lit; g.lineWidth = 3; g.beginPath(); g.arc(x, top + 30, 24 - k * 4, Math.PI, 0); g.stroke(); });
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(30,20,15,.55)'; g.fillRect(x - 20, top + 46, 40, 22);
    g.strokeStyle = 'rgba(216,178,90,.35)'; g.lineWidth = 1; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x - 18, top + 76 + k * 5); g.lineTo(x + 18, top + 76 + k * 5); g.stroke(); }
    void i; void C;
  },
  /** A lounge corner: an armchair, a little table, a floor lamp. */
  lounge(g, cx, gy, s, C, i) {
    const lit = 1 - s.light, leather = shade(s.light, '#7a4a3a', '#2a1812');
    const lx = cx + 60, ly = gy - 110;
    const gl = g.createRadialGradient(lx, ly + 10, 0, lx, ly + 10, 90); gl.addColorStop(0, 'rgba(255,205,140,' + (0.1 + 0.28 * lit) + ')'); gl.addColorStop(1, 'rgba(255,205,140,0)');
    g.fillStyle = gl; g.fillRect(lx - 90, ly - 80, 180, 190);
    g.strokeStyle = shade(s.light, '#5a4a3a', '#1c1610'); g.lineWidth = 2; g.beginPath(); g.moveTo(lx, gy); g.lineTo(lx, ly + 12); g.stroke();
    g.fillStyle = shade(s.light, '#d8c8a8', '#6a5a40'); g.beginPath(); g.moveTo(lx - 14, ly + 12); g.lineTo(lx + 14, ly + 12); g.lineTo(lx + 9, ly - 6); g.lineTo(lx - 9, ly - 6); g.closePath(); g.fill();
    // The armchair: back, seat, arms.
    g.fillStyle = leather; rrect(g, cx - 64, gy - 70, 70, 50); g.fill();
    g.fillRect(cx - 70, gy - 30, 82, 24); rrect(g, cx - 76, gy - 46, 16, 40); g.fill(); rrect(g, cx + 2, gy - 46, 16, 40); g.fill();
    g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(cx - 60, gy - 30, 62, 3);
    // The little round table with a glass.
    g.fillStyle = shade(s.light, '#5a4334', '#1f1712'); g.fillRect(cx + 24, gy - 30, 3, 30); g.beginPath(); g.ellipse(cx + 25, gy - 31, 14, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(200,170,110,.6)'; g.fillRect(cx + 21, gy - 41, 6, 9);
    void i; void C;
  },
  /** A dartboard on the wall and a high table. */
  darts(g, cx, gy, s, C, i) {
    const bx = cx, by = gy - 130;
    g.fillStyle = shade(s.light, '#4a3a2e', '#18120d'); g.beginPath(); g.arc(bx, by, 26, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 20; k++) { g.fillStyle = k % 2 ? shade(s.light, '#d8ccb0', '#4a4436') : shade(s.light, '#2e2a26', '#0e0c0a'); g.beginPath(); g.moveTo(bx, by); g.arc(bx, by, 21, k * Math.PI / 10, (k + 1) * Math.PI / 10); g.closePath(); g.fill(); }
    g.strokeStyle = shade(s.light, '#a8463c', '#4a201c'); g.lineWidth = 3; g.beginPath(); g.arc(bx, by, 13, 0, Math.PI * 2); g.stroke();
    g.fillStyle = shade(s.light, '#3d7a4e', '#183020'); g.beginPath(); g.arc(bx, by, 3, 0, Math.PI * 2); g.fill();
    // A high table and two stools.
    const tx = cx + 10, wood = shade(s.light, '#8a6248', '#3a281c');
    g.fillStyle = wood; g.fillRect(tx - 3, gy - 54, 6, 54); g.fillRect(tx - 14, gy - 3, 28, 3);
    g.beginPath(); g.ellipse(tx, gy - 55, 26, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(200,170,110,.6)'; g.fillRect(tx - 10, gy - 66, 5, 9); g.fillRect(tx + 6, gy - 65, 5, 8);
    g.fillStyle = shade(s.light, '#3a2e26', '#120e0b');
    for (const dx of [-36, 36]) { g.fillRect(tx + dx - 1.5, gy - 36, 3, 36); g.beginPath(); g.ellipse(tx + dx, gy - 37, 10, 3.5, 0, 0, Math.PI * 2); g.fill(); }
    void i; void C;
  },
};
/** Buildings along a skyline: their windows and neon light up at night. */
function skyline(g, w, gy, sc, s, o) {
  const span = o.span, off = sc * o.par, n = Math.ceil(w / span) + 2, i0 = Math.floor(off / span);
  for (let k = -1; k < n; k++) {
    const i = i0 + k, x = i * span - off;
    const bh = o.min + rnd(i, o.seed) * (o.max - o.min), bw = span * (0.6 + rnd(i, o.seed + 1) * 0.35), top = gy - o.base - bh;
    g.fillStyle = haze(shade(s.light, o.day, o.night), s, o.haze || 0); g.fillRect(x, top, bw, bh + o.base);
    if (o.tower && rnd(i, o.seed + 2) < 0.35) { g.fillRect(x + bw / 2 - 2, top - 26, 4, 26); }
    const lit = 1 - s.light;
    if (lit > 0.1) {
      // A few lit windows, dim and warm (not a sparkling grid).
      g.fillStyle = 'rgba(240,200,140,' + 0.4 * lit * (1 - (o.haze || 0)) + ')';
      for (let wy = top + 10; wy < gy - o.base - 8; wy += 14) for (let wx = x + 6; wx < x + bw - 8; wx += 12) if (rnd(wx * 0.37 + wy, i) < 0.22) g.fillRect(wx, wy, 4, 5);
    }
    if (o.neon && rnd(i, o.seed + 3) < 0.5) {
      const c = o.neon[Math.floor(rnd(i, o.seed + 4) * o.neon.length)], a = 0.18 + 0.32 * lit;
      g.strokeStyle = 'rgba(' + c + ',' + a + ')'; g.lineWidth = 1.5;
      g.shadowColor = 'rgba(' + c + ',' + a + ')'; g.shadowBlur = 4 * lit;
      g.strokeRect(x + bw * 0.15, top + 10, bw * 0.7, 12); g.shadowBlur = 0;
    }
  }
}
/** 2. Las Vegas: towers, neon signs. */
function vegas(g, w, gy, sc, s) {
  skyline(g, w, gy, sc, s, { span: 70, par: 0.08, min: 60, max: 150, base: 0, seed: 1, day: '#8a93a6', night: '#1c2236', tower: true, haze: 0.45 });
  skyline(g, w, gy, sc, s, { span: 95, par: 0.22, min: 40, max: 100, base: 0, seed: 7, day: '#6d7384', night: '#151a2a', haze: 0.15, neon: ['230,110,180', '110,200,230', '230,190,110'] });
}
/** 3. The cruise: the sea, an island, the ship's railing. */
function cruise(g, w, gy, sc, s, now, reduced) {
  const hz = gy - 78;
  const sea = g.createLinearGradient(0, hz, 0, gy);
  sea.addColorStop(0, haze(shade(s.light, '#5b8fae', '#16233d'), s, 0.25)); sea.addColorStop(1, shade(s.light, '#40708f', '#101b33'));
  g.fillStyle = sea; g.fillRect(0, hz, w, gy - hz);
  // A far island.
  const ix = w - ((sc * 0.03) % (w + 400)) + 100;
  g.fillStyle = haze(shade(s.light, '#5f8068', '#17241f'), s, 0.4); g.beginPath(); g.moveTo(ix - 140, hz); g.quadraticCurveTo(ix - 60, hz - 34, ix, hz - 22); g.quadraticCurveTo(ix + 60, hz - 40, ix + 150, hz); g.closePath(); g.fill();
  // Waves.
  g.strokeStyle = 'rgba(255,255,255,' + (0.06 + 0.1 * s.light) + ')'; g.lineWidth = 1;
  for (let r = 0; r < 5; r++) {
    const y = hz + 10 + r * 13, o = (sc * (0.1 + r * 0.05) + (reduced ? 0 : now * 10)) % 40;
    for (let x = -o; x < w; x += 40) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 3, x + 20, y); g.stroke(); }
  }
  // The railing of the deck.
  // (soft colours, posts far apart: no stripes flashing past)
  const off = sc * 0.55, span = 90;
  g.fillStyle = shade(s.light, '#a9a59c', '#34343c');
  g.fillRect(0, gy - 40, w, 3); g.fillRect(0, gy - 22, w, 2);
  for (let x = -(off % span); x < w; x += span) g.fillRect(x, gy - 40, 3, 40);
}
/** 4. Monte-Carlo: hills over the sea, houses, palm trees. */
function monaco(g, w, gy, sc, s) {
  const hz = gy - 40;
  g.fillStyle = haze(shade(s.light, '#5b8fae', '#13203a'), s, 0.2); g.fillRect(0, hz, w, 40);
  const hills = (par, base, amp, day, night, seed) => {
    const off = sc * par;
    g.fillStyle = shade(s.light, day, night); g.beginPath(); g.moveTo(0, gy);
    for (let x = 0; x <= w + 20; x += 20) { const u = (x + off) / 160; g.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin(u + seed) * Math.cos(u * 0.37 + seed))); }
    g.lineTo(w, gy); g.closePath(); g.fill();
  };
  hills(0.05, hz - 30, 70, haze('#7a9576', s, 0.3), haze('#18241e', s, 0.3), 1);
  // Houses on the hill: small lit windows at night.
  const lit = 1 - s.light, off = sc * 0.05;
  for (let k = 0; k < 60; k++) {
    const x = ((rnd(k, 9) * 1600 - off) % 1600 + 1600) % 1600 - 100, y = hz - 20 - rnd(k, 10) * 60;
    if (x > w) continue;
    g.fillStyle = s.light > 0.5 ? 'rgba(236,226,206,.7)' : 'rgba(240,200,140,' + (0.2 + 0.35 * lit) + ')'; g.fillRect(x, y, 6, 5);
  }
  hills(0.12, hz + 4, 26, '#5d755c', '#121c16', 4);
  // Palm trees.
  const span = 260, off2 = sc * 0.4;
  for (let x = -(off2 % span); x < w + span; x += span) {
    const px = x + 80, base = gy - 2;
    g.strokeStyle = shade(s.light, '#5a4630', '#151008'); g.lineWidth = 5; g.beginPath(); g.moveTo(px, base); g.quadraticCurveTo(px + 10, base - 50, px + 4, base - 92); g.stroke();
    g.strokeStyle = shade(s.light, '#2f6b3a', '#0b1a10'); g.lineWidth = 4;
    for (let a = 0; a < 6; a++) { const an = -Math.PI / 2 + (a - 2.5) * 0.5; g.beginPath(); g.moveTo(px + 4, base - 92); g.quadraticCurveTo(px + 4 + Math.cos(an) * 26, base - 92 + Math.sin(an) * 12 - 8, px + 4 + Math.cos(an) * 44, base - 92 + Math.sin(an) * 20 + 16); g.stroke(); }
  }
}
/** 5. Macao: tall towers, red lanterns. */
function macao(g, w, gy, sc, s) {
  skyline(g, w, gy, sc, s, { span: 80, par: 0.07, min: 80, max: 170, base: 0, seed: 21, day: '#9a908c', night: '#211a1e', tower: true, haze: 0.3, neon: ['230,180,100', '220,110,90'] });
  // A lotus tower, far away.
  const tx = w * 0.7 - ((sc * 0.04) % (w + 300)) + 150;
  g.fillStyle = haze(shade(s.light, '#b39a62', '#3e3424'), s, 0.4);
  g.beginPath(); g.moveTo(tx - 22, gy); g.lineTo(tx - 12, gy - 150); g.quadraticCurveTo(tx, gy - 200, tx + 12, gy - 150); g.lineTo(tx + 22, gy); g.closePath(); g.fill();
  // Strings of red lanterns.
  const span = 220, off = sc * 0.5, lit = 1 - s.light;
  for (let x = -(off % span); x < w + span; x += span) {
    g.strokeStyle = 'rgba(40,20,10,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 34); g.quadraticCurveTo(x + span / 2, 58, x + span, 34); g.stroke();
    for (let k = 1; k < 5; k++) {
      const lx = x + (span * k) / 5, ly = 34 + Math.sin((Math.PI * k) / 5) * 22 + 10;
      if (lit > 0.1) { const gl = g.createRadialGradient(lx, ly, 0, lx, ly, 22); gl.addColorStop(0, 'rgba(255,110,60,' + 0.28 * lit + ')'); gl.addColorStop(1, 'rgba(255,90,40,0)'); g.fillStyle = gl; g.fillRect(lx - 22, ly - 22, 44, 44); }
      g.fillStyle = shade(s.light, '#b0443a', '#7a2c26'); g.beginPath(); g.ellipse(lx, ly, 8, 10, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = shade(s.light, '#c9a24a', '#8a6e34'); g.fillRect(lx - 4, ly - 12, 8, 3); g.fillRect(lx - 4, ly + 9, 8, 3);
    }
  }
}
/** 6. The final table: a dark stage, spotlights, the crowd. */
function finale(g, w, gy, sc, s, now, reduced) {
  const bg = g.createLinearGradient(0, 0, 0, gy); bg.addColorStop(0, '#07070c'); bg.addColorStop(1, '#1a1426');
  g.fillStyle = bg; g.fillRect(0, 0, w, gy);
  // Spotlights sweeping from the ceiling.
  for (let k = 0; k < 4; k++) {
    const x0 = w * (0.15 + 0.23 * k), sw = reduced ? 0 : Math.sin(now * 0.6 + k * 1.7) * 0.35;
    const x1 = x0 + Math.tan(sw) * gy;
    const gr = g.createLinearGradient(x0, 0, x1, gy); gr.addColorStop(0, 'rgba(255,240,200,.16)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - 6, 0); g.lineTo(x0 + 6, 0); g.lineTo(x1 + 60, gy); g.lineTo(x1 - 60, gy); g.closePath(); g.fill();
  }
  // A big screen, the crowd's heads in the stands.
  g.fillStyle = 'rgba(80,120,255,.18)'; rrect(g, w / 2 - 90, 30, 180, 60); g.fill();
  g.strokeStyle = 'rgba(140,170,255,.5)'; g.lineWidth = 1.5; rrect(g, w / 2 - 90, 30, 180, 60); g.stroke();
  const off = sc * 0.25;
  for (let row = 0; row < 3; row++) {
    const y = gy - 70 + row * 18;
    g.fillStyle = ['#1c1824', '#15121c', '#0f0d14'][row];
    for (let x = -((off + row * 13) % 22); x < w; x += 22) { g.beginPath(); g.arc(x, y, 8, Math.PI, 0); g.fill(); g.fillRect(x - 9, y, 18, 18); }
  }
  // Camera flashes now and then.
  if (!reduced) for (let k = 0; k < 3; k++) { const ph = (now * 0.7 + k * 0.37) % 1; if (ph < 0.04) { g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(((k * 331 + Math.floor(now)) * 97) % w, gy - 60 + k * 12, 3, 3); } }
  void s;
}
function rrect(g, x, y, w, h) { const r = 6; g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

/**
 * Draw the venue's scenery (behind the felt): o = { w, gy, scroll, p (time of
 * day), venue, now (s), reduced, C (ink palette) }.
 */
export function drawScenery(g, o) {
  const { w, gy, scroll: sc, p, venue, now, reduced, C } = o;
  if (venue === 5) { finale(g, w, gy, sc, skyAt(0), now, reduced); tables(g, w, gy, sc, { light: 0 }, C, ['table']); }
  else {
    const s = sky(g, w, gy, p, sc, now, reduced);
    if (venue === 0) club(g, w, gy, sc, s, C, o.clubProps);
    else if (venue === 1) vegas(g, w, gy, sc, s);
    else if (venue === 2) cruise(g, w, gy, sc, s, now, reduced);
    else if (venue === 3) monaco(g, w, gy, sc, s);
    else macao(g, w, gy, sc, s);
  }
  // A light veil: the scenery stays behind, the Ace and the obstacles in front.
  g.fillStyle = 'rgba(14,18,28,' + VEIL + ')'; g.fillRect(0, 0, w, gy);
}
export const VEIL = 0.12;
