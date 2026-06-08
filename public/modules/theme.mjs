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
    try { var v = localStorage.getItem(cfg.storeKey); return (v === null || v === undefined) ? (cfg.def || '') : v; } catch (e) { return cfg.def || ''; }
  }
  function apply(id) {
    var el = document.documentElement;
    if (id) el.setAttribute(cfg.attr, id); else el.removeAttribute(cfg.attr);
    try { localStorage.setItem(cfg.storeKey, id || ''); } catch (e) {}
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
  { id: 'pokerth', key: 'themePokerthOfficial', fallback: 'PokerTH official', swatch: '#1d222b' },
  { id: 'pokerth-light', key: 'themePokerthOfficialLight', fallback: 'PokerTH official (light)', swatch: '#dce2ec' },
];
const TABLES = [
  { id: '',         key: 'tableGreen',    fallback: 'Green',    swatch: '#1e6b1e' },
  { id: 'blue',     key: 'tableBlue',     fallback: 'Blue',     swatch: '#1f6aa8' },
  { id: 'bordeaux', key: 'tableBordeaux', fallback: 'Burgundy', swatch: '#8a1e2e' },
  { id: 'slate',    key: 'tableSlate',    fallback: 'Slate',    swatch: '#3a4150' },
  { id: 'pokerth', key: 'tablePokerthOfficial', fallback: 'PokerTH', swatch: '#008c58' },
  { id: 'photo',    key: 'tablePhoto',    fallback: 'Textured', swatch: '#1f6b2e' },
];
const DECKS = [
  { id: 'casino-vert', key: 'deckCasinoVert', fallback: 'Green Casino', swatch: '#1e6b1e', ext: 'svg' },
  { id: 'pokerth', key: 'deckPokerth', fallback: 'PokerTH', swatch: '#1d6b30', ext: 'png' },
  { id: 'pokerth-1-0', key: 'deckPokerth10', fallback: 'PokerTH 1.0', swatch: '#1d6b30', ext: 'png' },
  { id: 'pokerth-new', key: 'deckPokerthNew', fallback: 'PokerTH new', swatch: '#a52a2a', ext: 'svg' },
];

// Buttons axis: a built-in "Glossy" scheme (PokerTH colour-coding, kept so
// actions stay readable). Tokens map to var(--btn-*) in pokerth.css.
var BUTTON_TOKENS = ['btn-fold-bg','btn-fold-fg','btn-check-bg','btn-check-fg','btn-call-bg','btn-call-fg','btn-raise-bg','btn-raise-fg','btn-allin-bg','btn-allin-bd','btn-allin-fg','btn-allin-fg-b'];
var BUTTON_GLOSSY = {
  'btn-fold-bg':'linear-gradient(180deg, #d23030 0%, #a81818 48%, #800f0f 100%)','btn-fold-fg':'#ffe6e6',
  'btn-check-bg':'linear-gradient(180deg, #2f7ad0 0%, #1f5aa8 48%, #143f7a 100%)','btn-check-fg':'#e6f0ff',
  'btn-call-bg':'linear-gradient(180deg, #2f7ad0 0%, #1f5aa8 48%, #143f7a 100%)','btn-call-fg':'#e6f0ff',
  'btn-raise-bg':'linear-gradient(180deg, #2fa83a 0%, #1f8a2a 48%, #14661e 100%)','btn-raise-fg':'#eaffea',
  'btn-allin-bd':'#d8701f','btn-allin-fg':'#e8a85a','btn-allin-fg-b':'#f0c080'
};
// Pucks axis: a built-in "PokerTH" set (dealer/SB/BB marker images, shared).
var PUCK_SET = { dealer:'url(/pucks/dealer.svg)', sb:'url(/pucks/sb.svg)', bb:'url(/pucks/bb.svg)' };
var BUTTONS_ITEMS = [ {id:'',key:'buttonsDefault',fallback:'Flat',swatch:'#6b2020'}, {id:'glossy',key:'buttonsGlossy',fallback:'Glossy',swatch:'#c81818'} ];
var PUCKS_ITEMS   = [ {id:'pokerth',key:'pucksPokerth',fallback:'PokerTH',swatch:'#3a78d8',preview:'/pucks/dealer.svg'} ];
const palette = makeAxis({ storeKey: 'pth_theme', attr: 'data-theme', items: PALETTES, def: 'pokerth', titleKey: 'sectionPalette', titleFallback: 'Palette' });
const table   = makeAxis({ storeKey: 'pth_table', attr: 'data-table', items: TABLES, def: 'pokerth', titleKey: 'sectionTable',   titleFallback: 'Table' });
const deck    = makeAxis({ storeKey: 'pth_deck',  attr: 'data-deck',  def: 'pokerth-new',  items: DECKS,    titleKey: 'sectionDeck',    titleFallback: 'Cards' });
const buttons = makeAxis({ storeKey: 'pth_buttons', attr: 'data-buttons', def: 'pokerth-new', items: BUTTONS_ITEMS, titleKey: 'sectionButtons', titleFallback: 'Buttons' });
const pucks   = makeAxis({ storeKey: 'pth_pucks',   attr: 'data-pucks',   def: 'pokerth-new', items: PUCKS_ITEMS,   titleKey: 'sectionPucks',   titleFallback: 'Pucks' });
const AXES = [deck, palette, table, buttons, pucks];

