/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "./protobuf-minimal.mjs";

const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const NetGameMode = $root.NetGameMode = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[1] = "netGameCreated"] = 1;
    values[valuesById[2] = "netGameStarted"] = 2;
    values[valuesById[3] = "netGameClosed"] = 3;
    return values;
})();

export const NetGameState = $root.NetGameState = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "netStatePreflop"] = 0;
    values[valuesById[1] = "netStateFlop"] = 1;
    values[valuesById[2] = "netStateTurn"] = 2;
    values[valuesById[3] = "netStateRiver"] = 3;
    values[valuesById[4] = "netStatePreflopSmallBlind"] = 4;
    values[valuesById[5] = "netStatePreflopBigBlind"] = 5;
    return values;
})();

export const NetPlayerAction = $root.NetPlayerAction = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "netActionNone"] = 0;
    values[valuesById[1] = "netActionFold"] = 1;
    values[valuesById[2] = "netActionCheck"] = 2;
    values[valuesById[3] = "netActionCall"] = 3;
    values[valuesById[4] = "netActionBet"] = 4;
    values[valuesById[5] = "netActionRaise"] = 5;
    values[valuesById[6] = "netActionAllIn"] = 6;
    return values;
})();

export const NetPlayerState = $root.NetPlayerState = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "netPlayerStateNormal"] = 0;
    values[valuesById[1] = "netPlayerStateSessionInactive"] = 1;
    values[valuesById[2] = "netPlayerStateNoMoney"] = 2;
    return values;
})();

export const NetPlayerInfoRights = $root.NetPlayerInfoRights = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[1] = "netPlayerRightsGuest"] = 1;
    values[valuesById[2] = "netPlayerRightsNormal"] = 2;
    values[valuesById[3] = "netPlayerRightsAdmin"] = 3;
    return values;
})();

export const NetAvatarType = $root.NetAvatarType = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[1] = "netAvatarImagePng"] = 1;
    values[valuesById[2] = "netAvatarImageJpg"] = 2;
    values[valuesById[3] = "netAvatarImageGif"] = 3;
    return values;
})();

export const NetGameInfo = $root.NetGameInfo = (() => {

    function NetGameInfo(properties) {
        this.manualBlinds = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    NetGameInfo.prototype.gameName = "";
    NetGameInfo.prototype.netGameType = 1;
    NetGameInfo.prototype.maxNumPlayers = 0;
    NetGameInfo.prototype.raiseIntervalMode = 1;
    NetGameInfo.prototype.raiseEveryHands = 0;
    NetGameInfo.prototype.raiseEveryMinutes = 0;
    NetGameInfo.prototype.endRaiseMode = 1;
    NetGameInfo.prototype.endRaiseSmallBlindValue = 0;
    NetGameInfo.prototype.proposedGuiSpeed = 0;
    NetGameInfo.prototype.delayBetweenHands = 0;
    NetGameInfo.prototype.playerActionTimeout = 0;
    NetGameInfo.prototype.firstSmallBlind = 0;
    NetGameInfo.prototype.startMoney = 0;
    NetGameInfo.prototype.manualBlinds = $util.emptyArray;
    NetGameInfo.prototype.allowSpectators = true;

    NetGameInfo.create = function create(properties) {
        return new NetGameInfo(properties);
    };

    NetGameInfo.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(10).string(message.gameName);
        writer.uint32(16).int32(message.netGameType);
        writer.uint32(24).uint32(message.maxNumPlayers);
        writer.uint32(32).int32(message.raiseIntervalMode);
        if (message.raiseEveryHands != null && Object.hasOwnProperty.call(message, "raiseEveryHands"))
            writer.uint32(40).uint32(message.raiseEveryHands);
        if (message.raiseEveryMinutes != null && Object.hasOwnProperty.call(message, "raiseEveryMinutes"))
            writer.uint32(48).uint32(message.raiseEveryMinutes);
        writer.uint32(56).int32(message.endRaiseMode);
        if (message.endRaiseSmallBlindValue != null && Object.hasOwnProperty.call(message, "endRaiseSmallBlindValue"))
            writer.uint32(64).uint32(message.endRaiseSmallBlindValue);
        writer.uint32(72).uint32(message.proposedGuiSpeed);
        writer.uint32(80).uint32(message.delayBetweenHands);
        writer.uint32(88).uint32(message.playerActionTimeout);
        writer.uint32(96).uint32(message.firstSmallBlind);
        writer.uint32(104).uint32(message.startMoney);
        if (message.manualBlinds != null && message.manualBlinds.length) {
            writer.uint32(114).fork();
            for (let i = 0; i < message.manualBlinds.length; ++i)
                writer.uint32(message.manualBlinds[i]);
            writer.ldelim();
        }
        if (message.allowSpectators != null && Object.hasOwnProperty.call(message, "allowSpectators"))
            writer.uint32(120).bool(message.allowSpectators);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    NetGameInfo.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.NetGameInfo();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.gameName = reader.string();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.netGameType = reader.int32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.maxNumPlayers = reader.uint32();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.raiseIntervalMode = reader.int32();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.raiseEveryHands = reader.uint32();
                    continue;
                }
            case 6: {
                    if (wireType !== 0)
                        break;
                    message.raiseEveryMinutes = reader.uint32();
                    continue;
                }
            case 7: {
                    if (wireType !== 0)
                        break;
                    message.endRaiseMode = reader.int32();
                    continue;
                }
            case 8: {
                    if (wireType !== 0)
                        break;
                    message.endRaiseSmallBlindValue = reader.uint32();
                    continue;
                }
            case 9: {
                    if (wireType !== 0)
                        break;
                    message.proposedGuiSpeed = reader.uint32();
                    continue;
                }
            case 10: {
                    if (wireType !== 0)
                        break;
                    message.delayBetweenHands = reader.uint32();
                    continue;
                }
            case 11: {
                    if (wireType !== 0)
                        break;
                    message.playerActionTimeout = reader.uint32();
                    continue;
                }
            case 12: {
                    if (wireType !== 0)
                        break;
                    message.firstSmallBlind = reader.uint32();
                    continue;
                }
            case 13: {
                    if (wireType !== 0)
                        break;
                    message.startMoney = reader.uint32();
                    continue;
                }
            case 14: {
                    if (wireType === 2) {
                        if (!(message.manualBlinds && message.manualBlinds.length))
                            message.manualBlinds = [];
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.manualBlinds.push(reader.uint32());
                        continue;
                    }
                    if (wireType !== 0)
                        break;
                    if (!(message.manualBlinds && message.manualBlinds.length))
                        message.manualBlinds = [];
                    message.manualBlinds.push(reader.uint32());
                    continue;
                }
            case 15: {
                    if (wireType !== 0)
                        break;
                    message.allowSpectators = reader.bool();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameName"))
            throw $util.ProtocolError("missing required 'gameName'", { instance: message });
        if (!message.hasOwnProperty("netGameType"))
            throw $util.ProtocolError("missing required 'netGameType'", { instance: message });
        if (!message.hasOwnProperty("maxNumPlayers"))
            throw $util.ProtocolError("missing required 'maxNumPlayers'", { instance: message });
        if (!message.hasOwnProperty("raiseIntervalMode"))
            throw $util.ProtocolError("missing required 'raiseIntervalMode'", { instance: message });
        if (!message.hasOwnProperty("endRaiseMode"))
            throw $util.ProtocolError("missing required 'endRaiseMode'", { instance: message });
        if (!message.hasOwnProperty("proposedGuiSpeed"))
            throw $util.ProtocolError("missing required 'proposedGuiSpeed'", { instance: message });
        if (!message.hasOwnProperty("delayBetweenHands"))
            throw $util.ProtocolError("missing required 'delayBetweenHands'", { instance: message });
        if (!message.hasOwnProperty("playerActionTimeout"))
            throw $util.ProtocolError("missing required 'playerActionTimeout'", { instance: message });
        if (!message.hasOwnProperty("firstSmallBlind"))
            throw $util.ProtocolError("missing required 'firstSmallBlind'", { instance: message });
        if (!message.hasOwnProperty("startMoney"))
            throw $util.ProtocolError("missing required 'startMoney'", { instance: message });
        return message;
    };

    NetGameInfo.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isString(message.gameName))
            return "gameName: string expected";
        switch (message.netGameType) {
        default:
            return "netGameType: enum value expected";
        case 1:
        case 2:
        case 3:
        case 4:
            break;
        }
        if (!$util.isInteger(message.maxNumPlayers))
            return "maxNumPlayers: integer expected";
        switch (message.raiseIntervalMode) {
        default:
            return "raiseIntervalMode: enum value expected";
        case 1:
        case 2:
            break;
        }
        if (message.raiseEveryHands != null && message.hasOwnProperty("raiseEveryHands"))
            if (!$util.isInteger(message.raiseEveryHands))
                return "raiseEveryHands: integer expected";
        if (message.raiseEveryMinutes != null && message.hasOwnProperty("raiseEveryMinutes"))
            if (!$util.isInteger(message.raiseEveryMinutes))
                return "raiseEveryMinutes: integer expected";
        switch (message.endRaiseMode) {
        default:
            return "endRaiseMode: enum value expected";
        case 1:
        case 2:
        case 3:
            break;
        }
        if (message.endRaiseSmallBlindValue != null && message.hasOwnProperty("endRaiseSmallBlindValue"))
            if (!$util.isInteger(message.endRaiseSmallBlindValue))
                return "endRaiseSmallBlindValue: integer expected";
        if (!$util.isInteger(message.proposedGuiSpeed))
            return "proposedGuiSpeed: integer expected";
        if (!$util.isInteger(message.delayBetweenHands))
            return "delayBetweenHands: integer expected";
        if (!$util.isInteger(message.playerActionTimeout))
            return "playerActionTimeout: integer expected";
        if (!$util.isInteger(message.firstSmallBlind))
            return "firstSmallBlind: integer expected";
        if (!$util.isInteger(message.startMoney))
            return "startMoney: integer expected";
        if (message.manualBlinds != null && message.hasOwnProperty("manualBlinds")) {
            if (!Array.isArray(message.manualBlinds))
                return "manualBlinds: array expected";
            for (let i = 0; i < message.manualBlinds.length; ++i)
                if (!$util.isInteger(message.manualBlinds[i]))
                    return "manualBlinds: integer[] expected";
        }
        if (message.allowSpectators != null && message.hasOwnProperty("allowSpectators"))
            if (typeof message.allowSpectators !== "boolean")
                return "allowSpectators: boolean expected";
        return null;
    };

    NetGameInfo.NetGameType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "normalGame"] = 1;
        values[valuesById[2] = "registeredOnlyGame"] = 2;
        values[valuesById[3] = "inviteOnlyGame"] = 3;
        values[valuesById[4] = "rankingGame"] = 4;
        return values;
    })();

    NetGameInfo.RaiseIntervalMode = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "raiseOnHandNum"] = 1;
        values[valuesById[2] = "raiseOnMinutes"] = 2;
        return values;
    })();

    NetGameInfo.EndRaiseMode = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "doubleBlinds"] = 1;
        values[valuesById[2] = "raiseByEndValue"] = 2;
        values[valuesById[3] = "keepLastBlind"] = 3;
        return values;
    })();

    return NetGameInfo;
})();

export const PlayerResult = $root.PlayerResult = (() => {

    function PlayerResult(properties) {
        this.bestHandPosition = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    PlayerResult.prototype.playerId = 0;
    PlayerResult.prototype.resultCard1 = 0;
    PlayerResult.prototype.resultCard2 = 0;
    PlayerResult.prototype.bestHandPosition = $util.emptyArray;
    PlayerResult.prototype.moneyWon = 0;
    PlayerResult.prototype.playerMoney = 0;
    PlayerResult.prototype.cardsValue = 0;

    PlayerResult.create = function create(properties) {
        return new PlayerResult(properties);
    };

    PlayerResult.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.playerId);
        writer.uint32(16).uint32(message.resultCard1);
        writer.uint32(24).uint32(message.resultCard2);
        if (message.bestHandPosition != null && message.bestHandPosition.length) {
            writer.uint32(34).fork();
            for (let i = 0; i < message.bestHandPosition.length; ++i)
                writer.uint32(message.bestHandPosition[i]);
            writer.ldelim();
        }
        writer.uint32(40).uint32(message.moneyWon);
        writer.uint32(48).uint32(message.playerMoney);
        if (message.cardsValue != null && Object.hasOwnProperty.call(message, "cardsValue"))
            writer.uint32(56).uint32(message.cardsValue);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    PlayerResult.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.PlayerResult();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.resultCard1 = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.resultCard2 = reader.uint32();
                    continue;
                }
            case 4: {
                    if (wireType === 2) {
                        if (!(message.bestHandPosition && message.bestHandPosition.length))
                            message.bestHandPosition = [];
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.bestHandPosition.push(reader.uint32());
                        continue;
                    }
                    if (wireType !== 0)
                        break;
                    if (!(message.bestHandPosition && message.bestHandPosition.length))
                        message.bestHandPosition = [];
                    message.bestHandPosition.push(reader.uint32());
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.moneyWon = reader.uint32();
                    continue;
                }
            case 6: {
                    if (wireType !== 0)
                        break;
                    message.playerMoney = reader.uint32();
                    continue;
                }
            case 7: {
                    if (wireType !== 0)
                        break;
                    message.cardsValue = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        if (!message.hasOwnProperty("resultCard1"))
            throw $util.ProtocolError("missing required 'resultCard1'", { instance: message });
        if (!message.hasOwnProperty("resultCard2"))
            throw $util.ProtocolError("missing required 'resultCard2'", { instance: message });
        if (!message.hasOwnProperty("moneyWon"))
            throw $util.ProtocolError("missing required 'moneyWon'", { instance: message });
        if (!message.hasOwnProperty("playerMoney"))
            throw $util.ProtocolError("missing required 'playerMoney'", { instance: message });
        return message;
    };

    PlayerResult.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        if (!$util.isInteger(message.resultCard1))
            return "resultCard1: integer expected";
        if (!$util.isInteger(message.resultCard2))
            return "resultCard2: integer expected";
        if (message.bestHandPosition != null && message.hasOwnProperty("bestHandPosition")) {
            if (!Array.isArray(message.bestHandPosition))
                return "bestHandPosition: array expected";
            for (let i = 0; i < message.bestHandPosition.length; ++i)
                if (!$util.isInteger(message.bestHandPosition[i]))
                    return "bestHandPosition: integer[] expected";
        }
        if (!$util.isInteger(message.moneyWon))
            return "moneyWon: integer expected";
        if (!$util.isInteger(message.playerMoney))
            return "playerMoney: integer expected";
        if (message.cardsValue != null && message.hasOwnProperty("cardsValue"))
            if (!$util.isInteger(message.cardsValue))
                return "cardsValue: integer expected";
        return null;
    };

    return PlayerResult;
})();

export const AnnounceMessage = $root.AnnounceMessage = (() => {

    function AnnounceMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AnnounceMessage.prototype.protocolVersion = null;
    AnnounceMessage.prototype.latestGameVersion = null;
    AnnounceMessage.prototype.latestBetaRevision = 0;
    AnnounceMessage.prototype.serverType = 0;
    AnnounceMessage.prototype.numPlayersOnServer = 0;

    AnnounceMessage.create = function create(properties) {
        return new AnnounceMessage(properties);
    };

    AnnounceMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        $root.AnnounceMessage.Version.encode(message.protocolVersion, writer.uint32(10).fork(), _depth + 1).ldelim();
        $root.AnnounceMessage.Version.encode(message.latestGameVersion, writer.uint32(18).fork(), _depth + 1).ldelim();
        writer.uint32(24).uint32(message.latestBetaRevision);
        writer.uint32(32).int32(message.serverType);
        writer.uint32(40).uint32(message.numPlayersOnServer);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AnnounceMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AnnounceMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.protocolVersion = $root.AnnounceMessage.Version.decode(reader, reader.uint32(), undefined, _depth + 1, message.protocolVersion);
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.latestGameVersion = $root.AnnounceMessage.Version.decode(reader, reader.uint32(), undefined, _depth + 1, message.latestGameVersion);
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.latestBetaRevision = reader.uint32();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.serverType = reader.int32();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.numPlayersOnServer = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("protocolVersion"))
            throw $util.ProtocolError("missing required 'protocolVersion'", { instance: message });
        if (!message.hasOwnProperty("latestGameVersion"))
            throw $util.ProtocolError("missing required 'latestGameVersion'", { instance: message });
        if (!message.hasOwnProperty("latestBetaRevision"))
            throw $util.ProtocolError("missing required 'latestBetaRevision'", { instance: message });
        if (!message.hasOwnProperty("serverType"))
            throw $util.ProtocolError("missing required 'serverType'", { instance: message });
        if (!message.hasOwnProperty("numPlayersOnServer"))
            throw $util.ProtocolError("missing required 'numPlayersOnServer'", { instance: message });
        return message;
    };

    AnnounceMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        {
            let error = $root.AnnounceMessage.Version.verify(message.protocolVersion, _depth + 1);
            if (error)
                return "protocolVersion." + error;
        }
        {
            let error = $root.AnnounceMessage.Version.verify(message.latestGameVersion, _depth + 1);
            if (error)
                return "latestGameVersion." + error;
        }
        if (!$util.isInteger(message.latestBetaRevision))
            return "latestBetaRevision: integer expected";
        switch (message.serverType) {
        default:
            return "serverType: enum value expected";
        case 0:
        case 1:
        case 2:
            break;
        }
        if (!$util.isInteger(message.numPlayersOnServer))
            return "numPlayersOnServer: integer expected";
        return null;
    };

    AnnounceMessage.Version = (function() {

        function Version(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        Version.prototype.majorVersion = 0;
        Version.prototype.minorVersion = 0;

        Version.create = function create(properties) {
            return new Version(properties);
        };

        Version.encode = function encode(message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            writer.uint32(8).uint32(message.majorVersion);
            writer.uint32(16).uint32(message.minorVersion);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        Version.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AnnounceMessage.Version();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.majorVersion = reader.uint32();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.minorVersion = reader.uint32();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            if (!message.hasOwnProperty("majorVersion"))
                throw $util.ProtocolError("missing required 'majorVersion'", { instance: message });
            if (!message.hasOwnProperty("minorVersion"))
                throw $util.ProtocolError("missing required 'minorVersion'", { instance: message });
            return message;
        };

        Version.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (!$util.isInteger(message.majorVersion))
                return "majorVersion: integer expected";
            if (!$util.isInteger(message.minorVersion))
                return "minorVersion: integer expected";
            return null;
        };

        return Version;
    })();

    AnnounceMessage.ServerType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "serverTypeLAN"] = 0;
        values[valuesById[1] = "serverTypeInternetNoAuth"] = 1;
        values[valuesById[2] = "serverTypeInternetAuth"] = 2;
        return values;
    })();

    return AnnounceMessage;
})();

export const InitMessage = $root.InitMessage = (() => {

    function InitMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    InitMessage.prototype.requestedVersion = null;
    InitMessage.prototype.buildId = 0;
    InitMessage.prototype.myLastSessionId = $util.newBuffer([]);
    InitMessage.prototype.authServerPassword = "";
    InitMessage.prototype.login = 0;
    InitMessage.prototype.nickName = "";
    InitMessage.prototype.clientUserData = $util.newBuffer([]);
    InitMessage.prototype.avatarHash = $util.newBuffer([]);

    InitMessage.create = function create(properties) {
        return new InitMessage(properties);
    };

    InitMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        $root.AnnounceMessage.Version.encode(message.requestedVersion, writer.uint32(10).fork(), _depth + 1).ldelim();
        writer.uint32(16).uint32(message.buildId);
        if (message.myLastSessionId != null && Object.hasOwnProperty.call(message, "myLastSessionId"))
            writer.uint32(26).bytes(message.myLastSessionId);
        if (message.authServerPassword != null && Object.hasOwnProperty.call(message, "authServerPassword"))
            writer.uint32(34).string(message.authServerPassword);
        writer.uint32(40).int32(message.login);
        if (message.nickName != null && Object.hasOwnProperty.call(message, "nickName"))
            writer.uint32(50).string(message.nickName);
        if (message.clientUserData != null && Object.hasOwnProperty.call(message, "clientUserData"))
            writer.uint32(58).bytes(message.clientUserData);
        if (message.avatarHash != null && Object.hasOwnProperty.call(message, "avatarHash"))
            writer.uint32(66).bytes(message.avatarHash);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    InitMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.InitMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.requestedVersion = $root.AnnounceMessage.Version.decode(reader, reader.uint32(), undefined, _depth + 1, message.requestedVersion);
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.buildId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.myLastSessionId = reader.bytes();
                    continue;
                }
            case 4: {
                    if (wireType !== 2)
                        break;
                    message.authServerPassword = reader.string();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.login = reader.int32();
                    continue;
                }
            case 6: {
                    if (wireType !== 2)
                        break;
                    message.nickName = reader.string();
                    continue;
                }
            case 7: {
                    if (wireType !== 2)
                        break;
                    message.clientUserData = reader.bytes();
                    continue;
                }
            case 8: {
                    if (wireType !== 2)
                        break;
                    message.avatarHash = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("requestedVersion"))
            throw $util.ProtocolError("missing required 'requestedVersion'", { instance: message });
        if (!message.hasOwnProperty("buildId"))
            throw $util.ProtocolError("missing required 'buildId'", { instance: message });
        if (!message.hasOwnProperty("login"))
            throw $util.ProtocolError("missing required 'login'", { instance: message });
        return message;
    };

    InitMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        {
            let error = $root.AnnounceMessage.Version.verify(message.requestedVersion, _depth + 1);
            if (error)
                return "requestedVersion." + error;
        }
        if (!$util.isInteger(message.buildId))
            return "buildId: integer expected";
        if (message.myLastSessionId != null && message.hasOwnProperty("myLastSessionId"))
            if (!(message.myLastSessionId && typeof message.myLastSessionId.length === "number" || $util.isString(message.myLastSessionId)))
                return "myLastSessionId: buffer expected";
        if (message.authServerPassword != null && message.hasOwnProperty("authServerPassword"))
            if (!$util.isString(message.authServerPassword))
                return "authServerPassword: string expected";
        switch (message.login) {
        default:
            return "login: enum value expected";
        case 0:
        case 1:
        case 2:
            break;
        }
        if (message.nickName != null && message.hasOwnProperty("nickName"))
            if (!$util.isString(message.nickName))
                return "nickName: string expected";
        if (message.clientUserData != null && message.hasOwnProperty("clientUserData"))
            if (!(message.clientUserData && typeof message.clientUserData.length === "number" || $util.isString(message.clientUserData)))
                return "clientUserData: buffer expected";
        if (message.avatarHash != null && message.hasOwnProperty("avatarHash"))
            if (!(message.avatarHash && typeof message.avatarHash.length === "number" || $util.isString(message.avatarHash)))
                return "avatarHash: buffer expected";
        return null;
    };

    InitMessage.LoginType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "guestLogin"] = 0;
        values[valuesById[1] = "authenticatedLogin"] = 1;
        values[valuesById[2] = "unauthenticatedLogin"] = 2;
        return values;
    })();

    return InitMessage;
})();

export const AuthServerChallengeMessage = $root.AuthServerChallengeMessage = (() => {

    function AuthServerChallengeMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AuthServerChallengeMessage.prototype.serverChallenge = $util.newBuffer([]);

    AuthServerChallengeMessage.create = function create(properties) {
        return new AuthServerChallengeMessage(properties);
    };

    AuthServerChallengeMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(10).bytes(message.serverChallenge);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AuthServerChallengeMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AuthServerChallengeMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.serverChallenge = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("serverChallenge"))
            throw $util.ProtocolError("missing required 'serverChallenge'", { instance: message });
        return message;
    };

    AuthServerChallengeMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!(message.serverChallenge && typeof message.serverChallenge.length === "number" || $util.isString(message.serverChallenge)))
            return "serverChallenge: buffer expected";
        return null;
    };

    return AuthServerChallengeMessage;
})();

export const AuthClientResponseMessage = $root.AuthClientResponseMessage = (() => {

    function AuthClientResponseMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AuthClientResponseMessage.prototype.clientResponse = $util.newBuffer([]);

    AuthClientResponseMessage.create = function create(properties) {
        return new AuthClientResponseMessage(properties);
    };

    AuthClientResponseMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(10).bytes(message.clientResponse);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AuthClientResponseMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AuthClientResponseMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.clientResponse = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("clientResponse"))
            throw $util.ProtocolError("missing required 'clientResponse'", { instance: message });
        return message;
    };

    AuthClientResponseMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!(message.clientResponse && typeof message.clientResponse.length === "number" || $util.isString(message.clientResponse)))
            return "clientResponse: buffer expected";
        return null;
    };

    return AuthClientResponseMessage;
})();

export const AuthServerVerificationMessage = $root.AuthServerVerificationMessage = (() => {

    function AuthServerVerificationMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AuthServerVerificationMessage.prototype.serverVerification = $util.newBuffer([]);

    AuthServerVerificationMessage.create = function create(properties) {
        return new AuthServerVerificationMessage(properties);
    };

    AuthServerVerificationMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(10).bytes(message.serverVerification);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AuthServerVerificationMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AuthServerVerificationMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.serverVerification = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("serverVerification"))
            throw $util.ProtocolError("missing required 'serverVerification'", { instance: message });
        return message;
    };

    AuthServerVerificationMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!(message.serverVerification && typeof message.serverVerification.length === "number" || $util.isString(message.serverVerification)))
            return "serverVerification: buffer expected";
        return null;
    };

    return AuthServerVerificationMessage;
})();

