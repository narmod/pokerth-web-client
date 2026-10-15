// @ts-check
// ── spatial-nav.mjs — pick the next element in a direction ──────────────────
//
// Pure geometry for gamepad menu navigation (ui/gamepad.mjs): given the box of
// the element that has the focus ring and the boxes of every candidate, find
// the candidate a D-pad press should move to. No DOM access here, so the
// choice is unit-tested (scripts/test-spatial-nav.mjs).
//
// A box is { left, top, right, bottom } in viewport pixels.
//
// Rules, in the spirit of the CSS spatial-navigation draft:
//   · only candidates whose centre lies clearly beyond the current centre in
//     the pressed direction count — "clearly" is a third of the current box,
//     so an element nested in the current one (a button inside a table row)
//     or sitting on the same line is never picked by ↑/↓;
//   · the score is the edge-to-edge gap along the axis, plus twice the gap
//     across it (0 when the two boxes overlap on that axis), plus a small
//     centre-alignment term that breaks ties in favour of the element in line;
//   · lowest score wins; ties keep document order.

export const DIRS = ['up', 'down', 'left', 'right'];

function cx(r) { return (r.left + r.right) / 2; }
function cy(r) { return (r.top + r.bottom) / 2; }

// Gap between two intervals, 0 when they overlap.
function gap(a0, a1, b0, b1) {
  if (b0 > a1) return b0 - a1;
  if (a0 > b1) return a0 - b1;
  return 0;
}

// Score of candidate c from box f in direction dir, or -1 when c is not in
// that direction.
export function score(f, c, dir) {
  var vertical = dir === 'up' || dir === 'down';
  var size = vertical ? (f.bottom - f.top) : (f.right - f.left);
  var slack = Math.max(1, size / 3);
  var d;                         // signed progress of the centre along dir
  if (dir === 'down') d = cy(c) - cy(f);
  else if (dir === 'up') d = cy(f) - cy(c);
  else if (dir === 'right') d = cx(c) - cx(f);
  else if (dir === 'left') d = cx(f) - cx(c);
  else return -1;
  if (d <= slack) return -1;
  var along, across, align;
  if (dir === 'down') along = c.top - f.bottom;
  else if (dir === 'up') along = f.top - c.bottom;
  else if (dir === 'right') along = c.left - f.right;
  else along = f.left - c.right;
  along = Math.max(0, along);
  if (vertical) {
    across = gap(f.left, f.right, c.left, c.right);
    align = Math.abs(cx(c) - cx(f));
  } else {
    across = gap(f.top, f.bottom, c.top, c.bottom);
    align = Math.abs(cy(c) - cy(f));
  }
  return along + 2 * across + 0.05 * align + 0.001 * d;
}

// Index in rects of the best candidate from box `from` in direction dir,
// or -1 when nothing lies that way.
export function pickNext(from, rects, dir) {
  var best = -1, bestScore = Infinity;
  for (var i = 0; i < rects.length; i++) {
    var s = score(from, rects[i], dir);
    if (s < 0) continue;
    if (s < bestScore) { bestScore = s; best = i; }
  }
  return best;
}

// Index of the first candidate in reading order (top line first, then the
// leftmost on it; boxes whose tops are within `tol` px share a line),
// or -1 for an empty list.
export function pickFirst(rects, tol) {
  var t = tol == null ? 8 : tol;
  var best = -1;
  for (var i = 0; i < rects.length; i++) {
    if (best < 0) { best = i; continue; }
    var r = rects[i], b = rects[best];
    if (r.top < b.top - t || (Math.abs(r.top - b.top) <= t && r.left < b.left)) best = i;
  }
  return best;
}
