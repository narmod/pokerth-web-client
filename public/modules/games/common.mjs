// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Hidden mini-games — pieces shared by the games (web extension, narmod
// 2026-10-16): the Ace as an actor (the SVG mascot of modules/mascot/
// engine.mjs, through actorKit, with the poses the games need), the player's
// deck (faces and back, modules/ui/deck.mjs) for the canvas and the HUD, a
// shuffled deck with its Joker, and the HUD styles (.ar-*).
// ═══════════════════════════════════════════════════════════════════

import { actorKit } from '../mascot/engine.mjs';
import { JOKER, suitOf } from './poker-hand.mjs';

export const ACE_ID = 'pth-game-ace';
export const SUITS = ['♦', '♥', '♠', '♣'];
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const CHIP = [['#b3261e', '#f5f0e3'], ['#1f4e9e', '#f5f0e3'], ['#1e7a46', '#f5f0e3'], ['#1b1b1b', '#d8b25a']];

const CSS = `
#${ACE_ID}{position:absolute;inset:0;pointer-events:none;overflow:hidden}
#${ACE_ID} .ar-box{position:absolute;left:0;top:0;width:168px;height:228px;transform-origin:84px 212px;will-change:transform}
#${ACE_ID} svg>ellipse[cy="180"]{display:none}
#${ACE_ID} .run .mc-lean{transform:rotate(7deg)}
#${ACE_ID} .run .mc-legL{animation:arLeg .3s ease-in-out infinite alternate}
#${ACE_ID} .run .mc-legR{animation:arLeg .3s ease-in-out infinite alternate-reverse}
#${ACE_ID} .run .mc-armL{animation:arArm .3s ease-in-out infinite alternate-reverse}
#${ACE_ID} .run .mc-armR{animation:arArm .3s ease-in-out infinite alternate}
#${ACE_ID} .run .mc-bob{animation:arBob .15s ease-in-out infinite alternate}
@keyframes arLeg{from{transform:rotate(26deg)}to{transform:rotate(-26deg)}}
@keyframes arArm{from{transform:rotate(30deg)}to{transform:rotate(-24deg)}}
@keyframes arBob{from{transform:translateY(0)}to{transform:translateY(-5px)}}
#${ACE_ID} .air .mc-lean{transform:rotate(7deg)}
#${ACE_ID} .air .mc-legL{transform:rotate(38deg)}#${ACE_ID} .air .mc-legR{transform:rotate(-30deg)}
#${ACE_ID} .air .mc-armL{transform:rotate(70deg)}#${ACE_ID} .air .mc-armR{transform:rotate(-70deg)}
#${ACE_ID} .duck .mc-squash{transform:scale(1.12,.55)}
#${ACE_ID} .duck .mc-lean{transform:rotate(16deg)}
#${ACE_ID} .idle .mc-breath{animation:arBreath 1.6s ease-in-out infinite alternate}
@keyframes arBreath{from{transform:scale(1,1)}to{transform:scale(1.02,.975)}}
#${ACE_ID} .balance .mc-armL{transform:rotate(-62deg)}#${ACE_ID} .balance .mc-armR{transform:rotate(62deg)}
#${ACE_ID} .balance .mc-breath{animation:arBreath 1.1s ease-in-out infinite alternate}
#${ACE_ID} .wave .mc-armR{animation:arWave .5s ease-in-out infinite alternate}
@keyframes arWave{from{transform:rotate(-120deg)}to{transform:rotate(-150deg)}}
#${ACE_ID} .ko .mc-lean{transform:rotate(-78deg) translateX(-30px);transition:transform .35s cubic-bezier(.3,1.6,.5,1)}
#${ACE_ID} .ko .mc-armL{transform:rotate(90deg)}#${ACE_ID} .ko .mc-armR{transform:rotate(-100deg)}
#${ACE_ID} .mc-m-jump .mc-f-es,#${ACE_ID} .mc-m-jump .mc-f-mo,
#${ACE_ID} .mc-m-yay .mc-f-eo,#${ACE_ID} .mc-m-yay .mc-f-mo,
#${ACE_ID} .mc-m-ko .mc-f-ed,#${ACE_ID} .mc-m-ko .mc-f-mo,
#${ACE_ID} .mc-m-wink .mc-f-ew,#${ACE_ID} .mc-m-wink .mc-f-ms,
#${ACE_ID} .mc-m-grin .mc-f-ec,#${ACE_ID} .mc-m-grin .mc-f-mo,
#${ACE_ID} .mc-m-dizzy .mc-f-ed,#${ACE_ID} .mc-m-dizzy .mc-f-mw,
#${ACE_ID} .mc-m-love .mc-f-eh,#${ACE_ID} .mc-m-love .mc-f-ms,
#${ACE_ID} .mc-m-scared .mc-f-es,#${ACE_ID} .mc-m-scared .mc-f-mu{opacity:1}
#${ACE_ID} .ar-king{filter:drop-shadow(0 0 6px rgba(245,197,24,.85))}
#${ACE_ID} .ar-king.ar-ending{animation:arEnd .2s steps(2,start) infinite}
@keyframes arEnd{50%{filter:none}}
#pth-game .ar-lab{font:600 10px/1 'Inter',system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9bb0a3;margin-bottom:4px}
#pth-game .ar-num{font:700 clamp(15px,2.4vw,20px)/1 'Inconsolata',monospace;font-variant-numeric:tabular-nums;color:#f5f0e3;text-shadow:0 1px 2px rgba(0,0,0,.6)}
#pth-game .ar-num.ar-low{color:#ff8a80}
#pth-game .ar-stats{display:flex;gap:16px}
#pth-game .ar-hand{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
#pth-game .ar-sky .ar-lab{color:#e3ece6}#pth-game .ar-sky .ar-lab,#pth-game .ar-sky .ar-name{text-shadow:0 1px 2px rgba(0,0,0,.75),0 0 6px rgba(0,0,0,.35)}
#pth-game .ar-slots{display:flex;gap:4px}
#pth-game .ar-slots .pk{margin:0;flex:none}
#pth-game .ar-slot{width:32px;height:46px;border-radius:4px;border:1px dashed rgba(216,178,90,.35);box-sizing:border-box}
#pth-game .pk.ar-joker{background:#f5f0e3;display:flex;align-items:center;justify-content:center;font-size:22px;line-height:1}
#pth-game .pk.sm.ar-joker{font-size:18px}
#pth-game .ar-name{font:600 12px/1 'Inter',system-ui,sans-serif;color:#d8b25a;text-shadow:0 1px 2px rgba(0,0,0,.6)}
#pth-game .ar-name b{font-family:'Inconsolata',monospace;font-size:14px;margin-left:4px}
#pth-game .ar-show{display:flex;gap:6px;justify-content:center;min-height:84px}
#pth-game .ar-show .pk{margin:0;flex:none}
#pth-game .ar-final{font:700 clamp(14px,2.2vw,17px)/1.3 'Inconsolata',monospace;font-variant-numeric:tabular-nums;color:#f5f0e3}
#pth-game .ar-final em{font-style:normal;color:#d8b25a}
/* Choice tiles (arcade menu, game modes) */
#pth-game .gm-tiles{display:flex;gap:12px;justify-content:center;width:min(640px,100%);pointer-events:auto}
#pth-game .gm-tile{appearance:none;border:0;cursor:pointer;flex:1 1 0;min-width:0;max-width:190px;padding:14px 10px 12px;border-radius:12px;
  background:rgba(19,30,25,.92);box-shadow:inset 0 0 0 1px rgba(216,178,90,.3);color:#f5f0e3;display:flex;flex-direction:column;align-items:center;gap:6px;
  font:600 14px/1.2 'Inter',system-ui,sans-serif;transition:transform .12s,box-shadow .12s}
#pth-game .gm-tile i{font-style:normal;font-size:32px;line-height:1}
#pth-game .gm-tile b{font:700 16px/1.15 'Cinzel',Georgia,serif;letter-spacing:.02em}
#pth-game .gm-tile small{font:500 11px 'Inconsolata',monospace;color:#9bb0a3;min-height:1.2em}
#pth-game .gm-tile.on{box-shadow:inset 0 0 0 2px #d8b25a,0 0 18px rgba(216,178,90,.25);transform:translateY(-2px)}
#pth-game .gm-tile:focus-visible{outline:2px solid #f5f0e3;outline-offset:2px}
#pth-game.pg-light .gm-tile{background:rgba(255,252,246,.96);color:#1d222b;box-shadow:inset 0 0 0 1px rgba(140,105,20,.35)}
#pth-game.pg-light .gm-tile small{color:#5a6470}
#pth-game.pg-light .gm-tile.on{box-shadow:inset 0 0 0 2px #a07a12,0 0 14px rgba(160,122,18,.25)}
@media (max-width:520px){#pth-game .gm-tile{padding:10px 8px;gap:4px}#pth-game .gm-tile i{font-size:24px}#pth-game .gm-tile b{font-size:14px}}
/* The title screen's template (title.mjs, web.55): the dark picture, the
   record of each tile, a row of option chips, a footnote */
#pth-game .pg-panel>.gm-bg{position:absolute;inset:0;z-index:0;display:block;max-width:none;overflow:hidden;pointer-events:none}
#pth-game .pg-panel>.gm-bg svg{display:block;width:100%;height:100%;filter:brightness(.5) saturate(.9)}
#pth-game .pg-panel>.gm-bg::after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(11,18,16,.3),rgba(11,18,16,.82))}
#pth-game .pg-panel.gm-title>div:not(.gm-bg){position:relative;z-index:1;gap:10px;max-width:640px}
#pth-game .pg-panel .gm-hint{max-width:520px;color:#dfe9e3}
#pth-game .gm-tile .gm-rec{color:#d8b25a}
#pth-game.pg-light .gm-tile .gm-rec{color:#8a6a10}
#pth-game .gm-tiles.gm-many{flex-wrap:wrap}#pth-game .gm-tiles.gm-many .gm-tile{flex:1 1 calc(50% - 12px)}
@media (min-width:700px){#pth-game .gm-tiles.gm-many{flex-wrap:nowrap}#pth-game .gm-tiles.gm-many .gm-tile{flex:1 1 0}}
#pth-game .gm-opts{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;pointer-events:auto}
#pth-game .gm-opt{position:relative;appearance:none;cursor:pointer;padding:6px 14px;border-radius:999px;border:1px solid rgba(216,178,90,.5);
  background:rgba(11,18,16,.6);color:#f5f0e3;font:600 13px/1.2 'Inter',system-ui,sans-serif}
#pth-game .gm-opt.on{background:#d8b25a;color:#141414;border-color:#d8b25a}
#pth-game .gm-opt:disabled{opacity:.35;cursor:default}
#pth-game .gm-opt .gm-k{font:600 .7em/1 'Inconsolata',monospace;font-style:normal;opacity:.6;margin-left:.5em}
#pth-game.pg-light .gm-opt{background:rgba(255,255,255,.75);color:#1d222b}#pth-game.pg-light .gm-opt.on{background:#d8b25a;color:#141414}
#pth-game .gm-foot{max-width:560px;line-height:1.45}
@media (max-width:520px){#pth-game .ar-slot{width:22px;height:32px}#pth-game .ar-slots .pk.sm{width:22px;height:32px;font-size:10px}
  #pth-game .ar-show{min-height:58px;gap:4px}#pth-game .ar-show .pk.lg{width:40px;height:58px;font-size:15px}
  #pth-game .pg-panel>div{gap:4px}#pth-game .pg-panel h2{font-size:20px}#pth-game .ar-stats{gap:10px}}
`;

