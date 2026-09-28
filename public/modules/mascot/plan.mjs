// ═══════════════════════════════════════════════════════════════════
// Mascot — pure planning helpers (no DOM). Unit-tested by
// scripts/test-mascot.mjs; used by modules/mascot/engine.mjs.
//
// The mascot (« the Ace ») is drawn at a base size of BASE_W × BASE_H CSS px
// and scaled by k to the screen. Every position below is the top-left corner
// of that box in viewport px; FEET is the base y of the soles (the floor line).
// ═══════════════════════════════════════════════════════════════════

export const BASE_W = 168;
export const BASE_H = 228;
export const FEET = 212;

/** Scale factor: the Ace is ~15 % of the short side, 70–140 px tall. */
export function mascotScale(vw, vh) {
  const h = Math.max(70, Math.min(140, Math.min(vh * 0.15, vw * 0.22)));
  return h / BASE_H;
}

/**
 * Stage geometry for a viewport.
 * @param {number} vw viewport width  @param {number} vh viewport height
 * @param {number} [insetBottom] safe-area inset at the bottom (px)
 */
export function stageOf(vw, vh, insetBottom = 0) {
  const k = mascotScale(vw, vh);
  const w = BASE_W * k, h = BASE_H * k;
  const floor = vh - insetBottom - Math.round(4 * k);   // feet line
  return {
    vw, vh, k, w, h, floor,
    yF: floor - FEET * k,                                  // box top when standing on the floor
    speed: 190 * k,                                        // walking speed, px/s
    minX: Math.max(4, vw * 0.02), maxX: vw - w - Math.max(4, vw * 0.02),
  };
}

/** Clamp an x (box left) to the visible stage. */
export function clampX(st, x) { return Math.max(st.minX, Math.min(st.maxX, x)); }

/** Box left that puts the Ace's centre on cx. */
export function xAt(st, cx) { return cx - st.w / 2; }

/**
 * Where the Ace can climb, walk and fall off, or null.
 * rect: { left, top, right, bottom } of a panel in viewport px.
 * The panel top must leave room above it for the Ace (under the header), be
 * high enough above the floor to be worth climbing, wide enough to walk on,
 * and one side must be reachable while the other lets him land on screen.
 */
export function climbPlan(st, rect) {
  const { w, h } = st;
  if (!rect) return null;
  const width = rect.right - rect.left;
  if (width < 2.4 * w) return null;
  if (rect.top < 0.85 * h + 8) return null;           // no headroom (his hat may overlap the header)
  if (rect.top > st.floor - 0.9 * h) return null;     // too low to bother
  const yP = rect.top - 210 * st.k;                   // box top standing on the panel
  const plans = [];
  for (const side of ['L', 'R']) {
    const dir = side === 'L' ? 1 : -1;                // walking direction on top
    const xClimb = side === 'L' ? rect.left - 0.8 * w : rect.right - 0.2 * w;
    const xTop = side === 'L' ? rect.left - 0.2 * w : rect.right - 0.8 * w;
    const xEdge = side === 'L' ? rect.right - 0.55 * w : rect.left - 0.45 * w;
    const xLand = xEdge + dir * 0.5 * w;
    if (xClimb < st.minX || xClimb > st.maxX) continue;
    if (xLand < st.minX || xLand > st.maxX) continue;
    if ((xEdge - xTop) * dir < 0.6 * w) continue;
    // Hanging start: hands just above the panel's lower edge, unless it
    // reaches (almost) the floor — then he starts climbing from the floor.
    const yHang = Math.min(st.yF, rect.bottom - 0.6 * h);
    plans.push({ side, dir, xClimb, xTop, xEdge, xLand, yP, yHang, yGrab: rect.top - 0.5 * h, rect });
  }
  if (!plans.length) {
    // No side he can reach (a panel as wide as a phone screen): he climbs up
    // its FRONT, back to us, walks to the edge nearest the centre of the
    // panel's free side and falls down in front of it.
    const x0 = Math.max(st.minX, rect.left + 0.1 * w), x1 = Math.min(st.maxX, rect.right - 1.1 * w);
    if (x1 - x0 < 0.7 * w) return null;
    const xClimb = x0 + (x1 - x0) * 0.25, dir = 1;
    const xEdge = x1, xLand = Math.min(st.maxX, xEdge + 0.3 * w);
    const yHang = Math.min(st.yF, rect.bottom - 0.6 * h);
    return { side: 'F', front: true, dir, xClimb, xTop: xClimb, xEdge, xLand, yP, yHang, yGrab: rect.top - 0.5 * h, rect };
  }
  // Prefer the plan whose landing spot is nearest the screen centre.
  plans.sort((a, b) => Math.abs(a.xLand + w / 2 - st.vw / 2) - Math.abs(b.xLand + w / 2 - st.vw / 2));
  return plans[0];
}

