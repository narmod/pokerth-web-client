// Avatar capture — guided framing for « From a photo » (BETA, narmod
// 2026-09-27): a full-screen panel with a square viewport, a face template
// (oval + eye line + shoulders) drawn over either the front camera (live,
// mirrored) or a photo the player pans / zooms with a finger or the mouse.
// On validation the viewport square is rendered on a 400x400 canvas and
// handed back with the template geometry, so the analysis
// (avatar-photo.mjs) knows where the face is instead of searching for it.
//
// Nothing is stored or sent: the video stream is stopped on close and the
// capture canvas lives only for the analysis.
//
// The silhouette (masculine / feminine) is chosen IN the panel, before the
// photo, so the analysis never has to guess it (narmod 2026-09-27).
//
// avCaptureOpen({ mode: 'camera' | 'photo', file, sex, onResult(canvas, guide, sex) })

'use strict';

import { AV_SEX_SAMPLE, avSvg, avSexIcon } from './avatar-vector.mjs';

// Template, as fractions of the viewport square: the face oval runs from
// the hairline to the chin, temple to temple; the eye line sits 38 % down
// the oval (hairline → eyes ≈ 1.1 E, eyes → chin ≈ 1.8 E).
const AV_GUIDE = { cx: 0.5, cy: 0.44, rx: 0.24, ry: 0.31 };
const AV_CAPTURE_SIZE = 400;
const AV_PHOTO_MAXSIDE = 1400; // decoded photo cap (memory on phones)

var _st = null; // current panel state

function _t(k, fb) {
  try { var v = (typeof window.t === 'function') ? window.t(k) : null; if (v && v !== k) return v; } catch (e) {}
  return fb || k;
}

function _guideSvg() {
  var g = AV_GUIDE, cx = g.cx * 100, cy = g.cy * 100, rx = g.rx * 100, ry = g.ry * 100;
  var eyeY = cy - 0.24 * ry;
  return '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">'
    + '<defs><mask id="avcm"><rect width="100" height="100" fill="#fff"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#000"/></mask></defs>'
    + '<rect width="100" height="100" fill="rgba(0,0,0,0.45)" mask="url(#avcm)"/>'
    + '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="#fff" stroke-width="0.7" stroke-dasharray="2 1.4" vector-effect="non-scaling-stroke"/>'
    + '<line x1="' + (cx - rx * 0.8) + '" y1="' + eyeY + '" x2="' + (cx + rx * 0.8) + '" y2="' + eyeY + '" stroke="#fff" stroke-width="0.4" stroke-dasharray="1.5 1.5" opacity="0.8" vector-effect="non-scaling-stroke"/>'
    + '<path d="M18 92 Q35 74 50 76 Q65 74 82 92" fill="none" stroke="#fff" stroke-width="0.5" stroke-dasharray="2 1.4" opacity="0.7" vector-effect="non-scaling-stroke"/>'
    + '</svg>';
}

function _build() {
  var root = document.createElement('div');
  root.className = 'avm-cam';
  root.id = 'avm-cam';
  root.innerHTML =
    '<div class="avm-cam-card" role="dialog" aria-modal="true">' +
    '<div class="avm-cam-title"><span id="avm-cam-title"></span><sup class="avm-beta">' + _t('avmBeta', 'beta') + '</sup></div>' +
    // step 1: the silhouette, two big cards (the photo never decides it)
    '<div class="avm-cam-choose" id="avm-cam-choose" role="radiogroup" aria-label="' + _t('avmSex', 'Silhouette') + '">' +
    [0, 1].map(function (sx) {
      return '<button type="button" class="avm-cam-sexcard" data-sex="' + sx + '" role="radio">'
        + '<span class="avm-cam-sexpic">' + avSvg(AV_SEX_SAMPLE[sx], 104) + '</span>'
        + '<span class="avm-cam-sexlbl">' + avSexIcon(sx) + '<span>' + _t(sx === 0 ? 'avmMale' : 'avmFemale', sx === 0 ? 'Man' : 'Woman') + '</span></span>'
        + '</button>';
    }).join('') +
    '</div>' +
    // step 2: the framing
    '<button type="button" class="avm-btn avm-cam-sexbtn" id="avm-cam-sexbtn" title="' + _t('avmSex', 'Silhouette') + '"></button>' +
    '<div class="avm-cam-view" id="avm-cam-view">' +
    '<video id="avm-cam-video" autoplay playsinline muted style="display:none"></video>' +
    '<div class="avm-cam-guide">' + _guideSvg() + '</div>' +
    '</div>' +
    '<div class="avm-cam-hint" id="avm-cam-hint"></div>' +
    '<div class="avm-cam-btns">' +
    '<button type="button" class="avm-btn" id="avm-cam-cancel"></button>' +
    '<button type="button" class="avm-btn" id="avm-cam-switch"></button>' +
    '<button type="button" class="avm-btn avm-use" id="avm-cam-ok"></button>' +
    '</div>' +
    '<input type="file" id="avm-cam-file" accept="image/*" style="display:none">' +
    '</div>';
  document.body.appendChild(root);
  return root;
}

