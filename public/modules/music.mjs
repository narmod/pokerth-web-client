// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/music.mjs — background-music controller (HTMLAudio + manifest)
//
// A small, self-contained lounge / background-music player, independent from
// the oscillator sound-EFFECTS engine in sounds.mjs. The track list is
// data-driven from /music/tracks.json, so adding a track later only means
// dropping the file in public/music/ and adding a manifest entry — no code
// change. Mirrors the window.* alias pattern used by the other modules so the
// classic pokerth.js can call window.Music.* directly.
//
// No autoplay: browsers (iOS especially) refuse to start audio without a user
// gesture, so playback only ever begins from a tap on Play. The selected track
// and the volume are remembered in localStorage; playback itself is NOT
// auto-resumed on load (deliberate — no surprise audio).
//
//   window.Music.toggleTrack(id) — play that track, or pause it if it is playing
//   window.Music.play(id) / pause() / stop()
//   window.Music.next() / prev()
//   window.Music.setVolume(v) / getVolume()
//   window.Music.mount(bodyEl)   — render the player UI into a container element
//   window.Music.isPlaying() / current() / tracks()
// ─────────────────────────────────────────────────────────────────────────

const MANIFEST_URL = '/music/tracks.json';
const LS_TRACK = 'pth_music_track';   // last selected track id
const LS_VOL   = 'pth_music_vol';     // volume 0..1

let _tracks = [];
let _audio  = null;
let _curId  = null;
let _loaded = false;
let _bodyEl = null;     // mounted panel body (re-rendered on state change)

// ── i18n helper (English fallback when window.t isn't ready yet) ──
function _t(key, fallback) {
  try { if (typeof window.t === 'function') { var s = window.t(key); if (s && s !== key) return s; } } catch (e) {}
  return fallback;
}
function _esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

// ── volume ──
function _clampVol(v) { v = parseFloat(v); if (isNaN(v)) return 0.5; return Math.max(0, Math.min(1, v)); }
function getVolume() { try { var v = localStorage.getItem(LS_VOL); return v == null ? 0.5 : _clampVol(v); } catch (e) { return 0.5; } }
function setVolume(v) {
  v = _clampVol(v);
  try { localStorage.setItem(LS_VOL, String(v)); } catch (e) {}
  if (_audio) try { _audio.volume = v; } catch (e) {}
  _render();
}

// ── audio element (lazy) ──
function _el() {
  if (!_audio) {
    _audio = new Audio();
    _audio.loop = true;        // loop the current track (background ambience)
    _audio.preload = 'none';
    try { _audio.volume = getVolume(); } catch (e) {}
    ['play', 'pause', 'ended', 'error'].forEach(function (ev) {
      _audio.addEventListener(ev, _render);
    });
  }
  return _audio;
}

// ── manifest ──
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
    try { localStorage.setItem(LS_TRACK, t.id); } catch (e) {}
  }
  try { a.volume = getVolume(); } catch (e) {}
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

// ── UI ──
function mount(bodyEl) {
  if (!bodyEl) return;
  _bodyEl = bodyEl;
  _render();                       // immediate skeleton
  loadManifest().then(function () {
    if (!_curId) { try { _curId = localStorage.getItem(LS_TRACK) || null; } catch (e) {} }
    if (_curId && _index(_curId) < 0) _curId = null;
    _render();
  });
}

