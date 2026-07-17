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
  { id: 'pokerth',       key: 'themeDark',  fallback: 'Dark',  swatch: '#1d222b' },
  { id: 'pokerth-light', key: 'themeLight', fallback: 'Light', swatch: '#dce2ec' },
];
// Styles de table facon officielle (StyleProvider) : chaque style embarque son
// feutre + ses pucks + son skin de boutons. mode: 'fs' = image plein ecran
// (--wallpaper, ovale transparent) · 'full' = image dans l'ovale (--table-img) ·
// 'felt' = feutre ovale (--felt-img). id '' = PokerTH officiel fullscreen (defaut).
const TABLES = [
  { id: '',             key: 'tablePokerthOfficial', fallback: 'PokerTH',      swatch: '#1d222b', feltUrl: '/table/pokerth-official-fs/felt.png', mode: 'fs',   puck: 'pokerth', btn: 'glossy' },
  { id: 'pokerth-live', key: 'tablePokerthLive',     fallback: 'Spectator Tools', swatch: '#0e4a2a', feltUrl: '/table/pokerth-live/felt.png',        mode: 'full', puck: 'pokerth', btn: 'glossy' },
  { id: 'casino',       key: 'tableCasino',          fallback: 'Green Casino', swatch: '#1e6b1e', feltUrl: '/table/casino/felt.png', preview: '/table/casino/preview.png', mode: 'fs', align: 'center', puck: 'casino',  btn: 'casino' },
  // Tapis par defaut du client QML (data/gfx/qml/table/*, AGPL-3.0) — plein ecran.
  { id: 'danuxi', key: 'tableDanuxi', fallback: "Danuxi Blue", swatch: '#1f3a5c', feltUrl: '/table/danuxi/felt.png', preview: '/table/danuxi/preview.png', mode: 'fs', skin: true, align: 'center', zoom: 1.3 },
  { id: 'mute', key: 'tableMute', fallback: "Mute", swatch: '#2a2f38', feltUrl: '/table/mute/felt.png', preview: '/table/mute/preview.png', mode: 'fs', skin: true, align: 'center' },
  { id: 'mute2', key: 'tableMute2', fallback: "Mute 02", swatch: '#1f6aa8', feltUrl: '/table/mute2/felt.png', preview: '/table/mute2/preview.png', mode: 'fs', skin: true, align: 'center' },
  { id: 'teal', key: 'tableTeal', fallback: "Teal", swatch: '#0e5c5c', feltUrl: '/table/teal/felt.png', preview: '/table/teal/preview.png', mode: 'fs', skin: true, align: 'center bottom' },
  { id: 'lemming', key: 'tableLemming', fallback: "Lemming", swatch: '#2e6b2e', feltUrl: '/table/lemming/felt.png', preview: '/table/lemming/preview.png', mode: 'fs', skin: true, align: 'center bottom' },
  { id: 'matrix', key: 'tableMatrix', fallback: "Matrix", swatch: '#0b2b12', feltUrl: '/table/matrix/felt.png', preview: '/table/matrix/preview.png', mode: 'fs', skin: true, align: 'center', zoom: 1.25 },
  { id: 'star_trek', key: 'tableStarTrek', fallback: "Star Trek", swatch: '#101826', feltUrl: '/table/star_trek/felt.png', preview: '/table/star_trek/preview.png', mode: 'fs', skin: true, align: 'center', zoom: 1.3 },
  { id: 'tripsixes', key: 'tableTripSixes', fallback: "TripSixes", swatch: '#5a1010', feltUrl: '/table/tripsixes/felt.png', preview: '/table/tripsixes/preview.png', mode: 'fs', skin: true, align: 'center' },
  { id: 'wanted', key: 'tableWanted', fallback: "Wanted", swatch: '#6b4a1e', feltUrl: '/table/wanted/felt.png', preview: '/table/wanted/preview.png', mode: 'fs', skin: true, align: 'center' },
  { id: 'xanax', key: 'tableXanax', fallback: "Xanax", swatch: '#394150', feltUrl: '/table/xanax/felt.png', preview: '/table/xanax/preview.png', mode: 'fs', skin: true, align: 'center' },
];
const DECKS = [
  { id: 'casino-vert', key: 'deckCasinoVert', fallback: 'Green Casino', swatch: '#1e6b1e', ext: 'svg' },
  { id: 'pokerth', key: 'deckPokerth', fallback: 'PokerTH', swatch: '#1d6b30', ext: 'png' },
  { id: 'pokerth-1-0', key: 'deckPokerth10', fallback: 'PokerTH 1.0', swatch: '#1d6b30', ext: 'png' },
  { id: 'pokerth-new', key: 'deckPokerthNew', fallback: 'PokerTH Royal Classic', by: 'PokerTH Development Team', swatch: '#a52a2a', ext: 'svg' },
];

// Buttons axis: a built-in "Glossy" scheme (PokerTH colour-coding, kept so
// actions stay readable). Tokens map to var(--btn-*) in pokerth.css.
var BUTTON_TOKENS = ['btn-fold-bg','btn-fold-fg','btn-check-bg','btn-check-fg','btn-call-bg','btn-call-fg','btn-raise-bg','btn-raise-fg','btn-allin-bg','btn-allin-bd','btn-allin-fg','btn-allin-fg-b'];
var BUTTON_GLOSSY = {
  'btn-fold-bg':'linear-gradient(180deg, #d94040 0%, #b22d2d 48%, #8b1a1a 100%)','btn-fold-fg':'#ffe6e6',
  'btn-check-bg':'linear-gradient(180deg, #4080d8 0%, #2d5fb2 48%, #1a3d8b 100%)','btn-check-fg':'#e6f0ff',
  'btn-call-bg':'linear-gradient(180deg, #4080d8 0%, #2d5fb2 48%, #1a3d8b 100%)','btn-call-fg':'#e6f0ff',
  'btn-raise-bg':'linear-gradient(180deg, #50b840 0%, #378f2a 48%, #1e6614 100%)','btn-raise-fg':'#eaffea',
  'btn-allin-bg':'linear-gradient(180deg, #9e2a2a 0%, #7d1e1e 48%, #5c1111 100%)','btn-allin-bd':'#ef5350','btn-allin-fg':'#fff4ec','btn-allin-fg-b':'#ffffff'
};
// Flat = meme code couleur que Glossy mais en aplat (aucun degrade, all-in plein au
// lieu de transparent -> volontairement plus plat). Teintes = points 48% des degrades Glossy.
var BUTTON_FLAT = {
  'btn-fold-bg':'#b22d2d','btn-fold-fg':'#ffe6e6',
  'btn-check-bg':'#2d5fb2','btn-check-fg':'#e6f0ff',
  'btn-call-bg':'#2d5fb2','btn-call-fg':'#e6f0ff',
  'btn-raise-bg':'#378f2a','btn-raise-fg':'#eaffea',
  'btn-allin-bg':'#7d1e1e','btn-allin-bd':'#7d1e1e','btn-allin-fg':'#fff4ec','btn-allin-fg-b':'#ffffff'
};
// Pucks axis: a built-in "PokerTH" set (dealer/SB/BB marker images, shared).
var PUCK_SET = { dealer:'url(/pucks/dealer.svg)', sb:'url(/pucks/sb.svg)', bb:'url(/pucks/bb.svg)' };
// Green Casino : pucks + boutons d'action skinnes (SVG du theme casino-vert), desormais
// portes par le style de table plutot que par des axes separes.
var CASINO_PUCKS = { dealer:'url(/themes/casino-vert/dealer.svg)', sb:'url(/themes/casino-vert/sb.svg)', bb:'url(/themes/casino-vert/bb.svg)' };
var CASINO_BTN = { images:{ fold:'url(/themes/casino-vert/btn-fold.svg)', check:'url(/themes/casino-vert/btn-check.svg)', call:'url(/themes/casino-vert/btn-call.svg)', raise:'url(/themes/casino-vert/btn-raise.svg)', allin:'url(/themes/casino-vert/btn-allin.svg)' }, colors:{ 'btn-fold-fg':'#ffd0d0','btn-check-fg':'#c0ffc0','btn-call-fg':'#c0d8ff','btn-raise-fg':'#110900','btn-allin-fg':'#e88a8a','btn-allin-fg-b':'#f4b0b0' } };
var BUTTONS_ITEMS = [ {id:'',key:'buttonsAuto',fallback:'Auto (table)',swatch:'#4080d8'}, {id:'flat',key:'buttonsFlat',fallback:'Flat',swatch:'#6b2020'}, {id:'glossy',key:'buttonsGlossy',fallback:'Glossy',swatch:'#c81818'}, {id:'pokerth',key:'buttonsPokerth',fallback:'PokerTH',swatch:'#4080d8'} ];
var PUCKS_ITEMS   = [ {id:'',key:'pucksAuto',fallback:'Auto (table)',swatch:'#3a78d8',preview:'/pucks/dealer.svg'}, {id:'pokerth',key:'pucksPokerth',fallback:'PokerTH',swatch:'#3a78d8',preview:'/pucks/dealer.svg'}, {id:'casino',key:'pucksCasino',fallback:'Casino',swatch:'#caa64a',preview:'/themes/casino-vert/dealer.svg'} ];
// Seats axis: seat "packs" (layout + graphics), like decks/tables. A pack is a
// CSS block keyed on html[data-seat="<id>"] (seat DOM stays neutral via
// display:contents -> CSS-only) + optional assets under /seats/<id>/. id '' =
// Classic (historical render). Add a pack = one item here; panel lists it auto.
// ── Descripteur de pack de sièges (étape 3) ────────────────────────────────
// Traits comportementaux lus par renderSeats (pokerth.js) via
// window._seatPackTraits(id). Depuis 0.3.695, la STRUCTURE QML est la norme :
// défauts = traits QML complets pour TOUS les packs (intégrés et importés) ;
// un pack peut surcharger n'importe quel trait via l'objet "traits" de son
// seat.json (qmlStruct:false = opt-out complet de la structure commune) :
//   holePlate      cartes dans la boîte (dos adversaires / faces self)
//   betOut         jeton de mise HORS boîte (politique betside QML)
//   pucksSide      pucks D/SB/BB sur le côté de la boîte (dealer officiel)
//   flagInfo       drapeau dans la rangée info wide (sinon coin d'avatar)
//   timerRect      décompte = cadre rect + barre sur les cartes (sinon anneau)
//   winnerBadge    pastille WINNER au showdown
//   selfStrip      strip de mise sous la self-box
//   selfBigCards   cartes self grandes dans la boîte
//   badgeOnCards   badge d'action centré sur les hole-cards
//   qmlSelf        géométrie self QML (self = perle, pas de multiplicateur)
//   narrowByOrient boîte narrow quand la disposition est portrait
//   qmlStruct      structure/gabarit CSS QML (html[data-seat-struct="qml"])
const SEAT_TRAIT_KEYS = ['holePlate','betOut','pucksSide','flagInfo','timerRect','winnerBadge','selfStrip','selfBigCards','badgeOnCards','qmlSelf','narrowByOrient','qmlStruct'];
const SEAT_TRAITS_QML = { holePlate:true, betOut:true, pucksSide:true, flagInfo:true, timerRect:true, winnerBadge:true, selfStrip:true, selfBigCards:true, badgeOnCards:true, qmlSelf:true, narrowByOrient:true, qmlStruct:true };
const SEAT_TRAIT_DEFAULTS = SEAT_TRAITS_QML; // packs importés / inconnus = structure commune
// Page blanche (demande narmod 17/07) : seul le pack « PokerTH » reste
// intégré ; les anciens packs web (Classic, Chip, Plate, Card, Compact, Bar)
// sont retirés — les prochains sièges naîtront en packs importés (style.css
// libre + traits) sur le cadre virtuel QML.
const SEATS = [
  { id: 'pokerth', key: 'seatPokerth', fallback: 'PokerTH', swatch: '#1d222b', traits: SEAT_TRAITS_QML },
];
const palette = makeAxis({ storeKey: 'pth_theme', attr: 'data-theme', items: PALETTES, def: 'auto',    titleKey: 'sectionPalette', titleFallback: 'Palette' });
const table   = makeAxis({ storeKey: 'pth_table', attr: 'data-table', items: TABLES, def: '', titleKey: 'sectionTable',   titleFallback: 'Table' });
const deck    = makeAxis({ storeKey: 'pth_deck',  attr: 'data-deck',  def: 'pokerth-new',  items: DECKS,    titleKey: 'sectionDeck',    titleFallback: 'Cards' });
const buttons = makeAxis({ storeKey: 'pth_buttons', attr: 'data-buttons', def: 'glossy', items: BUTTONS_ITEMS, titleKey: 'sectionButtons', titleFallback: 'Buttons' });
const pucks   = makeAxis({ storeKey: 'pth_pucks',   attr: 'data-pucks',   def: '',           items: PUCKS_ITEMS,   titleKey: 'sectionPucks',   titleFallback: 'Pucks' });
// Defaut : pack unique « PokerTH » (fusion paysage/portrait 0.3.691) sur TOUS
// les appareils ; la variante suit html[data-seat-orient] (posé par pokerth.js
// selon la disposition réellement retenue). Un choix enregistré prime.
var _seatDef = 'pokerth';
const seat    = makeAxis({ storeKey: 'pth_seat',    attr: 'data-seat',    def: _seatDef,      items: SEATS,         titleKey: 'sectionSeat',    titleFallback: 'Seats' });
const AXES = [table, deck, seat];

