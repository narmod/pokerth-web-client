#!/usr/bin/env node
// Client fixes from the 2026-10-25 audit (web.331). Behaviour is checked where a
// function can be lifted out of its file; the rest is pinned on the source.
// Run: node scripts/test-client-audit-fixes.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => readFileSync(join(root, p), 'utf8');
const js = R('public/pokerth.js'), sw = R('public/sw.js');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); };
const lift = (src, name) => {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) return null;
  let d = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}' && --d === 0) return src.slice(i, k + 1); }
  return null;
};

// 1. A handler that throws must not freeze the proxy stream: the frame is
//    consumed first. Re-run the loop from pokerth.js on five frames, #2 throws.
{
  const m = js.match(/while \(S\.rxBuf\.length >= 4\) \{[\s\S]*?\n    \}/);
  ok(m && /S\.rxBuf = S\.rxBuf\.slice\(4 \+ len\);\s*\n\s*try \{ handleMsg\(frame\); \}/.test(m[0]), 'onRawData consumes the frame before handleMsg, inside a try');
  const handled = [];
  const frames = [1, 2, 3, 4, 5].map((v) => { const b = new Uint8Array(5); new DataView(b.buffer).setUint32(0, 1); b[4] = v; return b; });
  const all = new Uint8Array(25); frames.forEach((f, i) => all.set(f, i * 5));
  const ctx = { S: { rxBuf: all }, handled, setTimeout: () => {}, DataView, Uint8Array,
    handleMsg: (f) => { handled.push(f[0]); if (f[0] === 2) throw new Error('boom'); } };
  vm.runInNewContext(m ? m[0] : '', ctx);
  ok(handled.join(',') === '1,2,3,4,5' && ctx.S.rxBuf.length === 0, 'one throwing handler loses only its own frame (' + handled.join(',') + ')');
}

// 2. Automatic-reconnect sockets share the text-frame and terminal-close handling.
ok((js.match(/if \(typeof e\.data === 'string'\) \{ _onProxyText\(e\.data\); return; \}/g) || []).length === 3, 'all three sockets route text frames to _onProxyText');
ok((js.match(/if \(_closeIsTerminal\((?:e|ev)\)\) return;/g) || []).length === 3, 'all three sockets stop on a terminal close (kick, 4430, leaving)');
ok((js.match(/S\.rxBuf = new Uint8Array\(0\);   \/\/ a partial frame/g) || []).length === 2, 'the reconnect sockets start from an empty receive buffer');

// 3. Emoji enlargement stays out of tags (an emoji in an href broke the link).
{
  const src = lift(js, '_enlargeChatEmojis');
  const f = vm.runInNewContext('(' + src + ')');
  const out = f('<a href="https://example.com/😀x" target="_blank">https://example.com/😀x</a> 😀');
  ok(out.startsWith('<a href="https://example.com/😀x" target="_blank">'), 'the href is left intact');
  ok((out.match(/chat-emoji-lg/g) || []).length === 2, 'emoji in the link text and the message are still enlarged');
}

// 4. toggleTablePlayers asks the names with MSG.T (T exists only inside handleMsg).
ok(/toggleTablePlayers\(gid\) \{[\s\S]*?MSG\.T\.PlayerInfoRequest[\s\S]*?renderGames\(\);/.test(js), 'toggleTablePlayers uses MSG.T.PlayerInfoRequest');

// 5. The street label follows a language switch (state in window.PthState).
ok(/_PS\.gId && _PS\.handNum > 0 && typeof _PS\.gameState === 'number'/.test(R('public/modules/i18n.mjs')), 'i18n reads the street from window.PthState');

// 6. Turn and river land in slots 3 and 4 whatever the board held before.
{
  const mh = R('public/modules/game/msg-hand.mjs');
  ok(/S\.commCards\[3\] = tv;/.test(mh) && /S\.commCards\[4\] = rv;/.test(mh) && !/S\.commCards\.push\(/.test(mh), 'turn and river are placed by index');
}

// 7. The service worker's app shell stands in for the app only.
{
  const f = vm.runInNewContext('(' + lift(sw, 'isAppRoute') + ')', { URL });
  const at = (p) => f({ url: 'https://example.org' + p });
  ok(at('/') && at('/?invite=abc') && at('/index.html') && at('/pokerth-client.html'), 'the app routes get the cached shell');
  ok(!at('/live') && !at('/privacy') && !at('/faq') && !at('/studio'), 'other pages do not');
  ok((sw.match(/appRoute \? await caches\.match\(NAV_FALLBACK\)/g) || []).length === 2, 'both fallbacks (slow and offline) check it');
}

// 8. A notification action reaches the tab that posted it.
{
  const ab = R('public/modules/ui/action-bar.mjs');
  ok(/data: \{ tab: _notifTab \}/.test(ab) && /d\.type === 'NOTIF_ACTION' && \(!d\.tab \|\| d\.tab === _notifTab\)/.test(ab), 'the page tags its notification and plays only its own');
  ok(/if \(act && tab\) list\.forEach/.test(sw), 'the service worker hands a tagged action to every window');
}

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
