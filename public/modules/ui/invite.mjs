// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/invite.mjs — « Inviter des amis » share dialog (web).
//
// Opened by App.shareTableLink() (pokerth.js) instead of jumping straight
// to the native share sheet. One place to hand the invite link to a friend
// outside the app:
//   · QR code (scan across the room — vendored qrcode-generator, lazy-loaded)
//   · the link itself + a Copy button (delegates to App._copyInviteUrl so
//     clipboard fallbacks stay in ONE place)
//   · shortcut buttons: WhatsApp / Telegram / e-mail / SMS (plain deep links,
//     no SDK, opened in a new tab / the OS handler)
//   · native share sheet button when navigator.share exists (phones)
//
// The dialog markup lives in pokerth-client.html (#invite-dialog, same
// ld-card family as the other confirmation dialogs); this module only
// fills it and wires the buttons. The password is NEVER part of the link
// (see shareTableLink) — nothing here changes that.
// ─────────────────────────────────────────────────────────────────────────

let _qrModPromise = null;   // lazy import of the vendored generator
let _curUrl = '';
let _curName = '';

function _t(k, fb) {
  try { return (window.t ? window.t(k) : null) || fb || k; } catch (e) { return fb || k; }
}

function _el(id) { return document.getElementById(id); }

// Draw the QR into #inv-qr-canvas. Error level M, auto version, quiet zone
// of 4 modules (spec minimum). Crisp on retina: backing store scaled by dpr.
async function _drawQr(url) {
  const cv = _el('inv-qr-canvas');
  if (!cv) return;
  try {
    if (!_qrModPromise) _qrModPromise = import('../../vendor/qrcode.mjs');
    const qrcode = (await _qrModPromise).default;
    const qr = qrcode(0, 'M');
    qr.addData(url, 'Byte');
    qr.make();
    const n = qr.getModuleCount();
    const quiet = 4;
    const cssSize = 190;                       // rendered size (px, CSS)
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const px = Math.floor((cssSize * dpr) / (n + quiet * 2)) || 1;
    const size = px * (n + quiet * 2);
    cv.width = size; cv.height = size;
    cv.style.width = cssSize + 'px'; cv.style.height = cssSize + 'px';
    const ctx = cv.getContext('2d');
    // White background incl. quiet zone — scanners need the contrast even
    // on dark themes, so the canvas is always white-on-black.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++)
        if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * px, (r + quiet) * px, px, px);
    cv.style.display = '';
  } catch (e) {
    // QR is decoration on top of the link — never block the dialog on it.
    try { cv.style.display = 'none'; } catch (e2) {}
  }
}

function _shareText() {
  // Human line above the URL in messengers / e-mail. Reuse the invited-
  // banner sentence so it is already translated in all 40 languages.
  return _t('invitedBanner', 'You are invited to join the table') + ' \u00ab ' + _curName + ' \u00bb';
}

function open(url, name) {
  _curUrl = String(url || '');
  _curName = String(name || '');
  const dlg = _el('invite-dialog');
  if (!dlg) { // markup missing (very old cached HTML) — old behaviour
    if (window.App && window.App._copyInviteUrl) window.App._copyInviteUrl(_curUrl);
    return;
  }
  const nm = _el('inv-table-name'); if (nm) nm.textContent = _curName;
  const li = _el('inv-link');       if (li) li.textContent = _curUrl;
  // Native share button only where the API exists (phones mostly).
  const nb = _el('inv-share-native');
  if (nb) nb.style.display = (navigator.share ? '' : 'none');
  // Belt and braces: force the critical overlay styles inline so the
  // dialog is visible and centred even under a stale cached stylesheet
  // that predates the #invite-dialog rules.
  dlg.style.position = 'fixed';
  dlg.style.inset = '0';
  dlg.style.zIndex = '1300';
  dlg.style.alignItems = 'center';
  dlg.style.justifyContent = 'center';
  dlg.style.background = 'rgba(0,0,0,0.7)';
  dlg.style.display = 'flex';
  _drawQr(_curUrl);
}

function close() {
  const dlg = _el('invite-dialog');
  if (dlg) dlg.style.display = 'none';
}

function copy() {
  if (window.App && window.App._copyInviteUrl) window.App._copyInviteUrl(_curUrl);
}

function shareNative() {
  if (!navigator.share) return;
  navigator.share({ title: 'PokerTH', text: _shareText(), url: _curUrl })
    .catch(function () { /* AbortError = user closed the sheet — fine */ });
}

function _openWin(u) {
  try { window.open(u, '_blank', 'noopener'); } catch (e) { try { window.location.href = u; } catch (e2) {} }
}

function shareWhatsApp() {
  _openWin('https://wa.me/?text=' + encodeURIComponent(_shareText() + '\n' + _curUrl));
}

function shareTelegram() {
  _openWin('https://t.me/share/url?url=' + encodeURIComponent(_curUrl) + '&text=' + encodeURIComponent(_shareText()));
}

function shareEmail() {
  // mailto: must navigate in the SAME context — window.open gives a blank
  // tab on several mobile browsers.
  try {
    window.location.href = 'mailto:?subject=' + encodeURIComponent('PokerTH — ' + _curName) +
      '&body=' + encodeURIComponent(_shareText() + '\n\n' + _curUrl);
  } catch (e) {}
}

function shareSms() {
  // iOS wants `sms:&body=`, Android `sms:?body=` — historical divergence.
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const body = encodeURIComponent(_shareText() + '\n' + _curUrl);
  try { window.location.href = iOS ? ('sms:&body=' + body) : ('sms:?body=' + body); } catch (e) {}
}

window.InviteUI = { open, close, copy, shareNative, shareWhatsApp, shareTelegram, shareEmail, shareSms };
