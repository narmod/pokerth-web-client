// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/music.mjs — background-music controller (HTMLAudio + manifest)
//
// A small, self-contained lounge / background-music player, independent from
// the oscillator sound-EFFECTS engine in sounds.mjs. The track list is
// data-driven from /music/tracks.json and presented as a DROPDOWN that
// auto-refreshes every time the panel opens, so tracks added later (e.g. via
// the future admin tool) show up automatically with no reload. The UI is
// multilingual: every label/title carries data-i18n / data-i18n-title, so the
// app's setLang() pass re-translates the panel live on a language switch.
// Mirrors the window.* alias pattern of the other modules.
//
// Repeat modes are quick icon buttons in the transport row (universal glyphs):
//   🔂 'one' — loop the current track forever (HTMLAudio loop; default)
//   🔁 'all' — loop the whole playlist (advance at end, wrap to the first)
//   neither lit → 'off' — play the current track once, then stop
//
// No autoplay: browsers (iOS especially) refuse audio without a user gesture,
// so playback only ever begins from a tap on Play (or a dropdown change while
// already playing). The selected track, the volume and the repeat mode are
// remembered in localStorage; playback itself is NOT auto-resumed on load.
//
//   window.Music.toggleTrack(id) / play(id) / pause() / stop()
//   window.Music.next() / prev()
//   window.Music.setVolume(v) / getVolume()
//   window.Music.setRepeat(mode) / getRepeat()     mode = 'one' | 'all' | 'off'
//   window.Music.mount(bodyEl)   — render the player UI into a container element
//   window.Music.refresh()       — re-fetch the manifest + re-render the list
//   window.Music.isPlaying() / current() / tracks()
// ─────────────────────────────────────────────────────────────────────────

// Manifest entries may also be LIVE RADIO STREAMS: { stream: true, file: <url> }.
// Streams get a LIVE badge, no seek/duration, auto-reconnect on drop, and the
// usual credit/licenseUrl line for attribution. Stations must be HTTPS (mixed
// content) and ideally CORS-enabled; non-CORS stations fall back to a plain
// audio element outside the WebAudio graph (see _playBypass).
const MANIFEST_URL = '/music/tracks.json';
const LS_TRACK  = 'pth_music_track';
const LS_VOL    = 'pth_music_vol';
const LS_REPEAT = 'pth_music_repeat';
const LS_SHUFFLE = 'pth_music_shuffle';
const LS_BALANCE = 'pth_music_balance';
const LS_MODE    = 'pth_music_mode';

let _tracks = [];
let _audio  = null;
let _curId  = null;
let _loaded = false;
let _bodyEl = null;
let _repeat = 'all';   // défaut: boucle playlist | 'one' = loop track | 'off' = play once
let _seeking = false;  // true while the user drags the seek bar (don't let timeupdate fight the thumb)
let _durProbed = false; // true once this track's total duration is resolved (see _probeDuration)
let _probedDur = 0;     // duration resolved off a detached probe element (when the live one says Infinity)
let _shuffle = false;   // random-order playback (orthogonal to repeat mode)
let _lcdRemain = false; // LCD time display: false = elapsed, true = remaining (-M:SS)

// Web Audio routing. On iOS/WebKit, HTMLMediaElement.volume is read-only, so
// `audio.volume = x` is silently ignored (volume is hardware-only there). Routing
// playback through a GainNode lets us control the level on EVERY platform. The
// graph is built lazily on the first user gesture: createMediaElementSource can
// run only once per element, and on iOS the AudioContext must be created/resumed
// from inside a real interaction. If Web Audio is unavailable we fall back to the
// element's own volume (the pre-existing behaviour, fine off iOS).
let _ctx = null, _srcNode = null, _gain = null, _waReady = false, _waFailed = false;
let _panner = null, _analyser = null, _vuData = null, _vuRAF = 0, _vuDead = false, _vuZeroFrames = 0;
// Consecutive graph rebuilds after an iOS interruption (see _rebuildWebAudio).
const WA_MAX_REBUILD = 4;
let _waRebuilds = 0;
let _msReady = false;
let _shade = false;   // mode compact « windowshade »
// ── Radios (flux live) ──
// Un flux Icecast/Shoutcast est joué d'abord sur l'élément principal en CORS
// (crossorigin="anonymous"), pour garder le graphe WebAudio (volume iOS, VU,
// fondus). Si la station ne sert pas Access-Control-Allow-Origin, le chargement
// échoue → repli automatique sur un 2e élément SANS crossorigin, hors graphe
// (une source cross-origin non-CORS dans le graphe sortirait en silence total).
// Limite du repli : volume via element.volume (sans effet sur iOS), VU éteint.
let _radioEl = null;    // élément de secours hors WebAudio
let _bypass  = false;   // true = la lecture courante passe par _radioEl
let _corsTried = false; // un flux vient d'être tenté en CORS (erreur ⇒ repli)
let _mode  = 'pl';      // onglet actif de la liste : 'pl' (pistes) | 'radio' (flux live)
let _plOpen = false;    // liste dépliée (préservé à travers les re-rendus)
let _fadePauseTimer = null;
const FADE = 0.45;   // durée du fondu (s)
// ── Lecture hors-réseau (préchargement Blob) ──
// Sur iPhone, un basculement Wi-Fi ↔ cellulaire tue la requête HTTP en vol et
// l'élément <audio> ne s'en remet pas tout seul : le watchdog attend jusqu'à
// WD_STALL (6 s) sans progression avant de réagir, ce qui s'entend comme une
// coupure. En chargeant la piste ENTIÈRE dans un Blob et en lisant depuis un
// object URL, plus aucune requête n'est en vol pendant la lecture : le handover
// devient inaudible. Réservé aux pistes locales — un direct radio est par
// nature un flux continu et ne peut pas être mis en mémoire.
const BLOB_MAX_BYTES = 32 * 1024 * 1024;  // au-delà, on reste en streaming réseau
const BLOB_KEEP      = 3;                 // object URLs conservés en mémoire
const LS_PRELOAD     = 'pokerth.music.preload';
let _blobUrl   = Object.create(null);     // id -> object URL prêt
let _blobPend  = Object.create(null);     // id -> requête en cours (partagée)
let _blobOrder = [];                      // ids, du plus ancien au plus récent
// ── Network watchdog (see the _wd* block below) ──
const WD_TICK    = 2000;                               // progress poll (ms)
const WD_STALL   = 6000;                               // no progress for this long → recover (ms)
const WD_MAX     = 20;                                 // give up after this many consecutive attempts
const WD_BACKOFF = [500, 1000, 2000, 4000, 8000, 15000];
let _wdIntent = false;  // the user asked for sound and never stopped it
let _wdTimer  = 0;      // progress-poll interval id
let _wdRetry  = 0;      // back-off timeout id
let _wdPos    = 0;      // last observed playback position
let _wdAt     = 0;      // timestamp (ms) of the last real progress
let _wdTries  = 0;      // consecutive recovery attempts (back-off index)
let _wdBusy   = false;  // a recovery is in flight
// StereoPannerNode support, probed WITHOUT creating an AudioContext (iOS-safe).
const _hasPan = (function () { var AC = window.AudioContext || window.webkitAudioContext; return !!(AC && AC.prototype && AC.prototype.createStereoPanner); })();

function _t(key, fallback) {
  try { if (typeof window.t === 'function') { var s = window.t(key); if (s && s !== key) return s; } } catch (e) {}
  return fallback;
}
function _esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

function _clampVol(v) { v = parseFloat(v); if (isNaN(v)) return 0.5; return Math.max(0, Math.min(1, v)); }
function getVolume() { try { var v = localStorage.getItem(LS_VOL); return v == null ? 0.5 : _clampVol(v); } catch (e) { return 0.5; } }
function setVolume(v) {
  v = _clampVol(v);
  try { localStorage.setItem(LS_VOL, String(v)); } catch (e) {}
  _applyVol(v);
  _render();
}

