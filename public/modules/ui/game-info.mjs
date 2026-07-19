// ═══════════════════════════════════════════════════════════════════
// Popup d'info de table (gim-*), minuteur de montée des blinds,
// bouton « ▶ Start » sans bots, pill lobby, reset du header de partie
// — chantier ESM #9g-B1.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t (i18n.mjs), esc (misc.mjs), _groupThousands (fmt.mjs),
// _gameTypeLabel (lobby.mjs), _avatarChipHtml (player-popup.mjs)
// importés ; `_lang` → `window._lang` (1 occurrence) ;
// window._lastPotTotal / window._avatarChipHtml (déjà qualifiés) et
// l'onclick `App.copyTableLink()` (chaîne, résolue au clic) inchangés.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { esc } from './misc.mjs';
import { _groupThousands } from './fmt.mjs';
import { _gameTypeLabel } from './lobby.mjs';
import { _avatarChipHtml } from './player-popup.mjs';

// ── Minuteur de montée des blinds (mode « toutes les N minutes ») ──
// _blindsClockStart : timestamp (ms) du début du niveau de blinds courant.
// Ancré au 1er HandStart, ré-ancré à chaque montée de SB. Meilleure
// estimation côté client : le serveur vérifie l'intervalle au début de
// chaque main, donc le compte peut rester à 0:00 jusqu'à la main suivante.
function _stopBlindsCountdown() {
  if (S._blindsCdTimer) { clearInterval(S._blindsCdTimer); S._blindsCdTimer = null; }
}
function _fmtBlindsCountdown() {
  var ms = S._blindsClockStart + S._raiseEvery * 60000 - Date.now();
  var sec = Math.max(0, Math.round(ms / 1000));
  var m = Math.floor(sec / 60), r = sec % 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}
function _startBlindsCountdown() {
  _stopBlindsCountdown();
  S._blindsCdTimer = setInterval(function () {
    var el = document.getElementById('blinds-cd');
    if (!el) { _stopBlindsCountdown(); return; }   // pastille retirée → stop
    el.textContent = _fmtBlindsCountdown();
  }, 1000);
}

// ── « Joueurs restants » : ni parti (gone) ni éliminé (money connu ≤ 0).
// Affiché dans le POPUP d'info de table (feedback : la strip était trop
// chargée) — plus aucun rendu dans la pot-strip. ──
function _remainCount() {
  try {
    return S.seats.filter(function (p) {
      var sd = S.seatData[p];
      return sd && !sd.gone && !(sd.money != null && sd.money <= 0 && sd.active === false);
    }).length;
  } catch (e) { return 0; }
}

// Re-evaluate visibility of the "▶ Start" (no-bots) button based on
// how many humans are currently at the table. Called from the
// waiting-panel renderer on every refresh so the button appears as
// soon as the second human arrives and disappears if they leave.
//
// Safety: only ever shows the button to the game admin. If the
// admin button is hidden (we're not the admin) the function does
// nothing — extra cheap-guard before counting.
function refreshStartNoBotsVisibility() {
  if (!S.amGameAdmin || S._gameStarted) {
    // Hide explicitly once the game has started — the renderer's
    // early-return otherwise leaves the button stuck on screen.
    var b1 = document.getElementById('admin-startnobots-btn');
    var b2 = document.getElementById('admin-startnobots-mob');
    if (b1) b1.style.display = 'none';
    if (b2) b2.style.display = 'none';
    return;
  }
  // Build the same pid set as renderWaitingPanel(): pids present in
  // seatData with .gone falsy, PLUS myId if missing (myId only
  // enters seatData via GamePlayerJoined for ourselves, which the
  // server sometimes elides — the renderer compensates the same way).
  var pids = Object.keys(S.seatData)
    .map(function(s){ return parseInt(s,10); })
    .filter(function(p){ return S.seatData[p] && !S.seatData[p].gone; });
  if (S.myId && pids.indexOf(S.myId) === -1) pids.push(S.myId);
  var showIt = pids.length >= 2;
  var btn  = document.getElementById('admin-startnobots-btn');
  var btnM = document.getElementById('admin-startnobots-mob');
  if (btn)  btn.style.display  = showIt ? '' : 'none';
  if (btnM) btnM.style.display = showIt ? '' : 'none';
}

