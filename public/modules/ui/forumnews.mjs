// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Forum news (web extension) — lobby header button + generic window.
//
// Data path: phpBB Atom feed (www.pokerth.net/app.php/feed) relayed by
// proxy.js as same-origin JSON (/api/forumfeed, 10-min server cache) to
// avoid CORS and spare the forum. The window reuses the generic ranking
// card model (rk-backdrop / rk-card, palette tokens, floating window on
// desktop) so it looks and behaves like every other window.
//
// Read tracking (local only, never sent anywhere):
//   pth_forum_read_base  ms timestamp — "mark all as read" watermark
//   pth_forum_read_ids   JSON array of post links read individually
// The header badge shows the number of unread posts (deduped by topic:
// the feed is dominated by automated BBC/WEC result posts, so only the
// latest post per topic is listed/counted).
//
// Everything is additive; the button is hidden by the advanced option
// forum_news (body.adv-no-forumnews, ON by default) and only shown on
// the lobby screen (net/session.mjs show()).
// ═══════════════════════════════════════════════════════════════════
import { esc } from './misc.mjs';

const FEED_URL = '/api/forumfeed';
const FORUM_HOME = 'https://www.pokerth.net/';
const CLIENT_TTL_MS = 5 * 60 * 1000;   // in-page cache; the proxy caches 10 min
const READ_IDS_MAX = 120;              // borne partagee avec la sync compte (_FORUM_IDS_MAX, pokerth.js)

let _cache = null;                     // { at, posts } (deduped)
let _fetching = null;                  // in-flight promise (dedup concurrent calls)

// ── Pure helpers (exported for scripts/test-forumnews.mjs) ─────────────

// Latest post per topic. Key = forum + topic title without the "Re: "
// prefix; the feed is newest-first so the first hit wins.
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

// Stable colour class for a forum badge. The big pokerth.net forums get a
// fixed hue (BBC amber, WEC teal, Bugs red, General blue, Feature Requests
// purple); any other/new forum falls back to a deterministic hash over 8
// hues so every forum keeps the same colour across sessions without a
// maintained list. Classes: .fn-c0 … .fn-c7 (pokerth.css).
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

// ── Read state (localStorage) ──────────────────────────────────────────
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
// Etat lu → sync liee au compte (no-op pour les invites : le canal /prefs-web
// n'existe qu'avec un login authentifie ; no-op aussi si la sync est coupee).
function _syncMark() {
  try { if (typeof window._cfgSyncMark === 'function') window._cfgSyncMark('forum_read'); } catch (e) {}
}

// ── Feed fetch (client side, deduped + cached) ─────────────────────────
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

// ── Header badge ───────────────────────────────────────────────────────
function _updateBadge(posts) {
  const el = document.getElementById('forum-unread');
  if (!el) return;
  const n = fnUnreadCount(posts || (_cache && _cache.posts) || [], _readIds(), _readBase());
  el.textContent = n > 9 ? '9+' : String(n);
  el.style.display = n > 0 ? '' : 'none';
}

function _refreshBadge(force) {
  if (!_advOn()) return;
  _fetchPosts(force).then(_updateBadge).catch(function () {});
}

