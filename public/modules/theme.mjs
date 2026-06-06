// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/theme.mjs — Appearance axes (Palette + Tapis).
//
// Independent, orthogonal theming axes. Each axis = an attribute on <html>
// that selects a block of CSS-custom-property overrides in pokerth.css:
//   • Palette  → data-theme  (page bg / panels / text / accents)
//   • Tapis    → data-table  (the playing surface: felt + rail)
// Default (no attribute) = the values in :root, so a fresh client is
// unchanged. Switching = toggling one attribute → zero flash (a tiny inline
// boot snippet in <head> applies the saved values before first paint) and
// zero risk to the pokerth.js monolith (this module only talks to the DOM +
// localStorage). All axes share ONE menu implementation (makeAxis), so the
// next axis (card deck) is a few lines.
//
// TO ADD A VALUE: add a `:root[data-<attr>="<id>"]{…}` block in pokerth.css
// and one entry in the axis list below (+ its label key in lang/en.mjs &
// fr.mjs). Nothing else changes — exactly like adding a language catalogue.
// ─────────────────────────────────────────────────────────────────────────

function _label(item) {
  try {
    if (typeof window.t === 'function') {
      var s = window.t(item.key);
      if (s && s !== item.key) return s;
    }
  } catch (e) {}
  return item.fallback;
}

// Build one selectable axis. cfg = { storeKey, attr, idBase, items:[{id,key,fallback,swatch}] }.
// id '' = the default (:root) → attribute removed.
function makeAxis(cfg) {
  var storeKey = cfg.storeKey, attr = cfg.attr, items = cfg.items;
  var menuId = cfg.idBase + '-menu', overlayId = cfg.idBase + '-menu-overlay';

  function get() {
    try { return localStorage.getItem(storeKey) || ''; } catch (e) { return ''; }
  }
  function apply(id) {
    var el = document.documentElement;
    if (id) el.setAttribute(attr, id); else el.removeAttribute(attr);
    try {
      if (id) localStorage.setItem(storeKey, id);
      else localStorage.removeItem(storeKey);
    } catch (e) {}
  }
  function esc(e) { if (e.key === 'Escape') closeMenu(); }
  function closeMenu() {
    try { document.removeEventListener('keydown', esc); } catch (e) {}
    [menuId, overlayId].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }
  function set(id) { apply(id); closeMenu(); }

  function openMenu(ev) {
    try { if (ev && ev.stopPropagation) ev.stopPropagation(); } catch (e) {}
    closeMenu();
    if (items.length < 2) return; // nothing to choose
    var cur = get();

    var overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;background:transparent';
    overlay.addEventListener('click', closeMenu);

    var menu = document.createElement('div');
    menu.id = menuId;
    menu.setAttribute('role', 'menu');
    menu.style.cssText = 'position:fixed;z-index:9999;min-width:165px;max-height:60vh;overflow:auto;'
      + 'background:var(--panel,#0d1f10);border:1px solid var(--gold-dim,rgba(200,168,74,0.45));'
      + 'border-radius:8px;padding:5px;box-shadow:0 12px 32px rgba(0,0,0,0.6)';

    items.forEach(function (it) {
      var active = (it.id === cur);
      var row = document.createElement('button');
      row.type = 'button';
      row.setAttribute('role', 'menuitemradio');
      row.setAttribute('aria-checked', active ? 'true' : 'false');
      row.dataset.value = it.id;
      row.style.cssText = 'display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;'
        + 'padding:8px 12px;margin:0;border:0;cursor:pointer;text-align:left;border-radius:6px;'
        + 'font-size:0.9rem;line-height:1.1;color:var(--cream,#f0e6d2);background:'
        + (active ? 'var(--gold-dim,rgba(200,168,74,0.18))' : 'transparent');
      row.innerHTML = '<span style="display:inline-flex;width:18px;height:18px;flex:none;border-radius:50%;'
        + 'border:1px solid rgba(255,255,255,0.35);background:' + it.swatch + '"></span>'
        + '<span style="flex:1">' + _label(it) + '</span>'
        + (active ? '<span style="color:var(--gold,#c8a84a)">\u2713</span>' : '');
      if (!active) {
        row.addEventListener('mouseenter', function () { row.style.background = 'rgba(255,255,255,0.06)'; });
        row.addEventListener('mouseleave', function () { row.style.background = 'transparent'; });
      }
      row.addEventListener('click', function (e) { e.stopPropagation(); set(it.id); });
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

    document.addEventListener('keydown', esc);
  }

  return { get: get, apply: apply, set: set, openMenu: openMenu, closeMenu: closeMenu, items: items };
}

// ── Registries ────────────────────────────────────────────────────────────
// Palette (data-theme). id '' = "Casino vert" (:root).
const PALETTES = [
  { id: '',     key: 'themeGreen', fallback: 'Green casino', swatch: '#1e3820' },
  { id: 'dark', key: 'themeDark',  fallback: 'Dark',         swatch: '#232730' },
];
// Tapis (data-table). id '' = green felt (:root). Swatch = the felt base colour.
const TABLES = [
  { id: '',         key: 'tableGreen',    fallback: 'Green',    swatch: '#1e6b1e' },
  { id: 'blue',     key: 'tableBlue',     fallback: 'Blue',     swatch: '#1f6aa8' },
  { id: 'bordeaux', key: 'tableBordeaux', fallback: 'Burgundy', swatch: '#8a1e2e' },
  { id: 'slate',    key: 'tableSlate',    fallback: 'Slate',    swatch: '#3a4150' },
];

const palette = makeAxis({ storeKey: 'pth_theme', attr: 'data-theme', idBase: 'theme', items: PALETTES });
const table   = makeAxis({ storeKey: 'pth_table', attr: 'data-table', idBase: 'table', items: TABLES });

// Apply saved values on load (idempotent with the <head> boot snippet).
try { palette.apply(palette.get()); } catch (e) {}
try { table.apply(table.get()); } catch (e) {}

// ── Exports + legacy global compatibility (HTML inline handlers) ──
export { PALETTES, TABLES, makeAxis };

window.openThemeMenu = palette.openMenu;
window.closeThemeMenu = palette.closeMenu;
window.setTheme = palette.set;
window.getTheme = palette.get;

window.openTableMenu = table.openMenu;
window.closeTableMenu = table.closeMenu;
window.setTable = table.set;
window.getTable = table.get;

window.THEME = {
  PALETTES: PALETTES, getTheme: palette.get, setTheme: palette.set, applyTheme: palette.apply,
  openThemeMenu: palette.openMenu, closeThemeMenu: palette.closeMenu,
};
window.TABLE = {
  TABLES: TABLES, getTable: table.get, setTable: table.set, applyTable: table.apply,
  openTableMenu: table.openMenu, closeTableMenu: table.closeMenu,
};
