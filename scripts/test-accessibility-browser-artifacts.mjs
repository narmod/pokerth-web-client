#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkCanonicalScreenshot } from './accessibility-screenshot-policy.mjs';

const fixtures = [
  join(process.cwd(), 'docs/screenshots/24-high-contrast-desktop.png'),
  join(process.cwd(), 'docs/screenshots/25-high-contrast-mobile.png'),
];
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const before = fixtures.map(hash);
const logs = [];

for (const canonicalPath of fixtures) {
  let captures = 0;
  assert.equal(await checkCanonicalScreenshot({
    browserTarget: 'chromium',
    canonicalPath,
    capture: async () => { captures += 1; return readFileSync(canonicalPath); },
    log: (message) => logs.push(message),
  }), true);
  assert.equal(captures, 1, 'canonical Chromium must capture once');
  assert.equal(await checkCanonicalScreenshot({
    browserTarget: 'chrome',
    canonicalPath,
    updateCanonical: true,
    capture: async () => { captures += 1; throw new Error('alternate target captured a canonical screenshot'); },
    log: (message) => logs.push(message),
  }), false);
  assert.equal(captures, 1, 'alternate target must skip screenshot capture');
  await assert.rejects(checkCanonicalScreenshot({
    browserTarget: 'chromium',
    canonicalPath,
    capture: async () => Buffer.from('mismatch'),
    log: (message) => logs.push(message),
  }), /does not match/);
}

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'pokerth-a11y-screenshot-'));
try {
  const temporaryFixture = join(temporaryDirectory, 'canonical.png');
  writeFileSync(temporaryFixture, 'before');
  assert.equal(await checkCanonicalScreenshot({
    browserTarget: 'chromium',
    canonicalPath: temporaryFixture,
    updateCanonical: true,
    capture: async () => Buffer.from('after'),
    log: (message) => logs.push(message),
  }), true);
  assert.equal(readFileSync(temporaryFixture, 'utf8'), 'after', 'explicit canonical update did not write its fixture');
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

assert.deepEqual(fixtures.map(hash), before, 'screenshot policy changed a canonical fixture');
assert.equal(logs.filter((message) => message.includes('chrome screenshot omitted')).length, 2);
assert.equal(logs.filter((message) => message.includes('canonical Chromium screenshot wrote')).length, 1);
console.log('PASS canonical Chromium compares 2 fixtures and supports explicit update; alternate Chrome captures 0 and changes 0');
