// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/nearby.mjs — « 👥 Play nearby », player side
// (web extension, no QML counterpart; narmod 2026-10-31).
//
// Several people in one room play together with no Internet and no server:
// one phone HOSTS (its tab runs lan/local-server.mjs: lobby, one table, bots,
// the evening scoreboard), the others JOIN it peer-to-peer over the local
// Wi-Fi (lan/rtc-link.mjs). Design note: claude/CONCEPTION_LAN_LOCAL.md.
//
// Where it shows: an entry « 👥 Play nearby » of the LAN server list
// (ui/lan-directory.mjs), unless the admin switched it off (`nearby_play`)
// or the browser has no WebRTC. Picking it swaps the Connect button for
// « Host a game » / « Join a game ».
//
//   Host:  App.connect() through an in-page socket (window._nearbyConnect,
//          read by the socket branch of App.connect) → the usual lobby.
//          « Add a player » (lobby header, game menu) shows the invitation
//          QR code / share / copy, then reads the guest's answer (scanner,
//          paste, or a link opened in another tab — lan/link-relay.mjs).
//   Guest: scan / paste / open the host's code → show the answer → when the
//          link is up, App.connect() with that socket → the host's lobby.
//          A dropped link brings the join dialog back (seat kept 2 minutes
//          by the host, resumed through the client's usual rejoin path).
//
// The client treats the session as a LAN one, except: no family leaderboard
// push and no lifetime stats (msg-lobby.mjs), the leaderboard views show the
// host's evening scoreboard instead (game/stats.mjs, message type 240), and
// no automatic reconnection (pokerth.js _closeIsTerminal).
// ─────────────────────────────────────────────────────────────────────────

import { featureOff } from '../feature-off.mjs';

const SEL_KEY = 'pth_nearby_sel';

function _t(k, p, fb) {
  try { const s = window.t ? window.t(k, p) : null; return (s && s !== k) ? s : (fb || k); } catch (e) { return fb || k; }
}
function $(id) { return document.getElementById(id); }
function _build() { return String(window.BUILD_VERSION || ''); }
function _nick() { const n = /** @type {HTMLInputElement|null} */ ($('nick')); return n ? n.value.trim() : ''; }

let _mods = null;
function mods() {
  if (!_mods) _mods = Promise.all([
    import('../lan/local-server.mjs'), import('../lan/pipe-socket.mjs'), import('../lan/rtc-link.mjs'),
    import('../lan/codes.mjs'), import('../lan/qr-scan.mjs'), import('../lan/link-relay.mjs'),
  ]).then(([ls, ps, rtc, codes, scan, relay]) => ({ ls, ps, rtc, codes, scan, relay }));
  return _mods;
}

const st = {
  role: '',              // '' | 'host' | 'guest'
  srv: null,             // LocalServer (host)
  slot: 0,               // invitation counter (host)
  inv: null,             // pending invitation (host)
  guest: null,           // pending / current link (guest)
  scan: null,            // running camera scan
  relayStop: null,       // link-relay listener (host)
  wake: null,            // Wake Lock sentinel (host)
  dlgMode: '',           // 'add' | 'join' | 'board' | 'note' while the dialog is open
};

/** Can this page offer « Play nearby »? */
export function available() {
  if (featureOff('nearby_play')) return false;
  return typeof /** @type {any} */ (globalThis).RTCPeerConnection === 'function';
}
export function remembered() { try { return localStorage.getItem(SEL_KEY) === '1'; } catch (e) { return false; } }
export function remember(on) { try { if (on) localStorage.setItem(SEL_KEY, '1'); else localStorage.removeItem(SEL_KEY); } catch (e) {} }
export function isActive() { return !!st.role; }

function _setRole(role) {
  st.role = role;
  window._nearbyMode = role;
  try {
    document.body.classList.toggle('nb-on', !!role);
    document.body.classList.toggle('nb-host', role === 'host');
  } catch (e) {}
}

