// Ace's Help — C1, no Ranking table open: any player WITH AN ACCOUNT can
// create one; the button opens game creation with the Ranking type and the
// Ranking preset (5/5) already chosen (App.openCreatePage({ ranking: true })).
export default {
  id: 'lobby-ranking-create',
  priority: 29,
  screens: ['lobby'],
  needs: { net: true, guest: false, gamesLoaded: true },
  when: (w) => !w.rankPick,
  live: true,
  fold: 25000,
  steps: [{ text: 'c1None', target: '.lobby-footbar .lfb-create', buttons: ['later', 'gotIt', 'createRanking'] }],
};
