// ── help/index.mjs — In-app help window (jalon 1 : coque) ───────────────────
//
// Fenêtre d'aide consultable depuis l'entrée « Aide » des menus overflow des
// 5 headers (connect / lobby / create / game / privacy). Même patron de
// fenêtre que les Options avancées : carte km-card + classes adv-* (layout,
// nav, panels), fenêtre flottante déplaçable/redimensionnable sur ≥600 px via
// window._enableFloating (clé pth_win_help), modale plein écran sur mobile.
// Escape/Back : enregistrée dans keynav (SURFACES) + back-guard via keynav.
//
// Contenu : modules/help/content/<lang>.mjs, chargé paresseusement à
// l'ouverture, repli anglais (même philosophie que t()). Jalon 1 : anglais
// seul (ch. 1, 2, 3, 9 rédigés ; 4–8 en attente → helpWip).
//
// Ouverture contextuelle : l'écran actif (.screen.active) choisit le
// chapitre (connect→start, lobby/create→lobby, game→game). Un chapitre
// consulté pendant la session est mémorisé (retour au même endroit).
//
// Recherche : filtre plat sur titres + corps du contenu chargé (insensible
// casse/diacritiques) ; clic sur un résultat → chapitre + scroll + highlight.
//
// Option : « Aide » masquable via Options avancées → Assistance
// (pth_help_btn, body.adv-no-helpbtn masque .help-menu-btn).
import { t, onLangChange } from '../i18n.mjs';

var _content = null;        // { chapters: [...] } de la langue courante (ou en)
var _contentLang = '';      // langue effectivement chargée
var _chapter = '';          // chapitre affiché
var _openedOnce = false;

function $(id) { return document.getElementById(id); }

