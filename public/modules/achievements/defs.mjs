// achievements/defs.mjs
// Catalogue DÉCLARATIF des succès — mode-agnostique (aucune dépendance moteur/UI).
//
// Chaque succès : { id, icon, cat, when, test, players? }
//   when    : 'gameStart' | 'handStart' | 'hand' | 'game' | 'always'
//   test(view) -> bool : débloqué la première fois que test est vrai.
//   players : (optionnel) nombre de joueurs requis à afficher sur la tuile.
//
// view (fourni par le tracker) :
//   view.counters : { hands, gamesWon, beatenSkills }   (cumul PERSISTANT, à vie)
//   view.game     : { numPlayers, oppSkills, winStreak, allinThisGame,
//                     stackStart, stackMin, seatsAtHandStart }  (partie courante)
//   view.hand     : { iWon, viaShowdown, potBb, myCards, wentAllin, bluff, foldPreBefore } | null
//   view.place    : 1 si j'ai gagné la partie, sinon null
//   view.hour     : heure locale (0–23) au démarrage de la partie
//   view.unlocked / view.total : progression globale (pour le méta-succès)
//
// Libellés via i18n (ailleurs) : t('ach_'+id) = titre, t('ach_'+id+'_d') = description.

export const CATS = { progress: 'progress', skill: 'skill', style: 'style', fun: 'fun' };

const rank = c => (((c % 13) + 13) % 13);              // 0 = Deux
const isDeucePair = cs =>
  Array.isArray(cs) && cs.length === 2 && rank(cs[0]) === 0 && rank(cs[1]) === 0;
const allHard = skills => skills.length >= 9 && skills.every(s => s === 'hard');
const hasAllSchools = set => ['easy', 'normal', 'hard'].every(s => set.includes(s));

export const ACHIEVEMENTS = [
  // — Progression —
  { id: 'hands_100',     icon: '🃏', cat: CATS.progress, when: 'handStart',
    test: v => v.counters.hands >= 100 },
  { id: 'hands_500',     icon: '🎴', cat: CATS.progress, when: 'handStart',
    test: v => v.counters.hands >= 500 },
  { id: 'hands_1000',    icon: '💎', cat: CATS.progress, when: 'handStart',
    test: v => v.counters.hands >= 1000 },
  { id: 'games_1',       icon: '🎉', cat: CATS.progress, when: 'game',
    test: v => (v.counters.gamesWon || 0) >= 1 },
  { id: 'games_10',      icon: '🏵️', cat: CATS.progress, when: 'game',
    test: v => (v.counters.gamesWon || 0) >= 10 },
  { id: 'games_50',      icon: '🎖️', cat: CATS.progress, when: 'game',
    test: v => (v.counters.gamesWon || 0) >= 50 },
  { id: 'table_10',      icon: '👑', cat: CATS.progress, when: 'game', players: 10,
    test: v => v.place === 1 && v.game.numPlayers >= 10 },
  { id: 'collector',     icon: '🏅', cat: CATS.progress, when: 'always',
    test: v => v.unlocked >= v.total - 1 },

  // — Skill —
  { id: 'streak_3',      icon: '🔥', cat: CATS.skill, when: 'hand',
    test: v => v.game.winStreak >= 3 },
  { id: 'streak_5',      icon: '⚡', cat: CATS.skill, when: 'hand',
    test: v => v.game.winStreak >= 5 },
  { id: 'streak_7',      icon: '🌟', cat: CATS.skill, when: 'hand',
    test: v => v.game.winStreak >= 7 },
  { id: 'win_no_allin',  icon: '🧊', cat: CATS.skill, when: 'game',
    test: v => v.place === 1 && !v.game.allinThisGame },
  { id: 'nine_hard',     icon: '🏆', cat: CATS.skill, when: 'game', players: 10,
    test: v => v.place === 1 && allHard(v.game.oppSkills) },
  { id: 'three_schools', icon: '🎓', cat: CATS.skill, when: 'game',
    test: v => hasAllSchools(v.counters.beatenSkills || []) },
  { id: 'comeback',      icon: '🪃', cat: CATS.skill, when: 'game',
    test: v => v.place === 1 && v.game.stackStart > 0 && v.game.stackMin <= v.game.stackStart * 0.15 },
  { id: 'heads_up',      icon: '🥊', cat: CATS.skill, when: 'game', players: 2,
    test: v => v.place === 1 && v.game.seatsAtHandStart === 2 },
  { id: 'patient',       icon: '🧘', cat: CATS.skill, when: 'hand',
    test: v => v.hand.iWon && (v.hand.foldPreBefore || 0) >= 8 },

  // — Style de jeu —
  { id: 'win_allin',     icon: '💥', cat: CATS.style, when: 'hand',
    test: v => v.hand.iWon && v.hand.wentAllin },
  { id: 'bluff',         icon: '🦊', cat: CATS.style, when: 'hand',
    test: v => v.hand.bluff },

  // — Fun —
  { id: 'pair_of_2',     icon: '🎯', cat: CATS.fun, when: 'hand',
    test: v => v.hand.iWon && isDeucePair(v.hand.myCards) },
  { id: 'after_midnight',icon: '🌙', cat: CATS.fun, when: 'gameStart',
    test: v => v.hour >= 0 && v.hour < 5 },
];
