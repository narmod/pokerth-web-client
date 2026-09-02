// PokerTH web client — writes the full web backup to a local folder on its own,
// and offers to restore it at startup.
//
// The problem: browser storage (localStorage/IndexedDB) can be wiped between
// sessions (cleanup, eviction). Players then had to re-import their backup by
// hand before every connection. Here "pokerth-web-backup.json" is kept up to
// date automatically inside a folder picked ONCE (File System Access API, same
// mechanics as pdb-autosave: the handle is kept in IndexedDB and reused in
// later sessions). If storage looks blank at startup while a folder is
// remembered, a banner offers to restore everything in one click.
//
// Support: desktop Chrome / Edge / Opera. Everywhere else the module stays
// inert and the manual export/import (advanced options) remains the only path.
//
// File contents: exactly what the manual export produces — built by
// window._webBackupRecord (pokerth.js); restoring goes through
// window._applyWebBackupRec, the same path as the manual import (achievements
// merged, embedded config.xml, never credentials nor session data).
//
// Write cadence: a periodic check (60 s) — writing only when the contents
// actually changed (keys+xml signature, the export timestamp is ignored) —
// plus a forced flush when the tab closes or goes to the background.
//
// Advanced options: pth_bak_auto (ON by default; with no folder picked the
// module stays inert). No regression is possible: if this module is not
// loaded, the window._bakAuto* hooks are simply absent.

// ── Support & option ───────────────────────────────────────────────────────

function _supported() {
  return (typeof window !== 'undefined'
    && typeof window.showDirectoryPicker === 'function'
    && typeof window.indexedDB !== 'undefined');
}

// ON by default: nothing is written until the player has picked a folder (the
// browser API requires it). '0' = explicitly disabled.
function _enabled() {
  try {
    if (typeof localStorage === 'undefined') return true;
    if (localStorage.getItem('pth_bak_auto') === '0') return false;
    return true;
  } catch (_e) { return true; }
}

// ── "Blank storage" detection (at module load) ─────────────────────────────
// Modules run before the DOMContentLoaded handlers in pokerth.js: the identity
// keys below cannot have been written by the app itself yet. The inline theme
// boot (pokerth-client.html) writes pth_deck / pth_seat even on a first visit,
// hence a list of identity keys rather than a plain count of pth_* entries.
const _IDENTITY_KEYS = ['pth_nick', 'pth_auth_login', 'pth_avatar',
  'pth_avatar_img', 'pth_host', 'pth_offline_nick', 'pth_lan_nick',
  'pth_unauth_nick'];

function _looksFresh() {
  try {
    if (typeof localStorage === 'undefined') return false;
    for (let i = 0; i < _IDENTITY_KEYS.length; i++) {
      if (localStorage.getItem(_IDENTITY_KEYS[i]) !== null) return false;
    }
    return true;
  } catch (_e) { return false; }
}

const _FRESH_AT_BOOT = _looksFresh();

// Write hold: when storage is blank AND a folder is remembered, the restore
// banner is offered. Until the player decides, NO write is allowed — otherwise
// the periodic writer (or the one 8 s after boot) would overwrite the backup
// file with an empty state, and restoring would then return nothing. The hold
// is released as soon as storage stops looking blank (the player typed a
// nickname / logged in), when a restore succeeded, or when the banner is
// dismissed.
let _hold = _FRESH_AT_BOOT;

// ── Folder handle persistence (IndexedDB) ──────────────────────────────────

const DB_NAME = 'pth_bakauto';
const DB_VERSION = 1;
const STORE = 'kv';
const KEY = 'dir';
const FILE_NAME = 'pokerth-web-backup.json';

function _openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function _idb(mode, fn) {
  return _openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction([STORE], mode);
    const out = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(out && out.result !== undefined ? out.result : out);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  }));
}

function _saveHandle(h) { return _idb('readwrite', (st) => st.put(h, KEY)); }
function _readHandle() { return _idb('readonly', (st) => st.get(KEY)); }

// ── Current state (for the advanced-options UI) ────────────────────────────

const _state = {
  dirName: null,      // name of the picked folder
  needPerm: false,    // handle present but permission must be granted again
  lastAt: 0,          // timestamp of the last successful write
  err: null,          // last error (short name)
};

let _handle = null;
let _handleLoaded = false;

async function _getHandle() {
  if (_handle) return _handle;
  if (_handleLoaded) return null;
  _handleLoaded = true;
  try {
    const h = await _readHandle();
    if (h) { _handle = h; _state.dirName = h.name || null; }
  } catch (_e) { /* no handle remembered */ }
  return _handle;
}

