// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Hidden mini-games — the arcade page and its shell (web extension, narmod
// 2026-10-16; a real page since web.88).
//
// The games live on their own screen, #s-arcade (pokerth-client.html): the
// header of « Create a table » — back arrow, title, « ? » (rules of the game
// on screen), trophies, accessibility, the ⚙ menu — over #arcade-main, which
// the shell fills:
//   .pg-play   a stage (canvas: the world, logical height H = 360, width from
//              the stage's shape; a DOM layer for actors such as the Ace, the
//              SVG of modules/mascot/engine.mjs; a HUD; a panel slot for title,
//              game over, pause) and the ▲ ▼ touch buttons — under the stage
//              in portrait, either side of it in landscape
//   .pg-view   a page game, without a stage: the arcade's home (menu.mjs)
//   .pg-rules  the rules sheet of a game (rulesKey of its registry entry)
// The stage is sized from the room left on the page (ResizeObserver), within
// the game's aspect range (registry entry `aspect`, default 4:3 … 2.4:1), so a
// phone can turn between portrait and landscape at any moment.
//
// A game is a module exporting create(shell) → { update(dt), draw(g),
// input(action, down, info), running(), resize(), destroy() }.
// Input → actions: 'jump' (Space, Enter, ↑, W, tap, pad A / B / D-pad up),
// 'duck' (↓, S, swipe down, pad D-pad down / stick down), 'left' / 'right'
// (←/→, A/D, pad D-pad / stick); info tells where it came from ({ code } a
// key, { x, y } a tap in world px, { pad }). A lane game (shell.lanes(true),
// Ace Dash) reads the touch screen as swipes instead: ← → change lane, ↑ or a
// tap jumps once the finger is lifted ({ x, y, tap }), ↓ ducks ({ swipe }); its
// touch pad gets ◀ ▶ too. The shell handles pause (P,
// Start; also a hidden tab, a lost focus or a window opened from the header)
// and back — Esc outside a run, pad Select, the header arrow, Android's Back
// (modules/ui/back-guard.mjs): rules sheet → the arcade's home → the screen
// the arcade was opened from. While the arcade is open, keys stay out of the
// client behind it (not out of a window opened over it), the gamepad
// navigation steps aside (window._pthPadOwner, modules/ui/gamepad.mjs) and the
// mascot keeps off stage (window._pthGameOn, modules/mascot/index.mjs).
//
// Light or dark: the page follows the theme (CSS tokens); games read
// shell.theme.light to paint their world (class pg-light on the root).
// Sounds reuse modules/sounds.mjs. Best score: localStorage pth_game_best_<id>.
// ═══════════════════════════════════════════════════════════════════

import { arcadeStat } from './stats.mjs';
import { frameStep, createQuality, savedCap, saveCap } from './quality.mjs';
import { createCalm } from './calm.mjs';

export const H = 360;
const ROOT_ID = 'pth-game';
const PAD_W = 84, PAD_H = 78;      // room the touch buttons take beside / under the stage

