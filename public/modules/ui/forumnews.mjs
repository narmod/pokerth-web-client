// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Forum news (parite QML 2.1.6) — bouton d'en-tete sur TOUS les ecrans
// (comme le classement), fenetre generique avec deux vues :
//   liste  → derniers posts dedoublonnes par sujet, pastille pleine =
//            non lu / anneau vide = lu, icone ↗ d'ouverture externe ;
//   post   → lecture du post ENTIER dans la fenetre (HTML nettoye par le
//            relais /api/forumfeed, images bornees a la colonne, couleurs
//            du forum adaptees au theme), traduction via le meme service
//            que le chat (globe), « Ouvrir dans le forum » en pied.
// Ouvrir la vue post = marque lu (parite QML ForumPostPage) ; l'icone ↗
// externe marque lu aussi. « Tout marquer comme lu » est desactive quand
// il n'y a rien a lire. En cas d'echec de rafraichissement, les posts
// deja affiches restent (l'erreur ne s'affiche que liste vide).
//
// Suivi lu/non-lu local + sync compte (fusion, pokerth.js _forumMergeIn) :
//   pth_forum_read_base  repere « tout marquer comme lu » (ms)
//   pth_forum_read_ids   ids lus individuellement (borne READ_IDS_MAX)
// ═══════════════════════════════════════════════════════════════════
import { esc } from './misc.mjs';

const FEED_URL = '/api/forumfeed';
const FORUM_HOME = 'https://www.pokerth.net/';
const CLIENT_TTL_MS = 5 * 60 * 1000;   // cache en page ; le relais cache 10 min
const READ_IDS_MAX = 120;              // borne partagee avec la sync compte (_FORUM_IDS_MAX, pokerth.js)
const TRANSLATE_MAX = 1800;            // texte envoye au service (parite QML)

let _cache = null;                     // { at, posts } (dedoublonnes)
let _fetching = null;                  // promesse en vol (dedup des appels)
let _curPost = null;                   // post affiche dans la vue post
let _trState = null;                   // { text, shown } traduction du post courant

// ── Aides pures (exportees pour scripts/test-forumnews.mjs) ────────────
export function fnDedup(posts) {
  const seen = new Set(); const out = [];
  for (const p of (posts || [])) {
    const key = String(p.forum || '') + '|' +
      String(p.title || '').replace(/^Re:\s*/i, '').trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key); out.push(p);
  }
  return out;
}

export function fnIsUnread(post, readIds, baseTs) {
  const ts = Date.parse(post && post.date || '') || 0;
  if (ts <= (baseTs || 0)) return false;
  return !(readIds && readIds.has(post.id));
}

export function fnUnreadCount(posts, readIds, baseTs) {
  let n = 0;
  for (const p of (posts || [])) if (fnIsUnread(p, readIds, baseTs)) n++;
  return n;
}

const FN_FORUM_COLORS = {
  'bbc': 0, 'wec': 1, 'bugs': 2, 'general': 3, 'feature requests': 4,
  'monthly cup': 5, 'newbie': 6, 'rules': 7
};
export function fnForumClass(name) {
  const k = String(name || '').trim().toLowerCase();
  if (!k) return 'fn-c7';
  if (k in FN_FORUM_COLORS) return 'fn-c' + FN_FORUM_COLORS[k];
  let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return 'fn-c' + (h % 8);
}

