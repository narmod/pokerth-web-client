/* test-live-transport — /live has its own transport setting.
 *
 * An install running beside the game server and one on a separate machine
 * want different answers, so /live must not be forced to follow the Internet
 * setting. Default is 'inherit', which keeps every existing install unchanged.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const proxy = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
const client = fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8');
const admin = fs.readFileSync(path.join(root, 'public', 'admin.html'), 'utf8');

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

console.log('test-live-transport');

// ── Server ──
check('resolver exists', /function _liveTransport\(\)/.test(proxy));
check('anything but direct/proxy means inherit',
  /\(t === 'proxy' \|\| t === 'direct'\) \? t : 'inherit'/.test(proxy));
check('published to the client in /app-config', /liveTransport: _liveTransport\(\)/.test(proxy));
check('accepted by the admin save', /_adminConfig\.liveTransport =/.test(proxy));
check('the save validates the value',
  /_lt === 'proxy' \|\| _lt === 'direct'\) \? _lt : 'inherit'/.test(proxy));
check('persisted across restarts', /'internetTransport', 'liveTransport'/.test(proxy));

// ── Client ──
check('the override is read from app-config', /window\._pthLiveTransport = \(c\.liveTransport/.test(client));
check('the global is declared up front', /window\._pthLiveTransport = 'inherit';/.test(client));
check('it only applies in live mode', /window\.LIVE_MODE && \(_liveTr === 'direct' \|\| _liveTr === 'proxy'\)/.test(client));
check('it feeds the single directWS decision',
  /window\.directWS = isPokerThDirect && targetIsPokerTH && \(_tr !== 'proxy'\)/.test(client));
check('the ordinary client still follows the Internet setting',
  /\? _liveTr : window\._pthNetTransport/.test(client));

// The framing difference is what makes a direct socket work at all: /pthlive
// carries one protobuf per frame, the proxy prefixes each with its length.
const session = fs.readFileSync(path.join(root, 'public', 'modules', 'net', 'session.mjs'), 'utf8');
check('direct sends carry no length prefix',
  /if \(window\.directWS\)[\s\S]{0,220}S\.ws\.send\(data\)/.test(session));
check('direct receives treat one frame as one message',
  /if \(window\.directWS\)[\s\S]{0,260}handleMsg\(new Uint8Array\(chunk\)\)/.test(client));

// ── Admin page ──
for (const cls of ['ltInherit', 'ltDirect', 'ltProxy']) {
  check('admin offers ' + cls, new RegExp('class="' + cls + '"').test(admin));
}
check('admin sends the value', /liveTransport:_liveTransport/.test(admin));
check('admin loads the value back', /_liveTransport=\(d\.liveTransport/.test(admin));
check('admin ticks the stored choice', /li\.checked=\(_liveTransport==='inherit'\)/.test(admin));

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
