// Avatar studio — tabbed avatar window (Gallery / Create / Import).
//
// The historical avatar popup (emoji gallery + hidden camera import) becomes
// a 3-tab window:
//   * Gallery : the untouched legacy grid (539 emoji + PokerTH + camera pins).
//   * Create  : a "matrix" portrait picker. Pre-generated realistic portraits
//     live in /avatars/people/<gender>-<age>-<glasses>.jpg ; picking axis
//     values selects the matching file. Applying it goes through the SAME
//     path as a photo import (96x96 canvas -> JPEG dataURL -> pth_avatar_img
//     + '__img__'), so seats, broadcast and the PokerTH upload pipeline all
//     work unchanged.
//   * Import  : the camera flow made explicit (drop zone + button + hints),
//     addressing the discoverability issue reported on Discord (neuling,
//     2026-07-31). Reuses _processAvatarFile() from the page head.
//
// Advanced option 'avatar_create' (default ON) hides the Create tab via
// body.adv-no-avcreate (see applyAdvOpts in pokerth.js).
//
// The chosen matrix recipe is persisted in localStorage pth_avatar_matrix so
// reopening the tab restores the last selection.

'use strict';

function t(k, p) { return (typeof window.t === 'function') ? window.t(k, p) : k; }

// Matrix catalogue: axis-key -> file (null = combination not generated yet).
// Keys: <gender F|H> | <age jeune|adulte|senior> | <glasses avec|sans>
const AVM_CAT = {
  'F|jeune|avec':  'f-jeune-lunettes.jpg',
  'F|jeune|sans':  'f-jeune-sans.jpg',
  'F|adulte|avec': null,
  'F|adulte|sans': 'f-adulte-sans.jpg',
  'F|senior|avec': 'f-senior-lunettes.jpg',
  'F|senior|sans': null,
  'H|jeune|avec':  'h-jeune-lunettes.jpg',
  'H|jeune|sans':  null,
  'H|adulte|avec': 'h-adulte-lunettes.jpg',
  'H|adulte|sans': 'h-adulte-sans.jpg',
  'H|senior|avec': null,
  'H|senior|sans': 'h-senior-sans.jpg'
};
const AVM_BASE = 'avatars/people/';

// Axes: [i18n label key, state key, [[value, i18n option key], ...]]
const AVM_AXES = [
  ['avmGender',  'g', [['F', 'avmFemale'], ['H', 'avmMale']]],
  ['avmAge',     'a', [['jeune', 'avmYoung'], ['adulte', 'avmAdult'], ['senior', 'avmSenior']]],
  ['avmGlasses', 'l', [['avec', 'avmWith'], ['sans', 'avmWithout']]]
];

var _avmState = { g: 'F', a: 'jeune', l: 'avec' };
try {
  var _saved = JSON.parse(localStorage.getItem('pth_avatar_matrix') || 'null');
  if (_saved && AVM_CAT.hasOwnProperty(_saved.g + '|' + _saved.a + '|' + _saved.l)) _avmState = _saved;
} catch (e) {}

function _avmKey() { return _avmState.g + '|' + _avmState.a + '|' + _avmState.l; }

// ── Tab switching ────────────────────────────────────────────────────────
function avStudioTab(tab) {
  // Create tab disabled by advanced option -> never land on it.
  if (tab === 'create' && document.body.classList.contains('adv-no-avcreate')) tab = 'gallery';
  ['gallery', 'create', 'import'].forEach(function (p) {
    var pane = document.getElementById('avp-pane-' + p);
    var btn  = document.getElementById('avp-tab-' + p);
    if (pane) pane.style.display = (p === tab) ? '' : 'none';
    if (btn) btn.classList.toggle('selected', p === tab);
    if (btn) btn.setAttribute('aria-selected', p === tab ? 'true' : 'false');
  });
  if (tab === 'create') _avmRender();
  if (tab === 'import') _avImportRender();
}

// Called when the popup opens (from toggleAvatarPopup) so a hidden Create
// tab never stays active between sessions.
function avStudioReset() { avStudioTab('gallery'); }

