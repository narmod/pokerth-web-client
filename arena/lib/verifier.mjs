// ═══════════════════════════════════════════════════════════════════
// Arena — a nickname proved on a game server (service 0.28.0, 2026-10-24).
//
// A signed-in player asks for a code for one of the LAN servers of this
// install. A small bot (« TD-check-… ») connects to that server's lobby and
// waits: the player, connected under his nickname, sends the code in the
// lobby chat or as a private message to the bot. When the line comes from
// the player whose name is the account's nickname (any case), the account
// is marked verified on that server. One connection per server, while codes
// are waiting; a code lasts 10 minutes; the bot never joins a game.
//
// It proves the player held that nickname on that server at that time:
// strong on a server with accounts, weaker on a LAN server, where nicknames
// are not checked — together with the account, it ties the nickname to the
// person who could connect with it. pokerth.net is not offered (decided
// 2026-10-23: nothing for pokerth.net without sp0ck's agreement).
// ═══════════════════════════════════════════════════════════════════

import net from 'node:net';
import tls from 'node:tls';
import crypto from 'node:crypto';
import { pb } from './platform.mjs';
import { build, frame, spkiPin, buildIdFor } from './spectator.mjs';

const LOGIN = pb.InitMessage.LoginType;
const T = pb.PokerTHMessage.PokerTHMessageType;
export const CODE_MS = 10 * 60 * 1000;
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const low = (s) => String(s || '').toLowerCase();

function chatPm(playerId, chatText) {
  return frame(pb.PokerTHMessage.encode(pb.PokerTHMessage.create({ messageType: T.Type_ChatRequestMessage, chatRequestMessage: pb.ChatRequestMessage.create({ targetPlayerId: playerId, chatText }) })).finish());
}

/**
 * o: { resolve: async (ref) => server | null, connOpts: (server) => {…}, version: () => string,
 *      onVerified: (pending) => void, now?, log? }
 */