/** Best climbable panel among several rects (largest usable wins). */
export function pickPanel(st, rects) {
  let best = null, area = 0;
  for (const r of rects || []) {
    const p = climbPlan(st, r);
    if (!p) continue;
    const a = (r.right - r.left) * (st.floor - r.top);
    if (a > area) { area = a; best = p; }
  }
  return best;
}

/**
 * Peek from behind the top edge of a panel (« hello from the top of a
 * window »), or null. The Ace pops up behind the panel's top line — only his
 * hat and face show above it — waves, then either ducks back down or climbs
 * over and jumps down in front of it.
 * x: box left; T: the panel's top line; yUp: box top when peeking (the line
 * cuts him under the mouth); yDown: box top when hidden; yP: box top standing
 * on the panel. rnd() picks the spot along the panel (30–70 % of its width).
 */
export function peekPlan(st, rect, rnd = Math.random) {
  const { w, h, k } = st;
  if (!rect) return null;
  const width = rect.right - rect.left;
  if (width < 1.4 * w) return null;
  const T = rect.top;
  if (T < 0.62 * h + 8) return null;                  // no room above the line for his head
  if (T > st.floor - 0.9 * h) return null;            // too low: he would just be standing there
  const cx = rect.left + width * (0.3 + 0.4 * rnd());
  const x = Math.max(rect.left + 0.05 * w, Math.min(rect.right - 1.05 * w, cx - w / 2));
  if (x < st.minX || x > st.maxX) return null;
  return { x, T, yUp: T - 118 * k, yDown: T + 24 * k, yP: T - 210 * k, rect };
}

/** Best panel to peek from (widest usable wins). */
export function pickPeek(st, rects, rnd = Math.random) {
  let best = null, width = 0;
  const r0 = rnd();
  for (const r of rects || []) {
    const p = peekPlan(st, r, () => r0);
    if (!p) continue;
    if (r.right - r.left > width) { width = r.right - r.left; best = p; }
  }
  return best;
}

/**
 * Sit on a panel's top edge, legs dangling in front of it, or null.
 * x: box left; ySit: box top when sitting (the card's bottom on the line).
 */
export function ledgePlan(st, rect, rnd = Math.random) {
  const { w, h, k } = st;
  if (!rect) return null;
  const width = rect.right - rect.left, T = rect.top;
  if (width < 1.3 * w) return null;
  if (T < 0.72 * h + 8) return null;                    // his head must stay under the header
  if (T > st.floor - 0.75 * h) return null;             // too low to be worth a jump
  const lo = Math.max(st.minX, rect.left - 0.1 * w), hi = Math.min(st.maxX, rect.right - 0.9 * w);
  if (hi < lo) return null;
  const x = lo + (hi - lo) * (0.2 + 0.6 * rnd());
  return { x, T, ySit: T - 156 * k, rect };
}

/**
 * Hang from a panel's bottom edge, feet in the air, or null.
 * x: box left; yHang: box top with his hands on the edge.
 */
export function hangPlan(st, rect, rnd = Math.random) {
  const { w, h, k } = st;
  if (!rect) return null;
  const width = rect.right - rect.left, B = rect.bottom;
  if (width < 1.3 * w) return null;
  if (B > st.floor - 1.15 * h) return null;             // his feet would touch the floor
  if (B < 0.45 * h + 40) return null;
  const lo = Math.max(st.minX, rect.left), hi = Math.min(st.maxX, rect.right - w);
  if (hi < lo) return null;
  const x = lo + (hi - lo) * (0.25 + 0.5 * rnd());
  return { x, B, yHang: B - 66 * k, rect };
}

