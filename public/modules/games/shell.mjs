// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Hidden mini-games — shared shell (web extension, narmod 2026-10-16).
//
// One full-screen overlay above everything (z-index 100000): a stage with a
// canvas (the world, logical height H = 360, width from the stage's aspect),
// a DOM layer above it (actors such as the Ace, who stays the SVG of
// modules/mascot/engine.mjs), a HUD and a panel slot (title, game over,
// pause). The shell owns the loop, the input and the best score; a game is a
// module exporting create(shell) → { update(dt), draw(g), input(action, down),
// resize() , destroy() }.
//
// Input → actions: 'jump' (Space, ↑, W, tap, pad A / B / D-pad up),
// 'duck' (↓, S, swipe down, pad D-pad down / stick down). The shell handles
// pause (P, Start; also a hidden tab or a lost focus) and quit (✕, Esc
// outside a run, pad Select). While a game is open, keys never reach the
// rest of the client (capture phase), the gamepad navigation steps aside
// (window._pthPadOwner, modules/ui/gamepad.mjs) and the mascot does not
// come on stage (window._pthGameOn, modules/mascot/index.mjs).
//
// Sounds reuse modules/sounds.mjs (the player's mute and categories apply).
// Best score: localStorage pth_game_best_<id>.
// ═══════════════════════════════════════════════════════════════════

export const H = 360;
const ROOT_ID = 'pth-game';