export const InitAckMessage = $root.InitAckMessage = (() => {

    function InitAckMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    InitAckMessage.prototype.yourSessionId = $util.newBuffer([]);
    InitAckMessage.prototype.yourPlayerId = 0;
    InitAckMessage.prototype.yourAvatarHash = $util.newBuffer([]);
    InitAckMessage.prototype.rejoinGameId = 0;

    InitAckMessage.create = function create(properties) {
        return new InitAckMessage(properties);
    };

    InitAckMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(10).bytes(message.yourSessionId);
        writer.uint32(16).uint32(message.yourPlayerId);
        if (message.yourAvatarHash != null && Object.hasOwnProperty.call(message, "yourAvatarHash"))
            writer.uint32(26).bytes(message.yourAvatarHash);
        if (message.rejoinGameId != null && Object.hasOwnProperty.call(message, "rejoinGameId"))
            writer.uint32(32).uint32(message.rejoinGameId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    InitAckMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.InitAckMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.yourSessionId = reader.bytes();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.yourPlayerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.yourAvatarHash = reader.bytes();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.rejoinGameId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("yourSessionId"))
            throw $util.ProtocolError("missing required 'yourSessionId'", { instance: message });
        if (!message.hasOwnProperty("yourPlayerId"))
            throw $util.ProtocolError("missing required 'yourPlayerId'", { instance: message });
        return message;
    };

    InitAckMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!(message.yourSessionId && typeof message.yourSessionId.length === "number" || $util.isString(message.yourSessionId)))
            return "yourSessionId: buffer expected";
        if (!$util.isInteger(message.yourPlayerId))
            return "yourPlayerId: integer expected";
        if (message.yourAvatarHash != null && message.hasOwnProperty("yourAvatarHash"))
            if (!(message.yourAvatarHash && typeof message.yourAvatarHash.length === "number" || $util.isString(message.yourAvatarHash)))
                return "yourAvatarHash: buffer expected";
        if (message.rejoinGameId != null && message.hasOwnProperty("rejoinGameId"))
            if (!$util.isInteger(message.rejoinGameId))
                return "rejoinGameId: integer expected";
        return null;
    };

    return InitAckMessage;
})();

export const AvatarRequestMessage = $root.AvatarRequestMessage = (() => {

    function AvatarRequestMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AvatarRequestMessage.prototype.requestId = 0;
    AvatarRequestMessage.prototype.avatarHash = $util.newBuffer([]);

    AvatarRequestMessage.create = function create(properties) {
        return new AvatarRequestMessage(properties);
    };

    AvatarRequestMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.requestId);
        writer.uint32(18).bytes(message.avatarHash);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AvatarRequestMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AvatarRequestMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.requestId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.avatarHash = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("requestId"))
            throw $util.ProtocolError("missing required 'requestId'", { instance: message });
        if (!message.hasOwnProperty("avatarHash"))
            throw $util.ProtocolError("missing required 'avatarHash'", { instance: message });
        return message;
    };

    AvatarRequestMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.requestId))
            return "requestId: integer expected";
        if (!(message.avatarHash && typeof message.avatarHash.length === "number" || $util.isString(message.avatarHash)))
            return "avatarHash: buffer expected";
        return null;
    };

    return AvatarRequestMessage;
})();

export const AvatarHeaderMessage = $root.AvatarHeaderMessage = (() => {

    function AvatarHeaderMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AvatarHeaderMessage.prototype.requestId = 0;
    AvatarHeaderMessage.prototype.avatarType = 1;
    AvatarHeaderMessage.prototype.avatarSize = 0;

    AvatarHeaderMessage.create = function create(properties) {
        return new AvatarHeaderMessage(properties);
    };

    AvatarHeaderMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.requestId);
        writer.uint32(16).int32(message.avatarType);
        writer.uint32(24).uint32(message.avatarSize);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AvatarHeaderMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AvatarHeaderMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.requestId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.avatarType = reader.int32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.avatarSize = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("requestId"))
            throw $util.ProtocolError("missing required 'requestId'", { instance: message });
        if (!message.hasOwnProperty("avatarType"))
            throw $util.ProtocolError("missing required 'avatarType'", { instance: message });
        if (!message.hasOwnProperty("avatarSize"))
            throw $util.ProtocolError("missing required 'avatarSize'", { instance: message });
        return message;
    };

    AvatarHeaderMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.requestId))
            return "requestId: integer expected";
        switch (message.avatarType) {
        default:
            return "avatarType: enum value expected";
        case 1:
        case 2:
        case 3:
            break;
        }
        if (!$util.isInteger(message.avatarSize))
            return "avatarSize: integer expected";
        return null;
    };

    return AvatarHeaderMessage;
})();

export const AvatarDataMessage = $root.AvatarDataMessage = (() => {

    function AvatarDataMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AvatarDataMessage.prototype.requestId = 0;
    AvatarDataMessage.prototype.avatarBlock = $util.newBuffer([]);

    AvatarDataMessage.create = function create(properties) {
        return new AvatarDataMessage(properties);
    };

    AvatarDataMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.requestId);
        writer.uint32(18).bytes(message.avatarBlock);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AvatarDataMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AvatarDataMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.requestId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.avatarBlock = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("requestId"))
            throw $util.ProtocolError("missing required 'requestId'", { instance: message });
        if (!message.hasOwnProperty("avatarBlock"))
            throw $util.ProtocolError("missing required 'avatarBlock'", { instance: message });
        return message;
    };

    AvatarDataMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.requestId))
            return "requestId: integer expected";
        if (!(message.avatarBlock && typeof message.avatarBlock.length === "number" || $util.isString(message.avatarBlock)))
            return "avatarBlock: buffer expected";
        return null;
    };

    return AvatarDataMessage;
})();

export const AvatarEndMessage = $root.AvatarEndMessage = (() => {

    function AvatarEndMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AvatarEndMessage.prototype.requestId = 0;

    AvatarEndMessage.create = function create(properties) {
        return new AvatarEndMessage(properties);
    };

    AvatarEndMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.requestId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AvatarEndMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AvatarEndMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.requestId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("requestId"))
            throw $util.ProtocolError("missing required 'requestId'", { instance: message });
        return message;
    };

    AvatarEndMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.requestId))
            return "requestId: integer expected";
        return null;
    };

    return AvatarEndMessage;
})();

export const UnknownAvatarMessage = $root.UnknownAvatarMessage = (() => {

    function UnknownAvatarMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    UnknownAvatarMessage.prototype.requestId = 0;

    UnknownAvatarMessage.create = function create(properties) {
        return new UnknownAvatarMessage(properties);
    };

    UnknownAvatarMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.requestId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    UnknownAvatarMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.UnknownAvatarMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.requestId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("requestId"))
            throw $util.ProtocolError("missing required 'requestId'", { instance: message });
        return message;
    };

    UnknownAvatarMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.requestId))
            return "requestId: integer expected";
        return null;
    };

    return UnknownAvatarMessage;
})();

export const PlayerListMessage = $root.PlayerListMessage = (() => {

    function PlayerListMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    PlayerListMessage.prototype.playerId = 0;
    PlayerListMessage.prototype.playerListNotification = 0;

    PlayerListMessage.create = function create(properties) {
        return new PlayerListMessage(properties);
    };

    PlayerListMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.playerId);
        writer.uint32(16).int32(message.playerListNotification);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    PlayerListMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.PlayerListMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerListNotification = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        if (!message.hasOwnProperty("playerListNotification"))
            throw $util.ProtocolError("missing required 'playerListNotification'", { instance: message });
        return message;
    };

    PlayerListMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        switch (message.playerListNotification) {
        default:
            return "playerListNotification: enum value expected";
        case 0:
        case 1:
            break;
        }
        return null;
    };

    PlayerListMessage.PlayerListNotification = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "playerListNew"] = 0;
        values[valuesById[1] = "playerListLeft"] = 1;
        return values;
    })();

    return PlayerListMessage;
})();

export const GameListNewMessage = $root.GameListNewMessage = (() => {

    function GameListNewMessage(properties) {
        this.playerIds = [];
        this.spectatorIds = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameListNewMessage.prototype.gameId = 0;
    GameListNewMessage.prototype.gameMode = 1;
    GameListNewMessage.prototype.isPrivate = false;
    GameListNewMessage.prototype.playerIds = $util.emptyArray;
    GameListNewMessage.prototype.adminPlayerId = 0;
    GameListNewMessage.prototype.gameInfo = null;
    GameListNewMessage.prototype.spectatorIds = $util.emptyArray;

    GameListNewMessage.create = function create(properties) {
        return new GameListNewMessage(properties);
    };

    GameListNewMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).int32(message.gameMode);
        writer.uint32(24).bool(message.isPrivate);
        if (message.playerIds != null && message.playerIds.length) {
            writer.uint32(34).fork();
            for (let i = 0; i < message.playerIds.length; ++i)
                writer.uint32(message.playerIds[i]);
            writer.ldelim();
        }
        writer.uint32(40).uint32(message.adminPlayerId);
        $root.NetGameInfo.encode(message.gameInfo, writer.uint32(50).fork(), _depth + 1).ldelim();
        if (message.spectatorIds != null && message.spectatorIds.length) {
            writer.uint32(58).fork();
            for (let i = 0; i < message.spectatorIds.length; ++i)
                writer.uint32(message.spectatorIds[i]);
            writer.ldelim();
        }
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameListNewMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameListNewMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.gameMode = reader.int32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.isPrivate = reader.bool();
                    continue;
                }
            case 4: {
                    if (wireType === 2) {
                        if (!(message.playerIds && message.playerIds.length))
                            message.playerIds = [];
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.playerIds.push(reader.uint32());
                        continue;
                    }
                    if (wireType !== 0)
                        break;
                    if (!(message.playerIds && message.playerIds.length))
                        message.playerIds = [];
                    message.playerIds.push(reader.uint32());
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.adminPlayerId = reader.uint32();
                    continue;
                }
            case 6: {
                    if (wireType !== 2)
                        break;
                    message.gameInfo = $root.NetGameInfo.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameInfo);
                    continue;
                }
            case 7: {
                    if (wireType === 2) {
                        if (!(message.spectatorIds && message.spectatorIds.length))
                            message.spectatorIds = [];
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.spectatorIds.push(reader.uint32());
                        continue;
                    }
                    if (wireType !== 0)
                        break;
                    if (!(message.spectatorIds && message.spectatorIds.length))
                        message.spectatorIds = [];
                    message.spectatorIds.push(reader.uint32());
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("gameMode"))
            throw $util.ProtocolError("missing required 'gameMode'", { instance: message });
        if (!message.hasOwnProperty("isPrivate"))
            throw $util.ProtocolError("missing required 'isPrivate'", { instance: message });
        if (!message.hasOwnProperty("adminPlayerId"))
            throw $util.ProtocolError("missing required 'adminPlayerId'", { instance: message });
        if (!message.hasOwnProperty("gameInfo"))
            throw $util.ProtocolError("missing required 'gameInfo'", { instance: message });
        return message;
    };

    GameListNewMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        switch (message.gameMode) {
        default:
            return "gameMode: enum value expected";
        case 1:
        case 2:
        case 3:
            break;
        }
        if (typeof message.isPrivate !== "boolean")
            return "isPrivate: boolean expected";
        if (message.playerIds != null && message.hasOwnProperty("playerIds")) {
            if (!Array.isArray(message.playerIds))
                return "playerIds: array expected";
            for (let i = 0; i < message.playerIds.length; ++i)
                if (!$util.isInteger(message.playerIds[i]))
                    return "playerIds: integer[] expected";
        }
        if (!$util.isInteger(message.adminPlayerId))
            return "adminPlayerId: integer expected";
        {
            let error = $root.NetGameInfo.verify(message.gameInfo, _depth + 1);
            if (error)
                return "gameInfo." + error;
        }
        if (message.spectatorIds != null && message.hasOwnProperty("spectatorIds")) {
            if (!Array.isArray(message.spectatorIds))
                return "spectatorIds: array expected";
            for (let i = 0; i < message.spectatorIds.length; ++i)
                if (!$util.isInteger(message.spectatorIds[i]))
                    return "spectatorIds: integer[] expected";
        }
        return null;
    };

    return GameListNewMessage;
})();

export const GameListUpdateMessage = $root.GameListUpdateMessage = (() => {

    function GameListUpdateMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameListUpdateMessage.prototype.gameId = 0;
    GameListUpdateMessage.prototype.gameMode = 1;

    GameListUpdateMessage.create = function create(properties) {
        return new GameListUpdateMessage(properties);
    };

    GameListUpdateMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).int32(message.gameMode);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameListUpdateMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameListUpdateMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.gameMode = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("gameMode"))
            throw $util.ProtocolError("missing required 'gameMode'", { instance: message });
        return message;
    };

    GameListUpdateMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        switch (message.gameMode) {
        default:
            return "gameMode: enum value expected";
        case 1:
        case 2:
        case 3:
            break;
        }
        return null;
    };

    return GameListUpdateMessage;
})();

export const GameListPlayerJoinedMessage = $root.GameListPlayerJoinedMessage = (() => {

    function GameListPlayerJoinedMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameListPlayerJoinedMessage.prototype.gameId = 0;
    GameListPlayerJoinedMessage.prototype.playerId = 0;

    GameListPlayerJoinedMessage.create = function create(properties) {
        return new GameListPlayerJoinedMessage(properties);
    };

    GameListPlayerJoinedMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameListPlayerJoinedMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameListPlayerJoinedMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        return message;
    };

    GameListPlayerJoinedMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        return null;
    };

    return GameListPlayerJoinedMessage;
})();

export const GameListPlayerLeftMessage = $root.GameListPlayerLeftMessage = (() => {

    function GameListPlayerLeftMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameListPlayerLeftMessage.prototype.gameId = 0;
    GameListPlayerLeftMessage.prototype.playerId = 0;

    GameListPlayerLeftMessage.create = function create(properties) {
        return new GameListPlayerLeftMessage(properties);
    };

    GameListPlayerLeftMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameListPlayerLeftMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameListPlayerLeftMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        return message;
    };

    GameListPlayerLeftMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        return null;
    };

    return GameListPlayerLeftMessage;
})();

export const GameListSpectatorJoinedMessage = $root.GameListSpectatorJoinedMessage = (() => {

    function GameListSpectatorJoinedMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameListSpectatorJoinedMessage.prototype.gameId = 0;
    GameListSpectatorJoinedMessage.prototype.playerId = 0;

    GameListSpectatorJoinedMessage.create = function create(properties) {
        return new GameListSpectatorJoinedMessage(properties);
    };

    GameListSpectatorJoinedMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameListSpectatorJoinedMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameListSpectatorJoinedMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        return message;
    };

    GameListSpectatorJoinedMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        return null;
    };

    return GameListSpectatorJoinedMessage;
})();

export const GameListSpectatorLeftMessage = $root.GameListSpectatorLeftMessage = (() => {

    function GameListSpectatorLeftMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameListSpectatorLeftMessage.prototype.gameId = 0;
    GameListSpectatorLeftMessage.prototype.playerId = 0;

    GameListSpectatorLeftMessage.create = function create(properties) {
        return new GameListSpectatorLeftMessage(properties);
    };

    GameListSpectatorLeftMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameListSpectatorLeftMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameListSpectatorLeftMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        return message;
    };

    GameListSpectatorLeftMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        return null;
    };

    return GameListSpectatorLeftMessage;
})();

export const GameListAdminChangedMessage = $root.GameListAdminChangedMessage = (() => {

    function GameListAdminChangedMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameListAdminChangedMessage.prototype.gameId = 0;
    GameListAdminChangedMessage.prototype.newAdminPlayerId = 0;

    GameListAdminChangedMessage.create = function create(properties) {
        return new GameListAdminChangedMessage(properties);
    };

    GameListAdminChangedMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.newAdminPlayerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameListAdminChangedMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameListAdminChangedMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.newAdminPlayerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("newAdminPlayerId"))
            throw $util.ProtocolError("missing required 'newAdminPlayerId'", { instance: message });
        return message;
    };

    GameListAdminChangedMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.newAdminPlayerId))
            return "newAdminPlayerId: integer expected";
        return null;
    };

    return GameListAdminChangedMessage;
})();

export const PlayerInfoRequestMessage = $root.PlayerInfoRequestMessage = (() => {

    function PlayerInfoRequestMessage(properties) {
        this.playerId = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    PlayerInfoRequestMessage.prototype.playerId = $util.emptyArray;

    PlayerInfoRequestMessage.create = function create(properties) {
        return new PlayerInfoRequestMessage(properties);
    };

    PlayerInfoRequestMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        if (message.playerId != null && message.playerId.length) {
            writer.uint32(10).fork();
            for (let i = 0; i < message.playerId.length; ++i)
                writer.uint32(message.playerId[i]);
            writer.ldelim();
        }
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    PlayerInfoRequestMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.PlayerInfoRequestMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType === 2) {
                        if (!(message.playerId && message.playerId.length))
                            message.playerId = [];
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.playerId.push(reader.uint32());
                        continue;
                    }
                    if (wireType !== 0)
                        break;
                    if (!(message.playerId && message.playerId.length))
                        message.playerId = [];
                    message.playerId.push(reader.uint32());
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        return message;
    };

    PlayerInfoRequestMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.playerId != null && message.hasOwnProperty("playerId")) {
            if (!Array.isArray(message.playerId))
                return "playerId: array expected";
            for (let i = 0; i < message.playerId.length; ++i)
                if (!$util.isInteger(message.playerId[i]))
                    return "playerId: integer[] expected";
        }
        return null;
    };

    return PlayerInfoRequestMessage;
})();

export const PlayerInfoReplyMessage = $root.PlayerInfoReplyMessage = (() => {

    function PlayerInfoReplyMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    PlayerInfoReplyMessage.prototype.playerId = 0;
    PlayerInfoReplyMessage.prototype.playerInfoData = null;

    PlayerInfoReplyMessage.create = function create(properties) {
        return new PlayerInfoReplyMessage(properties);
    };

    PlayerInfoReplyMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.playerId);
        if (message.playerInfoData != null && Object.hasOwnProperty.call(message, "playerInfoData"))
            $root.PlayerInfoReplyMessage.PlayerInfoData.encode(message.playerInfoData, writer.uint32(18).fork(), _depth + 1).ldelim();
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    PlayerInfoReplyMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.PlayerInfoReplyMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.playerInfoData = $root.PlayerInfoReplyMessage.PlayerInfoData.decode(reader, reader.uint32(), undefined, _depth + 1, message.playerInfoData);
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        return message;
    };

    PlayerInfoReplyMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        if (message.playerInfoData != null && message.hasOwnProperty("playerInfoData")) {
            let error = $root.PlayerInfoReplyMessage.PlayerInfoData.verify(message.playerInfoData, _depth + 1);
            if (error)
                return "playerInfoData." + error;
        }
        return null;
    };

    PlayerInfoReplyMessage.PlayerInfoData = (function() {

        function PlayerInfoData(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        PlayerInfoData.prototype.playerName = "";
        PlayerInfoData.prototype.isHuman = false;
        PlayerInfoData.prototype.playerRights = 1;
        PlayerInfoData.prototype.countryCode = "";
        PlayerInfoData.prototype.avatarData = null;

        PlayerInfoData.create = function create(properties) {
            return new PlayerInfoData(properties);
        };

        PlayerInfoData.encode = function encode(message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            writer.uint32(10).string(message.playerName);
            writer.uint32(16).bool(message.isHuman);
            writer.uint32(24).int32(message.playerRights);
            if (message.countryCode != null && Object.hasOwnProperty.call(message, "countryCode"))
                writer.uint32(34).string(message.countryCode);
            if (message.avatarData != null && Object.hasOwnProperty.call(message, "avatarData"))
                $root.PlayerInfoReplyMessage.PlayerInfoData.AvatarData.encode(message.avatarData, writer.uint32(42).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        PlayerInfoData.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.PlayerInfoReplyMessage.PlayerInfoData();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.playerName = reader.string();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.isHuman = reader.bool();
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        message.playerRights = reader.int32();
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.countryCode = reader.string();
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        message.avatarData = $root.PlayerInfoReplyMessage.PlayerInfoData.AvatarData.decode(reader, reader.uint32(), undefined, _depth + 1, message.avatarData);
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            if (!message.hasOwnProperty("playerName"))
                throw $util.ProtocolError("missing required 'playerName'", { instance: message });
            if (!message.hasOwnProperty("isHuman"))
                throw $util.ProtocolError("missing required 'isHuman'", { instance: message });
            if (!message.hasOwnProperty("playerRights"))
                throw $util.ProtocolError("missing required 'playerRights'", { instance: message });
            return message;
        };

        PlayerInfoData.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (!$util.isString(message.playerName))
                return "playerName: string expected";
            if (typeof message.isHuman !== "boolean")
                return "isHuman: boolean expected";
            switch (message.playerRights) {
            default:
                return "playerRights: enum value expected";
            case 1:
            case 2:
            case 3:
                break;
            }
            if (message.countryCode != null && message.hasOwnProperty("countryCode"))
                if (!$util.isString(message.countryCode))
                    return "countryCode: string expected";
            if (message.avatarData != null && message.hasOwnProperty("avatarData")) {
                let error = $root.PlayerInfoReplyMessage.PlayerInfoData.AvatarData.verify(message.avatarData, _depth + 1);
                if (error)
                    return "avatarData." + error;
            }
            return null;
        };

        PlayerInfoData.AvatarData = (function() {

            function AvatarData(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            }

            AvatarData.prototype.avatarType = 1;
            AvatarData.prototype.avatarHash = $util.newBuffer([]);

            AvatarData.create = function create(properties) {
                return new AvatarData(properties);
            };

            AvatarData.encode = function encode(message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                writer.uint32(8).int32(message.avatarType);
                writer.uint32(18).bytes(message.avatarHash);
                if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            AvatarData.decode = function decode(reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw Error("max depth exceeded");
                let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.PlayerInfoReplyMessage.PlayerInfoData.AvatarData();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            message.avatarType = reader.int32();
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.avatarHash = reader.bytes();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
                if (_end !== undefined)
                    throw Error("missing end group");
                if (!message.hasOwnProperty("avatarType"))
                    throw $util.ProtocolError("missing required 'avatarType'", { instance: message });
                if (!message.hasOwnProperty("avatarHash"))
                    throw $util.ProtocolError("missing required 'avatarHash'", { instance: message });
                return message;
            };

            AvatarData.verify = function verify(message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                switch (message.avatarType) {
                default:
                    return "avatarType: enum value expected";
                case 1:
                case 2:
                case 3:
                    break;
                }
                if (!(message.avatarHash && typeof message.avatarHash.length === "number" || $util.isString(message.avatarHash)))
                    return "avatarHash: buffer expected";
                return null;
            };

            return AvatarData;
        })();

        return PlayerInfoData;
    })();

    return PlayerInfoReplyMessage;
})();

export const SubscriptionRequestMessage = $root.SubscriptionRequestMessage = (() => {

    function SubscriptionRequestMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    SubscriptionRequestMessage.prototype.subscriptionAction = 1;

    SubscriptionRequestMessage.create = function create(properties) {
        return new SubscriptionRequestMessage(properties);
    };

    SubscriptionRequestMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).int32(message.subscriptionAction);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    SubscriptionRequestMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.SubscriptionRequestMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.subscriptionAction = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("subscriptionAction"))
            throw $util.ProtocolError("missing required 'subscriptionAction'", { instance: message });
        return message;
    };

    SubscriptionRequestMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        switch (message.subscriptionAction) {
        default:
            return "subscriptionAction: enum value expected";
        case 1:
        case 2:
            break;
        }
        return null;
    };

    SubscriptionRequestMessage.SubscriptionAction = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "unsubscribeGameList"] = 1;
        values[valuesById[2] = "resubscribeGameList"] = 2;
        return values;
    })();

    return SubscriptionRequestMessage;
})();

export const JoinExistingGameMessage = $root.JoinExistingGameMessage = (() => {

    function JoinExistingGameMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    JoinExistingGameMessage.prototype.gameId = 0;
    JoinExistingGameMessage.prototype.password = "";
    JoinExistingGameMessage.prototype.autoLeave = false;
    JoinExistingGameMessage.prototype.spectateOnly = false;

    JoinExistingGameMessage.create = function create(properties) {
        return new JoinExistingGameMessage(properties);
    };

    JoinExistingGameMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        if (message.password != null && Object.hasOwnProperty.call(message, "password"))
            writer.uint32(18).string(message.password);
        if (message.autoLeave != null && Object.hasOwnProperty.call(message, "autoLeave"))
            writer.uint32(24).bool(message.autoLeave);
        if (message.spectateOnly != null && Object.hasOwnProperty.call(message, "spectateOnly"))
            writer.uint32(32).bool(message.spectateOnly);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    JoinExistingGameMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.JoinExistingGameMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.password = reader.string();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.autoLeave = reader.bool();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.spectateOnly = reader.bool();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        return message;
    };

    JoinExistingGameMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (message.password != null && message.hasOwnProperty("password"))
            if (!$util.isString(message.password))
                return "password: string expected";
        if (message.autoLeave != null && message.hasOwnProperty("autoLeave"))
            if (typeof message.autoLeave !== "boolean")
                return "autoLeave: boolean expected";
        if (message.spectateOnly != null && message.hasOwnProperty("spectateOnly"))
            if (typeof message.spectateOnly !== "boolean")
                return "spectateOnly: boolean expected";
        return null;
    };

    return JoinExistingGameMessage;
})();

