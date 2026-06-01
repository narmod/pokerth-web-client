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
// Relance le contexte dès qu'il n'est pas 'running'. iOS utilise DEUX états
// d'arrêt : 'suspended' (avant 1er geste) ET 'interrupted' (PWA passée en
// arrière-plan, appel entrant, autre app qui capte la sortie audio). Ne tester
// que 'suspended' laissait le son muet jusqu'à fermeture/réouverture de l'app.
// Sûr à appeler souvent ; resume() est idempotent.
function _ensureRunning() {
  var ctx = getAudioCtx();
  if (ctx && ctx.state !== 'running' && typeof ctx.resume === 'function') {
    try { ctx.resume(); } catch(e) {}
  }
  return ctx;
}
// Déverrouillage iOS « pour de vrai » : à exécuter DANS un geste utilisateur.
// On reprend le contexte ET on joue un buffer silencieux de 1 échantillon —
// sans ce buffer, certaines versions d'iOS gardent le contexte muet jusqu'au
// geste suivant.
function _unlockAudio() {
  var ctx = getAudioCtx(); if (!ctx) return;
  try {
    if (ctx.state !== 'running' && ctx.resume) ctx.resume();
    var buf = ctx.createBuffer(1, 1, 22050);
    var src = ctx.createBufferSource();
    src.buffer = buf; src.connect(ctx.destination); src.start(0);
  } catch(e) {}
}
function playTone(freq, dur, vol) {
  if (!_soundEnabled) return;
  var ctx = getAudioCtx(); if (!ctx) return;
  try {
    if (ctx.state !== 'running') { try { ctx.resume(); } catch(e) {} }
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
  // Water-bubble "plop!" — a single short tone whose pitch sweeps upward
  // very quickly, mimicking a bubble surfacing. Designed to be DISTINCT
  // but UNFATIGUING over many hands: one event, ~180ms total, mid-range.
  // Replaces the previous "ding-dong" which felt obtrusive after a while.
  //
  // Implementation: instead of playTone() (which holds a fixed freq), we
  // schedule frequency.exponentialRampToValueAtTime so the oscillator
  // glides from 440Hz to 880Hz in 80ms. That upward chirp is the
  // hallmark of a bubble. A short exponential decay on gain provides
  // the natural "plop" envelope.
  if (!_soundEnabled) return;
  var ctx = getAudioCtx(); if (!ctx) return;
  try {
    if (ctx.state !== 'running') { try { ctx.resume(); } catch(e) {} }
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; // smoothest waveform, closest to a real bubble
    o.connect(g); g.connect(ctx.destination);
    var t0 = ctx.currentTime;
    // Pitch sweep: 440Hz -> 880Hz over 80ms (the bubble rising)
    o.frequency.setValueAtTime(440, t0);
    o.frequency.exponentialRampToValueAtTime(880, t0 + 0.08);
    // Volume envelope: small attack, exp decay over 180ms
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
    o.start(t0);
    o.stop(t0 + 0.20);
  } catch(e) {}
  // Keep the gentle vibration cue on mobile (single short pulse)
  if (_soundEnabled && navigator.vibrate) navigator.vibrate(80);
  // Keep the golden glow on the player zone
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
function notifyBlindsUp() {
  // Montée des blinds : trois notes ascendantes "level up", brèves et
  // brillantes, distinctes du notifyRaise (qui n'en a que deux).
  playTone(660, 0.08, 0.16);
  setTimeout(function(){ playTone(880, 0.08, 0.17); }, 90);
  setTimeout(function(){ playTone(1175, 0.16, 0.18); }, 190);
  if (_soundEnabled && navigator.vibrate) navigator.vibrate([40, 50, 40]);
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

// ─── iOS / Safari: déverrouillage & reprise audio robustes ─────────────
// Les navigateurs refusent de démarrer l'AudioContext tant qu'un geste
// utilisateur n'a pas eu lieu, et iOS le ré-arrête (suspended/interrupted)
// quand la PWA passe en arrière-plan. Sans reprise, le son tombe muet
// jusqu'à fermeture/réouverture de l'app — exactement le bug observé,
// notamment après le rechargement consécutif à une mise à jour.
//
// 1) On déverrouille à CHAQUE geste tant que le contexte n'est pas 'running'
//    (et non une seule fois) : un premier tap survenu sur un contexte pas
//    encore prêt ne nous coince plus. Une fois 'running', on se désabonne.
function _onUnlockGesture() {
  _unlockAudio();
  var ctx = getAudioCtx();
  if (ctx && ctx.state === 'running') {
    ['touchend', 'click', 'pointerdown', 'keydown'].forEach(function(ev) {
      document.removeEventListener(ev, _onUnlockGesture, true);
    });
  }
}
['touchend', 'click', 'pointerdown', 'keydown'].forEach(function(ev) {
  document.addEventListener(ev, _onUnlockGesture, true);
});

// 2) Au retour au premier plan (changement d'onglet, app PWA ré-ouverte) on
//    relance le contexte. Couvre le cas iOS 'interrupted' après backgrounding.
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) _ensureRunning();
});
window.addEventListener('pageshow', function() { _ensureRunning(); });
window.addEventListener('focus', function() { _ensureRunning(); });

// ─── Modern ES module exports ───────────────────────────────────────────
export {
  getAudioCtx, playTone,
  notifyCard, notifyAction, notifyFold, notifyRaise, notifyAllIn,
  notifyMyTurn, notifyWinner, notifyBigWin, notifyChat, notifyBlindsUp,
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
window.notifyBlindsUp = notifyBlindsUp;
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
  notifyMyTurn, notifyWinner, notifyBigWin, notifyChat, notifyBlindsUp,
  toggleSound, isSoundEnabled,
};
