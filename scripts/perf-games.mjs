#!/usr/bin/env node
// Mini-games performance probe (web.107; audit claude/AUDIT_PERF_MINIJEUX_2026-11-16.md). Opens each game
// from the mini-games page in headless Chromium and prints, for its title and a run: frames a second, p95
// frame time, main-thread busy time (script, layout, style), the cost of the open-window check, the canvas'
// sharpness. Not a test (no pass/fail). Options (env): GAMES=a,b  W= H= DPR=  CPU=4 (slower CPU)  OPS=1
// (canvas calls a frame)  PROF=1 (JS profile)  TRACE=1 (Chrome trace)  PROBE=1 (transparent pixels left)
// QSEED='{"tapis":1.25}' (a kept quality)  CSS=…  NOSHADOW=1  OPAQUE=1  DPRCAP=1.25 (experiments).
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { startServer } from './lib/mobile-harness.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHOTS = process.env.PTH_SHOTS === '1';
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };

const { server, base } = await startServer();
const b = await chromium.launch();
const errors = [];
async function fresh(width, height) {
  const ctx = await b.newContext({ viewport: { width, height }, serviceWorkers: 'block', deviceScaleFactor: +(process.env.DPR || 1) });
  await ctx.addInitScript(() => {
    try {
      if (!sessionStorage.getItem('x')) { localStorage.clear(); sessionStorage.setItem('x', '1'); }
      localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_lang', 'fr');
      localStorage.setItem('pth_bak_auto', '0'); localStorage.setItem('pth_nick', 'Narmod');
    } catch (e) {}
  });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await pg.goto(base);
  await pg.waitForSelector('.login-card');
  await sleep(800);
  await pg.evaluate(() => { loginPickMode(document.querySelector('.login-card[onclick*="\'offline\'"]'), 'offline'); });
  await sleep(1000);
  return { ctx, pg };
}
// Open game `id` from the arcade's home with the keys: → up to its card, then Space.
async function pick(pg, id) {
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  const n = await pg.evaluate((g) => [...document.querySelectorAll('#pth-game .gm-card .gm-art')].findIndex((a) => a.getAttribute('data-art') === g), id);
  for (let i = 0; i < n; i++) await pg.keyboard.press('ArrowRight');
  await sleep(100);
  await pg.keyboard.press('Space');
}
// The secret word (web.40): back on the choice of modes, the card out of its
// egg, the Ace's word; then the card's tap opens the mini-games page.
async function secretWord(pg) {
  await pg.evaluate(() => App.connect());
  await pg.waitForFunction(() => /🥚|😄/.test((document.querySelector('#ace-dock .ad-bubble') || {}).textContent || ''), null, { timeout: 15000 }).catch(() => {});
  const r = await pg.evaluate(() => ({
    step1: document.getElementById('login-step1').style.display !== 'none',
    card: !document.getElementById('login-card-arcade').hidden, page: !!document.getElementById('pth-game'),
    bubble: (document.querySelector('#ace-dock .ad-bubble') || {}).textContent || '', all: localStorage.getItem('pth_arcade_all'),
  }));
  await pg.evaluate(() => { window.loginOpenArcade(); });   // resolves when the page closes: not awaited
  return r;
}

const THROTTLE = +(process.env.CPU || 1), W = +(process.env.W || 1280), H = +(process.env.H || 800);
const GAMES = (process.env.GAMES || 'ace-runner,tapis,videopoker,whowins,hilo,solitaire,ace-dash,bluff,poker-run,pokerdrop,house').split(',');
const START = { 'ace-runner': "window.__pthAR.start('free')", tapis: "window.__pthTapis.start('classic')", videopoker: "window.__pthVP.start(false)",
  whowins: "window.__pthWW.start('endless')", hilo: "window.__pthHL.start('hand')", solitaire: "window.__pthPS.start(1)", 'ace-dash': null,
  bluff: null, 'poker-run': "window.__pthRun.start('free')", pokerdrop: null, house: "window.__pthHouse.start('free')" };
