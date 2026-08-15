// PokerTH web client — Écriture automatique de la sauvegarde complète (backup
// web) dans un dossier local, et proposition de restauration au démarrage.
//
// Problème visé : le stockage navigateur (localStorage/IndexedDB) peut être
// purgé entre deux sessions (nettoyage, éviction). Le joueur devait alors
// réimporter sa sauvegarde à la main avant chaque connexion. Ici, le fichier
// « pokerth-web-backup.json » est tenu à jour automatiquement dans un dossier
// choisi UNE fois (File System Access API, même mécanique que pdb-autosave :
// handle conservé en IndexedDB et réutilisé aux sessions suivantes). Si au
// démarrage le stockage semble vierge alors qu'un dossier est mémorisé, une
// bannière propose de tout restaurer en un clic.
//
// Support : Chrome / Edge / Opera de bureau. Partout ailleurs le module reste
// inerte et l'export/import manuel (options avancées) demeure le seul chemin.
//
// Contenu du fichier : exactement celui de l'export manuel — construit par
// window._webBackupRecord (pokerth.js) ; la restauration passe par
// window._applyWebBackupRec, le même chemin que l'import manuel (fusion des
// succès, config.xml embarqué, jamais d'identifiants ni de session).
//
// Rythme d'écriture : vérification périodique (60 s) — écrit seulement si le
// contenu a changé (signature clés+xml, l'horodatage d'export est ignoré) —
// plus un flush forcé à la fermeture de l'onglet et au passage en arrière-plan.
//
// Options avancées : pth_bak_auto (ON par défaut ; sans dossier choisi le
// module reste inerte). Aucune régression possible : si ce module n'est pas
// chargé, les hooks window._bakAuto* sont simplement absents.

// ── Support & option ───────────────────────────────────────────────────────

function _supported() {
  return (typeof window !== 'undefined'
    && typeof window.showDirectoryPicker === 'function'
    && typeof window.indexedDB !== 'undefined');
}

// ON par défaut : rien n'est écrit tant que le joueur n'a pas choisi un
// dossier (l'API navigateur l'exige). '0' = désactivé explicitement.
function _enabled() {
  try {
    if (typeof localStorage === 'undefined') return true;
    if (localStorage.getItem('pth_bak_auto') === '0') return false;
    return true;
  } catch (_e) { return true; }
}

// ── Détection « stockage vierge » (au chargement du module) ────────────────
// Les modules s'exécutent avant les gestionnaires DOMContentLoaded de
// pokerth.js : les clés d'identité ci-dessous ne peuvent pas encore avoir été
// écrites par l'app elle-même. Le boot inline du thème (pokerth-client.html)
// écrit pth_deck / pth_seat même pour un premier passage, d'où une liste de
// clés d'identité plutôt qu'un simple comptage des pth_*.
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

// ── Persistance du handle de dossier (IndexedDB) ───────────────────────────

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

// ── État courant (pour l'UI des options avancées) ──────────────────────────

const _state = {
  dirName: null,      // nom du dossier choisi
  needPerm: false,    // handle présent mais permission à re-accorder
  lastAt: 0,          // horodatage de la dernière écriture réussie
  err: null,          // dernière erreur (nom court)
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
  } catch (_e) { /* pas de handle mémorisé */ }
  return _handle;
}

// interactive=true → peut ouvrir la demande de permission du navigateur
// (exige un geste utilisateur) ; false → simple interrogation, jamais de popup.
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

// ── Écriture ───────────────────────────────────────────────────────────────

// Signature du contenu utile : les clés et le config.xml embarqué, mais pas
// l'horodatage d'export (il change à chaque construction).
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
  if (typeof window._webBackupRecord !== 'function') return false;

  const b = window._webBackupRecord();
  if (!b || !b.rec) return false;
  const sig = _sigOf(b.rec);
  if (sig !== null && sig === _lastSig) return false;   // rien de neuf

  const dir = await _getHandle();
  if (!dir) return false;
  if (!(await _ensurePerm(dir, false))) return false;

  const bytes = new TextEncoder().encode(JSON.stringify(b.rec));
  const fh = await dir.getFileHandle(FILE_NAME, { create: true });
  const w = await _openWritable(fh);
  await w.write({ type: 'write', position: 0, data: bytes });
  try { await w.truncate(bytes.length); } catch (_e) { /* mode standard : déjà tronqué */ }
  await w.close();

  _lastSig = sig;
  _state.lastAt = Date.now();
  _state.err = null;
  return true;
}

// Sérialisation : une écriture à la fois, une demande reçue pendant une
// écriture est reprise ensuite.
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

