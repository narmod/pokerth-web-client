// Ace's Help — C4, waiting room of a Normal (or training) table: one bubble,
// by role — the host starts (or fills up with computer players), the others
// wait for the host; everyone can invite friends. Not for spectators, not at
// Ranking tables (C2).
export default {
  id: 'wait-normal',
  priority: 20,
  screens: ['wait'],
  needs: { ranked: false, spectator: false },
  steps: [{
    text: (w) => (w.offline ? 'c4Offline' : w.host ? 'c4Host' : 'c4Guest'),
    target: (w) => (w.host || w.offline
      ? ['#lobby-wait-actions .wp-btn-start', '#lobby-wait-actions']
      : ['#lobby-wait-actions .wp-btn-invite', '#lobby-wait-actions']),
  }],
};
