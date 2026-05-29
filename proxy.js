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

const args        = process.argv.slice(2);
const PROXY_PORT  = parseInt(args.find(a => /^\d+$/.test(a)) || '8080', 10);
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
  'cookmed.ddns.net',
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

// ── HTTP server ──
const httpServer = http.createServer((req, res) => {
  // Serve the SPA shell for the root path. We strip the query string
  // before comparing so deep links like
  //   /?host=cookmed.ddns.net&port=7234&tls=0&table=106
  // (produced by the "copy table link" feature) still resolve to the
  // index HTML instead of falling through to the static-file branch
  // and 404'ing on a nonexistent file named "/?host=...".
  const reqPathOnly = req.url.split('?')[0];
  if (reqPathOnly === '/' || reqPathOnly === '/index.html') {
    const p = path.join(__dirname, 'public', 'pokerth-client.html');
    if (fs.existsSync(p)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' });
      return fs.createReadStream(p).pipe(res);
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
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ v: Math.floor(newest) }));
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
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cacheCtl });
    return fs.createReadStream(candidate).pipe(res);
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

// Set of all connected clients (used to relay reactions / avatars)
const _allClients = new Set();

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

wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(url.parse(req.url).query);
  const host   = params.get('host') || 'pokerth.net';
  const port   = parseInt(params.get('port') || '7234', 10);
  const useTls = params.get('tls') !== '0' && !FORCE_NOTLS;

  // ── Reject hosts outside the allowlist ──
  if (!isHostAllowed(host)) {
    console.warn('[!] Rejected connection to non-allowed host: ' + host + ':' + port);
    try { ws.close(4403, 'Host not in allowlist'); } catch (_) {}
    return;
  }

  console.log('──────────────────────────────────────');
  console.log('[>] ' + (useTls ? 'TLS' : 'TCP') + ' → ' + host + ':' + port);

  let sock, connected = false, rxBuf = Buffer.alloc(0), n = 0;

  _scheduleConn(() => {
  dns.lookup(host, { family: 4 }, (err, addr) => {
    addr = err ? host : addr;
    const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(addr);
    const opts  = { host: addr, port, ...(!isIp && { servername: host }) };

    const onConn = () => {
      connected = true;
      const info = useTls ? '(TLS ' + (sock.getCipher() ? sock.getCipher().name : '?') + ')' : '(raw TCP)';
      console.log('[+] Connected ' + info + ' → ' + addr + ':' + port);

    };

    sock = useTls
      ? tls.connect({ ...opts, rejectUnauthorized: !INSECURE_TLS }, onConn)
      : net.connect(opts, onConn);

    sock.on('data', chunk => {
      rxBuf = Buffer.concat([rxBuf, chunk]);
      while (rxBuf.length >= 4) {
        const msgLen = rxBuf.readUInt32BE(0);
        if (msgLen === 0 || msgLen > 2_000_000) {
          console.error('[-] Invalid frame (' + msgLen + ') – closing');
          ws.close(1011, 'bad frame'); sock.destroy(); return;
        }
        if (rxBuf.length < 4 + msgLen) break;

        const frame   = rxBuf.slice(0, 4 + msgLen);
        const payload = rxBuf.slice(4, 4 + msgLen);
        rxBuf = rxBuf.slice(4 + msgLen);
        n++;

        const d = describeMsg(payload);
        console.log('[S→C] #' + n + ' ' + d.name + ' (' + msgLen + 'b)' + d.extra);
        // Hex dump for diagnostics
        if (msgLen <= 64 || d.name.includes('Error') || d.name === '?' || d.name.includes('Flop') || d.name.includes('Turn') || d.name.includes('River') || d.name.includes('Hand'))
          console.log('      hex: ' + payload.toString('hex'));

        if (ws.readyState === WebSocket.OPEN) ws.send(frame);
      }
    });

    sock.on('error', err => {
      let hint = err.code === 'ECONNREFUSED'             ? '  → is the PokerTH server up?'
               : err.message.includes('wrong version')   ? '  → server without TLS: uncheck TLS'
               : err.code === 'ECONNRESET'               ? '  → connection abruptly cut' : '';
      console.error('[-] Socket error: ' + err.message + hint);
      try { ws.close(1011, err.message); } catch (_) {}
    });

    sock.on('close', () => {
      console.log('[-] Server closed (' + n + ' msg received)');
      setTimeout(() => { try { ws.close(); } catch (_) {} }, 300);
    });

  }); // end _scheduleConn

    // Track this client so we can relay broadcasts to it.
  _allClients.add(ws);
  ws.on('close', () => _allClients.delete(ws));

  ws.on('message', (data, isBinary) => {
      // ── Relay reactions / avatars (text frames REACT:pid:emoji, AVATAR:pid:emoji) ──
      if (!isBinary) {
        const text = data.toString();
        if (text.startsWith('REACT:') || text.startsWith('AVATAR:')) {
          _allClients.forEach(client => {
            if (client !== ws && client.readyState === 1) client.send(text);
          });
          return;
        }
      }
      if (!connected || !sock?.writable) return;
      const buf = Buffer.from(isBinary ? data : data.toString());
      if (buf.length >= 4) {
        const d = describeMsg(buf.slice(4, 4 + buf.readUInt32BE(0)));
        console.log('[C→S] ' + d.name + ' (' + buf.readUInt32BE(0) + 'b)');
        if (buf.readUInt32BE(0) <= 32)
          console.log('      hex: ' + buf.slice(4).toString('hex'));
      }
      sock.write(buf);
    });

    ws.on('close', code => { console.log('[-] Browser off (code ' + code + ')\n'); sock?.destroy(); });
    ws.on('error', err  => { console.error('[-] WS: ' + err.message); sock?.destroy(); });
  });
});

httpServer.listen(PROXY_PORT, () => console.log('Ready → http://localhost:' + PROXY_PORT + '/\n'));
