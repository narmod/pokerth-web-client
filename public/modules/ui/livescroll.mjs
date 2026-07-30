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
//
// Resuming follows the QML client (ChatBox / GameInfoPanel autoScrollTimer):
// the pause is not permanent. Fifteen seconds after the reader last moved,
// the view returns to the live edge on its own. The timer is armed on every
// scroll away from the edge and dropped as soon as the edge is reached
// again, so it only ever fires on a reader who stopped scrolling.
// ═══════════════════════════════════════════════════════════════════

const EPS = 4;             // px tolerance: "close enough" counts as live
const IDLE_MS = 15000;     // = autoScrollTimer.interval in the QML client
const REG = new Map();     // element -> state

function atLive(el, st) {
  return st.top ? (el.scrollTop <= EPS)
                : (el.scrollHeight - (el.clientHeight || 0) - el.scrollTop <= EPS);
}

function goLive(el, st) {
  el.scrollTop = st.top ? 0 : el.scrollHeight;
}

// Away from the edge: (re)arm the countdown. Back at the edge: drop it.
// Every scroll event restarts it, so the fifteen seconds are counted from
// the reader's last movement, not from the moment the pause began.
function arm(el, st) {
  if (st.timer) { clearTimeout(st.timer); st.timer = null; }
  if (st.live) return;
  st.timer = setTimeout(function () {
    st.timer = null;
    st.live = true;
    goLive(el, st);
  }, IDLE_MS);
}

// Attach once per scrollable element. opts.top = newest entries on top.
function attachLiveScroll(el, opts) {
  if (!el) return null;
  if (REG.has(el)) return REG.get(el);
  const st = { top: !!(opts && opts.top), live: true, timer: null };
  REG.set(el, st);

  try {
    el.addEventListener('scroll', function () {
      const live = atLive(el, st);
      // Restart the countdown on EVERY scroll away from the edge, not only
      // on the transition: a reader who keeps scrolling back must not have
      // the view pulled from under them fifteen seconds after the first move.
      if (live !== st.live) st.live = live;
      arm(el, st);
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
    st.live = true; goLive(el, st); arm(el, st); return;
  }
  if (snap.live) {
    st.live = true; goLive(el, st);
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
  }
  // New lines arriving are not a reader movement: the countdown keeps
  // running from the last scroll, exactly as the QML timer does.
}

// Back to following, e.g. after the panel is cleared or (re)opened.
function liveReset(el) {
  const st = el ? REG.get(el) : null;
  if (!st) return;
  st.live = true; goLive(el, st); arm(el, st);
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
