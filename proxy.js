/**
 * PokerTH WebSocket <-> TLS/TCP Proxy v2.4
 *
 * Environment variables:
 *   ALLOWED_HOSTS   — comma-separated allowlist of upstream hosts the proxy
 *                     is allowed to dial out to. If unset, falls back to a
 *                     sensible default that covers the public PokerTH server
 *                     and localhost. Any host outside the allowlist receives
 *                     a 4403 close code.
 *                     Example: ALLOWED_HOSTS="pokerth.net,www.pokerth.net,mybox.example.com,localhost,127.0.0.1"
 */

const WebSocket = require('ws');
const net  = require('net');
const tls  = require('tls');
const dns  = require('dns');
const http = require('http');
const https = require('https');
const url  = require('url');
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

// In-memory ring buffer of recent log lines, exposed (token-gated) at /admin/logs.
const LOG_RING = []; const LOG_MAX = 400;
['log', 'warn', 'error'].forEach(function (m) {
  const orig = console[m].bind(console);
  console[m] = function () {
    try {
      const parts = Array.prototype.map.call(arguments, function (a) {
        if (typeof a === 'string') return a;
        try { return JSON.stringify(a); } catch (e) { return String(a); }
      });
      LOG_RING.push(new Date().toISOString() + ' [' + m + '] ' + parts.join(' '));
      if (LOG_RING.length > LOG_MAX) LOG_RING.shift();
    } catch (e) {}
    orig.apply(console, arguments);
  };
});

const args        = process.argv.slice(2);
const PROXY_PORT  = parseInt(args.find(a => /^\d+$/.test(a)) || process.env.PORT || '8080', 10);
const FORCE_NOTLS = args.includes('--notls');
const INSECURE_TLS = args.includes('--insecure');

// ── Upstream allowlist (anti open-relay) ──
// Without this, anyone who can hit the WebSocket can use the proxy to open
// a TCP tunnel to any host:port on the Internet — effectively turning the
// proxy into an anonymous port-scanner / generic relay. The allowlist
// constrains which destinations the proxy is willing to dial.
const DEFAULT_ALLOWED_HOSTS = [
  'pokerth.net',
  'www.pokerth.net',
  'pokerth.ddns.net',
  'localhost',
  '127.0.0.1',
  '::1'
];
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS
  ? process.env.ALLOWED_HOSTS.split(',').map(s => s.trim()).filter(Boolean)
  : DEFAULT_ALLOWED_HOSTS
).map(s => s.toLowerCase());

function isHostAllowed(h) {
  if (!h) return false;
  h = String(h).toLowerCase();
  if (ALLOWED_HOSTS.includes(h)) return true;
  var px = _adminConfig && _adminConfig.proxyCfg;
  var extra = (px && Array.isArray(px.allowedHosts)) ? px.allowedHosts : [];
  for (var i = 0; i < extra.length; i++) { if (String(extra[i]).toLowerCase() === h) return true; }
  var regs = (_adminConfig && Array.isArray(_adminConfig.servers)) ? _adminConfig.servers : [];
  for (var j = 0; j < regs.length; j++) { if (regs[j] && String(regs[j].host).toLowerCase() === h) return true; }
  var _auto = (typeof _serverlistCache !== 'undefined') && _serverlistCache.server;
  if (_auto && String(_auto.host).toLowerCase() === h) return true;
  return false;
}

// ── Upstream port allowlist (anti SSRF-vers-services-locaux) ──
// localhost / 127.0.0.1 / ::1 sont forcement dans l'allowlist d'hotes (un
// serveur PokerTH tourne sur cette machine), donc sans contrainte de port le
// proxy pourrait etre invoque avec host=127.0.0.1&port=22 (SSH), 3306 (MySQL),
// 6379 (Redis)... La liste de ports limite les connexions au(x) port(s) du
// service PokerTH. 7234 est toujours autorise ; l'admin peut en ajouter.
const DEFAULT_ALLOWED_PORTS = [7234];
const ALLOWED_PORTS = (process.env.ALLOWED_PORTS
  ? process.env.ALLOWED_PORTS.split(',').map(s => parseInt(s.trim(), 10)).filter(n => n > 0)
  : DEFAULT_ALLOWED_PORTS
);

function isPortAllowed(p) {
  if (!Number.isInteger(p) || p < 1 || p > 65535) return false;
  if (ALLOWED_PORTS.includes(p)) return true;
  var px = _adminConfig && _adminConfig.proxyCfg;
  var extra = (px && Array.isArray(px.allowedPorts)) ? px.allowedPorts : [];
  for (var i = 0; i < extra.length; i++) { if (parseInt(extra[i], 10) === p) return true; }
  var regs = (_adminConfig && Array.isArray(_adminConfig.servers)) ? _adminConfig.servers : [];
  for (var j = 0; j < regs.length; j++) { if (regs[j] && parseInt(regs[j].port, 10) === p) return true; }
  var _auto = (typeof _serverlistCache !== 'undefined') && _serverlistCache.server;
  if (_auto && parseInt(_auto.port, 10) === p) return true;
  return false;
}

dns.setDefaultResultOrder('ipv4first');

// ── Decoder protobuf minimal ──
function readVarint(buf, pos) {
  let r = 0, shift = 0;
  while (pos < buf.length) {
    const b = buf[pos++];
    r |= (b & 0x7F) << shift;
    if (!(b & 0x80)) break;
    shift += 7;
  }
  return { v: r >>> 0, pos };
}

// Decode a buffer to { fieldNum: value[] }
// values = number (varint) or Buffer (length-delimited)
function pbDecode(buf) {
  const fields = {};
  let pos = 0;
  while (pos < buf.length) {
    const tagR = readVarint(buf, pos); pos = tagR.pos;
    const fn = tagR.v >>> 3;
    const wt = tagR.v & 0x7;
    if (!fields[fn]) fields[fn] = [];
    if (wt === 0) {
      const vr = readVarint(buf, pos); pos = vr.pos;
      fields[fn].push(vr.v);
    } else if (wt === 2) {
      const lr = readVarint(buf, pos); pos = lr.pos;
      fields[fn].push(buf.slice(pos, pos + lr.v));
      pos += lr.v;
    } else if (wt === 1) { pos += 8; }
      else if (wt === 5) { pos += 4; }
      else break;
  }
  return fields;
}

// All PokerTH message types (1..81), taken from pokerth.proto.
// The "Message" suffix is implicit. Used only to make proxy logs readable
// (no business logic depends on this dict).
const MSG_NAMES = {
  // Connection / authentication (1-6)
  1:'Announce', 2:'Init', 3:'AuthServerChallenge', 4:'AuthClientResponse',
  5:'AuthServerVerification', 6:'InitAck',
  // Avatars (7-11) — legacy desktop image-upload protocol
  7:'AvatarRequest', 8:'AvatarHeader', 9:'AvatarData', 10:'AvatarEnd', 11:'UnknownAvatar',
  // Lobby (12-20)
  12:'PlayerList',
  13:'GameListNew', 14:'GameListUpdate', 15:'GameListPlayerJoined', 16:'GameListPlayerLeft',
  17:'GameListAdminChanged',
  18:'PlayerInfoRequest', 19:'PlayerInfoReply', 20:'SubscriptionRequest',
  // Join / leave a table (21-29)
  21:'JoinExisting', 22:'JoinNew', 23:'RejoinExisting', 24:'JoinGameAck', 25:'JoinGameFailed',
  26:'GamePlayerJoined', 27:'GamePlayerLeft', 28:'GameAdminChanged', 29:'RemovedFromGame',
  // Kick / leave / invite (30-35)
  30:'KickPlayerRequest', 31:'LeaveGameRequest',
  32:'InvitePlayerToGame', 33:'InviteNotify', 34:'RejectGameInvitation', 35:'RejectInvNotify',
  // Game start (36-39)
  36:'StartEvent', 37:'StartEventAck', 38:'GameStartInitial', 39:'GameStartRejoin',
  // Hand flow (40-53)
  40:'HandStart', 41:'PlayersTurn', 42:'MyActionRequest', 43:'YourActionRejected',
  44:'PlayersActionDone', 45:'DealFlop', 46:'DealTurn', 47:'DealRiver',
  48:'AllInShowCards', 49:'EndOfHandShow', 50:'EndOfHandHide',
  51:'ShowMyCardsRequest', 52:'AfterHandShowCards', 53:'EndOfGame',
  // Vote-kick (54-61)
  54:'PlayerIdChanged', 55:'AskKickPlayer', 56:'AskKickDenied',
  57:'StartKickPetition', 58:'VoteKickRequest', 59:'VoteKickReply',
  60:'KickPetitionUpdate', 61:'EndKickPetition',
  // Stats / chat / dialog (62-66)
  62:'Statistics', 63:'ChatRequest', 64:'Chat', 65:'ChatReject', 66:'Dialog',
  // Timeout / report (67-72)
  67:'TimeoutWarning', 68:'ResetTimeout',
  69:'ReportAvatar', 70:'ReportAvatarAck', 71:'ReportGame', 72:'ReportGameAck',
  // Error + admin (73-77)
  73:'Error',
  74:'AdminRemoveGame', 75:'AdminRemoveGameAck', 76:'AdminBanPlayer', 77:'AdminBanPlayerAck',
  // Spectators (78-81)
  78:'GameListSpectatorJoined', 79:'GameListSpectatorLeft',
  80:'GameSpectatorJoined', 81:'GameSpectatorLeft',
};

const ERROR_REASONS = {
  0:'custReserved', 1:'initVersionNotSupported', 2:'initServerFull',
  3:'initAuthFailure', 4:'initPlayerNameInUse', 5:'initInvalidPlayerName',
  6:'initServerMaintenance', 7:'initBlocked', 8:'avatarTooLarge',
  9:'invalidPacket', 10:'invalidState', 11:'kickedFromServer',
  12:'bannedFromServer', 13:'blockedByServer', 14:'sessionTimeout',
};

function describeMsg(payload) {
  try {
    const outer = pbDecode(payload);
    const msgType = outer[1] ? outer[1][0] : null;
    const name = msgType !== null ? (MSG_NAMES[msgType] || 'Type#' + msgType) : '?';

    // Look up the ErrorMessage field (field 74 in PokerTHMessage)
    let extra = '';
    if (msgType === 73 && outer[74] && outer[74][0]) {
      const errMsg = pbDecode(outer[74][0]);
      // ErrorMessage.errorReason = field 1 (varint)
      const reason = errMsg[1] ? errMsg[1][0] : null;
      extra = ' *** ERROR: ' + (reason !== null ? (ERROR_REASONS[reason] || 'code '+reason) : '?') + ' ***';
    }
    if (msgType === 6 && outer[7] && outer[7][0]) { // InitAck
      const ack = pbDecode(outer[7][0]);
      const pid = ack[2] ? ack[2][0] : '?';
      extra = ' ✓ CONNECTED! playerId=' + pid;
    }
    if (msgType === 1 && outer[2] && outer[2][0]) { // Announce
      const ann = pbDecode(outer[2][0]);
      const sv = ann[1] ? pbDecode(ann[1][0]) : {};
      const major = sv[1] ? sv[1][0] : '?';
      const minor = sv[2] ? sv[2][0] : '?';
      const np    = ann[5] ? ann[5][0] : '?';
      extra = ' (protocol v' + major + '.' + minor + ', ' + np + ' players)';
    }
    return { name, extra };
  } catch(e) {
    return { name: '?', extra: ' (decode error: ' + e.message + ')' };
  }
}

