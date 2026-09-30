// Ace's Help — C3, login screen, second step (the form of the chosen mode):
// nickname and avatar — Gallery, Create (also from a photo), Import.
export default {
  id: 'login-profile',
  priority: 20,
  screens: ['connect'],
  when: (w) => w.loginStep === 2,
  steps: [{ text: 'c3Profile', target: ['#av-trigger', '#nick'] }],
};
