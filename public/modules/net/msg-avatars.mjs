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

// Bounds of a legitimate avatar transfer, from upstream avatarmanager.h
// (MIN/MAX_AVATAR_FILE_SIZE). The server enforces them on upload and on the
// files it fetches itself, so no avatar it relays can fall outside this range.
// Upstream 0f700c4 ("Bound client avatar transfer size") stopped trusting the
// peer on the incoming side as well: an AvatarData stream that never ends, or
// one that announces 40 bytes and sends megabytes, used to grow the receiving
// buffer without limit. Same reasoning here, where the buffer is the tab's
// memory: the announced size is checked against these bounds, and the bytes
// that follow are checked against the announced size.
const MIN_AVATAR_FILE_SIZE = 32;
const MAX_AVATAR_FILE_SIZE = 30720;

// Abandons a transfer that broke its own announced size: the partial data is
// dropped before anything else so an invalid stream keeps nothing, and the
// requestId mapping goes with it, which makes every later AvatarData and the
// closing AvatarEnd no-ops for this request. The entry itself stays in
// _pthAvatarsByHash marked 'error', so the hash is not requested again for the
// rest of the session -- a stream that misbehaved once would misbehave again.
function _dropTransfer(entry, hashHex, reqId, why) {
  if (entry) {
    entry.chunks = [];
    entry.received = 0;
    entry.expectedSize = 0;
    entry.status = 'error';
  }
  if (hashHex) delete S._pthAvatarReqIdToHash[reqId];
  console.warn('[pth-avatar] transfer dropped (' + why + ') hash=' + hashHex);
}

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
    // The announced size is the budget for everything that follows, so it is
    // checked before it is stored -- exactly the range the server itself
    // applies when a client uploads (serverlobbythread.cpp HandleNetPacket-
    // AvatarHeader). Outside it, the transfer never starts.
    if (!(size >= MIN_AVATAR_FILE_SIZE && size <= MAX_AVATAR_FILE_SIZE)) {
      _dropTransfer(entry, hashHex, reqId, 'announced size ' + size);
      return;
    }
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
    // Data before a valid header has no budget to spend against, and a chunk
    // that would take the total past the announced size means the stream is
    // not what it said it was. Either way the transfer ends here instead of
    // growing the buffer (upstream clientthread.cpp StoreInTempAvatarFile).
    if (!entry.expectedSize ||
        entry.received + block.length > entry.expectedSize) {
      _dropTransfer(entry, hashHex, reqId,
        'chunk overruns ' + entry.received + '+' + block.length + ' > ' + entry.expectedSize);
      return;
    }
    entry.chunks.push(block);
    entry.received += block.length;
  }
}

function onAvatarEnd(sub) {
  const reqId = Proto.u32(sub, 1);
  const hashHex = S._pthAvatarReqIdToHash[reqId];
  const entry = hashHex ? S._pthAvatarsByHash[hashHex] : null;
  if (entry) {
    // A transfer that ends short of what it announced is incomplete, not
    // finished: assembling it would cache a truncated image under a hash that
    // no longer describes it. Upstream drops it the same way
    // (clientthread.cpp CompleteTempAvatarFile: the file never reaches the
    // avatar manager when the size does not match).
    if (entry.received !== entry.expectedSize) {
      _dropTransfer(entry, hashHex, reqId,
        'ended at ' + entry.received + ' of ' + entry.expectedSize);
      return;
    }
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
