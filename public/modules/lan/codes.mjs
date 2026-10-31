// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lan/codes.mjs — « Play nearby »: handing a connection code over
// (web extension, no QML counterpart; narmod 2026-10-31).
//
// A connection code (signal.mjs) travels from one phone to the other in one of
// three ways, all built on the same LINK to this client:
//     https://<client>/#lan-offer=<code>      (host → guest)
//     https://<client>/#lan-answer=<code>     (guest → host)
//   · a QR code of the link — scanned with the in-app scanner (qr-scan.mjs)
//     or with the phone's own camera app, which simply opens the link;
//   · the system share sheet (AirDrop, Quick Share, a messenger…) or, without
//     one, the clipboard;
//   · pasted by hand: readCode() accepts the link, the bare code, or any text
//     that contains either (a messenger may add words around a link).
// A link opened in a NEW tab while the game runs in another one is passed to
// that tab by link-relay.mjs.
//
// No strings shown to players live here: the UI (step 4) brings its own,
// translated, and passes titles/texts in.
// ─────────────────────────────────────────────────────────────────────────

import { decodePayload, KIND, SignalError } from './signal.mjs';

export const LINK_KEY = Object.freeze({ offer: 'lan-offer', answer: 'lan-answer' });
const KEY_RE = /(?:^|[#&?\s])(lan-offer|lan-answer)=([A-Za-z0-9_-]{20,600})/;
const BARE_RE = /^[A-Za-z0-9_-]{60,600}$/;

/** The client's own address, without hash or query. */
export function clientBase() {
  try { return location.origin + location.pathname; } catch (e) { return ''; }
}

/**
 * The link carrying a code.
 * @param {string} code @param {'offer'|'answer'} kind @param {string} [base]
 */
export function codeLink(code, kind, base) {
  return (base || clientBase()) + '#' + LINK_KEY[kind] + '=' + code;
}

/**
 * Find a connection code in a link, a bare code, or free text, and check it.
 * Throws SignalError('bad-code') when there is none or it is damaged.
 * @param {string} text
 * @returns {{ code: string, kind: 'offer'|'answer', info: ReturnType<typeof decodePayload> }}
 */
export function readCode(text) {
  const s = String(text || '').trim();
  let code = '';
  const m = KEY_RE.exec(s);
  if (m) code = m[2];
  else {
    // A bare code, possibly wrapped over several lines by a messenger.
    const flat = s.replace(/\s+/g, '');
    if (BARE_RE.test(flat)) code = flat;
  }
  if (!code) throw new SignalError('bad-code', 'no connection code found');
  const info = decodePayload(code);
  const kind = info.kind === KIND.offer ? 'offer' : 'answer';
  if (m && LINK_KEY[kind] !== m[1]) throw new SignalError('wrong-kind', 'link key does not match the code');
  return { code, kind, info };
}

/** The code carried by the page address, if any (no throw). */
export function codeFromLocation() {
  try { return location.hash && KEY_RE.test(location.hash) ? readCode(location.hash) : null; } catch (e) { return null; }
}
/** Drop the code from the address bar once used (a reload must not replay it). */
export function clearCodeFromLocation() {
  try {
    if (location.hash && KEY_RE.test(location.hash)) history.replaceState(history.state, '', location.pathname + location.search);
  } catch (e) {}
}

// ── QR code ────────────────────────────────────────────────────────────────
let _qrMod = null;
/**
 * QR modules for a text (error level M, auto version), via the vendored
 * generator already used by the table invite.
 * @param {string} text
 * @returns {Promise<{ size: number, dark: (r: number, c: number) => boolean }>}
 */
export async function qrMatrix(text, ecc) {
  if (!_qrMod) _qrMod = import('../../vendor/qrcode.mjs');
  const qrcode = (await _qrMod).default;
  // Level L by default: a code shown on one screen and read by another camera
  // is never torn or stained, and L means fewer, larger modules (version 10
  // instead of 11 for a usual link) — what a phone camera reads best (web.352).
  const qr = qrcode(0, ecc === 'M' || ecc === 'Q' || ecc === 'H' ? ecc : 'L');
  qr.addData(String(text), 'Byte');
  qr.make();
  return { size: qr.getModuleCount(), dark: (r, c) => qr.isDark(r, c) };
}

/**
 * Draw a QR code on a canvas: black on white whatever the theme (scanners need
 * the contrast), 4-module quiet zone, sharp on high-density screens: a whole
 * number of device pixels per module, and the canvas shown at exactly its own
 * size (no resampling that would blur the module edges; web.352).
 * @param {HTMLCanvasElement} canvas @param {string} text @param {number} [cssSize] @param {string} [ecc]
 */
export async function drawQr(canvas, text, cssSize, ecc) {
  const m = await qrMatrix(text, ecc);
  const quiet = 4, css = cssSize || 240;
  const dpr = (typeof devicePixelRatio === 'number' && devicePixelRatio > 0) ? devicePixelRatio : 1;
  const px = Math.max(1, Math.floor((css * dpr) / (m.size + quiet * 2)));
  const size = px * (m.size + quiet * 2);
  canvas.width = size; canvas.height = size;
  canvas.style.width = (size / dpr) + 'px'; canvas.style.height = (size / dpr) + 'px';
  canvas.style.imageRendering = 'pixelated';
  const ctx = canvas.getContext('2d');
  if (!ctx) return m;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';
  for (let r = 0; r < m.size; r++) for (let c = 0; c < m.size; c++) if (m.dark(r, c)) ctx.fillRect((c + quiet) * px, (r + quiet) * px, px, px);
  return m;
}

// ── share / copy ───────────────────────────────────────────────────────────
/** @param {string} text */
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const done = document.execCommand('copy'); ta.remove(); return !!done;
  } catch (e) { return false; }
}

/**
 * Hand a link over with the system share sheet, else copy it.
 * @param {string} link @param {{ title?: string, text?: string }} [o]
 * @returns {Promise<'shared'|'cancelled'|'copied'|'failed'>}
 */
export async function shareLink(link, o) {
  o = o || {};
  const data = { title: o.title || '', text: o.text || '', url: link };
  const nav = /** @type {any} */ (typeof navigator !== 'undefined' ? navigator : null);
  if (nav && typeof nav.share === 'function' && (!nav.canShare || nav.canShare(data))) {
    try { await nav.share(data); return 'shared'; }
    catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  }
  return (await copyText(link)) ? 'copied' : 'failed';
}
