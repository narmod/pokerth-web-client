// Ace's Help — « Join this table? » (web.67). Only when the player taps an
// open table he can sit at (lobby, not seated, a free seat, no password): a
// Normal game — or registered-only for an account holder — that is not a
// Ranking game and not a cup game. The Ace says plainly that it does not count for the ranking
// (a guest is told it is the kind of game open to guests) and offers Join.
// Shown by modules/guide/index.mjs::onListTap once per table and per
// session, not again this session after « Later ».
export default {
  id: 'lobby-open',
  manual: true,
  screens: ['lobby'],
  when: (w) => !w.offline && !w.gid && !!w.openGid,
  fold: 25000,
  steps: [{
    text: (w) => (w.guest ? 'c1OpenGuest' : 'c1Open'),
    vars: (w) => ({ name: (w && w.openName) || '' }),
    target: (w) => ['#lobby-foot-join', '#g-list .game-row[data-gid="' + w.openGid + '"] .btn-join'],
    buttons: ['later', 'gotIt', 'join'],
  }],
};
