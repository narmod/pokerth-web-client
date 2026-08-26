// ═══════════════════════════════════════════════════════════════════
// Private messages — modal dialogue (parity: QML "Messages privés").
//
// Layout follows the QML window one for one: header with the envelope
// icon, the title, a red bin (delete the selected conversation) and the
// close cross; a strip of conversation partners below it; the message
// history; and a footer with a 128-character input, a live counter and
// the Send button.
//
// The dialogue is persistent, not a popup: closing it keeps every
// conversation, and reopening restores exactly what was on screen. The
// history itself lives in ../pm/store.mjs (IndexedDB).
//
// Why the lobby only: the server refuses a private message whose target
// sits at a running table (ServerLobbyThread::HandleNetPacketChatRequest),
// so a conversation is by construction a lobby activity. The entry points
// are therefore the lobby header, the player list and the player popup.
// ═══════════════════════════════════════════════════════════════════

import { S } from '../game/state.mjs';
import { MSG } from '../net/messages.mjs';
import { send } from '../net/session.mjs';
import { t } from '../i18n.mjs';
import * as store from '../pm/store.mjs';

const MAX_BYTES = 128;   // server-side chat limit, same as the lobby input

let _current = '';       // selected partner, '' when nothing is selected

function $(id) { return document.getElementById(id); }

function _esc(s) {
  return String(s).replace(/[<>&"]/g, function (c) {
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
  });
}

// t() with an inline fallback: a missing key must never render as the key
// itself in a dialogue the player reads.
function _tt(k, fb, params) {
  try {
    const v = t(k, params);
    return (v && v !== k) ? v : fb;
  } catch (e) { return fb; }
}

// UTF-8 length, so the counter matches what the server actually measures.
function _bytes(s) {
  try { return new TextEncoder().encode(s).length; } catch (e) { return s.length; }
}

// Truncate at a character boundary until the UTF-8 form fits (parity:
// the `while (text.toUtf8().size() > 128) text.chop(1)` loop in QML).
function _fit(s) {
  let out = String(s);
  while (out.length && _bytes(out) > MAX_BYTES) out = out.slice(0, -1);
  return out;
}

function _time(ts) {
  try {
    const d = new Date(ts);
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  } catch (e) { return ''; }
}

// ── Header badge (every .pm-unread instance, as forumnews.mjs does) ─────

function refreshBadge() {
  const n = store.unreadCount();
  try {
    document.querySelectorAll('.pm-unread').forEach(function (el) {
      el.textContent = n > 99 ? '99+' : String(n);
      el.style.display = n > 0 ? '' : 'none';
    });
  } catch (e) {}
}

// ── Rendering ──────────────────────────────────────────────────────────

function _renderPartners() {
  const strip = $('pm-partners');
  if (!strip) return;
  const list = store.partners();
  if (!list.length) {
    strip.innerHTML = '<span class="pm-nopart">' + _esc(_tt('pmEmpty', 'No conversations yet.')) + '</span>';
    return;
  }
  strip.innerHTML = list.map(function (p) {
    const badge = p.unread
      ? '<span class="pm-pbadge">' + (p.unread > 99 ? '99+' : p.unread) + '</span>'
      : '';
    return '<button type="button" class="pm-partner' + (p.name === _current ? ' active' : '') + '"'
      + ' data-name="' + _esc(p.name) + '">' + _esc(p.name) + badge + '</button>';
  }).join('');
  try {
    strip.querySelectorAll('.pm-partner').forEach(function (b) {
      b.addEventListener('click', function () { select(b.getAttribute('data-name')); });
    });
  } catch (e) {}
}

function _renderConversation() {
  const box = $('pm-msgs');
  if (!box) return;
  if (!_current) {
    box.innerHTML = '<div class="pm-hint">' + _esc(_tt('pmNoConv', 'Select a conversation.')) + '</div>';
    return;
  }
  const msgs = store.conversation(_current);
  if (!msgs.length) {
    box.innerHTML = '<div class="pm-hint">' + _esc(_tt('pmNoMsg', 'No messages yet.')) + '</div>';
    return;
  }
  box.innerHTML = msgs.map(function (m) {
    const who = m.mine ? (S.myName || _tt('pmMe', 'Me')) : _current;
    return '<div class="pm-line' + (m.mine ? ' mine' : '') + '">'
      + '<span class="pm-ts">[' + _time(m.ts) + ']</span> '
      + '<b class="pm-who">' + _esc(who) + ':</b> '
      + '<span class="pm-text">' + _esc(m.text) + '</span></div>';
  }).join('');
  try { box.scrollTop = box.scrollHeight; } catch (e) {}
}

