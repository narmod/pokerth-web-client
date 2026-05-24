// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/sounds.mjs
//
// Sound effects module — extracted from pokerth.js as the second step of
// the Phase 2 modular refactor. Generates short tones via the Web Audio
// API (no audio file assets needed) and exposes both an ES-module API
// and the legacy global names.
//
// Notification taxonomy:
//   notifyCard       — short high chirp for a card being dealt
//   notifyAction     — low thud for a player action (fold/call/raise)
//   notifyMyTurn     — chime + vibration when it is the user's turn
//   notifyWinner     — fanfare on win, sad pair of tones on loss
//   notifyChat       — chat ping
//   playTone         — low-level helper (freq, duration, volume)
//   toggleSound      — flip the mute state and persist to localStorage
//
// Internal state:
//   _audioCtx        — lazily-created AudioContext (Safari/iOS require a
//                      user gesture before audio can play; we resume it
//                      on the first document click)
//   _soundEnabled    — boolean, persisted under localStorage key
//                      'pth_sound' ('1' = on, '0' = off)
//
// Legacy compatibility:
//   The rest of pokerth.js still calls these names as bare globals (e.g.
//   `notifyCard()`, `_soundEnabled`, `toggleSound()`). Until those call
//   sites are migrated to imports, we mirror everything on window.
// ─────────────────────────────────────────────────────────────────────────

let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) try { _audioCtx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e) {}
  return _audioCtx;
}
function playTone(freq, dur, vol) {
  if (!_soundEnabled) return;
  var ctx = getAudioCtx(); if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol||0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch(e) {}
}
function notifyCard() {
  // Bruit de carte distribuée : bref clic
  playTone(1200, 0.04, 0.12);
}
function notifyAction() {
  // Action d'un joueur : thud sourd (utilisé pour Check, Call, Bet)
  playTone(220, 0.1, 0.1);
}
function notifyFold() {
  // Fold = "abandonner". Deux notes descendantes (effet défaitiste, qui
  // tombe). Volume modéré pour rester discret comme un soupir.
  playTone(330, 0.08, 0.10);
  setTimeout(function(){ playTone(180, 0.12, 0.08); }, 90);
}
function notifyRaise() {
  // Raise/Bet = "monter la mise". Deux notes ascendantes, plus brillantes.
  playTone(440, 0.06, 0.14);
  setTimeout(function(){ playTone(660, 0.10, 0.16); }, 70);
}
function notifyAllIn() {
  // All-in = moment dramatique. Fanfare ascendante rapide (440 → 660 → 880),
  // puis un coup de gong grave (220 Hz, longue queue) pour la gravité.
  // Vibre aussi sur mobile pour souligner l'instant.
  playTone(440, 0.08, 0.20);
  setTimeout(function(){ playTone(660, 0.08, 0.20); }, 80);
  setTimeout(function(){ playTone(880, 0.10, 0.22); }, 160);
  setTimeout(function(){ playTone(220, 0.40, 0.18); }, 280);
  if (_soundEnabled && navigator.vibrate) navigator.vibrate([60, 40, 60, 40, 120]);
}
function notifyMyTurn() {
  playTone(523, 0.15, 0.25);
  setTimeout(function(){ playTone(659, 0.2, 0.2); }, 120);
  if (_soundEnabled && navigator.vibrate) navigator.vibrate([80, 60, 80]);
  var mz = document.querySelector('.my-zone');
  if (mz) { mz.style.borderTopColor='gold'; setTimeout(function(){ mz.style.borderTopColor=''; }, 1200); }
}
function notifyWinner(isMine) {
  if (isMine) {
    [523,659,784,1047].forEach(function(f,i){ setTimeout(function(){ playTone(f,0.15,0.28-i*0.03); }, i*110); });
    if (_soundEnabled && navigator.vibrate) navigator.vibrate([100,50,100,50,200]);
  } else {
    playTone(440,0.15,0.15); setTimeout(function(){ playTone(349,0.2,0.1); },150);
    if (_soundEnabled && navigator.vibrate) navigator.vibrate([60]);
  }
}
function notifyChat() {
  playTone(880, 0.07, 0.1);
  if (_soundEnabled && navigator.vibrate) navigator.vibrate([25]);
}
// Mute state
let _soundEnabled = (function() {
  try { return localStorage.getItem('pth_sound') !== '0'; } catch(e) { return true; }
})();

function toggleSound() {
  _soundEnabled = !_soundEnabled;
  try { localStorage.setItem('pth_sound', _soundEnabled ? '1' : '0'); } catch(e) {}
  var btn = document.getElementById('sound-toggle-btn');
  if (btn) {
    btn.textContent  = _soundEnabled ? '🔊' : '🔇';
    btn.style.color  = _soundEnabled ? '' : 'rgba(255,255,255,0.35)';
    btn.style.borderColor = _soundEnabled ? '' : 'rgba(255,255,255,0.15)';
    btn.title = _soundEnabled ? 'Mute' : 'Unmute';
  }
}

function isSoundEnabled() {
  return _soundEnabled;
}

// ─── iOS / Safari: resume audio on first user click ────────────────────
// Browsers refuse to start AudioContext until a user gesture has occurred.
// One-shot listener that primes the context as soon as the user clicks
// anywhere. Previously lived in pokerth.js; moved here to keep all the
// audio plumbing in one place.
document.addEventListener('click', function() { getAudioCtx(); }, { once: true });

// ─── Modern ES module exports ───────────────────────────────────────────
export {
  getAudioCtx, playTone,
  notifyCard, notifyAction, notifyFold, notifyRaise, notifyAllIn,
  notifyMyTurn, notifyWinner, notifyChat,
  toggleSound, isSoundEnabled,
};

// ─── Legacy global compatibility ────────────────────────────────────────
window.getAudioCtx   = getAudioCtx;
window.playTone      = playTone;
window.notifyCard    = notifyCard;
window.notifyAction  = notifyAction;
window.notifyFold    = notifyFold;
window.notifyRaise   = notifyRaise;
window.notifyAllIn   = notifyAllIn;
window.notifyMyTurn  = notifyMyTurn;
window.notifyWinner  = notifyWinner;
window.notifyChat    = notifyChat;
window.toggleSound   = toggleSound;

// _audioCtx and _soundEnabled were declared with `var` at the top of
// pokerth.js, so they used to be plain window properties. Mirror them
// via getter/setter so legacy reads and writes flow back into the
// module's internal state.
Object.defineProperty(window, '_audioCtx', {
  configurable: true,
  get() { return _audioCtx; },
  set(v) { _audioCtx = v; },
});
Object.defineProperty(window, '_soundEnabled', {
  configurable: true,
  get() { return _soundEnabled; },
  set(v) { _soundEnabled = v; },
});

// Single namespaced entry point for migration-aware code.
window.SOUNDS = {
  getAudioCtx, playTone,
  notifyCard, notifyAction, notifyFold, notifyRaise, notifyAllIn,
  notifyMyTurn, notifyWinner, notifyChat,
  toggleSound, isSoundEnabled,
};
