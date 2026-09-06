// @ts-check
// game/stack-rank.mjs — Classement des tapis en direct (extra web).
//
// Le « Table ranking » existant classe les joueurs attablés selon le
// classement pokerth.net (ELO du site) ; ce panneau-ci classe les TAPIS de la
// partie en cours — qui domine la table, avec combien, et qui est en danger.
//
// Conception : module AUTONOME (gabarit odds-monitor) — un panneau fixe,
// déplaçable au doigt/souris par son en-tête, position mémorisée, jamais
// bloquant : on le laisse ouvert en jouant. Le calcul est PUR et exporté
// (rankRows) : il photographie l'état et rend des lignes triées, testables
// sans navigateur.
//
// Choix de classement, assumés :
//  · on classe sur « tapis + mise posée » : les jetons engagés sur la street
//    appartiennent encore au joueur tant que le pot n'est pas ramassé —
//    classer le tapis seul ferait yo-yoter le classement à chaque relance ;
//  · les ex æquo partagent leur rang (1, 2, 2, 4 — classement sportif) ;
//  · les joueurs hors jeu (éliminés / partis) ferment la liste sans rang,
//    estompés : ce qui compte est qui reste en course, et avec quoi.
//
// Intégrations (toutes optionnelles côté appelant) :
//  · rafraîchi en fin de rendu des sièges (window._chipRankSync) — exactement
//    le moment où les tapis changent à l'écran, sortie immédiate si fermé ;
//  · pastille de note devant le pseudo (window._nvSeatTag, modules/notes) ;
//  · un tap sur une ligne ouvre la carte joueur (openPlayerInfoPopup).

import { S } from './state.mjs';
import { esc } from '../ui/misc.mjs';
import { fmtChips } from '../ui/fmt.mjs';

function T(k, fb) {
  try {
    if (typeof window !== 'undefined' && typeof window.t === 'function') {
      const v = window.t(k);
      if (v && v !== k) return v;
    }
  } catch (_e) {}
  return fb;
}

// ── Calcul pur ────────────────────────────────────────────────────────────
// state : { seats: [pid…], seatData: {pid:{money,bet,action,active,folded,gone}}, myId }
// getName : pid → pseudo (injecté : le module n'impose pas sa source de noms).
export function rankRows(state, getName) {
  const seats = Array.isArray(state && state.seats) ? state.seats : [];
  const sd = (state && state.seatData) || {};
  const myId = state ? state.myId : undefined;
  const inPlay = [];
  const out = [];
  for (const pid of seats) {
    const d = sd[pid];
    if (!d || typeof d !== 'object') continue;
    const money = Math.max(0, Number(d.money) || 0);
    const bet = Math.max(0, Number(d.bet) || 0);
    const row = {
      pid,
      name: String(getName ? getName(pid) : pid),
      me: pid === myId,
      money, bet,
      total: money + bet,
      state: '',
      rank: null,
      share: 0,
    };
    if (d.gone || d.active === false) { row.state = 'out'; out.push(row); continue; }
    if (d.action === 'All-in') row.state = 'allin';
    else if (d.folded) row.state = 'folded';
    inPlay.push(row);
  }
  // Tri stable : total décroissant, l'ordre des sièges départageant à défaut.
  inPlay.sort((a, b) => b.total - a.total);
  out.sort((a, b) => b.total - a.total);
  // Rangs sportifs : deux tapis identiques partagent le rang, le suivant saute.
  let total = 0;
  for (let i = 0; i < inPlay.length; i++) {
    inPlay[i].rank = (i > 0 && inPlay[i].total === inPlay[i - 1].total)
      ? inPlay[i - 1].rank : i + 1;
    total += inPlay[i].total;
  }
  const top = inPlay.length ? inPlay[0].total : 0;
  for (const r of inPlay) r.share = top > 0 ? r.total / top : 0;
  return {
    rows: inPlay.concat(out),
    left: inPlay.length,
    total,
    avg: inPlay.length ? Math.round(total / inPlay.length) : 0,
  };
}

// ── Panneau ───────────────────────────────────────────────────────────────
const POS_KEY = 'pth_crk_pos';
let _open = false;

function _el() { return document.getElementById('chiprank-win'); }

function _stateBadge(st) {
  if (st === 'allin')  return '<span class="crk-st crk-allin">' + esc(T('chipRankAllIn', 'all-in')) + '</span>';
  if (st === 'folded') return '<span class="crk-st">' + esc(T('chipRankFolded', 'folded')) + '</span>';
  if (st === 'out')    return '<span class="crk-st">' + esc(T('chipRankOut', 'out')) + '</span>';
  return '';
}