// ── camera ───────────────────────────────────────────────────────────────
function _startCamera(st) {
  var video = st.video;
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    return Promise.reject(new Error('no-camera'));
  }
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 960 } }, audio: false
  }).then(function (stream) {
    st.stream = stream;
    video.srcObject = stream;
    video.style.display = '';
    return video.play().catch(function () {});
  });
}
function _stopCamera(st) {
  try { if (st.stream) st.stream.getTracks().forEach(function (tr) { tr.stop(); }); } catch (e) {}
  st.stream = null;
  try { st.video.srcObject = null; } catch (e) {}
  st.video.style.display = 'none';
}

// ── photo (pan / zoom) ───────────────────────────────────────────────────
// Image pixel (u, v) shows at viewport (tx + u * s, ty + v * s).
function _photoLayout(st) {
  if (!st.img) return;
  st.img.style.transform = 'translate(' + st.tx + 'px,' + st.ty + 'px) scale(' + st.s + ')';
}
function _photoFit(st) {
  var S = st.view.clientWidth, w = st.img.width, h = st.img.height;
  st.sMin = Math.max(S / w, S / h) * 0.6;
  st.s = Math.max(S / w, S / h);
  // start with the face template roughly on the upper-middle of the photo
  st.tx = (S - w * st.s) / 2; st.ty = (S - h * st.s) / 2;
  _photoLayout(st);
}
function _photoGestures(st) {
  var view = st.view, pts = {};
  var pinch = null;
  var down = function (e) {
    if (!st.img) return;
    pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    try { view.setPointerCapture(e.pointerId); } catch (err) {}
    var ids = Object.keys(pts);
    if (ids.length === 2) {
      var a = pts[ids[0]], b = pts[ids[1]];
      pinch = { d: Math.hypot(b.x - a.x, b.y - a.y), s: st.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, tx: st.tx, ty: st.ty };
    }
    e.preventDefault();
  };
  var move = function (e) {
    if (!pts[e.pointerId] || !st.img) return;
    var prev = pts[e.pointerId];
    pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pts);
    if (ids.length >= 2 && pinch) {
      var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(b.x - a.x, b.y - a.y);
      var k = Math.max(st.sMin, Math.min(st.sMin * 8, pinch.s * d / Math.max(1, pinch.d))) / pinch.s;
      var r = view.getBoundingClientRect(), mx = pinch.mx - r.left, my = pinch.my - r.top;
      var cmx = (a.x + b.x) / 2 - r.left, cmy = (a.y + b.y) / 2 - r.top;
      st.s = pinch.s * k;
      st.tx = cmx - (mx - pinch.tx) * k; st.ty = cmy - (my - pinch.ty) * k;
    } else if (ids.length === 1) {
      st.tx += e.clientX - prev.x; st.ty += e.clientY - prev.y;
    }
    _photoLayout(st);
    e.preventDefault();
  };
  var up = function (e) {
    delete pts[e.pointerId];
    if (Object.keys(pts).length < 2) pinch = null;
  };
  view.addEventListener('pointerdown', down);
  view.addEventListener('pointermove', move);
  view.addEventListener('pointerup', up);
  view.addEventListener('pointercancel', up);
  view.addEventListener('wheel', function (e) {
    if (!st.img) return;
    e.preventDefault();
    var r = view.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    var k = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    var ns = Math.max(st.sMin, Math.min(st.sMin * 8, st.s * k)); k = ns / st.s;
    st.tx = mx - (mx - st.tx) * k; st.ty = my - (my - st.ty) * k; st.s = ns;
    _photoLayout(st);
  }, { passive: false });
}
function _loadPhoto(st, file) {
  var place = function (src, w, h, release) {
    var k = Math.min(1, AV_PHOTO_MAXSIDE / Math.max(w, h));
    var cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k));
    cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height);
    try { release && release(); } catch (e) {}
    if (st.img) { try { st.view.removeChild(st.img); } catch (e) {} }
    cv.className = 'avm-cam-img';
    st.view.insertBefore(cv, st.view.firstChild);
    st.img = cv;
    _photoFit(st);
    _setMode(st, 'photo');
  };
  var viaImage = function () {
    var url;
    try { url = URL.createObjectURL(file); } catch (e) { return; }
    var img = new Image();
    img.onload = function () { place(img, img.width, img.height, function () { URL.revokeObjectURL(url); img.src = ''; }); };
    img.onerror = function () { URL.revokeObjectURL(url); };
    img.src = url;
  };
  if (typeof createImageBitmap === 'function') {
    createImageBitmap(file).then(function (bmp) { place(bmp, bmp.width, bmp.height, function () { bmp.close(); }); }, viaImage);
  } else viaImage();
}

