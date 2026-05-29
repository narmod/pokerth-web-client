// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/i18n.mjs
//
// Internationalisation module — bilingual EN/FR string catalogue plus the
// helpers (t, setLang, toggleLang, getLang) that read and update it.
//
// History: extracted from public/pokerth.js as the first step of the
// Phase 2 modular refactor. The legacy code in pokerth.js still calls
// `t(...)`, `setLang(...)`, `toggleLang()` and reads `_lang` directly,
// so this module re-attaches those names on `window` for backward
// compatibility. Once every caller has been migrated to ES-module
// imports, the global aliases at the bottom can be dropped.
// ─────────────────────────────────────────────────────────────────────────

import enLang from './lang/en.mjs';
import frLang from './lang/fr.mjs';
import deLang from './lang/de.mjs';
import esLang from './lang/es.mjs';
import itLang from './lang/it.mjs';

// ── Language registry ───────────────────────────────────────────────────
// Single place to wire a language. To add one: create ./lang/<code>.mjs
// (copy en.mjs and translate), add an import above, then add it here.
// LANG (the string tables) and LANG_META (flag / label / dir) are assembled
// automatically from each module's exports — no other code changes needed.
const LANG_MODULES = { en: enLang, fr: frLang, de: deLang, es: esLang, it: itLang };

const LANG = {};
const LANG_META = {};
for (const code in LANG_MODULES) {
  LANG[code] = LANG_MODULES[code].strings;
  LANG_META[code] = LANG_MODULES[code].meta;
}
function _flagFor(code) {
  return (LANG_META[code] && LANG_META[code].flag)
    || ('<span class="lang-flag lang-flag-code" style="font:700 0.72rem/1 monospace;letter-spacing:.05em">' + String(code).toUpperCase() + '</span>');
}
function _labelFor(code) {
  return (LANG_META[code] && LANG_META[code].label) || String(code).toUpperCase();
}

// Dev flag controlling i18n diagnostics (parity check + missing-key
// warnings). Off by default; opt in with ?i18ndebug in the URL,
// localStorage.setItem('pth_i18n_debug','1'), or by running on localhost.
const I18N_DEBUG = (function() {
    try {
        return /[?&]i18ndebug\b/.test(location.search)
            || localStorage.getItem('pth_i18n_debug') === '1'
            || location.hostname === 'localhost'
            || location.hostname === '127.0.0.1';
    } catch (e) {
        return false;
    }
})();

let _lang = (function(){
    var avail = Object.keys(LANG);
    try {
        // 1. The user has manually picked a language before — respect it
        //    (only if that language is still available).
        var saved = localStorage.getItem('pth_lang');
        if (saved && avail.indexOf(saved) !== -1) return saved;
        // 2. First visit: match the browser locale against the available
        //    languages by primary subtag (fr-CA → fr, es-MX → es). This
        //    avoids the browser's "Translate this page?" banner for a
        //    speaker whose language we support. Fall back to English.
        var bl = (navigator.language || '').toLowerCase().split('-')[0];
        if (avail.indexOf(bl) !== -1) return bl;
        return 'en';
    } catch (e) {
        return 'en';
    }
})();

// Translate key `k`. Optional `params` interpolates {token} placeholders,
// so callers no longer hand-roll `.replace('{x}', …)` chains and every
// language gets the same substitution logic for free:
//     t('voiceWins', { name: 'Ada', n: 500 })  ->  "Ada wins 500"
// Resolution order: active language → English fallback → raw key.
function t(k, params) {
    var dict = LANG[_lang] || LANG.en;
    var s = dict[k];
    if (s == null) {
        s = LANG.en[k];
        if (s == null) {
            // No EN fallback either: a genuine missing-key bug, not just an
            // untranslated string. Surface it in dev, stay silent in prod.
            if (I18N_DEBUG) console.warn('[i18n] missing key (no EN fallback):', k);
            return k;
        }
    }
    if (params) {
        s = s.replace(/\{(\w+)\}/g, function(m, name) {
            return (params[name] != null) ? String(params[name]) : m;
        });
    }
    return s;
}

