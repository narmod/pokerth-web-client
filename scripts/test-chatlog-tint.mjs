#!/usr/bin/env node
// scripts/test-chatlog-tint.mjs — colours of the floating game windows.
//
// Upstream e90593e added the content colours of the chat/log boxes to the
// table style, and made the bundled defaults depend on how bright the box
// background is. The failure it fixes is silent: nothing throws when a light
// table style inherits the dark defaults, the winner line simply turns yellow
// on cream and stops being readable. So the tests below pin the threshold, the
// hex values and the fallback ORDER, plus the two places the roles are wired
// (renderLog's class, msg-hand's main-pot / side-pot split).
//
// Run: node scripts/test-chatlog-tint.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const {
  resolveChatLogTint, isLightChatLog, contrastTextOn, chatLogBrightness,
  CHATLOG_VARS, CHATLOG_DARK, CHATLOG_LIGHT,
} = await import(join(root, 'public', 'modules', 'ui', 'chatlog-tint.mjs'));

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── Brightness and the two thresholds ───────────────────────────────────────
ok(chatLogBrightness('#000000') === 0, 'black is 0');
ok(chatLogBrightness('#ffffff') === 1, 'white is 1');
ok(chatLogBrightness('#fff') === 1, 'short hex expands');
ok(chatLogBrightness('rgba(0,0,0,.5)') === null, 'rgba() is not guessed');
ok(chatLogBrightness(null) === null, 'null is not guessed');

ok(isLightChatLog('#ece0c9') === true, 'ivoire cream reads as light');
ok(isLightChatLog('#1d222b') === false, 'the default panel reads as dark');
ok(isLightChatLog('#0c1a0e') === false, 'casino green reads as dark');
ok(isLightChatLog(undefined) === false, 'a missing background falls to dark');
ok(isLightChatLog('rgba(255,255,255,.9)') === false, 'an unparsable background falls to dark');
// Upstream compares > 0.5, not >= : #808080 sits at 0.501 and is light.
ok(isLightChatLog('#808080') === true, 'the split sits at 0.5, not at the midpoint of the theme list');

ok(contrastTextOn('#E3C800') === '#101010', 'black text on bright gold');
ok(contrastTextOn('#7a5a12') === '#FFFFFF', 'white text on the ivoire accent');
ok(contrastTextOn(null) === '#FFFFFF', 'white text when the accent is unreadable');

// ── Default sets ────────────────────────────────────────────────────────────
const dark = resolveChatLogTint({ bg: '#1d222b' });
ok(dark.wi === CHATLOG_DARK.wi && dark.bd === CHATLOG_DARK.bd, 'a dark background takes the dark set');
const light = resolveChatLogTint({ bg: '#f5eee1' });
ok(light.wi === CHATLOG_LIGHT.wi && light.bd === CHATLOG_LIGHT.bd, 'a light background takes the light set');
ok(CHATLOG_DARK.wi === '#FFFF00' && CHATLOG_LIGHT.wi === '#6b5400', 'the winner hexes match upstream');
ok(CHATLOG_DARK.bd === '#FF6633' && CHATLOG_LIGHT.bd === '#a8431a', 'the board hexes match upstream');
ok(CHATLOG_DARK.sd === '#4ade80' && CHATLOG_LIGHT.sd === '#0e7a37', 'the send hexes match upstream');

ok(resolveChatLogTint(null) === null, 'no tint stays no tint');

// ── Fallback order for the accent ───────────────────────────────────────────
// The reason this is not upstream's plain default: every built-in style has
// carried a seat accent since 2.1.4 and the chat already used it, so a fixed
// gold here would repaint the mention on all twenty-one of them.
ok(resolveChatLogTint({ bg: '#06120a', a: '#35c94a' }).ac === '#35c94a',
   'the seat accent wins over the bundled default');
ok(resolveChatLogTint({ bg: '#06120a', a: '#35c94a', ac: '#123456' }).ac === '#123456',
   'an explicit ChatLogAccent wins over the seat accent');
ok(resolveChatLogTint({ bg: '#1d222b' }).ac === CHATLOG_DARK.ac,
   'with neither, the bundled default applies');