function _clampBal(v) { v = parseFloat(v); if (isNaN(v)) return 0; return Math.max(-1, Math.min(1, v)); }
function getBalance() { try { var v = localStorage.getItem(LS_BALANCE); return v == null ? 0 : _clampBal(v); } catch (e) { return 0; } }
function _applyBalance(x) { if (_panner) { try { _panner.pan.value = x; } catch (e) {} } }
function setBalance(x) { x = _clampBal(x); try { localStorage.setItem(LS_BALANCE, String(x)); } catch (e) {} _applyBalance(x); }
function getShuffle() { return _shuffle; }
function setShuffle(on) {
  _shuffle = !!on;
  try { localStorage.setItem(LS_SHUFFLE, _shuffle ? '1' : '0'); } catch (e) {}
  _render();
}
// Pick a random id within the group, different from the current one (no
// immediate repeat unless the group has a single entry). Shuffle helper.
function _randId(g) {
  if (g.length < 2) return g[0] ? g[0].id : _curId;
  var cur = _gIndex(_curId, g), j;
  do { j = Math.floor(Math.random() * g.length); } while (j === cur);
  return g[j].id;
}
function getRepeat() { return _repeat; }
function setRepeat(m) {
  if (m !== 'one' && m !== 'all' && m !== 'off') return;
  _repeat = m;
  try { localStorage.setItem(LS_REPEAT, m); } catch (e) {}
  if (_audio) try { _audio.loop = (m === 'one'); } catch (e) {}
  _render();
}

