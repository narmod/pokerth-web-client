// Ace's Help — C1 for a guest (D16): no highlight, no Join; one bubble that
// points to a free pokerth.net account. Shown once; replayed if the guest
// still taps a Ranking (or registered-only) table.
export default {
  id: 'lobby-guest',
  priority: 30,
  screens: ['lobby'],
  needs: { net: true, guest: true },
  steps: [{ text: 'c1Guest', buttons: ['later', 'gotIt', 'signup'] }],
};