// ──────────────────────────────────────────────────────────────
// Lobby pseudo pill: avatar + name, click opens the player-info
// modal (which has a 'Change avatar' button).
// ──────────────────────────────────────────────────────────────
function updateLobbyPill() {
  // #h-nick (pill profil) retiré du header ; on reste défensif s'il existe.
  var el = document.getElementById('h-nick');
  if (el) el.innerHTML = S.myName ? esc(S.myName) : '—';
  // Barre du bas : avatar AVANT le nom.
  var _fn = document.getElementById('lobby-foot-name');   // barre du bas (Phase 1b)
  if (_fn) _fn.textContent = S.myName || '—';
  var _fav = document.getElementById('lobby-foot-av');
  if (_fav) _fav.innerHTML = S.myName ? _avatarChipHtml(S.myId, S.myName, 'pl-av') : '';
}

function _resetGameHeader() {
  var n = document.getElementById('g-name'); if (n) n.textContent = 'TABLE';
  var a = document.getElementById('g-admin-badge'); if (a) a.style.display = 'none';
  var pb = document.getElementById('g-public-badge'); if (pb) pb.style.display = 'none';
}

function openGameInfoPopup() {
  var modal = document.getElementById('game-info-modal');
  if (!modal) return;
  var titleEl = document.getElementById('gim-title');
  var subEl   = document.getElementById('gim-subtitle');
  var bodyEl  = document.getElementById('gim-body');
  if (!titleEl || !bodyEl) return;

  var fr   = (window._lang === 'fr');
  var meta = S._gameMeta || {
    id: S.gId, name: '—', type: 1, maxPlayers: 0,
    priv: false, timeout: S.gameTimeout, startMoney: S.gameStartMoney,
  };

  titleEl.textContent = meta.name + ' · #' + meta.id;

  // Subtitle: row of badges (admin / private). Hidden if both false.
  var badges = [];
  if (S.amGameAdmin) {
    badges.push('<span class="gim-badge">👑 ' + (fr ? 'Admin' : 'Admin') + '</span>');
  }
  if (meta.priv) {
    badges.push('<span class="gim-badge">🔒 ' + t('piPrivate') + '</span>');
  } else {
    badges.push('<span class="gim-badge">🌐 ' + t('piPublic') + '</span>');
  }
  subEl.innerHTML = badges.join(' ');

  // Body: 3 sections of label/value rows.
  // Pot total mémorisé par setPot (le bandeau affiche désormais le pot
  // collecté séparé des mises → plus de parsing DOM possible).
  var _potNow = (typeof window._lastPotTotal === 'number') ? window._lastPotTotal : 0;
  var round = '—';
  var roundEl = document.getElementById('g-round');
  if (roundEl) round = (roundEl.textContent || '—').trim();

  // Count current players from seatData / seats. Spectators don't
  // count, only seated players that the server told us about.
  var activeCount = 0;
  if (Array.isArray(S.seats) && S.seats.length) {
    S.seats.forEach(function(pid){
      var sd = S.seatData[pid] || {};
      // Eliminated/sitting-out players still "exist" at the table but
      // are not actively playing this hand. We count them as joined
      // (they're at the table) but mark eliminated ones separately.
      if (sd.active !== false || sd.money > 0) activeCount++;
      else activeCount++; // count them anyway -- they're seated
    });
  }
  if (!activeCount) activeCount = Object.keys(S.seatData || {}).length;

  var sections = [];

  // ── Section 1: General info ──
  sections.push({
    title: t('piInformation'),
    rows: [
      [t('piType'),          _gameTypeLabel(meta.type)],
    ],
  });

  // ── Section 2: Configuration ──
  sections.push({
    title: t('piConfiguration'),
    rows: [
      [t('blinds'),
          '$' + (S.smallBlind || 0) + ' / $' + ((S.smallBlind || 0) * 2)],
      [t('piStartingStack'),
          '$' + _groupThousands(meta.startMoney || 0)],
      [t('piActionTimer'),
          (meta.timeout || S.gameTimeout || 15) + ' s'],
    ],
  });

  // ── Section 3: État de la partie ──
  sections.push({
    title: t('piGameState'),
    rows: [
      [t('players'),
          activeCount + ' / ' + (meta.maxPlayers || '?')],
      // Restants = ni partis ni éliminés (déplacé ici depuis la strip)
      [t('plRemaining'),
          S._gameStarted ? String(_remainCount()) : t('piNotStarted')],
      [t('piHandNo'),
          (S.handNum > 0) ? ('H#' + S.handNum) : t('piNotStarted')],
      [t('piPot'),
          '$' + _groupThousands(_potNow)],
      [t('piPhase'),
          round],
    ],
  });

  // ── Section 4: Spectateurs (only if any) ──
  // Built from _specPids, populated by GameSpectatorJoined handlers.
  // Each row gets the same avatar treatment as the kick / players
  // list (via _avatarChipHtml: PokerTH image > emoji > initial > 🤖).
  // The user themselves is filtered out (we don't add ourselves to
  // _specPids in the join handler) so the list shows OTHER specs.
  // When the local user is themselves a spectator, we add a "(vous)"
  // entry up top so they see they're not invisible.
  var specRows = [];
  if (S._amSpectator && S.myId) {
    // Show ourselves first, marked as such.
    var meName = (S.myName || ('#' + S.myId)) + ' ' +
                 '<span class="gim-spec-me">' +
                 t('piYou') +
                 '</span>';
    specRows.push({ pid: S.myId, html: meName });
  }
  S._specPids.forEach(function(sp) {
    specRows.push({
      pid: sp,
      html: S.players[sp] ? esc(S.players[sp]) : ('#' + sp),
    });
  });

  var html = '';
  sections.forEach(function(s){
    html += '<div class="gim-section">';
    html += '<div class="gim-section-title">' + esc(s.title) + '</div>';
    s.rows.forEach(function(r){
      html += '<div class="gim-row">'
            + '<span class="gim-row-label">' + esc(r[0]) + '</span>'
            + '<span class="gim-row-value">' + esc(r[1]) + '</span>'
            + '</div>';
    });
    html += '</div>';
  });

  // Spectators section: rendered separately because it uses a
  // different row layout (avatar chip + name, like the kick modal).
  if (specRows.length) {
    html += '<div class="gim-section">';
    html += '<div class="gim-section-title">' +
            '👁 ' + esc(t('piSpectators')) +
            ' <span class="gim-section-count">(' + specRows.length + ')</span>' +
            '</div>';
    html += '<div class="gim-spec-list">';
    specRows.forEach(function(r) {
      var avChip = (typeof window._avatarChipHtml === 'function')
        ? window._avatarChipHtml(r.pid, S.players[r.pid] || ('#' + r.pid), 'gim-spec-av')
        : '<span class="gim-spec-av letter">?</span>';
      html += '<div class="gim-spec-row">' + avChip +
              '<span class="gim-spec-name">' + r.html + '</span></div>';
    });
    html += '</div></div>';
  }

  // ── Share / copy-link action ──
  // A full-width button at the bottom of the modal that copies a
  // deep link to this table (server + port + tls + table id). See
  // App.copyTableLink(). Only shown while actually in a game.
  if (S.gId) {
    html += '<div class="gim-section gim-share-section">' +
              '<button id="gim-copy-link-btn" class="gim-copy-link-btn" type="button" ' +
                'onclick="App.copyTableLink()">' +
                '🔗 ' + esc(fr ? 'Copier le lien d\'invitation' : 'Copy invite link') +
              '</button>' +
              '<div class="gim-share-hint">' +
                esc(fr
                  ? 'Le destinataire rejoindra directement cette table.'
                  : 'The recipient will join this table directly.') +
              '</div>' +
            '</div>';
  }

  bodyEl.innerHTML = html;

  // Also add a "👁 N" badge to the subtitle when there's at least
  // one spectator (besides ourselves). Tiny detail but it makes
  // the spectator presence visible WITHOUT having to scroll the
  // modal — the badges are right under the title.
  if (S._specPids.size > 0) {
    var specBadge = '<span class="gim-badge gim-badge-spec">👁 ' +
                    S._specPids.size + '</span>';
    subEl.innerHTML = subEl.innerHTML + ' ' + specBadge;
  }

  modal.style.display = 'flex';
}

function closeGameInfoPopup() {
  var modal = document.getElementById('game-info-modal');
  if (modal) modal.style.display = 'none';
}

export { _stopBlindsCountdown, _fmtBlindsCountdown, _startBlindsCountdown,
         _remainCount, refreshStartNoBotsVisibility, updateLobbyPill,
         _resetGameHeader, openGameInfoPopup, closeGameInfoPopup };

for (const [k, v] of Object.entries({ _stopBlindsCountdown,
  _fmtBlindsCountdown, _startBlindsCountdown, _remainCount,
  refreshStartNoBotsVisibility, updateLobbyPill, _resetGameHeader,
  openGameInfoPopup, closeGameInfoPopup }))
  window[k] = v;
window._refreshStartNoBotsVisibility = refreshStartNoBotsVisibility;
