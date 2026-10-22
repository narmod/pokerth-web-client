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
// inert and the manual export/import (advanced options) remains the only path
// — except Firefox (web.31): there the Ace offers to PROTECT the settings
// instead (navigator.storage.persist(), asked on the player's click, after an
// explanation; Firefox then never evicts the site's data on its own). Same
// window._bakOffer hand-over, kind 'persist'; a button in Advanced options →
// Backup & reset does the same.
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
  // /live keeps nothing: no folder picker, no IndexedDB handle, no banner
  // offering to save settings a spectator never made. Gating _supported()
  // rather than the banner switches the whole feature off at the root.
  if (typeof window !== 'undefined' && window.LIVE_MODE) return false;
  return (typeof window !== 'undefined'
    && typeof window.showDirectoryPicker === 'function'
    && typeof window.indexedDB !== 'undefined');
}

// ON by default: nothing is written until the player has picked a folder (the
// browser API requires it). '0' = explicitly disabled.
function _enabled() {
  try {
    if (typeof localStorage === 'undefined') return true;
    // The admin switch (bak_auto) wins over the player's stored choice.
    if (typeof window !== 'undefined' && window._pthFeatureOff && window._pthFeatureOff.bak_auto) return false;
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

// Restore tries the remembered folder first; after a folder-shaped failure
// (gone, denied, no file) the next click opens the picker. Shared by the Ace's
// bubble and the banner. Called in the click's own tick: no await before the
// picker / permission prompt.
let _pickNext = true;
function _offerRestore() {
  let p;
  try { p = _pickNext ? pickForRestore() : _restoreFromFolder(); } catch (e) { p = Promise.reject(e); }
  return Promise.resolve(p).then((why) => {
    if (why === 'nofolder' || why === 'noperm' || why === 'nofile') _pickNext = true;
    return why;
  });
}

// ── The startup offer: carried by the Ace, the banner as a safety net ──────
// Since 2.1.10-web.20 the offer (Create / Restore / Later) is said by the Ace
// (modules/guide) in his bubble, even with his tips off: he claims it through
// window._bakOffer. The banner below only shows when he cannot: he did not
// claim it within CLAIM_MS (module not loaded, live embed…), or claimed it but
// could not show it within WATCH_MS, or he reports a failure (fallback()).
// Under automation the banner shows at once, as before: the browser tests
// close it like a player (same opt-in key as the guide's first-launch offer).
const CLAIM_MS = 3000;
const WATCH_MS = 30000;
let _offer = null;   // { claimed, shown, banner, done }

function _automated() {
  try { return !!navigator.webdriver && localStorage.getItem('pth_guide_webdriver') !== '1'; } catch (_e) { return false; }
}
function _later(fn, ms) {
  const id = setTimeout(fn, ms);
  try { if (id && typeof id.unref === 'function') id.unref(); } catch (_e) {}   // node tests: never hold the process
  return id;
}
// Statistics (Ace's Help card of the admin, context « backup »): the banner
// counts where the Ace cannot. Loaded on demand; nothing under automation
// (the browser tests close the banner) — beacons.mjs itself skips /live and
// « Do not count my visits ».
function _count(ev) {
  if (_automated()) return;
  try { import('./guide/beacons.mjs').then((m) => { try { m.beacon('backup', ev); } catch (_e) {} }).catch(() => {}); } catch (_e) {}
}
function _offerPending() { return !!(_offer && !_offer.done && !_offer.banner); }
// web.267 — why a Create / Restore did not succeed, counted (admin): before,
// only « tapped » and « done » were, and 23 restores tapped / 0 restored could
// not tell a closed picker from a missing file or a refused access.
// 'nofolder' is a missing file too; anything unknown is 'bad'.
const _FAIL = { create: ['abort', 'exists', 'noperm', 'bad'], restore: ['abort', 'nofile', 'noperm', 'empty', 'bad'] };
function _failEv(kind, why) {
  const w = why === 'nofolder' ? 'nofile' : why;
  return kind + '_' + (_FAIL[kind].indexOf(w) >= 0 ? w : 'bad');
}
// web.265 — on a first visit the Ace asks « First time on PokerTH? » before
// this offer. While that question waits he keeps this one (keep: no fallback
// banner after WATCH_MS); a newcomer (« Show me ») gets it at a later visit
// instead (defer), a returning player (« I already play ») right away. Until
// it has been shown once, NEXT_KEY makes the next session offer it again,
// even though the storage is no longer blank (no write hold then).
const NEXT_KEY = 'pth_bak_offer_next';
function _nextOffer() { try { return localStorage.getItem(NEXT_KEY) === '1'; } catch (_e) { return false; } }
function _setNext(on) { try { if (on) localStorage.setItem(NEXT_KEY, '1'); else localStorage.removeItem(NEXT_KEY); } catch (_e) {} }
function _offerKeep() {
  if (!_offerPending()) return;
  _offer.kept = true;
  if (_offerKind() !== 'persist') _setNext(true);   // Firefox: its offer comes back by itself (PERSIST_MAX)
}
function _offerDefer() {
  if (!_offerPending()) return;
  if (_offerKind() !== 'persist') _setNext(true);
  _offerDone(true);
}
function _offerKind() { return (_offer && _offer.kind) || 'folder'; }
function _offerFallback() {
  if (!_offerPending()) return;
  if (_offerKind() === 'persist') { _offer.done = true; return; }   // no banner for this one: nothing to restore
  _offer.banner = true;
  _showRestoreBanner();
  _count('banner');
}
// later=true: the player put it off (« Later », dismissed) — he starts fresh,
// automatic writing may resume.
function _offerDone(later) {
  if (_offer) _offer.done = true;
  if (later) _hold = false;
}
function _offerPath() { return (_state.dirName ? _state.dirName + ' / ' : '') + FILE_NAME; }
function _offerTexts() {
  if (_offerKind() === 'persist') {
    return {
      title: _t('bakPersistTitle', 'Keep your settings safe'),
      body: _t('bakPersistBody', 'Firefox may erase this site\'s data to free up disk space — your options, themes, avatar and trophies with it. I can ask Firefox to keep them; it will ask you to confirm.'),
      persist: _t('bakPersistBtn', 'Protect my settings'),
      later: _t('bakBannerLater', 'Later'),
      ok: _t('bakPersistOk', 'Done: Firefox will keep your settings.'),
      no: _t('bakPersistNo', 'Firefox did not allow it. You can change it later in the site\'s permissions (padlock in the address bar).'),
    };
  }
  return {
    title: _t('bakBannerTitle', 'Local backup of your settings'),
    body: _t('bakBannerBody', 'This browser can save your settings to a folder of your choice, or restore them from an existing backup.'),
    create: _t('bakBannerCreate', 'Create a backup'),
    restore: _t('bakBannerRestore', 'Restore a backup'),
    later: _t('bakBannerLater', 'Later'),
    created: _t('bakBannerCreated', 'Backup created.'),
    imported: _t('backupImported', 'Backup imported'),
    busy: _t('bakRestoreBusy', 'Restoring…'),
  };
}
// « Later »: where the player finds it again — Advanced options → Backup &
// reset → Automatic backup, then « Choose folder… ». Built from the labels the
// options panel itself shows, so the path always matches the screen.
// bold=true marks the path and the button for the Ace's bubble (**…**).
function _offerHint(bold) {
  const b = (s) => (bold ? '**' + s + '**' : s);
  const path = [_t('advTitle', 'Advanced options'), _t('advCatReset', 'Backup & reset'), _t('advBakAutoSec', 'Automatic backup')].join(' → ');
  const btn = _offerKind() === 'persist' ? _t('bakPersistBtn', 'Protect my settings') : _t('advPdbAutoPick', 'Choose folder…');
  let s = null;
  try {
    if (typeof window.t === 'function') {
      const v = window.t('bakLaterHint', { path: b(path), btn: b(btn) });
      if (v && v !== 'bakLaterHint') s = v;
    }
  } catch (_e) {}
  return s || ('No problem. Whenever you want to do it: ' + b(path) + ', then “' + b(btn) + '”.');
}
// « Show me »: opens Advanced options on Backup & reset and brings the
// automatic backup into view, its « Choose folder… » row flashed the way the
// options search marks a hit (.adv-hit).
function _offerShow() {
  try { if (typeof window.openAdvancedOptions === 'function') window.openAdvancedOptions(); } catch (_e) {}
  try { if (typeof window.advSelectCat === 'function') window.advSelectCat('reset'); } catch (_e) {}
  setTimeout(() => {
    try {
      const pick = document.getElementById(_offerKind() === 'persist' ? 'adv-persist-btn' : 'adv-bakauto-pick');
      const row = pick && pick.closest ? pick.closest('.adv-row') : null;
      const sec = document.querySelector('#adv-panel-reset .adv-sec[data-i18n="advBakAutoSec"]');
      const to = sec || row;
      if (to) { try { to.scrollIntoView({ block: 'start' }); } catch (_e) { try { to.scrollIntoView(); } catch (_e2) {} } }   // the flash below happens either way
      if (row) {
        row.classList.add('adv-hit');
        setTimeout(() => { try { row.classList.remove('adv-hit'); } catch (_e) {} }, 1600);
      }
    } catch (_e) {}
  }, 60);
}
function _offerWhy(code) {
  const k = _WHY[code] || _WHY.bad;
  return _t(k[0], k[1]);
}

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
    function run(fn, busyText, onOk, kind) {
      if (busy) return;
      busy = true; bCreate.disabled = true; bRestore.disabled = true;
      setMsg(busyText || '', false);
      // fn() is called in the click's own tick: showDirectoryPicker() and
      // requestPermission() require a fresh user activation.
      let p;
      try { p = fn(); } catch (e) { p = Promise.reject(e); }
      Promise.resolve(p).then((why) => {
        if (why === 'ok') { onOk(); return; }
        _count(_failEv(kind, why));                     // web.267
        busy = false; bCreate.disabled = false; bRestore.disabled = false;
        setSub();
        if (why === 'abort') { setMsg('', false); return; }
        const k = _WHY[why] || _WHY.bad;
        setMsg(_t(k[0], k[1]), true);
      }).catch((e) => {
        _count(_failEv(kind, 'bad'));
        busy = false; bCreate.disabled = false; bRestore.disabled = false;
        const d = (e && (e.name || e.message)) ? String(e.name || e.message) : '';
        setMsg(_t('backupImportErr', 'Import failed') + (d ? ' — ' + d : ''), true);
      });
    }

    const doRestore = _offerRestore;   // remembered folder first, then the picker

    bCreate.addEventListener('click', () => { _count('create'); run(_pickForCreate, '', () => {
      _count('created');
      _offerDone(false);
      _toast(_t('bakBannerCreated', 'Backup created.'));
      try { el.remove(); } catch (_e) {}
    }, 'create'); });
    bRestore.addEventListener('click', () => { _count('restore'); run(doRestore, _t('bakRestoreBusy', 'Restoring…'), () => {
      _count('restored');
      setMsg(_t('backupImported', 'Backup imported'), false);
    }, 'restore'); });
    // Explicit dismissal: the player starts fresh, automatic writing may
    // resume.
    function dismiss() {
      _count('dismissed');
      _offerDone(true);
      try { el.remove(); } catch (_e) {}
      _toast(_offerHint(false), { icon: '', duration: 7000 });
    }
    bLater.addEventListener('click', dismiss);
    no.addEventListener('click', dismiss);

    el.appendChild(head); el.appendChild(row);
    document.body.appendChild(el);

    // The language catalogue loads after boot: the banner was drawn with the
    // English fallback and never caught up. Its texts follow the language now.
    function relabel() {
      if (!el.isConnected) { document.removeEventListener('pth:langchange', relabel); return; }
      const tx = _offerTexts();
      txt.textContent = tx.title;
      body.textContent = tx.body;
      bCreate.textContent = tx.create;
      bRestore.textContent = tx.restore;
      bLater.textContent = tx.later;
    }
    document.addEventListener('pth:langchange', relabel);
    relabel();
  } catch (_e) {}
}

