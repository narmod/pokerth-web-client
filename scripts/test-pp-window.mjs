#!/usr/bin/env node
// Fenetre « Profil joueur » : structure du markup et rendus partages.
// Les rendus vivent dans le script inline de pokerth-client.html ; on les
// extrait et on les evalue sur une charge realiste plutot que de decrire le
// HTML attendu a la main.
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
const html = readFileSync('public/pokerth-client.html', 'utf8');
const dom = new JSDOM(html);
const d = dom.window.document;
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  \u2717', m); } else console.log('  \u2713', m); };

// ── Markup : meme carcasse generique que les autres fenetres ──
for (const id of ['pp-modal','pp-backdrop','pp-close','pp-title','pp-body'])
  ok(!!d.getElementById(id), 'markup : #' + id);
ok(!!d.querySelector('#pp-modal > .rk-card'), 'markup : carte .rk-card (carcasse generique)');
ok(d.querySelector('#pp-modal .rk-card > .rk-title') === d.getElementById('pp-title'),
   'markup : le titre est bien la poignee de deplacement');

// ── z-order : la fenetre doit etre declaree parmi les HOSTS ──
const zo = readFileSync('public/modules/ui/z-order.mjs', 'utf8');
ok(/HOSTS *=[^;]*#pp-modal/.test(zo), 'z-order : #pp-modal enregistre');

// ── CSS : conteneur fixe (sinon la carte tombe dans le flux, cf. web.94) ──
const css = readFileSync('public/pokerth.css', 'utf8');
ok(/#pp-modal \{[^}]*position: fixed/.test(css), 'css : conteneur position:fixed');
ok(/#pp-modal\.rk-floating/.test(css), 'css : mode fenetre flottante');
// Largeur suivant l'ecran : ni figee en px, ni sans borne haute.
const cardCss = (css.match(/#pp-modal \.rk-card \{[^}]*\}/) || [''])[0];
ok(/width:\s*clamp\(/.test(cardCss), 'css : largeur en clamp (suit l ecran)');
ok(/max-width:\s*calc\(100vw/.test(cardCss), 'css : bornee a la fenetre sur petit ecran');
ok(!/width:\s*min\(\d+px/.test(cardCss), 'css : plus de largeur figee en px');
// Taille d ouverture de la fenetre flottante : calculee, pas constante.
const openCall = (html.match(/key: 'pth-pp-win2',[\s\S]{0,400}/) || [''])[0];
ok(/defW:\s*Math\./.test(openCall), 'fenetre : largeur d ouverture calculee');
ok(/innerWidth/.test(openCall), 'fenetre : calculee depuis la taille d ecran');
ok(/Math\.max\(\s*\d+/.test(openCall) && /Math\.min\(\s*\d+/.test(openCall),
   'fenetre : bornee des deux cotes');

// ── Rendus extraits du script inline ──
const grab = (re, what) => { const m = html.match(re); if (!m) { console.error('NOT FOUND: ' + what); process.exit(1); } return m[0]; };
const code = [
  grab(/function rkEsc\(v\)[\s\S]*?\n  \}/, 'rkEsc'),
  grab(/function rkT\(key, fb\)[\s\S]*?\n  \}/, 'rkT'),
  grab(/function rkSection\(title, inner\) \{[\s\S]*?\n  \}/, 'rkSection'),
  grab(/function rkLast5\(a\) \{[\s\S]*?\n  \}/, 'rkLast5'),
  grab(/function rkRecentGames\(a\) \{[\s\S]*?\n  \}/, 'rkRecentGames'),
  grab(/function rkSeasonLabel\(sn\) \{[\s\S]*?\n  \}/, 'rkSeasonLabel'),
  grab(/function rkSeasons\(pid, list\) \{[\s\S]*?\n  \}/, 'rkSeasons'),
].join('\n') + '\nreturn { rkLast5, rkRecentGames, rkSeasons, rkSeasonLabel };';
const R = new Function('window', code)({});

ok(R.rkSeasonLabel('2026_2') === '2026 Q2', 'saison : "2026_2" -> "2026 Q2"');
ok(R.rkSeasonLabel('bogus') === 'bogus', 'saison : format inconnu laisse tel quel');
ok(R.rkLast5([]) === '', '5 dernieres : rien si vide');
const l5 = R.rkLast5([5, 1, 3]);
ok((l5.match(/rk-l5/g) || []).length === 3, '5 dernieres : une pastille par place');
ok(/rk-l5 win/.test(l5), '5 dernieres : la 1re place ressort');
ok(R.rkRecentGames([]) === '', 'parties : rien si vide');
const g = R.rkRecentGames([{ place: 1, name: 'a & b', date: '2026-08-26' }]);
ok(/rk-game-p win/.test(g), 'parties : la victoire ressort');
ok(g.includes('a &amp; b') && !g.includes('a & b'), 'parties : nom echappe');
ok(R.rkSeasons(0, ['2026_2']) === '', 'saisons : rien sans playerId');
ok(R.rkSeasons(7, []) === '', 'saisons : rien sans liste');
const ss = R.rkSeasons(7, ['2026_2', '2026_1']);
ok((ss.match(/class="rk-season"/g) || []).length === 2, 'saisons : une ligne par saison');
ok((ss.match(/class="rk-season-b" style="display:none"><\/div>/g) || []).length === 2,
   'saisons : corps vide et replie au depart (chargement paresseux)');
ok(ss.includes('data-pid="7"') && ss.includes('data-season="2026_2"'),
   'saisons : id et saison portes par la ligne (lus au depliage)');

console.log(fail ? `\n${fail}/${n} \u00c9CHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