function _esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Diacritiques-insensible pour la recherche (é→e, ß laissé tel quel…).
function _fold(s) {
  try { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  catch (e) { return String(s).toLowerCase(); }
}

// ── Chargement du contenu (langue courante → repli anglais) ──
function _lang() {
  try { return (localStorage.getItem('pth_lang') || 'en').toLowerCase(); } catch (e) { return 'en'; }
}
function _loadContent() {
  var lg = _lang();
  if (_content && _contentLang === lg) return Promise.resolve(_content);
  var attempt = function (l) { return import('./content/' + l + '.mjs'); };
  return attempt(lg)
    .catch(function () { return attempt(lg.split('-')[0]); })
    .catch(function () { return attempt('en'); })
    .then(function (m) { _content = m.help; _contentLang = lg; return _content; })
    .catch(function () { _content = { chapters: [] }; _contentLang = lg; return _content; });
}

// ── Chapitre contextuel selon l'écran actif ──
function _contextChapter() {
  var scr = document.querySelector('.screen.active');
  var id = scr ? scr.id : '';
  if (id === 's-game') return 'game';
  if (id === 's-lobby' || id === 's-create') return 'lobby';
  return 'start';
}

// ── Rendu ──
function _renderNav() {
  var nav = $('help-nav');
  if (!nav || !_content) return;
  var h = '';
  for (var i = 0; i < _content.chapters.length; i++) {
    var c = _content.chapters[i];
    var on = c.id === _chapter;
    h += '<button type="button" class="adv-cat' + (on ? ' is-active' : '') + '" data-ch="' + _esc(c.id) + '"'
      + ' role="tab" aria-selected="' + (on ? 'true' : 'false') + '"'
      + ' onclick="window._helpShowChapter(\'' + _esc(c.id) + '\')">'
      + '<span class="adv-cat-ic help-cat-ic" aria-hidden="true">' + (c.icon || '?') + '</span>'
      + '<span class="adv-cat-lbl">' + _esc(c.title) + '</span></button>';
  }
  nav.innerHTML = h;
}

function _renderSection(s) {
  var h = '<section class="help-sec" id="help-sec-' + _esc(s.id) + '">';
  h += '<h3 class="help-sec-t">' + _esc(s.t) + '</h3>';
  var body = s.b || [];
  for (var i = 0; i < body.length; i++) h += '<p class="help-p">' + _esc(body[i]) + '</p>';
  if (s.list) {
    h += '<ul class="help-ul">';
    for (var j = 0; j < s.list.length; j++) h += '<li>' + _esc(s.list[j]) + '</li>';
    h += '</ul>';
  }
  if (s.keys) {
    h += '<div class="help-keys">';
    for (var k = 0; k < s.keys.length; k++) {
      h += '<div class="help-keyrow"><code class="help-kbd">' + _esc(s.keys[k][0]) + '</code>'
        + '<span>' + _esc(s.keys[k][1]) + '</span></div>';
    }
    h += '</div>';
  }
  // Notes plateforme/navigateur : bloc distinct (bord + icone), traduit avec
  // le contenu. `note` accepte une chaine ou un tableau de chaines.
  if (s.note) {
    var notes = Array.isArray(s.note) ? s.note : [s.note];
    for (var m = 0; m < notes.length; m++) {
      h += '<p class="help-note"><span class="help-note-ic" aria-hidden="true">\u26a0</span>' + _esc(notes[m]) + '</p>';
    }
  }
  h += '</section>';
  return h;
}

function _renderChapter() {
  var body = $('help-body');
  if (!body || !_content) return;
  var c = null;
  for (var i = 0; i < _content.chapters.length; i++) {
    if (_content.chapters[i].id === _chapter) { c = _content.chapters[i]; break; }
  }
  if (!c) { body.innerHTML = ''; return; }
  var h = '<h2 class="help-ch-t">' + (c.icon ? '<span class="help-ch-ic" aria-hidden="true">' + c.icon + '</span>' : '') + _esc(c.title) + '</h2>';
  var secs = c.sections || [];
  if (!secs.length) h += '<p class="help-p help-wip">' + _esc(t('helpWip')) + '</p>';
  for (var j = 0; j < secs.length; j++) h += _renderSection(secs[j]);
  body.innerHTML = h;
  body.scrollTop = 0;
}

function _helpShowChapter(id, secId) {
  _chapter = id;
  try { sessionStorage.setItem('pth_help_ch', id); } catch (e) {}
  var inp = $('help-search-in');
  if (inp && inp.value) { inp.value = ''; }
  var res = $('help-results'); if (res) res.style.display = 'none';
  var body = $('help-body'); if (body) body.style.display = '';
  _renderNav();
  _renderChapter();
  if (secId) {
    var el = $('help-sec-' + secId);
    if (el) {
      try { el.scrollIntoView({ block: 'start' }); } catch (e) { el.scrollIntoView(); }
      el.classList.add('help-hit');
      setTimeout(function () { el.classList.remove('help-hit'); }, 1600);
    }
  }
}
window._helpShowChapter = _helpShowChapter;

// ── Recherche ──
function _helpSearch() {
  var inp = $('help-search-in');
  var res = $('help-results');
  var body = $('help-body');
  if (!inp || !res || !body || !_content) return;
  var q = _fold(inp.value.trim());
  if (q.length < 2) { res.style.display = 'none'; body.style.display = ''; return; }
  var hits = [];
  for (var i = 0; i < _content.chapters.length; i++) {
    var c = _content.chapters[i];
    var secs = c.sections || [];
    for (var j = 0; j < secs.length; j++) {
      var s = secs[j];
      var hay = _fold(s.t) + ' ' + _fold((s.b || []).join(' ')) + ' '
        + _fold((s.list || []).join(' ')) + ' '
        + _fold((s.keys || []).map(function (r) { return r.join(' '); }).join(' ')) + ' '
        + _fold(Array.isArray(s.note) ? s.note.join(' ') : (s.note || ''));
      if (hay.indexOf(q) >= 0) hits.push({ ch: c, sec: s });
      if (hits.length >= 40) break;
    }
  }
  var h = '';
  for (var k = 0; k < hits.length; k++) {
    var it = hits[k];
    h += '<button type="button" class="help-result" onclick="window._helpShowChapter(\'' + _esc(it.ch.id) + '\',\'' + _esc(it.sec.id) + '\')">'
      + '<span class="help-result-ch">' + (it.ch.icon || '') + ' ' + _esc(it.ch.title) + '</span>'
      + '<span class="help-result-t">' + _esc(it.sec.t) + '</span></button>';
  }
  if (!h) h = '<p class="help-p help-wip">' + _esc(t('helpNoResults')) + '</p>';
  res.innerHTML = h;
  res.style.display = '';
  body.style.display = 'none';
}
window._helpSearch = _helpSearch;

// ── Fenêtre flottante (même patron que _advSetupFloat) ──
function _helpSetupFloat() {
  var card = document.querySelector('#help-modal .help-card');
  if (!card) return;
  var wide = false;
  try { wide = window.matchMedia('(min-width:600px)').matches; } catch (e) {}
  if (!wide) { try { window._disableFloating(card); } catch (e) {} return; }
  if (typeof window._enableFloating !== 'function') return;
  var maxW = Math.min(1010, Math.round(window.innerWidth * 0.92));
  var maxH = Math.min(680, Math.round(window.innerHeight * 0.90));
  var openW = Math.max(380, Math.min(maxW, window.innerWidth - 16));
  var openH = Math.max(360, Math.min(maxH, window.innerHeight - 16));
  window._enableFloating(card, {
    key: 'pth_win_help',
    handle: card.querySelector('.km-title'),
    resizable: true,
    maxW: maxW, maxH: maxH,
    zoom: true,
    defW: 620, defH: 640,
    openW: openW, openH: openH,
    minW: 380, minH: 360,
    defLeft: Math.max(8, Math.round((window.innerWidth - openW) / 2)),
    defTop: Math.max(8, Math.round((window.innerHeight - openH) / 2)),
  });
}

// ── Ouverture / fermeture ──
function openHelp() {
  var m = $('help-modal');
  if (!m) return;
  _loadContent().then(function () {
    if (!_chapter) {
      var saved = '';
      try { saved = sessionStorage.getItem('pth_help_ch') || ''; } catch (e) {}
      _chapter = saved || _contextChapter();
    }
    if (!_openedOnce) { _chapter = _contextChapter(); _openedOnce = true; }
    // Chapitre inconnu (contenu changé) → premier chapitre.
    var ok = _content.chapters.some(function (c) { return c.id === _chapter; });
    if (!ok && _content.chapters.length) _chapter = _content.chapters[0].id;
    var ttl = $('help-title-txt'); if (ttl) ttl.textContent = t('helpTitle');
    var inp = $('help-search-in');
    if (inp) { inp.placeholder = t('helpSearchPh'); inp.value = ''; }
    var res = $('help-results'); if (res) res.style.display = 'none';
    var body = $('help-body'); if (body) body.style.display = '';
    _renderNav();
    _renderChapter();
    m.style.display = 'flex';
    _helpSetupFloat();
    try { if (window._syncWinBtns) window._syncWinBtns(); } catch (e) {}
  });
}
function closeHelp() {
  var m = $('help-modal');
  if (m) m.style.display = 'none';
  try { if (window._syncWinBtns) window._syncWinBtns(); } catch (e) {}
}
function toggleHelp() {
  var m = $('help-modal');
  if (m && m.style.display && m.style.display !== 'none') { closeHelp(); return; }
  openHelp();
}
window.openHelp = openHelp;
window.closeHelp = closeHelp;
window.toggleHelp = toggleHelp;

// ── Changement de langue à chaud ──
// Le titre et le placeholder suivent déjà setLang (data-i18n*), mais la nav
// et le corps viennent de content/<lang>.mjs : sans ça, ils restaient figés
// dans la langue précédente jusqu'à fermeture/réouverture de la fenêtre.
// Fenêtre fermée → rien à faire : _loadContent() voit que _contentLang ne
// correspond plus et recharge à la prochaine ouverture.
onLangChange(function () {
  var m = $('help-modal');
  if (!m || !m.style.display || m.style.display === 'none') return;
  _loadContent().then(function () {
    // Les id de chapitre sont stables d'une langue à l'autre (isomorphie du
    // corpus) ; on garde donc l'endroit où l'utilisateur se trouvait.
    var ok = _content.chapters.some(function (c) { return c.id === _chapter; });
    if (!ok && _content.chapters.length) _chapter = _content.chapters[0].id;
    _renderNav();
    var res = $('help-results');
    var searching = res && res.style.display !== 'none';
    // Recherche en cours : on ne touche pas à la saisie de l'utilisateur, on
    // relance juste le filtre sur le corpus fraîchement chargé.
    if (searching) { _helpSearch(); return; }
    // Le rendu du chapitre remet le scroll en haut ; on le restaure pour ne
    // pas éjecter l'utilisateur du paragraphe qu'il était en train de lire.
    var body = $('help-body');
    var top = body ? body.scrollTop : 0;
    _renderChapter();
    if (body) body.scrollTop = top;
  });
});

// Redimensionnement : bascule flottant/modal comme les Options avancées.
window.addEventListener('resize', function () {
  var m = $('help-modal');
  if (m && m.style.display && m.style.display !== 'none') _helpSetupFloat();
});
