// ═══════════════════════════════════════════════════════════════════
// Ace's Help — anonymous statistics (L3, web.261).
//
// beacon(ctx, ev) posts { ctx, ev } to /__guide: which tips are shown, done
// or put off, whether the offer is accepted, and the Ranking funnel (table
// highlighted → joined from the bubble → game started). No visitor id, no
// name, no table — the proxy only accepts the pairs of server/guide-stats.js.
// Offline (or when a post fails), events wait in a small local queue
// (localStorage pth_guide_q, at most MAX_QUEUE, oldest dropped) and go out
// when the network is back. « Do not count my visits » (admin, pth_no_count)
// switches them off on that browser, like the visit counter.
// ═══════════════════════════════════════════════════════════════════

const KEY = 'pth_guide_q';
const MAX_QUEUE = 50;
const RE = /^[a-z0-9_.-]{1,40}$/;
let flushing = false;

function noCount() { try { return localStorage.getItem('pth_no_count') === '1'; } catch (e) { return false; } }
function readQ() {
  try { const q = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(q) ? q.filter((e) => Array.isArray(e) && RE.test(e[0]) && RE.test(e[1])) : []; }
  catch (e) { return []; }
}
function writeQ(q) {
  try { if (q.length) localStorage.setItem(KEY, JSON.stringify(q.slice(-MAX_QUEUE))); else localStorage.removeItem(KEY); } catch (e) {}
}
function online() { return typeof navigator === 'undefined' || navigator.onLine !== false; }

function post(ctx, ev) {
  return fetch('/__guide', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ctx, ev }), keepalive: true, cache: 'no-store',
  }).then((r) => r.status < 500);        // 204 counted, 400 refused for good: either way, done
}

/** Counts one event (queued while offline). */
export function beacon(ctx, ev) {
  if (!RE.test(ctx) || !RE.test(ev) || window.LIVE_MODE || noCount()) return;
  if (!online()) { const q = readQ(); q.push([ctx, ev]); writeQ(q); return; }
  post(ctx, ev).then((sent) => { if (!sent) { const q = readQ(); q.push([ctx, ev]); writeQ(q); } else flush(); })
    .catch(() => { const q = readQ(); q.push([ctx, ev]); writeQ(q); });
}

/** Sends what waited in the queue (network back, next page load). */
export async function flush() {
  if (flushing || !online() || noCount()) return;
  let q = readQ();
  if (!q.length) return;
  flushing = true;
  try {
    while (q.length) {
      const [ctx, ev] = q[0];
      let sent = false;
      try { sent = await post(ctx, ev); } catch (e) { sent = false; }
      if (!sent) break;
      q = readQ(); q.shift(); writeQ(q);
    }
  } finally { flushing = false; }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { flush(); });
  setTimeout(() => { flush(); }, 4000);
}