function _render() {
  if (!_bodyEl) return;
  if (!_tracks.length) {
    _bodyEl.innerHTML = '<div class="music-empty">' + _esc(_t('musicNoTracks', 'No tracks available')) + '</div>';
    return;
  }
  var playing = isPlaying();
  var cur = _byId(_curId);
  var vol = Math.round(getVolume() * 100);
  var multi = _tracks.length > 1;

  var rows = _tracks.map(function (t) {
    var isCur = t.id === _curId;
    var icon = (isCur && playing) ? '\u23F8' : '\u25B6';   // ⏸ / ▶
    return '<button type="button" class="music-row' + (isCur ? ' is-current' : '') + '" data-mid="' + _esc(t.id) + '">' +
             '<span class="music-row-ic">' + icon + '</span>' +
             '<span class="music-row-meta">' +
               '<span class="music-row-title">' + _esc(t.title || t.id) + '</span>' +
               '<span class="music-row-artist">' + _esc(t.artist || '') + '</span>' +
             '</span>' +
           '</button>';
  }).join('');

  var nowLine = cur
    ? '<div class="music-now"><span class="music-now-label">' + _esc(_t('musicNowPlaying', 'Now playing')) + '</span>' +
        '<span class="music-now-title">' + _esc(cur.title || cur.id) + '</span></div>'
    : '';

  var credit = (cur && cur.credit)
    ? '<div class="music-credit">' + (cur.licenseUrl
        ? '<a href="' + _esc(cur.licenseUrl) + '" target="_blank" rel="noopener noreferrer">' + _esc(cur.credit) + '</a>'
        : _esc(cur.credit)) + '</div>'
    : '';

  _bodyEl.innerHTML =
    nowLine +
    '<div class="music-transport">' +
      '<button type="button" class="music-tbtn" data-mact="prev"' + (multi ? '' : ' disabled') + ' title="' + _esc(_t('musicPrev', 'Previous')) + '">\u23EE</button>' +
      '<button type="button" class="music-tbtn music-tbtn-main" data-mact="toggle" title="' + _esc(playing ? _t('musicPause', 'Pause') : _t('musicPlay', 'Play')) + '">' + (playing ? '\u23F8' : '\u25B6') + '</button>' +
      '<button type="button" class="music-tbtn" data-mact="next"' + (multi ? '' : ' disabled') + ' title="' + _esc(_t('musicNext', 'Next')) + '">\u23ED</button>' +
      '<button type="button" class="music-tbtn" data-mact="stop" title="' + _esc(_t('musicStop', 'Stop')) + '">\u23F9</button>' +
    '</div>' +
    '<div class="music-vol">' +
      '<span class="music-vol-ic">\uD83D\uDD0A</span>' +
      '<input type="range" class="music-vol-range" min="0" max="100" value="' + vol + '" aria-label="' + _esc(_t('musicVolume', 'Volume')) + '">' +
      '<span class="music-vol-val">' + vol + '%</span>' +
    '</div>' +
    '<div class="music-list">' + rows + '</div>' +
    credit;

  _wire();
}

function _wire() {
  if (!_bodyEl) return;
  _bodyEl.querySelectorAll('.music-row').forEach(function (btn) {
    btn.addEventListener('click', function () { toggleTrack(btn.getAttribute('data-mid')); });
  });
  _bodyEl.querySelectorAll('[data-mact]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var a = btn.getAttribute('data-mact');
      if (a === 'toggle') toggleTrack();
      else if (a === 'next') next();
      else if (a === 'prev') prev();
      else if (a === 'stop') stop();
    });
  });
  var rng = _bodyEl.querySelector('.music-vol-range');
  if (rng) {
    // Update live during drag without a full re-render (smoother), persisting
    // the value; the public setVolume() is what triggers a re-render elsewhere.
    rng.addEventListener('input', function () {
      var v = _clampVol((parseInt(rng.value, 10) || 0) / 100);
      var val = _bodyEl.querySelector('.music-vol-val'); if (val) val.textContent = Math.round(v * 100) + '%';
      if (_audio) try { _audio.volume = v; } catch (e) {}
      try { localStorage.setItem(LS_VOL, String(v)); } catch (e) {}
    });
  }
}

// Restore the last-selected track id at load (no playback — see header note).
try { _curId = localStorage.getItem(LS_TRACK) || null; } catch (e) {}

const Music = {
  loadManifest: loadManifest,
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
  mount: mount
};

export { Music };
export default Music;

// Mirror onto window so the classic main script (pokerth.js) can use it.
window.Music = Music;
