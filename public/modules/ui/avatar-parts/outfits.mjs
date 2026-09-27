// Avatar parts — outfits (2.1.9-web.209).
//
// One object per garment. draw is wrapped by outfitDraw: fn(ctx, sk, C,
// skin) returns the torso SVG (y 157–204, drawn behind the head) — sk is
// the skin gradient for collar openings, C(def) the outfit colour chosen by
// the player when the garment is colourable (def otherwise), skin the
// [base, shadow] pair. Flags: sex (every garment belongs to one
// silhouette), colorable (takes the outfit colour), weight (dice).
//
// Adding a garment: append an object with a new stable id; the feminine
// body is the same drawing scaled ×0.86 by the engine.

'use strict';
import { _mix, _torso, _skinTorso, _shirtV, _lapels, _tie, _bowtie, _suit, _card, _bodyClip, _crew, _collarFlaps, outfitDraw } from './helpers.mjs';

// The four jackets drawn from one pattern (charcoal suit, navy + tie, grey
// vest + tie, tux + bow tie).
function suit(J, extra) {
  return outfitDraw(function (ctx, sk, C, skin) {
    var s = _torso(ctx, J) + _shirtV(ctx, '#f4f0e6');
    if (extra === 'vest') s += '<path d="M88 170 L78 176 L90 204 L100 196z M112 170 L122 176 L110 204 L100 196z" fill="' + ctx.v('#43474f') + '"/>';
    s += _lapels(ctx, _mix(J, 0.82));
    if (extra === 'tie') s += _tie('#1b2a4d');
    else if (extra === 'vest') s += _tie('#8e2632');
    else if (extra === 'bow') s += _bowtie('#a8262f');
    return s;
  });
}

