// ═══════════════════════════════════════════════════════════════════
// Vote-kick (pétitions communautaires) + invitations de table — #9f-5.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t (i18n.mjs), esc (misc.mjs), MSG (net/messages.mjs) importés ;
// send / showToast / closePlayerInfoPopup / addChat via window.*
// (ponts send & addChat ajoutés côté monolithe).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { esc } from '../ui/misc.mjs';
import { MSG } from './messages.mjs';

// ══════════════════════════════════════════════════════════════════
//  Vote-kick / kick petitions (pokerth.net & dedicated servers)
//  The host kicks directly (KickPlayerRequest, see doKickConfirmed).
//  Any seated player can instead open a COMMUNITY petition: everyone
//  votes within a deadline and the server removes the target if enough
//  YES votes are gathered. The official Qt client has had this for years;
//  the web client used to ignore the whole message family. Gated to live
//  games (meaningless offline vs bots).
// ══════════════════════════════════════════════════════════════════
function _petName(pid) { return S.players[pid] || ('#' + pid); }
function _petClear() {
  if (S._pet && S._pet.timer) { try { clearInterval(S._pet.timer); } catch(e) {} }
  S._pet = null;
  var b = document.getElementById('kick-petition-banner');
  if (b) b.remove();
}
function _petStart(o) {
  if (window._offlineMode) return;
  if (S.gId && o.gameId && o.gameId !== S.gId) return;
  _petClear();
  var amTarget = (o.target === S.myId);
  S._pet = { petitionId: o.petitionId, target: o.target,
           endsAt: Date.now() + (o.timeout > 0 ? o.timeout : 30) * 1000,
           timer: null, voted: amTarget };
  var b = document.createElement('div');
  b.id = 'kick-petition-banner';
  b.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);' +
    'z-index:9000;max-width:min(94vw,460px);padding:10px 14px;border-radius:12px;' +
    'background:var(--modal-bg,#222a36);color:var(--text,#eff1f5);' +
    'border:1px solid var(--gold,#E3C800);box-shadow:0 6px 24px rgba(0,0,0,.45);' +
    'font-family:var(--ff-display,inherit);text-align:center';
  var title = amTarget ? ('\u26A0 ' + t('petitionAgainstYou'))
                       : ('\u26A0 ' + t('petitionTitle', { name: _petName(o.target) }));
  b.innerHTML =
    '<div style="font-weight:700;margin-bottom:4px">' + esc(title) + '</div>' +
    '<div id="kp-tally" style="font-size:.82em;opacity:.85;margin-bottom:6px"></div>' +
    '<div id="kp-time" style="font-size:.78em;opacity:.7;margin-bottom:8px"></div>' +
    (amTarget ? '' :
      '<div style="display:flex;gap:8px;justify-content:center">' +
        '<button id="kp-yes" style="flex:1;max-width:140px;padding:8px 0;border:0;border-radius:8px;' +
          'font-weight:700;cursor:pointer;background:rgba(var(--red-rgb,217,64,64),1);color:#fff">' +
          esc(t('petitionVoteYes')) + '</button>' +
        '<button id="kp-no" style="flex:1;max-width:140px;padding:8px 0;border:0;border-radius:8px;' +
          'font-weight:700;cursor:pointer;background:var(--green,#3fae5a);color:#06210e">' +
          esc(t('petitionVoteNo')) + '</button>' +
      '</div>');
  document.body.appendChild(b);
  if (!amTarget) {
    var y = document.getElementById('kp-yes'), n = document.getElementById('kp-no');
    if (y) y.addEventListener('click', function(){ _petVote(true); });
    if (n) n.addEventListener('click', function(){ _petVote(false); });
  }
  _petTick();
  S._pet.timer = setInterval(_petTick, 500);
}
function _petTick() {
  if (!S._pet) return;
  if (!S.gId) { _petClear(); return; } // left the table → dismiss
  var el = document.getElementById('kp-time');
  var left = Math.max(0, Math.round((S._pet.endsAt - Date.now()) / 1000));
  if (el) el.textContent = t('petitionTimeLeft', { s: left });
  if (left <= 0) {
    var y = document.getElementById('kp-yes'), n = document.getElementById('kp-no');
    if (y) y.disabled = true;
    if (n) n.disabled = true;
    if (S._pet.timer) { try { clearInterval(S._pet.timer); } catch(e) {} S._pet.timer = null; }
  }
}
function _petUpdate(petitionId, against, inFavour, needed) {
  if (!S._pet || S._pet.petitionId !== petitionId) return;
  var el = document.getElementById('kp-tally');
  if (el) el.textContent = t('petitionTally', { y: inFavour, n: against, k: needed });
}
function _petVote(yes) {
  if (!S._pet || S._pet.voted) return;
  try { window.send(MSG.buildVoteKick(S.gId, S._pet.petitionId, yes)); } catch(e) {}
  S._pet.voted = true;
  var y = document.getElementById('kp-yes'), n = document.getElementById('kp-no');
  if (y) y.disabled = true;
  if (n) n.disabled = true;
  var tEl = document.getElementById('kp-time');
  if (tEl) tEl.textContent = t('petitionVoted');
}
function _petVoteReply(petitionId, replyType) {
  if (replyType === 2 && typeof showToast === 'function') window.showToast(t('petitionAlreadyVoted'));
}
function _petEnd(petitionId, kicked, reason) {
  if (!S._pet || S._pet.petitionId !== petitionId) return;
  var target = S._pet.target;
  if (S._pet.timer) { try { clearInterval(S._pet.timer); } catch(e) {} S._pet.timer = null; }
  var msg;
  if (kicked) msg = t('petitionResultKicked', { name: _petName(target) });
  else if (reason === 3) msg = t('petitionEndTimeout');
  else if (reason === 2) msg = t('petitionEndLeft');
  else if (reason === 1) msg = t('petitionEndFew');
  else msg = t('petitionResultRejected');
  var b = document.getElementById('kick-petition-banner');
  if (b) {
    b.innerHTML = '<div style="font-weight:700">' + esc(msg) + '</div>';
    setTimeout(function(){ var x = document.getElementById('kick-petition-banner'); if (x) x.remove(); }, 3500);
  }
  S._pet = null;
}
function _petAskDenied(reason) {
  if (typeof showToast === 'function') window.showToast(t('petitionDenied'));
}
// Open a petition against an opponent (from the profile popup).
function _petAsk(pid) {
  if (window._offlineMode || !S.gId || pid === S.myId) return;
  try { window.send(MSG.buildAskKickPlayer(S.gId, pid)); } catch(e) {}
  if (typeof closePlayerInfoPopup === 'function') window.closePlayerInfoPopup();
  if (typeof showToast === 'function') window.showToast(t('petitionStarted', { name: _petName(pid) }));
}

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

export { _petName, _petClear, _petStart, _petTick, _petUpdate, _petVote,
         _petVoteReply, _petEnd, _petAskDenied, _petAsk,
         _inviteClear, _inviteShow, _inviteAccept, _inviteDecline };

for (const [k, v] of Object.entries({ _petName, _petClear, _petStart, _petTick,
  _petUpdate, _petVote, _petVoteReply, _petEnd, _petAskDenied, _petAsk,
  _inviteClear, _inviteShow, _inviteAccept, _inviteDecline })) window[k] = v;
