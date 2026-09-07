// scripts/test-client-platform.mjs — InitMessage.clientPlatform (field 9).
//
// Upstream 864bc53 (PokerTH 2.1.9) added an optional platform field to the
// login packet so the server can tell an Android session from a desktop one:
// the build id only says which CLIENT speaks, not which OS it runs on. The web
// client fills it from the browser, which makes the detection order the whole
// point of this test — an Android user agent also says "Linux", and iPadOS
// says "Macintosh". Getting that order wrong is silent: the packet stays valid
// and the server just files the session under the wrong platform.
//
// The test drives the real buildInit() and decodes the bytes it produced, so a
// change in field number or wire type fails here too. Run: node scripts/test-client-platform.mjs

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

// Minimal browser surface buildInit() touches. BUILD_VERSION drives the
// announced upstream triple; irrelevant here but required.
globalThis.window = { BUILD_VERSION: '2.1.8-web.0' };
globalThis.document = { getElementById: () => null };

const { MSG } = await import(join(here, '..', 'public', 'modules', 'net', 'messages.mjs'));

const UNKNOWN = 0, WINDOWS = 1, LINUX = 2, MAC = 3, ANDROID = 4, IOS = 5;

// Reads varint field 9 out of the InitMessage carried by the packet, or 0 when
// the field was omitted. Deliberately a standalone decoder: reusing the
// client's own would hide an encoding mistake shared by both sides.
function readClientPlatform(packet) {
  let init = null;
  let i = 0;
  while (i < packet.length) {
    const key = packet[i++], field = key >> 3, wire = key & 7;
    if (wire === 0) { while (packet[i] & 0x80) i++; i++; }
    else if (wire === 2) {
      let len = 0, shift = 0;
      while (packet[i] & 0x80) { len |= (packet[i++] & 0x7f) << shift; shift += 7; }
      len |= (packet[i++] & 0x7f) << shift;
      if (field === 3) init = packet.slice(i, i + len);
      i += len;
    } else break;
  }
  if (!init) return null;
  let j = 0;
  while (j < init.length) {
    const key = init[j++], field = key >> 3, wire = key & 7;
    if (wire === 0) {
      let v = 0, shift = 0;
      while (init[j] & 0x80) { v |= (init[j++] & 0x7f) << shift; shift += 7; }
      v |= (init[j++] & 0x7f) << shift;
      if (field === 9) return v;
    } else if (wire === 2) {
      let len = 0, shift = 0;
      while (init[j] & 0x80) { len |= (init[j++] & 0x7f) << shift; shift += 7; }
      len |= (init[j++] & 0x7f) << shift;
      j += len;
    } else break;
  }
  return 0; // no field 9 → the server counts the session as platformUnknown
}

const cases = [
  // UA-Client-Hints path (Chromium): a clean token, no pattern matching.
  ['hints: Android', { userAgentData: { platform: 'Android' } }, ANDROID],
  ['hints: Windows', { userAgentData: { platform: 'Windows' } }, WINDOWS],
  ['hints: macOS', { userAgentData: { platform: 'macOS' } }, MAC],
  ['hints: Linux', { userAgentData: { platform: 'Linux' } }, LINUX],
  // Chrome OS is a Linux system and has no value of its own upstream.
  ['hints: Chrome OS', { userAgentData: { platform: 'Chrome OS' } }, LINUX],
  ['hints: unknown token', { userAgentData: { platform: 'Haiku' } }, UNKNOWN],
  // User-agent fallback (Firefox, Safari).
  ['ua: Android phone', { userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/126' }, ANDROID],
  ['ua: iPhone', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari' }, IOS],
  // iPadOS 13+ claims to be a Mac; the touch points are what tell them apart.
  ['ua: iPad claiming Macintosh', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', maxTouchPoints: 5 }, IOS],
  ['ua: real Mac', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', maxTouchPoints: 0 }, MAC],
  ['ua: Windows', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128' }, WINDOWS],
  ['ua: Linux desktop', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/128' }, LINUX],
  ['ua: Chrome OS', { userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) Chrome/126' }, LINUX],
  ['ua: empty', { userAgent: '' }, UNKNOWN],
];

let failed = 0;
for (const [name, nav, want] of cases) {
  Object.defineProperty(globalThis, 'navigator', { value: nav, configurable: true, writable: true });
  const got = readClientPlatform(MSG.buildInit('tester', 5, 0, 0));
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name} — expected ${want}, got ${got}`);
}

// platformUnknown is the server default, so the field must not be sent at all
// when nothing was recognised: an explicit 0 would only grow every login packet.
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: '' }, configurable: true, writable: true });
const unknownPacket = MSG.buildInit('tester', 5, 0, 0);
const knownPacket = (() => {
  Object.defineProperty(globalThis, 'navigator', { value: { userAgentData: { platform: 'Linux' } }, configurable: true, writable: true });
  return MSG.buildInit('tester', 5, 0, 0);
})();
// The recognised packet is exactly two bytes longer: the field 9 key and its
// value. Anything else means an explicit zero went out, or the field moved.
if (knownPacket.length - unknownPacket.length !== 2) {
  failed++;
  console.log(`FAIL  unknown platform must leave field 9 out (delta ${knownPacket.length - unknownPacket.length}, expected 2)`);
} else {
  console.log('ok    unknown platform leaves field 9 out of the packet');
}

console.log(failed ? `FAILED ${failed}` : 'ALL OK');
process.exit(failed ? 1 : 0);