const CSS = `
#arcade-main{flex:1;min-height:0;display:flex;position:relative}
#${ROOT_ID}{position:relative;flex:1;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;box-sizing:border-box;
  padding:12px max(12px,env(safe-area-inset-right,0px)) calc(12px + var(--pth-sab,0px)) max(12px,env(safe-area-inset-left,0px));
  color:var(--text-hi);font-family:'Inter',system-ui,sans-serif;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;overflow:hidden}
#${ROOT_ID} .pg-play{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
#${ROOT_ID} .pg-play.pg-land{flex-direction:row}
#${ROOT_ID} .pg-play[hidden],#${ROOT_ID} .pg-view[hidden]{display:none}
#${ROOT_ID} .pg-stage{position:relative;flex:none;border-radius:14px;overflow:hidden;background:#131e19;
  box-shadow:0 0 0 1px rgba(216,178,90,.32),0 12px 34px rgba(0,0,0,.35);touch-action:none;cursor:pointer;outline:none}
#${ROOT_ID} canvas{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;display:block}
#${ROOT_ID} .pg-layer{position:absolute;top:0;right:0;bottom:0;left:0;z-index:2;pointer-events:none;overflow:hidden}
#${ROOT_ID} .pg-hud{position:absolute;left:0;right:0;top:0;z-index:3;pointer-events:none;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:10px 12px}
#${ROOT_ID} .pg-panel{position:absolute;top:0;right:0;bottom:0;left:0;z-index:4;display:flex;align-items:center;justify-content:center;padding:14px;text-align:center;
  background:radial-gradient(ellipse at center,rgba(11,18,16,.35),rgba(11,18,16,.82));pointer-events:none;color:#e8efea}
#${ROOT_ID} .pg-panel[hidden]{display:none}
#${ROOT_ID} .pg-panel.pg-clear{background:none}
#${ROOT_ID} .pg-pause-btns{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;pointer-events:auto;margin:4px 0}
#${ROOT_ID} .pg-pause-btns .pg-btn:focus-visible{outline:3px solid var(--gold);outline-offset:2px}
#${ROOT_ID} .pg-pk{display:none;font-style:normal;font-weight:800;margin-right:6px;border:1.5px solid currentColor;border-radius:50%;width:18px;height:18px;line-height:15px;font-size:11px;text-align:center}
body.has-gamepad #${ROOT_ID} .pg-pk{display:inline-block}
#${ROOT_ID} .pg-panel>div{display:flex;flex-direction:column;align-items:center;gap:8px;max-width:520px}
#${ROOT_ID} .pg-panel h2{margin:0;font:700 clamp(22px,4.4vw,38px)/1.05 'Cinzel',Georgia,serif;letter-spacing:.04em;color:#f5f0e3}
#${ROOT_ID} .pg-panel p{margin:0;font-size:clamp(12px,1.8vw,14px)}
#${ROOT_ID} .pg-k{display:inline-block;padding:0 6px;border:1px solid rgba(216,178,90,.35);border-radius:4px;font:600 .9em 'Inconsolata',monospace;color:#d8b25a}
#${ROOT_ID} .pg-dim{color:#9bb0a3;font-size:12px}
#${ROOT_ID} .pg-blink{animation:pgBlink 1.2s steps(2,start) infinite}
@keyframes pgBlink{to{visibility:hidden}}
#${ROOT_ID} .pg-pad{display:none;gap:14px}
#${ROOT_ID}.pg-touch .pg-pad{display:flex}
#${ROOT_ID}.pg-touch.pg-nopad .pg-pad{display:none}
#${ROOT_ID}.pg-touch .pg-land .pg-pad{display:contents}
#${ROOT_ID}.pg-touch.pg-nopad .pg-land .pg-pad{display:none}
#${ROOT_ID} .pg-land .pg-pad button[data-a="jump"]{order:-1}
#${ROOT_ID} .pg-land .pg-pad button[data-a="duck"]{order:1}
#${ROOT_ID} .pg-pad button{width:96px;height:64px;flex:none;border-radius:12px;border:0;background:var(--gold);color:var(--on-gold,#141414);font:700 20px system-ui,sans-serif;touch-action:none;cursor:pointer}
#${ROOT_ID} .pg-pad button[data-a="duck"]{background:transparent;color:var(--text-hi);box-shadow:inset 0 0 0 1px var(--border-hi)}
/* Landscape: beside the stage, as tall as it (easy to hit without looking). */
#${ROOT_ID} .pg-land .pg-pad button{width:72px;height:auto;align-self:stretch;min-height:64px}
#${ROOT_ID} .pg-pad button:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
/* Lane games (shell.lanes): ◀ ▶ as well — one row under the stage in portrait,
   ◀ ▶ on the left and ▲ ▼ on the right in landscape. */
#${ROOT_ID} .pg-pad button.pg-lr{display:none}
#${ROOT_ID}.pg-lanes .pg-pad button.pg-lr{display:block}
#${ROOT_ID}.pg-lanes .pg-pad{gap:10px}
#${ROOT_ID}.pg-lanes .pg-pad button{width:72px}
#${ROOT_ID}.pg-lanes .pg-land .pg-pad button[data-a="left"]{order:-3}
#${ROOT_ID}.pg-lanes .pg-land .pg-pad button[data-a="right"]{order:-2}
#${ROOT_ID}.pg-lanes .pg-land .pg-pad button[data-a="jump"]{order:1}
#${ROOT_ID}.pg-lanes .pg-land .pg-pad button[data-a="duck"]{order:2}
#${ROOT_ID} .pg-view{position:absolute;top:0;right:0;bottom:0;left:0;overflow:auto;padding:16px max(16px,env(safe-area-inset-right,0px)) calc(24px + var(--pth-sab,0px)) max(16px,env(safe-area-inset-left,0px))}
#${ROOT_ID} .pg-rules{position:absolute;top:0;right:0;bottom:0;left:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.45)}
#${ROOT_ID} .pg-rules[hidden]{display:none}
#${ROOT_ID} .pg-sheet{width:min(560px,100%);max-height:100%;overflow:auto;box-sizing:border-box;padding:16px 18px;border-radius:14px;
  background:var(--modal-bg,var(--panel));color:var(--text-hi);border:1px solid var(--border-hi);box-shadow:0 18px 50px rgba(0,0,0,.4);user-select:text;-webkit-user-select:text}
#${ROOT_ID} .pg-sheet h3{margin:0 0 10px;font:700 20px/1.2 'Cinzel',Georgia,serif;letter-spacing:.02em}
#${ROOT_ID} .pg-sheet ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:7px;font-size:14px;line-height:1.45;color:var(--text)}
#${ROOT_ID} .pg-sheet .pg-sheet-btns{display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}
#${ROOT_ID} .pg-btn{appearance:none;border:0;border-radius:10px;padding:9px 16px;font:600 14px 'Inter',system-ui,sans-serif;cursor:pointer;background:var(--gold);color:var(--on-gold,#141414)}
#${ROOT_ID} .pg-btn.pg-ghost{background:transparent;color:var(--text-hi);box-shadow:inset 0 0 0 1px var(--border-hi)}
#${ROOT_ID} .pg-btn:focus-visible{outline:2px solid var(--text-hi);outline-offset:2px}
/* Light theme: the panels and the HUD over a light world */
#${ROOT_ID}.pg-light .pg-panel{background:radial-gradient(ellipse at center,rgba(250,247,240,.45),rgba(250,247,240,.88));color:#2b3138}
#${ROOT_ID}.pg-light .pg-panel.pg-clear{background:none}
#${ROOT_ID}.pg-light .pg-panel h2{color:#1d222b}
#${ROOT_ID}.pg-light .pg-dim{color:#5a6470}
#${ROOT_ID}.pg-light .pg-k{border-color:rgba(140,105,20,.45);color:#7a5a08}
#${ROOT_ID}.pg-light .pg-stage{box-shadow:0 0 0 1px rgba(140,105,20,.35),0 10px 26px rgba(0,0,0,.15)}
#${ROOT_ID}.pg-light .pg-hud:not(.on-felt) .ar-num{color:#1d222b;text-shadow:none}
#${ROOT_ID}.pg-light .pg-hud:not(.on-felt) .ar-lab{color:#5a6470}
#${ROOT_ID}.pg-light .pg-hud:not(.on-felt) .ar-name{color:#7a5a08;text-shadow:none}
#${ROOT_ID}.pg-light .pg-hud:not(.on-felt) .hc-burn{color:#1d222b}
@media (prefers-reduced-motion:reduce){#${ROOT_ID} .pg-blink{animation:none}}
`;