// Dev-only catalogue health check: for every non-English language, report
// the keys it is missing (these silently fall back to English) and any
// keys it has that English doesn't (typos / dead entries). Gated by
// I18N_DEBUG so it never spams real users' consoles in production.
function checkI18nParity() {
    if (!I18N_DEBUG) return;
    var ref = Object.keys(LANG.en);
    var refSet = {};
    ref.forEach(function(k){ refSet[k] = true; });
    Object.keys(LANG).forEach(function(code) {
        if (code === 'en') return;
        var own = Object.keys(LANG[code]);
        var ownSet = {};
        own.forEach(function(k){ ownSet[k] = true; });
        var missing = ref.filter(function(k){ return !ownSet[k]; });
        var extra = own.filter(function(k){ return !refSet[k]; });
        if (missing.length) console.warn('[i18n] "' + code + '" is missing ' + missing.length + ' key(s) (fall back to EN):', missing);
        if (extra.length) console.warn('[i18n] "' + code + '" has ' + extra.length + ' key(s) not in EN (typo/dead?):', extra);
        if (!missing.length && !extra.length) console.info('[i18n] "' + code + '" \u2713 full parity with EN (' + ref.length + ' keys)');
    });
}

function setLang(l) {
  _lang = l;
  try { localStorage.setItem('pth_lang', l); } catch(e) {}
  // Keep <html lang> in sync with the active UI language. The browser
  // uses this attribute to decide whether to offer a translation banner;
  // matching the user's locale here makes the banner disappear.
  try { document.documentElement.lang = l; } catch(e) {}
  // Text direction follows the language (ltr today; ready for rtl langs).
  try { document.documentElement.dir = (LANG_META[l] && LANG_META[l].dir) || 'ltr'; } catch(e) {}
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var k = el.getAttribute('data-i18n');
    el.textContent = t(k);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
  // Placeholder attributes (e.g. the nickname and chat inputs). Single
  // mechanism: data-i18n-placeholder. (The old data-i18n-ph alias was
  // dropped — it had zero uses in the HTML.)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  // Localise every <option> tagged with data-i18n-opt. This replaces the
  // previous index-based per-select patching (login-mode, cf-raise-mode,
  // cf-end-raise, cf-game-type): adding a new translatable <option> now
  // only requires the attribute in the HTML, never a change here.
  document.querySelectorAll('[data-i18n-opt]').forEach(function(el) {
    el.textContent = t(el.getAttribute('data-i18n-opt'));
  });
  // Re-render aide si elle est ouverte
  var ho = document.getElementById('hands-overlay');
  if (ho && ho.style.display !== 'none') renderHandsHelp();
  // Refresh game screen dynamic elements if in game
  var gRound = document.getElementById('g-round');
  if (gRound && typeof gameState !== 'undefined') {
    var rMap = [t('preflop'),t('flop'),t('turn'),t('river'),t('preflop')+' (SB)',t('preflop')+' (BB)'];
    gRound.textContent = rMap[gameState] || gRound.textContent;
  }
  // Sync language-toggle buttons across all screens.
  // We use an SVG flag rather than a regional-indicator emoji because
  // Windows lacks glyphs for those pairs (renders as plain "GB"/"FR").
  var flagSvg = _flagFor(_lang);
  var langLabel = _labelFor(_lang);
  ['lang-toggle-connect','lang-toggle-lobby','lang-toggle-game'].forEach(function(id){
    var b = document.getElementById(id);
    if (b) b.innerHTML = flagSvg;
  });
  // Mobile overflow-menu entries (one in the game header, one in the
  // lobby header) keep a text label alongside the flag.
  ['lang-toggle-game-mob', 'lang-toggle-lobby-mob'].forEach(function(id){
    var bMob = document.getElementById(id);
    if (bMob) bMob.innerHTML = flagSvg + ' ' + langLabel;
  });
  // Update more/less options label
  var ml = document.getElementById('cf-more-label');
  if (ml) { var cfOpen = document.getElementById('cf-more-opts'); ml.textContent = (cfOpen && cfOpen.style.display !== 'none') ? t('lessOptions') : t('moreOptions'); }
  // Re-render the lobby game list so badges/labels follow the language
  try { if (typeof window.renderGames === 'function') window.renderGames(); } catch(e) {}
  // Re-localise le nom de table par défaut s'il n'a pas été personnalisé
  try { if (typeof window._localizeCreateNameField === 'function') window._localizeCreateNameField(); } catch(e) {}
  // Update lang toggle buttons
  document.querySelectorAll('.lang-btn').forEach(function(b){
    b.classList.toggle('active', b.dataset.lang === _lang);
  });
}


// Cycle to the next language. Kept for backward compatibility and as a
// programmatic shortcut; the UI now uses the picker menu below instead, which
// scales cleanly past two languages (a cycling button does not).
function toggleLang() {
    var ks = Object.keys(LANG);
    var i = ks.indexOf(_lang);
    setLang(ks[(i + 1) % ks.length] || 'en');
}

function getLang() {
    return _lang;
}

