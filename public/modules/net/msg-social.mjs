// ═══════════════════════════════════════════════════════════════════
// Handlers réseau — social (invitations, chat,
// avertissement de timeout) — chantier ESM #9g-C2. Chaque fonction =
// le corps EXACT de l'ancienne case de handleMsg (signature (sub),
// `break` retiré ; RejectInvNotify était une case vide, conservée en
// no-op documenté). Adaptations : _inviteShow (petitions.mjs),
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
import { _inviteShow } from './petitions.mjs';
import { handleIncomingReaction } from '../ui/reactions.mjs';
import { addChat } from '../ui/chat.mjs';

const T = MSG.T;

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
    if ((ctype === 0 || ctype === 4) && pid && pid !== S.myId && !_inGameScreen()) {
      try { if (typeof notifyLobbyChat === 'function') notifyLobbyChat(); } catch (_e) {}
    }
    // Mon propre message : déjà affiché en optimiste à l'envoi (classe 'mine').
    // Le serveur le rediffuse à tous, expéditeur compris → on ignore l'écho
    // pour ne pas afficher la ligne en double (broadcast ctype===3 conservé).
    // ── Routage par chatType (parité QML LobbyHandler ↔ GameHandler) ──
    //   0 lobby → panneau lobby seul · 1 partie → chat de partie seul ·
    //   2 bot → chat de partie si gameId présent (field 1), sinon lobby ·
    //   3 broadcast → les deux panneaux · 4 privé → conversation + lobby ·
    //   autres → lobby.
    const gid    = Proto.u32(sub, 1);
    // chatTypePrivate (4) : stocké dans la conversation persistante ET
    // affiché dans le chat du lobby en « Nom(pm): texte » — le client QML
    // fait les deux (LobbyHandler::onPrivateChatMessage pousse la ligne
    // dans le log en plus de la persister). Le nom du partenaire est celui
    // de l'expéditeur ; un pid inconnu (#123) ne peut pas servir de clé de
    // conversation, on ne persiste alors rien et la ligne reste seule.
    if (ctype === 4) {
      const _pmName = (who && String(who).charAt(0) !== '#') ? who : '';
      if (_pmName) {
        try { if (typeof window._pmOnIncoming === 'function') window._pmOnIncoming(_pmName, text); } catch (_e) {}
      }
      addChat(who, text, (cls ? cls + ' ' : '') + 'pm');
      return;
    }
    const toGame = ctype === 1 || ctype === 3 || (ctype === 2 && gid > 0);
    const toLobby = !toGame || ctype === 3;
    if (toGame && typeof window.addGameChat === 'function') window.addGameChat(who, text, cls);
    if (toLobby) addChat(who, text, cls);
  }
}

function onTimeoutWarning(sub) {
  // timeoutReason (field 1): 0 = no data received (idle connection),
  // 1 = admin of an open game that is about to expire, 2 = did not act in the
  // game and is about to be removed. Each one gets its own wording, as in the
  // QML popup -- the three situations have very different consequences.
  const reason = Proto.u32(sub, 1);
  const sec = Proto.u32(sub, 2);
  S._timerSec = sec; // Sync avec le serveur
  // Si le serveur donne plus de temps que prévu, ajuster le total
  if (sec > S._timerTot) S._timerTot = sec;
  addChat(null, t('timerHurry', { s: sec }), 'sys', { key: 'timerHurry', params: { s: sec } });
  // Parité QML 2.1.6 (GameHandler::eventFilter) : PAS de ResetTimeout
  // automatique ici. L'ancienne réponse aveugle neutralisait le kick AFK du
  // serveur — un onglet oublié gardait sa session (et son siège) pour
  // toujours, à rebours de la politique que les clients QML/widget/Android
  // subissent. Le reset part désormais UNIQUEMENT sur activité utilisateur
  // réelle (_afkActivity ci-dessous). Après une warning, le prochain geste
  // réarme immédiatement (le rate-limit est court-circuité) ; un joueur
  // réellement absent est kické comme partout ailleurs.
  S._afkWarned = true;
  // A chat line is easy to miss, especially in the lobby where nobody is
  // watching the log -- reported on the forum as "the client disconnects from
  // the lobby and just stays there". The QML client plays a sound and opens a
  // modal countdown on top of every page; we now do the same. The chat line
  // stays: it leaves a trace in the log once the popup is gone.
  try { window.notifyMyTurn && window.notifyMyTurn(); } catch (e) {}
  _towShow(reason, sec);
}

