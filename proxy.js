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
const url  = require('url');
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

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
  return ALLOWED_HOSTS.includes(String(h).toLowerCase());
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
let STATS_RESET_PERIOD = ((_adminConfig.resetPeriod || process.env.STATS_RESET_PERIOD || 'monthly') + '').toLowerCase();
function appModes() { var m = (_adminConfig && _adminConfig.modes) || {}; return { offline: m.offline !== false, lan: m.lan !== false, pokerthnet: m.pokerthnet !== false }; }
const STATS_META_FILE = process.env.STATS_META_FILE || path.join(__dirname, 'stats.meta.json');
const STATS_ADMIN_TOKEN = process.env.STATS_ADMIN_TOKEN || '';
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

function readJsonBody(req, cb) {
  let body = '';
  req.on('data', function (c) { body += c; if (body.length > 16384) req.destroy(); });
  req.on('end', function () { try { cb(JSON.parse(body || '{}')); } catch (e) { cb(null); } });
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

function adminAuthed(query, bodyToken) {
  return !!STATS_ADMIN_TOKEN && (query.token === STATS_ADMIN_TOKEN || bodyToken === STATS_ADMIN_TOKEN);
}
function adminJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
function slugId(s) {
  return String(s || '').toLowerCase().replace(/\.zip$/, '')
    .replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
function regenManifest(kind) {
  const rel = kind === 'table' ? 'scripts/tables-manifest.mjs' : 'scripts/decks-manifest.mjs';
  const dir = path.join(PUBLIC_DIR, kind === 'table' ? 'table' : 'cards');
  try { spawnSync(process.execPath, [path.join(__dirname, rel), dir], { stdio: 'ignore' }); }
  catch (e) { console.error('[admin] manifest failed:', e.message); }
}
function pkgList() {
  const read = function (p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')) || []; } catch (e) { return []; } };
  return { tables: read(path.join(PUBLIC_DIR, 'table', 'tables.json')),
           decks:  read(path.join(PUBLIC_DIR, 'cards', 'decks.json')) };
}
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
    if (!has('table.png')) return done('not a PokerTH table style (table.png missing)');
    if (!id) id = 'table-' + Date.now();
    if (['green', 'blue', 'bordeaux', 'slate', 'photo', 'table'].indexOf(id) >= 0) id = 'table-' + id;
    const dest = path.join(PUBLIC_DIR, 'table', id);
    try { fs.rmSync(dest, { recursive: true, force: true }); fs.mkdirSync(dest, { recursive: true }); } catch (e) { return done('dest failed'); }
    let okFelt = false;
    if (spawnSync('convert', ['-version'], { stdio: 'ignore' }).status === 0) {
      okFelt = spawnSync('convert', [path.join(exDir, 'table.png'), '-resize', '1280x720>', '-strip', '-quality', '82', path.join(dest, 'felt.jpg')], { stdio: 'ignore' }).status === 0;
    }
    if (!okFelt) cp('table.png', path.join(dest, 'felt.png'));
    if (has('dealerPuck.png'))     cp('dealerPuck.png',     path.join(dest, 'dealer.png'));
    if (has('smallblindPuck.png')) cp('smallblindPuck.png', path.join(dest, 'sb.png'));
    if (has('bigblindPuck.png'))   cp('bigblindPuck.png',   path.join(dest, 'bb.png'));
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
  } else return done('unknown kind');

  let nm = id;
  try {
    const mf = path.join(PUBLIC_DIR, kind === 'table' ? 'table' : 'cards', kind === 'table' ? 'tables.json' : 'decks.json');
    const e = JSON.parse(fs.readFileSync(mf, 'utf8')).find(function (x) { return x.id === id; });
    if (e && e.name) nm = e.name;
  } catch (e) {}
  done(null, { id: id, name: nm });
}

function handleAdmin(req, res, reqPathOnly, query) {
  query = query || {};
  // Admin token transport: prefer the "Authorization: Bearer <token>" header so
  // the token never lands in URLs / access logs / browser history. Older cached
  // clients still send it as ?token= — both keep working because the header
  // value is simply folded into query.token, which every adminAuthed() consults.
  if (!query.token) {
    var _m = /^\s*Bearer\s+(.+?)\s*$/i.exec(req.headers['authorization'] || '');
    if (_m) query.token = _m[1];
  }
  if (reqPathOnly === '/admin') {
    const p = path.join(PUBLIC_DIR, 'admin.html');
    if (fs.existsSync(p)) return sendFile(req, res, p, 'text/html; charset=utf-8', 'no-store');
    res.writeHead(404); res.end('admin.html missing'); return;
  }
  if (reqPathOnly === '/admin/pkg-list') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    return adminJson(res, 200, Object.assign({ ok: true }, pkgList()));
  }
  if (reqPathOnly === '/admin/status') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    let version = '';
    try { version = (JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version) || ''; } catch (e) {}
    let sockets = null; try { sockets = wss.clients.size; } catch (e) {}
    return adminJson(res, 200, { ok: true, version: version, node: process.version, uptimeSec: Math.floor(process.uptime()), sockets: sockets, players: Object.keys(statsStore).length, resetPeriod: STATS_RESET_PERIOD, modes: appModes() });
  }
  if (reqPathOnly === '/admin/logs') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    return adminJson(res, 200, { ok: true, lines: LOG_RING.slice(-300) });
  }
  if (reqPathOnly === '/admin/config') {
    if (req.method === 'GET') {
      if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      return adminJson(res, 200, { ok: true, resetPeriod: STATS_RESET_PERIOD, modes: appModes() });
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
        saveAdminConfig();
        return adminJson(res, 200, { ok: true, resetPeriod: STATS_RESET_PERIOD, modes: appModes() });
      });
    }
    res.writeHead(405); res.end('Method not allowed'); return;
  }
  if (reqPathOnly === '/admin/pkg-upload' && req.method === 'POST') {
    if (!adminAuthed(query)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
    const kind = query.kind === 'deck' ? 'deck' : (query.kind === 'table' ? 'table' : null);
    if (!kind) return adminJson(res, 400, { ok: false, error: 'kind must be table or deck' });
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
      if (!adminAuthed(query, d && d.token)) return adminJson(res, 403, { ok: false, error: STATS_ADMIN_TOKEN ? 'forbidden' : 'admin disabled (no token set)' });
      const kind = (d && d.kind === 'deck') ? 'deck' : ((d && d.kind === 'table') ? 'table' : null);
      const id = slugId(d && d.id);
      if (!kind || !id) return adminJson(res, 400, { ok: false, error: 'kind + id required' });
      if (kind === 'table' && ['green', 'blue', 'bordeaux', 'slate', 'photo'].indexOf(id) >= 0) return adminJson(res, 400, { ok: false, error: 'built-in table cannot be removed' });
      if (kind === 'deck' && ['svg', 'classic'].indexOf(id) >= 0) return adminJson(res, 400, { ok: false, error: 'built-in deck cannot be removed' });
      const dir = path.join(PUBLIC_DIR, kind === 'table' ? 'table' : 'cards', id);
      if (!fs.existsSync(dir)) return adminJson(res, 404, { ok: false, error: 'not found' });
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { return adminJson(res, 500, { ok: false, error: 'remove failed' }); }
      regenManifest(kind);
      adminJson(res, 200, { ok: true });
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
const httpServer = http.createServer((req, res) => {
  // Serve the SPA shell for the root path. We strip the query string
  // before comparing so deep links like
  //   /?host=pokerth.ddns.net&port=7234&tls=0&table=106
  // (produced by the "copy table link" feature) still resolve to the
  // index HTML instead of falling through to the static-file branch
  // and 404'ing on a nonexistent file named "/?host=...".
  const reqPathOnly = req.url.split('?')[0];
  if (reqPathOnly === '/admin' || reqPathOnly.indexOf('/admin/') === 0) {
    handleAdmin(req, res, reqPathOnly, url.parse(req.url, true).query);
    return;
  }
  if (reqPathOnly === '/' || reqPathOnly === '/index.html') {
    const p = path.join(__dirname, 'public', 'pokerth-client.html');
    if (fs.existsSync(p)) {
      return sendFile(req, res, p, 'text/html; charset=utf-8', 'no-store, no-cache, must-revalidate');
    }
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

  // Public app config the client reads on load: which entry "modes" are enabled.
  if (reqPathOnly === '/app-config') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: true, modes: appModes() }));
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
          if (!STATS_ADMIN_TOKEN || d.token !== STATS_ADMIN_TOKEN) {
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
        if (d._delete) delete statsStore[name];
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
  const wait = Math.max(0, (_lastConnAt + MIN_CONN_GAP) - now);
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
      console.log('[~] Browser off (code ' + code + ') — session ' + S.sid.slice(0, 8) + ' gardée ' + (SESSION_GRACE_MS / 1000) + 's en attente de rebranchement');
      clearTimeout(S.grace);
      S.grace = setTimeout(() => {
        console.log('[-] Grace expirée → fermeture session ' + S.sid.slice(0, 8) + '\n');
        _destroySession(S);
      }, SESSION_GRACE_MS);
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