// ── Window rendering ───────────────────────────────────────────────────
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
    html += '<div class="fn-row' + (unread ? ' fn-unread' : '') + '" data-idx="' + i + '" role="button" tabindex="0" aria-expanded="false">'
      + (p.forum ? '<span class="fn-forum ' + fnForumClass(p.forum) + '">' + esc(p.forum) + '</span>' : '')
      + '<div class="fn-main"><div class="fn-t">' + esc(p.title) + '</div>'
      + '<div class="fn-meta">' + esc(p.author || '') + (p.author ? ' \u00b7 ' : '') + esc(_fmtDate(p.date)) + '</div>'
      + '<div class="fn-excerpt" style="display:none"></div></div>'
      + (unread ? '<span class="fn-dot" aria-hidden="true"></span>' : '')
      + '</div>';
  }
  list.innerHTML = html;
  list.style.display = '';
  // Un clic DEPLIE l'apercu (debut du message, texte brut fourni par le
  // relais) et marque le post comme lu ; le lien « Ouvrir le message » dans
  // l'apercu ouvre le sujet complet du forum dans un nouvel onglet.
  list.querySelectorAll('.fn-row').forEach(function (row) {
    const toggle = function () {
      const p = posts[parseInt(row.getAttribute('data-idx'), 10)];
      if (!p) return;
      const ex = row.querySelector('.fn-excerpt');
      const on = ex && ex.style.display === 'none';
      if (ex && on && !ex.childNodes.length) {
        if (p.excerpt) {
          const sp = document.createElement('span');
          sp.textContent = p.excerpt;
          ex.appendChild(sp);
          ex.appendChild(document.createTextNode(' '));
        }
        const a = document.createElement('a');
        a.className = 'fn-openlink';
        a.href = p.link; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = (typeof window.t === 'function' ? window.t('forumOpenPost') : 'Open the post') + ' \u2197';
        // Lu UNIQUEMENT quand le sujet est reellement ouvert sur le forum
        // (demande narmod 2026-08-09) — deplier l'apercu ne suffit pas.
        a.addEventListener('click', function (e) {
          e.stopPropagation();
          const ids2 = _readIds(); ids2.add(p.id); _saveIds(ids2);
          row.classList.remove('fn-unread');
          const dot = row.querySelector('.fn-dot'); if (dot) dot.remove();
          _updateBadge();
        });
        ex.appendChild(a);
      }
      if (ex) ex.style.display = on ? '' : 'none';
      row.classList.toggle('fn-open', on);
      row.setAttribute('aria-expanded', on ? 'true' : 'false');
    };
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
}

function _loadIntoWindow(force) {
  const loading = document.getElementById('fn-loading');
  const err = document.getElementById('fn-error');
  const empty = document.getElementById('fn-empty');
  const list = document.getElementById('fn-list');
  if (loading) loading.style.display = '';
  if (err) err.style.display = 'none';
  if (empty) empty.style.display = 'none';
  if (list) list.style.display = 'none';
  _fetchPosts(force)
    .then(function (posts) { _renderList(posts); _updateBadge(posts); })
    .catch(function () {
      if (loading) loading.style.display = 'none';
      if (err) err.style.display = '';
    });
}

// ── Open / close / toggle (generic window model, floating on desktop) ──
function _winGateOk() {
  try { return !!(window._winGate && window._winGate() && typeof window._enableFloating === 'function'); } catch (e) { return false; }
}

function openForumModal() {
  const m = document.getElementById('forum-modal'); if (!m) return;
  m.style.display = 'flex';
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
}

function toggleForumModal() {
  const m = document.getElementById('forum-modal');
  if (m && m.style.display && m.style.display !== 'none') { closeForumModal(); return; }
  openForumModal();
}

function forumMarkRead() {
  try {
    let mx = Date.now();
    const posts = (_cache && _cache.posts) || [];
    for (const p of posts) { const ts = Date.parse(p.date || '') || 0; if (ts > mx) mx = ts; }
    localStorage.setItem('pth_forum_read_base', String(mx));
    localStorage.setItem('pth_forum_read_ids', '[]');
  } catch (e) {}
  _syncMark();
  if (_cache) _renderList(_cache.posts);
  _updateBadge();
}

function forumOpenSite() {
  try { window.open(FORUM_HOME, '_blank', 'noopener'); } catch (e) {}
}

// Called by net/session.mjs show() whenever the lobby screen appears:
// refresh the unread badge (cheap — proxy caches 10 min).
function _forumLobbyShown() { _refreshBadge(false); }

// Slow background refresh so the badge follows new posts during a long
// lobby session. Gated: option on + lobby screen active.
setInterval(function () {
  try {
    const sl = document.getElementById('s-lobby');
    if (sl && sl.classList.contains('active')) _refreshBadge(true);
  } catch (e) {}
}, 10 * 60 * 1000);

// Descente de sync compte : l'etat lu vient de changer depuis un autre
// appareil — rafraichir badge + liste ouverte (pokerth.js _forumMergeIn).
window._forumReadSynced = function () {
  _updateBadge();
  try {
    const m = document.getElementById('forum-modal');
    if (m && m.style.display && m.style.display !== 'none' && _cache) _renderList(_cache.posts);
  } catch (e) {}
};
window.toggleForumModal = toggleForumModal;
window.openForumModal = openForumModal;
window.closeForumModal = closeForumModal;
window.forumMarkRead = forumMarkRead;
window.forumOpenSite = forumOpenSite;
window._forumLobbyShown = _forumLobbyShown;
