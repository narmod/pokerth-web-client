// @ts-check
// ── ctl-menu.mjs — the controller menu (Start on a gamepad) ─────────────────
//
// WEB ADDITION. A grid of large tiles for everything a controller cannot
// reach quickly: at the table Resume · Chat · History · Odds · Statistics ·
// Reactions · Poker hands · Ace's Help · Settings · Fullscreen · Buttons ·
// Quit; elsewhere Resume · Ace's Help · Settings · Fullscreen · Buttons.
// Device-agnostic: opened by ui/ctl-nav.mjs ('menu' action), so a TV remote
// adapter gets it for free. It is a keynav surface (registerOverlay): Escape,
// Android Back and the controller's back button close it, and it forces
// navigation mode while open. "Buttons" shows the controls of the current
// device, given by the adapter (ctl.setKeysHelp).

import { registerOverlay } from './keynav.mjs';

function t(key, params) {
  return (typeof window !== 'undefined' && window.t) ? window.t(key, params) : key;
}
function call(fn) {
  return function () {
    var parts = fn.split('.'), cur = window;
    for (var i = 0; i < parts.length && cur; i++) cur = cur[parts[i]];
    if (typeof cur === 'function') { try { cur.apply(null, arguments); } catch (e) {} }
  };
}

var el = null, unreg = null, keysHelp = null;

function inGame() {
  var s = document.querySelector('.screen.active');
  return !!(s && s.id === 's-game');
}

// Tiles of the current context. run(ctl) happens after the menu closed.
function tiles() {
  var out = [{ id: 'resume', ic: '▶', label: t('padMenuResume'), run: function () {} }];
  if (inGame()) {
    out.push(
      { id: 'chat', ic: '💬', label: t('chatTooltip'), run: function (ctl) { ctl.do('chat'); } },
      { id: 'log', ic: '📜', label: t('gipTabLog'), run: function (ctl) { call('gipOpenTab')('log'); ctl.focusZone('g-log-panel'); } },
      { id: 'odds', ic: '🎲', label: t('gipTabOdds'), run: function (ctl) { call('gipOpenTab')('odds'); ctl.focusZone('g-log-panel'); } },
      { id: 'stats', ic: '📊', label: t('gipTabStats'), run: function () { call('toggleStats')(); } },
      { id: 'react', ic: '😀', label: t('reactionsLabel'), run: function (ctl) { call('toggleReactionPanel')(); ctl.focusZone('g-reaction-panel'); } },
      { id: 'hands', ic: '🃏', label: t('handsHelpTooltip'), run: function (ctl) { call('toggleHandsHelp')(); ctl.focusZone('hands-overlay'); } }
    );
  }
  if (typeof window.guideToggle === 'function' && document.body.classList.contains('guide-avail')) {
    out.push({ id: 'ace', ic: 'A♠', label: t('guideBtn'), run: function (ctl) { ctl.aceOpen(); } });
  }
  out.push(
    { id: 'options', ic: '⚙', label: t('advTitle'), run: function () { call('toggleAdvancedOptions')(); } },
    { id: 'fullscreen', ic: '⛶', label: t('fullscreenTooltip'), run: function () { call('toggleFullscreen')(); } },
    { id: 'keys', ic: '🎮', label: t('padMenuKeys'), keep: true, run: function () { showKeys(); } }
  );
  if (inGame()) out.push({ id: 'quit', ic: '🚪', label: t('quitTooltip'), run: function () { call('App.confirmLeaveGame')(); } });
  return out;
}

function build() {
  el = document.createElement('div');
  el.id = 'ctl-menu';
  el.className = 'ctl-menu';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.style.display = 'none';
  el.innerHTML = '<div class="ctl-menu-card"><div class="ctl-menu-title"></div>' +
    '<div class="ctl-menu-grid"></div><div class="ctl-menu-keys" hidden></div></div>';
  el.addEventListener('click', function (e) { if (e.target === el) closeMenu(); });
  document.body.appendChild(el);
}

function showKeys() {
  var k = el.querySelector('.ctl-menu-keys');
  var lines = typeof keysHelp === 'function' ? keysHelp() : [];
  k.textContent = '';
  lines.forEach(function (line) {
    var p = document.createElement('p');
    p.textContent = line;
    k.appendChild(p);
  });
  k.hidden = !k.hidden;
}

export function isOpen() { return !!(el && el.style.display !== 'none'); }

export function openMenu(ctl) {
  if (!el) build();
  el.querySelector('.ctl-menu-title').textContent = t('padMenuTitle');
  var grid = el.querySelector('.ctl-menu-grid');
  grid.textContent = '';
  el.querySelector('.ctl-menu-keys').hidden = true;
  tiles().forEach(function (tile, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ctl-tile';
    b.setAttribute('data-act', tile.id);
    if (i === 0) b.setAttribute('data-kn-focus', '');
    var ic = document.createElement('span');
    ic.className = 'ctl-tile-ic';
    ic.setAttribute('aria-hidden', 'true');
    ic.textContent = tile.ic;
    var lb = document.createElement('span');
    lb.className = 'ctl-tile-lbl';
    lb.textContent = tile.label;
    b.appendChild(ic); b.appendChild(lb);
    b.addEventListener('click', function () {
      if (tile.keep) { tile.run(ctl); return; }
      closeMenu();
      setTimeout(function () { tile.run(ctl); }, 0);
    });
    grid.appendChild(b);
  });
  el.style.display = '';
  if (!unreg) unreg = registerOverlay(el, closeMenu);
}

export function closeMenu() {
  if (!el) return;
  el.style.display = 'none';
  if (unreg) { unreg(); unreg = null; }
}

export function toggleMenu(ctl) { if (isOpen()) closeMenu(); else openMenu(ctl); }

// The adapter of the device in use describes its controls (one line each).
export function setKeysHelp(fn) { keysHelp = fn; }
