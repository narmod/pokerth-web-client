/* Live / embedded spectator mode — table list.
 *
 * A dedicated list rather than the full lobby: it follows the layout of the
 * spectator tool it replaces (one row per table, an expandable panel with the
 * seated players and the table's settings, and Spectate as the only action),
 * while the table view stays the client's own.
 *
 * It reads S.games / S.players — the same records the ordinary lobby renders
 * from. Repaints are driven by watching the ordinary list (#g-list) for
 * mutations: net/msg-lobby.mjs calls the renderGames binding it imported from
 * ui/lobby.mjs, not window.renderGames, so hooking the global would never
 * fire. The hidden list is still rendered in live mode, which makes it a
 * reliable signal. No new protocol handling, no second source of truth.
 *
 * The state object reaches the page as window.PthState (game/state.mjs bridges
 * it for pokerth.js, which does `const S = window.PthState` at the top of its
 * IIFE). window.S does not exist — an earlier revision of this file read it
 * and therefore always saw an empty game list and a nameless header.
 *
 * Every label reuses an existing i18n key, so the 40 locales stay complete.
 */

import { keepDocked } from './chat-pane.mjs';
import { openSpectateDialog } from './spectate-dialog.mjs';

const expanded = new Set();
let activeTab = 'games';   // 'games' | 'players'

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tr(key, fallback) {
  try { if (window.t) { const v = window.t(key); if (v && v !== key) return v; } } catch (e) {}
  return fallback;
}

// Same mappings the ordinary lobby uses (MODE_LABEL / GTYPE in ui/lobby.mjs).
// Duplicated as a four-entry table rather than exported, to keep this module
// loadable on its own: it must not drag the full lobby in on /live.
function modeLabel(mode) {
  if (mode === 1) return tr('modeWaiting', 'Waiting');
  if (mode === 2) return tr('modeInProgress', 'In progress');
  if (mode === 3) return tr('modeClosed', 'Closed');
  return '';
}
function typeLabel(tp) {
  return ({ 1: tr('gtypeNormal', 'Normal'), 2: tr('gtypeRegistered', 'Registered'),
            3: tr('gtypeInvite', 'Invite'), 4: tr('gtypeRanked', 'Ranked') })[tp] || '';
}

// The list shows an icon per game type, as the spectator tool does; the
// translated wording stays on the title so no locale is left behind and no
// column has to be wide enough for "Invited players only".
function typeIcon(tp) {
  return ({ 1: '\u2660', 2: '\u{1F464}', 3: '\u{1F465}', 4: '\u{1F3C6}' })[tp] || '\u2660';
}