const tr = (k, p) => {
  try { const s = typeof window.t === 'function' ? window.t(k, p) : k; return s && s !== k ? s : k; } catch (e) { return k; }
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function reduced() {
  try { if (document.documentElement.classList.contains('reduce-fx')) return true; } catch (e) {}
  try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
}
/** Is the page light? From the luminance of the theme's field colour. */
export function isLight() {
  try {
    const t = document.documentElement.getAttribute('data-theme') || '';
    if (/light/.test(t)) return true;
    const v = getComputedStyle(document.body || document.documentElement).backgroundColor || '';
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(v);
    if (m) return (0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3]) / 255 > 0.6;
  } catch (e) {}
  return false;
}
function touchFirst() {
  try { return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); } catch (e) { return false; }
}
/** Another window or menu of the client is open over the arcade. */
function windowOver() {
  try { return !!(window.keynavHasOpenSurface && window.keynavHasOpenSurface()); } catch (e) { return false; }
}
function editable(t) {
  const tag = t && t.tagName ? t.tagName.toLowerCase() : '';
  return tag === 'input' || tag === 'textarea' || tag === 'select' || !!(t && t.isContentEditable);
}

/**
 * Show the arcade page with game `def` (module `gameMod`) and run until the
 * player leaves it. opts.open(id) → Promise<[def, module]> switches game in
 * place (shell.open); opts.home is the game back goes to (the arcade's home)
 * before leaving. Resolves with the trophies the games asked for (shell.grant).
 */
