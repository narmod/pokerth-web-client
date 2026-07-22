// ═══════════════════════════════════════════════════════════════════
// Handlers réseau — social (kick-petitions, invitations, chat,
// avertissement de timeout) — chantier ESM #9g-C2. Chaque fonction =
// le corps EXACT de l'ancienne case de handleMsg (signature (sub),
// `break` retiré ; RejectInvNotify était une case vide, conservée en
// no-op documenté). Adaptations : _pet*/_inviteShow (petitions.mjs),
// handleIncomingReaction (reactions.mjs), addChat (chat.mjs), t
// (i18n.mjs), Proto, MSG, send importés ; addGameChat →
// window.addGameChat (2×, fonction top-level du script) ;
// notifyLobbyChat reste sous garde typeof (résolu via window,
// pont sounds.mjs). Interop /emoji (sp0ck) : interception [R] et
// « /emoji  » conservée à l'octet près.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { Proto } from './proto.mjs';
import { MSG } from './messages.mjs';
import { send } from './session.mjs';
import { t } from '../i18n.mjs';
import { _petStart, _petUpdate, _petVoteReply, _petEnd, _petAskDenied,
         _inviteShow } from './petitions.mjs';
import { handleIncomingReaction } from '../ui/reactions.mjs';
import { addChat } from '../ui/chat.mjs';

const T = MSG.T;

function onStartKickPetition(sub) {
  _petStart({
    gameId:     Proto.u32(sub, 1),
    petitionId: Proto.u32(sub, 2),
    proposer:   Proto.u32(sub, 3),
    target:     Proto.u32(sub, 4),
    timeout:    Proto.u32(sub, 5),
    needed:     Proto.u32(sub, 6),
  });
}

function onKickPetitionUpdate(sub) {
  _petUpdate(Proto.u32(sub, 2), Proto.u32(sub, 3), Proto.u32(sub, 4), Proto.u32(sub, 5));
}

function onVoteKickReply(sub) {
  _petVoteReply(Proto.u32(sub, 2), Proto.u32(sub, 3));
}

function onEndKickPetition(sub) {
  _petEnd(Proto.u32(sub, 2), Proto.u32(sub, 5), Proto.u32(sub, 6));
}

function onAskKickDenied(sub) {
  _petAskDenied(Proto.u32(sub, 3));
}

function onInviteNotify(sub) {
  // InviteNotify: gameId=1, playerIdWho=2 (invitee), playerIdByWhom=3 (host)
  if (Proto.u32(sub, 2) === S.myId) {
    _inviteShow({ gameId: Proto.u32(sub, 1), byWhom: Proto.u32(sub, 3) });
  }
}

function onRejectInvNotify(sub) {
  // Refus d'une invitation QUE NOUS avons envoyée — les invitations
  // sortantes ne sont pas encore une fonctionnalité web : rien à afficher.
}

// Sommes-nous assis à une table ? (écran de jeu affiché)
function _inGameScreen() {
  try {
    const el = document.getElementById('s-game');
    return !!(el && el.classList && el.classList.contains('active'));
  } catch (e) { return false; }
}

function onChat(sub) {
  const pid  = Proto.u32(sub, 2);
  const ctype= Proto.u32(sub, 3);
  const text = Proto.str(sub, 4);
  // chatTypeBot (2) : le bot n'a pas de playerid → nom fixe « (chat bot) »
  // (parité clientstate.cpp). Sinon nom du joueur, ou #pid si inconnu.
  const who  = ctype === 2 ? '(chat bot)' : (S.players[pid] || (pid ? `#${pid}` : null));
  const cls  = ctype === 3 ? 'bc' : pid === S.myId ? 'mine' : '';
  // Logging de tous les messages chat (debug réactions)
  // Intercepter les réactions (préfixe ASCII [R])
  var _reEmoji = null;
  if (text && text.startsWith('[R]') && text.length < 12) _reEmoji = text.slice(3);
  else if (text && text.startsWith('/emoji ') && text.length < 18) _reEmoji = text.slice(7).trim();
  if (_reEmoji) {
    if (pid !== S.myId) {
      handleIncomingReaction(pid, _reEmoji, 'chat');
      // Pas d'affichage dans le chat — animation seule
    }
  } else if (!(pid === S.myId && ctype !== 3)) {
    // Son de notification du chat LOBBY (lobbychatnotify.wav) — messages
    // d'autrui uniquement (chatTypeLobby = 0) et SEULEMENT hors partie :
    // assis à une table, le panneau lobby n'est pas visible, le son n'avait
    // donc aucun référent à l'écran (remonté narmod 22/07). Le chat de partie
    // et les broadcasts (ctype 1 / 3) ne passent pas par ici.
    if (ctype === 0 && pid && pid !== S.myId && !_inGameScreen()) {
      try { if (typeof notifyLobbyChat === 'function') notifyLobbyChat(); } catch (_e) {}
    }
    // Mon propre message : déjà affiché en optimiste à l'envoi (classe 'mine').
    // Le serveur le rediffuse à tous, expéditeur compris → on ignore l'écho
    // pour ne pas afficher la ligne en double (broadcast ctype===3 conservé).
    // ── Routage par chatType (parité QML LobbyHandler ↔ GameHandler) ──
    //   0 lobby → panneau lobby seul · 1 partie → chat de partie seul ·
    //   2 bot → chat de partie si gameId présent (field 1), sinon lobby ·
    //   3 broadcast → les deux panneaux · autres (privé…) → lobby.
    const gid    = Proto.u32(sub, 1);
    const toGame = ctype === 1 || ctype === 3 || (ctype === 2 && gid > 0);
    const toLobby = !toGame || ctype === 3;
    if (toGame && typeof window.addGameChat === 'function') window.addGameChat(who, text, cls);
    if (toLobby) addChat(who, text, cls);
  }
}

