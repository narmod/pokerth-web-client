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
// Partner whose dialogue is open but with whom nothing has been exchanged
// yet. It shows in the strip so there is somewhere to type, but it is never
// written to disk: a conversation only exists once a message is actually
// sent or received. Without this, opening a dialogue out of curiosity left a
// permanent empty entry behind, and the strip filled up with every player
// whose envelope had ever been clicked.
let _draft = '';

// Translations already fetched in this session, keyed by the original text.
// The conversation is rebuilt from scratch on every new message, so without
// this cache a bubble translated a moment ago would silently revert.
const _pmTr = new Map();

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

// Same rule as privateMessageDisplayTime upstream: bare time for today,
// day and month prefixed for anything older. A conversation resumed days
// later needs the date; today's does not.
function _time(ts) {
  try {
    const d = new Date(ts);
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    const hm = p(d.getHours()) + ':' + p(d.getMinutes());
    const now = new Date();
    const sameDay = d.getFullYear() === now.getFullYear()
                 && d.getMonth() === now.getMonth()
                 && d.getDate() === now.getDate();
    return sameDay ? hm : (p(d.getDate()) + '.' + p(d.getMonth() + 1) + '. ' + hm);
  } catch (e) { return ''; }
}

// Below this card width the partner column gives way to a drop-down
// (parity: wideLayout, PrivateMessageDialog.qml).
const WIDE_MIN = 430;

