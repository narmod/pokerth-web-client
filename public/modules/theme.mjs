// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/theme.mjs — Appearance settings (single "Theme" panel).
//
// Two layers, one panel:
//   1. PRESETS ("main themes") — one click sets every axis at once
//      (e.g. "Casino vert", "Official PokerTH"). The active preset is derived
//      from the current axis values; tweak any axis and it becomes a custom mix.
//   2. AXES (fine-tuning) — Palette / Tapis / Cartes, each an attribute on
//      <html> selecting CSS-custom-property overrides in pokerth.css:
//        • Palette → data-theme   • Tapis → data-table   • Cartes → data-deck
//
// Default (no attribute) = the values in :root, so a fresh client is the
// "Casino vert" preset. Switching toggles attributes → zero flash (a tiny
// inline boot snippet in <head> applies saved values before first paint) and
// zero risk to the pokerth.js monolith (this module only talks to the DOM +
// localStorage).
//
// TO ADD AN OPTION: add a `:root[data-<attr>="<id>"]{…}` block in pokerth.css
//   + one entry in the axis list below (+ its label key in lang/en.mjs & fr.mjs).
// TO ADD A PRESET: one entry in PRESETS (a combo of axis ids) + its label key.
// TO ADD A WHOLE AXIS: makeAxis(...) + push into AXES; it appears automatically.
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

// ── Axes (fine-tuning) ──────────────────────────────────────────────────────
const PALETTES = [
  { id: '',     key: 'themeGreen', fallback: 'Green', swatch: '#1e3820' },
  { id: 'dark', key: 'themeDark',  fallback: 'Dark',  swatch: '#232730' },
];
const TABLES = [
  { id: '',         key: 'tableGreen',    fallback: 'Green',    swatch: '#1e6b1e' },
  { id: 'blue',     key: 'tableBlue',     fallback: 'Blue',     swatch: '#1f6aa8' },
  { id: 'bordeaux', key: 'tableBordeaux', fallback: 'Burgundy', swatch: '#8a1e2e' },
  { id: 'slate',    key: 'tableSlate',    fallback: 'Slate',    swatch: '#3a4150' },
  { id: 'photo',    key: 'tablePhoto',    fallback: 'Textured', swatch: '#1f6b2e' },
];
const DECKS = [
  { id: '',    key: 'deckClassic', fallback: 'Classic', swatch: '#e6e6e6' },
  { id: 'svg', key: 'deckSvg',     fallback: 'PokerTH',     swatch: '#a52a2a' },
];

const palette = makeAxis({ storeKey: 'pth_theme', attr: 'data-theme', items: PALETTES, titleKey: 'sectionPalette', titleFallback: 'Palette' });
const table   = makeAxis({ storeKey: 'pth_table', attr: 'data-table', items: TABLES,   titleKey: 'sectionTable',   titleFallback: 'Table' });
const deck    = makeAxis({ storeKey: 'pth_deck',  attr: 'data-deck',  items: DECKS,    titleKey: 'sectionDeck',    titleFallback: 'Cards' });
const AXES = [palette, table, deck];

// ── Presets (main themes) ───────────────────────────────────────────────────
// A preset is just a named combo of axis ids. "Casino vert" = all defaults
// (this project's look). "Official PokerTH" ≈ the official client (dark UI +
// textured green felt + vector cards). Order = display order.
const PRESETS = [
  { id: 'casino',  key: 'presetCasino',   fallback: 'Casino vert',     swatch: '#1e6b1e', values: { theme: '',     table: '',      deck: ''    } },
  { id: 'pokerth', key: 'presetOfficial', fallback: 'Official PokerTH', swatch: '#232730', values: { theme: 'dark', table: 'photo', deck: 'svg' } },
];

function applyPreset(id) {
  var p = null;
  for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) p = PRESETS[i];
  if (!p) return;
  palette.apply(p.values.theme);
  table.apply(p.values.table);
  deck.apply(p.values.deck);
}

// Which preset matches the current axis values? null = custom mix.
function activePreset() {
  var cur = { theme: palette.get(), table: table.get(), deck: deck.get() };
  for (var i = 0; i < PRESETS.length; i++) {
    var v = PRESETS[i].values;
    if (v.theme === cur.theme && v.table === cur.table && v.deck === cur.deck) return PRESETS[i].id;
  }
  return null;
}

