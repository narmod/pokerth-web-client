// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/theme.mjs — Appearance settings (single "Theme" panel).
//
// Independent, orthogonal appearance axes, all surfaced in ONE panel:
//   • Palette  → data-theme  (page bg / panels / text / accents)
//   • Tapis    → data-table  (the playing surface: felt + rail)
//   • (later)  card deck → data-deck
// Each axis = an attribute on <html> that selects a block of CSS-custom-
// property overrides in pokerth.css. Default (no attribute) = the values in
// :root, so a fresh client is unchanged. Switching = toggling one attribute
// → zero flash (a tiny inline boot snippet in <head> applies saved values
// before first paint) and zero risk to the pokerth.js monolith (this module
// only talks to the DOM + localStorage).
//
// TO ADD A VALUE: add a `:root[data-<attr>="<id>"]{…}` block in pokerth.css
// and one entry in the axis list below (+ its label key in lang/en.mjs &
// fr.mjs). TO ADD A WHOLE AXIS: makeAxis(...) + push into AXES; it shows up
// in the panel automatically.
// ─────────────────────────────────────────────────────────────────────────

function _t(key, fallback) {
  try {
    if (typeof window.t === 'function') {
      var s = window.t(key);
      if (s && s !== key) return s;
    }
  } catch (e) {}
  return fallback;
}

// One appearance axis. cfg = { storeKey, attr, items:[{id,key,fallback,swatch}],
// titleKey, titleFallback }. id '' = the default (:root) → attribute removed.
function makeAxis(cfg) {
  function get() {
    try { return localStorage.getItem(cfg.storeKey) || ''; } catch (e) { return ''; }
  }
  function apply(id) {
    var el = document.documentElement;
    if (id) el.setAttribute(cfg.attr, id); else el.removeAttribute(cfg.attr);
    try {
      if (id) localStorage.setItem(cfg.storeKey, id);
      else localStorage.removeItem(cfg.storeKey);
    } catch (e) {}
  }
  return {
    storeKey: cfg.storeKey, attr: cfg.attr, items: cfg.items,
    titleKey: cfg.titleKey, titleFallback: cfg.titleFallback,
    get: get, apply: apply, set: apply,
  };
}

// ── Registries ────────────────────────────────────────────────────────────
const PALETTES = [
  { id: '',     key: 'themeGreen', fallback: 'Green casino', swatch: '#1e3820' },
  { id: 'dark', key: 'themeDark',  fallback: 'Dark',         swatch: '#232730' },
];
const TABLES = [
  { id: '',         key: 'tableGreen',    fallback: 'Green',    swatch: '#1e6b1e' },
  { id: 'blue',     key: 'tableBlue',     fallback: 'Blue',     swatch: '#1f6aa8' },
  { id: 'bordeaux', key: 'tableBordeaux', fallback: 'Burgundy', swatch: '#8a1e2e' },
  { id: 'slate',    key: 'tableSlate',    fallback: 'Slate',    swatch: '#3a4150' },
  { id: 'photo',    key: 'tablePhoto',    fallback: 'Textured', swatch: '#1f6b2e' },
];
// Card deck (data-deck). id '' = "Classique" (glyphs, :root default).
const DECKS = [
  { id: '',    key: 'deckClassic', fallback: 'Classic', swatch: '#e6e6e6' },
  { id: 'svg', key: 'deckSvg',     fallback: 'SVG',     swatch: '#a52a2a' },
];

const palette = makeAxis({ storeKey: 'pth_theme', attr: 'data-theme', items: PALETTES, titleKey: 'sectionPalette', titleFallback: 'Palette' });
const table   = makeAxis({ storeKey: 'pth_table', attr: 'data-table', items: TABLES,   titleKey: 'sectionTable',   titleFallback: 'Table' });
const deck    = makeAxis({ storeKey: 'pth_deck',  attr: 'data-deck',  items: DECKS,    titleKey: 'sectionDeck',    titleFallback: 'Cards' });
const AXES = [palette, table, deck];

// Apply saved values on load (idempotent with the <head> boot snippet).
AXES.forEach(function (ax) { try { ax.apply(ax.get()); } catch (e) {} });

// ── Single "Theme" panel ────────────────────────────────────────────────
const PANEL_ID = 'theme-panel', OVERLAY_ID = 'theme-panel-overlay';
var _body = null; // the panel's scrollable content (re-rendered on each change)

function _panelEsc(e) { if (e.key === 'Escape') closeThemePanel(); }

function closeThemePanel() {
  try { document.removeEventListener('keydown', _panelEsc); } catch (e) {}
  _body = null;
  [PANEL_ID, OVERLAY_ID].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  });
}

