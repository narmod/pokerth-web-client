// ═══════════════════════════════════════════════════════════════════
// Sondages produit (modale lobby) — extension web, sans equivalent QML.
// L'admin redige un sondage (panneau admin, onglet Polls) ; il s'affiche en
// modale a l'arrivee dans le lobby, dans le meme moule que la modale de
// bienvenue (fond assombri, carte centree, tokens de theme).
//
// Une reponse par appareil, dedupliquee cote proxy sur un hachage sale du meme
// `pth_vid` anonyme que le beacon /__visit. Les compteurs n'arrivent qu'AVEC la
// reponse au vote : tant que l'utilisateur n'a pas repondu, aucun chiffre
// affiche ne peut l'influencer.
//
// Desactivable dans les options avancees → Communaute (cochee par defaut).
//
// Ponts avec le monolithe :
//   window._pollSetConfig(p)  — /app-config a repondu (p = c.poll, ou null)
//   window._pollOnScreen(id)  — show() a bascule d'ecran (net/session.mjs)
//   window._pollRefresh()     — la case des options avancees a change
//   window.closePollModal()   — fermeture (croix, et Escape via ui/keynav.mjs)
// ═══════════════════════════════════════════════════════════════════
import { t, getLang } from '../i18n.mjs';

const MODAL_ID = 'poll-modal';
const DONE_KEY = 'pth_poll_done';   // ids deja vus (repondus ou fermes), CSV plafonne
const DONE_MAX = 20;

let _poll = null;       // sondage actif publie par /app-config
let _waitTimer = null;  // attente de la fermeture de la modale de bienvenue

// Option avancee normale (setAdvOpt('polls', …) ecrit ici). Miroir exact de
// _advGet(key, defOn) cote monolithe : cle absente = valeur par defaut, sinon
// '1'/'0'. Defaut ACTIF ; afficher ne transmet rien, le vid ne part qu'au clic.
function _optOn() {
  try {
    const v = localStorage.getItem('pth_polls');
    if (v === null) return true;
    return v === '1';
  } catch (e) { return true; }
}

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
function _open() { return document.getElementById(MODAL_ID); }
function _close() {
  const el = _open();
  if (el) el.remove();
  if (_waitTimer) { clearTimeout(_waitTimer); _waitTimer = null; }
}

// Coque commune aux deux etats (question puis resultats) : fond assombri, carte
// centree, entete + croix. Calquee sur showWelcomeModal du monolithe.
function _shell(titleText) {
  _close();
  const back = document.createElement('div');
  back.id = MODAL_ID;
  back.className = 'poll-back';

  const card = document.createElement('div');
  card.className = 'poll-card';

  const head = document.createElement('div');
  head.className = 'poll-head';
  const ttl = document.createElement('span');
  ttl.className = 'poll-title';
  ttl.textContent = titleText;
  head.appendChild(ttl);

  const x = document.createElement('button');
  x.type = 'button';
  x.className = 'poll-x';
  x.textContent = '\u2715';
  x.setAttribute('aria-label', t('closeTooltip') || 'Close');
  x.title = t('closeTooltip') || 'Close';
  // Une modale ne se rate pas : si elle est fermee, c'est un choix. On ne la
  // represente donc plus pour ce sondage, repondu ou non.
  x.addEventListener('click', function () { if (_poll) _markDone(_poll.id); _close(); });
  head.appendChild(x);
  card.appendChild(head);

  const body = document.createElement('div');
  body.className = 'poll-body';
  card.appendChild(body);
  back.appendChild(card);
  return { back: back, body: body };
}

function _question(body) {
  const q = document.createElement('div');
  q.className = 'poll-q';
  q.textContent = _pick(_poll.question);
  body.appendChild(q);
}

// Etat 1 : la question et ses options, aucun chiffre.
function _renderVote() {
  const sh = _shell(t('pollTitle') || 'Poll');
  _question(sh.body);

  const list = document.createElement('div');
  list.className = 'poll-opts';
  const btns = [];
  (_poll.options || []).forEach(function (o) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'poll-opt';
    b.textContent = _pick(o.label);
    b.addEventListener('click', function () { _vote(o.id, btns); });
    btns.push(b);
    list.appendChild(b);
  });
  sh.body.appendChild(list);

  const err = document.createElement('div');
  err.className = 'poll-err';
  err.id = 'poll-err';
  sh.body.appendChild(err);
  document.body.appendChild(sh.back);
}

// Etat 2 : les resultats, affiches une seule fois juste apres la reponse.
// La modale ne reviendra plus pour ce sondage (cf. _markDone).
function _renderResults(d) {
  const sh = _shell(t('results') || 'Results');
  _question(sh.body);

  const total = Math.max(0, d.total || 0);
  const list = document.createElement('div');
  list.className = 'poll-res';
  (_poll.options || []).forEach(function (o) {
    const c = (d.tally && d.tally[o.id]) || 0;
    const pct = total ? Math.round(c * 100 / total) : 0;
    const row = document.createElement('div');
    row.className = 'poll-row' + (o.id === d.choice ? ' is-mine' : '');

    const lb = document.createElement('span');
    lb.className = 'poll-lb';
    lb.textContent = _pick(o.label);
    row.appendChild(lb);

    const track = document.createElement('span');
    track.className = 'poll-track';
    const fill = document.createElement('i');
    fill.style.width = pct + '%';
    track.appendChild(fill);
    row.appendChild(track);

    const num = document.createElement('span');
    num.className = 'poll-pct';
    num.textContent = pct + '%';
    row.appendChild(num);

    list.appendChild(row);
  });
  sh.body.appendChild(list);

  const foot = document.createElement('div');
  foot.className = 'poll-foot';
  foot.textContent = (t('pollThanks') || '') + ' \u00b7 ' +
                     (t('pollAnswers') || '{n}').replace('{n}', String(total));
  sh.body.appendChild(foot);

  document.body.appendChild(sh.back);
}

function _fail() {
  const e = document.getElementById('poll-err');
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
      // n'existe plus, inutile d'insister.
      if (d && d.error === 'stale poll') { _close(); return; }
      _fail();
      btns.forEach(function (b) { b.disabled = false; });
    })
    .catch(function () {
      _fail();
      btns.forEach(function (b) { b.disabled = false; });
    });
}

function _render() {
  if (_waitTimer) { clearTimeout(_waitTimer); _waitTimer = null; }
  if (!_poll || !_poll.id || !(_poll.options || []).length) { _close(); return; }
  if (!_optOn() || !_lobbyActive() || _isDone(_poll.id)) { _close(); return; }
  if (_open()) return;                       // deja ouverte, ne pas la reconstruire
  // Le message de bienvenue de l'operateur passe avant : empiler deux modales
  // au premier lancement serait illisible. On reessaie tant qu'elle est la.
  if (document.getElementById('welcome-modal')) {
    _waitTimer = setTimeout(_render, 800);
    return;
  }
  _renderVote();
}

// ── Ponts ──────────────────────────────────────────────────────────
window._pollSetConfig = function (p) {
  _poll = (p && p.id && Array.isArray(p.options) && p.options.length >= 2) ? p : null;
  _render();
};
window._pollOnScreen = function (id) { if (id === 's-lobby') _render(); else _close(); };
window._pollRefresh = function () { _render(); };
// Escape : enregistree dans le registre de ui/keynav.mjs. Fermer vaut « vu »,
// comme la croix.
window.closePollModal = function () { if (_poll) _markDone(_poll.id); _close(); };
