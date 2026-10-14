'use strict';
// ═══════════════════════════════════════════════════════════════════
// LAN server directory -- web extension, no QML counterpart.
//
// Players propose their own PokerTH server from the login page (LAN mode).
// A proposal waits in a queue until an admin approves or rejects it in
// /admin (Server › LAN directory). An approved server:
//   · joins the dial allowlist (isHostAllowed / isPortAllowed), so the proxy
//     accepts to relay players to it -- without that, every host a player
//     types is refused with close code 4403;
//   · is listed in /app-config and GET /api/lan-directory for the LAN
//     drop-down, unless the admin unticked "visible" (an approved but
//     unlisted server stays dialable by address: a club that does not want
//     to be public).
//
// Separate from the game-server registry (_adminConfig.servers): that one
// is the operator's own infrastructure (Internet mode, TLS pins, SNI); this
// one holds third-party community servers.
//
// Privacy: no IP, nickname or device token is ever stored. The per-IP
// submission limit lives in memory only and forgets itself every day. The
// player gets no follow-up on a proposal ("N1", decided 2026-10-14): the
// answer is the server appearing in the list.
//
// Anti-abuse: the submit-time check makes this proxy open a TCP connection
// to a host chosen by an anonymous visitor. So the port must already be an
// allowed PokerTH port, the host is resolved first and refused when any of
// its addresses is private (setting `refusePrivate`, on by default), the
// connection then goes to the address that was checked (no DNS rebinding
// between check and connect), only the server's greeting is read (no login,
// nothing sent), and checks are rate-limited per IP.
//
// Persistence: one object, _adminConfig.lanDirectory =
//   { settings: {...}, pending: [...], entries: [...] }
// read through deps.getStore() on every call (an admin config import
// replaces the whole config object), and re-sanitized on read.
// ═══════════════════════════════════════════════════════════════════

const net = require('net');
const tls = require('tls');
const dns = require('dns');
const crypto = require('crypto');

const DEFAULT_SETTINGS = Object.freeze({
  acceptRequests: true,   // the "Propose my server" form is open
  checkMinutes: 5,        // health check period for approved servers
  autoHideDays: 7,        // offline that long -> dropped from the public list
  maxPerIpDay: 3,         // proposals per IP per day
  showOffline: true,      // offline servers stay listed (greyed out client-side)
  refusePrivate: true,    // refuse hosts resolving to private / loopback addresses
  // "Saisie manuelle" (S3, 2026-10-14): whether the login page still lets a
  // player type any address. On by default so an existing self-hosted
  // install keeps its current behavior; pokerth.net turns it off.
  manualEntry: true
});
const LIMITS = Object.freeze({ pending: 100, entries: 200, name: 40, desc: 140, testsPerIpHour: 20 });