// ── Presets (main themes) ───────────────────────────────────────────────────
// A preset is just a named combo of axis ids. "Casino vert" = all defaults
// (this project's look). "Official PokerTH" ≈ the official client (dark UI +
// textured green felt + vector cards). Order = display order.
// Presets INTERNES (plus affiches dans le panneau) : conserves uniquement pour le
// theme par defaut configurable cote admin (window.applyThemePreset). Boutons/pucks
// ne sont plus des valeurs d'axe -> ils sont injectes par le style de table choisi.
const PRESETS = [
  { id: 'official',      key: 'presetPokerthOfficial',      fallback: 'PokerTH Dark',  swatch: '#1d222b', values: { theme: 'pokerth',       table: 'pokerth-live', deck: 'pokerth-new' } },
  { id: 'officiallight', key: 'presetPokerthOfficialLight', fallback: 'PokerTH Light', swatch: '#dce2ec', values: { theme: 'pokerth-light', table: 'pokerth-live', deck: 'pokerth-new' } },
  { id: 'casino',        key: 'presetCasino',               fallback: 'Green Casino',  swatch: '#1e6b1e', values: { table: 'casino',        deck: 'casino-vert' } },
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

// Migration « structure officielle » (axes A). Palettes -> Dark/Light ; tables ->
// styles officiels bundles (feutre+pucks+boutons). Anciennes valeurs hors-liste
// remappees une seule fois. Boutons/pucks ne sont plus des axes : le style de table
// les injecte, donc on efface leurs CSS memorises pour repartir propre.
try {
  if (!localStorage.getItem('pth_axesA_mig')) {
    var _mTh = localStorage.getItem('pth_theme');
    if (_mTh && _mTh !== 'pokerth' && _mTh !== 'pokerth-light' && _mTh !== 'auto') { localStorage.setItem('pth_theme', 'pokerth'); localStorage.removeItem('pth_theme_css'); }
    var _mTb = localStorage.getItem('pth_table'), _mDk = localStorage.getItem('pth_deck'), _mNew;
    if (_mDk === 'casino-vert') _mNew = 'casino';
    else if (_mTb === 'pokerth-live') _mNew = 'pokerth-live';
    else _mNew = '';   // PokerTH par defaut (couvre '', blue, bordeaux, slate, photo, pokerth)
    if (_mNew) localStorage.setItem('pth_table', _mNew); else localStorage.removeItem('pth_table');
    localStorage.removeItem('pth_table_css'); localStorage.removeItem('pth_table_full');
    localStorage.removeItem('pth_buttons_css'); localStorage.removeItem('pth_pucks_css');
    localStorage.setItem('pth_axesA_mig', '1');
  }
} catch (e) {}

// Pucks redevient un axe selectionnable (defaut « Auto (table) »). Nettoie les
// anciennes valeurs de pth_pucks hors {pokerth,casino} -> Auto, une seule fois.
try {
  if (!localStorage.getItem('pth_pucksB_mig')) {
    var _mpp = localStorage.getItem('pth_pucks');
    if (_mpp !== 'pokerth' && _mpp !== 'casino') localStorage.removeItem('pth_pucks');
    localStorage.setItem('pth_pucksB_mig', '1');
  }
} catch (e) {}
// Selecteur pucks retire (fenetre style QML) : les pucks suivent toujours le tapis.
// On force pth_pucks vide (Auto) une fois pour tous.
try { if (!localStorage.getItem('pth_pucksC_mig')) { localStorage.removeItem('pth_pucks'); localStorage.setItem('pth_pucksC_mig','1'); } } catch (e) {}
// Table « Green » retiree : les utilisateurs qui l'avaient retombent sur le defaut.
try { if (localStorage.getItem('pth_table') === 'green') { localStorage.removeItem('pth_table'); localStorage.removeItem('pth_table_css'); localStorage.removeItem('pth_table_fs'); localStorage.removeItem('pth_table_full'); } } catch (e) {}

// Apply saved values on load (idempotent with the <head> boot snippet).
try { var _lgc = localStorage.getItem('pth_seat'); if (_lgc === 'pokerth-portrait' || { '': 1, chip: 1, plate: 1, card: 1, compact: 1, bar: 1 }[_lgc] === 1) localStorage.setItem('pth_seat', 'pokerth'); } catch (e) {} // migrations : 0.3.691 fusion pokerth-portrait ; 0.3.698 retrait des packs web
try { if (!localStorage.getItem('pth_seat_dmig')) { if (localStorage.getItem('pth_seat') === '') localStorage.removeItem('pth_seat'); localStorage.setItem('pth_seat_dmig', '1'); } } catch (e) {}
AXES.forEach(function (ax) { try { if (ax === seat) { var _sv = ax.get(); if (_sv) document.documentElement.setAttribute(ax.attr, _sv); else document.documentElement.removeAttribute(ax.attr); } else { ax.apply(ax.get()); } } catch (e) {} });
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

// Gallery seat packs (image plates) discovered at runtime from /seats/seats.json
// (managed by the admin panel). A pack = a 9-slice plate image applied to the
// seat box via border-image (CSS vars injected here); merged into the Seats axis
// beside the built-in CSS packs. Best-effort: offline/absent -> built-ins only.
var _gallerySeats = [];
function _gallerySeatById(id) { for (var i = 0; i < _gallerySeats.length; i++) if (_gallerySeats[i].id === id) return _gallerySeats[i]; return null; }
function _isBuiltinSeat(id) { for (var i = 0; i < SEATS.length; i++) if (SEATS[i].id === id) return true; return false; }
function _seatPackTraits(id) {
  var out = {}; for (var k in SEAT_TRAIT_DEFAULTS) out[k] = SEAT_TRAIT_DEFAULTS[k];
  var rec = null;
  for (var i = 0; i < SEATS.length; i++) if (SEATS[i].id === (id || '')) { rec = SEATS[i]; break; }
  if (!rec) rec = _gallerySeatById(id || '');
  if (rec && rec.traits) for (var j = 0; j < SEAT_TRAIT_KEYS.length; j++) { var key = SEAT_TRAIT_KEYS[j]; if (key in rec.traits) out[key] = !!rec.traits[key]; }
  return out;
}
try { window._seatPackTraits = _seatPackTraits; } catch (e) {}
function _loadGallerySeats() {
  try {
    fetch('/seats/seats.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (list) {
        if (!Array.isArray(list)) return;
        _gallerySeats = list.filter(function (s) { return s && s.id && (s.plateUrl || s.cssUrl); }).map(function (s) {
          var slice = (s.slice != null ? s.slice : 34), width = (s.width != null ? s.width : 15), pad = s.pad || '6px 12px';
          return { id: String(s.id), name: s.name || String(s.id), by: (s.by ? String(s.by) : null), traits: (s.traits && typeof s.traits === 'object') ? s.traits : null, swatch: s.swatch || '#394150', preview: s.preview || null,
                   plateUrl: s.plateUrl || null, cssUrl: s.cssUrl || null, selfUrl: s.selfUrl || null,
                   slice: slice, width: width, pad: pad,
                   selfSlice: (s.selfSlice != null ? s.selfSlice : slice), selfWidth: (s.selfWidth != null ? s.selfWidth : width), selfPad: s.selfPad || pad };
        }).filter(function (s) { return !_isBuiltinSeat(s.id); });
        try { seat.apply(seat.get()); } catch (e) {}   // pack now known -> inject its vars
        if (_body) _render();
      })
      .catch(function () {});
  } catch (e) {}
}
// A seat image pack drives the box via CSS vars + data-seat-img (one generic CSS
// block in pokerth.css). Persisted to pth_seat_css / pth_seat_img so the <head>
// boot snippet restores it zero-flash on reload. null = clear (back to a built-in).
function _injectSeatPkg(s) {
  var el = document.documentElement, css = '';
  function setv(k, v) { el.style.setProperty(k, v); css += k + ':' + v + ';'; }
  // Feuille de style LIBRE du pack (style.css) : <link> injecté tant que le
  // pack est actif, retiré au changement — le design du pack ne fuit jamais
  // sur les autres. Restauration zéro-flash par le snippet <head>
  // (pth_seat_css_url). Ajouté en FIN de <head> -> prime sur pokerth.css à
  // spécificité égale.
  try {
    var lk = document.getElementById('seat-pack-style');
    if (s && s._cssText) {              // pack importé LOCALEMENT : <style> texte
      if (lk && lk.tagName !== 'STYLE') { lk.remove(); lk = null; }
      if (!lk) { lk = document.createElement('style'); lk.id = 'seat-pack-style'; document.head.appendChild(lk); }
      if (lk.textContent !== s._cssText) lk.textContent = s._cssText;
      localStorage.setItem('pth_seat_css_txt', s._cssText); localStorage.removeItem('pth_seat_css_url');
    } else if (s && s.cssUrl) {         // pack serveur (galerie) : <link>
      if (lk && lk.tagName !== 'LINK') { lk.remove(); lk = null; }
      if (!lk) { lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.id = 'seat-pack-style'; document.head.appendChild(lk); }
      if (lk.getAttribute('href') !== s.cssUrl) lk.setAttribute('href', s.cssUrl);
      localStorage.setItem('pth_seat_css_url', s.cssUrl); localStorage.removeItem('pth_seat_css_txt');
    } else {
      if (lk) lk.remove();
      localStorage.removeItem('pth_seat_css_url'); localStorage.removeItem('pth_seat_css_txt');
    }
  } catch (e) {}
  if (s && s.plateUrl) {
    setv('--seat-pkg-img', 'url(' + s.plateUrl + ')');
    setv('--seat-pkg-slice', s.slice + '%');
    setv('--seat-pkg-width', s.width + 'px');
    setv('--seat-pkg-pad', s.pad);
    el.setAttribute('data-seat-img', '1');
    if (s.selfUrl) {
      setv('--seat-pkg-self-img', 'url(' + s.selfUrl + ')');
      setv('--seat-pkg-self-slice', s.selfSlice + '%');
      setv('--seat-pkg-self-width', s.selfWidth + 'px');
      setv('--seat-pkg-self-pad', s.selfPad);
      el.setAttribute('data-seat-img-self', '1');
    } else el.removeAttribute('data-seat-img-self');
  } else {
    ['--seat-pkg-img', '--seat-pkg-slice', '--seat-pkg-width', '--seat-pkg-pad', '--seat-pkg-self-img', '--seat-pkg-self-slice', '--seat-pkg-self-width', '--seat-pkg-self-pad'].forEach(function (k) { el.style.removeProperty(k); });
    el.removeAttribute('data-seat-img'); el.removeAttribute('data-seat-img-self');
  }
  try { if (css) { localStorage.setItem('pth_seat_css', css); localStorage.setItem('pth_seat_img', (s && s.selfUrl) ? '2' : '1'); } else { localStorage.removeItem('pth_seat_css'); localStorage.removeItem('pth_seat_img'); } } catch (e) {}
}
var _seatApply = seat.apply;
seat.apply = function (id) {
  _seatApply(id);                                  // sets data-seat + persists pth_seat
  try { _injectSeatPkg(_gallerySeatById(id) || null); } catch (e) {}
  // Structure commune QML : attribut CSS piloté par le trait qmlStruct.
  try { if (_seatPackTraits(id).qmlStruct) document.documentElement.setAttribute('data-seat-struct', 'qml'); else document.documentElement.removeAttribute('data-seat-struct'); } catch (e) {}
};
seat.set = seat.apply;
// Setter public pour le monolithe (option « Synchroniser les sieges » des
// Options avancees) : reutilise toute la logique du module (persistance
// pth_seat + nettoyage des packs d'images importes).
try { window._setSeatPack = seat.set; } catch (e) {}
_loadGallerySeats();

