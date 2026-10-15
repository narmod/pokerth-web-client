// Layout audits shared by the real-browser tests (test-i18n-overflow,
// test-table-sweep, test-screen-matrix). Pure functions: UI_AUDIT runs IN the
// page (page.evaluate(UI_AUDIT, rootSelector)), measureTable reads the table
// geometry, auditTable turns that geometry into a list of problems.
import { overlap } from './mobile-harness.mjs';

// In-page audit of the visible part of `rootSel` (+ the app header).
export const UI_AUDIT = (rootSel) => {
  const root = document.querySelector(rootSel) || document.body;
  const vw = window.innerWidth, out = [];
  const vis = (e) => { const c = getComputedStyle(e), r = e.getBoundingClientRect();
    // closed <details> (header menus) keep their boxes but paint nothing
    const d = e.closest('details:not([open])'); if (d && !e.closest('summary')) return false;
    if (typeof e.checkVisibility === 'function' && !e.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true })) return false;
    return c.display !== 'none' && c.visibility !== 'hidden' && parseFloat(c.opacity) > 0.05 && r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight && r.right > 2 && r.left < vw - 2; };   // panes of the mobile lobby pager sit fully off-screen on purpose
  const hiddenUp = (e) => { for (let p = e; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden') return true; } return false; };
  const scrollsX = (e) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth + 1) return true; } return false; };
  const ownText = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const name = (e) => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : '')) + (e.getAttribute('data-i18n') ? '[' + e.getAttribute('data-i18n') + ']' : '');
  const NOT_I18N = '.seat-name, .seat-money, .pb-name, .game-name, .gname, .player-name, .chat-line, .chat-msg, #g-title, .wc-name, input, textarea, .log-line, .notice-body';
  const STRICT = 'button, .btn-action, [role="tab"], .tab, h1, h2, h3, .login-card, .lc-t, .mode-seg-btn, .screen-title, select';
  const scope = [...root.querySelectorAll('*'), ...document.querySelectorAll('.header *')];
  const seen = new Set(), texts = [];
  // Rectangles of the PAINTED text, one per line (a wrapped inline link is two small boxes, not one big
  // one covering its neighbours), each cut by every box that clips it (an ellipsised name reports its
  // full unclipped width otherwise).
  const clipBy = (e, q) => { const r = { left: q.left, top: q.top, right: q.right, bottom: q.bottom };
    for (let p = e; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (c.overflowX === 'visible' && c.overflowY === 'visible') continue; const b = p.getBoundingClientRect();
      if (c.overflowX !== 'visible') { r.left = Math.max(r.left, b.left); r.right = Math.min(r.right, b.right); } if (c.overflowY !== 'visible') { r.top = Math.max(r.top, b.top); r.bottom = Math.min(r.bottom, b.bottom); } }
    return r; };
  const textRects = (e) => { const rg = document.createRange(); rg.selectNodeContents(e); let q = [...rg.getClientRects()].filter((r) => r.width > 1 && r.height > 1); if (!q.length) q = [e.getBoundingClientRect()]; return q.map((r) => clipBy(e, r)); };
  const boxRects = (e) => (getComputedStyle(e).display === 'inline' ? [...e.getClientRects()] : [e.getBoundingClientRect()]).map((r) => clipBy(e.parentElement || e, r));
  const cross = (A, B) => { let best = null; for (const a of A) for (const b of B) { const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (w > 3 && h > 3 && (!best || w * h > best[0] * best[1])) best = [w, h]; } return best; };
  for (const e of scope) {
    if (seen.has(e)) continue; seen.add(e);
    if (e.closest(NOT_I18N) || !vis(e) || hiddenUp(e)) continue;
    const txt = ownText(e); if (txt.length < 2) continue;
    const c = getComputedStyle(e), r = e.getBoundingClientRect();
    texts.push({ e, r: textRects(e), txt });
    const dx = e.scrollWidth - e.clientWidth, dy = e.scrollHeight - e.clientHeight;
    const cutX = dx > 1 && c.overflowX !== 'visible', cutY = dy > 2 && c.overflowY !== 'visible' && c.overflowY !== 'auto' && c.overflowY !== 'scroll';
    // An ellipsis is fine on a secondary description (.lc-d), never on a button, a tab or a title.
    const strict = !e.matches('.lc-d') && (e.matches(STRICT) || !!e.closest('button, .btn-action, [role="tab"], .lc-t'));
    if (cutX && (c.textOverflow !== 'ellipsis' || strict)) out.push({ kind: 'clipped', el: name(e), text: txt.slice(0, 40), by: Math.round(dx) + 'px' + (c.textOverflow === 'ellipsis' ? ' (…)' : '') });
    else if (cutY) out.push({ kind: 'clipped', el: name(e), text: txt.slice(0, 40), by: Math.round(dy) + 'px tall' });
    // text spilling OUT of a button-like box whose overflow is visible
    const box = e.closest('button, .btn-action, .login-card, .mode-seg-btn, [role="tab"]');
    if (box && box !== e) { const b = box.getBoundingClientRect(); if (r.right > b.right + 2 || r.left < b.left - 2) out.push({ kind: 'spills', el: name(e) + ' out of ' + name(box), text: txt.slice(0, 40), by: Math.round(Math.max(r.right - b.right, b.left - r.left)) + 'px' }); }
    if ((r.right > vw + 1 || r.left < -1) && !scrollsX(e)) out.push({ kind: 'off-screen', el: name(e), text: txt.slice(0, 40), by: Math.round(Math.max(r.right - vw, -r.left)) + 'px' });
  }
  // overlaps between controls / titles of the same screen
  const ctl = [...root.querySelectorAll('button, select, input, a[href], .login-card, h1, h2, h3, .screen-title'), ...document.querySelectorAll('.header button, .header h1, .header .title, #g-title')]
    .filter((e, i, a) => a.indexOf(e) === i && vis(e) && !hiddenUp(e));

  for (let i = 0; i < ctl.length; i++) for (let j = i + 1; j < ctl.length; j++) {
    const a = ctl[i], b = ctl[j]; if (a.contains(b) || b.contains(a)) continue;
    const x = cross(boxRects(a), boxRects(b));
    if (x) out.push({ kind: 'overlap', el: name(a) + ' x ' + name(b), text: (ownText(a) || ownText(b)).slice(0, 30), by: Math.round(x[0]) + 'x' + Math.round(x[1]) + 'px' });
  }
  // a label lying over (or under) a control it does not belong to - e.g. a screen title across the header icons
  for (const t of texts) for (const k of ctl) {
    if (k === t.e || k.contains(t.e) || t.e.contains(k)) continue;
    const x = cross(t.r, boxRects(k));
    if (x) out.push({ kind: 'overlap', el: name(t.e) + ' x ' + name(k), text: t.txt.slice(0, 30), by: Math.round(x[0]) + 'x' + Math.round(x[1]) + 'px' });
  }
  const over = document.documentElement.scrollWidth - vw;
  if (over > 1) out.push({ kind: 'page', el: 'document', text: '', by: over + 'px wider than the screen' });
  return out;
};

