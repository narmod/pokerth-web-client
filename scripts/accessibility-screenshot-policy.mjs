import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

// `similar(actual, expected)` (optional) decides when the bytes differ: a live
// table lays its cards out to the sub-pixel, so two runs of the same screen
// can differ by a pixel along every edge. It returns { ok, ratio }.
export async function checkCanonicalScreenshot({ browserTarget, canonicalPath, capture, updateCanonical = false, similar = null, log = console.log }) {
  const fixture = basename(canonicalPath);
  if (browserTarget !== 'chromium') {
    log(`skip - ${browserTarget} screenshot omitted; canonical Chromium owns ${fixture}`);
    return false;
  }
  if (updateCanonical) {
    const captured = await capture();
    const actual = Buffer.from(Buffer.isBuffer(captured) ? captured : captured.buffer);
    writeFileSync(canonicalPath, actual);
    log(`update - canonical Chromium screenshot wrote ${fixture}`);
    return true;
  }
  const expected = readFileSync(canonicalPath);
  const captured = await capture();
  const actual = Buffer.from(Buffer.isBuffer(captured) ? captured : captured.buffer);
  if (!actual.equals(expected) && similar) {
    const r = await similar(actual, expected);
    assert.ok(r && r.ok, `canonical Chromium screenshot does not match ${fixture} (${r && r.ratio != null ? (r.ratio * 100).toFixed(2) + ' % of pixels differ' : 'size differs'})`);
    log(`ok  - canonical Chromium screenshot matches ${fixture} within tolerance (${(r.ratio * 100).toFixed(2)} % of pixels moved by sub-pixel layout)`);
    return true;
  }
  assert.ok(actual.equals(expected), `canonical Chromium screenshot does not match ${fixture}`);
  log(`ok  - canonical Chromium screenshot matches ${fixture}`);
  return true;
}
