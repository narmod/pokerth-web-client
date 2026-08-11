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

// ── Decode-bomb guard (mirror of upstream PR pokerth#521) ──────────────
// A tiny PNG/GIF/JPEG file can DECLARE huge dimensions (e.g. 20000x20000);
// handing it to <img> makes the browser allocate the full bitmap — enough
// to kill an iOS Safari tab. Sniff the declared dimensions from the file
// header BEFORE any browser decode and refuse anything above 1 Mpx (same
// cap as upstream MAX_AVATAR_PIXELS). Unknown formats are refused too,
// like upstream IsValidAvatarFileType.
const PTH_AV_MAX_PIXELS = 1024 * 1024;

function _pthImageDimsSafe(b) {
  try {
    if (!b || b.length < 12) return false;
    let w = 0, h = 0;
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) {
      // PNG: IHDR width/height, big-endian 32-bit at offsets 16/20.
      if (b.length < 24) return false;
      w = ((b[16] << 24) | (b[17] << 16) | (b[18] << 8) | b[19]) >>> 0;
      h = ((b[20] << 24) | (b[21] << 16) | (b[22] << 8) | b[23]) >>> 0;
    } else if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) {
      // GIF: logical screen width/height, little-endian 16-bit at 6/8.
      w = b[6] | (b[7] << 8);
      h = b[8] | (b[9] << 8);
    } else if (b[0] === 0xFF && b[1] === 0xD8) {
      // JPEG: walk the segments to the first SOF frame header.
      let p = 2;
      while (p < b.length) {
        while (p < b.length && b[p] === 0xFF) p++;
        if (p >= b.length) return false;
        const m = b[p++];
        if (m === 0x00 || m === 0x01 || m === 0xD8 || m === 0xD9) continue;
        if (m === 0xDA) return false; // start of scan before any frame header
        if (p + 2 > b.length) return false;
        const seg = (b[p] << 8) | b[p + 1];
        p += 2;
        if (seg < 2 || seg - 2 > b.length - p) return false;
        const sof = (m >= 0xC0 && m <= 0xC3) || (m >= 0xC5 && m <= 0xC7) ||
                    (m >= 0xC9 && m <= 0xCB) || (m >= 0xCD && m <= 0xCF);
        if (sof) {
          if (seg < 7) return false;
          h = (b[p + 1] << 8) | b[p + 2];
          w = (b[p + 3] << 8) | b[p + 4];
          break;
        }
        p += seg - 2;
      }
      if (!w || !h) return false;
    } else {
      return false;
    }
    return w > 0 && h > 0 && w * h <= PTH_AV_MAX_PIXELS;
  } catch (e) { return false; }
}

// Same check, starting from a data: URL (AVATARIMG relay path).
function _pthDataUrlDimsSafe(dataUrl) {
  try {
    const i = dataUrl.indexOf(';base64,');
    if (i < 0) return false;
    const bin = atob(dataUrl.slice(i + 8));
    const b = new Uint8Array(bin.length);
    for (let k = 0; k < bin.length; k++) b[k] = bin.charCodeAt(k);
    return _pthImageDimsSafe(b);
  } catch (e) { return false; }
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
  // Refuse decode bombs before the browser ever sees the image
  // (declared dimensions capped at 1 Mpx — see _pthImageDimsSafe above).
  if (!_pthImageDimsSafe(merged)) throw new Error('unsafe avatar dimensions');
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
export { _pthLoadLruList, _pthSaveLruList, _pthCacheGet, _pthCachePut, _pthAssembleDataUrl, _pthImageDimsSafe, _pthDataUrlDimsSafe };
if (typeof window !== 'undefined') {
  window._pthLoadLruList = _pthLoadLruList;
  window._pthSaveLruList = _pthSaveLruList;
  window._pthCacheGet = _pthCacheGet;
  window._pthCachePut = _pthCachePut;
  window._pthAssembleDataUrl = _pthAssembleDataUrl;
  window._pthImageDimsSafe = _pthImageDimsSafe;
  window._pthDataUrlDimsSafe = _pthDataUrlDimsSafe;
  window.AvatarCache = { get: _pthCacheGet, put: _pthCachePut, assemble: _pthAssembleDataUrl };
}
