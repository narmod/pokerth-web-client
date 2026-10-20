#!/usr/bin/env node
// First-visit look (web.166): the operator's palette, table, deck, seats,
// interface size, sound and contrast reach a browser that never set them, and
// never override a player's own choice. Also the former style preset, which
// theme.mjs's boot used to defeat (it writes every axis, so « a key is stored »
// no longer meant « the player chose »).
// Run: node scripts/test-look-defaults-browser.mjs
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';
import { fileURLToPath } from 'url';
import { freePort, waitForServer } from './lib/free-port.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function startProxy(cfg) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'look-'));
  fs.writeFileSync(path.join(tmp, 'cfg.json'), JSON.stringify(cfg));
  const PORT = await freePort();
  const env = { PORT: String(PORT), STATS_ADMIN_TOKEN: 'x', ADMIN_CONFIG_FILE: path.join(tmp, 'cfg.json') };
  for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'DEPLOY_HISTORY_FILE']) env[k] = path.join(tmp, k.toLowerCase() + '.json');
  const px = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, env: Object.assign({}, process.env, env), stdio: 'ignore' });
  return { px, base: 'http://127.0.0.1:' + PORT };
}
const KEYS = ['pth_theme', 'pth_table', 'pth_deck', 'pth_deck_ext', 'pth_seat', 'pth_sound', 'pth_interface_size', 'pth_high_contrast'];
const read = (pg) => pg.evaluate((keys) => { const o = {}; keys.forEach((k) => { o[k] = localStorage.getItem(k); }); o.dataTable = document.documentElement.getAttribute('data-table'); o.dataDeck = document.documentElement.getAttribute('data-deck'); o.dataTheme = document.documentElement.getAttribute('data-theme'); return o; }, KEYS);

// Poll the page until the look has been applied, instead of a fixed sleep: a
// freshly started proxy is still busy with its start-up work (SEO cache…), and
// on a loaded machine the first page load can take longer than 4.5 s.
const waitLook = async (pg, cond, ms = 20000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { const v = await read(pg).catch(() => null); if (v && cond(v)) return; await sleep(250); }
};

const b = await chromium.launch();
try {
  // ── Per-axis look ───────────────────────────────────────────────────────
  let s = await startProxy({ lookDefaults: { palette: 'pokerth-light', table: 'matrix', deck: 'discworld', seat: 'onyx-pill', size: 'large' }, defaults: { sound: '0', contrast: '1' } });
  await waitForServer(s.base, s.px);
  let ctx = await b.newContext(); let pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
  await pg.goto(s.base + '/'); await waitLook(pg, (x) => x.pth_theme === 'pokerth-light' && x.pth_seat === 'onyx-pill' && x.pth_sound === '0'); await sleep(500);
  let v = await read(pg);
  ok(v.pth_theme === 'pokerth-light' && v.dataTheme === 'pokerth-light', 'a first visit gets the palette (' + v.pth_theme + ')');
  ok(v.pth_table === 'matrix' && v.dataTable === 'matrix', 'the table style');
  ok(v.pth_deck === 'discworld' && v.pth_deck_ext === 'svg', 'the gallery deck, with its extension known');
  ok(v.pth_seat === 'onyx-pill', 'the seat pack');
  ok(v.pth_interface_size === 'large' && v.pth_high_contrast === '1' && v.pth_sound === '0', 'interface size, contrast and sound');
  await pg.evaluate(() => { window.setTable('teal'); localStorage.setItem('pth_interface_size', 'standard'); });
  await pg.reload(); await sleep(3500);
  v = await read(pg);
  ok(v.pth_table === 'teal' && v.pth_interface_size === 'standard', 'a player\'s own choice survives the next visit');
  ok(errs.length === 0, 'nothing threw' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close(); s.px.kill();

  // ── The former preset (PokerTH did nothing with it since theme.mjs wrote its axes at boot) ─
  s = await startProxy({ defaultTheme: 'casino' });
  await waitForServer(s.base, s.px);
  ctx = await b.newContext(); pg = await ctx.newPage();
  await pg.goto(s.base + '/'); await waitLook(pg, (x) => x.pth_table === 'casino' && x.pth_deck === 'casino-vert'); await sleep(500);
  v = await read(pg);
  ok(v.pth_table === 'casino' && v.pth_deck === 'casino-vert', 'a preset still saved applies on a first visit (' + v.pth_table + ', ' + v.pth_deck + ')');
  await ctx.close(); s.px.kill();
} finally {
  await b.close();
}
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
