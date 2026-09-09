/* Live / embedded spectator mode (/live) — slim header wiring.
 *
 * Loaded only when proxy.js injects the LIVE_BOOT script, so it costs nothing
 * in the normal client. Almost all of live mode is CSS driven by the
 * :root[data-live="1"] attribute; this module only fills the two dynamic bits
 * of the slim header — who we are logged in as, and the build version.
 */

import { initLiveLobby } from './lobby.mjs';
import { initLiveChatPane } from './chat-pane.mjs';

if (window.LIVE_MODE) {
  const VER_IDS = ['live-ver-lobby', 'live-ver-game'];
  let lastName = null;

  function syncIdentity() {
    const S = window.PthState;   // bridged by game/state.mjs; window.S is not a thing
    const name = (S && S.myName) ? String(S.myName) : '';
    if (name === lastName) return;
    lastName = name;
    const el = document.getElementById('live-id');
    if (el) el.textContent = name ? '\u{1F464} ' + name : '';
  }

  function stampVersion() {
    const v = window.BUILD_VERSION ? 'v' + window.BUILD_VERSION : '';
    for (const id of VER_IDS) {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    }
  }

  // ── Guest-only login ──────────────────────────────────────────────────
  // The connect screen is reduced to a single button by CSS; the state behind
  // it is forced here so the ordinary App.connect() path runs unchanged:
  // pokerth.net as the server, guest mode on, and an empty nickname, which
  // makes the client reuse its persistent Guest name.
  function forceGuestLogin() {
    const sm = document.getElementById('server-mode');
    const gc = document.getElementById('guest-mode-cb');
    if (sm) sm.value = 'pokerthnet';
    if (gc) gc.checked = true;
    try {
      if (window.App && window.App.onServerOrGuestChange) window.App.onServerOrGuestChange();
    } catch (e) {}
  }

  // Re-asserted in the capture phase, just before the button's own inline
  // onclick runs. Doing it at load time only would not be enough: the client
  // restores a previously chosen login mode from storage after we run, and a
  // visitor who once used the full client on this origin would otherwise
  // connect as themselves from inside the embedded viewer.
  function armLoginGuard() {
    document.addEventListener('click', function (ev) {
      const el = ev.target && ev.target.closest && ev.target.closest('#s-connect .btn-primary');
      if (el) forceGuestLogin();
    }, true);
  }

  // The nickname is only known once the guest login round-trip has completed,
  // and the client emits no event for it. A one-second poll that writes only
  // when the value actually changed is cheaper — and far less brittle — than
  // observing the whole header for mutations.
  window.addEventListener('DOMContentLoaded', function () {
    stampVersion();
    syncIdentity();
    setInterval(syncIdentity, 1000);
    armLoginGuard();
    forceGuestLogin();
    initLiveLobby();
    initLiveChatPane();
  });
}
