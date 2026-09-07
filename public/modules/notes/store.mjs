// @ts-check
// notes/store.mjs — Notes libres + étiquette de couleur par joueur (extra web,
// absent du client officiel — conçu pour être portable en QML plus tard).
// Stockage local sous UNE seule clé 'pth_notes', pour que la synchronisation
// des réglages web la transporte telle quelle entre appareils (voir
// _CFG_WEB_SYNC_KEYS / _NOTES_SYNC_KEYS dans pokerth.js) — aucune
// infrastructure nouvelle.
//
// Clé de note = le PSEUDO, jamais le playerId : l'id change à chaque session,
// le pseudo est ce que le joueur reconnaît. Même choix que la liste des
// ignorés (_ignoredSet), qui est déjà pseudo-indexée et déjà synchronisée.
//
// Forme stockée (compacte — la valeur synchronisée est plafonnée à 20 000
// caractères côté pokerth.js, donc chaque octet compte) :
//   { p: { "<pseudo>": { n:"texte", c:"red", s:3, t:1756400000000 } },
//     l: { "red": { v:"Bluffe tout", t:1756400000000 } } }
// p = notes par joueur ; n = note (peut être vide si seule la couleur est
// posée) ; c = id d'étiquette (voir TAGS) ou '' ; s = note en étoiles 0–5
// (OMISE quand elle vaut 0 — la valeur voyage dans un blob plafonné, une clé
// qui ne dit rien ne mérite pas ses octets) ; t = date de dernière
// modification (ms) — sert au tri, à l'élagage et à la fusion.
// Les étoiles sont la parité du client QML (upstream b77ad47, « player notes
// and star rating »), qui les range à côté de la note dans le même
// enregistrement — mêmes trois informations, un cran plus riche ici avec
// l'étiquette de couleur.
// l = libellés d'étiquette RENOMMÉS par le joueur (sens global : « rouge »
// veut dire la même chose pour tous les joueurs marqués rouge). Seuls les
// libellés modifiés y figurent ; absent = libellé i18n par défaut. Chaque
// couleur porte sa propre date, pour qu'un renommage du téléphone et un
// renommage du bureau sur DEUX couleurs différentes survivent tous les deux
// à la fusion.
//
// Une entrée joueur sans note, sans couleur ET sans étoile est supprimée :
// pas de squelette vide. Un libellé remis au défaut est supprimé de l.

// Palette d'étiquettes. Les libellés par défaut passent par i18n (clés
// nvTag*), les couleurs sont fixes pour rester lisibles sur n'importe quel
// feutre — et pour qu'un export/import entre appareils (ou plus tard vers le
// client QML) n'ait aucune palette à négocier.
export const TAGS = [
  { id: 'red',    hex: '#e05050', key: 'nvTagRed',    fb: 'Danger' },
  { id: 'orange', hex: '#e08a3c', key: 'nvTagOrange', fb: 'Aggressive' },
  { id: 'yellow', hex: '#e3c800', key: 'nvTagYellow', fb: 'Watch' },
  { id: 'green',  hex: '#4caf72', key: 'nvTagGreen',  fb: 'Fish' },
  { id: 'blue',   hex: '#4a90d9', key: 'nvTagBlue',   fb: 'Tight' },
  { id: 'purple', hex: '#9b6bd6', key: 'nvTagPurple', fb: 'Tricky' },
];

const TAG_BY_ID = new Map(TAGS.map((x) => [x.id, x]));
export function tagById(id) { return TAG_BY_ID.get(String(id || '')) || null; }

// Garde-fous : la valeur entière voyage dans le blob de réglages web, elle ne
// peut donc pas grossir sans limite. Au-delà de MAX_ENTRIES on élague les
// entrées les plus anciennes (t croissant) — jamais celles qu'on vient
// d'écrire, qui portent le t le plus récent. Les libellés (6 max) ne sont
// jamais élagués.
export const MAX_NOTE_LEN = 500;
// 0 à 5 étoiles, comme la barre du dialogue QML (PlayerRatingStars.qml).
export const MAX_STARS = 5;
export const MAX_LABEL_LEN = 40;
export const MAX_ENTRIES = 300;