export function renderChipRank() {
  const host = _el();
  if (!host || !_open) return;
  const getName = (pid) => {
    try { if (typeof window.getPlayerName === 'function') return window.getPlayerName(pid); } catch (_e) {}
    return (S.players && S.players[pid]) || (pid === S.myId ? S.myName : '#' + pid);
  };
  const res = rankRows(S, getName);
  const list = host.querySelector('.crk-list');
  const sub = host.querySelector('.crk-sub');
  if (sub) {
    sub.innerHTML = res.left
      ? esc(T('chipRankLeft', 'In the running')) + ' <b>' + res.left + '</b>'
        + ' · ' + esc(T('chipRankAvg', 'Average')) + ' <b>' + esc(fmtChips(res.avg)) + '</b>'
        + ' · ' + esc(T('chipRankInPlay', 'In play')) + ' <b>' + esc(fmtChips(res.total)) + '</b>'
      : '';
  }
  if (!list) return;
  if (!res.rows.length) {
    list.innerHTML = '<div class="crk-empty">' + esc(T('chipRankEmpty', 'No stacks to rank yet.')) + '</div>';
    return;
  }
  list.innerHTML = res.rows.map((r) => {
    let dot = '';
    if (!r.me) {
      try { if (typeof window._nvSeatTag === 'function') dot = window._nvSeatTag(r.name); } catch (_e) {}
    }
    const cls = ['crk-row', r.me ? 'me' : '', r.state === 'out' ? 'out' : '', r.rank === 1 ? 'r1' : '']
      .filter(Boolean).join(' ');
    return '<div class="' + cls + '" role="button" tabindex="0" data-crk-pid="' + r.pid + '">'
      + '<span class="crk-rank">' + (r.rank == null ? '—' : r.rank) + '</span>'
      + '<span class="crk-name">' + dot + esc(r.name) + _stateBadge(r.state) + '</span>'
      + '<span class="crk-amt">' + esc(fmtChips(r.total)) + '</span>'
      + '<span class="crk-bar"><i style="width:' + Math.round(r.share * 100) + '%"></i></span>'
      + '</div>';
  }).join('');
}

// Appelé en fin de rendu des sièges : les tapis viennent de changer à l'écran.
export function chipRankSync() { if (_open) renderChipRank(); }

function _restorePos(host) {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (typeof p.l === 'number' && typeof p.t === 'number') {
      host.style.left = Math.max(0, Math.min(p.l, window.innerWidth - 60)) + 'px';
      host.style.top = Math.max(0, Math.min(p.t, window.innerHeight - 60)) + 'px';
      host.style.right = 'auto';
    }
  } catch (_e) {}
}

function _wireDrag(host, handle) {
  let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
  function move(e) {
    if (!dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const y = (e.touches ? e.touches[0].clientY : e.clientY);
    host.style.left = Math.max(0, Math.min(ox + x - sx, window.innerWidth - 60)) + 'px';
    host.style.top = Math.max(0, Math.min(oy + y - sy, window.innerHeight - 40)) + 'px';
    host.style.right = 'auto';
    e.preventDefault();
  }
  function up() {
    if (!dragging) return;
    dragging = false;
    try { localStorage.setItem(POS_KEY, JSON.stringify({ l: host.offsetLeft, t: host.offsetTop })); } catch (_e) {}
    document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up);
    document.removeEventListener('touchmove', move); document.removeEventListener('touchend', up);
  }
  function down(e) {
    if (e.target && e.target.closest && e.target.closest('.crk-x')) return;
    dragging = true;
    sx = (e.touches ? e.touches[0].clientX : e.clientX);
    sy = (e.touches ? e.touches[0].clientY : e.clientY);
    ox = host.offsetLeft; oy = host.offsetTop;
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, { passive: false }); document.addEventListener('touchend', up);
  }
  handle.addEventListener('mousedown', down);
  handle.addEventListener('touchstart', down, { passive: true });
}

function _build() {
  let host = _el();
  if (host) return host;
  host = document.createElement('div');
  host.id = 'chiprank-win';
  host.setAttribute('role', 'dialog');
  host.setAttribute('aria-label', T('chipRankTitle', 'Chip ranking'));
  host.style.display = 'none';
  host.innerHTML =
      '<div class="crk-hd">'
    + '<span class="crk-ttl">' + esc(T('chipRankTitle', 'Chip ranking')) + '</span>'
    + '<button type="button" class="crk-x" aria-label="✕">✕</button>'
    + '</div>'
    + '<div class="crk-sub"></div>'
    + '<div class="crk-list"></div>';
  document.body.appendChild(host);
  _restorePos(host);
  _wireDrag(host, host.querySelector('.crk-hd'));
  host.querySelector('.crk-x').addEventListener('click', closeChipRank);
  // Un tap sur une ligne ouvre la carte joueur — délégation, la liste étant
  // repeinte à chaque main. Ma propre ligne ouvre ma carte (sans pid), comme
  // dans la liste des joueurs.
  host.addEventListener('click', (e) => {
    const row = e.target && e.target.closest ? e.target.closest('.crk-row') : null;
    if (!row) return;
    const pid = parseInt(row.getAttribute('data-crk-pid'), 10);
    try {
      if (typeof window.openPlayerInfoPopup === 'function') {
        if (pid === S.myId) window.openPlayerInfoPopup();
        else window.openPlayerInfoPopup(pid);
      }
    } catch (_e) {}
  });
  host.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const row = e.target && e.target.closest ? e.target.closest('.crk-row') : null;
    if (row) row.click();
  });
  return host;
}

export function openChipRank() {
  const host = _build();
  _open = true;
  host.style.display = '';
  renderChipRank();
}

export function closeChipRank() {
  _open = false;
  const host = _el();
  if (host) host.style.display = 'none';
}

export function toggleChipRank() { if (_open) closeChipRank(); else openChipRank(); }

if (typeof window !== 'undefined') {
  window.openChipRank = openChipRank;
  window.closeChipRank = closeChipRank;
  window.toggleChipRank = toggleChipRank;
  window._chipRankSync = chipRankSync;
}
