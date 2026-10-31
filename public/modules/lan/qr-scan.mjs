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
//     onSeen: (text) => …,   // a QR code was read but not accepted
//   });
// Connection codes are dense (version 10, 57 modules): the camera is asked
// for a high resolution, and the fallback decoder alternates the whole frame
// with its centre read at full resolution (web.352: a phone held at arm's
// length gives only 3 pixels per module at the default 640 × 480).
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

/**
 * The part of a camera frame the fallback decoder reads on a given pass: even
 * passes the centre square at full resolution (a code held in the middle, its
 * modules as large as the camera gives them), odd passes the whole frame; at
 * most `max` pixels a side either way (jsQR's time grows with the area).
 * @param {number} w @param {number} h @param {number} pass @param {number} [max]
 */
export function frameRect(w, h, pass, max) {
  const cap = max || 1080;
  let sx = 0, sy = 0, sw = w, sh = h;
  if (pass % 2 === 0) { const s = Math.min(w, h); sx = Math.round((w - s) / 2); sy = Math.round((h - s) / 2); sw = sh = s; }
  const sc = Math.min(1, cap / Math.max(sw, sh));
  return { sx, sy, sw, sh, ow: Math.max(1, Math.round(sw * sc)), oh: Math.max(1, Math.round(sh * sc)) };
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
    stream = await navigator.mediaDevices.getUserMedia({ audio: false,
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
  } catch (e) {
    stopped = true;
    const n = e && e.name;
    onError(n === 'NotAllowedError' || n === 'SecurityError' ? 'camera-denied'
          : n === 'NotFoundError' || n === 'OverconstrainedError' ? 'no-camera' : 'camera-error');
    return handle;
  }
  if (stopped) { stop(); return handle; }
  // Continuous autofocus where the browser lets the page ask for it.
  try {
    const tr = stream.getVideoTracks()[0], caps = tr && tr.getCapabilities ? tr.getCapabilities() : null;
    if (caps && Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')) await tr.applyConstraints({ advanced: [/** @type {any} */ ({ focusMode: 'continuous' })] });
  } catch (e) {}
  video.setAttribute('playsinline', ''); video.muted = true;
  video.srcObject = stream;
  try { await video.play(); } catch (e) {}
  const native = await _nativeDetector();
  const canvas = native ? null : document.createElement('canvas');
  const ctx = canvas ? canvas.getContext('2d', { willReadFrequently: true }) : null;
  if (!native) { try { await loadDecoder(); } catch (e) { stop(); onError('camera-error'); return handle; } }
  const every = o.intervalMs || 200;
  const onSeen = typeof o.onSeen === 'function' ? o.onSeen : () => {};
  let pass = 0;
  const tick = async () => {
    if (stopped) return;
    let text = null;
    try {
      if (video.readyState >= 2 && video.videoWidth) {
        if (native) {
          const found = await native.detect(video);
          text = found && found[0] && found[0].rawValue || null;
        } else if (ctx && canvas) {
          const r = frameRect(video.videoWidth, video.videoHeight, pass++);
          canvas.width = r.ow; canvas.height = r.oh;
          ctx.drawImage(video, r.sx, r.sy, r.sw, r.sh, 0, 0, r.ow, r.oh);
          text = await decodeFrame(ctx.getImageData(0, 0, r.ow, r.oh));
        }
      }
    } catch (e) {}
    if (stopped) return;
    if (text && accept(text)) { stop(); try { o.onCode(text); } catch (e) {} return; }
    if (text) { try { onSeen(text); } catch (e) {} }
    timer = setTimeout(tick, every);
  };
  timer = setTimeout(tick, 0);
  return handle;
}
