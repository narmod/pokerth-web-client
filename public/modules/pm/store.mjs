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
//   setOwner(name)          ↔ setPrivateMessageOwner
//
// Scope: the history belongs to ONE ACCOUNT (the nickname of the logged-in
// player), exactly as upstream since commit 9bccf3a ("pm dialog persistence
// fine-tuning"): the SQLite tables gained an `owner` column there, and the
// inbox is empty until a login tells whose history applies. This replaces
// the earlier browser-global scope (decision narmod 26/08, taken when the
// desktop database was still single-inbox): two accounts used from the same
// browser no longer see each other's private conversations.
//
// Migration mirrors upstream too: rows written before the account split
// carry owner '' and are adopted by the FIRST account that logs in
// afterwards — that is the player who wrote them. After that, no ownerless
// row remains.
//
// Retention: none. The desktop client keeps everything and only offers a
// manual "delete conversation"; we do the same. remove() is the only path
// that ever drops data.
//
// Degradation: without IndexedDB (private mode on some browsers, very old
// engines) every call resolves against an in-memory fallback, still keyed
// per owner. Messages of the running session still work; nothing is
// persisted. No call ever rejects — the caller must never have to guard
// the store.
// ═══════════════════════════════════════════════════════════════════

const DB_NAME    = 'pth_pm';
const DB_VERSION = 2;        // v2: owner column (parity upstream 9bccf3a)
const ST_CONV    = 'conv';   // keyPath ['owner','name'] — one row per account+partner
const ST_MSG     = 'msg';    // keyPath 'id' (auto) — index ['owner','name']
const IX_MSG     = 'owner_name';

// Account whose inbox is loaded (own nickname). Empty while nobody is
// logged in — the inbox then stays empty and nothing is persisted
// (parity: m_privateMessagesOwner).
let _owner = '';

