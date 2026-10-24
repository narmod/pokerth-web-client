// ═══════════════════════════════════════════════════════════════════
// Arena — everything the service takes from the PokerTH web client, in
// one place (service 0.21.2; standalone layout since 0.37.0, 2026-10-24).
//
// The Arena grew up inside the web client's repository and is becoming an
// application of its own. No other file of the service reaches outside
// arena/: they import from here (test-arena-platform.mjs checks the rule).
//
//   pb                 the PokerTH protocol (protobuf)
//   create presets     the « Create a table » lists and limits
//   SQL_VENDOR_DIR     sql.js (WASM) to read PokerTH .pdb logs
//   webClientVersion() the release the director tells the server it speaks
//   DEFAULT_DATA_DIR   where the data goes when ARENA_DIR is not set
//   LANG_META_FILE     the languages (name, direction, flag), served to the
//                      pages as /arena/lang-meta.mjs (service 0.30.0)
//   HERO_IMAGE_FILE    the chips and flames behind the page titles, served as
//                      /arena/img/hero.webp (service 0.31.0)
//   FONTS_DIR          the Inter font, served as /arena/fonts/ (0.37.0)
//
// Each one is looked for, in this order:
//   1. its ARENA_* variable (ARENA_SQL_DIR, ARENA_CLIENT_VERSION, ARENA_DIR,
//      ARENA_LANG_META, ARENA_HERO_IMAGE, ARENA_FONTS_DIR);
//   2. the Arena's own copy, arena/shared/ — what an Arena of its own ships,
//      filled by `node scripts/sync-shared.mjs <web client folder>`;
//   3. the web client around it (../public/…), while the Arena still lives
//      in the web client's repository.
// STANDALONE is true when there is no web client around: the data folder
// then defaults to arena/data instead of the web client's arena-data.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// The Arena's folder, its own copies, and the web client's folder around it.
export const ARENA_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SHARED_DIR = path.join(ARENA_ROOT, 'shared');
export const WEB_ROOT = path.join(ARENA_ROOT, '..');
const inShared = (...p) => path.join(SHARED_DIR, ...p);
const inWeb = (...p) => path.join(WEB_ROOT, 'public', ...p);
const pick = (env, own, web) => (process.env[env] ? process.env[env] : fs.existsSync(own) ? own : web);

export const STANDALONE = !fs.existsSync(inWeb('proto', 'pokerth-bundle.mjs'));

const PROTO_FILE = fs.existsSync(inShared('proto', 'pokerth-bundle.mjs')) ? inShared('proto', 'pokerth-bundle.mjs') : inWeb('proto', 'pokerth-bundle.mjs');
const PRESETS_FILE = fs.existsSync(inShared('create-presets.mjs')) ? inShared('create-presets.mjs') : inWeb('modules', 'create-presets.mjs');
export const pb = await import(pathToFileURL(PROTO_FILE).href);
const presets = await import(pathToFileURL(PRESETS_FILE).href);
export const { LIMITS, STYLES, TEMPLATES, TEMPLATE_DELAY, DEFAULT_STYLE, createPresets } = presets;

export const SQL_VENDOR_DIR = pick('ARENA_SQL_DIR', inShared('vendor'), inWeb('vendor'));
export const LANG_META_FILE = pick('ARENA_LANG_META', inShared('lang-meta.mjs'), inWeb('modules', 'lang-meta.mjs'));
export const HERO_IMAGE_FILE = pick('ARENA_HERO_IMAGE', inShared('img', 'hero.webp'), inWeb('img', 'pokerth-login-bg.webp'));
export const FONTS_DIR = pick('ARENA_FONTS_DIR', inShared('fonts'), inWeb('fonts'));

export const DEFAULT_DATA_DIR = STANDALONE ? path.join(ARENA_ROOT, 'data') : path.join(WEB_ROOT, 'arena-data');

// « 2.1.10-web.319 »: the director derives the PokerTH release from it.
// The web client's version from the copy (shared/client-version.json), else
// from the web client around it.
export function webClientVersion() {
  if (process.env.ARENA_CLIENT_VERSION) return process.env.ARENA_CLIENT_VERSION;
  for (const f of [inShared('client-version.json')].concat(STANDALONE ? [] : [path.join(WEB_ROOT, 'package.json')])) {
    try { const v = JSON.parse(fs.readFileSync(f, 'utf8')).version; if (v) return v; } catch (e) {}
  }
  return '';
}