// ── dialog ────────────────────────────────────────────────────────────────
function _dialog(title, mode) {
  _closeDialog(true);
  let d = $('nb-dialog');
  if (!d) {
    d = document.createElement('div');
    d.id = 'nb-dialog';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'nb-title');
    d.innerHTML = '<div class="ld-card inv-card nb-card"><div class="ld-title inv-title"><span id="nb-title"></span>'
      + '<button type="button" class="inv-close" id="nb-close" aria-label="Close" title="Close">✕</button></div><div id="nb-body"></div></div>';
    document.body.appendChild(d);
    d.addEventListener('click', (e) => { if (e.target === d) closeDialog(); });
    const x = $('nb-close'); if (x) x.addEventListener('click', () => closeDialog());
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); closeDialog(); } });
  }
  const x = $('nb-close');
  if (x) { x.setAttribute('aria-label', _t('closeTooltip', null, 'Close')); x.title = _t('closeTooltip', null, 'Close'); }
  const tt = $('nb-title'); if (tt) tt.textContent = title;
  const body = $('nb-body'); if (body) body.textContent = '';
  d.style.display = 'flex';
  st.dlgMode = mode;
  return body;
}
function _stopScan() { if (st.scan) { try { st.scan.stop(); } catch (e) {} st.scan = null; } }
function _closeDialog(silent) {
  _stopScan();
  const d = $('nb-dialog'); if (d) d.style.display = 'none';
  const was = st.dlgMode; st.dlgMode = '';
  if (silent) return;
  // A pairing left unfinished is dropped.
  if (was === 'add' && st.inv && !st.inv.open) { try { st.inv.close(); } catch (e) {} st.inv = null; }
  if (was === 'join' && st.guest && !st.guest.linked) { try { st.guest.close(); } catch (e) {} st.guest = null; }
}
export function closeDialog() { _closeDialog(false); }

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
function _status(box, text, err) {
  box.textContent = text || '';
  box.classList.toggle('err', !!err);
}
function _errText(code) {
  if (code === 'version') return _t('nbErrVersion', null, 'The two phones do not have the same version of the app.');
  if (code === 'insecure' || code === 'no-camera' || code === 'camera-denied' || code === 'camera-error') return _t('nbErrCamera', null, 'Camera unavailable: paste the code instead.');
  if (code === 'lost' || code === 'timeout' || code === 'closed' || code === 'no-candidates' || code === 'unsupported') return _t('nbErrLink', null, 'No connection. Both phones must be on the same Wi-Fi (guest networks often block it).');
  return _t('nbErrCode', null, 'This code is not valid.');
}

// QR + Share + Copy for one link.
async function _codeBlock(box, link, caption) {
  const m = await mods();
  if (caption) box.appendChild(el('p', 'nb-step', caption));
  const cv = /** @type {HTMLCanvasElement} */ (el('canvas', 'inv-qr nb-qr'));
  box.appendChild(cv);
  try { await m.codes.drawQr(cv, link, 220); } catch (e) { cv.style.display = 'none'; }
  const row = el('div', 'inv-share nb-share');
  const note = el('div', 'nb-note');
  const share = el('button', 'inv-sbtn', _t('invShareVia', null, 'Share…'));
  share.type = 'button';
  share.addEventListener('click', async () => {
    const r = await m.codes.shareLink(link, { title: _t('nbEntry', null, 'Play nearby') });
    note.textContent = r === 'copied' ? '✓ ' + _t('invCopyLink', null, 'Copy link') : '';
  });
  const copy = el('button', 'inv-sbtn', _t('invCopyLink', null, 'Copy link'));
  copy.type = 'button';
  copy.addEventListener('click', async () => { note.textContent = (await m.codes.copyText(link)) ? '✓' : ''; });
  row.appendChild(share); row.appendChild(copy);
  box.appendChild(row); box.appendChild(note);
}

