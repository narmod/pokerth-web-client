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
const phone = P.stageOf(390, 844), desk = P.stageOf(1920, 1080), tiny = P.stageOf(280, 440), land = P.stageOf(844, 390);
ok(phone.h >= 70 && phone.h <= 95, `phone portrait: ${Math.round(phone.h)} px tall (70–95)`);
ok(desk.h === 140, 'desktop: capped at 140 px');
ok(tiny.h === 70, 'very small screen: floor of 70 px');
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
const full = P.climbPlan(st, { left: 0, top: 300, right: 1280, bottom: 700 });
ok(!!full && full.front && full.side === 'F', 'full-width panel: no side, he climbs its front');
if (full) ok(full.xClimb >= st.minX && full.xEdge <= st.maxX && full.xLand >= st.minX && full.xLand <= st.maxX && full.xEdge - full.xTop >= 0.6 * st.w, 'front climb: on screen, walks on top, lands on screen');
const ph = P.stageOf(390, 844), phCard = { left: 16, top: 152, right: 374, bottom: 650 };
const phPlan = P.climbPlan(ph, phCard);
ok(!!phPlan && phPlan.front, 'phone home card (as wide as the screen): climbable by its front');
const leftish = P.climbPlan(st, { left: 150, top: 300, right: 600, bottom: 700 });
ok(!!leftish && leftish.side === 'L', 'panel left of centre: climbs its left side, lands towards the middle');
const edgeP = P.climbPlan(st, { left: 30, top: 300, right: 500, bottom: 700 });
ok(!!edgeP && (edgeP.front || edgeP.side === 'R'), 'panel against the edge: climbs the free side or the front');
ok(P.pickPanel(st, [{ left: 600, top: 300, right: 700, bottom: 700 }, card]).rect === card, 'pickPanel skips unusable rects');
ok(P.pickPanel(st, []) === null && P.climbPlan(st, null) === null, 'no panel → null');

// ── Peek over a panel's top edge ──
const pk = P.peekPlan(st, card, () => 0.5);
ok(!!pk, 'a centred login card can be peeked over');
if (pk) {
  ok(pk.T === card.top && pk.yUp < pk.T && pk.yDown > pk.T - 30 * st.k, 'pops up above the line, hides below it');
  ok(pk.yUp + 118 * st.k === pk.T, 'the line cuts him under the mouth');
  ok(pk.x >= card.left && pk.x + st.w <= card.right, 'peeks from within the panel width');
  ok(Math.abs(pk.yP + 210 * st.k - card.top) < 1e-6, 'can stand on the panel top before jumping down');
}
ok(P.peekPlan(st, { left: 440, top: 40, right: 840, bottom: 700 }) === null, 'panel right under the header: no peek');
ok(P.peekPlan(st, { left: 600, top: 300, right: 700, bottom: 700 }) === null, 'too narrow to peek from');
ok(P.pickPeek(st, [{ left: 600, top: 300, right: 700, bottom: 700 }, card], () => 0.5).rect === card, 'pickPeek skips unusable rects');

// ── Sit on a panel's top / hang from its bottom ──
const lp = P.ledgePlan(ph, phCard, () => 0.5);
ok(!!lp && Math.abs(lp.ySit + 156 * ph.k - phCard.top) < 1e-6 && lp.x >= ph.minX && lp.x <= ph.maxX, 'ledge: sits with the card bottom on the panel top, on screen');
ok(P.ledgePlan(ph, { left: 16, top: 40, right: 374, bottom: 650 }) === null, 'ledge: no room under the header');
const hp = P.hangPlan(ph, phCard, () => 0.5);
ok(!!hp && hp.yHang + 66 * ph.k === phCard.bottom && hp.yHang + ph.h < ph.floor, 'hang: hands on the bottom edge, feet off the floor');
ok(P.hangPlan(ph, { left: 16, top: 152, right: 374, bottom: ph.floor - 20 }) === null, 'hang: a panel down to the floor cannot be hung from');
const winFirst = P.pickWith(P.ledgePlan, st, [card, Object.assign({ win: true }, { left: 100, top: 400, right: 500, bottom: 700 })], () => 0.5);
ok(!!winFirst && winFirst.rect.win, 'open windows are used first');

