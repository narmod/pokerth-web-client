// public/proto/index.mjs
// ─────────────────────────────────────────────────────────────────────────
// Friendly facade over the auto-generated PokerTH protobuf bundle.
//
// Two reasons this file exists:
//   1. Hide the verbose generated API behind helper functions that match
//      what the existing pokerth.js code already does (buildInit, parse,
//      etc.). This lets us migrate the rest of the codebase one call at
//      a time.
//   2. Provide stable named constants so callers never have to remember
//      magic numbers like `Type_InitMessage = 2`.
//
// References for field numbers and enum values:
//   https://github.com/pokerth/pokerth/blob/v2.0.7/pokerth.proto
// ─────────────────────────────────────────────────────────────────────────

// @ts-check

import * as pb from "./pokerth-bundle.mjs";

// Convenience aliases for the message types we use most.
export const PokerTHMessage    = pb.PokerTHMessage;
export const InitMessage       = pb.InitMessage;
export const AnnounceMessage   = pb.AnnounceMessage;
export const InitAckMessage    = pb.InitAckMessage;
export const ErrorMessage      = pb.ErrorMessage;
export const JoinNewGameMessage = pb.JoinNewGameMessage;
export const JoinExistingGameMessage = pb.JoinExistingGameMessage;
export const ChatRequestMessage = pb.ChatRequestMessage;
export const MyActionRequestMessage = pb.MyActionRequestMessage;
export const StartEventAckMessage = pb.StartEventAckMessage;

// Enum constants. We re-export the ones the client actually uses.
export const MessageType = pb.PokerTHMessage.PokerTHMessageType;   // Type_*
export const LoginType   = pb.InitMessage.LoginType;               // guestLogin=0, authenticatedLogin=1, unauthenticatedLogin=2
export const ServerType  = pb.AnnounceMessage.ServerType;          // serverTypeLAN=0, ...InternetNoAuth=1, ...InternetAuth=2
export const PlayerAction = pb.NetPlayerAction;                    // netActionFold=1, netActionCheck=2, ...
export const ErrorReason = pb.ErrorMessage.ErrorReason;            // initAuthFailure=3, initPlayerNameInUse=4, ...

// PokerTH build id composite : (clientType<<24)|(major<<16)|(minor<<8)|patch.
// ⚠ SOURCE DE VERITE : public/modules/net/proto.mjs + net/messages.mjs
// (buildInit y definit le BUILD_ID reellement envoye au serveur). Cette
// facade protobuf.js n'est PAS utilisee par le client en production —
// seulement par /proto/test.html. On la garde alignee pour eviter deux
// verites divergentes (elle affichait 2.0.6 alors que le client emettait
// 2.1.3, source de confusion en audit).
export const BUILD_ID = 0x01020103; // 16908547 = Qt-Widget 2.1.3 (= net/messages.mjs)

// ─────────────────────────────────────────────────────────────────────────
// Encoders — drop-in replacements for the manual builders in pokerth.js
// ─────────────────────────────────────────────────────────────────────────

/**
 * Build an InitMessage in any of the three login modes.
 *
 * @param {object} opts
 * @param {string} opts.nick       — player nickname (also used for auth)
 * @param {number} opts.major      — protocol major from the server Announce
 * @param {number} opts.minor      — protocol minor from the server Announce
 * @param {number} opts.login      — LoginType.guestLogin | authenticatedLogin | unauthenticatedLogin
 * @param {string} [opts.password] — only used when login === authenticatedLogin
 * @returns {Uint8Array} the wire-format bytes ready to be sent
 */
export function buildInit({ nick, major, minor, login, password }) {
    const init = InitMessage.create({
        requestedVersion: { majorVersion: major, minorVersion: minor },
        buildId: BUILD_ID,
        login,
        nickName: nick,
    });
    // For authenticated login, the password is sent in clientUserData as
    // UTF-8 bytes (max 256). TLS is mandatory at this point in the wire path.
    if (login === LoginType.authenticatedLogin && password) {
        const enc = new TextEncoder().encode(password);
        init.clientUserData = enc.length > 256 ? enc.slice(0, 256) : enc;
    }
    const msg = PokerTHMessage.create({
        messageType: MessageType.Type_InitMessage,
        initMessage: init,
    });
    return PokerTHMessage.encode(msg).finish();
}

