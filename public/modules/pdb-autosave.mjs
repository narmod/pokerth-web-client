// PokerTH web client — Écriture automatique du log .pdb dans un dossier local.
//
// Parité client de bureau : celui-ci écrit « pokerth-log-<date>_<heure>.pdb »
// dans LogDir et le tient à jour au fil de la partie (voir src/engine/log.cpp,
// LogInterval). Un navigateur ne peut pas écrire librement sur le disque : on
// passe par la File System Access API. Le joueur choisit UNE fois un dossier,
// le handle est conservé (IndexedDB) et réutilisé aux sessions suivantes.
//
// Support : Chrome / Edge / Opera de bureau. Partout ailleurs le module reste
// inerte et l'export manuel (bouton « .pdb ») demeure le seul chemin.
//
// Une session = un fichier, exactement comme le client officiel : le nom vient
// de window._handlog.sessionId, qui change à chaque chargement de page.
//
// Rythme d'écriture : parité `LogInterval` (log.cpp) — 0 = après chaque action,
// 1 = après chaque main (défaut officiel), 2 = après chaque partie. Le fichier
// est créé dès le début d'une partie (équivalent Log::init) et un flush forcé
// a lieu à la fermeture de l'onglet (équivalent Log::flushLog).
//
// Écriture en place quand le navigateur le permet (createWritable en mode
// « exclusive » : même fichier, même inode, comme la connexion SQLite du client
// de bureau) ; sinon repli sur le remplacement atomique par fichier temporaire.
//
// Options avancées : pth_pdb_auto (ON par défaut ; sans dossier choisi le
// module reste inerte) et pth_log_on (LogOnOff : coupe toute écriture).
// Dépend de : window._handlog (recorder), window._buildPdb (handlog.mjs).
// Aucune régression possible : si ce module n'est pas chargé, le hook
// window._pdbAutoSave est simplement absent.

// ── Support & option ───────────────────────────────────────────────────────

function _supported() {
  return (typeof window !== 'undefined'
    && typeof window.showDirectoryPicker === 'function'
    && typeof window.indexedDB !== 'undefined');
}

// ON par défaut : rien n'est écrit tant que le joueur n'a pas choisi un
// dossier (l'API navigateur l'exige), l'effet réel est donc d'avoir la case
// déjà cochée au moment où il le choisit. '0' = désactivé explicitement.
function _enabled() {
  try {
    if (typeof localStorage === 'undefined') return true;
    if (localStorage.getItem('pth_pdb_auto') === '0') return false;
    // Parité LogOnOff : la journalisation coupée coupe aussi le fichier.
    if (localStorage.getItem('pth_log_on') === '0') return false;
    return true;
  } catch (_e) { return true; }
}

// Intervalle officiel (configfile.cpp défaut « 1 ») : 0 = chaque action,
// 1 = chaque main, 2 = chaque partie. Les anciennes valeurs texte du web
// ('action' / 'hand') restent acceptées.
function _intervalIdx() {
  try {
    if (typeof window !== 'undefined' && typeof window._getLogIntervalIdx === 'function') {
      const n = window._getLogIntervalIdx();
      if (n === 0 || n === 1 || n === 2) return n;
    }
    if (typeof localStorage === 'undefined') return 1;
    const v = localStorage.getItem('pth_log_interval');
    if (v === 'action') return 0;
    if (v === 'hand') return 1;
    const n = parseInt(v, 10);
    return (n === 0 || n === 1 || n === 2) ? n : 1;
  } catch (_e) { return 1; }
}

// Un événement déclenche-t-il une écriture ? Table de vérité de log.cpp :
// 'action' → LogInterval 0 · 'hand' → logAfterHand (0 ou 1) · 'game' →
// logAfterGame (toutes valeurs) · 'start'/'pick'/'flush' → toujours.
function _shouldWrite(evt) {
  if (evt === 'action') return _intervalIdx() === 0;
  if (evt === 'hand') return _intervalIdx() <= 1;
  return true;   // 'game', 'start', 'pick', 'flush'
}

// ── Persistance du handle de dossier (IndexedDB) ───────────────────────────
// Un FileSystemDirectoryHandle est structured-clonable : il survit au
// rechargement, contrairement à localStorage qui ne stocke que du texte.

