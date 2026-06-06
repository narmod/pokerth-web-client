// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/theme.mjs — Palette (colour-theme) picker.
//
// Independent "Palette" axis of the theming system. A palette = a set of
// values for the CSS custom properties defined in pokerth.css. "Casino vert"
// is the default and lives in :root (no attribute); every other palette is a
// `:root[data-theme="<id>"]{…}` block in pokerth.css. Switching = toggling
// that one attribute on <html>, so there is zero flash (a tiny inline boot
// snippet in <head> applies the saved palette before first paint) and zero
// risk to the pokerth.js monolith (this module is fully self-contained and
// only talks to the DOM + localStorage).
//
// TO ADD A PALETTE: add a `:root[data-theme="<id>"]{…}` block in pokerth.css
// and one entry in PALETTES below (+ its label key in lang/en.mjs & fr.mjs).
// Nothing else changes — exactly like adding a language catalogue.
// ─────────────────────────────────────────────────────────────────────────

const STORE_KEY = 'pth_theme';

// Registry. id '' = the default (:root, "Casino vert") → no data-theme attr.
// `key` is an i18n key (falls back to English, then to `fallback`).
// `swatch` is the dot shown in the menu (a representative felt colour).
const PALETTES = [
  { id: '',     key: 'themeGreen', fallback: 'Green casino', swatch: '#1e3820' },
  { id: 'dark', key: 'themeDark',  fallback: 'Dark',         swatch: '#232730' },
];

function _label(p) {
  try {
    if (typeof window.t === 'function') {
      var s = window.t(p.key);
      if (s && s !== p.key) return s;
    }
  } catch (e) {}
  return p.fallback;
}

function getTheme() {
  try { return localStorage.getItem(STORE_KEY) || ''; } catch (e) { return ''; }
}

// Apply a palette id to <html> and persist it. Idempotent.
function applyTheme(id) {
  var el = document.documentElement;
  if (id) el.setAttribute('data-theme', id);
  else el.removeAttribute('data-theme');
  try {
    if (id) localStorage.setItem(STORE_KEY, id);
    else localStorage.removeItem(STORE_KEY);
  } catch (e) {}
}

// Public: switch palette (used by the menu rows).
function setTheme(id) {
  applyTheme(id);
  closeThemeMenu();
}

// ─── Palette picker menu (cloned from the language menu for consistency) ───
function _themeMenuEsc(e) { if (e.key === 'Escape') closeThemeMenu(); }

function closeThemeMenu() {
  try { document.removeEventListener('keydown', _themeMenuEsc); } catch (e) {}
  ['theme-menu', 'theme-menu-overlay'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  });
}

function openThemeMenu(ev) {
  try { if (ev && ev.stopPropagation) ev.stopPropagation(); } catch (e) {}
  closeThemeMenu();
  if (PALETTES.length < 2) return; // nothing to choose
  var cur = getTheme();

  var overlay = document.createElement('div');
  overlay.id = 'theme-menu-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;background:transparent';
  overlay.addEventListener('click', closeThemeMenu);

  var menu = document.createElement('div');
  menu.id = 'theme-menu';
  menu.setAttribute('role', 'menu');
  menu.style.cssText = 'position:fixed;z-index:9999;min-width:165px;max-height:60vh;overflow:auto;'
    + 'background:var(--panel,#0d1f10);border:1px solid var(--gold-dim,rgba(200,168,74,0.45));'
    + 'border-radius:8px;padding:5px;box-shadow:0 12px 32px rgba(0,0,0,0.6)';

  PALETTES.forEach(function (p) {
    var active = (p.id === cur);
    var row = document.createElement('button');
    row.type = 'button';
    row.setAttribute('role', 'menuitemradio');
    row.setAttribute('aria-checked', active ? 'true' : 'false');
    row.dataset.theme = p.id;
    row.style.cssText = 'display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;'
      + 'padding:8px 12px;margin:0;border:0;cursor:pointer;text-align:left;border-radius:6px;'
      + 'font-size:0.9rem;line-height:1.1;color:var(--cream,#f0e6d2);background:'
      + (active ? 'var(--gold-dim,rgba(200,168,74,0.18))' : 'transparent');
    row.innerHTML = '<span style="display:inline-flex;width:18px;height:18px;flex:none;border-radius:50%;'
      + 'border:1px solid rgba(255,255,255,0.35);background:' + p.swatch + '"></span>'
      + '<span style="flex:1">' + _label(p) + '</span>'
      + (active ? '<span style="color:var(--gold,#c8a84a)">\u2713</span>' : '');
    if (!active) {
      row.addEventListener('mouseenter', function () { row.style.background = 'rgba(255,255,255,0.06)'; });
      row.addEventListener('mouseleave', function () { row.style.background = 'transparent'; });
    }
    row.addEventListener('click', function (e) { e.stopPropagation(); setTheme(p.id); });
    menu.appendChild(row);
  });

  document.body.appendChild(overlay);
  document.body.appendChild(menu);

  // Position below the anchor, clamped to the viewport; center if the anchor
  // is missing/hidden (e.g. opened from a mobile overflow item).
  var vw = window.innerWidth || 360, vh = window.innerHeight || 640;
  var mw = menu.offsetWidth || 180, mh = menu.offsetHeight || 220;
  var anchor = ev && (ev.currentTarget || ev.target);
  var r = null;
  try { if (anchor && anchor.getBoundingClientRect) r = anchor.getBoundingClientRect(); } catch (e) {}
  var top, left;
  if (r && r.width && r.height) {
    top = r.bottom + 6;
    left = r.left;
    if (top + mh > vh - 8) top = r.top - mh - 6; // flip above if no room below
  } else {
    top = (vh - mh) / 2;
    left = (vw - mw) / 2;
  }
  menu.style.left = Math.max(8, Math.min(left, vw - mw - 8)) + 'px';
  menu.style.top = Math.max(8, Math.min(top, vh - mh - 8)) + 'px';

  document.addEventListener('keydown', _themeMenuEsc);
}

// Apply the saved palette on load (idempotent with the <head> boot snippet).
try { applyTheme(getTheme()); } catch (e) {}

// ─── Exports + legacy global compatibility (HTML inline handlers) ───
export { PALETTES, getTheme, setTheme, applyTheme, openThemeMenu, closeThemeMenu };
window.openThemeMenu = openThemeMenu;
window.closeThemeMenu = closeThemeMenu;
window.setTheme = setTheme;
window.getTheme = getTheme;
window.THEME = { PALETTES, getTheme, setTheme, applyTheme, openThemeMenu, closeThemeMenu };