// Texte brut d'un post (source de traduction) — pendant de plainText() QML.
export function fnPlainText(html, limit) {
  let s = String(html || '')
    .replace(/<(?:br|\/p|\/div|\/li|hr)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
  if (limit && s.length > limit) {
    s = s.slice(0, limit);
    const sp = s.lastIndexOf(' ');
    if (sp > limit * 0.6) s = s.slice(0, sp);
    s += '\u2026';
  }
  return s;
}

// Couleur inline → lisible sur le fond courant (parite QML _readableColor) :
// trop sombre sur fond sombre (ou trop claire sur fond clair) = melangee vers
// le pole oppose, la teinte reste. Exporte pour les tests.
const FN_NAMED_COLORS = {
  black:'#000000', white:'#ffffff', red:'#ff0000', brightred:'#ff0000',
  darkred:'#8b0000', maroon:'#800000', green:'#008000', darkgreen:'#006400',
  limegreen:'#32cd32', lime:'#00ff00', olive:'#808000', blue:'#0000ff',
  darkblue:'#00008b', navy:'#000080', royalblue:'#4169e1', skyblue:'#87ceeb',
  cyan:'#00ffff', aqua:'#00ffff', teal:'#008080', magenta:'#ff00ff',
  fuchsia:'#ff00ff', purple:'#800080', violet:'#ee82ee', indigo:'#4b0082',
  orange:'#ffa500', darkorange:'#ff8c00', yellow:'#ffff00', gold:'#ffd700',
  goldenrod:'#daa520', brown:'#a52a2a', sienna:'#a0522d', silver:'#c0c0c0',
  gray:'#808080', grey:'#808080', darkgray:'#a9a9a9', darkgrey:'#a9a9a9',
  pink:'#ffc0cb', beige:'#f5f5dc', tan:'#d2b48c'
};
function _toRgb(value) {
  let s = String(value || '').trim().toLowerCase();
  if (FN_NAMED_COLORS[s] !== undefined) s = FN_NAMED_COLORS[s];
  let m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(s);
  if (m) return [parseInt(m[1]+m[1],16)/255, parseInt(m[2]+m[2],16)/255, parseInt(m[3]+m[3],16)/255];
  m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(s);
  if (m) return [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255];
  m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/.exec(s);
  if (m) return [parseInt(m[1],10)/255, parseInt(m[2],10)/255, parseInt(m[3],10)/255];
  return null;
}
export function fnReadableColor(value, dark) {
  const rgb = _toRgb(value);
  if (!rgb) return value;
  const lum = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2];
  let t = 0, target = 1;
  if (dark && lum < 0.55) { t = (0.55 - lum) / (1 - lum); target = 1; }
  else if (!dark && lum > 0.62) { t = 1 - 0.45 / Math.max(lum, 0.0001); target = 0; }
  else return value;
  t = Math.max(0, Math.min(1, t));
  let out = '#';
  for (let i = 0; i < 3; i++) {
    const c = Math.round(255 * (rgb[i] * (1 - t) + target * t));
    out += (c < 16 ? '0' : '') + c.toString(16);
  }
  return out;
}

// ── Etat lu (localStorage + sync compte) ───────────────────────────────
function _readBase() {
  try { return parseInt(localStorage.getItem('pth_forum_read_base') || '0', 10) || 0; } catch (e) { return 0; }
}
function _readIds() {
  try {
    const a = JSON.parse(localStorage.getItem('pth_forum_read_ids') || '[]');
    return new Set(Array.isArray(a) ? a : []);
  } catch (e) { return new Set(); }
}
function _saveIds(set) {
  try {
    let a = Array.from(set);
    if (a.length > READ_IDS_MAX) a = a.slice(a.length - READ_IDS_MAX);
    localStorage.setItem('pth_forum_read_ids', JSON.stringify(a));
  } catch (e) {}
  _syncMark();
}
function _syncMark() {
  try { if (typeof window._cfgSyncMark === 'function') window._cfgSyncMark('forum_read'); } catch (e) {}
}
function _markPostRead(p) {
  const ids = _readIds();
  if (ids.has(p.id)) return;
  ids.add(p.id); _saveIds(ids);
  _updateBadge();
}

// ── Recuperation du flux ───────────────────────────────────────────────
function _fetchPosts(force) {
  if (!force && _cache && (Date.now() - _cache.at) < CLIENT_TTL_MS) {
    return Promise.resolve(_cache.posts);
  }
  if (_fetching) return _fetching;
  _fetching = fetch(FEED_URL, { headers: { 'Accept': 'application/json' } })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d || !d.ok || !Array.isArray(d.posts)) throw new Error('bad_feed');
      const posts = fnDedup(d.posts);
      _cache = { at: Date.now(), posts: posts };
      return posts;
    })
    .finally(function () { _fetching = null; });
  return _fetching;
}

function _advOn() {
  try { return typeof window._advGet === 'function' ? window._advGet('forum_news', true) : true; } catch (e) { return true; }
}

function _t(key, fallback) {
  try { if (typeof window.t === 'function') { const v = window.t(key); if (v && v !== key) return v; } } catch (e) {}
  return fallback;
}

// ── Badge d'en-tete (toutes les instances .forum-unread) ───────────────
function _updateBadge(posts) {
  const list = (posts || (_cache && _cache.posts) || []);
  const n = fnUnreadCount(list, _readIds(), _readBase());
  const txt = n > 9 ? '9+' : String(n);
  document.querySelectorAll('.forum-unread').forEach(function (el) {
    el.textContent = txt;
    el.style.display = n > 0 ? '' : 'none';
  });
  // « Tout marquer comme lu » n'a de sens qu'avec du non-lu (parite QML).
  const mr = document.getElementById('fn-markread');
  if (mr) { mr.disabled = n === 0; mr.classList.toggle('fn-btn-off', n === 0); }
}