// Wiring for the main element, kept separate from _el() because the element is
// rebuilt from scratch when the Web Audio graph is rebuilt (see below).
function _wireMainEl(a) {
  ['play', 'pause'].forEach(function (ev) { a.addEventListener(ev, _render); });
  a.addEventListener('error', _onMainError);
  a.addEventListener('ended', _onEnded);
  // Progress wiring — bound ONCE on the persistent element (not per-render),
  // updates whatever progress row currently exists in the panel.
  ['timeupdate', 'loadedmetadata', 'durationchange', 'seeked'].forEach(function (ev) { a.addEventListener(ev, _renderProgress); });
  a.addEventListener('loadedmetadata', _probeDuration);
  // Network watchdog: these fire when the transport dies mid-track.
  ['stalled', 'waiting', 'suspend'].forEach(function (ev) { a.addEventListener(ev, function () { _wdSchedule(); }); });
  // Sound is really flowing again → the rebuild budget is refilled.
  a.addEventListener('playing', function () { _waRebuilds = 0; _wdOk(); });
  return a;
}
function _el() {
  if (!_audio) {
    _audio = new Audio();
    _audio.loop = (_repeat === 'one');
    _audio.preload = 'none';
    try { _audio.volume = getVolume(); } catch (e) {}
    _wireMainEl(_audio);
  }
  return _audio;
}
function _radioElInit() {
  if (!_radioEl) {
    _radioEl = new Audio();
    _radioEl.preload = 'none';
    ['play', 'pause', 'error'].forEach(function (ev) { _radioEl.addEventListener(ev, _render); });
    _radioEl.addEventListener('ended', _onEnded);
    ['timeupdate', 'loadedmetadata', 'durationchange'].forEach(function (ev) { _radioEl.addEventListener(ev, _renderProgress); });
    ['stalled', 'waiting', 'error'].forEach(function (ev) { _radioEl.addEventListener(ev, function () { _wdSchedule(); }); });
    _radioEl.addEventListener('playing', function () { _wdOk(); });
  }
  return _radioEl;
}
// Erreur sur l'élément principal : si c'était une tentative CORS sur un flux
// radio, rejouer sur l'élément de secours ; sinon, simple re-rendu.
function _onMainError() {
  var t = _byId(_curId);
  if (_isStream(t) && _corsTried && !_bypass) {
    _corsTried = false;
    t._noCors = true;                     // mémo : prochaine fois, repli direct
    _playBypass(t);
    return;
  }
  _wdSchedule();
  _render();
}
function _playBypass(t) {
  var r = _radioElInit();
  _bypass = true;
  try { _audio.pause(); _audio.removeAttribute('src'); _audio.load(); } catch (e) {}
  r.src = t.file;
  _applyVol(getVolume());
  try { var p = r.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  _render();
}
function _onEnded() {
  if (_curIsStream()) {                       // un direct ne « finit » pas : coupure réseau → une reprise
    var el = _active(), t = _byId(_curId);
    if (el && t) { try { el.src = t.file; var p = el.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
    _render(); return;
  }
  if (_repeat === 'all') { next(); return; }   // advance through the playlist (wraps)
  // 'off' — stop at the end ('one' never fires 'ended' since loop=true).
  _wdDisarm();
  if (_audio) { try { _audio.currentTime = 0; } catch (e) {} }
  _render();
}

// ── Network watchdog: auto-resume after a drop or a Wi-Fi↔cellular handover ──
// An <audio> element exposes no control over buffer depth: on iPhone a network
// handover kills the in-flight HTTP request and playback stops for good, with no
// event that recovers on its own. So we poll the real progress of currentTime and
// restart playback ourselves — a plain play() first, then a full source reload
// with a re-seek to the remembered position (live streams rejoin the live edge).
function _wdMark(now) { var el = _active(); _wdPos = el ? (el.currentTime || 0) : 0; _wdAt = now || Date.now(); }
function _wdArm() {
  _wdIntent = true; _wdTries = 0; _wdBusy = false;
  if (_wdRetry) { clearTimeout(_wdRetry); _wdRetry = 0; }
  _wdMark();
  if (!_wdTimer) _wdTimer = setInterval(function () { _wdTick(); }, WD_TICK);
}
function _wdDisarm() {
  _wdIntent = false; _wdTries = 0; _wdBusy = false;
  if (_wdTimer) { clearInterval(_wdTimer); _wdTimer = 0; }
  if (_wdRetry) { clearTimeout(_wdRetry); _wdRetry = 0; }
}
function _wdOk() {
  if (!_wdIntent) return;
  _wdTries = 0; _wdBusy = false;
  if (_wdRetry) { clearTimeout(_wdRetry); _wdRetry = 0; }
  _wdMark();
}
function _wdTick(now) {
  now = now || Date.now();
  if (!_wdIntent) { _wdDisarm(); return; }
  if (_wdBusy || _wdRetry) return;
  var el = _active();
  if (!el) return;
  if (el.paused) { _wdSchedule(); return; }        // the system paused us (network drop)
  var pos = el.currentTime || 0;
  if (pos !== _wdPos) { _wdPos = pos; _wdAt = now; _wdTries = 0; return; }
  if (now - _wdAt >= WD_STALL) _wdSchedule();
}
function getPreload() {
  try { return localStorage.getItem(LS_PRELOAD) !== '0'; } catch (e) { return true; }
}
function setPreload(on) {
  try { localStorage.setItem(LS_PRELOAD, on ? '1' : '0'); } catch (e) {}
  if (!on) _blobPurge(true);
}
function _blobForget(id) {
  var u = _blobUrl[id];
  if (u) { try { URL.revokeObjectURL(u); } catch (e) {} }
  delete _blobUrl[id];
  _blobOrder = _blobOrder.filter(function (x) { return x !== id; });
}
// Garde au plus BLOB_KEEP pistes en mémoire, sans jamais lâcher la piste courante.
function _blobPurge(all) {
  if (all) {
    Object.keys(_blobUrl).forEach(_blobForget);
    _blobPend = Object.create(null);
    return;
  }
  var drop = _blobOrder.filter(function (id) { return id !== _curId; });
  while (_blobOrder.length > BLOB_KEEP && drop.length) _blobForget(drop.shift());
}
// Télécharge la piste entière. Mémoïsé : play() et le préchargement de la piste
// suivante partagent la même requête au lieu d'en lancer deux.
function _blobFetch(t) {
  if (!t || _isStream(t) || !getPreload()) return Promise.resolve(null);
  if (typeof fetch !== 'function' || !window.URL || !URL.createObjectURL) return Promise.resolve(null);
  if (_blobUrl[t.id]) return Promise.resolve(_blobUrl[t.id]);
  if (_blobPend[t.id]) return _blobPend[t.id];
  var p = fetch(t.file, { credentials: 'same-origin' }).then(function (r) {
    if (!r.ok) return null;
    var len = parseInt(r.headers.get('content-length') || '0', 10);
    if (len > BLOB_MAX_BYTES) return null;        // trop lourd : on laisse le streaming
    return r.blob();
  }).then(function (b) {
    if (!b || !b.size || b.size > BLOB_MAX_BYTES) return null;
    var u = URL.createObjectURL(b);
    _blobUrl[t.id] = u;
    _blobOrder.push(t.id);
    _blobPurge();
    return u;
  }).catch(function () {
    return null;                                  // hors-ligne, 404, CORS : streaming
  }).then(function (u) {
    delete _blobPend[t.id];
    return u;
  });
  _blobPend[t.id] = p;
  return p;
}
// Bascule à chaud sur le Blob dès qu'il est prêt, position conservée. Coût : un
// hoquet très bref au moment du swap, contre plusieurs secondes de silence au
// prochain changement de réseau.
function _blobSwap(id, url) {
  if (!url || id !== _curId || _bypass) return;
  var el = _audio;
  if (!el) return;
  var cur = '';
  try { cur = el.currentSrc || el.src || ''; } catch (e) {}
  if (!cur || cur === url || cur.indexOf('blob:') === 0) return;   // déjà hors-réseau
  var pos = 0, playing = false;
  try { pos = Math.max(0, el.currentTime || 0); } catch (e) {}
  try { playing = !el.paused && !el.ended; } catch (e) {}
  var seek = function () {
    try { el.removeEventListener('loadedmetadata', seek); } catch (e) {}
    try { if (pos > 0) el.currentTime = pos; } catch (e) {}
  };
  try { el.addEventListener('loadedmetadata', seek); } catch (e) {}
  try { el.src = url; el.load(); } catch (e) { return; }
  if (playing) { try { var p = el.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
}
function _wdSchedule() {
  if (!_wdIntent || _wdBusy || _wdRetry) return;
  if (_wdTries >= WD_MAX) { _wdDisarm(); _render(); return; }   // hopeless (missing file, no network at all)
  var d = WD_BACKOFF[Math.min(_wdTries, WD_BACKOFF.length - 1)];
  _wdTries++;
  _wdRetry = setTimeout(function () { _wdRetry = 0; _wdRecover(); }, d);
}
function _wdRecover() {
  if (!_wdIntent || _wdBusy) return;
  var t = _byId(_curId), el = _active();
  if (!t || !el) return;
  _wdBusy = true;
  _resumeCtx();                                    // iOS: the context may sit in 'interrupted'
  var stream = _isStream(t);
  var pos  = stream ? 0 : Math.max(0, el.currentTime || 0);
  var hard = _wdTries > 1 || !!el.error || !el.src;
  if (hard) {                                      // soft play() already failed → new HTTP request
    if (!stream && pos > 0) {
      var seekBack = function () {
        try { el.removeEventListener('loadedmetadata', seekBack); } catch (e) {}
        try { el.currentTime = pos; } catch (e) {}
      };
      try { el.addEventListener('loadedmetadata', seekBack); } catch (e) {}
    }
    try { el.src = (!stream && _blobUrl[t.id]) || t.file; el.load(); } catch (e) {}
  }
  var done = function () { _wdBusy = false; _applyVol(getVolume()); _wdMark(); _render(); };
  var fail = function () { _wdBusy = false; _wdSchedule(); };
  try {
    var p = el.play();
    if (p && p.then) p.then(done, fail); else done();
  } catch (e) { fail(); }
}
function _wdState() { return { intent: _wdIntent, tries: _wdTries, busy: _wdBusy, retry: !!_wdRetry, pos: _wdPos, at: _wdAt }; }
// Recover as soon as the OS reports connectivity back, or when the app returns
// to the foreground after an interruption (call, tunnel, screen lock).
try { window.addEventListener('online', function () {
  if (!_wdIntent) return;
  _wdTries = 0;
  if (_wdRetry) { clearTimeout(_wdRetry); _wdRetry = 0; }
  _wdRecover();
}); } catch (e) {}
try { window.addEventListener('pageshow', function () { if (_wdIntent) { _resumeCtx(); _wdTick(); } }); } catch (e) {}
try { document.addEventListener('visibilitychange', function () { if (!document.hidden && _wdIntent) { _resumeCtx(); _wdTick(); } }); } catch (e) {}

// Route the desired volume to the gain node once the graph exists, otherwise to
// the element directly (no-op on iOS, but the gain node takes over on first play).
function _applyVol(v) {
  if (_bypass) { if (_radioEl) try { _radioEl.volume = v; } catch (e) {} return; }
  if (_waReady && _gain) { try { _gain.gain.value = v; } catch (e) {} }
  else if (_audio)       { try { _audio.volume = v; } catch (e) {} }
}
// Build the AudioContext → MediaElementSource → GainNode → destination graph once.
function _ensureWebAudio() {
  if (_waReady || _waFailed) return _waReady;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || !_audio) { _waFailed = true; return false; }
    _ctx = new AC();
    _srcNode = _ctx.createMediaElementSource(_audio);   // once per element only
    _gain = _ctx.createGain();
    _gain.gain.value = getVolume();
    // Analyser placed IN SERIES (pass-through) so it actually receives samples
    // on iOS/Safari, where an analyser not routed toward destination stays silent.
    try { _analyser = _ctx.createAnalyser(); _analyser.fftSize = 64; _analyser.smoothingTimeConstant = 0.8; } catch (e) { _analyser = null; }
    _srcNode.connect(_gain);
    var _tail = _gain;
    if (_analyser) { _tail.connect(_analyser); _tail = _analyser; }   // series tap
    if (_ctx.createStereoPanner) {
      _panner = _ctx.createStereoPanner();
      try { _panner.pan.value = getBalance(); } catch (e) {}
      _tail.connect(_panner); _panner.connect(_ctx.destination);
    } else {
      _tail.connect(_ctx.destination);
    }
    try { _audio.volume = 1; } catch (e) {}   // element at unity; the gain attenuates (works on iOS)
    _waReady = true;
    return true;
  } catch (e) { _waFailed = true; return false; }
}
// iOS parks an AudioContext in 'interrupted' on an incoming call, Siri, another
// app grabbing the output, or the PWA going to the background — and from there
// resume() frequently never comes back (sounds.mjs documents the same thing and
// simply throws its context away). The player cannot do that as cheaply, because
// createMediaElementSource() may be called only ONCE per element: the <audio>
// element has to be rebuilt together with the context. Left alone, the element
// keeps playing into a dead graph, which is heard as stuttering or silence, and
// the VU meter self-kills on the resulting run of zero-sample frames.
//
// Capped on purpose: every new AudioContext claims a hardware audio device on
// iOS, so retrying forever against a device that refuses to start would make
// things worse rather than better. The budget refills as soon as the element
// reports 'playing' again, so only CONSECUTIVE failures count.
function _rebuildWebAudio() {
  if (_bypass) return false;              // radio fallback already runs outside the graph
  if (!_waReady || _waRebuilds >= WA_MAX_REBUILD) return false;
  _waRebuilds++;
  var src = '', pos = 0, wasPlaying = false, loop = false;
  var old = _audio;
  if (old) {
    try { src = old.currentSrc || old.src || ''; } catch (e) {}
    try { pos = Math.max(0, old.currentTime || 0); } catch (e) {}
    try { wasPlaying = !old.paused && !old.ended; } catch (e) {}
    try { loop = !!old.loop; } catch (e) {}
    try { old.pause(); old.removeAttribute('src'); old.load(); } catch (e) {}
  }
  [_srcNode, _gain, _analyser, _panner].forEach(function (n) {
    if (n) { try { n.disconnect(); } catch (e) {} }
  });
  if (_ctx) { try { var c = _ctx.close(); if (c && c.catch) c.catch(function () {}); } catch (e) {} }
  _ctx = null; _srcNode = null; _gain = null; _analyser = null; _panner = null;
  _waReady = false; _waFailed = false;    // let _ensureWebAudio try again on the new element
  _vuData = null; _vuDead = false; _vuZeroFrames = 0;   // the VU died with the old graph
  _audio = null;                          // _el() builds AND wires a fresh element
  var a = _el();
  try { a.loop = loop; } catch (e) {}
  _ensureWebAudio();                      // failure is fine: falls back to element volume
  if (src) {
    try { a.src = src; a.load(); } catch (e) {}
    if (pos > 0 && !_curIsStream()) {
      a.addEventListener('loadedmetadata', function once() {
        a.removeEventListener('loadedmetadata', once);
        try { a.currentTime = pos; } catch (e) {}
      });
    }
    if (wasPlaying) { try { var p = a.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
  }
  _render();
  return true;
}
function _resumeCtx() {
  if (_ctx && (_ctx.state === 'interrupted' || _ctx.state === 'closed')) _rebuildWebAudio();
  if (_ctx && _ctx.state !== 'running' && _ctx.resume) {
    try { var p = _ctx.resume(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }
}
// Create + unlock the audio graph synchronously inside a user gesture (iOS needs
// the context created/resumed from a real interaction, before any await).
function _unlockAudio() { _el(); _ensureWebAudio(); _resumeCtx(); _setupMediaSession(); }

async function loadManifest(force) {
  if (_loaded && !force) return _tracks;
  try {
    var r = await fetch(MANIFEST_URL, { cache: 'no-cache' });
    var j = await r.json();
    var arr = Array.isArray(j) ? j : (j && j.tracks) || [];
    _tracks = arr
      .filter(function (t) { return t && t.file && t.active !== false; })
      .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    var _ord = null; try { _ord = JSON.parse(localStorage.getItem('pth_music_order') || 'null'); } catch (e) {}
    if (Array.isArray(_ord) && _ord.length) {
      var _pos = {}; _ord.forEach(function (id, k) { _pos[id] = k; });
      _tracks.sort(function (a, b) { return ((a.id in _pos) ? _pos[a.id] : 1e9) - ((b.id in _pos) ? _pos[b.id] : 1e9); });
    }
  } catch (e) { _tracks = []; }
  _loaded = true;
  return _tracks;
}

function tracks()    { return _tracks.slice(); }
function current()   { return _curId; }
function isPlaying() { var el = _active(); return !!(el && !el.paused); }
function _index(id)  { for (var i = 0; i < _tracks.length; i++) if (_tracks[i].id === id) return i; return -1; }
function _isStream(t)   { return !!(t && t.stream); }
function _curIsStream() { return _isStream(_byId(_curId)); }
function _active()      { return (_bypass && _radioEl) ? _radioEl : _audio; }
// Groupes : la navigation (next/prev/shuffle/répétition) reste DANS l'onglet
// courant — la playlist n'enchaîne jamais sur une radio et inversement.
function _group(m)      { m = m || _mode; return _tracks.filter(function (t) { return _isStream(t) === (m === 'radio'); }); }
function _gIndex(id, g) { g = g || _group(); for (var i = 0; i < g.length; i++) if (g[i].id === id) return i; return -1; }
function getMode()      { return _mode; }
function setMode(m) {
  if (m !== 'pl' && m !== 'radio') return;
  if (_mode !== m) { _mode = m; try { localStorage.setItem(LS_MODE, m); } catch (e) {} }
  _render();
}
function _byId(id)   { var i = _index(id); return i >= 0 ? _tracks[i] : null; }

// Comptage anonyme des lectures : un ping sans identifiant de visiteur quand
// une piste DÉMARRE, pour que le tableau de bord admin sache quels morceaux
// gardent leur place dans la playlist. Une reprise après pause ne compte pas
// (la source est déjà chargée), les radios non plus — un flux n'a pas de fin
// de piste. Envoi au mieux : un échec est ignoré, la lecture prime.
function _countPlay(t) {
  if (!t || _isStream(t)) return;
  try {
    var body = JSON.stringify({ id: t.id });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/__music', new Blob([body], { type: 'application/json' }));
      return;
    }
    fetch('/__music', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true })
      .catch(function () {});
  } catch (e) {}
}

async function play(id) {
  await loadManifest();
  var t = id ? _byId(id) : (_byId(_curId) || _group()[0] || _tracks[0]);
  if (!t) { _render(); return; }
  var stream = _isStream(t);
  if ((_mode === 'radio') !== stream) {    // lecture hors onglet → suivre la piste
    _mode = stream ? 'radio' : 'pl';
    try { localStorage.setItem(LS_MODE, _mode); } catch (e) {}
  }
  var a = _el();
  var fresh = (_curId !== t.id) || !_active().src;   // nouvelle piste, ou source à (re)charger
  if (fresh) {
    _curId = t.id;
    _durProbed = stream;  // pas de sonde de durée sur un direct (durée = Infinity)
    _probedDur = 0;
    try { localStorage.setItem(LS_TRACK, t.id); } catch (e) {}
    if (stream && t._noCors) {            // station connue sans CORS → repli direct
      _radioElInit().src = t.file;
      _bypass = true;
      try { a.pause(); a.removeAttribute('src'); a.load(); } catch (e) {}
    } else {
      if (_bypass && _radioEl) { try { _radioEl.pause(); _radioEl.removeAttribute('src'); _radioEl.load(); } catch (e) {} }
      _bypass = false;
      _corsTried = stream;                // erreur de chargement ⇒ _onMainError tentera le repli
      try { if (stream) a.crossOrigin = 'anonymous'; else a.removeAttribute('crossorigin'); } catch (e) {}
      a.src = _blobUrl[t.id] || t.file;
    }
  }
  var el = _active();
  _ensureWebAudio(); _resumeCtx();        // build/unlock the audio graph (covers programmatic play too)
  if (_fadePauseTimer) { clearTimeout(_fadePauseTimer); _fadePauseTimer = null; }
  // Fondu d'entrée : gain à 0 avant lecture, puis montée vers le volume (hors bypass).
  if (!_bypass && _waReady && _gain && _ctx) { try { _gain.gain.cancelScheduledValues(_ctx.currentTime); _gain.gain.setValueAtTime(0, _ctx.currentTime); } catch (e) {} }
  else { _applyVol(getVolume()); }
  try { await el.play(); _wdArm(); if (fresh) _countPlay(t); } catch (e) { _wdDisarm(); /* gesture/load issue — UI reflects paused */ }
  // Lecture lancée : on la met à l'abri du réseau. Le fetch part APRÈS play()
  // pour ne pas consommer le geste utilisateur — sur iOS, attendre une promesse
  // avant play() fait perdre l'autorisation de lecture.
  if (!stream && !_bypass) {
    var pid = t.id;
    _blobFetch(t).then(function (u) { _blobSwap(pid, u); });
    var g = _group('pl');
    if (g.length > 1) {
      var gi = _gIndex(pid, g);
      if (gi >= 0) _blobFetch(g[(gi + 1) % g.length]);   // enchaînement sans réseau
    }
  }
  if (_bypass || !_fadeTo(getVolume(), FADE)) _applyVol(getVolume());
  _render();
}
function pause() {
  _wdDisarm();
  var el = _active();
  if (!el) { _render(); return; }
  if (!_bypass && _waReady && _gain && _ctx && !el.paused) {
    _fadeTo(0, 0.35);
    if (_fadePauseTimer) clearTimeout(_fadePauseTimer);
    _fadePauseTimer = setTimeout(function () { _fadePauseTimer = null; try { _audio.pause(); } catch (e) {} }, 360);
    return;   // le 'pause' event rendra l'UI à l'arrêt réel
  }
  try { el.pause(); } catch (e) {}
  _render();
}
function stop()  {
  _wdDisarm();
  if (_fadePauseTimer) { clearTimeout(_fadePauseTimer); _fadePauseTimer = null; }
  var el = _active();
  if (el) {
    try {
      el.pause();
      if (_curIsStream()) { el.removeAttribute('src'); el.load(); }   // couper le flux (bande passante)
      else el.currentTime = 0;
    } catch (e) {}
  }
  _render();
}
function toggleTrack(id) {
  if (id && id !== _curId) return play(id);
  if (isPlaying()) { pause(); return Promise.resolve(); }
  return play(id);
}
function next() { var g = _group(); if (g.length < 2) return play((g[0] && g[0].id) || _curId); if (_shuffle) return play(_randId(g)); var i = _gIndex(_curId, g); if (i < 0) i = 0; return play(g[(i + 1) % g.length].id); }
function prev() { var g = _group(); if (g.length < 2) return play((g[0] && g[0].id) || _curId); if (_shuffle) return play(_randId(g)); var i = _gIndex(_curId, g); if (i < 0) i = 0; return play(g[(i - 1 + g.length) % g.length].id); }

// ── Playback position / seeking ──
// VBR / streamed MP3s advertise duration=Infinity until the browser scans the
// whole file, leaving the total time stuck at 0:00 — and iOS never resolves it
// from the element at all. So when the element can't tell us the duration, read
// it straight from the file: fetch the first KBs and parse the MP3 Xing/Info
// header (exact frame count) with a CBR fallback. Pure fetch + arithmetic, works
// identically on iOS. Result lands in _probedDur, which getDuration() falls back to.
function _probeDuration() {
  if (!_audio || _durProbed || _curIsStream()) return;
  var d = _audio.duration;
  if (isFinite(d) && d > 0) { _durProbed = true; return; }   // element already knows it
  _durProbed = true;                                         // resolve at most once per track
  var t = _byId(_curId);
  var url = (t && t.file) || _audio.currentSrc || _audio.src;
  if (!url) return;
  _parseMp3Duration(url).then(function (sec) {
    if (sec > 0 && isFinite(sec)) { _probedDur = sec; _renderProgress(); }
  });
}
// Fetch the head of the MP3 and derive its duration from the frame/Xing header.
async function _parseMp3Duration(url) {
  try {
    var resp = await fetch(url, { headers: { 'Range': 'bytes=0-65535' }, cache: 'force-cache' });
    if (!resp.ok && resp.status !== 206) return 0;
    var buf = new Uint8Array(await resp.arrayBuffer());
    var total = 0;
    var cr = resp.headers.get('Content-Range');
    if (cr) { var m = /\/(\d+)/.exec(cr); if (m) total = parseInt(m[1], 10); }
    else { var cl = resp.headers.get('Content-Length'); if (cl) total = parseInt(cl, 10); }
    return _mp3DurationFromBytes(buf, total);
  } catch (e) { return 0; }
}
function _mp3DurationFromBytes(b, totalSize) {
  var n = b.length, i = 0;
  if (n > 10 && b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) {   // skip ID3v2
    i = 10 + (((b[6] & 0x7f) << 21) | ((b[7] & 0x7f) << 14) | ((b[8] & 0x7f) << 7) | (b[9] & 0x7f));
  }
  while (i < n - 4 && !(b[i] === 0xFF && (b[i + 1] & 0xE0) === 0xE0)) i++;   // frame sync
  if (i >= n - 4) return 0;
  var h1 = b[i + 1], h2 = b[i + 2], h3 = b[i + 3];
  var ver = (h1 >> 3) & 3, brIdx = (h2 >> 4) & 0x0F, srIdx = (h2 >> 2) & 3, ch = (h3 >> 6) & 3;
  var mpeg1 = (ver === 3);
  var srTab = mpeg1 ? [44100, 48000, 32000, 0] : (ver === 2 ? [22050, 24000, 16000, 0] : [11025, 12000, 8000, 0]);
  var sr = srTab[srIdx]; if (!sr) return 0;
  var brTab = mpeg1 ? [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0]
                    : [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0];
  var br = brTab[brIdx];                                     // kbps
  var spf = mpeg1 ? 1152 : 576;                              // samples per frame (Layer III)
  var off = i + (mpeg1 ? (ch === 3 ? 21 : 36) : (ch === 3 ? 13 : 21));   // Xing/Info tag offset
  var isXing = off + 8 <= n && ((b[off] === 0x58 && b[off+1] === 0x69 && b[off+2] === 0x6E && b[off+3] === 0x67) ||   // "Xing"
                                (b[off] === 0x49 && b[off+1] === 0x6E && b[off+2] === 0x66 && b[off+3] === 0x6F));    // "Info"
  if (isXing) {
    var flags = (b[off+4] << 24) | (b[off+5] << 16) | (b[off+6] << 8) | b[off+7];
    if (flags & 1) {
      var fo = off + 8;
      var frames = (b[fo] << 24) | (b[fo+1] << 16) | (b[fo+2] << 8) | b[fo+3];
      if (frames > 0) return frames * spf / sr;
    }
  }
  if (br > 0 && totalSize > i) return (totalSize - i) * 8 / (br * 1000);   // CBR fallback
  return 0;
}
function getDuration()    { try { var el = _active(); var d = el ? el.duration : 0; if (isFinite(d) && d > 0) return d; return _probedDur > 0 ? _probedDur : 0; } catch (e) { return 0; } }
function getCurrentTime() { try { var el = _active(); return el ? (el.currentTime || 0) : 0; } catch (e) { return 0; } }
function seek(t) {
  var d = getDuration(); if (!_active() || !d || _curIsStream()) return;
  t = Math.max(0, Math.min(d, t));
  try { _active().currentTime = t; } catch (e) {}
  _renderProgress();
}
// LCD time label honouring the elapsed/remaining toggle (_lcdRemain).
function _curLabel(c, d, canSeek) {
  return (_lcdRemain && canSeek) ? '-' + _fmtTime(Math.max(0, d - c)) : _fmtTime(c);
}
function _fmtTime(s) {
  s = Math.floor(s || 0); if (!isFinite(s) || s < 0) s = 0;
  var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  var mm = (h && m < 10) ? '0' + m : '' + m;
  return (h ? h + ':' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
}
// Lightweight in-place refresh of the progress row — called on timeupdate / metadata,
// NEVER rebuilds the panel (would break the select + the drag while seeking).
function _renderProgress() {
  if (!_bodyEl) return;
  var seekEl = _bodyEl.querySelector('.music-seek');
  var curEl  = _bodyEl.querySelector('.music-cur');
  var durEl  = _bodyEl.querySelector('.music-dur');
  if (!seekEl && !curEl && !durEl) return;
  var d = getDuration(), c = getCurrentTime(), canSeek = d > 0;
  var live = _curIsStream();
  if (live) canSeek = false;                   // pas de seek sur un direct
  if (!isFinite(c) || c < 0) c = 0;
  if (canSeek && c > d) c = d;                 // never display/seek beyond the track
  if (!canSeek && !live && c > 86400) c = 0;   // guard against a probe leaving a huge currentTime
  if (durEl) { durEl.textContent = live ? 'LIVE' : (canSeek ? _fmtTime(d) : '0:00'); durEl.classList.toggle('music-live', live); }
  if (!_seeking && curEl) curEl.textContent = _curLabel(c, d, canSeek);
  if (seekEl) {
    seekEl.disabled = !canSeek;
    if (!_seeking) seekEl.value = canSeek ? Math.round(c / d * 1000) : 0;
  }
  _updateMediaSessionPos();
}

// ── UI ──
function mount(bodyEl) {
  if (bodyEl) _bodyEl = bodyEl;
  _render();          // immediate skeleton from whatever we already have
  _ensureShadeBtn();  // bouton de repli dans la barre de titre du panneau
  return refresh();   // force-refresh the manifest + re-render (auto-updating list)
}

async function refresh() {
  await loadManifest(true);
  if (!_curId) { try { _curId = localStorage.getItem(LS_TRACK) || null; } catch (e) {} }
  if (_curId && _index(_curId) < 0) _curId = null;          // saved track gone from manifest
  if (!_group().length && _group(_mode === 'pl' ? 'radio' : 'pl').length)
    _mode = (_mode === 'pl' ? 'radio' : 'pl');              // onglet vide → basculer sur l'autre
  if (!_curId && _tracks.length) _curId = (_group()[0] || _tracks[0]).id;   // default (not persisted)
  _render();
}

function _icon(name) {
  var P = {
    prev:  '<path d="M6 6v12h2V6z"/><path d="M20 6l-9 6 9 6z"/>',
    next:  '<path d="M16 6v12h2V6z"/><path d="M4 6l9 6-9 6z"/>',
    play:  '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M6 5h4v14H6z"/><path d="M14 5h4v14h-4z"/>',
    stop:  '<rect x="6" y="6" width="12" height="12" rx="1.6"/>',
    shuffle: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h4l8 10h3"/><path d="M16 4l3 3-3 3"/><path d="M4 17h4l2.6-3.25"/><path d="M13.4 9.25L16 7h3"/><path d="M16 20l3-3-3-3"/></g>',
    'rep-all': '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l3 3-3 3"/><path d="M20 6H8a4 4 0 0 0-4 4v1"/><path d="M7 21l-3-3 3-3"/><path d="M4 18h12a4 4 0 0 0 4-4v-1"/></g>',
    'rep-one': '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l3 3-3 3"/><path d="M20 6H8a4 4 0 0 0-4 4v1"/><path d="M7 21l-3-3 3-3"/><path d="M4 18h12a4 4 0 0 0 4-4v-1"/></g><path d="M11.4 10.6l1.4-.9V15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    shade:  '<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    expand: '<path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    'mv-up':   '<path d="M7 14l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    'mv-down': '<path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    volume: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.8a4.5 4.5 0 0 1 0 6.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' + (P[name] || '') + '</svg>';
}
function _render() {
  if (!_bodyEl) return;
  if (!_tracks.length) {
    _bodyEl.innerHTML = '<div class="music-empty" data-i18n="musicNoTracks">' + _esc(_t('musicNoTracks', 'No tracks available')) + '</div>';
    return;
  }
  var playing = isPlaying();
  var grp = _group();
  var cur = _byId(_curId);
  var vol = Math.round(getVolume() * 100);
  var _live = _curIsStream();
  var _dur = getDuration(), _cur = getCurrentTime(), _canSeek = _live ? false : _dur > 0;
  var _pos = _canSeek ? Math.round(_cur / _dur * 1000) : 0;
  var multi = grp.length > 1;
  var ppKey = playing ? 'musicPause' : 'musicPlay';
  var ppIcon = _icon(playing ? 'pause' : 'play');

  var nowTxt = cur ? (_esc(cur.title || cur.id) + (cur.artist ? ' \u2014 ' + _esc(cur.artist) : '')) : '';

  var vuBars = '';
  for (var b = 0; b < 7; b++) vuBars += '<span class="music-vu-bar"></span>';

  var plItems = grp.map(function (t, i) {
    return '<li class="music-pl-item' + (t.id === _curId ? ' is-cur' : '') + '" role="option" tabindex="0"' +
           ' aria-selected="' + (t.id === _curId) + '" data-track-id="' + _esc(t.id) + '">' +
           '<span class="music-pl-num">' + (i + 1) + '</span>' +
           '<span class="music-pl-ttl">' + _esc(t.title || t.id) + (t.artist ? ' \u2014 ' + _esc(t.artist) : '') + '</span>' +
           (_isStream(t) ? '<span class="music-pl-live">LIVE</span>' : '') +
           (t.id === _curId ? '<span class="music-pl-eq">' + (playing ? '\u25B8' : '\u2016') + '</span>' : '') +
           (multi ? '<span class="music-pl-move">' +
             '<button type="button" class="music-pl-mv" data-plmove="up" data-plid="' + _esc(t.id) + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="' + _esc(_t('musicMoveUp', 'Move up')) + '">' + _icon('mv-up') + '</button>' +
             '<button type="button" class="music-pl-mv" data-plmove="down" data-plid="' + _esc(t.id) + '"' + (i === grp.length - 1 ? ' disabled' : '') + ' aria-label="' + _esc(_t('musicMoveDown', 'Move down')) + '">' + _icon('mv-down') + '</button>' +
           '</span>' : '') +
           '</li>';
  }).join('');
  if (!plItems) plItems = '<li class="music-pl-empty" data-i18n="musicNoTracks">' + _esc(_t('musicNoTracks', 'No tracks available')) + '</li>';

  var credit = (cur && cur.credit)
    ? '<div class="music-credit">' + (cur.licenseUrl
        ? '<a href="' + _esc(cur.licenseUrl) + '" target="_blank" rel="noopener noreferrer">' + _esc(cur.credit) + '</a>'
        : _esc(cur.credit)) + '</div>'
    : '';

  _bodyEl.innerHTML =
    '<div class="music-shade-row">' +
      '<button type="button" class="music-tbtn" data-mact="prev"' + (multi ? '' : ' disabled') + ' aria-label="' + _esc(_t('musicPrev', 'Previous')) + '">' + _icon('prev') + '</button>' +
      '<button type="button" class="music-tbtn music-tbtn-main" data-mact="toggle" aria-label="' + _esc(_t(ppKey, playing ? 'Pause' : 'Play')) + '">' + ppIcon + '</button>' +
      '<button type="button" class="music-tbtn" data-mact="next"' + (multi ? '' : ' disabled') + ' aria-label="' + _esc(_t('musicNext', 'Next')) + '">' + _icon('next') + '</button>' +
      '<div class="music-marquee music-shade-mq"><span class="music-marquee-txt">' + (nowTxt || _esc(_t('musicNoTracks', 'No tracks available'))) + '</span></div>' +
    '</div>' +
    '<div class="music-player-box">' +
    // ── LCD : temps (cliquable écoulé/restant) + VU + titre défilant ──
    '<div class="music-lcd">' +
      '<div class="music-lcd-top">' +
        '<span class="music-time music-cur" data-mact="lcd" role="button" tabindex="0" title="' + _esc(_t('musicNowPlaying', 'Now playing')) + '">' + _curLabel(_cur, _dur, _canSeek) + '</span>' +
        ((_vuDead || !playing || _bypass) ? '' : '<span class="music-vu" aria-hidden="true">' + vuBars + '</span>') +
      '</div>' +
      '<div class="music-marquee"><span class="music-marquee-txt">' + (nowTxt || _esc(_t('musicNoTracks', 'No tracks available'))) + '</span></div>' +
    '</div>' +
    // ── barre de position ──
    '<div class="music-seek-row">' +
      '<input type="range" class="music-seek" min="0" max="1000" step="1" value="' + _pos + '"' + (_canSeek ? '' : ' disabled') + ' aria-label="' + _esc(_t('musicNowPlaying', 'Now playing')) + '">' +
      '<span class="music-time music-dur' + (_live ? ' music-live' : '') + '">' + (_live ? 'LIVE' : (_canSeek ? _fmtTime(_dur) : '0:00')) + '</span>' +
    '</div>' +
    // ── transport ──
    '<div class="music-transport">' +
      '<div class="music-trow">' +
      '<button type="button" class="music-tbtn" data-mact="prev"' + (multi ? '' : ' disabled') + ' title="' + _esc(_t('musicPrev', 'Previous')) + '" data-i18n-title="musicPrev">' + _icon('prev') + '</button>' +
      '<button type="button" class="music-tbtn music-tbtn-main" data-mact="toggle" title="' + _esc(_t(ppKey, playing ? 'Pause' : 'Play')) + '" data-i18n-title="' + ppKey + '">' + ppIcon + '</button>' +
      '<button type="button" class="music-tbtn" data-mact="next"' + (multi ? '' : ' disabled') + ' title="' + _esc(_t('musicNext', 'Next')) + '" data-i18n-title="musicNext">' + _icon('next') + '</button>' +
      '<button type="button" class="music-tbtn" data-mact="stop" title="' + _esc(_t('musicStop', 'Stop')) + '" data-i18n-title="musicStop">' + _icon('stop') + '</button>' +
      '</div>' +
      '<div class="music-trow">' +
      '<button type="button" class="music-tbtn music-rpt' + (_shuffle ? ' is-active' : '') + '" data-mact="shuffle" aria-pressed="' + _shuffle + '" title="' + _esc(_t('musicShuffle', 'Shuffle')) + '" data-i18n-title="musicShuffle">' + _icon('shuffle') + '</button>' +
      '<button type="button" class="music-tbtn music-rpt' + (_repeat === 'one' ? ' is-active' : '') + '" data-mact="rep-one" aria-pressed="' + (_repeat === 'one') + '" title="' + _esc(_t('musicRepeatOne', 'Repeat one')) + '" data-i18n-title="musicRepeatOne">' + _icon('rep-one') + '</button>' +
      '<button type="button" class="music-tbtn music-rpt' + (_repeat === 'all' ? ' is-active' : '') + '" data-mact="rep-all" aria-pressed="' + (_repeat === 'all') + '" title="' + _esc(_t('musicRepeatAll', 'Repeat playlist')) + '" data-i18n-title="musicRepeatAll">' + _icon('rep-all') + '</button>' +
      '</div>' +
    '</div>' +
    // ── volume ──
    '<div class="music-vol">' +
      '<span class="music-vol-ic">' + _icon('volume') + '</span>' +
      '<input type="range" class="music-vol-range" min="0" max="100" value="' + vol + '" title="' + _esc(_t('musicVolume', 'Volume')) + '" data-i18n-title="musicVolume" aria-label="' + _esc(_t('musicVolume', 'Volume')) + '">' +
      '<span class="music-vol-val">' + vol + '%</span>' +
    '</div>' +
    // ── balance G/D (si StereoPanner supporté) ──
    (_hasPan ?
      '<div class="music-bal">' +
        '<span class="music-bal-end">L</span>' +
        '<input type="range" class="music-bal-range" min="-100" max="100" value="' + Math.round(getBalance() * 100) + '" title="' + _esc(_t('musicBalance', 'Balance')) + '" data-i18n-title="musicBalance" aria-label="' + _esc(_t('musicBalance', 'Balance')) + '">' +
        '<span class="music-bal-end">R</span>' +
      '</div>' : '') +
    // ── liste dépliable : onglets Playlist | Radios ──
    '<div class="music-pl-head">' +
      '<button type="button" class="music-pl-toggle" data-mact="pl" aria-expanded="' + _plOpen + '">' +
        '<span class="music-pl-caret">' + (_plOpen ? '\u25BE' : '\u25B8') + '</span>' +
      '</button>' +
      '<button type="button" class="music-tab' + (_mode === 'pl' ? ' is-active' : '') + '" data-mtab="pl" aria-pressed="' + (_mode === 'pl') + '">' +
        '<span data-i18n="musicPlaylist">' + _esc(_t('musicPlaylist', 'Playlist')) + '</span>' +
        '<span class="music-pl-count">' + _group('pl').length + '</span>' +
      '</button>' +
      '<button type="button" class="music-tab' + (_mode === 'radio' ? ' is-active' : '') + '" data-mtab="radio" aria-pressed="' + (_mode === 'radio') + '">' +
        '<span data-i18n="musicRadios">' + _esc(_t('musicRadios', 'Radios')) + '</span>' +
        '<span class="music-pl-count">' + _group('radio').length + '</span>' +
      '</button>' +
    '</div>' +
    '<ul class="music-pl" role="listbox"' + (_plOpen ? '' : ' hidden') + '>' + plItems + '</ul>' +
    credit +
    '</div>';

  _wire();
  _updateMediaSession();
}

function _wire() {
  if (!_bodyEl) return;
  _bodyEl.querySelectorAll('[data-mact]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var a = btn.getAttribute('data-mact');
      if (a === 'lcd') { _lcdRemain = !_lcdRemain; _renderProgress(); return; }   // no gesture needed
      if (a === 'pl')  { _togglePlaylist(); return; }
      _unlockAudio();                      // iOS: create/resume the AudioContext inside the gesture
      if (a === 'toggle') toggleTrack();
      else if (a === 'next') next();
      else if (a === 'prev') prev();
      else if (a === 'stop') stop();
      else if (a === 'shuffle') setShuffle(!_shuffle);
      else if (a === 'rep-one') setRepeat(_repeat === 'one' ? 'off' : 'one');
      else if (a === 'rep-all') setRepeat(_repeat === 'all' ? 'off' : 'all');
    });
  });
  _bodyEl.querySelectorAll('[data-mtab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _plOpen = true;
      var m = btn.getAttribute('data-mtab');
      if (m !== _mode) setMode(m); else _render();
    });
  });
  // Playlist rows: click (or Enter/Space) to play that track.
  _bodyEl.querySelectorAll('.music-pl-item').forEach(function (li) {
    var go = function () { _unlockAudio(); play(li.getAttribute('data-track-id')); };
    li.addEventListener('click', go);
    li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  // Boutons ↑/↓ : stopPropagation pour ne pas déclencher le play de la ligne.
  _bodyEl.querySelectorAll('[data-plmove]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      _moveTrack(btn.getAttribute('data-plid'), btn.getAttribute('data-plmove') === 'up' ? -1 : 1);
    });
  });
  var rng = _bodyEl.querySelector('.music-vol-range');
  if (rng) {
    rng.addEventListener('input', function () {
      var v = _clampVol((parseInt(rng.value, 10) || 0) / 100);
      var val = _bodyEl.querySelector('.music-vol-val'); if (val) val.textContent = Math.round(v * 100) + '%';
      _applyVol(v);
      try { localStorage.setItem(LS_VOL, String(v)); } catch (e) {}
    });
  }
  var seekEl = _bodyEl.querySelector('.music-seek');
  if (seekEl) {
    var doSeek = function () {
      var d = getDuration(); if (!d) return;
      var t = (parseInt(seekEl.value, 10) || 0) / 1000 * d;
      var curEl = _bodyEl.querySelector('.music-cur'); if (curEl) curEl.textContent = _curLabel(t, d, true);
      seek(t);
    };
    seekEl.addEventListener('input',  function () { _seeking = true; doSeek(); });
    seekEl.addEventListener('change', function () { doSeek(); _seeking = false; });
  }
  var bal = _bodyEl.querySelector('.music-bal-range');
  if (bal) { bal.addEventListener('input', function () { setBalance((parseInt(bal.value, 10) || 0) / 100); }); }
  _updateMarquee();
  if (isPlaying()) _startVU();
}

