// PokerTH web client — the Ace's convertible as a small 3D model (Poker Run).
//
// web.62, narmod: « when it drifts it's ugly; I'd rather a car in 3/4, in the
// same style — a real rotation, not just the front appearing ». The body is
// lofted from rounded cross-sections (stations along its length), turned by a
// yaw about its middle, seen from a camera slightly above (pitch), projected
// orthographically and painted far to near with flat shading. At yaw 0 it is
// the same rear view as the hand-drawn car it replaces: the round tail lights,
// the plate, the chrome bumper, the open cockpit with its two seats and the
// windscreen frame.
//
// Drawing is split around the driver: drawCar(ctx, o, 'back') paints what is
// farther than the driver's seat (the far body, the cockpit, the seats, the
// windscreen), drawCar(ctx, o, 'front') what is nearer (rear deck, near side,
// tail). The Ace (a DOM actor) goes between the two canvases; seatPoint()
// gives where his seat is on screen.

const L = 2.0, ZP = 0.9;                 // length (car widths); the pivot of the yaw
const CK = { x: 0.37, z0: 0.5, z1: 1.12 }; // the cockpit opening on the deck
const WHEELS = [[-0.43, 0.3], [0.43, 0.3], [-0.43, 1.6], [0.43, 1.6]], WR = 0.15, WW = 0.16;
// Stations: z, half width, top (centre), fender rise, bottom.
const ST = [
  [0.0, 0.43, 0.34, 0.07, 0.1], [0.03, 0.48, 0.41, 0.07, 0.08], [0.1, 0.5, 0.43, 0.07, 0.07], [0.3, 0.5, 0.44, 0.06, 0.07],
  [0.5, 0.5, 0.44, 0.04, 0.07], [0.8, 0.5, 0.44, 0.03, 0.07], [1.12, 0.5, 0.44, 0.04, 0.07], [1.3, 0.5, 0.43, 0.06, 0.07],
  [1.55, 0.49, 0.4, 0.07, 0.07], [1.78, 0.47, 0.36, 0.06, 0.08], [1.93, 0.43, 0.32, 0.04, 0.1], [2.0, 0.36, 0.28, 0.02, 0.12],
];
export let FLIP = 1; export const setFlip = (f) => { FLIP = f; };
const N = 32;                             // points around a cross-section
const sgn = (v) => (v < 0 ? -1 : 1);

function section(s) {
  const [z, hw, top, fr, bot] = s, yc = (top + bot) / 2, hh = (top - bot) / 2, pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    const x = hw * sgn(c) * Math.pow(Math.abs(c), 2 / 5);
    let y = yc + hh * sgn(sn) * Math.pow(Math.abs(sn), 2 / 4);
    if (sn > 0) y += fr * Math.exp(-Math.pow((Math.abs(x) / hw - 0.7) / 0.2, 2)) * Math.pow(sn, 0.5);
    pts.push([x, y, z]);
  }
  return pts;
}
// The mesh, built once: quads between sections, minus the cockpit opening.
// Twice as many sections as stations (linear in between), for a smoother body.
const STD = []; for (let k = 0; k < ST.length; k++) { STD.push(ST[k]); if (k < ST.length - 1) STD.push(ST[k].map((v, i) => (v + ST[k + 1][i]) / 2)); }
const SECS = STD.map(section), QUADS = [];
for (let k = 0; k < SECS.length - 1; k++) for (let i = 0; i < N; i++) {
  const a = SECS[k][i], b = SECS[k][(i + 1) % N], c = SECS[k + 1][(i + 1) % N], d = SECS[k + 1][i];
  const zm = (a[2] + d[2]) / 2, top = a[1] > 0.3 && b[1] > 0.3 && Math.sin(((i + 0.5) / N) * Math.PI * 2) > 0.2;
  if (top && zm > CK.z0 && zm < CK.z1 && Math.abs(a[0]) < CK.x + 0.02 && Math.abs(b[0]) < CK.x + 0.02) continue;
  QUADS.push([a, b, c, d]);
}
// The rear and front caps (wound to face out).
const REAR = SECS[0].slice().reverse(), NOSE = SECS[SECS.length - 1].slice();
QUADS.push(REAR, NOSE);
const deckY = (x, z) => {   // the deck's height at (x, z), for things laid on it
  let k = 0; while (k < ST.length - 2 && ST[k + 1][0] < z) k++;
  const t = (z - ST[k][0]) / Math.max(1e-6, ST[k + 1][0] - ST[k][0]), tp = ST[k][2] + (ST[k + 1][2] - ST[k][2]) * t;
  return tp + 0.02 * (1 - Math.pow(Math.abs(x) / 0.5, 2));
};

