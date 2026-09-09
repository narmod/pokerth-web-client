/* Live / embedded spectator mode — lobby chat as a resizable right column.
 *
 * The chat itself is the client's own #lobby-chat-panel: this module moves
 * that node into the right column instead of building a second chat, so the
 * message rendering, emoji picker, i18n and send path stay exactly the ones
 * the full client uses. Only the placement and the width change.
 *
 * The width lives in --live-chat-w on the container and is persisted, so a
 * visitor who narrows the column keeps it across visits.
 */

const KEY = 'pth_live_chat_w';
const MIN = 180;
const MAX_RATIO = 0.6;   // never let the chat eat more than 60% of the lobby

function clampWidth(px, hostWidth) {
  const wanted = Math.max(MIN, Math.round(px));
  // Before first layout — and in any environment that reports no width —
  // clientWidth is 0. Applying the ratio cap then would pin every column to
  // the floor, so only the floor applies until a real width is known.
  if (!hostWidth) return wanted;
  return Math.min(Math.max(MIN, Math.round(hostWidth * MAX_RATIO)), wanted);
}

function applyWidth(host, px) {
  host.style.setProperty('--live-chat-w', clampWidth(px, host.clientWidth) + 'px');
}

function storedWidth() {
  try {
    const v = parseInt(window.localStorage.getItem(KEY), 10);
    if (v > 0) return v;
  } catch (e) {}
  return 320;
}

function persist(px) {
  try { window.localStorage.setItem(KEY, String(Math.round(px))); } catch (e) {}
}

function currentWidth(host) {
  const v = parseInt(host.style.getPropertyValue('--live-chat-w'), 10);
  return v > 0 ? v : storedWidth();
}

function armDrag(host, grip, side) {
  let dragging = false;

  function move(clientX) {
    // The column is on the right, so its width is the distance from the
    // pointer to the right edge of the lobby.
    const rect = host.getBoundingClientRect();
    applyWidth(host, rect.right - clientX);
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
    persist(currentWidth(host));
  }

  grip.addEventListener('pointerdown', down);
  grip.addEventListener('pointermove', function (ev) { if (dragging) move(ev.clientX); });
  grip.addEventListener('pointerup', up);
  grip.addEventListener('pointercancel', up);

  // Keyboard: the grip is focusable, so the column must be resizable without
  // a pointer too.
  grip.addEventListener('keydown', function (ev) {
    const step = ev.shiftKey ? 48 : 16;
    if (ev.key === 'ArrowLeft') { applyWidth(host, currentWidth(host) + step); }
    else if (ev.key === 'ArrowRight') { applyWidth(host, currentWidth(host) - step); }
    else return;
    ev.preventDefault();
    persist(currentWidth(host));
  });

  // Keep the column inside its bounds when the viewport changes.
  window.addEventListener('resize', function () { applyWidth(host, currentWidth(host)); });

  if (side) { /* referenced for clarity; the column sizes itself from the var */ }
}

export function initLiveChatPane() {
  const host = document.getElementById('live-lobby');
  const side = document.getElementById('live-chat-side');
  const grip = document.getElementById('live-chat-resizer');
  if (!host || !side || !grip) return;

  // Reuse the real chat panel rather than cloning it: a clone would receive no
  // messages, since the client appends them to #chat by id.
  const panel = document.getElementById('lobby-chat-panel');
  if (panel && panel.parentNode !== side) side.appendChild(panel);

  applyWidth(host, storedWidth());
  armDrag(host, grip, side);
}