function _refreshBadge(force) {
  if (!_advOn()) return;
  _fetchPosts(force).then(function (p) { _updateBadge(p); }).catch(function () {});
}

// ── Vue liste ──────────────────────────────────────────────────────────
function _fmtDate(iso) {
  const ts = Date.parse(iso || '') || 0;
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleString(undefined, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ''; }
}

function _renderList(posts) {
  const list = document.getElementById('fn-list');
  const loading = document.getElementById('fn-loading');
  const err = document.getElementById('fn-error');
  const empty = document.getElementById('fn-empty');
  if (!list) return;
  if (loading) loading.style.display = 'none';
  if (err) err.style.display = 'none';
  if (!posts.length) { if (empty) empty.style.display = ''; list.style.display = 'none'; return; }
  if (empty) empty.style.display = 'none';
  const ids = _readIds(); const base = _readBase();
  let html = '';
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const unread = fnIsUnread(p, ids, base);
    html += '<div class="fn-row' + (unread ? ' fn-unread' : '') + '" data-idx="' + i + '" role="button" tabindex="0">'
      + (p.forum ? '<span class="fn-forum ' + fnForumClass(p.forum) + '">' + esc(p.forum) + '</span>' : '')
      + '<div class="fn-main"><div class="fn-t">' + esc(p.title) + '</div>'
      + '<div class="fn-meta">' + esc(p.author || '') + (p.author ? ' \u00b7 ' : '') + esc(_fmtDate(p.date)) + '</div></div>'
      // Icone d'ouverture externe directe (href pose en DOM : esc() n'echappe
      // pas les guillemets) + pastille pleine (non lu) / anneau vide (lu).
      + '<a class="fn-golink" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z"/></svg></a>'
      + '<span class="fn-dot' + (unread ? '' : ' fn-dot-read') + '" aria-hidden="true"></span>'
      + '</div>';
  }
  list.innerHTML = html;
  list.style.display = '';
  list.querySelectorAll('.fn-row').forEach(function (row) {
    const p = posts[parseInt(row.getAttribute('data-idx'), 10)];
    if (!p) return;
    const go = row.querySelector('.fn-golink');
    if (go) {
      go.href = p.link;
      go.title = _t('forumOpenPost', 'Open the post');
      go.setAttribute('aria-label', go.title);
      go.addEventListener('click', function (e) {
        e.stopPropagation();
        _markPostRead(p);
        row.classList.remove('fn-unread');
        const dot = row.querySelector('.fn-dot'); if (dot) dot.classList.add('fn-dot-read');
      });
    }
    // Un clic ouvre le post DANS la fenetre (parite QML ForumNewsPage).
    const open = function () { _openPostView(p); };
    row.addEventListener('click', open);
    row.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  _updateBadge(posts);
}

function _showListView() {
  _curPost = null; _trState = null;
  const post = document.getElementById('fn-post');
  const lw = document.getElementById('fn-listwrap');
  const back = document.getElementById('fn-back');
  const footL = document.getElementById('fn-foot-list');
  const footP = document.getElementById('fn-foot-post');
  if (post) post.style.display = 'none';
  if (lw) lw.style.display = '';
  if (back) back.style.display = 'none';
  if (footL) footL.style.display = '';
  if (footP) footP.style.display = 'none';
  if (_cache) _renderList(_cache.posts);
}

// ── Vue post (parite QML ForumPostPage) ────────────────────────────────
function _isDarkTheme() {
  try {
    const bg = getComputedStyle(document.body).backgroundColor;
    const rgb = _toRgb(bg);
    if (!rgb) return true;
    return (0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]) < 0.5;
  } catch (e) { return true; }
}

// Insere le HTML nettoye par le relais puis l'adapte : defense en profondeur
// (scripts/handlers retires meme si le relais l'a deja fait), liens en nouvel
// onglet, tailles % → px bornees, couleurs inline adaptees au theme.
function _renderPostBody(el, html) {
  el.innerHTML = String(html || '');
  el.querySelectorAll('script, style, iframe, object, embed, form').forEach(function (n) { n.remove(); });
  const dark = _isDarkTheme();
  const basePx = 14;
  el.querySelectorAll('*').forEach(function (n) {
    for (let i = n.attributes.length - 1; i >= 0; i--) {
      const a = n.attributes[i];
      if (/^on/i.test(a.name)) n.removeAttribute(a.name);
    }
    if (n.tagName === 'A') {
      const href = String(n.getAttribute('href') || '');
      if (/^\s*javascript:/i.test(href)) n.removeAttribute('href');
      n.target = '_blank'; n.rel = 'noopener';
    }
    if (n.style) {
      const fs = n.style.fontSize || '';
      const m = /^([0-9.]+)%$/.exec(fs);
      if (m) {
        const px = Math.round(basePx * parseFloat(m[1]) / 100);
        n.style.fontSize = Math.max(11, Math.min(30, px)) + 'px';
      }
      if (n.style.color) n.style.color = fnReadableColor(n.style.color, dark);
    }
  });
}

