// Ace's Help — C5, windows: one short explanation the first time each
// window is opened while the help is on. `window` is the key computed by
// modules/guide/index.mjs (WINDOWS). A window on top outranks the tips of
// the screen behind it (priority 50).
const W = (id, key, text, target) => ({ id, window: key, priority: 50, steps: [{ text, target }] });

export default [
  W('w-ranking', 'ranking', 'c5Ranking', ['#ranking-modal .rk-tabs']),
  // the Events tab button, not the whole list (a long list overflowed the window, web.289)
  W('w-events', 'events', 'c5Events', ['#fn-tabs .rk-tab[data-tab="events"]']),
  W('w-posts', 'posts', 'c5Posts', ['#fn-list .fn-row', '#fn-tabs .rk-tab[data-tab="posts"]']),
  W('w-adv', 'adv', 'c5Adv', ['#adv-search-in']),
  W('w-theme', 'theme', 'c5Theme', null),
  W('w-music', 'music', 'c5Music', null),
  W('w-avatar', 'avatar', 'c5Avatar', ['#avp-tab-gallery']),
  W('w-players', 'players', 'c5Players', ['#players-search-in']),
  W('w-profile', 'profile', 'c5Profile', null),
  W('w-logs', 'logs', 'c5Logs', null),
];