export const JoinNewGameMessage = $root.JoinNewGameMessage = (() => {

    function JoinNewGameMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    JoinNewGameMessage.prototype.gameInfo = null;
    JoinNewGameMessage.prototype.password = "";
    JoinNewGameMessage.prototype.autoLeave = false;

    JoinNewGameMessage.create = function create(properties) {
        return new JoinNewGameMessage(properties);
    };

    JoinNewGameMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        $root.NetGameInfo.encode(message.gameInfo, writer.uint32(10).fork(), _depth + 1).ldelim();
        if (message.password != null && Object.hasOwnProperty.call(message, "password"))
            writer.uint32(18).string(message.password);
        if (message.autoLeave != null && Object.hasOwnProperty.call(message, "autoLeave"))
            writer.uint32(24).bool(message.autoLeave);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    JoinNewGameMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.JoinNewGameMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.gameInfo = $root.NetGameInfo.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameInfo);
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.password = reader.string();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.autoLeave = reader.bool();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameInfo"))
            throw $util.ProtocolError("missing required 'gameInfo'", { instance: message });
        return message;
    };

    JoinNewGameMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        {
            let error = $root.NetGameInfo.verify(message.gameInfo, _depth + 1);
            if (error)
                return "gameInfo." + error;
        }
        if (message.password != null && message.hasOwnProperty("password"))
            if (!$util.isString(message.password))
                return "password: string expected";
        if (message.autoLeave != null && message.hasOwnProperty("autoLeave"))
            if (typeof message.autoLeave !== "boolean")
                return "autoLeave: boolean expected";
        return null;
    };

    return JoinNewGameMessage;
})();

export const RejoinExistingGameMessage = $root.RejoinExistingGameMessage = (() => {

    function RejoinExistingGameMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    RejoinExistingGameMessage.prototype.gameId = 0;
    RejoinExistingGameMessage.prototype.autoLeave = false;

    RejoinExistingGameMessage.create = function create(properties) {
        return new RejoinExistingGameMessage(properties);
    };

    RejoinExistingGameMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        if (message.autoLeave != null && Object.hasOwnProperty.call(message, "autoLeave"))
            writer.uint32(16).bool(message.autoLeave);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    RejoinExistingGameMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.RejoinExistingGameMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.autoLeave = reader.bool();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        return message;
    };

    RejoinExistingGameMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (message.autoLeave != null && message.hasOwnProperty("autoLeave"))
            if (typeof message.autoLeave !== "boolean")
                return "autoLeave: boolean expected";
        return null;
    };

    return RejoinExistingGameMessage;
})();

export const JoinGameAckMessage = $root.JoinGameAckMessage = (() => {

    function JoinGameAckMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    JoinGameAckMessage.prototype.gameId = 0;
    JoinGameAckMessage.prototype.areYouGameAdmin = false;
    JoinGameAckMessage.prototype.gameInfo = null;
    JoinGameAckMessage.prototype.spectateOnly = false;

    JoinGameAckMessage.create = function create(properties) {
        return new JoinGameAckMessage(properties);
    };

    JoinGameAckMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).bool(message.areYouGameAdmin);
        $root.NetGameInfo.encode(message.gameInfo, writer.uint32(26).fork(), _depth + 1).ldelim();
        if (message.spectateOnly != null && Object.hasOwnProperty.call(message, "spectateOnly"))
            writer.uint32(32).bool(message.spectateOnly);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    JoinGameAckMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.JoinGameAckMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.areYouGameAdmin = reader.bool();
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.gameInfo = $root.NetGameInfo.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameInfo);
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.spectateOnly = reader.bool();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("areYouGameAdmin"))
            throw $util.ProtocolError("missing required 'areYouGameAdmin'", { instance: message });
        if (!message.hasOwnProperty("gameInfo"))
            throw $util.ProtocolError("missing required 'gameInfo'", { instance: message });
        return message;
    };

    JoinGameAckMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (typeof message.areYouGameAdmin !== "boolean")
            return "areYouGameAdmin: boolean expected";
        {
            let error = $root.NetGameInfo.verify(message.gameInfo, _depth + 1);
            if (error)
                return "gameInfo." + error;
        }
        if (message.spectateOnly != null && message.hasOwnProperty("spectateOnly"))
            if (typeof message.spectateOnly !== "boolean")
                return "spectateOnly: boolean expected";
        return null;
    };

    return JoinGameAckMessage;
})();

export const JoinGameFailedMessage = $root.JoinGameFailedMessage = (() => {

    function JoinGameFailedMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    JoinGameFailedMessage.prototype.gameId = 0;
    JoinGameFailedMessage.prototype.joinGameFailureReason = 1;

    JoinGameFailedMessage.create = function create(properties) {
        return new JoinGameFailedMessage(properties);
    };

    JoinGameFailedMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).int32(message.joinGameFailureReason);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    JoinGameFailedMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.JoinGameFailedMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.joinGameFailureReason = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("joinGameFailureReason"))
            throw $util.ProtocolError("missing required 'joinGameFailureReason'", { instance: message });
        return message;
    };

    JoinGameFailedMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        switch (message.joinGameFailureReason) {
        default:
            return "joinGameFailureReason: enum value expected";
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
            break;
        }
        return null;
    };

    JoinGameFailedMessage.JoinGameFailureReason = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "invalidGame"] = 1;
        values[valuesById[2] = "gameIsFull"] = 2;
        values[valuesById[3] = "gameIsRunning"] = 3;
        values[valuesById[4] = "invalidPassword"] = 4;
        values[valuesById[5] = "notAllowedAsGuest"] = 5;
        values[valuesById[6] = "notInvited"] = 6;
        values[valuesById[7] = "gameNameInUse"] = 7;
        values[valuesById[8] = "badGameName"] = 8;
        values[valuesById[9] = "invalidSettings"] = 9;
        values[valuesById[10] = "ipAddressBlocked"] = 10;
        values[valuesById[11] = "rejoinFailed"] = 11;
        values[valuesById[12] = "noSpectatorsAllowed"] = 12;
        return values;
    })();

    return JoinGameFailedMessage;
})();

export const GamePlayerJoinedMessage = $root.GamePlayerJoinedMessage = (() => {

    function GamePlayerJoinedMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GamePlayerJoinedMessage.prototype.gameId = 0;
    GamePlayerJoinedMessage.prototype.playerId = 0;
    GamePlayerJoinedMessage.prototype.isGameAdmin = false;

    GamePlayerJoinedMessage.create = function create(properties) {
        return new GamePlayerJoinedMessage(properties);
    };

    GamePlayerJoinedMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        writer.uint32(24).bool(message.isGameAdmin);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GamePlayerJoinedMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GamePlayerJoinedMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.isGameAdmin = reader.bool();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        if (!message.hasOwnProperty("isGameAdmin"))
            throw $util.ProtocolError("missing required 'isGameAdmin'", { instance: message });
        return message;
    };

    GamePlayerJoinedMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        if (typeof message.isGameAdmin !== "boolean")
            return "isGameAdmin: boolean expected";
        return null;
    };

    return GamePlayerJoinedMessage;
})();

export const GamePlayerLeftMessage = $root.GamePlayerLeftMessage = (() => {

    function GamePlayerLeftMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GamePlayerLeftMessage.prototype.gameId = 0;
    GamePlayerLeftMessage.prototype.playerId = 0;
    GamePlayerLeftMessage.prototype.gamePlayerLeftReason = 0;

    GamePlayerLeftMessage.create = function create(properties) {
        return new GamePlayerLeftMessage(properties);
    };

    GamePlayerLeftMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        writer.uint32(24).int32(message.gamePlayerLeftReason);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GamePlayerLeftMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GamePlayerLeftMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.gamePlayerLeftReason = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        if (!message.hasOwnProperty("gamePlayerLeftReason"))
            throw $util.ProtocolError("missing required 'gamePlayerLeftReason'", { instance: message });
        return message;
    };

    GamePlayerLeftMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        switch (message.gamePlayerLeftReason) {
        default:
            return "gamePlayerLeftReason: enum value expected";
        case 0:
        case 1:
        case 2:
            break;
        }
        return null;
    };

    GamePlayerLeftMessage.GamePlayerLeftReason = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "leftOnRequest"] = 0;
        values[valuesById[1] = "leftKicked"] = 1;
        values[valuesById[2] = "leftError"] = 2;
        return values;
    })();

    return GamePlayerLeftMessage;
})();

export const GameSpectatorJoinedMessage = $root.GameSpectatorJoinedMessage = (() => {

    function GameSpectatorJoinedMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameSpectatorJoinedMessage.prototype.gameId = 0;
    GameSpectatorJoinedMessage.prototype.playerId = 0;

    GameSpectatorJoinedMessage.create = function create(properties) {
        return new GameSpectatorJoinedMessage(properties);
    };

    GameSpectatorJoinedMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameSpectatorJoinedMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameSpectatorJoinedMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        return message;
    };

    GameSpectatorJoinedMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        return null;
    };

    return GameSpectatorJoinedMessage;
})();

export const GameSpectatorLeftMessage = $root.GameSpectatorLeftMessage = (() => {

    function GameSpectatorLeftMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameSpectatorLeftMessage.prototype.gameId = 0;
    GameSpectatorLeftMessage.prototype.playerId = 0;
    GameSpectatorLeftMessage.prototype.gameSpectatorLeftReason = 0;

    GameSpectatorLeftMessage.create = function create(properties) {
        return new GameSpectatorLeftMessage(properties);
    };

    GameSpectatorLeftMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        writer.uint32(24).int32(message.gameSpectatorLeftReason);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameSpectatorLeftMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameSpectatorLeftMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.gameSpectatorLeftReason = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        if (!message.hasOwnProperty("gameSpectatorLeftReason"))
            throw $util.ProtocolError("missing required 'gameSpectatorLeftReason'", { instance: message });
        return message;
    };

    GameSpectatorLeftMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        switch (message.gameSpectatorLeftReason) {
        default:
            return "gameSpectatorLeftReason: enum value expected";
        case 0:
        case 1:
        case 2:
            break;
        }
        return null;
    };

    return GameSpectatorLeftMessage;
})();

export const GameAdminChangedMessage = $root.GameAdminChangedMessage = (() => {

    function GameAdminChangedMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameAdminChangedMessage.prototype.gameId = 0;
    GameAdminChangedMessage.prototype.newAdminPlayerId = 0;

    GameAdminChangedMessage.create = function create(properties) {
        return new GameAdminChangedMessage(properties);
    };

    GameAdminChangedMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.newAdminPlayerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameAdminChangedMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameAdminChangedMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.newAdminPlayerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("newAdminPlayerId"))
            throw $util.ProtocolError("missing required 'newAdminPlayerId'", { instance: message });
        return message;
    };

    GameAdminChangedMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.newAdminPlayerId))
            return "newAdminPlayerId: integer expected";
        return null;
    };

    return GameAdminChangedMessage;
})();

export const RemovedFromGameMessage = $root.RemovedFromGameMessage = (() => {

    function RemovedFromGameMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    RemovedFromGameMessage.prototype.gameId = 0;
    RemovedFromGameMessage.prototype.removedFromGameReason = 0;

    RemovedFromGameMessage.create = function create(properties) {
        return new RemovedFromGameMessage(properties);
    };

    RemovedFromGameMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).int32(message.removedFromGameReason);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    RemovedFromGameMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.RemovedFromGameMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.removedFromGameReason = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("removedFromGameReason"))
            throw $util.ProtocolError("missing required 'removedFromGameReason'", { instance: message });
        return message;
    };

    RemovedFromGameMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        switch (message.removedFromGameReason) {
        default:
            return "removedFromGameReason: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            break;
        }
        return null;
    };

    RemovedFromGameMessage.RemovedFromGameReason = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "removedOnRequest"] = 0;
        values[valuesById[1] = "kickedFromGame"] = 1;
        values[valuesById[2] = "gameIsFull"] = 2;
        values[valuesById[3] = "gameIsRunning"] = 3;
        values[valuesById[4] = "gameTimeout"] = 4;
        values[valuesById[5] = "removedStartFailed"] = 5;
        values[valuesById[6] = "gameClosed"] = 6;
        return values;
    })();

    return RemovedFromGameMessage;
})();

export const KickPlayerRequestMessage = $root.KickPlayerRequestMessage = (() => {

    function KickPlayerRequestMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    KickPlayerRequestMessage.prototype.gameId = 0;
    KickPlayerRequestMessage.prototype.playerId = 0;

    KickPlayerRequestMessage.create = function create(properties) {
        return new KickPlayerRequestMessage(properties);
    };

    KickPlayerRequestMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    KickPlayerRequestMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.KickPlayerRequestMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        return message;
    };

    KickPlayerRequestMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        return null;
    };

    return KickPlayerRequestMessage;
})();

export const LeaveGameRequestMessage = $root.LeaveGameRequestMessage = (() => {

    function LeaveGameRequestMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    LeaveGameRequestMessage.prototype.gameId = 0;

    LeaveGameRequestMessage.create = function create(properties) {
        return new LeaveGameRequestMessage(properties);
    };

    LeaveGameRequestMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    LeaveGameRequestMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.LeaveGameRequestMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        return message;
    };

    LeaveGameRequestMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        return null;
    };

    return LeaveGameRequestMessage;
})();

export const InvitePlayerToGameMessage = $root.InvitePlayerToGameMessage = (() => {

    function InvitePlayerToGameMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    InvitePlayerToGameMessage.prototype.gameId = 0;
    InvitePlayerToGameMessage.prototype.playerId = 0;

    InvitePlayerToGameMessage.create = function create(properties) {
        return new InvitePlayerToGameMessage(properties);
    };

    InvitePlayerToGameMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    InvitePlayerToGameMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.InvitePlayerToGameMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        return message;
    };

    InvitePlayerToGameMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        return null;
    };

    return InvitePlayerToGameMessage;
})();

export const InviteNotifyMessage = $root.InviteNotifyMessage = (() => {

    function InviteNotifyMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    InviteNotifyMessage.prototype.gameId = 0;
    InviteNotifyMessage.prototype.playerIdWho = 0;
    InviteNotifyMessage.prototype.playerIdByWhom = 0;

    InviteNotifyMessage.create = function create(properties) {
        return new InviteNotifyMessage(properties);
    };

    InviteNotifyMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerIdWho);
        writer.uint32(24).uint32(message.playerIdByWhom);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    InviteNotifyMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.InviteNotifyMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerIdWho = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.playerIdByWhom = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerIdWho"))
            throw $util.ProtocolError("missing required 'playerIdWho'", { instance: message });
        if (!message.hasOwnProperty("playerIdByWhom"))
            throw $util.ProtocolError("missing required 'playerIdByWhom'", { instance: message });
        return message;
    };

    InviteNotifyMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerIdWho))
            return "playerIdWho: integer expected";
        if (!$util.isInteger(message.playerIdByWhom))
            return "playerIdByWhom: integer expected";
        return null;
    };

    return InviteNotifyMessage;
})();

export const RejectGameInvitationMessage = $root.RejectGameInvitationMessage = (() => {

    function RejectGameInvitationMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    RejectGameInvitationMessage.prototype.gameId = 0;
    RejectGameInvitationMessage.prototype.myRejectReason = 0;

    RejectGameInvitationMessage.create = function create(properties) {
        return new RejectGameInvitationMessage(properties);
    };

    RejectGameInvitationMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).int32(message.myRejectReason);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    RejectGameInvitationMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.RejectGameInvitationMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.myRejectReason = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("myRejectReason"))
            throw $util.ProtocolError("missing required 'myRejectReason'", { instance: message });
        return message;
    };

    RejectGameInvitationMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        switch (message.myRejectReason) {
        default:
            return "myRejectReason: enum value expected";
        case 0:
        case 1:
            break;
        }
        return null;
    };

    RejectGameInvitationMessage.RejectGameInvReason = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "rejectReasonNo"] = 0;
        values[valuesById[1] = "rejectReasonBusy"] = 1;
        return values;
    })();

    return RejectGameInvitationMessage;
})();

export const RejectInvNotifyMessage = $root.RejectInvNotifyMessage = (() => {

    function RejectInvNotifyMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    RejectInvNotifyMessage.prototype.gameId = 0;
    RejectInvNotifyMessage.prototype.playerId = 0;
    RejectInvNotifyMessage.prototype.playerRejectReason = 0;

    RejectInvNotifyMessage.create = function create(properties) {
        return new RejectInvNotifyMessage(properties);
    };

    RejectInvNotifyMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        writer.uint32(24).int32(message.playerRejectReason);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    RejectInvNotifyMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.RejectInvNotifyMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.playerRejectReason = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        if (!message.hasOwnProperty("playerRejectReason"))
            throw $util.ProtocolError("missing required 'playerRejectReason'", { instance: message });
        return message;
    };

    RejectInvNotifyMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        switch (message.playerRejectReason) {
        default:
            return "playerRejectReason: enum value expected";
        case 0:
        case 1:
            break;
        }
        return null;
    };

    return RejectInvNotifyMessage;
})();

export const StartEventMessage = $root.StartEventMessage = (() => {

    function StartEventMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    StartEventMessage.prototype.gameId = 0;
    StartEventMessage.prototype.startEventType = 0;
    StartEventMessage.prototype.fillWithComputerPlayers = false;

    StartEventMessage.create = function create(properties) {
        return new StartEventMessage(properties);
    };

    StartEventMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).int32(message.startEventType);
        if (message.fillWithComputerPlayers != null && Object.hasOwnProperty.call(message, "fillWithComputerPlayers"))
            writer.uint32(24).bool(message.fillWithComputerPlayers);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    StartEventMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.StartEventMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.startEventType = reader.int32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.fillWithComputerPlayers = reader.bool();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("startEventType"))
            throw $util.ProtocolError("missing required 'startEventType'", { instance: message });
        return message;
    };

    StartEventMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        switch (message.startEventType) {
        default:
            return "startEventType: enum value expected";
        case 0:
        case 1:
            break;
        }
        if (message.fillWithComputerPlayers != null && message.hasOwnProperty("fillWithComputerPlayers"))
            if (typeof message.fillWithComputerPlayers !== "boolean")
                return "fillWithComputerPlayers: boolean expected";
        return null;
    };

    StartEventMessage.StartEventType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "startEvent"] = 0;
        values[valuesById[1] = "rejoinEvent"] = 1;
        return values;
    })();

    return StartEventMessage;
})();

export const StartEventAckMessage = $root.StartEventAckMessage = (() => {

    function StartEventAckMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    StartEventAckMessage.prototype.gameId = 0;

    StartEventAckMessage.create = function create(properties) {
        return new StartEventAckMessage(properties);
    };

    StartEventAckMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    StartEventAckMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.StartEventAckMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        return message;
    };

    StartEventAckMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        return null;
    };

    return StartEventAckMessage;
})();

export const GameStartInitialMessage = $root.GameStartInitialMessage = (() => {

    function GameStartInitialMessage(properties) {
        this.playerSeats = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameStartInitialMessage.prototype.gameId = 0;
    GameStartInitialMessage.prototype.startDealerPlayerId = 0;
    GameStartInitialMessage.prototype.playerSeats = $util.emptyArray;

    GameStartInitialMessage.create = function create(properties) {
        return new GameStartInitialMessage(properties);
    };

    GameStartInitialMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.startDealerPlayerId);
        if (message.playerSeats != null && message.playerSeats.length) {
            writer.uint32(26).fork();
            for (let i = 0; i < message.playerSeats.length; ++i)
                writer.uint32(message.playerSeats[i]);
            writer.ldelim();
        }
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameStartInitialMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameStartInitialMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.startDealerPlayerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType === 2) {
                        if (!(message.playerSeats && message.playerSeats.length))
                            message.playerSeats = [];
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.playerSeats.push(reader.uint32());
                        continue;
                    }
                    if (wireType !== 0)
                        break;
                    if (!(message.playerSeats && message.playerSeats.length))
                        message.playerSeats = [];
                    message.playerSeats.push(reader.uint32());
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("startDealerPlayerId"))
            throw $util.ProtocolError("missing required 'startDealerPlayerId'", { instance: message });
        return message;
    };

    GameStartInitialMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.startDealerPlayerId))
            return "startDealerPlayerId: integer expected";
        if (message.playerSeats != null && message.hasOwnProperty("playerSeats")) {
            if (!Array.isArray(message.playerSeats))
                return "playerSeats: array expected";
            for (let i = 0; i < message.playerSeats.length; ++i)
                if (!$util.isInteger(message.playerSeats[i]))
                    return "playerSeats: integer[] expected";
        }
        return null;
    };

    return GameStartInitialMessage;
})();

export const GameStartRejoinMessage = $root.GameStartRejoinMessage = (() => {

    function GameStartRejoinMessage(properties) {
        this.rejoinPlayerData = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    GameStartRejoinMessage.prototype.gameId = 0;
    GameStartRejoinMessage.prototype.startDealerPlayerId = 0;
    GameStartRejoinMessage.prototype.handNum = 0;
    GameStartRejoinMessage.prototype.rejoinPlayerData = $util.emptyArray;

    GameStartRejoinMessage.create = function create(properties) {
        return new GameStartRejoinMessage(properties);
    };

    GameStartRejoinMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.startDealerPlayerId);
        writer.uint32(24).uint32(message.handNum);
        if (message.rejoinPlayerData != null && message.rejoinPlayerData.length)
            for (let i = 0; i < message.rejoinPlayerData.length; ++i)
                $root.GameStartRejoinMessage.RejoinPlayerData.encode(message.rejoinPlayerData[i], writer.uint32(34).fork(), _depth + 1).ldelim();
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    GameStartRejoinMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameStartRejoinMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.startDealerPlayerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.handNum = reader.uint32();
                    continue;
                }
            case 4: {
                    if (wireType !== 2)
                        break;
                    if (!(message.rejoinPlayerData && message.rejoinPlayerData.length))
                        message.rejoinPlayerData = [];
                    message.rejoinPlayerData.push($root.GameStartRejoinMessage.RejoinPlayerData.decode(reader, reader.uint32(), undefined, _depth + 1));
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("startDealerPlayerId"))
            throw $util.ProtocolError("missing required 'startDealerPlayerId'", { instance: message });
        if (!message.hasOwnProperty("handNum"))
            throw $util.ProtocolError("missing required 'handNum'", { instance: message });
        return message;
    };

    GameStartRejoinMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.startDealerPlayerId))
            return "startDealerPlayerId: integer expected";
        if (!$util.isInteger(message.handNum))
            return "handNum: integer expected";
        if (message.rejoinPlayerData != null && message.hasOwnProperty("rejoinPlayerData")) {
            if (!Array.isArray(message.rejoinPlayerData))
                return "rejoinPlayerData: array expected";
            for (let i = 0; i < message.rejoinPlayerData.length; ++i) {
                let error = $root.GameStartRejoinMessage.RejoinPlayerData.verify(message.rejoinPlayerData[i], _depth + 1);
                if (error)
                    return "rejoinPlayerData." + error;
            }
        }
        return null;
    };

    GameStartRejoinMessage.RejoinPlayerData = (function() {

        function RejoinPlayerData(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        RejoinPlayerData.prototype.playerId = 0;
        RejoinPlayerData.prototype.playerMoney = 0;

        RejoinPlayerData.create = function create(properties) {
            return new RejoinPlayerData(properties);
        };

        RejoinPlayerData.encode = function encode(message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            writer.uint32(8).uint32(message.playerId);
            writer.uint32(16).uint32(message.playerMoney);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        RejoinPlayerData.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.GameStartRejoinMessage.RejoinPlayerData();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.playerId = reader.uint32();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.playerMoney = reader.uint32();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            if (!message.hasOwnProperty("playerId"))
                throw $util.ProtocolError("missing required 'playerId'", { instance: message });
            if (!message.hasOwnProperty("playerMoney"))
                throw $util.ProtocolError("missing required 'playerMoney'", { instance: message });
            return message;
        };

        RejoinPlayerData.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (!$util.isInteger(message.playerId))
                return "playerId: integer expected";
            if (!$util.isInteger(message.playerMoney))
                return "playerMoney: integer expected";
            return null;
        };

        return RejoinPlayerData;
    })();

    return GameStartRejoinMessage;
})();