function _isWide() {
  try {
    const card = document.querySelector('#pm-modal .rk-card');
    return !card || card.offsetWidth > WIDE_MIN;
  } catch (e) { return true; }
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
  const sel   = $('pm-partner-select');
  if (!strip) return;
  const list = store.partners();
  // The draft sits at the front until it earns a place of its own.
  if (_draft && !list.some(function (p) { return p.name === _draft; })) {
    list.unshift({ name: _draft, unread: 0, last: 0, lastText: '', fromMe: false });
  }
  // The column stays put as soon as there is a conversation at all, which is
  // a deliberate step away from upstream: PrivateMessageDialog.qml hides it
  // below two entries (`wideLayout && partners.length > 1`), so the dialogue
  // changes shape under the player as soon as a second partner writes in. A
  // column of one costs a strip of window and buys a layout that never moves.
  // The drop-down of the narrow layout keeps the upstream rule: a picker with
  // a single choice really is useless, and the name already shows above the
  // history.
  const wide = _isWide();
  const showCol  = wide && list.length > 0;
  const showDrop = !wide && list.length > 1;
  strip.style.display = showCol ? '' : 'none';
  if (sel) sel.style.display = showDrop ? '' : 'none';

  if (showDrop && sel) {
    sel.innerHTML = list.map(function (p) {
      const lbl = p.unread ? (p.name + ' (' + p.unread + ')') : p.name;
      return '<option value="' + _esc(p.name) + '"'
        + (p.name === _current ? ' selected' : '') + '>' + _esc(lbl) + '</option>';
    }).join('');
  }
  if (!showCol) return;

  strip.innerHTML = list.map(function (p) {
    const badge = p.unread
      ? '<span class="pm-pbadge">' + (p.unread > 9 ? '9+' : p.unread) + '</span>'
      : '';
    // History outlives a session, so a partner may well have left the lobby.
    // Dimming them says so before the player types a message that cannot be
    // delivered.
    const off = playerIdByName(p.name) ? '' : ' off';
    // One line of the last message under the name, so a busy inbox can be
    // read at a glance without opening each conversation in turn.
    const prev = p.lastText
      ? '<span class="pm-plast">' + _esc(p.lastText) + '</span>'
      : '';
    return '<button type="button" class="pm-partner' + (p.name === _current ? ' active' : '') + off + '"'
      + ' title="' + _esc(off ? _tt('pmOfflinePartner', 'Not in the lobby at the moment') : p.name) + '"'
      + ' data-name="' + _esc(p.name) + '">'
      + '<span class="pm-pmain"><span class="pm-pname' + (p.unread ? ' unread' : '') + '">'
      + _esc(p.name) + '</span>' + prev + '</span>' + badge + '</button>';
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
  // Bubbles rather than chat lines: mine on the right and tinted, the other
  // side left and plain, timestamp inside at the bottom (parity: the
  // conversation delegate in PrivateMessageDialog.qml). The sender name is
  // redundant in a two-person thread, so it is dropped.
  // Translation globe, same mechanics as the lobby and game chat: incoming
  // bubbles only, revealed on hover (or on tap when there is no pointer),
  // handled by the shared window._chatTranslate. Harvest what is on screen
  // first so translations survive the rebuild.
  try {
    box.querySelectorAll('.pm-line[data-tr-text]').forEach(function (el) {
      _pmTr.set(el.getAttribute('data-orig') || '', {
        text: el.getAttribute('data-tr-text') || '',
        shown: el.getAttribute('data-tr-shown') === '1'
      });
    });
  } catch (e) {}
  const trL = _tt('chatTranslateBtn', 'Translate');
  box.innerHTML = msgs.map(function (m) {
    const cached = m.mine ? null : _pmTr.get(m.text);
    const shown  = !!(cached && cached.shown && cached.text);
    // data-orig-html is escaped twice on purpose: the attribute has to carry
    // the *markup* of the untranslated bubble so the toggle can restore it.
    const attrs = m.mine ? '' : (' data-orig="' + _esc(m.text) + '"'
      + (cached && cached.text
          ? ' data-tr-text="' + _esc(cached.text) + '"'
            + ' data-tr-shown="' + (shown ? '1' : '0') + '"'
            + ' data-orig-html="' + _esc(_esc(m.text)) + '"'
          : ''));
    const btn = m.mine ? '' : ('<button class="chat-tr-btn' + (shown ? ' tr-active' : '')
      + '" title="' + _esc(trL) + '" data-i18n-title="chatTranslateBtn"'
      + ' aria-label="' + _esc(trL) + '"'
      + ' onclick="window._chatTranslate(this)">\u{1F310}</button>');
    return '<div class="pm-line' + (m.mine ? ' mine' : '') + '"' + attrs + '>'
      + '<span class="pm-bub">'
      + '<span class="pm-text">' + _esc(shown ? cached.text : m.text) + '</span>'
      + '<span class="pm-bfoot"><span class="pm-ts">' + _esc(_time(m.ts)) + '</span>'
      + btn + '</span>'
      + '</span></div>';
  }).join('');
  try { box.scrollTop = box.scrollHeight; } catch (e) {}
}

function _renderCounter() {
  const inp = $('pm-in'), cnt = $('pm-count'), btn = $('pm-send');
  if (!inp) return;
  // A notice replaces the input whenever nothing can be sent at all, rather
  // than letting the player type a message that would be refused (parity:
  // the guest / atTable notice above the input in PrivateMessageDialog.qml).
  const guest = _amGuest(), mine = _meAtRunningTable();
  const pguest = _partnerIsGuest(playerIdByName(_current));
  const note = $('pm-note');
  if (note) {
    const txt = mine ? _tt('pmAtTable', 'Private messages are not available at the table.')
              : guest ? _tt('pmGuest', 'Guests cannot send chat messages')
              : pguest ? _tt('pmPartnerGuest', 'Guests cannot receive private messages.')
              : '';
    note.textContent = txt;
    note.style.display = txt ? '' : 'none';
  }
  const blocked = guest || mine || pguest;
  inp.disabled = blocked || !_current;
  const n = _bytes(inp.value);
  if (cnt) cnt.textContent = n + '/' + MAX_BYTES;
  if (btn) btn.disabled = blocked || !_current || !inp.value.trim();
  const del = $('pm-del');
  if (del) del.disabled = !_current;
}

function _render() {
  _renderPartners();
  _renderConversation();
  const nm = $('pm-partner-name');
  if (nm) nm.textContent = _current || _tt('pmNoConv', 'No conversation yet');
  // "not in the lobby" next to the active name: the partner is stored but
  // absent, so nothing can be sent to them right now (parity: the muted
  // label beside the partner name upstream).
  const off = $('pm-offlbl');
  if (off) off.style.display = (_current && !playerIdByName(_current)) ? '' : 'none';
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
      // Not persisted: the dialogue is a draft until a message travels.
      _draft = name;
      select(name);
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
          // Opening size mirrors the QML dialogue, which is
          // `Math.min(parent.width * 0.92, 600)` by `Math.min(parent.height *
          // 0.85, 520)`. It used to open at 420, i.e. just under the WIDE_MIN
          // threshold of 430, so the partner column could never show itself on
          // a freshly opened window however many conversations were waiting.
          zoom: true, key: 'pth-pm-win',
          defW: Math.max(320, Math.min(600, Math.round(window.innerWidth * 0.92))),
          defH: Math.max(300, Math.min(520, Math.round(window.innerHeight * 0.85))),
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
  _draft = '';
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

// Am I myself sitting at a running table? Upstream blocks private messages
// there on purpose -- `atRunningTable` in PrivateMessageDialog.qml, with the
// reasoning spelled out as collusion prevention ("Absprachen"): two players
// at the same table must not be able to talk out of sight. The server would
// not deliver them anyway, but the block is ours to make, not its.
function _meAtRunningTable() {
  try { return !!(S.amInGame && S._gameStarted); } catch (e) { return false; }
}

// Guests cannot chat at all (the server drops every ChatRequest from them),
// so upstream hides the envelope entirely and shows a notice instead of the
// input (`canSendPm` requires `!isMyPlayerGuest`).
function _amGuest() {
  try { return S._currentLoginMode === 'guest'; } catch (e) { return false; }
}

// Is the PARTNER a guest? Guests are refused every ChatRequest by the server,
// which means they can neither send nor receive a private message -- writing to
// one is shouting into a void. Upstream added the check in `985a64bd`
// (`partnerIsGuest` in PrivateMessageDialog.qml): the history stays readable,
// but the input is closed and a notice says why.
//
// The rights come from PlayerInfoReply field 3 (netPlayerRightsGuest = 1),
// already stored in S._playerRights by msg-lobby.mjs -- a PlayerInfoRequest is
// fired for every player entering the lobby, so the flag is there by the time a
// conversation can be opened. Unknown rights (0) are treated as not-guest: a
// missing reply must not lock a conversation with a registered player.
function _partnerIsGuest(pid) {
  if (!pid) return false;   // absent from the lobby: nothing to tell
  try { return S._playerRights[pid] === 1; } catch (e) { return false; }
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
  if (_amGuest()) return 'guest';
  if (_partnerIsGuest(pid)) return 'partnerGuest';
  if (_meAtRunningTable()) return 'meAtTable';
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
  if (code === 'atTable' || code === 'meAtTable')
    return _tt('pmAtTable', 'Private messages are not available at the table.');
  if (code === 'guest')    return _tt('pmGuest', 'Guests cannot send chat messages');
  if (code === 'partnerGuest')
    return _tt('pmPartnerGuest', 'Guests cannot receive private messages.');
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
  if (_draft === name) _draft = '';
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
  const sel = $('pm-partner-select');
  if (sel) sel.addEventListener('change', function () { select(sel.value); });
  // The card is resizable in floating mode, so the wide/narrow decision has
  // to follow the card, not the viewport.
  try {
    const card = document.querySelector('#pm-modal .rk-card');
    if (card && typeof ResizeObserver === 'function') {
      let wasWide = null;
      new ResizeObserver(function () {
        const w = _isWide();
        if (w === wasWide) return;   // only re-render when the mode flips
        wasWide = w;
        _renderPartners();
      }).observe(card);
    }
  } catch (e) {}
  const cls = $('pm-close');
  if (cls) cls.addEventListener('click', close);
  const bd = $('pm-backdrop');
  if (bd) bd.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    const m = $('pm-modal');
    if (m && m.style.display !== 'none') close();
  });
  store.ready().then(function () {
    // Versions up to 2.1.7-web.94 wrote an empty conversation as soon as a
    // dialogue was opened; clear those out once, on load.
    return store.prune().then(refreshBadge);
  });
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
