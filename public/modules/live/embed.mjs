/* Live / embedded spectator mode — the ?embed=1 layer.
 *
 * /live on its own is a standalone page. ?embed=1 is the same page inside an
 * iframe on pokerth.net, which changes three things and nothing else:
 *
 *   • the host page cannot know how tall the content is, so we tell it
 *   • an iframe that starts making noise on a news page is a bug, so sound
 *     is off until the visitor turns it on
 *   • a page that is not the destination should not offer to be installed
 *
 * Everything else — the guest login, the table list, the chat, the table view
 * — is exactly what /live already does. The flag lives on <html> as
 * data-embed so the stylesheet can key off it like every other live rule.
 */

const CHANNEL = 'pokerth-live';

export function isEmbedded() {
  try {
    return new URLSearchParams(window.location.search).get('embed') === '1';
  } catch (e) { return false; }
}

function postHeight(px) {
  try {
    window.parent.postMessage({ channel: CHANNEL, type: 'height', height: px }, '*');
  } catch (e) {}
}

// The host sizes its iframe from what we report. Measuring the document
// element rather than body: body has no margin here, but a future style that
// gave it one would silently under-report and clip the last row.
function measure() {
  const d = document.documentElement;
  return Math.max(d.scrollHeight, d.offsetHeight, 0);
}

function armHeightReports() {
  let last = null;
  function tick() {
    const h = measure();
    // A pixel of jitter each frame would have the host resizing forever — but
    // the FIRST report always goes out, whatever the number. Skipping it left
    // the host sizing the frame from its own guess for as long as the height
    // did not move afterwards.
    if (last !== null && Math.abs(h - last) < 8) return;
    last = h;
    postHeight(h);
  }
  if (window.ResizeObserver) {
    new window.ResizeObserver(tick).observe(document.documentElement);
  }
  window.addEventListener('resize', tick);
  window.addEventListener('load', tick);
  setInterval(tick, 2000);   // covers content that grows without a resize
  tick();
}

// Off by default, and only for a visitor who has never chosen. Someone who
// turned sound on keeps it on: this sets the default, it does not override.
function silenceByDefault() {
  try {
    if (window.localStorage.getItem('pth_sound') === null) {
      window.localStorage.setItem('pth_sound', '0');
    }
  } catch (e) {}
}

export function initEmbed() {
  if (!isEmbedded()) return;
  document.documentElement.setAttribute('data-embed', '1');
  silenceByDefault();
  armHeightReports();
  // Tell the host we are alive, so it can show the frame only once the
  // spectator view actually loaded.
  try {
    window.parent.postMessage({ channel: CHANNEL, type: 'ready' }, '*');
  } catch (e) {}
}