/** First usable plan among rects with fn (ledgePlan / hangPlan), windows first. */
export function pickWith(fn, st, rects, rnd = Math.random) {
  const r0 = rnd();
  const list = (rects || []).slice().sort((a, b) => (b.win ? 1 : 0) - (a.win ? 1 : 0));
  for (const r of list) { const p = fn(st, r, () => r0); if (p) return p; }
  return null;
}

export const ENTRIES = ['door', 'poof', 'edge', 'peek'];
export const EXITS = ['door', 'poof', 'edge', 'duck'];
export const ACTIONS = ['moon', 'climb', 'magic', 'king', 'knight', 'grim', 'sleep', 'juggle', 'pistol', 'rope',
  'banana', 'bluff', 'ledge', 'hang', 'knock', 'push'];
/** Actions that need a panel: climb (side or front), ledge (its top), hang (its bottom). */
export const NEEDS = { climb: 'climb', ledge: 'ledge', hang: 'hang' };

/** Costume (hat, tool, mood) of an action. rnd() is in [0, 1). */
export function costumeFor(action, rnd = Math.random) {
  switch (action) {
    case 'moon': return { hat: 'fedora', tool: 'none', mood: 'cool' };
    case 'magic': return { hat: 'wizard', tool: 'wand', mood: 'smile' };
    case 'king': return { hat: 'crown', tool: 'scepter', mood: 'smile' };
    case 'knight': return { hat: 'helmet', tool: 'sword', mood: 'fierce' };
    case 'sleep': return { hat: 'nightcap', tool: 'none', mood: 'smile' };
    case 'pistol': return { hat: 'cowboy', tool: 'pistol', mood: 'smile' };
    case 'rope': return { hat: 'none', tool: 'none', mood: 'smile' };
    case 'bluff': return { hat: 'fedora', tool: 'none', mood: 'smile' };
    case 'hang': case 'knock': case 'push': return { hat: 'none', tool: 'none', mood: 'smile' };
    default: return { hat: rnd() < 0.5 ? 'tophat' : 'none', tool: 'none', mood: 'smile' };
  }
}

/**
 * One appearance: entry → greeting → action (+ sometimes grimaces) → exit.
 * The peek entry (only when can.peek) carries its own greeting; a short
 * peek visit has no action and ducks back behind the panel (exit 'duck').
 * @param {() => number} rnd  random in [0, 1)
 * @param {{ climb?: boolean, peek?: boolean, force?: string }} [can]
 */
export function pickSequence(rnd = Math.random, can = {}) {
  const pick = (list) => list[Math.floor(rnd() * list.length) % list.length];
  const pool = ACTIONS.filter((a) => !NEEDS[a] || can[NEEDS[a]]);
  const action = can.force && pool.indexOf(can.force) >= 0 ? can.force : pick(pool);
  const actions = [action];
  if (action !== 'grim' && action !== 'sleep' && action !== 'bluff' && rnd() < 0.3) actions.push('grim');
  const entry = pick(ENTRIES.filter((e) => e !== 'peek' || can.peek));
  const exits = EXITS.filter((e) => e !== 'duck');
  if (entry === 'peek' && !can.force && rnd() < 0.45) {
    return { entry, actions: [], exit: 'duck', costume: costumeFor('peek', rnd) };
  }
  return { entry, actions, exit: pick(exits), costume: costumeFor(action, rnd) };
}

/** Walking time (ms) between two x, at the stage speed (min 300 ms). */
export function walkMs(st, x0, x1) { return Math.max(300, Math.abs(x1 - x0) / st.speed * 1000); }

/** Number of full step cycles (2 steps) for a walk of `ms`, ~0.55 s each. */
export function stepCycles(ms) { return Math.max(1, Math.round(ms / 550)); }

/** Fall time (ms) for a drop of `px`, cartoon gravity, 350–900 ms. */
export function fallMs(px) { return Math.max(350, Math.min(900, Math.sqrt(2 * Math.max(0, px) / 1800) * 1000)); }

/** Small deterministic PRNG (mulberry32) for tests and replays. */
export function seeded(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
