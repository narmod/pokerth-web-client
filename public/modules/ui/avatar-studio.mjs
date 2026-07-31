// Avatar studio — tabbed avatar window (Gallery / Create / Import).
//
// Gallery: untouched legacy emoji grid. Import: explicit photo import
// (drop zone + button), reusing _processAvatarFile() from the page head.
// Create: VECTOR portrait generator (style validated with narmod
// 2026-07-31) — layered SVG portraits rendered by modules/ui/avatar-vector.mjs,
// replacing the earlier pre-generated photo matrix. Option chips are visual
// (mini portrait previews / color swatches), so only axis labels need i18n.
//
// Applying a portrait rasterizes the SVG on a 96x96 canvas and goes through
// the SAME path as a photo import (JPEG dataURL -> pth_avatar_img +
// '__img__'), so seats, proxy broadcast and the PokerTH upload pipeline all
// work unchanged. The recipe is persisted in pth_avatar_vec for re-editing.
//
// Advanced option 'avatar_create' (default ON) hides the Create tab via
// body.adv-no-avcreate (see applyAdvOpts in pokerth.js).

'use strict';

import { AV_AXES, avSvg, avSwatch, avNormalize, avRandom } from './avatar-vector.mjs';

function t(k, p) { return (typeof window.t === 'function') ? window.t(k, p) : k; }

var _avmState = avNormalize(null);
try {
  var _saved = JSON.parse(localStorage.getItem('pth_avatar_vec') || 'null');
  if (_saved) _avmState = avNormalize(_saved);
} catch (e) {}

function _avmPersist() {
  try { localStorage.setItem('pth_avatar_vec', JSON.stringify(_avmState)); } catch (e) {}
}

// ── Tab switching ────────────────────────────────────────────────────────
function avStudioTab(tab) {
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

// Called when the popup opens (from toggleAvatarPopup).
function avStudioReset() { avStudioTab('gallery'); }

// ── Create pane (vector generator) ───────────────────────────────────────
function _avmRender() {
  var pane = document.getElementById('avp-pane-create');
  if (!pane) return;
  if (!pane.firstChild) {
    pane.innerHTML =
      '<div class="avm-wrap">' +
      '<div class="avm-left">' +
      '<div class="avm-preview" id="avm-preview"></div>' +
      '<button type="button" class="avm-btn" id="avm-dice">\uD83C\uDFB2 <span></span></button>' +
      '</div>' +
      '<div class="avm-rows" id="avm-rows"></div>' +
      '</div>' +
      '<div class="avm-foot"><button type="button" class="avm-btn avm-use" id="avm-use"></button></div>';
    document.getElementById('avm-dice').addEventListener('click', function () {
      _avmState = avRandom(); _avmPersist(); _avmRender();
    });
    document.getElementById('avm-use').addEventListener('click', _avmApply);
  }
  document.querySelector('#avm-dice span').textContent = t('avmRandom');
  document.getElementById('avm-use').textContent = t('avmUse');

  document.getElementById('avm-preview').innerHTML = avSvg(_avmState, 148);

  var rows = document.getElementById('avm-rows');
  rows.innerHTML = '';
  AV_AXES.forEach(function (ax) {
    var d = document.createElement('div');
    d.className = 'avm-axis';
    var lab = document.createElement('span');
    lab.className = 'avm-axis-label';
    lab.textContent = t(ax.label);
    d.appendChild(lab);
    var line = document.createElement('div');
    line.className = 'avm-axis-opts';
    for (var i = 0; i < ax.n; i++) {
      (function (i) {
        var b = document.createElement('button');
        b.type = 'button';
        var sel = _avmState[ax.id] === i;
        b.setAttribute('aria-label', t(ax.label) + ' ' + (i + 1));
        if (ax.none && i === 0) {
          b.className = 'avm-opt avm-none-opt' + (sel ? ' selected' : '');
          b.textContent = t('avmNone');
        } else if (ax.kind === 'color') {
          b.className = 'avm-swatch' + (sel ? ' selected' : '');
          b.innerHTML = '<span style="background:' + avSwatch(ax.id, i) + '"></span>';
        } else {
          // Mini portrait preview with this option applied to the current
          // recipe -- makes shape choices self-explanatory without i18n.
          var alt = {}; for (var k in _avmState) alt[k] = _avmState[k];
          alt[ax.id] = i;
          b.className = 'avm-mini' + (sel ? ' selected' : '');
          b.innerHTML = avSvg(alt, 36);
        }
        b.addEventListener('click', function () {
          _avmState[ax.id] = i; _avmPersist(); _avmRender();
        });
        line.appendChild(b);
      })(i);
    }
    d.appendChild(line);
    rows.appendChild(d);
  });
}

// Apply: rasterize the SVG on a 96x96 canvas and reuse the photo-import
// path (pth_avatar_img + '__img__'): broadcast, seats and the PokerTH
// avatar-server upload behave exactly as for a camera import.
function _avmApply() {
  var svg = avSvg(_avmState, 96);
  var img = new Image();
  img.onload = function () {
    try {
      var SZ = 96;
      var cv = document.createElement('canvas');
      cv.width = SZ; cv.height = SZ;
      var ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0, SZ, SZ);
      var dataUrl = cv.toDataURL('image/jpeg', 0.88);
      localStorage.setItem('pth_avatar_img', dataUrl);
      localStorage.setItem('pth_avatar', '__img__');
    } catch (e) { return; }
    if (typeof window.selectAvatarPopup === 'function') window.selectAvatarPopup('__img__');
    if (typeof window._broadcastMyAvatar === 'function') window._broadcastMyAvatar('__img__');
    // Close like a gallery pick: in modal mode the popup keeps
    // display:flex !important, so the inline display:'none' set by
    // selectAvatarPopup is not enough -- go through the modal close path.
    if (typeof window.closeAvatarPickerFromLobby === 'function') window.closeAvatarPickerFromLobby();
    try { if (typeof window.updateLobbyPill === 'function') window.updateLobbyPill(); } catch (e) {}
    try {
      var pi = document.getElementById('player-info-modal');
      if (pi && pi.style.display !== 'none' && typeof window.openPlayerInfoPopup === 'function') window.openPlayerInfoPopup();
    } catch (e) {}
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
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