// Expand/collapse the playlist and flip the caret. Kept off the render path so
// toggling never rebuilds the panel (preserves scroll + focus).
function _togglePlaylist() {
  if (!_bodyEl) return;
  var ul = _bodyEl.querySelector('.music-pl');
  var tg = _bodyEl.querySelector('.music-pl-toggle');
  var cr = _bodyEl.querySelector('.music-pl-caret');
  if (!ul || !tg) return;
  _plOpen = ul.hasAttribute('hidden');
  if (_plOpen) ul.removeAttribute('hidden'); else ul.setAttribute('hidden', '');
  tg.setAttribute('aria-expanded', String(_plOpen));
  if (cr) cr.textContent = _plOpen ? '\u25BE' : '\u25B8';
}

// Start the title marquee only when the text actually overflows its LCD width
// (transform-based scroll = GPU-composited, cheap on iOS — unlike box-shadow).
function _updateMarquee() {
  if (!_bodyEl) return;
  var wraps = _bodyEl.querySelectorAll('.music-marquee');
  if (!wraps.length) return;
  requestAnimationFrame(function () {
    wraps.forEach(function (wrap) {
      var txt = wrap.querySelector('.music-marquee-txt');
      if (!txt) return;
      var overflow = txt.scrollWidth - wrap.clientWidth;
      if (overflow > 4) {
        txt.style.setProperty('--mq-shift', '-' + overflow + 'px');
        wrap.classList.add('is-scroll');
      } else {
        wrap.classList.remove('is-scroll');
        txt.style.removeProperty('--mq-shift');
      }
    });
  });
}

