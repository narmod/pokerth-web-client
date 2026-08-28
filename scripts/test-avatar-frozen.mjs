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
ok(/_pthUploadKey = ki;\s+if \(_pthLoadFrozenUpload\('img'\)\) return;\s+_pthPrepareMyUpload\(url\)/.test(js), 'image perso : gel avant r\u00e9-encodage');
ok(/_pthUploadKey = ke;\s+if \(_pthLoadFrozenUpload\(ke\)\) return;\s+_pthPrepareEmojiUpload\(stored\)/.test(js), 'emoji : gel avant r\u00e9-encodage');
ok(/_pthUploadKey = kl;\s+if \(_pthLoadFrozenUpload\(kl\)\) return;\s+_pthPrepareLetterUpload\(letter\)/.test(js), 'initiale : gel avant r\u00e9-encodage');
ok(/_pthCanvasToUpload\(cv, 'emoji:' \+ emoji\)/.test(js) && /_pthCanvasToUpload\(cv, 'letter:' \+ letter\)/.test(js), 'cl\u00e9s de gel distinctes par emoji / lettre');
ok(/_pthCanvasToUpload\(cv, 'img'\)/.test(js), 'import photo pass\u00e9 par la queue commune (plus de toBlob priv\u00e9)');
ok(/bytes\.length < 32 \|\| bytes\.length > 30720/.test(js), 'fen\u00eatre serveur [32, 30720] toujours appliqu\u00e9e (gel ET encodage)');

console.log('writers (invalidation du gel au changement d\u2019image):');
const html = readFileSync('public/pokerth-client.html', 'utf8');
ok((html.match(/localStorage\.removeItem\("pth_avatar_up"\)/g) || []).length === 2, 'galerie ET import fichier purgent pth_avatar_up (2 writers HTML)');
const st = readFileSync('public/modules/ui/avatar-studio.mjs', 'utf8');
ok(st.indexOf("localStorage.removeItem('pth_avatar_up')") !== -1, 'avatar studio purge pth_avatar_up');

if (bad) { console.log('FAIL ' + bad); process.exit(1); }
console.log('OK');
