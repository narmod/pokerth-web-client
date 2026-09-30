// Ace's Help — C1 « Join a Ranking table » (sp0ck's idea, Discord 29/09).
// pokerth.net lobby, players with an account only (guests cannot join
// Ranking games). The Ace points at the table picked by
// ranking-pick.mjs::pickRankingTable (the fullest open one, oldest on a
// tie) and offers to join it; the highlight follows the game list live.
export default {
  id: 'lobby-ranking',
  priority: 30,
  screens: ['lobby'],
  needs: { net: true, guest: false },
  when: (w) => !!w.rankPick,
  live: true,
  fold: 25000,
  steps: [{
    text: 'c1Join',
    vars: (w) => ({ n: w.rankPick.players, max: w.rankPick.max }),
    target: (w) => '#g-list .game-row[data-gid="' + w.rankPick.id + '"]',
    buttons: ['later', 'gotIt', 'join'],
  }],
};
