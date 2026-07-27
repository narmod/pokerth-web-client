#!/usr/bin/env node
// Tests déterministes pour public/modules/handlog.mjs — couche stats.
// Run: node scripts/test-handlog.mjs
//
// Périmètre : le CALCUL (StatsCalculator) et la PORTÉE d'agrégation. La
// persistance IndexedDB et le rendu DOM du HUD ne sont pas couverts ici :
// le calcul est alimenté par des tables en mémoire, exactement au modèle .pdb.
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  getElementById: () => null, createElement: () => ({ style: {} }),
  body: { appendChild() {} } };

const H = await import('../public/modules/handlog.mjs');
const { StatsData, StatsCalculator, RECENT_HANDS } = H;

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Fabrique d'actions au modèle .pdb (actionID croissant = ordre chronologique).
let _id = 0;
const A = (ug, hand, beRo, seat, action, amount = null) =>
  ({ actionID: ++_id, uniqueGameID: ug, handID: hand, beRo, seat, action, amount });
const calc = (tables) => new StatsCalculator(new StatsData(tables)).calculateAllPlayersStats();

// ── All-in / mains gagnées ────────────────────────────────────────────────
{
  const players = [
    { uniqueGameID: 1, player: 'Alice', seat: 0 },
    { uniqueGameID: 1, player: 'Bob', seat: 1 },
  ];
  const hands = [1, 2, 3, 4].map((h) => ({ uniqueGameID: 1, handID: h }));
  const actions = [
    // 1 : Alice all-in préflop et remporte le pot
    A(1, 1, 0, 0, 'is all in with', 100), A(1, 1, 0, 1, 'folds'), A(1, 1, 4, 0, 'wins', 150),
    // 2 : Bob remporte
    A(1, 2, 0, 0, 'calls', 20), A(1, 2, 0, 1, 'bets', 60),
    A(1, 2, 1, 0, 'folds'), A(1, 2, 4, 1, 'wins', 80),
    // 3 : Alice all-in, rafle pot principal ET side pot → UNE seule main gagnée
    A(1, 3, 0, 0, 'is all in with', 200), A(1, 3, 0, 1, 'calls', 200),
    A(1, 3, 4, 0, 'wins (side pot)', 40), A(1, 3, 4, 0, 'wins', 360),
    // 4 : Bob remporte la main PUIS la partie — 'wins game' ne compte pas
    A(1, 4, 0, 0, 'folds'), A(1, 4, 0, 1, 'bets', 30),
    A(1, 4, 4, 1, 'wins', 50), A(1, 4, 4, 1, 'wins game'),
  ];
  const st = calc({ games: [{ uniqueGameID: 1 }], players, hands, actions });

  ok(st.Alice.hands === 4, 'total des mains jouées');
  ok(st.Alice.allin === 2, 'compteur all-in');
  ok(st.Bob.allin === 0, 'aucun all-in → 0 (et non null)');
  ok(st.Alice.won === 50, 'mains gagnées : pot principal + side pot = 1 seule main');
  ok(st.Bob.won === 50, "'wins game' n'est pas compté comme une main gagnée");
}

// ── Tendance récente ──────────────────────────────────────────────────────
{
  // 40 mains ultra-serrées puis 20 mains où le joueur entre systématiquement :
  // la fenêtre courte doit isoler la bascule que la moyenne globale lisse.
  const players = [
    { uniqueGameID: 1, player: 'Alice', seat: 0 },
    { uniqueGameID: 1, player: 'Bob', seat: 1 },
  ];
  const hands = [], actions = [];
  for (let h = 1; h <= 60; h++) {
    hands.push({ uniqueGameID: 1, handID: h });
    actions.push(A(1, h, 0, 1, 'bets', 20));
    actions.push(h <= 40 ? A(1, h, 0, 0, 'folds') : A(1, h, 0, 0, 'calls', 20));
  }
  const st = calc({ games: [{ uniqueGameID: 1 }], players, hands, actions });

  ok(RECENT_HANDS === 20, 'fenêtre de tendance = 20 mains');
  ok(st.Alice.vpip === 33.3, 'VPIP global lissé (20 mains jouées sur 60)');
  ok(st.Alice.recent.hands === 20, 'la fenêtre retient bien 20 mains');
  ok(st.Alice.recent.vpip === 100, 'VPIP récent isole la bascule de style');
  ok(st.Alice.recent.recent === undefined, "pas d'imbrication récursive de `recent`");
  ok(st.Bob.recent.vpip === st.Bob.vpip, 'joueur stable : récent == global');
}