// ── VU-mètre : lit l'AnalyserNode et pilote la hauteur des barres. La boucle
// rAF ne tourne QUE si le graphe existe, qu'on lit, ET que le panneau est
// visible (onglet + display) — sinon elle s'auto-arrête (économie CPU/thermique iOS).
function _vuActive() {
  if (_vuDead || _bypass) return false;
  if (!_analyser || !isPlaying() || !_bodyEl) return false;
  if (document.hidden) return false;
  var p = document.getElementById('music-panel');
  if (!p || getComputedStyle(p).display === 'none') return false;
  return true;
}
function _vuReset() {
  if (!_bodyEl) return;
  _bodyEl.querySelectorAll('.music-vu-bar').forEach(function (b) { b.style.height = '3px'; });
}
function _drawVU() {
  if (!_vuActive()) { _vuRAF = 0; _vuReset(); return; }
  var bins = _analyser.frequencyBinCount;
  if (!_vuData || _vuData.length !== bins) _vuData = new Uint8Array(bins);
  _analyser.getByteFrequencyData(_vuData);
  // iOS/Safari feeds an all-zero array for <audio> sources (long-standing WebKit
  // bug). If the analyser stays silent during real playback, hide the VU rather
  // than animate dead bars.
  var total = 0; for (var k = 0; k < bins; k++) total += _vuData[k];
  if (total === 0) { if (getCurrentTime() > 0.4 && ++_vuZeroFrames > 120) { _vuKill(); return; } }
  else { _vuZeroFrames = 0; }
  var bars = _bodyEl.querySelectorAll('.music-vu-bar');
  var n = bars.length;
  if (n) {
    var usable = Math.max(1, Math.floor(bins * 0.7));   // upper spectrum is usually empty
    var per = Math.max(1, Math.floor(usable / n));
    for (var i = 0; i < n; i++) {
      var sum = 0; for (var j = 0; j < per; j++) sum += _vuData[i * per + j] || 0;
      var v = sum / per / 255;
      bars[i].style.height = (3 + Math.round(v * 13)) + 'px';
    }
  }
  _vuRAF = requestAnimationFrame(_drawVU);
}
function _vuKill() {
  _vuDead = true;
  if (_vuRAF) { cancelAnimationFrame(_vuRAF); _vuRAF = 0; }
  if (_bodyEl) { var el = _bodyEl.querySelector('.music-vu'); if (el) el.style.display = 'none'; }
}
function _startVU() { if (!_vuRAF && _vuActive()) _vuRAF = requestAnimationFrame(_drawVU); }
function _stopVU()  { if (_vuRAF) { cancelAnimationFrame(_vuRAF); _vuRAF = 0; } _vuReset(); }
// Pause/resume the VU with tab visibility (belt-and-braces; _vuActive re-checks anyway).
try { document.addEventListener('visibilitychange', function () { if (document.hidden) _stopVU(); else _startVU(); }); } catch (e) {}

