import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

export async function checkCanonicalScreenshot({ browserTarget, canonicalPath, capture, updateCanonical = false, log = console.log }) {
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
  assert.ok(actual.equals(expected), `canonical Chromium screenshot does not match ${fixture}`);
  log(`ok  - canonical Chromium screenshot matches ${fixture}`);
  return true;
}
