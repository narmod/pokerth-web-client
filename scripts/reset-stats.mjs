#!/usr/bin/env node
// Reset the family leaderboard (stats.json) from the command line.
//
//   npm run stats:reset
//
// Empties the stored leaderboard and clears the period marker. If the proxy is
// currently running, restart it afterwards so the in-memory copy is dropped:
//
//   pm2 restart pokerth-web      # (or: docker compose restart)
//
// Honors the same STATS_FILE / STATS_META_FILE env vars as the proxy.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const STATS_FILE = process.env.STATS_FILE || path.join(root, 'stats.json');
const STATS_META_FILE = process.env.STATS_META_FILE || path.join(root, 'stats.meta.json');

try {
  fs.writeFileSync(STATS_FILE, '{}');
  console.log('[stats] leaderboard reset:', STATS_FILE);
} catch (e) {
  console.error('[stats] reset failed:', e.message);
  process.exit(1);
}
try {
  if (fs.existsSync(STATS_META_FILE)) fs.unlinkSync(STATS_META_FILE);
} catch (e) { /* no marker yet — fine */ }

console.log('Done. If the proxy is running, restart it to apply:');
console.log('  pm2 restart pokerth-web   (or: docker compose restart)');
