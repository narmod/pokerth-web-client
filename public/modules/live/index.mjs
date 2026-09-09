/* Live / embedded spectator mode (/live) — slim header wiring.
 *
 * Loaded only when proxy.js injects the LIVE_BOOT script, so it costs nothing
 * in the normal client. Almost all of live mode is CSS driven by the
 * :root[data-live="1"] attribute; this module only fills the two dynamic bits
 * of the slim header — who we are logged in as, and the build version.
 */

if (window.LIVE_MODE) {
  const VER_IDS = ['live-ver-lobby', 'live-ver-game'];
  let lastName = null;

  function syncIdentity() {
    const name = (window.S && window.S.myName) ? String(window.S.myName) : '';
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

  // The nickname is only known once the guest login round-trip has completed,
  // and the client emits no event for it. A one-second poll that writes only
  // when the value actually changed is cheaper — and far less brittle — than
  // observing the whole header for mutations.
  window.addEventListener('DOMContentLoaded', function () {
    stampVersion();
    syncIdentity();
    setInterval(syncIdentity, 1000);
  });
}