// ── Import IN-APP d'un pack de sièges (.zip) — miroir des decks/tables :
// stocké en IndexedDB (pth_imports), restitué en blob URLs au chargement.
// style.css est injecté en <style> TEXTE (persisté dans pth_seat_css_txt
// pour le zéro-flash) ; les url() relatives ne sont PAS résolues en import
// local — utiliser des data-URI dans le CSS, ou l'import serveur (admin).
function _importedSeatToGallery(rec){
  function url(fn){ try{ return (fn && rec.assets && rec.assets[fn]) ? URL.createObjectURL(rec.assets[fn]) : null; }catch(e){ return null; } }
  function num(v,d){ var n=Number(v); return (isFinite(n)&&n>0)?n:d; }
  var cfg=(rec.meta&&rec.meta.cfg)||{}, sc=(cfg.self&&typeof cfg.self==='object')?cfg.self:{};
  var slice=num(cfg.slice,34), width=num(cfg.width,15);
  return { id:rec.id, name:rec.name, by:(cfg.by?String(cfg.by):null),
           traits:(cfg.traits&&typeof cfg.traits==='object')?cfg.traits:null,
           swatch:(cfg.swatch&&String(cfg.swatch))||'#394150',
           preview:url(rec.meta.preview), plateUrl:url(rec.meta.plate), selfUrl:url(rec.meta.self),
           cssUrl:null, _cssText:(rec.meta.cssText||null),
           slice:slice, width:width, pad:(cfg.pad&&String(cfg.pad))||'6px 12px',
           selfSlice:num(sc.slice,slice), selfWidth:num(sc.width,width),
           selfPad:(sc.pad&&String(sc.pad))||(cfg.pad&&String(cfg.pad))||'6px 12px',
           _imported:true, _type:'seat' };
}
function _importSeatPackage(file){
  return file.arrayBuffer().then(_unzip).then(function(files){
    var cssText = files['style.css'] ? new TextDecoder().decode(files['style.css']) : null;
    var cfg = {};
    if (files['seat.json']) { try { cfg = JSON.parse(new TextDecoder().decode(files['seat.json'])) || {}; } catch(e){ cfg = {}; } }
    function pick(names){ for (var i=0;i<names.length;i++) if (files[names[i]]) return names[i]; return null; }
    var plate=pick(['plate.png','plate.svg','plate.webp','plate.jpg','plate.jpeg']);
    var self =pick(['self.png','self.svg','self.webp','self.jpg','self.jpeg']);
    var prev =pick(['preview.png','preview.svg','preview.webp','preview.jpg']);
    if(!cssText && !plate) return Promise.reject(new Error('style.css ou plate.* requis'));
    var assets={}; [plate,self,prev].forEach(function(fn){ if(fn) assets[fn]=new Blob([files[fn]],{type:_mimeOf(fn)}); });
    var rec={ id:'imp-s-'+_uid(), type:'seat',
              name:(cfg.name&&String(cfg.name).trim())||String(file.name||'Imported seat').replace(/\.zip$/i,''),
              meta:{ cfg:cfg, cssText:cssText, plate:plate, self:self, preview:prev }, assets:assets };
    return _idbPut(rec).then(function(){ _gallerySeats.push(_importedSeatToGallery(rec)); try{ seat.apply(rec.id); }catch(e){} try{ if(_body) _render(); }catch(e){} return rec; });
  });
}
function _loadImportedSeats(){
  return _idbAll().then(function(recs){
    (recs||[]).filter(function(r){ return r && r.type==='seat'; }).forEach(function(rec){ if(!_gallerySeatById(rec.id)){ try{ _gallerySeats.push(_importedSeatToGallery(rec)); }catch(e){} } });
    try{ var cur=seat.get(); if(cur && /^imp-s-/.test(cur) && _gallerySeatById(cur)) seat.apply(cur); }catch(e){}   // ré-injecte css/vars du pack actif (blob URLs neuves)
    try{ if(_body) _render(); }catch(e){}
  }).catch(function(){});
}
function _pickSeatImport(){
  var inp=document.createElement('input'); inp.type='file'; inp.accept='.zip,application/zip';
  inp.onchange=function(){ var f=inp.files&&inp.files[0]; if(f){ _importSeatPackage(f).catch(function(err){ try{ alert((_t('importError','Import failed'))+' : '+((err&&err.message)||err)); }catch(e){} }); } };
  inp.click();
}

// Deck changes need the monolith to re-point card faces + back (no re-render).
var _impDeck = {};   // deckId importe -> { faces:{n:blobUrl}, back:blobUrl }
// Resolveur d'URL de carte : blob URL si deck importe, sinon null (chemin standard).
window._deckCardUrl = function(deckId, n){ var d=_impDeck[deckId]; if(!d) return null; return (n==='flipside') ? (d.back||'') : (d.faces[n]||''); };
function _deckInGallery(id){ for(var i=0;i<_galleryDecks.length;i++) if(_galleryDecks[i].id===id) return true; return false; }
function _importedDeckToGallery(rec){
  var A=rec.assets, ext=(rec.meta&&rec.meta.ext)||'png', faces={}, back=null;
  for(var i=0;i<52;i++){ var fn=i+'.'+ext; if(A[fn]) faces[i]=URL.createObjectURL(A[fn]); }
  if(A['flipside.'+ext]) back=URL.createObjectURL(A['flipside.'+ext]);
  _impDeck[rec.id]={faces:faces, back:back};
  return { id:rec.id, name:rec.name, ext:ext, _imported:true, _type:'deck' };
}
function _importDeckPackage(file){
  return file.arrayBuffer().then(_unzip).then(function(files){
    var ext=null, exts=['svg','png','jpg','jpeg'];
    for(var e=0;e<exts.length;e++){ if(files['0.'+exts[e]]){ ext=exts[e]; break; } }
    if(!ext) return Promise.reject(new Error('cartes 0..51 introuvables'));
    var name='Imported deck';
    for(var k in files){ if(/deckstyle\.xml$/i.test(k)){ name=_xmlVal(new TextDecoder().decode(files[k]),'StyleDescription')||name; break; } }
    var assets={}, faceCount=0;
    for(var i=0;i<52;i++){ var fn=i+'.'+ext; if(files[fn]){ assets[fn]=new Blob([files[fn]],{type:_mimeOf(fn)}); faceCount++; } }
    if(faceCount<52) return Promise.reject(new Error('deck incomplet ('+faceCount+'/52 cartes)'));
    if(files['flipside.'+ext]) assets['flipside.'+ext]=new Blob([files['flipside.'+ext]],{type:_mimeOf('x.'+ext)});
    var rec={ id:'imp-d-'+_uid(), type:'deck', name:name, meta:{ext:ext}, assets:assets };
    return _idbPut(rec).then(function(){ _galleryDecks.push(_importedDeckToGallery(rec)); try{ if(_body) _render(); }catch(e){} return rec; });
  });
}
function _loadImportedDecks(){
  return _idbAll().then(function(recs){
    (recs||[]).filter(function(r){ return r&&r.type==='deck'; }).forEach(function(rec){ if(!_deckInGallery(rec.id)){ try{ _galleryDecks.push(_importedDeckToGallery(rec)); }catch(e){} } });
    try{ var cur=deck.get(); if(cur && /^imp-/.test(cur) && _impDeck[cur]){ deck.apply(cur); } }catch(e){}
    try{ if(_body) _render(); }catch(e){}
  }).catch(function(){});
}
function _pickDeckImport(){
  var inp=document.createElement('input'); inp.type='file'; inp.accept='.zip,application/zip';
  inp.onchange=function(){ var f=inp.files&&inp.files[0]; if(f){ _importDeckPackage(f).catch(function(err){ try{ alert((_t('importError','Import failed'))+' : '+((err&&err.message)||err)); }catch(e){} }); } };
  inp.click();
}
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

// ── Axe « Dos de carte » — indépendant du deck (parité 3 axes QML, bible §13).
// pth_cardback : '' = assorti au deck (historique) · '<deckId>' = flipside de
// ce deck · 'custom' = image importée (dataURL compacte dans pth_cardback_img).
// pth_cardback_ext mémorise l'extension du deck choisi pour le boot <head>
// zéro-flash. L'application réelle passe par window._refreshDeck (pokerth.js),
// dont _deckBack() consulte ces clés en priorité.
function cardbackGet() { try { return localStorage.getItem('pth_cardback') || ''; } catch (e) { return ''; } }
function cardbackApply(id, ext) {
  try {
    if (id) localStorage.setItem('pth_cardback', id); else localStorage.removeItem('pth_cardback');
    if (id && id !== 'custom') localStorage.setItem('pth_cardback_ext', ext || _deckExt(id));
    else localStorage.removeItem('pth_cardback_ext');
  } catch (e) {}
  try { if (window._refreshDeck) window._refreshDeck(); } catch (e) {}
}
// Import d'une image de dos : redimensionnée en canvas « cover » au ratio
// carte 5:7 (240×336), encodée WebP (repli JPEG) pour rester compacte dans
// localStorage (< ~250 Ko), puis appliquée immédiatement.
function _cardbackImport(file) {
  var img = new Image();
  var url = URL.createObjectURL(file);
  img.onload = function () {
    try {
      var W = 240, H = 336, cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var cx = cv.getContext('2d');
      var s = Math.max(W / img.width, H / img.height);
      var dw = img.width * s, dh = img.height * s;
      cx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      var data = cv.toDataURL('image/webp', 0.85);
      if (data.indexOf('data:image/webp') !== 0) data = cv.toDataURL('image/jpeg', 0.85);
      if (data.length > 250000) data = cv.toDataURL('image/jpeg', 0.7);
      localStorage.setItem('pth_cardback_img', data);
      cardbackApply('custom');
    } catch (e) {}
    try { URL.revokeObjectURL(url); } catch (e) {}
    if (_body) _render();
  };
  img.onerror = function () { try { URL.revokeObjectURL(url); } catch (e) {} };
  img.src = url;
}
function _cardbackPickFile() {
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = function () { var f = inp.files && inp.files[0]; if (f) _cardbackImport(f); };
  inp.click();
}
// Options : Assorti au deck · dos de chaque deck connu (intégrés + galerie) ·
// image importée (si présente) · « Importer une image… » (action).
function _cardbackOptions() {
  var bust = '?v=' + (window.BUILD_VERSION || '0');
  var cd = deck.get();
  var opts = [{ id: '', key: 'cardbackAuto', fallback: 'Match the deck',
                backUrl: cd ? ('/cards/' + cd + '/flipside.' + _deckExt(cd) + bust) : null }];
  DECKS.concat(_galleryDecks).forEach(function (d) {
    opts.push({ id: d.id, name: (d.name || _t(d.key, d.fallback)), ext: d.ext || 'png',
                backUrl: '/cards/' + d.id + '/flipside.' + (d.ext || 'png') + bust });
  });
  try {
    if (localStorage.getItem('pth_cardback_img'))
      opts.push({ id: 'custom', key: 'cardbackCustom', fallback: 'Imported image',
                  backUrl: localStorage.getItem('pth_cardback_img') });
  } catch (e) {}
  opts.push({ id: '__import', key: 'cardbackImport', fallback: 'Import an image…' });
  return opts;
}
function _cardbackBlock() {
  var cur = cardbackGet();
  var opts = _cardbackOptions();
  var curItem = opts[0];
  for (var i = 0; i < opts.length; i++) if (opts[i].id === cur) curItem = opts[i];
  var curName = curItem.name || _t(curItem.key, curItem.fallback);
  var options = opts.map(function (it) {
    return { item: it, name: (it.name || _t(it.key, it.fallback)), active: it.id === cur,
      onClick: function () {
        if (it.id === '__import') { _cardbackPickFile(); return; }
        cardbackApply(it.id, it.ext); _openSec = null; _render();
      } };
  });
  return _dropdownBlock('pth_cardback', _t('sectionCardback', 'Card back'), 'cardback', curItem, curName, options);
}

// Gallery table styles imported at runtime from /table/tables.json (managed by
// install.sh table-add). Each carries a felt image + matching dealer/SB/BB pucks,
// and is offered in BOTH the Table panel (felt + pucks) and the Pucks panel.
var _galleryTables = [];
// Ids officiels desormais integres en dur -> on ignore leurs doublons eventuels
// venant du gallery serveur (/table/tables.json) pour ne pas les lister deux fois.
var _OFFICIAL_GALLERY_DUP = { 'pokerth-official':1, 'pokerth-official-fs':1, 'felt-green':1, 'tableGreen':1, 'pokerth-live':1 };
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
          return { id: String(t.id), name: t.name || String(t.id), feltUrl: t.feltUrl, pucks: pk, preview: t.preview || (pv && pv.dealer) || null, swatch: '#1e6b1e', full: !!t.full, fs: !!t.fullscreen, align: (typeof t.align === 'string' ? t.align : null) };
        }).filter(function (t) { if (_isBuiltinTable(t.id)) return false; if (_OFFICIAL_GALLERY_DUP[t.id]) return false; for (var i=0;i<_tablePkgs.length;i++) if (_tablePkgs[i].id===t.id) return false; return true; });
        try { table.apply(table.get()); pucks.apply(pucks.get()); } catch (e) {}
        if (_body) _render();
      })
      .catch(function () {});
  } catch (e) {}
}