// ── Sequences ──
const rnd = P.seeded(7);
let climbs = 0, badClimb = 0, allOk = true, peeks = 0, badPeek = 0, ducks = 0, sleeps = 0, juggles = 0;
for (let i = 0; i < 500; i++) {
  const withPanel = i % 2 === 0;
  const s = P.pickSequence(rnd, { climb: withPanel, peek: withPanel });
  if (P.ENTRIES.indexOf(s.entry) < 0 || P.EXITS.indexOf(s.exit) < 0) allOk = false;
  if (s.actions.some((a) => P.ACTIONS.indexOf(a) < 0)) allOk = false;
  if (!s.actions.length && !(s.entry === 'peek' && s.exit === 'duck')) allOk = false;
  if (s.exit === 'duck' && (s.entry !== 'peek' || s.actions.length)) allOk = false;
  if (s.entry === 'peek') { peeks++; if (!withPanel) badPeek++; if (s.exit === 'duck') ducks++; }
  if (s.actions.indexOf('sleep') >= 0) sleeps++;
  if (s.actions.indexOf('juggle') >= 0) juggles++;
  if (s.actions.indexOf('climb') >= 0) { climbs++; if (!withPanel) badClimb++; }
  if (!s.costume || !s.costume.hat || !s.costume.tool || !s.costume.mood) allOk = false;
}
ok(allOk, '500 sequences: valid entry, actions, exit and costume');
ok(climbs > 0 && badClimb === 0, 'climb only when a panel is available');
ok(P.pickSequence(P.seeded(5), { ledge: true, hang: true, force: 'hang' }).actions[0] === 'hang' && P.pickSequence(P.seeded(5), { force: 'hang' }).actions[0] !== 'hang', 'hang forced only when a panel allows it');
ok(peeks > 0 && badPeek === 0 && ducks > 0 && ducks < peeks, 'peek only with a panel; some peeks are short visits (duck), others hop down');
ok(sleeps > 0 && juggles > 0, 'nap and juggling are drawn');
ok(P.costumeFor('sleep').hat === 'nightcap', 'nightcap for the nap');
ok(P.costumeFor('pistol').hat === 'cowboy' && P.costumeFor('pistol').tool === 'pistol', 'cowboy hat and pistol for the BANG! act');
ok(P.pickSequence(P.seeded(1), { force: 'king' }).actions[0] === 'king', 'forced action honoured');
ok(P.costumeFor('knight').tool === 'sword' && P.costumeFor('magic').hat === 'wizard' && P.costumeFor('moon').mood === 'cool', 'costumes follow the action');
ok(JSON.stringify(P.pickSequence(P.seeded(42))) === JSON.stringify(P.pickSequence(P.seeded(42))), 'seeded sequences are reproducible');

