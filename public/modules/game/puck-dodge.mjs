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

// ── web.72 (narmod 15/10, 4 players in portrait) ──
// · The pot badge and the winning-hand badge are obstacles too: the fallback
//   below a left-column box dropped the puck straight onto the pot.
// · A side puck that does not fit at its 8 px gap is first SQUEEZED into the
//   gap (centred between its own box and the neighbour, at most half over its
//   own box) before it changes side: TL·TR leave ~45 px for a 40 px puck.
// · When no candidate is free, the one with the least overlap wins (pot and
//   cards weigh 3×), instead of falling back to the default side blindly.
const GAP_VAR = { r: '--seat-bet-gap-r', l: '--seat-bet-gap-l' };
function overlapArea(a, b) {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return (w > TOL && h > TOL) ? w * h : 0;
}
function clearSqueeze(seat) {
  if (!seat.dataset.pg) return;
  delete seat.dataset.pg;
  if (seat.style && typeof seat.style.removeProperty === 'function') {
    seat.style.removeProperty(GAP_VAR.r); seat.style.removeProperty(GAP_VAR.l);
  }
}
// Screen px per local CSS px of this seat (the seat carries scale(boxScale)).
function seatScale(seat, plateRect) {
  const pl = seat.querySelector && seat.querySelector('.seat-plate');
  const ow = pl && pl.offsetWidth;
  return (ow > 0 && plateRect.width > 0) ? plateRect.width / ow : 1;
}
// Centre the side pieces in the gap between the own plate and the first
// obstacle on that side. Returns false when there is no room even half over
// the own box (or no style API).
function squeeze(seat, side, plateRect, obstacles) {
  if (!GAP_VAR[side] || !seat.style || typeof seat.style.setProperty !== 'function') return false;
  const list = pieces(seat);
  if (!list.length) return false;
  let top = Infinity, bottom = -Infinity, w = 0;
  list.forEach(function (p) { if (p.top < top) top = p.top; if (p.bottom > bottom) bottom = p.bottom; if (p.width > w) w = p.width; });
  let edge = side === 'r' ? Infinity : -Infinity;
  obstacles.forEach(function (o) {
    if (o.bottom <= top + TOL || o.top >= bottom - TOL) return;
    if (side === 'r' && o.left >= plateRect.right - TOL && o.left < edge) edge = o.left;
    if (side === 'l' && o.right <= plateRect.left + TOL && o.right > edge) edge = o.right;
  });
  if (!isFinite(edge)) return false;
  const room = side === 'r' ? edge - plateRect.right : plateRect.left - edge;
  const off = Math.max(-w / 2, (room - w) / 2);          // screen px from the plate edge
  const k = seatScale(seat, plateRect);
  seat.style.setProperty(GAP_VAR[side], (off / k).toFixed(1) + 'px');
  seat.dataset.pg = '1';
  return true;
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
    clearSqueeze(s);
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
  // web.72 : pot badge + winning-hand badge (centre of the table) count like the cards.
  Array.prototype.forEach.call(document.querySelectorAll('#g-potbar, #g-win-hand'), function (e) {
    const r = rectOf(e);
    if (r.width > 1 && r.height > 1) slots.push(r);
  });
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
      const plateR = rectOf(s.querySelector('.seat-plate') || s);
      const obst = plates.filter(function (o) { return o.seat !== s; }).map(function (o) { return o.rect; })
        .concat(placed);
      // Overlap cost of the current placement (pot / cards weigh 3×).
      const cost = function (lst) {
        let c = 0;
        lst.forEach(function (p) {
          // Out of the zone is never an option (cut off on screen).
          if (p.left < zone.left - 3 || p.right > zone.right + 3 || p.top < zone.top - 3 || p.bottom > zone.bottom + 3) c += Infinity;
          for (const o of plates) if (o.seat !== s) c += overlapArea(p, o.rect);
          for (const q of placed) c += overlapArea(p, q);
          for (const cs of slots) c += 3 * overlapArea(p, cs);
        });
        return c;
      };
      const tries = [];
      // 1) the default side, squeezed into the gap.
      if (squeeze(s, base, plateR, obst)) tries.push({ side: base, sq: true });
      // 2) the fallback sides, at their normal gap.
      for (let i = 1; i < order.length; i++) tries.push({ side: order[i], sq: false });
      let done = false, best = null;
      for (let i = 0; i < tries.length && !done; i++) {
        const t = tries[i];
        if (!t.sq) clearSqueeze(s);
        setSide(s, t.side);
        if (t.sq && !s.dataset.pg) squeeze(s, base, plateR, obst);
        const tryList = pieces(s);
        if (free(s, tryList)) { list = tryList; done = true; moved++; }
        else { const c = cost(tryList); if (!best || c < best.c) best = { t: t, c: c }; }
      }
      if (!done) {
        // Nothing free: the default side (unsqueezed) competes too, then the
        // placement with the least overlap is kept.
        clearSqueeze(s); setSide(s, base);
        const c0 = cost(pieces(s));
        if (best && best.c < c0) {
          setSide(s, best.t.side);
          if (best.t.sq) squeeze(s, base, plateR, obst);
          if (best.t.side !== base || best.t.sq) moved++;
        }
        list = pieces(s);
      }
    }
    list.forEach(function (p) { placed.push(p); });
  });
  return moved;
}