// ── Family leaderboard storage ──
// Lightweight per-nickname lifetime snapshots, persisted to stats.json next
// to this file. Each web client pushes only its OWN player's snapshot, so
// there is no double counting and last-write-wins per name is correct.
const STATS_FILE = process.env.STATS_FILE || path.join(__dirname, 'stats.json');
let statsStore = {};
try { statsStore = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')) || {}; } catch (e) { statsStore = {}; }
let _statsSaveTimer = null;
function saveStatsSoon() {
  if (_statsSaveTimer) return;
  _statsSaveTimer = setTimeout(function () {
    _statsSaveTimer = null;
    fs.writeFile(STATS_FILE, JSON.stringify(statsStore), function (err) {
      if (err) console.error('[stats] write failed:', err.message);
    });
    dbFlushLeaderboard();
  }, 800);
}

// ── Leaderboard reset policy ──
// STATS_RESET_PERIOD = off | daily | monthly | yearly (default: monthly).
// At startup and hourly, the current period (server local time) is compared to
// the marker persisted in stats.meta.json; when it rolls over, the shared
// leaderboard is wiped. Per-device session stats (browser localStorage) are
// never touched. STATS_ADMIN_TOKEN (optional) enables an on-demand reset via
// POST /stats {"_resetAll":true,"token":"…"}.
// Runtime admin config (reset period, ...) persisted next to stats; env is the fallback.
const ADMIN_CONFIG_FILE = process.env.ADMIN_CONFIG_FILE || path.join(__dirname, 'admin-config.json');
let _adminConfig = {};
try { _adminConfig = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf8')) || {}; } catch (e) { _adminConfig = {}; }
function saveAdminConfig() { try { fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(_adminConfig)); } catch (e) { console.error('[admin] config write failed:', e.message); } }
// ── PokerTH game-server registry (admin Layer A) — see /admin/servers ──
// Entries: { id, name, host, port, tls }. A saved server is auto-added to the
// dial allowlist via isHostAllowed / isPortAllowed. The proxy remains a pure
// relay; it does NOT run or configure the dedicated game server itself.
function _serversList() { var a = _adminConfig && _adminConfig.servers; return Array.isArray(a) ? a : []; }
function _sanitizeServer(s) {
  if (!s || typeof s !== 'object') return null;
  var host = String(s.host || '').trim().toLowerCase().slice(0, 255);
  if (!host || !/^[a-z0-9._:-]+$/.test(host)) return null;
  var port = parseInt(s.port, 10); if (!(port >= 1 && port <= 65535)) port = 7234;
  var name = String(s.name || '').trim().slice(0, 40) || host;
  var id = String(s.id || '').trim().slice(0, 40) || ('srv_' + Math.random().toString(36).slice(2, 9));
  return { id: id, name: name, host: host, port: port, tls: !!s.tls };
}
// The server the client uses for the "Internet / PokerTH.net" entry mode: a
// pointer (activeServerId) into the registry above. Returns {name,host,port,tls}
// for /app-config, or null when unset (the client then keeps its built-in
// pokerth.net:7234 default).
function _activeManualServer() {
  var id = _adminConfig && _adminConfig.activeServerId;
  if (!id) return null;
  var list = _serversList();
  for (var i = 0; i < list.length; i++) {
    if (list[i] && list[i].id === id) return { name: list[i].name, host: list[i].host, port: list[i].port, tls: !!list[i].tls };
  }
  return null;
}

// ── Auto source: official PokerTH serverlist (serverlist.xml.z) ────────────
// When pokerthnetSource === 'auto', the proxy periodically downloads the
// official, zlib-compressed serverlist, parses the first <Server>, and uses
// {host=IPv4Address, port=ProtobufPort, tls=(TLS=='on')} as the Internet/
// PokerTH.net target — so a server move on pokerth.net is followed automatically.
// The browser can't do this itself (CORS + zlib), hence server-side here.
var DEFAULT_SERVERLIST_URL = 'https://pokerth.net/serverlist.xml.z';
var SERVERLIST_TTL_MS = 30 * 60 * 1000;          // refetch cadence while 'auto'
var SERVERLIST_MAX_BYTES = 256 * 1024;           // raw download cap (anti-bomb)
var SERVERLIST_MAX_INFLATED = 1024 * 1024;       // inflated cap (anti-bomb)
var _serverlistCache = { server: null, fetchedAt: 0, fetching: false, error: '' };

function _pokerthnetSource() { var s = _adminConfig && _adminConfig.pokerthnetSource; return s === 'manual' ? 'manual' : 'auto'; }
function _serverlistUrl() { var u = _adminConfig && _adminConfig.serverlistUrl; u = String(u || '').trim(); return u || DEFAULT_SERVERLIST_URL; }

function _parseServerlist(xml) {
  // Minimal regex parse (no XML dep). Returns the first <Server> or null.
  var blocks = xml.match(/<Server\b[\s\S]*?<\/Server>/gi);
  if (!blocks || !blocks.length) return null;
  function attr(b, tag) { var m = new RegExp('<' + tag + '\\s+[^>]*?value\\s*=\\s*"([^"]*)"', 'i').exec(b); return m ? m[1] : ''; }
  var b = blocks[0];
  var host = (attr(b, 'IPv4Address') || attr(b, 'IPv6Address')).trim().toLowerCase();
  var port = parseInt(attr(b, 'ProtobufPort') || attr(b, 'Port') || '7234', 10);
  var tls = /^(on|1|true|yes)$/i.test(attr(b, 'TLS').trim());
  var name = (attr(b, 'Name') || host).trim();
  if (!host || !/^[a-z0-9._:-]+$/.test(host) || !(port >= 1 && port <= 65535)) return null;
  return { name: name.slice(0, 60), host: host.slice(0, 255), port: port, tls: tls };
}

function _doFetchServerlist(u, cb) {
  cb = cb || function () {};
  var mod, opts;
  try {
    var raw0 = String(u || '').trim();
    if (raw0 && !/^https?:\/\//i.test(raw0)) raw0 = 'https://' + raw0;
    var parsed = new url.URL(raw0);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return cb({ ok: false, error: 'bad url scheme' });
    mod = parsed.protocol === 'https:' ? https : http;
    opts = parsed;
  } catch (e) { return cb({ ok: false, error: 'bad url' }); }
  var done = false;
  function finish(err, server) { if (done) return; done = true; if (err) return cb({ ok: false, error: err }); return cb({ ok: true, server: server }); }
  var rq;
  try {
    rq = mod.get(opts, function (resp) {
      if (resp.statusCode !== 200) { resp.resume(); return finish('http ' + resp.statusCode); }
      var chunks = [], total = 0, aborted = false;
      resp.on('data', function (c) { total += c.length; if (total > SERVERLIST_MAX_BYTES) { aborted = true; try { resp.destroy(); } catch (e) {} return; } chunks.push(c); });
      resp.on('end', function () {
        if (aborted) return finish('too large');
        var rawb = Buffer.concat(chunks), xmlBuf;
        try {
          try { xmlBuf = zlib.inflateSync(rawb, { maxOutputLength: SERVERLIST_MAX_INFLATED }); }
          catch (e1) { try { xmlBuf = zlib.gunzipSync(rawb, { maxOutputLength: SERVERLIST_MAX_INFLATED }); } catch (e2) { xmlBuf = zlib.inflateRawSync(rawb, { maxOutputLength: SERVERLIST_MAX_INFLATED }); } }
        } catch (e) { return finish('inflate failed'); }
        var server = _parseServerlist(xmlBuf.toString('utf8'));
        if (!server) return finish('parse failed (no server)');
        return finish('', server);
      });
      resp.on('error', function (e) { finish((e && e.code) || 'stream error'); });
    });
    rq.setTimeout(8000, function () { try { rq.destroy(); } catch (e) {} finish('timeout'); });
    rq.on('error', function (e) { finish((e && e.code) || 'request error'); });
  } catch (e) { finish((e && e.code) || 'error'); }
}

function fetchServerlist(cb) {
  cb = cb || function () {};
  if (_serverlistCache.fetching) return cb({ ok: false, error: 'busy', server: _serverlistCache.server });
  _serverlistCache.fetching = true;
  _doFetchServerlist(_serverlistUrl(), function (r) {
    _serverlistCache.fetching = false; _serverlistCache.fetchedAt = Date.now();
    if (r && r.ok) { _serverlistCache.server = r.server; _serverlistCache.error = ''; }
    else { _serverlistCache.error = (r && r.error) || 'error'; }
    return cb(r);
  });
}

function maybeRefreshServerlist() {
  if (_pokerthnetSource() !== 'auto') return;
  if (_serverlistCache.fetching) return;
  if (_serverlistCache.server && (Date.now() - _serverlistCache.fetchedAt) < SERVERLIST_TTL_MS) return;
  fetchServerlist(function () {});
}
setTimeout(maybeRefreshServerlist, 2000);
setInterval(maybeRefreshServerlist, 5 * 60 * 1000);

function _activePokerthnetServer() {
  if (_pokerthnetSource() === 'auto') {
    maybeRefreshServerlist();
    return _serverlistCache.server || null;
  }
  return _activeManualServer();
}
// ── PokerTH protocol (lobby status probes) — ESM bundle loaded async ──
let PROTO = null;
(function () {
  try {
    var _u = require('url').pathToFileURL(path.join(__dirname, 'public', 'proto', 'index.mjs')).href;
    import(_u).then(function (m) { PROTO = m; }).catch(function (e) { console.warn('[servers] proto bundle load failed:', e && e.message); });
  } catch (e) { console.warn('[servers] proto setup failed:', e && e.message); }
})();
// Headless guest lobby probe: connect, read AnnounceMessage (player count + protocol
// version, no login), then guest-login and count GameListNewMessage frames. Mirrors the
// web client's wire framing (4-byte big-endian length prefix + protobuf). Read-only;
// disconnects after a short quiet window or an overall timeout. cb(result).
function lobbyProbe(host, port, useTls, cb) {
  if (!PROTO) return cb({ ok: true, reachable: false, error: 'protocol not ready', ms: 0 });
  var t0 = Date.now(), done = false, sock = null, rx = Buffer.alloc(0), sentInit = false, gotAck = false;
  var players = null, ver = '', games = new Map();
  var overall = setTimeout(function () { finish('timeout'); }, 8000);
  var quiet = null;
  function settle() { if (quiet) clearTimeout(quiet); quiet = setTimeout(function () { finish(''); }, 700); }
  function finish(err) {
    if (done) return; done = true;
    clearTimeout(overall); if (quiet) clearTimeout(quiet);
    try { if (sock) sock.destroy(); } catch (e) {}
    var total = 0, running = 0;
    games.forEach(function (m) { if (m === 3) return; total++; if (m === 2) running++; });
    cb({ ok: true, reachable: (players != null || gotAck), players: players, games: gotAck ? total : null, running: gotAck ? running : null, ver: ver, ms: Date.now() - t0, error: err || '' });
  }
  function send(payload) { try { var hdr = Buffer.alloc(4); hdr.writeUInt32BE(payload.length, 0); sock.write(Buffer.concat([hdr, Buffer.from(payload)])); } catch (e) {} }
  function onMsg(m) {
    try {
      if (m.announceMessage) {
        var a = m.announceMessage; players = a.numPlayersOnServer;
        var v = a.protocolVersion || { majorVersion: 0, minorVersion: 0 }; ver = v.majorVersion + '.' + v.minorVersion;
        if (!sentInit) { sentInit = true; var nick = 'Guest' + Math.floor(Math.random() * 900000 + 100000); send(PROTO.buildInit({ nick: nick, major: v.majorVersion, minor: v.minorVersion, login: PROTO.LoginType.guestLogin })); }
      } else if (m.initAckMessage) { gotAck = true; settle(); }
      else if (m.gameListNewMessage) { var g = m.gameListNewMessage; games.set(g.gameId, g.gameMode); settle(); }
      else if (m.errorMessage) { finish('login refused' + (m.errorMessage.errorReason != null ? ' (' + m.errorMessage.errorReason + ')' : '')); }
    } catch (e) {}
  }
  function feed(chunk) {
    rx = Buffer.concat([rx, chunk]);
    while (rx.length >= 4) {
      var len = rx.readUInt32BE(0);
      if (len > 2000000) { finish('frame too big'); return; }
      if (rx.length < 4 + len) break;
      var body = rx.subarray(4, 4 + len); rx = rx.subarray(4 + len);
      var msg = null; try { msg = PROTO.decode(body); } catch (e) { continue; }
      onMsg(msg);
    }
  }
  try {
    var opts = { host: host, port: port };
    sock = useTls
      ? tls.connect(Object.assign({ rejectUnauthorized: false, servername: /^[0-9.]+$/.test(host) ? undefined : host }, opts), function () {})
      : net.connect(opts, function () {});
    sock.setTimeout(8000);
    sock.on('data', feed);
    sock.on('timeout', function () { finish(players != null ? '' : 'timeout'); });
    sock.on('error', function (e) { if (!done) finish((e && e.code) || 'error'); });
    sock.on('close', function () { if (!done) finish(''); });
  } catch (e) { finish((e && e.code) || 'error'); }
}

// Scheduled information broadcasts, persisted to broadcasts.json so recurring
// messages (daily/weekly/monthly) survive a proxy restart.
const BROADCASTS_FILE = process.env.BROADCASTS_FILE || path.join(__dirname, 'broadcasts.json');
let _broadcasts = [];
try { _broadcasts = JSON.parse(fs.readFileSync(BROADCASTS_FILE, 'utf8')); if (!Array.isArray(_broadcasts)) _broadcasts = []; } catch (e) { _broadcasts = []; }
const _bcTimers = {}; // job id -> setTimeout handle
function saveBroadcasts() { try { fs.writeFileSync(BROADCASTS_FILE, JSON.stringify(_broadcasts)); } catch (e) { console.error('[broadcast] write failed:', e.message); } dbFlushBroadcasts(); }
let STATS_RESET_PERIOD = ((_adminConfig.resetPeriod || process.env.STATS_RESET_PERIOD || 'monthly') + '').toLowerCase();
function appModes() { var m = (_adminConfig && _adminConfig.modes) || {}; return { offline: m.offline !== false, lan: m.lan !== false, pokerthnet: m.pokerthnet !== false }; }
// First-visit welcome / rules message (operator-authored, per language).
function _welcomeAdmin() { var w = _adminConfig.welcome || {}; return { enabled: !!w.enabled, updatedAt: w.updatedAt || 0, 'default': w['default'] || 'fr', langs: w.langs || {} }; }
function _welcomePublic() { var w = _adminConfig.welcome; if (!w || !w.enabled) return null; return { enabled: true, updatedAt: w.updatedAt || 0, 'default': w['default'] || 'fr', langs: w.langs || {} }; }
const STATS_META_FILE = process.env.STATS_META_FILE || path.join(__dirname, 'stats.meta.json');
const STATS_ADMIN_TOKEN = process.env.STATS_ADMIN_TOKEN || '';
// Master visibility switch for the admin panel, toggled via `pokerth-web admin on|off`.
// When disabled, /admin and every /admin/* route answer a plain 404 — the panel is not
// merely inert (the "no token set" state) but fully hidden, indistinguishable from a
// missing path. Unset defaults to enabled, preserving behaviour on existing installs.
const ADMIN_ENABLED = (function () {
  var v = String(process.env.ADMIN_ENABLED == null ? '' : process.env.ADMIN_ENABLED).trim().toLowerCase();
  return !(v === '0' || v === 'false' || v === 'off' || v === 'no');
})();
let statsMeta = {};
try { statsMeta = JSON.parse(fs.readFileSync(STATS_META_FILE, 'utf8')) || {}; } catch (e) { statsMeta = {}; }
function saveStatsMeta() {
  try { fs.writeFileSync(STATS_META_FILE, JSON.stringify(statsMeta)); }
  catch (e) { console.error('[stats] meta write failed:', e.message); }
}
function statsPeriodKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (STATS_RESET_PERIOD === 'daily')   return y + '-' + m + '-' + day;
  if (STATS_RESET_PERIOD === 'monthly') return y + '-' + m;
  if (STATS_RESET_PERIOD === 'yearly')  return String(y);
  return null; // 'off' or unknown → no scheduled reset
}
function wipeLeaderboard(reason) {
  statsStore = {};
  try { fs.writeFileSync(STATS_FILE, '{}'); }
  catch (e) { console.error('[stats] reset write failed:', e.message); }
  console.log('[stats] leaderboard reset (' + reason + ')');
  dbClearLeaderboard();
}
function maybeRotateStats() {
  const key = statsPeriodKey();
  if (!key) return;                 // disabled (off / unknown)
  if (!statsMeta.period) {          // first run: record the marker, do NOT wipe
    statsMeta.period = key; saveStatsMeta(); return;
  }
  if (statsMeta.period !== key) {   // period rolled over → reset
    wipeLeaderboard('scheduled ' + STATS_RESET_PERIOD);
    statsMeta.period = key; saveStatsMeta();
  }
}
maybeRotateStats();
setInterval(maybeRotateStats, 60 * 60 * 1000); // hourly boundary check

// ── Visit / traffic counter ──
// Anonymous footfall metrics persisted to visits.json next to this file. Each
// browser posts ONE ping per session to POST /__visit with a random, client-
// minted id (never the IP — no PII). Per day we keep { v:sessions, ids:{hash:1} }
// so "unique visitors" is exact within a rolling window; an all-time session
// counter plus an all-time id set keep the "All time" figures exact too.
const VISITS_FILE = process.env.VISITS_FILE || path.join(__dirname, 'visits.json');
const VISIT_RETENTION_DAYS = 400; // keep per-day id sets this long (covers up to 1-year windows)
let visitsStore = { days: {}, totalV: 0, totalRet: 0, allU: {}, allM: { pokerthnet: 0, lan: 0, offline: 0 } };
try {
  const _vs = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
  if (_vs && typeof _vs === 'object') {
    visitsStore.days   = (_vs.days && typeof _vs.days === 'object') ? _vs.days : {};
    visitsStore.totalV = (typeof _vs.totalV === 'number') ? _vs.totalV : 0;
    visitsStore.allU   = (_vs.allU && typeof _vs.allU === 'object') ? _vs.allU : {};
    visitsStore.totalRet = (typeof _vs.totalRet === 'number') ? _vs.totalRet : 0;
    const _am = (_vs.allM && typeof _vs.allM === 'object') ? _vs.allM : {};
    visitsStore.allM   = { pokerthnet: _am.pokerthnet || 0, lan: _am.lan || 0, offline: _am.offline || 0 };
  }
} catch (e) { /* first run — start empty */ }
let _visitsSaveTimer = null;
function saveVisitsSoon() {
  if (_visitsSaveTimer) return;
  _visitsSaveTimer = setTimeout(function () {
    _visitsSaveTimer = null;
    fs.writeFile(VISITS_FILE, JSON.stringify(visitsStore), function (err) {
      if (err) console.error('[visits] write failed:', err.message);
    });
    dbFlushTrafficToday();
  }, 1500);
}
function visitDayKey(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function pruneVisitDays() {
  const keys = Object.keys(visitsStore.days);
  if (keys.length <= VISIT_RETENTION_DAYS) return;
  keys.sort();
  keys.slice(0, keys.length - VISIT_RETENTION_DAYS).forEach(function (k) { delete visitsStore.days[k]; });
}
const VISIT_MODES = ['pokerthnet', 'lan', 'offline'];
function recordModeConnect(mode) {
  if (VISIT_MODES.indexOf(mode) < 0) return;
  const day = visitDayKey();
  let bucket = visitsStore.days[day];
  if (!bucket) { bucket = visitsStore.days[day] = { v: 0, ids: {} }; pruneVisitDays(); }
  if (!bucket.m) bucket.m = {};
  bucket.m[mode] = (bucket.m[mode] || 0) + 1;
  if (!visitsStore.allM) visitsStore.allM = {};
  visitsStore.allM[mode] = (visitsStore.allM[mode] || 0) + 1;
  saveVisitsSoon();
}
function recordVisit(rawId) {
  const day = visitDayKey();
  let bucket = visitsStore.days[day];
  if (!bucket) { bucket = visitsStore.days[day] = { v: 0, ids: {} }; pruneVisitDays(); }
  bucket.v++;
  visitsStore.totalV = (visitsStore.totalV || 0) + 1;
  if (rawId) {
    const h = crypto.createHash('sha256').update(String(rawId)).digest('hex').slice(0, 16);
    const seenBefore = !!visitsStore.allU[h]; // returning device, or brand new?
    if (!bucket.ids) bucket.ids = {};
    bucket.ids[h] = 1;
    visitsStore.allU[h] = 1;
    if (seenBefore) { bucket.rt = (bucket.rt || 0) + 1; visitsStore.totalRet = (visitsStore.totalRet || 0) + 1; }
    else            { bucket.nw = (bucket.nw || 0) + 1; }
  }
  saveVisitsSoon();
}
function visitWindow(daysBack) {
  const now = new Date();
  let v = 0, nw = 0, rt = 0;
  const u = {};
  const m = { pokerthnet: 0, lan: 0, offline: 0 };
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const b = visitsStore.days[visitDayKey(d)];
    if (!b) continue;
    v += b.v || 0;
    nw += b.nw || 0;
    rt += b.rt || 0;
    if (b.ids) for (const k in b.ids) u[k] = 1;
    if (b.m) for (const mk in m) if (b.m[mk]) m[mk] += b.m[mk];
  }
  return { v: v, u: Object.keys(u).length, m: m, nw: nw, rt: rt };
}
function visitsSummary() {
  const now = new Date();
  const series = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const k = visitDayKey(d);
    const b = visitsStore.days[k];
    series.push({ date: k, v: b ? (b.v || 0) : 0, u: (b && b.ids) ? Object.keys(b.ids).length : 0 });
  }
  return {
    ok: true,
    today: visitWindow(1),
    week: visitWindow(7),
    month: visitWindow(30),
    quarter: visitWindow(90),
    semester: visitWindow(180),
    year: visitWindow(365),
    allTime: { v: visitsStore.totalV || 0, u: Object.keys(visitsStore.allU).length, nw: Object.keys(visitsStore.allU).length, rt: visitsStore.totalRet || 0, m: (function () { const am = visitsStore.allM || {}; return { pokerthnet: am.pokerthnet || 0, lan: am.lan || 0, offline: am.offline || 0 }; })() },
    series: series,
    db: { enabled: _dbStatus.enabled, connected: _dbStatus.connected, error: _dbStatus.error, lastWrite: _dbStatus.lastWrite, source: _dbStatus.source }
  };
}

// ── Optional MySQL mirror ──
// Enabled only when MYSQL_HOST and MYSQL_DATABASE are set. The JSON files stay
// the live source of truth (live unique / new-returning counting); we mirror the
// daily traffic aggregates and the leaderboard into MySQL so the data is
// queryable and joinable. If the mysql2 driver is missing or the database is
// unreachable, we log a warning and keep running on JSON — the app never crashes.
// Config can come from db-config.json (managed by the admin panel and the
// `pokerth-web db-config` CLI) or from MYSQL_* env vars, which take precedence.
const DB_CONFIG_FILE = process.env.DB_CONFIG_FILE || path.join(__dirname, 'db-config.json');
let _dbFileCfg = {};
try { _dbFileCfg = JSON.parse(fs.readFileSync(DB_CONFIG_FILE, 'utf8')) || {}; } catch (e) { _dbFileCfg = {}; }
function saveDbConfig() {
  try { fs.writeFileSync(DB_CONFIG_FILE, JSON.stringify(_dbFileCfg, null, 2)); try { fs.chmodSync(DB_CONFIG_FILE, 0o600); } catch (e2) {} }
  catch (e) { console.error('[db] config write failed:', e.message); }
}
function resolveDbCfg() {
  const eH = process.env.MYSQL_HOST, eD = process.env.MYSQL_DATABASE;
  if (eH && eD) return { host: eH, port: Number(process.env.MYSQL_PORT) || 3306, user: process.env.MYSQL_USER || 'root', password: process.env.MYSQL_PASSWORD || '', database: eD, enabled: true, source: 'env' };
  const f = _dbFileCfg || {};
  if (f.host && f.database && f.enabled !== false) return { host: f.host, port: Number(f.port) || 3306, user: f.user || 'root', password: f.password || '', database: f.database, enabled: true, source: 'file' };
  return { host: f.host || '', port: Number(f.port) || 3306, user: f.user || 'root', password: '', database: f.database || '', enabled: false, source: (f.host && f.database) ? 'file-disabled' : 'off' };
}
let _dbPool = null;
let _dbLbBusy = false;
let _dbBcBusy = false;
const _dbStatus = { enabled: false, connected: false, error: '', lastWrite: null, source: 'off' };
async function initDb() {
  const cfg = resolveDbCfg();
  _dbStatus.enabled = cfg.enabled; _dbStatus.source = cfg.source;
  if (!cfg.enabled) { console.log('[db] MySQL mirror disabled (configure via admin panel or: pokerth-web db-config)'); _dbPool = null; return; }
  let mysql;
  try { mysql = require('mysql2/promise'); }
  catch (e) { _dbStatus.error = 'mysql2 not installed — run npm install'; console.error('[db]', _dbStatus.error); return; }
  try {
    _dbPool = mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user || 'root',
      password: cfg.password || '',
      database: cfg.database,
      waitForConnections: true, connectionLimit: 4, connectTimeout: 8000, charset: 'utf8mb4'
    });
    await _dbPool.query('CREATE TABLE IF NOT EXISTS traffic_daily (' +
      'day DATE PRIMARY KEY, visits INT NOT NULL DEFAULT 0, unique_visitors INT NOT NULL DEFAULT 0, ' +
      'new_visitors INT NOT NULL DEFAULT 0, returning_visitors INT NOT NULL DEFAULT 0, ' +
      'conn_pokerthnet INT NOT NULL DEFAULT 0, conn_lan INT NOT NULL DEFAULT 0, conn_offline INT NOT NULL DEFAULT 0, ' +
      'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    await _dbPool.query('CREATE TABLE IF NOT EXISTS leaderboard (' +
      'player VARCHAR(190) PRIMARY KEY, hands_played INT NOT NULL DEFAULT 0, hands_won INT NOT NULL DEFAULT 0, ' +
      'games_played INT NOT NULL DEFAULT 0, games_won INT NOT NULL DEFAULT 0, best_streak INT NOT NULL DEFAULT 0, ' +
      'net BIGINT NOT NULL DEFAULT 0, big_win BIGINT NOT NULL DEFAULT 0, big_loss BIGINT NOT NULL DEFAULT 0, ' +
      'avatar VARCHAR(16) DEFAULT NULL, ts BIGINT NOT NULL DEFAULT 0, ' +
      'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    await _dbPool.query('CREATE TABLE IF NOT EXISTS broadcasts (' +
      'id VARCHAR(64) PRIMARY KEY, message TEXT, icon VARCHAR(32) DEFAULT NULL, schedule_json TEXT, ' +
      'enabled TINYINT(1) NOT NULL DEFAULT 0, end_at BIGINT DEFAULT NULL, max_runs INT DEFAULT NULL, ' +
      'created_at BIGINT DEFAULT NULL, last_run BIGINT DEFAULT NULL, run_count INT NOT NULL DEFAULT 0, ' +
      'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    _dbStatus.connected = true; _dbStatus.error = '';
    console.log('[db] MySQL mirror connected (' + cfg.database + ', source: ' + cfg.source + ')');
    dbFlushTrafficToday();
    dbFlushLeaderboard();
    dbFlushBroadcasts();
  } catch (e) {
    _dbPool = null; _dbStatus.connected = false; _dbStatus.error = e.message;
    console.error('[db] connect/init failed:', e.message);
  }
}
async function reconfigureDb() {
  if (_dbPool) { try { await _dbPool.end(); } catch (e) {} _dbPool = null; }
  _dbStatus.connected = false; _dbStatus.error = '';
  await initDb();
}
async function dbFlushTrafficToday() {
  if (!_dbPool) return;
  try {
    const day = visitDayKey();
    const b = visitsStore.days[day] || {};
    const u = b.ids ? Object.keys(b.ids).length : 0;
    const m = b.m || {};
    await _dbPool.query(
      'INSERT INTO traffic_daily (day, visits, unique_visitors, new_visitors, returning_visitors, conn_pokerthnet, conn_lan, conn_offline) VALUES (?,?,?,?,?,?,?,?) ' +
      'ON DUPLICATE KEY UPDATE visits=VALUES(visits), unique_visitors=VALUES(unique_visitors), new_visitors=VALUES(new_visitors), returning_visitors=VALUES(returning_visitors), conn_pokerthnet=VALUES(conn_pokerthnet), conn_lan=VALUES(conn_lan), conn_offline=VALUES(conn_offline)',
      [day, b.v || 0, u, b.nw || 0, b.rt || 0, m.pokerthnet || 0, m.lan || 0, m.offline || 0]
    );
    _dbStatus.lastWrite = new Date().toISOString(); _dbStatus.connected = true; _dbStatus.error = '';
  } catch (e) { _dbStatus.error = e.message; }
}
async function dbFlushLeaderboard() {
  if (!_dbPool || _dbLbBusy) return;
  _dbLbBusy = true;
  try {
    const names = Object.keys(statsStore);
    for (const name of names) {
      const s = statsStore[name] || {};
      await _dbPool.query(
        'INSERT INTO leaderboard (player, hands_played, hands_won, games_played, games_won, best_streak, net, big_win, big_loss, avatar, ts) VALUES (?,?,?,?,?,?,?,?,?,?,?) ' +
        'ON DUPLICATE KEY UPDATE hands_played=VALUES(hands_played), hands_won=VALUES(hands_won), games_played=VALUES(games_played), games_won=VALUES(games_won), best_streak=VALUES(best_streak), net=VALUES(net), big_win=VALUES(big_win), big_loss=VALUES(big_loss), avatar=VALUES(avatar), ts=VALUES(ts)',
        [String(name).slice(0, 190), s.handsPlayed || 0, s.handsWon || 0, s.gamesPlayed || 0, s.gamesWon || 0, s.bestStreak || 0, s.net || 0, s.bigWin || 0, s.bigLoss || 0, (String(s.avatar || '').slice(0, 16) || null), s.ts || 0]
      );
    }
    _dbStatus.lastWrite = new Date().toISOString(); _dbStatus.connected = true; _dbStatus.error = '';
  } catch (e) { _dbStatus.error = e.message; }
  finally { _dbLbBusy = false; }
}
async function dbFlushBroadcasts() {
  if (!_dbPool || _dbBcBusy) return;
  _dbBcBusy = true;
  try {
    const ids = [];
    for (const j of _broadcasts) {
      ids.push(String(j.id).slice(0, 64));
      await _dbPool.query(
        'INSERT INTO broadcasts (id, message, icon, schedule_json, enabled, end_at, max_runs, created_at, last_run, run_count) VALUES (?,?,?,?,?,?,?,?,?,?) ' +
        'ON DUPLICATE KEY UPDATE message=VALUES(message), icon=VALUES(icon), schedule_json=VALUES(schedule_json), enabled=VALUES(enabled), end_at=VALUES(end_at), max_runs=VALUES(max_runs), created_at=VALUES(created_at), last_run=VALUES(last_run), run_count=VALUES(run_count)',
        [String(j.id).slice(0, 64), (j.message != null ? String(j.message).slice(0, 2000) : null), (j.icon ? String(j.icon).slice(0, 32) : null), JSON.stringify(j.schedule || null), j.enabled ? 1 : 0, (j.endAt != null ? Number(j.endAt) : null), (j.maxRuns != null ? Number(j.maxRuns) : null), (j.createdAt != null ? Number(j.createdAt) : null), (j.lastRun != null ? Number(j.lastRun) : null), Number(j.runCount) || 0]
      );
    }
    if (ids.length) {
      await _dbPool.query('DELETE FROM broadcasts WHERE id NOT IN (' + ids.map(function () { return '?'; }).join(',') + ')', ids);
    } else {
      await _dbPool.query('DELETE FROM broadcasts');
    }
    _dbStatus.lastWrite = new Date().toISOString(); _dbStatus.connected = true; _dbStatus.error = '';
  } catch (e) { _dbStatus.error = e.message; }
  finally { _dbBcBusy = false; }
}
async function dbDeletePlayer(name) {
  if (!_dbPool) return;
  try { await _dbPool.query('DELETE FROM leaderboard WHERE player=?', [String(name).slice(0, 190)]); }
  catch (e) { _dbStatus.error = e.message; }
}
async function dbClearLeaderboard() {
  if (!_dbPool) return;
  try { await _dbPool.query('DELETE FROM leaderboard'); } catch (e) { _dbStatus.error = e.message; }
}
async function dbClearTraffic() {
  if (!_dbPool) return;
  try { await _dbPool.query('DELETE FROM traffic_daily'); } catch (e) { _dbStatus.error = e.message; }
}
initDb();

function readJsonBody(req, cb) {
  let body = '';
  req.on('data', function (c) { body += c; if (body.length > 16384) req.destroy(); });
  req.on('end', function () { let p; try { p = JSON.parse(body || '{}'); } catch (e) { return cb(null); } cb(p); });
  req.on('error', function () { cb(null); });
}
// Absolute sanity ceiling for chip totals. This is NOT anti-cheat: the model
// is client-authoritative and custom stacks can be arbitrarily large, so a
// tight per-hand cap would clip legitimate high-stakes play. It only rejects
// overflow/garbage (net:1e15, NaN…) that would otherwise break the board.
const STATS_MAX_CHIPS = 1e12;
function clampChips(v) { return Math.max(-STATS_MAX_CHIPS, Math.min(STATS_MAX_CHIPS, v)); }
function sanitizeSnapshot(d) {
  const num = function (v) { v = Number(v); return isFinite(v) ? Math.round(v) : 0; };
  const handsPlayed = Math.max(0, num(d.handsPlayed));
  const gamesPlayed = Math.max(0, num(d.gamesPlayed));
  return {
    handsPlayed: handsPlayed,
    // Wins can never exceed what was actually played; streak ≤ hands played.
    handsWon:    Math.min(Math.max(0, num(d.handsWon)), handsPlayed),
    net:         clampChips(num(d.net)),
    bigWin:      Math.max(0, clampChips(num(d.bigWin))),
    bigLoss:     Math.min(0, clampChips(num(d.bigLoss))),
    gamesPlayed: gamesPlayed,
    gamesWon:    Math.min(Math.max(0, num(d.gamesWon)), gamesPlayed),
    bestStreak:  Math.min(Math.max(0, num(d.bestStreak)), handsPlayed),
    avatar:      (typeof d.avatar === 'string') ? d.avatar.slice(0, 8) : '',
    ts:          Date.now()
  };
}

// Monotonic merge: cumulative counters never regress, so a client pushing
// from a fresh device (blank localStorage) can no longer wipe a player's
// accumulated totals (bug: device-switch data loss). `net` follows the more
// complete record (more hands played); bigWin keeps the max, bigLoss the min.
function mergeSnapshot(prev, inc) {
  if (!prev) return inc;
  const hp = Math.max(prev.handsPlayed || 0, inc.handsPlayed || 0);
  const gp = Math.max(prev.gamesPlayed || 0, inc.gamesPlayed || 0);
  const incFresher = (inc.handsPlayed || 0) >= (prev.handsPlayed || 0);
  return {
    handsPlayed: hp,
    gamesPlayed: gp,
    handsWon:    Math.min(Math.max(prev.handsWon || 0, inc.handsWon || 0), hp),
    gamesWon:    Math.min(Math.max(prev.gamesWon || 0, inc.gamesWon || 0), gp),
    bestStreak:  Math.max(prev.bestStreak || 0, inc.bestStreak || 0),
    bigWin:      Math.max(prev.bigWin || 0, inc.bigWin || 0),
    bigLoss:     Math.min(prev.bigLoss || 0, inc.bigLoss || 0),
    net:         incFresher ? (inc.net || 0) : (prev.net || 0),
    avatar:      inc.avatar || prev.avatar || '',
    ts:          Date.now()
  };
}

// ── Static file delivery: gzip/brotli compression + safety headers ──
// Text assets (JS/CSS/MJS/HTML/JSON/SVG) are compressed the first time they're
// requested at a given mtime, then cached in memory so the big files
// (pokerth.js, the protobuf bundle) are only compressed once. Keying on mtime
// means a static deploy (git pull, no pm2 restart) is picked up automatically.
// Binary media (png/woff2/ico) is already compressed → streamed as-is.
// Compression runs async (libuv threadpool) so it never blocks the event loop
// that also serves the WebSocket proxy.
const COMPRESSIBLE = /^(?:text\/|application\/(?:javascript|json)|image\/svg\+xml)/;
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer-when-downgrade'
};
const _compCache = new Map(); // 'enc:path:mtime' -> Buffer

