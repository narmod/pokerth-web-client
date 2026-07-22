// ═══════════════════════════════════════════════════════════════════
// Sondages produit (encart lobby) — extension web, sans equivalent QML.
// L'admin redige un sondage (panneau admin, onglet Polls) ; seuls les clients
// ayant coche « Participer aux sondages produit » (options avancees →
// Communaute, DECOCHEE par defaut) le voient, juste au-dessus de la
// LobbyStatsBar.
//
// Une reponse par appareil, dedupliquee cote proxy sur un hachage sale du meme
// `pth_vid` anonyme que le beacon /__visit. Les compteurs n'arrivent qu'AVEC la
// reponse au vote : tant que l'utilisateur n'a pas repondu, aucun chiffre
// affiche ne peut l'influencer.
//
// Ponts avec le monolithe :
//   window._pollSetConfig(p) — /app-config a repondu (p = c.poll, ou null)
//   window._pollOnScreen(id) — show() a bascule d'ecran (net/session.mjs)
//   window._pollRefresh()    — la case des options avancees a change
// ═══════════════════════════════════════════════════════════════════
import { t, getLang } from '../i18n.mjs';

const CARD_ID = 'lobby-poll-card';
const DONE_KEY = 'pth_poll_done';   // ids deja repondus (CSV, plafonne)
const DONE_MAX = 20;

let _poll = null;               // sondage actif publie par /app-config
const _hiddenThisSession = {};  // ferme SANS repondre : revient a la session suivante

// L'opt-in est une option avancee normale (setAdvOpt('polls', …) ecrit ici).
// Absente = desactivee : personne ne voit un sondage sans l'avoir demande.
function _optOn() { try { return localStorage.getItem('pth_polls') === '1'; } catch (e) { return false; } }

function _doneList() {
  try { return (localStorage.getItem(DONE_KEY) || '').split(',').filter(Boolean); } catch (e) { return []; }
}
function _isDone(id) { return _doneList().indexOf(id) >= 0; }
// On ne garde que les derniers ids : la liste ne doit pas grossir indefiniment
// au fil des sondages successifs.
function _markDone(id) {
  const l = _doneList().filter(function (x) { return x !== id; });
  l.push(id);
  try { localStorage.setItem(DONE_KEY, l.slice(-DONE_MAX).join(',')); } catch (e) {}
}

// Meme identifiant anonyme que le beacon /__visit (jamais l'IP) ; le proxy n'en
// conserve qu'un SHA-256 sale par sondage.
function _vid() {
  let v = '';
  try { v = localStorage.getItem('pth_vid') || ''; } catch (e) {}
  if (!v) {
    v = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
      : (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
    try { localStorage.setItem('pth_vid', v); } catch (e) {}
  }
  return v;
}

// Meme cascade de repli que t() : langue active → racine ('pt-br' → 'pt') →
// anglais → premiere langue redigee. L'admin n'ecrit pas les 36 langues.
function _pick(map) {
  if (!map) return '';
  let l = 'en';
  try { l = getLang() || 'en'; } catch (e) {}
  if (map[l]) return map[l];
  const base = String(l).split('-')[0];
  if (map[base]) return map[base];
  if (map.en) return map.en;
  const k = Object.keys(map);
  return k.length ? map[k[0]] : '';
}

function _lobbyActive() {
  const s = document.getElementById('s-lobby');
  return !!(s && s.classList.contains('active'));
}
function _remove() { const el = document.getElementById(CARD_ID); if (el) el.remove(); }

// Coque commune aux deux etats (question puis resultats) : le titre et la croix
// ne changent pas, seul le corps est remplace.
function _shell(titleText) {
  const card = document.createElement('div');
  card.id = CARD_ID;
  card.className = 'lobby-poll';

  const head = document.createElement('div');
  head.className = 'lobby-poll-head';
  const ttl = document.createElement('span');
  ttl.className = 'lobby-poll-title';
  ttl.textContent = titleText;
  head.appendChild(ttl);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'lobby-poll-x';
  close.textContent = '\u2715';
  close.setAttribute('aria-label', t('closeTooltip') || 'Close');
  close.title = t('closeTooltip') || 'Close';
  // Fermer SANS repondre ne vaut pas reponse : on masque pour cette session
  // seulement, le sondage revient au prochain chargement. Repondre, en
  // revanche, est definitif (_markDone).
  close.addEventListener('click', function () {
    if (_poll) _hiddenThisSession[_poll.id] = true;
    _remove();
  });
  head.appendChild(close);

  card.appendChild(head);
  const body = document.createElement('div');
  body.className = 'lobby-poll-body';
  card.appendChild(body);
  return { card: card, body: body };
}

function _question(body) {
  const q = document.createElement('div');
  q.className = 'lobby-poll-q';
  q.textContent = _pick(_poll.question);
  body.appendChild(q);
}

// Etat 1 : la question et ses options, aucun chiffre.
function _renderVote() {
  const sh = _shell(t('pollTitle') || 'Poll');
  _question(sh.body);

  const list = document.createElement('div');
  list.className = 'lobby-poll-opts';
  const btns = [];
  (_poll.options || []).forEach(function (o) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lobby-poll-opt';
    b.textContent = _pick(o.label);
    b.addEventListener('click', function () { _vote(o.id, btns); });
    btns.push(b);
    list.appendChild(b);
  });
  sh.body.appendChild(list);

  const err = document.createElement('div');
  err.className = 'lobby-poll-err';
  err.id = 'lobby-poll-err';
  sh.body.appendChild(err);
  return sh.card;
}