function hexRgb(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); }
const shade = (c, f) => 'rgb(' + c.map((v) => Math.max(0, Math.min(255, Math.round(v * f)))).join(',') + ')';

/** A view: o = { x, y (screen point of the rear's bottom centre at yaw 0), w (car width, px), yaw, pitch }. */
function view(o) {
  const cy = Math.cos(o.yaw), sy = Math.sin(o.yaw), cp = Math.cos(o.pitch), sp = Math.sin(o.pitch);
  const P = (p) => {
    const X = p[0] * cy + (p[2] - ZP) * sy, Z = -p[0] * sy + (p[2] - ZP) * cy + ZP;
    return { x: o.x + X * o.w, y: o.y - (p[1] * cp + Z * sp) * o.w, d: Z * cp - p[1] * sp, X, Y: p[1], Z };
  };
  return { P, cy, sy, cp, sp };
}
const LIGHT = (() => { const l = [-0.35, 0.85, -0.4], n = Math.hypot(...l); return l.map((v) => v / n); })();

/** Screen point of the driver's seat (where the Ace sits) and its depth. */
export function seatPoint(o) { return view(o).P([-0.17, 0.43, 0.66]); }

/** The shared face list of one frame, sorted far to near. */
let memo = null;
function faces(o) {
  // The back and the front halves of one frame share the same faces.
  if (memo && memo.x === o.x && memo.y === o.y && memo.w === o.w && memo.yaw === o.yaw && memo.pitch === o.pitch && memo.color === o.color) return memo.r;
  const r = faces1(o); memo = { x: o.x, y: o.y, w: o.w, yaw: o.yaw, pitch: o.pitch, color: o.color, r };
  return r;
}
function faces1(o) {
  const V = view(o), out = [];
  const col = hexRgb(o.color || '#c2303a');
  for (const q of QUADS) {
    const p = q.map(V.P);
    // Newell's normal, in the turned car's frame (X, Y, Z).
    let nx = 0, ny = 0, nz = 0;
    for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; nx += (a.Y - b.Y) * (a.Z + b.Z); ny += (a.Z - b.Z) * (a.X + b.X); nz += (a.X - b.X) * (a.Y + b.Y); }
    const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    nx *= FLIP; ny *= FLIP; nz *= FLIP;
    // The camera looks along +Z, tilted down by the pitch.
    if (ny * -V.sp + nz * V.cp > 0.02) continue;
    const lit = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
    out.push({ pts: p, rear: q === REAR, seam: q !== REAR && q !== NOSE, d: p.reduce((t, v) => t + v.d, 0) / p.length, fill: shade(col, 0.68 + 0.42 * lit) });
  }
  out.sort((a, b) => b.d - a.d);
  return { V, out };
}
function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.closePath(); }
/** A flat shape on a plane of the car: f maps plane (u, v) to car (x, y, z). */
function onPlane(ctx, V, f, draw) {
  const o = V.P(f(0, 0)), ux = V.P(f(1, 0)), vy = V.P(f(0, 1));
  ctx.save(); ctx.transform(ux.x - o.x, ux.y - o.y, vy.x - o.x, vy.y - o.y, o.x, o.y); draw(); ctx.restore();
}
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }

function wheel(ctx, V, wx, wz, w) {
  // A tyre: the cylinder's outline from its two rims, then the hub if its face shows.
  const side = sgn(wx), rim = (dx) => { const pts = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; pts.push(V.P([wx + dx, WR + Math.sin(a) * WR, wz + Math.cos(a) * WR])); } return pts; };
  const a = rim(-WW / 2), b = rim(WW / 2), all = a.concat(b);
  // Convex hull of the two rims (gift wrapping; 32 points).
  const hull = []; let s = all.reduce((m, p) => (p.x < m.x ? p : m), all[0]), cur = s;
  do { hull.push(cur); let nx = all[0]; for (const p of all) { if (nx === cur || (p.x - cur.x) * (nx.y - cur.y) - (p.y - cur.y) * (nx.x - cur.x) < 0) nx = p; } cur = nx; } while (cur !== s && hull.length < 40);
  ctx.fillStyle = '#0b0e12'; poly(ctx, hull); ctx.fill();
  const outer = side > 0 ? b : a, face = (V.sy * side) > 0.08 ? outer : null;   // the hub shows when the wheel's outside turns to us
  if (face) {
    const c = V.P([wx + side * WW / 2, WR, wz]);
    ctx.fillStyle = '#2a3038'; poly(ctx, face); ctx.fill();
    ctx.save(); ctx.translate(c.x, c.y); ctx.scale(Math.max(0.15, Math.abs(V.sy)), 1);
    ctx.fillStyle = '#9aa2ac'; ctx.beginPath(); ctx.arc(0, 0, WR * w * 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#5c646e'; ctx.beginPath(); ctx.arc(0, 0, WR * w * 0.18, 0, 7); ctx.fill(); ctx.restore();
  }
}

/**
 * Draw the car. part: 'back' (behind the driver), 'front' (in front of him) or 'all'.
 * o: { x, y, w, yaw, pitch, color, boost, seat(ctx, sx) to draw a seat, plate(ctx, x, y, size) }.
 */