export function createVerifier(o) {
  const now = o.now || (() => Date.now());
  const log = o.log || (() => {});
  const pending = new Map();   // code → { code, nick, playerId (account), ref, serverName, expires, done }
  const conns = new Map();     // ref → connection

  function newCode() { const b = crypto.randomBytes(6); let s = ''; for (let i = 0; i < 6; i++) s += ABC[b[i] % ABC.length]; return s; }

  async function request(account, ref) {
    const s = await o.resolve(ref);
    if (!s) throw Object.assign(new Error('unknown server'), { code: 'unknownServer' });
    // One code at a time per account: a new one replaces the old.
    for (const [c, p] of pending) if (p.accountId === account.id) pending.delete(c);
    let code = newCode();
    while (pending.has(code)) code = newCode();
    const p = { code, nick: account.nick, accountId: account.id, ref: s.ref, serverName: s.name, expires: now() + CODE_MS, done: false };
    pending.set(code, p);
    const c = connect(s);
    p.bot = c.nick;
    return { code, expires: p.expires, server: s.name, bot: c.nick };
  }
  function status(account) {
    for (const p of pending.values()) if (p.accountId === account.id) return { code: p.code, expires: p.expires, server: p.serverName, done: p.done, bot: conns.get(p.ref) ? conns.get(p.ref).nick : p.bot || null, error: p.error || null };
    return null;
  }

  function connect(s) {
    if (conns.has(s.ref)) return conns.get(s.ref);
    const c = { ref: s.ref, nick: 'TD-check-' + crypto.randomBytes(2).toString('hex'), names: new Map(), sock: null, rx: Buffer.alloc(0), error: null, closed: false };
    conns.set(s.ref, c);
    const co = o.connOpts(s);
    const close = (why) => {
      if (c.closed) return;
      c.closed = true; conns.delete(s.ref);
      if (why) { c.error = why; log('verifier ' + s.ref + ': ' + why); for (const p of pending.values()) if (p.ref === s.ref && !p.done) p.error = why; }
      try { c.sock.destroy(); } catch (e) {}
    };
    c.close = close;
    const onMsg = (m) => {
      if (m.announceMessage) {
        const a = m.announceMessage, v = a.protocolVersion || {};
        if (a.serverType === 2) return close('a server with accounts: not for this check');
        c.sock.write(frame(build.init({ major: v.majorVersion, minor: v.minorVersion, nick: c.nick, login: LOGIN.unauthenticatedLogin, buildId: buildIdFor(o.version()) })));
      } else if (m.playerListMessage) {
        const id = Number(m.playerListMessage.playerId);
        if (m.playerListMessage.playerListNotification === 1) c.names.delete(id);
        else if (!c.names.has(id)) { c.names.set(id, null); c.sock.write(frame(build.playerInfo([id]))); }
      } else if (m.playerInfoReplyMessage) {
        const r = m.playerInfoReplyMessage;
        if (r.playerInfoData) c.names.set(Number(r.playerId), String(r.playerInfoData.playerName || ''));
      } else if (m.chatMessage) {
        const ch = m.chatMessage, id = Number(ch.playerId);
        if (ch.chatType !== 0 && ch.chatType !== 4) return;
        const text = String(ch.chatText || '').toUpperCase();
        const name = c.names.get(id);
        if (!name) { c.sock.write(frame(build.playerInfo([id]))); c.later = (c.later || []).concat([{ id, text }]); return; }
        check(c, id, name, text);
      } else if (m.timeoutWarningMessage) {
        c.sock.write(frame(build.resetTimeout()));
      } else if (m.errorMessage) {
        close('login refused (' + (pb.ErrorMessage.ErrorReason[m.errorMessage.errorReason] || m.errorMessage.errorReason) + ')');
      }
      // A line that came before its sender's name: checked once the name is known.
      if (m.playerInfoReplyMessage && c.later && c.later.length) {
        const id = Number(m.playerInfoReplyMessage.playerId), name = c.names.get(id);
        const mine = c.later.filter((x) => x.id === id); c.later = c.later.filter((x) => x.id !== id);
        for (const x of mine) check(c, id, name, x.text);
      }
    };
    try {
      const opts = { host: co.host, port: co.port };
      const pins = co.pins || [];
      if (o.connect) c.sock = o.connect(opts);
      else if (co.tls) {
        c.sock = tls.connect(Object.assign({}, opts, { servername: co.servername || (/^[0-9.:]+$/.test(co.host) ? undefined : co.host), rejectUnauthorized: pins.length ? false : !co.insecure }),
          () => { if (pins.length && pins.indexOf(spkiPin(c.sock)) < 0) close('tls pin mismatch'); });
      } else c.sock = net.connect(opts);
      c.sock.on('data', (chunk) => {
        c.rx = Buffer.concat([c.rx, chunk]);
        while (c.rx.length >= 4) {
          const len = c.rx.readUInt32BE(0);
          if (len > 2000000) return close('frame too big');
          if (c.rx.length < 4 + len) break;
          const body = c.rx.subarray(4, 4 + len); c.rx = c.rx.subarray(4 + len);
          let m; try { m = pb.PokerTHMessage.decode(body); } catch (e) { continue; }
          onMsg(m);
        }
      });
      c.sock.on('error', (e) => close((e && e.code) || 'error'));
      c.sock.on('close', () => close(''));
    } catch (e) { close(e.message); }
    return c;
  }
  function check(c, id, name, text) {
    for (const p of pending.values()) {
      if (p.done || p.ref !== c.ref || p.expires <= now()) continue;
      if (text.indexOf(p.code) < 0) continue;
      if (low(name) !== low(p.nick)) continue;   // the code from someone else: nothing
      p.done = true;
      log('verifier: ' + p.nick + ' proved on ' + p.serverName);
      try { o.onVerified(p); } catch (e) {}
      try { c.sock.write(chatPm(id, 'thank you ' + name + ': your nickname is verified on this site\'s tournaments.')); } catch (e) {}
    }
  }
  // Every few seconds: codes that ran out go, connections nobody waits on close.
  function tick() {
    const t = now();
    for (const [code, p] of pending) if (p.expires <= t || (p.done && p.expires - CODE_MS + 60000 <= t)) pending.delete(code);
    for (const [ref, c] of conns) if (![...pending.values()].some((p) => p.ref === ref && !p.done)) c.close('');
  }
  const timer = setInterval(tick, o.tickMs || 5000);
  if (timer.unref) timer.unref();
  function stop() { clearInterval(timer); for (const c of conns.values()) c.close(''); pending.clear(); }
  return { request, status, tick, stop, pendingCount: () => pending.size };
}
