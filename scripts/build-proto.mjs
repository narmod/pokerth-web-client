#!/usr/bin/env node
// scripts/build-proto.mjs
// ─────────────────────────────────────────────────────────────────────────
// Regenerate public/proto/{pokerth-bundle,protobuf-minimal}.mjs from
//   1. public/proto/pokerth.proto              (the schema)
//   2. node_modules/protobufjs/dist/minimal/   (the runtime)
//
// Run with:  npm run build:proto
// ─────────────────────────────────────────────────────────────────────────

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROTO_SRC   = join(ROOT, 'public', 'proto', 'pokerth.proto');
const BUNDLE_OUT  = join(ROOT, 'public', 'proto', 'pokerth-bundle.mjs');
const RUNTIME_OUT = join(ROOT, 'public', 'proto', 'protobuf-minimal.mjs');
const PBJS_BIN    = join(ROOT, 'node_modules', '.bin', 'pbjs');
const PB_MINIMAL  = join(ROOT, 'node_modules', 'protobufjs', 'dist', 'minimal', 'protobuf.min.js');

function fail(msg) {
    console.error('✗', msg);
    process.exit(1);
}

if (!existsSync(PROTO_SRC))  fail(`Schema not found at ${PROTO_SRC}`);
if (!existsSync(PBJS_BIN))   fail(`pbjs not found — run \`npm install\` first`);
if (!existsSync(PB_MINIMAL)) fail(`protobufjs runtime not found — run \`npm install\``);

// ─── Step 1: generate the static module from the .proto schema ──────────
console.log('▶ Generating pokerth-bundle.mjs from schema...');
const PBJS_ARGS = [
    '--keep-case',
    '--target', 'static-module',
    '--wrap', 'esm',
    '--es6',
    '--no-comments',
    '--no-delimited',
    '--no-service',
    '--no-typeurl',
    '--no-convert',
    PROTO_SRC,
];
let generated = execFileSync(PBJS_BIN, PBJS_ARGS, { encoding: 'utf-8' });

// Redirect the import to our local ESM-wrapped runtime instead of the
// bare CommonJS module that protobufjs ships.
generated = generated.replace(
    /import \$protobuf from "protobufjs\/minimal\.js";/,
    'import $protobuf from "./protobuf-minimal.mjs";'
);
writeFileSync(BUNDLE_OUT, generated);
console.log(`  ✓ ${BUNDLE_OUT} (${(generated.length / 1024).toFixed(0)} KB)`);

// ─── Step 2: wrap protobuf.min.js as an ES module ───────────────────────
console.log('▶ Wrapping protobuf-minimal as ESM...');
const umd = readFileSync(PB_MINIMAL, 'utf-8')
    .replace('//# sourceMappingURL=protobuf.min.js.map', '')
    .trimEnd() + '\n';

const wrapped =
`// public/proto/protobuf-minimal.mjs
// ESM wrapper around the protobufjs v8 minimal runtime (~24 KB minified).
// The UMD code inlined below sets globalThis.protobuf during execution; we
// capture that and re-export it as the default export of this module.
// Original source: https://github.com/protobufjs/protobuf.js (BSD-3-Clause).

const __prevProtobuf = globalThis.protobuf;

// === BEGIN protobufjs/dist/minimal/protobuf.min.js =====================
${umd}
// === END protobufjs minimal ===========================================

const $protobuf = globalThis.protobuf;
if (__prevProtobuf !== undefined) globalThis.protobuf = __prevProtobuf;
else delete globalThis.protobuf;
export default $protobuf;
`;
writeFileSync(RUNTIME_OUT, wrapped);
console.log(`  ✓ ${RUNTIME_OUT} (${(wrapped.length / 1024).toFixed(0)} KB)`);

console.log('\n✓ Done. Don\'t forget to test in the browser before committing.');
