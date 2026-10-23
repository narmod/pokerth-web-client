#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// Tournament director prototype — watch ONE table as a spectator and write
// its sealed journal and signed ranking.
//
//   node scripts/td-spectate.mjs --host 192.168.1.20 --port 7234 \
//        --nick TD-test-T1 --game-name "Friday SnG" [--game-password x] \
//        [--tls] [--insecure] [--pin <base64>] [--server-password x] \
//        [--login unauth|guest|auth] [--password x] \
//        [--key td-key.pem] [--out td-out]
//
//   node scripts/td-spectate.mjs --verify td-out.result.json td-out.journal.json
//
// Writes <out>.journal.json (every event, hash-chained) and
// <out>.result.json (ranking + head hash + Ed25519 signature). The key
// file is created on first use (chmod 600) and must never be committed.
// Prototype, step 1 of docs/TOURNAMENT_DIRECTOR.md: it only watches.
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync, chmodSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SpectatorDirector, replayJournal } from '../server/tournament/spectator.mjs';
import { generateKeys, verifyJournal, verifyPayload, publicKeyRawB64, canonical } from '../server/tournament/journal.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const k = a.slice(2);
    if (['tls', 'insecure', 'verify', 'help'].includes(k)) { o[k] = true; continue; }
    const v = argv[++i];
    if (k === 'pin') (o.pins = o.pins || []).push(v); else o[k] = v;
  }
  return o;
}

function usage(code) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(2, 17).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(code);
}

function loadKey(path) {
  if (!existsSync(path)) {
    const k = generateKeys();
    writeFileSync(path, k.privateKeyPem, { mode: 0o600 });
    try { chmodSync(path, 0o600); } catch (e) {}
    console.error('[td] new install key written to ' + path);
  }
  return readFileSync(path, 'utf8');
}

function verify(resultPath, journalPath) {
  const sealed = JSON.parse(readFileSync(resultPath, 'utf8'));
  const journal = JSON.parse(readFileSync(journalPath, 'utf8'));
  const chain = verifyJournal(journal.entries || []);
  const checks = {
    chain: chain.ok,
    headMatches: chain.ok && sealed.payload.head === chain.head && sealed.payload.entries === journal.entries.length,
    signature: !!(sealed.signature && sealed.publicKeyPem && verifyPayload(sealed.payload, sealed.signature, sealed.publicKeyPem)),
    replay: canonical(replayJournal(journal.entries)) === canonical(sealed.payload.result),
  };
  console.log(JSON.stringify({ ok: Object.values(checks).every(Boolean), checks, badSeq: chain.badSeq }, null, 2));
  process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
}

const a = args(process.argv.slice(2));
if (a.help) usage(0);
if (a.verify) verify(a._[0], a._[1]);
if (!a.host || !a.port || !a.nick || (!a['game-id'] && !a['game-name'])) usage(2);

let version = '';
try { version = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version; } catch (e) {}
const keyPem = loadKey(a.key || 'td-key.pem');
const out = a.out || 'td-out';

const d = new SpectatorDirector({
  host: a.host, port: Number(a.port), tls: !!a.tls, insecure: !!a.insecure, pins: a.pins, servername: a.sni,
  nick: a.nick, login: a.login || 'unauth', password: a.password, serverPassword: a['server-password'],
  gameId: a['game-id'] != null ? Number(a['game-id']) : undefined, gameName: a['game-name'], gamePassword: a['game-password'],
  privateKeyPem: keyPem, version,
});
d.on('log', (m) => console.error('[td] ' + m));
d.on('event', (ev) => { if (ev.type === 'handStart') console.error('[td] hand ' + d.tracker.hand); });
d.on('failed', (code, data) => { console.error('[td] failed: ' + code + ' ' + JSON.stringify(data)); });
d.on('result', (sealed, journal) => {
  writeFileSync(out + '.journal.json', JSON.stringify(journal, null, 1));
  writeFileSync(out + '.result.json', JSON.stringify(sealed, null, 2));
  console.log(JSON.stringify(sealed.payload.result, null, 2));
  console.error('[td] head ' + sealed.payload.head + ' · key ' + publicKeyRawB64(sealed.publicKeyPem));
});
d.on('stopped', (reason) => {
  if (reason !== 'finished') writeFileSync(out + '.journal.json', JSON.stringify(d.journal.toJSON(), null, 1));
  process.exitCode = reason === 'finished' ? 0 : 1;
});
process.on('SIGINT', () => { console.error('[td] interrupted, journal kept'); d.stop('interrupted'); });
d.start();