function sendFile(req, res, filePath, type, cacheCtl) {
  const headers = Object.assign({ 'Content-Type': type, 'Cache-Control': cacheCtl }, SECURITY_HEADERS);
  let enc = null;
  if (COMPRESSIBLE.test(type)) {
    const ae = String(req.headers['accept-encoding'] || '');
    if (/\bbr\b/.test(ae)) enc = 'br';
    else if (/\bgzip\b/.test(ae)) enc = 'gzip';
  }
  if (!enc) {
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
    return;
  }
  let st;
  try { st = fs.statSync(filePath); } catch (e) { res.writeHead(404); res.end('Not found'); return; }
  const key = enc + ':' + filePath + ':' + st.mtimeMs;
  const send = function (buf) {
    headers['Content-Encoding'] = enc;
    headers['Vary'] = 'Accept-Encoding';
    headers['Content-Length'] = buf.length;
    res.writeHead(200, headers);
    res.end(buf);
  };
  const cached = _compCache.get(key);
  if (cached) { send(cached); return; }
  fs.readFile(filePath, function (err, raw) {
    if (err) { res.writeHead(500); res.end('Read error'); return; }
    const done = function (e, out) {
      if (e || !out) { // compression failed — fall back to uncompressed
        const h = Object.assign({ 'Content-Type': type, 'Cache-Control': cacheCtl, 'Vary': 'Accept-Encoding' }, SECURITY_HEADERS);
        res.writeHead(200, h);
        res.end(raw);
        return;
      }
      if (_compCache.size > 256) _compCache.clear(); // bound memory across deploys
      _compCache.set(key, out);
      send(out);
    };
    if (enc === 'br') {
      zlib.brotliCompress(raw, { params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: raw.length
      } }, done);
    } else {
      zlib.gzip(raw, { level: 9 }, done);
    }
  });
}