// Per-owner in-memory mirrors. The current owner's mirror is what the UI
// renders from; keeping the others around lets the IndexedDB-less fallback
// survive an account switch within the session.
const _memAll = Object.create(null);
function _memFor(owner) {
  return _memAll[owner] || (_memAll[owner] = {
    conv: Object.create(null), msg: Object.create(null)
  });
}
let _mem = _memFor('');
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
    req.onupgradeneeded = function (ev) {
      const db = req.result;
      const tx = req.transaction;
      const oldV = ev.oldVersion || 0;
      if (oldV < 1) {
        // Fresh database: create the v2 shape straight away.
        db.createObjectStore(ST_CONV, { keyPath: ['owner', 'name'] });
        const s = db.createObjectStore(ST_MSG, { keyPath: 'id', autoIncrement: true });
        s.createIndex(IX_MSG, ['owner', 'name'], { unique: false });
        return;
      }
      if (oldV < 2) {
        // v1 → v2 (parity: the ALTER TABLE / pm_thread_v1 dance upstream).
        // conv had keyPath 'name' — a composite primary key needs a new
        // store, so read the rows, drop it, recreate, reinsert ownerless.
        const cReq = tx.objectStore(ST_CONV).getAll();
        cReq.onsuccess = function () {
          const rows = cReq.result || [];
          db.deleteObjectStore(ST_CONV);
          const s = db.createObjectStore(ST_CONV, { keyPath: ['owner', 'name'] });
          rows.forEach(function (r) {
            if (r && r.name) s.put({ owner: '', name: r.name,
                                     unread: r.unread || 0, last: r.last || 0 });
          });
        };
        // msg keeps its primary key; the rows just gain owner ''. The
        // composite index only picks a row up once the field exists, so
        // rewrite them all under the fresh index.
        const ms = tx.objectStore(ST_MSG);
        try { ms.deleteIndex('name'); } catch (e) {}
        ms.createIndex(IX_MSG, ['owner', 'name'], { unique: false });
        const mCur = ms.openCursor();
        mCur.onsuccess = function () {
          const cur = mCur.result;
          if (!cur) return;
          const v = cur.value;
          if (typeof v.owner !== 'string') { v.owner = ''; cur.update(v); }
          cur.continue();
        };
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

// Open the database. Nothing is read here: whose history applies is only
// known at login — setOwner() then loads it (parity: setConfig no longer
// calls loadPrivateMessages upstream, it just opens the file).
function ready() {
  if (_ready) return _ready;
  _ready = _open().then(function (db) {
    _db = db;
    return !!db;
  }).catch(function () { _broken = true; return false; });
  return _ready;
}

// Read the current owner's rows from the database into their mirror.
// Private message volume is small (text only, one server, human typing
// speed), so a full read is cheaper than paging on every panel open.
function _loadOwner(owner) {
  return ready().then(function (ok) {
    if (!ok || !owner) return false;
    const mem = _memFor(owner);
    mem.conv = Object.create(null);
    mem.msg  = Object.create(null);
    return new Promise(function (resolve) {
      let tx;
      try { tx = _db.transaction([ST_CONV, ST_MSG], 'readonly'); }
      catch (e) { resolve(false); return; }
      let left = 2;
      const done = function () { if (--left === 0) resolve(true); };
      const cReq = tx.objectStore(ST_CONV).getAll();
      cReq.onsuccess = function () {
        (cReq.result || []).forEach(function (c) {
          if (c.owner === owner) mem.conv[c.name] = c;
        });
        done();
      };
      cReq.onerror = done;
      let mReq;
      try { mReq = tx.objectStore(ST_MSG).index(IX_MSG).openCursor(); }
      catch (e) { done(); done(); return; }
      mReq.onsuccess = function () {
        const cur = mReq.result;
        if (!cur) { done(); return; }
        const m = cur.value;
        if (m.owner === owner)
          (mem.msg[m.name] || (mem.msg[m.name] = [])).push(m);
        cur.continue();
      };
      mReq.onerror = done;
    }).then(function (ok2) {
      Object.keys(mem.msg).forEach(function (k) {
        mem.msg[k].sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
      });
      return ok2;
    });
  });
}

// History from before the account split (owner '') belongs to whoever logs
// in first — that is the player who wrote it. After this, no ownerless row
// remains (parity: the adopt UPDATE in loadPrivateMessages upstream).
function _adopt(owner) {
  return ready().then(function (ok) {
    if (!ok || !owner) return false;
    return _tx('readwrite', [ST_CONV, ST_MSG], function (tx) {
      const cs = tx.objectStore(ST_CONV);
      const cCur = cs.openCursor();
      cCur.onsuccess = function () {
        const cur = cCur.result;
        if (!cur) return;
        const v = cur.value;
        if (v.owner === '') {
          // put first (replaces a same-key row, like UPDATE OR REPLACE),
          // then drop the ownerless original.
          cs.put({ owner: owner, name: v.name, unread: v.unread || 0, last: v.last || 0 });
          cur.delete();
        }
        cur.continue();
      };
      const ms = tx.objectStore(ST_MSG);
      const mCur = ms.openCursor();
      mCur.onsuccess = function () {
        const cur = mCur.result;
        if (!cur) return;
        const v = cur.value;
        if (v.owner === '') { v.owner = owner; cur.update(v); }
        cur.continue();
      };
    });
  });
}

// ── Public API ─────────────────────────────────────────────────────────

// Switch the account the inbox belongs to (own nickname). Empty name =
// nobody logged in: the inbox is empty and nothing is stored (parity:
// setPrivateMessageOwner). Resolves once the new owner's history is in
// memory, so callers can re-render on it.
function setOwner(name) {
  const owner = String(name || '');
  if (owner === _owner) return Promise.resolve(false);
  _owner = owner;
  _mem = _memFor(owner);
  if (!owner) return Promise.resolve(true);
  return _adopt(owner).then(function () { return _loadOwner(owner); })
    .then(function () { _mem = _memFor(owner); return true; });
}

function owner() { return _owner; }

// One row per partner, most recently active first (parity: the QML
// partner list sorts on the last message timestamp).
function partners() {
  return Object.keys(_mem.conv).map(function (name) {
    const c = _mem.conv[name];
    // lastText / fromMe feed the one-line preview under each partner name
    // (parity: privateConversationPartners, which carries the same fields).
    const a = _mem.msg[name] || [];
    const m = a.length ? a[a.length - 1] : null;
    return { name: name, unread: c.unread || 0, last: c.last || 0,
             lastText: m ? m.text : '', fromMe: m ? !!m.mine : false };
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

// Drop conversation rows that carry no message at all. Opening a dialogue
// with somebody used to write an empty row straight away, so every player
// whose envelope was ever clicked stayed in the partner list for good --
// including players long gone from the lobby. A conversation now only comes
// into existence when a message is actually exchanged (append), and this
// clears out what earlier versions left behind. Scoped to the current
// owner: another account's rows are not this login's to judge.
function prune() {
  if (!_owner) return Promise.resolve(0);
  const own = _owner, mem = _mem;
  const dead = Object.keys(mem.conv).filter(function (k) {
    const a = mem.msg[k];
    return !a || !a.length;
  });
  if (!dead.length) return Promise.resolve(0);
  dead.forEach(function (k) { delete mem.conv[k]; });
  return ready().then(function () {
    return _tx('readwrite', [ST_CONV], function (tx) {
      const st = tx.objectStore(ST_CONV);
      dead.forEach(function (k) { st.delete([own, k]); });
    });
  }).then(function () { return dead.length; });
}

// Append one message. `mine` marks our own outgoing text: the server never
// echoes private messages back to the sender, so the sent line only exists
// because we persist it here (parity: pushPrivateMessageSentLine).
// Incoming messages raise the unread counter; our own never do.
// Without a known owner (not logged in) nothing is stored: the history
// could not be attributed to an account (parity: persistPrivateMessage).
function append(name, text, mine) {
  if (!name || !text || !_owner) return Promise.resolve(false);
  const own = _owner;
  const ts  = Date.now();
  const rec = { owner: own, name: name, text: String(text), mine: !!mine, ts: ts };
  (_mem.msg[name] || (_mem.msg[name] = [])).push(rec);
  const c = _mem.conv[name]
    || (_mem.conv[name] = { owner: own, name: name, unread: 0, last: 0 });
  c.last = ts;
  if (!mine) c.unread = (c.unread || 0) + 1;
  return ready().then(function () {
    return _tx('readwrite', [ST_CONV, ST_MSG], function (tx) {
      tx.objectStore(ST_MSG).add({ owner: own, name: rec.name, text: rec.text,
                                   mine: rec.mine, ts: rec.ts });
      tx.objectStore(ST_CONV).put(c);
    });
  });
}

// Undo the last outgoing line of a conversation. The sent line is written
// optimistically (the server never echoes it back), so a message the server
// then refuses would otherwise sit in the history for ever as if it had been
// delivered. Only removes an outgoing message whose text matches, so a
// crossing incoming message can never be dropped by mistake.
function dropLast(name, text) {
  const a = _mem.msg[name];
  if (!a || !a.length || !_owner) return Promise.resolve(false);
  const own = _owner;
  let i = -1;
  for (let k = a.length - 1; k >= 0; k--) {
    if (a[k].mine && a[k].text === text) { i = k; break; }
  }
  if (i < 0) return Promise.resolve(false);
  const ts = a[i].ts;
  a.splice(i, 1);
  const c = _mem.conv[name];
  if (c) c.last = a.length ? a[a.length - 1].ts : c.last;
  return ready().then(function () {
    return _tx('readwrite', [ST_CONV, ST_MSG], function (tx) {
      const idx = tx.objectStore(ST_MSG).index(IX_MSG);
      const req = idx.openCursor(IDBKeyRange.only([own, name]));
      req.onsuccess = function () {
        const cur = req.result;
        if (!cur) return;
        const v = cur.value;
        if (v.mine && v.text === text && v.ts === ts) { cur.delete(); return; }
        cur.continue();
      };
      if (c) tx.objectStore(ST_CONV).put(c);
    });
  });
}

function markRead(name) {
  const c = _mem.conv[name];
  if (!c || !c.unread || !_owner) return Promise.resolve(false);
  c.unread = 0;
  return ready().then(function () {
    return _tx('readwrite', [ST_CONV], function (tx) { tx.objectStore(ST_CONV).put(c); });
  });
}

// The only destructive path (parity: deletePrivateConversation). Drops the
// partner row and every message exchanged with them — for THIS account
// only; the same partner's thread under another account is untouched.
function remove(name) {
  if (!name || !_owner) return Promise.resolve(false);
  const own = _owner;
  delete _mem.conv[name];
  delete _mem.msg[name];
  return ready().then(function () {
    return _tx('readwrite', [ST_CONV, ST_MSG], function (tx) {
      tx.objectStore(ST_CONV).delete([own, name]);
      const idx = tx.objectStore(ST_MSG).index(IX_MSG);
      const req = idx.openCursor(IDBKeyRange.only([own, name]));
      req.onsuccess = function () {
        const cur = req.result;
        if (!cur) return;
        cur.delete();
        cur.continue();
      };
    });
  });
}

// Sum over every conversation of the current account — feeds the header
// badge (parity: recountUnreadPrivateMessages / unreadPrivateMessages).
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

export { ready, setOwner, owner, partners, conversation, prune, append,
         dropLast, markRead, remove, unreadCount, unreadFor, isEphemeral };
