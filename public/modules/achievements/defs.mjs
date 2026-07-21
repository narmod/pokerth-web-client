// achievements/defs.mjs
// Catalogue DÉCLARATIF des succès — mode-agnostique (aucune dépendance moteur/UI).
//
// Chaque succès : { id, icon, cat, when, test }
//   when : moment d'évaluation — 'gameStart' | 'handStart' | 'hand' | 'game'
//   test(view) -> bool : débloqué la première fois que test est vrai.
//
// view (fourni par le tracker) :
//   view.counters : { hands, beatenSkills }   (cumul PERSISTANT, à vie)
//   view.game     : { numPlayers, oppSkills, winStreak, allinThisGame,
//                     stackStart, stackMin }  (partie courante)
//   view.hand     : { iWon, viaShowdown, potBb, myCards, wentAllin, bluff } | null
//   view.place    : 1 si j'ai gagné la partie, sinon null
//   view.hour     : heure locale (0–23) au démarrage de la partie
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
  { id: 'table_10',      icon: '👑', cat: CATS.progress, when: 'game',
    test: v => v.place === 1 && v.game.numPlayers >= 10 },

  // — Skill —
  { id: 'streak_3',      icon: '🔥', cat: CATS.skill, when: 'hand',
    test: v => v.game.winStreak >= 3 },
  { id: 'win_no_allin',  icon: '🧊', cat: CATS.skill, when: 'game',
    test: v => v.place === 1 && !v.game.allinThisGame },
  { id: 'nine_hard',     icon: '🏆', cat: CATS.skill, when: 'game',
    test: v => v.place === 1 && allHard(v.game.oppSkills) },
  { id: 'three_schools', icon: '🎓', cat: CATS.skill, when: 'game',
    test: v => hasAllSchools(v.counters.beatenSkills || []) },

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
