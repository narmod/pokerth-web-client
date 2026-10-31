// Ace's Help — the lobby of a « Play nearby » game (modules/ui/nearby.mjs,
// web.351), in place of the LAN lobby tip: the host adds each friend with a
// QR code and must keep the app open; a guest is told the scoreboard button.
export const lobbyNearbyHost = {
  id: 'lobby-nearby-host',
  priority: 31,
  screens: ['lobby'],
  needs: { nearby: true, nearbyHost: true, gamesLoaded: true },
  fold: 25000,
  steps: [{ text: 'c1NearbyHost', target: '#nb-add-btn', buttons: ['later', 'gotIt'] }],
};
export const lobbyNearbyGuest = {
  id: 'lobby-nearby-guest',
  priority: 31,
  screens: ['lobby'],
  needs: { nearby: true, nearbyHost: false, gamesLoaded: true },
  fold: 25000,
  steps: [{ text: 'c1NearbyGuest', target: '#nb-board-btn', buttons: ['later', 'gotIt'] }],
};