// ── capture ──────────────────────────────────────────────────────────────
// Renders what the viewport shows (the square under the template) on the
// capture canvas; the camera frame is mirrored like the preview.
function _capture(st) {
  var C = AV_CAPTURE_SIZE, cv = document.createElement('canvas');
  cv.width = C; cv.height = C;
  var ctx = cv.getContext('2d');
  ctx.fillStyle = '#e9e9e9'; ctx.fillRect(0, 0, C, C);
  st.valid = null; // the part of the frame the photo covers (fractions), null = all
  if (st.mode === 'camera') {
    var v = st.video, vw = v.videoWidth, vh = v.videoHeight;
    if (!vw || !vh) return null;
    var side = Math.min(vw, vh), sx = (vw - side) / 2, sy = (vh - side) / 2;
    ctx.translate(C, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, sx, sy, side, side, 0, 0, C, C);
  } else if (st.img) {
    var S = st.view.clientWidth, k = C / S;
    // viewport (0..S) → image (u = (vx - tx) / s)
    ctx.drawImage(st.img, 0, 0, st.img.width, st.img.height, st.tx * k, st.ty * k, st.img.width * st.s * k, st.img.height * st.s * k);
    var vx0 = st.tx * k / C, vy0 = st.ty * k / C, vx1 = vx0 + st.img.width * st.s * k / C, vy1 = vy0 + st.img.height * st.s * k / C;
    st.valid = [Math.max(0, vx0), Math.max(0, vy0), Math.min(1, vx1), Math.min(1, vy1)];
  } else return null;
  return cv;
}

function _setMode(st, mode) {
  st.mode = mode;
  var cam = mode === 'camera';
  if (st.img) st.img.style.display = cam ? 'none' : '';
  st.video.style.display = cam && st.stream ? '' : 'none';
  if (!st.root.classList.contains('is-choosing')) document.getElementById('avm-cam-title').textContent = _t('avmCamTitle', 'Frame your face');
  document.getElementById('avm-cam-hint').textContent = cam ? _t('avmCamHint', 'Place your face in the oval and look at the camera.') : _t('avmCamHintPhoto', 'Drag and zoom the photo until your face fills the oval.');
  document.getElementById('avm-cam-ok').textContent = cam ? '📷 ' + _t('avmCamShoot', 'Take the photo') : '✓ ' + _t('avmCamUse', 'Use this photo');
  document.getElementById('avm-cam-switch').textContent = (cam || st.noCamera) ? '🖼 ' + _t('avmCamGallery', 'Choose a photo') : '📷 ' + _t('avmCamCamera', 'Camera');
  document.getElementById('avm-cam-cancel').textContent = _t('cancelBtn', 'Cancel');
  document.getElementById('avm-cam-ok').disabled = !cam && !st.img;
  st.view.classList.toggle('is-photo', !cam);
}

function avCaptureClose() {
  if (!_st) return;
  _stopCamera(_st);
  try { document.body.removeChild(_st.root); } catch (e) {}
  try { document.removeEventListener('keydown', _st.onKey); } catch (e) {}
  _st = null;
}

