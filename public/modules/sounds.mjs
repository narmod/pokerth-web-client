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
  // Casino roulette spin — a fast ascending arpeggio (the spinning ball
  // climbing rim notches) terminated by a clean high "ding!" (ball lands
  // on a slot). Six tones, exponentially spaced freq, then the bell.
  // Vibrate pattern mimics the rattle + the click.
  var arp = [392, 466, 554, 659, 784, 932]; // G4 → A#5, 6 chip-drop notes
  arp.forEach(function(f, i) {
    setTimeout(function() { playTone(f, 0.07, 0.18 - i * 0.005); }, i * 55);
  });
  // The "ding!" — sharp, brilliant, longer decay. Plays after the trill.
  setTimeout(function() { playTone(1568, 0.5, 0.30); }, arp.length * 55 + 80);  // G6
  // Subtle bell harmonic right after for that casino chime feel.
  setTimeout(function() { playTone(2093, 0.4, 0.18); }, arp.length * 55 + 130); // C7
  if (_soundEnabled && navigator.vibrate) {
    navigator.vibrate([30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 100, 60, 200]);
  }
}
function notifyMyTurn() {
  // Poker doorbell "ding-dong" — two bright, well-spaced bell tones
  // (high C → A) with a perceptible decay. Easy to identify from across
  // the room, distinct from any other game sound. Vibrates noticeably
  // on mobile so the user can recognize their turn without looking.
  playTone(1047, 0.35, 0.28);                                // DING (C6)
  setTimeout(function(){ playTone(880, 0.45, 0.26); }, 220); // DONG (A5)
  if (_soundEnabled && navigator.vibrate) navigator.vibrate([100, 80, 100]);
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
function notifyBigWin() {
  // Confetti pop! Fired when the user wins a substantially-sized pot.
  // Distinct from notifyWinner (which plays on any win): this is a
  // multi-burst celebration to underline the moment.
  //   • Burst 1: ascending arpeggio (the toss into the air)
  //   • Burst 2: shimmer cluster of high tones (confetti falling)
  //   • Burst 3: final triumphant chord
  // Total duration ~1.4 s; vibrates in three thumps on mobile.
  var arp = [523, 659, 784, 1047, 1319]; // C5 → E6, fast climb
  arp.forEach(function(f, i) {
    setTimeout(function() { playTone(f, 0.10, 0.26 - i * 0.02); }, i * 70);
  });
  // Shimmer: fast cluster of overlapping high tones (the "sparkle")
  setTimeout(function() {
    [1568, 1865, 2093, 2349].forEach(function(f, i) {
      setTimeout(function() { playTone(f, 0.18, 0.16); }, i * 35);
    });
  }, 450);
  // Final chord — C major triad (C6 + E6 + G6) for a "ta-daaa" feel.
  setTimeout(function() {
    playTone(1047, 0.45, 0.24);
    playTone(1319, 0.45, 0.22);
    playTone(1568, 0.45, 0.20);
  }, 900);
  if (_soundEnabled && navigator.vibrate) {
    navigator.vibrate([120, 80, 120, 80, 200]);
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
  notifyMyTurn, notifyWinner, notifyBigWin, notifyChat,
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
window.notifyBigWin  = notifyBigWin;
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
  notifyMyTurn, notifyWinner, notifyBigWin, notifyChat,
  toggleSound, isSoundEnabled,
};