// Scanner + paste field; `onText(text)` gets what was read or typed.
function _readerBlock(box, caption, wantKind, onText) {
  if (caption) box.appendChild(el('p', 'nb-step', caption));
  const video = /** @type {HTMLVideoElement} */ (el('video', 'nb-video'));
  video.style.display = 'none';
  const scanBtn = el('button', 'inv-sbtn nb-scan', '📷 ' + _t('nbScan', null, 'Scan a code'));
  scanBtn.type = 'button';
  const status = el('div', 'nb-status');
  scanBtn.addEventListener('click', async () => {
    const m = await mods();
    _stopScan();
    video.style.display = '';
    st.scan = await m.scan.startScan(video, {
      accept: (t) => { try { return m.codes.readCode(t).kind === wantKind; } catch (e) { return false; } },
      onCode: (t) => { video.style.display = 'none'; onText(t); },
      onError: (c) => { video.style.display = 'none'; _status(status, _errText(c), true); },
    });
  });
  const row = el('div', 'inv-linkrow nb-paste');
  const inp = /** @type {HTMLInputElement} */ (el('input', 'inv-link nb-input'));
  inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false;
  inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocorrect', 'off');
  inp.placeholder = _t('nbPaste', null, 'Paste a code here');
  inp.setAttribute('aria-label', inp.placeholder);
  const ok = el('button', 'inv-sbtn inv-copy', 'OK');
  ok.type = 'button';
  const go = () => { if (inp.value.trim()) onText(inp.value); };
  ok.addEventListener('click', go);
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  inp.addEventListener('paste', () => setTimeout(go, 0));
  row.appendChild(inp); row.appendChild(ok);
  box.appendChild(scanBtn); box.appendChild(video); box.appendChild(row); box.appendChild(status);
  return status;
}

// ── host ──────────────────────────────────────────────────────────────────
function _beforeUnload(e) { if (st.role === 'host') { e.preventDefault(); e.returnValue = ''; return ''; } return undefined; }
async function _wakeLock() {
  try {
    const wl = /** @type {any} */ (navigator).wakeLock;
    if (wl && !st.wake) { st.wake = await wl.request('screen'); st.wake.addEventListener('release', () => { st.wake = null; }); }
  } catch (e) {}
}
function _onVisible() { if (document.visibilityState === 'visible' && st.role === 'host') _wakeLock(); }

/** « Host a game »: start the local server and log in to it. */
export async function host() {
  if (!available()) return;
  if (_nick().length < 3) { try { window.App.connect(); } catch (e) {} return; }   // the usual nickname message
  const m = await mods();
  if (!st.srv) {
    let pool = [];
    try { pool = (await import('../offline/index.mjs')).BOT_POOL || []; } catch (e) {}
    let skill = 'mixed';
    try { skill = localStorage.getItem('pth_offline_skill') || 'mixed'; } catch (e) {}
    st.srv = new m.ls.LocalServer({ botPool: pool, botSkill: skill });
  }
  _setRole('host');
  if (!st.relayStop) st.relayStop = m.relay.listenForCodes((found) => {
    if (found.kind !== 'answer' || st.dlgMode !== 'add' || !st.inv || found.info.slot !== st.inv.slot) return false;
    _acceptAnswer(found.code);
    return true;
  });
  window.addEventListener('beforeunload', _beforeUnload);
  document.addEventListener('visibilitychange', _onVisible);
  _wakeLock();
  const srv = st.srv;
  window._nearbyConnect = { take: () => m.ps.createLocalSocket(srv) };
  try { window.App.connect(); } catch (e) {}
}

let _addStatus = null;
async function _acceptAnswer(text) {
  const m = await mods();
  const status = _addStatus; if (!status || !st.inv) return;
  let found;
  try { found = m.codes.readCode(text); } catch (e) { _status(status, _errText(e && e.code), true); return; }
  if (found.kind !== 'answer' || found.info.slot !== st.inv.slot) { _status(status, _errText('bad-code'), true); return; }
  if (found.info.build !== _build()) { _status(status, _errText('version'), true); return; }
  _stopScan();
  try { await st.inv.accept(found.code); _status(status, _t('nbWait', null, 'Waiting for the other phone…')); }
  catch (e) { _status(status, _errText(e && e.code), true); }
}