function avCaptureOpen(opts) {
  opts = opts || {};
  avCaptureClose();
  var root = _build();
  var st = _st = {
    root: root, view: document.getElementById('avm-cam-view'), video: document.getElementById('avm-cam-video'),
    img: null, stream: null, noCamera: false, mode: 'camera', s: 1, sMin: 0.1, tx: 0, ty: 0, onResult: opts.onResult,
    sex: opts.sex === 1 ? 1 : 0
  };
  _photoGestures(st);
  st.pendingFile = (opts.mode === 'photo' && opts.file) ? opts.file : null;
  var cards = root.querySelectorAll('.avm-cam-sexcard');
  var paintSex = function () {
    cards.forEach(function (b) {
      var on = +b.getAttribute('data-sex') === st.sex;
      b.classList.toggle('selected', on); b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    var sb = document.getElementById('avm-cam-sexbtn');
    sb.innerHTML = avSexIcon(st.sex) + ' <span>' + _t(st.sex === 0 ? 'avmMale' : 'avmFemale', st.sex === 0 ? 'Man' : 'Woman') + '</span> \u270E';
  };
  var showChooser = function (on) {
    root.classList.toggle('is-choosing', on);
    document.getElementById('avm-cam-title').textContent = on ? _t('avmSex', 'Silhouette') : _t('avmCamTitle', 'Frame your face');
    if (on) _stopCamera(st);
  };
  cards.forEach(function (b) {
    b.addEventListener('click', function () {
      st.sex = +b.getAttribute('data-sex'); paintSex();
      showChooser(false);
      if (st.pendingFile) { var pf = st.pendingFile; st.pendingFile = null; _setMode(st, 'photo'); _loadPhoto(st, pf); }
      else if (st.img) _setMode(st, 'photo');
      else if (st.noCamera) _setMode(st, 'photo');
      else { _setMode(st, 'camera'); _startCamera(st).then(function () { if (_st === st) _setMode(st, 'camera'); }, function () { if (_st === st) _cameraFailed(st); }); }
    });
  });
  document.getElementById('avm-cam-sexbtn').addEventListener('click', function () { showChooser(true); });
  paintSex();
  showChooser(true);
  document.getElementById('avm-cam-cancel').addEventListener('click', avCaptureClose);
  document.getElementById('avm-cam-file').addEventListener('change', function () {
    var f = this.files && this.files[0];
    if (f && /^image\//.test(f.type)) { _stopCamera(st); _loadPhoto(st, f); }
  });
  document.getElementById('avm-cam-switch').addEventListener('click', function () {
    if (st.mode === 'camera' || st.noCamera) {
      var inp = document.getElementById('avm-cam-file'); inp.value = ''; inp.click();
    } else {
      _setMode(st, 'camera');
      _startCamera(st).then(function () { if (_st === st) _setMode(st, 'camera'); }, function () { if (_st === st) _cameraFailed(st); });
    }
  });
  document.getElementById('avm-cam-ok').addEventListener('click', function () {
    var cv = _capture(st);
    if (!cv) return;
    var cb = st.onResult;
    avCaptureClose();
    var guide = Object.assign({}, AV_GUIDE);
    if (st.valid) guide.valid = st.valid;
    if (typeof cb === 'function') cb(cv, guide, st.sex);
  });
  st.onKey = function (e) { if (e.key === 'Escape') avCaptureClose(); };
  document.addEventListener('keydown', st.onKey);

  // the camera (or the photo) starts once the silhouette card is tapped
  _setMode(st, (opts.mode === 'photo' && opts.file) ? 'photo' : 'camera');
}

// No camera (or permission refused): photo mode only, the switch button
// becomes the file picker.
function _cameraFailed(st) {
  _stopCamera(st);
  st.noCamera = true;
  _setMode(st, 'photo');
  if (!st.img) document.getElementById('avm-cam-hint').textContent = _t('avmCamDenied', 'Camera unavailable — choose a photo instead.');
}

export { avCaptureOpen, avCaptureClose, AV_GUIDE, AV_CAPTURE_SIZE };
for (const [k, v] of Object.entries({ avCaptureOpen, avCaptureClose, AV_GUIDE }))
  window['_' + k] = v;
