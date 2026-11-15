// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The cast of the mini-games — little SVG characters with poses, moods and a
// bit of life (narmod 2026-11-15, Tapis! push 2, claude/CONCEPTION_TAPIS.md
// § 4). Two families and the Joker in both:
//   suits    Spade (black), Heart (red), Diamond (blue), Club (green) — the
//            colours of the four-colour deck, the colours of Tapis!'s chips
//   figures  the King, the Queen, the Jack, the Croupier
//   joker    the jester
// castActor(layer, kind, id) → the same interface as common.mjs aceActor
// (pose, mood, fx, place, fade, show, remove), plus:
//   look(dx, dy)   the eyes follow a point (dx, dy in −1 … 1)
//   clip(u)        hide what is below sprite row u (0 … 120): his body in a hole
//   badge(on)      the Dealer button in his right hand
// Sprite: 100 × 120, his feet at (50, 116). Poses: idle, balance, air, clap,
// wave, ko. Moods: smile, jump, yay, wink, grin, dizzy, scared (sweat), ko,
// love — the « mc-m-* » names of aceActor are accepted too. « Reduce
// animations »: no idle motion, no blinking, poses still.
// ═══════════════════════════════════════════════════════════════════

export const SUITS = ['spade', 'heart', 'diamond', 'club'];
export const FIGURES = ['king', 'queen', 'jack', 'croupier'];
export const KINDS = SUITS.concat(FIGURES, ['joker']);

const INK = '#1b1b1b';
const CSS = `
.cs{position:absolute;inset:0;pointer-events:none;overflow:visible}
.cs .cs-box{position:absolute;left:0;top:0;width:100px;height:120px;transform-origin:50px 116px;will-change:transform}
.cs svg{position:absolute;left:0;top:0;width:100px;height:120px;overflow:visible}
.cs .v{display:none}
.cs .cs-body,.cs .cs-armL,.cs .cs-armR,.cs .cs-legL,.cs .cs-legR,.cs .cs-all,.cs .cs-blink{transform-box:view-box}
.cs .cs-all{transform-origin:50px 114px;transition:transform .35s cubic-bezier(.3,1.5,.5,1)}
.cs .cs-body{transform-origin:50px 92px}
.cs .cs-armL{transform-origin:30px 66px;transition:transform .2s}.cs .cs-armR{transform-origin:70px 66px;transition:transform .2s}
.cs .cs-legL{transform-origin:44px 90px}.cs .cs-legR{transform-origin:56px 90px}
.cs .cs-blink{transform-origin:50px 55px}
.cs .cs-pup{transition:transform .25s ease-out}
.cs.cs-m-smile .e-open,.cs.cs-m-smile .m-smile,
.cs.cs-m-jump .e-open,.cs.cs-m-jump .m-open,
.cs.cs-m-yay .e-happy,.cs.cs-m-yay .m-open,
.cs.cs-m-wink .e-wink,.cs.cs-m-wink .m-smile,
.cs.cs-m-grin .e-open,.cs.cs-m-grin .m-grin,
.cs.cs-m-dizzy .e-spiral,.cs.cs-m-dizzy .m-wavy,.cs.cs-m-dizzy .fx-stars,
.cs.cs-m-scared .e-big,.cs.cs-m-scared .m-o,.cs.cs-m-scared .fx-sweat,
.cs.cs-m-ko .e-x,.cs.cs-m-ko .m-flat,
.cs.cs-m-love .e-heart,.cs.cs-m-love .m-smile,.cs.cs-sweat .fx-sweat,.cs.cs-dealer .fx-dealer{display:inline}
.cs.idle .cs-body{animation:csBreath 1.7s ease-in-out infinite alternate}
.cs.balance .cs-armL{transform:rotate(58deg)}.cs.balance .cs-armR{transform:rotate(-58deg)}
.cs.balance .cs-all{animation:csSway .7s ease-in-out infinite alternate}
.cs.air .cs-armL{transform:rotate(128deg)}.cs.air .cs-armR{transform:rotate(-128deg)}
.cs.air .cs-legL{transform:rotate(22deg) scaleY(.8)}.cs.air .cs-legR{transform:rotate(-22deg) scaleY(.8)}
.cs.clap .cs-armL{animation:csClapL .18s ease-in-out infinite alternate}.cs.clap .cs-armR{animation:csClapR .18s ease-in-out infinite alternate}
.cs.clap .cs-body{animation:csHop .36s ease-in-out infinite alternate}
.cs.wave .cs-armR{animation:csWave .45s ease-in-out infinite alternate}.cs.wave .cs-armL{transform:rotate(30deg)}
.cs.ko .cs-all{transform:rotate(-78deg) translate(-6px,4px)}
.cs.ko .cs-armL{transform:rotate(80deg)}.cs.ko .cs-armR{transform:rotate(-95deg)}
.cs .cs-blink{animation:csBlink 4.2s infinite}
.cs .fx-sweat{animation:csSweat 1s ease-in infinite}
.cs .fx-stars{animation:csSpin 1.2s linear infinite;transform-box:view-box;transform-origin:50px 26px}
@keyframes csBreath{from{transform:scale(1,1)}to{transform:scale(1.03,.97)}}
@keyframes csSway{from{transform:rotate(-7deg)}to{transform:rotate(7deg)}}
@keyframes csClapL{from{transform:rotate(-20deg)}to{transform:rotate(-62deg)}}
@keyframes csClapR{from{transform:rotate(20deg)}to{transform:rotate(62deg)}}
@keyframes csHop{from{transform:translateY(0)}to{transform:translateY(-4px)}}
@keyframes csWave{from{transform:rotate(-120deg)}to{transform:rotate(-160deg)}}
@keyframes csBlink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
@keyframes csSweat{from{transform:translateY(0);opacity:1}to{transform:translateY(9px);opacity:0}}
@keyframes csSpin{to{transform:rotate(360deg)}}
.cs.cs-still .cs-body,.cs.cs-still .cs-all,.cs.cs-still .cs-blink,.cs.cs-still .cs-armL,.cs.cs-still .cs-armR,.cs.cs-still .fx-stars{animation:none !important}
`;

