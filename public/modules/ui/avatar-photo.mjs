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

// (400: the framing panel's own frame size — texture tells hair strands
// from a wall, which a 220 px downscale blurred away; ~0.1 s on a phone)
const AV_PHOTO_MAXW = 400;

// Palettes mirrored from avatar-vector.mjs (base colours, same order) —
// kept local so the analysis stays a leaf module.
const P_SKIN = ['#fff0e3', '#f7c9a2', '#eeb987', '#d99d6c', '#b87a4b', '#8d5a35', '#75482a']; // = AV_SKIN bases (seven tones since web.207)
// what each AV_HAIRC swatch looks like as the MEDIAN of real hair pixels
// (a photo of blonde hair is far less saturated than the drawn swatch):
// black, dark brown, brown, auburn, golden blonde, grey, light blonde,
// white, light brown, light red, blue, pink
const P_HAIR = ['#221c18', '#503828', '#7a5535', '#96452a', '#c09a60', '#9a9a9a', '#dcc8a0', '#e6e6e6', '#9e7a52', '#c8784a', '#3c6ed0', '#e08ac0'];
const P_BG = ['#b9dfbe', '#b7cff0', '#f2bcc0', '#d3c1ef', '#d2d6dc', '#b0ded8', '#efcfa9', '#ffffff', '#e9edf2', '#f8eac0', '#cae0f4'];
const P_OUTFITC = ['#c0392b', '#2d6aa3', '#2e8b57', '#e6b422', '#8e44ad', '#1f1f24', '#f2f2f2', '#e07aa0'];

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
var P_OUTFITC_LAB = P_OUTFITC.map(function (h) { return rgb2lab.apply(null, hex2rgb(h)); });
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
// img: { width, height, data: Uint8ClampedArray RGBA }
// opts: { sex: 0|1, guide?: { cx, cy, rx, ry } } — the guide is the face
// oval the player aligned with (fractions of the image size): the face box
// then comes from it instead of the skin-blob search, which is the fragile
// step on a free photo.
// returns { recipe, debug } or null when no face is found
function avPhotoAnalyze(img, opts) {
  opts = opts || {};
  var sex = opts.sex === 1 ? 1 : 0;
  var guide = opts.guide && opts.guide.rx > 0 ? opts.guide : null;
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
  // (a panned photo leaves a plain fill around it: the corners are taken
  // inside the part of the frame the photo covers — guide.valid)
  var vX0 = 0, vY0 = 0, vX1 = W, vY1 = H;
  if (opts.guide && opts.guide.valid) { vX0 = Math.max(0, Math.round(opts.guide.valid[0] * W)); vY0 = Math.max(0, Math.round(opts.guide.valid[1] * H)); vX1 = Math.min(W, Math.round(opts.guide.valid[2] * W)); vY1 = Math.min(H, Math.round(opts.guide.valid[3] * H)); }
  if (vX1 - vX0 < 2 * cs || vY1 - vY0 < 2 * cs) { vX0 = 0; vY0 = 0; vX1 = W; vY1 = H; }
  [[vX0, vY0], [vX1 - cs, vY0], [vX0, vY1 - cs], [vX1 - cs, vY1 - cs]].forEach(function (c) {
    var px = [];
    for (y = c[1]; y < c[1] + cs; y++) for (x = c[0]; x < c[0] + cs; x++) { i = at(x, y); px.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]); }
    bgs.push(medianRgb(px));
  });
  var bgLabs = bgs.map(function (c) { return rgb2lab(c[0], c[1], c[2]); });
  var isBg = function (idx, tol, topOnly) { // topOnly: the bottom corners are often the clothes
    for (var k = 0; k < (topOnly ? 2 : bgLabs.length); k++) if (dLab(idx, bgLabs[k]) < (tol || 22)) return true;
    return false;
  };
  // Guided: the middle of the oval (nose and cheeks, between the eye line
  // and the mouth) IS skin by construction — its median colour extends the
  // fixed YCbCr rule to this photo's own skin under this photo's own light
  // (a colour cast, a flushed or a very dark face fall outside the fixed
  // bounds). Union with the rule: it only adds pixels.
  var skinSeed = null;
  if (guide) {
    var gcx0 = guide.cx * W, gcy0 = guide.cy * H, grx0 = guide.rx * W, gry0 = guide.ry * H, seedPx0 = [];
    for (y = Math.round(gcy0 - 0.1 * gry0); y <= gcy0 + 0.3 * gry0; y += 2) for (x = Math.round(gcx0 - 0.3 * grx0); x <= gcx0 + 0.3 * grx0; x += 2) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue; i = at(x, y); seedPx0.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]);
    }
    if (seedPx0.length >= 60) {
      var sm = medianRgb(seedPx0); skinSeed = rgb2lab(sm[0], sm[1], sm[2]);
      for (i = 0; i < N; i++) if (!skin[i] && lum[i] > 25 && dLab(i, skinSeed) < 16) skin[i] = 1;
    }
  }
  // a skin-coloured wall must not become the face
  for (i = 0; i < N; i++) if (skin[i] && isBg(i, 16)) skin[i] = 0;

  // 1. skin blobs (4-connected) → the most face-like one. With a guide,
  // the blob that overlaps the template oval most (a skin-coloured wall
  // inside the oval is a different blob and stays out).
  var label = new Int32Array(N), comps = [], stack = new Int32Array(N);
  var gcx = 0, gcy = 0, grx = 0, gry = 0;
  if (guide) { gcx = guide.cx * W; gcy = guide.cy * H; grx = guide.rx * W; gry = guide.ry * H; }
  for (i = 0; i < N; i++) {
    if (!skin[i] || label[i]) continue;
    var id = comps.length + 1, sp = 0, area = 0, sx = 0, sy = 0, minx = W, maxx = 0, miny = H, maxy = 0, inOval = 0;
    stack[sp++] = i; label[i] = id;
    while (sp) {
      var p = stack[--sp]; area++;
      var px = p % W, py = (p - px) / W;
      sx += px; sy += py;
      if (guide) { var gex = (px - gcx) / grx, gey = (py - gcy) / gry; if (gex * gex + gey * gey <= 1) inOval++; }
      if (px < minx) minx = px; if (px > maxx) maxx = px; if (py < miny) miny = py; if (py > maxy) maxy = py;
      if (px > 0 && skin[p - 1] && !label[p - 1]) { label[p - 1] = id; stack[sp++] = p - 1; }
      if (px < W - 1 && skin[p + 1] && !label[p + 1]) { label[p + 1] = id; stack[sp++] = p + 1; }
      if (py > 0 && skin[p - W] && !label[p - W]) { label[p - W] = id; stack[sp++] = p - W; }
      if (py < H - 1 && skin[p + W] && !label[p + W]) { label[p + W] = id; stack[sp++] = p + W; }
    }
    comps.push({ id: id, area: area, cx: sx / area, cy: sy / area, minx: minx, maxx: maxx, miny: miny, maxy: maxy, inOval: inOval });
  }
  if (!comps.length) return null;
  var best = null, bestScore = 0;
  comps.forEach(function (c) {
    if (guide) { if (c.inOval > bestScore) { bestScore = c.inOval; best = c; } return; }
    if (c.area < 0.015 * N) return;
    var dx = (c.cx - W / 2) / W, dy = (c.cy - H / 2) / H;
    var bw = c.maxx - c.minx + 1, bh = c.maxy - c.miny + 1, asp = bh / bw;
    var fill = c.area / (bw * bh);            // a face fills ~60-80% of its box
    var score = c.area * (1 - 0.6 * Math.sqrt(dx * dx + dy * dy));
    if (asp < 0.6 || asp > 2.2) score *= 0.4;
    if (fill < 0.35) score *= 0.5;
    if (score > bestScore) { bestScore = score; best = c; }
  });
  if (!best || (guide && best.inOval < 0.12 * Math.PI * grx * gry)) return null; // nobody in the oval
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
  // Bottom: the LAST row still reasonably wide, not the first dip — the
  // eye band (brows, lids, shadows) can dip below half the cheek width on
  // a bearded face and used to cut the box at the forehead. The height is
  // capped below anyway, and the pupils rebuild the box when found.
  var bottom = best.maxy;
  for (y = best.maxy; y > yMax; y--) if (rowW[y] >= 0.3 * maxW) { bottom = y; break; }
  var left = W, right = 0;
  for (y = top; y <= bottom; y++) if (rowW[y] > 0.4 * maxW) { if (rowMin[y] < left) left = rowMin[y]; if (rowMax[y] > right) right = rowMax[y]; }
  if (guide) { // the oval IS the face box (hairline to chin, temple to temple)
    left = Math.max(0, Math.round(gcx - grx)); right = Math.min(W - 1, Math.round(gcx + grx));
    top = Math.max(0, Math.round(gcy - gry)); bottom = Math.min(H - 1, Math.round(gcy + gry));
  }
  var fw = right - left + 1, fh = bottom - top + 1;
  if (fw < 12 || fh < 12) return null;
  if (fh > 1.6 * fw) { fh = Math.round(1.6 * fw); bottom = top + fh - 1; } // neck / chest cut
  var cx = (left + right) / 2;

  // skin statistics (cheeks)
  // Skin statistics: the tone comes from the BRIGHTER skin pixels of the
  // zones — a photo always carries side shadows and stubble, while the
  // cartoon palette is a lit-skin ramp.
  var skinStats = function (zones) {
    var pts = [], crs = [];
    zones.forEach(function (z) {
      for (y = Math.max(0, Math.round(z[1])); y < Math.min(H, z[3]); y++) for (x = Math.max(0, Math.round(z[0])); x < Math.min(W, z[2]); x++) {
        i = at(x, y); if (label[i] !== fid) continue;
        pts.push([lum[i], D[i * 4], D[i * 4 + 1], D[i * 4 + 2]]); crs.push(cr[i]);
      }
    });
    if (pts.length < 20) return null;
    pts.sort(function (a, b2) { return b2[0] - a[0]; }); // brightest first
    var pick = function (frac) {
      var n = Math.max(5, Math.round(pts.length * frac)), px = [];
      for (var k = 0; k < n; k++) px.push(pts[k][1], pts[k][2], pts[k][3]);
      return medianRgb(px);
    };
    var lit = pick(0.5);
    return { lum: 0.299 * lit[0] + 0.587 * lit[1] + 0.114 * lit[2], rgb: pick(0.3), cr: median(crs) };
  };
  var st = skinStats([[left + 0.25 * fw, top + 0.3 * fh, right - 0.25 * fw, top + 0.7 * fh]]);
  var faceLab0 = st ? rgb2lab(st.rgb[0], st.rgb[1], st.rgb[2]) : [60, 15, 15];
  if (!st) return null;
  var skinLum = st.lum;
  var inFace = function (xx, yy) { // slightly grown face ellipse
    var ex = (xx - cx) / (fw * 0.55), ey = (yy - (top + fh * 0.5)) / (fh * 0.56);
    return ex * ex + ey * ey <= 1;
  };
  if (guide) inFace = function () { return true; };

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
  // Pupil candidates by centre-surround at the pupil scale (integral image):
  // a dark disc (pupil + iris) inside a bright ring (sclera, lids) scores
  // high; an eyebrow is dark on its sides too and scores low. The best PAIR
  // at similar height and plausible distance wins.
  var integ = new Float64Array((W + 1) * (H + 1));
  for (y = 1; y <= H; y++) { var rowS = 0; for (x = 1; x <= W; x++) { rowS += lum[at(x - 1, y - 1)]; integ[y * (W + 1) + x] = integ[(y - 1) * (W + 1) + x] + rowS; } }
  var integ2 = new Float64Array((W + 1) * (H + 1));
  for (y = 1; y <= H; y++) { var rowS2 = 0; for (x = 1; x <= W; x++) { var lv2 = lum[at(x - 1, y - 1)]; rowS2 += lv2 * lv2; integ2[y * (W + 1) + x] = integ2[(y - 1) * (W + 1) + x] + rowS2; } }
  var localStd = function (xx, yy, r) { // std of lum over (2r+1)²
    var x0 = Math.max(0, xx - r), y0 = Math.max(0, yy - r), x1 = Math.min(W, xx + r + 1), y1 = Math.min(H, yy + r + 1);
    var n = (x1 - x0) * (y1 - y0); if (n <= 1) return 0;
    var S1 = integ[y1 * (W + 1) + x1] - integ[y0 * (W + 1) + x1] - integ[y1 * (W + 1) + x0] + integ[y0 * (W + 1) + x0];
    var S2 = integ2[y1 * (W + 1) + x1] - integ2[y0 * (W + 1) + x1] - integ2[y1 * (W + 1) + x0] + integ2[y0 * (W + 1) + x0];
    var m = S1 / n, v = S2 / n - m * m; return v > 0 ? Math.sqrt(v) : 0;
  };
  var boxMean = function (x0, y0, x1, y1) { // inclusive-exclusive, clamped
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(W, x1); y1 = Math.min(H, y1);
    if (x1 <= x0 || y1 <= y0) return 0;
    var S = integ[y1 * (W + 1) + x1] - integ[y0 * (W + 1) + x1] - integ[y1 * (W + 1) + x0] + integ[y0 * (W + 1) + x0];
    return S / ((x1 - x0) * (y1 - y0));
  };
  // Multi-scale (the framed face may be smaller or bigger than the
  // template) and anti-eyebrow: a pupil is brighter on BOTH sides at its
  // own height (sclera), an eyebrow is dark on both sides.
  var eyeCands = function (x0, x1, y0, y1) {
    var list = [];
    [0.022, 0.03, 0.042].forEach(function (kk) {
      var rc = Math.max(1, Math.round(fw * kk)), rs = rc * 3, side = rc * 2.4;
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
        if (!inFace(x, y)) continue;
        var c = boxMean(x - rc, y - rc, x + rc + 1, y + rc + 1);
        if (c > skinLum * 0.85) continue;
        var lft = boxMean(Math.round(x - side - rc), y - rc, Math.round(x - side + rc + 1), y + rc + 1);
        var rgt = boxMean(Math.round(x + side - rc), y - rc, Math.round(x + side + rc + 1), y + rc + 1);
        if (Math.min(lft, rgt) - c < 12) continue;
        var big = boxMean(x - rs, y - rs, x + rs + 1, y + rs + 1);
        var sur = (big * (2 * rs + 1) * (2 * rs + 1) - c * (2 * rc + 1) * (2 * rc + 1)) / ((2 * rs + 1) * (2 * rs + 1) - (2 * rc + 1) * (2 * rc + 1));
        var sc = c - sur; // negative = dark blob in a bright surround
        if (sc > -8) continue;
        list.push({ x: x, y: y, lum: c, score: sc, r: rc });
      }
    });
    list.sort(function (a, b2) { return a.score - b2.score; });
    var keep = [], nms = fw * 0.08;
    for (var k = 0; k < list.length && keep.length < 8; k++) {
      var ok = true;
      for (var m = 0; m < keep.length; m++) if (Math.hypot(keep[m].x - list[k].x, keep[m].y - list[k].y) < nms) { ok = false; break; }
      if (ok) keep.push(list[k]);
    }
    return keep;
  };
  // (a guided face may be smaller or bigger than the template: search the
  // eyes in a wider band and let the pair distance float)
  var ey0 = Math.round(top + 0.2 * fh), ey1 = Math.round(top + 0.6 * fh), cL, cR, Eexp = 0;
  if (guide) {
    // the template says where the pupils should be (38 % down the oval —
    // hairline to eyes ≈ 1.1 E, eyes to chin ≈ 1.8 E — and 0.84 face
    // half-widths apart): look in a window around each expected spot
    Eexp = 0.84 * grx;
    var exy = gcy - 0.24 * gry, win = 0.3 * Eexp;
    cL = eyeCands(Math.round(gcx - 0.5 * Eexp - win), Math.round(gcx - 0.5 * Eexp + win), Math.round(exy - win), Math.round(exy + win));
    cR = eyeCands(Math.round(gcx + 0.5 * Eexp - win), Math.round(gcx + 0.5 * Eexp + win), Math.round(exy - win), Math.round(exy + win));
  } else {
    cL = eyeCands(Math.round(left + 0.08 * fw), Math.round(left + 0.47 * fw), ey0, ey1);
    cR = eyeCands(Math.round(left + 0.53 * fw), Math.round(right - 0.08 * fw), ey0, ey1);
  }
  // face-geometry check on a pair: skin on the nose bridge below the
  // midpoint and skin under each eye (cheeks) — hair edges, ears and
  // eyebrow pairs fail it
  var skinFrac = function (xx, yy, rr) {
    var c = 0, n = 0;
    for (var yy2 = Math.round(yy - rr); yy2 <= yy + rr; yy2++) for (var xx2 = Math.round(xx - rr); xx2 <= xx + rr; xx2++) {
      if (xx2 < 0 || yy2 < 0 || xx2 >= W || yy2 >= H) continue;
      n++; if (skin[at(xx2, yy2)]) c++;
    }
    return n ? c / n : 0;
  };
  var pairOk = function (a, b2, d) {
    var mx2 = (a.x + b2.x) / 2, my2 = (a.y + b2.y) / 2;
    if (skinFrac(mx2, my2 + 0.5 * d, 0.1 * d) < 0.5) return false;
    if (skinFrac(a.x, a.y + 0.4 * d, 0.08 * d) < 0.35 || skinFrac(b2.x, b2.y + 0.4 * d, 0.08 * d) < 0.35) return false;
    // an eye has skin on BOTH sides at its own height (temple and nose);
    // a hair edge at the temple has the background on its outer side
    var sideOk = function (e) { return skinFrac(e.x - 0.3 * d, e.y, 0.06 * d) >= 0.3 && skinFrac(e.x + 0.3 * d, e.y, 0.06 * d) >= 0.3; };
    return sideOk(a) && sideOk(b2);
  };
  var eL = cL[0] || null, eR = cR[0] || null, pairs = [];
  cL.forEach(function (a) { cR.forEach(function (b2) {
    var dist = Math.hypot(b2.x - a.x, b2.y - a.y);
    if (dist < (guide ? 0.55 * Eexp : 0.28 * fw) || dist > (guide ? 1.8 * Eexp : 0.6 * fw) || Math.abs(b2.y - a.y) > 0.08 * fw) return;
    if (!pairOk(a, b2, dist)) return;
    // level pair, darkest blobs (pupils beat the inner-corner shadows),
    // loose distance prior (the skin box width is only a hint)
    // guided: the template also says where each pupil should be
    var posPen = guide ? (Math.abs(a.x - (gcx - 0.5 * Eexp)) + Math.abs(b2.x - (gcx + 0.5 * Eexp))) * 0.4 : 0;
    pairs.push({ a: a, b: b2, d: dist, sc: a.score + b2.score + Math.abs(b2.y - a.y) * 3 + (a.lum + b2.lum) * 0.3 + Math.abs(dist - (guide ? Eexp : 0.42 * fw)) * (guide ? 0.8 : 0.8) + posPen });
  }); });
  pairs.sort(function (p1, p2) { return p1.sc - p2.sc; });
  if (pairs.length) {
    var bp = pairs[0];
    // eyebrows also come as a dark pair at the right distance, right ABOVE
    // the eyes: when a comparable pair sits just below, it is the eyes
    for (var pk = 1; pk < pairs.length; pk++) {
      var pp2 = pairs[pk], dy = (pp2.a.y + pp2.b.y) / 2 - (bp.a.y + bp.b.y) / 2, dxm = Math.abs((pp2.a.x + pp2.b.x) / 2 - (bp.a.x + bp.b.x) / 2);
      if (dy > 0.12 * bp.d && dy < 0.45 * bp.d && dxm < 0.15 * bp.d && pp2.sc < bp.sc + 14) { bp = pp2; break; }
    }
    eL = bp.a; eR = bp.b;
  }
  var isOpen = function (e) { return !!e && e.lum < skinLum - 28 && e.score < -16; };
  var openL = isOpen(eL), openR = isOpen(eR);
  // sunglasses: both eye zones uniformly dark
  // sunglasses: a lens is uniformly dark — a deep-set eye in shadow is dark
  // too but keeps the bright sclera
  var zoneDark = function (e) {
    if (!e) return 0;
    var rz = Math.round(fw * 0.11), c = 0, n = 0, bright = 0;
    for (var dy = -rz; dy <= rz; dy++) for (var dx = -rz; dx <= rz; dx++) {
      var xa = e.x + dx, ya = e.y + dy;
      if (xa < 0 || ya < 0 || xa >= W || ya >= H) continue;
      n++; var lv = lum[at(xa, ya)]; if (lv < 55) c++; if (lv > skinLum * 0.85) bright++;
    }
    return n && bright / n < 0.04 ? c / n : 0;
  };
  var sunglasses = zoneDark(eL) > 0.55 && zoneDark(eR) > 0.55;

  // pupils found on both sides → rebuild the box from the pupil distance
  // (hairline ≈ 1.1 E above, chin ≈ 1.75 E below, width ≈ 2.2 E)
  var E = (eL && eR) ? Math.hypot(eR.x - eL.x, eR.y - eL.y) : 0;
  var eyesOk = E > 0.3 * fw && E > 6 && Math.abs(eR.y - eL.y) < 0.25 * E && (openL || openR || sunglasses);
  if (guide) {
    // Guided: the GEOMETRY is the template's (the player aligned with it),
    // the pupils only refine the eye centres for the eye attributes. A
    // pupil missing from its window falls back to the template spot, and
    // the eyes are then taken as open (the player looks at the camera).
    eyesOk = true;
    var exL = { x: Math.round(gcx - 0.5 * Eexp), y: Math.round(gcy - 0.24 * gry), lum: skinLum, score: 0 };
    var exR = { x: Math.round(gcx + 0.5 * Eexp), y: exL.y, lum: skinLum, score: 0 };
    var okL = eL && Math.abs(eL.x - exL.x) <= 0.3 * Eexp && Math.abs(eL.y - exL.y) <= 0.3 * Eexp;
    var okR = eR && Math.abs(eR.x - exR.x) <= 0.3 * Eexp && Math.abs(eR.y - exR.y) <= 0.3 * Eexp;
    // both pupils found, level and at a plausible distance → they refine
    // the geometry within bounds (a face a bit smaller or bigger than the
    // template); otherwise the template's geometry stands
    var refine = okL && okR && Math.abs(eL.y - eR.y) < 0.15 * Eexp && E >= 0.7 * Eexp && E <= 1.35 * Eexp;
    if (!refine) E = Eexp;
    if (!okL) { eL = exL; openL = true; }
    if (!okR) { eR = exR; openR = true; }
    if (!okL && !okR) { openL = openR = true; }
    st = skinStats([[left, top, right + 1, bottom + 1]]) || st;
    skinLum = st.lum;
  } else if (eyesOk) {
    var mx = (eL.x + eR.x) / 2, my = (eL.y + eR.y) / 2;
    left = Math.max(0, Math.round(mx - 1.1 * E)); right = Math.min(W - 1, Math.round(mx + 1.1 * E));
    top = Math.max(0, Math.round(my - 1.1 * E)); bottom = Math.min(H - 1, Math.round(my + 1.75 * E));
    fw = right - left + 1; fh = bottom - top + 1; cx = (left + right) / 2;
    // whole rebuilt box: the brightest skin pixels are the lit cheeks and
    // forehead whatever the exact box, beard and eyes never are
    st = skinStats([[left, top, right + 1, bottom + 1]]) || st;
    skinLum = st.lum;
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
  // Guided: the player fitted the face HEIGHT to the oval, so its height
  // says nothing — the WIDTH does: a round face is wider than the template
  // oval at cheek level, a long face narrower; a square face keeps its
  // width down at the jaw. Skin extent per row, inside the oval's reach.
  var faceDbg = '';
  if (guide) {
    var extent = function (yy) { // skin extent of the face blob on row yy, within ±1.4 rx of the centre
      if (yy < 0 || yy >= H) return 0;
      var xa = Math.max(0, Math.round(gcx - 1.4 * grx)), xb = Math.min(W - 1, Math.round(gcx + 1.4 * grx)), l = -1, rgt = -1;
      for (var xx = xa; xx <= xb; xx++) if (label[at(xx, yy)] === fid) { if (l < 0) l = xx; rgt = xx; }
      return l < 0 ? 0 : rgt - l + 1;
    };
    var ovalW = function (yy) { var t = (yy - gcy) / gry; return t * t >= 1 ? 1 : 2 * grx * Math.sqrt(1 - t * t); };
    var wr = [], cw = 0;
    for (y = Math.round(eyeMid0 + 0.3 * E0); y <= eyeMid0 + 0.9 * E0; y += 2) { var ex = extent(y); if (ex > cw) cw = ex; wr.push(ex / ovalW(y)); }
    wr.sort(function (p, q) { return p - q; });
    var widthRatio = wr.length ? wr[wr.length >> 1] : 0;
    var jr = [];
    for (y = Math.round(eyeMid0 + 1.45 * E0); y <= eyeMid0 + 1.65 * E0; y += 2) jr.push(extent(y));
    jr.sort(function (p, q) { return p - q; });
    var jawRatio = (cw && jr.length) ? jr[jr.length >> 1] / cw : 0;
    // (square needs the cheeks in view too: hair over them narrows the
    // cheeks and would make any jaw look wide)
    if (widthRatio > 0) face = widthRatio >= 1.04 ? 1 : ((jawRatio >= 0.8 && widthRatio >= 0.9) ? 2 : (widthRatio < 0.8 ? 3 : 0)); // (3: the long shape, 2.1.9-web.197)
    faceDbg = 'w=' + widthRatio.toFixed(2) + ' jaw=' + jawRatio.toFixed(2);
  }

  // clothes under the chin (outfit guess, and a guard for the hair flood)
  var clothRgb = null, oy0 = Math.round(bottom + 0.3 * fh), oy1 = Math.min(H - 1, Math.round(bottom + 0.7 * fh));
  if (oy0 < H - 4) {
    var opx = [];
    for (y = oy0; y <= oy1; y++) for (x = Math.round(cx - 0.3 * fw); x <= cx + 0.3 * fw; x++) { if (x < 0 || x >= W) continue; i = at(x, y); if (skin[i]) continue; opx.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]); }
    if (opx.length >= 30) clothRgb = medianRgb(opx);
  }

  // 5. hair. Bald = the skin blob climbs far above the eyes (crown visible):
  // hairline ≈ 1.0-1.2 E above the pupils, a bald crown ≈ 1.5-2 E. Then the
  // hair colour comes from just above the skin top, and a flood fill through
  // similar colours (not the background) gives length and volume.
  var hz = { x0: Math.max(0, Math.round(left - 0.5 * fw)), x1: Math.min(W - 1, Math.round(right + 0.5 * fw)),
             y0: Math.max(0, Math.round(top - 0.8 * fh)), y1: Math.min(H - 1, Math.round(bottom + 0.4 * fh)) };
  var skinTop = top, eyeMidY = eyesOk ? (eL.y + eR.y) / 2 : top + 0.42 * fh, Eref = eyesOk ? E : 0.42 * fw;
  // (light brown hair passes the skin chroma test AND the brightness test in
  // sunlight: the crown must be the FACE colour — Lab distance to the lit
  // cheeks — before it counts as skin)
  var faceLab = rgb2lab(st.rgb[0], st.rgb[1], st.rgb[2]);
  var isFaceCol = function (idx) { return label[idx] === fid && dLab(idx, faceLab) < 24; };
  var scanTop = Math.max(0, Math.round(eyeMidY - 2.4 * Eref));
  for (y = scanTop; y < eyeMidY; y++) {
    var cnt = 0;
    for (x = Math.round(cx - 0.25 * Eref); x <= cx + 0.25 * Eref; x++) {
      if (x >= 0 && x < W && isFaceCol(at(x, y))) cnt++;
    }
    if (cnt > 0.3 * Eref) { skinTop = y; break; }
  }
  var foreheadH = (eyeMidY - skinTop) / Eref;
  // head cut by the photo edge: the crown is unknown, assume hair
  var bald = foreheadH >= 1.35 && skinTop > 0;
  var hairMask = new Uint8Array(N), hairCount = 0, hairPx = [], hairRows = new Int32Array(H), borderHits = 0, borderTot = 0;
  var hairRgb = null, hairLab = null, seedPx = [];
  // The seed sits on the hairline: the first row above the bright crown
  // whose centre is mostly NOT the face colour (dark brown hair passes the
  // chroma test, a shaded forehead fails it — the Lab distance to the
  // cheeks decides instead).
  var seedTop = skinTop;
  for (y = skinTop - 1; y >= Math.max(0, Math.round(skinTop - 0.7 * Eref)); y--) {
    var far = 0, ncol = 0;
    for (x = Math.round(cx - 0.3 * Eref); x <= cx + 0.3 * Eref; x++) { if (x < 0 || x >= W) continue; ncol++; if (dLab(at(x, y), faceLab) > 26) far++; }
    if (ncol && far > 0.5 * ncol) { seedTop = y + 1; break; }
  }
  // Seed band: among the 3-row bands above the hairline, the one whose
  // colour differs MOST from the face — the hair, not the fringe shadow.
  var seedY0 = seedTop - 3, seedBest = -1;
  for (var kb = 3; kb <= 15; kb += 2) {
    var bandPx = [];
    for (y = Math.max(0, seedTop - kb - 2); y < seedTop - kb + 1; y++) for (x = Math.round(cx - 0.4 * Eref); x <= cx + 0.4 * Eref; x++) {
      if (x < 0 || x >= W || y < 0) continue; i = at(x, y); if (dLab(i, faceLab) <= 20) continue; bandPx.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]);
    }
    if (bandPx.length < 8) continue;
    var bm = medianRgb(bandPx), bd = labDist(rgb2lab(bm[0], bm[1], bm[2]), faceLab);
    if (bd > seedBest) { seedBest = bd; seedY0 = seedTop - kb; seedPx = bandPx; }
  }
  if (!guide && !bald && seedPx.length >= 8) {
    var seedRgb = medianRgb(seedPx); hairLab = rgb2lab(seedRgb[0], seedRgb[1], seedRgb[2]);
    hairRgb = seedRgb;
    // corners the same colour as the hair are most likely hair (big
    // hairdo filling a corner): they don't count as background here
    var hairBgLabs = bgLabs.filter(function (l2) { return labDist(hairLab, l2) >= 20; });
    var hairIsBg = hairBgLabs.length === 0;
    var isHairBg = function (idx) { for (var k = 0; k < hairBgLabs.length; k++) if (dLab(idx, hairBgLabs[k]) < 14) return true; return false; };
    var q = new Int32Array(N), qh = 0, qt = 0;
    for (y = Math.max(0, seedY0 - 2); y < seedY0 + 1; y++) for (x = Math.round(cx - 0.4 * Eref); x <= cx + 0.4 * Eref; x++) {
      if (x < 0 || x >= W || y < 0) continue; i = at(x, y); if (hairMask[i] || dLab(i, faceLab) <= 18 || dLab(i, hairLab) > 18) continue;
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
  var capCnt = 0, capTot = 0, sideCnt = 0, sideTot = 0, lowCnt = 0, lowTot = 0, hairTop = top, hairDbg = '', capFrac = 0, sideFrac = 0, lowFrac = 0, fringe = false, crownRgb = null;
  if (guide) {
    // Guided: the player put the hairline on the top of the oval, so the band
    // right above it IS the hair — or a bald crown, or the backdrop when the
    // head stops there. Hair is read in ZONES set by the template: the crown
    // band gives the hair colour, the side and low zones the length. No
    // flood fill.
    var oT = gcy - gry, oB = gcy + gry;
    // guide.valid: the part of the frame the photo covers (a panned photo
    // leaves a plain fill around it, which is neither hair nor backdrop)
    var vx0 = 0, vy0 = 0, vx1 = W, vy1 = H;
    if (guide.valid) { vx0 = Math.max(0, Math.round(guide.valid[0] * W)); vy0 = Math.max(0, Math.round(guide.valid[1] * H)); vx1 = Math.min(W, Math.round(guide.valid[2] * W)); vy1 = Math.min(H, Math.round(guide.valid[3] * H)); }
    var inValid = function (xx, yy) { return xx >= vx0 && xx < vx1 && yy >= vy0 && yy < vy1; };
    var clothLab = clothRgb ? rgb2lab(clothRgb[0], clothRgb[1], clothRgb[2]) : null;
    var cbx0 = Math.round(gcx - 0.7 * grx), cbx1 = Math.round(gcx + 0.7 * grx), cby0 = Math.round(oT - 0.45 * gry), cby1 = Math.round(oT - 0.03 * gry);
    var bandPxAll = [], nBand = 0, bandStds = [], bandSkin = 0, bandCorner = [0, 0];
    for (y = Math.max(0, cby0); y <= Math.min(H - 1, cby1); y++) for (x = Math.max(0, cbx0); x <= Math.min(W - 1, cbx1); x++) {
      if (!inValid(x, y)) continue;
      nBand++; i = at(x, y); bandPxAll.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]);
      if (skin[i] && dLab(i, faceLab) < 20) bandSkin++;
      if (dLab(i, bgLabs[0]) < 16) bandCorner[0]++; if (dLab(i, bgLabs[1]) < 16) bandCorner[1]++;
      if ((x % 3) === 0 && (y % 3) === 0) bandStds.push(localStd(x, y, 2));
    }
    bandStds.sort(function (p, q) { return p - q; });
    var bandStd = bandStds.length ? bandStds[bandStds.length >> 1] : 0; // median: the edge of the head must not make a wall "textured"
    bandSkin = nBand ? bandSkin / nBand : 0;
    var crownKnown = nBand >= 0.5 * (cbx1 - cbx0 + 1) * (cby1 - cby0 + 1); // head cut by the photo edge → unknown
    var bandLab = bandPxAll.length ? rgb2lab.apply(null, medianRgb(bandPxAll)) : faceLab;
    // A big hairdo fills the top corners: a corner whose colour fills the
    // crown band is hair, not backdrop, when the band has the texture of
    // hair (a wall is smooth) — otherwise what is above the head is the wall.
    var hairBg = [];
    for (var kc = 0; kc < 2; kc++) {
      var cxs = kc === 0 ? vX0 : vX1 - cs, cStd = 0, cN = 0;
      for (y = vY0; y < vY0 + cs; y += 3) for (x = cxs; x < cxs + cs; x += 3) { cStd += localStd(x, y, 2); cN++; }
      cStd = cN ? cStd / cN : 0;
      if (nBand && bandCorner[kc] / nBand >= 0.7 && bandStd > Math.max(6, 2.5 * cStd)) continue;
      hairBg.push({ lab: bgLabs[kc], std: cStd, ambiguous: false });
    }
    // A corner the colour of the hair (a shaded wall behind dark hair) cannot
    // exclude by colour alone: once the hair colour is known, such a corner
    // only excludes SMOOTH pixels — strands have texture, a wall has none.
    var isBgH = function (idx) {
      for (var k = 0; k < hairBg.length; k++) if (dLab(idx, hairBg[k].lab) < 16) {
        if (!hairBg[k].ambiguous) return true;
        var xx = idx % W; return localStd(xx, (idx - xx) / W, 2) <= Math.max(2.5, 2.5 * hairBg[k].std);
      }
      return false;
    };
    var bandRescue = false; // the crown band is the corner colour yet not skin: hair the colour of the backdrop (see below)
    var candidate = function (idx, nearClothes, ignoreBg) {
      var xx = idx % W; if (!inValid(xx, (idx - xx) / W)) return false;
      if (!ignoreBg && isBgH(idx)) return false;
      if (nearClothes && clothLab && dLab(idx, clothLab) < 16) return false;
      return true;
    };
    // smooth-skin reference: the local std of the cheeks (lit skin)
    var cheekStd = 0, csN = 0;
    for (y = Math.round(gcy + 0.05 * gry); y < gcy + 0.4 * gry; y += 3) for (x = Math.round(gcx - 0.75 * grx); x <= gcx + 0.75 * grx; x += 3) {
      if (y < 0 || y >= H || x < 0 || x >= W || Math.abs(x - gcx) < 0.35 * grx) continue; cheekStd += localStd(x, y, 2); csN++;
    }
    cheekStd = csN ? cheekStd / csN : 4;
    var texThr = Math.max(6, cheekStd * 2.2);
    // Hair colour: the crown band pixels clearly off the skin colour seed the
    // hair centre (dark, red, grey hair); when there are none, the band as a
    // whole decides — blonde and light brown hair sit close to the skin in
    // lightness but differ in chroma (less red), a bald crown does not. The
    // silhouette the player chose is the prior: a woman is rarely bald.
    var hairC = null, hairDbg2 = '';
    (function () {
      var far = [], farHi = [], cand = [], nAll = 0;
      var scan = function () {
        far = []; farHi = []; cand = []; nAll = 0;
        for (y = Math.max(0, cby0); y <= Math.min(H - 1, cby1); y++) for (x = Math.max(0, cbx0); x <= Math.min(W - 1, cbx1); x++) {
          i = at(x, y); if (!candidate(i, false, bandRescue)) continue; nAll++; cand.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]);
          // off-face pixels, darker and brighter than the face apart: a
          // shine on the forehead (frame a little low) must not seed white hair
          if (dLab(i, faceLab) > 24) (lab[i * 3] > faceLab[0] + 6 ? farHi : far).push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]);
        }
        // hair is darker than the face far more often than brighter: the
        // brighter group (white hair — or a lit wall above a low-framed head)
        // only wins when it clearly dominates
        if (farHi.length > 2 * far.length) far = farHi;
      };
      scan();
      if (!crownKnown) return; // head cut by the photo edge: nothing to say
      // The band is a DARK backdrop colour and not the scalp: dark hair on a
      // dark wall (crushed blacks have no texture to tell them apart) is far
      // more common than a bald crown placed on the hairline — read the
      // band as hair; its length stays unknown (the sides keep the backdrop
      // out). A light wall above the head says nothing (frame a little low,
      // or a bald crown): the default hair stays.
      if (nAll < 0.25 * nBand && bandSkin < 0.4 && bandLab[0] < 36) { bandRescue = true; scan(); }
      hairDbg2 = 'band=' + nBand + '/' + nAll + ' far=' + (nAll ? (far.length / 3 / nAll).toFixed(2) : '-') + ' bandStd=' + bandStd.toFixed(1) + ' hairBg=' + hairBg.length + ' bandSkin=' + bandSkin.toFixed(2) + (bandRescue ? ' RESCUE' : '');
      if (nAll < 0.25 * nBand) return; // the scalp keeps going up: no hair
      if (far.length / 3 >= 0.12 * nAll) hairC = rgb2lab.apply(null, medianRgb(far));
      else {
        var cm = rgb2lab.apply(null, medianRgb(cand)), dE = labDist(cm, faceLab), dAB = Math.hypot(cm[1] - faceLab[1], cm[2] - faceLab[2]);
        hairDbg2 += ' cm=' + cm.map(function (v) { return v.toFixed(0); }) + ' dE=' + dE.toFixed(1) + ' dAB=' + dAB.toFixed(1);
        if (dE >= (sex === 1 ? 9 : 12) && (dAB >= (sex === 1 ? 4 : 6) || cm[0] < faceLab[0] - 12)) hairC = cm;
      }
      if (!hairC) return;
      for (var it = 0; it < 2; it++) { // refine the centre with its members
        var mem = [];
        for (y = Math.max(0, cby0); y <= Math.min(H - 1, cby1); y++) for (x = Math.max(0, cbx0); x <= Math.min(W - 1, cbx1); x++) { i = at(x, y); if (!candidate(i, false, bandRescue)) continue; if (dLab(i, hairC) < dLab(i, faceLab) && dLab(i, faceLab) > 6) mem.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]); }
        if (mem.length >= 30) hairC = rgb2lab.apply(null, medianRgb(mem));
      }
    })();
    if (hairC) for (var ka = 0; ka < hairBg.length; ka++) hairBg[ka].ambiguous = labDist(hairBg[ka].lab, hairC) < 16;
    // C. the clothes strip again, hair excluded: on the feminine silhouette
    // long hair often lies over the shoulders and the top (a dark strip was
    // read as a dark garment, and the low zones as that garment)
    if (hairC && sex === 1 && oy0 < H - 4) {
      var cpx = [], cN2 = 0; // from just under the chin to the bottom: the collar shows between the strands
      for (y = Math.round(oB + 0.1 * gry); y < H; y++) for (x = Math.round(cx - 0.3 * fw); x <= cx + 0.3 * fw; x++) {
        if (x < 0 || x >= W || !inValid(x, y)) continue; i = at(x, y); if (skin[i]) continue; cN2++;
        var dH2 = dLab(i, hairC); if ((dH2 < dLab(i, faceLab) && dH2 < 34) || dH2 < 18) continue; // hair-coloured (shaded strands included)
        cpx.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]);
      }
      clothRgb = (cpx.length >= 30 && cpx.length / 3 >= 0.2 * cN2) ? medianRgb(cpx) : null;
      clothLab = clothRgb ? rgb2lab(clothRgb[0], clothRgb[1], clothRgb[2]) : null;
    }
    var isHairPx = function (idx, nearClothes, ignoreBg) { // 0 no, 1 hair colour, 2 skin-coloured strands (texture)
      if (!hairC || !candidate(idx, nearClothes, ignoreBg)) return 0;
      var dF = dLab(idx, faceLab), dH = dLab(idx, hairC);
      if (dF < 8) return 0;
      if ((dH < dF && dH < 34) || dH < 18) return 1;
      if (dF >= 12 && skin[idx]) { var xx = idx % W, yy = (idx - xx) / W; return localStd(xx, yy, 2) > texThr ? 2 : 0; } // lit strands the colour of the skin: hair is never smooth
      return 0;
    };
    var zone = function (x0, x1, y0, y1, nearClothes, collect, ignoreBg) {
      var c = 0, n = 0;
      for (var yy = Math.max(0, Math.round(y0)); yy <= Math.min(H - 1, Math.round(y1)); yy++) for (var xx = Math.max(0, Math.round(x0)); xx <= Math.min(W - 1, Math.round(x1)); xx++) {
        if (!inValid(xx, yy)) continue;
        var idx = at(xx, yy); n++;
        var hp = isHairPx(idx, nearClothes, ignoreBg);
        if (hp) { c++; if (collect && hp === 1) collect.push(D[idx * 4], D[idx * 4 + 1], D[idx * 4 + 2]); } // (the colour comes from the hair-coloured pixels only)
      }
      return n ? c / n : 0;
    };
    var crownPx = [];
    capFrac = zone(cbx0, cbx1, cby0, cby1, false, crownPx, bandRescue);
    var sidePx = [];
    sideFrac = (zone(gcx - 1.38 * grx, gcx - 1.03 * grx, gcy - 0.3 * gry, gcy + 0.5 * gry, false, sidePx)
      + zone(gcx + 1.03 * grx, gcx + 1.38 * grx, gcy - 0.3 * gry, gcy + 0.5 * gry, false, sidePx)) / 2;
    var lowPx = [];
    lowFrac = (zone(gcx - 0.95 * grx, gcx - 0.4 * grx, oB + 0.05 * gry, oB + 0.5 * gry, true, lowPx)
      + zone(gcx + 0.4 * grx, gcx + 0.95 * grx, oB + 0.05 * gry, oB + 0.5 * gry, true, lowPx)) / 2;
    // bald: no hair colour above the hairline, or a crown band that is
    // mostly the face colour (the skin keeps going up)
    var crownSkin = 0, crownN = 0;
    for (y = Math.round(oT - 0.35 * gry); y < oT - 0.03 * gry; y++) for (x = Math.round(gcx - 0.3 * grx); x <= gcx + 0.3 * grx; x++) { if (y < 0 || !inValid(x, y)) continue; crownN++; if (!isHairPx(at(x, y), false, bandRescue) && skin[at(x, y)]) crownSkin++; }
    // bald: the scalp keeps going up (no hair colour, the band is skin), or
    // the middle of the band is bare skin with hardly any hair around
    bald = crownKnown && crownN > 0 && ((!hairC && crownSkin / crownN >= 0.4) || (hairC && crownSkin / crownN > 0.6 && capFrac < 0.3));
    if (bald) { capFrac = 0; sideFrac = 0; lowFrac = 0; }
    // fringe: the top of the forehead, inside the oval, is hair-coloured
    var fringeFrac = bald ? 0 : zone(gcx - 0.35 * grx, gcx + 0.35 * grx, oT + 0.05 * gry, oT + 0.22 * gry, false, null);
    fringe = fringeFrac > 0.5;
    // the colour comes from every hair pixel found: the crown is often in
    // shadow, the sides and the shoulders catch the light
    hairPx = crownPx.concat(sidePx, lowPx);
    hairRgb = (!bald && hairPx.length >= 30) ? medianRgb(hairPx) : null;
    crownRgb = (!bald && crownPx.length >= 30) ? medianRgb(crownPx) : hairRgb;
    hairCount = Math.round(capFrac * 1000);
    hairTop = Math.round(oT - 0.45 * gry * Math.min(1, capFrac * 1.5));
    foreheadH = bald ? 1.8 : 1.1;
    hairDbg = hairDbg2 + ' cap=' + capFrac.toFixed(2) + ' side=' + sideFrac.toFixed(2) + ' low=' + lowFrac.toFixed(2) + ' fringe=' + fringeFrac.toFixed(2) + ' crownSkin=' + (crownN ? (crownSkin / crownN).toFixed(2) : '-') + ' std=' + cheekStd.toFixed(1) + ' hairC=' + (hairC ? hairC.map(function (v) { return v.toFixed(0); }) : '-') + ' hairRgb=' + (hairRgb || '-');
  } else if (!bald) {
    for (y = hz.y0; y <= hz.y1; y++) for (x = hz.x0; x <= hz.x1; x++) {
      i = at(x, y);
      if (x >= left && x <= right && y < top && y >= top - 0.4 * fh) { capTot++; if (hairMask[i]) capCnt++; }
      if ((x < left || x > right) && y >= top + 0.35 * fh && y <= top + 0.7 * fh) { sideTot++; if (hairMask[i]) sideCnt++; }
      if ((x < left + 0.1 * fw || x > right - 0.1 * fw) && y > bottom && y <= bottom + 0.4 * fh) { lowTot++; if (hairMask[i]) lowCnt++; }
    }
    for (y = hz.y0; y < top; y++) if (hairRows[y] > 0.3 * fw) { hairTop = y; break; }
  }
  if (!guide) { capFrac = capTot ? capCnt / capTot : 0; sideFrac = sideTot ? sideCnt / sideTot : 0; lowFrac = lowTot ? lowCnt / lowTot : 0; }
  // hair the colour of the clothes: what lies below the chin is the collar
  // (masculine only: hair over the shoulders is the feminine norm; the
  // crown colour is compared, the shoulder pixels being the garment in doubt)
  var crownRef = crownRgb || hairRgb;
  if (sex === 0 && crownRef && clothRgb && labDist(rgb2lab(crownRef[0], crownRef[1], crownRef[2]), rgb2lab(clothRgb[0], clothRgb[1], clothRgb[2])) < 30) lowFrac = 0;
  var hairc = { index: 1, dist: 0 };
  if (hairRgb) {
    var hlab = rgb2lab(hairRgb[0], hairRgb[1], hairRgb[2]);
    hairc = nearestLab(hlab, P_HAIR_LAB);
    // grey and white are colourless: an ash-brown or dark-blonde median
    // (chroma ≥ 8) goes to the nearest COLOURED entry instead
    if ((hairc.index === 5 || hairc.index === 7) && Math.hypot(hlab[1], hlab[2]) >= 8) {
      hairc = nearestLab(hlab, P_HAIR_LAB.map(function (l2, k) { return (k === 5 || k === 7) ? [1e4, 0, 0] : l2; }));
    }
  }
  var hairHsl = hairRgb ? rgb2hsl(hairRgb[0], hairRgb[1], hairRgb[2]) : [0, 0, 0];
  var hat = 0, hair;
  // (a man's hair is long only when it covers the sides at ear level AND
  // the shoulders: a dark top under a dark-haired man fills the low zones
  // on its own and used to make him long-haired)
  var length = (lowFrac > (sex === 0 ? 0.5 : 0.3) && (sex === 1 || sideFrac > 0.45)) ? 'long' : (sideFrac > 0.3 ? 'mid' : 'short');
  // (big hair needs the crown far above the hairline — the template frame
  // stops just above it, so the guided path never claims it)
  var volume = !guide && !bald && capFrac > 0.6 && sideFrac > 0.5 && hairTop < seedTop - 0.9 * Eref && lowFrac < 0.2;
  // a saturated non-hair colour on top of the head is most likely a cap
  var hairChroma = hairRgb ? (function (l3) { return Math.hypot(l3[1], l3[2]); })(rgb2lab(hairRgb[0], hairRgb[1], hairRgb[2])) : 0;
  if (!bald && hairChroma >= 32 && hairHsl[2] > 0.2 && (hairHsl[0] < 8 || hairHsl[0] > 50)) { hat = 1; length = 'short'; volume = false; } // (Lab chroma: HSL saturation is inflated on pale colours)
  // (the hairstyle itself is chosen at the end, once the silhouette is known)

  // 6. glasses: dark frame pixels in the eye band and a dark nose bridge
  var glasses = 0, glassesDbg = '';
  var eyeY = (eL && eR) ? Math.round((eL.y + eR.y) / 2) : Math.round(top + 0.4 * fh);
  if (sunglasses) glasses = 5;
  else if (eyesOk) {
    // Frame signature: a dark, thin rim UNDER each eye (0.35-0.6 E below
    // the pupil, where a lower lid is skin) on both sides, plus a dark nose
    // bridge at pupil height. Eyebrows and eye shadows never give the lower
    // rim, so this stays quiet on bare faces.
    var bx0 = Math.round(eL.x + 0.25 * E), bx1 = Math.round(eR.x - 0.25 * E), bridge = 0, frame = 0, ftot = 0;
    for (y = eyeY - 2; y <= eyeY + 2; y++) for (x = bx0; x <= bx1; x++) { if (y < 0 || y >= H) continue; i = at(x, y); if (lum[i] < skinLum * 0.6 && !skin[i]) bridge++; }
    // a rim is THIN: one dark row in the band, the rest skin — a shadow or
    // eye bags darken the whole band and do not count
    var rimSides = 0, minRowMax = 1;
    [eL, eR].forEach(function (e) {
      var rim = 0, rtot = 0, rowMax = 0;
      for (y = Math.round(e.y + 0.22 * E); y <= e.y + 0.6 * E; y++) {
        var rd = 0, rn = 0;
        for (x = Math.round(e.x - 0.4 * E); x <= e.x + 0.4 * E; x++) {
          if (x < 0 || y < 0 || x >= W || y >= H || !inFace(x, y)) continue;
          rn++; i = at(x, y); if (lum[i] < skinLum * 0.6 && !skin[i]) rd++;
        }
        rim += rd; rtot += rn;
        if (rn && rd / rn > rowMax) rowMax = rd / rn;
      }
      frame += rim; ftot += rtot;
      if (rtot && rowMax > 0.45 && rim / rtot < 0.35) rimSides++;
      if (rowMax < minRowMax) minRowMax = rowMax;
    });
    glassesDbg = bridge + '/' + (ftot ? (frame / ftot).toFixed(2) : '-') + '/' + rimSides + '/' + minRowMax.toFixed(2);
    if (rimSides === 2 && (bridge >= 3 || minRowMax > 0.55 || (ftot && frame / ftot > 0.15))) glasses = 2;
  }

  // 6b. eyebrows (2.1.9-web.207): in the band above each pupil (0.12–0.62 E)
  // every column's longest dark run is the brow; the ends and the thickness
  // say whether the pair is angry (inner ends down), one raised, thick, or
  // thin and arched. A fringe over the brows (runs longer than 0.35 E) or a
  // brow found on fewer than 60 % of the columns leaves the neutral pair.
  var brows = 0, browsDbg = '';
  if (eyesOk) {
    var browOf = function (e, innerRight) {
      var xs = [], rows = [], ths = [], nCol = 0;
      for (x = Math.round(e.x - 0.42 * E); x <= e.x + 0.42 * E; x++) {
        if (x < 0 || x >= W) continue;
        nCol++;
        // the dark run whose centre is nearest the expected brow height
        // (0.35 E above the pupil) — not the longest: a low hairline or a
        // shadow in the band would win otherwise
        var best = 0, bestY = -1, bestD = 1e9, run = 0, runY = 0, want = e.y - 0.35 * E;
        var take = function () { if (run >= 0.025 * E && run <= 0.35 * E) { var d = Math.abs(runY + run / 2 - want); if (d < bestD) { bestD = d; best = run; bestY = runY; } } };
        for (y = Math.round(e.y - 0.62 * E); y <= e.y - 0.12 * E; y++) {
          if (y < 0 || y >= H) continue;
          i = at(x, y);
          if (lum[i] < skinLum * 0.72 && !skin[i]) { if (!run) runY = y; run++; }
          else if (run) { take(); run = 0; }
        }
        if (run) take();
        if (bestY >= 0) { xs.push(x); rows.push(bestY + best / 2); ths.push(best); }
      }
      var n = xs.length;
      if (!nCol || n / nCol < 0.6) return null;
      var q = Math.max(1, Math.round(n / 4)), m0 = Math.round(n / 3);
      var avg = function (a, b) { var sum = 0, cnt = 0; for (var k = a; k < b; k++) { sum += rows[k]; cnt++; } return cnt ? sum / cnt : 0; };
      var qL = avg(0, q), qR = avg(n - q, n);
      return { inner: innerRight ? qR : qL, outer: innerRight ? qL : qR, mid: avg(m0, n - m0), all: avg(0, n) - e.y, th: median(ths) / E }; // `all`: height over its own pupil (a tilted head keeps the pair level)
    };
    var bwL = browOf(eL, true), bwR = browOf(eR, false);
    if (bwL && bwR) {
      var vL = (bwL.inner - bwL.outer) / E, vR = (bwR.inner - bwR.outer) / E; // > 0: the inner end sits lower (a frown)
      var asym = Math.abs(bwL.all - bwR.all) / E, bth = (bwL.th + bwR.th) / 2;
      var arch = ((bwL.inner + bwL.outer) / 2 - bwL.mid + (bwR.inner + bwR.outer) / 2 - bwR.mid) / (2 * E); // > 0: the middle rides higher than the ends
      browsDbg = 'v=' + vL.toFixed(2) + '/' + vR.toFixed(2) + ' asym=' + asym.toFixed(2) + ' th=' + bth.toFixed(3) + ' arch=' + arch.toFixed(2);
      // two "brows" more than a quarter of E apart are not a pair (hair or a
      // shadow on one side): keep the neutral pair
      if (asym > 0.25) browsDbg += ' (not a pair)';
      else if (vL > 0.12 && vR > 0.12) brows = 1;
      else if (asym > 0.16) brows = 2; // (a level pair on a tilted head measures up to ≈ 0.12)
      else if (bth > 0.15) brows = 3;
      else if (bth < 0.06 && arch > 0.05) brows = 4;
    } else browsDbg = 'no brows';
  }

  // 7. mouth: reddish lip band (rows that hold >= 30% of the busiest row)
  var my0 = Math.round(top + 0.66 * fh), my1 = Math.min(H - 1, Math.round(top + 0.96 * fh));
  var mx0 = Math.round(left + 0.2 * fw), mx1 = Math.round(right - 0.2 * fw);
  var lipRow = new Int32Array(H), lipCol = new Int32Array(W), lipMask = new Uint8Array(N), lipN = 0, lipPx = [];
  for (y = my0; y <= my1; y++) for (x = mx0; x <= mx1; x++) {
    i = at(x, y); r = D[i * 4]; g = D[i * 4 + 1]; b = D[i * 4 + 2];
    if (cr[i] > st.cr + 9 && r - g > 30 && r > 70) { lipMask[i] = 1; lipRow[y]++; lipN++; }
  }
  var mouth = 2, mouthTop = Math.round(top + 0.8 * fh), mouthW = 0, lipMinX = 0, lipMaxX = -1, lipMinY = 0, lipMaxY = -1, mouthDbg = '', lipstick = false;
  // teeth: brighter than the LIT skin of the same photo (never an absolute
  // level — a dark photo keeps its teeth), not redder than it (a lip
  // highlight is), and not saturated
  var isTooth = function (idx) { return lab[idx * 3] > faceLab0[0] + 2 && lab[idx * 3 + 1] <= faceLab0[1] + 4 && Math.hypot(lab[idx * 3 + 1], lab[idx * 3 + 2]) < 24; };
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
      var dark = 0, teeth = 0, tot = 0, yc = [], yk = [], teethRows = new Int32Array(H), teethRowMax = 0;
      for (y = Math.max(0, Math.round(lipMinY - 0.12 * fh)); y <= lipMaxY; y++) for (x = lipMinX; x <= lipMaxX; x++) {
        i = at(x, y); tot++;
        if (lum[i] < skinLum * 0.45) dark++;
        // teeth lie BETWEEN the lips, in a wide row (the lit skin above the
        // upper lip is as bright, but sits above the band)
        if (y >= lipMinY && isTooth(i)) { teeth++; teethRows[y]++; if (teethRows[y] > teethRowMax) teethRowMax = teethRows[y]; }
        if (lipMask[i]) {
          lipPx.push(D[i * 4], D[i * 4 + 1], D[i * 4 + 2]);
          var t = (x - lipMinX) / Math.max(1, mouthW - 1);
          if (t < 0.2 || t > 0.8) yc.push(y); else if (t > 0.4 && t < 0.6) yk.push(y);
        }
      }
      if (teethRowMax < 0.3 * mouthW) teeth = 0; // a bright spot, not a row of teeth
      var curve = (yc.length && yk.length) ? (median(yk) - median(yc)) / fh : 0;
      mouthDbg = 'teeth=' + (teeth / tot).toFixed(2) + ' dark=' + (dark / tot).toFixed(2) + ' curve=' + curve.toFixed(3) + ' h/w=' + (mouthH / mouthW).toFixed(2);
      var ratio = mouthW / fw;
      if (teeth / tot > 0.12 && dark / tot > 0.15) mouth = 6;
      else if (teeth / tot > 0.09) mouth = 1;
      else if (dark / tot > 0.28) mouth = (mouthH / mouthW > 0.5) ? 7 : 6;
      else if (ratio > 0.46) mouth = teeth / tot > 0.04 ? 1 : 0; // a very wide mouth is a smile (the lip band often misses the corners' curve)
      else if (curve < -0.025 && ratio > 0.22) mouth = 8;
      else if (curve > 0.03 && ratio > 0.28) mouth = 0;
      else if (mouthH / mouthW > 0.75) mouth = 5; // a pout is nearly as tall as wide (full lips are not one)
      else mouth = 2;
      if (lipPx.length) { // lipstick: saturated red lips, far from the skin colour
        var lr = medianRgb(lipPx), lh = rgb2hsl(lr[0], lr[1], lr[2]);
        if (lh[1] > 0.6 && lr[0] > 130 && labDist(rgb2lab(lr[0], lr[1], lr[2]), rgb2lab(st.rgb[0], st.rgb[1], st.rgb[2])) > 28 && mouth !== 6 && mouth !== 1) lipstick = true;
      }
    }
  }
  // No lip band (a wide smile stretches the lips thin around the teeth):
  // with the template, the mouth sits 1.25–1.75 E under the eyes — teeth
  // there make it a grin, teeth and a dark opening a laugh.
  if (guide && lipMaxX < lipMinX) {
    var tw0 = Math.max(0, Math.round(cx - 0.5 * Eref)), tw1 = Math.min(W - 1, Math.round(cx + 0.5 * Eref));
    var th0 = Math.max(0, Math.round(eyeMidY + 1.25 * Eref)), th1 = Math.min(H - 1, Math.round(eyeMidY + 1.75 * Eref));
    var tTeeth = 0, tDark = 0, tTot = 0, tRows = new Int32Array(H);
    for (y = th0; y <= th1; y++) for (x = tw0; x <= tw1; x++) { i = at(x, y); tTot++; if (isTooth(i)) { tTeeth++; tRows[y]++; } if (lum[i] < skinLum * 0.45) tDark++; }
    var tf = tTot ? tTeeth / tTot : 0, df = tTot ? tDark / tTot : 0, tRowMax = 0;
    for (y = th0; y <= th1; y++) if (tRows[y] > tRowMax) tRowMax = tRows[y];
    mouthDbg = 'noband teeth=' + tf.toFixed(2) + ' dark=' + df.toFixed(2) + ' row=' + (tRowMax / (tw1 - tw0 + 1)).toFixed(2);
    // a row of teeth must be wide (a highlight is a spot)
    if (tRowMax >= 0.3 * (tw1 - tw0 + 1)) mouth = (tf > 0.1 && df > 0.1) ? 6 : (tf > 0.04 ? 1 : mouth);
  }

  // 7b. nose (guided only: the geometry is trusted). Light comes from
  // above: the nose BASE (nostrils + columella) is a dark dip of the centre
  // column between the eyes and the lips; its height below the eyes gives
  // the length.
  var nose, noseDbg = '';
  if (guide) {
    var nyA = Math.max(0, Math.round(eyeMidY + 0.45 * Eref)), nyB = Math.min(H - 1, Math.round(eyeMidY + 1.15 * Eref));
    if (lipMaxY >= lipMinY && lipMinY > nyA) nyB = Math.min(nyB, lipMinY - 3); // never the lips
    var bandLum = function (yy, xa, xb) { var sm = 0, nn = 0; for (var xx = Math.max(0, Math.round(xa)); xx <= Math.min(W - 1, Math.round(xb)); xx++) { sm += lum[at(xx, yy)]; nn++; } return nn ? sm / nn : 0; };
    // reference: the cheeks beside the nose, in the same rows
    var refL = [], yRef;
    for (yRef = nyA; yRef <= nyB; yRef += 2) { refL.push(bandLum(yRef, cx - 0.75 * Eref, cx - 0.5 * Eref)); refL.push(bandLum(yRef, cx + 0.5 * Eref, cx + 0.75 * Eref)); }
    var ref = median(refL) || skinLum;
    // the FIRST dip below the cheeks going down from the eyes is the nose
    // base (the mouth is a second, deeper one — a child's mouth sits close)
    // Going down the centre line: the dips below the cheeks are the nose
    // base (nostrils + columella shadow), the mouth, a beard. The nose base
    // is the UPPER of the two deepest dips — a child's mouth sits close under
    // a short nose, a bearded chin is darker than both.
    var runs2 = [], cur2 = null, yStart = Math.max(nyA, Math.round(eyeMidY + 0.55 * Eref)); // (below the shadow under the eyes)
    for (y = yStart; y <= nyB; y++) {
      var rl = bandLum(y, cx - 0.12 * Eref, cx + 0.12 * Eref);
      if (rl < 0.82 * ref) { if (!cur2) cur2 = { y: y, min: rl }; else if (rl < cur2.min) { cur2.min = rl; cur2.y = y; } }
      else if (cur2) { runs2.push(cur2); cur2 = null; }
    }
    if (cur2) runs2.push(cur2);
    runs2 = runs2.filter(function (rn) { return rn.min < 0.72 * ref; }); // a real shadow, not the tail of the one under the eyes
    runs2.sort(function (p, q) { return p.min - q.min; });
    var yN = -1, minL = 1e9;
    if (runs2.length >= 2) { var top2 = runs2[0].y < runs2[1].y ? runs2[0] : runs2[1]; yN = top2.y; minL = top2.min; }
    else if (runs2.length === 1 && (runs2[0].y - eyeMidY) / Eref < 1.15) { yN = runs2[0].y; minL = runs2[0].min; }
    if (yN >= 0) {
      var nLen = (yN - eyeMidY) / Eref;
      noseDbg = 'len=' + nLen.toFixed(2) + ' dark=' + (minL / ref).toFixed(2) + ' runs=' + runs2.length;
      // only what a frontal photo says reliably: a clearly short nose is
      // the small upturned one, a clearly long one the straight one; the
      // width (the shadow's spread) moves too much with the framing to use
      if (nLen < 0.62 && minL < 0.6 * ref) nose = 2;
      else if (nLen >= 1.15 && minL < 0.7 * ref) nose = 1;
    } else noseDbg = 'none';
  }

  // 8. beard: the chin zone (mouth → just under the chin) is darker than
  // the CHEEKS of the same photo — median luminance ratio, which cancels
  // the lighting (a shadowed face keeps its ratio near 1) — and less
  // skin-like; the moustache band (nose → lip) likewise. Measured on every
  // face (it also drives the silhouette guess), applied to the masculine
  // one only.
  var beard = 0, bFrac = 0, mFrac = 0, beardDbg = '';
  {
    var zoneStats = function (x0, x1, y0, y1, collect) {
      var ls = [], sk = 0, n = 0, sds = [], dn = 0;
      for (var yy = Math.max(0, Math.round(y0)); yy <= Math.min(H - 1, y1); yy++) for (var xx = Math.max(0, Math.round(x0)); xx <= Math.min(W - 1, x1); xx++) {
        var idx = at(xx, yy); if (lipMask[idx] || isBg(idx, 18, true)) continue; // (not the lips, not the backdrop beside a narrow chin)
        ls.push(lum[idx]); n++; if (skin[idx]) sk++;
        if ((xx % 3) === 0 && (yy % 3) === 0) sds.push(localStd(xx, yy, 2)); // texture: stubble is grainy, skin is smooth
        if (lum[idx] < skinLum * 0.68) {
          if (collect) collect.push(D[idx * 4], D[idx * 4 + 1], D[idx * 4 + 2]);
          // dark AND colourless: a hair (grey stubble, dark beard) — a shaded
          // patch of skin keeps the skin's chroma
          if (Math.hypot(lab[idx * 3 + 1], lab[idx * 3 + 2]) <= 12 && lab[idx * 3 + 2] >= -4) dn++;
        }
      }
      return { med: median(ls), skin: n ? sk / n : 0, n: n, std: median(sds), darkN: n ? dn / n : 0 };
    };
    var bz0 = Math.round(top + 0.8 * fh), bz1 = Math.min(H - 1, Math.round(bottom + 0.15 * fh));
    if (eyesOk) { bz0 = Math.round(eyeMidY + 1.1 * E); bz1 = Math.min(H - 1, Math.round(eyeMidY + 1.85 * E)); }
    if (guide) { // the player aligned the chin on the oval bottom: 74–92 % of the way from the eyes to it (a chin a little above it must not reach the collar)
      var eyeToChin = gcy + gry - eyeMidY;
      bz0 = Math.round(eyeMidY + 0.74 * eyeToChin); bz1 = Math.min(H - 1, Math.round(eyeMidY + 0.92 * eyeToChin));
    }
    var bpx = [];
    var chinS = zoneStats(left + 0.12 * fw, right - 0.12 * fw, bz0, bz1, bpx);
    // the upper half of the zone, right under the lip: a beard starts there,
    // a shaded neck or a collar (chin a little above the oval bottom) does not
    var chinU = zoneStats(left + 0.12 * fw, right - 0.12 * fw, bz0, (bz0 + bz1) / 2);
    // cheeks: between the eyes and the mouth, both sides — beard-free even
    // on most bearded faces
    var cy0 = eyesOk ? eyeMidY + 0.45 * E : top + 0.5 * fh, cy1 = eyesOk ? eyeMidY + 0.95 * E : top + 0.72 * fh;
    var ckL = zoneStats(left + 0.08 * fw, left + 0.32 * fw, cy0, cy1), ckR = zoneStats(right - 0.32 * fw, right - 0.08 * fw, cy0, cy1);
    var cheekMed = (ckL.med + ckR.med) / 2 || 1;
    var medR = chinS.med / cheekMed;
    // moustache band: nose bottom → upper lip
    var mz0 = Math.round(eyeMidY + 0.95 * Eref), mz1 = Math.min(H - 1, Math.round(eyeMidY + 1.3 * Eref));
    var mS = zoneStats(cx - 0.4 * Eref, cx + 0.4 * Eref, mz0, mz1);
    var mR = mS.med / cheekMed;
    bFrac = Math.max(0, 1 - medR); mFrac = Math.max(0, 1 - mR);
    var texR = (ckL.std + ckR.std) / 2 > 0 ? chinS.std / ((ckL.std + ckR.std) / 2) : 0;
    beardDbg = 'medR=' + medR.toFixed(2) + ' mR=' + mR.toFixed(2) + ' std=' + chinS.std.toFixed(1) + '/' + ((ckL.std + ckR.std) / 2).toFixed(1) + ' texR=' + texR.toFixed(2) + ' mStd=' + mS.std.toFixed(1) + ' skinChin=' + chinS.skin.toFixed(2) + ' skinCheek=' + ((ckL.skin + ckR.skin) / 2).toFixed(2) + ' chin=' + chinS.med.toFixed(0) + '/' + chinS.n + ' cheek=' + cheekMed.toFixed(0) + ' bz=' + bz0 + '-' + bz1;
    // the dark mass must look like hair, not like the collar of a dark
    // garment (free photos only: the guided chin zone never reaches it)
    var beardRgb = bpx.length >= 30 ? medianRgb(bpx) : null, isCollar = false;
    if (!eyesOk && beardRgb && clothRgb && hairRgb) {
      var dCloth = labDist(rgb2lab.apply(null, beardRgb), rgb2lab(clothRgb[0], clothRgb[1], clothRgb[2]));
      var dHair = labDist(rgb2lab.apply(null, beardRgb), rgb2lab(hairRgb[0], hairRgb[1], hairRgb[2]));
      isCollar = dCloth < 12 && dHair > 20;
    }
    // The dark mass must be HAIR-coloured: a neutral dark (chroma ≤ 12 — a
    // beard hides the skin), never blue (a collar), never saturated. A
    // shaded neck or a chin a little below the oval keeps the skin's own
    // chroma (≈ 15–20) and only counts with a strong contrast (stubble on
    // skin does too: the contrast then is what shows it).
    var bChroma = 0, bBlue = false;
    if (beardRgb) { var bl_ = rgb2lab.apply(null, beardRgb); bChroma = Math.hypot(bl_[1], bl_[2]); bBlue = bl_[2] < -4; beardDbg += ' dark=' + beardRgb + ' L' + bl_[0].toFixed(0) + ' a' + bl_[1].toFixed(0) + ' b' + bl_[2].toFixed(0) + ' C' + bChroma.toFixed(0) + ' n=' + (bpx.length / 3) + ' dF=' + (chinS.n ? (bpx.length / 3 / chinS.n).toFixed(2) : '-'); }
    var hairLike = beardRgb && !bBlue && bChroma <= 30;
    var upR = chinU.med / cheekMed;
    var bearded = !isCollar && hairLike && upR < 0.88 && (medR < 0.65 || (medR < 0.8 && bChroma <= 12) || (medR < 0.8 && chinS.skin < 0.85 && bChroma <= 14));
    // stubble (grey or short): the chin is not darker as a whole, but a
    // fifth of it is dark colourless grain — a smooth chin has almost none
    var stubble = !bearded && !isCollar && chinS.darkN >= 0.22 && chinU.darkN >= 0.15 && chinS.std >= 5 && (!beardRgb || !bBlue);
    beardDbg += ' darkN=' + chinS.darkN.toFixed(2) + '/' + chinU.darkN.toFixed(2) + ' upR=' + upR.toFixed(2) + (stubble ? ' STUBBLE' : '');
    if (bearded) beard = (medR < 0.62 && mR < 0.85) ? 4 : 3;
    else if (stubble) beard = 5;
    else if (mR < 0.72) beard = 1;
    // long beard (2.1.9-web.207, guided): the beard-coloured, grainy mass goes
    // on below the oval bottom, bounded on both sides — a dark garment fills
    // the sides too and is smooth
    if (guide && bearded) {
      var lz0 = Math.round(gcy + gry + 0.05 * Eref), lz1 = Math.min(H - 1, Math.round(gcy + gry + 0.6 * Eref));
      if (lz1 > lz0 + 4) {
        var lpx = [], lz = zoneStats(cx - 0.2 * fw, cx + 0.2 * fw, lz0, lz1, lpx);
        var spxL = [], szL = zoneStats(left - 0.1 * fw, left + 0.08 * fw, lz0, lz1, spxL), spxR = [], szR = zoneStats(right - 0.08 * fw, right + 0.1 * fw, lz0, lz1, spxR);
        var lDark = lz.n ? (lpx.length / 3) / lz.n : 0, sDark = (szL.n + szR.n) ? ((spxL.length + spxR.length) / 3) / (szL.n + szR.n) : 0;
        var lRgb = lpx.length >= 30 ? medianRgb(lpx) : null;
        var dBeard = (lRgb && beardRgb) ? labDist(rgb2lab.apply(null, lRgb), rgb2lab.apply(null, beardRgb)) : 99;
        beardDbg += ' long=' + lDark.toFixed(2) + '/' + sDark.toFixed(2) + ' dB=' + dBeard.toFixed(0) + ' lstd=' + lz.std.toFixed(1);
        if (lDark >= 0.6 && sDark < 0.35 && dBeard < 16 && lz.skin < 0.3 && lz.std >= 4) beard = 6;
      }
    }
  }

  // skin tone: lightness first (the palette is a lit-skin ramp, peach-toned:
  // pink or olive skins must land by lightness, not by hue)
  var skinLabV = rgb2lab(st.rgb[0], st.rgb[1], st.rgb[2]), skinIndex = 1, skinBest = 1e9;
  // flat cartoon skin reads darker than lit photo skin of the same L: lift
  // the measured L, more for darker photos (side light, indoor)
  skinLabV[0] += 3 + 6 * Math.max(0, Math.min(1, (80 - skinLabV[0]) / 20));
  P_SKIN_LAB.forEach(function (l2, k) {
    var d = Math.sqrt(Math.pow((skinLabV[0] - l2[0]) * 1.6, 2) + Math.pow((skinLabV[1] - l2[1]) * 0.5, 2) + Math.pow((skinLabV[2] - l2[2]) * 0.5, 2));
    if (d < skinBest) { skinBest = d; skinIndex = k; }
  });

  // Silhouette guess (opts.guessSex !== false): only from clear cues — a
  // real beard or moustache → masculine; lipstick or long hair → feminine;
  // otherwise the player's choice stands. It is a starting point like the
  // rest, the player switches it in one tap.
  var sexGuess = null;
  if (opts.guessSex !== false) {
    if (beard >= 3 || (beard === 1 && mFrac > 0.35)) sexGuess = 0;
    else if (lipstick) sexGuess = 1;
    else if (!bald && !hat && length === 'long') sexGuess = 1;
  }
  var sexF = sexGuess === null ? sex : sexGuess;

  // sex-dependent mappings
  if (sexF === 0) hair = bald ? 0 : (volume ? 10 : (length === 'short' ? 1 : (length === 'mid' ? (fringe ? 31 : 18) : 43)));
  else hair = bald ? 36 : (volume ? 23 : (length === 'long' ? (fringe ? 34 : 8) : (length === 'mid' ? (fringe ? 34 : 5) : 12)));
  if (hat) hair = sexF === 0 ? 1 : 12;
  if (sexF === 1) beard = 0;
  if (sexF === 1 && lipstick) mouth = 3;
  if (sexF === 0 && brows === 4) brows = 0; // thin arched brows are a feminine option

  // a jaw beard hides the chin: the face shape cannot be measured, keep oval
  if (beard === 3 || beard === 4 || beard === 5 || beard === 6) face = 0;

  // outfit from the clothes under the chin (dark → hoodie / turtleneck,
  // light → open shirt / sweater), only when that strip is in the photo
  // outfit: a plain garment (tee / hoodie / turtleneck) in the nearest of
  // the eight outfit colours; a very light top → the open shirt (masculine)
  var outfit, outfitc;
  if (clothRgb) {
    var olab = rgb2lab(clothRgb[0], clothRgb[1], clothRgb[2]), ol = olab[0];
    var oc = nearestLab(olab, P_OUTFITC_LAB);
    if (sexF === 0) outfit = ol < 35 ? 11 : (ol > 78 ? 5 : 17);
    else outfit = ol < 35 ? 7 : 32;
    if (outfit !== 5) outfitc = oc.index + 1;
  }

  // 9. background → nearest pastel (neutral corners → white)
  var bgc = bgs[0], bhs = rgb2hsl(bgc[0], bgc[1], bgc[2]);
  var bg = (bhs[1] < 0.12 || bhs[2] < 0.25) ? 7
    : nearestLab(rgb2lab(bgc[0] * 0.35 + 255 * 0.65, bgc[1] * 0.35 + 255 * 0.65, bgc[2] * 0.35 + 255 * 0.65), P_BG_LAB).index;
  // a saturated green or deep red backdrop → the green / burgundy felt (2.1.9-web.207)
  if (bhs[2] >= 0.12 && bhs[2] <= 0.55) { if (bhs[1] >= 0.3 && bhs[0] >= 80 && bhs[0] <= 170) bg = 11; else if (bhs[1] >= 0.45 && (bhs[0] <= 12 || bhs[0] >= 335)) bg = 12; } // (a dark brown wall is not a red felt)

  var recipe = {
    v: 2, face: face, skin: skinIndex, hair: hair, hairc: hairc.index, outfit: outfit, outfitc: outfitc,
    eyes: eyes, eyec: eyec, glasses: glasses, mouth: mouth, beard: beard, hat: hat, bg: bg, brows: brows
  };
  if (nose !== undefined) recipe.nose = nose;
  if (outfit === undefined) delete recipe.outfit;
  if (outfitc === undefined) delete recipe.outfitc;
  if (sexGuess !== null) recipe.sex = sexGuess;
  return {
    recipe: recipe,
    debug: { box: [left, top, fw, fh], eyes: [eL, eR], eyesOk: eyesOk, cands: cL.concat(cR), guided: !!guide, mouth: [lipMinX, lipMinY, lipMaxX, lipMaxY],
             hair: { capFrac: capFrac, sideFrac: sideFrac, lowFrac: lowFrac, top: hairTop, rgb: hairRgb, count: hairCount, border: borderTot ? borderHits / borderTot : 0, forehead: foreheadH, skinTop: skinTop },
             skinLum: skinLum, skinRgb: st.rgb, bgs: bgs, cloth: clothRgb, faceDbg: faceDbg, noseDbg: noseDbg, noseRow: (typeof yN !== 'undefined' && yN >= 0 ? [cx - 0.12 * Eref, yN, cx + 0.12 * Eref] : null), aspect: aspect, jaw: jaw, mouthW: mouthW, bFrac: bFrac, mFrac: mFrac, glassesDbg: glassesDbg, browsDbg: browsDbg, mouthDbg: mouthDbg, beardDbg: beardDbg, hairDbg: hairDbg, sexGuess: sexGuess, lipstick: lipstick, length: length }
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