function groupThousands(n) {
  return String(n == null ? 0 : n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
}

// The one place this module reaches the shared state.
function state() {
  return window.PthState || {};
}

function seatNames(g) {
  const S = state();
  const ids = (g && g.seats && g.seats.length) ? g.seats : [];
  return ids.map(function (pid) {
    return (S.players && S.players[pid]) ? String(S.players[pid]) : '#' + pid;
  });
}

// Where a player is, for the Players tab: the game they sit at, or the one
// they are watching. Same records the ordinary lobby reads.
function whereIs(pid) {
  const S = state();
  const games = S.games || {};
  for (const id of Object.keys(games)) {
    const g = games[id];
    if (g.seats && g.seats.indexOf(pid) !== -1) return { id: id, g: g, watching: false };
  }
  for (const id of Object.keys(games)) {
    const g = games[id];
    if (g.watchers && g.watchers.indexOf(pid) !== -1) return { id: id, g: g, watching: true };
  }
  return null;
}

function renderPlayers() {
  const S = state();
  const players = S.players || {};
  const ids = Object.keys(players).sort(function (a, b) {
    return String(players[a]).toLowerCase() < String(players[b]).toLowerCase() ? -1 : 1;
  });
  if (!ids.length) return '<div class="llb-empty">\u2014</div>';

  return '<div class="llb-players">' + ids.map(function (pid) {
    const at = whereIs(parseInt(pid, 10));
    let sub = '';
    let btn = '';
    if (at) {
      const label = at.watching ? tr('spectatingTable', 'Spectating table ')
                                : tr('plInGame', 'In game') + ' : ';
      sub = '<span class="llb-pl-at">' + esc(label) + esc(at.g.name || '') + '</span>';
      // Spectating a player means spectating their table — only once it runs.
      if (at.g.mode === 2) {
        btn = '<button type="button" class="llb-spec llb-spec-sm" data-spec="' + esc(at.id) + '">' +
              '\u{1F441} ' + esc(tr('spectatorBtn', 'Spectate')) + '</button>';
      }
    }
    // Avatar and the player card both come from the client: _avatarChipHtml is
    // what the ordinary players panel uses, and openPlayerInfoPopup is the
    // same card, statistics included, that a click on a name opens there.
    const name = String(players[pid]);
    const chip = (typeof window._avatarChipHtml === 'function')
      ? window._avatarChipHtml(pid, name, 'llb-pl-av')
      : '<span class="llb-pl-av letter">' + esc((name[0] || '?').toUpperCase()) + '</span>';

    return '<div class="llb-pl">' + chip +
      '<span class="llb-pl-tx">' +
        '<span class="llb-pl-name" role="button" tabindex="0"' +
          ' onclick="window.openPlayerInfoPopup(' + esc(pid) + ')"' +
          ' onkeydown="if(event.key===\'Enter\')window.openPlayerInfoPopup(' + esc(pid) + ')">' +
          esc(name) + '</span>' + sub +
      '</span>' + btn +
    '</div>';
  }).join('') + '</div>';
}

function rowDetail(id, g) {
  const names = seatNames(g);
  const bits = [];
  if (g.startMoney) {
    bits.push('<span><b>' + esc(tr('startCash', 'Starting stack')) + '</b> : ' +
      groupThousands(g.startMoney) + '</span>');
  }
  if (g.smallBlind) {
    bits.push('<span><b>' + esc(tr('smallBlind', 'Small blind')) + '</b> : ' +
      groupThousands(g.smallBlind) + '</span>');
  }
  let up = '';
  if (g.raiseMode === 2 && g.raiseMins > 0) up = g.raiseMins + ' min';
  else if (g.raiseHands > 0) up = g.raiseHands;
  if (up) {
    bits.push('<span><b>' + esc(tr('infoBlindsUp', 'Blinds up')) + '</b> : ' + esc(up) + '</span>');
  }

  // Spectating is only possible once the hand is actually running (mode 2),
  // exactly as in the ordinary lobby.
  const canWatch = g.mode === 2;
  const btn = canWatch
    ? '<button type="button" class="llb-spec" data-spec="' + id + '">\u{1F441} ' +
      esc(tr('spectatorBtn', 'Spectate')) + '</button>'
    : '';

  return '<div class="llb-detail">' +
    '<div class="llb-seats">' +
      (names.length
        ? names.map(function (n) { return '<span class="llb-seat">' + esc(n) + '</span>'; }).join('')
        : '') +
    '</div>' +
    '<div class="llb-meta">' + bits.join('') + '</div>' +
    btn +
  '</div>';
}

let lastSig = null;

function render() {
  // pokerth.js re-parents the chat panel into .lobby-grid whenever the lobby
  // re-lays itself out, which empties the strip. Cheapest place to notice is
  // here, since this runs on every lobby change anyway.
  keepDocked();

  const host = document.getElementById('live-lobby-list');
  if (!host) return;
  const S = state();
  const entries = Object.entries(S.games || {});
  entries.sort(function (a, b) { return a[1].mode - b[1].mode; });

  // The observer below fires on every repaint of the ordinary list, several
  // times per second on a busy server. Rewriting innerHTML each time would
  // drop focus and flicker, so skip when nothing this list shows has changed.
  const sig = JSON.stringify([entries.map(function (p) {
    const g = p[1];
    return [p[0], g.name, g.mode, g.players, g.maxPlayers, g.type, !!g.priv,
            g.timeout, g.delay, (g.watchers || []).length, (g.seats || []).join(',')];
  }), [...expanded].sort(), activeTab, Object.keys(S.players || {}).join(',')]);
  if (sig === lastSig) return;
  lastSig = sig;

  const nGames = entries.length;
  const nPlayers = Object.keys(S.players || {}).length;
  const tabs =
    '<div class="llb-tabs" role="tablist">' +
      '<button type="button" class="llb-tab' + (activeTab === 'games' ? ' on' : '') +
        '" role="tab" data-tab="games">' +
        nGames + ' ' + esc(tr('tableCount', 'table(s)')) + '</button>' +
      '<button type="button" class="llb-tab' + (activeTab === 'players' ? ' on' : '') +
        '" role="tab" data-tab="players">' +
        nPlayers + ' ' + esc(tr('playersOnline', 'player(s)')) + '</button>' +
    '</div>';

  if (activeTab === 'players') { host.innerHTML = tabs + renderPlayers(); return; }

  const head =
    '<div class="llb-head">' +
      '<span class="llb-c-name"></span>' +
      '<span class="llb-c-num">' + esc(tr('players', 'Players')) + '</span>' +
      '<span class="llb-c-ico"></span>' +
      '<span class="llb-c-type">' + esc(tr('piType', 'Type')) + '</span>' +
      '<span class="llb-c-ico">' + esc(tr('piPrivate', 'Private')) + '</span>' +
      '<span class="llb-c-ico" title="' + esc(tr('spectatorBtn', 'Spectate')) + '">\u{1F441}</span>' +
      '<span class="llb-c-time">' + esc(tr('gameTimeLabel', 'Time')) + '</span>' +
    '</div>';

  if (!entries.length) {
    host.innerHTML = tabs + head + '<div class="llb-empty">' +
      esc(tr('noTablesAvailable', 'No tables')) + '</div>';
    return;
  }

  const rows = entries.map(function (pair) {
    const id = pair[0], g = pair[1];
    const open = expanded.has(id);
    const priv = (g.priv || g.type === 3);
    const watchers = (g.watchers && g.watchers.length) || 0;
    const time = (g.timeout || 0) + 's' + (g.delay ? '/' + g.delay + 's' : '');
    const statusIco = g.mode === 2 ? '\u2699' : (g.mode === 1 ? '\u{1F551}' : '\u2014');

    return '<div class="llb-row' + (open ? ' open' : '') + '">' +
      '<div class="llb-line" role="button" tabindex="0" data-row="' + esc(id) + '">' +
        '<span class="llb-c-name">' + esc(g.name || '') + '</span>' +
        '<span class="llb-c-num">' + (g.players || 0) + '/' + (g.maxPlayers || 0) + '</span>' +
        '<span class="llb-c-ico" title="' + esc(modeLabel(g.mode)) + '">' + statusIco + '</span>' +
        '<span class="llb-c-type" title="' + esc(typeLabel(g.type)) + '">' +
          typeIcon(g.type) + '</span>' +
        '<span class="llb-c-ico">' + (priv ? '\u{1F512}' : '') + '</span>' +
        '<span class="llb-c-ico llb-c-spec">\u{1F441} ' + watchers + '</span>' +
        '<span class="llb-c-time">' + esc(time) + '</span>' +
        '<span class="llb-chev">' + (open ? '\u2303' : '\u2304') + '</span>' +
      '</div>' +
      (open ? rowDetail(id, g) : '') +
    '</div>';
  }).join('');

  host.innerHTML = tabs + head + rows;
}

function onClick(ev) {
  const host = document.getElementById('live-lobby-list');
  if (!host || !ev.target || !ev.target.closest) return;

  const spec = ev.target.closest('[data-spec]');
  if (spec && host.contains(spec)) {
    ev.preventDefault();
    ev.stopPropagation();
    const id = parseInt(spec.getAttribute('data-spec'), 10);
    // Up first: joining takes a round trip and then a wait for the hand in
    // progress, and a click with nothing on screen reads as a click that did
    // nothing.
    openSpectateDialog();
    try { if (window.App && window.App.spectateGame) window.App.spectateGame(id); } catch (e) {}
    return;
  }

  const tab = ev.target.closest('[data-tab]');
  if (tab && host.contains(tab)) {
    const want = tab.getAttribute('data-tab');
    if (want !== activeTab) { activeTab = want; render(); }
    return;
  }

  const line = ev.target.closest('[data-row]');
  if (line && host.contains(line)) {
    const id = line.getAttribute('data-row');
    if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
    render();   // the signature includes `expanded`, so this always repaints
  }
}

export function initLiveLobby() {
  if (!document.getElementById('live-lobby-list')) return;

  // Repaint whenever the ordinary list repaints. #g-list is hidden in live
  // mode but still rendered, and every lobby message that changes a table
  // ends up rewriting it — including the ones that reach renderGames through
  // the ESM binding rather than through window.
  const gl = document.getElementById('g-list');
  if (gl && window.MutationObserver) {
    new window.MutationObserver(function () { render(); })
      .observe(gl, { childList: true, subtree: true, characterData: true });
  }
  // Belt and braces: anything that does go through the global still repaints,
  // and a slow safety tick covers a browser without MutationObserver.
  const orig = window.renderGames;
  window.renderGames = function () {
    try { if (orig) orig.apply(this, arguments); } catch (e) {}
    render();
  };
  setInterval(render, 3000);

  document.addEventListener('click', onClick);
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const line = ev.target && ev.target.closest && ev.target.closest('#live-lobby-list [data-row]');
    if (line) { ev.preventDefault(); onClick(ev); }
  });

  render();
}