// ── The bodies (centred at x 50, from y ≈ 28 to 92) ─────────────────
const S = (d, fill, extra) => '<path d="' + d + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"' + (extra || '') + '/>';
const shine = (d) => '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2.6" stroke-linecap="round"/>';
const BODY = {
  spade: () => S('M50 27 C42 39 22 48 22 63 C22 75 34 81 44 74 L40 91 L60 91 L56 74 C66 81 78 75 78 63 C78 48 58 39 50 27 Z', '#2c3038') + shine('M30 58 C31 52 38 46 44 41'),
  heart: () => S('M50 91 C30 77 20 65 20 52 C20 40 29 32 39 32 C44 32 48 35 50 39 C52 35 56 32 61 32 C71 32 80 40 80 52 C80 65 70 77 50 91 Z', '#d23a30') + shine('M28 50 C28 43 33 38 39 38'),
  diamond: () => S('M50 25 C58 38 69 50 79 59 C69 69 58 80 50 94 C42 80 31 69 21 59 C31 50 42 38 50 25 Z', '#2f6bd0') + shine('M33 56 C38 50 43 44 47 37'),
  club: () => '<g stroke="' + INK + '" stroke-width="2.4">'
    + '<path d="M44 72 L39 91 L61 91 L56 72 Z" fill="#1f8a4c"/><circle cx="50" cy="40" r="14" fill="#27a058"/>'
    + '<circle cx="34" cy="62" r="14" fill="#27a058"/><circle cx="66" cy="62" r="14" fill="#27a058"/></g>'
    + '<path d="M38 50 H62 V70 H38 Z" fill="#27a058"/><circle cx="50" cy="56" r="10" fill="#27a058"/>' + shine('M40 36 C42 32 46 30 50 30'),
  joker: () => S('M50 34 C66 34 75 46 75 62 C75 78 64 90 50 90 C36 90 25 78 25 62 C25 46 34 34 50 34 Z', '#7b3fbf')
    + '<path d="M31 72 L50 90 L69 72" fill="none" stroke="#f5c518" stroke-width="2.4"/><path d="M35 78 L50 90 L65 78" fill="none" stroke="#3fae6a" stroke-width="2"/>',
  card: (accent) => '<rect x="25" y="29" width="50" height="63" rx="7" fill="#fffdf8" stroke="' + INK + '" stroke-width="2.4"/>'
    + '<rect x="29" y="33" width="42" height="55" rx="4" fill="none" stroke="' + accent + '" stroke-width="1.2" opacity=".55"/>',
};
// ── What they wear (behind: hair; front: crown, cap, beard…) ──────────
const corner = (sym, col) => '<text x="29.5" y="42" font-size="9" font-family="Georgia,serif" fill="' + col + '">' + sym + '</text>';
const WEAR = {
  king: {
    body: () => BODY.card('#c62828') + corner('♥', '#c62828')
      + '<path d="M27 74 H73 V86 Q73 90 69 90 H31 Q27 90 27 86 Z" fill="#c62828"/><path d="M27 74 H73" stroke="#fffdf8" stroke-width="3.5"/>'
      + '<g fill="' + INK + '"><circle cx="34" cy="74" r=".9"/><circle cx="44" cy="74" r=".9"/><circle cx="56" cy="74" r=".9"/><circle cx="66" cy="74" r=".9"/></g>',
    front: () => '<path d="M36 30 L38 17 L44 25 L50 13 L56 25 L62 17 L64 30 Z" fill="#f5c518" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>'
      + '<circle cx="50" cy="22" r="1.8" fill="#c62828"/><circle cx="41" cy="26" r="1.2" fill="#2f6bd0"/><circle cx="59" cy="26" r="1.2" fill="#2f6bd0"/>'
      + '<path d="M37 64 Q39 78 50 80 Q61 78 63 64 Q57 71 50 71 Q43 71 37 64 Z" fill="#8a5a2b" stroke="' + INK + '" stroke-width="1.6"/>',
  },
  queen: {
    back: () => '<path d="M28 34 Q20 54 26 80 L34 78 Q30 58 36 42 Z M72 34 Q80 54 74 80 L66 78 Q70 58 64 42 Z" fill="#e0a33a" stroke="' + INK + '" stroke-width="1.8"/>',
    body: () => BODY.card('#2f6bd0') + corner('♦', '#2f6bd0')
      + '<path d="M27 76 Q50 70 73 76 V86 Q73 90 69 90 H31 Q27 90 27 86 Z" fill="#2f6bd0"/>',
    front: () => '<path d="M33 40 Q50 24 67 40 Q60 34 50 34 Q40 34 33 40 Z" fill="#e0a33a" stroke="' + INK + '" stroke-width="1.6"/>'
      + '<path d="M40 30 L43 22 L47 28 L50 20 L53 28 L57 22 L60 30 Z" fill="#dfe6f0" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/>'
      + '<circle cx="50" cy="24" r="1.6" fill="#c62828"/><circle cx="66" cy="70" r="3.4" fill="#ff7aa8" stroke="' + INK + '" stroke-width="1.2"/><circle cx="66" cy="70" r="1.2" fill="#f5c518"/>',
  },
  jack: {
    body: () => BODY.card('#27a058') + corner('♣', '#1f8a4c')
      + '<path d="M27 76 H73 V86 Q73 90 69 90 H31 Q27 90 27 86 Z" fill="#27a058"/><path d="M40 76 L50 86 L60 76" fill="none" stroke="#f5c518" stroke-width="2"/>',
    front: () => '<path d="M31 33 Q36 20 52 21 Q66 22 70 32 Q50 28 31 33 Z" fill="#2f6bd0" stroke="' + INK + '" stroke-width="1.8"/>'
      + '<path d="M60 23 Q74 8 84 12 Q74 16 66 27 Z" fill="#d23a30" stroke="' + INK + '" stroke-width="1.4"/>'
      + '<path d="M42 59.5 Q46 56.5 50 59.5 Q54 56.5 58 59.5 Q55 62 50 60.5 Q45 62 42 59.5 Z" fill="#5a3a1a"/>',
  },
  croupier: {
    body: () => BODY.card('#1b1b1b') + corner('♠', INK)
      + '<path d="M27 72 H73 V86 Q73 90 69 90 H31 Q27 90 27 86 Z" fill="#7a1f2b"/><path d="M50 72 V90" stroke="#f5c518" stroke-width="1"/>'
      + '<g fill="#f5c518"><circle cx="50" cy="79" r="1"/><circle cx="50" cy="85" r="1"/></g>',
    front: () => '<path d="M30 40 Q50 30 70 40 L76 46 Q50 38 24 46 Z" fill="#2fa36a" fill-opacity=".85" stroke="' + INK + '" stroke-width="1.6"/>'
      + '<path d="M29 39 Q50 33 71 39" stroke="' + INK + '" stroke-width="2.2" fill="none"/>'
      + '<path d="M42 70 L50 74 L42 78 Z M58 70 L50 74 L58 78 Z" fill="' + INK + '"/><circle cx="50" cy="74" r="1.6" fill="' + INK + '"/>',
  },
  joker: {
    front: () => '<path d="M30 40 Q28 22 16 18 Q28 14 38 30 Q42 12 50 8 Q58 12 62 30 Q72 14 84 18 Q72 22 70 40 Q50 32 30 40 Z" fill="#7b3fbf" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>'
      + '<path d="M38 30 Q42 12 50 8 Q58 12 62 30 Q56 26 50 26 Q44 26 38 30 Z" fill="#3fae6a"/>'
      + '<circle cx="16" cy="18" r="3" fill="#f5c518" stroke="' + INK + '" stroke-width="1.2"/><circle cx="50" cy="8" r="3" fill="#f5c518" stroke="' + INK + '" stroke-width="1.2"/><circle cx="84" cy="18" r="3" fill="#f5c518" stroke="' + INK + '" stroke-width="1.2"/>'
      + '<path d="M32 74 Q36 80 40 74 Q44 80 50 74 Q56 80 60 74 Q64 80 68 74" fill="#fffdf8" stroke="' + INK + '" stroke-width="1.4"/>',
  },
};
// Where the eyes sit (y), how far apart, the face's ink (on a dark body, white).
const FACE = { spade: [58, 9], heart: [53, 10], diamond: [57, 9], club: [53, 9], joker: [56, 10], king: [52, 9], queen: [52, 9], jack: [51, 9], croupier: [54, 9] };

