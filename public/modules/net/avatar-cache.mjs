// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/net/avatar-cache.mjs
//
// Cache LRU des avatars pokerth.net en localStorage (plafond 200 entrées,
// ~1 Mo) : clés pthAv:<hashHex> = '<type>|<dataUrl>' + liste LRU
// pthAv:_lru ; éviction au-delà du plafond, retry après éviction de moitié
// sur quota dépassé, abandon silencieux sinon. _pthAssembleDataUrl concatène
// les chunks Uint8Array d'AvatarData en data:URL (btoa par lots de 4096
// pour éviter le débordement de pile de String.fromCharCode).
//
// Historique : extrait de l'IIFE App de public/pokerth.js (étape 9c du plan
// docs/ESM_PLAN.md), au verbatim modulo dédentation. L'état en mémoire
// (_pthAvatarsByHash, _pthDataUrls…) et _pthAvatarFor restent dans l'App :
// ce module est la couche PERSISTANCE, pure localStorage — testable en node.
// ─────────────────────────────────────────────────────────────────────────

// LRU cache in localStorage (Q3=B, capped at 200 entries).
// Keys:
//   pthAv:<hashHex>  -> '<typeNum>|<dataUrl>'   (one entry per avatar)
//   pthAv:_lru       -> JSON array of hashHex, most-recent first
// 200 entries * ~5KB ~= 1MB which is comfortable within 5MB quota.
const PTH_AV_MAX = 200;
const PTH_AV_KEY = function(h) { return 'pthAv:' + h; };
const PTH_AV_LRU_KEY = 'pthAv:_lru';

function _pthLoadLruList() {
  try {
    const raw = localStorage.getItem(PTH_AV_LRU_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch(e) { return []; }
}
function _pthSaveLruList(list) {
  try { localStorage.setItem(PTH_AV_LRU_KEY, JSON.stringify(list)); }
  catch(e) { /* quota -- best-effort */ }
}
function _pthCacheGet(hashHex) {
  try {
    const raw = localStorage.getItem(PTH_AV_KEY(hashHex));
    if (!raw) return null;
    const i = raw.indexOf('|');
    if (i < 0) return null;
    const type = parseInt(raw.slice(0, i), 10) || 1;
    const dataUrl = raw.slice(i + 1);
    // Touch LRU: move this hash to the front.
    let lru = _pthLoadLruList().filter(function(h){ return h !== hashHex; });
    lru.unshift(hashHex);
    _pthSaveLruList(lru);
    return { type: type, dataUrl: dataUrl };
  } catch(e) { return null; }
}
function _pthCachePut(hashHex, type, dataUrl) {
  try {
    localStorage.setItem(PTH_AV_KEY(hashHex), type + '|' + dataUrl);
    let lru = _pthLoadLruList().filter(function(h){ return h !== hashHex; });
    lru.unshift(hashHex);
    // Evict oldest beyond cap.
    while (lru.length > PTH_AV_MAX) {
      const drop = lru.pop();
      try { localStorage.removeItem(PTH_AV_KEY(drop)); } catch(e) {}
    }
    _pthSaveLruList(lru);
  } catch(e) {
    // Quota exceeded or storage disabled. Try to evict half the cache
    // and retry once. If it still fails, just give up silently --
    // the avatar will simply be re-downloaded next time.
    try {
      let lru = _pthLoadLruList();
      const evictCount = Math.max(1, Math.floor(lru.length / 2));
      for (let i = 0; i < evictCount && lru.length > 0; i++) {
        const drop = lru.pop();
        try { localStorage.removeItem(PTH_AV_KEY(drop)); } catch(e2) {}
      }
      _pthSaveLruList(lru);
      localStorage.setItem(PTH_AV_KEY(hashHex), type + '|' + dataUrl);
      lru.unshift(hashHex);
      _pthSaveLruList(lru);
    } catch(e3) { /* really give up */ }
  }
}

// Concatenate the per-request Uint8Array chunks and convert to a
// data: URL the browser can render directly as <img src>.
function _pthAssembleDataUrl(chunks, type) {
  let total = 0;
  for (let i = 0; i < chunks.length; i++) total += chunks[i].length;
  const merged = new Uint8Array(total);
  let off = 0;
  for (let i = 0; i < chunks.length; i++) {
    merged.set(chunks[i], off);
    off += chunks[i].length;
  }
  // btoa needs a binary string. Build it in batches to avoid the
  // "Maximum call stack size exceeded" trap on String.fromCharCode(...arr).
  let bin = '';
  const STEP = 4096;
  for (let i = 0; i < merged.length; i += STEP) {
    const slice = merged.subarray(i, Math.min(i + STEP, merged.length));
    bin += String.fromCharCode.apply(null, slice);
  }
  const mime = type === 2 ? 'image/jpeg' : type === 3 ? 'image/gif' : 'image/png';
  return 'data:' + mime + ';base64,' + btoa(bin);
}

// ─── Exports ES + alias legacy ───────────────────────────────────────────
export { _pthLoadLruList, _pthSaveLruList, _pthCacheGet, _pthCachePut, _pthAssembleDataUrl };
if (typeof window !== 'undefined') {
  window._pthLoadLruList = _pthLoadLruList;
  window._pthSaveLruList = _pthSaveLruList;
  window._pthCacheGet = _pthCacheGet;
  window._pthCachePut = _pthCachePut;
  window._pthAssembleDataUrl = _pthAssembleDataUrl;
  window.AvatarCache = { get: _pthCacheGet, put: _pthCachePut, assemble: _pthAssembleDataUrl };
}
