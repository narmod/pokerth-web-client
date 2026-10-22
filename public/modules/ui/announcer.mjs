// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/announcer.mjs — game announcements (accessibility).
//
// WEB ADDITION. One entry point, announce(text, opts), for every spoken game
// event (player actions, your turn, the winner). The player picks where the
// text goes in the Accessibility window:
//   'off'   — nothing (default)
//   'voice' — the built-in voice: the browser's speech synthesis (media.mjs)
//   'sr'    — the player's screen reader (NVDA, JAWS, VoiceOver, TalkBack):
//             the text is written into a visually hidden ARIA live region
//             and the screen reader reads it with its own voice and speed.
// The two outputs are exclusive, so a screen-reader user never hears two
// voices talking over each other. No browser API tells a page that a screen
// reader is running, hence the explicit choice.
//
// Storage: pth_announce ('sr' only matters) + the historical pth_voice ('1' =
// built-in voice). pth_voice stays authoritative for the voice so the admin
// first-visit default, settings sync and older clients keep working:
//   pth_voice === '1'        → 'voice'
//   else pth_announce === 'sr' → 'sr'
//   else                     → 'off'
// A player who had the old "Voice" checkbox on therefore lands on
// "Built-in voice" with nothing to migrate.
// ─────────────────────────────────────────────────────────────────────────
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { speak } from './media.mjs';

const MODE_KEY = 'pth_announce';
const VOICE_KEY = 'pth_voice';
const MODES = ['off', 'voice', 'sr'];
const POLITE_KEEP = 6;   // past lines kept in the polite region

/** @param {string} key */
function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
/** @param {string} key @param {string} value */
function write(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

/** @returns {'off'|'voice'|'sr'} */
function getAnnounceMode() {
  if (read(VOICE_KEY) === '1') return 'voice';
  if (read(MODE_KEY) === 'sr') return 'sr';
  return 'off';
}

// ── Live regions (screen-reader output) ──────────────────────────────────
// Created on first use, directly under <body> so no aria-hidden ancestor
// (closed modal, hidden screen) can silence them. Polite lines are APPENDED
// (aria-relevant="additions"): each new event is read once, in order, even on
// a fast street. The assertive region carries the urgent "your turn" cue.
/** @type {HTMLElement|null} */ var _polite = null;
/** @type {HTMLElement|null} */ var _assertive = null;
var _assertiveTimer = 0;

/** @param {string} id @param {'polite'|'assertive'} level */
function _makeRegion(id, level) {
  var el = document.getElementById(id);
  if (el) return el;
  el = document.createElement('div');
  el.id = id;
  el.className = 'sr-announcer';
  el.setAttribute('aria-live', level);
  el.setAttribute('aria-atomic', level === 'assertive' ? 'true' : 'false');
  if (level === 'polite') { el.setAttribute('role', 'log'); el.setAttribute('aria-relevant', 'additions'); }
  // Inline fallback in case the stylesheet is not there yet: never visible,
  // never takes room, still in the accessibility tree (not display:none).
  el.style.cssText = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;'
    + 'overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0';
  (document.body || document.documentElement).appendChild(el);
  return el;
}
function _regions() {
  if (!_polite || !_polite.isConnected) _polite = _makeRegion('sr-announce-polite', 'polite');
  if (!_assertive || !_assertive.isConnected) _assertive = _makeRegion('sr-announce-assertive', 'assertive');
}

/** @param {string} text @param {boolean} urgent */
function _toScreenReader(text, urgent) {
  try {
    _regions();
    if (urgent && _assertive) {
      // Empty first, fill on the next tick: the same text twice in a row
      // ("Your turn" on two streets) must still be announced.
      var a = _assertive;
      a.textContent = '';
      clearTimeout(_assertiveTimer);
      _assertiveTimer = setTimeout(function () { a.textContent = text; }, 60);
      return;
    }
    if (!_polite) return;
    var line = document.createElement('div');
    line.textContent = text;
    _polite.appendChild(line);
    while (_polite.childNodes.length > POLITE_KEEP) _polite.removeChild(_polite.firstChild);
  } catch (e) {}
}

/**
 * Announce a game event in the mode the player chose.
 * @param {string} text
 * @param {{ urgent?: boolean }} [opts] urgent: the "your turn" cue — cuts the
 *   built-in voice's backlog / uses the assertive region.
 */
function announce(text, opts) {
  if (!text) return;
  var urgent = !!(opts && opts.urgent);
  var mode = getAnnounceMode();
  if (mode === 'voice') { S._voiceEnabled = true; speak(String(text), urgent ? { interrupt: true } : undefined); }
  else if (mode === 'sr') _toScreenReader(String(text), urgent);
}

function _stopVoice() {
  S._speakQ = []; S._curU = null; S._speaking = false;
  try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) {}
}