// ── Fondu (WebAudio) : rampe douce du gain ; no-op hors graphe WebAudio ──
function _fadeTo(target, dur) {
  if (!_waReady || !_gain || !_ctx) return false;
  try {
    var now = _ctx.currentTime;
    _gain.gain.cancelScheduledValues(now);
    _gain.gain.setValueAtTime(_gain.gain.value, now);
    _gain.gain.linearRampToValueAtTime(target, now + (dur || FADE));
    return true;
  } catch (e) { return false; }
}
// ── Réordonnancement de la playlist (ordre custom persisté pth_music_order) ──
function _saveOrder() { try { localStorage.setItem('pth_music_order', JSON.stringify(_tracks.map(function (t) { return t.id; }))); } catch (e) {} }
function _moveTrack(id, dir) {
  var g = _group(), gi = _gIndex(id, g); if (gi < 0) return;
  var gj = gi + dir; if (gj < 0 || gj >= g.length) return;
  var i = _index(g[gi].id), j = _index(g[gj].id);
  var tmp = _tracks[i]; _tracks[i] = _tracks[j]; _tracks[j] = tmp;
  _saveOrder(); _render();
}
// ── Mode compact « windowshade » : replie le panneau en une barre fine ──
function _ensureShadeBtn() {
  var panel = document.getElementById('music-panel');
  if (!panel) return;
  var title = panel.querySelector('.music-panel-title');
  if (!title) return;
  var b = title.querySelector('.music-shade-btn');
  if (!b) {
    b = document.createElement('button');
    b.type = 'button'; b.className = 'music-shade-btn';
    b.addEventListener('click', _toggleShade);
    var close = title.querySelector('.music-panel-close');
    if (close) title.insertBefore(b, close); else title.appendChild(b);
  }
  _applyShade();
}
function _toggleShade() {
  _shade = !_shade;
  try { localStorage.setItem('pth_music_shade', _shade ? '1' : '0'); } catch (e) {}
  _applyShade();
}
function _applyShade() {
  var panel = document.getElementById('music-panel');
  if (!panel) return;
  panel.classList.toggle('music-shade', _shade);
  var b = panel.querySelector('.music-shade-btn');
  if (b) {
    b.innerHTML = _shade ? _icon('expand') : _icon('shade');
    var lbl = _t(_shade ? 'musicExpand' : 'musicCompact', _shade ? 'Expand' : 'Compact');
    b.setAttribute('aria-label', lbl); b.title = lbl;
  }
  if (_shade) _updateMarquee();
  // Sur telephone / petite fenetre, le mode reduit devient une fenetre flottante
  // deplacable ; a l'expansion on retablit l'ancrage fixe (no-op sur desktop).
  try { if (window.pthMusicShadeFloat) window.pthMusicShadeFloat(_shade); } catch (e) {}
}

