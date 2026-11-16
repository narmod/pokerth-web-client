// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Drawn once, then copied (web.108; audit claude/AUDIT_PERF_MINIJEUX_2026-11-16.md, lot 2).
// What does not change from one frame to the next (Video Poker's cabinet, its pay
// table and buttons, a chip of Tapis!) is painted once in a small canvas at the
// screen's resolution, then copied with drawImage: one call instead of dozens.
//
//   const sp = spriteCache(shell, 96)
//   sp.draw(g, key, ax, ay, box, paint)
//       key    what the picture depends on (a string; the scale, the fonts are added)
//       ax, ay where its anchor goes, in the game's units (the canvas' current transform:
//              a scale, shell.dpr × shell.k, and maybe a shift — a shake; no rotation)
//       box    [x, y, w, h] around the anchor that holds the whole picture (a margin
//              for the glows is added)
//       paint  (ctx) draws it as if the anchor were at (0, 0)
//
// The anchor lands on a whole screen pixel (at most half a pixel off), so the copy
// is as sharp as the drawing. The fonts arriving later (a web font loading) and a
// new scale (the window resized, the quality stepping down) paint it again. The
// least used pictures go beyond `max`.
// ═══════════════════════════════════════════════════════════════════

let fontEpoch = 0;
try { if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { fontEpoch++; }); } catch (e) {}

const PAD = 14;   // device pixels around the box: shadows and glows (shadowBlur ≤ 10)

export function spriteCache(shell, max = 64) {
  const map = new Map();
  return {
    /** @param {CanvasRenderingContext2D} g @param {string} key @param {number} ax @param {number} ay @param {number[]} box @param {(c: CanvasRenderingContext2D) => void} paint */
    draw(g, key, ax, ay, box, paint) {
      const m = g.getTransform(), s = m.a || shell.dpr * shell.k;
      const full = key + '|' + s.toFixed(4) + '|' + fontEpoch;
      let sp = map.get(full);
      if (sp) { map.delete(full); map.set(full, sp); }        // most recently used last
      else {
        const ox = Math.floor(box[0] * s) - PAD, oy = Math.floor(box[1] * s) - PAD;
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.ceil((box[0] + box[2]) * s) + PAD - ox);
        c.height = Math.max(1, Math.ceil((box[1] + box[3]) * s) + PAD - oy);
        const x = /** @type {CanvasRenderingContext2D} */ (c.getContext('2d'));
        x.setTransform(s, 0, 0, s, -ox, -oy);
        try { paint(x); } catch (e) {}
        sp = { c, ox, oy };
        map.set(full, sp);
        if (map.size > max) map.delete(map.keys().next().value);
      }
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(sp.c, Math.round(ax * s + m.e) + sp.ox, Math.round(ay * s + m.f) + sp.oy);
      g.restore();
    },
    clear() { map.clear(); },
    get size() { return map.size; },
  };
}
