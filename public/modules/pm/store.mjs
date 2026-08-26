// ═══════════════════════════════════════════════════════════════════
// Private messages — persistent store (IndexedDB).
//
// Parity with the QML client (LobbyHandler, PokerTH 2.1.7+): the desktop
// client keeps every private message in a SQLite database next to the
// config, so a conversation survives a restart. A browser has no SQLite,
// so the same data model lives in IndexedDB here.
//
// API mirrors the Q_INVOKABLE surface exposed to QML one for one:
//   partners()              ↔ privateConversationPartners
//   conversation(name)      ↔ privateConversation
//   ensure(name)            ↔ ensurePrivateConversation
//   markRead(name)          ↔ markPrivateConversationRead
//   remove(name)            ↔ deletePrivateConversation
//   unreadCount()           ↔ unreadPrivateMessages
//   append(name, text, mine) ↔ appendPrivateMessage / persistPrivateMessage
//
// Scope: the store is GLOBAL to the browser profile, not per account
// (decision narmod 26/08). Two accounts used from the same browser share
// the history, exactly as two profiles sharing one desktop config would.
//
// Retention: none. The desktop client keeps everything and only offers a
// manual "delete conversation"; we do the same. remove() is the only path
// that ever drops data.
//
// Degradation: without IndexedDB (private mode on some browsers, very old
// engines) every call resolves against an in-memory fallback. Messages of
// the running session still work; nothing is persisted. No call ever
// rejects — the caller must never have to guard the store.
// ═══════════════════════════════════════════════════════════════════

const DB_NAME    = 'pth_pm';
const DB_VERSION = 1;
const ST_CONV    = 'conv';   // keyPath 'name'  — one row per partner
const ST_MSG     = 'msg';    // keyPath 'id' (auto) — index 'name'

// In-memory mirror. Always kept in sync so the UI can render without
// awaiting IndexedDB on every keystroke, and so the module still works
// when IndexedDB is unavailable.
const _mem = { conv: Object.create(null), msg: Object.create(null) };
let _db = null;
let _ready = null;
let _broken = false;

// ── Low level ──────────────────────────────────────────────────────────