export const HandStartMessage = $root.HandStartMessage = (() => {

    function HandStartMessage(properties) {
        this.seatStates = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    HandStartMessage.prototype.gameId = 0;
    HandStartMessage.prototype.plainCards = null;
    HandStartMessage.prototype.encryptedCards = $util.newBuffer([]);
    HandStartMessage.prototype.smallBlind = 0;
    HandStartMessage.prototype.seatStates = $util.emptyArray;
    HandStartMessage.prototype.dealerPlayerId = 0;

    HandStartMessage.create = function create(properties) {
        return new HandStartMessage(properties);
    };

    HandStartMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        if (message.plainCards != null && Object.hasOwnProperty.call(message, "plainCards"))
            $root.HandStartMessage.PlainCards.encode(message.plainCards, writer.uint32(18).fork(), _depth + 1).ldelim();
        if (message.encryptedCards != null && Object.hasOwnProperty.call(message, "encryptedCards"))
            writer.uint32(26).bytes(message.encryptedCards);
        writer.uint32(32).uint32(message.smallBlind);
        if (message.seatStates != null && message.seatStates.length)
            for (let i = 0; i < message.seatStates.length; ++i)
                writer.uint32(40).int32(message.seatStates[i]);
        if (message.dealerPlayerId != null && Object.hasOwnProperty.call(message, "dealerPlayerId"))
            writer.uint32(48).uint32(message.dealerPlayerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    HandStartMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.HandStartMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.plainCards = $root.HandStartMessage.PlainCards.decode(reader, reader.uint32(), undefined, _depth + 1, message.plainCards);
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.encryptedCards = reader.bytes();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.smallBlind = reader.uint32();
                    continue;
                }
            case 5: {
                    if (wireType === 2) {
                        if (!(message.seatStates && message.seatStates.length))
                            message.seatStates = [];
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.seatStates.push(reader.int32());
                        continue;
                    }
                    if (wireType !== 0)
                        break;
                    if (!(message.seatStates && message.seatStates.length))
                        message.seatStates = [];
                    message.seatStates.push(reader.int32());
                    continue;
                }
            case 6: {
                    if (wireType !== 0)
                        break;
                    message.dealerPlayerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("smallBlind"))
            throw $util.ProtocolError("missing required 'smallBlind'", { instance: message });
        return message;
    };

    HandStartMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (message.plainCards != null && message.hasOwnProperty("plainCards")) {
            let error = $root.HandStartMessage.PlainCards.verify(message.plainCards, _depth + 1);
            if (error)
                return "plainCards." + error;
        }
        if (message.encryptedCards != null && message.hasOwnProperty("encryptedCards"))
            if (!(message.encryptedCards && typeof message.encryptedCards.length === "number" || $util.isString(message.encryptedCards)))
                return "encryptedCards: buffer expected";
        if (!$util.isInteger(message.smallBlind))
            return "smallBlind: integer expected";
        if (message.seatStates != null && message.hasOwnProperty("seatStates")) {
            if (!Array.isArray(message.seatStates))
                return "seatStates: array expected";
            for (let i = 0; i < message.seatStates.length; ++i)
                switch (message.seatStates[i]) {
                default:
                    return "seatStates: enum value[] expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
        }
        if (message.dealerPlayerId != null && message.hasOwnProperty("dealerPlayerId"))
            if (!$util.isInteger(message.dealerPlayerId))
                return "dealerPlayerId: integer expected";
        return null;
    };

    HandStartMessage.PlainCards = (function() {

        function PlainCards(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        PlainCards.prototype.plainCard1 = 0;
        PlainCards.prototype.plainCard2 = 0;

        PlainCards.create = function create(properties) {
            return new PlainCards(properties);
        };

        PlainCards.encode = function encode(message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            writer.uint32(8).uint32(message.plainCard1);
            writer.uint32(16).uint32(message.plainCard2);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        PlainCards.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.HandStartMessage.PlainCards();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.plainCard1 = reader.uint32();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.plainCard2 = reader.uint32();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            if (!message.hasOwnProperty("plainCard1"))
                throw $util.ProtocolError("missing required 'plainCard1'", { instance: message });
            if (!message.hasOwnProperty("plainCard2"))
                throw $util.ProtocolError("missing required 'plainCard2'", { instance: message });
            return message;
        };

        PlainCards.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (!$util.isInteger(message.plainCard1))
                return "plainCard1: integer expected";
            if (!$util.isInteger(message.plainCard2))
                return "plainCard2: integer expected";
            return null;
        };

        return PlainCards;
    })();

    return HandStartMessage;
})();

export const PlayersTurnMessage = $root.PlayersTurnMessage = (() => {

    function PlayersTurnMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    PlayersTurnMessage.prototype.gameId = 0;
    PlayersTurnMessage.prototype.playerId = 0;
    PlayersTurnMessage.prototype.gameState = 0;

    PlayersTurnMessage.create = function create(properties) {
        return new PlayersTurnMessage(properties);
    };

    PlayersTurnMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        writer.uint32(24).int32(message.gameState);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    PlayersTurnMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.PlayersTurnMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.gameState = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        if (!message.hasOwnProperty("gameState"))
            throw $util.ProtocolError("missing required 'gameState'", { instance: message });
        return message;
    };

    PlayersTurnMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        switch (message.gameState) {
        default:
            return "gameState: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            break;
        }
        return null;
    };

    return PlayersTurnMessage;
})();

export const MyActionRequestMessage = $root.MyActionRequestMessage = (() => {

    function MyActionRequestMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    MyActionRequestMessage.prototype.gameId = 0;
    MyActionRequestMessage.prototype.handNum = 0;
    MyActionRequestMessage.prototype.gameState = 0;
    MyActionRequestMessage.prototype.myAction = 0;
    MyActionRequestMessage.prototype.myRelativeBet = 0;

    MyActionRequestMessage.create = function create(properties) {
        return new MyActionRequestMessage(properties);
    };

    MyActionRequestMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.handNum);
        writer.uint32(24).int32(message.gameState);
        writer.uint32(32).int32(message.myAction);
        writer.uint32(40).uint32(message.myRelativeBet);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    MyActionRequestMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.MyActionRequestMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.handNum = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.gameState = reader.int32();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.myAction = reader.int32();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.myRelativeBet = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("handNum"))
            throw $util.ProtocolError("missing required 'handNum'", { instance: message });
        if (!message.hasOwnProperty("gameState"))
            throw $util.ProtocolError("missing required 'gameState'", { instance: message });
        if (!message.hasOwnProperty("myAction"))
            throw $util.ProtocolError("missing required 'myAction'", { instance: message });
        if (!message.hasOwnProperty("myRelativeBet"))
            throw $util.ProtocolError("missing required 'myRelativeBet'", { instance: message });
        return message;
    };

    MyActionRequestMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.handNum))
            return "handNum: integer expected";
        switch (message.gameState) {
        default:
            return "gameState: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            break;
        }
        switch (message.myAction) {
        default:
            return "myAction: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            break;
        }
        if (!$util.isInteger(message.myRelativeBet))
            return "myRelativeBet: integer expected";
        return null;
    };

    return MyActionRequestMessage;
})();

export const YourActionRejectedMessage = $root.YourActionRejectedMessage = (() => {

    function YourActionRejectedMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    YourActionRejectedMessage.prototype.gameId = 0;
    YourActionRejectedMessage.prototype.gameState = 0;
    YourActionRejectedMessage.prototype.yourAction = 0;
    YourActionRejectedMessage.prototype.yourRelativeBet = 0;
    YourActionRejectedMessage.prototype.rejectionReason = 1;

    YourActionRejectedMessage.create = function create(properties) {
        return new YourActionRejectedMessage(properties);
    };

    YourActionRejectedMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).int32(message.gameState);
        writer.uint32(24).int32(message.yourAction);
        writer.uint32(32).uint32(message.yourRelativeBet);
        writer.uint32(40).int32(message.rejectionReason);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    YourActionRejectedMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.YourActionRejectedMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.gameState = reader.int32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.yourAction = reader.int32();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.yourRelativeBet = reader.uint32();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.rejectionReason = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("gameState"))
            throw $util.ProtocolError("missing required 'gameState'", { instance: message });
        if (!message.hasOwnProperty("yourAction"))
            throw $util.ProtocolError("missing required 'yourAction'", { instance: message });
        if (!message.hasOwnProperty("yourRelativeBet"))
            throw $util.ProtocolError("missing required 'yourRelativeBet'", { instance: message });
        if (!message.hasOwnProperty("rejectionReason"))
            throw $util.ProtocolError("missing required 'rejectionReason'", { instance: message });
        return message;
    };

    YourActionRejectedMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        switch (message.gameState) {
        default:
            return "gameState: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            break;
        }
        switch (message.yourAction) {
        default:
            return "yourAction: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            break;
        }
        if (!$util.isInteger(message.yourRelativeBet))
            return "yourRelativeBet: integer expected";
        switch (message.rejectionReason) {
        default:
            return "rejectionReason: enum value expected";
        case 1:
        case 2:
        case 3:
            break;
        }
        return null;
    };

    YourActionRejectedMessage.RejectionReason = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "rejectedInvalidGameState"] = 1;
        values[valuesById[2] = "rejectedNotYourTurn"] = 2;
        values[valuesById[3] = "rejectedActionNotAllowed"] = 3;
        return values;
    })();

    return YourActionRejectedMessage;
})();

export const PlayersActionDoneMessage = $root.PlayersActionDoneMessage = (() => {

    function PlayersActionDoneMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    PlayersActionDoneMessage.prototype.gameId = 0;
    PlayersActionDoneMessage.prototype.playerId = 0;
    PlayersActionDoneMessage.prototype.gameState = 0;
    PlayersActionDoneMessage.prototype.playerAction = 0;
    PlayersActionDoneMessage.prototype.totalPlayerBet = 0;
    PlayersActionDoneMessage.prototype.playerMoney = 0;
    PlayersActionDoneMessage.prototype.highestSet = 0;
    PlayersActionDoneMessage.prototype.minimumRaise = 0;

    PlayersActionDoneMessage.create = function create(properties) {
        return new PlayersActionDoneMessage(properties);
    };

    PlayersActionDoneMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        writer.uint32(24).int32(message.gameState);
        writer.uint32(32).int32(message.playerAction);
        writer.uint32(40).uint32(message.totalPlayerBet);
        writer.uint32(48).uint32(message.playerMoney);
        writer.uint32(56).uint32(message.highestSet);
        writer.uint32(64).uint32(message.minimumRaise);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    PlayersActionDoneMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.PlayersActionDoneMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.gameState = reader.int32();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.playerAction = reader.int32();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.totalPlayerBet = reader.uint32();
                    continue;
                }
            case 6: {
                    if (wireType !== 0)
                        break;
                    message.playerMoney = reader.uint32();
                    continue;
                }
            case 7: {
                    if (wireType !== 0)
                        break;
                    message.highestSet = reader.uint32();
                    continue;
                }
            case 8: {
                    if (wireType !== 0)
                        break;
                    message.minimumRaise = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        if (!message.hasOwnProperty("gameState"))
            throw $util.ProtocolError("missing required 'gameState'", { instance: message });
        if (!message.hasOwnProperty("playerAction"))
            throw $util.ProtocolError("missing required 'playerAction'", { instance: message });
        if (!message.hasOwnProperty("totalPlayerBet"))
            throw $util.ProtocolError("missing required 'totalPlayerBet'", { instance: message });
        if (!message.hasOwnProperty("playerMoney"))
            throw $util.ProtocolError("missing required 'playerMoney'", { instance: message });
        if (!message.hasOwnProperty("highestSet"))
            throw $util.ProtocolError("missing required 'highestSet'", { instance: message });
        if (!message.hasOwnProperty("minimumRaise"))
            throw $util.ProtocolError("missing required 'minimumRaise'", { instance: message });
        return message;
    };

    PlayersActionDoneMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        switch (message.gameState) {
        default:
            return "gameState: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            break;
        }
        switch (message.playerAction) {
        default:
            return "playerAction: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            break;
        }
        if (!$util.isInteger(message.totalPlayerBet))
            return "totalPlayerBet: integer expected";
        if (!$util.isInteger(message.playerMoney))
            return "playerMoney: integer expected";
        if (!$util.isInteger(message.highestSet))
            return "highestSet: integer expected";
        if (!$util.isInteger(message.minimumRaise))
            return "minimumRaise: integer expected";
        return null;
    };

    return PlayersActionDoneMessage;
})();

export const DealFlopCardsMessage = $root.DealFlopCardsMessage = (() => {

    function DealFlopCardsMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    DealFlopCardsMessage.prototype.gameId = 0;
    DealFlopCardsMessage.prototype.flopCard1 = 0;
    DealFlopCardsMessage.prototype.flopCard2 = 0;
    DealFlopCardsMessage.prototype.flopCard3 = 0;

    DealFlopCardsMessage.create = function create(properties) {
        return new DealFlopCardsMessage(properties);
    };

    DealFlopCardsMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.flopCard1);
        writer.uint32(24).uint32(message.flopCard2);
        writer.uint32(32).uint32(message.flopCard3);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    DealFlopCardsMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.DealFlopCardsMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.flopCard1 = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.flopCard2 = reader.uint32();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.flopCard3 = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("flopCard1"))
            throw $util.ProtocolError("missing required 'flopCard1'", { instance: message });
        if (!message.hasOwnProperty("flopCard2"))
            throw $util.ProtocolError("missing required 'flopCard2'", { instance: message });
        if (!message.hasOwnProperty("flopCard3"))
            throw $util.ProtocolError("missing required 'flopCard3'", { instance: message });
        return message;
    };

    DealFlopCardsMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.flopCard1))
            return "flopCard1: integer expected";
        if (!$util.isInteger(message.flopCard2))
            return "flopCard2: integer expected";
        if (!$util.isInteger(message.flopCard3))
            return "flopCard3: integer expected";
        return null;
    };

    return DealFlopCardsMessage;
})();

export const DealTurnCardMessage = $root.DealTurnCardMessage = (() => {

    function DealTurnCardMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    DealTurnCardMessage.prototype.gameId = 0;
    DealTurnCardMessage.prototype.turnCard = 0;

    DealTurnCardMessage.create = function create(properties) {
        return new DealTurnCardMessage(properties);
    };

    DealTurnCardMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.turnCard);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    DealTurnCardMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.DealTurnCardMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.turnCard = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("turnCard"))
            throw $util.ProtocolError("missing required 'turnCard'", { instance: message });
        return message;
    };

    DealTurnCardMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.turnCard))
            return "turnCard: integer expected";
        return null;
    };

    return DealTurnCardMessage;
})();

export const DealRiverCardMessage = $root.DealRiverCardMessage = (() => {

    function DealRiverCardMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    DealRiverCardMessage.prototype.gameId = 0;
    DealRiverCardMessage.prototype.riverCard = 0;

    DealRiverCardMessage.create = function create(properties) {
        return new DealRiverCardMessage(properties);
    };

    DealRiverCardMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.riverCard);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    DealRiverCardMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.DealRiverCardMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.riverCard = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("riverCard"))
            throw $util.ProtocolError("missing required 'riverCard'", { instance: message });
        return message;
    };

    DealRiverCardMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.riverCard))
            return "riverCard: integer expected";
        return null;
    };

    return DealRiverCardMessage;
})();

export const AllInShowCardsMessage = $root.AllInShowCardsMessage = (() => {

    function AllInShowCardsMessage(properties) {
        this.playersAllIn = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AllInShowCardsMessage.prototype.gameId = 0;
    AllInShowCardsMessage.prototype.playersAllIn = $util.emptyArray;

    AllInShowCardsMessage.create = function create(properties) {
        return new AllInShowCardsMessage(properties);
    };

    AllInShowCardsMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        if (message.playersAllIn != null && message.playersAllIn.length)
            for (let i = 0; i < message.playersAllIn.length; ++i)
                $root.AllInShowCardsMessage.PlayerAllIn.encode(message.playersAllIn[i], writer.uint32(18).fork(), _depth + 1).ldelim();
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AllInShowCardsMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AllInShowCardsMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    if (!(message.playersAllIn && message.playersAllIn.length))
                        message.playersAllIn = [];
                    message.playersAllIn.push($root.AllInShowCardsMessage.PlayerAllIn.decode(reader, reader.uint32(), undefined, _depth + 1));
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        return message;
    };

    AllInShowCardsMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (message.playersAllIn != null && message.hasOwnProperty("playersAllIn")) {
            if (!Array.isArray(message.playersAllIn))
                return "playersAllIn: array expected";
            for (let i = 0; i < message.playersAllIn.length; ++i) {
                let error = $root.AllInShowCardsMessage.PlayerAllIn.verify(message.playersAllIn[i], _depth + 1);
                if (error)
                    return "playersAllIn." + error;
            }
        }
        return null;
    };

    AllInShowCardsMessage.PlayerAllIn = (function() {

        function PlayerAllIn(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        PlayerAllIn.prototype.playerId = 0;
        PlayerAllIn.prototype.allInCard1 = 0;
        PlayerAllIn.prototype.allInCard2 = 0;

        PlayerAllIn.create = function create(properties) {
            return new PlayerAllIn(properties);
        };

        PlayerAllIn.encode = function encode(message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            writer.uint32(8).uint32(message.playerId);
            writer.uint32(16).uint32(message.allInCard1);
            writer.uint32(24).uint32(message.allInCard2);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        PlayerAllIn.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AllInShowCardsMessage.PlayerAllIn();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.playerId = reader.uint32();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.allInCard1 = reader.uint32();
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        message.allInCard2 = reader.uint32();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            if (!message.hasOwnProperty("playerId"))
                throw $util.ProtocolError("missing required 'playerId'", { instance: message });
            if (!message.hasOwnProperty("allInCard1"))
                throw $util.ProtocolError("missing required 'allInCard1'", { instance: message });
            if (!message.hasOwnProperty("allInCard2"))
                throw $util.ProtocolError("missing required 'allInCard2'", { instance: message });
            return message;
        };

        PlayerAllIn.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (!$util.isInteger(message.playerId))
                return "playerId: integer expected";
            if (!$util.isInteger(message.allInCard1))
                return "allInCard1: integer expected";
            if (!$util.isInteger(message.allInCard2))
                return "allInCard2: integer expected";
            return null;
        };

        return PlayerAllIn;
    })();

    return AllInShowCardsMessage;
})();

export const EndOfHandShowCardsMessage = $root.EndOfHandShowCardsMessage = (() => {

    function EndOfHandShowCardsMessage(properties) {
        this.playerResults = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    EndOfHandShowCardsMessage.prototype.gameId = 0;
    EndOfHandShowCardsMessage.prototype.playerResults = $util.emptyArray;

    EndOfHandShowCardsMessage.create = function create(properties) {
        return new EndOfHandShowCardsMessage(properties);
    };

    EndOfHandShowCardsMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        if (message.playerResults != null && message.playerResults.length)
            for (let i = 0; i < message.playerResults.length; ++i)
                $root.PlayerResult.encode(message.playerResults[i], writer.uint32(18).fork(), _depth + 1).ldelim();
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    EndOfHandShowCardsMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.EndOfHandShowCardsMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    if (!(message.playerResults && message.playerResults.length))
                        message.playerResults = [];
                    message.playerResults.push($root.PlayerResult.decode(reader, reader.uint32(), undefined, _depth + 1));
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        return message;
    };

    EndOfHandShowCardsMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (message.playerResults != null && message.hasOwnProperty("playerResults")) {
            if (!Array.isArray(message.playerResults))
                return "playerResults: array expected";
            for (let i = 0; i < message.playerResults.length; ++i) {
                let error = $root.PlayerResult.verify(message.playerResults[i], _depth + 1);
                if (error)
                    return "playerResults." + error;
            }
        }
        return null;
    };

    return EndOfHandShowCardsMessage;
})();

export const EndOfHandHideCardsMessage = $root.EndOfHandHideCardsMessage = (() => {

    function EndOfHandHideCardsMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    EndOfHandHideCardsMessage.prototype.gameId = 0;
    EndOfHandHideCardsMessage.prototype.playerId = 0;
    EndOfHandHideCardsMessage.prototype.moneyWon = 0;
    EndOfHandHideCardsMessage.prototype.playerMoney = 0;

    EndOfHandHideCardsMessage.create = function create(properties) {
        return new EndOfHandHideCardsMessage(properties);
    };

    EndOfHandHideCardsMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        writer.uint32(24).uint32(message.moneyWon);
        writer.uint32(32).uint32(message.playerMoney);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    EndOfHandHideCardsMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.EndOfHandHideCardsMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.moneyWon = reader.uint32();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.playerMoney = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        if (!message.hasOwnProperty("moneyWon"))
            throw $util.ProtocolError("missing required 'moneyWon'", { instance: message });
        if (!message.hasOwnProperty("playerMoney"))
            throw $util.ProtocolError("missing required 'playerMoney'", { instance: message });
        return message;
    };

    EndOfHandHideCardsMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        if (!$util.isInteger(message.moneyWon))
            return "moneyWon: integer expected";
        if (!$util.isInteger(message.playerMoney))
            return "playerMoney: integer expected";
        return null;
    };

    return EndOfHandHideCardsMessage;
})();

export const ShowMyCardsRequestMessage = $root.ShowMyCardsRequestMessage = (() => {

    function ShowMyCardsRequestMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    ShowMyCardsRequestMessage.create = function create(properties) {
        return new ShowMyCardsRequestMessage(properties);
    };

    ShowMyCardsRequestMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    ShowMyCardsRequestMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.ShowMyCardsRequestMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            reader.skipType(tag & 7, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        return message;
    };

    ShowMyCardsRequestMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        return null;
    };

    return ShowMyCardsRequestMessage;
})();

export const AfterHandShowCardsMessage = $root.AfterHandShowCardsMessage = (() => {

    function AfterHandShowCardsMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AfterHandShowCardsMessage.prototype.playerResult = null;

    AfterHandShowCardsMessage.create = function create(properties) {
        return new AfterHandShowCardsMessage(properties);
    };

    AfterHandShowCardsMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        $root.PlayerResult.encode(message.playerResult, writer.uint32(10).fork(), _depth + 1).ldelim();
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AfterHandShowCardsMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AfterHandShowCardsMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.playerResult = $root.PlayerResult.decode(reader, reader.uint32(), undefined, _depth + 1, message.playerResult);
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("playerResult"))
            throw $util.ProtocolError("missing required 'playerResult'", { instance: message });
        return message;
    };

    AfterHandShowCardsMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        {
            let error = $root.PlayerResult.verify(message.playerResult, _depth + 1);
            if (error)
                return "playerResult." + error;
        }
        return null;
    };

    return AfterHandShowCardsMessage;
})();

export const EndOfGameMessage = $root.EndOfGameMessage = (() => {

    function EndOfGameMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    EndOfGameMessage.prototype.gameId = 0;
    EndOfGameMessage.prototype.winnerPlayerId = 0;

    EndOfGameMessage.create = function create(properties) {
        return new EndOfGameMessage(properties);
    };

    EndOfGameMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.winnerPlayerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    EndOfGameMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.EndOfGameMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.winnerPlayerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("winnerPlayerId"))
            throw $util.ProtocolError("missing required 'winnerPlayerId'", { instance: message });
        return message;
    };

    EndOfGameMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.winnerPlayerId))
            return "winnerPlayerId: integer expected";
        return null;
    };

    return EndOfGameMessage;
})();

export const PlayerIdChangedMessage = $root.PlayerIdChangedMessage = (() => {

    function PlayerIdChangedMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    PlayerIdChangedMessage.prototype.oldPlayerId = 0;
    PlayerIdChangedMessage.prototype.newPlayerId = 0;

    PlayerIdChangedMessage.create = function create(properties) {
        return new PlayerIdChangedMessage(properties);
    };

    PlayerIdChangedMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.oldPlayerId);
        writer.uint32(16).uint32(message.newPlayerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    PlayerIdChangedMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.PlayerIdChangedMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.oldPlayerId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.newPlayerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("oldPlayerId"))
            throw $util.ProtocolError("missing required 'oldPlayerId'", { instance: message });
        if (!message.hasOwnProperty("newPlayerId"))
            throw $util.ProtocolError("missing required 'newPlayerId'", { instance: message });
        return message;
    };

    PlayerIdChangedMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.oldPlayerId))
            return "oldPlayerId: integer expected";
        if (!$util.isInteger(message.newPlayerId))
            return "newPlayerId: integer expected";
        return null;
    };

    return PlayerIdChangedMessage;
})();

export const AskKickPlayerMessage = $root.AskKickPlayerMessage = (() => {

    function AskKickPlayerMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AskKickPlayerMessage.prototype.gameId = 0;
    AskKickPlayerMessage.prototype.playerId = 0;

    AskKickPlayerMessage.create = function create(properties) {
        return new AskKickPlayerMessage(properties);
    };

    AskKickPlayerMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AskKickPlayerMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AskKickPlayerMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        return message;
    };

    AskKickPlayerMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        return null;
    };

    return AskKickPlayerMessage;
})();

export const AskKickDeniedMessage = $root.AskKickDeniedMessage = (() => {

    function AskKickDeniedMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AskKickDeniedMessage.prototype.gameId = 0;
    AskKickDeniedMessage.prototype.playerId = 0;
    AskKickDeniedMessage.prototype.kickDeniedReason = 0;

    AskKickDeniedMessage.create = function create(properties) {
        return new AskKickDeniedMessage(properties);
    };

    AskKickDeniedMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.playerId);
        writer.uint32(24).int32(message.kickDeniedReason);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AskKickDeniedMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AskKickDeniedMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.kickDeniedReason = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("playerId"))
            throw $util.ProtocolError("missing required 'playerId'", { instance: message });
        if (!message.hasOwnProperty("kickDeniedReason"))
            throw $util.ProtocolError("missing required 'kickDeniedReason'", { instance: message });
        return message;
    };

    AskKickDeniedMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.playerId))
            return "playerId: integer expected";
        switch (message.kickDeniedReason) {
        default:
            return "kickDeniedReason: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
            break;
        }
        return null;
    };

    AskKickDeniedMessage.KickDeniedReason = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "kickDeniedInvalidGameState"] = 0;
        values[valuesById[1] = "kickDeniedNotPossible"] = 1;
        values[valuesById[2] = "kickDeniedTryAgainLater"] = 2;
        values[valuesById[3] = "kickDeniedAlreadyInProgress"] = 3;
        values[valuesById[4] = "kickDeniedInvalidPlayerId"] = 4;
        return values;
    })();

    return AskKickDeniedMessage;
})();

