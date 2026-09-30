// Ace's Help — C2.4, back in the lobby after a Ranking game: the place and
// the points it earns (15/9/6/4/3/2/1, 0 from 8th), with a shortcut to the
// ranking. Repeats after every ranked game; when two players went out in the
// same hand the order is unknown and the Ace does not guess the points.
import { pointsFor } from '../ranking-pick.mjs';
export default {
  id: 'ranked-result',
  priority: 40,
  repeat: true,
  screens: ['lobby'],
  needs: { net: true },
  when: (w) => !!w.result,
  steps: [{
    text: (w) => (w.result && w.result.place ? 'c2Result' : 'c2ResultTie'),
    vars: (w) => (w.result && w.result.place ? { place: w.result.place, points: pointsFor(w.result.place) } : {}),
    buttons: ['later', 'gotIt', 'seeRanking'],
  }],
};