// ── Media Session : contrôles OS (écran verrouillé, notification, touches média) ──
function _setupMediaSession() {
  if (_msReady || !('mediaSession' in navigator)) return;
  _msReady = true;
  var ms = navigator.mediaSession;
  function set(a, fn) { try { ms.setActionHandler(a, fn); } catch (e) {} }
  set('play',          function () { _unlockAudio(); if (!isPlaying()) toggleTrack(); });
  set('pause',         function () { if (isPlaying()) pause(); });
  set('previoustrack', function () { _unlockAudio(); prev(); });
  set('nexttrack',     function () { _unlockAudio(); next(); });
  set('stop',          function () { stop(); });
  set('seekto',        function (d) { if (d && typeof d.seekTime === 'number') seek(d.seekTime); });
}
function _updateMediaSession() {
  if (!('mediaSession' in navigator)) return;
  var ms = navigator.mediaSession, cur = _byId(_curId);
  try {
    if (cur && window.MediaMetadata) {
      var art = cur.cover || '/favicon.svg';
      ms.metadata = new MediaMetadata({
        title:  cur.title || cur.id || 'PokerTH',
        artist: cur.artist || 'PokerTH Radio',
        album:  'PokerTH',
        artwork: [{ src: art, sizes: '512x512', type: /\.svg($|\?)/.test(art) ? 'image/svg+xml' : 'image/png' }]
      });
    }
    ms.playbackState = isPlaying() ? 'playing' : 'paused';
  } catch (e) {}
  _updateMediaSessionPos();
}
function _updateMediaSessionPos() {
  if (!('mediaSession' in navigator)) return;
  var ms = navigator.mediaSession;
  if (!('setPositionState' in ms)) return;
  try {
    var d = getDuration(), c = getCurrentTime();
    if (d > 0 && isFinite(d)) ms.setPositionState({ duration: d, position: Math.max(0, Math.min(c, d)), playbackRate: 1 });
  } catch (e) {}
}