// ── Presets (main themes) ───────────────────────────────────────────────────
// A preset is just a named combo of axis ids. "Casino vert" = all defaults
// (this project's look). "Official PokerTH" ≈ the official client (dark UI +
// textured green felt + vector cards). Order = display order.
const PRESETS = [
  { id: 'official', key: 'presetPokerthOfficial', fallback: 'PokerTH official', swatch: '#1d222b', values: { theme: 'pokerth', table: 'pokerth', deck: 'pokerth-new', buttons: 'glossy', pucks: 'pokerth-new' } },
  { id: 'officiallight', key: 'presetPokerthOfficialLight', fallback: 'PokerTH official (light)', swatch: '#dce2ec', values: { theme: 'pokerth-light', table: 'pokerth', deck: 'pokerth-new', buttons: 'glossy', pucks: 'pokerth-new' } },
  { id: 'casino',  key: 'presetCasino',   fallback: 'Green Casino',     swatch: '#1e6b1e', values: { theme: '',     table: '',      deck: 'casino-vert', buttons: 'casino-vert', pucks: 'casino-vert' } },
  { id: 'pokerth', key: 'presetOfficial', fallback: 'PokerTH ver1.1.2', swatch: '#232730', values: { theme: 'dark', table: 'photo', deck: 'pokerth', buttons: 'glossy', pucks: 'pokerth' } },
  { id: 'pokerth10', key: 'presetPokerth10', fallback: 'PokerTH ver1.0', swatch: '#232730', values: { theme: 'dark', table: 'photo', deck: 'pokerth-1-0', buttons: 'glossy', pucks: 'pokerth' } },
  { id: 'pokerthnew', key: 'presetPokerthNew', fallback: 'PokerTH new', swatch: '#a52a2a', values: { theme: 'dark', table: 'photo', deck: 'pokerth-new', buttons: 'pokerth-new', pucks: 'pokerth-new' } },
];

function applyPreset(id) {
  var all = PRESETS.concat(_pkgPresets), p = null;
  for (var i = 0; i < all.length; i++) if (all[i].id === id) p = all[i];
  if (!p) return;
  if (p.values.theme !== undefined) palette.apply(p.values.theme);
  if (p.values.table !== undefined) table.apply(p.values.table);
  if (p.values.deck !== undefined) deck.apply(p.values.deck);
  if (p.values.buttons !== undefined) buttons.apply(p.values.buttons);
  if (p.values.pucks !== undefined) pucks.apply(p.values.pucks);
}

// Which preset matches the current axis values? null = custom mix.
function activePreset() {
  var cur = { theme: palette.get(), table: table.get(), deck: deck.get(), buttons: buttons.get(), pucks: pucks.get() };
  var all = PRESETS.concat(_pkgPresets);
  for (var i = 0; i < all.length; i++) {
    var v = all[i].values;
    var deckOk = (v.deck === undefined) || (v.deck === cur.deck);
    var btnOk = (v.buttons === undefined) || (v.buttons === cur.buttons);
    var pkOk = (v.pucks === undefined) || (v.pucks === cur.pucks);
    if (v.theme === cur.theme && v.table === cur.table && deckOk && btnOk && pkOk) return all[i].id;
  }
  return null;
}