// (Re)build the sections inside the panel — reflects the current selection so
// the checkmarks/highlights update live after each click (panel stays open).
function _render() {
  if (!_body) return;
  _body.innerHTML = '';
  AXES.forEach(function (ax) {
    var cur = ax.get();
    var sec = document.createElement('div');
    sec.style.cssText = 'margin:0 0 12px';

    var head = document.createElement('div');
    head.textContent = _t(ax.titleKey, ax.titleFallback);
    head.style.cssText = 'font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;'
      + 'color:var(--gold-dim,#7a6428);margin:0 2px 7px';
    sec.appendChild(head);

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px';
    ax.items.forEach(function (it) {
      var active = (it.id === cur);
      var pill = document.createElement('button');
      pill.type = 'button';
      pill.setAttribute('role', 'menuitemradio');
      pill.setAttribute('aria-checked', active ? 'true' : 'false');
      pill.dataset.value = it.id;
      pill.style.cssText = 'display:inline-flex;align-items:center;gap:7px;padding:6px 10px;'
        + 'border-radius:999px;cursor:pointer;font-size:0.82rem;line-height:1;'
        + 'color:var(--cream,#f0e6d2);border:1px solid '
        + (active ? 'var(--gold,#c8a84a)' : 'var(--border,rgba(200,168,74,0.25))')
        + ';background:' + (active ? 'var(--gold-dim,rgba(200,168,74,0.18))' : 'transparent');
      pill.innerHTML = '<span style="width:14px;height:14px;flex:none;border-radius:50%;'
        + 'border:1px solid rgba(255,255,255,0.35);background:' + it.swatch + '"></span>'
        + '<span>' + _t(it.key, it.fallback) + '</span>'
        + (active ? '<span style="color:var(--gold,#c8a84a);font-size:0.9em">\u2713</span>' : '');
      if (!active) {
        pill.addEventListener('mouseenter', function () { pill.style.background = 'rgba(255,255,255,0.06)'; });
        pill.addEventListener('mouseleave', function () { pill.style.background = 'transparent'; });
      }
      pill.addEventListener('click', function (e) { e.stopPropagation(); ax.apply(it.id); _render(); });
      row.appendChild(pill);
    });
    sec.appendChild(row);
    _body.appendChild(sec);
  });
}

function openThemePanel(ev) {
  try { if (ev && ev.stopPropagation) ev.stopPropagation(); } catch (e) {}
  closeThemePanel();

  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;background:transparent';
  overlay.addEventListener('click', closeThemePanel);

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.setAttribute('role', 'menu');
  panel.style.cssText = 'position:fixed;z-index:9999;min-width:230px;max-width:320px;max-height:70vh;overflow:auto;'
    + 'background:var(--panel,#0d1f10);border:1px solid var(--gold-dim,rgba(200,168,74,0.45));'
    + 'border-radius:10px;padding:10px 12px 12px;box-shadow:0 12px 32px rgba(0,0,0,0.6)';

  var header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin:0 0 10px';
  var title = document.createElement('span');
  title.textContent = _t('themeTooltip', 'Theme');
  title.style.cssText = 'font-size:0.95rem;font-weight:700;color:var(--cream,#f0e6d2)';
  var x = document.createElement('button');
  x.type = 'button'; x.innerHTML = '\u2715';
  x.style.cssText = 'background:none;border:0;color:var(--text,#9aaa92);cursor:pointer;font-size:1rem;padding:0 2px;line-height:1';
  x.addEventListener('click', function (e) { e.stopPropagation(); closeThemePanel(); });
  header.appendChild(title); header.appendChild(x);
  panel.appendChild(header);

  _body = document.createElement('div');
  panel.appendChild(_body);
  _render();

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  // Position below the anchor, clamped to the viewport; center if the anchor
  // is missing/hidden (e.g. opened from a mobile overflow item).
  var vw = window.innerWidth || 360, vh = window.innerHeight || 640;
  var mw = panel.offsetWidth || 240, mh = panel.offsetHeight || 240;
  var anchor = ev && (ev.currentTarget || ev.target);
  var r = null;
  try { if (anchor && anchor.getBoundingClientRect) r = anchor.getBoundingClientRect(); } catch (e) {}
  var top, left;
  if (r && r.width && r.height) {
    top = r.bottom + 6; left = r.left;
    if (top + mh > vh - 8) top = r.top - mh - 6; // flip above if no room below
  } else {
    top = (vh - mh) / 2; left = (vw - mw) / 2;
  }
  panel.style.left = Math.max(8, Math.min(left, vw - mw - 8)) + 'px';
  panel.style.top = Math.max(8, Math.min(top, vh - mh - 8)) + 'px';

  document.addEventListener('keydown', _panelEsc);
}

// ── Exports + legacy global compatibility ──
export { PALETTES, TABLES, DECKS, AXES, makeAxis, openThemePanel, closeThemePanel };

// The single panel is the entry point everywhere.
window.openThemePanel = openThemePanel;
window.closeThemePanel = closeThemePanel;
// Back-compat: any older trigger that still calls the per-axis openers now
// opens the unified panel instead.
window.openThemeMenu = openThemePanel;
window.openTableMenu = openThemePanel;
window.closeThemeMenu = closeThemePanel;
window.closeTableMenu = closeThemePanel;
// Programmatic setters/getters (also used by tests).
window.setTheme = palette.apply; window.getTheme = palette.get;
window.setTable = table.apply;   window.getTable = table.get;
window.THEME = {
  PALETTES: PALETTES, TABLES: TABLES, AXES: AXES,
  getTheme: palette.get, setTheme: palette.apply, applyTheme: palette.apply,
  getTable: table.get, setTable: table.apply, applyTable: table.apply,
  openPanel: openThemePanel, closePanel: closeThemePanel,
};
