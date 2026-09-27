#!/usr/bin/env node
// Deterministic test of the mascot planning helpers (modules/mascot/plan.mjs)
// and of its wiring: size across screens, climbable panel choice (headroom,
// reachable side, landing on screen), sequences, i18n keys in every language,
// option OFF by default, loader + engine precached.
// Run: node scripts/test-mascot.mjs
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const P = await import(pathToFileURL(path.resolve('public/modules/mascot/plan.mjs')).href);

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}

// ── Size: readable on a phone, never huge on a desktop ──
const phone = P.stageOf(390, 844), desk = P.stageOf(1920, 1080), tiny = P.stageOf(320, 480), land = P.stageOf(844, 390);
ok(phone.h >= 96 && phone.h <= 130, `phone portrait: ${Math.round(phone.h)} px tall (96–130)`);
ok(desk.h === 190, 'desktop: capped at 190 px');
ok(tiny.h === 96, 'very small screen: floor of 96 px');
ok(land.h < land.vh * 0.3, 'phone landscape: under 30 % of the height');
ok(Math.abs(phone.w / phone.h - P.BASE_W / P.BASE_H) < 1e-9, 'aspect ratio kept');
ok(phone.yF + P.FEET * phone.k === phone.floor, 'standing box top puts the feet on the floor line');
ok(P.stageOf(390, 844, 34).floor === phone.floor - 34, 'safe-area inset lifts the floor');
ok(P.clampX(phone, -500) >= 0 && P.clampX(phone, 5000) + phone.w <= phone.vw, 'clampX keeps the Ace on screen');

// ── Climbable panel ──
const st = P.stageOf(1280, 800);
const card = { left: 440, top: 300, right: 840, bottom: 700 };
const plan = P.climbPlan(st, card);
ok(!!plan, 'a centred login card is climbable');
if (plan) {
  ok(plan.xClimb >= st.minX && plan.xClimb <= st.maxX, 'climbing spot on screen');
  ok(plan.xLand >= st.minX && plan.xLand <= st.maxX, 'landing spot on screen');
  const feetTop = plan.xTop + st.w / 2, feetEdge = plan.xEdge + st.w / 2;
  ok(feetTop >= card.left && feetTop <= card.right && feetEdge >= card.left && feetEdge <= card.right, 'walks on the panel, feet within its edges');
  ok(Math.abs(plan.yP + 210 * st.k - card.top) < 1e-6, 'stands on the panel top');
  const landC = plan.xLand + st.w / 2;
  ok(landC < card.left || landC > card.right, 'falls beside the panel, not onto it');
  ok(plan.yHang <= st.yF, 'never hangs below the floor');
}
ok(P.climbPlan(st, { left: 440, top: 60, right: 840, bottom: 700 }) === null, 'no headroom under the header: not climbable');
ok(P.climbPlan(st, { left: 440, top: 700, right: 840, bottom: 790 }) === null, 'too low: not worth climbing');
ok(P.climbPlan(st, { left: 600, top: 300, right: 700, bottom: 700 }) === null, 'too narrow to walk on');
ok(P.climbPlan(st, { left: 0, top: 300, right: 1280, bottom: 700 }) === null, 'full-width panel: no side to climb');
const leftish = P.climbPlan(st, { left: 150, top: 300, right: 600, bottom: 700 });
ok(!!leftish && leftish.side === 'L', 'panel left of centre: climbs its left side, lands towards the middle');
ok(P.climbPlan(st, { left: 30, top: 300, right: 500, bottom: 700 }) === null, 'panel against the edge: no side to climb or no room to land');
ok(P.pickPanel(st, [{ left: 600, top: 300, right: 700, bottom: 700 }, card]).rect === card, 'pickPanel skips unusable rects');
ok(P.pickPanel(st, []) === null && P.climbPlan(st, null) === null, 'no panel → null');

// ── Sequences ──
const rnd = P.seeded(7);
let climbs = 0, badClimb = 0, allOk = true;
for (let i = 0; i < 500; i++) {
  const withPanel = i % 2 === 0;
  const s = P.pickSequence(rnd, { climb: withPanel });
  if (P.ENTRIES.indexOf(s.entry) < 0 || P.EXITS.indexOf(s.exit) < 0) allOk = false;
  if (!s.actions.length || s.actions.some((a) => P.ACTIONS.indexOf(a) < 0)) allOk = false;
  if (s.actions.indexOf('climb') >= 0) { climbs++; if (!withPanel) badClimb++; }
  if (!s.costume || !s.costume.hat || !s.costume.tool || !s.costume.mood) allOk = false;
}
ok(allOk, '500 sequences: valid entry, actions, exit and costume');
ok(climbs > 0 && badClimb === 0, 'climb only when a panel is available');
ok(P.pickSequence(P.seeded(1), { force: 'king' }).actions[0] === 'king', 'forced action honoured');
ok(P.costumeFor('knight').tool === 'sword' && P.costumeFor('magic').hat === 'wizard' && P.costumeFor('moon').mood === 'cool', 'costumes follow the action');
ok(JSON.stringify(P.pickSequence(P.seeded(42))) === JSON.stringify(P.pickSequence(P.seeded(42))), 'seeded sequences are reproducible');

// ── Timing helpers ──
ok(P.walkMs(desk, 0, 0) === 300 && Math.abs(P.walkMs(desk, 0, 190 * desk.k) - 1000) < 1e-6, 'walking speed ~190 px/s at full size');
ok(P.stepCycles(100) === 1 && P.stepCycles(2200) === 4, 'step cycles ~0.55 s');
ok(P.fallMs(0) === 350 && P.fallMs(100000) === 900, 'fall time bounded 350–900 ms');

// ── Wiring ──
const LANG_DIR = path.resolve('public/modules/lang');
const keys = ['advMascot', 'mascotHello', 'mascotBye', 'mascotTada', 'mascotKing'];
let missing = [];
for (const f of fs.readdirSync(LANG_DIR).filter((n) => n.endsWith('.mjs'))) {
  const m = await import(pathToFileURL(path.join(LANG_DIR, f)).href);
  for (const k of keys) if (typeof m.strings[k] !== 'string' || !m.strings[k].trim()) missing.push(f + ':' + k);
}
ok(!missing.length, 'mascot keys translated in every language' + (missing.length ? ' — missing ' + missing.slice(0, 5).join(', ') : ''));
const html = fs.readFileSync('public/pokerth-client.html', 'utf8');
ok(/<input type="checkbox" id="adv-mascot" onchange="setAdvOpt\('mascot',this\.checked\)">/.test(html), 'option row in Advanced options');
ok(html.indexOf('<script type="module" src="modules/mascot/index.mjs"></script>') >= 0, 'loader script included');
const js = fs.readFileSync('public/pokerth.js', 'utf8');
ok(/sync\('adv-mascot', 'mascot', false\)/.test(js), 'option OFF by default');
ok(js.indexOf("window._mascotApply") >= 0, 'applyAdvOpts forwards the option to the loader');
const sw = fs.readFileSync('public/sw.js', 'utf8');
ok(['index', 'engine', 'plan'].every((n) => sw.indexOf(`'/modules/mascot/${n}.mjs'`) >= 0), 'mascot modules precached');
const loader = fs.readFileSync('public/modules/mascot/index.mjs', 'utf8');
ok(/SCREENS = \['s-connect', 's-lobby'\]/.test(loader) && loader.indexOf("'s-game'") >= 0, 'only the home screen and the lobby (a table stops him)');
ok(/import\('\.\/engine\.mjs'\)/.test(loader) && !/^import .*engine/m.test(loader), 'engine loaded on demand only');

console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