// Restore the last-selected track id + repeat mode at load (no playback).
try { _curId = localStorage.getItem(LS_TRACK) || null; } catch (e) {}
try { var _rm = localStorage.getItem(LS_REPEAT); if (_rm === 'one' || _rm === 'all' || _rm === 'off') _repeat = _rm; } catch (e) {}
try { _shuffle = (localStorage.getItem(LS_SHUFFLE) === '1'); } catch (e) {}
try { _shade = (localStorage.getItem('pth_music_shade') === '1'); } catch (e) {}
try { var _mm = localStorage.getItem(LS_MODE); if (_mm === 'pl' || _mm === 'radio') _mode = _mm; } catch (e) {}

const Music = {
  loadManifest: loadManifest,
  refresh: refresh,
  tracks: tracks,
  current: current,
  isPlaying: isPlaying,
  play: play,
  pause: pause,
  stop: stop,
  toggleTrack: toggleTrack,
  next: next,
  prev: prev,
  getVolume: getVolume,
  setVolume: setVolume,
  getRepeat: getRepeat,
  setRepeat: setRepeat,
  getMode: getMode,
  setMode: setMode,
  getShuffle: getShuffle,
  setShuffle: setShuffle,
  getBalance: getBalance,
  setBalance: setBalance,
  getDuration: getDuration,
  getCurrentTime: getCurrentTime,
  seek: seek,
  getPreload: getPreload,
  setPreload: setPreload,
  mount: mount
};

export { Music, _wdArm, _wdDisarm, _wdOk, _wdTick, _wdSchedule, _wdRecover, _wdState };
export default Music;

// Mirror onto window so the classic main script (pokerth.js) can use it.
window.Music = Music;