// ── Seasons, reactions ──
const d = (m, day) => new Date(2026, m - 1, day, 12);
ok(P.seasonFor(d(12, 24)).hat === 'santa' && P.seasonFor(d(1, 6)).hat === 'santa', 'Santa hat in December, until 6 January');
ok(P.seasonFor(d(10, 31)).hat === 'pumpkin' && P.seasonFor(d(11, 2)).hat === 'pumpkin' && P.seasonFor(d(10, 19)) === null, 'pumpkin around Halloween only');
ok(P.seasonFor(d(1, 7)).hat === 'beanie' && P.seasonFor(d(2, 28)).hat === 'beanie' && P.seasonFor(d(3, 1)) === null, 'beanie from 7 January to the end of February');
ok(P.seasonFor(d(7, 14)).mood === 'cool' && P.seasonFor(d(6, 20)) === null && P.seasonFor(d(9, 28)) === null, 'sunglasses in summer, nothing in autumn');
let rDrawn = 0;
const rr = P.seeded(11);
for (let i = 0; i < 400; i++) { const q = P.pickSequence(rr, { climb: true, peek: true, ledge: true, hang: true }); if (q.actions.some((a) => P.REACTIONS.indexOf(a) >= 0)) rDrawn++; }
ok(rDrawn === 0 && P.REACTIONS.length === 3, 'lobby reactions are never drawn at random');
const idx = fs.readFileSync('public/modules/mascot/index.mjs', 'utf8');
ok(/REACT_GAP = 60000, REACT_WARMUP = 8000/.test(idx) && idx.indexOf('window.mascotReact') >= 0, 'reactions: at most once a minute per kind, not during the initial table list');
ok(/mascotReact\('table'\)/.test(fs.readFileSync('public/modules/net/msg-lobby.mjs', 'utf8')) && /mascotReact\('mail'\)/.test(fs.readFileSync('public/modules/ui/pm.mjs', 'utf8')) && /mascotReact\('bravo'\)/.test(fs.readFileSync('public/modules/game/stats.mjs', 'utf8')), 'reactions wired: new table, private message, better LAN rank');

// ── Timing helpers ──
ok(P.walkMs(desk, 0, 0) === 300 && Math.abs(P.walkMs(desk, 0, 190 * desk.k) - 1000) < 1e-6, 'walking speed 190 base px/s');
ok(P.stepCycles(100) === 1 && P.stepCycles(2200) === 4, 'step cycles ~0.55 s');
ok(P.fallMs(0) === 350 && P.fallMs(100000) === 900, 'fall time bounded 350–900 ms');

// ── Wiring ──
const LANG_DIR = path.resolve('public/modules/lang');
const keys = ['advMascot', 'mascotHello', 'mascotBye', 'mascotTada', 'mascotKing', 'mascotAnyone', 'mascotCheese', 'mascotTable', 'mascotMail', 'mascotBravo'];
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
ok(['index', 'engine', 'plan', 'panel', 'acts-extra', 'acts-props', 'acts-social'].every((n) => sw.indexOf(`'/modules/mascot/${n}.mjs'`) >= 0), 'mascot modules precached');
const loader = fs.readFileSync('public/modules/mascot/index.mjs', 'utf8');
ok(/SCREENS = \['s-connect', 's-lobby'\]/.test(loader) && loader.indexOf("'s-game'") >= 0, 'only the home screen and the lobby (a table stops him)');
ok(/import\('\.\/engine\.mjs'\)/.test(loader) && !/^import .*engine/m.test(loader), 'engine loaded on demand only');
ok(/import\('\.\/panel\.mjs'\)/.test(loader) && !/^import .*panel/m.test(loader), 'test panel loaded on demand only');
ok(/q === 'panel'/.test(loader) && loader.indexOf('window.mascotPanel') >= 0, 'test panel: ?mascot=panel and mascotPanel()');
ok(/closest\('#mascot-panel'\)/.test(loader), 'clicks in the test panel do not dismiss the Ace');
ok(/panel && panel\.isOpen\(\)\) return;/.test(loader), 'idle timer off while the test panel is open');
const eng = fs.readFileSync('public/modules/mascot/engine.mjs', 'utf8');
const cat = eng.slice(eng.indexOf('export const CATALOG'), eng.indexOf('};', eng.indexOf('export const CATALOG')));
ok(P.ACTIONS.every((a) => cat.indexOf(`'${a}'`) >= 0) && P.ENTRIES.every((a) => cat.indexOf(`'${a}'`) >= 0) && P.EXITS.every((a) => cat.indexOf(`'${a}'`) >= 0), 'panel catalogue lists every entry, action and exit');

console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