// ── Admin tool: import / remove gallery packages (table styles & card decks) ──
// A small token-gated page served at /admin lets the maintainer add or remove
// gallery packages from the browser — no SSH, no sudo. proxy.js runs as the
// install-dir owner, so it writes straight into public/{table,cards}/ and then
// regenerates the manifests. Auth reuses STATS_ADMIN_TOKEN (set via set-token);
// if no token is configured, every admin action is refused.
const { spawnSync, spawn } = require('child_process');
const os = require('os');
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_UPLOAD = 25 * 1024 * 1024; // 25 MB
const SAFE_PATH = '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin';
const PM2_NAME = process.env.PM2_NAME || 'pokerth-web';
const UPDATE_LOG = path.join(os.tmpdir(), 'pokerth-web-update.log');
// Run a fixed shell command detached from this process, logging to `logPath`.
// Used for self-update / restart: the spawned shell outlives the proxy when PM2
// cycles it, so it can issue `pm2 restart` against ourselves. PATH is forced so
// git/npm/node/pm2 resolve regardless of PM2's stripped environment.
function runDetached(cmd, logPath) {
  try {
    let out = 'ignore';
    if (logPath) {
      try { fs.writeFileSync(logPath, '[' + new Date().toISOString() + '] $ ' + cmd + '\n'); out = fs.openSync(logPath, 'a'); }
      catch (e) { out = 'ignore'; }
    }
    const child = spawn('sh', ['-c', cmd], { detached: true, stdio: (out === 'ignore' ? 'ignore' : ['ignore', out, out]), env: Object.assign({}, process.env, { PATH: SAFE_PATH }) });
    child.unref();
    return true;
  } catch (e) { console.error('[admin] runDetached failed:', e.message); return false; }
}
// "Lite" self-update (runs as the service user, no sudo): pull + runtime deps +
// restart. Built-in/gallery manifests are NOT regenerated here (git never adds
// gallery items, built-ins live in code); the full `sudo pokerth-web update`
// covers Node/wrapper refreshes.
function updateCmd() {
  const dir = __dirname.replace(/'/g, "'\\''");
  return "sleep 1; cd '" + dir + "' && git pull --ff-only && npm install --omit=dev --no-audit --no-fund && pm2 restart " + PM2_NAME + " --update-env";
}
// Static-only self-update: just `git pull` so the served public/ files (client
// build) go live immediately. No npm, no pm2 restart, so open connections are
// never dropped. proxy.js / dependency changes will NOT take effect until a real
// restart — this is meant for static (public/) deploys.
function updateCmdStatic() {
  const dir = __dirname.replace(/'/g, "'\\''");
  return "cd '" + dir + "' && git pull --ff-only";
}

// ── Scheduled restart/update with advance notice to connected clients ──
let _restartTimer = null;   // pending setTimeout handle (null = nothing scheduled)
let _restartAt = 0;         // epoch ms when the action fires (0 = none)
let _restartKind = '';      // 'update' | 'restart'
let _restartNotice = '';    // the NOTICE:… frame, replayed to clients that join the window
function restartOnlyCmd() {
  return "sleep 1; pm2 restart " + PM2_NAME + " --update-env";
}
// Broadcast a text control frame to every connected client — out-of-band, on the
// same channel the reaction/avatar relay already uses. Returns how many got it.
function broadcastNotice(text) {
  let n = 0;
  try { wss.clients.forEach(function (c) { if (c.readyState === 1) { try { c.send(text); n++; } catch (e) {} } }); } catch (e) {}
  return n;
}
function clearScheduledRestart() {
  if (_restartTimer) { clearTimeout(_restartTimer); _restartTimer = null; }
  _restartAt = 0; _restartKind = ''; _restartNotice = '';
}

// ── Information broadcast scheduler ─────────────────────────────────────────
const _BC_ICONS = ['', '\u2139\ufe0f', '\ud83d\udce2', '\u26a0\ufe0f', '\ud83c\udf89']; // '' ℹ️ 📢 ⚠️ 🎉
const _BC_MAXT = 2000000000; // ~23 days, under setTimeout's 32-bit ceiling → re-arm beyond
function _bcIcon(x) { return _BC_ICONS.indexOf(x) >= 0 ? x : ''; }
function _parseHM(t) { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); if (!m) return null; const h = +m[1], mi = +m[2]; if (h > 23 || mi > 59) return null; return [h, mi]; }
function _atTime(baseMs, h, mi) { const d = new Date(baseMs); d.setHours(h, mi, 0, 0); return d.getTime(); }
function _bcValidateSchedule(s) {
  if (!s || typeof s !== 'object') return null;
  const t = s.type;
  if (t === 'once')      { const at = Number(s.at); return at > Date.now() ? { type: 'once', at: at } : null; }
  if (t === 'interval')  { const m = Math.floor(Number(s.minutes) || 0); return (m >= 1 && m <= 10080) ? { type: 'interval', minutes: m } : null; }
  if (t === 'daily')     { return _parseHM(s.time) ? { type: 'daily', time: s.time } : null; }
  if (t === 'everyDays') { const dd = Math.floor(Number(s.days) || 0); return (_parseHM(s.time) && dd >= 1 && dd <= 365) ? { type: 'everyDays', time: s.time, days: dd } : null; }
  if (t === 'monthly')   { const dm = Math.floor(Number(s.dom) || 0); return (_parseHM(s.time) && dm >= 1 && dm <= 31) ? { type: 'monthly', time: s.time, dom: dm } : null; }
  if (t === 'weekly')    { const wd = Array.isArray(s.weekdays) ? s.weekdays.map(Number).filter(function (n) { return n >= 0 && n <= 6; }) : []; return (_parseHM(s.time) && wd.length) ? { type: 'weekly', time: s.time, weekdays: wd } : null; }
  return null;
}
// Pure: next fire time (epoch ms) strictly after `from`, or null if none remain.
function computeNextRun(job, from) {
  const s = job.schedule || {};
  let next = null;
  if (s.type === 'once') {
    next = (s.at && s.at > from) ? s.at : null;
  } else if (s.type === 'interval') {
    const ms = (s.minutes || 0) * 60000; if (ms <= 0) return null;
    next = (job.lastRun ? job.lastRun : from) + ms;
    if (next <= from) next = from + ms;
  } else {
    const hm = _parseHM(s.time); if (!hm) return null;
    const h = hm[0], mi = hm[1];
    if (s.type === 'daily') {
      next = _atTime(from, h, mi); if (next <= from) next += 86400000;
    } else if (s.type === 'everyDays') {
      const step = Math.max(1, s.days || 1) * 86400000;
      if (job.lastRun) { next = job.lastRun + step; while (next <= from) next += step; }
      else { next = _atTime(from, h, mi); if (next <= from) next += 86400000; }
    } else if (s.type === 'weekly') {
      const wd = Array.isArray(s.weekdays) ? s.weekdays : []; if (!wd.length) return null;
      for (let i = 0; i < 8; i++) { const cand = _atTime(from + i * 86400000, h, mi); if (cand > from && wd.indexOf(new Date(cand).getDay()) >= 0) { next = cand; break; } }
    } else if (s.type === 'monthly') {
      const dom = Math.min(31, Math.max(1, s.dom || 1)); const base = new Date(from);
      for (let i = 0; i < 13; i++) {
        const y = base.getFullYear(), mo = base.getMonth() + i;
        const dim = new Date(y, mo + 1, 0).getDate();
        const cand = new Date(y, mo, Math.min(dom, dim), h, mi, 0, 0).getTime();
        if (cand > from) { next = cand; break; }
      }
    }
  }
  if (next == null) return null;
  if (job.endAt && next > job.endAt) return null;
  if (job.maxRuns && (job.runCount || 0) >= job.maxRuns) return null;
  return next;
}
function fireBroadcast(job) {
  const n = broadcastNotice('INFO:' + (job.icon || '') + ':' + (job.message || ''));
  job.lastRun = Date.now();
  job.runCount = (job.runCount || 0) + 1;
  console.log('[broadcast] job ' + job.id + ' fired -> ' + n + ' client(s)');
  return n;
}
function clearBroadcastTimer(id) { if (_bcTimers[id]) { clearTimeout(_bcTimers[id]); delete _bcTimers[id]; } }
function armBroadcast(job) {
  clearBroadcastTimer(job.id);
  if (!job.enabled) { job._nextRun = null; return; }
  const next = computeNextRun(job, Date.now());
  job._nextRun = next;
  if (next == null) return;
  const delay = next - Date.now();
  if (delay > _BC_MAXT) { _bcTimers[job.id] = setTimeout(function () { armBroadcast(job); }, _BC_MAXT); return; }
  _bcTimers[job.id] = setTimeout(function () {
    fireBroadcast(job);
    if ((job.schedule || {}).type === 'once') { job.enabled = false; job._nextRun = null; }
    saveBroadcasts();
    armBroadcast(job);
  }, Math.max(0, delay));
}
_broadcasts.forEach(function (j) { armBroadcast(j); });
if (_broadcasts.length) console.log('[broadcast] armed ' + _broadcasts.length + ' scheduled message(s)');

function adminAuthed(query, bodyToken) {
  return !!STATS_ADMIN_TOKEN && (query.token === STATS_ADMIN_TOKEN || bodyToken === STATS_ADMIN_TOKEN);
}
// ── Scoped delegate keys (admin → `pokerth-web token` CLI) ─────────────────
// Beside the master STATS_ADMIN_TOKEN (which grants every scope), named keys may
// grant a SUBSET of admin sections ("scopes"). They live in scoped-tokens.json
// (chmod 600, kept out of git, preserved across updates like admin-config.json):
//   [ { "name": "...", "token": "...", "scopes": ["broadcast"], "created": ... } ]
// The file is hot-reloaded (mtime check), so adding/revoking a key needs no
// restart. To scope another section later (e.g. "music"): add it to ADMIN_SCOPES
// and wrap that section's routes with hasScope('music', …) instead of adminAuthed.
const ADMIN_SCOPES = ['broadcast', 'music', 'packages', 'leaderboard'];
const SCOPED_TOKENS_FILE = process.env.SCOPED_TOKENS_FILE || path.join(__dirname, 'scoped-tokens.json');
let _scopedTokens = [], _scopedMtime = -1;
function _loadScopedTokens() {
  let mt = 0;
  try { mt = fs.statSync(SCOPED_TOKENS_FILE).mtimeMs; }
  catch (e) { _scopedTokens = []; _scopedMtime = 0; return _scopedTokens; }
  if (mt === _scopedMtime) return _scopedTokens;            // unchanged → cached
  try {
    const arr = JSON.parse(fs.readFileSync(SCOPED_TOKENS_FILE, 'utf8'));
    _scopedTokens = Array.isArray(arr) ? arr.filter(function (r) {
      return r && typeof r.token === 'string' && r.token && Array.isArray(r.scopes);
    }) : [];
  } catch (e) { _scopedTokens = []; }
  _scopedMtime = mt;
  return _scopedTokens;
}
// Persist scoped keys (admin UI create/revoke). Mirrors the CLI file format and
// keeps the in-memory cache in sync so the change is effective immediately.
function _saveScopedTokens(list) {
  fs.writeFileSync(SCOPED_TOKENS_FILE, JSON.stringify(list, null, 2));
  try { fs.chmodSync(SCOPED_TOKENS_FILE, 0o600); } catch (e) {}
  _scopedTokens = list;
  try { _scopedMtime = fs.statSync(SCOPED_TOKENS_FILE).mtimeMs; } catch (e) { _scopedMtime = -1; }
}
// True if the caller may act on `scope`: the master token grants every scope;
// otherwise the presented token (Authorization header → query.token, ?token=,
// or JSON body token) must list that scope.
function hasScope(scope, query, bodyToken) {
  if (adminAuthed(query, bodyToken)) return true;
  var tok = (query && query.token) || bodyToken || '';
  if (!tok) return false;
  var list = _loadScopedTokens();
  for (var i = 0; i < list.length; i++) {
    if (list[i].token === tok) {
      var sc = list[i].scopes || [];
      return sc.indexOf('*') >= 0 || sc.indexOf(scope) >= 0;
    }
  }
  return false;
}

function adminJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
function slugId(s) {
  return String(s || '').toLowerCase().replace(/\.zip$/, '')
    .replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
// Built-in (git-tracked) theme packages live in public/themes/ and are scanned
// into themes.json on every full update. They can be hidden (toggle) but never
// removed via admin — git would restore them, and a player could be mid-theme.
const BUILTIN_THEMES = ['bleu-nuit', 'casino-vert', 'graphite', 'pokerth-new', 'vecteur', 'violet'];
function regenManifest(kind) {
  const rel = kind === 'table' ? 'scripts/tables-manifest.mjs'
    : kind === 'theme' ? 'scripts/themes-manifest.mjs'
    : kind === 'seat' ? 'scripts/seats-manifest.mjs'
    : 'scripts/decks-manifest.mjs';
  const dir = path.join(PUBLIC_DIR, kind === 'table' ? 'table' : kind === 'theme' ? 'themes' : kind === 'seat' ? 'seats' : 'cards');
  try { spawnSync(process.execPath, [path.join(__dirname, rel), dir], { stdio: 'ignore' }); }
  catch (e) { console.error('[admin] manifest failed:', e.message); }
}
function pkgList() {
  const read = function (p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')) || []; } catch (e) { return []; } };
  const themes = read(path.join(PUBLIC_DIR, 'themes', 'themes.json')).map(function (t) {
    return { id: t.id, name: t.name || t.id, swatch: t.swatch || '#444', builtin: BUILTIN_THEMES.indexOf(t.id) >= 0 };
  });
  return { tables: read(path.join(PUBLIC_DIR, 'table', 'tables.json')),
           decks:  read(path.join(PUBLIC_DIR, 'cards', 'decks.json')),
           seats:  read(path.join(PUBLIC_DIR, 'seats', 'seats.json')),
           themes: themes };
}
// Admin can hide an installed package from players without deleting it. The
// disabled ids live in _adminConfig.pkgDisabled = { table:[...], deck:[...] };
// they are filtered out of the client-facing manifests but kept in pkg-list.
function pkgDisabledSet(kind) { var d = (_adminConfig && _adminConfig.pkgDisabled) || {}; var a = d[kind]; return Array.isArray(a) ? a : []; }
// Admin can mark a table as a « full image »: its felt image replaces the whole CSS
// table (frame, oval, overlays) instead of just the inner felt. Like pkgDisabled, the
// ids live in _adminConfig.pkgFull = { table:[...] }; injected into the served
// /table/tables.json as full:true so the client (theme.mjs) renders it plein cadre.
function pkgFullSet(kind) { var d = (_adminConfig && _adminConfig.pkgFull) || {}; var a = d[kind]; return Array.isArray(a) ? a : []; }
// Like pkgFull, but the felt image becomes a FULL-SCREEN background (no table at
// all). Ids live in _adminConfig.pkgFullscreen = { table:[...] }; injected into the
// served /table/tables.json as fullscreen:true. Mutually exclusive with full.
function pkgFullscreenSet(kind) { var d = (_adminConfig && _adminConfig.pkgFullscreen) || {}; var a = d[kind]; return Array.isArray(a) ? a : []; }
// Per-table anchor of the fullscreen felt: which part of the image stays visible
// when the cover crop cuts it (CSS background-position). Stored as
// _adminConfig.pkgAlign = { table: { id: 'center top' } }; injected into the served
// /table/tables.json as align:'…'. Whitelisted 3x3 anchors only.
var PKG_ALIGN_VALUES = ['left top', 'center top', 'right top', 'left center', 'center center', 'right center', 'left bottom', 'center bottom', 'right bottom'];
function pkgAlignMap(kind) { var d = (_adminConfig && _adminConfig.pkgAlign) || {}; var m = d[kind]; return (m && typeof m === 'object' && !Array.isArray(m)) ? m : {}; }
function readRawBody(req, max, cb) {
  let chunks = [], len = 0, tooBig = false;
  req.on('data', function (c) { len += c.length; if (len > max) { tooBig = true; req.destroy(); return; } chunks.push(c); });
  req.on('end', function () { cb(tooBig ? null : Buffer.concat(chunks)); });
  req.on('error', function () { cb(null); });
}
function importPackage(kind, idHint, zipBuf, cb) {
  let tmp;
  try { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-')); } catch (e) { return cb('temp dir failed'); }
  const done = function (err, info) { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} cb(err, info); };
  const exDir = path.join(tmp, 'x'); const zipPath = path.join(tmp, 'in.zip');
  try { fs.writeFileSync(zipPath, zipBuf); fs.mkdirSync(exDir); } catch (e) { return done('write failed'); }
  // -j flattens (junks paths) → neutralises zip-slip; we then pick files by basename
  const un = spawnSync('unzip', ['-j', '-o', '-qq', zipPath, '-d', exDir], { stdio: 'ignore' });
  if (un.status !== 0) return done('not a valid .zip archive');
  const has = function (n) { return fs.existsSync(path.join(exDir, n)); };
  const cp = function (src, dst) { try { fs.copyFileSync(path.join(exDir, src), dst); return true; } catch (e) { return false; } };
  let id = slugId(idHint);

  if (kind === 'table') {
    // New gallery format: felt.png|jpg|jpeg|webp (Studio export) — copied as-is so a
    // PNG-32 « full » table keeps its transparent corners. Legacy PokerTH desktop
    // packs (table.png) keep the old convert→felt.jpg pipeline.
    const feltSrc = ['felt.png', 'felt.jpg', 'felt.jpeg', 'felt.webp', 'table.png'].find(has);
    if (!feltSrc) return done('not a PokerTH table pack (felt.png / felt.jpg — or legacy table.png — missing)');
    if (!id) id = 'table-' + Date.now();
    if (['green', 'blue', 'bordeaux', 'slate', 'photo', 'table'].indexOf(id) >= 0) id = 'table-' + id;
    const dest = path.join(PUBLIC_DIR, 'table', id);
    try { fs.rmSync(dest, { recursive: true, force: true }); fs.mkdirSync(dest, { recursive: true }); } catch (e) { return done('dest failed'); }
    if (feltSrc === 'table.png') {
      let okFelt = false;
      if (spawnSync('convert', ['-version'], { stdio: 'ignore' }).status === 0) {
        okFelt = spawnSync('convert', [path.join(exDir, 'table.png'), '-resize', '1280x720>', '-strip', '-quality', '82', path.join(dest, 'felt.jpg')], { stdio: 'ignore' }).status === 0;
      }
      if (!okFelt) cp('table.png', path.join(dest, 'felt.png'));
    } else {
      cp(feltSrc, path.join(dest, feltSrc === 'felt.jpeg' ? 'felt.jpg' : feltSrc));
    }
    // Render-mode markers from the pack (fullscreen wins; mutually exclusive client-side).
    if (has('fullscreen') || has('.fullscreen')) { try { fs.writeFileSync(path.join(dest, 'fullscreen'), ''); } catch (e) {} }
    else if (has('full') || has('.full')) { try { fs.writeFileSync(path.join(dest, 'full'), ''); } catch (e) {} }
    // Pucks: gallery names first (dealer/sb/bb, svg > png > webp), legacy names as fallback.
    ['dealer', 'sb', 'bb'].forEach(function (pk) {
      const srcp = [pk + '.svg', pk + '.png', pk + '.webp'].find(has);
      if (srcp) cp(srcp, path.join(dest, srcp));
    });
    if (has('dealerPuck.png')     && !['dealer.svg', 'dealer.png', 'dealer.webp'].some(has)) cp('dealerPuck.png',     path.join(dest, 'dealer.png'));
    if (has('smallblindPuck.png') && !['sb.svg', 'sb.png', 'sb.webp'].some(has))             cp('smallblindPuck.png', path.join(dest, 'sb.png'));
    if (has('bigblindPuck.png')   && !['bb.svg', 'bb.png', 'bb.webp'].some(has))             cp('bigblindPuck.png',   path.join(dest, 'bb.png'));
    if (has('preview.png'))        cp('preview.png',        path.join(dest, 'preview.png'));
    try { const xml = fs.readdirSync(exDir).find(function (f) { return /\.xml$/i.test(f); }); if (xml) cp(xml, path.join(dest, 'style.xml')); } catch (e) {}
    regenManifest('table');
  } else if (kind === 'deck') {
    const ext = (has('0.png') && has('flipside.png')) ? 'png' : ((has('0.svg') && has('flipside.svg')) ? 'svg' : null);
    if (!ext) return done('not a PokerTH card deck (need 0..51 + flipside)');
    let missing = 0; for (let i = 0; i < 52; i++) if (!has(i + '.' + ext)) missing++;
    if (missing) return done('incomplete deck (' + missing + ' of 52 images missing)');
    if (!id) id = 'deck-' + Date.now();
    if (id === 'svg') id = 'svg-deck';
    const dest = path.join(PUBLIC_DIR, 'cards', id);
    try { fs.rmSync(dest, { recursive: true, force: true }); fs.mkdirSync(dest, { recursive: true }); } catch (e) { return done('dest failed'); }
    try { fs.readdirSync(exDir).forEach(function (f) { if (/\.(png|svg|xml)$/i.test(f)) cp(f, path.join(dest, f)); }); } catch (e) {}
    regenManifest('deck');
  } else if (kind === 'theme') {
    // Web theme package = theme.json (palette / table / felt / buttons /
    // buttonImages / pucks) + any image files it references, flattened.
    if (!has('theme.json')) return done('not a PokerTH web theme (theme.json missing)');
    let cfg = null;
    try { cfg = JSON.parse(fs.readFileSync(path.join(exDir, 'theme.json'), 'utf8')); } catch (e) { return done('theme.json is not valid JSON'); }
    if (!cfg || typeof cfg !== 'object') return done('theme.json is empty or invalid');
    if (!id) id = (cfg.name ? slugId(cfg.name) : '') || ('theme-' + Date.now());
    if (BUILTIN_THEMES.indexOf(id) >= 0) id = 'theme-' + id;   // never clobber a git-tracked theme
    const dest = path.join(PUBLIC_DIR, 'themes', id);
    try { fs.rmSync(dest, { recursive: true, force: true }); fs.mkdirSync(dest, { recursive: true }); } catch (e) { return done('dest failed'); }
    try { fs.readdirSync(exDir).forEach(function (f) { if (f === 'theme.json' || /\.(png|svg|jpg|jpeg|webp)$/i.test(f)) cp(f, path.join(dest, f)); }); } catch (e) {}
    regenManifest('theme');
    // themes-manifest drops a theme that ends up with no usable styling (no
    // palette/table/felt/buttons/buttonImages/pucks, or referenced images
    // missing). Detect that and fail loudly instead of leaving it invisible.
    let listed = false;
    try { listed = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'themes', 'themes.json'), 'utf8')).some(function (x) { return x && x.id === id; }); } catch (e) {}
    if (!listed) { try { fs.rmSync(dest, { recursive: true, force: true }); } catch (e) {} return done('theme has no usable content (need palette, table, felt, buttons, buttonImages or pucks — and any referenced image file must be in the zip)'); }
  } else if (kind === 'seat') {
    // Seat pack = a 9-slice plate image (border-image `fill` paints the box too),
    // optionally a self.* frame for the hero bar, preview.* and seat.json metadata.
    const plate = ['plate.png', 'plate.svg', 'plate.webp', 'plate.jpg', 'plate.jpeg'].find(has);
    if (!plate) return done('not a seat pack (plate.png / plate.svg missing)');
    if (!id) id = 'seat-' + Date.now();
    if (['', 'pokerth', 'chip', 'plate', 'card', 'compact', 'bar'].indexOf(id) >= 0) id = 'seat-' + id;   // never clobber a built-in seat id
    const dest = path.join(PUBLIC_DIR, 'seats', id);
    try { fs.rmSync(dest, { recursive: true, force: true }); fs.mkdirSync(dest, { recursive: true }); } catch (e) { return done('dest failed'); }
    try { fs.readdirSync(exDir).forEach(function (f) { if (/^(plate|self|preview)\.(png|svg|webp|jpe?g)$/i.test(f) || f === 'seat.json') cp(f, path.join(dest, f)); }); } catch (e) {}
    regenManifest('seat');
    let listed = false;
    try { listed = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'seats', 'seats.json'), 'utf8')).some(function (x) { return x && x.id === id; }); } catch (e) {}
    if (!listed) { try { fs.rmSync(dest, { recursive: true, force: true }); } catch (e) {} return done('seat pack has no usable plate image'); }
  } else return done('unknown kind');

  let nm = id;
  try {
    const sub = kind === 'table' ? 'table' : kind === 'theme' ? 'themes' : kind === 'seat' ? 'seats' : 'cards';
    const mfn = kind === 'table' ? 'tables.json' : kind === 'theme' ? 'themes.json' : kind === 'seat' ? 'seats.json' : 'decks.json';
    const mf = path.join(PUBLIC_DIR, sub, mfn);
    const e = JSON.parse(fs.readFileSync(mf, 'utf8')).find(function (x) { return x.id === id; });
    if (e && e.name) nm = e.name;
  } catch (e) {}
  done(null, { id: id, name: nm });
}

// ── Background music (admin-managed tracks) ──────────────────────────────
// Built-in tracks ship in public/music/tracks.json (read-only seed). Admin-
// added tracks live in admin-config.json (musicTracks[]) so `git pull` never
// touches them, and their MP3s are uploaded to public/music/<id>.mp3 (untracked,
// also preserved by pull). The client-facing /music/tracks.json is composed
// server-side (built-ins minus hidden + active admin tracks), mirroring how the
// deck/theme galleries are filtered. Built-ins can be hidden but not removed.
const MUSIC_DIR = path.join(PUBLIC_DIR, 'music');
const MUSIC_BUILTIN_FILE = path.join(MUSIC_DIR, 'tracks.json');
function musicBuiltins() {
  try { var j = JSON.parse(fs.readFileSync(MUSIC_BUILTIN_FILE, 'utf8')); var a = Array.isArray(j) ? j : (j && j.tracks); if (Array.isArray(a)) return a; } catch (e) {}
  return [];
}
function musicAdminTracks() { var a = _adminConfig && _adminConfig.musicTracks; return Array.isArray(a) ? a : []; }
function musicHiddenSet()  { var a = _adminConfig && _adminConfig.musicHidden; return Array.isArray(a) ? a : []; }
function musicStr(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max || 200); }
function isMp3(buf) {
  if (!buf || buf.length < 3) return false;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return true;   // 'ID3' tag
  if (buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0) return true;             // MPEG frame sync
  return false;
}
function musicAllIds() { var s = {}; musicBuiltins().forEach(function (t) { if (t && t.id) s[t.id] = 1; }); musicAdminTracks().forEach(function (t) { if (t && t.id) s[t.id] = 1; }); return s; }
function uniqueMusicId(base) {
  base = slugId(base) || ('track-' + Date.now());
  var taken = musicAllIds(), id = base, n = 2;
  while (taken[id]) id = base + '-' + (n++);
  return id;
}
// Composed list for the admin UI: built-ins (flagged, with hidden→inactive) then admin tracks.
function musicOrderList() { var a = _adminConfig && _adminConfig.musicOrder; return Array.isArray(a) ? a : []; }
// Apply the admin-defined playlist order: ids listed in musicOrder come first in
// that order; anything not listed keeps its natural position, appended at the end.
function musicSort(list) {
  var ord = musicOrderList();
  return list.map(function (t, i) { return { t: t, i: i }; }).sort(function (a, b) {
    var ia = ord.indexOf(a.t.id); if (ia < 0) ia = 1e9 + a.i;
    var ib = ord.indexOf(b.t.id); if (ib < 0) ib = 1e9 + b.i;
    return ia - ib;
  }).map(function (x) { return x.t; });
}
function musicListForAdmin() {
  var hidden = musicHiddenSet();
  var bi = musicBuiltins().map(function (t) { return Object.assign({}, t, { builtin: true, active: hidden.indexOf(t.id) < 0 }); });
  var ad = musicAdminTracks().map(function (t) { return Object.assign({}, t, { builtin: false, active: t.active !== false }); });
  return musicSort(bi.concat(ad));
}
// Composed list served to players: active built-ins + active admin tracks, re-ordered.
function musicListForClient() {
  var hidden = musicHiddenSet();
  var bi = musicBuiltins().filter(function (t) { return t && t.id && hidden.indexOf(t.id) < 0; });
  var ad = musicAdminTracks().filter(function (t) { return t && t.active !== false; });
  var _c = musicSort(bi.concat(ad)); return _c.map(function (t, i) { return Object.assign({}, t, { order: i + 1 }); });
}