export const rlab = (n) => (n === JOKER ? '🃏' : RANKS[n % 13] + SUITS[suitOf(n)]);
export const isRed = (n) => n !== JOKER && suitOf(n) < 2;
// One number format per language, kept (web.110: toLocaleString made one at every call, many a frame). Same text.
const NF = new Map();
export const fmt = (v) => {
  try {
    if (typeof v !== 'number') return v.toLocaleString(document.documentElement.lang || undefined);
    const l = document.documentElement.lang || '';
    let f = NF.get(l);
    if (!f) { f = new Intl.NumberFormat(l || undefined); NF.set(l, f); }
    return f.format(v);
  } catch (e) { return String(v); }
};

/** URL of card `n`'s face in the player's deck ('' for the glyph deck). */
export function faceUrl(n) {
  if (n === JOKER) return '';
  try {
    const h = typeof window.cardToHtml === 'function' ? window.cardToHtml(n, false) : '';
    const m = /--cf:url\(([^)]*)\)/.exec(h);
    return m && m[1] ? m[1].replace(/^["']|["']$/g, '') : '';
  } catch (e) { return ''; }
}
/** URL of the player's card back ('' if none). */
export function backUrl() {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--card-back') || '';
    const m = /url\((['"]?)(.*?)\1\)/.exec(v);
    return m ? m[2] : '';
  } catch (e) { return ''; }
}
/** A card of the HUD / showdown ('sm' or 'lg'), the Joker included. */
export function cardHtml(n, size) {
  if (n === JOKER) return '<div class="pk ' + size + ' ar-joker">🃏</div>';
  try { if (typeof window.cardToHtml === 'function') return window.cardToHtml(n, size === 'sm', false, size === 'sm' ? '' : ' ' + size); } catch (e) {}
  return '<div class="pk ' + size + (isRed(n) ? ' red' : '') + '"><span class="c-rank">' + RANKS[n % 13] + '</span><span class="c-suit">' + SUITS[suitOf(n)] + '</span></div>';
}
/** 52 shuffled cards plus one Joker somewhere in what will come out first (rnd: a seeded stream for a daily challenge). */
export function newDeck(rnd = Math.random) {
  const deck = [];
  for (let n = 0; n < 52; n++) deck.push(n);
  for (let j = deck.length - 1; j > 0; j--) { const x = Math.floor(rnd() * (j + 1)); const tmp = deck[j]; deck[j] = deck[x]; deck[x] = tmp; }
  deck.splice(deck.length - 6 - Math.floor(rnd() * 30), 0, JOKER);
  return deck;
}
/** Image loader for the canvas: img(url) is the image once it can be drawn, else null. */
export function imageCache() {
  const imgs = {};
  return function img(url) {
    if (!url) return null;
    if (!imgs[url]) { const im = new Image(); im.decoding = 'async'; im.src = url; imgs[url] = im; }
    const im = imgs[url];
    return im.complete && im.naturalWidth ? im : null;
  };
}
/** Draw a card face (deck image, or a glyph card) centred on (0,0), w × h. */
export function drawFace(g, img, n, w, h) {
  rr(g, -w / 2, -h / 2, w, h, Math.max(2, w * 0.1));
  const im = n === JOKER ? null : img(faceUrl(n));
  if (im) {
    g.save(); g.clip(); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore();
    rr(g, -w / 2, -h / 2, w, h, Math.max(2, w * 0.1)); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1; g.stroke();
    return;
  }
  g.fillStyle = '#f5f0e3'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1; g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (n === JOKER) { g.font = Math.round(h * 0.55) + 'px system-ui, sans-serif'; g.fillText('🃏', 0, 1); return; }
  g.fillStyle = isRed(n) ? '#c62828' : '#141414';
  g.font = '700 ' + Math.round(h * 0.3) + 'px Inconsolata, monospace'; g.fillText(RANKS[n % 13], -w * 0.18, -h * 0.26);
  g.font = Math.round(h * 0.44) + 'px Georgia, serif'; g.fillText(SUITS[suitOf(n)], w * 0.04, h * 0.14);
}
/**
 * Colours of the canvas world for the page's theme (shell.theme.light):
 * floating texts, the level banner, the night or day room of the casino.
 */
export function ink(light) {
  return light ? {
    light: true, gold: '#8a6510', text: '#2b3138', red: '#c62828',
    band: 'rgba(255,250,240,.9)', bandText: '#1d222b', bandGold: '#8a6510', bandLine: 'rgba(140,105,20,.6)',
    skyTop: '#f7f0e3', skyBot: '#e6d9c1', rim: '#8a6a4a', farFelt: '#3f8f63', shade: '#4b5a54', lamp: '200,150,60', glow: '200,150,60',
  } : {
    light: false, gold: '#d8b25a', text: '#f5f0e3', red: '#ff8a80',
    band: 'rgba(11,18,16,.72)', bandText: '#f5f0e3', bandGold: '#d8b25a', bandLine: 'rgba(216,178,90,.6)',
    skyTop: '#0a100e', skyBot: '#16251e', rim: '#2a1a10', farFelt: '#123d28', shade: '#20302a', lamp: '216,178,90', glow: '216,178,90',
  };
}
/** Rounded rectangle path. */
export function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/**
 * The Ace in `layer`: poses (idle run air duck balance wave ko), moods
 * (mc-m-smile jump yay ko cool fierce), the All-In king look, and place():
 * his feet (84, 212 in sprite px) at world (x, y), sprite scale s, world→CSS k.
 * id: the root's id, for several actors at once (Tapis!, one per column;
 * their CSS is the same, scoped to each id). Default: the Ace (ACE_ID).
 */
export function aceActor(layer, id = ACE_ID) {
  if (!document.getElementById(id + '-css')) {
    const st = document.createElement('style'); st.id = id + '-css';
    st.textContent = actorKit(id).css + (id === ACE_ID ? CSS : CSS.split(ACE_ID).join(id));   // ours after the kit: overrides its fixed root
    document.head.appendChild(st);
  }
  const root = document.createElement('div');
  root.id = id;
  root.innerHTML = '<div class="ar-box"><div class="mc-pos mc-m-smile mc-hat-none mc-tool-none idle">' + actorKit(id).html + '</div></div>';
  layer.appendChild(root);
  const box = /** @type {HTMLElement} */ (root.firstElementChild);
  const pos = /** @type {HTMLElement} */ (box.firstElementChild);
  let poseNow = 'idle', moodNow = 'mc-m-smile', king = false, holdUntil = 0, wanted = 'mc-m-smile', lookAnim = null;
  let placeNow = '', fadeNow = '';
  const setMood = (m) => { if (m !== moodNow) { pos.classList.remove(moodNow); pos.classList.add(m); moodNow = m; } };
  const part = (c) => /** @type {HTMLElement|null} */ (pos.querySelector('.' + c));
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('reduce-fx'); } catch (e) { return false; } };
  /** A short body animation (Web Animations, over the poses' CSS). */
  const play = (c, frames, ms, easing) => { const el = part(c); if (!el || reduced() || !el.animate) return null; try { return el.animate(frames, { duration: ms, easing: easing || 'ease-out' }); } catch (e) { return null; } };
  return {
    pose(p) { if (p !== poseNow) { pos.classList.remove(poseNow); pos.classList.add(p); poseNow = p; } },
    /** The face; held while a look() shows another one. */
    mood(m) { wanted = m; if (performance.now() >= holdUntil) setMood(m); },
    /**
     * A bit of life (web.50, narmod « less stiff »): land (squash), jump
     * (stretch), hop, shiver (a close shave), wobble (a knock), cheer (a
     * little bounce of joy). Nothing with « reduce animations ».
     */
    fx(kind) {
      if (kind === 'land') play('mc-squash', [{ transform: 'scale(1.22,.78)' }, { offset: 0.45, transform: 'scale(.94,1.07)' }, { transform: 'scale(1,1)' }], 300);
      else if (kind === 'jump') play('mc-squash', [{ transform: 'scale(.86,1.16)' }, { transform: 'scale(1,1)' }], 260);
      else if (kind === 'hop') play('mc-flip', [{ transform: 'translateY(0)' }, { offset: 0.4, transform: 'translateY(-9px)' }, { transform: 'translateY(0)' }], 260);
      else if (kind === 'shiver') play('mc-flip', [{ transform: 'rotate(0)' }, { offset: 0.2, transform: 'rotate(-7deg)' }, { offset: 0.45, transform: 'rotate(6deg)' }, { offset: 0.7, transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' }], 360);
      else if (kind === 'wobble') play('mc-flip', [{ transform: 'rotate(0) translateX(0)' }, { offset: 0.15, transform: 'rotate(-14deg) translateX(-6px)' }, { offset: 0.35, transform: 'rotate(11deg) translateX(5px)' },
        { offset: 0.55, transform: 'rotate(-7deg)' }, { offset: 0.75, transform: 'rotate(4deg)' }, { transform: 'rotate(0)' }], 620);
      else if (kind === 'cheer') play('mc-flip', [{ transform: 'translateY(0) scale(1)' }, { offset: 0.3, transform: 'translateY(-12px) scale(1.06,.96)' }, { offset: 0.6, transform: 'translateY(0) scale(1.08,.9)' }, { transform: 'translateY(0) scale(1)' }], 420);
    },
    /**
     * Turn round to show a face for `ms` (from his back: the card turns to us
     * and back), then the face the game asks for again.
     */
    look(m, ms, fromDeg) {
      const now = performance.now();
      if (now < holdUntil) return false;
      holdUntil = now + ms; setMood(m);
      setTimeout(() => { if (performance.now() >= holdUntil) setMood(wanted); }, ms + 20);
      const from = fromDeg == null ? 180 : fromDeg;
      if (from && !reduced()) {
        try { if (lookAnim) lookAnim.cancel(); } catch (e) {}
        const el = part('mc-card3d');
        if (el && el.animate) {
          lookAnim = el.animate([{ transform: 'rotateY(' + from + 'deg)' }, { offset: 0.22, transform: 'rotateY(18deg)', easing: 'ease-in-out' },
            { offset: 0.78, transform: 'rotateY(18deg)', easing: 'ease-in-out' }, { transform: 'rotateY(' + from + 'deg)' }], { duration: ms, easing: 'linear' });
        }
      }
      return true;
    },
    /** A hat of the mascot's wardrobe (cowboy, tophat, fedora, jester, crown…; '' none). */
    hat(h) {
      for (const c of [...pos.classList]) if (c.indexOf('mc-hat-') === 0) pos.classList.remove(c);
      pos.classList.add('mc-hat-' + (h || 'none'));
    },
    king(on, ending) {
      if (on !== king) {
        pos.classList.toggle('mc-hat-none', !on); pos.classList.toggle('mc-hat-crown', on);
        pos.classList.toggle('mc-tool-none', !on); pos.classList.toggle('mc-tool-scepter', on);
        pos.classList.toggle('ar-king', on); king = on;
      }
      pos.classList.toggle('ar-ending', !!(on && ending));
    },
    place(x, y, s, k, rot, flip) {
      // Origin on the feet: they land on (x, y) whatever the scale and the tilt.
      // flip (degrees): a somersault round his middle, top towards the viewer
      // (Ace Dash's backflip, seen from behind).
      const t = 'translate(' + (x * k - 84).toFixed(1) + 'px,' + (y * k - 212).toFixed(1) + 'px) scale(' + (s * k).toFixed(4) + ')'
        + (rot ? ' rotate(' + (+rot).toFixed(1) + 'deg)' : '')
        + (flip ? ' translateY(-96px) perspective(520px) rotateX(' + (-flip).toFixed(1) + 'deg) translateY(96px)' : '');
      // written only when it changes (web.107: at every frame the browser restyled him for nothing)
      if (t !== placeNow) { placeNow = t; box.style.transform = t; }
    },
    show(on) { root.style.display = on ? '' : 'none'; },
    /** Opacity of the Ace (1 = normal), e.g. a blink while protected. */
    fade(a) { if (typeof a !== 'number' || isNaN(a)) return; const o = a >= 1 ? '' : a.toFixed(3); if (o !== fadeNow) { fadeNow = o; box.style.opacity = o; } },
    remove() { root.remove(); },
  };
}