async function measure(pg, cdp, ms) {
  const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
  const fr = await pg.evaluate((ms) => new Promise((res) => {
    const d = []; let last = performance.now(), wo = 0, woN = 0;
    const orig = window.keynavHasOpenSurface;
    if (orig) window.keynavHasOpenSurface = function () { const t = performance.now(); const r = orig(); wo += performance.now() - t; woN++; return r; };
    const end = last + ms;
    const f = (t) => { d.push(t - last); last = t; if (t < end) requestAnimationFrame(f); else { if (orig) window.keynavHasOpenSurface = orig; res({ d, wo, woN }); } };
    requestAnimationFrame(f);
  }), ms);
  const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
  const d = fr.d.slice(1).sort((a, b) => a - b), n = d.length, sec = ms / 1000;
  const k = (x) => ((m1[x] - m0[x]) * 1000 / sec).toFixed(0);
  return { fps: (n / sec).toFixed(0), p50: d[Math.floor(n * 0.5)].toFixed(1), p95: d[Math.floor(n * 0.95)].toFixed(1), max: d[n - 1].toFixed(0), jank: d.filter((x) => x > 25).length,
    scriptMsPerS: k('ScriptDuration'), layoutMsPerS: k('LayoutDuration'), styleMsPerS: k('RecalcStyleDuration'), taskMsPerS: k('TaskDuration'),
    layouts: ((m1.LayoutCount - m0.LayoutCount) / sec).toFixed(0), styles: ((m1.RecalcStyleCount - m0.RecalcStyleCount) / sec).toFixed(0),
    nodes: m1.Nodes, woMs: (fr.wo / sec).toFixed(1), woN: fr.woN };
}
const out = {};
for (const id of GAMES) {
  const { ctx, pg } = await fresh(W, H);
  if (process.env.NOSHADOW) await pg.evaluate(() => { const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur'); Object.defineProperty(CanvasRenderingContext2D.prototype, 'shadowBlur', { set() { d.set.call(this, 0); }, get() { return 0; }, configurable: true }); });
  if (process.env.FPS30) await pg.evaluate(() => { const r = window.requestAnimationFrame.bind(window); let skip = false; window.__raf = r; });
  if (process.env.OPAQUE) await pg.evaluate(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, opt) { return o.call(this, t, t === '2d' && this.closest && this.closest('#pth-game') ? Object.assign({ alpha: false }, opt || {}) : opt); }; });
  if (process.env.DPRCAP) await pg.evaluate((c) => { Object.defineProperty(window, 'devicePixelRatio', { get: () => Math.min(c, 2), configurable: true }); }, +process.env.DPRCAP);
  if (process.env.QSEED) await pg.evaluate((v) => localStorage.setItem('pth_gm_q', v), process.env.QSEED);
  if (process.env.PROBE) await pg.evaluate(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t) { return o.call(this, t); }; });
  if (process.env.CSS) await pg.addStyleTag({ content: process.env.CSS });
  if (process.env.SKIPWO) await pg.evaluate(() => { window.__skipwo = 1; });
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Performance.enable');
  if (THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  await pg.click('#nick'); await pg.fill('#nick', ''); await pg.type('#nick', 'Mascotte', { delay: 5 });
  await secretWord(pg);
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 15000 }).catch(() => {});
  await sleep(1500);
  if (!out.menu && !process.env.PROBE) out.menu = await measure(pg, cdp, 3000);
  await pick(pg, id); await sleep(2500);
  const title = await measure(pg, cdp, process.env.PROBE ? 300 : 3000);
  if (process.env.PROBE) console.log('  PROBE title', await pg.evaluate("(async () => { const c = document.querySelector('#pth-game .pg-stage canvas'); if (!c) return 'no canvas'; const x = c.getContext('2d'); const d = x.getImageData(0, 0, c.width, c.height).data; let t = 0, n = 0; for (let i = 3; i < d.length; i += 4 * 97) { n++; if (d[i] < 255) t++; } return t + '/' + n; })()"));
  if (START[id]) { await pg.evaluate(START[id]).catch((e) => console.log('start err', id, e.message)); } else { await pg.keyboard.press('Space'); }
  await sleep(1500);
  const play = await measure(pg, cdp, process.env.PROBE ? 300 : 4000);
  if (process.env.PROBE) { console.log('  PROBE play', await pg.evaluate("(async () => { const c = document.querySelector('#pth-game .pg-stage canvas'); if (!c) return 'no canvas'; const x = c.getContext('2d'); const d = x.getImageData(0, 0, c.width, c.height).data; let t = 0, n = 0; for (let i = 3; i < d.length; i += 4 * 97) { n++; if (d[i] < 255) t++; } return t + '/' + n; })()")); await sleep(5000); console.log('  PROBE later', await pg.evaluate("(async () => { const c = document.querySelector('#pth-game .pg-stage canvas'); if (!c) return 'no canvas'; const x = c.getContext('2d'); const d = x.getImageData(0, 0, c.width, c.height).data; let t = 0, n = 0; for (let i = 3; i < d.length; i += 4 * 97) { n++; if (d[i] < 255) t++; } return t + '/' + n; })()")); }
  if (process.env.OPS) {
    const ops = await pg.evaluate(() => new Promise((res) => {
      const P = CanvasRenderingContext2D.prototype, cnt = {}, orig = {};
      for (const k of Object.getOwnPropertyNames(P)) { const d = Object.getOwnPropertyDescriptor(P, k); if (typeof d.value !== 'function') continue; orig[k] = d.value; P[k] = function () { cnt[k] = (cnt[k] || 0) + 1; return orig[k].apply(this, arguments); }; }
      let f = 0; const t0 = performance.now(); const c = document.querySelector('#pth-game canvas');
      const tick = () => { f++; if (performance.now() - t0 < 1000) requestAnimationFrame(tick); else { for (const k in orig) P[k] = orig[k]; res({ f, w: c.width, h: c.height, cnt }); } };
      requestAnimationFrame(tick);
    }));
    const per = Object.entries(ops.cnt).map(([k, v]) => [k, Math.round(v / ops.f)]).sort((x, y) => y[1] - x[1]);
    const tot = per.reduce((a, x) => a + x[1], 0);
    console.log('  OPS', ops.w + 'x' + ops.h, (ops.w * ops.h / 1e6).toFixed(2) + 'Mpx', 'calls/frame', tot, per.slice(0, 9).map((x) => x.join(':')).join(' '));
  }
  if (process.env.PROF) {
    await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start');
    await sleep(3000);
    const { profile } = await cdp.send('Profiler.stop');
    const self = {}, byId = new Map(profile.nodes.map((n) => [n.id, n]));
    const dt = profile.timeDeltas; const cnt = {};
    profile.samples.forEach((id, i) => { cnt[id] = (cnt[id] || 0) + (dt[i] || 0); });
    for (const [id, us] of Object.entries(cnt)) { const n = byId.get(+id); const cf = n.callFrame; const k = (cf.functionName || '(anon)') + ' ' + cf.url.split('/').pop() + ':' + (cf.lineNumber + 1); self[k] = (self[k] || 0) + us; }
    console.log('  PROF self ms/s:', Object.entries(self).sort((x, y) => y[1] - x[1]).slice(0, 16).map(([k, v]) => k + ' ' + (v / 3000).toFixed(1)).join(' | '));
  }
  if (process.env.TRACE) {
    await b.startTracing(pg, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc', 'gpu'] });
    await sleep(3000);
    const buf = await b.stopTracing();
    const ev = JSON.parse(buf.toString()).traceEvents;
    const main = ev.find((e) => e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain');
    const tot = {}, totAll = {};
    for (const e of ev) { if (e.ph !== 'X' || !e.dur) continue; const key = e.name; totAll[key] = (totAll[key] || 0) + e.dur; if (main && e.tid === main.tid && e.pid === main.pid) tot[key] = (tot[key] || 0) + e.dur; }
    const top = (o) => Object.entries(o).sort((x, y) => y[1] - x[1]).slice(0, 14).map(([k, v]) => k + ' ' + (v / 3000).toFixed(0)).join(' | ');
    console.log('  MAIN ms/s:', top(tot)); console.log('  ALL  ms/s:', top(totAll));
  }
  const st = await pg.evaluate(() => { for (const k of Object.keys(window)) if (/^__pth/.test(k) && window[k] && window[k].state) try { return k + ':' + window[k].state(); } catch (e) {} return '?'; });
  const dprNow = await pg.evaluate(() => { const c = document.querySelector('#pth-game .pg-stage canvas'); return c ? (c.width / c.getBoundingClientRect().width).toFixed(2) : '?'; });
  play.dprNow = dprNow;
  out[id] = { title, play, st };
  console.log(id, st, '\n  title', JSON.stringify(title), '\n  play ', JSON.stringify(play));
  await ctx.close();
}
console.log('menu', JSON.stringify(out.menu));
await b.close(); server.close(); process.exit(0);