function handleAdmin(req, res, reqPathOnly, query) {
  // Panel hidden? Answer like any nonexistent path so /admin can't be probed.
  if (!ADMIN_ENABLED) { res.writeHead(404); res.end('Not found'); return; }
  query = query || {};
  // Admin token transport: prefer the "Authorization: Bearer <token>" header so
  // the token never lands in URLs / access logs / browser history. Older cached
  // clients still send it as ?token= — both keep working because the header
  // value is simply folded into query.token, which every adminAuthed() consults.
  if (!query.token) {
    var _m = /^\s*Bearer\s+(.+?)\s*$/i.exec(req.headers['authorization'] || '');
    if (_m) query.token = _m[1];
  }
  if (reqPathOnly === '/admin' || reqPathOnly === '/admin.html') {
    const p = path.join(PUBLIC_DIR, 'admin.html');
    if (fs.existsSync(p)) return sendFile(req, res, p, 'text/html; charset=utf-8', 'no-store');
    res.writeHead(404); res.end('admin.html missing'); return;
  }
  if (reqPathOnly === '/admin/pkg-list') {
    if (!hasScope('packages', query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    var _pl = pkgList(), _td = pkgDisabledSet('table'), _dd = pkgDisabledSet('deck'), _hd = pkgDisabledSet('theme'), _sd = pkgDisabledSet('seat'), _tf = pkgFullSet('table'), _tfs = pkgFullscreenSet('table'), _ta = pkgAlignMap('table');
    return adminJson(res, 200, { ok: true,
      tables: (_pl.tables || []).map(function (t) { var _fs = _tfs.indexOf(t.id) >= 0 || (_tf.indexOf(t.id) < 0 && !!t.fullscreen); var _fu = !_fs && (_tf.indexOf(t.id) >= 0 || !!t.full); return Object.assign({}, t, { disabled: _td.indexOf(t.id) >= 0, full: _fu, fullscreen: _fs, align: _ta[t.id] || null, mode: _fs ? 'fullscreen' : (_fu ? 'full' : 'frame') }); }),
      decks:  (_pl.decks  || []).map(function (d) { return Object.assign({}, d, { disabled: _dd.indexOf(d.id) >= 0 }); }),
      seats:  (_pl.seats  || []).map(function (s) { return Object.assign({}, s, { disabled: _sd.indexOf(s.id) >= 0 }); }),
      themes: (_pl.themes || []).map(function (t) { return Object.assign({}, t, { disabled: _hd.indexOf(t.id) >= 0 }); }) });
  }
  if (reqPathOnly === '/admin/status') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    let version = '';
    try { version = (JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version) || ''; } catch (e) {}
    let sockets = null; try { sockets = wss.clients.size; } catch (e) {}
    return adminJson(res, 200, { ok: true, version: version, node: process.version, uptimeSec: Math.floor(process.uptime()), sockets: sockets, players: Object.keys(statsStore).length, resetPeriod: STATS_RESET_PERIOD, modes: appModes(), defaultTheme: _adminConfig.defaultTheme || '', defaults: _adminConfig.defaults || {}, loginDefaults: _adminConfig.loginDefaults || {}, proxyCfg: _adminConfig.proxyCfg || {}, tableDefaults: _adminConfig.tableDefaults || {}, tableNames: _adminConfig.tableNames || {}, serverName: _adminConfig.serverName || '', serverTagline: _adminConfig.serverTagline || '', restartAt: (_restartAt > Date.now() ? _restartAt : null), restartKind: (_restartAt > Date.now() ? _restartKind : null) });
  }
  if (reqPathOnly === '/admin/visits/export') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    const fmt = (query.format === 'csv') ? 'csv' : 'json';
    if (fmt === 'csv') {
      const lines = ['date,visits,unique_visitors,new_visitors,returning_visitors,conn_pokerthnet,conn_lan,conn_offline'];
      Object.keys(visitsStore.days).sort().forEach(function (d) {
        const b = visitsStore.days[d] || {};
        const u = b.ids ? Object.keys(b.ids).length : 0;
        const m = b.m || {};
        lines.push([d, b.v || 0, u, b.nw || 0, b.rt || 0, m.pokerthnet || 0, m.lan || 0, m.offline || 0].join(','));
      });
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Disposition': 'attachment; filename="pokerth-traffic.csv"' });
      res.end(lines.join('\n') + '\n');
      return;
    }
    let exVersion = '';
    try { exVersion = (JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version) || ''; } catch (e) {}
    const out = { schema: 'pokerth-traffic/1', exportedAt: new Date().toISOString(), version: exVersion, summary: visitsSummary(), store: visitsStore };
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Disposition': 'attachment; filename="pokerth-traffic.json"' });
    res.end(JSON.stringify(out, null, 2));
    return;
  }
  if (reqPathOnly === '/admin/visits') {
    if (req.method === 'GET') {
      if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      return adminJson(res, 200, visitsSummary());
    }
    if (req.method === 'POST') {
      return readJsonBody(req, function (d) {
        if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
        if (d && d._reset) {
          visitsStore = { days: {}, totalV: 0, totalRet: 0, allU: {}, allM: { pokerthnet: 0, lan: 0, offline: 0 } };
          dbClearTraffic();
          try { fs.writeFileSync(VISITS_FILE, JSON.stringify(visitsStore)); } catch (e) { console.error('[visits] reset write failed:', e.message); }
          return adminJson(res, 200, { ok: true, reset: true });
        }
        return adminJson(res, 400, { ok: false });
      });
    }
    res.writeHead(405); res.end('Method not allowed'); return;
  }
  if (reqPathOnly === '/admin/logs') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    return adminJson(res, 200, { ok: true, lines: LOG_RING.slice(-300) });
  }
  if (reqPathOnly === '/admin/config') {
    if (req.method === 'GET') {
      if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      return adminJson(res, 200, { ok: true, resetPeriod: STATS_RESET_PERIOD, modes: appModes(), welcome: _welcomeAdmin(), defaultTheme: _adminConfig.defaultTheme || '', defaults: _adminConfig.defaults || {}, loginDefaults: _adminConfig.loginDefaults || {}, proxyCfg: _adminConfig.proxyCfg || {}, tableDefaults: _adminConfig.tableDefaults || {}, tableNames: _adminConfig.tableNames || {}, serverName: _adminConfig.serverName || '', serverTagline: _adminConfig.serverTagline || '' });
    }
    if (req.method === 'POST') {
      return readJsonBody(req, function (d) {
        if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
        d = d || {};
        if (d.resetPeriod !== undefined) {
          const per = String(d.resetPeriod || '').toLowerCase();
          if (['off', 'daily', 'monthly', 'yearly'].indexOf(per) < 0) return adminJson(res, 400, { ok: false, error: 'invalid period (off|daily|monthly|yearly)' });
          STATS_RESET_PERIOD = per; _adminConfig.resetPeriod = per;
          try { statsMeta.period = statsPeriodKey(); saveStatsMeta(); } catch (e) {}
        }
        if (d.modes && typeof d.modes === 'object') {
          _adminConfig.modes = _adminConfig.modes || {};
          ['offline', 'lan', 'pokerthnet'].forEach(function (k) { if (d.modes[k] !== undefined) _adminConfig.modes[k] = !!d.modes[k]; });
        }
        if (d.welcome && typeof d.welcome === 'object') {
          var w = _adminConfig.welcome || {};
          if (typeof d.welcome.enabled === 'boolean') w.enabled = d.welcome.enabled;
          if (typeof d.welcome['default'] === 'string') w['default'] = d.welcome['default'].slice(0, 10);
          if (d.welcome.langs && typeof d.welcome.langs === 'object') {
            var out = {};
            Object.keys(d.welcome.langs).slice(0, 60).forEach(function (k) {
              var v = d.welcome.langs[k] || {};
              var title = (typeof v.title === 'string' ? v.title : '').slice(0, 200);
              var body = (typeof v.body === 'string' ? v.body : '').slice(0, 4000);
              if (title || body) out[String(k).slice(0, 10)] = { title: title, body: body };
            });
            w.langs = out;
          }
          if (!w['default']) w['default'] = 'fr';
          w.updatedAt = Date.now();
          _adminConfig.welcome = w;
        }
        if (typeof d.defaultTheme === 'string') _adminConfig.defaultTheme = d.defaultTheme.slice(0, 40);
        if (d.defaults && typeof d.defaults === 'object') {
          var DEF_KEYS = ['haptic', 'voice', 'assist', 'autobtn', 'quickbet', 'displaybb'];
          var dout = {};
          DEF_KEYS.forEach(function (k) { var v = d.defaults[k]; if (v === '0' || v === '1') dout[k] = v; });
          _adminConfig.defaults = dout;
        }
        if (d.loginDefaults && typeof d.loginDefaults === 'object') {
          var ld = d.loginDefaults, lout = {};
          lout.mode = (['offline', 'lan-dedi', 'pokerthnet'].indexOf(ld.mode) >= 0) ? ld.mode : '';
          lout.host = (typeof ld.host === 'string') ? ld.host.trim().slice(0, 120) : '';
          _adminConfig.loginDefaults = lout;
        }
        if (d.proxyCfg && typeof d.proxyCfg === 'object') {
          var pc = d.proxyCfg, pout = {};
          if (Array.isArray(pc.allowedHosts)) {
            pout.allowedHosts = pc.allowedHosts
              .map(function (s) { return String(s == null ? '' : s).trim().toLowerCase(); })
              .filter(function (s) { return s && /^[a-z0-9.\-:]+$/.test(s); })
              .slice(0, 50);
          }
          if (Array.isArray(pc.allowedPorts)) {
            pout.allowedPorts = pc.allowedPorts
              .map(function (s) { return parseInt(s, 10); })
              .filter(function (n) { return Number.isInteger(n) && n >= 1 && n <= 65535; })
              .slice(0, 20);
          }
          var _gs = (pc.graceSec == null || pc.graceSec === '') ? null : parseInt(pc.graceSec, 10);
          if (_gs != null && _gs >= 10 && _gs <= 900) pout.graceSec = _gs;
          var _cg = (pc.connGapMs == null || pc.connGapMs === '') ? null : parseInt(pc.connGapMs, 10);
          if (_cg != null && _cg >= 0 && _cg <= 30000) pout.connGapMs = _cg;
          _adminConfig.proxyCfg = pout;
        }
        if (d.tableDefaults && typeof d.tableDefaults === 'object') {
          var td = d.tableDefaults, tdout = {};
          var _tdInt = function (v, lo, hi) { if (v == null || v === '') return null; var n = parseInt(v, 10); return (isFinite(n) && n >= lo && n <= hi) ? n : null; };
          var _pl = _tdInt(td.players, 2, 10);       if (_pl != null) tdout.players = _pl;
          var _bl = _tdInt(td.blind,   1, 1000000);  if (_bl != null) tdout.blind   = _bl;
          var _st = _tdInt(td.stack, 500, 1000000);  if (_st != null) tdout.stack   = _st;
          var _to = _tdInt(td.timeout, 5, 120);      if (_to != null) tdout.timeout = _to;
          _adminConfig.tableDefaults = tdout;
        }
        if (d.tableNames && typeof d.tableNames === 'object') {
          var tn = d.tableNames, tnout = {};
          ['lan', 'pokerthnet', 'offline'].forEach(function (k) {
            var v = tn[k];
            if (typeof v === 'string') { v = v.trim().slice(0, 48); if (v) tnout[k] = v; }
          });
          _adminConfig.tableNames = tnout;
        }
        if (typeof d.serverName === 'string')    _adminConfig.serverName    = d.serverName.trim().slice(0, 40);
        if (typeof d.serverTagline === 'string') _adminConfig.serverTagline = d.serverTagline.trim().slice(0, 60);
        saveAdminConfig();
        return adminJson(res, 200, { ok: true, resetPeriod: STATS_RESET_PERIOD, modes: appModes(), welcome: _welcomeAdmin(), defaultTheme: _adminConfig.defaultTheme || '', defaults: _adminConfig.defaults || {}, loginDefaults: _adminConfig.loginDefaults || {}, proxyCfg: _adminConfig.proxyCfg || {}, tableDefaults: _adminConfig.tableDefaults || {}, tableNames: _adminConfig.tableNames || {}, serverName: _adminConfig.serverName || '', serverTagline: _adminConfig.serverTagline || '' });
      });
    }
    res.writeHead(405); res.end('Method not allowed'); return;
  }
  // ── PokerTH server registry (Layer A): dial allowlist + reachability. Master-only. ──
  if (reqPathOnly === '/admin/servers') {
    if (req.method !== 'POST') {
      if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var _hosts = ALLOWED_HOSTS.slice();
      var _ports = ALLOWED_PORTS.slice();
      var _px = _adminConfig && _adminConfig.proxyCfg;
      if (_px && Array.isArray(_px.allowedHosts)) _px.allowedHosts.forEach(function (x) { var v = String(x).toLowerCase(); if (v && _hosts.indexOf(v) < 0) _hosts.push(v); });
      if (_px && Array.isArray(_px.allowedPorts)) _px.allowedPorts.forEach(function (x) { var v = parseInt(x, 10); if (v > 0 && _ports.indexOf(v) < 0) _ports.push(v); });
      _serversList().forEach(function (s) { if (_hosts.indexOf(s.host) < 0) _hosts.push(s.host); if (_ports.indexOf(s.port) < 0) _ports.push(s.port); });
      var _autoSrv = _serverlistCache.server;
      if (_autoSrv) { if (_hosts.indexOf(_autoSrv.host) < 0) _hosts.push(_autoSrv.host); if (_ports.indexOf(_autoSrv.port) < 0) _ports.push(_autoSrv.port); }
      return adminJson(res, 200, { ok: true, servers: _serversList(), activeServerId: (_adminConfig.activeServerId || ''), source: _pokerthnetSource(), serverlistUrl: _serverlistUrl(), serverlist: { server: _serverlistCache.server, fetchedAt: _serverlistCache.fetchedAt, error: _serverlistCache.error }, allowlist: { hosts: _hosts, ports: _ports } });
    }
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      if (!d || !Array.isArray(d.servers)) return adminJson(res, 400, { ok: false, error: 'servers[] required' });
      var out = [];
      for (var i = 0; i < d.servers.length && out.length < 50; i++) { var s = _sanitizeServer(d.servers[i]); if (s) out.push(s); }
      _adminConfig.servers = out;
      // Active server for the client's "Internet / PokerTH.net" mode: keep the
      // pointer only while it still matches a saved server, else clear it.
      if (typeof d.activeServerId !== 'undefined') {
        var _aid = String(d.activeServerId || '').trim().slice(0, 40);
        _adminConfig.activeServerId = out.some(function (s) { return s.id === _aid; }) ? _aid : '';
      } else if (_adminConfig.activeServerId && !out.some(function (s) { return s.id === _adminConfig.activeServerId; })) {
        _adminConfig.activeServerId = '';
      }
      // Source of the Internet / PokerTH.net target: 'manual' (active server above
      // / built-in default) or 'auto' (official serverlist, auto-updating).
      if (typeof d.source !== 'undefined') {
        var _src = (String(d.source || '') === 'auto') ? 'auto' : 'manual';
        var _wasAuto = _pokerthnetSource() === 'auto';
        _adminConfig.pokerthnetSource = _src;
        if (_src === 'auto' && !_wasAuto) { _serverlistCache.fetchedAt = 0; setTimeout(maybeRefreshServerlist, 0); }
      }
      if (typeof d.serverlistUrl !== 'undefined') {
        var _u = String(d.serverlistUrl || '').trim().slice(0, 300);
        var _changed = _u !== (_adminConfig.serverlistUrl || '');
        _adminConfig.serverlistUrl = _u;
        if (_changed && _pokerthnetSource() === 'auto') { _serverlistCache.fetchedAt = 0; setTimeout(maybeRefreshServerlist, 0); }
      }
      saveAdminConfig();
      return adminJson(res, 200, { ok: true, servers: out, activeServerId: (_adminConfig.activeServerId || ''), source: _pokerthnetSource(), serverlistUrl: _serverlistUrl() });
    });
  }
  if (reqPathOnly === '/admin/servers/serverlist' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var _u = (d && typeof d.serverlistUrl !== 'undefined' && String(d.serverlistUrl || '').trim()) ? String(d.serverlistUrl).trim().slice(0, 300) : _serverlistUrl();
      _doFetchServerlist(_u, function (r) {
        return adminJson(res, 200, { ok: true, fetched: !!(r && r.ok), error: (r && r.error) || '', server: (r && r.server) || null, url: _u });
      });
    });
  }
  if (reqPathOnly === '/admin/servers/probe' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var host = String((d && d.host) || '').trim().toLowerCase();
      var port = parseInt((d && d.port) || 7234, 10);
      var useTls = !!(d && d.tls);
      if (!host) return adminJson(res, 400, { ok: false, error: 'host required' });
      if (!isPortAllowed(port)) return adminJson(res, 200, { ok: true, reachable: false, ms: 0, error: 'port not allowed' });
      if (!isHostAllowed(host)) return adminJson(res, 200, { ok: true, reachable: false, ms: 0, error: 'host not in allowlist (save it first)' });
      var t0 = Date.now(), done = false, sock = null;
      function finish(ok, err) { if (done) return; done = true; try { if (sock) sock.destroy(); } catch (e) {} return adminJson(res, 200, { ok: true, reachable: ok, ms: Date.now() - t0, error: err || '' }); }
      try {
        var opts = { host: host, port: port };
        sock = useTls
          ? tls.connect(Object.assign({ rejectUnauthorized: false, servername: /^[0-9.]+$/.test(host) ? undefined : host }, opts), function () { finish(true, ''); })
          : net.connect(opts, function () { finish(true, ''); });
        sock.setTimeout(6000);
        sock.on('timeout', function () { finish(false, 'timeout'); });
        sock.on('error', function (e) { finish(false, (e && e.code) || 'error'); });
      } catch (e) { finish(false, (e && e.code) || 'error'); }
    });
  }
  if (reqPathOnly === '/admin/servers/lobby' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var host = String((d && d.host) || '').trim().toLowerCase();
      var port = parseInt((d && d.port) || 7234, 10);
      var useTls = !!(d && d.tls);
      if (!host) return adminJson(res, 400, { ok: false, error: 'host required' });
      if (!isPortAllowed(port)) return adminJson(res, 200, { ok: true, reachable: false, error: 'port not allowed' });
      if (!isHostAllowed(host)) return adminJson(res, 200, { ok: true, reachable: false, error: 'host not in allowlist (save it first)' });
      lobbyProbe(host, port, useTls, function (r) { return adminJson(res, 200, r); });
    });
  }
  if (reqPathOnly === '/admin/pkg-upload' && req.method === 'POST') {
    if (!hasScope('packages', query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    const kind = query.kind === 'deck' ? 'deck' : (query.kind === 'table' ? 'table' : (query.kind === 'theme' ? 'theme' : (query.kind === 'seat' ? 'seat' : null)));
    if (!kind) return adminJson(res, 400, { ok: false, error: 'kind must be table, deck, theme or seat' });
    return readRawBody(req, MAX_UPLOAD, function (buf) {
      if (!buf || !buf.length) return adminJson(res, 413, { ok: false, error: 'empty upload or larger than 25 MB' });
      importPackage(kind, query.name || '', buf, function (err, info) {
        if (err) return adminJson(res, 400, { ok: false, error: err });
        adminJson(res, 200, { ok: true, kind: kind, id: info.id, name: info.name });
      });
    });
  }
  if (reqPathOnly === '/admin/pkg-remove' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('packages', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const kind = (d && d.kind === 'deck') ? 'deck' : ((d && d.kind === 'table') ? 'table' : ((d && d.kind === 'theme') ? 'theme' : ((d && d.kind === 'seat') ? 'seat' : null)));
      const id = slugId(d && d.id);
      if (!kind || !id) return adminJson(res, 400, { ok: false, error: 'kind + id required' });
      if (kind === 'seat' && ['', 'pokerth', 'chip', 'plate', 'card', 'compact', 'bar'].indexOf(id) >= 0) return adminJson(res, 400, { ok: false, error: 'built-in seat cannot be removed' });
      if (kind === 'table' && ['green', 'blue', 'bordeaux', 'slate', 'photo'].indexOf(id) >= 0) return adminJson(res, 400, { ok: false, error: 'built-in table cannot be removed' });
      if (kind === 'deck' && ['svg', 'classic'].indexOf(id) >= 0) return adminJson(res, 400, { ok: false, error: 'built-in deck cannot be removed' });
      if (kind === 'theme' && BUILTIN_THEMES.indexOf(id) >= 0) return adminJson(res, 400, { ok: false, error: 'built-in theme cannot be removed (you can hide it instead)' });
      const dir = path.join(PUBLIC_DIR, kind === 'table' ? 'table' : kind === 'theme' ? 'themes' : kind === 'seat' ? 'seats' : 'cards', id);
      if (!fs.existsSync(dir)) return adminJson(res, 404, { ok: false, error: 'not found' });
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { return adminJson(res, 500, { ok: false, error: 'remove failed' }); }
      try { var _da = pkgDisabledSet(kind); var _i = _da.indexOf(id); if (_i >= 0) { _da.splice(_i, 1); _adminConfig.pkgDisabled[kind] = _da; saveAdminConfig(); } } catch (e) {}
      try { if (kind === 'table' && _adminConfig.pkgFull && Array.isArray(_adminConfig.pkgFull.table)) { var _fa = _adminConfig.pkgFull.table; var _fi = _fa.indexOf(id); if (_fi >= 0) { _fa.splice(_fi, 1); _adminConfig.pkgFull.table = _fa; saveAdminConfig(); } } } catch (e) {}
      try { if (kind === 'table' && _adminConfig.pkgFullscreen && Array.isArray(_adminConfig.pkgFullscreen.table)) { var _sa = _adminConfig.pkgFullscreen.table; var _si = _sa.indexOf(id); if (_si >= 0) { _sa.splice(_si, 1); _adminConfig.pkgFullscreen.table = _sa; saveAdminConfig(); } } } catch (e) {}
      try { if (kind === 'table' && _adminConfig.pkgAlign && _adminConfig.pkgAlign.table && Object.prototype.hasOwnProperty.call(_adminConfig.pkgAlign.table, id)) { delete _adminConfig.pkgAlign.table[id]; saveAdminConfig(); } } catch (e) {}
      regenManifest(kind);
      adminJson(res, 200, { ok: true });
    });
  }
  // Enable/disable an installed package for players (kept installed either way).
  if (reqPathOnly === '/admin/pkg-toggle' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('packages', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const kind = (d && d.kind === 'deck') ? 'deck' : ((d && d.kind === 'table') ? 'table' : ((d && d.kind === 'theme') ? 'theme' : ((d && d.kind === 'seat') ? 'seat' : null)));
      const id = slugId(d && d.id);
      if (!kind || !id) return adminJson(res, 400, { ok: false, error: 'kind + id required' });
      const enabled = !(d && d.enabled === false);   // desired state; false = hide from players
      _adminConfig.pkgDisabled = _adminConfig.pkgDisabled || {};
      var arr = Array.isArray(_adminConfig.pkgDisabled[kind]) ? _adminConfig.pkgDisabled[kind] : [];
      var i = arr.indexOf(id);
      if (enabled) { if (i >= 0) arr.splice(i, 1); } else { if (i < 0) arr.push(id); }
      _adminConfig.pkgDisabled[kind] = arr;
      saveAdminConfig();
      return adminJson(res, 200, { ok: true, kind: kind, id: id, disabled: !enabled });
    });
  }
  // Mark/unmark a table package as « full image » (felt replaces the whole CSS table).
  if (reqPathOnly === '/admin/pkg-full' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('packages', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const id = slugId(d && d.id);
      if (!id) return adminJson(res, 400, { ok: false, error: 'id required' });
      // Mode: 'frame' | 'full' | 'fullscreen'. Legacy: {full:true/false} => full/frame.
      var mode = (d && typeof d.mode === 'string') ? d.mode : ((d && d.full) ? 'full' : 'frame');
      if (mode !== 'full' && mode !== 'fullscreen') mode = 'frame';
      _adminConfig.pkgFull = _adminConfig.pkgFull || {};
      _adminConfig.pkgFullscreen = _adminConfig.pkgFullscreen || {};
      var fa = Array.isArray(_adminConfig.pkgFull.table) ? _adminConfig.pkgFull.table : [];
      var sa = Array.isArray(_adminConfig.pkgFullscreen.table) ? _adminConfig.pkgFullscreen.table : [];
      var fi = fa.indexOf(id); if (fi >= 0) fa.splice(fi, 1);
      var si = sa.indexOf(id); if (si >= 0) sa.splice(si, 1);
      if (mode === 'full') fa.push(id);
      else if (mode === 'fullscreen') sa.push(id);
      _adminConfig.pkgFull.table = fa;
      _adminConfig.pkgFullscreen.table = sa;
      saveAdminConfig();
      return adminJson(res, 200, { ok: true, id: id, mode: mode, full: (mode === 'full') });
    });
  }
  if (reqPathOnly === '/admin/pkg-align' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('packages', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const id = slugId(d && d.id);
      if (!id) return adminJson(res, 400, { ok: false, error: 'id required' });
      var align = (d && typeof d.align === 'string') ? d.align.trim().toLowerCase() : '';
      if (align && PKG_ALIGN_VALUES.indexOf(align) < 0) return adminJson(res, 400, { ok: false, error: 'bad align (e.g. "center top")' });
      _adminConfig.pkgAlign = _adminConfig.pkgAlign || {};
      var m = (_adminConfig.pkgAlign.table && typeof _adminConfig.pkgAlign.table === 'object' && !Array.isArray(_adminConfig.pkgAlign.table)) ? _adminConfig.pkgAlign.table : {};
      if (align) m[id] = align; else delete m[id];
      _adminConfig.pkgAlign.table = m;
      saveAdminConfig();
      return adminJson(res, 200, { ok: true, id: id, align: align || null });
    });
  }
  if (reqPathOnly === '/admin/music-list') {
    if (!hasScope('music', query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    return adminJson(res, 200, { ok: true, tracks: musicListForAdmin() });
  }
  if (reqPathOnly === '/admin/music-upload' && req.method === 'POST') {
    if (!hasScope('music', query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    var _mTitle = musicStr(query.title, 120);
    if (!_mTitle) return adminJson(res, 400, { ok: false, error: 'title required' });
    return readRawBody(req, MAX_UPLOAD, function (buf) {
      if (!buf || !buf.length) return adminJson(res, 413, { ok: false, error: 'empty upload or larger than 25 MB' });
      if (!isMp3(buf)) return adminJson(res, 400, { ok: false, error: 'not an MP3 file' });
      var id = uniqueMusicId(_mTitle);
      try { fs.mkdirSync(MUSIC_DIR, { recursive: true }); fs.writeFileSync(path.join(MUSIC_DIR, id + '.mp3'), buf); }
      catch (e) { return adminJson(res, 500, { ok: false, error: 'write failed' }); }
      var artist = musicStr(query.artist, 120);
      var entry = {
        id: id, title: _mTitle, artist: artist, file: '/music/' + id + '.mp3',
        license: musicStr(query.license, 60), licenseUrl: musicStr(query.licenseUrl, 300),
        source: musicStr(query.source, 120), sourceUrl: musicStr(query.sourceUrl, 300),
        credit: musicStr(query.credit, 300) || (_mTitle + (artist ? ' by ' + artist : '')),
        active: true
      };
      _adminConfig.musicTracks = musicAdminTracks().concat([entry]);
      saveAdminConfig();
      return adminJson(res, 200, { ok: true, id: id, title: _mTitle });
    });
  }
  if (reqPathOnly === '/admin/music-remove' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('music', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var id = slugId(d && d.id);
      if (!id) return adminJson(res, 400, { ok: false, error: 'id required' });
      if (musicBuiltins().some(function (t) { return t && t.id === id; })) return adminJson(res, 400, { ok: false, error: 'built-in track cannot be removed (you can hide it instead)' });
      var arr = musicAdminTracks(), idx = arr.findIndex(function (t) { return t && t.id === id; });
      if (idx < 0) return adminJson(res, 404, { ok: false, error: 'not found' });
      arr.splice(idx, 1); _adminConfig.musicTracks = arr; saveAdminConfig();
      try { fs.rmSync(path.join(MUSIC_DIR, id + '.mp3'), { force: true }); } catch (e) {}
      return adminJson(res, 200, { ok: true });
    });
  }
  if (reqPathOnly === '/admin/music-toggle' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('music', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var id = slugId(d && d.id);
      if (!id) return adminJson(res, 400, { ok: false, error: 'id required' });
      var enabled = !(d && d.enabled === false);
      if (musicBuiltins().some(function (t) { return t && t.id === id; })) {
        var h = musicHiddenSet(), hi = h.indexOf(id);
        if (enabled) { if (hi >= 0) h.splice(hi, 1); } else { if (hi < 0) h.push(id); }
        _adminConfig.musicHidden = h; saveAdminConfig();
        return adminJson(res, 200, { ok: true, id: id, active: enabled });
      }
      var arr = musicAdminTracks(), t = arr.find(function (x) { return x && x.id === id; });
      if (!t) return adminJson(res, 404, { ok: false, error: 'not found' });
      t.active = enabled; _adminConfig.musicTracks = arr; saveAdminConfig();
      return adminJson(res, 200, { ok: true, id: id, active: enabled });
    });
  }
  if (reqPathOnly === '/admin/music-edit' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('music', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var id = slugId(d && d.id);
      if (!id) return adminJson(res, 400, { ok: false, error: 'id required' });
      if (musicBuiltins().some(function (t) { return t && t.id === id; })) return adminJson(res, 400, { ok: false, error: 'built-in track cannot be edited' });
      var arr = musicAdminTracks(), t = arr.find(function (x) { return x && x.id === id; });
      if (!t) return adminJson(res, 404, { ok: false, error: 'not found' });
      var title = musicStr(d && d.title, 120);
      if (!title) return adminJson(res, 400, { ok: false, error: 'title required' });
      t.title = title;
      t.artist = musicStr(d && d.artist, 120);
      t.licenseUrl = musicStr(d && d.licenseUrl, 300);
      t.credit = musicStr(d && d.credit, 300) || (title + (t.artist ? ' by ' + t.artist : ''));
      _adminConfig.musicTracks = arr; saveAdminConfig();
      return adminJson(res, 200, { ok: true, id: id });
    });
  }
  if (reqPathOnly === '/admin/music-order' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('music', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      if (!d || !Array.isArray(d.order)) return adminJson(res, 400, { ok: false, error: 'order array required' });
      var known = musicAllIds(), clean = [];
      d.order.forEach(function (x) { var id = slugId(x); if (known[id] && clean.indexOf(id) < 0) clean.push(id); });
      _adminConfig.musicOrder = clean; saveAdminConfig();
      return adminJson(res, 200, { ok: true, order: clean });
    });
  }
  if (reqPathOnly === '/admin/update' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const started = runDetached(updateCmd(), UPDATE_LOG);
      console.log('[admin] self-update requested (git pull + npm + restart)');
      return adminJson(res, started ? 200 : 500, { ok: started, started: started });
    });
  }
  if (reqPathOnly === '/admin/update-nr' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const started = runDetached(updateCmdStatic(), UPDATE_LOG);
      console.log('[admin] static self-update requested (git pull, no restart)');
      return adminJson(res, started ? 200 : 500, { ok: started, started: started });
    });
  }
  if (reqPathOnly === '/admin/schedule-restart' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const secs = Math.floor(Number(d && d.seconds) || 0);
      if (!(secs >= 10 && secs <= 86400)) return adminJson(res, 400, { ok: false, error: 'seconds must be between 10 and 86400' });
      const kind = (d && d.kind === 'restart') ? 'restart' : 'update';
      const note = (d && typeof d.message === 'string') ? d.message.replace(/[\r\n]+/g, ' ').slice(0, 200) : '';
      clearScheduledRestart();
      _restartAt = Date.now() + secs * 1000;
      _restartKind = kind;
      _restartNotice = 'NOTICE:RESTART:' + _restartAt + ':' + kind + ':' + note;
      const reached = broadcastNotice(_restartNotice);
      _restartTimer = setTimeout(function () {
        const cmd = (_restartKind === 'restart') ? restartOnlyCmd() : updateCmd();
        console.log('[admin] scheduled ' + _restartKind + ' firing now');
        _restartTimer = null; _restartAt = 0; _restartNotice = '';
        runDetached(cmd, UPDATE_LOG);
      }, secs * 1000);
      console.log('[admin] scheduled ' + kind + ' in ' + secs + 's (notified ' + reached + ' client(s))');
      return adminJson(res, 200, { ok: true, scheduledAt: _restartAt, kind: kind, notified: reached });
    });
  }
  if (reqPathOnly === '/admin/cancel-restart' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const had = _restartAt > 0;
      clearScheduledRestart();
      if (had) broadcastNotice('NOTICE:CANCEL');
      console.log('[admin] scheduled action cancelled' + (had ? '' : ' (none pending)'));
      return adminJson(res, 200, { ok: true, cancelled: had });
    });
  }
  if (reqPathOnly === '/admin/db' && req.method === 'GET') {
    if (!adminAuthed(query, null)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    const f = _dbFileCfg || {};
    return adminJson(res, 200, { ok: true, config: { host: f.host || '', port: Number(f.port) || 3306, user: f.user || '', database: f.database || '', enabled: f.enabled !== false, hasPassword: !!f.password }, status: { enabled: _dbStatus.enabled, connected: _dbStatus.connected, error: _dbStatus.error || '', lastWrite: _dbStatus.lastWrite, source: _dbStatus.source } });
  }
  if (reqPathOnly === '/admin/db' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      if (!d || typeof d !== 'object') return adminJson(res, 400, { ok: false, error: 'bad request' });
      const c = _dbFileCfg || {};
      if (typeof d.host === 'string') c.host = d.host.trim().slice(0, 255);
      if (d.port !== undefined) c.port = Number(d.port) || 3306;
      if (typeof d.user === 'string') c.user = d.user.slice(0, 128);
      if (typeof d.database === 'string') c.database = d.database.trim().slice(0, 128);
      if (typeof d.enabled === 'boolean') c.enabled = d.enabled;
      if (typeof d.password === 'string' && d.password.length) c.password = d.password.slice(0, 255);
      if (typeof c.password !== 'string') c.password = '';
      _dbFileCfg = c; saveDbConfig();
      reconfigureDb().then(function () {
        adminJson(res, 200, { ok: true, status: { enabled: _dbStatus.enabled, connected: _dbStatus.connected, error: _dbStatus.error || '', source: _dbStatus.source, lastWrite: _dbStatus.lastWrite } });
      }).catch(function (e) {
        adminJson(res, 200, { ok: true, status: { enabled: _dbStatus.enabled, connected: false, error: String((e && e.message) || e), source: _dbStatus.source } });
      });
    });
  }
  if (reqPathOnly === '/admin/db/test' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const f = _dbFileCfg || {};
      const host = (d && typeof d.host === 'string' && d.host.trim()) ? d.host.trim() : f.host;
      const port = (d && d.port !== undefined) ? (Number(d.port) || 3306) : (Number(f.port) || 3306);
      const user = (d && typeof d.user === 'string') ? d.user : (f.user || 'root');
      const database = (d && typeof d.database === 'string' && d.database.trim()) ? d.database.trim() : f.database;
      const password = (d && typeof d.password === 'string' && d.password.length) ? d.password : (f.password || '');
      if (!host || !database) return adminJson(res, 400, { ok: false, error: 'host and database required' });
      let mysql; try { mysql = require('mysql2/promise'); } catch (e) { return adminJson(res, 200, { ok: false, error: 'mysql2 not installed \u2014 run npm install' }); }
      (async function () {
        let conn;
        try {
          conn = await mysql.createConnection({ host: host, port: port, user: user || 'root', password: password, database: database, connectTimeout: 8000 });
          await conn.query('SELECT 1');
          await conn.end();
          adminJson(res, 200, { ok: true });
        } catch (e) { try { if (conn) await conn.end(); } catch (e2) {} adminJson(res, 200, { ok: false, error: String((e && e.message) || e) }); }
      })();
    });
  }
  if (reqPathOnly === '/admin/tokens' && req.method === 'GET') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    var _keys = _loadScopedTokens().map(function (r) {
      var t = r.token || '', masked = t.length > 8 ? (t.slice(0, 4) + '\u2026' + t.slice(-4)) : '\u2022\u2022\u2022\u2022';
      return { name: r.name || '', scopes: (r.scopes || []).filter(function (s) { return ADMIN_SCOPES.indexOf(s) >= 0; }), created: r.created || null, masked: masked };
    });
    return adminJson(res, 200, { ok: true, keys: _keys, available: ADMIN_SCOPES });
  }
  if (reqPathOnly === '/admin/tokens' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var name = (d && typeof d.name === 'string') ? d.name.trim().slice(0, 64) : '';
      if (!name) return adminJson(res, 400, { ok: false, error: 'name required' });
      var scopes = (d && Array.isArray(d.scopes)) ? d.scopes.filter(function (s) { return ADMIN_SCOPES.indexOf(s) >= 0; }) : [];
      if (!scopes.length) return adminJson(res, 400, { ok: false, error: 'pick at least one valid category' });
      var list = _loadScopedTokens().slice();
      if (list.some(function (r) { return r.name === name; })) return adminJson(res, 409, { ok: false, error: 'a key with that name already exists' });
      var newTok = crypto.randomBytes(24).toString('hex');
      list.push({ name: name, token: newTok, scopes: scopes, created: Date.now() });
      try { _saveScopedTokens(list); } catch (e) { return adminJson(res, 500, { ok: false, error: 'could not save key' }); }
      console.log('[admin] delegate key created: ' + name + ' [' + scopes.join(',') + ']');
      return adminJson(res, 200, { ok: true, name: name, scopes: scopes, token: newTok });
    });
  }
  if (reqPathOnly === '/admin/tokens/delete' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var name = (d && typeof d.name === 'string') ? d.name : '';
      var list = _loadScopedTokens().slice(), n = list.length;
      list = list.filter(function (r) { return r.name !== name; });
      if (list.length === n) return adminJson(res, 404, { ok: false, error: 'not found' });
      try { _saveScopedTokens(list); } catch (e) { return adminJson(res, 500, { ok: false, error: 'could not save' }); }
      console.log('[admin] delegate key revoked: ' + name);
      return adminJson(res, 200, { ok: true });
    });
  }
  if (reqPathOnly === '/admin/whoami') {
    // Capability probe for the admin UI: report what the presented key may do.
    if (adminAuthed(query)) return adminJson(res, 200, { ok: true, master: true, scopes: ADMIN_SCOPES });
    var _wt = (query && query.token) || '', _wr = _loadScopedTokens().find(function (r) { return r.token === _wt; });
    if (_wr) return adminJson(res, 200, { ok: true, master: false, scopes: (_wr.scopes || []).filter(function (s) { return ADMIN_SCOPES.indexOf(s) >= 0; }) });
    return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
  }
  if (reqPathOnly === '/admin/broadcasts' && req.method === 'GET') {
    if (!hasScope('broadcast', query, null)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    const now = Date.now();
    const jobs = _broadcasts.map(function (j) {
      return { id: j.id, message: j.message, icon: j.icon || '', schedule: j.schedule, enabled: !!j.enabled, lastRun: j.lastRun || null, runCount: j.runCount || 0, endAt: j.endAt || null, maxRuns: j.maxRuns || null, createdAt: j.createdAt || null, nextRun: (j.enabled ? computeNextRun(j, now) : null) };
    });
    let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    return adminJson(res, 200, { ok: true, jobs: jobs, serverNow: now, tz: tz });
  }
  if (reqPathOnly === '/admin/broadcast-now' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('broadcast', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const message = (d && typeof d.message === 'string') ? d.message.slice(0, 500) : '';
      if (!message.trim()) return adminJson(res, 400, { ok: false, error: 'message required' });
      const n = broadcastNotice('INFO:' + _bcIcon(d && d.icon) + ':' + message);
      console.log('[broadcast] one-off -> ' + n + ' client(s)');
      return adminJson(res, 200, { ok: true, notified: n });
    });
  }
  if (reqPathOnly === '/admin/broadcasts' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('broadcast', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      if (!d || typeof d.message !== 'string' || !d.message.trim()) return adminJson(res, 400, { ok: false, error: 'message required' });
      const sched = _bcValidateSchedule(d.schedule);
      if (!sched) return adminJson(res, 400, { ok: false, error: 'invalid schedule' });
      const job = {
        id: 'bc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        message: d.message.slice(0, 500),
        icon: _bcIcon(d.icon),
        schedule: sched,
        enabled: d.enabled === false ? false : true,
        endAt: (d.endAt && Number(d.endAt) > Date.now()) ? Number(d.endAt) : null,
        maxRuns: (d.maxRuns && Number(d.maxRuns) > 0) ? Math.floor(Number(d.maxRuns)) : null,
        createdAt: Date.now(), lastRun: null, runCount: 0
      };
      _broadcasts.push(job); saveBroadcasts(); armBroadcast(job);
      console.log('[broadcast] created ' + job.id + ' (' + sched.type + ')');
      return adminJson(res, 200, { ok: true, id: job.id, nextRun: computeNextRun(job, Date.now()) });
    });
  }
  if (reqPathOnly === '/admin/broadcasts/delete' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('broadcast', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const id = d && d.id, i = _broadcasts.findIndex(function (j) { return j.id === id; });
      if (i < 0) return adminJson(res, 404, { ok: false, error: 'not found' });
      clearBroadcastTimer(id); _broadcasts.splice(i, 1); saveBroadcasts();
      return adminJson(res, 200, { ok: true });
    });
  }
  if (reqPathOnly === '/admin/broadcasts/toggle' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('broadcast', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const job = _broadcasts.find(function (j) { return j.id === (d && d.id); });
      if (!job) return adminJson(res, 404, { ok: false, error: 'not found' });
      job.enabled = !!(d && d.enabled); saveBroadcasts(); armBroadcast(job);
      return adminJson(res, 200, { ok: true, enabled: job.enabled, nextRun: (job.enabled ? computeNextRun(job, Date.now()) : null) });
    });
  }
  if (reqPathOnly === '/admin/broadcasts/fire' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('broadcast', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const job = _broadcasts.find(function (j) { return j.id === (d && d.id); });
      if (!job) return adminJson(res, 404, { ok: false, error: 'not found' });
      const n = fireBroadcast(job); saveBroadcasts();
      return adminJson(res, 200, { ok: true, notified: n });
    });
  }
  if (reqPathOnly === '/admin/restart' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const started = runDetached("sleep 1; pm2 restart " + PM2_NAME + " --update-env", UPDATE_LOG);
      console.log('[admin] restart requested');
      return adminJson(res, started ? 200 : 500, { ok: started, started: started });
    });
  }
  if (reqPathOnly === '/admin/clear-logs' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      LOG_RING.length = 0;
      console.log('[admin] in-memory logs cleared');
      return adminJson(res, 200, { ok: true });
    });
  }
  if (reqPathOnly === '/admin/update-log') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    let log = '';
    try { log = fs.readFileSync(UPDATE_LOG, 'utf8'); } catch (e) {}
    return adminJson(res, 200, { ok: true, log: log.slice(-12000) });
  }
  res.writeHead(404); res.end('Not found');
}

