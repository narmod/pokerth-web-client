// Regression guard — ResetTimeoutMessage has exactly ONE sender.
//
// The server kicks a session that shows no sign of life for 21 minutes, so an
// abandoned tab gives its seat back. modules/ui/action-bar.mjs used to send a
// ResetTimeoutMessage from renderMyTurnActions(), which the CLIENT calls on its
// own every time the turn comes round: an empty chair answered "still here" hand
// after hand and never timed out, while a QML client in the same spot is
// kicked. Upstream only sends a reset from real user input
// (GameHandler::eventFilter) or from the OK button of the timeout popup
// (TimeoutMsgBoxImpl).
//
// _afkActivity (modules/net/msg-social.mjs) is the web equivalent of both, and
// must stay the only place that emits the message.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const root = new URL('../public/', import.meta.url).pathname;
const SENDER = 'modules/net/msg-social.mjs';
// messagetype 68 = Type_ResetTimeoutMessage, carried in field 69.
const PAYLOAD = /\[\s*\[\s*1\s*,\s*0\s*,\s*68\s*\]\s*,\s*\[\s*69\s*,/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'node_modules') walk(p, out); }
    else if (/\.m?js$/.test(name)) out.push(p);
  }
  return out;
}

const hits = walk(root)
  .filter(p => PAYLOAD.test(readFileSync(p, 'utf8')))
  .map(p => p.slice(root.length));

assert.deepEqual(hits, [SENDER],
  'ResetTimeoutMessage must be built only in ' + SENDER + ', found: ' + hits.join(', '));

// And that single sender must go through the rate-limited helper, not raw.
const src = readFileSync(join(root, SENDER), 'utf8');
const fn = src.match(/function _afkActivity\(\) \{[\s\S]*?\n\}/);
assert.ok(fn, '_afkActivity not found');
assert.ok(PAYLOAD.test(fn[0]), 'the ResetTimeoutMessage must be emitted from _afkActivity');
assert.ok(/AFK_RESET_INTERVAL_MS/.test(fn[0]), '_afkActivity must keep its rate limit');

// renderMyTurnActions() must not talk to the server at all.
const ab = readFileSync(join(root, 'modules/ui/action-bar.mjs'), 'utf8');
const render = ab.match(/\nfunction renderMyTurnActions\(preview\) \{[\s\S]*?\n\}\n/);
assert.ok(render, 'renderMyTurnActions not found');
assert.ok(!/\bsend\s*\(/.test(render[0]),
  'renderMyTurnActions() runs on its own each turn and must never send to the server');

console.log('test-afk-single-sender: OK');