/**
 * Build a ChatRequestMessage (lobby or in-game).
 *
 * @param {string} text
 * @param {number} [targetGameId]  — for in-game chat
 * @returns {Uint8Array}
 */
export function buildChat(text, targetGameId) {
    const chat = pb.ChatRequestMessage.create({ chatText: text });
    if (targetGameId !== undefined) chat.targetGameId = targetGameId;
    const msg = PokerTHMessage.create({
        messageType: MessageType.Type_ChatRequestMessage,
        chatRequestMessage: chat,
    });
    return PokerTHMessage.encode(msg).finish();
}

/**
 * Build a JoinExistingGameMessage.
 *
 * @param {number}  gameId
 * @param {object} [opts]
 * @param {string} [opts.password]
 * @param {boolean} [opts.autoLeave]
 * @param {boolean} [opts.spectateOnly]
 * @returns {Uint8Array}
 */
export function buildJoinGame(gameId, opts = {}) {
    const join = pb.JoinExistingGameMessage.create({ gameId });
    if (opts.password)     join.password = opts.password;
    if (opts.autoLeave)    join.autoLeave = true;
    if (opts.spectateOnly) join.spectateOnly = true;
    const msg = PokerTHMessage.create({
        messageType: MessageType.Type_JoinExistingGameMessage,
        joinExistingGameMessage: join,
    });
    return PokerTHMessage.encode(msg).finish();
}

/**
 * Build a StartEventAckMessage.
 *
 * @param {number} gameId
 * @returns {Uint8Array}
 */
export function buildStartEventAck(gameId) {
    const msg = PokerTHMessage.create({
        messageType: MessageType.Type_StartEventAckMessage,
        startEventAckMessage: pb.StartEventAckMessage.create({ gameId }),
    });
    return PokerTHMessage.encode(msg).finish();
}

/**
 * Build a MyActionRequestMessage (fold / check / call / bet / raise / allin).
 *
 * @param {number} gameId
 * @param {number} handNum
 * @param {number} gameState     — NetGameState enum value
 * @param {number} action        — NetPlayerAction enum value
 * @param {number} relativeBet
 * @returns {Uint8Array}
 */
export function buildMyAction(gameId, handNum, gameState, action, relativeBet) {
    const my = pb.MyActionRequestMessage.create({
        gameId,
        handNum,
        gameState,
        myAction: action,
        myRelativeBet: relativeBet,
    });
    const msg = PokerTHMessage.create({
        messageType: MessageType.Type_MyActionRequestMessage,
        myActionRequestMessage: my,
    });
    return PokerTHMessage.encode(msg).finish();
}

/**
 * Build a LeaveGameRequestMessage.
 *
 * @param {number} gameId
 * @returns {Uint8Array}
 */
export function buildLeaveGame(gameId) {
    const msg = PokerTHMessage.create({
        messageType: MessageType.Type_LeaveGameRequestMessage,
        leaveGameRequestMessage: pb.LeaveGameRequestMessage.create({ gameId }),
    });
    return PokerTHMessage.encode(msg).finish();
}

// ─────────────────────────────────────────────────────────────────────────
// Decoder
// ─────────────────────────────────────────────────────────────────────────

/**
 * Parse a single PokerTH frame (everything past the 4-byte length prefix
 * that the wire framing uses).
 *
 * @param {Uint8Array} bytes
 * @returns {object} the decoded PokerTHMessage instance
 */
export function decode(bytes) {
    return PokerTHMessage.decode(bytes);
}

/**
 * Pretty name of a message type (debugging).
 *
 * @param {number} typeId
 * @returns {string}
 */
export function typeName(typeId) {
    for (const [k, v] of Object.entries(MessageType)) {
        if (v === typeId) return k;
    }
    return `Unknown(${typeId})`;
}
