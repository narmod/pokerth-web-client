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

/** Scale factor: the Ace is ~20 % of the short side, 96–190 px tall. */
export function mascotScale(vw, vh) {
  const h = Math.max(96, Math.min(190, Math.min(vh * 0.2, vw * 0.3)));
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
  if (!plans.length) return null;
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

export const ENTRIES = ['door', 'poof', 'edge'];
export const EXITS = ['door', 'poof', 'edge'];
export const ACTIONS = ['moon', 'climb', 'magic', 'king', 'knight', 'grim'];

/** Costume (hat, tool, mood) of an action. rnd() is in [0, 1). */
export function costumeFor(action, rnd = Math.random) {
  switch (action) {
    case 'moon': return { hat: 'fedora', tool: 'none', mood: 'cool' };
    case 'magic': return { hat: 'wizard', tool: 'wand', mood: 'smile' };
    case 'king': return { hat: 'crown', tool: 'scepter', mood: 'smile' };
    case 'knight': return { hat: 'helmet', tool: 'sword', mood: 'fierce' };
    default: return { hat: rnd() < 0.5 ? 'tophat' : 'none', tool: 'none', mood: 'smile' };
  }
}

/**
 * One appearance: entry → greeting → action (+ sometimes grimaces) → exit.
 * @param {() => number} rnd  random in [0, 1)
 * @param {{ climb?: boolean, force?: string }} [can]
 */
export function pickSequence(rnd = Math.random, can = {}) {
  const pick = (list) => list[Math.floor(rnd() * list.length) % list.length];
  const pool = ACTIONS.filter((a) => a !== 'climb' || can.climb);
  const action = can.force && pool.indexOf(can.force) >= 0 ? can.force : pick(pool);
  const actions = [action];
  if (action !== 'grim' && rnd() < 0.3) actions.push('grim');
  return { entry: pick(ENTRIES), actions, exit: pick(EXITS), costume: costumeFor(action, rnd) };
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