// Apply saved values on load (idempotent with the <head> boot snippet).
AXES.forEach(function (ax) { try { ax.apply(ax.get()); } catch (e) {} });

// Gallery card decks discovered at runtime from /cards/decks.json (managed by
// install.sh deck-add). Best-effort: offline/absent -> only the built-in decks.
var _galleryDecks = [];
function _loadGalleryDecks() {
  try {
    fetch('/cards/decks.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (list) {
        if (!Array.isArray(list)) return;
        _galleryDecks = list.filter(function (d) { return d && d.id; }).map(function (d) {
          return { id: String(d.id), name: d.name || String(d.id), preview: d.preview || null, swatch: '#1e6b1e' };
        });
        if (_body) _render();
      })
      .catch(function () {});
  } catch (e) {}
}
_loadGalleryDecks();

// Deck changes need the monolith to re-point card faces + back (no re-render).
var _deckApply = deck.apply;
deck.apply = function (id) { _deckApply(id); try { if (window._refreshDeck) window._refreshDeck(); } catch (e) {} };
deck.set = deck.apply;

// ── Single "Theme" panel ────────────────────────────────────────────────
const PANEL_ID = 'theme-panel', OVERLAY_ID = 'theme-panel-overlay';
var _body = null; // re-rendered on each change so highlights stay in sync
var _openSec = null; // which dropdown is expanded (accordion; one open at a time)

function _panelEsc(e) { if (e.key === 'Escape') closeThemePanel(); }

function closeThemePanel() {
  try { document.removeEventListener('keydown', _panelEsc); } catch (e) {}
  _body = null;
  _openSec = null;
  [PANEL_ID, OVERLAY_ID].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  });
}

// A single selectable pill (swatch + label, optional check). onClick is a fn.
function _pill(label, swatch, active, big, onClick, preview) {
  var b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('role', 'menuitemradio');
  b.setAttribute('aria-checked', active ? 'true' : 'false');
  b.style.cssText = 'display:inline-flex;align-items:center;gap:7px;cursor:pointer;'
    + 'border-radius:999px;line-height:1;color:var(--cream,#f0e6d2);'
    + 'padding:' + (big ? '8px 13px' : '6px 10px') + ';font-size:' + (big ? '0.9rem' : '0.82rem') + ';'
    + 'border:1px solid ' + (active ? 'var(--gold,#c8a84a)' : 'var(--border,rgba(200,168,74,0.25))') + ';'
    + 'background:' + (active ? 'var(--gold-dim,rgba(200,168,74,0.18))' : 'transparent');
  var dot = big ? 16 : 14;
  var chip = preview
    ? '<span style="width:' + (dot + 4) + 'px;height:' + (dot + 4) + 'px;flex:none;border-radius:5px;overflow:hidden;border:1px solid rgba(255,255,255,0.3);background:#0b1a0d"><img src="' + preview + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy"></span>'
    : '<span style="width:' + dot + 'px;height:' + dot + 'px;flex:none;border-radius:50%;border:1px solid rgba(255,255,255,0.35);background:' + swatch + '"></span>';
  b.innerHTML = chip
    + '<span>' + label + '</span>'
    + (active ? '<span style="color:var(--gold,#c8a84a);font-size:0.9em">\u2713</span>' : '');
  if (!active) {
    b.addEventListener('mouseenter', function () { b.style.background = 'rgba(255,255,255,0.06)'; });
    b.addEventListener('mouseleave', function () { b.style.background = 'transparent'; });
  }
  b.addEventListener('click', function (e) { e.stopPropagation(); onClick(); });
  return b;
}

function _sectionHeader(text, hint) {
  var h = document.createElement('div');
  h.style.cssText = 'font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;'
    + 'color:var(--gold-dim,#7a6428);margin:0 2px 7px';
  h.innerHTML = text + (hint ? ' <span style="color:var(--text,#8a948a);opacity:0.85">\u00b7 ' + hint + '</span>' : '');
  return h;
}

function _row() {
  var r = document.createElement('div');
  r.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px';
  return r;
}

// -- Preview thumbnails (small inside the control, large beside it) -----------
function _tableById(id) { for (var i = 0; i < TABLES.length; i++) if (TABLES[i].id === id) return TABLES[i]; return TABLES[0]; }
function _presetById(id) { for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i]; return PRESETS[0]; }

