// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/music.mjs — background-music controller (HTMLAudio + manifest)
//
// A small, self-contained lounge / background-music player, independent from
// the oscillator sound-EFFECTS engine in sounds.mjs. The track list is
// data-driven from /music/tracks.json and presented as a DROPDOWN that
// auto-refreshes every time the panel opens, so tracks added later (e.g. via
// the future admin tool) show up automatically with no reload. The UI is
// multilingual: every label/title carries data-i18n / data-i18n-title /
// data-i18n-opt, so the app's setLang() pass re-translates the panel live on a
// language switch. Mirrors the window.* alias pattern of the other modules.
//
// Repeat modes (persisted, chosen from a dropdown):
//   'one' — loop the current track forever (HTMLAudio loop; default)
//   'all' — loop the whole playlist (advance at end, wrap to the first)
//   'off' — play the current track once, then stop
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
let _repeat = 'one';   // 'one' = loop track | 'all' = loop playlist | 'off' = play once

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
  if (_audio) try { _audio.volume = v; } catch (e) {}
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
  }
  return _audio;
}
function _onEnded() {
  if (_repeat === 'all') { next(); return; }   // advance through the playlist (wraps)
  // 'off' — stop at the end ('one' never fires 'ended' since loop=true).
  if (_audio) { try { _audio.currentTime = 0; } catch (e) {} }
  _render();
}

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

function _opt(val, key, fallback, cur) {
  return '<option value="' + _esc(val) + '" data-i18n-opt="' + key + '"' + (cur === val ? ' selected' : '') + '>' + _esc(_t(key, fallback)) + '</option>';
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
    '<div class="music-transport">' +
      '<button type="button" class="music-tbtn" data-mact="prev"' + (multi ? '' : ' disabled') + ' title="' + _esc(_t('musicPrev', 'Previous')) + '" data-i18n-title="musicPrev">\u23EE</button>' +
      '<button type="button" class="music-tbtn music-tbtn-main" data-mact="toggle" title="' + _esc(_t(ppKey, playing ? 'Pause' : 'Play')) + '" data-i18n-title="' + ppKey + '">' + ppIcon + '</button>' +
      '<button type="button" class="music-tbtn" data-mact="next"' + (multi ? '' : ' disabled') + ' title="' + _esc(_t('musicNext', 'Next')) + '" data-i18n-title="musicNext">\u23ED</button>' +
      '<button type="button" class="music-tbtn" data-mact="stop" title="' + _esc(_t('musicStop', 'Stop')) + '" data-i18n-title="musicStop">\u23F9</button>' +
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
    '<label class="music-sel-label" data-i18n="musicRepeat">' + _esc(_t('musicRepeat', 'Repeat')) + '</label>' +
    '<div class="sel-wrap music-sel-wrap">' +
      '<select id="music-repeat" autocomplete="off" aria-label="' + _esc(_t('musicRepeat', 'Repeat')) + '">' +
        _opt('one', 'musicRepeatOne', 'Repeat one', _repeat) +
        _opt('all', 'musicRepeatAll', 'Repeat playlist', _repeat) +
        _opt('off', 'musicRepeatOff', 'Play once', _repeat) +
      '</select>' +
      '<span class="sel-arr">\u25BE</span>' +
    '</div>' +
    credit;

  _wire();
}

function _wire() {
  if (!_bodyEl) return;
  var sel = _bodyEl.querySelector('#music-sel');
  if (sel) {
    sel.addEventListener('change', function () {
      var id = sel.value;
      if (isPlaying()) { play(id); }     // switch track, keep playing (change = user gesture)
      else { _curId = id; _render(); }   // just arm the selection
    });
  }
  var rep = _bodyEl.querySelector('#music-repeat');
  if (rep) { rep.addEventListener('change', function () { setRepeat(rep.value); }); }
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
    rng.addEventListener('input', function () {
      var v = _clampVol((parseInt(rng.value, 10) || 0) / 100);
      var val = _bodyEl.querySelector('.music-vol-val'); if (val) val.textContent = Math.round(v * 100) + '%';
      if (_audio) try { _audio.volume = v; } catch (e) {}
      try { localStorage.setItem(LS_VOL, String(v)); } catch (e) {}
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
  mount: mount
};

export { Music };
export default Music;

// Mirror onto window so the classic main script (pokerth.js) can use it.
window.Music = Music;