function _open() {
  return new Promise(function (resolve) {
    if (typeof indexedDB === 'undefined') { _broken = true; resolve(null); return; }
    let req;
    try { req = indexedDB.open(DB_NAME, DB_VERSION); }
    catch (e) { _broken = true; resolve(null); return; }
    req.onupgradeneeded = function () {
      const db = req.result;
      if (!db.objectStoreNames.contains(ST_CONV)) db.createObjectStore(ST_CONV, { keyPath: 'name' });
      if (!db.objectStoreNames.contains(ST_MSG)) {
        const s = db.createObjectStore(ST_MSG, { keyPath: 'id', autoIncrement: true });
        s.createIndex('name', 'name', { unique: false });
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror   = function () { _broken = true; resolve(null); };
    req.onblocked = function () { _broken = true; resolve(null); };
  });
}

function _tx(mode, stores, fn) {
  // Runs fn(tx) and resolves when the transaction completes. Any failure is
  // swallowed: a broken store must degrade to "not persisted", never throw
  // into the chat path.
  return new Promise(function (resolve) {
    if (!_db) { resolve(false); return; }
    let tx;
    try { tx = _db.transaction(stores, mode); }
    catch (e) { resolve(false); return; }
    tx.oncomplete = function () { resolve(true); };
    tx.onerror    = function () { resolve(false); };
    tx.onabort    = function () { resolve(false); };
    try { fn(tx); } catch (e) { try { tx.abort(); } catch (e2) {} resolve(false); }
  });
}

// Load everything into the memory mirror once, at startup. Private message
// volume is small (text only, one server, human typing speed), so a full
// read is cheaper than paging on every panel open.
function ready() {
  if (_ready) return _ready;
  _ready = _open().then(function (db) {
    _db = db;
    if (!db) return false;
    return new Promise(function (resolve) {
      let left = 2;
      const done = function () { if (--left === 0) resolve(true); };
      let tx;
      try { tx = db.transaction([ST_CONV, ST_MSG], 'readonly'); }
      catch (e) { resolve(false); return; }
      const cReq = tx.objectStore(ST_CONV).getAll();
      cReq.onsuccess = function () {
        (cReq.result || []).forEach(function (c) { _mem.conv[c.name] = c; });
        done();
      };
      cReq.onerror = done;
      const mReq = tx.objectStore(ST_MSG).getAll();
      mReq.onsuccess = function () {
        (mReq.result || []).forEach(function (m) {
          (_mem.msg[m.name] || (_mem.msg[m.name] = [])).push(m);
        });
        Object.keys(_mem.msg).forEach(function (k) {
          _mem.msg[k].sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
        });
        done();
      };
      mReq.onerror = done;
    });
  }).catch(function () { _broken = true; return false; });
  return _ready;
}

// ── Public API ─────────────────────────────────────────────────────────

// One row per partner, most recently active first (parity: the QML
// partner list sorts on the last message timestamp).
function partners() {
  return Object.keys(_mem.conv).map(function (name) {
    const c = _mem.conv[name];
    return { name: name, unread: c.unread || 0, last: c.last || 0 };
  }).sort(function (a, b) {
    if (b.last !== a.last) return b.last - a.last;
    return a.name.localeCompare(b.name);
  });
}

// Full history with one partner, oldest first. Returns a copy: callers
// render from it and must not be able to corrupt the mirror.
function conversation(name) {
  const a = _mem.msg[name] || [];
  return a.map(function (m) { return { text: m.text, mine: !!m.mine, ts: m.ts }; });
}

// Create an empty conversation so it shows up in the partner list before
// a single message has been exchanged (parity: ensurePrivateConversation,
// called when the user opens a dialogue from the player list).
function ensure(name) {
  if (!name) return Promise.resolve(false);
  if (!_mem.conv[name]) _mem.conv[name] = { name: name, unread: 0, last: Date.now() };
  const row = _mem.conv[name];
  return ready().then(function () {
    return _tx('readwrite', [ST_CONV], function (tx) { tx.objectStore(ST_CONV).put(row); });
  });
}

// Append one message. `mine` marks our own outgoing text: the server never
// echoes private messages back to the sender, so the sent line only exists
// because we persist it here (parity: pushPrivateMessageSentLine).
// Incoming messages raise the unread counter; our own never do.
function append(name, text, mine) {
  if (!name || !text) return Promise.resolve(false);
  const ts  = Date.now();
  const rec = { name: name, text: String(text), mine: !!mine, ts: ts };
  (_mem.msg[name] || (_mem.msg[name] = [])).push(rec);
  const c = _mem.conv[name] || (_mem.conv[name] = { name: name, unread: 0, last: 0 });
  c.last = ts;
  if (!mine) c.unread = (c.unread || 0) + 1;
  return ready().then(function () {
    return _tx('readwrite', [ST_CONV, ST_MSG], function (tx) {
      tx.objectStore(ST_MSG).add({ name: rec.name, text: rec.text, mine: rec.mine, ts: rec.ts });
      tx.objectStore(ST_CONV).put(c);
    });
  });
}

function markRead(name) {
  const c = _mem.conv[name];
  if (!c || !c.unread) return Promise.resolve(false);
  c.unread = 0;
  return ready().then(function () {
    return _tx('readwrite', [ST_CONV], function (tx) { tx.objectStore(ST_CONV).put(c); });
  });
}

// The only destructive path (parity: deletePrivateConversation). Drops the
// partner row and every message exchanged with them.
function remove(name) {
  if (!name) return Promise.resolve(false);
  delete _mem.conv[name];
  delete _mem.msg[name];
  return ready().then(function () {
    return _tx('readwrite', [ST_CONV, ST_MSG], function (tx) {
      tx.objectStore(ST_CONV).delete(name);
      const idx = tx.objectStore(ST_MSG).index('name');
      const req = idx.openCursor(IDBKeyRange.only(name));
      req.onsuccess = function () {
        const cur = req.result;
        if (!cur) return;
        cur.delete();
        cur.continue();
      };
    });
  });
}

// Sum over every conversation — feeds the header badge (parity:
// recountUnreadPrivateMessages / unreadPrivateMessages).
function unreadCount() {
  let n = 0;
  Object.keys(_mem.conv).forEach(function (k) { n += (_mem.conv[k].unread || 0); });
  return n;
}

function unreadFor(name) {
  const c = _mem.conv[name];
  return c ? (c.unread || 0) : 0;
}

// True when nothing is being written to disk, so the UI can say so rather
// than silently losing history at the next reload.
function isEphemeral() { return _broken || !_db; }

export { ready, partners, conversation, ensure, append, markRead, remove,
         unreadCount, unreadFor, isEphemeral };
