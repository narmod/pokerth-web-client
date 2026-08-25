/**
 * PokerTH WebSocket <-> TLS/TCP Proxy v2.4
 *
 * Environment variables:
 *   ALLOWED_HOSTS   — comma-separated list of EXTRA upstream hosts the proxy
 *                     may dial out to. These are ADDED to the built-in core
 *                     hosts (public/demo PokerTH servers + loopback), which are
 *                     ALWAYS allowed — setting ALLOWED_HOSTS no longer drops
 *                     them (previously it replaced the defaults, which silently
 *                     removed localhost / pokerth.ddns.net and broke LAN/demo).
 *                     Any host outside the resulting allowlist receives a 4403
 *                     close code. Port stays gated (see ALLOWED_PORTS, 7234).
 *                     Example: ALLOWED_HOSTS="mybox.example.com,192.168.1.10"
 */

// Load .env if present (optional dep): lets pm2 / bare `node proxy.js` read the
// same .env file docker compose already uses. Never overrides real env vars.
// Missing module or missing file are both fine — env vars keep working as before.
try { require('dotenv').config(); } catch (_) { /* dotenv not installed */ }

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

// ── Logging ──
// Structured logs via pino when installed (optional dep, same graceful pattern
// as dotenv): every console.log/warn/error becomes one JSON line on stdout
// (level, time, pid) that pm2 captures — much easier to grep/parse when
// diagnosing disconnections. PLAIN_LOGS=1 (or pino missing) keeps the classic
// plain-text output. The in-memory ring buffer feeding /admin/logs is kept
// unchanged in BOTH modes, so the admin panel log view works exactly as before.
let _pino = null;
if (!/^(1|true|on|yes)$/i.test(String(process.env.PLAIN_LOGS || ''))) {
  try { _pino = require('pino')({ base: undefined, timestamp: require('pino').stdTimeFunctions.isoTime }); } catch (_) { /* not installed */ }
}
const _PINO_LEVEL = { log: 'info', warn: 'warn', error: 'error' };

// In-memory ring buffer of recent log lines, exposed (token-gated) at /admin/logs.
const LOG_RING = []; const LOG_MAX = 400;
['log', 'warn', 'error'].forEach(function (m) {
  const orig = console[m].bind(console);
  console[m] = function () {
    let line = '';
    try {
      const parts = Array.prototype.map.call(arguments, function (a) {
        if (typeof a === 'string') return a;
        try { return JSON.stringify(a); } catch (e) { return String(a); }
      });
      line = parts.join(' ');
      LOG_RING.push(new Date().toISOString() + ' [' + m + '] ' + line);
      if (LOG_RING.length > LOG_MAX) LOG_RING.shift();
    } catch (e) {}
    if (_pino) { try { _pino[_PINO_LEVEL[m]](line); return; } catch (e) {} }
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
  // Serveur de jeu officiel : 'pokerth.net' n'est que la façade web (derrière
  // Cloudflare, aucun serveur de jeu n'y écoute) — le serveur de partie est sur
  // pthsrv.pokerth.net (7234 clair / 7236 TLS), ce que confirme la serverlist
  // officielle. Sans lui ici, le mode « Internet / PokerTH.net » via proxy est
  // refusé d'office sur toute installation neuve.
  'pthsrv.pokerth.net',
  'pokerth.ddns.net',
  'localhost',
  '127.0.0.1',
  '::1'
];
// Les hôtes « cœur » (DEFAULT_ALLOWED_HOSTS : loopback + serveurs PokerTH
// officiels/démo) sont TOUJOURS autorisés. ALLOWED_HOSTS ne fait qu'AJOUTER des
// hôtes — il ne REMPLACE plus les défauts. Avant, dès qu'un .env fixait
// ALLOWED_HOSTS (ex. .env.example), localhost / 127.0.0.1 / ::1 / pokerth.ddns.net
// disparaissaient de l'allowlist → LAN et serveur de démo cassés, alors que
// /admin affiche « Always-allowed hosts: … » (désormais exact). Le port reste
// borné (ALLOWED_PORTS, 7234) : always-allow loopback ne rouvre pas de SSRF.
const _envAllowedHosts = process.env.ALLOWED_HOSTS
  ? process.env.ALLOWED_HOSTS.split(',').map(s => s.trim()).filter(Boolean)
  : [];
const ALLOWED_HOSTS = Array.from(new Set(
  DEFAULT_ALLOWED_HOSTS.concat(_envAllowedHosts).map(s => s.toLowerCase())
));

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
// 7234 = serveur PokerTH en clair, 7236 = même serveur en TLS (celui que
// publie la serverlist officielle). Les deux sont nécessaires pour joindre
// pthsrv.pokerth.net sans configuration manuelle.
const DEFAULT_ALLOWED_PORTS = [7234, 7236];
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
// STATS_RESET_PERIOD = off | daily | weekly | monthly | yearly (default: monthly).
// At startup and hourly, the current period (server local time) is compared to
// the marker persisted in stats.meta.json; when it rolls over, the shared
// leaderboard is wiped. Per-device session stats (browser localStorage) are
// never touched. STATS_ADMIN_TOKEN (optional) enables an on-demand reset via
// POST /stats {"_resetAll":true,"token":"…"}.
// Runtime admin config (reset period, ...) persisted next to stats; env is the fallback.
const ADMIN_CONFIG_FILE = process.env.ADMIN_CONFIG_FILE || path.join(__dirname, 'admin-config.json');
let _adminConfig = {};
try { _adminConfig = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf8')) || {}; } catch (e) { _adminConfig = {}; }
// ── Interrupteurs d'arrêt de fonctionnalité (kill switches) ───────────────
// Une fonctionnalité qui casse en production n'avait qu'une issue : redéployer.
// L'admin peut ici forcer une option à OFF pour tout le monde, tout de suite,
// sans toucher au code. Côté client, la case correspondante des Options
// avancées passe décochée et grisée, avec la mention « désactivé par l'admin ».
//
// Le catalogue est la seule source de vérité : il sert à la fois de liste
// présentée au tableau de bord et de liste blanche de validation, donc une clé
// arbitraire ne peut jamais entrer dans la configuration.
//
// N'y figurent que des options de sens POSITIF (cochée = fonctionnalité active) :
// couper une option « Désactiver X » reviendrait à activer X, l'inverse de ce
// qu'un interrupteur d'arrêt doit faire.
const FEATURE_SWITCHES = [
  { key: 'err_report', label: 'Client error reporting' },
  { key: 'polls', label: 'Product polls' },
  { key: 'hud_on', label: 'Stats HUD on player seats' },
  { key: 'show_odds', label: 'Odds in the Chances panel' },
  { key: 'chat_abbrev', label: 'Chat abbreviation glossary' },
  { key: 'anim_cards', label: 'Card animations' },
  { key: 'table_zoom', label: 'Table zoom (magnifier buttons)' },
  { key: 'zoom_follow', label: 'Zoom follows the active seat' },
  { key: 'browser_zoom', label: 'Browser pinch zoom on phone / tablet' },
  { key: 'pdb_auto', label: 'Automatic .pdb writing' },
  { key: 'log_on', label: 'Session logging' },
  { key: 'stats_track', label: 'Hand statistics recording' },
  { key: 'show_community', label: 'Ranking entry' },
  { key: 'community_content', label: 'Community content (BBC / WEC)' },
  { key: 'community_suggest', label: 'Suggest players in community games' },
  { key: 'lobby_chat', label: 'Lobby chat' },
  { key: 'keynav', label: 'Esc / Enter navigation outside the table' },
  { key: 'back_guard', label: 'Android back button guard' },
  { key: 'splash', label: 'Splash screen on startup' },
];
function featureOffList() {
  const a = _adminConfig && _adminConfig.featureOff;
  if (!Array.isArray(a)) return [];
  return a.filter(function (k) { return FEATURE_SWITCHES.some(function (f) { return f.key === k; }); });
}
function saveAdminConfig() { try { fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(_adminConfig)); } catch (e) { console.error('[admin] config write failed:', e.message); } }

// ── Verbosité des logs (quiet | normal | verbose) ──────────────────────────
// Par défaut le proxy loggue CHAQUE message relayé ([S→C]/[C→S] + dump hex),
// ce qui sature CPU/IO en forte charge. Ce réglage borne le volume :
//   quiet   → connexions/déconnexions/erreurs seulement (aucune ligne/message)
//   normal  → + 1 ligne/message (nom + taille), sans dump hex          [défaut]
//   verbose → + dump hexadécimal (comportement historique, idéal debug)
// Priorité : proxyCfg.logLevel (admin, à chaud) > env PROXY_LOG_LEVEL > 'normal'.
const LOG_LEVELS = { quiet: 0, normal: 1, verbose: 2 };
const _ENV_LOG_LEVEL = (function () {
  var v = String(process.env.PROXY_LOG_LEVEL || '').trim().toLowerCase();
  return (LOG_LEVELS[v] != null) ? v : null;
})();
function _logLevelName() {
  var px = _adminConfig && _adminConfig.proxyCfg;
  var v = px && px.logLevel;
  if (typeof v === 'string' && LOG_LEVELS[v.toLowerCase()] != null) return v.toLowerCase();
  if (_ENV_LOG_LEVEL) return _ENV_LOG_LEVEL;
  return 'normal';
}
function _logLevel() { return LOG_LEVELS[_logLevelName()]; }

// ── Plafond de connexions simultanées (soupape anti-surcharge) ─────────────
// Refuse proprement (close 4503) tout NOUVEAU pont de jeu au-delà de N ponts
// actifs. Les rebranchements de session et les canaux notify-only n'y arrivent
// pas. 0 (ou absent) = illimité.
// Priorité : proxyCfg.maxClients (admin, à chaud) > env PROXY_MAX_CLIENTS > 0.
function _maxClients() {
  var px = _adminConfig && _adminConfig.proxyCfg;
  var v = px && px.maxClients;
  var n = parseInt(v, 10);
  if (Number.isInteger(n) && n >= 0) return n;        // 0 explicite = illimité
  var e = parseInt(process.env.PROXY_MAX_CLIENTS || '', 10);
  if (Number.isInteger(e) && e > 0) return e;
  return 0;
}

// ── Limite de descripteurs de fichiers (Linux) ─────────────────────────────
// Chaque joueur = 2 sockets (WebSocket navigateur + amont TCP/TLS). La limite
// douce RLIMIT_NOFILE plafonne donc le nombre de joueurs simultanés. Lecture
// best-effort de /proc/self/limits ; renvoie null hors Linux.
function _fdInfo() {
  try {
    var txt = fs.readFileSync('/proc/self/limits', 'utf8');
    var m = /Max open files\s+(\d+|unlimited)\s+(\d+|unlimited)/.exec(txt);
    if (!m) return null;
    var soft = m[1], hard = m[2];
    var softN = (soft === 'unlimited') ? Infinity : parseInt(soft, 10);
    var players = Number.isFinite(softN) ? Math.max(0, Math.floor((softN - 64) / 2)) : Infinity;
    return { soft: soft, hard: hard, softN: Number.isFinite(softN) ? softN : null, approxPlayers: Number.isFinite(players) ? players : null };
  } catch (e) { return null; }
}

// ── Relais Discord du chat lobby ─────────────────────────────────────────────
// Parité avec le serveur officiel (ServerLobbyThread + DiscordWebhookSender,
// clé DiscordChatWebhookUrl) : les messages de chat LOBBY sont relayés vers un
// webhook Discord au format « **Joueur:** message ». Ici le relais vit dans le
// proxy et intercepte les ChatRequest au fil C→S : un message tapé = un POST,
// quel que soit le nombre de clients connectés (aucun doublon possible).
// URL configurée depuis la page admin (/admin/config) ; vide = désactivé.
const DISCORD_WEBHOOK_RE = /^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_\-]+$/;
function _discordChatUrl() {
  var u = _adminConfig && _adminConfig.discordChatWebhookUrl;
  u = String(u || '').trim();
  return DISCORD_WEBHOOK_RE.test(u) ? u : '';
}
// Garde-fou local : la limite des webhooks Discord est ~30 requêtes/min ;
// au-delà de 25 posts sur 60 s glissantes on jette (fire-and-forget, comme
// l'officiel qui n'a aucune file d'attente).
let _discordPostTimes = [];
function _postDiscordChat(name, text) {
  const url = _discordChatUrl(); if (!url) return;
  const now = Date.now();
  _discordPostTimes = _discordPostTimes.filter(function (t) { return now - t < 60000; });
  if (_discordPostTimes.length >= 25) return;
  _discordPostTimes.push(now);
  // allowed_mentions vide : le texte des joueurs ne peut pas pinger
  // @everyone/@here ni des rôles côté Discord (prudence absente de
  // l'officiel mais sans effet visible sur le rendu du message).
  const body = JSON.stringify({
    content: '**' + String(name || 'Player').slice(0, 32) + ':** ' + String(text || '').slice(0, 1500),
    allowed_mentions: { parse: [] },
  });
  try {
    const u = new URL(url);
    const rq = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      function (res) { res.resume(); if (res.statusCode >= 300) console.error('[discord] webhook HTTP ' + res.statusCode); }
    );
    rq.on('error', function (e) { console.error('[discord] webhook failed: ' + e.message); });
    rq.setTimeout(10000, function () { try { rq.destroy(); } catch (_) {} });
    rq.end(body);
  } catch (e) { console.error('[discord] webhook error: ' + e.message); }
}
// Espionne le flux client→serveur : retient le nom de session à l'Init
// (nickName champ 6 pour guest/unauth, ou « n=<user> » du SCRAM client-first
// champ 7 pour les comptes), puis relaie les ChatRequest SANS cible (= lobby ;
// le chat de partie et les messages privés ne sont jamais relayés, comme
// l'officiel).
function _discordTapC2S(S, payload) {
  try {
    const outer = pbDecode(payload);
    const mt = outer[1] ? outer[1][0] : null;
    if (mt === 2 && outer[3] && outer[3][0]) {                 // InitMessage (champ envelope 3)
      // Toujours parsé (pas seulement pour Discord) : le nom + le type de
      // login servent aussi à la synchronisation des préférences (phase 2).
      const init = pbDecode(outer[3][0]);
      let nick = null;
      if (init[6] && init[6][0]) nick = init[6][0].toString('utf8');
      else if (init[7] && init[7][0]) {
        const m = init[7][0].toString('utf8').match(/(?:^|,)n=([^,]+)/);
        if (m) nick = m[1].replace(/=2C/g, ',').replace(/=3D/g, '=');  // unescape saslname SCRAM
      }
      if (nick) S.chatNick = nick.slice(0, 32);
      // InitMessage.login (champ 5) : 0=guest, 1=authenticated, 2=unauthenticated.
      // Seul le login AUTHENTIFIÉ (compte enregistré, vérifié par le serveur
      // via SCRAM) ouvre droit à la sync des préférences.
      S.isAuthLogin = !!(init[5] && init[5][0] === 1);
    } else if (mt === 63 && outer[64] && outer[64][0]) {       // ChatRequestMessage (champ 64)
      if (!_discordChatUrl()) return;
      const cr = pbDecode(outer[64][0]);
      if (!cr[1] && !cr[2] && cr[3] && cr[3][0]) {             // ni targetGameId ni targetPlayerId = lobby
        _postDiscordChat(S.chatNick, cr[3][0].toString('utf8'));
      }
    }
  } catch (e) {}
}

// ── Sync des préférences liée au compte (phase 2, opt-in côté client) ──
// Un jeton de session n'est émis QUE lorsque le serveur PokerTH a accepté un
// login AUTHENTIFIÉ (InitAck après un Init de type authenticatedLogin) : le
// SCRAM a été vérifié par le vrai serveur, le proxy n'a fait qu'observer.
// Invités et logins non authentifiés n'obtiennent jamais de jeton.
const _syncTokens = new Map();   // token -> { name, exp }
function _syncTokenName(tok) {
  const e = _syncTokens.get(String(tok || ''));
  if (!e) return null;
  if (e.exp < Date.now()) { _syncTokens.delete(String(tok)); return null; }
  e.exp = Date.now() + 24 * 3600 * 1000;   // expiration GLISSANTE : chaque usage prolonge de 24 h
  return e.name;
}
const _prefsLastWrite = new Map();      // compte -> ts dernière écriture (rate-limit PUT /prefs)
const _prefsWebLastWrite = new Map();   // compte -> ts dernière écriture (rate-limit PUT /prefs-web)
setInterval(function () {   // purge périodique des jetons expirés + entrées de rate-limit
  const now = Date.now();
  _syncTokens.forEach(function (v, k) { if (v.exp < now) _syncTokens.delete(k); });
  _prefsLastWrite.forEach(function (ts, k) { if (now - ts > 3600 * 1000) _prefsLastWrite.delete(k); });
  _prefsWebLastWrite.forEach(function (ts, k) { if (now - ts > 3600 * 1000) _prefsWebLastWrite.delete(k); });
}, 3600 * 1000).unref();
const PREFS_DIR = process.env.PREFS_DIR || path.join(__dirname, 'prefs');
function _prefsFile(name) {
  return path.join(PREFS_DIR, crypto.createHash('sha1').update(String(name).toLowerCase()).digest('hex') + '.json');
}
// Blob « web-only » (réglages sans clé officielle) : fichier SÉPARÉ du config.xml
// pour que /prefs et /prefs-web n'écrivent jamais le même fichier (pas de course).
function _prefsWebFile(name) {
  return path.join(PREFS_DIR, crypto.createHash('sha1').update(String(name).toLowerCase()).digest('hex') + '.web.json');
}
function _issueSyncToken(S) {
  if (S.syncToken) return;
  S.syncToken = crypto.randomBytes(16).toString('hex');
  _syncTokens.set(S.syncToken, { name: S.chatNick, exp: Date.now() + 24 * 3600 * 1000 });
  const frame = 'SYNCTOK:' + S.syncToken;
  if (S.ws && S.ws.readyState === 1) { try { S.ws.send(frame); } catch (e) {} }
  else S.pendingTok = frame;
}
// ── PokerTH game-server registry (admin Layer A) — see /admin/servers ──
// Entries: { id, name, host, port, tls, sni, noverify }. A saved server is
// auto-added to the dial allowlist via isHostAllowed / isPortAllowed. TLS
// details (SNI name, per-server verification opt-out) live on the entry too —
// see _serverTlsOpts. The proxy remains a pure
// relay; it does NOT run or configure the dedicated game server itself.
function _serversList() { var a = _adminConfig && _adminConfig.servers; return Array.isArray(a) ? a : []; }
function _sanitizeServer(s) {
  if (!s || typeof s !== 'object') return null;
  var host = String(s.host || '').trim().toLowerCase().slice(0, 255);
  if (!host || !/^[a-z0-9._:-]+$/.test(host)) return null;
  var port = parseInt(s.port, 10); if (!(port >= 1 && port <= 65535)) port = 7234;
  var name = String(s.name || '').trim().slice(0, 40) || host;
  var id = String(s.id || '').trim().slice(0, 40) || ('srv_' + Math.random().toString(36).slice(2, 9));
  // Nom présenté en SNI et vérifié contre le certificat. Utile quand `host`
  // est une IP : Node vérifierait alors le certificat contre l'IP, qui n'est
  // presque jamais dans les SAN → ERR_TLS_CERT_ALTNAME_INVALID.
  var sni = String(s.sni || '').trim().toLowerCase().slice(0, 255);
  if (sni && !/^[a-z0-9.-]+$/.test(sni)) sni = '';
  // Pins SPKI facultatifs (rollover / serveurs tiers auto-signés) : jusqu'à 4
  // valeurs base64(sha256) de 44 caractères, tout le reste est ignoré.
  var pins = [];
  if (Array.isArray(s.pins)) {
    for (var pi = 0; pi < s.pins.length && pins.length < 4; pi++) {
      var pv = String(s.pins[pi] || '').trim();
      if (/^[A-Za-z0-9+\/]{43}=$/.test(pv) && pins.indexOf(pv) < 0) pins.push(pv);
    }
  }
  return { id: id, name: name, host: host, port: port, tls: !!s.tls,
           sni: sni, noverify: !!s.noverify, pins: pins };
}

// Options TLS propres à UN serveur enregistré. Deux besoins réels :
//  · `sni` — se connecter à une IP privée (ex. 10.7.7.150) tout en présentant
//    et en vérifiant le nom que le certificat couvre. La vérification reste
//    ACTIVE : c'est le nom vérifié qui change, pas le niveau de contrôle.
//  · `noverify` — certificat auto-signé ou expiré : on désarme la vérification
//    POUR CE SERVEUR SEULEMENT. Jamais globalement — un interrupteur global
//    (`--insecure`) affaiblirait silencieusement toutes les autres cibles.
// Renvoie les valeurs neutres si le couple host:port n'est pas enregistré.
function _serverTlsOpts(host, port) {
  var h = String(host || '').trim().toLowerCase();
  var pt = parseInt(port, 10);
  var list = _serversList();
  for (var i = 0; i < list.length; i++) {
    var e = list[i];
    if (e && String(e.host).toLowerCase() === h && parseInt(e.port, 10) === pt)
      return { sni: String(e.sni || ''), noverify: !!e.noverify };
  }
  return { sni: '', noverify: false };
}

// ── TLS public-key pinning (parity with PokerTH 2.1.6, src/net/tlspinning.cpp) ──
// The official lobby certificate is self-signed (CN=pokerth.net), so a CA chain
// check can never succeed there; upstream 2.1.6 authenticates the server through
// a pinned SubjectPublicKeyInfo hash instead: base64(sha256(DER SPKI)). Pins come
// from a built-in table (below) and from <TLSPin> elements of the official
// serverlist (several pins per host allow a key rollover). When at least one pin
// is known for a host, trust comes from the pin ALONE (rejectUnauthorized:false
// + explicit SPKI check after the handshake, exactly like upstream's verify
// callback which deliberately ignores `preverified`); a mismatch aborts the
// connection. Hosts WITHOUT any known pin keep the previous behaviour untouched
// (CA verification unless `noverify`/--insecure), so nothing regresses for
// registry entries with ordinary CA-issued certificates.
const BUILTIN_TLS_PINS = {
  // pokerth.net official server (RSA 4096, valid until 2036-07-31). Same value
  // as upstream tlspinning.cpp and serverlist <TLSPin> (sp0ck, 2026-08-03).
  'pthsrv.pokerth.net': ['hnyHDGXvmDBFU7MN5xXuiq4OaWWrnHNzqhKlEoSuAV4=']
};
const _TLS_PIN_RE = /^[A-Za-z0-9+\/]{43}=$/; // base64 of a 32-byte sha256

function _tlsPinsFor(host) {
  var h = String(host || '').trim().toLowerCase();
  var pins = (BUILTIN_TLS_PINS[h] || []).slice();
  function add(arr) {
    if (!Array.isArray(arr)) return;
    for (var i = 0; i < arr.length; i++) {
      var v = String(arr[i] || '').trim();
      if (_TLS_PIN_RE.test(v) && pins.indexOf(v) < 0) pins.push(v);
    }
  }
  var list = _serversList();
  for (var j = 0; j < list.length; j++) {
    var e = list[j];
    if (e && String(e.host).toLowerCase() === h) add(e.pins);
  }
  var auto = (typeof _serverlistCache !== 'undefined') && _serverlistCache.server;
  if (auto && String(auto.host).toLowerCase() === h) add(auto.pins);
  return pins;
}

// Post-handshake SPKI check. Returns '' when the peer key matches one of the
// pins, else a human-readable mismatch message (caller destroys the socket).
// Node exposes the DER SubjectPublicKeyInfo directly as `pubkey` on
// getPeerCertificate() — the very bytes upstream hashes via i2d_X509_PUBKEY.
function _verifyTlsPin(sock, pins) {
  try {
    var pc = sock.getPeerCertificate();
    var der = pc && pc.pubkey;
    if (!der || !der.length) return 'TLS pinning: peer public key unreadable';
    var pin = crypto.createHash('sha256').update(der).digest('base64');
    if (pins.indexOf(pin) >= 0) return '';
    return 'TLS pinning: server public key ' + pin + ' does not match any of the ' + pins.length + ' pinned key(s)';
  } catch (e) { return 'TLS pinning: check failed (' + ((e && e.message) || 'error') + ')'; }
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
// pokerth.net est servi derrière Cloudflare, qui renvoie un challenge 403 à
// tout client sans User-Agent plausible — or https.get n'en envoie aucun par
// défaut. Résultat observé : « Last fetch: http 403 » dans /admin, la source
// « auto » ne résolvait plus rien et le client retombait sur son défaut intégré.
var SERVERLIST_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 PokerTH-WebClient';
var SERVERLIST_MAX_HOPS = 3;                     // redirections suivies (301/302/307/308)
var SERVERLIST_TTL_MS = 30 * 60 * 1000;          // refetch cadence while 'auto'
var SERVERLIST_MAX_BYTES = 256 * 1024;           // raw download cap (anti-bomb)
var SERVERLIST_MAX_INFLATED = 1024 * 1024;       // inflated cap (anti-bomb)
var _serverlistCache = { server: null, fetchedAt: 0, fetching: false, error: '' };

function _pokerthnetSource() { var s = _adminConfig && _adminConfig.pokerthnetSource; return s === 'manual' ? 'manual' : 'auto'; }
// Transport of the Internet / PokerTH.net entry mode: 'direct' (browser dials
// wss://www.pokerth.net/pthlive itself — historical behavior, no session grace)
// or 'proxy' (bridge through this proxy — session persistence, buffered
// reconnect). Default 'direct' so existing installs keep their behavior.
function _internetTransport() { var t = _adminConfig && _adminConfig.internetTransport; return t === 'proxy' ? 'proxy' : 'direct'; }
function _serverlistUrl() { var u = _adminConfig && _adminConfig.serverlistUrl; u = String(u || '').trim(); return u || DEFAULT_SERVERLIST_URL; }
// PROXY protocol v1 (haproxy) toward the game server: when enabled, every
// upstream connection starts with a "PROXY TCP4 <client> <server> ..." line
// carrying the REAL browser IP, sent before TLS and before any PokerTH frame.
// The game server must be configured to expect it — otherwise the line is
// garbage to it and every connection dies. Hence: explicit toggle, default OFF.
function _proxyProtocolOn() { return !!(_adminConfig && _adminConfig.proxyProtocol); }
function _ppNorm(ip) { var s = String(ip || '').trim(); var m = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i); return m ? m[1] : s; }
function _ppHeader(S, dstAddr) {
  var srcA = _ppNorm(S.ip), dstA = _ppNorm(dstAddr);
  var sf = net.isIP(srcA), df = net.isIP(dstA);
  // v1 spec: both addresses must be valid and of the same family; otherwise
  // announce UNKNOWN (server then falls back to the socket address).
  if (!sf || !df || sf !== df) return 'PROXY UNKNOWN\r\n';
  var sp = (S.ipPort > 0 && S.ipPort < 65536) ? S.ipPort : 0;
  return 'PROXY ' + (sf === 6 ? 'TCP6' : 'TCP4') + ' ' + srcA + ' ' + dstA + ' ' + sp + ' ' + S.port + '\r\n';
}

// ── LAN / dedicated server policy (admin -> "Default login form") ──────────
// lanMode 'auto'   : the client keeps the address it remembers (falling back to
//                    the page's own address) — historical behavior;
// lanMode 'forced' : host / port / TLS chosen here are pre-filled on every load.
// In BOTH cases the fields stay editable: a player can always dial elsewhere.
// Backward compatibility: configs written before this setting existed only had
// `host`, whose "non-empty means impose it" semantics map to 'forced'.
// `pub` = the /app-config (client) view: nothing is exposed while in 'auto',
// so a stale address left in the admin form can never leak into the client.
function _loginDefaults(pub) {
  var L = (_adminConfig && _adminConfig.loginDefaults) || {};
  var lanMode = (L.lanMode === 'forced' || L.lanMode === 'auto') ? L.lanMode : (L.host ? 'forced' : 'auto');
  var forced = (lanMode === 'forced');
  var port = parseInt(L.lanPort, 10);
  if (!(Number.isInteger(port) && port >= 1 && port <= 65535)) port = 0;
  var show = forced || !pub;
  return {
    mode: L.mode || '',
    proxyUrl: L.proxyUrl || '',
    hideProxy: !!L.hideProxy,
    lanMode: lanMode,
    host: show ? (L.host || '') : '',
    lanPort: show ? port : 0,
    lanTls: show ? !!L.lanTls : false
  };
}

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
  // <TLSPin> (2.1.6+) : plusieurs éléments possibles pour un rollover de clé.
  var pins = [], _pre = /<TLSPin\s+[^>]*?value\s*=\s*"([^"]*)"/gi, _pm;
  while ((_pm = _pre.exec(b))) {
    var _pv = _pm[1].trim();
    if (/^[A-Za-z0-9+\/]{43}=$/.test(_pv) && pins.indexOf(_pv) < 0 && pins.length < 4) pins.push(_pv);
  }
  if (!host || !/^[a-z0-9._:-]+$/.test(host) || !(port >= 1 && port <= 65535)) return null;
  return { name: name.slice(0, 60), host: host.slice(0, 255), port: port, tls: tls, pins: pins };
}

function _doFetchServerlist(u, cb, _hops) {
  cb = cb || function () {};
  var hops = _hops | 0;
  var mod, opts, raw0 = '';
  try {
    raw0 = String(u || '').trim();
    if (raw0 && !/^https?:\/\//i.test(raw0)) raw0 = 'https://' + raw0;
    var parsed = new url.URL(raw0);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return cb({ ok: false, error: 'bad url scheme' });
    mod = parsed.protocol === 'https:' ? https : http;
    // En-têtes explicites (cf. SERVERLIST_UA) : sans User-Agent, Cloudflare
    // répond 403. 'identity' évite un double décodage (gzip HTTP + zlib du
    // .xml.z) qui casserait l'inflate plus bas.
    opts = {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      path: parsed.pathname + (parsed.search || ''),
      headers: {
        'User-Agent': SERVERLIST_UA,
        'Accept': '*/*',
        'Accept-Encoding': 'identity'
      }
    };
  } catch (e) { return cb({ ok: false, error: 'bad url' }); }
  var done = false;
  function finish(err, server) { if (done) return; done = true; if (err) return cb({ ok: false, error: err }); return cb({ ok: true, server: server }); }
  var rq;
  try {
    rq = mod.get(opts, function (resp) {
      // pokerth.net peut rediriger (http→https, apex→www) : suivre quelques
      // sauts, sinon un 301 remontait tel quel en « http 301 ».
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers && resp.headers.location && hops < SERVERLIST_MAX_HOPS) {
        var next = '';
        try { next = new url.URL(resp.headers.location, raw0).href; } catch (e) { next = ''; }
        resp.resume();
        if (!next) return finish('bad redirect');
        if (done) return;
        done = true;                                   // la suite est portée par le saut suivant
        return _doFetchServerlist(next, cb, hops + 1);
      }
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
// Cible réellement composée pour l'entrée « Internet / PokerTH.net », telle
// que le client la recevra via /app-config. Trois sources possibles et une
// seule vérité — l'admin devait jusqu'ici la reconstituer de tête à partir de
// (source Manual/Auto) × (radio actif) × (serverlist résolue ou non).
// `from` : 'serverlist' (auto) · 'manual' (entrée active) · 'builtin' (défaut
// intégré du client, pokerth.net:7234 — aucun serveur de jeu n'y écoute).
// Réglages TLS d'une requête /admin/servers/{probe,lobby} : ceux du corps s'ils
// sont présents (état non enregistré du formulaire), sinon ceux du registre.
function _tlsFromBody(d, host, port) {
  if (d && (typeof d.sni === 'string' || typeof d.noverify === 'boolean')) {
    var sni = String(d.sni || '').trim().toLowerCase().slice(0, 255);
    if (sni && !/^[a-z0-9.-]+$/.test(sni)) sni = '';
    return { sni: sni, noverify: !!d.noverify };
  }
  return _serverTlsOpts(host, port);
}

function _effectiveTarget() {
  var src = _pokerthnetSource();
  var srv = _activePokerthnetServer();
  var from = srv ? (src === 'auto' ? 'serverlist' : 'manual') : 'builtin';
  return {
    from: from,
    source: src,
    transport: _internetTransport(),
    name: srv ? (srv.name || '') : '',
    host: srv ? srv.host : 'pokerth.net',
    port: srv ? srv.port : 7234,
    tls: srv ? !!srv.tls : false,
    error: (src === 'auto' && !srv) ? (_serverlistCache.error || 'serverlist not resolved') : ''
  };
}

// ── PokerTH protocol (lobby status probes) — ESM bundle loaded async ──
let PROTO = null;
(function () {
  try {
    // Le bundle derive son BUILD_ID de globalThis.BUILD_VERSION (comme le
    // client derive le sien de window.BUILD_VERSION) : les probes annoncent
    // ainsi la meme version upstream que les vraies connexions de jeu.
    try { globalThis.BUILD_VERSION = require('./package.json').version; } catch (e) {}
    var _u = require('url').pathToFileURL(path.join(__dirname, 'public', 'proto', 'index.mjs')).href;
    import(_u).then(function (m) { PROTO = m; }).catch(function (e) { console.warn('[servers] proto bundle load failed:', e && e.message); });
  } catch (e) { console.warn('[servers] proto setup failed:', e && e.message); }
})();
// Headless guest lobby probe: connect, read AnnounceMessage (player count + protocol
// version, no login), then guest-login and count GameListNewMessage frames. Mirrors the
// web client's wire framing (4-byte big-endian length prefix + protobuf). Read-only;
// disconnects after a short quiet window or an overall timeout. cb(result).
function lobbyProbe(host, port, useTls, cb, tlsOverride) {
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
    // Le Check DOIT utiliser exactement les réglages de la vraie connexion de
    // jeu : forcer rejectUnauthorized:false ici donnerait un ✓ vert alors que
    // la partie échouerait ensuite en CERT_HAS_EXPIRED (piège du 24/07).
    var _t = tlsOverride || _serverTlsOpts(host, port);
    var _sni = _t.sni || (/^[0-9.]+$/.test(host) ? '' : host);
    var opts = { host: host, port: port };
    // Épinglage SPKI (2.1.6) : cert auto-signé → la confiance vient du pin seul.
    var _pins = useTls ? _tlsPinsFor(host) : [];
    sock = useTls
      ? tls.connect(Object.assign({ rejectUnauthorized: _pins.length ? false : !(INSECURE_TLS || _t.noverify) }, (_sni ? { servername: _sni } : {}), opts), function () {
          if (_pins.length) { var _pe = _verifyTlsPin(sock, _pins); if (_pe) { console.warn('[probe] ' + _pe); return finish('tls pin mismatch'); } }
        })
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
// Lecteur MP3 : interrupteur d'instance (admin -> onglet Music). Cle absente =
// actif, pour qu'une instance existante ne perde pas son lecteur a la mise a jour.
function musicEnabled() { return !(_adminConfig && _adminConfig.musicEnabled === false); }

// ── SEO / search-engine visibility — admin-controlled, OFF by default ──────
// A self-hosted install must never end up in Google by accident: when the
// option is off (default), the served HTML carries <meta name="robots"
// noindex,nofollow> and /robots.txt disallows everything. When the operator
// turns it on in /admin (Clients → Search engine visibility), the HTML gains
// description / Open Graph / Twitter cards / canonical / JSON-LD plus a
// crawler-readable text block, and /robots.txt, /sitemap.xml and /llms.txt
// are generated from the configured public URL. Everything is injected at
// serve time from the <!--__SEO_HEAD__--> / <!--__SEO_BODY__--> placeholders
// in pokerth-client.html — the file on disk stays neutral.
function _seoCfg() { var s = _adminConfig && _adminConfig.seo; return (s && typeof s === 'object') ? s : {}; }
function seoEnabled() { return _seoCfg().enabled === true; }
function seoPublicUrl() {
  var u = String(_seoCfg().publicUrl || '').trim().replace(/\/+$/, '');
  return /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : '';
}
function seoGsv() {
  // Google Search Console ownership token (meta tag method). Token charset is
  // strictly base64url-ish; anything else is dropped so the value can never
  // break out of the attribute it is injected into.
  var v = String(_seoCfg().googleVerification || '').trim();
  return /^[A-Za-z0-9_-]{1,100}$/.test(v) ? v : '';
}
function seoBingv() {
  // Bing Webmaster Tools ownership token (msvalidate.01 meta tag method).
  // Same strict charset policy as seoGsv().
  var v = String(_seoCfg().bingVerification || '').trim();
  return /^[A-Za-z0-9_-]{1,100}$/.test(v) ? v : '';
}
function seoYandex() {
  // Same strict charset policy as seoGsv().
  var v = String(_seoCfg().yandexVerification || '').trim();
  return /^[A-Za-z0-9_-]+$/.test(v) ? v : '';
}
// Operator branding. A self-hosted instance is not "PokerTH Web Client" in a
// search result, and until now it had no way to say otherwise: the title and
// description were compiled in. An override replaces the localized string in
// EVERY language — the operator writes one line, in one language, and it is
// their call. Empty means "keep the translated default", which is what
// pokerth.net wants.
function seoSiteName() { var v = String(_seoCfg().siteName || '').trim(); return v || 'PokerTH'; }
function seoTitleOverride() { return String(_seoCfg().title || '').trim(); }
function seoDescOverride() { return String(_seoCfg().description || '').trim(); }
// Social card image. A custom one is taken at face value: we do not know its
// dimensions, so og:image:width/height are emitted only for the bundled file,
// where we do. Announcing 1200×630 for an image that is not would make the
// card render wrong everywhere.
function seoImage(base) {
  var v = String(_seoCfg().image || '').trim();
  if (v) {
    if (/^https?:\/\//i.test(v)) return { url: v, sized: false };
    if (v.charAt(0) === '/') return base ? { url: base + v, sized: false } : { url: '', sized: false };
    return { url: '', sized: false };
  }
  return base ? { url: base + '/screenshots/social-preview.png', sized: true } : { url: '', sized: false };
}
// AI crawlers. Default true — the behaviour every existing install already
// has. Off writes an explicit Disallow for each named agent rather than
// staying silent, because silence under "User-agent: *  Allow: /" reads as
// consent.
function seoAiCrawlers() { return _seoCfg().aiCrawlers !== false; }
var SEO_AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web',
  'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot',
  'Bytespider', 'Meta-ExternalAgent', 'Amazonbot', 'cohere-ai'];
// Everything the operator can type ends up inside an HTML attribute. Escaping
// at emission, not at validation, is the version that cannot be forgotten when
// a new field is added.
function _seoAttr(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function _seoAdmin() { var s = _seoCfg(); return { enabled: s.enabled === true, publicUrl: String(s.publicUrl || ''), googleVerification: String(s.googleVerification || ''), bingVerification: String(s.bingVerification || ''), yandexVerification: String(s.yandexVerification || ''), siteName: String(s.siteName || ''), title: String(s.title || ''), description: String(s.description || ''), image: String(s.image || ''), aiCrawlers: s.aiCrawlers !== false, indexNowKey: String(s.indexNowKey || ''), indexNow: (function () { var i = _indexNowStat || {}; return { at: i.at || 0, status: i.status || 0, count: i.count || 0, error: i.error || '' }; })() }; }

var SEO_TITLE = 'PokerTH Web Client \u2014 Play Free Texas Hold\u2019em Poker in Your Browser';
var SEO_DESC = 'Play Texas Hold\u2019em poker free in your browser with PokerTH, the open-source poker game. ' +
  'No download, no ads, no registration \u2014 practice offline against bots, play on LAN or join pokerth.net. 45 languages, installable as an app (PWA).';


// ── hreflang — localized <title> + description for the 45 UI languages ────
// Each language variant lives at /?lang=<code>: the client applies the URL
// parameter at boot (without overwriting a manually saved choice), so a
// visitor landing from a localized search result gets the matching UI.
// Google requirements honoured: every variant self-canonicalizes and carries
// the full alternate set; 'en' folds onto the bare / URL (no /?lang=en
// duplicate). Codes are the catalogue codes of public/modules/lang/*.mjs.
var SEO_I18N = {
  en: { t: SEO_TITLE, d: SEO_DESC },
  fr: { t: 'PokerTH Web \u2014 Poker Texas Hold\u2019em gratuit dans votre navigateur', d: 'Jouez \u00e0 PokerTH, le jeu de poker Texas Hold\u2019em libre et gratuit, directement dans votre navigateur. Sans t\u00e9l\u00e9chargement, sans publicit\u00e9, sans inscription \u2014 entra\u00eenez-vous hors ligne contre des bots, jouez en LAN ou sur pokerth.net.' },
  de: { t: 'PokerTH Web-Client \u2014 Kostenloses Texas Hold\u2019em Poker im Browser', d: 'Spiele PokerTH, das freie Open-Source-Texas-Hold\u2019em-Pokerspiel, direkt im Browser. Kein Download, keine Registrierung \u2014 offline gegen Bots \u00fcben, im LAN spielen oder pokerth.net beitreten.' },
  es: { t: 'PokerTH Web \u2014 P\u00f3ker Texas Hold\u2019em gratis en tu navegador', d: 'Juega a PokerTH, el juego de p\u00f3ker Texas Hold\u2019em libre y gratuito, directamente en tu navegador. Sin descargas ni registro: practica sin conexi\u00f3n contra bots, juega en LAN o \u00fanete a pokerth.net.' },
  it: { t: 'PokerTH Web \u2014 Poker Texas Hold\u2019em gratuito nel browser', d: 'Gioca a PokerTH, il gioco di poker Texas Hold\u2019em libero e gratuito, direttamente nel browser. Nessun download, nessuna registrazione: allenati offline contro i bot, gioca in LAN o su pokerth.net.' },
  'pt-BR': { t: 'PokerTH Web \u2014 P\u00f4quer Texas Hold\u2019em gr\u00e1tis no seu navegador', d: 'Jogue PokerTH, o jogo de p\u00f4quer Texas Hold\u2019em livre e gratuito, direto no navegador. Sem download e sem cadastro: treine offline contra bots, jogue em LAN ou entre no pokerth.net.' },
  'pt-PT': { t: 'PokerTH Web \u2014 P\u00f3quer Texas Hold\u2019em gr\u00e1tis no navegador', d: 'Jogue PokerTH, o jogo de p\u00f3quer Texas Hold\u2019em livre e gratuito, diretamente no navegador. Sem transfer\u00eancias nem registo: pratique offline contra bots, jogue em LAN ou junte-se ao pokerth.net.' },
  nl: { t: 'PokerTH Web \u2014 Gratis Texas Hold\u2019em poker in je browser', d: 'Speel PokerTH, het gratis opensource Texas Hold\u2019em-pokerspel, direct in je browser. Geen download, geen registratie \u2014 oefen offline tegen bots, speel via LAN of op pokerth.net.' },
  pl: { t: 'PokerTH Web \u2014 Darmowy poker Texas Hold\u2019em w przegl\u0105darce', d: 'Graj w PokerTH, darmow\u0105 otwarto\u017ar\u00f3d\u0142ow\u0105 gr\u0119 w pokera Texas Hold\u2019em, bezpo\u015brednio w przegl\u0105darce. Bez pobierania i rejestracji \u2014 trenuj offline z botami, graj w sieci LAN lub na pokerth.net.' },
  ru: { t: 'PokerTH Web \u2014 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u043f\u043e\u043a\u0435\u0440 Texas Hold\u2019em \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435', d: '\u0418\u0433\u0440\u0430\u0439\u0442\u0435 \u0432 PokerTH \u2014 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u0443\u044e \u043f\u043e\u043a\u0435\u0440\u043d\u0443\u044e \u0438\u0433\u0440\u0443 Texas Hold\u2019em \u0441 \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u043c \u043a\u043e\u0434\u043e\u043c \u043f\u0440\u044f\u043c\u043e \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. \u0411\u0435\u0437 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438: \u0442\u0440\u0435\u043d\u0438\u0440\u0443\u0439\u0442\u0435\u0441\u044c \u043e\u0444\u043b\u0430\u0439\u043d \u0441 \u0431\u043e\u0442\u0430\u043c\u0438, \u0438\u0433\u0440\u0430\u0439\u0442\u0435 \u043f\u043e LAN \u0438\u043b\u0438 \u043d\u0430 pokerth.net.' },
  zh: { t: 'PokerTH \u7f51\u9875\u7248 \u2014 \u5728\u6d4f\u89c8\u5668\u4e2d\u514d\u8d39\u73a9\u5fb7\u5dde\u6251\u514b', d: '\u5728\u6d4f\u89c8\u5668\u4e2d\u76f4\u63a5\u7545\u73a9 PokerTH\uff0c\u514d\u8d39\u5f00\u6e90\u7684\u5fb7\u5dde\u6251\u514b\u6e38\u620f\u3002\u65e0\u9700\u4e0b\u8f7d\u3001\u65e0\u9700\u6ce8\u518c\uff1a\u79bb\u7ebf\u4e0e\u7535\u8111\u5bf9\u6218\u3001\u5c40\u57df\u7f51\u5bf9\u5c40\uff0c\u6216\u52a0\u5165 pokerth.net\u3002' },
  tr: { t: 'PokerTH Web \u2014 Taray\u0131c\u0131da \u00fccretsiz Texas Hold\u2019em poker', d: '\u00dccretsiz ve a\u00e7\u0131k kaynakl\u0131 Texas Hold\u2019em poker oyunu PokerTH\u2019yi do\u011frudan taray\u0131c\u0131n\u0131zda oynay\u0131n. \u0130ndirme yok, kay\u0131t yok \u2014 botlara kar\u015f\u0131 \u00e7evrimd\u0131\u015f\u0131 pratik yap\u0131n, LAN\u2019da oynay\u0131n veya pokerth.net\u2019e kat\u0131l\u0131n.' },
  uk: { t: 'PokerTH Web \u2014 \u0431\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u0438\u0439 \u043f\u043e\u043a\u0435\u0440 Texas Hold\u2019em \u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456', d: '\u0413\u0440\u0430\u0439\u0442\u0435 \u0432 PokerTH \u2014 \u0431\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u0443 \u043f\u043e\u043a\u0435\u0440\u043d\u0443 \u0433\u0440\u0443 Texas Hold\u2019em \u0437 \u0432\u0456\u0434\u043a\u0440\u0438\u0442\u0438\u043c \u043a\u043e\u0434\u043e\u043c \u043f\u0440\u043e\u0441\u0442\u043e \u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456. \u0411\u0435\u0437 \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f \u0442\u0430 \u0440\u0435\u0454\u0441\u0442\u0440\u0430\u0446\u0456\u0457: \u0442\u0440\u0435\u043d\u0443\u0439\u0442\u0435\u0441\u044f \u043e\u0444\u043b\u0430\u0439\u043d \u0437 \u0431\u043e\u0442\u0430\u043c\u0438, \u0433\u0440\u0430\u0439\u0442\u0435 \u0432 LAN \u0430\u0431\u043e \u043d\u0430 pokerth.net.' },
  ja: { t: 'PokerTH \u30a6\u30a7\u30d6\u7248 \u2014 \u30d6\u30e9\u30a6\u30b6\u3067\u7121\u6599\u30c6\u30ad\u30b5\u30b9\u30db\u30fc\u30eb\u30c7\u30e0\u30dd\u30fc\u30ab\u30fc', d: '\u7121\u6599\u30fb\u30aa\u30fc\u30d7\u30f3\u30bd\u30fc\u30b9\u306e\u30c6\u30ad\u30b5\u30b9\u30db\u30fc\u30eb\u30c7\u30e0\u30dd\u30fc\u30ab\u30fc\u300cPokerTH\u300d\u3092\u30d6\u30e9\u30a6\u30b6\u3067\u305d\u306e\u307e\u307e\u30d7\u30ec\u30a4\u3002\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3082\u767b\u9332\u3082\u4e0d\u8981\u3002\u30aa\u30d5\u30e9\u30a4\u30f3\u3067\u30dc\u30c3\u30c8\u3068\u5bfe\u6226\u3001LAN \u5bfe\u6226\u3001pokerth.net \u3078\u306e\u53c2\u52a0\u3082\u53ef\u80fd\u3002' },
  sv: { t: 'PokerTH Web \u2014 Gratis Texas Hold\u2019em-poker i webbl\u00e4saren', d: 'Spela PokerTH, det fria Texas Hold\u2019em-pokerspelet med \u00f6ppen k\u00e4llkod, direkt i webbl\u00e4saren. Ingen nedladdning, ingen registrering \u2014 tr\u00e4na offline mot bottar, spela via LAN eller p\u00e5 pokerth.net.' },
  nb: { t: 'PokerTH Web \u2014 Gratis Texas Hold\u2019em-poker i nettleseren', d: 'Spill PokerTH, det frie Texas Hold\u2019em-pokerspillet med \u00e5pen kildekode, rett i nettleseren. Ingen nedlasting, ingen registrering \u2014 \u00f8v offline mot botter, spill via LAN eller p\u00e5 pokerth.net.' },
  da: { t: 'PokerTH Web \u2014 Gratis Texas Hold\u2019em-poker i browseren', d: 'Spil PokerTH, det gratis open source Texas Hold\u2019em-pokerspil, direkte i browseren. Ingen download, ingen registrering \u2014 \u00f8v offline mod botter, spil via LAN eller p\u00e5 pokerth.net.' },
  fi: { t: 'PokerTH Web \u2014 Ilmainen Texas Hold\u2019em -pokeri selaimessa', d: 'Pelaa PokerTH:ta, ilmaista avoimen l\u00e4hdekoodin Texas Hold\u2019em -pokeripeli\u00e4, suoraan selaimessa. Ei latausta, ei rekister\u00f6itymist\u00e4 \u2014 harjoittele offline-tilassa botteja vastaan, pelaa LAN-verkossa tai liity pokerth.netiin.' },
  cs: { t: 'PokerTH Web \u2014 Texas Hold\u2019em poker zdarma v prohl\u00ed\u017ee\u010di', d: 'Hrajte PokerTH, bezplatnou open source pokerovou hru Texas Hold\u2019em, p\u0159\u00edmo v prohl\u00ed\u017ee\u010di. Bez stahov\u00e1n\u00ed a registrace \u2014 tr\u00e9nujte offline proti bot\u016fm, hrajte po LAN nebo na pokerth.net.' },
  sk: { t: 'PokerTH Web \u2014 Texas Hold\u2019em poker zadarmo v prehliada\u010di', d: 'Hrajte PokerTH, bezplatn\u00fa open source pokrov\u00fa hru Texas Hold\u2019em, priamo v prehliada\u010di. Bez s\u0165ahovania a registr\u00e1cie \u2014 tr\u00e9nujte offline proti botom, hrajte cez LAN alebo na pokerth.net.' },
  ro: { t: 'PokerTH Web \u2014 Poker Texas Hold\u2019em gratuit \u00een browser', d: 'Joac\u0103 PokerTH, jocul de poker Texas Hold\u2019em gratuit \u0219i open source, direct \u00een browser. F\u0103r\u0103 desc\u0103rcare, f\u0103r\u0103 \u00eenregistrare \u2014 exerseaz\u0103 offline contra bo\u021bilor, joac\u0103 \u00een LAN sau pe pokerth.net.' },
  hu: { t: 'PokerTH Web \u2014 Ingyenes Texas Hold\u2019em p\u00f3ker a b\u00f6ng\u00e9sz\u0151ben', d: 'J\u00e1tssz a PokerTH-val, az ingyenes, ny\u00edlt forr\u00e1sk\u00f3d\u00fa Texas Hold\u2019em p\u00f3kerj\u00e1t\u00e9kkal, k\u00f6zvetlen\u00fcl a b\u00f6ng\u00e9sz\u0151ben. Nincs let\u00f6lt\u00e9s, nincs regisztr\u00e1ci\u00f3 \u2014 gyakorolj offline botok ellen, j\u00e1tssz LAN-on vagy a pokerth.net-en.' },
  el: { t: 'PokerTH Web \u2014 \u0394\u03c9\u03c1\u03b5\u03ac\u03bd \u03c0\u03cc\u03ba\u03b5\u03c1 Texas Hold\u2019em \u03c3\u03c4\u03bf\u03bd browser', d: '\u03a0\u03b1\u03af\u03be\u03c4\u03b5 PokerTH, \u03c4\u03bf \u03b4\u03c9\u03c1\u03b5\u03ac\u03bd \u03c0\u03b1\u03b9\u03c7\u03bd\u03af\u03b4\u03b9 \u03c0\u03cc\u03ba\u03b5\u03c1 Texas Hold\u2019em \u03b1\u03bd\u03bf\u03b9\u03ba\u03c4\u03bf\u03cd \u03ba\u03ce\u03b4\u03b9\u03ba\u03b1, \u03b1\u03c0\u03b5\u03c5\u03b8\u03b5\u03af\u03b1\u03c2 \u03c3\u03c4\u03bf\u03bd browser. \u03a7\u03c9\u03c1\u03af\u03c2 \u03bb\u03ae\u03c8\u03b7, \u03c7\u03c9\u03c1\u03af\u03c2 \u03b5\u03b3\u03b3\u03c1\u03b1\u03c6\u03ae \u2014 \u03b5\u03be\u03b1\u03c3\u03ba\u03b7\u03b8\u03b5\u03af\u03c4\u03b5 offline \u03bc\u03b5 bots, \u03c0\u03b1\u03af\u03be\u03c4\u03b5 \u03c3\u03b5 LAN \u03ae \u03c3\u03c4\u03bf pokerth.net.' },
  bg: { t: 'PokerTH Web \u2014 \u0411\u0435\u0437\u043f\u043b\u0430\u0442\u0435\u043d \u043f\u043e\u043a\u0435\u0440 Texas Hold\u2019em \u0432 \u0431\u0440\u0430\u0443\u0437\u044a\u0440\u0430', d: '\u0418\u0433\u0440\u0430\u0439\u0442\u0435 PokerTH \u2014 \u0431\u0435\u0437\u043f\u043b\u0430\u0442\u043d\u0430\u0442\u0430 \u043f\u043e\u043a\u0435\u0440 \u0438\u0433\u0440\u0430 Texas Hold\u2019em \u0441 \u043e\u0442\u0432\u043e\u0440\u0435\u043d \u043a\u043e\u0434, \u043d\u0430\u043f\u0440\u0430\u0432\u043e \u0432 \u0431\u0440\u0430\u0443\u0437\u044a\u0440\u0430. \u0411\u0435\u0437 \u0438\u0437\u0442\u0435\u0433\u043b\u044f\u043d\u0435 \u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u2014 \u0442\u0440\u0435\u043d\u0438\u0440\u0430\u0439\u0442\u0435 \u043e\u0444\u043b\u0430\u0439\u043d \u0441\u0440\u0435\u0449\u0443 \u0431\u043e\u0442\u043e\u0432\u0435, \u0438\u0433\u0440\u0430\u0439\u0442\u0435 \u0432 LAN \u0438\u043b\u0438 \u043d\u0430 pokerth.net.' },
  hr: { t: 'PokerTH Web \u2014 Besplatan Texas Hold\u2019em poker u pregledniku', d: 'Igrajte PokerTH, besplatnu Texas Hold\u2019em poker igru otvorenog koda, izravno u pregledniku. Bez preuzimanja i registracije \u2014 vje\u017ebajte offline protiv botova, igrajte na LAN-u ili na pokerth.net.' },
  sr: { t: 'PokerTH Web \u2014 \u0411\u0435\u0441\u043f\u043b\u0430\u0442\u0430\u043d Texas Hold\u2019em \u043f\u043e\u043a\u0435\u0440 \u0443 \u043f\u0440\u0435\u0433\u043b\u0435\u0434\u0430\u0447\u0443', d: '\u0418\u0433\u0440\u0430\u0458\u0442\u0435 PokerTH, \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u0443 Texas Hold\u2019em \u043f\u043e\u043a\u0435\u0440 \u0438\u0433\u0440\u0443 \u043e\u0442\u0432\u043e\u0440\u0435\u043d\u043e\u0433 \u043a\u043e\u0434\u0430, \u0434\u0438\u0440\u0435\u043a\u0442\u043d\u043e \u0443 \u043f\u0440\u0435\u0433\u043b\u0435\u0434\u0430\u0447\u0443. \u0411\u0435\u0437 \u043f\u0440\u0435\u0443\u0437\u0438\u043c\u0430\u045a\u0430 \u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0458\u0435 \u2014 \u0432\u0435\u0436\u0431\u0430\u0458\u0442\u0435 \u043e\u0444\u043b\u0430\u0458\u043d \u043f\u0440\u043e\u0442\u0438\u0432 \u0431\u043e\u0442\u043e\u0432\u0430, \u0438\u0433\u0440\u0430\u0458\u0442\u0435 \u043d\u0430 LAN-\u0443 \u0438\u043b\u0438 \u043d\u0430 pokerth.net.' },
  af: { t: 'PokerTH Web \u2014 Gratis Texas Hold\u2019em-poker in jou blaaier', d: 'Speel PokerTH, die gratis oopbron-Texas Hold\u2019em-pokerspel, direk in jou blaaier. Geen aflaai, geen registrasie nie \u2014 oefen vanlyn teen botte, speel oor LAN of sluit by pokerth.net aan.' },
  ca: { t: 'PokerTH Web \u2014 P\u00f2quer Texas Hold\u2019em gratu\u00eft al navegador', d: 'Juga a PokerTH, el joc de p\u00f2quer Texas Hold\u2019em lliure i gratu\u00eft, directament al navegador. Sense desc\u00e0rregues ni registre: practica fora de l\u00ednia contra bots, juga en LAN o uneix-te a pokerth.net.' },
  gl: { t: 'PokerTH Web \u2014 P\u00f3ker Texas Hold\u2019em gratu\u00edto no navegador', d: 'Xoga a PokerTH, o xogo de p\u00f3ker Texas Hold\u2019em libre e gratu\u00edto, directamente no navegador. Sen descargas nin rexistro: practica sen conexi\u00f3n contra bots, xoga en LAN ou \u00fanete a pokerth.net.' },
  gd: { t: 'PokerTH Web \u2014 P\u00f2car Texas Hold\u2019em an-asgaidh sa bhrabhsair', d: 'Cluich PokerTH, an geama p\u00f2cair Texas Hold\u2019em saor le c\u00f2d fosgailte, sa bhrabhsair agad fh\u00e8in. Gun luchdachadh a-nuas, gun chl\u00e0radh \u2014 d\u00e8an cleachdadh far loidhne an aghaidh botaichean, cluich air LAN no air pokerth.net.' },
  lt: { t: 'PokerTH Web \u2014 Nemokamas Texas Hold\u2019em pokeris nar\u0161ykl\u0117je', d: '\u017daiskite PokerTH \u2014 nemokam\u0105 atvirojo kodo Texas Hold\u2019em pokerio \u017eaidim\u0105 tiesiai nar\u0161ykl\u0117je. Be atsisiuntimo ir registracijos \u2014 treniruokit\u0117s neprisijung\u0119 prie\u0161 botus, \u017eaiskite LAN tinkle arba pokerth.net.' },
  ta: { t: 'PokerTH Web \u2014 \u0b89\u0bb2\u0bbe\u0bb5\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0b87\u0bb2\u0bb5\u0b9a Texas Hold\u2019em \u0baa\u0bcb\u0b95\u0bcd\u0b95\u0bb0\u0bcd', d: '\u0b87\u0bb2\u0bb5\u0b9a \u0ba4\u0bbf\u0bb1\u0bae\u0bc2\u0bb2 Texas Hold\u2019em \u0baa\u0bcb\u0b95\u0bcd\u0b95\u0bb0\u0bcd \u0bb5\u0bbf\u0bb3\u0bc8\u0baf\u0bbe\u0b9f\u0bcd\u0b9f\u0bbe\u0ba9 PokerTH-\u0b90 \u0b89\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0b89\u0bb2\u0bbe\u0bb5\u0bbf\u0baf\u0bbf\u0bb2\u0bc7\u0baf\u0bc7 \u0bb5\u0bbf\u0bb3\u0bc8\u0baf\u0bbe\u0b9f\u0bc1\u0b99\u0bcd\u0b95\u0bb3\u0bcd. \u0baa\u0ba4\u0bbf\u0bb5\u0bbf\u0bb1\u0b95\u0bcd\u0b95\u0bae\u0bcb \u0baa\u0ba4\u0bbf\u0bb5\u0bcb \u0ba4\u0bc7\u0bb5\u0bc8\u0baf\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8 \u2014 \u0baa\u0bbe\u0b9f\u0bcd\u0b95\u0bb3\u0bc1\u0b9f\u0ba9\u0bcd \u0b86\u0b83\u0baa\u0bcd\u0bb2\u0bc8\u0ba9\u0bbf\u0bb2\u0bcd \u0baa\u0baf\u0bbf\u0bb1\u0bcd\u0b9a\u0bbf, LAN-\u0b87\u0bb2\u0bcd \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 pokerth.net-\u0b87\u0bb2\u0bcd \u0bb5\u0bbf\u0bb3\u0bc8\u0baf\u0bbe\u0b9f\u0bb2\u0bbe\u0bae\u0bcd.' },
  vi: { t: 'PokerTH Web \u2014 Poker Texas Hold\u2019em mi\u1ec5n ph\u00ed tr\u00ean tr\u00ecnh duy\u1ec7t', d: 'Ch\u01a1i PokerTH, tr\u00f2 ch\u01a1i poker Texas Hold\u2019em m\u00e3 ngu\u1ed3n m\u1edf mi\u1ec5n ph\u00ed, ngay tr\u00ean tr\u00ecnh duy\u1ec7t. Kh\u00f4ng c\u1ea7n t\u1ea3i v\u1ec1, kh\u00f4ng c\u1ea7n \u0111\u0103ng k\u00fd \u2014 luy\u1ec7n t\u1eadp ngo\u1ea1i tuy\u1ebfn v\u1edbi bot, ch\u01a1i qua LAN ho\u1eb7c tham gia pokerth.net.' },
  ko: { t: 'PokerTH \uc6f9 \u2014 \ube0c\ub77c\uc6b0\uc800\uc5d0\uc11c \uc990\uae30\ub294 \ubb34\ub8cc \ud14d\uc0ac\uc2a4 \ud640\ub364 \ud3ec\ucee4', d: '\ubb34\ub8cc \uc624\ud508\uc18c\uc2a4 \ud14d\uc0ac\uc2a4 \ud640\ub364 \ud3ec\ucee4 \uac8c\uc784 PokerTH\ub97c \ube0c\ub77c\uc6b0\uc800\uc5d0\uc11c \ubc14\ub85c \uc990\uae30\uc138\uc694. \ub2e4\uc6b4\ub85c\ub4dc\ub3c4 \uac00\uc785\ub3c4 \ud544\uc694 \uc5c6\uc2b5\ub2c8\ub2e4 \u2014 \uc624\ud504\ub77c\uc778 \ubd07 \ub300\uc804, LAN \ud50c\ub808\uc774, pokerth.net \ucc38\uc5ec\uae4c\uc9c0.' },
  'zh-TW': { t: 'PokerTH \u7db2\u9801\u7248 \u2014 \u5728\u700f\u89bd\u5668\u4e2d\u514d\u8cbb\u73a9\u5fb7\u5dde\u64b2\u514b', d: '\u5728\u700f\u89bd\u5668\u4e2d\u76f4\u63a5\u66a2\u73a9 PokerTH\uff0c\u514d\u8cbb\u958b\u6e90\u7684\u5fb7\u5dde\u64b2\u514b\u904a\u6232\u3002\u7121\u9700\u4e0b\u8f09\u3001\u7121\u9700\u8a3b\u518a\uff1a\u96e2\u7dda\u8207\u96fb\u8166\u5c0d\u6230\u3001\u5340\u57df\u7db2\u8def\u5c0d\u5c40\uff0c\u6216\u52a0\u5165 pokerth.net\u3002' },
  hi: { t: 'PokerTH \u0935\u0947\u092c \u2014 \u092c\u094d\u0930\u093e\u0909\u091c\u093c\u0930 \u092e\u0947\u0902 \u092e\u0941\u092b\u093c\u094d\u0924 Texas Hold\u2019em \u092a\u094b\u0915\u0930', d: '\u092e\u0941\u092b\u093c\u094d\u0924 \u0913\u092a\u0928-\u0938\u094b\u0930\u094d\u0938 Texas Hold\u2019em \u092a\u094b\u0915\u0930 \u0917\u0947\u092e PokerTH \u0938\u0940\u0927\u0947 \u0905\u092a\u0928\u0947 \u092c\u094d\u0930\u093e\u0909\u091c\u093c\u0930 \u092e\u0947\u0902 \u0916\u0947\u0932\u0947\u0902\u0964 \u0928 \u0921\u093e\u0909\u0928\u0932\u094b\u0921, \u0928 \u092a\u0902\u091c\u0940\u0915\u0930\u0923 \u2014 \u092c\u0949\u091f\u094d\u0938 \u0915\u0947 \u0935\u093f\u0930\u0941\u0926\u094d\u0927 \u0911\u092b\u093c\u0932\u093e\u0907\u0928 \u0905\u092d\u094d\u092f\u093e\u0938 \u0915\u0930\u0947\u0902, LAN \u092a\u0930 \u0916\u0947\u0932\u0947\u0902 \u092f\u093e pokerth.net \u0938\u0947 \u091c\u0941\u0921\u093c\u0947\u0902\u0964' },
  ar: { t: 'PokerTH Web \u2014 \u0628\u0648\u0643\u0631 \u062a\u0643\u0633\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u0645\u062c\u0627\u0646\u064a \u0641\u064a \u0645\u062a\u0635\u0641\u062d\u0643', d: '\u0627\u0644\u0639\u0628 PokerTH\u060c \u0644\u0639\u0628\u0629 \u0628\u0648\u0643\u0631 \u062a\u0643\u0633\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u0627\u0644\u062d\u0631\u0629 \u0648\u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629\u060c \u0645\u0628\u0627\u0634\u0631\u0629 \u0641\u064a \u0645\u062a\u0635\u0641\u062d\u0643. \u0628\u0644\u0627 \u062a\u0646\u0632\u064a\u0644 \u0648\u0644\u0627 \u062a\u0633\u062c\u064a\u0644 \u2014 \u062a\u062f\u0631\u0651\u0628 \u062f\u0648\u0646 \u0627\u062a\u0635\u0627\u0644 \u0636\u062f \u0627\u0644\u0631\u0648\u0628\u0648\u062a\u0627\u062a\u060c \u0627\u0644\u0639\u0628 \u0639\u0628\u0631 LAN \u0623\u0648 \u0627\u0646\u0636\u0645 \u0625\u0644\u0649 pokerth.net.' },
  fa: { t: 'PokerTH Web \u2014 \u067e\u0648\u06a9\u0631 \u062a\u06af\u0632\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u0631\u0627\u06cc\u06af\u0627\u0646 \u062f\u0631 \u0645\u0631\u0648\u0631\u06af\u0631 \u0634\u0645\u0627', d: 'PokerTH\u060c \u0628\u0627\u0632\u06cc \u067e\u0648\u06a9\u0631 \u062a\u06af\u0632\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u0622\u0632\u0627\u062f \u0648 \u0631\u0627\u06cc\u06af\u0627\u0646 \u0631\u0627 \u0645\u0633\u062a\u0642\u06cc\u0645 \u062f\u0631 \u0645\u0631\u0648\u0631\u06af\u0631 \u062e\u0648\u062f \u0628\u0627\u0632\u06cc \u06a9\u0646\u06cc\u062f. \u0628\u062f\u0648\u0646 \u062f\u0627\u0646\u0644\u0648\u062f \u0648 \u0628\u062f\u0648\u0646 \u062b\u0628\u062a\u200c\u0646\u0627\u0645 \u2014 \u0622\u0641\u0644\u0627\u06cc\u0646 \u0628\u0627 \u0631\u0628\u0627\u062a\u200c\u0647\u0627 \u062a\u0645\u0631\u06cc\u0646 \u06a9\u0646\u06cc\u062f\u060c \u062f\u0631 LAN \u0628\u0627\u0632\u06cc \u06a9\u0646\u06cc\u062f \u06cc\u0627 \u0628\u0647 pokerth.net \u0628\u067e\u06cc\u0648\u0646\u062f\u06cc\u062f.' },
  he: { t: 'PokerTH Web \u2014 \u05e4\u05d5\u05e7\u05e8 \u05d8\u05e7\u05e1\u05e1 \u05d4\u05d5\u05dc\u05d3\u05dd \u05d7\u05d9\u05e0\u05dd \u05d1\u05d3\u05e4\u05d3\u05e4\u05df \u05e9\u05dc\u05da', d: '\u05e9\u05d7\u05e7\u05d5 \u05d1-PokerTH, \u05de\u05e9\u05d7\u05e7 \u05e4\u05d5\u05e7\u05e8 \u05d8\u05e7\u05e1\u05e1 \u05d4\u05d5\u05dc\u05d3\u05dd \u05d7\u05d5\u05e4\u05e9\u05d9 \u05d5\u05d7\u05d9\u05e0\u05de\u05d9, \u05d9\u05e9\u05d9\u05e8\u05d5\u05ea \u05d1\u05d3\u05e4\u05d3\u05e4\u05df. \u05d1\u05dc\u05d9 \u05d4\u05d5\u05e8\u05d3\u05d4 \u05d5\u05d1\u05dc\u05d9 \u05d4\u05e8\u05e9\u05de\u05d4 \u2014 \u05d4\u05ea\u05d0\u05de\u05e0\u05d5 \u05dc\u05d0 \u05de\u05e7\u05d5\u05d5\u05df \u05de\u05d5\u05dc \u05d1\u05d5\u05d8\u05d9\u05dd, \u05e9\u05d7\u05e7\u05d5 \u05d1-LAN \u05d0\u05d5 \u05d4\u05e6\u05d8\u05e8\u05e4\u05d5 \u05dc-pokerth.net.' },
  ur: { t: 'PokerTH Web \u2014 \u0628\u0631\u0627\u0624\u0632\u0631 \u0645\u06cc\u06ba \u0645\u0641\u062a \u0679\u06cc\u06a9\u0633\u0627\u0633 \u06c1\u0648\u0644\u0688\u0645 \u067e\u0648\u06a9\u0631', d: 'PokerTH\u060c \u0622\u0632\u0627\u062f \u0627\u0648\u0631 \u0645\u0641\u062a \u0679\u06cc\u06a9\u0633\u0627\u0633 \u06c1\u0648\u0644\u0688\u0645 \u067e\u0648\u06a9\u0631 \u06af\u06cc\u0645\u060c \u0628\u0631\u0627\u06c1\u0650 \u0631\u0627\u0633\u062a \u0627\u067e\u0646\u06d2 \u0628\u0631\u0627\u0624\u0632\u0631 \u0645\u06cc\u06ba \u06a9\u06be\u06cc\u0644\u06cc\u06ba\u06d4 \u0646\u06c1 \u0688\u0627\u0624\u0646 \u0644\u0648\u0688 \u0646\u06c1 \u0631\u062c\u0633\u0679\u0631\u06cc\u0634\u0646 \u2014 \u0628\u0648\u0679\u0633 \u06a9\u06d2 \u062e\u0644\u0627\u0641 \u0622\u0641 \u0644\u0627\u0626\u0646 \u0645\u0634\u0642 \u06a9\u0631\u06cc\u06ba\u060c LAN \u067e\u0631 \u06a9\u06be\u06cc\u0644\u06cc\u06ba \u06cc\u0627 pokerth.net \u0645\u06cc\u06ba \u0634\u0627\u0645\u0644 \u06c1\u0648\u06ba\u06d4' },
  id: { t: 'PokerTH Web \u2014 Poker Texas Hold\u2019em gratis di browser Anda', d: 'Mainkan PokerTH, permainan poker Texas Hold\u2019em gratis dan sumber terbuka, langsung di browser Anda. Tanpa unduhan, tanpa pendaftaran \u2014 berlatih offline melawan bot, bermain lewat LAN, atau bergabung ke pokerth.net.' },
  th: { t: 'PokerTH Web \u2014 \u0e42\u0e1b\u0e4a\u0e01\u0e40\u0e01\u0e2d\u0e23\u0e4c Texas Hold\u2019em \u0e1f\u0e23\u0e35\u0e43\u0e19\u0e40\u0e1a\u0e23\u0e32\u0e27\u0e4c\u0e40\u0e0b\u0e2d\u0e23\u0e4c\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13', d: '\u0e40\u0e25\u0e48\u0e19 PokerTH \u0e40\u0e01\u0e21\u0e42\u0e1b\u0e4a\u0e01\u0e40\u0e01\u0e2d\u0e23\u0e4c Texas Hold\u2019em \u0e1f\u0e23\u0e35\u0e41\u0e25\u0e30\u0e42\u0e2d\u0e40\u0e1e\u0e19\u0e0b\u0e2d\u0e23\u0e4c\u0e2a \u0e42\u0e14\u0e22\u0e15\u0e23\u0e07\u0e43\u0e19\u0e40\u0e1a\u0e23\u0e32\u0e27\u0e4c\u0e40\u0e0b\u0e2d\u0e23\u0e4c \u0e44\u0e21\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e14\u0e32\u0e27\u0e19\u0e4c\u0e42\u0e2b\u0e25\u0e14 \u0e44\u0e21\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19 \u2014 \u0e1d\u0e36\u0e01\u0e2d\u0e2d\u0e1f\u0e44\u0e25\u0e19\u0e4c\u0e01\u0e31\u0e1a\u0e1a\u0e2d\u0e15 \u0e40\u0e25\u0e48\u0e19\u0e1c\u0e48\u0e32\u0e19 LAN \u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e02\u0e49\u0e32\u0e23\u0e48\u0e27\u0e21 pokerth.net' },
  fil: { t: 'PokerTH Web \u2014 Libreng Texas Hold\u2019em poker sa iyong browser', d: 'Maglaro ng PokerTH, ang libre at open-source na larong poker na Texas Hold\u2019em, direkta sa iyong browser. Walang download, walang rehistro \u2014 magsanay offline laban sa mga bot, maglaro sa LAN o sumali sa pokerth.net.' },
  bn: { t: 'PokerTH Web \u2014 \u0986\u09aa\u09a8\u09be\u09b0 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7 \u09ab\u09cd\u09b0\u09bf Texas Hold\u2019em \u09aa\u09cb\u0995\u09be\u09b0', d: '\u0986\u09aa\u09a8\u09be\u09b0 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7 \u09b8\u09b0\u09be\u09b8\u09b0\u09bf PokerTH \u0996\u09c7\u09b2\u09c1\u09a8, \u09ab\u09cd\u09b0\u09bf \u0993 \u0993\u09aa\u09c7\u09a8-\u09b8\u09cb\u09b0\u09cd\u09b8 Texas Hold\u2019em \u09aa\u09cb\u0995\u09be\u09b0 \u0997\u09c7\u09ae\u0964 \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1 \u09a8\u09c7\u0987, \u09a8\u09bf\u09ac\u09a8\u09cd\u09a7\u09a8 \u09a8\u09c7\u0987 \u2014 \u09ac\u099f\u09c7\u09b0 \u09ac\u09bf\u09b0\u09c1\u09a6\u09cd\u09a7\u09c7 \u0985\u09ab\u09b2\u09be\u0987\u09a8 \u0985\u09a8\u09c1\u09b6\u09c0\u09b2\u09a8 \u0995\u09b0\u09c1\u09a8, LAN-\u098f \u0996\u09c7\u09b2\u09c1\u09a8 \u09ac\u09be pokerth.net-\u098f \u09af\u09cb\u0997 \u09a6\u09bf\u09a8\u0964' },
  sw: { t: 'PokerTH Web \u2014 Poker ya Texas Hold\u2019em bure kwenye kivinjari chako', d: 'Cheza PokerTH, mchezo wa bure na wa chanzo huria wa poker wa Texas Hold\u2019em, moja kwa moja kwenye kivinjari chako. Hakuna upakuaji, hakuna usajili \u2014 fanya mazoezi nje ya mtandao dhidi ya boti, cheza kwenye LAN au jiunge na pokerth.net.' },
};

// og:locale — Open Graph territory codes for the SEO_I18N languages. Facebook,
// LINE and WeChat read this when a link is shared and fall back to en_US when
// it is missing or malformed, so a bare language subtag ('zh', 'fr') is not
// usable here: the property is defined as language_TERRITORY. One entry per
// SEO_I18N key; anything unmapped simply emits no og:locale.
var OG_LOCALE = {
  en: 'en_US', fr: 'fr_FR', de: 'de_DE', es: 'es_ES', it: 'it_IT',
  'pt-BR': 'pt_BR', 'pt-PT': 'pt_PT', nl: 'nl_NL', pl: 'pl_PL', ru: 'ru_RU',
  zh: 'zh_CN', tr: 'tr_TR', uk: 'uk_UA', ja: 'ja_JP', sv: 'sv_SE',
  nb: 'nb_NO', da: 'da_DK', fi: 'fi_FI', cs: 'cs_CZ', sk: 'sk_SK',
  ro: 'ro_RO', hu: 'hu_HU', el: 'el_GR', bg: 'bg_BG', hr: 'hr_HR',
  sr: 'sr_RS', af: 'af_ZA', ca: 'ca_ES', gl: 'gl_ES', gd: 'gd_GB',
  lt: 'lt_LT', ta: 'ta_IN', vi: 'vi_VN', ko: 'ko_KR', 'zh-TW': 'zh_TW',
  hi: 'hi_IN', ar: 'ar_AR', fa: 'fa_IR', he: 'he_IL', ur: 'ur_PK',
  id: 'id_ID', th: 'th_TH', fil: 'fil_PH', bn: 'bn_IN', sw: 'sw_KE',
};

// The crawler-readable body text, per language. <h1> and the lead paragraph
// reuse SEO_I18N[code].t / .d, so only what is not already translated lives
// here: m (how you play), g (free / open source), r and pv (link labels).
// A page served as <html lang="xx"> whose visible text is English reads as
// a near-duplicate of the English page to a search engine, which is what
// this table exists to prevent. Codes match SEO_I18N exactly; anything
// missing falls back to English.
var SEO_BODY_I18N = {
  en: { m: "Three ways to play: offline practice against computer opponents, LAN or a private dedicated server, and the official pokerth.net network with seasonal rankings. Full Texas Hold\u2019em rules, up to 10 players per table, and it installs as an app (PWA) on desktop and mobile.",
     g: "Completely free and open source: no ads, no in-app purchases, no real-money gambling \u2014 play-money chips only. 45 interface languages, customizable card decks and table styles, and feature parity with the official PokerTH desktop client.",
     r: "Texas Hold\u2019em rules", pv: "Privacy" },
  fr: { m: "Trois fa\u00e7ons de jouer\u00a0: entra\u00eenement hors ligne contre des adversaires g\u00e9r\u00e9s par l\u2019ordinateur, LAN ou serveur d\u00e9di\u00e9 priv\u00e9, et le r\u00e9seau officiel pokerth.net avec ses classements saisonniers. R\u00e8gles compl\u00e8tes du Texas Hold\u2019em, jusqu\u2019\u00e0 10 joueurs par table, et installation comme application (PWA) sur ordinateur et mobile.",
     g: "Enti\u00e8rement gratuit et open source\u00a0: pas de publicit\u00e9, pas d\u2019achat int\u00e9gr\u00e9, pas d\u2019argent r\u00e9el \u2014 uniquement des jetons virtuels. 45 langues d\u2019interface, jeux de cartes et styles de table personnalisables, et parit\u00e9 de fonctionnalit\u00e9s avec le client de bureau officiel PokerTH.",
     r: "R\u00e8gles du Texas Hold\u2019em", pv: "Confidentialit\u00e9" },
  de: { m: "Drei Spielweisen: Offline-Training gegen Computergegner, LAN oder ein privater dedizierter Server, und das offizielle Netzwerk pokerth.net mit Saisonranglisten. Vollst\u00e4ndige Texas-Hold\u2019em-Regeln, bis zu 10 Spieler pro Tisch, installierbar als App (PWA) auf Desktop und Mobilger\u00e4t.",
     g: "V\u00f6llig kostenlos und quelloffen: keine Werbung, keine In-App-K\u00e4ufe, kein Echtgeld-Gl\u00fccksspiel \u2014 ausschlie\u00dflich Spielgeld. 45 Oberfl\u00e4chensprachen, anpassbare Kartendecks und Tischdesigns, und Funktionsgleichheit mit dem offiziellen PokerTH-Desktop-Client.",
     r: "Texas-Hold\u2019em-Regeln", pv: "Datenschutz" },
  es: { m: "Tres formas de jugar: pr\u00e1ctica sin conexi\u00f3n contra oponentes controlados por el ordenador, LAN o un servidor dedicado privado, y la red oficial pokerth.net con clasificaciones por temporada. Reglas completas del Texas Hold\u2019em, hasta 10 jugadores por mesa, e instalable como aplicaci\u00f3n (PWA) en ordenador y m\u00f3vil.",
     g: "Totalmente gratuito y de c\u00f3digo abierto: sin anuncios, sin compras integradas, sin dinero real \u2014 solo fichas virtuales. 45 idiomas de interfaz, barajas y estilos de mesa personalizables, y paridad de funciones con el cliente de escritorio oficial de PokerTH.",
     r: "Reglas del Texas Hold\u2019em", pv: "Privacidad" },
  it: { m: "Tre modi di giocare: allenamento offline contro avversari controllati dal computer, LAN o un server dedicato privato, e la rete ufficiale pokerth.net con classifiche stagionali. Regole complete del Texas Hold\u2019em, fino a 10 giocatori per tavolo, installabile come app (PWA) su desktop e mobile.",
     g: "Completamente gratuito e open source: niente pubblicit\u00e0, niente acquisti in-app, niente denaro reale \u2014 solo fiche virtuali. 45 lingue dell\u2019interfaccia, mazzi e stili di tavolo personalizzabili, e parit\u00e0 di funzioni con il client desktop ufficiale di PokerTH.",
     r: "Regole del Texas Hold\u2019em", pv: "Privacy" },
  "pt-BR": { m: "Tr\u00eas formas de jogar: treino offline contra oponentes controlados pelo computador, LAN ou servidor dedicado privado, e a rede oficial pokerth.net com rankings por temporada. Regras completas do Texas Hold\u2019em, at\u00e9 10 jogadores por mesa, e instal\u00e1vel como aplicativo (PWA) no computador e no celular.",
     g: "Totalmente gratuito e de c\u00f3digo aberto: sem an\u00fancios, sem compras no aplicativo, sem dinheiro real \u2014 apenas fichas virtuais. 45 idiomas de interface, baralhos e estilos de mesa personaliz\u00e1veis, e paridade de recursos com o cliente desktop oficial do PokerTH.",
     r: "Regras do Texas Hold\u2019em", pv: "Privacidade" },
  "pt-PT": { m: "Tr\u00eas formas de jogar: treino offline contra advers\u00e1rios controlados pelo computador, LAN ou servidor dedicado privado, e a rede oficial pokerth.net com classifica\u00e7\u00f5es por temporada. Regras completas do Texas Hold\u2019em, at\u00e9 10 jogadores por mesa, e instal\u00e1vel como aplica\u00e7\u00e3o (PWA) no computador e no telem\u00f3vel.",
     g: "Totalmente gratuito e de c\u00f3digo aberto: sem publicidade, sem compras na aplica\u00e7\u00e3o, sem dinheiro real \u2014 apenas fichas virtuais. 45 idiomas de interface, baralhos e estilos de mesa personaliz\u00e1veis, e paridade de funcionalidades com o cliente de secret\u00e1ria oficial do PokerTH.",
     r: "Regras do Texas Hold\u2019em", pv: "Privacidade" },
  nl: { m: "Drie manieren om te spelen: offline oefenen tegen computertegenstanders, LAN of een eigen dedicated server, en het offici\u00eble pokerth.net-netwerk met seizoensklassementen. Volledige Texas Hold\u2019em-regels, tot 10 spelers per tafel, en te installeren als app (PWA) op desktop en mobiel.",
     g: "Volledig gratis en opensource: geen advertenties, geen in-app-aankopen, geen echt geld \u2014 alleen speelgeld. 45 interfacetalen, aanpasbare kaartdecks en tafelstijlen, en dezelfde functies als de offici\u00eble PokerTH-desktopclient.",
     r: "Texas Hold\u2019em-regels", pv: "Privacy" },
  pl: { m: "Trzy sposoby gry: trening offline przeciwko przeciwnikom sterowanym przez komputer, sie\u0107 LAN lub w\u0142asny serwer dedykowany, oraz oficjalna sie\u0107 pokerth.net z rankingami sezonowymi. Pe\u0142ne zasady Texas Hold\u2019em, do 10 graczy przy stole, instalacja jako aplikacja (PWA) na komputerze i telefonie.",
     g: "Ca\u0142kowicie darmowy i otwarto\u017ar\u00f3d\u0142owy: bez reklam, bez zakup\u00f3w w aplikacji, bez prawdziwych pieni\u0119dzy \u2014 wy\u0142\u0105cznie \u017cetony do zabawy. 45 j\u0119zyk\u00f3w interfejsu, konfigurowalne talie kart i style sto\u0142\u00f3w oraz pe\u0142na zgodno\u015b\u0107 funkcji z oficjalnym klientem desktopowym PokerTH.",
     r: "Zasady Texas Hold\u2019em", pv: "Prywatno\u015b\u0107" },
  ru: { m: "\u0422\u0440\u0438 \u0441\u043f\u043e\u0441\u043e\u0431\u0430 \u0438\u0433\u0440\u0430\u0442\u044c: \u043e\u0444\u043b\u0430\u0439\u043d-\u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u0440\u043e\u0442\u0438\u0432 \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u043d\u044b\u0445 \u0441\u043e\u043f\u0435\u0440\u043d\u0438\u043a\u043e\u0432, \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u0430\u044f \u0441\u0435\u0442\u044c \u0438\u043b\u0438 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0432\u044b\u0434\u0435\u043b\u0435\u043d\u043d\u044b\u0439 \u0441\u0435\u0440\u0432\u0435\u0440, \u0430 \u0442\u0430\u043a\u0436\u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u0430\u044f \u0441\u0435\u0442\u044c pokerth.net \u0441 \u0441\u0435\u0437\u043e\u043d\u043d\u044b\u043c\u0438 \u0440\u0435\u0439\u0442\u0438\u043d\u0433\u0430\u043c\u0438. \u041f\u043e\u043b\u043d\u044b\u0435 \u043f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019em, \u0434\u043e 10 \u0438\u0433\u0440\u043e\u043a\u043e\u0432 \u0437\u0430 \u0441\u0442\u043e\u043b\u043e\u043c, \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0430 \u043a\u0430\u043a \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 (PWA) \u043d\u0430 \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u0435 \u0438 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0435.",
     g: "\u041f\u043e\u043b\u043d\u043e\u0441\u0442\u044c\u044e \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e \u0438 \u0441 \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u043c \u0438\u0441\u0445\u043e\u0434\u043d\u044b\u043c \u043a\u043e\u0434\u043e\u043c: \u0431\u0435\u0437 \u0440\u0435\u043a\u043b\u0430\u043c\u044b, \u0431\u0435\u0437 \u0432\u0441\u0442\u0440\u043e\u0435\u043d\u043d\u044b\u0445 \u043f\u043e\u043a\u0443\u043f\u043e\u043a, \u0431\u0435\u0437 \u0438\u0433\u0440\u044b \u043d\u0430 \u0440\u0435\u0430\u043b\u044c\u043d\u044b\u0435 \u0434\u0435\u043d\u044c\u0433\u0438 \u2014 \u0442\u043e\u043b\u044c\u043a\u043e \u0438\u0433\u0440\u043e\u0432\u044b\u0435 \u0444\u0438\u0448\u043a\u0438. 45 \u044f\u0437\u044b\u043a\u043e\u0432 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430, \u043d\u0430\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0435\u043c\u044b\u0435 \u043a\u043e\u043b\u043e\u0434\u044b \u0438 \u0441\u0442\u0438\u043b\u0438 \u0441\u0442\u043e\u043b\u043e\u0432, \u043f\u043e\u043b\u043d\u043e\u0435 \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u044f\u043c \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0433\u043e \u043d\u0430\u0441\u0442\u043e\u043b\u044c\u043d\u043e\u0433\u043e \u043a\u043b\u0438\u0435\u043d\u0442\u0430 PokerTH.",
     r: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019em", pv: "\u041a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u044c" },
  zh: { m: "\u4e09\u79cd\u73a9\u6cd5\uff1a\u79bb\u7ebf\u4e0e\u7535\u8111\u5bf9\u624b\u7ec3\u4e60\u3001\u5c40\u57df\u7f51\u6216\u81ea\u5efa\u4e13\u7528\u670d\u52a1\u5668\u5bf9\u5c40\uff0c\u4ee5\u53ca\u5e26\u8d5b\u5b63\u6392\u540d\u7684\u5b98\u65b9 pokerth.net \u7f51\u7edc\u3002\u5b8c\u6574\u7684\u5fb7\u5dde\u6251\u514b\u89c4\u5219\uff0c\u6bcf\u684c\u6700\u591a 10 \u540d\u73a9\u5bb6\uff0c\u5e76\u53ef\u4f5c\u4e3a\u5e94\u7528\uff08PWA\uff09\u5b89\u88c5\u5230\u7535\u8111\u548c\u624b\u673a\u4e0a\u3002",
     g: "\u5b8c\u5168\u514d\u8d39\u4e14\u5f00\u6e90\uff1a\u65e0\u5e7f\u544a\u3001\u65e0\u5185\u8d2d\u3001\u4e0d\u6d89\u53ca\u771f\u94b1\u8d4c\u535a\u2014\u2014\u53ea\u4f7f\u7528\u865a\u62df\u7b79\u7801\u300245 \u79cd\u754c\u9762\u8bed\u8a00\uff0c\u53ef\u81ea\u5b9a\u4e49\u724c\u80cc\u548c\u724c\u684c\u6837\u5f0f\uff0c\u529f\u80fd\u4e0e\u5b98\u65b9 PokerTH \u684c\u9762\u5ba2\u6237\u7aef\u4fdd\u6301\u4e00\u81f4\u3002",
     r: "\u5fb7\u5dde\u6251\u514b\u89c4\u5219", pv: "\u9690\u79c1" },
  tr: { m: "\u00dc\u00e7 oynama yolu: bilgisayar rakiplere kar\u015f\u0131 \u00e7evrimd\u0131\u015f\u0131 antrenman, LAN veya kendi \u00f6zel sunucunuz ve sezonluk s\u0131ralamalar\u0131 olan resm\u00ee pokerth.net a\u011f\u0131. Eksiksiz Texas Hold\u2019em kurallar\u0131, masa ba\u015f\u0131na 10 oyuncuya kadar ve masa\u00fcst\u00fc ile mobilde uygulama (PWA) olarak kurulabilir.",
     g: "Tamamen \u00fccretsiz ve a\u00e7\u0131k kaynak: reklam yok, uygulama i\u00e7i sat\u0131n alma yok, ger\u00e7ek parayla kumar yok \u2014 yaln\u0131zca sanal \u00e7ip. 45 aray\u00fcz dili, \u00f6zelle\u015ftirilebilir kart desteleri ve masa stilleri, resm\u00ee PokerTH masa\u00fcst\u00fc istemcisiyle ayn\u0131 \u00f6zellikler.",
     r: "Texas Hold\u2019em kurallar\u0131", pv: "Gizlilik" },
  uk: { m: "\u0422\u0440\u0438 \u0441\u043f\u043e\u0441\u043e\u0431\u0438 \u0433\u0440\u0430\u0442\u0438: \u043e\u0444\u043b\u0430\u0439\u043d-\u0442\u0440\u0435\u043d\u0443\u0432\u0430\u043d\u043d\u044f \u043f\u0440\u043e\u0442\u0438 \u043a\u043e\u043c\u043f\u2019\u044e\u0442\u0435\u0440\u043d\u0438\u0445 \u0441\u0443\u043f\u0435\u0440\u043d\u0438\u043a\u0456\u0432, \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u0430 \u043c\u0435\u0440\u0435\u0436\u0430 \u0430\u0431\u043e \u0432\u043b\u0430\u0441\u043d\u0438\u0439 \u0432\u0438\u0434\u0456\u043b\u0435\u043d\u0438\u0439 \u0441\u0435\u0440\u0432\u0435\u0440, \u0430 \u0442\u0430\u043a\u043e\u0436 \u043e\u0444\u0456\u0446\u0456\u0439\u043d\u0430 \u043c\u0435\u0440\u0435\u0436\u0430 pokerth.net \u0456\u0437 \u0441\u0435\u0437\u043e\u043d\u043d\u0438\u043c\u0438 \u0440\u0435\u0439\u0442\u0438\u043d\u0433\u0430\u043c\u0438. \u041f\u043e\u0432\u043d\u0456 \u043f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019em, \u0434\u043e 10 \u0433\u0440\u0430\u0432\u0446\u0456\u0432 \u0437\u0430 \u0441\u0442\u043e\u043b\u043e\u043c, \u0432\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044f \u044f\u043a \u0437\u0430\u0441\u0442\u043e\u0441\u0443\u043d\u043e\u043a (PWA) \u043d\u0430 \u043a\u043e\u043c\u043f\u2019\u044e\u0442\u0435\u0440\u0456 \u0442\u0430 \u0441\u043c\u0430\u0440\u0442\u0444\u043e\u043d\u0456.",
     g: "\u0426\u0456\u043b\u043a\u043e\u043c \u0431\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u043e \u0442\u0430 \u0437 \u0432\u0456\u0434\u043a\u0440\u0438\u0442\u0438\u043c \u043a\u043e\u0434\u043e\u043c: \u0431\u0435\u0437 \u0440\u0435\u043a\u043b\u0430\u043c\u0438, \u0431\u0435\u0437 \u0432\u0431\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0445 \u043f\u043e\u043a\u0443\u043f\u043e\u043a, \u0431\u0435\u0437 \u0433\u0440\u0438 \u043d\u0430 \u0440\u0435\u0430\u043b\u044c\u043d\u0456 \u0433\u0440\u043e\u0448\u0456 \u2014 \u043b\u0438\u0448\u0435 \u0456\u0433\u0440\u043e\u0432\u0456 \u0444\u0456\u0448\u043a\u0438. 45 \u043c\u043e\u0432 \u0456\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0443, \u043d\u0430\u043b\u0430\u0448\u0442\u043e\u0432\u0443\u0432\u0430\u043d\u0456 \u043a\u043e\u043b\u043e\u0434\u0438 \u0442\u0430 \u0441\u0442\u0438\u043b\u0456 \u0441\u0442\u043e\u043b\u0456\u0432, \u043f\u043e\u0432\u043d\u0430 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u043d\u0456\u0441\u0442\u044c \u043c\u043e\u0436\u043b\u0438\u0432\u043e\u0441\u0442\u044f\u043c \u043e\u0444\u0456\u0446\u0456\u0439\u043d\u043e\u0433\u043e \u043d\u0430\u0441\u0442\u0456\u043b\u044c\u043d\u043e\u0433\u043e \u043a\u043b\u0456\u0454\u043d\u0442\u0430 PokerTH.",
     r: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019em", pv: "\u041a\u043e\u043d\u0444\u0456\u0434\u0435\u043d\u0446\u0456\u0439\u043d\u0456\u0441\u0442\u044c" },
  ja: { m: "\u904a\u3073\u65b9\u306f3\u901a\u308a\uff1a\u30b3\u30f3\u30d4\u30e5\u30fc\u30bf\u5bfe\u6226\u306e\u30aa\u30d5\u30e9\u30a4\u30f3\u7df4\u7fd2\u3001LAN \u307e\u305f\u306f\u81ea\u524d\u306e\u5c02\u7528\u30b5\u30fc\u30d0\u30fc\u3001\u305d\u3057\u3066\u30b7\u30fc\u30ba\u30f3\u30e9\u30f3\u30ad\u30f3\u30b0\u306e\u3042\u308b\u516c\u5f0f pokerth.net \u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u3002\u30c6\u30ad\u30b5\u30b9\u30db\u30fc\u30eb\u30c7\u30e0\u306e\u5b8c\u5168\u306a\u30eb\u30fc\u30eb\u30011\u5353\u6700\u592710\u4eba\u3001\u30d1\u30bd\u30b3\u30f3\u3067\u3082\u30b9\u30de\u30fc\u30c8\u30d5\u30a9\u30f3\u3067\u3082\u30a2\u30d7\u30ea\uff08PWA\uff09\u3068\u3057\u3066\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3067\u304d\u307e\u3059\u3002",
     g: "\u5b8c\u5168\u7121\u6599\u3067\u30aa\u30fc\u30d7\u30f3\u30bd\u30fc\u30b9\uff1a\u5e83\u544a\u306a\u3057\u3001\u30a2\u30d7\u30ea\u5185\u8ab2\u91d1\u306a\u3057\u3001\u5b9f\u969b\u306e\u304a\u91d1\u3092\u8ce0\u3051\u308b\u3053\u3068\u3082\u3042\u308a\u307e\u305b\u3093\u2014\u2014\u904a\u3073\u306e\u30c1\u30c3\u30d7\u306e\u307f\u3067\u3059\u3002\u30a4\u30f3\u30bf\u30fc\u30d5\u30a7\u30fc\u30b9\u306f45\u8a00\u8a9e\u3001\u30ab\u30fc\u30c9\u30c7\u30c3\u30ad\u3068\u30c6\u30fc\u30d6\u30eb\u30c7\u30b6\u30a4\u30f3\u306f\u81ea\u7531\u306b\u5909\u66f4\u3067\u304d\u3001\u516c\u5f0f PokerTH \u30c7\u30b9\u30af\u30c8\u30c3\u30d7\u7248\u3068\u540c\u7b49\u306e\u6a5f\u80fd\u3092\u5099\u3048\u3066\u3044\u307e\u3059\u3002",
     r: "\u30c6\u30ad\u30b5\u30b9\u30db\u30fc\u30eb\u30c7\u30e0\u306e\u30eb\u30fc\u30eb", pv: "\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc" },
  sv: { m: "Tre s\u00e4tt att spela: offlinetr\u00e4ning mot datorstyrda motst\u00e5ndare, LAN eller en egen dedikerad server, och det officiella n\u00e4tverket pokerth.net med s\u00e4songsrankning. Fullst\u00e4ndiga Texas Hold\u2019em-regler, upp till 10 spelare per bord, och installerbart som app (PWA) p\u00e5 dator och mobil.",
     g: "Helt gratis och \u00f6ppen k\u00e4llkod: inga annonser, inga k\u00f6p i appen, inget spel om riktiga pengar \u2014 bara l\u00e5tsaspengar. 45 gr\u00e4nssnittsspr\u00e5k, anpassningsbara kortlekar och bordsstilar, och samma funktioner som den officiella PokerTH-skrivbordsklienten.",
     r: "Texas Hold\u2019em-regler", pv: "Integritet" },
  nb: { m: "Tre m\u00e5ter \u00e5 spille p\u00e5: offline trening mot datastyrte motstandere, LAN eller en egen dedikert server, og det offisielle nettverket pokerth.net med sesongrangeringer. Fullstendige Texas Hold\u2019em-regler, opptil 10 spillere per bord, og kan installeres som app (PWA) p\u00e5 PC og mobil.",
     g: "Helt gratis og med \u00e5pen kildekode: ingen reklame, ingen kj\u00f8p i appen, ingen spill om ekte penger \u2014 bare lekepenger. 45 grensesnittspr\u00e5k, tilpassbare kortstokker og bordstiler, og samme funksjoner som den offisielle PokerTH-skrivebordsklienten.",
     r: "Texas Hold\u2019em-regler", pv: "Personvern" },
  da: { m: "Tre m\u00e5der at spille p\u00e5: offlinetr\u00e6ning mod computerstyrede modstandere, LAN eller en privat dedikeret server, og det officielle netv\u00e6rk pokerth.net med s\u00e6songlister. Komplette Texas Hold\u2019em-regler, op til 10 spillere ved bordet, og kan installeres som app (PWA) p\u00e5 computer og mobil.",
     g: "Helt gratis og open source: ingen reklamer, ingen k\u00f8b i appen, intet spil om rigtige penge \u2014 kun spillepenge. 45 sprog i brugerfladen, kortspil og borddesign kan tilpasses, og samme funktioner som den officielle PokerTH-desktopklient.",
     r: "Texas Hold\u2019em-regler", pv: "Privatliv" },
  fi: { m: "Kolme tapaa pelata: offline-harjoittelu tietokonevastustajia vastaan, l\u00e4hiverkko tai oma palvelin sek\u00e4 virallinen pokerth.net-verkko kausisijoituksineen. T\u00e4ydet Texas Hold\u2019em -s\u00e4\u00e4nn\u00f6t, jopa 10 pelaajaa p\u00f6yt\u00e4\u00e4 kohden, ja asennettavissa sovelluksena (PWA) tietokoneelle ja puhelimeen.",
     g: "T\u00e4ysin ilmainen ja avoin l\u00e4hdekoodi: ei mainoksia, ei sovelluksen sis\u00e4isi\u00e4 ostoja, ei oikealla rahalla pelaamista \u2014 vain leikkirahaa. 45 k\u00e4ytt\u00f6liittym\u00e4kielt\u00e4, muokattavat korttipakat ja p\u00f6yt\u00e4tyylit sek\u00e4 samat ominaisuudet kuin virallisessa PokerTH-ty\u00f6p\u00f6yt\u00e4sovelluksessa.",
     r: "Texas Hold\u2019em -s\u00e4\u00e4nn\u00f6t", pv: "Tietosuoja" },
  cs: { m: "T\u0159i zp\u016fsoby hry: offline tr\u00e9nink proti po\u010d\u00edta\u010dov\u00fdm protivn\u00edk\u016fm, LAN nebo vlastn\u00ed dedikovan\u00fd server a ofici\u00e1ln\u00ed s\u00ed\u0165 pokerth.net se sez\u00f3nn\u00edmi \u017eeb\u0159\u00ed\u010dky. Kompletn\u00ed pravidla Texas Hold\u2019em, a\u017e 10 hr\u00e1\u010d\u016f u stolu, instalace jako aplikace (PWA) na po\u010d\u00edta\u010di i mobilu.",
     g: "Zcela zdarma a s otev\u0159en\u00fdm zdrojov\u00fdm k\u00f3dem: \u017e\u00e1dn\u00e9 reklamy, \u017e\u00e1dn\u00e9 n\u00e1kupy v aplikaci, \u017e\u00e1dn\u00e1 hra o skute\u010dn\u00e9 pen\u00edze \u2014 pouze hern\u00ed \u017eetony. 45 jazyk\u016f rozhran\u00ed, p\u0159izp\u016fsobiteln\u00e9 bal\u00ed\u010dky karet a styly stol\u016f a stejn\u00e9 funkce jako ofici\u00e1ln\u00ed desktopov\u00fd klient PokerTH.",
     r: "Pravidla Texas Hold\u2019em", pv: "Soukrom\u00ed" },
  sk: { m: "Tri sp\u00f4soby hry: offline tr\u00e9ning proti po\u010d\u00edta\u010dov\u00fdm s\u00faperom, LAN alebo vlastn\u00fd dedikovan\u00fd server a ofici\u00e1lna sie\u0165 pokerth.net so sez\u00f3nnymi rebr\u00ed\u010dkami. Kompletn\u00e9 pravidl\u00e1 Texas Hold\u2019em, a\u017e 10 hr\u00e1\u010dov pri stole, in\u0161tal\u00e1cia ako aplik\u00e1cia (PWA) na po\u010d\u00edta\u010di aj mobile.",
     g: "\u00daplne zadarmo a s otvoren\u00fdm zdrojov\u00fdm k\u00f3dom: \u017eiadne reklamy, \u017eiadne n\u00e1kupy v aplik\u00e1cii, \u017eiadna hra o skuto\u010dn\u00e9 peniaze \u2014 iba hern\u00e9 \u017eet\u00f3ny. 45 jazykov rozhrania, prisp\u00f4sobite\u013en\u00e9 bal\u00ed\u010dky kariet a \u0161t\u00fdly stolov a rovnak\u00e9 funkcie ako ofici\u00e1lny desktopov\u00fd klient PokerTH.",
     r: "Pravidl\u00e1 Texas Hold\u2019em", pv: "S\u00fakromie" },
  ro: { m: "Trei moduri de a juca: antrenament offline \u00eempotriva adversarilor controla\u021bi de calculator, LAN sau un server dedicat privat \u0219i re\u021beaua oficial\u0103 pokerth.net cu clasamente sezoniere. Reguli complete de Texas Hold\u2019em, p\u00e2n\u0103 la 10 juc\u0103tori la mas\u0103, instalabil ca aplica\u021bie (PWA) pe calculator \u0219i telefon.",
     g: "Complet gratuit \u0219i open source: f\u0103r\u0103 reclame, f\u0103r\u0103 achizi\u021bii \u00een aplica\u021bie, f\u0103r\u0103 bani reali \u2014 doar jetoane virtuale. 45 de limbi ale interfe\u021bei, pachete de c\u0103r\u021bi \u0219i stiluri de mas\u0103 personalizabile \u0219i acelea\u0219i func\u021bii ca \u00een clientul desktop oficial PokerTH.",
     r: "Regulile Texas Hold\u2019em", pv: "Confiden\u021bialitate" },
  hu: { m: "H\u00e1rom j\u00e1t\u00e9km\u00f3d: offline gyakorl\u00e1s g\u00e9p vez\u00e9relte ellenfelek ellen, LAN vagy saj\u00e1t dedik\u00e1lt szerver, valamint a hivatalos pokerth.net h\u00e1l\u00f3zat szezon\u00e1lis ranglist\u00e1kkal. Teljes Texas Hold\u2019em szab\u00e1lyok, asztalonk\u00e9nt ak\u00e1r 10 j\u00e1t\u00e9kos, \u00e9s alkalmaz\u00e1sk\u00e9nt (PWA) telep\u00edthet\u0151 sz\u00e1m\u00edt\u00f3g\u00e9pre \u00e9s mobilra.",
     g: "Teljesen ingyenes \u00e9s ny\u00edlt forr\u00e1sk\u00f3d\u00fa: nincs rekl\u00e1m, nincs alkalmaz\u00e1son bel\u00fcli v\u00e1s\u00e1rl\u00e1s, nincs val\u00f3di p\u00e9nz \u2014 csak j\u00e1t\u00e9kzseton. 45 nyelv\u0171 fel\u00fclet, testreszabhat\u00f3 k\u00e1rtyapaklik \u00e9s asztalst\u00edlusok, \u00e9s a hivatalos PokerTH asztali klienssel azonos funkci\u00f3k.",
     r: "Texas Hold\u2019em szab\u00e1lyok", pv: "Adatv\u00e9delem" },
  el: { m: "\u03a4\u03c1\u03b5\u03b9\u03c2 \u03c4\u03c1\u03cc\u03c0\u03bf\u03b9 \u03c0\u03b1\u03b9\u03c7\u03bd\u03b9\u03b4\u03b9\u03bf\u03cd: \u03b5\u03be\u03ac\u03c3\u03ba\u03b7\u03c3\u03b7 \u03b5\u03ba\u03c4\u03cc\u03c2 \u03c3\u03cd\u03bd\u03b4\u03b5\u03c3\u03b7\u03c2 \u03b5\u03bd\u03b1\u03bd\u03c4\u03af\u03bf\u03bd \u03b1\u03bd\u03c4\u03b9\u03c0\u03ac\u03bb\u03c9\u03bd \u03c4\u03bf\u03c5 \u03c5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae, \u03c4\u03bf\u03c0\u03b9\u03ba\u03cc \u03b4\u03af\u03ba\u03c4\u03c5\u03bf \u03ae \u03b9\u03b4\u03b9\u03c9\u03c4\u03b9\u03ba\u03cc\u03c2 \u03b4\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ae\u03c2, \u03ba\u03b1\u03b9 \u03c4\u03bf \u03b5\u03c0\u03af\u03c3\u03b7\u03bc\u03bf \u03b4\u03af\u03ba\u03c4\u03c5\u03bf pokerth.net \u03bc\u03b5 \u03b2\u03b1\u03b8\u03bc\u03bf\u03bb\u03bf\u03b3\u03af\u03b5\u03c2 \u03b1\u03bd\u03ac \u03c3\u03b5\u03b6\u03cc\u03bd. \u03a0\u03bb\u03ae\u03c1\u03b5\u03b9\u03c2 \u03ba\u03b1\u03bd\u03cc\u03bd\u03b5\u03c2 Texas Hold\u2019em, \u03ad\u03c9\u03c2 10 \u03c0\u03b1\u03af\u03ba\u03c4\u03b5\u03c2 \u03b1\u03bd\u03ac \u03c4\u03c1\u03b1\u03c0\u03ad\u03b6\u03b9, \u03ba\u03b1\u03b9 \u03b5\u03b3\u03ba\u03b1\u03c4\u03ac\u03c3\u03c4\u03b1\u03c3\u03b7 \u03c9\u03c2 \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ae (PWA) \u03c3\u03b5 \u03c5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae \u03ba\u03b1\u03b9 \u03ba\u03b9\u03bd\u03b7\u03c4\u03cc.",
     g: "\u0395\u03bd\u03c4\u03b5\u03bb\u03ce\u03c2 \u03b4\u03c9\u03c1\u03b5\u03ac\u03bd \u03ba\u03b1\u03b9 \u03b1\u03bd\u03bf\u03b9\u03c7\u03c4\u03bf\u03cd \u03ba\u03ce\u03b4\u03b9\u03ba\u03b1: \u03c7\u03c9\u03c1\u03af\u03c2 \u03b4\u03b9\u03b1\u03c6\u03b7\u03bc\u03af\u03c3\u03b5\u03b9\u03c2, \u03c7\u03c9\u03c1\u03af\u03c2 \u03b1\u03b3\u03bf\u03c1\u03ad\u03c2 \u03b5\u03bd\u03c4\u03cc\u03c2 \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ae\u03c2, \u03c7\u03c9\u03c1\u03af\u03c2 \u03c0\u03c1\u03b1\u03b3\u03bc\u03b1\u03c4\u03b9\u03ba\u03ac \u03c7\u03c1\u03ae\u03bc\u03b1\u03c4\u03b1 \u2014 \u03bc\u03cc\u03bd\u03bf \u03b5\u03b9\u03ba\u03bf\u03bd\u03b9\u03ba\u03ad\u03c2 \u03bc\u03ac\u03c1\u03ba\u03b5\u03c2. 45 \u03b3\u03bb\u03ce\u03c3\u03c3\u03b5\u03c2 \u03b4\u03b9\u03b5\u03c0\u03b1\u03c6\u03ae\u03c2, \u03c0\u03c1\u03bf\u03c3\u03b1\u03c1\u03bc\u03cc\u03c3\u03b9\u03bc\u03b5\u03c2 \u03c4\u03c1\u03ac\u03c0\u03bf\u03c5\u03bb\u03b5\u03c2 \u03ba\u03b1\u03b9 \u03c3\u03c4\u03c5\u03bb \u03c4\u03c1\u03b1\u03c0\u03b5\u03b6\u03b9\u03bf\u03cd, \u03ba\u03b1\u03b9 \u03af\u03b4\u03b9\u03b5\u03c2 \u03b4\u03c5\u03bd\u03b1\u03c4\u03cc\u03c4\u03b7\u03c4\u03b5\u03c2 \u03bc\u03b5 \u03c4\u03bf\u03bd \u03b5\u03c0\u03af\u03c3\u03b7\u03bc\u03bf \u03b5\u03c0\u03b9\u03c4\u03c1\u03b1\u03c0\u03ad\u03b6\u03b9\u03bf \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7 PokerTH.",
     r: "\u039a\u03b1\u03bd\u03cc\u03bd\u03b5\u03c2 Texas Hold\u2019em", pv: "\u0391\u03c0\u03cc\u03c1\u03c1\u03b7\u03c4\u03bf" },
  bg: { m: "\u0422\u0440\u0438 \u043d\u0430\u0447\u0438\u043d\u0430 \u0437\u0430 \u0438\u0433\u0440\u0430: \u043e\u0444\u043b\u0430\u0439\u043d \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0430 \u0441\u0440\u0435\u0449\u0443 \u043a\u043e\u043c\u043f\u044e\u0442\u044a\u0440\u043d\u0438 \u043f\u0440\u043e\u0442\u0438\u0432\u043d\u0438\u0446\u0438, \u043b\u043e\u043a\u0430\u043b\u043d\u0430 \u043c\u0440\u0435\u0436\u0430 \u0438\u043b\u0438 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d \u0441\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043d \u0441\u044a\u0440\u0432\u044a\u0440, \u0438 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430\u0442\u0430 \u043c\u0440\u0435\u0436\u0430 pokerth.net \u0441\u044a\u0441 \u0441\u0435\u0437\u043e\u043d\u043d\u0438 \u043a\u043b\u0430\u0441\u0430\u0446\u0438\u0438. \u041f\u044a\u043b\u043d\u0438 \u043f\u0440\u0430\u0432\u0438\u043b\u0430 \u043d\u0430 Texas Hold\u2019em, \u0434\u043e 10 \u0438\u0433\u0440\u0430\u0447\u0438 \u043d\u0430 \u043c\u0430\u0441\u0430, \u0438 \u0438\u043d\u0441\u0442\u0430\u043b\u0438\u0440\u0430\u043d\u0435 \u043a\u0430\u0442\u043e \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 (PWA) \u043d\u0430 \u043a\u043e\u043c\u043f\u044e\u0442\u044a\u0440 \u0438 \u0442\u0435\u043b\u0435\u0444\u043e\u043d.",
     g: "\u041d\u0430\u043f\u044a\u043b\u043d\u043e \u0431\u0435\u0437\u043f\u043b\u0430\u0442\u043d\u043e \u0438 \u0441 \u043e\u0442\u0432\u043e\u0440\u0435\u043d \u043a\u043e\u0434: \u0431\u0435\u0437 \u0440\u0435\u043a\u043b\u0430\u043c\u0438, \u0431\u0435\u0437 \u043f\u043e\u043a\u0443\u043f\u043a\u0438 \u0432 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435\u0442\u043e, \u0431\u0435\u0437 \u0438\u0433\u0440\u0430 \u0441 \u0438\u0441\u0442\u0438\u043d\u0441\u043a\u0438 \u043f\u0430\u0440\u0438 \u2014 \u0441\u0430\u043c\u043e \u0432\u0438\u0440\u0442\u0443\u0430\u043b\u043d\u0438 \u0447\u0438\u043f\u043e\u0432\u0435. 45 \u0435\u0437\u0438\u043a\u0430 \u043d\u0430 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430, \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0443\u0435\u043c\u0438 \u0442\u0435\u0441\u0442\u0435\u0442\u0430 \u043a\u0430\u0440\u0442\u0438 \u0438 \u0441\u0442\u0438\u043b\u043e\u0432\u0435 \u043d\u0430 \u043c\u0430\u0441\u0430\u0442\u0430, \u0438 \u0441\u044a\u0449\u0438\u0442\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u043a\u0430\u0442\u043e \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f \u043d\u0430\u0441\u0442\u043e\u043b\u0435\u043d \u043a\u043b\u0438\u0435\u043d\u0442 \u043d\u0430 PokerTH.",
     r: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u043d\u0430 Texas Hold\u2019em", pv: "\u041f\u043e\u0432\u0435\u0440\u0438\u0442\u0435\u043b\u043d\u043e\u0441\u0442" },
  hr: { m: "Tri na\u010dina igre: offline vje\u017ebanje protiv ra\u010dunalnih protivnika, LAN ili vlastiti namjenski poslu\u017eitelj te slu\u017ebena mre\u017ea pokerth.net sa sezonskim ljestvicama. Potpuna pravila Texas Hold\u2019ema, do 10 igra\u010da za stolom, i instalacija kao aplikacija (PWA) na ra\u010dunalu i mobitelu.",
     g: "Potpuno besplatno i otvorenog koda: bez oglasa, bez kupnji unutar aplikacije, bez igre za pravi novac \u2014 samo virtualni \u017eetoni. 45 jezika su\u010delja, prilagodljivi \u0161pilovi i stilovi stola te iste zna\u010dajke kao u slu\u017ebenom PokerTH klijentu za ra\u010dunala.",
     r: "Pravila Texas Hold\u2019ema", pv: "Privatnost" },
  sr: { m: "\u0422\u0440\u0438 \u043d\u0430\u0447\u0438\u043d\u0430 \u0438\u0433\u0440\u0435: \u043e\u0444\u043b\u0430\u0458\u043d \u0432\u0435\u0436\u0431\u0430\u045a\u0435 \u043f\u0440\u043e\u0442\u0438\u0432 \u0440\u0430\u0447\u0443\u043d\u0430\u0440\u0441\u043a\u0438\u0445 \u043f\u0440\u043e\u0442\u0438\u0432\u043d\u0438\u043a\u0430, \u043b\u043e\u043a\u0430\u043b\u043d\u0430 \u043c\u0440\u0435\u0436\u0430 \u0438\u043b\u0438 \u0441\u043e\u043f\u0441\u0442\u0432\u0435\u043d\u0438 \u043d\u0430\u043c\u0435\u043d\u0441\u043a\u0438 \u0441\u0435\u0440\u0432\u0435\u0440, \u0438 \u0437\u0432\u0430\u043d\u0438\u0447\u043d\u0430 \u043c\u0440\u0435\u0436\u0430 pokerth.net \u0441\u0430 \u0441\u0435\u0437\u043e\u043d\u0441\u043a\u0438\u043c \u0440\u0430\u043d\u0433-\u043b\u0438\u0441\u0442\u0430\u043c\u0430. \u041f\u043e\u0442\u043f\u0443\u043d\u0430 \u043f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019ema, \u0434\u043e 10 \u0438\u0433\u0440\u0430\u0447\u0430 \u0437\u0430 \u0441\u0442\u043e\u043b\u043e\u043c, \u0438 \u0438\u043d\u0441\u0442\u0430\u043b\u0430\u0446\u0438\u0458\u0430 \u043a\u0430\u043e \u0430\u043f\u043b\u0438\u043a\u0430\u0446\u0438\u0458\u0430 (PWA) \u043d\u0430 \u0440\u0430\u0447\u0443\u043d\u0430\u0440\u0443 \u0438 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0443.",
     g: "\u041f\u043e\u0442\u043f\u0443\u043d\u043e \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e \u0438 \u043e\u0442\u0432\u043e\u0440\u0435\u043d\u043e\u0433 \u043a\u043e\u0434\u0430: \u0431\u0435\u0437 \u0440\u0435\u043a\u043b\u0430\u043c\u0430, \u0431\u0435\u0437 \u043a\u0443\u043f\u043e\u0432\u0438\u043d\u0430 \u0443 \u0430\u043f\u043b\u0438\u043a\u0430\u0446\u0438\u0458\u0438, \u0431\u0435\u0437 \u0438\u0433\u0440\u0435 \u0437\u0430 \u043f\u0440\u0430\u0432\u0438 \u043d\u043e\u0432\u0430\u0446 \u2014 \u0441\u0430\u043c\u043e \u0432\u0438\u0440\u0442\u0443\u0435\u043b\u043d\u0438 \u0436\u0435\u0442\u043e\u043d\u0438. 45 \u0458\u0435\u0437\u0438\u043a\u0430 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0458\u0441\u0430, \u043f\u0440\u0438\u043b\u0430\u0433\u043e\u0434\u0459\u0438\u0432\u0438 \u0448\u043f\u0438\u043b\u043e\u0432\u0438 \u0438 \u0441\u0442\u0438\u043b\u043e\u0432\u0438 \u0441\u0442\u043e\u043b\u0430, \u0438 \u0438\u0441\u0442\u0435 \u043c\u043e\u0433\u0443\u045b\u043d\u043e\u0441\u0442\u0438 \u043a\u0430\u043e \u0437\u0432\u0430\u043d\u0438\u0447\u043d\u0438 PokerTH \u043a\u043b\u0438\u0458\u0435\u043d\u0442 \u0437\u0430 \u0440\u0430\u0447\u0443\u043d\u0430\u0440\u0435.",
     r: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019ema", pv: "\u041f\u0440\u0438\u0432\u0430\u0442\u043d\u043e\u0441\u0442" },
  af: { m: "Drie maniere om te speel: vanlyn oefening teen rekenaarteenstanders, LAN of \u2019n eie toegewyde bediener, en die amptelike pokerth.net-netwerk met seisoenranglyste. Volledige Texas Hold\u2019em-re\u00ebls, tot 10 spelers per tafel, en installeerbaar as \u2019n program (PWA) op rekenaar en selfoon.",
     g: "Heeltemal gratis en oopbron: geen advertensies, geen aankope in die program nie, geen dobbel met regte geld nie \u2014 net speelfiches. 45 koppelvlaktale, aanpasbare kaartstelle en tafelstyle, en dieselfde funksies as die amptelike PokerTH-rekenaarkli\u00ebnt.",
     r: "Texas Hold\u2019em-re\u00ebls", pv: "Privaatheid" },
  ca: { m: "Tres maneres de jugar: pr\u00e0ctica fora de l\u00ednia contra adversaris controlats per l\u2019ordinador, LAN o un servidor dedicat privat, i la xarxa oficial pokerth.net amb classificacions per temporada. Regles completes del Texas Hold\u2019em, fins a 10 jugadors per taula, i instal\u00b7lable com a aplicaci\u00f3 (PWA) a l\u2019ordinador i al m\u00f2bil.",
     g: "Totalment gratu\u00eft i de codi obert: sense anuncis, sense compres integrades, sense diners reals \u2014 nom\u00e9s fitxes virtuals. 45 idiomes d\u2019interf\u00edcie, baralles i estils de taula personalitzables, i les mateixes funcions que el client d\u2019escriptori oficial de PokerTH.",
     r: "Regles del Texas Hold\u2019em", pv: "Privadesa" },
  gl: { m: "Tres maneiras de xogar: pr\u00e1ctica sen conexi\u00f3n contra adversarios controlados polo ordenador, LAN ou un servidor dedicado privado, e a rede oficial pokerth.net con clasificaci\u00f3ns por temporada. Regras completas do Texas Hold\u2019em, ata 10 xogadores por mesa, e instalable como aplicaci\u00f3n (PWA) no ordenador e no m\u00f3bil.",
     g: "Totalmente gratu\u00edto e de c\u00f3digo aberto: sen anuncios, sen compras integradas, sen di\u00f1eiro real \u2014 s\u00f3 fichas virtuais. 45 idiomas de interface, barallas e estilos de mesa personalizables, e as mesmas funci\u00f3ns que o cliente de escritorio oficial de PokerTH.",
     r: "Regras do Texas Hold\u2019em", pv: "Privacidade" },
  gd: { m: "Tr\u00ec d\u00f2ighean air cluich: cleachdadh far loidhne an aghaidh luchd-d\u00f9bhlain a\u2019 choimpiutair, LAN no frithealaiche pr\u00ecobhaideach agad fh\u00e8in, agus l\u00econra oifigeil pokerth.net le rangachadh r\u00e0iteil. Riaghailtean Texas Hold\u2019em gu l\u00e8ir, suas ri 10 cluicheadairean aig a\u2019 bh\u00f2rd, agus gabhaidh a st\u00e0ladh mar aplacaid (PWA) air coimpiutair is f\u00f2n.",
     g: "Gu tur an-asgaidh agus le c\u00f2d fosgailte: gun sanasan, gun cheannach am broinn na h-aplacaid, gun chearrachas le f\u00ecor airgead \u2014 d\u00ecreach airgead cluiche. 45 c\u00e0nan eadar-aghaidh, pacaidean chairtean agus stoidhlean b\u00f9ird gan gn\u00e0thachadh, agus na h-aon ghleusan ris a\u2019 chliant deasg oifigeil PokerTH.",
     r: "Riaghailtean Texas Hold\u2019em", pv: "Pr\u00ecobhaideachd" },
  lt: { m: "Trys b\u016bdai \u017eaisti: treniruot\u0117 neprisijungus prie\u0161 kompiuterio valdomus var\u017eovus, vietinis tinklas arba nuosavas serveris ir oficialus pokerth.net tinklas su sezono reitingais. Visos Texas Hold\u2019em taisykl\u0117s, iki 10 \u017eaid\u0117j\u0173 prie stalo, \u012fdiegiama kaip programa (PWA) kompiuteryje ir telefone.",
     g: "Vis\u0161kai nemokama ir atvirojo kodo: joki\u0173 reklam\u0173, joki\u0173 pirkim\u0173 programoje, joki\u0173 tikr\u0173 pinig\u0173 \u2014 tik \u017eaidimo \u017eetonai. 45 s\u0105sajos kalbos, kei\u010diamos kort\u0173 kalad\u0117s ir stal\u0173 stiliai, tos pa\u010dios funkcijos kaip oficialioje PokerTH kompiuterio programoje.",
     r: "Texas Hold\u2019em taisykl\u0117s", pv: "Privatumas" },
  ta: { m: "\u0bb5\u0bbf\u0bb3\u0bc8\u0baf\u0bbe\u0b9f \u0bae\u0bc2\u0ba9\u0bcd\u0bb1\u0bc1 \u0bb5\u0bb4\u0bbf\u0b95\u0bb3\u0bcd: \u0b95\u0ba3\u0bbf\u0ba9\u0bbf \u0b8e\u0ba4\u0bbf\u0bb0\u0bbe\u0bb3\u0bbf\u0b95\u0bb3\u0bc1\u0b95\u0bcd\u0b95\u0bc1 \u0b8e\u0ba4\u0bbf\u0bb0\u0bbe\u0b95 \u0b87\u0ba3\u0bc8\u0baf\u0bae\u0bbf\u0bb2\u0bcd\u0bb2\u0bbe\u0bae\u0bb2\u0bcd \u0baa\u0baf\u0bbf\u0bb1\u0bcd\u0b9a\u0bbf, LAN \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 \u0b9a\u0bca\u0ba8\u0bcd\u0ba4 \u0baa\u0bbf\u0bb0\u0ba4\u0bcd\u0baf\u0bc7\u0b95 \u0b9a\u0bc7\u0bb5\u0bc8\u0baf\u0b95\u0bae\u0bcd, \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0baa\u0bb0\u0bc1\u0bb5\u0b95\u0bbe\u0bb2 \u0ba4\u0bb0\u0bb5\u0bb0\u0bbf\u0b9a\u0bc8\u0b95\u0bb3\u0bc1\u0b9f\u0ba9\u0bcd \u0b95\u0bc2\u0b9f\u0bbf\u0baf \u0b85\u0ba4\u0bbf\u0b95\u0bbe\u0bb0\u0baa\u0bcd\u0baa\u0bc2\u0bb0\u0bcd\u0bb5 pokerth.net \u0bb5\u0bb2\u0bc8\u0baf\u0bae\u0bc8\u0baa\u0bcd\u0baa\u0bc1. \u0bae\u0bc1\u0bb4\u0bc1\u0bae\u0bc8\u0baf\u0bbe\u0ba9 Texas Hold\u2019em \u0bb5\u0bbf\u0ba4\u0bbf\u0b95\u0bb3\u0bcd, \u0b92\u0bb0\u0bc1 \u0bae\u0bc7\u0b9c\u0bc8\u0b95\u0bcd\u0b95\u0bc1 10 \u0bb5\u0bc0\u0bb0\u0bb0\u0bcd\u0b95\u0bb3\u0bcd \u0bb5\u0bb0\u0bc8, \u0b95\u0ba3\u0bbf\u0ba9\u0bbf \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0b95\u0bc8\u0baa\u0bc7\u0b9a\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0b9a\u0bc6\u0baf\u0bb2\u0bbf\u0baf\u0bbe\u0b95 (PWA) \u0ba8\u0bbf\u0bb1\u0bc1\u0bb5\u0bb2\u0bbe\u0bae\u0bcd.",
     g: "\u0bae\u0bc1\u0bb1\u0bcd\u0bb1\u0bbf\u0bb2\u0bc1\u0bae\u0bcd \u0b87\u0bb2\u0bb5\u0b9a\u0bae\u0bcd, \u0ba4\u0bbf\u0bb1\u0ba8\u0bcd\u0ba4 \u0bae\u0bc2\u0bb2\u0bae\u0bcd: \u0bb5\u0bbf\u0bb3\u0bae\u0bcd\u0baa\u0bb0\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0b87\u0bb2\u0bcd\u0bb2\u0bc8, \u0b9a\u0bc6\u0baf\u0bb2\u0bbf \u0b89\u0bb3\u0bcd \u0b95\u0bca\u0bb3\u0bcd\u0bae\u0bc1\u0ba4\u0bb2\u0bcd \u0b87\u0bb2\u0bcd\u0bb2\u0bc8, \u0b89\u0ba3\u0bcd\u0bae\u0bc8\u0baf\u0bbe\u0ba9 \u0baa\u0ba3\u0bae\u0bcd \u0b87\u0bb2\u0bcd\u0bb2\u0bc8 \u2014 \u0bb5\u0bbf\u0bb3\u0bc8\u0baf\u0bbe\u0b9f\u0bcd\u0b9f\u0bc1 \u0ba8\u0bbe\u0ba3\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0bae\u0b9f\u0bcd\u0b9f\u0bc1\u0bae\u0bc7. 45 \u0b87\u0b9f\u0bc8\u0bae\u0bc1\u0b95 \u0bae\u0bca\u0bb4\u0bbf\u0b95\u0bb3\u0bcd, \u0ba4\u0ba9\u0bbf\u0baa\u0bcd\u0baf\u0ba9\u0bbe\u0b95\u0bcd\u0b95\u0b95\u0bcd\u0b95\u0bc2\u0b9f\u0bbf\u0baf \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bcd\u0b95\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0bae\u0bc7\u0b9c\u0bc8 \u0baa\u0bbe\u0ba3\u0bbf\u0b95\u0bb3\u0bcd, \u0b85\u0ba4\u0bbf\u0b95\u0bbe\u0bb0\u0baa\u0bcd\u0baa\u0bc2\u0bb0\u0bcd\u0bb5 PokerTH \u0b9f\u0bc6\u0bb8\u0bcd\u0b95\u0bcd\u0b9f\u0bbe\u0baa\u0bcd \u0b9a\u0bc6\u0baf\u0bb2\u0bbf\u0b95\u0bcd\u0b95\u0bc1 \u0b87\u0ba3\u0bc8\u0baf\u0bbe\u0ba9 \u0bb5\u0b9a\u0ba4\u0bbf\u0b95\u0bb3\u0bcd.",
     r: "Texas Hold\u2019em \u0bb5\u0bbf\u0ba4\u0bbf\u0b95\u0bb3\u0bcd", pv: "\u0ba4\u0ba9\u0bbf\u0baf\u0bc1\u0bb0\u0bbf\u0bae\u0bc8" },
  vi: { m: "Ba c\u00e1ch ch\u01a1i: luy\u1ec7n t\u1eadp ngo\u1ea1i tuy\u1ebfn v\u1edbi \u0111\u1ed1i th\u1ee7 m\u00e1y t\u00ednh, m\u1ea1ng LAN ho\u1eb7c m\u00e1y ch\u1ee7 ri\u00eang, v\u00e0 m\u1ea1ng ch\u00ednh th\u1ee9c pokerth.net v\u1edbi b\u1ea3ng x\u1ebfp h\u1ea1ng theo m\u00f9a. \u0110\u1ea7y \u0111\u1ee7 lu\u1eadt Texas Hold\u2019em, t\u1ed1i \u0111a 10 ng\u01b0\u1eddi m\u1ed7i b\u00e0n, v\u00e0 c\u00f3 th\u1ec3 c\u00e0i \u0111\u1eb7t nh\u01b0 m\u1ed9t \u1ee9ng d\u1ee5ng (PWA) tr\u00ean m\u00e1y t\u00ednh v\u00e0 \u0111i\u1ec7n tho\u1ea1i.",
     g: "Ho\u00e0n to\u00e0n mi\u1ec5n ph\u00ed v\u00e0 m\u00e3 ngu\u1ed3n m\u1edf: kh\u00f4ng qu\u1ea3ng c\u00e1o, kh\u00f4ng mua trong \u1ee9ng d\u1ee5ng, kh\u00f4ng c\u1edd b\u1ea1c ti\u1ec1n th\u1eadt \u2014 ch\u1ec9 d\u00f9ng chip \u1ea3o. 45 ng\u00f4n ng\u1eef giao di\u1ec7n, b\u1ed9 b\u00e0i v\u00e0 ki\u1ec3u b\u00e0n t\u00f9y ch\u1ec9nh, v\u00e0 \u0111\u1ea7y \u0111\u1ee7 t\u00ednh n\u0103ng nh\u01b0 \u1ee9ng d\u1ee5ng PokerTH tr\u00ean m\u00e1y t\u00ednh.",
     r: "Lu\u1eadt Texas Hold\u2019em", pv: "Quy\u1ec1n ri\u00eang t\u01b0" },
  ko: { m: "\uc138 \uac00\uc9c0 \ud50c\ub808\uc774 \ubc29\uc2dd: \ucef4\ud4e8\ud130 \uc0c1\ub300\uc640\uc758 \uc624\ud504\ub77c\uc778 \uc5f0\uc2b5, LAN \ub610\ub294 \uac1c\uc778 \uc804\uc6a9 \uc11c\ubc84, \uadf8\ub9ac\uace0 \uc2dc\uc98c \ub7ad\ud0b9\uc774 \uc788\ub294 \uacf5\uc2dd pokerth.net \ub124\ud2b8\uc6cc\ud06c. \uc644\uc804\ud55c \ud14d\uc0ac\uc2a4 \ud640\ub364 \uaddc\uce59, \ud14c\uc774\ube14\ub2f9 \ucd5c\ub300 10\uba85, \ub370\uc2a4\ud06c\ud1b1\uacfc \ubaa8\ubc14\uc77c\uc5d0 \uc571(PWA)\uc73c\ub85c \uc124\uce58\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
     g: "\uc644\uc804 \ubb34\ub8cc \uc624\ud508\uc18c\uc2a4: \uad11\uace0 \uc5c6\uc74c, \uc778\uc571 \uacb0\uc81c \uc5c6\uc74c, \uc2e4\uc81c \ub3c8\uc744 \uac70\ub294 \ub3c4\ubc15 \uc5c6\uc74c \u2014 \uac00\uc0c1 \uce69\ub9cc \uc0ac\uc6a9\ud569\ub2c8\ub2e4. 45\uac1c \uc778\ud130\ud398\uc774\uc2a4 \uc5b8\uc5b4, \uce74\ub4dc \ub371\uacfc \ud14c\uc774\ube14 \uc2a4\ud0c0\uc77c \ubcc0\uacbd \uac00\ub2a5, \uacf5\uc2dd PokerTH \ub370\uc2a4\ud06c\ud1b1 \ud074\ub77c\uc774\uc5b8\ud2b8\uc640 \ub3d9\uc77c\ud55c \uae30\ub2a5\uc744 \uc81c\uacf5\ud569\ub2c8\ub2e4.",
     r: "\ud14d\uc0ac\uc2a4 \ud640\ub364 \uaddc\uce59", pv: "\uac1c\uc778\uc815\ubcf4 \ucc98\ub9ac\ubc29\uce68" },
  "zh-TW": { m: "\u4e09\u7a2e\u73a9\u6cd5\uff1a\u96e2\u7dda\u8207\u96fb\u8166\u5c0d\u624b\u7df4\u7fd2\u3001\u5340\u57df\u7db2\u8def\u6216\u81ea\u67b6\u5c08\u7528\u4f3a\u670d\u5668\u5c0d\u5c40\uff0c\u4ee5\u53ca\u5177\u5099\u8cfd\u5b63\u6392\u540d\u7684\u5b98\u65b9 pokerth.net \u7db2\u8def\u3002\u5b8c\u6574\u7684\u5fb7\u5dde\u64b2\u514b\u898f\u5247\uff0c\u6bcf\u684c\u6700\u591a 10 \u4f4d\u73a9\u5bb6\uff0c\u4e26\u53ef\u4f5c\u70ba\u61c9\u7528\u7a0b\u5f0f\uff08PWA\uff09\u5b89\u88dd\u5230\u96fb\u8166\u548c\u624b\u6a5f\u4e0a\u3002",
     g: "\u5b8c\u5168\u514d\u8cbb\u4e14\u958b\u6e90\uff1a\u7121\u5ee3\u544a\u3001\u7121\u5167\u8cfc\u3001\u4e0d\u6d89\u53ca\u771f\u9322\u8ced\u535a\u2014\u2014\u53ea\u4f7f\u7528\u865b\u64ec\u7c4c\u78bc\u300245 \u7a2e\u4ecb\u9762\u8a9e\u8a00\uff0c\u53ef\u81ea\u8a02\u724c\u80cc\u8207\u724c\u684c\u6a23\u5f0f\uff0c\u529f\u80fd\u8207\u5b98\u65b9 PokerTH \u684c\u9762\u7248\u7528\u6236\u7aef\u4e00\u81f4\u3002",
     r: "\u5fb7\u5dde\u64b2\u514b\u898f\u5247", pv: "\u96b1\u79c1\u6b0a" },
  hi: { m: "\u0916\u0947\u0932\u0928\u0947 \u0915\u0947 \u0924\u0940\u0928 \u0924\u0930\u0940\u0915\u0947: \u0915\u0902\u092a\u094d\u092f\u0942\u091f\u0930 \u092a\u094d\u0930\u0924\u093f\u0926\u094d\u0935\u0902\u0926\u094d\u0935\u093f\u092f\u094b\u0902 \u0915\u0947 \u0935\u093f\u0930\u0941\u0926\u094d\u0927 \u0911\u095e\u0932\u093e\u0907\u0928 \u0905\u092d\u094d\u092f\u093e\u0938, LAN \u092f\u093e \u0905\u092a\u0928\u093e \u0928\u093f\u091c\u0940 \u0938\u092e\u0930\u094d\u092a\u093f\u0924 \u0938\u0930\u094d\u0935\u0930, \u0914\u0930 \u0938\u0940\u095b\u0928 \u0930\u0948\u0902\u0915\u093f\u0902\u0917 \u0935\u093e\u0932\u093e \u0906\u0927\u093f\u0915\u093e\u0930\u093f\u0915 pokerth.net \u0928\u0947\u091f\u0935\u0930\u094d\u0915\u0964 \u092a\u0942\u0930\u0947 Texas Hold\u2019em \u0928\u093f\u092f\u092e, \u092a\u094d\u0930\u0924\u093f \u091f\u0947\u092c\u0932 10 \u0916\u093f\u0932\u093e\u095c\u093f\u092f\u094b\u0902 \u0924\u0915, \u0914\u0930 \u0915\u0902\u092a\u094d\u092f\u0942\u091f\u0930 \u0935 \u092e\u094b\u092c\u093e\u0907\u0932 \u092a\u0930 \u0910\u092a (PWA) \u0915\u0947 \u0930\u0942\u092a \u092e\u0947\u0902 \u0907\u0902\u0938\u094d\u091f\u0949\u0932 \u0915\u0930\u0928\u0947 \u0915\u0940 \u0938\u0941\u0935\u093f\u0927\u093e\u0964",
     g: "\u092a\u0942\u0930\u0940 \u0924\u0930\u0939 \u092e\u0941\u095e\u094d\u0924 \u0914\u0930 \u0913\u092a\u0928 \u0938\u094b\u0930\u094d\u0938: \u0915\u094b\u0908 \u0935\u093f\u091c\u094d\u091e\u093e\u092a\u0928 \u0928\u0939\u0940\u0902, \u0915\u094b\u0908 \u0907\u0928-\u0910\u092a \u0916\u093c\u0930\u0940\u0926 \u0928\u0939\u0940\u0902, \u0905\u0938\u0932\u0940 \u092a\u0948\u0938\u0947 \u0915\u093e \u091c\u0941\u0906 \u0928\u0939\u0940\u0902 \u2014 \u0915\u0947\u0935\u0932 \u0916\u0947\u0932 \u0915\u0947 \u091a\u093f\u092a\u094d\u0938\u0964 45 \u0907\u0902\u091f\u0930\u095e\u0947\u0938 \u092d\u093e\u0937\u093e\u090f\u0901, \u092e\u0928\u091a\u093e\u0939\u0947 \u0915\u093e\u0930\u094d\u0921 \u0921\u0947\u0915 \u0914\u0930 \u091f\u0947\u092c\u0932 \u0936\u0948\u0932\u093f\u092f\u093e\u0901, \u0914\u0930 \u0906\u0927\u093f\u0915\u093e\u0930\u093f\u0915 PokerTH \u0921\u0947\u0938\u094d\u0915\u091f\u0949\u092a \u0915\u094d\u0932\u093e\u0907\u0902\u091f \u091c\u0948\u0938\u0940 \u0939\u0940 \u0938\u0941\u0935\u093f\u0927\u093e\u090f\u0901\u0964",
     r: "Texas Hold\u2019em \u0915\u0947 \u0928\u093f\u092f\u092e", pv: "\u0917\u094b\u092a\u0928\u0940\u092f\u0924\u093e" },
  ar: { m: "\u062b\u0644\u0627\u062b \u0637\u0631\u0642 \u0644\u0644\u0639\u0628: \u062a\u062f\u0631\u064a\u0628 \u062f\u0648\u0646 \u0627\u062a\u0635\u0627\u0644 \u0636\u062f \u062e\u0635\u0648\u0645 \u064a\u062f\u064a\u0631\u0647\u0645 \u0627\u0644\u062d\u0627\u0633\u0648\u0628\u060c \u0623\u0648 \u0634\u0628\u0643\u0629 \u0645\u062d\u0644\u064a\u0629 \u0623\u0648 \u062e\u0627\u062f\u0645 \u062e\u0627\u0635\u060c \u0623\u0648 \u0634\u0628\u0643\u0629 pokerth.net \u0627\u0644\u0631\u0633\u0645\u064a\u0629 \u0628\u062a\u0635\u0646\u064a\u0641\u0627\u062a \u0645\u0648\u0633\u0645\u064a\u0629. \u0642\u0648\u0627\u0639\u062f \u062a\u0643\u0633\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u0643\u0627\u0645\u0644\u0629\u060c \u062d\u062a\u0649 10 \u0644\u0627\u0639\u0628\u064a\u0646 \u0639\u0644\u0649 \u0627\u0644\u0637\u0627\u0648\u0644\u0629\u060c \u0648\u064a\u0645\u0643\u0646 \u062a\u062b\u0628\u064a\u062a\u0647 \u0643\u062a\u0637\u0628\u064a\u0642 (PWA) \u0639\u0644\u0649 \u0627\u0644\u062d\u0627\u0633\u0648\u0628 \u0648\u0627\u0644\u0647\u0627\u062a\u0641.",
     g: "\u0645\u062c\u0627\u0646\u064a \u062a\u0645\u0627\u0645\u064b\u0627 \u0648\u0645\u0641\u062a\u0648\u062d \u0627\u0644\u0645\u0635\u062f\u0631: \u0628\u0644\u0627 \u0625\u0639\u0644\u0627\u0646\u0627\u062a\u060c \u0648\u0628\u0644\u0627 \u0645\u0634\u062a\u0631\u064a\u0627\u062a \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642\u060c \u0648\u0628\u0644\u0627 \u0645\u0642\u0627\u0645\u0631\u0629 \u0628\u0623\u0645\u0648\u0627\u0644 \u062d\u0642\u064a\u0642\u064a\u0629 \u2014 \u0631\u0642\u0627\u0626\u0642 \u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629 \u0641\u0642\u0637. 45 \u0644\u063a\u0629 \u0644\u0644\u0648\u0627\u062c\u0647\u0629\u060c \u0648\u0623\u0637\u0642\u0645 \u0623\u0648\u0631\u0627\u0642 \u0648\u0623\u0646\u0645\u0627\u0637 \u0637\u0627\u0648\u0644\u0627\u062a \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062a\u062e\u0635\u064a\u0635\u060c \u0648\u0645\u064a\u0632\u0627\u062a \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0639\u0645\u064a\u0644 PokerTH \u0627\u0644\u0631\u0633\u0645\u064a \u0639\u0644\u0649 \u0633\u0637\u062d \u0627\u0644\u0645\u0643\u062a\u0628.",
     r: "\u0642\u0648\u0627\u0639\u062f \u062a\u0643\u0633\u0627\u0633 \u0647\u0648\u0644\u062f\u0645", pv: "\u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629" },
  fa: { m: "\u0633\u0647 \u0631\u0627\u0647 \u0628\u0631\u0627\u06cc \u0628\u0627\u0632\u06cc: \u062a\u0645\u0631\u06cc\u0646 \u0622\u0641\u0644\u0627\u06cc\u0646 \u062f\u0631 \u0628\u0631\u0627\u0628\u0631 \u062d\u0631\u06cc\u0641\u0627\u0646 \u0631\u0627\u06cc\u0627\u0646\u0647\u200c\u0627\u06cc\u060c \u0634\u0628\u06a9\u0647 \u0645\u062d\u0644\u06cc \u06cc\u0627 \u0633\u0631\u0648\u0631 \u0627\u062e\u062a\u0635\u0627\u0635\u06cc \u0634\u062e\u0635\u06cc\u060c \u0648 \u0634\u0628\u06a9\u0647 \u0631\u0633\u0645\u06cc pokerth.net \u0628\u0627 \u0631\u062a\u0628\u0647\u200c\u0628\u0646\u062f\u06cc \u0641\u0635\u0644\u06cc. \u0642\u0648\u0627\u0639\u062f \u06a9\u0627\u0645\u0644 \u062a\u06af\u0632\u0627\u0633 \u0647\u0648\u0644\u062f\u0645\u060c \u062a\u0627 \u06f1\u06f0 \u0628\u0627\u0632\u06cc\u06a9\u0646 \u062f\u0631 \u0647\u0631 \u0645\u06cc\u0632\u060c \u0648 \u0642\u0627\u0628\u0644 \u0646\u0635\u0628 \u0628\u0647\u200c\u0639\u0646\u0648\u0627\u0646 \u0627\u067e\u0644\u06cc\u06a9\u06cc\u0634\u0646 (PWA) \u0631\u0648\u06cc \u0631\u0627\u06cc\u0627\u0646\u0647 \u0648 \u06af\u0648\u0634\u06cc.",
     g: "\u06a9\u0627\u0645\u0644\u0627\u064b \u0631\u0627\u06cc\u06af\u0627\u0646 \u0648 \u0645\u062a\u0646\u200c\u0628\u0627\u0632: \u0628\u062f\u0648\u0646 \u062a\u0628\u0644\u06cc\u063a\u0627\u062a\u060c \u0628\u062f\u0648\u0646 \u062e\u0631\u06cc\u062f \u062f\u0631\u0648\u0646\u200c\u0628\u0631\u0646\u0627\u0645\u0647\u200c\u0627\u06cc\u060c \u0628\u062f\u0648\u0646 \u0634\u0631\u0637\u200c\u0628\u0646\u062f\u06cc \u0628\u0627 \u067e\u0648\u0644 \u0648\u0627\u0642\u0639\u06cc \u2014 \u0641\u0642\u0637 \u0698\u062a\u0648\u0646 \u0628\u0627\u0632\u06cc. \u06f4\u06f5 \u0632\u0628\u0627\u0646 \u0631\u0627\u0628\u0637 \u06a9\u0627\u0631\u0628\u0631\u06cc\u060c \u062f\u0633\u062a\u0647\u200c\u06a9\u0627\u0631\u062a\u200c\u0647\u0627 \u0648 \u0637\u0631\u062d\u200c\u0647\u0627\u06cc \u0645\u06cc\u0632 \u0642\u0627\u0628\u0644 \u0634\u062e\u0635\u06cc\u200c\u0633\u0627\u0632\u06cc\u060c \u0648 \u0627\u0645\u06a9\u0627\u0646\u0627\u062a\u06cc \u0628\u0631\u0627\u0628\u0631 \u0628\u0627 \u0646\u0633\u062e\u0647 \u0631\u0633\u0645\u06cc \u062f\u0633\u06a9\u062a\u0627\u067e PokerTH.",
     r: "\u0642\u0648\u0627\u0639\u062f \u062a\u06af\u0632\u0627\u0633 \u0647\u0648\u0644\u062f\u0645", pv: "\u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc" },
  he: { m: "\u05e9\u05dc\u05d5\u05e9 \u05d3\u05e8\u05db\u05d9\u05dd \u05dc\u05e9\u05d7\u05e7: \u05d0\u05d9\u05de\u05d5\u05df \u05dc\u05d0 \u05de\u05e7\u05d5\u05d5\u05df \u05de\u05d5\u05dc \u05d9\u05e8\u05d9\u05d1\u05d9\u05dd \u05de\u05de\u05d5\u05d7\u05e9\u05d1\u05d9\u05dd, \u05e8\u05e9\u05ea \u05de\u05e7\u05d5\u05de\u05d9\u05ea \u05d0\u05d5 \u05e9\u05e8\u05ea \u05d9\u05d9\u05e2\u05d5\u05d3\u05d9 \u05e4\u05e8\u05d8\u05d9, \u05d5\u05e8\u05e9\u05ea pokerth.net \u05d4\u05e8\u05e9\u05de\u05d9\u05ea \u05e2\u05dd \u05d3\u05d9\u05e8\u05d5\u05d2\u05d9\u05dd \u05e2\u05d5\u05e0\u05ea\u05d9\u05d9\u05dd. \u05d7\u05d5\u05e7\u05d9 \u05d8\u05e7\u05e1\u05d0\u05e1 \u05d4\u05d5\u05dc\u05d3\u05dd \u05d4\u05de\u05dc\u05d0\u05d9\u05dd, \u05e2\u05d3 10 \u05e9\u05d7\u05e7\u05e0\u05d9\u05dd \u05dc\u05e9\u05d5\u05dc\u05d7\u05df, \u05d5\u05e0\u05d9\u05ea\u05df \u05dc\u05d4\u05ea\u05e7\u05e0\u05d4 \u05db\u05d0\u05e4\u05dc\u05d9\u05e7\u05e6\u05d9\u05d4 (PWA) \u05d1\u05de\u05d7\u05e9\u05d1 \u05d5\u05d1\u05e0\u05d9\u05d9\u05d3.",
     g: "\u05d7\u05d9\u05e0\u05de\u05d9 \u05dc\u05d7\u05dc\u05d5\u05d8\u05d9\u05df \u05d5\u05d1\u05e7\u05d5\u05d3 \u05e4\u05ea\u05d5\u05d7: \u05d1\u05dc\u05d9 \u05e4\u05e8\u05e1\u05d5\u05de\u05d5\u05ea, \u05d1\u05dc\u05d9 \u05e8\u05db\u05d9\u05e9\u05d5\u05ea \u05d1\u05ea\u05d5\u05da \u05d4\u05d0\u05e4\u05dc\u05d9\u05e7\u05e6\u05d9\u05d4, \u05d1\u05dc\u05d9 \u05d4\u05d9\u05de\u05d5\u05e8\u05d9\u05dd \u05d1\u05db\u05e1\u05e3 \u05d0\u05de\u05d9\u05ea\u05d9 \u2014 \u05d6\u05f3\u05d8\u05d5\u05e0\u05d9\u05dd \u05d5\u05d9\u05e8\u05d8\u05d5\u05d0\u05dc\u05d9\u05d9\u05dd \u05d1\u05dc\u05d1\u05d3. 45 \u05e9\u05e4\u05d5\u05ea \u05de\u05de\u05e9\u05e7, \u05d7\u05e4\u05d9\u05e1\u05d5\u05ea \u05e7\u05dc\u05e4\u05d9\u05dd \u05d5\u05e1\u05d2\u05e0\u05d5\u05e0\u05d5\u05ea \u05e9\u05d5\u05dc\u05d7\u05df \u05dc\u05d4\u05ea\u05d0\u05de\u05d4 \u05d0\u05d9\u05e9\u05d9\u05ea, \u05d5\u05d0\u05d5\u05ea\u05df \u05d9\u05db\u05d5\u05dc\u05d5\u05ea \u05db\u05de\u05d5 \u05dc\u05e7\u05d5\u05d7 \u05e9\u05d5\u05dc\u05d7\u05df \u05d4\u05e2\u05d1\u05d5\u05d3\u05d4 \u05d4\u05e8\u05e9\u05de\u05d9 \u05e9\u05dc PokerTH.",
     r: "\u05d7\u05d5\u05e7\u05d9 \u05d8\u05e7\u05e1\u05d0\u05e1 \u05d4\u05d5\u05dc\u05d3\u05dd", pv: "\u05e4\u05e8\u05d8\u05d9\u05d5\u05ea" },
  ur: { m: "\u06a9\u06be\u06cc\u0644\u0646\u06d2 \u06a9\u06d2 \u062a\u06cc\u0646 \u0637\u0631\u06cc\u0642\u06d2: \u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u062d\u0631\u06cc\u0641\u0648\u06ba \u06a9\u06d2 \u062e\u0644\u0627\u0641 \u0622\u0641 \u0644\u0627\u0626\u0646 \u0645\u0634\u0642\u060c LAN \u06cc\u0627 \u0627\u067e\u0646\u0627 \u0645\u062e\u0635\u0648\u0635 \u0633\u0631\u0648\u0631\u060c \u0627\u0648\u0631 \u0633\u06cc\u0632\u0646 \u0631\u06cc\u0646\u06a9\u0646\u06af \u06a9\u06d2 \u0633\u0627\u062a\u06be \u0633\u0631\u06a9\u0627\u0631\u06cc pokerth.net \u0646\u06cc\u0679 \u0648\u0631\u06a9\u06d4 \u0679\u06cc\u06a9\u0633\u0627\u0633 \u06c1\u0648\u0644\u0688\u0645 \u06a9\u06d2 \u0645\u06a9\u0645\u0644 \u0627\u0635\u0648\u0644\u060c \u0641\u06cc \u0645\u06cc\u0632 10 \u06a9\u06be\u0644\u0627\u0691\u06cc\u0648\u06ba \u062a\u06a9\u060c \u0627\u0648\u0631 \u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u0648 \u0645\u0648\u0628\u0627\u0626\u0644 \u067e\u0631 \u0627\u06cc\u067e (PWA) \u06a9\u06d2 \u0637\u0648\u0631 \u067e\u0631 \u0627\u0646\u0633\u0679\u0627\u0644 \u06a9\u06cc\u0627 \u062c\u0627 \u0633\u06a9\u062a\u0627 \u06c1\u06d2\u06d4",
     g: "\u0645\u06a9\u0645\u0644 \u0637\u0648\u0631 \u067e\u0631 \u0645\u0641\u062a \u0627\u0648\u0631 \u0627\u0648\u067e\u0646 \u0633\u0648\u0631\u0633: \u06a9\u0648\u0626\u06cc \u0627\u0634\u062a\u06c1\u0627\u0631 \u0646\u06c1\u06cc\u06ba\u060c \u0627\u06cc\u067e \u0645\u06cc\u06ba \u06a9\u0648\u0626\u06cc \u062e\u0631\u06cc\u062f\u0627\u0631\u06cc \u0646\u06c1\u06cc\u06ba\u060c \u0627\u0635\u0644\u06cc \u067e\u06cc\u0633\u0648\u06ba \u06a9\u0627 \u062c\u0648\u0627 \u0646\u06c1\u06cc\u06ba \u2014 \u0635\u0631\u0641 \u06a9\u06be\u06cc\u0644 \u06a9\u06d2 \u0679\u0648\u06a9\u0646\u06d4 45 \u0627\u0646\u0679\u0631\u0641\u06cc\u0633 \u0632\u0628\u0627\u0646\u06cc\u06ba\u060c \u062d\u0633\u0628\u0650 \u062e\u0648\u0627\u06c1\u0634 \u06a9\u0627\u0631\u0688 \u0688\u06cc\u06a9 \u0627\u0648\u0631 \u0645\u06cc\u0632 \u06a9\u06d2 \u0627\u0646\u062f\u0627\u0632\u060c \u0627\u0648\u0631 \u0633\u0631\u06a9\u0627\u0631\u06cc PokerTH \u0688\u06cc\u0633\u06a9 \u0679\u0627\u067e \u06a9\u0644\u0627\u0626\u0646\u0679 \u062c\u06cc\u0633\u06cc \u06c1\u06cc \u062e\u0635\u0648\u0635\u06cc\u0627\u062a\u06d4",
     r: "\u0679\u06cc\u06a9\u0633\u0627\u0633 \u06c1\u0648\u0644\u0688\u0645 \u06a9\u06d2 \u0627\u0635\u0648\u0644", pv: "\u0631\u0627\u0632\u062f\u0627\u0631\u06cc" },
  id: { m: "Tiga cara bermain: latihan luring melawan lawan komputer, LAN atau server khusus pribadi, dan jaringan resmi pokerth.net dengan peringkat musiman. Aturan Texas Hold\u2019em lengkap, hingga 10 pemain per meja, dan dapat dipasang sebagai aplikasi (PWA) di komputer maupun ponsel.",
     g: "Sepenuhnya gratis dan sumber terbuka: tanpa iklan, tanpa pembelian dalam aplikasi, tanpa judi uang sungguhan \u2014 hanya chip permainan. 45 bahasa antarmuka, dek kartu dan gaya meja yang bisa disesuaikan, serta fitur yang setara dengan klien desktop resmi PokerTH.",
     r: "Aturan Texas Hold\u2019em", pv: "Privasi" },
  th: { m: "\u0e2a\u0e32\u0e21\u0e27\u0e34\u0e18\u0e35\u0e43\u0e19\u0e01\u0e32\u0e23\u0e40\u0e25\u0e48\u0e19: \u0e1d\u0e36\u0e01\u0e0b\u0e49\u0e2d\u0e21\u0e2d\u0e2d\u0e1f\u0e44\u0e25\u0e19\u0e4c\u0e01\u0e31\u0e1a\u0e04\u0e39\u0e48\u0e41\u0e02\u0e48\u0e07\u0e04\u0e2d\u0e21\u0e1e\u0e34\u0e27\u0e40\u0e15\u0e2d\u0e23\u0e4c \u0e40\u0e25\u0e48\u0e19\u0e1c\u0e48\u0e32\u0e19 LAN \u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e0b\u0e34\u0e23\u0e4c\u0e1f\u0e40\u0e27\u0e2d\u0e23\u0e4c\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27 \u0e41\u0e25\u0e30\u0e40\u0e04\u0e23\u0e37\u0e2d\u0e02\u0e48\u0e32\u0e22\u0e17\u0e32\u0e07\u0e01\u0e32\u0e23 pokerth.net \u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e2d\u0e31\u0e19\u0e14\u0e31\u0e1a\u0e1b\u0e23\u0e30\u0e08\u0e33\u0e24\u0e14\u0e39\u0e01\u0e32\u0e25 \u0e01\u0e15\u0e34\u0e01\u0e32 Texas Hold\u2019em \u0e04\u0e23\u0e1a\u0e16\u0e49\u0e27\u0e19 \u0e23\u0e2d\u0e07\u0e23\u0e31\u0e1a\u0e2a\u0e39\u0e07\u0e2a\u0e38\u0e14 10 \u0e1c\u0e39\u0e49\u0e40\u0e25\u0e48\u0e19\u0e15\u0e48\u0e2d\u0e42\u0e15\u0e4a\u0e30 \u0e41\u0e25\u0e30\u0e15\u0e34\u0e14\u0e15\u0e31\u0e49\u0e07\u0e40\u0e1b\u0e47\u0e19\u0e41\u0e2d\u0e1b (PWA) \u0e44\u0e14\u0e49\u0e17\u0e31\u0e49\u0e07\u0e1a\u0e19\u0e04\u0e2d\u0e21\u0e1e\u0e34\u0e27\u0e40\u0e15\u0e2d\u0e23\u0e4c\u0e41\u0e25\u0e30\u0e21\u0e37\u0e2d\u0e16\u0e37\u0e2d",
     g: "\u0e1f\u0e23\u0e35\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e41\u0e25\u0e30\u0e40\u0e1b\u0e47\u0e19\u0e42\u0e2d\u0e40\u0e1e\u0e19\u0e0b\u0e2d\u0e23\u0e4c\u0e2a: \u0e44\u0e21\u0e48\u0e21\u0e35\u0e42\u0e06\u0e29\u0e13\u0e32 \u0e44\u0e21\u0e48\u0e21\u0e35\u0e01\u0e32\u0e23\u0e0b\u0e37\u0e49\u0e2d\u0e43\u0e19\u0e41\u0e2d\u0e1b \u0e44\u0e21\u0e48\u0e21\u0e35\u0e01\u0e32\u0e23\u0e1e\u0e19\u0e31\u0e19\u0e14\u0e49\u0e27\u0e22\u0e40\u0e07\u0e34\u0e19\u0e08\u0e23\u0e34\u0e07 \u2014 \u0e43\u0e0a\u0e49\u0e0a\u0e34\u0e1b\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e40\u0e25\u0e48\u0e19\u0e2a\u0e19\u0e38\u0e01\u0e40\u0e17\u0e48\u0e32\u0e19\u0e31\u0e49\u0e19 \u0e23\u0e2d\u0e07\u0e23\u0e31\u0e1a 45 \u0e20\u0e32\u0e29\u0e32 \u0e1b\u0e23\u0e31\u0e1a\u0e41\u0e15\u0e48\u0e07\u0e2b\u0e19\u0e49\u0e32\u0e44\u0e1e\u0e48\u0e41\u0e25\u0e30\u0e23\u0e39\u0e1b\u0e41\u0e1a\u0e1a\u0e42\u0e15\u0e4a\u0e30\u0e44\u0e14\u0e49 \u0e41\u0e25\u0e30\u0e21\u0e35\u0e1f\u0e35\u0e40\u0e08\u0e2d\u0e23\u0e4c\u0e40\u0e17\u0e35\u0e22\u0e1a\u0e40\u0e17\u0e48\u0e32\u0e42\u0e1b\u0e23\u0e41\u0e01\u0e23\u0e21 PokerTH \u0e1a\u0e19\u0e40\u0e14\u0e2a\u0e01\u0e4c\u0e17\u0e47\u0e2d\u0e1b",
     r: "\u0e01\u0e15\u0e34\u0e01\u0e32 Texas Hold\u2019em", pv: "\u0e04\u0e27\u0e32\u0e21\u0e40\u0e1b\u0e47\u0e19\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27" },
  fil: { m: "Tatlong paraan ng paglalaro: offline na pagsasanay laban sa mga kalaban ng computer, LAN o sariling dedicated server, at ang opisyal na pokerth.net na may seasonal ranking. Kumpletong patakaran ng Texas Hold\u2019em, hanggang 10 manlalaro kada mesa, at maaaring i-install bilang app (PWA) sa computer at telepono.",
     g: "Ganap na libre at open source: walang ad, walang in-app purchase, walang pustahan gamit ang totoong pera \u2014 puro pang-larong chips lamang. 45 wika ng interface, napapasadyang baraha at estilo ng mesa, at kaparehong tampok ng opisyal na PokerTH desktop client.",
     r: "Mga patakaran ng Texas Hold\u2019em", pv: "Pagkapribado" },
  bn: { m: "\u0996\u09c7\u09b2\u09be\u09b0 \u09a4\u09bf\u09a8\u099f\u09bf \u0989\u09aa\u09be\u09df: \u0995\u09ae\u09cd\u09aa\u09bf\u0989\u099f\u09be\u09b0 \u09aa\u09cd\u09b0\u09a4\u09bf\u09aa\u0995\u09cd\u09b7\u09c7\u09b0 \u09ac\u09bf\u09b0\u09c1\u09a6\u09cd\u09a7\u09c7 \u0985\u09ab\u09b2\u09be\u0987\u09a8 \u0985\u09a8\u09c1\u09b6\u09c0\u09b2\u09a8, LAN \u09ac\u09be \u09a8\u09bf\u099c\u09b8\u09cd\u09ac \u09a1\u09c7\u09a1\u09bf\u0995\u09c7\u099f\u09c7\u09a1 \u09b8\u09be\u09b0\u09cd\u09ad\u09be\u09b0, \u098f\u09ac\u0982 \u09ae\u09cc\u09b8\u09c1\u09ae\u09bf \u09b0\u09cd\u09af\u09be\u0999\u09cd\u0995\u09bf\u0982\u09b8\u09b9 \u0985\u09ab\u09bf\u09b6\u09bf\u09df\u09be\u09b2 pokerth.net \u09a8\u09c7\u099f\u0993\u09df\u09be\u09b0\u09cd\u0995\u0964 \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 Texas Hold\u2019em \u09a8\u09bf\u09df\u09ae, \u09aa\u09cd\u09b0\u09a4\u09bf \u099f\u09c7\u09ac\u09bf\u09b2\u09c7 \u09b8\u09b0\u09cd\u09ac\u09c7\u09be\u099a\u09cd\u099a \u09e7\u09e6 \u099c\u09a8 \u0996\u09c7\u09b2\u09cb\u09df\u09be\u09dc, \u098f\u09ac\u0982 \u0995\u09ae\u09cd\u09aa\u09bf\u0989\u099f\u09be\u09b0 \u0993 \u09ae\u09cb\u09ac\u09be\u0987\u09b2\u09c7 \u0985\u09cd\u09af\u09be\u09aa (PWA) \u09b9\u09bf\u09b8\u09c7\u09ac\u09c7 \u0987\u09a8\u09b8\u09cd\u099f\u09b2 \u0995\u09b0\u09be \u09af\u09be\u09df\u0964",
     g: "\u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09ac\u09bf\u09a8\u09be\u09ae\u09c2\u09b2\u09cd\u09af\u09c7 \u0993 \u0993\u09aa\u09c7\u09a8 \u09b8\u09cb\u09b0\u09cd\u09b8: \u0995\u09cb\u09a8\u09cb \u09ac\u09bf\u099c\u09cd\u099e\u09be\u09aa\u09a8 \u09a8\u09c7\u0987, \u0985\u09cd\u09af\u09be\u09aa\u09c7 \u0995\u09c7\u09a8\u09be\u0995\u09be\u099f\u09be \u09a8\u09c7\u0987, \u0986\u09b8\u09b2 \u099f\u09be\u0995\u09be\u09b0 \u099c\u09c1\u09df\u09be \u09a8\u09c7\u0987 \u2014 \u0995\u09c7\u09ac\u09b2 \u0996\u09c7\u09b2\u09be\u09b0 \u099a\u09bf\u09aa\u0964 \u09ea\u09eb\u099f\u09bf \u0987\u09a8\u09cd\u099f\u09be\u09b0\u09ab\u09c7\u09b8 \u09ad\u09be\u09b7\u09be, \u09aa\u099b\u09a8\u09cd\u09a6\u09ae\u09a4\u09cb \u09a4\u09be\u09b8\u09c7\u09b0 \u09a8\u0995\u09b6\u09be \u0993 \u099f\u09c7\u09ac\u09bf\u09b2\u09c7\u09b0 \u09a7\u09b0\u09a8, \u098f\u09ac\u0982 \u0985\u09ab\u09bf\u09b6\u09bf\u09df\u09be\u09b2 PokerTH \u09a1\u09c7\u09b8\u09cd\u0995\u099f\u09aa \u0995\u09cd\u09b2\u09be\u09df\u09c7\u09a8\u09cd\u099f\u09c7\u09b0 \u09b8\u09ae\u09be\u09a8 \u09b8\u09c1\u09ac\u09bf\u09a7\u09be\u0964",
     r: "Texas Hold\u2019em-\u098f\u09b0 \u09a8\u09bf\u09df\u09ae", pv: "\u0997\u09cb\u09aa\u09a8\u09c0\u09df\u09a4\u09be" },
  sw: { m: "Njia tatu za kucheza: mazoezi nje ya mtandao dhidi ya wapinzani wa kompyuta, LAN au seva yako binafsi, na mtandao rasmi wa pokerth.net wenye viwango vya msimu. Kanuni kamili za Texas Hold\u2019em, hadi wachezaji 10 kwa meza, na inaweza kusakinishwa kama programu (PWA) kwenye kompyuta na simu.",
     g: "Bure kabisa na chanzo huria: hakuna matangazo, hakuna manunuzi ndani ya programu, hakuna kamari ya pesa halisi \u2014 chipu za mchezo tu. Lugha 45 za kiolesura, seti za karata na mitindo ya meza inayoweza kubadilishwa, na vipengele sawa na programu rasmi ya PokerTH ya kompyuta.",
     r: "Kanuni za Texas Hold\u2019em", pv: "Faragha" },
};

// Resolve the ?lang= query parameter onto a SEO_I18N code (case-insensitive).
// Returns '' for missing, unknown, or 'en' (English folds onto the bare /).
function seoLangFromQuery(reqUrl) {
  var m = /[?&]lang=([A-Za-z-]{2,7})/.exec(String(reqUrl || ''));
  if (!m) return '';
  var q = m[1].toLowerCase();
  if (q === 'en') return '';
  for (var code in SEO_I18N) { if (code.toLowerCase() === q) return code; }
  // A regional alias we advertise in hreflang can also be requested directly,
  // by a browser sending its own locale or by anyone editing the URL. Without
  // this it would silently fall through to English.
  for (var a in SEO_HREFLANG_ALIAS) {
    if (a.toLowerCase() === q) { var t = SEO_HREFLANG_ALIAS[a]; return t === 'en' ? '' : t; }
  }
  return '';
}

// Regional hreflang aliases. A bare subtag does not claim a region, so
// 'es' never surfaces for a Mexican query the way 'es-MX' does, and 'zh'
// leaves the script ambiguous. Each alias points at the variant that already
// exists — no new URLs, no new translations — which is exactly what Google's
// spec allows: several hreflang values may resolve to the same page. Kept to
// regions where the search demand is real; adding one is one line.
// A value of 'en' resolves to the bare / URL.
var SEO_HREFLANG_ALIAS = {
  // Chinese: script tags plus the regions that do not read zh-TW as their own
  'zh-Hans': 'zh', 'zh-CN': 'zh', 'zh-SG': 'zh', 'zh-MY': 'zh',
  'zh-Hant': 'zh-TW', 'zh-HK': 'zh-TW', 'zh-MO': 'zh-TW',
  // Spanish: Latin America is the larger half of the audience
  'es-419': 'es', 'es-MX': 'es', 'es-AR': 'es', 'es-CO': 'es', 'es-CL': 'es', 'es-US': 'es',
  // Portuguese: the bare 'pt' subtag had no target at all
  'pt': 'pt-PT', 'pt-AO': 'pt-PT', 'pt-MZ': 'pt-PT',
  'fr-CA': 'fr', 'fr-BE': 'fr', 'fr-CH': 'fr',
  'en-GB': 'en', 'en-US': 'en', 'en-CA': 'en', 'en-AU': 'en', 'en-IN': 'en', 'en-IE': 'en',
  'de-AT': 'de', 'de-CH': 'de',
  'nl-BE': 'nl',
  'it-CH': 'it',
  // 'no' is the macrolanguage tag most Norwegian browsers still send
  'no': 'nb',
  'ar-SA': 'ar', 'ar-EG': 'ar', 'ar-AE': 'ar', 'ar-MA': 'ar', 'ar-DZ': 'ar',
  'bn-BD': 'bn', 'ta-LK': 'ta', 'ta-SG': 'ta',
  'sw-KE': 'sw', 'sw-TZ': 'sw',
  'ur-IN': 'ur', 'fa-AF': 'fa',
  // Legacy ISO codes that older clients and directories still emit
  'iw': 'he', 'in': 'id', 'tl': 'fil',
};

// Every hreflang pair, [code, href] — the single source of truth for the
// <link rel="alternate"> set in the head AND the xhtml:link set in the
// sitemap. The two must match: a crawler that sees different alternate sets
// for the same page treats neither as authoritative.
function seoHreflangPairs(base) {
  var out = [['x-default', base + '/']];
  var href = function (code) { return base + (code === 'en' ? '/' : '/?lang=' + code); };
  for (var code in SEO_I18N) out.push([code, href(code)]);
  for (var a in SEO_HREFLANG_ALIAS) out.push([a, href(SEO_HREFLANG_ALIAS[a])]);
  return out;
}

// The full alternate set — identical on every language variant, as Google
// requires. 'en' and x-default point at the bare /.
function seoAlternates(base) {
  return seoHreflangPairs(base).map(function (p) {
    return '<link rel="alternate" hreflang="' + p[0] + '" href="' + p[1] + '">';
  });
}

// ── IndexNow — instant URL submission to Bing / Seznam / Naver / Yandex ────
// Protocol: https://www.indexnow.org/ — the site proves key ownership by
// serving /<key>.txt containing the key. Ours is auto-generated the first
// time SEO is enabled with a public URL, persisted in the admin config, and
// pinged fire-and-forget (failures only log, never block a request).
function seoIndexNowKey() {
  var k = String(_seoCfg().indexNowKey || '');
  return /^[a-f0-9]{32}$/.test(k) ? k : '';
}
function _seoEnsureIndexNowKey() {
  var s = _seoCfg();
  if (!/^[a-f0-9]{32}$/.test(String(s.indexNowKey || ''))) {
    s.indexNowKey = crypto.randomBytes(16).toString('hex');
    _adminConfig.seo = s;
  }
  return s.indexNowKey;
}
function seoIndexNowUrls(base) {
  var urls = [base + '/', base + '/rules', base + '/hand-rankings', base + '/how-to-play',
    base + '/glossary', base + '/faq', base + '/privacy'];
  for (var code in SEO_I18N) { if (code !== 'en') urls.push(base + '/?lang=' + code); }
  // Localized content pages exist only in the languages that actually have a
  // translation table. Submitting a variant we do not serve would point the
  // crawler at the English fallback under a URL we never advertise.
  seoPageLangs(SEO_RULES_I18N).forEach(function (c) { urls.push(base + '/rules?lang=' + c); });
  seoPageLangs(SEO_FAQ_I18N).forEach(function (c) { urls.push(base + '/faq?lang=' + c); });
  seoPageLangs(SEO_HANDS_I18N).forEach(function (c) { urls.push(base + '/hand-rankings?lang=' + c); });
  seoPageLangs(SEO_HOWTO_I18N).forEach(function (c) { urls.push(base + '/how-to-play?lang=' + c); });
  seoPageLangs(SEO_GLOSSARY_I18N).forEach(function (c) { urls.push(base + '/glossary?lang=' + c); });
  return urls;
}
var _indexNowLast = 0;
// Last submission, surfaced in the admin panel: a ping that silently failed
// (wrong key file, unreachable host) looked exactly like one that worked.
var _indexNowStat = { at: 0, status: 0, count: 0, error: '' };
function seoIndexNowPing(force, cb) {
  var done = function (o) { if (cb) { try { cb(o); } catch (e) {} } };
  if (!seoEnabled()) return done({ ok: false, error: 'indexing is off' });
  var base = seoPublicUrl(); if (!base) return done({ ok: false, error: 'no public URL set' });
  var key = seoIndexNowKey(); if (!key) return done({ ok: false, error: 'no IndexNow key' });
  var now = Date.now();
  if (!force && now - _indexNowLast < 3600 * 1000) return done({ ok: false, error: 'throttled (once per hour)' });
  _indexNowLast = now;
  var host = '';
  try { host = new URL(base).host; } catch (e) { return; }
  var urls = seoIndexNowUrls(base);
  var body = JSON.stringify({ host: host, key: key, keyLocation: base + '/' + key + '.txt', urlList: urls });
  try {
    var rq = https.request({ hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) }, timeout: 10000 }, function (r) {
      console.log('[seo] IndexNow ping: HTTP ' + r.statusCode + ' (' + urls.length + ' URLs)');
      _indexNowStat = { at: Date.now(), status: r.statusCode || 0, count: urls.length, error: (r.statusCode >= 200 && r.statusCode < 300) ? '' : ('HTTP ' + r.statusCode) };
      done({ ok: r.statusCode >= 200 && r.statusCode < 300, status: r.statusCode, count: urls.length });
      r.resume();
    });
    rq.on('error', function (e) {
      console.warn('[seo] IndexNow ping failed:', e.message);
      _indexNowStat = { at: Date.now(), status: 0, count: urls.length, error: e.message };
      done({ ok: false, error: e.message });
    });
    rq.on('timeout', function () { rq.destroy(new Error('timeout')); });
    rq.end(body);
  } catch (e) {
    console.warn('[seo] IndexNow ping failed:', e.message);
    _indexNowStat = { at: Date.now(), status: 0, count: 0, error: e.message };
    done({ ok: false, error: e.message });
  }
}
// One ping shortly after boot when SEO is already enabled, so a restarted
// proxy re-announces itself without waiting for an admin save.
setTimeout(function () { try { seoIndexNowPing(true); } catch (e) {} }, 15000);
// Deploy detection. A static update swaps the served files without restarting
// this process, so without this nothing would ever tell the search engines the
// site changed — the boot ping above only fires on a restart. Watch the same
// mtime the update banner uses and submit once per deploy.
var _seoDeployMtime = 0;
try { _seoDeployMtime = newestAssetMtime(); } catch (e) {}
var _seoDeployTimer = setInterval(function () {
  try {
    var m = newestAssetMtime();
    if (!m || m <= _seoDeployMtime) return;
    var first = !_seoDeployMtime;
    _seoDeployMtime = m;
    if (!first) seoIndexNowPing(true);
  } catch (e) {}
}, 5 * 60 * 1000);
if (_seoDeployTimer.unref) _seoDeployTimer.unref();

function seoHeadBlock(base, lang) {
  var loc = (lang && SEO_I18N[lang]) || SEO_I18N.en;
  var canon = base ? (base + (lang ? '/?lang=' + lang : '/')) : '';
  var ti = _seoAttr(seoTitleOverride() || loc.t);
  var de = _seoAttr(seoDescOverride() || loc.d);
  var site = _seoAttr(seoSiteName());
  var im = seoImage(base), img = im.url;
  var out = [];
  // Explicit positive directive. Without max-snippet / max-image-preview
  // Google caps the snippet and shows only a thumbnail in Discover and in the
  // European result pages; the defaults are conservative, not neutral.
  out.push('<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">');
  var gsv = seoGsv();
  if (gsv) out.push('<meta name="google-site-verification" content="' + gsv + '">');
  var bgv = seoBingv();
  if (bgv) out.push('<meta name="msvalidate.01" content="' + bgv + '">');
  var ydx = seoYandex();
  if (ydx) out.push('<meta name="yandex-verification" content="' + ydx + '">');
  out.push('<meta name="description" content="' + de + '">');
  if (canon) out.push('<link rel="canonical" href="' + canon + '">');
  if (base) out = out.concat(seoAlternates(base));
  out.push('<meta property="og:type" content="website">');
  out.push('<meta property="og:site_name" content="' + site + '">');
  var ogl = OG_LOCALE[lang || 'en'];
  if (ogl) out.push('<meta property="og:locale" content="' + ogl + '">');
  out.push('<meta property="og:title" content="' + ti + '">');
  out.push('<meta property="og:description" content="' + de + '">');
  if (canon) out.push('<meta property="og:url" content="' + canon + '">');
  if (img) {
    out.push('<meta property="og:image" content="' + _seoAttr(img) + '">');
    if (im.sized) {
      out.push('<meta property="og:image:width" content="1200">');
      out.push('<meta property="og:image:height" content="630">');
    }
    out.push('<meta property="og:image:alt" content="' + ti + '">');
  }
  out.push('<meta name="twitter:card" content="' + (img ? 'summary_large_image' : 'summary') + '">');
  out.push('<meta name="twitter:title" content="' + ti + '">');
  out.push('<meta name="twitter:description" content="' + de + '">');
  if (img) out.push('<meta name="twitter:image" content="' + _seoAttr(img) + '">');
  var ld = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: seoTitleOverride() || 'PokerTH Web Client',
    description: seoDescOverride() || loc.d,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    inLanguage: lang || 'en',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    isAccessibleForFree: true,
    sameAs: ['https://github.com/narmod/pokerth-web-client', 'https://www.pokerth.net/']
  };
  // The running version, not the one on disk: after a static update the two
  // can differ, and announcing a version we are not serving would be a lie.
  if (BOOT_VERSION) ld.softwareVersion = BOOT_VERSION;
  if (canon) ld.url = canon;
  if (img) { ld.image = img; ld.screenshot = img; }
  out.push('<script type="application/ld+json">' + JSON.stringify(ld) + '</script>');
  return out.join('\n');
}

function seoBodyBlock(lang) {
  // Crawler-readable summary of what the page is. The app itself renders no
  // static text, so search engines and AI crawlers would otherwise see an
  // empty page. Kept off-viewport (not display:none) and aria-hidden so it
  // never doubles up for screen-reader users. Localized: the heading and lead
  // come from SEO_I18N, the rest from SEO_BODY_I18N.
  var loc = (lang && SEO_I18N[lang]) || SEO_I18N.en;
  var b = (lang && SEO_BODY_I18N[lang]) || SEO_BODY_I18N.en;
  return '<div id="seo-intro" aria-hidden="true" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden">' +
    '<h1>' + _seoAttr(seoTitleOverride() || loc.t) + '</h1>' +
    '<p>' + _seoAttr(seoDescOverride() || loc.d) + '</p>' +
    '<p>' + b.m + '</p>' +
    '<p>' + b.g + '</p>' +
    '<p>Free software \u2014 source code on GitHub (narmod/pokerth-web-client), based on PokerTH by the PokerTH Development Team.</p>' +
    '<p><a href="/rules">' + b.r + '</a> \u2014 <a href="/hand-rankings">Poker hand rankings</a> \u2014 ' +
    '<a href="/how-to-play">How to play</a> \u2014 <a href="/glossary">Glossary</a> \u2014 ' +
    '<a href="/faq">FAQ</a> \u2014 <a href="/privacy">' + b.pv + '</a></p>' +
    '</div>';
}

function seoFooterBlock(lang) {
  // Visible SEO line appended to the connect-screen footer. Unlike the
  // off-viewport #seo-intro block this text is user-visible, which search
  // engines value more (hidden text is discounted). Injected at serve time
  // only when the admin SEO toggle is on - self-hosted installs keep
  // the stock footer, and the file on disk stays neutral. The English line is
  // left exactly as it was; localized variants use the SEO_I18N title, which
  // already carries the keywords a speaker of that language would search for.
  var b = (lang && SEO_BODY_I18N[lang]) || SEO_BODY_I18N.en;
  var lead = seoTitleOverride() ? _seoAttr(seoTitleOverride())
    : (lang && SEO_I18N[lang])
    ? SEO_I18N[lang].t
    : 'Free open-source Texas Hold\u2019em poker in your browser \u2014 no download, no ads, no signup';
  return '<div class="connect-footer-line" id="cf-seo" style="opacity:0.75">' +
    lead + ' \u00b7 <a href="/rules">' + b.r + '</a> \u00b7 <a href="/faq">FAQ</a></div>';
}

// ── Freshness signals — <lastmod> and deploy detection ─────────────────
// A sitemap without <lastmod> gives a crawler nothing to budget on, so it
// falls back to its own heuristics and revisits far less often. The app has
// no per-page publication date, so the honest answer is "when the files
// behind this page last changed": the newest mtime among the served client
// assets for /, and this file for the server-rendered pages (/rules, /faq,
// /privacy) whose text lives here.
var _SEO_ASSET_FILES = ['pokerth.js', 'pokerth.css', 'pokerth-client.html',
  'modules/i18n.mjs', 'modules/sounds.mjs', 'sw.js'];
function newestAssetMtime() {
  var newest = 0;
  _SEO_ASSET_FILES.forEach(function (f) {
    try {
      var s = fs.statSync(path.join(__dirname, 'public', f));
      if (s.mtimeMs > newest) newest = s.mtimeMs;
    } catch (e) { /* missing file — ignore */ }
  });
  // Per-language catalogue files live in modules/lang/ — fold their mtimes in
  // too, so a translation-only deploy still counts as a change.
  try {
    var langDir = path.join(__dirname, 'public', 'modules', 'lang');
    fs.readdirSync(langDir).forEach(function (f) {
      try {
        var st = fs.statSync(path.join(langDir, f));
        if (st.mtimeMs > newest) newest = st.mtimeMs;
      } catch (e) { /* ignore */ }
    });
  } catch (e) { /* no lang dir yet — ignore */ }
  return newest;
}
function _seoIsoDay(ms) {
  var d = new Date(ms || Date.now());
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}
function seoLastModApp() { return _seoIsoDay(newestAssetMtime()); }
function seoLastModSelf() {
  try { return _seoIsoDay(fs.statSync(__filename).mtimeMs); } catch (e) { return _seoIsoDay(0); }
}

function seoLlmsTxt(base) {
  var u = base || '';
  return '# PokerTH Web Client\n\n' +
    '> ' + SEO_DESC + '\n\n' +
    'PokerTH Web Client is the official browser version of PokerTH, the open-source\n' +
    'Texas Hold\u2019em poker game. It is a Progressive Web App: nothing to install, no\n' +
    'account required, playable on desktop and mobile.\n\n' +
    '## Game modes\n\n' +
    '- Offline practice against computer opponents (bots)\n' +
    '- LAN / private dedicated PokerTH servers\n' +
    '- The official pokerth.net network, with seasonal rankings\n\n' +
    '## Key facts\n\n' +
    '- Free and open source (based on PokerTH by the PokerTH Development Team)\n' +
    '- 45 interface languages; poker terms (Fold/Check/Call/Raise/All-In) stay in English\n' +
    '- Feature parity with the official PokerTH desktop client\n' +
    (u ? '\n## Links\n\n- Play: ' + u + '/\n- Texas Hold\u2019em rules: ' + u + '/rules\n' +
         '- Poker hand rankings: ' + u + '/hand-rankings\n- How to play, step by step: ' + u + '/how-to-play\n' +
         '- Poker glossary: ' + u + '/glossary\n- FAQ: ' + u + '/faq\n' : '\n## Links\n\n') +
    '- Source code: https://github.com/narmod/pokerth-web-client\n' +
    '- PokerTH project: https://www.pokerth.net/\n';
}

// ── SEO content pages — /rules and /faq, rendered server-side ──────────────
// The app itself is an empty shell until JS boots, so these two static pages
// carry the crawlable substance: full Texas Hold'em rules and an FAQ with
// FAQPage JSON-LD. Same serve-time policy as /privacy: always reachable, but
// noindex (and no canonical / JSON-LD) while the admin SEO toggle is off.
var _SEO_PAGE_CSS = 'body{margin:0;background:#0d1117;color:#d8dde4;font:16px/1.65 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
  'main{max-width:720px;margin:0 auto;padding:28px 20px 60px}' +
  'h1{font-size:1.7em;color:#fff;margin:.4em 0 .6em}h2{font-size:1.2em;color:#fff;margin:1.5em 0 .5em}' +
  'a{color:#5ab0f7;text-decoration:none}a:hover{text-decoration:underline}' +
  'nav{padding:14px 20px;background:#161b22;border-bottom:1px solid #30363d;font-size:.95em}' +
  'nav a{margin-right:14px}ul{padding-left:1.3em}li{margin:.3em 0}' +
  'dt{font-weight:600;color:#fff;margin-top:1.1em}dd{margin:.3em 0 0 0}' +
  'table{border-collapse:collapse;width:100%;margin:.6em 0;font-size:.95em}' +
  'th,td{text-align:left;padding:7px 10px;border-bottom:1px solid #30363d;vertical-align:top}' +
  'th{color:#fff;font-weight:600}td.n{white-space:nowrap;text-align:right;color:#9aa4b0}' +
  '.cards{font-size:1.05em;letter-spacing:.06em;white-space:nowrap}.rd{color:#e5837f}' +
  'ol.hr{padding-left:1.3em}ol.hr>li{margin:.9em 0}' +
  '.play{display:inline-block;margin-top:26px;padding:10px 22px;background:#1f6feb;color:#fff;border-radius:6px;font-weight:600}';

function _seoPageNav() {
  return '<nav><a href="/">\u25b6 Play now</a><a href="/rules">Rules</a><a href="/hand-rankings">Hand rankings</a>' +
    '<a href="/how-to-play">How to play</a><a href="/glossary">Glossary</a><a href="/faq">FAQ</a><a href="/privacy">Privacy</a>' +
    '<a href="https://github.com/narmod/pokerth-web-client" rel="noopener">Source</a></nav>';
}

// Translations for the standalone /rules and /faq pages. Only the languages
// present here are advertised: publishing 44 URLs that all serve the same
// English text would be duplicate content, which costs more than it earns.
// A language appears in the page hreflang set and in the sitemap the moment
// its entry lands, and not before. English lives in the page functions
// themselves and is the fallback for everything else.
//   rules: { h1, lead, secDeal, ... }  faq: [[question, answer], ...]
// Both are filled in batches; see docs/ROADMAP.md.
var SEO_RULES_I18N = {
  fr: {
    title: "R\u00e8gles du Texas Hold\u2019em \u2014 Client web PokerTH",
    desc: "R\u00e8gles compl\u00e8tes du Texas Hold\u2019em telles qu\u2019on y joue dans PokerTH : blindes, les quatre tours d\u2019ench\u00e8res, Fold/Check/Call/Raise/All-In, pots secondaires et classement des mains.",
    ldHeadline: "R\u00e8gles du poker Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Comment jouer au No-Limit Texas Hold\u2019em : blindes, tours d\u2019ench\u00e8res, actions et classement des mains, tels que dans PokerTH.",
    body: "<h1>R\u00e8gles du poker Texas Hold\u2019em</h1><p>PokerTH se joue en No-Limit Texas Hold\u2019em, la variante de poker la plus populaire au monde. Chaque joueur cherche \u00e0 composer la meilleure main de cinq cartes \u00e0 partir de deux cartes priv\u00e9es et de cinq cartes communes.</p><h2>La donne et les blindes</h2><p>Chaque main commence par deux mises obligatoires : le joueur \u00e0 gauche du bouton de donneur pose la <em>petite blinde</em>, le suivant la <em>grosse blinde</em>. Chaque joueur re\u00e7oit ensuite deux cartes face cach\u00e9e (les <em>cartes ferm\u00e9es</em>). Le bouton avance d\u2019un si\u00e8ge dans le sens horaire apr\u00e8s chaque main, et dans PokerTH les blindes montent \u00e0 intervalles r\u00e9guliers.</p><h2>Les quatre tours d\u2019ench\u00e8res</h2><ul><li><strong>Pre-flop</strong> \u2014 apr\u00e8s avoir re\u00e7u leurs cartes ferm\u00e9es, les joueurs parlent \u00e0 tour de r\u00f4le, en commen\u00e7ant \u00e0 gauche de la grosse blinde.</li><li><strong>Flop</strong> \u2014 trois cartes communes sont \u00e9tal\u00e9es face visible, suivies d\u2019un tour d\u2019ench\u00e8res.</li><li><strong>Turn</strong> \u2014 une quatri\u00e8me carte commune est distribu\u00e9e, suivie d\u2019un nouveau tour d\u2019ench\u00e8res.</li><li><strong>River</strong> \u2014 la cinqui\u00e8me et derni\u00e8re carte commune est distribu\u00e9e, suivie du dernier tour d\u2019ench\u00e8res.</li></ul><h2>Les actions</h2><ul><li><strong>Fold</strong> \u2014 abandonner la main et les jetons d\u00e9j\u00e0 mis\u00e9s.</li><li><strong>Check</strong> \u2014 passer la parole sans miser (seulement si personne n\u2019a mis\u00e9 dans le tour en cours).</li><li><strong>Call</strong> \u2014 \u00e9galer la mise la plus haute.</li><li><strong>Raise</strong> \u2014 augmenter la mise en cours. En No-Limit, de n\u2019importe quel montant jusqu\u2019\u00e0 la totalit\u00e9 de votre tapis.</li><li><strong>All-In</strong> \u2014 miser tous vos jetons. Si les autres continuent de miser au-del\u00e0, des pots secondaires sont cr\u00e9\u00e9s : vous ne pouvez gagner que la part du pot \u00e0 laquelle vous avez contribu\u00e9.</li></ul><h2>L\u2019abattage</h2><p>S\u2019il reste au moins deux joueurs apr\u00e8s le tour d\u2019ench\u00e8res de la river, les mains sont d\u00e9voil\u00e9es. La meilleure combinaison de cinq cartes parmi les sept disponibles (deux cartes ferm\u00e9es + cinq cartes communes) remporte le pot. Les mains \u00e9gales le partagent.</p><h2>Classement des mains, de la plus forte \u00e0 la plus faible</h2><ol><li><strong>Quinte flush royale</strong> \u2014 A K Q J 10, toutes de la m\u00eame couleur.</li><li><strong>Quinte flush</strong> \u2014 cinq cartes cons\u00e9cutives de la m\u00eame couleur.</li><li><strong>Carr\u00e9</strong> \u2014 quatre cartes du m\u00eame rang.</li><li><strong>Full</strong> \u2014 un brelan plus une paire.</li><li><strong>Couleur</strong> \u2014 cinq cartes de la m\u00eame couleur.</li><li><strong>Quinte</strong> \u2014 cinq cartes cons\u00e9cutives de couleurs diff\u00e9rentes.</li><li><strong>Brelan</strong> \u2014 trois cartes du m\u00eame rang.</li><li><strong>Double paire</strong> \u2014 deux paires diff\u00e9rentes.</li><li><strong>Paire</strong> \u2014 deux cartes du m\u00eame rang.</li><li><strong>Carte haute</strong> \u2014 rien de ce qui pr\u00e9c\u00e8de ; la carte la plus haute d\u00e9partage.</li></ol><h2>Les parties dans PokerTH</h2><p>Les parties PokerTH sont des tournois de type sit-and-go : tout le monde d\u00e9marre avec le m\u00eame tapis, les blindes montent avec le temps, et le dernier joueur qui a des jetons l\u2019emporte. Vous pouvez vous entra\u00eener hors ligne contre des adversaires g\u00e9r\u00e9s par l\u2019ordinateur, jouer en LAN ou sur un serveur priv\u00e9, ou rejoindre le r\u00e9seau officiel pokerth.net avec ses classements saisonniers.</p>" },
  es: {
    title: "Reglas del Texas Hold\u2019em \u2014 Cliente web de PokerTH",
    desc: "Reglas completas del Texas Hold\u2019em tal como se juega en PokerTH: ciegas, las cuatro rondas de apuestas, Fold/Check/Call/Raise/All-In, botes paralelos y ranking de manos.",
    ldHeadline: "Reglas del p\u00f3ker Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "C\u00f3mo jugar al No-Limit Texas Hold\u2019em: ciegas, rondas de apuestas, acciones y ranking de manos, tal como en PokerTH.",
    body: "<h1>Reglas del p\u00f3ker Texas Hold\u2019em</h1><p>En PokerTH se juega al No-Limit Texas Hold\u2019em, la variante de p\u00f3ker m\u00e1s popular del mundo. Cada jugador intenta formar la mejor mano de cinco cartas a partir de dos cartas privadas y cinco cartas comunitarias.</p><h2>El reparto y las ciegas</h2><p>Cada mano empieza con dos apuestas obligatorias: el jugador a la izquierda del bot\u00f3n de repartidor pone la <em>ciega peque\u00f1a</em> y el siguiente, la <em>ciega grande</em>. A continuaci\u00f3n cada jugador recibe dos cartas boca abajo (las <em>cartas propias</em>). El bot\u00f3n avanza un asiento en el sentido de las agujas del reloj despu\u00e9s de cada mano, y en PokerTH las ciegas suben a intervalos regulares.</p><h2>Las cuatro rondas de apuestas</h2><ul><li><strong>Pre-flop</strong> \u2014 tras recibir sus cartas propias, los jugadores act\u00faan por turnos, empezando a la izquierda de la ciega grande.</li><li><strong>Flop</strong> \u2014 se reparten tres cartas comunitarias boca arriba, seguidas de una ronda de apuestas.</li><li><strong>Turn</strong> \u2014 se reparte una cuarta carta comunitaria, seguida de otra ronda de apuestas.</li><li><strong>River</strong> \u2014 se reparte la quinta y \u00faltima carta comunitaria, seguida de la ronda final de apuestas.</li></ul><h2>Las acciones</h2><ul><li><strong>Fold</strong> \u2014 abandonar la mano y las fichas ya apostadas.</li><li><strong>Check</strong> \u2014 pasar sin apostar (solo si nadie ha apostado en la ronda actual).</li><li><strong>Call</strong> \u2014 igualar la apuesta m\u00e1s alta.</li><li><strong>Raise</strong> \u2014 subir la apuesta actual. En No-Limit, cualquier cantidad hasta todo tu stack.</li><li><strong>All-In</strong> \u2014 apostar todas tus fichas. Si los dem\u00e1s siguen apostando por encima, se crean botes paralelos, de modo que solo puedes ganar la parte del bote a la que has contribuido.</li></ul><h2>El showdown</h2><p>Si quedan dos o m\u00e1s jugadores tras la ronda de apuestas del river, se muestran las manos. La mejor combinaci\u00f3n de cinco cartas entre las siete disponibles (dos propias + cinco comunitarias) gana el bote. Las manos iguales lo reparten.</p><h2>Ranking de manos, de la m\u00e1s fuerte a la m\u00e1s d\u00e9bil</h2><ol><li><strong>Escalera real</strong> \u2014 A K Q J 10, todas del mismo palo.</li><li><strong>Escalera de color</strong> \u2014 cinco cartas consecutivas del mismo palo.</li><li><strong>P\u00f3ker</strong> \u2014 cuatro cartas del mismo valor.</li><li><strong>Full house</strong> \u2014 un tr\u00edo m\u00e1s una pareja.</li><li><strong>Color</strong> \u2014 cinco cartas del mismo palo.</li><li><strong>Escalera</strong> \u2014 cinco cartas consecutivas de palos distintos.</li><li><strong>Tr\u00edo</strong> \u2014 tres cartas del mismo valor.</li><li><strong>Doble pareja</strong> \u2014 dos parejas diferentes.</li><li><strong>Pareja</strong> \u2014 dos cartas del mismo valor.</li><li><strong>Carta alta</strong> \u2014 nada de lo anterior; decide la carta m\u00e1s alta.</li></ol><h2>Las partidas en PokerTH</h2><p>Las partidas de PokerTH son torneos tipo sit-and-go: todos empiezan con el mismo stack, las ciegas suben con el tiempo y gana el \u00faltimo jugador que conserva fichas. Puedes practicar sin conexi\u00f3n contra oponentes controlados por el ordenador, jugar en LAN o en un servidor privado, o unirte a la red oficial pokerth.net con sus clasificaciones por temporada.</p>" },
  zh: {
    title: "\u5fb7\u5dde\u6251\u514b\u89c4\u5219 \u2014 PokerTH \u7f51\u9875\u7248",
    desc: "PokerTH \u4e2d\u7684\u5b8c\u6574\u5fb7\u5dde\u6251\u514b\u89c4\u5219\uff1a\u76f2\u6ce8\u3001\u56db\u8f6e\u4e0b\u6ce8\u3001Fold/Check/Call/Raise/All-In\u3001\u8fb9\u6c60\u4e0e\u724c\u578b\u5927\u5c0f\u3002",
    ldHeadline: "\u5fb7\u5dde\u6251\u514b\u89c4\u5219 \u2014 PokerTH",
    ldDesc: "\u5982\u4f55\u73a9\u65e0\u9650\u6ce8\u5fb7\u5dde\u6251\u514b\uff1a\u76f2\u6ce8\u3001\u4e0b\u6ce8\u8f6e\u6b21\u3001\u53ef\u9009\u52a8\u4f5c\u4e0e\u724c\u578b\u5927\u5c0f\uff0c\u4ee5 PokerTH \u4e2d\u7684\u89c4\u5219\u4e3a\u51c6\u3002",
    body: "<h1>\u5fb7\u5dde\u6251\u514b\u89c4\u5219</h1><p>PokerTH \u73a9\u7684\u662f\u65e0\u9650\u6ce8\u5fb7\u5dde\u6251\u514b\uff0c\u5168\u7403\u6700\u6d41\u884c\u7684\u6251\u514b\u73a9\u6cd5\u3002\u6bcf\u4f4d\u73a9\u5bb6\u7528\u4e24\u5f20\u5e95\u724c\u548c\u4e94\u5f20\u516c\u5171\u724c\uff0c\u7ec4\u6210\u6700\u597d\u7684\u4e94\u5f20\u724c\u724c\u578b\u3002</p><h2>\u53d1\u724c\u4e0e\u76f2\u6ce8</h2><p>\u6bcf\u624b\u724c\u4ee5\u4e24\u4e2a\u5f3a\u5236\u4e0b\u6ce8\u5f00\u59cb\uff1a\u5e84\u5bb6\u6309\u94ae\u5de6\u4fa7\u7684\u73a9\u5bb6\u4e0b<em>\u5c0f\u76f2\u6ce8</em>\uff0c\u518d\u4e0b\u4e00\u4f4d\u4e0b<em>\u5927\u76f2\u6ce8</em>\u3002\u968f\u540e\u6bcf\u4f4d\u73a9\u5bb6\u83b7\u5f97\u4e24\u5f20\u9762\u671d\u4e0b\u7684\u724c\uff08<em>\u5e95\u724c</em>\uff09\u3002\u6bcf\u624b\u724c\u7ed3\u675f\u540e\u6309\u94ae\u987a\u65f6\u9488\u79fb\u52a8\u4e00\u4e2a\u5ea7\u4f4d\uff0c\u5728 PokerTH \u4e2d\u76f2\u6ce8\u4f1a\u6309\u56fa\u5b9a\u95f4\u9694\u63d0\u5347\u3002</p><h2>\u56db\u8f6e\u4e0b\u6ce8</h2><ul><li><strong>Pre-flop</strong>\uff08\u7ffb\u724c\u524d\uff09\u2014\u2014 \u62ff\u5230\u5e95\u724c\u540e\uff0c\u4ece\u5927\u76f2\u6ce8\u5de6\u4fa7\u5f00\u59cb\u4f9d\u6b21\u884c\u52a8\u3002</li><li><strong>Flop</strong>\uff08\u7ffb\u724c\uff09\u2014\u2014 \u53d1\u51fa\u4e09\u5f20\u516c\u5171\u724c\uff0c\u968f\u540e\u8fdb\u884c\u4e00\u8f6e\u4e0b\u6ce8\u3002</li><li><strong>Turn</strong>\uff08\u8f6c\u724c\uff09\u2014\u2014 \u53d1\u51fa\u7b2c\u56db\u5f20\u516c\u5171\u724c\uff0c\u518d\u8fdb\u884c\u4e00\u8f6e\u4e0b\u6ce8\u3002</li><li><strong>River</strong>\uff08\u6cb3\u724c\uff09\u2014\u2014 \u53d1\u51fa\u7b2c\u4e94\u5f20\u4e5f\u662f\u6700\u540e\u4e00\u5f20\u516c\u5171\u724c\uff0c\u968f\u540e\u8fdb\u884c\u6700\u540e\u4e00\u8f6e\u4e0b\u6ce8\u3002</li></ul><h2>\u53ef\u9009\u52a8\u4f5c</h2><ul><li><strong>Fold</strong>\uff08\u5f03\u724c\uff09\u2014\u2014 \u653e\u5f03\u8fd9\u624b\u724c\u4ee5\u53ca\u5df2\u7ecf\u6295\u5165\u7684\u7b79\u7801\u3002</li><li><strong>Check</strong>\uff08\u8fc7\u724c\uff09\u2014\u2014 \u4e0d\u4e0b\u6ce8\u76f4\u63a5\u8fc7\uff08\u4ec5\u5f53\u672c\u8f6e\u5c1a\u65e0\u4eba\u4e0b\u6ce8\u65f6\uff09\u3002</li><li><strong>Call</strong>\uff08\u8ddf\u6ce8\uff09\u2014\u2014 \u8ddf\u4e0a\u5f53\u524d\u6700\u9ad8\u7684\u4e0b\u6ce8\u989d\u3002</li><li><strong>Raise</strong>\uff08\u52a0\u6ce8\uff09\u2014\u2014 \u63d0\u9ad8\u5f53\u524d\u4e0b\u6ce8\u989d\u3002\u5728\u65e0\u9650\u6ce8\u4e2d\uff0c\u6700\u591a\u53ef\u52a0\u5230\u4f60\u7684\u5168\u90e8\u7b79\u7801\u3002</li><li><strong>All-In</strong>\uff08\u5168\u4e0b\uff09\u2014\u2014 \u62bc\u4e0a\u6240\u6709\u7b79\u7801\u3002\u82e5\u5176\u4ed6\u73a9\u5bb6\u7ee7\u7eed\u5728\u6b64\u4e4b\u4e0a\u52a0\u6ce8\uff0c\u5219\u4f1a\u4ea7\u751f\u8fb9\u6c60\uff0c\u4f60\u53ea\u80fd\u8d62\u5f97\u81ea\u5df1\u53c2\u4e0e\u7684\u90a3\u90e8\u5206\u5f69\u6c60\u3002</li></ul><h2>\u644a\u724c</h2><p>\u6cb3\u724c\u8f6e\u4e0b\u6ce8\u7ed3\u675f\u540e\u82e5\u4ecd\u6709\u4e24\u4f4d\u6216\u66f4\u591a\u73a9\u5bb6\uff0c\u5219\u4eae\u724c\u6bd4\u5927\u5c0f\u3002\u7528\u4e03\u5f20\u53ef\u7528\u724c\uff08\u4e24\u5f20\u5e95\u724c + \u4e94\u5f20\u516c\u5171\u724c\uff09\u7ec4\u6210\u7684\u6700\u4f73\u4e94\u5f20\u724c\u724c\u578b\u8d62\u5f97\u5f69\u6c60\uff0c\u724c\u578b\u76f8\u540c\u5219\u5e73\u5206\u3002</p><h2>\u724c\u578b\u5927\u5c0f\uff0c\u4ece\u5927\u5230\u5c0f</h2><ol><li><strong>\u7687\u5bb6\u540c\u82b1\u987a</strong> \u2014\u2014 A K Q J 10\uff0c\u540c\u4e00\u82b1\u8272\u3002</li><li><strong>\u540c\u82b1\u987a</strong> \u2014\u2014 \u540c\u4e00\u82b1\u8272\u7684\u4e94\u5f20\u8fde\u724c\u3002</li><li><strong>\u56db\u6761</strong> \u2014\u2014 \u56db\u5f20\u70b9\u6570\u76f8\u540c\u7684\u724c\u3002</li><li><strong>\u846b\u82a6</strong> \u2014\u2014 \u4e09\u6761\u52a0\u4e00\u5bf9\u3002</li><li><strong>\u540c\u82b1</strong> \u2014\u2014 \u4e94\u5f20\u540c\u4e00\u82b1\u8272\u7684\u724c\u3002</li><li><strong>\u987a\u5b50</strong> \u2014\u2014 \u4e94\u5f20\u8fde\u724c\uff0c\u82b1\u8272\u4e0d\u9650\u3002</li><li><strong>\u4e09\u6761</strong> \u2014\u2014 \u4e09\u5f20\u70b9\u6570\u76f8\u540c\u7684\u724c\u3002</li><li><strong>\u4e24\u5bf9</strong> \u2014\u2014 \u4e24\u7ec4\u4e0d\u540c\u7684\u5bf9\u5b50\u3002</li><li><strong>\u4e00\u5bf9</strong> \u2014\u2014 \u4e24\u5f20\u70b9\u6570\u76f8\u540c\u7684\u724c\u3002</li><li><strong>\u9ad8\u724c</strong> \u2014\u2014 \u4ee5\u4e0a\u7686\u65e0\uff0c\u6bd4\u6700\u5927\u7684\u4e00\u5f20\u724c\u3002</li></ol><h2>PokerTH \u4e2d\u7684\u724c\u5c40</h2><p>PokerTH \u7684\u724c\u5c40\u662f sit-and-go \u5f0f\u9526\u6807\u8d5b\uff1a\u6240\u6709\u4eba\u4ee5\u76f8\u540c\u7b79\u7801\u5f00\u5c40\uff0c\u76f2\u6ce8\u968f\u65f6\u95f4\u63d0\u5347\uff0c\u6700\u540e\u6301\u6709\u7b79\u7801\u7684\u73a9\u5bb6\u83b7\u80dc\u3002\u4f60\u53ef\u4ee5\u79bb\u7ebf\u4e0e\u7535\u8111\u5bf9\u624b\u7ec3\u4e60\u3001\u5728\u5c40\u57df\u7f51\u6216\u79c1\u4eba\u670d\u52a1\u5668\u4e0a\u5bf9\u5c40\uff0c\u4e5f\u53ef\u4ee5\u52a0\u5165\u5e26\u8d5b\u5b63\u6392\u540d\u7684\u5b98\u65b9 pokerth.net \u7f51\u7edc\u3002</p>" },
  'zh-TW': {
    title: "\u5fb7\u5dde\u64b2\u514b\u898f\u5247 \u2014 PokerTH \u7db2\u9801\u7248",
    desc: "PokerTH \u4e2d\u7684\u5b8c\u6574\u5fb7\u5dde\u64b2\u514b\u898f\u5247\uff1a\u76f2\u6ce8\u3001\u56db\u8f2a\u4e0b\u6ce8\u3001Fold/Check/Call/Raise/All-In\u3001\u908a\u6c60\u8207\u724c\u578b\u5927\u5c0f\u3002",
    ldHeadline: "\u5fb7\u5dde\u64b2\u514b\u898f\u5247 \u2014 PokerTH",
    ldDesc: "\u5982\u4f55\u73a9\u7121\u9650\u6ce8\u5fb7\u5dde\u64b2\u514b\uff1a\u76f2\u6ce8\u3001\u4e0b\u6ce8\u8f2a\u6b21\u3001\u53ef\u9078\u52d5\u4f5c\u8207\u724c\u578b\u5927\u5c0f\uff0c\u4ee5 PokerTH \u4e2d\u7684\u898f\u5247\u70ba\u6e96\u3002",
    body: "<h1>\u5fb7\u5dde\u64b2\u514b\u898f\u5247</h1><p>PokerTH \u73a9\u7684\u662f\u7121\u9650\u6ce8\u5fb7\u5dde\u64b2\u514b\uff0c\u5168\u7403\u6700\u6d41\u884c\u7684\u64b2\u514b\u73a9\u6cd5\u3002\u6bcf\u4f4d\u73a9\u5bb6\u7528\u5169\u5f35\u5e95\u724c\u548c\u4e94\u5f35\u516c\u5171\u724c\uff0c\u7d44\u6210\u6700\u597d\u7684\u4e94\u5f35\u724c\u724c\u578b\u3002</p><h2>\u767c\u724c\u8207\u76f2\u6ce8</h2><p>\u6bcf\u624b\u724c\u4ee5\u5169\u500b\u5f37\u5236\u4e0b\u6ce8\u958b\u59cb\uff1a\u838a\u5bb6\u6309\u9215\u5de6\u5074\u7684\u73a9\u5bb6\u4e0b<em>\u5c0f\u76f2\u6ce8</em>\uff0c\u518d\u4e0b\u4e00\u4f4d\u4e0b<em>\u5927\u76f2\u6ce8</em>\u3002\u63a5\u8457\u6bcf\u4f4d\u73a9\u5bb6\u7372\u5f97\u5169\u5f35\u9762\u671d\u4e0b\u7684\u724c\uff08<em>\u5e95\u724c</em>\uff09\u3002\u6bcf\u624b\u724c\u7d50\u675f\u5f8c\u6309\u9215\u9806\u6642\u91dd\u79fb\u52d5\u4e00\u500b\u5ea7\u4f4d\uff0c\u5728 PokerTH \u4e2d\u76f2\u6ce8\u6703\u6309\u56fa\u5b9a\u9593\u9694\u63d0\u5347\u3002</p><h2>\u56db\u8f2a\u4e0b\u6ce8</h2><ul><li><strong>Pre-flop</strong>\uff08\u7ffb\u724c\u524d\uff09\u2014\u2014 \u62ff\u5230\u5e95\u724c\u5f8c\uff0c\u5f9e\u5927\u76f2\u6ce8\u5de6\u5074\u958b\u59cb\u4f9d\u5e8f\u884c\u52d5\u3002</li><li><strong>Flop</strong>\uff08\u7ffb\u724c\uff09\u2014\u2014 \u767c\u51fa\u4e09\u5f35\u516c\u5171\u724c\uff0c\u96a8\u5f8c\u9032\u884c\u4e00\u8f2a\u4e0b\u6ce8\u3002</li><li><strong>Turn</strong>\uff08\u8f49\u724c\uff09\u2014\u2014 \u767c\u51fa\u7b2c\u56db\u5f35\u516c\u5171\u724c\uff0c\u518d\u9032\u884c\u4e00\u8f2a\u4e0b\u6ce8\u3002</li><li><strong>River</strong>\uff08\u6cb3\u724c\uff09\u2014\u2014 \u767c\u51fa\u7b2c\u4e94\u5f35\u4e5f\u662f\u6700\u5f8c\u4e00\u5f35\u516c\u5171\u724c\uff0c\u96a8\u5f8c\u9032\u884c\u6700\u5f8c\u4e00\u8f2a\u4e0b\u6ce8\u3002</li></ul><h2>\u53ef\u9078\u52d5\u4f5c</h2><ul><li><strong>Fold</strong>\uff08\u68c4\u724c\uff09\u2014\u2014 \u653e\u68c4\u9019\u624b\u724c\u4ee5\u53ca\u5df2\u7d93\u6295\u5165\u7684\u7c4c\u78bc\u3002</li><li><strong>Check</strong>\uff08\u904e\u724c\uff09\u2014\u2014 \u4e0d\u4e0b\u6ce8\u76f4\u63a5\u904e\uff08\u50c5\u7576\u672c\u8f2a\u5c1a\u7121\u4eba\u4e0b\u6ce8\u6642\uff09\u3002</li><li><strong>Call</strong>\uff08\u8ddf\u6ce8\uff09\u2014\u2014 \u8ddf\u4e0a\u76ee\u524d\u6700\u9ad8\u7684\u4e0b\u6ce8\u984d\u3002</li><li><strong>Raise</strong>\uff08\u52a0\u6ce8\uff09\u2014\u2014 \u63d0\u9ad8\u76ee\u524d\u4e0b\u6ce8\u984d\u3002\u5728\u7121\u9650\u6ce8\u4e2d\uff0c\u6700\u591a\u53ef\u52a0\u5230\u4f60\u7684\u5168\u90e8\u7c4c\u78bc\u3002</li><li><strong>All-In</strong>\uff08\u5168\u4e0b\uff09\u2014\u2014 \u62bc\u4e0a\u6240\u6709\u7c4c\u78bc\u3002\u82e5\u5176\u4ed6\u73a9\u5bb6\u7e7c\u7e8c\u5728\u6b64\u4e4b\u4e0a\u52a0\u6ce8\uff0c\u5247\u6703\u7522\u751f\u908a\u6c60\uff0c\u4f60\u53ea\u80fd\u8d0f\u5f97\u81ea\u5df1\u53c3\u8207\u7684\u90a3\u90e8\u5206\u5f69\u6c60\u3002</li></ul><h2>\u6524\u724c</h2><p>\u6cb3\u724c\u8f2a\u4e0b\u6ce8\u7d50\u675f\u5f8c\u82e5\u4ecd\u6709\u5169\u4f4d\u6216\u66f4\u591a\u73a9\u5bb6\uff0c\u5247\u4eae\u724c\u6bd4\u5927\u5c0f\u3002\u7528\u4e03\u5f35\u53ef\u7528\u724c\uff08\u5169\u5f35\u5e95\u724c + \u4e94\u5f35\u516c\u5171\u724c\uff09\u7d44\u6210\u7684\u6700\u4f73\u4e94\u5f35\u724c\u724c\u578b\u8d0f\u5f97\u5f69\u6c60\uff0c\u724c\u578b\u76f8\u540c\u5247\u5e73\u5206\u3002</p><h2>\u724c\u578b\u5927\u5c0f\uff0c\u5f9e\u5927\u5230\u5c0f</h2><ol><li><strong>\u7687\u5bb6\u540c\u82b1\u9806</strong> \u2014\u2014 A K Q J 10\uff0c\u540c\u4e00\u82b1\u8272\u3002</li><li><strong>\u540c\u82b1\u9806</strong> \u2014\u2014 \u540c\u4e00\u82b1\u8272\u7684\u4e94\u5f35\u9023\u724c\u3002</li><li><strong>\u56db\u689d</strong> \u2014\u2014 \u56db\u5f35\u9ede\u6578\u76f8\u540c\u7684\u724c\u3002</li><li><strong>\u846b\u8606</strong> \u2014\u2014 \u4e09\u689d\u52a0\u4e00\u5c0d\u3002</li><li><strong>\u540c\u82b1</strong> \u2014\u2014 \u4e94\u5f35\u540c\u4e00\u82b1\u8272\u7684\u724c\u3002</li><li><strong>\u9806\u5b50</strong> \u2014\u2014 \u4e94\u5f35\u9023\u724c\uff0c\u82b1\u8272\u4e0d\u9650\u3002</li><li><strong>\u4e09\u689d</strong> \u2014\u2014 \u4e09\u5f35\u9ede\u6578\u76f8\u540c\u7684\u724c\u3002</li><li><strong>\u5169\u5c0d</strong> \u2014\u2014 \u5169\u7d44\u4e0d\u540c\u7684\u5c0d\u5b50\u3002</li><li><strong>\u4e00\u5c0d</strong> \u2014\u2014 \u5169\u5f35\u9ede\u6578\u76f8\u540c\u7684\u724c\u3002</li><li><strong>\u9ad8\u724c</strong> \u2014\u2014 \u4ee5\u4e0a\u7686\u7121\uff0c\u6bd4\u6700\u5927\u7684\u4e00\u5f35\u724c\u3002</li></ol><h2>PokerTH \u4e2d\u7684\u724c\u5c40</h2><p>PokerTH \u7684\u724c\u5c40\u662f sit-and-go \u5f0f\u9326\u6a19\u8cfd\uff1a\u6240\u6709\u4eba\u4ee5\u76f8\u540c\u7c4c\u78bc\u958b\u5c40\uff0c\u76f2\u6ce8\u96a8\u6642\u9593\u63d0\u5347\uff0c\u6700\u5f8c\u6301\u6709\u7c4c\u78bc\u7684\u73a9\u5bb6\u7372\u52dd\u3002\u4f60\u53ef\u4ee5\u96e2\u7dda\u8207\u96fb\u8166\u5c0d\u624b\u7df4\u7fd2\u3001\u5728\u5340\u57df\u7db2\u8def\u6216\u79c1\u4eba\u4f3a\u670d\u5668\u4e0a\u5c0d\u5c40\uff0c\u4e5f\u53ef\u4ee5\u52a0\u5165\u5177\u5099\u8cfd\u5b63\u6392\u540d\u7684\u5b98\u65b9 pokerth.net \u7db2\u8def\u3002</p>" },
  de: {
    title: "Texas Hold\u2019em Regeln \u2014 PokerTH Web-Client",
    desc: "Vollst\u00e4ndige Texas-Hold\u2019em-Regeln, wie sie in PokerTH gespielt werden: Blinds, die vier Setzrunden, Fold/Check/Call/Raise/All-In, Side Pots und Handwertung.",
    ldHeadline: "Texas Hold\u2019em Poker-Regeln \u2014 PokerTH",
    ldDesc: "So spielt man No-Limit Texas Hold\u2019em: Blinds, Setzrunden, Aktionen und Handwertung, wie in PokerTH.",
    body: "<h1>Texas Hold\u2019em Poker-Regeln</h1><p>In PokerTH wird No-Limit Texas Hold\u2019em gespielt, die weltweit beliebteste Poker-Variante. Jeder Spieler versucht, aus zwei eigenen verdeckten Karten und f\u00fcnf Gemeinschaftskarten die beste Hand aus f\u00fcnf Karten zu bilden.</p><h2>Austeilen und Blinds</h2><p>Jede Hand beginnt mit zwei Zwangseins\u00e4tzen: Der Spieler links vom Dealer-Button setzt den <em>Small Blind</em>, der n\u00e4chste den <em>Big Blind</em>. Anschlie\u00dfend erh\u00e4lt jeder Spieler zwei verdeckte Karten (die <em>Hole Cards</em>). Der Button r\u00fcckt nach jeder Hand einen Platz im Uhrzeigersinn weiter, und in PokerTH steigen die Blinds in regelm\u00e4\u00dfigen Abst\u00e4nden.</p><h2>Die vier Setzrunden</h2><ul><li><strong>Pre-flop</strong> \u2014 nach Erhalt der Hole Cards sind die Spieler reihum am Zug, beginnend links vom Big Blind.</li><li><strong>Flop</strong> \u2014 drei Gemeinschaftskarten werden offen ausgelegt, danach folgt eine Setzrunde.</li><li><strong>Turn</strong> \u2014 eine vierte Gemeinschaftskarte wird ausgeteilt, gefolgt von einer weiteren Setzrunde.</li><li><strong>River</strong> \u2014 die f\u00fcnfte und letzte Gemeinschaftskarte wird ausgeteilt, gefolgt von der letzten Setzrunde.</li></ul><h2>Die Aktionen</h2><ul><li><strong>Fold</strong> \u2014 die Hand und alle bereits gesetzten Chips aufgeben.</li><li><strong>Check</strong> \u2014 ohne Einsatz weitergeben (nur wenn in der laufenden Runde noch niemand gesetzt hat).</li><li><strong>Call</strong> \u2014 den aktuell h\u00f6chsten Einsatz mitgehen.</li><li><strong>Raise</strong> \u2014 den aktuellen Einsatz erh\u00f6hen. Im No-Limit um jeden Betrag bis hin zum gesamten Stack.</li><li><strong>All-In</strong> \u2014 alle eigenen Chips setzen. Wenn andere dar\u00fcber hinaus weitersetzen, entstehen Side Pots, sodass Sie nur den Teil des Pots gewinnen k\u00f6nnen, zu dem Sie beigetragen haben.</li></ul><h2>Der Showdown</h2><p>Sind nach der Setzrunde am River noch zwei oder mehr Spieler \u00fcbrig, werden die H\u00e4nde aufgedeckt. Die beste F\u00fcnf-Karten-Kombination aus den sieben verf\u00fcgbaren Karten (zwei Hole Cards + f\u00fcnf Gemeinschaftskarten) gewinnt den Pot. Gleichwertige H\u00e4nde teilen ihn.</p><h2>Handwertung, von der st\u00e4rksten zur schw\u00e4chsten</h2><ol><li><strong>Royal Flush</strong> \u2014 A K Q J 10, alle in derselben Farbe.</li><li><strong>Straight Flush</strong> \u2014 f\u00fcnf aufeinanderfolgende Karten derselben Farbe.</li><li><strong>Vierling</strong> \u2014 vier Karten desselben Werts.</li><li><strong>Full House</strong> \u2014 ein Drilling plus ein Paar.</li><li><strong>Flush</strong> \u2014 f\u00fcnf Karten derselben Farbe.</li><li><strong>Stra\u00dfe</strong> \u2014 f\u00fcnf aufeinanderfolgende Karten in gemischten Farben.</li><li><strong>Drilling</strong> \u2014 drei Karten desselben Werts.</li><li><strong>Zwei Paare</strong> \u2014 zwei verschiedene Paare.</li><li><strong>Ein Paar</strong> \u2014 zwei Karten desselben Werts.</li><li><strong>High Card</strong> \u2014 nichts davon; die h\u00f6chste Karte entscheidet.</li></ol><h2>Turniere in PokerTH</h2><p>PokerTH-Partien sind Sit-and-Go-Turniere: Alle starten mit demselben Stack, die Blinds steigen mit der Zeit, und wer als Letzter Chips h\u00e4lt, gewinnt. Sie k\u00f6nnen offline gegen Computergegner \u00fcben, im LAN oder auf einem privaten Server spielen oder dem offiziellen Netzwerk pokerth.net mit seinen Saisonranglisten beitreten.</p>" },
  ru: {
    title: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019em \u2014 \u0432\u0435\u0431-\u043a\u043b\u0438\u0435\u043d\u0442 PokerTH",
    desc: "\u041f\u043e\u043b\u043d\u044b\u0435 \u043f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019em \u0432 \u0442\u043e\u043c \u0432\u0438\u0434\u0435, \u0432 \u043a\u0430\u043a\u043e\u043c \u0432 \u043d\u0435\u0433\u043e \u0438\u0433\u0440\u0430\u044e\u0442 \u0432 PokerTH: \u0431\u043b\u0430\u0439\u043d\u0434\u044b, \u0447\u0435\u0442\u044b\u0440\u0435 \u043a\u0440\u0443\u0433\u0430 \u0442\u043e\u0440\u0433\u043e\u0432\u043b\u0438, Fold/Check/Call/Raise/All-In, \u043f\u043e\u0431\u043e\u0447\u043d\u044b\u0435 \u0431\u0430\u043d\u043a\u0438 \u0438 \u0441\u0442\u0430\u0440\u0448\u0438\u043d\u0441\u0442\u0432\u043e \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u0439.",
    ldHeadline: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u043f\u043e\u043a\u0435\u0440\u0430 Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c \u0432 \u0431\u0435\u0437\u043b\u0438\u043c\u0438\u0442\u043d\u044b\u0439 Texas Hold\u2019em: \u0431\u043b\u0430\u0439\u043d\u0434\u044b, \u043a\u0440\u0443\u0433\u0438 \u0442\u043e\u0440\u0433\u043e\u0432\u043b\u0438, \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f \u0438 \u0441\u0442\u0430\u0440\u0448\u0438\u043d\u0441\u0442\u0432\u043e \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u0439, \u043a\u0430\u043a \u0432 PokerTH.",
    body: "<h1>\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u043f\u043e\u043a\u0435\u0440\u0430 Texas Hold\u2019em</h1><p>\u0412 PokerTH \u0438\u0433\u0440\u0430\u044e\u0442 \u0432 \u0431\u0435\u0437\u043b\u0438\u043c\u0438\u0442\u043d\u044b\u0439 Texas Hold\u2019em \u2014 \u0441\u0430\u043c\u0443\u044e \u043f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u0443\u044e \u0440\u0430\u0437\u043d\u043e\u0432\u0438\u0434\u043d\u043e\u0441\u0442\u044c \u043f\u043e\u043a\u0435\u0440\u0430 \u0432 \u043c\u0438\u0440\u0435. \u041a\u0430\u0436\u0434\u044b\u0439 \u0438\u0433\u0440\u043e\u043a \u0441\u0442\u0430\u0440\u0430\u0435\u0442\u0441\u044f \u0441\u043e\u0431\u0440\u0430\u0442\u044c \u043b\u0443\u0447\u0448\u0443\u044e \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u044e \u0438\u0437 \u043f\u044f\u0442\u0438 \u043a\u0430\u0440\u0442, \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044f \u0434\u0432\u0435 \u0441\u0432\u043e\u0438 \u0437\u0430\u043a\u0440\u044b\u0442\u044b\u0435 \u043a\u0430\u0440\u0442\u044b \u0438 \u043f\u044f\u0442\u044c \u043e\u0431\u0449\u0438\u0445.</p><h2>\u0420\u0430\u0437\u0434\u0430\u0447\u0430 \u0438 \u0431\u043b\u0430\u0439\u043d\u0434\u044b</h2><p>\u041a\u0430\u0436\u0434\u0430\u044f \u0440\u0430\u0437\u0434\u0430\u0447\u0430 \u043d\u0430\u0447\u0438\u043d\u0430\u0435\u0442\u0441\u044f \u0441 \u0434\u0432\u0443\u0445 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0445 \u0441\u0442\u0430\u0432\u043e\u043a: \u0438\u0433\u0440\u043e\u043a \u0441\u043b\u0435\u0432\u0430 \u043e\u0442 \u043a\u043d\u043e\u043f\u043a\u0438 \u0434\u0438\u043b\u0435\u0440\u0430 \u0441\u0442\u0430\u0432\u0438\u0442 <em>\u043c\u0430\u043b\u044b\u0439 \u0431\u043b\u0430\u0439\u043d\u0434</em>, \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u2014 <em>\u0431\u043e\u043b\u044c\u0448\u043e\u0439 \u0431\u043b\u0430\u0439\u043d\u0434</em>. \u0417\u0430\u0442\u0435\u043c \u043a\u0430\u0436\u0434\u044b\u0439 \u0438\u0433\u0440\u043e\u043a \u043f\u043e\u043b\u0443\u0447\u0430\u0435\u0442 \u0434\u0432\u0435 \u0437\u0430\u043a\u0440\u044b\u0442\u044b\u0435 \u043a\u0430\u0440\u0442\u044b (<em>\u043a\u0430\u0440\u043c\u0430\u043d\u043d\u044b\u0435 \u043a\u0430\u0440\u0442\u044b</em>). \u041f\u043e\u0441\u043b\u0435 \u043a\u0430\u0436\u0434\u043e\u0439 \u0440\u0430\u0437\u0434\u0430\u0447\u0438 \u043a\u043d\u043e\u043f\u043a\u0430 \u0441\u0434\u0432\u0438\u0433\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u043e\u0434\u043d\u043e \u043c\u0435\u0441\u0442\u043e \u043f\u043e \u0447\u0430\u0441\u043e\u0432\u043e\u0439 \u0441\u0442\u0440\u0435\u043b\u043a\u0435, \u0430 \u0432 PokerTH \u0431\u043b\u0430\u0439\u043d\u0434\u044b \u0440\u0430\u0441\u0442\u0443\u0442 \u0447\u0435\u0440\u0435\u0437 \u0440\u0430\u0432\u043d\u044b\u0435 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043a\u0438 \u0432\u0440\u0435\u043c\u0435\u043d\u0438.</p><h2>\u0427\u0435\u0442\u044b\u0440\u0435 \u043a\u0440\u0443\u0433\u0430 \u0442\u043e\u0440\u0433\u043e\u0432\u043b\u0438</h2><ul><li><strong>Pre-flop</strong> \u2014 \u043f\u043e\u043b\u0443\u0447\u0438\u0432 \u043a\u0430\u0440\u043c\u0430\u043d\u043d\u044b\u0435 \u043a\u0430\u0440\u0442\u044b, \u0438\u0433\u0440\u043e\u043a\u0438 \u0445\u043e\u0434\u044f\u0442 \u043f\u043e \u043e\u0447\u0435\u0440\u0435\u0434\u0438, \u043d\u0430\u0447\u0438\u043d\u0430\u044f \u0441\u043b\u0435\u0432\u0430 \u043e\u0442 \u0431\u043e\u043b\u044c\u0448\u043e\u0433\u043e \u0431\u043b\u0430\u0439\u043d\u0434\u0430.</li><li><strong>Flop</strong> \u2014 \u0432\u044b\u043a\u043b\u0430\u0434\u044b\u0432\u0430\u044e\u0442\u0441\u044f \u0442\u0440\u0438 \u043e\u0431\u0449\u0438\u0435 \u043a\u0430\u0440\u0442\u044b \u0432 \u043e\u0442\u043a\u0440\u044b\u0442\u0443\u044e, \u043f\u043e\u0441\u043b\u0435 \u0447\u0435\u0433\u043e \u0441\u043b\u0435\u0434\u0443\u0435\u0442 \u043a\u0440\u0443\u0433 \u0442\u043e\u0440\u0433\u043e\u0432\u043b\u0438.</li><li><strong>Turn</strong> \u2014 \u0432\u044b\u043a\u043b\u0430\u0434\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0447\u0435\u0442\u0432\u0451\u0440\u0442\u0430\u044f \u043e\u0431\u0449\u0430\u044f \u043a\u0430\u0440\u0442\u0430, \u0437\u0430 \u043d\u0435\u0439 \u2014 \u0435\u0449\u0451 \u043e\u0434\u0438\u043d \u043a\u0440\u0443\u0433 \u0442\u043e\u0440\u0433\u043e\u0432\u043b\u0438.</li><li><strong>River</strong> \u2014 \u0432\u044b\u043a\u043b\u0430\u0434\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043f\u044f\u0442\u0430\u044f \u0438 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u044f\u044f \u043e\u0431\u0449\u0430\u044f \u043a\u0430\u0440\u0442\u0430, \u0437\u0430 \u043d\u0435\u0439 \u2014 \u0437\u0430\u043a\u043b\u044e\u0447\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u043a\u0440\u0443\u0433 \u0442\u043e\u0440\u0433\u043e\u0432\u043b\u0438.</li></ul><h2>\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f</h2><ul><li><strong>Fold</strong> \u2014 \u0441\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u043a\u0430\u0440\u0442\u044b \u0438 \u043e\u0442\u043a\u0430\u0437\u0430\u0442\u044c\u0441\u044f \u043e\u0442 \u0443\u0436\u0435 \u043f\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043d\u044b\u0445 \u0444\u0438\u0448\u0435\u043a.</li><li><strong>Check</strong> \u2014 \u043f\u0435\u0440\u0435\u0434\u0430\u0442\u044c \u0445\u043e\u0434 \u0431\u0435\u0437 \u0441\u0442\u0430\u0432\u043a\u0438 (\u0442\u043e\u043b\u044c\u043a\u043e \u0435\u0441\u043b\u0438 \u0432 \u0442\u0435\u043a\u0443\u0449\u0435\u043c \u043a\u0440\u0443\u0433\u0435 \u043d\u0438\u043a\u0442\u043e \u0435\u0449\u0451 \u043d\u0435 \u0441\u0442\u0430\u0432\u0438\u043b).</li><li><strong>Call</strong> \u2014 \u0443\u0440\u0430\u0432\u043d\u044f\u0442\u044c \u0442\u0435\u043a\u0443\u0449\u0443\u044e \u043d\u0430\u0438\u0431\u043e\u043b\u044c\u0448\u0443\u044e \u0441\u0442\u0430\u0432\u043a\u0443.</li><li><strong>Raise</strong> \u2014 \u043f\u043e\u0432\u044b\u0441\u0438\u0442\u044c \u0442\u0435\u043a\u0443\u0449\u0443\u044e \u0441\u0442\u0430\u0432\u043a\u0443. \u0412 \u0431\u0435\u0437\u043b\u0438\u043c\u0438\u0442\u043d\u043e\u0439 \u0438\u0433\u0440\u0435 \u2014 \u043d\u0430 \u043b\u044e\u0431\u0443\u044e \u0441\u0443\u043c\u043c\u0443 \u0432\u043f\u043b\u043e\u0442\u044c \u0434\u043e \u0432\u0441\u0435\u0433\u043e \u0441\u0442\u0435\u043a\u0430.</li><li><strong>All-In</strong> \u2014 \u043f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0432\u0441\u0435 \u0441\u0432\u043e\u0438 \u0444\u0438\u0448\u043a\u0438. \u0415\u0441\u043b\u0438 \u043e\u0441\u0442\u0430\u043b\u044c\u043d\u044b\u0435 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u044e\u0442 \u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0441\u0432\u0435\u0440\u0445 \u044d\u0442\u043e\u0439 \u0441\u0443\u043c\u043c\u044b, \u0441\u043e\u0437\u0434\u0430\u044e\u0442\u0441\u044f \u043f\u043e\u0431\u043e\u0447\u043d\u044b\u0435 \u0431\u0430\u043d\u043a\u0438, \u0438 \u0432\u044b\u0438\u0433\u0440\u0430\u0442\u044c \u043c\u043e\u0436\u043d\u043e \u0442\u043e\u043b\u044c\u043a\u043e \u0442\u0443 \u0447\u0430\u0441\u0442\u044c \u0431\u0430\u043d\u043a\u0430, \u0432 \u043a\u043e\u0442\u043e\u0440\u0443\u044e \u0432\u044b \u0432\u043b\u043e\u0436\u0438\u043b\u0438\u0441\u044c.</li></ul><h2>\u0412\u0441\u043a\u0440\u044b\u0442\u0438\u0435</h2><p>\u0415\u0441\u043b\u0438 \u043f\u043e\u0441\u043b\u0435 \u043a\u0440\u0443\u0433\u0430 \u0442\u043e\u0440\u0433\u043e\u0432\u043b\u0438 \u043d\u0430 \u0440\u0438\u0432\u0435\u0440\u0435 \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u0434\u0432\u0430 \u0438\u0433\u0440\u043e\u043a\u0430 \u0438\u043b\u0438 \u0431\u043e\u043b\u044c\u0448\u0435, \u043a\u0430\u0440\u0442\u044b \u0432\u0441\u043a\u0440\u044b\u0432\u0430\u044e\u0442\u0441\u044f. \u041b\u0443\u0447\u0448\u0430\u044f \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u044f \u0438\u0437 \u043f\u044f\u0442\u0438 \u043a\u0430\u0440\u0442 \u0441\u0440\u0435\u0434\u0438 \u0441\u0435\u043c\u0438 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 (\u0434\u0432\u0435 \u043a\u0430\u0440\u043c\u0430\u043d\u043d\u044b\u0435 + \u043f\u044f\u0442\u044c \u043e\u0431\u0449\u0438\u0445) \u0437\u0430\u0431\u0438\u0440\u0430\u0435\u0442 \u0431\u0430\u043d\u043a. \u0420\u0430\u0432\u043d\u044b\u0435 \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u0438 \u0434\u0435\u043b\u044f\u0442 \u0435\u0433\u043e \u043f\u043e\u0440\u043e\u0432\u043d\u0443.</p><h2>\u0421\u0442\u0430\u0440\u0448\u0438\u043d\u0441\u0442\u0432\u043e \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u0439, \u043e\u0442 \u0441\u0442\u0430\u0440\u0448\u0435\u0439 \u043a \u043c\u043b\u0430\u0434\u0448\u0435\u0439</h2><ol><li><strong>\u0424\u043b\u0435\u0448-\u0440\u043e\u044f\u043b\u044c</strong> \u2014 A K Q J 10 \u043e\u0434\u043d\u043e\u0439 \u043c\u0430\u0441\u0442\u0438.</li><li><strong>\u0421\u0442\u0440\u0438\u0442-\u0444\u043b\u0435\u0448</strong> \u2014 \u043f\u044f\u0442\u044c \u043a\u0430\u0440\u0442 \u043f\u043e\u0434\u0440\u044f\u0434 \u043e\u0434\u043d\u043e\u0439 \u043c\u0430\u0441\u0442\u0438.</li><li><strong>\u041a\u0430\u0440\u0435</strong> \u2014 \u0447\u0435\u0442\u044b\u0440\u0435 \u043a\u0430\u0440\u0442\u044b \u043e\u0434\u043d\u043e\u0433\u043e \u0434\u043e\u0441\u0442\u043e\u0438\u043d\u0441\u0442\u0432\u0430.</li><li><strong>\u0424\u0443\u043b\u043b-\u0445\u0430\u0443\u0441</strong> \u2014 \u0442\u0440\u043e\u0439\u043a\u0430 \u043f\u043b\u044e\u0441 \u043f\u0430\u0440\u0430.</li><li><strong>\u0424\u043b\u0435\u0448</strong> \u2014 \u043f\u044f\u0442\u044c \u043a\u0430\u0440\u0442 \u043e\u0434\u043d\u043e\u0439 \u043c\u0430\u0441\u0442\u0438.</li><li><strong>\u0421\u0442\u0440\u0438\u0442</strong> \u2014 \u043f\u044f\u0442\u044c \u043a\u0430\u0440\u0442 \u043f\u043e\u0434\u0440\u044f\u0434 \u0440\u0430\u0437\u043d\u044b\u0445 \u043c\u0430\u0441\u0442\u0435\u0439.</li><li><strong>\u0422\u0440\u043e\u0439\u043a\u0430</strong> \u2014 \u0442\u0440\u0438 \u043a\u0430\u0440\u0442\u044b \u043e\u0434\u043d\u043e\u0433\u043e \u0434\u043e\u0441\u0442\u043e\u0438\u043d\u0441\u0442\u0432\u0430.</li><li><strong>\u0414\u0432\u0435 \u043f\u0430\u0440\u044b</strong> \u2014 \u0434\u0432\u0435 \u0440\u0430\u0437\u043d\u044b\u0435 \u043f\u0430\u0440\u044b.</li><li><strong>\u041f\u0430\u0440\u0430</strong> \u2014 \u0434\u0432\u0435 \u043a\u0430\u0440\u0442\u044b \u043e\u0434\u043d\u043e\u0433\u043e \u0434\u043e\u0441\u0442\u043e\u0438\u043d\u0441\u0442\u0432\u0430.</li><li><strong>\u0421\u0442\u0430\u0440\u0448\u0430\u044f \u043a\u0430\u0440\u0442\u0430</strong> \u2014 \u043d\u0438\u0447\u0435\u0433\u043e \u0438\u0437 \u043f\u0435\u0440\u0435\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u043e\u0433\u043e; \u0440\u0435\u0448\u0430\u0435\u0442 \u0441\u0430\u043c\u0430\u044f \u0432\u044b\u0441\u043e\u043a\u0430\u044f \u043a\u0430\u0440\u0442\u0430.</li></ol><h2>\u0422\u0443\u0440\u043d\u0438\u0440\u044b \u0432 PokerTH</h2><p>\u0418\u0433\u0440\u044b \u0432 PokerTH \u2014 \u044d\u0442\u043e \u0442\u0443\u0440\u043d\u0438\u0440\u044b \u0444\u043e\u0440\u043c\u0430\u0442\u0430 sit-and-go: \u0432\u0441\u0435 \u043d\u0430\u0447\u0438\u043d\u0430\u044e\u0442 \u0441 \u043e\u0434\u0438\u043d\u0430\u043a\u043e\u0432\u044b\u043c \u0441\u0442\u0435\u043a\u043e\u043c, \u0431\u043b\u0430\u0439\u043d\u0434\u044b \u0441\u043e \u0432\u0440\u0435\u043c\u0435\u043d\u0435\u043c \u0440\u0430\u0441\u0442\u0443\u0442, \u0430 \u043f\u043e\u0431\u0435\u0436\u0434\u0430\u0435\u0442 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0438\u0433\u0440\u043e\u043a, \u0443 \u043a\u043e\u0442\u043e\u0440\u043e\u0433\u043e \u043e\u0441\u0442\u0430\u043b\u0438\u0441\u044c \u0444\u0438\u0448\u043a\u0438. \u041c\u043e\u0436\u043d\u043e \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u0430\u0442\u044c\u0441\u044f \u043e\u0444\u043b\u0430\u0439\u043d \u043f\u0440\u043e\u0442\u0438\u0432 \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u043d\u044b\u0445 \u0441\u043e\u043f\u0435\u0440\u043d\u0438\u043a\u043e\u0432, \u0438\u0433\u0440\u0430\u0442\u044c \u043f\u043e \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u043e\u0439 \u0441\u0435\u0442\u0438 \u0438\u043b\u0438 \u043d\u0430 \u0441\u0432\u043e\u0451\u043c \u0441\u0435\u0440\u0432\u0435\u0440\u0435 \u043b\u0438\u0431\u043e \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c\u0441\u044f \u043a \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0439 \u0441\u0435\u0442\u0438 pokerth.net \u0441 \u0441\u0435\u0437\u043e\u043d\u043d\u044b\u043c\u0438 \u0440\u0435\u0439\u0442\u0438\u043d\u0433\u0430\u043c\u0438.</p>" },
  'pt-BR': {
    title: "Regras do Texas Hold\u2019em \u2014 Cliente web do PokerTH",
    desc: "Regras completas do Texas Hold\u2019em como se joga no PokerTH: blinds, as quatro rodadas de apostas, Fold/Check/Call/Raise/All-In, side pots e ranking das m\u00e3os.",
    ldHeadline: "Regras do p\u00f4quer Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Como jogar No-Limit Texas Hold\u2019em: blinds, rodadas de apostas, a\u00e7\u00f5es e ranking das m\u00e3os, como no PokerTH.",
    body: "<h1>Regras do p\u00f4quer Texas Hold\u2019em</h1><p>No PokerTH joga-se No-Limit Texas Hold\u2019em, a variante de p\u00f4quer mais popular do mundo. Cada jogador tenta formar a melhor m\u00e3o de cinco cartas a partir de duas cartas pr\u00f3prias e cinco cartas comunit\u00e1rias.</p><h2>A distribui\u00e7\u00e3o e os blinds</h2><p>Cada m\u00e3o come\u00e7a com duas apostas obrigat\u00f3rias: o jogador \u00e0 esquerda do bot\u00e3o do dealer paga o <em>small blind</em> e o seguinte, o <em>big blind</em>. Em seguida cada jogador recebe duas cartas viradas para baixo (as <em>cartas fechadas</em>). O bot\u00e3o avan\u00e7a um lugar no sentido hor\u00e1rio ap\u00f3s cada m\u00e3o, e no PokerTH os blinds sobem em intervalos regulares.</p><h2>As quatro rodadas de apostas</h2><ul><li><strong>Pre-flop</strong> \u2014 depois de receber as cartas fechadas, os jogadores agem em ordem, come\u00e7ando \u00e0 esquerda do big blind.</li><li><strong>Flop</strong> \u2014 tr\u00eas cartas comunit\u00e1rias s\u00e3o abertas na mesa, seguidas de uma rodada de apostas.</li><li><strong>Turn</strong> \u2014 uma quarta carta comunit\u00e1ria \u00e9 distribu\u00edda, seguida de outra rodada de apostas.</li><li><strong>River</strong> \u2014 a quinta e \u00faltima carta comunit\u00e1ria \u00e9 distribu\u00edda, seguida da rodada final de apostas.</li></ul><h2>As a\u00e7\u00f5es</h2><ul><li><strong>Fold</strong> \u2014 desistir da m\u00e3o e das fichas j\u00e1 apostadas.</li><li><strong>Check</strong> \u2014 passar a vez sem apostar (s\u00f3 se ningu\u00e9m tiver apostado na rodada atual).</li><li><strong>Call</strong> \u2014 igualar a aposta mais alta do momento.</li><li><strong>Raise</strong> \u2014 aumentar a aposta atual. No No-Limit, qualquer valor at\u00e9 todo o seu stack.</li><li><strong>All-In</strong> \u2014 apostar todas as suas fichas. Se os outros continuarem apostando acima disso, s\u00e3o criados side pots, de modo que voc\u00ea s\u00f3 pode ganhar a parte do pote para a qual contribuiu.</li></ul><h2>O showdown</h2><p>Se restarem dois ou mais jogadores depois da rodada de apostas do river, as m\u00e3os s\u00e3o reveladas. A melhor combina\u00e7\u00e3o de cinco cartas entre as sete dispon\u00edveis (duas fechadas + cinco comunit\u00e1rias) leva o pote. M\u00e3os iguais dividem o pote.</p><h2>Ranking das m\u00e3os, da mais forte \u00e0 mais fraca</h2><ol><li><strong>Royal Flush</strong> \u2014 A K Q J 10, todas do mesmo naipe.</li><li><strong>Straight Flush</strong> \u2014 cinco cartas em sequ\u00eancia do mesmo naipe.</li><li><strong>Quadra</strong> \u2014 quatro cartas do mesmo valor.</li><li><strong>Full House</strong> \u2014 uma trinca mais um par.</li><li><strong>Flush</strong> \u2014 cinco cartas do mesmo naipe.</li><li><strong>Sequ\u00eancia</strong> \u2014 cinco cartas em sequ\u00eancia de naipes diferentes.</li><li><strong>Trinca</strong> \u2014 tr\u00eas cartas do mesmo valor.</li><li><strong>Dois pares</strong> \u2014 dois pares diferentes.</li><li><strong>Um par</strong> \u2014 duas cartas do mesmo valor.</li><li><strong>Carta alta</strong> \u2014 nada do que est\u00e1 acima; decide a carta mais alta.</li></ol><h2>Os torneios no PokerTH</h2><p>As partidas do PokerTH s\u00e3o torneios no estilo sit-and-go: todos come\u00e7am com o mesmo stack, os blinds sobem com o tempo e vence o \u00faltimo jogador com fichas. Voc\u00ea pode treinar offline contra oponentes controlados pelo computador, jogar em LAN ou num servidor privado, ou entrar na rede oficial pokerth.net com seus rankings por temporada.</p>" },
  ja: {
    title: "\u30c6\u30ad\u30b5\u30b9\u30db\u30fc\u30eb\u30c7\u30e0\u306e\u30eb\u30fc\u30eb \u2014 PokerTH \u30a6\u30a7\u30d6\u7248",
    desc: "PokerTH \u3067\u904a\u3079\u308b\u30c6\u30ad\u30b5\u30b9\u30db\u30fc\u30eb\u30c7\u30e0\u306e\u5b8c\u5168\u306a\u30eb\u30fc\u30eb\uff1a\u30d6\u30e9\u30a4\u30f3\u30c9\u30014\u56de\u306e\u30d9\u30c3\u30c6\u30a3\u30f3\u30b0\u30e9\u30a6\u30f3\u30c9\u3001Fold/Check/Call/Raise/All-In\u3001\u30b5\u30a4\u30c9\u30dd\u30c3\u30c8\u3001\u5f79\u306e\u5f37\u3055\u3002",
    ldHeadline: "\u30c6\u30ad\u30b5\u30b9\u30db\u30fc\u30eb\u30c7\u30e0 \u30dd\u30fc\u30ab\u30fc\u306e\u30eb\u30fc\u30eb \u2014 PokerTH",
    ldDesc: "\u30ce\u30fc\u30ea\u30df\u30c3\u30c8\u30fb\u30c6\u30ad\u30b5\u30b9\u30db\u30fc\u30eb\u30c7\u30e0\u306e\u904a\u3073\u65b9\uff1a\u30d6\u30e9\u30a4\u30f3\u30c9\u3001\u30d9\u30c3\u30c6\u30a3\u30f3\u30b0\u30e9\u30a6\u30f3\u30c9\u3001\u30a2\u30af\u30b7\u30e7\u30f3\u3001\u5f79\u306e\u5f37\u3055\u3092 PokerTH \u306e\u30eb\u30fc\u30eb\u3067\u89e3\u8aac\u3002",
    body: "<h1>\u30c6\u30ad\u30b5\u30b9\u30db\u30fc\u30eb\u30c7\u30e0 \u30dd\u30fc\u30ab\u30fc\u306e\u30eb\u30fc\u30eb</h1><p>PokerTH \u3067\u904a\u3079\u308b\u306e\u306f\u30ce\u30fc\u30ea\u30df\u30c3\u30c8\u30fb\u30c6\u30ad\u30b5\u30b9\u30db\u30fc\u30eb\u30c7\u30e0\u3001\u4e16\u754c\u3067\u3082\u3063\u3068\u3082\u4eba\u6c17\u306e\u3042\u308b\u30dd\u30fc\u30ab\u30fc\u3067\u3059\u3002\u5404\u30d7\u30ec\u30a4\u30e4\u30fc\u306f\u624b\u672d2\u679a\u3068\u5171\u901a\u30ab\u30fc\u30c95\u679a\u304b\u3089\u3001\u6700\u5f37\u306e5\u679a\u306e\u5f79\u3092\u4f5c\u308b\u3053\u3068\u3092\u76ee\u6307\u3057\u307e\u3059\u3002</p><h2>\u914d\u724c\u3068\u30d6\u30e9\u30a4\u30f3\u30c9</h2><p>\u5404\u30cf\u30f3\u30c9\u306f2\u3064\u306e\u5f37\u5236\u30d9\u30c3\u30c8\u304b\u3089\u59cb\u307e\u308a\u307e\u3059\u3002\u30c7\u30a3\u30fc\u30e9\u30fc\u30dc\u30bf\u30f3\u306e\u5de6\u96a3\u304c<em>\u30b9\u30e2\u30fc\u30eb\u30d6\u30e9\u30a4\u30f3\u30c9</em>\u3092\u3001\u305d\u306e\u6b21\u306e\u30d7\u30ec\u30a4\u30e4\u30fc\u304c<em>\u30d3\u30c3\u30b0\u30d6\u30e9\u30a4\u30f3\u30c9</em>\u3092\u51fa\u3057\u307e\u3059\u3002\u7d9a\u3044\u3066\u5404\u30d7\u30ec\u30a4\u30e4\u30fc\u306b\u4f0f\u305b\u305f2\u679a\u306e\u30ab\u30fc\u30c9\uff08<em>\u30db\u30fc\u30eb\u30ab\u30fc\u30c9</em>\uff09\u304c\u914d\u3089\u308c\u307e\u3059\u3002\u30dc\u30bf\u30f3\u306f1\u30cf\u30f3\u30c9\u3054\u3068\u306b\u6642\u8a08\u56de\u308a\u306b1\u5e2d\u305a\u3064\u79fb\u52d5\u3057\u3001PokerTH \u3067\u306f\u30d6\u30e9\u30a4\u30f3\u30c9\u304c\u4e00\u5b9a\u9593\u9694\u3067\u4e0a\u304c\u3063\u3066\u3044\u304d\u307e\u3059\u3002</p><h2>4\u56de\u306e\u30d9\u30c3\u30c6\u30a3\u30f3\u30b0\u30e9\u30a6\u30f3\u30c9</h2><ul><li><strong>Pre-flop</strong>\uff08\u30d7\u30ea\u30d5\u30ed\u30c3\u30d7\uff09\u2014 \u30db\u30fc\u30eb\u30ab\u30fc\u30c9\u3092\u53d7\u3051\u53d6\u3063\u305f\u5f8c\u3001\u30d3\u30c3\u30b0\u30d6\u30e9\u30a4\u30f3\u30c9\u306e\u5de6\u96a3\u304b\u3089\u9806\u306b\u884c\u52d5\u3057\u307e\u3059\u3002</li><li><strong>Flop</strong>\uff08\u30d5\u30ed\u30c3\u30d7\uff09\u2014 \u5171\u901a\u30ab\u30fc\u30c9\u304c3\u679a\u8868\u5411\u304d\u306b\u914d\u3089\u308c\u3001\u30d9\u30c3\u30c6\u30a3\u30f3\u30b0\u30e9\u30a6\u30f3\u30c9\u304c\u7d9a\u304d\u307e\u3059\u3002</li><li><strong>Turn</strong>\uff08\u30bf\u30fc\u30f3\uff09\u2014 4\u679a\u76ee\u306e\u5171\u901a\u30ab\u30fc\u30c9\u304c\u914d\u3089\u308c\u3001\u3082\u3046\u4e00\u5ea6\u30d9\u30c3\u30c6\u30a3\u30f3\u30b0\u30e9\u30a6\u30f3\u30c9\u304c\u3042\u308a\u307e\u3059\u3002</li><li><strong>River</strong>\uff08\u30ea\u30d0\u30fc\uff09\u2014 5\u679a\u76ee\u3001\u6700\u5f8c\u306e\u5171\u901a\u30ab\u30fc\u30c9\u304c\u914d\u3089\u308c\u3001\u6700\u7d42\u306e\u30d9\u30c3\u30c6\u30a3\u30f3\u30b0\u30e9\u30a6\u30f3\u30c9\u3068\u306a\u308a\u307e\u3059\u3002</li></ul><h2>\u30a2\u30af\u30b7\u30e7\u30f3</h2><ul><li><strong>Fold</strong>\uff08\u30d5\u30a9\u30fc\u30eb\u30c9\uff09\u2014 \u30cf\u30f3\u30c9\u3092\u964d\u308a\u3001\u3059\u3067\u306b\u8ced\u3051\u305f\u30c1\u30c3\u30d7\u3082\u624b\u653e\u3057\u307e\u3059\u3002</li><li><strong>Check</strong>\uff08\u30c1\u30a7\u30c3\u30af\uff09\u2014 \u8ced\u3051\u305a\u306b\u6b21\u3078\u56de\u3057\u307e\u3059\uff08\u305d\u306e\u30e9\u30a6\u30f3\u30c9\u3067\u8ab0\u3082\u30d9\u30c3\u30c8\u3057\u3066\u3044\u306a\u3044\u5834\u5408\u306e\u307f\uff09\u3002</li><li><strong>Call</strong>\uff08\u30b3\u30fc\u30eb\uff09\u2014 \u73fe\u5728\u306e\u6700\u9ad8\u30d9\u30c3\u30c8\u984d\u306b\u5408\u308f\u305b\u307e\u3059\u3002</li><li><strong>Raise</strong>\uff08\u30ec\u30a4\u30ba\uff09\u2014 \u73fe\u5728\u306e\u30d9\u30c3\u30c8\u984d\u3092\u5f15\u304d\u4e0a\u3052\u307e\u3059\u3002\u30ce\u30fc\u30ea\u30df\u30c3\u30c8\u3067\u306f\u81ea\u5206\u306e\u30b9\u30bf\u30c3\u30af\u5168\u984d\u307e\u3067\u53ef\u80fd\u3067\u3059\u3002</li><li><strong>All-In</strong>\uff08\u30aa\u30fc\u30eb\u30a4\u30f3\uff09\u2014 \u6301\u3063\u3066\u3044\u308b\u30c1\u30c3\u30d7\u3092\u3059\u3079\u3066\u8ced\u3051\u307e\u3059\u3002\u4ed6\u306e\u30d7\u30ec\u30a4\u30e4\u30fc\u304c\u305d\u308c\u3092\u8d85\u3048\u3066\u8ced\u3051\u7d9a\u3051\u305f\u5834\u5408\u306f\u30b5\u30a4\u30c9\u30dd\u30c3\u30c8\u304c\u4f5c\u3089\u308c\u3001\u81ea\u5206\u304c\u53c2\u52a0\u3057\u305f\u5206\u306e\u30dd\u30c3\u30c8\u3057\u304b\u7372\u5f97\u3067\u304d\u307e\u305b\u3093\u3002</li></ul><h2>\u30b7\u30e7\u30fc\u30c0\u30a6\u30f3</h2><p>\u30ea\u30d0\u30fc\u306e\u30d9\u30c3\u30c6\u30a3\u30f3\u30b0\u30e9\u30a6\u30f3\u30c9\u5f8c\u306b2\u4eba\u4ee5\u4e0a\u304c\u6b8b\u3063\u3066\u3044\u308c\u3070\u3001\u624b\u672d\u3092\u516c\u958b\u3057\u307e\u3059\u3002\u4f7f\u3048\u308b7\u679a\uff08\u30db\u30fc\u30eb\u30ab\u30fc\u30c92\u679a\uff0b\u5171\u901a\u30ab\u30fc\u30c95\u679a\uff09\u304b\u3089\u4f5c\u308b\u6700\u5f37\u306e5\u679a\u306e\u7d44\u307f\u5408\u308f\u305b\u304c\u30dd\u30c3\u30c8\u3092\u7372\u5f97\u3057\u3001\u540c\u3058\u5f37\u3055\u306a\u3089\u30dd\u30c3\u30c8\u3092\u5206\u3051\u5408\u3044\u307e\u3059\u3002</p><h2>\u5f79\u306e\u5f37\u3055\uff08\u5f37\u3044\u9806\uff09</h2><ol><li><strong>\u30ed\u30a4\u30e4\u30eb\u30d5\u30e9\u30c3\u30b7\u30e5</strong> \u2014 A K Q J 10 \u306e\u540c\u3058\u30b9\u30fc\u30c8\u3002</li><li><strong>\u30b9\u30c8\u30ec\u30fc\u30c8\u30d5\u30e9\u30c3\u30b7\u30e5</strong> \u2014 \u540c\u3058\u30b9\u30fc\u30c8\u306e\u9023\u7d9a\u3057\u305f5\u679a\u3002</li><li><strong>\u30d5\u30a9\u30fc\u30ab\u30fc\u30c9</strong> \u2014 \u540c\u3058\u6570\u5b57\u306e4\u679a\u3002</li><li><strong>\u30d5\u30eb\u30cf\u30a6\u30b9</strong> \u2014 \u30b9\u30ea\u30fc\u30ab\u30fc\u30c9\u3068\u30ef\u30f3\u30da\u30a2\u3002</li><li><strong>\u30d5\u30e9\u30c3\u30b7\u30e5</strong> \u2014 \u540c\u3058\u30b9\u30fc\u30c8\u306e5\u679a\u3002</li><li><strong>\u30b9\u30c8\u30ec\u30fc\u30c8</strong> \u2014 \u30b9\u30fc\u30c8\u306f\u554f\u308f\u305a\u9023\u7d9a\u3057\u305f5\u679a\u3002</li><li><strong>\u30b9\u30ea\u30fc\u30ab\u30fc\u30c9</strong> \u2014 \u540c\u3058\u6570\u5b57\u306e3\u679a\u3002</li><li><strong>\u30c4\u30fc\u30da\u30a2</strong> \u2014 \u7570\u306a\u308b2\u7d44\u306e\u30da\u30a2\u3002</li><li><strong>\u30ef\u30f3\u30da\u30a2</strong> \u2014 \u540c\u3058\u6570\u5b57\u306e2\u679a\u3002</li><li><strong>\u30cf\u30a4\u30ab\u30fc\u30c9</strong> \u2014 \u4e0a\u8a18\u306e\u3044\u305a\u308c\u3067\u3082\u306a\u304f\u3001\u6700\u3082\u9ad8\u3044\u30ab\u30fc\u30c9\u3067\u6c7a\u307e\u308a\u307e\u3059\u3002</li></ol><h2>PokerTH \u306e\u30c8\u30fc\u30ca\u30e1\u30f3\u30c8</h2><p>PokerTH \u306e\u30b2\u30fc\u30e0\u306f\u30b7\u30c3\u30c8\u30fb\u30a2\u30f3\u30c9\u30fb\u30b4\u30fc\u5f62\u5f0f\u306e\u30c8\u30fc\u30ca\u30e1\u30f3\u30c8\u3067\u3059\u3002\u5168\u54e1\u304c\u540c\u3058\u30b9\u30bf\u30c3\u30af\u3067\u59cb\u307e\u308a\u3001\u30d6\u30e9\u30a4\u30f3\u30c9\u306f\u6642\u9593\u3068\u3068\u3082\u306b\u4e0a\u304c\u308a\u3001\u6700\u5f8c\u307e\u3067\u30c1\u30c3\u30d7\u3092\u6301\u3063\u3066\u3044\u305f\u30d7\u30ec\u30a4\u30e4\u30fc\u304c\u52dd\u3061\u307e\u3059\u3002\u30aa\u30d5\u30e9\u30a4\u30f3\u3067\u30b3\u30f3\u30d4\u30e5\u30fc\u30bf\u76f8\u624b\u306b\u7df4\u7fd2\u3057\u305f\u308a\u3001LAN \u3084\u30d7\u30e9\u30a4\u30d9\u30fc\u30c8\u30b5\u30fc\u30d0\u30fc\u3067\u904a\u3093\u3060\u308a\u3001\u30b7\u30fc\u30ba\u30f3\u30e9\u30f3\u30ad\u30f3\u30b0\u306e\u3042\u308b\u516c\u5f0f pokerth.net \u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u306b\u53c2\u52a0\u3057\u305f\u308a\u3067\u304d\u307e\u3059\u3002</p>" },
  it: {
    title: "Regole del Texas Hold\u2019em \u2014 Client web PokerTH",
    desc: "Regole complete del Texas Hold\u2019em come si gioca in PokerTH: bui, i quattro giri di puntate, Fold/Check/Call/Raise/All-In, side pot e scala dei punti.",
    ldHeadline: "Regole del poker Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Come si gioca al No-Limit Texas Hold\u2019em: bui, giri di puntate, azioni e scala dei punti, come in PokerTH.",
    body: "<h1>Regole del poker Texas Hold\u2019em</h1><p>In PokerTH si gioca a No-Limit Texas Hold\u2019em, la variante di poker pi\u00f9 diffusa al mondo. Ogni giocatore cerca di comporre il miglior punto di cinque carte usando due carte private e cinque carte comuni.</p><h2>La distribuzione e i bui</h2><p>Ogni mano inizia con due puntate obbligate: il giocatore alla sinistra del bottone del mazziere versa il <em>piccolo buio</em>, il successivo il <em>grande buio</em>. Poi a ogni giocatore vengono date due carte coperte (le <em>carte private</em>). Il bottone avanza di un posto in senso orario dopo ogni mano e in PokerTH i bui salgono a intervalli regolari.</p><h2>I quattro giri di puntate</h2><ul><li><strong>Pre-flop</strong> \u2014 ricevute le carte private, i giocatori agiscono a turno partendo dalla sinistra del grande buio.</li><li><strong>Flop</strong> \u2014 vengono scoperte tre carte comuni, seguite da un giro di puntate.</li><li><strong>Turn</strong> \u2014 viene servita una quarta carta comune, seguita da un altro giro di puntate.</li><li><strong>River</strong> \u2014 viene servita la quinta e ultima carta comune, seguita dal giro di puntate finale.</li></ul><h2>Le azioni</h2><ul><li><strong>Fold</strong> \u2014 abbandonare la mano e le fiche gi\u00e0 puntate.</li><li><strong>Check</strong> \u2014 passare senza puntare (solo se nessuno ha puntato nel giro in corso).</li><li><strong>Call</strong> \u2014 pareggiare la puntata pi\u00f9 alta.</li><li><strong>Raise</strong> \u2014 aumentare la puntata in corso. Nel No-Limit, di qualsiasi importo fino a tutto il proprio stack.</li><li><strong>All-In</strong> \u2014 puntare tutte le proprie fiche. Se gli altri continuano a puntare oltre, si creano dei side pot, cos\u00ec puoi vincere solo la parte di piatto a cui hai contribuito.</li></ul><h2>Lo showdown</h2><p>Se dopo il giro di puntate del river restano due o pi\u00f9 giocatori, le mani vengono mostrate. La migliore combinazione di cinque carte fra le sette disponibili (due private + cinque comuni) vince il piatto. I punti uguali lo dividono.</p><h2>Scala dei punti, dal pi\u00f9 forte al pi\u00f9 debole</h2><ol><li><strong>Scala reale</strong> \u2014 A K Q J 10, tutte dello stesso seme.</li><li><strong>Scala a colore</strong> \u2014 cinque carte consecutive dello stesso seme.</li><li><strong>Poker</strong> \u2014 quattro carte dello stesso valore.</li><li><strong>Full</strong> \u2014 un tris pi\u00f9 una coppia.</li><li><strong>Colore</strong> \u2014 cinque carte dello stesso seme.</li><li><strong>Scala</strong> \u2014 cinque carte consecutive di semi diversi.</li><li><strong>Tris</strong> \u2014 tre carte dello stesso valore.</li><li><strong>Doppia coppia</strong> \u2014 due coppie diverse.</li><li><strong>Coppia</strong> \u2014 due carte dello stesso valore.</li><li><strong>Carta alta</strong> \u2014 nessuno dei punti precedenti; decide la carta pi\u00f9 alta.</li></ol><h2>I tornei in PokerTH</h2><p>Le partite di PokerTH sono tornei in stile sit-and-go: tutti partono con lo stesso stack, i bui salgono con il tempo e vince l\u2019ultimo giocatore rimasto con le fiche. Puoi allenarti offline contro avversari gestiti dal computer, giocare in LAN o su un server privato, oppure entrare nella rete ufficiale pokerth.net con le sue classifiche stagionali.</p>" },
  pl: {
    title: "Zasady Texas Hold\u2019em \u2014 klient webowy PokerTH",
    desc: "Pe\u0142ne zasady Texas Hold\u2019em w wersji granej w PokerTH: ciemne, cztery rundy licytacji, Fold/Check/Call/Raise/All-In, pule boczne i uk\u0142ady kart.",
    ldHeadline: "Zasady pokera Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Jak gra\u0107 w Texas Hold\u2019em bez limitu: ciemne, rundy licytacji, akcje i uk\u0142ady kart, tak jak w PokerTH.",
    body: "<h1>Zasady pokera Texas Hold\u2019em</h1><p>W PokerTH gra si\u0119 w Texas Hold\u2019em bez limitu \u2014 najpopularniejsz\u0105 odmian\u0119 pokera na \u015bwiecie. Ka\u017cdy gracz stara si\u0119 u\u0142o\u017cy\u0107 najlepszy pi\u0119ciokartowy uk\u0142ad z dw\u00f3ch kart w\u0142asnych i pi\u0119ciu kart wsp\u00f3lnych.</p><h2>Rozdanie i ciemne</h2><p>Ka\u017cde rozdanie zaczyna si\u0119 od dw\u00f3ch przymusowych zak\u0142ad\u00f3w: gracz po lewej od \u017cetonu rozdaj\u0105cego wp\u0142aca <em>ma\u0142\u0105 ciemn\u0105</em>, a nast\u0119pny <em>du\u017c\u0105 ciemn\u0105</em>. Potem ka\u017cdy gracz dostaje dwie zakryte karty (<em>karty w\u0142asne</em>). \u017beton rozdaj\u0105cego przesuwa si\u0119 po ka\u017cdym rozdaniu o jedno miejsce zgodnie z ruchem wskaz\u00f3wek zegara, a w PokerTH ciemne rosn\u0105 w r\u00f3wnych odst\u0119pach czasu.</p><h2>Cztery rundy licytacji</h2><ul><li><strong>Pre-flop</strong> \u2014 po otrzymaniu kart w\u0142asnych gracze graj\u0105 po kolei, zaczynaj\u0105c od miejsca po lewej od du\u017cej ciemnej.</li><li><strong>Flop</strong> \u2014 na st\u00f3\u0142 trafiaj\u0105 trzy odkryte karty wsp\u00f3lne, po czym nast\u0119puje runda licytacji.</li><li><strong>Turn</strong> \u2014 dochodzi czwarta karta wsp\u00f3lna i kolejna runda licytacji.</li><li><strong>River</strong> \u2014 dochodzi pi\u0105ta, ostatnia karta wsp\u00f3lna i ko\u0144cowa runda licytacji.</li></ul><h2>Akcje</h2><ul><li><strong>Fold</strong> \u2014 spasowa\u0107 i odda\u0107 ju\u017c postawione \u017cetony.</li><li><strong>Check</strong> \u2014 sprawdzi\u0107 bez zak\u0142adu (tylko je\u015bli w tej rundzie nikt jeszcze nie postawi\u0142).</li><li><strong>Call</strong> \u2014 wyr\u00f3wna\u0107 najwy\u017cszy obecny zak\u0142ad.</li><li><strong>Raise</strong> \u2014 podbi\u0107 obecny zak\u0142ad. Bez limitu \u2014 o dowoln\u0105 kwot\u0119 a\u017c po ca\u0142y sw\u00f3j stos.</li><li><strong>All-In</strong> \u2014 postawi\u0107 wszystkie swoje \u017cetony. Je\u015bli inni licytuj\u0105 dalej powy\u017cej tej kwoty, powstaj\u0105 pule boczne, wi\u0119c mo\u017cesz wygra\u0107 tylko t\u0119 cz\u0119\u015b\u0107 puli, do kt\u00f3rej do\u0142o\u017cy\u0142e\u015b.</li></ul><h2>Odkrycie kart</h2><p>Je\u015bli po rundzie licytacji na riverze zostaje dw\u00f3ch lub wi\u0119cej graczy, karty zostaj\u0105 odkryte. Najlepszy pi\u0119ciokartowy uk\u0142ad z siedmiu dost\u0119pnych kart (dwie w\u0142asne + pi\u0119\u0107 wsp\u00f3lnych) wygrywa pul\u0119. R\u00f3wne uk\u0142ady dziel\u0105 j\u0105 mi\u0119dzy siebie.</p><h2>Uk\u0142ady kart, od najsilniejszego do najs\u0142abszego</h2><ol><li><strong>Poker kr\u00f3lewski</strong> \u2014 A K Q J 10 w jednym kolorze.</li><li><strong>Poker</strong> \u2014 pi\u0119\u0107 kolejnych kart w jednym kolorze.</li><li><strong>Kareta</strong> \u2014 cztery karty tej samej wysoko\u015bci.</li><li><strong>Full</strong> \u2014 tr\u00f3jka plus para.</li><li><strong>Kolor</strong> \u2014 pi\u0119\u0107 kart w jednym kolorze.</li><li><strong>Strit</strong> \u2014 pi\u0119\u0107 kolejnych kart w r\u00f3\u017cnych kolorach.</li><li><strong>Tr\u00f3jka</strong> \u2014 trzy karty tej samej wysoko\u015bci.</li><li><strong>Dwie pary</strong> \u2014 dwie r\u00f3\u017cne pary.</li><li><strong>Para</strong> \u2014 dwie karty tej samej wysoko\u015bci.</li><li><strong>Wysoka karta</strong> \u2014 \u017caden z powy\u017cszych uk\u0142ad\u00f3w; decyduje najwy\u017csza karta.</li></ol><h2>Turnieje w PokerTH</h2><p>Gry w PokerTH to turnieje typu sit-and-go: wszyscy zaczynaj\u0105 z tym samym stosem, ciemne rosn\u0105 z up\u0142ywem czasu, a wygrywa ostatni gracz z \u017cetonami. Mo\u017cesz trenowa\u0107 offline przeciwko komputerowym przeciwnikom, gra\u0107 w sieci LAN lub na w\u0142asnym serwerze albo do\u0142\u0105czy\u0107 do oficjalnej sieci pokerth.net z rankingami sezonowymi.</p>" },
  nl: {
    title: "Texas Hold\u2019em-regels \u2014 PokerTH webclient",
    desc: "Volledige Texas Hold\u2019em-regels zoals gespeeld in PokerTH: blinds, de vier inzetrondes, Fold/Check/Call/Raise/All-In, side pots en handwaarderingen.",
    ldHeadline: "Texas Hold\u2019em pokerregels \u2014 PokerTH",
    ldDesc: "Hoe je No-Limit Texas Hold\u2019em speelt: blinds, inzetrondes, acties en handwaarderingen, zoals in PokerTH.",
    body: "<h1>Texas Hold\u2019em pokerregels</h1><p>In PokerTH speel je No-Limit Texas Hold\u2019em, wereldwijd de populairste pokervariant. Elke speler probeert de beste hand van vijf kaarten te maken uit twee eigen kaarten en vijf gedeelde kaarten.</p><h2>Het delen en de blinds</h2><p>Elke hand begint met twee verplichte inzetten: de speler links van de dealerbutton legt de <em>small blind</em> in, de volgende de <em>big blind</em>. Daarna krijgt elke speler twee gesloten kaarten (de <em>hole cards</em>). De button schuift na elke hand \u00e9\u00e9n plaats met de klok mee, en in PokerTH stijgen de blinds op vaste tijdstippen.</p><h2>De vier inzetrondes</h2><ul><li><strong>Pre-flop</strong> \u2014 na het krijgen van de hole cards komen de spelers om beurten aan zet, te beginnen links van de big blind.</li><li><strong>Flop</strong> \u2014 er worden drie gedeelde kaarten open gelegd, gevolgd door een inzetronde.</li><li><strong>Turn</strong> \u2014 er komt een vierde gedeelde kaart bij, gevolgd door opnieuw een inzetronde.</li><li><strong>River</strong> \u2014 de vijfde en laatste gedeelde kaart komt op tafel, gevolgd door de laatste inzetronde.</li></ul><h2>De acties</h2><ul><li><strong>Fold</strong> \u2014 de hand opgeven, inclusief de al ingezette fiches.</li><li><strong>Check</strong> \u2014 doorgeven zonder in te zetten (alleen als niemand in deze ronde heeft ingezet).</li><li><strong>Call</strong> \u2014 de hoogste inzet van dat moment volgen.</li><li><strong>Raise</strong> \u2014 de huidige inzet verhogen. Bij No-Limit met elk bedrag tot en met je hele stack.</li><li><strong>All-In</strong> \u2014 al je fiches inzetten. Blijven anderen daarboven doorzetten, dan ontstaan er side pots, zodat je alleen het deel van de pot kunt winnen waaraan je hebt bijgedragen.</li></ul><h2>De showdown</h2><p>Blijven er na de inzetronde op de river twee of meer spelers over, dan worden de handen getoond. De beste combinatie van vijf kaarten uit de zeven beschikbare (twee hole cards + vijf gedeelde kaarten) wint de pot. Gelijke handen delen de pot.</p><h2>Handwaarderingen, van sterk naar zwak</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10, allemaal dezelfde kleur.</li><li><strong>Straight flush</strong> \u2014 vijf opeenvolgende kaarten van dezelfde kleur.</li><li><strong>Vier gelijken</strong> \u2014 vier kaarten van dezelfde waarde.</li><li><strong>Full house</strong> \u2014 drie gelijken plus een paar.</li><li><strong>Flush</strong> \u2014 vijf kaarten van dezelfde kleur.</li><li><strong>Straat</strong> \u2014 vijf opeenvolgende kaarten in verschillende kleuren.</li><li><strong>Drie gelijken</strong> \u2014 drie kaarten van dezelfde waarde.</li><li><strong>Twee paar</strong> \u2014 twee verschillende paren.</li><li><strong>E\u00e9n paar</strong> \u2014 twee kaarten van dezelfde waarde.</li><li><strong>Hoogste kaart</strong> \u2014 niets van het bovenstaande; de hoogste kaart beslist.</li></ol><h2>Toernooien in PokerTH</h2><p>Partijen in PokerTH zijn sit-and-go-toernooien: iedereen begint met dezelfde stack, de blinds lopen op en de laatste speler met fiches wint. Je kunt offline oefenen tegen computertegenstanders, via LAN of een eigen server spelen, of meedoen op het offici\u00eble pokerth.net-netwerk met seizoensklassementen.</p>" },
  tr: {
    title: "Texas Hold\u2019em kurallar\u0131 \u2014 PokerTH web istemcisi",
    desc: "PokerTH\u2019de oynand\u0131\u011f\u0131 \u015fekliyle eksiksiz Texas Hold\u2019em kurallar\u0131: k\u00f6rler, d\u00f6rt bahis turu, Fold/Check/Call/Raise/All-In, yan potlar ve el s\u0131ralamas\u0131.",
    ldHeadline: "Texas Hold\u2019em poker kurallar\u0131 \u2014 PokerTH",
    ldDesc: "No-Limit Texas Hold\u2019em nas\u0131l oynan\u0131r: k\u00f6rler, bahis turlar\u0131, hamleler ve el s\u0131ralamas\u0131, PokerTH\u2019deki haliyle.",
    body: "<h1>Texas Hold\u2019em poker kurallar\u0131</h1><p>PokerTH\u2019de No-Limit Texas Hold\u2019em oynan\u0131r; d\u00fcnyan\u0131n en yayg\u0131n poker t\u00fcr\u00fc. Her oyuncu, iki kapal\u0131 kendi kart\u0131 ile be\u015f ortak karttan en iyi be\u015f kartl\u0131k eli kurmaya \u00e7al\u0131\u015f\u0131r.</p><h2>Da\u011f\u0131t\u0131m ve k\u00f6rler</h2><p>Her el iki zorunlu bahisle ba\u015flar: da\u011f\u0131t\u0131c\u0131 d\u00fc\u011fmesinin solundaki oyuncu <em>k\u00fc\u00e7\u00fck k\u00f6r</em>\u00fc, sonraki oyuncu <em>b\u00fcy\u00fck k\u00f6r</em>\u00fc yat\u0131r\u0131r. Ard\u0131ndan her oyuncuya kapal\u0131 iki kart (<em>el kartlar\u0131</em>) da\u011f\u0131t\u0131l\u0131r. D\u00fc\u011fme her elden sonra saat y\u00f6n\u00fcnde bir koltuk ilerler ve PokerTH\u2019de k\u00f6rler d\u00fczenli aral\u0131klarla y\u00fckselir.</p><h2>D\u00f6rt bahis turu</h2><ul><li><strong>Pre-flop</strong> \u2014 el kartlar\u0131n\u0131 ald\u0131ktan sonra oyuncular, b\u00fcy\u00fck k\u00f6r\u00fcn solundan ba\u015flayarak s\u0131rayla hamle yapar.</li><li><strong>Flop</strong> \u2014 \u00fc\u00e7 ortak kart a\u00e7\u0131k olarak da\u011f\u0131t\u0131l\u0131r, ard\u0131ndan bir bahis turu gelir.</li><li><strong>Turn</strong> \u2014 d\u00f6rd\u00fcnc\u00fc ortak kart da\u011f\u0131t\u0131l\u0131r, ard\u0131ndan bir bahis turu daha yap\u0131l\u0131r.</li><li><strong>River</strong> \u2014 be\u015finci ve son ortak kart da\u011f\u0131t\u0131l\u0131r, ard\u0131ndan son bahis turu oynan\u0131r.</li></ul><h2>Hamleler</h2><ul><li><strong>Fold</strong> \u2014 eli ve o ana kadar yat\u0131r\u0131lan \u00e7ipleri b\u0131rakmak.</li><li><strong>Check</strong> \u2014 bahis yapmadan s\u0131ray\u0131 devretmek (yaln\u0131zca o turda kimse bahis yapmad\u0131ysa).</li><li><strong>Call</strong> \u2014 o anki en y\u00fcksek bahsi g\u00f6rmek.</li><li><strong>Raise</strong> \u2014 mevcut bahsi y\u00fckseltmek. No-Limit\u2019te t\u00fcm y\u0131\u011f\u0131n\u0131n\u0131za kadar herhangi bir miktarla.</li><li><strong>All-In</strong> \u2014 b\u00fct\u00fcn \u00e7iplerinizi ortaya koymak. Di\u011ferleri bunun \u00fczerine bahse devam ederse yan potlar olu\u015fur; yaln\u0131zca katk\u0131da bulundu\u011funuz pot k\u0131sm\u0131n\u0131 kazanabilirsiniz.</li></ul><h2>A\u00e7\u0131l\u0131\u015f (showdown)</h2><p>River bahis turundan sonra iki veya daha fazla oyuncu kald\u0131ysa eller a\u00e7\u0131l\u0131r. Yedi kart aras\u0131ndan (iki el kart\u0131 + be\u015f ortak kart) kurulan en iyi be\u015f kartl\u0131k kombinasyon potu kazan\u0131r. E\u015fit eller potu payla\u015f\u0131r.</p><h2>El s\u0131ralamas\u0131, g\u00fc\u00e7l\u00fcden zay\u0131fa</h2><ol><li><strong>Royal flush</strong> \u2014 ayn\u0131 t\u00fcrden A K Q J 10.</li><li><strong>Straight flush</strong> \u2014 ayn\u0131 t\u00fcrden ard\u0131\u015f\u0131k be\u015f kart.</li><li><strong>D\u00f6rtl\u00fc</strong> \u2014 ayn\u0131 de\u011ferde d\u00f6rt kart.</li><li><strong>Full house</strong> \u2014 bir \u00fc\u00e7l\u00fc art\u0131 bir \u00e7ift.</li><li><strong>Flush</strong> \u2014 ayn\u0131 t\u00fcrden be\u015f kart.</li><li><strong>Kent</strong> \u2014 farkl\u0131 t\u00fcrlerden ard\u0131\u015f\u0131k be\u015f kart.</li><li><strong>\u00dc\u00e7l\u00fc</strong> \u2014 ayn\u0131 de\u011ferde \u00fc\u00e7 kart.</li><li><strong>\u0130ki \u00e7ift</strong> \u2014 iki farkl\u0131 \u00e7ift.</li><li><strong>Bir \u00e7ift</strong> \u2014 ayn\u0131 de\u011ferde iki kart.</li><li><strong>Y\u00fcksek kart</strong> \u2014 yukar\u0131dakilerin hi\u00e7biri; en y\u00fcksek kart belirler.</li></ol><h2>PokerTH\u2019de turnuvalar</h2><p>PokerTH oyunlar\u0131 sit-and-go tarz\u0131 turnuvalard\u0131r: herkes ayn\u0131 y\u0131\u011f\u0131nla ba\u015flar, k\u00f6rler zamanla y\u00fckselir ve \u00e7ipleri kalan son oyuncu kazan\u0131r. Bilgisayar rakiplere kar\u015f\u0131 \u00e7evrimd\u0131\u015f\u0131 \u00e7al\u0131\u015fabilir, LAN\u2019da veya kendi sunucunuzda oynayabilir, ya da sezonluk s\u0131ralamalar\u0131 olan resm\u00ee pokerth.net a\u011f\u0131na kat\u0131labilirsiniz.</p>" },
  uk: {
    title: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019em \u2014 \u0432\u0435\u0431\u043a\u043b\u0456\u0454\u043d\u0442 PokerTH",
    desc: "\u041f\u043e\u0432\u043d\u0456 \u043f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019em \u0443 \u0442\u043e\u043c\u0443 \u0432\u0438\u0433\u043b\u044f\u0434\u0456, \u0432 \u044f\u043a\u043e\u043c\u0443 \u0433\u0440\u0430\u044e\u0442\u044c \u0443 PokerTH: \u0431\u043b\u0430\u0439\u043d\u0434\u0438, \u0447\u043e\u0442\u0438\u0440\u0438 \u043a\u043e\u043b\u0430 \u0442\u043e\u0440\u0433\u0456\u0432, Fold/Check/Call/Raise/All-In, \u043f\u043e\u0431\u0456\u0447\u043d\u0456 \u0431\u0430\u043d\u043a\u0438 \u0442\u0430 \u0441\u0442\u0430\u0440\u0448\u0438\u043d\u0441\u0442\u0432\u043e \u043a\u043e\u043c\u0431\u0456\u043d\u0430\u0446\u0456\u0439.",
    ldHeadline: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u043f\u043e\u043a\u0435\u0440\u0443 Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "\u042f\u043a \u0433\u0440\u0430\u0442\u0438 \u0432 \u0431\u0435\u0437\u043b\u0456\u043c\u0456\u0442\u043d\u0438\u0439 Texas Hold\u2019em: \u0431\u043b\u0430\u0439\u043d\u0434\u0438, \u043a\u043e\u043b\u0430 \u0442\u043e\u0440\u0433\u0456\u0432, \u0434\u0456\u0457 \u0442\u0430 \u0441\u0442\u0430\u0440\u0448\u0438\u043d\u0441\u0442\u0432\u043e \u043a\u043e\u043c\u0431\u0456\u043d\u0430\u0446\u0456\u0439, \u044f\u043a \u0443 PokerTH.",
    body: "<h1>\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u043f\u043e\u043a\u0435\u0440\u0443 Texas Hold\u2019em</h1><p>\u0423 PokerTH \u0433\u0440\u0430\u044e\u0442\u044c \u0443 \u0431\u0435\u0437\u043b\u0456\u043c\u0456\u0442\u043d\u0438\u0439 Texas Hold\u2019em \u2014 \u043d\u0430\u0439\u043f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u0456\u0448\u0438\u0439 \u0440\u0456\u0437\u043d\u043e\u0432\u0438\u0434 \u043f\u043e\u043a\u0435\u0440\u0443 \u0443 \u0441\u0432\u0456\u0442\u0456. \u041a\u043e\u0436\u0435\u043d \u0433\u0440\u0430\u0432\u0435\u0446\u044c \u043d\u0430\u043c\u0430\u0433\u0430\u0454\u0442\u044c\u0441\u044f \u0437\u0456\u0431\u0440\u0430\u0442\u0438 \u043d\u0430\u0439\u043a\u0440\u0430\u0449\u0443 \u043a\u043e\u043c\u0431\u0456\u043d\u0430\u0446\u0456\u044e \u0437 \u043f\u2019\u044f\u0442\u0438 \u043a\u0430\u0440\u0442, \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u044e\u0447\u0438 \u0434\u0432\u0456 \u0441\u0432\u043e\u0457 \u0437\u0430\u043a\u0440\u0438\u0442\u0456 \u043a\u0430\u0440\u0442\u0438 \u0442\u0430 \u043f\u2019\u044f\u0442\u044c \u0441\u043f\u0456\u043b\u044c\u043d\u0438\u0445.</p><h2>\u0420\u043e\u0437\u0434\u0430\u0447\u0430 \u0442\u0430 \u0431\u043b\u0430\u0439\u043d\u0434\u0438</h2><p>\u041a\u043e\u0436\u043d\u0430 \u0440\u043e\u0437\u0434\u0430\u0447\u0430 \u043f\u043e\u0447\u0438\u043d\u0430\u0454\u0442\u044c\u0441\u044f \u0437 \u0434\u0432\u043e\u0445 \u043e\u0431\u043e\u0432\u2019\u044f\u0437\u043a\u043e\u0432\u0438\u0445 \u0441\u0442\u0430\u0432\u043e\u043a: \u0433\u0440\u0430\u0432\u0435\u0446\u044c \u043b\u0456\u0432\u043e\u0440\u0443\u0447 \u0432\u0456\u0434 \u043a\u043d\u043e\u043f\u043a\u0438 \u0434\u0438\u043b\u0435\u0440\u0430 \u0441\u0442\u0430\u0432\u0438\u0442\u044c <em>\u043c\u0430\u043b\u0438\u0439 \u0431\u043b\u0430\u0439\u043d\u0434</em>, \u043d\u0430\u0441\u0442\u0443\u043f\u043d\u0438\u0439 \u2014 <em>\u0432\u0435\u043b\u0438\u043a\u0438\u0439 \u0431\u043b\u0430\u0439\u043d\u0434</em>. \u0414\u0430\u043b\u0456 \u043a\u043e\u0436\u0435\u043d \u0433\u0440\u0430\u0432\u0435\u0446\u044c \u043e\u0442\u0440\u0438\u043c\u0443\u0454 \u0434\u0432\u0456 \u0437\u0430\u043a\u0440\u0438\u0442\u0456 \u043a\u0430\u0440\u0442\u0438 (<em>\u043a\u0438\u0448\u0435\u043d\u044c\u043a\u043e\u0432\u0456 \u043a\u0430\u0440\u0442\u0438</em>). \u041f\u0456\u0441\u043b\u044f \u043a\u043e\u0436\u043d\u043e\u0457 \u0440\u043e\u0437\u0434\u0430\u0447\u0456 \u043a\u043d\u043e\u043f\u043a\u0430 \u0437\u0441\u0443\u0432\u0430\u0454\u0442\u044c\u0441\u044f \u043d\u0430 \u043e\u0434\u043d\u0435 \u043c\u0456\u0441\u0446\u0435 \u0437\u0430 \u0433\u043e\u0434\u0438\u043d\u043d\u0438\u043a\u043e\u0432\u043e\u044e \u0441\u0442\u0440\u0456\u043b\u043a\u043e\u044e, \u0430 \u0432 PokerTH \u0431\u043b\u0430\u0439\u043d\u0434\u0438 \u0437\u0440\u043e\u0441\u0442\u0430\u044e\u0442\u044c \u0447\u0435\u0440\u0435\u0437 \u0440\u0456\u0432\u043d\u0456 \u043f\u0440\u043e\u043c\u0456\u0436\u043a\u0438 \u0447\u0430\u0441\u0443.</p><h2>\u0427\u043e\u0442\u0438\u0440\u0438 \u043a\u043e\u043b\u0430 \u0442\u043e\u0440\u0433\u0456\u0432</h2><ul><li><strong>Pre-flop</strong> \u2014 \u043e\u0442\u0440\u0438\u043c\u0430\u0432\u0448\u0438 \u043a\u0438\u0448\u0435\u043d\u044c\u043a\u043e\u0432\u0456 \u043a\u0430\u0440\u0442\u0438, \u0433\u0440\u0430\u0432\u0446\u0456 \u0445\u043e\u0434\u044f\u0442\u044c \u043f\u043e \u0447\u0435\u0440\u0437\u0456, \u043f\u043e\u0447\u0438\u043d\u0430\u044e\u0447\u0438 \u043b\u0456\u0432\u043e\u0440\u0443\u0447 \u0432\u0456\u0434 \u0432\u0435\u043b\u0438\u043a\u043e\u0433\u043e \u0431\u043b\u0430\u0439\u043d\u0434\u0430.</li><li><strong>Flop</strong> \u2014 \u0432\u0438\u043a\u043b\u0430\u0434\u0430\u044e\u0442\u044c\u0441\u044f \u0442\u0440\u0438 \u0441\u043f\u0456\u043b\u044c\u043d\u0456 \u043a\u0430\u0440\u0442\u0438 \u0441\u043e\u0440\u043e\u0447\u043a\u043e\u044e \u0434\u043e\u043d\u0438\u0437\u0443, \u043f\u0456\u0441\u043b\u044f \u0447\u043e\u0433\u043e \u043d\u0430\u0441\u0442\u0430\u0454 \u043a\u043e\u043b\u043e \u0442\u043e\u0440\u0433\u0456\u0432.</li><li><strong>Turn</strong> \u2014 \u0432\u0438\u043a\u043b\u0430\u0434\u0430\u0454\u0442\u044c\u0441\u044f \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0430 \u0441\u043f\u0456\u043b\u044c\u043d\u0430 \u043a\u0430\u0440\u0442\u0430, \u0430 \u0437\u0430 \u043d\u0435\u044e \u2014 \u0449\u0435 \u043e\u0434\u043d\u0435 \u043a\u043e\u043b\u043e \u0442\u043e\u0440\u0433\u0456\u0432.</li><li><strong>River</strong> \u2014 \u0432\u0438\u043a\u043b\u0430\u0434\u0430\u0454\u0442\u044c\u0441\u044f \u043f\u2019\u044f\u0442\u0430 \u0439 \u043e\u0441\u0442\u0430\u043d\u043d\u044f \u0441\u043f\u0456\u043b\u044c\u043d\u0430 \u043a\u0430\u0440\u0442\u0430, \u0437\u0430 \u044f\u043a\u043e\u044e \u0439\u0434\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0430\u043b\u044c\u043d\u0435 \u043a\u043e\u043b\u043e \u0442\u043e\u0440\u0433\u0456\u0432.</li></ul><h2>\u0414\u0456\u0457</h2><ul><li><strong>Fold</strong> \u2014 \u0441\u043a\u0438\u043d\u0443\u0442\u0438 \u043a\u0430\u0440\u0442\u0438 \u0439 \u0432\u0456\u0434\u043c\u043e\u0432\u0438\u0442\u0438\u0441\u044f \u0432\u0456\u0434 \u0443\u0436\u0435 \u043f\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u0438\u0445 \u0444\u0456\u0448\u043e\u043a.</li><li><strong>Check</strong> \u2014 \u043f\u0435\u0440\u0435\u0434\u0430\u0442\u0438 \u0445\u0456\u0434 \u0431\u0435\u0437 \u0441\u0442\u0430\u0432\u043a\u0438 (\u043b\u0438\u0448\u0435 \u044f\u043a\u0449\u043e \u0432 \u043f\u043e\u0442\u043e\u0447\u043d\u043e\u043c\u0443 \u043a\u043e\u043b\u0456 \u0449\u0435 \u043d\u0456\u0445\u0442\u043e \u043d\u0435 \u0441\u0442\u0430\u0432\u0438\u0432).</li><li><strong>Call</strong> \u2014 \u0437\u0440\u0456\u0432\u043d\u044f\u0442\u0438 \u043f\u043e\u0442\u043e\u0447\u043d\u0443 \u043d\u0430\u0439\u0431\u0456\u043b\u044c\u0448\u0443 \u0441\u0442\u0430\u0432\u043a\u0443.</li><li><strong>Raise</strong> \u2014 \u043f\u0456\u0434\u0432\u0438\u0449\u0438\u0442\u0438 \u043f\u043e\u0442\u043e\u0447\u043d\u0443 \u0441\u0442\u0430\u0432\u043a\u0443. \u0423 \u0431\u0435\u0437\u043b\u0456\u043c\u0456\u0442\u043d\u0456\u0439 \u0433\u0440\u0456 \u2014 \u043d\u0430 \u0431\u0443\u0434\u044c-\u044f\u043a\u0443 \u0441\u0443\u043c\u0443 \u0430\u0436 \u0434\u043e \u0432\u0441\u044c\u043e\u0433\u043e \u0441\u0442\u0435\u043a\u0430.</li><li><strong>All-In</strong> \u2014 \u043f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u0438 \u0432\u0441\u0456 \u0441\u0432\u043e\u0457 \u0444\u0456\u0448\u043a\u0438. \u042f\u043a\u0449\u043e \u0456\u043d\u0448\u0456 \u043f\u0440\u043e\u0434\u043e\u0432\u0436\u0443\u044e\u0442\u044c \u0441\u0442\u0430\u0432\u0438\u0442\u0438 \u043f\u043e\u043d\u0430\u0434 \u0446\u044e \u0441\u0443\u043c\u0443, \u0443\u0442\u0432\u043e\u0440\u044e\u044e\u0442\u044c\u0441\u044f \u043f\u043e\u0431\u0456\u0447\u043d\u0456 \u0431\u0430\u043d\u043a\u0438, \u0442\u043e\u0436 \u0432\u0438\u0433\u0440\u0430\u0442\u0438 \u043c\u043e\u0436\u043d\u0430 \u043b\u0438\u0448\u0435 \u0442\u0443 \u0447\u0430\u0441\u0442\u0438\u043d\u0443 \u0431\u0430\u043d\u043a\u0443, \u0434\u043e \u044f\u043a\u043e\u0457 \u0432\u0438 \u0434\u043e\u043a\u043b\u0430\u043b\u0438\u0441\u044f.</li></ul><h2>\u0420\u043e\u0437\u043a\u0440\u0438\u0442\u0442\u044f \u043a\u0430\u0440\u0442</h2><p>\u042f\u043a\u0449\u043e \u043f\u0456\u0441\u043b\u044f \u043a\u043e\u043b\u0430 \u0442\u043e\u0440\u0433\u0456\u0432 \u043d\u0430 \u0440\u0456\u0432\u0435\u0440\u0456 \u043b\u0438\u0448\u0430\u0454\u0442\u044c\u0441\u044f \u0434\u0432\u043e\u0454 \u0430\u0431\u043e \u0431\u0456\u043b\u044c\u0448\u0435 \u0433\u0440\u0430\u0432\u0446\u0456\u0432, \u043a\u0430\u0440\u0442\u0438 \u0440\u043e\u0437\u043a\u0440\u0438\u0432\u0430\u044e\u0442\u044c. \u041d\u0430\u0439\u043a\u0440\u0430\u0449\u0430 \u043a\u043e\u043c\u0431\u0456\u043d\u0430\u0446\u0456\u044f \u0437 \u043f\u2019\u044f\u0442\u0438 \u043a\u0430\u0440\u0442 \u0441\u0435\u0440\u0435\u0434 \u0441\u0435\u043c\u0438 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0438\u0445 (\u0434\u0432\u0456 \u043a\u0438\u0448\u0435\u043d\u044c\u043a\u043e\u0432\u0456 + \u043f\u2019\u044f\u0442\u044c \u0441\u043f\u0456\u043b\u044c\u043d\u0438\u0445) \u0437\u0430\u0431\u0438\u0440\u0430\u0454 \u0431\u0430\u043d\u043a. \u0420\u0456\u0432\u043d\u0456 \u043a\u043e\u043c\u0431\u0456\u043d\u0430\u0446\u0456\u0457 \u0434\u0456\u043b\u044f\u0442\u044c \u0439\u043e\u0433\u043e \u043f\u043e\u0440\u0456\u0432\u043d\u0443.</p><h2>\u0421\u0442\u0430\u0440\u0448\u0438\u043d\u0441\u0442\u0432\u043e \u043a\u043e\u043c\u0431\u0456\u043d\u0430\u0446\u0456\u0439, \u0432\u0456\u0434 \u043d\u0430\u0439\u0441\u0438\u043b\u044c\u043d\u0456\u0448\u043e\u0457 \u0434\u043e \u043d\u0430\u0439\u0441\u043b\u0430\u0431\u0448\u043e\u0457</h2><ol><li><strong>\u0424\u043b\u0435\u0448-\u0440\u043e\u044f\u043b\u044c</strong> \u2014 A K Q J 10 \u043e\u0434\u043d\u0456\u0454\u0457 \u043c\u0430\u0441\u0442\u0456.</li><li><strong>\u0421\u0442\u0440\u0438\u0442-\u0444\u043b\u0435\u0448</strong> \u2014 \u043f\u2019\u044f\u0442\u044c \u043a\u0430\u0440\u0442 \u043f\u043e\u0441\u043f\u0456\u043b\u044c \u043e\u0434\u043d\u0456\u0454\u0457 \u043c\u0430\u0441\u0442\u0456.</li><li><strong>\u041a\u0430\u0440\u0435</strong> \u2014 \u0447\u043e\u0442\u0438\u0440\u0438 \u043a\u0430\u0440\u0442\u0438 \u043e\u0434\u043d\u043e\u0433\u043e \u043d\u043e\u043c\u0456\u043d\u0430\u043b\u0443.</li><li><strong>\u0424\u0443\u043b-\u0445\u0430\u0443\u0441</strong> \u2014 \u0442\u0440\u0456\u0439\u043a\u0430 \u043f\u043b\u044e\u0441 \u043f\u0430\u0440\u0430.</li><li><strong>\u0424\u043b\u0435\u0448</strong> \u2014 \u043f\u2019\u044f\u0442\u044c \u043a\u0430\u0440\u0442 \u043e\u0434\u043d\u0456\u0454\u0457 \u043c\u0430\u0441\u0442\u0456.</li><li><strong>\u0421\u0442\u0440\u0438\u0442</strong> \u2014 \u043f\u2019\u044f\u0442\u044c \u043a\u0430\u0440\u0442 \u043f\u043e\u0441\u043f\u0456\u043b\u044c \u0440\u0456\u0437\u043d\u0438\u0445 \u043c\u0430\u0441\u0442\u0435\u0439.</li><li><strong>\u0422\u0440\u0456\u0439\u043a\u0430</strong> \u2014 \u0442\u0440\u0438 \u043a\u0430\u0440\u0442\u0438 \u043e\u0434\u043d\u043e\u0433\u043e \u043d\u043e\u043c\u0456\u043d\u0430\u043b\u0443.</li><li><strong>\u0414\u0432\u0456 \u043f\u0430\u0440\u0438</strong> \u2014 \u0434\u0432\u0456 \u0440\u0456\u0437\u043d\u0456 \u043f\u0430\u0440\u0438.</li><li><strong>\u041f\u0430\u0440\u0430</strong> \u2014 \u0434\u0432\u0456 \u043a\u0430\u0440\u0442\u0438 \u043e\u0434\u043d\u043e\u0433\u043e \u043d\u043e\u043c\u0456\u043d\u0430\u043b\u0443.</li><li><strong>\u0421\u0442\u0430\u0440\u0448\u0430 \u043a\u0430\u0440\u0442\u0430</strong> \u2014 \u043d\u0456\u0447\u043e\u0433\u043e \u0437 \u043f\u0435\u0440\u0435\u043b\u0456\u0447\u0435\u043d\u043e\u0433\u043e; \u0432\u0438\u0440\u0456\u0448\u0443\u0454 \u043d\u0430\u0439\u0432\u0438\u0449\u0430 \u043a\u0430\u0440\u0442\u0430.</li></ol><h2>\u0422\u0443\u0440\u043d\u0456\u0440\u0438 \u0432 PokerTH</h2><p>\u0406\u0433\u0440\u0438 \u0432 PokerTH \u2014 \u0446\u0435 \u0442\u0443\u0440\u043d\u0456\u0440\u0438 \u0444\u043e\u0440\u043c\u0430\u0442\u0443 sit-and-go: \u0443\u0441\u0456 \u043f\u043e\u0447\u0438\u043d\u0430\u044e\u0442\u044c \u0437 \u043e\u0434\u043d\u0430\u043a\u043e\u0432\u0438\u043c \u0441\u0442\u0435\u043a\u043e\u043c, \u0431\u043b\u0430\u0439\u043d\u0434\u0438 \u0437 \u0447\u0430\u0441\u043e\u043c \u0437\u0440\u043e\u0441\u0442\u0430\u044e\u0442\u044c, \u0430 \u043f\u0435\u0440\u0435\u043c\u0430\u0433\u0430\u0454 \u043e\u0441\u0442\u0430\u043d\u043d\u0456\u0439 \u0433\u0440\u0430\u0432\u0435\u0446\u044c, \u0443 \u044f\u043a\u043e\u0433\u043e \u043b\u0438\u0448\u0438\u043b\u0438\u0441\u044f \u0444\u0456\u0448\u043a\u0438. \u041c\u043e\u0436\u043d\u0430 \u0442\u0440\u0435\u043d\u0443\u0432\u0430\u0442\u0438\u0441\u044f \u043e\u0444\u043b\u0430\u0439\u043d \u043f\u0440\u043e\u0442\u0438 \u043a\u043e\u043c\u043f\u2019\u044e\u0442\u0435\u0440\u043d\u0438\u0445 \u0441\u0443\u043f\u0435\u0440\u043d\u0438\u043a\u0456\u0432, \u0433\u0440\u0430\u0442\u0438 \u0432 \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u0456\u0439 \u043c\u0435\u0440\u0435\u0436\u0456 \u0447\u0438 \u043d\u0430 \u0432\u043b\u0430\u0441\u043d\u043e\u043c\u0443 \u0441\u0435\u0440\u0432\u0435\u0440\u0456 \u0430\u0431\u043e \u043f\u0440\u0438\u0454\u0434\u043d\u0430\u0442\u0438\u0441\u044f \u0434\u043e \u043e\u0444\u0456\u0446\u0456\u0439\u043d\u043e\u0457 \u043c\u0435\u0440\u0435\u0436\u0456 pokerth.net \u0456\u0437 \u0441\u0435\u0437\u043e\u043d\u043d\u0438\u043c\u0438 \u0440\u0435\u0439\u0442\u0438\u043d\u0433\u0430\u043c\u0438.</p>" },
  cs: {
    title: "Pravidla Texas Hold\u2019em \u2014 webov\u00fd klient PokerTH",
    desc: "Kompletn\u00ed pravidla Texas Hold\u2019em tak, jak se hraje v PokerTH: blindy, \u010dty\u0159i s\u00e1zkov\u00e1 kola, Fold/Check/Call/Raise/All-In, vedlej\u0161\u00ed banky a s\u00edla kombinac\u00ed.",
    ldHeadline: "Pravidla pokeru Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Jak hr\u00e1t No-Limit Texas Hold\u2019em: blindy, s\u00e1zkov\u00e1 kola, akce a s\u00edla kombinac\u00ed, jako v PokerTH.",
    body: "<h1>Pravidla pokeru Texas Hold\u2019em</h1><p>V PokerTH se hraje No-Limit Texas Hold\u2019em, nejroz\u0161\u00ed\u0159en\u011bj\u0161\u00ed pokerov\u00e1 varianta na sv\u011bt\u011b. Ka\u017ed\u00fd hr\u00e1\u010d se sna\u017e\u00ed slo\u017eit nejlep\u0161\u00ed p\u011btikartovou kombinaci ze dvou vlastn\u00edch a p\u011bti spole\u010dn\u00fdch karet.</p><h2>Rozd\u00e1n\u00ed a blindy</h2><p>Ka\u017ed\u00e9 rozd\u00e1n\u00ed za\u010d\u00edn\u00e1 dv\u011bma povinn\u00fdmi s\u00e1zkami: hr\u00e1\u010d nalevo od tla\u010d\u00edtka dealera vkl\u00e1d\u00e1 <em>mal\u00fd blind</em>, dal\u0161\u00ed <em>velk\u00fd blind</em>. Pot\u00e9 ka\u017ed\u00fd hr\u00e1\u010d dostane dv\u011b zakryt\u00e9 karty (<em>vlastn\u00ed karty</em>). Tla\u010d\u00edtko se po ka\u017ed\u00e9m rozd\u00e1n\u00ed posune o jedno m\u00edsto po sm\u011bru hodinov\u00fdch ru\u010di\u010dek a v PokerTH se blindy zvy\u0161uj\u00ed v pravideln\u00fdch intervalech.</p><h2>\u010cty\u0159i s\u00e1zkov\u00e1 kola</h2><ul><li><strong>Pre-flop</strong> \u2014 po obdr\u017een\u00ed vlastn\u00edch karet hr\u00e1\u010di hraj\u00ed postupn\u011b, po\u010d\u00ednaje nalevo od velk\u00e9ho blindu.</li><li><strong>Flop</strong> \u2014 na st\u016fl p\u0159ijdou t\u0159i odkryt\u00e9 spole\u010dn\u00e9 karty, n\u00e1sleduje s\u00e1zkov\u00e9 kolo.</li><li><strong>Turn</strong> \u2014 p\u0159id\u00e1 se \u010dtvrt\u00e1 spole\u010dn\u00e1 karta a dal\u0161\u00ed s\u00e1zkov\u00e9 kolo.</li><li><strong>River</strong> \u2014 p\u0159id\u00e1 se p\u00e1t\u00e1 a posledn\u00ed spole\u010dn\u00e1 karta a posledn\u00ed s\u00e1zkov\u00e9 kolo.</li></ul><h2>Akce</h2><ul><li><strong>Fold</strong> \u2014 slo\u017eit karty a vzd\u00e1t se u\u017e vsazen\u00fdch \u017eeton\u016f.</li><li><strong>Check</strong> \u2014 poslat d\u00e1l bez s\u00e1zky (jen pokud v aktu\u00e1ln\u00edm kole je\u0161t\u011b nikdo nes\u00e1zel).</li><li><strong>Call</strong> \u2014 dorovnat nejvy\u0161\u0161\u00ed sou\u010dasnou s\u00e1zku.</li><li><strong>Raise</strong> \u2014 nav\u00fd\u0161it sou\u010dasnou s\u00e1zku. V No-Limitu o libovolnou \u010d\u00e1stku a\u017e po cel\u00fd sv\u016fj stack.</li><li><strong>All-In</strong> \u2014 vsadit v\u0161echny sv\u00e9 \u017eetony. Pokud ostatn\u00ed s\u00e1zej\u00ed d\u00e1l nad tuto \u010d\u00e1stku, vznikaj\u00ed vedlej\u0161\u00ed banky, tak\u017ee m\u016f\u017eete vyhr\u00e1t jen tu \u010d\u00e1st banku, do kter\u00e9 jste p\u0159isp\u011bli.</li></ul><h2>Odkryt\u00ed karet</h2><p>Z\u016fstanou-li po s\u00e1zkov\u00e9m kole na riveru dva a v\u00edce hr\u00e1\u010d\u016f, karty se odkryj\u00ed. Nejlep\u0161\u00ed p\u011btikartov\u00e1 kombinace ze sedmi dostupn\u00fdch karet (dv\u011b vlastn\u00ed + p\u011bt spole\u010dn\u00fdch) bere bank. Stejn\u011b siln\u00e9 kombinace se o bank d\u011bl\u00ed.</p><h2>S\u00edla kombinac\u00ed, od nejsiln\u011bj\u0161\u00ed k nejslab\u0161\u00ed</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10 v jedn\u00e9 barv\u011b.</li><li><strong>Straight flush</strong> \u2014 p\u011bt po sob\u011b jdouc\u00edch karet jedn\u00e9 barvy.</li><li><strong>\u010cty\u0159ice</strong> \u2014 \u010dty\u0159i karty stejn\u00e9 hodnoty.</li><li><strong>Full house</strong> \u2014 trojice plus p\u00e1r.</li><li><strong>Barva</strong> \u2014 p\u011bt karet stejn\u00e9 barvy.</li><li><strong>Postupka</strong> \u2014 p\u011bt po sob\u011b jdouc\u00edch karet r\u016fzn\u00fdch barev.</li><li><strong>Trojice</strong> \u2014 t\u0159i karty stejn\u00e9 hodnoty.</li><li><strong>Dva p\u00e1ry</strong> \u2014 dva r\u016fzn\u00e9 p\u00e1ry.</li><li><strong>P\u00e1r</strong> \u2014 dv\u011b karty stejn\u00e9 hodnoty.</li><li><strong>Vysok\u00e1 karta</strong> \u2014 nic z v\u00fd\u0161e uveden\u00e9ho; rozhoduje nejvy\u0161\u0161\u00ed karta.</li></ol><h2>Turnaje v PokerTH</h2><p>Hry v PokerTH jsou turnaje typu sit-and-go: v\u0161ichni za\u010d\u00ednaj\u00ed se stejn\u00fdm stackem, blindy se v \u010dase zvy\u0161uj\u00ed a vyhr\u00e1v\u00e1 posledn\u00ed hr\u00e1\u010d se \u017eetony. M\u016f\u017eete tr\u00e9novat offline proti po\u010d\u00edta\u010dov\u00fdm protivn\u00edk\u016fm, hr\u00e1t po LAN nebo na vlastn\u00edm serveru, p\u0159\u00edpadn\u011b se p\u0159ipojit k ofici\u00e1ln\u00ed s\u00edti pokerth.net se sez\u00f3nn\u00edmi \u017eeb\u0159\u00ed\u010dky.</p>" },
  sv: {
    title: "Texas Hold\u2019em-regler \u2014 PokerTH webbklient",
    desc: "Kompletta Texas Hold\u2019em-regler som de spelas i PokerTH: m\u00f6rkar, de fyra satsningsrundorna, Fold/Check/Call/Raise/All-In, sidopotter och handv\u00e4rden.",
    ldHeadline: "Texas Hold\u2019em pokerregler \u2014 PokerTH",
    ldDesc: "S\u00e5 spelar du No-Limit Texas Hold\u2019em: m\u00f6rkar, satsningsrundor, handlingar och handv\u00e4rden, som i PokerTH.",
    body: "<h1>Texas Hold\u2019em pokerregler</h1><p>I PokerTH spelas No-Limit Texas Hold\u2019em, v\u00e4rldens popul\u00e4raste pokervariant. Varje spelare f\u00f6rs\u00f6ker bilda den b\u00e4sta handen p\u00e5 fem kort av tv\u00e5 egna kort och fem gemensamma kort.</p><h2>Given och m\u00f6rkarna</h2><p>Varje giv b\u00f6rjar med tv\u00e5 tvingande insatser: spelaren till v\u00e4nster om dealerknappen l\u00e4gger <em>lilla m\u00f6rken</em>, n\u00e4sta spelare <em>stora m\u00f6rken</em>. Sedan f\u00e5r varje spelare tv\u00e5 ned\u00e5tv\u00e4nda kort (<em>h\u00e5lkorten</em>). Knappen flyttas ett steg medurs efter varje giv, och i PokerTH h\u00f6js m\u00f6rkarna med j\u00e4mna mellanrum.</p><h2>De fyra satsningsrundorna</h2><ul><li><strong>Pre-flop</strong> \u2014 efter att ha f\u00e5tt h\u00e5lkorten agerar spelarna i tur och ordning, med start till v\u00e4nster om stora m\u00f6rken.</li><li><strong>Flop</strong> \u2014 tre gemensamma kort l\u00e4ggs upp med bildsidan upp\u00e5t, f\u00f6ljt av en satsningsrunda.</li><li><strong>Turn</strong> \u2014 ett fj\u00e4rde gemensamt kort delas ut, f\u00f6ljt av \u00e4nnu en satsningsrunda.</li><li><strong>River</strong> \u2014 det femte och sista gemensamma kortet delas ut, f\u00f6ljt av den sista satsningsrundan.</li></ul><h2>Handlingarna</h2><ul><li><strong>Fold</strong> \u2014 kasta handen och de marker som redan satsats.</li><li><strong>Check</strong> \u2014 skicka vidare utan att satsa (bara om ingen har satsat i den p\u00e5g\u00e5ende rundan).</li><li><strong>Call</strong> \u2014 syna den h\u00f6gsta insatsen just nu.</li><li><strong>Raise</strong> \u2014 h\u00f6ja den aktuella insatsen. I No-Limit med vilket belopp som helst, upp till hela din stack.</li><li><strong>All-In</strong> \u2014 satsa alla dina marker. Om andra forts\u00e4tter satsa ut\u00f6ver det bildas sidopotter, s\u00e5 att du bara kan vinna den del av potten du bidragit till.</li></ul><h2>Showdown</h2><p>\u00c4r tv\u00e5 eller fler spelare kvar efter satsningsrundan p\u00e5 river visas h\u00e4nderna. Den b\u00e4sta femkortskombinationen av de sju tillg\u00e4ngliga korten (tv\u00e5 h\u00e5lkort + fem gemensamma) vinner potten. Lika h\u00e4nder delar p\u00e5 potten.</p><h2>Handv\u00e4rden, fr\u00e5n starkast till svagast</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10 i samma f\u00e4rg.</li><li><strong>Straight flush</strong> \u2014 fem kort i f\u00f6ljd i samma f\u00e4rg.</li><li><strong>Fyrtal</strong> \u2014 fyra kort av samma val\u00f6r.</li><li><strong>K\u00e5k</strong> \u2014 ett triss plus ett par.</li><li><strong>F\u00e4rg</strong> \u2014 fem kort i samma f\u00e4rg.</li><li><strong>Stege</strong> \u2014 fem kort i f\u00f6ljd i olika f\u00e4rger.</li><li><strong>Triss</strong> \u2014 tre kort av samma val\u00f6r.</li><li><strong>Tv\u00e5 par</strong> \u2014 tv\u00e5 olika par.</li><li><strong>Ett par</strong> \u2014 tv\u00e5 kort av samma val\u00f6r.</li><li><strong>H\u00f6gsta kort</strong> \u2014 inget av ovanst\u00e5ende; h\u00f6gsta kortet avg\u00f6r.</li></ol><h2>Turneringar i PokerTH</h2><p>Partier i PokerTH \u00e4r turneringar av sit-and-go-typ: alla b\u00f6rjar med samma stack, m\u00f6rkarna h\u00f6js \u00f6ver tid och den sista spelaren med marker vinner. Du kan tr\u00e4na offline mot datorstyrda motst\u00e5ndare, spela \u00f6ver LAN eller p\u00e5 en egen server, eller g\u00e5 med i det officiella pokerth.net-n\u00e4tverket med s\u00e4songsrankning.</p>" },
  ro: {
    title: "Regulile Texas Hold\u2019em \u2014 client web PokerTH",
    desc: "Regulile complete de Texas Hold\u2019em a\u0219a cum se joac\u0103 \u00een PokerTH: blinduri, cele patru runde de pariere, Fold/Check/Call/Raise/All-In, poturi secundare \u0219i ierarhia m\u00e2inilor.",
    ldHeadline: "Regulile pokerului Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Cum se joac\u0103 No-Limit Texas Hold\u2019em: blinduri, runde de pariere, ac\u021biuni \u0219i ierarhia m\u00e2inilor, ca \u00een PokerTH.",
    body: "<h1>Regulile pokerului Texas Hold\u2019em</h1><p>\u00cen PokerTH se joac\u0103 No-Limit Texas Hold\u2019em, cea mai popular\u0103 variant\u0103 de poker din lume. Fiecare juc\u0103tor \u00eencearc\u0103 s\u0103 formeze cea mai bun\u0103 m\u00e2n\u0103 de cinci c\u0103r\u021bi din dou\u0103 c\u0103r\u021bi proprii \u0219i cinci c\u0103r\u021bi comune.</p><h2>\u00cemp\u0103r\u021birea \u0219i blindurile</h2><p>Fiecare m\u00e2n\u0103 \u00eencepe cu dou\u0103 pariuri obligatorii: juc\u0103torul din st\u00e2nga butonului de dealer pune <em>blindul mic</em>, iar urm\u0103torul <em>blindul mare</em>. Apoi fiecare juc\u0103tor prime\u0219te dou\u0103 c\u0103r\u021bi cu fa\u021ba \u00een jos (<em>c\u0103r\u021bile proprii</em>). Butonul avanseaz\u0103 cu un loc \u00een sensul acelor de ceasornic dup\u0103 fiecare m\u00e2n\u0103, iar \u00een PokerTH blindurile cresc la intervale regulate.</p><h2>Cele patru runde de pariere</h2><ul><li><strong>Pre-flop</strong> \u2014 dup\u0103 primirea c\u0103r\u021bilor proprii, juc\u0103torii ac\u021bioneaz\u0103 pe r\u00e2nd, \u00eencep\u00e2nd din st\u00e2nga blindului mare.</li><li><strong>Flop</strong> \u2014 trei c\u0103r\u021bi comune sunt \u00eentoarse cu fa\u021ba \u00een sus, urmate de o rund\u0103 de pariere.</li><li><strong>Turn</strong> \u2014 se \u00eemparte a patra carte comun\u0103, urmat\u0103 de \u00eenc\u0103 o rund\u0103 de pariere.</li><li><strong>River</strong> \u2014 se \u00eemparte a cincea \u0219i ultima carte comun\u0103, urmat\u0103 de runda final\u0103 de pariere.</li></ul><h2>Ac\u021biunile</h2><ul><li><strong>Fold</strong> \u2014 a renun\u021ba la m\u00e2n\u0103 \u0219i la jetoanele deja pariate.</li><li><strong>Check</strong> \u2014 a pasa f\u0103r\u0103 s\u0103 pariezi (doar dac\u0103 nimeni nu a pariat \u00een runda curent\u0103).</li><li><strong>Call</strong> \u2014 a egala cel mai mare pariu de pe mas\u0103.</li><li><strong>Raise</strong> \u2014 a m\u0103ri pariul curent. \u00cen No-Limit, cu orice sum\u0103 p\u00e2n\u0103 la \u00eentregul t\u0103u stack.</li><li><strong>All-In</strong> \u2014 a paria toate jetoanele. Dac\u0103 ceilal\u021bi continu\u0103 s\u0103 parieze peste aceast\u0103 sum\u0103, se creeaz\u0103 poturi secundare, astfel \u00eenc\u00e2t po\u021bi c\u00e2\u0219tiga doar partea de pot la care ai contribuit.</li></ul><h2>Showdown-ul</h2><p>Dac\u0103 dup\u0103 runda de pariere de pe river r\u0103m\u00e2n doi sau mai mul\u021bi juc\u0103tori, m\u00e2inile sunt dezv\u0103luite. Cea mai bun\u0103 combina\u021bie de cinci c\u0103r\u021bi dintre cele \u0219apte disponibile (dou\u0103 proprii + cinci comune) c\u00e2\u0219tig\u0103 potul. M\u00e2inile egale \u00eempart potul.</p><h2>Ierarhia m\u00e2inilor, de la cea mai puternic\u0103 la cea mai slab\u0103</h2><ol><li><strong>Chint\u0103 roial\u0103</strong> \u2014 A K Q J 10, toate de aceea\u0219i culoare.</li><li><strong>Chint\u0103 de culoare</strong> \u2014 cinci c\u0103r\u021bi consecutive de aceea\u0219i culoare.</li><li><strong>Careu</strong> \u2014 patru c\u0103r\u021bi de aceea\u0219i valoare.</li><li><strong>Full house</strong> \u2014 un trei de un fel plus o pereche.</li><li><strong>Culoare</strong> \u2014 cinci c\u0103r\u021bi de aceea\u0219i culoare.</li><li><strong>Chint\u0103</strong> \u2014 cinci c\u0103r\u021bi consecutive de culori diferite.</li><li><strong>Trei de un fel</strong> \u2014 trei c\u0103r\u021bi de aceea\u0219i valoare.</li><li><strong>Dou\u0103 perechi</strong> \u2014 dou\u0103 perechi diferite.</li><li><strong>O pereche</strong> \u2014 dou\u0103 c\u0103r\u021bi de aceea\u0219i valoare.</li><li><strong>Carte mare</strong> \u2014 niciuna dintre cele de mai sus; decide cea mai mare carte.</li></ol><h2>Turneele \u00een PokerTH</h2><p>Partidele din PokerTH sunt turnee de tip sit-and-go: to\u021bi pornesc cu acela\u0219i stack, blindurile cresc \u00een timp, iar ultimul juc\u0103tor cu jetoane c\u00e2\u0219tig\u0103. Po\u021bi exersa offline \u00eempotriva adversarilor controla\u021bi de calculator, juca \u00een LAN sau pe un server privat, ori te po\u021bi al\u0103tura re\u021belei oficiale pokerth.net cu clasamentele ei sezoniere.</p>" },
  hu: {
    title: "Texas Hold\u2019em szab\u00e1lyok \u2014 PokerTH webkliens",
    desc: "A Texas Hold\u2019em teljes szab\u00e1lyai \u00fagy, ahogy a PokerTH-ban j\u00e1tssz\u00e1k: vakok, a n\u00e9gy licitk\u00f6r, Fold/Check/Call/Raise/All-In, oldalpotok \u00e9s a lapok sorrendje.",
    ldHeadline: "Texas Hold\u2019em p\u00f3ker szab\u00e1lyok \u2014 PokerTH",
    ldDesc: "Hogyan kell No-Limit Texas Hold\u2019emet j\u00e1tszani: vakok, licitk\u00f6r\u00f6k, akci\u00f3k \u00e9s a lapok sorrendje, ahogy a PokerTH-ban.",
    body: "<h1>Texas Hold\u2019em p\u00f3ker szab\u00e1lyok</h1><p>A PokerTH-ban No-Limit Texas Hold\u2019emet j\u00e1tszanak, a vil\u00e1g legn\u00e9pszer\u0171bb p\u00f3kerv\u00e1ltozat\u00e1t. Minden j\u00e1t\u00e9kos a lehet\u0151 legjobb \u00f6tlapos kombin\u00e1ci\u00f3t igyekszik \u00f6sszerakni k\u00e9t saj\u00e1t \u00e9s \u00f6t k\u00f6z\u00f6s lapb\u00f3l.</p><h2>Az oszt\u00e1s \u00e9s a vakok</h2><p>Minden leoszt\u00e1s k\u00e9t k\u00f6telez\u0151 t\u00e9ttel kezd\u0151dik: az oszt\u00f3gombt\u00f3l balra \u00fcl\u0151 j\u00e1t\u00e9kos teszi be a <em>kis vakot</em>, a k\u00f6vetkez\u0151 a <em>nagy vakot</em>. Ezut\u00e1n minden j\u00e1t\u00e9kos k\u00e9t leford\u00edtott lapot kap (a <em>saj\u00e1t lapokat</em>). Az oszt\u00f3gomb minden leoszt\u00e1s ut\u00e1n egy hellyel az \u00f3ramutat\u00f3 j\u00e1r\u00e1s\u00e1val megegyez\u0151en l\u00e9p tov\u00e1bb, a PokerTH-ban pedig a vakok rendszeres id\u0151k\u00f6z\u00f6nk\u00e9nt emelkednek.</p><h2>A n\u00e9gy licitk\u00f6r</h2><ul><li><strong>Pre-flop</strong> \u2014 a saj\u00e1t lapok kioszt\u00e1sa ut\u00e1n a j\u00e1t\u00e9kosok sorban l\u00e9pnek, a nagy vakt\u00f3l balra kezdve.</li><li><strong>Flop</strong> \u2014 h\u00e1rom k\u00f6z\u00f6s lap ker\u00fcl k\u00e9ppel felfel\u00e9 az asztalra, majd k\u00f6vetkezik egy licitk\u00f6r.</li><li><strong>Turn</strong> \u2014 j\u00f6n a negyedik k\u00f6z\u00f6s lap, majd \u00fajabb licitk\u00f6r.</li><li><strong>River</strong> \u2014 j\u00f6n az \u00f6t\u00f6dik, egyben utols\u00f3 k\u00f6z\u00f6s lap, majd a z\u00e1r\u00f3 licitk\u00f6r.</li></ul><h2>Az akci\u00f3k</h2><ul><li><strong>Fold</strong> \u2014 eldobni a lapot \u00e9s lemondani a m\u00e1r megtett zsetonokr\u00f3l.</li><li><strong>Check</strong> \u2014 t\u00e9t n\u00e9lk\u00fcl tov\u00e1bbadni (csak ha az adott k\u00f6rben m\u00e9g senki nem tett).</li><li><strong>Call</strong> \u2014 megadni a pillanatnyi legmagasabb t\u00e9tet.</li><li><strong>Raise</strong> \u2014 megemelni az aktu\u00e1lis t\u00e9tet. No-Limitben b\u00e1rmekkora \u00f6sszeggel, ak\u00e1r a teljes zsetonmennyis\u00e9ggel.</li><li><strong>All-In</strong> \u2014 az \u00f6sszes zsetont megtenni. Ha a t\u00f6bbiek ezen fel\u00fcl tov\u00e1bb licit\u00e1lnak, oldalpotok keletkeznek, \u00edgy csak a pot azon r\u00e9sz\u00e9t nyerheted meg, amelyhez hozz\u00e1j\u00e1rult\u00e1l.</li></ul><h2>A lapfelfed\u00e9s</h2><p>Ha a riveren lezajlott licitk\u00f6r ut\u00e1n ketten vagy t\u00f6bben maradnak, a lapok felfordulnak. A h\u00e9t el\u00e9rhet\u0151 lapb\u00f3l (k\u00e9t saj\u00e1t + \u00f6t k\u00f6z\u00f6s) \u00f6sszerakott legjobb \u00f6tlapos kombin\u00e1ci\u00f3 viszi a potot. Az egyforma kombin\u00e1ci\u00f3k megosztoznak rajta.</p><h2>A lapok sorrendje, a leger\u0151sebbt\u0151l a leggyeng\u00e9bbig</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10, mind azonos sz\u00ednben.</li><li><strong>Sz\u00ednsor</strong> \u2014 \u00f6t egym\u00e1st k\u00f6vet\u0151 lap azonos sz\u00ednben.</li><li><strong>P\u00f3ker</strong> \u2014 n\u00e9gy azonos \u00e9rt\u00e9k\u0171 lap.</li><li><strong>Full house</strong> \u2014 egy drill \u00e9s egy p\u00e1r.</li><li><strong>Sz\u00edn</strong> \u2014 \u00f6t azonos sz\u00edn\u0171 lap.</li><li><strong>Sor</strong> \u2014 \u00f6t egym\u00e1st k\u00f6vet\u0151 lap vegyes sz\u00ednben.</li><li><strong>Drill</strong> \u2014 h\u00e1rom azonos \u00e9rt\u00e9k\u0171 lap.</li><li><strong>K\u00e9t p\u00e1r</strong> \u2014 k\u00e9t k\u00fcl\u00f6nb\u00f6z\u0151 p\u00e1r.</li><li><strong>Egy p\u00e1r</strong> \u2014 k\u00e9t azonos \u00e9rt\u00e9k\u0171 lap.</li><li><strong>Magas lap</strong> \u2014 a fentiek egyike sem; a legmagasabb lap d\u00f6nt.</li></ol><h2>Versenyek a PokerTH-ban</h2><p>A PokerTH j\u00e1tszm\u00e1i sit-and-go jelleg\u0171 versenyek: mindenki ugyanannyi zsetonnal indul, a vakok id\u0151vel emelkednek, \u00e9s az nyer, akin\u00e9l utolj\u00e1ra marad zseton. Gyakorolhatsz offline a g\u00e9p ellen, j\u00e1tszhatsz LAN-on vagy saj\u00e1t szerveren, vagy csatlakozhatsz a hivatalos pokerth.net h\u00e1l\u00f3zathoz a szezon\u00e1lis ranglist\u00e1kkal.</p>" },
  el: {
    title: "\u039a\u03b1\u03bd\u03cc\u03bd\u03b5\u03c2 Texas Hold\u2019em \u2014 PokerTH web client",
    desc: "\u03a0\u03bb\u03ae\u03c1\u03b5\u03b9\u03c2 \u03ba\u03b1\u03bd\u03cc\u03bd\u03b5\u03c2 Texas Hold\u2019em \u03cc\u03c0\u03c9\u03c2 \u03c0\u03b1\u03af\u03b6\u03b5\u03c4\u03b1\u03b9 \u03c3\u03c4\u03bf PokerTH: \u03c4\u03c5\u03c6\u03bb\u03ac \u03c0\u03bf\u03bd\u03c4\u03ac\u03c1\u03b9\u03c3\u03bc\u03b1, \u03bf\u03b9 \u03c4\u03ad\u03c3\u03c3\u03b5\u03c1\u03b9\u03c2 \u03b3\u03cd\u03c1\u03bf\u03b9 \u03c3\u03c4\u03bf\u03b9\u03c7\u03b7\u03bc\u03b1\u03c4\u03b9\u03c3\u03bc\u03bf\u03cd, Fold/Check/Call/Raise/All-In, \u03c0\u03bb\u03b5\u03c5\u03c1\u03b9\u03ba\u03ac \u03c0\u03cc\u03c4\u03b9\u03b1 \u03ba\u03b1\u03b9 \u03ba\u03b1\u03c4\u03ac\u03c4\u03b1\u03be\u03b7 \u03c7\u03b5\u03c1\u03b9\u03ce\u03bd.",
    ldHeadline: "\u039a\u03b1\u03bd\u03cc\u03bd\u03b5\u03c2 \u03c0\u03cc\u03ba\u03b5\u03c1 Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "\u03a0\u03ce\u03c2 \u03c0\u03b1\u03af\u03b6\u03b5\u03c4\u03b1\u03b9 \u03c4\u03bf No-Limit Texas Hold\u2019em: \u03c4\u03c5\u03c6\u03bb\u03ac, \u03b3\u03cd\u03c1\u03bf\u03b9 \u03c3\u03c4\u03bf\u03b9\u03c7\u03b7\u03bc\u03b1\u03c4\u03b9\u03c3\u03bc\u03bf\u03cd, \u03b5\u03bd\u03ad\u03c1\u03b3\u03b5\u03b9\u03b5\u03c2 \u03ba\u03b1\u03b9 \u03ba\u03b1\u03c4\u03ac\u03c4\u03b1\u03be\u03b7 \u03c7\u03b5\u03c1\u03b9\u03ce\u03bd, \u03cc\u03c0\u03c9\u03c2 \u03c3\u03c4\u03bf PokerTH.",
    body: "<h1>\u039a\u03b1\u03bd\u03cc\u03bd\u03b5\u03c2 \u03c0\u03cc\u03ba\u03b5\u03c1 Texas Hold\u2019em</h1><p>\u03a3\u03c4\u03bf PokerTH \u03c0\u03b1\u03af\u03b6\u03b5\u03c4\u03b1\u03b9 No-Limit Texas Hold\u2019em, \u03b7 \u03b4\u03b7\u03bc\u03bf\u03c6\u03b9\u03bb\u03ad\u03c3\u03c4\u03b5\u03c1\u03b7 \u03c0\u03b1\u03c1\u03b1\u03bb\u03bb\u03b1\u03b3\u03ae \u03c0\u03cc\u03ba\u03b5\u03c1 \u03c3\u03c4\u03bf\u03bd \u03ba\u03cc\u03c3\u03bc\u03bf. \u039a\u03ac\u03b8\u03b5 \u03c0\u03b1\u03af\u03ba\u03c4\u03b7\u03c2 \u03c0\u03c1\u03bf\u03c3\u03c0\u03b1\u03b8\u03b5\u03af \u03bd\u03b1 \u03c3\u03c7\u03b7\u03bc\u03b1\u03c4\u03af\u03c3\u03b5\u03b9 \u03c4\u03bf \u03ba\u03b1\u03bb\u03cd\u03c4\u03b5\u03c1\u03bf \u03c7\u03ad\u03c1\u03b9 \u03c0\u03ad\u03bd\u03c4\u03b5 \u03c6\u03cd\u03bb\u03bb\u03c9\u03bd \u03b1\u03c0\u03cc \u03b4\u03cd\u03bf \u03b4\u03b9\u03ba\u03ac \u03c4\u03bf\u03c5 \u03c6\u03cd\u03bb\u03bb\u03b1 \u03ba\u03b1\u03b9 \u03c0\u03ad\u03bd\u03c4\u03b5 \u03ba\u03bf\u03b9\u03bd\u03ac.</p><h2>\u0397 \u03bc\u03bf\u03b9\u03c1\u03b1\u03c3\u03b9\u03ac \u03ba\u03b1\u03b9 \u03c4\u03b1 \u03c4\u03c5\u03c6\u03bb\u03ac</h2><p>\u039a\u03ac\u03b8\u03b5 \u03c7\u03ad\u03c1\u03b9 \u03be\u03b5\u03ba\u03b9\u03bd\u03ac \u03bc\u03b5 \u03b4\u03cd\u03bf \u03c5\u03c0\u03bf\u03c7\u03c1\u03b5\u03c9\u03c4\u03b9\u03ba\u03ac \u03c0\u03bf\u03bd\u03c4\u03ac\u03c1\u03b9\u03c3\u03bc\u03b1\u03c4\u03b1: \u03bf \u03c0\u03b1\u03af\u03ba\u03c4\u03b7\u03c2 \u03b1\u03c1\u03b9\u03c3\u03c4\u03b5\u03c1\u03ac \u03b1\u03c0\u03cc \u03c4\u03bf \u03ba\u03bf\u03c5\u03bc\u03c0\u03af \u03c4\u03bf\u03c5 \u03bd\u03c4\u03af\u03bb\u03b5\u03c1 \u03b2\u03ac\u03b6\u03b5\u03b9 \u03c4\u03bf <em>\u03bc\u03b9\u03ba\u03c1\u03cc \u03c4\u03c5\u03c6\u03bb\u03cc</em> \u03ba\u03b1\u03b9 \u03bf \u03b5\u03c0\u03cc\u03bc\u03b5\u03bd\u03bf\u03c2 \u03c4\u03bf <em>\u03bc\u03b5\u03b3\u03ac\u03bb\u03bf \u03c4\u03c5\u03c6\u03bb\u03cc</em>. \u03a3\u03c4\u03b7 \u03c3\u03c5\u03bd\u03ad\u03c7\u03b5\u03b9\u03b1 \u03ba\u03ac\u03b8\u03b5 \u03c0\u03b1\u03af\u03ba\u03c4\u03b7\u03c2 \u03c0\u03b1\u03af\u03c1\u03bd\u03b5\u03b9 \u03b4\u03cd\u03bf \u03ba\u03bb\u03b5\u03b9\u03c3\u03c4\u03ac \u03c6\u03cd\u03bb\u03bb\u03b1 (\u03c4\u03b1 <em>\u03c0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ac \u03c6\u03cd\u03bb\u03bb\u03b1</em>). \u03a4\u03bf \u03ba\u03bf\u03c5\u03bc\u03c0\u03af \u03bc\u03b5\u03c4\u03b1\u03ba\u03b9\u03bd\u03b5\u03af\u03c4\u03b1\u03b9 \u03bc\u03af\u03b1 \u03b8\u03ad\u03c3\u03b7 \u03b4\u03b5\u03be\u03b9\u03cc\u03c3\u03c4\u03c1\u03bf\u03c6\u03b1 \u03bc\u03b5\u03c4\u03ac \u03b1\u03c0\u03cc \u03ba\u03ac\u03b8\u03b5 \u03c7\u03ad\u03c1\u03b9, \u03b5\u03bd\u03ce \u03c3\u03c4\u03bf PokerTH \u03c4\u03b1 \u03c4\u03c5\u03c6\u03bb\u03ac \u03b1\u03bd\u03b5\u03b2\u03b1\u03af\u03bd\u03bf\u03c5\u03bd \u03c3\u03b5 \u03c4\u03b1\u03ba\u03c4\u03ac \u03b4\u03b9\u03b1\u03c3\u03c4\u03ae\u03bc\u03b1\u03c4\u03b1.</p><h2>\u039f\u03b9 \u03c4\u03ad\u03c3\u03c3\u03b5\u03c1\u03b9\u03c2 \u03b3\u03cd\u03c1\u03bf\u03b9 \u03c3\u03c4\u03bf\u03b9\u03c7\u03b7\u03bc\u03b1\u03c4\u03b9\u03c3\u03bc\u03bf\u03cd</h2><ul><li><strong>Pre-flop</strong> \u2014 \u03b1\u03c6\u03bf\u03cd \u03c0\u03ac\u03c1\u03bf\u03c5\u03bd \u03c4\u03b1 \u03c0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ac \u03c4\u03bf\u03c5\u03c2 \u03c6\u03cd\u03bb\u03bb\u03b1, \u03bf\u03b9 \u03c0\u03b1\u03af\u03ba\u03c4\u03b5\u03c2 \u03c0\u03b1\u03af\u03b6\u03bf\u03c5\u03bd \u03bc\u03b5 \u03c4\u03b7 \u03c3\u03b5\u03b9\u03c1\u03ac, \u03be\u03b5\u03ba\u03b9\u03bd\u03ce\u03bd\u03c4\u03b1\u03c2 \u03b1\u03c1\u03b9\u03c3\u03c4\u03b5\u03c1\u03ac \u03b1\u03c0\u03cc \u03c4\u03bf \u03bc\u03b5\u03b3\u03ac\u03bb\u03bf \u03c4\u03c5\u03c6\u03bb\u03cc.</li><li><strong>Flop</strong> \u2014 \u03bc\u03bf\u03b9\u03c1\u03ac\u03b6\u03bf\u03bd\u03c4\u03b1\u03b9 \u03c4\u03c1\u03af\u03b1 \u03ba\u03bf\u03b9\u03bd\u03ac \u03c6\u03cd\u03bb\u03bb\u03b1 \u03b1\u03bd\u03bf\u03b9\u03c7\u03c4\u03ac \u03ba\u03b1\u03b9 \u03b1\u03ba\u03bf\u03bb\u03bf\u03c5\u03b8\u03b5\u03af \u03b3\u03cd\u03c1\u03bf\u03c2 \u03c3\u03c4\u03bf\u03b9\u03c7\u03b7\u03bc\u03b1\u03c4\u03b9\u03c3\u03bc\u03bf\u03cd.</li><li><strong>Turn</strong> \u2014 \u03bc\u03bf\u03b9\u03c1\u03ac\u03b6\u03b5\u03c4\u03b1\u03b9 \u03c4\u03ad\u03c4\u03b1\u03c1\u03c4\u03bf \u03ba\u03bf\u03b9\u03bd\u03cc \u03c6\u03cd\u03bb\u03bb\u03bf \u03ba\u03b1\u03b9 \u03b1\u03ba\u03bf\u03bb\u03bf\u03c5\u03b8\u03b5\u03af \u03ac\u03bb\u03bb\u03bf\u03c2 \u03ad\u03bd\u03b1\u03c2 \u03b3\u03cd\u03c1\u03bf\u03c2 \u03c3\u03c4\u03bf\u03b9\u03c7\u03b7\u03bc\u03b1\u03c4\u03b9\u03c3\u03bc\u03bf\u03cd.</li><li><strong>River</strong> \u2014 \u03bc\u03bf\u03b9\u03c1\u03ac\u03b6\u03b5\u03c4\u03b1\u03b9 \u03c4\u03bf \u03c0\u03ad\u03bc\u03c0\u03c4\u03bf \u03ba\u03b1\u03b9 \u03c4\u03b5\u03bb\u03b5\u03c5\u03c4\u03b1\u03af\u03bf \u03ba\u03bf\u03b9\u03bd\u03cc \u03c6\u03cd\u03bb\u03bb\u03bf \u03ba\u03b1\u03b9 \u03b1\u03ba\u03bf\u03bb\u03bf\u03c5\u03b8\u03b5\u03af \u03bf \u03c4\u03b5\u03bb\u03b9\u03ba\u03cc\u03c2 \u03b3\u03cd\u03c1\u03bf\u03c2 \u03c3\u03c4\u03bf\u03b9\u03c7\u03b7\u03bc\u03b1\u03c4\u03b9\u03c3\u03bc\u03bf\u03cd.</li></ul><h2>\u039f\u03b9 \u03b5\u03bd\u03ad\u03c1\u03b3\u03b5\u03b9\u03b5\u03c2</h2><ul><li><strong>Fold</strong> \u2014 \u03b5\u03b3\u03ba\u03b1\u03c4\u03ac\u03bb\u03b5\u03b9\u03c8\u03b7 \u03c4\u03bf\u03c5 \u03c7\u03b5\u03c1\u03b9\u03bf\u03cd \u03ba\u03b1\u03b9 \u03c4\u03c9\u03bd \u03bc\u03b1\u03c1\u03ba\u03ce\u03bd \u03c0\u03bf\u03c5 \u03ad\u03c7\u03bf\u03c5\u03bd \u03ae\u03b4\u03b7 \u03c0\u03bf\u03bd\u03c4\u03b1\u03c1\u03b9\u03c3\u03c4\u03b5\u03af.</li><li><strong>Check</strong> \u2014 \u03c0\u03ac\u03c3\u03bf \u03c7\u03c9\u03c1\u03af\u03c2 \u03c0\u03bf\u03bd\u03c4\u03ac\u03c1\u03b9\u03c3\u03bc\u03b1 (\u03bc\u03cc\u03bd\u03bf \u03b1\u03bd \u03ba\u03b1\u03bd\u03b5\u03af\u03c2 \u03b4\u03b5\u03bd \u03ad\u03c7\u03b5\u03b9 \u03c0\u03bf\u03bd\u03c4\u03ac\u03c1\u03b5\u03b9 \u03c3\u03c4\u03bf\u03bd \u03c4\u03c1\u03ad\u03c7\u03bf\u03bd\u03c4\u03b1 \u03b3\u03cd\u03c1\u03bf).</li><li><strong>Call</strong> \u2014 \u03b9\u03c3\u03bf\u03c6\u03ac\u03c1\u03b9\u03c3\u03b7 \u03c4\u03bf\u03c5 \u03c5\u03c8\u03b7\u03bb\u03cc\u03c4\u03b5\u03c1\u03bf\u03c5 \u03c0\u03bf\u03bd\u03c4\u03ac\u03c1\u03b9\u03c3\u03bc\u03b1\u03c4\u03bf\u03c2.</li><li><strong>Raise</strong> \u2014 \u03b1\u03cd\u03be\u03b7\u03c3\u03b7 \u03c4\u03bf\u03c5 \u03c4\u03c1\u03ad\u03c7\u03bf\u03bd\u03c4\u03bf\u03c2 \u03c0\u03bf\u03bd\u03c4\u03ac\u03c1\u03b9\u03c3\u03bc\u03b1\u03c4\u03bf\u03c2. \u03a3\u03c4\u03bf No-Limit \u03bc\u03b5 \u03bf\u03c0\u03bf\u03b9\u03bf\u03b4\u03ae\u03c0\u03bf\u03c4\u03b5 \u03c0\u03bf\u03c3\u03cc, \u03bc\u03ad\u03c7\u03c1\u03b9 \u03ba\u03b1\u03b9 \u03cc\u03bb\u03b5\u03c2 \u03c4\u03b9\u03c2 \u03bc\u03ac\u03c1\u03ba\u03b5\u03c2 \u03c3\u03b1\u03c2.</li><li><strong>All-In</strong> \u2014 \u03c0\u03bf\u03bd\u03c4\u03ac\u03c1\u03b9\u03c3\u03bc\u03b1 \u03cc\u03bb\u03c9\u03bd \u03c4\u03c9\u03bd \u03bc\u03b1\u03c1\u03ba\u03ce\u03bd \u03c3\u03b1\u03c2. \u0391\u03bd \u03bf\u03b9 \u03c5\u03c0\u03cc\u03bb\u03bf\u03b9\u03c0\u03bf\u03b9 \u03c3\u03c5\u03bd\u03b5\u03c7\u03af\u03c3\u03bf\u03c5\u03bd \u03bd\u03b1 \u03c0\u03bf\u03bd\u03c4\u03ac\u03c1\u03bf\u03c5\u03bd \u03c0\u03ac\u03bd\u03c9 \u03b1\u03c0\u03cc \u03b1\u03c5\u03c4\u03cc, \u03b4\u03b7\u03bc\u03b9\u03bf\u03c5\u03c1\u03b3\u03bf\u03cd\u03bd\u03c4\u03b1\u03b9 \u03c0\u03bb\u03b5\u03c5\u03c1\u03b9\u03ba\u03ac \u03c0\u03cc\u03c4\u03b9\u03b1, \u03ce\u03c3\u03c4\u03b5 \u03bd\u03b1 \u03bc\u03c0\u03bf\u03c1\u03b5\u03af\u03c4\u03b5 \u03bd\u03b1 \u03ba\u03b5\u03c1\u03b4\u03af\u03c3\u03b5\u03c4\u03b5 \u03bc\u03cc\u03bd\u03bf \u03c4\u03bf \u03bc\u03ad\u03c1\u03bf\u03c2 \u03c4\u03bf\u03c5 \u03c0\u03bf\u03c4\u03b9\u03bf\u03cd \u03c3\u03c4\u03bf \u03bf\u03c0\u03bf\u03af\u03bf \u03c3\u03c5\u03bd\u03b5\u03b9\u03c3\u03c6\u03ad\u03c1\u03b1\u03c4\u03b5.</li></ul><h2>\u03a4\u03bf \u03c6\u03b1\u03bd\u03ad\u03c1\u03c9\u03bc\u03b1</h2><p>\u0391\u03bd \u03bc\u03b5\u03c4\u03ac \u03c4\u03bf\u03bd \u03b3\u03cd\u03c1\u03bf \u03c3\u03c4\u03bf\u03b9\u03c7\u03b7\u03bc\u03b1\u03c4\u03b9\u03c3\u03bc\u03bf\u03cd \u03c3\u03c4\u03bf river \u03b1\u03c0\u03bf\u03bc\u03ad\u03bd\u03bf\u03c5\u03bd \u03b4\u03cd\u03bf \u03ae \u03c0\u03b5\u03c1\u03b9\u03c3\u03c3\u03cc\u03c4\u03b5\u03c1\u03bf\u03b9 \u03c0\u03b1\u03af\u03ba\u03c4\u03b5\u03c2, \u03c4\u03b1 \u03c7\u03ad\u03c1\u03b9\u03b1 \u03b1\u03c0\u03bf\u03ba\u03b1\u03bb\u03cd\u03c0\u03c4\u03bf\u03bd\u03c4\u03b1\u03b9. \u039f \u03ba\u03b1\u03bb\u03cd\u03c4\u03b5\u03c1\u03bf\u03c2 \u03c3\u03c5\u03bd\u03b4\u03c5\u03b1\u03c3\u03bc\u03cc\u03c2 \u03c0\u03ad\u03bd\u03c4\u03b5 \u03c6\u03cd\u03bb\u03bb\u03c9\u03bd \u03b1\u03c0\u03cc \u03c4\u03b1 \u03b5\u03c0\u03c4\u03ac \u03b4\u03b9\u03b1\u03b8\u03ad\u03c3\u03b9\u03bc\u03b1 (\u03b4\u03cd\u03bf \u03c0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ac + \u03c0\u03ad\u03bd\u03c4\u03b5 \u03ba\u03bf\u03b9\u03bd\u03ac) \u03ba\u03b5\u03c1\u03b4\u03af\u03b6\u03b5\u03b9 \u03c4\u03bf \u03c0\u03cc\u03c4\u03b9. \u038a\u03c3\u03b1 \u03c7\u03ad\u03c1\u03b9\u03b1 \u03c4\u03bf \u03bc\u03bf\u03b9\u03c1\u03ac\u03b6\u03bf\u03bd\u03c4\u03b1\u03b9.</p><h2>\u039a\u03b1\u03c4\u03ac\u03c4\u03b1\u03be\u03b7 \u03c7\u03b5\u03c1\u03b9\u03ce\u03bd, \u03b1\u03c0\u03cc \u03c4\u03bf \u03b9\u03c3\u03c7\u03c5\u03c1\u03cc\u03c4\u03b5\u03c1\u03bf \u03c3\u03c4\u03bf \u03b1\u03c3\u03b8\u03b5\u03bd\u03ad\u03c3\u03c4\u03b5\u03c1\u03bf</h2><ol><li><strong>\u03a1\u03bf\u03c5\u03b1\u03b3\u03b9\u03ac\u03bb \u03c6\u03bb\u03bf\u03c2</strong> \u2014 A K Q J 10 \u03c3\u03c4\u03bf \u03af\u03b4\u03b9\u03bf \u03c7\u03c1\u03ce\u03bc\u03b1.</li><li><strong>\u03a3\u03c4\u03c1\u03ad\u03b9\u03c4 \u03c6\u03bb\u03bf\u03c2</strong> \u2014 \u03c0\u03ad\u03bd\u03c4\u03b5 \u03c3\u03c5\u03bd\u03b5\u03c7\u03cc\u03bc\u03b5\u03bd\u03b1 \u03c6\u03cd\u03bb\u03bb\u03b1 \u03c3\u03c4\u03bf \u03af\u03b4\u03b9\u03bf \u03c7\u03c1\u03ce\u03bc\u03b1.</li><li><strong>\u039a\u03b1\u03c1\u03ad</strong> \u2014 \u03c4\u03ad\u03c3\u03c3\u03b5\u03c1\u03b1 \u03c6\u03cd\u03bb\u03bb\u03b1 \u03af\u03b4\u03b9\u03b1\u03c2 \u03b1\u03be\u03af\u03b1\u03c2.</li><li><strong>\u03a6\u03bf\u03c5\u03bb</strong> \u2014 \u03bc\u03b9\u03b1 \u03c4\u03c1\u03b9\u03ac\u03b4\u03b1 \u03c3\u03c5\u03bd \u03ad\u03bd\u03b1 \u03b6\u03b5\u03c5\u03b3\u03ac\u03c1\u03b9.</li><li><strong>\u03a6\u03bb\u03bf\u03c2</strong> \u2014 \u03c0\u03ad\u03bd\u03c4\u03b5 \u03c6\u03cd\u03bb\u03bb\u03b1 \u03c3\u03c4\u03bf \u03af\u03b4\u03b9\u03bf \u03c7\u03c1\u03ce\u03bc\u03b1.</li><li><strong>\u039a\u03ad\u03bd\u03c4\u03b1</strong> \u2014 \u03c0\u03ad\u03bd\u03c4\u03b5 \u03c3\u03c5\u03bd\u03b5\u03c7\u03cc\u03bc\u03b5\u03bd\u03b1 \u03c6\u03cd\u03bb\u03bb\u03b1 \u03c3\u03b5 \u03b4\u03b9\u03b1\u03c6\u03bf\u03c1\u03b5\u03c4\u03b9\u03ba\u03ac \u03c7\u03c1\u03ce\u03bc\u03b1\u03c4\u03b1.</li><li><strong>\u03a4\u03c1\u03b9\u03ac\u03b4\u03b1</strong> \u2014 \u03c4\u03c1\u03af\u03b1 \u03c6\u03cd\u03bb\u03bb\u03b1 \u03af\u03b4\u03b9\u03b1\u03c2 \u03b1\u03be\u03af\u03b1\u03c2.</li><li><strong>\u0394\u03cd\u03bf \u03b6\u03b5\u03c5\u03b3\u03ac\u03c1\u03b9\u03b1</strong> \u2014 \u03b4\u03cd\u03bf \u03b4\u03b9\u03b1\u03c6\u03bf\u03c1\u03b5\u03c4\u03b9\u03ba\u03ac \u03b6\u03b5\u03c5\u03b3\u03ac\u03c1\u03b9\u03b1.</li><li><strong>\u0388\u03bd\u03b1 \u03b6\u03b5\u03c5\u03b3\u03ac\u03c1\u03b9</strong> \u2014 \u03b4\u03cd\u03bf \u03c6\u03cd\u03bb\u03bb\u03b1 \u03af\u03b4\u03b9\u03b1\u03c2 \u03b1\u03be\u03af\u03b1\u03c2.</li><li><strong>\u03a5\u03c8\u03b7\u03bb\u03cc \u03c6\u03cd\u03bb\u03bb\u03bf</strong> \u2014 \u03c4\u03af\u03c0\u03bf\u03c4\u03b1 \u03b1\u03c0\u03cc \u03c4\u03b1 \u03c0\u03b1\u03c1\u03b1\u03c0\u03ac\u03bd\u03c9\u00b7 \u03ba\u03c1\u03af\u03bd\u03b5\u03b9 \u03c4\u03bf \u03c8\u03b7\u03bb\u03cc\u03c4\u03b5\u03c1\u03bf \u03c6\u03cd\u03bb\u03bb\u03bf.</li></ol><h2>\u03a4\u03b1 \u03c4\u03bf\u03c5\u03c1\u03bd\u03bf\u03c5\u03ac \u03c3\u03c4\u03bf PokerTH</h2><p>\u039f\u03b9 \u03c0\u03b1\u03c1\u03c4\u03af\u03b4\u03b5\u03c2 \u03c3\u03c4\u03bf PokerTH \u03b5\u03af\u03bd\u03b1\u03b9 \u03c4\u03bf\u03c5\u03c1\u03bd\u03bf\u03c5\u03ac \u03c4\u03cd\u03c0\u03bf\u03c5 sit-and-go: \u03cc\u03bb\u03bf\u03b9 \u03be\u03b5\u03ba\u03b9\u03bd\u03bf\u03cd\u03bd \u03bc\u03b5 \u03c4\u03b9\u03c2 \u03af\u03b4\u03b9\u03b5\u03c2 \u03bc\u03ac\u03c1\u03ba\u03b5\u03c2, \u03c4\u03b1 \u03c4\u03c5\u03c6\u03bb\u03ac \u03b1\u03bd\u03b5\u03b2\u03b1\u03af\u03bd\u03bf\u03c5\u03bd \u03bc\u03b5 \u03c4\u03bf\u03bd \u03c7\u03c1\u03cc\u03bd\u03bf \u03ba\u03b1\u03b9 \u03bd\u03b9\u03ba\u03ac \u03bf \u03c4\u03b5\u03bb\u03b5\u03c5\u03c4\u03b1\u03af\u03bf\u03c2 \u03c0\u03b1\u03af\u03ba\u03c4\u03b7\u03c2 \u03c0\u03bf\u03c5 \u03ba\u03c1\u03b1\u03c4\u03ac \u03bc\u03ac\u03c1\u03ba\u03b5\u03c2. \u039c\u03c0\u03bf\u03c1\u03b5\u03af\u03c4\u03b5 \u03bd\u03b1 \u03b5\u03be\u03b1\u03c3\u03ba\u03b7\u03b8\u03b5\u03af\u03c4\u03b5 \u03b5\u03ba\u03c4\u03cc\u03c2 \u03c3\u03cd\u03bd\u03b4\u03b5\u03c3\u03b7\u03c2 \u03b1\u03c0\u03ad\u03bd\u03b1\u03bd\u03c4\u03b9 \u03c3\u03b5 \u03b1\u03bd\u03c4\u03b9\u03c0\u03ac\u03bb\u03bf\u03c5\u03c2 \u03c4\u03bf\u03c5 \u03c5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae, \u03bd\u03b1 \u03c0\u03b1\u03af\u03be\u03b5\u03c4\u03b5 \u03c3\u03b5 \u03c4\u03bf\u03c0\u03b9\u03ba\u03cc \u03b4\u03af\u03ba\u03c4\u03c5\u03bf \u03ae \u03c3\u03b5 \u03b4\u03b9\u03ba\u03cc \u03c3\u03b1\u03c2 \u03b4\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ae, \u03ae \u03bd\u03b1 \u03bc\u03c0\u03b5\u03af\u03c4\u03b5 \u03c3\u03c4\u03bf \u03b5\u03c0\u03af\u03c3\u03b7\u03bc\u03bf \u03b4\u03af\u03ba\u03c4\u03c5\u03bf pokerth.net \u03bc\u03b5 \u03c4\u03b9\u03c2 \u03b2\u03b1\u03b8\u03bc\u03bf\u03bb\u03bf\u03b3\u03af\u03b5\u03c2 \u03b1\u03bd\u03ac \u03c3\u03b5\u03b6\u03cc\u03bd.</p>" },
  da: {
    title: "Texas Hold\u2019em-regler \u2014 PokerTH webklient",
    desc: "Komplette Texas Hold\u2019em-regler, som spillet spilles i PokerTH: blinds, de fire budrunder, Fold/Check/Call/Raise/All-In, sidepuljer og h\u00e5ndv\u00e6rdier.",
    ldHeadline: "Texas Hold\u2019em pokerregler \u2014 PokerTH",
    ldDesc: "S\u00e5dan spiller du No-Limit Texas Hold\u2019em: blinds, budrunder, handlinger og h\u00e5ndv\u00e6rdier, som i PokerTH.",
    body: "<h1>Texas Hold\u2019em pokerregler</h1><p>I PokerTH spilles No-Limit Texas Hold\u2019em, verdens mest udbredte pokervariant. Hver spiller fors\u00f8ger at lave den bedste h\u00e5nd p\u00e5 fem kort ud af to egne kort og fem f\u00e6lleskort.</p><h2>Uddelingen og blinds</h2><p>Hver h\u00e5nd begynder med to tvungne indsatser: spilleren til venstre for dealerknappen l\u00e6gger <em>lille blind</em>, den n\u00e6ste <em>stor blind</em>. Derefter f\u00e5r hver spiller to kort med bagsiden opad (<em>hulkortene</em>). Knappen rykker en plads med uret efter hver h\u00e5nd, og i PokerTH stiger blinds med j\u00e6vne mellemrum.</p><h2>De fire budrunder</h2><ul><li><strong>Pre-flop</strong> \u2014 efter at have f\u00e5et hulkortene handler spillerne p\u00e5 skift med start til venstre for stor blind.</li><li><strong>Flop</strong> \u2014 tre f\u00e6lleskort l\u00e6gges op med billedsiden opad, efterfulgt af en budrunde.</li><li><strong>Turn</strong> \u2014 et fjerde f\u00e6lleskort deles ud, efterfulgt af endnu en budrunde.</li><li><strong>River</strong> \u2014 det femte og sidste f\u00e6lleskort deles ud, efterfulgt af den sidste budrunde.</li></ul><h2>Handlingerne</h2><ul><li><strong>Fold</strong> \u2014 opgive h\u00e5nden og de jetoner, der allerede er satset.</li><li><strong>Check</strong> \u2014 sende videre uden at satse (kun hvis ingen har satset i den aktuelle runde).</li><li><strong>Call</strong> \u2014 g\u00e5 med den h\u00f8jeste indsats lige nu.</li><li><strong>Raise</strong> \u2014 h\u00e6ve den aktuelle indsats. I No-Limit med et hvilket som helst bel\u00f8b op til hele din stak.</li><li><strong>All-In</strong> \u2014 satse alle sine jetoner. Hvis andre bliver ved med at satse derudover, opst\u00e5r der sidepuljer, s\u00e5 du kun kan vinde den del af puljen, du har bidraget til.</li></ul><h2>Showdown</h2><p>Er der to eller flere spillere tilbage efter budrunden p\u00e5 river, vises h\u00e6nderne. Den bedste kombination p\u00e5 fem kort blandt de syv tilg\u00e6ngelige (to hulkort + fem f\u00e6lleskort) vinder puljen. Lige h\u00e6nder deler puljen.</p><h2>H\u00e5ndv\u00e6rdier, fra st\u00e6rkest til svagest</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10 i samme farve.</li><li><strong>Straight flush</strong> \u2014 fem kort i r\u00e6kkef\u00f8lge i samme farve.</li><li><strong>Fire ens</strong> \u2014 fire kort af samme v\u00e6rdi.</li><li><strong>Fuldt hus</strong> \u2014 tre ens plus et par.</li><li><strong>Flush</strong> \u2014 fem kort i samme farve.</li><li><strong>Straight</strong> \u2014 fem kort i r\u00e6kkef\u00f8lge i blandede farver.</li><li><strong>Tre ens</strong> \u2014 tre kort af samme v\u00e6rdi.</li><li><strong>To par</strong> \u2014 to forskellige par.</li><li><strong>Et par</strong> \u2014 to kort af samme v\u00e6rdi.</li><li><strong>H\u00f8jeste kort</strong> \u2014 intet af ovenst\u00e5ende; det h\u00f8jeste kort afg\u00f8r.</li></ol><h2>Turneringer i PokerTH</h2><p>Spil i PokerTH er turneringer af typen sit-and-go: alle starter med samme stak, blinds stiger over tid, og den sidste spiller med jetoner vinder. Du kan tr\u00e6ne offline mod computermodstandere, spille over LAN eller p\u00e5 en privat server, eller deltage i det officielle pokerth.net-netv\u00e6rk med s\u00e6sonranglister.</p>" },
  fi: {
    title: "Texas Hold\u2019em -s\u00e4\u00e4nn\u00f6t \u2014 PokerTH-selainversio",
    desc: "T\u00e4ydet Texas Hold\u2019em -s\u00e4\u00e4nn\u00f6t sellaisina kuin peli\u00e4 pelataan PokerTH:ssa: blindit, nelj\u00e4 panostuskierrosta, Fold/Check/Call/Raise/All-In, sivupotit ja k\u00e4sien j\u00e4rjestys.",
    ldHeadline: "Texas Hold\u2019em -pokerin s\u00e4\u00e4nn\u00f6t \u2014 PokerTH",
    ldDesc: "N\u00e4in pelaat No-Limit Texas Hold\u2019emia: blindit, panostuskierrokset, toiminnot ja k\u00e4sien j\u00e4rjestys, kuten PokerTH:ssa.",
    body: "<h1>Texas Hold\u2019em -pokerin s\u00e4\u00e4nn\u00f6t</h1><p>PokerTH:ssa pelataan No-Limit Texas Hold\u2019emia, maailman suosituinta pokerimuotoa. Jokainen pelaaja yritt\u00e4\u00e4 muodostaa parhaan viiden kortin k\u00e4den kahdesta omasta ja viidest\u00e4 yhteisest\u00e4 kortista.</p><h2>Jako ja blindit</h2><p>Jokainen jako alkaa kahdella pakollisella panoksella: jakajanapin vasemmalla puolella oleva pelaaja asettaa <em>pienen blindin</em> ja seuraava <em>ison blindin</em>. Sen j\u00e4lkeen jokainen pelaaja saa kaksi kuvapuoli alasp\u00e4in olevaa korttia (<em>taskukortit</em>). Nappi siirtyy jokaisen jaon j\u00e4lkeen paikan my\u00f6t\u00e4p\u00e4iv\u00e4\u00e4n, ja PokerTH:ssa blindit nousevat s\u00e4\u00e4nn\u00f6llisin v\u00e4liajoin.</p><h2>Nelj\u00e4 panostuskierrosta</h2><ul><li><strong>Pre-flop</strong> \u2014 taskukorttien j\u00e4lkeen pelaajat toimivat vuorotellen alkaen ison blindin vasemmalta puolelta.</li><li><strong>Flop</strong> \u2014 p\u00f6yt\u00e4\u00e4n k\u00e4\u00e4nnet\u00e4\u00e4n kolme yhteist\u00e4 korttia, mink\u00e4 j\u00e4lkeen on panostuskierros.</li><li><strong>Turn</strong> \u2014 jaetaan nelj\u00e4s yhteinen kortti ja sen j\u00e4lkeen uusi panostuskierros.</li><li><strong>River</strong> \u2014 jaetaan viides ja viimeinen yhteinen kortti ja sen j\u00e4lkeen viimeinen panostuskierros.</li></ul><h2>Toiminnot</h2><ul><li><strong>Fold</strong> \u2014 luovuttaa k\u00e4tens\u00e4 ja jo panostetut pelimerkit.</li><li><strong>Check</strong> \u2014 j\u00e4tt\u00e4\u00e4 panostamatta ja siirt\u00e4\u00e4 vuoron (vain jos kukaan ei ole panostanut kierroksella).</li><li><strong>Call</strong> \u2014 maksaa sen hetken korkein panos.</li><li><strong>Raise</strong> \u2014 korottaa nykyist\u00e4 panosta. No-Limitiss\u00e4 mill\u00e4 tahansa summalla aina koko pinoon asti.</li><li><strong>All-In</strong> \u2014 panostaa kaikki pelimerkkins\u00e4. Jos muut jatkavat panostamista t\u00e4m\u00e4n yli, syntyy sivupotteja, joten voit voittaa vain sen osan potista, johon olet itse osallistunut.</li></ul><h2>Korttien n\u00e4ytt\u00f6</h2><p>Jos riverin panostuskierroksen j\u00e4lkeen on j\u00e4ljell\u00e4 kaksi tai useampi pelaaja, k\u00e4det paljastetaan. Paras viiden kortin yhdistelm\u00e4 seitsem\u00e4st\u00e4 k\u00e4ytett\u00e4viss\u00e4 olevasta kortista (kaksi taskukorttia + viisi yhteist\u00e4) voittaa potin. Yht\u00e4 hyv\u00e4t k\u00e4det jakavat potin.</p><h2>K\u00e4sien j\u00e4rjestys, vahvimmasta heikoimpaan</h2><ol><li><strong>V\u00e4risuora \u00e4ss\u00e4st\u00e4</strong> \u2014 A K Q J 10 samaa maata.</li><li><strong>V\u00e4risuora</strong> \u2014 viisi per\u00e4kk\u00e4ist\u00e4 korttia samaa maata.</li><li><strong>Neloset</strong> \u2014 nelj\u00e4 samanarvoista korttia.</li><li><strong>T\u00e4ysk\u00e4si</strong> \u2014 kolmoset ja pari.</li><li><strong>V\u00e4ri</strong> \u2014 viisi samaa maata olevaa korttia.</li><li><strong>Suora</strong> \u2014 viisi per\u00e4kk\u00e4ist\u00e4 korttia eri maita.</li><li><strong>Kolmoset</strong> \u2014 kolme samanarvoista korttia.</li><li><strong>Kaksi paria</strong> \u2014 kaksi eri paria.</li><li><strong>Pari</strong> \u2014 kaksi samanarvoista korttia.</li><li><strong>Hai</strong> \u2014 ei mit\u00e4\u00e4n edell\u00e4 mainituista; korkein kortti ratkaisee.</li></ol><h2>Turnaukset PokerTH:ssa</h2><p>PokerTH:n pelit ovat sit-and-go-tyylisi\u00e4 turnauksia: kaikki aloittavat samalla pinolla, blindit nousevat ajan my\u00f6t\u00e4 ja viimeisen\u00e4 pelimerkkej\u00e4 pit\u00e4v\u00e4 pelaaja voittaa. Voit harjoitella offline-tilassa tietokonevastustajia vastaan, pelata l\u00e4hiverkossa tai omalla palvelimella, tai liitty\u00e4 viralliseen pokerth.net-verkkoon kausisijoituksineen.</p>" },
  nb: {
    title: "Texas Hold\u2019em-regler \u2014 PokerTH nettklient",
    desc: "Fullstendige Texas Hold\u2019em-regler slik spillet spilles i PokerTH: blindposter, de fire budrundene, Fold/Check/Call/Raise/All-In, sidepotter og h\u00e5ndverdier.",
    ldHeadline: "Texas Hold\u2019em pokerregler \u2014 PokerTH",
    ldDesc: "Slik spiller du No-Limit Texas Hold\u2019em: blindposter, budrunder, handlinger og h\u00e5ndverdier, som i PokerTH.",
    body: "<h1>Texas Hold\u2019em pokerregler</h1><p>I PokerTH spilles No-Limit Texas Hold\u2019em, verdens mest popul\u00e6re pokervariant. Hver spiller pr\u00f8ver \u00e5 lage den beste h\u00e5nden p\u00e5 fem kort av to egne kort og fem felleskort.</p><h2>Delingen og blindpostene</h2><p>Hver h\u00e5nd starter med to tvungne innsatser: spilleren til venstre for dealerknappen legger <em>lille blind</em>, den neste <em>store blind</em>. Deretter f\u00e5r hver spiller to kort med baksiden opp (<em>hullkortene</em>). Knappen flytter seg \u00e9n plass med klokken etter hver h\u00e5nd, og i PokerTH \u00f8ker blindpostene med jevne mellomrom.</p><h2>De fire budrundene</h2><ul><li><strong>Pre-flop</strong> \u2014 etter \u00e5 ha f\u00e5tt hullkortene handler spillerne etter tur, med start til venstre for store blind.</li><li><strong>Flop</strong> \u2014 tre felleskort legges opp med billedsiden opp, etterfulgt av en budrunde.</li><li><strong>Turn</strong> \u2014 et fjerde felleskort deles ut, etterfulgt av nok en budrunde.</li><li><strong>River</strong> \u2014 det femte og siste felleskortet deles ut, etterfulgt av den siste budrunden.</li></ul><h2>Handlingene</h2><ul><li><strong>Fold</strong> \u2014 gi opp h\u00e5nden og sjetongene som allerede er satset.</li><li><strong>Check</strong> \u2014 sende videre uten \u00e5 satse (bare hvis ingen har satset i den p\u00e5g\u00e5ende runden).</li><li><strong>Call</strong> \u2014 syne den h\u00f8yeste innsatsen akkurat n\u00e5.</li><li><strong>Raise</strong> \u2014 \u00f8ke den gjeldende innsatsen. I No-Limit med hvilket som helst bel\u00f8p, opp til hele stacken din.</li><li><strong>All-In</strong> \u2014 satse alle sjetongene sine. Fortsetter andre \u00e5 satse utover dette, oppst\u00e5r det sidepotter, slik at du bare kan vinne den delen av potten du har bidratt til.</li></ul><h2>Showdown</h2><p>Er det to eller flere spillere igjen etter budrunden p\u00e5 river, vises hendene. Den beste kombinasjonen p\u00e5 fem kort av de sju tilgjengelige (to hullkort + fem felleskort) vinner potten. Like hender deler potten.</p><h2>H\u00e5ndverdier, fra sterkest til svakest</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10 i samme farge.</li><li><strong>Straight flush</strong> \u2014 fem kort p\u00e5 rad i samme farge.</li><li><strong>Fire like</strong> \u2014 fire kort av samme verdi.</li><li><strong>Fullt hus</strong> \u2014 tre like pluss et par.</li><li><strong>Flush</strong> \u2014 fem kort i samme farge.</li><li><strong>Straight</strong> \u2014 fem kort p\u00e5 rad i blandede farger.</li><li><strong>Tre like</strong> \u2014 tre kort av samme verdi.</li><li><strong>To par</strong> \u2014 to forskjellige par.</li><li><strong>Ett par</strong> \u2014 to kort av samme verdi.</li><li><strong>H\u00f8yeste kort</strong> \u2014 ingen av delene over; det h\u00f8yeste kortet avgj\u00f8r.</li></ol><h2>Turneringer i PokerTH</h2><p>Spillene i PokerTH er turneringer av sit-and-go-typen: alle starter med lik stack, blindpostene \u00f8ker over tid, og den siste spilleren med sjetonger vinner. Du kan \u00f8ve offline mot datamotstandere, spille over LAN eller p\u00e5 en privat server, eller bli med i det offisielle pokerth.net-nettverket med sesongrangeringer.</p>" },
  sk: {
    title: "Pravidl\u00e1 Texas Hold\u2019em \u2014 webov\u00fd klient PokerTH",
    desc: "Kompletn\u00e9 pravidl\u00e1 Texas Hold\u2019em tak, ako sa hr\u00e1 v PokerTH: blindy, \u0161tyri st\u00e1vkov\u00e9 kol\u00e1, Fold/Check/Call/Raise/All-In, ved\u013eaj\u0161ie banky a sila kombin\u00e1ci\u00ed.",
    ldHeadline: "Pravidl\u00e1 pokru Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Ako hra\u0165 No-Limit Texas Hold\u2019em: blindy, st\u00e1vkov\u00e9 kol\u00e1, akcie a sila kombin\u00e1ci\u00ed, ako v PokerTH.",
    body: "<h1>Pravidl\u00e1 pokru Texas Hold\u2019em</h1><p>V PokerTH sa hr\u00e1 No-Limit Texas Hold\u2019em, najroz\u0161\u00edrenej\u0161\u00ed variant pokru na svete. Ka\u017ed\u00fd hr\u00e1\u010d sa sna\u017e\u00ed zlo\u017ei\u0165 najlep\u0161iu p\u00e4\u0165kartov\u00fa kombin\u00e1ciu z dvoch vlastn\u00fdch a piatich spolo\u010dn\u00fdch kariet.</p><h2>Rozdanie a blindy</h2><p>Ka\u017ed\u00e9 rozdanie sa za\u010d\u00edna dvoma povinn\u00fdmi st\u00e1vkami: hr\u00e1\u010d na\u013eavo od tla\u010didla dealera vklad\u00e1 <em>mal\u00fd blind</em>, \u010fal\u0161\u00ed <em>ve\u013ek\u00fd blind</em>. Potom ka\u017ed\u00fd hr\u00e1\u010d dostane dve zakryt\u00e9 karty (<em>vlastn\u00e9 karty</em>). Tla\u010didlo sa po ka\u017edom rozdan\u00ed posunie o jedno miesto v smere hodinov\u00fdch ru\u010di\u010diek a v PokerTH sa blindy zvy\u0161uj\u00fa v pravideln\u00fdch intervaloch.</p><h2>\u0160tyri st\u00e1vkov\u00e9 kol\u00e1</h2><ul><li><strong>Pre-flop</strong> \u2014 po prijat\u00ed vlastn\u00fdch kariet hraj\u00fa hr\u00e1\u010di postupne, po\u010dn\u00fac na\u013eavo od ve\u013ek\u00e9ho blindu.</li><li><strong>Flop</strong> \u2014 na st\u00f4l pr\u00eddu tri odkryt\u00e9 spolo\u010dn\u00e9 karty, nasleduje st\u00e1vkov\u00e9 kolo.</li><li><strong>Turn</strong> \u2014 prid\u00e1 sa \u0161tvrt\u00e1 spolo\u010dn\u00e1 karta a \u010fal\u0161ie st\u00e1vkov\u00e9 kolo.</li><li><strong>River</strong> \u2014 prid\u00e1 sa piata a posledn\u00e1 spolo\u010dn\u00e1 karta a z\u00e1vere\u010dn\u00e9 st\u00e1vkov\u00e9 kolo.</li></ul><h2>Akcie</h2><ul><li><strong>Fold</strong> \u2014 zlo\u017ei\u0165 karty a vzda\u0165 sa u\u017e vsaden\u00fdch \u017eet\u00f3nov.</li><li><strong>Check</strong> \u2014 posla\u0165 \u010falej bez st\u00e1vky (len ak v aktu\u00e1lnom kole e\u0161te nikto nest\u00e1vkoval).</li><li><strong>Call</strong> \u2014 dorovna\u0165 najvy\u0161\u0161iu s\u00fa\u010dasn\u00fa st\u00e1vku.</li><li><strong>Raise</strong> \u2014 zv\u00fd\u0161i\u0165 s\u00fa\u010dasn\u00fa st\u00e1vku. V No-Limite o \u013eubovo\u013en\u00fa sumu a\u017e po cel\u00fd svoj stack.</li><li><strong>All-In</strong> \u2014 vsadi\u0165 v\u0161etky svoje \u017eet\u00f3ny. Ak ostatn\u00ed st\u00e1vkuj\u00fa \u010falej nad t\u00fato sumu, vznikaj\u00fa ved\u013eaj\u0161ie banky, tak\u017ee m\u00f4\u017eete vyhra\u0165 len t\u00fa \u010das\u0165 banku, do ktorej ste prispeli.</li></ul><h2>Odkrytie kariet</h2><p>Ak po st\u00e1vkovom kole na riveri zostan\u00fa dvaja \u010di viacer\u00ed hr\u00e1\u010di, karty sa odkryj\u00fa. Najlep\u0161ia p\u00e4\u0165kartov\u00e1 kombin\u00e1cia zo siedmich dostupn\u00fdch kariet (dve vlastn\u00e9 + p\u00e4\u0165 spolo\u010dn\u00fdch) berie bank. Rovnako siln\u00e9 kombin\u00e1cie sa o\u0148 delia.</p><h2>Sila kombin\u00e1ci\u00ed, od najsilnej\u0161ej po najslab\u0161iu</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10 v jednej farbe.</li><li><strong>Straight flush</strong> \u2014 p\u00e4\u0165 po sebe id\u00facich kariet jednej farby.</li><li><strong>\u0160tvorica</strong> \u2014 \u0161tyri karty rovnakej hodnoty.</li><li><strong>Full house</strong> \u2014 trojica plus p\u00e1r.</li><li><strong>Farba</strong> \u2014 p\u00e4\u0165 kariet rovnakej farby.</li><li><strong>Postupka</strong> \u2014 p\u00e4\u0165 po sebe id\u00facich kariet r\u00f4znych farieb.</li><li><strong>Trojica</strong> \u2014 tri karty rovnakej hodnoty.</li><li><strong>Dva p\u00e1ry</strong> \u2014 dva r\u00f4zne p\u00e1ry.</li><li><strong>P\u00e1r</strong> \u2014 dve karty rovnakej hodnoty.</li><li><strong>Vysok\u00e1 karta</strong> \u2014 ni\u010d z uveden\u00e9ho; rozhoduje najvy\u0161\u0161ia karta.</li></ol><h2>Turnaje v PokerTH</h2><p>Hry v PokerTH s\u00fa turnaje typu sit-and-go: v\u0161etci za\u010d\u00ednaj\u00fa s rovnak\u00fdm stackom, blindy sa \u010dasom zvy\u0161uj\u00fa a vyhr\u00e1va posledn\u00fd hr\u00e1\u010d so \u017eet\u00f3nmi. M\u00f4\u017eete tr\u00e9nova\u0165 offline proti po\u010d\u00edta\u010dov\u00fdm s\u00faperom, hra\u0165 cez LAN alebo na vlastnom serveri, pr\u00edpadne sa pripoji\u0165 k ofici\u00e1lnej sieti pokerth.net so sez\u00f3nnymi rebr\u00ed\u010dkami.</p>" },
  hr: {
    title: "Pravila Texas Hold\u2019ema \u2014 PokerTH web klijent",
    desc: "Potpuna pravila Texas Hold\u2019ema onako kako se igra u PokerTH-u: blindovi, \u010detiri kruga kla\u0111enja, Fold/Check/Call/Raise/All-In, sporedni potovi i ja\u010dina kombinacija.",
    ldHeadline: "Pravila pokera Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Kako se igra No-Limit Texas Hold\u2019em: blindovi, krugovi kla\u0111enja, poteti i ja\u010dina kombinacija, kao u PokerTH-u.",
    body: "<h1>Pravila pokera Texas Hold\u2019em</h1><p>U PokerTH-u se igra No-Limit Texas Hold\u2019em, najpopularnija ina\u010dica pokera na svijetu. Svaki igra\u010d poku\u0161ava slo\u017eiti najbolju kombinaciju od pet karata koriste\u0107i dvije vlastite i pet zajedni\u010dkih karata.</p><h2>Dijeljenje i blindovi</h2><p>Svaka ruka po\u010dinje s dva obavezna uloga: igra\u010d lijevo od gumba djelitelja ula\u017ee <em>mali blind</em>, a sljede\u0107i <em>veliki blind</em>. Zatim svaki igra\u010d dobiva dvije zatvorene karte (<em>vlastite karte</em>). Gumb se nakon svake ruke pomi\u010de jedno mjesto u smjeru kazaljke na satu, a u PokerTH-u blindovi rastu u pravilnim razmacima.</p><h2>\u010cetiri kruga kla\u0111enja</h2><ul><li><strong>Pre-flop</strong> \u2014 nakon primitka vlastitih karata igra\u010di igraju redom, po\u010dev\u0161i lijevo od velikog blinda.</li><li><strong>Flop</strong> \u2014 otvaraju se tri zajedni\u010dke karte, nakon \u010dega slijedi krug kla\u0111enja.</li><li><strong>Turn</strong> \u2014 dijeli se \u010detvrta zajedni\u010dka karta, a zatim jo\u0161 jedan krug kla\u0111enja.</li><li><strong>River</strong> \u2014 dijeli se peta i posljednja zajedni\u010dka karta, a zatim zavr\u0161ni krug kla\u0111enja.</li></ul><h2>Potezi</h2><ul><li><strong>Fold</strong> \u2014 odustati od ruke i od ve\u0107 ulo\u017eenih \u017eetona.</li><li><strong>Check</strong> \u2014 proslijediti bez uloga (samo ako u teku\u0107em krugu nitko nije ulagao).</li><li><strong>Call</strong> \u2014 izjedna\u010diti trenuta\u010dno najve\u0107i ulog.</li><li><strong>Raise</strong> \u2014 povisiti trenuta\u010dni ulog. U No-Limitu bilo kojim iznosom, sve do cijelog svog stacka.</li><li><strong>All-In</strong> \u2014 ulo\u017eiti sve svoje \u017eetone. Nastave li drugi ulagati iznad toga, stvaraju se sporedni potovi, pa mo\u017eete osvojiti samo onaj dio pota u koji ste ulo\u017eili.</li></ul><h2>Otvaranje karata</h2><p>Ostanu li nakon kruga kla\u0111enja na riveru dva ili vi\u0161e igra\u010da, karte se otkrivaju. Najbolja kombinacija od pet karata me\u0111u sedam dostupnih (dvije vlastite + pet zajedni\u010dkih) osvaja pot. Jednake kombinacije dijele pot.</p><h2>Ja\u010dina kombinacija, od najja\u010de prema najslabijoj</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10 u istoj boji.</li><li><strong>Straight flush</strong> \u2014 pet uzastopnih karata iste boje.</li><li><strong>Poker</strong> \u2014 \u010detiri karte iste vrijednosti.</li><li><strong>Full house</strong> \u2014 tri iste plus par.</li><li><strong>Boja</strong> \u2014 pet karata iste boje.</li><li><strong>Skala</strong> \u2014 pet uzastopnih karata razli\u010ditih boja.</li><li><strong>Tri iste</strong> \u2014 tri karte iste vrijednosti.</li><li><strong>Dva para</strong> \u2014 dva razli\u010dita para.</li><li><strong>Par</strong> \u2014 dvije karte iste vrijednosti.</li><li><strong>Visoka karta</strong> \u2014 ni\u0161ta od navedenog; odlu\u010duje najvi\u0161a karta.</li></ol><h2>Turniri u PokerTH-u</h2><p>Partije u PokerTH-u su turniri u stilu sit-and-go: svi kre\u0107u s jednakim stackom, blindovi s vremenom rastu, a pobje\u0111uje posljednji igra\u010d koji ima \u017eetone. Mo\u017eete vje\u017ebati offline protiv ra\u010dunalnih protivnika, igrati na LAN-u ili na vlastitom poslu\u017eitelju, ili se pridru\u017eiti slu\u017ebenoj mre\u017ei pokerth.net sa sezonskim ljestvicama.</p>" },
  id: {
    title: "Aturan Texas Hold\u2019em \u2014 Klien web PokerTH",
    desc: "Aturan lengkap Texas Hold\u2019em sebagaimana dimainkan di PokerTH: blind, empat ronde taruhan, Fold/Check/Call/Raise/All-In, side pot, dan peringkat kartu.",
    ldHeadline: "Aturan poker Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Cara bermain No-Limit Texas Hold\u2019em: blind, ronde taruhan, aksi, dan peringkat kartu, seperti di PokerTH.",
    body: "<h1>Aturan poker Texas Hold\u2019em</h1><p>Di PokerTH dimainkan No-Limit Texas Hold\u2019em, varian poker paling populer di dunia. Setiap pemain berusaha menyusun lima kartu terbaik dari dua kartu miliknya dan lima kartu bersama.</p><h2>Pembagian kartu dan blind</h2><p>Setiap ronde dimulai dengan dua taruhan wajib: pemain di sebelah kiri tombol dealer memasang <em>small blind</em>, pemain berikutnya memasang <em>big blind</em>. Lalu setiap pemain menerima dua kartu tertutup (<em>kartu sendiri</em>). Tombol dealer bergeser satu kursi searah jarum jam setiap ronde, dan di PokerTH blind naik pada interval tetap.</p><h2>Empat ronde taruhan</h2><ul><li><strong>Pre-flop</strong> \u2014 setelah menerima kartu sendiri, pemain bergiliran mulai dari sebelah kiri big blind.</li><li><strong>Flop</strong> \u2014 tiga kartu bersama dibuka, diikuti satu ronde taruhan.</li><li><strong>Turn</strong> \u2014 kartu bersama keempat dibagikan, diikuti ronde taruhan berikutnya.</li><li><strong>River</strong> \u2014 kartu bersama kelima dan terakhir dibagikan, diikuti ronde taruhan penutup.</li></ul><h2>Aksi</h2><ul><li><strong>Fold</strong> \u2014 melepas kartu beserta chip yang sudah dipertaruhkan.</li><li><strong>Check</strong> \u2014 melanjutkan tanpa bertaruh (hanya jika belum ada yang bertaruh di ronde ini).</li><li><strong>Call</strong> \u2014 menyamai taruhan tertinggi saat ini.</li><li><strong>Raise</strong> \u2014 menaikkan taruhan saat ini. Di No-Limit, sebesar apa pun hingga seluruh tumpukan chip Anda.</li><li><strong>All-In</strong> \u2014 mempertaruhkan semua chip. Jika pemain lain terus bertaruh di atas itu, terbentuk side pot, sehingga Anda hanya bisa memenangkan bagian pot yang Anda ikuti.</li></ul><h2>Showdown</h2><p>Jika setelah ronde taruhan di river masih ada dua pemain atau lebih, kartu dibuka. Kombinasi lima kartu terbaik dari tujuh kartu yang tersedia (dua kartu sendiri + lima kartu bersama) memenangkan pot. Kartu yang sama kuat membagi pot.</p><h2>Peringkat kartu, dari terkuat ke terlemah</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10 dengan jenis yang sama.</li><li><strong>Straight flush</strong> \u2014 lima kartu berurutan dengan jenis yang sama.</li><li><strong>Four of a kind</strong> \u2014 empat kartu bernilai sama.</li><li><strong>Full house</strong> \u2014 tiga kartu sama ditambah sepasang.</li><li><strong>Flush</strong> \u2014 lima kartu dengan jenis yang sama.</li><li><strong>Straight</strong> \u2014 lima kartu berurutan dengan jenis berbeda.</li><li><strong>Three of a kind</strong> \u2014 tiga kartu bernilai sama.</li><li><strong>Dua pasang</strong> \u2014 dua pasangan berbeda.</li><li><strong>Satu pasang</strong> \u2014 dua kartu bernilai sama.</li><li><strong>Kartu tertinggi</strong> \u2014 tidak satu pun di atas; kartu tertinggi yang menentukan.</li></ol><h2>Turnamen di PokerTH</h2><p>Permainan di PokerTH berbentuk turnamen sit-and-go: semua mulai dengan jumlah chip yang sama, blind naik seiring waktu, dan pemain terakhir yang masih punya chip menang. Anda bisa berlatih luring melawan komputer, bermain lewat LAN atau server pribadi, atau bergabung ke jaringan resmi pokerth.net dengan peringkat musimannya.</p>" },
  'pt-PT': {
    title: "Regras do Texas Hold\u2019em \u2014 Cliente web do PokerTH",
    desc: "Regras completas do Texas Hold\u2019em tal como se joga no PokerTH: blinds, as quatro rondas de apostas, Fold/Check/Call/Raise/All-In, side pots e ranking das m\u00e3os.",
    ldHeadline: "Regras do p\u00f3quer Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Como jogar No-Limit Texas Hold\u2019em: blinds, rondas de apostas, a\u00e7\u00f5es e ranking das m\u00e3os, tal como no PokerTH.",
    body: "<h1>Regras do p\u00f3quer Texas Hold\u2019em</h1><p>No PokerTH joga-se No-Limit Texas Hold\u2019em, a variante de p\u00f3quer mais popular do mundo. Cada jogador tenta formar a melhor m\u00e3o de cinco cartas a partir de duas cartas pr\u00f3prias e cinco cartas comunit\u00e1rias.</p><h2>A distribui\u00e7\u00e3o e os blinds</h2><p>Cada m\u00e3o come\u00e7a com duas apostas obrigat\u00f3rias: o jogador \u00e0 esquerda do bot\u00e3o do dealer paga o <em>small blind</em> e o seguinte, o <em>big blind</em>. Depois cada jogador recebe duas cartas viradas para baixo (as <em>cartas fechadas</em>). O bot\u00e3o avan\u00e7a um lugar no sentido dos ponteiros do rel\u00f3gio ap\u00f3s cada m\u00e3o, e no PokerTH os blinds sobem em intervalos regulares.</p><h2>As quatro rondas de apostas</h2><ul><li><strong>Pre-flop</strong> \u2014 depois de receberem as cartas fechadas, os jogadores jogam por ordem, a come\u00e7ar \u00e0 esquerda do big blind.</li><li><strong>Flop</strong> \u2014 s\u00e3o abertas tr\u00eas cartas comunit\u00e1rias, seguidas de uma ronda de apostas.</li><li><strong>Turn</strong> \u2014 \u00e9 distribu\u00edda uma quarta carta comunit\u00e1ria, seguida de outra ronda de apostas.</li><li><strong>River</strong> \u2014 \u00e9 distribu\u00edda a quinta e \u00faltima carta comunit\u00e1ria, seguida da ronda de apostas final.</li></ul><h2>As a\u00e7\u00f5es</h2><ul><li><strong>Fold</strong> \u2014 desistir da m\u00e3o e das fichas j\u00e1 apostadas.</li><li><strong>Check</strong> \u2014 passar a vez sem apostar (s\u00f3 se ningu\u00e9m tiver apostado na ronda atual).</li><li><strong>Call</strong> \u2014 igualar a aposta mais alta do momento.</li><li><strong>Raise</strong> \u2014 subir a aposta atual. No No-Limit, qualquer valor at\u00e9 \u00e0 totalidade do seu stack.</li><li><strong>All-In</strong> \u2014 apostar todas as suas fichas. Se os outros continuarem a apostar acima disso, s\u00e3o criados side pots, pelo que s\u00f3 pode ganhar a parte do pote para a qual contribuiu.</li></ul><h2>O showdown</h2><p>Se restarem dois ou mais jogadores ap\u00f3s a ronda de apostas do river, as m\u00e3os s\u00e3o reveladas. A melhor combina\u00e7\u00e3o de cinco cartas entre as sete dispon\u00edveis (duas fechadas + cinco comunit\u00e1rias) leva o pote. M\u00e3os iguais dividem o pote.</p><h2>Ranking das m\u00e3os, da mais forte \u00e0 mais fraca</h2><ol><li><strong>Royal Flush</strong> \u2014 A K Q J 10, todas do mesmo naipe.</li><li><strong>Straight Flush</strong> \u2014 cinco cartas seguidas do mesmo naipe.</li><li><strong>Poker</strong> \u2014 quatro cartas do mesmo valor.</li><li><strong>Full House</strong> \u2014 um trio mais um par.</li><li><strong>Flush</strong> \u2014 cinco cartas do mesmo naipe.</li><li><strong>Sequ\u00eancia</strong> \u2014 cinco cartas seguidas de naipes diferentes.</li><li><strong>Trio</strong> \u2014 tr\u00eas cartas do mesmo valor.</li><li><strong>Dois pares</strong> \u2014 dois pares diferentes.</li><li><strong>Um par</strong> \u2014 duas cartas do mesmo valor.</li><li><strong>Carta alta</strong> \u2014 nada do que est\u00e1 acima; decide a carta mais alta.</li></ol><h2>Os torneios no PokerTH</h2><p>As partidas do PokerTH s\u00e3o torneios ao estilo sit-and-go: todos come\u00e7am com o mesmo stack, os blinds sobem com o tempo e vence o \u00faltimo jogador com fichas. Pode treinar offline contra advers\u00e1rios controlados pelo computador, jogar em LAN ou num servidor privado, ou entrar na rede oficial pokerth.net com as suas classifica\u00e7\u00f5es por temporada.</p>" },
  ca: {
    title: "Regles del Texas Hold\u2019em \u2014 Client web de PokerTH",
    desc: "Regles completes del Texas Hold\u2019em tal com es juga a PokerTH: cegues, les quatre rondes d\u2019apostes, Fold/Check/Call/Raise/All-In, pots secundaris i r\u00e0nquing de mans.",
    ldHeadline: "Regles del p\u00f2quer Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Com jugar al No-Limit Texas Hold\u2019em: cegues, rondes d\u2019apostes, accions i r\u00e0nquing de mans, tal com a PokerTH.",
    body: "<h1>Regles del p\u00f2quer Texas Hold\u2019em</h1><p>A PokerTH s\u2019hi juga al No-Limit Texas Hold\u2019em, la variant de p\u00f2quer m\u00e9s popular del m\u00f3n. Cada jugador mira de formar la millor m\u00e0 de cinc cartes a partir de dues cartes pr\u00f2pies i cinc cartes comunit\u00e0ries.</p><h2>El repartiment i les cegues</h2><p>Cada m\u00e0 comen\u00e7a amb dues apostes obligat\u00f2ries: el jugador a l\u2019esquerra del bot\u00f3 de repartidor posa la <em>cega petita</em> i el seg\u00fcent, la <em>cega gran</em>. Tot seguit cada jugador rep dues cartes de cara avall (les <em>cartes pr\u00f2pies</em>). El bot\u00f3 avan\u00e7a un lloc en el sentit de les agulles del rellotge despr\u00e9s de cada m\u00e0, i a PokerTH les cegues pugen a intervals regulars.</p><h2>Les quatre rondes d\u2019apostes</h2><ul><li><strong>Pre-flop</strong> \u2014 un cop rebudes les cartes pr\u00f2pies, els jugadors actuen per torns, comen\u00e7ant a l\u2019esquerra de la cega gran.</li><li><strong>Flop</strong> \u2014 es reparteixen tres cartes comunit\u00e0ries de cara amunt, seguides d\u2019una ronda d\u2019apostes.</li><li><strong>Turn</strong> \u2014 es reparteix una quarta carta comunit\u00e0ria, seguida d\u2019una altra ronda d\u2019apostes.</li><li><strong>River</strong> \u2014 es reparteix la cinquena i \u00faltima carta comunit\u00e0ria, seguida de la ronda d\u2019apostes final.</li></ul><h2>Les accions</h2><ul><li><strong>Fold</strong> \u2014 abandonar la m\u00e0 i les fitxes ja apostades.</li><li><strong>Check</strong> \u2014 passar sense apostar (nom\u00e9s si ning\u00fa no ha apostat en la ronda actual).</li><li><strong>Call</strong> \u2014 igualar l\u2019aposta m\u00e9s alta del moment.</li><li><strong>Raise</strong> \u2014 apujar l\u2019aposta actual. Al No-Limit, qualsevol quantitat fins a tot el teu stack.</li><li><strong>All-In</strong> \u2014 apostar totes les teves fitxes. Si els altres continuen apostant per damunt, es creen pots secundaris, de manera que nom\u00e9s pots guanyar la part del pot a la qual has contribu\u00eft.</li></ul><h2>El showdown</h2><p>Si despr\u00e9s de la ronda d\u2019apostes del river queden dos jugadors o m\u00e9s, les mans es mostren. La millor combinaci\u00f3 de cinc cartes d\u2019entre les set disponibles (dues de pr\u00f2pies + cinc de comunit\u00e0ries) guanya el pot. Les mans iguals se\u2019l reparteixen.</p><h2>R\u00e0nquing de mans, de la m\u00e9s forta a la m\u00e9s fluixa</h2><ol><li><strong>Escala reial</strong> \u2014 A K Q J 10, totes del mateix pal.</li><li><strong>Escala de color</strong> \u2014 cinc cartes consecutives del mateix pal.</li><li><strong>P\u00f2quer</strong> \u2014 quatre cartes del mateix valor.</li><li><strong>Full</strong> \u2014 un trio m\u00e9s una parella.</li><li><strong>Color</strong> \u2014 cinc cartes del mateix pal.</li><li><strong>Escala</strong> \u2014 cinc cartes consecutives de pals diferents.</li><li><strong>Trio</strong> \u2014 tres cartes del mateix valor.</li><li><strong>Doble parella</strong> \u2014 dues parelles diferents.</li><li><strong>Parella</strong> \u2014 dues cartes del mateix valor.</li><li><strong>Carta alta</strong> \u2014 res del que hi ha m\u00e9s amunt; decideix la carta m\u00e9s alta.</li></ol><h2>Els tornejos a PokerTH</h2><p>Les partides de PokerTH s\u00f3n tornejos de tipus sit-and-go: tothom comen\u00e7a amb el mateix stack, les cegues pugen amb el temps i guanya l\u2019\u00faltim jugador que conserva fitxes. Pots entrenar-te fora de l\u00ednia contra adversaris controlats per l\u2019ordinador, jugar en LAN o en un servidor privat, o unir-te a la xarxa oficial pokerth.net amb les seves classificacions per temporada.</p>" },
  gl: {
    title: "Regras do Texas Hold\u2019em \u2014 Cliente web de PokerTH",
    desc: "Regras completas do Texas Hold\u2019em tal e como se xoga en PokerTH: cegas, as catro rondas de apostas, Fold/Check/Call/Raise/All-In, potes secundarios e clasificaci\u00f3n das mans.",
    ldHeadline: "Regras do p\u00f3ker Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Como xogar ao No-Limit Texas Hold\u2019em: cegas, rondas de apostas, acci\u00f3ns e clasificaci\u00f3n das mans, tal e como en PokerTH.",
    body: "<h1>Regras do p\u00f3ker Texas Hold\u2019em</h1><p>En PokerTH x\u00f3gase ao No-Limit Texas Hold\u2019em, a variante de p\u00f3ker m\u00e1is popular do mundo. Cada xogador tenta formar a mellor man de cinco cartas a partir de d\u00faas cartas propias e cinco cartas comunitarias.</p><h2>O reparto e as cegas</h2><p>Cada man comeza con d\u00faas apostas obrigatorias: o xogador \u00e1 esquerda do bot\u00f3n de repartidor pon a <em>cega pequena</em> e o seguinte, a <em>cega grande</em>. Despois cada xogador recibe d\u00faas cartas boca abaixo (as <em>cartas propias</em>). O bot\u00f3n avanza un asento no sentido das agullas do reloxo tras cada man, e en PokerTH as cegas soben a intervalos regulares.</p><h2>As catro rondas de apostas</h2><ul><li><strong>Pre-flop</strong> \u2014 tras recibiren as cartas propias, os xogadores act\u00faan por quendas, comezando \u00e1 esquerda da cega grande.</li><li><strong>Flop</strong> \u2014 rep\u00e1rtense tres cartas comunitarias boca arriba, seguidas dunha ronda de apostas.</li><li><strong>Turn</strong> \u2014 rep\u00e1rtese unha cuarta carta comunitaria, seguida doutra ronda de apostas.</li><li><strong>River</strong> \u2014 rep\u00e1rtese a quinta e \u00faltima carta comunitaria, seguida da ronda de apostas final.</li></ul><h2>As acci\u00f3ns</h2><ul><li><strong>Fold</strong> \u2014 abandonar a man e as fichas xa apostadas.</li><li><strong>Check</strong> \u2014 pasar sen apostar (s\u00f3 se ningu\u00e9n apostou na ronda actual).</li><li><strong>Call</strong> \u2014 igualar a aposta m\u00e1is alta do momento.</li><li><strong>Raise</strong> \u2014 subir a aposta actual. No No-Limit, calquera cantidade ata todo o teu stack.</li><li><strong>All-In</strong> \u2014 apostar todas as t\u00faas fichas. Se os demais seguen apostando por riba, cr\u00e9anse potes secundarios, de xeito que s\u00f3 podes ga\u00f1ar a parte do pote \u00e1 que contribu\u00edches.</li></ul><h2>O showdown</h2><p>Se tras a ronda de apostas do river quedan dous ou m\u00e1is xogadores, as mans am\u00f3sanse. A mellor combinaci\u00f3n de cinco cartas entre as sete dispo\u00f1ibles (d\u00faas propias + cinco comunitarias) ga\u00f1a o pote. As mans iguais rep\u00e1rteno.</p><h2>Clasificaci\u00f3n das mans, da m\u00e1is forte \u00e1 m\u00e1is feble</h2><ol><li><strong>Escaleira real</strong> \u2014 A K Q J 10, todas do mesmo pau.</li><li><strong>Escaleira de cor</strong> \u2014 cinco cartas consecutivas do mesmo pau.</li><li><strong>P\u00f3ker</strong> \u2014 catro cartas do mesmo valor.</li><li><strong>Full</strong> \u2014 un tr\u00edo m\u00e1is unha parella.</li><li><strong>Cor</strong> \u2014 cinco cartas do mesmo pau.</li><li><strong>Escaleira</strong> \u2014 cinco cartas consecutivas de paus diferentes.</li><li><strong>Tr\u00edo</strong> \u2014 tres cartas do mesmo valor.</li><li><strong>Dobre parella</strong> \u2014 d\u00faas parellas diferentes.</li><li><strong>Parella</strong> \u2014 d\u00faas cartas do mesmo valor.</li><li><strong>Carta alta</strong> \u2014 nada do anterior; decide a carta m\u00e1is alta.</li></ol><h2>Os torneos en PokerTH</h2><p>As partidas de PokerTH son torneos de tipo sit-and-go: todos comezan co mesmo stack, as cegas soben co tempo e ga\u00f1a o \u00faltimo xogador que conserva fichas. Podes adestrar sen conexi\u00f3n contra adversarios controlados polo ordenador, xogar en LAN ou nun servidor privado, ou unirte \u00e1 rede oficial pokerth.net coas s\u00faas clasificaci\u00f3ns por tempada.</p>" },
  lt: {
    title: "Texas Hold\u2019em taisykl\u0117s \u2014 PokerTH \u017einiatinklio klientas",
    desc: "I\u0161samios Texas Hold\u2019em taisykl\u0117s, kaip \u017eaid\u017eiama PokerTH: tamsieji statymai, keturi statym\u0173 ratai, Fold/Check/Call/Raise/All-In, \u0161alutiniai bankai ir derini\u0173 eili\u0161kumas.",
    ldHeadline: "Texas Hold\u2019em pokerio taisykl\u0117s \u2014 PokerTH",
    ldDesc: "Kaip \u017eaisti Texas Hold\u2019em be limito: tamsieji statymai, statym\u0173 ratai, veiksmai ir derini\u0173 eili\u0161kumas, kaip PokerTH.",
    body: "<h1>Texas Hold\u2019em pokerio taisykl\u0117s</h1><p>PokerTH \u017eaid\u017eiamas Texas Hold\u2019em be limito \u2014 populiariausia pokerio atmaina pasaulyje. Kiekvienas \u017eaid\u0117jas stengiasi sudaryti geriausi\u0105 penki\u0173 kort\u0173 derin\u012f i\u0161 dviej\u0173 savo ir penki\u0173 bendr\u0173 kort\u0173.</p><h2>Dalijimas ir tamsieji statymai</h2><p>Kiekvienas i\u0161dalijimas prasideda dviem privalomais statymais: \u017eaid\u0117jas dalytojo \u017eetono kair\u0117je deda <em>ma\u017e\u0105j\u012f tams\u0173j\u012f</em>, kitas \u2014 <em>did\u012fj\u012f tams\u0173j\u012f</em>. Paskui kiekvienas \u017eaid\u0117jas gauna dvi u\u017everstas kortas (<em>savas kortas</em>). Po kiekvieno i\u0161dalijimo \u017eetonas pasislenka viena vieta pagal laikrod\u017eio rodykl\u0119, o PokerTH tamsieji statymai kyla reguliariais intervalais.</p><h2>Keturi statym\u0173 ratai</h2><ul><li><strong>Pre-flop</strong> \u2014 gav\u0119 savas kortas, \u017eaid\u0117jai eina i\u0161 eil\u0117s, pradedant nuo did\u017eiojo tamsiojo kair\u0117s.</li><li><strong>Flop</strong> \u2014 atver\u010diamos trys bendros kortos, po to vyksta statym\u0173 ratas.</li><li><strong>Turn</strong> \u2014 i\u0161dalijama ketvirta bendra korta ir vyksta dar vienas statym\u0173 ratas.</li><li><strong>River</strong> \u2014 i\u0161dalijama penkta, paskutin\u0117 bendra korta ir vyksta baigiamasis statym\u0173 ratas.</li></ul><h2>Veiksmai</h2><ul><li><strong>Fold</strong> \u2014 atsisakyti derinio ir jau pastatyt\u0173 \u017eeton\u0173.</li><li><strong>Check</strong> \u2014 perduoti eil\u0119 nestatant (tik jei \u0161iame rate dar niekas nestat\u0117).</li><li><strong>Call</strong> \u2014 atsakyti \u012f did\u017eiausi\u0105 esam\u0105 statym\u0105.</li><li><strong>Raise</strong> \u2014 pakelti esam\u0105 statym\u0105. Be limito \u2014 bet kokia suma iki viso savo korteli\u0173 kiekio.</li><li><strong>All-In</strong> \u2014 pastatyti visus savo \u017eetonus. Jei kiti stato daugiau, sudaromi \u0161alutiniai bankai, tod\u0117l laim\u0117ti galima tik t\u0105 banko dal\u012f, prie kurios prisid\u0117jote.</li></ul><h2>Kort\u0173 atvertimas</h2><p>Jei po statym\u0173 rato prie river lieka du ar daugiau \u017eaid\u0117j\u0173, kortos atver\u010diamos. Geriausias penki\u0173 kort\u0173 derinys i\u0161 septyni\u0173 turim\u0173 (dvi savos + penkios bendros) laimi bank\u0105. Vienodi deriniai bank\u0105 dalijasi.</p><h2>Derini\u0173 eili\u0161kumas, nuo stipriausio iki silpniausio</h2><ol><li><strong>Karali\u0161koji eil\u0117</strong> \u2014 A K Q J 10 tos pa\u010dios r\u016b\u0161ies.</li><li><strong>Eil\u0117 su r\u016b\u0161imi</strong> \u2014 penkios i\u0161 eil\u0117s einan\u010dios tos pa\u010dios r\u016b\u0161ies kortos.</li><li><strong>Kalad\u0117</strong> \u2014 keturios tos pa\u010dios vert\u0117s kortos.</li><li><strong>Pilnas namas</strong> \u2014 trejetas ir pora.</li><li><strong>R\u016b\u0161is</strong> \u2014 penkios tos pa\u010dios r\u016b\u0161ies kortos.</li><li><strong>Eil\u0117</strong> \u2014 penkios i\u0161 eil\u0117s einan\u010dios skirting\u0173 r\u016b\u0161i\u0173 kortos.</li><li><strong>Trejetas</strong> \u2014 trys tos pa\u010dios vert\u0117s kortos.</li><li><strong>Dvi poros</strong> \u2014 dvi skirtingos poros.</li><li><strong>Pora</strong> \u2014 dvi tos pa\u010dios vert\u0117s kortos.</li><li><strong>Auk\u0161\u010diausia korta</strong> \u2014 n\u0117 vieno i\u0161 pirmiau min\u0117t\u0173; sprend\u017eia auk\u0161\u010diausia korta.</li></ol><h2>Turnyrai PokerTH</h2><p>PokerTH \u017eaidimai \u2014 sit-and-go tipo turnyrai: visi pradeda su vienodu \u017eeton\u0173 kiekiu, tamsieji statymai laikui b\u0117gant kyla, o laimi paskutinis \u017eaid\u0117jas, turintis \u017eeton\u0173. Galite treniruotis neprisijung\u0119 prie\u0161 kompiuterio var\u017eovus, \u017eaisti vietiniame tinkle ar savo serveryje arba prisijungti prie oficialaus pokerth.net tinklo su sezono reitingais.</p>" },
  sr: {
    title: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019ema \u2014 PokerTH \u0432\u0435\u0431 \u043a\u043b\u0438\u0458\u0435\u043d\u0442",
    desc: "\u041f\u043e\u0442\u043f\u0443\u043d\u0430 \u043f\u0440\u0430\u0432\u0438\u043b\u0430 Texas Hold\u2019ema \u043e\u043d\u0430\u043a\u043e \u043a\u0430\u043a\u043e \u0441\u0435 \u0438\u0433\u0440\u0430 \u0443 PokerTH-\u0443: \u0431\u043b\u0438\u043d\u0434\u043e\u0432\u0438, \u0447\u0435\u0442\u0438\u0440\u0438 \u043a\u0440\u0443\u0433\u0430 \u043a\u043b\u0430\u0452\u0435\u045a\u0430, Fold/Check/Call/Raise/All-In, \u0441\u043f\u043e\u0440\u0435\u0434\u043d\u0438 \u043f\u043e\u0442\u043e\u0432\u0438 \u0438 \u0458\u0430\u0447\u0438\u043d\u0430 \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u0458\u0430.",
    ldHeadline: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u043f\u043e\u043a\u0435\u0440\u0430 Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "\u041a\u0430\u043a\u043e \u0441\u0435 \u0438\u0433\u0440\u0430 No-Limit Texas Hold\u2019em: \u0431\u043b\u0438\u043d\u0434\u043e\u0432\u0438, \u043a\u0440\u0443\u0433\u043e\u0432\u0438 \u043a\u043b\u0430\u0452\u0435\u045a\u0430, \u043f\u043e\u0442\u0435\u0437\u0438 \u0438 \u0458\u0430\u0447\u0438\u043d\u0430 \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u0458\u0430, \u043a\u0430\u043e \u0443 PokerTH-\u0443.",
    body: "<h1>\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u043f\u043e\u043a\u0435\u0440\u0430 Texas Hold\u2019em</h1><p>\u0423 PokerTH-\u0443 \u0441\u0435 \u0438\u0433\u0440\u0430 No-Limit Texas Hold\u2019em, \u043d\u0430\u0458\u043f\u043e\u043f\u0443\u043b\u0430\u0440\u043d\u0438\u0458\u0430 \u0432\u0430\u0440\u0438\u0458\u0430\u043d\u0442\u0430 \u043f\u043e\u043a\u0435\u0440\u0430 \u043d\u0430 \u0441\u0432\u0435\u0442\u0443. \u0421\u0432\u0430\u043a\u0438 \u0438\u0433\u0440\u0430\u0447 \u043f\u043e\u043a\u0443\u0448\u0430\u0432\u0430 \u0434\u0430 \u0441\u0430\u0441\u0442\u0430\u0432\u0438 \u043d\u0430\u0458\u0431\u043e\u0459\u0443 \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u0458\u0443 \u043e\u0434 \u043f\u0435\u0442 \u043a\u0430\u0440\u0430\u0442\u0430 \u043a\u043e\u0440\u0438\u0441\u0442\u0435\u045b\u0438 \u0434\u0432\u0435 \u0441\u0432\u043e\u0458\u0435 \u0438 \u043f\u0435\u0442 \u0437\u0430\u0458\u0435\u0434\u043d\u0438\u0447\u043a\u0438\u0445 \u043a\u0430\u0440\u0430\u0442\u0430.</p><h2>\u0414\u0435\u0459\u0435\u045a\u0435 \u0438 \u0431\u043b\u0438\u043d\u0434\u043e\u0432\u0438</h2><p>\u0421\u0432\u0430\u043a\u0430 \u0440\u0443\u043a\u0430 \u043f\u043e\u0447\u0438\u045a\u0435 \u0441\u0430 \u0434\u0432\u0430 \u043e\u0431\u0430\u0432\u0435\u0437\u043d\u0430 \u0443\u043b\u043e\u0433\u0430: \u0438\u0433\u0440\u0430\u0447 \u043b\u0435\u0432\u043e \u043e\u0434 \u0434\u0443\u0433\u043c\u0435\u0442\u0430 \u0434\u0435\u043b\u0438\u043e\u0446\u0430 \u0443\u043b\u0430\u0436\u0435 <em>\u043c\u0430\u043b\u0438 \u0431\u043b\u0438\u043d\u0434</em>, \u0430 \u0441\u043b\u0435\u0434\u0435\u045b\u0438 <em>\u0432\u0435\u043b\u0438\u043a\u0438 \u0431\u043b\u0438\u043d\u0434</em>. \u0417\u0430\u0442\u0438\u043c \u0441\u0432\u0430\u043a\u0438 \u0438\u0433\u0440\u0430\u0447 \u0434\u043e\u0431\u0438\u0458\u0430 \u0434\u0432\u0435 \u0437\u0430\u0442\u0432\u043e\u0440\u0435\u043d\u0435 \u043a\u0430\u0440\u0442\u0435 (<em>\u0441\u043e\u043f\u0441\u0442\u0432\u0435\u043d\u0435 \u043a\u0430\u0440\u0442\u0435</em>). \u0414\u0443\u0433\u043c\u0435 \u0441\u0435 \u043f\u043e\u0441\u043b\u0435 \u0441\u0432\u0430\u043a\u0435 \u0440\u0443\u043a\u0435 \u043f\u043e\u043c\u0435\u0440\u0430 \u0458\u0435\u0434\u043d\u043e \u043c\u0435\u0441\u0442\u043e \u0443 \u0441\u043c\u0435\u0440\u0443 \u043a\u0430\u0437\u0430\u0459\u043a\u0435 \u043d\u0430 \u0441\u0430\u0442\u0443, \u0430 \u0443 PokerTH-\u0443 \u0431\u043b\u0438\u043d\u0434\u043e\u0432\u0438 \u0440\u0430\u0441\u0442\u0443 \u0443 \u043f\u0440\u0430\u0432\u0438\u043b\u043d\u0438\u043c \u0440\u0430\u0437\u043c\u0430\u0446\u0438\u043c\u0430.</p><h2>\u0427\u0435\u0442\u0438\u0440\u0438 \u043a\u0440\u0443\u0433\u0430 \u043a\u043b\u0430\u0452\u0435\u045a\u0430</h2><ul><li><strong>Pre-flop</strong> \u2014 \u043d\u0430\u043a\u043e\u043d \u0448\u0442\u043e \u0434\u043e\u0431\u0438\u0458\u0443 \u0441\u043e\u043f\u0441\u0442\u0432\u0435\u043d\u0435 \u043a\u0430\u0440\u0442\u0435, \u0438\u0433\u0440\u0430\u0447\u0438 \u0438\u0433\u0440\u0430\u0458\u0443 \u0440\u0435\u0434\u043e\u043c, \u043f\u043e\u0447\u0435\u0432\u0448\u0438 \u043b\u0435\u0432\u043e \u043e\u0434 \u0432\u0435\u043b\u0438\u043a\u043e\u0433 \u0431\u043b\u0438\u043d\u0434\u0430.</li><li><strong>Flop</strong> \u2014 \u043e\u0442\u0432\u0430\u0440\u0430\u0458\u0443 \u0441\u0435 \u0442\u0440\u0438 \u0437\u0430\u0458\u0435\u0434\u043d\u0438\u0447\u043a\u0435 \u043a\u0430\u0440\u0442\u0435, \u043d\u0430\u043a\u043e\u043d \u0447\u0435\u0433\u0430 \u0441\u043b\u0435\u0434\u0438 \u043a\u0440\u0443\u0433 \u043a\u043b\u0430\u0452\u0435\u045a\u0430.</li><li><strong>Turn</strong> \u2014 \u0434\u0435\u043b\u0438 \u0441\u0435 \u0447\u0435\u0442\u0432\u0440\u0442\u0430 \u0437\u0430\u0458\u0435\u0434\u043d\u0438\u0447\u043a\u0430 \u043a\u0430\u0440\u0442\u0430, \u0430 \u0437\u0430\u0442\u0438\u043c \u0458\u043e\u0448 \u0458\u0435\u0434\u0430\u043d \u043a\u0440\u0443\u0433 \u043a\u043b\u0430\u0452\u0435\u045a\u0430.</li><li><strong>River</strong> \u2014 \u0434\u0435\u043b\u0438 \u0441\u0435 \u043f\u0435\u0442\u0430 \u0438 \u043f\u043e\u0441\u043b\u0435\u0434\u045a\u0430 \u0437\u0430\u0458\u0435\u0434\u043d\u0438\u0447\u043a\u0430 \u043a\u0430\u0440\u0442\u0430, \u0430 \u0437\u0430\u0442\u0438\u043c \u0437\u0430\u0432\u0440\u0448\u043d\u0438 \u043a\u0440\u0443\u0433 \u043a\u043b\u0430\u0452\u0435\u045a\u0430.</li></ul><h2>\u041f\u043e\u0442\u0435\u0437\u0438</h2><ul><li><strong>Fold</strong> \u2014 \u043e\u0434\u0443\u0441\u0442\u0430\u0442\u0438 \u043e\u0434 \u0440\u0443\u043a\u0435 \u0438 \u043e\u0434 \u0432\u0435\u045b \u0443\u043b\u043e\u0436\u0435\u043d\u0438\u0445 \u0436\u0435\u0442\u043e\u043d\u0430.</li><li><strong>Check</strong> \u2014 \u043f\u0440\u043e\u0441\u043b\u0435\u0434\u0438\u0442\u0438 \u0431\u0435\u0437 \u0443\u043b\u043e\u0433\u0430 (\u0441\u0430\u043c\u043e \u0430\u043a\u043e \u0443 \u0442\u0435\u043a\u0443\u045b\u0435\u043c \u043a\u0440\u0443\u0433\u0443 \u043d\u0438\u043a\u043e \u043d\u0438\u0458\u0435 \u0443\u043b\u0430\u0433\u0430\u043e).</li><li><strong>Call</strong> \u2014 \u0438\u0437\u0458\u0435\u0434\u043d\u0430\u0447\u0438\u0442\u0438 \u0442\u0440\u0435\u043d\u0443\u0442\u043d\u043e \u043d\u0430\u0458\u0432\u0435\u045b\u0438 \u0443\u043b\u043e\u0433.</li><li><strong>Raise</strong> \u2014 \u043f\u043e\u0432\u0438\u0441\u0438\u0442\u0438 \u0442\u0440\u0435\u043d\u0443\u0442\u043d\u0438 \u0443\u043b\u043e\u0433. \u0423 No-Limitu \u0431\u0438\u043b\u043e \u043a\u043e\u0458\u0438\u043c \u0438\u0437\u043d\u043e\u0441\u043e\u043c, \u0441\u0432\u0435 \u0434\u043e \u0446\u0435\u043b\u043e\u0433 \u0441\u0432\u043e\u0433 \u0441\u0442\u0435\u043a\u0430.</li><li><strong>All-In</strong> \u2014 \u0443\u043b\u043e\u0436\u0438\u0442\u0438 \u0441\u0432\u0435 \u0441\u0432\u043e\u0458\u0435 \u0436\u0435\u0442\u043e\u043d\u0435. \u0410\u043a\u043e \u043e\u0441\u0442\u0430\u043b\u0438 \u043d\u0430\u0441\u0442\u0430\u0432\u0459\u0430\u0458\u0443 \u0434\u0430 \u0443\u043b\u0430\u0436\u0443 \u0438\u0437\u043d\u0430\u0434 \u0442\u043e\u0433\u0430, \u0441\u0442\u0432\u0430\u0440\u0430\u0458\u0443 \u0441\u0435 \u0441\u043f\u043e\u0440\u0435\u0434\u043d\u0438 \u043f\u043e\u0442\u043e\u0432\u0438, \u043f\u0430 \u043c\u043e\u0436\u0435\u0442\u0435 \u043e\u0441\u0432\u043e\u0458\u0438\u0442\u0438 \u0441\u0430\u043c\u043e \u043e\u043d\u0430\u0458 \u0434\u0435\u043e \u043f\u043e\u0442\u0430 \u0443 \u043a\u043e\u0458\u0438 \u0441\u0442\u0435 \u0443\u043b\u043e\u0436\u0438\u043b\u0438.</li></ul><h2>\u041e\u0442\u0432\u0430\u0440\u0430\u045a\u0435 \u043a\u0430\u0440\u0430\u0442\u0430</h2><p>\u0410\u043a\u043e \u043f\u043e\u0441\u043b\u0435 \u043a\u0440\u0443\u0433\u0430 \u043a\u043b\u0430\u0452\u0435\u045a\u0430 \u043d\u0430 \u0440\u0438\u0432\u0435\u0440\u0443 \u043e\u0441\u0442\u0430\u043d\u0443 \u0434\u0432\u0430 \u0438\u043b\u0438 \u0432\u0438\u0448\u0435 \u0438\u0433\u0440\u0430\u0447\u0430, \u043a\u0430\u0440\u0442\u0435 \u0441\u0435 \u043e\u0442\u043a\u0440\u0438\u0432\u0430\u0458\u0443. \u041d\u0430\u0458\u0431\u043e\u0459\u0430 \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u0458\u0430 \u043e\u0434 \u043f\u0435\u0442 \u043a\u0430\u0440\u0430\u0442\u0430 \u043c\u0435\u0452\u0443 \u0441\u0435\u0434\u0430\u043c \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0438\u0445 (\u0434\u0432\u0435 \u0441\u043e\u043f\u0441\u0442\u0432\u0435\u043d\u0435 + \u043f\u0435\u0442 \u0437\u0430\u0458\u0435\u0434\u043d\u0438\u0447\u043a\u0438\u0445) \u043e\u0441\u0432\u0430\u0458\u0430 \u043f\u043e\u0442. \u0408\u0435\u0434\u043d\u0430\u043a\u0435 \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u0458\u0435 \u0434\u0435\u043b\u0435 \u043f\u043e\u0442.</p><h2>\u0408\u0430\u0447\u0438\u043d\u0430 \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u0458\u0430, \u043e\u0434 \u043d\u0430\u0458\u0458\u0430\u0447\u0435 \u043a\u0430 \u043d\u0430\u0458\u0441\u043b\u0430\u0431\u0438\u0458\u043e\u0458</h2><ol><li><strong>\u0420\u043e\u0458\u0430\u043b \u0444\u043b\u0435\u0448</strong> \u2014 A K Q J 10 \u0443 \u0438\u0441\u0442\u043e\u0458 \u0431\u043e\u0458\u0438.</li><li><strong>\u0421\u0442\u0440\u0435\u0458\u0442 \u0444\u043b\u0435\u0448</strong> \u2014 \u043f\u0435\u0442 \u0443\u0437\u0430\u0441\u0442\u043e\u043f\u043d\u0438\u0445 \u043a\u0430\u0440\u0430\u0442\u0430 \u0438\u0441\u0442\u0435 \u0431\u043e\u0458\u0435.</li><li><strong>\u041f\u043e\u043a\u0435\u0440</strong> \u2014 \u0447\u0435\u0442\u0438\u0440\u0438 \u043a\u0430\u0440\u0442\u0435 \u0438\u0441\u0442\u0435 \u0432\u0440\u0435\u0434\u043d\u043e\u0441\u0442\u0438.</li><li><strong>\u0424\u0443\u043b \u0445\u0430\u0443\u0441</strong> \u2014 \u0442\u0440\u0438\u043b\u0438\u043d\u0433 \u043f\u043b\u0443\u0441 \u043f\u0430\u0440.</li><li><strong>\u0424\u043b\u0435\u0448</strong> \u2014 \u043f\u0435\u0442 \u043a\u0430\u0440\u0430\u0442\u0430 \u0438\u0441\u0442\u0435 \u0431\u043e\u0458\u0435.</li><li><strong>\u041a\u0435\u043d\u0442\u0430</strong> \u2014 \u043f\u0435\u0442 \u0443\u0437\u0430\u0441\u0442\u043e\u043f\u043d\u0438\u0445 \u043a\u0430\u0440\u0430\u0442\u0430 \u0440\u0430\u0437\u043b\u0438\u0447\u0438\u0442\u0438\u0445 \u0431\u043e\u0458\u0430.</li><li><strong>\u0422\u0440\u0438\u043b\u0438\u043d\u0433</strong> \u2014 \u0442\u0440\u0438 \u043a\u0430\u0440\u0442\u0435 \u0438\u0441\u0442\u0435 \u0432\u0440\u0435\u0434\u043d\u043e\u0441\u0442\u0438.</li><li><strong>\u0414\u0432\u0430 \u043f\u0430\u0440\u0430</strong> \u2014 \u0434\u0432\u0430 \u0440\u0430\u0437\u043b\u0438\u0447\u0438\u0442\u0430 \u043f\u0430\u0440\u0430.</li><li><strong>\u041f\u0430\u0440</strong> \u2014 \u0434\u0432\u0435 \u043a\u0430\u0440\u0442\u0435 \u0438\u0441\u0442\u0435 \u0432\u0440\u0435\u0434\u043d\u043e\u0441\u0442\u0438.</li><li><strong>\u0412\u0438\u0441\u043e\u043a\u0430 \u043a\u0430\u0440\u0442\u0430</strong> \u2014 \u043d\u0438\u0448\u0442\u0430 \u043e\u0434 \u043d\u0430\u0432\u0435\u0434\u0435\u043d\u043e\u0433; \u043e\u0434\u043b\u0443\u0447\u0443\u0458\u0435 \u043d\u0430\u0458\u0432\u0438\u0448\u0430 \u043a\u0430\u0440\u0442\u0430.</li></ol><h2>\u0422\u0443\u0440\u043d\u0438\u0440\u0438 \u0443 PokerTH-\u0443</h2><p>\u041f\u0430\u0440\u0442\u0438\u0458\u0435 \u0443 PokerTH-\u0443 \u0441\u0443 \u0442\u0443\u0440\u043d\u0438\u0440\u0438 \u0443 sit-and-go \u0441\u0442\u0438\u043b\u0443: \u0441\u0432\u0438 \u043f\u043e\u0447\u0438\u045a\u0443 \u0441\u0430 \u0438\u0441\u0442\u0438\u043c \u0441\u0442\u0435\u043a\u043e\u043c, \u0431\u043b\u0438\u043d\u0434\u043e\u0432\u0438 \u0432\u0440\u0435\u043c\u0435\u043d\u043e\u043c \u0440\u0430\u0441\u0442\u0443, \u0430 \u043f\u043e\u0431\u0435\u0452\u0443\u0458\u0435 \u043f\u043e\u0441\u043b\u0435\u0434\u045a\u0438 \u0438\u0433\u0440\u0430\u0447 \u043a\u043e\u0458\u0438 \u0438\u043c\u0430 \u0436\u0435\u0442\u043e\u043d\u0435. \u041c\u043e\u0436\u0435\u0442\u0435 \u0432\u0435\u0436\u0431\u0430\u0442\u0438 \u043e\u0444\u043b\u0430\u0458\u043d \u043f\u0440\u043e\u0442\u0438\u0432 \u0440\u0430\u0447\u0443\u043d\u0430\u0440\u0441\u043a\u0438\u0445 \u043f\u0440\u043e\u0442\u0438\u0432\u043d\u0438\u043a\u0430, \u0438\u0433\u0440\u0430\u0442\u0438 \u043d\u0430 \u043b\u043e\u043a\u0430\u043b\u043d\u043e\u0458 \u043c\u0440\u0435\u0436\u0438 \u0438\u043b\u0438 \u0441\u043e\u043f\u0441\u0442\u0432\u0435\u043d\u043e\u043c \u0441\u0435\u0440\u0432\u0435\u0440\u0443, \u0438\u043b\u0438 \u0441\u0435 \u043f\u0440\u0438\u0434\u0440\u0443\u0436\u0438\u0442\u0438 \u0437\u0432\u0430\u043d\u0438\u0447\u043d\u043e\u0458 \u043c\u0440\u0435\u0436\u0438 pokerth.net \u0441\u0430 \u0441\u0435\u0437\u043e\u043d\u0441\u043a\u0438\u043c \u0440\u0430\u043d\u0433-\u043b\u0438\u0441\u0442\u0430\u043c\u0430.</p>" },
  af: {
    title: "Texas Hold\u2019em-re\u00ebls \u2014 PokerTH-webkli\u00ebnt",
    desc: "Volledige Texas Hold\u2019em-re\u00ebls soos dit in PokerTH gespeel word: blinds, die vier weddenskaprondtes, Fold/Check/Call/Raise/All-In, sypotte en handrangorde.",
    ldHeadline: "Texas Hold\u2019em-pokerre\u00ebls \u2014 PokerTH",
    ldDesc: "Hoe om No-Limit Texas Hold\u2019em te speel: blinds, weddenskaprondtes, aksies en handrangorde, soos in PokerTH.",
    body: "<h1>Texas Hold\u2019em-pokerre\u00ebls</h1><p>In PokerTH word No-Limit Texas Hold\u2019em gespeel, die gewildste pokervariant ter w\u00eareld. Elke speler probeer die beste hand van vyf kaarte saamstel uit twee eie kaarte en vyf gemeenskaplike kaarte.</p><h2>Die deel en die blinds</h2><p>Elke hand begin met twee verpligte insette: die speler links van die deler-knoppie plaas die <em>klein blind</em> en die volgende die <em>groot blind</em>. Daarna kry elke speler twee kaarte met die gesig na onder (die <em>eie kaarte</em>). Die knoppie skuif n\u00e1 elke hand een plek kloksgewys aan, en in PokerTH styg die blinds met gereelde tussenposes.</p><h2>Die vier weddenskaprondtes</h2><ul><li><strong>Pre-flop</strong> \u2014 nadat hulle die eie kaarte gekry het, speel die spelers om die beurt, links van die groot blind af.</li><li><strong>Flop</strong> \u2014 drie gemeenskaplike kaarte word oop neergel\u00ea, gevolg deur \u2019n weddenskaprondte.</li><li><strong>Turn</strong> \u2014 \u2019n vierde gemeenskaplike kaart word gedeel, gevolg deur nog \u2019n weddenskaprondte.</li><li><strong>River</strong> \u2014 die vyfde en laaste gemeenskaplike kaart word gedeel, gevolg deur die laaste weddenskaprondte.</li></ul><h2>Die aksies</h2><ul><li><strong>Fold</strong> \u2014 die hand en die fiches wat reeds ingesit is, prysgee.</li><li><strong>Check</strong> \u2014 aangee sonder om in te sit (net as niemand in die huidige rondte ingesit het nie).</li><li><strong>Call</strong> \u2014 die hoogste huidige inset gelykmaak.</li><li><strong>Raise</strong> \u2014 die huidige inset verhoog. In No-Limit met enige bedrag tot en met jou hele stapel.</li><li><strong>All-In</strong> \u2014 al jou fiches insit. As ander bo dit aanhou wed, ontstaan daar sypotte, sodat jy net die deel van die pot kan wen waartoe jy bygedra het.</li></ul><h2>Die wysing</h2><p>Bly daar n\u00e1 die weddenskaprondte op die river twee of meer spelers oor, word die hande gewys. Die beste kombinasie van vyf kaarte uit die sewe beskikbare (twee eie kaarte + vyf gemeenskaplikes) wen die pot. Gelyke hande deel die pot.</p><h2>Handrangorde, van sterkste tot swakste</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10, almal in dieselfde kleur.</li><li><strong>Straight flush</strong> \u2014 vyf opeenvolgende kaarte in dieselfde kleur.</li><li><strong>Vier eendersies</strong> \u2014 vier kaarte van dieselfde waarde.</li><li><strong>Volhuis</strong> \u2014 drie eendersies plus \u2019n paar.</li><li><strong>Flush</strong> \u2014 vyf kaarte in dieselfde kleur.</li><li><strong>Reeks</strong> \u2014 vyf opeenvolgende kaarte in gemengde kleure.</li><li><strong>Drie eendersies</strong> \u2014 drie kaarte van dieselfde waarde.</li><li><strong>Twee pare</strong> \u2014 twee verskillende pare.</li><li><strong>Een paar</strong> \u2014 twee kaarte van dieselfde waarde.</li><li><strong>Hoogste kaart</strong> \u2014 niks van bogenoemde nie; die hoogste kaart beslis.</li></ol><h2>Toernooie in PokerTH</h2><p>Wedstryde in PokerTH is toernooie in sit-and-go-styl: almal begin met dieselfde stapel, die blinds styg mettertyd, en die laaste speler met fiches wen. Jy kan vanlyn teen rekenaarteenstanders oefen, oor \u2019n LAN of op \u2019n private bediener speel, of by die amptelike pokerth.net-netwerk met sy seisoenranglyste aansluit.</p>" },
  ko: {
    title: "\ud14d\uc0ac\uc2a4 \ud640\ub364 \uaddc\uce59 \u2014 PokerTH \uc6f9 \ud074\ub77c\uc774\uc5b8\ud2b8",
    desc: "PokerTH\uc5d0\uc11c \ud50c\ub808\uc774\ud558\ub294 \ud14d\uc0ac\uc2a4 \ud640\ub364\uc758 \uc804\uccb4 \uaddc\uce59: \ube14\ub77c\uc778\ub4dc, \ub124 \ubc88\uc758 \ubca0\ud305 \ub77c\uc6b4\ub4dc, Fold/Check/Call/Raise/All-In, \uc0ac\uc774\ub4dc \ud31f, \uc871\ubcf4.",
    ldHeadline: "\ud14d\uc0ac\uc2a4 \ud640\ub364 \ud3ec\ucee4 \uaddc\uce59 \u2014 PokerTH",
    ldDesc: "\ub178\ub9ac\ubc0b \ud14d\uc0ac\uc2a4 \ud640\ub364 \ud50c\ub808\uc774 \ubc29\ubc95: \ube14\ub77c\uc778\ub4dc, \ubca0\ud305 \ub77c\uc6b4\ub4dc, \uc561\uc158, \uc871\ubcf4\ub97c PokerTH \uae30\uc900\uc73c\ub85c \uc124\uba85\ud569\ub2c8\ub2e4.",
    body: "<h1>\ud14d\uc0ac\uc2a4 \ud640\ub364 \ud3ec\ucee4 \uaddc\uce59</h1><p>PokerTH\uc5d0\uc11c\ub294 \uc138\uacc4\uc5d0\uc11c \uac00\uc7a5 \uc778\uae30 \uc788\ub294 \ud3ec\ucee4 \ubc29\uc2dd\uc778 \ub178\ub9ac\ubc0b \ud14d\uc0ac\uc2a4 \ud640\ub364\uc744 \ud50c\ub808\uc774\ud569\ub2c8\ub2e4. \uac01 \ud50c\ub808\uc774\uc5b4\ub294 \uc790\uc2e0\uc758 \uce74\ub4dc 2\uc7a5\uacfc \uacf5\uc720 \uce74\ub4dc 5\uc7a5\uc73c\ub85c \uac00\uc7a5 \uc88b\uc740 \ub2e4\uc12f \uc7a5\uc758 \uc870\ud569\uc744 \ub9cc\ub4ed\ub2c8\ub2e4.</p><h2>\uce74\ub4dc \ubc30\ubd84\uacfc \ube14\ub77c\uc778\ub4dc</h2><p>\ubaa8\ub4e0 \ud578\ub4dc\ub294 \ub450 \uac1c\uc758 \uc758\ubb34 \ubca0\ud305\uc73c\ub85c \uc2dc\uc791\ud569\ub2c8\ub2e4. \ub51c\ub7ec \ubc84\ud2bc \uc67c\ucabd \ud50c\ub808\uc774\uc5b4\uac00 <em>\uc2a4\ubab0 \ube14\ub77c\uc778\ub4dc</em>\ub97c, \uadf8\ub2e4\uc74c \ud50c\ub808\uc774\uc5b4\uac00 <em>\ube45 \ube14\ub77c\uc778\ub4dc</em>\ub97c \ub0c5\ub2c8\ub2e4. \uc774\uc5b4\uc11c \uac01 \ud50c\ub808\uc774\uc5b4\uc5d0\uac8c \ub4b7\uba74\uc774 \ubcf4\uc774\ub294 \uce74\ub4dc 2\uc7a5(<em>\ud640 \uce74\ub4dc</em>)\uc774 \ubc30\ubd84\ub429\ub2c8\ub2e4. \ubc84\ud2bc\uc740 \ub9e4 \ud578\ub4dc\ub9c8\ub2e4 \uc2dc\uacc4 \ubc29\ud5a5\uc73c\ub85c \ud55c \uc790\ub9ac\uc529 \uc774\ub3d9\ud558\uba70, PokerTH\uc5d0\uc11c\ub294 \ube14\ub77c\uc778\ub4dc\uac00 \uc77c\uc815 \uac04\uaca9\uc73c\ub85c \uc62c\ub77c\uac11\ub2c8\ub2e4.</p><h2>\ub124 \ubc88\uc758 \ubca0\ud305 \ub77c\uc6b4\ub4dc</h2><ul><li><strong>Pre-flop</strong>(\ud504\ub9ac\ud50c\ub78d) \u2014 \ud640 \uce74\ub4dc\ub97c \ubc1b\uc740 \ub4a4 \ube45 \ube14\ub77c\uc778\ub4dc \uc67c\ucabd\ubd80\ud130 \ucc28\ub840\ub300\ub85c \uc561\uc158\ud569\ub2c8\ub2e4.</li><li><strong>Flop</strong>(\ud50c\ub78d) \u2014 \uacf5\uc720 \uce74\ub4dc 3\uc7a5\uc774 \uc55e\uba74\uc73c\ub85c \uae54\ub9ac\uace0 \ubca0\ud305 \ub77c\uc6b4\ub4dc\uac00 \uc774\uc5b4\uc9d1\ub2c8\ub2e4.</li><li><strong>Turn</strong>(\ud134) \u2014 \ub124 \ubc88\uc9f8 \uacf5\uc720 \uce74\ub4dc\uac00 \ub098\uc624\uace0 \ub2e4\uc2dc \ubca0\ud305 \ub77c\uc6b4\ub4dc\uac00 \uc9c4\ud589\ub429\ub2c8\ub2e4.</li><li><strong>River</strong>(\ub9ac\ubc84) \u2014 \ub2e4\uc12f \ubc88\uc9f8\uc774\uc790 \ub9c8\uc9c0\ub9c9 \uacf5\uc720 \uce74\ub4dc\uac00 \ub098\uc624\uace0 \ub9c8\uc9c0\ub9c9 \ubca0\ud305 \ub77c\uc6b4\ub4dc\uac00 \uc9c4\ud589\ub429\ub2c8\ub2e4.</li></ul><h2>\uc561\uc158</h2><ul><li><strong>Fold</strong>(\ud3f4\ub4dc) \u2014 \ud578\ub4dc\ub97c \ud3ec\uae30\ud558\uace0 \uc774\ubbf8 \ubca0\ud305\ud55c \uce69\ub3c4 \ub118\uae41\ub2c8\ub2e4.</li><li><strong>Check</strong>(\uccb4\ud06c) \u2014 \ubca0\ud305 \uc5c6\uc774 \ucc28\ub840\ub97c \ub118\uae41\ub2c8\ub2e4(\ud574\ub2f9 \ub77c\uc6b4\ub4dc\uc5d0\uc11c \uc544\ubb34\ub3c4 \ubca0\ud305\ud558\uc9c0 \uc54a\uc740 \uacbd\uc6b0\uc5d0\ub9cc).</li><li><strong>Call</strong>(\ucf5c) \u2014 \ud604\uc7ac \uac00\uc7a5 \ub192\uc740 \ubca0\ud305 \uae08\uc561\uc5d0 \ub9de\ucda5\ub2c8\ub2e4.</li><li><strong>Raise</strong>(\ub808\uc774\uc988) \u2014 \ud604\uc7ac \ubca0\ud305\uc744 \uc62c\ub9bd\ub2c8\ub2e4. \ub178\ub9ac\ubc0b\uc5d0\uc11c\ub294 \ubcf4\uc720\ud55c \uce69 \uc804\ubd80\uae4c\uc9c0 \uac00\ub2a5\ud569\ub2c8\ub2e4.</li><li><strong>All-In</strong>(\uc62c\uc778) \u2014 \uac00\uc9c4 \uce69\uc744 \ubaa8\ub450 \uac81\ub2c8\ub2e4. \ub2e4\ub978 \ud50c\ub808\uc774\uc5b4\uac00 \uadf8 \uc774\uc0c1\uc73c\ub85c \uacc4\uc18d \ubca0\ud305\ud558\uba74 \uc0ac\uc774\ub4dc \ud31f\uc774 \ub9cc\ub4e4\uc5b4\uc838, \uc790\uc2e0\uc774 \ucc38\uc5ec\ud55c \ub9cc\ud07c\uc758 \ud31f\ub9cc \uac00\uc838\uac08 \uc218 \uc788\uc2b5\ub2c8\ub2e4.</li></ul><h2>\uc1fc\ub2e4\uc6b4</h2><p>\ub9ac\ubc84 \ubca0\ud305 \ub77c\uc6b4\ub4dc \ud6c4\uc5d0\ub3c4 \ub450 \uba85 \uc774\uc0c1\uc774 \ub0a8\uc544 \uc788\uc73c\uba74 \uce74\ub4dc\ub97c \uacf5\uac1c\ud569\ub2c8\ub2e4. \uc0ac\uc6a9\ud560 \uc218 \uc788\ub294 7\uc7a5(\ud640 \uce74\ub4dc 2\uc7a5 + \uacf5\uc720 \uce74\ub4dc 5\uc7a5)\uc73c\ub85c \ub9cc\ub4e0 \uac00\uc7a5 \uc88b\uc740 \ub2e4\uc12f \uc7a5 \uc870\ud569\uc774 \ud31f\uc744 \uac00\uc838\uac00\uace0, \uac19\uc740 \uc138\uae30\ub77c\uba74 \ud31f\uc744 \ub098\ub215\ub2c8\ub2e4.</p><h2>\uc871\ubcf4, \uac15\ud55c \uc21c\uc11c\ub300\ub85c</h2><ol><li><strong>\ub85c\uc5f4 \ud50c\ub7ec\uc2dc</strong> \u2014 \uac19\uc740 \ubb34\ub2ac\uc758 A K Q J 10.</li><li><strong>\uc2a4\ud2b8\ub808\uc774\ud2b8 \ud50c\ub7ec\uc2dc</strong> \u2014 \uac19\uc740 \ubb34\ub2ac\uc758 \uc5f0\uc18d\ub41c \ub2e4\uc12f \uc7a5.</li><li><strong>\ud3ec\uce74\ub4dc</strong> \u2014 \uac19\uc740 \uc22b\uc790 \ub124 \uc7a5.</li><li><strong>\ud480\ud558\uc6b0\uc2a4</strong> \u2014 \ud2b8\ub9ac\ud50c\uacfc \uc6d0\ud398\uc5b4.</li><li><strong>\ud50c\ub7ec\uc2dc</strong> \u2014 \uac19\uc740 \ubb34\ub2ac \ub2e4\uc12f \uc7a5.</li><li><strong>\uc2a4\ud2b8\ub808\uc774\ud2b8</strong> \u2014 \ubb34\ub2ac\uc640 \uc0c1\uad00\uc5c6\uc774 \uc5f0\uc18d\ub41c \ub2e4\uc12f \uc7a5.</li><li><strong>\ud2b8\ub9ac\ud50c</strong> \u2014 \uac19\uc740 \uc22b\uc790 \uc138 \uc7a5.</li><li><strong>\ud22c\ud398\uc5b4</strong> \u2014 \uc11c\ub85c \ub2e4\ub978 \ub450 \uac1c\uc758 \ud398\uc5b4.</li><li><strong>\uc6d0\ud398\uc5b4</strong> \u2014 \uac19\uc740 \uc22b\uc790 \ub450 \uc7a5.</li><li><strong>\ud558\uc774 \uce74\ub4dc</strong> \u2014 \uc704\uc758 \uc5b4\ub290 \uac83\ub3c4 \uc544\ub2d0 \ub54c, \uac00\uc7a5 \ub192\uc740 \uce74\ub4dc\ub85c \uc815\ud569\ub2c8\ub2e4.</li></ol><h2>PokerTH\uc758 \ud1a0\ub108\uba3c\ud2b8</h2><p>PokerTH\uc758 \uac8c\uc784\uc740 \uc2ef\uc564\uace0 \ubc29\uc2dd \ud1a0\ub108\uba3c\ud2b8\uc785\ub2c8\ub2e4. \ubaa8\ub450 \uac19\uc740 \uce69\uc73c\ub85c \uc2dc\uc791\ud558\uace0 \ube14\ub77c\uc778\ub4dc\ub294 \uc2dc\uac04\uc774 \uc9c0\ub098\uba74\uc11c \uc62c\ub77c\uac00\uba70, \ub9c8\uc9c0\ub9c9\uae4c\uc9c0 \uce69\uc744 \uac00\uc9c4 \ud50c\ub808\uc774\uc5b4\uac00 \uc774\uae41\ub2c8\ub2e4. \uc624\ud504\ub77c\uc778\uc5d0\uc11c \ucef4\ud4e8\ud130 \uc0c1\ub300\ub85c \uc5f0\uc2b5\ud558\uac70\ub098, LAN\uc774\ub098 \uac1c\uc778 \uc11c\ubc84\uc5d0\uc11c \ud50c\ub808\uc774\ud558\uac70\ub098, \uc2dc\uc98c \ub7ad\ud0b9\uc774 \uc788\ub294 \uacf5\uc2dd pokerth.net \ub124\ud2b8\uc6cc\ud06c\uc5d0 \ucc38\uc5ec\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.</p>" },
  vi: {
    title: "Lu\u1eadt Texas Hold\u2019em \u2014 \u1ee8ng d\u1ee5ng web PokerTH",
    desc: "Lu\u1eadt Texas Hold\u2019em \u0111\u1ea7y \u0111\u1ee7 nh\u01b0 c\u00e1ch ch\u01a1i trong PokerTH: ti\u1ec1n m\u00f9, b\u1ed1n v\u00f2ng c\u01b0\u1ee3c, Fold/Check/Call/Raise/All-In, pot ph\u1ee5 v\u00e0 th\u1ee9 h\u1ea1ng c\u00e1c b\u1ed9 b\u00e0i.",
    ldHeadline: "Lu\u1eadt poker Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "C\u00e1ch ch\u01a1i Texas Hold\u2019em kh\u00f4ng gi\u1edbi h\u1ea1n: ti\u1ec1n m\u00f9, c\u00e1c v\u00f2ng c\u01b0\u1ee3c, h\u00e0nh \u0111\u1ed9ng v\u00e0 th\u1ee9 h\u1ea1ng b\u1ed9 b\u00e0i, nh\u01b0 trong PokerTH.",
    body: "<h1>Lu\u1eadt poker Texas Hold\u2019em</h1><p>PokerTH ch\u01a1i Texas Hold\u2019em kh\u00f4ng gi\u1edbi h\u1ea1n, bi\u1ebfn th\u1ec3 poker ph\u1ed5 bi\u1ebfn nh\u1ea5t th\u1ebf gi\u1edbi. M\u1ed7i ng\u01b0\u1eddi ch\u01a1i c\u1ed1 g\u1eafng t\u1ea1o b\u1ed9 n\u0103m l\u00e1 m\u1ea1nh nh\u1ea5t t\u1eeb hai l\u00e1 ri\u00eang v\u00e0 n\u0103m l\u00e1 chung.</p><h2>Chia b\u00e0i v\u00e0 ti\u1ec1n m\u00f9</h2><p>M\u1ed7i v\u00e1n b\u1eaft \u0111\u1ea7u b\u1eb1ng hai kho\u1ea3n c\u01b0\u1ee3c b\u1eaft bu\u1ed9c: ng\u01b0\u1eddi ch\u01a1i b\u00ean tr\u00e1i n\u00fat chia b\u00e0i \u0111\u1eb7t <em>ti\u1ec1n m\u00f9 nh\u1ecf</em>, ng\u01b0\u1eddi k\u1ebf ti\u1ebfp \u0111\u1eb7t <em>ti\u1ec1n m\u00f9 l\u1edbn</em>. Sau \u0111\u00f3 m\u1ed7i ng\u01b0\u1eddi nh\u1eadn hai l\u00e1 \u00fap (<em>b\u00e0i ri\u00eang</em>). N\u00fat chia b\u00e0i d\u1ecbch sang ph\u1ea3i m\u1ed9t ch\u1ed7 theo chi\u1ec1u kim \u0111\u1ed3ng h\u1ed3 sau m\u1ed7i v\u00e1n, v\u00e0 trong PokerTH ti\u1ec1n m\u00f9 t\u0103ng \u0111\u1ec1u theo th\u1eddi gian.</p><h2>B\u1ed1n v\u00f2ng c\u01b0\u1ee3c</h2><ul><li><strong>Pre-flop</strong> \u2014 sau khi nh\u1eadn b\u00e0i ri\u00eang, ng\u01b0\u1eddi ch\u01a1i h\u00e0nh \u0111\u1ed9ng l\u1ea7n l\u01b0\u1ee3t, b\u1eaft \u0111\u1ea7u t\u1eeb b\u00ean tr\u00e1i ti\u1ec1n m\u00f9 l\u1edbn.</li><li><strong>Flop</strong> \u2014 ba l\u00e1 b\u00e0i chung \u0111\u01b0\u1ee3c l\u1eadt ng\u1eeda, ti\u1ebfp theo l\u00e0 m\u1ed9t v\u00f2ng c\u01b0\u1ee3c.</li><li><strong>Turn</strong> \u2014 l\u00e1 b\u00e0i chung th\u1ee9 t\u01b0 \u0111\u01b0\u1ee3c chia, r\u1ed3i th\u00eam m\u1ed9t v\u00f2ng c\u01b0\u1ee3c n\u1eefa.</li><li><strong>River</strong> \u2014 l\u00e1 b\u00e0i chung th\u1ee9 n\u0103m v\u00e0 cu\u1ed1i c\u00f9ng \u0111\u01b0\u1ee3c chia, r\u1ed3i \u0111\u1ebfn v\u00f2ng c\u01b0\u1ee3c cu\u1ed1i.</li></ul><h2>C\u00e1c h\u00e0nh \u0111\u1ed9ng</h2><ul><li><strong>Fold</strong> \u2014 b\u1ecf b\u00e0i v\u00e0 m\u1ea5t s\u1ed1 chip \u0111\u00e3 c\u01b0\u1ee3c.</li><li><strong>Check</strong> \u2014 nh\u01b0\u1eddng l\u01b0\u1ee3t m\u00e0 kh\u00f4ng c\u01b0\u1ee3c (ch\u1ec9 khi ch\u01b0a ai c\u01b0\u1ee3c trong v\u00f2ng n\u00e0y).</li><li><strong>Call</strong> \u2014 theo m\u1ee9c c\u01b0\u1ee3c cao nh\u1ea5t hi\u1ec7n t\u1ea1i.</li><li><strong>Raise</strong> \u2014 t\u0103ng m\u1ee9c c\u01b0\u1ee3c hi\u1ec7n t\u1ea1i. \u1ede th\u1ec3 th\u1ee9c kh\u00f4ng gi\u1edbi h\u1ea1n, t\u0103ng bao nhi\u00eau c\u0169ng \u0111\u01b0\u1ee3c, t\u1ed1i \u0111a l\u00e0 to\u00e0n b\u1ed9 chip c\u1ee7a b\u1ea1n.</li><li><strong>All-In</strong> \u2014 \u0111\u1eb7t h\u1ebft s\u1ed1 chip \u0111ang c\u00f3. N\u1ebfu ng\u01b0\u1eddi kh\u00e1c ti\u1ebfp t\u1ee5c c\u01b0\u1ee3c cao h\u01a1n, pot ph\u1ee5 s\u1ebd \u0111\u01b0\u1ee3c t\u1ea1o ra, n\u00ean b\u1ea1n ch\u1ec9 c\u00f3 th\u1ec3 th\u1eafng ph\u1ea7n pot m\u00e0 m\u00ecnh \u0111\u00e3 g\u00f3p v\u00e0o.</li></ul><h2>L\u1eadt b\u00e0i</h2><p>N\u1ebfu sau v\u00f2ng c\u01b0\u1ee3c \u1edf river v\u1eabn c\u00f2n t\u1eeb hai ng\u01b0\u1eddi tr\u1edf l\u00ean, b\u00e0i \u0111\u01b0\u1ee3c l\u1eadt l\u00ean. B\u1ed9 n\u0103m l\u00e1 m\u1ea1nh nh\u1ea5t trong b\u1ea3y l\u00e1 c\u00f3 s\u1eb5n (hai l\u00e1 ri\u00eang + n\u0103m l\u00e1 chung) th\u1eafng pot. C\u00e1c b\u1ed9 b\u00e0i ngang nhau s\u1ebd chia \u0111\u00f4i pot.</p><h2>Th\u1ee9 h\u1ea1ng b\u1ed9 b\u00e0i, t\u1eeb m\u1ea1nh \u0111\u1ebfn y\u1ebfu</h2><ol><li><strong>Th\u00f9ng ph\u00e1 s\u1ea3nh ho\u00e0ng gia</strong> \u2014 A K Q J 10 c\u00f9ng ch\u1ea5t.</li><li><strong>Th\u00f9ng ph\u00e1 s\u1ea3nh</strong> \u2014 n\u0103m l\u00e1 li\u00ean ti\u1ebfp c\u00f9ng ch\u1ea5t.</li><li><strong>T\u1ee9 qu\u00fd</strong> \u2014 b\u1ed1n l\u00e1 c\u00f9ng gi\u00e1 tr\u1ecb.</li><li><strong>C\u00f9 l\u0169</strong> \u2014 m\u1ed9t b\u1ed9 ba c\u1ed9ng m\u1ed9t \u0111\u00f4i.</li><li><strong>Th\u00f9ng</strong> \u2014 n\u0103m l\u00e1 c\u00f9ng ch\u1ea5t.</li><li><strong>S\u1ea3nh</strong> \u2014 n\u0103m l\u00e1 li\u00ean ti\u1ebfp kh\u00e1c ch\u1ea5t.</li><li><strong>B\u1ed9 ba</strong> \u2014 ba l\u00e1 c\u00f9ng gi\u00e1 tr\u1ecb.</li><li><strong>Hai \u0111\u00f4i</strong> \u2014 hai \u0111\u00f4i kh\u00e1c nhau.</li><li><strong>M\u1ed9t \u0111\u00f4i</strong> \u2014 hai l\u00e1 c\u00f9ng gi\u00e1 tr\u1ecb.</li><li><strong>M\u1eadu th\u1ea7u</strong> \u2014 kh\u00f4ng c\u00f3 b\u1ed9 n\u00e0o \u1edf tr\u00ean; l\u00e1 cao nh\u1ea5t quy\u1ebft \u0111\u1ecbnh.</li></ol><h2>Gi\u1ea3i \u0111\u1ea5u trong PokerTH</h2><p>C\u00e1c v\u00e1n trong PokerTH l\u00e0 gi\u1ea3i \u0111\u1ea5u ki\u1ec3u sit-and-go: m\u1ecdi ng\u01b0\u1eddi b\u1eaft \u0111\u1ea7u v\u1edbi c\u00f9ng s\u1ed1 chip, ti\u1ec1n m\u00f9 t\u0103ng d\u1ea7n theo th\u1eddi gian, v\u00e0 ng\u01b0\u1eddi cu\u1ed1i c\u00f9ng c\u00f2n chip s\u1ebd th\u1eafng. B\u1ea1n c\u00f3 th\u1ec3 luy\u1ec7n t\u1eadp ngo\u1ea1i tuy\u1ebfn v\u1edbi \u0111\u1ed1i th\u1ee7 m\u00e1y t\u00ednh, ch\u01a1i qua LAN ho\u1eb7c m\u00e1y ch\u1ee7 ri\u00eang, ho\u1eb7c tham gia m\u1ea1ng ch\u00ednh th\u1ee9c pokerth.net v\u1edbi b\u1ea3ng x\u1ebfp h\u1ea1ng theo m\u00f9a.</p>" },
  th: {
    title: "\u0e01\u0e15\u0e34\u0e01\u0e32 Texas Hold\u2019em \u2014 PokerTH \u0e40\u0e27\u0e2d\u0e23\u0e4c\u0e0a\u0e31\u0e19\u0e40\u0e27\u0e47\u0e1a",
    desc: "\u0e01\u0e15\u0e34\u0e01\u0e32 Texas Hold\u2019em \u0e09\u0e1a\u0e31\u0e1a\u0e40\u0e15\u0e47\u0e21\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e17\u0e35\u0e48\u0e40\u0e25\u0e48\u0e19\u0e43\u0e19 PokerTH: \u0e40\u0e07\u0e34\u0e19\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a \u0e2a\u0e35\u0e48\u0e23\u0e2d\u0e1a\u0e01\u0e32\u0e23\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19 Fold/Check/Call/Raise/All-In \u0e1e\u0e2d\u0e15\u0e02\u0e49\u0e32\u0e07 \u0e41\u0e25\u0e30\u0e25\u0e33\u0e14\u0e31\u0e1a\u0e44\u0e1e\u0e48",
    ldHeadline: "\u0e01\u0e15\u0e34\u0e01\u0e32\u0e42\u0e1b\u0e4a\u0e01\u0e40\u0e01\u0e2d\u0e23\u0e4c Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "\u0e27\u0e34\u0e18\u0e35\u0e40\u0e25\u0e48\u0e19 No-Limit Texas Hold\u2019em: \u0e40\u0e07\u0e34\u0e19\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a \u0e23\u0e2d\u0e1a\u0e01\u0e32\u0e23\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19 \u0e01\u0e32\u0e23\u0e01\u0e23\u0e30\u0e17\u0e33 \u0e41\u0e25\u0e30\u0e25\u0e33\u0e14\u0e31\u0e1a\u0e44\u0e1e\u0e48 \u0e2d\u0e22\u0e48\u0e32\u0e07\u0e17\u0e35\u0e48\u0e40\u0e25\u0e48\u0e19\u0e43\u0e19 PokerTH",
    body: "<h1>\u0e01\u0e15\u0e34\u0e01\u0e32\u0e42\u0e1b\u0e4a\u0e01\u0e40\u0e01\u0e2d\u0e23\u0e4c Texas Hold\u2019em</h1><p>PokerTH \u0e40\u0e25\u0e48\u0e19\u0e41\u0e1a\u0e1a No-Limit Texas Hold\u2019em \u0e0b\u0e36\u0e48\u0e07\u0e40\u0e1b\u0e47\u0e19\u0e23\u0e39\u0e1b\u0e41\u0e1a\u0e1a\u0e42\u0e1b\u0e4a\u0e01\u0e40\u0e01\u0e2d\u0e23\u0e4c\u0e17\u0e35\u0e48\u0e19\u0e34\u0e22\u0e21\u0e17\u0e35\u0e48\u0e2a\u0e38\u0e14\u0e43\u0e19\u0e42\u0e25\u0e01 \u0e1c\u0e39\u0e49\u0e40\u0e25\u0e48\u0e19\u0e41\u0e15\u0e48\u0e25\u0e30\u0e04\u0e19\u0e1e\u0e22\u0e32\u0e22\u0e32\u0e21\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e44\u0e1e\u0e48\u0e2b\u0e49\u0e32\u0e43\u0e1a\u0e17\u0e35\u0e48\u0e14\u0e35\u0e17\u0e35\u0e48\u0e2a\u0e38\u0e14\u0e08\u0e32\u0e01\u0e44\u0e1e\u0e48\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27\u0e2a\u0e2d\u0e07\u0e43\u0e1a\u0e41\u0e25\u0e30\u0e44\u0e1e\u0e48\u0e01\u0e2d\u0e07\u0e01\u0e25\u0e32\u0e07\u0e2b\u0e49\u0e32\u0e43\u0e1a</p><h2>\u0e01\u0e32\u0e23\u0e41\u0e08\u0e01\u0e44\u0e1e\u0e48\u0e41\u0e25\u0e30\u0e40\u0e07\u0e34\u0e19\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a</h2><p>\u0e17\u0e38\u0e01\u0e15\u0e32\u0e40\u0e23\u0e34\u0e48\u0e21\u0e14\u0e49\u0e27\u0e22\u0e01\u0e32\u0e23\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a\u0e2a\u0e2d\u0e07\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23 \u0e1c\u0e39\u0e49\u0e40\u0e25\u0e48\u0e19\u0e17\u0e32\u0e07\u0e0b\u0e49\u0e32\u0e22\u0e02\u0e2d\u0e07\u0e1b\u0e38\u0e48\u0e21\u0e14\u0e35\u0e25\u0e40\u0e25\u0e2d\u0e23\u0e4c\u0e27\u0e32\u0e07<em>\u0e40\u0e07\u0e34\u0e19\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a\u0e40\u0e25\u0e47\u0e01</em> \u0e41\u0e25\u0e30\u0e04\u0e19\u0e16\u0e31\u0e14\u0e44\u0e1b\u0e27\u0e32\u0e07<em>\u0e40\u0e07\u0e34\u0e19\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a\u0e43\u0e2b\u0e0d\u0e48</em> \u0e08\u0e32\u0e01\u0e19\u0e31\u0e49\u0e19\u0e1c\u0e39\u0e49\u0e40\u0e25\u0e48\u0e19\u0e41\u0e15\u0e48\u0e25\u0e30\u0e04\u0e19\u0e08\u0e30\u0e44\u0e14\u0e49\u0e44\u0e1e\u0e48\u0e04\u0e27\u0e48\u0e33\u0e2a\u0e2d\u0e07\u0e43\u0e1a (<em>\u0e44\u0e1e\u0e48\u0e43\u0e19\u0e21\u0e37\u0e2d</em>) \u0e1b\u0e38\u0e48\u0e21\u0e14\u0e35\u0e25\u0e40\u0e25\u0e2d\u0e23\u0e4c\u0e08\u0e30\u0e40\u0e25\u0e37\u0e48\u0e2d\u0e19\u0e44\u0e1b\u0e17\u0e32\u0e07\u0e0b\u0e49\u0e32\u0e22\u0e21\u0e37\u0e2d\u0e16\u0e31\u0e14\u0e44\u0e1b\u0e15\u0e32\u0e21\u0e40\u0e02\u0e47\u0e21\u0e19\u0e32\u0e2c\u0e34\u0e01\u0e32\u0e2b\u0e25\u0e31\u0e07\u0e08\u0e1a\u0e41\u0e15\u0e48\u0e25\u0e30\u0e15\u0e32 \u0e41\u0e25\u0e30\u0e43\u0e19 PokerTH \u0e40\u0e07\u0e34\u0e19\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a\u0e08\u0e30\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e02\u0e36\u0e49\u0e19\u0e15\u0e32\u0e21\u0e0a\u0e48\u0e27\u0e07\u0e40\u0e27\u0e25\u0e32\u0e17\u0e35\u0e48\u0e01\u0e33\u0e2b\u0e19\u0e14</p><h2>\u0e2a\u0e35\u0e48\u0e23\u0e2d\u0e1a\u0e01\u0e32\u0e23\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19</h2><ul><li><strong>Pre-flop</strong> \u2014 \u0e2b\u0e25\u0e31\u0e07\u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a\u0e44\u0e1e\u0e48\u0e43\u0e19\u0e21\u0e37\u0e2d \u0e1c\u0e39\u0e49\u0e40\u0e25\u0e48\u0e19\u0e25\u0e07\u0e21\u0e37\u0e2d\u0e15\u0e32\u0e21\u0e25\u0e33\u0e14\u0e31\u0e1a \u0e40\u0e23\u0e34\u0e48\u0e21\u0e08\u0e32\u0e01\u0e17\u0e32\u0e07\u0e0b\u0e49\u0e32\u0e22\u0e02\u0e2d\u0e07\u0e40\u0e07\u0e34\u0e19\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a\u0e43\u0e2b\u0e0d\u0e48</li><li><strong>Flop</strong> \u2014 \u0e40\u0e1b\u0e34\u0e14\u0e44\u0e1e\u0e48\u0e01\u0e2d\u0e07\u0e01\u0e25\u0e32\u0e07\u0e2a\u0e32\u0e21\u0e43\u0e1a \u0e15\u0e32\u0e21\u0e14\u0e49\u0e27\u0e22\u0e23\u0e2d\u0e1a\u0e01\u0e32\u0e23\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19</li><li><strong>Turn</strong> \u2014 \u0e41\u0e08\u0e01\u0e44\u0e1e\u0e48\u0e01\u0e2d\u0e07\u0e01\u0e25\u0e32\u0e07\u0e43\u0e1a\u0e17\u0e35\u0e48\u0e2a\u0e35\u0e48 \u0e15\u0e32\u0e21\u0e14\u0e49\u0e27\u0e22\u0e23\u0e2d\u0e1a\u0e01\u0e32\u0e23\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19\u0e2d\u0e35\u0e01\u0e23\u0e2d\u0e1a</li><li><strong>River</strong> \u2014 \u0e41\u0e08\u0e01\u0e44\u0e1e\u0e48\u0e01\u0e2d\u0e07\u0e01\u0e25\u0e32\u0e07\u0e43\u0e1a\u0e17\u0e35\u0e48\u0e2b\u0e49\u0e32\u0e0b\u0e36\u0e48\u0e07\u0e40\u0e1b\u0e47\u0e19\u0e43\u0e1a\u0e2a\u0e38\u0e14\u0e17\u0e49\u0e32\u0e22 \u0e15\u0e32\u0e21\u0e14\u0e49\u0e27\u0e22\u0e23\u0e2d\u0e1a\u0e01\u0e32\u0e23\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19\u0e2a\u0e38\u0e14\u0e17\u0e49\u0e32\u0e22</li></ul><h2>\u0e01\u0e32\u0e23\u0e01\u0e23\u0e30\u0e17\u0e33</h2><ul><li><strong>Fold</strong> \u2014 \u0e17\u0e34\u0e49\u0e07\u0e44\u0e1e\u0e48\u0e41\u0e25\u0e30\u0e1b\u0e25\u0e48\u0e2d\u0e22\u0e0a\u0e34\u0e1b\u0e17\u0e35\u0e48\u0e27\u0e32\u0e07\u0e44\u0e1b\u0e41\u0e25\u0e49\u0e27</li><li><strong>Check</strong> \u2014 \u0e1c\u0e48\u0e32\u0e19\u0e42\u0e14\u0e22\u0e44\u0e21\u0e48\u0e27\u0e32\u0e07\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19 (\u0e17\u0e33\u0e44\u0e14\u0e49\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e40\u0e21\u0e37\u0e48\u0e2d\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e21\u0e35\u0e43\u0e04\u0e23\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19\u0e43\u0e19\u0e23\u0e2d\u0e1a\u0e19\u0e31\u0e49\u0e19)</li><li><strong>Call</strong> \u2014 \u0e08\u0e48\u0e32\u0e22\u0e40\u0e17\u0e48\u0e32\u0e01\u0e31\u0e1a\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19\u0e2a\u0e39\u0e07\u0e2a\u0e38\u0e14\u0e43\u0e19\u0e02\u0e13\u0e30\u0e19\u0e31\u0e49\u0e19</li><li><strong>Raise</strong> \u2014 \u0e40\u0e1e\u0e34\u0e48\u0e21\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19\u0e1b\u0e31\u0e08\u0e08\u0e38\u0e1a\u0e31\u0e19 \u0e43\u0e19\u0e41\u0e1a\u0e1a No-Limit \u0e40\u0e1e\u0e34\u0e48\u0e21\u0e44\u0e14\u0e49\u0e17\u0e38\u0e01\u0e08\u0e33\u0e19\u0e27\u0e19\u0e08\u0e19\u0e16\u0e36\u0e07\u0e0a\u0e34\u0e1b\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13</li><li><strong>All-In</strong> \u2014 \u0e25\u0e07\u0e0a\u0e34\u0e1b\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e17\u0e35\u0e48\u0e21\u0e35 \u0e2b\u0e32\u0e01\u0e04\u0e19\u0e2d\u0e37\u0e48\u0e19\u0e22\u0e31\u0e07\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19\u0e2a\u0e39\u0e07\u0e01\u0e27\u0e48\u0e32\u0e19\u0e31\u0e49\u0e19\u0e15\u0e48\u0e2d\u0e44\u0e1b \u0e08\u0e30\u0e40\u0e01\u0e34\u0e14\u0e1e\u0e2d\u0e15\u0e02\u0e49\u0e32\u0e07\u0e02\u0e36\u0e49\u0e19 \u0e04\u0e38\u0e13\u0e08\u0e36\u0e07\u0e0a\u0e19\u0e30\u0e44\u0e14\u0e49\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e2a\u0e48\u0e27\u0e19\u0e02\u0e2d\u0e07\u0e1e\u0e2d\u0e15\u0e17\u0e35\u0e48\u0e04\u0e38\u0e13\u0e23\u0e48\u0e27\u0e21\u0e25\u0e07\u0e40\u0e17\u0e48\u0e32\u0e19\u0e31\u0e49\u0e19</li></ul><h2>\u0e01\u0e32\u0e23\u0e40\u0e1b\u0e34\u0e14\u0e44\u0e1e\u0e48</h2><p>\u0e2b\u0e32\u0e01\u0e2b\u0e25\u0e31\u0e07\u0e23\u0e2d\u0e1a\u0e01\u0e32\u0e23\u0e40\u0e14\u0e34\u0e21\u0e1e\u0e31\u0e19\u0e17\u0e35\u0e48 river \u0e22\u0e31\u0e07\u0e40\u0e2b\u0e25\u0e37\u0e2d\u0e1c\u0e39\u0e49\u0e40\u0e25\u0e48\u0e19\u0e15\u0e31\u0e49\u0e07\u0e41\u0e15\u0e48\u0e2a\u0e2d\u0e07\u0e04\u0e19\u0e02\u0e36\u0e49\u0e19\u0e44\u0e1b \u0e08\u0e30\u0e40\u0e1b\u0e34\u0e14\u0e44\u0e1e\u0e48\u0e40\u0e17\u0e35\u0e22\u0e1a\u0e01\u0e31\u0e19 \u0e44\u0e1e\u0e48\u0e2b\u0e49\u0e32\u0e43\u0e1a\u0e17\u0e35\u0e48\u0e14\u0e35\u0e17\u0e35\u0e48\u0e2a\u0e38\u0e14 \u0e08\u0e32\u0e01\u0e40\u0e08\u0e47\u0e14\u0e43\u0e1a\u0e17\u0e35\u0e48\u0e43\u0e0a\u0e49\u0e44\u0e14\u0e49 (\u0e44\u0e1e\u0e48\u0e43\u0e19\u0e21\u0e37\u0e2d\u0e2a\u0e2d\u0e07\u0e43\u0e1a + \u0e44\u0e1e\u0e48\u0e01\u0e2d\u0e07\u0e01\u0e25\u0e32\u0e07\u0e2b\u0e49\u0e32\u0e43\u0e1a) \u0e40\u0e1b\u0e47\u0e19\u0e1c\u0e39\u0e49\u0e0a\u0e19\u0e30\u0e1e\u0e2d\u0e15 \u0e2b\u0e32\u0e01\u0e40\u0e17\u0e48\u0e32\u0e01\u0e31\u0e19\u0e08\u0e30\u0e41\u0e1a\u0e48\u0e07\u0e1e\u0e2d\u0e15\u0e01\u0e31\u0e19</p><h2>\u0e25\u0e33\u0e14\u0e31\u0e1a\u0e44\u0e1e\u0e48 \u0e08\u0e32\u0e01\u0e41\u0e23\u0e07\u0e17\u0e35\u0e48\u0e2a\u0e38\u0e14\u0e44\u0e1b\u0e2d\u0e48\u0e2d\u0e19\u0e17\u0e35\u0e48\u0e2a\u0e38\u0e14</h2><ol><li><strong>\u0e23\u0e2d\u0e22\u0e31\u0e25\u0e1f\u0e25\u0e31\u0e0a</strong> \u2014 A K Q J 10 \u0e14\u0e2d\u0e01\u0e40\u0e14\u0e35\u0e22\u0e27\u0e01\u0e31\u0e19</li><li><strong>\u0e2a\u0e40\u0e15\u0e23\u0e17\u0e1f\u0e25\u0e31\u0e0a</strong> \u2014 \u0e44\u0e1e\u0e48\u0e40\u0e23\u0e35\u0e22\u0e07\u0e2b\u0e49\u0e32\u0e43\u0e1a\u0e14\u0e2d\u0e01\u0e40\u0e14\u0e35\u0e22\u0e27\u0e01\u0e31\u0e19</li><li><strong>\u0e42\u0e1f\u0e23\u0e4c\u0e2d\u0e2d\u0e1f\u0e2d\u0e30\u0e44\u0e04\u0e19\u0e14\u0e4c</strong> \u2014 \u0e44\u0e1e\u0e48\u0e41\u0e15\u0e49\u0e21\u0e40\u0e14\u0e35\u0e22\u0e27\u0e01\u0e31\u0e19\u0e2a\u0e35\u0e48\u0e43\u0e1a</li><li><strong>\u0e1f\u0e39\u0e25\u0e40\u0e2e\u0e32\u0e2a\u0e4c</strong> \u2014 \u0e15\u0e2d\u0e07\u0e1a\u0e27\u0e01\u0e2b\u0e19\u0e36\u0e48\u0e07\u0e04\u0e39\u0e48</li><li><strong>\u0e1f\u0e25\u0e31\u0e0a</strong> \u2014 \u0e44\u0e1e\u0e48\u0e14\u0e2d\u0e01\u0e40\u0e14\u0e35\u0e22\u0e27\u0e01\u0e31\u0e19\u0e2b\u0e49\u0e32\u0e43\u0e1a</li><li><strong>\u0e2a\u0e40\u0e15\u0e23\u0e17</strong> \u2014 \u0e44\u0e1e\u0e48\u0e40\u0e23\u0e35\u0e22\u0e07\u0e2b\u0e49\u0e32\u0e43\u0e1a\u0e04\u0e25\u0e30\u0e14\u0e2d\u0e01</li><li><strong>\u0e15\u0e2d\u0e07</strong> \u2014 \u0e44\u0e1e\u0e48\u0e41\u0e15\u0e49\u0e21\u0e40\u0e14\u0e35\u0e22\u0e27\u0e01\u0e31\u0e19\u0e2a\u0e32\u0e21\u0e43\u0e1a</li><li><strong>\u0e17\u0e39\u0e41\u0e1e\u0e23\u0e4c</strong> \u2014 \u0e2a\u0e2d\u0e07\u0e04\u0e39\u0e48\u0e17\u0e35\u0e48\u0e15\u0e48\u0e32\u0e07\u0e01\u0e31\u0e19</li><li><strong>\u0e27\u0e31\u0e19\u0e41\u0e1e\u0e23\u0e4c</strong> \u2014 \u0e44\u0e1e\u0e48\u0e41\u0e15\u0e49\u0e21\u0e40\u0e14\u0e35\u0e22\u0e27\u0e01\u0e31\u0e19\u0e2a\u0e2d\u0e07\u0e43\u0e1a</li><li><strong>\u0e44\u0e2e\u0e01\u0e32\u0e23\u0e4c\u0e14</strong> \u2014 \u0e44\u0e21\u0e48\u0e40\u0e02\u0e49\u0e32\u0e02\u0e49\u0e2d\u0e43\u0e14\u0e02\u0e49\u0e32\u0e07\u0e15\u0e49\u0e19 \u0e15\u0e31\u0e14\u0e2a\u0e34\u0e19\u0e14\u0e49\u0e27\u0e22\u0e44\u0e1e\u0e48\u0e43\u0e1a\u0e2a\u0e39\u0e07\u0e2a\u0e38\u0e14</li></ol><h2>\u0e17\u0e31\u0e27\u0e23\u0e4c\u0e19\u0e32\u0e40\u0e21\u0e19\u0e15\u0e4c\u0e43\u0e19 PokerTH</h2><p>\u0e40\u0e01\u0e21\u0e43\u0e19 PokerTH \u0e40\u0e1b\u0e47\u0e19\u0e17\u0e31\u0e27\u0e23\u0e4c\u0e19\u0e32\u0e40\u0e21\u0e19\u0e15\u0e4c\u0e41\u0e1a\u0e1a sit-and-go \u0e17\u0e38\u0e01\u0e04\u0e19\u0e40\u0e23\u0e34\u0e48\u0e21\u0e14\u0e49\u0e27\u0e22\u0e0a\u0e34\u0e1b\u0e40\u0e17\u0e48\u0e32\u0e01\u0e31\u0e19 \u0e40\u0e07\u0e34\u0e19\u0e1a\u0e31\u0e07\u0e04\u0e31\u0e1a\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e02\u0e36\u0e49\u0e19\u0e15\u0e32\u0e21\u0e40\u0e27\u0e25\u0e32 \u0e41\u0e25\u0e30\u0e1c\u0e39\u0e49\u0e40\u0e25\u0e48\u0e19\u0e04\u0e19\u0e2a\u0e38\u0e14\u0e17\u0e49\u0e32\u0e22\u0e17\u0e35\u0e48\u0e22\u0e31\u0e07\u0e21\u0e35\u0e0a\u0e34\u0e1b\u0e40\u0e1b\u0e47\u0e19\u0e1c\u0e39\u0e49\u0e0a\u0e19\u0e30 \u0e04\u0e38\u0e13\u0e1d\u0e36\u0e01\u0e0b\u0e49\u0e2d\u0e21\u0e2d\u0e2d\u0e1f\u0e44\u0e25\u0e19\u0e4c\u0e01\u0e31\u0e1a\u0e04\u0e39\u0e48\u0e41\u0e02\u0e48\u0e07\u0e04\u0e2d\u0e21\u0e1e\u0e34\u0e27\u0e40\u0e15\u0e2d\u0e23\u0e4c \u0e40\u0e25\u0e48\u0e19\u0e1c\u0e48\u0e32\u0e19 LAN \u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e0b\u0e34\u0e23\u0e4c\u0e1f\u0e40\u0e27\u0e2d\u0e23\u0e4c\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27 \u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e02\u0e49\u0e32\u0e23\u0e48\u0e27\u0e21\u0e40\u0e04\u0e23\u0e37\u0e2d\u0e02\u0e48\u0e32\u0e22\u0e17\u0e32\u0e07\u0e01\u0e32\u0e23 pokerth.net \u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e2d\u0e31\u0e19\u0e14\u0e31\u0e1a\u0e1b\u0e23\u0e30\u0e08\u0e33\u0e24\u0e14\u0e39\u0e01\u0e32\u0e25\u0e44\u0e14\u0e49</p>" },
  ar: {
    title: "\u0642\u0648\u0627\u0639\u062f \u062a\u0643\u0633\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u2014 \u0639\u0645\u064a\u0644 \u0627\u0644\u0648\u064a\u0628 PokerTH",
    desc: "\u0642\u0648\u0627\u0639\u062f \u062a\u0643\u0633\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u0643\u0627\u0645\u0644\u0629 \u0643\u0645\u0627 \u062a\u064f\u0644\u0639\u0628 \u0641\u064a PokerTH: \u0627\u0644\u0631\u0647\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0645\u064a\u0627\u0621\u060c \u062c\u0648\u0644\u0627\u062a \u0627\u0644\u0645\u0631\u0627\u0647\u0646\u0629 \u0627\u0644\u0623\u0631\u0628\u0639\u060c Fold/Check/Call/Raise/All-In\u060c \u0627\u0644\u0623\u0648\u0627\u0646\u064a \u0627\u0644\u062c\u0627\u0646\u0628\u064a\u0629 \u0648\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0623\u064a\u062f\u064a.",
    ldHeadline: "\u0642\u0648\u0627\u0639\u062f \u0628\u0648\u0643\u0631 \u062a\u0643\u0633\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u2014 PokerTH",
    ldDesc: "\u0643\u064a\u0641 \u062a\u0644\u0639\u0628 \u062a\u0643\u0633\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u0628\u0644\u0627 \u062d\u062f\u0648\u062f: \u0627\u0644\u0631\u0647\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0645\u064a\u0627\u0621\u060c \u062c\u0648\u0644\u0627\u062a \u0627\u0644\u0645\u0631\u0627\u0647\u0646\u0629\u060c \u0627\u0644\u062d\u0631\u0643\u0627\u062a \u0648\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0623\u064a\u062f\u064a\u060c \u0643\u0645\u0627 \u0641\u064a PokerTH.",
    body: "<h1>\u0642\u0648\u0627\u0639\u062f \u0628\u0648\u0643\u0631 \u062a\u0643\u0633\u0627\u0633 \u0647\u0648\u0644\u062f\u0645</h1><p>\u064a\u064f\u0644\u0639\u0628 \u0641\u064a PokerTH \u062a\u0643\u0633\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u0628\u0644\u0627 \u062d\u062f\u0648\u062f\u060c \u0648\u0647\u0648 \u0623\u0634\u0647\u0631 \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0628\u0648\u0643\u0631 \u0641\u064a \u0627\u0644\u0639\u0627\u0644\u0645. \u064a\u062d\u0627\u0648\u0644 \u0643\u0644 \u0644\u0627\u0639\u0628 \u062a\u0643\u0648\u064a\u0646 \u0623\u0641\u0636\u0644 \u064a\u062f \u0645\u0646 \u062e\u0645\u0633 \u0623\u0648\u0631\u0627\u0642 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0648\u0631\u0642\u062a\u064a\u0647 \u0627\u0644\u062e\u0627\u0635\u062a\u064a\u0646 \u0648\u062e\u0645\u0633 \u0623\u0648\u0631\u0627\u0642 \u0645\u0634\u062a\u0631\u0643\u0629.</p><h2>\u0627\u0644\u062a\u0648\u0632\u064a\u0639 \u0648\u0627\u0644\u0631\u0647\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0645\u064a\u0627\u0621</h2><p>\u062a\u0628\u062f\u0623 \u0643\u0644 \u064a\u062f \u0628\u0631\u0647\u0627\u0646\u064a\u0646 \u0625\u062c\u0628\u0627\u0631\u064a\u064a\u0646: \u0627\u0644\u0644\u0627\u0639\u0628 \u0639\u0644\u0649 \u064a\u0633\u0627\u0631 \u0632\u0631 \u0627\u0644\u0645\u0648\u0632\u0651\u0639 \u064a\u0636\u0639 <em>\u0627\u0644\u0631\u0647\u0627\u0646 \u0627\u0644\u0623\u0639\u0645\u0649 \u0627\u0644\u0635\u063a\u064a\u0631</em>\u060c \u0648\u064a\u0636\u0639 \u0627\u0644\u0630\u064a \u064a\u0644\u064a\u0647 <em>\u0627\u0644\u0631\u0647\u0627\u0646 \u0627\u0644\u0623\u0639\u0645\u0649 \u0627\u0644\u0643\u0628\u064a\u0631</em>. \u062b\u0645 \u064a\u062d\u0635\u0644 \u0643\u0644 \u0644\u0627\u0639\u0628 \u0639\u0644\u0649 \u0648\u0631\u0642\u062a\u064a\u0646 \u0645\u0642\u0644\u0648\u0628\u062a\u064a\u0646 (<em>\u0627\u0644\u0623\u0648\u0631\u0627\u0642 \u0627\u0644\u062e\u0627\u0635\u0629</em>). \u064a\u0646\u062a\u0642\u0644 \u0627\u0644\u0632\u0631 \u0645\u0642\u0639\u062f\u064b\u0627 \u0648\u0627\u062d\u062f\u064b\u0627 \u0628\u0627\u062a\u062c\u0627\u0647 \u0639\u0642\u0627\u0631\u0628 \u0627\u0644\u0633\u0627\u0639\u0629 \u0628\u0639\u062f \u0643\u0644 \u064a\u062f\u060c \u0648\u0641\u064a PokerTH \u062a\u0631\u062a\u0641\u0639 \u0627\u0644\u0631\u0647\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0645\u064a\u0627\u0621 \u0639\u0644\u0649 \u0641\u062a\u0631\u0627\u062a \u0645\u0646\u062a\u0638\u0645\u0629.</p><h2>\u062c\u0648\u0644\u0627\u062a \u0627\u0644\u0645\u0631\u0627\u0647\u0646\u0629 \u0627\u0644\u0623\u0631\u0628\u0639</h2><ul><li><strong>Pre-flop</strong> \u2014 \u0628\u0639\u062f \u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u0623\u0648\u0631\u0627\u0642 \u0627\u0644\u062e\u0627\u0635\u0629 \u064a\u0644\u0639\u0628 \u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646 \u0628\u0627\u0644\u062f\u0648\u0631\u060c \u0628\u062f\u0621\u064b\u0627 \u0645\u0646 \u064a\u0633\u0627\u0631 \u0627\u0644\u0631\u0647\u0627\u0646 \u0627\u0644\u0623\u0639\u0645\u0649 \u0627\u0644\u0643\u0628\u064a\u0631.</li><li><strong>Flop</strong> \u2014 \u062a\u064f\u0643\u0634\u0641 \u062b\u0644\u0627\u062b \u0623\u0648\u0631\u0627\u0642 \u0645\u0634\u062a\u0631\u0643\u0629\u060c \u062a\u0644\u064a\u0647\u0627 \u062c\u0648\u0644\u0629 \u0645\u0631\u0627\u0647\u0646\u0629.</li><li><strong>Turn</strong> \u2014 \u062a\u064f\u0648\u0632\u064e\u0651\u0639 \u0648\u0631\u0642\u0629 \u0645\u0634\u062a\u0631\u0643\u0629 \u0631\u0627\u0628\u0639\u0629\u060c \u062a\u0644\u064a\u0647\u0627 \u062c\u0648\u0644\u0629 \u0645\u0631\u0627\u0647\u0646\u0629 \u0623\u062e\u0631\u0649.</li><li><strong>River</strong> \u2014 \u062a\u064f\u0648\u0632\u064e\u0651\u0639 \u0627\u0644\u0648\u0631\u0642\u0629 \u0627\u0644\u0645\u0634\u062a\u0631\u0643\u0629 \u0627\u0644\u062e\u0627\u0645\u0633\u0629 \u0648\u0627\u0644\u0623\u062e\u064a\u0631\u0629\u060c \u062a\u0644\u064a\u0647\u0627 \u062c\u0648\u0644\u0629 \u0627\u0644\u0645\u0631\u0627\u0647\u0646\u0629 \u0627\u0644\u062e\u062a\u0627\u0645\u064a\u0629.</li></ul><h2>\u0627\u0644\u062d\u0631\u0643\u0627\u062a</h2><ul><li><strong>Fold</strong> \u2014 \u0627\u0644\u062a\u062e\u0644\u064a \u0639\u0646 \u0627\u0644\u064a\u062f \u0648\u0639\u0646 \u0627\u0644\u0631\u0642\u0627\u0626\u0642 \u0627\u0644\u062a\u064a \u0631\u064f\u0648\u0647\u0646 \u0628\u0647\u0627.</li><li><strong>Check</strong> \u2014 \u062a\u0645\u0631\u064a\u0631 \u0627\u0644\u062f\u0648\u0631 \u062f\u0648\u0646 \u0645\u0631\u0627\u0647\u0646\u0629 (\u0641\u0642\u0637 \u0625\u0630\u0627 \u0644\u0645 \u064a\u0631\u0627\u0647\u0646 \u0623\u062d\u062f \u0641\u064a \u0627\u0644\u062c\u0648\u0644\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629).</li><li><strong>Call</strong> \u2014 \u0645\u062c\u0627\u0631\u0627\u0629 \u0623\u0639\u0644\u0649 \u0631\u0647\u0627\u0646 \u062d\u0627\u0644\u064a.</li><li><strong>Raise</strong> \u2014 \u0631\u0641\u0639 \u0627\u0644\u0631\u0647\u0627\u0646 \u0627\u0644\u062d\u0627\u0644\u064a. \u0641\u064a \u0644\u0639\u0628 \u0628\u0644\u0627 \u062d\u062f\u0648\u062f \u0628\u0623\u064a \u0645\u0628\u0644\u063a \u062d\u062a\u0649 \u0643\u0627\u0645\u0644 \u0631\u0635\u064a\u062f\u0643.</li><li><strong>All-In</strong> \u2014 \u0627\u0644\u0645\u0631\u0627\u0647\u0646\u0629 \u0628\u0643\u0644 \u0631\u0642\u0627\u0626\u0642\u0643. \u0648\u0625\u0630\u0627 \u0648\u0627\u0635\u0644 \u0627\u0644\u0622\u062e\u0631\u0648\u0646 \u0627\u0644\u0645\u0631\u0627\u0647\u0646\u0629 \u0641\u0648\u0642 \u0630\u0644\u0643 \u062a\u064f\u0646\u0634\u0623 \u0623\u0648\u0627\u0646\u064d \u062c\u0627\u0646\u0628\u064a\u0629\u060c \u0641\u0644\u0627 \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0641\u0648\u0632 \u0625\u0644\u0627 \u0628\u0627\u0644\u062c\u0632\u0621 \u0627\u0644\u0630\u064a \u0634\u0627\u0631\u0643\u062a \u0641\u064a\u0647 \u0645\u0646 \u0627\u0644\u0648\u0639\u0627\u0621.</li></ul><h2>\u0643\u0634\u0641 \u0627\u0644\u0623\u0648\u0631\u0627\u0642</h2><p>\u0625\u0630\u0627 \u0628\u0642\u064a \u0644\u0627\u0639\u0628\u0627\u0646 \u0623\u0648 \u0623\u0643\u062b\u0631 \u0628\u0639\u062f \u062c\u0648\u0644\u0629 \u0627\u0644\u0645\u0631\u0627\u0647\u0646\u0629 \u0639\u0644\u0649 \u0627\u0644\u0640 river \u062a\u064f\u0643\u0634\u0641 \u0627\u0644\u0623\u064a\u062f\u064a. \u0623\u0641\u0636\u0644 \u062a\u0631\u0643\u064a\u0628\u0629 \u0645\u0646 \u062e\u0645\u0633 \u0623\u0648\u0631\u0627\u0642 \u0645\u0646 \u0628\u064a\u0646 \u0627\u0644\u0633\u0628\u0639 \u0627\u0644\u0645\u062a\u0627\u062d\u0629 (\u0648\u0631\u0642\u062a\u0627\u0646 \u062e\u0627\u0635\u062a\u0627\u0646 + \u062e\u0645\u0633 \u0645\u0634\u062a\u0631\u0643\u0629) \u062a\u0641\u0648\u0632 \u0628\u0627\u0644\u0648\u0639\u0627\u0621\u060c \u0648\u0627\u0644\u0623\u064a\u062f\u064a \u0627\u0644\u0645\u062a\u0633\u0627\u0648\u064a\u0629 \u062a\u0642\u062a\u0633\u0645\u0647.</p><h2>\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0623\u064a\u062f\u064a\u060c \u0645\u0646 \u0627\u0644\u0623\u0642\u0648\u0649 \u0625\u0644\u0649 \u0627\u0644\u0623\u0636\u0639\u0641</h2><ol><li><strong>\u0631\u0648\u064a\u0627\u0644 \u0641\u0644\u0627\u0634</strong> \u2014 A K Q J 10 \u0645\u0646 \u0627\u0644\u0646\u0648\u0639 \u0646\u0641\u0633\u0647.</li><li><strong>\u0633\u062a\u0631\u064a\u062a \u0641\u0644\u0627\u0634</strong> \u2014 \u062e\u0645\u0633 \u0623\u0648\u0631\u0627\u0642 \u0645\u062a\u062a\u0627\u0644\u064a\u0629 \u0645\u0646 \u0627\u0644\u0646\u0648\u0639 \u0646\u0641\u0633\u0647.</li><li><strong>\u0623\u0631\u0628\u0639\u0629 \u0645\u062a\u0634\u0627\u0628\u0647\u0629</strong> \u2014 \u0623\u0631\u0628\u0639 \u0623\u0648\u0631\u0627\u0642 \u0628\u0627\u0644\u0642\u064a\u0645\u0629 \u0646\u0641\u0633\u0647\u0627.</li><li><strong>\u0641\u064f\u0644 \u0647\u0627\u0648\u0633</strong> \u2014 \u062b\u0644\u0627\u062b\u0629 \u0645\u062a\u0634\u0627\u0628\u0647\u0629 \u0645\u0639 \u0632\u0648\u062c.</li><li><strong>\u0641\u0644\u0627\u0634</strong> \u2014 \u062e\u0645\u0633 \u0623\u0648\u0631\u0627\u0642 \u0645\u0646 \u0627\u0644\u0646\u0648\u0639 \u0646\u0641\u0633\u0647.</li><li><strong>\u0633\u062a\u0631\u064a\u062a</strong> \u2014 \u062e\u0645\u0633 \u0623\u0648\u0631\u0627\u0642 \u0645\u062a\u062a\u0627\u0644\u064a\u0629 \u0645\u0646 \u0623\u0646\u0648\u0627\u0639 \u0645\u062e\u062a\u0644\u0641\u0629.</li><li><strong>\u062b\u0644\u0627\u062b\u0629 \u0645\u062a\u0634\u0627\u0628\u0647\u0629</strong> \u2014 \u062b\u0644\u0627\u062b \u0623\u0648\u0631\u0627\u0642 \u0628\u0627\u0644\u0642\u064a\u0645\u0629 \u0646\u0641\u0633\u0647\u0627.</li><li><strong>\u0632\u0648\u062c\u0627\u0646</strong> \u2014 \u0632\u0648\u062c\u0627\u0646 \u0645\u062e\u062a\u0644\u0641\u0627\u0646.</li><li><strong>\u0632\u0648\u062c</strong> \u2014 \u0648\u0631\u0642\u062a\u0627\u0646 \u0628\u0627\u0644\u0642\u064a\u0645\u0629 \u0646\u0641\u0633\u0647\u0627.</li><li><strong>\u0627\u0644\u0648\u0631\u0642\u0629 \u0627\u0644\u0639\u0644\u064a\u0627</strong> \u2014 \u0644\u0627 \u0634\u064a\u0621 \u0645\u0645\u0627 \u0633\u0628\u0642\u061b \u062a\u062d\u0633\u0645\u0647\u0627 \u0623\u0639\u0644\u0649 \u0648\u0631\u0642\u0629.</li></ol><h2>\u0627\u0644\u0628\u0637\u0648\u0644\u0627\u062a \u0641\u064a PokerTH</h2><p>\u0645\u0628\u0627\u0631\u064a\u0627\u062a PokerTH \u0628\u0637\u0648\u0644\u0627\u062a \u0639\u0644\u0649 \u0646\u0645\u0637 sit-and-go: \u064a\u0628\u062f\u0623 \u0627\u0644\u062c\u0645\u064a\u0639 \u0628\u0631\u0635\u064a\u062f \u0645\u062a\u0633\u0627\u0648\u064d\u060c \u0648\u062a\u0631\u062a\u0641\u0639 \u0627\u0644\u0631\u0647\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0645\u064a\u0627\u0621 \u0645\u0639 \u0627\u0644\u0648\u0642\u062a\u060c \u0648\u064a\u0641\u0648\u0632 \u0622\u062e\u0631 \u0644\u0627\u0639\u0628 \u062a\u0628\u0642\u0649 \u0644\u062f\u064a\u0647 \u0631\u0642\u0627\u0626\u0642. \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u062a\u062f\u0631\u0651\u0628 \u062f\u0648\u0646 \u0627\u062a\u0635\u0627\u0644 \u0636\u062f \u062e\u0635\u0648\u0645 \u064a\u062f\u064a\u0631\u0647\u0645 \u0627\u0644\u062d\u0627\u0633\u0648\u0628\u060c \u0623\u0648 \u0627\u0644\u0644\u0639\u0628 \u0639\u0628\u0631 \u0634\u0628\u0643\u0629 \u0645\u062d\u0644\u064a\u0629 \u0623\u0648 \u062e\u0627\u062f\u0645 \u062e\u0627\u0635\u060c \u0623\u0648 \u0627\u0644\u0627\u0646\u0636\u0645\u0627\u0645 \u0625\u0644\u0649 \u0634\u0628\u0643\u0629 pokerth.net \u0627\u0644\u0631\u0633\u0645\u064a\u0629 \u0628\u062a\u0635\u0646\u064a\u0641\u0627\u062a\u0647\u0627 \u0627\u0644\u0645\u0648\u0633\u0645\u064a\u0629.</p>" },
  he: {
    title: "\u05d7\u05d5\u05e7\u05d9 \u05d8\u05e7\u05e1\u05e1 \u05d4\u05d5\u05dc\u05d3\u05dd \u2014 \u05dc\u05e7\u05d5\u05d7 \u05d4\u05d5\u05d5\u05d1 \u05e9\u05dc PokerTH",
    desc: "\u05d7\u05d5\u05e7\u05d9 \u05d8\u05e7\u05e1\u05e1 \u05d4\u05d5\u05dc\u05d3\u05dd \u05d4\u05de\u05dc\u05d0\u05d9\u05dd \u05db\u05e4\u05d9 \u05e9\u05de\u05e9\u05d7\u05e7\u05d9\u05dd \u05d1-PokerTH: \u05e2\u05d9\u05d5\u05d5\u05e8\u05d9\u05dd, \u05d0\u05e8\u05d1\u05e2\u05ea \u05e1\u05d1\u05d1\u05d9 \u05d4\u05d4\u05d9\u05de\u05d5\u05e8\u05d9\u05dd, Fold/Check/Call/Raise/All-In, \u05e7\u05d5\u05e4\u05d5\u05ea \u05e6\u05d3 \u05d5\u05d3\u05d9\u05e8\u05d5\u05d2 \u05d9\u05d3\u05d9\u05d9\u05dd.",
    ldHeadline: "\u05d7\u05d5\u05e7\u05d9 \u05e4\u05d5\u05e7\u05e8 \u05d8\u05e7\u05e1\u05e1 \u05d4\u05d5\u05dc\u05d3\u05dd \u2014 PokerTH",
    ldDesc: "\u05d0\u05d9\u05da \u05de\u05e9\u05d7\u05e7\u05d9\u05dd \u05d8\u05e7\u05e1\u05e1 \u05d4\u05d5\u05dc\u05d3\u05dd \u05dc\u05dc\u05d0 \u05d4\u05d2\u05d1\u05dc\u05d4: \u05e2\u05d9\u05d5\u05d5\u05e8\u05d9\u05dd, \u05e1\u05d1\u05d1\u05d9 \u05d4\u05d9\u05de\u05d5\u05e8\u05d9\u05dd, \u05e4\u05e2\u05d5\u05dc\u05d5\u05ea \u05d5\u05d3\u05d9\u05e8\u05d5\u05d2 \u05d9\u05d3\u05d9\u05d9\u05dd, \u05db\u05de\u05d5 \u05d1-PokerTH.",
    body: "<h1>\u05d7\u05d5\u05e7\u05d9 \u05e4\u05d5\u05e7\u05e8 \u05d8\u05e7\u05e1\u05e1 \u05d4\u05d5\u05dc\u05d3\u05dd</h1><p>\u05d1-PokerTH \u05de\u05e9\u05d7\u05e7\u05d9\u05dd \u05d8\u05e7\u05e1\u05e1 \u05d4\u05d5\u05dc\u05d3\u05dd \u05dc\u05dc\u05d0 \u05d4\u05d2\u05d1\u05dc\u05d4, \u05d5\u05e8\u05d9\u05d0\u05e6\u05d9\u05d9\u05ea \u05d4\u05e4\u05d5\u05e7\u05e8 \u05d4\u05e4\u05d5\u05e4\u05d5\u05dc\u05e8\u05d9\u05ea \u05d1\u05e2\u05d5\u05dc\u05dd. \u05db\u05dc \u05e9\u05d7\u05e7\u05df \u05de\u05e0\u05e1\u05d4 \u05dc\u05d4\u05e8\u05db\u05d9\u05d1 \u05d0\u05ea \u05d4\u05d9\u05d3 \u05d4\u05d8\u05d5\u05d1\u05d4 \u05d1\u05d9\u05d5\u05ea\u05e8 \u05de\u05d7\u05de\u05d9\u05e9\u05d4 \u05e7\u05dc\u05e4\u05d9\u05dd, \u05de\u05ea\u05d5\u05da \u05e9\u05e0\u05d9 \u05e7\u05dc\u05e4\u05d9\u05dd \u05e4\u05e8\u05d8\u05d9\u05d9\u05dd \u05d5\u05d7\u05de\u05d9\u05e9\u05d4 \u05e7\u05dc\u05e4\u05d9\u05dd \u05de\u05e9\u05d5\u05ea\u05e4\u05d9\u05dd.</p><h2>\u05d4\u05d7\u05dc\u05d5\u05e7\u05d4 \u05d5\u05d4\u05e2\u05d9\u05d5\u05d5\u05e8\u05d9\u05dd</h2><p>\u05db\u05dc \u05d9\u05d3 \u05de\u05ea\u05d7\u05d9\u05dc\u05d4 \u05d1\u05e9\u05e0\u05d9 \u05d4\u05d9\u05de\u05d5\u05e8\u05d9 \u05d7\u05d5\u05d1\u05d4: \u05d4\u05e9\u05d7\u05e7\u05df \u05de\u05e9\u05de\u05d0\u05dc \u05dc\u05db\u05e4\u05ea\u05d5\u05e8 \u05d4\u05d3\u05d9\u05dc\u05e8 \u05de\u05e0\u05d9\u05d7 \u05d0\u05ea <em>\u05d4\u05e2\u05d9\u05d5\u05d5\u05e8 \u05d4\u05e7\u05d8\u05df</em>, \u05d5\u05d4\u05d1\u05d0 \u05d0\u05d7\u05e8\u05d9\u05d5 \u05d0\u05ea <em>\u05d4\u05e2\u05d9\u05d5\u05d5\u05e8 \u05d4\u05d2\u05d3\u05d5\u05dc</em>. \u05dc\u05d0\u05d7\u05e8 \u05de\u05db\u05df \u05db\u05dc \u05e9\u05d7\u05e7\u05df \u05de\u05e7\u05d1\u05dc \u05e9\u05e0\u05d9 \u05e7\u05dc\u05e4\u05d9\u05dd \u05e1\u05d2\u05d5\u05e8\u05d9\u05dd (<em>\u05e7\u05dc\u05e4\u05d9 \u05d4\u05d9\u05d3</em>). \u05d4\u05db\u05e4\u05ea\u05d5\u05e8 \u05d6\u05d6 \u05de\u05e7\u05d5\u05dd \u05d0\u05d7\u05d3 \u05e2\u05dd \u05db\u05d9\u05d5\u05d5\u05df \u05d4\u05e9\u05e2\u05d5\u05df \u05d0\u05d7\u05e8\u05d9 \u05db\u05dc \u05d9\u05d3, \u05d5\u05d1-PokerTH \u05d4\u05e2\u05d9\u05d5\u05d5\u05e8\u05d9\u05dd \u05e2\u05d5\u05dc\u05d9\u05dd \u05d1\u05de\u05e8\u05d5\u05d5\u05d7\u05d9 \u05d6\u05de\u05df \u05e7\u05d1\u05d5\u05e2\u05d9\u05dd.</p><h2>\u05d0\u05e8\u05d1\u05e2\u05ea \u05e1\u05d1\u05d1\u05d9 \u05d4\u05d4\u05d9\u05de\u05d5\u05e8\u05d9\u05dd</h2><ul><li><strong>Pre-flop</strong> \u2014 \u05dc\u05d0\u05d7\u05e8 \u05e7\u05d1\u05dc\u05ea \u05e7\u05dc\u05e4\u05d9 \u05d4\u05d9\u05d3 \u05d4\u05e9\u05d7\u05e7\u05e0\u05d9\u05dd \u05e4\u05d5\u05e2\u05dc\u05d9\u05dd \u05d1\u05ea\u05d5\u05e8\u05dd, \u05d4\u05d7\u05dc \u05de\u05e9\u05de\u05d0\u05dc \u05dc\u05e2\u05d9\u05d5\u05d5\u05e8 \u05d4\u05d2\u05d3\u05d5\u05dc.</li><li><strong>Flop</strong> \u2014 \u05e9\u05dc\u05d5\u05e9\u05d4 \u05e7\u05dc\u05e4\u05d9\u05dd \u05de\u05e9\u05d5\u05ea\u05e4\u05d9\u05dd \u05e0\u05d7\u05e9\u05e4\u05d9\u05dd, \u05d5\u05d0\u05d7\u05e8\u05d9\u05d4\u05dd \u05e1\u05d1\u05d1 \u05d4\u05d9\u05de\u05d5\u05e8\u05d9\u05dd.</li><li><strong>Turn</strong> \u2014 \u05de\u05d7\u05d5\u05dc\u05e7 \u05e7\u05dc\u05e3 \u05de\u05e9\u05d5\u05ea\u05e3 \u05e8\u05d1\u05d9\u05e2\u05d9, \u05d5\u05d0\u05d7\u05e8\u05d9\u05d5 \u05e1\u05d1\u05d1 \u05d4\u05d9\u05de\u05d5\u05e8\u05d9\u05dd \u05e0\u05d5\u05e1\u05e3.</li><li><strong>River</strong> \u2014 \u05de\u05d7\u05d5\u05dc\u05e7 \u05d4\u05e7\u05dc\u05e3 \u05d4\u05de\u05e9\u05d5\u05ea\u05e3 \u05d4\u05d7\u05de\u05d9\u05e9\u05d9 \u05d5\u05d4\u05d0\u05d7\u05e8\u05d5\u05df, \u05d5\u05d0\u05d7\u05e8\u05d9\u05d5 \u05e1\u05d1\u05d1 \u05d4\u05d4\u05d9\u05de\u05d5\u05e8\u05d9\u05dd \u05d4\u05de\u05e1\u05db\u05dd.</li></ul><h2>\u05d4\u05e4\u05e2\u05d5\u05dc\u05d5\u05ea</h2><ul><li><strong>Fold</strong> \u2014 \u05dc\u05d5\u05d5\u05ea\u05e8 \u05e2\u05dc \u05d4\u05d9\u05d3 \u05d5\u05e2\u05dc \u05d4\u05d6\u05f3\u05d9\u05d8\u05d5\u05e0\u05d9\u05dd \u05e9\u05db\u05d1\u05e8 \u05d4\u05d5\u05de\u05e8\u05d5.</li><li><strong>Check</strong> \u2014 \u05dc\u05d4\u05e2\u05d1\u05d9\u05e8 \u05d1\u05dc\u05d9 \u05dc\u05d4\u05de\u05e8 (\u05e8\u05e7 \u05d0\u05dd \u05d0\u05d9\u05e9 \u05dc\u05d0 \u05d4\u05d9\u05de\u05e8 \u05d1\u05e1\u05d1\u05d1 \u05d4\u05e0\u05d5\u05db\u05d7\u05d9).</li><li><strong>Call</strong> \u2014 \u05dc\u05d4\u05e9\u05d5\u05d5\u05ea \u05dc\u05d4\u05d9\u05de\u05d5\u05e8 \u05d4\u05d2\u05d1\u05d5\u05d4 \u05d1\u05d9\u05d5\u05ea\u05e8 \u05db\u05e8\u05d2\u05e2.</li><li><strong>Raise</strong> \u2014 \u05dc\u05d4\u05e2\u05dc\u05d5\u05ea \u05d0\u05ea \u05d4\u05d4\u05d9\u05de\u05d5\u05e8 \u05d4\u05e0\u05d5\u05db\u05d7\u05d9. \u05d1\u05dc\u05dc\u05d0 \u05d4\u05d2\u05d1\u05dc\u05d4 \u05d1\u05db\u05dc \u05e1\u05db\u05d5\u05dd, \u05e2\u05d3 \u05db\u05dc \u05d4\u05e2\u05e8\u05d9\u05de\u05d4 \u05e9\u05dc\u05da.</li><li><strong>All-In</strong> \u2014 \u05dc\u05d4\u05de\u05e8 \u05d1\u05db\u05dc \u05d4\u05d6\u05f3\u05d9\u05d8\u05d5\u05e0\u05d9\u05dd \u05e9\u05dc\u05da. \u05d0\u05dd \u05d4\u05d0\u05d7\u05e8\u05d9\u05dd \u05de\u05de\u05e9\u05d9\u05db\u05d9\u05dd \u05dc\u05d4\u05de\u05e8 \u05de\u05e2\u05d1\u05e8 \u05dc\u05db\u05da \u05e0\u05d5\u05e6\u05e8\u05d5\u05ea \u05e7\u05d5\u05e4\u05d5\u05ea \u05e6\u05d3, \u05db\u05da \u05e9\u05ea\u05d5\u05db\u05dc \u05dc\u05d6\u05db\u05d5\u05ea \u05e8\u05e7 \u05d1\u05d7\u05dc\u05e7 \u05d4\u05e7\u05d5\u05e4\u05d4 \u05e9\u05d0\u05dc\u05d9\u05d5 \u05ea\u05e8\u05de\u05ea.</li></ul><h2>\u05d7\u05e9\u05d9\u05e4\u05ea \u05d4\u05e7\u05dc\u05e4\u05d9\u05dd</h2><p>\u05d0\u05dd \u05d0\u05d7\u05e8\u05d9 \u05e1\u05d1\u05d1 \u05d4\u05d4\u05d9\u05de\u05d5\u05e8\u05d9\u05dd \u05d1-river \u05e0\u05d5\u05ea\u05e8\u05d5 \u05e9\u05e0\u05d9 \u05e9\u05d7\u05e7\u05e0\u05d9\u05dd \u05d0\u05d5 \u05d9\u05d5\u05ea\u05e8, \u05d4\u05d9\u05d3\u05d9\u05d9\u05dd \u05e0\u05d7\u05e9\u05e4\u05d5\u05ea. \u05d4\u05e6\u05d9\u05e8\u05d5\u05e3 \u05d4\u05d8\u05d5\u05d1 \u05d1\u05d9\u05d5\u05ea\u05e8 \u05e9\u05dc \u05d7\u05de\u05d9\u05e9\u05d4 \u05e7\u05dc\u05e4\u05d9\u05dd \u05de\u05ea\u05d5\u05da \u05e9\u05d1\u05e2\u05ea \u05d4\u05d6\u05de\u05d9\u05e0\u05d9\u05dd (\u05e9\u05e0\u05d9 \u05e7\u05dc\u05e4\u05d9 \u05d9\u05d3 + \u05d7\u05de\u05d9\u05e9\u05d4 \u05de\u05e9\u05d5\u05ea\u05e4\u05d9\u05dd) \u05d6\u05d5\u05db\u05d4 \u05d1\u05e7\u05d5\u05e4\u05d4. \u05d9\u05d3\u05d9\u05d9\u05dd \u05e9\u05d5\u05d5\u05ea \u05de\u05ea\u05d7\u05dc\u05e7\u05d5\u05ea \u05d1\u05e7\u05d5\u05e4\u05d4.</p><h2>\u05d3\u05d9\u05e8\u05d5\u05d2 \u05d9\u05d3\u05d9\u05d9\u05dd, \u05de\u05d4\u05d7\u05d6\u05e7\u05d4 \u05dc\u05d7\u05dc\u05e9\u05d4</h2><ol><li><strong>\u05e8\u05d5\u05d9\u05d0\u05dc \u05e4\u05dc\u05d0\u05e9</strong> \u2014 A K Q J 10 \u05d1\u05d0\u05d5\u05ea\u05d4 \u05e6\u05d5\u05e8\u05d4.</li><li><strong>\u05e1\u05d8\u05e8\u05d9\u05d9\u05d8 \u05e4\u05dc\u05d0\u05e9</strong> \u2014 \u05d7\u05de\u05d9\u05e9\u05d4 \u05e7\u05dc\u05e4\u05d9\u05dd \u05e8\u05e6\u05d5\u05e4\u05d9\u05dd \u05d1\u05d0\u05d5\u05ea\u05d4 \u05e6\u05d5\u05e8\u05d4.</li><li><strong>\u05e8\u05d1\u05d9\u05e2\u05d9\u05d9\u05d4</strong> \u2014 \u05d0\u05e8\u05d1\u05e2\u05d4 \u05e7\u05dc\u05e4\u05d9\u05dd \u05d1\u05d0\u05d5\u05ea\u05d5 \u05e2\u05e8\u05da.</li><li><strong>\u05e4\u05d5\u05dc \u05d4\u05d0\u05d5\u05e1</strong> \u2014 \u05e9\u05dc\u05d9\u05e9\u05d9\u05d9\u05d4 \u05d5\u05e2\u05d5\u05d3 \u05d6\u05d5\u05d2.</li><li><strong>\u05e4\u05dc\u05d0\u05e9</strong> \u2014 \u05d7\u05de\u05d9\u05e9\u05d4 \u05e7\u05dc\u05e4\u05d9\u05dd \u05d1\u05d0\u05d5\u05ea\u05d4 \u05e6\u05d5\u05e8\u05d4.</li><li><strong>\u05e1\u05d8\u05e8\u05d9\u05d9\u05d8</strong> \u2014 \u05d7\u05de\u05d9\u05e9\u05d4 \u05e7\u05dc\u05e4\u05d9\u05dd \u05e8\u05e6\u05d5\u05e4\u05d9\u05dd \u05d1\u05e6\u05d5\u05e8\u05d5\u05ea \u05e9\u05d5\u05e0\u05d5\u05ea.</li><li><strong>\u05e9\u05dc\u05d9\u05e9\u05d9\u05d9\u05d4</strong> \u2014 \u05e9\u05dc\u05d5\u05e9\u05d4 \u05e7\u05dc\u05e4\u05d9\u05dd \u05d1\u05d0\u05d5\u05ea\u05d5 \u05e2\u05e8\u05da.</li><li><strong>\u05e9\u05e0\u05d9 \u05d6\u05d5\u05d2\u05d5\u05ea</strong> \u2014 \u05e9\u05e0\u05d9 \u05d6\u05d5\u05d2\u05d5\u05ea \u05e9\u05d5\u05e0\u05d9\u05dd.</li><li><strong>\u05d6\u05d5\u05d2</strong> \u2014 \u05e9\u05e0\u05d9 \u05e7\u05dc\u05e4\u05d9\u05dd \u05d1\u05d0\u05d5\u05ea\u05d5 \u05e2\u05e8\u05da.</li><li><strong>\u05e7\u05dc\u05e3 \u05d2\u05d1\u05d5\u05d4</strong> \u2014 \u05d0\u05e3 \u05d0\u05d7\u05d3 \u05de\u05d4\u05e6\u05d9\u05e8\u05d5\u05e4\u05d9\u05dd \u05e9\u05dc\u05de\u05e2\u05dc\u05d4; \u05d4\u05e7\u05dc\u05e3 \u05d4\u05d2\u05d1\u05d5\u05d4 \u05d1\u05d9\u05d5\u05ea\u05e8 \u05de\u05db\u05e8\u05d9\u05e2.</li></ol><h2>\u05d8\u05d5\u05e8\u05e0\u05d9\u05e8\u05d9\u05dd \u05d1-PokerTH</h2><p>\u05d4\u05de\u05e9\u05d7\u05e7\u05d9\u05dd \u05d1-PokerTH \u05d4\u05dd \u05d8\u05d5\u05e8\u05e0\u05d9\u05e8\u05d9\u05dd \u05d1\u05e1\u05d2\u05e0\u05d5\u05df sit-and-go: \u05db\u05d5\u05dc\u05dd \u05de\u05ea\u05d7\u05d9\u05dc\u05d9\u05dd \u05e2\u05dd \u05d0\u05d5\u05ea\u05d4 \u05e2\u05e8\u05d9\u05de\u05d4, \u05d4\u05e2\u05d9\u05d5\u05d5\u05e8\u05d9\u05dd \u05e2\u05d5\u05dc\u05d9\u05dd \u05e2\u05dd \u05d4\u05d6\u05de\u05df, \u05d5\u05d4\u05e9\u05d7\u05e7\u05df \u05d4\u05d0\u05d7\u05e8\u05d5\u05df \u05e9\u05e0\u05d5\u05ea\u05e8\u05d5 \u05dc\u05d5 \u05d6\u05f3\u05d9\u05d8\u05d5\u05e0\u05d9\u05dd \u05de\u05e0\u05e6\u05d7. \u05d0\u05e4\u05e9\u05e8 \u05dc\u05d4\u05ea\u05d0\u05de\u05df \u05dc\u05d0 \u05de\u05e7\u05d5\u05d5\u05df \u05de\u05d5\u05dc \u05d9\u05e8\u05d9\u05d1\u05d9\u05dd \u05de\u05de\u05d5\u05d7\u05e9\u05d1\u05d9\u05dd, \u05dc\u05e9\u05d7\u05e7 \u05d1\u05e8\u05e9\u05ea \u05de\u05e7\u05d5\u05de\u05d9\u05ea \u05d0\u05d5 \u05d1\u05e9\u05e8\u05ea \u05e4\u05e8\u05d8\u05d9, \u05d0\u05d5 \u05dc\u05d4\u05e6\u05d8\u05e8\u05e3 \u05dc\u05e8\u05e9\u05ea \u05d4\u05e8\u05e9\u05de\u05d9\u05ea pokerth.net \u05e2\u05dd \u05d4\u05d3\u05d9\u05e8\u05d5\u05d2\u05d9\u05dd \u05d4\u05e2\u05d5\u05e0\u05ea\u05d9\u05d9\u05dd \u05e9\u05dc\u05d4.</p>" },
  fa: {
    title: "\u0642\u0648\u0627\u0639\u062f \u062a\u06af\u0632\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u2014 \u0646\u0633\u062e\u0647 \u0648\u0628 PokerTH",
    desc: "\u0642\u0648\u0627\u0639\u062f \u06a9\u0627\u0645\u0644 \u062a\u06af\u0632\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u0647\u0645\u0627\u0646\u200c\u06af\u0648\u0646\u0647 \u06a9\u0647 \u062f\u0631 PokerTH \u0628\u0627\u0632\u06cc \u0645\u06cc\u200c\u0634\u0648\u062f: \u0628\u0644\u0627\u06cc\u0646\u062f\u0647\u0627\u060c \u0686\u0647\u0627\u0631 \u062f\u0648\u0631 \u0634\u0631\u0637\u200c\u0628\u0646\u062f\u06cc\u060c Fold/Check/Call/Raise/All-In\u060c \u067e\u0627\u062a\u200c\u0647\u0627\u06cc \u062c\u0627\u0646\u0628\u06cc \u0648 \u0631\u062a\u0628\u0647\u200c\u0628\u0646\u062f\u06cc \u062f\u0633\u062a\u200c\u0647\u0627.",
    ldHeadline: "\u0642\u0648\u0627\u0639\u062f \u067e\u0648\u06a9\u0631 \u062a\u06af\u0632\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u2014 PokerTH",
    ldDesc: "\u0686\u06af\u0648\u0646\u0647 \u062a\u06af\u0632\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u0628\u062f\u0648\u0646 \u0633\u0642\u0641 \u0628\u0627\u0632\u06cc \u06a9\u0646\u06cc\u0645: \u0628\u0644\u0627\u06cc\u0646\u062f\u0647\u0627\u060c \u062f\u0648\u0631\u0647\u0627\u06cc \u0634\u0631\u0637\u200c\u0628\u0646\u062f\u06cc\u060c \u062d\u0631\u06a9\u062a\u200c\u0647\u0627 \u0648 \u0631\u062a\u0628\u0647\u200c\u0628\u0646\u062f\u06cc \u062f\u0633\u062a\u200c\u0647\u0627\u060c \u0645\u0627\u0646\u0646\u062f PokerTH.",
    body: "<h1>\u0642\u0648\u0627\u0639\u062f \u067e\u0648\u06a9\u0631 \u062a\u06af\u0632\u0627\u0633 \u0647\u0648\u0644\u062f\u0645</h1><p>\u062f\u0631 PokerTH \u062a\u06af\u0632\u0627\u0633 \u0647\u0648\u0644\u062f\u0645 \u0628\u062f\u0648\u0646 \u0633\u0642\u0641 \u0628\u0627\u0632\u06cc \u0645\u06cc\u200c\u0634\u0648\u062f\u061b \u0645\u062d\u0628\u0648\u0628\u200c\u062a\u0631\u06cc\u0646 \u06af\u0648\u0646\u0647\u0654 \u067e\u0648\u06a9\u0631 \u062f\u0631 \u062c\u0647\u0627\u0646. \u0647\u0631 \u0628\u0627\u0632\u06cc\u06a9\u0646 \u0645\u06cc\u200c\u06a9\u0648\u0634\u062f \u0628\u0647\u062a\u0631\u06cc\u0646 \u062f\u0633\u062a \u067e\u0646\u062c\u200c\u06a9\u0627\u0631\u062a\u06cc \u0631\u0627 \u0627\u0632 \u062f\u0648 \u06a9\u0627\u0631\u062a \u0634\u062e\u0635\u06cc \u0648 \u067e\u0646\u062c \u06a9\u0627\u0631\u062a \u0645\u0634\u062a\u0631\u06a9 \u0628\u0633\u0627\u0632\u062f.</p><h2>\u067e\u062e\u0634 \u06a9\u0627\u0631\u062a \u0648 \u0628\u0644\u0627\u06cc\u0646\u062f\u0647\u0627</h2><p>\u0647\u0631 \u062f\u0633\u062a \u0628\u0627 \u062f\u0648 \u0634\u0631\u0637 \u0627\u062c\u0628\u0627\u0631\u06cc \u0622\u063a\u0627\u0632 \u0645\u06cc\u200c\u0634\u0648\u062f: \u0628\u0627\u0632\u06cc\u06a9\u0646 \u0633\u0645\u062a \u0686\u067e \u062f\u06a9\u0645\u0647\u0654 \u062f\u06cc\u0644\u0631 <em>\u0628\u0644\u0627\u06cc\u0646\u062f \u06a9\u0648\u0686\u06a9</em> \u0631\u0627 \u0645\u06cc\u200c\u06af\u0630\u0627\u0631\u062f \u0648 \u0646\u0641\u0631 \u0628\u0639\u062f\u06cc <em>\u0628\u0644\u0627\u06cc\u0646\u062f \u0628\u0632\u0631\u06af</em> \u0631\u0627. \u0633\u067e\u0633 \u0628\u0647 \u0647\u0631 \u0628\u0627\u0632\u06cc\u06a9\u0646 \u062f\u0648 \u06a9\u0627\u0631\u062a \u0628\u0633\u062a\u0647 (<em>\u06a9\u0627\u0631\u062a\u200c\u0647\u0627\u06cc \u0634\u062e\u0635\u06cc</em>) \u062f\u0627\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f. \u062f\u06a9\u0645\u0647 \u067e\u0633 \u0627\u0632 \u0647\u0631 \u062f\u0633\u062a \u06cc\u06a9 \u0635\u0646\u062f\u0644\u06cc \u062f\u0631 \u062c\u0647\u062a \u0639\u0642\u0631\u0628\u0647\u200c\u0647\u0627\u06cc \u0633\u0627\u0639\u062a \u062c\u0627\u0628\u0647\u200c\u062c\u0627 \u0645\u06cc\u200c\u0634\u0648\u062f \u0648 \u062f\u0631 PokerTH \u0628\u0644\u0627\u06cc\u0646\u062f\u0647\u0627 \u062f\u0631 \u0641\u0648\u0627\u0635\u0644 \u0645\u0646\u0638\u0645 \u0628\u0627\u0644\u0627 \u0645\u06cc\u200c\u0631\u0648\u0646\u062f.</p><h2>\u0686\u0647\u0627\u0631 \u062f\u0648\u0631 \u0634\u0631\u0637\u200c\u0628\u0646\u062f\u06cc</h2><ul><li><strong>Pre-flop</strong> \u2014 \u067e\u0633 \u0627\u0632 \u062f\u0631\u06cc\u0627\u0641\u062a \u06a9\u0627\u0631\u062a\u200c\u0647\u0627\u06cc \u0634\u062e\u0635\u06cc\u060c \u0628\u0627\u0632\u06cc\u06a9\u0646\u0627\u0646 \u0628\u0647 \u0646\u0648\u0628\u062a \u0648 \u0627\u0632 \u0633\u0645\u062a \u0686\u067e \u0628\u0644\u0627\u06cc\u0646\u062f \u0628\u0632\u0631\u06af \u0628\u0627\u0632\u06cc \u0645\u06cc\u200c\u06a9\u0646\u0646\u062f.</li><li><strong>Flop</strong> \u2014 \u0633\u0647 \u06a9\u0627\u0631\u062a \u0645\u0634\u062a\u0631\u06a9 \u0631\u0648 \u0628\u0627\u0632 \u0645\u06cc\u200c\u0634\u0648\u062f \u0648 \u067e\u0633 \u0627\u0632 \u0622\u0646 \u06cc\u06a9 \u062f\u0648\u0631 \u0634\u0631\u0637\u200c\u0628\u0646\u062f\u06cc \u0627\u0646\u062c\u0627\u0645 \u0645\u06cc\u200c\u06af\u06cc\u0631\u062f.</li><li><strong>Turn</strong> \u2014 \u06a9\u0627\u0631\u062a \u0645\u0634\u062a\u0631\u06a9 \u0686\u0647\u0627\u0631\u0645 \u067e\u062e\u0634 \u0645\u06cc\u200c\u0634\u0648\u062f \u0648 \u062f\u0648\u0631 \u062f\u06cc\u06af\u0631\u06cc \u0627\u0632 \u0634\u0631\u0637\u200c\u0628\u0646\u062f\u06cc \u062f\u0631 \u067e\u06cc \u0645\u06cc\u200c\u0622\u06cc\u062f.</li><li><strong>River</strong> \u2014 \u06a9\u0627\u0631\u062a \u0645\u0634\u062a\u0631\u06a9 \u067e\u0646\u062c\u0645 \u0648 \u067e\u0627\u06cc\u0627\u0646\u06cc \u067e\u062e\u0634 \u0645\u06cc\u200c\u0634\u0648\u062f \u0648 \u062f\u0648\u0631 \u0622\u062e\u0631 \u0634\u0631\u0637\u200c\u0628\u0646\u062f\u06cc \u0628\u0631\u06af\u0632\u0627\u0631 \u0645\u06cc\u200c\u0634\u0648\u062f.</li></ul><h2>\u062d\u0631\u06a9\u062a\u200c\u0647\u0627</h2><ul><li><strong>Fold</strong> \u2014 \u06a9\u0646\u0627\u0631 \u06af\u0630\u0627\u0634\u062a\u0646 \u062f\u0633\u062a \u0648 \u0686\u0634\u0645\u200c\u067e\u0648\u0634\u06cc \u0627\u0632 \u0698\u062a\u0648\u0646\u200c\u0647\u0627\u06cc\u06cc \u06a9\u0647 \u067e\u06cc\u0634\u200c\u062a\u0631 \u06af\u0630\u0627\u0634\u062a\u0647\u200c\u0627\u06cc\u062f.</li><li><strong>Check</strong> \u2014 \u0631\u062f \u06a9\u0631\u062f\u0646 \u0646\u0648\u0628\u062a \u0628\u062f\u0648\u0646 \u0634\u0631\u0637\u200c\u0628\u0646\u062f\u06cc (\u062a\u0646\u0647\u0627 \u0627\u06af\u0631 \u062f\u0631 \u0627\u06cc\u0646 \u062f\u0648\u0631 \u06a9\u0633\u06cc \u0634\u0631\u0637 \u0646\u0628\u0633\u062a\u0647 \u0628\u0627\u0634\u062f).</li><li><strong>Call</strong> \u2014 \u0628\u0631\u0627\u0628\u0631 \u06a9\u0631\u062f\u0646 \u0628\u0627\u0644\u0627\u062a\u0631\u06cc\u0646 \u0634\u0631\u0637 \u06a9\u0646\u0648\u0646\u06cc.</li><li><strong>Raise</strong> \u2014 \u0628\u0627\u0644\u0627 \u0628\u0631\u062f\u0646 \u0634\u0631\u0637 \u06a9\u0646\u0648\u0646\u06cc. \u062f\u0631 \u0628\u0627\u0632\u06cc \u0628\u062f\u0648\u0646 \u0633\u0642\u0641\u060c \u0628\u0647 \u0647\u0631 \u0627\u0646\u062f\u0627\u0632\u0647 \u062a\u0627 \u06a9\u0644 \u0698\u062a\u0648\u0646\u200c\u0647\u0627\u06cc \u0634\u0645\u0627.</li><li><strong>All-In</strong> \u2014 \u06af\u0630\u0627\u0634\u062a\u0646 \u0647\u0645\u0647\u0654 \u0698\u062a\u0648\u0646\u200c\u0647\u0627. \u0627\u06af\u0631 \u062f\u06cc\u06af\u0631\u0627\u0646 \u0628\u0627\u0644\u0627\u062a\u0631 \u0627\u0632 \u0622\u0646 \u0628\u0647 \u0634\u0631\u0637\u200c\u0628\u0646\u062f\u06cc \u0627\u062f\u0627\u0645\u0647 \u062f\u0647\u0646\u062f\u060c \u067e\u0627\u062a\u200c\u0647\u0627\u06cc \u062c\u0627\u0646\u0628\u06cc \u0633\u0627\u062e\u062a\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f \u0648 \u0634\u0645\u0627 \u062a\u0646\u0647\u0627 \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u06cc\u062f \u0628\u062e\u0634\u06cc \u0627\u0632 \u067e\u0627\u062a \u0631\u0627 \u0628\u0628\u0631\u06cc\u062f \u06a9\u0647 \u062f\u0631 \u0622\u0646 \u0633\u0647\u06cc\u0645 \u0628\u0648\u062f\u0647\u200c\u0627\u06cc\u062f.</li></ul><h2>\u0631\u0648 \u06a9\u0631\u062f\u0646 \u06a9\u0627\u0631\u062a\u200c\u0647\u0627</h2><p>\u0627\u06af\u0631 \u067e\u0633 \u0627\u0632 \u062f\u0648\u0631 \u0634\u0631\u0637\u200c\u0628\u0646\u062f\u06cc \u0631\u0648\u06cc river \u062f\u0648 \u0628\u0627\u0632\u06cc\u06a9\u0646 \u06cc\u0627 \u0628\u06cc\u0634\u062a\u0631 \u0645\u0627\u0646\u062f\u0647 \u0628\u0627\u0634\u0646\u062f\u060c \u062f\u0633\u062a\u200c\u0647\u0627 \u0631\u0648 \u0645\u06cc\u200c\u0634\u0648\u062f. \u0628\u0647\u062a\u0631\u06cc\u0646 \u062a\u0631\u06a9\u06cc\u0628 \u067e\u0646\u062c\u200c\u06a9\u0627\u0631\u062a\u06cc \u0627\u0632 \u0647\u0641\u062a \u06a9\u0627\u0631\u062a \u062f\u0631 \u062f\u0633\u062a\u0631\u0633 (\u062f\u0648 \u06a9\u0627\u0631\u062a \u0634\u062e\u0635\u06cc + \u067e\u0646\u062c \u06a9\u0627\u0631\u062a \u0645\u0634\u062a\u0631\u06a9) \u067e\u0627\u062a \u0631\u0627 \u0645\u06cc\u200c\u0628\u0631\u062f \u0648 \u062f\u0633\u062a\u200c\u0647\u0627\u06cc \u0628\u0631\u0627\u0628\u0631 \u0622\u0646 \u0631\u0627 \u062a\u0642\u0633\u06cc\u0645 \u0645\u06cc\u200c\u06a9\u0646\u0646\u062f.</p><h2>\u0631\u062a\u0628\u0647\u200c\u0628\u0646\u062f\u06cc \u062f\u0633\u062a\u200c\u0647\u0627\u060c \u0627\u0632 \u0642\u0648\u06cc\u200c\u062a\u0631\u06cc\u0646 \u0628\u0647 \u0636\u0639\u06cc\u0641\u200c\u062a\u0631\u06cc\u0646</h2><ol><li><strong>\u0631\u0648\u06cc\u0627\u0644 \u0641\u0644\u0627\u0634</strong> \u2014 A K Q J 10 \u0627\u0632 \u06cc\u06a9 \u062e\u0627\u0644.</li><li><strong>\u0627\u0633\u062a\u0631\u06cc\u062a \u0641\u0644\u0627\u0634</strong> \u2014 \u067e\u0646\u062c \u06a9\u0627\u0631\u062a \u067e\u0634\u062a\u200c\u0633\u0631\u0647\u0645 \u0627\u0632 \u06cc\u06a9 \u062e\u0627\u0644.</li><li><strong>\u0686\u0647\u0627\u0631 \u06a9\u0627\u0631\u062a\u06cc</strong> \u2014 \u0686\u0647\u0627\u0631 \u06a9\u0627\u0631\u062a \u0647\u0645\u200c\u0627\u0631\u0632\u0634.</li><li><strong>\u0641\u0648\u0644 \u0647\u0627\u0648\u0633</strong> \u2014 \u06cc\u06a9 \u0633\u0647\u200c\u06a9\u0627\u0631\u062a\u06cc \u0628\u0647\u200c\u0647\u0645\u0631\u0627\u0647 \u06cc\u06a9 \u062c\u0641\u062a.</li><li><strong>\u0641\u0644\u0627\u0634</strong> \u2014 \u067e\u0646\u062c \u06a9\u0627\u0631\u062a \u0627\u0632 \u06cc\u06a9 \u062e\u0627\u0644.</li><li><strong>\u0627\u0633\u062a\u0631\u06cc\u062a</strong> \u2014 \u067e\u0646\u062c \u06a9\u0627\u0631\u062a \u067e\u0634\u062a\u200c\u0633\u0631\u0647\u0645 \u0627\u0632 \u062e\u0627\u0644\u200c\u0647\u0627\u06cc \u0645\u062a\u0641\u0627\u0648\u062a.</li><li><strong>\u0633\u0647\u200c\u06a9\u0627\u0631\u062a\u06cc</strong> \u2014 \u0633\u0647 \u06a9\u0627\u0631\u062a \u0647\u0645\u200c\u0627\u0631\u0632\u0634.</li><li><strong>\u062f\u0648 \u062c\u0641\u062a</strong> \u2014 \u062f\u0648 \u062c\u0641\u062a \u0645\u062a\u0641\u0627\u0648\u062a.</li><li><strong>\u06cc\u06a9 \u062c\u0641\u062a</strong> \u2014 \u062f\u0648 \u06a9\u0627\u0631\u062a \u0647\u0645\u200c\u0627\u0631\u0632\u0634.</li><li><strong>\u06a9\u0627\u0631\u062a \u0628\u0627\u0644\u0627</strong> \u2014 \u0647\u06cc\u0686\u200c\u06a9\u062f\u0627\u0645 \u0627\u0632 \u0645\u0648\u0627\u0631\u062f \u0628\u0627\u0644\u0627\u061b \u0628\u0627\u0644\u0627\u062a\u0631\u06cc\u0646 \u06a9\u0627\u0631\u062a \u062a\u0639\u06cc\u06cc\u0646\u200c\u06a9\u0646\u0646\u062f\u0647 \u0627\u0633\u062a.</li></ol><h2>\u062a\u0648\u0631\u0646\u0645\u0646\u062a\u200c\u0647\u0627 \u062f\u0631 PokerTH</h2><p>\u0628\u0627\u0632\u06cc\u200c\u0647\u0627\u06cc PokerTH \u062a\u0648\u0631\u0646\u0645\u0646\u062a\u200c\u0647\u0627\u06cc\u06cc \u0627\u0632 \u0646\u0648\u0639 sit-and-go \u0647\u0633\u062a\u0646\u062f: \u0647\u0645\u0647 \u0628\u0627 \u0698\u062a\u0648\u0646 \u0628\u0631\u0627\u0628\u0631 \u0622\u063a\u0627\u0632 \u0645\u06cc\u200c\u06a9\u0646\u0646\u062f\u060c \u0628\u0644\u0627\u06cc\u0646\u062f\u0647\u0627 \u0628\u0627 \u06af\u0630\u0631 \u0632\u0645\u0627\u0646 \u0628\u0627\u0644\u0627 \u0645\u06cc\u200c\u0631\u0648\u0646\u062f \u0648 \u0622\u062e\u0631\u06cc\u0646 \u0628\u0627\u0632\u06cc\u06a9\u0646\u06cc \u06a9\u0647 \u0698\u062a\u0648\u0646 \u062f\u0627\u0631\u062f \u0628\u0631\u0646\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f. \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u06cc\u062f \u0622\u0641\u0644\u0627\u06cc\u0646 \u062f\u0631 \u0628\u0631\u0627\u0628\u0631 \u062d\u0631\u06cc\u0641\u0627\u0646 \u0631\u0627\u06cc\u0627\u0646\u0647\u200c\u0627\u06cc \u062a\u0645\u0631\u06cc\u0646 \u06a9\u0646\u06cc\u062f\u060c \u0631\u0648\u06cc \u0634\u0628\u06a9\u0647\u0654 \u0645\u062d\u0644\u06cc \u06cc\u0627 \u0633\u0631\u0648\u0631 \u0634\u062e\u0635\u06cc \u0628\u0627\u0632\u06cc \u06a9\u0646\u06cc\u062f\u060c \u06cc\u0627 \u0628\u0647 \u0634\u0628\u06a9\u0647\u0654 \u0631\u0633\u0645\u06cc pokerth.net \u0628\u0627 \u0631\u062a\u0628\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627\u06cc \u0641\u0635\u0644\u06cc \u0622\u0646 \u0628\u067e\u06cc\u0648\u0646\u062f\u06cc\u062f.</p>" },
  hi: {
    title: "Texas Hold\u2019em \u0915\u0947 \u0928\u093f\u092f\u092e \u2014 PokerTH \u0935\u0947\u092c \u0915\u094d\u0932\u093e\u0907\u0902\u091f",
    desc: "PokerTH \u092e\u0947\u0902 \u0916\u0947\u0932\u0947 \u091c\u093e\u0928\u0947 \u0935\u093e\u0932\u0947 Texas Hold\u2019em \u0915\u0947 \u092a\u0942\u0930\u0947 \u0928\u093f\u092f\u092e: \u092c\u094d\u0932\u093e\u0907\u0902\u0921, \u091a\u093e\u0930 \u0926\u093e\u0902\u0935 \u0915\u0947 \u0926\u094c\u0930, Fold/Check/Call/Raise/All-In, \u0938\u093e\u0907\u0921 \u092a\u0949\u091f \u0914\u0930 \u0939\u093e\u0925\u094b\u0902 \u0915\u0940 \u0930\u0948\u0902\u0915\u093f\u0902\u0917\u0964",
    ldHeadline: "Texas Hold\u2019em \u092a\u094b\u0915\u0930 \u0915\u0947 \u0928\u093f\u092f\u092e \u2014 PokerTH",
    ldDesc: "No-Limit Texas Hold\u2019em \u0915\u0948\u0938\u0947 \u0916\u0947\u0932\u0947\u0902: \u092c\u094d\u0932\u093e\u0907\u0902\u0921, \u0926\u093e\u0902\u0935 \u0915\u0947 \u0926\u094c\u0930, \u0915\u094d\u0930\u093f\u092f\u093e\u090f\u0901 \u0914\u0930 \u0939\u093e\u0925\u094b\u0902 \u0915\u0940 \u0930\u0948\u0902\u0915\u093f\u0902\u0917, \u091c\u0948\u0938\u093e PokerTH \u092e\u0947\u0902 \u0939\u0948\u0964",
    body: "<h1>Texas Hold\u2019em \u092a\u094b\u0915\u0930 \u0915\u0947 \u0928\u093f\u092f\u092e</h1><p>PokerTH \u092e\u0947\u0902 No-Limit Texas Hold\u2019em \u0916\u0947\u0932\u093e \u091c\u093e\u0924\u093e \u0939\u0948, \u091c\u094b \u0926\u0941\u0928\u093f\u092f\u093e \u0915\u093e \u0938\u092c\u0938\u0947 \u0932\u094b\u0915\u092a\u094d\u0930\u093f\u092f \u092a\u094b\u0915\u0930 \u0930\u0942\u092a \u0939\u0948\u0964 \u0939\u0930 \u0916\u093f\u0932\u093e\u0921\u093c\u0940 \u0905\u092a\u0928\u0947 \u0926\u094b \u0928\u093f\u091c\u0940 \u092a\u0924\u094d\u0924\u094b\u0902 \u0914\u0930 \u092a\u093e\u0901\u091a \u0938\u093e\u091d\u093e \u092a\u0924\u094d\u0924\u094b\u0902 \u0938\u0947 \u092a\u093e\u0901\u091a \u092a\u0924\u094d\u0924\u094b\u0902 \u0915\u093e \u0938\u092c\u0938\u0947 \u0905\u091a\u094d\u091b\u093e \u0939\u093e\u0925 \u092c\u0928\u093e\u0928\u0947 \u0915\u0940 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0924\u093e \u0939\u0948\u0964</p><h2>\u092a\u0924\u094d\u0924\u0947 \u092c\u093e\u0901\u091f\u0928\u093e \u0914\u0930 \u092c\u094d\u0932\u093e\u0907\u0902\u0921</h2><p>\u0939\u0930 \u0939\u093e\u0925 \u0926\u094b \u0905\u0928\u093f\u0935\u093e\u0930\u094d\u092f \u0926\u093e\u0902\u0935\u094b\u0902 \u0938\u0947 \u0936\u0941\u0930\u0942 \u0939\u094b\u0924\u093e \u0939\u0948: \u0921\u0940\u0932\u0930 \u092c\u091f\u0928 \u0915\u0947 \u092c\u093e\u0908\u0902 \u0913\u0930 \u092c\u0948\u0920\u093e \u0916\u093f\u0932\u093e\u0921\u093c\u0940 <em>\u091b\u094b\u091f\u093e \u092c\u094d\u0932\u093e\u0907\u0902\u0921</em> \u0932\u0917\u093e\u0924\u093e \u0939\u0948 \u0914\u0930 \u0909\u0938\u0915\u0947 \u092c\u093e\u0926 \u0935\u093e\u0932\u093e <em>\u092c\u0921\u093c\u093e \u092c\u094d\u0932\u093e\u0907\u0902\u0921</em>\u0964 \u092b\u093f\u0930 \u0939\u0930 \u0916\u093f\u0932\u093e\u0921\u093c\u0940 \u0915\u094b \u0926\u094b \u092c\u0902\u0926 \u092a\u0924\u094d\u0924\u0947 (<em>\u0928\u093f\u091c\u0940 \u092a\u0924\u094d\u0924\u0947</em>) \u092e\u093f\u0932\u0924\u0947 \u0939\u0948\u0902\u0964 \u0939\u0930 \u0939\u093e\u0925 \u0915\u0947 \u092c\u093e\u0926 \u092c\u091f\u0928 \u0918\u0921\u093c\u0940 \u0915\u0940 \u0926\u093f\u0936\u093e \u092e\u0947\u0902 \u090f\u0915 \u0938\u094d\u0925\u093e\u0928 \u0906\u0917\u0947 \u092c\u0922\u093c\u0924\u093e \u0939\u0948, \u0914\u0930 PokerTH \u092e\u0947\u0902 \u092c\u094d\u0932\u093e\u0907\u0902\u0921 \u0928\u093f\u092f\u092e\u093f\u0924 \u0905\u0902\u0924\u0930\u093e\u0932 \u092a\u0930 \u092c\u0922\u093c\u0924\u0947 \u0939\u0948\u0902\u0964</p><h2>\u0926\u093e\u0902\u0935 \u0915\u0947 \u091a\u093e\u0930 \u0926\u094c\u0930</h2><ul><li><strong>Pre-flop</strong> \u2014 \u0928\u093f\u091c\u0940 \u092a\u0924\u094d\u0924\u0947 \u092e\u093f\u0932\u0928\u0947 \u0915\u0947 \u092c\u093e\u0926 \u0916\u093f\u0932\u093e\u0921\u093c\u0940 \u092c\u093e\u0930\u0940-\u092c\u093e\u0930\u0940 \u0938\u0947 \u0916\u0947\u0932\u0924\u0947 \u0939\u0948\u0902, \u092c\u0921\u093c\u0947 \u092c\u094d\u0932\u093e\u0907\u0902\u0921 \u0915\u0947 \u092c\u093e\u0908\u0902 \u0913\u0930 \u0938\u0947 \u0936\u0941\u0930\u0942 \u0915\u0930\u0915\u0947\u0964</li><li><strong>Flop</strong> \u2014 \u0924\u0940\u0928 \u0938\u093e\u091d\u093e \u092a\u0924\u094d\u0924\u0947 \u0916\u0941\u0932\u0947 \u0930\u0916\u0947 \u091c\u093e\u0924\u0947 \u0939\u0948\u0902, \u0909\u0938\u0915\u0947 \u092c\u093e\u0926 \u0926\u093e\u0902\u0935 \u0915\u093e \u090f\u0915 \u0926\u094c\u0930 \u0939\u094b\u0924\u093e \u0939\u0948\u0964</li><li><strong>Turn</strong> \u2014 \u091a\u094c\u0925\u093e \u0938\u093e\u091d\u093e \u092a\u0924\u094d\u0924\u093e \u0906\u0924\u093e \u0939\u0948 \u0914\u0930 \u092b\u093f\u0930 \u0926\u093e\u0902\u0935 \u0915\u093e \u090f\u0915 \u0914\u0930 \u0926\u094c\u0930 \u0939\u094b\u0924\u093e \u0939\u0948\u0964</li><li><strong>River</strong> \u2014 \u092a\u093e\u0901\u091a\u0935\u093e\u0901 \u0914\u0930 \u0906\u0916\u093f\u0930\u0940 \u0938\u093e\u091d\u093e \u092a\u0924\u094d\u0924\u093e \u0906\u0924\u093e \u0939\u0948, \u0909\u0938\u0915\u0947 \u092c\u093e\u0926 \u0926\u093e\u0902\u0935 \u0915\u093e \u0905\u0902\u0924\u093f\u092e \u0926\u094c\u0930 \u0939\u094b\u0924\u093e \u0939\u0948\u0964</li></ul><h2>\u0915\u094d\u0930\u093f\u092f\u093e\u090f\u0901</h2><ul><li><strong>Fold</strong> \u2014 \u0939\u093e\u0925 \u091b\u094b\u0921\u093c \u0926\u0947\u0928\u093e \u0914\u0930 \u092a\u0939\u0932\u0947 \u0932\u0917\u093e\u0908 \u0917\u0908 \u091a\u093f\u092a\u094d\u0938 \u092d\u0940 \u091b\u094b\u0921\u093c \u0926\u0947\u0928\u093e\u0964</li><li><strong>Check</strong> \u2014 \u092c\u093f\u0928\u093e \u0926\u093e\u0902\u0935 \u0932\u0917\u093e\u090f \u092c\u093e\u0930\u0940 \u0906\u0917\u0947 \u092c\u0922\u093c\u093e\u0928\u093e (\u0938\u093f\u0930\u094d\u092b\u093c \u0924\u092c \u091c\u092c \u0909\u0938 \u0926\u094c\u0930 \u092e\u0947\u0902 \u0915\u093f\u0938\u0940 \u0928\u0947 \u0926\u093e\u0902\u0935 \u0928 \u0932\u0917\u093e\u092f\u093e \u0939\u094b)\u0964</li><li><strong>Call</strong> \u2014 \u092e\u094c\u091c\u0942\u0926\u093e \u0938\u092c\u0938\u0947 \u090a\u0901\u091a\u0947 \u0926\u093e\u0902\u0935 \u0915\u0947 \u092c\u0930\u093e\u092c\u0930 \u0932\u0917\u093e\u0928\u093e\u0964</li><li><strong>Raise</strong> \u2014 \u092e\u094c\u091c\u0942\u0926\u093e \u0926\u093e\u0902\u0935 \u092c\u0922\u093c\u093e\u0928\u093e\u0964 No-Limit \u092e\u0947\u0902 \u0905\u092a\u0928\u0940 \u092a\u0942\u0930\u0940 \u091a\u093f\u092a\u094d\u0938 \u0924\u0915 \u0915\u093f\u0938\u0940 \u092d\u0940 \u0930\u0915\u092e \u0938\u0947\u0964</li><li><strong>All-In</strong> \u2014 \u0905\u092a\u0928\u0940 \u0938\u093e\u0930\u0940 \u091a\u093f\u092a\u094d\u0938 \u0932\u0917\u093e \u0926\u0947\u0928\u093e\u0964 \u0905\u0917\u0930 \u092c\u093e\u0915\u0940 \u0916\u093f\u0932\u093e\u0921\u093c\u0940 \u0909\u0938\u0938\u0947 \u090a\u092a\u0930 \u0926\u093e\u0902\u0935 \u0932\u0917\u093e\u0924\u0947 \u0930\u0939\u0947\u0902 \u0924\u094b \u0938\u093e\u0907\u0921 \u092a\u0949\u091f \u092c\u0928\u0924\u0947 \u0939\u0948\u0902, \u0907\u0938\u0932\u093f\u090f \u0906\u092a \u092a\u0949\u091f \u0915\u093e \u0938\u093f\u0930\u094d\u092b\u093c \u0935\u0939\u0940 \u0939\u093f\u0938\u094d\u0938\u093e \u091c\u0940\u0924 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902 \u091c\u093f\u0938\u092e\u0947\u0902 \u0906\u092a\u0928\u0947 \u092f\u094b\u0917\u0926\u093e\u0928 \u0926\u093f\u092f\u093e \u0939\u0948\u0964</li></ul><h2>\u092a\u0924\u094d\u0924\u0947 \u0926\u093f\u0916\u093e\u0928\u093e</h2><p>\u0905\u0917\u0930 river \u0915\u0947 \u0926\u093e\u0902\u0935 \u0915\u0947 \u0926\u094c\u0930 \u0915\u0947 \u092c\u093e\u0926 \u0926\u094b \u092f\u093e \u0909\u0938\u0938\u0947 \u091c\u093c\u094d\u092f\u093e\u0926\u093e \u0916\u093f\u0932\u093e\u0921\u093c\u0940 \u092c\u091a\u0924\u0947 \u0939\u0948\u0902, \u0924\u094b \u0939\u093e\u0925 \u0916\u094b\u0932\u0947 \u091c\u093e\u0924\u0947 \u0939\u0948\u0902\u0964 \u0938\u093e\u0924 \u0909\u092a\u0932\u092c\u094d\u0927 \u092a\u0924\u094d\u0924\u094b\u0902 (\u0926\u094b \u0928\u093f\u091c\u0940 + \u092a\u093e\u0901\u091a \u0938\u093e\u091d\u093e) \u092e\u0947\u0902 \u0938\u0947 \u092c\u0928\u093e \u092a\u093e\u0901\u091a \u092a\u0924\u094d\u0924\u094b\u0902 \u0915\u093e \u0938\u092c\u0938\u0947 \u0905\u091a\u094d\u091b\u093e \u092e\u0947\u0932 \u092a\u0949\u091f \u091c\u0940\u0924\u0924\u093e \u0939\u0948\u0964 \u092c\u0930\u093e\u092c\u0930 \u0939\u093e\u0925 \u092a\u0949\u091f \u0906\u092a\u0938 \u092e\u0947\u0902 \u092c\u093e\u0901\u091f \u0932\u0947\u0924\u0947 \u0939\u0948\u0902\u0964</p><h2>\u0939\u093e\u0925\u094b\u0902 \u0915\u0940 \u0930\u0948\u0902\u0915\u093f\u0902\u0917, \u0938\u092c\u0938\u0947 \u092e\u091c\u093c\u092c\u0942\u0924 \u0938\u0947 \u0938\u092c\u0938\u0947 \u0915\u092e\u091c\u093c\u094b\u0930 \u0924\u0915</h2><ol><li><strong>\u0930\u0949\u092f\u0932 \u092b\u093c\u094d\u0932\u0936</strong> \u2014 \u090f\u0915 \u0939\u0940 \u0930\u0902\u0917 \u0915\u0947 A K Q J 10\u0964</li><li><strong>\u0938\u094d\u091f\u094d\u0930\u0947\u091f \u092b\u093c\u094d\u0932\u0936</strong> \u2014 \u090f\u0915 \u0939\u0940 \u0930\u0902\u0917 \u0915\u0947 \u0932\u0917\u093e\u0924\u093e\u0930 \u092a\u093e\u0901\u091a \u092a\u0924\u094d\u0924\u0947\u0964</li><li><strong>\u091a\u093e\u0930 \u090f\u0915 \u091c\u0948\u0938\u0947</strong> \u2014 \u090f\u0915 \u0939\u0940 \u0905\u0902\u0915 \u0915\u0947 \u091a\u093e\u0930 \u092a\u0924\u094d\u0924\u0947\u0964</li><li><strong>\u092b\u093c\u0941\u0932 \u0939\u093e\u0909\u0938</strong> \u2014 \u0924\u0940\u0928 \u090f\u0915 \u091c\u0948\u0938\u0947 \u0914\u0930 \u090f\u0915 \u091c\u094b\u0921\u093c\u093e\u0964</li><li><strong>\u092b\u093c\u094d\u0932\u0936</strong> \u2014 \u090f\u0915 \u0939\u0940 \u0930\u0902\u0917 \u0915\u0947 \u092a\u093e\u0901\u091a \u092a\u0924\u094d\u0924\u0947\u0964</li><li><strong>\u0938\u094d\u091f\u094d\u0930\u0947\u091f</strong> \u2014 \u0905\u0932\u0917-\u0905\u0932\u0917 \u0930\u0902\u0917\u094b\u0902 \u0915\u0947 \u0932\u0917\u093e\u0924\u093e\u0930 \u092a\u093e\u0901\u091a \u092a\u0924\u094d\u0924\u0947\u0964</li><li><strong>\u0924\u0940\u0928 \u090f\u0915 \u091c\u0948\u0938\u0947</strong> \u2014 \u090f\u0915 \u0939\u0940 \u0905\u0902\u0915 \u0915\u0947 \u0924\u0940\u0928 \u092a\u0924\u094d\u0924\u0947\u0964</li><li><strong>\u0926\u094b \u091c\u094b\u0921\u093c\u0947</strong> \u2014 \u0926\u094b \u0905\u0932\u0917-\u0905\u0932\u0917 \u091c\u094b\u0921\u093c\u0947\u0964</li><li><strong>\u090f\u0915 \u091c\u094b\u0921\u093c\u093e</strong> \u2014 \u090f\u0915 \u0939\u0940 \u0905\u0902\u0915 \u0915\u0947 \u0926\u094b \u092a\u0924\u094d\u0924\u0947\u0964</li><li><strong>\u090a\u0901\u091a\u093e \u092a\u0924\u094d\u0924\u093e</strong> \u2014 \u090a\u092a\u0930 \u0935\u093e\u0932\u093e \u0915\u0941\u091b \u0928\u0939\u0940\u0902; \u0938\u092c\u0938\u0947 \u090a\u0901\u091a\u093e \u092a\u0924\u094d\u0924\u093e \u0924\u092f \u0915\u0930\u0924\u093e \u0939\u0948\u0964</li></ol><h2>PokerTH \u092e\u0947\u0902 \u091f\u0942\u0930\u094d\u0928\u093e\u092e\u0947\u0902\u091f</h2><p>PokerTH \u0915\u0947 \u0916\u0947\u0932 sit-and-go \u0936\u0948\u0932\u0940 \u0915\u0947 \u091f\u0942\u0930\u094d\u0928\u093e\u092e\u0947\u0902\u091f \u0939\u0948\u0902: \u0938\u092c \u090f\u0915 \u091c\u0948\u0938\u0940 \u091a\u093f\u092a\u094d\u0938 \u0938\u0947 \u0936\u0941\u0930\u0942 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902, \u092c\u094d\u0932\u093e\u0907\u0902\u0921 \u0938\u092e\u092f \u0915\u0947 \u0938\u093e\u0925 \u092c\u0922\u093c\u0924\u0947 \u0939\u0948\u0902, \u0914\u0930 \u0906\u0916\u093c\u093f\u0930 \u0924\u0915 \u091c\u093f\u0938\u0915\u0947 \u092a\u093e\u0938 \u091a\u093f\u092a\u094d\u0938 \u092c\u091a\u0924\u0940 \u0939\u0948\u0902 \u0935\u0939\u0940 \u091c\u0940\u0924\u0924\u093e \u0939\u0948\u0964 \u0906\u092a \u0915\u0902\u092a\u094d\u092f\u0942\u091f\u0930 \u0915\u0947 \u0935\u093f\u0930\u0941\u0926\u094d\u0927 \u0911\u092b\u093c\u0932\u093e\u0907\u0928 \u0905\u092d\u094d\u092f\u093e\u0938 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902, LAN \u092f\u093e \u0928\u093f\u091c\u0940 \u0938\u0930\u094d\u0935\u0930 \u092a\u0930 \u0916\u0947\u0932 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902, \u092f\u093e \u092e\u094c\u0938\u092e\u0940 \u0930\u0948\u0902\u0915\u093f\u0902\u0917 \u0935\u093e\u0932\u0947 \u0906\u0927\u093f\u0915\u093e\u0930\u093f\u0915 pokerth.net \u0928\u0947\u091f\u0935\u0930\u094d\u0915 \u0938\u0947 \u091c\u0941\u0921\u093c \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964</p>" },
  ur: {
    title: "\u0679\u06cc\u06a9\u0633\u0627\u0633 \u06c1\u0648\u0644\u0688\u0645 \u06a9\u06d2 \u0627\u0635\u0648\u0644 \u2014 PokerTH \u0648\u06cc\u0628 \u06a9\u0644\u0627\u0626\u0646\u0679",
    desc: "PokerTH \u0645\u06cc\u06ba \u06a9\u06be\u06cc\u0644\u06d2 \u062c\u0627\u0646\u06d2 \u0648\u0627\u0644\u06d2 \u0679\u06cc\u06a9\u0633\u0627\u0633 \u06c1\u0648\u0644\u0688\u0645 \u06a9\u06d2 \u0645\u06a9\u0645\u0644 \u0627\u0635\u0648\u0644: \u0628\u0644\u0627\u0626\u0646\u0688\u0632\u060c \u0634\u0631\u0637 \u06a9\u06d2 \u0686\u0627\u0631 \u062f\u0648\u0631\u060c Fold/Check/Call/Raise/All-In\u060c \u0633\u0627\u0626\u06cc\u0688 \u067e\u0627\u0679 \u0627\u0648\u0631 \u06c1\u0627\u062a\u06be\u0648\u06ba \u06a9\u06cc \u062f\u0631\u062c\u06c1 \u0628\u0646\u062f\u06cc\u06d4",
    ldHeadline: "\u0679\u06cc\u06a9\u0633\u0627\u0633 \u06c1\u0648\u0644\u0688\u0645 \u067e\u0648\u06a9\u0631 \u06a9\u06d2 \u0627\u0635\u0648\u0644 \u2014 PokerTH",
    ldDesc: "No-Limit \u0679\u06cc\u06a9\u0633\u0627\u0633 \u06c1\u0648\u0644\u0688\u0645 \u06a9\u06cc\u0633\u06d2 \u06a9\u06be\u06cc\u0644\u06cc\u06ba: \u0628\u0644\u0627\u0626\u0646\u0688\u0632\u060c \u0634\u0631\u0637 \u06a9\u06d2 \u062f\u0648\u0631\u060c \u062d\u0631\u06a9\u062a\u06cc\u06ba \u0627\u0648\u0631 \u06c1\u0627\u062a\u06be\u0648\u06ba \u06a9\u06cc \u062f\u0631\u062c\u06c1 \u0628\u0646\u062f\u06cc\u060c \u062c\u06cc\u0633\u0627 PokerTH \u0645\u06cc\u06ba \u06c1\u06d2\u06d4",
    body: "<h1>\u0679\u06cc\u06a9\u0633\u0627\u0633 \u06c1\u0648\u0644\u0688\u0645 \u067e\u0648\u06a9\u0631 \u06a9\u06d2 \u0627\u0635\u0648\u0644</h1><p>PokerTH \u0645\u06cc\u06ba No-Limit \u0679\u06cc\u06a9\u0633\u0627\u0633 \u06c1\u0648\u0644\u0688\u0645 \u06a9\u06be\u06cc\u0644\u0627 \u062c\u0627\u062a\u0627 \u06c1\u06d2\u060c \u062c\u0648 \u062f\u0646\u06cc\u0627 \u0645\u06cc\u06ba \u067e\u0648\u06a9\u0631 \u06a9\u06cc \u0633\u0628 \u0633\u06d2 \u0645\u0642\u0628\u0648\u0644 \u0642\u0633\u0645 \u06c1\u06d2\u06d4 \u06c1\u0631 \u06a9\u06be\u0644\u0627\u0691\u06cc \u0627\u067e\u0646\u06d2 \u062f\u0648 \u0630\u0627\u062a\u06cc \u067e\u062a\u0648\u06ba \u0627\u0648\u0631 \u067e\u0627\u0646\u0686 \u0645\u0634\u062a\u0631\u06a9\u06c1 \u067e\u062a\u0648\u06ba \u0633\u06d2 \u067e\u0627\u0646\u0686 \u067e\u062a\u0648\u06ba \u06a9\u0627 \u0628\u06c1\u062a\u0631\u06cc\u0646 \u06c1\u0627\u062a\u06be \u0628\u0646\u0627\u0646\u06d2 \u06a9\u06cc \u06a9\u0648\u0634\u0634 \u06a9\u0631\u062a\u0627 \u06c1\u06d2\u06d4</p><h2>\u067e\u062a\u06d2 \u0628\u0627\u0646\u0679\u0646\u0627 \u0627\u0648\u0631 \u0628\u0644\u0627\u0626\u0646\u0688\u0632</h2><p>\u06c1\u0631 \u06c1\u0627\u062a\u06be \u062f\u0648 \u0644\u0627\u0632\u0645\u06cc \u0634\u0631\u0637\u0648\u06ba \u0633\u06d2 \u0634\u0631\u0648\u0639 \u06c1\u0648\u062a\u0627 \u06c1\u06d2: \u0688\u06cc\u0644\u0631 \u0628\u0679\u0646 \u06a9\u06d2 \u0628\u0627\u0626\u06cc\u06ba \u062c\u0627\u0646\u0628 \u0628\u06cc\u0679\u06be\u0627 \u06a9\u06be\u0644\u0627\u0691\u06cc <em>\u0686\u06be\u0648\u0679\u0627 \u0628\u0644\u0627\u0626\u0646\u0688</em> \u0644\u06af\u0627\u062a\u0627 \u06c1\u06d2 \u0627\u0648\u0631 \u0627\u06af\u0644\u0627 <em>\u0628\u0691\u0627 \u0628\u0644\u0627\u0626\u0646\u0688</em>\u06d4 \u067e\u06be\u0631 \u06c1\u0631 \u06a9\u06be\u0644\u0627\u0691\u06cc \u06a9\u0648 \u062f\u0648 \u0628\u0646\u062f \u067e\u062a\u06d2 (<em>\u0630\u0627\u062a\u06cc \u067e\u062a\u06d2</em>) \u062f\u06cc\u06d2 \u062c\u0627\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4 \u06c1\u0631 \u06c1\u0627\u062a\u06be \u06a9\u06d2 \u0628\u0639\u062f \u0628\u0679\u0646 \u06af\u06be\u0691\u06cc \u06a9\u06cc \u0633\u0645\u062a \u0627\u06cc\u06a9 \u0646\u0634\u0633\u062a \u0622\u06af\u06d2 \u0628\u0691\u06be\u062a\u0627 \u06c1\u06d2\u060c \u0627\u0648\u0631 PokerTH \u0645\u06cc\u06ba \u0628\u0644\u0627\u0626\u0646\u0688\u0632 \u0645\u0642\u0631\u0631\u06c1 \u0648\u0642\u0641\u0648\u06ba \u0633\u06d2 \u0628\u0691\u06be\u062a\u06d2 \u0631\u06c1\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4</p><h2>\u0634\u0631\u0637 \u06a9\u06d2 \u0686\u0627\u0631 \u062f\u0648\u0631</h2><ul><li><strong>Pre-flop</strong> \u2014 \u0630\u0627\u062a\u06cc \u067e\u062a\u06d2 \u0645\u0644\u0646\u06d2 \u06a9\u06d2 \u0628\u0639\u062f \u06a9\u06be\u0644\u0627\u0691\u06cc \u0628\u0627\u0631\u06cc \u0628\u0627\u0631\u06cc \u06a9\u06be\u06cc\u0644\u062a\u06d2 \u06c1\u06cc\u06ba\u060c \u0628\u0691\u06d2 \u0628\u0644\u0627\u0626\u0646\u0688 \u06a9\u06d2 \u0628\u0627\u0626\u06cc\u06ba \u062c\u0627\u0646\u0628 \u0633\u06d2 \u0634\u0631\u0648\u0639 \u06a9\u0631\u062a\u06d2 \u06c1\u0648\u0626\u06d2\u06d4</li><li><strong>Flop</strong> \u2014 \u062a\u06cc\u0646 \u0645\u0634\u062a\u0631\u06a9\u06c1 \u067e\u062a\u06d2 \u06a9\u06be\u0648\u0644 \u06a9\u0631 \u0631\u06a9\u06be\u06d2 \u062c\u0627\u062a\u06d2 \u06c1\u06cc\u06ba\u060c \u0627\u0633 \u06a9\u06d2 \u0628\u0639\u062f \u0634\u0631\u0637 \u06a9\u0627 \u0627\u06cc\u06a9 \u062f\u0648\u0631 \u06c1\u0648\u062a\u0627 \u06c1\u06d2\u06d4</li><li><strong>Turn</strong> \u2014 \u0686\u0648\u062a\u06be\u0627 \u0645\u0634\u062a\u0631\u06a9\u06c1 \u067e\u062a\u06c1 \u0622\u062a\u0627 \u06c1\u06d2 \u0627\u0648\u0631 \u067e\u06be\u0631 \u0634\u0631\u0637 \u06a9\u0627 \u0627\u06cc\u06a9 \u0627\u0648\u0631 \u062f\u0648\u0631 \u06c1\u0648\u062a\u0627 \u06c1\u06d2\u06d4</li><li><strong>River</strong> \u2014 \u067e\u0627\u0646\u0686\u0648\u0627\u06ba \u0627\u0648\u0631 \u0622\u062e\u0631\u06cc \u0645\u0634\u062a\u0631\u06a9\u06c1 \u067e\u062a\u06c1 \u0622\u062a\u0627 \u06c1\u06d2\u060c \u0627\u0633 \u06a9\u06d2 \u0628\u0639\u062f \u0634\u0631\u0637 \u06a9\u0627 \u0622\u062e\u0631\u06cc \u062f\u0648\u0631 \u06c1\u0648\u062a\u0627 \u06c1\u06d2\u06d4</li></ul><h2>\u062d\u0631\u06a9\u062a\u06cc\u06ba</h2><ul><li><strong>Fold</strong> \u2014 \u06c1\u0627\u062a\u06be \u0686\u06be\u0648\u0691 \u062f\u06cc\u0646\u0627 \u0627\u0648\u0631 \u067e\u06c1\u0644\u06d2 \u0644\u06af\u0627\u0626\u06cc \u06af\u0626\u06cc \u0679\u0648\u06a9\u0646 \u0628\u06be\u06cc \u0686\u06be\u0648\u0691 \u062f\u06cc\u0646\u0627\u06d4</li><li><strong>Check</strong> \u2014 \u0634\u0631\u0637 \u0644\u06af\u0627\u0626\u06d2 \u0628\u063a\u06cc\u0631 \u0628\u0627\u0631\u06cc \u0622\u06af\u06d2 \u0628\u0691\u06be\u0627\u0646\u0627 (\u0635\u0631\u0641 \u0627\u0633 \u0635\u0648\u0631\u062a \u0645\u06cc\u06ba \u062c\u0628 \u0627\u0633 \u062f\u0648\u0631 \u0645\u06cc\u06ba \u06a9\u0633\u06cc \u0646\u06d2 \u0634\u0631\u0637 \u0646\u06c1 \u0644\u06af\u0627\u0626\u06cc \u06c1\u0648)\u06d4</li><li><strong>Call</strong> \u2014 \u0645\u0648\u062c\u0648\u062f\u06c1 \u0633\u0628 \u0633\u06d2 \u0627\u0648\u0646\u0686\u06cc \u0634\u0631\u0637 \u06a9\u06d2 \u0628\u0631\u0627\u0628\u0631 \u0644\u06af\u0627\u0646\u0627\u06d4</li><li><strong>Raise</strong> \u2014 \u0645\u0648\u062c\u0648\u062f\u06c1 \u0634\u0631\u0637 \u0628\u0691\u06be\u0627\u0646\u0627\u06d4 No-Limit \u0645\u06cc\u06ba \u0627\u067e\u0646\u06cc \u062a\u0645\u0627\u0645 \u0679\u0648\u06a9\u0646 \u062a\u06a9 \u06a9\u0633\u06cc \u0628\u06be\u06cc \u0631\u0642\u0645 \u0633\u06d2\u06d4</li><li><strong>All-In</strong> \u2014 \u0627\u067e\u0646\u06cc \u0633\u0627\u0631\u06cc \u0679\u0648\u06a9\u0646 \u0644\u06af\u0627 \u062f\u06cc\u0646\u0627\u06d4 \u0627\u06af\u0631 \u062f\u0648\u0633\u0631\u06d2 \u0627\u0633 \u0633\u06d2 \u0627\u0648\u067e\u0631 \u0634\u0631\u0637 \u0644\u06af\u0627\u062a\u06d2 \u0631\u06c1\u06cc\u06ba \u062a\u0648 \u0633\u0627\u0626\u06cc\u0688 \u067e\u0627\u0679 \u0628\u0646\u062a\u06d2 \u06c1\u06cc\u06ba\u060c \u0686\u0646\u0627\u0646\u0686\u06c1 \u0622\u067e \u067e\u0627\u0679 \u06a9\u0627 \u0635\u0631\u0641 \u0648\u06c1\u06cc \u062d\u0635\u06c1 \u062c\u06cc\u062a \u0633\u06a9\u062a\u06d2 \u06c1\u06cc\u06ba \u062c\u0633 \u0645\u06cc\u06ba \u0622\u067e \u0646\u06d2 \u062d\u0635\u06c1 \u0688\u0627\u0644\u0627 \u06c1\u0648\u06d4</li></ul><h2>\u067e\u062a\u06d2 \u062f\u06a9\u06be\u0627\u0646\u0627</h2><p>\u0627\u06af\u0631 river \u06a9\u06d2 \u062f\u0648\u0631 \u06a9\u06d2 \u0628\u0639\u062f \u062f\u0648 \u06cc\u0627 \u0632\u06cc\u0627\u062f\u06c1 \u06a9\u06be\u0644\u0627\u0691\u06cc \u0628\u0627\u0642\u06cc \u0631\u06c1\u06cc\u06ba \u062a\u0648 \u06c1\u0627\u062a\u06be \u06a9\u06be\u0648\u0644\u06d2 \u062c\u0627\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4 \u0633\u0627\u062a \u062f\u0633\u062a\u06cc\u0627\u0628 \u067e\u062a\u0648\u06ba (\u062f\u0648 \u0630\u0627\u062a\u06cc + \u067e\u0627\u0646\u0686 \u0645\u0634\u062a\u0631\u06a9\u06c1) \u0645\u06cc\u06ba \u0633\u06d2 \u0628\u0646\u0627 \u067e\u0627\u0646\u0686 \u067e\u062a\u0648\u06ba \u06a9\u0627 \u0628\u06c1\u062a\u0631\u06cc\u0646 \u0645\u062c\u0645\u0648\u0639\u06c1 \u067e\u0627\u0679 \u062c\u06cc\u062a\u062a\u0627 \u06c1\u06d2\u06d4 \u0628\u0631\u0627\u0628\u0631 \u06c1\u0627\u062a\u06be \u067e\u0627\u0679 \u0622\u067e\u0633 \u0645\u06cc\u06ba \u0628\u0627\u0646\u0679 \u0644\u06cc\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4</p><h2>\u06c1\u0627\u062a\u06be\u0648\u06ba \u06a9\u06cc \u062f\u0631\u062c\u06c1 \u0628\u0646\u062f\u06cc\u060c \u0633\u0628 \u0633\u06d2 \u0645\u0636\u0628\u0648\u0637 \u0633\u06d2 \u0633\u0628 \u0633\u06d2 \u06a9\u0645\u0632\u0648\u0631 \u062a\u06a9</h2><ol><li><strong>\u0631\u0627\u0626\u0644 \u0641\u0644\u0634</strong> \u2014 \u0627\u06cc\u06a9 \u06c1\u06cc \u0631\u0646\u06af \u06a9\u06d2 A K Q J 10\u06d4</li><li><strong>\u0627\u0633\u0679\u0631\u06cc\u0679 \u0641\u0644\u0634</strong> \u2014 \u0627\u06cc\u06a9 \u06c1\u06cc \u0631\u0646\u06af \u06a9\u06d2 \u0645\u0633\u0644\u0633\u0644 \u067e\u0627\u0646\u0686 \u067e\u062a\u06d2\u06d4</li><li><strong>\u0686\u0627\u0631 \u06cc\u06a9\u0633\u0627\u06ba</strong> \u2014 \u0627\u06cc\u06a9 \u06c1\u06cc \u0639\u062f\u062f \u06a9\u06d2 \u0686\u0627\u0631 \u067e\u062a\u06d2\u06d4</li><li><strong>\u0641\u0644 \u06c1\u0627\u0624\u0633</strong> \u2014 \u062a\u06cc\u0646 \u06cc\u06a9\u0633\u0627\u06ba \u0627\u0648\u0631 \u0627\u06cc\u06a9 \u062c\u0648\u0691\u0627\u06d4</li><li><strong>\u0641\u0644\u0634</strong> \u2014 \u0627\u06cc\u06a9 \u06c1\u06cc \u0631\u0646\u06af \u06a9\u06d2 \u067e\u0627\u0646\u0686 \u067e\u062a\u06d2\u06d4</li><li><strong>\u0627\u0633\u0679\u0631\u06cc\u0679</strong> \u2014 \u0645\u062e\u062a\u0644\u0641 \u0631\u0646\u06af\u0648\u06ba \u06a9\u06d2 \u0645\u0633\u0644\u0633\u0644 \u067e\u0627\u0646\u0686 \u067e\u062a\u06d2\u06d4</li><li><strong>\u062a\u06cc\u0646 \u06cc\u06a9\u0633\u0627\u06ba</strong> \u2014 \u0627\u06cc\u06a9 \u06c1\u06cc \u0639\u062f\u062f \u06a9\u06d2 \u062a\u06cc\u0646 \u067e\u062a\u06d2\u06d4</li><li><strong>\u062f\u0648 \u062c\u0648\u0691\u06d2</strong> \u2014 \u062f\u0648 \u0645\u062e\u062a\u0644\u0641 \u062c\u0648\u0691\u06d2\u06d4</li><li><strong>\u0627\u06cc\u06a9 \u062c\u0648\u0691\u0627</strong> \u2014 \u0627\u06cc\u06a9 \u06c1\u06cc \u0639\u062f\u062f \u06a9\u06d2 \u062f\u0648 \u067e\u062a\u06d2\u06d4</li><li><strong>\u0627\u0648\u0646\u0686\u0627 \u067e\u062a\u06c1</strong> \u2014 \u0627\u0648\u067e\u0631 \u0645\u06cc\u06ba \u0633\u06d2 \u06a9\u0686\u06be \u0646\u06c1\u06cc\u06ba\u061b \u0633\u0628 \u0633\u06d2 \u0627\u0648\u0646\u0686\u0627 \u067e\u062a\u06c1 \u0641\u06cc\u0635\u0644\u06c1 \u06a9\u0631\u062a\u0627 \u06c1\u06d2\u06d4</li></ol><h2>PokerTH \u0645\u06cc\u06ba \u0679\u0648\u0631\u0646\u0627\u0645\u0646\u0679</h2><p>PokerTH \u06a9\u06d2 \u06a9\u06be\u06cc\u0644 sit-and-go \u0637\u0631\u0632 \u06a9\u06d2 \u0679\u0648\u0631\u0646\u0627\u0645\u0646\u0679 \u06c1\u06cc\u06ba: \u0633\u0628 \u0627\u06cc\u06a9 \u062c\u06cc\u0633\u06cc \u0679\u0648\u06a9\u0646 \u0633\u06d2 \u0634\u0631\u0648\u0639 \u06a9\u0631\u062a\u06d2 \u06c1\u06cc\u06ba\u060c \u0628\u0644\u0627\u0626\u0646\u0688\u0632 \u0648\u0642\u062a \u06a9\u06d2 \u0633\u0627\u062a\u06be \u0628\u0691\u06be\u062a\u06d2 \u06c1\u06cc\u06ba\u060c \u0627\u0648\u0631 \u0622\u062e\u0631 \u062a\u06a9 \u062c\u0633 \u06a9\u06d2 \u067e\u0627\u0633 \u0679\u0648\u06a9\u0646 \u0628\u0686\u06cc\u06ba \u0648\u06c1\u06cc \u062c\u06cc\u062a\u062a\u0627 \u06c1\u06d2\u06d4 \u0622\u067e \u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u06a9\u06d2 \u062e\u0644\u0627\u0641 \u0622\u0641 \u0644\u0627\u0626\u0646 \u0645\u0634\u0642 \u06a9\u0631 \u0633\u06a9\u062a\u06d2 \u06c1\u06cc\u06ba\u060c LAN \u06cc\u0627 \u0627\u067e\u0646\u06d2 \u0633\u0631\u0648\u0631 \u067e\u0631 \u06a9\u06be\u06cc\u0644 \u0633\u06a9\u062a\u06d2 \u06c1\u06cc\u06ba\u060c \u06cc\u0627 \u0645\u0648\u0633\u0645\u06cc \u062f\u0631\u062c\u06c1 \u0628\u0646\u062f\u06cc \u0648\u0627\u0644\u06d2 \u0633\u0631\u06a9\u0627\u0631\u06cc pokerth.net \u0646\u06cc\u0679 \u0648\u0631\u06a9 \u0645\u06cc\u06ba \u0634\u0627\u0645\u0644 \u06c1\u0648 \u0633\u06a9\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4</p>" },
  bn: {
    title: "\u099f\u09c7\u0995\u09cd\u09b8\u09be\u09b8 \u09b9\u09cb\u09b2\u09cd\u09a1\u09c7\u09ae\u09c7\u09b0 \u09a8\u09bf\u09af\u09bc\u09ae \u2014 PokerTH \u0993\u09af\u09bc\u09c7\u09ac \u0995\u09cd\u09b2\u09be\u09af\u09bc\u09c7\u09a8\u09cd\u099f",
    desc: "PokerTH-\u098f \u09af\u09c7\u09ad\u09be\u09ac\u09c7 \u0996\u09c7\u09b2\u09be \u09b9\u09af\u09bc \u09b8\u09c7\u0987 \u099f\u09c7\u0995\u09cd\u09b8\u09be\u09b8 \u09b9\u09cb\u09b2\u09cd\u09a1\u09c7\u09ae\u09c7\u09b0 \u09aa\u09c2\u09b0\u09cd\u09a3 \u09a8\u09bf\u09af\u09bc\u09ae: \u09ac\u09cd\u09b2\u09be\u0987\u09a8\u09cd\u09a1, \u099a\u09be\u09b0\u099f\u09bf \u09ac\u09be\u099c\u09bf \u09b0\u09be\u0989\u09a8\u09cd\u09a1, Fold/Check/Call/Raise/All-In, \u09b8\u09be\u0987\u09a1 \u09aa\u099f \u098f\u09ac\u0982 \u09b9\u09be\u09a4\u09c7\u09b0 \u0995\u09cd\u09b0\u09ae\u0964",
    ldHeadline: "\u099f\u09c7\u0995\u09cd\u09b8\u09be\u09b8 \u09b9\u09cb\u09b2\u09cd\u09a1\u09c7\u09ae \u09aa\u09cb\u0995\u09be\u09b0\u09c7\u09b0 \u09a8\u09bf\u09af\u09bc\u09ae \u2014 PokerTH",
    ldDesc: "No-Limit \u099f\u09c7\u0995\u09cd\u09b8\u09be\u09b8 \u09b9\u09cb\u09b2\u09cd\u09a1\u09c7\u09ae \u0995\u09c0\u09ad\u09be\u09ac\u09c7 \u0996\u09c7\u09b2\u09ac\u09c7\u09a8: \u09ac\u09cd\u09b2\u09be\u0987\u09a8\u09cd\u09a1, \u09ac\u09be\u099c\u09bf \u09b0\u09be\u0989\u09a8\u09cd\u09a1, \u09aa\u09a6\u0995\u09cd\u09b7\u09c7\u09aa \u0993 \u09b9\u09be\u09a4\u09c7\u09b0 \u0995\u09cd\u09b0\u09ae, \u09af\u09c7\u09ae\u09a8\u099f\u09be PokerTH-\u098f\u0964",
    body: "<h1>\u099f\u09c7\u0995\u09cd\u09b8\u09be\u09b8 \u09b9\u09cb\u09b2\u09cd\u09a1\u09c7\u09ae \u09aa\u09cb\u0995\u09be\u09b0\u09c7\u09b0 \u09a8\u09bf\u09af\u09bc\u09ae</h1><p>PokerTH-\u098f \u0996\u09c7\u09b2\u09be \u09b9\u09af\u09bc No-Limit \u099f\u09c7\u0995\u09cd\u09b8\u09be\u09b8 \u09b9\u09cb\u09b2\u09cd\u09a1\u09c7\u09ae, \u09ac\u09bf\u09b6\u09cd\u09ac\u09c7\u09b0 \u09b8\u09ac\u099a\u09c7\u09af\u09bc\u09c7 \u099c\u09a8\u09aa\u09cd\u09b0\u09bf\u09af\u09bc \u09aa\u09cb\u0995\u09be\u09b0 \u09a7\u09b0\u09a8\u0964 \u09aa\u09cd\u09b0\u09a4\u09cd\u09af\u09c7\u0995 \u0996\u09c7\u09b2\u09cb\u09af\u09bc\u09be\u09a1\u09bc \u09a8\u09bf\u099c\u09c7\u09b0 \u09a6\u09c1\u099f\u09bf \u09a4\u09be\u09b8 \u0993 \u09aa\u09be\u0981\u099a\u099f\u09bf \u09b8\u09be\u09a7\u09be\u09b0\u09a3 \u09a4\u09be\u09b8 \u09a5\u09c7\u0995\u09c7 \u09aa\u09be\u0981\u099a \u09a4\u09be\u09b8\u09c7\u09b0 \u09b8\u09c7\u09b0\u09be \u09b9\u09be\u09a4 \u0997\u09a1\u09bc\u09be\u09b0 \u099a\u09c7\u09b7\u09cd\u099f\u09be \u0995\u09b0\u09c7\u09a8\u0964</p><h2>\u09a4\u09be\u09b8 \u09ac\u09bf\u09b2\u09bf \u0993 \u09ac\u09cd\u09b2\u09be\u0987\u09a8\u09cd\u09a1</h2><p>\u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09b9\u09be\u09a4 \u09b6\u09c1\u09b0\u09c1 \u09b9\u09af\u09bc \u09a6\u09c1\u099f\u09bf \u09ac\u09be\u09a7\u09cd\u09af\u09a4\u09be\u09ae\u09c2\u09b2\u0995 \u09ac\u09be\u099c\u09bf \u09a6\u09bf\u09af\u09bc\u09c7: \u09a1\u09bf\u09b2\u09be\u09b0 \u09ac\u09be\u099f\u09a8\u09c7\u09b0 \u09ac\u09be\u0981 \u09aa\u09be\u09b6\u09c7\u09b0 \u0996\u09c7\u09b2\u09cb\u09af\u09bc\u09be\u09a1\u09bc <em>\u099b\u09cb\u099f \u09ac\u09cd\u09b2\u09be\u0987\u09a8\u09cd\u09a1</em> \u09a6\u09c7\u09a8 \u098f\u09ac\u0982 \u09a4\u09be\u09b0 \u09aa\u09b0\u09c7\u09b0 \u099c\u09a8 <em>\u09ac\u09a1\u09bc \u09ac\u09cd\u09b2\u09be\u0987\u09a8\u09cd\u09a1</em>\u0964 \u098f\u09b0\u09aa\u09b0 \u09aa\u09cd\u09b0\u09a4\u09cd\u09af\u09c7\u0995 \u0996\u09c7\u09b2\u09cb\u09af\u09bc\u09be\u09a1\u09bc \u09a6\u09c1\u099f\u09bf \u0989\u09b2\u09cd\u099f\u09cb \u0995\u09b0\u09c7 \u09b0\u09be\u0996\u09be \u09a4\u09be\u09b8 (<em>\u09a8\u09bf\u099c\u09c7\u09b0 \u09a4\u09be\u09b8</em>) \u09aa\u09be\u09a8\u0964 \u09aa\u09cd\u09b0\u09a4\u09bf \u09b9\u09be\u09a4\u09c7\u09b0 \u09aa\u09b0 \u09ac\u09be\u099f\u09a8 \u0998\u09a1\u09bc\u09bf\u09b0 \u0995\u09be\u0981\u099f\u09be\u09b0 \u09a6\u09bf\u0995\u09c7 \u098f\u0995 \u0986\u09b8\u09a8 \u098f\u0997\u09cb\u09af\u09bc, \u0986\u09b0 PokerTH-\u098f \u09ac\u09cd\u09b2\u09be\u0987\u09a8\u09cd\u09a1 \u09a8\u09bf\u09af\u09bc\u09ae\u09bf\u09a4 \u09ac\u09bf\u09b0\u09a4\u09bf\u09a4\u09c7 \u09ac\u09be\u09a1\u09bc\u09c7\u0964</p><h2>\u099a\u09be\u09b0\u099f\u09bf \u09ac\u09be\u099c\u09bf \u09b0\u09be\u0989\u09a8\u09cd\u09a1</h2><ul><li><strong>Pre-flop</strong> \u2014 \u09a8\u09bf\u099c\u09c7\u09b0 \u09a4\u09be\u09b8 \u09aa\u09be\u0993\u09af\u09bc\u09be\u09b0 \u09aa\u09b0 \u0996\u09c7\u09b2\u09cb\u09af\u09bc\u09be\u09a1\u09bc\u09c7\u09b0\u09be \u09aa\u09be\u09b2\u09be \u0995\u09b0\u09c7 \u0996\u09c7\u09b2\u09c7\u09a8, \u09ac\u09a1\u09bc \u09ac\u09cd\u09b2\u09be\u0987\u09a8\u09cd\u09a1\u09c7\u09b0 \u09ac\u09be\u0981 \u09a6\u09bf\u0995 \u09a5\u09c7\u0995\u09c7 \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c7\u0964</li><li><strong>Flop</strong> \u2014 \u09a4\u09bf\u09a8\u099f\u09bf \u09b8\u09be\u09a7\u09be\u09b0\u09a3 \u09a4\u09be\u09b8 \u0996\u09c1\u09b2\u09c7 \u09a6\u09c7\u0993\u09af\u09bc\u09be \u09b9\u09af\u09bc, \u09a4\u09be\u09b0\u09aa\u09b0 \u098f\u0995\u099f\u09bf \u09ac\u09be\u099c\u09bf \u09b0\u09be\u0989\u09a8\u09cd\u09a1 \u09b9\u09af\u09bc\u0964</li><li><strong>Turn</strong> \u2014 \u099a\u09a4\u09c1\u09b0\u09cd\u09a5 \u09b8\u09be\u09a7\u09be\u09b0\u09a3 \u09a4\u09be\u09b8 \u09a6\u09c7\u0993\u09af\u09bc\u09be \u09b9\u09af\u09bc, \u09a4\u09be\u09b0\u09aa\u09b0 \u0986\u09b0\u0993 \u098f\u0995\u099f\u09bf \u09ac\u09be\u099c\u09bf \u09b0\u09be\u0989\u09a8\u09cd\u09a1\u0964</li><li><strong>River</strong> \u2014 \u09aa\u099e\u09cd\u099a\u09ae \u0993 \u09b6\u09c7\u09b7 \u09b8\u09be\u09a7\u09be\u09b0\u09a3 \u09a4\u09be\u09b8 \u09a6\u09c7\u0993\u09af\u09bc\u09be \u09b9\u09af\u09bc, \u09a4\u09be\u09b0\u09aa\u09b0 \u09b6\u09c7\u09b7 \u09ac\u09be\u099c\u09bf \u09b0\u09be\u0989\u09a8\u09cd\u09a1\u0964</li></ul><h2>\u09aa\u09a6\u0995\u09cd\u09b7\u09c7\u09aa</h2><ul><li><strong>Fold</strong> \u2014 \u09b9\u09be\u09a4 \u099b\u09c7\u09a1\u09bc\u09c7 \u09a6\u09c7\u0993\u09af\u09bc\u09be \u098f\u09ac\u0982 \u0986\u0997\u09c7 \u09b0\u09be\u0996\u09be \u099a\u09bf\u09aa\u0993 \u099b\u09c7\u09a1\u09bc\u09c7 \u09a6\u09c7\u0993\u09af\u09bc\u09be\u0964</li><li><strong>Check</strong> \u2014 \u09ac\u09be\u099c\u09bf \u09a8\u09be \u09a7\u09b0\u09c7 \u09aa\u09be\u09b2\u09be \u098f\u0997\u09bf\u09af\u09bc\u09c7 \u09a6\u09c7\u0993\u09af\u09bc\u09be (\u0995\u09c7\u09ac\u09b2 \u09af\u09a6\u09bf \u09b8\u09c7\u0987 \u09b0\u09be\u0989\u09a8\u09cd\u09a1\u09c7 \u0995\u09c7\u0989 \u09ac\u09be\u099c\u09bf \u09a8\u09be \u09a7\u09b0\u09c7 \u09a5\u09be\u0995\u09c7\u09a8)\u0964</li><li><strong>Call</strong> \u2014 \u099a\u09b2\u09a4\u09bf \u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09ac\u09be\u099c\u09bf\u09b0 \u09b8\u09ae\u09be\u09a8 \u09a6\u09c7\u0993\u09af\u09bc\u09be\u0964</li><li><strong>Raise</strong> \u2014 \u099a\u09b2\u09a4\u09bf \u09ac\u09be\u099c\u09bf \u09ac\u09be\u09a1\u09bc\u09be\u09a8\u09cb\u0964 No-Limit-\u098f \u09a8\u09bf\u099c\u09c7\u09b0 \u09b8\u09ac \u099a\u09bf\u09aa \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u0985\u0999\u09cd\u0995\u09c7\u0964</li><li><strong>All-In</strong> \u2014 \u09a8\u09bf\u099c\u09c7\u09b0 \u09b8\u09ac \u099a\u09bf\u09aa \u09ac\u09be\u099c\u09bf \u09a7\u09b0\u09be\u0964 \u0985\u09a8\u09cd\u09af\u09b0\u09be \u09a4\u09be\u09b0 \u0989\u09aa\u09b0\u09c7 \u09ac\u09be\u099c\u09bf \u099a\u09be\u09b2\u09bf\u09af\u09bc\u09c7 \u0997\u09c7\u09b2\u09c7 \u09b8\u09be\u0987\u09a1 \u09aa\u099f \u09a4\u09c8\u09b0\u09bf \u09b9\u09af\u09bc, \u09ab\u09b2\u09c7 \u0986\u09aa\u09a8\u09bf \u09aa\u099f\u09c7\u09b0 \u0995\u09c7\u09ac\u09b2 \u09b8\u09c7\u0987 \u0985\u0982\u09b6\u099f\u09be\u0987 \u099c\u09bf\u09a4\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u09a8 \u09af\u09c7\u0996\u09be\u09a8\u09c7 \u0986\u09aa\u09a8\u09bf \u0985\u0982\u09b6 \u09a8\u09bf\u09af\u09bc\u09c7\u099b\u09c7\u09a8\u0964</li></ul><h2>\u09a4\u09be\u09b8 \u09a6\u09c7\u0996\u09be\u09a8\u09cb</h2><p>river-\u098f\u09b0 \u09ac\u09be\u099c\u09bf \u09b0\u09be\u0989\u09a8\u09cd\u09a1\u09c7\u09b0 \u09aa\u09b0 \u09a6\u09c1\u0987 \u09ac\u09be \u09a4\u09be\u09b0 \u09ac\u09c7\u09b6\u09bf \u0996\u09c7\u09b2\u09cb\u09af\u09bc\u09be\u09a1\u09bc \u09a5\u09be\u0995\u09b2\u09c7 \u09b9\u09be\u09a4 \u0996\u09cb\u09b2\u09be \u09b9\u09af\u09bc\u0964 \u09b8\u09be\u09a4\u099f\u09bf \u09a4\u09be\u09b8\u09c7\u09b0 (\u09a6\u09c1\u099f\u09bf \u09a8\u09bf\u099c\u09c7\u09b0 + \u09aa\u09be\u0981\u099a\u099f\u09bf \u09b8\u09be\u09a7\u09be\u09b0\u09a3) \u09ae\u09a7\u09cd\u09af\u09c7 \u0997\u09a1\u09bc\u09be \u09aa\u09be\u0981\u099a \u09a4\u09be\u09b8\u09c7\u09b0 \u09b8\u09c7\u09b0\u09be \u09ae\u09bf\u09b2 \u09aa\u099f \u099c\u09c7\u09a4\u09c7\u0964 \u09b8\u09ae\u09be\u09a8 \u09b9\u09be\u09a4 \u09aa\u099f \u09ad\u09be\u0997 \u0995\u09b0\u09c7 \u09a8\u09c7\u09af\u09bc\u0964</p><h2>\u09b9\u09be\u09a4\u09c7\u09b0 \u0995\u09cd\u09b0\u09ae, \u09b8\u09ac\u099a\u09c7\u09af\u09bc\u09c7 \u09b6\u0995\u09cd\u09a4\u09bf\u09b6\u09be\u09b2\u09c0 \u09a5\u09c7\u0995\u09c7 \u09a6\u09c1\u09b0\u09cd\u09ac\u09b2</h2><ol><li><strong>\u09b0\u09af\u09bc\u09cd\u09af\u09be\u09b2 \u09ab\u09cd\u09b2\u09be\u09b6</strong> \u2014 \u098f\u0995\u0987 \u09b0\u0999\u09c7\u09b0 A K Q J 10\u0964</li><li><strong>\u09b8\u09cd\u099f\u09cd\u09b0\u09c7\u099f \u09ab\u09cd\u09b2\u09be\u09b6</strong> \u2014 \u098f\u0995\u0987 \u09b0\u0999\u09c7\u09b0 \u09aa\u09b0\u09aa\u09b0 \u09aa\u09be\u0981\u099a\u099f\u09bf \u09a4\u09be\u09b8\u0964</li><li><strong>\u099a\u09be\u09b0\u099f\u09bf \u098f\u0995\u09b0\u0995\u09ae</strong> \u2014 \u098f\u0995\u0987 \u09ae\u09be\u09a8\u09c7\u09b0 \u099a\u09be\u09b0\u099f\u09bf \u09a4\u09be\u09b8\u0964</li><li><strong>\u09ab\u09c1\u09b2 \u09b9\u09be\u0989\u09b8</strong> \u2014 \u09a4\u09bf\u09a8\u099f\u09bf \u098f\u0995\u09b0\u0995\u09ae \u0993 \u098f\u0995\u099f\u09bf \u099c\u09cb\u09a1\u09bc\u09be\u0964</li><li><strong>\u09ab\u09cd\u09b2\u09be\u09b6</strong> \u2014 \u098f\u0995\u0987 \u09b0\u0999\u09c7\u09b0 \u09aa\u09be\u0981\u099a\u099f\u09bf \u09a4\u09be\u09b8\u0964</li><li><strong>\u09b8\u09cd\u099f\u09cd\u09b0\u09c7\u099f</strong> \u2014 \u09ad\u09bf\u09a8\u09cd\u09a8 \u09b0\u0999\u09c7\u09b0 \u09aa\u09b0\u09aa\u09b0 \u09aa\u09be\u0981\u099a\u099f\u09bf \u09a4\u09be\u09b8\u0964</li><li><strong>\u09a4\u09bf\u09a8\u099f\u09bf \u098f\u0995\u09b0\u0995\u09ae</strong> \u2014 \u098f\u0995\u0987 \u09ae\u09be\u09a8\u09c7\u09b0 \u09a4\u09bf\u09a8\u099f\u09bf \u09a4\u09be\u09b8\u0964</li><li><strong>\u09a6\u09c1\u0987 \u099c\u09cb\u09a1\u09bc\u09be</strong> \u2014 \u09a6\u09c1\u099f\u09bf \u09ad\u09bf\u09a8\u09cd\u09a8 \u099c\u09cb\u09a1\u09bc\u09be\u0964</li><li><strong>\u098f\u0995 \u099c\u09cb\u09a1\u09bc\u09be</strong> \u2014 \u098f\u0995\u0987 \u09ae\u09be\u09a8\u09c7\u09b0 \u09a6\u09c1\u099f\u09bf \u09a4\u09be\u09b8\u0964</li><li><strong>\u0989\u0981\u099a\u09c1 \u09a4\u09be\u09b8</strong> \u2014 \u0989\u09aa\u09b0\u09c7\u09b0 \u0995\u09cb\u09a8\u09cb\u099f\u09bf\u0987 \u09a8\u09af\u09bc; \u09b8\u09ac\u099a\u09c7\u09af\u09bc\u09c7 \u0989\u0981\u099a\u09c1 \u09a4\u09be\u09b8\u0987 \u09a0\u09bf\u0995 \u0995\u09b0\u09c7\u0964</li></ol><h2>PokerTH-\u098f \u099f\u09c1\u09b0\u09cd\u09a8\u09be\u09ae\u09c7\u09a8\u09cd\u099f</h2><p>PokerTH-\u098f\u09b0 \u0996\u09c7\u09b2\u09be sit-and-go \u09a7\u09be\u0981\u099a\u09c7\u09b0 \u099f\u09c1\u09b0\u09cd\u09a8\u09be\u09ae\u09c7\u09a8\u09cd\u099f: \u09b8\u09ac\u09be\u0987 \u09b8\u09ae\u09be\u09a8 \u099a\u09bf\u09aa \u09a8\u09bf\u09af\u09bc\u09c7 \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c7\u09a8, \u09ac\u09cd\u09b2\u09be\u0987\u09a8\u09cd\u09a1 \u09b8\u09ae\u09af\u09bc\u09c7\u09b0 \u09b8\u0999\u09cd\u0997\u09c7 \u09ac\u09be\u09a1\u09bc\u09c7, \u0986\u09b0 \u09b6\u09c7\u09b7 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u09af\u09be\u0981\u09b0 \u099a\u09bf\u09aa \u09a5\u09be\u0995\u09c7 \u09a4\u09bf\u09a8\u09bf\u0987 \u099c\u09c7\u09a4\u09c7\u09a8\u0964 \u0995\u09ae\u09cd\u09aa\u09bf\u0989\u099f\u09be\u09b0\u09c7\u09b0 \u09ac\u09bf\u09b0\u09c1\u09a6\u09cd\u09a7\u09c7 \u0985\u09ab\u09b2\u09be\u0987\u09a8\u09c7 \u0985\u09a8\u09c1\u09b6\u09c0\u09b2\u09a8 \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u09a8, LAN \u09ac\u09be \u09a8\u09bf\u099c\u09c7\u09b0 \u09b8\u09be\u09b0\u09cd\u09ad\u09be\u09b0\u09c7 \u0996\u09c7\u09b2\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u09a8, \u0995\u09bf\u0982\u09ac\u09be \u09ae\u09cc\u09b8\u09c1\u09ae\u09bf \u09b0\u200c\u09cd\u09af\u09be\u0999\u09cd\u0995\u09bf\u0982\u09b8\u09b9 \u0985\u09ab\u09bf\u09b6\u09bf\u09af\u09bc\u09be\u09b2 pokerth.net \u09a8\u09c7\u099f\u0993\u09af\u09bc\u09be\u09b0\u09cd\u0995\u09c7 \u09af\u09cb\u0997 \u09a6\u09bf\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u09a8\u0964</p>" },
  ta: {
    title: "Texas Hold\u2019em \u0bb5\u0bbf\u0ba4\u0bbf\u0b95\u0bb3\u0bcd \u2014 PokerTH \u0b87\u0ba3\u0bc8\u0baf \u0baa\u0ba4\u0bbf\u0baa\u0bcd\u0baa\u0bc1",
    desc: "PokerTH-\u0b87\u0bb2\u0bcd \u0bb5\u0bbf\u0bb3\u0bc8\u0baf\u0bbe\u0b9f\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0bae\u0bcd Texas Hold\u2019em-\u0b87\u0ba9\u0bcd \u0bae\u0bc1\u0bb4\u0bc1 \u0bb5\u0bbf\u0ba4\u0bbf\u0b95\u0bb3\u0bcd: \u0baa\u0bbf\u0bb3\u0bc8\u0ba3\u0bcd\u0b9f\u0bcd, \u0ba8\u0bbe\u0ba9\u0bcd\u0b95\u0bc1 \u0baa\u0ba8\u0bcd\u0ba4\u0baf \u0b9a\u0bc1\u0bb1\u0bcd\u0bb1\u0bc1\u0b95\u0bb3\u0bcd, Fold/Check/Call/Raise/All-In, \u0baa\u0b95\u0bcd\u0b95\u0baa\u0bcd \u0baa\u0bbe\u0ba9\u0bc8 \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0b95\u0bc8\u0b95\u0bb3\u0bbf\u0ba9\u0bcd \u0ba4\u0bb0\u0bb5\u0bb0\u0bbf\u0b9a\u0bc8.",
    ldHeadline: "Texas Hold\u2019em \u0baa\u0bcb\u0b95\u0bcd\u0b95\u0bb0\u0bcd \u0bb5\u0bbf\u0ba4\u0bbf\u0b95\u0bb3\u0bcd \u2014 PokerTH",
    ldDesc: "No-Limit Texas Hold\u2019em \u0b8e\u0baa\u0bcd\u0baa\u0b9f\u0bbf \u0bb5\u0bbf\u0bb3\u0bc8\u0baf\u0bbe\u0b9f\u0bc1\u0bb5\u0ba4\u0bc1: \u0baa\u0bbf\u0bb3\u0bc8\u0ba3\u0bcd\u0b9f\u0bcd, \u0baa\u0ba8\u0bcd\u0ba4\u0baf \u0b9a\u0bc1\u0bb1\u0bcd\u0bb1\u0bc1\u0b95\u0bb3\u0bcd, \u0ba8\u0b95\u0bb0\u0bcd\u0bb5\u0bc1\u0b95\u0bb3\u0bcd, \u0b95\u0bc8\u0b95\u0bb3\u0bbf\u0ba9\u0bcd \u0ba4\u0bb0\u0bb5\u0bb0\u0bbf\u0b9a\u0bc8 \u2014 PokerTH-\u0b87\u0bb2\u0bcd \u0b89\u0bb3\u0bcd\u0bb3\u0baa\u0b9f\u0bbf.",
    body: "<h1>Texas Hold\u2019em \u0baa\u0bcb\u0b95\u0bcd\u0b95\u0bb0\u0bcd \u0bb5\u0bbf\u0ba4\u0bbf\u0b95\u0bb3\u0bcd</h1><p>PokerTH-\u0b87\u0bb2\u0bcd \u0bb5\u0bbf\u0bb3\u0bc8\u0baf\u0bbe\u0b9f\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0bb5\u0ba4\u0bc1 No-Limit Texas Hold\u2019em, \u0b89\u0bb2\u0b95\u0bbf\u0ba9\u0bcd \u0bae\u0bbf\u0b95\u0bb5\u0bc1\u0bae\u0bcd \u0baa\u0bbf\u0bb0\u0baa\u0bb2\u0bae\u0bbe\u0ba9 \u0baa\u0bcb\u0b95\u0bcd\u0b95\u0bb0\u0bcd \u0bb5\u0b95\u0bc8. \u0b92\u0bb5\u0bcd\u0bb5\u0bca\u0bb0\u0bc1 \u0bb5\u0bc0\u0bb0\u0bb0\u0bc1\u0bae\u0bcd \u0ba4\u0bae\u0ba4\u0bc1 \u0b87\u0bb0\u0ba3\u0bcd\u0b9f\u0bc1 \u0b9a\u0bca\u0ba8\u0bcd\u0ba4 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0b90\u0ba8\u0bcd\u0ba4\u0bc1 \u0baa\u0bca\u0ba4\u0bc1\u0b9a\u0bcd \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bbf\u0bb2\u0bbf\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0b9a\u0bbf\u0bb1\u0ba8\u0bcd\u0ba4 \u0b90\u0ba8\u0bcd\u0ba4\u0bc1 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bcd \u0b95\u0bc8\u0baf\u0bc8 \u0b89\u0bb0\u0bc1\u0bb5\u0bbe\u0b95\u0bcd\u0b95 \u0bae\u0bc1\u0baf\u0bb2\u0bcd\u0b95\u0bbf\u0bb1\u0bbe\u0bb0\u0bcd.</p><h2>\u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1 \u0bb5\u0bbf\u0ba8\u0bbf\u0baf\u0bcb\u0b95\u0bae\u0bc1\u0bae\u0bcd \u0baa\u0bbf\u0bb3\u0bc8\u0ba3\u0bcd\u0b9f\u0bc1\u0bae\u0bcd</h2><p>\u0b92\u0bb5\u0bcd\u0bb5\u0bca\u0bb0\u0bc1 \u0b95\u0bc8\u0baf\u0bc1\u0bae\u0bcd \u0b87\u0bb0\u0ba3\u0bcd\u0b9f\u0bc1 \u0b95\u0b9f\u0bcd\u0b9f\u0bbe\u0baf\u0baa\u0bcd \u0baa\u0ba8\u0bcd\u0ba4\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bc1\u0b9f\u0ba9\u0bcd \u0ba4\u0bca\u0b9f\u0b99\u0bcd\u0b95\u0bc1\u0b95\u0bbf\u0bb1\u0ba4\u0bc1: \u0b9f\u0bc0\u0bb2\u0bb0\u0bcd \u0baa\u0bca\u0ba4\u0bcd\u0ba4\u0bbe\u0ba9\u0bc1\u0b95\u0bcd\u0b95\u0bc1 \u0b87\u0b9f\u0ba4\u0bc1\u0baa\u0bc1\u0bb1\u0bae\u0bcd \u0b89\u0bb3\u0bcd\u0bb3 \u0bb5\u0bc0\u0bb0\u0bb0\u0bcd <em>\u0b9a\u0bbf\u0bb1\u0bbf\u0baf \u0baa\u0bbf\u0bb3\u0bc8\u0ba3\u0bcd\u0b9f</em>\u0bc8\u0baf\u0bc1\u0bae\u0bcd, \u0b85\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0bb5\u0bb0\u0bcd <em>\u0baa\u0bc6\u0bb0\u0bbf\u0baf \u0baa\u0bbf\u0bb3\u0bc8\u0ba3\u0bcd\u0b9f</em>\u0bc8\u0baf\u0bc1\u0bae\u0bcd \u0bb5\u0bc8\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0bbe\u0bb0\u0bcd. \u0baa\u0bbf\u0ba9\u0bcd\u0ba9\u0bb0\u0bcd \u0b92\u0bb5\u0bcd\u0bb5\u0bca\u0bb0\u0bc1 \u0bb5\u0bc0\u0bb0\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b87\u0bb0\u0ba3\u0bcd\u0b9f\u0bc1 \u0bae\u0bc2\u0b9f\u0bbf\u0baf \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd (<em>\u0b9a\u0bca\u0ba8\u0bcd\u0ba4 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd</em>) \u0bb5\u0bb4\u0b99\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0b95\u0bbf\u0ba9\u0bcd\u0bb1\u0ba9. \u0b92\u0bb5\u0bcd\u0bb5\u0bca\u0bb0\u0bc1 \u0b95\u0bc8\u0b95\u0bcd\u0b95\u0bc1\u0baa\u0bcd \u0baa\u0bbf\u0bb1\u0b95\u0bc1\u0bae\u0bcd \u0baa\u0bca\u0ba4\u0bcd\u0ba4\u0bbe\u0ba9\u0bcd \u0b95\u0b9f\u0bbf\u0b95\u0bbe\u0bb0 \u0ba4\u0bbf\u0b9a\u0bc8\u0baf\u0bbf\u0bb2\u0bcd \u0b92\u0bb0\u0bc1 \u0b87\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bc8 \u0ba8\u0b95\u0bb0\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1; PokerTH-\u0b87\u0bb2\u0bcd \u0baa\u0bbf\u0bb3\u0bc8\u0ba3\u0bcd\u0b9f\u0bcd \u0ba4\u0bca\u0b95\u0bc8 \u0b95\u0bc1\u0bb1\u0bbf\u0baa\u0bcd\u0baa\u0bbf\u0b9f\u0bcd\u0b9f \u0b87\u0b9f\u0bc8\u0bb5\u0bc6\u0bb3\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0b89\u0baf\u0bb0\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1.</p><h2>\u0ba8\u0bbe\u0ba9\u0bcd\u0b95\u0bc1 \u0baa\u0ba8\u0bcd\u0ba4\u0baf \u0b9a\u0bc1\u0bb1\u0bcd\u0bb1\u0bc1\u0b95\u0bb3\u0bcd</h2><ul><li><strong>Pre-flop</strong> \u2014 \u0b9a\u0bca\u0ba8\u0bcd\u0ba4 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bc8\u0baa\u0bcd \u0baa\u0bc6\u0bb1\u0bcd\u0bb1 \u0baa\u0bbf\u0bb1\u0b95\u0bc1, \u0baa\u0bc6\u0bb0\u0bbf\u0baf \u0baa\u0bbf\u0bb3\u0bc8\u0ba3\u0bcd\u0b9f\u0bc1\u0b95\u0bcd\u0b95\u0bc1 \u0b87\u0b9f\u0ba4\u0bc1\u0baa\u0bc1\u0bb1\u0bae\u0bcd \u0b87\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0ba4\u0bca\u0b9f\u0b99\u0bcd\u0b95\u0bbf \u0bb5\u0bc0\u0bb0\u0bb0\u0bcd\u0b95\u0bb3\u0bcd \u0bae\u0bc1\u0bb1\u0bc8\u0baf\u0bbe\u0b95 \u0bb5\u0bbf\u0bb3\u0bc8\u0baf\u0bbe\u0b9f\u0bc1\u0b95\u0bbf\u0bb1\u0bbe\u0bb0\u0bcd\u0b95\u0bb3\u0bcd.</li><li><strong>Flop</strong> \u2014 \u0bae\u0bc2\u0ba9\u0bcd\u0bb1\u0bc1 \u0baa\u0bca\u0ba4\u0bc1\u0b9a\u0bcd \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd \u0ba4\u0bbf\u0bb1\u0ba8\u0bcd\u0ba4\u0bc1 \u0bb5\u0bc8\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0b95\u0bbf\u0ba9\u0bcd\u0bb1\u0ba9, \u0baa\u0bbf\u0bb1\u0b95\u0bc1 \u0b92\u0bb0\u0bc1 \u0baa\u0ba8\u0bcd\u0ba4\u0baf \u0b9a\u0bc1\u0bb1\u0bcd\u0bb1\u0bc1 \u0ba8\u0b9f\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1.</li><li><strong>Turn</strong> \u2014 \u0ba8\u0bbe\u0ba9\u0bcd\u0b95\u0bbe\u0bb5\u0ba4\u0bc1 \u0baa\u0bca\u0ba4\u0bc1\u0b9a\u0bcd \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1 \u0bb5\u0bb4\u0b99\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0bc1 \u0bae\u0bb1\u0bcd\u0bb1\u0bca\u0bb0\u0bc1 \u0baa\u0ba8\u0bcd\u0ba4\u0baf \u0b9a\u0bc1\u0bb1\u0bcd\u0bb1\u0bc1 \u0ba8\u0b9f\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1.</li><li><strong>River</strong> \u2014 \u0b90\u0ba8\u0bcd\u0ba4\u0bbe\u0bb5\u0ba4\u0bc1 \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0b95\u0b9f\u0bc8\u0b9a\u0bbf \u0baa\u0bca\u0ba4\u0bc1\u0b9a\u0bcd \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1 \u0bb5\u0bb4\u0b99\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0bc1 \u0b87\u0bb1\u0bc1\u0ba4\u0bbf\u0baa\u0bcd \u0baa\u0ba8\u0bcd\u0ba4\u0baf \u0b9a\u0bc1\u0bb1\u0bcd\u0bb1\u0bc1 \u0ba8\u0b9f\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1.</li></ul><h2>\u0ba8\u0b95\u0bb0\u0bcd\u0bb5\u0bc1\u0b95\u0bb3\u0bcd</h2><ul><li><strong>Fold</strong> \u2014 \u0b95\u0bc8\u0baf\u0bc8 \u0bb5\u0bbf\u0b9f\u0bcd\u0b9f\u0bc1\u0bb5\u0bbf\u0b9f\u0bc1\u0bb5\u0ba4\u0bc1, \u0b8f\u0bb1\u0bcd\u0b95\u0bc6\u0ba9\u0bb5\u0bc7 \u0bb5\u0bc8\u0ba4\u0bcd\u0ba4 \u0ba8\u0bbe\u0ba3\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bc8\u0baf\u0bc1\u0bae\u0bcd \u0bb5\u0bbf\u0b9f\u0bcd\u0b9f\u0bc1\u0bb5\u0bbf\u0b9f\u0bc1\u0bb5\u0ba4\u0bc1.</li><li><strong>Check</strong> \u2014 \u0baa\u0ba8\u0bcd\u0ba4\u0baf\u0bae\u0bcd \u0bb5\u0bc8\u0b95\u0bcd\u0b95\u0bbe\u0bae\u0bb2\u0bcd \u0bae\u0bc1\u0bb1\u0bc8\u0baf\u0bc8 \u0b85\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0bb5\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bc1 \u0bb5\u0bbf\u0b9f\u0bc1\u0bb5\u0ba4\u0bc1 (\u0b85\u0ba8\u0bcd\u0ba4\u0b9a\u0bcd \u0b9a\u0bc1\u0bb1\u0bcd\u0bb1\u0bbf\u0bb2\u0bcd \u0baf\u0bbe\u0bb0\u0bc1\u0bae\u0bcd \u0baa\u0ba8\u0bcd\u0ba4\u0baf\u0bae\u0bcd \u0bb5\u0bc8\u0b95\u0bcd\u0b95\u0bbe\u0ba4 \u0baa\u0bcb\u0ba4\u0bc1 \u0bae\u0b9f\u0bcd\u0b9f\u0bc1\u0bae\u0bc7).</li><li><strong>Call</strong> \u2014 \u0ba4\u0bb1\u0bcd\u0baa\u0bcb\u0ba4\u0bc8\u0baf \u0b85\u0ba4\u0bbf\u0b95\u0baa\u0b9f\u0bcd\u0b9a\u0baa\u0bcd \u0baa\u0ba8\u0bcd\u0ba4\u0baf\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0b9a\u0bcd \u0b9a\u0bae\u0bae\u0bbe\u0b95 \u0bb5\u0bc8\u0baa\u0bcd\u0baa\u0ba4\u0bc1.</li><li><strong>Raise</strong> \u2014 \u0ba4\u0bb1\u0bcd\u0baa\u0bcb\u0ba4\u0bc8\u0baf \u0baa\u0ba8\u0bcd\u0ba4\u0baf\u0ba4\u0bcd\u0ba4\u0bc8 \u0b89\u0baf\u0bb0\u0bcd\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0ba4\u0bc1. No-Limit-\u0b87\u0bb2\u0bcd \u0b89\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0bae\u0bc1\u0bb4\u0bc1 \u0ba8\u0bbe\u0ba3\u0baf\u0b95\u0bcd \u0b95\u0bc1\u0bb5\u0bbf\u0baf\u0bb2\u0bcd \u0bb5\u0bb0\u0bc8 \u0b8e\u0ba8\u0bcd\u0ba4\u0ba4\u0bcd \u0ba4\u0bca\u0b95\u0bc8\u0baf\u0bbf\u0bb2\u0bc1\u0bae\u0bcd.</li><li><strong>All-In</strong> \u2014 \u0b89\u0b99\u0bcd\u0b95\u0bb3\u0bbf\u0b9f\u0bae\u0bcd \u0b89\u0bb3\u0bcd\u0bb3 \u0b85\u0ba9\u0bc8\u0ba4\u0bcd\u0ba4\u0bc1 \u0ba8\u0bbe\u0ba3\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bc8\u0baf\u0bc1\u0bae\u0bcd \u0bb5\u0bc8\u0baa\u0bcd\u0baa\u0ba4\u0bc1. \u0bae\u0bb1\u0bcd\u0bb1\u0bb5\u0bb0\u0bcd\u0b95\u0bb3\u0bcd \u0b85\u0ba4\u0bb1\u0bcd\u0b95\u0bc1 \u0bae\u0bc7\u0bb2\u0bc1\u0bae\u0bcd \u0baa\u0ba8\u0bcd\u0ba4\u0baf\u0bae\u0bcd \u0ba4\u0bca\u0b9f\u0bb0\u0bcd\u0ba8\u0bcd\u0ba4\u0bbe\u0bb2\u0bcd \u0baa\u0b95\u0bcd\u0b95\u0baa\u0bcd \u0baa\u0bbe\u0ba9\u0bc8\u0b95\u0bb3\u0bcd \u0b89\u0bb0\u0bc1\u0bb5\u0bbe\u0b95\u0bc1\u0bae\u0bcd; \u0ba8\u0bc0\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0baa\u0b99\u0bcd\u0b95\u0bb3\u0bbf\u0ba4\u0bcd\u0ba4 \u0baa\u0bbe\u0ba9\u0bc8\u0baf\u0bbf\u0ba9\u0bcd \u0baa\u0b95\u0bc1\u0ba4\u0bbf\u0baf\u0bc8 \u0bae\u0b9f\u0bcd\u0b9f\u0bc1\u0bae\u0bc7 \u0bb5\u0bc6\u0bb2\u0bcd\u0bb2 \u0bae\u0bc1\u0b9f\u0bbf\u0baf\u0bc1\u0bae\u0bcd.</li></ul><h2>\u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bc8\u0b95\u0bcd \u0b95\u0bbe\u0b9f\u0bcd\u0b9f\u0bc1\u0ba4\u0bb2\u0bcd</h2><p>river \u0baa\u0ba8\u0bcd\u0ba4\u0baf \u0b9a\u0bc1\u0bb1\u0bcd\u0bb1\u0bc1\u0b95\u0bcd\u0b95\u0bc1\u0baa\u0bcd \u0baa\u0bbf\u0bb1\u0b95\u0bc1 \u0b87\u0bb0\u0ba3\u0bcd\u0b9f\u0bc1 \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 \u0b85\u0ba4\u0bb1\u0bcd\u0b95\u0bc1 \u0bae\u0bc7\u0bb1\u0bcd\u0baa\u0b9f\u0bcd\u0b9f \u0bb5\u0bc0\u0bb0\u0bb0\u0bcd\u0b95\u0bb3\u0bcd \u0b87\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bbe\u0bb2\u0bcd \u0b95\u0bc8\u0b95\u0bb3\u0bcd \u0ba4\u0bbf\u0bb1\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0b95\u0bbf\u0ba9\u0bcd\u0bb1\u0ba9. \u0b95\u0bbf\u0b9f\u0bc8\u0b95\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b8f\u0bb4\u0bc1 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bbf\u0bb2\u0bcd (\u0b87\u0bb0\u0ba3\u0bcd\u0b9f\u0bc1 \u0b9a\u0bca\u0ba8\u0bcd\u0ba4 + \u0b90\u0ba8\u0bcd\u0ba4\u0bc1 \u0baa\u0bca\u0ba4\u0bc1) \u0b89\u0bb0\u0bc1\u0bb5\u0bbe\u0b95\u0bc1\u0bae\u0bcd \u0b9a\u0bbf\u0bb1\u0ba8\u0bcd\u0ba4 \u0b90\u0ba8\u0bcd\u0ba4\u0bc1 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bcd \u0b95\u0bc2\u0b9f\u0bcd\u0b9f\u0bc1 \u0baa\u0bbe\u0ba9\u0bc8\u0baf\u0bc8 \u0bb5\u0bc6\u0bb2\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1. \u0b9a\u0bae\u0bae\u0bbe\u0ba9 \u0b95\u0bc8\u0b95\u0bb3\u0bcd \u0baa\u0bbe\u0ba9\u0bc8\u0baf\u0bc8\u0baa\u0bcd \u0baa\u0b95\u0bbf\u0bb0\u0bcd\u0ba8\u0bcd\u0ba4\u0bc1 \u0b95\u0bca\u0bb3\u0bcd\u0b95\u0bbf\u0ba9\u0bcd\u0bb1\u0ba9.</p><h2>\u0b95\u0bc8\u0b95\u0bb3\u0bbf\u0ba9\u0bcd \u0ba4\u0bb0\u0bb5\u0bb0\u0bbf\u0b9a\u0bc8, \u0bb5\u0bb2\u0bbf\u0bae\u0bc8\u0baf\u0bbe\u0ba9\u0ba4\u0bbf\u0bb2\u0bbf\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0baa\u0bb2\u0bb5\u0bc0\u0ba9\u0bae\u0bbe\u0ba9\u0ba4\u0bc1 \u0bb5\u0bb0\u0bc8</h2><ol><li><strong>\u0bb0\u0bbe\u0baf\u0bb2\u0bcd \u0b83\u0baa\u0bbf\u0bb3\u0bb7\u0bcd</strong> \u2014 \u0b92\u0bb0\u0bc7 \u0bb5\u0b95\u0bc8\u0baf\u0bbe\u0ba9 A K Q J 10.</li><li><strong>\u0bb8\u0bcd\u0b9f\u0bcd\u0bb0\u0bc6\u0baf\u0bbf\u0b9f\u0bcd \u0b83\u0baa\u0bbf\u0bb3\u0bb7\u0bcd</strong> \u2014 \u0b92\u0bb0\u0bc7 \u0bb5\u0b95\u0bc8\u0baf\u0bbe\u0ba9 \u0ba4\u0bca\u0b9f\u0bb0\u0bcd\u0b9a\u0bcd\u0b9a\u0bbf\u0baf\u0bbe\u0ba9 \u0b90\u0ba8\u0bcd\u0ba4\u0bc1 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd.</li><li><strong>\u0ba8\u0bbe\u0ba9\u0bcd\u0b95\u0bc1 \u0b92\u0bb0\u0bc7 \u0b8e\u0ba3\u0bcd</strong> \u2014 \u0b92\u0bb0\u0bc7 \u0b8e\u0ba3\u0bcd\u0ba3\u0bc1\u0bb3\u0bcd\u0bb3 \u0ba8\u0bbe\u0ba9\u0bcd\u0b95\u0bc1 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd.</li><li><strong>\u0b83\u0baa\u0bc1\u0bb2\u0bcd \u0bb9\u0bb5\u0bc1\u0bb8\u0bcd</strong> \u2014 \u0bae\u0bc2\u0ba9\u0bcd\u0bb1\u0bc1 \u0b92\u0bb0\u0bc7 \u0b8e\u0ba3\u0bcd \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0b92\u0bb0\u0bc1 \u0b9c\u0bcb\u0b9f\u0bbf.</li><li><strong>\u0b83\u0baa\u0bbf\u0bb3\u0bb7\u0bcd</strong> \u2014 \u0b92\u0bb0\u0bc7 \u0bb5\u0b95\u0bc8\u0baf\u0bbe\u0ba9 \u0b90\u0ba8\u0bcd\u0ba4\u0bc1 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd.</li><li><strong>\u0bb8\u0bcd\u0b9f\u0bcd\u0bb0\u0bc6\u0baf\u0bbf\u0b9f\u0bcd</strong> \u2014 \u0bb5\u0bc6\u0bb5\u0bcd\u0bb5\u0bc7\u0bb1\u0bc1 \u0bb5\u0b95\u0bc8\u0b95\u0bb3\u0bbf\u0bb2\u0bcd \u0ba4\u0bca\u0b9f\u0bb0\u0bcd\u0b9a\u0bcd\u0b9a\u0bbf\u0baf\u0bbe\u0ba9 \u0b90\u0ba8\u0bcd\u0ba4\u0bc1 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd.</li><li><strong>\u0bae\u0bc2\u0ba9\u0bcd\u0bb1\u0bc1 \u0b92\u0bb0\u0bc7 \u0b8e\u0ba3\u0bcd</strong> \u2014 \u0b92\u0bb0\u0bc7 \u0b8e\u0ba3\u0bcd\u0ba3\u0bc1\u0bb3\u0bcd\u0bb3 \u0bae\u0bc2\u0ba9\u0bcd\u0bb1\u0bc1 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd.</li><li><strong>\u0b87\u0bb0\u0ba3\u0bcd\u0b9f\u0bc1 \u0b9c\u0bcb\u0b9f\u0bbf</strong> \u2014 \u0bb5\u0bc6\u0bb5\u0bcd\u0bb5\u0bc7\u0bb1\u0bc1 \u0b87\u0bb0\u0ba3\u0bcd\u0b9f\u0bc1 \u0b9c\u0bcb\u0b9f\u0bbf\u0b95\u0bb3\u0bcd.</li><li><strong>\u0b92\u0bb0\u0bc1 \u0b9c\u0bcb\u0b9f\u0bbf</strong> \u2014 \u0b92\u0bb0\u0bc7 \u0b8e\u0ba3\u0bcd\u0ba3\u0bc1\u0bb3\u0bcd\u0bb3 \u0b87\u0bb0\u0ba3\u0bcd\u0b9f\u0bc1 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bcd.</li><li><strong>\u0b89\u0baf\u0bb0\u0bcd\u0ba8\u0bcd\u0ba4 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc1</strong> \u2014 \u0bae\u0bc7\u0bb1\u0bcd\u0b95\u0ba3\u0bcd\u0b9f \u0b8e\u0ba4\u0bc1\u0bb5\u0bc1\u0bae\u0bcd \u0b87\u0bb2\u0bcd\u0bb2\u0bc8; \u0b89\u0baf\u0bb0\u0bcd\u0ba8\u0bcd\u0ba4 \u0b9a\u0bc0\u0b9f\u0bcd\u0b9f\u0bc7 \u0bae\u0bc1\u0b9f\u0bbf\u0bb5\u0bc1 \u0b9a\u0bc6\u0baf\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1.</li></ol><h2>PokerTH-\u0b87\u0bb2\u0bcd \u0baa\u0bcb\u0b9f\u0bcd\u0b9f\u0bbf\u0b95\u0bb3\u0bcd</h2><p>PokerTH \u0b86\u0b9f\u0bcd\u0b9f\u0b99\u0bcd\u0b95\u0bb3\u0bcd sit-and-go \u0bb5\u0b95\u0bc8\u0baa\u0bcd \u0baa\u0bcb\u0b9f\u0bcd\u0b9f\u0bbf\u0b95\u0bb3\u0bcd: \u0b85\u0ba9\u0bc8\u0bb5\u0bb0\u0bc1\u0bae\u0bcd \u0b92\u0bb0\u0bc7 \u0b85\u0bb3\u0bb5\u0bc1 \u0ba8\u0bbe\u0ba3\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bc1\u0b9f\u0ba9\u0bcd \u0ba4\u0bca\u0b9f\u0b99\u0bcd\u0b95\u0bc1\u0b95\u0bbf\u0bb1\u0bbe\u0bb0\u0bcd\u0b95\u0bb3\u0bcd, \u0baa\u0bbf\u0bb3\u0bc8\u0ba3\u0bcd\u0b9f\u0bcd \u0b95\u0bbe\u0bb2\u0baa\u0bcd\u0baa\u0bcb\u0b95\u0bcd\u0b95\u0bbf\u0bb2\u0bcd \u0b89\u0baf\u0bb0\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1, \u0b95\u0b9f\u0bc8\u0b9a\u0bbf\u0baf\u0bbe\u0b95 \u0ba8\u0bbe\u0ba3\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0bb5\u0bc8\u0ba4\u0bcd\u0ba4\u0bbf\u0bb0\u0bc1\u0baa\u0bcd\u0baa\u0bb5\u0bb0\u0bcd \u0bb5\u0bc6\u0bb2\u0bcd\u0b95\u0bbf\u0bb1\u0bbe\u0bb0\u0bcd. \u0b95\u0ba3\u0bbf\u0ba9\u0bbf \u0b8e\u0ba4\u0bbf\u0bb0\u0bbe\u0bb3\u0bbf\u0b95\u0bb3\u0bc1\u0b95\u0bcd\u0b95\u0bc1 \u0b8e\u0ba4\u0bbf\u0bb0\u0bbe\u0b95 \u0b87\u0ba3\u0bc8\u0baf\u0bae\u0bbf\u0bb2\u0bcd\u0bb2\u0bbe\u0bae\u0bb2\u0bcd \u0baa\u0baf\u0bbf\u0bb1\u0bcd\u0b9a\u0bbf \u0b9a\u0bc6\u0baf\u0bcd\u0baf\u0bb2\u0bbe\u0bae\u0bcd, LAN \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 \u0b9a\u0bca\u0ba8\u0bcd\u0ba4 \u0b9a\u0bc7\u0bb5\u0bc8\u0baf\u0b95\u0ba4\u0bcd\u0ba4\u0bbf\u0bb2\u0bcd \u0bb5\u0bbf\u0bb3\u0bc8\u0baf\u0bbe\u0b9f\u0bb2\u0bbe\u0bae\u0bcd, \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 \u0baa\u0bb0\u0bc1\u0bb5\u0b95\u0bbe\u0bb2 \u0ba4\u0bb0\u0bb5\u0bb0\u0bbf\u0b9a\u0bc8\u0b95\u0bb3\u0bc1\u0b9f\u0ba9\u0bcd \u0b95\u0bc2\u0b9f\u0bbf\u0baf \u0b85\u0ba4\u0bbf\u0b95\u0bbe\u0bb0\u0baa\u0bcd\u0baa\u0bc2\u0bb0\u0bcd\u0bb5 pokerth.net \u0bb5\u0bb2\u0bc8\u0baf\u0bae\u0bc8\u0baa\u0bcd\u0baa\u0bbf\u0bb2\u0bcd \u0b9a\u0bc7\u0bb0\u0bb2\u0bbe\u0bae\u0bcd.</p>" },
  fil: {
    title: "Mga patakaran ng Texas Hold\u2019em \u2014 PokerTH web client",
    desc: "Kumpletong patakaran ng Texas Hold\u2019em gaya ng nilalaro sa PokerTH: blinds, apat na round ng pusta, Fold/Check/Call/Raise/All-In, side pot, at ranggo ng mga kamay.",
    ldHeadline: "Mga patakaran ng poker na Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Paano maglaro ng No-Limit Texas Hold\u2019em: blinds, round ng pusta, aksyon, at ranggo ng mga kamay, gaya sa PokerTH.",
    body: "<h1>Mga patakaran ng poker na Texas Hold\u2019em</h1><p>Sa PokerTH ay No-Limit Texas Hold\u2019em ang nilalaro, ang pinakasikat na uri ng poker sa mundo. Sinusubukan ng bawat manlalaro na buuin ang pinakamahusay na limang kartang kamay mula sa dalawang sariling karta at limang karaniwang karta.</p><h2>Ang pamimigay at ang blinds</h2><p>Nagsisimula ang bawat kamay sa dalawang sapilitang pusta: ang manlalaro sa kaliwa ng dealer button ang naglalagay ng <em>small blind</em>, at ang kasunod naman ang <em>big blind</em>. Pagkatapos ay tumatanggap ang bawat manlalaro ng dalawang nakataob na karta (ang <em>sariling karta</em>). Umuusod ang button ng isang upuan pakanan sa bawat kamay, at sa PokerTH ay tumataas ang blinds sa tuwing may takdang agwat.</p><h2>Ang apat na round ng pusta</h2><ul><li><strong>Pre-flop</strong> \u2014 matapos matanggap ang sariling karta, salitan ang mga manlalaro simula sa kaliwa ng big blind.</li><li><strong>Flop</strong> \u2014 inilalantad ang tatlong karaniwang karta, na sinusundan ng isang round ng pusta.</li><li><strong>Turn</strong> \u2014 ibinibigay ang ikaapat na karaniwang karta, sinusundan ng isa pang round ng pusta.</li><li><strong>River</strong> \u2014 ibinibigay ang ikalima at huling karaniwang karta, sinusundan ng huling round ng pusta.</li></ul><h2>Ang mga aksyon</h2><ul><li><strong>Fold</strong> \u2014 isuko ang kamay pati na ang mga chip na naipusta na.</li><li><strong>Check</strong> \u2014 ipasa ang tira nang walang pusta (kung walang pumusta sa kasalukuyang round).</li><li><strong>Call</strong> \u2014 tapatan ang pinakamataas na pustang kasalukuyan.</li><li><strong>Raise</strong> \u2014 taasan ang kasalukuyang pusta. Sa No-Limit, kahit anong halaga hanggang sa buo mong stack.</li><li><strong>All-In</strong> \u2014 ipusta ang lahat ng iyong chip. Kung magpapatuloy pa ang iba nang lampas doon, nabubuo ang side pot, kaya ang bahagi lang ng pot na inambagan mo ang puwede mong mapanalunan.</li></ul><h2>Ang showdown</h2><p>Kung may dalawa o higit pang manlalarong natira pagkatapos ng round ng pusta sa river, ipinapakita ang mga kamay. Ang pinakamahusay na kombinasyon ng limang karta mula sa pitong magagamit (dalawang sarili + limang karaniwan) ang nananalo ng pot. Hinahati ang pot kapag pantay ang mga kamay.</p><h2>Ranggo ng mga kamay, mula pinakamalakas hanggang pinakamahina</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10 na iisa ang palo.</li><li><strong>Straight flush</strong> \u2014 limang magkakasunod na karta na iisa ang palo.</li><li><strong>Apat na magkapareho</strong> \u2014 apat na kartang iisa ang halaga.</li><li><strong>Full house</strong> \u2014 tatlong magkapareho at isang pares.</li><li><strong>Flush</strong> \u2014 limang kartang iisa ang palo.</li><li><strong>Straight</strong> \u2014 limang magkakasunod na karta na magkakaiba ang palo.</li><li><strong>Tatlong magkapareho</strong> \u2014 tatlong kartang iisa ang halaga.</li><li><strong>Dalawang pares</strong> \u2014 dalawang magkaibang pares.</li><li><strong>Isang pares</strong> \u2014 dalawang kartang iisa ang halaga.</li><li><strong>Mataas na karta</strong> \u2014 wala sa mga nasa itaas; ang pinakamataas na karta ang magpapasya.</li></ol><h2>Mga torneo sa PokerTH</h2><p>Ang mga laro sa PokerTH ay torneong sit-and-go: pare-pareho ang panimulang stack ng lahat, tumataas ang blinds sa paglipas ng oras, at ang huling manlalarong may natitirang chip ang panalo. Puwede kang magsanay offline laban sa computer, maglaro sa LAN o sa sariling server, o sumali sa opisyal na pokerth.net na may ranggo kada season.</p>" },
  sw: {
    title: "Kanuni za Texas Hold\u2019em \u2014 Programu ya wavuti ya PokerTH",
    desc: "Kanuni kamili za Texas Hold\u2019em kama zinavyochezwa katika PokerTH: blaindi, raundi nne za kuweka dau, Fold/Check/Call/Raise/All-In, mafungu ya pembeni na madaraja ya mikono.",
    ldHeadline: "Kanuni za poka ya Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Jinsi ya kucheza No-Limit Texas Hold\u2019em: blaindi, raundi za dau, hatua na madaraja ya mikono, kama katika PokerTH.",
    body: "<h1>Kanuni za poka ya Texas Hold\u2019em</h1><p>Katika PokerTH huchezwa No-Limit Texas Hold\u2019em, aina ya poka inayopendwa zaidi duniani. Kila mchezaji hujaribu kuunda mkono bora wa karata tano kutoka karata zake mbili na karata tano za pamoja.</p><h2>Ugawaji na blaindi</h2><p>Kila mkono huanza kwa dau mbili za lazima: mchezaji aliye kushoto kwa kitufe cha mgawaji huweka <em>blaindi ndogo</em> na anayefuata huweka <em>blaindi kubwa</em>. Kisha kila mchezaji hupewa karata mbili zilizofunikwa (<em>karata zake mwenyewe</em>). Kitufe husogea kiti kimoja kwa mwendo wa saa baada ya kila mkono, na katika PokerTH blaindi hupanda kwa vipindi vya kawaida.</p><h2>Raundi nne za kuweka dau</h2><ul><li><strong>Pre-flop</strong> \u2014 baada ya kupokea karata zao, wachezaji hucheza kwa zamu kuanzia kushoto kwa blaindi kubwa.</li><li><strong>Flop</strong> \u2014 karata tatu za pamoja hufunuliwa, kisha hufuata raundi ya dau.</li><li><strong>Turn</strong> \u2014 karata ya nne ya pamoja hugawiwa, ikifuatiwa na raundi nyingine ya dau.</li><li><strong>River</strong> \u2014 karata ya tano na ya mwisho ya pamoja hugawiwa, ikifuatiwa na raundi ya mwisho ya dau.</li></ul><h2>Hatua</h2><ul><li><strong>Fold</strong> \u2014 kuachana na mkono pamoja na chipu ulizokwisha weka.</li><li><strong>Check</strong> \u2014 kupitisha zamu bila kuweka dau (ikiwa tu hakuna aliyeweka dau katika raundi hiyo).</li><li><strong>Call</strong> \u2014 kulingana na dau kubwa zaidi iliyopo.</li><li><strong>Raise</strong> \u2014 kupandisha dau iliyopo. Katika No-Limit, kwa kiasi chochote hadi chipu zako zote.</li><li><strong>All-In</strong> \u2014 kuweka chipu zako zote. Wengine wakiendelea kuweka dau zaidi ya hapo, hutengenezwa mafungu ya pembeni, hivyo unaweza kushinda tu sehemu ya fungu uliyochangia.</li></ul><h2>Kufunua karata</h2><p>Iwapo baada ya raundi ya dau kwenye river wamebaki wachezaji wawili au zaidi, mikono hufunuliwa. Mchanganyiko bora wa karata tano kati ya saba zilizopo (mbili zako + tano za pamoja) hushinda fungu. Mikono iliyo sawa hugawana fungu.</p><h2>Madaraja ya mikono, kutoka yenye nguvu zaidi hadi dhaifu</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10 za sura moja.</li><li><strong>Straight flush</strong> \u2014 karata tano mfululizo za sura moja.</li><li><strong>Nne zinazofanana</strong> \u2014 karata nne zenye thamani sawa.</li><li><strong>Full house</strong> \u2014 tatu zinazofanana pamoja na jozi.</li><li><strong>Flush</strong> \u2014 karata tano za sura moja.</li><li><strong>Straight</strong> \u2014 karata tano mfululizo za sura tofauti.</li><li><strong>Tatu zinazofanana</strong> \u2014 karata tatu zenye thamani sawa.</li><li><strong>Jozi mbili</strong> \u2014 jozi mbili tofauti.</li><li><strong>Jozi moja</strong> \u2014 karata mbili zenye thamani sawa.</li><li><strong>Karata ya juu</strong> \u2014 hakuna kati ya hizo; karata ya juu zaidi huamua.</li></ol><h2>Mashindano katika PokerTH</h2><p>Michezo ya PokerTH ni mashindano ya mtindo wa sit-and-go: wote huanza na chipu sawa, blaindi hupanda kadri muda unavyosonga, na mchezaji wa mwisho mwenye chipu hushinda. Unaweza kufanya mazoezi nje ya mtandao dhidi ya kompyuta, kucheza kwa LAN au seva yako mwenyewe, au kujiunga na mtandao rasmi wa pokerth.net wenye viwango vya msimu.</p>" },
  bg: {
    title: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u043d\u0430 Texas Hold\u2019em \u2014 \u0443\u0435\u0431 \u043a\u043b\u0438\u0435\u043d\u0442 \u043d\u0430 PokerTH",
    desc: "\u041f\u044a\u043b\u043d\u0438\u0442\u0435 \u043f\u0440\u0430\u0432\u0438\u043b\u0430 \u043d\u0430 Texas Hold\u2019em \u0442\u0430\u043a\u0430, \u043a\u0430\u043a\u0442\u043e \u0441\u0435 \u0438\u0433\u0440\u0430\u0435 \u0432 PokerTH: \u0431\u043b\u0430\u0439\u043d\u0434\u043e\u0432\u0435, \u0447\u0435\u0442\u0438\u0440\u0438\u0442\u0435 \u043a\u0440\u044a\u0433\u0430 \u043d\u0430 \u0437\u0430\u043b\u0430\u0433\u0430\u043d\u0435, Fold/Check/Call/Raise/All-In, \u0441\u0442\u0440\u0430\u043d\u0438\u0447\u043d\u0438 \u043f\u043e\u0442\u043e\u0432\u0435 \u0438 \u043f\u043e\u0434\u0440\u0435\u0434\u0431\u0430 \u043d\u0430 \u0440\u044a\u0446\u0435\u0442\u0435.",
    ldHeadline: "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u043d\u0430 \u043f\u043e\u043a\u0435\u0440\u0430 Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "\u041a\u0430\u043a \u0441\u0435 \u0438\u0433\u0440\u0430\u0435 Texas Hold\u2019em \u0431\u0435\u0437 \u043b\u0438\u043c\u0438\u0442: \u0431\u043b\u0430\u0439\u043d\u0434\u043e\u0432\u0435, \u043a\u0440\u044a\u0433\u043e\u0432\u0435 \u043d\u0430 \u0437\u0430\u043b\u0430\u0433\u0430\u043d\u0435, \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f \u0438 \u043f\u043e\u0434\u0440\u0435\u0434\u0431\u0430 \u043d\u0430 \u0440\u044a\u0446\u0435\u0442\u0435, \u043a\u0430\u043a\u0442\u043e \u0432 PokerTH.",
    body: "<h1>\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u043d\u0430 \u043f\u043e\u043a\u0435\u0440\u0430 Texas Hold\u2019em</h1><p>\u0412 PokerTH \u0441\u0435 \u0438\u0433\u0440\u0430\u0435 Texas Hold\u2019em \u0431\u0435\u0437 \u043b\u0438\u043c\u0438\u0442 \u2014 \u043d\u0430\u0439-\u043f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u0430\u0442\u0430 \u0440\u0430\u0437\u043d\u043e\u0432\u0438\u0434\u043d\u043e\u0441\u0442 \u043d\u0430 \u043f\u043e\u043a\u0435\u0440\u0430 \u0432 \u0441\u0432\u0435\u0442\u0430. \u0412\u0441\u0435\u043a\u0438 \u0438\u0433\u0440\u0430\u0447 \u0441\u0435 \u043e\u043f\u0438\u0442\u0432\u0430 \u0434\u0430 \u0441\u044a\u0441\u0442\u0430\u0432\u0438 \u043d\u0430\u0439-\u0434\u043e\u0431\u0440\u0430\u0442\u0430 \u0440\u044a\u043a\u0430 \u043e\u0442 \u043f\u0435\u0442 \u043a\u0430\u0440\u0442\u0438, \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0439\u043a\u0438 \u0434\u0432\u0435\u0442\u0435 \u0441\u0438 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u0438 \u043f\u0435\u0442\u0442\u0435 \u043e\u0431\u0449\u0438 \u043a\u0430\u0440\u0442\u0438.</p><h2>\u0420\u0430\u0437\u0434\u0430\u0432\u0430\u043d\u0435\u0442\u043e \u0438 \u0431\u043b\u0430\u0439\u043d\u0434\u043e\u0432\u0435\u0442\u0435</h2><p>\u0412\u0441\u044f\u043a\u043e \u0440\u0430\u0437\u0434\u0430\u0432\u0430\u043d\u0435 \u0437\u0430\u043f\u043e\u0447\u0432\u0430 \u0441 \u0434\u0432\u0430 \u0437\u0430\u0434\u044a\u043b\u0436\u0438\u0442\u0435\u043b\u043d\u0438 \u0437\u0430\u043b\u043e\u0433\u0430: \u0438\u0433\u0440\u0430\u0447\u044a\u0442 \u0432\u043b\u044f\u0432\u043e \u043e\u0442 \u0431\u0443\u0442\u043e\u043d\u0430 \u043d\u0430 \u0434\u0438\u043b\u044a\u0440\u0430 \u0437\u0430\u043b\u0430\u0433\u0430 <em>\u043c\u0430\u043b\u043a\u0438\u044f \u0431\u043b\u0430\u0439\u043d\u0434</em>, \u0430 \u0441\u043b\u0435\u0434\u0432\u0430\u0449\u0438\u044f\u0442 \u2014 <em>\u0433\u043e\u043b\u0435\u043c\u0438\u044f \u0431\u043b\u0430\u0439\u043d\u0434</em>. \u0421\u043b\u0435\u0434 \u0442\u043e\u0432\u0430 \u0432\u0441\u0435\u043a\u0438 \u0438\u0433\u0440\u0430\u0447 \u043f\u043e\u043b\u0443\u0447\u0430\u0432\u0430 \u0434\u0432\u0435 \u0437\u0430\u043a\u0440\u0438\u0442\u0438 \u043a\u0430\u0440\u0442\u0438 (<em>\u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 \u043a\u0430\u0440\u0442\u0438</em>). \u0421\u043b\u0435\u0434 \u0432\u0441\u044f\u043a\u043e \u0440\u0430\u0437\u0434\u0430\u0432\u0430\u043d\u0435 \u0431\u0443\u0442\u043e\u043d\u044a\u0442 \u0441\u0435 \u043f\u0440\u0435\u043c\u0435\u0441\u0442\u0432\u0430 \u0441 \u0435\u0434\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u043f\u043e \u0447\u0430\u0441\u043e\u0432\u043d\u0438\u043a\u043e\u0432\u0430\u0442\u0430 \u0441\u0442\u0440\u0435\u043b\u043a\u0430, \u0430 \u0432 PokerTH \u0431\u043b\u0430\u0439\u043d\u0434\u043e\u0432\u0435\u0442\u0435 \u0440\u0430\u0441\u0442\u0430\u0442 \u043f\u0440\u0435\u0437 \u0440\u0430\u0432\u043d\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438.</p><h2>\u0427\u0435\u0442\u0438\u0440\u0438\u0442\u0435 \u043a\u0440\u044a\u0433\u0430 \u043d\u0430 \u0437\u0430\u043b\u0430\u0433\u0430\u043d\u0435</h2><ul><li><strong>Pre-flop</strong> \u2014 \u0441\u043b\u0435\u0434 \u043a\u0430\u0442\u043e \u043f\u043e\u043b\u0443\u0447\u0430\u0442 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u0442\u0435 \u0441\u0438 \u043a\u0430\u0440\u0442\u0438, \u0438\u0433\u0440\u0430\u0447\u0438\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0430\u0442 \u043f\u043e \u0440\u0435\u0434, \u0437\u0430\u043f\u043e\u0447\u0432\u0430\u0439\u043a\u0438 \u043e\u0442\u043b\u044f\u0432\u043e \u043d\u0430 \u0433\u043e\u043b\u0435\u043c\u0438\u044f \u0431\u043b\u0430\u0439\u043d\u0434.</li><li><strong>Flop</strong> \u2014 \u0440\u0430\u0437\u043a\u0440\u0438\u0432\u0430\u0442 \u0441\u0435 \u0442\u0440\u0438 \u043e\u0431\u0449\u0438 \u043a\u0430\u0440\u0442\u0438, \u0441\u043b\u0435\u0434 \u043a\u043e\u0435\u0442\u043e \u0441\u043b\u0435\u0434\u0432\u0430 \u043a\u0440\u044a\u0433 \u043d\u0430 \u0437\u0430\u043b\u0430\u0433\u0430\u043d\u0435.</li><li><strong>Turn</strong> \u2014 \u0440\u0430\u0437\u0434\u0430\u0432\u0430 \u0441\u0435 \u0447\u0435\u0442\u0432\u044a\u0440\u0442\u0430 \u043e\u0431\u0449\u0430 \u043a\u0430\u0440\u0442\u0430 \u0438 \u0441\u043b\u0435\u0434\u0432\u0430 \u043e\u0449\u0435 \u0435\u0434\u0438\u043d \u043a\u0440\u044a\u0433 \u043d\u0430 \u0437\u0430\u043b\u0430\u0433\u0430\u043d\u0435.</li><li><strong>River</strong> \u2014 \u0440\u0430\u0437\u0434\u0430\u0432\u0430 \u0441\u0435 \u043f\u0435\u0442\u0430\u0442\u0430 \u0438 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0430 \u043e\u0431\u0449\u0430 \u043a\u0430\u0440\u0442\u0430, \u0441\u043b\u0435\u0434\u0432\u0430\u043d\u0430 \u043e\u0442 \u0437\u0430\u043a\u043b\u044e\u0447\u0438\u0442\u0435\u043b\u043d\u0438\u044f \u043a\u0440\u044a\u0433 \u043d\u0430 \u0437\u0430\u043b\u0430\u0433\u0430\u043d\u0435.</li></ul><h2>\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u0442\u0430</h2><ul><li><strong>Fold</strong> \u2014 \u043e\u0442\u043a\u0430\u0437 \u043e\u0442 \u0440\u044a\u043a\u0430\u0442\u0430 \u0438 \u043e\u0442 \u0432\u0435\u0447\u0435 \u0437\u0430\u043b\u043e\u0436\u0435\u043d\u0438\u0442\u0435 \u0447\u0438\u043f\u043e\u0432\u0435.</li><li><strong>Check</strong> \u2014 \u043f\u043e\u0434\u0430\u0432\u0430\u043d\u0435 \u043d\u0430\u043f\u0440\u0435\u0434 \u0431\u0435\u0437 \u0437\u0430\u043b\u043e\u0433 (\u0441\u0430\u043c\u043e \u0430\u043a\u043e \u0432 \u0442\u0435\u043a\u0443\u0449\u0438\u044f \u043a\u0440\u044a\u0433 \u043d\u0438\u043a\u043e\u0439 \u043d\u0435 \u0435 \u0437\u0430\u043b\u0430\u0433\u0430\u043b).</li><li><strong>Call</strong> \u2014 \u0438\u0437\u0440\u0430\u0432\u043d\u044f\u0432\u0430\u043d\u0435 \u043d\u0430 \u043d\u0430\u0439-\u0432\u0438\u0441\u043e\u043a\u0438\u044f \u0442\u0435\u043a\u0443\u0449 \u0437\u0430\u043b\u043e\u0433.</li><li><strong>Raise</strong> \u2014 \u043f\u043e\u0432\u0438\u0448\u0430\u0432\u0430\u043d\u0435 \u043d\u0430 \u0442\u0435\u043a\u0443\u0449\u0438\u044f \u0437\u0430\u043b\u043e\u0433. \u0411\u0435\u0437 \u043b\u0438\u043c\u0438\u0442 \u2014 \u0441 \u0432\u0441\u044f\u043a\u0430\u043a\u0432\u0430 \u0441\u0443\u043c\u0430 \u0434\u043e \u0446\u0435\u043b\u0438\u044f \u0432\u0438 \u0441\u0442\u0435\u043a.</li><li><strong>All-In</strong> \u2014 \u0437\u0430\u043b\u0430\u0433\u0430\u043d\u0435 \u043d\u0430 \u0432\u0441\u0438\u0447\u043a\u0438\u0442\u0435 \u0441\u0438 \u0447\u0438\u043f\u043e\u0432\u0435. \u0410\u043a\u043e \u043e\u0441\u0442\u0430\u043d\u0430\u043b\u0438\u0442\u0435 \u043f\u0440\u043e\u0434\u044a\u043b\u0436\u0430\u0442 \u0434\u0430 \u0437\u0430\u043b\u0430\u0433\u0430\u0442 \u043d\u0430\u0434 \u0442\u043e\u0432\u0430, \u0441\u0435 \u043e\u0431\u0440\u0430\u0437\u0443\u0432\u0430\u0442 \u0441\u0442\u0440\u0430\u043d\u0438\u0447\u043d\u0438 \u043f\u043e\u0442\u043e\u0432\u0435, \u0442\u0430\u043a\u0430 \u0447\u0435 \u043c\u043e\u0436\u0435\u0442\u0435 \u0434\u0430 \u0441\u043f\u0435\u0447\u0435\u043b\u0438\u0442\u0435 \u0441\u0430\u043c\u043e \u043e\u043d\u0430\u0437\u0438 \u0447\u0430\u0441\u0442 \u043e\u0442 \u043f\u043e\u0442\u0430, \u0432 \u043a\u043e\u044f\u0442\u043e \u0441\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u0432\u0430\u043b\u0438.</li></ul><h2>\u0420\u0430\u0437\u043a\u0440\u0438\u0432\u0430\u043d\u0435 \u043d\u0430 \u043a\u0430\u0440\u0442\u0438\u0442\u0435</h2><p>\u0410\u043a\u043e \u0441\u043b\u0435\u0434 \u043a\u0440\u044a\u0433\u0430 \u043d\u0430 \u0437\u0430\u043b\u0430\u0433\u0430\u043d\u0435 \u043d\u0430 \u0440\u0438\u0432\u044a\u0440\u0430 \u043e\u0441\u0442\u0430\u043d\u0430\u0442 \u0434\u0432\u0430\u043c\u0430 \u0438\u043b\u0438 \u043f\u043e\u0432\u0435\u0447\u0435 \u0438\u0433\u0440\u0430\u0447\u0438, \u0440\u044a\u0446\u0435\u0442\u0435 \u0441\u0435 \u0440\u0430\u0437\u043a\u0440\u0438\u0432\u0430\u0442. \u041d\u0430\u0439-\u0434\u043e\u0431\u0440\u0430\u0442\u0430 \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u044f \u043e\u0442 \u043f\u0435\u0442 \u043a\u0430\u0440\u0442\u0438 \u0438\u0437\u043c\u0435\u0436\u0434\u0443 \u0441\u0435\u0434\u0435\u043c\u0442\u0435 \u043d\u0430\u043b\u0438\u0447\u043d\u0438 (\u0434\u0432\u0435 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438 + \u043f\u0435\u0442 \u043e\u0431\u0449\u0438) \u043f\u0435\u0447\u0435\u043b\u0438 \u043f\u043e\u0442\u0430. \u0420\u0430\u0432\u043d\u0438\u0442\u0435 \u0440\u044a\u0446\u0435 \u0441\u0438 \u0433\u043e \u043f\u043e\u0434\u0435\u043b\u044f\u0442.</p><h2>\u041f\u043e\u0434\u0440\u0435\u0434\u0431\u0430 \u043d\u0430 \u0440\u044a\u0446\u0435\u0442\u0435, \u043e\u0442 \u043d\u0430\u0439-\u0441\u0438\u043b\u043d\u0430\u0442\u0430 \u043a\u044a\u043c \u043d\u0430\u0439-\u0441\u043b\u0430\u0431\u0430\u0442\u0430</h2><ol><li><strong>\u0420\u043e\u044f\u043b \u0444\u043b\u044a\u0448</strong> \u2014 A K Q J 10 \u043e\u0442 \u0435\u0434\u043d\u0430 \u0431\u043e\u044f.</li><li><strong>\u0421\u0442\u0440\u0435\u0439\u0442 \u0444\u043b\u044a\u0448</strong> \u2014 \u043f\u0435\u0442 \u043f\u043e\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u0442\u0435\u043b\u043d\u0438 \u043a\u0430\u0440\u0442\u0438 \u043e\u0442 \u0435\u0434\u043d\u0430 \u0431\u043e\u044f.</li><li><strong>\u041a\u0430\u0440\u0435</strong> \u2014 \u0447\u0435\u0442\u0438\u0440\u0438 \u043a\u0430\u0440\u0442\u0438 \u0441 \u0435\u0434\u043d\u0430\u043a\u0432\u0430 \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442.</li><li><strong>\u0424\u0443\u043b \u0445\u0430\u0443\u0441</strong> \u2014 \u0442\u0440\u043e\u0439\u043a\u0430 \u043f\u043b\u044e\u0441 \u0434\u0432\u043e\u0439\u043a\u0430.</li><li><strong>\u0424\u043b\u044a\u0448</strong> \u2014 \u043f\u0435\u0442 \u043a\u0430\u0440\u0442\u0438 \u043e\u0442 \u0435\u0434\u043d\u0430 \u0431\u043e\u044f.</li><li><strong>\u0421\u0442\u0440\u0435\u0439\u0442</strong> \u2014 \u043f\u0435\u0442 \u043f\u043e\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u0442\u0435\u043b\u043d\u0438 \u043a\u0430\u0440\u0442\u0438 \u043e\u0442 \u0440\u0430\u0437\u043b\u0438\u0447\u043d\u0438 \u0431\u043e\u0438.</li><li><strong>\u0422\u0440\u043e\u0439\u043a\u0430</strong> \u2014 \u0442\u0440\u0438 \u043a\u0430\u0440\u0442\u0438 \u0441 \u0435\u0434\u043d\u0430\u043a\u0432\u0430 \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442.</li><li><strong>\u0414\u0432\u0430 \u0447\u0438\u0444\u0442\u0430</strong> \u2014 \u0434\u0432\u0430 \u0440\u0430\u0437\u043b\u0438\u0447\u043d\u0438 \u0447\u0438\u0444\u0442\u0430.</li><li><strong>\u0427\u0438\u0444\u0442</strong> \u2014 \u0434\u0432\u0435 \u043a\u0430\u0440\u0442\u0438 \u0441 \u0435\u0434\u043d\u0430\u043a\u0432\u0430 \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442.</li><li><strong>\u0412\u0438\u0441\u043e\u043a\u0430 \u043a\u0430\u0440\u0442\u0430</strong> \u2014 \u043d\u0438\u0449\u043e \u043e\u0442 \u0438\u0437\u0431\u0440\u043e\u0435\u043d\u043e\u0442\u043e; \u0440\u0435\u0448\u0430\u0432\u0430 \u043d\u0430\u0439-\u0432\u0438\u0441\u043e\u043a\u0430\u0442\u0430 \u043a\u0430\u0440\u0442\u0430.</li></ol><h2>\u0422\u0443\u0440\u043d\u0438\u0440\u0438\u0442\u0435 \u0432 PokerTH</h2><p>\u0418\u0433\u0440\u0438\u0442\u0435 \u0432 PokerTH \u0441\u0430 \u0442\u0443\u0440\u043d\u0438\u0440\u0438 \u043e\u0442 \u0442\u0438\u043f\u0430 sit-and-go: \u0432\u0441\u0438\u0447\u043a\u0438 \u0437\u0430\u043f\u043e\u0447\u0432\u0430\u0442 \u0441 \u0435\u0434\u043d\u0430\u043a\u044a\u0432 \u0441\u0442\u0435\u043a, \u0431\u043b\u0430\u0439\u043d\u0434\u043e\u0432\u0435\u0442\u0435 \u0441\u0435 \u043f\u043e\u043a\u0430\u0447\u0432\u0430\u0442 \u0441 \u0432\u0440\u0435\u043c\u0435\u0442\u043e \u0438 \u043f\u0435\u0447\u0435\u043b\u0438 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u044f\u0442 \u0438\u0433\u0440\u0430\u0447 \u0441 \u0447\u0438\u043f\u043e\u0432\u0435. \u041c\u043e\u0436\u0435\u0442\u0435 \u0434\u0430 \u0442\u0440\u0435\u043d\u0438\u0440\u0430\u0442\u0435 \u043e\u0444\u043b\u0430\u0439\u043d \u0441\u0440\u0435\u0449\u0443 \u043a\u043e\u043c\u043f\u044e\u0442\u044a\u0440\u043d\u0438 \u043f\u0440\u043e\u0442\u0438\u0432\u043d\u0438\u0446\u0438, \u0434\u0430 \u0438\u0433\u0440\u0430\u0435\u0442\u0435 \u043f\u043e \u043b\u043e\u043a\u0430\u043b\u043d\u0430 \u043c\u0440\u0435\u0436\u0430 \u0438\u043b\u0438 \u043d\u0430 \u0441\u0432\u043e\u0439 \u0441\u044a\u0440\u0432\u044a\u0440, \u0438\u043b\u0438 \u0434\u0430 \u0441\u0435 \u043f\u0440\u0438\u0441\u044a\u0435\u0434\u0438\u043d\u0438\u0442\u0435 \u043a\u044a\u043c \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430\u0442\u0430 \u043c\u0440\u0435\u0436\u0430 pokerth.net \u0441\u044a\u0441 \u0441\u0435\u0437\u043e\u043d\u043d\u0438\u0442\u0435 \u045d \u043a\u043b\u0430\u0441\u0430\u0446\u0438\u0438.</p>" },
  gd: {
    title: "Riaghailtean Texas Hold\u2019em \u2014 cliant-l\u00ecn PokerTH",
    desc: "Riaghailtean sl\u00e0na Texas Hold\u2019em mar a thathar ga chluich ann am PokerTH: dall-gheallan, na ceithir cuairtean gheallan, Fold/Check/Call/Raise/All-In, poitean-taobh agus rangachadh nan l\u00e0mhan.",
    ldHeadline: "Riaghailtean p\u00f2cair Texas Hold\u2019em \u2014 PokerTH",
    ldDesc: "Mar a chluicheas tu Texas Hold\u2019em gun chr\u00ecoch: dall-gheallan, cuairtean gheallan, gluasadan agus rangachadh nan l\u00e0mhan, mar a tha ann am PokerTH.",
    body: "<h1>Riaghailtean p\u00f2cair Texas Hold\u2019em</h1><p>Ann am PokerTH thathar a\u2019 cluich Texas Hold\u2019em gun chr\u00ecoch, an se\u00f2rsa p\u00f2cair as motha a chluichear air feadh an t-saoghail. Feuchaidh gach cluicheadair ris an l\u00e0mh as fhe\u00e0rr de ch\u00f2ig cairtean a chur ri ch\u00e8ile bho dh\u00e0 chairt phr\u00ecobhaideach agus c\u00f2ig cairtean coitcheann.</p><h2>An roinneadh agus na dall-gheallan</h2><p>T\u00f2isichidh gach l\u00e0mh le d\u00e0 gheall \u00e8igneachail: cuiridh an cluicheadair air taobh cl\u00ec putan an neach-roinnidh an <em>dall-gheall beag</em>, agus an ath fhear an <em>dall-gheall m\u00f2r</em>. An uair sin gheibh gach cluicheadair d\u00e0 chairt fo ch\u00f2mhdach (na <em>cairtean pr\u00ecobhaideach</em>). Gluaisidh am putan aon \u00e0ite deiseil \u00e0s d\u00e8idh gach l\u00e0imhe, agus ann am PokerTH \u00e8iridh na dall-gheallan aig amannan cunbhalach.</p><h2>Na ceithir cuairtean gheallan</h2><ul><li><strong>Pre-flop</strong> \u2014 an d\u00e8idh dhaibh na cairtean pr\u00ecobhaideach fhaighinn, cluichidh na cluicheadairean mun cuairt, a\u2019 t\u00f2iseachadh air taobh cl\u00ec an dall-ghill mh\u00f2ir.</li><li><strong>Flop</strong> \u2014 cuirear tr\u00ec cairtean coitcheann s\u00ecos fosgailte, agus an uair sin bidh cuairt gheallan ann.</li><li><strong>Turn</strong> \u2014 th\u00e8id ceathramh cairt choitcheann a roinn, agus cuairt gheallan eile \u00e0s a d\u00e8idh.</li><li><strong>River</strong> \u2014 th\u00e8id a\u2019 ch\u00f2igeamh cairt choitcheann, an t\u00e8 mu dheireadh, a roinn, agus an cuairt gheallan dheireannach \u00e0s a d\u00e8idh.</li></ul><h2>Na gluasadan</h2><ul><li><strong>Fold</strong> \u2014 an l\u00e0mh a leigeil seachad, agus na sliseagan a chaidh a chur a-steach mar-th\u00e0.</li><li><strong>Check</strong> \u2014 an cothrom a chur air adhart gun gheall (d\u00ecreach mura do chuir duine geall sa chuairt seo).</li><li><strong>Call</strong> \u2014 an geall as \u00e0irde a th\u2019 ann an-dr\u00e0sta a fhreagairt.</li><li><strong>Raise</strong> \u2014 an geall l\u00e0ithreach \u00e0rdachadh. Gun chr\u00ecoch, le suim sam bith suas ris na sliseagan agad uile.</li><li><strong>All-In</strong> \u2014 na sliseagan agad uile a chur a-steach. Ma chumas c\u00e0ch orra a\u2019 cur gheallan os cionn sin, th\u00e8id poitean-taobh a chruthachadh, agus mar sin chan urrainn dhut ach am p\u00e0irt dhen phoit a chuir thu fh\u00e8in ris a bhuannachadh.</li></ul><h2>An sealltainn</h2><p>Ma tha dithis chluicheadairean no barrachd air fh\u00e0gail \u00e0s d\u00e8idh na cuairte gheallan air an river, th\u00e8id na l\u00e0mhan a nochdadh. Buannaichidh an cur-ri-ch\u00e8ile as fhe\u00e0rr de ch\u00f2ig cairtean \u00e0s na seachd a tha ri l\u00e0imh (d\u00e0 chairt phr\u00ecobhaideach + c\u00f2ig cairtean coitcheann) a\u2019 phoit. Roinnidh l\u00e0mhan co-ionann a\u2019 phoit eatarra.</p><h2>Rangachadh nan l\u00e0mhan, bhon fhear as l\u00e0idire chun an fhir as laige</h2><ol><li><strong>Royal flush</strong> \u2014 A K Q J 10, uile dhen aon dath.</li><li><strong>Straight flush</strong> \u2014 c\u00f2ig cairtean an sreath dhen aon dath.</li><li><strong>Ceathrar co-ionann</strong> \u2014 ceithir cairtean dhen aon luach.</li><li><strong>Full house</strong> \u2014 tri\u00f9ir cho-ionann agus paidhir.</li><li><strong>Flush</strong> \u2014 c\u00f2ig cairtean dhen aon dath.</li><li><strong>Sreath</strong> \u2014 c\u00f2ig cairtean an sreath ann an dathan measgaichte.</li><li><strong>Tri\u00f9ir cho-ionann</strong> \u2014 tr\u00ec cairtean dhen aon luach.</li><li><strong>D\u00e0 phaidhir</strong> \u2014 d\u00e0 phaidhir eadar-dhealaichte.</li><li><strong>Aon phaidhir</strong> \u2014 d\u00e0 chairt dhen aon luach.</li><li><strong>Cairt \u00e0rd</strong> \u2014 chan eil gin dhiubh sin ann; is i a\u2019 chairt as \u00e0irde a n\u00ec an co-dh\u00f9nadh.</li></ol><h2>Farpaisean ann am PokerTH</h2><p>\u2019S e farpaisean ann an stoidhle sit-and-go a th\u2019 anns na geamannan ann am PokerTH: t\u00f2isichidh a h-uile duine leis an aon stac, \u00e8iridh na dall-gheallan thar \u00f9ine, agus buannaichidh an cluicheadair mu dheireadh aig a bheil sliseagan. \u2019S urrainn dhut cleachdadh far loidhne an aghaidh luchd-d\u00f9bhlain a\u2019 choimpiutair, cluich thairis air LAN no air frithealaiche pr\u00ecobhaideach, no a dhol c\u00f2mhla ris an l\u00econra oifigeil pokerth.net leis na rangachaidhean r\u00e0itheil aige.</p>" },
};
var SEO_FAQ_I18N = {
  fr: {
    title: "FAQ \u2014 Client web PokerTH",
    desc: "Questions fr\u00e9quentes sur le client web PokerTH : poker gratuit sans publicit\u00e9, jouer au Texas Hold\u2019em dans le navigateur sans rien installer, comptes, mobile, mode hors ligne, langues et vie priv\u00e9e.",
    h1: "Client web PokerTH \u2014 Questions fr\u00e9quentes",
    qa: [
      ["PokerTH est-il gratuit ?",
       "Oui. PokerTH est un logiciel libre et gratuit (GPL). Rien \u00e0 acheter, aucune publicit\u00e9 et aucun jeu d\u2019argent \u2014 tous les jetons sont fictifs."],
      ["Peut-on jouer au poker sans rien t\u00e9l\u00e9charger ?",
       "Oui. Le client web PokerTH fonctionne enti\u00e8rement dans le navigateur \u2014 aucun t\u00e9l\u00e9chargement, aucune installation. Ouvrez le site et vous \u00eates \u00e0 la table ; vous pouvez aussi l\u2019ajouter \u00e0 votre \u00e9cran d\u2019accueil comme une application (PWA)."],
      ["Est-ce vraiment gratuit, sans publicit\u00e9 ?",
       "Oui. PokerTH n\u2019affiche aucune publicit\u00e9, ne propose aucun achat int\u00e9gr\u00e9 et ne cache aucun co\u00fbt. C\u2019est un logiciel libre d\u00e9velopp\u00e9 par des b\u00e9n\u00e9voles, et tous les jetons sont fictifs."],
      ["Puis-je jouer au Texas Hold\u2019em contre d\u2019autres personnes dans mon navigateur ?",
       "Oui. Rejoignez le r\u00e9seau officiel pokerth.net pour affronter des joueurs du monde entier, ou envoyez un lien d\u2019invitation pour que vos amis arrivent directement \u00e0 votre table \u2014 le tout dans le navigateur."],
      ["Faut-il un compte pour jouer ?",
       "Aucun compte n\u2019est n\u00e9cessaire pour s\u2019entra\u00eener hors ligne contre l\u2019ordinateur. Pour jouer en ligne sur le r\u00e9seau officiel pokerth.net, il faut un compte pokerth.net, gratuit."],
      ["Est-ce que \u00e7a marche sur mobile ?",
       "Oui. Le client web est une Progressive Web App : il fonctionne dans tout navigateur moderne sur ordinateur, tablette ou t\u00e9l\u00e9phone, et peut s\u2019installer sur l\u2019\u00e9cran d\u2019accueil comme une application native."],
      ["Puis-je jouer contre l\u2019ordinateur ?",
       "Oui. Le mode hors ligne permet de disputer des tournois complets contre des adversaires g\u00e9r\u00e9s par l\u2019ordinateur, sans aucune connexion une fois l\u2019application charg\u00e9e."],
      ["Est-ce le client PokerTH officiel ?",
       "C\u2019est la version navigateur de PokerTH, d\u00e9velopp\u00e9e au sein du projet PokerTH par la PokerTH Development Team, aux c\u00f4t\u00e9s du client de bureau classique."],
      ["Quelle diff\u00e9rence avec le client de bureau ?",
       "M\u00eame jeu, m\u00eames r\u00e8gles, m\u00eame r\u00e9seau pokerth.net \u2014 mais il s\u2019ex\u00e9cute directement dans le navigateur, sans rien installer, sur n\u2019importe quel syst\u00e8me d\u2019exploitation."],
      ["Quelles langues sont disponibles ?",
       "L\u2019interface existe en 45 langues. Les termes d\u2019action du poker (Fold, Check, Call, Raise, All-In) restent en anglais, comme le veut l\u2019usage international."],
      ["Y a-t-il de l\u2019argent r\u00e9el en jeu ?",
       "Non. PokerTH se joue strictement en argent fictif. Les jetons n\u2019ont aucune valeur mon\u00e9taire et ne peuvent \u00eatre ni achet\u00e9s ni vendus."],
      ["Quelles donn\u00e9es le client web collecte-t-il ?",
       "Le moins possible : vos r\u00e9glages restent dans votre navigateur, et il n\u2019y a ni pistage ni publicit\u00e9. La page de confidentialit\u00e9 donne le d\u00e9tail."],
      ["Puis-je h\u00e9berger mon propre serveur ?",
       "Oui. Le serveur d\u00e9di\u00e9 PokerTH et ce client web sont tous deux libres : vous pouvez faire tourner votre propre serveur de poker priv\u00e9, sur un r\u00e9seau local ou sur Internet."],
    ]
  },
  es: {
    title: "Preguntas frecuentes \u2014 Cliente web de PokerTH",
    desc: "Preguntas frecuentes sobre el cliente web de PokerTH: p\u00f3quer gratis y sin anuncios, jugar al Texas Hold\u2019em en el navegador sin descargar nada, cuentas, m\u00f3vil, modo sin conexi\u00f3n, idiomas y privacidad.",
    h1: "Cliente web de PokerTH \u2014 Preguntas frecuentes",
    qa: [
      ["\u00bfPokerTH es gratis?",
       "S\u00ed. PokerTH es software libre y gratuito (GPL). No hay nada que comprar, ni anuncios, ni juego con dinero real: todas las fichas son de juego."],
      ["\u00bfPuedo jugar al p\u00f3quer sin descargar nada?",
       "S\u00ed. El cliente web de PokerTH funciona por completo en el navegador: sin descargas ni instalaci\u00f3n. Abres el sitio y ya est\u00e1s en la mesa; si quieres, puedes a\u00f1adirlo a la pantalla de inicio como una aplicaci\u00f3n (PWA)."],
      ["\u00bfDe verdad es gratis y sin anuncios?",
       "S\u00ed. PokerTH no muestra anuncios, no tiene compras integradas ni costes ocultos. Es software libre desarrollado por voluntarios, y todas las fichas son de juego."],
      ["\u00bfPuedo jugar al Texas Hold\u2019em contra otras personas desde el navegador?",
       "S\u00ed. \u00danete a la red oficial pokerth.net para jugar contra jugadores de todo el mundo, o env\u00eda un enlace de invitaci\u00f3n para que tus amigos lleguen directamente a tu mesa, todo dentro del navegador."],
      ["\u00bfHace falta una cuenta para jugar?",
       "No hace falta ninguna cuenta para practicar sin conexi\u00f3n contra el ordenador. Para jugar en l\u00ednea en la red oficial pokerth.net necesitas una cuenta gratuita de pokerth.net."],
      ["\u00bfFunciona en el m\u00f3vil?",
       "S\u00ed. El cliente web es una Progressive Web App: funciona en cualquier navegador moderno en ordenador, tableta o tel\u00e9fono, y puede instalarse en la pantalla de inicio como una aplicaci\u00f3n nativa."],
      ["\u00bfPuedo jugar contra el ordenador?",
       "S\u00ed. El modo sin conexi\u00f3n permite disputar torneos completos contra rivales controlados por el ordenador, sin ninguna conexi\u00f3n a internet una vez cargada la aplicaci\u00f3n."],
      ["\u00bfEs este el cliente oficial de PokerTH?",
       "Es la versi\u00f3n para navegador de PokerTH, desarrollada dentro del proyecto PokerTH por el PokerTH Development Team, junto al cl\u00e1sico cliente de escritorio."],
      ["\u00bfEn qu\u00e9 se diferencia del cliente de escritorio?",
       "Mismo juego, mismas reglas, misma red pokerth.net, pero se ejecuta directamente en el navegador, sin instalar nada y en cualquier sistema operativo."],
      ["\u00bfQu\u00e9 idiomas est\u00e1n disponibles?",
       "La interfaz est\u00e1 disponible en 45 idiomas. Los t\u00e9rminos de acci\u00f3n del p\u00f3quer (Fold, Check, Call, Raise, All-In) se mantienen en ingl\u00e9s, como es convenci\u00f3n internacional."],
      ["\u00bfHay dinero real de por medio?",
       "No. PokerTH es estrictamente un juego con dinero ficticio. Las fichas no tienen valor monetario y no se pueden comprar ni vender."],
      ["\u00bfQu\u00e9 datos recopila el cliente web?",
       "Los m\u00ednimos posibles: tus ajustes se quedan en tu navegador y no se usa ning\u00fan sistema de seguimiento ni publicidad. La p\u00e1gina de privacidad lo detalla."],
      ["\u00bfPuedo alojar mi propio servidor?",
       "S\u00ed. Tanto el servidor dedicado de PokerTH como este cliente web son de c\u00f3digo abierto, as\u00ed que puedes montar tu propio servidor privado de p\u00f3quer, en una red local o en internet."],
    ]
  },
  de: {
    title: "FAQ \u2014 PokerTH Web-Client",
    desc: "H\u00e4ufige Fragen zum PokerTH Web-Client: kostenloses Poker ohne Werbung, Texas Hold\u2019em im Browser spielen ohne Download, Konten, Mobilger\u00e4te, Offline-Modus, Sprachen und Datenschutz.",
    h1: "PokerTH Web-Client \u2014 H\u00e4ufige Fragen",
    qa: [
      ["Ist PokerTH kostenlos?",
       "Ja. PokerTH ist freie und quelloffene Software (GPL). Es gibt nichts zu kaufen, keine Werbung und kein Gl\u00fccksspiel um echtes Geld \u2014 alle Chips sind Spielgeld."],
      ["Kann ich Poker spielen, ohne etwas herunterzuladen?",
       "Ja. Der PokerTH Web-Client l\u00e4uft vollst\u00e4ndig im Browser \u2014 kein Download, keine Installation. Seite \u00f6ffnen und du sitzt am Tisch; auf Wunsch l\u00e4sst er sich als App (PWA) zum Startbildschirm hinzuf\u00fcgen."],
      ["Ist es wirklich kostenlos und werbefrei?",
       "Ja. PokerTH zeigt keine Werbung, hat keine In-App-K\u00e4ufe und keine versteckten Kosten. Es ist quelloffene Software, entwickelt von Freiwilligen, und alle Chips sind Spielgeld."],
      ["Kann ich im Browser Texas Hold\u2019em gegen andere Menschen spielen?",
       "Ja. Tritt dem offiziellen Netzwerk pokerth.net bei, um gegen Spieler aus aller Welt anzutreten, oder verschicke einen Einladungslink, mit dem Freunde direkt an deinem Tisch landen \u2014 alles im Browser."],
      ["Brauche ich ein Konto zum Spielen?",
       "F\u00fcr das Offline-Training gegen Computergegner wird kein Konto ben\u00f6tigt. F\u00fcr das Onlinespiel im offiziellen Netzwerk pokerth.net brauchst du ein kostenloses pokerth.net-Konto."],
      ["L\u00e4uft es auf dem Handy?",
       "Ja. Der Web-Client ist eine Progressive Web App: Er l\u00e4uft in jedem modernen Browser auf Computer, Tablet oder Telefon und l\u00e4sst sich wie eine native App auf dem Startbildschirm installieren."],
      ["Kann ich gegen den Computer spielen?",
       "Ja. Im Offline-Modus spielst du komplette Turniere gegen Computergegner, ganz ohne Internetverbindung, sobald die App geladen ist."],
      ["Ist das der offizielle PokerTH-Client?",
       "Es ist die Browser-Version von PokerTH, entwickelt innerhalb des PokerTH-Projekts vom PokerTH Development Team, neben dem klassischen Desktop-Client."],
      ["Was ist der Unterschied zum Desktop-Client?",
       "Gleiches Spiel, gleiche Regeln, gleiches pokerth.net-Netzwerk \u2014 nur l\u00e4uft es direkt im Browser, ohne Installation, auf jedem Betriebssystem."],
      ["Welche Sprachen werden unterst\u00fctzt?",
       "Die Oberfl\u00e4che gibt es in 45 Sprachen. Die Poker-Aktionsbegriffe (Fold, Check, Call, Raise, All-In) bleiben englisch, wie international \u00fcblich."],
      ["Geht es um echtes Geld?",
       "Nein. PokerTH ist ausschlie\u00dflich ein Spielgeld-Spiel. Chips haben keinen Geldwert und k\u00f6nnen weder gekauft noch verkauft werden."],
      ["Welche Daten erhebt der Web-Client?",
       "So wenige wie m\u00f6glich: Einstellungen bleiben in deinem Browser, und es gibt weder Tracking noch Werbung. Einzelheiten stehen auf der Datenschutzseite."],
      ["Kann ich einen eigenen Server betreiben?",
       "Ja. Der dedizierte PokerTH-Server und dieser Web-Client sind beide quelloffen \u2014 du kannst also deinen eigenen privaten Pokerserver im LAN oder im Internet betreiben."],
    ]
  },
  it: {
    title: "FAQ \u2014 Client web PokerTH",
    desc: "Domande frequenti sul client web di PokerTH: poker gratuito e senza pubblicit\u00e0, giocare a Texas Hold\u2019em nel browser senza scaricare nulla, account, mobile, modalit\u00e0 offline, lingue e privacy.",
    h1: "Client web PokerTH \u2014 Domande frequenti",
    qa: [
      ["PokerTH \u00e8 gratuito?",
       "S\u00ec. PokerTH \u00e8 software libero e gratuito (GPL). Non c\u2019\u00e8 nulla da comprare, nessuna pubblicit\u00e0 e nessun gioco con denaro reale: tutte le fiche sono virtuali."],
      ["Posso giocare a poker senza scaricare nulla?",
       "S\u00ec. Il client web di PokerTH funziona interamente nel browser: nessun download, nessuna installazione. Apri il sito e sei al tavolo; volendo puoi aggiungerlo alla schermata iniziale come app (PWA)."],
      ["\u00c8 davvero gratuito e senza pubblicit\u00e0?",
       "S\u00ec. PokerTH non mostra pubblicit\u00e0, non ha acquisti in-app n\u00e9 costi nascosti. \u00c8 software libero sviluppato da volontari, e tutte le fiche sono virtuali."],
      ["Posso giocare a Texas Hold\u2019em contro altre persone dal browser?",
       "S\u00ec. Entra nella rete ufficiale pokerth.net per sfidare giocatori di tutto il mondo, oppure invia un link d\u2019invito perch\u00e9 gli amici arrivino direttamente al tuo tavolo: tutto dentro il browser."],
      ["Serve un account per giocare?",
       "Per allenarsi offline contro il computer non serve alcun account. Per giocare online sulla rete ufficiale pokerth.net serve un account pokerth.net, gratuito."],
      ["Funziona su smartphone?",
       "S\u00ec. Il client web \u00e8 una Progressive Web App: funziona in qualsiasi browser moderno su computer, tablet o telefono e pu\u00f2 essere installato nella schermata iniziale come un\u2019app nativa."],
      ["Posso giocare contro il computer?",
       "S\u00ec. La modalit\u00e0 offline permette di disputare tornei completi contro avversari gestiti dal computer, senza alcuna connessione una volta caricata l\u2019applicazione."],
      ["Questo \u00e8 il client ufficiale di PokerTH?",
       "\u00c8 la versione per browser di PokerTH, sviluppata all\u2019interno del progetto PokerTH dal PokerTH Development Team, accanto al classico client desktop."],
      ["Che differenza c\u2019\u00e8 con il client desktop?",
       "Stesso gioco, stesse regole, stessa rete pokerth.net \u2014 ma gira direttamente nel browser, senza installare nulla, su qualsiasi sistema operativo."],
      ["Quali lingue sono supportate?",
       "L\u2019interfaccia \u00e8 disponibile in 45 lingue. I termini d\u2019azione del poker (Fold, Check, Call, Raise, All-In) restano in inglese, come vuole la convenzione internazionale."],
      ["C\u2019\u00e8 di mezzo denaro reale?",
       "No. PokerTH \u00e8 rigorosamente un gioco con denaro virtuale. Le fiche non hanno alcun valore monetario e non possono essere comprate n\u00e9 vendute."],
      ["Quali dati raccoglie il client web?",
       "Il minimo possibile: le impostazioni restano nel tuo browser e non viene usato alcun tracciamento n\u00e9 pubblicit\u00e0. La pagina sulla privacy spiega i dettagli."],
      ["Posso ospitare un mio server?",
       "S\u00ec. Il server dedicato PokerTH e questo client web sono entrambi open source: puoi far girare il tuo server di poker privato, su una rete locale o su internet."],
    ]
  },
  'pt-BR': {
    title: "Perguntas frequentes \u2014 Cliente web do PokerTH",
    desc: "Perguntas frequentes sobre o cliente web do PokerTH: p\u00f4quer gr\u00e1tis e sem an\u00fancios, jogar Texas Hold\u2019em no navegador sem baixar nada, contas, celular, modo offline, idiomas e privacidade.",
    h1: "Cliente web do PokerTH \u2014 Perguntas frequentes",
    qa: [
      ["O PokerTH \u00e9 gratuito?",
       "Sim. O PokerTH \u00e9 software livre e gratuito (GPL). N\u00e3o h\u00e1 nada para comprar, nem an\u00fancios, nem aposta com dinheiro real \u2014 todas as fichas s\u00e3o de brincadeira."],
      ["D\u00e1 para jogar p\u00f4quer sem baixar nada?",
       "Sim. O cliente web do PokerTH roda inteiramente no navegador \u2014 sem download, sem instala\u00e7\u00e3o. Abra o site e voc\u00ea j\u00e1 est\u00e1 na mesa; se quiser, d\u00e1 para adicion\u00e1-lo \u00e0 tela inicial como um aplicativo (PWA)."],
      ["\u00c9 realmente gr\u00e1tis, sem an\u00fancios?",
       "Sim. O PokerTH n\u00e3o exibe an\u00fancios, n\u00e3o tem compras no aplicativo nem custos escondidos. \u00c9 software livre feito por volunt\u00e1rios, e todas as fichas s\u00e3o de brincadeira."],
      ["Posso jogar Texas Hold\u2019em contra outras pessoas pelo navegador?",
       "Sim. Entre na rede oficial pokerth.net para enfrentar jogadores do mundo todo, ou envie um link de convite para que seus amigos caiam direto na sua mesa \u2014 tudo dentro do navegador."],
      ["Preciso de uma conta para jogar?",
       "Nenhuma conta \u00e9 necess\u00e1ria para treinar offline contra o computador. Para jogar online na rede oficial pokerth.net, \u00e9 preciso uma conta pokerth.net, gratuita."],
      ["Funciona no celular?",
       "Sim. O cliente web \u00e9 um Progressive Web App: funciona em qualquer navegador moderno no computador, tablet ou celular, e pode ser instalado na tela inicial como um aplicativo nativo."],
      ["Posso jogar contra o computador?",
       "Sim. O modo offline permite disputar torneios completos contra advers\u00e1rios controlados pelo computador, sem nenhuma conex\u00e3o com a internet depois que o aplicativo carrega."],
      ["Este \u00e9 o cliente oficial do PokerTH?",
       "\u00c9 a vers\u00e3o para navegador do PokerTH, desenvolvida dentro do projeto PokerTH pelo PokerTH Development Team, ao lado do cl\u00e1ssico cliente para computador."],
      ["Qual a diferen\u00e7a para o cliente de desktop?",
       "Mesmo jogo, mesmas regras, mesma rede pokerth.net \u2014 mas roda direto no navegador, sem instalar nada, em qualquer sistema operacional."],
      ["Quais idiomas s\u00e3o suportados?",
       "A interface est\u00e1 dispon\u00edvel em 45 idiomas. Os termos de a\u00e7\u00e3o do p\u00f4quer (Fold, Check, Call, Raise, All-In) permanecem em ingl\u00eas, como manda a conven\u00e7\u00e3o internacional."],
      ["Envolve dinheiro real?",
       "N\u00e3o. O PokerTH \u00e9 estritamente um jogo com fichas de brincadeira. As fichas n\u00e3o t\u00eam valor em dinheiro e n\u00e3o podem ser compradas nem vendidas."],
      ["Quais dados o cliente web coleta?",
       "O m\u00ednimo poss\u00edvel: suas configura\u00e7\u00f5es ficam no seu navegador, e n\u00e3o h\u00e1 rastreamento nem publicidade. A p\u00e1gina de privacidade traz os detalhes."],
      ["Posso hospedar meu pr\u00f3prio servidor?",
       "Sim. O servidor dedicado do PokerTH e este cliente web s\u00e3o ambos de c\u00f3digo aberto, ent\u00e3o voc\u00ea pode rodar seu pr\u00f3prio servidor de p\u00f4quer privado, numa rede local ou na internet."],
    ]
  },
  'pt-PT': {
    title: "Perguntas frequentes \u2014 Cliente web do PokerTH",
    desc: "Perguntas frequentes sobre o cliente web do PokerTH: p\u00f3quer gratuito e sem publicidade, jogar Texas Hold\u2019em no navegador sem transferir nada, contas, telem\u00f3vel, modo offline, idiomas e privacidade.",
    h1: "Cliente web do PokerTH \u2014 Perguntas frequentes",
    qa: [
      ["O PokerTH \u00e9 gratuito?",
       "Sim. O PokerTH \u00e9 software livre e gratuito (GPL). N\u00e3o h\u00e1 nada para comprar, nem publicidade, nem jogo a dinheiro real \u2014 todas as fichas s\u00e3o fict\u00edcias."],
      ["Posso jogar p\u00f3quer sem transferir nada?",
       "Sim. O cliente web do PokerTH funciona inteiramente no navegador \u2014 sem transfer\u00eancias, sem instala\u00e7\u00e3o. Abra o site e est\u00e1 na mesa; se quiser, pode adicion\u00e1-lo ao ecr\u00e3 principal como uma aplica\u00e7\u00e3o (PWA)."],
      ["\u00c9 mesmo gratuito, sem publicidade?",
       "Sim. O PokerTH n\u00e3o mostra publicidade, n\u00e3o tem compras na aplica\u00e7\u00e3o nem custos escondidos. \u00c9 software livre desenvolvido por volunt\u00e1rios, e todas as fichas s\u00e3o fict\u00edcias."],
      ["Posso jogar Texas Hold\u2019em contra outras pessoas no navegador?",
       "Sim. Junte-se \u00e0 rede oficial pokerth.net para defrontar jogadores de todo o mundo, ou envie uma liga\u00e7\u00e3o de convite para que os seus amigos cheguem diretamente \u00e0 sua mesa \u2014 tudo dentro do navegador."],
      ["\u00c9 preciso ter conta para jogar?",
       "N\u00e3o \u00e9 precisa qualquer conta para treinar offline contra o computador. Para jogar online na rede oficial pokerth.net \u00e9 necess\u00e1ria uma conta pokerth.net, gratuita."],
      ["Funciona no telem\u00f3vel?",
       "Sim. O cliente web \u00e9 uma Progressive Web App: funciona em qualquer navegador moderno em computador, tablet ou telem\u00f3vel, e pode ser instalado no ecr\u00e3 principal como uma aplica\u00e7\u00e3o nativa."],
      ["Posso jogar contra o computador?",
       "Sim. O modo offline permite disputar torneios completos contra advers\u00e1rios controlados pelo computador, sem qualquer liga\u00e7\u00e3o \u00e0 Internet depois de a aplica\u00e7\u00e3o carregar."],
      ["Este \u00e9 o cliente oficial do PokerTH?",
       "\u00c9 a vers\u00e3o para navegador do PokerTH, desenvolvida dentro do projeto PokerTH pela PokerTH Development Team, a par do cl\u00e1ssico cliente para computador."],
      ["Qual a diferen\u00e7a para o cliente de computador?",
       "Mesmo jogo, mesmas regras, mesma rede pokerth.net \u2014 mas corre diretamente no navegador, sem instalar nada, em qualquer sistema operativo."],
      ["Que idiomas s\u00e3o suportados?",
       "A interface est\u00e1 dispon\u00edvel em 45 idiomas. Os termos de a\u00e7\u00e3o do p\u00f3quer (Fold, Check, Call, Raise, All-In) mant\u00eam-se em ingl\u00eas, como \u00e9 conven\u00e7\u00e3o internacional."],
      ["H\u00e1 dinheiro real envolvido?",
       "N\u00e3o. O PokerTH \u00e9 estritamente um jogo com fichas fict\u00edcias. As fichas n\u00e3o t\u00eam valor monet\u00e1rio e n\u00e3o podem ser compradas nem vendidas."],
      ["Que dados recolhe o cliente web?",
       "O m\u00ednimo poss\u00edvel: as suas defini\u00e7\u00f5es ficam no seu navegador e n\u00e3o h\u00e1 qualquer rastreio ou publicidade. A p\u00e1gina de privacidade explica os detalhes."],
      ["Posso alojar o meu pr\u00f3prio servidor?",
       "Sim. O servidor dedicado do PokerTH e este cliente web s\u00e3o ambos de c\u00f3digo aberto, pelo que pode manter o seu pr\u00f3prio servidor de p\u00f3quer privado, numa rede local ou na Internet."],
    ]
  },
  nl: {
    title: "Veelgestelde vragen \u2014 PokerTH webclient",
    desc: "Veelgestelde vragen over de PokerTH webclient: gratis poker zonder reclame, Texas Hold\u2019em spelen in je browser zonder iets te downloaden, accounts, mobiel, offlinemodus, talen en privacy.",
    h1: "PokerTH webclient \u2014 Veelgestelde vragen",
    qa: [
      ["Is PokerTH gratis?",
       "Ja. PokerTH is vrije en gratis software (GPL). Er valt niets te kopen, er is geen reclame en er wordt niet om echt geld gespeeld \u2014 alle fiches zijn speelgeld."],
      ["Kan ik poker spelen zonder iets te downloaden?",
       "Ja. De PokerTH webclient draait volledig in je browser \u2014 geen download, geen installatie. Open de site en je zit aan tafel; desgewenst voeg je hem als app (PWA) toe aan je beginscherm."],
      ["Is het echt gratis, zonder reclame?",
       "Ja. PokerTH toont geen reclame, kent geen in-app-aankopen en geen verborgen kosten. Het is opensourcesoftware gemaakt door vrijwilligers, en alle fiches zijn speelgeld."],
      ["Kan ik in mijn browser Texas Hold\u2019em tegen andere mensen spelen?",
       "Ja. Sluit je aan bij het offici\u00eble netwerk pokerth.net om het tegen spelers wereldwijd op te nemen, of stuur een uitnodigingslink zodat vrienden meteen aan jouw tafel belanden \u2014 allemaal in de browser."],
      ["Heb ik een account nodig om te spelen?",
       "Voor offline oefenen tegen de computer is geen account nodig. Om online te spelen op het offici\u00eble netwerk pokerth.net heb je een gratis pokerth.net-account nodig."],
      ["Werkt het op mobiel?",
       "Ja. De webclient is een Progressive Web App: hij werkt in elke moderne browser op computer, tablet of telefoon en is als een native app op het beginscherm te installeren."],
      ["Kan ik tegen de computer spelen?",
       "Ja. In de offlinemodus speel je volledige toernooien tegen computertegenstanders, zonder internetverbinding zodra de app geladen is."],
      ["Is dit de offici\u00eble PokerTH-client?",
       "Het is de browserversie van PokerTH, binnen het PokerTH-project ontwikkeld door het PokerTH Development Team, naast de klassieke desktopclient."],
      ["Wat is het verschil met de desktopclient?",
       "Hetzelfde spel, dezelfde regels, hetzelfde pokerth.net-netwerk \u2014 maar het draait rechtstreeks in de browser, zonder installatie, op elk besturingssysteem."],
      ["Welke talen worden ondersteund?",
       "De interface is beschikbaar in 45 talen. De pokertermen voor acties (Fold, Check, Call, Raise, All-In) blijven Engels, zoals internationaal gebruikelijk is."],
      ["Gaat het om echt geld?",
       "Nee. PokerTH is strikt een spel om speelgeld. Fiches hebben geen geldwaarde en kunnen niet gekocht of verkocht worden."],
      ["Welke gegevens verzamelt de webclient?",
       "Zo weinig mogelijk: je instellingen blijven in je browser, en er wordt niet gevolgd of geadverteerd. De privacypagina legt het in detail uit."],
      ["Kan ik zelf een server draaien?",
       "Ja. Zowel de speciale PokerTH-server als deze webclient zijn opensource, dus je kunt je eigen priv\u00e9-pokerserver draaien, op een lokaal netwerk of op internet."],
    ]
  },
  pl: {
    title: "FAQ \u2014 Klient webowy PokerTH",
    desc: "Najcz\u0119\u015bciej zadawane pytania o klienta webowego PokerTH: darmowy poker bez reklam, gra w Texas Hold\u2019em w przegl\u0105darce bez pobierania, konta, telefon, tryb offline, j\u0119zyki i prywatno\u015b\u0107.",
    h1: "Klient webowy PokerTH \u2014 Najcz\u0119stsze pytania",
    qa: [
      ["Czy PokerTH jest darmowy?",
       "Tak. PokerTH to wolne i darmowe oprogramowanie (GPL). Nie ma czego kupowa\u0107, nie ma reklam ani gry o prawdziwe pieni\u0105dze \u2014 wszystkie \u017cetony s\u0105 wirtualne."],
      ["Czy mog\u0119 gra\u0107 w pokera bez pobierania czegokolwiek?",
       "Tak. Klient webowy PokerTH dzia\u0142a w ca\u0142o\u015bci w przegl\u0105darce \u2014 bez pobierania i bez instalacji. Otwierasz stron\u0119 i siedzisz przy stole; mo\u017cesz te\u017c doda\u0107 go do ekranu g\u0142\u00f3wnego jako aplikacj\u0119 (PWA)."],
      ["Czy to naprawd\u0119 darmowe i bez reklam?",
       "Tak. PokerTH nie wy\u015bwietla reklam, nie ma zakup\u00f3w w aplikacji ani ukrytych koszt\u00f3w. To otwarte oprogramowanie tworzone przez wolontariuszy, a wszystkie \u017cetony s\u0105 wirtualne."],
      ["Czy mog\u0119 gra\u0107 w Texas Hold\u2019em z innymi lud\u017ami w przegl\u0105darce?",
       "Tak. Do\u0142\u0105cz do oficjalnej sieci pokerth.net, aby gra\u0107 z graczami z ca\u0142ego \u015bwiata, albo wy\u015blij link z zaproszeniem, dzi\u0119ki kt\u00f3remu znajomi trafi\u0105 prosto do twojego sto\u0142u \u2014 wszystko w przegl\u0105darce."],
      ["Czy potrzebuj\u0119 konta, \u017ceby gra\u0107?",
       "Do treningu offline z komputerowymi przeciwnikami konto nie jest potrzebne. Do gry online w oficjalnej sieci pokerth.net potrzebne jest bezp\u0142atne konto pokerth.net."],
      ["Czy dzia\u0142a na telefonie?",
       "Tak. Klient webowy to Progressive Web App: dzia\u0142a w ka\u017cdej nowoczesnej przegl\u0105darce na komputerze, tablecie i telefonie, a na ekranie g\u0142\u00f3wnym mo\u017cna go zainstalowa\u0107 jak aplikacj\u0119 natywn\u0105."],
      ["Czy mog\u0119 gra\u0107 przeciwko komputerowi?",
       "Tak. Tryb offline pozwala rozgrywa\u0107 pe\u0142ne turnieje z komputerowymi przeciwnikami, bez \u017cadnego po\u0142\u0105czenia z internetem po za\u0142adowaniu aplikacji."],
      ["Czy to oficjalny klient PokerTH?",
       "To przegl\u0105darkowa wersja PokerTH, rozwijana w ramach projektu PokerTH przez PokerTH Development Team, obok klasycznego klienta desktopowego."],
      ["Czym r\u00f3\u017cni si\u0119 od klienta desktopowego?",
       "Ta sama gra, te same zasady, ta sama sie\u0107 pokerth.net \u2014 tyle \u017ce dzia\u0142a bezpo\u015brednio w przegl\u0105darce, bez instalacji, w ka\u017cdym systemie operacyjnym."],
      ["Jakie j\u0119zyki s\u0105 obs\u0142ugiwane?",
       "Interfejs jest dost\u0119pny w 45 j\u0119zykach. Pokerowe nazwy akcji (Fold, Check, Call, Raise, All-In) pozostaj\u0105 po angielsku, zgodnie z mi\u0119dzynarodow\u0105 konwencj\u0105."],
      ["Czy w gr\u0119 wchodz\u0105 prawdziwe pieni\u0105dze?",
       "Nie. PokerTH to wy\u0142\u0105cznie gra na wirtualne \u017cetony. \u017betony nie maj\u0105 warto\u015bci pieni\u0119\u017cnej i nie mo\u017cna ich kupi\u0107 ani sprzeda\u0107."],
      ["Jakie dane zbiera klient webowy?",
       "Jak najmniej: ustawienia pozostaj\u0105 w twojej przegl\u0105darce, nie ma \u015bledzenia ani reklam. Szczeg\u00f3\u0142y znajdziesz na stronie prywatno\u015bci."],
      ["Czy mog\u0119 postawi\u0107 w\u0142asny serwer?",
       "Tak. Dedykowany serwer PokerTH i ten klient webowy s\u0105 otwartym oprogramowaniem, wi\u0119c mo\u017cesz prowadzi\u0107 w\u0142asny prywatny serwer pokerowy \u2014 w sieci lokalnej albo w internecie."],
    ]
  },
  ru: {
    title: "\u0427\u0430\u0441\u0442\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u2014 \u0432\u0435\u0431-\u043a\u043b\u0438\u0435\u043d\u0442 PokerTH",
    desc: "\u0427\u0430\u0441\u0442\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b \u043e \u0432\u0435\u0431-\u043a\u043b\u0438\u0435\u043d\u0442\u0435 PokerTH: \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u043f\u043e\u043a\u0435\u0440 \u0431\u0435\u0437 \u0440\u0435\u043a\u043b\u0430\u043c\u044b, \u0438\u0433\u0440\u0430 \u0432 Texas Hold\u2019em \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435 \u0431\u0435\u0437 \u0441\u043a\u0430\u0447\u0438\u0432\u0430\u043d\u0438\u044f, \u0443\u0447\u0451\u0442\u043d\u044b\u0435 \u0437\u0430\u043f\u0438\u0441\u0438, \u0442\u0435\u043b\u0435\u0444\u043e\u043d, \u043e\u0444\u043b\u0430\u0439\u043d-\u0440\u0435\u0436\u0438\u043c, \u044f\u0437\u044b\u043a\u0438 \u0438 \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u043e\u0441\u0442\u044c.",
    h1: "\u0412\u0435\u0431-\u043a\u043b\u0438\u0435\u043d\u0442 PokerTH \u2014 \u0447\u0430\u0441\u0442\u044b\u0435 \u0432\u043e\u043f\u0440\u043e\u0441\u044b",
    qa: [
      ["PokerTH \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u0435\u043d?",
       "\u0414\u0430. PokerTH \u2014 \u0441\u0432\u043e\u0431\u043e\u0434\u043d\u043e\u0435 \u0438 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e\u0435 \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u043d\u043e\u0435 \u043e\u0431\u0435\u0441\u043f\u0435\u0447\u0435\u043d\u0438\u0435 (GPL). \u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0443\u0436\u043d\u043e \u043f\u043e\u043a\u0443\u043f\u0430\u0442\u044c, \u043d\u0435\u0442 \u0440\u0435\u043a\u043b\u0430\u043c\u044b \u0438 \u043d\u0435\u0442 \u0438\u0433\u0440\u044b \u043d\u0430 \u0440\u0435\u0430\u043b\u044c\u043d\u044b\u0435 \u0434\u0435\u043d\u044c\u0433\u0438 \u2014 \u0432\u0441\u0435 \u0444\u0438\u0448\u043a\u0438 \u0438\u0433\u0440\u043e\u0432\u044b\u0435."],
      ["\u041c\u043e\u0436\u043d\u043e \u043b\u0438 \u0438\u0433\u0440\u0430\u0442\u044c \u0432 \u043f\u043e\u043a\u0435\u0440, \u043d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u0441\u043a\u0430\u0447\u0438\u0432\u0430\u044f?",
       "\u0414\u0430. \u0412\u0435\u0431-\u043a\u043b\u0438\u0435\u043d\u0442 PokerTH \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u0446\u0435\u043b\u0438\u043a\u043e\u043c \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435 \u2014 \u0431\u0435\u0437 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0438 \u0431\u0435\u0437 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0438. \u041e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0435 \u0441\u0430\u0439\u0442 \u2014 \u0438 \u0432\u044b \u0437\u0430 \u0441\u0442\u043e\u043b\u043e\u043c; \u043f\u0440\u0438 \u0436\u0435\u043b\u0430\u043d\u0438\u0438 \u0435\u0433\u043e \u043c\u043e\u0436\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u044b\u0439 \u044d\u043a\u0440\u0430\u043d \u043a\u0430\u043a \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 (PWA)."],
      ["\u042d\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u043e \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e \u0438 \u0431\u0435\u0437 \u0440\u0435\u043a\u043b\u0430\u043c\u044b?",
       "\u0414\u0430. PokerTH \u043d\u0435 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u0440\u0435\u043a\u043b\u0430\u043c\u0443, \u0432 \u043d\u0451\u043c \u043d\u0435\u0442 \u0432\u0441\u0442\u0440\u043e\u0435\u043d\u043d\u044b\u0445 \u043f\u043e\u043a\u0443\u043f\u043e\u043a \u0438 \u0441\u043a\u0440\u044b\u0442\u044b\u0445 \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432. \u042d\u0442\u043e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0430 \u0441 \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u043c \u043a\u043e\u0434\u043e\u043c, \u043a\u043e\u0442\u043e\u0440\u0443\u044e \u043f\u0438\u0448\u0443\u0442 \u0434\u043e\u0431\u0440\u043e\u0432\u043e\u043b\u044c\u0446\u044b, \u0430 \u0432\u0441\u0435 \u0444\u0438\u0448\u043a\u0438 \u0438\u0433\u0440\u043e\u0432\u044b\u0435."],
      ["\u041c\u043e\u0436\u043d\u043e \u043b\u0438 \u0438\u0433\u0440\u0430\u0442\u044c \u0432 Texas Hold\u2019em \u0441 \u0434\u0440\u0443\u0433\u0438\u043c\u0438 \u043b\u044e\u0434\u044c\u043c\u0438 \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435?",
       "\u0414\u0430. \u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0430\u0439\u0442\u0435\u0441\u044c \u043a \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0439 \u0441\u0435\u0442\u0438 pokerth.net, \u0447\u0442\u043e\u0431\u044b \u0438\u0433\u0440\u0430\u0442\u044c \u0441 \u043b\u044e\u0434\u044c\u043c\u0438 \u0441\u043e \u0432\u0441\u0435\u0433\u043e \u043c\u0438\u0440\u0430, \u0438\u043b\u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u044c\u0442\u0435 \u0441\u0441\u044b\u043b\u043a\u0443-\u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435, \u0447\u0442\u043e\u0431\u044b \u0434\u0440\u0443\u0437\u044c\u044f \u0441\u0440\u0430\u0437\u0443 \u043f\u043e\u043f\u0430\u043b\u0438 \u0437\u0430 \u0432\u0430\u0448 \u0441\u0442\u043e\u043b \u2014 \u0432\u0441\u0451 \u0432\u043d\u0443\u0442\u0440\u0438 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430."],
      ["\u041d\u0443\u0436\u043d\u0430 \u043b\u0438 \u0443\u0447\u0451\u0442\u043d\u0430\u044f \u0437\u0430\u043f\u0438\u0441\u044c?",
       "\u0414\u043b\u044f \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0438 \u043e\u0444\u043b\u0430\u0439\u043d \u043f\u0440\u043e\u0442\u0438\u0432 \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u0430 \u0443\u0447\u0451\u0442\u043d\u0430\u044f \u0437\u0430\u043f\u0438\u0441\u044c \u043d\u0435 \u043d\u0443\u0436\u043d\u0430. \u0414\u043b\u044f \u0438\u0433\u0440\u044b \u043e\u043d\u043b\u0430\u0439\u043d \u0432 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0439 \u0441\u0435\u0442\u0438 pokerth.net \u043d\u0443\u0436\u0435\u043d \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u0430\u043a\u043a\u0430\u0443\u043d\u0442 pokerth.net."],
      ["\u0420\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u043b\u0438 \u043d\u0430 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0435?",
       "\u0414\u0430. \u0412\u0435\u0431-\u043a\u043b\u0438\u0435\u043d\u0442 \u2014 \u044d\u0442\u043e Progressive Web App: \u043e\u043d \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u0432 \u043b\u044e\u0431\u043e\u043c \u0441\u043e\u0432\u0440\u0435\u043c\u0435\u043d\u043d\u043e\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435 \u043d\u0430 \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u0435, \u043f\u043b\u0430\u043d\u0448\u0435\u0442\u0435 \u0438\u043b\u0438 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0435 \u0438 \u0443\u0441\u0442\u0430\u043d\u0430\u0432\u043b\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u044b\u0439 \u044d\u043a\u0440\u0430\u043d \u043a\u0430\u043a \u043e\u0431\u044b\u0447\u043d\u043e\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435."],
      ["\u041c\u043e\u0436\u043d\u043e \u043b\u0438 \u0438\u0433\u0440\u0430\u0442\u044c \u043f\u0440\u043e\u0442\u0438\u0432 \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u0430?",
       "\u0414\u0430. \u0412 \u043e\u0444\u043b\u0430\u0439\u043d-\u0440\u0435\u0436\u0438\u043c\u0435 \u043c\u043e\u0436\u043d\u043e \u0438\u0433\u0440\u0430\u0442\u044c \u043f\u043e\u043b\u043d\u043e\u0446\u0435\u043d\u043d\u044b\u0435 \u0442\u0443\u0440\u043d\u0438\u0440\u044b \u043f\u0440\u043e\u0442\u0438\u0432 \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u043d\u044b\u0445 \u0441\u043e\u043f\u0435\u0440\u043d\u0438\u043a\u043e\u0432 \u2014 \u0431\u0435\u0437 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442\u0430, \u043f\u043e\u0441\u043b\u0435 \u0442\u043e\u0433\u043e \u043a\u0430\u043a \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u043b\u043e\u0441\u044c."],
      ["\u042d\u0442\u043e \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0439 \u043a\u043b\u0438\u0435\u043d\u0442 PokerTH?",
       "\u042d\u0442\u043e \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043d\u0430\u044f \u0432\u0435\u0440\u0441\u0438\u044f PokerTH, \u0440\u0430\u0437\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u0435\u043c\u0430\u044f \u0432\u043d\u0443\u0442\u0440\u0438 \u043f\u0440\u043e\u0435\u043a\u0442\u0430 PokerTH \u043a\u043e\u043c\u0430\u043d\u0434\u043e\u0439 PokerTH Development Team \u043d\u0430\u0440\u044f\u0434\u0443 \u0441 \u043a\u043b\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043a\u0438\u043c \u043d\u0430\u0441\u0442\u043e\u043b\u044c\u043d\u044b\u043c \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u043c."],
      ["\u0427\u0435\u043c \u043e\u043d \u043e\u0442\u043b\u0438\u0447\u0430\u0435\u0442\u0441\u044f \u043e\u0442 \u043d\u0430\u0441\u0442\u043e\u043b\u044c\u043d\u043e\u0433\u043e \u043a\u043b\u0438\u0435\u043d\u0442\u0430?",
       "\u0422\u0430 \u0436\u0435 \u0438\u0433\u0440\u0430, \u0442\u0435 \u0436\u0435 \u043f\u0440\u0430\u0432\u0438\u043b\u0430, \u0442\u0430 \u0436\u0435 \u0441\u0435\u0442\u044c pokerth.net \u2014 \u043d\u043e \u0432\u0441\u0451 \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u043f\u0440\u044f\u043c\u043e \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435, \u0431\u0435\u0437 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0438, \u0432 \u043b\u044e\u0431\u043e\u0439 \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u043e\u043d\u043d\u043e\u0439 \u0441\u0438\u0441\u0442\u0435\u043c\u0435."],
      ["\u041a\u0430\u043a\u0438\u0435 \u044f\u0437\u044b\u043a\u0438 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044e\u0442\u0441\u044f?",
       "\u0418\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u043d\u0430 45 \u044f\u0437\u044b\u043a\u0430\u0445. \u041f\u043e\u043a\u0435\u0440\u043d\u044b\u0435 \u043e\u0431\u043e\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439 (Fold, Check, Call, Raise, All-In) \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f \u043d\u0430 \u0430\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u043e\u043c, \u043a\u0430\u043a \u043f\u0440\u0438\u043d\u044f\u0442\u043e \u0432\u043e \u0432\u0441\u0451\u043c \u043c\u0438\u0440\u0435."],
      ["\u0417\u0430\u0434\u0435\u0439\u0441\u0442\u0432\u043e\u0432\u0430\u043d\u044b \u043b\u0438 \u0440\u0435\u0430\u043b\u044c\u043d\u044b\u0435 \u0434\u0435\u043d\u044c\u0433\u0438?",
       "\u041d\u0435\u0442. PokerTH \u2014 \u0438\u0441\u043a\u043b\u044e\u0447\u0438\u0442\u0435\u043b\u044c\u043d\u043e \u0438\u0433\u0440\u0430 \u043d\u0430 \u0443\u0441\u043b\u043e\u0432\u043d\u044b\u0435 \u0444\u0438\u0448\u043a\u0438. \u0424\u0438\u0448\u043a\u0438 \u043d\u0435 \u0438\u043c\u0435\u044e\u0442 \u0434\u0435\u043d\u0435\u0436\u043d\u043e\u0439 \u0446\u0435\u043d\u043d\u043e\u0441\u0442\u0438, \u0438\u0445 \u043d\u0435\u043b\u044c\u0437\u044f \u043a\u0443\u043f\u0438\u0442\u044c \u0438\u043b\u0438 \u043f\u0440\u043e\u0434\u0430\u0442\u044c."],
      ["\u041a\u0430\u043a\u0438\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0441\u043e\u0431\u0438\u0440\u0430\u0435\u0442 \u0432\u0435\u0431-\u043a\u043b\u0438\u0435\u043d\u0442?",
       "\u041a\u0430\u043a \u043c\u043e\u0436\u043d\u043e \u043c\u0435\u043d\u044c\u0448\u0435: \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f \u0432 \u0432\u0430\u0448\u0435\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435, \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u044f \u0438 \u0440\u0435\u043a\u043b\u0430\u043c\u044b \u043d\u0435\u0442. \u041f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438 \u2014 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043e \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438."],
      ["\u041c\u043e\u0433\u0443 \u043b\u0438 \u044f \u0437\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u044c \u0441\u0432\u043e\u0439 \u0441\u0435\u0440\u0432\u0435\u0440?",
       "\u0414\u0430. \u0412\u044b\u0434\u0435\u043b\u0435\u043d\u043d\u044b\u0439 \u0441\u0435\u0440\u0432\u0435\u0440 PokerTH \u0438 \u044d\u0442\u043e\u0442 \u0432\u0435\u0431-\u043a\u043b\u0438\u0435\u043d\u0442 \u2014 \u043e\u0442\u043a\u0440\u044b\u0442\u043e\u0435 \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u043d\u043e\u0435 \u043e\u0431\u0435\u0441\u043f\u0435\u0447\u0435\u043d\u0438\u0435, \u0442\u0430\u043a \u0447\u0442\u043e \u0432\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u0434\u0435\u0440\u0436\u0430\u0442\u044c \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0447\u0430\u0441\u0442\u043d\u044b\u0439 \u043f\u043e\u043a\u0435\u0440\u043d\u044b\u0439 \u0441\u0435\u0440\u0432\u0435\u0440 \u2014 \u0432 \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u043e\u0439 \u0441\u0435\u0442\u0438 \u0438\u043b\u0438 \u0432 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442\u0435."],
    ]
  },
  uk: {
    title: "\u0427\u0430\u0441\u0442\u0456 \u0437\u0430\u043f\u0438\u0442\u0430\u043d\u043d\u044f \u2014 \u0432\u0435\u0431\u043a\u043b\u0456\u0454\u043d\u0442 PokerTH",
    desc: "\u0427\u0430\u0441\u0442\u0456 \u0437\u0430\u043f\u0438\u0442\u0430\u043d\u043d\u044f \u043f\u0440\u043e \u0432\u0435\u0431\u043a\u043b\u0456\u0454\u043d\u0442 PokerTH: \u0431\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u0438\u0439 \u043f\u043e\u043a\u0435\u0440 \u0431\u0435\u0437 \u0440\u0435\u043a\u043b\u0430\u043c\u0438, \u0433\u0440\u0430 \u0432 Texas Hold\u2019em \u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456 \u0431\u0435\u0437 \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f, \u043e\u0431\u043b\u0456\u043a\u043e\u0432\u0456 \u0437\u0430\u043f\u0438\u0441\u0438, \u0442\u0435\u043b\u0435\u0444\u043e\u043d, \u043e\u0444\u043b\u0430\u0439\u043d-\u0440\u0435\u0436\u0438\u043c, \u043c\u043e\u0432\u0438 \u0442\u0430 \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u0456\u0441\u0442\u044c.",
    h1: "\u0412\u0435\u0431\u043a\u043b\u0456\u0454\u043d\u0442 PokerTH \u2014 \u0447\u0430\u0441\u0442\u0456 \u0437\u0430\u043f\u0438\u0442\u0430\u043d\u043d\u044f",
    qa: [
      ["\u0427\u0438 \u0454 PokerTH \u0431\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u0438\u043c?",
       "\u0422\u0430\u043a. PokerTH \u2014 \u0432\u0456\u043b\u044c\u043d\u0435 \u0439 \u0431\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u0435 \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043d\u0435 \u0437\u0430\u0431\u0435\u0437\u043f\u0435\u0447\u0435\u043d\u043d\u044f (GPL). \u041d\u0456\u0447\u043e\u0433\u043e \u043a\u0443\u043f\u0443\u0432\u0430\u0442\u0438 \u043d\u0435 \u0442\u0440\u0435\u0431\u0430, \u043d\u0435\u043c\u0430\u0454 \u0440\u0435\u043a\u043b\u0430\u043c\u0438 \u0442\u0430 \u0433\u0440\u0438 \u043d\u0430 \u0441\u043f\u0440\u0430\u0432\u0436\u043d\u0456 \u0433\u0440\u043e\u0448\u0456 \u2014 \u0443\u0441\u0456 \u0444\u0456\u0448\u043a\u0438 \u0456\u0433\u0440\u043e\u0432\u0456."],
      ["\u0427\u0438 \u043c\u043e\u0436\u043d\u0430 \u0433\u0440\u0430\u0442\u0438 \u0432 \u043f\u043e\u043a\u0435\u0440 \u0431\u0435\u0437 \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f?",
       "\u0422\u0430\u043a. \u0412\u0435\u0431\u043a\u043b\u0456\u0454\u043d\u0442 PokerTH \u043f\u0440\u0430\u0446\u044e\u0454 \u043f\u043e\u0432\u043d\u0456\u0441\u0442\u044e \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456 \u2014 \u0431\u0435\u0437 \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f \u0442\u0430 \u0432\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044f. \u0412\u0456\u0434\u043a\u0440\u0438\u0432\u0430\u0454\u0442\u0435 \u0441\u0430\u0439\u0442 \u2014 \u0456 \u0432\u0438 \u0437\u0430 \u0441\u0442\u043e\u043b\u043e\u043c; \u0437\u0430 \u0431\u0430\u0436\u0430\u043d\u043d\u044f\u043c \u0439\u043e\u0433\u043e \u043c\u043e\u0436\u043d\u0430 \u0434\u043e\u0434\u0430\u0442\u0438 \u043d\u0430 \u0433\u043e\u043b\u043e\u0432\u043d\u0438\u0439 \u0435\u043a\u0440\u0430\u043d \u044f\u043a \u0437\u0430\u0441\u0442\u043e\u0441\u0443\u043d\u043e\u043a (PWA)."],
      ["\u0426\u0435 \u0441\u043f\u0440\u0430\u0432\u0434\u0456 \u0431\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u043e \u0439 \u0431\u0435\u0437 \u0440\u0435\u043a\u043b\u0430\u043c\u0438?",
       "\u0422\u0430\u043a. PokerTH \u043d\u0435 \u043f\u043e\u043a\u0430\u0437\u0443\u0454 \u0440\u0435\u043a\u043b\u0430\u043c\u0438, \u043d\u0435 \u043c\u0430\u0454 \u0432\u0431\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0445 \u043f\u043e\u043a\u0443\u043f\u043e\u043a \u0456 \u043f\u0440\u0438\u0445\u043e\u0432\u0430\u043d\u0438\u0445 \u0432\u0438\u0442\u0440\u0430\u0442. \u0426\u0435 \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u0430 \u0437 \u0432\u0456\u0434\u043a\u0440\u0438\u0442\u0438\u043c \u043a\u043e\u0434\u043e\u043c, \u044f\u043a\u0443 \u0441\u0442\u0432\u043e\u0440\u044e\u044e\u0442\u044c \u0432\u043e\u043b\u043e\u043d\u0442\u0435\u0440\u0438, \u0430 \u0432\u0441\u0456 \u0444\u0456\u0448\u043a\u0438 \u0456\u0433\u0440\u043e\u0432\u0456."],
      ["\u0427\u0438 \u043c\u043e\u0436\u043d\u0430 \u0433\u0440\u0430\u0442\u0438 \u0432 Texas Hold\u2019em \u0437 \u0456\u043d\u0448\u0438\u043c\u0438 \u043b\u044e\u0434\u044c\u043c\u0438 \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456?",
       "\u0422\u0430\u043a. \u0414\u043e\u043b\u0443\u0447\u0430\u0439\u0442\u0435\u0441\u044f \u0434\u043e \u043e\u0444\u0456\u0446\u0456\u0439\u043d\u043e\u0457 \u043c\u0435\u0440\u0435\u0436\u0456 pokerth.net, \u0449\u043e\u0431 \u0433\u0440\u0430\u0442\u0438 \u0437 \u0433\u0440\u0430\u0432\u0446\u044f\u043c\u0438 \u0437 \u0443\u0441\u044c\u043e\u0433\u043e \u0441\u0432\u0456\u0442\u0443, \u0430\u0431\u043e \u043d\u0430\u0434\u0456\u0448\u043b\u0456\u0442\u044c \u043f\u043e\u0441\u0438\u043b\u0430\u043d\u043d\u044f-\u0437\u0430\u043f\u0440\u043e\u0448\u0435\u043d\u043d\u044f, \u0449\u043e\u0431 \u0434\u0440\u0443\u0437\u0456 \u043f\u043e\u0442\u0440\u0430\u043f\u0438\u043b\u0438 \u043f\u0440\u044f\u043c\u043e \u0437\u0430 \u0432\u0430\u0448 \u0441\u0442\u0456\u043b \u2014 \u0443\u0441\u0435 \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456."],
      ["\u0427\u0438 \u043f\u043e\u0442\u0440\u0456\u0431\u0435\u043d \u043e\u0431\u043b\u0456\u043a\u043e\u0432\u0438\u0439 \u0437\u0430\u043f\u0438\u0441?",
       "\u0414\u043b\u044f \u0442\u0440\u0435\u043d\u0443\u0432\u0430\u043d\u043d\u044f \u043e\u0444\u043b\u0430\u0439\u043d \u043f\u0440\u043e\u0442\u0438 \u043a\u043e\u043c\u043f\u2019\u044e\u0442\u0435\u0440\u0430 \u043e\u0431\u043b\u0456\u043a\u043e\u0432\u0438\u0439 \u0437\u0430\u043f\u0438\u0441 \u043d\u0435 \u043f\u043e\u0442\u0440\u0456\u0431\u0435\u043d. \u0414\u043b\u044f \u0433\u0440\u0438 \u043e\u043d\u043b\u0430\u0439\u043d \u0443 \u043c\u0435\u0440\u0435\u0436\u0456 pokerth.net \u043f\u043e\u0442\u0440\u0456\u0431\u0435\u043d \u0431\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u0438\u0439 \u0430\u043a\u0430\u0443\u043d\u0442 pokerth.net."],
      ["\u0427\u0438 \u043f\u0440\u0430\u0446\u044e\u0454 \u043d\u0430 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0456?",
       "\u0422\u0430\u043a. \u0412\u0435\u0431\u043a\u043b\u0456\u0454\u043d\u0442 \u2014 \u0446\u0435 Progressive Web App: \u0432\u0456\u043d \u043f\u0440\u0430\u0446\u044e\u0454 \u0432 \u0431\u0443\u0434\u044c-\u044f\u043a\u043e\u043c\u0443 \u0441\u0443\u0447\u0430\u0441\u043d\u043e\u043c\u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456 \u043d\u0430 \u043a\u043e\u043c\u043f\u2019\u044e\u0442\u0435\u0440\u0456, \u043f\u043b\u0430\u043d\u0448\u0435\u0442\u0456 \u0447\u0438 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0456 \u0439 \u0432\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u044e\u0454\u0442\u044c\u0441\u044f \u043d\u0430 \u0433\u043e\u043b\u043e\u0432\u043d\u0438\u0439 \u0435\u043a\u0440\u0430\u043d \u044f\u043a \u0437\u0432\u0438\u0447\u0430\u0439\u043d\u0438\u0439 \u0437\u0430\u0441\u0442\u043e\u0441\u0443\u043d\u043e\u043a."],
      ["\u0427\u0438 \u043c\u043e\u0436\u043d\u0430 \u0433\u0440\u0430\u0442\u0438 \u043f\u0440\u043e\u0442\u0438 \u043a\u043e\u043c\u043f\u2019\u044e\u0442\u0435\u0440\u0430?",
       "\u0422\u0430\u043a. \u041e\u0444\u043b\u0430\u0439\u043d-\u0440\u0435\u0436\u0438\u043c \u0434\u0430\u0454 \u0437\u043c\u043e\u0433\u0443 \u0433\u0440\u0430\u0442\u0438 \u043f\u043e\u0432\u043d\u043e\u0446\u0456\u043d\u043d\u0456 \u0442\u0443\u0440\u043d\u0456\u0440\u0438 \u043f\u0440\u043e\u0442\u0438 \u043a\u043e\u043c\u043f\u2019\u044e\u0442\u0435\u0440\u043d\u0438\u0445 \u0441\u0443\u043f\u0435\u0440\u043d\u0438\u043a\u0456\u0432 \u2014 \u0431\u0435\u0437 \u0456\u043d\u0442\u0435\u0440\u043d\u0435\u0442\u0443, \u0449\u043e\u0439\u043d\u043e \u0437\u0430\u0441\u0442\u043e\u0441\u0443\u043d\u043e\u043a \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0438\u0432\u0441\u044f."],
      ["\u0427\u0438 \u0446\u0435 \u043e\u0444\u0456\u0446\u0456\u0439\u043d\u0438\u0439 \u043a\u043b\u0456\u0454\u043d\u0442 PokerTH?",
       "\u0426\u0435 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043d\u0430 \u0432\u0435\u0440\u0441\u0456\u044f PokerTH, \u044f\u043a\u0443 \u0440\u043e\u0437\u0440\u043e\u0431\u043b\u044f\u044e\u0442\u044c \u0443 \u043c\u0435\u0436\u0430\u0445 \u043f\u0440\u043e\u0454\u043a\u0442\u0443 PokerTH \u0441\u0438\u043b\u0430\u043c\u0438 PokerTH Development Team \u043f\u043e\u0440\u044f\u0434 \u0456\u0437 \u043a\u043b\u0430\u0441\u0438\u0447\u043d\u0438\u043c \u043d\u0430\u0441\u0442\u0456\u043b\u044c\u043d\u0438\u043c \u043a\u043b\u0456\u0454\u043d\u0442\u043e\u043c."],
      ["\u0427\u0438\u043c \u0432\u0456\u043d \u0432\u0456\u0434\u0440\u0456\u0437\u043d\u044f\u0454\u0442\u044c\u0441\u044f \u0432\u0456\u0434 \u043d\u0430\u0441\u0442\u0456\u043b\u044c\u043d\u043e\u0433\u043e \u043a\u043b\u0456\u0454\u043d\u0442\u0430?",
       "\u0422\u0430 \u0441\u0430\u043c\u0430 \u0433\u0440\u0430, \u0442\u0456 \u0441\u0430\u043c\u0456 \u043f\u0440\u0430\u0432\u0438\u043b\u0430, \u0442\u0430 \u0441\u0430\u043c\u0430 \u043c\u0435\u0440\u0435\u0436\u0430 pokerth.net \u2014 \u0430\u043b\u0435 \u0432\u0456\u043d \u043f\u0440\u0430\u0446\u044e\u0454 \u043f\u0440\u044f\u043c\u043e \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456, \u0431\u0435\u0437 \u0432\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044f, \u043d\u0430 \u0431\u0443\u0434\u044c-\u044f\u043a\u0456\u0439 \u043e\u043f\u0435\u0440\u0430\u0446\u0456\u0439\u043d\u0456\u0439 \u0441\u0438\u0441\u0442\u0435\u043c\u0456."],
      ["\u042f\u043a\u0456 \u043c\u043e\u0432\u0438 \u043f\u0456\u0434\u0442\u0440\u0438\u043c\u0443\u044e\u0442\u044c\u0441\u044f?",
       "\u0406\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0438\u0439 45 \u043c\u043e\u0432\u0430\u043c\u0438. \u041f\u043e\u043a\u0435\u0440\u043d\u0456 \u043f\u043e\u0437\u043d\u0430\u0447\u0435\u043d\u043d\u044f \u0434\u0456\u0439 (Fold, Check, Call, Raise, All-In) \u0437\u0430\u043b\u0438\u0448\u0430\u044e\u0442\u044c\u0441\u044f \u0430\u043d\u0433\u043b\u0456\u0439\u0441\u044c\u043a\u0438\u043c\u0438, \u044f\u043a \u0446\u0435 \u043f\u0440\u0438\u0439\u043d\u044f\u0442\u043e \u0443 \u0432\u0441\u044c\u043e\u043c\u0443 \u0441\u0432\u0456\u0442\u0456."],
      ["\u0427\u0438 \u0439\u0434\u0435\u0442\u044c\u0441\u044f \u043f\u0440\u043e \u0441\u043f\u0440\u0430\u0432\u0436\u043d\u0456 \u0433\u0440\u043e\u0448\u0456?",
       "\u041d\u0456. PokerTH \u2014 \u0446\u0435 \u0432\u0438\u043a\u043b\u044e\u0447\u043d\u043e \u0433\u0440\u0430 \u043d\u0430 \u0443\u043c\u043e\u0432\u043d\u0456 \u0444\u0456\u0448\u043a\u0438. \u0424\u0456\u0448\u043a\u0438 \u043d\u0435 \u043c\u0430\u044e\u0442\u044c \u0433\u0440\u043e\u0448\u043e\u0432\u043e\u0457 \u0432\u0430\u0440\u0442\u043e\u0441\u0442\u0456, \u0457\u0445 \u043d\u0435 \u043c\u043e\u0436\u043d\u0430 \u043a\u0443\u043f\u0438\u0442\u0438 \u0430\u0431\u043e \u043f\u0440\u043e\u0434\u0430\u0442\u0438."],
      ["\u042f\u043a\u0456 \u0434\u0430\u043d\u0456 \u0437\u0431\u0438\u0440\u0430\u0454 \u0432\u0435\u0431\u043a\u043b\u0456\u0454\u043d\u0442?",
       "\u042f\u043a\u043d\u0430\u0439\u043c\u0435\u043d\u0448\u0435: \u043d\u0430\u043b\u0430\u0448\u0442\u0443\u0432\u0430\u043d\u043d\u044f \u0437\u0430\u043b\u0438\u0448\u0430\u044e\u0442\u044c\u0441\u044f \u0443 \u0432\u0430\u0448\u043e\u043c\u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456, \u0432\u0456\u0434\u0441\u0442\u0435\u0436\u0435\u043d\u043d\u044f \u0442\u0430 \u0440\u0435\u043a\u043b\u0430\u043c\u0438 \u043d\u0435\u043c\u0430\u0454. \u041f\u043e\u0434\u0440\u043e\u0431\u0438\u0446\u0456 \u2014 \u043d\u0430 \u0441\u0442\u043e\u0440\u0456\u043d\u0446\u0456 \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u043e\u0441\u0442\u0456."],
      ["\u0427\u0438 \u043c\u043e\u0436\u0443 \u044f \u0440\u043e\u0437\u0433\u043e\u0440\u043d\u0443\u0442\u0438 \u0432\u043b\u0430\u0441\u043d\u0438\u0439 \u0441\u0435\u0440\u0432\u0435\u0440?",
       "\u0422\u0430\u043a. \u0412\u0438\u0434\u0456\u043b\u0435\u043d\u0438\u0439 \u0441\u0435\u0440\u0432\u0435\u0440 PokerTH \u0456 \u0446\u0435\u0439 \u0432\u0435\u0431\u043a\u043b\u0456\u0454\u043d\u0442 \u043c\u0430\u044e\u0442\u044c \u0432\u0456\u0434\u043a\u0440\u0438\u0442\u0438\u0439 \u043a\u043e\u0434, \u0442\u043e\u0436 \u0432\u0438 \u043c\u043e\u0436\u0435\u0442\u0435 \u0442\u0440\u0438\u043c\u0430\u0442\u0438 \u0432\u043b\u0430\u0441\u043d\u0438\u0439 \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u0438\u0439 \u043f\u043e\u043a\u0435\u0440\u043d\u0438\u0439 \u0441\u0435\u0440\u0432\u0435\u0440 \u2014 \u0443 \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u0456\u0439 \u043c\u0435\u0440\u0435\u0436\u0456 \u0430\u0431\u043e \u0432 \u0456\u043d\u0442\u0435\u0440\u043d\u0435\u0442\u0456."],
    ]
  },
  cs: {
    title: "\u010cast\u00e9 dotazy \u2014 webov\u00fd klient PokerTH",
    desc: "\u010cast\u00e9 dotazy k webov\u00e9mu klientovi PokerTH: poker zdarma bez reklam, hran\u00ed Texas Hold\u2019em v prohl\u00ed\u017ee\u010di bez stahov\u00e1n\u00ed, \u00fa\u010dty, mobil, re\u017eim offline, jazyky a soukrom\u00ed.",
    h1: "Webov\u00fd klient PokerTH \u2014 \u010dast\u00e9 dotazy",
    qa: [
      ["Je PokerTH zdarma?",
       "Ano. PokerTH je svobodn\u00fd a bezplatn\u00fd software (GPL). Nen\u00ed co kupovat, nejsou tu reklamy ani hran\u00ed o skute\u010dn\u00e9 pen\u00edze \u2014 v\u0161echny \u017eetony jsou hern\u00ed."],
      ["Mohu hr\u00e1t poker, ani\u017e bych cokoli stahoval?",
       "Ano. Webov\u00fd klient PokerTH b\u011b\u017e\u00ed cel\u00fd v prohl\u00ed\u017ee\u010di \u2014 bez stahov\u00e1n\u00ed a bez instalace. Otev\u0159ete str\u00e1nku a sed\u00edte u stolu; pokud chcete, m\u016f\u017eete si ji p\u0159idat na plochu jako aplikaci (PWA)."],
      ["Je to opravdu zdarma a bez reklam?",
       "Ano. PokerTH nezobrazuje reklamy, nem\u00e1 n\u00e1kupy v aplikaci ani skryt\u00e9 poplatky. Je to otev\u0159en\u00fd software vyv\u00edjen\u00fd dobrovoln\u00edky a v\u0161echny \u017eetony jsou hern\u00ed."],
      ["Mohu hr\u00e1t Texas Hold\u2019em proti jin\u00fdm lidem v prohl\u00ed\u017ee\u010di?",
       "Ano. P\u0159ipojte se k ofici\u00e1ln\u00ed s\u00edti pokerth.net a hrajte proti hr\u00e1\u010d\u016fm z cel\u00e9ho sv\u011bta, nebo po\u0161lete pozv\u00e1nku, kter\u00e1 kamar\u00e1dy dovede rovnou k va\u0161emu stolu \u2014 v\u0161e v prohl\u00ed\u017ee\u010di."],
      ["Pot\u0159ebuji ke hran\u00ed \u00fa\u010det?",
       "K tr\u00e9nov\u00e1n\u00ed offline proti po\u010d\u00edta\u010di \u017e\u00e1dn\u00fd \u00fa\u010det nepot\u0159ebujete. Ke h\u0159e online v ofici\u00e1ln\u00ed s\u00edti pokerth.net je pot\u0159eba bezplatn\u00fd \u00fa\u010det pokerth.net."],
      ["Funguje to na mobilu?",
       "Ano. Webov\u00fd klient je Progressive Web App: b\u011b\u017e\u00ed v ka\u017ed\u00e9m modern\u00edm prohl\u00ed\u017ee\u010di na po\u010d\u00edta\u010di, tabletu i telefonu a lze jej nainstalovat na plochu jako nativn\u00ed aplikaci."],
      ["Mohu hr\u00e1t proti po\u010d\u00edta\u010di?",
       "Ano. Re\u017eim offline umo\u017e\u0148uje odehr\u00e1t cel\u00e9 turnaje proti po\u010d\u00edta\u010dov\u00fdm soupe\u0159\u016fm, a to bez p\u0159ipojen\u00ed k internetu, jakmile se aplikace na\u010dte."],
      ["Je tohle ofici\u00e1ln\u00ed klient PokerTH?",
       "Je to prohl\u00ed\u017ee\u010dov\u00e1 verze PokerTH, vyv\u00edjen\u00e1 v r\u00e1mci projektu PokerTH t\u00fdmem PokerTH Development Team vedle klasick\u00e9ho desktopov\u00e9ho klienta."],
      ["Jak\u00fd je rozd\u00edl oproti desktopov\u00e9mu klientovi?",
       "Stejn\u00e1 hra, stejn\u00e1 pravidla, stejn\u00e1 s\u00ed\u0165 pokerth.net \u2014 jen b\u011b\u017e\u00ed p\u0159\u00edmo v prohl\u00ed\u017ee\u010di, bez instalace a na jak\u00e9mkoli opera\u010dn\u00edm syst\u00e9mu."],
      ["Jak\u00e9 jazyky jsou podporov\u00e1ny?",
       "Rozhran\u00ed je k dispozici ve 45 jazyc\u00edch. Pokerov\u00e9 n\u00e1zvy akc\u00ed (Fold, Check, Call, Raise, All-In) z\u016fst\u00e1vaj\u00ed anglicky, jak je mezin\u00e1rodn\u00edm zvykem."],
      ["Hraje se o skute\u010dn\u00e9 pen\u00edze?",
       "Ne. PokerTH je v\u00fdhradn\u011b hra o hern\u00ed \u017eetony. \u017detony nemaj\u00ed \u017e\u00e1dnou pen\u011b\u017en\u00ed hodnotu a nelze je koupit ani prodat."],
      ["Jak\u00e1 data webov\u00fd klient sb\u00edr\u00e1?",
       "Co nejm\u00e9n\u011b: nastaven\u00ed z\u016fst\u00e1v\u00e1 ve va\u0161em prohl\u00ed\u017ee\u010di a nepou\u017e\u00edv\u00e1 se \u017e\u00e1dn\u00e9 sledov\u00e1n\u00ed ani reklama. Podrobnosti najdete na str\u00e1nce o soukrom\u00ed."],
      ["Mohu si provozovat vlastn\u00ed server?",
       "Ano. Dedikovan\u00fd server PokerTH i tento webov\u00fd klient jsou otev\u0159en\u00fd software, tak\u017ee si m\u016f\u017eete provozovat vlastn\u00ed soukrom\u00fd pokerov\u00fd server \u2014 v m\u00edstn\u00ed s\u00edti nebo na internetu."],
    ]
  },
  sk: {
    title: "\u010cast\u00e9 ot\u00e1zky \u2014 webov\u00fd klient PokerTH",
    desc: "\u010cast\u00e9 ot\u00e1zky o webovom klientovi PokerTH: poker zadarmo bez rekl\u00e1m, hranie Texas Hold\u2019em v prehliada\u010di bez s\u0165ahovania, \u00fa\u010dty, mobil, offline re\u017eim, jazyky a s\u00fakromie.",
    h1: "Webov\u00fd klient PokerTH \u2014 \u010dast\u00e9 ot\u00e1zky",
    qa: [
      ["Je PokerTH zadarmo?",
       "\u00c1no. PokerTH je slobodn\u00fd a bezplatn\u00fd softv\u00e9r (GPL). Niet \u010do kupova\u0165, nie s\u00fa tu reklamy ani hranie o skuto\u010dn\u00e9 peniaze \u2014 v\u0161etky \u017eet\u00f3ny s\u00fa hern\u00e9."],
      ["M\u00f4\u017eem hra\u0165 poker bez s\u0165ahovania?",
       "\u00c1no. Webov\u00fd klient PokerTH be\u017e\u00ed cel\u00fd v prehliada\u010di \u2014 bez s\u0165ahovania a bez in\u0161tal\u00e1cie. Otvor\u00edte str\u00e1nku a sed\u00edte pri stole; ak chcete, m\u00f4\u017eete si ju prida\u0165 na plochu ako aplik\u00e1ciu (PWA)."],
      ["Je to naozaj zadarmo a bez rekl\u00e1m?",
       "\u00c1no. PokerTH nezobrazuje reklamy, nem\u00e1 n\u00e1kupy v aplik\u00e1cii ani skryt\u00e9 poplatky. Je to otvoren\u00fd softv\u00e9r vyv\u00edjan\u00fd dobrovo\u013enikmi a v\u0161etky \u017eet\u00f3ny s\u00fa hern\u00e9."],
      ["M\u00f4\u017eem hra\u0165 Texas Hold\u2019em proti in\u00fdm \u013eu\u010fom v prehliada\u010di?",
       "\u00c1no. Pripojte sa k ofici\u00e1lnej sieti pokerth.net a hrajte proti hr\u00e1\u010dom z cel\u00e9ho sveta, alebo po\u0161lite pozv\u00e1nku, ktor\u00e1 priate\u013eov dovedie rovno k v\u00e1\u0161mu stolu \u2014 v\u0161etko v prehliada\u010di."],
      ["Potrebujem na hranie \u00fa\u010det?",
       "Na tr\u00e9novanie offline proti po\u010d\u00edta\u010du \u017eiadny \u00fa\u010det netreba. Na hru online v ofici\u00e1lnej sieti pokerth.net je potrebn\u00fd bezplatn\u00fd \u00fa\u010det pokerth.net."],
      ["Funguje to na mobile?",
       "\u00c1no. Webov\u00fd klient je Progressive Web App: be\u017e\u00ed v ka\u017edom modernom prehliada\u010di na po\u010d\u00edta\u010di, tablete aj telef\u00f3ne a d\u00e1 sa nain\u0161talova\u0165 na plochu ako nat\u00edvna aplik\u00e1cia."],
      ["M\u00f4\u017eem hra\u0165 proti po\u010d\u00edta\u010du?",
       "\u00c1no. Offline re\u017eim umo\u017e\u0148uje odohra\u0165 cel\u00e9 turnaje proti po\u010d\u00edta\u010dov\u00fdm s\u00faperom, a to bez pripojenia na internet, len \u010do sa aplik\u00e1cia na\u010d\u00edta."],
      ["Je toto ofici\u00e1lny klient PokerTH?",
       "Je to prehliada\u010dov\u00e1 verzia PokerTH, vyv\u00edjan\u00e1 v r\u00e1mci projektu PokerTH t\u00edmom PokerTH Development Team popri klasickom desktopovom klientovi."],
      ["V \u010dom sa l\u00ed\u0161i od desktopov\u00e9ho klienta?",
       "Rovnak\u00e1 hra, rovnak\u00e9 pravidl\u00e1, rovnak\u00e1 sie\u0165 pokerth.net \u2014 len be\u017e\u00ed priamo v prehliada\u010di, bez in\u0161tal\u00e1cie a na ktoromko\u013evek opera\u010dnom syst\u00e9me."],
      ["Ktor\u00e9 jazyky s\u00fa podporovan\u00e9?",
       "Rozhranie je dostupn\u00e9 v 45 jazykoch. Pokerov\u00e9 n\u00e1zvy akci\u00ed (Fold, Check, Call, Raise, All-In) z\u00f4stavaj\u00fa v angli\u010dtine, ako je medzin\u00e1rodn\u00fdm zvykom."],
      ["Hr\u00e1 sa o skuto\u010dn\u00e9 peniaze?",
       "Nie. PokerTH je v\u00fdlu\u010dne hra o hern\u00e9 \u017eet\u00f3ny. \u017det\u00f3ny nemaj\u00fa \u017eiadnu pe\u0148a\u017en\u00fa hodnotu a ned\u00e1 sa ich k\u00fapi\u0165 ani preda\u0165."],
      ["Ak\u00e9 \u00fadaje webov\u00fd klient zbiera?",
       "\u010co najmenej: nastavenia zost\u00e1vaj\u00fa vo va\u0161om prehliada\u010di a nepou\u017e\u00edva sa \u017eiadne sledovanie ani reklama. Podrobnosti n\u00e1jdete na str\u00e1nke o s\u00fakrom\u00ed."],
      ["M\u00f4\u017eem prev\u00e1dzkova\u0165 vlastn\u00fd server?",
       "\u00c1no. Dedikovan\u00fd server PokerTH aj tento webov\u00fd klient s\u00fa otvoren\u00fd softv\u00e9r, tak\u017ee si m\u00f4\u017eete prev\u00e1dzkova\u0165 vlastn\u00fd s\u00fakromn\u00fd pokerov\u00fd server \u2014 v miestnej sieti alebo na internete."],
    ]
  },
  tr: {
    title: "SSS \u2014 PokerTH web istemcisi",
    desc: "PokerTH web istemcisi hakk\u0131nda s\u0131k sorulan sorular: reklams\u0131z \u00fccretsiz poker, hi\u00e7bir \u015fey indirmeden taray\u0131c\u0131da Texas Hold\u2019em oynamak, hesaplar, mobil, \u00e7evrimd\u0131\u015f\u0131 mod, diller ve gizlilik.",
    h1: "PokerTH web istemcisi \u2014 S\u0131k sorulan sorular",
    qa: [
      ["PokerTH \u00fccretsiz mi?",
       "Evet. PokerTH \u00f6zg\u00fcr ve \u00fccretsiz bir yaz\u0131l\u0131md\u0131r (GPL). Sat\u0131n al\u0131nacak bir \u015fey yok, reklam yok ve ger\u00e7ek parayla kumar yok \u2014 t\u00fcm fi\u015fler oyun fi\u015fidir."],
      ["Hi\u00e7bir \u015fey indirmeden poker oynayabilir miyim?",
       "Evet. PokerTH web istemcisi tamamen taray\u0131c\u0131n\u0131zda \u00e7al\u0131\u015f\u0131r \u2014 indirme yok, kurulum yok. Siteyi a\u00e7\u0131n, masadas\u0131n\u0131z; isterseniz uygulama (PWA) olarak ana ekran\u0131n\u0131za ekleyebilirsiniz."],
      ["Ger\u00e7ekten \u00fccretsiz ve reklams\u0131z m\u0131?",
       "Evet. PokerTH reklam g\u00f6stermez, uygulama i\u00e7i sat\u0131n alma ve gizli \u00fccret i\u00e7ermez. G\u00f6n\u00fcll\u00fcler taraf\u0131ndan geli\u015ftirilen a\u00e7\u0131k kaynakl\u0131 bir yaz\u0131l\u0131md\u0131r ve t\u00fcm fi\u015fler oyun fi\u015fidir."],
      ["Taray\u0131c\u0131mda ba\u015fka insanlara kar\u015f\u0131 Texas Hold\u2019em oynayabilir miyim?",
       "Evet. D\u00fcnyan\u0131n d\u00f6rt bir yan\u0131ndan oyuncularla oynamak i\u00e7in resm\u00ee pokerth.net a\u011f\u0131na kat\u0131l\u0131n ya da bir davet ba\u011flant\u0131s\u0131 g\u00f6nderin; arkada\u015flar\u0131n\u0131z do\u011frudan masan\u0131za d\u00fc\u015fer \u2014 hepsi taray\u0131c\u0131 i\u00e7inde."],
      ["Oynamak i\u00e7in hesap gerekir mi?",
       "Bilgisayara kar\u015f\u0131 \u00e7evrimd\u0131\u015f\u0131 al\u0131\u015ft\u0131rma yapmak i\u00e7in hesap gerekmez. Resm\u00ee pokerth.net a\u011f\u0131nda \u00e7evrimi\u00e7i oynamak i\u00e7in \u00fccretsiz bir pokerth.net hesab\u0131 gerekir."],
      ["Mobilde \u00e7al\u0131\u015f\u0131yor mu?",
       "Evet. Web istemcisi bir Progressive Web App\u2019tir: bilgisayarda, tablette veya telefonda her modern taray\u0131c\u0131da \u00e7al\u0131\u015f\u0131r ve ana ekrana yerel bir uygulama gibi kurulabilir."],
      ["Bilgisayara kar\u015f\u0131 oynayabilir miyim?",
       "Evet. \u00c7evrimd\u0131\u015f\u0131 mod, uygulama bir kez y\u00fcklendikten sonra hi\u00e7bir internet ba\u011flant\u0131s\u0131 olmadan bilgisayar rakiplere kar\u015f\u0131 tam turnuvalar oynaman\u0131z\u0131 sa\u011flar."],
      ["Bu resm\u00ee PokerTH istemcisi mi?",
       "Bu, PokerTH\u2019nin taray\u0131c\u0131 s\u00fcr\u00fcm\u00fcd\u00fcr; klasik masa\u00fcst\u00fc istemcinin yan\u0131 s\u0131ra PokerTH projesi i\u00e7inde PokerTH Development Team taraf\u0131ndan geli\u015ftirilir."],
      ["Masa\u00fcst\u00fc istemciden fark\u0131 nedir?",
       "Ayn\u0131 oyun, ayn\u0131 kurallar, ayn\u0131 pokerth.net a\u011f\u0131 \u2014 ancak hi\u00e7bir \u015fey kurmadan, her i\u015fletim sisteminde do\u011frudan taray\u0131c\u0131da \u00e7al\u0131\u015f\u0131r."],
      ["Hangi diller destekleniyor?",
       "Aray\u00fcz 45 dilde mevcuttur. Pokerin eylem terimleri (Fold, Check, Call, Raise, All-In) uluslararas\u0131 team\u00fcle uygun olarak \u0130ngilizce kal\u0131r."],
      ["Ger\u00e7ek para s\u00f6z konusu mu?",
       "Hay\u0131r. PokerTH kesinlikle oyun fi\u015fiyle oynanan bir oyundur. Fi\u015flerin parasal de\u011feri yoktur; sat\u0131n al\u0131namaz ve sat\u0131lamaz."],
      ["Web istemcisi hangi verileri topluyor?",
       "M\u00fcmk\u00fcn olan en az\u0131n\u0131: ayarlar\u0131n\u0131z taray\u0131c\u0131n\u0131zda kal\u0131r, izleme ya da reklam kullan\u0131lmaz. Ayr\u0131nt\u0131lar i\u00e7in gizlilik sayfas\u0131na bak\u0131n."],
      ["Kendi sunucumu \u00e7al\u0131\u015ft\u0131rabilir miyim?",
       "Evet. PokerTH adanm\u0131\u015f sunucusu da bu web istemcisi de a\u00e7\u0131k kaynakl\u0131d\u0131r; b\u00f6ylece yerel a\u011fda veya internette kendi \u00f6zel poker sunucunuzu \u00e7al\u0131\u015ft\u0131rabilirsiniz."],
    ]
  },
  el: {
    title: "\u03a3\u03c5\u03c7\u03bd\u03ad\u03c2 \u03b5\u03c1\u03c9\u03c4\u03ae\u03c3\u03b5\u03b9\u03c2 \u2014 \u03b4\u03b9\u03b1\u03b4\u03b9\u03ba\u03c4\u03c5\u03b1\u03ba\u03cc\u03c2 \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7\u03c2 PokerTH",
    desc: "\u03a3\u03c5\u03c7\u03bd\u03ad\u03c2 \u03b5\u03c1\u03c9\u03c4\u03ae\u03c3\u03b5\u03b9\u03c2 \u03b3\u03b9\u03b1 \u03c4\u03bf\u03bd \u03b4\u03b9\u03b1\u03b4\u03b9\u03ba\u03c4\u03c5\u03b1\u03ba\u03cc \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7 PokerTH: \u03b4\u03c9\u03c1\u03b5\u03ac\u03bd \u03c0\u03cc\u03ba\u03b5\u03c1 \u03c7\u03c9\u03c1\u03af\u03c2 \u03b4\u03b9\u03b1\u03c6\u03b7\u03bc\u03af\u03c3\u03b5\u03b9\u03c2, \u03c0\u03b1\u03b9\u03c7\u03bd\u03af\u03b4\u03b9 Texas Hold\u2019em \u03c3\u03c4\u03bf\u03bd \u03c6\u03c5\u03bb\u03bb\u03bf\u03bc\u03b5\u03c4\u03c1\u03b7\u03c4\u03ae \u03c7\u03c9\u03c1\u03af\u03c2 \u03bb\u03ae\u03c8\u03b7, \u03bb\u03bf\u03b3\u03b1\u03c1\u03b9\u03b1\u03c3\u03bc\u03bf\u03af, \u03ba\u03b9\u03bd\u03b7\u03c4\u03ac, \u03bb\u03b5\u03b9\u03c4\u03bf\u03c5\u03c1\u03b3\u03af\u03b1 \u03c7\u03c9\u03c1\u03af\u03c2 \u03c3\u03cd\u03bd\u03b4\u03b5\u03c3\u03b7, \u03b3\u03bb\u03ce\u03c3\u03c3\u03b5\u03c2 \u03ba\u03b1\u03b9 \u03b9\u03b4\u03b9\u03c9\u03c4\u03b9\u03ba\u03cc\u03c4\u03b7\u03c4\u03b1.",
    h1: "\u0394\u03b9\u03b1\u03b4\u03b9\u03ba\u03c4\u03c5\u03b1\u03ba\u03cc\u03c2 \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7\u03c2 PokerTH \u2014 \u03a3\u03c5\u03c7\u03bd\u03ad\u03c2 \u03b5\u03c1\u03c9\u03c4\u03ae\u03c3\u03b5\u03b9\u03c2",
    qa: [
      ["\u0395\u03af\u03bd\u03b1\u03b9 \u03c4\u03bf PokerTH \u03b4\u03c9\u03c1\u03b5\u03ac\u03bd;",
       "\u039d\u03b1\u03b9. \u03a4\u03bf PokerTH \u03b5\u03af\u03bd\u03b1\u03b9 \u03b5\u03bb\u03b5\u03cd\u03b8\u03b5\u03c1\u03bf \u03ba\u03b1\u03b9 \u03b4\u03c9\u03c1\u03b5\u03ac\u03bd \u03bb\u03bf\u03b3\u03b9\u03c3\u03bc\u03b9\u03ba\u03cc (GPL). \u0394\u03b5\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03b5\u03b9 \u03ba\u03ac\u03c4\u03b9 \u03c0\u03c1\u03bf\u03c2 \u03b1\u03b3\u03bf\u03c1\u03ac, \u03bf\u03cd\u03c4\u03b5 \u03b4\u03b9\u03b1\u03c6\u03b7\u03bc\u03af\u03c3\u03b5\u03b9\u03c2, \u03bf\u03cd\u03c4\u03b5 \u03c4\u03b6\u03cc\u03b3\u03bf\u03c2 \u03bc\u03b5 \u03c0\u03c1\u03b1\u03b3\u03bc\u03b1\u03c4\u03b9\u03ba\u03ac \u03c7\u03c1\u03ae\u03bc\u03b1\u03c4\u03b1 \u2014 \u03cc\u03bb\u03b5\u03c2 \u03bf\u03b9 \u03bc\u03ac\u03c1\u03ba\u03b5\u03c2 \u03b5\u03af\u03bd\u03b1\u03b9 \u03c0\u03bb\u03b1\u03c3\u03bc\u03b1\u03c4\u03b9\u03ba\u03ad\u03c2."],
      ["\u039c\u03c0\u03bf\u03c1\u03ce \u03bd\u03b1 \u03c0\u03b1\u03af\u03be\u03c9 \u03c0\u03cc\u03ba\u03b5\u03c1 \u03c7\u03c9\u03c1\u03af\u03c2 \u03bd\u03b1 \u03ba\u03b1\u03c4\u03b5\u03b2\u03ac\u03c3\u03c9 \u03c4\u03af\u03c0\u03bf\u03c4\u03b1;",
       "\u039d\u03b1\u03b9. \u039f \u03b4\u03b9\u03b1\u03b4\u03b9\u03ba\u03c4\u03c5\u03b1\u03ba\u03cc\u03c2 \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7\u03c2 PokerTH \u03c4\u03c1\u03ad\u03c7\u03b5\u03b9 \u03b5\u03be \u03bf\u03bb\u03bf\u03ba\u03bb\u03ae\u03c1\u03bf\u03c5 \u03c3\u03c4\u03bf\u03bd \u03c6\u03c5\u03bb\u03bb\u03bf\u03bc\u03b5\u03c4\u03c1\u03b7\u03c4\u03ae \u2014 \u03c7\u03c9\u03c1\u03af\u03c2 \u03bb\u03ae\u03c8\u03b7, \u03c7\u03c9\u03c1\u03af\u03c2 \u03b5\u03b3\u03ba\u03b1\u03c4\u03ac\u03c3\u03c4\u03b1\u03c3\u03b7. \u0391\u03bd\u03bf\u03af\u03b3\u03b5\u03c4\u03b5 \u03c4\u03bf\u03bd \u03b9\u03c3\u03c4\u03cc\u03c4\u03bf\u03c0\u03bf \u03ba\u03b1\u03b9 \u03b5\u03af\u03c3\u03c4\u03b5 \u03c3\u03c4\u03bf \u03c4\u03c1\u03b1\u03c0\u03ad\u03b6\u03b9\u00b7 \u03b1\u03bd \u03b8\u03ad\u03bb\u03b5\u03c4\u03b5, \u03bc\u03c0\u03bf\u03c1\u03b5\u03af\u03c4\u03b5 \u03bd\u03b1 \u03c4\u03bf\u03bd \u03c0\u03c1\u03bf\u03c3\u03b8\u03ad\u03c3\u03b5\u03c4\u03b5 \u03c3\u03c4\u03b7\u03bd \u03b1\u03c1\u03c7\u03b9\u03ba\u03ae \u03bf\u03b8\u03cc\u03bd\u03b7 \u03c9\u03c2 \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ae (PWA)."],
      ["\u0395\u03af\u03bd\u03b1\u03b9 \u03c0\u03c1\u03b1\u03b3\u03bc\u03b1\u03c4\u03b9\u03ba\u03ac \u03b4\u03c9\u03c1\u03b5\u03ac\u03bd, \u03c7\u03c9\u03c1\u03af\u03c2 \u03b4\u03b9\u03b1\u03c6\u03b7\u03bc\u03af\u03c3\u03b5\u03b9\u03c2;",
       "\u039d\u03b1\u03b9. \u03a4\u03bf PokerTH \u03b4\u03b5\u03bd \u03b5\u03bc\u03c6\u03b1\u03bd\u03af\u03b6\u03b5\u03b9 \u03b4\u03b9\u03b1\u03c6\u03b7\u03bc\u03af\u03c3\u03b5\u03b9\u03c2, \u03b4\u03b5\u03bd \u03ad\u03c7\u03b5\u03b9 \u03b1\u03b3\u03bf\u03c1\u03ad\u03c2 \u03b5\u03bd\u03c4\u03cc\u03c2 \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ae\u03c2 \u03bf\u03cd\u03c4\u03b5 \u03ba\u03c1\u03c5\u03c6\u03ac \u03ba\u03cc\u03c3\u03c4\u03b7. \u0395\u03af\u03bd\u03b1\u03b9 \u03bb\u03bf\u03b3\u03b9\u03c3\u03bc\u03b9\u03ba\u03cc \u03b1\u03bd\u03bf\u03b9\u03ba\u03c4\u03bf\u03cd \u03ba\u03ce\u03b4\u03b9\u03ba\u03b1 \u03c0\u03bf\u03c5 \u03b1\u03bd\u03b1\u03c0\u03c4\u03cd\u03c3\u03c3\u03b5\u03c4\u03b1\u03b9 \u03b1\u03c0\u03cc \u03b5\u03b8\u03b5\u03bb\u03bf\u03bd\u03c4\u03ad\u03c2, \u03ba\u03b1\u03b9 \u03cc\u03bb\u03b5\u03c2 \u03bf\u03b9 \u03bc\u03ac\u03c1\u03ba\u03b5\u03c2 \u03b5\u03af\u03bd\u03b1\u03b9 \u03c0\u03bb\u03b1\u03c3\u03bc\u03b1\u03c4\u03b9\u03ba\u03ad\u03c2."],
      ["\u039c\u03c0\u03bf\u03c1\u03ce \u03bd\u03b1 \u03c0\u03b1\u03af\u03be\u03c9 Texas Hold\u2019em \u03bc\u03b5 \u03ac\u03bb\u03bb\u03bf\u03c5\u03c2 \u03b1\u03bd\u03b8\u03c1\u03ce\u03c0\u03bf\u03c5\u03c2 \u03bc\u03ad\u03c3\u03b1 \u03b1\u03c0\u03cc \u03c4\u03bf\u03bd \u03c6\u03c5\u03bb\u03bb\u03bf\u03bc\u03b5\u03c4\u03c1\u03b7\u03c4\u03ae;",
       "\u039d\u03b1\u03b9. \u03a3\u03c5\u03bd\u03b4\u03b5\u03b8\u03b5\u03af\u03c4\u03b5 \u03c3\u03c4\u03bf \u03b5\u03c0\u03af\u03c3\u03b7\u03bc\u03bf \u03b4\u03af\u03ba\u03c4\u03c5\u03bf pokerth.net \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03c0\u03b1\u03af\u03be\u03b5\u03c4\u03b5 \u03bc\u03b5 \u03c0\u03b1\u03af\u03ba\u03c4\u03b5\u03c2 \u03b1\u03c0\u03cc \u03cc\u03bb\u03bf \u03c4\u03bf\u03bd \u03ba\u03cc\u03c3\u03bc\u03bf, \u03ae \u03c3\u03c4\u03b5\u03af\u03bb\u03c4\u03b5 \u03ad\u03bd\u03b1\u03bd \u03c3\u03cd\u03bd\u03b4\u03b5\u03c3\u03bc\u03bf \u03c0\u03c1\u03cc\u03c3\u03ba\u03bb\u03b7\u03c3\u03b7\u03c2 \u03ce\u03c3\u03c4\u03b5 \u03bf\u03b9 \u03c6\u03af\u03bb\u03bf\u03b9 \u03c3\u03b1\u03c2 \u03bd\u03b1 \u03b2\u03c1\u03b5\u03b8\u03bf\u03cd\u03bd \u03ba\u03b1\u03c4\u03b5\u03c5\u03b8\u03b5\u03af\u03b1\u03bd \u03c3\u03c4\u03bf \u03c4\u03c1\u03b1\u03c0\u03ad\u03b6\u03b9 \u03c3\u03b1\u03c2 \u2014 \u03cc\u03bb\u03b1 \u03bc\u03ad\u03c3\u03b1 \u03c3\u03c4\u03bf\u03bd \u03c6\u03c5\u03bb\u03bb\u03bf\u03bc\u03b5\u03c4\u03c1\u03b7\u03c4\u03ae."],
      ["\u03a7\u03c1\u03b5\u03b9\u03ac\u03b6\u03bf\u03bc\u03b1\u03b9 \u03bb\u03bf\u03b3\u03b1\u03c1\u03b9\u03b1\u03c3\u03bc\u03cc \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03c0\u03b1\u03af\u03be\u03c9;",
       "\u0393\u03b9\u03b1 \u03b5\u03be\u03ac\u03c3\u03ba\u03b7\u03c3\u03b7 \u03c7\u03c9\u03c1\u03af\u03c2 \u03c3\u03cd\u03bd\u03b4\u03b5\u03c3\u03b7 \u03b1\u03c0\u03ad\u03bd\u03b1\u03bd\u03c4\u03b9 \u03c3\u03c4\u03bf\u03bd \u03c5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae \u03b4\u03b5\u03bd \u03c7\u03c1\u03b5\u03b9\u03ac\u03b6\u03b5\u03c4\u03b1\u03b9 \u03bb\u03bf\u03b3\u03b1\u03c1\u03b9\u03b1\u03c3\u03bc\u03cc\u03c2. \u0393\u03b9\u03b1 \u03bd\u03b1 \u03c0\u03b1\u03af\u03be\u03b5\u03c4\u03b5 \u03c3\u03c4\u03bf \u03b5\u03c0\u03af\u03c3\u03b7\u03bc\u03bf \u03b4\u03af\u03ba\u03c4\u03c5\u03bf pokerth.net \u03c7\u03c1\u03b5\u03b9\u03ac\u03b6\u03b5\u03c3\u03c4\u03b5 \u03ad\u03bd\u03b1\u03bd \u03b4\u03c9\u03c1\u03b5\u03ac\u03bd \u03bb\u03bf\u03b3\u03b1\u03c1\u03b9\u03b1\u03c3\u03bc\u03cc pokerth.net."],
      ["\u039b\u03b5\u03b9\u03c4\u03bf\u03c5\u03c1\u03b3\u03b5\u03af \u03c3\u03b5 \u03ba\u03b9\u03bd\u03b7\u03c4\u03cc;",
       "\u039d\u03b1\u03b9. \u039f \u03b4\u03b9\u03b1\u03b4\u03b9\u03ba\u03c4\u03c5\u03b1\u03ba\u03cc\u03c2 \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7\u03c2 \u03b5\u03af\u03bd\u03b1\u03b9 Progressive Web App: \u03bb\u03b5\u03b9\u03c4\u03bf\u03c5\u03c1\u03b3\u03b5\u03af \u03c3\u03b5 \u03ba\u03ac\u03b8\u03b5 \u03c3\u03cd\u03b3\u03c7\u03c1\u03bf\u03bd\u03bf \u03c6\u03c5\u03bb\u03bb\u03bf\u03bc\u03b5\u03c4\u03c1\u03b7\u03c4\u03ae \u03c3\u03b5 \u03c5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae, \u03c4\u03ac\u03bc\u03c0\u03bb\u03b5\u03c4 \u03ae \u03c4\u03b7\u03bb\u03ad\u03c6\u03c9\u03bd\u03bf \u03ba\u03b1\u03b9 \u03bc\u03c0\u03bf\u03c1\u03b5\u03af \u03bd\u03b1 \u03b5\u03b3\u03ba\u03b1\u03c4\u03b1\u03c3\u03c4\u03b1\u03b8\u03b5\u03af \u03c3\u03c4\u03b7\u03bd \u03b1\u03c1\u03c7\u03b9\u03ba\u03ae \u03bf\u03b8\u03cc\u03bd\u03b7 \u03c3\u03b1\u03bd \u03ba\u03b1\u03bd\u03bf\u03bd\u03b9\u03ba\u03ae \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ae."],
      ["\u039c\u03c0\u03bf\u03c1\u03ce \u03bd\u03b1 \u03c0\u03b1\u03af\u03be\u03c9 \u03b5\u03bd\u03b1\u03bd\u03c4\u03af\u03bf\u03bd \u03c4\u03bf\u03c5 \u03c5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae;",
       "\u039d\u03b1\u03b9. \u0397 \u03bb\u03b5\u03b9\u03c4\u03bf\u03c5\u03c1\u03b3\u03af\u03b1 \u03c7\u03c9\u03c1\u03af\u03c2 \u03c3\u03cd\u03bd\u03b4\u03b5\u03c3\u03b7 \u03c3\u03ac\u03c2 \u03b5\u03c0\u03b9\u03c4\u03c1\u03ad\u03c0\u03b5\u03b9 \u03bd\u03b1 \u03c0\u03b1\u03af\u03be\u03b5\u03c4\u03b5 \u03bf\u03bb\u03cc\u03ba\u03bb\u03b7\u03c1\u03b1 \u03c4\u03bf\u03c5\u03c1\u03bd\u03bf\u03c5\u03ac \u03b5\u03bd\u03b1\u03bd\u03c4\u03af\u03bf\u03bd \u03b1\u03bd\u03c4\u03b9\u03c0\u03ac\u03bb\u03c9\u03bd \u03c4\u03bf\u03c5 \u03c5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae, \u03c7\u03c9\u03c1\u03af\u03c2 \u03ba\u03b1\u03bc\u03af\u03b1 \u03c3\u03cd\u03bd\u03b4\u03b5\u03c3\u03b7 \u03c3\u03c4\u03bf \u03b4\u03b9\u03b1\u03b4\u03af\u03ba\u03c4\u03c5\u03bf \u03bc\u03cc\u03bb\u03b9\u03c2 \u03c6\u03bf\u03c1\u03c4\u03c9\u03b8\u03b5\u03af \u03b7 \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ae."],
      ["\u0395\u03af\u03bd\u03b1\u03b9 \u03b1\u03c5\u03c4\u03cc\u03c2 \u03bf \u03b5\u03c0\u03af\u03c3\u03b7\u03bc\u03bf\u03c2 \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7\u03c2 \u03c4\u03bf\u03c5 PokerTH;",
       "\u0395\u03af\u03bd\u03b1\u03b9 \u03b7 \u03ad\u03ba\u03b4\u03bf\u03c3\u03b7 \u03c4\u03bf\u03c5 PokerTH \u03b3\u03b9\u03b1 \u03c6\u03c5\u03bb\u03bb\u03bf\u03bc\u03b5\u03c4\u03c1\u03b7\u03c4\u03ae, \u03c0\u03bf\u03c5 \u03b1\u03bd\u03b1\u03c0\u03c4\u03cd\u03c3\u03c3\u03b5\u03c4\u03b1\u03b9 \u03bc\u03ad\u03c3\u03b1 \u03c3\u03c4\u03bf \u03ad\u03c1\u03b3\u03bf PokerTH \u03b1\u03c0\u03cc \u03c4\u03b7\u03bd PokerTH Development Team, \u03b4\u03af\u03c0\u03bb\u03b1 \u03c3\u03c4\u03bf\u03bd \u03ba\u03bb\u03b1\u03c3\u03b9\u03ba\u03cc \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7 \u03c5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae."],
      ["\u03a0\u03bf\u03b9\u03b1 \u03b5\u03af\u03bd\u03b1\u03b9 \u03b7 \u03b4\u03b9\u03b1\u03c6\u03bf\u03c1\u03ac \u03bc\u03b5 \u03c4\u03bf\u03bd \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7 \u03c5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae;",
       "\u038a\u03b4\u03b9\u03bf \u03c0\u03b1\u03b9\u03c7\u03bd\u03af\u03b4\u03b9, \u03af\u03b4\u03b9\u03bf\u03b9 \u03ba\u03b1\u03bd\u03cc\u03bd\u03b5\u03c2, \u03af\u03b4\u03b9\u03bf \u03b4\u03af\u03ba\u03c4\u03c5\u03bf pokerth.net \u2014 \u03b1\u03c0\u03bb\u03ce\u03c2 \u03c4\u03c1\u03ad\u03c7\u03b5\u03b9 \u03b1\u03c0\u03b5\u03c5\u03b8\u03b5\u03af\u03b1\u03c2 \u03c3\u03c4\u03bf\u03bd \u03c6\u03c5\u03bb\u03bb\u03bf\u03bc\u03b5\u03c4\u03c1\u03b7\u03c4\u03ae, \u03c7\u03c9\u03c1\u03af\u03c2 \u03b5\u03b3\u03ba\u03b1\u03c4\u03ac\u03c3\u03c4\u03b1\u03c3\u03b7, \u03c3\u03b5 \u03bf\u03c0\u03bf\u03b9\u03bf\u03b4\u03ae\u03c0\u03bf\u03c4\u03b5 \u03bb\u03b5\u03b9\u03c4\u03bf\u03c5\u03c1\u03b3\u03b9\u03ba\u03cc \u03c3\u03cd\u03c3\u03c4\u03b7\u03bc\u03b1."],
      ["\u03a0\u03bf\u03b9\u03b5\u03c2 \u03b3\u03bb\u03ce\u03c3\u03c3\u03b5\u03c2 \u03c5\u03c0\u03bf\u03c3\u03c4\u03b7\u03c1\u03af\u03b6\u03bf\u03bd\u03c4\u03b1\u03b9;",
       "\u0397 \u03b4\u03b9\u03b5\u03c0\u03b1\u03c6\u03ae \u03b5\u03af\u03bd\u03b1\u03b9 \u03b4\u03b9\u03b1\u03b8\u03ad\u03c3\u03b9\u03bc\u03b7 \u03c3\u03b5 45 \u03b3\u03bb\u03ce\u03c3\u03c3\u03b5\u03c2. \u039f\u03b9 \u03cc\u03c1\u03bf\u03b9 \u03b4\u03c1\u03ac\u03c3\u03b7\u03c2 \u03c4\u03bf\u03c5 \u03c0\u03cc\u03ba\u03b5\u03c1 (Fold, Check, Call, Raise, All-In) \u03c0\u03b1\u03c1\u03b1\u03bc\u03ad\u03bd\u03bf\u03c5\u03bd \u03c3\u03c4\u03b1 \u03b1\u03b3\u03b3\u03bb\u03b9\u03ba\u03ac, \u03cc\u03c0\u03c9\u03c2 \u03b5\u03af\u03bd\u03b1\u03b9 \u03b4\u03b9\u03b5\u03b8\u03bd\u03ce\u03c2 \u03ba\u03b1\u03b8\u03b9\u03b5\u03c1\u03c9\u03bc\u03ad\u03bd\u03bf."],
      ["\u0395\u03bc\u03c0\u03bb\u03ad\u03ba\u03bf\u03bd\u03c4\u03b1\u03b9 \u03c0\u03c1\u03b1\u03b3\u03bc\u03b1\u03c4\u03b9\u03ba\u03ac \u03c7\u03c1\u03ae\u03bc\u03b1\u03c4\u03b1;",
       "\u038c\u03c7\u03b9. \u03a4\u03bf PokerTH \u03c0\u03b1\u03af\u03b6\u03b5\u03c4\u03b1\u03b9 \u03b1\u03c0\u03bf\u03ba\u03bb\u03b5\u03b9\u03c3\u03c4\u03b9\u03ba\u03ac \u03bc\u03b5 \u03c0\u03bb\u03b1\u03c3\u03bc\u03b1\u03c4\u03b9\u03ba\u03ad\u03c2 \u03bc\u03ac\u03c1\u03ba\u03b5\u03c2. \u039f\u03b9 \u03bc\u03ac\u03c1\u03ba\u03b5\u03c2 \u03b4\u03b5\u03bd \u03ad\u03c7\u03bf\u03c5\u03bd \u03c7\u03c1\u03b7\u03bc\u03b1\u03c4\u03b9\u03ba\u03ae \u03b1\u03be\u03af\u03b1 \u03ba\u03b1\u03b9 \u03b4\u03b5\u03bd \u03b1\u03b3\u03bf\u03c1\u03ac\u03b6\u03bf\u03bd\u03c4\u03b1\u03b9 \u03bf\u03cd\u03c4\u03b5 \u03c0\u03c9\u03bb\u03bf\u03cd\u03bd\u03c4\u03b1\u03b9."],
      ["\u03a4\u03b9 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03c3\u03c5\u03bb\u03bb\u03ad\u03b3\u03b5\u03b9 \u03bf \u03b4\u03b9\u03b1\u03b4\u03b9\u03ba\u03c4\u03c5\u03b1\u03ba\u03cc\u03c2 \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7\u03c2;",
       "\u038c\u03c3\u03bf \u03c4\u03bf \u03b4\u03c5\u03bd\u03b1\u03c4\u03cc\u03bd \u03bb\u03b9\u03b3\u03cc\u03c4\u03b5\u03c1\u03b1: \u03bf\u03b9 \u03c1\u03c5\u03b8\u03bc\u03af\u03c3\u03b5\u03b9\u03c2 \u03c3\u03b1\u03c2 \u03c0\u03b1\u03c1\u03b1\u03bc\u03ad\u03bd\u03bf\u03c5\u03bd \u03c3\u03c4\u03bf\u03bd \u03c6\u03c5\u03bb\u03bb\u03bf\u03bc\u03b5\u03c4\u03c1\u03b7\u03c4\u03ae \u03c3\u03b1\u03c2 \u03ba\u03b1\u03b9 \u03b4\u03b5\u03bd \u03c7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03b9\u03b5\u03af\u03c4\u03b1\u03b9 \u03ba\u03b1\u03bc\u03af\u03b1 \u03c0\u03b1\u03c1\u03b1\u03ba\u03bf\u03bb\u03bf\u03cd\u03b8\u03b7\u03c3\u03b7 \u03ae \u03b4\u03b9\u03b1\u03c6\u03ae\u03bc\u03b9\u03c3\u03b7. \u0394\u03b5\u03af\u03c4\u03b5 \u03c4\u03b7 \u03c3\u03b5\u03bb\u03af\u03b4\u03b1 \u03b1\u03c0\u03bf\u03c1\u03c1\u03ae\u03c4\u03bf\u03c5 \u03b3\u03b9\u03b1 \u03bb\u03b5\u03c0\u03c4\u03bf\u03bc\u03ad\u03c1\u03b5\u03b9\u03b5\u03c2."],
      ["\u039c\u03c0\u03bf\u03c1\u03ce \u03bd\u03b1 \u03c3\u03c4\u03ae\u03c3\u03c9 \u03b4\u03b9\u03ba\u03cc \u03bc\u03bf\u03c5 \u03b4\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ae;",
       "\u039d\u03b1\u03b9. \u03a4\u03cc\u03c3\u03bf \u03bf \u03b1\u03c0\u03bf\u03ba\u03bb\u03b5\u03b9\u03c3\u03c4\u03b9\u03ba\u03cc\u03c2 \u03b4\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ae\u03c2 PokerTH \u03cc\u03c3\u03bf \u03ba\u03b1\u03b9 \u03b1\u03c5\u03c4\u03cc\u03c2 \u03bf \u03b4\u03b9\u03b1\u03b4\u03b9\u03ba\u03c4\u03c5\u03b1\u03ba\u03cc\u03c2 \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7\u03c2 \u03b5\u03af\u03bd\u03b1\u03b9 \u03b1\u03bd\u03bf\u03b9\u03ba\u03c4\u03bf\u03cd \u03ba\u03ce\u03b4\u03b9\u03ba\u03b1, \u03bf\u03c0\u03cc\u03c4\u03b5 \u03bc\u03c0\u03bf\u03c1\u03b5\u03af\u03c4\u03b5 \u03bd\u03b1 \u03bb\u03b5\u03b9\u03c4\u03bf\u03c5\u03c1\u03b3\u03b5\u03af\u03c4\u03b5 \u03b4\u03b9\u03ba\u03cc \u03c3\u03b1\u03c2 \u03b9\u03b4\u03b9\u03c9\u03c4\u03b9\u03ba\u03cc \u03b4\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ae \u03c0\u03cc\u03ba\u03b5\u03c1, \u03c3\u03b5 \u03c4\u03bf\u03c0\u03b9\u03ba\u03cc \u03b4\u03af\u03ba\u03c4\u03c5\u03bf \u03ae \u03c3\u03c4\u03bf \u03b4\u03b9\u03b1\u03b4\u03af\u03ba\u03c4\u03c5\u03bf."],
    ]
  },
};

// Languages a given content page is actually available in, English first.
function seoPageLangs(table) {
  var out = ['en'];
  for (var code in table) { if (code !== 'en' && SEO_I18N[code]) out.push(code); }
  return out;
}

// hreflang set for a content page, restricted to the languages it exists in.
// Returns '' for an English-only page: a single-language page advertising
// nothing is correct, whereas a self-referencing hreflang of one is noise.
function seoPageAlternates(base, relPath, langs) {
  if (!base || langs.length < 2) return '';
  var href = function (c) { return base + relPath + (c === 'en' ? '' : '?lang=' + c); };
  var out = '<link rel="alternate" hreflang="x-default" href="' + href('en') + '">';
  for (var i = 0; i < langs.length; i++) {
    out += '<link rel="alternate" hreflang="' + langs[i] + '" href="' + href(langs[i]) + '">';
  }
  for (var a in SEO_HREFLANG_ALIAS) {
    var t = SEO_HREFLANG_ALIAS[a] || 'en';
    if (langs.indexOf(t) !== -1) out += '<link rel="alternate" hreflang="' + a + '" href="' + href(t) + '">';
  }
  return out;
}

function seoContentPage(res, method, title, desc, relPath, bodyHtml, ld, lang, langs) {
  var on = seoEnabled(), base = on ? seoPublicUrl() : '';
  lang = lang || '';
  langs = langs || ['en'];
  // Self-canonical: the language variant points at itself, never at English,
  // or the variants would be de-indexed in favour of the page they alias.
  var url = base ? base + relPath + (lang ? '?lang=' + lang : '') : '';
  var _im = seoImage(base), img = _im.url;
  var head;
  if (on) {
    // Breadcrumbs: Google renders the trail in place of the raw URL, and it
    // is the only structured hint that these pages belong to the app rather
    // than floating on their own.
    var crumbs = url ? {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'PokerTH Web Client', item: base + '/' + (lang ? '?lang=' + lang : '') },
        { '@type': 'ListItem', position: 2, name: title, item: url }
      ]
    } : null;
    head = '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">' +
      '<meta name="description" content="' + desc + '">' +
      (url ? '<link rel="canonical" href="' + url + '">' : '') +
      seoPageAlternates(base, relPath, langs) +
      '<meta property="og:type" content="article"><meta property="og:site_name" content="' + _seoAttr(seoSiteName()) + '">' +
      '<meta property="og:title" content="' + title + '">' +
      '<meta property="og:description" content="' + desc + '">' +
      (url ? '<meta property="og:url" content="' + url + '">' : '') +
      (OG_LOCALE[lang || 'en'] ? '<meta property="og:locale" content="' + OG_LOCALE[lang || 'en'] + '">' : '') +
      // Without these a shared /rules or /faq link showed as a bare URL in
      // Discord, WhatsApp and X — the home page had cards, these did not.
      (img ? '<meta property="og:image" content="' + _seoAttr(img) + '">' +
             (_im.sized ? '<meta property="og:image:width" content="1200">' +
                          '<meta property="og:image:height" content="630">' : '') +
             '<meta property="og:image:alt" content="' + title + '">' : '') +
      '<meta name="twitter:card" content="' + (img ? 'summary_large_image' : 'summary') + '">' +
      '<meta name="twitter:title" content="' + title + '">' +
      '<meta name="twitter:description" content="' + desc + '">' +
      (img ? '<meta name="twitter:image" content="' + _seoAttr(img) + '">' : '') +
      (ld ? '<script type="application/ld+json">' + JSON.stringify(ld) + '</script>' : '') +
      (crumbs ? '<script type="application/ld+json">' + JSON.stringify(crumbs) + '</script>' : '');
  } else {
    head = '<meta name="robots" content="noindex, nofollow">';
  }
  var html = '<!DOCTYPE html><html lang="' + (lang || 'en') + '"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>' + title + '</title>' + head + '<style>' + _SEO_PAGE_CSS + '</style></head><body>' +
    _seoPageNav() + '<main>' + bodyHtml +
    '<a class="play" href="/' + (lang ? '?lang=' + lang : '') + '">Play PokerTH in your browser \u2014 free, no download</a>' +
    '</main></body></html>';
  var buf = Buffer.from(html, 'utf8');
  res.writeHead(200, Object.assign({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache, must-revalidate', 'Content-Length': buf.length }, SECURITY_HEADERS));
  if (method === 'HEAD') { res.end(); return; }
  res.end(buf);
}

// Sitemap entries for a content page and each language it exists in. The
// xhtml:link set matches the one the page itself serves, per Google's rule
// that the two must agree.
function _seoPageUrls(base, relPath, langs, freq, prio) {
  var href = function (c) { return base + relPath + (c === 'en' ? '' : '?lang=' + c); };
  // These pages are rendered from tables inside proxy.js, so its mtime is
  // exactly when their text last changed.
  var lm = seoLastModSelf();
  var alt = '';
  if (langs.length > 1) {
    alt = '<xhtml:link rel="alternate" hreflang="x-default" href="' + href('en') + '"/>';
    for (var i = 0; i < langs.length; i++) {
      alt += '<xhtml:link rel="alternate" hreflang="' + langs[i] + '" href="' + href(langs[i]) + '"/>';
    }
    for (var a in SEO_HREFLANG_ALIAS) {
      var t = SEO_HREFLANG_ALIAS[a] || 'en';
      if (langs.indexOf(t) !== -1) alt += '<xhtml:link rel="alternate" hreflang="' + a + '" href="' + href(t) + '"/>';
    }
  }
  var out = '';
  for (var k = 0; k < langs.length; k++) {
    out += '<url><loc>' + href(langs[k]) + '</loc>' + (lm ? '<lastmod>' + lm + '</lastmod>' : '') + alt + '<changefreq>' + freq + '</changefreq><priority>' + prio + '</priority></url>\n';
  }
  return out;
}

function seoRulesPage(res, method, lang) {
  // Only English exists so far; a translated language falls back to it until
  // its SEO_RULES_I18N entry lands, and is not advertised in the meantime.
  var langs = seoPageLangs(SEO_RULES_I18N);
  if (langs.indexOf(lang) === -1) lang = '';
  var tr = lang ? SEO_RULES_I18N[lang] : null;
  var body = '<h1>Texas Hold\u2019em Poker Rules</h1>' +
    '<p>PokerTH plays No-Limit Texas Hold\u2019em, the most popular poker variant in the world. ' +
    'Each player tries to make the best five-card hand from two private cards and five shared community cards.</p>' +
    '<h2>The deal and the blinds</h2>' +
    '<p>Every hand starts with two forced bets: the player left of the dealer button posts the <em>small blind</em>, ' +
    'the next player posts the <em>big blind</em>. Each player is then dealt two face-down cards (the <em>hole cards</em>). ' +
    'The dealer button moves one seat clockwise after every hand, and in PokerTH the blinds rise at regular intervals.</p>' +
    '<h2>The four betting rounds</h2>' +
    '<ul>' +
    '<li><strong>Pre-flop</strong> \u2014 after receiving their hole cards, players act in turn, starting left of the big blind.</li>' +
    '<li><strong>Flop</strong> \u2014 three community cards are dealt face up, followed by a betting round.</li>' +
    '<li><strong>Turn</strong> \u2014 a fourth community card is dealt, followed by another betting round.</li>' +
    '<li><strong>River</strong> \u2014 the fifth and last community card is dealt, followed by the final betting round.</li>' +
    '</ul>' +
    '<h2>The actions</h2>' +
    '<ul>' +
    '<li><strong>Fold</strong> \u2014 give up the hand and any chips already bet.</li>' +
    '<li><strong>Check</strong> \u2014 pass the action without betting (only if nobody has bet in the current round).</li>' +
    '<li><strong>Call</strong> \u2014 match the current highest bet.</li>' +
    '<li><strong>Raise</strong> \u2014 increase the current bet. In No-Limit, any amount up to your whole stack.</li>' +
    '<li><strong>All-In</strong> \u2014 bet every chip you have. If others keep betting beyond that, side pots are created ' +
    'so you can only win the part of the pot you contributed to.</li>' +
    '</ul>' +
    '<h2>The showdown</h2>' +
    '<p>If two or more players remain after the river betting round, hands are revealed. The best five-card combination ' +
    'out of the seven available cards (two hole cards + five community cards) wins the pot. Equal hands split the pot.</p>' +
    '<h2>Hand rankings, from strongest to weakest</h2>' +
    '<ol>' +
    '<li><strong>Royal Flush</strong> \u2014 A K Q J 10, all the same suit.</li>' +
    '<li><strong>Straight Flush</strong> \u2014 five consecutive cards of the same suit.</li>' +
    '<li><strong>Four of a Kind</strong> \u2014 four cards of the same rank.</li>' +
    '<li><strong>Full House</strong> \u2014 three of a kind plus a pair.</li>' +
    '<li><strong>Flush</strong> \u2014 five cards of the same suit.</li>' +
    '<li><strong>Straight</strong> \u2014 five consecutive cards of mixed suits.</li>' +
    '<li><strong>Three of a Kind</strong> \u2014 three cards of the same rank.</li>' +
    '<li><strong>Two Pair</strong> \u2014 two different pairs.</li>' +
    '<li><strong>One Pair</strong> \u2014 two cards of the same rank.</li>' +
    '<li><strong>High Card</strong> \u2014 none of the above; the highest card decides.</li>' +
    '</ol>' +
    '<h2>Tournament play in PokerTH</h2>' +
    '<p>PokerTH games are sit-and-go style tournaments: everyone starts with the same stack, blinds increase over time, ' +
    'and the last player holding chips wins. You can practice offline against computer opponents, play on a LAN or a ' +
    'private server, or join the official pokerth.net network with seasonal rankings.</p>';
  var title = 'Texas Hold\u2019em Rules \u2014 PokerTH Web Client';
  var desc = 'Complete Texas Hold\u2019em rules as played in PokerTH: blinds, the four betting rounds, Fold/Check/Call/Raise/All-In, side pots and hand rankings.';
  var headline = 'Texas Hold\u2019em Poker Rules \u2014 PokerTH';
  var ldDesc = 'How to play No-Limit Texas Hold\u2019em: blinds, betting rounds, actions and hand rankings, as played in PokerTH.';
  if (tr) { body = tr.body; title = tr.title; desc = tr.desc; headline = tr.ldHeadline; ldDesc = tr.ldDesc; }
  var ld = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: headline,
    description: ldDesc,
    author: { '@type': 'Organization', name: 'PokerTH Development Team' },
    inLanguage: 'en'
  };
  var base = seoEnabled() ? seoPublicUrl() : '';
  if (base) ld.mainEntityOfPage = base + '/rules' + (lang ? '?lang=' + lang : '');
  if (lang) ld.inLanguage = lang;
  seoContentPage(res, method, title, desc, '/rules', body, ld, lang, langs);
}

var _SEO_FAQ = [
  ['Is PokerTH free?',
   'Yes. PokerTH is free and open-source software (GPL). There is nothing to buy, no ads and no real-money gambling \u2014 all chips are play money.'],
  ['Can I play poker without downloading anything?',
   'Yes. The PokerTH web client runs entirely in your browser \u2014 no download, no installation. Open the site and you are at the table; you can optionally add it to your home screen as an app (PWA).'],
  ['Is it really free, with no ads?',
   'Yes. PokerTH shows no ads, has no in-app purchases and no hidden costs. It is open-source software developed by volunteers, and all chips are play money.'],
  ['Can I play Texas Hold\u2019em in my browser against other people?',
   'Yes. Join the official pokerth.net network to play live Texas Hold\u2019em against players worldwide, or send an invite link so friends land directly at your table \u2014 everything inside the browser.'],
  ['Do I need an account to play?',
   'No account is needed to practice offline against computer opponents. To play online on the official pokerth.net network you need a free pokerth.net account.'],
  ['Does it run on mobile?',
   'Yes. The web client is a Progressive Web App: it runs in any modern browser on desktop, tablet or phone, and can be installed on the home screen like a native app.'],
  ['Can I play against the computer?',
   'Yes. The offline mode lets you play full tournaments against computer opponents without any internet connection once the app is loaded.'],
  ['Is this the official PokerTH client?',
   'It is the browser version of PokerTH, developed within the PokerTH project by the PokerTH Development Team, alongside the classic desktop client.'],
  ['What is the difference with the desktop client?',
   'Same game, same rules, same pokerth.net network \u2014 but it runs directly in the browser with nothing to install, on any operating system.'],
  ['Which languages are supported?',
   'The interface is available in 45 languages. Poker action terms (Fold, Check, Call, Raise, All-In) stay in English, as is international convention.'],
  ['Is real money involved?',
   'No. PokerTH is strictly a play-money game. Chips have no monetary value and cannot be bought or sold.'],
  ['What data does the web client collect?',
   'As little as possible: settings stay in your browser, and no tracking or advertising is used. See the privacy page for details.'],
  ['Can I host my own server?',
   'Yes. The PokerTH dedicated server and this web client are both open source, so you can run your own private poker server on a LAN or on the internet.']
];

function seoFaqPage(res, method, lang) {
  var langs = seoPageLangs(SEO_FAQ_I18N);
  if (langs.indexOf(lang) === -1) lang = '';
  var tr = lang ? SEO_FAQ_I18N[lang] : null;
  // Visible text and FAQPage structured data are both generated from the same
  // question/answer list, so a translation can never say one thing to the
  // reader and another to the crawler \u2014 which is the failure Google
  // penalises hardest on this page type.
  var qa = (tr && tr.qa) || _SEO_FAQ;
  var body = '<h1>' + ((tr && tr.h1) || 'PokerTH Web Client \u2014 Frequently Asked Questions') + '</h1><dl>';
  var ents = [];
  for (var i = 0; i < qa.length; i++) {
    body += '<dt>' + qa[i][0] + '</dt><dd>' + qa[i][1] + '</dd>';
    ents.push({ '@type': 'Question', name: qa[i][0],
      acceptedAnswer: { '@type': 'Answer', text: qa[i][1] } });
  }
  body += '</dl>';
  var ld = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang || 'en', mainEntity: ents };
  seoContentPage(res, method,
    (tr && tr.title) || 'FAQ \u2014 PokerTH Web Client',
    (tr && tr.desc) || 'Frequently asked questions about the PokerTH Web Client: free poker with no ads, playing Texas Hold\u2019em in your browser without any download, accounts, mobile support, offline mode, languages and privacy.',
    '/faq', body, ld, lang, langs);
}

// ── /hand-rankings, /how-to-play, /glossary ───────────────────────
// Three more server-rendered pages, same policy as /rules and /faq: always
// reachable, noindex while the admin toggle is off. They exist because the app
// is an empty shell to a crawler and because "poker hand rankings" is a
// question people actually type — answering it properly is worth more than any
// amount of tuning on a page with no text. Each has its own translation table,
// empty for now, filled in batches exactly like SEO_RULES_I18N.
var SEO_HANDS_I18N = {};
var SEO_HOWTO_I18N = {};
var SEO_GLOSSARY_I18N = {};

// Suit symbols. Red suits get a class rather than a hard-coded colour so the
// page CSS stays the single place that decides what red means.
function _sd(t) { return '<span class="cards">' + t.replace(/([\u2665\u2666])/g, '<span class="rd">$1</span>') + '</span>'; }

var _SEO_HANDS = [
  ['Royal Flush', 'A K Q J 10, all of the same suit. The best possible hand; it cannot be beaten, only tied.',
   'A\u2660 K\u2660 Q\u2660 J\u2660 10\u2660', '0.0032%'],
  ['Straight Flush', 'Five cards in sequence, all of the same suit. Between two straight flushes the higher top card wins.',
   '9\u2665 8\u2665 7\u2665 6\u2665 5\u2665', '0.0279%'],
  ['Four of a Kind', 'Four cards of the same rank. The fifth card (the kicker) settles the rare tie between two identical quads on the board.',
   'Q\u2660 Q\u2665 Q\u2666 Q\u2663 7\u2660', '0.168%'],
  ['Full House', 'Three of a kind plus a pair. The three-card set is compared first, then the pair.',
   'K\u2660 K\u2665 K\u2666 4\u2663 4\u2660', '2.60%'],
  ['Flush', 'Five cards of the same suit, not in sequence. Compared card by card from the top; no suit outranks another.',
   'A\u2666 J\u2666 8\u2666 6\u2666 3\u2666', '3.03%'],
  ['Straight', 'Five cards in sequence, mixed suits. The ace plays high (10-J-Q-K-A) or low (A-2-3-4-5), never both at once.',
   '10\u2663 9\u2666 8\u2660 7\u2665 6\u2663', '4.62%'],
  ['Three of a Kind', 'Three cards of the same rank, plus two unrelated cards.',
   '8\u2660 8\u2665 8\u2663 K\u2666 4\u2660', '4.83%'],
  ['Two Pair', 'Two different pairs plus a fifth card. The higher pair is compared first, then the lower, then the kicker.',
   'J\u2660 J\u2666 5\u2663 5\u2665 A\u2660', '23.5%'],
  ['One Pair', 'Two cards of the same rank plus three unrelated cards, compared in order.',
   '10\u2665 10\u2660 A\u2666 8\u2663 3\u2665', '43.8%'],
  ['High Card', 'None of the above. The highest card decides, then the next, and so on.',
   'A\u2663 Q\u2666 9\u2660 6\u2665 2\u2663', '17.4%']
];

function seoHandsPage(res, method, lang) {
  var langs = seoPageLangs(SEO_HANDS_I18N);
  if (langs.indexOf(lang) === -1) lang = '';
  var tr = lang ? SEO_HANDS_I18N[lang] : null;
  var rows = '';
  for (var i = 0; i < _SEO_HANDS.length; i++) {
    var h = _SEO_HANDS[i];
    rows += '<li><strong>' + h[0] + '</strong> \u2014 ' + h[1] +
      '<br>' + _sd(h[2]) + ' <span style="opacity:.6">\u00b7 dealt in ' + h[3] + ' of seven-card hands</span></li>';
  }
  var body = '<h1>Poker Hand Rankings</h1>' +
    '<p>Texas Hold\u2019em hands are ranked from strongest to weakest as follows. Every hand is exactly five cards, ' +
    'chosen from the seven you can see: your two hole cards and the five community cards. You are never obliged to ' +
    'use your own cards \u2014 if the board itself makes the best five, that is your hand too.</p>' +
    '<ol class="hr">' + rows + '</ol>' +
    '<h2>How ties are settled</h2>' +
    '<p>Compare the category first: any flush beats any straight, whatever the cards. Within the same category, ' +
    'compare rank by rank from the top. What is left over after the combination is called the <em>kicker</em>, and it ' +
    'decides more hands than beginners expect: A\u2660 K\u2666 and A\u2663 7\u2665 both make a pair of aces on an ' +
    'A-9-4 board, but the king outkicks the seven. Suits never break a tie in Hold\u2019em \u2014 two players with the ' +
    'same five ranks split the pot, down to the last chip.</p>' +
    '<h2>Points people get wrong</h2>' +
    '<ul>' +
    '<li>The ace is both the highest and the lowest card for a straight: A-K-Q-J-10 is the best one, A-2-3-4-5 (the ' +
    '<em>wheel</em>) is the worst. It does not wrap around \u2014 Q-K-A-2-3 is nothing at all.</li>' +
    '<li>A flush is five cards of one suit, not four. Four hearts in your hand and on the board is worth nothing on ' +
    'its own.</li>' +
    '<li>Three of a kind made from a pair in your hand plus one on the board is a <em>set</em>; made from one card in ' +
    'your hand plus a pair on the board it is <em>trips</em>. Same ranking, very different strength, because trips ' +
    'are visible to everyone.</li>' +
    '<li>Only the best five count. Holding two pair and a third pair on the board gives you two pair, not three.</li>' +
    '<li>The percentages above are how often each hand appears by the river across seven cards, not how often it ' +
    'wins. Two pair looks common and is still ahead of most of what it meets.</li>' +
    '</ul>' +
    '<h2>Seeing it at the table</h2>' +
    '<p>PokerTH names your current best hand under the board while you play, so you never have to work it out under ' +
    'time pressure, and shows every revealed hand at showdown with the five cards that counted highlighted. Practising ' +
    'offline against the computer opponents is the fastest way to get the rankings into your fingers.</p>';
  var title = 'Poker Hand Rankings \u2014 Texas Hold\u2019em Order of Hands';
  var desc = 'All ten Texas Hold\u2019em poker hands ranked from royal flush to high card, with examples, the odds of ' +
    'making each one, and how kickers and ties are settled.';
  var headline = 'Poker Hand Rankings \u2014 Texas Hold\u2019em';
  var ldDesc = 'The ten Texas Hold\u2019em hand rankings in order, with examples, frequencies and tie-break rules.';
  if (tr) { body = tr.body; title = tr.title; desc = tr.desc; headline = tr.ldHeadline; ldDesc = tr.ldDesc; }
  var base = seoEnabled() ? seoPublicUrl() : '';
  var art = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: headline, description: ldDesc,
    author: { '@type': 'Organization', name: 'PokerTH Development Team' },
    inLanguage: lang || 'en'
  };
  if (base) art.mainEntityOfPage = base + '/hand-rankings' + (lang ? '?lang=' + lang : '');
  // The list itself, so the ranking can be understood without parsing prose.
  // English names only: the ordering is the data, and a translated label adds
  // nothing a crawler can use.
  var list = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Texas Hold\u2019em hand rankings, strongest first',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: _SEO_HANDS.length,
    itemListElement: _SEO_HANDS.map(function (h, n) {
      return { '@type': 'ListItem', position: n + 1, name: h[0], description: h[1] };
    })
  };
  seoContentPage(res, method, title, desc, '/hand-rankings', body, [art, list], lang, langs);
}

var _SEO_HOWTO = [
  ['Open the site \u2014 there is nothing to install',
   'PokerTH runs in the browser. No download, no account, no plugin. On a phone you can add it to the home screen ' +
   'from the browser menu and it opens like an app, full screen and offline-capable.'],
  ['Choose where you want to play',
   'Three modes. <strong>Offline practice</strong> deals you a table of computer opponents straight away and needs no ' +
   'connection at all \u2014 the place to learn. <strong>pokerth.net</strong> is the official network: real opponents, ' +
   'seasonal rankings, a free nickname you register once. <strong>LAN / private server</strong> connects to a ' +
   'dedicated PokerTH server, yours or someone else\u2019s.'],
  ['Sit down at a table',
   'In the lobby you either join a table from the list or create your own. Creating one lets you set the number of ' +
   'seats, the starting stack, how fast the blinds rise and whether the table is password-protected. Share the ' +
   'invitation link and a friend lands directly at your table, in their browser, without registering anything.'],
  ['Play the hand',
   'You are dealt two private cards. Betting goes round the table before the flop, and again after the flop, the turn ' +
   'and the river. When it is your turn the action bar lights up and offers only what is legal: Fold, Check or Call, ' +
   'Raise or All-In. The bet amount can be typed, dragged on the slider, or set with one tap from Min, half the pot, ' +
   'the pot or your whole stack.'],
  ['Read the table',
   'Your best current hand is named under the board as the cards come out. The pot, every stack and the blind level ' +
   'are on screen at all times, the dealer button shows who acts last, and a countdown shows how long you have. At ' +
   'showdown the five cards that made each hand are highlighted.'],
  ['Win the tournament',
   'PokerTH games are sit-and-go tournaments: everyone starts with the same stack, the blinds rise on a timer, and ' +
   'players are knocked out until one holds every chip. Nothing costs money and no chips can be bought \u2014 it is all ' +
   'play money, so the only thing at stake is the game itself.']
];

function seoHowToPage(res, method, lang) {
  var langs = seoPageLangs(SEO_HOWTO_I18N);
  if (langs.indexOf(lang) === -1) lang = '';
  var tr = lang ? SEO_HOWTO_I18N[lang] : null;
  var steps = '';
  for (var i = 0; i < _SEO_HOWTO.length; i++) {
    steps += '<h2>' + (i + 1) + '. ' + _SEO_HOWTO[i][0] + '</h2><p>' + _SEO_HOWTO[i][1] + '</p>';
  }
  var body = '<h1>How to Play Poker Online, Free, in Your Browser</h1>' +
    '<p>This is the short version of getting from a blank tab to a hand of Texas Hold\u2019em in PokerTH. If you want ' +
    'the rules themselves \u2014 blinds, betting rounds, what beats what \u2014 read the <a href="/rules">rules page</a> ' +
    'and the <a href="/hand-rankings">hand rankings</a> first.</p>' +
    steps +
    '<h2>Playing on a phone</h2>' +
    '<p>The table is built for a touch screen as much as a desktop: tapping the bet field opens a keypad inside the ' +
    'action bar instead of the system keyboard, so the table never jumps around, and the slider moves in the same ' +
    'steps as the desktop client. Turn notifications can reach you with Fold and Check/Call buttons on them, so a ' +
    'hand can be played without switching back to the tab.</p>' +
    '<h2>Playing with friends</h2>' +
    '<p>Create a table, set a password if you want it private, and send the invitation link. It opens the table ' +
    'directly \u2014 in the installed app if they have added it to their home screen, in a browser tab otherwise. ' +
    'Nobody needs to install anything or hand over an email address.</p>' +
    '<h2>Common questions</h2>' +
    '<p>No money is ever involved, in any mode. Your settings, style packs and offline progress stay on your own ' +
    'device. The interface is available in 45 languages, while the five action words \u2014 Fold, Check, Call, Raise, ' +
    'All-In \u2014 stay in English, as they are at every table in the world. More in the <a href="/faq">FAQ</a>.</p>';
  var title = 'How to Play Poker Online Free \u2014 PokerTH Web Client';
  var desc = 'Step by step: play free Texas Hold\u2019em poker in your browser with no download and no account \u2014 ' +
    'offline against bots, on the official pokerth.net network, or at a private table with friends.';
  var headline = 'How to play free Texas Hold\u2019em poker in your browser';
  var ldDesc = 'A step-by-step guide to playing free Texas Hold\u2019em in the PokerTH web client.';
  if (tr) { body = tr.body; title = tr.title; desc = tr.desc; headline = tr.ldHeadline; ldDesc = tr.ldDesc; }
  var base = seoEnabled() ? seoPublicUrl() : '';
  var ld = {
    '@context': 'https://schema.org', '@type': 'HowTo',
    name: headline, description: ldDesc,
    totalTime: 'PT3M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '0' },
    inLanguage: lang || 'en',
    step: _SEO_HOWTO.map(function (st, n) {
      return {
        '@type': 'HowToStep', position: n + 1, name: st[0],
        // Structured data wants prose, not markup.
        text: st[1].replace(/<[^>]+>/g, '')
      };
    })
  };
  if (base) ld.url = base + '/how-to-play' + (lang ? '?lang=' + lang : '');
  seoContentPage(res, method, title, desc, '/how-to-play', body, ld, lang, langs);
}

var _SEO_GLOSSARY = [
  ['All-In', 'Betting every chip you have. You can still win only the part of the pot you paid into; the rest goes to a side pot.'],
  ['Ante', 'A small forced bet paid by every player before the deal, on top of the blinds. Used in the later levels of some tournaments.'],
  ['Backdoor', 'A draw that needs both the turn and the river to complete, such as two more hearts for a flush.'],
  ['Bad beat', 'Losing a hand you were heavily favoured to win.'],
  ['Big blind', 'The larger of the two forced bets, posted two seats left of the dealer button. Tournament stacks are usually counted in big blinds.'],
  ['Blinds', 'The two forced bets that start every hand and give the players something to fight over. In PokerTH they rise on a timer.'],
  ['Board', 'The five community cards, shared by everyone.'],
  ['Bubble', 'The point in a tournament just before the paid or ranked places begin.'],
  ['Button', 'The disc marking the nominal dealer. The player on the button acts last after the flop, which is the best seat at the table.'],
  ['Call', 'Matching the current bet, no more.'],
  ['Check', 'Passing the action without betting. Only possible when nobody has bet in the current round.'],
  ['Check-raise', 'Checking, then raising after someone else bets. A way of building a pot with a strong hand.'],
  ['Community cards', 'The five face-up cards every player may use, dealt as the flop, the turn and the river.'],
  ['Connectors', 'Two hole cards of consecutive rank, such as 8-9. Suited connectors share a suit as well.'],
  ['Draw', 'An incomplete hand that needs one or more cards to become strong \u2014 four to a flush, four to a straight.'],
  ['Drawing dead', 'Holding a draw that cannot win even if it completes.'],
  ['Equity', 'Your share of the pot given the cards still to come \u2014 in effect, how often you win from here.'],
  ['Flop', 'The first three community cards, dealt at once.'],
  ['Fold', 'Giving up the hand, and with it every chip already bet.'],
  ['Freeroll', 'A tournament that costs nothing to enter. In PokerTH every table is one, since there is no money anywhere.'],
  ['Heads-up', 'A hand, or a tournament stage, with only two players left.'],
  ['Hole cards', 'Your two private cards. Also called pocket cards.'],
  ['Kicker', 'The highest card left over after the combination itself, used to break ties between hands of the same rank.'],
  ['Limp', 'Entering the pot before the flop by calling the big blind rather than raising.'],
  ['Muck', 'To discard a hand face down at showdown rather than reveal it.'],
  ['Nuts', 'The best hand possible given the board. It cannot be beaten, only tied.'],
  ['Offsuit', 'Two hole cards of different suits.'],
  ['Outs', 'The cards still in the deck that would give you the winning hand. Nine outs remain for a four-card flush.'],
  ['Overpair', 'A pocket pair higher than any card on the board.'],
  ['Pocket pair', 'Two hole cards of the same rank.'],
  ['Pot', 'The chips at stake in the current hand.'],
  ['Pot odds', 'The price the pot is offering you: what you must call, against what you stand to win.'],
  ['Preflop', 'The first betting round, before any community card is dealt.'],
  ['Rainbow', 'A flop of three different suits, which makes an immediate flush draw impossible.'],
  ['Raise', 'Increasing the current bet. In No-Limit, by any amount up to your whole stack.'],
  ['Re-raise', 'Raising a raise.'],
  ['River', 'The fifth and final community card, and the betting round that follows it.'],
  ['Set', 'Three of a kind made from a pocket pair plus one matching card on the board \u2014 well hidden, unlike trips.'],
  ['Short stack', 'A stack small relative to the blinds, leaving little room to do anything but fold or move all-in.'],
  ['Showdown', 'Revealing the remaining hands after the last betting round to decide who wins.'],
  ['Side pot', 'A separate pot created when a player is all-in and the others keep betting beyond that amount.'],
  ['Sit and go', 'A tournament that starts as soon as the seats are full, rather than at a fixed time. Every PokerTH game is one.'],
  ['Slow play', 'Playing a strong hand weakly to keep opponents in the pot.'],
  ['Small blind', 'The smaller forced bet, posted immediately left of the dealer button.'],
  ['Split pot', 'A pot shared between hands of equal strength. Suits never break the tie in Hold\u2019em.'],
  ['Stack', 'The chips a player has in front of them.'],
  ['Straddle', 'An optional blind raise posted before the deal. Not used in PokerTH.'],
  ['Suited', 'Two hole cards of the same suit.'],
  ['Tilt', 'Playing badly because of frustration, usually after a bad beat.'],
  ['Trips', 'Three of a kind made from one hole card and a pair on the board. Everyone can see two of the three.'],
  ['Turn', 'The fourth community card, and the betting round that follows it.'],
  ['Under the gun', 'The seat that acts first before the flop, immediately left of the big blind.'],
  ['Value bet', 'A bet made to be called by a worse hand, rather than to make anyone fold.'],
  ['Wheel', 'The straight A-2-3-4-5, in which the ace plays low. The weakest straight there is.']
];

function seoGlossaryPage(res, method, lang) {
  var langs = seoPageLangs(SEO_GLOSSARY_I18N);
  if (langs.indexOf(lang) === -1) lang = '';
  var tr = lang ? SEO_GLOSSARY_I18N[lang] : null;
  var dl = '<dl>';
  for (var i = 0; i < _SEO_GLOSSARY.length; i++) {
    dl += '<dt>' + _SEO_GLOSSARY[i][0] + '</dt><dd>' + _SEO_GLOSSARY[i][1] + '</dd>';
  }
  dl += '</dl>';
  var body = '<h1>Poker Glossary \u2014 Texas Hold\u2019em Terms Explained</h1>' +
    '<p>The words you will meet at a Hold\u2019em table, in the chat and in PokerTH itself. The five action words \u2014 ' +
    'Fold, Check, Call, Raise and All-In \u2014 stay in English in every one of the 45 interface languages, because ' +
    'they do at every table in the world.</p>' + dl +
    '<p style="margin-top:1.6em">Still unclear on how a hand actually runs? The <a href="/rules">rules</a> cover it ' +
    'from the blinds to the showdown, and the <a href="/hand-rankings">hand rankings</a> list what beats what.</p>';
  var title = 'Poker Glossary \u2014 Texas Hold\u2019em Terms \u2014 PokerTH';
  var desc = 'What poker terms mean, from all-in to the wheel: blinds, kickers, outs, pot odds, sets and trips, ' +
    'side pots and showdowns, explained in plain language.';
  var headline = 'Poker glossary \u2014 Texas Hold\u2019em terms explained';
  var ldDesc = 'A glossary of Texas Hold\u2019em poker terms, from all-in to the wheel.';
  if (tr) { body = tr.body; title = tr.title; desc = tr.desc; headline = tr.ldHeadline; ldDesc = tr.ldDesc; }
  var base = seoEnabled() ? seoPublicUrl() : '';
  var ld = {
    '@context': 'https://schema.org', '@type': 'DefinedTermSet',
    name: headline, description: ldDesc, inLanguage: lang || 'en',
    hasDefinedTerm: _SEO_GLOSSARY.map(function (g) {
      return { '@type': 'DefinedTerm', name: g[0], description: g[1].replace(/<[^>]+>/g, '') };
    })
  };
  if (base) ld.url = base + '/glossary' + (lang ? '?lang=' + lang : '');
  seoContentPage(res, method, title, desc, '/glossary', body, ld, lang, langs);
}

// Injected-HTML cache: one live variant, keyed on file mtime + SEO state.
// Compressed once (gzip + brotli, moderate quality) like _compCache does.
const _seoHtmlCache = new Map();
let _seoHtmlGen = '';
function sendClientHtml(req, res) {
  const p = path.join(__dirname, 'public', 'pokerth-client.html');
  let st;
  try { st = fs.statSync(p); } catch (e) { res.writeHead(404); res.end('Not found'); return; }
  const on = seoEnabled(), base = on ? seoPublicUrl() : '';
  // One cached variant per language (?lang=xx) within the current generation
  // (mtime + SEO state). A generation change flushes everything; a new
  // language within the same generation just adds one entry (37 max).
  const lang = on ? seoLangFromQuery(req.url) : '';
  // Every SEO field is baked into the served HTML, so the whole block keys the
  // cache — listing fields one by one is how a new one silently serves stale
  // pages until the next deploy.
  const gen = st.mtimeMs + '|' + (on ? '1' : '0') + '|' + (on ? JSON.stringify(_seoAdmin()) : '');
  if (_seoHtmlGen !== gen) { _seoHtmlCache.clear(); _seoHtmlGen = gen; }
  const key = lang || '_';
  let ent = _seoHtmlCache.get(key);
  if (!ent) {
    let html;
    try { html = fs.readFileSync(p, 'utf8'); } catch (e) { res.writeHead(404); res.end('Not found'); return; }
    html = html.replace('<!--__SEO_HEAD__-->', on ? seoHeadBlock(base, lang) : '<meta name="robots" content="noindex, nofollow">');
    html = html.replace('<!--__SEO_BODY__-->', on ? seoBodyBlock(lang) : '');
    html = html.replace('<!--__SEO_FOOTER__-->', on ? seoFooterBlock(lang) : '');
    if (lang) {
      // Localized variant: matching <html lang> and <title>. The i18n module
      // re-syncs <html lang> at boot anyway; this is for crawlers.
      html = html.replace('<html lang="en">', '<html lang="' + lang + '">');
      html = html.replace('<title>PokerTH Web Client</title>', '<title>' + _seoAttr(seoTitleOverride() || SEO_I18N[lang].t) + '</title>');
    } else if (on && seoTitleOverride()) {
      html = html.replace('<title>PokerTH Web Client</title>', '<title>' + _seoAttr(seoTitleOverride()) + '</title>');
    }
    const buf = Buffer.from(html, 'utf8');
    ent = {
      raw: buf,
      gz: zlib.gzipSync(buf),
      br: zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })
    };
    _seoHtmlCache.set(key, ent);
  }
  const headers = Object.assign({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Vary': 'Accept-Encoding'
  }, SECURITY_HEADERS);
  const ae = String(req.headers['accept-encoding'] || '');
  let body = ent.raw;
  if (/\bbr\b/.test(ae)) { body = ent.br; headers['Content-Encoding'] = 'br'; }
  else if (/\bgzip\b/.test(ae)) { body = ent.gz; headers['Content-Encoding'] = 'gzip'; }
  headers['Content-Length'] = body.length;
  res.writeHead(200, headers);
  if (req.method === 'HEAD') { res.end(); return; }
  res.end(body);
}

// First-visit welcome / rules message (operator-authored, per language).
function _welcomeAdmin() { var w = _adminConfig.welcome || {}; return { enabled: !!w.enabled, updatedAt: w.updatedAt || 0, 'default': w['default'] || 'fr', langs: w.langs || {} }; }
function _welcomePublic() { var w = _adminConfig.welcome; if (!w || !w.enabled) return null; return { enabled: true, updatedAt: w.updatedAt || 0, 'default': w['default'] || 'fr', langs: w.langs || {} }; }

// ── Product polls (web-only feature; no QML counterpart) ───────────────────
// The admin authors a short multiple-choice poll ("which feature next?"). Web
// clients that OPTED IN (advanced options, off by default) see the active one
// in a lobby card and may answer once per device. Definitions and tallies live
// in polls.json beside admin-config.json — untracked, preserved across updates.
// Anti-double-vote reuses the same anonymous, client-minted visit id (`vid`)
// already posted to /__visit, kept only as a salted SHA-256 hash: no PII, and
// the raw id never touches disk. It is a fair-use guard, not a secure ballot —
// a determined user can still answer again from another browser.
const POLLS_FILE = process.env.POLLS_FILE || path.join(__dirname, 'polls.json');
let _polls = [];
try {
  const _pl = JSON.parse(fs.readFileSync(POLLS_FILE, 'utf8'));
  if (Array.isArray(_pl)) _polls = _pl;
} catch (e) { /* first run — no poll authored yet */ }
let _pollsSaveTimer = null;
function savePollsSoon() {
  if (_pollsSaveTimer) return;
  _pollsSaveTimer = setTimeout(function () {
    _pollsSaveTimer = null;
    fs.writeFile(POLLS_FILE, JSON.stringify(_polls), function (err) {
      if (err) console.error('[polls] write failed:', err.message);
    });
  }, 1500);
}
// Voter hash salted with the poll id, so the stored data alone cannot correlate
// the same device across two different polls.
function _pollVoterHash(pollId, rawVid) {
  return crypto.createHash('sha256').update(String(pollId) + '|' + String(rawVid)).digest('hex').slice(0, 16);
}
function _pollById(id) { return _polls.find(function (p) { return p && p.id === id; }) || null; }
function _pollActive() { return _polls.find(function (p) { return p && p.enabled; }) || null; }
// Count the stored ballots, ignoring choices whose option no longer exists.
function _pollTally(p) {
  const out = {}, opts = (p && p.options) || [];
  opts.forEach(function (o) { out[o.id] = 0; });
  const v = (p && p.voters) || {};
  let total = 0;
  Object.keys(v).forEach(function (h) {
    if (out[v[h]] !== undefined) { out[v[h]]++; total++; }
  });
  return { tally: out, total: total };
}
// Public projection: question + options in every authored language, and NOT the
// counts — results are revealed only once the client has answered, so figures on
// screen cannot bias the answer.
function _pollPublic() {
  const p = _pollActive();
  if (!p) return null;
  return {
    id: p.id, updatedAt: p.updatedAt || 0, 'default': p['default'] || 'en',
    question: p.question || {},
    options: (p.options || []).map(function (o) { return { id: o.id, label: o.label || {} }; })
  };
}
// Admin projection: the same, plus live counts.
function _pollAdmin(p) {
  const t = _pollTally(p);
  return {
    id: p.id, enabled: !!p.enabled, 'default': p['default'] || 'en',
    question: p.question || {},
    options: (p.options || []).map(function (o) { return { id: o.id, label: o.label || {} }; }),
    tally: t.tally, total: t.total, createdAt: p.createdAt || 0, updatedAt: p.updatedAt || 0
  };
}
// Multilingual map { lang: text }, trimmed exactly like the welcome message.
function _pollLangMap(src, max) {
  const out = {};
  if (!src || typeof src !== 'object') return out;
  Object.keys(src).slice(0, 60).forEach(function (k) {
    const s = (typeof src[k] === 'string' ? src[k] : '').trim().slice(0, max);
    if (s) out[String(k).slice(0, 10)] = s;
  });
  return out;
}
// 2..10 options, each with at least one label; ids stay unique (a duplicate id
// would silently merge two options' counts). Returns null when invalid.
function _pollParseOptions(src) {
  if (!Array.isArray(src)) return null;
  const out = [], seen = {};
  src.slice(0, 10).forEach(function (o, i) {
    if (!o || typeof o !== 'object') return;
    const label = _pollLangMap(o.label, 120);
    if (!Object.keys(label).length) return;
    const id = (typeof o.id === 'string' && /^[a-z0-9_]{1,16}$/.test(o.id)) ? o.id : ('o' + (i + 1));
    out.push({ id: id, label: label });
  });
  for (let i = 0; i < out.length; i++) {
    if (seen[out[i].id]) return null;
    seen[out[i].id] = 1;
  }
  return out.length >= 2 ? out : null;
}

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
// ISO-8601 week key, e.g. 2026-W34. The week starts on Monday and belongs to
// the year of its Thursday, which is what stops 1 January from landing in week
// 1 of the wrong year: 2027-01-01 is a Friday and belongs to 2026-W53. Without
// that rule the marker would flip twice in a row at every new year and wipe the
// leaderboard a week early.
function isoWeekKey(when) {
  const t = new Date(when.getFullYear(), when.getMonth(), when.getDate());
  const dayIdx = (t.getDay() + 6) % 7;                 // Monday = 0
  t.setDate(t.getDate() - dayIdx + 3);                 // the Thursday of that week
  const isoYear = t.getFullYear();
  const jan4 = new Date(isoYear, 0, 4);                // always in week 1
  const jan4Idx = (jan4.getDay() + 6) % 7;
  const week1Monday = new Date(isoYear, 0, 4 - jan4Idx);
  // Rounding absorbs the hour a daylight-saving change adds or removes.
  const week = 1 + Math.round((t - week1Monday) / 604800000);
  return isoYear + '-W' + String(week).padStart(2, '0');
}
function statsPeriodKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (STATS_RESET_PERIOD === 'daily')   return y + '-' + m + '-' + day;
  if (STATS_RESET_PERIOD === 'weekly')  return isoWeekKey(d);
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
// Une seule definition du magasin vide, utilisee au demarrage ET par la remise
// a zero. Les deux listes avaient diverge: la remise a zero omettait music,
// musicSince et hourSince, qui survivaient donc a un « efface tout » — un
// compteur de lectures qui repart avec l'ancien total est pire qu'un compteur
// qui se trompe, parce que rien ne le signale.
function emptyVisitsStore() {
  return {
    days: {}, totalV: 0, totalRet: 0, allU: {},
    allM: { pokerthnet: 0, lan: 0, offline: 0 },
    env: {}, envSince: 0, music: {}, musicSince: 0, hourSince: 0
  };
}
let visitsStore = emptyVisitsStore();
try {
  const _vs = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
  if (_vs && typeof _vs === 'object') {
    visitsStore.days   = (_vs.days && typeof _vs.days === 'object') ? _vs.days : {};
    visitsStore.totalV = (typeof _vs.totalV === 'number') ? _vs.totalV : 0;
    visitsStore.allU   = (_vs.allU && typeof _vs.allU === 'object') ? _vs.allU : {};
    visitsStore.totalRet = (typeof _vs.totalRet === 'number') ? _vs.totalRet : 0;
    const _am = (_vs.allM && typeof _vs.allM === 'object') ? _vs.allM : {};
    visitsStore.allM   = { pokerthnet: _am.pokerthnet || 0, lan: _am.lan || 0, offline: _am.offline || 0 };
    visitsStore.env    = (_vs.env && typeof _vs.env === 'object') ? _vs.env : {};
    visitsStore.envSince = (typeof _vs.envSince === 'number') ? _vs.envSince : 0;
    visitsStore.music  = (_vs.music && typeof _vs.music === 'object') ? _vs.music : {};
    visitsStore.musicSince = (typeof _vs.musicSince === 'number') ? _vs.musicSince : 0;
    visitsStore.hourSince = (typeof _vs.hourSince === 'number') ? _vs.hourSince : 0;
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
// Le meme decoupage de journee que visitDayKey, en entier: pratique pour
// comparer deux dates ou compter des jours d'ecart sans repasser par des
// chaines. Les composants sont locaux, l'arithmetique se fait en UTC, donc un
// changement d'heure ne cree ni ne supprime de journee.
function visitDayIndex(d) {
  d = d || new Date();
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}
function visitDayKeyFromIndex(i) {
  const d = new Date(i * 86400000);
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}
// Un identifiant enregistre avant que la date de premiere venue ne soit tenue
// vaut 1: c'est un appareil deja connu, dont on ne saura jamais quand il est
// arrive. Un vrai index vaut plus de vingt mille depuis 2024, d'ou le seuil.
const VISIT_FIRST_UNKNOWN = 1000;
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
// ── Lectures de musique ───────────────────────────────────────────────────
// Le lecteur poste POST /__music { id } chaque fois qu'une piste DÉMARRE — pas
// de reprise après pause, pas de temps d'écoute, pas d'identifiant de visiteur.
// C'est un simple compteur par morceau : ce qu'il faut pour savoir quoi garder
// dans la playlist, et rien de plus.
//
// Les radios sont hors mesure : un flux n'a pas de fin de piste, donc « une
// lecture » n'y voudrait rien dire. L'identifiant est validé contre le
// catalogue servi aux joueurs, ce qui borne la cardinalité sans avoir à
// plafonner quoi que ce soit : un id inventé ne crée jamais de clé.
function musicCountable(id) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) return false;
  try {
    const list = musicListForClient();
    for (let i = 0; i < list.length; i++) if (list[i].id === id && !list[i].stream) return true;
  } catch (e) {}
  return false;
}
function recordMusicPlay(id) {
  if (!musicCountable(id)) return;
  if (!visitsStore.music) visitsStore.music = {};
  visitsStore.music[id] = (visitsStore.music[id] || 0) + 1;
  if (!visitsStore.musicSince) visitsStore.musicSince = Date.now();
  // Série quotidienne, dans le même seau que les visites : même rétention,
  // même purge, un seul fichier à écrire.
  const day = visitDayKey();
  let bucket = visitsStore.days[day];
  if (!bucket) { bucket = visitsStore.days[day] = { v: 0, ids: {} }; pruneVisitDays(); }
  if (!bucket.mu) bucket.mu = {};
  bucket.mu[id] = (bucket.mu[id] || 0) + 1;
  saveVisitsSoon();
}
// Titres à afficher en face des identifiants dans le tableau de bord. Une
// piste retirée du catalogue garde ses écoutes mais perd son titre : on
// retombe alors sur l'identifiant, jamais sur une ligne vide.
function musicPlayTitles() {
  const out = {};
  try {
    musicListForClient().forEach(function (t) { if (t && t.id && !t.stream) out[t.id] = t.title || t.id; });
  } catch (e) {}
  return out;
}

// ── Répartition des visiteurs (navigateur, OS, PWA, langue) ───────────────
// Le compteur de trafic dit combien de visites ; il ne disait pas sur quoi. Ces
// quatre répartitions servent à arbitrer : part réelle d'iOS Safari (où vivent
// la moitié de nos pièges connus), part de l'installation PWA, et lesquelles
// des 45 langues sont réellement utilisées.
//
// Ce sont des totaux cumulés, pas des séries : quatre petits dictionnaires de
// compteurs, alimentés par le même ping anonyme que les visites. Rien de plus
// n'est stocké — pas d'UA brut, pas d'IP.
const UA_OS = [
  [/iPhone/, 'iPhone'], [/iPad/, 'iPad'], [/Android/, 'Android'],
  [/Windows NT/, 'Windows'], [/Mac OS X/, 'macOS'], [/CrOS/, 'ChromeOS'], [/Linux/, 'Linux'],
];
// L'ordre compte : Chrome et Edge annoncent tous deux « Safari », Edge annonce
// « Chrome ». On teste donc du plus spécifique au plus générique.
const UA_BROWSER = [
  [/Edg\//, 'Edge'], [/OPR\/|Opera/, 'Opera'], [/SamsungBrowser/, 'Samsung'],
  [/FxiOS|Firefox\//, 'Firefox'], [/CriOS/, 'Chrome'], [/Chrome\//, 'Chrome'], [/Safari\//, 'Safari'],
];
// Bot-likeness (mesure, jamais filtre) : UA d'automate connu. Combiné plus
// bas avec « en-tête de langue inexploitable » pour estimer la part de bruit
// dans les pings — un ordre de grandeur pour lire les autres répartitions.
// Sous-estime : beaucoup de bots envoient un Accept-Language valide (en-US).
const UA_BOT = /bot|spider|crawl|slurp|curl|wget|python|java\/|go-http|node-fetch|axios|httpclient|headless|phantom|scrapy|libwww|okhttp/i;
function _uaPick(table, ua) {
  for (let i = 0; i < table.length; i++) if (table[i][0].test(ua)) return table[i][1];
  return 'other';
}
function _envBump(key, val) {
  if (!visitsStore.env) visitsStore.env = {};
  const b = visitsStore.env[key] || (visitsStore.env[key] = {});
  // Plafond de cardinalité : une valeur inconnue ne crée pas une clé de plus
  // indéfiniment (l'en-tête Accept-Language est libre côté client).
  if (b[val] === undefined && Object.keys(b).length >= 40) { b.other = (b.other || 0) + 1; return; }
  b[val] = (b[val] || 0) + 1;
}
// Compteur de diagnostic : combien de pings de visite sont réellement arrivés
// depuis le démarrage. Sans lui, une répartition vide a trois explications
// indiscernables — code non déployé, ping jamais émis, ou personne n'est
// passé — et on ne peut que deviner laquelle. En mémoire, non persisté : c'est
// une mesure du processus courant, pas une statistique.
const _pingStats = { boot: Date.now(), n: 0, nMode: 0, nMusic: 0, last: 0 };
function recordVisitEnv(ua, acceptLang, standalone) {
  try {
    ua = String(ua || '');
    const os = _uaPick(UA_OS, ua), br = _uaPick(UA_BROWSER, ua);
    _envBump('os', os);
    _envBump('br', br);
    // Le croisement OS x navigateur est l'unite qui compte vraiment : « iPhone
    // Safari » se teste, « Safari » tout court ne veut pas dire grand-chose
    // quand la moitie de nos pieges connus sont propres a iOS.
    _envBump('combo', os + ' \u00b7 ' + br);
    _envBump('pwa', standalone ? 'standalone' : 'browser');
    if (!visitsStore.envSince) visitsStore.envSince = Date.now();
    // Premier tag de l'en-tête, tronqué à la langue de base (fr-CA → fr).
    const lg = String(acceptLang || '').split(',')[0].trim().slice(0, 12).toLowerCase().split('-')[0];
    const lgv = /^[a-z]{2,3}$/.test(lg) ? lg : 'other';
    _envBump('lang', lgv);
    // Estimation du bruit : UA d'automate OU langue inexploitable. Compté à
    // part dans env.noise ; les compteurs de visites restent intacts.
    _envBump('noise', (UA_BOT.test(ua) || lgv === 'other') ? 'bot-like' : 'clean');
    // Série quotidienne par langue : le cumul dit lesquelles, pas quand. Un
    // petit dictionnaire par jour (même seau que les visites, même rétention,
    // même plafond de cardinalité) suffit à tracer l'évolution dans le temps.
    const day = visitDayKey();
    let bucket = visitsStore.days[day];
    if (!bucket) { bucket = visitsStore.days[day] = { v: 0, ids: {} }; pruneVisitDays(); }
    if (!bucket.lg) bucket.lg = {};
    if (bucket.lg[lgv] === undefined && Object.keys(bucket.lg).length >= 40) bucket.lg.other = (bucket.lg.other || 0) + 1;
    else bucket.lg[lgv] = (bucket.lg[lgv] || 0) + 1;
    saveVisitsSoon();
  } catch (e) {}
}
function recordVisit(rawId) {
  const day = visitDayKey();
  let bucket = visitsStore.days[day];
  if (!bucket) { bucket = visitsStore.days[day] = { v: 0, ids: {} }; pruneVisitDays(); }
  bucket.v++;
  visitsStore.totalV = (visitsStore.totalV || 0) + 1;
  // Heure locale du serveur, une case par heure du jour. Deux compteurs et non
  // un seul : `h` dit quand on vient, `hn` quand on vient POUR LA PREMIERE
  // FOIS. Le creux de la nuit est banal ; un creux ou les nouveaux venus sont
  // malgre tout sur-representes ne l'est pas, et seul le rapport des deux le
  // dit. Aucun horodatage n'est conserve, seulement le total de la case : on ne
  // peut pas remonter d'ici a une visite en particulier.
  const hr = new Date().getHours();
  if (!bucket.h) bucket.h = {};
  bucket.h[hr] = (bucket.h[hr] || 0) + 1;
  if (!visitsStore.hourSince) visitsStore.hourSince = Date.now();
  if (rawId) {
    const h = crypto.createHash('sha256').update(String(rawId)).digest('hex').slice(0, 16);
    const seenBefore = visitsStore.allU[h] !== undefined; // returning device, or brand new?
    if (!bucket.ids) bucket.ids = {};
    bucket.ids[h] = 1;
    // La valeur porte desormais le jour de la premiere venue, ce qui suffit a
    // reconstituer une cohorte: les seaux journaliers disent qui est revenu et
    // quand. Un appareil deja inscrit garde sa valeur — la reecrire ferait
    // passer un habitue pour un nouveau venu du jour.
    if (!seenBefore) visitsStore.allU[h] = visitDayIndex();
    if (seenBefore) { bucket.rt = (bucket.rt || 0) + 1; visitsStore.totalRet = (visitsStore.totalRet || 0) + 1; }
    else {
      bucket.nw = (bucket.nw || 0) + 1;
      if (!bucket.hn) bucket.hn = {};
      bucket.hn[hr] = (bucket.hn[hr] || 0) + 1;
    }
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
// Les 48 dernieres heures, dans l'ordre. La derniere case est l'heure en cours
// et n'est donc pas finie : le tableau de bord la dessine quand meme, mais elle
// ne doit jamais servir de reference pour une comparaison.
function visitHourSeries(nHours) {
  const out = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);
  for (let i = nHours - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600000);
    const b = visitsStore.days[visitDayKey(d)];
    const hh = d.getHours();
    out.push({ t: visitDayKey(d) + 'T' + String(hh).padStart(2, '0'), v: (b && b.h) ? (b.h[hh] || 0) : 0, nw: (b && b.hn) ? (b.hn[hh] || 0) : 0 });
  }
  return out;
}
// Profil moyen d'une journee. `days` compte les jours qui ont VRAIMENT des
// donnees horaires, le jour en cours pour la fraction ecoulee : diviser par un
// nombre de jours entier alors que la journee n'est qu'a moitie faite ecraserait
// tout le profil vers le bas. Un jour anterieur au deploiement n'a pas de seau
// et ne compte donc pas du tout, plutot que de compter comme un jour a zero.
function visitHourProfile(daysBack) {
  const v = new Array(24).fill(0), nw = new Array(24).fill(0);
  const now = new Date();
  let days = 0;
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const b = visitsStore.days[visitDayKey(d)];
    if (!b || !b.h) continue;
    days += (i === 0) ? (now.getHours() + 1) / 24 : 1;
    for (let k = 0; k < 24; k++) {
      v[k] += b.h[k] || 0;
      if (b.hn) nw[k] += b.hn[k] || 0;
    }
  }
  return { v: v, nw: nw, days: Math.round(days * 100) / 100 };
}
// ── Cohortes : qui revient, et combien de jours ───────────────────────────
// Le compteur nouveaux/recurrents dit qu'un appareil est deja venu, jamais
// s'il est revenu APRES sa premiere fois — ce qui est la seule question qui
// compte pour une salle. La date de premiere venue vit dans allU, la presence
// jour par jour dans les seaux : le croisement des deux donne une retention
// exacte, sans mesure supplementaire.
//
// Une cohorte n'est comptee que si elle a eu le temps de revenir : les nouveaux
// d'hier ne peuvent pas figurer dans un « revenu sous 7 jours ». Les
// denominateurs des trois mesures sont donc differents, et c'est voulu.
function visitCohorts(windowDays) {
  const today = visitDayIndex();
  const from = today - windowDays + 1;
  const firsts = visitsStore.allU || {};
  const seen = {};            // index de jour -> identifiants vus ce jour-la
  const activeIn = {};        // identifiant -> jours actifs dans la fenetre
  for (let i = from - 7; i <= today; i++) {
    const b = visitsStore.days[visitDayKeyFromIndex(i)];
    if (!b || !b.ids) continue;
    seen[i] = b.ids;
    if (i >= from) for (const k in b.ids) activeIn[k] = (activeIn[k] || 0) + 1;
  }
  function cameBack(h, a, b2) {
    for (let i = a; i <= b2; i++) { const d = seen[i]; if (d && d[h]) return true; }
    return false;
  }
  const out = {
    window: windowDays, known: 0, since: 0,
    d1: { n: 0, back: 0 }, d3: { n: 0, back: 0 }, d7: { n: 0, back: 0 },
    active: [0, 0, 0, 0, 0, 0, 0, 0],
    newTotal: 0, newDays: 0, estTotal: 0, estDays: 0
  };
  for (const h in firsts) {
    const f = firsts[h];
    // Anterieur a la mesure : la date manque, mais l'appareil est par
    // definition un habitue — il sert de terme de comparaison, pas de cohorte.
    const dated = (typeof f === 'number' && f >= VISIT_FIRST_UNKNOWN);
    if (dated) {
      out.known++;
      if (!out.since || f < out.since) out.since = f;
    }
    if (dated && f >= from && f <= today) {
      if (f <= today - 1) { out.d1.n++; if (cameBack(h, f + 1, f + 1)) out.d1.back++; }
      if (f <= today - 3) { out.d3.n++; if (cameBack(h, f + 1, f + 3)) out.d3.back++; }
      if (f <= today - 7) { out.d7.n++; if (cameBack(h, f + 1, f + 7)) out.d7.back++; }
      const d = activeIn[h] || 1;
      out.active[Math.min(d, 8) - 1]++;
      out.newTotal++; out.newDays += d;
    } else {
      const d = activeIn[h] || 0;
      if (d) { out.estTotal++; out.estDays += d; }
    }
  }
  if (out.since) out.since = visitDayKeyFromIndex(out.since);
  return out;
}
function visitsSummary() {
  const now = new Date();
  const series = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const k = visitDayKey(d);
    const b = visitsStore.days[k];
    series.push({ date: k, v: b ? (b.v || 0) : 0, u: (b && b.ids) ? Object.keys(b.ids).length : 0, nw: b ? (b.nw || 0) : 0, rt: b ? (b.rt || 0) : 0, lg: (b && b.lg) ? b.lg : undefined, mu: (b && b.mu) ? b.mu : undefined });
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
    hours48: visitHourSeries(48),
    hourProfile: visitHourProfile(30),
    hourSince: visitsStore.hourSince || 0,
    cohorts: visitCohorts(30),
    env: visitsStore.env || {},
    envSince: visitsStore.envSince || 0,
    music: visitsStore.music || {},
    musicTitles: musicPlayTitles(),
    musicSince: visitsStore.musicSince || 0,
    pings: { boot: _pingStats.boot, visits: _pingStats.n, modes: _pingStats.nMode, music: _pingStats.nMusic, last: _pingStats.last },
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
      'enabled TINYINT(1) NOT NULL DEFAULT 0, start_at BIGINT DEFAULT NULL, end_at BIGINT DEFAULT NULL, countdown_at BIGINT DEFAULT NULL, max_runs INT DEFAULT NULL, ' +
      'created_at BIGINT DEFAULT NULL, last_run BIGINT DEFAULT NULL, run_count INT NOT NULL DEFAULT 0, ' +
      "target VARCHAR(16) NOT NULL DEFAULT 'all', " +
      'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    // Migration douce pour les tables existantes (MariaDB ; sans IF NOT EXISTS on ignore l'erreur "duplicate column").
    try { await _dbPool.query("ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS target VARCHAR(16) NOT NULL DEFAULT 'all'"); } catch (e) {}
    try { await _dbPool.query('ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS start_at BIGINT DEFAULT NULL'); } catch (e) {}
    try { await _dbPool.query('ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS countdown_at BIGINT DEFAULT NULL'); } catch (e) {}
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
        'INSERT INTO broadcasts (id, message, icon, schedule_json, enabled, start_at, end_at, countdown_at, max_runs, created_at, last_run, run_count, target) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ' +
        'ON DUPLICATE KEY UPDATE message=VALUES(message), icon=VALUES(icon), schedule_json=VALUES(schedule_json), enabled=VALUES(enabled), start_at=VALUES(start_at), end_at=VALUES(end_at), countdown_at=VALUES(countdown_at), max_runs=VALUES(max_runs), created_at=VALUES(created_at), last_run=VALUES(last_run), run_count=VALUES(run_count), target=VALUES(target)',
        [String(j.id).slice(0, 64), (j.message != null ? String(j.message).slice(0, 2000) : null), (j.icon ? String(j.icon).slice(0, 32) : null), JSON.stringify(j.schedule || null), j.enabled ? 1 : 0, (j.startAt != null ? Number(j.startAt) : null), (j.endAt != null ? Number(j.endAt) : null), (j.countdownAt != null ? Number(j.countdownAt) : null), (j.maxRuns != null ? Number(j.maxRuns) : null), (j.createdAt != null ? Number(j.createdAt) : null), (j.lastRun != null ? Number(j.lastRun) : null), Number(j.runCount) || 0, _bcTarget(j.target)]
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
  req.on('end', function () {
    let p; try { p = JSON.parse(body || '{}'); } catch (e) { return cb(null); }
    // Le jeton voyage tantôt en requête, tantôt dans le corps. On garde le corps
    // sous la main pour que le journal d'audit puisse identifier l'auteur sans
    // instrumenter les cinquante points d'entrée un par un.
    try { req._jsonBody = p; } catch (e2) {}
    cb(p);
  });
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
    // Uncompressed assets (audio, images, fonts) honour byte ranges. Safari —
    // iOS above all — refuses to stream an <audio>/<video> element off a plain
    // 200: it needs 206 Partial Content, otherwise it keeps refetching and
    // playback stutters. Content-Length also lets the element report a duration
    // and seek instead of guessing.
    let fst;
    try { fst = fs.statSync(filePath); } catch (e) { res.writeHead(404); res.end('Not found'); return; }
    headers['Accept-Ranges'] = 'bytes';
    const rg = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || '').trim());
    if (rg && (rg[1] !== '' || rg[2] !== '')) {
      let start, end;
      if (rg[1] === '') {                       // suffix form: last N bytes
        start = Math.max(0, fst.size - parseInt(rg[2], 10));
        end = fst.size - 1;
      } else {
        start = parseInt(rg[1], 10);
        end = rg[2] === '' ? fst.size - 1 : Math.min(parseInt(rg[2], 10), fst.size - 1);
      }
      if (!(start >= 0 && start <= end && start < fst.size)) {
        res.writeHead(416, Object.assign({ 'Content-Range': 'bytes */' + fst.size }, headers));
        res.end();
        return;
      }
      headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + fst.size;
      headers['Content-Length'] = end - start + 1;
      res.writeHead(206, headers);
      if (req.method === 'HEAD') { res.end(); return; }
      fs.createReadStream(filePath, { start: start, end: end }).pipe(res);
      return;
    }
    headers['Content-Length'] = fst.size;
    res.writeHead(200, headers);
    if (req.method === 'HEAD') { res.end(); return; }
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
// Version du code RÉELLEMENT en cours d'exécution, figée au démarrage. Le
// tableau de bord lisait jusqu'ici package.json à chaque requête, donc sur le
// disque : après une mise à jour statique (fichiers servis échangés, processus
// intact) il annonçait la nouvelle version alors que proxy.js tournait encore
// sur l'ancienne — et rien ne signalait l'écart. On garde donc les deux.
const BOOT_VERSION = (function () {
  try { return (JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version) || ''; }
  catch (e) { return ''; }
})();
// ── Détection du type d'installation (pm2 / docker / plain) ──
// Le self-update doit s'adapter : pm2 restart n'existe pas dans un conteneur,
// et une image Docker sans git ne peut pas se `git pull` elle-même.
const IS_DOCKER = (function () {
  try { if (fs.existsSync('/.dockerenv')) return true; } catch (e) {}
  try { return /docker|containerd|kubepods/.test(fs.readFileSync('/proc/1/cgroup', 'utf8')); } catch (e) { return false; }
})();
const IS_PM2 = process.env.pm_id !== undefined || !!process.env.PM2_HOME;
const GIT_BRANCH = (process.env.GIT_BRANCH || 'main').replace(/[^A-Za-z0-9._\/-]/g, '');
const GIT_UPDATABLE = (function () {
  try {
    if (!fs.existsSync(path.join(__dirname, '.git'))) return false;
    const genv = Object.assign({}, process.env, { PATH: SAFE_PATH });
    if (spawnSync('git', ['--version'], { stdio: 'ignore', env: genv }).status !== 0) return false;
    // `.git` peut etre un *gitfile* (submodule / worktree) qui pointe hors de
    // l'arborescence visible : le fichier existe, mais git ne peut pas ouvrir le
    // depot. Vu en prod sur un bind-mount de submodule dans un conteneur :
    //   fatal: not a git repository: /app/../.git/modules/webclient
    // On verifie donc que git resout reellement le depot depuis le dossier app,
    // sinon on retombe sur 'docker-image' (self-update refuse proprement).
    const probe = spawnSync('git', ['rev-parse', '--is-inside-work-tree'],
      { cwd: __dirname, encoding: 'utf8', env: genv });
    return probe.status === 0 && String(probe.stdout || '').trim() === 'true';
  } catch (e) { return false; }
})();
// Un checkout provisionne par le conteneur (docker-entrypoint.sh) est shallow :
// pas d'historique commun a fast-forwarder apres un fetch, d'ou une strategie de
// mise a jour differente (resync dur au lieu de merge --ff-only).
const GIT_SHALLOW = (function () {
  if (!GIT_UPDATABLE) return false;
  try {
    const probe = spawnSync('git', ['rev-parse', '--is-shallow-repository'],
      { cwd: __dirname, encoding: 'utf8', env: Object.assign({}, process.env, { PATH: SAFE_PATH }) });
    return probe.status === 0 && String(probe.stdout || '').trim() === 'true';
  } catch (e) { return false; }
})();
function installKind() {
  if (IS_PM2) return IS_DOCKER ? 'docker-pm2' : 'pm2';
  if (IS_DOCKER) return GIT_UPDATABLE ? 'docker-git' : 'docker-image';
  return 'plain';
}
// Segment de redémarrage adapté : pm2 si présent, sinon SIGTERM au process —
// la politique de relance (docker `restart:` / systemd `Restart=`) fait le reste.
// Surcharge possible : UPDATE_RESTART_CMD.
function restartSegment() {
  if (process.env.UPDATE_RESTART_CMD) return process.env.UPDATE_RESTART_CMD;
  if (IS_PM2) return 'pm2 restart ' + PM2_NAME + ' --update-env';
  return 'kill -TERM ' + process.pid + ' 2>/dev/null || kill -TERM 1 2>/dev/null';
}
// Pull robuste : fetch explicite de la branche puis merge ff-only de FETCH_HEAD.
// (Un simple `git pull --ff-only` échoue si le refspec du clone est cassé ou
// single-branch — vu en production : « no such ref was fetched ».)
// Deux manifestes SUIVIS par git sont regeneres au runtime (themes/seats) : on
// les remet a l'etat du depot avant le fetch, sinon le merge refuse d'ecraser
// des « local changes » — meme precaution que install.sh.
function gitPullSegment() {
  const clean = "git checkout -- public/themes/themes.json public/seats/seats.json 2>/dev/null || true";
  if (GIT_SHALLOW) {
    return clean + "; git fetch --depth 1 origin '" + GIT_BRANCH + "' && git checkout -q -f -B '" + GIT_BRANCH + "' FETCH_HEAD";
  }
  return clean + "; git fetch origin '" + GIT_BRANCH + "' && git merge --ff-only FETCH_HEAD";
}
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
  if (process.env.UPDATE_CMD) return process.env.UPDATE_CMD; // surcharge totale (hooks custom)
  const dir = __dirname.replace(/'/g, "'\\''");
  return "sleep 1; cd '" + dir + "' && " + gitPullSegment() + " && npm install --omit=dev --no-audit --no-fund && " + restartSegment();
}
// Static-only self-update: just `git pull` so the served public/ files (client
// build) go live immediately. No npm, no pm2 restart, so open connections are
// never dropped. proxy.js / dependency changes will NOT take effect until a real
// restart — this is meant for static (public/) deploys.
function updateCmdStatic() {
  const dir = __dirname.replace(/'/g, "'\\''");
  return "cd '" + dir + "' && " + gitPullSegment();
}

// ── Historique des déploiements & retour arrière ─────────────────────────────
// Une mise à jour est un aller simple : `git pull` avance, rien ne revient. Si
// un déploiement casse le client, la seule sortie était jusqu'ici un accès SSH.
// On garde donc trace des états successivement servis, ce qui suffit à revenir
// en arrière depuis le tableau de bord.
//
// Le fichier vit à côté d'admin-config.json : hors git, propriété du serveur,
// préservé par `git pull` (fichier non suivi).
const DEPLOY_HISTORY_FILE = process.env.DEPLOY_HISTORY_FILE || path.join(__dirname, 'deploy-history.json');
// Profondeur volontairement courte : au-delà de quelques déploiements, revenir
// en arrière n'a plus de sens — la configuration, la base et le protocole ont
// bougé entre-temps. Une liste courte est aussi une liste qu'on lit.
const DEPLOY_HISTORY_MAX = 5;
let _deployHistory = [];
try { _deployHistory = JSON.parse(fs.readFileSync(DEPLOY_HISTORY_FILE, 'utf8')) || []; } catch (e) { _deployHistory = []; }
if (!Array.isArray(_deployHistory)) _deployHistory = [];
// Un historique déjà plus long (écrit quand la limite valait 20) est ramené à
// la nouvelle taille dès le démarrage, sans attendre le prochain déploiement.
if (_deployHistory.length > DEPLOY_HISTORY_MAX) {
  _deployHistory = _deployHistory.slice(0, DEPLOY_HISTORY_MAX);
  try { fs.writeFileSync(DEPLOY_HISTORY_FILE, JSON.stringify(_deployHistory)); } catch (e) {}
}
function _saveDeployHistory() {
  try { fs.writeFileSync(DEPLOY_HISTORY_FILE, JSON.stringify(_deployHistory)); }
  catch (e) { console.error('[deploy] history write failed: ' + e.message); }
}
function _gitOut(args) {
  try {
    const r = spawnSync('git', args, { cwd: __dirname, encoding: 'utf8',
      env: Object.assign({}, process.env, { PATH: SAFE_PATH }) });
    return (r.status === 0) ? String(r.stdout || '').trim() : '';
  } catch (e) { return ''; }
}
// Note l'état ACTUEL du checkout avant toute opération qui va le changer. Les
// entrées décrivent donc des états qui ont réellement tourné — la liste des
// points de retour possibles, pas un journal de commandes.
function _deployRecord(reason) {
  if (!GIT_UPDATABLE) return;
  const sha = _gitOut(['rev-parse', 'HEAD']);
  if (!/^[0-9a-f]{40}$/.test(sha)) return;
  if (_deployHistory.length && _deployHistory[0].sha === sha) {
    _deployHistory[0].last = Date.now();          // même état : on rafraîchit, pas de doublon
    _saveDeployHistory();
    return;
  }
  let version = '';
  try { version = (JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version) || ''; } catch (e) {}
  _deployHistory.unshift({
    sha: sha, version: version,
    subject: _gitOut(['log', '-1', '--format=%s']).slice(0, 200),
    committed: _gitOut(['log', '-1', '--format=%cI']),
    seen: Date.now(), last: Date.now(), reason: String(reason || ''),
  });
  _deployHistory = _deployHistory.slice(0, DEPLOY_HISTORY_MAX);
  _saveDeployHistory();
}
// Retour à un commit donné. Le commit peut manquer localement (checkout shallow
// provisionné par le conteneur) : on le récupère alors à la demande — GitHub
// sert un SHA joignable depuis une branche. `checkout -f -B` repositionne la
// branche, donc une mise à jour ultérieure reste un fast-forward normal.
function rollbackCmd(sha, restart) {
  const dir = __dirname.replace(/'/g, "'\\''");
  const clean = "git checkout -- public/themes/themes.json public/seats/seats.json 2>/dev/null || true";
  const get = "git cat-file -e " + sha + "^{commit} 2>/dev/null || git fetch --depth 1 origin " + sha;
  const go = "git checkout -q -f -B '" + GIT_BRANCH + "' " + sha;
  const head = restart ? "sleep 1; cd '" + dir + "'" : "cd '" + dir + "'";
  const tail = restart ? (" && npm install --omit=dev --no-audit --no-fund && " + restartSegment()) : "";
  return head + " && " + clean + "; " + get + " && " + go + tail;
}

// ── Scheduled restart/update with advance notice to connected clients ──
let _restartTimer = null;   // pending setTimeout handle (null = nothing scheduled)
let _restartAt = 0;         // epoch ms when the action fires (0 = none)
let _restartKind = '';      // 'update' | 'restart'
let _restartNotice = '';    // the NOTICE:… frame, replayed to clients that join the window
let _autoArmed = false;     // the pending action was armed by the automatic updater, not by a human
function restartOnlyCmd() {
  return "sleep 1; " + restartSegment();
}
// Broadcast a text control frame to every connected client — out-of-band, on the
// same channel the reaction/avatar relay already uses. Returns how many got it.
function broadcastNotice(text, target) {
  // target absent ou 'all' = tout le monde ; sinon seuls les clients dont le
  // mode (ws._bcMode : 'pthnet' | 'lan' | 'offline') correspond.
  const tgt = (target && target !== 'all') ? target : null;
  let n = 0;
  try { wss.clients.forEach(function (c) { if (c.readyState === 1 && (!tgt || c._bcMode === tgt) && c.bufferedAmount <= MAX_WS_SEND_QUEUE) { try { c.send(text); n++; } catch (e) {} } }); } catch (e) {}
  return n;
}
function clearScheduledRestart() {
  if (_restartTimer) { clearTimeout(_restartTimer); _restartTimer = null; }
  _restartAt = 0; _restartKind = ''; _restartNotice = '';
}

// ── Mise à jour automatique (option, cochée depuis /admin) ───────────────────
// Le tableau de bord savait déjà déployer à la demande. Ce qui manquait : savoir
// qu'il y a quelque chose à déployer, et le faire au bon moment.
//   · sondage périodique de la branche suivie (git fetch + comparaison) ;
//   · un changement qui ne touche que des fichiers servis part TOUT DE SUITE :
//     un pull statique ne coupe aucune connexion ;
//   · un changement qui exige un redémarrage (proxy.js, dépendances) attend que
//     le serveur soit VIDE — zéro WebSocket. Un préavis est diffusé quand même,
//     rejoué à qui arriverait pendant la fenêtre ; si quelqu'un est encore là à
//     l'échéance, on annule et on retentera plus tard. Une connexion ouverte n'est
//     jamais coupée par cette voie.
// Rien ne bouge tant que la case n'est pas cochée (_adminConfig.autoUpdate).
const AUTO_UPDATE_POLL_MS = 15 * 60 * 1000;   // fréquence du sondage amont
const AUTO_UPDATE_TICK_MS = 60 * 1000;        // battement du planificateur
const AUTO_UPDATE_MIN_UP_MS = 5 * 60 * 1000;  // pas de déploiement auto dans les 5 min qui suivent un démarrage : le temps de constater une casse
function _autoUpdateCfg() {
  const a = (_adminConfig && _adminConfig.autoUpdate) || {};
  const n = Math.floor(Number(a.noticeSec));
  return { enabled: !!a.enabled, noticeSec: (n >= 10 && n <= 3600) ? n : 60 };
}
// Dernier résultat connu du sondage. C'est lui que lit le tableau de bord : le
// statut est interrogé toutes les quelques secondes, pas question d'aller sur le
// réseau à chaque fois.
let _upd = { checking: false, checkedAt: 0, available: false, local: '', remote: '',
             subject: '', files: 0, needsRestart: false, error: '', lastAction: '' };
function _updPublic() {
  return { checkedAt: _upd.checkedAt, checking: _upd.checking, available: _upd.available,
           local: _upd.local, remote: _upd.remote, subject: _upd.subject, files: _upd.files,
           needsRestart: _upd.needsRestart, error: _upd.error, lastAction: _upd.lastAction };
}
// Un chemin qui n'est ni un fichier servi ni de la documentation, c'est du code
// serveur ou des dépendances : redémarrage obligatoire.
function _pathNeedsRestart(f) {
  if (/^public\//.test(f)) return false;
  return !/^(docs\/|claude\/|\.github\/|README|CHANGELOG|LICENSE|\.gitignore|\.editorconfig)/.test(f);
}
// git fetch + comparaison, en asynchrone : un spawnSync bloquerait la boucle
// d'événements pendant tout un aller-retour réseau.
function updateCheck(cb) {
  cb = cb || function () {};
  if (!GIT_UPDATABLE) { _upd.error = 'no git checkout (' + installKind() + ')'; return cb(_upd); }
  if (_upd.checking) return cb(_upd);
  _upd.checking = true;
  const dir = __dirname.replace(/'/g, "'\\''");
  const depth = GIT_SHALLOW ? '--depth 1 ' : '';   // ne jamais tronquer un clone complet
  const cmd = "cd '" + dir + "' && git fetch -q " + depth + "origin '" + GIT_BRANCH + "'" +
              " && git rev-parse HEAD && git rev-parse FETCH_HEAD" +
              " && git log -1 --format=%s FETCH_HEAD && echo '--'" +
              " && git diff --name-only HEAD FETCH_HEAD";
  let out = '', err = '';
  try {
    const child = spawn('sh', ['-c', cmd], { env: Object.assign({}, process.env, { PATH: SAFE_PATH }) });
    const killer = setTimeout(function () { try { child.kill('SIGKILL'); } catch (e) {} }, 120000);
    child.stdout.on('data', function (b) { if (out.length < 200000) out += b.toString('utf8'); });
    child.stderr.on('data', function (b) { if (err.length < 4000) err += b.toString('utf8'); });
    child.on('close', function (code) {
      clearTimeout(killer);
      _upd.checking = false; _upd.checkedAt = Date.now();
      if (code !== 0) {
        _upd.error = String(err || '').trim().split('\n').pop().slice(0, 200) || ('git exited ' + code);
        return cb(_upd);
      }
      const lines = out.split('\n');
      const local = String(lines.shift() || '').trim();
      const remote = String(lines.shift() || '').trim();
      const subject = String(lines.shift() || '').trim();
      while (lines.length && lines[0].trim() !== '--') lines.shift();   // sujet multi-ligne : on avance jusqu'au séparateur
      lines.shift();
      const files = lines.map(function (x) { return x.trim(); }).filter(Boolean);
      _upd.error = ''; _upd.local = local; _upd.remote = remote;
      _upd.available = /^[0-9a-f]{40}$/.test(remote) && /^[0-9a-f]{40}$/.test(local) && remote !== local;
      _upd.subject = _upd.available ? subject.slice(0, 200) : '';
      _upd.files = _upd.available ? files.length : 0;
      _upd.needsRestart = _upd.available && files.some(_pathNeedsRestart);
      return cb(_upd);
    });
  } catch (e) { _upd.checking = false; _upd.error = e.message; return cb(_upd); }
}
// Applique ce qui est applicable maintenant, vu l'état des lieux.
function _autoUpdateApply() {
  const cfg = _autoUpdateCfg();
  if (!cfg.enabled || !_upd.available) return;
  if (_restartAt > 0) return;                                   // une action est déjà planifiée : on ne double pas
  if (process.uptime() * 1000 < AUTO_UPDATE_MIN_UP_MS) return;  // trop tôt après un démarrage
  if (!_upd.needsRestart) {
    _deployRecord('before auto static update');
    runDetached(updateCmdStatic(), UPDATE_LOG);
    _upd.lastAction = new Date().toISOString() + ' — static deploy ' + _upd.remote.slice(0, 8);
    _upd.available = false;                                     // le prochain sondage confirmera
    console.log('[auto-update] static deploy ' + _upd.remote.slice(0, 8) + ' (' + _upd.files + ' file(s), no restart)');
    return;
  }
  let sockets = 0; try { sockets = wss.clients.size; } catch (e) {}
  if (sockets > 0) return;                                      // serveur occupé : on repassera au prochain battement
  _restartAt = Date.now() + cfg.noticeSec * 1000;
  _restartKind = 'update';
  _restartNotice = 'NOTICE:RESTART:' + _restartAt + ':update:';
  _autoArmed = true;
  _restartTimer = setTimeout(function () {
    _restartTimer = null; _restartAt = 0; _restartNotice = ''; _autoArmed = false;
    let n = 0; try { n = wss.clients.size; } catch (e) {}
    if (n > 0) {                                                // quelqu'un est arrivé pendant le préavis : on lui laisse la place
      broadcastNotice('NOTICE:CANCEL');
      console.log('[auto-update] window closed (' + n + ' client(s) connected) — postponed');
      return;
    }
    _deployRecord('before auto update');
    _upd.lastAction = new Date().toISOString() + ' — update + restart ' + _upd.remote.slice(0, 8);
    console.log('[auto-update] deploying ' + _upd.remote.slice(0, 8) + ' + restart (server idle)');
    runDetached(updateCmd(), UPDATE_LOG);
  }, cfg.noticeSec * 1000);
  console.log('[auto-update] server idle — update ' + _upd.remote.slice(0, 8) + ' armed in ' + cfg.noticeSec + 's');
}
function autoUpdateTick() {
  const cfg = _autoUpdateCfg();
  if (!cfg.enabled || !GIT_UPDATABLE) return;
  // Mise à jour déjà repérée et en attente d'une fenêtre libre : inutile de
  // retourner sur le réseau, il suffit de regarder si le serveur s'est vidé.
  if (_upd.available) return _autoUpdateApply();
  if (Date.now() - _upd.checkedAt < AUTO_UPDATE_POLL_MS) return;
  updateCheck(function () { _autoUpdateApply(); });
}
const _autoUpdateTimer = setInterval(autoUpdateTick, AUTO_UPDATE_TICK_MS);
if (_autoUpdateTimer.unref) _autoUpdateTimer.unref();

// ── Information broadcast scheduler ─────────────────────────────────────────
const _BC_ICONS = ['', '\u2139\ufe0f', '\ud83d\udce2', '\u26a0\ufe0f', '\ud83c\udf89']; // '' ℹ️ 📢 ⚠️ 🎉
const _BC_MAXT = 2000000000; // ~23 days, under setTimeout's 32-bit ceiling → re-arm beyond
function _bcIcon(x) { return _BC_ICONS.indexOf(x) >= 0 ? x : ''; }
// Cible d'une diffusion : tous les modes ou un seul (pokerth.net direct /
// LAN via proxy / entraînement offline). Voir ws._bcMode.
const _BC_TARGETS = ['all', 'pthnet', 'lan', 'offline'];
function _bcTarget(x) { return _BC_TARGETS.indexOf(x) >= 0 ? x : 'all'; }
// Trame d'une diffusion : INFO: classique, ou INFOCD:<échéance>: avec compte à
// rebours affiché en direct côté client (inscriptions de tournoi, etc.).
function _bcFrame(icon, message, cdAt) {
  return (cdAt ? 'INFOCD:' + cdAt + ':' : 'INFO:') + (icon || '') + ':' + (message || '');
}
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
  // Fenêtre de diffusion : rien avant startAt. Pour un intervalle jamais
  // déclenché, le 1er envoi tombe exactement à startAt ; pour les horaires
  // (daily/everyDays/weekly/monthly), à la 1re occurrence de l'horaire à
  // partir de startAt.
  const _sa = Number(job.startAt) || 0;
  if (_sa && from < _sa) from = (s.type === 'interval' && !job.lastRun) ? _sa - (Math.floor(Number(s.minutes) || 0) * 60000) : _sa - 1;
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
  if (job.countdownAt && next > job.countdownAt) return null; // plus rien après l'échéance
  if (job.maxRuns && (job.runCount || 0) >= job.maxRuns) return null;
  return next;
}
function fireBroadcast(job) {
  const cd = Number(job.countdownAt) || 0;
  if (cd && Date.now() >= cd) { console.log('[broadcast] job ' + job.id + ' skipped (countdown expired)'); return 0; }
  const n = broadcastNotice(_bcFrame(job.icon, job.message, cd), job.target);
  job.lastRun = Date.now();
  job.runCount = (job.runCount || 0) + 1;
  console.log('[broadcast] job ' + job.id + ' fired (' + _bcTarget(job.target) + ') -> ' + n + ' client(s)');
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
const ADMIN_SCOPES = ['broadcast', 'music', 'packages', 'leaderboard', 'polls'];
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

// ── IP bloquées (anti-force brute) et bannies (décision d'admin) ─────────
// Le garde anti-force brute de l'admin travaillait en aveugle : on ne voyait ni
// qui était bloqué, ni comment débloquer quelqu'un qui s'est trompé de jeton.
// Le limiteur ne sait pas énumérer ses clés, on tient donc la liste des IP
// ayant échoué au moins une fois et on l'interroge à l'affichage.
//
// Contrairement au reste du tableau de bord, les IP sont ici montrées EN CLAIR :
// masquée, une IP ne se bannit pas et ne se débloque pas. C'est une section de
// sécurité, pas une liste de joueurs.
const _adminFailIps = new Map();          // ip → dernier échec (ms)
function _noteAdminFail(ip) {
  if (!ip) return;
  _adminFailIps.set(ip, Date.now());
  if (_adminFailIps.size > 2000) {        // purge des plus anciennes
    const cut = Date.now() - 7 * 86400000;
    _adminFailIps.forEach(function (t, k) { if (t < cut) _adminFailIps.delete(k); });
  }
}
function bannedIps() {
  const a = _adminConfig && _adminConfig.bannedIps;
  return Array.isArray(a) ? a : [];
}
function isBanned(ip) {
  const b = bannedIps();
  return b.length > 0 && b.indexOf(String(ip || '')) >= 0;
}
// Jamais la boucle locale : se bannir soi-même couperait l'accès au tableau de
// bord depuis la machine qui l'héberge, sans moyen de revenir en arrière.
function _bannableIp(ip) {
  ip = String(ip || '').trim();
  if (!/^[0-9a-fA-F:.]{3,45}$/.test(ip)) return '';
  if (/^(127\.|::1$|::ffff:127\.)/.test(ip)) return '';
  return ip;
}

// ── Journal d'audit des actions d'administration ──────────────────────
// Les clés déléguées permettent de confier une section à un tiers ; il ne
// restait aucune trace de ce qu'il en faisait. On journalise donc toute requête
// qui MODIFIE quelque chose (POST sous /admin/), avec l'auteur, l'IP masquée et
// le résultat. Les lectures ne sont pas journalisées : le tableau de bord
// interroge /admin/status toutes les quelques secondes, elles noieraient tout.
//
// Persisté sur disque : un journal d'audit qui disparaît au redémarrage ne vaut
// pas grand-chose. Fichier non suivi, comme admin-config.json.
const AUDIT_FILE = process.env.AUDIT_FILE || path.join(__dirname, 'admin-audit.json');
const AUDIT_MAX = 500;
let _audit = [];
try { _audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8')) || []; } catch (e) { _audit = []; }
if (!Array.isArray(_audit)) _audit = [];
let _auditTimer = null;
function _saveAuditSoon() {
  if (_auditTimer) return;
  _auditTimer = setTimeout(function () {
    _auditTimer = null;
    try { fs.writeFileSync(AUDIT_FILE, JSON.stringify(_audit)); }
    catch (e) { console.error('[audit] write failed: ' + e.message); }
  }, 1500);
}
// Qui agit : la clé maître, une clé déléguée nommée, ou personne (403). On ne
// journalise JAMAIS le jeton lui-même, seulement le nom qu'il porte.
function _auditActor(query, bodyToken) {
  if (adminAuthed(query, bodyToken)) return { name: 'master', master: true };
  const tok = (query && query.token) || bodyToken || '';
  if (tok) {
    const row = _loadScopedTokens().find(function (r) { return r.token === tok; });
    if (row) return { name: String(row.name || 'key'), master: false, scopes: row.scopes || [] };
  }
  return { name: 'unauthenticated', master: false };
}
function auditRecord(req, res, reqPathOnly, query) {
  try {
    const body = req._jsonBody || null;
    const actor = _auditActor(query, body && body.token);
    _audit.unshift({
      at: Date.now(),
      actor: actor.name,
      master: !!actor.master,
      action: String(reqPathOnly || '').replace(/^\/admin\//, ''),
      status: res.statusCode || 0,
      ok: (res.statusCode || 0) < 400,
      ip: _maskIp(res._rlIp || clientIp(req)),
    });
    if (_audit.length > AUDIT_MAX) _audit.length = AUDIT_MAX;
    _saveAuditSoon();
  } catch (e) {}
}

// ── Rate limiting (optional dep: rate-limiter-flexible) ──
// Two guards, both per client IP, both in-memory (reset on restart):
//   • _rlAdminFail — brute-force guard on the admin panel: only FAILED auth
//     attempts (403 responses) consume points; 10 failures in 15 min block the
//     IP for 15 min (429). Legitimate panel polling is never throttled.
//   • _rlWs — WebSocket connection storm guard: 30 new upgrades per minute
//     per IP (multiple tabs / quick reconnects fit comfortably).
// Missing module → limiters silently disabled (same graceful pattern as dotenv).
// RATE_LIMIT_DISABLED=1 turns both off explicitly.
let _RateLimiterMemory = null;
try { _RateLimiterMemory = require('rate-limiter-flexible').RateLimiterMemory; } catch (_) { /* not installed */ }
const _RATE_LIMIT_OFF = /^(1|true|on|yes)$/i.test(String(process.env.RATE_LIMIT_DISABLED || ''));
const _rlAdminFail = (_RateLimiterMemory && !_RATE_LIMIT_OFF)
  ? new _RateLimiterMemory({ points: 10, duration: 900, blockDuration: 900 }) : null;
const _rlWs = (_RateLimiterMemory && !_RATE_LIMIT_OFF)
  ? new _RateLimiterMemory({ points: 30, duration: 60 }) : null;
// ── Per-IP concurrent WebSocket cap ──
// _rlWs bounds the RATE of new upgrades; this bounds how many sockets one IP
// may HOLD OPEN at once (game bridges + notify channels). Slow sustained
// opening (30/min kept open for 20 min = 600 bridges, one upstream TCP each)
// is otherwise unbounded per IP. 20 covers heavy legitimate use — the count
// is per REAL visitor address (clientIp(), CF-Connecting-IP behind
// Cloudflare), and only rare carrier-grade NAT setups share one IP across
// many web players. PROXY_MAX_WS_PER_IP overrides; 0 = off.
const MAX_WS_PER_IP = (function () {
  var v = parseInt(process.env.PROXY_MAX_WS_PER_IP || '', 10);
  return isNaN(v) ? 20 : v;
})();
const _ipConns = new Map();  // ip → nombre de sockets WS actuellement ouvertes
// Client IP: trust the first X-Forwarded-For entry ONLY when the direct peer is
// loopback/private (i.e. a local reverse proxy such as nginx). A public peer
// could forge the header, so in that case its socket address wins.
function clientIp(req) {
  const peer = String((req && req.socket && req.socket.remoteAddress) || '');
  const localPeer = /^(::1$|::ffff:127\.|127\.|::ffff:10\.|10\.|::ffff:192\.168\.|192\.168\.|::ffff:172\.(1[6-9]|2\d|3[01])\.|172\.(1[6-9]|2\d|3[01])\.)/.test(peer);
  if (localPeer) {
    // Behind Cloudflare, CF-Connecting-IP is authoritative: Cloudflare always
    // OVERWRITES it with the visitor address, so a client cannot forge it.
    // X-Forwarded-For, by contrast, is APPENDED to — its first entry is
    // client-controlled on such setups. Now that this address feeds the PROXY
    // protocol header toward the game server (ranking same-IP check, IP bans),
    // a forgeable value would let a player dodge the check or pin a ban on an
    // arbitrary address; hence CF first, and both paths validated as real IPs.
    const cf = req && req.headers && req.headers['cf-connecting-ip'];
    if (cf && net.isIP(String(cf).trim())) return String(cf).trim();
    const xff = req && req.headers && req.headers['x-forwarded-for'];
    if (xff) {
      const first = String(xff).split(',')[0].trim();
      if (first && net.isIP(first)) return first;
    }
  }
  return peer || 'unknown';
}

function adminJson(res, code, obj) {
  // Penalize failed admin auth (brute-force guard). res._rlIp is attached by
  // the /admin routing in the HTTP handler; consume() is fire-and-forget.
  // res._rlNoPenalty marks idempotent read-only polls (dashboard auto-refresh:
  // /admin/status, /admin/logs) so a stale token in a still-open panel can't
  // rack up "failed attempts" every few seconds and lock its own IP out.
  if (code === 403 && _rlAdminFail && res._rlIp && !res._rlNoPenalty) { _rlAdminFail.consume(res._rlIp).catch(function () {}); _noteAdminFail(res._rlIp); }
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
    // Seat pack = a 9-slice plate image (border-image `fill` paints the box too)
    // AND/OR a free stylesheet style.css (full custom design inside the QML
    // virtual frame). Optional: self.* frame for the hero bar, preview.*,
    // seat.json metadata (name, by, traits, ...).
    const plate = ['plate.png', 'plate.svg', 'plate.webp', 'plate.jpg', 'plate.jpeg'].find(has);
    const packCss = has('style.css');
    if (!plate && !packCss) return done('not a seat pack (plate.png / plate.svg or style.css missing)');
    if (!id) id = 'seat-' + Date.now();
    if (['', 'pokerth', 'chip', 'plate', 'card', 'compact', 'bar', 'onyx-pill', 'boardwalk', 'high-roller'].indexOf(id) >= 0) id = 'seat-' + id;   // never clobber a built-in / official seat id
    const dest = path.join(PUBLIC_DIR, 'seats', id);
    try { fs.rmSync(dest, { recursive: true, force: true }); fs.mkdirSync(dest, { recursive: true }); } catch (e) { return done('dest failed'); }
    try { fs.readdirSync(exDir).forEach(function (f) { if (/^(plate|self|preview|bg|frame|img[0-9]?)\.(png|svg|webp|jpe?g)$/i.test(f) || f === 'seat.json' || f === 'style.css') cp(f, path.join(dest, f)); }); } catch (e) {}
    regenManifest('seat');
    let listed = false;
    try { listed = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'seats', 'seats.json'), 'utf8')).some(function (x) { return x && x.id === id; }); } catch (e) {}
    if (!listed) { try { fs.rmSync(dest, { recursive: true, force: true }); } catch (e) {} return done('seat pack has no usable plate image or style.css'); }
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
// Enregistre une piste admin depuis un buffer MP3 déjà validé (utilisé par
// l'import URL et le finish de l'upload chunké — la route historique
// /admin/music-upload garde son code en place, inchangé).
function musicRegisterTrack(fields, buf) {
  var title = musicStr(fields.title, 120);
  var id = uniqueMusicId(title);
  try { fs.mkdirSync(MUSIC_DIR, { recursive: true }); fs.writeFileSync(path.join(MUSIC_DIR, id + '.mp3'), buf); }
  catch (e) { return { error: 'write failed' }; }
  var artist = musicStr(fields.artist, 120);
  var entry = {
    id: id, title: title, artist: artist, file: '/music/' + id + '.mp3',
    license: musicStr(fields.license, 60), licenseUrl: musicStr(fields.licenseUrl, 300),
    source: musicStr(fields.source, 120), sourceUrl: musicStr(fields.sourceUrl, 300),
    credit: musicStr(fields.credit, 300) || (title + (artist ? ' by ' + artist : '')),
    active: true
  };
  _adminConfig.musicTracks = musicAdminTracks().concat([entry]);
  saveAdminConfig();
  return { id: id, title: title };
}
// Téléchargeur générique côté serveur pour l'import de musique par URL.
// Contourne le 413 de l'infra amont (nginx/Cloudflare limitent le CORPS des
// requêtes entrantes ; rien ne limite ce que le conteneur télécharge en
// sortie). Même recette que _doFetchServerlist : User-Agent explicite
// (Cloudflare 403 sinon), redirections bornées, plafond d'octets.
function musicFetchUrl(u, cb, _hops) {
  var hops = _hops | 0, mod, opts, raw0 = '';
  try {
    raw0 = String(u || '').trim();
    if (raw0 && !/^https?:\/\//i.test(raw0)) raw0 = 'https://' + raw0;
    var parsed = new url.URL(raw0);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return cb('bad url scheme', null);
    mod = parsed.protocol === 'https:' ? https : http;
    opts = {
      protocol: parsed.protocol, hostname: parsed.hostname,
      port: parsed.port || undefined,
      path: parsed.pathname + (parsed.search || ''),
      headers: { 'User-Agent': SERVERLIST_UA, 'Accept': '*/*', 'Accept-Encoding': 'identity' }
    };
  } catch (e) { return cb('bad url', null); }
  var done = false;
  function finish(err, buf) { if (done) return; done = true; cb(err, buf); }
  var rq;
  try {
    rq = mod.get(opts, function (resp) {
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers && resp.headers.location && hops < SERVERLIST_MAX_HOPS) {
        var next = '';
        try { next = new url.URL(resp.headers.location, raw0).href; } catch (e) { next = ''; }
        resp.resume();
        if (!next) return finish('bad redirect', null);
        if (done) return;
        done = true;
        return musicFetchUrl(next, cb, hops + 1);
      }
      if (resp.statusCode !== 200) { resp.resume(); return finish('http ' + resp.statusCode, null); }
      var chunks = [], total = 0, aborted = false;
      resp.on('data', function (c) { total += c.length; if (total > MAX_UPLOAD) { aborted = true; try { resp.destroy(); } catch (e) {} return; } chunks.push(c); });
      resp.on('end', function () { if (aborted) return finish('file larger than 25 MB', null); finish(null, Buffer.concat(chunks)); });
      resp.on('error', function () { finish('download error', null); });
    });
    rq.setTimeout(30000, function () { try { rq.destroy(); } catch (e) {} finish('timeout', null); });
    rq.on('error', function (e) { finish('download failed: ' + (e && e.code || 'error'), null); });
  } catch (e) { return finish('download failed', null); }
}
// ── Upload par morceaux ────────────────────────────────────────────────────
// L'infra amont (nginx client_max_body_size, non modifiable pour l'instant)
// rejette les gros corps en 413. Le client découpe donc le MP3 en tranches
// < 1 Mo, réassemblées ici dans un fichier temporaire, strictement en
// séquence. Chaque session est liée aux métadonnées données au begin.
var MZ_CHUNK_MAX = 950 * 1024;          // plafond serveur par tranche (client : 700 Ko)
var MZ_SESSION_TTL = 15 * 60 * 1000;    // session abandonnée purgée après 15 min
var MZ_SESSION_CAP = 4;                 // uploads chunkés simultanés
var _mzSessions = {};
function _mzGc() {
  var now = Date.now();
  Object.keys(_mzSessions).forEach(function (k) {
    var ss = _mzSessions[k];
    if (now - ss.touched > MZ_SESSION_TTL) { try { fs.rmSync(ss.tmp, { force: true }); } catch (e) {} delete _mzSessions[k]; }
  });
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
    return adminJson(res, 200, { ok: true, version: version, runningVersion: BOOT_VERSION, node: process.version, uptimeSec: Math.floor(process.uptime()), installKind: installKind(), gitUpdatable: GIT_UPDATABLE, sockets: sockets, players: Object.keys(statsStore).length, resetPeriod: STATS_RESET_PERIOD, modes: appModes(), showLoginTitle: !!_adminConfig.showLoginTitle, defaultTheme: _adminConfig.defaultTheme || '', defaults: _adminConfig.defaults || {}, loginDefaults: _loginDefaults(false), proxyCfg: _adminConfig.proxyCfg || {}, logLevel: _logLevelName(), maxClients: _maxClients(), fd: _fdInfo(), tableDefaults: _adminConfig.tableDefaults || {}, tableNames: _adminConfig.tableNames || {}, serverName: _adminConfig.serverName || '', serverTagline: _adminConfig.serverTagline || '', discordChatWebhookUrl: _adminConfig.discordChatWebhookUrl || '', seo: _seoAdmin(), restartAt: (_restartAt > Date.now() ? _restartAt : null), restartKind: (_restartAt > Date.now() ? _restartKind : null), autoUpdate: _autoUpdateCfg(), autoArmed: !!(_autoArmed && _restartAt > Date.now()), update: _updPublic() });
  }
  // ── Erreurs JS remontées par les clients (clé maître uniquement) ────────
  if (reqPathOnly === '/admin/errors') {
    if (req.method === 'GET') {
      if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      res._rlNoPenalty = true;
      return adminJson(res, 200, _errSnapshot());
    }
    if (req.method === 'POST') {
      return readJsonBody(req, function (d) {
        if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
        if (d && d.sig) { _errGroups.delete(String(d.sig)); return adminJson(res, 200, { ok: true, deleted: 1 }); }
        if (d && d.clear) { _errGroups.clear(); return adminJson(res, 200, { ok: true, cleared: true }); }
        return adminJson(res, 400, { ok: false });
      });
    }
    res.writeHead(405); res.end('Method not allowed'); return;
  }
  // ── Inventaire des connexions en cours (clé maître uniquement) ──────────
  // Lecture seule ; POST { kick: <id> } ferme une connexion. Volontairement hors
  // des clés déléguées : on y voit des pseudos et des IP (masquées).
  if (reqPathOnly === '/admin/sessions') {
    if (req.method === 'GET') {
      if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      res._rlNoPenalty = true;
      return adminJson(res, 200, _sessionsSnapshot());
    }
    if (req.method === 'POST') {
      return readJsonBody(req, function (d) {
        if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
        const id = d && parseInt(d.kick, 10);
        if (!id || !isFinite(id)) return adminJson(res, 400, { ok: false, error: 'missing id' });
        const kind = _kickSession(id);
        if (!kind) return adminJson(res, 404, { ok: false, error: 'not found' });
        console.log('[admin] Session ' + id + ' (' + kind + ') déconnectée depuis le tableau de bord');
        return adminJson(res, 200, { ok: true, kicked: kind });
      });
    }
    res.writeHead(405); res.end('Method not allowed'); return;
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
          visitsStore = emptyVisitsStore();
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
  // ── Préférences liées au compte (sync opt-in du config.xml, phase 2) ──
  // Auth par jeton de session émis à l'InitAck d'un login authentifié (voir
  // _issueSyncToken). GET = lire le blob du compte ; PUT/POST = l'écrire.
  if (reqPathOnly === '/prefs') {
    // Jeton attendu en header Authorization: Bearer <tok> (n'apparaît pas dans
    // les logs d'accès HTTP) ; repli sur ?token= pour les anciens clients en cache.
    const _authTok = String(req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
    const acct = _syncTokenName(_authTok || query.token);
    if (!acct) return adminJson(res, 403, { ok: false, error: 'not authenticated (registered account required)' });
    if (req.method === 'GET') {
      let web = null, webUpdatedAt = 0;
      try { const w = JSON.parse(fs.readFileSync(_prefsWebFile(acct), 'utf8')); web = w.web || null; webUpdatedAt = w.updatedAt || 0; } catch (e) {}
      try {
        const d = JSON.parse(fs.readFileSync(_prefsFile(acct), 'utf8'));
        return adminJson(res, 200, { ok: true, xml: d.xml || null, updatedAt: d.updatedAt || 0, web: web, webUpdatedAt: webUpdatedAt });
      } catch (e) {
        return adminJson(res, 200, { ok: true, xml: null, updatedAt: 0, web: web, webUpdatedAt: webUpdatedAt });
      }
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      let body = '';
      req.on('data', function (c) { body += c; if (body.length > 400 * 1024) req.destroy(); });
      req.on('end', function () {
        if (body.indexOf('<PokerTH') < 0) return adminJson(res, 400, { ok: false, error: 'not a PokerTH config.xml' });
        // Rate-limit : 1 écriture / 5 s par compte (le client debounce déjà à 5 s
        // et re-tente sur 429) — protège le disque d'un client hostile à jeton valide.
        const _lw = _prefsLastWrite.get(acct) || 0;
        if (Date.now() - _lw < 5000) return adminJson(res, 429, { ok: false, error: 'rate limited' });
        _prefsLastWrite.set(acct, Date.now());
        const rec = { name: acct, updatedAt: Date.now(), xml: body };
        // Écriture atomique : tmp puis rename — un crash mi-écriture ne peut pas
        // corrompre le fichier final (rename POSIX atomique sur le même FS).
        try {
          fs.mkdirSync(PREFS_DIR, { recursive: true });
          const _fp = _prefsFile(acct), _tmp = _fp + '.tmp';
          fs.writeFileSync(_tmp, JSON.stringify(rec));
          fs.renameSync(_tmp, _fp);
        }
        catch (e) { return adminJson(res, 500, { ok: false, error: 'write failed' }); }
        return adminJson(res, 200, { ok: true, updatedAt: rec.updatedAt });
      });
      req.on('error', function () {});
      return;
    }
    res.writeHead(405); res.end('Method not allowed'); return;
  }
  // ── Blob « web-only » lié au compte (réglages du client web sans clé dans le
  // config.xml officiel : thème, sièges, raccourcis, voix, etc.). JSON plat
  // { pth_xxx: "valeur" } ; lecture via GET /prefs (champs web/webUpdatedAt).
  if (reqPathOnly === '/prefs-web') {
    const _authTokW = String(req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
    const acctW = _syncTokenName(_authTokW || query.token);
    if (!acctW) return adminJson(res, 403, { ok: false, error: 'not authenticated (registered account required)' });
    if (req.method === 'PUT' || req.method === 'POST') {
      let body = '';
      req.on('data', function (c) { body += c; if (body.length > 64 * 1024) req.destroy(); });
      req.on('end', function () {
        let obj = null;
        try { obj = JSON.parse(body); } catch (e) {}
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return adminJson(res, 400, { ok: false, error: 'not a JSON object' });
        const clean = {};
        Object.keys(obj).slice(0, 200).forEach(function (k) {
          if (/^pth_[a-z0-9_]{1,40}$/.test(k) && typeof obj[k] === 'string' && obj[k].length <= 20000) clean[k] = obj[k];
        });
        const _lw = _prefsWebLastWrite.get(acctW) || 0;
        if (Date.now() - _lw < 5000) return adminJson(res, 429, { ok: false, error: 'rate limited' });
        _prefsWebLastWrite.set(acctW, Date.now());
        const rec = { name: acctW, updatedAt: Date.now(), web: clean };
        try {
          fs.mkdirSync(PREFS_DIR, { recursive: true });
          const _fp = _prefsWebFile(acctW), _tmp = _fp + '.tmp';
          fs.writeFileSync(_tmp, JSON.stringify(rec));
          fs.renameSync(_tmp, _fp);
        }
        catch (e) { return adminJson(res, 500, { ok: false, error: 'write failed' }); }
        return adminJson(res, 200, { ok: true, updatedAt: rec.updatedAt });
      });
      req.on('error', function () {});
      return;
    }
    res.writeHead(405); res.end('Method not allowed'); return;
  }
  if (reqPathOnly === '/admin/config') {
    if (req.method === 'GET') {
      if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      return adminJson(res, 200, { ok: true, resetPeriod: STATS_RESET_PERIOD, modes: appModes(), welcome: _welcomeAdmin(), showLoginTitle: !!_adminConfig.showLoginTitle, defaultTheme: _adminConfig.defaultTheme || '', defaults: _adminConfig.defaults || {}, loginDefaults: _loginDefaults(false), proxyCfg: _adminConfig.proxyCfg || {}, tableDefaults: _adminConfig.tableDefaults || {}, tableNames: _adminConfig.tableNames || {}, serverName: _adminConfig.serverName || '', serverTagline: _adminConfig.serverTagline || '', discordChatWebhookUrl: _adminConfig.discordChatWebhookUrl || '', featureSwitches: FEATURE_SWITCHES, featureOff: featureOffList(), musicEnabled: musicEnabled(), seo: _seoAdmin() });
    }
    if (req.method === 'POST') {
      return readJsonBody(req, function (d) {
        if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
        d = d || {};
        if (d.resetPeriod !== undefined) {
          const per = String(d.resetPeriod || '').toLowerCase();
          if (['off', 'daily', 'weekly', 'monthly', 'yearly'].indexOf(per) < 0) return adminJson(res, 400, { ok: false, error: 'invalid period (off|daily|weekly|monthly|yearly)' });
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
        if (Array.isArray(d.featureOff)) {
          // Liste blanche stricte : seules les clés du catalogue survivent.
          _adminConfig.featureOff = d.featureOff
            .map(function (k) { return String(k == null ? '' : k); })
            .filter(function (k) { return FEATURE_SWITCHES.some(function (f) { return f.key === k; }); })
            .slice(0, FEATURE_SWITCHES.length);
        }
        if (d.loginDefaults && typeof d.loginDefaults === 'object') {
          var ld = d.loginDefaults, lout = {};
          lout.mode = (['offline', 'lan-dedi', 'pokerthnet'].indexOf(ld.mode) >= 0) ? ld.mode : '';
          lout.host = (typeof ld.host === 'string') ? ld.host.trim().slice(0, 120) : '';
          // URL de proxy imposée à tous les clients (vide = auto-détection depuis
          // l'adresse de la page, comportement historique). Schéma ws/wss exigé.
          var _pu = (typeof ld.proxyUrl === 'string') ? ld.proxyUrl.trim().slice(0, 180) : '';
          lout.proxyUrl = /^wss?:\/\/[^\s]+$/i.test(_pu) ? _pu : '';
          // Masquer le champ « URL du proxy WebSocket » et son libellé.
          lout.hideProxy = !!ld.hideProxy;
          // Politique du serveur LAN / dédié : 'auto' (adresse mémorisée par le
          // joueur, repli sur l'adresse de la page) ou 'forced' (hôte, port et
          // TLS imposés ci-dessus, champs restant éditables côté joueur).
          // Absent = déduit de l'ancien réglage `host` (compat ascendante).
          lout.lanMode = (ld.lanMode === 'forced' || ld.lanMode === 'auto') ? ld.lanMode : (lout.host ? 'forced' : 'auto');
          var _lnp = parseInt(ld.lanPort, 10);
          lout.lanPort = (Number.isInteger(_lnp) && _lnp >= 1 && _lnp <= 65535) ? _lnp : 0;
          lout.lanTls = !!ld.lanTls;
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
          var _lv = (pc.logLevel == null ? '' : String(pc.logLevel)).trim().toLowerCase();
          if (_lv === 'quiet' || _lv === 'normal' || _lv === 'verbose') pout.logLevel = _lv;
          var _mx = (pc.maxClients == null || pc.maxClients === '') ? null : parseInt(pc.maxClients, 10);
          if (_mx != null && _mx >= 0 && _mx <= 100000) pout.maxClients = _mx;
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
        if (typeof d.discordChatWebhookUrl === 'string') {
          var dw = d.discordChatWebhookUrl.trim().slice(0, 200);
          if (dw && !DISCORD_WEBHOOK_RE.test(dw)) return adminJson(res, 400, { ok: false, error: 'invalid Discord webhook URL (expected https://discord.com/api/webhooks/…)' });
          _adminConfig.discordChatWebhookUrl = dw;   // vide = relais désactivé
        }
        if (typeof d.serverName === 'string')    _adminConfig.serverName    = d.serverName.trim().slice(0, 40);
        if (typeof d.serverTagline === 'string') _adminConfig.serverTagline = d.serverTagline.trim().slice(0, 60);
        if (typeof d.showLoginTitle === 'boolean') _adminConfig.showLoginTitle = d.showLoginTitle;
        if (d.seo && typeof d.seo === 'object') {
          var _so = (_adminConfig.seo && typeof _adminConfig.seo === 'object') ? _adminConfig.seo : {};
          if (typeof d.seo.enabled === 'boolean') _so.enabled = d.seo.enabled;
          if (typeof d.seo.publicUrl === 'string') {
            var _su = d.seo.publicUrl.trim().slice(0, 200).replace(/\/+$/, '');
            if (_su && !/^https?:\/\/[^\s"'<>]+$/i.test(_su)) return adminJson(res, 400, { ok: false, error: 'invalid public URL (expected https://\u2026)' });
            _so.publicUrl = _su;
          }
          if (typeof d.seo.googleVerification === 'string') {
            var _sg = d.seo.googleVerification.trim().slice(0, 100);
            if (_sg && !/^[A-Za-z0-9_-]+$/.test(_sg)) return adminJson(res, 400, { ok: false, error: 'invalid verification token (letters, digits, - and _ only)' });
            _so.googleVerification = _sg;
          }
          if (typeof d.seo.bingVerification === 'string') {
            var _sb = d.seo.bingVerification.trim().slice(0, 100);
            if (_sb && !/^[A-Za-z0-9_-]+$/.test(_sb)) return adminJson(res, 400, { ok: false, error: 'invalid Bing verification token (letters, digits, - and _ only)' });
            _so.bingVerification = _sb;
          }
          if (typeof d.seo.yandexVerification === 'string') {
            var _sy = d.seo.yandexVerification.trim().slice(0, 100);
            if (_sy && !/^[A-Za-z0-9_-]+$/.test(_sy)) return adminJson(res, 400, { ok: false, error: 'invalid Yandex verification token (letters, digits, - and _ only)' });
            _so.yandexVerification = _sy;
          }
          if (typeof d.seo.siteName === 'string')    _so.siteName    = d.seo.siteName.trim().slice(0, 60);
          if (typeof d.seo.title === 'string')       _so.title       = d.seo.title.trim().slice(0, 70);
          if (typeof d.seo.description === 'string') _so.description = d.seo.description.trim().slice(0, 200);
          if (typeof d.seo.image === 'string') {
            var _si = d.seo.image.trim().slice(0, 300);
            if (_si && !/^(https?:\/\/[^\s"'<>]+|\/[^\s"'<>]*)$/i.test(_si)) return adminJson(res, 400, { ok: false, error: 'invalid image (expected https://\u2026 or a path starting with /)' });
            _so.image = _si;
          }
          if (typeof d.seo.aiCrawlers === 'boolean') _so.aiCrawlers = d.seo.aiCrawlers;
          _adminConfig.seo = _so;
          _seoHtmlCache.clear();   // re-inject on next page load
          if (_so.enabled === true && _so.publicUrl) {
            _seoEnsureIndexNowKey();   // persisted by the saveAdminConfig() below
            setImmediate(function () { try { seoIndexNowPing(true); } catch (e) {} });
          }
        }
        saveAdminConfig();
        return adminJson(res, 200, { ok: true, resetPeriod: STATS_RESET_PERIOD, modes: appModes(), welcome: _welcomeAdmin(), showLoginTitle: !!_adminConfig.showLoginTitle, defaultTheme: _adminConfig.defaultTheme || '', defaults: _adminConfig.defaults || {}, loginDefaults: _loginDefaults(false), proxyCfg: _adminConfig.proxyCfg || {}, tableDefaults: _adminConfig.tableDefaults || {}, tableNames: _adminConfig.tableNames || {}, serverName: _adminConfig.serverName || '', serverTagline: _adminConfig.serverTagline || '', discordChatWebhookUrl: _adminConfig.discordChatWebhookUrl || '', featureSwitches: FEATURE_SWITCHES, featureOff: featureOffList(), musicEnabled: musicEnabled(), seo: _seoAdmin() });
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
      return adminJson(res, 200, { ok: true, servers: _serversList(), activeServerId: (_adminConfig.activeServerId || ''), source: _pokerthnetSource(), transport: _internetTransport(), proxyProtocol: _proxyProtocolOn(), serverlistUrl: _serverlistUrl(), serverlist: { server: _serverlistCache.server, fetchedAt: _serverlistCache.fetchedAt, error: _serverlistCache.error }, allowlist: { hosts: _hosts, ports: _ports }, effective: _effectiveTarget() });
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
      // Transport of the Internet / PokerTH.net mode: 'direct' or 'proxy'.
      if (typeof d.transport !== 'undefined') {
        _adminConfig.internetTransport = (String(d.transport || '') === 'proxy') ? 'proxy' : 'direct';
      }
      if (typeof d.proxyProtocol !== 'undefined') {
        _adminConfig.proxyProtocol = !!d.proxyProtocol;
      }
      if (typeof d.serverlistUrl !== 'undefined') {
        var _u = String(d.serverlistUrl || '').trim().slice(0, 300);
        var _changed = _u !== (_adminConfig.serverlistUrl || '');
        _adminConfig.serverlistUrl = _u;
        if (_changed && _pokerthnetSource() === 'auto') { _serverlistCache.fetchedAt = 0; setTimeout(maybeRefreshServerlist, 0); }
      }
      saveAdminConfig();
      return adminJson(res, 200, { ok: true, servers: out, activeServerId: (_adminConfig.activeServerId || ''), source: _pokerthnetSource(), transport: _internetTransport(), proxyProtocol: _proxyProtocolOn(), serverlistUrl: _serverlistUrl() });
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
        // Mêmes réglages TLS que la connexion de jeu (cf. lobbyProbe). Le corps
        // peut les surcharger : le Check de /admin teste alors ce que l'admin a
        // SOUS LES YEUX, sans l'obliger à enregistrer d'abord.
        var _t = _tlsFromBody(d, host, port);
        var _sni = _t.sni || (/^[0-9.]+$/.test(host) ? '' : host);
        var opts = { host: host, port: port };
        var _pins = useTls ? _tlsPinsFor(host) : [];
        sock = useTls
          ? tls.connect(Object.assign({ rejectUnauthorized: _pins.length ? false : !(INSECURE_TLS || _t.noverify) }, (_sni ? { servername: _sni } : {}), opts), function () {
              if (_pins.length) { var _pe = _verifyTlsPin(sock, _pins); if (_pe) { console.warn('[probe] ' + _pe); return finish(false, 'tls pin mismatch'); } }
              finish(true, '');
            })
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
      lobbyProbe(host, port, useTls, function (r) { return adminJson(res, 200, r); }, _tlsFromBody(d, host, port));
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
      if (kind === 'seat' && ['', 'pokerth', 'chip', 'plate', 'card', 'compact', 'bar', 'onyx-pill', 'boardwalk', 'high-roller'].indexOf(id) >= 0) return adminJson(res, 400, { ok: false, error: 'built-in seat cannot be removed' });
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
    // plays : compteur par piste, affiche en face de chaque titre dans la
    // bibliotheque. Les radios n'y figurent jamais (elles ne sont pas mesurees).
    return adminJson(res, 200, { ok: true, enabled: musicEnabled(), tracks: musicListForAdmin(), plays: visitsStore.music || {} });
  }
  // Interrupteur global du lecteur. Portee 'music' : un token delegue a la musique
  // peut couper le lecteur sans avoir le token maitre.
  if (reqPathOnly === '/admin/music-enable' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('music', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      if (!d || typeof d.enabled !== 'boolean') return adminJson(res, 400, { ok: false, error: 'enabled (boolean) required' });
      _adminConfig.musicEnabled = d.enabled;
      saveAdminConfig();
      return adminJson(res, 200, { ok: true, enabled: musicEnabled() });
    });
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
  // Ajout d'une RADIO (flux live) : pas de fichier — l'entrée pointe sur une
  // URL de flux HTTPS (le client est servi en HTTPS : un flux http:// serait
  // bloqué en mixed content par le navigateur). L'entrée est un admin track
  // normal avec stream:true → onglet « Radios » du lecteur, LIVE badge côté
  // client, et gérée par les routes music-* existantes (toggle/edit/remove/order).
  if (reqPathOnly === '/admin/music-radio-add' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('music', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var title = musicStr(d && d.title, 120);
      if (!title) return adminJson(res, 400, { ok: false, error: 'title required' });
      var u = String(d && d.url || '').trim();
      if (!/^https:\/\/\S+$/i.test(u) || u.length > 500) return adminJson(res, 400, { ok: false, error: 'stream url must be https:// (max 500 chars)' });
      var id = uniqueMusicId(title);
      var artist = musicStr(d && d.artist, 120);
      var entry = {
        id: id, title: title, artist: artist, file: u, stream: true,
        license: musicStr(d && d.license, 60), licenseUrl: musicStr(d && d.licenseUrl, 300),
        source: musicStr(d && d.source, 120), sourceUrl: musicStr(d && d.sourceUrl, 300),
        credit: musicStr(d && d.credit, 300) || (title + (artist ? ' \u2014 ' + artist : '')),
        active: true
      };
      _adminConfig.musicTracks = musicAdminTracks().concat([entry]);
      saveAdminConfig();
      return adminJson(res, 200, { ok: true, id: id, title: title });
    });
  }
  // Import M3U : crée une radio par entrée https:// de la playlist (#EXTM3U).
  // Titre pris sur la ligne #EXTINF précédente si présente, sinon dérivé de
  // l'URL. Ignorées et comptées dans skipped : URLs http:// (mixed content —
  // le client est servi en HTTPS), URLs invalides/trop longues, doublons
  // (même URL déjà dans la bibliothèque).
  if (reqPathOnly === '/admin/music-radio-import' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('music', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var txt = String(d && d.m3u || '');
      if (!txt.trim()) return adminJson(res, 400, { ok: false, error: 'm3u content required' });
      if (txt.length > 512 * 1024) return adminJson(res, 400, { ok: false, error: 'playlist too large (max 512 KB)' });
      var arr = musicAdminTracks().slice();
      _adminConfig.musicTracks = arr;               // uniqueMusicId voit les ajouts au fil de l'eau
      var seen = {};
      arr.concat(musicBuiltins()).forEach(function (t) { if (t && t.file) seen[t.file] = 1; });
      var lines = txt.split(/\r?\n/), pend = '', added = [], skipped = 0;
      for (var k = 0; k < lines.length; k++) {
        var L = lines[k].trim();
        if (!L) continue;
        if (L.charAt(0) === '#') {
          var m = /^#EXTINF:[^,]*,(.*)$/.exec(L);
          if (m) pend = m[1].trim();
          continue;
        }
        if (!/^https:\/\/\S+$/i.test(L) || L.length > 500 || seen[L]) { skipped++; pend = ''; continue; }
        var title = musicStr(pend, 120) || L.replace(/^https:\/\//i, '').slice(0, 60);
        var id = uniqueMusicId(title);
        arr.push({ id: id, title: title, artist: '', file: L, stream: true, credit: title, active: true });
        seen[L] = 1; added.push({ id: id, title: title }); pend = '';
        if (added.length >= 200) break;              // garde-fou
      }
      saveAdminConfig();
      return adminJson(res, 200, { ok: true, added: added.length, skipped: skipped, items: added });
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
      if (t.stream && d && d.url != null && String(d.url).trim() !== '') {   // radio : URL de flux modifiable
        var _u = String(d.url).trim();
        if (!/^https:\/\/\S+$/i.test(_u) || _u.length > 500) return adminJson(res, 400, { ok: false, error: 'stream url must be https:// (max 500 chars)' });
        t.file = _u;
      }
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
  // Import d'une piste par URL : c'est le SERVEUR qui télécharge le MP3, donc
  // la limite de taille des requêtes entrantes (413 nginx) ne s'applique pas.
  if (reqPathOnly === '/admin/music-import' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('music', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var title = musicStr(d && d.title, 120);
      if (!title) return adminJson(res, 400, { ok: false, error: 'title required' });
      var u = String(d && d.url || '').trim();
      if (!u) return adminJson(res, 400, { ok: false, error: 'url required' });
      musicFetchUrl(u, function (err, buf) {
        if (err) return adminJson(res, 502, { ok: false, error: err });
        if (!buf || !buf.length) return adminJson(res, 502, { ok: false, error: 'empty download' });
        if (!isMp3(buf)) return adminJson(res, 400, { ok: false, error: 'downloaded file is not an MP3' });
        var r = musicRegisterTrack(d || {}, buf);
        if (r.error) return adminJson(res, 500, { ok: false, error: r.error });
        return adminJson(res, 200, { ok: true, id: r.id, title: r.title, bytes: buf.length });
      });
    });
  }
  // Upload par morceaux — begin : ouvre une session liée aux métadonnées.
  if (reqPathOnly === '/admin/music-upload-begin' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('music', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var title = musicStr(d && d.title, 120);
      if (!title) return adminJson(res, 400, { ok: false, error: 'title required' });
      var size = parseInt(d && d.size, 10);
      if (!(Number.isInteger(size) && size > 0 && size <= MAX_UPLOAD)) return adminJson(res, 400, { ok: false, error: 'bad size (max 25 MB)' });
      _mzGc();
      if (Object.keys(_mzSessions).length >= MZ_SESSION_CAP) return adminJson(res, 429, { ok: false, error: 'too many uploads in progress, retry later' });
      var uid = 'mz' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      var tmp = path.join(os.tmpdir(), 'mzup-' + uid + '.part');
      try { fs.writeFileSync(tmp, Buffer.alloc(0)); } catch (e) { return adminJson(res, 500, { ok: false, error: 'temp write failed' }); }
      _mzSessions[uid] = {
        tmp: tmp, size: size, got: 0, next: 0, touched: Date.now(),
        fields: { title: title, artist: d && d.artist, credit: d && d.credit, licenseUrl: d && d.licenseUrl, license: d && d.license, source: d && d.source, sourceUrl: d && d.sourceUrl }
      };
      return adminJson(res, 200, { ok: true, uid: uid, chunkMax: MZ_CHUNK_MAX });
    });
  }
  // Upload par morceaux — chunk : corps brut < 1 Mo, séquence stricte.
  if (reqPathOnly === '/admin/music-upload-chunk' && req.method === 'POST') {
    if (!hasScope('music', query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    var _cs = _mzSessions[String(query.uid || '')];
    if (!_cs) return adminJson(res, 404, { ok: false, error: 'unknown or expired upload session' });
    var _cSeq = parseInt(query.seq, 10);
    if (_cSeq !== _cs.next) return adminJson(res, 409, { ok: false, error: 'out of sequence (expected ' + _cs.next + ')' });
    return readRawBody(req, MZ_CHUNK_MAX, function (buf) {
      if (!buf || !buf.length) return adminJson(res, 413, { ok: false, error: 'empty chunk or chunk too large' });
      if (_cs.got + buf.length > _cs.size) { try { fs.rmSync(_cs.tmp, { force: true }); } catch (e) {} delete _mzSessions[String(query.uid || '')]; return adminJson(res, 400, { ok: false, error: 'more bytes than announced' }); }
      try { fs.appendFileSync(_cs.tmp, buf); } catch (e) { return adminJson(res, 500, { ok: false, error: 'temp write failed' }); }
      _cs.got += buf.length; _cs.next += 1; _cs.touched = Date.now();
      return adminJson(res, 200, { ok: true, got: _cs.got, next: _cs.next });
    });
  }
  // Upload par morceaux — finish : vérifie taille + signature MP3, enregistre.
  if (reqPathOnly === '/admin/music-upload-finish' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('music', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var uid = String(d && d.uid || '');
      var ss = _mzSessions[uid];
      if (!ss) return adminJson(res, 404, { ok: false, error: 'unknown or expired upload session' });
      delete _mzSessions[uid];
      var buf = null;
      try { buf = fs.readFileSync(ss.tmp); } catch (e) {}
      try { fs.rmSync(ss.tmp, { force: true }); } catch (e) {}
      if (!buf || buf.length !== ss.size) return adminJson(res, 400, { ok: false, error: 'incomplete upload (' + (buf ? buf.length : 0) + '/' + ss.size + ' bytes)' });
      if (!isMp3(buf)) return adminJson(res, 400, { ok: false, error: 'not an MP3 file' });
      var r = musicRegisterTrack(ss.fields, buf);
      if (r.error) return adminJson(res, 500, { ok: false, error: r.error });
      return adminJson(res, 200, { ok: true, id: r.id, title: r.title });
    });
  }
  // ── Historique des déploiements et retour arrière (clé maître) ──────────
  if (reqPathOnly === '/admin/deploys') {
    if (req.method === 'GET') {
      if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const head = GIT_UPDATABLE ? _gitOut(['rev-parse', 'HEAD']) : '';
      let version = '';
      try { version = (JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version) || ''; } catch (e) {}
      return adminJson(res, 200, { ok: true, gitUpdatable: GIT_UPDATABLE, installKind: installKind(),
        head: { sha: head, version: version, subject: GIT_UPDATABLE ? _gitOut(['log', '-1', '--format=%s']).slice(0, 200) : '' },
        history: _deployHistory });
    }
    if (req.method === 'POST') {
      return readJsonBody(req, function (d) {
        if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
        if (!GIT_UPDATABLE) return adminJson(res, 409, { ok: false, error: 'this install cannot roll back (' + installKind() + ': no git checkout in the app dir).' });
        const sha = String((d && d.rollback) || '');
        // Deux verrous, parce que ce SHA finit dans une commande shell : forme
        // strictement hexadécimale, ET présence dans l'historique — on ne
        // déploie que des états que ce serveur a réellement servis.
        if (!/^[0-9a-f]{40}$/.test(sha)) return adminJson(res, 400, { ok: false, error: 'invalid sha' });
        if (!_deployHistory.some(function (h) { return h.sha === sha; })) return adminJson(res, 404, { ok: false, error: 'sha not in deploy history' });
        if (sha === _gitOut(['rev-parse', 'HEAD'])) return adminJson(res, 400, { ok: false, error: 'already on that commit' });
        const restart = !!(d && d.restart);
        _deployRecord('before rollback');
        const started = runDetached(rollbackCmd(sha, restart), UPDATE_LOG);
        console.log('[admin] rollback to ' + sha.slice(0, 8) + (restart ? ' (with restart)' : ' (static only)'));
        return adminJson(res, started ? 200 : 500, { ok: started, started: started, sha: sha, restart: restart });
      });
    }
    res.writeHead(405); res.end('Method not allowed'); return;
  }
  if (reqPathOnly === '/admin/update' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      if (!GIT_UPDATABLE && !process.env.UPDATE_CMD) return adminJson(res, 409, { ok: false, error: 'this install cannot self-update (' + installKind() + ": no git checkout in the app dir). Update from the host: docker compose pull (or build) && docker compose up -d \u2014 or set UPDATE_CMD." });
      _deployRecord('before update');
      const started = runDetached(updateCmd(), UPDATE_LOG);
      console.log('[admin] self-update requested (' + installKind() + ': pull + deps + restart)');
      return adminJson(res, started ? 200 : 500, { ok: started, started: started });
    });
  }
  if (reqPathOnly === '/admin/update-nr' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      if (!GIT_UPDATABLE) return adminJson(res, 409, { ok: false, error: 'this install cannot self-update (' + installKind() + ': no git checkout in the app dir).' });
      _deployRecord('before static update');
      const started = runDetached(updateCmdStatic(), UPDATE_LOG);
      console.log('[admin] static self-update requested (git pull, no restart)');
      return adminJson(res, started ? 200 : 500, { ok: started, started: started });
    });
  }
  // État du sondage amont. Sans ?force=1 on rend le dernier résultat connu —
  // gratuit, donc consultable en continu par le tableau de bord.
  if (reqPathOnly === '/admin/update-check') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    if (!GIT_UPDATABLE) return adminJson(res, 409, { ok: false, error: 'this install cannot check for updates (' + installKind() + ': no git checkout in the app dir).' });
    if (query.force === '1' || query.force === 'true') {
      return updateCheck(function (u) {
        return adminJson(res, 200, { ok: !u.error, error: u.error || '', branch: GIT_BRANCH, state: _updPublic() });
      });
    }
    return adminJson(res, 200, { ok: true, branch: GIT_BRANCH, state: _updPublic() });
  }
  if (reqPathOnly === '/admin/auto-update') {
    if (req.method === 'GET') {
      if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const cfg = _autoUpdateCfg();
      return adminJson(res, 200, { ok: true, enabled: cfg.enabled, noticeSec: cfg.noticeSec,
        gitUpdatable: GIT_UPDATABLE, installKind: installKind(), branch: GIT_BRANCH,
        armed: (_autoArmed && _restartAt > Date.now()) ? _restartAt : null, state: _updPublic() });
    }
    if (req.method === 'POST') {
      return readJsonBody(req, function (d) {
        if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
        const c = (_adminConfig.autoUpdate && typeof _adminConfig.autoUpdate === 'object') ? _adminConfig.autoUpdate : {};
        if (d && d.noticeSec !== undefined) {
          const n = Math.floor(Number(d.noticeSec) || 0);
          if (!(n >= 10 && n <= 3600)) return adminJson(res, 400, { ok: false, error: 'noticeSec must be between 10 and 3600' });
          c.noticeSec = n;
        }
        if (d && d.enabled !== undefined) c.enabled = !!d.enabled;
        _adminConfig.autoUpdate = c;
        saveAdminConfig();
        const cfg = _autoUpdateCfg();
        // Décocher pendant un préavis armé automatiquement doit l'annuler : sinon
        // le redémarrage tomberait après que l'opérateur a dit non.
        if (!cfg.enabled && _autoArmed && _restartAt > Date.now()) {
          clearScheduledRestart();
          broadcastNotice('NOTICE:CANCEL');
          console.log('[auto-update] disabled — armed update cancelled');
        }
        console.log('[auto-update] ' + (cfg.enabled ? 'enabled' : 'disabled') + ' (notice ' + cfg.noticeSec + 's)');
        return adminJson(res, 200, { ok: true, enabled: cfg.enabled, noticeSec: cfg.noticeSec });
      });
    }
    res.writeHead(405); res.end('Method not allowed'); return;
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
        if (_restartKind !== 'restart') _deployRecord('before scheduled update');
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
  // ── Sauvegarde / restauration de la configuration (clé maître) ────────
  // Le trafic s'exportait, la configuration non : des mois de réglages ne
  // tenaient qu'à un fichier sur un VPS. Utile aussi pour transporter une
  // instance vers pokerth.net, ou pour reproduire un serveur à l'identique.
  //
  // N'y figurent PAS : les clés déléguées (scoped-tokens.json) ni les
  // identifiants MySQL (db-config.json). Ce sont des secrets, et une
  // restauration ne doit pas rétablir des accès qu'on croyait révoqués.
  if (reqPathOnly === '/admin/config/export') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    let v = '';
    try { v = (JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version) || ''; } catch (e) {}
    const out = { schema: 'pokerth-admin-config/1', exportedAt: new Date().toISOString(), version: v, config: _adminConfig || {} };
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
                         'Content-Disposition': 'attachment; filename="pokerth-admin-config.json"' });
    res.end(JSON.stringify(out, null, 2));
    return;
  }
  if (reqPathOnly === '/admin/config/import' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      // On accepte aussi bien le fichier exporté entier que le seul objet de
      // configuration — c'est le geste naturel d'un copier-coller.
      const src = (d && d.config && typeof d.config === 'object') ? d.config
                : (d && d.file && d.file.config && typeof d.file.config === 'object') ? d.file.config : null;
      if (!src) return adminJson(res, 400, { ok: false, error: 'no config object found' });
      // Liste blanche des clés de premier niveau : un fichier trafiqué ne peut
      // pas glisser de réglage inconnu dans la configuration vivante.
      // Every legitimate top-level key of _adminConfig must be listed here:
      // the import REPLACES the whole config, so a key missing from this
      // list is silently wiped by an export -> import round-trip. That is
      // exactly what happened to 'seo' (and the server list): restoring a
      // config reset SEO to Off. Keep in sync with the keys the code reads.
      const ALLOWED = ['resetPeriod', 'modes', 'welcome', 'defaultTheme', 'defaults', 'loginDefaults',
                       'proxyCfg', 'tableDefaults', 'tableNames', 'serverName', 'serverTagline',
                       'discordChatWebhookUrl', 'showLoginTitle', 'featureOff', 'bannedIps',
                       'pkgDisabled', 'pkgFull', 'pkgFullscreen', 'pkgAlign', 'musicTracks',
                       'musicEnabled', 'musicHidden', 'musicOrder',
                       'seo', 'servers', 'activeServerId', 'pokerthnetSource',
                       'internetTransport', 'proxyProtocol', 'serverlistUrl', 'autoUpdate'];
      const next = {}, taken = [], skipped = [];
      Object.keys(src).forEach(function (k) {
        if (ALLOWED.indexOf(k) >= 0) { next[k] = src[k]; taken.push(k); } else skipped.push(k);
      });
      if (!taken.length) return adminJson(res, 400, { ok: false, error: 'nothing importable in that file' });
      _adminConfig = next;
      saveAdminConfig();
      // Réglages miroirés dans des variables vivantes : à resynchroniser tout de
      // suite, sinon l'import ne prendrait effet qu'au redémarrage.
      if (typeof _adminConfig.resetPeriod === 'string' &&
          ['off', 'daily', 'weekly', 'monthly', 'yearly'].indexOf(_adminConfig.resetPeriod) >= 0) {
        STATS_RESET_PERIOD = _adminConfig.resetPeriod;
      }
      console.log('[admin] configuration imported (' + taken.length + ' setting(s), ' + skipped.length + ' ignored)');
      return adminJson(res, 200, { ok: true, imported: taken, ignored: skipped });
    });
  }
  // ── IP bloquées / bannies (clé maître uniquement) ──────────────────
  if (reqPathOnly === '/admin/blocked') {
    if (req.method === 'GET') {
      if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      if (!_rlAdminFail) return adminJson(res, 200, { ok: true, limiter: false, blocked: [], banned: bannedIps(), you: clientIp(req) });
      const ips = Array.from(_adminFailIps.keys());
      return Promise.all(ips.map(function (ip) {
        return _rlAdminFail.get(ip).then(function (r) {
          return { ip: ip, failed: r ? (r.consumedPoints || 0) : 0,
                   until: (r && r.msBeforeNext > 0 && r.remainingPoints <= 0) ? (Date.now() + r.msBeforeNext) : 0,
                   last: _adminFailIps.get(ip) || 0 };
        }).catch(function () { return null; });
      })).then(function (rows) {
        rows = rows.filter(Boolean).sort(function (a, b) { return b.last - a.last; });
        adminJson(res, 200, { ok: true, limiter: true, blocked: rows, banned: bannedIps(), you: clientIp(req) });
      }).catch(function () { adminJson(res, 500, { ok: false, error: 'limiter read failed' }); });
    }
    if (req.method === 'POST') {
      return readJsonBody(req, function (d) {
        if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
        d = d || {};
        if (d.unblock) {
          const ip = String(d.unblock);
          if (_rlAdminFail) { try { _rlAdminFail.delete(ip); } catch (e) {} }
          _adminFailIps.delete(ip);
          console.log('[admin] brute-force block lifted for ' + ip);
          return adminJson(res, 200, { ok: true, unblocked: ip });
        }
        if (d.ban) {
          const ip = _bannableIp(d.ban);
          if (!ip) return adminJson(res, 400, { ok: false, error: 'invalid or protected address' });
          if (ip === clientIp(req)) return adminJson(res, 400, { ok: false, error: 'that is your own address' });
          const list = bannedIps().slice();
          if (list.indexOf(ip) < 0) list.push(ip);
          _adminConfig.bannedIps = list.slice(0, 500);
          saveAdminConfig();
          // Coupe aussi les ponts déjà ouverts depuis cette adresse : bannir
          // quelqu'un qui joue déjà ne doit pas attendre sa prochaine connexion.
          let cut = 0;
          try {
            _liveSessions.forEach(function (S) { if (S.ip === ip) { const w = S.ws; S.ws = null; _destroySession(S); if (w) { try { _allClients.delete(w); } catch (e) {} try { w.close(4009, 'Banned'); } catch (e) {} } cut++; } });
            wss.clients.forEach(function (c) { if (c._notify && c._ip === ip) { try { c.close(4009, 'Banned'); } catch (e) {} cut++; } });
          } catch (e) {}
          console.log('[admin] banned ' + ip + (cut ? ' (' + cut + ' live connection(s) dropped)' : ''));
          return adminJson(res, 200, { ok: true, banned: bannedIps(), dropped: cut });
        }
        if (d.unban) {
          const ip = String(d.unban);
          _adminConfig.bannedIps = bannedIps().filter(function (x) { return x !== ip; });
          saveAdminConfig();
          console.log('[admin] unbanned ' + ip);
          return adminJson(res, 200, { ok: true, banned: bannedIps() });
        }
        return adminJson(res, 400, { ok: false });
      });
    }
    res.writeHead(405); res.end('Method not allowed'); return;
  }
  // ── Journal d'audit (clé maître uniquement) ───────────────────────
  if (reqPathOnly === '/admin/audit') {
    if (req.method === 'GET') {
      if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      return adminJson(res, 200, { ok: true, entries: _audit.slice(0, 200), total: _audit.length });
    }
    if (req.method === 'POST') {
      return readJsonBody(req, function (d) {
        if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
        if (d && d.clear) { _audit = []; _saveAuditSoon(); return adminJson(res, 200, { ok: true, cleared: true }); }
        return adminJson(res, 400, { ok: false });
      });
    }
    res.writeHead(405); res.end('Method not allowed'); return;
  }
  if (reqPathOnly === '/admin/whoami') {
    // Capability probe for the admin UI: report what the presented key may do.
    if (adminAuthed(query)) return adminJson(res, 200, { ok: true, master: true, scopes: ADMIN_SCOPES });
    var _wt = (query && query.token) || '', _wr = _loadScopedTokens().find(function (r) { return r.token === _wt; });
    if (_wr) return adminJson(res, 200, { ok: true, master: false, scopes: (_wr.scopes || []).filter(function (s) { return ADMIN_SCOPES.indexOf(s) >= 0; }) });
    return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
  }
  // ── Product polls (admin) — store and helpers defined near _pollPublic() ──
  if (reqPathOnly === '/admin/polls' && req.method === 'GET') {
    if (!hasScope('polls', query, null)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    return adminJson(res, 200, { ok: true, polls: _polls.map(_pollAdmin) });
  }
  // Create, or update in place when an existing id is supplied.
  if (reqPathOnly === '/admin/polls' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('polls', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const question = _pollLangMap(d && d.question, 300);
      if (!Object.keys(question).length) return adminJson(res, 400, { ok: false, error: 'question required' });
      const options = _pollParseOptions(d && d.options);
      if (!options) return adminJson(res, 400, { ok: false, error: 'need 2-10 options with unique ids and a label' });
      const def = (d && typeof d['default'] === 'string' && d['default']) ? d['default'].slice(0, 10) : 'en';
      const existing = (d && typeof d.id === 'string') ? _pollById(d.id) : null;
      if (existing) {
        // Reshaping the option set would orphan the ballots cast on the old ids,
        // so a changed set clears the tally instead of reporting a wrong total.
        const before = JSON.stringify((existing.options || []).map(function (o) { return o.id; }));
        const after = JSON.stringify(options.map(function (o) { return o.id; }));
        existing.question = question; existing.options = options; existing['default'] = def;
        if (after !== before) existing.voters = {};
        existing.updatedAt = Date.now(); savePollsSoon();
        return adminJson(res, 200, { ok: true, id: existing.id, poll: _pollAdmin(existing) });
      }
      const poll = {
        id: 'pl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        question: question, options: options, 'default': def,
        enabled: false, voters: {}, createdAt: Date.now(), updatedAt: Date.now()
      };
      _polls.push(poll); savePollsSoon();
      console.log('[polls] created ' + poll.id + ' (' + options.length + ' options)');
      return adminJson(res, 200, { ok: true, id: poll.id, poll: _pollAdmin(poll) });
    });
  }
  if (reqPathOnly === '/admin/polls/activate' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('polls', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const p = _pollById(d && d.id);
      if (!p) return adminJson(res, 404, { ok: false, error: 'not found' });
      // Exactly one poll is exposed at a time: activating one retires the others,
      // so /app-config never has to arbitrate between two live questions.
      if (d && d.enabled) _polls.forEach(function (q) { q.enabled = (q.id === p.id); });
      else p.enabled = false;
      p.updatedAt = Date.now(); savePollsSoon();
      console.log('[polls] ' + p.id + (p.enabled ? ' activated' : ' deactivated'));
      return adminJson(res, 200, { ok: true, enabled: !!p.enabled });
    });
  }
  if (reqPathOnly === '/admin/polls/reset' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('polls', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const p = _pollById(d && d.id);
      if (!p) return adminJson(res, 404, { ok: false, error: 'not found' });
      p.voters = {}; p.updatedAt = Date.now(); savePollsSoon();
      return adminJson(res, 200, { ok: true, poll: _pollAdmin(p) });
    });
  }
  if (reqPathOnly === '/admin/polls/delete' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('polls', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const i = _polls.findIndex(function (p) { return p && p.id === (d && d.id); });
      if (i < 0) return adminJson(res, 404, { ok: false, error: 'not found' });
      _polls.splice(i, 1); savePollsSoon();
      return adminJson(res, 200, { ok: true });
    });
  }
  if (reqPathOnly === '/admin/broadcasts' && req.method === 'GET') {
    if (!hasScope('broadcast', query, null)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    const now = Date.now();
    const jobs = _broadcasts.map(function (j) {
      return { id: j.id, message: j.message, icon: j.icon || '', target: j.target || 'all', schedule: j.schedule, enabled: !!j.enabled, lastRun: j.lastRun || null, runCount: j.runCount || 0, startAt: j.startAt || null, endAt: j.endAt || null, countdownAt: j.countdownAt || null, maxRuns: j.maxRuns || null, createdAt: j.createdAt || null, nextRun: (j.enabled ? computeNextRun(j, now) : null) };
    });
    let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    return adminJson(res, 200, { ok: true, jobs: jobs, serverNow: now, tz: tz });
  }
  if (reqPathOnly === '/admin/broadcast-now' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('broadcast', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const message = (d && typeof d.message === 'string') ? d.message.slice(0, 500) : '';
      if (!message.trim()) return adminJson(res, 400, { ok: false, error: 'message required' });
      const tgt = _bcTarget(d && d.target);
      const cd = (d && d.countdownAt && Number(d.countdownAt) > 0) ? Number(d.countdownAt) : 0;
      if (cd && cd <= Date.now()) return adminJson(res, 400, { ok: false, error: 'countdown already passed' });
      const n = broadcastNotice(_bcFrame(_bcIcon(d && d.icon), message, cd), tgt);
      console.log('[broadcast] one-off (' + tgt + ') -> ' + n + ' client(s)');
      return adminJson(res, 200, { ok: true, notified: n });
    });
  }
  if (reqPathOnly === '/admin/broadcasts' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!hasScope('broadcast', query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      if (!d || typeof d.message !== 'string' || !d.message.trim()) return adminJson(res, 400, { ok: false, error: 'message required' });
      const sched = _bcValidateSchedule(d.schedule);
      if (!sched) return adminJson(res, 400, { ok: false, error: 'invalid schedule' });
      const _cd = (d.countdownAt && Number(d.countdownAt) > 0) ? Number(d.countdownAt) : null;
      if (_cd && _cd <= Date.now()) return adminJson(res, 400, { ok: false, error: 'countdown already passed' });
      const _st = (d.startAt && Number(d.startAt) > 0) ? Number(d.startAt) : null;
      const _en = (d.endAt && Number(d.endAt) > Date.now()) ? Number(d.endAt) : null;
      if (_st && _en && _st >= _en) return adminJson(res, 400, { ok: false, error: 'start must be before end' });
      const job = {
        id: 'bc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        message: d.message.slice(0, 500),
        icon: _bcIcon(d.icon),
        schedule: sched,
        enabled: d.enabled === false ? false : true,
        startAt: _st,
        endAt: _en,
        countdownAt: _cd,
        maxRuns: (d.maxRuns && Number(d.maxRuns) > 0) ? Math.floor(Number(d.maxRuns)) : null,
        target: _bcTarget(d.target),
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
  // Submit every known URL to IndexNow now, bypassing the hourly throttle.
  if (reqPathOnly === '/admin/seo/ping' && req.method === 'POST') {
    return readJsonBody(req, function (d) {
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      var answered = false, guard = null;
      var reply = function (o) {
        if (answered) return; answered = true;
        if (guard) clearTimeout(guard);
        return adminJson(res, 200, { ok: !!o.ok, status: o.status || 0, count: o.count || 0, error: o.error || '', indexNow: _seoAdmin().indexNow });
      };
      // IndexNow answers in well under ten seconds or not at all; the request
      // itself already carries a 10 s timeout, this is the belt to its braces.
      guard = setTimeout(function () { reply({ ok: false, error: 'no answer within 12 s — check the log' }); }, 12000);
      try { seoIndexNowPing(true, reply); } catch (e) { reply({ ok: false, error: e.message }); }
    });
  }
  // Configuration check. Everything here is answered from local state: a proxy
  // behind Cloudflare often cannot reach its own public URL, so a failed
  // self-fetch would report a problem that does not exist.
  if (reqPathOnly === '/admin/seo/check') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    var _ck = [];
    var _add = function (level, text) { _ck.push({ level: level, text: text }); };
    var _on = seoEnabled(), _base = seoPublicUrl();
    if (!_on) _add('warn', 'Indexing is off — every page is served noindex and robots.txt blocks all crawlers.');
    else _add('ok', 'Indexing is on.');
    if (!_base) _add(_on ? 'err' : 'warn', 'No public URL set — canonical links, sitemap.xml and llms.txt cannot be generated.');
    else {
      _add('ok', 'Public URL: ' + _base);
      if (/^http:\/\//i.test(_base)) _add('warn', 'The public URL is http:// — search engines treat https as a ranking signal, and the app needs it anyway.');
      var _hh = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
      var _bh = '';
      try { _bh = _base.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase(); } catch (e) {}
      if (_hh && _bh && _hh !== _bh) _add('warn', 'You are viewing this page on ' + _hh + ' but the public URL says ' + _bh + '. If that is not deliberate, crawlers are being pointed at the wrong host.');
    }
    try {
      var _hp = path.join(__dirname, 'public', 'pokerth-client.html');
      var _hs = fs.readFileSync(_hp, 'utf8');
      if (_hs.indexOf('<!--__SEO_HEAD__-->') === -1) _add('err', 'pokerth-client.html has no <!--__SEO_HEAD__--> placeholder — no SEO tags can be injected.');
      else _add('ok', 'SEO placeholders found in the served page.');
    } catch (e) { _add('err', 'pokerth-client.html could not be read.'); }
    var _imc = seoImage(_base);
    if (_imc.sized) {
      try { fs.statSync(path.join(__dirname, 'public', 'screenshots', 'social-preview.png')); _add('ok', 'Social card image present (bundled 1200×630).'); }
      catch (e) { _add('err', 'screenshots/social-preview.png is missing — shared links will have no preview image.'); }
    } else if (_imc.url) _add('ok', 'Custom social card image: ' + _imc.url + ' (make sure it is around 1200×630 and publicly reachable).');
    else _add('warn', 'The custom social image is neither an absolute URL nor a path starting with / — it is being ignored.');
    var _ink = String(_seoCfg().indexNowKey || '');
    if (_on && _base) {
      if (/^[a-f0-9]{32}$/.test(_ink)) {
        _add('ok', 'IndexNow key served at /' + _ink + '.txt.');
        if (_indexNowStat.at) {
          _add(_indexNowStat.error ? 'warn' : 'ok', 'Last IndexNow submission: ' + new Date(_indexNowStat.at).toISOString().replace('T', ' ').slice(0, 19) + ' UTC, ' + _indexNowStat.count + ' URLs' + (_indexNowStat.error ? ' — ' + _indexNowStat.error : ' — accepted'));
        } else _add('warn', 'No IndexNow submission yet in this process.');
      } else _add('warn', 'No IndexNow key yet — it is generated on the next save with indexing on.');
    }
    if (!seoGsv()) _add('warn', 'No Google Search Console token — optional, but without it you cannot see how the site actually performs.');
    if (!seoBingv()) _add('warn', 'No Bing Webmaster token (optional).');
    var _rl = seoPageLangs(SEO_RULES_I18N).length, _fl = seoPageLangs(SEO_FAQ_I18N).length, _tot = 0;
    for (var _c in SEO_I18N) _tot++;
    var _cov = [['/rules', _rl], ['/faq', _fl], ['/hand-rankings', seoPageLangs(SEO_HANDS_I18N).length],
      ['/how-to-play', seoPageLangs(SEO_HOWTO_I18N).length], ['/glossary', seoPageLangs(SEO_GLOSSARY_I18N).length]];
    _cov.forEach(function (c) {
      // seoPageLangs() always carries 'en', which is the page itself, not a
      // translation — counting it would have claimed 45 of 44.
      var _n = Math.max(0, c[1] - 1);
      _add(_n ? 'ok' : 'warn', c[0] + ' translated into ' + _n + ' of ' + (_tot - 1) + ' non-English languages.');
    });
    _add(seoAiCrawlers() ? 'ok' : 'warn', seoAiCrawlers() ? 'AI crawlers are allowed and llms.txt is served.' : 'AI crawlers are refused in robots.txt and llms.txt returns 404.');
    var _urlCount = _base ? seoIndexNowUrls(_base).length : 0;
    if (_urlCount) _add('ok', 'sitemap.xml advertises ' + _urlCount + ' URLs.');
    return adminJson(res, 200, { ok: true, checks: _ck, indexNow: _seoAdmin().indexNow });
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
// UA whiteliste par le filtre Cloudflare de sp0ck (= celui du client QML officiel,
// WebNetworkAccessManager). Verifie le 2026-07-02 : BBC/WEC/PTH passent en 200.
const RANKING_UA = 'PokerTH/2.0 (Qt Network)';

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


// ── Community suggest botfiles relay (parite QML 2.1.5, Config.BotSuggest) ──
// Le client QML tire trois fichiers texte de bbc.pokerth.net et les analyse
// lui-meme. Un navigateur ne peut pas : pas de CORS sur cet hote, et l'UA que
// le filtre Cloudflare attend n'est pas posable en JS. On relaie donc a
// l'identique — texte brut, aucune interpretation ici. Le parsing et le
// classement restent cote client (modules/lobby/botsuggest.mjs), calques sur
// BotSuggest.qml : ainsi un changement de format amont se corrige par un
// deploiement statique, sans redemarrer le proxy.
//
//   GET /api/botfile?f=minidb|weclist|gameslist  -> text/plain
//
// Cache 15 minutes, exactement le cacheTtlMs du singleton QML.
const BOTFILE_BASE = 'https://bbc.pokerth.net/exp3/bbcbot/';
const BOTFILE_TTL_MS = 15 * 60 * 1000;
const BOTFILE_NAMES = { minidb: 'minidb.txt', weclist: 'weclist.txt', gameslist: 'gameslist.txt' };

function handleBotfile(req, res, query) {
  const key = String((query && query.f) || '').toLowerCase();
  const name = BOTFILE_NAMES[key];
  if (!name) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'unknown_file', allowed: Object.keys(BOTFILE_NAMES) }));
    return;
  }
  const cacheKey = 'botfile|' + key;
  const hit = RANKING_CACHE.get(cacheKey);
  if (hit && (Date.now() - hit.at) < BOTFILE_TTL_MS) {
    res.writeHead(hit.status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Botfile-Cache': 'hit' });
    res.end(hit.body);
    return;
  }
  rankingFetch(BOTFILE_BASE + name).then(function (r) {
    return r.text().then(function (body) { return { status: r.ok ? 200 : 502, body: body }; });
  }).then(function (out) {
    // Ne cacher qu'un succes : une page d'erreur Cloudflare mise en cache
    // quinze minutes couperait la fonction bien apres le retablissement.
    if (out.status === 200) RANKING_CACHE.set(cacheKey, { at: Date.now(), status: 200, body: out.body });
    res.writeHead(out.status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': out.status === 200 ? 'public, max-age=300' : 'no-store', 'X-Botfile-Cache': 'miss' });
    res.end(out.body);
  }).catch(function (err) {
    // Repli sur des donnees perimees plutot que rien, comme le fait QML quand
    // le chargement echoue et que le cache precedent existe encore.
    const stale = RANKING_CACHE.get(cacheKey);
    if (stale) {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Botfile-Cache': 'stale' });
      res.end(stale.body);
      return;
    }
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'relay_failed', detail: String((err && err.message) || err) }));
  });
}


// ── Table ranking relay (parite QML GameTableStatsPage) ────────────────────
// Le client appelle /api/tableranking?nicks=a,b,c (sieges dans l'ordre) et on
// relaie le POST JSON de la vue table de pokerth.net (meme endpoint que le
// lien « nom de table » du client officiel) :
//   POST /pthranking/gametable/show   body { u1:…, …, u10:… }
//   -> { status, msg:[{ player_id, username, rank_pos, final_score,
//        average_score, season_games, points_sum }] }   (scores ×100)
// Les nicks inconnus (invites / sans saison) sont simplement omis par le
// serveur. BBC/WEC : pas d'endpoint dedie — le client filtre /api/ranking.
function handleTableRanking(req, res, query) {
  const raw = String((query && query.nicks) || '').slice(0, 700);
  const nicks = raw.split(',').map(function (s) { return s.trim().slice(0, 64); })
                   .filter(Boolean).slice(0, 10);
  if (!nicks.length) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'no_nicks' }));
    return;
  }
  const cacheKey = 'tbl|' + nicks.join(',').toLowerCase();
  const hit = RANKING_CACHE.get(cacheKey);
  if (hit && (Date.now() - hit.at) < RANKING_TTL_MS) {
    res.writeHead(hit.status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=30', 'X-Ranking-Cache': 'hit' });
    res.end(hit.body);
    return;
  }
  const payload = {};
  for (let i = 1; i <= 10; i++) payload['u' + i] = nicks[i - 1] || '';
  rankingFetch('https://www.pokerth.net/pthranking/gametable/show', {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json'
  }, { method: 'POST', body: JSON.stringify(payload) })
    .then(function (r) { return r.text().then(function (body) { return { r: r, body: body }; }); })
    .then(function (o) {
      let out;
      if (!o.r.ok) {
        out = { status: 502, body: JSON.stringify({ ok: false, error: 'upstream_' + o.r.status, source: 'PTH' }) };
      } else {
        let json = null;
        try { json = JSON.parse(o.body); } catch (e) { /* parse_failed ci-dessous */ }
        if (!json || !json.status || !Array.isArray(json.msg)) {
          out = { status: 502, body: JSON.stringify({ ok: false, error: 'parse_failed', source: 'PTH' }) };
        } else {
          // Le serveur repond en ordre de requete (sieges) — trier par
          // placement comme la page QML (meilleur d'abord). Scores ×100.
          const list = json.msg.slice().sort(function (a, b) { return a.rank_pos - b.rank_pos; });
          const rows = list.map(function (r) {
            return {
              rank: r.rank_pos,
              player: r.username,
              games: r.season_games,
              avg: (Number(r.average_score) / 100).toFixed(2),
              score: (Number(r.final_score) / 100).toFixed(2)
            };
          });
          out = { status: 200, body: JSON.stringify({ ok: true, source: 'PTH', rows: rows }) };
        }
      }
      RANKING_CACHE.set(cacheKey, { at: Date.now(), status: out.status, body: out.body });
      res.writeHead(out.status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=30', 'X-Ranking-Cache': 'miss' });
      res.end(out.body);
    })
    .catch(function (err) {
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
    points: (b.points != null ? b.points : null),
    places: (Array.isArray(b.places) ? b.places : null)
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
  // Les images d'awards sont relayees par /api/award-img : chargees en direct
  // depuis le navigateur, Cloudflare les bloque (hotlink/challenge sur *.pokerth.net
  // avec Referer etranger). Le VPS, lui, passe grace a RANKING_UA.
  const awards = (Array.isArray(awardsRaw) ? awardsRaw : []).map(function (a) {
    let file = (a && a.filename) ? String(a.filename) : '';
    if (file.indexOf(base) === 0) file = file.slice(base.length);   // absolue -> chemin
    let img = '';
    if (AWARD_FILE_RE.test(file)) {
      img = '/api/award-img?src=' + source.toLowerCase() + '&file=' + encodeURIComponent(file);
    } else if (file && file.charAt(0) === '/') {
      img = base + file;                                            // repli : direct
    } else {
      img = file;
    }
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
  // Repartition des places (Season Stats) : pokerth.net renvoie bar_stats (comptes
  // par place 1..10) + stats[1] (objet {"1":"8.3%",...}). On les transmet tels
  // quels pour le camembert du profil (parite QML SeasonStatsSection).
  const _bs = Array.isArray(json.bar_stats) ? json.bar_stats : [];
  const _counts = [];
  for (let _p = 0; _p < 10; _p++) _counts.push(Number(_bs[_p]) || 0);
  const _pctObj = (json.stats && json.stats.length > 1 && json.stats[1] && typeof json.stats[1] === 'object') ? json.stats[1] : null;
  const _percents = [];
  for (let _p = 1; _p <= 10; _p++) _percents.push(_pctObj && _pctObj[_p] != null ? String(_pctObj[_p]) : '');
  const placement = _counts.some(function (n) { return n > 0; }) ? { counts: _counts, percents: _percents } : null;
  return {
    ok: true,
    source: 'PTH',
    nickname: p.username,
    memberSince: (p.created ? String(p.created).slice(0, 10) : null),
    tickets: null,
    awards: [],
    stats: hasStats ? [block] : [],
    placement: placement
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

// ── Award image relay ───────────────────────────────────────────────────────
// GET /api/award-img?src=bbc|wec|pth&file=/storage/awards/<name>.<ext>
// Chemin strictement valide (un seul segment, extensions image), fetch amont
// avec RANKING_UA, cache memoire 6 h (noms de fichiers content-addressed).
const AWARD_FILE_RE = /^\/storage\/awards\/[A-Za-z0-9._-]+\.(png|jpe?g|gif|webp)$/;
const AWARD_CACHE = new Map();          // file url -> { at, status, type, buf }
const AWARD_TTL_MS = 6 * 60 * 60 * 1000;
const AWARD_CACHE_MAX = 200;
function handleAwardImg(req, res, query) {
  const src = PLAYER_SOURCES[String((query && query.src) || '').toLowerCase()];
  const file = String((query && query.file) || '');
  if (!src || !AWARD_FILE_RE.test(file)) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'bad_award_request' }));
    return;
  }
  const targetUrl = src.base + file;
  const hit = AWARD_CACHE.get(targetUrl);
  if (hit && (Date.now() - hit.at) < AWARD_TTL_MS) {
    res.writeHead(hit.status, { 'Content-Type': hit.type, 'Cache-Control': 'public, max-age=86400', 'X-Award-Cache': 'hit' });
    res.end(hit.buf);
    return;
  }
  rankingFetch(targetUrl, { 'Accept': 'image/*' }).then(function (r) {
    if (!r.ok) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ ok: false, error: 'upstream_' + r.status }));
      return null;
    }
    const type = r.headers.get('content-type') || 'image/png';
    return r.arrayBuffer().then(function (ab) {
      const buf = Buffer.from(ab);
      if (AWARD_CACHE.size >= AWARD_CACHE_MAX) AWARD_CACHE.clear();
      AWARD_CACHE.set(targetUrl, { at: Date.now(), status: 200, type: type, buf: buf });
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400', 'X-Award-Cache': 'miss' });
      res.end(buf);
    });
  }).catch(function (err) {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'relay_failed', detail: String((err && err.message) || err) }));
  });
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



// ───────────────────────────────────────────────────────────────────────────
// Forum news relay — phpBB Atom feed of www.pokerth.net exposed as
// same-origin JSON for the web client (lobby "Forum" window). The browser
// cannot read the feed directly (no CORS header on app.php/feed), so we
// fetch it here with the whitelisted UA, parse the few fields the widget
// needs (title / author / date / forum / link) and cache the JSON for
// 10 minutes to spare the forum. The heavy HTML <content> is deliberately
// dropped. Stale cache is served if the upstream fails (same philosophy
// as the BBC ranking relay above).
const FORUM_FEED_URL = 'https://www.pokerth.net/app.php/feed';
const FORUM_TTL_MS = 10 * 60 * 1000;
const FORUM_MAX_POSTS = 40;

// Plain-text excerpt of a post body: strip the phpBB HTML, decode the
// entities, drop the "Statistics: Posted by ..." footer phpBB appends,
// collapse whitespace and cut at a word boundary. The client shows this
// as the click-to-expand preview; the full post stays on the forum.
const FORUM_EXCERPT_MAX = 280;
const FORUM_HTML_MAX = 30000;
const FORUM_SITE_BASE = 'https://www.pokerth.net';

// Corps HTML d'un post pour l'affichage DANS la fenetre (parite QML
// ForumPostPage). Nettoyage cote relais, le client n'insere jamais le flux
// brut : pied phpBB retire, scripts/iframes/handlers/javascript: supprimes,
// URLs relatives absolutisees, font-family/line-height retires (la police de
// l'app reste). L'adaptation des couleurs au theme se fait cote client (le
// relais ne connait pas le theme).
function forumAbsUrl(u) {
  const v = String(u || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (v.indexOf('//') === 0) return 'https:' + v;
  if (v.indexOf('./') === 0) return FORUM_SITE_BASE + '/' + v.slice(2);
  if (v.charAt(0) === '/') return FORUM_SITE_BASE + v;
  return FORUM_SITE_BASE + '/' + v;
}
function forumCleanHtml(html) {
  let s = String(html || '');
  // pied « Statistics: Posted by … » (parfois dans un <p>, parfois nu)
  const mp = /<p[^>]*>\s*Statistics: Posted by/i.exec(s);
  if (mp) s = s.slice(0, mp.index);
  else { const i = s.indexOf('Statistics: Posted by'); if (i >= 0) s = s.slice(0, i); }
  // blocs actifs et commentaires
  s = s.replace(/<!--[\s\S]*?-->/g, '')
       .replace(/<(script|style|iframe|object|embed|form|link|meta)\b[\s\S]*?(<\/\1>|>)/gi, '');
  // handlers inline et URLs javascript:
  s = s.replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
       .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
       .replace(/(href|src)\s*=\s*"\s*javascript:[^"]*"/gi, '$1="#"')
       .replace(/(href|src)\s*=\s*'\s*javascript:[^']*'/gi, "$1='#'");
  // URLs relatives -> absolues (le flux utilise "/images/…" et "./…")
  s = s.replace(/(href|src)="([^"]*)"/gi, function (all, attr, val) {
    return attr + '="' + forumAbsUrl(val) + '"';
  });
  // typo : la police et l'interligne de l'app priment
  s = s.replace(/font-family\s*:[^;"'>]*;?/gi, '')
       .replace(/line-height\s*:[^;"'>]*;?/gi, '');
  // separateurs residuels en fin de post
  s = s.replace(/(?:\s|<hr\s*\/?>|<br\s*\/?>)+$/i, '');
  // Images via le relais /api/forumimg : le hotlink direct depuis un
  // navigateur est bloque par Cloudflare (l'AppImage passe grace a l'UA
  // whiteliste, que le relais utilise aussi).
  s = s.replace(/src="(https:\/\/(?:www\.)?pokerth\.net\/[^"]*)"/gi, function (all, u) {
    return 'src="/api/forumimg?u=' + encodeURIComponent(u) + '"';
  });
  if (s.length > FORUM_HTML_MAX) s = s.slice(0, FORUM_HTML_MAX);
  return s;
}

// ── Relais des images de posts (logos, pieces jointes du forum) ──
// Meme modele que le relais des recompenses (handleAwardImg) : UA
// whiteliste, cache memoire borne, Content-Type transmis. Strictement
// limite a pokerth.net pour ne pas devenir un proxy ouvert.
const FORUMIMG_CACHE = new Map();
const FORUMIMG_CACHE_MAX = 24;
const FORUMIMG_TTL_MS = 24 * 3600 * 1000;
const FORUMIMG_MAX_BYTES = 4 * 1024 * 1024;   // au-dela : servi mais pas cache
function handleForumImg(req, res, query) {
  const u = String((query && query.u) || '');
  if (!/^https:\/\/(www\.)?pokerth\.net\//i.test(u)) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'bad_image_url' }));
    return;
  }
  const hit = FORUMIMG_CACHE.get(u);
  if (hit && (Date.now() - hit.at) < FORUMIMG_TTL_MS) {
    res.writeHead(200, { 'Content-Type': hit.type, 'Cache-Control': 'public, max-age=86400', 'X-Forum-Cache': 'hit' });
    res.end(hit.buf);
    return;
  }
  rankingFetch(u, { 'Accept': 'image/*' }).then(function (r) {
    if (!r.ok) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ ok: false, error: 'upstream_' + r.status }));
      return null;
    }
    const type = r.headers.get('content-type') || 'image/png';
    return r.arrayBuffer().then(function (ab) {
      const buf = Buffer.from(ab);
      if (buf.length <= FORUMIMG_MAX_BYTES) {
        if (FORUMIMG_CACHE.size >= FORUMIMG_CACHE_MAX) FORUMIMG_CACHE.clear();
        FORUMIMG_CACHE.set(u, { at: Date.now(), type: type, buf: buf });
      }
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400', 'X-Forum-Cache': 'miss' });
      res.end(buf);
    });
  }).catch(function (err) {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'relay_failed', detail: String((err && err.message) || err) }));
  });
}
function forumExcerpt(html) {
  let s = String(html || '');
  const foot = s.indexOf('Statistics: Posted by');
  if (foot >= 0) s = s.slice(0, foot);
  s = s.replace(/<(?:br|\/p|\/div|\/li|hr)[^>]*>/gi, ' ')
       .replace(/<[^>]+>/g, '')
       .replace(/&nbsp;/gi, ' ');
  s = rankingDecodeHtml(s).replace(/\s+/g, ' ').trim();
  if (s.length > FORUM_EXCERPT_MAX) {
    s = s.slice(0, FORUM_EXCERPT_MAX);
    const sp = s.lastIndexOf(' ');
    if (sp > FORUM_EXCERPT_MAX * 0.6) s = s.slice(0, sp);
    s += '\u2026';
  }
  return s;
}

function forumParseAtom(xml) {
  const posts = [];
  const chunks = String(xml || '').split('<entry>');
  for (let i = 1; i < chunks.length && posts.length < FORUM_MAX_POSTS; i++) {
    const c = chunks[i];
    const g = function (re) { const m = re.exec(c); return m ? m[1] : ''; };
    const rawTitle = rankingDecodeHtml(g(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/));
    const link = g(/<link href="([^"]+)"\/?>/);
    if (!rawTitle || !link) continue;
    // phpBB titles read "Forum \u2022 Topic"; the <category term> carries the
    // forum too — prefer it, fall back to the title prefix.
    let forum = rankingDecodeHtml(g(/<category term="([^"]*)"/));
    let title = rawTitle;
    const bi = rawTitle.indexOf(' \u2022 ');
    if (bi > 0) { if (!forum) forum = rawTitle.slice(0, bi); title = rawTitle.slice(bi + 3); }
    posts.push({
      id: link,
      link: link,
      forum: forum,
      title: title,
      author: g(/<author><name><!\[CDATA\[([\s\S]*?)\]\]>/),
      date: g(/<published>([^<]+)<\/published>/) || g(/<updated>([^<]+)<\/updated>/),
      excerpt: forumExcerpt(g(/<content[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/content>/)),
      html: forumCleanHtml(g(/<content[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/content>/))
    });
  }
  return posts;
}

function handleForumFeed(req, res) {
  const cacheKey = 'forumfeed';
  const hit = RANKING_CACHE.get(cacheKey);
  if (hit && (Date.now() - hit.at) < FORUM_TTL_MS) {
    res.writeHead(hit.status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=120', 'X-Forum-Cache': 'hit' });
    res.end(hit.body);
    return;
  }
  rankingFetch(FORUM_FEED_URL, { 'Accept': 'application/atom+xml, application/xml, text/xml, */*' }).then(function (r) {
    if (!r.ok) throw new Error('upstream_' + r.status);
    return r.text();
  }).then(function (xml) {
    const posts = forumParseAtom(xml);
    if (!posts.length) throw new Error('parse_empty');
    const body = JSON.stringify({ ok: true, at: Date.now(), posts: posts });
    RANKING_CACHE.set(cacheKey, { at: Date.now(), status: 200, body: body });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=120', 'X-Forum-Cache': 'miss' });
    res.end(body);
  }).catch(function (err) {
    const stale = RANKING_CACHE.get(cacheKey);
    if (stale && stale.status === 200) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Forum-Cache': 'stale' });
      res.end(stale.body);
      return;
    }
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
    const q = url.parse(req.url, true).query;
    if (_rlAdminFail) {
      const ip = clientIp(req);
      res._rlIp = ip;
      // Read-only dashboard polls (auto-refreshed on a timer) are not credential
      // submissions — never count their 403s toward the brute-force block.
      // /admin/sessions refreshes every 5 s: with a stale token it alone used
      // to rack up 10 penalized 403s in 50 s and lock the admin's own IP out.
      // Online brute force through these GETs is unrealistic anyway: the token
      // is a high-entropy value from the environment, not a guessable password.
      if (req.method === 'GET' && (reqPathOnly === '/admin/status' || reqPathOnly === '/admin/logs'
          || reqPathOnly === '/admin/sessions' || reqPathOnly === '/admin/broadcasts')) res._rlNoPenalty = true;
      if (req.method === 'POST') res.on('finish', function () { auditRecord(req, res, reqPathOnly, q); });
      _rlAdminFail.get(ip).then(function (r) {
        if (r && r.remainingPoints <= 0 && r.msBeforeNext > 0) {
          res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8', 'Retry-After': String(Math.ceil(r.msBeforeNext / 1000)), 'Cache-Control': 'no-store' });
          res.end(JSON.stringify({ ok: false, error: 'too many failed attempts, retry later' }));
        } else handleAdmin(req, res, reqPathOnly, q);
      }).catch(function () { handleAdmin(req, res, reqPathOnly, q); });
    } else handleAdmin(req, res, reqPathOnly, q);
    return;
  }
  if (reqPathOnly === '/' || reqPathOnly === '/index.html' || reqPathOnly === '/pokerth-client.html') {
    // Served through the SEO injector: <!--__SEO_HEAD__--> / <!--__SEO_BODY__-->
    // are resolved at serve time from the admin setting (noindex when off).
    return sendClientHtml(req, res);
  }

  // ── SEO endpoints — content follows the admin toggle (OFF by default) ──
  if (reqPathOnly === '/robots.txt') {
    var _rOn = seoEnabled(), _rBase = _rOn ? seoPublicUrl() : '';
    var _rTxt;
    if (_rOn) {
      var _rAi = seoAiCrawlers();
      _rTxt = 'User-agent: *\nAllow: /\nDisallow: /admin\n\n' +
        (_rAi ? '# AI crawlers explicitly welcome\n' : '# AI crawlers refused by the operator\n') +
        SEO_AI_BOTS.map(function (b) { return 'User-agent: ' + b + '\n' + (_rAi ? 'Allow: /' : 'Disallow: /') + '\n'; }).join('\n') +
        (_rBase ? '\nSitemap: ' + _rBase + '/sitemap.xml\n' : '');
    } else {
      _rTxt = 'User-agent: *\nDisallow: /\n';
    }
    res.writeHead(200, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, must-revalidate' }, SECURITY_HEADERS));
    res.end(_rTxt);
    return;
  }
  if (reqPathOnly === '/sitemap.xml') {
    var _sBase = seoEnabled() ? seoPublicUrl() : '';
    if (!_sBase) { res.writeHead(404); res.end('Not found'); return; }
    // Language variants of / carry the full hreflang alternate set via
    // xhtml:link, per Google's sitemap guidance for multilingual sites
    // (https://developers.google.com/search/docs/specialty/international/localized-versions#sitemap).
    // The set comes from seoHreflangPairs, the same helper the <head> uses,
    // so the two can never drift apart.
    var _sAlt = seoHreflangPairs(_sBase).map(function (p) {
      return '<xhtml:link rel="alternate" hreflang="' + p[0] + '" href="' + p[1] + '"/>';
    }).join('');
    // <lastmod> — the app pages date from the newest served asset, the
    // server-rendered pages from proxy.js itself.
    var _sModApp = seoLastModApp(), _sModSelf = seoLastModSelf();
    var _sLm = function (d) { return d ? '<lastmod>' + d + '</lastmod>' : ''; };
    var _sVariants = '';
    for (var _sc2 in SEO_I18N) {
      if (_sc2 === 'en') continue;
      _sVariants += '<url><loc>' + _sBase + '/?lang=' + _sc2 + '</loc>' + _sLm(_sModApp) + _sAlt + '<changefreq>weekly</changefreq><priority>0.8</priority></url>\n';
    }
    var _sXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
      '<url><loc>' + _sBase + '/</loc>' + _sLm(_sModApp) + _sAlt + '<changefreq>weekly</changefreq><priority>1.0</priority></url>\n' +
      _sVariants +
      _seoPageUrls(_sBase, '/rules', seoPageLangs(SEO_RULES_I18N), 'monthly', '0.6') +
      _seoPageUrls(_sBase, '/faq', seoPageLangs(SEO_FAQ_I18N), 'monthly', '0.5') +
      _seoPageUrls(_sBase, '/hand-rankings', seoPageLangs(SEO_HANDS_I18N), 'monthly', '0.7') +
      _seoPageUrls(_sBase, '/how-to-play', seoPageLangs(SEO_HOWTO_I18N), 'monthly', '0.7') +
      _seoPageUrls(_sBase, '/glossary', seoPageLangs(SEO_GLOSSARY_I18N), 'monthly', '0.5') +
      '<url><loc>' + _sBase + '/privacy</loc>' + _sLm(_sModSelf) + '<changefreq>yearly</changefreq><priority>0.2</priority></url>\n' +
      '</urlset>\n';
    res.writeHead(200, Object.assign({ 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-cache, must-revalidate' }, SECURITY_HEADERS));
    res.end(_sXml);
    return;
  }
  if (reqPathOnly === '/llms.txt') {
    // The file exists to brief AI crawlers. Serving it while robots.txt tells
    // those same crawlers to stay out would be talking out of both sides.
    if (!seoEnabled() || !seoAiCrawlers()) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, must-revalidate' }, SECURITY_HEADERS));
    res.end(seoLlmsTxt(seoPublicUrl()));
    return;
  }
  // IndexNow key file — /<key>.txt proves ownership of the submitted host.
  if (seoEnabled()) {
    var _inKey = seoIndexNowKey();
    if (_inKey && reqPathOnly === '/' + _inKey + '.txt') {
      res.writeHead(200, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, must-revalidate' }, SECURITY_HEADERS));
      res.end(_inKey);
      return;
    }
  }
  if (reqPathOnly === '/rules' || reqPathOnly === '/rules.html') {
    return seoRulesPage(res, req.method, seoEnabled() ? seoLangFromQuery(req.url) : '');
  }
  if (reqPathOnly === '/faq' || reqPathOnly === '/faq.html') {
    return seoFaqPage(res, req.method, seoEnabled() ? seoLangFromQuery(req.url) : '');
  }
  if (reqPathOnly === '/hand-rankings' || reqPathOnly === '/hand-rankings.html') {
    return seoHandsPage(res, req.method, seoEnabled() ? seoLangFromQuery(req.url) : '');
  }
  if (reqPathOnly === '/how-to-play' || reqPathOnly === '/how-to-play.html') {
    return seoHowToPage(res, req.method, seoEnabled() ? seoLangFromQuery(req.url) : '');
  }
  if (reqPathOnly === '/glossary' || reqPathOnly === '/glossary.html') {
    return seoGlossaryPage(res, req.method, seoEnabled() ? seoLangFromQuery(req.url) : '');
  }

  // Friendly path for the pack-creator Studio, mirroring /admin -> admin.html.
  if (reqPathOnly === '/privacy' || reqPathOnly === '/privacy.html') {
    // Same serve-time SEO policy as the client page: the file on disk stays
    // neutral, the <!--__SEO_META__--> placeholder is resolved per request
    // (noindex when the admin toggle is off, description + canonical when on).
    // The page is tiny and rarely hit, so no cache/compression is needed here.
    const p = path.join(PUBLIC_DIR, 'privacy.html');
    let phtml;
    try { phtml = fs.readFileSync(p, 'utf8'); } catch (e) { res.writeHead(404); res.end('privacy.html missing'); return; }
    var _pOn = seoEnabled(), _pBase = _pOn ? seoPublicUrl() : '';
    var _pMeta = _pOn
      ? ('<meta name="description" content="Privacy policy of the PokerTH Web Client \u2014 what little data is processed, and what never leaves your browser.">' +
         (_pBase ? '\n<link rel="canonical" href="' + _pBase + '/privacy">' : ''))
      : '<meta name="robots" content="noindex, nofollow">';
    phtml = phtml.replace('<!--__SEO_META__-->', _pMeta);
    const pbuf = Buffer.from(phtml, 'utf8');
    res.writeHead(200, Object.assign({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': pbuf.length }, SECURITY_HEADERS));
    if (req.method === 'HEAD') { res.end(); return; }
    res.end(pbuf);
    return;
  }
  if (reqPathOnly === '/studio' || reqPathOnly === '/studio.html') {
    const p = path.join(PUBLIC_DIR, 'studio.html');
    if (fs.existsSync(p)) return sendFile(req, res, p, 'text/html; charset=utf-8', 'no-store');
    res.writeHead(404); res.end('studio.html missing'); return;
  }

  // ── Remontée d'erreurs JS par les clients (public, non authentifié) ─────
  // Envoyée par modules/errreport.mjs. Ouverte à tous par nature : une erreur
  // de démarrage survient justement avant toute connexion. D'où les garde-fous
  // — corps plafonné, 5 entrées par requête, 30 requêtes/heure/IP, regroupement
  // par signature. L'IP est masquée avant d'être stockée, jamais conservée en
  // clair. Réponse toujours 204 : le client n'a rien à en faire.
  if (reqPathOnly === '/clienterr') {
    if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
    const eip = clientIp(req);
    if (!_errRateOk(eip)) { res.writeHead(429, { 'Cache-Control': 'no-store' }); res.end(); return; }
    readRawBody(req, 8 * 1024, function (buf) {
      res.writeHead(204, { 'Cache-Control': 'no-store' }); res.end();
      if (!buf) return;
      let d = null;
      try { d = JSON.parse(buf.toString('utf8')); } catch (e) { return; }
      if (!d || !Array.isArray(d.items)) return;
      const meta = {
        ver: String(d.ver || '').slice(0, 24),
        mode: String(d.mode || '').slice(0, 24),
        path: String(d.path || '').slice(0, 120),
        ua: String((req.headers && req.headers['user-agent']) || '').slice(0, 180),
        ip: _maskIp(eip),
      };
      d.items.slice(0, 5).forEach(function (it) {
        if (!it || !it.msg) return;
        _errRecord(meta, {
          msg: String(it.msg).slice(0, 300),
          src: String(it.src || '').slice(0, 200),
          line: parseInt(it.line, 10) || 0,
          col: parseInt(it.col, 10) || 0,
          stack: String(it.stack || '').slice(0, 600),
        });
      });
    });
    return;
  }
  // ── Version marker for the in-app update banner ──
  // Returns the newest mtime across the core assets. A deploy (git pull)
  // bumps these file mtimes, so the page can poll this cheaply and offer a
  // one-tap reload when it changes. Never cached.
  if (reqPathOnly === '/__ver') {
    // Same asset set the sitemap's <lastmod> and the deploy watcher use —
    // one helper so the update banner and the crawlers never disagree.
    const newest = newestAssetMtime();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ v: Math.floor(newest) }));
    return;
  }

  // ── Log-analysis relay (same pipeline as the desktop/QML client) ──
  // The official client POSTs the .pdb as multipart field "pdb_file" to
  // pokerth.net/log_file_analysis/upload.php and reads back "OK <hash>" or
  // "ERROR <n>" (see LogHandler::analyse / UploadHelper). The server names the
  // stored file <hash>.pdb — that hash is the key the bbc/wec reports use.
  // A browser cannot do this itself: upload.php sends no CORS header, so the
  // POST would go out but the answer would be unreadable. We relay it here.
  // Body = the raw .pdb bytes; ?name= is the file name to announce upstream.
  // NOTE: uploads leave from THIS host, so upload.php's per-IP flood guard
  // (LOG_UPLOAD_ERROR_MAX_NUM_IP = 4) is shared by all users of this instance.
  if (reqPathOnly === '/pdb-analyse') {
    if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
    function _paJson(code, obj) {
      res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(obj));
    }
    return readRawBody(req, 10 * 1024 * 1024, function (buf) {
      if (!buf || !buf.length) return _paJson(413, { ok: false, error: 'empty upload or larger than 10 MB' });
      // Cheap sanity gate before bothering the upstream server.
      if (buf.length < 16 || buf.slice(0, 16).toString('latin1') !== 'SQLite format 3\x00')
        return _paJson(400, { ok: false, error: 'not a pdb file' });
      var _paName = String(query.name || '').replace(/[^A-Za-z0-9._-]/g, '').slice(0, 80);
      if (!/\.pdb$/.test(_paName)) _paName = 'pokerth-log.pdb';
      var _paBoundary = '----PokerTHWeb' + crypto.randomBytes(12).toString('hex');
      var _paHead = Buffer.from(
        '--' + _paBoundary + '\r\n' +
        'Content-Disposition: form-data; name="pdb_file"; filename="' + _paName + '"\r\n' +
        'Content-Type: application/octet-stream\r\n\r\n', 'latin1');
      var _paTail = Buffer.from('\r\n--' + _paBoundary + '--\r\n', 'latin1');
      var _paBody = Buffer.concat([_paHead, buf, _paTail]);
      var _paReq = https.request({
        hostname: 'www.pokerth.net', port: 443, method: 'POST',
        path: '/log_file_analysis/upload.php',
        headers: {
          // Same UA as the official client — Cloudflare 403s unknown agents
          // (this is what broke the serverlist fetch on 2026-07-24).
          'User-Agent': 'PokerTH/2.0 (Qt Network)',
          'Accept': '*/*',
          'Accept-Encoding': 'identity',
          'Content-Type': 'multipart/form-data; boundary=' + _paBoundary,
          'Content-Length': _paBody.length
        }
      }, function (up) {
        var out = '';
        up.setEncoding('utf8');
        up.on('data', function (c) { out += c; if (out.length > 4096) up.destroy(); });
        up.on('end', function () {
          var txt = String(out).trim();
          var head = txt.split(/\s+/)[0] || '';
          if (head === 'OK') {
            var hash = (txt.slice(head.length).trim().split(/\s+/)[0] || '');
            if (!/^[A-Za-z0-9]{8,64}$/.test(hash)) return _paJson(502, { ok: false, error: 'bad response' });
            return _paJson(200, { ok: true, id: hash });
          }
          if (head === 'ERROR') {
            var code = parseInt(txt.slice(head.length).trim(), 10) || 0;
            return _paJson(502, { ok: false, error: 'upstream', code: code });
          }
          return _paJson(502, { ok: false, error: 'bad response' });
        });
      });
      _paReq.setTimeout(30000, function () { try { _paReq.destroy(); } catch (e) {} });
      _paReq.on('error', function (e) { _paJson(502, { ok: false, error: 'upstream unreachable: ' + e.message }); });
      _paReq.end(_paBody);
    });
  }

  // ── Ranking relay (PokerTH / BBC / WEC) — see handleRanking above. ──
  if (reqPathOnly === '/api/ranking') {
    handleRanking(req, res, query);
    return;
  }
  if (reqPathOnly === '/api/tableranking') {
    handleTableRanking(req, res, query);
    return;
  }
  if (reqPathOnly === '/api/botfile') {
    handleBotfile(req, res, query);
    return;
  }
  if (reqPathOnly === '/api/player') {
    handlePlayer(req, res, query);
    return;
  }
  if (reqPathOnly === '/api/award-img') {
    handleAwardImg(req, res, query);
    return;
  }
  if (reqPathOnly === '/api/forumfeed') {
    handleForumFeed(req, res);
    return;
  }
  if (reqPathOnly === '/api/forumimg') {
    handleForumImg(req, res, query);
    return;
  }


  // ── Visit ping (anonymous traffic counter) ──
  // One beacon per browser session: { vid:"<random>" }. We never read the IP;
  // the id is a client-minted random token, hashed before storage. 204 reply.
  if (reqPathOnly === '/__visit') {
    if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
    readJsonBody(req, function (d) {
      try {
        _pingStats.last = Date.now();
        if (d && d.mode) { _pingStats.nMode++; recordModeConnect(d.mode); }
        else {
          _pingStats.n++;
          recordVisit(d && d.vid);
          recordVisitEnv(req.headers && req.headers['user-agent'],
                         req.headers && req.headers['accept-language'],
                         !!(d && d.pwa));
        }
      } catch (e) { /* ignore a bad ping */ }
      res.writeHead(204, { 'Cache-Control': 'no-store' });
      res.end();
    });
    return;
  }

  // ── Music play ping (anonymous per-track counter) ──
  // One beacon per track START: { id:"<track id>" }. No visitor id, no
  // listening time, radios excluded. Unknown ids are dropped, so the stored
  // key set can never grow past the catalogue. 204 reply, like /__visit.
  if (reqPathOnly === '/__music') {
    if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
    readJsonBody(req, function (d) {
      try {
        if (musicEnabled() && d && d.id) { _pingStats.nMusic++; _pingStats.last = Date.now(); recordMusicPlay(d.id); }
      } catch (e) { /* ignore a bad ping */ }
      res.writeHead(204, { 'Cache-Control': 'no-store' });
      res.end();
    });
    return;
  }

  // Public app config the client reads on load: which entry "modes" are enabled.
  // Product poll vote (web-only, opt-in client side). One answer per device per
  // poll, deduped on a salted hash of the same anonymous `vid` already posted to
  // /__visit. Idempotent: re-posting returns the stored choice instead of
  // counting twice, which is also how a returning client re-reads the results.
  if (reqPathOnly === '/__poll-vote') {
    if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
    readJsonBody(req, function (d) {
      function j(code, obj) {
        res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify(obj));
      }
      const p = _pollActive();
      if (!p) return j(404, { ok: false, error: 'no active poll' });
      // The admin may have switched polls while this page was open.
      if (!d || d.id !== p.id) return j(409, { ok: false, error: 'stale poll', id: p.id });
      const vid = (typeof d.vid === 'string') ? d.vid.slice(0, 128) : '';
      if (!vid) return j(400, { ok: false, error: 'vid required' });
      const choice = (typeof d.choice === 'string') ? d.choice : '';
      if (!(p.options || []).some(function (o) { return o.id === choice; })) return j(400, { ok: false, error: 'unknown choice' });
      const h = _pollVoterHash(p.id, vid);
      p.voters = p.voters || {};
      const already = p.voters[h] !== undefined;
      if (!already) { p.voters[h] = choice; savePollsSoon(); }
      const t = _pollTally(p);
      return j(200, { ok: true, already: already, choice: p.voters[h], tally: t.tally, total: t.total });
    });
    return;
  }

  if (reqPathOnly === '/app-config') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: true, modes: appModes(), welcome: _welcomePublic(), poll: _pollPublic(), showLoginTitle: !!_adminConfig.showLoginTitle, defaultTheme: _adminConfig.defaultTheme || '', defaults: _adminConfig.defaults || {}, loginDefaults: _loginDefaults(true), tableDefaults: _adminConfig.tableDefaults || {}, tableNames: _adminConfig.tableNames || {}, serverName: _adminConfig.serverName || '', serverTagline: _adminConfig.serverTagline || '', featureOff: featureOffList(), pokerthnetServer: _activePokerthnetServer(), pokerthnetSource: _pokerthnetSource(), internetTransport: _internetTransport(), musicEnabled: musicEnabled() }));
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

  // Lecteur coupe par l'admin : TOUT /music/* repond 404 (manifeste ET .mp3), pour
  // que masquer l'entree de menu ne laisse pas les fichiers accessibles a qui
  // connait l'URL. Les routes /admin/music-* restent ouvertes (gestion des pistes).
  if (reqPathOnly.indexOf('/music/') === 0 && !musicEnabled()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
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
           : ext === '.wasm' ? 'application/wasm'
           : ext === '.mp3'  ? 'audio/mpeg'
           : ext === '.ogg'  ? 'audio/ogg'
           : ext === '.m4a'  ? 'audio/mp4'
           : ext === '.wav'  ? 'audio/wav'
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

// ── WS ingress hardening (proxy-side mirror of upstream PR pokerth#519) ──
// PokerTH protobuf packets are tiny; the biggest legitimate frame is a relayed
// AVATARIMG (<= 32 KiB). Anything bigger, malformed, or flooding is hostile.
const MAX_WS_FRAME_BYTES     = 64 * 1024;   // ws lib closes the socket above this (1009)
const MAX_WS_PACKET_BYTES    = 512;         // native MAX_PACKET_SIZE is 384; every legit C->S packet fits
const MAX_WS_MALFORMED_FRAMES = 10;         // same tolerance as the native TCP receive path
const WS_RATE_WINDOW_MS       = 1000;       // sliding window for the soft rate limit
const MAX_WS_MSGS_PER_WINDOW  = 200;        // frames per window per connection
const MAX_WS_BYTES_PER_WINDOW = 128 * 1024; // bytes per window per connection
const MAX_WS_SEND_QUEUE       = 1024 * 1024; // outbound queue cap per socket (mirror of pokerth#518)

const wss = new WebSocket.Server({ server: httpServer, maxPayload: MAX_WS_FRAME_BYTES, verifyClient: function (info, cb) {
  // Bannissement décidé par l'admin : refus à l'upgrade, avant tout pont. La
  // page reste servie — c'est l'accès au JEU via ce proxy qui est coupé.
  if (isBanned(clientIp(info.req))) return cb(false, 403, 'Forbidden');
  // Per-IP held-connection cap (MAX_WS_PER_IP) : compté à 'connection',
  // libéré à 'close' — vérifié ici pour refuser l'upgrade avant tout pont.
  if (MAX_WS_PER_IP > 0 && (_ipConns.get(clientIp(info.req)) || 0) >= MAX_WS_PER_IP) return cb(false, 429, 'Too Many Connections');
  // Connection-storm guard: reject the upgrade with 429 BEFORE any bridge is
  // built. No limiter installed → always accept (unchanged behavior).
  if (!_rlWs) return cb(true);
  _rlWs.consume(clientIp(info.req)).then(function () { cb(true); }).catch(function () { cb(false, 429, 'Too Many Requests'); });
} });

console.log('\n╔═══════════════════════════════════════════════╗');
console.log('║     PokerTH WebSocket Proxy v2.4              ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('\n▶ Proxy : ws://localhost:' + PROXY_PORT + '  /  http://localhost:' + PROXY_PORT + '/');
console.log('▶ TLS   : ' + (FORCE_NOTLS ? 'DISABLED (--notls)' : 'ENABLED by default'));
console.log('▶ Certs : ' + (INSECURE_TLS ? 'verification DISABLED (--insecure)' : 'verification active'));
console.log('▶ Allow : ' + ALLOWED_HOSTS.join(', '));
console.log('▶ Ports : ' + ALLOWED_PORTS.join(', '));
console.log('▶ Logs  : ' + _logLevelName() + '   ▶ Max clients : ' + (_maxClients() ? _maxClients() : 'illimité'));
(function () {
  var fd = _fdInfo();
  if (!fd) return;
  console.log('▶ FD    : limite douce ' + fd.soft + (fd.approxPlayers != null ? ' (~' + fd.approxPlayers + ' joueurs simultanés max)' : ' (illimité)'));
  if (fd.softN != null && fd.softN < 4096)
    console.warn('[!] Limite de descripteurs basse (' + fd.soft + '). Pour un serveur public, montez-la : pokerth-web fd-limit');
})();
console.log('\nTips:');
console.log('  • LAN server without TLS → uncheck TLS in the browser');
console.log('  • pokerth.net            → TLS checked, registered login needed');
// L'état servi au démarrage entre dans l'historique : après un déploiement
// réussi, le point de retour « celui d'avant » est ainsi toujours disponible,
// même si la mise à jour a été lancée hors du tableau de bord (install.sh, ssh).
_deployRecord('boot');
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
// ── Erreurs JavaScript remontées par les navigateurs (/clienterr) ─────────
// Regroupées par signature (message + première ligne de pile) : un bug qui se
// déclenche mille fois occupe une entrée avec un compteur, pas mille lignes.
// En mémoire seulement, comme LOG_RING — un redémarrage repart de zéro. Ce
// sont des indices de débogage, pas des archives.
const ERR_MAX_GROUPS = 200;
const _errGroups = new Map();            // signature → groupe
// Garde-fou par IP : 30 requêtes par heure. Le client se limite déjà (5
// signatures par session, 10 s entre deux envois) ; ceci vise le navigateur
// trafiqué ou le script qui viendrait marteler l'endpoint, ouvert à tous.
const ERR_RATE_MAX = 30, ERR_RATE_WINDOW = 3600000;
const _errRate = new Map();              // ip → { n, reset }
function _errRateOk(ip) {
  const now = Date.now();
  let r = _errRate.get(ip);
  if (!r || r.reset < now) { r = { n: 0, reset: now + ERR_RATE_WINDOW }; _errRate.set(ip, r); }
  if (_errRate.size > 5000) {            // purge paresseuse
    _errRate.forEach(function (v, k) { if (v.reset < now) _errRate.delete(k); });
  }
  r.n++;
  return r.n <= ERR_RATE_MAX;
}
function _errSig(it) {
  const first = String(it.stack || '').split('\n')[1] || (it.src + ':' + it.line);
  return String(it.msg || '').slice(0, 120) + '|' + String(first).trim().slice(0, 120);
}
function _errRecord(meta, it) {
  const sig = _errSig(it);
  let g = _errGroups.get(sig);
  if (!g) {
    if (_errGroups.size >= ERR_MAX_GROUPS) {   // évince le groupe le plus ancien
      let oldestKey = null, oldest = Infinity;
      _errGroups.forEach(function (v, k) { if (v.last < oldest) { oldest = v.last; oldestKey = k; } });
      if (oldestKey !== null) _errGroups.delete(oldestKey);
    }
    g = { sig: sig, msg: it.msg, src: it.src, line: it.line, col: it.col, stack: it.stack,
          first: Date.now(), last: 0, count: 0, vers: {}, uas: {}, ips: {}, modes: {} };
    _errGroups.set(sig, g);
  }
  g.last = Date.now();
  g.count++;
  g.path = meta.path || g.path;
  const bump = function (o, k) { if (!k) return; if (Object.keys(o).length < 12 || o[k]) o[k] = (o[k] || 0) + 1; };
  bump(g.vers, meta.ver); bump(g.uas, meta.ua); bump(g.ips, meta.ip); bump(g.modes, meta.mode);
}
function _errSnapshot() {
  const groups = [];
  _errGroups.forEach(function (g) {
    groups.push({ sig: g.sig, msg: g.msg, src: g.src, line: g.line, col: g.col, stack: g.stack,
                  path: g.path || '', first: g.first, last: g.last, count: g.count,
                  vers: Object.keys(g.vers), uas: Object.keys(g.uas),
                  modes: Object.keys(g.modes), ips: Object.keys(g.ips).length });
  });
  groups.sort(function (a, b) { return b.last - a.last; });
  return { ok: true, now: Date.now(), groups: groups };
}
// ── Registre des sessions vivantes (tableau de bord admin, /admin/sessions) ──
// _sessions n'indexe que les sessions AVEC sid ; ce Set les contient toutes,
// avec ou sans sid, et sert uniquement à l'inventaire et à la déconnexion
// manuelle. Les entrées en sortent dans _destroySession().
const _liveSessions = new Set();
let _sessSeq = 0;                          // id court et stable côté admin
// L'IP complète n'est jamais exposée au tableau de bord : dernier octet (v4)
// ou 80 derniers bits (v6) masqués — assez pour distinguer deux joueurs et
// repérer un abus, pas assez pour identifier quelqu'un.
function _maskIp(ip) {
  let a = String(ip || '').replace(/^::ffff:/, '');
  if (/^\d+\.\d+\.\d+\.\d+$/.test(a)) return a.replace(/\.\d+$/, '.x');
  if (a.indexOf(':') >= 0) { const p = a.split(':').filter(Boolean); return p.slice(0, 3).join(':') + ':…'; }
  return a || 'unknown';
}
// Instantané des connexions pour /admin/sessions. Deux familles :
//   • bridges : ponts de jeu (navigateur ⇄ proxy ⇄ serveur PokerTH)
//   • notify  : canaux légers ?notify=1 (joueurs connectés en direct à
//                pokerth.net ou en entraînement, qui ne reçoivent que les avis)
function _sessionsSnapshot() {
  const now = Date.now();
  const bridges = [];
  _liveSessions.forEach(function (S) {
    bridges.push({
      id: S.id, sid: S.sid ? String(S.sid).slice(0, 8) : '',
      nick: S.chatNick || '', auth: !!S.isAuthLogin,
      mode: (S.ws && S.ws._bcMode) || S.bcMode || '',
      host: S.host, port: S.port, tls: !!S.useTls,
      ver: S.ver || '', ua: S.ua || '', ip: _maskIp(S.ip),
      startedAt: S.startedAt || now,
      upstream: !!S.connected,
      attached: !!(S.ws && S.ws.readyState === 1),
      grace: !!S.grace,
      bIn: S.bIn || 0, bOut: S.bOut || 0, msgs: S.n || 0,
    });
  });
  const notify = [];
  try {
    wss.clients.forEach(function (c) {
      if (!c._notify) return;
      notify.push({ id: c._nid, mode: c._bcMode || '', ver: c._ver || '',
                    ua: c._ua || '', ip: _maskIp(c._ip), startedAt: c._startedAt || now,
                    attached: c.readyState === 1 });
    });
  } catch (e) {}
  bridges.sort(function (a, b) { return a.startedAt - b.startedAt; });
  notify.sort(function (a, b) { return a.startedAt - b.startedAt; });
  return { ok: true, now: now, maxClients: _maxClients(), bridges: bridges, notify: notify };
}
// Déconnexion manuelle depuis le tableau de bord. Un pont est fermé pour de
// bon (code 4009, PAS de délai de grâce : on détruit la session AVANT de
// fermer la socket, sinon le on('close') la garderait en attente de
// rebranchement et le client reviendrait aussitôt).
function _kickSession(id) {
  let hit = null;
  _liveSessions.forEach(function (S) { if (S.id === id) hit = S; });
  if (hit) {
    const w = hit.ws;
    hit.ws = null;
    _destroySession(hit);
    if (w) { try { _allClients.delete(w); } catch (e) {} try { w.close(4009, 'Disconnected by admin'); } catch (e) {} }
    return 'bridge';
  }
  let done = false;
  try {
    wss.clients.forEach(function (c) {
      if (done || !c._notify || c._nid !== id) return;
      try { c.close(4009, 'Disconnected by admin'); } catch (e) {}
      done = true;
    });
  } catch (e) {}
  return done ? 'notify' : null;
}
const SESSION_GRACE_MS = 120000;          // garder l'amont 2 min après coupure navigateur
                                          // (un onglet mobile en arrière-plan est « gelé » par
                                          // l'OS : ni timer ni event réseau ne tournent jusqu'au
                                          // retour au premier plan — il faut une fenêtre large)
const SESSION_MAX_BUF  = 4 * 1024 * 1024; // plafond du tampon (octets) en attente de rebranchement

function _destroySession(S) {
  if (S.grace) { clearTimeout(S.grace); S.grace = null; }
  _liveSessions.delete(S);
  if (S.sid && _sessions.get(S.sid) === S) _sessions.delete(S.sid);
  try { S.sock && S.sock.destroy(); } catch (_) {}
  S.sock = null; S.buf = []; S.bufBytes = 0;
}

// Résolution amont : IPv4 d'abord (comportement historique), repli IPv6 (AAAA)
// si aucun enregistrement A — permet d'atteindre un serveur officiel IPv6-only.
function _lookupPreferV4(host, cb) {
  dns.lookup(host, { family: 4 }, (e4, a4) => {
    if (!e4) return cb(a4);
    dns.lookup(host, { family: 6 }, (e6, a6) => cb(e6 ? host : a6));
  });
}

// Ouvre la connexion TCP/TLS amont vers PokerTH pour la session S.
function _openUpstream(S) {
  _scheduleConn(() => {
    _lookupPreferV4(S.host, (addr) => {
      // Réglages TLS de l'entrée de registre correspondante (voir _serverTlsOpts).
      const tOpt = _serverTlsOpts(S.host, S.port);
      // Le SNI se déduit du host DEMANDÉ, pas de l'adresse résolue : `addr` est
      // presque toujours une IP (dns.lookup), donc l'ancien test `net.isIP(addr)`
      // supprimait le servername dans tous les cas. Node vérifiait alors le
      // certificat contre l'IP — échec de nom garanti sur toute cible TLS. Le
      // bug restait invisible tant qu'aucun serveur TLS vérifié n'était utilisé.
      const sniName = tOpt.sni || (net.isIP(S.host) ? '' : String(S.host || ''));
      // Épinglage SPKI (parité 2.1.6, tlspinning.cpp) : dès qu'au moins un pin
      // est connu pour cet hôte (table intégrée, serverlist <TLSPin>, registre),
      // la confiance vient du pin SEUL — rejectUnauthorized:false (cert
      // auto-signé, la chaîne échouerait) puis vérification SPKI explicite
      // après le handshake ; mismatch = fermeture immédiate. Sans pin connu :
      // comportement inchangé (vérification CA sauf noverify/--insecure).
      const tlsPins = S.useTls ? _tlsPinsFor(S.host) : [];
      const verify = !(INSECURE_TLS || tOpt.noverify);
      const opts = { host: addr, port: S.port, ...(sniName && { servername: sniName }) };
      const onConn = () => {
        if (tlsPins.length) {
          const pinErr = _verifyTlsPin(S.sock, tlsPins);
          if (pinErr) {
            console.error('[-] ' + pinErr + ' → ' + addr + ':' + S.port + ' — closing');
            try { S.ws && S.ws.close(1015, 'tls pin mismatch'); } catch (_) {}
            _destroySession(S);
            return;
          }
        }
        S.connected = true;
        const info = S.useTls
          ? '(TLS ' + (S.sock.getCipher() ? S.sock.getCipher().name : '?')
            + (sniName && sniName !== S.host ? ', sni=' + sniName : '')
            + (tlsPins.length ? ', pinned ✓' : (verify ? '' : ', verify OFF')) + ')'
          : '(raw TCP)';
        console.log('[+] Connected ' + info + ' → ' + addr + ':' + S.port);
      };
      if (_proxyProtocolOn()) {
        // PROXY protocol : socket TCP nu d'abord, header en tout premier octet,
        // puis (si TLS) handshake par-dessus le même socket. L'écouteur du
        // header est enregistré AVANT le wrap TLS → il part avant le ClientHello.
        const raw = net.connect({ host: addr, port: S.port });
        raw.once('connect', () => { try { raw.write(_ppHeader(S, addr)); } catch (_) {} });
        if (S.useTls) {
          S.sock = tls.connect({ socket: raw, ...(sniName && { servername: sniName }), rejectUnauthorized: tlsPins.length ? false : verify }, onConn);
          // Une erreur du socket sous-jacent (ECONNREFUSED…) ne remonte pas
          // toujours au TLSSocket : on la relaie (double émission inoffensive,
          // _destroySession est idempotent).
          raw.once('error', (e) => { try { S.sock && S.sock.emit('error', e); } catch (_) {} });
        } else {
          S.sock = raw;
          raw.once('connect', onConn);
        }
      } else {
        S.sock = S.useTls
          ? tls.connect({ ...opts, rejectUnauthorized: tlsPins.length ? false : verify }, onConn)
          : net.connect(opts, onConn);
      }

      S.sock.on('data', chunk => {
        S.bOut = (S.bOut || 0) + chunk.length;
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
          if (d.name === 'InitAck' && S.isAuthLogin && S.chatNick) _issueSyncToken(S);
          const _ll = _logLevel();
          // quiet : rien par message, SAUF les trames d'erreur (toujours utiles).
          if (_ll >= 1 || d.name.includes('Error'))
            console.log('[S→C] #' + S.n + ' ' + d.name + ' (' + msgLen + 'b)' + d.extra);
          if (_ll >= 2 && (msgLen <= 64 || d.name.includes('Error') || d.name === '?' || d.name.includes('Flop') || d.name.includes('Turn') || d.name.includes('River') || d.name.includes('Hand')))
            console.log('      hex: ' + payload.toString('hex'));
          // Navigateur attaché → envoyer ; sinon (session en attente) → tamponner.
          // Garde de file d'envoi (miroir du PR upstream pokerth#518) : un
          // navigateur qui ne lit plus laisse ws accumuler bufferedAmount sans
          // borne pendant que le serveur continue d'émettre. Au-delà de 1 MiB
          // (même plafond que l'amont), on ferme la socket — la session TCP
          // survit via la grâce et le tampon plafonné SESSION_MAX_BUF, et un
          // rebranchement (même sid) reprend proprement.
          if (S.ws && S.ws.readyState === WebSocket.OPEN && S.ws.bufferedAmount <= MAX_WS_SEND_QUEUE) {
            S.ws.send(frame);
          } else {
            if (S.ws && S.ws.readyState === WebSocket.OPEN) {
              console.warn('[!] WS send queue overflow (' + S.ws.bufferedAmount + 'b) — closing browser socket' + (S.sid ? ' (session ' + S.sid.slice(0, 8) + ' kept for rebind)' : ''));
              try { S.ws.close(1009, 'send queue overflow'); } catch (_) {}
            }
            if (S.sid) {
              S.buf.push(frame); S.bufBytes += frame.length;
              while (S.bufBytes > SESSION_MAX_BUF && S.buf.length) { S.bufBytes -= S.buf.shift().length; }
            }
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
  // Un rebranchement (même sid, nouvelle socket) peut venir d'une autre IP ou
  // d'un client mis à jour : on suit la socket courante pour l'inventaire admin.
  if (ws._ip) S.ip = ws._ip;
  if (ws._ua) S.ua = ws._ua;
  if (ws._ver) S.ver = ws._ver;
  // Relay scope = the upstream this socket is bridged to. Reactions/avatars
  // only fan out to peers sharing the same host:port.
  ws._relayKey = S.host + ':' + S.port;
  // Mode pour le ciblage des diffusions. Le client l'annonce (&mode=) : c'est le
  // mode QU'IL A CHOISI, seule source fiable. Le deduire de l'hote amont classait
  // en 'lan' tous les joueurs « Internet / PokerTH.net » d'un serveur enregistre
  // manuellement (IP ou nom autre que pokerth.net) — ils echappaient alors aux
  // diffusions ciblees pthnet. Repli sur l'hote pour les clients pas encore
  // rechargés (qui n'envoient pas le parametre).
  ws._bcMode = ws._modeParam || ((S.host && String(S.host).indexOf('pokerth.net') >= 0) ? 'pthnet' : 'lan');
  _allClients.add(ws);
  // If a restart is currently scheduled, tell this freshly-attached client too.
  if (_restartAt > Date.now() && _restartNotice) { try { ws.send(_restartNotice); } catch (e) {} }
  // Sync des préférences : (re)livrer le jeton de session au navigateur
  // (utile après un rebranchement WS — le jeton reste lié à la session TCP).
  if (S.syncToken) { try { ws.send('SYNCTOK:' + S.syncToken); } catch (e) {} S.pendingTok = null; }
  else if (S.pendingTok) { try { ws.send(S.pendingTok); } catch (e) {} S.pendingTok = null; }

  ws.on('message', (data, isBinary) => {
    // ── Soft per-connection rate limit (frames + bytes, sliding 1 s window).
    // Generous for legitimate play (actions/chat are a handful of tiny frames
    // per second); only a flooder can trip it.
    const _rlNow = Date.now();
    if (!ws._rlWin || _rlNow - ws._rlWin > WS_RATE_WINDOW_MS) { ws._rlWin = _rlNow; ws._rlMsgs = 0; ws._rlBytes = 0; }
    ws._rlMsgs++; ws._rlBytes += (data && data.length) || 0;
    if (ws._rlMsgs > MAX_WS_MSGS_PER_WINDOW || ws._rlBytes > MAX_WS_BYTES_PER_WINDOW) {
      console.warn('[!] WS rate limit exceeded (' + ws._rlMsgs + ' msgs / ' + ws._rlBytes + 'b in ' + WS_RATE_WINDOW_MS + 'ms) — closing ' + (ws._ip || '?'));
      try { ws.close(1008, 'rate limit'); } catch (_) {}
      return;
    }
    if (!isBinary) {
      const text = data.toString();
      if (text.startsWith('REACT:') || text.startsWith('AVATAR:') || text.startsWith('AVATARIMG:')) {
        // Drop oversized relays (mainly AVATARIMG base64) before fan-out.
        if (Buffer.byteLength(text) > MAX_RELAY_BYTES) {
          console.warn('[!] Dropped oversized relay frame (' + Buffer.byteLength(text) + 'b) from ' + (ws._relayKey || '?'));
          return;
        }
        _allClients.forEach(client => {
          // Sauter les sockets engorgées (miroir pokerth#518) : les relais sont
          // cosmétiques — on les jette plutôt que d'empiler sur un client bloqué.
          if (client !== ws && client.readyState === 1 && client._relayKey === ws._relayKey &&
              client.bufferedAmount <= MAX_WS_SEND_QUEUE) client.send(text);
        });
        return;
      }
    }
    if (!S.connected || !S.sock || !S.sock.writable) return;
    const buf = Buffer.from(isBinary ? data : data.toString());
    // ── Frame validation (proxy-side mirror of upstream PR pokerth#519).
    // A frame must hold one or more COMPLETE length-prefixed packets (4-byte
    // BE length + payload). Malformed frames are DROPPED, never relayed:
    // garbage written to the TCP stream would desynchronize the upstream
    // session for good. Same tolerance as the native path: 10 strikes → close.
    let _fok = buf.length >= 4, _foff = 0;
    while (_fok && _foff < buf.length) {
      if (_foff + 4 > buf.length) { _fok = false; break; }
      const _pn = buf.readUInt32BE(_foff);
      if (_pn === 0 || _pn > MAX_WS_PACKET_BYTES || _foff + 4 + _pn > buf.length) { _fok = false; break; }
      _foff += 4 + _pn;
    }
    if (!_fok) {
      ws._badFrames = (ws._badFrames || 0) + 1;
      console.warn('[!] Malformed WS frame (' + buf.length + 'b, ' + ws._badFrames + '/' + MAX_WS_MALFORMED_FRAMES + ') from ' + (ws._ip || '?') + ' — dropped');
      if (ws._badFrames >= MAX_WS_MALFORMED_FRAMES) {
        console.warn('[!] Too many malformed WS frames — closing ' + (ws._ip || '?'));
        try { ws.close(1008, 'malformed frames'); } catch (_) {}
      }
      return;
    }
    S.bIn = (S.bIn || 0) + buf.length;
    {
      const _n  = buf.readUInt32BE(0);
      const _pl = buf.slice(4, 4 + _n);
      _discordTapC2S(S, _pl);   // relais Discord du chat lobby (no-op si non configuré) — JAMAIS gated
      const _ll = _logLevel();
      if (_ll >= 1) {
        const d = describeMsg(_pl);
        console.log('[C→S] ' + d.name + ' (' + _n + 'b)');
        if (_ll >= 2 && _n <= 32) console.log('      hex: ' + buf.slice(4).toString('hex'));
      }
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
  // &fresh=1 : le client déclare une poignée de main NEUVE (page relancée,
  // état protocolaire vierge — il attend l'Announce puis enverra un Init).
  const fresh  = params.get('fresh') === '1';
  // Mode CHOISI par le joueur, transmis par le client (&mode=), pour le ciblage
  // des diffusions. Cf. _attachWs : le repli sur le nom d'hote amont reste pour
  // les onglets ouverts avant la mise a jour du client.
  const modeParam = (function () { const m = params.get('mode'); return (m === 'pthnet' || m === 'lan' || m === 'offline') ? m : null; })();
  ws._modeParam = modeParam;
  // Métadonnées purement descriptives (tableau de bord admin) : version du
  // client web annoncée par &v=, User-Agent et IP du navigateur. Aucune n'est
  // utilisée pour une décision — ni filtrage, ni routage.
  ws._ver = String(params.get('v') || '').slice(0, 24);
  ws._ua = String((req.headers && req.headers['user-agent']) || '').slice(0, 180);
  ws._ip = clientIp(req);
  ws._port = (req.socket && req.socket.remotePort) || 0;
  ws._startedAt = Date.now();

  // ── Comptage des sockets par IP (plafond appliqué à l'upgrade, cf. verifyClient) ──
  if (ws._ip && ws._ip !== 'unknown') {
    _ipConns.set(ws._ip, (_ipConns.get(ws._ip) || 0) + 1);
    ws.once('close', function () {
      var n = (_ipConns.get(ws._ip) || 1) - 1;
      if (n <= 0) _ipConns.delete(ws._ip); else _ipConns.set(ws._ip, n);
    });
  }

  // ── Notify-only channel (?notify=1) ──
  // Clients connectés en DIRECT à pokerth.net : leur socket de jeu ne passe
  // pas par ce proxy. Ce canal léger n'ouvre AUCUN pont amont — la socket
  // reste simplement dans wss.clients, donc broadcastNotice() (INFO:/NOTICE:)
  // l'atteint sans autre modification. Le heartbeat existant la surveille.
  if (params.get('notify') === '1') {
    ws._bcMode = params.get('mode') === 'offline' ? 'offline' : 'pthnet';
    ws._notify = true; ws._nid = ++_sessSeq;
    console.log('[i] Notify-only client attached (' + ws._bcMode + ', ' + wss.clients.size + ' ws total)');
    if (_restartAt > Date.now() && _restartNotice) { try { ws.send(_restartNotice); } catch (e) {} }
    ws.on('message', function () {});       // aucun trafic entrant attendu
    ws.on('error', function () {});
    return;
  }

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
    // Poignée de main NEUVE sur une session encore vivante : la rebrancher
    // serait un piège — l'amont a passé l'Announce depuis longtemps, la page
    // neuve l'attendrait pour rien jusqu'à l'expiration de la grâce (2 min
    // par défaut), « waiting for the PokerTH server… » (rapport forum ; se
    // débloquait en connectant le client officiel, dont le login faisait
    // tomber le fantôme côté serveur). On fait pareil nous-mêmes : fermer le
    // fantôme (le serveur libère le pseudo à la fermeture TCP) et ouvrir un
    // amont neuf. La reprise du siège passe par le chemin déjà en place côté
    // client (Error 4 → réessai du même pseudo → RejoinExistingGame).
    if (fresh) {
      console.log('──────────────────────────────────────');
      console.log('[~] Fresh connect sur session vivante ' + sid.slice(0, 8) + ' — fantôme fermé, amont neuf');
      if (S.ws && S.ws !== ws) { _allClients.delete(S.ws); try { S.ws.terminate(); } catch (_) {} }
      _destroySession(S);
      // …et on tombe dans « Nouvelle connexion amont » ci-dessous.
    } else if (S.sock && !S.sock.destroyed) {
      console.log('──────────────────────────────────────');
      console.log('[~] Rebranchement session ' + sid.slice(0, 8) + ' (' + S.buf.length + ' frames en tampon)');
      if (S.grace) { clearTimeout(S.grace); S.grace = null; }
      if (S.ws && S.ws !== ws) { _allClients.delete(S.ws); try { S.ws.terminate(); } catch (_) {} }
      _attachWs(S, ws);
      for (const f of S.buf) { if (ws.readyState === WebSocket.OPEN) ws.send(f); }
      S.buf = []; S.bufBytes = 0;
      return;
    } else {
      _sessions.delete(sid); // session morte → on ouvre une connexion neuve
    }
  }

  // ── Plafond de connexions simultanées (soupape) ──
  // Compté sur les ponts de jeu actifs (_allClients) ; ni les rebranchements
  // (traités ci-dessus) ni les canaux notify-only (return plus haut) n'arrivent ici.
  const _cap = _maxClients();
  if (_cap > 0 && _allClients.size >= _cap) {
    console.warn('[!] Plafond de connexions atteint (' + _allClients.size + '/' + _cap + ') — refus de ' + host + ':' + port);
    try { ws.close(4503, 'Server at capacity'); } catch (_) {}
    return;
  }

  // ── Nouvelle connexion amont ──
  console.log('──────────────────────────────────────');
  console.log('[>] ' + (useTls ? 'TLS' : 'TCP') + ' → ' + host + ':' + port + (sid ? ' (sid ' + sid.slice(0, 8) + ')' : ''));
  const S = { sid, host, port, useTls, sock: null, ws: null, connected: false,
              rxBuf: Buffer.alloc(0), n: 0, buf: [], bufBytes: 0, grace: null,
              id: ++_sessSeq, startedAt: Date.now(), bIn: 0, bOut: 0,
              ip: ws._ip, ipPort: ws._port || 0, ua: ws._ua, ver: ws._ver, bcMode: modeParam || '' };
  _liveSessions.add(S);
  if (sid) _sessions.set(sid, S);
  _attachWs(S, ws);
  _openUpstream(S);

  // ── Délai de premier paquet ──
  // Pont ouvert mais client muet (aucun octet C→S en 20 s) : un client
  // légitime envoie son Init dès l'Announce (< 2 s). Sans ce délai, un flood
  // de connexions muettes retiendrait un TCP amont par socket (le heartbeat ne
  // tue que les sockets qui ne répondent plus au ping). Fermeture + destruction
  // immédiate de la session : pas de grâce pour un pont qui n'a jamais parlé.
  setTimeout(function () {
    if (S.ws === ws && !(S.bIn > 0)) {
      console.warn('[!] Mute bridge (no client data in 20s) — closing ' + (ws._ip || '?'));
      try { ws.close(4408, 'init timeout'); } catch (_) {}
      _destroySession(S);
    }
  }, 20000);
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
  // Manifestes de styles régénérés au démarrage. Les catalogues (tables, decks,
  // thèmes, sièges) ne sont PAS versionnés : un checkout neuf — image Docker,
  // self-update du conteneur, clone git — n'en a aucun, et les sélecteurs ne
  // montrent alors que les styles intégrés au code (aucun deck de galerie,
  // aucune table importée). install.sh les régénère, l'entrypoint du conteneur
  // non : on le fait ici pour que TOUS les chemins de déploiement soient
  // équivalents. Coût : quelques dizaines de ms. Les packs uploadés par l'admin
  // restent listés (les scripts scannent le disque, ils n'effacent rien).
  try { ['deck', 'table', 'theme', 'seat'].forEach(function (k) { regenManifest(k); }); } catch (e) {}
  console.log('Ready → http://localhost:' + PROXY_PORT + '/\n');
});
