// Verifie la LOGIQUE de seuil du watchdog RX telle qu'elle est ecrite dans
// pokerth.js (le setInterval lui-meme n'est pas importable). On rejoue la
// meme arithmetique sur les champs de S pour verrouiller les regles :
//   - lobby sans battement observe  -> jamais arme
//   - lobby avec battements         -> seuil = max(plancher, 2.5 x intervalle)
//   - table                         -> seuil inchange
import fs from 'node:fs';
globalThis.window = globalThis;
const src = fs.readFileSync('public/pokerth.js', 'utf8');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  \u2717 ' + m); } else console.log('  \u2713 ' + m); };

// Le code doit bien contenir les deux branches et la garde des 2 battements.
ok(/_inLobby\s*=\s*!!\(sl && sl\.classList\.contains\('active'\)\)/.test(src), 'watchdog : le lobby est bien pris en compte');
ok(/if \(S\._hbCount < 2 \|\| !S\._hbInterval\) return;/.test(src), 'watchdog : garde des 2 battements observes');
ok(/Math\.max\(S\._HB_WATCHDOG_MIN_MS, Math\.round\(S\._hbInterval \* 2\.5\)\)/.test(src), 'watchdog : seuil lobby adosse a l\u2019intervalle mesure');
ok(/Math\.max\(S\._RX_WATCHDOG_MIN_MS, \(_tt \+ 20\) \* 1000\)/.test(src), 'watchdog : seuil de table inchange');

const { S } = await import(process.cwd() + '/public/modules/game/state.mjs');
const lobbyThr = (hbCount, hbInterval) => {
  if (hbCount < 2 || !hbInterval) return null;                 // pas arme
  return Math.max(S._HB_WATCHDOG_MIN_MS, Math.round(hbInterval * 2.5));
};
ok(lobbyThr(0, 0) === null, 'serveur 2.0.x (aucun battement) : watchdog lobby jamais arme');
ok(lobbyThr(1, 0) === null, 'un seul battement : pas encore arme');
ok(lobbyThr(2, 45000) === 112500, 'battement 45 s -> seuil 112,5 s (2 manques + marge)');
ok(lobbyThr(2, 10000) === S._HB_WATCHDOG_MIN_MS, 'battement court : le plancher protege des reconnexions inutiles');
ok(lobbyThr(2, 60000) === 150000, 'battement 60 s -> le seuil suit le serveur');
ok(S._HB_WATCHDOG_MIN_MS > 2 * 45000, 'plancher > 2 battements de 45 s');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exitCode = fail ? 1 : 0;