// Read-only view of the write hold (deterministic tests).
function _holdState() { return _hold; }

function _maybeOfferRestore() {
  // web.265: put off from an earlier visit (NEXT_KEY) — offered now, unless a folder was picked meanwhile
  const next = !_FRESH_AT_BOOT && _nextOffer();
  if (next && _state.dirName) _setNext(false);
  if (!_supported() || !_enabled() || !(_FRESH_AT_BOOT || (next && !_state.dirName))) { _hold = false; return; }
  // Since 2.1.8-web.10 the offer also shows when NO folder is remembered
  // (brand-new browser): the player learns a local backup exists. Create
  // picks a folder; Restore goes straight to the picker (_pickNext starts
  // true without a folder). _getHandle() already ran at _ready(), so
  // _state.dirName is populated before the offer is made.
  _pickNext = !_state.dirName;
  _offer = { claimed: false, shown: false, banner: false, done: false };
  if (_automated()) { _offerFallback(); return; }
  try { document.dispatchEvent(new CustomEvent('pth:bakoffer')); } catch (_e) {}
  _later(() => { if (_offer && !_offer.claimed) _offerFallback(); }, CLAIM_MS);
  _later(() => { if (_offer && !_offer.shown && !_offer.kept) _offerFallback(); }, WATCH_MS);   // kept: the Ace asks first (web.265)
}

