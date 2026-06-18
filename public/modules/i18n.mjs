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
import ptBrLang from './lang/pt-br.mjs';
import ptPtLang from './lang/pt-pt.mjs';
import nlLang from './lang/nl.mjs';
import plLang from './lang/pl.mjs';
import ruLang from './lang/ru.mjs';
import zhLang from './lang/zh.mjs';
import trLang from './lang/tr.mjs';
import ukLang from './lang/uk.mjs';
import jaLang from './lang/ja.mjs';
import svLang from './lang/sv.mjs';
import nbLang from './lang/nb.mjs';
import daLang from './lang/da.mjs';
import fiLang from './lang/fi.mjs';
import csLang from './lang/cs.mjs';
import skLang from './lang/sk.mjs';
import roLang from './lang/ro.mjs';
import huLang from './lang/hu.mjs';
import elLang from './lang/el.mjs';
import bgLang from './lang/bg.mjs';
import hrLang from './lang/hr.mjs';
import srLang from './lang/sr.mjs';
import afLang from './lang/af.mjs';
import caLang from './lang/ca.mjs';
import glLang from './lang/gl.mjs';
import gdLang from './lang/gd.mjs';
import ltLang from './lang/lt.mjs';
import taLang from './lang/ta.mjs';
import viLang from './lang/vi.mjs';
import koLang from './lang/ko.mjs';
import zhTwLang from './lang/zh-tw.mjs';
import hiLang from './lang/hi.mjs';

// ── Language registry ───────────────────────────────────────────────────
// Single place to wire a language. To add one: create ./lang/<code>.mjs
// (copy en.mjs and translate), add an import above, then add it here.
// LANG (the string tables) and LANG_META (flag / label / dir) are assembled
// automatically from each module's exports — no other code changes needed.
const LANG_MODULES = { en: enLang, fr: frLang, de: deLang, es: esLang, it: itLang, 'pt-BR': ptBrLang, 'pt-PT': ptPtLang, nl: nlLang, pl: plLang, ru: ruLang, zh: zhLang, tr: trLang, uk: ukLang, ja: jaLang, sv: svLang, nb: nbLang, da: daLang, fi: fiLang, cs: csLang, sk: skLang, ro: roLang, hu: huLang, el: elLang, bg: bgLang, hr: hrLang, sr: srLang, af: afLang, ca: caLang, gl: glLang, gd: gdLang, lt: ltLang, ta: taLang, vi: viLang, ko: koLang, 'zh-TW': zhTwLang, hi: hiLang };