const OUTFITS = [
  // 0 charcoal suit, 1 navy + tie, 2 grey + vest + tie (4 tux + bow tie below the feminine sweater, as in the former index order)
  { id: 'suit-charcoal', sex: 0, draw: suit('#3a3f47') },
  { id: 'suit-navy-tie', sex: 0, draw: suit('#2c4470', 'tie') },
  { id: 'vest-tie', sex: 0, draw: suit('#5b6069', 'vest') },
  // teal sweater with a round white collar (feminine)
  { id: 'sweater-collar', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#2a8f86');
      return _torso(ctx, c)
        + '<path d="M80 160 Q100 178 120 160 Q100 168 80 160z" fill="' + ctx.v(_mix(c, 0.8)) + '"/>'
        + '<path d="M78 156 Q88 172 100 170 Q112 172 122 156 Q112 164 100 162 Q88 164 78 156z" fill="#f7f4ec"/>'
        + '<circle cx="100" cy="176" r="2.2" fill="#f7f4ec"/><circle cx="100" cy="186" r="2.2" fill="#f7f4ec"/>';
    }) },
  { id: 'tux', sex: 0, draw: suit('#1f2126', 'bow') },
  // open-collar shirt, no jacket (casual)
  { id: 'shirt-open', sex: 0,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      return _torso(ctx, '#e6dfcf')
        + '<path d="M92 158 L100 172 L108 158z" fill="' + sk + '"/>'
        + '<path d="M86 156 Q92 166 99 170 L92 178 Q84 168 84 158z" fill="#f6f1e6"/>'
        + '<path d="M114 156 Q108 166 101 170 L108 178 Q116 168 116 158z" fill="#ece5d6"/>';
    }) },
  // V-neck blouse (feminine)
  { id: 'blouse-v', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#b34a7f');
      return _torso(ctx, c)
        + '<path d="M86 157 L100 184 L114 157 Q100 162 86 157z" fill="' + sk + '"/>'
        + '<path d="M84 157 L100 186 L116 157" stroke="' + _mix(c, 1.18) + '" stroke-width="3" fill="none" stroke-linejoin="round"/>';
    }) },
  // dark turtleneck
  { id: 'turtleneck', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#2f343d');
      return _torso(ctx, c)
        + '<rect x="84" y="140" width="32" height="24" rx="10" fill="' + ctx.v(_mix(c, 1.2)) + '"/>'
        + '<path d="M86 150 L114 150 M86 156 L114 156" stroke="' + _mix(c, 0.85) + '" stroke-width="1.6"/>';
    }) },
  // white dinner jacket, dark shirt, no tie
  { id: 'dinner-jacket', sex: 0,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      return _torso(ctx, '#efe8d8') + _shirtV(ctx, '#2a2e36') + _lapels(ctx, '#f7f2e6');
    }) },
  // strapless evening dress (feminine)
  { id: 'dress-strapless', sex: 1,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      return _skinTorso(ctx, skin)
        + '<path d="M44 204 L46 182 Q70 172 100 172 Q130 172 154 182 L156 204z" fill="' + ctx.v('#b3264a') + '"/>'
        + '<path d="M46 182 Q70 172 100 172 Q130 172 154 182" stroke="#e5b94e" stroke-width="2.4" fill="none"/>';
    }) },
  // rock: leather jacket, dark tee
  { id: 'leather-jacket', sex: 0,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      return _torso(ctx, '#26262c')
        + '<path d="M84 158 Q100 170 116 158 L116 204 L84 204z" fill="#3a3a42"/>'
        + _lapels(ctx, '#18181c')
        + '<path d="M78 172 L78 200 M122 172 L122 200" stroke="#9aa0aa" stroke-width="1.8"/>';
    }) },
  // hoodie
  { id: 'hoodie', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#6a7380');
      return _torso(ctx, c)
        + '<path d="M74 158 Q70 176 100 180 Q130 176 126 158 Q116 170 100 170 Q84 170 74 158z" fill="' + ctx.v(_mix(c, 1.15)) + '"/>'
        + '<path d="M94 176 L92 194 M106 176 L108 194" stroke="#eef1f4" stroke-width="2.4" stroke-linecap="round"/>'
        + '<circle cx="92" cy="196" r="2" fill="#eef1f4"/><circle cx="108" cy="196" r="2" fill="#eef1f4"/>';
    }) },
  // V-neck dress with deep neckline (feminine)
  { id: 'dress-v', sex: 1,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      return _torso(ctx, '#2e5b8a')
        + '<path d="M82 157 L100 196 L118 157 Q100 163 82 157z" fill="' + sk + '"/>'
        + '<path d="M82 158 L100 197 L118 158" stroke="#e5b94e" stroke-width="2" fill="none" stroke-linejoin="round"/>';
    }) },
  // halter dress, bare shoulders + neck strap (feminine)
  { id: 'dress-halter', sex: 1,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      return _skinTorso(ctx, skin)
        + '<path d="M54 204 L58 184 Q74 172 100 172 Q126 172 142 184 L146 204z" fill="' + ctx.v('#1f7a5c') + '"/>'
        + '<path d="M90 146 L100 174 L110 146" stroke="#1f7a5c" stroke-width="5" fill="none" stroke-linecap="round"/>';
    }) },
  // scoop-neck top + gold necklace (feminine)
  { id: 'top-necklace', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      return _torso(ctx, C('#8a3f86'))
        + '<path d="M78 158 Q100 186 122 158 Q100 164 78 158z" fill="' + sk + '"/>'
        + '<path d="M84 160 Q100 180 116 160" stroke="#e5b94e" stroke-width="2" fill="none"/>'
        + '<circle cx="100" cy="176" r="3.2" fill="#e5b94e"/>';
    }) },
  // shirt worn open at the collar (universal)
  { id: 'shirt-collar', sex: 0,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      return _torso(ctx, '#a9cbe6')
        + '<path d="M88 157 L100 184 L112 157 Q100 162 88 157z" fill="' + sk + '"/>'
        + '<path d="M86 156 Q92 170 99 178 L90 184 Q82 170 84 157z" fill="#c9e0f1"/>'
        + '<path d="M114 156 Q108 170 101 178 L110 184 Q118 170 116 157z" fill="#bcd6ec"/>'
        + '<circle cx="100" cy="192" r="1.8" fill="#6f8ca3"/>';
    }) },
  // blazer + draped scarf (universal)
  { id: 'blazer-scarf', sex: 1,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      return _torso(ctx, '#56604f')
        + _shirtV(ctx, '#e9e3d6') + _lapels(ctx, '#46503f')
        + '<path d="M84 154 Q100 166 116 154 L118 162 Q100 174 82 162z" fill="' + ctx.v('#c0703a') + '"/>'
        + '<path d="M94 166 L106 166 L110 198 L100 204 L90 198z" fill="' + ctx.v('#b0622f') + '"/>';
    }) },
  // plain tee (masculine)
  { id: 'tee', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#3d7bd6');
      return _torso(ctx, c) + _crew(ctx, sk, c);
    }) },
  // polo
  { id: 'polo', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#2e8b57');
      return _torso(ctx, c) + _collarFlaps(ctx, sk, c)
        + '<circle cx="100" cy="184" r="1.6" fill="' + _mix(c, 0.6) + '"/><circle cx="100" cy="192" r="1.6" fill="' + _mix(c, 0.6) + '"/>';
    }) },
  // plaid shirt
  { id: 'plaid', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#b0233f');
      var ln = _mix(c, 0.62), grid = '';
      for (var gx = 40; gx <= 166; gx += 14) grid += '<line x1="' + gx + '" y1="150" x2="' + gx + '" y2="206"/>';
      for (var gy = 160; gy <= 206; gy += 14) grid += '<line x1="30" y1="' + gy + '" x2="170" y2="' + gy + '"/>';
      return _torso(ctx, c)
        + '<g clip-path="' + _bodyClip(ctx) + '" stroke="' + ln + '" stroke-width="3" opacity=".55">' + grid + '</g>'
        + _collarFlaps(ctx, sk, c);
      
    }) },
  // crew-neck sweater
  { id: 'sweater-crew', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#5b6bb0');
      return _torso(ctx, c) + _crew(ctx, sk, c)
        + '<path d="M40 198 L160 198 M38 202 L162 202" stroke="' + _mix(c, 0.8) + '" stroke-width="1.4" opacity=".7"/>';
    }) },
  // denim jacket over a tee (the tee takes the colour)
  { id: 'denim-jacket', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#e8e4da');
      var dn = '#4a6fa5', st = '#c9d3e6';
      return _torso(ctx, c) + _crew(ctx, sk, c)
        + '<path d="M84 158 L58 170 L86 204 L94 176z" fill="' + ctx.v(dn) + '"/>'
        + '<path d="M116 158 L142 170 L114 204 L106 176z" fill="' + ctx.v(_mix(dn, 0.9)) + '"/>'
        + '<path d="M34 204 Q34 160 84 158 L58 170 L86 204z M166 204 Q166 160 116 158 L142 170 L114 204z" fill="' + ctx.v(dn) + '"/>'
        + '<path d="M62 172 L88 202 M138 172 L112 202" stroke="' + st + '" stroke-width="1.2" fill="none" opacity=".8"/>'
        + '<rect x="48" y="180" width="14" height="11" rx="2" fill="none" stroke="' + st + '" stroke-width="1.2"/>';
      
    }) },
  // bomber jacket over a white tee (masculine) — was a tank top,
  { id: 'bomber', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      // which read as a strapless top on the cropped torso (2.1.9-web.196)
      c = C('#4b5a3a');
      return _torso(ctx, c)
        + '<path d="M88 157 L100 174 L112 157 Q100 162 88 157z" fill="#eeeeee"/>'
        + '<path d="M78 157 Q100 172 122 157" stroke="' + _mix(c, 0.62) + '" stroke-width="7" fill="none"/>'
        + '<path d="M82 160 Q100 174 118 160" stroke="' + _mix(c, 0.82) + '" stroke-width="1.2" fill="none" stroke-dasharray="1.5 2"/>'
        + '<path d="M100 172 L100 204" stroke="#c8c8c8" stroke-width="2.6"/><path d="M100 172 L100 204" stroke="#6a6a6a" stroke-width="1" stroke-dasharray="1 2.2"/>'
        + '<circle cx="100" cy="176" r="2" fill="#9a9a9a"/>'
        + '<path d="M48 188 L64 188 M136 188 L152 188" stroke="' + _mix(c, 0.62) + '" stroke-width="3" stroke-linecap="round"/>';
    }) },
  // football jersey (vertical stripes)
  { id: 'jersey', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#1f6fd6');
      var sp = '';
      for (var sx = 46; sx <= 154; sx += 24) sp += '<rect x="' + sx + '" y="150" width="10" height="60"/>';
      return _torso(ctx, c)
        + '<g clip-path="' + _bodyClip(ctx) + '" fill="#f4f4f4" opacity=".85">' + sp + '</g>'
        + '<path d="M88 157 L100 176 L112 157 Q100 162 88 157z" fill="' + sk + '"/>'
        + '<path d="M86 156 L100 178 L114 156" stroke="#f4f4f4" stroke-width="3" fill="none" stroke-linejoin="round"/>';
      
    }) },
  // zip hoodie (light)
  { id: 'hoodie-zip', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#c9ced6');
      return _torso(ctx, c)
        + '<path d="M74 158 Q70 176 100 180 Q130 176 126 158 Q116 170 100 170 Q84 170 74 158z" fill="' + ctx.v(_mix(c, 1.1)) + '"/>'
        + '<path d="M100 178 L100 204" stroke="' + _mix(c, 0.6) + '" stroke-width="2" stroke-dasharray="2 1.5"/>'
        + '<path d="M93 176 L90 194 M107 176 L110 194" stroke="' + _mix(c, 0.7) + '" stroke-width="2" stroke-linecap="round"/>';
    }) },
  // floral blouse (feminine)
  { id: 'blouse-floral', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#e9c4d3');
      var fl = '', pts = [[52, 176], [70, 194], [88, 172], [112, 190], [132, 172], [150, 192], [60, 200], [100, 202], [140, 204]];
      pts.forEach(function (pt) {
        fl += '<circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="3.2" fill="' + _mix(c, 0.72) + '"/><circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="1.2" fill="#fff6c8"/>';
      });
      return _torso(ctx, c) + '<g clip-path="' + _bodyClip(ctx) + '">' + fl + '</g>'
        + '<path d="M84 157 Q100 174 116 157 Q100 162 84 157z" fill="' + sk + '"/>';
      
    }) },
  // strap dress (feminine)
  { id: 'dress-strap', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#d9536a');
      return _skinTorso(ctx, skin)
        + '<path d="M58 204 L62 180 Q80 172 100 174 Q120 172 138 180 L142 204z" fill="' + ctx.v(c) + '"/>'
        + '<path d="M76 160 L78 180 M124 160 L122 180" stroke="' + _mix(c, 0.85) + '" stroke-width="3" stroke-linecap="round"/>';
    }) },
  // pussy-bow blouse (feminine)
  { id: 'blouse-bow', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#f3efe6');
      return _torso(ctx, c)
        + '<path d="M86 156 Q100 166 114 156 L112 162 Q100 172 88 162z" fill="' + _mix(c, 0.9) + '"/>'
        + '<path d="M100 168 Q84 158 82 170 Q84 180 100 170 Q116 180 118 170 Q116 158 100 168z" fill="' + _mix(c, 0.82) + '"/>'
        + '<path d="M96 170 L92 196 M104 170 L108 196" stroke="' + _mix(c, 0.82) + '" stroke-width="4" stroke-linecap="round"/>'
        + '<circle cx="100" cy="169" r="3" fill="' + _mix(c, 0.7) + '"/>';
    }) },
  // tailored blazer (feminine)
  { id: 'blazer', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#3a3f5c');
      return _torso(ctx, c) + _shirtV(ctx, '#f4f0e6') + _lapels(ctx, _mix(c, 0.85))
        + '<circle cx="100" cy="198" r="2" fill="' + _mix(c, 0.6) + '"/>';
    }) },
  // cardigan over a light top (feminine)
  { id: 'cardigan', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#7a5c9a');
      return _torso(ctx, '#f4f0e6')
        + '<path d="M86 157 Q100 174 114 157 Q100 162 86 157z" fill="' + sk + '"/>'
        + '<path d="M34 204 Q34 160 90 157 L92 204z" fill="' + ctx.v(c) + '"/>'
        + '<path d="M166 204 Q166 160 110 157 L108 204z" fill="' + ctx.v(_mix(c, 0.9)) + '"/>'
        + '<circle cx="90" cy="176" r="1.8" fill="' + _mix(c, 0.6) + '"/><circle cx="90" cy="188" r="1.8" fill="' + _mix(c, 0.6) + '"/><circle cx="90" cy="200" r="1.8" fill="' + _mix(c, 0.6) + '"/>';
    }) },
  // sweatshirt (feminine)
  { id: 'sweatshirt', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#e07aa0');
      return _torso(ctx, c) + _crew(ctx, sk, c)
        + '<path d="M40 200 L160 200" stroke="' + _mix(c, 0.8) + '" stroke-width="1.6" opacity=".7"/>';
    }) },
  // one-piece swimsuit (feminine)
  { id: 'swimsuit', sex: 1, colorable: true, weight: 0.4,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#2d6aa3');
      return _skinTorso(ctx, skin)
        + '<path d="M64 204 L68 178 Q84 170 100 172 Q116 170 132 178 L136 204z" fill="' + ctx.v(c) + '"/>'
        + '<path d="M80 160 L82 178 M120 160 L118 178" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/>';
    }) },
  // scoop tee (feminine)
  { id: 'tee-scoop', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c;
      c = C('#e5b94e');
      return _torso(ctx, c)
        + '<path d="M82 157 Q100 180 118 157 Q100 163 82 157z" fill="' + sk + '"/>'
        + '<path d="M80 156 Q100 182 120 156" stroke="' + _mix(c, 0.78) + '" stroke-width="3.4" fill="none"/>';
      // 2.1.9-web.205 (narmod: poker motifs, meaner looks) — 33–42
    }) },
  // dealer vest over a white shirt, bow tie, sleeve garters (33 masculine black vest, 34 feminine burgundy vest)
  { id: 'dealer-vest', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c; var i = 33;
      var fm = i === 34; c = C(fm ? '#7a1f2e' : '#1f2126');
      var gar = fm ? '#1f1f24' : '#c0392b';
      return _torso(ctx, '#f4f0e6')
        + '<path d="M60 166 L84 158 L100 190 L116 158 L140 166 L146 204 L54 204z" fill="' + ctx.v(c) + '"/>'
        + '<path d="M100 190 L100 204" stroke="' + _mix(c, 0.7) + '" stroke-width="1.2"/><circle cx="100" cy="194" r="1.4" fill="' + _mix(c, 1.6) + '"/><circle cx="100" cy="200" r="1.4" fill="' + _mix(c, 1.6) + '"/>'
        + '<path d="M84 158 L100 190 L116 158" stroke="' + _mix(c, 0.75) + '" stroke-width="1.2" fill="none"/>'
        + _bowtie(fm ? '#1f1f24' : '#1f1f24')
        + '<path d="M37 191 L56 186 M144 186 L163 191" stroke="' + gar + '" stroke-width="5" stroke-linecap="round"/>';
      
    }) },
  // (feminine twin of the previous garment)
  { id: 'dealer-vest-f', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c; var i = 34;
      var fm = i === 34; c = C(fm ? '#7a1f2e' : '#1f2126');
      var gar = fm ? '#1f1f24' : '#c0392b';
      return _torso(ctx, '#f4f0e6')
        + '<path d="M60 166 L84 158 L100 190 L116 158 L140 166 L146 204 L54 204z" fill="' + ctx.v(c) + '"/>'
        + '<path d="M100 190 L100 204" stroke="' + _mix(c, 0.7) + '" stroke-width="1.2"/><circle cx="100" cy="194" r="1.4" fill="' + _mix(c, 1.6) + '"/><circle cx="100" cy="200" r="1.4" fill="' + _mix(c, 1.6) + '"/>'
        + '<path d="M84 158 L100 190 L116 158" stroke="' + _mix(c, 0.75) + '" stroke-width="1.2" fill="none"/>'
        + _bowtie(fm ? '#1f1f24' : '#1f1f24')
        + '<path d="M37 191 L56 186 M144 186 L163 191" stroke="' + gar + '" stroke-width="5" stroke-linecap="round"/>';
      
    }) },
  // « Royal Flush » tee: five cards fanned on the chest (35 masculine crew neck, 36 feminine scoop neck)
  { id: 'tee-royal-flush', sex: 0, colorable: true, weight: 0.6,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c; var i = 35;
      c = C('#2a2e36');
      var cards = '';
      for (var ci = 0; ci < 5; ci++) cards += '<g transform="rotate(' + ((ci - 2) * 12) + ' 100 214)">' + _card(94, 176, 12, 0, false) + '</g>';
      return _torso(ctx, c)
        + (i === 36 ? '<path d="M82 157 Q100 180 118 157 Q100 163 82 157z" fill="' + sk + '"/><path d="M80 156 Q100 182 120 156" stroke="' + _mix(c, 0.78) + '" stroke-width="3.4" fill="none"/>' : _crew(ctx, sk, c))
        + '<g clip-path="' + _bodyClip(ctx) + '">' + cards + '</g>';
      
    }) },
  // (feminine twin of the previous garment)
  { id: 'tee-royal-flush-f', sex: 1, colorable: true, weight: 0.6,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c; var i = 36;
      c = C('#2a2e36');
      var cards = '';
      for (var ci = 0; ci < 5; ci++) cards += '<g transform="rotate(' + ((ci - 2) * 12) + ' 100 214)">' + _card(94, 176, 12, 0, false) + '</g>';
      return _torso(ctx, c)
        + (i === 36 ? '<path d="M82 157 Q100 180 118 157 Q100 163 82 157z" fill="' + sk + '"/><path d="M80 156 Q100 182 120 156" stroke="' + _mix(c, 0.78) + '" stroke-width="3.4" fill="none"/>' : _crew(ctx, sk, c))
        + '<g clip-path="' + _bodyClip(ctx) + '">' + cards + '</g>';
      
    }) },
  // shirt / blouse scattered with the four suits (37 masculine open collar, 38 feminine V-neck)
  { id: 'shirt-suits', sex: 0, weight: 0.6,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c; var i = 37;
      var pat = '', sp = [[46, 176, 0], [60, 194, 1], [74, 172, 2], [72, 200, 3], [90, 190, 1], [110, 190, 0], [126, 172, 3], [128, 200, 1], [142, 194, 2], [154, 176, 0], [100, 202, 2]];
      sp.forEach(function (q) { pat += _suit(q[2], q[0], q[1], 3.2, (q[2] === 1 || q[2] === 2) ? '#c62828' : '#1f1f24'); });
      return _torso(ctx, '#f6f2ea') + '<g clip-path="' + _bodyClip(ctx) + '" opacity=".9">' + pat + '</g>'
        + (i === 38
          ? '<path d="M86 157 L100 184 L114 157 Q100 162 86 157z" fill="' + sk + '"/><path d="M84 157 L100 186 L116 157" stroke="#e4ded2" stroke-width="3" fill="none" stroke-linejoin="round"/>'
          : '<path d="M92 158 L100 172 L108 158z" fill="' + sk + '"/><path d="M86 156 Q92 166 99 170 L92 178 Q84 168 84 158z" fill="#fbf8f2"/><path d="M114 156 Q108 166 101 170 L108 178 Q116 168 116 158z" fill="#efeae0"/>');
      
    }) },
  // (feminine twin of the previous garment)
  { id: 'blouse-suits', sex: 1, weight: 0.6,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c; var i = 38;
      var pat = '', sp = [[46, 176, 0], [60, 194, 1], [74, 172, 2], [72, 200, 3], [90, 190, 1], [110, 190, 0], [126, 172, 3], [128, 200, 1], [142, 194, 2], [154, 176, 0], [100, 202, 2]];
      sp.forEach(function (q) { pat += _suit(q[2], q[0], q[1], 3.2, (q[2] === 1 || q[2] === 2) ? '#c62828' : '#1f1f24'); });
      return _torso(ctx, '#f6f2ea') + '<g clip-path="' + _bodyClip(ctx) + '" opacity=".9">' + pat + '</g>'
        + (i === 38
          ? '<path d="M86 157 L100 184 L114 157 Q100 162 86 157z" fill="' + sk + '"/><path d="M84 157 L100 186 L116 157" stroke="#e4ded2" stroke-width="3" fill="none" stroke-linejoin="round"/>'
          : '<path d="M92 158 L100 172 L108 158z" fill="' + sk + '"/><path d="M86 156 Q92 166 99 170 L92 178 Q84 168 84 158z" fill="#fbf8f2"/><path d="M114 156 Q108 166 101 170 L108 178 Q116 168 116 158z" fill="#efeae0"/>');
      
    }) },
  // pinstripe suit (39 masculine, red tie + pocket square; 40 feminine blazer, deeper V, pocket square)
  { id: 'pinstripe', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c; var i = 39;
      c = C('#23242b');
      var st = '';
      for (var px = 40; px <= 160; px += 7) st += '<line x1="' + px + '" y1="150" x2="' + px + '" y2="206"/>';
      return _torso(ctx, c) + '<g clip-path="' + _bodyClip(ctx) + '" stroke="' + _mix(c, 1.9) + '" stroke-width=".8" opacity=".55">' + st + '</g>'
        + (i === 40 ? '<path d="M84 158 L100 200 L116 158 Q100 166 84 158z" fill="' + ctx.v('#f4f0e6') + '"/>' : _shirtV(ctx, '#f4f0e6'))
        + _lapels(ctx, _mix(c, 0.82))
        + (i === 39 ? _tie('#a8262f') : '')
        + '<path d="M126 182 L138 180 L136 186z" fill="' + (i === 39 ? '#f4f0e6' : '#c0392b') + '"/>';
      
    }) },
  // (feminine twin of the previous garment)
  { id: 'pinstripe-f', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c; var i = 40;
      c = C('#23242b');
      var st = '';
      for (var px = 40; px <= 160; px += 7) st += '<line x1="' + px + '" y1="150" x2="' + px + '" y2="206"/>';
      return _torso(ctx, c) + '<g clip-path="' + _bodyClip(ctx) + '" stroke="' + _mix(c, 1.9) + '" stroke-width=".8" opacity=".55">' + st + '</g>'
        + (i === 40 ? '<path d="M84 158 L100 200 L116 158 Q100 166 84 158z" fill="' + ctx.v('#f4f0e6') + '"/>' : _shirtV(ctx, '#f4f0e6'))
        + _lapels(ctx, _mix(c, 0.82))
        + (i === 39 ? _tie('#a8262f') : '')
        + '<path d="M126 182 L138 180 L136 186z" fill="' + (i === 39 ? '#f4f0e6' : '#c0392b') + '"/>';
      
    }) },
  // biker leather vest with a spade patch over a tee (41 masculine, 42 feminine tank)
  { id: 'biker-vest', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c; var i = 41;
      c = C(i === 42 ? '#b3264a' : '#3a3a42');
      var lv = '#1c1c20';
      return _torso(ctx, c)
        + (i === 42 ? '<path d="M82 157 Q100 178 118 157 Q100 163 82 157z" fill="' + sk + '"/>' : _crew(ctx, sk, c))
        + '<path d="M34 204 Q34 160 88 157 L90 204z" fill="' + ctx.v(lv) + '"/>'
        + '<path d="M166 204 Q166 160 112 157 L110 204z" fill="' + ctx.v(_mix(lv, 0.9)) + '"/>'
        + '<path d="M88 157 L90 204 M112 157 L110 204" stroke="#3c3c44" stroke-width="1.2"/>'
        + '<circle cx="64" cy="186" r="8" fill="#101014" stroke="#e5e1d8" stroke-width="1.4"/>' + _suit(0, 64, 186, 4.6, '#f2eee6');
      
    }) },
  // (feminine twin of the previous garment)
  { id: 'biker-vest-f', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c; var i = 42;
      c = C(i === 42 ? '#b3264a' : '#3a3a42');
      var lv = '#1c1c20';
      return _torso(ctx, c)
        + (i === 42 ? '<path d="M82 157 Q100 178 118 157 Q100 163 82 157z" fill="' + sk + '"/>' : _crew(ctx, sk, c))
        + '<path d="M34 204 Q34 160 88 157 L90 204z" fill="' + ctx.v(lv) + '"/>'
        + '<path d="M166 204 Q166 160 112 157 L110 204z" fill="' + ctx.v(_mix(lv, 0.9)) + '"/>'
        + '<path d="M88 157 L90 204 M112 157 L110 204" stroke="#3c3c44" stroke-width="1.2"/>'
        + '<circle cx="64" cy="186" r="8" fill="#101014" stroke="#e5e1d8" stroke-width="1.4"/>' + _suit(0, 64, 186, 4.6, '#f2eee6');
      
    }) },
  // ── 2.1.9-web.211 (starter characters, lot 2) — trench coat, cape, breton, chef's jacket, sequin dress, tracksuit + chain, boxing robe
  { id: 'trench', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C) { return trench(ctx, C('#c8b48a')); }) },
  { id: 'trench-f', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C) { return trench(ctx, C('#c8b48a')); }) },
  { id: 'cape', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C) { return cape(ctx, sk, C('#1f1f24')); }) },
  { id: 'cape-f', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C) { return cape(ctx, sk, C('#1f1f24')); }) },
  { id: 'breton', sex: 0,
    draw: outfitDraw(function (ctx, sk) { return breton(ctx, sk, false); }) },
  { id: 'breton-f', sex: 1,
    draw: outfitDraw(function (ctx, sk) { return breton(ctx, sk, true); }) },
  { id: 'chef-jacket', sex: 0,
    draw: outfitDraw(function (ctx, sk) { return chefJacket(ctx, sk); }) },
  { id: 'chef-jacket-f', sex: 1,
    draw: outfitDraw(function (ctx, sk) { return chefJacket(ctx, sk); }) },
  { id: 'sequin-dress', sex: 1, colorable: true,
    draw: outfitDraw(function (ctx, sk, C, skin) {
      var c = C('#2e1a5c'), sp = '';
      [[62, 186], [74, 198], [86, 180], [98, 194], [110, 182], [122, 198], [134, 186], [70, 176], [130, 176], [100, 178], [90, 202], [116, 200]].forEach(function (q) { sp += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.4" fill="#fff" opacity=".8"/>'; });
      return _skinTorso(ctx, skin)
        + '<path d="M44 204 L46 182 Q70 172 100 172 Q130 172 154 182 L156 204z" fill="' + ctx.v(c) + '"/>' + sp
        + '<path d="M46 182 Q70 172 100 172 Q130 172 154 182" stroke="' + _mix(c, 1.6) + '" stroke-width="1.6" fill="none" opacity=".8"/>';
    }) },
  { id: 'tracksuit-chain', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C) {
      var c = C('#1f1f24');
      return _torso(ctx, c)
        + '<path d="M42 172 L38 204 M158 172 L162 204" stroke="#f4f0e6" stroke-width="3"/><path d="M47 170 L43 204 M153 170 L157 204" stroke="#f4f0e6" stroke-width="1.6"/>'
        + '<path d="M84 158 Q100 170 116 158 L116 164 Q100 176 84 164z" fill="' + _mix(c, 1.35) + '"/>'
        + '<path d="M100 172 L100 204" stroke="' + _mix(c, 1.8) + '" stroke-width="1.6" stroke-dasharray="2 1.6"/>'
        + '<path d="M84 160 Q100 192 116 160" stroke="#e0b23c" stroke-width="3" fill="none"/>' + _suit(0, 100, 190, 4.6, '#e0b23c');
    }) },
  { id: 'boxing-robe', sex: 0, colorable: true,
    draw: outfitDraw(function (ctx, sk, C) {
      var c = C('#b3264a');
      return _torso(ctx, c)
        + '<path d="M84 158 L100 200 L116 158 Q100 166 84 158z" fill="' + sk + '"/>'
        + _lapels(ctx, _mix(c, 0.72))
        + '<path d="M34 196 L166 196" stroke="#f4f0e6" stroke-width="6"/><path d="M96 194 L104 194 L102 204 L98 204z" fill="#f4f0e6"/>';
    }) },
  // 2.1.9-web.215 — starter characters, lot 3 (fun): hawaiian shirt, clown suit, Vegas jumpsuit
  { id: 'hawaiian', sex: 0, weight: 0.6,
    draw: outfitDraw(function (ctx, sk) { return hawaiian(ctx, sk); }) },
  { id: 'hawaiian-f', sex: 1, weight: 0.6,
    draw: outfitDraw(function (ctx, sk) { return hawaiian(ctx, sk); }) },
  { id: 'clown-suit', sex: 0, weight: 0.3,
    draw: outfitDraw(function (ctx, sk) { return clownSuit(ctx, sk); }) },
  { id: 'clown-suit-f', sex: 1, weight: 0.3,
    draw: outfitDraw(function (ctx, sk) { return clownSuit(ctx, sk); }) },
  { id: 'vegas-jumpsuit', sex: 0, weight: 0.3,
    draw: outfitDraw(function (ctx, sk) { // white, deep V, huge collar edged with rhinestones, gold belt
      var st = '';
      [[74, 150], [78, 142], [84, 136], [126, 150], [122, 142], [116, 136], [88, 168], [112, 168], [92, 178], [108, 178], [96, 188], [104, 188]].forEach(function (q) { st += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.5" fill="#e0b23c"/>'; });
      return _torso(ctx, '#f6f3ee')
        + '<path d="M88 157 L100 190 L112 157 Q100 164 88 157z" fill="' + sk + '"/>'
        + '<path d="M86 158 L100 190 L74 204 L34 204 L34 196z M114 158 L100 190 L126 204 L166 204 L166 196z" fill="' + ctx.v('#fbfaf7') + '"/>'
        + '<path d="M88 157 Q76 152 70 130 L94 154z M112 157 Q124 152 130 130 L106 154z" fill="' + ctx.v('#fbfaf7') + '"/>'
        + '<path d="M70 130 Q76 152 88 157 M130 130 Q124 152 112 157 M86 158 L100 190 L114 158" stroke="#e0b23c" stroke-width="1.4" fill="none"/>' + st
        + '<rect x="34" y="196" width="132" height="8" fill="#e0b23c"/><rect x="90" y="193" width="20" height="12" rx="2" fill="#c9992e"/><rect x="94" y="196" width="12" height="6" rx="1" fill="#e6c76a"/>';
    }) }
];

function trench(ctx, c) { // double-breasted, belted, dark shirt
  return _torso(ctx, c) + _shirtV(ctx, '#3a3f47') + _lapels(ctx, _mix(c, 0.9))
    + '<circle cx="88" cy="184" r="1.8" fill="' + _mix(c, 0.55) + '"/><circle cx="112" cy="184" r="1.8" fill="' + _mix(c, 0.55) + '"/>'
    + '<rect x="34" y="194" width="132" height="6" fill="' + _mix(c, 0.72) + '"/><rect x="96" y="193" width="8" height="8" fill="' + _mix(c, 0.5) + '"/>';
}
function cape(ctx, sk, c) { // high collar rising beside the neck, red lining
  return _torso(ctx, c)
    + '<path d="M84 158 L100 204 L116 158 Q100 166 84 158z" fill="' + ctx.v('#8e1c2e') + '"/>'
    + '<path d="M82 157 Q70 150 62 128 L86 154z M118 157 Q130 150 138 128 L114 154z" fill="' + ctx.v(_mix(c, 1.25)) + '"/>'
    + '<path d="M62 128 Q70 150 82 157 M138 128 Q130 150 118 157" stroke="#8e1c2e" stroke-width="2" fill="none"/>'
    + '<circle cx="100" cy="166" r="2.6" fill="#e0b23c"/>';
}
function breton(ctx, sk, fem) { // white with navy stripes
  var st = '';
  for (var y = 166; y <= 204; y += 9) st += '<line x1="30" y1="' + y + '" x2="170" y2="' + y + '"/>';
  return _torso(ctx, '#f4f0e6') + '<g clip-path="' + _bodyClip(ctx) + '" stroke="#1f2f4a" stroke-width="4">' + st + '</g>'
    + (fem ? '<path d="M82 157 Q100 180 118 157 Q100 163 82 157z" fill="' + sk + '"/><path d="M80 156 Q100 182 120 156" stroke="#1f2f4a" stroke-width="3.4" fill="none"/>' : _crew(ctx, sk, '#f4f0e6'));
}
function hibiscus(x, y, s, col) { // five round petals + a yellow heart
  var d = '';
  for (var i = 0; i < 5; i++) { var a = i * 1.2566 - 1.5708; d += '<circle cx="' + (x + Math.cos(a) * s).toFixed(1) + '" cy="' + (y + Math.sin(a) * s).toFixed(1) + '" r="' + (s * 0.8).toFixed(1) + '" fill="' + col + '"/>'; }
  return d + '<circle cx="' + x + '" cy="' + y + '" r="' + (s * 0.45).toFixed(1) + '" fill="#ffd54a"/>';
}
function hawaiian(ctx, sk) { // teal shirt, hibiscus print, open collar
  var c = '#2a7f9e', fl = '';
  [[52, 180], [60, 202], [88, 172], [102, 196], [128, 178], [148, 200], [156, 178]].forEach(function (q, i) { fl += hibiscus(q[0], q[1], 4.2, i % 2 ? '#fff' : '#ff7f50'); });
  fl += '<g fill="#1d5f4a" opacity=".85"><ellipse cx="72" cy="190" rx="6" ry="2.6" transform="rotate(-30 72 190)"/><ellipse cx="116" cy="184" rx="6" ry="2.6" transform="rotate(25 116 184)"/><ellipse cx="140" cy="194" rx="6" ry="2.6" transform="rotate(-40 140 194)"/><ellipse cx="82" cy="204" rx="6" ry="2.6" transform="rotate(20 82 204)"/></g>';
  return _torso(ctx, c) + '<g clip-path="' + _bodyClip(ctx) + '">' + fl + '</g>' + _collarFlaps(ctx, sk, c);
}
function clownSuit(ctx, sk) { // yellow with big polka dots, ruffled collar, a giant red bow tie, pompom buttons
  var c = '#f2c230', dots = '', cols = ['#2d6aa3', '#e0312c', '#2e8b57', '#8e44ad'];
  [[50, 176], [64, 198], [80, 178], [120, 178], [136, 198], [150, 176], [100, 204], [72, 204], [128, 204]].forEach(function (q, i) { dots += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="4.2" fill="' + cols[i % 4] + '"/>'; });
  return _torso(ctx, c) + '<g clip-path="' + _bodyClip(ctx) + '">' + dots + '</g>'
    + '<path d="M78 156 Q100 176 122 156" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>'
    + '<path d="M100 172 l-26 -13 0 26z M100 172 l26 -13 0 26z" fill="#e0312c"/>'
    + '<g fill="#fff" opacity=".85"><circle cx="82" cy="166" r="1.8"/><circle cx="88" cy="178" r="1.8"/><circle cx="118" cy="166" r="1.8"/><circle cx="112" cy="178" r="1.8"/></g>'
    + '<circle cx="100" cy="172" r="5.5" fill="#b8241f"/>'
    + '<circle cx="100" cy="190" r="4" fill="#2d6aa3"/><circle cx="100" cy="201" r="4" fill="#2e8b57"/>';
}
function chefJacket(ctx, sk) { // white, stand collar, two rows of buttons
  return _torso(ctx, '#f6f2ea')
    + '<path d="M84 156 Q100 166 116 156 L116 163 Q100 173 84 163z" fill="#e4ded2"/>'
    + '<path d="M100 172 L100 204" stroke="#d8d2c4" stroke-width="1.2"/>'
    + '<circle cx="91" cy="176" r="1.9" fill="#c9c2b4"/><circle cx="91" cy="188" r="1.9" fill="#c9c2b4"/><circle cx="91" cy="200" r="1.9" fill="#c9c2b4"/>'
    + '<circle cx="109" cy="176" r="1.9" fill="#c9c2b4"/><circle cx="109" cy="188" r="1.9" fill="#c9c2b4"/><circle cx="109" cy="200" r="1.9" fill="#c9c2b4"/>';
}
export { OUTFITS };
