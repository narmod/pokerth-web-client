// Ace's Help — login screen, LAN mode, « 👥 Play nearby » picked in the Server
// list (modules/ui/nearby.mjs, web.351): no Internet, one phone hosts, the
// others join over the same Wi-Fi. Takes the place of the LAN directory tip.
export default {
  id: 'login-nearby',
  priority: 20,
  screens: ['connect'],
  when: (w) => w.loginStep === 2 && !!w.nearbySel,
  steps: [{ text: 'c3Nearby', target: ['#nb-host-btn', '#nb-join-btn'] }],
};