// ── Create pane (matrix) ─────────────────────────────────────────────────
function _avmRender() {
  var pane = document.getElementById('avp-pane-create');
  if (!pane) return;
  if (!pane.firstChild) {
    pane.innerHTML =
      '<div class="avm-wrap">' +
      '<div class="avm-left">' +
      '<div class="avm-preview" id="avm-preview"></div>' +
      '<div class="avm-status" id="avm-status"></div>' +
      '<button type="button" class="avm-btn" id="avm-dice">\uD83C\uDFB2 <span></span></button>' +
      '</div>' +
      '<div class="avm-rows" id="avm-rows"></div>' +
      '</div>' +
      '<div class="avm-foot"><button type="button" class="avm-btn avm-use" id="avm-use"></button></div>';
    document.getElementById('avm-dice').addEventListener('click', _avmRandom);
    document.getElementById('avm-use').addEventListener('click', _avmApply);
  }
  document.querySelector('#avm-dice span').textContent = t('avmRandom');
  document.getElementById('avm-use').textContent = t('avmUse');

  var file = AVM_CAT[_avmKey()];
  var pv = document.getElementById('avm-preview');
  var st = document.getElementById('avm-status');
  var useBtn = document.getElementById('avm-use');
  if (file) {
    pv.innerHTML = '<img src="' + AVM_BASE + file + '" alt="" draggable="false">';
    st.textContent = '';
    useBtn.disabled = false;
  } else {
    pv.innerHTML = '<div class="avm-missing">\uD83D\uDDBC\uFE0F</div>';
    st.textContent = t('avmMissing');
    useBtn.disabled = true;
  }

  var rows = document.getElementById('avm-rows');
  rows.innerHTML = '';
  AVM_AXES.forEach(function (ax) {
    var d = document.createElement('div');
    d.className = 'avm-axis';
    var lab = document.createElement('span');
    lab.className = 'avm-axis-label';
    lab.textContent = t(ax[0]);
    d.appendChild(lab);
    var line = document.createElement('div');
    line.className = 'avm-axis-opts';
    ax[2].forEach(function (opt) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'avm-opt' + (_avmState[ax[1]] === opt[0] ? ' selected' : '');
      b.textContent = t(opt[1]);
      b.addEventListener('click', function () {
        _avmState[ax[1]] = opt[0];
        try { localStorage.setItem('pth_avatar_matrix', JSON.stringify(_avmState)); } catch (e) {}
        _avmRender();
      });
      line.appendChild(b);
    });
    d.appendChild(line);
    rows.appendChild(d);
  });
}

function _avmRandom() {
  var keys = Object.keys(AVM_CAT).filter(function (k) { return AVM_CAT[k]; });
  var pick;
  do { pick = keys[Math.floor(Math.random() * keys.length)]; }
  while (keys.length > 1 && pick === _avmKey());
  var p = pick.split('|');
  _avmState = { g: p[0], a: p[1], l: p[2] };
  try { localStorage.setItem('pth_avatar_matrix', JSON.stringify(_avmState)); } catch (e) {}
  _avmRender();
}

// Apply: render the portrait to a 96x96 canvas and go through the exact
// photo-import path (pth_avatar_img + '__img__'), so broadcast, seats and
// the PokerTH avatar-server upload all behave as for a camera import.
function _avmApply() {
  var file = AVM_CAT[_avmKey()];
  if (!file) return;
  var img = new Image();
  img.onload = function () {
    try {
      var SZ = 96;
      var cv = document.createElement('canvas');
      cv.width = SZ; cv.height = SZ;
      var ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0, SZ, SZ);
      var dataUrl = cv.toDataURL('image/jpeg', 0.85);
      localStorage.setItem('pth_avatar_img', dataUrl);
      localStorage.setItem('pth_avatar', '__img__');
    } catch (e) { return; }
    if (typeof window.selectAvatarPopup === 'function') window.selectAvatarPopup('__img__');
    if (typeof window._broadcastMyAvatar === 'function') window._broadcastMyAvatar('__img__');
    try {
      var pi = document.getElementById('player-info-modal');
      if (pi && pi.style.display !== 'none' && typeof window.openPlayerInfoPopup === 'function') window.openPlayerInfoPopup();
    } catch (e) {}
  };
  img.src = AVM_BASE + file;
}

// ── Import pane ──────────────────────────────────────────────────────────
function _avImportRender() {
  var pane = document.getElementById('avp-pane-import');
  if (!pane) return;
  if (!pane.firstChild) {
    pane.innerHTML =
      '<div class="avi-drop" id="avi-drop">' +
      '<div class="avi-ico">\uD83D\uDCF7</div>' +
      '<div class="avi-line" id="avi-l1"></div>' +
      '<div class="avi-or" id="avi-l2"></div>' +
      '<button type="button" class="avm-btn" id="avi-pick"></button>' +
      '<div class="avi-hint" id="avi-l3"></div>' +
      '</div>';
    var drop = document.getElementById('avi-drop');
    document.getElementById('avi-pick').addEventListener('click', function () {
      if (typeof window.pickAvatarImage === 'function') window.pickAvatarImage();
    });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('over'); });
    drop.addEventListener('drop', function (e) {
      e.preventDefault();
      drop.classList.remove('over');
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f && typeof window._processAvatarFile === 'function') window._processAvatarFile(f);
    });
  }
  document.getElementById('avi-l1').textContent = t('avImportDrop');
  document.getElementById('avi-l2').textContent = t('avImportOr');
  document.getElementById('avi-pick').textContent = '\uD83D\uDCC1 ' + t('avImportBtn');
  document.getElementById('avi-l3').textContent = t('avImportHint');
}

export { avStudioTab, avStudioReset };
for (const [k, v] of Object.entries({ avStudioTab, avStudioReset }))
  window[k] = v;