function _openPostView(p) {
  _curPost = p; _trState = null;
  const post = document.getElementById('fn-post');
  const lw = document.getElementById('fn-listwrap');
  const back = document.getElementById('fn-back');
  const footL = document.getElementById('fn-foot-list');
  const footP = document.getElementById('fn-foot-post');
  if (!post) return;
  if (lw) lw.style.display = 'none';
  post.style.display = '';
  if (back) back.style.display = '';
  if (footL) footL.style.display = 'none';
  if (footP) footP.style.display = '';
  const badge = document.getElementById('fnp-badge');
  if (badge) {
    badge.className = 'fn-forum ' + fnForumClass(p.forum);
    badge.textContent = p.forum || '';
    badge.style.display = p.forum ? '' : 'none';
  }
  const ti = document.getElementById('fnp-title'); if (ti) ti.textContent = p.title || '';
  const me = document.getElementById('fnp-meta');
  if (me) me.textContent = (p.author || '') + (p.author ? ' \u00b7 ' : '') + _fmtDate(p.date);
  const errEl = document.getElementById('fnp-error'); if (errEl) errEl.textContent = '';
  const body = document.getElementById('fnp-body');
  if (body) {
    body.classList.remove('fnp-translated');
    _renderPostBody(body, p.html || ('<p>' + esc(p.excerpt || '') + '</p>'));
    body.scrollTop = 0;
  }
  const tb = document.getElementById('fnp-translate');
  if (tb) {
    tb.style.display = document.body.classList.contains('chat-tr-on') ? '' : 'none';
    tb.classList.remove('tr-active');
    tb.title = _t('forumTranslate', 'Translate the post');
    tb.setAttribute('aria-label', tb.title);
  }
  // Vue ouverte = lu (parite QML : ouvrir la page marque le post lu).
  _markPostRead(p);
}

// ── Traduction du post (meme service et meme reglage que le chat) ──────
function _trTarget() {
  let l = '';
  try { l = String(window._lang || ''); } catch (e) {}
  if (!l) { try { l = localStorage.getItem('pth_lang') || ''; } catch (e) {} }
  if (!l) { try { l = document.documentElement.lang || navigator.language || 'en'; } catch (e) { l = 'en'; } }
  return String(l).split('-')[0] || 'en';
}

function forumTranslatePost() {
  const p = _curPost;
  const body = document.getElementById('fnp-body');
  const btn = document.getElementById('fnp-translate');
  const errEl = document.getElementById('fnp-error');
  if (!p || !body) return;
  // 2e tap : revenir a l'original (le HTML est re-rendu depuis le cache).
  if (body.classList.contains('fnp-translated')) {
    body.classList.remove('fnp-translated');
    _renderPostBody(body, p.html || '');
    if (btn) { btn.classList.remove('tr-active'); btn.title = _t('forumTranslate', 'Translate the post'); btn.setAttribute('aria-label', btn.title); }
    return;
  }
  const show = function (text) {
    body.classList.add('fnp-translated');
    body.textContent = text;   // texte brut, italique via CSS (parite QML)
    body.scrollTop = 0;
    if (btn) { btn.classList.add('tr-active'); btn.title = _t('forumShowOriginal', 'Show the original post'); btn.setAttribute('aria-label', btn.title); }
  };
  if (_trState && _trState.text) { show(_trState.text); return; }
  const source = fnPlainText(p.html || p.excerpt || '', TRANSLATE_MAX);
  if (!source) return;
  if (errEl) errEl.textContent = '';
  if (btn) btn.disabled = true;
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +
    encodeURIComponent(_trTarget()) + '&dt=t&q=' + encodeURIComponent(source);
  fetch(url).then(function (r) {
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  }).then(function (data) {
    let out = '';
    if (data && data[0] && data[0].length) {
      for (let i = 0; i < data[0].length; i++) {
        if (data[0][i] && typeof data[0][i][0] === 'string') out += data[0][i][0];
      }
    }
    if (!out.trim()) throw new Error('empty');
    _trState = { text: out };
    show(out);
  }).catch(function () {
    if (errEl) errEl.textContent = _t('forumTranslateFailed', 'Translation failed.');
  }).finally(function () { if (btn) btn.disabled = false; });
}

