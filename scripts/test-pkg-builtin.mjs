// Packs shipped with the repository are built in: the admin can hide them,
// never remove them, and an uploaded pack never overwrites one.
// Run: node scripts/test-pkg-builtin.mjs
//
// 1. The lists in proxy.js match the folders git tracks (a pack added to the
//    repository without its id in the list would be removable again).
// 2. A real proxy marks them `builtin` in /admin/pkg-list and refuses to
//    remove them; uploads rename a clashing id instead of replacing it.
import { readFileSync, mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

function list(name) {
  const m = proxy.match(new RegExp('const ' + name + ' = \\[([\\s\\S]*?)\\];'));
  return m ? [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1]) : null;
}
const L = { table: list('BUILTIN_TABLES'), deck: list('BUILTIN_DECKS'), seat: list('BUILTIN_SEATS'), theme: list('BUILTIN_THEMES') };
ok(L.table && L.deck && L.seat && L.theme, 'the four built-in lists are declared');

// ── 1. Lists = what git tracks ────────────────────────────────────────────
let tracked = null;
try { tracked = execFileSync('git', ['ls-files', 'public/table', 'public/cards', 'public/seats'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean); } catch (e) {}
if (!tracked || !tracked.length) {
  console.log('  · git unavailable here: list check skipped');
} else {
  const folders = (sub) => [...new Set(tracked.map((f) => f.split('/')).filter((p) => p[1] === sub && p.length > 3).map((p) => p[2]))];
  for (const [kind, sub] of [['table', 'table'], ['deck', 'cards'], ['seat', 'seats']]) {
    const miss = folders(sub).filter((id) => L[kind].indexOf(id) < 0);
    ok(!miss.length, 'every ' + kind + ' folder git tracks is built in' + (miss.length ? ' (missing: ' + miss.join(', ') + ')' : ''));
  }
}

// ── 2. Upload and remove guards (source) ──────────────────────────────────
ok(/if \(pkgBuiltin\('table', id\)\) id = 'table-' \+ id;/.test(proxy), 'a table upload never overwrites a built-in table');
ok(/else if \(pkgBuiltin\('deck', id\)\) id = 'deck-' \+ id;/.test(proxy), 'nor a deck upload a built-in deck');
ok(/if \(pkgBuiltin\('seat', id\)\) id = 'seat-' \+ id;/.test(proxy), 'nor a seat upload a built-in seat');
ok(/if \(BUILTIN_THEMES\.indexOf\(id\) >= 0\) id = 'theme-' \+ id;/.test(proxy), 'nor a theme upload a built-in theme');

// ── 3. A real proxy ───────────────────────────────────────────────────────
const tmp = mkdtempSync(join(tmpdir(), 'pkgb-'));
const F = (x) => join(tmp, x);
writeFileSync(F('a.json'), '{}');
const PORT = 19000 + Math.floor(Math.random() * 900), TOKEN = 'pkg-builtin-token';
const env = Object.assign({}, process.env, { PORT: String(PORT), ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN, ADMIN_CONFIG_FILE: F('a.json'),
  VISITS_FILE: F('v.json'), STATS_FILE: F('s.json'), STATS_META_FILE: F('sm.json'), BROADCASTS_FILE: F('b.json'), POLLS_FILE: F('p.json'),
  DB_CONFIG_FILE: F('db.json'), DEPLOY_HISTORY_FILE: F('dh.json'), SCOPED_TOKENS_FILE: F('st.json'), AUDIT_FILE: F('au.json'), LAN_BOARDS_FILE: F('lb.json') });
const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls'], { cwd: root, stdio: 'ignore', env });
const base = 'http://127.0.0.1:' + PORT;
const H = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };
try {
  let up = false;
  for (let i = 0; i < 80 && !up; i++) { try { up = (await fetch(base + '/admin')).ok; } catch (e) {} if (!up) await new Promise((r) => setTimeout(r, 250)); }
  ok(up, 'the proxy starts');
  const d = await (await fetch(base + '/admin/pkg-list', { headers: H })).json();
  ok(d.ok && d.tables.length && d.tables.every((t) => t.builtin === true), 'every repository table is marked built in (' + d.tables.length + ')');
  ok(d.decks.length && d.decks.every((t) => t.builtin === true), 'every repository deck too (' + d.decks.length + ')');
  ok(d.seats.length && d.seats.every((t) => t.builtin === true), 'every repository seat too (' + d.seats.length + ')');
  ok(d.decks.every((t) => t.ext) && d.tables.every((t) => t.id && t.name), 'the entries keep their own fields (a deck its image type)');
  for (const [kind, id, dir] of [['table', 'casino', 'public/table/casino'], ['deck', 'lemming', 'public/cards/lemming'], ['seat', 'onyx-pill', 'public/seats/onyx-pill'], ['theme', 'pokerth-new', 'public/themes/pokerth-new']]) {
    const r = await fetch(base + '/admin/pkg-remove', { method: 'POST', headers: H, body: JSON.stringify({ kind, id }) });
    const j = await r.json();
    ok(r.status === 400 && /built-in .* cannot be removed \(you can hide it instead\)/.test(j.error || ''), 'removing the built-in ' + kind + ' ' + id + ' is refused');
    ok(existsSync(join(root, dir)), 'and its folder is still there');
  }
} finally {
  child.kill();
}
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