// ── HTTP server ──
// ───────────────────────────────────────────────────────────────────────────
// Ranking relay (server-side): PokerTH / BBC / WEC.
// Browser fetch to these hosts is blocked by CORS (confirmed with sp0ck), so the
// client calls our own same-origin /api/ranking?src=pth|bbc|wec and we fetch the
// upstream JSON here, where there is no CORS and we set the User-Agent (a normal
// browser UA is enough to pass the Cloudflare "under attack" filter).
//
// PENDING from sp0ck: the exact upstream JSON endpoints and the BBC/WEC CSRF flow.
// Fill RANKING_SOURCES[*].url (and the .csrf block for bbc/wec) and the relay works
// end to end. Until then /api/ranking returns endpoint_not_configured (HTTP 503).
// ───────────────────────────────────────────────────────────────────────────
const RANKING_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                   '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const RANKING_SOURCES = {
  // PokerTH official leaderboard — a real JSON API (no CSRF), one POST per season:
  //   POST /pthranking/ranking/leaderboard/<season>  body {page,pageSize,sort,filters}
  //   -> { data:[...], total, seasons:[...] }  (final_score/average_score already strings)
  pth: { name: 'PokerTH', leaderboard: 'https://www.pokerth.net/pthranking/ranking/leaderboard/', json: true, parse: rankingParsePth, pageSize: 50 },
  // BBC ranking is server-rendered into <ranking-component :results="...">
  // (HTML-entity-encoded JSON). A plain GET is enough — no CSRF for reads.
  bbc: { name: 'BBC', url: 'https://bbc.pokerth.net/results/ranking', csrf: null, parse: rankingParseBbc, supportsSeason: true },
  wec: { name: 'WEC', url: 'https://wec.pokerth.net/results/ranking', csrf: null, parse: rankingParseWec }
};

// Extract the BBC ranking from its results page. The table is server-rendered
// into <ranking-component :results="[…]"> as HTML-entity-encoded JSON, so a
// plain GET + decode + JSON.parse is all that's needed (no API call, no CSRF).
function rankingDecodeHtml(s) {
  return s.replace(/&quot;/g, '"')
          .replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
}
function rankingParseBbc(html) {
  const m = /:results="([^"]*)"/.exec(html);
  if (!m) return { ok: false, error: 'parse_no_results', source: 'BBC' };
  let arr;
  try { arr = JSON.parse(rankingDecodeHtml(m[1])); }
  catch (e) { return { ok: false, error: 'parse_json', source: 'BBC' }; }
  if (!Array.isArray(arr)) return { ok: false, error: 'parse_shape', source: 'BBC' };
  let season = null, seasons = [];
  const ms = /:season="(\d+)"/.exec(html); if (ms) season = parseInt(ms[1], 10);
  const msa = /:allseasons="(\[[^"]*\])"/.exec(html);
  if (msa) { try { seasons = JSON.parse(msa[1]); } catch (e) { /* ignore */ } }
  const rows = arr.map(function (p, i) {
    return { rank: i + 1, player: p.nickname, score: p.score, points: p.points, games: p.games };
  });
  return { ok: true, source: 'BBC', season: season, seasons: seasons, rows: rows };
}

