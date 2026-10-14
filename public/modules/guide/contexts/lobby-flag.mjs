// Ace's Help — « No flag next to your name? » (web.66). Lobby, pokerth.net
// account holder whose own player info came back without a country: the flag
// is the Country of the pokerth.net account (User Control Panel → Profile →
// Edit profile → Country → Submit), shown from the next login. Said once,
// after the Ranking tips (lower priority). « Edit my profile » opens that
// page of the site. Guests have no flag: nothing for them.
export default {
  id: 'lobby-flag',
  priority: 10,
  screens: ['lobby'],
  needs: { net: true, guest: false },
  when: (w) => !!w.noFlag && !!w.gamesLoaded,
  fold: 25000,
  steps: [{ text: 'c1Flag', buttons: ['later', 'gotIt', 'editProfile'] }],
};
