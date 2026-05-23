/**
 * PokerTH WebSocket <-> TLS/TCP Proxy v2.3
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

dns.setDefaultResultOrder('ipv4first');

// ── Décodeur protobuf minimal ──
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

// Décode un buffer en { fieldNum: value[] }
// valeurs = number (varint) ou Buffer (length-delimited)
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

const MSG_NAMES = {
  1:'Announce', 2:'Init', 3:'AuthServerChallenge', 4:'AuthClientResponse',
  5:'AuthServerVerification', 6:'InitAck', 12:'PlayerList',
  13:'GameListNew', 14:'GameListUpdate', 15:'GameListPlayerJoined', 16:'GameListPlayerLeft',
  18:'PlayerInfoRequest', 19:'PlayerInfoReply',
  21:'JoinExisting', 22:'JoinNew', 24:'JoinGameAck', 25:'JoinGameFailed',
  26:'GamePlayerJoined', 27:'GamePlayerLeft', 29:'RemovedFromGame',
  36:'StartEvent', 38:'GameStartInitial', 40:'HandStart', 41:'PlayersTurn',
  42:'MyActionRequest', 44:'PlayersActionDone', 45:'DealFlop', 46:'DealTurn', 47:'DealRiver',
  49:'EndOfHandShow', 50:'EndOfHandHide', 53:'EndOfGame',
  62:'Statistics', 63:'ChatRequest', 64:'Chat', 65:'ChatReject', 66:'Dialog',
  67:'TimeoutWarning', 73:'Error',
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

    // Chercher le champ d'ErrorMessage (field 74 dans PokerTHMessage)
    let extra = '';
    if (msgType === 73 && outer[74] && outer[74][0]) {
      const errMsg = pbDecode(outer[74][0]);
      // ErrorMessage.errorReason = field 1 (varint)
      const reason = errMsg[1] ? errMsg[1][0] : null;
      extra = ' *** ERREUR: ' + (reason !== null ? (ERROR_REASONS[reason] || 'code '+reason) : '?') + ' ***';
    }
    if (msgType === 6 && outer[7] && outer[7][0]) { // InitAck
      const ack = pbDecode(outer[7][0]);
      const pid = ack[2] ? ack[2][0] : '?';
      extra = ' ✓ CONNECTE! playerId=' + pid;
    }
    if (msgType === 1 && outer[2] && outer[2][0]) { // Announce
      const ann = pbDecode(outer[2][0]);
      const sv = ann[1] ? pbDecode(ann[1][0]) : {};
      const major = sv[1] ? sv[1][0] : '?';
      const minor = sv[2] ? sv[2][0] : '?';
      const np    = ann[5] ? ann[5][0] : '?';
      extra = ' (protocol v' + major + '.' + minor + ', ' + np + ' joueurs)';
    }
    return { name, extra };
  } catch(e) {
    return { name: '?', extra: ' (decode error: ' + e.message + ')' };
  }
}

// ── HTTP server ──
const httpServer = http.createServer((req, res) => {
  if (req.url === '/') {
    const p = path.join(__dirname, 'public', 'pokerth-client.html');
    if (fs.existsSync(p)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' });
      return fs.createReadStream(p).pipe(res);
    }
  }
  
  const publicPath = path.join(__dirname, 'public', path.basename(req.url.split('?')[0]));
  if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
    const ext = path.extname(publicPath).toLowerCase();
    const type = ext === '.svg' ? 'image/svg+xml' : ext === '.ico' ? 'image/x-icon' : ext === '.png' ? 'image/png' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400' });
    return fs.createReadStream(publicPath).pipe(res);
  }
  res.writeHead(404); res.end('Not found');
});

const wss = new WebSocket.Server({ server: httpServer });

console.log('\n╔═══════════════════════════════════════════════╗');
console.log('║     PokerTH WebSocket Proxy v2.3              ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('\n▶ Proxy : ws://localhost:' + PROXY_PORT + '  /  http://localhost:' + PROXY_PORT + '/');
console.log('▶ TLS   : ' + (FORCE_NOTLS ? 'DESACTIVE (--notls)' : 'ACTIVE par defaut'));
console.log('▶ Certs : ' + (INSECURE_TLS ? 'verification DESACTIVEE (--insecure)' : 'verification active'));
console.log('\nConseils:');
console.log('  • Serveur LAN sans TLS → decochez TLS dans le navigateur');
console.log('  • pokerth.net          → TLS coche, login registered requis');
console.log('\nEn attente...\n');

// Ensemble de tous les clients connectés (pour relais réactions)
const _allClients = new Set();

wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(url.parse(req.url).query);
  const host   = params.get('host') || 'pokerth.net';
  const port   = parseInt(params.get('port') || '7234', 10);
  const useTls = params.get('tls') !== '0' && !FORCE_NOTLS;

  console.log('──────────────────────────────────────');
  console.log('[>] ' + (useTls ? 'TLS' : 'TCP') + ' → ' + host + ':' + port);

  let sock, connected = false, rxBuf = Buffer.alloc(0), n = 0;

  dns.lookup(host, { family: 4 }, (err, addr) => {
    addr = err ? host : addr;
    const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(addr);
    const opts  = { host: addr, port, ...(!isIp && { servername: host }) };

    const onConn = () => {
      connected = true;
      const info = useTls ? '(TLS ' + (sock.getCipher() ? sock.getCipher().name : '?') + ')' : '(TCP brut)';
      console.log('[+] Connecté ' + info + ' → ' + addr + ':' + port);

    };

    sock = useTls
      ? tls.connect({ ...opts, rejectUnauthorized: !INSECURE_TLS }, onConn)
      : net.connect(opts, onConn);

    sock.on('data', chunk => {
      rxBuf = Buffer.concat([rxBuf, chunk]);
      while (rxBuf.length >= 4) {
        const msgLen = rxBuf.readUInt32BE(0);
        if (msgLen === 0 || msgLen > 2_000_000) {
          console.error('[-] Frame invalide (' + msgLen + ') – fermeture');
          ws.close(1011, 'bad frame'); sock.destroy(); return;
        }
        if (rxBuf.length < 4 + msgLen) break;

        const frame   = rxBuf.slice(0, 4 + msgLen);
        const payload = rxBuf.slice(4, 4 + msgLen);
        rxBuf = rxBuf.slice(4 + msgLen);
        n++;

        const d = describeMsg(payload);
        console.log('[S→C] #' + n + ' ' + d.name + ' (' + msgLen + 'b)' + d.extra);
        // Afficher hex pour diagnostics
        if (msgLen <= 64 || d.name.includes('Error') || d.name === '?' || d.name.includes('Flop') || d.name.includes('Turn') || d.name.includes('River') || d.name.includes('Hand'))
          console.log('      hex: ' + payload.toString('hex'));

        if (ws.readyState === WebSocket.OPEN) ws.send(frame);
      }
    });

    sock.on('error', err => {
      let hint = err.code === 'ECONNREFUSED'             ? '  → PokerTH tourne-t-il ?' 
               : err.message.includes('wrong version')   ? '  → Serveur sans TLS: decochez TLS'
               : err.code === 'ECONNRESET'               ? '  → Connexion coupee brutalement' : '';
      console.error('[-] Erreur socket: ' + err.message + hint);
      try { ws.close(1011, err.message); } catch (_) {}
    });

    sock.on('close', () => {
      console.log('[-] Serveur ferme (' + n + ' msg recus)');
      setTimeout(() => { try { ws.close(); } catch (_) {} }, 300);
    });

    // Enregistrer ce client pour le relais
  _allClients.add(ws);
  ws.on('close', () => _allClients.delete(ws));

  ws.on('message', (data, isBinary) => {
      // ── Relais réactions (message texte REACT:pid:emoji) ──
      if (!isBinary) {
        const text = data.toString();
        if (text.startsWith('REACT:')) {
          console.log('[REACT] relais → ' + (_allClients.size - 1) + ' autres clients');
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

httpServer.listen(PROXY_PORT, () => console.log('Prêt → http://localhost:' + PROXY_PORT + '/\n'));
