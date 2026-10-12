// ── lobby-typechat.mjs — lobby: typing outside a field writes in the chat ───
//
// Web addition (forum request, 12/10/2026): in the lobby, a printable key
// pressed while no text field has the focus goes straight into the lobby
// chat input — no need to click it first. The QML client has nothing like
// it (its chat must be clicked first).
//
// Lobby only, never at the table: there, single keys are actions (re-bindable
// Fold/Call/Raise/All-In letters, Space = Call, 1/2/3 = quick bets) and a word
// typed without the focus could fold a hand.
//
// Left alone: modifier combos (Alt/Ctrl/Meta shortcuts, except AltGr which
// types characters like @ or € on many layouts), IME composition, text
// fields, keys aimed at an open window, and Space on a focused button or row
// (Space activates it). A dead key (^, ¨ …) only moves the focus, so the
// browser composes the accented letter in the chat field itself.
//
// Advanced option lobby_type_chat (Chat section), on by default; it also
// follows the admin kill switch through window._advGet.

// Kind of element the key was aimed at.
//   'body'     — nothing focused (document body / root)
//   'editable' — a text field, textarea, select or contenteditable
//   'outside'  — an element outside the lobby screen (a window, a menu…)
//   'lobby'    — any other element of the lobby screen (button, row, list…)
export function targetKind(t, lobbyEl) {
  if (!t || t.nodeType !== 1) return 'body';
  var doc = t.ownerDocument;
  if (doc && (t === doc.body || t === doc.documentElement)) return 'body';
  var tag = (t.tagName || '').toLowerCase();
  if (tag === 'textarea' || tag === 'select' || t.isContentEditable === true) return 'editable';
  if (tag === 'input') {
    var ty = (t.type || 'text').toLowerCase();
    if (['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file', 'image'].indexOf(ty) < 0) return 'editable';
  }
  if (!lobbyEl || !lobbyEl.contains(t)) return 'outside';
  return 'lobby';
}

// Pure decision. ev: the keydown fields; ctx: { enabled, lobbyActive,
// overlay, inputReady, target }. Returns 'insert' (type the key into the
// chat), 'focus' (only move the focus there) or null (leave the key alone).
export function typeChatAction(ev, ctx) {
  if (!ctx || !ctx.enabled || !ctx.lobbyActive || ctx.overlay || !ctx.inputReady) return null;
  if (!ev || ev.defaultPrevented || ev.isComposing || ev.keyCode === 229) return null;
  if ((ev.ctrlKey || ev.altKey || ev.metaKey) && !ev.altGraph) return null;
  if (ctx.target !== 'body' && ctx.target !== 'lobby') return null;
  var k = ev.key;
  if (k === 'Dead') return 'focus';
  if (typeof k !== 'string' || Array.from(k).length !== 1) return null;   // named keys: Tab, Enter, F1…
  if (/[\u0000-\u001f\u007f]/.test(k)) return null;
  if (k === ' ' && ctx.target !== 'body') return null;                   // Space activates the focused control
  return 'insert';
}

function _visible(el) {
  if (!el || el.hidden || el.disabled || el.readOnly) return false;
  var st;
  try { st = window.getComputedStyle(el); } catch (e) { return false; }
  if (st.display === 'none' || st.visibility === 'hidden') return false;
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function _enabled() {
  try { if (typeof window._advGet === 'function') return window._advGet('lobby_type_chat', true); } catch (e) {}
  return true;
}

// Types ch at the end of the field, as the browser would, within maxlength.
export function insertInto(inp, ch) {
  var max = inp.maxLength > 0 ? inp.maxLength : Infinity;
  if (inp.value.length + ch.length > max) return false;
  var end = inp.value.length;
  if (typeof inp.setRangeText === 'function') inp.setRangeText(ch, end, end, 'end');
  else inp.value += ch;
  try { inp.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
  return true;
}

// opts: { lobbyId = 's-lobby', inputId = 'chat-in' }
export function bindLobbyTypeChat(opts) {
  opts = opts || {};
  var lobbyId = opts.lobbyId || 's-lobby';
  var inputId = opts.inputId || 'chat-in';
  document.addEventListener('keydown', function (e) {
    var lobby = document.getElementById(lobbyId);
    var inp = document.getElementById(inputId);
    var overlay = false;
    try { overlay = typeof window.keynavHasOpenSurface === 'function' && !!window.keynavHasOpenSurface(); } catch (err) {}
    var altGraph = false;
    try { altGraph = typeof e.getModifierState === 'function' && e.getModifierState('AltGraph'); } catch (err) {}
    var act = typeChatAction({
      key: e.key, ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, altGraph: altGraph,
      isComposing: e.isComposing, keyCode: e.keyCode, defaultPrevented: e.defaultPrevented
    }, {
      enabled: _enabled(),
      lobbyActive: !!(lobby && lobby.classList.contains('active')),
      overlay: overlay,
      inputReady: !!inp && _visible(inp),
      target: targetKind(e.target, lobby)
    });
    if (!act) return;
    try { inp.focus(); } catch (err) { return; }
    if (act === 'focus') {                      // dead key: the browser composes in the field
      try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (err) {}
      return;
    }
    e.preventDefault();
    insertInto(inp, e.key);
  });
}