function _feltStyle(t) {
  if (t && t.id === 'photo') return 'background:url(/table/felt-green.jpg) center/cover';
  var sw = (t && t.swatch) || '#1e6b1e';
  return 'background:radial-gradient(circle at 50% 36%, color-mix(in srgb,' + sw + ',#fff 12%), color-mix(in srgb,' + sw + ',#000 55%))';
}
function _svgFan(big) {
  function c(src, x, r) { return '<img src="' + src + '" alt="" style="position:absolute;top:50%;left:' + x + '%;height:' + (big ? 80 : 76) + '%;width:auto;border-radius:3px;transform:translateY(-50%) rotate(' + r + 'deg);box-shadow:0 1px 3px rgba(0,0,0,.5)">'; }
  return c('/cards/svg/back.svg', big ? 8 : 6, -12) + c('/cards/svg/1h.svg', big ? 32 : 30, 0) + c('/cards/svg/1s.svg', big ? 54 : 52, 12);
}
// Mini card faces for previews, matching the in-game Classic layout
// (rank+suit index top-left, large suit pip centered).
function _miniFront(rank, suit, red, big, pos) {
  var col = red ? '#c0392b' : '#15110c';
  return '<span style="position:absolute;display:block;' + pos + 'background:#f7f4ec;border-radius:3px;height:' + (big ? 80 : 76) + '%;aspect-ratio:5/7;box-shadow:0 1px 3px rgba(0,0,0,.5);color:' + col + ';font-weight:800;line-height:1">'
    + '<span style="position:absolute;top:7%;left:9%;display:flex;flex-direction:column;align-items:center;line-height:0.82;font-size:' + (big ? '0.5rem' : '0.34rem') + '"><span>' + rank + '</span><span style="font-size:0.8em">' + suit + '</span></span>'
    + '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:' + (big ? '1.15rem' : '0.66rem') + '">' + suit + '</span></span>';
}
function _miniBack(big, pos) {
  return '<span style="position:absolute;display:flex;align-items:center;justify-content:center;' + pos + 'border-radius:3px;height:' + (big ? 80 : 76) + '%;aspect-ratio:5/7;background:radial-gradient(circle at 50% 44%,#234023,#0c1c0e);box-shadow:inset 0 0 0 1px #c8a84a,0 1px 3px rgba(0,0,0,.5)">'
    + '<span style="color:#e0c070;font-size:' + (big ? '1rem' : '0.6rem') + ';font-family:Georgia,serif">\u2660</span></span>';
}
function _classicFan(big) {
  // back + two fronts, same fan positions as _svgFan
  return _miniBack(big, 'top:50%;left:' + (big ? 8 : 6) + '%;transform:translateY(-50%) rotate(-12deg);')
    + _miniFront('A', '\u2665', true, big, 'top:50%;left:' + (big ? 32 : 30) + '%;transform:translateY(-50%) rotate(0deg);')
    + _miniFront('A', '\u2660', false, big, 'top:50%;left:' + (big ? 54 : 52) + '%;transform:translateY(-50%) rotate(12deg);');
}
function _cardOnFelt(deckId, big) {
  if (deckId === 'svg') return '<img src="/cards/svg/1s.svg" alt="" style="position:absolute;top:50%;left:50%;height:' + (big ? 78 : 74) + '%;width:auto;border-radius:3px;transform:translate(-50%,-50%) rotate(-6deg);box-shadow:0 2px 5px rgba(0,0,0,.5)">';
  return _miniFront('A', '\u2660', false, big, 'top:50%;left:50%;transform:translate(-50%,-50%) rotate(-6deg);');
}
function _previewHTML(kind, item, big) {
  var box = 'display:block;position:relative;flex:none;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,0.18);background:#0b1a0d;' + (big ? 'width:92px;height:66px' : 'width:30px;height:22px');
  if (kind === 'palette') {
    var bg = (item && item.swatch) || '#14331a';
    return '<span style="' + box + ';background:' + bg + '">'
      + '<i style="position:absolute;right:' + (big ? 4 : 3) + 'px;top:' + (big ? 4 : 3) + 'px;width:' + (big ? 9 : 6) + 'px;height:' + (big ? 9 : 6) + 'px;border-radius:50%;background:#c8a84a"></i>'
      + '<i style="position:absolute;right:' + (big ? 4 : 3) + 'px;bottom:' + (big ? 4 : 3) + 'px;width:' + (big ? 13 : 8) + 'px;height:' + (big ? 4 : 3) + 'px;border-radius:2px;background:#f0e6d2"></i></span>';
  }
  if (kind === 'table') {
    return '<span style="' + box + ';' + _feltStyle(item) + ';box-shadow:inset 0 0 0 ' + (big ? 3 : 2) + 'px #5b4420, inset 0 0 0 ' + (big ? 4 : 3) + 'px rgba(0,0,0,.45)"></span>';
  }
  if (kind === 'deck') {
    if (item && item.preview) return '<span style="' + box + '"><img src="' + item.preview + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></span>';
    var cards = (item && item.id === 'svg') ? _svgFan(big) : _classicFan(big);
    return '<span style="' + box + ';background:linear-gradient(160deg,#1c5a28,#0c3214)">' + cards + '</span>';
  }
  if (kind === 'preset') {
    var t = _tableById(item && item.values ? item.values.table : '');
    return '<span style="' + box + ';' + _feltStyle(t) + '">' + _cardOnFelt(item && item.values ? item.values.deck : '', big) + '</span>';
  }
  return '<span style="' + box + '"></span>';
}

