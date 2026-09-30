// Ace's Help — C3, login screen, first step (the mode cards): the three ways
// to play, then account versus guest (what a guest cannot do, the free
// account). Speaks offline too — this screen is where the player starts.
export default {
  id: 'login',
  priority: 20,
  screens: ['connect'],
  when: (w) => w.loginStep === 1,
  steps: [
    { text: 'c3Modes', target: '#login-step1 .login-cards' },
    { text: 'c3Account', target: '#login-step1 .login-card', buttons: ['later', 'gotIt', 'signup'] },
  ],
};
