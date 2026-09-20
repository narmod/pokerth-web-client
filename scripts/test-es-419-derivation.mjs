#!/usr/bin/env node
// es-419 is a DERIVED catalogue: es run through scripts/es-419-rules.mjs. This
// test fails when a string is added or edited in es without being carried over
// (or when es-419 is hand-edited away from the rules — then extend the rules).
import { pathToFileURL } from 'url';
import path from 'path';
import { derive } from './es-419-rules.mjs';
const load = p => import(pathToFileURL(path.resolve(p)).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };

const es = (await load('public/modules/lang/es.mjs')).strings;
const la = (await load('public/modules/lang/es-419.mjs')).strings;
for (const k of Object.keys(es)) ok(la[k] === derive(es[k]), `catalogue key ${k}: es-419 is not derive(es)`);
ok(Object.keys(la).length === Object.keys(es).length, 'same number of catalogue keys');

const flat = h => h.chapters.flatMap(c => [c.title, ...c.sections.flatMap(s =>
  [s.t, ...(s.b || []), ...(s.list || []), ...(s.keys || []).flat(), s.note || ''])]);
const hes = flat((await load('public/modules/help/content/es.mjs')).help);
const hla = flat((await load('public/modules/help/content/es-419.mjs')).help);
ok(hes.length === hla.length, 'help: same number of text fields');
hes.forEach((t, i) => ok(hla[i] === derive(t), `help field #${i}: es-419 is not derive(es)`));

console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