function _renderCounter() {
  const inp = $('pm-in'), cnt = $('pm-count'), btn = $('pm-send');
  if (!inp) return;
  const n = _bytes(inp.value);
  if (cnt) cnt.textContent = n + '/' + MAX_BYTES;
  if (btn) btn.disabled = !_current || !inp.value.trim();
  const del = $('pm-del');
  if (del) del.disabled = !_current;
}

function _render() {
  _renderPartners();
  _renderConversation();
  const nm = $('pm-partner-name');
  if (nm) nm.textContent = _current || '';
  _renderCounter();
  refreshBadge();
}

// ── Open / close / select ──────────────────────────────────────────────

function select(name) {
  _current = name || '';
  if (_current) store.markRead(_current);
  _render();
  const inp = $('pm-in');
  if (inp) { try { inp.focus(); } catch (e) {} }
}

// Above the _winGate threshold the dialogue becomes a real window --
// draggable by its title, resizable, position remembered -- exactly like
// the ranking and forum windows. Below it, it stays a centred modal.
function _winGateOk() {
  try { return !!(window._winGate && window._winGate() && typeof window._enableFloating === 'function'); }
  catch (e) { return false; }
}

// Open on a given partner, creating the conversation if it does not exist
// yet (parity: ensurePrivateConversation when the dialogue is opened from
// the player list).
function open(name) {
  const modal = $('pm-modal');
  if (!modal) return;
  store.ready().then(function () {
    if (name) {
      store.ensure(name).then(function () { select(name); });
    } else {
      // No partner given (header button): fall back to the most recent
      // conversation, or none if the player never exchanged a message.
      const list = store.partners();
      select(list.length ? list[0].name : '');
    }
    // 'flex' rather than '' : the container centres its card with flexbox,
    // and an empty string would fall back to the element default (block),
    // which drops the card into the document flow.
    // z-order.mjs watches #pm-modal and brings it to the front on its own
    // when it becomes visible; nothing to raise by hand here.
    modal.style.display = 'flex';
    const card = modal.querySelector('.rk-card');
    if (card && _winGateOk()) {
      modal.classList.add('rk-floating');
      try {
        window._enableFloating(card, {
          handle: $('pm-title'), resizable: true,
          maxW: Math.min(680, Math.round(window.innerWidth * 0.92)),
          maxH: Math.min(680, Math.round(window.innerHeight * 0.90)),
          zoom: true, key: 'pth-pm-win', defW: 420, defH: 520,
          minW: 300, minH: 300, defLeft: 110, defTop: 110
        });
      } catch (e) {}
    }
  });
}

function close() {
  const modal = $('pm-modal');
  if (!modal) return;
  const card = modal.querySelector('.rk-card');
  if (card && card.classList.contains('floating-win') && typeof window._disableFloating === 'function') {
    try { window._disableFloating(card); } catch (e) {}
  }
  modal.classList.remove('rk-floating');
  modal.style.display = 'none';
}

function toggle() {
  const modal = $('pm-modal');
  if (modal && modal.style.display !== 'none') close();
  else open('');
}

// ── Sending ────────────────────────────────────────────────────────────

// Resolve a nickname to the lobby player id. Names are unique per session
// on the server, so the lobby snapshot is authoritative (parity:
// parsePrivateMessageTarget, which scans the player list model).
function playerIdByName(name) {
  if (!name) return 0;
  try {
    const players = S.players || {};
    const keys = Object.keys(players);
    for (let i = 0; i < keys.length; i++) {
      if (players[keys[i]] === name) return parseInt(keys[i], 10) || 0;
    }
  } catch (e) {}
  return 0;
}

// Is that player sitting at a RUNNING table? The server refuses a private
// message in exactly that case (ServerLobbyThread::HandleNetPacketChatRequest
// checks `tmpGame->IsRunning()`), and its refusal carries no reason -- a bare
// ChatRejectMessage looks the same whether the target is playing, gone, or we
// are a guest. We know the game modes locally (netGameStarted = 2), so the
// check is done here: the player gets the precise wording the desktop client
// shows instead of a guess, and no message is written to the history that was
// never going to arrive.
function _atRunningTable(pid) {
  try {
    const games = S.games || {};
    for (const id in games) {
      const g = games[id];
      if (g && g.mode === 2 && g.seats && g.seats.indexOf(pid) !== -1) return true;
    }
  } catch (e) {}
  return false;
}

// Messages sent but not yet known to have been accepted. The server stays
// silent on success and answers ChatRejectMessage on failure, so an entry
// that is never matched simply expires.
const _pending = [];

function _pendAdd(name, text) {
  _pending.push({ name: name, text: text, at: Date.now() });
  // Anything older than 30 s was accepted (or the connection is long gone).
  const cut = Date.now() - 30000;
  while (_pending.length && _pending[0].at < cut) _pending.shift();
}

