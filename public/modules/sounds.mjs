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
  // iOS peut FERMER le contexte (state 'closed') apres une interruption longue
  // (PWA restee en arriere-plan, appel telephonique). Un contexte 'closed' ne
  // redemarre JAMAIS via resume() : on le jette et on en recree un neuf.
  if (_audioCtx && _audioCtx.state === 'closed') _audioCtx = null;
  if (!_audioCtx) try { _audioCtx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e) {}
  return _audioCtx;
}
// ─── Volume maître des effets de jeu ──────────────────────────────────────
// Tous les sons se branchent sur ce GainNode → un seul réglage pilote le
// niveau de TOUS les SFX. Recréé automatiquement si le contexte est recréé
// (iOS peut le fermer/recréer). Clé 'pth_sound_vol' : 0..1 (défaut 1 =
// loudness inchangée). Le mute reste géré séparément par 'pth_sound'.
var _master = null;
function getSoundVolume() {
  try { var v = parseFloat(localStorage.getItem('pth_sound_vol')); return isNaN(v) ? 1 : Math.max(0, Math.min(1, v)); }
  catch(e) { return 1; }
}
function setSoundVolume(v) {
  v = parseFloat(v); if (isNaN(v)) v = 1; v = Math.max(0, Math.min(1, v));
  try { localStorage.setItem('pth_sound_vol', String(v)); } catch(e) {}
}

