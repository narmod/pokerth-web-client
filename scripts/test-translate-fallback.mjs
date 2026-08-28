// Durcissement du repli de traduction — parité QML 69ec0824 ("qml/widget:
// translation fallback hardening", stable, 26/08/2026). Google drosselant
// l'endpoint gtx par IP (HTTP 429, vu chez les joueurs sous VPN), la chaîne
// devient : gtx direct → MyMemory direct (IP du joueur) → relais serveur
// (gtx puis MyMemory). Vérifications de source, déterministes, sans réseau.
import { readFileSync } from 'fs';

let bad = 0;
const ok = (cond, label) => {
  console.log('  ' + (cond ? '\u2713' : 'FAIL') + ' ' + label);
  if (!cond) bad++;
};

console.log('client (pokerth.js):');
const js = readFileSync('public/pokerth.js', 'utf8');
ok(js.indexOf('window._mmTranslate = function') !== -1, 'repli MyMemory côté client présent');
ok(js.indexOf("'Autodetect|' + tl") !== -1, 'langpair Autodetect|cible (jamais « en » codé en dur)');
ok(/parseInt\(d\.responseStatus, 10\)/.test(js), 'responseStatus vérifié (nombre OU chaîne)');
ok(/DISTINCT LANGUAGES/i.test(js), 'cas « source == cible » (403 DISTINCT LANGUAGES) → original rendu');
ok(/status !== 200[\s\S]{0,200}throw new Error\('mm_status/.test(js), 'avertissement MAJUSCULES jamais servi comme traduction');
ok(/q\.length > 480[\s\S]{0,60}mm_skip/.test(js), 'textes longs (forum) sautent MyMemory (limite ~500 octets)');
// Ordre de la chaîne : gtx direct, puis _mmTranslate, puis /api/translate.
const gtx = js.indexOf("translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +\n    encodeURIComponent(tl)");
const mm  = js.indexOf('window._mmTranslate(q, tl)');
const rel = js.indexOf("fetch('/api/translate'");
ok(gtx !== -1 && mm !== -1 && rel !== -1 && gtx < mm && mm < rel, 'chaîne gtx direct → MyMemory direct → relais, dans cet ordre');
ok(/_trFailNoteAt[\s\S]{0,200}60000/.test(js), 'note d\u2019échec visible, throttlée 60 s (parité postFailureNote)');
ok(/showToast\(t\('chatTranslateFailed'\)/.test(js), 'note via la clé i18n existante (45 langues déjà couvertes)');

console.log('relais (proxy.js):');
const px = readFileSync('proxy.js', 'utf8');
ok(px.indexOf('api.mymemory.translated.net/get') !== -1, 'repli MyMemory côté relais présent');
ok((px.match(/Autodetect\|/g) || []).length >= 1, 'relais aussi en Autodetect|cible');
ok(/parseInt\(d\.responseStatus, 10\)/.test(px), 'relais vérifie responseStatus');
ok(/DISTINCT LANGUAGES/.test(px), 'relais rend l\u2019original pour source == cible');
ok(/mm_status_/.test(px), 'relais refuse l\u2019avertissement MAJUSCULES');
ok(/ok: true, text: res2\.text, src: res2\.src/.test(px), 'même forme de réponse {ok,text,src} — client agnostique du service');
ok(/TRANSLATE_CACHE\.set\(key,[\s\S]{0,40}body: body \}\);\s+res\.writeHead\(200/.test(px), 'résultat MyMemory mis en cache comme gtx');

if (bad) { console.log('FAIL ' + bad); process.exit(1); }
console.log('OK');
