// ═══════════════════════════════════════════════════════════════════
// Arena — everything the service takes from the PokerTH web client, in
// one place (service 0.21.2, 2026-10-24).
//
// The Arena lives inside the web client's repository today. To keep the day
// it becomes an application of its own a small one, no other file of the
// service reaches outside arena/: they import from here. Splitting the
// Arena out then means changing this file only (copy the files it points
// to, or read them from elsewhere). test-arena-platform.mjs checks the rule.
//
//   pb                 the PokerTH protocol (protobuf), public/proto
//   create presets     the « Create a table » lists and limits,
//                      public/modules/create-presets.mjs
//   SQL_VENDOR_DIR     sql.js (WASM) to read PokerTH .pdb logs, public/vendor
//   webClientVersion() the release the director tells the server it speaks
//   DEFAULT_DATA_DIR   where the data goes when ARENA_DIR is not set
//   LANG_META_FILE     the languages (name, direction, flag), the web client's
//                      public/modules/lang-meta.mjs — served to the pages as
//                      /arena/lang-meta.mjs (service 0.30.0)
//   HERO_IMAGE_FILE    the chips and flames of the start screen, behind the
//                      page titles: public/img/pokerth-login-bg.webp, served
//                      as /arena/img/hero.webp (service 0.31.0)
//
// Each one that can come from the environment does: ARENA_SQL_DIR,
// ARENA_CLIENT_VERSION, ARENA_DIR, ARENA_LANG_META, ARENA_HERO_IMAGE.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pb from '../../public/proto/pokerth-bundle.mjs';

export { pb };
export { LIMITS, STYLES, TEMPLATES, TEMPLATE_DELAY, DEFAULT_STYLE, createPresets } from '../../public/modules/create-presets.mjs';

// The web client's folder (the repository root).
export const WEB_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const SQL_VENDOR_DIR = process.env.ARENA_SQL_DIR || path.join(WEB_ROOT, 'public', 'vendor');

export const DEFAULT_DATA_DIR = path.join(WEB_ROOT, 'arena-data');

export const LANG_META_FILE = process.env.ARENA_LANG_META || path.join(WEB_ROOT, 'public', 'modules', 'lang-meta.mjs');

export const HERO_IMAGE_FILE = process.env.ARENA_HERO_IMAGE || path.join(WEB_ROOT, 'public', 'img', 'pokerth-login-bg.webp');

// « 2.1.10-web.319 »: the director derives the PokerTH release from it.
export function webClientVersion() {
  if (process.env.ARENA_CLIENT_VERSION) return process.env.ARENA_CLIENT_VERSION;
  try { return JSON.parse(fs.readFileSync(path.join(WEB_ROOT, 'package.json'), 'utf8')).version || ''; } catch (e) { return ''; }
}
