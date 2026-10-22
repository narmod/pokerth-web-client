// Ace's Help — the lobby of a LAN / dedicated server (web.272). The
// pokerth.net lobby has its Ranking tips; on a LAN server the Ace said
// nothing. Once: this list is the tables of this server only, join a free
// one or create yours, invite friends with a link — and nothing played here
// counts towards the pokerth.net ranking.
export default {
  id: 'lobby-lan',
  priority: 30,
  screens: ['lobby'],
  needs: { lan: true, gamesLoaded: true },
  fold: 25000,
  steps: [{ text: 'c1Lan', buttons: ['later', 'gotIt'] }],
};
