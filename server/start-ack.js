'use strict';
// ═══════════════════════════════════════════════════════════════════
// Start acknowledgement on behalf of a browser that cannot answer
// ═══════════════════════════════════════════════════════════════════
// When a table starts, the PokerTH server sends StartEvent to every seated
// player and waits for each StartEventAck, up to 20 s
// (SERVER_START_GAME_TIMEOUT_SEC, servergamestate.cpp). The web client answers
// at once (msg-game-join.mjs onStartEvent) — when it is there to read. Server
// log 26–28/11: 14 of the 17 « start timeout after 20 s, no start ACK » were web
// players, 9 of them on iOS, most gone a few seconds to two minutes later: the
// phone was asleep or the tab closed, the bridge kept the session in its grace,
// and the whole table waited 20 s. A native client minimized still answers.
//
// So the bridge answers for the browser:
//   · no browser attached (grace, or socket closed for overflow): at once;
//   · a browser attached but silent: after AUTO_ACK_DELAY_MS — a live page
//     answers in well under a second, a frozen one never does.
// The browser's own acknowledgement for that game, if it comes later (replayed
// StartEvent after a rebind), is then dropped: the server already counted
// one, and in the lobby state the same packet ends the session
// (ServerLobbyThread::HandlePacket → ERR_SOCK_INVALID_STATE). A delayed answer
// is cancelled once the game has started or we were removed from it: nothing
// to acknowledge any more, and an acknowledgement reaching the lobby would end
// the session.

const T_REMOVED_FROM_GAME = 29;
const T_START_EVENT = 36;
const T_START_EVENT_ACK = 37;
const T_GAME_START_INITIAL = 38;
const T_GAME_START_REJOIN = 39;
const AUTO_ACK_DELAY_MS = 3000;

function readVarint(buf, pos) {
  let r = 0, shift = 0, b;
  do {
    if (pos >= buf.length) return null;
    b = buf[pos++];
    r += (b & 0x7f) * Math.pow(2, shift);
    shift += 7;
  } while (b & 0x80 && shift < 35);
  return { v: r, pos };
}

// Top-level fields of a protobuf message: { field: [value…] }, varints as
// numbers, length-delimited as Buffers. Anything unexpected ends the walk.
function fields(buf) {
  const out = {};
  let pos = 0;
  while (pos < buf.length) {
    const tag = readVarint(buf, pos); if (!tag) break;
    pos = tag.pos;
    const fn = Math.floor(tag.v / 8), wt = tag.v % 8;
    let val;
    if (wt === 0) { const r = readVarint(buf, pos); if (!r) break; val = r.v; pos = r.pos; }
    else if (wt === 2) {
      const l = readVarint(buf, pos); if (!l || l.pos + l.v > buf.length) break;
      val = buf.subarray(l.pos, l.pos + l.v); pos = l.pos + l.v;
    } else if (wt === 1) { pos += 8; continue; }
    else if (wt === 5) { pos += 4; continue; }
    else break;
    (out[fn] || (out[fn] = [])).push(val);
  }
  return out;
}

function msgType(payload) {
  try { const f = fields(payload); return typeof (f[1] && f[1][0]) === 'number' ? f[1][0] : null; } catch (e) { return null; }
}

// gameId of a StartEvent (type 36, body in field 37) or StartEventAck (type
// 37, body in field 38) payload; null for any other message.
function gameIdOf(payload, type) {
  try {
    const f = fields(payload);
    if (!f[1] || f[1][0] !== type || !f[type + 1] || !Buffer.isBuffer(f[type + 1][0])) return null;
    const body = fields(f[type + 1][0]);
    return typeof (body[1] && body[1][0]) === 'number' ? body[1][0] : null;
  } catch (e) { return null; }
}

function varint(n) {
  const out = [];
  n = Math.floor(n);
  while (n >= 0x80) { out.push((n % 0x80) | 0x80); n = Math.floor(n / 0x80); }
  out.push(n);
  return out;
}

// Length-prefixed StartEventAck frame, as the client's MSG.buildStartEventAck
// writes it: { 1: 37, 38: { 1: gameId } }.
function ackFrame(gameId) {
  const body = [0x08].concat(varint(gameId));
  const payload = Buffer.from([0x08, T_START_EVENT_ACK].concat(varint((T_START_EVENT_ACK + 1) * 8 + 2), varint(body.length), body));
  const head = Buffer.alloc(4);
  head.writeUInt32BE(payload.length, 0);
  return Buffer.concat([head, payload]);
}

function cancel(st) {
  if (st.timer) clearTimeout(st.timer);
  st.timer = null; st.pending = 0;
}

// One bridge's state lives in `st` (created by the caller, one per upstream
// session). `write(frame)` sends to the game server and returns false when it
// cannot; `log(text)` is optional.
function onServerPayload(st, payload, browserLive, write, log) {
  const gid = gameIdOf(payload, T_START_EVENT);
  if (gid !== null) {
    cancel(st);
    const send = function (why) {
      st.timer = null; st.pending = 0;
      if (write(ackFrame(gid)) !== false) {
        st.done = gid;
        if (log) log('[start-ack] game ' + gid + ': acknowledged for the browser (' + why + ')');
      }
    };
    if (!browserLive) { send('no browser attached'); return; }
    st.pending = gid;
    const delay = st.delayMs || AUTO_ACK_DELAY_MS;   // st.delayMs: tests only
    st.timer = setTimeout(function () { if (st.pending === gid) send('no answer in ' + delay / 1000 + ' s'); }, delay);
    if (st.timer && st.timer.unref) st.timer.unref();
    return;
  }
  if (st.pending) {
    const t = msgType(payload);
    if (t === T_GAME_START_INITIAL || t === T_GAME_START_REJOIN || t === T_REMOVED_FROM_GAME) cancel(st);
  }
}

// A packet from the browser: true when it must be dropped (our own
// acknowledgement already went for that game).
function onBrowserPayload(st, payload) {
  const gid = gameIdOf(payload, T_START_EVENT_ACK);
  if (gid === null) return false;
  if (st.pending === gid) { cancel(st); return false; }
  if (st.done === gid) { st.done = 0; return true; }
  return false;
}

function dispose(st) { if (st) cancel(st); }

module.exports = { onServerPayload, onBrowserPayload, dispose, ackFrame, gameIdOf, msgType, AUTO_ACK_DELAY_MS,
  T_START_EVENT, T_START_EVENT_ACK };
