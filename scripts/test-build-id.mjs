// test-build-id.mjs — garde anti-dérive du buildId annoncé au serveur.
//
// Contexte (12/08/2026) : le serveur de jeu a affiché « 2.1.3 » pour les
// probes admin alors que le client émettait 2.1.6 — la façade proto avait
// un BUILD_ID figé. Depuis web.64, client ET probes dérivent leur buildId
// de BUILD_VERSION ; seuls les REPLIS (BUILD_VERSION absent/malformé)
// restent en dur et doivent être bumpés à chaque release upstream.
// Ce test échoue si l'une des trois vérités diverge de package.json :
//   1. la dérivation de la façade proto (avec BUILD_VERSION posé) ;
//   2. son repli (sans BUILD_VERSION) ;
//   3. le repli de net/messages.mjs (vérifié dans la source).
//
// Lancé hors ligne, déterministe — à exécuter avant tout push touchant
// proto/, net/messages.mjs ou la version.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let fails = 0;
function ok(cond, label) {
  console.log((cond ? 'ok   ' : 'FAIL ') + label);
  if (!cond) fails++;
}

// ── Vérité de référence : le triple upstream de package.json ──────────────
const pkgVersion = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
const m = /^(\d+)\.(\d+)\.(\d+)-web\.\d+$/.exec(pkgVersion);
ok(!!m, 'package.json : version au format MAJ.MIN.PATCH-web.N (' + pkgVersion + ')');
if (!m) { process.exit(1); }
const [MAJ, MIN, PATCH] = [+m[1], +m[2], +m[3]];
const EXPECTED = ((0x01 << 24) | (MAJ << 16) | (MIN << 8) | PATCH) >>> 0; // Qt-Widget

// ── 1+2. Façade proto : dérivation puis repli ─────────────────────────────
globalThis.BUILD_VERSION = pkgVersion;
const derived = (await import('../public/proto/index.mjs')).BUILD_ID;
ok(derived === EXPECTED,
   'proto/index.mjs : BUILD_ID dérivé = 0x' + derived.toString(16) + ' (attendu 0x' + EXPECTED.toString(16) + ')');

// Repli : ré-import avec BUILD_VERSION absent. Le cache ESM interdit un
// second import du même URL → on évalue le module dans un contexte neuf.
delete globalThis.BUILD_VERSION;
const idxSrc = readFileSync(join(ROOT, 'public/proto/index.mjs'), 'utf8');
const iife = /export const BUILD_ID = (\(\(\) => \{[\s\S]*?\}\)\(\));/.exec(idxSrc);
ok(!!iife, 'proto/index.mjs : IIFE de dérivation présente (pas de valeur figée)');
if (iife) {
  const fallback = eval(iife[1]); // BUILD_VERSION absent → repli
  ok(fallback === EXPECTED,
     'proto/index.mjs : repli = 0x' + fallback.toString(16) + ' (attendu 0x' + EXPECTED.toString(16) + ') — bumper le repli à chaque release');
}
ok(!/BUILD_ID = 0x[0-9a-fA-F]+;/.test(idxSrc), 'proto/index.mjs : aucun BUILD_ID en dur réintroduit');

// ── 3. Repli de net/messages.mjs ──────────────────────────────────────────
const msgSrc = readFileSync(join(ROOT, 'public/modules/net/messages.mjs'), 'utf8');
const fb = /let UPSTREAM_MAJOR = (\d+), UPSTREAM_MINOR = (\d+), UPSTREAM_PATCH = (\d+);/.exec(msgSrc);
ok(!!fb, 'net/messages.mjs : triple de repli présent');
if (fb) {
  ok(+fb[1] === MAJ && +fb[2] === MIN && +fb[3] === PATCH,
     'net/messages.mjs : repli ' + fb[1] + '.' + fb[2] + '.' + fb[3] + ' = package.json ' + MAJ + '.' + MIN + '.' + PATCH + ' — bumper le repli à chaque release');
}
// La dérivation runtime doit toujours exister (pas de retour au dur)
ok(/window\.BUILD_VERSION/.test(msgSrc) && /-web\\\.\\d\+/.test(msgSrc.replace(/\n/g, ' ')) || /exec\(window\.BUILD_VERSION/.test(msgSrc),
   'net/messages.mjs : dérivation depuis BUILD_VERSION toujours en place');

console.log(fails ? '\n' + fails + ' ÉCHEC(S)' : '\nAll build-id tests passed.');
process.exit(fails ? 1 : 0);
