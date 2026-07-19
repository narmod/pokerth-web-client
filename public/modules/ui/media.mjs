// ═══════════════════════════════════════════════════════════════════
// Voix (annonces TTS) + retour haptique — chantier ESM #9f-2.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations de
// portée module uniquement : t importé d'i18n.mjs, fmtChipsVoice de
// fmt.mjs, _lang/showKeyHint/getPlayerName lus via window.* (mêmes
// valeurs, mêmes replis). Ponts window.* en fin de module.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { fmtChipsVoice } from './fmt.mjs';

// ── Haptic feedback (mobile) ──────────────────────────────────
// Vibrates the device when it becomes the user's turn. Especially
// useful when the app is backgrounded (sound may be muted by the
// OS but vibration still fires). Gated by a persisted flag so the
// user can turn it off; defaults ON. navigator.vibrate is a no-op
// / undefined on desktop browsers and iOS Safari (which doesn't
// support the Vibration API), so we feature-detect every call.
function hapticBuzz(pattern) {
  if (!S._hapticEnabled) return;
  try {
    if (navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern || 60);
    }
  } catch(e) {}
}
function toggleHaptic() {
  S._hapticEnabled = !S._hapticEnabled;
  try { localStorage.setItem('pth_haptic', S._hapticEnabled ? '1' : '0'); } catch(e) {}
  // Give immediate tactile + textual confirmation.
  if (S._hapticEnabled) hapticBuzz(40);
  else { try { if (navigator && typeof navigator.vibrate === 'function') navigator.vibrate(0); } catch(e) {} } // cancel any queued buzz
  var label = S._hapticEnabled
    ? t('hapticOn')
    : t('hapticOff');
  if (typeof window.showKeyHint === 'function') window.showKeyHint(label);
  // Direct header twin (tablet/desktop): icon-only.
  var bd = document.getElementById('haptic-toggle-btn');
  if (bd) bd.textContent = (S._hapticEnabled ? '📳' : '📴');
  return S._hapticEnabled;
}

