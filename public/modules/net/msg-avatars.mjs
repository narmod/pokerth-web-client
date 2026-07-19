// ═══════════════════════════════════════════════════════════════════
// Handlers réseau — avatars PokerTH (AvatarRequest/Header/Data/End,
// UnknownAvatar) — chantier ESM #9g-C1 (pilote de l'éclatement de
// handleMsg). Chaque fonction = le corps EXACT de l'ancienne case du
// switch (signature (sub) ; `T` = MSG.T importé, `break` retiré).
// Adaptations : send (session.mjs), Proto, MSG, _pthAssembleDataUrl/
// _pthCachePut (avatar-cache.mjs), renderGames (lobby.mjs) importés ;
// window._pthMyUpload / window._renderSeats / window.refreshMyAvatar
// étaient déjà qualifiés. Upload sortant : réponse chunkée 256 o
// (MAX_FILE_DATA_SIZE) au protocole AvatarHeader→Data→End.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { Proto } from './proto.mjs';
import { MSG } from './messages.mjs';
import { send } from './session.mjs';
import { _pthAssembleDataUrl, _pthCachePut } from './avatar-cache.mjs';
import { renderGames } from '../ui/lobby.mjs';

const T = MSG.T;

function onAvatarRequest(sub) {
  const reqId = Proto.u32(sub, 1);
  const want = Proto.raw(sub, 2);
  const up = (typeof window !== 'undefined') ? window._pthMyUpload : null;
  const ok = up && up.hashBytes && up.bytes && up.bytes.length && want &&
             want.length === up.hashBytes.length &&
             up.hashBytes.every(function(b, i) { return b === want[i]; });
  if (ok) {
    send(Proto.encode([[1, 0, T.AvatarHeader], [9, 2,
      Proto.encode([[1, 0, reqId], [2, 0, up.type || 1], [3, 0, up.bytes.length]])]]));
    const CK = 256; // MAX_FILE_DATA_SIZE
    for (let o = 0; o < up.bytes.length; o += CK) {
      const part = up.bytes.slice(o, Math.min(o + CK, up.bytes.length));
      send(Proto.encode([[1, 0, T.AvatarData], [10, 2,
        Proto.encode([[1, 0, reqId], [2, 2, part]])]]));
    }
    send(Proto.encode([[1, 0, T.AvatarEnd], [11, 2, Proto.encode([[1, 0, reqId]])]]));
  } else {
    send(Proto.encode([[1, 0, T.UnknownAvatar], [12, 2, Proto.encode([[1, 0, reqId]])]]));
  }
}

function onAvatarHeader(sub) {
  const reqId = Proto.u32(sub, 1);
  const avType = Proto.u32(sub, 2);
  const size = Proto.u32(sub, 3);
  const hashHex = S._pthAvatarReqIdToHash[reqId];
  const entry = hashHex ? S._pthAvatarsByHash[hashHex] : null;
  if (entry) {
    entry.expectedSize = size;
    // Server may correct the type vs what PlayerInfoReply said
    if (avType) entry.type = avType;
  }
}

function onAvatarData(sub) {
  const reqId = Proto.u32(sub, 1);
  const block = Proto.raw(sub, 2); // Uint8Array of this chunk
  const hashHex = S._pthAvatarReqIdToHash[reqId];
  const entry = hashHex ? S._pthAvatarsByHash[hashHex] : null;
  if (entry && block) {
    entry.chunks.push(block);
    entry.received += block.length;
  }
}

function onAvatarEnd(sub) {
  const reqId = Proto.u32(sub, 1);
  const hashHex = S._pthAvatarReqIdToHash[reqId];
  const entry = hashHex ? S._pthAvatarsByHash[hashHex] : null;
  if (entry) {
    entry.status = 'done';
    // ── Step 3: assemble chunks into a Data URL, cache it,
    // free the chunk buffers, then trigger a re-render so the
    // freshly arrived image appears at the table.
    try {
      const dataUrl = _pthAssembleDataUrl(entry.chunks, entry.type);
      S._pthDataUrls[hashHex] = dataUrl;
      _pthCachePut(hashHex, entry.type, dataUrl);
      // Release chunk references so the GC can reclaim them.
      entry.chunks = [];
    } catch(e) {
      console.warn('[pth-avatar] assembly failed for hash=' + hashHex, e);
      entry.status = 'error';
    }
  }
  // Re-render: seats around the table + my own seat in the bar.
  if (typeof window._renderSeats === 'function') window._renderSeats();
  if (typeof window.refreshMyAvatar === 'function') window.refreshMyAvatar();
  // Rafraîchir aussi un panneau « joueurs à cette table » ouvert.
  if (S._openTables.size) renderGames();
  if (hashHex) delete S._pthAvatarReqIdToHash[reqId];
}

function onUnknownAvatar(sub) {
  const reqId = Proto.u32(sub, 1);
  const hashHex = S._pthAvatarReqIdToHash[reqId];
  const entry = hashHex ? S._pthAvatarsByHash[hashHex] : null;
  if (entry) {
    entry.status = 'unknown';
  }
  if (hashHex) delete S._pthAvatarReqIdToHash[reqId];
}

export { onAvatarRequest, onAvatarHeader, onAvatarData, onAvatarEnd,
         onUnknownAvatar };

for (const [k, v] of Object.entries({ onAvatarRequest, onAvatarHeader,
  onAvatarData, onAvatarEnd, onUnknownAvatar })) window[k] = v;