export const StartKickPetitionMessage = $root.StartKickPetitionMessage = (() => {

    function StartKickPetitionMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    StartKickPetitionMessage.prototype.gameId = 0;
    StartKickPetitionMessage.prototype.petitionId = 0;
    StartKickPetitionMessage.prototype.proposingPlayerId = 0;
    StartKickPetitionMessage.prototype.kickPlayerId = 0;
    StartKickPetitionMessage.prototype.kickTimeoutSec = 0;
    StartKickPetitionMessage.prototype.numVotesNeededToKick = 0;

    StartKickPetitionMessage.create = function create(properties) {
        return new StartKickPetitionMessage(properties);
    };

    StartKickPetitionMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.petitionId);
        writer.uint32(24).uint32(message.proposingPlayerId);
        writer.uint32(32).uint32(message.kickPlayerId);
        writer.uint32(40).uint32(message.kickTimeoutSec);
        writer.uint32(48).uint32(message.numVotesNeededToKick);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    StartKickPetitionMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.StartKickPetitionMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.petitionId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.proposingPlayerId = reader.uint32();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.kickPlayerId = reader.uint32();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.kickTimeoutSec = reader.uint32();
                    continue;
                }
            case 6: {
                    if (wireType !== 0)
                        break;
                    message.numVotesNeededToKick = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("petitionId"))
            throw $util.ProtocolError("missing required 'petitionId'", { instance: message });
        if (!message.hasOwnProperty("proposingPlayerId"))
            throw $util.ProtocolError("missing required 'proposingPlayerId'", { instance: message });
        if (!message.hasOwnProperty("kickPlayerId"))
            throw $util.ProtocolError("missing required 'kickPlayerId'", { instance: message });
        if (!message.hasOwnProperty("kickTimeoutSec"))
            throw $util.ProtocolError("missing required 'kickTimeoutSec'", { instance: message });
        if (!message.hasOwnProperty("numVotesNeededToKick"))
            throw $util.ProtocolError("missing required 'numVotesNeededToKick'", { instance: message });
        return message;
    };

    StartKickPetitionMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.petitionId))
            return "petitionId: integer expected";
        if (!$util.isInteger(message.proposingPlayerId))
            return "proposingPlayerId: integer expected";
        if (!$util.isInteger(message.kickPlayerId))
            return "kickPlayerId: integer expected";
        if (!$util.isInteger(message.kickTimeoutSec))
            return "kickTimeoutSec: integer expected";
        if (!$util.isInteger(message.numVotesNeededToKick))
            return "numVotesNeededToKick: integer expected";
        return null;
    };

    return StartKickPetitionMessage;
})();

export const VoteKickRequestMessage = $root.VoteKickRequestMessage = (() => {

    function VoteKickRequestMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    VoteKickRequestMessage.prototype.gameId = 0;
    VoteKickRequestMessage.prototype.petitionId = 0;
    VoteKickRequestMessage.prototype.voteKick = false;

    VoteKickRequestMessage.create = function create(properties) {
        return new VoteKickRequestMessage(properties);
    };

    VoteKickRequestMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.petitionId);
        writer.uint32(24).bool(message.voteKick);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    VoteKickRequestMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.VoteKickRequestMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.petitionId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.voteKick = reader.bool();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("petitionId"))
            throw $util.ProtocolError("missing required 'petitionId'", { instance: message });
        if (!message.hasOwnProperty("voteKick"))
            throw $util.ProtocolError("missing required 'voteKick'", { instance: message });
        return message;
    };

    VoteKickRequestMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.petitionId))
            return "petitionId: integer expected";
        if (typeof message.voteKick !== "boolean")
            return "voteKick: boolean expected";
        return null;
    };

    return VoteKickRequestMessage;
})();

export const VoteKickReplyMessage = $root.VoteKickReplyMessage = (() => {

    function VoteKickReplyMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    VoteKickReplyMessage.prototype.gameId = 0;
    VoteKickReplyMessage.prototype.petitionId = 0;
    VoteKickReplyMessage.prototype.voteKickReplyType = 0;

    VoteKickReplyMessage.create = function create(properties) {
        return new VoteKickReplyMessage(properties);
    };

    VoteKickReplyMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.petitionId);
        writer.uint32(24).int32(message.voteKickReplyType);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    VoteKickReplyMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.VoteKickReplyMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.petitionId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.voteKickReplyType = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("petitionId"))
            throw $util.ProtocolError("missing required 'petitionId'", { instance: message });
        if (!message.hasOwnProperty("voteKickReplyType"))
            throw $util.ProtocolError("missing required 'voteKickReplyType'", { instance: message });
        return message;
    };

    VoteKickReplyMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.petitionId))
            return "petitionId: integer expected";
        switch (message.voteKickReplyType) {
        default:
            return "voteKickReplyType: enum value expected";
        case 0:
        case 1:
        case 2:
            break;
        }
        return null;
    };

    VoteKickReplyMessage.VoteKickReplyType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "voteKickAck"] = 0;
        values[valuesById[1] = "voteKickDeniedInvalid"] = 1;
        values[valuesById[2] = "voteKickDeniedAlreadyVoted"] = 2;
        return values;
    })();

    return VoteKickReplyMessage;
})();

export const KickPetitionUpdateMessage = $root.KickPetitionUpdateMessage = (() => {

    function KickPetitionUpdateMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    KickPetitionUpdateMessage.prototype.gameId = 0;
    KickPetitionUpdateMessage.prototype.petitionId = 0;
    KickPetitionUpdateMessage.prototype.numVotesAgainstKicking = 0;
    KickPetitionUpdateMessage.prototype.numVotesInFavourOfKicking = 0;
    KickPetitionUpdateMessage.prototype.numVotesNeededToKick = 0;

    KickPetitionUpdateMessage.create = function create(properties) {
        return new KickPetitionUpdateMessage(properties);
    };

    KickPetitionUpdateMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.petitionId);
        writer.uint32(24).uint32(message.numVotesAgainstKicking);
        writer.uint32(32).uint32(message.numVotesInFavourOfKicking);
        writer.uint32(40).uint32(message.numVotesNeededToKick);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    KickPetitionUpdateMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.KickPetitionUpdateMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.petitionId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.numVotesAgainstKicking = reader.uint32();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.numVotesInFavourOfKicking = reader.uint32();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.numVotesNeededToKick = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("petitionId"))
            throw $util.ProtocolError("missing required 'petitionId'", { instance: message });
        if (!message.hasOwnProperty("numVotesAgainstKicking"))
            throw $util.ProtocolError("missing required 'numVotesAgainstKicking'", { instance: message });
        if (!message.hasOwnProperty("numVotesInFavourOfKicking"))
            throw $util.ProtocolError("missing required 'numVotesInFavourOfKicking'", { instance: message });
        if (!message.hasOwnProperty("numVotesNeededToKick"))
            throw $util.ProtocolError("missing required 'numVotesNeededToKick'", { instance: message });
        return message;
    };

    KickPetitionUpdateMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.petitionId))
            return "petitionId: integer expected";
        if (!$util.isInteger(message.numVotesAgainstKicking))
            return "numVotesAgainstKicking: integer expected";
        if (!$util.isInteger(message.numVotesInFavourOfKicking))
            return "numVotesInFavourOfKicking: integer expected";
        if (!$util.isInteger(message.numVotesNeededToKick))
            return "numVotesNeededToKick: integer expected";
        return null;
    };

    return KickPetitionUpdateMessage;
})();

export const EndKickPetitionMessage = $root.EndKickPetitionMessage = (() => {

    function EndKickPetitionMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    EndKickPetitionMessage.prototype.gameId = 0;
    EndKickPetitionMessage.prototype.petitionId = 0;
    EndKickPetitionMessage.prototype.numVotesAgainstKicking = 0;
    EndKickPetitionMessage.prototype.numVotesInFavourOfKicking = 0;
    EndKickPetitionMessage.prototype.resultPlayerKicked = 0;
    EndKickPetitionMessage.prototype.petitionEndReason = 0;

    EndKickPetitionMessage.create = function create(properties) {
        return new EndKickPetitionMessage(properties);
    };

    EndKickPetitionMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.gameId);
        writer.uint32(16).uint32(message.petitionId);
        writer.uint32(24).uint32(message.numVotesAgainstKicking);
        writer.uint32(32).uint32(message.numVotesInFavourOfKicking);
        writer.uint32(40).uint32(message.resultPlayerKicked);
        writer.uint32(48).int32(message.petitionEndReason);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    EndKickPetitionMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.EndKickPetitionMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.petitionId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.numVotesAgainstKicking = reader.uint32();
                    continue;
                }
            case 4: {
                    if (wireType !== 0)
                        break;
                    message.numVotesInFavourOfKicking = reader.uint32();
                    continue;
                }
            case 5: {
                    if (wireType !== 0)
                        break;
                    message.resultPlayerKicked = reader.uint32();
                    continue;
                }
            case 6: {
                    if (wireType !== 0)
                        break;
                    message.petitionEndReason = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("gameId"))
            throw $util.ProtocolError("missing required 'gameId'", { instance: message });
        if (!message.hasOwnProperty("petitionId"))
            throw $util.ProtocolError("missing required 'petitionId'", { instance: message });
        if (!message.hasOwnProperty("numVotesAgainstKicking"))
            throw $util.ProtocolError("missing required 'numVotesAgainstKicking'", { instance: message });
        if (!message.hasOwnProperty("numVotesInFavourOfKicking"))
            throw $util.ProtocolError("missing required 'numVotesInFavourOfKicking'", { instance: message });
        if (!message.hasOwnProperty("resultPlayerKicked"))
            throw $util.ProtocolError("missing required 'resultPlayerKicked'", { instance: message });
        if (!message.hasOwnProperty("petitionEndReason"))
            throw $util.ProtocolError("missing required 'petitionEndReason'", { instance: message });
        return message;
    };

    EndKickPetitionMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.gameId))
            return "gameId: integer expected";
        if (!$util.isInteger(message.petitionId))
            return "petitionId: integer expected";
        if (!$util.isInteger(message.numVotesAgainstKicking))
            return "numVotesAgainstKicking: integer expected";
        if (!$util.isInteger(message.numVotesInFavourOfKicking))
            return "numVotesInFavourOfKicking: integer expected";
        if (!$util.isInteger(message.resultPlayerKicked))
            return "resultPlayerKicked: integer expected";
        switch (message.petitionEndReason) {
        default:
            return "petitionEndReason: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
            break;
        }
        return null;
    };

    EndKickPetitionMessage.PetitionEndReason = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "petitionEndEnoughVotes"] = 0;
        values[valuesById[1] = "petitionEndTooFewPlayers"] = 1;
        values[valuesById[2] = "petitionEndPlayerLeft"] = 2;
        values[valuesById[3] = "petitionEndTimeout"] = 3;
        return values;
    })();

    return EndKickPetitionMessage;
})();

export const StatisticsMessage = $root.StatisticsMessage = (() => {

    function StatisticsMessage(properties) {
        this.statisticsData = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    StatisticsMessage.prototype.statisticsData = $util.emptyArray;

    StatisticsMessage.create = function create(properties) {
        return new StatisticsMessage(properties);
    };

    StatisticsMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        if (message.statisticsData != null && message.statisticsData.length)
            for (let i = 0; i < message.statisticsData.length; ++i)
                $root.StatisticsMessage.StatisticsData.encode(message.statisticsData[i], writer.uint32(10).fork(), _depth + 1).ldelim();
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    StatisticsMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.StatisticsMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    if (!(message.statisticsData && message.statisticsData.length))
                        message.statisticsData = [];
                    message.statisticsData.push($root.StatisticsMessage.StatisticsData.decode(reader, reader.uint32(), undefined, _depth + 1));
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        return message;
    };

    StatisticsMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.statisticsData != null && message.hasOwnProperty("statisticsData")) {
            if (!Array.isArray(message.statisticsData))
                return "statisticsData: array expected";
            for (let i = 0; i < message.statisticsData.length; ++i) {
                let error = $root.StatisticsMessage.StatisticsData.verify(message.statisticsData[i], _depth + 1);
                if (error)
                    return "statisticsData." + error;
            }
        }
        return null;
    };

    StatisticsMessage.StatisticsData = (function() {

        function StatisticsData(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        StatisticsData.prototype.statisticsType = 1;
        StatisticsData.prototype.statisticsValue = 0;

        StatisticsData.create = function create(properties) {
            return new StatisticsData(properties);
        };

        StatisticsData.encode = function encode(message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            writer.uint32(8).int32(message.statisticsType);
            writer.uint32(16).uint32(message.statisticsValue);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        StatisticsData.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.StatisticsMessage.StatisticsData();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.statisticsType = reader.int32();
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        message.statisticsValue = reader.uint32();
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            if (!message.hasOwnProperty("statisticsType"))
                throw $util.ProtocolError("missing required 'statisticsType'", { instance: message });
            if (!message.hasOwnProperty("statisticsValue"))
                throw $util.ProtocolError("missing required 'statisticsValue'", { instance: message });
            return message;
        };

        StatisticsData.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            switch (message.statisticsType) {
            default:
                return "statisticsType: enum value expected";
            case 1:
                break;
            }
            if (!$util.isInteger(message.statisticsValue))
                return "statisticsValue: integer expected";
            return null;
        };

        StatisticsData.StatisticsType = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[1] = "statNumberOfPlayers"] = 1;
            return values;
        })();

        return StatisticsData;
    })();

    return StatisticsMessage;
})();

export const ChatRequestMessage = $root.ChatRequestMessage = (() => {

    function ChatRequestMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    ChatRequestMessage.prototype.targetGameId = 0;
    ChatRequestMessage.prototype.targetPlayerId = 0;
    ChatRequestMessage.prototype.chatText = "";

    ChatRequestMessage.create = function create(properties) {
        return new ChatRequestMessage(properties);
    };

    ChatRequestMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        if (message.targetGameId != null && Object.hasOwnProperty.call(message, "targetGameId"))
            writer.uint32(8).uint32(message.targetGameId);
        if (message.targetPlayerId != null && Object.hasOwnProperty.call(message, "targetPlayerId"))
            writer.uint32(16).uint32(message.targetPlayerId);
        writer.uint32(26).string(message.chatText);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    ChatRequestMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.ChatRequestMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.targetGameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.targetPlayerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.chatText = reader.string();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("chatText"))
            throw $util.ProtocolError("missing required 'chatText'", { instance: message });
        return message;
    };

    ChatRequestMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.targetGameId != null && message.hasOwnProperty("targetGameId"))
            if (!$util.isInteger(message.targetGameId))
                return "targetGameId: integer expected";
        if (message.targetPlayerId != null && message.hasOwnProperty("targetPlayerId"))
            if (!$util.isInteger(message.targetPlayerId))
                return "targetPlayerId: integer expected";
        if (!$util.isString(message.chatText))
            return "chatText: string expected";
        return null;
    };

    return ChatRequestMessage;
})();

export const ChatMessage = $root.ChatMessage = (() => {

    function ChatMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    ChatMessage.prototype.gameId = 0;
    ChatMessage.prototype.playerId = 0;
    ChatMessage.prototype.chatType = 0;
    ChatMessage.prototype.chatText = "";

    ChatMessage.create = function create(properties) {
        return new ChatMessage(properties);
    };

    ChatMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
            writer.uint32(8).uint32(message.gameId);
        if (message.playerId != null && Object.hasOwnProperty.call(message, "playerId"))
            writer.uint32(16).uint32(message.playerId);
        writer.uint32(24).int32(message.chatType);
        writer.uint32(34).string(message.chatText);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    ChatMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.ChatMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.gameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.playerId = reader.uint32();
                    continue;
                }
            case 3: {
                    if (wireType !== 0)
                        break;
                    message.chatType = reader.int32();
                    continue;
                }
            case 4: {
                    if (wireType !== 2)
                        break;
                    message.chatText = reader.string();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("chatType"))
            throw $util.ProtocolError("missing required 'chatType'", { instance: message });
        if (!message.hasOwnProperty("chatText"))
            throw $util.ProtocolError("missing required 'chatText'", { instance: message });
        return message;
    };

    ChatMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (message.gameId != null && message.hasOwnProperty("gameId"))
            if (!$util.isInteger(message.gameId))
                return "gameId: integer expected";
        if (message.playerId != null && message.hasOwnProperty("playerId"))
            if (!$util.isInteger(message.playerId))
                return "playerId: integer expected";
        switch (message.chatType) {
        default:
            return "chatType: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
            break;
        }
        if (!$util.isString(message.chatText))
            return "chatText: string expected";
        return null;
    };

    ChatMessage.ChatType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "chatTypeLobby"] = 0;
        values[valuesById[1] = "chatTypeGame"] = 1;
        values[valuesById[2] = "chatTypeBot"] = 2;
        values[valuesById[3] = "chatTypeBroadcast"] = 3;
        values[valuesById[4] = "chatTypePrivate"] = 4;
        return values;
    })();

    return ChatMessage;
})();

export const ChatRejectMessage = $root.ChatRejectMessage = (() => {

    function ChatRejectMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    ChatRejectMessage.prototype.chatText = "";

    ChatRejectMessage.create = function create(properties) {
        return new ChatRejectMessage(properties);
    };

    ChatRejectMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(10).string(message.chatText);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    ChatRejectMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.ChatRejectMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.chatText = reader.string();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("chatText"))
            throw $util.ProtocolError("missing required 'chatText'", { instance: message });
        return message;
    };

    ChatRejectMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isString(message.chatText))
            return "chatText: string expected";
        return null;
    };

    return ChatRejectMessage;
})();

export const DialogMessage = $root.DialogMessage = (() => {

    function DialogMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    DialogMessage.prototype.notificationText = "";

    DialogMessage.create = function create(properties) {
        return new DialogMessage(properties);
    };

    DialogMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(10).string(message.notificationText);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    DialogMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.DialogMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 2)
                        break;
                    message.notificationText = reader.string();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("notificationText"))
            throw $util.ProtocolError("missing required 'notificationText'", { instance: message });
        return message;
    };

    DialogMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isString(message.notificationText))
            return "notificationText: string expected";
        return null;
    };

    return DialogMessage;
})();

export const TimeoutWarningMessage = $root.TimeoutWarningMessage = (() => {

    function TimeoutWarningMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    TimeoutWarningMessage.prototype.timeoutReason = 0;
    TimeoutWarningMessage.prototype.remainingSeconds = 0;

    TimeoutWarningMessage.create = function create(properties) {
        return new TimeoutWarningMessage(properties);
    };

    TimeoutWarningMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).int32(message.timeoutReason);
        writer.uint32(16).uint32(message.remainingSeconds);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    TimeoutWarningMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.TimeoutWarningMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.timeoutReason = reader.int32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.remainingSeconds = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("timeoutReason"))
            throw $util.ProtocolError("missing required 'timeoutReason'", { instance: message });
        if (!message.hasOwnProperty("remainingSeconds"))
            throw $util.ProtocolError("missing required 'remainingSeconds'", { instance: message });
        return message;
    };

    TimeoutWarningMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        switch (message.timeoutReason) {
        default:
            return "timeoutReason: enum value expected";
        case 0:
        case 1:
        case 2:
            break;
        }
        if (!$util.isInteger(message.remainingSeconds))
            return "remainingSeconds: integer expected";
        return null;
    };

    TimeoutWarningMessage.TimeoutReason = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "timeoutNoDataReceived"] = 0;
        values[valuesById[1] = "timeoutInactiveGame"] = 1;
        values[valuesById[2] = "timeoutKickAfterAutofold"] = 2;
        return values;
    })();

    return TimeoutWarningMessage;
})();

export const ResetTimeoutMessage = $root.ResetTimeoutMessage = (() => {

    function ResetTimeoutMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    ResetTimeoutMessage.create = function create(properties) {
        return new ResetTimeoutMessage(properties);
    };

    ResetTimeoutMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    ResetTimeoutMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.ResetTimeoutMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            reader.skipType(tag & 7, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        return message;
    };

    ResetTimeoutMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        return null;
    };

    return ResetTimeoutMessage;
})();

export const ReportAvatarMessage = $root.ReportAvatarMessage = (() => {

    function ReportAvatarMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    ReportAvatarMessage.prototype.reportedPlayerId = 0;
    ReportAvatarMessage.prototype.reportedAvatarHash = $util.newBuffer([]);

    ReportAvatarMessage.create = function create(properties) {
        return new ReportAvatarMessage(properties);
    };

    ReportAvatarMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.reportedPlayerId);
        writer.uint32(18).bytes(message.reportedAvatarHash);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    ReportAvatarMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.ReportAvatarMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.reportedPlayerId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.reportedAvatarHash = reader.bytes();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("reportedPlayerId"))
            throw $util.ProtocolError("missing required 'reportedPlayerId'", { instance: message });
        if (!message.hasOwnProperty("reportedAvatarHash"))
            throw $util.ProtocolError("missing required 'reportedAvatarHash'", { instance: message });
        return message;
    };

    ReportAvatarMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.reportedPlayerId))
            return "reportedPlayerId: integer expected";
        if (!(message.reportedAvatarHash && typeof message.reportedAvatarHash.length === "number" || $util.isString(message.reportedAvatarHash)))
            return "reportedAvatarHash: buffer expected";
        return null;
    };

    return ReportAvatarMessage;
})();

export const ReportAvatarAckMessage = $root.ReportAvatarAckMessage = (() => {

    function ReportAvatarAckMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    ReportAvatarAckMessage.prototype.reportedPlayerId = 0;
    ReportAvatarAckMessage.prototype.reportAvatarResult = 0;

    ReportAvatarAckMessage.create = function create(properties) {
        return new ReportAvatarAckMessage(properties);
    };

    ReportAvatarAckMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.reportedPlayerId);
        writer.uint32(16).int32(message.reportAvatarResult);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    ReportAvatarAckMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.ReportAvatarAckMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.reportedPlayerId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.reportAvatarResult = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("reportedPlayerId"))
            throw $util.ProtocolError("missing required 'reportedPlayerId'", { instance: message });
        if (!message.hasOwnProperty("reportAvatarResult"))
            throw $util.ProtocolError("missing required 'reportAvatarResult'", { instance: message });
        return message;
    };

    ReportAvatarAckMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.reportedPlayerId))
            return "reportedPlayerId: integer expected";
        switch (message.reportAvatarResult) {
        default:
            return "reportAvatarResult: enum value expected";
        case 0:
        case 1:
        case 2:
            break;
        }
        return null;
    };

    ReportAvatarAckMessage.ReportAvatarResult = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "avatarReportAccepted"] = 0;
        values[valuesById[1] = "avatarReportDuplicate"] = 1;
        values[valuesById[2] = "avatarReportInvalid"] = 2;
        return values;
    })();

    return ReportAvatarAckMessage;
})();

export const ReportGameMessage = $root.ReportGameMessage = (() => {

    function ReportGameMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    ReportGameMessage.prototype.reportedGameId = 0;

    ReportGameMessage.create = function create(properties) {
        return new ReportGameMessage(properties);
    };

    ReportGameMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.reportedGameId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    ReportGameMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.ReportGameMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.reportedGameId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("reportedGameId"))
            throw $util.ProtocolError("missing required 'reportedGameId'", { instance: message });
        return message;
    };

    ReportGameMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.reportedGameId))
            return "reportedGameId: integer expected";
        return null;
    };

    return ReportGameMessage;
})();

export const ReportGameAckMessage = $root.ReportGameAckMessage = (() => {

    function ReportGameAckMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    ReportGameAckMessage.prototype.reportedGameId = 0;
    ReportGameAckMessage.prototype.reportGameResult = 0;

    ReportGameAckMessage.create = function create(properties) {
        return new ReportGameAckMessage(properties);
    };

    ReportGameAckMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.reportedGameId);
        writer.uint32(16).int32(message.reportGameResult);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    ReportGameAckMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.ReportGameAckMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.reportedGameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.reportGameResult = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("reportedGameId"))
            throw $util.ProtocolError("missing required 'reportedGameId'", { instance: message });
        if (!message.hasOwnProperty("reportGameResult"))
            throw $util.ProtocolError("missing required 'reportGameResult'", { instance: message });
        return message;
    };

    ReportGameAckMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.reportedGameId))
            return "reportedGameId: integer expected";
        switch (message.reportGameResult) {
        default:
            return "reportGameResult: enum value expected";
        case 0:
        case 1:
        case 2:
            break;
        }
        return null;
    };

    ReportGameAckMessage.ReportGameResult = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "gameReportAccepted"] = 0;
        values[valuesById[1] = "gameReportDuplicate"] = 1;
        values[valuesById[2] = "gameReportInvalid"] = 2;
        return values;
    })();

    return ReportGameAckMessage;
})();

export const ErrorMessage = $root.ErrorMessage = (() => {

    function ErrorMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    ErrorMessage.prototype.errorReason = 0;

    ErrorMessage.create = function create(properties) {
        return new ErrorMessage(properties);
    };

    ErrorMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).int32(message.errorReason);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    ErrorMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.ErrorMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.errorReason = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("errorReason"))
            throw $util.ProtocolError("missing required 'errorReason'", { instance: message });
        return message;
    };

    ErrorMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        switch (message.errorReason) {
        default:
            return "errorReason: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
            break;
        }
        return null;
    };

    ErrorMessage.ErrorReason = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "custReserved"] = 0;
        values[valuesById[1] = "initVersionNotSupported"] = 1;
        values[valuesById[2] = "initServerFull"] = 2;
        values[valuesById[3] = "initAuthFailure"] = 3;
        values[valuesById[4] = "initPlayerNameInUse"] = 4;
        values[valuesById[5] = "initInvalidPlayerName"] = 5;
        values[valuesById[6] = "initServerMaintenance"] = 6;
        values[valuesById[7] = "initBlocked"] = 7;
        values[valuesById[8] = "avatarTooLarge"] = 8;
        values[valuesById[9] = "invalidPacket"] = 9;
        values[valuesById[10] = "invalidState"] = 10;
        values[valuesById[11] = "kickedFromServer"] = 11;
        values[valuesById[12] = "bannedFromServer"] = 12;
        values[valuesById[13] = "blockedByServer"] = 13;
        values[valuesById[14] = "sessionTimeout"] = 14;
        return values;
    })();

    return ErrorMessage;
})();

