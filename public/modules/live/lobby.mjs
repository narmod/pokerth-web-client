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
 * Every label reuses an existing i18n key, so the 40 locales stay complete.
 */

const expanded = new Set();

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

function groupThousands(n) {
  return String(n == null ? 0 : n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
}

function seatNames(g) {
  const S = window.S || {};
  const ids = (g && g.seats && g.seats.length) ? g.seats : [];
  return ids.map(function (pid) {
    return (S.players && S.players[pid]) ? String(S.players[pid]) : '#' + pid;
  });
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
  const host = document.getElementById('live-lobby');
  if (!host) return;
  const S = window.S || {};
  const entries = Object.entries(S.games || {});
  entries.sort(function (a, b) { return a[1].mode - b[1].mode; });

  // The observer below fires on every repaint of the ordinary list, several
  // times per second on a busy server. Rewriting innerHTML each time would
  // drop focus and flicker, so skip when nothing this list shows has changed.
  const sig = JSON.stringify([entries.map(function (p) {
    const g = p[1];
    return [p[0], g.name, g.mode, g.players, g.maxPlayers, g.type, !!g.priv,
            g.timeout, g.delay, (g.watchers || []).length, (g.seats || []).join(',')];
  }), [...expanded].sort()]);
  if (sig === lastSig) return;
  lastSig = sig;

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
    host.innerHTML = head + '<div class="llb-empty">' +
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
        '<span class="llb-c-type">' + esc(typeLabel(g.type)) + '</span>' +
        '<span class="llb-c-ico">' + (priv ? '\u{1F512}' : '') + '</span>' +
        '<span class="llb-c-ico">' + watchers + '</span>' +
        '<span class="llb-c-time">' + esc(time) + '</span>' +
        '<span class="llb-chev">' + (open ? '\u2303' : '\u2304') + '</span>' +
      '</div>' +
      (open ? rowDetail(id, g) : '') +
    '</div>';
  }).join('');

  host.innerHTML = head + rows;
}

function onClick(ev) {
  const host = document.getElementById('live-lobby');
  if (!host || !ev.target || !ev.target.closest) return;

  const spec = ev.target.closest('[data-spec]');
  if (spec && host.contains(spec)) {
    ev.preventDefault();
    ev.stopPropagation();
    const id = parseInt(spec.getAttribute('data-spec'), 10);
    try { if (window.App && window.App.spectateGame) window.App.spectateGame(id); } catch (e) {}
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
  if (!document.getElementById('live-lobby')) return;

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
    const line = ev.target && ev.target.closest && ev.target.closest('#live-lobby [data-row]');
    if (line) { ev.preventDefault(); onClick(ev); }
  });

  render();
}