/** « Add a player »: one invitation (QR / share / copy), then the guest's answer. */
export async function addPlayer() {
  if (st.role !== 'host' || !st.srv) return;
  const m = await mods();
  const body = _dialog(_t('nbAdd', null, 'Add a player'), 'add');
  if (!body) return;
  if (st.inv && !st.inv.open) { try { st.inv.close(); } catch (e) {} }
  st.inv = null;
  const wait = el('div', 'nb-status', '…'); body.appendChild(wait);
  st.slot = (st.slot % 65535) + 1;
  let inv;
  try {
    inv = await m.rtc.hostInvite(st.srv, {
      slot: st.slot, build: _build(), label: (window.PthState && window.PthState.myName) || _nick(),
      onState: (s, why) => {
        if (st.inv !== inv) return;
        if (s === 'open') {
          if (_addStatus) _status(_addStatus, '✓ ' + _t('nbConnected', null, 'Player connected.'));
          setTimeout(() => { if (st.dlgMode === 'add' && st.inv === inv) { st.inv = null; _closeDialog(true); } }, 1400);
        } else if (s === 'closed' && !inv.open && why !== 'host' && why !== 'server' && _addStatus && st.dlgMode === 'add') {
          _status(_addStatus, _errText(why), true);
        }
      },
    });
  } catch (e) { _status(wait, _errText(e && e.code), true); return; }
  if (st.dlgMode !== 'add') { inv.close(); return; }
  st.inv = inv;
  wait.remove();
  await _codeBlock(body, m.codes.codeLink(inv.payload, 'offer'), '1. ' + _t('nbHostStep1', null, 'The player scans this code, in the app or with the phone\'s camera.'));
  _addStatus = _readerBlock(body, '2. ' + _t('nbHostStep2', null, 'Then scan the code that appears on their screen.'), 'answer', (t) => _acceptAnswer(t));
}

// ── guest ─────────────────────────────────────────────────────────────────
/**
 * « Join a game »: read the host's code (or use `code`, from a link), answer.
 * @param {string} [code] @param {string} [notice] shown first (link lost…)
 */
export async function join(code, notice) {
  if (!available()) return;
  await mods();
  const body = _dialog(_t('nbJoin', null, 'Join a game'), 'join');
  if (!body) return;
  if (notice) body.appendChild(el('div', 'inv-warn nb-notice', notice));
  const status = _readerBlock(body, _t('nbGuestStep1', null, 'Scan the host\'s code, or paste it below.'), 'offer', (t) => _useOffer(t, body, status));
  if (code) _useOffer(code, body, status);
}
async function _useOffer(text, body, status) {
  const m = await mods();
  if (_nick().length < 3) { closeDialog(); try { window.App.connect(); } catch (e) {} return; }
  let found;
  try { found = m.codes.readCode(text); } catch (e) { _status(status, _errText(e && e.code), true); return; }
  if (found.kind !== 'offer') { _status(status, _errText('bad-code'), true); return; }
  if (found.info.build !== _build()) { _status(status, _errText('version'), true); return; }
  _stopScan();
  if (st.guest) { try { st.guest.close(); } catch (e) {} st.guest = null; }
  _status(status, '…');
  let g;
  try {
    g = await m.rtc.guestAnswer(found.code, { build: _build(), deferOpen: true, onLinked: () => _linked(g) });
  } catch (e) { _status(status, _errText(e && e.code), true); return; }
  if (st.dlgMode !== 'join') { g.close(); return; }
  st.guest = g;
  // Step 2 replaces the reader.
  body.textContent = '';
  if (found.info.label) body.appendChild(el('div', 'inv-table nb-host-name', '👥 ' + found.info.label));
  await _codeBlock(body, m.codes.codeLink(g.payload, 'answer'), _t('nbGuestStep2', null, 'Show this code to the host.'));
  body.appendChild(el('div', 'nb-status', _t('nbWait', null, 'Waiting for the other phone…')));
  // A link that dies before it is up: say so in the dialog.
  const sock = g.socket, prevClose = sock.onclose;
  sock.onclose = (ev) => {
    if (st.guest === g && !g.linked && st.dlgMode === 'join') {
      const s = /** @type {HTMLElement|null} */ (document.querySelector('#nb-body .nb-status'));
      if (s) _status(s, _errText(String((ev && ev.reason) || '').replace(/^nearby-/, '')), true);
    }
    if (typeof prevClose === 'function') prevClose(ev);
  };
}
function _linked(g) {
  if (st.guest !== g) return;
  _setRole('guest');
  window._nearbyConnect = { take: () => g.start() };
  _closeDialog(true);
  try { window.App.connect(); } catch (e) {}
}

/** The guest's link dropped (pokerth.js _closeIsTerminal): pair again. */
export function linkLost() {
  if (st.role === 'guest') {
    st.guest = null;
    join('', _t('nbLost', null, 'Connection to the host lost. Pair again within 2 minutes to keep your seat.'));
  }
}