// Called from onChatReject. Returns true when the rejected text was one of
// our private messages, so the caller can skip the generic chat warning.
function onReject(text) {
  for (let i = _pending.length - 1; i >= 0; i--) {
    if (_pending[i].text !== text) continue;
    const name = _pending[i].name;
    _pending.splice(i, 1);
    store.dropLast(name, text).then(function () {
      if (_current === name) _renderConversation();
      _renderPartners();
    });
    try {
      if (window.showToast) window.showToast(_tt('pmRejected', 'The private message could not be delivered.'), { tone: 'error', icon: '\u26a0', duration: 5000 });
    } catch (e) {}
    return true;
  }
  return false;
}

// Send to a nickname. Returns an error key when it could not be sent, so
// both the modal and the /msg command report the same wording.
function sendTo(name, text) {
  const msg = _fit(String(text || '').trim());
  if (!name || !msg) return 'empty';
  const pid = playerIdByName(name);
  if (!pid) return 'notFound';
  if (pid === S.myId) {
    // The server would happily bounce it back to us, but a conversation
    // with oneself is not something the desktop client can produce.
    return 'self';
  }
  if (_atRunningTable(pid)) return 'atTable';
  let ok = false;
  try { ok = send(MSG.buildPrivateChat(pid, msg)); } catch (e) { ok = false; }
  if (!ok) return 'offline';
  _pendAdd(name, msg);
  // The server does not echo our own private messages back, so the sent
  // line exists only because we persist it here (parity:
  // pushPrivateMessageSentLine).
  store.append(name, msg, true).then(function () {
    if (_current === name) _renderConversation();
    _renderPartners();
  });
  return '';
}

function _errText(code, name) {
  if (code === 'notFound') return _tt('pmNotFound', 'Player not found');
  if (code === 'atTable')  return _tt('pmAtTable', 'Private messages are not available at the table.');
  if (code === 'offline')  return _tt('pmOffline', 'Not connected to server');
  if (code === 'self')     return _tt('pmSelf', 'You cannot send a private message to yourself.');
  return '';
}

function _doSend() {
  const inp = $('pm-in');
  if (!inp || !_current) return;
  const code = sendTo(_current, inp.value);
  if (code) {
    if (code !== 'empty') {
      try { if (window.showToast) window.showToast(_errText(code), { tone: 'error', icon: '\u26a0', duration: 4000 }); } catch (e) {}
    }
    return;
  }
  inp.value = '';
  _renderCounter();
}

// ── Incoming message (called from msg-social.mjs) ───────────────────────

function onIncoming(name, text) {
  if (!name || !text) return;
  store.ready().then(function () {
    store.append(name, text, false).then(function () {
      // An open dialogue on that partner counts as read straight away —
      // the player is looking at the message.
      const modal = $('pm-modal');
      const visible = modal && modal.style.display !== 'none';
      if (visible && _current === name) store.markRead(name).then(_render);
      else _render();
    });
  });
}

// ── Delete the selected conversation ───────────────────────────────────

function deleteCurrent() {
  if (!_current) return;
  const name = _current;
  const q = _tt('pmDeleteConfirm', 'Delete the conversation with ' + name + '?', { name: name });
  let go = true;
  try { go = window.confirm(q); } catch (e) {}
  if (!go) return;
  store.remove(name).then(function () {
    const list = store.partners();
    _current = list.length ? list[0].name : '';
    _render();
  });
}

// ── Wiring ─────────────────────────────────────────────────────────────

function _init() {
  const inp = $('pm-in');
  if (inp) {
    inp.addEventListener('input', function () {
      // Hard cap in UTF-8 bytes: maxlength counts UTF-16 units, which lets
      // an emoji-heavy line through that the server would then reject.
      if (_bytes(inp.value) > MAX_BYTES) inp.value = _fit(inp.value);
      _renderCounter();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); _doSend(); }
    });
  }
  const btn = $('pm-send');
  if (btn) btn.addEventListener('click', _doSend);
  const del = $('pm-del');
  if (del) del.addEventListener('click', deleteCurrent);
  const cls = $('pm-close');
  if (cls) cls.addEventListener('click', close);
  const bd = $('pm-backdrop');
  if (bd) bd.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    const m = $('pm-modal');
    if (m && m.style.display !== 'none') close();
  });
  store.ready().then(refreshBadge);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
  else _init();
}

// Legacy bridge: the inline handlers in pokerth-client.html and the row
// buttons built in pokerth.js are classic script, not modules.
if (typeof window !== 'undefined') {
  window.openPmModal   = open;
  window.closePmModal  = close;
  window.togglePmModal = toggle;
  window._pmOnIncoming = onIncoming;
  window._pmSendTo     = sendTo;
  window._pmOnReject   = onReject;
  window._pmBadge      = refreshBadge;
  window._pmPlayerId   = playerIdByName;
}

export { open, close, toggle, select, sendTo, onIncoming, onReject,
         refreshBadge, playerIdByName, deleteCurrent };