// ── Seuils de la flèche de tendance ───────────────────────────────────────
{
  const { _trendArrow, _TREND_EPS } = H;
  ok(_trendArrow('vpip', 40, 20) === '↑', 'hausse franche de VPIP → ↑');
  ok(_trendArrow('vpip', 10, 30) === '↓', 'baisse franche de VPIP → ↓');
  ok(_trendArrow('vpip', 24, 20) === '→', 'écart sous le seuil de bruit → →');
  ok(_TREND_EPS.vpip === 8 && _TREND_EPS.af === 0.8, 'seuils de bruit inchangés');
  ok(_trendArrow('af', 'inf', 2) === '' && _trendArrow('af', null, 2) === '',
     'AF infini ou absent : pas de flèche');
}

// ── Portée d'agrégation par joueur ────────────────────────────────────────
{
  const { _refreshScopes, _scopeOf, playerStatsFor } = H;
  window._statsTablePlayers = () => [
    { pid: 1, name: 'Moi', rights: 1, me: true, bot: false },
    { pid: 2, name: 'Invite', rights: 1, me: false, bot: false },
    { pid: 3, name: 'Enregistre', rights: 2, me: false, bot: false },
    { pid: 4, name: 'Admin', rights: 3, me: false, bot: false },
    { pid: 5, name: 'Inconnu', rights: 0, me: false, bot: false },
    { pid: 6, name: 'Bot', rights: 0, me: false, bot: true },
  ];
  _refreshScopes();

  ok(_scopeOf('Invite') === 'session', 'invité → portée session');
  ok(_scopeOf('Enregistre') === 'all', 'joueur enregistré → portée complète');
  ok(_scopeOf('Admin') === 'all', 'admin → portée complète');
  ok(_scopeOf('Moi') === 'all', 'moi-même en invité → portée complète (exemption)');
  ok(_scopeOf('Bot') === 'all', 'bot → portée complète (entraînement offline)');
  ok(_scopeOf('Inconnu') === 'pending', 'droits pas encore reçus → pending, PAS invité');

  // Le popup ne doit rien afficher tant que les droits sont inconnus.
  ok(playerStatsFor('Inconnu') === null, 'pending → aucune stat exposée au popup');
  ok(playerStatsFor('JamaisVu') === null, 'joueur hors table → null');
}