try { if (localStorage.getItem('pth_deck') === 'svg') { localStorage.setItem('pth_deck', 'pokerth-new'); localStorage.setItem('pth_deck_ext', 'svg'); } } catch (e) {}

// Apply saved values on load (idempotent with the <head> boot snippet).
AXES.forEach(function (ax) { try { ax.apply(ax.get()); } catch (e) {} });
try { var _cd = deck.get(); if (_cd) document.documentElement.setAttribute('data-deck-ext', _deckExt(_cd)); else document.documentElement.removeAttribute('data-deck-ext'); } catch (e) {}

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
          return { id: String(d.id), name: d.name || String(d.id), preview: d.preview || null, ext: (d.ext === 'svg' ? 'svg' : 'png'), swatch: '#1e6b1e' };
        }).filter(function (d) { for (var i = 0; i < DECKS.length; i++) if (DECKS[i].id === d.id) return false; return true; });
        if (_body) _render();
      })
      .catch(function () {});
  } catch (e) {}
}
_loadGalleryDecks();

// Deck changes need the monolith to re-point card faces + back (no re-render).
var _deckApply = deck.apply;
function _deckExt(id) { var all = DECKS.concat(_galleryDecks); for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i].ext || 'png'; return 'png'; }
deck.apply = function (id) {
  _deckApply(id);
  try {
    if (id) { var e = _deckExt(id); document.documentElement.setAttribute('data-deck-ext', e); localStorage.setItem('pth_deck_ext', e); }
    else { document.documentElement.removeAttribute('data-deck-ext'); localStorage.removeItem('pth_deck_ext'); }
  } catch (e) {}
  try { if (window._refreshDeck) window._refreshDeck(); } catch (e) {}
};
deck.set = deck.apply;

// Gallery table styles imported at runtime from /table/tables.json (managed by
// install.sh table-add). Each carries a felt image + matching dealer/SB/BB pucks,
// and is offered in BOTH the Table panel (felt + pucks) and the Pucks panel.
var _galleryTables = [];
function _galleryTableById(id){ for (var i=0;i<_galleryTables.length;i++) if (_galleryTables[i].id===id) return _galleryTables[i]; return null; }
function _loadGalleryTables() {
  try {
    fetch('/table/tables.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (list) {
        if (!Array.isArray(list)) return;
        _galleryTables = list.filter(function (t) { return t && t.id && t.feltUrl; }).map(function (t) {
          var pk = null, pv = t.pucks;
          if (pv) { pk = {}; ['dealer','sb','bb'].forEach(function (k) { if (pv[k]) pk[k] = 'url(' + pv[k] + ')'; }); }
          return { id: String(t.id), name: t.name || String(t.id), feltUrl: t.feltUrl, pucks: pk, preview: t.preview || (pv && pv.dealer) || null, swatch: '#1e6b1e' };
        }).filter(function (t) { if (_isBuiltinTable(t.id)) return false; for (var i=0;i<_tablePkgs.length;i++) if (_tablePkgs[i].id===t.id) return false; return true; });
        try { table.apply(table.get()); pucks.apply(pucks.get()); } catch (e) {}
        if (_body) _render();
      })
      .catch(function () {});
  } catch (e) {}
}