// ── Choix du dossier (geste utilisateur) ───────────────────────────────────

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
    try { await _saveHandle(h); } catch (_e) { /* le handle reste valable pour la session */ }
    _ui();
    // Première écriture immédiate : le joueur voit le fichier apparaître.
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

// ── Restauration (bannière au démarrage) ───────────────────────────────────

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

async function _restoreFromFolder() {
  const dir = await _getHandle();
  if (!dir) return false;
  // Geste utilisateur (clic sur la bannière) : la demande de permission
  // interactive est autorisée ici.
  if (!(await _ensurePerm(dir, true))) return false;
  const fh = await dir.getFileHandle(FILE_NAME);      // sans create : absent → throw
  const file = await fh.getFile();
  const rec = JSON.parse(await file.text());
  if (typeof window._applyWebBackupRec !== 'function') return false;
  const n = window._applyWebBackupRec(rec);
  if (n < 0) return false;
  _toast((_t('backupImported', 'Backup imported')) + ' (' + n + ')');
  // Rechargement : applique thème, langue, options — même finalité que la
  // proposition de rechargement de l'import manuel, sans question puisque le
  // joueur vient de demander la restauration.
  setTimeout(() => { try { location.reload(); } catch (_e) {} }, 800);
  return true;
}

function _showRestoreBanner() {
  try {
    if (document.getElementById('bak-restore-banner')) return;
    const el = document.createElement('div');
    el.id = 'bak-restore-banner';
    el.setAttribute('role', 'alertdialog');
    el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:18px;' +
      'z-index:99999;background:#1c2733;color:#fff;padding:10px 14px;border-radius:10px;' +
      'box-shadow:0 4px 18px rgba(0,0,0,.45);display:flex;gap:10px;align-items:center;' +
      'max-width:min(92vw,560px);font-size:14px;line-height:1.35';
    const txt = document.createElement('span');
    txt.textContent = _t('bakRestoreQ', 'Your settings look empty. Restore them from your backup folder?');
    const ok = document.createElement('button');
    ok.type = 'button';
    ok.textContent = _t('bakRestoreBtn', 'Restore');
    ok.style.cssText = 'background:#2e7d32;color:#fff;border:0;border-radius:8px;' +
      'padding:6px 12px;font-size:14px;cursor:pointer;white-space:nowrap';
    const no = document.createElement('button');
    no.type = 'button';
    no.setAttribute('aria-label', 'Dismiss');
    no.textContent = '\u2715';
    no.style.cssText = 'background:transparent;color:#9fb0c0;border:0;font-size:15px;' +
      'cursor:pointer;padding:4px 6px';
    ok.addEventListener('click', () => {
      ok.disabled = true;
      _restoreFromFolder().then((done) => {
        if (done) { try { el.remove(); } catch (_e) {} }
        else { ok.disabled = false; _toast(_t('backupImportErr', 'Import failed'), { tone: 'error' }); }
      }).catch(() => {
        ok.disabled = false;
        _toast(_t('backupImportErr', 'Import failed'), { tone: 'error' });
      });
    });
    no.addEventListener('click', () => { try { el.remove(); } catch (_e) {} });
    el.appendChild(txt); el.appendChild(ok); el.appendChild(no);
    document.body.appendChild(el);
  } catch (_e) {}
}

function _maybeOfferRestore() {
  if (!_supported() || !_enabled() || !_FRESH_AT_BOOT) return;
  _getHandle().then((h) => { if (h) _showRestoreBanner(); }).catch(() => {});
}

// ── UI (panneau Options avancées) ──────────────────────────────────────────

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

// ── Démarrage ──────────────────────────────────────────────────────────────

const TICK_MS = 60000;

function _ready() {
  if (!_supported()) return;
  _getHandle().then(() => { _ui(); _maybeOfferRestore(); }).catch(() => {});
  try { setInterval(() => save('tick'), TICK_MS); } catch (_e) {}
  // Première écriture peu après le chargement : couvre les changements faits
  // pendant que l'onglet était fermé côté serveur (synchro compte) et pose la
  // signature de référence.
  try { setTimeout(() => save('boot'), 8000); } catch (_e) {}
}

// Flush forcé quand la page part : pagehide est le seul événement fiable sur
// mobile ; visibilitychange couvre le passage en arrière-plan.
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
  window._bakAutoSave = save;         // écriture à la demande (facultatif)
  window._bakAutoPick = pickFolder;   // bouton « Choisir le dossier… »
  window._bakAutoUi = _ui;            // rafraîchissement à l'ouverture du panneau
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { _ready(); });
  } else {
    _ready();
  }
  _installFlush();
}

// Exports ESM : uniquement pour les tests déterministes. En navigateur le
// module ne communique que par window.*.
export { save, pickFolder, _supported, _enabled, _looksFresh, _sigOf, _writeNow, _state };