export function drawCar(ctx, o, part) {
  const { V, out } = faces(o), seatD = seatPoint(o).d, w = o.w;
  const back = part !== 'front', front = part !== 'back';
  if (back) {
    // Shadow, then the wheels (the body covers their tops).
    const sh = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; sh.push(V.P([Math.cos(a) * 0.6, 0, L / 2 + Math.sin(a) * (L / 2 + 0.08)])); }
    ctx.fillStyle = 'rgba(0,0,0,.38)'; poly(ctx, sh); ctx.fill();
    const ws = WHEELS.map(([x, z]) => ({ x, z, d: V.P([x, WR, z]).d })).sort((a, b) => b.d - a.d);
    for (const wh of ws) wheel(ctx, V, wh.x, wh.z, w);
  }
  ctx.lineJoin = 'round';
  for (const f of out) {
    if ((f.d >= seatD) !== back) continue;
    let fill = f.fill;
    if (f.rear) { const ys = f.pts.map((p) => p.y), y0 = Math.min(...ys), y1 = Math.max(...ys), g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, '#e8505a'); g.addColorStop(0.45, '#c2303a'); g.addColorStop(1, '#861820'); fill = g; }
    // A hairline of the face's own colour closes the seams between faces.
    ctx.fillStyle = fill; ctx.strokeStyle = fill; ctx.lineWidth = 0.6; poly(ctx, f.pts); ctx.fill(); if (f.seam) ctx.stroke();
  }
  if (back) {
    // The cockpit: its dark tub, the two seats, the windscreen.
    const ck = []; for (let i = 0; i <= 12; i++) { const t = i / 12; ck.push([-CK.x + 2 * CK.x * t, CK.z0]); } for (let i = 0; i <= 12; i++) { const t = i / 12; ck.push([CK.x - 2 * CK.x * t, CK.z1]); }
    const tub = ck.map(([x, z]) => V.P([x * (Math.abs(z - CK.z0) < 1e-6 || Math.abs(z - CK.z1) < 1e-6 ? 1 : 1), deckY(x, z), z]));
    ctx.fillStyle = '#24110f'; poly(ctx, tub); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = Math.max(1, w * 0.012); ctx.stroke();
    for (const sx of [0.17, -0.17]) {
      onPlane(ctx, V, (u, v) => [sx + (u - 0.5) * 0.27, deckY(sx, 0.62) - 0.08 + v * 0.36, 0.62 + v * 0.06], () => {
        ctx.fillStyle = '#3a1c1e'; rrect(ctx, 0, 0, 1, 0.7, 0.18); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.08)'; rrect(ctx, 0.1, 0.55, 0.8, 0.08, 0.04); ctx.fill();
        if (sx > 0) { ctx.fillStyle = '#3a1c1e'; rrect(ctx, 0.25, 0.68, 0.5, 0.3, 0.12); ctx.fill(); }
      });
    }
    // The windscreen (web.62, narmod: « a bit too big, rounded corners »): lower
    // and narrower, its top corners rounded, mapped bilinearly onto its slope.
    const HB = 0.31, HT = 0.27, ZB = CK.z1 + 0.04, ZT = CK.z1 - 0.04, YT = 0.7;
    const ws = (u, v) => { const hw = HB + (HT - HB) * v, x = -hw + 2 * hw * u, yb = deckY(x, ZB) - 0.01; return [x, yb + (YT - yb) * v, ZB + (ZT - ZB) * v]; };
    const ru = 0.16, rv = 0.32, outline = [[0, 0]];
    for (let i = 0; i <= 6; i++) { const a = Math.PI - (i / 6) * (Math.PI / 2); outline.push([ru + Math.cos(a) * ru, 1 - rv + Math.sin(a) * rv]); }
    for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 - (i / 6) * (Math.PI / 2); outline.push([1 - ru + Math.cos(a) * ru, 1 - rv + Math.sin(a) * rv]); }
    outline.push([1, 0]);
    const glass = outline.map(([u, v]) => V.P(ws(u, v)));
    ctx.fillStyle = 'rgba(160,200,230,.24)'; poly(ctx, glass); ctx.fill();
    ctx.strokeStyle = '#d7dce2'; ctx.lineWidth = Math.max(1.2, w * 0.022); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(glass[0].x, glass[0].y); for (let i = 1; i < glass.length; i++) ctx.lineTo(glass[i].x, glass[i].y); ctx.stroke(); ctx.lineCap = 'butt';
  }
  if (front) {
    // The tail, on the rear face's plane (z = 0), seen as the face turns.
    if (V.cy > 0.1) onPlane(ctx, V, (u, v) => [u, v, 0], () => {
      ctx.scale(1, -1);
      const lt = (lx) => { const r = 0.075; ctx.fillStyle = '#3a0d10'; ctx.beginPath(); ctx.arc(lx, -0.27, r * 1.18, 0, 7); ctx.fill();
        ctx.fillStyle = o.boost ? '#ffb347' : '#ff3b3f'; ctx.beginPath(); ctx.arc(lx, -0.27, r, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,230,200,.55)'; ctx.beginPath(); ctx.arc(lx - r * 0.3, -0.27 - r * 0.3, r * 0.35, 0, 7); ctx.fill(); };
      lt(-0.31); lt(0.31);
      ctx.fillStyle = '#5e1117'; rrect(ctx, -0.12, -0.28, 0.24, 0.12, 0.05); ctx.fill();
      ctx.fillStyle = '#f4eedf'; rrect(ctx, -0.095, -0.265, 0.19, 0.09, 0.035); ctx.fill();
      if (o.plate) { ctx.save(); ctx.scale(0.01, 0.01); o.plate(ctx, 0, -22, 7.5); ctx.restore(); }   // the plate draws in pixels-like units
      ctx.fillStyle = '#262b32'; rrect(ctx, -0.42, -0.13, 0.84, 0.07, 0.035); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.18)'; rrect(ctx, -0.38, -0.125, 0.76, 0.018, 0.009); ctx.fill();
      for (const ex of [-0.2, 0.2]) { ctx.fillStyle = '#b9c0c8'; ctx.beginPath(); ctx.arc(ex, -0.065, 0.016, 0, 7); ctx.fill(); ctx.fillStyle = '#1a1e24'; ctx.beginPath(); ctx.arc(ex, -0.065, 0.008, 0, 7); ctx.fill(); }
      if (o.boost) for (const ex of [-0.2, 0.2]) {
        const fl = (0.6 + Math.random() * 0.6) * 0.07;
        ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.ellipse(ex, -0.065 + fl * 0.45, 0.016, fl * 0.5, 0, 0, 7); ctx.fill();
      }
    });
  }
}
