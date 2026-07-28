// ═══════════════════════════════════════════════════════════════════
// Live scroll — shared "follow / paused" behaviour for the game log and
// the chat panels (Qt-Widgets & QML client parity, forum request).
//
// Auto-follow pauses as soon as the reader leaves the live edge to look
// back at a previous hand: incoming lines keep piling up in the
// background but the view no longer moves. Follow resumes on its own as
// soon as the view is back at the live edge, and a discreet "jump to
// latest" bar (with a counter of what arrived meanwhile) offers a way
// back in one tap.
//
// Two orientations, one mechanism:
//   · newestTop  (game log) — the list is reversed, newest first. Live
//     edge = scrollTop 0. New rows are inserted ABOVE the viewport by a
//     full re-render, so the view is re-anchored on its distance to the
//     BOTTOM of the list, which is the invariant here.
//   · newestBottom (chats) — plain append order. Live edge = bottom.
//     Appending does not move scrollTop by itself, so pausing simply
//     means not forcing the scroll down.
// ═══════════════════════════════════════════════════════════════════
import { t } from '../i18n.mjs';

const EPS = 4;           // px tolerance: "close enough" counts as live
const REG = new Map();   // element -> state

function atLive(el, st) {
  return st.top ? (el.scrollTop <= EPS)
                : (el.scrollHeight - (el.clientHeight || 0) - el.scrollTop <= EPS);
}

function goLive(el, st) {
  el.scrollTop = st.top ? 0 : el.scrollHeight;
}

function paint(st) {
  if (!st.bar) return;
  st.bar.style.display = st.live ? 'none' : '';
  if (st.num) st.num.textContent = st.pending > 0 ? String(st.pending) : '';
}

// Attach once per scrollable element. opts.top = newest entries on top.
function attachLiveScroll(el, opts) {
  if (!el) return null;
  if (REG.has(el)) return REG.get(el);
  const st = { top: !!(opts && opts.top), live: true, pending: 0, bar: null, num: null };
  REG.set(el, st);

  // The bar is a convenience, not the mechanism: anchoring still works if
  // it cannot be built (headless test stubs, exotic DOM), hence the guard.
  try {
    const bar = document.createElement('button');
    bar.type = 'button';
    bar.className = 'live-jump' + (st.top ? ' live-jump-up' : '');
    bar.style.display = 'none';
    bar.innerHTML = '<span class="live-jump-n"></span>' +
                    '<span class="live-jump-t" data-i18n="jumpLatest"></span>' +
                    '<span class="live-jump-a" aria-hidden="true">' + (st.top ? '\u25B2' : '\u25BC') + '</span>';
    try { bar.querySelector('.live-jump-t').textContent = t('jumpLatest'); } catch (e) {}
    bar.addEventListener('click', function () {
      st.pending = 0; goLive(el, st); st.live = true; paint(st);
    });
    // Sits in the panel's flex flow rather than floating over the list:
    // above the rows when newest is on top, below them otherwise. It never
    // covers a line and survives panel resizing without any measuring.
    el.parentNode.insertBefore(bar, st.top ? el : el.nextSibling);
    st.bar = bar;
    st.num = bar.querySelector('.live-jump-n');
  } catch (e) {}

  try {
    el.addEventListener('scroll', function () {
      const live = atLive(el, st);
      if (live === st.live) return;
      st.live = live;
      if (live) st.pending = 0;
      paint(st);
    }, { passive: true });
  } catch (e) {}

  return st;
}

// First row intersecting the viewport, plus how far above it we are. This
// is the sturdy anchor: it survives rows being dropped at the far end and
// rows of unequal height, neither of which a geometric offset survives.
function topRow(el) {
  const rows = el.children;
  const top = el.scrollTop;
  for (let i = 0; i < rows.length; i++) {
    const o = rows[i].offsetTop, h = rows[i].offsetHeight;
    if (typeof o !== 'number' || typeof h !== 'number') return null;
    if (o + h > top) return { i: i, d: top - o };
  }
  return null;
}

// Call right before mutating the list; keep the returned snapshot.
function liveBefore(el) {
  const st = el ? REG.get(el) : null;
  if (!el || !st) return null;
  // Measured, never trusted from the last scroll event: the counter bar
  // needs the event, the anchoring must not depend on it.
  return {
    st: st,
    live: atLive(el, st),
    anchor: el.scrollHeight - el.scrollTop,
    row: st.top ? topRow(el) : null,
    count: el.children.length
  };
}

// Call right after mutating the list, with that snapshot. `addedTop` is how
// many rows were inserted at the head of a reversed list; pass it whenever
// it is known, as the row count alone cannot tell (a capped list drops one
// row at the tail for every row gained at the head, so it never moves).
function liveAfter(el, snap, addedTop) {
  if (!el || !snap) return;
  const st = snap.st;
  const known = (typeof addedTop === 'number');
  const grew = el.children.length - snap.count;
  // A list that shrank without gaining anything was cleared or replaced:
  // there is nothing left to hold on to, so go back to following.
  if (grew < 0 && !(known && addedTop > 0)) {
    st.live = true; st.pending = 0; goLive(el, st); paint(st); return;
  }
  if (snap.live) {
    st.live = true; st.pending = 0; goLive(el, st);
  } else {
    st.live = false;
    if (st.top) {
      // The rows the reader is looking at have been pushed down by exactly
      // `addedTop` new ones: follow that row to its new index and put it
      // back under the same pixel. Falls back to the geometric offset when
      // the caller cannot say how many arrived.
      const row = known && snap.row ? el.children[snap.row.i + addedTop] : null;
      if (row && typeof row.offsetTop === 'number') el.scrollTop = Math.max(0, row.offsetTop + snap.row.d);
      else el.scrollTop = Math.max(0, el.scrollHeight - snap.anchor);
    }
    const n = known ? addedTop : grew;
    if (n > 0) st.pending += n;
  }
  paint(st);
}

// Back to following, e.g. after the panel is cleared or (re)opened.
function liveReset(el) {
  const st = el ? REG.get(el) : null;
  if (!st) return;
  st.live = true; st.pending = 0; goLive(el, st); paint(st);
}

function boot() {
  attachLiveScroll(document.getElementById('g-log-body'),  { top: true });
  attachLiveScroll(document.getElementById('g-chat-msgs'), { top: false });
  attachLiveScroll(document.getElementById('chat'),        { top: false });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

export { attachLiveScroll, liveBefore, liveAfter, liveReset };

window._liveAttach = attachLiveScroll;
window._liveBefore = liveBefore;
window._liveAfter  = liveAfter;
window._liveReset  = liveReset;
