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
const LS_SHUFFLE = 'pth_music_shuffle';
const LS_BALANCE = 'pth_music_balance';

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
let _panner = null, _analyser = null, _vuData = null, _vuRAF = 0;
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
// Pick a random track index different from the current one (no immediate repeat
// unless there is only a single track). Used by next()/prev() when shuffle is on.
function _randIndex() {
  if (_tracks.length < 2) return 0;
  var cur = _index(_curId), j;
  do { j = Math.floor(Math.random() * _tracks.length); } while (j === cur);
  return j;
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
function next() { if (_tracks.length < 2) return play(_curId); if (_shuffle) return play(_tracks[_randIndex()].id); var i = _index(_curId); if (i < 0) i = 0; return play(_tracks[(i + 1) % _tracks.length].id); }
function prev() { if (_tracks.length < 2) return play(_curId); if (_shuffle) return play(_tracks[_randIndex()].id); var i = _index(_curId); if (i < 0) i = 0; return play(_tracks[(i - 1 + _tracks.length) % _tracks.length].id); }

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
  if (!isFinite(c) || c < 0) c = 0;
  if (canSeek && c > d) c = d;                 // never display/seek beyond the track
  if (!canSeek && c > 86400) c = 0;            // guard against a probe leaving a huge currentTime
  if (durEl) durEl.textContent = canSeek ? _fmtTime(d) : '0:00';
  if (!_seeking && curEl) curEl.textContent = _curLabel(c, d, canSeek);
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
  var _dur = getDuration(), _cur = getCurrentTime(), _canSeek = _dur > 0;
  var _pos = _canSeek ? Math.round(_cur / _dur * 1000) : 0;
  var multi = _tracks.length > 1;
  var ppKey = playing ? 'musicPause' : 'musicPlay';
  var ppIcon = playing ? '\u23F8' : '\u25B6';

  var nowTxt = cur ? (_esc(cur.title || cur.id) + (cur.artist ? ' \u2014 ' + _esc(cur.artist) : '')) : '';

  var vuBars = '';
  for (var b = 0; b < 7; b++) vuBars += '<span class="music-vu-bar"></span>';

  var plItems = _tracks.map(function (t, i) {
    return '<li class="music-pl-item' + (t.id === _curId ? ' is-cur' : '') + '" role="option" tabindex="0"' +
           ' aria-selected="' + (t.id === _curId) + '" data-track-id="' + _esc(t.id) + '">' +
           '<span class="music-pl-num">' + (i + 1) + '</span>' +
           '<span class="music-pl-ttl">' + _esc(t.title || t.id) + (t.artist ? ' \u2014 ' + _esc(t.artist) : '') + '</span>' +
           (t.id === _curId ? '<span class="music-pl-eq">' + (playing ? '\u25B8' : '\u2016') + '</span>' : '') +
           '</li>';
  }).join('');

  var credit = (cur && cur.credit)
    ? '<div class="music-credit">' + (cur.licenseUrl
        ? '<a href="' + _esc(cur.licenseUrl) + '" target="_blank" rel="noopener noreferrer">' + _esc(cur.credit) + '</a>'
        : _esc(cur.credit)) + '</div>'
    : '';

  _bodyEl.innerHTML =
    '<div class="music-player-box">' +
    // ── LCD : temps (cliquable écoulé/restant) + VU + titre défilant ──
    '<div class="music-lcd">' +
      '<div class="music-lcd-top">' +
        '<span class="music-time music-cur" data-mact="lcd" role="button" tabindex="0" title="' + _esc(_t('musicNowPlaying', 'Now playing')) + '">' + _curLabel(_cur, _dur, _canSeek) + '</span>' +
        '<span class="music-vu" aria-hidden="true">' + vuBars + '</span>' +
      '</div>' +
      '<div class="music-marquee"><span class="music-marquee-txt">' + (nowTxt || _esc(_t('musicNoTracks', 'No tracks available'))) + '</span></div>' +
    '</div>' +
    // ── barre de position ──
    '<div class="music-seek-row">' +
      '<input type="range" class="music-seek" min="0" max="1000" step="1" value="' + _pos + '"' + (_canSeek ? '' : ' disabled') + ' aria-label="' + _esc(_t('musicNowPlaying', 'Now playing')) + '">' +
      '<span class="music-time music-dur">' + (_canSeek ? _fmtTime(_dur) : '0:00') + '</span>' +
    '</div>' +
    // ── transport ──
    '<div class="music-transport">' +
      '<button type="button" class="music-tbtn" data-mact="prev"' + (multi ? '' : ' disabled') + ' title="' + _esc(_t('musicPrev', 'Previous')) + '" data-i18n-title="musicPrev">\u23EE</button>' +
      '<button type="button" class="music-tbtn music-tbtn-main" data-mact="toggle" title="' + _esc(_t(ppKey, playing ? 'Pause' : 'Play')) + '" data-i18n-title="' + ppKey + '">' + ppIcon + '</button>' +
      '<button type="button" class="music-tbtn" data-mact="next"' + (multi ? '' : ' disabled') + ' title="' + _esc(_t('musicNext', 'Next')) + '" data-i18n-title="musicNext">\u23ED</button>' +
      '<button type="button" class="music-tbtn" data-mact="stop" title="' + _esc(_t('musicStop', 'Stop')) + '" data-i18n-title="musicStop">\u23F9</button>' +
      '<span class="music-div"></span>' +
      '<button type="button" class="music-tbtn music-rpt' + (_shuffle ? ' is-active' : '') + '" data-mact="shuffle" aria-pressed="' + _shuffle + '" title="' + _esc(_t('musicShuffle', 'Shuffle')) + '" data-i18n-title="musicShuffle">\uD83D\uDD00</button>' +
      '<button type="button" class="music-tbtn music-rpt' + (_repeat === 'one' ? ' is-active' : '') + '" data-mact="rep-one" aria-pressed="' + (_repeat === 'one') + '" title="' + _esc(_t('musicRepeatOne', 'Repeat one')) + '" data-i18n-title="musicRepeatOne">\uD83D\uDD02</button>' +
      '<button type="button" class="music-tbtn music-rpt' + (_repeat === 'all' ? ' is-active' : '') + '" data-mact="rep-all" aria-pressed="' + (_repeat === 'all') + '" title="' + _esc(_t('musicRepeatAll', 'Repeat playlist')) + '" data-i18n-title="musicRepeatAll">\uD83D\uDD01</button>' +
    '</div>' +
    // ── volume ──
    '<div class="music-vol">' +
      '<span class="music-vol-ic">\uD83D\uDD0A</span>' +
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
    // ── playlist dépliable ──
    '<button type="button" class="music-pl-toggle" data-mact="pl" aria-expanded="false">' +
      '<span class="music-pl-caret">\u25B8</span>' +
      '<span data-i18n="musicPlaylist">' + _esc(_t('musicPlaylist', 'Playlist')) + '</span>' +
      '<span class="music-pl-count">' + _tracks.length + '</span>' +
    '</button>' +
    '<ul class="music-pl" role="listbox" hidden>' + plItems + '</ul>' +
    credit +
    '</div>';

  _wire();
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
  // Playlist rows: click (or Enter/Space) to play that track.
  _bodyEl.querySelectorAll('.music-pl-item').forEach(function (li) {
    var go = function () { _unlockAudio(); play(li.getAttribute('data-track-id')); };
    li.addEventListener('click', go);
    li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
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
  var open = ul.hasAttribute('hidden');
  if (open) ul.removeAttribute('hidden'); else ul.setAttribute('hidden', '');
  tg.setAttribute('aria-expanded', String(open));
  if (cr) cr.textContent = open ? '\u25BE' : '\u25B8';
}

// Start the title marquee only when the text actually overflows its LCD width
// (transform-based scroll = GPU-composited, cheap on iOS — unlike box-shadow).
function _updateMarquee() {
  if (!_bodyEl) return;
  var wrap = _bodyEl.querySelector('.music-marquee');
  var txt = _bodyEl.querySelector('.music-marquee-txt');
  if (!wrap || !txt) return;
  requestAnimationFrame(function () {
    var overflow = txt.scrollWidth - wrap.clientWidth;
    if (overflow > 4) {
      txt.style.setProperty('--mq-shift', '-' + overflow + 'px');
      wrap.classList.add('is-scroll');
    } else {
      wrap.classList.remove('is-scroll');
      txt.style.removeProperty('--mq-shift');
    }
  });
}

// ── VU-mètre : lit l'AnalyserNode et pilote la hauteur des barres. La boucle
// rAF ne tourne QUE si le graphe existe, qu'on lit, ET que le panneau est
// visible (onglet + display) — sinon elle s'auto-arrête (économie CPU/thermique iOS).
function _vuActive() {
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
function _startVU() { if (!_vuRAF && _vuActive()) _vuRAF = requestAnimationFrame(_drawVU); }
function _stopVU()  { if (_vuRAF) { cancelAnimationFrame(_vuRAF); _vuRAF = 0; } _vuReset(); }
// Pause/resume the VU with tab visibility (belt-and-braces; _vuActive re-checks anyway).
try { document.addEventListener('visibilitychange', function () { if (document.hidden) _stopVU(); else _startVU(); }); } catch (e) {}

// Restore the last-selected track id + repeat mode at load (no playback).
try { _curId = localStorage.getItem(LS_TRACK) || null; } catch (e) {}
try { var _rm = localStorage.getItem(LS_REPEAT); if (_rm === 'one' || _rm === 'all' || _rm === 'off') _repeat = _rm; } catch (e) {}
try { _shuffle = (localStorage.getItem(LS_SHUFFLE) === '1'); } catch (e) {}

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
  getShuffle: getShuffle,
  setShuffle: setShuffle,
  getBalance: getBalance,
  setBalance: setBalance,
  getDuration: getDuration,
  getCurrentTime: getCurrentTime,
  seek: seek,
  mount: mount
};

export { Music };
export default Music;

// Mirror onto window so the classic main script (pokerth.js) can use it.
window.Music = Music;
