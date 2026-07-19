// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/net/messages.mjs
//
// MSG — constructeurs et parseur des messages du protocole PokerTH
// (PokerTHMessage.PokerTHMessageType) : Init/Join/Action/Chat/CreateGame…
// et l'authentification SCRAM-SHA-1 (client-first/client-final, HMAC via
// crypto.subtle — contexte sécurisé requis, comme avant). Dépend uniquement
// du codec Proto (modules/net/proto.mjs).
//
// Historique : extrait de public/pokerth.js (extraction #4 du plan
// docs/ESM_PLAN.md), au verbatim — seule différence : Proto arrive par un
// import ES explicite au lieu du global. Alias window.MSG conservé pour les
// ~32 appelants legacy. window._pthScram (état SCRAM partagé avec le flux
// InitAck du monolithe) reste géré tel quel.
// ─────────────────────────────────────────────────────────────────────────

import Proto from './proto.mjs';

// ═══════════════════════════════════════════════════════════
//  MESSAGES POKERTH
//  Types définis dans PokerTHMessage.PokerTHMessageType (proto)
// ═══════════════════════════════════════════════════════════
const MSG = (() => {
  // Type IDs → numéro de champ dans PokerTHMessage
  const TYPE_FIELD = {
    1:2, 2:3, 3:4, 4:5, 5:6, 6:7,           // Announce,Init,AuthChallenge,…,InitAck
    7:8, 8:9, 9:10, 10:11, 11:12,             // AvatarRequest, AvatarHeader, AvatarData, AvatarEnd, UnknownAvatar
    12:13,                                     // PlayerList
    13:14, 14:15, 15:16, 16:17, 17:18,        // GameList*
    18:19, 19:20,                              // PlayerInfo req/reply
    21:22, 22:23, 23:24, 24:25, 25:26,        // Join*
    26:27, 27:28, 28:29, 29:30,               // GamePlayer*
    32:33, 33:34, 34:35, 35:36,                // Invite*: InvitePlayerToGame, InviteNotify, RejectGameInvitation, RejectInvNotify
    36:37, 37:38, 38:39,                       // StartEvent, StartEventAck, GameStartInitial
    40:41, 41:42, 42:43,                       // HandStart, PlayersTurn, MyActionRequest
    43:44,                                     // YourActionRejected
    44:45,                                     // PlayersActionDone
    45:46, 46:47, 47:48,                       // DealFlop, DealTurn, DealRiver
    48:49,                                     // AllInShowCards
    49:50, 50:51, 53:54,                       // EndOfHandShow, EndOfHandHide, EndOfGame
    51:52, 52:53,                              // ShowMyCardsRequest + AfterHandShowCards
    62:63, 63:64, 64:65, 65:66,               // Statistics, Chat*
    67:68, 68:69,                              // TimeoutWarning, ResetTimeout
    69:70, 70:71, 71:72, 72:73,               // Report Avatar/Game + Acks
    73:74,                                     // Error
    76:77, 77:78,                              // AdminBanPlayer + Ack (kickban total)
    78:79, 79:80, 80:81, 81:82, 55:56, 56:57, 57:58, 58:59, 59:60, 60:61, 61:62,              // Spectator*
  };

  const T = {
    Announce:1, Init:2, AuthChallenge:3, AuthClientResp:4, AuthServerVerif:5, InitAck:6,
    // Avatar download flow (step 2 of pokerth.net avatar feature):
    // client sends AvatarRequest with a unique requestId + 16-byte hash,
    // server replies with AvatarHeader (size+type), then 1..N
    // AvatarData chunks (~256 bytes each), then AvatarEnd. If the server
    // does not have the avatar, it replies with UnknownAvatar instead.
    AvatarRequest:7, AvatarHeader:8, AvatarData:9, AvatarEnd:10, UnknownAvatar:11,
    PlayerList:12,
    GameListNew:13, GameListUpdate:14, GameListPlayerJoined:15, GameListPlayerLeft:16,
    GameListAdminChanged:17,
    PlayerInfoRequest:18, PlayerInfoReply:19,
    JoinExisting:21, JoinNew:22, RejoinExisting:23,
    JoinNew:22, JoinGameAck:24, JoinGameFailed:25,
    GamePlayerJoined:26, GamePlayerLeft:27, GameAdminChanged:28, RemovedFromGame:29,
    InvitePlayerToGame:32, InviteNotify:33, RejectGameInvitation:34, RejectInvNotify:35,
    StartEvent:36, StartEventAck:37, GameStartInitial:38,
    HandStart:40, PlayersTurn:41, MyActionRequest:42,
    YourActionRejected:43,
    PlayersActionDone:44, DealFlop:45, DealTurn:46, DealRiver:47,
    AllInShowCards:48, EndOfHandShow:49, EndOfHandHide:50, EndOfGame:53,
    ShowMyCardsRequest:51, AfterHandShowCards:52,
    Statistics:62, ChatRequest:63, Chat:64, ChatReject:65,
    TimeoutWarning:67, ResetTimeout:68, Error:73,
    ReportAvatar:69, ReportAvatarAck:70, ReportGame:71, ReportGameAck:72,
    AdminBanPlayer:76, AdminBanPlayerAck:77,
    GameListSpectatorJoined:78, GameListSpectatorLeft:79,
    // Spectators on the table we're currently in (or watching).
    // Type 80/81 — separate from the lobby-level 78/79 which track
    // spectator counts across all tables.
    GameSpectatorJoined:80, GameSpectatorLeft:81,
    AskKickPlayer:55, AskKickDenied:56, StartKickPetition:57, VoteKickRequest:58,
    VoteKickReply:59, KickPetitionUpdate:60, EndKickPetition:61,
  };

  // Parse un buffer en {type, sub: champs du sous-message}
  function parse(buf) {
    const fields = Proto.decode(buf);
    const type = Proto.u32(fields, 1);
    const fn = TYPE_FIELD[type];
    const sub = fn && fields[fn] ? Proto.decode(fields[fn][0]) : {};
    return { type, sub };
  }

  // ─── SCRAM-SHA-1 (RFC 5802) — authenticated login to pokerth.net ──────
  // The official client authenticates via libgsasl SCRAM-SHA-1
  // (SessionData::CreateClientAuthSession(Gsasl*, user, password)). We reproduce
  // the same exchange with Web Crypto so account login is instant like the
  // native client, instead of the old empty-response shortcut that pokerth.net
  // no longer accepts directly:
  //   InitMessage.clientUserData = client-first-message  "n,,n=user,r=cnonce"
  //   AuthServerChallengeMessage = server-first-message  "r=..,s=..,i=.."
  //   AuthClientResponseMessage  = client-final-message  "c=biws,r=..,p=proof"
  // Maths: PBKDF2-SHA1 / HMAC-SHA1 / SHA1 (all in SubtleCrypto). Password is used
  // as-is; SASLprep of non-ASCII passwords is not implemented yet.
  const _scEnc = new TextEncoder();
  const _scDec = new TextDecoder();
  function _scNonce() {
    const r = new Uint8Array(18); crypto.getRandomValues(r);
    let bin = ''; for (let i = 0; i < r.length; i++) bin += String.fromCharCode(r[i]);
    return btoa(bin); // base64 is SCRAM-safe (contains no comma)
  }
  function _scName(x) { return String(x).replace(/=/g, '=3D').replace(/,/g, '=2C'); }
  function _scB64ToBytes(b64) {
    const bin = atob(b64); const o = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) o[i] = bin.charCodeAt(i); return o;
  }
  function _scBytesToB64(b) {
    let bin = ''; for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]); return btoa(bin);
  }
  async function _scHmac(keyBytes, dataBytes) {
    const k = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    return new Uint8Array(await crypto.subtle.sign('HMAC', k, dataBytes));
  }
  async function _scSha1(b) { return new Uint8Array(await crypto.subtle.digest('SHA-1', b)); }
  async function _scPbkdf2(passBytes, saltBytes, iters) {
    const k = await crypto.subtle.importKey('raw', passBytes, 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBytes, iterations: iters, hash: 'SHA-1' }, k, 160));
  }
  function scramClientFirst(username) {
    const cnonce = _scNonce();
    const bare = 'n=' + _scName(username) + ',r=' + cnonce;
    return { clientFirst: 'n,,' + bare, clientFirstBare: bare, cnonce: cnonce };
  }
  // Find the server-first-message among a decoded message's fields, so we don't
  // depend on its exact field number (it looks like "r=..,s=..,i=..").
  function scramFindServerFirst(subObj) {
    for (const k in subObj) {
      if (!Object.prototype.hasOwnProperty.call(subObj, k)) continue;
      const v = subObj[k] && subObj[k][0];
      if (v instanceof Uint8Array) {
        try {
          const t = _scDec.decode(v);
          if (/(^|,)r=/.test(t) && /,s=/.test(t) && /,i=\d/.test(t)) return t;
        } catch (e) {}
      }
    }
    return '';
  }
  async function scramClientFinal(password, clientFirstBare, serverFirst) {
    const a = {};
    serverFirst.split(',').forEach(function (kv) {
      const i = kv.indexOf('='); if (i > 0) a[kv.slice(0, i)] = kv.slice(i + 1);
    });
    const rnonce = a.r || '';
    const salt = _scB64ToBytes(a.s || '');
    const iters = parseInt(a.i || '0', 10);
    if (!rnonce || !salt.length || !(iters > 0)) throw new Error('bad SCRAM server-first');
    const finalBare = 'c=biws,r=' + rnonce;            // biws = base64("n,,")
    const authMsg = _scEnc.encode(clientFirstBare + ',' + serverFirst + ',' + finalBare);
    const salted = await _scPbkdf2(_scEnc.encode(String(password)), salt, iters);
    const clientKey = await _scHmac(salted, _scEnc.encode('Client Key'));
    const storedKey = await _scSha1(clientKey);
    const clientSig = await _scHmac(storedKey, authMsg);
    const proof = new Uint8Array(clientKey.length);
    for (let i = 0; i < proof.length; i++) proof[i] = clientKey[i] ^ clientSig[i];
    const serverKey = await _scHmac(salted, _scEnc.encode('Server Key'));
    const serverSig = await _scHmac(serverKey, authMsg);
    return { clientFinal: finalBare + ',p=' + _scBytesToB64(proof), serverSignatureB64: _scBytesToB64(serverSig) };
  }

  // Construit un InitMessage (guest, unauth ou authenticated user)
  // buildId = (CLIENT_TYPE_QT_WIDGET<<24)|(MAJOR<<16)|(MINOR<<8)|REV.
  // POLITIQUE SERVEUR (game_defs.h, verifiee sur le tag v2.1.2 du 2026-07-08) :
  // MIN_BUILD_ID_* = release PRECEDENTE ; seules la release courante et la
  // precedente sont acceptees. En 2.1.3 : min Qt-Widget = 0x01020102 (2.1.2).
  // => A CHAQUE release PokerTH, bumper BUILD_ID ci-dessous sinon
  // ERR_NET_VERSION_NOT_SUPPORTED (« Version incompatible »").
  // On s'identifie comme le client officiel Qt-Widget courant,
  // exactement comme le client QML le fait (CLIENT_TYPE_QT_WIDGET tant que
  // pokerth.net n'expose pas de type dédié). TODO sp0ck : demander un
  // CLIENT_TYPE_WEB (0x03) officiel.
  // Auth (loginType=1) : password en clair dans clientUserData (tag 7),
  //   sécurisé par TLS (mandatory côté serveur v2.0+).
  //   Ref: pokerth/src/net/clientstate.cpp:1465-1469 + serverlobbythread.cpp:1255-1256
  function buildInit(nick, major, minor, loginType, password, serverPass) {
    loginType = loginType !== undefined ? loginType : 0;
    const BUILD_ID = 16908547; // 0x01020103 = Qt-Widget 2.1.3 (min serveur 2.1.3 : 0x01020102 = 2.1.2)
    const ver = Proto.encode([[1,0,major],[2,0,minor]]);
    const fields = [
      [1,2,ver],       // requestedVersion (= protocolVersion from Announce)
      [2,0,BUILD_ID],  // buildId composite: (type<<24)|(major<<16)|(minor<<8)|patch
      [5,0,loginType], // login: 0=guestLogin, 1=authenticatedLogin, 2=unauthenticatedLogin
      [6,2,nick],      // nickName (utilisé aussi pour authenticated login)
    ];
    // Mot de passe SERVEUR (authServerPassword, champ 4, string). Le serveur
    // le vérifie pour TOUS les types de login sur un build non-officiel
    // (config ServerPassword) — cf. serverlobbythread.cpp HandleNetPacketInit,
    // AVANT la branche guest/unauth/auth. Vide/absent → champ totalement omis,
    // pour qu'un serveur sans mot de passe voie "" == "" et accepte. Ignoré
    // par pokerth.net (build officiel : tout le bloc est compilé out).
    if (serverPass) {
      fields.push([4, 2, String(serverPass)]); // authServerPassword
    }
    // Authenticated login : clientUserData (tag 7) carries the SCRAM-SHA-1
    // *client-first-message*. NOTE: real SCRAM is temporarily DISABLED — our
    // proof was rejected by pokerth.net (the password->secret derivation needs
    // to be matched against the PokerTH source). Until then we use the legacy
    // path that connects (password in clientUserData + empty AuthClientResponse).
    if (loginType === 1 && password) {
      try { window._pthScram = null; } catch (e) {}
      let pwd = String(password);
      const enc = new TextEncoder().encode(pwd);
      if (enc.length > 256) {
        console.warn('[buildInit] password > 256 bytes UTF-8, truncated');
        pwd = new TextDecoder().decode(enc.slice(0, 256));
      }
      fields.push([7, 2, pwd]); // clientUserData = password (legacy)
    }
    // PokerTH avatar UPLOAD (scope A): advertise the prepared custom image's
    // MD5 so the server requests the bytes and relays the avatar to official
    // clients. InitMessage field 8 (avatarHash).
    try {
      var _up = (typeof window !== 'undefined') ? window._pthMyUpload : null;
      if (_up && _up.hashBytes && _up.hashBytes.length === 16) fields.push([8, 2, _up.hashBytes]);
    } catch(e) {}
    const init = Proto.encode(fields);
    return Proto.encode([[1,0,T.Init],[3,2,init]]);
  }

  // Chat lobby
  function buildChat(text) {
    const req = Proto.encode([[3,2,text]]);
    return Proto.encode([[1,0,T.ChatRequest],[64,2,req]]);
  }

  // Chat scoped to a specific table (targetGameId = field 1). The
  // server admin bot uses this scoping to know whether to interpret
  // a leading "/" as a game-admin command (notably /kick <name>).
  function buildGameChat(gameId, text) {
    const req = Proto.encode([[1,0,gameId],[3,2,text]]);
    return Proto.encode([[1,0,T.ChatRequest],[64,2,req]]);
  }

  // Rejoindre une table existante
  function buildJoin(gameId) {
    const join = Proto.encode([[1,0,gameId]]);
    return Proto.encode([[1,0,T.JoinExisting],[22,2,join]]);
  }


  // JoinExistingGameMessage: gameId=1, password=2, autoLeave=3, spectateOnly=4
  function buildJoinGame(gameId, spectateOnly, password) {
    // JoinExistingGameMessage per proto:
    //   field 1: gameId       (required uint32)
    //   field 2: password     (optional string)
    //   field 3: autoLeave    (optional bool, default false)
    //   field 4: spectateOnly (optional bool, default false)
    //
    // The previous version set autoLeave=true whenever the caller asked
    // for spectate. That's wrong: autoLeave has nothing to do with
    // spectator mode (it tells the server 'kick me out of any other
    // games I'm in'). Sending autoLeave=true alongside a spectate request
    // was confusing the server enough that it never replied with
    // JoinGameAck — the 'Joining…' status hung forever.
    //
    // Emit only the fields the caller actually requested:
    const fields = [[1, 0, gameId]];
    if (password) fields.push([2, 2, password]);
    if (spectateOnly) fields.push([4, 0, 1]);
    const msg = Proto.encode(fields);
    return Proto.encode([[1,0,T.JoinExisting],[22,2,msg]]);
  }

  // RejoinExistingGameMessage: gameId=1, autoLeave=2 — message type 23,
  // envelope field 24. Reclaims the seat the server held after we dropped
  // (restores stack/position) instead of joining the table fresh.
  function buildRejoinGame(gameId) {
    const msg = Proto.encode([[1, 0, gameId]]);
    return Proto.encode([[1,0,T.RejoinExisting],[24,2,msg]]);
  }

  // StartEventAckMessage: gameId=1
  function buildStartEventAck(gameId) {
    const msg = Proto.encode([[1,0,gameId]]);
    return Proto.encode([[1,0,T.StartEventAck],[38,2,msg]]);
  }

  // MyActionRequestMessage: gameId=1, handNum=2, gameState=3, myAction=4, myRelativeBet=5
  function buildMyAction(gameId, handNum, gameState, action, bet) {
    const msg = Proto.encode([
      [1,0,gameId],
      [2,0,handNum],
      [3,0,gameState],
      [4,0,action],
      [5,0,bet || 0],
    ]);
    return Proto.encode([[1,0,T.MyActionRequest],[43,2,msg]]);
  }

  // Build create/join new game (JoinNewGameMessage, type 22)
  function buildCreateGame(name, maxPlayers, smallBlind, startMoney, timeout, opts) {
    opts = opts || {};
    const raiseMode    = opts.raiseMode    || 1;
    const raiseEvery   = opts.raiseEvery   || 7;
    const endRaiseMode = opts.endRaiseMode || 1;
    const endRaiseVal  = opts.endRaiseValue|| 0;
    const guiSpeed     = opts.guiSpeed     || 5;
    const delayHands   = opts.delayHands   || 7;
    const gameType     = opts.gameType     || 1;
    // allowSpectators: proto field 15, optional bool, default true server-side.
    // We forward the bit explicitly so the UI can flip it.
    // - When opts.allowSpectators is undefined (older callers): omit the
    //   field so the server's default of true applies.
    // - When opts.allowSpectators is false: emit [15, 0, 0].
    // - When opts.allowSpectators is true: emit [15, 0, 1] (explicit, in
    //   case a future server changes the default).
    const allowSpec    = (typeof opts.allowSpectators === 'boolean')
                         ? (opts.allowSpectators ? 1 : 0)
                         : null;
    // manualBlinds : proto champ 14, repeated uint32 [packed = true] →
    // wire type 2 (length-delimited) contenant les varints concaténés.
    // Sémantique serveur (netpacket.cpp) : liste non vide = MANUAL_BLINDS_ORDER,
    // et endRaiseMode (champ 7) devient le comportement APRÈS la liste.
    let manualBlindsBytes = null;
    if (opts.manualBlinds && opts.manualBlinds.length) {
      const mb = [];
      for (const v of opts.manualBlinds) mb.push(...Proto.encodeVarint(v >>> 0));
      manualBlindsBytes = new Uint8Array(mb);
    }
    const gameInfo = Proto.encode([
      [1,  2, name || 'WebGame'],
      [2,  0, gameType],
      [3,  0, maxPlayers||2],
      [4,  0, raiseMode],
      raiseMode === 1 ? [5, 0, raiseEvery] : [6, 0, raiseEvery],
      [7,  0, endRaiseMode],
      ...(endRaiseMode === 2 ? [[8, 0, endRaiseVal]] : []),
      [9,  0, guiSpeed],
      [10, 0, delayHands],
      [11, 0, timeout||30],
      [12, 0, smallBlind||10],
      [13, 0, startMoney||3000],
      ...(manualBlindsBytes ? [[14, 2, manualBlindsBytes]] : []),
      ...(allowSpec !== null ? [[15, 0, allowSpec]] : []),
    ]);
    const joinFields = [[1, 2, gameInfo]];
    if (opts.password) joinFields.push([2, 2, opts.password]);
    const msg = Proto.encode(joinFields);
    return Proto.encode([[1, 0, 22], [23, 2, msg]]);
  }

  function buildAuthResponse(token) {
    const tok = (token instanceof Uint8Array) ? token
              : (typeof token === 'string') ? _scEnc.encode(token)
              : new Uint8Array(0);
    const msg = Proto.encode([[1, 2, tok]]);
    return Proto.encode([[1, 0, T.AuthClientResp], [5, 2, msg]]);
  }

  // StartEventMessage with fillWithComputerPlayers
  function buildStartWithBots(gameId, fill) {
    const msg = Proto.encode([[1,0,gameId],[2,0,0],[3,0,fill?1:0]]);
    return Proto.encode([[1,0,36],[37,2,msg]]);
  }

  // LeaveGameRequestMessage
  function buildLeaveGame(gameId) {
    const msg = Proto.encode([[1,0,gameId]]);
    return Proto.encode([[1,0,31],[32,2,msg]]);
  }

  // KickPlayerRequestMessage (type 30, sub-field 31). Admin only.
  // The server replies with GamePlayerLeft (leftKicked) broadcast to
  // all clients and a RemovedFromGame (kickedFromGame) to the kicked
  // player. We don't need to await a direct ack — the existing handlers
  // already update the seat list when they see GamePlayerLeft.
  function buildKickPlayer(gameId, playerId) {
    const msg = Proto.encode([[1,0,gameId],[2,0,playerId]]);
    return Proto.encode([[1,0,30],[31,2,msg]]);
  }

  // ShowMyCardsRequestMessage (type 51, champ enveloppe 52) : corps VIDE.
  // Fenêtre WaitNextHand du serveur (entre EndOfHand et la main suivante) :
  // n'importe quel joueur de la partie peut montrer ses cartes ; le serveur
  // rediffuse AfterHandShowCardsMessage à tous (cf. servergamestate.cpp).
  function buildShowMyCards() {
    return Proto.encode([[1,0,51],[52,2,Proto.encode([])]]);
  }

  // AdminBanPlayerMessage (type 76, champ enveloppe 77) : banPlayerId=1.
  // « Kickban total » — réservé aux admins pokerth.net (playerRights=3),
  // comme Lobby.adminBanPlayer du client QML (PlayerListItem, bible §16).
  function buildAdminBanPlayer(playerId) {
    const msg = Proto.encode([[1,0,playerId]]);
    return Proto.encode([[1,0,76],[77,2,msg]]);
  }

  // AskKickPlayerMessage (type 55, env field 56): gameId=1, playerId=2.
  // Asks the server to open a community vote-kick petition. The server
  // answers AskKickDenied if not allowed, else broadcasts StartKickPetition.
  function buildAskKickPlayer(gameId, playerId) {
    const msg = Proto.encode([[1,0,gameId],[2,0,playerId]]);
    return Proto.encode([[1,0,T.AskKickPlayer],[56,2,msg]]);
  }
  // VoteKickRequestMessage (type 58, env field 59): gameId=1, petitionId=2,
  // voteKick=3 (bool). Casts our vote on a running petition.
  function buildVoteKick(gameId, petitionId, voteYes) {
    const msg = Proto.encode([[1,0,gameId],[2,0,petitionId],[3,0,voteYes?1:0]]);
    return Proto.encode([[1,0,T.VoteKickRequest],[59,2,msg]]);
  }

  // RejectGameInvitationMessage (type 34, env field 35): gameId=1, myRejectReason=2.
  //   reason: 0 = rejectReasonNo (polite decline), 1 = rejectReasonBusy.
  function buildRejectInvite(gameId, reason) {
    const msg = Proto.encode([[1,0,gameId],[2,0,reason?reason:0]]);
    return Proto.encode([[1,0,T.RejectGameInvitation],[35,2,msg]]);
  }
  // InvitePlayerToGameMessage (type 32, env field 33): gameId=1, playerId=2.
  // Outgoing invite — ask the server to invite <playerId> to <gameId>.
  function buildInvitePlayer(gameId, playerId) {
    const msg = Proto.encode([[1,0,gameId],[2,0,playerId]]);
    return Proto.encode([[1,0,T.InvitePlayerToGame],[33,2,msg]]);
  }
  return { T, parse, scramClientFirst, scramClientFinal, scramFindServerFirst, buildInit, buildChat, buildGameChat, buildJoin, buildJoinGame, buildRejoinGame, buildStartEventAck, buildMyAction, buildCreateGame, buildLeaveGame, buildStartWithBots, buildKickPlayer, buildShowMyCards, buildAdminBanPlayer, buildAskKickPlayer, buildVoteKick, buildRejectInvite, buildInvitePlayer };
})();

// ─── Exports ES + alias legacy ───────────────────────────────────────────
export default MSG;
export { MSG };
if (typeof window !== 'undefined') window.MSG = MSG;
