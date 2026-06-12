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

const MANIFEST_URL = '/music/tracks.json';
const LS_TRACK  = 'pth_music_track';
const LS_VOL    = 'pth_music_vol';
const LS_REPEAT = 'pth_music_repeat';

let _tracks = [];
let _audio  = null;
let _curId  = null;
let _loaded = false;
let _bodyEl = null;
let _repeat = 'all';   // défaut: boucle playlist | 'one' = loop track | 'off' = play once
let _seeking = false;  // true while the user drags the seek bar (don't let timeupdate fight the thumb)
let _durProbed = false; // true once this track's total duration is resolved (see _probeDuration)
let _probedDur = 0;     // duration resolved off a detached probe element (when the live one says Infinity)

// Web Audio routing. On iOS/WebKit, HTMLMediaElement.volume is read-only, so
// `audio.volume = x` is silently ignored (volume is hardware-only there). Routing
// playback through a GainNode lets us control the level on EVERY platform. The
// graph is built lazily on the first user gesture: createMediaElementSource can
// run only once per element, and on iOS the AudioContext must be created/resumed
// from inside a real interaction. If Web Audio is unavailable we fall back to the
// element's own volume (the pre-existing behaviour, fine off iOS).
let _ctx = null, _srcNode = null, _gain = null, _waReady = false, _waFailed = false;

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

function getRepeat() { return _repeat; }
function setRepeat(m) {
  if (m !== 'one' && m !== 'all' && m !== 'off') return;
  _repeat = m;
  try { localStorage.setItem(LS_REPEAT, m); } catch (e) {}
  if (_audio) try { _audio.loop = (m === 'one'); } catch (e) {}
  _render();
}

function _el() {
  if (!_audio) {
    _audio = new Audio();
    _audio.loop = (_repeat === 'one');
    _audio.preload = 'none';
    try { _audio.volume = getVolume(); } catch (e) {}
    ['play', 'pause', 'error'].forEach(function (ev) { _audio.addEventListener(ev, _render); });
    _audio.addEventListener('ended', _onEnded);
    // Progress wiring — bound ONCE on the persistent element (not per-render),
    // updates whatever progress row currently exists in the panel.
    ['timeupdate', 'loadedmetadata', 'durationchange', 'seeked'].forEach(function (ev) { _audio.addEventListener(ev, _renderProgress); });
    _audio.addEventListener('loadedmetadata', _probeDuration);
  }
  return _audio;
}
function _onEnded() {
  if (_repeat === 'all') { next(); return; }   // advance through the playlist (wraps)
  // 'off' — stop at the end ('one' never fires 'ended' since loop=true).
  if (_audio) { try { _audio.currentTime = 0; } catch (e) {} }
  _render();
}

