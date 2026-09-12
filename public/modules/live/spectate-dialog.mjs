/* Live / embedded spectator mode — "joining, waiting for the next hand".
 *
 * Spectating never starts instantly: the server seats the viewer, then the
 * client waits for the current hand to finish. Without a word on screen that
 * gap reads as a click that did nothing. This puts the client's own dialog
 * shape (#leave-dialog: .ld-card / .ld-title / .ld-body / .ld-buttons) in
 * front of it, with a Cancel that actually leaves the table.
 *
 * Every string already exists in all 47 locales — spectatorBtn,
 * hdrSpectatingWait and leaveCancel — so nothing is left untranslated.
 */

const ID = 'live-spectate-dialog';
let watcher = null;

function el() { return document.getElementById(ID); }

// The client shows "Spectating — waiting for the next hand" in the wait
// banner and clears it once a hand is actually running. That transition is
// exactly when this dialog has done its job.
function stillWaiting() {
  const b = document.getElementById('lobby-wait-status');
  if (!b) return false;
  return b.style.display !== 'none' && b.offsetParent !== null;
}

export function closeSpectateDialog() {
  const d = el();
  if (d) d.style.display = 'none';
  if (watcher) { clearInterval(watcher); watcher = null; }
}

export function cancelSpectate() {
  closeSpectateDialog();
  // Leave whatever we joined. leaveGame() is the client's own path: it sends
  // LeaveGame, resets the client state and returns to the lobby, and it is a
  // no-op-with-cleanup if the join never completed.
  try { if (window.App && window.App.leaveGame) window.App.leaveGame(); } catch (e) {}
}

export function openSpectateDialog() {
  const d = el();
  if (!d) return;
  d.style.display = 'flex';
  if (watcher) clearInterval(watcher);
  // Close once the hand is running. A poll rather than an event because the
  // client emits none for this; one check a second is not worth a hook into
  // the render path.
  let seenWaiting = false;
  watcher = setInterval(function () {
    if (stillWaiting()) { seenWaiting = true; return; }
    // Only close on the falling edge, so we don't close in the instant
    // between the click and the banner appearing.
    if (seenWaiting) closeSpectateDialog();
  }, 1000);
}

export function initSpectateDialog() {
  const d = el();
  if (!d) return;
  d.addEventListener('click', function (ev) {
    if (ev.target && ev.target.closest && ev.target.closest('[data-live-cancel]')) cancelSpectate();
  });
}
