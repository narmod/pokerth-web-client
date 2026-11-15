// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The mini-games' title screen — one template for every game (narmod
// 2026-11-15, web.55: « like Ace Dash or Poker Run: a dark picture of the
// game and the choices over it; a common model, so that a new game is easy
// to add »).
//
//   titleScreen(shell, {
//     id,          the game's id: without a live scene, its cover picture
//                  (art.mjs) is the dark backdrop
//     live,        true: the game draws its own scene under the panel
//     name, hint,  the title and a line of help (plain text)
//     modes,       [{ icon, label, desc, rec }]: one tile per way to play
//                  (a single tile for a game with one mode), rec = the
//                  record line (plain text, '' for none)
//     sel,         the tile lit for the keyboard
//     options,     [{ id, label, on, off, key }]: a row of chips under the
//                  tiles (a switch, a rule…), optional
//     foot,        an HTML footnote (escaped by the caller), optional
//     onPick(i),   a tile was tapped: play mode i
//     onOption(id) a chip was tapped
//   })
//
//   titleStep(a, sel, n) — the keys of the title: ←/→ move between the
//   tiles (a new index), Space / Enter play ('start'), anything else null.
//
// A new game: give its modes (and a cover in art.mjs) — that is all.
// ═══════════════════════════════════════════════════════════════════

import { art } from './art.mjs';

export function titleScreen(shell, o) {
  const { esc } = shell;
  const tile = (m, i) => '<button type="button" class="gm-tile' + (i === o.sel ? ' on' : '') + '" data-m="' + i + '"><i>' + m.icon + '</i><b>'
    + esc(m.label) + '</b><small>' + esc(m.desc || '') + '</small><small class="gm-rec">' + (m.rec ? esc(m.rec) : '&nbsp;') + '</small></button>';
  const opt = (x) => '<button type="button" class="gm-opt' + (x.on ? ' on' : '') + '" data-o="' + esc(x.id) + '"' + (x.off ? ' disabled' : '') + '>'
    + esc(x.label) + (x.key ? '<i class="gm-k">' + esc(x.key) + '</i>' : '') + '</button>';
  shell.panel('<h2>' + esc(o.name) + '</h2>' + (o.hint ? '<p class="gm-hint">' + esc(o.hint) + '</p>' : '')
    + '<div class="gm-tiles' + (o.modes.length > 3 ? ' gm-many' : '') + '">' + o.modes.map(tile).join('') + '</div>'
    + (o.options && o.options.length ? '<div class="gm-opts">' + o.options.map(opt).join('') + '</div>' : '')
    + (o.foot ? '<p class="pg-dim gm-foot">' + o.foot + '</p>' : ''));
  const panel = /** @type {HTMLElement|null} */ (shell.root.querySelector('.pg-panel'));
  if (!panel) return;
  // The dark picture of the game: its cover, or its own scene (live).
  panel.classList.add('gm-title');
  if (!o.live && o.id) {
    let bg = /** @type {HTMLElement|null} */ (panel.querySelector(':scope > .gm-bg'));
    if (!bg) { bg = document.createElement('div'); bg.className = 'gm-bg'; panel.appendChild(bg); }
    const light = !!(shell.theme && shell.theme.light);
    if (bg.getAttribute('data-k') !== o.id + (light ? 'l' : 'd')) {
      bg.innerHTML = art(o.id, light).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
      bg.setAttribute('data-k', o.id + (light ? 'l' : 'd'));
    }
  }
  panel.querySelectorAll('.gm-tile').forEach((b) => {
    b.addEventListener('pointerdown', (e) => e.stopPropagation());
    b.addEventListener('click', (e) => { e.stopPropagation(); if (!shell.paused) o.onPick(+(b.getAttribute('data-m') || 0)); });
  });
  panel.querySelectorAll('.gm-opt').forEach((b) => {
    b.addEventListener('pointerdown', (e) => e.stopPropagation());
    b.addEventListener('click', (e) => { e.stopPropagation(); if (!shell.paused && o.onOption) o.onOption(b.getAttribute('data-o') || ''); });
  });
}

/** The title's keys: ←/→ a new tile index, Space / Enter 'start', else null. */
export function titleStep(a, sel, n) {
  if (a === 'left') return (sel + n - 1) % n;
  if (a === 'right') return (sel + 1) % n;
  if (a === 'jump') return 'start';
  return null;
}
