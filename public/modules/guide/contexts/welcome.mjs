// Ace's Help — context « welcome »: right after the player turns the help on
// (first-launch offer, login button, menu entry or option). Shown on demand
// only (manual), never picked by the engine on its own.
export default {
  id: 'welcome',
  manual: true,
  priority: 0,
  screens: ['connect', 'lobby', 'wait', 'create'],
  steps: [{ text: 'welcome', buttons: ['gotIt'] }],
};