// ─── Catégories de sons (parité réglages Sound du client QML, bible §14) ──
// 4 interrupteurs indépendants, ACTIFS par défaut (valeur absente = on) :
//   pth_snd_actions — actions de jeu (fold…all-in, deal, yourturn)
//   pth_snd_blinds  — hausse des blinds (level 1/2/3)
//   pth_snd_lobby   — notification du chat lobby
//   pth_snd_net     — partie réseau (joueur connecté, partie prête)
// Écrits par setAdvOpt('snd_*') dans Options avancées → Son.
function sndCat(key) {
  try { return localStorage.getItem('pth_snd_' + key) !== '0'; } catch(e) { return true; }
  if (_master) try { _master.gain.value = v; } catch(e) {}
  return v;
}
// Destination des nœuds sonores = le gain maître (créé à la volée sur le
// contexte courant). Fallback direct sur la sortie si la création échoue.
function _dest(ctx) {
  if (!ctx) return null;
  if (!_master || _master.context !== ctx) {
    try { _master = ctx.createGain(); _master.gain.value = getSoundVolume(); _master.connect(ctx.destination); }
    catch(e) { _master = null; return ctx.destination; }
  }
  return _master;
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
    // iOS : un contexte 'interrupted' (PWA passee en arriere-plan puis notif
    // tapee) ne repart PARFOIS JAMAIS via resume(), meme appele dans un geste.
    // On le ferme et on en recree un neuf : comme on est dans un geste
    // utilisateur, le nouveau contexte demarre immediatement. ('closed' est
    // gere en amont par getAudioCtx.)
    if (ctx.state === 'interrupted') {
      try { ctx.close(); } catch(e) {}
      _audioCtx = null;
      ctx = getAudioCtx(); if (!ctx) return;
    }
    if (ctx.state !== 'running' && ctx.resume) ctx.resume();
    var buf = ctx.createBuffer(1, 1, 22050);
    var src = ctx.createBufferSource();
    src.buffer = buf; src.connect(ctx.destination); src.start(0);
    _decodeAll();
  } catch(e) {}
}
// Vibration mobile (Android). Gated by the dedicated HAPTIC flag (pth_haptic),
// read straight from localStorage so it stays in sync with the page's haptic
// toggle. Muting SOUND no longer keeps the phone buzzing, and turning haptics
// OFF now silences every buzz (the bug: these were gated by _soundEnabled).
function _buzz(pattern) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate
        && localStorage.getItem('pth_haptic') !== '0') navigator.vibrate(pattern);
  } catch(e) {}
}
function playTone(freq, dur, vol) {
  if (!_soundEnabled) return;
  var ctx = getAudioCtx(); if (!ctx) return;
  try {
    if (ctx.state !== 'running') { try { ctx.resume(); } catch(e) {} }
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(_dest(ctx));
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol||0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch(e) {}
}

// ─── Echantillons sonores PokerTH (sons de jeu) ──────────────────────────
// Sons officiels du serveur PokerTH (data/sounds/default, AGPL-3.0) convertis
// en MP3 et servis depuis /sounds/pokerth/. Decodes via decodeAudioData dans
// le MEME AudioContext que les bips -> pilotes par le meme volume maitre
// (_dest) et le meme mute (_soundEnabled). Si un sample n'est pas (encore)
// charge ou indisponible, on retombe sur le bip synthetise correspondant.
const SOUND_DIR = '/sounds/pokerth/';
const SAMPLE_FILES = {
  fold: 'fold', check: 'check', call: 'call', bet: 'bet',
  raise: 'raise', allin: 'allin', deal: 'dealtwocards', turn: 'yourturn',
  blinds1: 'blinds_raises_level1', blinds2: 'blinds_raises_level2', blinds3: 'blinds_raises_level3',
  playerconnected: 'playerconnected', gameready: 'onlinegameready', lobbychat: 'lobbychatnotify'
};
var _rawBytes = {};     // nom logique -> ArrayBuffer brut (conserve pour re-decodage)
var _buffers = {};      // nom logique -> AudioBuffer decode
var _decodeCtx = null;  // contexte ayant servi a decoder _buffers
var _fetchStarted = false;
var _blindRaiseCount = 0;  // escalade montee de blinds (reset au GameStartInitial)

// Decode UN sample (callback form : la seule supportee par les vieux Safari).
function _decodeOne(name) {
  var ctx = getAudioCtx(); if (!ctx) return;
  if (_decodeCtx !== ctx) { _buffers = {}; _decodeCtx = ctx; } // ctx recree (iOS) -> re-decoder
  if (_buffers[name] || !_rawBytes[name]) return;
  try {
    var copy = _rawBytes[name].slice(0); // decodeAudioData DETACHE son entree
    ctx.decodeAudioData(copy, function(b) { _buffers[name] = b; }, function() {});
  } catch(e) {}
}
function _decodeAll() { Object.keys(SAMPLE_FILES).forEach(_decodeOne); }

// Telecharge les octets des samples (reseau seul ; decodage differe au geste).
function _fetchSamples() {
  if (_fetchStarted) return; _fetchStarted = true;
  Object.keys(SAMPLE_FILES).forEach(function(name) {
    fetch(SOUND_DIR + SAMPLE_FILES[name] + '.mp3')
      .then(function(r) { return r.ok ? r.arrayBuffer() : Promise.reject(new Error('http ' + r.status)); })
      .then(function(buf) { _rawBytes[name] = buf; if (_audioCtx) _decodeOne(name); })
      .catch(function() { /* sample indisponible -> repli synthe */ });
  });
}

// Joue un sample s'il est pret. true si un son a demarre, false sinon (muet,
// contexte absent, ou sample pas encore decode) -> l'appelant fait son repli.
function _playSample(name) {
  if (!_soundEnabled) return false;
  var ctx = getAudioCtx(); if (!ctx) return false;
  if (_decodeCtx !== ctx) { _buffers = {}; _decodeCtx = ctx; }
  var b = _buffers[name];
  if (!b) { _decodeOne(name); return false; }
  try {
    if (ctx.state !== 'running') { try { ctx.resume(); } catch(e) {} }
    var src = ctx.createBufferSource();
    src.buffer = b; src.connect(_dest(ctx)); src.start(0);
    return true;
  } catch(e) { return false; }
}

// Dispatch d'une action de siege selon le code serveur (PlayersActionDone).
// 1 Fold - 2 Check - 3 Call - 4 Bet - 5 Raise - 6 All-In. Chaque cas joue le
// sample PokerTH dedie (repli sur le bip synthetise via les notify* existants).
function playActionSound(action) {
  if (!sndCat('actions')) return;
  switch (action) {
    case 1: notifyFold(); break;
    case 2: notifyAction('check'); break;
    case 3: notifyAction('call'); break;
    case 4: notifyAction('bet'); break;
    case 5: notifyRaise(); break;
    case 6: notifyAllIn(); break;
    default: notifyAction();
  }
}
function notifyCard() {
  // Bruit de carte distribuée : bref clic
  if (!sndCat('actions')) return;
  if (_playSample('deal')) return;
  playTone(1200, 0.04, 0.12);
}
function notifyAction(kind) {
  // Action d'un joueur (Check, Call, Bet) : un « toc » bref et discret. Monté
  // de 220 Hz à 520 Hz : les petits haut-parleurs de smartphone (Android) ne
  // restituent quasiment pas le grave, l'ancien thud y était inaudible.
  if (kind && _playSample(kind)) return;
  playTone(520, 0.08, 0.10);
}
function notifyFold() {
  // Fold = "abandonner". Deux notes descendantes (effet défaitiste, qui tombe).
  // Remontées (392→294 Hz au lieu de 330→180) pour rester audibles sur les
  // haut-parleurs de smartphone tout en gardant le contour descendant.
  if (_playSample('fold')) return;
  playTone(392, 0.08, 0.10);
  setTimeout(function(){ playTone(294, 0.12, 0.08); }, 90);
}
function notifyRaise() {
  // Raise/Bet = "monter la mise". Deux notes ascendantes, plus brillantes.
  if (_playSample('raise')) return;
  playTone(440, 0.06, 0.14);
  setTimeout(function(){ playTone(660, 0.10, 0.16); }, 70);
}
function notifyAllIn() {
  // Casino roulette spin — a fast ascending arpeggio (the spinning ball
  // climbing rim notches) terminated by a clean high "ding!" (ball lands
  // on a slot). Six tones, exponentially spaced freq, then the bell.
  // Vibrate pattern mimics the rattle + the click.
  if (!_playSample('allin')) {
  var arp = [392, 466, 554, 659, 784, 932]; // G4 → A#5, 6 chip-drop notes
  arp.forEach(function(f, i) {
    setTimeout(function() { playTone(f, 0.07, 0.18 - i * 0.005); }, i * 55);
  });
  // The "ding!" — sharp, brilliant, longer decay. Plays after the trill.
  setTimeout(function() { playTone(1568, 0.5, 0.30); }, arp.length * 55 + 80);  // G6
  // Subtle bell harmonic right after for that casino chime feel.
  setTimeout(function() { playTone(2093, 0.4, 0.18); }, arp.length * 55 + 130); // C7
  }
  _buzz([30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 100, 60, 200]); // casino rattle (haptic-gated)
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
  if (!_soundEnabled || !sndCat('actions')) return;
  if (!_playSample('turn')) {
  var ctx = getAudioCtx(); if (!ctx) return;
  try {
    if (ctx.state !== 'running') { try { ctx.resume(); } catch(e) {} }
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; // smoothest waveform, closest to a real bubble
    o.connect(g); g.connect(_dest(ctx));
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
  }
  // Keep the gentle vibration cue on mobile (single short pulse)
  _buzz(80);
  // Keep the golden glow on the player zone
  var mz = document.querySelector('.my-zone');
  if (mz) { mz.style.borderTopColor='gold'; setTimeout(function(){ mz.style.borderTopColor=''; }, 1200); }
}
function notifyWinner(isMine) {
  if (isMine) {
    [523,659,784,1047].forEach(function(f,i){ setTimeout(function(){ playTone(f,0.15,0.28-i*0.03); }, i*110); });
    _buzz([100,50,100,50,200]);
  } else {
    playTone(440,0.15,0.15); setTimeout(function(){ playTone(349,0.2,0.1); },150);
    _buzz([60]);
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
  _buzz([120, 80, 120, 80, 200]);
}
function notifyChat() {
  // Même bip que le QML : sample officiel lobbychatnotify.mp3 (repli bip synthé
  // s'il n'est pas encore décodé). La vibration reste toujours jouée.
  if (_soundEnabled && sndCat('lobby')) {
    if (!_playSample('lobbychat')) playTone(880, 0.07, 0.1);
  }
  _buzz([25]);
}
// ─── Notifications réseau & lobby (samples officiels PokerTH) ─────────────
// playerconnected.wav : un joueur rejoint la table en attente.
function notifyPlayerConnected() {
  if (!_soundEnabled || !sndCat('net')) return;
  if (_playSample('playerconnected')) return;
  playTone(660, 0.07, 0.12);
  setTimeout(function(){ playTone(880, 0.09, 0.12); }, 80);
}
// onlinegameready.wav : la partie réseau est prête à démarrer (StartEvent).
function notifyGameReady() {
  if (!_soundEnabled || !sndCat('net')) return;
  if (_playSample('gameready')) return;
  [523, 659, 784].forEach(function(f, i){ setTimeout(function(){ playTone(f, 0.10, 0.16); }, i * 90); });
}
// lobbychatnotify.wav : message reçu dans le chat du lobby.
function notifyLobbyChat() {
  if (!_soundEnabled || !sndCat('lobby')) return;
  if (_playSample('lobbychat')) return;
  playTone(880, 0.07, 0.10);
}
// Remet l'escalade de blinds a zero (appele au demarrage d'une partie).
function resetBlindRaises() { _blindRaiseCount = 0; }
function notifyBlindsUp() {
  // Montée des blinds : trois notes ascendantes "level up", brèves et
  // brillantes, distinctes du notifyRaise (qui n'en a que deux).
  _blindRaiseCount++;
  if (!sndCat('blinds')) return;   // catégorie coupée : escalade comptée, son muet
  // Escalade fidele a l'upstream PokerTH : level1 aux hausses 1-2, level2 aux
  // 3-4, level3 a partir de la 5e.
  var lvl = _blindRaiseCount <= 2 ? 'blinds1' : (_blindRaiseCount <= 4 ? 'blinds2' : 'blinds3');
  if (!_playSample(lvl)) {
    // Repli synthe : trois notes ascendantes "level up".
    playTone(660, 0.08, 0.16);
    setTimeout(function(){ playTone(880, 0.08, 0.17); }, 90);
    setTimeout(function(){ playTone(1175, 0.16, 0.18); }, 190);
  }
  _buzz([40, 50, 40]);
}
// Décompte des dernières secondes (mon tour) : tic discret sur 5-4-3-2…
// Vibration via navigator.vibrate (Android). iOS/Safari n'expose pas d'API
// vibrate et son retour haptique web (<input switch>) ne se déclenche que sur
// un vrai geste tactile, jamais sur un timer — donc pas de vibration possible
// sur iPhone ici ; il reste le son et l'alerte visuelle (timer rouge).
function notifyTick() {
  playTone(900, 0.03, 0.06);
  _buzz(20);
}
// …puis bip plus marqué sur la toute dernière seconde.
function notifyTickFinal() {
  playTone(1397, 0.14, 0.20);
  _buzz(60);
}
// Mute state
let _soundEnabled = (function() {
  try { return localStorage.getItem('pth_sound') !== '0'; } catch(e) { return true; }
})();

var SND_ON_SVG = '<svg viewBox="0 0 24 24" style="display:block;width:22px;height:22px" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
var SND_OFF_SVG = '<svg viewBox="0 0 24 24" style="display:block;width:22px;height:22px" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';

function toggleSound() {
  _soundEnabled = !_soundEnabled;
  try { localStorage.setItem('pth_sound', _soundEnabled ? '1' : '0'); } catch(e) {}
  var btn = document.getElementById('sound-toggle-btn');
  if (btn) {
    btn.innerHTML    = _soundEnabled ? SND_ON_SVG : SND_OFF_SVG;
    btn.style.color  = _soundEnabled ? '' : 'rgba(255,255,255,0.35)';
    btn.title = _soundEnabled ? 'Mute' : 'Unmute';
  }
}

function isSoundEnabled() {
  return _soundEnabled;
}

// ─── Popover de réglage du son (volume + mute), ancré au bouton du header ──
// Tap sur #sound-toggle-btn → ouvre/ferme un petit popover : bouton mute +
// curseur de volume des effets de jeu. L'icône du bouton reflète toujours
// l'état coupé/actif (toggleSound met le bouton du header à jour).
var _soundPop = null;
function _stxt(key, fb) {
  try { if (typeof window.t === 'function') { var s = window.t(key); if (s && s !== key) return s; } } catch(e) {}
  return fb;
}
function _syncSoundPop() {
  if (!_soundPop) return;
  var mb = _soundPop.querySelector('.sound-pop-mute');
  var rg = _soundPop.querySelector('.sound-pop-range');
  if (mb) { mb.textContent = _soundEnabled ? '\uD83D\uDD0A' : '\uD83D\uDD07'; mb.setAttribute('aria-pressed', String(!_soundEnabled)); }
  _soundPop.classList.toggle('is-off', !_soundEnabled);
  if (rg) rg.value = Math.round(getSoundVolume() * 100);
}
function closeSoundPopover() {
  if (!_soundPop) return;
  try { _soundPop.remove(); } catch(e) {}
  _soundPop = null;
  document.removeEventListener('pointerdown', _soundPopOutside, true);
  window.removeEventListener('resize', closeSoundPopover);
}
function _soundPopOutside(e) {
  if (!_soundPop) return;
  var btn = document.getElementById('sound-toggle-btn');
  if (_soundPop.contains(e.target) || (btn && btn.contains(e.target))) return;
  closeSoundPopover();
}
function toggleSoundPopover(btn) {
  if (_soundPop) { closeSoundPopover(); return; }          // 2e tap = fermer
  btn = btn || document.getElementById('sound-toggle-btn');
  if (!btn) { toggleSound(); return; }                     // pas d'ancre → mute simple
  var vol = Math.round(getSoundVolume() * 100);
  var lbl = _stxt('soundVolume', 'Game sounds');
  var pop = document.createElement('div');
  pop.className = 'sound-pop' + (_soundEnabled ? '' : ' is-off');
  pop.setAttribute('role', 'group');
  pop.setAttribute('aria-label', lbl);
  var musicRow = '';
  try {
    if (window.Music && typeof window.Music.getVolume === 'function') {
      var mvol = Math.round((window.Music.getVolume() || 0) * 100);
      var mlbl = _stxt('musicVolume', 'Music');
      musicRow =
        '<div class="sp-row">' +
        '<span class="sound-pop-ico" aria-hidden="true">🎵</span>' +
        '<input type="range" class="sound-pop-range sp-music-range" min="0" max="100" value="' + mvol + '" aria-label="' + mlbl + '">' +
        '<span class="sound-pop-val sp-music-val">' + mvol + '%</span>' +
        '</div>';
    }
  } catch (e) {}
  // Vibration (haptique mobile) — meme commande que Sons & Musique.
  var hOn = true; try { hOn = localStorage.getItem('pth_haptic') !== '0'; } catch (e) {}
  var hlbl = _stxt('hapticLabel', 'Vibration');
  var hapticRow =
    '<div class="sp-row sp-haptic">' +
    '<span class="sound-pop-ico" aria-hidden="true">📳</span>' +
    '<span class="sp-haptic-lbl">' + hlbl + '</span>' +
    '<input type="checkbox" class="sp-haptic-cb"' + (hOn ? ' checked' : '') + ' aria-label="' + hlbl + '">' +
    '</div>';
  pop.innerHTML =
    '<div class="sp-row">' +
    '<button type="button" class="sound-pop-mute" aria-pressed="' + String(!_soundEnabled) + '" title="' + lbl + '">' + (_soundEnabled ? '\uD83D\uDD0A' : '\uD83D\uDD07') + '</button>' +
    '<input type="range" class="sound-pop-range" min="0" max="100" value="' + vol + '" aria-label="' + lbl + '">' +
    '<span class="sound-pop-val">' + vol + '%</span>' +
    '</div>' +
    musicRow +
    hapticRow;
  document.body.appendChild(pop);
  // Position : sous le bouton, bord droit aligné, clampé dans l'écran.
  var r = btn.getBoundingClientRect();
  var pw = pop.offsetWidth || 210;
  var left = Math.min(r.right - pw, window.innerWidth - pw - 8);
  if (left < 8) left = 8;
  pop.style.top = (r.bottom + 6) + 'px';
  pop.style.left = left + 'px';
  // Câblage
  var mb = pop.querySelector('.sound-pop-mute');
  mb.addEventListener('click', function (ev) { ev.stopPropagation(); toggleSound(); _syncSoundPop(); });
  var rg = pop.querySelector('.sound-pop-range');
  var val = pop.querySelector('.sound-pop-val');
  rg.addEventListener('input', function () {
    var pct = parseInt(rg.value, 10) || 0;
    if (val) val.textContent = pct + '%';
    setSoundVolume(pct / 100);
  });
  rg.addEventListener('change', function () {                // bip de test au niveau choisi
    try { _unlockAudio(); if (_soundEnabled) playTone(660, 0.08, 0.25); } catch(e) {}
  });
  var _mrg = pop.querySelector('.sp-music-range');
  if (_mrg) {
    var _mval = pop.querySelector('.sp-music-val');
    _mrg.addEventListener('input', function () {
      var pct = parseInt(_mrg.value, 10) || 0;
      if (_mval) _mval.textContent = pct + '%';
      try { if (window.Music && typeof window.Music.setVolume === 'function') window.Music.setVolume(pct / 100); } catch (e) {}
    });
  }
  var _hcb = pop.querySelector('.sp-haptic-cb');
  if (_hcb) {
    _hcb.addEventListener('change', function () {
      try { if (typeof window.setHaptic === 'function') window.setHaptic(_hcb.checked); } catch (e) {}
    });
  }
  _soundPop = pop;
  // Fermer au clic extérieur (différé pour ne pas capter le clic d'ouverture).
  setTimeout(function () { document.addEventListener('pointerdown', _soundPopOutside, true); }, 0);
  window.addEventListener('resize', closeSoundPopover);
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
  // Ne JAMAIS se desabonner : iOS re-interrompt le contexte quand la PWA
  // repasse en arriere-plan, et seul un geste utilisateur peut le relancer.
  // En restant abonnes, le prochain tap reveille le son -- au lieu de rester
  // muet jusqu'a fermeture/reouverture de l'app.
  var ctx = getAudioCtx();
  if (ctx && ctx.state === 'running') return;
  _unlockAudio();
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

// Precharge les samples PokerTH des le chargement du module (decodage differe
// au 1er geste). Repli synthe tant qu'un sample n'est pas pret / indisponible.
_fetchSamples();

// ─── Modern ES module exports ───────────────────────────────────────────
export {
  getAudioCtx, playTone, playActionSound, resetBlindRaises,
  notifyCard, notifyAction, notifyFold, notifyRaise, notifyAllIn,
  notifyMyTurn, notifyWinner, notifyBigWin, notifyChat, notifyBlindsUp,
  notifyPlayerConnected, notifyGameReady, notifyLobbyChat,
  notifyTick, notifyTickFinal,
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
window.playActionSound = playActionSound;
window.notifyMyTurn  = notifyMyTurn;
window.notifyWinner  = notifyWinner;
window.notifyBigWin  = notifyBigWin;
window.notifyChat    = notifyChat;
window.notifyBlindsUp = notifyBlindsUp;
window.notifyPlayerConnected = notifyPlayerConnected;
window.notifyGameReady = notifyGameReady;
window.notifyLobbyChat = notifyLobbyChat;
window.resetBlindRaises = resetBlindRaises;
window.notifyTick      = notifyTick;
window.notifyTickFinal = notifyTickFinal;
window.toggleSound   = toggleSound;
window.isSoundEnabled    = isSoundEnabled;
window.getSoundVolume    = getSoundVolume;
window.setSoundVolume    = setSoundVolume;
window.toggleSoundPopover = toggleSoundPopover;
window.closeSoundPopover  = closeSoundPopover;

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
  getAudioCtx, playTone, playActionSound, resetBlindRaises,
  notifyCard, notifyAction, notifyFold, notifyRaise, notifyAllIn,
  notifyMyTurn, notifyWinner, notifyBigWin, notifyChat, notifyBlindsUp,
  notifyPlayerConnected, notifyGameReady, notifyLobbyChat,
  notifyTick, notifyTickFinal,
  toggleSound, isSoundEnabled,
};