/** The face: every eye and mouth, shown by the mood (CSS). */
function face(kind) {
  const [y, dx] = FACE[kind] || [55, 9], l = 50 - dx, r = 50 + dx, my = y + 10;
  const eye = (x, big) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (big ? 5.2 : 4.4) + '" ry="' + (big ? 6.4 : 5.4) + '" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/>';
  const pup = (x, rr) => '<circle cx="' + x + '" cy="' + (y + 0.6) + '" r="' + rr + '" fill="' + INK + '"/><circle cx="' + (x + 0.9) + '" cy="' + (y - 0.6) + '" r=".8" fill="#fff"/>';
  const arc = (x) => '<path d="M' + (x - 4) + ' ' + (y + 1) + ' Q' + x + ' ' + (y - 5) + ' ' + (x + 4) + ' ' + (y + 1) + '" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>';
  const xx = (x) => '<path d="M' + (x - 3.4) + ' ' + (y - 3.4) + ' L' + (x + 3.4) + ' ' + (y + 3.4) + ' M' + (x + 3.4) + ' ' + (y - 3.4) + ' L' + (x - 3.4) + ' ' + (y + 3.4) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>';
  const spiral = (x) => '<path d="M' + x + ' ' + y + ' m-.6 0 a.6 .6 0 1 1 1.2 0 a1.8 1.8 0 1 1 -3 0 a3 3 0 1 1 5.4 0" fill="none" stroke="' + INK + '" stroke-width="1.4"/>';
  const heart = (x) => '<path d="M' + x + ' ' + (y + 4) + ' C' + (x - 6) + ' ' + (y - 1) + ' ' + (x - 3) + ' ' + (y - 6) + ' ' + x + ' ' + (y - 2) + ' C' + (x + 3) + ' ' + (y - 6) + ' ' + (x + 6) + ' ' + (y - 1) + ' ' + x + ' ' + (y + 4) + ' Z" fill="#ff4f7a" stroke="' + INK + '" stroke-width="1"/>';
  return '<g class="cs-blink">'
    + '<g class="v e-open">' + eye(l) + eye(r) + '<g class="cs-pup">' + pup(l, 2.4) + pup(r, 2.4) + '</g></g>'
    + '<g class="v e-big">' + eye(l, true) + eye(r, true) + '<g class="cs-pup">' + pup(l, 1.6) + pup(r, 1.6) + '</g></g>'
    + '<g class="v e-wink">' + eye(l) + '<g class="cs-pup">' + pup(l, 2.4) + '</g>' + arc(r) + '</g>'
    + '</g>'
    + '<g class="v e-happy">' + arc(l) + arc(r) + '</g>'
    + '<g class="v e-x">' + xx(l) + xx(r) + '</g>'
    + '<g class="v e-spiral">' + spiral(l) + spiral(r) + '</g>'
    + '<g class="v e-heart">' + heart(l) + heart(r) + '</g>'
    + '<circle cx="' + (l - 4) + '" cy="' + (my - 3) + '" r="2.6" fill="#ff8fa3" opacity=".55"/><circle cx="' + (r + 4) + '" cy="' + (my - 3) + '" r="2.6" fill="#ff8fa3" opacity=".55"/>'
    + '<path class="v m-smile" d="M44 ' + my + ' Q50 ' + (my + 6) + ' 56 ' + my + '" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>'
    + '<path class="v m-open" d="M43.5 ' + (my - 1) + ' Q50 ' + (my + 11) + ' 56.5 ' + (my - 1) + ' Z" fill="#7a1f2b" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>'
    + '<path class="v m-grin" d="M42 ' + (my - 1) + ' Q50 ' + (my + 9) + ' 58 ' + (my - 1) + ' Z" fill="#fff" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>'
    + '<ellipse class="v m-o" cx="50" cy="' + (my + 1) + '" rx="2.8" ry="3.4" fill="#7a1f2b" stroke="' + INK + '" stroke-width="1.6"/>'
    + '<path class="v m-wavy" d="M43 ' + (my + 1) + ' q2 -2.5 3.5 0 t3.5 0 t3.5 0 t3.5 0" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>'
    + '<path class="v m-flat" d="M45 ' + (my + 1) + ' H55" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>'
    + '<path class="v fx-sweat" d="M' + (r + 9) + ' ' + (y - 8) + ' q-3 5 0 6.5 q3 -1.5 0 -6.5 Z" fill="#7fd0ff" stroke="#2a6fa8" stroke-width=".8"/>';
}