export function run(def, gameMod, opts = {}) {
  return new Promise((resolve) => {
    if (!document.getElementById(ROOT_ID + '-css')) {
      const st = document.createElement('style'); st.id = ROOT_ID + '-css'; st.textContent = CSS;
      document.head.appendChild(st);
    }
    const main = document.getElementById('arcade-main');
    const screen = document.getElementById('s-arcade');
    if (!main || !screen) { resolve([]); return; }
    const prevScreen = (document.querySelector('.screen.active') || {}).id || 's-connect';
    // Opened from the login's form (the training nickname): back there, not
    // to the choice of modes the login falls back to when it shows again.
    const s2 = document.getElementById('login-step2');
    const fromForm = prevScreen === 's-connect' && !!s2 && s2.style.display !== 'none';
    main.innerHTML = '';
    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.innerHTML = '<div class="pg-play"><div class="pg-stage" tabindex="0"><canvas></canvas><div class="pg-layer"></div><div class="pg-hud"></div>'
      + '<div class="pg-panel" hidden><div></div></div><div class="pg-panel pg-pause" hidden><div><h2>' + esc(tr('arPause')) + '</h2>'
      // Resume or quit from the pause (web.65, narmod: « with a pad or a TV remote only, there was no way out »):
      // A / Start / OK resume, B / Select / Back quit; ←/→ move between the two.
      + '<div class="pg-pause-btns"><button type="button" class="pg-btn" data-p="resume"><i class="pg-pk">A</i>' + esc(tr('padMenuResume') || 'Resume') + '</button>'
      + '<button type="button" class="pg-btn pg-ghost" data-p="quit"><i class="pg-pk">B</i>' + esc(tr('arQuit') || 'Quit') + '</button></div>'
      + '<p class="pg-dim"><span class="pg-k">P</span> · <span class="pg-k">Esc</span></p></div></div></div>'
      + '<div class="pg-pad"><button type="button" class="pg-lr" data-a="left" aria-label="◀">◀</button><button type="button" data-a="jump" aria-label="▲">▲</button>'
      + '<button type="button" data-a="duck" aria-label="▼">▼</button><button type="button" class="pg-lr" data-a="right" aria-label="▶">▶</button></div></div>'
      + '<div class="pg-view" hidden></div>'
      + '<div class="pg-rules" hidden><div class="pg-sheet" role="dialog" aria-modal="true"></div></div>';
    main.appendChild(root);
    const play = /** @type {HTMLElement} */ (root.querySelector('.pg-play'));
    const stage = /** @type {HTMLElement} */ (root.querySelector('.pg-stage'));
    const canvas = /** @type {HTMLCanvasElement} */ (root.querySelector('canvas'));
    // Opaque (web.107): every game paints its whole background, so the browser need not blend the canvas.
    const g = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d', { alpha: false }));
    const panel = /** @type {HTMLElement} */ (root.querySelector('.pg-panel'));
    const pausePanel = /** @type {HTMLElement} */ (root.querySelector('.pg-pause'));
    const pauseQuit = () => { shell.pause(false); shell.back(); };
    pausePanel.querySelectorAll('[data-p]').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', (e) => { e.stopPropagation(); if (b.getAttribute('data-p') === 'quit') pauseQuit(); else shell.pause(false); });
    });
    const onEnd = () => !panel.hidden && panel.classList.contains('gm-end');
    /** ←/→ between the end screen's two buttons (end.mjs). */
    const endFocus = (d) => {
      const bs = Array.from(panel.querySelectorAll('[data-e]')), i = bs.indexOf(/** @type {any} */ (document.activeElement));
      try { /** @type {HTMLElement} */ (bs[(i < 0 ? 0 : i + d + bs.length) % bs.length]).focus({ preventScroll: true }); } catch (e) {}
    };
    /** ←/→ (keys, remote, pad) between the pause's two buttons. */
    const pauseFocus = (d) => {
      const bs = Array.from(pausePanel.querySelectorAll('[data-p]')), i = bs.indexOf(/** @type {any} */ (document.activeElement));
      try { /** @type {HTMLElement} */ (bs[(i < 0 ? 0 : i + d + bs.length) % bs.length]).focus({ preventScroll: true }); } catch (e) {}
    };
    const view = /** @type {HTMLElement} */ (root.querySelector('.pg-view'));
    const rulesBox = /** @type {HTMLElement} */ (root.querySelector('.pg-rules'));
    const sheet = /** @type {HTMLElement} */ (root.querySelector('.pg-sheet'));
    const titleEl = document.getElementById('ar-title');
    const helpBtn = document.getElementById('ar-help-btn');
    try { if (typeof window.show === 'function') window.show('s-arcade'); else { document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active')); screen.classList.add('active'); } } catch (e) {}
    window._pthGameOn = true;
    window._pthPadOwner = def.id;

    let cur = def;
    let padOn = true, lanes = false;
    const grants = [];
    let lastEnded = 0;
    const bestKey = () => 'pth_game_best_' + cur.id;
    // Quality per game (web.107, quality.mjs): its own sharpness kept from last time, tried one step higher.
    /** @type {ReturnType<typeof createQuality>|null} */
    let quality = null, settleAt = 0;
    // A game that says calm: true (calm.mjs, web.110): its canvas painted only when its drawing changes.
    let calm = null, calmOff = false;
    const shell = {
      H, W: 640, k: 1, dpr: 1,
      root, stage, canvas, g, view,
      layer: /** @type {HTMLElement} */ (root.querySelector('.pg-layer')),
      hud: /** @type {HTMLElement} */ (root.querySelector('.pg-hud')),
      reduced: reduced(),
      theme: { light: isLight() },
      t: tr, esc,
      /** Show `html` in the panel slot (null hides it); clear = no dimming behind. */
      panel(html, clear) {
        // The title template (title.mjs) adds its dark picture after this call.
        panel.classList.remove('gm-title', 'gm-end', 'gm-eout');
        shell.endBack = null; shell.endTimers = null;      // the end template (end.mjs) sets them again
        // The end screen takes the whole game area (end.mjs moves it out of the stage): back in the stage.
        if (panel.parentNode !== stage) { stage.insertBefore(panel, pausePanel); panel.style.removeProperty('--gm-ez'); }
        const bg = panel.querySelector(':scope > .gm-bg'); if (bg) bg.remove();
        if (html == null) { panel.hidden = true; return; }
        panel.firstElementChild.innerHTML = html; panel.hidden = false;
        panel.classList.toggle('pg-clear', !!clear);
      },
      best: {
        get() { try { return parseInt(localStorage.getItem(bestKey()) || '0', 10) || 0; } catch (e) { return 0; } },
        set(v) { try { localStorage.setItem(bestKey(), String(v)); } catch (e) {} },
      },
      /** Play a sound of modules/sounds.mjs by its global name (notifyCard…). */
      sound(name, ...args) { try { const f = window[name]; if (typeof f === 'function') f(...args); } catch (e) {} },
      paused: false,
      pause(on) {
        if (on === shell.paused) return;
        shell.paused = on; pausePanel.hidden = !on;
        if (!on) last = performance.now();
        else { try { /** @type {HTMLElement} */ (pausePanel.querySelector('[data-p="resume"]')).focus({ preventScroll: true }); } catch (e) {} }
      },
      close,
      /** Show or hide the ▲ ▼ touch buttons (a game played by tapping hides them). */
      touchPad(on) { padOn = !!on; root.classList.toggle('pg-nopad', !on); layout(); },
      /** A lane game: swipes on the stage (← → ↑ ↓, a tap jumps) and ◀ ▶ on the touch pad. */
      lanes(on) { lanes = !!on; root.classList.toggle('pg-lanes', lanes); layout(); },
      /** A round played to its end (the statistics of the Mini-games mode, web.25). */
      ended() {
        const now = Date.now();
        if (now - lastEnded < 1500) return;
        lastEnded = now;
        arcadeStat('end_' + cur.id);
      },
      /** Queue a secret trophy (granted once the arcade is left). */
      grant(id) { if (id && grants.indexOf(id) < 0) grants.push(id); },
      /** Switch to game `id` on the same page (needs opts.open). */
      open(id) {
        if (!opts.open) return;
        opts.open(id).then(([d, mod]) => { if (!closed) mount(d, mod); }).catch((e) => { try { console.warn('[games]', e); } catch (e2) {} });
      },
      /** Back: the rules sheet, then the arcade's home, then out of the arcade. */
      back() {
        if (!rulesBox.hidden) { hideRules(); return; }
        // On a game's end screen (end.mjs): back to that game's menu, not out of it.
        if (shell.endBack && !panel.hidden && panel.classList.contains('gm-end')) { const f = shell.endBack; shell.endBack = null; f(); return; }
        if (opts.home && cur.id !== opts.home) shell.open(opts.home); else close();
      },
      /** The rules sheet of game `d` (default: the one on screen); onPlay adds a « Play » button. */
      rules(d, onPlay) { showRules(d || cur, onPlay); },
      isHome: () => !!opts.home && cur.id === opts.home,
    };

    // ── Rules sheet ───────────────────────────────────────────────────
    let rulesPaused = false;
    function showRules(d, onPlay) {
      if (!d || !d.rulesKey) return;
      const lines = String(tr(d.rulesKey)).split('\n').filter((x) => x.trim());
      // Rules added later (rulesMore: keys of their own), before the last line — the keys.
      if (d.rulesMore) lines.splice(Math.max(0, lines.length - 1), 0, ...d.rulesMore.map((k) => String(tr(k))));
      sheet.innerHTML = '<h3>' + esc(d.name || '') + '</h3><ul>' + lines.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul>'
        + '<div class="pg-sheet-btns">' + (onPlay ? '<button type="button" class="pg-btn" data-r="play">' + esc(tr('gmPlay')) + '</button>' : '')
        + '<button type="button" class="pg-btn' + (onPlay ? ' pg-ghost' : '') + '" data-r="close">' + esc(tr('closeTooltip')) + '</button></div>';
      sheet.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        hideRules();
        if (b.getAttribute('data-r') === 'play' && onPlay) onPlay();
      }));
      if (game && game.running && game.running() && !shell.paused) { shell.pause(true); rulesPaused = true; }
      rulesBox.hidden = false;
      try { /** @type {HTMLElement} */ (sheet.querySelector('button')).focus({ preventScroll: true }); } catch (e) {}
    }
    function hideRules() {
      rulesBox.hidden = true;
      if (rulesPaused) { rulesPaused = false; shell.pause(false); }
      try { stage.focus({ preventScroll: true }); } catch (e) {}
    }
    rulesBox.addEventListener('pointerdown', (e) => { if (e.target === rulesBox) hideRules(); });

    // ── Layout: the stage fills the room left, in the game's shape ───
    function layout() {
      const page = !!cur.page;
      play.hidden = page; view.hidden = !page;
      root.classList.toggle('pg-touch', touchFirst());
      if (page) return;
      const cs = getComputedStyle(root);
      const aw = root.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ah = root.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (aw <= 0 || ah <= 0) return;
      const pad = touchFirst() && padOn;
      const land = aw > ah * 1.15;
      play.classList.toggle('pg-land', land);
      const [amin, amax] = cur.aspect || [4 / 3, 2.4];
      const roomW = land && pad ? aw - (lanes ? 4 : 2) * PAD_W : aw;
      const roomH = !land && pad ? ah - PAD_H : ah;
      let w = Math.min(roomW, roomH * amax, 1100);
      const aspect = Math.max(amin, Math.min(amax, w / roomH));
      let h = w / aspect;
      if (h > roomH) { h = roomH; w = h * aspect; }
      w = Math.floor(w); h = Math.floor(h);
      if (stage.style.width !== w + 'px' || stage.style.height !== h + 'px') { stage.style.width = w + 'px'; stage.style.height = h + 'px'; }
      sizeCanvas(w, h);
    }
    function sizeCanvas(cw, ch) {
      if (!cw || !ch) return;
      // The quality (web.107, quality.mjs): the screen's sharpness, less only if this device cannot keep up.
      const dpr = quality ? quality.dpr : Math.min(window.devicePixelRatio || 1, 2);
      const k = ch / H, W = cw / k;
      const pw = Math.round(cw * dpr), ph = Math.round(ch * dpr);
      if (canvas.width === pw && canvas.height === ph && shell.k === k) return;
      shell.dpr = dpr; shell.k = k; shell.W = W;
      canvas.width = pw; canvas.height = ph;
      if (quality) quality.reset();
      if (calm) calm.reset();
      settleAt = performance.now() + 1500;
      try { if (game && game.resize) game.resize(); } catch (e) {}
    }
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => layout()) : null;
    if (ro) ro.observe(root);
    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // ── Theme ─────────────────────────────────────────────────────────
    const syncTheme = () => { shell.theme.light = isLight(); root.classList.toggle('pg-light', shell.theme.light); };
    syncTheme();
    const mo = new MutationObserver(() => { syncTheme(); try { if (game && game.theme) game.theme(); } catch (e) {} });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });

    let game = null;
    const nativeDpr = () => Math.min(window.devicePixelRatio || 1, 2);
    function mount(d, mod) {
      try { if (game && game.destroy) game.destroy(); } catch (e) {}
      game = null;
      rulesBox.hidden = true; rulesPaused = false;
      shell.layer.innerHTML = ''; shell.hud.innerHTML = ''; shell.hud.className = 'pg-hud'; view.innerHTML = '';
      shell.panel(null); shell.pause(false); padOn = true; root.classList.remove('pg-nopad');
      lanes = false; root.classList.remove('pg-lanes'); shell.padMode = null;
      cur = d; window._pthPadOwner = d.id;
      quality = d.page ? null : createQuality(nativeDpr(), savedCap(d.id));
      calm = null; calmOff = false;
      if (titleEl) titleEl.textContent = d.id === opts.home ? (tr('gmTitle') || 'Mini-games') : (d.name || tr('gmTitle') || 'Mini-games');
      if (helpBtn) helpBtn.style.display = d.rulesKey ? '' : 'none';
      layout();
      try { game = mod.create(shell); } catch (e) { try { console.warn('[games]', e); } catch (e2) {} }
      layout();
      try { (d.page ? view : stage).focus({ preventScroll: true }); } catch (e) {}
    }
    mount(def, gameMod);
    try { if (opts.onShell) opts.onShell(shell); } catch (e) {}

    // ── Input ───────────────────────────────────────────────────────
    const send = (a, down, info) => { if (!game || !rulesBox.hidden || (shell.paused && down)) return; try { game.input(a, down, info || {}); } catch (e) {} };
    const KEYS = { Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', ArrowDown: 'duck', KeyS: 'duck',
      ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Enter: 'jump', NumpadEnter: 'jump',
      // 1 2 3: a game's own choices (Who Wins?'s jokers, Higher or Lower's bets); ignored by the others.
      Digit1: 'n1', Digit2: 'n2', Digit3: 'n3', Numpad1: 'n1', Numpad2: 'n2', Numpad3: 'n3',
      // 4: Higher or Lower's Fold (web.44).
      Digit4: 'n4', Numpad4: 'n4',
      // R: the rules of the lit game on the arcade page (web.65).
      KeyR: 'rules' };
    function onKey(e) {
      if (closed || !screen.classList.contains('active')) return;
      // A window opened from the header (options, trophies…) or a field: its keys.
      if (windowOver() || editable(e.target)) return;
      const down = e.type === 'keydown';
      // A TV remote's Back (GoBack, BrowserBack, Android 4) acts as Escape; its ⏯ as P.
      const back = e.code === 'Escape' || e.key === 'GoBack' || e.key === 'BrowserBack' || e.keyCode === 4;
      const playPause = e.key === 'MediaPlayPause' || e.key === 'MediaPlay' || e.key === 'MediaPause' || e.keyCode === 179;
      if (shell.paused && rulesBox.hidden && down && (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'ArrowUp' || e.code === 'ArrowDown')) {
        pauseFocus(e.code === 'ArrowLeft' || e.code === 'ArrowUp' ? -1 : 1); e.preventDefault(); e.stopImmediatePropagation(); return;
      }
      if (onEnd() && rulesBox.hidden && down && (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || !panel.classList.contains('gm-ekeys') && (e.code === 'ArrowUp' || e.code === 'ArrowDown'))) {
        endFocus(e.code === 'ArrowLeft' || e.code === 'ArrowUp' ? -1 : 1); e.preventDefault(); e.stopImmediatePropagation(); return;
      }
      const onButton = e.target && /** @type {HTMLElement} */ (e.target).tagName === 'BUTTON';
      const a = (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') && onButton ? null : KEYS[e.code];
      if (back && down) {
        if (rulesBox.hidden && game && game.running && game.running() && !shell.paused) shell.pause(true);
        else { if (rulesBox.hidden) shell.pause(false); shell.back(); }
      } else if ((e.code === 'KeyP' || e.code === 'Pause' || playPause) && down) {
        if (game && game.running && game.running() && rulesBox.hidden) shell.pause(!shell.paused);
      } else if (a && rulesBox.hidden) {
        if (down && shell.paused) shell.pause(false);
        else if (!(down && e.repeat)) send(a, down, { code: e.code });
      } else {
        // Any other key: kept from the client behind the page (the browser's
        // own — Tab, F5, F11, Ctrl+… — still works; so do the buttons).
        if (!e.ctrlKey && !e.metaKey && !onButton && e.code !== 'Tab') e.stopImmediatePropagation();
        return;
      }
      e.preventDefault(); e.stopImmediatePropagation();
    }
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKey, true);

    let pX = null, pY = null, swiped = false, pResumed = false;
    stage.addEventListener('pointerdown', (e) => {
      if (e.target && /** @type {HTMLElement} */ (e.target).closest && /** @type {HTMLElement} */ (e.target).closest('button')) return;   // a button of a panel
      e.preventDefault(); pX = e.clientX; pY = e.clientY; swiped = false; pResumed = false;
      if (shell.paused) { shell.pause(false); pResumed = true; return; }
      if (lanes) return;          // a lane game waits for the swipe or the lift
      const r = stage.getBoundingClientRect();
      send('jump', true, { x: (e.clientX - r.left) / (shell.k || 1), y: (e.clientY - r.top) / (shell.k || 1) });
    });
    stage.addEventListener('pointermove', (e) => {
      if (pY == null || swiped) return;
      if (lanes) {
        const dx = e.clientX - (pX || 0), dy = e.clientY - pY;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 28 || pResumed) return;
        swiped = true;
        if (Math.abs(dx) > Math.abs(dy)) send(dx < 0 ? 'left' : 'right', true, { swipe: dx < 0 ? 'left' : 'right' });
        else if (dy < 0) send('jump', true, { swipe: 'up' });
        else send('duck', true, { swipe: 'down' });
        return;
      }
      if (e.clientY - pY > 28) { swiped = true; send('jump', false); send('duck', true); }
    });
    const lift = (e) => {
      if (pY == null) return;
      if (lanes && !swiped && !pResumed && e && e.type === 'pointerup') {
        const r = stage.getBoundingClientRect();
        send('jump', true, { x: (e.clientX - r.left) / (shell.k || 1), y: (e.clientY - r.top) / (shell.k || 1), tap: true });
      }
      pX = pY = null; send('jump', false); send('duck', false);
    };
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((n) => stage.addEventListener(n, lift));
    root.querySelectorAll('.pg-pad button').forEach((b) => {
      const a = b.getAttribute('data-a');
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (shell.paused) shell.pause(false); else send(a, true); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((n) => b.addEventListener(n, () => send(a, false)));
    });
    root.addEventListener('contextmenu', (e) => e.preventDefault());
    // The header's ⚙ menu folds on any click elsewhere.
    const foldMenu = () => { const m = document.getElementById('ar-overflow-menu'); if (m) m.classList.remove('open'); };
    document.addEventListener('click', foldMenu);

    // Gamepad: polled every frame (standard mapping). Three ways of reading it
    // (web.65, narmod: « with the pad it doesn't work at all — left/right like
    // a real video game, nitro on a button; up/down to move in the menus, the
    // other things on buttons »):
    //   menus — the arcade page and a game's title screen: D-pad / stick move
    //     (up/down too), A play, Y rules (the page) or a title's option, X a
    //     title's second option (n4), B / Select back;
    //   racing — a game that says shell.padMode = 'racing' (Poker Run): ←/→
    //     held and let go, A or RT nitro, B, LT or ↓ brake;
    //   other games — A / B / ↑ jump, ↓ duck, ←/→ (now let go too).
    // The stick counts on its main axis only, so steering never presses up or down.
    let padPrev = [];
    function pollPad() {
      let list = [];
      try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; } catch (e) {}
      if (!list.length || windowOver()) { padPrev = []; return; }
      const p = [];
      for (const pad of list) {
        const b = (i) => !!(pad.buttons[i] && (pad.buttons[i].pressed || pad.buttons[i].value > 0.4));
        const ax = pad.axes && pad.axes.length ? pad.axes[0] : 0, ay = pad.axes && pad.axes.length > 1 ? pad.axes[1] : 0;
        const horiz = Math.abs(ax) >= Math.abs(ay);
        if (b(0)) p[0] = true;                                    // A
        if (b(1)) p[7] = true;                                    // B
        if (b(2)) p[9] = true;                                    // X
        if (b(3)) p[8] = true;                                    // Y
        if (b(6)) p[11] = true;                                   // LT
        if (b(7)) p[10] = true;                                   // RT
        if (b(12) || (!horiz && ay < -0.6)) p[6] = true;          // up
        if (b(13) || (!horiz && ay > 0.6)) p[1] = true;           // down
        if (b(9)) p[2] = true;                                    // Start: pause
        if (b(8)) p[3] = true;                                    // Select: back
        if (b(14) || (horiz && ax < -0.5)) p[4] = true;           // left
        if (b(15) || (horiz && ax > 0.5)) p[5] = true;            // right
      }
      const dn = (i) => p[i] && !padPrev[i], up = (i) => !p[i] && padPrev[i];
      if (dn(3)) { padPrev = p; if (rulesBox.hidden) shell.pause(false); shell.back(); return; }
      if (!rulesBox.hidden) { if (dn(0) || dn(7)) hideRules(); padPrev = p; return; }
      const running = !!(game && game.running && game.running());
      // Paused: A or Start resume, B quits (Select too, above), ←/→ between the buttons.
      if (shell.paused && !cur.page) {
        if (dn(0) || dn(2)) shell.pause(false);
        else if (dn(7)) { padPrev = p; pauseQuit(); return; }
        else if (dn(4) || dn(6)) pauseFocus(-1);
        else if (dn(5) || dn(1)) pauseFocus(1);
        padPrev = p;
        return;
      }
      // The end screen (end.mjs): A presses the lit button (« play again » at first), B the game's menu, ←/→ between them.
      if (!running && onEnd()) {
        if (dn(0) || dn(2)) { const b = /** @type {HTMLElement|null} */ (document.activeElement && panel.contains(document.activeElement) ? document.activeElement : panel.querySelector('[data-e="again"]')); padPrev = p; if (b) b.click(); return; }
        if (dn(7)) { padPrev = p; shell.back(); return; }
        if (dn(4) || dn(6)) endFocus(-1);
        if (dn(5) || dn(1)) endFocus(1);
        padPrev = p;
        return;
      }
      const menu = !!cur.page || (!running && panel.classList.contains('gm-title') && !panel.hidden);
      if (menu) {
        if (dn(4)) send('left', true);
        if (dn(5)) send('right', true);
        if (dn(6)) send(game && game.grid ? 'up' : 'left', true, { pad: 'up' });
        if (dn(1)) send(game && game.grid ? 'down' : 'right', true, { pad: 'down' });
        if (dn(0) || dn(2)) send('jump', true, { pad: 'a' });
        if (up(0) || up(2)) send('jump', false);
        if (dn(8)) send(cur.page ? 'rules' : 'duck', true, { pad: 'y' });
        if (dn(9)) send('n4', true, { pad: 'x' });
        if (dn(7)) { padPrev = p; shell.back(); return; }
        padPrev = p;
        return;
      }
      if (dn(4)) send('left', true);
      if (dn(5)) send('right', true);
      if (up(4)) send('left', false);
      if (up(5)) send('right', false);
      if (shell.padMode === 'racing' && running) {
        if (dn(2)) shell.pause(!shell.paused);
        const nit = p[0] || p[10], was = padPrev[0] || padPrev[10];
        if (nit && !was) { if (shell.paused) shell.pause(false); else send('jump', true, { pad: 'a' }); }
        if (!nit && was) send('jump', false);
        const brk = p[7] || p[11] || p[1], wasB = padPrev[7] || padPrev[11] || padPrev[1];
        if (brk && !wasB) send('duck', true, { pad: 'b' });
        if (!brk && wasB) send('duck', false);
        padPrev = p;
        return;
      }
      if (p[7]) p[0] = true;                                      // B jumps too
      if (p[6]) p[0] = true;                                      // and ↑
      if (dn(2) && running) shell.pause(!shell.paused);
      else if (dn(0)) { if (shell.paused) shell.pause(false); else send('jump', true, { pad: p[6] ? 'up' : 'a' }); }
      if (up(0)) send('jump', false);
      if (dn(1)) send('duck', true, { pad: 'down' });
      if (up(1)) send('duck', false);
      if (dn(9)) send('n4', true, { pad: 'x' });
      padPrev = p;
    }

    const onHide = () => { if (game && game.running && game.running()) shell.pause(true); };
    const onVis = () => { if (document.hidden) onHide(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onHide);

    // ── Loop ────────────────────────────────────────────────────────
    // web.107 (audit claude/AUDIT_PERF_MINIJEUX_2026-11-16.md): on a 120/144 Hz screen one frame out of
    // frameStep() is drawn (60 to 82 a second, the games follow dt); the open windows are looked for four
    // times a second, not at every frame (getComputedStyle on ~36 windows); the quality watches the draws.
    let raf = 0, last = performance.now(), closed = false, prevRaf = 0, tick = 0, woAt = 0, woOver = false;
    const vs = [];
    function frame(now) {
      if (closed) return;
      raf = requestAnimationFrame(frame);
      if (prevRaf) { vs.push(now - prevRaf); if (vs.length > 60) vs.shift(); }
      prevRaf = now;
      // The screen's refresh: the quick end of the last 60 ticks (a slow machine makes them all long, its
      // screen is not slower for that), at most 60 Hz's, so a late draw shows as late — unless they are all
      // steady and long (a battery saver holding the page at 30 a second: lowering the quality would not help).
      let vsync = 1000 / 60;
      if (vs.length >= 10) {
        const so = vs.slice().sort((a, b) => a - b), lo = so[Math.floor(so.length * 0.1)], hi = so[Math.floor(so.length * 0.9)];
        vsync = lo > 25 && hi < lo * 1.15 ? lo : Math.min(1000 / 60, lo);
      }
      const step = frameStep(vsync);
      if (++tick % step) return;
      const ms = now - last;
      const dt = Math.min(0.05, Math.max(0, ms / 1000)); last = now;
      // The arcade left by another route (a disconnection, a link…): close cleanly.
      if (!screen.classList.contains('active')) { close(true); return; }
      pollPad();
      if (closed) return;
      if (now - woAt > 250) { woAt = now; woOver = windowOver(); }
      if (woOver) onHide();                        // a window opened from the header: pause
      try {
        if (game && !shell.paused) game.update(dt);
        if (!cur.page) {
          g.setTransform(shell.dpr * shell.k, 0, 0, shell.dpr * shell.k, 0, 0);
          if (game && game.calm && !calmOff) {
            if (!calm) { calm = createCalm(); try { if (navigator.webdriver) window.__pthCalm = calm; } catch (e) {} }
            calm.draw(g, (c) => game.draw(c));
            if (calm.broken) calmOff = true;           // a call it cannot record: this game draws directly
          } else if (game) game.draw(g);
        }
      } catch (e) { try { console.warn('[games]', e); } catch (e2) {} }
      if (quality && !cur.page && !shell.paused && !document.hidden && now > settleAt) {
        if (quality.frame(ms, vsync * step)) { saveCap(cur.id, quality.dpr); layout(); }
        else if (quality.good === 3 && savedCap(cur.id) !== quality.dpr) saveCap(cur.id, quality.dpr);
      } else if (quality) quality.reset();
    }
    raf = requestAnimationFrame(frame);

    function close(already) {
      if (closed) return;
      closed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKey, true);
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('click', foldMenu);
      window.removeEventListener('blur', onHide);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      try { if (ro) ro.disconnect(); } catch (e) {}
      try { mo.disconnect(); } catch (e) {}
      try { if (game && game.destroy) game.destroy(); } catch (e) {}
      root.remove();
      window._pthGameOn = false;
      window._pthPadOwner = null;
      if (!already) {
        try { if (typeof window.show === 'function') window.show(prevScreen); } catch (e) {}
        if (fromForm) setTimeout(() => {
          try {
            const s1 = document.getElementById('login-step1');
            if (s1) s1.style.display = 'none';
            if (s2) s2.style.display = '';
            if (typeof window.loginHeaderFold === 'function') window.loginHeaderFold(true);
          } catch (e) {}
        }, 0);
      }
      resolve(grants);
    }
  });
}