const DB_NAME = 'pth_pdbauto';
const DB_VERSION = 1;
const STORE = 'kv';
const KEY = 'dir';

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
  lastName: null,     // dernier fichier écrit
  lastAt: 0,          // horodatage de la dernière écriture réussie
  err: null,          // dernière erreur (nom court)
  inPlace: null,      // true = écriture dans le fichier cible (mode exclusive)
};

let _handle = null;         // FileSystemDirectoryHandle en cache mémoire
let _handleLoaded = false;  // le chargement depuis IndexedDB a déjà eu lieu

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

// interactive=true → peut ouvrir la demande de permission du navigateur, ce qui
// exige un geste utilisateur ; false → simple interrogation, jamais de popup.
async function _ensurePerm(h, interactive) {
  try {
    if (typeof h.queryPermission !== 'function') return true;   // navigateur permissif
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

// Nom au format officiel : la sessionId du recorder est déjà « AAAA-MM-JJ_HHMMSS ».
function _fileName() {
  const rec = window._handlog;
  const sid = (rec && rec.sessionId ? String(rec.sessionId) : '').replace(/[^0-9A-Za-z_-]/g, '');
  return 'pokerth-log-' + (sid || 'session') + '.pdb';
}

// Copie de surface des tableaux : buildPdb parcourt les tables après un await
// (chargement de sql.js), le recorder pourrait en muter une entre-temps.
function _snapshot() {
  const rec = window._handlog;
  if (!rec || typeof rec.toJSON !== 'function') return null;
  const t = rec.toJSON();
  return {
    session: t.session,
    games: (t.games || []).slice(),
    players: (t.players || []).slice(),
    hands: (t.hands || []).slice(),
    actions: (t.actions || []).slice(),
  };
}

// Ouvre un flux d'écriture en privilégiant le mode « exclusive » : le
// navigateur écrit alors DANS le fichier cible (pas de fichier temporaire, pas
// de remplacement), donc l'inode ne change jamais — c'est ce que fait la
// connexion SQLite du client de bureau, et c'est ce qu'attend un lecteur
// externe qui garde le fichier ouvert. Repli silencieux sur le mode standard
// là où l'option n'existe pas.
async function _openWritable(fh) {
  try {
    const w = await fh.createWritable({ keepExistingData: true, mode: 'exclusive' });
    _state.inPlace = true;
    return w;
  } catch (_e) {
    const w = await fh.createWritable();
    _state.inPlace = false;
    return w;
  }
}

// force : autorise l'écriture d'un fichier encore sans main (création en début
// de partie, équivalent Log::init qui pose schéma + ligne Session).
async function _writeNow(force) {
  if (!_supported() || !_enabled()) return false;
  if (typeof window._buildPdb !== 'function') return false;

  const tables = _snapshot();
  if (!tables) return false;
  // Rien tant qu'aucune partie n'a commencé : pas de fichier pour un simple
  // passage au lobby ou un spectateur.
  if (!force && !tables.hands.length) return false;
  if (!tables.hands.length && !tables.games.length && !force) return false;

  const dir = await _getHandle();
  if (!dir) return false;
  if (!(await _ensurePerm(dir, false))) return false;

  const bytes = await window._buildPdb(tables);
  const name = _fileName();
  const fh = await dir.getFileHandle(name, { create: true });
  const w = await _openWritable(fh);
  // Écriture depuis l'offset 0 puis troncature : indispensable en mode
  // « exclusive » où le contenu précédent est conservé et pourrait dépasser.
  await w.write({ type: 'write', position: 0, data: bytes });
  try { await w.truncate(bytes.length); } catch (_e) { /* mode standard : déjà tronqué */ }
  await w.close();

  _state.lastName = name;
  _state.lastAt = Date.now();
  _state.err = null;
  return true;
}

// Sérialisation des écritures : une seule à la fois, les demandes reçues
// pendant une écriture sont fusionnées en une seule reprise.
let _busy = false;
let _again = false;
let _againForce = false;
let _lastWriteAt = 0;

// Garde-fou perf : buildPdb reconstruit toute la base et sql.js est synchrone.
// En mode « chaque action » sur une longue session, écrire à chaque coup
// figerait la table ; on espace donc les écritures automatiques. Un flush
// explicite (fermeture, changement de réglage) n'est jamais retardé.
const MIN_GAP_MS = 400;

// evt : 'action' | 'hand' | 'game' | 'start' | 'pick' | 'flush'.
// Sans argument = 'hand' (compatibilité des appels existants).
async function save(evt) {
  const ev = evt || 'hand';
  if (!_supported() || !_enabled()) return;
  if (!_shouldWrite(ev)) return;
  const force = (ev === 'start' || ev === 'pick' || ev === 'flush' || ev === 'game');
  if (_busy) { _again = true; _againForce = _againForce || force; return; }

  // Étalement des rafales d'actions ; on ne perd rien, la demande est
  // simplement reprise après le délai.
  const wait = MIN_GAP_MS - (Date.now() - _lastWriteAt);
  if (ev === 'action' && wait > 0) {
    if (_again) return;
    _again = true;
    setTimeout(() => { _again = false; save('action'); }, wait);
    return;
  }

  _busy = true;
  try {
    await _writeNow(force);
    _lastWriteAt = Date.now();
  } catch (e) {
    _state.err = (e && (e.name || e.message)) ? String(e.name || e.message) : 'error';
  } finally {
    _busy = false;
    _ui();
    if (_again) { _again = false; const f = _againForce; _againForce = false; setTimeout(() => save(f ? 'flush' : 'hand'), 0); }
  }
}

// ── Choix du dossier (geste utilisateur) ───────────────────────────────────

async function pickFolder() {
  if (!_supported()) return false;
  try {
    const h = await window.showDirectoryPicker({ id: 'pokerth-log', mode: 'readwrite' });
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
    // AbortError = le joueur a fermé le sélecteur : ce n'est pas une erreur.
    if (!(e && e.name === 'AbortError')) {
      _state.err = (e && (e.name || e.message)) ? String(e.name || e.message) : 'error';
      _ui();
    }
    return false;
  }
}

// ── UI (panneau Options avancées) ──────────────────────────────────────────

function _t(key, fallback) {
  try {
    if (typeof window.t === 'function') {
      const v = window.t(key);
      if (v && v !== key) return v;
    }
  } catch (_e) {}
  return fallback;
}

function _ui() {
  try {
    const btn = document.getElementById('adv-pdbauto-pick');
    const st = document.getElementById('adv-pdbauto-status');
    if (!btn && !st) return;

    if (!_supported()) {
      if (btn) btn.style.display = 'none';
      if (st) st.textContent = _t('advPdbAutoNoFs', 'This browser cannot write to a local folder.');
      const cb = document.getElementById('adv-pdbauto');
      if (cb) cb.disabled = true;
      return;
    }
    if (btn) btn.style.display = '';
    if (st) {
      let txt = '';
      if (_state.dirName) {
        txt = _t('advPdbAutoFolder', 'Folder') + ' : ' + _state.dirName;
        if (_state.needPerm) txt += ' — ' + _t('advPdbAutoPick', 'Choose folder…');
        else if (_state.lastName) txt += ' · ' + _state.lastName;
      }
      if (_state.err) txt = (txt ? txt + ' — ' : '') + _state.err;
      st.textContent = txt;
    }
  } catch (_e) {}
}

// Précharge le nom du dossier mémorisé pour que le panneau l'affiche sans
// attendre une première écriture.
function _ready() {
  if (!_supported()) return;
  _getHandle().then(() => _ui()).catch(() => {});
}

// Flush forcé quand la page part (équivalent Log::flushLog + destructeur) : la
// dernière main jouée ne doit pas rester dans le seul IndexedDB. pagehide est
// le seul événement fiable sur iOS ; visibilitychange couvre le passage en
// arrière-plan sur mobile.
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
  window._pdbAutoSave = save;         // appelé par handlog.mjs (action / main / partie)
  window._pdbAutoPick = pickFolder;   // bouton « Choisir le dossier… »
  window._pdbAutoUi = _ui;            // rafraîchissement à l'ouverture du panneau
  _ready();
  _installFlush();
}

// Exports ESM : uniquement pour les tests déterministes. En navigateur le
// module ne communique que par window.*.
export { save, pickFolder, _supported, _enabled, _intervalIdx, _shouldWrite, _fileName, _state };