// ── Chargement de la fenetre ───────────────────────────────────────────
function _loadIntoWindow(force) {
  const loading = document.getElementById('fn-loading');
  const err = document.getElementById('fn-error');
  const empty = document.getElementById('fn-empty');
  const list = document.getElementById('fn-list');
  const hasPosts = !!(_cache && _cache.posts && _cache.posts.length);
  // Les posts deja affiches restent visibles pendant (et apres) un refresh.
  if (hasPosts) _renderList(_cache.posts);
  else {
    if (loading) loading.style.display = '';
    if (err) err.style.display = 'none';
    if (empty) empty.style.display = 'none';
    if (list) list.style.display = 'none';
  }
  _fetchPosts(force)
    .then(function (posts) { if (!_curPost) _renderList(posts); _updateBadge(posts); })
    .catch(function () {
      // Erreur seulement si on n'a rien a montrer (parite QML).
      if (_cache && _cache.posts && _cache.posts.length) return;
      if (loading) loading.style.display = 'none';
      if (err) err.style.display = '';
    });
}

// ── Ouverture / fermeture (modele de fenetre generique) ────────────────
function _winGateOk() {
  try { return !!(window._winGate && window._winGate() && typeof window._enableFloating === 'function'); } catch (e) { return false; }
}

function openForumModal() {
  const m = document.getElementById('forum-modal'); if (!m) return;
  m.style.display = 'flex';
  _showListView();
  const card = m.querySelector('.rk-card');
  if (card && _winGateOk()) {
    m.classList.add('rk-floating');
    try {
      window._enableFloating(card, {
        handle: document.getElementById('fn-title'), resizable: true,
        maxW: Math.min(760, Math.round(window.innerWidth * 0.92)),
        maxH: Math.min(680, Math.round(window.innerHeight * 0.90)),
        zoom: true, key: 'pth-fn-win', defW: 420, defH: 520,
        minW: 300, minH: 300, defLeft: 80, defTop: 80
      });
    } catch (e) {}
  }
  _loadIntoWindow(false);
}

function closeForumModal() {
  const m = document.getElementById('forum-modal'); if (!m) return;
  const card = m.querySelector('.rk-card');
  if (card && card.classList.contains('floating-win') && typeof window._disableFloating === 'function') {
    try { window._disableFloating(card); } catch (e) {}
  }
  m.classList.remove('rk-floating');
  m.style.display = 'none';
  _showListView();
}

function toggleForumModal() {
  const m = document.getElementById('forum-modal');
  if (m && m.style.display && m.style.display !== 'none') { closeForumModal(); return; }
  openForumModal();
}

function forumBackToList() { _showListView(); }

function forumMarkRead() {
  try {
    let mx = Date.now();
    const posts = (_cache && _cache.posts) || [];
    for (const p of posts) { const ts = Date.parse(p.date || '') || 0; if (ts > mx) mx = ts; }
    localStorage.setItem('pth_forum_read_base', String(mx));
    localStorage.setItem('pth_forum_read_ids', '[]');
  } catch (e) {}
  _syncMark();
  if (_cache && !_curPost) _renderList(_cache.posts);
  _updateBadge();
}

function forumOpenSite() {
  try { window.open(FORUM_HOME, '_blank', 'noopener'); } catch (e) {}
}

function forumOpenCurrent() {
  if (_curPost) { try { window.open(_curPost.link, '_blank', 'noopener'); } catch (e) {} }
}

// Rafraichissement du badge a l'entree du lobby (net/session.mjs show()).
function _forumLobbyShown() { _refreshBadge(false); }

// Rafraichissement lent de fond (parite QML : 15 min, sur tous les ecrans
// puisque le bouton est desormais visible partout).
setInterval(function () { _refreshBadge(true); }, 15 * 60 * 1000);
// Premier remplissage du badge au chargement (le bouton est visible des
// l'ecran de connexion).
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { _refreshBadge(false); });
else _refreshBadge(false);

// Descente de sync compte : etat lu modifie depuis un autre appareil.
window._forumReadSynced = function () {
  _updateBadge();
  try {
    const m = document.getElementById('forum-modal');
    if (m && m.style.display && m.style.display !== 'none' && _cache && !_curPost) _renderList(_cache.posts);
  } catch (e) {}
};
window.toggleForumModal = toggleForumModal;
window.openForumModal = openForumModal;
window.closeForumModal = closeForumModal;
window.forumMarkRead = forumMarkRead;
window.forumOpenSite = forumOpenSite;
window.forumOpenCurrent = forumOpenCurrent;
window.forumBackToList = forumBackToList;
window.forumTranslatePost = forumTranslatePost;
window._forumLobbyShown = _forumLobbyShown;