ok(resolveChatLogTint({ bg: '#06120a', a: '#35c94a' }).act === contrastTextOn('#35c94a'),
   'accent text follows the accent in force, not the default set');
ok(resolveChatLogTint({ bg: '#06120a', a: '#35c94a', act: '#ff0000' }).act === '#ff0000',
   'an explicit ChatLogAccentText is kept');

// ── The six older keys keep their CSS fallback ──────────────────────────────
// Deliberate divergence: filling them in would repaint the panels of every
// imported palette that sets a background and nothing else.
const partial = resolveChatLogTint({ bg: '#22283b' });
ok(partial.bo === undefined && partial.se === undefined,
   'border and secondary text are not invented');
ok(partial.bg === '#22283b', 'what the style did set is kept');

// ── The variable map covers every key, and matches the CSS ──────────────────
for (const k of ['bg', 'su', 'bo', 'tx', 'se', 'mu', 'ac', 'act', 'wi', 'ws', 'bd', 'sd', 'a']) {
  ok(typeof CHATLOG_VARS[k] === 'string' && CHATLOG_VARS[k].startsWith('--'), 'variable mapped for ' + k);
}

const css = readFileSync(join(root, 'public', 'pokerth.css'), 'utf8');
for (const v of ['--chatlog-winner', '--chatlog-winner-side', '--chatlog-board', '--chatlog-accent']) {
  ok(css.includes('var(' + v), 'CSS consumes ' + v);
}
ok(/\.log-line\.lg-win\b/.test(css) && /\.log-line\.lg-win-side\b/.test(css) && /\.log-line\.lg-board\b/.test(css),
   'the three role classes have a rule');
ok(css.includes(':root[data-theme="pokerth-light"] { --lg-win-fb'),
   'the light palette overrides the untinted fallbacks');

// ── The table style that motivated the commit ───────────────────────────────
const theme = readFileSync(join(root, 'public', 'modules', 'theme.mjs'), 'utf8');
const ivoire = /'ivoire-chene':\{[\s\S]*?\}/.exec(theme);
ok(!!ivoire, 'the ivoire tint is still there');
for (const hex of ['#7a5a12', '#6b4e0a', '#7d5e20', '#a8431a', '#0c6b30']) {
  ok(ivoire && ivoire[0].includes(hex), 'ivoire carries ' + hex + ' from the upstream XML');
}
for (const tag of ['ChatLogAccent', 'ChatLogAccentText', 'ChatLogWinner', 'ChatLogWinnerSide', 'ChatLogBoard', 'ChatLogSend']) {
  ok(theme.includes("'" + tag + "'"), 'imported styles parse <' + tag + '>');
}

// ── Wiring: renderLog turns a role into a class ─────────────────────────────
const app = readFileSync(join(root, 'public', 'pokerth.js'), 'utf8');
ok(/function logAction\(entry, isAction, role\)/.test(app), 'logAction takes a role');
ok(app.includes("fn.role = role || null"), 'the role rides on the stored thunk');
ok(/r === 'board' \|\| r === 'win' \|\| r === 'win-side'/.test(app),
   'only the three known roles produce a class');
ok(app.includes("typeof r === 'function'"), 'a role function is resolved at render time');

// ── Wiring: msg-hand tags board steps and splits main pot from side pot ─────
const hand = readFileSync(join(root, 'public', 'modules', 'game', 'msg-hand.mjs'), 'utf8');
ok((hand.match(/, false, 'board'\)/g) || []).length === 3, 'flop, turn and river are board lines');
ok(hand.includes("return _wonHere >= top ? 'win' : 'win-side';"),
   'the biggest win of the hand is the main pot, the rest are side pots');
ok((hand.match(/, false, 'win'\)/g) || []).length === 1, 'a fold-out win is always the main pot');

// The tie case is the one worth spelling out: two players splitting the main
// pot both sit at the top, so both must read as winners, not one of each.
const winners = [{ won: 300 }, { won: 300 }, { won: 120 }];
const roleOf = (won) => { let top = 0; for (const w of winners) if (w.won > top) top = w.won; return won >= top ? 'win' : 'win-side'; };
ok(roleOf(300) === 'win' && roleOf(120) === 'win-side', 'split pot: both top winners keep the main-pot colour');

console.log(`\n${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
