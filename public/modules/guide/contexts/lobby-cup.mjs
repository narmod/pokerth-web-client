// Ace's Help — a cup game that has not started (web.65). Only when the player
// taps it in the lobby list (manual): a BBC, WEC, Monthly Cup… table
// (modules/guide/cup.mjs) cannot be joined by a tap — the cup admins invite
// the players registered for it. The Ace says so and offers the Events
// window (next cup games, how to register). Shown by modules/guide/
// index.mjs::onListTap once per table and per session, not again after
// « Later ». A running cup game is lobby-watch (with its cup text).
export default {
  id: 'lobby-cup',
  manual: true,
  screens: ['lobby'],
  when: (w) => !w.offline && !!w.net && !w.gid && !!w.cupName,   // cups are pokerth.net's (web.272)
  fold: 25000,
  steps: [{
    text: 'c1Cup',
    vars: (w) => ({ name: (w && w.cupName) || '' }),
    buttons: ['later', 'gotIt', 'seeEvents'],
  }],
};