// Etat 2 : les resultats, affiches une seule fois juste apres la reponse.
// L'encart ne reviendra plus pour ce sondage (cf. _markDone).
function _renderResults(d) {
  _remove();
  const sh = _shell(t('results') || 'Results');
  _question(sh.body);

  const total = Math.max(0, d.total || 0);
  const list = document.createElement('div');
  list.className = 'lobby-poll-res';
  (_poll.options || []).forEach(function (o) {
    const c = (d.tally && d.tally[o.id]) || 0;
    const pct = total ? Math.round(c * 100 / total) : 0;
    const row = document.createElement('div');
    row.className = 'lobby-poll-row' + (o.id === d.choice ? ' is-mine' : '');

    const lb = document.createElement('span');
    lb.className = 'lobby-poll-lb';
    lb.textContent = _pick(o.label);
    row.appendChild(lb);

    const track = document.createElement('span');
    track.className = 'lobby-poll-track';
    const fill = document.createElement('i');
    fill.style.width = pct + '%';
    track.appendChild(fill);
    row.appendChild(track);

    const num = document.createElement('span');
    num.className = 'lobby-poll-pct';
    num.textContent = pct + '%';
    row.appendChild(num);

    list.appendChild(row);
  });
  sh.body.appendChild(list);

  const foot = document.createElement('div');
  foot.className = 'lobby-poll-foot';
  foot.textContent = (t('pollThanks') || '') + ' \u00b7 ' +
                     (t('pollAnswers') || '{n}').replace('{n}', String(total));
  sh.body.appendChild(foot);

  const bar = document.getElementById('lobby-statsbar');
  if (bar && bar.parentNode) bar.parentNode.insertBefore(sh.card, bar);
}

function _fail() {
  const e = document.getElementById('lobby-poll-err');
  if (e) e.textContent = t('pollErr') || 'Could not send your answer.';
}

function _vote(optId, btns) {
  if (!_poll) return;
  btns.forEach(function (b) { b.disabled = true; });
  fetch('/__poll-vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: _poll.id, choice: optId, vid: _vid() })
  })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && d.ok) { _markDone(_poll.id); _renderResults(d); return; }
      // L'admin a change de sondage depuis le chargement de la page : celui-ci
      // n'existe plus, inutile d'insister — le suivant arrivera au prochain
      // /app-config.
      if (d && d.error === 'stale poll') { _remove(); return; }
      _fail();
      btns.forEach(function (b) { b.disabled = false; });
    })
    .catch(function () {
      _fail();
      btns.forEach(function (b) { b.disabled = false; });
    });
}

function _render() {
  _remove();
  if (!_poll || !_poll.id || !(_poll.options || []).length) return;
  if (!_optOn() || !_lobbyActive()) return;
  if (_isDone(_poll.id) || _hiddenThisSession[_poll.id]) return;
  const bar = document.getElementById('lobby-statsbar');
  if (!bar || !bar.parentNode) return;
  bar.parentNode.insertBefore(_renderVote(), bar);
}

// ── Ponts ──────────────────────────────────────────────────────────
window._pollSetConfig = function (p) {
  _poll = (p && p.id && Array.isArray(p.options) && p.options.length >= 2) ? p : null;
  _render();
};
window._pollOnScreen = function (id) { if (id === 's-lobby') _render(); else _remove(); };
window._pollRefresh = function () { _render(); };