function onTimeoutWarning(sub) {
  const sec = Proto.u32(sub, 2);
  S._timerSec = sec; // Sync avec le serveur
  // Si le serveur donne plus de temps que prévu, ajuster le total
  if (sec > S._timerTot) S._timerTot = sec;
  addChat(null, t('timerHurry', { s: sec }), 'sys', { key: 'timerHurry', params: { s: sec } });
  // Auto-reset timeout
  const rtm = Proto.encode([[1,0,68],[69,2,new Uint8Array(0)]]);
  send(rtm);
}

function onChatReject(sub) {
  const rejText = Proto.str(sub, 1);
  if (S._lastMsgWasReaction) {
    // Réaction rejetée (mode LAN/invité) — afficher badge local uniquement
    S._lastMsgWasReaction = false;
    if (!S._chatRejectShown) {
      S._chatRejectShown = true;
      // Note discrète dans la barre de réactions
      var rb = document.getElementById('reaction-bar');
      if (rb) {
        var note = document.createElement('div');
        note.style.cssText = 'font-size:0.52rem;color:var(--orange);text-align:center;width:100%;margin-top:2px;font-style:italic';
        note.textContent = S._currentLoginMode === 'lan'
          ? t('reactLanLocalNote')
          : t('reactLocalOnlyNote');
        rb.appendChild(note);
        setTimeout(function(){ note.style.opacity='0'; note.style.transition='opacity 1s'; setTimeout(function(){ note.remove(); }, 1000); }, 5000);
      }
    }
  } else {
    S._lastMsgWasReaction = false;
    if (!S.amInGame) addChat(null, t('chatRefusedReason', { r: rejText }), 'sys', { key: 'chatRefusedReason', params: { r: rejText } });
    else if (!S._chatRejectShown) {
      S._chatRejectShown = true;
      if (S._currentLoginMode === 'lan') {
        window.addGameChat(null, t('chatLanDisabled'), 'sys', { key: 'chatLanDisabled' });
      } else {
        window.addGameChat(null, t('chatServerRefused'), 'sys', { key: 'chatServerRefused' });
      }
    }
  }
}

function onDialog(sub) {
  // DialogMessage (type 66) : notificationText=1 — message d'information
  // libre du serveur (MOTD, annonces d'admin). Le client officiel l'affiche
  // dans une boite de dialogue ; cote web on le route vers le chat courant
  // (partie ou lobby) en ligne systeme + toast.
  const text = Proto.str(sub, 1);
  if (!text) return;
  if (S.amInGame && typeof window.addGameChat === 'function') {
    window.addGameChat(null, text, 'sys');
  } else {
    addChat(null, text, 'sys');
  }
  try { if (typeof window.showToast === 'function') window.showToast(text, { icon: '\u2139' }); } catch (e) {}
  return;
}

export { onStartKickPetition, onKickPetitionUpdate, onVoteKickReply,
         onEndKickPetition, onAskKickDenied, onInviteNotify,
         onRejectInvNotify, onChat, onTimeoutWarning, onChatReject, onDialog };

for (const [k, v] of Object.entries({ onStartKickPetition,
  onKickPetitionUpdate, onVoteKickReply, onEndKickPetition,
  onAskKickDenied, onInviteNotify, onRejectInvNotify, onChat,
  onTimeoutWarning, onChatReject, onDialog })) window[k] = v;