// ── Theme packages : un "table style" importe se decompose en une palette (couleurs UI/popups)
//    + un tapis (feutre, liseré, image) + un preset combinant les deux. ──
var _palettePkgs = [], _tablePkgs = [], _pkgPresets = [], _puckPkgs = [], _buttonPkgs = [], _themePkgs = [];
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
// Palettes IMPORTEES (paquets) : on ne recoit que les PALETTE_TOKENS ; les
// autres tokens variant par palette (gold-rgb, field-bg, inset/-hi) restaient
// sur les valeurs :root (vertes) -> seuls les builtin s'adaptaient. On les
// DERIVE ici a partir des tokens fournis, puis on les injecte+stocke comme les
// autres. Les builtin passent pkg=null -> aucune derivation (leurs blocs CSS
// :root[data-theme=...] definissent deja tout).
function _hexToRgb(c){
  if (typeof c !== 'string') return null;
  var m = c.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i); if (!m) return null;
  var h = m[1]; if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  var n = parseInt(h, 16); return ((n>>16)&255)+','+((n>>8)&255)+','+(n&255);
}
function _isLightColor(c){
  var r = _hexToRgb(c); if (!r) return false; var p = r.split(',').map(Number);
  return (0.299*p[0] + 0.587*p[1] + 0.114*p[2]) > 140;
}
var _paletteChatlog = null;   // fenetres (chat/journal) derivees d'une palette importee, appliquees via la couche teinte
function _injectPalette(pkg){
  var keys = PALETTE_TOKENS.concat(['gold-rgb','field-bg','inset','inset-hi']);
  _paletteChatlog = null;   // builtin / aucune palette : fenetres via repli CSS (--panel/--text-hi/--cream)
  if (pkg && pkg.tokens) {
    var t = pkg.tokens, d = {};
    var grgb = _hexToRgb(t.gold);
    if (grgb && t['gold-rgb'] == null) d['gold-rgb'] = grgb;            // halos/bordures or en rgba
    if (t['field-bg'] == null && (t['panel-hi'] || t.panel)) d['field-bg'] = t['panel-hi'] || t.panel; // champs de saisie
    var lightPal = (typeof t['text-hi'] === 'string') && !_isLightColor(t['text-hi']); // texte sombre => palette claire
    if (t['inset'] == null)    d['inset']    = lightPal ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
    if (t['inset-hi'] == null) d['inset-hi'] = lightPal ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
    if (Object.keys(d).length) { pkg = Object.assign({}, pkg, { tokens: Object.assign({}, t, d) }); }
    // Fenetres flottantes (chat/journal) : fond = PANNEAU + texte a CONTRASTE
    // garanti (calcule sur la luminosite du panneau). Applique via la couche
    // teinte (_injectSkinTint) pour survivre a table.apply -> TOUTES les palettes
    // importees suivent la palette, pas seulement pokerth builtin.
    var _pc = t.panel || t['panel-hi'];
    if (_pc) {
      var _dark = !_isLightColor(_pc);
      _paletteChatlog = { bg:_pc, su:_pc,
        tx:(_dark ? '#eff1f5' : '#1d222b'),
        mu:(_dark ? 'rgba(239,241,245,0.5)' : 'rgba(29,34,43,0.5)') };
    }
  }
  _injectAxis(keys, pkg, 'pth_theme_css', false);
}
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
    // 2.1.3 Image.Stretch : le Tapis 52x26 est dessine en background-image
    // etire 100%/100%, mais Chromium (Edge/desktop) letterboxe un SVG selon
    // son preserveAspectRatio interne (WebKit/iOS etire, lui) -> Tapis
    // retreci sur ordinateur. Correctif fidele au QML : re-ecrire le SVG
    // avec preserveAspectRatio="none" et republier la variable en data-URL.
    if (spec.images.allin) _stretchAllInSvg(spec.images.allin, el);
  }
  try{ if(css) localStorage.setItem('pth_buttons_css',css); else localStorage.removeItem('pth_buttons_css'); }catch(e){}
}
// Jeton anti-course : un changement de theme pendant le fetch invalide le patch.
var _allInStretchSeq=0;
function _stretchAllInSvg(cssUrl, el){
  var seq=++_allInStretchSeq;
  try{
    var s=String(cssUrl||''), p=s.indexOf('url(');
    if(p>=0){ s=s.slice(p+4); var q=s.lastIndexOf(')'); if(q>=0) s=s.slice(0,q); }
    s=s.replace(/^\s*["']|["']\s*$/g,'').trim();
    if(!s) return;
    var done=function(txt){
      if(seq!==_allInStretchSeq) return;                 // theme change entre-temps
      if(!/<svg[\s>]/i.test(txt)) return;                // pas un SVG (PNG...) -> rien a faire
      if(/preserveAspectRatio\s*=/i.test(txt)) txt=txt.replace(/preserveAspectRatio\s*=\s*"[^"]*"/i,'preserveAspectRatio="none"');
      else txt=txt.replace(/<svg/i,'<svg preserveAspectRatio="none"');
      var u2='url("data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(txt)))+'")';
      el.style.setProperty('--btn-allin-img',u2);
      // Persistance : la restauration au boot passe par style.cssText (les
      // guillemets protegent les ';' du data-URL) -> le Tapis est deja
      // corrige au premier rendu, sans re-fetch.
      try{ var c=localStorage.getItem('pth_buttons_css'); if(c) localStorage.setItem('pth_buttons_css', c.replace(/--btn-allin-img:(?:url\("[^"]*"\)|[^;])*;/,'--btn-allin-img:'+u2+';')); }catch(e){}
    };
    if(/^data:image\/svg\+xml/i.test(s)){
      var h=s.indexOf(','), head=s.slice(0,h), body=s.slice(h+1);
      done(/;base64/i.test(head)?atob(body):decodeURIComponent(body));
    } else {
      fetch(s).then(function(r){ return r.ok?r.text():''; }).then(function(t){ if(t) done(t); }).catch(function(){});
    }
  }catch(e){}
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
// Mode « Automatique » : suit l'OS/navigateur (prefers-color-scheme) et se met a
// jour en direct si le systeme bascule. pth_theme='auto' est stocke ; data-theme
// recoit la palette resolue (pokerth / pokerth-light).
function _resolveAuto(){ try{ return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'pokerth-light' : 'pokerth'; }catch(e){ return 'pokerth'; } }
var _autoMql=null,_autoHandler=null;
function _setupAutoListener(on){
  try{ if(!window.matchMedia) return;
    if(on){ if(_autoMql) return; _autoMql=window.matchMedia('(prefers-color-scheme: light)');
      _autoHandler=function(){ try{ if((localStorage.getItem('pth_theme')||'auto')==='auto') document.documentElement.setAttribute('data-theme',_resolveAuto()); }catch(e){} };
      if(_autoMql.addEventListener) _autoMql.addEventListener('change',_autoHandler); else if(_autoMql.addListener) _autoMql.addListener(_autoHandler);
    } else { if(_autoMql&&_autoHandler){ if(_autoMql.removeEventListener) _autoMql.removeEventListener('change',_autoHandler); else if(_autoMql.removeListener) _autoMql.removeListener(_autoHandler); } _autoMql=null;_autoHandler=null; }
  }catch(e){}
}
// Re-applique la teinte chat/log de la table courante apres un changement de
// palette a chaud (sinon _paletteChatlog ne serait relu qu'au prochain
// table.apply / reload).
function _reapplyChatlogTint(){ try{ var _tb=_builtinTableById(table.get()); _injectSkinTint(_tb?_tb.id:null); }catch(e){} }
palette.apply = function(id){
  if(id==='auto'){
    try{ localStorage.setItem('pth_theme','auto'); }catch(e){}
    document.documentElement.setAttribute('data-theme', _resolveAuto());
    try{ _injectPalette(null); }catch(e){}
    try{ _reapplyChatlogTint(); }catch(e){}
    _setupAutoListener(true); return;
  }
  _setupAutoListener(false);
  _palApply(id);
  try{ if (_isBuiltinPalette(id)) _injectPalette(null); else { var pk=_palettePkgById(id); if(pk) _injectPalette(pk); } }catch(e){}
  try{ _reapplyChatlogTint(); }catch(e){}
};
palette.set = palette.apply;
// Table « image complète » (full:true) : pose data-table-full + --table-img (URL nue)
// et persiste pth_table_full + --table-img dans pth_table_css pour restitution
// zero-flash par l'applier <head>. Sinon, nettoie tout (retour au tapis CSS ovale).
function _applyTableFull(imgUrl){
  var el=document.documentElement;
  if (imgUrl){
    el.setAttribute('data-table-full','1');
    el.style.setProperty('--table-img','url('+imgUrl+')');
    try{ localStorage.setItem('pth_table_full','1');
      var cur=(localStorage.getItem('pth_table_css')||'').replace(/--table-img:[^;]*;?/g,'');
      localStorage.setItem('pth_table_css', cur+'--table-img:url('+imgUrl+');');
    }catch(e){}
  } else {
    el.removeAttribute('data-table-full');
    el.style.removeProperty('--table-img');
    try{ localStorage.removeItem('pth_table_full');
      var c2=(localStorage.getItem('pth_table_css')||'').replace(/--table-img:[^;]*;?/g,'');
      if(c2) localStorage.setItem('pth_table_css',c2); else localStorage.removeItem('pth_table_css');
    }catch(e){}
  }
}
// Table « Fullscreen » : l'image du pack devient un fond plein ecran (--wallpaper
// + data-bg-img, cf. la regle body.in-game du CSS) et l'ovale passe transparent
// (data-table-fs). Exclusif avec full. null = on nettoie tout (retour normal).
function _applyTableFullscreen(imgUrl, alignPos, zoom){
  var el=document.documentElement;
  // 2.1.3 : TableBackgroundZoom (>1 = fond agrandi/rogne). cover par defaut ; en
  // zoom on passe a une taille en % (surbalayage centre, equivalent du crop QML).
  var wsize=(zoom&&zoom>0&&zoom!==1)?((zoom*100).toFixed(1)+'%'):null;
  if (imgUrl){
    el.setAttribute('data-table-fs','1');
    el.setAttribute('data-bg-img','1');
    el.style.setProperty('--wallpaper','url('+imgUrl+')');
    if (alignPos) el.style.setProperty('--wallpaper-pos', alignPos);
    else el.style.removeProperty('--wallpaper-pos');
    if (wsize) el.style.setProperty('--wallpaper-size', wsize);
    else el.style.removeProperty('--wallpaper-size');
    // Persistance zero-flash : le boot <head> restitue --wallpaper (via pth_table_css)
    // + data-table-fs/data-bg-img (via pth_table_fs). Exclusif avec le mode 'full'.
    try{
      localStorage.setItem('pth_table_fs','1'); localStorage.removeItem('pth_table_full');
      var cur=(localStorage.getItem('pth_table_css')||'').replace(/--wallpaper(?:-pos|-size)?:[^;]*;?/g,'');
      cur+='--wallpaper:url('+imgUrl+');'+(alignPos?('--wallpaper-pos:'+alignPos+';'):'')+(wsize?('--wallpaper-size:'+wsize+';'):'');
      localStorage.setItem('pth_table_css',cur);
    }catch(e){}
  } else {
    el.removeAttribute('data-table-fs');
    el.removeAttribute('data-bg-img');
    el.style.removeProperty('--wallpaper');
    el.style.removeProperty('--wallpaper-pos');
    el.style.removeProperty('--wallpaper-size');
    try{
      localStorage.removeItem('pth_table_fs');
      var c2=(localStorage.getItem('pth_table_css')||'').replace(/--wallpaper(?:-pos|-size)?:[^;]*;?/g,'');
      if(c2) localStorage.setItem('pth_table_css',c2); else localStorage.removeItem('pth_table_css');
    }catch(e){}
  }
}
var _tblApply = table.apply;
function _builtinTableById(id){ for (var i=0;i<TABLES.length;i++) if (TABLES[i].id===id) return TABLES[i]; return null; }
// Teintes par tapis QML (PlayerBoxAccent + ChatLog* du tablestyle.xml).
var _SKIN_TINT = {
  casino:{a:'#c8a84a',bg:'#0c1a0e',su:'#14281a',bo:'rgba(200,168,74,0.32)',tx:'#ede8dc',se:'#c8d8c0',mu:'#9aaa92'},
  danuxi:{a:'#8a3fd6',bg:'#28253c',su:'#444163',bo:'#6e53a2',tx:'#eff1f5',se:'#cdd3e0',mu:'#7b79ad'},
  mute:{a:'#7ea6d0',bg:'#272f3c',su:'#434f62',bo:'#6981a0',tx:'#eff1f5',se:'#cdd3e0',mu:'#788dac'},
  mute2:{a:'#2a86c8',bg:'#1e2c3b',su:'#374b61',bo:'#43739c',tx:'#eff1f5',se:'#cdd3e0',mu:'#6887aa'},
  teal:{a:'#159ba6',bg:'#1c2e37',su:'#344e5c',bo:'#397c8d',tx:'#eff1f5',se:'#cdd3e0',mu:'#638ba4'},
  lemming:{a:'#9aa0a6',bg:'#262627',su:'#414243',bo:'#777a7c',tx:'#e6e6e6',se:'#c2c2c2',mu:'#8d8e90'},
  matrix:{a:'#35c94a',bg:'#06120a',su:'#0e2314',bo:'#1f7a3a',tx:'#d6ffe0',se:'#a7e6ba',mu:'#5f9e74'},
  star_trek:{a:'#4d9cff',bg:'#080b12',su:'#161d2c',bo:'#527db5',tx:'#e9eef7',se:'#c8d3e6',mu:'#738eb5'},
  tripsixes:{a:'#4fae7a',bg:'#223033',su:'#3c5056',bo:'#538579',tx:'#eff1f5',se:'#cdd3e0',mu:'#6f8f9b'},
  wanted:{a:'#c08a3e',bg:'#2d2c2d',su:'#4c4b4d',bo:'#86755e',tx:'#eff1f5',se:'#cdd3e0',mu:'#86888f'},
  xanax:{a:'#4a63c8',bg:'#22283b',su:'#3b4661',bo:'#51639c',tx:'#eff1f5',se:'#cdd3e0',mu:'#6e80aa'}
};
function _injectTintObj(m){
  var el=document.documentElement;
  var K={'--chatlog-bg':'bg','--chatlog-surface':'su','--chatlog-border':'bo','--chatlog-text':'tx','--chatlog-text2':'se','--chatlog-muted':'mu','--box-accent':'a'};
  for (var k in K){ var v=m?m[K[k]]:null; if(v) el.style.setProperty(k, v); else el.style.removeProperty(k); }
  if (m && m.a) el.setAttribute('data-box-accent','1'); else el.removeAttribute('data-box-accent');
}
function _injectSkinTint(id){ _injectTintObj((id&&_SKIN_TINT[id]) || _paletteChatlog || null); }

// ── Import LOCAL de styles (tables ; decks/sieges a venir). Lecteur ZIP (store +
//    deflate) + IndexedDB pour les assets, injection dans les galeries existantes. ──
function _u8str(u8,off,len){ var t=''; for(var i=0;i<len;i++) t+=String.fromCharCode(u8[off+i]); try{ return decodeURIComponent(escape(t)); }catch(e){ return t; } }
function _inflateRaw(u8){ var ds=new DecompressionStream('deflate-raw'); return new Response(new Blob([u8]).stream().pipeThrough(ds)).arrayBuffer().then(function(ab){ return new Uint8Array(ab); }); }
function _unzip(buf){
  var dv=new DataView(buf), u8=new Uint8Array(buf), n=buf.byteLength, eocd=-1;
  for(var i=n-22;i>=0 && i>=n-22-65536;i--){ if(dv.getUint32(i,true)===0x06054b50){ eocd=i; break; } }
  if(eocd<0) return Promise.reject(new Error('ZIP invalide'));
  var cnt=dv.getUint16(eocd+10,true), cdOff=dv.getUint32(eocd+16,true), p=cdOff, tasks=[];
  for(var e=0;e<cnt;e++){
    if(dv.getUint32(p,true)!==0x02014b50) break;
    var method=dv.getUint16(p+10,true), compSize=dv.getUint32(p+20,true);
    var nameLen=dv.getUint16(p+28,true), extraLen=dv.getUint16(p+30,true), commentLen=dv.getUint16(p+32,true);
    var lho=dv.getUint32(p+42,true), name=_u8str(u8,p+46,nameLen);
    var lNameLen=dv.getUint16(lho+26,true), lExtraLen=dv.getUint16(lho+28,true), dataOff=lho+30+lNameLen+lExtraLen;
    tasks.push({name:name, method:method, comp:u8.slice(dataOff,dataOff+compSize)});
    p+=46+nameLen+extraLen+commentLen;
  }
  var out={};
  return tasks.reduce(function(pr,t){ return pr.then(function(){
    if(t.name.charAt(t.name.length-1)==='/') return;
    var base=t.name.split('/').pop();
    if(t.method===0){ out[base]=t.comp; return; }
    if(t.method===8) return _inflateRaw(t.comp).then(function(d){ out[base]=d; });
  }); }, Promise.resolve()).then(function(){ return out; });
}
function _idb(){ return new Promise(function(res,rej){ try{ var r=indexedDB.open('pth_imports',1); r.onupgradeneeded=function(){ try{ r.result.createObjectStore('items',{keyPath:'id'}); }catch(e){} }; r.onsuccess=function(){ res(r.result); }; r.onerror=function(){ rej(r.error); }; }catch(e){ rej(e); } }); }
function _idbPut(rec){ return _idb().then(function(db){ return new Promise(function(res,rej){ var tx=db.transaction('items','readwrite'); tx.objectStore('items').put(rec); tx.oncomplete=function(){res();}; tx.onerror=function(){rej(tx.error);}; }); }); }
function _idbAll(){ return _idb().then(function(db){ return new Promise(function(res,rej){ var tx=db.transaction('items','readonly'); var rq=tx.objectStore('items').getAll(); rq.onsuccess=function(){ res(rq.result||[]); }; rq.onerror=function(){rej(rq.error);}; }); }); }
function _idbDel(id){ return _idb().then(function(db){ return new Promise(function(res,rej){ var tx=db.transaction('items','readwrite'); tx.objectStore('items').delete(id); tx.oncomplete=function(){res();}; tx.onerror=function(){rej(tx.error);}; }); }); }
function _uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function _mimeOf(name){ var x=(name||'').split('.').pop().toLowerCase(); return x==='png'?'image/png':(x==='jpg'||x==='jpeg')?'image/jpeg':x==='svg'?'image/svg+xml':'application/octet-stream'; }
function _xmlVal(xml,tag){ var m=xml.match(new RegExp('<'+tag+'\\s+value="([^"]*)"')); return (m&&m[1])?m[1]:null; }

function _importedTableToGallery(rec){
  var A=rec.assets, m=rec.meta||{}, url=function(n){ return (n&&A[n])?URL.createObjectURL(A[n]):null; };
  var feltUrl=url(m.table), pv=url(m.preview)||feltUrl, pucks=null;
  var pd=url(m.dealer), ps=url(m.sb), pb=url(m.bb);
  if(pd||ps||pb){ pucks={}; if(pd)pucks.dealer='url('+pd+')'; if(ps)pucks.sb='url('+ps+')'; if(pb)pucks.bb='url('+pb+')'; }
  var bf=url(m.fold), bc=url(m.call), br=url(m.raise), ba=url(m.allin), btn=null;
  if(bf||bc||br||ba){ btn={}; if(bf)btn.fold='url('+bf+')'; if(bc){btn.check='url('+bc+')';btn.call='url('+bc+')';} if(br)btn.raise='url('+br+')'; if(ba)btn.allin='url('+ba+')'; }
  return { id:rec.id, name:rec.name, feltUrl:feltUrl, preview:pv, previewPortrait:url(m.previewPortrait)||null, pucks:pucks, fs:true, align:m.align||'center', _imported:true, _type:'table', _btn:btn, _btnfg:(m.btnfg||null), _zoom:(m.zoom||null), _btnRadius:(m.btnRadius!=null?m.btnRadius:null), _tint:m.tint||null };
}
function _importTablePackage(file){
  return file.arrayBuffer().then(_unzip).then(function(files){
    var xmlName=null; for(var k in files){ if(/tablestyle\.xml$/i.test(k)){ xmlName=k; break; } if(/\.xml$/i.test(k)) xmlName=xmlName||k; }
    var meta={ table:'table.png', preview:'preview.png', dealer:'dealerPuck.svg', sb:'smallblindPuck.svg', bb:'bigblindPuck.svg', fold:'actionFold.svg', call:'actionCall.svg', raise:'actionRaise.svg', allin:'actionAllIn.svg', align:'center', tint:null };
    var name='Imported table';
    if(xmlName){ var xml=new TextDecoder().decode(files[xmlName]);
      name=_xmlVal(xml,'StyleDescription')||name;
      meta.align=(_xmlVal(xml,'TableBackgroundAlign')==='bottom')?'center bottom':'center';
      meta.table=_xmlVal(xml,'Table')||meta.table; meta.preview=_xmlVal(xml,'Preview')||meta.preview;
      meta.dealer=_xmlVal(xml,'DealerPuck')||meta.dealer; meta.sb=_xmlVal(xml,'SmallBlindPuck')||meta.sb; meta.bb=_xmlVal(xml,'BigBlindPuck')||meta.bb;
      meta.fold=_xmlVal(xml,'FoldButton')||meta.fold; meta.call=_xmlVal(xml,'CheckCallButton')||meta.call; meta.raise=_xmlVal(xml,'BetRaiseButton')||meta.raise; meta.allin=_xmlVal(xml,'AllInButton')||meta.allin;
      var acc=_xmlVal(xml,'PlayerBoxAccent'), cbg=_xmlVal(xml,'ChatLogBackground');
      if(acc||cbg) meta.tint={ a:acc, bg:cbg, su:_xmlVal(xml,'ChatLogSurface'), bo:_xmlVal(xml,'ChatLogBorder'), tx:_xmlVal(xml,'ChatLogText'), se:_xmlVal(xml,'ChatLogTextSecondary'), mu:_xmlVal(xml,'ChatLogTextMuted') };
      // 2.1.3 : couleurs de libelle par bouton (styles a boutons sombres), zoom/cadrage
      //         du fond, rayon des boutons d'action et apercu portrait.
      var _bfg={ fold:_xmlVal(xml,'FoldButtonTextColor'), check:_xmlVal(xml,'CheckCallButtonTextColor'), raise:_xmlVal(xml,'BetRaiseButtonTextColor'), allin:_xmlVal(xml,'AllInButtonTextColor') };
      if(_bfg.fold||_bfg.check||_bfg.raise||_bfg.allin) meta.btnfg=_bfg;
      var _bz=parseFloat(_xmlVal(xml,'TableBackgroundZoom')); if(isFinite(_bz)&&_bz>0&&_bz!==1) meta.zoom=_bz;
      var _br2=parseFloat(_xmlVal(xml,'ActionButtonBorderRadius')); if(isFinite(_br2)&&_br2>=0) meta.btnRadius=_br2;
      var _pp=_xmlVal(xml,'PreviewPortrait'); if(_pp) meta.previewPortrait=_pp;
    }
    var assets={}; [meta.table,meta.preview,meta.previewPortrait,meta.dealer,meta.sb,meta.bb,meta.fold,meta.call,meta.raise,meta.allin].forEach(function(fn){ if(fn&&files[fn]&&!assets[fn]) assets[fn]=new Blob([files[fn]],{type:_mimeOf(fn)}); });
    if(!assets[meta.table]) return Promise.reject(new Error('table.png manquant'));
    var rec={ id:'imp-t-'+_uid(), type:'table', name:name, meta:meta, assets:assets };
    return _idbPut(rec).then(function(){ _galleryTables.push(_importedTableToGallery(rec)); try{ if(_body) _render(); }catch(e){} return rec; });
  });
}
function _loadImportedTables(){
  return _idbAll().then(function(recs){
    (recs||[]).filter(function(r){ return r && r.type==='table'; }).forEach(function(rec){ if(!_galleryTableById(rec.id)){ try{ _galleryTables.push(_importedTableToGallery(rec)); }catch(e){} } });
    try{ var cur=table.get(); if(cur && /^imp-/.test(cur) && _galleryTableById(cur)) table.apply(cur); }catch(e){}   // rafraichit les blob URLs de la table active
    try{ if(_body) _render(); }catch(e){}
  }).catch(function(){});
}
function _deleteImported(id){
  _idbDel(id).then(function(){
    for(var i=0;i<_galleryTables.length;i++) if(_galleryTables[i].id===id){ _galleryTables.splice(i,1); try{ if(table.get()===id) table.apply(''); }catch(e){} break; }
    for(var j=0;j<_galleryDecks.length;j++) if(_galleryDecks[j].id===id){ _galleryDecks.splice(j,1); delete _impDeck[id]; try{ if(deck.get()===id) deck.apply(''); }catch(e){} break; }
    for(var k2=0;k2<_gallerySeats.length;k2++) if(_gallerySeats[k2].id===id && _gallerySeats[k2]._imported){ _gallerySeats.splice(k2,1); try{ if(seat.get()===id) seat.apply('pokerth'); }catch(e){} break; }
    try{ if(_body) _render(); }catch(e){}
  }).catch(function(){});
}
function _pickTableImport(){
  var inp=document.createElement('input'); inp.type='file'; inp.accept='.zip,application/zip';
  inp.onchange=function(){ var f=inp.files&&inp.files[0]; if(f){ _importTablePackage(f).catch(function(err){ try{ alert((_t('importError','Import failed'))+' : '+((err&&err.message)||err)); }catch(e){} }); } };
  inp.click();
}
try { _loadImportedTables(); _loadImportedDecks(); _loadImportedSeats(); } catch (e) {}
table.apply = function(id){
  _tblApply(id);   // pose data-table + persiste pth_table
  try {
    var tb = _builtinTableById(id);
    _injectSkinTint(tb ? tb.id : null);   // teinte chat/log + accent de box (tapis QML + Green Casino)
    try{ document.documentElement.style.removeProperty('--act-btn-radius'); }catch(e){}   // 2.1.3: reset rayon boutons (repose par un tapis importe si defini)
    if (tb) {
      // Style officiel bundle : feutre + pucks + boutons ; mode fs/full/felt.
      _injectAxis(TABLE_TOKENS, { feltUrl: tb.feltUrl }, 'pth_table_css', true);
      if (tb.skin) { var _bd='/table/'+tb.id+'/'; _injectButtons({ images:{ fold:'url('+_bd+'actionFold.svg)', check:'url('+_bd+'actionCall.svg)', call:'url('+_bd+'actionCall.svg)', raise:'url('+_bd+'actionRaise.svg)', allin:'url('+_bd+'actionAllIn.svg)' }, colors:{ 'btn-fold-fg':'#f0f3f8','btn-check-fg':'#f0f3f8','btn-call-fg':'#f0f3f8','btn-raise-fg':'#f0f3f8','btn-allin-fg':'#fff4ec','btn-allin-fg-b':'#ffffff' } }); }
      else _injectButtons(tb.btn === 'casino' ? CASINO_BTN : { colors: BUTTON_GLOSSY });
      if (tb.mode === 'fs') { _applyTableFull(null); _applyTableFullscreen(tb.feltUrl, tb.align || null, tb.zoom || null); } // TableBackgroundZoom des styles officiels (danuxi/matrix/star_trek 1.3/1.25/1.3)
      else if (tb.mode === 'full') { _applyTableFullscreen(null); _applyTableFull(tb.feltUrl); }
      else { _applyTableFullscreen(null); _applyTableFull(null); }
    } else {
      // Table de galerie (import serveur) : comportement historique (feutre + pucks).
      var fimg=null, fsimg=null, fsalign=null, fszoom=null, gt=_galleryTableById(id);
      if (gt) {
        _injectAxis(TABLE_TOKENS, { id:gt.id, tokens:{}, feltUrl:gt.feltUrl }, 'pth_table_css', true);
        if (gt.fs) { fsimg=gt.feltUrl||null; fsalign=gt.align||null; fszoom=gt._zoom||null; } else if (gt.full) fimg=gt.feltUrl||null;
        // 2.1.3 : *ButtonTextColor -> couleur de libelle par bouton (repli sur les clairs).
        if (gt._btn) { var _fg=gt._btnfg||{}; _injectButtons({ images: gt._btn, colors:{ 'btn-fold-fg':(_fg.fold||'#f0f3f8'),'btn-check-fg':(_fg.check||'#f0f3f8'),'btn-call-fg':(_fg.check||'#f0f3f8'),'btn-raise-fg':(_fg.raise||'#f0f3f8'),'btn-allin-fg':(_fg.allin||'#fff4ec'),'btn-allin-fg-b':(_fg.allin||'#ffffff') } }); }
        else _injectButtons({ colors: BUTTON_GLOSSY });
        // 2.1.3 : ActionButtonBorderRadius (defaut 9). Expose la var pour le CSS.
        try{ if(gt._btnRadius!=null && gt._btnRadius!==9) document.documentElement.style.setProperty('--act-btn-radius', gt._btnRadius+'px'); }catch(e){}
        if (gt._tint) _injectTintObj(gt._tint);
      }
      if (fsimg) { _applyTableFull(null); _applyTableFullscreen(fsimg, fsalign, fszoom); }
      else { _applyTableFullscreen(null); _applyTableFull(fimg); }
    }
    pucks.apply(pucks.get());   // Auto -> puck du tapis courant ; sinon respecte le choix explicite
  } catch (e) {}
  try { if (window._renderSeats) window._renderSeats(); } catch (e) {}
};
table.set = table.apply;
var _btnApply = buttons.apply;
buttons.apply = function(id){ _btnApply(id); try{
  // Green Casino (casino-vert) garde son rendu propre (images SVG + couleurs). Flat ('')
  // = palette Glossy mais en aplat (BUTTON_FLAT). Tous les autres (glossy, PokerTH new,
  // Sleek) -> degrades Glossy.
  if (id==='casino-vert') { var pk=_buttonPkgById('casino-vert'); _injectButtons(pk?{images:pk.images,colors:pk.colors}:{colors:BUTTON_GLOSSY}); }
  else if (!id) { try{ table.apply(table.get()); }catch(e2){} }   // Auto : les boutons suivent le STYLE DE TABLE (parité QML — un seul pipeline, uniforme sur toutes les tables)
  else if (id==='flat') _injectButtons({colors:BUTTON_FLAT});
  else _injectButtons({colors:BUTTON_GLOSSY});
}catch(e){} };
buttons.set = buttons.apply;
var _pkApply = pucks.apply;
// Puck du tapis courant (built-in ou galerie) — utilise pour le mode « Auto (table) ».
function _tablePuckSet(){ var tb=_builtinTableById(table.get());
  if(tb&&tb.skin){ var d='/table/'+tb.id+'/'; return {dealer:'url('+d+'dealerPuck.svg)', sb:'url('+d+'smallblindPuck.svg)', bb:'url('+d+'bigblindPuck.svg)'}; }
  if(tb) return tb.puck==='casino'?CASINO_PUCKS:PUCK_SET; var gt=_galleryTableById(table.get()); if(gt&&gt.pucks) return gt.pucks; return PUCK_SET; }
pucks.apply = function(id){ _pkApply(id); try{
  if (!id) _injectPucks(_tablePuckSet());          // Auto -> suit le tapis
  else if (id==='pokerth') _injectPucks(PUCK_SET);
  else if (id==='casino') _injectPucks(CASINO_PUCKS);
  else { var pk=_puckPkgById(id); if(pk) _injectPucks(pk.set); else { var gt=_galleryTableById(id); if(gt) _injectPucks(gt.pucks||null); } }
}catch(e){}
  // Les pucks sont des <img> figes au rendu (le feutre, lui, est une variable CSS live) :
  // apres avoir change --puck-*, on redemande un rendu des sieges + barre heros pour que
  // les jetons affiches prennent le nouveau motif. No-op hors partie (garde seats.length).
  try { if (window._renderSeats) window._renderSeats(); } catch (e) {}
};
pucks.set = pucks.apply;
try{ palette.apply(palette.get()); table.apply(table.get()); }catch(e){}   // palette (purge vars inline) + boutons/pucks via le style de table
function _loadThemes(){
  try{
    fetch('/themes/themes.json',{cache:'no-store'})
      .then(function(r){return r.ok?r.json():[];})
      .then(function(list){
        if(!Array.isArray(list)) return;
        var pkgs=list.filter(function(p){return p&&p.id&&(p.palette||p.table||p.felt||p.pucks||p.buttonImages||p.buttons);});
        _themePkgs=pkgs.map(function(p){ return {id:String(p.id),name:p.name||String(p.id),swatch:p.swatch||'#444'}; });
        _palettePkgs=pkgs.filter(function(p){return p.palette;}).map(function(p){ return {id:String(p.id),name:p.name||String(p.id),swatch:p.swatch||'#444',tokens:p.palette}; }).filter(function(p){ return !_isBuiltinPalette(p.id); });
        _tablePkgs=pkgs.filter(function(p){return p.table||p.felt;}).map(function(p){ return {id:String(p.id),name:p.name||String(p.id),swatch:p.swatch||'#444',tokens:p.table||{},felt:p.felt||null,full:!!p.full,fs:!!p.fullscreen}; }).filter(function(p){ return !_isBuiltinTable(p.id); });
        _pkgPresets=pkgs.filter(function(p){return p.palette||p.table||p.felt;}).map(function(p){ var vals={theme:(p.palette?String(p.id):''),table:'pokerth-live',buttons:'glossy',pucks:'pokerth-new'}; if(p.deck) vals.deck=String(p.deck); return {id:'pkg-'+p.id,name:p.name||String(p.id),swatch:p.swatch||'#444',values:vals}; });
        _puckPkgs=pkgs.filter(function(p){return p.pucks;}).map(function(p){ var set={},pv=p.pucks; ['dealer','sb','bb'].forEach(function(k){ if(pv[k]) set[k]='url(/themes/'+p.id+'/'+pv[k]+')'; }); return {id:String(p.id),name:p.name||String(p.id),swatch:p.swatch||'#444',set:set,preview:(pv.dealer?'/themes/'+p.id+'/'+pv.dealer:null)}; }).filter(function(p){ return p.id!=='pokerth'; });
        _buttonPkgs=pkgs.filter(function(p){return p.buttonImages||p.buttons;}).map(function(p){ var e={id:String(p.id),name:p.name||String(p.id),swatch:p.swatch||'#444'}; if(p.buttonImages){ e.images={}; ['fold','check','call','raise','allin'].forEach(function(k){ if(p.buttonImages[k]) e.images[k]='url(/themes/'+p.id+'/'+p.buttonImages[k]+')'; }); } if(p.buttons){ e.colors=p.buttons; } return e; }).filter(function(p){ return p.id!=='glossy'; });
        try{ var pp=_palettePkgById(palette.get()); if(pp) _injectPalette(pp); var tp=_tablePkgById(table.get()); if(tp) _injectTable(tp); }catch(e){}
        try{ table.apply(table.get()); buttons.apply(buttons.get()); pucks.apply(pucks.get()); }catch(e){}
        if(_body) _render();
      }).catch(function(){});
  }catch(e){}
}
_loadThemes();
_loadGalleryTables();

// ── Export de theme en .zip (P3) — 100% client : fetch statique du paquet
//    /themes/<id>/ (theme.json + assets referencesx) -> archive ZIP store-only
//    (meme format que l'ingestion admin `kind:theme`, ré-importable tel quel).
function _strU8(s){ if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s);
  var a=[]; for(var i=0;i<s.length;i++){ var c=s.charCodeAt(i);
    if(c<128)a.push(c); else if(c<2048){a.push(192|(c>>6));a.push(128|(c&63));}
    else {a.push(224|(c>>12));a.push(128|((c>>6)&63));a.push(128|(c&63));} } return new Uint8Array(a); }
var _crcTab=(function(){ var t=[],c,n,k; for(n=0;n<256;n++){ c=n; for(k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[n]=c>>>0; } return t; })();
function _crc32(u8){ var c=0xFFFFFFFF; for(var i=0;i<u8.length;i++) c=_crcTab[(c^u8[i])&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }
function _zipStore(files){
  var parts=[], central=[], offset=0;
  function u16(v){ return [v&255,(v>>8)&255]; }
  function u32(v){ v=v>>>0; return [v&255,(v>>8)&255,(v>>16)&255,(v>>24)&255]; }
  var DATE=0x0021, TIME=0; // 1980-01-01
  files.forEach(function(f){
    var name=_strU8(f.name), data=f.data, crc=_crc32(data);
    var lh=[].concat(u32(0x04034b50),u16(20),u16(0),u16(0),u16(TIME),u16(DATE),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0));
    parts.push(new Uint8Array(lh)); parts.push(name); parts.push(data);
    var cd=[].concat(u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(TIME),u16(DATE),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset));
    central.push(new Uint8Array(cd)); central.push(name);
    offset += lh.length + name.length + data.length;
  });
  var cdSize=0; central.forEach(function(p){ cdSize+=p.length; });
  var eocd=new Uint8Array([].concat(u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(cdSize),u32(offset),u16(0)));
  var all=parts.concat(central); all.push(eocd);
  return new Blob(all, {type:'application/zip'});
}
function _dlBlob(blob,name){ try{ var u=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=u; a.download=name;
  document.body.appendChild(a); a.click(); setTimeout(function(){ try{document.body.removeChild(a);URL.revokeObjectURL(u);}catch(e){} },0); }catch(e){} }
function _exportTheme(id, btn){
  var old = btn ? btn.textContent : '';
  if(btn){ btn.disabled=true; btn.textContent='\u2026'; }
  var base='/themes/'+encodeURIComponent(id)+'/';
  fetch(base+'theme.json',{cache:'no-store'}).then(function(r){ if(!r.ok) throw new Error('theme.json '+r.status); return r.text(); })
  .then(function(cfgText){
    var cfg=JSON.parse(cfgText);
    var files=[{name:'theme.json', data:_strU8(cfgText)}];
    var assets=[];
    if(cfg.felt) assets.push(cfg.felt);
    if(cfg.buttonImages) ['fold','check','call','raise','allin'].forEach(function(k){ if(cfg.buttonImages[k]) assets.push(cfg.buttonImages[k]); });
    if(cfg.pucks) ['dealer','sb','bb'].forEach(function(k){ if(cfg.pucks[k]) assets.push(cfg.pucks[k]); });
    var seen={}, uniq=[]; assets.forEach(function(a){ if(a && !seen[a]){ seen[a]=1; uniq.push(a); } });
    return uniq.reduce(function(chain, fname){
      return chain.then(function(acc){
        return fetch(base+encodeURIComponent(fname),{cache:'no-store'}).then(function(rr){ if(!rr.ok) throw new Error(fname+' '+rr.status); return rr.arrayBuffer(); })
          .then(function(buf){ acc.push({name:fname, data:new Uint8Array(buf)}); return acc; });
      });
    }, Promise.resolve(files));
  })
  .then(function(files){
    _dlBlob(_zipStore(files), id+'.zip');
    if(btn){ btn.textContent='\u2713'; setTimeout(function(){ btn.textContent=old; btn.disabled=false; },1200); }
  })
  .catch(function(e){ try{ console.warn('theme export failed:', e); }catch(_){}
    if(btn){ btn.textContent='\u2717'; setTimeout(function(){ btn.textContent=old; btn.disabled=false; },1600); } });
}
function _exportBlock(){
  if(!_themePkgs || !_themePkgs.length) return null;
  var wrap=document.createElement('div');
  wrap.appendChild(_sectionHeader(_t('themeExport','Export theme (.zip)'), ''));
  _themePkgs.forEach(function(p){
    var row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:8px;padding:5px 2px;';
    var sw=document.createElement('span');
    sw.style.cssText='width:16px;height:16px;border-radius:3px;flex:0 0 auto;border:1px solid var(--border,rgba(200,168,74,0.3));background:'+(p.swatch||'#444');
    var nm=document.createElement('span');
    nm.textContent=p.name;
    nm.style.cssText='flex:1 1 auto;min-width:0;font-family:var(--ff-mono,monospace);font-size:0.8rem;color:var(--text,#ccc);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    var btn=document.createElement('button');
    btn.type='button'; btn.textContent='\u2913 .zip';
    btn.style.cssText='flex:0 0 auto;font-family:var(--ff-mono,monospace);font-size:0.72rem;padding:4px 9px;border:1px solid var(--border,rgba(200,168,74,0.3));border-radius:4px;background:var(--field-bg,#1a1a1a);color:var(--gold-hi,#e8c860);cursor:pointer;';
    btn.onclick=function(){ _exportTheme(p.id, btn); };
    row.appendChild(sw); row.appendChild(nm); row.appendChild(btn);
    wrap.appendChild(row);
  });
  return wrap;
}

// Section repliable « Options avancées » (fermee par defaut, bas du panneau) —
// meme mecanique d'accordeon que _dropdownBlock (_openSec). Contient l'export
// de themes ; accueillera l'import de .zip ensuite.
function _advancedBlock(){
  var content = _exportBlock();
  if (!content) return null;                 // rien a montrer tant qu'aucun theme charge
  var secId = 'advanced';
  var open = _openSec === secId;
  var sec = document.createElement('div'); sec.style.cssText = 'margin:0 0 11px';
  var btn = document.createElement('button'); btn.type = 'button';
  btn.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:7px 9px;border-radius:8px;cursor:pointer;text-align:left;color:var(--cream,#f0e6d2);font-size:0.84rem;background:rgba(255,255,255,0.03);border:1px solid ' + (open ? 'var(--gold,#c8a84a)' : 'var(--border,rgba(200,168,74,0.25))');
  btn.innerHTML = '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _t('sectionAdvanced', 'Advanced') + '</span>'
    + '<span style="color:var(--text,#9aaa92);font-size:0.72rem;display:inline-block;transition:transform .15s;transform:rotate(' + (open ? '180' : '0') + 'deg)">\u25be</span>';
  btn.addEventListener('click', function (e) { e.stopPropagation(); _openSec = open ? null : secId; _render(); });
  sec.appendChild(btn);
  if (open) {
    _openBlockEl = sec;
    var body = document.createElement('div'); body.style.cssText = 'margin-top:8px';
    body.appendChild(content);
    sec.appendChild(body);
  }
  return sec;
}


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
  if (t && t.preview) return 'background:url(' + t.preview + ') center/cover';
  if (t && t.feltUrl) return 'background:url(' + t.feltUrl + ') center/cover';
  if (t && t.felt) return 'background:url(/themes/' + t.id + '/' + t.felt + ') center/cover';
  var sw = (t && t.swatch) || '#1e6b1e';
  return 'background:' + sw + ';background:radial-gradient(circle at 50% 36%, color-mix(in srgb,' + sw + ',#fff 12%), color-mix(in srgb,' + sw + ',#000 55%))';
}
function _pngFan(deckId, big) {
  function c(src, x, r) { return '<img src="' + src + '" alt="" style="position:absolute;top:50%;left:' + x + '%;height:' + (big ? 80 : 76) + '%;width:auto;aspect-ratio:5/7;border-radius:3px;transform:translateY(-50%) rotate(' + r + 'deg);box-shadow:0 1px 3px rgba(0,0,0,.5)">'; }
  var ext = _deckExt(deckId); var bust = '?v=' + (window.BUILD_VERSION || '0');
  var U=function(n,dflt){ var u=window._deckCardUrl&&window._deckCardUrl(deckId,n); return u||dflt; };
  return c(U('flipside','/cards/' + deckId + '/flipside.' + ext + bust), big ? 8 : 6, -12) + c(U(25,'/cards/' + deckId + '/25.' + ext), big ? 32 : 30, 0) + c(U(38,'/cards/' + deckId + '/38.' + ext), big ? 54 : 52, 12);
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
  if (deckId) return '<img src="' + ((window._deckCardUrl&&window._deckCardUrl(deckId,38))||('/cards/' + deckId + '/38.' + _deckExt(deckId))) + '" alt="" style="position:absolute;top:50%;left:50%;height:' + (big ? 78 : 74) + '%;width:auto;aspect-ratio:5/7;border-radius:3px;transform:translate(-50%,-50%) rotate(-6deg);box-shadow:0 2px 5px rgba(0,0,0,.5)">';
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
  if (kind === 'cardback') {
    if (item && item.id === '__import')
      return '<span style="' + box + ';display:flex;align-items:center;justify-content:center;background:#14331a;color:#c8a84a;font-weight:800;font-size:' + (big ? '1.5rem' : '0.85rem') + '">+</span>';
    var bu = item && item.backUrl;
    if (bu) return '<span style="' + box + ';background:linear-gradient(160deg,#1c5a28,#0c3214)"><img src="' + bu + '" alt="" style="position:absolute;top:50%;left:50%;height:' + (big ? 80 : 76) + '%;width:auto;aspect-ratio:5/7;object-fit:cover;border-radius:3px;transform:translate(-50%,-50%);box-shadow:0 1px 3px rgba(0,0,0,.5)"></span>';
    return '<span style="' + box + ';background:linear-gradient(160deg,#1c5a28,#0c3214)">' + _miniBack(big, 'top:50%;left:50%;transform:translate(-50%,-50%);') + '</span>';
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
  if (kind === 'seat') {
    if (item && item.preview) return '<span style="' + box + ';background:#0b1a0d;display:flex;align-items:center;justify-content:center"><img src="' + item.preview + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></span>';
    var av = big ? 24 : 9, bw = big ? 2 : 1, bh = big ? 5 : 2, g = big ? 3 : 1;
    var _sid = item ? item.id : '';
    var _avSt = (_sid === 'chip' || _sid === 'pokerth') ? 'border:none;background:radial-gradient(circle at 50% 50%,#b53636 0 62%,transparent 63%),repeating-conic-gradient(from 9deg,#f7f3ea 0 11deg,#7c1f1f 11deg 45deg);box-shadow:0 1px 2px rgba(0,0,0,0.5)' : 'background:#1b2a16;border:'+bw+'px solid #c8a84a;box-shadow:0 1px 2px rgba(0,0,0,0.5)';
    var avEl = '<i style="width:'+av+'px;height:'+av+'px;border-radius:50%;flex:none;'+_avSt+'"></i>';
    var felt = ';display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,#1c5a28,#0c3214)';
    var b1 = '<i style="display:block;width:'+(big?34:12)+'px;height:'+bh+'px;border-radius:'+bh+'px;background:#e7eaf0"></i>';
    var b2 = '<i style="display:block;width:'+(big?22:8)+'px;height:'+bh+'px;border-radius:'+bh+'px;background:#c8a84a"></i>';
    if (item && item.id === 'pokerth') {
      var cb = '<i style="display:block;width:'+(big?13:5)+'px;height:'+(big?19:7)+'px;border-radius:2px;border:1px solid #fff;background:repeating-linear-gradient(45deg,#b32424 0 '+(big?3:2)+'px,#e85a5a '+(big?3:2)+'px '+(big?6:4)+'px)"></i>';
      var pk = '<span style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:'+(big?3:1)+'px;padding:'+(big?'5px 7px':'2px 3px')+';border-radius:'+(big?9:4)+'px;background:linear-gradient(180deg,#424b5c,#1d222b);border:1px solid rgba(0,0,0,0.5);box-shadow:0 2px 6px rgba(0,0,0,0.5)">' + avEl + cb + cb + '<span style="flex-basis:100%;display:flex;flex-direction:column;align-items:center;gap:'+g+'px">' + b1 + b2 + '</span></span>';
      return '<span style="' + box + felt + '">' + pk + '</span>';
    }
    if (item && item.id === 'plate') {
      var pl = '<span style="display:flex;align-items:center;gap:'+(big?6:2)+'px;padding:'+(big?'6px 9px':'2px 3px')+';border-radius:'+(big?9:4)+'px;background:#2a2f38;border:1px solid rgba(255,255,255,0.18);box-shadow:0 2px 6px rgba(0,0,0,0.45)">' + avEl + '<span style="display:flex;flex-direction:column;gap:'+g+'px">' + b1 + b2 + '</span></span>';
      return '<span style="' + box + felt + '">' + pl + '</span>';
    }
    if (item && item.id === 'card') {
      var cd = '<span style="display:flex;flex-direction:column;align-items:center;gap:'+(big?3:1)+'px;padding:'+(big?'6px 8px':'2px 3px')+';border-radius:'+(big?10:4)+'px;background:#2a2f38;border:1px solid rgba(255,255,255,0.18);box-shadow:0 2px 6px rgba(0,0,0,0.45)">' + avEl + b1 + b2 + '</span>';
      return '<span style="' + box + felt + '">' + cd + '</span>';
    }
    if (item && item.id === 'bar') {
      var bp = '<span style="display:flex;flex-direction:column;align-items:center;gap:'+(big?3:1)+'px">' + avEl + '<span style="display:flex;align-items:center;gap:'+(big?4:1)+'px;padding:'+(big?'2px 6px':'1px 2px')+';border-radius:999px;background:#2a2f38;border:1px solid rgba(255,255,255,0.18)">' + b1 + b2 + '</span></span>';
      return '<span style="' + box + felt + '">' + bp + '</span>';
    }
    if (item && item.id === 'compact') {
      var co = '<span style="display:flex;flex-direction:column;align-items:center;gap:'+(big?3:1)+'px">' + avEl + '<i style="display:block;width:'+(big?16:6)+'px;height:'+bh+'px;border-radius:'+bh+'px;background:#c8a84a"></i></span>';
      return '<span style="' + box + felt + '">' + co + '</span>';
    }
    var clb1 = '<i style="display:block;width:'+(big?30:11)+'px;height:'+bh+'px;border-radius:'+bh+'px;background:#e7eaf0"></i>';
    var clb2 = '<i style="display:block;width:'+(big?20:7)+'px;height:'+bh+'px;border-radius:'+bh+'px;background:#c8a84a"></i>';
    var cl = '<span style="display:flex;flex-direction:column;align-items:center;gap:'+g+'px">' + avEl + clb1 + clb2 + '</span>';
    return '<span style="' + box + felt + '">' + cl + '</span>';
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
  if (!_openSec || !_openBlockEl || !_body) return;
  var panel = _body; // entete fixe : c'est le body qui scrolle desormais
  if (panel.isConnected === false || _openBlockEl.isConnected === false) return;
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

// ── Fenetre style QML : onglets + liste verticale (grande vignette + nom + auteur). ──
var _activeTab = 'table';
var TABLE_AUTHORS = {
  '':'PokerTH', 'pokerth-live':'PokerTH', 'green':'PokerTH', 'casino':'PokerTH',
  danuxi:'Daniel Hammer', mute:'mute design', mute2:'mute design', teal:'Pinboc', lemming:'lemming',
  matrix:'PokerTH Development Team', star_trek:'PokerTH Development Team', tripsixes:'TripSixes',
  wanted:'Etienne Graphic Designer', xanax:'Sebastien Kerguen'
};
var _TABS = [
  { id:'table',    kind:'table',    titleKey:'sectionTable',    fallback:'Table' },
  { id:'deck',     kind:'deck',     titleKey:'sectionDeck',     fallback:'Cards' },
  { id:'cardback', kind:'cardback', titleKey:'sectionCardback', fallback:'Card back' },
  { id:'seat',     kind:'seat',     titleKey:'sectionSeat',     fallback:'Seats' }
];
function _tabItems(id){
  if (id==='table')    return { cur: table.get(), opts: TABLES.concat(_galleryTables), pick:function(x){ table.apply(x); } };
  if (id==='deck')     return { cur: deck.get(),  opts: DECKS.concat(_galleryDecks),   pick:function(x){ deck.apply(x); } };
  if (id==='seat')     return { cur: seat.get(),  opts: SEATS.concat(_gallerySeats),   pick:function(x){ seat.apply(x); } };
  if (id==='cardback') return { cur: cardbackGet(), opts: _cardbackOptions(), pick:function(x){ if(x==='__import'){ _cardbackPickFile(); return true; } cardbackApply(x); } };
  return { cur:'', opts:[], pick:function(){} };
}
function _styleAuthor(kind, item){
  if (kind==='table') return TABLE_AUTHORS[item.id] || item.by || null;
  if (kind==='deck'){ if (item && item.by) return item.by; for (var i=0;i<DECKS.length;i++) if (DECKS[i].id===item.id) return 'PokerTH'; return null; }
  if (kind==='seat'){ if (item && item.by) return item.by; if (_isBuiltinSeat(item.id)) return 'PokerTH Development Team'; return null; }
  return item.by || null;
}
function _styleRow(kind, item, name, author, active, onClick){
  var row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:11px;padding:9px 10px;cursor:pointer;border-radius:9px;'
    + (active ? 'background:rgba(var(--sel-rgb,227,200,0),0.12);box-shadow:inset 0 0 0 1.5px var(--sel,#E3C800);'
              : 'border:1px solid var(--border,rgba(200,168,74,0.18));background:rgba(255,255,255,0.02);');
  var txt = '<div style="flex:1;min-width:0">'
    + '<div style="font-size:0.9rem;font-weight:600;color:var(--cream,#f0e6d2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + name + '</div>'
    + (author ? '<div style="font-size:0.72rem;color:var(--text,#9aaa92);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _t('styleBy','by') + ' ' + author + '</div>' : '')
    + (active ? '<div style="font-size:0.72rem;font-weight:700;color:var(--sel,#E3C800);margin-top:2px">\u2713 ' + _t('styleSelected','Selected') + '</div>' : '')
    + '</div>';
  row.innerHTML = _previewHTML(kind, item, true) + txt;
  if (item && item._imported) {
    var del=document.createElement('button'); del.type='button'; del.textContent='\u2715'; del.title=_t('delete','Delete');
    del.style.cssText='flex:0 0 auto;background:none;border:0;color:var(--text,#9aaa92);cursor:pointer;font-size:0.95rem;padding:2px 6px;line-height:1';
    del.addEventListener('click', function(e){ e.stopPropagation(); try{ if(confirm(_t('confirmDeleteStyle','Delete this imported style?'))) _deleteImported(item.id); }catch(_){ _deleteImported(item.id); } });
    row.appendChild(del);
  }
  if (!active) {
    row.addEventListener('mouseenter', function(){ row.style.background='var(--inset-hi,rgba(255,255,255,0.06))'; });
    row.addEventListener('mouseleave', function(){ row.style.background='rgba(255,255,255,0.02)'; });
  }
  row.addEventListener('click', function(e){ e.stopPropagation(); onClick(); });
  return row;
}
function _render(){
  if (!_body) return;
  _body.innerHTML = '';
  // Barre d'onglets (Table de jeu · Jeu de cartes · Dos de carte · Sieges).
  var tabbar = document.createElement('div');
  tabbar.style.cssText = 'display:flex;gap:2px;margin:0 0 11px;border-bottom:1px solid var(--border,rgba(200,168,74,0.18))';
  _TABS.forEach(function(tb){
    var act = _activeTab === tb.id;
    var b = document.createElement('button'); b.type='button'; b.textContent = _t(tb.titleKey, tb.fallback);
    b.style.cssText = 'flex:1;min-width:0;padding:8px 4px;cursor:pointer;font-size:0.75rem;font-weight:600;background:none;border:0;'
      + 'border-bottom:2px solid ' + (act ? 'var(--sel,#E3C800)' : 'transparent') + ';color:' + (act ? 'var(--cream,#f0e6d2)' : 'var(--text,#9aaa92)')
      + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
    b.addEventListener('click', function(e){ e.stopPropagation(); _activeTab = tb.id; _render(); });
    tabbar.appendChild(b);
  });
  _body.appendChild(tabbar);
  // Liste de l'onglet actif.
  var tab = _TABS[0]; for (var t=0;t<_TABS.length;t++) if (_TABS[t].id===_activeTab) tab=_TABS[t];
  var info = _tabItems(_activeTab);
  var list = document.createElement('div'); list.style.cssText = 'display:flex;flex-direction:column;gap:7px';
  info.opts.forEach(function(it){
    var name = it.name || _t(it.key, it.fallback);
    var author = _styleAuthor(tab.kind, it);
    var active = it.id === info.cur;
    var row = _styleRow(tab.kind, it, name, author, active, (function(id){ return function(){ var keep = info.pick(id); if (!keep) _render(); }; })(it.id));
    list.appendChild(row);
  });
  if (_activeTab === 'table' || _activeTab === 'deck' || _activeTab === 'seat') {
    var _ik=_activeTab;
    var imp=document.createElement('button'); imp.type='button';
    imp.textContent='\u2795 '+(_ik==='table'?_t('importTable','Import a table (.zip)'):_ik==='deck'?_t('importDeck','Import a deck (.zip)'):_t('importSeat','Import a seat pack (.zip)'));
    imp.style.cssText='margin-top:5px;padding:10px;border:1px dashed var(--border,rgba(200,168,74,0.4));border-radius:9px;background:none;color:var(--gold,#c8a84a);cursor:pointer;font-size:0.82rem;font-weight:600;text-align:center';
    imp.addEventListener('click', function(e){ e.stopPropagation(); if(_ik==='table') _pickTableImport(); else if(_ik==='deck') _pickDeckImport(); else _pickSeatImport(); });
    list.appendChild(imp);
  }
  _body.appendChild(list);
}

function _makeThemeDraggable(panel, handle){
  if(!panel || !handle) return;
  handle.style.cursor='move'; handle.style.touchAction='none';
  var sx=0, sy=0, sl=0, st=0, drag=false;
  handle.addEventListener('pointerdown', function(e){
    if(e.target.closest && e.target.closest('button')) return;
    drag=true;
    var r=panel.getBoundingClientRect();
    sx=e.clientX; sy=e.clientY; sl=r.left; st=r.top;
    try{ handle.setPointerCapture(e.pointerId); }catch(_){}
    e.preventDefault();
  });
  handle.addEventListener('pointermove', function(e){
    if(!drag) return;
    var w=panel.offsetWidth, h=panel.offsetHeight, vw=window.innerWidth, vh=window.innerHeight;
    panel.style.left=Math.max(4, Math.min(sl+(e.clientX-sx), vw-w-4))+'px';
    panel.style.top =Math.max(4, Math.min(st+(e.clientY-sy), vh-h-4))+'px';
  });
  function end(e){
    if(!drag) return; drag=false;
    try{ handle.releasePointerCapture(e.pointerId); }catch(_){}
    try{ var r=panel.getBoundingClientRect(); localStorage.setItem('pth_winpos_theme', JSON.stringify({left:Math.round(r.left), top:Math.round(r.top)})); }catch(_){}
  }
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}

function openThemePanel(ev) {
  try { if (ev && ev.stopPropagation) ev.stopPropagation(); } catch (e) {}
  closeThemePanel();

  // Voile plein ecran capteur de clic exterieur : seulement sur mobile (<900px).
  // Sur tablette/desktop on ne le cree pas -> le panneau reste ouvert et la barre
  // d'action reste cliquable meme quand une action joueur est requise (fermeture
  // via la croix ou Echap). Mobile : comportement inchange (clic exterieur ferme).
  var overlay = null;
  if (!(window.matchMedia && window.matchMedia('(min-width:900px) and (min-height:600px)').matches)) {
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;background:transparent';
    overlay.addEventListener('click', closeThemePanel);
  }

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.setAttribute('role', 'menu');
  panel.style.cssText = 'position:fixed;z-index:9999;box-sizing:border-box;width:min(400px, calc(100vw - 16px));max-height:74vh;overflow:hidden;display:flex;flex-direction:column;'
    + 'background:var(--panel,#0d1f10);border:1px solid var(--gold-dim,rgba(200,168,74,0.45));'
    + 'border-radius:10px;padding:0;box-shadow:0 12px 32px rgba(0,0,0,0.6)';

  var header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;flex:none;padding:11px 13px 9px;border-bottom:1px solid var(--border,rgba(200,168,74,0.18))';
  var title = document.createElement('span');
  title.textContent = _t('themeTooltip', 'Theme');
  title.setAttribute('data-i18n', 'themeTooltip'); // suit le changement de langue comme le reste (setLang)
  title.style.cssText = 'font-size:0.95rem;font-weight:700;color:var(--cream,#f0e6d2)';
  var x = document.createElement('button');
  x.type = 'button'; x.innerHTML = '\u2715';
  x.style.cssText = 'background:none;border:0;color:var(--text,#9aaa92);cursor:pointer;font-size:1rem;padding:0 2px;line-height:1';
  x.addEventListener('click', function (e) { e.stopPropagation(); closeThemePanel(); });
  header.appendChild(title); header.appendChild(x);
  panel.appendChild(header);

  _body = document.createElement('div');
  _body.style.cssText = 'flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:11px 13px 13px';
  panel.appendChild(_body);
  _activeTab = 'table';
  _render();
  // Re-pull the runtime galleries each time the panel opens, so packages just
  // imported in the admin show up without reloading the app. Each loader calls
  // _render() again when its fetch resolves (network-first via the service
  // worker), refreshing the open panel in place.
  try { _loadGalleryDecks(); _loadGalleryTables(); _loadThemes(); _loadImportedTables(); _loadImportedDecks(); } catch (e) {}

  if (overlay) document.body.appendChild(overlay);
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

  if (window.matchMedia && window.matchMedia('(min-width:900px) and (min-height:600px)').matches) {
    try {
      var _saved = localStorage.getItem('pth_winpos_theme');
      if (_saved) { var _d = JSON.parse(_saved);
        if (_d && typeof _d.left === 'number') {
          var _mw = panel.offsetWidth, _mh = panel.offsetHeight;
          panel.style.left = Math.max(8, Math.min(_d.left, vw - _mw - 8)) + 'px';
          panel.style.top  = Math.max(8, Math.min(_d.top,  vh - _mh - 8)) + 'px';
        } }
    } catch (e) {}
    _makeThemeDraggable(panel, header);
  }

  document.addEventListener('keydown', _panelEsc);
}

// ── Exports + legacy global compatibility ──
export { PALETTES, TABLES, DECKS, PRESETS, AXES, makeAxis, applyPreset, activePreset, openThemePanel, closeThemePanel };

window.openThemePanel = openThemePanel;
// Rendu EMBARQUE de la fenetre thème dans un conteneur (Options avancees > Style),
// facon QML : on reutilise le meme _render (onglets + listes) en ciblant le host.
window.renderThemeInto = function(host){
  if(!host) return;
  _body = host; _activeTab = 'table';
  try { _render(); } catch(e){}
  try { _loadGalleryDecks(); _loadGalleryTables(); _loadThemes(); _loadGallerySeats(); _loadImportedTables(); _loadImportedDecks(); _loadImportedSeats(); } catch(e){}
};
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