const CSS = `
#${ROOT_ID}{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
  padding:calc(var(--pth-sat,0px) + 12px) max(12px,env(safe-area-inset-right,0px)) calc(var(--pth-sab,0px) + 12px) max(12px,env(safe-area-inset-left,0px));
  background:radial-gradient(ellipse at 50% 40%,rgba(19,30,25,.92),rgba(6,10,9,.97));color:#e8efea;font-family:'Inter',system-ui,sans-serif;
  -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:contain}
#${ROOT_ID} .pg-stage{position:relative;width:min(980px,calc(100vw - 24px),calc((100dvh - 110px) * 16 / 7));aspect-ratio:16/7;border-radius:14px;overflow:hidden;
  background:#131e19;box-shadow:0 0 0 1px rgba(216,178,90,.3),0 18px 50px rgba(0,0,0,.6);touch-action:none;cursor:pointer;outline:none}
@media (max-aspect-ratio:1/1){#${ROOT_ID} .pg-stage{aspect-ratio:4/3;width:min(980px,calc(100vw - 24px),calc((100dvh - 150px) * 4 / 3))}}
#${ROOT_ID} canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#${ROOT_ID} .pg-layer{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}
#${ROOT_ID} .pg-hud{position:absolute;left:0;right:0;top:0;z-index:3;pointer-events:none;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:10px 12px}
#${ROOT_ID} .pg-panel{position:absolute;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;padding:14px;text-align:center;
  background:radial-gradient(ellipse at center,rgba(11,18,16,.35),rgba(11,18,16,.82));pointer-events:none}
#${ROOT_ID} .pg-panel[hidden]{display:none}
#${ROOT_ID} .pg-panel>div{display:flex;flex-direction:column;align-items:center;gap:8px;max-width:520px}
#${ROOT_ID} h2{margin:0;font:700 clamp(22px,4.4vw,38px)/1.05 'Cinzel',Georgia,serif;letter-spacing:.04em;color:#f5f0e3}
#${ROOT_ID} p{margin:0;font-size:clamp(12px,1.8vw,14px)}
#${ROOT_ID} .pg-k{display:inline-block;padding:0 6px;border:1px solid rgba(216,178,90,.35);border-radius:4px;font:600 .9em 'Inconsolata',monospace;color:#d8b25a}
#${ROOT_ID} .pg-dim{color:#9bb0a3;font-size:12px}
#${ROOT_ID} .pg-blink{animation:pgBlink 1.2s steps(2,start) infinite}
@keyframes pgBlink{to{visibility:hidden}}
#${ROOT_ID} .pg-close{position:absolute;top:calc(var(--pth-sat,0px) + 10px);right:max(10px,env(safe-area-inset-right,0px));width:40px;height:40px;border-radius:50%;border:0;
  background:rgba(245,240,227,.08);color:#e8efea;font:400 22px/40px system-ui,sans-serif;cursor:pointer}
#${ROOT_ID} .pg-close:focus-visible,#${ROOT_ID} .pg-pad button:focus-visible{outline:2px solid #d8b25a;outline-offset:2px}
#${ROOT_ID} .pg-pad{display:none;gap:14px}
#${ROOT_ID} .pg-pad button{width:72px;height:52px;border-radius:12px;border:0;background:#d8b25a;color:#0b1210;font:700 20px system-ui,sans-serif;touch-action:none}
#${ROOT_ID} .pg-pad button+button{background:transparent;color:#e8efea;box-shadow:inset 0 0 0 1px rgba(216,178,90,.4)}
@media (pointer:coarse){#${ROOT_ID} .pg-pad{display:flex}}
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

/** Open the overlay, run the game until the player quits. */
export function run(def, gameMod) {
  return new Promise((resolve) => {
    if (!document.getElementById(ROOT_ID + '-css')) {
      const st = document.createElement('style'); st.id = ROOT_ID + '-css'; st.textContent = CSS;
      document.head.appendChild(st);
    }
    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Ace Runner');
    root.innerHTML = '<button class="pg-close" type="button" aria-label="' + esc(tr('arQuit')) + '">✕</button>'
      + '<div class="pg-stage" tabindex="0"><canvas></canvas><div class="pg-layer"></div><div class="pg-hud"></div>'
      + '<div class="pg-panel" hidden><div></div></div><div class="pg-panel pg-pause" hidden><div><h2>' + esc(tr('arPause')) + '</h2>'
      + '<p class="pg-dim"><span class="pg-k">P</span> · <span class="pg-k">Esc</span></p></div></div></div>'
      + '<div class="pg-pad"><button type="button" data-a="jump" aria-label="▲">▲</button><button type="button" data-a="duck" aria-label="▼">▼</button></div>';
    document.body.appendChild(root);
    const stage = /** @type {HTMLElement} */ (root.querySelector('.pg-stage'));
    const canvas = /** @type {HTMLCanvasElement} */ (root.querySelector('canvas'));
    const g = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    const panel = /** @type {HTMLElement} */ (root.querySelector('.pg-panel'));
    const pausePanel = /** @type {HTMLElement} */ (root.querySelector('.pg-pause'));
    const prevFocus = document.activeElement;
    window._pthGameOn = true;
    window._pthPadOwner = def.id;

    const bestKey = 'pth_game_best_' + def.id;
    const shell = {
      H, W: 640, k: 1, dpr: 1,
      root, stage, canvas, g,
      layer: /** @type {HTMLElement} */ (root.querySelector('.pg-layer')),
      hud: /** @type {HTMLElement} */ (root.querySelector('.pg-hud')),
      reduced: reduced(),
      t: tr, esc,
      /** Show `html` in the panel slot (null hides it). */
      panel(html) {
        if (html == null) { panel.hidden = true; return; }
        panel.firstElementChild.innerHTML = html; panel.hidden = false;
      },
      best: {
        get() { try { return parseInt(localStorage.getItem(bestKey) || '0', 10) || 0; } catch (e) { return 0; } },
        set(v) { try { localStorage.setItem(bestKey, String(v)); } catch (e) {} },
      },
      /** Play a sound of modules/sounds.mjs by its global name (notifyCard…). */
      sound(name, ...args) { try { const f = window[name]; if (typeof f === 'function') f(...args); } catch (e) {} },
      paused: false,
      pause(on) {
        if (on === shell.paused) return;
        shell.paused = on; pausePanel.hidden = !on;
        if (!on) last = performance.now();
      },
      close,
    };

    function resize() {
      const cw = stage.clientWidth, ch = stage.clientHeight;
      if (!cw || !ch) return;
      shell.dpr = Math.min(window.devicePixelRatio || 1, 2);
      shell.k = ch / H; shell.W = cw / shell.k;
      canvas.width = Math.round(cw * shell.dpr); canvas.height = Math.round(ch * shell.dpr);
      try { if (game && game.resize) game.resize(); } catch (e) {}
    }

    let game = null;
    try { game = gameMod.create(shell); } catch (e) { try { console.warn('[games]', e); } catch (e2) {} }
    resize();

    // ── Input ───────────────────────────────────────────────────────
    const send = (a, down) => { if (!game || (shell.paused && down)) return; try { game.input(a, down); } catch (e) {} };
    const KEYS = { Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', ArrowDown: 'duck', KeyS: 'duck' };
    function onKey(e) {
      const down = e.type === 'keydown';
      const a = KEYS[e.code];
      if (e.code === 'Escape' && down) {
        if (game && game.running && game.running() && !shell.paused) shell.pause(true); else close();
      } else if ((e.code === 'KeyP' || e.code === 'Pause') && down) {
        if (game && game.running && game.running()) shell.pause(!shell.paused);
      } else if (a) {
        if (down && shell.paused) shell.pause(false);
        else if (!(down && e.repeat)) send(a, down);
      } else {
        // Any other key: kept from the client behind the overlay, but the
        // browser's own (Tab, F5, F11, Ctrl+…) still works.
        if (!e.ctrlKey && !e.metaKey) e.stopImmediatePropagation();
        return;
      }
      e.preventDefault(); e.stopImmediatePropagation();
    }
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKey, true);

    let pY = null, swiped = false;
    stage.addEventListener('pointerdown', (e) => {
      e.preventDefault(); pY = e.clientY; swiped = false;
      if (shell.paused) { shell.pause(false); return; }
      send('jump', true);
    });
    stage.addEventListener('pointermove', (e) => {
      if (pY != null && !swiped && e.clientY - pY > 28) { swiped = true; send('jump', false); send('duck', true); }
    });
    const lift = () => { if (pY == null) return; pY = null; send('jump', false); send('duck', false); };
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((n) => stage.addEventListener(n, lift));
    root.querySelectorAll('.pg-pad button').forEach((b) => {
      const a = b.getAttribute('data-a');
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (shell.paused) shell.pause(false); else send(a, true); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((n) => b.addEventListener(n, () => send(a, false)));
    });
    root.querySelector('.pg-close').addEventListener('click', () => close());
    root.addEventListener('contextmenu', (e) => e.preventDefault());

    // Gamepad: polled every frame (standard mapping).
    let padPrev = [];
    function pollPad() {
      let list = [];
      try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; } catch (e) {}
      if (!list.length) { padPrev = []; return; }
      const p = [];
      for (const pad of list) {
        const b = (i) => !!(pad.buttons[i] && pad.buttons[i].pressed);
        const ay = pad.axes && pad.axes.length > 1 ? pad.axes[1] : 0;
        if (b(0) || b(1) || b(12) || ay < -0.6) p[0] = true;     // jump
        if (b(13) || ay > 0.6) p[1] = true;                       // duck
        if (b(9)) p[2] = true;                                    // Start: pause
        if (b(8)) p[3] = true;                                    // Select: quit
      }
      const dn = (i) => p[i] && !padPrev[i], up = (i) => !p[i] && padPrev[i];
      if (dn(3)) { padPrev = p; close(); return; }
      if (dn(2) && game && game.running && game.running()) shell.pause(!shell.paused);
      else if (dn(0)) { if (shell.paused) shell.pause(false); else send('jump', true); }
      if (up(0)) send('jump', false);
      if (dn(1)) send('duck', true);
      if (up(1)) send('duck', false);
      padPrev = p;
    }

    const onHide = () => { if (game && game.running && game.running()) shell.pause(true); };
    const onVis = () => { if (document.hidden) onHide(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onHide);
    window.addEventListener('resize', resize);

    // ── Loop ────────────────────────────────────────────────────────
    let raf = 0, last = performance.now(), closed = false;
    function frame(now) {
      if (closed) return;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
      pollPad();
      if (closed) return;
      try {
        if (game && !shell.paused) game.update(dt);
        g.setTransform(shell.dpr * shell.k, 0, 0, shell.dpr * shell.k, 0, 0);
        if (game) game.draw(g);
      } catch (e) { try { console.warn('[games]', e); } catch (e2) {} }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    try { stage.focus({ preventScroll: true }); } catch (e) {}

    function close() {
      if (closed) return;
      closed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKey, true);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onHide);
      window.removeEventListener('resize', resize);
      try { if (game && game.destroy) game.destroy(); } catch (e) {}
      root.remove();
      window._pthGameOn = false;
      window._pthPadOwner = null;
      try { if (prevFocus && /** @type {HTMLElement} */ (prevFocus).focus) /** @type {HTMLElement} */ (prevFocus).focus({ preventScroll: true }); } catch (e) {}
      resolve();
    }
  });
}
