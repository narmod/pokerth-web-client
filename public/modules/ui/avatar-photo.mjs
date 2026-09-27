// Avatar photo analysis — « Depuis une photo » (BETA, narmod 2026-09-27).
//
// Estimates a portrait recipe (avatar-vector.mjs axes) from a photo,
// ENTIRELY in the browser: no library, no model, no upload — the photo
// never leaves the device (same spirit as the 3DS Mii Maker). Level 1 of
// the plan: classic image analysis on a small canvas.
//
//   1. skin segmentation (YCbCr, minus the background colour of the
//      corners) → most face-like skin blob → rough face box
//   2. eyes: darkest blob with bright surroundings in each eye zone →
//      open / closed / wink, iris colour around the pupil; when both pupils
//      are found the face box is REBUILT from the pupil distance
//      (anthropometric ratios), which survives beards and bare necks
//   3. face shape from the box proportions (oval / round / square)
//   4. skin tone: median of the cheeks, nearest palette entry
//   5. hair: flood fill from the pixels just above the forehead through
//      similar colours → colour, coverage (bald), length, volume, cap
//   6. glasses: dark frame pixels in the eye band + a dark nose bridge;
//      sunglasses when both eye zones are uniformly dark
//   7. mouth: reddish lip band → width, curvature, teeth, opening,
//      lipstick (feminine silhouette)
//   8. beard (masculine): dark hair-like mass under the chin, moustache
//   9. background: corner colour → nearest pastel backdrop
//
// It is a STARTING POINT the player adjusts; results depend on lighting,
// a frontal pose and a plain background. avPhotoAnalyze() works on an
// ImageData-like object so it can run headless in tests; avPhotoRecipe()
// draws any CanvasImageSource on a small canvas first.

'use strict';

const AV_PHOTO_MAXW = 220;

// Palettes mirrored from avatar-vector.mjs (base colours, same order) —
// kept local so the analysis stays a leaf module.
const P_SKIN = ['#ffe0c7', '#f7c9a2', '#eeb987', '#d99d6c', '#b87a4b', '#8d5a35', '#fff0e3', '#6e4527', '#553219', '#3d2412'];
const P_HAIR = ['#2b2118', '#4a3222', '#7a5530', '#b14a22', '#dcae50', '#a9a9a9', '#ecd7a2', '#eeeeee'];
const P_BG = ['#b9dfbe', '#b7cff0', '#f2bcc0', '#d3c1ef', '#d2d6dc', '#b0ded8', '#efcfa9', '#ffffff', '#e9edf2', '#f8eac0', '#cae0f4'];

