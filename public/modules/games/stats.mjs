// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The « Mini-games » mode — anonymous statistics (web.25; design note
// claude/CONCEPTION_MODE_ARCADE.md; server/arcade-stats.js).
//
// arcadeStat(ev) posts { ev } to /__arcade: the mode unlocked, its toast and
// its appearance on the login, the page opened, each game revealed, opened
// and played to its end, and training games ended with or without the mode.
// No visitor id, no name — the proxy only accepts its closed list of events.
// Played offline (training, mini-games), events wait in a small local queue
// (pth_arcade_q, at most MAX_QUEUE, oldest dropped) until the network is back.
// « Do not count my visits » (pth_no_count) and /live switch them off.
// Also window.arcadeStat, for the scripts that are not modules.
// ═══════════════════════════════════════════════════════════════════

const KEY = 'pth_arcade_q';
const MAX_QUEUE = 60;
const RE = /^[a-z0-9_-]{1,40}$/;
let flushing = false;

function noCount() {
  try { if (typeof window !== 'undefined' && window.LIVE_MODE) return true; } catch (e) {}
  try { return localStorage.getItem('pth_no_count') === '1'; } catch (e) { return false; }
}
function readQ() {
  try { const q = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(q) ? q.filter((e) => typeof e === 'string' && RE.test(e)) : []; }
  catch (e) { return []; }
}
function writeQ(q) {
  try { if (q.length) localStorage.setItem(KEY, JSON.stringify(q.slice(-MAX_QUEUE))); else localStorage.removeItem(KEY); } catch (e) {}
}
const online = () => typeof navigator === 'undefined' || navigator.onLine !== false;

function post(ev) {
  let wd = false;
  try { wd = typeof navigator !== 'undefined' && navigator.webdriver === true; } catch (e) {}
  return fetch('/__arcade', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wd ? { ev, wd: true } : { ev }), keepalive: true, cache: 'no-store',
  }).then((r) => r.status < 500);        // 204 counted, 400 refused for good: either way, done
}

/** Counts one event (queued while offline). */
export function arcadeStat(ev) {
  if (!RE.test(String(ev)) || noCount()) return;
  const keep = () => { const q = readQ(); q.push(ev); writeQ(q); };
  if (!online()) { keep(); return; }
  post(ev).then((sent) => { if (!sent) keep(); else flush(); }).catch(keep);
}

/** Sends what waited in the queue. */
export async function flush() {
  if (flushing || !online() || noCount()) return;
  let q = readQ();
  if (!q.length) return;
  flushing = true;
  try {
    while (q.length) {
      let sent = false;
      try { sent = await post(q[0]); } catch (e) { sent = false; }
      if (!sent) break;
      q = readQ(); q.shift(); writeQ(q);
    }
  } finally { flushing = false; }
}

if (typeof window !== 'undefined') {
  window.arcadeStat = arcadeStat;
  try { window.addEventListener('online', () => { flush(); }); } catch (e) {}
  setTimeout(() => { flush(); }, 4000);
}