// WEC leaderboard lives at /results/ranking in <ranking-component :stats="[…]">
// (HTML-entity-encoded JSON, same row shape as BBC but no seasons). Plain GET.
function rankingParseWec(html) {
  const m = /:stats="([^"]*)"/.exec(html);
  if (!m) return { ok: false, error: 'parse_no_results', source: 'WEC' };
  let arr;
  try { arr = JSON.parse(rankingDecodeHtml(m[1])); }
  catch (e) { return { ok: false, error: 'parse_json', source: 'WEC' }; }
  if (!Array.isArray(arr)) return { ok: false, error: 'parse_shape', source: 'WEC' };
  const rows = arr.map(function (p, i) {
    return { rank: i + 1, player: p.nickname, score: p.score, points: p.points, games: p.games };
  });
  return { ok: true, source: 'WEC', rows: rows };
}

const RANKING_CACHE = new Map();        // cacheKey -> { at, status, body }
const RANKING_TTL_MS = 60 * 1000;       // short cache to spare the upstream
const RANKING_TIMEOUT_MS = 8000;

function rankingFetch(targetUrl, extraHeaders, opts) {
  const ctl = new AbortController();
  const t = setTimeout(function () { ctl.abort(); }, RANKING_TIMEOUT_MS);
  const headers = Object.assign({
    'User-Agent': RANKING_UA,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9'
  }, extraHeaders || {});
  const init = Object.assign({ headers: headers, redirect: 'follow', signal: ctl.signal }, opts || {});
  return fetch(targetUrl, init)
    .finally(function () { clearTimeout(t); });
}

// Read a CSRF token from an upstream page per the source's csrf.read strategy.
// TODO(sp0ck): confirm the real mechanism (meta tag / cookie / JSON field) + how to send it.
async function rankingCsrfToken(src) {
  const c = src.csrf;
  if (!c || !c.url) return { token: '', cookie: '' };
  const r = await rankingFetch(c.url);
  const setCookie = r.headers.get('set-cookie') || '';
  const text = await r.text();
  let token = '';
  if (c.read === 'cookie') {
    const m = new RegExp("(?:^|;\\s*)" + c.readName + "=([^;]+)").exec(setCookie);
    token = m ? decodeURIComponent(m[1]) : '';
  } else if (c.read === 'json') {
    try { token = (JSON.parse(text) || {})[c.readName] || ''; } catch (e) { /* not json */ }
  } else { // 'meta' — <meta name="csrf-token" content="...">
    const m = new RegExp("<meta[^>]+name=[\"']" + c.readName + "[\"'][^>]+content=[\"']([^\"']+)", 'i').exec(text);
    token = m ? m[1] : '';
  }
  return { token: token, cookie: (setCookie.split(';')[0] || '') };
}

// season query -> upstream ?season=N (N=0 means All-Time on BBC). Sanitised to
// a small non-negative integer; anything else is ignored (default season).
function rankingSeasonParam(query) {
  if (!query || query.season == null || query.season === '') return null;
  const n = parseInt(query.season, 10);
  return (Number.isInteger(n) && n >= 0 && n <= 999) ? n : null;
}

// Map the PokerTH leaderboard JSON to our generic row shape (rank/player/score/
// points/games). The official endpoint is POST-only with a JSON body and paginates.
function rankingParsePth(res) {
  const rows = (Array.isArray(res.data) ? res.data : []).map(function (r, i) {
    return {
      rank: (r.rank_pos != null ? r.rank_pos : i + 1),
      player: r.username,
      score: r.final_score,       // already a formatted decimal string (e.g. "173.27")
      points: r.points_sum,
      games: r.season_games
    };
  });
  let seasons = Array.isArray(res.seasons) ? res.seasons.slice() : [];
  if (seasons.indexOf('current') < 0) seasons.unshift('current');
  return { ok: true, source: 'PTH', rows: rows, seasons: seasons, total: (res.total != null ? res.total : rows.length) };
}

async function rankingUpstreamPth(src, query) {
  let season = String((query && query.season) || 'current').trim();
  if (!/^[A-Za-z0-9_]{1,16}$/.test(season)) season = 'current';
  const q = String((query && query.q) || '').trim().slice(0, 64);
  let page = parseInt((query && query.page) || '1', 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (page > 100000) page = 100000;
  const pageSize = src.pageSize || 50;
  const payload = {
    page: page,
    pageSize: pageSize,
    sort: { prop: 'rank_pos', order: 'descending' },
    filters: q ? { value: q, props: 'username' } : null
  };
  const r = await rankingFetch(src.leaderboard + encodeURIComponent(season), {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json'
  }, { method: 'POST', body: JSON.stringify(payload) });
  const body = await r.text();
  if (!r.ok) return { status: 502, body: JSON.stringify({ ok: false, error: 'upstream_' + r.status, source: src.name }) };
  let json;
  try { json = JSON.parse(body); } catch (e) { return { status: 502, body: JSON.stringify({ ok: false, error: 'parse_failed', source: src.name }) }; }
  let parsed;
  try { parsed = src.parse(json); }
  catch (e) { return { status: 502, body: JSON.stringify({ ok: false, error: 'map_failed', source: src.name }) }; }
  parsed.season = season;
  parsed.page = page;
  parsed.pageSize = pageSize;
  return { status: 200, body: JSON.stringify(parsed) };
}

async function rankingUpstream(src, query) {
  if (src.json && src.leaderboard) return rankingUpstreamPth(src, query);
  if (!src.url) {
    return { status: 503, body: JSON.stringify({ ok: false, error: 'endpoint_not_configured', source: src.name }) };
  }
  let url = src.url;
  if (src.supportsSeason) {
    const sn = rankingSeasonParam(query);
    if (sn != null) url += (url.indexOf('?') < 0 ? '?' : '&') + 'season=' + sn;
  }
  const headers = {};
  // HTML-scraped sources (e.g. BBC) must receive the rendered page, not a
  // JSON negotiation — ask for HTML explicitly.
  if (src.parse) headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
  if (src.csrf && src.csrf.url) {
    const tok = await rankingCsrfToken(src);
    if (tok.token && src.csrf.send === 'header') headers[src.csrf.sendName] = tok.token;
    // 'query' / 'form' send variants: wire once the real flow is known (TODO).
    if (tok.cookie) headers['Cookie'] = tok.cookie;
  }
  const r = await rankingFetch(url, headers);
  const body = await r.text();
  if (!r.ok) {
    return { status: 502, body: JSON.stringify({ ok: false, error: 'upstream_' + r.status, source: src.name }) };
  }
  // Source-specific extractor (e.g. BBC scrapes its server-rendered page);
  // sources without a parser are passed through as-is (already JSON).
  if (typeof src.parse === 'function') {
    let parsed;
    try { parsed = src.parse(body); }
    catch (e) { return { status: 502, body: JSON.stringify({ ok: false, error: 'parse_failed', source: src.name }) }; }
    return { status: 200, body: JSON.stringify(parsed) };
  }
  return { status: 200, body: body };
}

function handleRanking(req, res, query) {
  const key = String((query && query.src) || '').toLowerCase();
  const src = RANKING_SOURCES[key];
  if (!src) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'unknown_source', allowed: Object.keys(RANKING_SOURCES) }));
    return;
  }
  const cacheKey = key + '|' + (req.url.split('?')[1] || '');
  const hit = RANKING_CACHE.get(cacheKey);
  if (hit && (Date.now() - hit.at) < RANKING_TTL_MS) {
    res.writeHead(hit.status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=30', 'X-Ranking-Cache': 'hit' });
    res.end(hit.body);
    return;
  }
  rankingUpstream(src, query).then(function (out) {
    RANKING_CACHE.set(cacheKey, { at: Date.now(), status: out.status, body: out.body });
    res.writeHead(out.status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=30', 'X-Ranking-Cache': 'miss' });
    res.end(out.body);
  }).catch(function (err) {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'relay_failed', detail: String((err && err.message) || err) }));
  });
}


// ── Player profile relay (clicking a name in the ranking) ──────────────────
// BBC renders the full profile card server-side at /player/{nickname} as Vue
// props (:player, :stats, :awards, :season), HTML-entity-encoded JSON. A plain
// GET + decode is enough (no CSRF). We normalise it to a flat, source-agnostic
// shape so the client renderer stays trivial and WEC can plug in later.
// Shared profile normaliser. Each source renders /player/{nick} server-side as
// Vue props (:player, :stats, :awards), HTML-entity-encoded JSON. We flatten to
// a source-agnostic shape: a `stats` array of labelled blocks, so BBC (season +
// all-time) and WEC (month + year + all-time) both render via one client path.
// Tickets are BBC-only (Step 2/3/4); null when the source has none.
function playerStatBlock(b, label) {
  if (!b || typeof b !== 'object') return null;
  return {
    label: label,
    rank: (b.pos != null ? b.pos : null),
    score: (b.score != null ? b.score : null),
    games: (b.games != null ? b.games : null),
    points: (b.points != null ? b.points : null)
  };
}
function playerNorm(html, base, source, statMap) {
  function prop(name) {
    const m = new RegExp(':' + name + '="([^"]*)"').exec(html);
    return m ? m[1] : null;
  }
  function jprop(name) {
    const raw = prop(name);
    if (raw == null) return null;
    try { return JSON.parse(rankingDecodeHtml(raw)); } catch (e) { return null; }
  }
  const player = jprop('player');
  if (!player || player.nickname == null) return { ok: false, error: 'no_player', source: source };
  const statsObj = jprop('stats') || {};
  const awardsRaw = jprop('awards');
  const awards = (Array.isArray(awardsRaw) ? awardsRaw : []).map(function (a) {
    let img = (a && a.filename) ? String(a.filename) : '';
    if (img && img.charAt(0) === '/') img = base + img;
    return { img: img, title: (a && a.title) || '' };
  }).filter(function (a) { return a.img; });
  const stats = [];
  for (let i = 0; i < statMap.length; i++) {
    const blk = playerStatBlock(statsObj[statMap[i].field], statMap[i].label);
    if (blk) stats.push(blk);
  }
  const tickets = (player.s2_tickets != null || player.s3_tickets != null || player.s4_tickets != null)
    ? { s2: player.s2_tickets || 0, s3: player.s3_tickets || 0, s4: player.s4_tickets || 0 }
    : null;
  return {
    ok: true,
    source: source,
    nickname: player.nickname,
    memberSince: (player.created_at ? String(player.created_at).slice(0, 10) : null),
    tickets: tickets,
    awards: awards,
    stats: stats
  };
}
function playerParseBbc(html, base) {
  return playerNorm(html, base, 'BBC', [
    { field: 'season', label: 'rankingThisSeason' },
    { field: 'alltime', label: 'rankingAllTime' }
  ]);
}
function playerParseWec(html, base) {
  return playerNorm(html, base, 'WEC', [
    { field: 'month', label: 'rankingThisMonth' },
    { field: 'year', label: 'rankingThisYear' },
    { field: 'alltime', label: 'rankingAllTime' }
  ]);
}

// PokerTH official profile: JSON (no CSRF). Single "current season" block,
// no awards/tickets. Scores in player.ranking are integers x100 -> /100.
function playerParsePth(json, base) {
  if (!json || !json.status || !json.player) return { ok: false, error: 'no_player', source: 'PTH' };
  const p = json.player;
  const r = p.ranking || {};
  function sc(v) { return (v == null) ? null : (Number(v) / 100).toFixed(2); }
  const block = {
    label: 'rankingThisSeason',
    rank: (json.pos != null && json.pos > 0 ? json.pos : null),
    score: sc(r.final_score),
    games: (r.season_games != null ? r.season_games : null),
    points: (r.points_sum != null ? r.points_sum : null)
  };
  const hasStats = (block.rank != null || block.score != null || block.games != null || block.points != null);
  return {
    ok: true,
    source: 'PTH',
    nickname: p.username,
    memberSince: (p.created ? String(p.created).slice(0, 10) : null),
    tickets: null,
    awards: [],
    stats: hasStats ? [block] : []
  };
}

const PLAYER_SOURCES = {
  bbc: { name: 'BBC', base: 'https://bbc.pokerth.net', url: function (b, n) { return b + '/player/' + encodeURIComponent(n); }, parse: playerParseBbc },
  wec: { name: 'WEC', base: 'https://wec.pokerth.net', url: function (b, n) { return b + '/player/' + encodeURIComponent(n); }, parse: playerParseWec },
  pth: { name: 'PokerTH', base: 'https://www.pokerth.net', url: function (b, n) { return b + '/pthranking/player/show?username=' + encodeURIComponent(n); }, json: true, parse: playerParsePth }
};

async function playerUpstream(src, nick) {
  const targetUrl = src.url(src.base, nick);
  const r = await rankingFetch(targetUrl, { 'Accept': src.json ? 'application/json, text/plain, */*' : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' });
  const body = await r.text();
  if (r.status === 404) return { status: 404, body: JSON.stringify({ ok: false, error: 'player_not_found', source: src.name }) };
  if (!r.ok) return { status: 502, body: JSON.stringify({ ok: false, error: 'upstream_' + r.status, source: src.name }) };
  let parsed;
  try { parsed = src.json ? src.parse(JSON.parse(body), src.base) : src.parse(body, src.base); }
  catch (e) { return { status: 502, body: JSON.stringify({ ok: false, error: 'parse_failed', source: src.name }) }; }
  return { status: (parsed && parsed.ok === false) ? 404 : 200, body: JSON.stringify(parsed) };
}

function handlePlayer(req, res, query) {
  const key = String((query && query.src) || '').toLowerCase();
  const src = PLAYER_SOURCES[key];
  if (!src) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'unknown_source', allowed: Object.keys(PLAYER_SOURCES) }));
    return;
  }
  const nick = String((query && query.nick) || '').trim();
  if (!nick) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'missing_nick' }));
    return;
  }
  const cacheKey = 'player|' + key + '|' + nick.toLowerCase();
  const hit = RANKING_CACHE.get(cacheKey);
  if (hit && (Date.now() - hit.at) < RANKING_TTL_MS) {
    res.writeHead(hit.status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=30', 'X-Ranking-Cache': 'hit' });
    res.end(hit.body);
    return;
  }
  playerUpstream(src, nick).then(function (out) {
    RANKING_CACHE.set(cacheKey, { at: Date.now(), status: out.status, body: out.body });
    res.writeHead(out.status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=30', 'X-Ranking-Cache': 'miss' });
    res.end(out.body);
  }).catch(function (err) {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'relay_failed', detail: String((err && err.message) || err) }));
  });
}


const httpServer = http.createServer((req, res) => {
  // Serve the SPA shell for the root path. We strip the query string
  // before comparing so deep links like
  //   /?host=pokerth.ddns.net&port=7234&tls=0&table=106
  // (produced by the "copy table link" feature) still resolve to the
  // index HTML instead of falling through to the static-file branch
  // and 404'ing on a nonexistent file named "/?host=...".
  const reqPathOnly = req.url.split('?')[0];
  const query = url.parse(req.url, true).query;
  if (reqPathOnly === '/admin' || reqPathOnly === '/admin.html' || reqPathOnly.indexOf('/admin/') === 0) {
    handleAdmin(req, res, reqPathOnly, url.parse(req.url, true).query);
    return;
  }
  if (reqPathOnly === '/' || reqPathOnly === '/index.html') {
    const p = path.join(__dirname, 'public', 'pokerth-client.html');
    if (fs.existsSync(p)) {
      return sendFile(req, res, p, 'text/html; charset=utf-8', 'no-store, no-cache, must-revalidate');
    }
  }

  // Friendly path for the pack-creator Studio, mirroring /admin -> admin.html.
  if (reqPathOnly === '/privacy' || reqPathOnly === '/privacy.html') {
    const p = path.join(PUBLIC_DIR, 'privacy.html');
    if (fs.existsSync(p)) return sendFile(req, res, p, 'text/html; charset=utf-8', 'no-store');
    res.writeHead(404); res.end('privacy.html missing'); return;
  }
  if (reqPathOnly === '/studio' || reqPathOnly === '/studio.html') {
    const p = path.join(PUBLIC_DIR, 'studio.html');
    if (fs.existsSync(p)) return sendFile(req, res, p, 'text/html; charset=utf-8', 'no-store');
    res.writeHead(404); res.end('studio.html missing'); return;
  }

  // ── Version marker for the in-app update banner ──
  // Returns the newest mtime across the core assets. A deploy (git pull)
  // bumps these file mtimes, so the page can poll this cheaply and offer a
  // one-tap reload when it changes. Never cached.
  if (reqPathOnly === '/__ver') {
    let newest = 0;
    ['pokerth.js', 'pokerth.css', 'pokerth-client.html',
     'modules/i18n.mjs', 'modules/sounds.mjs', 'sw.js'].forEach(function (f) {
      try {
        const s = fs.statSync(path.join(__dirname, 'public', f));
        if (s.mtimeMs > newest) newest = s.mtimeMs;
      } catch (e) { /* missing file — ignore */ }
    });
    // Per-language catalogue files live in modules/lang/ — fold their mtimes
    // in too, so a translation-only deploy still bumps the update banner.
    try {
      const langDir = path.join(__dirname, 'public', 'modules', 'lang');
      fs.readdirSync(langDir).forEach(function (f) {
        try {
          const s = fs.statSync(path.join(langDir, f));
          if (s.mtimeMs > newest) newest = s.mtimeMs;
        } catch (e) { /* ignore */ }
      });
    } catch (e) { /* no lang dir yet — ignore */ }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ v: Math.floor(newest) }));
    return;
  }

  // ── Ranking relay (PokerTH / BBC / WEC) — see handleRanking above. ──
  if (reqPathOnly === '/api/ranking') {
    handleRanking(req, res, query);
    return;
  }
  if (reqPathOnly === '/api/player') {
    handlePlayer(req, res, query);
    return;
  }


  // ── Visit ping (anonymous traffic counter) ──
  // One beacon per browser session: { vid:"<random>" }. We never read the IP;
  // the id is a client-minted random token, hashed before storage. 204 reply.
  if (reqPathOnly === '/__visit') {
    if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
    readJsonBody(req, function (d) {
      try {
        if (d && d.mode) recordModeConnect(d.mode);
        else recordVisit(d && d.vid);
      } catch (e) { /* ignore a bad ping */ }
      res.writeHead(204, { 'Cache-Control': 'no-store' });
      res.end();
    });
    return;
  }

  // Public app config the client reads on load: which entry "modes" are enabled.
  if (reqPathOnly === '/app-config') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: true, modes: appModes(), welcome: _welcomePublic(), defaultTheme: _adminConfig.defaultTheme || '', defaults: _adminConfig.defaults || {}, loginDefaults: _adminConfig.loginDefaults || {}, tableDefaults: _adminConfig.tableDefaults || {}, tableNames: _adminConfig.tableNames || {}, serverName: _adminConfig.serverName || '', serverTagline: _adminConfig.serverTagline || '', pokerthnetServer: _activePokerthnetServer(), pokerthnetSource: _pokerthnetSource() }));
    return;
  }

  // Client-facing gallery manifests, with admin-disabled packages filtered out
  // (disabling hides a package from the theme picker without removing its files).
  if (reqPathOnly === '/table/tables.json' || reqPathOnly === '/cards/decks.json' || reqPathOnly === '/themes/themes.json' || reqPathOnly === '/seats/seats.json') {
    var _pkgKind = reqPathOnly === '/table/tables.json' ? 'table' : (reqPathOnly === '/themes/themes.json' ? 'theme' : (reqPathOnly === '/seats/seats.json' ? 'seat' : 'deck'));
    var _mfSub = _pkgKind === 'table' ? 'table' : (_pkgKind === 'theme' ? 'themes' : (_pkgKind === 'seat' ? 'seats' : 'cards'));
    var _mfName = _pkgKind === 'table' ? 'tables.json' : (_pkgKind === 'theme' ? 'themes.json' : (_pkgKind === 'seat' ? 'seats.json' : 'decks.json'));
    var _mf = path.join(PUBLIC_DIR, _mfSub, _mfName);
    var _list = []; try { _list = JSON.parse(fs.readFileSync(_mf, 'utf8')); } catch (e) {}
    if (!Array.isArray(_list)) _list = [];
    var _dis = pkgDisabledSet(_pkgKind);
    if (_dis.length) _list = _list.filter(function (x) { return x && _dis.indexOf(x.id) < 0; });
    if (_pkgKind === 'table') { var _full = pkgFullSet('table'), _fscr = pkgFullscreenSet('table'), _alg = pkgAlignMap('table'); if (_full.length || _fscr.length || Object.keys(_alg).length) _list = _list.map(function (x) { if (!x) return x; var y = Object.assign({}, x); if (_fscr.indexOf(x.id) >= 0) { y.fullscreen = true; y.full = false; y.mode = 'fullscreen'; } else if (_full.indexOf(x.id) >= 0) { y.full = true; y.fullscreen = false; y.mode = 'full'; } if (_alg[x.id]) y.align = _alg[x.id]; return y; }); }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(_list));
    return;
  }

  // Client-facing music manifest: built-ins (minus hidden) + active admin tracks,
  // composed server-side just like the deck/theme galleries above.
  if (reqPathOnly === '/music/tracks.json') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ version: 1, tracks: musicListForClient() }));
    return;
  }

  // ── Family leaderboard API ──
  // GET  /stats        → the full {name: snapshot} map (rendered as the board)
  // POST /stats {name,…}→ upsert one player's snapshot ({_delete:true} removes)
  if (reqPathOnly === '/stats') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(statsStore));
      return;
    }
    if (req.method === 'POST') {
      readJsonBody(req, function (d) {
        // Admin: wipe the whole leaderboard at once. Disabled unless
        // STATS_ADMIN_TOKEN is set; the request must echo the same token.
        if (d && d._resetAll) {
          if (!hasScope('leaderboard', query, d && d.token)) {
            res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end('{"ok":false,"error":"forbidden"}'); return;
          }
          wipeLeaderboard('manual endpoint');
          const k = statsPeriodKey(); if (k) { statsMeta.period = k; saveStatsMeta(); }
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
          res.end('{"ok":true,"reset":true}'); return;
        }
        if (!d || typeof d.name !== 'string' || !d.name.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' }); res.end('{"ok":false}'); return;
        }
        const name = d.name.trim().slice(0, 32);
        if (d._delete) {
          if (!hasScope('leaderboard', query, d && d.token)) {
            res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end('{"ok":false,"error":"forbidden"}'); return;
          }
          delete statsStore[name]; dbDeletePlayer(name);
        }
        else statsStore[name] = mergeSnapshot(statsStore[name], sanitizeSnapshot(d));
        saveStatsSoon();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end('{"ok":true}');
      });
      return;
    }
    res.writeHead(405); res.end('Method not allowed');
    return;
  }

  // Support subdirectories under public/ while preventing path traversal.
  // decodeURIComponent throws on malformed sequences (e.g. '%c0'); guard
  // against that so a single bad URL doesn't crash the request handler.
  const publicRoot = path.join(__dirname, 'public');
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    res.writeHead(400); res.end('Bad request'); return;
  }
  const candidate = path.normalize(path.join(publicRoot, urlPath));
  if (!candidate.startsWith(publicRoot + path.sep) && candidate !== publicRoot) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    const ext = path.extname(candidate).toLowerCase();
    const type = ext === '.css'  ? 'text/css; charset=utf-8'
           : ext === '.js'   ? 'application/javascript; charset=utf-8'
           : ext === '.mjs'  ? 'application/javascript; charset=utf-8'
           : ext === '.html' ? 'text/html; charset=utf-8'
           : ext === '.json' ? 'application/json; charset=utf-8'
           : ext === '.proto'? 'text/plain; charset=utf-8'
           : ext === '.txt'  ? 'text/plain; charset=utf-8'
           : ext === '.md'   ? 'text/markdown; charset=utf-8'
           : ext === '.map'  ? 'application/json; charset=utf-8'
           : ext === '.svg'  ? 'image/svg+xml'
           : ext === '.ico'  ? 'image/x-icon'
           : ext === '.png'  ? 'image/png'
           : ext === '.webp' ? 'image/webp'
           : ext === '.woff' ? 'font/woff'
           : ext === '.woff2'? 'font/woff2'
           : 'application/octet-stream';
    // CSS/JS/MJS must always revalidate so a deploy is picked up without a
    // hard refresh; static media (images/fonts) can still be cached a day.
    const cacheCtl = (ext === '.css' || ext === '.js' || ext === '.mjs')
      ? 'no-cache, must-revalidate'
      : 'public, max-age=86400';
    return sendFile(req, res, candidate, type, cacheCtl);
  }
  res.writeHead(404); res.end('Not found');
});

