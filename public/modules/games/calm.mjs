// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Draw only what changed (web.110; audit claude/AUDIT_PERF_MINIJEUX_2026-11-16.md, lot 4).
// A card game sits still most of the time (the cards dealt, the player thinking), yet
// it painted its whole canvas 60 times a second. A game that says `calm: true` draws
// into a recorder instead of the canvas: its calls are noted, not painted. When the
// list is the same as at the last frame (and the canvas, the fonts, the images too),
// the canvas already shows it: nothing is painted. Otherwise the list is played on
// the canvas — exactly the calls the game made, so exactly the same picture.
//
//   const calm = createCalm()
//   calm.draw(realCtx, (ctx) => game.draw(ctx))   → true when it painted
//   calm.broken                                    a call it cannot record was made
//                                                  (the game then draws directly)
// A drawing that changes at every frame for half a second (a clock running) is drawn
// directly for a second, then looked at again: recording it would only add work.
//
// Recorded: every method and property of CanvasRenderingContext2D. Answered at once:
// measureText (on the real canvas, its font put back), getLineDash, the gradients
// (stand-ins, made real when played). Anything else that answers (getImageData,
// getTransform, isPointInPath…) or a Path2D: `broken`, and that frame is painted.
// ═══════════════════════════════════════════════════════════════════

let fontEpoch = 0;
try { if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { fontEpoch++; }); } catch (e) {}

const METHODS = [], PROPS = [];
try {
  const P = CanvasRenderingContext2D.prototype;
  for (const k of Object.getOwnPropertyNames(P)) {
    if (k === 'constructor') continue;
    const d = Object.getOwnPropertyDescriptor(P, k);
    if (!d) continue;
    if (typeof d.value === 'function') METHODS.push(k);
    else if (d.get && d.set) PROPS.push(k);
  }
} catch (e) {}
const ANSWERS = new Set(['getImageData', 'getTransform', 'isPointInPath', 'isPointInStroke', 'createPattern', 'createImageData',
  'getContextAttributes', 'isContextLost', 'putImageData', 'drawFocusIfNeeded', 'scrollPathIntoView']);

let ids = new WeakMap(), nextId = 1;
const idOf = (o) => { let i = ids.get(o); if (!i) { i = nextId++; ids.set(o, i); } return i; };

export function createCalm() {
  let ops = [], sh = {}, stack = [], bad = false, last = '', changed = 0, directUntil = 0;
  /** @type {any} */
  const rec = {};
  const grad = (kind, args) => {
    const gr = { __calm: kind, args, stops: [], addColorStop(o, c) { gr.stops.push(o, c); } };
    return gr;
  };
  let real = /** @type {CanvasRenderingContext2D|null} */ (null);
  for (const m of METHODS) {
    rec[m] = (...a) => {
      if (m === 'save') { stack.push(Object.assign({}, sh)); ops.push(m, a); return; }
      if (m === 'restore') { if (stack.length) sh = stack.pop(); ops.push(m, a); return; }
      if (m === 'setLineDash') { sh.__dash = Array.isArray(a[0]) ? a[0].slice() : []; ops.push(m, a); return; }
      if (m === 'getLineDash') return (sh.__dash || []).slice();
      if (m === 'measureText') {
        const f = real.font; real.font = sh.font;
        const r = real.measureText(a[0]);
        real.font = f;
        return r;
      }
      if (m === 'createLinearGradient') return grad('L', a);
      if (m === 'createRadialGradient') return grad('R', a);
      if (m === 'createConicGradient') return grad('C', a);
      if (ANSWERS.has(m)) { bad = true; return real[m](...a); }
      for (const v of a) if (v && typeof v === 'object' && typeof Path2D !== 'undefined' && v instanceof Path2D) bad = true;
      ops.push(m, a);
    };
  }
  for (const p of PROPS) {
    Object.defineProperty(rec, p, { get() { return sh[p]; }, set(v) { sh[p] = v; ops.push('=', [p, v]); }, enumerable: true });
  }
  Object.defineProperty(rec, 'canvas', { get() { return real && real.canvas; } });

  /** One value of the list, as text (to compare two frames). */
  const key = (v) => {
    if (typeof v === 'number') return String(v);
    if (typeof v === 'string') return '"' + v;
    if (v == null || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) return '[' + v.map(key).join(',') + ']';
    if (v.__calm) return 'G' + v.__calm + '(' + v.args.join(',') + '|' + v.stops.join(',') + ')';
    if (typeof HTMLImageElement !== 'undefined' && v instanceof HTMLImageElement) return 'I' + idOf(v) + ':' + (v.complete ? 1 : 0) + ':' + v.naturalWidth;
    if (typeof HTMLCanvasElement !== 'undefined' && v instanceof HTMLCanvasElement) { if (!v.__still) bad = true; return 'C' + idOf(v); }   // its pixels may change (sprites.mjs' never do)
    if (typeof v === 'object' && 'a' in v && 'f' in v) return 'M' + [v.a, v.b, v.c, v.d, v.e, v.f].join(',');
    return 'O' + idOf(v);
  };
  /** Plays the list on the real canvas (the gradients made real). */
  const play = (g) => {
    const made = new Map();
    const val = (v) => {
      if (!v || !v.__calm) return v;
      let r = made.get(v);
      if (!r) {
        r = v.__calm === 'L' ? g.createLinearGradient(...v.args) : v.__calm === 'R' ? g.createRadialGradient(...v.args) : g.createConicGradient(...v.args);
        for (let i = 0; i < v.stops.length; i += 2) r.addColorStop(v.stops[i], v.stops[i + 1]);
        made.set(v, r);
      }
      return r;
    };
    for (let i = 0; i < ops.length; i += 2) {
      const m = ops[i], a = ops[i + 1];
      if (m === '=') g[a[0]] = val(a[1]);
      else g[m](...a.map(val));
    }
  };
  const stats = { painted: 0, kept: 0, direct: 0 };
  return {
    stats,
    get broken() { return bad; },
    /** Runs paint(recorder); paints the canvas only when the calls differ from the last frame's. */
    draw(g, paint) {
      // Changing at every frame (a clock running, cards flying): recording would only add work — draw directly
      // for a second, then look again.
      const now = performance.now();
      if (now < directUntil) { stats.direct++; paint(g); return true; }
      real = g; ops = []; stack = []; bad = false;
      sh = {}; for (const p of PROPS) { try { sh[p] = g[p]; } catch (e) {} }
      sh.__dash = g.getLineDash ? g.getLineDash() : [];
      paint(rec);
      let k = g.canvas.width + 'x' + g.canvas.height + '|' + fontEpoch + '|' + key(g.getTransform());
      for (let i = 0; i < ops.length; i += 2) k += ';' + ops[i] + '(' + ops[i + 1].map(key).join(',');
      if (!bad && k === last) { changed = 0; stats.kept++; return false; }
      stats.painted++;
      last = bad ? '' : k;
      play(g);
      if (++changed >= 30) { changed = 0; directUntil = now + 1000; last = ''; }
      return true;
    },
    /** The canvas was cleared or touched from outside: paint at the next frame. */
    reset() { last = ''; },
  };
}