const LS_KEY = 'pth_notes';

function memBackend() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, v); },
    removeItem: (k) => { m.delete(k); },
  };
}

function safeLocal() {
  try {
    if (typeof localStorage !== 'undefined') {
      const k = '__pth_nv_probe';
      localStorage.setItem(k, '1'); localStorage.removeItem(k);
      return localStorage;
    }
  } catch (_e) { /* navigation privée / stockage refusé */ }
  return memBackend();
}

// Normalise un pseudo pour la CLÉ de lecture/écriture. On garde le pseudo tel
// quel (il est réaffiché), on se contente de couper les espaces de bord : un
// « Alice » et un « Alice  » venus de deux chemins différents doivent tomber
// sur la même note.
function _key(name) { return String(name == null ? '' : name).trim(); }

// Normalise une valeur d'étoiles venue de n'importe où (saisie, import,
// appareil d'en face) : entier borné à [0, MAX_STARS]. Tout le reste vaut 0,
// c'est-à-dire « pas de note en étoiles » — jamais une exception.
function _stars(v) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n > MAX_STARS ? MAX_STARS : n;
}

// Un objet brut → la forme { p, l }. Tolère l'ancienne forme plate (un objet
// pseudo → entrée, sans enveloppe) pour qu'un import venu d'un client qui
// aurait la forme d'origine fusionne sans rien perdre.
function _shape(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return { p: {}, l: {} };
  if (o.p && typeof o.p === 'object' && !Array.isArray(o.p)) {
    return {
      p: o.p,
      l: (o.l && typeof o.l === 'object' && !Array.isArray(o.l)) ? o.l : {},
    };
  }
  return { p: o, l: {} };   // forme plate historique
}

