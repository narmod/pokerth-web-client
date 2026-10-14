#!/usr/bin/env node
// Login wizard: going from one mode to another must not carry anything but the
// nickname (narmod 2026-10-14). For every path through the three modes
// (Internet / training / LAN), with something done in each one (LAN: a server
// picked, the gear opened, guest ticked; Internet: a password typed, guest
// ticked), the last screen must look exactly like a fresh visit of that mode:
// same visible fields, same login mode, same nickname label, no LAN list lock.
// Hidden fields are not compared where the mode does not use them (training
// never dials), nor a mode's own memory when it is visited again (its guest
// tick, its last LAN server).
// Run: node scripts/test-login-modes-browser.mjs
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path'; import net from 'net';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'modes-'));
const fake = net.createServer((s) => { s.on('error', () => {}); });
await new Promise((r) => fake.listen(0, '127.0.0.1', r));
const FAKE = fake.address().port;
fs.writeFileSync(path.join(tmp, 'cfg.json'), JSON.stringify({ lanDirectory: { settings: { refusePrivate: false, manualEntry: false, localEntry: true },
  entries: [{ id: 'lan_aaaaaa000001', name: 'Club A', host: '127.0.0.1', port: FAKE, visible: true, addedAt: 1, lastSeen: Date.now(), resetPeriod: 'weekly' },
            { id: 'lan_aaaaaa000002', name: 'Club B TLS', host: 'b.invalid', port: 7236, tls: true, visible: true, addedAt: 1, lastSeen: Date.now() }] } }));
const PORT = 18800 + Math.floor(Math.random() * 90);
const env = { PORT: String(PORT), ALLOWED_PORTS: String(FAKE) + ',7236', STATS_ADMIN_TOKEN: 'x', ADMIN_CONFIG_FILE: path.join(tmp, 'cfg.json') };
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'DEPLOY_HISTORY_FILE', 'DB_CONFIG_FILE']) env[k] = path.join(tmp, k.toLowerCase() + '.json');
const px = spawn(process.execPath, [path.join(root, 'proxy.js')], { cwd: root, env: Object.assign({}, process.env, env), stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
const base = 'http://127.0.0.1:' + PORT;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const snap = (pg) => pg.evaluate(() => {
  const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden'; };
  const out = {};
  document.querySelectorAll('#login-step2 [id]').forEach((el) => { if (vis(el)) out[el.id] = 1; });
  out._status = (document.getElementById('status') || {}).textContent || '';
  out._nickLabel = (document.getElementById('nick-label') || {}).textContent || '';
  out._lm = document.getElementById('login-mode').value; out._sm = document.getElementById('server-mode').value;
  out._host = document.getElementById('host').value; out._port = document.getElementById('port').value; out._tls = document.getElementById('use-tls').checked;
  out._locked = document.body.classList.contains('lan-dir-locked');
  out._bodyCls = [...document.body.classList].filter((c) => /lan|guest|offline|mode/i.test(c)).join(' ');
  return out;
});
async function fresh() {
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('x')) { localStorage.clear(); sessionStorage.setItem('x', '1'); } localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_lang', 'en'); localStorage.setItem('pth_bak_auto', '0'); } catch (e) {} });
  const pg = await ctx.newPage(); await pg.goto(base + '/'); await pg.waitForSelector('.login-card'); await pg.waitForFunction(() => window._lanDirCfg !== undefined, null, { timeout: 8000 }).catch(() => {}); await sleep(800);
  return { ctx, pg };
}
const pick = async (pg, m) => { await pg.evaluate((mm) => { if (document.getElementById('login-step2').style.display !== 'none') loginBackToStep1(); loginPickMode(document.querySelector('.login-card[onclick*="\'' + mm + '\'"]'), mm); }, m); await sleep(1000); };
const click = (pg, sel) => pg.evaluate((s) => { const e = document.querySelector(s); if (e) e.click(); }, sel);
const act = {
  'lan-dedi': async (pg) => { await pg.selectOption('#lan-dir-sel', 'lan_aaaaaa000002').catch(() => {}); await sleep(200); await click(pg, '#conn-adv-btn'); await click(pg, '#guest-mode-cb'); await sleep(300); },
  'lan-dedi:plain': async (pg) => { await pg.selectOption('#lan-dir-sel', 'lan_aaaaaa000002').catch(() => {}); await sleep(200); },
  'pokerthnet': async (pg) => { await pg.fill('#pass', 'secret').catch(() => {}); await sleep(200); },
  'pokerthnet:guest': async (pg) => { await click(pg, '#guest-mode-cb'); await sleep(300); },
  'offline': async () => {}
};
const modes = ['pokerthnet', 'offline', 'lan-dedi'];
const acts = { 'pokerthnet': ['pokerthnet', 'pokerthnet:guest'], 'offline': ['offline'], 'lan-dedi': ['lan-dedi', 'lan-dedi:plain'] };
const ref = {};
for (const m of modes) { const { ctx, pg } = await fresh(); await pick(pg, m); ref[m] = await snap(pg); await ctx.close(); }
let ok = 0, checks = 0, fails = 0;
const seqs = [];
for (const a of modes) for (const c of modes) if (a !== c) for (const x of acts[a]) seqs.push([[a, x], [c, null]]);
for (const a of modes) for (const b2 of modes) for (const c of modes) if (a !== b2 && b2 !== c) for (const x of acts[a]) seqs.push([[a, x], [b2, acts[b2][0]], [c, null]]);
for (const seq of seqs) {
  const c = seq[seq.length - 1][0];
  const revisit = seq.slice(0, -1).some((q) => q[0] === c);
  const { ctx, pg } = await fresh();
  for (const [m, x] of seq) { await pick(pg, m); if (x) await act[x](pg); }
  const s = await snap(pg); const r = ref[c]; const d = [];
  const skip = (k) => (c === 'offline' && /^_(host|port|tls)$/.test(k)) || (revisit && /^_(lm|tls|host|port|nickLabel)$|^(f-pass|pass)$/.test(k));
  new Set(Object.keys(r).concat(Object.keys(s))).forEach((k) => { if (!skip(k) && JSON.stringify(r[k]) !== JSON.stringify(s[k])) d.push(k + ': ' + JSON.stringify(r[k]) + ' -> ' + JSON.stringify(s[k])); });
  const name = seq.map((q) => q[1] || q[0]).join(' -> ');
  checks++; if (d.length) { fails++; console.log('  ✗ ' + name + '\n     ' + d.join('\n     ')); } else { ok++; console.log('  ✓ ' + name); }
  await ctx.close();
}
await b.close(); px.kill(); fake.close();
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
console.log('\n' + (fails ? fails + ' FAILED' : 'All ' + checks + ' checks passed'));
process.exit(fails ? 1 : 0);