/** App.disconnect(): the host stops the server, the guest hangs up. */
export function onDisconnect() {
  _closeDialog(false);
  if (st.inv) { try { st.inv.close(); } catch (e) {} st.inv = null; }
  if (st.guest) { try { st.guest.close(); } catch (e) {} st.guest = null; }
  if (st.srv) { try { st.srv.stop(); } catch (e) {} st.srv = null; }
  if (st.relayStop) { try { st.relayStop(); } catch (e) {} st.relayStop = null; }
  if (st.wake) { try { st.wake.release(); } catch (e) {} st.wake = null; }
  window.removeEventListener('beforeunload', _beforeUnload);
  document.removeEventListener('visibilitychange', _onVisible);
  window._nearbyConnect = null;
  window._nearbyBoardData = {};
  _setRole('');
}

// ── evening scoreboard (message type 240) ─────────────────────────────────
/** @param {any} sub decoded sub-message (field 1 = JSON snapshot) */
export function onScoreboard(sub) {
  let snap = null;
  try {
    const raw = sub && sub[1] && sub[1][0];
    const txt = raw instanceof Uint8Array ? new TextDecoder().decode(raw) : String(raw || '');
    snap = JSON.parse(txt);
  } catch (e) { return; }
  if (!snap || !Array.isArray(snap.rows)) return;
  const data = {};
  for (const r of snap.rows) if (r && typeof r.name === 'string') data[r.name] = r;
  window._nearbyBoardData = data;
  // The host sends it right after the lobby state: an empty table list is
  // then final (no « Loading tables… » left on screen).
  try {
    const S = /** @type {any} */ (window).PthState;
    if (S && !S.loaded) { S.loaded = true; if (typeof window.renderGames === 'function') window.renderGames(); }
  } catch (e) {}
  try {
    if ($('nb-board-body') && st.dlgMode === 'board') window.renderBoard('nb-board-body');
    if ($('stats-board-body')) window.renderBoard('stats-board-body');
  } catch (e) {}
}
export function openBoard() {
  if (!st.role) return;
  const body = _dialog(_t('nbScoreboard', null, 'Evening scoreboard'), 'board');
  if (!body) return;
  const box = el('div', 'stats-body nb-board'); box.id = 'nb-board-body';
  body.appendChild(box);
  try { window.renderBoard('nb-board-body'); } catch (e) {}
}

// ── links opened at start-up (#lan-offer= / #lan-answer=) ─────────────────
async function _bootLink() {
  if (!/#lan-(offer|answer)=/.test(location.hash || '')) return;
  if (!available()) return;
  const m = await mods();
  const found = m.codes.codeFromLocation();
  m.codes.clearCodeFromLocation();
  if (!found) return;
  // A game tab of this browser may be waiting for this very code.
  const took = await m.relay.relayCode(found);
  if (took) { const b = _dialog(_t('nbEntry', null, 'Play nearby'), 'note'); if (b) b.appendChild(el('p', 'nb-step', _t('nbRelayed', null, 'Code sent to your game. You can close this tab.'))); return; }
  if (found.kind !== 'offer') return;
  // Show the LAN form on « Play nearby », then the join dialog with the code.
  try {
    // The login screen's LAN card (pokerth-client.html loginPickMode): mode + step 2.
    const card = /** @type {HTMLElement|null} */ (document.querySelector('.login-card[onclick*="lan-dedi"]'));
    const sm = /** @type {HTMLSelectElement|null} */ ($('server-mode'));
    if (card && /** @type {any} */ (window).loginPickMode) /** @type {any} */ (window).loginPickMode(card, 'lan-dedi');
    else if (sm) { sm.value = 'lan-dedi'; sm.dispatchEvent(new Event('change', { bubbles: true })); }
  } catch (e) {}
  remember(true);
  try { if (window.LanDirUI && window.LanDirUI.sync) window.LanDirUI.sync(); } catch (e) {}
  join(found.code);
}

const api = { available, remembered, remember, isActive, host, join, addPlayer, closeDialog, linkLost, onDisconnect, onScoreboard, openBoard };
window.NearbyUI = api;
window._nearbyBoardData = window._nearbyBoardData || {};
try { if (window.LanDirUI && window.LanDirUI.sync) window.LanDirUI.sync(); } catch (e) {}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { _bootLink(); });
else setTimeout(() => { _bootLink(); }, 0);
export default api;