/** The SVG of a character of kind `kind`. */
export function castSvg(kind) {
  const w = WEAR[kind] || {};
  const body = w.body ? w.body() : (BODY[kind] || BODY.spade)();
  const glove = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="5" fill="#fff" stroke="' + INK + '" stroke-width="1.8"/>';
  const armL = '<g class="cs-armL"><path d="M30 66 L19 80" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' + glove(18, 81) + '</g>';
  const dealer = '<g class="v fx-dealer"><circle cx="86" cy="86" r="8.5" fill="#fbf7ee" stroke="' + INK + '" stroke-width="1.6"/><circle cx="86" cy="86" r="6" fill="none" stroke="#c9a23a" stroke-width=".9"/>'
    + '<text x="86" y="89.4" text-anchor="middle" font-size="9.5" font-weight="800" font-family="Inter,system-ui,sans-serif" fill="' + INK + '">D</text></g>';
  const armR = '<g class="cs-armR"><path d="M70 66 L81 80" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' + glove(82, 81) + dealer + '</g>';
  const legs = '<g class="cs-legL"><path d="M44 89 L42 110" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="38.5" cy="112" rx="7" ry="4" fill="#24262b"/></g>'
    + '<g class="cs-legR"><path d="M56 89 L58 110" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="61.5" cy="112" rx="7" ry="4" fill="#24262b"/></g>';
  const stars = '<g class="v fx-stars"><path d="M34 22 l1.6 3.4 3.6 .5 -2.6 2.5 .6 3.6 -3.2 -1.7 -3.2 1.7 .6 -3.6 -2.6 -2.5 3.6 -.5 Z" fill="#f5c518"/>'
    + '<path d="M66 20 l1.3 2.8 3 .4 -2.2 2 .5 3 -2.6 -1.4 -2.6 1.4 .5 -3 -2.2 -2 3 -.4 Z" fill="#f5c518"/></g>';
  return '<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="cs-all">'
    + '<ellipse cx="50" cy="114" rx="22" ry="4" fill="rgba(0,0,0,.3)"/>' + legs
    + '<g class="cs-body">' + armL + (w.back ? w.back() : '') + body + face(kind) + (w.front ? w.front() : '') + armR + stars + '</g>'
    + '</g></svg>';
}