// interactive=true → may open the browser permission prompt (requires a user
// gesture); false → query only, never a popup.
async function _ensurePerm(h, interactive) {
  try {
    if (typeof h.queryPermission !== 'function') return true;
    const opts = { mode: 'readwrite' };
    let st = await h.queryPermission(opts);
    if (st === 'granted') { _state.needPerm = false; return true; }
    if (interactive && typeof h.requestPermission === 'function') {
      st = await h.requestPermission(opts);
      if (st === 'granted') { _state.needPerm = false; return true; }
    }
    _state.needPerm = true;
    return false;
  } catch (_e) { _state.needPerm = true; return false; }
}

// ── Writing ────────────────────────────────────────────────────────────────

// Signature of the meaningful contents: the keys and the embedded config.xml,
// but not the export timestamp (it changes on every build).
function _sigOf(rec) {
  try { return JSON.stringify([rec.keys, rec.xml || '']); } catch (_e) { return null; }
}

let _lastSig = null;

async function _openWritable(fh) {
  try {
    return await fh.createWritable({ keepExistingData: true, mode: 'exclusive' });
  } catch (_e) {
    return await fh.createWritable();
  }
}

async function _writeNow() {
  if (!_supported() || !_enabled()) return false;
  if (_hold && _looksFresh()) return false;   // restore decision still pending
  if (typeof window._webBackupRecord !== 'function') return false;

  const b = window._webBackupRecord();
  if (!b || !b.rec) return false;
  const sig = _sigOf(b.rec);
  if (sig !== null && sig === _lastSig) return false;   // nothing new

  const dir = await _getHandle();
  if (!dir) return false;
  if (!(await _ensurePerm(dir, false))) return false;

  const bytes = new TextEncoder().encode(JSON.stringify(b.rec));
  const fh = await dir.getFileHandle(FILE_NAME, { create: true });
  const w = await _openWritable(fh);
  await w.write({ type: 'write', position: 0, data: bytes });
  try { await w.truncate(bytes.length); } catch (_e) { /* standard mode: already truncated */ }
  await w.close();

  _lastSig = sig;
  _state.lastAt = Date.now();
  _state.err = null;
  return true;
}

// Serialisation: one write at a time; a request received during a write is
// replayed afterwards.
let _busy = false;
let _again = false;

async function save(_evt) {
  if (!_supported() || !_enabled()) return;
  if (_busy) { _again = true; return; }
  _busy = true;
  try {
    await _writeNow();
  } catch (e) {
    _state.err = (e && (e.name || e.message)) ? String(e.name || e.message) : 'error';
  } finally {
    _busy = false;
    _ui();
    if (_again) { _again = false; setTimeout(() => save('again'), 0); }
  }
}

// ── Folder picking (user gesture) ──────────────────────────────────────────

async function pickFolder() {
  if (!_supported()) return false;
  try {
    const h = await window.showDirectoryPicker({ id: 'pokerth-backup', mode: 'readwrite' });
    if (!h) return false;
    if (!(await _ensurePerm(h, true))) { _ui(); return false; }
    _handle = h;
    _handleLoaded = true;
    _state.dirName = h.name || null;
    _state.err = null;
    try { await _saveHandle(h); } catch (_e) { /* the handle stays valid for this session */ }
    _ui();
    // Picking a folder IS the pending banner decision: release the write
    // hold, otherwise the first write below would be refused on a
    // brand-new browser while the banner is still up.
    _hold = false;
    // Immediate first write: the player sees the file appear.
    save('pick');
    return true;
  } catch (e) {
    if (!(e && e.name === 'AbortError')) {
      _state.err = (e && (e.name || e.message)) ? String(e.name || e.message) : 'error';
      _ui();
    }
    return false;
  }
}

// ── Restoring (startup banner) ─────────────────────────────────────────────

function _t(key, fallback) {
  try {
    if (typeof window.t === 'function') {
      const v = window.t(key);
      if (v && v !== key) return v;
    }
  } catch (_e) {}
  return fallback;
}

function _toast(msg, opts) {
  try { if (typeof window.showToast === 'function') window.showToast(msg, opts); } catch (_e) {}
}