// ── Theme packages : un "table style" importe se decompose en une palette (couleurs UI/popups)
//    + un tapis (feutre, liseré, image) + un preset combinant les deux. ──
var _palettePkgs = [], _tablePkgs = [], _pkgPresets = [], _puckPkgs = [], _buttonPkgs = [];
var PALETTE_TOKENS = ['felt','felt-mid','felt-hi','panel','panel-hi','gold','gold-hi','gold-dim','cream','text','text-hi','border','border-hi','modal-bg','body-glow'];
var TABLE_TOKENS = ['felt-base-hi','felt-base-mid','felt-base-lo','rail','rail-dark','rail-glow'];
function _palettePkgById(id){ for (var i=0;i<_palettePkgs.length;i++) if (_palettePkgs[i].id===id) return _palettePkgs[i]; return null; }
function _tablePkgById(id){ for (var i=0;i<_tablePkgs.length;i++) if (_tablePkgs[i].id===id) return _tablePkgs[i]; return null; }
function _puckPkgById(id){ for (var i=0;i<_puckPkgs.length;i++) if (_puckPkgs[i].id===id) return _puckPkgs[i]; return null; }
function _buttonPkgById(id){ for (var i=0;i<_buttonPkgs.length;i++) if (_buttonPkgs[i].id===id) return _buttonPkgs[i]; return null; }
function _isBuiltinPalette(id){ for (var i=0;i<PALETTES.length;i++) if (PALETTES[i].id===id) return true; return false; }
function _isBuiltinTable(id){ for (var i=0;i<TABLES.length;i++) if (TABLES[i].id===id) return true; return false; }
function _injectAxis(keys, pkg, storeKey, withFelt){
  var el=document.documentElement, css='';
  for (var i=0;i<keys.length;i++){
    var k=keys[i], v=(pkg&&pkg.tokens)?pkg.tokens[k]:null;
    if (v!=null){ el.style.setProperty('--'+k,v); css+='--'+k+':'+v+';'; } else el.style.removeProperty('--'+k);
  }
  if (withFelt){
    if (pkg&&(pkg.feltUrl||pkg.felt)){ var fi='url('+(pkg.feltUrl||('/themes/'+pkg.id+'/'+pkg.felt))+') center / cover no-repeat'; el.style.setProperty('--felt-img',fi); css+='--felt-img:'+fi+';'; }
    else el.style.removeProperty('--felt-img');
  }
  try{ if(css) localStorage.setItem(storeKey,css); else localStorage.removeItem(storeKey); }catch(e){}
}
function _injectPalette(pkg){ _injectAxis(PALETTE_TOKENS, pkg, 'pth_theme_css', false); }
function _injectTable(pkg){ _injectAxis(TABLE_TOKENS, pkg, 'pth_table_css', true); }
function _injectButtons(spec){
  var el=document.documentElement, css='';
  for (var i=0;i<BUTTON_TOKENS.length;i++) el.style.removeProperty('--'+BUTTON_TOKENS[i]);
  var IMG=['--btn-fold-img','--btn-check-img','--btn-call-img','--btn-raise-img','--btn-allin-img'];
  for (var j=0;j<IMG.length;j++) el.style.removeProperty(IMG[j]);
  el.removeAttribute('data-btn-img');
  if (spec && spec.colors){
    for (var k=0;k<BUTTON_TOKENS.length;k++){ var key=BUTTON_TOKENS[k], v=spec.colors[key]; if(v!=null){ el.style.setProperty('--'+key,v); css+='--'+key+':'+v+';'; } }
  }
  if (spec && spec.images){
    var M=[['fold','--btn-fold-img'],['check','--btn-check-img'],['call','--btn-call-img'],['raise','--btn-raise-img'],['allin','--btn-allin-img']];
    for (var m2=0;m2<M.length;m2++){ var u=spec.images[M[m2][0]]; if(u){ el.style.setProperty(M[m2][1],u); css+=M[m2][1]+':'+u+';'; } }
    el.setAttribute('data-btn-img','1'); css+='data-btn-img:1;';
  }
  try{ if(css) localStorage.setItem('pth_buttons_css',css); else localStorage.removeItem('pth_buttons_css'); }catch(e){}
}
function _injectPucks(set){
  var el=document.documentElement, css='', M=[['dealer','--puck-dealer'],['sb','--puck-sb'],['bb','--puck-bb']];
  var urls={dealer:null,sb:null,bb:null};
  for (var j=0;j<M.length;j++){
    var u=set?set[M[j][0]]:null;
    if (u){ el.style.setProperty(M[j][1],u); css+=M[j][1]+':'+u+';';
      var s=String(u), p=s.indexOf('url('); if(p>=0){ s=s.slice(p+4); var q=s.indexOf(')'); if(q>=0) s=s.slice(0,q); s=s.replace(/^\s*["']|["']\s*$/g,'').trim(); }
      urls[M[j][0]]=s||null;
    } else el.style.removeProperty(M[j][1]);
  }
  // iOS WebKit renvoie parfois une valeur PERIMEE de getComputedStyle pour une custom
  // property modifiee en JS -> le puck restait fige sur l'ancien theme. On publie les
  // URLs directement pour que le rendu (chipSvg/_pthPuck) les lise sans getComputedStyle.
  try { window._pthPuckUrls = urls; } catch(e){}
  try{ if(css) localStorage.setItem('pth_pucks_css',css); else localStorage.removeItem('pth_pucks_css'); }catch(e){}
}
var _palApply = palette.apply;
palette.apply = function(id){
  _palApply(id);
  try{ if (_isBuiltinPalette(id)) _injectPalette(null); else { var pk=_palettePkgById(id); if(pk) _injectPalette(pk); } }catch(e){}
};
palette.set = palette.apply;
var _tblApply = table.apply;
table.apply = function(id){
  _tblApply(id);
  try{ if (_isBuiltinTable(id)) _injectTable(null); else { var pk=_tablePkgById(id); if(pk) _injectTable(pk); else { var gt=_galleryTableById(id); if(gt) _injectAxis(TABLE_TOKENS,{id:gt.id,tokens:{},feltUrl:gt.feltUrl},'pth_table_css',true); } } }catch(e){}
};
table.set = table.apply;
var _btnApply = buttons.apply;
buttons.apply = function(id){ _btnApply(id); try{
  if (id==='glossy') _injectButtons({colors:BUTTON_GLOSSY});
  else if (!id) _injectButtons(null);
  else { var pk=_buttonPkgById(id); _injectButtons(pk?{images:pk.images,colors:pk.colors}:null); }
}catch(e){} };
buttons.set = buttons.apply;
var _pkApply = pucks.apply;
pucks.apply = function(id){ _pkApply(id); try{
  if (id==='pokerth') _injectPucks(PUCK_SET);
  else if (!id) _injectPucks(null);
  else { var pk=_puckPkgById(id); if(pk) _injectPucks(pk.set); else { var gt=_galleryTableById(id); if(gt) _injectPucks(gt.pucks||null); } }
}catch(e){}
  // Les pucks sont des <img> figes au rendu (le feutre, lui, est une variable CSS live) :
  // apres avoir change --puck-*, on redemande un rendu des sieges + barre heros pour que
  // les jetons affiches prennent le nouveau motif. No-op hors partie (garde seats.length).
  try { if (window._renderSeats) window._renderSeats(); } catch (e) {}
};
pucks.set = pucks.apply;
try{ _injectButtons(buttons.get()==='glossy'?{colors:BUTTON_GLOSSY}:null); _injectPucks(pucks.get()==='pokerth'?PUCK_SET:null); }catch(e){}
function _loadThemes(){
  try{
    fetch('/themes/themes.json',{cache:'no-store'})
      .then(function(r){return r.ok?r.json():[];})
      .then(function(list){
        if(!Array.isArray(list)) return;
        var pkgs=list.filter(function(p){return p&&p.id&&(p.palette||p.table||p.felt||p.pucks||p.buttonImages||p.buttons);});
        _palettePkgs=pkgs.filter(function(p){return p.palette;}).map(function(p){ return {id:String(p.id),name:p.name||String(p.id),swatch:p.swatch||'#444',tokens:p.palette}; }).filter(function(p){ return !_isBuiltinPalette(p.id); });
        _tablePkgs=pkgs.filter(function(p){return p.table||p.felt;}).map(function(p){ return {id:String(p.id),name:p.name||String(p.id),swatch:p.swatch||'#444',tokens:p.table||{},felt:p.felt||null}; }).filter(function(p){ return !_isBuiltinTable(p.id); });
        _pkgPresets=pkgs.filter(function(p){return p.palette||p.table||p.felt;}).map(function(p){ var vals={theme:(p.palette?String(p.id):''),table:((p.table||p.felt)?String(p.id):''),buttons:'glossy',pucks:'pokerth'}; if(p.deck) vals.deck=String(p.deck); return {id:'pkg-'+p.id,name:p.name||String(p.id),swatch:p.swatch||'#444',values:vals}; });
        _puckPkgs=pkgs.filter(function(p){return p.pucks;}).map(function(p){ var set={},pv=p.pucks; ['dealer','sb','bb'].forEach(function(k){ if(pv[k]) set[k]='url(/themes/'+p.id+'/'+pv[k]+')'; }); return {id:String(p.id),name:p.name||String(p.id),swatch:p.swatch||'#444',set:set,preview:(pv.dealer?'/themes/'+p.id+'/'+pv.dealer:null)}; }).filter(function(p){ return p.id!=='pokerth'; });
        _buttonPkgs=pkgs.filter(function(p){return p.buttonImages||p.buttons;}).map(function(p){ var e={id:String(p.id),name:p.name||String(p.id),swatch:p.swatch||'#444'}; if(p.buttonImages){ e.images={}; ['fold','check','call','raise','allin'].forEach(function(k){ if(p.buttonImages[k]) e.images[k]='url(/themes/'+p.id+'/'+p.buttonImages[k]+')'; }); } if(p.buttons){ e.colors=p.buttons; } return e; }).filter(function(p){ return p.id!=='glossy'; });
        try{ var pp=_palettePkgById(palette.get()); if(pp) _injectPalette(pp); var tp=_tablePkgById(table.get()); if(tp) _injectTable(tp); }catch(e){}
        try{ buttons.apply(buttons.get()); pucks.apply(pucks.get()); }catch(e){}
        if(_body) _render();
      }).catch(function(){});
  }catch(e){}
}
_loadThemes();
_loadGalleryTables();

// ── Single "Theme" panel ────────────────────────────────────────────────
const PANEL_ID = 'theme-panel', OVERLAY_ID = 'theme-panel-overlay';
var _body = null; // re-rendered on each change so highlights stay in sync
var _openSec = null; // which dropdown is expanded (accordion; one open at a time)
var _openBlockEl = null; // DOM node of the expanded section (set during render, used for auto-scroll)

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
function _presetById(id) { var all = PRESETS.concat(_pkgPresets); for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return PRESETS[0]; }

function _feltStyle(t) {
  if (t && t.id === 'photo') return 'background:url(/table/felt-green.jpg) center/cover';
  if (t && t.feltUrl) return 'background:url(' + t.feltUrl + ') center/cover';
  if (t && t.felt) return 'background:url(/themes/' + t.id + '/' + t.felt + ') center/cover';
  var sw = (t && t.swatch) || '#1e6b1e';
  return 'background:' + sw + ';background:radial-gradient(circle at 50% 36%, color-mix(in srgb,' + sw + ',#fff 12%), color-mix(in srgb,' + sw + ',#000 55%))';
}
function _pngFan(deckId, big) {
  function c(src, x, r) { return '<img src="' + src + '" alt="" style="position:absolute;top:50%;left:' + x + '%;height:' + (big ? 80 : 76) + '%;width:auto;aspect-ratio:5/7;border-radius:3px;transform:translateY(-50%) rotate(' + r + 'deg);box-shadow:0 1px 3px rgba(0,0,0,.5)">'; }
  var ext = _deckExt(deckId); var bust = '?v=' + (window.BUILD_VERSION || '0'); return c('/cards/' + deckId + '/flipside.' + ext + bust, big ? 8 : 6, -12) + c('/cards/' + deckId + '/25.' + ext, big ? 32 : 30, 0) + c('/cards/' + deckId + '/38.' + ext, big ? 54 : 52, 12);
}
// Mini card faces for previews, matching the in-game Classic layout
// (rank+suit index top-left, large suit pip centered).
function _miniFront(rank, suit, red, big, pos) {
  var col = red ? '#c0392b' : '#15110c';
  return '<span style="position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;' + pos + 'background:#f7f4ec;border-radius:3px;height:' + (big ? 80 : 76) + '%;aspect-ratio:5/7;box-shadow:0 1px 3px rgba(0,0,0,.5);color:' + col + ';font-weight:800;line-height:1.05">'
    + '<span style="font-size:' + (big ? '0.95rem' : '0.56rem') + '">' + rank + '</span>'
    + '<span style="font-size:' + (big ? '0.9rem' : '0.54rem') + '">' + suit + '</span></span>';
}
function _miniBack(big, pos) {
  return '<span style="position:absolute;display:flex;align-items:center;justify-content:center;' + pos + 'border-radius:3px;height:' + (big ? 80 : 76) + '%;aspect-ratio:5/7;background:radial-gradient(circle at 50% 44%,#234023,#0c1c0e);box-shadow:inset 0 0 0 1px #c8a84a,0 1px 3px rgba(0,0,0,.5)">'
    + '<span style="color:#e0c070;font-size:' + (big ? '1rem' : '0.6rem') + ';font-family:Georgia,serif">\u2660</span></span>';
}
function _classicFan(big) {
  // back + two fronts, same fan positions as _pngFan
  return _miniBack(big, 'top:50%;left:' + (big ? 8 : 6) + '%;transform:translateY(-50%) rotate(-12deg);')
    + _miniFront('A', '\u2665', true, big, 'top:50%;left:' + (big ? 32 : 30) + '%;transform:translateY(-50%) rotate(0deg);')
    + _miniFront('A', '\u2660', false, big, 'top:50%;left:' + (big ? 54 : 52) + '%;transform:translateY(-50%) rotate(12deg);');
}
function _cardOnFelt(deckId, big) {
  if (deckId) return '<img src="/cards/' + deckId + '/38.' + _deckExt(deckId) + '" alt="" style="position:absolute;top:50%;left:50%;height:' + (big ? 78 : 74) + '%;width:auto;aspect-ratio:5/7;border-radius:3px;transform:translate(-50%,-50%) rotate(-6deg);box-shadow:0 2px 5px rgba(0,0,0,.5)">';
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
    var cards = (item && item.id) ? _pngFan(item.id, big) : _classicFan(big);
    return '<span style="' + box + ';background:linear-gradient(160deg,#1c5a28,#0c3214)">' + cards + '</span>';
  }
  if (kind === 'pucks') {
    if (item && item.preview) return '<span style="' + box + ';background:#0b1a0d;display:flex;align-items:center;justify-content:center"><img src="' + item.preview + '" alt="" style="width:90%;height:90%;object-fit:contain;display:block"></span>';
    var ds = big ? 22 : 13;
    return '<span style="' + box + ';background:#14331a;display:flex;align-items:center;justify-content:center"><i style="width:' + ds + 'px;height:' + ds + 'px;border-radius:50%;background:#c8a850;border:2px solid #fff;box-shadow:0 0 0 1px #0006"></i></span>';
  }
  if (kind === 'preset') {
    var _tv = (item && item.values) ? item.values.table : '';
    var t = _isBuiltinTable(_tv) ? _tableById(_tv) : (_tablePkgById(_tv) || (item && item.swatch ? { id: _tv, swatch: item.swatch } : _tableById(_tv)));
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
    _openBlockEl = sec; // remember the expanded block so _render() can scroll it into view
    var list = document.createElement('div');
    list.style.cssText = 'margin-top:5px;border:1px solid var(--border,rgba(200,168,74,0.25));border-radius:8px;overflow:hidden;background:var(--field-bg,#0b1a0d)';
    options.forEach(function (o, idx) {
      var it = document.createElement('div');
      it.style.cssText = 'display:flex;align-items:center;gap:9px;padding:7px 9px;cursor:pointer;' + (idx ? 'border-top:1px solid var(--inset,rgba(255,255,255,0.05));' : '') + (o.active ? 'background:var(--gold,#c8a84a);color:var(--on-gold,#110900)' : '');
      it.innerHTML = _previewHTML(kind, o.item, false)
        + '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.84rem">' + o.name + '</span>'
        + (o.active ? '<span style="color:var(--on-gold,#110900)">\u2713</span>' : '');
      if (!o.active) {
        it.addEventListener('mouseenter', function () { it.style.background = 'var(--inset-hi,rgba(255,255,255,0.07))'; });
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

// Scroll the theme panel so the currently-open accordion section is visible.
// On open, an option list expands in place; without this the panel never
// scrolls, so sections near the bottom (pucks, chips…) reveal their options
// off-screen. We reveal the bottom of the expanded list (with a little
// breathing room); if the section is taller than the panel we align its top
// instead, so the list stays scrollable. Panel-only — no page-scroll effects.
function _scrollOpenIntoView() {
  if (!_openSec || !_openBlockEl) return;
  var panel = document.getElementById(PANEL_ID);
  if (!panel || panel.isConnected === false || _openBlockEl.isConnected === false) return;
  var cs = getComputedStyle(panel);
  var pr = panel.getBoundingClientRect();
  var br = _openBlockEl.getBoundingClientRect();
  var viewTop    = pr.top    + (parseFloat(cs.borderTopWidth)    || 0) + (parseFloat(cs.paddingTop)    || 0);
  var viewBottom = pr.bottom - (parseFloat(cs.borderBottomWidth) || 0) - (parseFloat(cs.paddingBottom) || 0);
  var EXTRA = 10; // small gap so the last option isn't glued to the edge
  var delta = 0;
  if (br.bottom > viewBottom) {
    // Scroll down to reveal the bottom, but never push the block's top above
    // the viewport top (handles lists taller than the panel → align top).
    delta = Math.min(br.bottom - viewBottom + EXTRA, Math.max(0, br.top - viewTop));
  } else if (br.top < viewTop) {
    delta = br.top - viewTop; // section starts above the fold → scroll up
  }
  if (Math.abs(delta) > 1) {
    try { panel.scrollBy({ top: delta, behavior: 'smooth' }); }
    catch (e) { panel.scrollTop += delta; }
  }
}

function _render() {
  if (!_body) return;
  _body.innerHTML = '';
  _openBlockEl = null;

  // 1) Presets ("main themes") as a dropdown
  var act = activePreset();
  var presetOptions = PRESETS.concat(_pkgPresets).map(function (p) {
    return { item: p, name: (p.name || _t(p.key, p.fallback)), active: p.id === act, onClick: function () { applyPreset(p.id); _openSec = null; _render(); } };
  });
  var curPreset, curPresetName;
  if (act) { curPreset = _presetById(act); curPresetName = (curPreset.name || _t(curPreset.key, curPreset.fallback)); }
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
    var kind = (ax === palette) ? 'palette' : (ax === table) ? 'table' : (ax === deck) ? 'deck' : (ax === pucks) ? 'pucks' : 'palette';
    // Accordion key MUST be unique per axis, and distinct from `kind` (the
    // preview type). `kind` falls back to 'palette' for buttons (and any future
    // axis), so reusing it as the open-section id made the buttons and palette
    // dropdowns share a key → both opened/closed together. storeKey is unique.
    var secId = ax.storeKey;
    var opts = (ax === deck) ? DECKS.concat(_galleryDecks) : (ax === palette ? PALETTES.concat(_palettePkgs) : (ax === table ? TABLES.concat(_tablePkgs).concat(_galleryTables) : (ax === buttons ? BUTTONS_ITEMS.concat(_buttonPkgs) : (ax === pucks ? PUCKS_ITEMS.concat(_puckPkgs).concat(_galleryTables) : ax.items))));
    var curItem = opts[0];
    for (var i = 0; i < opts.length; i++) if (opts[i].id === cur) curItem = opts[i];
    var curName = curItem.name || _t(curItem.key, curItem.fallback);
    var options = opts.map(function (it) {
      return {
        item: it, name: (it.name || _t(it.key, it.fallback)), active: it.id === cur,
        onClick: (function (id) { if (ax === table && _galleryTableById(id)) return function () { table.apply(id); pucks.apply(id); _openSec = null; _render(); }; return function () { ax.apply(id); _openSec = null; _render(); }; })(it.id),
      };
    });
    _body.appendChild(_dropdownBlock(secId, _t(ax.titleKey, ax.titleFallback), kind, curItem, curName, options));
  });

  // After (re)building the body, keep an expanded section in view.
  if (_openSec && _openBlockEl && typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(_scrollOpenIntoView);
  }
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
  panel.style.cssText = 'position:fixed;z-index:9999;box-sizing:border-box;width:min(340px, calc(100vw - 16px));max-height:74vh;overflow:auto;'
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
  // Re-pull the runtime galleries each time the panel opens, so packages just
  // imported in the admin show up without reloading the app. Each loader calls
  // _render() again when its fetch resolves (network-first via the service
  // worker), refreshing the open panel in place.
  try { _loadGalleryDecks(); _loadGalleryTables(); _loadThemes(); } catch (e) {}

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
window._refreshThemePanel = function () { try { _render(); } catch (e) {} };
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
