#!/usr/bin/env node
// Deterministic guards for the /poker-odds calculator's engine,
// public/modules/seo/odds-calc.mjs (computeOdds, plan). Run:
// node scripts/test-odds-calc.mjs   (~5 s)
//
// 1. heads-up with a known opponent is an exact enumeration that gives the
//    very numbers of seo-i18n/odds-data.json (computed by a separate script);
// 2. plan(): exact whenever the deals fit, simulation otherwise;
// 3. one random opponent on the river: exact, every one of C(45,2) hands;
// 4. simulation (seeded): SIM_DEALS deals, probabilities sum to 1, and the
//    hand distribution is consistent;
// 5. a newer request cancels a running one (no callback).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { computeOdds, plan, SIM_DEALS } from '../public/modules/seo/odds-calc.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = JSON.parse(readFileSync(join(root, 'seo-i18n', 'odds-data.json'), 'utf8'));
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
const idx = (c) => 'shdc'.indexOf(c[1]) * 13 + '23456789TJQKA'.indexOf(c[0]);
const run = (q, opt) => new Promise((res) => computeOdds(q, res, Object.assign({ slice: Infinity }, opt || {})));
const near = (a, b) => Math.abs(a - b) < 1e-12;

// 1. Exact heads-up = odds-data.json
for (const id of ['aa-kk', 'ak-aq']) {
  const m = DATA.matchups.find((x) => x.id === id);
  const r = await run({ hero: m.handA.map(idx), board: [], opp: m.handB.map(idx), nOpp: 1 });
  ok(r.exact && r.deals === m.boards && near(r.win, m.winA) && near(r.tie, m.tie) && near(r.lose, m.winB),
    `${id}: exact over ${r.deals} boards, same figures as odds-data.json`);
}

// 2. plan()
const hero = ['As', 'Ks'].map(idx);
ok(!plan({ hero, board: [], opp: [], nOpp: 1 }).exact, 'preflop against a random hand: simulation');
const flop = ['Qs', '7d', '2c'].map(idx);
const pf = plan({ hero, board: flop, opp: [], nOpp: 1 });
ok(pf.exact && pf.deals === 1081 * 990, 'flop against a random hand: exact, C(47,2)·C(45,2) deals');
ok(!plan({ hero, board: flop, opp: [], nOpp: 3 }).exact, 'several random opponents: simulation');

// 3. River, one random opponent
const river = ['Qs', '7s', '2s', 'Jd', '3c'].map(idx);          // hero has the nut flush
const rr = await run({ hero, board: river, opp: [], nOpp: 1 });
ok(rr.exact && rr.deals === 990 && rr.lose === 0 && near(rr.cats[5], 1), 'river: 990 opponent hands, nut flush never loses');

// 4. Simulation, seeded
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const rs = await run({ hero: ['Ah', 'Ad'].map(idx), board: [], opp: [], nOpp: 4 }, { random: rnd });
ok(!rs.exact && rs.deals === SIM_DEALS, `simulation of ${SIM_DEALS} deals`);
ok(near(rs.win + rs.tie + rs.lose, 1) && near(rs.cats.reduce((a, b) => a + b, 0), 1), 'win + tie + lose = 1, hand distribution sums to 1');
ok(rs.win > 0.5 && rs.win < 0.6 && rs.cats[0] === 0, 'pocket aces against four hands win about 55%, never finish on high card');

// 5. Cancel
let called = false;
const cancel = computeOdds({ hero: ['As', 'Ah'].map(idx), board: [], opp: ['Kd', 'Kc'].map(idx), nOpp: 1 }, () => { called = true; }, { slice: 2 });
cancel();
await new Promise((r) => setTimeout(r, 50));
ok(!called, 'a cancelled request never calls back');

console.log(fail ? `\n${fail}/${n} failed` : `\n${n}/${n} passed`);
process.exit(fail ? 1 : 0);
