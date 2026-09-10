#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import { strings as english } from '../public/modules/lang/en.mjs';

const keys = [
  'accessibilityTitle',
  'accessibilityInterfaceSize',
  'accessibilityStandard',
  'accessibilityLarge',
  'accessibilityExtraLarge',
  'accessibilityHighContrast',
  'accessibilityReset',
];
const files = readdirSync('public/modules/lang').filter((file) => file.endsWith('.mjs')).sort();
const failures = [];

for (const file of files) {
  const { strings } = await import(`../public/modules/lang/${file}`);
  for (const key of keys) {
    if (typeof strings[key] !== 'string' || !strings[key].trim()) failures.push(`${file}: ${key} is missing or empty`);
  }
  if (file !== 'en.mjs' && keys.every((key) => strings[key] === english[key]))
    failures.push(`${file}: all accessibility values duplicate English`);
}

console.log('test-accessibility-locales');
if (failures.length) {
  failures.forEach((failure) => console.error('FAIL -', failure));
  console.error(`FAIL ${failures.length}/${files.length * keys.length}`);
  process.exit(1);
}
console.log(`PASS ${files.length} catalogues x ${keys.length} keys`);
