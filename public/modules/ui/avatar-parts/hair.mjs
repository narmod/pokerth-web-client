// Avatar parts — hairstyles (2.1.9-web.209).
//
// One object per style. draw is wrapped by hairDraw: fn(ctx, f, dk, bk, hl,
// P, hc, face) returns [back, front, scalp] — the back layer sits behind
// the head and body, the front over the forehead, the scalp (optional)
// inside the head outline. Flags: sex (0 masculine / 1 feminine — every
// style belongs to one silhouette), weight (dice), underlay:false for
// styles drawn without the temple underlay (bald, balding, mohawk, buzz,
// flat top), short:true for styles that show only a thin band under a hat,
// noHat:true for tall styles that fit under no hat, noHatDice:true for a
// style the dice never pairs with a hat.
//
// Adding a style: append an object with a new id (ids are stable — they
// are what saved portraits store), pick its silhouette, draw for the ±53
// oval (the engine warps it to every outline). No other file to touch.

'use strict';
import { _mix, _dots, _bumps, _braid, _shine, CAP_SMOOTH, CAP_MID, CAP_SIDE, _headD, hairDraw } from './helpers.mjs';

const HAIR = [
  // bald: just a shine on the scalp
  { id: 'bald', sex: 0, weight: 0.35, underlay: false,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', '<ellipse cx="84" cy="50" rx="14" ry="7" fill="#fff" opacity=".35"/>'];
    }) },
  // short
  { id: 'short', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M44 94 Q38 26 100 24 Q162 26 156 94 Q154 74 146 66 Q136 70 126 62 Q114 70 100 62 Q86 70 74 62 Q64 70 54 66 Q46 74 44 94z') + _shine(hl)];
    }) },
  // slicked back
  { id: 'slicked', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M46 88 Q42 24 100 22 Q158 24 154 88 Q152 60 138 52 Q100 42 62 52 Q48 60 46 88z')
        + '<path d="M70 40 Q100 30 130 40 M66 48 Q100 36 134 48" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>' + _shine(hl)];
    }) },
  // high ponytail
  { id: 'ponytail-high', sex: 1, noHatDice: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M112 30 Q152 4 172 30 Q188 62 166 112 Q160 126 150 130 Q166 84 140 44z', bk),
        P(CAP_SMOOTH) + '<circle cx="128" cy="30" r="8" fill="#d9536a"/>' + _shine(hl)];
    }) },
  // curly
  { id: 'curly', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P(CAP_SMOOTH) + _bumps(100, 84, 50, 190, 350, 11, 12, f) + _bumps(100, 84, 50, 200, 340, 6, 4, hl)];
    }) },
  // mid-length bob
  { id: 'bob', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M38 100 Q34 24 100 22 Q166 24 162 100 L164 140 Q150 150 136 142 L64 142 Q50 150 36 140z', bk),
        P(CAP_SIDE) + _shine(hl)];
    }) },
  // 6: wavy senior sweep
  { id: 'senior-sweep', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M46 90 Q40 28 100 24 Q156 26 156 88 Q150 62 132 56 Q126 64 112 58 Q96 70 80 56 Q66 64 56 60 Q48 70 46 90z') + _shine(hl)];
    }) },
  // bun
  { id: 'bun', sex: 1, noHat: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', '<circle cx="100" cy="28" r="17" fill="' + f + '"/>' + P(CAP_SMOOTH)
        + '<path d="M86 38 Q100 32 114 38" stroke="#d9536a" stroke-width="4" stroke-linecap="round" fill="none"/>' + _shine(hl)];
    }) },
  // long, middle part
  { id: 'long-middle', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L166 184 Q146 192 132 178 L68 178 Q54 192 34 184z', bk),
        P(CAP_MID) + _shine(hl)];
    }) },
  // undercut: tight sides, volume swept on top
  { id: 'undercut', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M46 92 Q44 60 58 50 L142 50 Q156 60 154 92 Q150 72 140 66 L60 66 Q50 72 46 92z', dk)
        + P('M52 64 Q44 18 104 16 Q152 16 162 44 Q146 40 140 54 Q112 50 88 64 Q70 58 52 64z') + _shine(hl)];
    }) },
  // afro
  { id: 'afro', sex: 0, weight: 0.6, noHat: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['<circle cx="100" cy="76" r="64" fill="' + f + '"/>',
        P('M42 92 Q36 24 100 18 Q164 24 158 92 Q150 64 100 58 Q50 64 42 92z')
        + _bumps(100, 76, 54, 200, 340, 9, 5, hl).replace(/fill=/g, 'opacity=".25" fill=')];
    }) },
  // side braid over the shoulder
  { id: 'side-braid', sex: 1, weight: 0.6,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      // The braid comes out from behind the ear (back layer) and its lower
      // part lies over the shoulder (same beads redrawn in the front layer).
      return [_braid(50, 100, 46, 190, 8, f, dk), P(CAP_SIDE) + _braid(50, 100, 46, 190, 8, f, dk, 150) + _shine(hl)];
    }) },
  // pixie cut with fringe
  { id: 'pixie', sex: 1, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M44 90 Q40 26 100 24 Q160 26 156 86 Q152 70 146 66 Q120 52 70 74 Q62 64 52 68 Q46 78 44 90z') + _shine(hl)];
    }) },
  // tight curls, close cut
  { id: 'close-curls', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M46 86 Q44 32 100 30 Q156 32 154 86 Q150 64 100 58 Q50 64 46 86z')
        + _bumps(100, 80, 40, 200, 340, 9, 2.2, dk) + _bumps(100, 80, 30, 215, 325, 6, 2.2, dk)];
    }) },
  // long wavy
  { id: 'long-wavy', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M40 96 Q34 24 100 22 Q166 24 160 96 Q170 116 160 136 Q172 158 162 186 Q146 192 132 178 L68 178 Q54 192 38 186 Q28 158 40 136 Q30 116 40 96z', bk),
        P(CAP_SIDE) + _shine(hl)];
    }) },
  // dreadlocks (masculine): twists radiating from the crown, locks of uneven length down both sides, each with its knotted texture (2.1.9-web.198)
  { id: 'dreadlocks', sex: 0, weight: 0.5,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      var locks = '', tw = '';
      [[40, 74], [50, 96], [60, 88], [70, 70], [130, 70], [140, 88], [150, 96], [160, 74]].forEach(function (p, k) {
        locks += '<rect x="' + (p[0] - 5) + '" y="72" width="10" height="' + p[1] + '" rx="5" fill="' + (k % 2 ? bk : f) + '"/>'
          + '<path d="M' + p[0] + ' 84 L' + p[0] + ' ' + (62 + p[1]) + '" stroke="' + dk + '" stroke-width="1.4" stroke-dasharray="2.5 3.5" opacity=".7"/>';
      });
      for (var ta = 196; ta <= 344; ta += 18.5) {
        var ang = ta * Math.PI / 180;
        tw += '<path d="M100 62 Q' + (100 + 28 * Math.cos(ang)).toFixed(1) + ' ' + (74 + 20 * Math.sin(ang)).toFixed(1) + ' ' + (100 + 53 * Math.cos(ang)).toFixed(1) + ' ' + (86 + 48 * Math.sin(ang)).toFixed(1) + '" stroke="' + dk + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      }
      return [locks, P('M44 96 Q40 24 100 22 Q160 24 156 96 Q152 62 100 56 Q48 62 44 96z') + tw + _bumps(100, 84, 50, 205, 335, 6, 3.4, hl).replace(/fill=/g, 'opacity=".45" fill=')];
      
    }) },
  // balding crown (masculine): a crown of hair hugging the head outline
  { id: 'balding', sex: 0, weight: 0.4, underlay: false, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      var band = ctx.cid + 'bb';
      if (!ctx.seenClip) ctx.seenClip = {};
      if (!ctx.seenClip[band]) {
        ctx.seenClip[band] = 1;
        ctx.defs.push('<clipPath id="' + band + '"><path d="M0 68 Q30 58 60 70 L60 104 Q54 114 0 112z M200 68 Q170 58 140 70 L140 104 Q146 114 200 112z"/></clipPath>');
      }
      // Back: the hair round the back of the head peeks out on both sides
      // (the head outline itself, grown, so it hugs every face); the crown
      // keeps its shine. (The former temple tufts read as blocks beside
      // the wider masculine outlines — gone in 2.1.9-web.195.)
      return ['<g data-fit="1" clip-path="url(#' + band + ')"><path d="' + _headD(face || 0) + '" fill="' + f + '" transform="translate(100,94) scale(1.14,1.1) translate(-100,-94)"/></g>',
        '<ellipse cx="84" cy="48" rx="14" ry="7" fill="#fff" opacity=".35"/>'];
      
    }) },
  // mohawk crest
  { id: 'mohawk', sex: 0, weight: 0.2, underlay: false, noHat: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M86 62 L80 36 L90 40 L92 12 L100 26 L108 12 L110 40 L120 36 L114 62z'),
        '<path d="M0 0 L200 0 L200 96 Q152 62 100 56 Q48 62 0 96z" fill="' + hc[0] + '" opacity=".4"/>'];
    }) },
  // tousled mid-length (surfer)
  { id: 'surfer', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M40 96 Q36 26 100 24 Q164 26 160 96 Q164 116 152 126 Q148 112 142 104 L58 104 Q52 112 48 126 Q36 116 40 96z', bk),
        P('M42 100 Q34 22 100 20 Q166 22 158 100 L150 64 L140 68 L132 54 L118 64 L106 50 L94 64 L80 52 L70 66 L58 58 L50 76z') + _shine(hl)];
    }) },
  // pigtails (feminine)
  { id: 'pigtails', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      // Pigtails hang BEHIND the head and the ears (back layer): only the
      // part outside the head outline shows, so they hug the cheeks.
      return [P('M58 74 Q22 84 24 136 Q26 172 42 178 Q58 172 56 130z', bk) + P('M142 74 Q178 84 176 136 Q174 172 158 178 Q142 172 144 130z', bk),
        P(CAP_MID) + '<circle cx="40" cy="86" r="5" fill="#d9536a"/><circle cx="160" cy="86" r="5" fill="#d9536a"/>' + _shine(hl)];
    }) },
  // thin box braids
  { id: 'box-braids', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      var lines = '';
      for (var x = 42; x <= 158; x += 8) if (x < 70 || x > 130) lines += '<path d="M' + x + ' 80 L' + (x + (x < 100 ? -4 : 4)) + ' 188" stroke="' + dk + '" stroke-width="1.6"/>';
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L168 190 L32 190z', bk) + lines, P(CAP_MID)];
      
    }) },
  // elegant low side bun + face-framing strands
  { id: 'side-bun', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['<circle cx="150" cy="132" r="17" fill="' + bk + '"/>',
        P(CAP_SIDE) + '<path d="M52 78 Q42 112 56 136 M148 78 Q158 112 144 136" stroke="' + f + '" stroke-width="5" fill="none" stroke-linecap="round"/>' + _shine(hl)];
    }) },
  // sleek asymmetric long bob, deep side part
  { id: 'asym-bob', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M38 100 Q34 24 100 22 Q166 24 162 100 L164 128 L136 130 L64 150 L36 152z', bk),
        P('M40 120 Q34 24 100 22 Q160 24 156 96 Q150 64 130 54 Q94 56 72 70 Q56 90 58 140z') + _shine(hl)];
    }) },
  // long voluminous curls
  { id: 'big-curls', sex: 1, weight: 0.6,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M36 96 Q32 22 100 20 Q168 22 164 96 L168 180 L32 180z', bk)
        + [100, 124, 148, 172].map(function (y) { return '<circle cx="32" cy="' + y + '" r="12" fill="' + bk + '"/><circle cx="168" cy="' + y + '" r="12" fill="' + bk + '"/>'; }).join(''),
        P(CAP_SIDE) + _bumps(100, 84, 50, 195, 250, 4, 10, f)];
    }) },
  // low ponytail swept over one shoulder
  { id: 'ponytail-low', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P(CAP_SMOOTH) + P('M146 104 Q176 118 168 190 Q158 198 150 188 Q160 150 142 134 Q150 120 146 104z')
        + '<circle cx="150" cy="112" r="5" fill="#d9536a"/>' + _shine(hl)];
    }) },
  // vintage hollywood waves
  { id: 'hollywood', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M40 100 Q36 24 100 22 Q164 24 160 100 Q168 118 158 136 L142 140 L58 140 L42 136 Q32 118 40 100z', bk),
        P('M42 108 Q36 24 100 22 Q160 24 156 96 Q150 64 128 56 Q108 62 96 52 Q82 68 64 64 Q50 78 58 104 Q44 112 42 108z')
        + '<path d="M60 70 Q72 58 86 66 M112 58 Q126 50 140 62" stroke="' + hl + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>'];
    }) },
  // side part (masculine)
  { id: 'side-part', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M44 96 Q40 26 100 24 Q160 26 156 96 Q152 62 140 56 Q116 52 96 60 Q80 52 60 66 Q48 74 44 96z')
        + '<path d="M70 54 Q78 42 96 38" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>' + _shine(hl)];
    }) },
  // mid-length, tucked behind the ears (masculine)
  { id: 'mid-tucked', sex: 0,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M40 96 Q36 26 100 24 Q164 26 160 96 L162 150 Q150 158 138 148 L62 148 Q50 158 38 150z', bk),
        P('M44 100 Q40 26 100 24 Q160 26 156 100 Q152 62 130 56 Q104 66 88 50 Q76 66 54 70 Q46 82 44 100z') + _shine(hl)];
    }) },
  // ponytail (masculine): slicked back + a low tail
  { id: 'ponytail-m', sex: 0, weight: 0.5,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M136 108 Q170 122 160 176 Q150 184 144 176 Q152 146 132 122z', bk),
        P('M46 88 Q42 24 100 22 Q158 24 154 88 Q152 60 138 52 Q100 42 62 52 Q48 60 46 88z')
        + '<path d="M70 40 Q100 30 130 40" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
        + '<circle cx="138" cy="118" r="4.5" fill="' + dk + '"/>' + _shine(hl)];
    }) },
  // buzz cut (masculine): a shadow of hair on the scalp
  { id: 'buzz', sex: 0, weight: 0.5, underlay: false, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', '', '<path d="M0 0 L200 0 L200 100 Q152 62 100 56 Q48 62 0 100z" fill="' + hc[0] + '" opacity=".55"/>'];
    }) },
  // long curly (masculine): a wavy mass to the shoulders, curls along its edge (no side sausages: 2.1.9-web.201)
  { id: 'long-curly-m', sex: 0, weight: 0.5,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M38 96 Q34 22 100 20 Q166 22 162 96 Q168 118 160 134 Q170 152 158 164 Q142 170 134 160 L66 160 Q58 170 42 164 Q30 152 40 134 Q32 118 38 96z', bk)
        + '<circle cx="46" cy="164" r="9" fill="' + bk + '"/><circle cx="62" cy="168" r="8" fill="' + bk + '"/><circle cx="154" cy="164" r="9" fill="' + bk + '"/><circle cx="138" cy="168" r="8" fill="' + bk + '"/>'
        + '<path d="M44 120 Q38 134 46 148 M156 120 Q162 134 154 148" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>',
        P(CAP_SMOOTH) + _bumps(100, 84, 50, 190, 350, 11, 12, f) + _bumps(100, 84, 50, 200, 340, 6, 4, hl)];
    }) },
  // curtain fringe (masculine)
  { id: 'curtain', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M44 100 Q40 26 100 24 Q160 26 156 100 Q150 70 128 88 Q116 66 100 58 Q84 66 72 88 Q50 70 44 100z') + _shine(hl)];
    }) },
  // short bob, chin length (feminine)
  { id: 'short-bob', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M40 100 Q36 24 100 22 Q164 24 160 100 L162 124 Q150 134 138 126 L62 126 Q50 134 38 124z', bk),
        P(CAP_SIDE) + _shine(hl)];
    }) },
  // crown braid (feminine)
  { id: 'crown-braid', sex: 1, weight: 0.6, noHat: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P(CAP_SMOOTH) + _bumps(100, 84, 52, 200, 340, 12, 6, f)
        + _bumps(100, 84, 52, 200, 340, 12, 6, f).replace(/fill="[^"]*"/g, 'fill="none" stroke="' + dk + '" stroke-width="1.2"') + _shine(hl)];
    }) },
  // straight fringe, long hair (feminine)
  { id: 'fringe-long', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L164 184 Q146 192 132 178 L68 178 Q54 192 36 184z', bk),
        P('M44 100 Q40 26 100 24 Q160 26 156 100 L154 78 L46 78z') + _shine(hl)];
    }) },
  // very long straight hair (feminine)
  { id: 'very-long', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L168 204 L32 204z', bk), P(CAP_MID) + _shine(hl)];
    }) },
  // cropped (feminine)
  { id: 'cropped', sex: 1, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M46 88 Q42 28 100 26 Q158 28 154 88 Q150 64 134 58 Q112 66 96 54 Q80 66 66 60 Q50 66 46 88z') + _shine(hl)];
    }) },
  // messy high bun + loose strands (feminine)
  { id: 'messy-bun', sex: 1, noHat: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', '<circle cx="100" cy="24" r="17" fill="' + f + '"/>'
        + '<path d="M86 14 Q90 6 98 10 M104 8 Q112 6 114 14" stroke="' + f + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
        + P(CAP_SMOOTH)
        + '<path d="M52 76 Q40 100 50 128 M148 76 Q160 100 150 128" stroke="' + f + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
        + '<path d="M86 38 Q100 32 114 38" stroke="#d9536a" stroke-width="4" stroke-linecap="round" fill="none"/>' + _shine(hl)];
    }) },
  // long locs (feminine): twists from the crown, rounded locks of uneven length down to the chest
  { id: 'locs', sex: 1, weight: 0.6,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      var locks2 = '', tw2 = '';
      [[36, 118], [46, 132], [56, 124], [66, 110], [76, 100], [124, 100], [134, 110], [144, 124], [154, 132], [164, 118]].forEach(function (p, k) {
        locks2 += '<rect x="' + (p[0] - 5.5) + '" y="70" width="11" height="' + p[1] + '" rx="5.5" fill="' + (k % 2 ? bk : f) + '"/>'
          + '<path d="M' + p[0] + ' 84 L' + p[0] + ' ' + (60 + p[1]) + '" stroke="' + dk + '" stroke-width="1.4" stroke-dasharray="2.5 3.5" opacity=".6"/>';
      });
      for (var ta2 = 196; ta2 <= 344; ta2 += 18.5) {
        var ang2 = ta2 * Math.PI / 180;
        tw2 += '<path d="M100 62 Q' + (100 + 28 * Math.cos(ang2)).toFixed(1) + ' ' + (74 + 20 * Math.sin(ang2)).toFixed(1) + ' ' + (100 + 53 * Math.cos(ang2)).toFixed(1) + ' ' + (86 + 48 * Math.sin(ang2)).toFixed(1) + '" stroke="' + dk + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      }
      return [locks2, P('M44 96 Q40 24 100 22 Q160 24 156 96 Q152 62 100 56 Q48 62 44 96z') + tw2 + _bumps(100, 84, 50, 205, 335, 6, 3.4, hl).replace(/fill=/g, 'opacity=".45" fill=')];
      
    }) },
  // short voluminous curls (masculine): a tall mop of curls of uneven size, cut above the ears
  { id: 'curls-m', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M40 90 Q36 18 100 14 Q164 18 160 90 Q152 62 100 56 Q48 62 40 90z')
        + _dots([[50, 72, 11], [58, 52, 12], [72, 36, 13], [90, 26, 12], [110, 24, 13], [128, 32, 12], [142, 46, 13], [152, 66, 11], [68, 62, 9], [86, 46, 10], [106, 40, 9], [124, 48, 10], [138, 64, 9]], f)
        + _dots([[74, 32, 3.5], [110, 20, 3.5], [144, 44, 3.5], [58, 50, 3]], hl, ' opacity=".5"')];
    }) },
  // pompadour (masculine): a high front swept back, combed sides
  { id: 'pompadour', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M46 90 Q42 34 60 26 Q76 6 112 8 Q146 14 154 90 Q152 60 138 52 Q100 44 62 52 Q48 60 46 90z')
        + '<path d="M70 42 Q100 28 132 40 M66 50 Q100 38 136 50" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
        + '<path d="M70 26 Q90 14 112 18" stroke="' + hl + '" stroke-width="6" stroke-linecap="round" fill="none" opacity=".55"/>'];
    }) },
  // flat top (masculine): a squared block of hair, the sides shaved to a shadow
  { id: 'flat-top', sex: 0, underlay: false, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M54 64 L52 30 Q100 22 148 30 L146 64 Q100 56 54 64z') + '<path d="M60 32 L140 32" stroke="' + hl + '" stroke-width="4" stroke-linecap="round" opacity=".45"/>',
        '<path d="M0 60 L200 60 L200 100 Q152 72 100 66 Q48 72 0 100z" fill="' + hc[0] + '" opacity=".32"/>'
        + '<path d="M0 100 L200 100 L200 118 Q152 94 100 90 Q48 94 0 118z" fill="' + hc[0] + '" opacity=".14"/>'];
    }) },
  // man bun (masculine): slicked back, a small knot at the crown
  { id: 'man-bun', sex: 0, weight: 0.4, noHat: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['<circle cx="100" cy="30" r="13" fill="' + bk + '"/>',
        P('M46 88 Q42 24 100 22 Q158 24 154 88 Q152 60 138 52 Q100 42 62 52 Q48 60 46 88z')
        + '<path d="M70 40 Q100 30 130 40 M66 48 Q100 36 134 48" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
        + '<path d="M90 30 Q100 26 110 30" stroke="' + dk + '" stroke-width="3" fill="none" stroke-linecap="round"/>' + _shine(hl)];
    }) },
  // long straight hair, middle part (masculine): the lengths taper and round off
  { id: 'long-straight-m', sex: 0,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L158 150 Q154 172 136 168 L64 168 Q46 172 42 150z', bk),
        P(CAP_MID) + _shine(hl)];
    }) },
  // curly ponytail (feminine): a tied cluster of curls behind
  { id: 'curly-ponytail', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [_dots([[150, 46, 10], [166, 56, 11], [178, 76, 12], [172, 98, 12], [182, 118, 11], [170, 138, 11], [158, 154, 10], [174, 158, 9]], bk)
        + _dots([[168, 52, 3.5], [176, 96, 3.5], [172, 136, 3.5]], hl, ' opacity=".4"'),
        P(CAP_SMOOTH) + _bumps(100, 84, 50, 200, 340, 7, 5, hl).replace(/fill=/g, 'opacity=".5" fill=') + '<circle cx="146" cy="40" r="6" fill="#d9536a"/>' + _shine(hl)];
    }) },
  // wavy lob (feminine): mid-length with waved edges
  { id: 'lob', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M38 100 Q34 24 100 22 Q166 24 162 100 Q170 116 160 130 Q170 146 158 156 Q142 158 134 148 L66 148 Q58 158 42 156 Q30 146 40 130 Q30 116 38 100z', bk),
        P(CAP_SIDE) + '<path d="M56 100 Q50 116 56 132 M144 100 Q150 116 144 132" stroke="' + hl + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>' + _shine(hl)];
    }) },
  // long curls with a fringe (feminine)
  { id: 'long-curls-fringe', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M36 96 Q32 22 100 20 Q168 22 164 96 L168 180 L32 180z', bk)
        + [100, 124, 148, 172].map(function (y) { return '<circle cx="32" cy="' + y + '" r="12" fill="' + bk + '"/><circle cx="168" cy="' + y + '" r="12" fill="' + bk + '"/>'; }).join(''),
        P('M44 100 Q40 26 100 24 Q160 26 156 100 L154 70 L46 70z') + _bumps(100, 70, 54, 180, 360, 10, 6, f) + _shine(hl)];
    }) },
  // low braided bun (feminine): a plaited knot at the nape, one side
  { id: 'braided-bun', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['<circle cx="50" cy="134" r="18" fill="' + bk + '"/>' + _bumps(50, 134, 11, 0, 300, 6, 4.5, f).replace(/\/>/g, ' stroke="' + hl + '" stroke-width="1.2" opacity=".85"/>')
        + '<circle cx="50" cy="134" r="18" fill="none" stroke="' + hl + '" stroke-width="1.2" opacity=".5"/>',
        P(CAP_SMOOTH) + '<path d="M62 30 Q100 22 138 30 M56 44 Q100 34 144 44" stroke="' + dk + '" stroke-width="2" fill="none" stroke-linecap="round"/>' + _shine(hl)];
    }) },
  // short natural afro (feminine): a curly outline, a little volume
  { id: 'afro-short', sex: 1, weight: 0.6, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M40 92 Q36 20 100 16 Q164 20 160 92 Q152 60 100 54 Q48 60 40 92z')
        + _bumps(100, 84, 58, 188, 352, 21, 4.5, f) + _bumps(100, 84, 62, 192, 348, 19, 4, f) + _bumps(100, 84, 50, 205, 335, 6, 3.5, hl).replace(/fill=/g, 'opacity=".3" fill=')];
    }) },
  // half-up (feminine): the top tied at the crown, the rest down
  { id: 'half-up', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M40 96 Q36 24 100 22 Q164 24 160 96 L166 184 Q146 192 132 178 L68 178 Q54 192 34 184z', bk)
        + '<ellipse cx="100" cy="22" rx="14" ry="8" fill="' + bk + '"/>',
        P(CAP_SMOOTH) + '<path d="M86 34 Q100 28 114 34" stroke="#d9536a" stroke-width="4" stroke-linecap="round" fill="none"/>' + _shine(hl)];
    }) },
  // bed head (masculine): tufts sticking out every which way, a flattened side
  { id: 'bed-head', sex: 0, short: true,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return ['', P('M42 96 Q38 40 56 30 L48 12 L66 24 L74 6 L84 22 L98 0 L106 20 L120 6 L124 24 L142 10 L140 30 L158 22 L152 40 Q160 60 156 96 Q152 66 100 58 Q48 66 42 96z')
        + '<path d="M46 76 Q30 70 34 58 M154 72 Q170 68 168 56 M146 42 Q160 34 168 42" stroke="' + f + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
        + '<path d="M60 40 Q70 28 84 32 M108 30 Q122 22 134 34" stroke="' + hl + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>'];
    }) },
  // bed head (feminine): mid-length, tousled, flyaway strands
  { id: 'bed-head-f', sex: 1,
    draw: hairDraw(function (ctx, f, dk, bk, hl, P, hc, face) {
      return [P('M38 100 Q34 24 100 22 Q166 24 162 100 Q170 118 158 136 Q166 156 150 160 Q138 156 132 146 L68 146 Q62 156 50 160 Q34 156 42 136 Q30 118 38 100z', bk)
        + '<path d="M40 110 Q30 104 32 96 M160 106 Q170 100 168 92 M46 140 Q36 146 38 154 M154 140 Q164 146 162 154 M36 126 Q26 128 28 136" stroke="' + bk + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
        P('M42 100 Q38 34 62 28 L58 12 L72 26 L86 8 L94 26 L108 4 L114 26 L130 12 L134 30 Q160 34 156 100 Q152 70 142 60 Q112 64 88 46 Q78 66 52 72 Q46 84 42 100z')
        + '<path d="M56 48 Q68 34 84 38" stroke="' + hl + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>'];
    }) },
];
export { HAIR };
