// Ace's Help — C5, the « Create a game » page (first visit while the help is
// on). Since web.287 a guided tour of the form, one field per step, in the
// order of the page (Arnaud: « une note explicative quand on parcourt le
// formulaire, étape par étape ») — the Ace brings each field into view and
// outlines it. web.288: the game style block is presented as quick settings
// (open or folded), and « My prefs » gets its own step. The game type step keeps the C5 rules: who may create a
// Ranking table (any player WITH AN ACCOUNT — never a guest, D16), cup
// presets are practice only. A guest and the offline training mode get their
// own lines; fields that are not on the page (training: name, type,
// password…; the bot level online) are left out. A field greyed out by the
// game type or a community template says so (locked).
const ON = (w) => !w.offline;

export default {
  id: 'create-game',
  priority: 20,
  screens: ['create'],
  tour: true,
  row: '.cf-row',          // outline the whole row of a field, label included
  locked: { sel: '.cf-locked', text: 'cfLocked' },
  steps: [
    { text: (w) => (w.offline ? 'c5CreateOffline' : 'cfIntro') },
    // the game style block = quick settings: open by default in training / LAN, folded on pokerth.net (web.288)
    { text: (w) => (w.styleOpen ? 'cfStyle' : 'cfStyleClosed'), target: ['#cf-style-grid', '.cf-style-label-row'], optional: true },
    // my prefs: the ⭐ pill once saved for this mode, else how to save them
    { text: (w) => (w.prefs ? 'cfPrefs' : 'cfPrefsNone'), target: ['#cf-preset-perso', '.cf-style-label-row'], optional: true },
    { text: (w) => (w.guest ? 'cfNameGuest' : 'cfName'), target: '#cf-name', when: ON, optional: true },
    { text: (w) => (w.guest ? 'c5CreateGuest' : 'c5Create'), target: '#cf-gtype-row', when: ON, optional: true },
    { text: 'cfPassword', target: '#cf-use-password', when: ON, optional: true },
    { text: 'cfSpectators', target: '#cf-allow-spectators', when: ON, optional: true },
    { text: 'cfPlayers', target: '#cf-players', optional: true },
    { text: 'cfStack', target: '#cf-stack', optional: true },
    { text: 'cfBlind', target: '#cf-blind', optional: true },
    { text: 'cfInterval', target: '#cf-raise-every', optional: true },
    { text: 'cfOrder', target: '#cf-mb0', optional: true },
    { text: 'cfTimeout', target: '#cf-timeout', optional: true },
    { text: 'cfDelay', target: '#cf-delay', optional: true },
    { text: 'cfSkill', target: '#cf-skill-row', when: (w) => !!w.offline, optional: true },
    { text: 'cfActions', target: '#create-form .cf-actions', optional: true },
  ],
};
