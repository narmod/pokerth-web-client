// Ace's Help — login screen, LAN mode, when the site lists LAN servers (the
// LAN directory, modules/ui/lan-directory.mjs): pick a listed server, or
// propose your own. Speaks after the nickname / avatar tip (lower priority).
export default {
  id: 'login-lan',
  priority: 19,
  screens: ['connect'],
  when: (w) => w.loginStep === 2 && !!w.lanDir,
  steps: [{ text: 'c3LanDir', target: ['#lan-dir-sel', '#lan-dir-propose'] }],
};