export function createNotes(opts = {}) {
  const be = opts.backend || safeLocal();
  const key = opts.key || LS_KEY;
  // Notifié après chaque écriture (le client y branche _cfgSyncMark + le
  // rafraîchissement des sièges). Optionnel : le store reste utilisable seul.
  const onChange = typeof opts.onChange === 'function' ? opts.onChange : null;

  function _all() {
    try {
      const raw = be.getItem(key);
      if (!raw) return { p: {}, l: {} };
      return _shape(JSON.parse(raw));
    } catch (_e) { return { p: {}, l: {} }; }
  }

  function _write(o) {
    // Élagage : on ne garde que les MAX_ENTRIES entrées joueur les plus
    // récentes. Les libellés ne comptent pas dans le quota.
    const names = Object.keys(o.p);
    if (names.length > MAX_ENTRIES) {
      names.sort((a, b) => (o.p[a].t || 0) - (o.p[b].t || 0));
      for (let i = 0; i < names.length - MAX_ENTRIES; i++) delete o.p[names[i]];
    }
    try { be.setItem(key, JSON.stringify(o)); } catch (_e) {}
    if (onChange) { try { onChange(); } catch (_e) {} }
  }

  return {
    // ── Notes par joueur ─────────────────────────────────────────────────
    // Entrée brute ou null. Ne crée jamais rien.
    get(name) {
      const k = _key(name);
      if (!k) return null;
      const e = _all().p[k];
      if (!e || typeof e !== 'object') return null;
      return { note: String(e.n || ''), tag: String(e.c || ''), stars: _stars(e.s), ts: e.t || 0 };
    },

    noteOf(name)  { const e = this.get(name); return e ? e.note : ''; },
    tagOf(name)   { const e = this.get(name); return e ? e.tag : ''; },
    starsOf(name) { const e = this.get(name); return e ? e.stars : 0; },
    hasAny(name)  { const e = this.get(name); return !!(e && (e.note || e.tag || e.stars)); },

    // Écrit note, couleur et/ou étoiles. Passer null à un champ le laisse
    // inchangé ; passer '' (ou 0 pour les étoiles) l'efface. Une entrée
    // devenue entièrement vide est supprimée.
    set(name, { note = null, tag = null, stars = null } = {}) {
      const k = _key(name);
      if (!k) return null;
      const o = _all();
      const cur = o.p[k] && typeof o.p[k] === 'object' ? o.p[k] : {};
      let n = note === null ? String(cur.n || '') : String(note);
      let c = tag === null ? String(cur.c || '') : String(tag);
      const st = stars === null ? _stars(cur.s) : _stars(stars);
      n = n.slice(0, MAX_NOTE_LEN);
      if (c && !TAG_BY_ID.has(c)) c = '';       // id inconnu → pas d'étiquette
      if (!n && !c && !st) { delete o.p[k]; _write(o); return null; }
      o.p[k] = st ? { n, c, s: st, t: Date.now() } : { n, c, t: Date.now() };
      _write(o);
      return { note: n, tag: c, stars: st, ts: o.p[k].t };
    },

    clear(name) { return this.set(name, { note: '', tag: '', stars: 0 }); },

    // Tous les pseudos annotés, du plus récemment touché au plus ancien.
    names() {
      const p = _all().p;
      return Object.keys(p).sort((a, b) => (p[b].t || 0) - (p[a].t || 0));
    },

    count() { return Object.keys(_all().p).length; },

    // ── Libellés d'étiquette (sens global d'une couleur) ─────────────────
    // Libellé renommé pour cette couleur, ou '' si le défaut i18n s'applique.
    labelOf(id) {
      const tg = tagById(id);
      if (!tg) return '';
      const e = _all().l[tg.id];
      return (e && typeof e === 'object') ? String(e.v || '') : '';
    },

    // Renomme le sens d'une couleur, pour TOUS les joueurs qui la portent.
    // '' (ou un libellé identique au défaut, filtré par l'appelant) remet le
    // défaut i18n et supprime l'entrée.
    setLabel(id, text) {
      const tg = tagById(id);
      if (!tg) return false;
      const o = _all();
      const v = String(text == null ? '' : text).trim().slice(0, MAX_LABEL_LEN);
      const cur = o.l[tg.id];
      const curV = (cur && typeof cur === 'object') ? String(cur.v || '') : '';
      if (v === curV) return false;             // rien ne change : pas de sync
      if (!v) delete o.l[tg.id];
      else o.l[tg.id] = { v, t: Date.now() };
      _write(o);
      return true;
    },

    clearAll() { try { be.removeItem(key); } catch (_e) {} if (onChange) { try { onChange(); } catch (_e) {} } },

    // ── Fusion (import / réconciliation multi-appareils) ─────────────────
    // À pseudo égal, la date la plus récente gagne ; même règle couleur par
    // couleur pour les libellés. Renvoie true si quelque chose a bougé, pour
    // que l'appelant sache s'il doit repousser le blob.
    mergeIn(other) {
      const th = _shape(other);
      const o = _all();
      let changed = false;
      for (const k of Object.keys(th.p)) {
        const e = th.p[k];
        if (!e || typeof e !== 'object') continue;
        const mine = o.p[k];
        if (!mine || (e.t || 0) > (mine.t || 0)) {
          const n = String(e.n || '').slice(0, MAX_NOTE_LEN);
          let c = String(e.c || '');
          if (c && !TAG_BY_ID.has(c)) c = '';
          const st = _stars(e.s);
          if (!n && !c && !st) { if (mine) { delete o.p[k]; changed = true; } continue; }
          const t = e.t || Date.now();
          o.p[k] = st ? { n, c, s: st, t } : { n, c, t };
          changed = true;
        }
      }
      for (const id of Object.keys(th.l)) {
        if (!TAG_BY_ID.has(id)) continue;
        const e = th.l[id];
        if (!e || typeof e !== 'object') continue;
        const mine = o.l[id];
        if (!mine || (e.t || 0) > (mine.t || 0)) {
          const v = String(e.v || '').trim().slice(0, MAX_LABEL_LEN);
          if (!v) { if (mine) { delete o.l[id]; changed = true; } continue; }
          o.l[id] = { v, t: e.t || Date.now() };
          changed = true;
        }
      }
      if (changed) _write(o);
      return changed;
    },

    raw() { return _all(); },
  };
}