// Returns a CODE, never a boolean: the banner has to be able to tell the player
// WHY it did not work. Historically the only error feedback was a toast — but
// .app-toast sits at z-index 950 / bottom 28px, so it rendered BEHIND the
// banner (z-index 99999, bottom 18px): the failure was invisible and the click
// looked like it did nothing.
//   'ok' · 'nofolder' · 'noperm' · 'nofile' · 'bad' · 'empty'
async function _restoreFromFolder() {
  // _handle first: an IndexedDB round trip would burn the user activation that
  // requestPermission() needs.
  const dir = _handle || (await _getHandle());
  if (!dir) return 'nofolder';
  // User gesture (click on the banner): the interactive permission prompt is
  // allowed here.
  if (!(await _ensurePerm(dir, true))) return 'noperm';
  let file;
  try {
    const fh = await dir.getFileHandle(FILE_NAME);    // no create: missing → throw
    file = await fh.getFile();
  } catch (_e) { return 'nofile'; }
  let rec = null;
  try { rec = JSON.parse(await file.text()); } catch (_e) { return 'bad'; }
  if (typeof window._applyWebBackupRec !== 'function') return 'bad';
  const n = window._applyWebBackupRec(rec);
  if (n < 0) return 'bad';
  // 0 keys written: the file parses but holds nothing useful. Reloading would
  // land on an identical screen — exactly the "nothing happens" impression.
  // Say so instead of reloading.
  if (n === 0) return 'empty';
  _hold = false;
  _toast((_t('backupImported', 'Backup imported')) + ' (' + n + ')');
  // Reload: applies theme, language, options — same purpose as the reload
  // prompt of the manual import, without asking since the player just asked
  // for the restore.
  setTimeout(() => { try { location.reload(); } catch (_e) {} }, 800);
  return 'ok';
}

// Banner fallback path: pick the folder again, then restore straight away.
// Deliberately SEPARATE from pickFolder() — that one writes the file
// immediately (save('pick')), which would overwrite the backup with the blank
// state being restored from. This path only reads.
async function pickForRestore() {
  if (!_supported()) return 'nofolder';
  let h;
  try {
    h = await window.showDirectoryPicker({ id: 'pokerth-backup', mode: 'readwrite' });
  } catch (e) {
    if (e && e.name === 'AbortError') return 'abort';
    return 'bad';
  }
  if (!h) return 'abort';
  if (!(await _ensurePerm(h, true))) return 'noperm';
  _handle = h;
  _handleLoaded = true;
  _state.dirName = h.name || null;
  _state.err = null;
  try { await _saveHandle(h); } catch (_e) { /* the handle stays valid for this session */ }
  _ui();
  return _restoreFromFolder();
}

// Banner "Create a backup" path: pick a folder and write the first backup
// right away — but never overwrite an existing backup file with the blank
// state the banner was shown for. Deliberately SEPARATE from pickFolder()
// (advanced-options button), which writes unconditionally.
async function _pickForCreate() {
  if (!_supported()) return 'bad';
  let h;
  try {
    h = await window.showDirectoryPicker({ id: 'pokerth-backup', mode: 'readwrite' });
  } catch (e) {
    if (e && e.name === 'AbortError') return 'abort';
    return 'bad';
  }
  if (!h) return 'abort';
  if (!(await _ensurePerm(h, true))) return 'noperm';
  // A backup already there: refuse — the player probably wants Restore.
  let exists = true;
  try { await h.getFileHandle(FILE_NAME); } catch (_e) { exists = false; }
  if (exists) return 'exists';
  _handle = h;
  _handleLoaded = true;
  _state.dirName = h.name || null;
  _state.err = null;
  try { await _saveHandle(h); } catch (_e) { /* the handle stays valid for this session */ }
  // The player chose to start fresh: release the write hold, then write the
  // first backup immediately so the file appears.
  _hold = false;
  _ui();
  save('pick');
  return 'ok';
}

// Message shown for each failure code, INSIDE the banner (a toast would be
// hidden behind it).
const _WHY = {
  nofolder: ['bakRestoreNoFile', 'No backup file in this folder.'],
  nofile:   ['bakRestoreNoFile', 'No backup file in this folder.'],
  noperm:   ['bakRestoreNoPerm', 'Folder access was not granted — pick the folder again.'],
  empty:    ['bakRestoreEmpty', 'The backup file is empty — nothing to restore.'],
  exists:   ['bakBannerExists', 'A backup file already exists in this folder — use Restore.'],
  bad:      ['backupImportErr', 'Import failed'],
};

