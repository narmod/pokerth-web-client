// ═══════════════════════════════════════════════════════════════════
// Invitations de table — #9f-5.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t (i18n.mjs), esc (misc.mjs), MSG (net/messages.mjs) importés ;
// send / showToast / closePlayerInfoPopup / addChat via window.*
// (ponts send & addChat ajoutés côté monolithe).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { esc } from '../ui/misc.mjs';
import { MSG } from './messages.mjs';

// Pseudo d'un joueur, repli sur « #<pid> » si inconnu (local).
function _petName(pid) { return S.players[pid] || ('#' + pid); }

// ─────────────────────────────────────────────────────────────
//  Game invitations (InviteNotifyMessage — pokerth.net & dedicated)
//  The host invites us to a (possibly invite-only) table; the server
//  forwards an InviteNotify. We surface an Accept/Decline banner,
//  mirroring the Qt client's invitation dialog. Accept = join the
//  table exactly like a lobby click; Decline = RejectGameInvitation.
// ─────────────────────────────────────────────────────────────
function _inviteClear() {
  S._inv = null;
  var b = document.getElementById('game-invite-banner');
  if (b) b.remove();
}
function _inviteShow(o) {
  if (window._offlineMode) return;
  // Same invite already up → keep it (server may resend on reconnect).
  if (S._inv && S._inv.gameId === o.gameId && document.getElementById('game-invite-banner')) return;
  _inviteClear();
  S._inv = { gameId: o.gameId };
  var host = _petName(o.byWhom);
  var tbl  = (S.games[o.gameId] && S.games[o.gameId].name) || ('#' + o.gameId);
  var b = document.createElement('div');
  b.id = 'game-invite-banner';
  b.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);' +
    'z-index:9000;max-width:min(94vw,460px);padding:10px 14px;border-radius:12px;' +
    'background:var(--modal-bg,#222a36);color:var(--text,#eff1f5);' +
    'border:1px solid var(--gold,#E3C800);box-shadow:0 6px 24px rgba(0,0,0,.45);' +
    'font-family:var(--ff-display,inherit);text-align:center';
  b.innerHTML =
    '<div style="font-weight:700;margin-bottom:8px">\u2709 ' +
      esc(t('inviteTitle', { name: host, table: tbl })) + '</div>' +
    '<div style="display:flex;gap:8px;justify-content:center">' +
      '<button id="gi-yes" style="flex:1;max-width:140px;padding:8px 0;border:0;border-radius:8px;' +
        'font-weight:700;cursor:pointer;background:var(--green,#3fae5a);color:#06210e">' +
        esc(t('inviteAccept')) + '</button>' +
      '<button id="gi-no" style="flex:1;max-width:140px;padding:8px 0;border:0;border-radius:8px;' +
        'font-weight:700;cursor:pointer;background:rgba(var(--red-rgb,217,64,64),1);color:#fff">' +
        esc(t('inviteDecline')) + '</button>' +
    '</div>';
  document.body.appendChild(b);
  var y = document.getElementById('gi-yes'), n = document.getElementById('gi-no');
  if (y) y.addEventListener('click', _inviteAccept);
  if (n) n.addEventListener('click', _inviteDecline);
}
function _inviteAccept() {
  if (!S._inv) return;
  var gid = S._inv.gameId;
  _inviteClear();
  try { window.send(MSG.buildJoinGame(gid, false)); } catch(e) {}
  if (typeof addChat === 'function') window.addChat(null, t('inviteAccepted'), 'sys', { key: 'inviteAccepted' });
}
function _inviteDecline() {
  if (!S._inv) return;
  var gid = S._inv.gameId;
  _inviteClear();
  try { window.send(MSG.buildRejectInvite(gid, 0)); } catch(e) {}
}

export { _inviteClear, _inviteShow, _inviteAccept, _inviteDecline };

for (const [k, v] of Object.entries({
  _inviteClear, _inviteShow, _inviteAccept, _inviteDecline })) window[k] = v;