// ─── Language picker menu ───────────────────────────────────────────────
// A small dropdown listing every registered language (flag + native name,
// current one checked). Built entirely from the registry, so a new language
// appears automatically with zero UI changes. Styled inline to avoid any
// dependency on pokerth.css. Opened by the header/connect language buttons.
function _langMenuEsc(e) { if (e.key === 'Escape') closeLangMenu(); }

function closeLangMenu() {
    try { document.removeEventListener('keydown', _langMenuEsc); } catch (e) {}
    ['lang-menu', 'lang-menu-overlay'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
    });
}

function openLangMenu(ev) {
    try { if (ev && ev.stopPropagation) ev.stopPropagation(); } catch (e) {}
    closeLangMenu();
    var codes = Object.keys(LANG);
    if (codes.length < 2) return; // nothing to choose

    var overlay = document.createElement('div');
    overlay.id = 'lang-menu-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;background:transparent';
    overlay.addEventListener('click', closeLangMenu);

    var menu = document.createElement('div');
    menu.id = 'lang-menu';
    menu.setAttribute('role', 'menu');
    menu.style.cssText = 'position:fixed;z-index:9999;min-width:165px;max-height:60vh;overflow:auto;'
        + 'background:var(--panel,#0d1f10);border:1px solid var(--gold-dim,rgba(200,168,74,0.45));'
        + 'border-radius:8px;padding:5px;box-shadow:0 12px 32px rgba(0,0,0,0.6)';

    codes.forEach(function (code) {
        var active = (code === _lang);
        var row = document.createElement('button');
        row.type = 'button';
        row.setAttribute('role', 'menuitemradio');
        row.setAttribute('aria-checked', active ? 'true' : 'false');
        row.dataset.lang = code;
        row.style.cssText = 'display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;'
            + 'padding:8px 12px;margin:0;border:0;cursor:pointer;text-align:left;border-radius:6px;'
            + 'font-size:0.9rem;line-height:1.1;color:var(--cream,#f0e6d2);background:'
            + (active ? 'var(--gold-dim,rgba(200,168,74,0.18))' : 'transparent');
        row.innerHTML = '<span style="display:inline-flex;width:24px;flex:none">' + _flagFor(code) + '</span>'
            + '<span style="flex:1">' + _labelFor(code) + '</span>'
            + (active ? '<span style="color:var(--gold,#c8a84a)">\u2713</span>' : '');
        if (!active) {
            row.addEventListener('mouseenter', function () { row.style.background = 'rgba(255,255,255,0.06)'; });
            row.addEventListener('mouseleave', function () { row.style.background = 'transparent'; });
        }
        row.addEventListener('click', function (e) { e.stopPropagation(); closeLangMenu(); setLang(code); });
        menu.appendChild(row);
    });

    document.body.appendChild(overlay);
    document.body.appendChild(menu);

    // Position below the anchor, clamped to the viewport; center if the
    // anchor is missing/hidden (e.g. opened from a mobile overflow item).
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

    document.addEventListener('keydown', _langMenuEsc);
}

// ─── Modern ES module exports ───────────────────────────────────────────
export { LANG, t, setLang, toggleLang, getLang, checkI18nParity, openLangMenu, closeLangMenu };

// ─── Legacy global compatibility ────────────────────────────────────────
// pokerth.js (the un-refactored majority) still references these as bare
// names in the global scope. Until every reference is migrated to an
// `import`, mirror them on window so the existing code keeps working
// unchanged.
//   - `_lang` is special: it is read AND written from pokerth.js, so we
//     expose it as a getter/setter property that reflects the internal
//     module state in both directions.
window.LANG = LANG;
window.t = t;
window.setLang = setLang;
window.toggleLang = toggleLang;
window.openLangMenu = openLangMenu;
window.closeLangMenu = closeLangMenu;
Object.defineProperty(window, '_lang', {
    configurable: true,
    get() { return _lang; },
    set(v) { _lang = v; },
});

// Also expose a single namespaced object for the migration-aware code
// that wants a clean entry point.
window.I18N = { LANG, t, setLang, toggleLang, getLang, checkParity: checkI18nParity, openLangMenu, closeLangMenu };

// ─── Auto-init: apply the current language on first DOM-ready ───────────
// Without this, the language-toggle buttons stay empty until the user
// clicks them (because setLang() is the function that injects the SVG
// flag). Run it as soon as the DOM is parsed.
function _initI18n() {
    try { setLang(_lang); } catch (e) { console.warn('[i18n] init failed:', e); }
    try { checkI18nParity(); } catch (e) {}
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initI18n, { once: true });
} else {
    // DOM already parsed (defer scripts, late module load) — run now.
    _initI18n();
}

