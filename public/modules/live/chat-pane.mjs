/* Live / embedded spectator mode — lobby chat as a resizable bottom strip.
 *
 * The chat itself is the client's own #lobby-chat-panel: this module docks
 * that node under the table list instead of building a second chat, so the
 * message rendering, emoji picker, i18n and send path stay exactly the ones
 * the full client uses. Only the placement and the height change.
 *
 * The dock has to be re-asserted, not just set once: pokerth.js has a
 * reparent() that appends #lobby-chat-panel back into .lobby-grid whenever the
 * lobby re-lays itself out. Setting the parent once left the strip empty as
 * soon as that ran, so keepDocked() is called again on every repaint of the
 * table list and on resize.
 *
 * The height lives in --live-chat-h on the container and is persisted, so a
 * visitor who shrinks the strip keeps it across visits.
 */

const KEY = 'pth_live_chat_h';
const MIN = 110;
const MAX_RATIO = 0.6;   // never let the chat eat more than 60% of the lobby

function clampHeight(px, hostHeight) {
  const wanted = Math.max(MIN, Math.round(px));
  // Before first layout — and in any environment that reports no height —
  // clientHeight is 0. Applying the ratio cap then would pin the strip to the
  // floor, so only the floor applies until a real height is known.
  if (!hostHeight) return wanted;
  return Math.min(Math.max(MIN, Math.round(hostHeight * MAX_RATIO)), wanted);
}

function applyHeight(host, px) {
  host.style.setProperty('--live-chat-h', clampHeight(px, host.clientHeight) + 'px');
}

function storedHeight() {
  try {
    const v = parseInt(window.localStorage.getItem(KEY), 10);
    if (v > 0) return v;
  } catch (e) {}
  return 200;
}

function persist(px) {
  try { window.localStorage.setItem(KEY, String(Math.round(px))); } catch (e) {}
}

function currentHeight(host) {
  const v = parseInt(host.style.getPropertyValue('--live-chat-h'), 10);
  return v > 0 ? v : storedHeight();
}

// Put the chat back in the strip if anything moved it. Cheap: one identity
// comparison when nothing has changed.
export function keepDocked() {
  const side = document.getElementById('live-chat-side');
  const panel = document.getElementById('lobby-chat-panel');
  if (side && panel && panel.parentNode !== side) side.appendChild(panel);
}

function armDrag(host, grip) {
  let dragging = false;

  function move(clientY) {
    // The strip is at the bottom, so its height is the distance from the
    // pointer to the bottom edge of the lobby.
    const rect = host.getBoundingClientRect();
    applyHeight(host, rect.bottom - clientY);
  }

  function down(ev) {
    dragging = true;
    grip.classList.add('dragging');
    try { grip.setPointerCapture(ev.pointerId); } catch (e) {}
    ev.preventDefault();
  }
  function up(ev) {
    if (!dragging) return;
    dragging = false;
    grip.classList.remove('dragging');
    try { grip.releasePointerCapture(ev.pointerId); } catch (e) {}
    persist(currentHeight(host));
  }

  grip.addEventListener('pointerdown', down);
  grip.addEventListener('pointermove', function (ev) { if (dragging) move(ev.clientY); });
  grip.addEventListener('pointerup', up);
  grip.addEventListener('pointercancel', up);

  // The grip is focusable, so the strip must resize without a pointer too.
  grip.addEventListener('keydown', function (ev) {
    const step = ev.shiftKey ? 48 : 16;
    if (ev.key === 'ArrowUp') { applyHeight(host, currentHeight(host) + step); }
    else if (ev.key === 'ArrowDown') { applyHeight(host, currentHeight(host) - step); }
    else return;
    ev.preventDefault();
    persist(currentHeight(host));
  });

  window.addEventListener('resize', function () {
    applyHeight(host, currentHeight(host));
    keepDocked();
  });
}

export function initLiveChatPane() {
  const host = document.getElementById('live-lobby');
  const grip = document.getElementById('live-chat-resizer');
  if (!host || !grip) return;
  keepDocked();
  applyHeight(host, storedHeight());
  armDrag(host, grip);
}