// A dropdown control: button (thumb + name + chevron) with a large preview
// beside it; expands in place (accordion) to a list of options with thumbnails.
function _dropdownBlock(secId, labelText, kind, curItem, curName, options) {
  var sec = document.createElement('div'); sec.style.cssText = 'margin:0 0 11px';
  if (labelText) {
    var lab = document.createElement('div'); lab.textContent = labelText;
    lab.style.cssText = 'font-size:0.72rem;color:var(--text,#9aaa92);margin:0 2px 5px';
    sec.appendChild(lab);
  }
  var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:9px;align-items:flex-start';
  var dd = document.createElement('div'); dd.style.cssText = 'flex:1;min-width:0';
  var open = _openSec === secId;
  var btn = document.createElement('button'); btn.type = 'button';
  btn.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:7px 9px;border-radius:8px;cursor:pointer;text-align:left;color:var(--cream,#f0e6d2);font-size:0.84rem;background:rgba(255,255,255,0.03);border:1px solid ' + (open ? 'var(--gold,#c8a84a)' : 'var(--border,rgba(200,168,74,0.25))');
  btn.innerHTML = _previewHTML(kind, curItem, false)
    + '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + curName + '</span>'
    + '<span style="color:var(--text,#9aaa92);font-size:0.72rem;display:inline-block;transition:transform .15s;transform:rotate(' + (open ? '180' : '0') + 'deg)">\u25be</span>';
  btn.addEventListener('click', function (e) { e.stopPropagation(); _openSec = open ? null : secId; _render(); });
  dd.appendChild(btn);
  if (open) {
    var list = document.createElement('div');
    list.style.cssText = 'margin-top:5px;border:1px solid var(--border,rgba(200,168,74,0.25));border-radius:8px;overflow:hidden;background:#0b1a0d';
    options.forEach(function (o, idx) {
      var it = document.createElement('div');
      it.style.cssText = 'display:flex;align-items:center;gap:9px;padding:7px 9px;cursor:pointer;' + (idx ? 'border-top:1px solid rgba(255,255,255,0.05);' : '') + (o.active ? 'background:var(--gold-dim,rgba(200,168,74,0.18))' : '');
      it.innerHTML = _previewHTML(kind, o.item, false)
        + '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.84rem">' + o.name + '</span>'
        + (o.active ? '<span style="color:var(--gold,#c8a84a)">\u2713</span>' : '');
      if (!o.active) {
        it.addEventListener('mouseenter', function () { it.style.background = 'rgba(255,255,255,0.07)'; });
        it.addEventListener('mouseleave', function () { it.style.background = ''; });
      }
      it.addEventListener('click', function (e) { e.stopPropagation(); o.onClick(); });
      list.appendChild(it);
    });
    dd.appendChild(list);
  }
  row.appendChild(dd);
  var prev = document.createElement('div'); prev.style.cssText = 'flex:none'; prev.innerHTML = _previewHTML(kind, curItem, true);
  row.appendChild(prev);
  sec.appendChild(row);
  return sec;
}

function _render() {
  if (!_body) return;
  _body.innerHTML = '';

  // 1) Presets ("main themes") as a dropdown
  var act = activePreset();
  var presetOptions = PRESETS.map(function (p) {
    return { item: p, name: _t(p.key, p.fallback), active: p.id === act, onClick: function () { applyPreset(p.id); _openSec = null; _render(); } };
  });
  var curPreset, curPresetName;
  if (act) { curPreset = _presetById(act); curPresetName = _t(curPreset.key, curPreset.fallback); }
  else { curPreset = { values: { theme: palette.get(), table: table.get(), deck: deck.get() } }; curPresetName = _t('presetCustom', 'Custom'); }
  _body.appendChild(_sectionHeader(_t('sectionPresets', 'Themes'), ''));
  _body.appendChild(_dropdownBlock('preset', '', 'preset', curPreset, curPresetName, presetOptions));

  // separator
  var sep = document.createElement('div');
  sep.style.cssText = 'height:1px;background:var(--border,rgba(200,168,74,0.18));margin:3px 0 11px';
  _body.appendChild(sep);

  // 2) Customize (per-axis dropdowns)
  _body.appendChild(_sectionHeader(_t('sectionCustomize', 'Customize'), ''));
  AXES.forEach(function (ax) {
    var cur = ax.get();
    var kind = (ax === palette) ? 'palette' : (ax === table) ? 'table' : 'deck';
    var opts = (ax === deck) ? DECKS.concat(_galleryDecks) : ax.items;
    var curItem = opts[0];
    for (var i = 0; i < opts.length; i++) if (opts[i].id === cur) curItem = opts[i];
    var curName = curItem.name || _t(curItem.key, curItem.fallback);
    var options = opts.map(function (it) {
      return {
        item: it, name: (it.name || _t(it.key, it.fallback)), active: it.id === cur,
        onClick: (function (id) { return function () { ax.apply(id); _openSec = null; _render(); }; })(it.id),
      };
    });
    _body.appendChild(_dropdownBlock(kind, _t(ax.titleKey, ax.titleFallback), kind, curItem, curName, options));
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
  panel.style.cssText = 'position:fixed;z-index:9999;min-width:248px;max-width:340px;max-height:74vh;overflow:auto;'
    + 'background:var(--panel,#0d1f10);border:1px solid var(--gold-dim,rgba(200,168,74,0.45));'
    + 'border-radius:10px;padding:11px 13px 13px;box-shadow:0 12px 32px rgba(0,0,0,0.6)';

  var header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin:0 0 11px';
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

  var vw = window.innerWidth || 360, vh = window.innerHeight || 640;
  var mw = panel.offsetWidth || 260, mh = panel.offsetHeight || 320;
  var anchor = ev && (ev.currentTarget || ev.target);
  var r = null;
  try { if (anchor && anchor.getBoundingClientRect) r = anchor.getBoundingClientRect(); } catch (e) {}
  var top, left;
  if (r && r.width && r.height) {
    top = r.bottom + 6; left = r.left;
    if (top + mh > vh - 8) top = r.top - mh - 6;
  } else {
    top = (vh - mh) / 2; left = (vw - mw) / 2;
  }
  panel.style.left = Math.max(8, Math.min(left, vw - mw - 8)) + 'px';
  panel.style.top = Math.max(8, Math.min(top, vh - mh - 8)) + 'px';

  document.addEventListener('keydown', _panelEsc);
}

// ── Exports + legacy global compatibility ──
export { PALETTES, TABLES, DECKS, PRESETS, AXES, makeAxis, applyPreset, activePreset, openThemePanel, closeThemePanel };

window.openThemePanel = openThemePanel;
window.closeThemePanel = closeThemePanel;
window.openThemeMenu = openThemePanel;   // back-compat
window.openTableMenu = openThemePanel;   // back-compat
window.closeThemeMenu = closeThemePanel;
window.closeTableMenu = closeThemePanel;
window.setTheme = palette.apply; window.getTheme = palette.get;
window.setTable = table.apply;   window.getTable = table.get;
window.setDeck  = deck.apply;    window.getDeck  = deck.get;
window.applyThemePreset = applyPreset;
window.THEME = {
  PALETTES: PALETTES, TABLES: TABLES, DECKS: DECKS, PRESETS: PRESETS, AXES: AXES,
  applyPreset: applyPreset, activePreset: activePreset,
  getTheme: palette.get, setTheme: palette.apply,
  getTable: table.get, setTable: table.apply,
  getDeck: deck.get, setDeck: deck.apply,
  openPanel: openThemePanel, closePanel: closeThemePanel,
};