const LANG = {};
const LANG_META = {};
for (const code in LANG_MODULES) {
  LANG[code] = LANG_MODULES[code].strings;
  LANG_META[code] = LANG_MODULES[code].meta;
}
// ── Clé 'assist' (bouton activer/désactiver l'aide « force de la main »).
// Ajoutée ici pour les 33 langues en un seul endroit plutôt que d'éditer
// chaque ./lang/*.mjs. Toute langue absente retombe sur l'anglais via t().
const _ASSIST_I18N = {
  en: 'Assistance', fr: 'Assistance', de: 'Hilfe', es: 'Ayuda', it: 'Aiuto',
  'pt-BR': 'Ajuda', 'pt-PT': 'Ajuda', nl: 'Hulp', pl: 'Pomoc', ru: 'Помощь',
  zh: '辅助', tr: 'Yardım', uk: 'Допомога', ja: 'アシスト', sv: 'Hjälp',
  nb: 'Hjelp', da: 'Hjælp', fi: 'Apu', cs: 'Nápověda', sk: 'Pomoc',
  ro: 'Asistență', hu: 'Segítség', el: 'Βοήθεια', bg: 'Помощ', hr: 'Pomoć',
  sr: 'Помоћ', af: 'Hulp', ca: 'Ajuda', gl: 'Axuda', gd: 'Cuideachadh',
  lt: 'Pagalba', ta: 'உதவி', vi: 'Trợ giúp'
};
for (const _c in _ASSIST_I18N) { if (LANG[_c]) LANG[_c].assist = _ASSIST_I18N[_c]; }
// ── Clés 'displayBB' / 'displayChips' : message clair du toast quand on
// bascule l'unité d'affichage (grosses blindes ↔ jetons). Ajoutées ici pour
// les 33 langues. Repli EN automatique via t().
const _DISPLAYBB_I18N = {
  en: 'Amounts in big blinds', fr: 'Montants en grosses blindes', de: 'Beträge in Big Blinds',
  es: 'Cantidades en ciegas grandes', it: 'Importi in big blind', 'pt-BR': 'Valores em big blinds',
  'pt-PT': 'Valores em big blinds', nl: 'Bedragen in big blinds', pl: 'Kwoty w dużych ciemnych',
  ru: 'Суммы в больших блайндах', zh: '以大盲注显示', tr: 'Büyük blind cinsinden',
  uk: 'Суми у великих блайндах', ja: 'ビッグブラインドで表示', sv: 'Belopp i stora mörkar',
  nb: 'Beløp i store blinder', da: 'Beløb i store blinds', fi: 'Summat isoina blindeina',
  cs: 'Částky ve velkých blindech', sk: 'Sumy vo veľkých blindoch', ro: 'Sume în blinduri mari',
  hu: 'Összegek nagyvakban', el: 'Ποσά σε big blinds', bg: 'Суми в големи блайндове',
  hr: 'Iznosi u velikim blindovima', sr: 'Износи у великим блайндовима', af: 'Bedrae in groot blinds',
  ca: 'Imports en cegues grans', gl: 'Importes en cegas grandes', gd: 'Suimean ann am big blinds',
  lt: 'Sumos didžiaisiais blaindais', ta: 'பெரிய பிளைண்டுகளில்', vi: 'Số tiền theo big blind'
};
const _DISPLAYCHIPS_I18N = {
  en: 'Amounts in chips', fr: 'Montants en jetons', de: 'Beträge in Chips',
  es: 'Cantidades en fichas', it: 'Importi in fiche', 'pt-BR': 'Valores em fichas',
  'pt-PT': 'Valores em fichas', nl: 'Bedragen in fiches', pl: 'Kwoty w żetonach',
  ru: 'Суммы в фишках', zh: '以筹码显示', tr: 'Çip cinsinden',
  uk: 'Суми у фішках', ja: 'チップで表示', sv: 'Belopp i marker',
  nb: 'Beløp i sjetonger', da: 'Beløb i jetoner', fi: 'Summat pelimerkkeinä',
  cs: 'Částky v žetonech', sk: 'Sumy v žetónoch', ro: 'Sume în jetoane',
  hu: 'Összegek zsetonban', el: 'Ποσά σε μάρκες', bg: 'Суми в чипове',
  hr: 'Iznosi u žetonima', sr: 'Износи у жетонима', af: 'Bedrae in fiches',
  ca: 'Imports en fitxes', gl: 'Importes en fichas', gd: 'Suimean ann an tòcanan',
  lt: 'Sumos žetonais', ta: 'சிப்களில்', vi: 'Số tiền theo chip'
};
for (const _c in _DISPLAYBB_I18N) { if (LANG[_c]) LANG[_c].displayBB = _DISPLAYBB_I18N[_c]; }
for (const _c in _DISPLAYCHIPS_I18N) { if (LANG[_c]) LANG[_c].displayChips = _DISPLAYCHIPS_I18N[_c]; }
// ── Clé 'serverPassword' : libellé du champ (optionnel) du mot de passe
// SERVEUR (authServerPassword), affiché sous « plus d'options » pour les
// serveurs auto-hébergés. Ajoutée ici pour toutes les langues ; toute langue
// absente retombe sur l'anglais via t().
const _SERVERPASS_I18N = {
  en: 'Server password (optional)', fr: 'Mot de passe serveur (optionnel)',
  de: 'Serverpasswort (optional)', es: 'Contraseña del servidor (opcional)',
  it: 'Password del server (opzionale)', 'pt-BR': 'Senha do servidor (opcional)',
  'pt-PT': 'Palavra-passe do servidor (opcional)', nl: 'Serverwachtwoord (optioneel)',
  pl: 'Hasło serwera (opcjonalne)', ru: 'Пароль сервера (необязательно)',
  zh: '服务器密码（可选）', tr: 'Sunucu parolası (isteğe bağlı)',
  uk: 'Пароль сервера (необов\u02bcязково)', ja: 'サーバーパスワード（任意）',
  sv: 'Serverlösenord (valfritt)', nb: 'Serverpassord (valgfritt)',
  da: 'Serveradgangskode (valgfrit)', fi: 'Palvelimen salasana (valinnainen)',
  cs: 'Heslo serveru (volitelné)', sk: 'Heslo servera (voliteľné)',
  ro: 'Parola serverului (opțional)', hu: 'Szerver jelszó (opcionális)',
  el: 'Κωδικός διακομιστή (προαιρετικό)', bg: 'Парола за сървъра (по избор)',
  hr: 'Lozinka poslužitelja (neobavezno)', sr: 'Лозинка сервера (опционо)',
  af: 'Bedienerwagwoord (opsioneel)', ca: 'Contrasenya del servidor (opcional)',
  gl: 'Contrasinal do servidor (opcional)', gd: 'Facal-faire an fhrithealaiche (roghainneil)',
  lt: 'Serverio slaptažodis (nebūtina)', ta: 'சேவையகக் கடவுச்சொல் (விருப்பத்தேர்வு)',
  vi: 'Mật khẩu máy chủ (tùy chọn)', ko: '서버 비밀번호 (선택 사항)',
  'zh-TW': '伺服器密碼（選填）', hi: 'सर्वर पासवर्ड (वैकल्पिक)'
};
for (const _c in _SERVERPASS_I18N) { if (LANG[_c]) LANG[_c].serverPassword = _SERVERPASS_I18N[_c]; }
// ── Clé 'userPassword' : libellé (placeholder) du champ mot de passe de
// COMPTE (clientUserData) saisi par l'utilisateur dans la roue crantée en
// mode LAN / serveur dédié. Rempli ⇒ le client bascule en authenticatedLogin.
// Toutes les langues ; repli EN via t().
const _USERPASS_I18N = {
  en: 'User password (optional)', fr: 'Mot de passe utilisateur (optionnel)',
  de: 'Benutzerpasswort (optional)', es: 'Contraseña de usuario (opcional)',
  it: 'Password utente (opzionale)', 'pt-BR': 'Senha do usuário (opcional)',
  'pt-PT': 'Palavra-passe do utilizador (opcional)', nl: 'Gebruikerswachtwoord (optioneel)',
  pl: 'Hasło użytkownika (opcjonalne)', ru: 'Пароль пользователя (необязательно)',
  zh: '用户密码（可选）', tr: 'Kullanıcı parolası (isteğe bağlı)',
  uk: 'Пароль користувача (необовʼязково)', ja: 'ユーザーパスワード（任意）',
  sv: 'Användarlösenord (valfritt)', nb: 'Brukerpassord (valgfritt)',
  da: 'Brugeradgangskode (valgfrit)', fi: 'Käyttäjän salasana (valinnainen)',
  cs: 'Uživatelské heslo (volitelné)', sk: 'Používateľské heslo (voliteľné)',
  ro: 'Parolă utilizator (opțional)', hu: 'Felhasználói jelszó (opcionális)',
  el: 'Κωδικός χρήστη (προαιρετικό)', bg: 'Потребителска парола (по избор)',
  hr: 'Korisnička lozinka (neobavezno)', sr: 'Корисничка лозинка (опционо)',
  af: 'Gebruikerwagwoord (opsioneel)', ca: 'Contrasenya d\'usuari (opcional)',
  gl: 'Contrasinal de usuario (opcional)', gd: 'Facal-faire cleachdaiche (roghainneil)',
  lt: 'Naudotojo slaptažodis (nebūtina)', ta: 'பயனர் கடவுச்சொல் (விருப்பத்தேர்வு)',
  vi: 'Mật khẩu người dùng (tùy chọn)', ko: '사용자 비밀번호 (선택 사항)',
  'zh-TW': '使用者密碼（選填）', hi: 'उपयोगकर्ता पासवर्ड (वैकल्पिक)'
};
for (const _c in _USERPASS_I18N) { if (LANG[_c]) LANG[_c].userPassword = _USERPASS_I18N[_c]; }
// ── Lobby : rythme de montée des blindes (« {n} mains » / « {n} min ») ──
// EN/FR vivent dans en.mjs/fr.mjs ; ici les 34 autres langues. « min »
// convient à toutes les écritures latines (repli EN automatique), donc
// seules les écritures non-latines sont surchargées côté minutes.
const _BLINDSUPHANDS_I18N = {
  de: '{n} Hände', es: '{n} manos', it: '{n} mani', 'pt-BR': '{n} mãos',
  'pt-PT': '{n} mãos', nl: '{n} handen', pl: '{n} rozdań', ru: '{n} раздач',
  zh: '{n} 手', tr: '{n} el', uk: '{n} роздач', ja: '{n} ハンド',
  sv: '{n} händer', nb: '{n} hender', da: '{n} hænder', fi: '{n} kättä',
  cs: '{n} rozdání', sk: '{n} rozdaní', ro: '{n} mâini', hu: '{n} leosztás',
  el: '{n} χέρια', bg: '{n} ръце', hr: '{n} ruku', sr: '{n} руку',
  af: '{n} hande', ca: '{n} mans', gl: '{n} mans', gd: '{n} làmhan',
  lt: '{n} rankų', ta: '{n} கைகள்', vi: '{n} ván', ko: '{n} 핸드',
  'zh-TW': '{n} 手', hi: '{n} हाथ'
};
const _BLINDSUPMINS_I18N = {
  ru: '{n} мин', uk: '{n} хв', bg: '{n} мин', sr: '{n} мин',
  el: '{n} λεπτά', zh: '{n} 分钟', 'zh-TW': '{n} 分鐘', ja: '{n} 分',
  ko: '{n} 분', hi: '{n} मिनट', ta: '{n} நிமிடம்'
};
for (const _c in _BLINDSUPHANDS_I18N) { if (LANG[_c]) LANG[_c].blindsUpHands = _BLINDSUPHANDS_I18N[_c]; }
for (const _c in _BLINDSUPMINS_I18N)  { if (LANG[_c]) LANG[_c].blindsUpMins  = _BLINDSUPMINS_I18N[_c]; }
function _flagFor(code) {
  return (LANG_META[code] && LANG_META[code].flag)
    || ('<span class="lang-flag lang-flag-code" style="font:700 0.72rem/1 monospace;letter-spacing:.05em">' + String(code).toUpperCase() + '</span>');
}
function _labelFor(code) {
  return (LANG_META[code] && LANG_META[code].label) || String(code).toUpperCase();
}
// Registered language codes sorted alphabetically by their native label, so
// the picker and the toggle cycle stay in alphabetical order and any future
// language slots itself in automatically (no manual ordering needed).
// localeCompare keeps Latin labels A–Z and places non-Latin scripts
// (Cyrillic, CJK) consistently after them.
function _langCodesSorted() {
  return Object.keys(LANG).sort(function (a, b) {
    return _labelFor(a).localeCompare(_labelFor(b), undefined, { sensitivity: 'base' });
  });
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
    // Region-specific catalogues whose code is a full locale, not a bare
    // primary subtag. Maps a lower-cased browser/saved locale onto the
    // catalogue code we ship.
    var regionAlias = { 'pt-br': 'pt-BR', 'pt-pt': 'pt-PT' };
    // Primary-subtag aliases: the browser reports a code that differs from
    // our catalogue code, or a macrolanguage/legacy code we fold onto one
    // variant. Bare 'pt' (and the old single 'pt' catalogue) → Brazilian,
    // the larger Portuguese-speaking audience.
    var alias = { no: 'nb', nn: 'nb', pt: 'pt-BR' };
    try {
        // 1. The user has manually picked a language before — respect it
        //    (only if that language is still available). A legacy saved
        //    code (e.g. the former single 'pt') is mapped forward.
        var saved = localStorage.getItem('pth_lang');
        if (saved) {
            if (avail.indexOf(saved) !== -1) return saved;
            var sl = saved.toLowerCase();
            if (regionAlias[sl] && avail.indexOf(regionAlias[sl]) !== -1) return regionAlias[sl];
            if (alias[saved] && avail.indexOf(alias[saved]) !== -1) return alias[saved];
        }
        // 2. First visit: match the browser locale. Try the full locale
        //    first (pt-BR vs pt-PT), then the primary subtag (fr-CA → fr,
        //    es-MX → es). This avoids the browser's "Translate this page?"
        //    banner for a speaker whose language we support.
        var full = (navigator.language || '').toLowerCase();
        if (regionAlias[full] && avail.indexOf(regionAlias[full]) !== -1) return regionAlias[full];
        var bl = full.split('-')[0];
        if (avail.indexOf(bl) !== -1) return bl;
        // 2b. A few locale codes don't match their catalogue code 1:1
        //     (Norwegian nb/nn/no → Bokmål; bare 'pt' → Brazilian).
        if (alias[bl] && avail.indexOf(alias[bl]) !== -1) return alias[bl];
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
  // Re-traduire le label + placeholder du pseudo selon le mode de connexion.
  // Ils sont posés imperativement par App.onLoginModeChange() (pas via
  // data-i18n, car la clé dépend du mode choisi), donc un changement de langue
  // les laissait figés dans la langue précédente. On ne touche QUE le label et
  // le placeholder traduisible — jamais la VALEUR du pseudo — pour ne pas
  // effacer un pseudo en cours de saisie lors d'un changement de langue.
  try {
    var _lm = document.getElementById('login-mode');
    var _nl = document.getElementById('nick-label');
    var _ni = document.getElementById('nick');
    if (_lm && _nl) {
      var _m = _lm.value;
      var _sm = document.getElementById('server-mode');
      if (window._offlineMode || (_sm && _sm.value === 'offline')) {
        // Mode entraînement : libellé « pseudo libre », JAMAIS le label de compte
        // pokerth.net — même si login-mode est resté sur 'auth' (hérité d'une
        // sélection pokerth.net précédente, ou restauré tardivement par iOS).
        _nl.textContent = t('enterNickFree');
        if (_ni && !_ni.hasAttribute('readonly')) _ni.placeholder = t('nickPlaceholder');
      } else if (_m === 'lan' || _m === 'unauth') {
        _nl.textContent = t('enterNickFree');
        if (_ni && !_ni.hasAttribute('readonly')) _ni.placeholder = t('nickPlaceholder');
      } else if (_m === 'guest') {
        _nl.textContent = t('enterNickGuest');
        // placeholder = nom GuestXXXXX stable, laissé tel quel
      } else if (_m === 'auth') {
        _nl.textContent = t('enterAccount');
        // placeholder = 'MyAccount' littéral, laissé tel quel
      }
    }
  } catch(e) {}
  // Retraduire le hint de statut de l'écran de connexion (chatAvailPrivate /
  // lanModeNote / enterCredentials selon le mode) : posé impérativement par
  // setStatus, il restait figé dans la langue précédente.
  try { if (typeof window._refreshConnectStatus === 'function') window._refreshConnectStatus(); } catch(e) {}
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
  ['lang-toggle-game-mob', 'lang-toggle-lobby-mob', 'lang-toggle-connect-mob'].forEach(function(id){
    var bMob = document.getElementById(id);
    if (bMob) bMob.innerHTML = '<span style="margin-right:5px">' + flagSvg + '</span>' + langLabel;
  });
  // Update more/less options label
  var ml = document.getElementById('cf-more-label');
  if (ml) { var cfOpen = document.getElementById('cf-more-opts'); ml.textContent = (cfOpen && cfOpen.style.display !== 'none') ? t('lessOptions') : t('moreOptions'); }
  // Re-render the lobby game list so badges/labels follow the language
  try { if (typeof window.renderGames === 'function') window.renderGames(); } catch(e) {}
  // Retraduire la pastille "N joueur(s)" du header lobby (posée par les
  // messages serveur, sans data-i18n — sinon figée dans la langue precedente).
  try { if (typeof window._refreshPlayersPill === 'function') window._refreshPlayersPill(); } catch(e) {}
  // Retraduire tout panneau/popup ouvert dont le contenu est posé en JS
  // (stats de session, liste des joueurs, détails de la partie, profil).
  try { if (typeof window._refreshOpenPanels === 'function') window._refreshOpenPanels(); } catch(e) {}
  try { if (typeof window._refreshThemePanel === 'function') window._refreshThemePanel(); } catch(e) {}
  // Retraduire en direct les messages systeme deja affiches dans le chat.
  try { if (typeof window._retranslateSysChat === 'function') window._retranslateSysChat(); } catch(e) {}
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
    var ks = _langCodesSorted();
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
    var codes = _langCodesSorted();
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

