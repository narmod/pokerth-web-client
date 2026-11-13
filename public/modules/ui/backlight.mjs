// @ts-check
// ═══════════════════════════════════════════════════════════════════
// « Backlight »: something appears in a light that comes from behind it
// (design note claude/CONCEPTION_MODE_ARCADE.md, narmod 2026-11-13; web
// extension). Used by the Mini-games mode: the fourth login card appears
// (modules/ui/login-arcade.mjs) and a mystery game is revealed
// (modules/games/menu.mjs).
//
// A full-screen canvas over the page: the page darkens around the element,
// gold light spills round its edges and rays grow and turn behind it (never
// over it), then a white flash — onFlash() is where the caller shows the
// element — twinkling stars, and the light fades. A short jingle of our own
// plays at the flash (sounds.mjs's tones, so the sound settings apply).
// « Reduce animations » (html.reduce-fx) or prefers-reduced-motion: no
// canvas, onFlash() at once, the caller fades the element in.
// ═══════════════════════════════════════════════════════════════════

/** True when decorative motion must be skipped. */
export function motionOff() {
  try { if (document.documentElement.classList.contains('reduce-fx')) return true; } catch (e) {}
  try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true; } catch (e) {}
  return false;
}

/** A short discovery fanfare: a rising arpeggio, then a shimmering chord. */
export function jingle() {
  const tone = typeof window !== 'undefined' && typeof window.playTone === 'function' ? window.playTone : null;
  if (!tone) return;
  const notes = [[523.25, 0], [659.25, 90], [783.99, 180], [1046.5, 270]];
  notes.forEach(([f, at]) => setTimeout(() => { try { tone(f, 0.22, 0.12); } catch (e) {} }, at));
  [[1046.5, 0], [1318.5, 30], [1568, 60], [2093, 140], [2637, 260]].forEach(([f, at]) =>
    setTimeout(() => { try { tone(f, 0.9, 0.06); } catch (e) {} }, 380 + at));
}

/**
 * Play the light around `el` (its box, read every frame). opts: veil (0..1),
 * flashAt and total (seconds), onFlash(), sound (default true), scroll
 * (bring `el` into view first). Resolves when the light has faded.
 * @param {Element} el
 * @param {{ veil?: number, flashAt?: number, total?: number, onFlash?: () => void, sound?: boolean }} [opts]
 */