// ── ATS / FTS (vol de blinds) ─────────────────────────────────────────────
{
  // 4 joueurs, sièges 1..4 : BTN=1, SB=2, BB=3, CO=4.
  // Ordre préflop : CO(4) → BTN(1) → SB(2) → BB(3).
  const players = [
    { uniqueGameID: 1, player: 'Btn', seat: 1 },
    { uniqueGameID: 1, player: 'Sb', seat: 2 },
    { uniqueGameID: 1, player: 'Bb', seat: 3 },
    { uniqueGameID: 1, player: 'Co', seat: 4 },
  ];
  const mkHand = (hid) => ({ uniqueGameID: 1, handID: hid,
    dealerSeat: 1, sbSeat: 2, sbAmount: 10, bbSeat: 3, bbAmount: 20,
    Seat_1_Cash: 1000, Seat_2_Cash: 1000, Seat_3_Cash: 1000, Seat_4_Cash: 1000 });
  const hands = [1, 2, 3, 4].map(mkHand);
  const actions = [
    // 1 : CO fold, BTN relance, SB fold, BB fold → vol du BTN réussi.
    A(1, 1, 0, 1, 'starts as dealer'), A(1, 1, 0, 2, 'posts small blind', 10), A(1, 1, 0, 3, 'posts big blind', 20),
    A(1, 1, 0, 4, 'folds'), A(1, 1, 0, 1, 'bets', 60), A(1, 1, 0, 2, 'folds'), A(1, 1, 0, 3, 'folds'),
    A(1, 1, 4, 1, 'wins', 90),
    // 2 : CO limpe puis BTN relance → AUCUNE opportunité de vol pour le BTN,
    //     opportunité SANS tentative pour le CO, aucune défense SB/BB.
    A(1, 2, 0, 1, 'starts as dealer'), A(1, 2, 0, 2, 'posts small blind', 10), A(1, 2, 0, 3, 'posts big blind', 20),
    A(1, 2, 0, 4, 'calls', 20), A(1, 2, 0, 1, 'bets', 80), A(1, 2, 0, 4, 'folds'),
    A(1, 2, 0, 2, 'folds'), A(1, 2, 0, 3, 'folds'), A(1, 2, 4, 1, 'wins', 130),
    // 3 : CO fold, BTN fold, SB relance, BB fold → vol du SB, défense BB.
    A(1, 3, 0, 1, 'starts as dealer'), A(1, 3, 0, 2, 'posts small blind', 10), A(1, 3, 0, 3, 'posts big blind', 20),
    A(1, 3, 0, 4, 'folds'), A(1, 3, 0, 1, 'folds'), A(1, 3, 0, 2, 'bets', 50), A(1, 3, 0, 3, 'folds'),
    A(1, 3, 4, 2, 'wins', 70),
    // 4 : CO fold, BTN relance, SB call → le BB n'a PLUS d'opportunité de
    //     défense (call entre le voleur et lui) ; le SB en a une, non foldée.
    A(1, 4, 0, 1, 'starts as dealer'), A(1, 4, 0, 2, 'posts small blind', 10), A(1, 4, 0, 3, 'posts big blind', 20),
    A(1, 4, 0, 4, 'folds'), A(1, 4, 0, 1, 'bets', 60), A(1, 4, 0, 2, 'calls', 50), A(1, 4, 0, 3, 'folds'),
    A(1, 4, 1, 2, 'checks'), A(1, 4, 1, 1, 'bets', 40), A(1, 4, 1, 2, 'folds'), A(1, 4, 4, 1, 'wins', 160),
  ];
  const st = calc({ players, hands, actions });
  // BTN : opportunités mains 1, 3 (fold alors que tout a foldé devant) et 4
  // (main 2 exclue par le limp) → 2 tentatives / 3 opportunités.
  ok(st.Btn.ats === 66.7, 'ATS Btn = 66.7 (2 tentatives / 3 opportunités, limp exclu)');
  // CO : 3 opportunités (mains 1, 3, 4 fold en premier ; main 2 limp) dont 0 relance.
  ok(st.Co.ats === 0, 'ATS Co = 0 (limp/folds, jamais de relance)');
  // SB : main 3 = opportunité + tentative (folds devant) → 100.
  ok(st.Sb.ats === 100, 'ATS Sb = 100 (open après folds généraux)');
  // FTS : BB défend mains 1 (vs BTN) et 3 (vs SB), fold les deux ; main 4 exclue (call du SB).
  ok(st.Bb.fts === 100 && st.Bb.ats === 0, 'FTS Bb = 100 sur 2 opportunités (main 4 exclue)');
  // SB : défense mains 1 (fold) et 4 (call) → 50.
  ok(st.Sb.fts === 50, 'FTS Sb = 50 (1 fold / 2 opportunités)');
  // Les mains sans dealerSeat/Seat_i_Cash (fixtures précédentes) ne cassent rien :
  ok(st.Btn.hands === 4, 'total_hands intact');
}

// ── Ponts window ──────────────────────────────────────────────────────────
ok(typeof window._playerStatsFor === 'function'
   && typeof window._statsEnsure === 'function'
   && typeof window._statsTrendArrow === 'function', 'ponts window en place');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