// ── Firefox: protect the settings (persistent storage, web.31) ─────────────
// Firefox asks the player before granting persistent storage. Asked on load,
// without a word, that prompt comes out of nowhere and is often refused for
// good (Firefox remembers): pokerth.js no longer asks there on Firefox, the
// Ace explains first and the request runs on the player's click. Granted,
// Firefox never evicts the site's data on its own (disk cleanup, idle purge);
// the player can still delete it himself.
const PERSIST_N_KEY = 'pth_persist_n';   // showings of the offer on this device (local, not synced)
const PERSIST_MAX = 3;
function _isFirefox() {
  try { return /Firefox\//.test(navigator.userAgent || ''); } catch (_e) { return false; }
}
function _persistApi() {
  try {
    return typeof navigator !== 'undefined' && !!navigator.storage
      && typeof navigator.storage.persist === 'function' && typeof navigator.storage.persisted === 'function';
  } catch (_e) { return false; }
}
function _persistN() { try { return parseInt(localStorage.getItem(PERSIST_N_KEY) || '0', 10) || 0; } catch (_e) { return 0; } }
function _persistSetN(n) { try { localStorage.setItem(PERSIST_N_KEY, String(n)); } catch (_e) {} }
// 'ok' granted · 'no' refused (Firefox remembers it: no more offers) · 'bad' error.
// Call it in the click's own tick: Firefox ties its prompt to the gesture.
function _persistAsk() {
  let p;
  try { p = navigator.storage.persist(); } catch (e) { p = Promise.reject(e); }
  return Promise.resolve(p).then((granted) => {
    if (granted) { _persistSetN(PERSIST_MAX); _ui(); return 'ok'; }
    _persistSetN(PERSIST_MAX);
    _ui();
    return 'no';
  }).catch(() => 'bad');
}
function _maybeOfferPersist() {
  if (window.LIVE_MODE || !_isFirefox() || !_persistApi() || !_enabled() || _automated()) return;
  if (_persistN() >= PERSIST_MAX) return;
  let p;
  try { p = navigator.storage.persisted(); } catch (_e) { return; }
  Promise.resolve(p).then((already) => {
    if (already) return;
    _offer = { kind: 'persist', claimed: false, shown: false, banner: false, done: false };
    try { document.dispatchEvent(new CustomEvent('pth:bakoffer')); } catch (_e) {}
  }).catch(() => {});
}
// Advanced options → Backup & reset → « Protect my settings » (the Ace's
// « Later » points here).
function _persistClick() {
  _count('persist');
  _persistAsk().then((r) => {
    if (r === 'ok') { _count('persisted'); _toast(_t('bakPersistOk', 'Done: Firefox will keep your settings.')); }
    else if (r === 'no') { _count('persist_no'); _toast(_t('bakPersistNo', 'Firefox did not allow it.'), { icon: '', duration: 7000 }); }
  });
}
function _persistUi() {
  try {
    const row = document.getElementById('adv-persist-row');
    const st = document.getElementById('adv-persist-status');
    if (!row && !st) return;
    const on = !window.LIVE_MODE && _isFirefox() && _persistApi();
    if (row) row.style.display = 'none';
    if (st) st.style.display = 'none';
    if (!on) return;
    Promise.resolve(navigator.storage.persisted()).then((already) => {
      if (row) row.style.display = already ? 'none' : '';
      if (st) { st.textContent = already ? _t('bakPersistOk', 'Done: Firefox will keep your settings.') : ''; st.style.display = already ? '' : 'none'; }
    }).catch(() => {});
  } catch (_e) {}
}

// ── UI (advanced-options panel) ────────────────────────────────────────────

function _ui() {
  _persistUi();
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
  if (!_supported()) { _maybeOfferPersist(); return; }   // Firefox: protect instead (web.31)
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
  // The startup offer, for the Ace (modules/guide/index.mjs). create() and
  // restore() must be called in the click's own tick (folder picker).
  window._bakOffer = {
    pending: _offerPending,
    claim() { if (!_offerPending()) return false; _offer.claimed = true; return true; },
    shown() {
      if (!_offer) return;
      if (!_offer.shown && _offer.kind === 'persist') _persistSetN(_persistN() + 1);   // at most PERSIST_MAX showings per device
      _offer.shown = true;
      _setNext(false);                                  // shown once: no more « next visit » (web.265)
    },
    failEv: _failEv,                                    // web.267: the counter of a failed Create / Restore
    keep: _offerKeep,
    defer: _offerDefer,
    known: () => !!_state.dirName,                      // a folder is remembered: a backup exists, its question comes first
    fallback: _offerFallback,
    texts: _offerTexts,
    path: _offerPath,
    why: _offerWhy,
    hint: _offerHint,
    show: _offerShow,
    create: () => _pickForCreate(),
    restore: _offerRestore,
    done: _offerDone,
    kind: _offerKind,          // 'folder' (backup file) or 'persist' (Firefox, web.31)
    persist: _persistAsk,      // kind 'persist': in the click's own tick
  };
  window._bakPersist = _persistClick;   // Advanced options button
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