function _showRestoreBanner() {
  try {
    if (document.getElementById('bak-restore-banner')) return;
    const el = document.createElement('div');
    el.id = 'bak-restore-banner';
    el.setAttribute('role', 'alertdialog');
    el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:18px;' +
      'z-index:99999;background:#1c2733;color:#fff;padding:12px 14px;border-radius:10px;' +
      'box-shadow:0 4px 18px rgba(0,0,0,.45);max-width:min(92vw,620px);font-size:14px;line-height:1.35';

    // Header row: icon, text column, dismiss cross.
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;gap:10px;align-items:flex-start';
    const ico = document.createElement('span');
    ico.setAttribute('aria-hidden', 'true');
    ico.style.cssText = 'flex:0 0 auto;margin-top:1px;line-height:0';
    // stroke= takes a literal color: SVG attributes do not resolve CSS var().
    ico.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M6 4h10l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>' +
      '<path d="M14 4v4H9V4"/><path d="M8 20v-6h8v6"/></svg>';

    // Text column: title, explanation, then the target path (folder / file) —
    // without it the player cannot tell what folder the banner is talking
    // about — then the status line, empty until something happens.
    const col = document.createElement('div');
    col.style.cssText = 'flex:1 1 240px;min-width:0';
    const txt = document.createElement('div');
    txt.style.cssText = 'font-weight:600';
    txt.textContent = _t('bakBannerTitle', 'Local backup of your settings');
    const body = document.createElement('div');
    body.style.cssText = 'color:#cfe0ef;font-size:13px;margin-top:2px';
    body.textContent = _t('bakBannerBody', 'This browser can save your settings to a folder of your choice, or restore them from an existing backup.');
    const sub = document.createElement('div');
    sub.style.cssText = 'color:#9fb0c0;font-size:12px;margin-top:2px;word-break:break-all';
    sub.textContent = (_state.dirName ? _state.dirName + ' / ' : '') + FILE_NAME;
    const msg = document.createElement('div');
    msg.style.cssText = 'font-size:12px;margin-top:4px;display:none';
    col.appendChild(txt); col.appendChild(body); col.appendChild(sub); col.appendChild(msg);

    const no = document.createElement('button');
    no.type = 'button';
    no.setAttribute('aria-label', 'Dismiss');
    no.textContent = '\u2715';
    no.style.cssText = 'background:transparent;color:#9fb0c0;border:0;font-size:15px;' +
      'cursor:pointer;padding:4px 6px;flex:0 0 auto';
    head.appendChild(ico); head.appendChild(col); head.appendChild(no);

    // Action row: create (filled), restore (outline), later (text).
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;' +
      'margin-top:10px;padding-left:28px';
    const bCreate = document.createElement('button');
    bCreate.type = 'button';
    bCreate.textContent = _t('bakBannerCreate', 'Create a backup');
    bCreate.style.cssText = 'background:#2e7d32;color:#fff;border:0;border-radius:8px;' +
      'padding:6px 12px;font-size:14px;cursor:pointer;white-space:nowrap';
    const bRestore = document.createElement('button');
    bRestore.type = 'button';
    bRestore.textContent = _t('bakBannerRestore', 'Restore a backup');
    bRestore.style.cssText = 'background:transparent;color:#cfe0ef;border:1px solid #3d5061;' +
      'border-radius:8px;padding:6px 12px;font-size:14px;cursor:pointer;white-space:nowrap';
    const bLater = document.createElement('button');
    bLater.type = 'button';
    bLater.textContent = _t('bakBannerLater', 'Later');
    bLater.style.cssText = 'background:transparent;color:#9fb0c0;border:0;' +
      'padding:6px 8px;font-size:14px;cursor:pointer;white-space:nowrap';
    row.appendChild(bCreate); row.appendChild(bRestore); row.appendChild(bLater);

    function setMsg(text, isErr) {
      msg.textContent = text || '';
      msg.style.color = isErr ? '#ff8a65' : '#9fb0c0';
      msg.style.display = text ? '' : 'none';
    }
    function setSub() {
      sub.textContent = (_state.dirName ? _state.dirName + ' / ' : '') + FILE_NAME;
    }

    let busy = false;
    function run(fn, busyText, onOk) {
      if (busy) return;
      busy = true; bCreate.disabled = true; bRestore.disabled = true;
      setMsg(busyText || '', false);
      // fn() is called in the click's own tick: showDirectoryPicker() and
      // requestPermission() require a fresh user activation.
      let p;
      try { p = fn(); } catch (e) { p = Promise.reject(e); }
      Promise.resolve(p).then((why) => {
        if (why === 'ok') { onOk(); return; }
        busy = false; bCreate.disabled = false; bRestore.disabled = false;
        setSub();
        if (why === 'abort') { setMsg('', false); return; }
        const k = _WHY[why] || _WHY.bad;
        setMsg(_t(k[0], k[1]), true);
      }).catch((e) => {
        busy = false; bCreate.disabled = false; bRestore.disabled = false;
        const d = (e && (e.name || e.message)) ? String(e.name || e.message) : '';
        setMsg(_t('backupImportErr', 'Import failed') + (d ? ' — ' + d : ''), true);
      });
    }

    // Restore tries the remembered folder first; after a folder-shaped
    // failure (gone, denied, no file) the next click opens the picker.
    let pickNext = !_state.dirName;   // no folder remembered: picker first
    async function doRestore() {
      const why = await (pickNext ? pickForRestore() : _restoreFromFolder());
      if (why === 'nofolder' || why === 'noperm' || why === 'nofile') pickNext = true;
      return why;
    }

    bCreate.addEventListener('click', () => run(_pickForCreate, '', () => {
      _toast(_t('bakBannerCreated', 'Backup created.'));
      try { el.remove(); } catch (_e) {}
    }));
    bRestore.addEventListener('click', () => run(doRestore, _t('bakRestoreBusy', 'Restoring…'), () => {
      setMsg(_t('backupImported', 'Backup imported'), false);
    }));
    // Explicit dismissal: the player starts fresh, automatic writing may
    // resume.
    function dismiss() { _hold = false; try { el.remove(); } catch (_e) {} }
    bLater.addEventListener('click', dismiss);
    no.addEventListener('click', dismiss);

    el.appendChild(head); el.appendChild(row);
    document.body.appendChild(el);
  } catch (_e) {}
}

