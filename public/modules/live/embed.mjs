/* Live / embedded spectator mode — the ?embed=1 layer.
 *
 * /live on its own is a standalone page. ?embed=1 is the same page inside an
 * iframe on pokerth.net, which changes two things and nothing else:
 *
 *   • an iframe that starts making noise on a news page is a bug, so sound
 *     is off until the visitor turns it on
 *   • a page that is not the destination should not offer to be installed
 *
 * Everything else — the guest login, the table list, the chat, the table view
 * — is exactly what /live already does. The flag lives on <html> as
 * data-embed so the stylesheet can key off it like every other live rule.
 *
 * The host page sizes the frame. Up to 2.1.8-web.114 the frame reported a
 * height instead, but /live fills its viewport (html/body are pinned to it)
 * and scrolls inside: the table list has its own scroller, the table view is
 * laid out from the viewport. There is no content height to report — the
 * reports echoed the host's own value, and the auto-height styling needed to
 * make one up removed the list's scroller and squeezed the table view.
 */

const CHANNEL = 'pokerth-live';

export function isEmbedded() {
  try {
    return new URLSearchParams(window.location.search).get('embed') === '1';
  } catch (e) { return false; }
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

// Inside a frame at all, ?embed=1 or not: a host page may frame /live without
// the flag, so this checks the fact rather than the query.
export function isFramed() {
  try { return window.self !== window.top; } catch (e) { return true; }
}

export function initEmbed() {
  // Fullscreen from inside a frame depends on how the host built the iframe,
  // and on pokerth.net the button does nothing. data-framed lets the
  // stylesheet drop it wherever /live is framed; standalone /live keeps it.
  if (isFramed()) document.documentElement.setAttribute('data-framed', '1');
  if (!isEmbedded()) return;
  document.documentElement.setAttribute('data-embed', '1');
  silenceByDefault();
  // Tell the host we are alive, so it can show the frame only once the
  // spectator view actually loaded.
  try {
    window.parent.postMessage({ channel: CHANNEL, type: 'ready' }, '*');
  } catch (e) {}
}