// ── colour helpers ───────────────────────────────────────────────────────
function hex2rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgb2lab(r, g, b) {
  var f = function (c) { c /= 255; return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92; };
  r = f(r); g = f(g); b = f(b);
  var x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  var y = (r * 0.2126 + g * 0.7152 + b * 0.0722);
  var z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  var t = function (c) { return c > 0.008856 ? Math.cbrt(c) : 7.787 * c + 16 / 116; };
  x = t(x); y = t(y); z = t(z);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
function labDist(a, b) { return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2])); }
var P_SKIN_LAB = P_SKIN.map(function (h) { return rgb2lab.apply(null, hex2rgb(h)); });
var P_HAIR_LAB = P_HAIR.map(function (h) { return rgb2lab.apply(null, hex2rgb(h)); });
var P_BG_LAB = P_BG.map(function (h) { return rgb2lab.apply(null, hex2rgb(h)); });
function nearestLab(lab, labs) {
  var best = 0, bd = 1e9;
  for (var i = 0; i < labs.length; i++) { var d = labDist(lab, labs[i]); if (d < bd) { bd = d; best = i; } }
  return { index: best, dist: bd };
}
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
  if (d > 0) {
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (mx === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return [h, s, l];
}
function median(arr) {
  if (!arr.length) return 0;
  var a = arr.slice().sort(function (x, y) { return x - y; });
  return a[a.length >> 1];
}
function medianRgb(px) { // px: flat [r,g,b, r,g,b, ...]
  var r = [], g = [], b = [];
  for (var i = 0; i < px.length; i += 3) { r.push(px[i]); g.push(px[i + 1]); b.push(px[i + 2]); }
  return [median(r), median(g), median(b)];
}

// ── analysis ─────────────────────────────────────────────────────────────
// img: { width, height, data: Uint8ClampedArray RGBA } — opts: { sex: 0|1 }
// returns { recipe, debug } or null when no face is found
function avPhotoAnalyze(img, opts) {
  opts = opts || {};
  var sex = opts.sex === 1 ? 1 : 0;
  var W = img.width, H = img.height, N = W * H;
  var i, x, y, r, g, b;
  // auto-levels (same gain on R, G, B, hue kept) so under-exposed photos give
  // usable skin tones and thresholds
  var D = new Uint8ClampedArray(img.data), hist = new Int32Array(256);
  for (i = 0; i < N; i++) hist[Math.round(0.299 * D[i * 4] + 0.587 * D[i * 4 + 1] + 0.114 * D[i * 4 + 2])]++;
  var lo = 0, hi = 255, acc = 0;
  for (i = 0; i < 256; i++) { acc += hist[i]; if (acc >= 0.02 * N) { lo = i; break; } }
  acc = 0; for (i = 255; i >= 0; i--) { acc += hist[i]; if (acc >= 0.02 * N) { hi = i; break; } }
  // only clearly UNDER-exposed photos are brightened (dark rooms, backlight):
  // a stretch on a normal photo makes dark hair skin-coloured, and a high-key
  // photo (pale face on a white wall) has a high 2nd percentile by nature
  if (hi < 200 && hi - lo > 30) {
    var gain = (225 - lo) / (hi - lo);
    for (i = 0; i < N * 4; i++) { if ((i & 3) === 3) continue; D[i] = Math.max(0, Math.min(255, Math.round((D[i] - lo) * gain + lo))); }
  }
  var lum = new Float32Array(N), cr = new Float32Array(N), lab = new Float32Array(N * 3), skin = new Uint8Array(N);
  for (i = 0; i < N; i++) {
    r = D[i * 4]; g = D[i * 4 + 1]; b = D[i * 4 + 2];
    var Y = 0.299 * r + 0.587 * g + 0.114 * b;
    var Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    var Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    lum[i] = Y; cr[i] = Cr;
    var l = rgb2lab(r, g, b); lab[i * 3] = l[0]; lab[i * 3 + 1] = l[1]; lab[i * 3 + 2] = l[2];
    skin[i] = (Cb >= 77 && Cb <= 127 && Cr >= 133 && Cr <= 177 && r > g && r > b && Y > 25) ? 1 : 0;
  }
  var at = function (xx, yy) { return yy * W + xx; };
  var labAt = function (idx) { return [lab[idx * 3], lab[idx * 3 + 1], lab[idx * 3 + 2]]; };
  var dLab = function (idx, l2) { var a = lab[idx * 3] - l2[0], bb = lab[idx * 3 + 1] - l2[1], c = lab[idx * 3 + 2] - l2[2]; return Math.sqrt(a * a + bb * bb + c * c); };

  // background colours: the four corners
  var cs = Math.max(4, Math.round(Math.min(W, H) * 0.08)), bgs = [];
  [[0, 0], [W - cs, 0], [0, H - cs], [W - cs, H - cs]].forEach(function (c) {
    var px = [];
    for (y = c[1]; y < c[1] + cs; y++) for (x = c[0]; x < c[0] + cs; x++) { i = at(x, y); px.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]); }
    bgs.push(medianRgb(px));
  });
  var bgLabs = bgs.map(function (c) { return rgb2lab(c[0], c[1], c[2]); });
  var isBg = function (idx, tol) {
    for (var k = 0; k < bgLabs.length; k++) if (dLab(idx, bgLabs[k]) < (tol || 22)) return true;
    return false;
  };
  // a skin-coloured wall must not become the face
  for (i = 0; i < N; i++) if (skin[i] && isBg(i, 16)) skin[i] = 0;

  // 1. skin blobs (4-connected) → the most face-like one
  var label = new Int32Array(N), comps = [], stack = new Int32Array(N);
  for (i = 0; i < N; i++) {
    if (!skin[i] || label[i]) continue;
    var id = comps.length + 1, sp = 0, area = 0, sx = 0, sy = 0, minx = W, maxx = 0, miny = H, maxy = 0;
    stack[sp++] = i; label[i] = id;
    while (sp) {
      var p = stack[--sp]; area++;
      var px = p % W, py = (p - px) / W;
      sx += px; sy += py;
      if (px < minx) minx = px; if (px > maxx) maxx = px; if (py < miny) miny = py; if (py > maxy) maxy = py;
      if (px > 0 && skin[p - 1] && !label[p - 1]) { label[p - 1] = id; stack[sp++] = p - 1; }
      if (px < W - 1 && skin[p + 1] && !label[p + 1]) { label[p + 1] = id; stack[sp++] = p + 1; }
      if (py > 0 && skin[p - W] && !label[p - W]) { label[p - W] = id; stack[sp++] = p - W; }
      if (py < H - 1 && skin[p + W] && !label[p + W]) { label[p + W] = id; stack[sp++] = p + W; }
    }
    comps.push({ id: id, area: area, cx: sx / area, cy: sy / area, minx: minx, maxx: maxx, miny: miny, maxy: maxy });
  }
  if (!comps.length) return null;
  var best = null, bestScore = 0;
  comps.forEach(function (c) {
    if (c.area < 0.015 * N) return;
    var dx = (c.cx - W / 2) / W, dy = (c.cy - H / 2) / H;
    var bw = c.maxx - c.minx + 1, bh = c.maxy - c.miny + 1, asp = bh / bw;
    var fill = c.area / (bw * bh);            // a face fills ~60-80% of its box
    var score = c.area * (1 - 0.6 * Math.sqrt(dx * dx + dy * dy));
    if (asp < 0.6 || asp > 2.2) score *= 0.4;
    if (fill < 0.35) score *= 0.5;
    if (score > bestScore) { bestScore = score; best = c; }
  });
  if (!best) return null;
  var fid = best.id;

  // rough face box from the blob's row profile
  var rowW = new Int32Array(H), rowMin = new Int32Array(H), rowMax = new Int32Array(H);
  for (y = 0; y < H; y++) { rowMin[y] = W; rowMax[y] = -1; }
  for (i = 0; i < N; i++) {
    if (label[i] !== fid) continue;
    x = i % W; y = (i - x) / W;
    rowW[y]++; if (x < rowMin[y]) rowMin[y] = x; if (x > rowMax[y]) rowMax[y] = x;
  }
  var top = best.miny, compH = best.maxy - best.miny + 1;
  var maxW = 0, yMax = top;
  for (y = top; y <= Math.min(H - 1, top + Math.round(compH * 0.75)); y++) if (rowW[y] > maxW) { maxW = rowW[y]; yMax = y; }
  var bottom = best.maxy;
  for (y = yMax; y <= best.maxy; y++) if (rowW[y] < 0.55 * maxW) { bottom = y - 1; break; }
  var left = W, right = 0;
  for (y = top; y <= bottom; y++) if (rowW[y] > 0.4 * maxW) { if (rowMin[y] < left) left = rowMin[y]; if (rowMax[y] > right) right = rowMax[y]; }
  var fw = right - left + 1, fh = bottom - top + 1;
  if (fw < 12 || fh < 12) return null;
  if (fh > 1.6 * fw) { fh = Math.round(1.6 * fw); bottom = top + fh - 1; } // neck / chest cut
  var cx = (left + right) / 2;

  // skin statistics (cheeks)
  var skinStats = function () {
    var la = [], px = [], crs = [];
    for (y = Math.round(top + 0.3 * fh); y < top + 0.7 * fh; y++) for (x = Math.round(left + 0.25 * fw); x < right - 0.25 * fw; x++) {
      i = at(x, y); if (label[i] !== fid) continue;
      la.push(lum[i]); px.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]); crs.push(cr[i]);
    }
    return la.length < 20 ? null : { lum: median(la), rgb: medianRgb(px), cr: median(crs) };
  };
  var st = skinStats();
  if (!st) return null;
  var skinLum = st.lum;
  var inFace = function (xx, yy) { // slightly grown face ellipse
    var ex = (xx - cx) / (fw * 0.55), ey = (yy - (top + fh * 0.5)) / (fh * 0.56);
    return ex * ex + ey * ey <= 1;
  };

  // 2. eyes: darkest 3x3 spot whose ring of neighbours is bright (sclera),
  // eyebrows score worse because their surroundings are plain skin
  var blur = function (xx, yy) {
    var s = 0, n = 0;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
      var xa = xx + dx, ya = yy + dy;
      if (xa < 0 || ya < 0 || xa >= W || ya >= H) continue;
      s += lum[at(xa, ya)]; n++;
    }
    return s / n;
  };
  // candidates: dark 3x3 spot, brighter on BOTH sides at the same height
  // (sclera or skin); the eyebrow fails (dark on both sides), the nose
  // shadow mostly fails on one side. Then the best PAIR at similar height
  // and plausible distance wins, which drops stray shadows.
  var eyeCands = function (x0, x1, y0, y1) {
    var side = Math.max(3, Math.round(fw * 0.09)), list = [];
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      if (x - side < 0 || x + side >= W || y < 1 || y >= H - 1) continue;
      var bl = blur(x, y);
      if (bl > skinLum * 0.75) continue;
      var lft = blur(x - side, y), rgt = blur(x + side, y);
      var sc = bl - Math.min(lft, rgt); // both sides must be brighter
      if (sc > -15) continue;
      list.push({ x: x, y: y, lum: bl, score: sc });
    }
    list.sort(function (a, b2) { return a.score - b2.score; });
    var keep = [], nms = fw * 0.08;
    for (var k = 0; k < list.length && keep.length < 6; k++) {
      var ok = true;
      for (var m = 0; m < keep.length; m++) if (Math.hypot(keep[m].x - list[k].x, keep[m].y - list[k].y) < nms) { ok = false; break; }
      if (ok) keep.push(list[k]);
    }
    return keep;
  };
  var ey0 = Math.round(top + 0.2 * fh), ey1 = Math.round(top + 0.6 * fh);
  var cL = eyeCands(Math.round(left + 0.08 * fw), Math.round(left + 0.47 * fw), ey0, ey1);
  var cR = eyeCands(Math.round(left + 0.53 * fw), Math.round(right - 0.08 * fw), ey0, ey1);
  var eL = cL[0] || null, eR = cR[0] || null, bestPair = 1e9;
  cL.forEach(function (a) { cR.forEach(function (b2) {
    var dist = Math.hypot(b2.x - a.x, b2.y - a.y), pen = Math.abs(b2.y - a.y) * 3 + Math.abs(dist - 0.42 * fw) * 2;
    var sc = a.score + b2.score + pen;
    if (sc < bestPair) { bestPair = sc; eL = a; eR = b2; }
  }); });
  var isOpen = function (e) { return !!e && e.lum < skinLum - 28 && e.score < -20; };
  var openL = isOpen(eL), openR = isOpen(eR);
  // sunglasses: both eye zones uniformly dark
  var zoneDark = function (e) {
    if (!e) return 0;
    var rz = Math.round(fw * 0.11), c = 0, n = 0;
    for (var dy = -rz; dy <= rz; dy++) for (var dx = -rz; dx <= rz; dx++) {
      var xa = e.x + dx, ya = e.y + dy;
      if (xa < 0 || ya < 0 || xa >= W || ya >= H) continue;
      n++; if (lum[at(xa, ya)] < 55) c++;
    }
    return n ? c / n : 0;
  };
  var sunglasses = zoneDark(eL) > 0.5 && zoneDark(eR) > 0.5;

  // pupils found on both sides → rebuild the box from the pupil distance
  // (hairline ≈ 1.1 E above, chin ≈ 1.75 E below, width ≈ 2.2 E)
  var E = (eL && eR) ? Math.hypot(eR.x - eL.x, eR.y - eL.y) : 0;
  var eyesOk = E > 0.3 * fw && E > 6 && Math.abs(eR.y - eL.y) < 0.25 * E && (openL || openR || sunglasses);
  if (eyesOk) {
    var mx = (eL.x + eR.x) / 2, my = (eL.y + eR.y) / 2;
    left = Math.max(0, Math.round(mx - 1.1 * E)); right = Math.min(W - 1, Math.round(mx + 1.1 * E));
    top = Math.max(0, Math.round(my - 1.1 * E)); bottom = Math.min(H - 1, Math.round(my + 1.75 * E));
    fw = right - left + 1; fh = bottom - top + 1; cx = (left + right) / 2;
    st = skinStats() || st; skinLum = st.lum;
  }
  var eyes = 0, eyec = 0;
  if (sunglasses) eyes = 0;
  else if (!openL && !openR) eyes = 2;
  else if (openL !== openR) eyes = 3;
  var irisPx = [];
  if (!sunglasses) [eL, eR].forEach(function (e, k) {
    if (!e || !(k === 0 ? openL : openR)) return;
    var rI = Math.max(2, Math.round(fw * 0.04));
    for (var dy = -rI; dy <= rI; dy++) for (var dx = -rI; dx <= rI; dx++) {
      var d2 = dx * dx + dy * dy;
      if (d2 > rI * rI || d2 < 1) continue;
      var xa = e.x + dx, ya = e.y + dy;
      if (xa < 0 || ya < 0 || xa >= W || ya >= H) continue;
      var idx = at(xa, ya);
      if (lum[idx] < 40 || lum[idx] > 170 || skin[idx]) continue;
      irisPx.push(D[idx * 4], D[idx * 4 + 1], D[idx * 4 + 2]);
    }
  });
  if (irisPx.length >= 6) {
    var ir = medianRgb(irisPx), hs = rgb2hsl(ir[0], ir[1], ir[2]);
    if (hs[2] < 0.2) eyec = 5;
    else if (hs[1] < 0.15) eyec = 3;
    else if (hs[0] >= 180 && hs[0] <= 265) eyec = 1;
    else if (hs[0] >= 70 && hs[0] < 180) eyec = 2;
    else if (hs[0] >= 25 && hs[0] < 70 && hs[2] > 0.35) eyec = 4;
    else eyec = 0;
  }

  // 3. face shape from the SKIN rows below the eyes: where the width drops
  // is the chin (or a beard, handled below); its distance from the eyes
  // tells long vs round, the width just above it tells square vs oval.
  var eyeMid0 = eyesOk ? (eL.y + eR.y) / 2 : top + 0.42 * fh, E0 = eyesOk ? E : 0.42 * fw;
  var cheekW = 0;
  for (y = Math.round(eyeMid0); y <= Math.min(H - 1, Math.round(eyeMid0 + 0.9 * E0)); y++) if (rowW[y] > cheekW) cheekW = rowW[y];
  var chinY = Math.min(H - 1, Math.round(eyeMid0 + 2.2 * E0));
  for (y = Math.round(eyeMid0 + 0.9 * E0); y <= chinY; y++) if (rowW[y] < 0.5 * cheekW) { chinY = y; break; }
  var jawW = rowW[Math.max(0, Math.round(chinY - 0.35 * E0))] || 0;
  var jaw = cheekW ? jawW / cheekW : 0, aspect = (chinY - eyeMid0) / E0;
  var face = (jaw > 0.8 && aspect > 1.5) ? 2 : (aspect < 1.55 ? 1 : 0);

  // 5. hair. Bald = the skin blob climbs far above the eyes (crown visible):
  // hairline ≈ 1.0-1.2 E above the pupils, a bald crown ≈ 1.5-2 E. Then the
  // hair colour comes from just above the skin top, and a flood fill through
  // similar colours (not the background) gives length and volume.
  var hz = { x0: Math.max(0, Math.round(left - 0.5 * fw)), x1: Math.min(W - 1, Math.round(right + 0.5 * fw)),
             y0: Math.max(0, Math.round(top - 0.8 * fh)), y1: Math.min(H - 1, Math.round(bottom + 0.4 * fh)) };
  var skinTop = top, eyeMidY = eyesOk ? (eL.y + eR.y) / 2 : top + 0.42 * fh, Eref = eyesOk ? E : 0.42 * fw;
  var scanTop = Math.max(0, Math.round(eyeMidY - 2.4 * Eref));
  for (y = scanTop; y < eyeMidY; y++) {
    var cnt = 0;
    // dark brown hair passes the chroma test: the crown must be as bright as the cheeks
    for (x = Math.round(cx - 0.25 * Eref); x <= cx + 0.25 * Eref; x++) {
      if (x >= 0 && x < W && label[at(x, y)] === fid && lum[at(x, y)] > 0.62 * skinLum) cnt++;
    }
    if (cnt > 0.3 * Eref) { skinTop = y; break; }
  }
  var foreheadH = (eyeMidY - skinTop) / Eref;
  // head cut by the photo edge: the crown is unknown, assume hair
  var bald = foreheadH > 1.4 && skinTop > 0;
  var hairMask = new Uint8Array(N), hairCount = 0, hairPx = [], hairRows = new Int32Array(H), borderHits = 0, borderTot = 0;
  var hairRgb = null, hairLab = null, seedPx = [];
  // The seed sits on the hairline: the first row above the bright crown
  // whose centre is mostly NOT the face colour (dark brown hair passes the
  // chroma test, a shaded forehead fails it — the Lab distance to the
  // cheeks decides instead).
  var faceLab = rgb2lab(st.rgb[0], st.rgb[1], st.rgb[2]), seedTop = skinTop;
  for (y = skinTop - 1; y >= Math.max(0, Math.round(skinTop - 0.7 * Eref)); y--) {
    var far = 0, ncol = 0;
    for (x = Math.round(cx - 0.3 * Eref); x <= cx + 0.3 * Eref; x++) { if (x < 0 || x >= W) continue; ncol++; if (dLab(at(x, y), faceLab) > 26) far++; }
    if (ncol && far > 0.5 * ncol) { seedTop = y + 1; break; }
  }
  for (y = Math.max(0, seedTop - 6); y < seedTop - 1; y++) for (x = Math.round(cx - 0.4 * Eref); x <= cx + 0.4 * Eref; x++) {
    if (x < 0 || x >= W) continue; i = at(x, y); if (dLab(i, faceLab) <= 26) continue; seedPx.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]);
  }
  if (!bald && seedPx.length >= 8) {
    var seedRgb = medianRgb(seedPx); hairLab = rgb2lab(seedRgb[0], seedRgb[1], seedRgb[2]);
    hairRgb = seedRgb;
    // corners the same colour as the hair are most likely hair (big
    // hairdo filling a corner): they don't count as background here
    var hairBgLabs = bgLabs.filter(function (l2) { return labDist(hairLab, l2) >= 20; });
    var hairIsBg = hairBgLabs.length === 0;
    var isHairBg = function (idx) { for (var k = 0; k < hairBgLabs.length; k++) if (dLab(idx, hairBgLabs[k]) < 14) return true; return false; };
    var q = new Int32Array(N), qh = 0, qt = 0;
    for (y = Math.max(0, seedTop - 6); y < seedTop - 1; y++) for (x = Math.round(cx - 0.4 * Eref); x <= cx + 0.4 * Eref; x++) {
      if (x < 0 || x >= W) continue; i = at(x, y); if (hairMask[i] || dLab(i, faceLab) <= 18 || dLab(i, hairLab) > 18) continue;
      hairMask[i] = 1; q[qt++] = i;
    }
    while (qh < qt) {
      var pp = q[qh++], ppx = pp % W, ppy = (pp - ppx) / W;
      hairCount++; hairRows[ppy]++; hairPx.push(D[pp * 4], D[pp * 4 + 1], D[pp * 4 + 2]);
      if (ppx === hz.x0 || ppx === hz.x1 || ppy === hz.y0 || ppy === hz.y1) borderHits++;
      var nb = [pp - 1, pp + 1, pp - W, pp + W];
      for (var n2 = 0; n2 < 4; n2++) {
        var qq = nb[n2]; if (qq < 0 || qq >= N) continue;
        var qx = qq % W, qy = (qq - qx) / W;
        if (qx < hz.x0 || qx > hz.x1 || qy < hz.y0 || qy > hz.y1 || Math.abs(qx - ppx) > 1) continue;
        if (hairMask[qq] || dLab(qq, faceLab) <= 18 || dLab(qq, hairLab) > 22) continue;
        if (isHairBg(qq)) continue;
        hairMask[qq] = 1; q[qt++] = qq;
      }
    }
    borderTot = 2 * (hz.x1 - hz.x0) + 2 * (hz.y1 - hz.y0);
    if (hairPx.length >= 30) hairRgb = medianRgb(hairPx);
    // hair the same colour as the background: keep the colour, forget the
    // shape (the flood is the wall) → short
    if (hairIsBg || (borderTot && borderHits / borderTot > 0.45)) { hairMask = new Uint8Array(N); hairCount = 0; }
  }
  var capCnt = 0, capTot = 0, sideCnt = 0, sideTot = 0, lowCnt = 0, lowTot = 0, hairTop = top;
  if (!bald) {
    for (y = hz.y0; y <= hz.y1; y++) for (x = hz.x0; x <= hz.x1; x++) {
      i = at(x, y);
      if (x >= left && x <= right && y < top && y >= top - 0.4 * fh) { capTot++; if (hairMask[i]) capCnt++; }
      if ((x < left || x > right) && y >= top + 0.35 * fh && y <= top + 0.7 * fh) { sideTot++; if (hairMask[i]) sideCnt++; }
      if ((x < left + 0.1 * fw || x > right - 0.1 * fw) && y > bottom && y <= bottom + 0.4 * fh) { lowTot++; if (hairMask[i]) lowCnt++; }
    }
    for (y = hz.y0; y < top; y++) if (hairRows[y] > 0.3 * fw) { hairTop = y; break; }
  }
  var capFrac = capTot ? capCnt / capTot : 0, sideFrac = sideTot ? sideCnt / sideTot : 0, lowFrac = lowTot ? lowCnt / lowTot : 0;
  var hairc = hairRgb ? nearestLab(rgb2lab(hairRgb[0], hairRgb[1], hairRgb[2]), P_HAIR_LAB) : { index: 1, dist: 0 };
  var hairHsl = hairRgb ? rgb2hsl(hairRgb[0], hairRgb[1], hairRgb[2]) : [0, 0, 0];
  var hat = 0, hair;
  var length = lowFrac > 0.3 ? 'long' : (sideFrac > 0.3 ? 'mid' : 'short');
  var volume = !bald && capFrac > 0.6 && sideFrac > 0.5 && hairTop < seedTop - 0.9 * Eref && lowFrac < 0.2;
  // a saturated non-hair colour on top of the head is most likely a cap
  if (!bald && hairHsl[1] > 0.45 && hairHsl[2] > 0.2 && (hairHsl[0] < 8 || hairHsl[0] > 50)) { hat = 1; length = 'short'; volume = false; }
  if (sex === 0) hair = bald ? 0 : (volume ? 10 : (length === 'short' ? 1 : 18));
  else hair = bald ? 12 : (volume ? 23 : (length === 'long' ? 8 : (length === 'mid' ? 5 : 12)));
  if (hat) hair = sex === 0 ? 1 : 12;

  // 6. glasses: dark frame pixels in the eye band and a dark nose bridge
  var glasses = 0;
  var eyeY = (eL && eR) ? Math.round((eL.y + eR.y) / 2) : Math.round(top + 0.4 * fh);
  if (sunglasses) glasses = 5;
  else if (eyesOk) {
    var bx0 = Math.round(eL.x + 0.25 * E), bx1 = Math.round(eR.x - 0.25 * E), bridge = 0, frame = 0, ftot = 0;
    for (y = eyeY - 2; y <= eyeY + 2; y++) for (x = bx0; x <= bx1; x++) { i = at(x, y); if (lum[i] < skinLum * 0.6 && !skin[i]) bridge++; }
    var by0 = Math.round(eyeY - 0.5 * E), by1 = Math.round(eyeY + 0.5 * E);
    for (y = by0; y <= by1; y++) for (x = Math.round(left + 0.05 * fw); x <= right - 0.05 * fw; x++) {
      if (y < 0 || y >= H || !inFace(x, y)) continue;
      var dl = Math.hypot(x - eL.x, y - eL.y), dr = Math.hypot(x - eR.x, y - eR.y);
      if (dl < 0.28 * E || dr < 0.28 * E) continue; // the eyes themselves
      if (y < eyeY - 0.32 * E && (dl < 0.6 * E || dr < 0.6 * E)) continue; // eyebrows
      ftot++; i = at(x, y);
      if (lum[i] < skinLum * 0.55 && !skin[i]) frame++;
    }
    if (bridge >= 3 && ftot && frame / ftot > 0.09) glasses = 2;
  }

  // 7. mouth: reddish lip band (rows that hold >= 30% of the busiest row)
  var my0 = Math.round(top + 0.66 * fh), my1 = Math.min(H - 1, Math.round(top + 0.96 * fh));
  var mx0 = Math.round(left + 0.2 * fw), mx1 = Math.round(right - 0.2 * fw);
  var lipRow = new Int32Array(H), lipCol = new Int32Array(W), lipMask = new Uint8Array(N), lipN = 0, lipPx = [];
  for (y = my0; y <= my1; y++) for (x = mx0; x <= mx1; x++) {
    i = at(x, y); r = D[i * 4]; g = D[i * 4 + 1]; b = D[i * 4 + 2];
    if (cr[i] > st.cr + 9 && r - g > 30 && r > 70) { lipMask[i] = 1; lipRow[y]++; lipN++; }
  }
  var mouth = 2, mouthTop = Math.round(top + 0.8 * fh), mouthW = 0, lipMinX = 0, lipMaxX = -1, lipMinY = 0, lipMaxY = -1;
  var rowMaxN = 0; for (y = my0; y <= my1; y++) if (lipRow[y] > rowMaxN) rowMaxN = lipRow[y];
  if (rowMaxN >= 0.15 * (mx1 - mx0)) {
    // densest run of rows
    var runs = [], cur = null;
    for (y = my0; y <= my1; y++) {
      if (lipRow[y] >= 0.3 * rowMaxN) { if (!cur) cur = { y0: y, y1: y, n: 0 }; cur.y1 = y; cur.n += lipRow[y]; }
      else if (cur) { runs.push(cur); cur = null; }
    }
    if (cur) runs.push(cur);
    runs.sort(function (a, b2) { return b2.n - a.n; });
    var run = runs[0];
    lipMinY = run.y0; lipMaxY = run.y1;
    // an open mouth splits the lips in two runs: merge the close ones
    runs.forEach(function (rr) {
      if (rr === run) return;
      if (rr.y0 > lipMaxY && rr.y0 - lipMaxY < 0.12 * fh) lipMaxY = rr.y1;
      if (rr.y1 < lipMinY && lipMinY - rr.y1 < 0.12 * fh) lipMinY = rr.y0;
    });
    for (y = lipMinY; y <= lipMaxY; y++) for (x = mx0; x <= mx1; x++) if (lipMask[at(x, y)]) lipCol[x]++;
    var cols = []; for (x = mx0; x <= mx1; x++) if (lipCol[x] >= 2) cols.push(x);
    if (cols.length >= 3) {
      lipMinX = cols[0]; lipMaxX = cols[cols.length - 1];
      mouthW = lipMaxX - lipMinX + 1; var mouthH = lipMaxY - lipMinY + 1; mouthTop = lipMinY;
      var dark = 0, teeth = 0, tot = 0, yc = [], yk = [];
      for (y = Math.max(0, Math.round(lipMinY - 0.07 * fh)); y <= lipMaxY; y++) for (x = lipMinX; x <= lipMaxX; x++) {
        i = at(x, y); tot++;
        if (lum[i] < skinLum * 0.45) dark++;
        if (lum[i] > skinLum * 1.15 && lum[i] > 150 && Math.abs(D[i * 4] - D[i * 4 + 1]) < 28 && Math.abs(D[i * 4 + 1] - D[i * 4 + 2]) < 28) teeth++;
        if (lipMask[i]) {
          lipPx.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]);
          var t = (x - lipMinX) / Math.max(1, mouthW - 1);
          if (t < 0.2 || t > 0.8) yc.push(y); else if (t > 0.4 && t < 0.6) yk.push(y);
        }
      }
      var curve = (yc.length && yk.length) ? (median(yk) - median(yc)) / fh : 0;
      var ratio = mouthW / fw;
      if (teeth / tot > 0.15 && dark / tot > 0.15) mouth = 6;
      else if (teeth / tot > 0.12) mouth = 1;
      else if (dark / tot > 0.28) mouth = (mouthH / mouthW > 0.5) ? 7 : 6;
      else if (curve < -0.025) mouth = 8;
      else if (ratio > 0.46 || (curve > 0.03 && ratio > 0.28)) mouth = 0;
      else if (mouthH / mouthW > 0.6) mouth = 5;
      else mouth = 2;
      if (sex === 1 && lipPx.length) {
        var lr = medianRgb(lipPx), lh = rgb2hsl(lr[0], lr[1], lr[2]);
        if (lh[1] > 0.6 && lr[0] > 130 && labDist(rgb2lab(lr[0], lr[1], lr[2]), rgb2lab(st.rgb[0], st.rgb[1], st.rgb[2])) > 28 && mouth !== 6 && mouth !== 1) mouth = 3;
      }
    }
  }

  // 8. beard (masculine): dark hair-like mass under the chin, narrower than
  // a shirt would be; moustache right above the lip
  var beard = 0;
  if (sex === 0) {
    var bz0 = Math.round(top + 0.8 * fh), bz1 = Math.min(H - 1, Math.round(bottom + 0.15 * fh));
    var dcnt = 0, dtot = 0, flankD = 0, flankT = 0, bpx = [];
    for (y = bz0; y <= bz1; y++) {
      for (x = Math.round(left + 0.12 * fw); x <= right - 0.12 * fw; x++) {
        if (lipMaxY >= 0 && y >= lipMinY - 0.02 * fh && y <= lipMaxY + 0.02 * fh && x >= lipMinX - 2 && x <= lipMaxX + 2) continue;
        dtot++; i = at(x, y);
        if (lum[i] < skinLum * 0.62 && !skin[i]) { dcnt++; bpx.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]); }
      }
      for (x = Math.max(0, Math.round(left - 0.5 * fw)); x < left - 0.2 * fw; x++) { flankT++; if (lum[at(x, y)] < skinLum * 0.62) flankD++; }
      for (x = Math.round(right + 0.2 * fw); x <= Math.min(W - 1, Math.round(right + 0.5 * fw)); x++) { flankT++; if (lum[at(x, y)] < skinLum * 0.62) flankD++; }
    }
    var bFrac = dtot ? dcnt / dtot : 0, fFrac = flankT ? flankD / flankT : 0;
    var mcnt = 0, mtot = 0, mz0 = Math.round(eyeMidY + 0.95 * Eref), mz1 = Math.min(lipMaxY >= 0 ? lipMinY - 1 : H - 1, Math.round(eyeMidY + 1.4 * Eref));
    for (y = mz0; y <= mz1; y++) for (x = Math.round(cx - 0.4 * Eref); x <= cx + 0.4 * Eref; x++) {
      if (y < 0 || y >= H || x < 0 || x >= W) continue; i = at(x, y); if (lipMask[i]) continue;
      mtot++; if (lum[i] < skinLum * 0.75 && !skin[i]) mcnt++;
    }
    var mFrac = mtot ? mcnt / mtot : 0;
    // reference colour: the hair, or the eyebrows when bald
    var refRgb = hairRgb, bpx2 = [];
    if (!refRgb && eyesOk) {
      for (y = Math.round(eyeMidY - 0.5 * E); y < eyeMidY - 0.25 * E; y++) for (x = Math.round(eL.x - 0.3 * E); x <= eR.x + 0.3 * E; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue; i = at(x, y);
        if (lum[i] < skinLum * 0.62 && !skin[i]) bpx2.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]);
      }
      if (bpx2.length >= 15) refRgb = medianRgb(bpx2);
    }
    var hairLike = true;
    if (bpx.length >= 30 && refRgb) hairLike = labDist(rgb2lab.apply(null, medianRgb(bpx)), rgb2lab(refRgb[0], refRgb[1], refRgb[2])) < 28;
    if (bFrac > 0.28 && fFrac < bFrac * 0.7 && hairLike) beard = (bFrac > 0.5) ? (mFrac > 0.35 ? 4 : 3) : 3;
    else if (mFrac > 0.3) beard = 1;
  }

  // 9. background → nearest pastel (neutral corners → white)
  var bgc = bgs[0], bhs = rgb2hsl(bgc[0], bgc[1], bgc[2]);
  var bg = (bhs[1] < 0.12 || bhs[2] < 0.25) ? 7
    : nearestLab(rgb2lab(bgc[0] * 0.35 + 255 * 0.65, bgc[1] * 0.35 + 255 * 0.65, bgc[2] * 0.35 + 255 * 0.65), P_BG_LAB).index;

  var recipe = {
    face: face, skin: nearestLab(rgb2lab(st.rgb[0], st.rgb[1], st.rgb[2]), P_SKIN_LAB).index, hair: hair, hairc: hairc.index,
    eyes: eyes, eyec: eyec, glasses: glasses, mouth: mouth, beard: beard, hat: hat, bg: bg
  };
  return {
    recipe: recipe,
    debug: { box: [left, top, fw, fh], eyes: [eL, eR], eyesOk: eyesOk, mouth: [lipMinX, lipMinY, lipMaxX, lipMaxY],
             hair: { capFrac: capFrac, sideFrac: sideFrac, lowFrac: lowFrac, top: hairTop, rgb: hairRgb, count: hairCount, border: borderTot ? borderHits / borderTot : 0, forehead: foreheadH, skinTop: skinTop },
             skinLum: skinLum, skinRgb: st.rgb, bgs: bgs, aspect: aspect, jaw: jaw, mouthW: mouthW }
  };
}

// Browser entry point: draws any CanvasImageSource (Image, ImageBitmap,
// canvas, video frame) on a small canvas and analyses it.
function avPhotoRecipe(src, w, h, opts) {
  var scale = Math.min(1, AV_PHOTO_MAXW / Math.max(w, h));
  var cw = Math.max(16, Math.round(w * scale)), ch = Math.max(16, Math.round(h * scale));
  var cv = document.createElement('canvas');
  cv.width = cw; cv.height = ch;
  var ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(src, 0, 0, cw, ch);
  return avPhotoAnalyze(ctx.getImageData(0, 0, cw, ch), opts);
}

export { avPhotoAnalyze, avPhotoRecipe, AV_PHOTO_MAXW };
for (const [k, v] of Object.entries({ avPhotoAnalyze, avPhotoRecipe }))
  window['_' + k] = v;
