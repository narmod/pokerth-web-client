// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/game/seat-top-clamp.mjs — keep the top seats inside the
// table zone.
//
// The landscape ring is the QML geometry (layout.mjs, STRICT QML): the top
// slot centre is half a BASE box below the zone top, so a box exactly as tall
// as the QML base (84 + 20 socle) touches the top edge. The web box is a few
// pixels taller than that base on desktop (108 for 104, plus the plate border
// above the seat): in a short desktop window (landscape compact, under 600 px
// tall, no touch) the top box went 2 to 4 px under the info bar (found by
// scripts/test-screen-matrix.mjs at 900x599, 960x560, 1100x599). On phones the
// web box is smaller than the base and stays inside.
//
// WEB ADJUSTMENT, geometry untouched: after the seats are in the DOM, a seat
// whose plate starts above the zone is moved down by exactly that overshoot.
// Pure DOM pass, idempotent (it only ever moves a seat that is out, by the
// amount it is out; renderSeats writes every position again on the next
// render). Skipped while the loupe magnifies the table: seats then leave the
// visible zone on purpose.
// ─────────────────────────────────────────────────────────────────────────

const TOL = 0.5;

/**
 * @param {HTMLElement} seatsEl  #g-seats
 * @param {HTMLElement} zoneEl   #g-table-zone
 * @returns {number} seats moved
 */
export function clampSeatsTop(seatsEl, zoneEl) {
  if (!seatsEl || !zoneEl || typeof seatsEl.querySelectorAll !== 'function') return 0;
  const layer = document.getElementById('g-zoom-layer');
  let scale = 1;
  if (layer && layer.offsetWidth) scale = layer.getBoundingClientRect().width / layer.offsetWidth;
  if (!(scale > 0.99 && scale < 1.01)) return 0;
  const top = zoneEl.getBoundingClientRect().top;
  let moved = 0;
  seatsEl.querySelectorAll('.seat:not(.seat-ghost)').forEach(function (seat) {
    const s = /** @type {HTMLElement} */ (seat);
    const plate = s.querySelector('.seat-plate') || s;
    const over = top - plate.getBoundingClientRect().top;
    if (over <= TOL) return;
    const cur = parseFloat(s.style.top);
    if (!isFinite(cur)) return;
    s.style.top = (cur + over).toFixed(1) + 'px';
    moved++;
  });
  return moved;
}