// ── Sanitizers ─────────────────────────────────────────────────────
function cleanText(s, max) {
  return String(s == null ? '' : s)
    .replace(/[\u0000-\u001f\u007f-\u009f<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}
function cleanHost(h) {
  var s = String(h == null ? '' : h).trim().toLowerCase();
  if (s.charAt(0) === '[' && s.charAt(s.length - 1) === ']') s = s.slice(1, -1);   // [::1]
  if (!s || s.length > 253) return '';
  if (net.isIP(s)) return s;
  if (!/^[a-z0-9.-]+$/.test(s)) return '';
  var labels = s.split('.');
  for (var i = 0; i < labels.length; i++) {
    var l = labels[i];
    if (!l || l.length > 63 || l.charAt(0) === '-' || l.charAt(l.length - 1) === '-') return '';
  }
  return s;
}
function cleanPort(p) { var n = parseInt(p, 10); return (Number.isInteger(n) && n >= 1 && n <= 65535) ? n : 0; }
function cleanCountry(c) { var s = String(c || '').trim().toUpperCase(); return /^[A-Z]{2}$/.test(s) ? s : ''; }
function cleanLang(l) { var s = String(l || '').trim(); return /^[a-z]{2,3}(-[A-Za-z0-9]{2,4})?$/.test(s) ? s : ''; }
function cleanSni(s) { var v = String(s || '').trim().toLowerCase().slice(0, 253); return /^[a-z0-9.-]*$/.test(v) ? v : ''; }
function cleanId(s) { var v = String(s || '').trim(); return /^lan_[a-f0-9]{6,32}$/.test(v) ? v : ''; }
function newId() { return 'lan_' + crypto.randomBytes(6).toString('hex'); }
function num(v, min, max, dflt) { var n = parseInt(v, 10); return (Number.isInteger(n) && n >= min && n <= max) ? n : dflt; }

function normSettings(s) {
  s = (s && typeof s === 'object') ? s : {};
  var d = DEFAULT_SETTINGS;
  return {
    acceptRequests: typeof s.acceptRequests === 'boolean' ? s.acceptRequests : d.acceptRequests,
    checkMinutes: num(s.checkMinutes, 1, 1440, d.checkMinutes),
    autoHideDays: num(s.autoHideDays, 0, 365, d.autoHideDays),       // 0 = never auto-hide
    maxPerIpDay: num(s.maxPerIpDay, 1, 50, d.maxPerIpDay),
    showOffline: typeof s.showOffline === 'boolean' ? s.showOffline : d.showOffline,
    refusePrivate: typeof s.refusePrivate === 'boolean' ? s.refusePrivate : d.refusePrivate,
    manualEntry: typeof s.manualEntry === 'boolean' ? s.manualEntry : d.manualEntry
  };
}
// The fields a player may set. `admin` adds the TLS overrides and visibility.
function cleanFields(raw, admin) {
  raw = (raw && typeof raw === 'object') ? raw : {};
  var host = cleanHost(raw.host);
  var out = {
    name: cleanText(raw.name, LIMITS.name) || host,
    host: host,
    port: cleanPort(raw.port),
    tls: !!raw.tls,
    country: cleanCountry(raw.country),
    lang: cleanLang(raw.lang),
    desc: cleanText(raw.desc, LIMITS.desc)
  };
  if (admin) {
    out.noverify = !!raw.noverify;
    out.sni = cleanSni(raw.sni);
    out.visible = raw.visible !== false;
  }
  return out;
}
function normProbe(p) {
  if (!p || typeof p !== 'object') return null;
  return {
    reachable: !!p.reachable, pokerth: !!p.pokerth,
    players: Number.isInteger(p.players) ? p.players : null,
    ver: cleanText(p.ver, 16), ms: num(p.ms, 0, 600000, 0),
    certUntrusted: !!p.certUntrusted, error: cleanText(p.error, 60),
    at: num(p.at, 0, 8.64e15, 0)
  };
}
function normPending(r) {
  if (!r || typeof r !== 'object') return null;
  var f = cleanFields(r, false);
  var id = cleanId(r.id);
  if (!id || !f.host || !f.port) return null;
  return Object.assign({ id: id }, f, { submittedAt: num(r.submittedAt, 0, 8.64e15, 0), probe: normProbe(r.probe) });
}
function normEntry(r) {
  if (!r || typeof r !== 'object') return null;
  var f = cleanFields(r, true);
  var id = cleanId(r.id);
  if (!id || !f.host || !f.port) return null;
  return Object.assign({ id: id }, f, { addedAt: num(r.addedAt, 0, 8.64e15, 0), lastSeen: num(r.lastSeen, 0, 8.64e15, 0) });
}

// ── Private / special-purpose address test ─────────────────────────
// True for anything that is not a routable public unicast address: the
// submit check must never let an anonymous visitor point this proxy at the
// operator's own network.
function isPrivateAddress(ip) {
  var s = String(ip || '').trim().toLowerCase();
  var m = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (m) s = m[1];
  var fam = net.isIP(s);
  if (fam === 4) {
    var o = s.split('.').map(Number);
    if (o[0] === 0 || o[0] === 10 || o[0] === 127) return true;
    if (o[0] === 100 && o[1] >= 64 && o[1] <= 127) return true;       // CGNAT
    if (o[0] === 169 && o[1] === 254) return true;                    // link-local
    if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return true;
    if (o[0] === 192 && o[1] === 168) return true;
    if (o[0] === 192 && o[1] === 0 && (o[2] === 0 || o[2] === 2)) return true;
    if (o[0] === 198 && (o[1] === 18 || o[1] === 19)) return true;   // benchmarking
    if (o[0] === 198 && o[1] === 51 && o[2] === 100) return true;    // documentation
    if (o[0] === 203 && o[1] === 0 && o[2] === 113) return true;     // documentation
    if (o[0] >= 224) return true;                                     // multicast, reserved, broadcast
    return false;
  }
  if (fam === 6) {
    if (s === '::' || s === '::1') return true;
    if (/^f[cd][0-9a-f]{0,2}:/.test(s)) return true;                  // fc00::/7 unique local
    if (/^fe[89ab][0-9a-f]?:/.test(s)) return true;                   // fe80::/10 link-local
    if (/^ff[0-9a-f]{0,2}:/.test(s)) return true;                     // multicast
    if (/^2001:0?db8:/.test(s)) return true;                          // documentation
    if (/^64:ff9b:/.test(s)) return true;                             // NAT64 can embed a private v4
    return false;
  }
  return true;   // not an IP at all: refuse
}

// ── Greeting probe ─────────────────────────────────────────────────
// Connect, read the first frame, check it is a PokerTH AnnounceMessage,
// disconnect. Nothing is sent: no login, no guest nick in the server lobby.
// t = { host, port, tls, address?, servername?, noverify?, timeoutMs? }
// cb({ reachable, pokerth, players, ver, ms, certError, error })
const CERT_ERRORS = /^(CERT_|DEPTH_ZERO_SELF_SIGNED_CERT|SELF_SIGNED_CERT_IN_CHAIN|UNABLE_TO_(GET|VERIFY)_|ERR_TLS_CERT_ALTNAME_INVALID|HOSTNAME_MISMATCH)/;
function announceProbe(t, decode, cb) {
  var t0 = Date.now(), done = false, sock = null, rx = Buffer.alloc(0);
  var timer = setTimeout(function () { finish({ error: 'timeout' }); }, t.timeoutMs || 6000);
  function finish(r) {
    if (done) return; done = true;
    clearTimeout(timer);
    try { if (sock) sock.destroy(); } catch (e) {}
    cb(Object.assign({ reachable: false, pokerth: false, players: null, ver: '', serverType: null, certError: false, error: '' }, r, { ms: Date.now() - t0 }));
  }
  function onData(chunk) {
    rx = Buffer.concat([rx, chunk]);
    if (rx.length < 4) return;
    var len = rx.readUInt32BE(0);
    if (len === 0 || len > 65536) return finish({ reachable: true, error: 'not a PokerTH server' });
    if (rx.length < 4 + len) { if (rx.length > 70000) finish({ reachable: true, error: 'not a PokerTH server' }); return; }
    var msg = null;
    try { msg = decode ? decode(rx.subarray(4, 4 + len)) : null; } catch (e) { msg = null; }
    if (!decode) return finish({ reachable: true, error: 'protocol not ready' });
    var a = msg && msg.announceMessage;
    if (!a) return finish({ reachable: true, error: 'not a PokerTH server' });
    var v = a.protocolVersion || {};
    finish({ reachable: true, pokerth: true, players: (a.numPlayersOnServer >>> 0),
             ver: (v.majorVersion | 0) + '.' + (v.minorVersion | 0), serverType: (a.serverType | 0) });
  }
  try {
    var opts = { host: t.address || t.host, port: t.port };
    if (t.tls) {
      var sn = t.servername != null ? t.servername : (net.isIP(t.host) ? '' : t.host);
      sock = tls.connect(Object.assign({ rejectUnauthorized: !t.noverify }, sn ? { servername: sn } : {}, opts));
    } else {
      sock = net.connect(opts);
    }
    sock.on('data', onData);
    sock.on('error', function (e) {
      var code = (e && e.code) || 'error';
      finish({ error: code, certError: CERT_ERRORS.test(code), reachable: CERT_ERRORS.test(code) });
    });
    sock.on('close', function () { finish({ error: 'closed before greeting' }); });
  } catch (e) { finish({ error: (e && e.code) || 'error' }); }
}

// ── The directory ──────────────────────────────────────────────────
// deps:
//   getStore()            -> the persisted object (created if missing)
//   save()                -> persist the admin config
//   getDecode()           -> PROTO.decode once the bundle is loaded, else null
//   isPortAllowed(port)   -> the proxy's port allowlist (directory included)
//   insecureTls           -> the proxy's --insecure flag
//   lobbyProbe(host, port, tls, cb, tlsOpts)  -> full guest lobby probe (admin "Check")
//   now(), lookup(host, cb), probe(target, cb)  -> injectable for tests
function createLanDirectory(deps) {
  deps = deps || {};
  var now = deps.now || Date.now;
  var lookup = deps.lookup || function (host, cb) {
    if (net.isIP(host)) return cb(null, [host]);
    dns.lookup(host, { all: true, verbatim: true }, function (err, list) {
      // IPv4 first, like the game connection (dns.setDefaultResultOrder).
      var a = (list || []).slice().sort(function (x, y) { return (x.family === 4 ? 0 : 1) - (y.family === 4 ? 0 : 1); });
      cb(err, a.map(function (x) { return x.address; }));
    });
  };
  var probe = deps.probe || function (target, cb) {
    var decode = deps.getDecode ? deps.getDecode() : null;
    announceProbe(target, decode, cb);
  };
  var status = new Map();            // entry id -> last health result (memory only)
  var ipDay = new Map();             // ip -> { day, n } proposals (memory only)
  var ipTests = new Map();           // ip -> [timestamps] connection tests (memory only)
  var checking = new Set();
  var timer = null;

  function store() {
    var s = deps.getStore ? deps.getStore() : {};
    return (s && typeof s === 'object') ? s : {};
  }
  function settings() { return normSettings(store().settings); }
  function pending() { var a = store().pending; return Array.isArray(a) ? a.map(normPending).filter(Boolean) : []; }
  function entries() { var a = store().entries; return Array.isArray(a) ? a.map(normEntry).filter(Boolean) : []; }
  function write(next) {
    var s = store();
    if ('settings' in next) s.settings = next.settings;
    if ('pending' in next) s.pending = next.pending;
    if ('entries' in next) s.entries = next.entries;
    if (deps.save) deps.save();
  }
  function findByAddr(list, host, port) {
    for (var i = 0; i < list.length; i++) if (list[i].host === host && list[i].port === port) return list[i];
    return null;
  }

  // ── allowlist hooks ──
  function hostAllowed(h) {
    var v = String(h || '').trim().toLowerCase();
    if (!v) return false;
    return entries().some(function (e) { return e.host === v; });
  }
  function portAllowed(p) {
    var n = parseInt(p, 10);
    return entries().some(function (e) { return e.port === n; });
  }
  function tlsOpts(host, port) {
    var e = findByAddr(entries(), String(host || '').trim().toLowerCase(), parseInt(port, 10));
    return e ? { sni: e.sni || '', noverify: !!e.noverify } : null;
  }

  // ── visibility ──
  function isAutoHidden(e, st, cfg) {
    if (!cfg.autoHideDays) return false;
    if (!st || st.online !== false) return false;
    var since = e.lastSeen || e.addedAt || 0;
    return (now() - since) > cfg.autoHideDays * 86400000;
  }
  function publicView() {
    var cfg = settings();
    var list = [];
    entries().forEach(function (e) {
      if (!e.visible) return;
      var st = status.get(e.id) || null;
      if (isAutoHidden(e, st, cfg)) return;
      if (!cfg.showOffline && st && st.online === false) return;
      list.push({
        id: e.id, name: e.name, host: e.host, port: e.port, tls: e.tls,
        country: e.country, lang: e.lang, desc: e.desc,
        online: st ? st.online : null,
        players: (st && st.online && Number.isInteger(st.players)) ? st.players : null
      });
    });
    // Online first, then by name.
    list.sort(function (a, b) {
      var ra = a.online === true ? 0 : (a.online === null ? 1 : 2);
      var rb = b.online === true ? 0 : (b.online === null ? 1 : 2);
      return ra - rb || a.name.localeCompare(b.name);
    });
    return { acceptRequests: cfg.acceptRequests, manualEntry: cfg.manualEntry, servers: list };
  }
  function adminView() {
    var cfg = settings();
    return {
      ok: true,
      settings: cfg,
      pending: pending().sort(function (a, b) { return b.submittedAt - a.submittedAt; }),
      entries: entries().map(function (e) {
        var st = status.get(e.id) || null;
        return Object.assign({}, e, { status: st, autoHidden: isAutoHidden(e, st, cfg) });
      })
    };
  }

  // ── rate limits (memory only) ──
  function today() { return Math.floor(now() / 86400000); }
  function ipCanPropose(ip, cfg) {
    var r = ipDay.get(ip);
    if (!r || r.day !== today()) return true;
    return r.n < cfg.maxPerIpDay;
  }
  function ipCountProposal(ip) {
    var d = today(), r = ipDay.get(ip);
    if (!r || r.day !== d) { r = { day: d, n: 0 }; ipDay.set(ip, r); }
    r.n++;
    if (ipDay.size > 5000) ipDay.forEach(function (v, k) { if (v.day !== d) ipDay.delete(k); });
  }
  function ipCanTest(ip) {
    var t = now(), a = (ipTests.get(ip) || []).filter(function (x) { return t - x < 3600000; });
    if (a.length >= LIMITS.testsPerIpHour) { ipTests.set(ip, a); return false; }
    a.push(t); ipTests.set(ip, a);
    if (ipTests.size > 5000) ipTests.forEach(function (v, k) { if (!v.length || t - v[v.length - 1] > 3600000) ipTests.delete(k); });
    return true;
  }

  // ── submit-time check (shared by "Test" and "Send") ──
  // cb(errCode | null, result)
  function checkCandidate(f, cb) {
    var cfg = settings();
    if (!f.host) return cb('host');
    if (!f.port) return cb('port');
    if (deps.isPortAllowed && !deps.isPortAllowed(f.port)) return cb('port');
    lookup(f.host, function (err, addrs) {
      if (err || !addrs || !addrs.length) return cb('dns');
      if (cfg.refusePrivate && addrs.some(isPrivateAddress)) return cb('private');
      var target = { host: f.host, port: f.port, tls: f.tls, address: addrs[0],
                     servername: net.isIP(f.host) ? '' : f.host, noverify: !!deps.insecureTls };
      probe(target, function (r) {
        if (r && r.certError && !target.noverify) {
          // Self-signed or mismatched certificate: confirm it is still a
          // PokerTH server, and let the admin decide on "skip cert check".
          return probe(Object.assign({}, target, { noverify: true }), function (r2) {
            cb(null, Object.assign({}, r2, { certUntrusted: !!(r2 && r2.pokerth) }));
          });
        }
        cb(null, r || {});
      });
    });
  }
  function shapeTest(r) {
    return { reachable: !!r.reachable, pokerth: !!r.pokerth, players: Number.isInteger(r.players) ? r.players : null,
             ver: r.ver || '', ms: r.ms || 0, certUntrusted: !!r.certUntrusted, error: r.pokerth ? '' : (r.error || '') };
  }

  // POST /api/lan-directory/test  { host, port, tls }
  function test(body, ip, cb) {
    var f = cleanFields(body, false);
    if (!ipCanTest(String(ip || ''))) return cb({ ok: false, error: 'limit' });
    checkCandidate(f, function (code, r) {
      if (code) return cb({ ok: false, error: code });
      cb(Object.assign({ ok: true }, shapeTest(r)));
    });
  }

  // POST /api/lan-directory/propose  { name, host, port, tls, country, lang, desc }
  function propose(body, ip, cb) {
    var cfg = settings();
    if (!cfg.acceptRequests) return cb({ ok: false, error: 'closed' });
    var f = cleanFields(body, false);
    if (!f.host) return cb({ ok: false, error: 'host' });
    if (!f.port) return cb({ ok: false, error: 'port' });
    if (findByAddr(entries(), f.host, f.port)) return cb({ ok: false, error: 'listed' });
    if (findByAddr(pending(), f.host, f.port)) return cb({ ok: false, error: 'pending' });
    if (pending().length >= LIMITS.pending) return cb({ ok: false, error: 'full' });
    var key = String(ip || '');
    if (!ipCanPropose(key, cfg)) return cb({ ok: false, error: 'limit' });
    checkCandidate(f, function (code, r) {
      if (code) return cb({ ok: false, error: code });
      if (!r.pokerth) return cb({ ok: false, error: r.reachable ? 'notpokerth' : 'unreachable', detail: r.error || '' });
      // Re-read: another request may have landed during the probe.
      var p = pending();
      if (findByAddr(entries(), f.host, f.port)) return cb({ ok: false, error: 'listed' });
      if (findByAddr(p, f.host, f.port)) return cb({ ok: false, error: 'pending' });
      if (p.length >= LIMITS.pending) return cb({ ok: false, error: 'full' });
      ipCountProposal(key);
      var t = shapeTest(r);
      p.push(Object.assign({ id: newId() }, f, { submittedAt: now(), probe: Object.assign(t, { at: now() }) }));
      write({ pending: p });
      cb({ ok: true });
    });
  }

  // ── admin ──
  // POST /admin/lan-directory { action, id?, entry?, settings? } -> cb(json)
  function admin(d, cb) {
    d = (d && typeof d === 'object') ? d : {};
    var action = String(d.action || '');
    var id = cleanId(d.id);
    var p = pending(), e = entries();
    var pi = p.findIndex(function (x) { return x.id === id; });
    var ei = e.findIndex(function (x) { return x.id === id; });

    if (action === 'settings') {
      write({ settings: normSettings(Object.assign({}, settings(), d.settings || {})) });
      return cb(adminView());
    }
    if (action === 'approve') {
      if (pi < 0) return cb({ ok: false, error: 'unknown request' });
      if (e.length >= LIMITS.entries) return cb({ ok: false, error: 'directory full' });
      var req = p[pi];
      var f = cleanFields(Object.assign({}, req, { noverify: req.probe && req.probe.certUntrusted }, d.entry || {}), true);
      if (!f.host || !f.port) return cb({ ok: false, error: 'host and port required' });
      if (findByAddr(e, f.host, f.port)) return cb({ ok: false, error: 'already listed' });
      var seen = (req.probe && req.probe.pokerth && req.probe.at) || 0;
      e.push(Object.assign({ id: req.id }, f, { addedAt: now(), lastSeen: seen }));
      p.splice(pi, 1);
      write({ pending: p, entries: e });
      status.delete(req.id);
      setTimeout(function () { checkEntry(req.id); }, 0);
      return cb(adminView());
    }
    if (action === 'reject') {
      if (pi < 0) return cb({ ok: false, error: 'unknown request' });
      p.splice(pi, 1);
      write({ pending: p });
      return cb(adminView());
    }
    if (action === 'add') {
      if (e.length >= LIMITS.entries) return cb({ ok: false, error: 'directory full' });
      var fa = cleanFields(d.entry, true);
      if (!fa.host || !fa.port) return cb({ ok: false, error: 'host and port required' });
      if (findByAddr(e, fa.host, fa.port)) return cb({ ok: false, error: 'already listed' });
      var nid = newId();
      e.push(Object.assign({ id: nid }, fa, { addedAt: now(), lastSeen: 0 }));
      // A manual add supersedes a pending request for the same address.
      var dup = p.findIndex(function (x) { return x.host === fa.host && x.port === fa.port; });
      if (dup >= 0) p.splice(dup, 1);
      write({ pending: p, entries: e });
      setTimeout(function () { checkEntry(nid); }, 0);
      return cb(adminView());
    }
    if (action === 'update') {
      if (ei >= 0) {
        var fu = cleanFields(Object.assign({}, e[ei], d.entry || {}), true);
        if (!fu.host || !fu.port) return cb({ ok: false, error: 'host and port required' });
        var clash = e.some(function (x, i) { return i !== ei && x.host === fu.host && x.port === fu.port; });
        if (clash) return cb({ ok: false, error: 'already listed' });
        var moved = fu.host !== e[ei].host || fu.port !== e[ei].port || fu.tls !== e[ei].tls;
        e[ei] = Object.assign({}, e[ei], fu);
        write({ entries: e });
        if (moved) { status.delete(id); setTimeout(function () { checkEntry(id); }, 0); }
        return cb(adminView());
      }
      if (pi >= 0) {
        var fp = cleanFields(Object.assign({}, p[pi], d.entry || {}), false);
        if (!fp.host || !fp.port) return cb({ ok: false, error: 'host and port required' });
        p[pi] = Object.assign({}, p[pi], fp);
        write({ pending: p });
        return cb(adminView());
      }
      return cb({ ok: false, error: 'unknown id' });
    }
    if (action === 'remove') {
      if (ei < 0) return cb({ ok: false, error: 'unknown entry' });
      e.splice(ei, 1);
      write({ entries: e });
      status.delete(id);
      return cb(adminView());
    }
    if (action === 'check') {
      // Full guest lobby probe (tables + players), with the TLS settings a
      // real game would use. Admin-triggered only: it logs a guest in.
      var tgt = ei >= 0 ? e[ei] : (pi >= 0 ? p[pi] : null);
      if (!tgt) return cb({ ok: false, error: 'unknown id' });
      if (!deps.lobbyProbe) return cb({ ok: false, error: 'probe unavailable' });
      var to = ei >= 0 ? { sni: tgt.sni || '', noverify: !!tgt.noverify }
                       : { sni: '', noverify: !!(tgt.probe && tgt.probe.certUntrusted) };
      return deps.lobbyProbe(tgt.host, tgt.port, tgt.tls, function (r) {
        r = r || {};
        var at = now();
        if (ei >= 0) {
          recordStatus(tgt.id, { online: !!r.reachable, players: Number.isInteger(r.players) ? r.players : null,
                                  games: Number.isInteger(r.games) ? r.games : null, ver: r.ver || '', ms: r.ms || 0,
                                  error: r.reachable ? '' : (r.error || ''), at: at });
        } else {
          var pp = pending(), k = pp.findIndex(function (x) { return x.id === tgt.id; });
          if (k >= 0) {
            pp[k].probe = Object.assign({}, pp[k].probe || {}, { reachable: !!r.reachable, pokerth: !!r.reachable,
              players: Number.isInteger(r.players) ? r.players : null, ver: r.ver || '', ms: r.ms || 0,
              error: r.reachable ? '' : (r.error || ''), at: at });
            write({ pending: pp });
          }
        }
        cb(Object.assign({ ok: true, check: { reachable: !!r.reachable, players: r.players, games: r.games, running: r.running, ver: r.ver || '', ms: r.ms || 0, error: r.error || '' } }, adminView()));
      }, to);
    }
    return cb({ ok: false, error: 'unknown action' });
  }

  // ── health checks ──
  function recordStatus(entryId, st) {
    status.set(entryId, st);
    if (!st.online) return;
    var e = entries(), i = e.findIndex(function (x) { return x.id === entryId; });
    if (i < 0) return;
    // lastSeen drives auto-hide across restarts; persist it at most hourly.
    if (st.at - (e[i].lastSeen || 0) > 3600000) { e[i].lastSeen = st.at; write({ entries: e }); }
  }
  function checkEntry(entryId, done) {
    var e = entries().filter(function (x) { return x.id === entryId; })[0];
    if (!e || checking.has(entryId)) { if (done) done(); return; }
    checking.add(entryId);
    probe({ host: e.host, port: e.port, tls: e.tls, servername: e.sni || (net.isIP(e.host) ? '' : e.host),
            noverify: !!(e.noverify || deps.insecureTls) }, function (r) {
      checking.delete(entryId);
      r = r || {};
      recordStatus(entryId, { online: !!r.pokerth, players: Number.isInteger(r.players) ? r.players : null,
                              games: null, ver: r.ver || '', ms: r.ms || 0,
                              error: r.pokerth ? '' : (r.error || 'unreachable'), at: now() });
      if (done) done();
    });
  }
  // Checks every approved server whose last result is older than the period,
  // a few at a time. Returns the ids it started (tests).
  function tick() {
    var cfg = settings(), t = now(), period = cfg.checkMinutes * 60000, started = [];
    entries().forEach(function (e) {
      if (started.length + checking.size >= 4) return;
      var st = status.get(e.id);
      if (st && t - st.at < period) return;
      if (checking.has(e.id)) return;
      started.push(e.id);
      checkEntry(e.id);
    });
    // Forget the status of removed entries.
    var ids = new Set(entries().map(function (e) { return e.id; }));
    status.forEach(function (_, k) { if (!ids.has(k)) status.delete(k); });
    return started;
  }
  function start() {
    if (timer) return;
    setTimeout(tick, 10000).unref();
    timer = setInterval(tick, 60000);
    if (timer.unref) timer.unref();
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  return {
    settings: settings, publicView: publicView, adminView: adminView,
    hostAllowed: hostAllowed, portAllowed: portAllowed, tlsOpts: tlsOpts,
    test: test, propose: propose, admin: admin,
    tick: tick, checkEntry: checkEntry, start: start, stop: stop,
    _status: status
  };
}

module.exports = {
  createLanDirectory: createLanDirectory,
  announceProbe: announceProbe,
  isPrivateAddress: isPrivateAddress,
  cleanHost: cleanHost,
  cleanText: cleanText,
  normSettings: normSettings,
  DEFAULT_SETTINGS: DEFAULT_SETTINGS,
  LIMITS: LIMITS
};
