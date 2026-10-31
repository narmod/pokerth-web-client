// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lan/qr-scan.mjs — « Play nearby »: in-app QR scanner
// (web extension, no QML counterpart; narmod 2026-10-31).
//
// Reads the other phone's connection QR code with the camera. The browser's
// own BarcodeDetector is used where it exists (Chrome on Android, ChromeOS,
// macOS); elsewhere (Safari / iOS, Firefox, Chrome on Linux / Windows) the
// vendored jsQR decoder (vendor/jsqr.mjs, loaded on demand, precached so it
// works offline) reads frames drawn on a canvas. The phone's own camera app
// remains an alternative: it opens the link (see codes.mjs, link-relay.mjs).
//
//   const scan = await startScan(videoEl, {
//     accept: (text) => …true when the text is the code we wait for…,
//     onCode: (text) => …, onError: (code) => …,   // codes below
//   });
//   scan.stop();
// Error codes: 'insecure' (no camera outside HTTPS), 'no-camera',
// 'camera-denied', 'camera-error'. The UI (step 4) words them.
// ─────────────────────────────────────────────────────────────────────────

let _jsqr = null;
/** The fallback decoder (vendored jsQR). */
export async function loadDecoder() {
  if (!_jsqr) _jsqr = import('../../vendor/jsqr.mjs').then(m => m.default);
  return _jsqr;
}

/**
 * Decode one frame with the fallback decoder.
 * @param {{ data: Uint8ClampedArray, width: number, height: number }} img RGBA pixels
 * @returns {Promise<string|null>}
 */
export async function decodeFrame(img) {
  const jsQR = await loadDecoder();
  const r = jsQR(img.data, img.width, img.height, { inversionAttempts: 'attemptBoth' });
  return r && r.data ? r.data : null;
}

/** Can this page use a camera at all? */
export function scanSupported() {
  const nav = /** @type {any} */ (typeof navigator !== 'undefined' ? navigator : null);
  return !!(nav && nav.mediaDevices && typeof nav.mediaDevices.getUserMedia === 'function');
}

async function _nativeDetector() {
  const BD = /** @type {any} */ (globalThis).BarcodeDetector;
  if (typeof BD !== 'function') return null;
  try {
    const f = typeof BD.getSupportedFormats === 'function' ? await BD.getSupportedFormats() : ['qr_code'];
    return f.includes('qr_code') ? new BD({ formats: ['qr_code'] }) : null;
  } catch (e) { return null; }
}

/**
 * Start the camera in `video` and look for a QR code until accepted or stopped.
 * @param {HTMLVideoElement} video
 * @param {{ accept?: (t: string) => boolean, onCode: (t: string) => void, onError?: (code: string) => void, intervalMs?: number }} o
 */
export async function startScan(video, o) {
  const onError = typeof o.onError === 'function' ? o.onError : () => {};
  const accept = typeof o.accept === 'function' ? o.accept : () => true;
  let stopped = false, timer = null, stream = null;
  const stop = () => {
    stopped = true; clearTimeout(timer);
    try { if (stream) stream.getTracks().forEach(t => t.stop()); } catch (e) {}
    try { video.pause(); video.srcObject = null; } catch (e) {}
  };
  const handle = { stop, get running() { return !stopped; } };
  if (typeof isSecureContext !== 'undefined' && !isSecureContext) { stopped = true; onError('insecure'); return handle; }
  if (!scanSupported()) { stopped = true; onError('no-camera'); return handle; }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' } } });
  } catch (e) {
    stopped = true;
    const n = e && e.name;
    onError(n === 'NotAllowedError' || n === 'SecurityError' ? 'camera-denied'
          : n === 'NotFoundError' || n === 'OverconstrainedError' ? 'no-camera' : 'camera-error');
    return handle;
  }
  if (stopped) { stop(); return handle; }
  video.setAttribute('playsinline', ''); video.muted = true;
  video.srcObject = stream;
  try { await video.play(); } catch (e) {}
  const native = await _nativeDetector();
  const canvas = native ? null : document.createElement('canvas');
  const ctx = canvas ? canvas.getContext('2d', { willReadFrequently: true }) : null;
  if (!native) { try { await loadDecoder(); } catch (e) { stop(); onError('camera-error'); return handle; } }
  const every = o.intervalMs || 200;
  const tick = async () => {
    if (stopped) return;
    let text = null;
    try {
      if (video.readyState >= 2 && video.videoWidth) {
        if (native) {
          const found = await native.detect(video);
          text = found && found[0] && found[0].rawValue || null;
        } else if (ctx && canvas) {
          // A frame at most 720 px wide: plenty for a phone held at arm's length.
          const sc = Math.min(1, 720 / video.videoWidth);
          canvas.width = Math.round(video.videoWidth * sc); canvas.height = Math.round(video.videoHeight * sc);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          text = await decodeFrame(ctx.getImageData(0, 0, canvas.width, canvas.height));
        }
      }
    } catch (e) {}
    if (stopped) return;
    if (text && accept(text)) { stop(); try { o.onCode(text); } catch (e) {} return; }
    timer = setTimeout(tick, every);
  };
  timer = setTimeout(tick, 0);
  return handle;
}
