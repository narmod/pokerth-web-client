// Ace's Help — English texts (reference catalogue). Every key here must exist
// in every modules/guide/lang/<code>.mjs, with the same {placeholders}
// (scripts/test-guide-lang.mjs). Keys are stable: statistics and a later QML
// port refer to them (docs/GUIDE.md).
export default {
  name: 'Ace’s Help',
  aceLabel: 'Ace’s Help — tap to see the tip again',
  // first-launch offer (once, D3)
  offer: 'New here? I can show you around as you go.',
  offerYes: 'Yes, please',
  offerNo: 'No thanks',
  // buttons shared by every tip (D7)
  gotIt: 'Got it',
  later: 'Later',
  next: 'Next',
  close: 'Close',
  // turning the help on / off, menu bubble
  welcome: 'Great! I’ll pop up down here whenever there is something useful to explain. Tap me any time to see the tip again.',
  menuOn: 'Ace’s Help is on.',
  turnOff: 'Turn off',
  resetTips: 'Show all tips again',
  resetDone: 'Done — every tip will show again.',
  turnedOff: 'Ace’s Help is off. You can turn it back on from the menu at any time.',
  nothingHere: 'Nothing to explain here for now — carry on!',
  // action buttons
  join: 'Join',
  createRanking: 'Create a Ranking table',
  signup: 'Create an account',
  seeRanking: 'See the ranking',
  // C1 — pokerth.net lobby
  c1Join: 'A ranked game is waiting for you: **{n}/{max}** players. It starts as soon as it’s full!',
  c1None: 'No ranked game open right now. Create one — any player with an account can! It starts by itself as soon as 10 players have joined.',
  c1Guest: 'Ranked games need a (free) pokerth.net account. As a guest you can play Normal games.',
  // C2 — ranked waiting room (one fact every ~20 s)
  c2Wait: 'Ranked game: **{n}/{max}** players. It starts by itself as soon as the table is full — meanwhile, here is how the ranking works.',
  c2Points: 'Each ranked game hands out points by finishing place: **15, 9, 6, 4, 3, 2, 1** from 1st to 7th, nothing from 8th to 10th — 40 points per table.',
  c2Score: 'Your **Score** is not the sum of your points but your average per game, tempered by how many games you have played: playing regularly matters.',
  c2Seasons: 'The ranking runs in **quarterly seasons**: at each new season the counters are archived and start again from zero.',
  c2Why55: 'Why is **5/5** everyone’s favourite? 5 seconds to act, 5 seconds between hands, 10,000 chips and blinds doubling every 11 hands: fast and the same for everyone, so games stay short and comparable.',
  c2Where: 'To see where you stand: the **trophy** button in the lobby — and at the table, the **podium** button shows the season ranking of the players you sit with.',
  oneMore: 'Just one more player!',
  goodLuck: 'Good luck!',
  // C2.4 — back in the lobby after a ranked game
  c2Result: 'Game over — you finished in place **{place}**: **+{points}** points. See your ranking?',
  c2ResultTie: 'Game over! Several players went out in the same hand, so your exact place is on the ranking page. See your ranking?',
  // C3 — login screen
  c3Modes: 'Three ways to play: **Internet** on pokerth.net, with the official rankings; **Local / training** against computer players, even offline; and **LAN / Dedicated server** for a private server.',
  c3Account: 'On Internet, play with your free pokerth.net account — or tick **Guest mode**. Guests can only play Normal games: no ranked games and no chat. An account is free and takes a minute.',
  c3Profile: 'Before you connect, choose your nickname and your avatar: tap the avatar to pick one from the **Gallery**, draw your own in **Create** (it can even start from a photo) or **Import** a picture.',
  // C4 — Normal / training waiting room
  c4Host: 'This table is yours: press **Start Game** when everyone is here — or tick **Fill up with computer players** to fill the empty seats. **Invite friends** sends them a link to this table.',
  c4Guest: 'The host of the table starts the game. Meanwhile, **Invite friends** sends them a link to this table.',
  c4Offline: 'Training table: press **Start Game** — the empty seats are filled with computer players.',
  // C5 — game creation page
  c5Create: 'Four game types: **Normal** (open to all), **Registered players only**, **Invited players only** and **Ranking game**. Any player with an account can create a Ranking table: 10 players, no password, it starts by itself when full. The cup presets (BBC, WeCup…) are for practice only — they don’t create a real cup game.',
  c5CreateGuest: 'As a guest you can create **Normal** games. Ranking tables and registered-only games need a (free) pokerth.net account.',
  c5CreateOffline: 'Training table: choose the number of players, a game style (the pace) and the level of the computer players, then create the table. Nothing here counts towards a ranking.',
  // C5 — windows (first opening)
  c5Ranking: 'The official **PokerTH** ranking and the community ones (**BBC**, **WEC**) in tabs. Search a player, pick a **Season** or **All-Time**, and tap a name to open the profile — tapping its chart switches between bars and pie.',
  c5Events: 'The upcoming cup games. They are created by the cup admins; players register on the cup’s site or in its forum thread — the WEC game at 22:00 (server time) needs no registration. Times are shown in server time and in your local time; tap an event and the button at the bottom follows it.',
  c5Help: 'Everything about the app, chapter by chapter. The search box finds any word in the help.',
  c5Adv: 'Every option, by section. Type in the search box to find one; each switch applies at once. Options marked **web** exist only in this web client.',
  c5Theme: 'The look of the game: palette, table, cards, card back, buttons and pucks, or a ready-made theme. Changes show at once.',
  c5Music: 'The music player: tracks and radio stations. The thumbs up or down on the current track tell the admins what to keep.',
  c5Avatar: 'Your avatar: pick one in the **Gallery**, draw your own in **Create** — it can even start from a photo — or **Import** a picture. On pokerth.net the other players see it too.',
  c5Players: 'Who is online. Search and sort the list; tap a player for the profile, a private message or an invitation to your table.',
  c5Profile: 'A player’s card: profile and statistics. From here you can invite them to your table, or ignore them — their chat messages are hidden, and you can undo it at any time.',
  c5Logs: 'Your logs: every game played on this device is recorded here, with a preview, HTML and text exports and an analysis of your play.',
};