// Route the desired volume to the gain node once the graph exists, otherwise to
// the element directly (no-op on iOS, but the gain node takes over on first play).
function _applyVol(v) {
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
    _srcNode.connect(_gain); _gain.connect(_ctx.destination);
    try { _audio.volume = 1; } catch (e) {}   // element at unity; the gain attenuates (works on iOS)
    _waReady = true;
    return true;
  } catch (e) { _waFailed = true; return false; }
}
function _resumeCtx() {
  if (_ctx && (_ctx.state === 'suspended' || _ctx.state === 'interrupted')) {
    try { var p = _ctx.resume(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }
}
// Create + unlock the audio graph synchronously inside a user gesture (iOS needs
// the context created/resumed from a real interaction, before any await).
function _unlockAudio() { _el(); _ensureWebAudio(); _resumeCtx(); }

async function loadManifest(force) {
  if (_loaded && !force) return _tracks;
  try {
    var r = await fetch(MANIFEST_URL, { cache: 'no-cache' });
    var j = await r.json();
    var arr = Array.isArray(j) ? j : (j && j.tracks) || [];
    _tracks = arr
      .filter(function (t) { return t && t.file && t.active !== false; })
      .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  } catch (e) { _tracks = []; }
  _loaded = true;
  return _tracks;
}

function tracks()    { return _tracks.slice(); }
function current()   { return _curId; }
function isPlaying() { return !!(_audio && !_audio.paused); }
function _index(id)  { for (var i = 0; i < _tracks.length; i++) if (_tracks[i].id === id) return i; return -1; }
function _byId(id)   { var i = _index(id); return i >= 0 ? _tracks[i] : null; }

async function play(id) {
  await loadManifest();
  var t = id ? _byId(id) : (_byId(_curId) || _tracks[0]);
  if (!t) { _render(); return; }
  var a = _el();
  if (_curId !== t.id || !a.src) {
    _curId = t.id;
    a.src = t.file;
    _durProbed = false;   // new source — re-resolve its duration on metadata load
    _probedDur = 0;
    try { localStorage.setItem(LS_TRACK, t.id); } catch (e) {}
  }
  _ensureWebAudio(); _resumeCtx();        // build/unlock the audio graph (covers programmatic play too)
  _applyVol(getVolume());
  try { await a.play(); } catch (e) { /* gesture/load issue — UI reflects paused */ }
  _render();
}
function pause() { if (_audio) try { _audio.pause(); } catch (e) {} _render(); }
function stop()  { if (_audio) { try { _audio.pause(); _audio.currentTime = 0; } catch (e) {} } _render(); }
function toggleTrack(id) {
  if (id && id !== _curId) return play(id);
  if (isPlaying()) { pause(); return Promise.resolve(); }
  return play(id);
}
function next() { if (_tracks.length < 2) return play(_curId); var i = _index(_curId); if (i < 0) i = 0; return play(_tracks[(i + 1) % _tracks.length].id); }
function prev() { if (_tracks.length < 2) return play(_curId); var i = _index(_curId); if (i < 0) i = 0; return play(_tracks[(i - 1 + _tracks.length) % _tracks.length].id); }

// ── Playback position / seeking ──
// VBR / streamed MP3s advertise duration=Infinity until the browser scans the
// whole file, leaving the total time stuck at 0:00 — and iOS never resolves it
// from the element at all. So when the element can't tell us the duration, read
// it straight from the file: fetch the first KBs and parse the MP3 Xing/Info
// header (exact frame count) with a CBR fallback. Pure fetch + arithmetic, works
// identically on iOS. Result lands in _probedDur, which getDuration() falls back to.
function _probeDuration() {
  if (!_audio || _durProbed) return;
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
function getDuration()    { try { var d = _audio ? _audio.duration : 0; if (isFinite(d) && d > 0) return d; return _probedDur > 0 ? _probedDur : 0; } catch (e) { return 0; } }
function getCurrentTime() { try { return _audio ? (_audio.currentTime || 0) : 0; } catch (e) { return 0; } }
function seek(t) {
  var d = getDuration(); if (!_audio || !d) return;
  t = Math.max(0, Math.min(d, t));
  try { _audio.currentTime = t; } catch (e) {}
  _renderProgress();
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
  if (!isFinite(c) || c < 0) c = 0;
  if (canSeek && c > d) c = d;                 // never display/seek beyond the track
  if (!canSeek && c > 86400) c = 0;            // guard against a probe leaving a huge currentTime
  if (durEl) durEl.textContent = canSeek ? _fmtTime(d) : '0:00';
  if (!_seeking && curEl) curEl.textContent = _fmtTime(c);
  if (seekEl) {
    seekEl.disabled = !canSeek;
    if (!_seeking) seekEl.value = canSeek ? Math.round(c / d * 1000) : 0;
  }
}

// ── UI ──
function mount(bodyEl) {
  if (bodyEl) _bodyEl = bodyEl;
  _render();          // immediate skeleton from whatever we already have
  return refresh();   // force-refresh the manifest + re-render (auto-updating list)
}

async function refresh() {
  await loadManifest(true);
  if (!_curId) { try { _curId = localStorage.getItem(LS_TRACK) || null; } catch (e) {} }
  if (_curId && _index(_curId) < 0) _curId = null;          // saved track gone from manifest
  if (!_curId && _tracks.length) _curId = _tracks[0].id;    // default to first (not persisted)
  _render();
}

function _render() {
  if (!_bodyEl) return;
  if (!_tracks.length) {
    _bodyEl.innerHTML = '<div class="music-empty" data-i18n="musicNoTracks">' + _esc(_t('musicNoTracks', 'No tracks available')) + '</div>';
    return;
  }
  var playing = isPlaying();
  var cur = _byId(_curId);
  var vol = Math.round(getVolume() * 100);
  var gsVol = 100, gsOn = true;
  try { if (typeof window.getSoundVolume === 'function') gsVol = Math.round(window.getSoundVolume() * 100); } catch (e) {}
  try { if (typeof window.isSoundEnabled === 'function') gsOn = window.isSoundEnabled(); } catch (e) {}
  var _dur = getDuration(), _cur = getCurrentTime(), _canSeek = _dur > 0;
  var _pos = _canSeek ? Math.round(_cur / _dur * 1000) : 0;
  var multi = _tracks.length > 1;
  var ppKey = playing ? 'musicPause' : 'musicPlay';
  var ppIcon = playing ? '\u23F8' : '\u25B6';

  var options = _tracks.map(function (t) {
    return '<option value="' + _esc(t.id) + '"' + (t.id === _curId ? ' selected' : '') + '>' +
           _esc(t.title || t.id) + (t.artist ? ' \u2014 ' + _esc(t.artist) : '') + '</option>';
  }).join('');

  var credit = (cur && cur.credit)
    ? '<div class="music-credit">' + (cur.licenseUrl
        ? '<a href="' + _esc(cur.licenseUrl) + '" target="_blank" rel="noopener noreferrer">' + _esc(cur.credit) + '</a>'
        : _esc(cur.credit)) + '</div>'
    : '';

  _bodyEl.innerHTML =
    '<div class="music-gamesnd">' +
      '<div class="music-gamesnd-hd"><span class="music-gamesnd-ic">\uD83C\uDFAE</span><span data-i18n="soundVolume">' + _esc(_t('soundVolume', 'Game sounds')) + '</span></div>' +
      '<div class="music-gamesnd-row' + (gsOn ? '' : ' is-off') + '">' +
        '<button type="button" class="music-tbtn music-gs-mute" data-mact="gs-mute" aria-pressed="' + (!gsOn) + '" title="' + _esc(_t('soundVolume', 'Game sounds')) + '">' + (gsOn ? '\uD83D\uDD0A' : '\uD83D\uDD07') + '</button>' +
        '<input type="range" class="music-gs-range" min="0" max="100" value="' + gsVol + '" aria-label="' + _esc(_t('soundVolume', 'Game sounds')) + '">' +
        '<span class="music-gs-val">' + gsVol + '%</span>' +
      '</div>' +
    '</div>' +
    '<div class="music-player-box">' +
    '<div class="music-player-hd"><span class="music-player-ic">\uD83C\uDFA7</span><span data-i18n="musicPlayer">' + _esc(_t('musicPlayer', 'Player')) + '</span></div>' +
    '<div class="music-transport">' +
      '<button type="button" class="music-tbtn" data-mact="prev"' + (multi ? '' : ' disabled') + ' title="' + _esc(_t('musicPrev', 'Previous')) + '" data-i18n-title="musicPrev">\u23EE</button>' +
      '<button type="button" class="music-tbtn music-tbtn-main" data-mact="toggle" title="' + _esc(_t(ppKey, playing ? 'Pause' : 'Play')) + '" data-i18n-title="' + ppKey + '">' + ppIcon + '</button>' +
      '<button type="button" class="music-tbtn" data-mact="next"' + (multi ? '' : ' disabled') + ' title="' + _esc(_t('musicNext', 'Next')) + '" data-i18n-title="musicNext">\u23ED</button>' +
      '<button type="button" class="music-tbtn" data-mact="stop" title="' + _esc(_t('musicStop', 'Stop')) + '" data-i18n-title="musicStop">\u23F9</button>' +
      '<span class="music-div"></span>' +
      '<button type="button" class="music-tbtn music-rpt' + (_repeat === 'one' ? ' is-active' : '') + '" data-mact="rep-one" aria-pressed="' + (_repeat === 'one') + '" title="' + _esc(_t('musicRepeatOne', 'Repeat one')) + '" data-i18n-title="musicRepeatOne">\uD83D\uDD02</button>' +
      '<button type="button" class="music-tbtn music-rpt' + (_repeat === 'all' ? ' is-active' : '') + '" data-mact="rep-all" aria-pressed="' + (_repeat === 'all') + '" title="' + _esc(_t('musicRepeatAll', 'Repeat playlist')) + '" data-i18n-title="musicRepeatAll">\uD83D\uDD01</button>' +
    '</div>' +
    '<div class="music-seek-row">' +
      '<span class="music-time music-cur">' + _fmtTime(_cur) + '</span>' +
      '<input type="range" class="music-seek" min="0" max="1000" step="1" value="' + _pos + '"' + (_canSeek ? '' : ' disabled') + ' aria-label="' + _esc(_t('musicNowPlaying', 'Now playing')) + '">' +
      '<span class="music-time music-dur">' + (_canSeek ? _fmtTime(_dur) : '0:00') + '</span>' +
    '</div>' +
    '<div class="music-vol">' +
      '<span class="music-vol-ic">\uD83D\uDD0A</span>' +
      '<input type="range" class="music-vol-range" min="0" max="100" value="' + vol + '" title="' + _esc(_t('musicVolume', 'Volume')) + '" data-i18n-title="musicVolume" aria-label="' + _esc(_t('musicVolume', 'Volume')) + '">' +
      '<span class="music-vol-val">' + vol + '%</span>' +
    '</div>' +
    '<label class="music-sel-label" data-i18n="musicTrack">' + _esc(_t('musicTrack', 'Track')) + '</label>' +
    '<div class="sel-wrap music-sel-wrap">' +
      '<select id="music-sel" autocomplete="off" aria-label="' + _esc(_t('musicTrack', 'Track')) + '">' + options + '</select>' +
      '<span class="sel-arr">\u25BE</span>' +
    '</div>' +
    credit +
    '</div>';

  _wire();
}

function _wire() {
  if (!_bodyEl) return;
  var sel = _bodyEl.querySelector('#music-sel');
  if (sel) {
    sel.addEventListener('change', function () {
      _unlockAudio();
      var id = sel.value;
      if (isPlaying()) { play(id); }     // switch track, keep playing (change = user gesture)
      else { _curId = id; _render(); }   // just arm the selection
    });
  }
  _bodyEl.querySelectorAll('[data-mact]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _unlockAudio();                      // iOS: create/resume the AudioContext inside the gesture
      var a = btn.getAttribute('data-mact');
      if (a === 'toggle') toggleTrack();
      else if (a === 'next') next();
      else if (a === 'prev') prev();
      else if (a === 'stop') stop();
      else if (a === 'rep-one') setRepeat(_repeat === 'one' ? 'off' : 'one');
      else if (a === 'rep-all') setRepeat(_repeat === 'all' ? 'off' : 'all');
      else if (a === 'gs-mute') { try { if (typeof window.toggleSound === 'function') window.toggleSound(); } catch (e) {} _render(); }
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
      var curEl = _bodyEl.querySelector('.music-cur'); if (curEl) curEl.textContent = _fmtTime(t);
      seek(t);
    };
    seekEl.addEventListener('input',  function () { _seeking = true; doSeek(); });
    seekEl.addEventListener('change', function () { doSeek(); _seeking = false; });
  }
  var gs = _bodyEl.querySelector('.music-gs-range');
  if (gs) {
    gs.addEventListener('input', function () {
      var pct = parseInt(gs.value, 10) || 0;
      var v = _bodyEl.querySelector('.music-gs-val'); if (v) v.textContent = pct + '%';
      try { if (typeof window.setSoundVolume === 'function') window.setSoundVolume(pct / 100); } catch (e) {}
    });
    gs.addEventListener('change', function () {   // bip de test au niveau choisi (si non coupé)
      try { if ((typeof window.isSoundEnabled !== 'function' || window.isSoundEnabled()) && typeof window.playTone === 'function') window.playTone(660, 0.08, 0.25); } catch (e) {}
    });
  }
}

// Restore the last-selected track id + repeat mode at load (no playback).
try { _curId = localStorage.getItem(LS_TRACK) || null; } catch (e) {}
try { var _rm = localStorage.getItem(LS_REPEAT); if (_rm === 'one' || _rm === 'all' || _rm === 'off') _repeat = _rm; } catch (e) {}

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
  getDuration: getDuration,
  getCurrentTime: getCurrentTime,
  seek: seek,
  mount: mount
};

export { Music };
export default Music;

// Mirror onto window so the classic main script (pokerth.js) can use it.
window.Music = Music;