function reduced() {
  try { return document.documentElement.classList.contains('reduce-fx') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
}

/** A character of kind `kind` in `layer` (see the header). */
export function castActor(layer, kind, id) {
  if (!document.getElementById('pth-cast-css')) {
    const st = document.createElement('style'); st.id = 'pth-cast-css'; st.textContent = CSS;
    document.head.appendChild(st);
  }
  const root = document.createElement('div');
  if (id) root.id = id;
  root.className = 'cs idle cs-m-smile' + (reduced() ? ' cs-still' : '');
  root.setAttribute('data-kind', kind);
  root.innerHTML = '<div class="cs-box">' + castSvg(kind) + '</div>';
  layer.appendChild(root);
  const box = /** @type {HTMLElement} */ (root.firstElementChild);
  const blink = /** @type {HTMLElement|null} */ (root.querySelector('.cs-blink'));
  if (blink) blink.style.animationDelay = (-Math.random() * 4).toFixed(2) + 's';
  const pups = /** @type {HTMLElement[]} */ (Array.from(root.querySelectorAll('.cs-pup')));
  let poseNow = 'idle', moodNow = 'cs-m-smile';
  const part = (c) => /** @type {HTMLElement|null} */ (root.querySelector('.' + c));
  const play = (c, frames, ms) => { const el = part(c); if (!el || !el.animate || reduced()) return; try { el.animate(frames, { duration: ms, easing: 'ease-out' }); } catch (e) {} };
  return {
    kind,
    pose(p) { if (p !== poseNow) { root.classList.remove(poseNow); root.classList.add(p); poseNow = p; } },
    mood(m) {
      const c = 'cs-m-' + String(m).replace(/^mc-m-/, '');
      if (c !== moodNow) { root.classList.remove(moodNow); root.classList.add(c); moodNow = c; }
    },
    /** The Dealer button in his hand (Tapis!, from level 5). */
    badge(on) { root.classList.toggle('cs-dealer', !!on); },
    /** Sweat drops on (his stack nearly gone, the clock nearly out). */
    sweat(on) { root.classList.toggle('cs-sweat', !!on); },
    /** The eyes towards (dx, dy), each in −1 … 1. */
    look(dx, dy) {
      const t = 'translate(' + (Math.max(-1, Math.min(1, dx)) * 1.6).toFixed(2) + 'px,' + (Math.max(-1, Math.min(1, dy)) * 1.4).toFixed(2) + 'px)';
      pups.forEach((p) => { p.style.transform = t; });
    },
    fx(kind2) {
      if (kind2 === 'land') play('cs-body', [{ transform: 'scale(1.2,.8)' }, { offset: 0.5, transform: 'scale(.95,1.06)' }, { transform: 'scale(1,1)' }], 260);
      else if (kind2 === 'cheer' || kind2 === 'hop') play('cs-body', [{ transform: 'translateY(0)' }, { offset: 0.35, transform: 'translateY(-9px) scale(1.04,.96)' }, { transform: 'translateY(0)' }], 380);
      else if (kind2 === 'shiver') play('cs-all', [{ transform: 'rotate(0)' }, { offset: 0.25, transform: 'rotate(-8deg)' }, { offset: 0.6, transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], 360);
    },
    /** Feet at world (x, y), sprite scale s (world units per sprite unit), world → CSS k. */
    place(x, y, s, k, rot) {
      box.style.transform = 'translate(' + (x * k - 50) + 'px,' + (y * k - 116) + 'px) scale(' + s * k + ')' + (rot ? ' rotate(' + rot + 'deg)' : '');
    },
    /** Hide what is below sprite row u (null: nothing hidden). */
    clip(u) { box.style.clipPath = u == null ? '' : 'inset(0 0 ' + Math.max(0, 120 - u).toFixed(1) + 'px 0)'; },
    show(on) { root.style.display = on ? '' : 'none'; },
    fade(a) { box.style.opacity = a >= 1 ? '' : String(a); },
    remove() { root.remove(); },
  };
}