export const AdminRemoveGameMessage = $root.AdminRemoveGameMessage = (() => {

    function AdminRemoveGameMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AdminRemoveGameMessage.prototype.removeGameId = 0;

    AdminRemoveGameMessage.create = function create(properties) {
        return new AdminRemoveGameMessage(properties);
    };

    AdminRemoveGameMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.removeGameId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AdminRemoveGameMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AdminRemoveGameMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.removeGameId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("removeGameId"))
            throw $util.ProtocolError("missing required 'removeGameId'", { instance: message });
        return message;
    };

    AdminRemoveGameMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.removeGameId))
            return "removeGameId: integer expected";
        return null;
    };

    return AdminRemoveGameMessage;
})();

export const AdminRemoveGameAckMessage = $root.AdminRemoveGameAckMessage = (() => {

    function AdminRemoveGameAckMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AdminRemoveGameAckMessage.prototype.removeGameId = 0;
    AdminRemoveGameAckMessage.prototype.removeGameResult = 0;

    AdminRemoveGameAckMessage.create = function create(properties) {
        return new AdminRemoveGameAckMessage(properties);
    };

    AdminRemoveGameAckMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.removeGameId);
        writer.uint32(16).int32(message.removeGameResult);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AdminRemoveGameAckMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AdminRemoveGameAckMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.removeGameId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.removeGameResult = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("removeGameId"))
            throw $util.ProtocolError("missing required 'removeGameId'", { instance: message });
        if (!message.hasOwnProperty("removeGameResult"))
            throw $util.ProtocolError("missing required 'removeGameResult'", { instance: message });
        return message;
    };

    AdminRemoveGameAckMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.removeGameId))
            return "removeGameId: integer expected";
        switch (message.removeGameResult) {
        default:
            return "removeGameResult: enum value expected";
        case 0:
        case 1:
            break;
        }
        return null;
    };

    AdminRemoveGameAckMessage.AdminRemoveGameResult = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "gameRemoveAccepted"] = 0;
        values[valuesById[1] = "gameRemoveInvalid"] = 1;
        return values;
    })();

    return AdminRemoveGameAckMessage;
})();

export const AdminBanPlayerMessage = $root.AdminBanPlayerMessage = (() => {

    function AdminBanPlayerMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AdminBanPlayerMessage.prototype.banPlayerId = 0;

    AdminBanPlayerMessage.create = function create(properties) {
        return new AdminBanPlayerMessage(properties);
    };

    AdminBanPlayerMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.banPlayerId);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AdminBanPlayerMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AdminBanPlayerMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.banPlayerId = reader.uint32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("banPlayerId"))
            throw $util.ProtocolError("missing required 'banPlayerId'", { instance: message });
        return message;
    };

    AdminBanPlayerMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.banPlayerId))
            return "banPlayerId: integer expected";
        return null;
    };

    return AdminBanPlayerMessage;
})();

export const AdminBanPlayerAckMessage = $root.AdminBanPlayerAckMessage = (() => {

    function AdminBanPlayerAckMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    AdminBanPlayerAckMessage.prototype.banPlayerId = 0;
    AdminBanPlayerAckMessage.prototype.banPlayerResult = 0;

    AdminBanPlayerAckMessage.create = function create(properties) {
        return new AdminBanPlayerAckMessage(properties);
    };

    AdminBanPlayerAckMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).uint32(message.banPlayerId);
        writer.uint32(16).int32(message.banPlayerResult);
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    AdminBanPlayerAckMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.AdminBanPlayerAckMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.banPlayerId = reader.uint32();
                    continue;
                }
            case 2: {
                    if (wireType !== 0)
                        break;
                    message.banPlayerResult = reader.int32();
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("banPlayerId"))
            throw $util.ProtocolError("missing required 'banPlayerId'", { instance: message });
        if (!message.hasOwnProperty("banPlayerResult"))
            throw $util.ProtocolError("missing required 'banPlayerResult'", { instance: message });
        return message;
    };

    AdminBanPlayerAckMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        if (!$util.isInteger(message.banPlayerId))
            return "banPlayerId: integer expected";
        switch (message.banPlayerResult) {
        default:
            return "banPlayerResult: enum value expected";
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
            break;
        }
        return null;
    };

    AdminBanPlayerAckMessage.AdminBanPlayerResult = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "banPlayerAccepted"] = 0;
        values[valuesById[1] = "banPlayerPending"] = 1;
        values[valuesById[2] = "banPlayerNoDB"] = 2;
        values[valuesById[3] = "banPlayerDBError"] = 3;
        values[valuesById[4] = "banPlayerInvalid"] = 4;
        return values;
    })();

    return AdminBanPlayerAckMessage;
})();

