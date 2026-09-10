// Octets d'avatar gelés — rapport sp0ck 28/08/2026 : le même avatar (ex. le
// Johnny Depp de neuling) arrivait au serveur sous plusieurs hashes. Cause :
// l'image était RE-encodée (canvas → PNG) à chaque session, et toBlob dépend
// de l'encodeur du navigateur du jour. Désormais le PNG est encodé UNE fois,
// persisté (pth_avatar_up) et resservi octet pour octet — comme le desktop
// QML qui hashe le fichier une fois pour toutes. Vérifications de source.
import { readFileSync } from 'fs';

let bad = 0;
const ok = (cond, label) => {
  console.log('  ' + (cond ? '\u2713' : 'FAIL') + ' ' + label);
  if (!cond) bad++;
};

console.log('pokerth.js:');
const js = readFileSync('public/pokerth.js', 'utf8');
ok(/_pthCanvasToUpload\(cv, key\)/.test(js), 'queue d\u2019encodage commune avec cl\u00e9 de gel');
ok(/localStorage\.setItem\('pth_avatar_up', JSON\.stringify\(\{ k: key, b64: btoa\(b64\) \}\)\)/.test(js), 'PNG encod\u00e9 persist\u00e9 en base64 (pth_avatar_up)');
ok(/function _pthLoadFrozenUpload\(key\)/.test(js), 'rechargement des octets gel\u00e9s pr\u00e9sent');
ok(/rec\.k !== key/.test(js), 'gel resservi UNIQUEMENT pour le choix courant (cl\u00e9 v\u00e9rifi\u00e9e)');
// Chaque branche du dispatcher tente le gel avant tout ré-encodage.
// Image perso : la clé de gel est liée au CONTENU (MD5 du data URL) — une autre
// image (import de sauvegarde, synchro) ne peut plus se voir resservir le gel
// d'une précédente : ce qui part au serveur est ce qui est affiché.
ok(/var kf = 'img:' \+ _pthHex\(_md5bytes\(_pthAsciiBytes\(url\)\)\);\s+_pthPendingKey = kf;\s+if \(_pthLoadFrozenUpload\(kf\)\) return;\s+_pthPrepareMyUpload\(url, kf\)/.test(js), 'image perso : gel avant r\u00e9-encodage, cl\u00e9 li\u00e9e au contenu');
ok(js.indexOf("_pthLoadFrozenUpload('img')") === -1, 'plus de cl\u00e9 fixe \u00ab img \u00bb (gel resservi pour une autre image)');
ok(/_pthUploadKey = ke;\s+_pthPendingKey = ke;\s+if \(_pthLoadFrozenUpload\(ke\)\) return;\s+_pthPrepareEmojiUpload\(stored\)/.test(js), 'emoji : gel avant r\u00e9-encodage');
ok(/_pthCanvasToUpload\(cv, 'emoji:' \+ emoji\)/.test(js), 'cl\u00e9 de gel par emoji');
ok(/_pthCanvasToUpload\(cv, key\);/.test(js) && /function _pthPrepareMyUpload\(dataUrl, key\)/.test(js), 'import photo pass\u00e9 par la queue commune avec sa cl\u00e9');
// Encodage asynchrone doublé par un nouveau choix : rien de périmé n'est publié.
ok((js.match(/if \(key !== _pthPendingKey\) return;/g) || []).length === 2, 'encodage p\u00e9rim\u00e9 ignor\u00e9 (avant et apr\u00e8s arrayBuffer)');
// Parité QML (MyAvatar vide) : initiale et avatar par défaut n'annoncent aucun hash.
ok(js.indexOf('_pthPrepareLetterUpload') === -1, 'plus de PNG g\u00e9n\u00e9r\u00e9 pour l\u2019initiale');
ok(/\} else if \(stored === '__pth__'\) \{\s+_pthClearMyUpload\(\);\s+\} else if \(stored\) \{/.test(js), '__pth__ : aucun upload');
ok(/\/\/ joueurs voient l'avatar par d\u00e9faut, l'initiale reste locale\.\s+_pthClearMyUpload\(\);\s+\}/.test(js), 'initiale (Aa / d\u00e9faut) : aucun upload');
ok(/bytes\.length < 32 \|\| bytes\.length > 30720/.test(js), 'fen\u00eatre serveur [32, 30720] toujours appliqu\u00e9e (gel ET encodage)');

console.log('writers (invalidation du gel au changement d\u2019image):');
const html = readFileSync('public/pokerth-client.html', 'utf8');
ok((html.match(/localStorage\.removeItem\("pth_avatar_up"\)/g) || []).length === 2, 'galerie ET import fichier purgent pth_avatar_up (2 writers HTML)');
const st = readFileSync('public/modules/ui/avatar-studio.mjs', 'utf8');
ok(st.indexOf("localStorage.removeItem('pth_avatar_up')") !== -1, 'avatar studio purge pth_avatar_up');

if (bad) { console.log('FAIL ' + bad); process.exit(1); }
console.log('OK');