// ── Timeout warning popup (parity: timeoutWarningPopup, pokerth.qml) ─────
// Counts down once per second, then switches to the "expired" wording and
// disables OK -- at that point the server has already made its decision and a
// ResetTimeout would be pointless. Escape closes without resetting anything
// (QML: closePolicy CloseOnEscape), so dismissing the popup is not the same as
// answering it.
let _towTimer = 0;

function _towText(reason, sec, expired) {
  if (expired) return reason === 2 ? t('timeoutWarnExpiredGame') : t('timeoutWarnExpired');
  if (reason === 1) return t('timeoutWarnAdmin', { s: sec });
  if (reason === 2) return t('timeoutWarnAfk', { s: sec });
  return t('timeoutWarnIdle', { s: sec });
}

function _towClose() {
  if (_towTimer) { clearInterval(_towTimer); _towTimer = 0; }
  const modal = document.getElementById('timeout-warn-modal');
  if (modal) modal.style.display = 'none';
}

function _towShow(reason, sec) {
  const modal = document.getElementById('timeout-warn-modal');
  const msgEl = document.getElementById('tow-msg');
  if (!modal || !msgEl) return;
  const hintEl = document.getElementById('tow-hint');
  const okEl = document.getElementById('tow-ok');
  let left = sec > 0 ? sec : 0;
  if (_towTimer) { clearInterval(_towTimer); _towTimer = 0; }
  const paint = function (expired) {
    msgEl.textContent = _towText(reason, left, expired);
    if (hintEl) hintEl.style.display = expired ? 'none' : '';
    if (okEl) okEl.disabled = !!expired;
  };
  paint(left <= 0);
  modal.style.display = 'flex';
  if (left > 0) {
    _towTimer = setInterval(function () {
      left--;
      if (left <= 0) { clearInterval(_towTimer); _towTimer = 0; paint(true); }
      else paint(false);
    }, 1000);
  }
}

// OK: the deliberate "I am still here" click. Routed through _afkActivity so
// there is a single place that emits ResetTimeout; S._afkWarned is set, which
// short-circuits the 3 min rate limit, so the packet really does leave now.
function _timeoutWarnAck() {
  _towClose();
  _afkActivity();
}

try {
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    const m = document.getElementById('timeout-warn-modal');
    if (m && m.style.display === 'flex') _towClose();
  });
} catch (e) {}

window._timeoutWarnAck = _timeoutWarnAck;
// Called from the socket's onclose: the warning belongs to a session that no
// longer exists, and leaving a dead countdown on screen would be worse than
// the silence it was meant to fix (QML does the same in onConnectionFailed).
window._timeoutWarnClose = _towClose;

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

// ── AFK : ResetTimeout sur activité réelle (parité QML 2.1.6) ──────────────
// Équivalent web de GameHandler::eventFilter + isUserActivityEvent : le QML
// compte MouseButtonPress / KeyPress / Shortcut / Wheel / TouchBegin+Update.
// Ici, des listeners document en capture couvrent nativement souris, clavier
// (F-touches et raccourcis inclus — pas de piège QShortcutMap dans un
// navigateur), molette et touch. Rate-limit identique au QML : 3 min
// (kAfkResetIntervalMs). Après un TimeoutWarning (S._afkWarned), le premier
// geste envoie le reset immédiatement, sans attendre la fenêtre.
// Conditions d'envoi : WS ouvert, session authentifiée, pas en Training
// (aucun serveur à rassurer — et surtout ne pas réveiller le moteur local).
const AFK_RESET_INTERVAL_MS = 3 * 60 * 1000; // = kAfkResetIntervalMs QML
let _afkLastReset = 0;
function _afkActivity() {
  try {
    if (window._offlineMode) return;
    if (!S.ws || S.ws.readyState !== WebSocket.OPEN || !S._wasAuthenticated) return;
    const now = Date.now();
    if (!S._afkWarned && now - _afkLastReset < AFK_RESET_INTERVAL_MS) return;
    _afkLastReset = now;
    S._afkWarned = false;
    send(Proto.encode([[1,0,68],[69,2,new Uint8Array(0)]])); // ResetTimeoutMessage
  } catch (e) {}
}
try {
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, _afkActivity, { capture: true, passive: true });
  });
} catch (e) {}

export { onInviteNotify,
         onRejectInvNotify, onChat, onTimeoutWarning, onChatReject, onDialog };

for (const [k, v] of Object.entries({
  onInviteNotify, onRejectInvNotify, onChat,
  onTimeoutWarning, onChatReject, onDialog })) window[k] = v;