export function backlight(el, opts = {}) {
  const flashAt = opts.flashAt != null ? opts.flashAt : 1.0;
  const total = opts.total != null ? opts.total : 4.3;
  const veilMax = opts.veil != null ? opts.veil : 0.8;
  const fadeAt = total - 0.9;
  let flashed = false;
  const flash = () => {
    if (flashed) return;
    flashed = true;
    if (opts.sound !== false) jingle();
    try { if (opts.onFlash) opts.onFlash(); } catch (e) {}
  };
  if (motionOff() || typeof document === 'undefined' || !el) { flash(); return Promise.resolve(); }
  const cv = document.createElement('canvas');
  cv.className = 'pth-backlight';
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000';
  document.body.appendChild(cv);
  const g = cv.getContext('2d');
  if (!g) { cv.remove(); flash(); return Promise.resolve(); }
  let W = 0, H = 0;
  const size = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  const ease = (x) => Math.max(0, Math.min(1, x));
  const r0 = el.getBoundingClientRect();
  const tw = [];
  for (let i = 0; i < 26; i++) tw.push({ dx: (Math.random() - 0.5) * 1.3, dy: (Math.random() - 0.5) * 2.6, ph: Math.random() * 6, s: 3 + Math.random() * 5 });
  const burst = [];
  for (let i = 0; i < 50; i++) { const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 7; burst.push({ x: 0, y: 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 1.5 + Math.random() * 3 }); }
  function star(x, y, s, a) {
    g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.translate(x, y); g.fillStyle = '#fffbe6'; g.beginPath();
    g.moveTo(0, -s); g.quadraticCurveTo(0, 0, s, 0); g.quadraticCurveTo(0, 0, 0, s); g.quadraticCurveTo(0, 0, -s, 0); g.quadraticCurveTo(0, 0, 0, -s);
    g.fill(); g.restore();
  }
  function rrect(x, y, w, h, r) {
    if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h);
  }
  return new Promise((done) => {
    const t0 = performance.now();
    window.addEventListener('resize', size);
    (function step(now) {
      const t = (now - t0) / 1000;
      let r = r0;
      try { r = el.getBoundingClientRect(); } catch (e) {}
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      g.clearRect(0, 0, W, H);
      // The page darkens; a halo stays open round the element.
      const veil = veilMax * ease(t / 0.4) * (1 - ease((t - fadeAt) / 0.8));
      if (veil > 0) {
        g.save(); g.fillStyle = 'rgba(4,6,10,' + veil + ')'; g.fillRect(0, 0, W, H);
        g.globalCompositeOperation = 'destination-out';
        const rad = Math.max(r.width, 120) * 0.62;
        const sg = g.createRadialGradient(cx, cy, rad * 0.4, cx, cy, rad);
        sg.addColorStop(0, 'rgba(0,0,0,.9)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = sg; g.beginPath(); g.ellipse(cx, cy, rad, Math.max(rad * 0.55, r.height), 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#000'; g.beginPath(); rrect(r.left, r.top, r.width, r.height, 14); g.fill();
        g.restore();
      }
      g.save(); g.globalCompositeOperation = 'lighter';
      // Light from behind: rays and a rim round the element, never over it.
      const grow = ease((t - 0.15) / Math.max(0.3, flashAt - 0.15));
      const ri = grow * (t < flashAt ? 0.6 : 1) * (1 - ease((t - fadeAt) / 0.8));
      if (ri > 0) {
        g.save(); g.beginPath(); g.rect(0, 0, W, H); g.rect(r.left, r.top, r.width, r.height); g.clip('evenodd');
        const L = Math.max(W, H);
        for (let i = 0; i < 18; i++) {
          const a = t * 0.3 + i * Math.PI * 2 / 18, w = 0.06 + (i % 2) * 0.05;
          const rg = g.createRadialGradient(cx, cy, Math.min(r.width, r.height) * 0.3, cx, cy, L * (0.35 + 0.25 * grow));
          rg.addColorStop(0, 'rgba(255,244,200,' + (0.55 * ri) + ')'); rg.addColorStop(1, 'rgba(255,220,120,0)');
          g.fillStyle = rg; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, L, a - w, a + w); g.closePath(); g.fill();
        }
        for (let k = 0; k < 3; k++) {
          const pad = 4 + k * 10 * (0.5 + grow);
          g.strokeStyle = 'rgba(255,240,190,' + (0.45 * ri / (k + 1)) + ')'; g.lineWidth = 8 + k * 8;
          g.beginPath(); rrect(r.left - pad / 2, r.top - pad / 2, r.width + pad, r.height + pad, 14 + pad); g.stroke();
        }
        g.restore();
        if (t > flashAt) for (const s of tw) star(cx + s.dx * r.width, cy + s.dy * Math.max(r.height, 60), s.s * (0.6 + 0.4 * Math.sin(t * 7 + s.ph)), ri * (0.5 + 0.5 * Math.sin(t * 5 + s.ph)));
      }
      // The flash, and sparks bursting out of it.
      const fk = (t - flashAt) / 0.7;
      if (fk > 0 && fk < 1) {
        const fg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(r.width, 160) * (0.3 + 1.1 * fk));
        fg.addColorStop(0, 'rgba(255,255,255,' + (1 - fk) + ')'); fg.addColorStop(0.45, 'rgba(255,245,210,' + (0.65 * (1 - fk)) + ')'); fg.addColorStop(1, 'rgba(255,230,160,0)');
        g.fillStyle = fg; g.fillRect(0, 0, W, H);
        for (const p of burst) { if (!p.x && !p.y) { p.x = cx; p.y = cy; } p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy *= 0.95; star(p.x, p.y, p.s, 1 - fk); }
      }
      g.restore();
      if (t >= flashAt) flash();
      if (t < total) requestAnimationFrame(step);
      else { window.removeEventListener('resize', size); cv.remove(); done(undefined); }
    })(t0);
  });
}