// Read-only view of the write hold (deterministic tests).
function _holdState() { return _hold; }

function _maybeOfferRestore() {
  if (!_supported() || !_enabled() || !_FRESH_AT_BOOT) { _hold = false; return; }
  // Since 2.1.8-web.10 the banner also shows when NO folder is remembered
  // (brand-new browser): the player learns a local backup exists. Create
  // picks a folder; Restore goes straight to the picker (pickNext starts
  // true without a folder). _getHandle() already ran at _ready(), so
  // _state.dirName is populated before the banner renders.
  _showRestoreBanner();
}

// ── UI (advanced-options panel) ────────────────────────────────────────────

function _ui() {
  try {
    const btn = document.getElementById('adv-bakauto-pick');
    const st = document.getElementById('adv-bakauto-status');
    if (!btn && !st) return;

    if (!_supported()) {
      if (btn) btn.style.display = 'none';
      if (st) st.textContent = _t('advPdbAutoNoFs', 'This browser cannot write to a local folder.');
      const cb = document.getElementById('adv-bakauto');
      if (cb) cb.disabled = true;
      return;
    }
    if (btn) btn.style.display = '';
    if (st) {
      let txt = '';
      if (_state.dirName) {
        txt = _t('advPdbAutoFolder', 'Folder') + ' : ' + _state.dirName;
        if (_state.needPerm) txt += ' — ' + _t('advPdbAutoPick', 'Choose folder…');
        else if (_state.lastAt) txt += ' · ' + FILE_NAME;
      }
      if (_state.err) txt = (txt ? txt + ' — ' : '') + _state.err;
      st.textContent = txt;
    }
  } catch (_e) {}
}

// ── Startup ────────────────────────────────────────────────────────────────

const TICK_MS = 60000;

function _ready() {
  if (!_supported()) return;
  _getHandle().then(() => { _ui(); _maybeOfferRestore(); }).catch(() => {});
  try { setInterval(() => save('tick'), TICK_MS); } catch (_e) {}
  // First write shortly after load: covers changes made server-side while the
  // tab was closed (account sync) and establishes the reference signature.
  try { setTimeout(() => save('boot'), 8000); } catch (_e) {}
}

// Forced flush when the page goes away: pagehide is the only reliable event on
// mobile; visibilitychange covers going to the background.
function _installFlush() {
  if (!_supported()) return;
  try {
    window.addEventListener('pagehide', () => { save('flush'); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') save('flush');
    });
  } catch (_e) {}
}

if (typeof window !== 'undefined') {
  window._bakAutoSave = save;         // on-demand write (optional)
  window._bakAutoPick = pickFolder;   // "Choose folder…" button
  window._bakAutoUi = _ui;            // refresh when the panel is opened
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { _ready(); });
  } else {
    _ready();
  }
  _installFlush();
}

// ESM exports: for the deterministic tests only. In the browser the module
// talks through window.* exclusively.
export { save, pickFolder, pickForRestore, _supported, _enabled, _looksFresh, _sigOf, _writeNow, _state, _holdState };
