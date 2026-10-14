// Ace's Help — « Watch this game » (narmod, web.64). Only when the player taps
// a game that is already being played (lobby, not seated anywhere): such a
// game cannot be joined, but it can be watched as a spectator. The first time
// the Ace explains how (select a running game, then the Spectate button below
// the list); once that was answered with « Got it » or « Watch », a short
// « watch it? » only. Never picked by the engine (manual): modules/guide/
// index.mjs::onListTap shows it, once per table and per session, and not
// again this session after « Later ». A cup game (BBC, WEC, Monthly Cup…,
// modules/guide/cup.mjs) gets its own text: the cup admins invite the
// players, but anyone can watch it (web.65).
const spec = () => {
  try { const s = typeof window !== 'undefined' && window.t ? window.t('spectatorBtn') : ''; return s && s !== 'spectatorBtn' ? s : 'Spectate'; } catch (e) { return 'Spectate'; }
};

export default {
  id: 'lobby-watch',
  manual: true,
  screens: ['lobby'],
  when: (w) => !w.offline && !w.gid && !!w.watchGid,
  fold: 25000,
  steps: [{
    text: (w) => (w.cupName ? 'c1WatchCup' : w.watchKnown ? 'c1WatchAgain' : 'c1Watch'),
    vars: (w) => ({ spec: spec(), name: (w && w.cupName) || '' }),
    target: (w) => ['#lobby-foot-spec', '#g-list .game-row[data-gid="' + w.watchGid + '"] .btn-spectate'],
    buttons: ['later', 'gotIt', 'watch'],
  }],
};
