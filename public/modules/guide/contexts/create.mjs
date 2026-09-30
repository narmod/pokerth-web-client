// Ace's Help — C5, the « Create a game » page (first visit while the help is
// on): the four game types and who may create a Ranking table (any player
// WITH AN ACCOUNT — never a guest, D16), cup presets are practice only.
// A guest and the offline training mode get their own line.
export default {
  id: 'create-game',
  priority: 20,
  screens: ['create'],
  steps: [{
    text: (w) => (w.offline ? 'c5CreateOffline' : w.guest ? 'c5CreateGuest' : 'c5Create'),
    target: (w) => (w.offline ? ['#cf-style-grid', '.cf-preset[data-preset]'] : ['#cf-gtype-row']),
  }],
};
