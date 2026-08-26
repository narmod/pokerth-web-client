#!/usr/bin/env node
// Parseurs profil pokerth.net du relais (proxy.js) : playerParsePth et
// playerSeasonParsePth. Extraits du bundle et evalues seuls -- proxy.js n'est
// pas importable (il ecoute un port au chargement).
import { readFileSync } from 'fs';
const src = readFileSync('proxy.js', 'utf8');
const grab = (re, what) => {
  const m = src.match(re);
  if (!m) { console.error('NOT FOUND: ' + what); process.exit(1); }
  return m[0];
};
const code = grab(/function playerParsePth\(json, base\) \{[\s\S]*?\n\}/, 'playerParsePth')
  + '\n' + grab(/function playerSeasonParsePth\(json\) \{[\s\S]*?\n\}/, 'playerSeasonParsePth')
  + '\nreturn { show: playerParsePth, season: playerSeasonParsePth };';
const { show, season } = new Function(code)();

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  \u2717', m); } else console.log('  \u2713', m); };
const eq = (g, w, m) => ok(JSON.stringify(g) === JSON.stringify(w), m + ' -> ' + JSON.stringify(g) + (JSON.stringify(g) === JSON.stringify(w) ? '' : ' (attendu ' + JSON.stringify(w) + ')'));

// ── player/show, reponse complete (forme observee cote QML) ──
const full = {
  status: true,
  pos: 73,
  player: { id: 4242, username: 'darmax99', created: '2021-04-06 11:22:33', last_login: '2026-08-26 07:00:00',
            ranking: { final_score: 11794, average_score: 472, season_games: 240, points_sum: 1133 } },
  last5: [5, 4, 1, 5, 5],
  games: [{ place: 5, game: { name: 'Just another Game' }, start_time: '2026-08-26 09:10:00' },
          { place: 1, game: { name: '....' }, start_time: '2026-08-25 20:00:00' }],
  bar_stats: [26, 26, 34, 35, 31, 24, 24, 19, 12, 9],
  stats: [null, { 1: '10.8%', 2: '10.8%', 3: '14.2%', 4: '14.6%', 5: '12.9%', 6: '10%', 7: '10%', 8: '7.9%', 9: '5%', 10: '3.8%' }],
  seasons: ['2026_2', '2026_1', '2025_4']
};
const r = show(full, 'https://www.pokerth.net');
ok(r.ok === true, 'show : ok');
eq(r.nickname, 'darmax99', 'show : pseudo');
eq(r.playerId, 4242, 'show : playerId (necessaire au chargement par saison)');
eq(r.memberSince, '2021-04-06', 'show : membre depuis (date seule)');
eq(r.lastLogin, '2026-08-26', 'show : derniere connexion');
eq(r.stats[0].rank, 73, 'show : rang');
eq(r.stats[0].score, '117.94', 'show : score (/100)');
eq(r.stats[0].avg, '4.72', 'show : moyenne (/100)');
eq(r.stats[0].games, 240, 'show : parties');
eq(r.stats[0].points, 1133, 'show : points');
eq(r.last5, [5, 4, 1, 5, 5], 'show : 5 dernieres');
eq(r.games.length, 2, 'show : parties recentes');
eq(r.games[0], { place: 5, name: 'Just another Game', date: '2026-08-26' }, 'show : 1re partie recente');
eq(r.seasons, ['2026_2', '2026_1', '2025_4'], 'show : saisons');
eq(r.placement.counts, [26, 26, 34, 35, 31, 24, 24, 19, 12, 9], 'show : repartition');

// ── Robustesse : champs absents ou salis ──
const bare = show({ status: true, pos: 0, player: { username: 'x' } }, '');
ok(bare.ok === true, 'nu : ok');
eq(bare.last5, [], 'nu : 5 dernieres vide');
eq(bare.games, [], 'nu : parties vides');
eq(bare.seasons, [], 'nu : saisons vides');
eq(bare.placement, null, 'nu : pas de repartition');
eq(bare.playerId, null, 'nu : pas d id');

const dirty = show({ status: true, pos: 1, player: { username: 'y' },
  last5: [3, 'x', 0, -2, 7, 9, 9, 9],
  games: [{ place: 'z', game: null, start_time: null }, null],
  seasons: ['2026_2', '2026_5', 'oops', '../etc/passwd', '2025_1'] }, '');
eq(dirty.last5, [3, 7], 'sali : 5 dernieres filtrees (non numeriques et <= 0 retires)');
eq(dirty.games[0], { place: null, name: '', date: null }, 'sali : partie degradee sans planter');
eq(dirty.seasons, ['2026_2', '2025_1'], 'sali : saisons hors format rejetees (dont traversee de chemin)');
ok(show({ status: false }, '').ok === false, 'status faux : rejete');
ok(show(null, '').ok === false, 'null : rejete');

// ── player/season ──
const s1 = season({ status: true, pos: 46, player: { ranking: { final_score: 13261, average_score: 500, season_games: 120, points_sum: 700 } },
                    bar_stats: [1, 2, 3, 0, 0, 0, 0, 0, 0, 0], stats: [null, { 1: '16.7%' }] });
ok(s1.played === true, 'saison : jouee');
eq(s1.rank, 46, 'saison : rang');
eq(s1.score, '132.61', 'saison : score');
eq(s1.avg, '5.00', 'saison : moyenne');
eq(s1.placement.counts.slice(0, 3), [1, 2, 3], 'saison : repartition');
const s2 = season({ status: false });
ok(s2.ok === true && s2.played === false, 'saison non jouee : ok + played=false (la carte se masque)');
const s3 = season({ status: true, player: {}, bar_stats: [] });
ok(s3.played === false, 'saison vide : played=false');

console.log(fail ? `\n${fail}/${n} \u00c9CHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