// Speaks game events (player actions, your turn, winner) in the active
// language. Opt-in (default OFF), persisted, toggled from the ••• menu.
// No-ops gracefully where speechSynthesis is unavailable.
// Maps a UI language code (i18n catalogue key, e.g. 'fr', 'pt-BR',
// 'zh-TW') onto a BCP-47 tag for the speech engine, so each of the 36
// languages is voiced in its own tongue rather than always fr-FR/en-US.
// Unknown codes pass through; the picker then matches by primary subtag,
// falling back to the browser default voice.
function _voiceLangTag(code) {
  var c = String(code || 'fr').toLowerCase();
  var M = {
    af:'af-ZA', bg:'bg-BG', ca:'ca-ES', cs:'cs-CZ', da:'da-DK', de:'de-DE',
    el:'el-GR', en:'en-US', es:'es-ES', fi:'fi-FI', fr:'fr-FR', gd:'gd-GB',
    gl:'gl-ES', hi:'hi-IN', hr:'hr-HR', hu:'hu-HU', it:'it-IT', ja:'ja-JP',
    ko:'ko-KR', lt:'lt-LT', nb:'nb-NO', nl:'nl-NL', pl:'pl-PL',
    'pt-br':'pt-BR', 'pt-pt':'pt-PT', ro:'ro-RO', ru:'ru-RU', sk:'sk-SK',
    sr:'sr-RS', sv:'sv-SE', ta:'ta-IN', tr:'tr-TR', uk:'uk-UA', vi:'vi-VN',
    'zh-tw':'zh-TW', zh:'zh-CN'
  };
  return M[c] || c;
}
// Build a configured utterance for `text` in the active UI language.
// Voice list is async on Chrome (getVoices() is empty until 'voiceschanged'),
// so cache it and refresh on that event — otherwise the first announcement
// gets no matching voice and the engine falls back to a default.
function _loadVoices() { try { S._voices = window.speechSynthesis.getVoices() || []; } catch(e) {} }
if ('speechSynthesis' in window) {
  _loadVoices();
  try { window.speechSynthesis.addEventListener('voiceschanged', _loadVoices); }
  catch(e) { try { window.speechSynthesis.onvoiceschanged = _loadVoices; } catch(e2) {} }
}
// Choose the best voice for a BCP-47 tag: prefer an offline (localService)
// voice for low latency and to keep the offline training mode working,
// matching the exact region first, then the primary subtag.
function _pickVoice(tag) {
  var vs = S._voices.length ? S._voices : (function(){ try { return window.speechSynthesis.getVoices() || []; } catch(e) { return []; } })();
  var lc = String(tag || '').toLowerCase(), prim = lc.split('-')[0];
  var exact = vs.filter(function(v){ return v.lang && v.lang.toLowerCase() === lc; });
  var prims = vs.filter(function(v){ return v.lang && v.lang.toLowerCase().split('-')[0] === prim; });
  function best(list) {
    if (!list.length) return null;
    var local = list.filter(function(v){ return v.localService; });
    return local[0] || list[0];
  }
  return best(exact) || best(prims) || null;
}
function _voiceUtterance(text) {
  var lang = (typeof window._lang === 'string' && window._lang) ? window._lang : 'fr';
  var u = new SpeechSynthesisUtterance(String(text));
  u.lang = _voiceLangTag(lang);
  u.rate = 1.05;
  try { var pick = _pickVoice(u.lang); if (pick) u.voice = pick; } catch(e) {}
  return u;
}
// Announcements play one after another instead of cutting each other off:
// on a fast street (several quick folds) you now hear the sequence rather
// than only the last action. S._curU tags the in-flight utterance so a stale
// onend from a cancelled one can't advance the queue (Web Speech race).
function _speakNext() {
  if (!S._voiceEnabled) { S._speakQ = []; S._curU = null; S._speaking = false; return; }
  if (S._speaking || !S._speakQ.length) return;
  if (!('speechSynthesis' in window)) { S._speakQ = []; return; }
  var text = S._speakQ.shift();
  var u;
  try { u = _voiceUtterance(text); } catch(e) { _speakNext(); return; }
  S._curU = u; S._speaking = true;
  u.onend = u.onerror = function() {
    if (S._curU !== u) return;            // stale handler (cancelled) — ignore
    S._curU = null; S._speaking = false; _speakNext();
  };
  try { window.speechSynthesis.speak(u); }
  catch(e) { if (S._curU === u) { S._curU = null; S._speaking = false; } _speakNext(); }
}
// Queue an announcement. Pass { interrupt:true } for the urgent "your turn"
// cue: it drops any backlog and cuts off the current line so the player
// hears it promptly rather than after a queue of past actions.
function speak(text, opts) {
  if (!S._voiceEnabled || !text) return;
  if (!('speechSynthesis' in window)) return;
  if (opts && opts.interrupt) {
    S._speakQ = []; S._curU = null; S._speaking = false;
    try { window.speechSynthesis.cancel(); } catch(e) {}
  }
  S._speakQ.push(String(text));
  if (S._speakQ.length > S._SPEAK_MAX) S._speakQ = S._speakQ.slice(-S._SPEAK_MAX);
  _speakNext();
}
// Localized verb for a server action code (1=Fold … 6=All-in).
function voiceActionPhrase(action, pid, bet) {
  var verbs = ['', t('vFold'), t('vCheck'), t('vCall'), t('vBet'), t('vRaise'), t('vAllin')];
  var verb = verbs[action] || '';
  if (!verb) return '';
  var amt = (action >= 3 && bet) ? ' ' + fmtChipsVoice(bet) : '';   // call/bet/raise/all-in carry the amount
  return window.getPlayerName(pid) + ' ' + verb + amt;
}
function toggleVoice() {
  S._voiceEnabled = !S._voiceEnabled;
  try { localStorage.setItem('pth_voice', S._voiceEnabled ? '1' : '0'); } catch(e) {}
  var label = S._voiceEnabled ? t('voiceOn') : t('voiceOff');
  if (typeof window.showKeyHint === 'function') window.showKeyHint(label);
  // Direct header twin (tablet/desktop): icon-only.
  var vd = document.getElementById('voice-toggle-btn');
  if (vd) vd.textContent = (S._voiceEnabled ? '🗣️' : '🤐');
  // Spoken confirmation (also primes the engine on first user gesture).
  if (S._voiceEnabled) speak(t('voiceOn'));
  else if ('speechSynthesis' in window) { S._speakQ = []; S._curU = null; S._speaking = false; try { window.speechSynthesis.cancel(); } catch(e) {} }
  return S._voiceEnabled;
}
// Sync the direct (tablet/desktop) header toggle icons with the persisted
// state on load, so 📳/📴 and 🗣️/🤐 reflect reality before any toggle.
function _syncMediaToggleButtons() {
  try {
    var hb = document.getElementById('haptic-toggle-btn');
    if (hb) hb.textContent = (S._hapticEnabled ? '📳' : '📴');
    var vb = document.getElementById('voice-toggle-btn');
    if (vb) vb.textContent = (S._voiceEnabled ? '🗣️' : '🤐');
  } catch(e) {}
}
_syncMediaToggleButtons();

export { hapticBuzz, toggleHaptic, _voiceLangTag, _loadVoices, _pickVoice,
         _voiceUtterance, _speakNext, speak, voiceActionPhrase, toggleVoice,
         _syncMediaToggleButtons };

window.hapticBuzz = hapticBuzz;
window.toggleHaptic = toggleHaptic;
window._voiceLangTag = _voiceLangTag;
window._loadVoices = _loadVoices;
window._pickVoice = _pickVoice;
window._voiceUtterance = _voiceUtterance;
window._speakNext = _speakNext;
window.speak = speak;
window.voiceActionPhrase = voiceActionPhrase;
window.toggleVoice = toggleVoice;
window._syncMediaToggleButtons = _syncMediaToggleButtons;