const wss = new WebSocket.Server({ server: httpServer });

console.log('\n╔═══════════════════════════════════════════════╗');
console.log('║     PokerTH WebSocket Proxy v2.4              ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('\n▶ Proxy : ws://localhost:' + PROXY_PORT + '  /  http://localhost:' + PROXY_PORT + '/');
console.log('▶ TLS   : ' + (FORCE_NOTLS ? 'DISABLED (--notls)' : 'ENABLED by default'));
console.log('▶ Certs : ' + (INSECURE_TLS ? 'verification DISABLED (--insecure)' : 'verification active'));
console.log('▶ Allow : ' + ALLOWED_HOSTS.join(', '));
console.log('▶ Ports : ' + ALLOWED_PORTS.join(', '));
console.log('\nTips:');
console.log('  • LAN server without TLS → uncheck TLS in the browser');
console.log('  • pokerth.net            → TLS checked, registered login needed');
console.log('\nWaiting for connections...\n');

// Set of all connected clients (used to relay reactions / avatars).
// The relay is SCOPED per upstream server (ws._relayKey = host:port) so a
// reaction/avatar sent at one table is never broadcast to clients connected
// to a different PokerTH server. Within the same upstream, PokerTH player ids
// are server-global, so cross-table delivery to the same server is harmless
// (an absent id simply renders nothing).
const _allClients = new Set();
// Hard ceiling on a relayed text frame (REACT:/AVATAR:/AVATARIMG:). AVATARIMG
// carries a base64 image; without a cap a client could push a multi-MB blob
// that we'd fan out to every peer — a cheap amplification/DoS vector.
const MAX_RELAY_BYTES = 32 * 1024;

// ── Throttle outbound TCP connections to PokerTH servers ──
// Avoids tripping per-IP anti-brute-force when many clients connect to the
// same server in quick succession through this proxy.
let   _lastConnAt = 0;        // timestamp of the last TCP connection opened
const MIN_CONN_GAP = 5000;    // ms minimum between two connections to the same server
                              // Bumped from 2500 → 5000 because some PokerTH
                              // server configurations (notably self-hosted
                              // instances with strict anti-brute-force) flag
                              // back-to-back Init messages from the same IP
                              // within 3-4 seconds as suspicious and return
                              // initBlocked. Five seconds gives the server
                              // enough cooldown between two distinct sessions
                              // (different browser tabs / mobile + desktop /
                              // PWA + browser) sharing the same public IP.

function _scheduleConn(fn) {
  const now  = Date.now();
  const _pc  = _adminConfig.proxyCfg;
  const gap  = (_pc && typeof _pc.connGapMs === 'number' && _pc.connGapMs >= 0 && _pc.connGapMs <= 30000) ? _pc.connGapMs : MIN_CONN_GAP;
  const wait = Math.max(0, (_lastConnAt + gap) - now);
  if (wait === 0) {
    _lastConnAt = now;
    fn();
  } else {
    console.log('[>] Connection deferred by ' + wait + 'ms (anti-throttle)');
    setTimeout(() => { _lastConnAt = Date.now(); fn(); }, wait);
  }
}

// ── Heartbeat + persistance de session ─────────────────────────────────
// Heartbeat ping/pong : quand un navigateur disparaît brutalement (coupure
// wifi, bascule réseau), aucun 'close' n'arrive avant le timeout TCP de l'OS.
// On ping chaque client ; ceux qui ne « pong » pas sont terminate() → leur
// ws.on('close') se déclenche.
//
// Persistance de session : au lieu de fermer la connexion PokerTH amont quand
// le navigateur se coupe, on la GARDE vivante quelques secondes (grâce), on
// tamponne les messages du serveur, et on REBRANCHE le nouveau WebSocket (même
// 'sid') dessus quand le client revient. Le serveur PokerTH ne voit aucune
// déconnexion ni nouvel Init → pas de collision de pseudo, pas de blocage IP,
// siège + tapis conservés. Sans 'sid' (anciens clients, directWS) → repli sur
// l'ancien comportement (fermeture immédiate de l'amont).
function _heartbeat() { this.isAlive = true; }

const _sessions = new Map();              // sid → S (session vivante)
const SESSION_GRACE_MS = 120000;          // garder l'amont 2 min après coupure navigateur
                                          // (un onglet mobile en arrière-plan est « gelé » par
                                          // l'OS : ni timer ni event réseau ne tournent jusqu'au
                                          // retour au premier plan — il faut une fenêtre large)
const SESSION_MAX_BUF  = 4 * 1024 * 1024; // plafond du tampon (octets) en attente de rebranchement

function _destroySession(S) {
  if (S.grace) { clearTimeout(S.grace); S.grace = null; }
  if (S.sid && _sessions.get(S.sid) === S) _sessions.delete(S.sid);
  try { S.sock && S.sock.destroy(); } catch (_) {}
  S.sock = null; S.buf = []; S.bufBytes = 0;
}

// Ouvre la connexion TCP/TLS amont vers PokerTH pour la session S.
function _openUpstream(S) {
  _scheduleConn(() => {
    dns.lookup(S.host, { family: 4 }, (err, addr) => {
      addr = err ? S.host : addr;
      const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(addr);
      const opts = { host: addr, port: S.port, ...(!isIp && { servername: S.host }) };
      const onConn = () => {
        S.connected = true;
        const info = S.useTls ? '(TLS ' + (S.sock.getCipher() ? S.sock.getCipher().name : '?') + ')' : '(raw TCP)';
        console.log('[+] Connected ' + info + ' → ' + addr + ':' + S.port);
      };
      S.sock = S.useTls
        ? tls.connect({ ...opts, rejectUnauthorized: !INSECURE_TLS }, onConn)
        : net.connect(opts, onConn);

      S.sock.on('data', chunk => {
        S.rxBuf = Buffer.concat([S.rxBuf, chunk]);
        while (S.rxBuf.length >= 4) {
          const msgLen = S.rxBuf.readUInt32BE(0);
          if (msgLen === 0 || msgLen > 2_000_000) {
            console.error('[-] Invalid frame (' + msgLen + ') – closing');
            try { S.ws && S.ws.close(1011, 'bad frame'); } catch (_) {}
            _destroySession(S); return;
          }
          if (S.rxBuf.length < 4 + msgLen) break;
          const frame   = S.rxBuf.slice(0, 4 + msgLen);
          const payload = S.rxBuf.slice(4, 4 + msgLen);
          S.rxBuf = S.rxBuf.slice(4 + msgLen);
          S.n++;
          const d = describeMsg(payload);
          console.log('[S→C] #' + S.n + ' ' + d.name + ' (' + msgLen + 'b)' + d.extra);
          if (msgLen <= 64 || d.name.includes('Error') || d.name === '?' || d.name.includes('Flop') || d.name.includes('Turn') || d.name.includes('River') || d.name.includes('Hand'))
            console.log('      hex: ' + payload.toString('hex'));
          // Navigateur attaché → envoyer ; sinon (session en attente) → tamponner.
          if (S.ws && S.ws.readyState === WebSocket.OPEN) {
            S.ws.send(frame);
          } else if (S.sid) {
            S.buf.push(frame); S.bufBytes += frame.length;
            while (S.bufBytes > SESSION_MAX_BUF && S.buf.length) { S.bufBytes -= S.buf.shift().length; }
          }
        }
      });

      S.sock.on('error', err => {
        let hint = err.code === 'ECONNREFUSED'           ? '  → is the PokerTH server up?'
                 : err.message.includes('wrong version') ? '  → server without TLS: uncheck TLS'
                 : err.code === 'ECONNRESET'             ? '  → connection abruptly cut' : '';
        console.error('[-] Socket error: ' + err.message + hint);
        try { S.ws && S.ws.close(1011, err.message); } catch (_) {}
        _destroySession(S);
      });

      S.sock.on('close', () => {
        console.log('[-] Server closed (' + S.n + ' msg received)');
        const w = S.ws;
        _destroySession(S);
        if (w) setTimeout(() => { try { w.close(); } catch (_) {} }, 300);
      });
    });
  });
}

// Branche un WebSocket navigateur sur la session S (relais navigateur→serveur,
// relais des réactions, gestion de la fermeture avec délai de grâce).
function _attachWs(S, ws) {
  S.ws = ws;
  // Relay scope = the upstream this socket is bridged to. Reactions/avatars
  // only fan out to peers sharing the same host:port.
  ws._relayKey = S.host + ':' + S.port;
  _allClients.add(ws);
  // If a restart is currently scheduled, tell this freshly-attached client too.
  if (_restartAt > Date.now() && _restartNotice) { try { ws.send(_restartNotice); } catch (e) {} }

  ws.on('message', (data, isBinary) => {
    if (!isBinary) {
      const text = data.toString();
      if (text.startsWith('REACT:') || text.startsWith('AVATAR:') || text.startsWith('AVATARIMG:')) {
        // Drop oversized relays (mainly AVATARIMG base64) before fan-out.
        if (Buffer.byteLength(text) > MAX_RELAY_BYTES) {
          console.warn('[!] Dropped oversized relay frame (' + Buffer.byteLength(text) + 'b) from ' + (ws._relayKey || '?'));
          return;
        }
        _allClients.forEach(client => {
          if (client !== ws && client.readyState === 1 && client._relayKey === ws._relayKey) client.send(text);
        });
        return;
      }
    }
    if (!S.connected || !S.sock || !S.sock.writable) return;
    const buf = Buffer.from(isBinary ? data : data.toString());
    if (buf.length >= 4) {
      const d = describeMsg(buf.slice(4, 4 + buf.readUInt32BE(0)));
      console.log('[C→S] ' + d.name + ' (' + buf.readUInt32BE(0) + 'b)');
      if (buf.readUInt32BE(0) <= 32) console.log('      hex: ' + buf.slice(4).toString('hex'));
    }
    S.sock.write(buf);
  });

  ws.on('close', code => {
    _allClients.delete(ws);
    if (S.ws !== ws) return;   // déjà remplacé par un rebranchement → rien à faire
    S.ws = null;
    // Code 4001 = déconnexion VOLONTAIRE côté client (bouton quitter/déco) :
    // on ferme la session amont tout de suite pour libérer le joueur/pseudo
    // sur PokerTH, sans grâce (sinon le joueur reste un « fantôme » ~2 min).
    var intentional = (code === 4001);
    if (!intentional && S.sid && S.sock && !S.sock.destroyed) {
      var _pcg = _adminConfig.proxyCfg;
      var graceMs = (_pcg && typeof _pcg.graceSec === 'number' && _pcg.graceSec >= 10 && _pcg.graceSec <= 900) ? _pcg.graceSec * 1000 : SESSION_GRACE_MS;
      console.log('[~] Browser off (code ' + code + ') — session ' + S.sid.slice(0, 8) + ' gardée ' + (graceMs / 1000) + 's en attente de rebranchement');
      clearTimeout(S.grace);
      S.grace = setTimeout(() => {
        console.log('[-] Grace expirée → fermeture session ' + S.sid.slice(0, 8) + '\n');
        _destroySession(S);
      }, graceMs);
    } else {
      console.log((intentional ? '[x] Déconnexion volontaire (code 4001) — fermeture immédiate' : '[-] Browser off (code ' + code + ')') + (S.sid ? ' — session ' + S.sid.slice(0, 8) : '') + '\n');
      _destroySession(S);
    }
  });

  ws.on('error', err => { console.error('[-] WS: ' + err.message); });
}

wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.on('pong', _heartbeat);
  const params = new URLSearchParams(url.parse(req.url).query);
  const host   = params.get('host') || 'pokerth.net';
  const port   = parseInt(params.get('port') || '7234', 10);
  const useTls = params.get('tls') !== '0' && !FORCE_NOTLS;
  const sid    = params.get('sid') || null;

  // ── Reject hosts outside the allowlist ──
  if (!isHostAllowed(host)) {
    console.warn('[!] Rejected connection to non-allowed host: ' + host + ':' + port);
    try { ws.close(4403, 'Host not in allowlist'); } catch (_) {}
    return;
  }
  if (!isPortAllowed(port)) {
    console.warn('[!] Rejected connection to non-allowed port: ' + host + ':' + port);
    try { ws.close(4403, 'Port not in allowlist'); } catch (_) {}
    return;
  }

  // ── Rebranchement sur une session vivante (même sid) ──
  if (sid && _sessions.has(sid)) {
    const S = _sessions.get(sid);
    if (S.sock && !S.sock.destroyed) {
      console.log('──────────────────────────────────────');
      console.log('[~] Rebranchement session ' + sid.slice(0, 8) + ' (' + S.buf.length + ' frames en tampon)');
      if (S.grace) { clearTimeout(S.grace); S.grace = null; }
      if (S.ws && S.ws !== ws) { _allClients.delete(S.ws); try { S.ws.terminate(); } catch (_) {} }
      _attachWs(S, ws);
      for (const f of S.buf) { if (ws.readyState === WebSocket.OPEN) ws.send(f); }
      S.buf = []; S.bufBytes = 0;
      return;
    }
    _sessions.delete(sid); // session morte → on ouvre une connexion neuve
  }

  // ── Nouvelle connexion amont ──
  console.log('──────────────────────────────────────');
  console.log('[>] ' + (useTls ? 'TLS' : 'TCP') + ' → ' + host + ':' + port + (sid ? ' (sid ' + sid.slice(0, 8) + ')' : ''));
  const S = { sid, host, port, useTls, sock: null, ws: null, connected: false,
              rxBuf: Buffer.alloc(0), n: 0, buf: [], bufBytes: 0, grace: null };
  if (sid) _sessions.set(sid, S);
  _attachWs(S, ws);
  _openUpstream(S);
});

const HEARTBEAT_MS = 10000; // ping toutes les 10 s
const _heartbeatTimer = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('[-] Heartbeat timeout → terminating dead client');
      try { ws.terminate(); } catch (_) {}  // → ws.on('close') → grâce (session) ou destroy
      return;
    }
    ws.isAlive = false;
    try { ws.ping(); } catch (_) {}
  });
}, HEARTBEAT_MS);
wss.on('close', () => clearInterval(_heartbeatTimer));

// ── Démarrage du serveur, résilient au port occupé (EADDRINUSE) ──────────
// Lors d'un redémarrage rapide (pm2 restart), l'ancienne instance n'a parfois
// pas encore libéré le port → EADDRINUSE. Plutôt que crasher en boucle, on
// réessaie quelques fois ; si ça persiste (vraie instance concurrente), on sort
// proprement et on laisse PM2 appliquer son backoff.
let _listenRetries = 0;
const _MAX_LISTEN_RETRIES = 6;
const _LISTEN_RETRY_MS = 2000;
httpServer.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE' && _listenRetries < _MAX_LISTEN_RETRIES) {
    _listenRetries++;
    console.error('[!] Port ' + PROXY_PORT + ' occupé (EADDRINUSE) — tentative '
      + _listenRetries + '/' + _MAX_LISTEN_RETRIES + ' dans ' + (_LISTEN_RETRY_MS / 1000)
      + ' s (l\'ancienne instance libère peut-être le port)…');
    setTimeout(() => { try { httpServer.listen(PROXY_PORT); } catch (_) {} }, _LISTEN_RETRY_MS);
    return;
  }
  console.error('[-] Impossible de démarrer le serveur sur le port ' + PROXY_PORT + ' : '
    + (err && err.message ? err.message : err));
  console.error('    → vérifie qu\'aucune autre instance ne tourne : ss -ltnp | grep ' + PROXY_PORT);
  process.exit(1);
});
// ── Arrêt propre (SIGTERM/SIGINT) ──────────────────────────────────────
// PM2 envoie SIGINT au restart ; sans handler, l'OS libère le port d'écoute
// seulement à la mort du process → court battement où le nouveau process voit
// EADDRINUSE (rattrapé par le retry ci-dessus). En fermant httpServer nous-
// mêmes, le socket d'écoute est rendu DÈS l'appel à close(), donc le rebind est
// immédiat. Le setTimeout est un filet : si des connexions traînent au-delà
// d'1 s, on sort quand même avant le SIGKILL de PM2 (kill_timeout ≈ 1,6 s).
let _shuttingDown = false;
function _shutdown(sig) {
  if (_shuttingDown) return;
  _shuttingDown = true;
  console.log('[x] ' + sig + ' reçu — arrêt propre…');
  try { clearInterval(_heartbeatTimer); } catch (_) {}
  try { httpServer.close(() => process.exit(0)); } catch (_) { process.exit(0); }
  setTimeout(() => process.exit(0), 1000).unref();
}
process.on('SIGTERM', () => _shutdown('SIGTERM'));
process.on('SIGINT',  () => _shutdown('SIGINT'));

httpServer.listen(PROXY_PORT, () => {
  _listenRetries = 0;
  console.log('Ready → http://localhost:' + PROXY_PORT + '/\n');
});
