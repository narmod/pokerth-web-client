// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/game/puck-dodge.mjs — keep D / SB / BB pucks (and side bet
// chips) off the neighbouring boxes.
//
// renderSeats picks the side of a seat's pucks from its column alone (QML
// betSide: portrait left column -> right of the box, right column -> left,
// top-centre -> below). That is right whenever the boxes leave room - but the
// box scale is a bisection that only tests NEIGHBOURS on the ring: with 3 or 5
// opponents in portrait (TL · TC · TR), TL and TR are not neighbours, grow
// until they almost touch, and both push their puck into the 40 px gap between
// them: BB over the other box, D hidden under BB; the top-centre puck lands on
// the corner of TR. Found by scripts/test-table-sweep.mjs (4 and 6 players,
// seated and spectator, every portrait phone).
//
// WEB ADJUSTMENT, geometry untouched: after the seats are in the DOM, a seat
// whose puck group collides is moved to the first free side of a short list
// (the default side always comes first, so nothing changes where there is
// room). Pure DOM pass, idempotent: it always restarts from the side chosen by
// renderSeats (kept in data-bs0), so patched and rebuilt seats end up alike.
// ─────────────────────────────────────────────────────────────────────────

const SIDES = ['l', 'r', 't', 'b', 'split'];
// Fallbacks per default side. A column seat never tries the screen-edge side;
// the top-centre seat never tries 'above' first (it sits against the zone top).
const ORDER = { r: ['r', 'b', 't'], l: ['l', 'b', 't'], b: ['b', 'split', 't'], t: ['t', 'split', 'b'], split: ['split'] };
const TOL = 2;

function sideOf(seat) {
  for (const s of SIDES) if (seat.classList.contains('betside-' + s)) return s;
  return '';
}
function setSide(seat, side) {
  for (const s of SIDES) seat.classList.toggle('betside-' + s, s === side);
}
function rectOf(e) {
  const r = e.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
}
function hit(a, b) {
  return a.left < b.right - TOL && b.left < a.right - TOL && a.top < b.bottom - TOL && b.top < a.bottom - TOL;
}
// The pieces a side moves: the puck container and a bet chip shown beside the
// box (a bet inside the inset socle belongs to the box, not to the side).
function pieces(seat) {
  const out = [];
  seat.querySelectorAll('.seat-pucks, .seat-bet').forEach(function (e) {
    if (e.classList.contains('seat-bet') && e.closest('.seat-bet-socle')) return;
    const r = rectOf(e);
    if (r.width > 1 && r.height > 1) out.push(r);
  });
  return out;
}

/**
 * @param {HTMLElement} seatsEl  #g-seats
 * @param {HTMLElement} zoneEl   #g-table-zone
 */
export function dodgePucks(seatsEl, zoneEl) {
  if (!seatsEl || !zoneEl || typeof seatsEl.querySelectorAll !== 'function') return 0;
  const seats = Array.prototype.filter.call(seatsEl.querySelectorAll('.seat'), function (s) {
    return !s.classList.contains('seat-ghost') && !s.classList.contains('me');
  });
  if (seats.length < 2) return 0;
  // 1) back to the side renderSeats chose (writes only).
  seats.forEach(function (s) {
    const cur = sideOf(s);
    if (!cur) return;
    if (!s.dataset.bs0) s.dataset.bs0 = cur;
    else if (s.dataset.bs0 !== cur) setSide(s, s.dataset.bs0);
  });
  // 2) obstacles (reads only): every box, the community slots, the zone.
  const zone = rectOf(zoneEl);
  const plates = Array.prototype.map.call(seatsEl.querySelectorAll('.seat:not(.seat-ghost)'), function (s) {
    return { seat: s, rect: rectOf(s.querySelector('.seat-plate') || s) };
  });
  const slots = Array.prototype.map.call(document.querySelectorAll('#g-comm .pk'), rectOf).filter(function (r) { return r.width > 1; });
  const placed = [];   // pieces of the seats already settled
  const free = function (seat, list) {
    for (const p of list) {
      if (p.left < zone.left - 3 || p.right > zone.right + 3 || p.top < zone.top - 3 || p.bottom > zone.bottom + 3) return false;
      for (const o of plates) if (o.seat !== seat && hit(p, o.rect)) return false;
      for (const c of slots) if (hit(p, c)) return false;
      for (const q of placed) if (hit(p, q)) return false;
    }
    return true;
  };
  // 3) settle the seats one by one; a seat without pucks costs nothing.
  let moved = 0;
  seats.forEach(function (s) {
    const base = s.dataset.bs0 || sideOf(s);
    let list = pieces(s);
    if (!base || !list.length) return;
    if (!free(s, list)) {
      const order = ORDER[base] || [base];
      let done = false;
      for (let i = 1; i < order.length && !done; i++) {
        setSide(s, order[i]);
        const tryList = pieces(s);
        if (free(s, tryList)) { list = tryList; done = true; moved++; }
      }
      if (!done) { setSide(s, base); list = pieces(s); }
    }
    list.forEach(function (p) { placed.push(p); });
  });
  return moved;
}