export const measureTable = (page) => page.evaluate(() => {
  const VR = window.__pthVisualRect || ((e) => e.getBoundingClientRect());   // drawn box under CSS zoom (mobile-harness installVisualRect)
  const rect = (e) => { const r = VR(e); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  const vis = (e) => { if (!e) return false; const c = getComputedStyle(e), r = e.getBoundingClientRect();
    return c.display !== 'none' && c.visibility !== 'hidden' && parseFloat(c.opacity) > 0.05 && r.width > 1 && r.height > 1; };
  const seats = [...document.querySelectorAll('#g-seats .seat:not(.seat-ghost)')];
  const me = document.querySelector('#g-seats .seat.me');
  return {
    viewport: { width: innerWidth, height: innerHeight },
    overflowX: document.documentElement.scrollWidth - innerWidth,
    zone: rect(document.getElementById('g-table-zone')),
    plates: seats.map((s) => ({ name: (s.querySelector('.seat-name') || {}).textContent || s.getAttribute('data-pid'), me: s.classList.contains('me'), ...rect(s.querySelector('.seat-plate') || s) })),
    me: me ? rect(me.querySelector('.seat-plate') || me) : null,
    slots: [...document.querySelectorAll('#g-comm .pk')].filter(vis).map(rect),
    pot: vis(document.getElementById('g-potbar')) ? rect(document.getElementById('g-potbar')) : null,
    pucks: [...document.querySelectorAll('#g-seats .seat-pucks > *, #g-seats .seat-bet')].filter(vis).map((e) => ({ owner: seats.indexOf(e.closest('.seat')), kind: e.classList.contains('seat-bet') ? 'bet chip' : 'puck', ...rect(e) })),
    floating: ['chat-toggle-btn', 'react-toggle-btn', 'hands-toggle-btn', 'log-toggle-btn', 'g-zoom-toggle'].map((id) => document.getElementById(id)).filter(vis).map((e) => ({ id: e.id, ...rect(e) })),
    actionBar: vis(document.querySelector('.my-zone')) ? rect(document.querySelector('.my-zone')) : null,
    actions: [...document.querySelectorAll('.act-buttons-row .btn-action')].filter(vis).length,
    dbg: (function () { const d = window._seatDbg || {}, m = d.dims || {}; return `zone ${d.zone} - box ${m.w}x${m.h} self ${m.sh} - scale ${d.boxScale} - comm ${d.commScale && d.commScale.toFixed ? d.commScale.toFixed(2) : d.commScale}` + ['.my-zone .bet-row', '.my-zone .mid-row', '.my-zone .act-buttons-row'].map((q) => { const e = document.querySelector(q); if (!e) return ''; const r = VR(e); return ` - ${q.split(' .')[1]} ${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.left)},${Math.round(r.top)}`; }).join(''); })(),
  };
});

export function auditTable(g, n, spectator) {
  const problems = [];
  const inZone = (r, pad = 2) => r.left >= g.zone.left - pad && r.right <= g.zone.right + pad && r.top >= g.zone.top - pad && r.bottom <= g.zone.bottom + pad;
  const who = (p) => (p.me ? 'self box' : p.name);
  if (g.plates.length !== n) problems.push(`${g.plates.length} seats drawn instead of ${n}`);
  if (g.overflowX > 1) problems.push(`page overflows horizontally by ${g.overflowX}px`);
  g.plates.forEach((p) => { if (!inZone(p)) problems.push(`${who(p)} leaves the table zone (${Math.round(p.left)},${Math.round(p.top)} - ${Math.round(p.right)},${Math.round(p.bottom)} / zone ${Math.round(g.zone.left)},${Math.round(g.zone.top)} - ${Math.round(g.zone.right)},${Math.round(g.zone.bottom)})`); });
  for (let i = 0; i < g.plates.length; i++) for (let j = i + 1; j < g.plates.length; j++)
    if (overlap(g.plates[i], g.plates[j], 2)) problems.push(`${who(g.plates[i])} overlaps ${who(g.plates[j])}`);
  if (g.slots.length !== 5) problems.push(`${g.slots.length} community slots visible instead of 5`);
  g.slots.forEach((c, i) => { if (!inZone(c, 1)) problems.push(`community card ${i + 1} leaves the zone`);
    g.plates.forEach((p) => { if (overlap(c, p, 2)) problems.push(`${who(p)} covers community card ${i + 1}`); }); });
  if (g.pot) g.plates.forEach((p) => { if (overlap(g.pot, p, 2)) problems.push(`${who(p)} covers the pot badge`); });
  g.floating.forEach((f) => g.plates.forEach((p) => { if (overlap(f, p, 3)) problems.push(`${who(p)} sits under the ${f.id} button`); }));
  g.pucks.forEach((k) => {
    const owner = g.plates[k.owner] ? who(g.plates[k.owner]) : '?';
    if (!inZone(k, 3)) problems.push(`the ${k.kind} of ${owner} leaves the zone`);
    g.plates.forEach((p, i) => { if (i !== k.owner && overlap(k, p, 4)) problems.push(`the ${k.kind} of ${owner} covers ${who(p)}`); });
    g.slots.forEach((c, i) => { if (overlap(k, c, 4)) problems.push(`the ${k.kind} of ${owner} covers community card ${i + 1}`); });
  });
  if (spectator) {
    if (g.me) problems.push('a self box is drawn in spectator mode');
    if (g.actions) problems.push('action buttons are shown to a spectator');
  } else {
    if (!g.me) problems.push('no self box');
    else {
      const mid = (g.me.left + g.me.right) / 2, cx = g.zone.left + g.zone.width / 2;
      if (Math.abs(mid - cx) > 2) problems.push(`self box not centred (${mid.toFixed(1)} vs ${cx.toFixed(1)})`);
      if (g.actionBar && overlap(g.me, g.actionBar, 1)) problems.push('self box is covered by the action bar');
    }
  }
  return [...new Set(problems)];
}