export const PokerTHMessage = $root.PokerTHMessage = (() => {

    function PokerTHMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
    }

    PokerTHMessage.prototype.messageType = 1;
    PokerTHMessage.prototype.announceMessage = null;
    PokerTHMessage.prototype.initMessage = null;
    PokerTHMessage.prototype.authServerChallengeMessage = null;
    PokerTHMessage.prototype.authClientResponseMessage = null;
    PokerTHMessage.prototype.authServerVerificationMessage = null;
    PokerTHMessage.prototype.initAckMessage = null;
    PokerTHMessage.prototype.avatarRequestMessage = null;
    PokerTHMessage.prototype.avatarHeaderMessage = null;
    PokerTHMessage.prototype.avatarDataMessage = null;
    PokerTHMessage.prototype.avatarEndMessage = null;
    PokerTHMessage.prototype.unknownAvatarMessage = null;
    PokerTHMessage.prototype.playerListMessage = null;
    PokerTHMessage.prototype.gameListNewMessage = null;
    PokerTHMessage.prototype.gameListUpdateMessage = null;
    PokerTHMessage.prototype.gameListPlayerJoinedMessage = null;
    PokerTHMessage.prototype.gameListPlayerLeftMessage = null;
    PokerTHMessage.prototype.gameListAdminChangedMessage = null;
    PokerTHMessage.prototype.playerInfoRequestMessage = null;
    PokerTHMessage.prototype.playerInfoReplyMessage = null;
    PokerTHMessage.prototype.subscriptionRequestMessage = null;
    PokerTHMessage.prototype.joinExistingGameMessage = null;
    PokerTHMessage.prototype.joinNewGameMessage = null;
    PokerTHMessage.prototype.rejoinExistingGameMessage = null;
    PokerTHMessage.prototype.joinGameAckMessage = null;
    PokerTHMessage.prototype.joinGameFailedMessage = null;
    PokerTHMessage.prototype.gamePlayerJoinedMessage = null;
    PokerTHMessage.prototype.gamePlayerLeftMessage = null;
    PokerTHMessage.prototype.gameAdminChangedMessage = null;
    PokerTHMessage.prototype.removedFromGameMessage = null;
    PokerTHMessage.prototype.kickPlayerRequestMessage = null;
    PokerTHMessage.prototype.leaveGameRequestMessage = null;
    PokerTHMessage.prototype.invitePlayerToGameMessage = null;
    PokerTHMessage.prototype.inviteNotifyMessage = null;
    PokerTHMessage.prototype.rejectGameInvitationMessage = null;
    PokerTHMessage.prototype.rejectInvNotifyMessage = null;
    PokerTHMessage.prototype.startEventMessage = null;
    PokerTHMessage.prototype.startEventAckMessage = null;
    PokerTHMessage.prototype.gameStartInitialMessage = null;
    PokerTHMessage.prototype.gameStartRejoinMessage = null;
    PokerTHMessage.prototype.handStartMessage = null;
    PokerTHMessage.prototype.playersTurnMessage = null;
    PokerTHMessage.prototype.myActionRequestMessage = null;
    PokerTHMessage.prototype.yourActionRejectedMessage = null;
    PokerTHMessage.prototype.playersActionDoneMessage = null;
    PokerTHMessage.prototype.dealFlopCardsMessage = null;
    PokerTHMessage.prototype.dealTurnCardMessage = null;
    PokerTHMessage.prototype.dealRiverCardMessage = null;
    PokerTHMessage.prototype.allInShowCardsMessage = null;
    PokerTHMessage.prototype.endOfHandShowCardsMessage = null;
    PokerTHMessage.prototype.endOfHandHideCardsMessage = null;
    PokerTHMessage.prototype.showMyCardsRequestMessage = null;
    PokerTHMessage.prototype.afterHandShowCardsMessage = null;
    PokerTHMessage.prototype.endOfGameMessage = null;
    PokerTHMessage.prototype.playerIdChangedMessage = null;
    PokerTHMessage.prototype.askKickPlayerMessage = null;
    PokerTHMessage.prototype.askKickDeniedMessage = null;
    PokerTHMessage.prototype.startKickPetitionMessage = null;
    PokerTHMessage.prototype.voteKickRequestMessage = null;
    PokerTHMessage.prototype.voteKickReplyMessage = null;
    PokerTHMessage.prototype.kickPetitionUpdateMessage = null;
    PokerTHMessage.prototype.endKickPetitionMessage = null;
    PokerTHMessage.prototype.statisticsMessage = null;
    PokerTHMessage.prototype.chatRequestMessage = null;
    PokerTHMessage.prototype.chatMessage = null;
    PokerTHMessage.prototype.chatRejectMessage = null;
    PokerTHMessage.prototype.dialogMessage = null;
    PokerTHMessage.prototype.timeoutWarningMessage = null;
    PokerTHMessage.prototype.resetTimeoutMessage = null;
    PokerTHMessage.prototype.reportAvatarMessage = null;
    PokerTHMessage.prototype.reportAvatarAckMessage = null;
    PokerTHMessage.prototype.reportGameMessage = null;
    PokerTHMessage.prototype.reportGameAckMessage = null;
    PokerTHMessage.prototype.errorMessage = null;
    PokerTHMessage.prototype.adminRemoveGameMessage = null;
    PokerTHMessage.prototype.adminRemoveGameAckMessage = null;
    PokerTHMessage.prototype.adminBanPlayerMessage = null;
    PokerTHMessage.prototype.adminBanPlayerAckMessage = null;
    PokerTHMessage.prototype.gameListSpectatorJoinedMessage = null;
    PokerTHMessage.prototype.gameListSpectatorLeftMessage = null;
    PokerTHMessage.prototype.gameSpectatorJoinedMessage = null;
    PokerTHMessage.prototype.gameSpectatorLeftMessage = null;

    PokerTHMessage.create = function create(properties) {
        return new PokerTHMessage(properties);
    };

    PokerTHMessage.encode = function encode(message, writer, _depth) {
        if (!writer)
            writer = $Writer.create();
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            throw Error("max depth exceeded");
        writer.uint32(8).int32(message.messageType);
        if (message.announceMessage != null && Object.hasOwnProperty.call(message, "announceMessage"))
            $root.AnnounceMessage.encode(message.announceMessage, writer.uint32(18).fork(), _depth + 1).ldelim();
        if (message.initMessage != null && Object.hasOwnProperty.call(message, "initMessage"))
            $root.InitMessage.encode(message.initMessage, writer.uint32(26).fork(), _depth + 1).ldelim();
        if (message.authServerChallengeMessage != null && Object.hasOwnProperty.call(message, "authServerChallengeMessage"))
            $root.AuthServerChallengeMessage.encode(message.authServerChallengeMessage, writer.uint32(34).fork(), _depth + 1).ldelim();
        if (message.authClientResponseMessage != null && Object.hasOwnProperty.call(message, "authClientResponseMessage"))
            $root.AuthClientResponseMessage.encode(message.authClientResponseMessage, writer.uint32(42).fork(), _depth + 1).ldelim();
        if (message.authServerVerificationMessage != null && Object.hasOwnProperty.call(message, "authServerVerificationMessage"))
            $root.AuthServerVerificationMessage.encode(message.authServerVerificationMessage, writer.uint32(50).fork(), _depth + 1).ldelim();
        if (message.initAckMessage != null && Object.hasOwnProperty.call(message, "initAckMessage"))
            $root.InitAckMessage.encode(message.initAckMessage, writer.uint32(58).fork(), _depth + 1).ldelim();
        if (message.avatarRequestMessage != null && Object.hasOwnProperty.call(message, "avatarRequestMessage"))
            $root.AvatarRequestMessage.encode(message.avatarRequestMessage, writer.uint32(66).fork(), _depth + 1).ldelim();
        if (message.avatarHeaderMessage != null && Object.hasOwnProperty.call(message, "avatarHeaderMessage"))
            $root.AvatarHeaderMessage.encode(message.avatarHeaderMessage, writer.uint32(74).fork(), _depth + 1).ldelim();
        if (message.avatarDataMessage != null && Object.hasOwnProperty.call(message, "avatarDataMessage"))
            $root.AvatarDataMessage.encode(message.avatarDataMessage, writer.uint32(82).fork(), _depth + 1).ldelim();
        if (message.avatarEndMessage != null && Object.hasOwnProperty.call(message, "avatarEndMessage"))
            $root.AvatarEndMessage.encode(message.avatarEndMessage, writer.uint32(90).fork(), _depth + 1).ldelim();
        if (message.unknownAvatarMessage != null && Object.hasOwnProperty.call(message, "unknownAvatarMessage"))
            $root.UnknownAvatarMessage.encode(message.unknownAvatarMessage, writer.uint32(98).fork(), _depth + 1).ldelim();
        if (message.playerListMessage != null && Object.hasOwnProperty.call(message, "playerListMessage"))
            $root.PlayerListMessage.encode(message.playerListMessage, writer.uint32(106).fork(), _depth + 1).ldelim();
        if (message.gameListNewMessage != null && Object.hasOwnProperty.call(message, "gameListNewMessage"))
            $root.GameListNewMessage.encode(message.gameListNewMessage, writer.uint32(114).fork(), _depth + 1).ldelim();
        if (message.gameListUpdateMessage != null && Object.hasOwnProperty.call(message, "gameListUpdateMessage"))
            $root.GameListUpdateMessage.encode(message.gameListUpdateMessage, writer.uint32(122).fork(), _depth + 1).ldelim();
        if (message.gameListPlayerJoinedMessage != null && Object.hasOwnProperty.call(message, "gameListPlayerJoinedMessage"))
            $root.GameListPlayerJoinedMessage.encode(message.gameListPlayerJoinedMessage, writer.uint32(130).fork(), _depth + 1).ldelim();
        if (message.gameListPlayerLeftMessage != null && Object.hasOwnProperty.call(message, "gameListPlayerLeftMessage"))
            $root.GameListPlayerLeftMessage.encode(message.gameListPlayerLeftMessage, writer.uint32(138).fork(), _depth + 1).ldelim();
        if (message.gameListAdminChangedMessage != null && Object.hasOwnProperty.call(message, "gameListAdminChangedMessage"))
            $root.GameListAdminChangedMessage.encode(message.gameListAdminChangedMessage, writer.uint32(146).fork(), _depth + 1).ldelim();
        if (message.playerInfoRequestMessage != null && Object.hasOwnProperty.call(message, "playerInfoRequestMessage"))
            $root.PlayerInfoRequestMessage.encode(message.playerInfoRequestMessage, writer.uint32(154).fork(), _depth + 1).ldelim();
        if (message.playerInfoReplyMessage != null && Object.hasOwnProperty.call(message, "playerInfoReplyMessage"))
            $root.PlayerInfoReplyMessage.encode(message.playerInfoReplyMessage, writer.uint32(162).fork(), _depth + 1).ldelim();
        if (message.subscriptionRequestMessage != null && Object.hasOwnProperty.call(message, "subscriptionRequestMessage"))
            $root.SubscriptionRequestMessage.encode(message.subscriptionRequestMessage, writer.uint32(170).fork(), _depth + 1).ldelim();
        if (message.joinExistingGameMessage != null && Object.hasOwnProperty.call(message, "joinExistingGameMessage"))
            $root.JoinExistingGameMessage.encode(message.joinExistingGameMessage, writer.uint32(178).fork(), _depth + 1).ldelim();
        if (message.joinNewGameMessage != null && Object.hasOwnProperty.call(message, "joinNewGameMessage"))
            $root.JoinNewGameMessage.encode(message.joinNewGameMessage, writer.uint32(186).fork(), _depth + 1).ldelim();
        if (message.rejoinExistingGameMessage != null && Object.hasOwnProperty.call(message, "rejoinExistingGameMessage"))
            $root.RejoinExistingGameMessage.encode(message.rejoinExistingGameMessage, writer.uint32(194).fork(), _depth + 1).ldelim();
        if (message.joinGameAckMessage != null && Object.hasOwnProperty.call(message, "joinGameAckMessage"))
            $root.JoinGameAckMessage.encode(message.joinGameAckMessage, writer.uint32(202).fork(), _depth + 1).ldelim();
        if (message.joinGameFailedMessage != null && Object.hasOwnProperty.call(message, "joinGameFailedMessage"))
            $root.JoinGameFailedMessage.encode(message.joinGameFailedMessage, writer.uint32(210).fork(), _depth + 1).ldelim();
        if (message.gamePlayerJoinedMessage != null && Object.hasOwnProperty.call(message, "gamePlayerJoinedMessage"))
            $root.GamePlayerJoinedMessage.encode(message.gamePlayerJoinedMessage, writer.uint32(218).fork(), _depth + 1).ldelim();
        if (message.gamePlayerLeftMessage != null && Object.hasOwnProperty.call(message, "gamePlayerLeftMessage"))
            $root.GamePlayerLeftMessage.encode(message.gamePlayerLeftMessage, writer.uint32(226).fork(), _depth + 1).ldelim();
        if (message.gameAdminChangedMessage != null && Object.hasOwnProperty.call(message, "gameAdminChangedMessage"))
            $root.GameAdminChangedMessage.encode(message.gameAdminChangedMessage, writer.uint32(234).fork(), _depth + 1).ldelim();
        if (message.removedFromGameMessage != null && Object.hasOwnProperty.call(message, "removedFromGameMessage"))
            $root.RemovedFromGameMessage.encode(message.removedFromGameMessage, writer.uint32(242).fork(), _depth + 1).ldelim();
        if (message.kickPlayerRequestMessage != null && Object.hasOwnProperty.call(message, "kickPlayerRequestMessage"))
            $root.KickPlayerRequestMessage.encode(message.kickPlayerRequestMessage, writer.uint32(250).fork(), _depth + 1).ldelim();
        if (message.leaveGameRequestMessage != null && Object.hasOwnProperty.call(message, "leaveGameRequestMessage"))
            $root.LeaveGameRequestMessage.encode(message.leaveGameRequestMessage, writer.uint32(258).fork(), _depth + 1).ldelim();
        if (message.invitePlayerToGameMessage != null && Object.hasOwnProperty.call(message, "invitePlayerToGameMessage"))
            $root.InvitePlayerToGameMessage.encode(message.invitePlayerToGameMessage, writer.uint32(266).fork(), _depth + 1).ldelim();
        if (message.inviteNotifyMessage != null && Object.hasOwnProperty.call(message, "inviteNotifyMessage"))
            $root.InviteNotifyMessage.encode(message.inviteNotifyMessage, writer.uint32(274).fork(), _depth + 1).ldelim();
        if (message.rejectGameInvitationMessage != null && Object.hasOwnProperty.call(message, "rejectGameInvitationMessage"))
            $root.RejectGameInvitationMessage.encode(message.rejectGameInvitationMessage, writer.uint32(282).fork(), _depth + 1).ldelim();
        if (message.rejectInvNotifyMessage != null && Object.hasOwnProperty.call(message, "rejectInvNotifyMessage"))
            $root.RejectInvNotifyMessage.encode(message.rejectInvNotifyMessage, writer.uint32(290).fork(), _depth + 1).ldelim();
        if (message.startEventMessage != null && Object.hasOwnProperty.call(message, "startEventMessage"))
            $root.StartEventMessage.encode(message.startEventMessage, writer.uint32(298).fork(), _depth + 1).ldelim();
        if (message.startEventAckMessage != null && Object.hasOwnProperty.call(message, "startEventAckMessage"))
            $root.StartEventAckMessage.encode(message.startEventAckMessage, writer.uint32(306).fork(), _depth + 1).ldelim();
        if (message.gameStartInitialMessage != null && Object.hasOwnProperty.call(message, "gameStartInitialMessage"))
            $root.GameStartInitialMessage.encode(message.gameStartInitialMessage, writer.uint32(314).fork(), _depth + 1).ldelim();
        if (message.gameStartRejoinMessage != null && Object.hasOwnProperty.call(message, "gameStartRejoinMessage"))
            $root.GameStartRejoinMessage.encode(message.gameStartRejoinMessage, writer.uint32(322).fork(), _depth + 1).ldelim();
        if (message.handStartMessage != null && Object.hasOwnProperty.call(message, "handStartMessage"))
            $root.HandStartMessage.encode(message.handStartMessage, writer.uint32(330).fork(), _depth + 1).ldelim();
        if (message.playersTurnMessage != null && Object.hasOwnProperty.call(message, "playersTurnMessage"))
            $root.PlayersTurnMessage.encode(message.playersTurnMessage, writer.uint32(338).fork(), _depth + 1).ldelim();
        if (message.myActionRequestMessage != null && Object.hasOwnProperty.call(message, "myActionRequestMessage"))
            $root.MyActionRequestMessage.encode(message.myActionRequestMessage, writer.uint32(346).fork(), _depth + 1).ldelim();
        if (message.yourActionRejectedMessage != null && Object.hasOwnProperty.call(message, "yourActionRejectedMessage"))
            $root.YourActionRejectedMessage.encode(message.yourActionRejectedMessage, writer.uint32(354).fork(), _depth + 1).ldelim();
        if (message.playersActionDoneMessage != null && Object.hasOwnProperty.call(message, "playersActionDoneMessage"))
            $root.PlayersActionDoneMessage.encode(message.playersActionDoneMessage, writer.uint32(362).fork(), _depth + 1).ldelim();
        if (message.dealFlopCardsMessage != null && Object.hasOwnProperty.call(message, "dealFlopCardsMessage"))
            $root.DealFlopCardsMessage.encode(message.dealFlopCardsMessage, writer.uint32(370).fork(), _depth + 1).ldelim();
        if (message.dealTurnCardMessage != null && Object.hasOwnProperty.call(message, "dealTurnCardMessage"))
            $root.DealTurnCardMessage.encode(message.dealTurnCardMessage, writer.uint32(378).fork(), _depth + 1).ldelim();
        if (message.dealRiverCardMessage != null && Object.hasOwnProperty.call(message, "dealRiverCardMessage"))
            $root.DealRiverCardMessage.encode(message.dealRiverCardMessage, writer.uint32(386).fork(), _depth + 1).ldelim();
        if (message.allInShowCardsMessage != null && Object.hasOwnProperty.call(message, "allInShowCardsMessage"))
            $root.AllInShowCardsMessage.encode(message.allInShowCardsMessage, writer.uint32(394).fork(), _depth + 1).ldelim();
        if (message.endOfHandShowCardsMessage != null && Object.hasOwnProperty.call(message, "endOfHandShowCardsMessage"))
            $root.EndOfHandShowCardsMessage.encode(message.endOfHandShowCardsMessage, writer.uint32(402).fork(), _depth + 1).ldelim();
        if (message.endOfHandHideCardsMessage != null && Object.hasOwnProperty.call(message, "endOfHandHideCardsMessage"))
            $root.EndOfHandHideCardsMessage.encode(message.endOfHandHideCardsMessage, writer.uint32(410).fork(), _depth + 1).ldelim();
        if (message.showMyCardsRequestMessage != null && Object.hasOwnProperty.call(message, "showMyCardsRequestMessage"))
            $root.ShowMyCardsRequestMessage.encode(message.showMyCardsRequestMessage, writer.uint32(418).fork(), _depth + 1).ldelim();
        if (message.afterHandShowCardsMessage != null && Object.hasOwnProperty.call(message, "afterHandShowCardsMessage"))
            $root.AfterHandShowCardsMessage.encode(message.afterHandShowCardsMessage, writer.uint32(426).fork(), _depth + 1).ldelim();
        if (message.endOfGameMessage != null && Object.hasOwnProperty.call(message, "endOfGameMessage"))
            $root.EndOfGameMessage.encode(message.endOfGameMessage, writer.uint32(434).fork(), _depth + 1).ldelim();
        if (message.playerIdChangedMessage != null && Object.hasOwnProperty.call(message, "playerIdChangedMessage"))
            $root.PlayerIdChangedMessage.encode(message.playerIdChangedMessage, writer.uint32(442).fork(), _depth + 1).ldelim();
        if (message.askKickPlayerMessage != null && Object.hasOwnProperty.call(message, "askKickPlayerMessage"))
            $root.AskKickPlayerMessage.encode(message.askKickPlayerMessage, writer.uint32(450).fork(), _depth + 1).ldelim();
        if (message.askKickDeniedMessage != null && Object.hasOwnProperty.call(message, "askKickDeniedMessage"))
            $root.AskKickDeniedMessage.encode(message.askKickDeniedMessage, writer.uint32(458).fork(), _depth + 1).ldelim();
        if (message.startKickPetitionMessage != null && Object.hasOwnProperty.call(message, "startKickPetitionMessage"))
            $root.StartKickPetitionMessage.encode(message.startKickPetitionMessage, writer.uint32(466).fork(), _depth + 1).ldelim();
        if (message.voteKickRequestMessage != null && Object.hasOwnProperty.call(message, "voteKickRequestMessage"))
            $root.VoteKickRequestMessage.encode(message.voteKickRequestMessage, writer.uint32(474).fork(), _depth + 1).ldelim();
        if (message.voteKickReplyMessage != null && Object.hasOwnProperty.call(message, "voteKickReplyMessage"))
            $root.VoteKickReplyMessage.encode(message.voteKickReplyMessage, writer.uint32(482).fork(), _depth + 1).ldelim();
        if (message.kickPetitionUpdateMessage != null && Object.hasOwnProperty.call(message, "kickPetitionUpdateMessage"))
            $root.KickPetitionUpdateMessage.encode(message.kickPetitionUpdateMessage, writer.uint32(490).fork(), _depth + 1).ldelim();
        if (message.endKickPetitionMessage != null && Object.hasOwnProperty.call(message, "endKickPetitionMessage"))
            $root.EndKickPetitionMessage.encode(message.endKickPetitionMessage, writer.uint32(498).fork(), _depth + 1).ldelim();
        if (message.statisticsMessage != null && Object.hasOwnProperty.call(message, "statisticsMessage"))
            $root.StatisticsMessage.encode(message.statisticsMessage, writer.uint32(506).fork(), _depth + 1).ldelim();
        if (message.chatRequestMessage != null && Object.hasOwnProperty.call(message, "chatRequestMessage"))
            $root.ChatRequestMessage.encode(message.chatRequestMessage, writer.uint32(514).fork(), _depth + 1).ldelim();
        if (message.chatMessage != null && Object.hasOwnProperty.call(message, "chatMessage"))
            $root.ChatMessage.encode(message.chatMessage, writer.uint32(522).fork(), _depth + 1).ldelim();
        if (message.chatRejectMessage != null && Object.hasOwnProperty.call(message, "chatRejectMessage"))
            $root.ChatRejectMessage.encode(message.chatRejectMessage, writer.uint32(530).fork(), _depth + 1).ldelim();
        if (message.dialogMessage != null && Object.hasOwnProperty.call(message, "dialogMessage"))
            $root.DialogMessage.encode(message.dialogMessage, writer.uint32(538).fork(), _depth + 1).ldelim();
        if (message.timeoutWarningMessage != null && Object.hasOwnProperty.call(message, "timeoutWarningMessage"))
            $root.TimeoutWarningMessage.encode(message.timeoutWarningMessage, writer.uint32(546).fork(), _depth + 1).ldelim();
        if (message.resetTimeoutMessage != null && Object.hasOwnProperty.call(message, "resetTimeoutMessage"))
            $root.ResetTimeoutMessage.encode(message.resetTimeoutMessage, writer.uint32(554).fork(), _depth + 1).ldelim();
        if (message.reportAvatarMessage != null && Object.hasOwnProperty.call(message, "reportAvatarMessage"))
            $root.ReportAvatarMessage.encode(message.reportAvatarMessage, writer.uint32(562).fork(), _depth + 1).ldelim();
        if (message.reportAvatarAckMessage != null && Object.hasOwnProperty.call(message, "reportAvatarAckMessage"))
            $root.ReportAvatarAckMessage.encode(message.reportAvatarAckMessage, writer.uint32(570).fork(), _depth + 1).ldelim();
        if (message.reportGameMessage != null && Object.hasOwnProperty.call(message, "reportGameMessage"))
            $root.ReportGameMessage.encode(message.reportGameMessage, writer.uint32(578).fork(), _depth + 1).ldelim();
        if (message.reportGameAckMessage != null && Object.hasOwnProperty.call(message, "reportGameAckMessage"))
            $root.ReportGameAckMessage.encode(message.reportGameAckMessage, writer.uint32(586).fork(), _depth + 1).ldelim();
        if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
            $root.ErrorMessage.encode(message.errorMessage, writer.uint32(594).fork(), _depth + 1).ldelim();
        if (message.adminRemoveGameMessage != null && Object.hasOwnProperty.call(message, "adminRemoveGameMessage"))
            $root.AdminRemoveGameMessage.encode(message.adminRemoveGameMessage, writer.uint32(602).fork(), _depth + 1).ldelim();
        if (message.adminRemoveGameAckMessage != null && Object.hasOwnProperty.call(message, "adminRemoveGameAckMessage"))
            $root.AdminRemoveGameAckMessage.encode(message.adminRemoveGameAckMessage, writer.uint32(610).fork(), _depth + 1).ldelim();
        if (message.adminBanPlayerMessage != null && Object.hasOwnProperty.call(message, "adminBanPlayerMessage"))
            $root.AdminBanPlayerMessage.encode(message.adminBanPlayerMessage, writer.uint32(618).fork(), _depth + 1).ldelim();
        if (message.adminBanPlayerAckMessage != null && Object.hasOwnProperty.call(message, "adminBanPlayerAckMessage"))
            $root.AdminBanPlayerAckMessage.encode(message.adminBanPlayerAckMessage, writer.uint32(626).fork(), _depth + 1).ldelim();
        if (message.gameListSpectatorJoinedMessage != null && Object.hasOwnProperty.call(message, "gameListSpectatorJoinedMessage"))
            $root.GameListSpectatorJoinedMessage.encode(message.gameListSpectatorJoinedMessage, writer.uint32(634).fork(), _depth + 1).ldelim();
        if (message.gameListSpectatorLeftMessage != null && Object.hasOwnProperty.call(message, "gameListSpectatorLeftMessage"))
            $root.GameListSpectatorLeftMessage.encode(message.gameListSpectatorLeftMessage, writer.uint32(642).fork(), _depth + 1).ldelim();
        if (message.gameSpectatorJoinedMessage != null && Object.hasOwnProperty.call(message, "gameSpectatorJoinedMessage"))
            $root.GameSpectatorJoinedMessage.encode(message.gameSpectatorJoinedMessage, writer.uint32(650).fork(), _depth + 1).ldelim();
        if (message.gameSpectatorLeftMessage != null && Object.hasOwnProperty.call(message, "gameSpectatorLeftMessage"))
            $root.GameSpectatorLeftMessage.encode(message.gameSpectatorLeftMessage, writer.uint32(658).fork(), _depth + 1).ldelim();
        if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
            for (let i = 0; i < message.$unknowns.length; ++i)
                writer.raw(message.$unknowns[i]);
        return writer;
    };

    PokerTHMessage.decode = function decode(reader, length, _end, _depth, _target) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $Reader.recursionLimit)
            throw Error("max depth exceeded");
        let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.PokerTHMessage();
        while (reader.pos < end) {
            let start = reader.pos;
            let tag = reader.tag();
            if (tag === _end) {
                _end = undefined;
                break;
            }
            let wireType = tag & 7;
            switch (tag >>>= 3) {
            case 1: {
                    if (wireType !== 0)
                        break;
                    message.messageType = reader.int32();
                    continue;
                }
            case 2: {
                    if (wireType !== 2)
                        break;
                    message.announceMessage = $root.AnnounceMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.announceMessage);
                    continue;
                }
            case 3: {
                    if (wireType !== 2)
                        break;
                    message.initMessage = $root.InitMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.initMessage);
                    continue;
                }
            case 4: {
                    if (wireType !== 2)
                        break;
                    message.authServerChallengeMessage = $root.AuthServerChallengeMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.authServerChallengeMessage);
                    continue;
                }
            case 5: {
                    if (wireType !== 2)
                        break;
                    message.authClientResponseMessage = $root.AuthClientResponseMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.authClientResponseMessage);
                    continue;
                }
            case 6: {
                    if (wireType !== 2)
                        break;
                    message.authServerVerificationMessage = $root.AuthServerVerificationMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.authServerVerificationMessage);
                    continue;
                }
            case 7: {
                    if (wireType !== 2)
                        break;
                    message.initAckMessage = $root.InitAckMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.initAckMessage);
                    continue;
                }
            case 8: {
                    if (wireType !== 2)
                        break;
                    message.avatarRequestMessage = $root.AvatarRequestMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.avatarRequestMessage);
                    continue;
                }
            case 9: {
                    if (wireType !== 2)
                        break;
                    message.avatarHeaderMessage = $root.AvatarHeaderMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.avatarHeaderMessage);
                    continue;
                }
            case 10: {
                    if (wireType !== 2)
                        break;
                    message.avatarDataMessage = $root.AvatarDataMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.avatarDataMessage);
                    continue;
                }
            case 11: {
                    if (wireType !== 2)
                        break;
                    message.avatarEndMessage = $root.AvatarEndMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.avatarEndMessage);
                    continue;
                }
            case 12: {
                    if (wireType !== 2)
                        break;
                    message.unknownAvatarMessage = $root.UnknownAvatarMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.unknownAvatarMessage);
                    continue;
                }
            case 13: {
                    if (wireType !== 2)
                        break;
                    message.playerListMessage = $root.PlayerListMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.playerListMessage);
                    continue;
                }
            case 14: {
                    if (wireType !== 2)
                        break;
                    message.gameListNewMessage = $root.GameListNewMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameListNewMessage);
                    continue;
                }
            case 15: {
                    if (wireType !== 2)
                        break;
                    message.gameListUpdateMessage = $root.GameListUpdateMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameListUpdateMessage);
                    continue;
                }
            case 16: {
                    if (wireType !== 2)
                        break;
                    message.gameListPlayerJoinedMessage = $root.GameListPlayerJoinedMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameListPlayerJoinedMessage);
                    continue;
                }
            case 17: {
                    if (wireType !== 2)
                        break;
                    message.gameListPlayerLeftMessage = $root.GameListPlayerLeftMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameListPlayerLeftMessage);
                    continue;
                }
            case 18: {
                    if (wireType !== 2)
                        break;
                    message.gameListAdminChangedMessage = $root.GameListAdminChangedMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameListAdminChangedMessage);
                    continue;
                }
            case 19: {
                    if (wireType !== 2)
                        break;
                    message.playerInfoRequestMessage = $root.PlayerInfoRequestMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.playerInfoRequestMessage);
                    continue;
                }
            case 20: {
                    if (wireType !== 2)
                        break;
                    message.playerInfoReplyMessage = $root.PlayerInfoReplyMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.playerInfoReplyMessage);
                    continue;
                }
            case 21: {
                    if (wireType !== 2)
                        break;
                    message.subscriptionRequestMessage = $root.SubscriptionRequestMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.subscriptionRequestMessage);
                    continue;
                }
            case 22: {
                    if (wireType !== 2)
                        break;
                    message.joinExistingGameMessage = $root.JoinExistingGameMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.joinExistingGameMessage);
                    continue;
                }
            case 23: {
                    if (wireType !== 2)
                        break;
                    message.joinNewGameMessage = $root.JoinNewGameMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.joinNewGameMessage);
                    continue;
                }
            case 24: {
                    if (wireType !== 2)
                        break;
                    message.rejoinExistingGameMessage = $root.RejoinExistingGameMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.rejoinExistingGameMessage);
                    continue;
                }
            case 25: {
                    if (wireType !== 2)
                        break;
                    message.joinGameAckMessage = $root.JoinGameAckMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.joinGameAckMessage);
                    continue;
                }
            case 26: {
                    if (wireType !== 2)
                        break;
                    message.joinGameFailedMessage = $root.JoinGameFailedMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.joinGameFailedMessage);
                    continue;
                }
            case 27: {
                    if (wireType !== 2)
                        break;
                    message.gamePlayerJoinedMessage = $root.GamePlayerJoinedMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gamePlayerJoinedMessage);
                    continue;
                }
            case 28: {
                    if (wireType !== 2)
                        break;
                    message.gamePlayerLeftMessage = $root.GamePlayerLeftMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gamePlayerLeftMessage);
                    continue;
                }
            case 29: {
                    if (wireType !== 2)
                        break;
                    message.gameAdminChangedMessage = $root.GameAdminChangedMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameAdminChangedMessage);
                    continue;
                }
            case 30: {
                    if (wireType !== 2)
                        break;
                    message.removedFromGameMessage = $root.RemovedFromGameMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.removedFromGameMessage);
                    continue;
                }
            case 31: {
                    if (wireType !== 2)
                        break;
                    message.kickPlayerRequestMessage = $root.KickPlayerRequestMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.kickPlayerRequestMessage);
                    continue;
                }
            case 32: {
                    if (wireType !== 2)
                        break;
                    message.leaveGameRequestMessage = $root.LeaveGameRequestMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.leaveGameRequestMessage);
                    continue;
                }
            case 33: {
                    if (wireType !== 2)
                        break;
                    message.invitePlayerToGameMessage = $root.InvitePlayerToGameMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.invitePlayerToGameMessage);
                    continue;
                }
            case 34: {
                    if (wireType !== 2)
                        break;
                    message.inviteNotifyMessage = $root.InviteNotifyMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.inviteNotifyMessage);
                    continue;
                }
            case 35: {
                    if (wireType !== 2)
                        break;
                    message.rejectGameInvitationMessage = $root.RejectGameInvitationMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.rejectGameInvitationMessage);
                    continue;
                }
            case 36: {
                    if (wireType !== 2)
                        break;
                    message.rejectInvNotifyMessage = $root.RejectInvNotifyMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.rejectInvNotifyMessage);
                    continue;
                }
            case 37: {
                    if (wireType !== 2)
                        break;
                    message.startEventMessage = $root.StartEventMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.startEventMessage);
                    continue;
                }
            case 38: {
                    if (wireType !== 2)
                        break;
                    message.startEventAckMessage = $root.StartEventAckMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.startEventAckMessage);
                    continue;
                }
            case 39: {
                    if (wireType !== 2)
                        break;
                    message.gameStartInitialMessage = $root.GameStartInitialMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameStartInitialMessage);
                    continue;
                }
            case 40: {
                    if (wireType !== 2)
                        break;
                    message.gameStartRejoinMessage = $root.GameStartRejoinMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameStartRejoinMessage);
                    continue;
                }
            case 41: {
                    if (wireType !== 2)
                        break;
                    message.handStartMessage = $root.HandStartMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.handStartMessage);
                    continue;
                }
            case 42: {
                    if (wireType !== 2)
                        break;
                    message.playersTurnMessage = $root.PlayersTurnMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.playersTurnMessage);
                    continue;
                }
            case 43: {
                    if (wireType !== 2)
                        break;
                    message.myActionRequestMessage = $root.MyActionRequestMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.myActionRequestMessage);
                    continue;
                }
            case 44: {
                    if (wireType !== 2)
                        break;
                    message.yourActionRejectedMessage = $root.YourActionRejectedMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.yourActionRejectedMessage);
                    continue;
                }
            case 45: {
                    if (wireType !== 2)
                        break;
                    message.playersActionDoneMessage = $root.PlayersActionDoneMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.playersActionDoneMessage);
                    continue;
                }
            case 46: {
                    if (wireType !== 2)
                        break;
                    message.dealFlopCardsMessage = $root.DealFlopCardsMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.dealFlopCardsMessage);
                    continue;
                }
            case 47: {
                    if (wireType !== 2)
                        break;
                    message.dealTurnCardMessage = $root.DealTurnCardMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.dealTurnCardMessage);
                    continue;
                }
            case 48: {
                    if (wireType !== 2)
                        break;
                    message.dealRiverCardMessage = $root.DealRiverCardMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.dealRiverCardMessage);
                    continue;
                }
            case 49: {
                    if (wireType !== 2)
                        break;
                    message.allInShowCardsMessage = $root.AllInShowCardsMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.allInShowCardsMessage);
                    continue;
                }
            case 50: {
                    if (wireType !== 2)
                        break;
                    message.endOfHandShowCardsMessage = $root.EndOfHandShowCardsMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.endOfHandShowCardsMessage);
                    continue;
                }
            case 51: {
                    if (wireType !== 2)
                        break;
                    message.endOfHandHideCardsMessage = $root.EndOfHandHideCardsMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.endOfHandHideCardsMessage);
                    continue;
                }
            case 52: {
                    if (wireType !== 2)
                        break;
                    message.showMyCardsRequestMessage = $root.ShowMyCardsRequestMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.showMyCardsRequestMessage);
                    continue;
                }
            case 53: {
                    if (wireType !== 2)
                        break;
                    message.afterHandShowCardsMessage = $root.AfterHandShowCardsMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.afterHandShowCardsMessage);
                    continue;
                }
            case 54: {
                    if (wireType !== 2)
                        break;
                    message.endOfGameMessage = $root.EndOfGameMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.endOfGameMessage);
                    continue;
                }
            case 55: {
                    if (wireType !== 2)
                        break;
                    message.playerIdChangedMessage = $root.PlayerIdChangedMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.playerIdChangedMessage);
                    continue;
                }
            case 56: {
                    if (wireType !== 2)
                        break;
                    message.askKickPlayerMessage = $root.AskKickPlayerMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.askKickPlayerMessage);
                    continue;
                }
            case 57: {
                    if (wireType !== 2)
                        break;
                    message.askKickDeniedMessage = $root.AskKickDeniedMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.askKickDeniedMessage);
                    continue;
                }
            case 58: {
                    if (wireType !== 2)
                        break;
                    message.startKickPetitionMessage = $root.StartKickPetitionMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.startKickPetitionMessage);
                    continue;
                }
            case 59: {
                    if (wireType !== 2)
                        break;
                    message.voteKickRequestMessage = $root.VoteKickRequestMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.voteKickRequestMessage);
                    continue;
                }
            case 60: {
                    if (wireType !== 2)
                        break;
                    message.voteKickReplyMessage = $root.VoteKickReplyMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.voteKickReplyMessage);
                    continue;
                }
            case 61: {
                    if (wireType !== 2)
                        break;
                    message.kickPetitionUpdateMessage = $root.KickPetitionUpdateMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.kickPetitionUpdateMessage);
                    continue;
                }
            case 62: {
                    if (wireType !== 2)
                        break;
                    message.endKickPetitionMessage = $root.EndKickPetitionMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.endKickPetitionMessage);
                    continue;
                }
            case 63: {
                    if (wireType !== 2)
                        break;
                    message.statisticsMessage = $root.StatisticsMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.statisticsMessage);
                    continue;
                }
            case 64: {
                    if (wireType !== 2)
                        break;
                    message.chatRequestMessage = $root.ChatRequestMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.chatRequestMessage);
                    continue;
                }
            case 65: {
                    if (wireType !== 2)
                        break;
                    message.chatMessage = $root.ChatMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.chatMessage);
                    continue;
                }
            case 66: {
                    if (wireType !== 2)
                        break;
                    message.chatRejectMessage = $root.ChatRejectMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.chatRejectMessage);
                    continue;
                }
            case 67: {
                    if (wireType !== 2)
                        break;
                    message.dialogMessage = $root.DialogMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.dialogMessage);
                    continue;
                }
            case 68: {
                    if (wireType !== 2)
                        break;
                    message.timeoutWarningMessage = $root.TimeoutWarningMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.timeoutWarningMessage);
                    continue;
                }
            case 69: {
                    if (wireType !== 2)
                        break;
                    message.resetTimeoutMessage = $root.ResetTimeoutMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.resetTimeoutMessage);
                    continue;
                }
            case 70: {
                    if (wireType !== 2)
                        break;
                    message.reportAvatarMessage = $root.ReportAvatarMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.reportAvatarMessage);
                    continue;
                }
            case 71: {
                    if (wireType !== 2)
                        break;
                    message.reportAvatarAckMessage = $root.ReportAvatarAckMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.reportAvatarAckMessage);
                    continue;
                }
            case 72: {
                    if (wireType !== 2)
                        break;
                    message.reportGameMessage = $root.ReportGameMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.reportGameMessage);
                    continue;
                }
            case 73: {
                    if (wireType !== 2)
                        break;
                    message.reportGameAckMessage = $root.ReportGameAckMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.reportGameAckMessage);
                    continue;
                }
            case 74: {
                    if (wireType !== 2)
                        break;
                    message.errorMessage = $root.ErrorMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.errorMessage);
                    continue;
                }
            case 75: {
                    if (wireType !== 2)
                        break;
                    message.adminRemoveGameMessage = $root.AdminRemoveGameMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.adminRemoveGameMessage);
                    continue;
                }
            case 76: {
                    if (wireType !== 2)
                        break;
                    message.adminRemoveGameAckMessage = $root.AdminRemoveGameAckMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.adminRemoveGameAckMessage);
                    continue;
                }
            case 77: {
                    if (wireType !== 2)
                        break;
                    message.adminBanPlayerMessage = $root.AdminBanPlayerMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.adminBanPlayerMessage);
                    continue;
                }
            case 78: {
                    if (wireType !== 2)
                        break;
                    message.adminBanPlayerAckMessage = $root.AdminBanPlayerAckMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.adminBanPlayerAckMessage);
                    continue;
                }
            case 79: {
                    if (wireType !== 2)
                        break;
                    message.gameListSpectatorJoinedMessage = $root.GameListSpectatorJoinedMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameListSpectatorJoinedMessage);
                    continue;
                }
            case 80: {
                    if (wireType !== 2)
                        break;
                    message.gameListSpectatorLeftMessage = $root.GameListSpectatorLeftMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameListSpectatorLeftMessage);
                    continue;
                }
            case 81: {
                    if (wireType !== 2)
                        break;
                    message.gameSpectatorJoinedMessage = $root.GameSpectatorJoinedMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameSpectatorJoinedMessage);
                    continue;
                }
            case 82: {
                    if (wireType !== 2)
                        break;
                    message.gameSpectatorLeftMessage = $root.GameSpectatorLeftMessage.decode(reader, reader.uint32(), undefined, _depth + 1, message.gameSpectatorLeftMessage);
                    continue;
                }
            }
            reader.skipType(wireType, _depth, tag);
            $util.makeProp(message, "$unknowns", false);
            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
        }
        if (_end !== undefined)
            throw Error("missing end group");
        if (!message.hasOwnProperty("messageType"))
            throw $util.ProtocolError("missing required 'messageType'", { instance: message });
        return message;
    };

    PokerTHMessage.verify = function verify(message, _depth) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (_depth === undefined)
            _depth = 0;
        if (_depth > $util.recursionLimit)
            return "max depth exceeded";
        switch (message.messageType) {
        default:
            return "messageType: enum value expected";
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 21:
        case 22:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 28:
        case 29:
        case 30:
        case 31:
        case 32:
        case 33:
        case 34:
        case 35:
        case 36:
        case 37:
        case 38:
        case 39:
        case 40:
        case 41:
        case 42:
        case 43:
        case 44:
        case 45:
        case 46:
        case 47:
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
        case 58:
        case 59:
        case 60:
        case 61:
        case 62:
        case 63:
        case 64:
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
            break;
        }
        if (message.announceMessage != null && message.hasOwnProperty("announceMessage")) {
            let error = $root.AnnounceMessage.verify(message.announceMessage, _depth + 1);
            if (error)
                return "announceMessage." + error;
        }
        if (message.initMessage != null && message.hasOwnProperty("initMessage")) {
            let error = $root.InitMessage.verify(message.initMessage, _depth + 1);
            if (error)
                return "initMessage." + error;
        }
        if (message.authServerChallengeMessage != null && message.hasOwnProperty("authServerChallengeMessage")) {
            let error = $root.AuthServerChallengeMessage.verify(message.authServerChallengeMessage, _depth + 1);
            if (error)
                return "authServerChallengeMessage." + error;
        }
        if (message.authClientResponseMessage != null && message.hasOwnProperty("authClientResponseMessage")) {
            let error = $root.AuthClientResponseMessage.verify(message.authClientResponseMessage, _depth + 1);
            if (error)
                return "authClientResponseMessage." + error;
        }
        if (message.authServerVerificationMessage != null && message.hasOwnProperty("authServerVerificationMessage")) {
            let error = $root.AuthServerVerificationMessage.verify(message.authServerVerificationMessage, _depth + 1);
            if (error)
                return "authServerVerificationMessage." + error;
        }
        if (message.initAckMessage != null && message.hasOwnProperty("initAckMessage")) {
            let error = $root.InitAckMessage.verify(message.initAckMessage, _depth + 1);
            if (error)
                return "initAckMessage." + error;
        }
        if (message.avatarRequestMessage != null && message.hasOwnProperty("avatarRequestMessage")) {
            let error = $root.AvatarRequestMessage.verify(message.avatarRequestMessage, _depth + 1);
            if (error)
                return "avatarRequestMessage." + error;
        }
        if (message.avatarHeaderMessage != null && message.hasOwnProperty("avatarHeaderMessage")) {
            let error = $root.AvatarHeaderMessage.verify(message.avatarHeaderMessage, _depth + 1);
            if (error)
                return "avatarHeaderMessage." + error;
        }
        if (message.avatarDataMessage != null && message.hasOwnProperty("avatarDataMessage")) {
            let error = $root.AvatarDataMessage.verify(message.avatarDataMessage, _depth + 1);
            if (error)
                return "avatarDataMessage." + error;
        }
        if (message.avatarEndMessage != null && message.hasOwnProperty("avatarEndMessage")) {
            let error = $root.AvatarEndMessage.verify(message.avatarEndMessage, _depth + 1);
            if (error)
                return "avatarEndMessage." + error;
        }
        if (message.unknownAvatarMessage != null && message.hasOwnProperty("unknownAvatarMessage")) {
            let error = $root.UnknownAvatarMessage.verify(message.unknownAvatarMessage, _depth + 1);
            if (error)
                return "unknownAvatarMessage." + error;
        }
        if (message.playerListMessage != null && message.hasOwnProperty("playerListMessage")) {
            let error = $root.PlayerListMessage.verify(message.playerListMessage, _depth + 1);
            if (error)
                return "playerListMessage." + error;
        }
        if (message.gameListNewMessage != null && message.hasOwnProperty("gameListNewMessage")) {
            let error = $root.GameListNewMessage.verify(message.gameListNewMessage, _depth + 1);
            if (error)
                return "gameListNewMessage." + error;
        }
        if (message.gameListUpdateMessage != null && message.hasOwnProperty("gameListUpdateMessage")) {
            let error = $root.GameListUpdateMessage.verify(message.gameListUpdateMessage, _depth + 1);
            if (error)
                return "gameListUpdateMessage." + error;
        }
        if (message.gameListPlayerJoinedMessage != null && message.hasOwnProperty("gameListPlayerJoinedMessage")) {
            let error = $root.GameListPlayerJoinedMessage.verify(message.gameListPlayerJoinedMessage, _depth + 1);
            if (error)
                return "gameListPlayerJoinedMessage." + error;
        }
        if (message.gameListPlayerLeftMessage != null && message.hasOwnProperty("gameListPlayerLeftMessage")) {
            let error = $root.GameListPlayerLeftMessage.verify(message.gameListPlayerLeftMessage, _depth + 1);
            if (error)
                return "gameListPlayerLeftMessage." + error;
        }
        if (message.gameListAdminChangedMessage != null && message.hasOwnProperty("gameListAdminChangedMessage")) {
            let error = $root.GameListAdminChangedMessage.verify(message.gameListAdminChangedMessage, _depth + 1);
            if (error)
                return "gameListAdminChangedMessage." + error;
        }
        if (message.playerInfoRequestMessage != null && message.hasOwnProperty("playerInfoRequestMessage")) {
            let error = $root.PlayerInfoRequestMessage.verify(message.playerInfoRequestMessage, _depth + 1);
            if (error)
                return "playerInfoRequestMessage." + error;
        }
        if (message.playerInfoReplyMessage != null && message.hasOwnProperty("playerInfoReplyMessage")) {
            let error = $root.PlayerInfoReplyMessage.verify(message.playerInfoReplyMessage, _depth + 1);
            if (error)
                return "playerInfoReplyMessage." + error;
        }
        if (message.subscriptionRequestMessage != null && message.hasOwnProperty("subscriptionRequestMessage")) {
            let error = $root.SubscriptionRequestMessage.verify(message.subscriptionRequestMessage, _depth + 1);
            if (error)
                return "subscriptionRequestMessage." + error;
        }
        if (message.joinExistingGameMessage != null && message.hasOwnProperty("joinExistingGameMessage")) {
            let error = $root.JoinExistingGameMessage.verify(message.joinExistingGameMessage, _depth + 1);
            if (error)
                return "joinExistingGameMessage." + error;
        }
        if (message.joinNewGameMessage != null && message.hasOwnProperty("joinNewGameMessage")) {
            let error = $root.JoinNewGameMessage.verify(message.joinNewGameMessage, _depth + 1);
            if (error)
                return "joinNewGameMessage." + error;
        }
        if (message.rejoinExistingGameMessage != null && message.hasOwnProperty("rejoinExistingGameMessage")) {
            let error = $root.RejoinExistingGameMessage.verify(message.rejoinExistingGameMessage, _depth + 1);
            if (error)
                return "rejoinExistingGameMessage." + error;
        }
        if (message.joinGameAckMessage != null && message.hasOwnProperty("joinGameAckMessage")) {
            let error = $root.JoinGameAckMessage.verify(message.joinGameAckMessage, _depth + 1);
            if (error)
                return "joinGameAckMessage." + error;
        }
        if (message.joinGameFailedMessage != null && message.hasOwnProperty("joinGameFailedMessage")) {
            let error = $root.JoinGameFailedMessage.verify(message.joinGameFailedMessage, _depth + 1);
            if (error)
                return "joinGameFailedMessage." + error;
        }
        if (message.gamePlayerJoinedMessage != null && message.hasOwnProperty("gamePlayerJoinedMessage")) {
            let error = $root.GamePlayerJoinedMessage.verify(message.gamePlayerJoinedMessage, _depth + 1);
            if (error)
                return "gamePlayerJoinedMessage." + error;
        }
        if (message.gamePlayerLeftMessage != null && message.hasOwnProperty("gamePlayerLeftMessage")) {
            let error = $root.GamePlayerLeftMessage.verify(message.gamePlayerLeftMessage, _depth + 1);
            if (error)
                return "gamePlayerLeftMessage." + error;
        }
        if (message.gameAdminChangedMessage != null && message.hasOwnProperty("gameAdminChangedMessage")) {
            let error = $root.GameAdminChangedMessage.verify(message.gameAdminChangedMessage, _depth + 1);
            if (error)
                return "gameAdminChangedMessage." + error;
        }
        if (message.removedFromGameMessage != null && message.hasOwnProperty("removedFromGameMessage")) {
            let error = $root.RemovedFromGameMessage.verify(message.removedFromGameMessage, _depth + 1);
            if (error)
                return "removedFromGameMessage." + error;
        }
        if (message.kickPlayerRequestMessage != null && message.hasOwnProperty("kickPlayerRequestMessage")) {
            let error = $root.KickPlayerRequestMessage.verify(message.kickPlayerRequestMessage, _depth + 1);
            if (error)
                return "kickPlayerRequestMessage." + error;
        }
        if (message.leaveGameRequestMessage != null && message.hasOwnProperty("leaveGameRequestMessage")) {
            let error = $root.LeaveGameRequestMessage.verify(message.leaveGameRequestMessage, _depth + 1);
            if (error)
                return "leaveGameRequestMessage." + error;
        }
        if (message.invitePlayerToGameMessage != null && message.hasOwnProperty("invitePlayerToGameMessage")) {
            let error = $root.InvitePlayerToGameMessage.verify(message.invitePlayerToGameMessage, _depth + 1);
            if (error)
                return "invitePlayerToGameMessage." + error;
        }
        if (message.inviteNotifyMessage != null && message.hasOwnProperty("inviteNotifyMessage")) {
            let error = $root.InviteNotifyMessage.verify(message.inviteNotifyMessage, _depth + 1);
            if (error)
                return "inviteNotifyMessage." + error;
        }
        if (message.rejectGameInvitationMessage != null && message.hasOwnProperty("rejectGameInvitationMessage")) {
            let error = $root.RejectGameInvitationMessage.verify(message.rejectGameInvitationMessage, _depth + 1);
            if (error)
                return "rejectGameInvitationMessage." + error;
        }
        if (message.rejectInvNotifyMessage != null && message.hasOwnProperty("rejectInvNotifyMessage")) {
            let error = $root.RejectInvNotifyMessage.verify(message.rejectInvNotifyMessage, _depth + 1);
            if (error)
                return "rejectInvNotifyMessage." + error;
        }
        if (message.startEventMessage != null && message.hasOwnProperty("startEventMessage")) {
            let error = $root.StartEventMessage.verify(message.startEventMessage, _depth + 1);
            if (error)
                return "startEventMessage." + error;
        }
        if (message.startEventAckMessage != null && message.hasOwnProperty("startEventAckMessage")) {
            let error = $root.StartEventAckMessage.verify(message.startEventAckMessage, _depth + 1);
            if (error)
                return "startEventAckMessage." + error;
        }
        if (message.gameStartInitialMessage != null && message.hasOwnProperty("gameStartInitialMessage")) {
            let error = $root.GameStartInitialMessage.verify(message.gameStartInitialMessage, _depth + 1);
            if (error)
                return "gameStartInitialMessage." + error;
        }
        if (message.gameStartRejoinMessage != null && message.hasOwnProperty("gameStartRejoinMessage")) {
            let error = $root.GameStartRejoinMessage.verify(message.gameStartRejoinMessage, _depth + 1);
            if (error)
                return "gameStartRejoinMessage." + error;
        }
        if (message.handStartMessage != null && message.hasOwnProperty("handStartMessage")) {
            let error = $root.HandStartMessage.verify(message.handStartMessage, _depth + 1);
            if (error)
                return "handStartMessage." + error;
        }
        if (message.playersTurnMessage != null && message.hasOwnProperty("playersTurnMessage")) {
            let error = $root.PlayersTurnMessage.verify(message.playersTurnMessage, _depth + 1);
            if (error)
                return "playersTurnMessage." + error;
        }
        if (message.myActionRequestMessage != null && message.hasOwnProperty("myActionRequestMessage")) {
            let error = $root.MyActionRequestMessage.verify(message.myActionRequestMessage, _depth + 1);
            if (error)
                return "myActionRequestMessage." + error;
        }
        if (message.yourActionRejectedMessage != null && message.hasOwnProperty("yourActionRejectedMessage")) {
            let error = $root.YourActionRejectedMessage.verify(message.yourActionRejectedMessage, _depth + 1);
            if (error)
                return "yourActionRejectedMessage." + error;
        }
        if (message.playersActionDoneMessage != null && message.hasOwnProperty("playersActionDoneMessage")) {
            let error = $root.PlayersActionDoneMessage.verify(message.playersActionDoneMessage, _depth + 1);
            if (error)
                return "playersActionDoneMessage." + error;
        }
        if (message.dealFlopCardsMessage != null && message.hasOwnProperty("dealFlopCardsMessage")) {
            let error = $root.DealFlopCardsMessage.verify(message.dealFlopCardsMessage, _depth + 1);
            if (error)
                return "dealFlopCardsMessage." + error;
        }
        if (message.dealTurnCardMessage != null && message.hasOwnProperty("dealTurnCardMessage")) {
            let error = $root.DealTurnCardMessage.verify(message.dealTurnCardMessage, _depth + 1);
            if (error)
                return "dealTurnCardMessage." + error;
        }
        if (message.dealRiverCardMessage != null && message.hasOwnProperty("dealRiverCardMessage")) {
            let error = $root.DealRiverCardMessage.verify(message.dealRiverCardMessage, _depth + 1);
            if (error)
                return "dealRiverCardMessage." + error;
        }
        if (message.allInShowCardsMessage != null && message.hasOwnProperty("allInShowCardsMessage")) {
            let error = $root.AllInShowCardsMessage.verify(message.allInShowCardsMessage, _depth + 1);
            if (error)
                return "allInShowCardsMessage." + error;
        }
        if (message.endOfHandShowCardsMessage != null && message.hasOwnProperty("endOfHandShowCardsMessage")) {
            let error = $root.EndOfHandShowCardsMessage.verify(message.endOfHandShowCardsMessage, _depth + 1);
            if (error)
                return "endOfHandShowCardsMessage." + error;
        }
        if (message.endOfHandHideCardsMessage != null && message.hasOwnProperty("endOfHandHideCardsMessage")) {
            let error = $root.EndOfHandHideCardsMessage.verify(message.endOfHandHideCardsMessage, _depth + 1);
            if (error)
                return "endOfHandHideCardsMessage." + error;
        }
        if (message.showMyCardsRequestMessage != null && message.hasOwnProperty("showMyCardsRequestMessage")) {
            let error = $root.ShowMyCardsRequestMessage.verify(message.showMyCardsRequestMessage, _depth + 1);
            if (error)
                return "showMyCardsRequestMessage." + error;
        }
        if (message.afterHandShowCardsMessage != null && message.hasOwnProperty("afterHandShowCardsMessage")) {
            let error = $root.AfterHandShowCardsMessage.verify(message.afterHandShowCardsMessage, _depth + 1);
            if (error)
                return "afterHandShowCardsMessage." + error;
        }
        if (message.endOfGameMessage != null && message.hasOwnProperty("endOfGameMessage")) {
            let error = $root.EndOfGameMessage.verify(message.endOfGameMessage, _depth + 1);
            if (error)
                return "endOfGameMessage." + error;
        }
        if (message.playerIdChangedMessage != null && message.hasOwnProperty("playerIdChangedMessage")) {
            let error = $root.PlayerIdChangedMessage.verify(message.playerIdChangedMessage, _depth + 1);
            if (error)
                return "playerIdChangedMessage." + error;
        }
        if (message.askKickPlayerMessage != null && message.hasOwnProperty("askKickPlayerMessage")) {
            let error = $root.AskKickPlayerMessage.verify(message.askKickPlayerMessage, _depth + 1);
            if (error)
                return "askKickPlayerMessage." + error;
        }
        if (message.askKickDeniedMessage != null && message.hasOwnProperty("askKickDeniedMessage")) {
            let error = $root.AskKickDeniedMessage.verify(message.askKickDeniedMessage, _depth + 1);
            if (error)
                return "askKickDeniedMessage." + error;
        }
        if (message.startKickPetitionMessage != null && message.hasOwnProperty("startKickPetitionMessage")) {
            let error = $root.StartKickPetitionMessage.verify(message.startKickPetitionMessage, _depth + 1);
            if (error)
                return "startKickPetitionMessage." + error;
        }
        if (message.voteKickRequestMessage != null && message.hasOwnProperty("voteKickRequestMessage")) {
            let error = $root.VoteKickRequestMessage.verify(message.voteKickRequestMessage, _depth + 1);
            if (error)
                return "voteKickRequestMessage." + error;
        }
        if (message.voteKickReplyMessage != null && message.hasOwnProperty("voteKickReplyMessage")) {
            let error = $root.VoteKickReplyMessage.verify(message.voteKickReplyMessage, _depth + 1);
            if (error)
                return "voteKickReplyMessage." + error;
        }
        if (message.kickPetitionUpdateMessage != null && message.hasOwnProperty("kickPetitionUpdateMessage")) {
            let error = $root.KickPetitionUpdateMessage.verify(message.kickPetitionUpdateMessage, _depth + 1);
            if (error)
                return "kickPetitionUpdateMessage." + error;
        }
        if (message.endKickPetitionMessage != null && message.hasOwnProperty("endKickPetitionMessage")) {
            let error = $root.EndKickPetitionMessage.verify(message.endKickPetitionMessage, _depth + 1);
            if (error)
                return "endKickPetitionMessage." + error;
        }
        if (message.statisticsMessage != null && message.hasOwnProperty("statisticsMessage")) {
            let error = $root.StatisticsMessage.verify(message.statisticsMessage, _depth + 1);
            if (error)
                return "statisticsMessage." + error;
        }
        if (message.chatRequestMessage != null && message.hasOwnProperty("chatRequestMessage")) {
            let error = $root.ChatRequestMessage.verify(message.chatRequestMessage, _depth + 1);
            if (error)
                return "chatRequestMessage." + error;
        }
        if (message.chatMessage != null && message.hasOwnProperty("chatMessage")) {
            let error = $root.ChatMessage.verify(message.chatMessage, _depth + 1);
            if (error)
                return "chatMessage." + error;
        }
        if (message.chatRejectMessage != null && message.hasOwnProperty("chatRejectMessage")) {
            let error = $root.ChatRejectMessage.verify(message.chatRejectMessage, _depth + 1);
            if (error)
                return "chatRejectMessage." + error;
        }
        if (message.dialogMessage != null && message.hasOwnProperty("dialogMessage")) {
            let error = $root.DialogMessage.verify(message.dialogMessage, _depth + 1);
            if (error)
                return "dialogMessage." + error;
        }
        if (message.timeoutWarningMessage != null && message.hasOwnProperty("timeoutWarningMessage")) {
            let error = $root.TimeoutWarningMessage.verify(message.timeoutWarningMessage, _depth + 1);
            if (error)
                return "timeoutWarningMessage." + error;
        }
        if (message.resetTimeoutMessage != null && message.hasOwnProperty("resetTimeoutMessage")) {
            let error = $root.ResetTimeoutMessage.verify(message.resetTimeoutMessage, _depth + 1);
            if (error)
                return "resetTimeoutMessage." + error;
        }
        if (message.reportAvatarMessage != null && message.hasOwnProperty("reportAvatarMessage")) {
            let error = $root.ReportAvatarMessage.verify(message.reportAvatarMessage, _depth + 1);
            if (error)
                return "reportAvatarMessage." + error;
        }
        if (message.reportAvatarAckMessage != null && message.hasOwnProperty("reportAvatarAckMessage")) {
            let error = $root.ReportAvatarAckMessage.verify(message.reportAvatarAckMessage, _depth + 1);
            if (error)
                return "reportAvatarAckMessage." + error;
        }
        if (message.reportGameMessage != null && message.hasOwnProperty("reportGameMessage")) {
            let error = $root.ReportGameMessage.verify(message.reportGameMessage, _depth + 1);
            if (error)
                return "reportGameMessage." + error;
        }
        if (message.reportGameAckMessage != null && message.hasOwnProperty("reportGameAckMessage")) {
            let error = $root.ReportGameAckMessage.verify(message.reportGameAckMessage, _depth + 1);
            if (error)
                return "reportGameAckMessage." + error;
        }
        if (message.errorMessage != null && message.hasOwnProperty("errorMessage")) {
            let error = $root.ErrorMessage.verify(message.errorMessage, _depth + 1);
            if (error)
                return "errorMessage." + error;
        }
        if (message.adminRemoveGameMessage != null && message.hasOwnProperty("adminRemoveGameMessage")) {
            let error = $root.AdminRemoveGameMessage.verify(message.adminRemoveGameMessage, _depth + 1);
            if (error)
                return "adminRemoveGameMessage." + error;
        }
        if (message.adminRemoveGameAckMessage != null && message.hasOwnProperty("adminRemoveGameAckMessage")) {
            let error = $root.AdminRemoveGameAckMessage.verify(message.adminRemoveGameAckMessage, _depth + 1);
            if (error)
                return "adminRemoveGameAckMessage." + error;
        }
        if (message.adminBanPlayerMessage != null && message.hasOwnProperty("adminBanPlayerMessage")) {
            let error = $root.AdminBanPlayerMessage.verify(message.adminBanPlayerMessage, _depth + 1);
            if (error)
                return "adminBanPlayerMessage." + error;
        }
        if (message.adminBanPlayerAckMessage != null && message.hasOwnProperty("adminBanPlayerAckMessage")) {
            let error = $root.AdminBanPlayerAckMessage.verify(message.adminBanPlayerAckMessage, _depth + 1);
            if (error)
                return "adminBanPlayerAckMessage." + error;
        }
        if (message.gameListSpectatorJoinedMessage != null && message.hasOwnProperty("gameListSpectatorJoinedMessage")) {
            let error = $root.GameListSpectatorJoinedMessage.verify(message.gameListSpectatorJoinedMessage, _depth + 1);
            if (error)
                return "gameListSpectatorJoinedMessage." + error;
        }
        if (message.gameListSpectatorLeftMessage != null && message.hasOwnProperty("gameListSpectatorLeftMessage")) {
            let error = $root.GameListSpectatorLeftMessage.verify(message.gameListSpectatorLeftMessage, _depth + 1);
            if (error)
                return "gameListSpectatorLeftMessage." + error;
        }
        if (message.gameSpectatorJoinedMessage != null && message.hasOwnProperty("gameSpectatorJoinedMessage")) {
            let error = $root.GameSpectatorJoinedMessage.verify(message.gameSpectatorJoinedMessage, _depth + 1);
            if (error)
                return "gameSpectatorJoinedMessage." + error;
        }
        if (message.gameSpectatorLeftMessage != null && message.hasOwnProperty("gameSpectatorLeftMessage")) {
            let error = $root.GameSpectatorLeftMessage.verify(message.gameSpectatorLeftMessage, _depth + 1);
            if (error)
                return "gameSpectatorLeftMessage." + error;
        }
        return null;
    };

    PokerTHMessage.PokerTHMessageType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "Type_AnnounceMessage"] = 1;
        values[valuesById[2] = "Type_InitMessage"] = 2;
        values[valuesById[3] = "Type_AuthServerChallengeMessage"] = 3;
        values[valuesById[4] = "Type_AuthClientResponseMessage"] = 4;
        values[valuesById[5] = "Type_AuthServerVerificationMessage"] = 5;
        values[valuesById[6] = "Type_InitAckMessage"] = 6;
        values[valuesById[7] = "Type_AvatarRequestMessage"] = 7;
        values[valuesById[8] = "Type_AvatarHeaderMessage"] = 8;
        values[valuesById[9] = "Type_AvatarDataMessage"] = 9;
        values[valuesById[10] = "Type_AvatarEndMessage"] = 10;
        values[valuesById[11] = "Type_UnknownAvatarMessage"] = 11;
        values[valuesById[12] = "Type_PlayerListMessage"] = 12;
        values[valuesById[13] = "Type_GameListNewMessage"] = 13;
        values[valuesById[14] = "Type_GameListUpdateMessage"] = 14;
        values[valuesById[15] = "Type_GameListPlayerJoinedMessage"] = 15;
        values[valuesById[16] = "Type_GameListPlayerLeftMessage"] = 16;
        values[valuesById[17] = "Type_GameListAdminChangedMessage"] = 17;
        values[valuesById[18] = "Type_PlayerInfoRequestMessage"] = 18;
        values[valuesById[19] = "Type_PlayerInfoReplyMessage"] = 19;
        values[valuesById[20] = "Type_SubscriptionRequestMessage"] = 20;
        values[valuesById[21] = "Type_JoinExistingGameMessage"] = 21;
        values[valuesById[22] = "Type_JoinNewGameMessage"] = 22;
        values[valuesById[23] = "Type_RejoinExistingGameMessage"] = 23;
        values[valuesById[24] = "Type_JoinGameAckMessage"] = 24;
        values[valuesById[25] = "Type_JoinGameFailedMessage"] = 25;
        values[valuesById[26] = "Type_GamePlayerJoinedMessage"] = 26;
        values[valuesById[27] = "Type_GamePlayerLeftMessage"] = 27;
        values[valuesById[28] = "Type_GameAdminChangedMessage"] = 28;
        values[valuesById[29] = "Type_RemovedFromGameMessage"] = 29;
        values[valuesById[30] = "Type_KickPlayerRequestMessage"] = 30;
        values[valuesById[31] = "Type_LeaveGameRequestMessage"] = 31;
        values[valuesById[32] = "Type_InvitePlayerToGameMessage"] = 32;
        values[valuesById[33] = "Type_InviteNotifyMessage"] = 33;
        values[valuesById[34] = "Type_RejectGameInvitationMessage"] = 34;
        values[valuesById[35] = "Type_RejectInvNotifyMessage"] = 35;
        values[valuesById[36] = "Type_StartEventMessage"] = 36;
        values[valuesById[37] = "Type_StartEventAckMessage"] = 37;
        values[valuesById[38] = "Type_GameStartInitialMessage"] = 38;
        values[valuesById[39] = "Type_GameStartRejoinMessage"] = 39;
        values[valuesById[40] = "Type_HandStartMessage"] = 40;
        values[valuesById[41] = "Type_PlayersTurnMessage"] = 41;
        values[valuesById[42] = "Type_MyActionRequestMessage"] = 42;
        values[valuesById[43] = "Type_YourActionRejectedMessage"] = 43;
        values[valuesById[44] = "Type_PlayersActionDoneMessage"] = 44;
        values[valuesById[45] = "Type_DealFlopCardsMessage"] = 45;
        values[valuesById[46] = "Type_DealTurnCardMessage"] = 46;
        values[valuesById[47] = "Type_DealRiverCardMessage"] = 47;
        values[valuesById[48] = "Type_AllInShowCardsMessage"] = 48;
        values[valuesById[49] = "Type_EndOfHandShowCardsMessage"] = 49;
        values[valuesById[50] = "Type_EndOfHandHideCardsMessage"] = 50;
        values[valuesById[51] = "Type_ShowMyCardsRequestMessage"] = 51;
        values[valuesById[52] = "Type_AfterHandShowCardsMessage"] = 52;
        values[valuesById[53] = "Type_EndOfGameMessage"] = 53;
        values[valuesById[54] = "Type_PlayerIdChangedMessage"] = 54;
        values[valuesById[55] = "Type_AskKickPlayerMessage"] = 55;
        values[valuesById[56] = "Type_AskKickDeniedMessage"] = 56;
        values[valuesById[57] = "Type_StartKickPetitionMessage"] = 57;
        values[valuesById[58] = "Type_VoteKickRequestMessage"] = 58;
        values[valuesById[59] = "Type_VoteKickReplyMessage"] = 59;
        values[valuesById[60] = "Type_KickPetitionUpdateMessage"] = 60;
        values[valuesById[61] = "Type_EndKickPetitionMessage"] = 61;
        values[valuesById[62] = "Type_StatisticsMessage"] = 62;
        values[valuesById[63] = "Type_ChatRequestMessage"] = 63;
        values[valuesById[64] = "Type_ChatMessage"] = 64;
        values[valuesById[65] = "Type_ChatRejectMessage"] = 65;
        values[valuesById[66] = "Type_DialogMessage"] = 66;
        values[valuesById[67] = "Type_TimeoutWarningMessage"] = 67;
        values[valuesById[68] = "Type_ResetTimeoutMessage"] = 68;
        values[valuesById[69] = "Type_ReportAvatarMessage"] = 69;
        values[valuesById[70] = "Type_ReportAvatarAckMessage"] = 70;
        values[valuesById[71] = "Type_ReportGameMessage"] = 71;
        values[valuesById[72] = "Type_ReportGameAckMessage"] = 72;
        values[valuesById[73] = "Type_ErrorMessage"] = 73;
        values[valuesById[74] = "Type_AdminRemoveGameMessage"] = 74;
        values[valuesById[75] = "Type_AdminRemoveGameAckMessage"] = 75;
        values[valuesById[76] = "Type_AdminBanPlayerMessage"] = 76;
        values[valuesById[77] = "Type_AdminBanPlayerAckMessage"] = 77;
        values[valuesById[78] = "Type_GameListSpectatorJoinedMessage"] = 78;
        values[valuesById[79] = "Type_GameListSpectatorLeftMessage"] = 79;
        values[valuesById[80] = "Type_GameSpectatorJoinedMessage"] = 80;
        values[valuesById[81] = "Type_GameSpectatorLeftMessage"] = 81;
        return values;
    })();

    return PokerTHMessage;
})();

export {
  $root as default
};