// ── Controls ─────────────────────────────────────────────────────────────
function syncAnnounceControls() {
  var mode = getAnnounceMode();
  try {
    document.querySelectorAll('input[name="announce-mode"]').forEach(function (input) {
      /** @type {HTMLInputElement} */ (input).checked = /** @type {HTMLInputElement} */ (input).value === mode;
    });
    // Hidden header twin (historical 🗣️/🤐 button).
    var vb = document.getElementById('voice-toggle-btn');
    if (vb) vb.textContent = (mode === 'voice' ? '🗣️' : '🤐');
  } catch (e) {}
}

/**
 * @param {string} mode 'off' | 'voice' | 'sr'
 * @param {{ silent?: boolean }} [opts] silent: no confirmation (reset).
 */
function setAnnounceMode(mode, opts) {
  var m = MODES.indexOf(mode) >= 0 ? mode : 'off';
  var before = getAnnounceMode();
  write(MODE_KEY, m);
  write(VOICE_KEY, m === 'voice' ? '1' : '0');
  S._voiceEnabled = (m === 'voice');
  if (m !== 'voice') _stopVoice();
  syncAnnounceControls();
  try {
    if (typeof window._cfgSyncMark === 'function') { window._cfgSyncMark('announce'); window._cfgSyncMark('voice'); }
  } catch (e) {}
  if (!(opts && opts.silent) && m !== before) {
    // Confirmation through the chosen channel (it also primes the speech
    // engine on this user gesture, which iOS requires).
    if (m === 'voice') speak(t('voiceOn'));
    else if (m === 'sr') _toScreenReader(t('announceSrOn'), false);
  }
  return m;
}

// Historical on/off toggle (hidden header button, setVoice of older menus):
// built-in voice ⇄ off.
function toggleVoice() {
  var on = getAnnounceMode() !== 'voice';
  setAnnounceMode(on ? 'voice' : 'off');
  if (typeof window.showKeyHint === 'function') window.showKeyHint(on ? t('voiceOn') : t('voiceOff'));
  return on;
}

function _bind() {
  try {
    document.querySelectorAll('input[name="announce-mode"]').forEach(function (input) {
      input.addEventListener('change', function () {
        var el = /** @type {HTMLInputElement} */ (input);
        if (el.checked) setAnnounceMode(el.value);
      });
    });
  } catch (e) {}
  syncAnnounceControls();
}

// Another tab, a settings sync descent or the admin first-visit default.
try {
  window.addEventListener('storage', function (e) {
    if (e.key === MODE_KEY || e.key === VOICE_KEY) {
      S._voiceEnabled = getAnnounceMode() === 'voice';
      if (!S._voiceEnabled) _stopVoice();
      syncAnnounceControls();
    }
  });
} catch (e) {}

S._voiceEnabled = getAnnounceMode() === 'voice';
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _bind, { once: true });
  else _bind();
}

export { announce, getAnnounceMode, setAnnounceMode, syncAnnounceControls, toggleVoice };

window.announce = announce;
window.getAnnounceMode = getAnnounceMode;
window.setAnnounceMode = setAnnounceMode;
window.syncAnnounceControls = syncAnnounceControls;
window.toggleVoice = toggleVoice;
