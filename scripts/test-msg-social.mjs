#!/usr/bin/env node
// Deterministic tests for public/modules/net/msg-social.mjs (ESM #9g-C2).
// Run: node scripts/test-msg-social.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  appendChild(c) { this.children.push(c); }, remove() {}, addEventListener() {},
  classList: { add() {}, remove() {} }, querySelector: () => null, querySelectorAll: () => [] }; }
const els = {};
globalThis.document = { readyState: 'complete', addEventListener() {}, removeEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  documentElement: { getAttribute: () => null },
  body: { appendChild() {}, removeChild() {} },
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: () => makeEl() };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.WebSocket = { OPEN: 1 };
globalThis.directWS = false;
const gameChats = []; window.addGameChat = (who, txt) => gameChats.push(txt);
let lobbyDings = 0; window.notifyLobbyChat = () => lobbyDings++;
window._isIgnored = () => false; // requis par addChat (chat.mjs)
window._chatTs = () => '[00:00:00]';
window.emT = (x) => x; window._emojiToHtml = (x) => x;

const { S } = await import('../public/modules/game/state.mjs');
const { Proto } = await import('../public/modules/net/proto.mjs');
const { MSG } = await import('../public/modules/net/messages.mjs');
const M = await import('../public/modules/net/msg-social.mjs');
const T = MSG.T;

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function subOf(inner) { return Proto.decode(Proto.encode(inner)); } // sub = sous-message décodé directement

S.myId = 5; S.players = { 5: 'Moi', 9: 'Bob' };
S.ws = { readyState: 1, send: () => {} };

// ── Kick petitions : le handler délègue à petitions.mjs (état S._pet)
S._pet = null; S.games = {}; S.amInGame = false; S.gId = 3; // même table que la pétition (sinon _petTick la rejette)
window._offlineMode = false;
let sub = subOf([[1, 0, 3], [2, 0, 77], [3, 0, 9], [4, 0, 5], [5, 0, 30], [6, 0, 2]]);
M.onStartKickPetition(sub);
ok(S._pet && S._pet.petitionId === 77 && S._pet.target === 5,
   'onStartKickPetition : pétition enregistrée (id 77, cible moi)');
if (S._pet && S._pet.timer) clearInterval(S._pet.timer);

// ── InviteNotify : seulement si l'invité, c'est moi
S._inv = null;
sub = subOf([[1, 0, 12], [2, 0, 5], [3, 0, 9]]);
M.onInviteNotify(sub);
ok(S._inv && S._inv.gameId === 12, 'onInviteNotify : invitation pour moi affichée (S._inv posé)');
S._inv = null;
if (els['game-invite-banner']) delete els['game-invite-banner'];
sub = subOf([[1, 0, 12], [2, 0, 999], [3, 0, 9]]);
M.onInviteNotify(sub);
ok(S._inv === null, 'onInviteNotify : invitation pour un autre → ignorée');

// onRejectInvNotify : no-op assumé
M.onRejectInvNotify(subOf([[1, 0, 1]]));
ok(true, 'onRejectInvNotify : no-op sans erreur');

// ── Chat : message normal d'autrui → addChat + son lobby (ctype 0)
const chatLines = [];
els['chat'] = makeEl(); // cible d'addChat (chat.mjs → #chat)
// addChat réel écrit dans le DOM stub ; on observe via son innerHTML

lobbyDings = 0;
function chatSub(pid, ctype, text) {
  return subOf([[2, 0, pid], [3, 0, ctype], [4, 2, new TextEncoder().encode(text)]]);
}
M.onChat(chatSub(9, 0, 'salut'));
ok(lobbyDings === 1, 'onChat : message lobby d\'autrui → notifyLobbyChat');
ok(els['chat'].children.length >= 1, 'onChat : ligne ajoutée au chat');

// Écho de mon propre message (ctype ≠ 3) → ignoré (déjà affiché en optimiste)
const before = els['chat'].children.length;
M.onChat(chatSub(5, 0, 'mon echo'));
ok(els['chat'].children.length === before, 'onChat : écho de mon message ignoré');

// Réaction /emoji d'autrui → interceptée, pas de ligne de chat
S._reactMuted = false; S.seats = [9]; S.seatData = { 9: {} };
const beforeR = els['chat'].children.length;
M.onChat(chatSub(9, 1, '/emoji 🎉'));
ok(els['chat'].children.length === beforeR, 'onChat : /emoji intercepté (aucune ligne de chat)');

// Ma propre réaction rediffusée → dédupliquée (pas d\'animation double, pas de ligne)
M.onChat(chatSub(5, 1, '[R]🔥'));
ok(els['chat'].children.length === beforeR, 'onChat : écho [R] de ma réaction ignoré');

// ── TimeoutWarning : sync du timer + message système + keepalive
S._timerSec = 0; S._timerTot = 10;
const sent = []; S.ws.send = (f) => sent.push(f);
sub = subOf([[1, 0, 1], [2, 0, 15]]);
M.onTimeoutWarning(sub);
ok(S._timerSec === 15 && S._timerTot === 15, 'onTimeoutWarning : timer resynchronisé (15 s > total)');
ok(sent.length === 1, 'onTimeoutWarning : keepalive auto envoyé');

// ── ChatReject : réaction rejetée en LAN → note locale discrète, pas de chat
S._lastMsgWasReaction = true; S._chatRejectShown = false; S._currentLoginMode = 'lan';
els['reaction-bar'] = makeEl();
sub = subOf([[1, 2, new TextEncoder().encode('no')]]);
M.onChatReject(sub);
ok(S._lastMsgWasReaction === false && els['reaction-bar'].children.length === 1,
   'onChatReject : réaction LAN → note locale dans la barre de réactions');

// Chat refusé en partie (serveur) → message système via window.addGameChat
S.amInGame = true; S._chatRejectShown = false; S._currentLoginMode = 'server';
gameChats.length = 0;
M.onChatReject(sub);
ok(gameChats.length === 1, 'onChatReject : refus en partie → addGameChat système');

// Ponts window
ok(window.onChat === M.onChat && window.onStartKickPetition === M.onStartKickPetition &&
   window.onChatReject === M.onChatReject, 'ponts window.* en place');

console.log(fail ? `\n${fail}/${n} ÉCHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
