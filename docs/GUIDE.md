# Ace's Help — contextual assistant

Status: **L6 shipped in `2.1.9-web.264`: C6, the « ? » mode — all planned deliveries are
shipped.** L5 (`web.263`) covered the game creation page and the windows (first
opening). L4 (`web.262`) covered the login screen and the Normal waiting room. L3 (`web.261`) added the statistics, and L2 (`web.260`) made the
assistant public in 83 languages. L1 (the foundation)
shipped in `web.259` behind `?guide=1`. L2 adds the Ranking contexts: C1 in the lobby and
C2 in the waiting room, including the result of the game.

This page is the reference for the feature: what it does, the rules it follows and
the data it keeps, written so the same behaviour can later be brought to the QML
client. The code lives in `public/modules/guide/` (web) and
`public/modules/mascot/guide.mjs` (the docked Ace).

## What it is

The Ace, the mascot of the web client, turns into a guide on demand. Once the
player accepts, a small Ace docks at the bottom right. When there is something useful to
explain where the player is, he opens a bubble. It works on the real app and the real
tables, with no tutorial mode and no fake data.

- **Offered once** on first launch: *"New here? I can show you around as you go."*
  with the buttons *Yes, please* and *No thanks*. After that, the offer never shows again, on any
  device linked to the same account. The help stays off until the player says yes.
- **Turned on and off** from a button on the login screen, an entry in the header menus
  (lobby, create, table, next to *Help*) and *Advanced options → Assistance*.
- **Unobtrusive.** There is no dark overlay. A highlight is a pulsing gold outline. Each
  context is explained once. *Later* folds the bubble into a red badge on the Ace, and
  tapping the Ace shows the tip again. Every tip has *Later* and *Got it*.
- **Silent during a hand.** The Ace speaks on the login screen, in the lobby, in the
  waiting room and in game creation, never at the table while a game runs. He leaves as
  soon as the game starts.
- **Idle scenes belong to Ace's Help** (since `web.265`, the "Animated mascot" option is
  gone). See *Idle scenes* below.
- **Reduced effects / reduced motion**: there is no Ace, only a plain bubble and a small
  static A♠ chip to reopen it.
- **Placement**: he docks at the lowest free spot along the right edge. He never covers
  a button, a link, a field or a clickable row such as *Create a table*, the chat send
  button or the status-bar link.

## Deciding what to say (`modules/guide/core.mjs`)

The decision code has no DOM, no mascot and no storage. The page describes the
situation in a snapshot:

| field | meaning |
|---|---|
| `helpOn` | the player turned the help on |
| `screen` | `connect`, `lobby`, `wait` (seated at a table that has not started, still in the lobby), `create`, `game`, `other` |
| `playing` | a game is running at the table |
| `online` | connected to a server (not the offline training mode) |
| `guest` | logged in as a guest on pokerth.net |
| `ranked` | the table the player sits at is a Ranking game (type 4) |
| `windows` | ids of the windows open right now |

A **context** is plain data:

```js
{
  id: 'lobby-ranking',              // stable key (saved progress, statistics)
  priority: 10,                      // higher speaks first
  screens: ['lobby'],                // where it may speak…
  window: 'ranking-modal',           // …or on the first opening of that window
  needs: { online: true, guest: false },   // exact matches on the snapshot
  when: (where) => true,             // optional extra condition
  manual: false,                     // true: only when asked, never picked
  steps: [{ text: 'key', vars, target: 'css selector', buttons: ['gotIt'] }],
}
```

The rules, in pseudo-code:

```
canSpeak(where) = where.helpOn and not where.playing
                  and where.screen in {connect, lobby, wait, create}

pickContext(where, contexts, seen, snoozed):
  if not canSpeak(where): none
  among contexts that are not manual, that apply to where,
  not seen yet and not put off with "Later" in this session:
    the one with the highest priority (first listed on a tie)

tap on the Ace: the best context that applies here, seen or not;
                if there is none, the menu (turn off / show all tips again)
```

Steps show *Later* plus *Next*, and the last one shows *Got it* instead of *Next*.
*Got it* marks the context as seen. *Later* and Escape put it off until the next session.

## Saved progress (`modules/guide/state.mjs`)

| key | value | how it syncs with the pokerth.net account (`/prefs-web`) |
|---|---|---|
| `pth_guide_on` | `'1'` / `'0'` | like any other web option (`_CFG_WEB_SYNC_KEYS`) |
| `pth_guide_offered` | `'1'` | **merged**: offered on one device means offered everywhere |
| `pth_guide_seen` | `{"r": resetMs, "s": {"<context id>": seenMs}}` | **merged**, see below |

Merging `pth_guide_seen`:

- The latest reset time wins.
- Every tip seen after that reset is kept, from either device, with the earliest time.
- *Show all tips again* stores a new reset time. Every tip seen before it is forgotten on
  every device, and tips seen later survive.

If a device knows more than the account, it pushes its data back. Guests have no
`/prefs-web` channel, so their progress stays on the device.

## The Ranking contexts (L2)

sp0ck's idea (Discord, 29/09) is to get players onto the **same** Ranking table so it
fills up, and to use the waiting time to explain the ranking. These contexts only apply on
pokerth.net (login as an account holder or as a guest), never in LAN or offline mode.

| id | where | what the Ace does |
|---|---|---|
| `lobby-ranking` | lobby, account holder, an open Ranking table exists | highlights the picked table's row. Bubble: *"A ranked game is waiting for you: 7/10 players…"* with the buttons Later, Got it and **Join**. It updates live when the list changes. With no answer after 25 s it folds into the badge |
| `lobby-ranking-create` | lobby, account holder, no open Ranking table | *"No ranked game open right now. Create one — any player with an account can!"* **Create a Ranking table** opens game creation with the Ranking type and the Ranking preset (5/5) selected |
| `lobby-guest` | lobby, guest | a single bubble: Ranking games need a (free) pokerth.net account, and guests play Normal games. **Create an account** is offered, with no highlight and no Join. If the guest taps a Ranking or registered-only table anyway, the bubble comes back |
| `wait-ranking` | seated at a Ranking table that has not started | highlights *x/10*: the notice in the game info panel, or on a phone the row of the table. It then gives one fact every ~20 s: the point scale 15/9/6/4/3/2/1 (40 per table), the Score (an average tempered by regularity), quarterly seasons, why 5/5 (5 s to act, 5 s between hands, 10,000 chips, blinds ×2 every 11 hands, fast and the same for everyone), and where to see the ranking (the trophy button and the podium at the table). Each arrival makes him hop, and at 9/10 he says *"Just one more player!"*. When the game starts he says *"Good luck!"* and leaves |
| `ranked-result` | back in the lobby after a Ranking game (repeats after every game) | *"Game over — you finished in place 4: +4 points. See your ranking?"* If two players went out in the same hand, he gives no place or points and points to the ranking page |

**Which table?** This is `ranking-pick.mjs::pickRankingTable`, and the QML client must use
the same rule so every client points at the same table:

```
candidates = games where type == 4 (Ranking) and mode == 1 (open, not started)
             and players < max and no password
if the player is a guest: none
pick the candidate with the most players; on a tie, the lowest game id (the oldest)
```

**Which place?** This is `ranking-pick.mjs::finishPlace`. The stacks are read at every new
hand and when the end-of-game screen shows.

```
my chips went from > 0 to 0 between two hands:
   if another player also went out between those two hands: place unknown (no guess)
   else: place = players still holding chips + 1
at the end-of-game screen, I hold chips and every other known stack is 0: place 1
points = 15, 9, 6, 4, 3, 2, 1 for places 1 to 7; 0 from 8th
```

The first-launch offer is not made in an automated browser (`navigator.webdriver`), so
other tests' screenshots stay unchanged. `test-guide-browser` opts in with
`pth_guide_webdriver`.

## Login screen and Normal waiting room (L4)

| id | where | what the Ace says |
|---|---|---|
| `login` | login screen, the mode cards (step 1) | two steps. First the three ways to play: Internet (pokerth.net, official rankings), Local / training (bots, even offline), LAN / Dedicated server. Then account versus guest: guests play Normal games only, with no ranked games and no chat. It offers **Create an account** |
| `login-profile` | login screen, the form of the chosen mode (step 2) | the nickname and the avatar: Gallery, Create (which can start from a photo), Import. The avatar is highlighted |
| `wait-normal` | seated at a Normal or training table that has not started, not as a spectator | one bubble that depends on the player's role. **Host**: Start Game, or fill up with computer players, and Invite friends. **Other players**: the host starts the game, and Invite friends. **Training**: Start Game, and the empty seats get bots. It highlights Start (host, training) or Invite |

The bubble normally sits next to the Ace. It moves to the top right, under the header,
when it would hide the element it is talking about or more controls. Parts of the current
screen registered for Escape, such as the login form, do not stop the Ace from speaking.

## Game creation and windows (L5)

`create-game` (screen `create`) explains the four game types. Any player **with an
account** can create a Ranking table: 10 players, no password, and it starts when full.
Cup presets are practice only. Guests and the offline training mode get their own line.

Window contexts (`contexts/windows.mjs`, priority 50) speak the first time each window
opens while the help is on. A window outranks the tip of the screen behind it. Over a
modal or a menu, only a window's own explanation speaks. The dock and the highlight sit
above the windows (z-index 10020 / 10019).

| id | window key | detected by |
|---|---|---|
| `w-profile` | `profile` | `#player-info-modal` visible |
| `w-avatar` | `avatar` | `#avatar-popup` |
| `w-events` | `events` | `#forum-modal` with the `#fn-events` tab shown |
| `w-ranking` | `ranking` | `#ranking-modal` |
| `w-adv` | `adv` | `#adv-modal` (the search box, the *web* tag) |
| `w-theme` | `theme` | `#theme-panel` |
| `w-music` | `music` | `#music-panel` |
| `w-logs` | `logs` | `#jr-modal` |
| `w-players` | `players` | `#players-panel` only as a drawer (fixed or absolute position). On wide screens it is a column of the lobby, not a window |

A window is "open" when it is displayed and inside the viewport. The open windows are
re-read every second.

## « ? » mode (L6)

The « ? » chip at the corner of every tip bubble, and *What's this?* in the Ace's menu,
start the mode. While it is on, the first tap on an element does not act: the element
gets the gold outline and the Ace says what it does. A second tap on the same element
lets it through. The mode ends with *Done*, Escape, a tap on the Ace, the help switched
off, or a hand starting (D8). Screen tips wait while it is on.

The map is `modules/guide/hotspots.mjs`, data only: `HOTSPOTS` is a list of
`[selector, text key, dynamic?]`. The first entry whose selector matches the tapped
element or one of its ancestors wins, so specific entries (a Join button) come before
generic ones (its game row). `dynamic` marks elements drawn by script (game rows,
waiting-room buttons), which the page check skips. A control without an entry (button,
link, field, `[onclick]`…) gets the generic line `askUnknown`; plain text and the Ace's
own dock are never stopped.

Rules:

- Clicks are caught in the capture phase and stopped only for the first tap. The
  explained element stays armed, so a label's own click on its checkbox goes through too.
- A `<select>` is kept closed (`pointerdown`) until it has been explained.
- `body.guide-ask` shows the help cursor.
- To port the mode to QML, keep the same keys and give each control the key of its entry.



`modules/guide/beacons.mjs` posts `POST /__guide { ctx, ev }`. The request carries no
visitor id, no name and no table. Offline, events wait in `localStorage pth_guide_q` (at
most 50) and go out when the network is back. *Do not count my visits* on the admin
side (`pth_no_count`) switches them off.

The proxy only counts the pairs below (`server/guide-stats.js`). Any other pair gets a 400
and creates no key. The counts are stored in `visits.json` under `guide`, with a per-day
series in the visit buckets (`gd`), and share the visit counter's retention and reset.

| ctx | events |
|---|---|
| `offer` | `offered`, `accepted`, `dismissed` |
| `welcome` | `shown`, `done` |
| `lobby-ranking` | `shown`, `done`, `dismissed`, `join`, `started` |
| `lobby-ranking-create` | `shown`, `done`, `dismissed`, `create` |
| `lobby-guest` | `shown`, `done`, `dismissed`, `guest_redirect` |
| `wait-ranking` | `shown`, `done`, `dismissed`, `started` |
| `ranked-result` | `shown`, `done`, `dismissed` |
| `login` | `shown`, `done`, `dismissed`, `signup` |
| `login-profile` | `shown`, `done`, `dismissed` |
| `wait-normal` | `shown`, `done`, `dismissed` |
| `create-game`, `w-…` (10 windows) | `shown`, `done`, `dismissed` |
| `ask` | `shown` (mode entered), `explained` (an element with an entry), `done` (mode left) |

What each event means:

- `shown` is counted once per session per context. For the game result, it is counted
  once per game.
- `done` means *Got it*, the last *Next*, or an action button.
- `dismissed` means *Later*, Escape, a tap on the Ace, or 25 s without an answer.
- `lobby-ranking.started` means the table the player joined from the bubble started. A
  Ranking game only starts with 10/10 players.
- `wait-ranking.started` means a Ranking game started while the help was on.

The admin card is in the *Traffic* tab, under *Ace's Help*, and follows the selected
period. It shows:

- the acceptance of the first-launch offer;
- the **Ranking funnel**: table highlighted → joined from the bubble → game started;
- shown, done and *Later* for each tip;
- guests on their own line.

Because `proxy.js` changed, the container has to be restarted after the deploy.

## Texts (`modules/guide/lang/<code>.mjs`)

The Ace's texts live in their own catalogues, loaded on demand. English (`en.mjs`) is the
reference and its keys are stable. The fallback order is: language, then base language,
then English, then the key. Placeholders are written `{name}`. Only the two labels that
exist before the help is on live in the UI catalogues: `guideBtn` (button and menu entry)
and `advGuide` (the option).

Keys (all 83 languages; `es-419` is derived from `es` with `scripts/es-419-rules.mjs`):
- L1: `name`, `aceLabel`, `offer`, `offerYes`, `offerNo`, `gotIt`, `later`, `next`,
  `close`, `welcome`, `menuOn`, `turnOff`, `resetTips`, `resetDone`, `turnedOff`,
  `nothingHere`.
- L5: `c5Create`, `c5CreateGuest`, `c5CreateOffline`, `c5Ranking`, `c5Events`, `c5Adv`,
  `c5Theme`, `c5Music`, `c5Avatar`, `c5Players`, `c5Profile`, `c5Logs`.
- L6: `askLabel`, `askMenu`, `askIntro`, `askAgain`, `askUnknown`, `askDone`, and one
  `hs…` key per hotspot (47).
- L4: `c3Modes`, `c3Account`, `c3Profile`, `c4Host`, `c4Guest`, `c4Offline`.
- L2: `join`, `createRanking`, `signup`, `seeRanking`, `c1Join` `{n}` `{max}`, `c1None`,
  `c1Guest`, `c2Wait` `{n}` `{max}`, `c2Points`, `c2Score`, `c2Seasons`, `c2Why55`,
  `c2Where`, `oneMore`, `goodLuck`, `c2Result` `{place}` `{points}`, `c2ResultTie`.
  `**…**` marks bold.

The help has an *Ace's Help* section (`start.acehelp`) in all 83 languages.

## More help (`web.267`, H1)

The help window's knowledge now lives in the Ace's bubble. The goal is to merge the help
into Ace's Help, in steps:

1. **H1:** the help in the bubble.
2. **H2:** « ? » everywhere, with *More about it*.
3. **H3:** « ? » at the table.
4. **H4:** the window removed, with the maintainer's agreement.

The texts are the window's own: `modules/help/content/<lang>.mjs`, in 83 languages. No
text was rewritten.

- **Entries.** The Help entries of the header menus (`toggleHelp`) call
  `window._guideMoreHelp` first. The Ace takes over where he can speak: the login screen,
  the lobby, the waiting room and game creation, not under automation. Elsewhere (at a
  table, for now) the window opens as before. *More help* is also the first entry of his
  menu.
- **Tips off.** It works even with the tips off. He comes on demand and leaves when the
  bubble closes, whether by *Close*, Escape or a tap on him. The same goes for « ? » mode
  opened from there.
- **Topics.** The bubble opens on the chapter of the current screen, as the window does
  (`knowledge.mjs::chapterFor`). It shows that chapter's sections, chips for the other
  chapters and a search field. The search is case- and accent-insensitive, starts at 2
  characters and returns at most 40 results. Until H4 it also offered *Help window*.
- **A section, page by page.** One page per paragraph; long paragraphs are cut at
  sentence ends, including the CJK, Indic and Burmese ones. Lists come 5 items to a page,
  keyboard keys 6 to a page, then the notes. The buttons are *Back*, *Next*, *All topics*
  and *Close*. The page count shows in the corner.
- **Statistics.** `more-help` counts `shown`, `section` and `search` (once per opening).
  The admin card rows now show each context's own events. (`window` was counted until H4.)
- **New texts.** `moreHelp`, `allTopics`, `back` (`helpWindow` until H4). The search field and
  *No results* reuse the UI keys `helpSearchPh` and `helpNoResults`.

## « ? » everywhere, *More about it* (`web.268`, H2)

`hotspots.mjs` entries are `[selector, key, dynamic?, more?, vars?]`:

- `more` is a help section (`chapter:section`). The Ace then adds *More about it*
  (`moreAbout`), which leaves « ? » mode and opens that section in his bubble.
- `vars(el)` fills placeholders. An Advanced option says its own name: `{label}` is the
  first text of its row.
- A label is explained as its control, whether through `label[for]` or the control inside
  it (a radio text, a switch track), and the label is highlighted.
- `WINDOWS` covers unlisted controls inside a known window (Advanced options, theme, music,
  ranking, forum, avatar, private messages, logs, player card, help, players). The Ace
  explains the window rather than giving the generic line. Plain text is still never
  stopped.

It lists 110 elements (90 of them with a help section) and 11 windows: the rest of the login screen and the lobby (links, About,
Privacy, the players list actions, send, my card), every field of the creation page, every
close button, Advanced options (categories, sections, each option by its name, keys,
language), ranking, forum, avatar studio, private messages, logs, the player card and
music.

Statistics: `ask.more` counts the taps on *More about it*.

## A tap on the Ace opens his menu (`web.271`)

A tap on the Ace used to replay the tip of the screen, so players who tapped him for his
options got the same tip again and again. Now:

- **A tip is waiting.** If a tip was put off with *Later* (red badge) and still applies
  here, the tap shows that tip.
- **Otherwise** the tap opens his menu: *More help*, « What’s this? », *This screen’s tip*
  (`replayTip`, only when the screen has one), *Turn off*, *Show all tips again*, *Close*.

The texts say where « ? » mode is. `welcome` now explains that tapping him opens the menu
and that the yellow « ? » on his bubbles does the same as « What’s this? ». `menuOn`
explains « What’s this? ». The help section `acehelp` (paragraph 2, 83 languages) lists
the menu, and says he can be asked at the table.

`knowledge.mjs` also cuts sentences at the Urdu ۔ and the Arabic ؟.

## The help window removed (`web.270`, H4)

The Ace is now the only help. The window (`#help-modal`, `modules/help/index.mjs`) is
removed, along with its styles, its precache entry, and its Escape and z-order surfaces.
Its texts (`modules/help/content/<lang>.mjs`) stay: *More help* reads them.

- The 5 Help entries of the header menus call `window.toggleHelp`, which is now in
  `guide/index.mjs`. It opens *More help*, or closes it if it is open. The *Show the Help
  button* option (`pth_help_btn`) is kept.
- On demand (`canComeHere`) also works in the live spectator embed. His own tips stay off
  there (`available()`).
- Removed: the Help window's own tip `w-help`, its « ? » window text, the *Help window*
  button, and the keys `c5Help`, `hsHelpWin` and `helpWindow` in 83 languages. The
  statistics server is unchanged (no restart); the admin card drops the `w-help` row.
- The CSS classes `.help-search`, `.help-body`, `.help-p`, `.help-wip` and `.help-result*`
  stay: the Advanced options search uses them.

## At the table, on demand (`web.269`, H3)

The Ace still never speaks at the table by himself (D8). What the player asks for is
answered there too, even during a hand: *More help* (it opens on *The game screen*), his
menu and « ? » mode. `canComeHere()` covers the login screen, the lobby, the waiting room,
game creation and the table, never the live embed. `evaluate()` keeps the on-demand kinds
(`help`, `ask`, `menu`, `note`) where `canSpeak` would send him away. When the bubble
closes at the table, he leaves.

**His turn comes.** When it becomes the player's turn to act (`myTurn()`: `turnPid ===
myId` and the action buttons shown and enabled), the on-demand bubble folds and « ? » mode
ends, so the buttons are free (`tick`, on the change only). In « ? » mode at his turn, a
tap on an action control (`.act-buttons-row`, `.btn-action`, the bet field, slider, quick
amounts, auto mode) always acts and ends the mode.

**What « ? » explains at the table** (34 texts): the action buttons (Fold, Check / Call,
Raise, All-In, and pre-selection), the bet field, slider and quick amounts, the auto modes,
the seats (yours, the others), the board, the pot, the next blinds, the header buttons
(quit, game details, sound, table ranking), the felt buttons (chat, reactions, hands, info
panel, zoom), the table chat, the reactions and the info panel tabs (log, chances, stats,
export, assistance). Four more windows are covered: the info panel, the table chat, the
reactions and the hand rankings.

**Bubble placement.** Under the header it can now sit on the right, on the left or in the
middle, whichever hides the fewest controls (a wide screen has felt buttons in its
corners). It never goes down over the Ace: a tall bubble scrolls instead.

## Idle scenes (`web.265`)

The scenes of `modules/mascot/engine.mjs` (26 of them, drawn at random) play on the login
screen and in the lobby after **30 s** without a click, tap or key, then at most every
**2 min**. There is no option any more. There are no scenes with reduced effects or
reduced motion, at a table, over a modal, in the live embed, or under automation
(`navigator.webdriver`; tests opt in with `pth_mascot_webdriver`).

**One size.** The docked Ace and the Ace of the scenes share `plan.mjs::mascotScale`:
about 15 % of the short side, 80 to 110 px tall.

**Help off.** He comes in through a door, a puff or the screen edge, as before. Any input
makes him vanish in a puff. Scenes still play in the lobby.

**Help on.** `modules/mascot/index.mjs` asks `window._guideScene` (from `guide/index.mjs`):

- `ready()` is true only when the Ace is docked, not in plain mode, with no bubble, no
  badge and no « ? » mode. The tip comes first.
- The scene starts from his spot (engine entry `home`, no « Hi! »). A spot lifted above a
  control is left with a hop.
- He comes back on foot (`home`, half of the time), through a door that grows under his
  spot (`homeDoor`), or in a puff (`homePoof`). The docked Ace then takes over (`away` /
  `arrive`), with a small pop unless he walked in.
- A tap anywhere while he is out makes him walk straight back in about 1 s
  (`recallHome`), instead of the puff.
- A tip that comes up while he is out calls him back (`window._mascotRecall`), then he
  speaks.
- Lobby reactions (`mascotReact`: new table, private message) play only with the help on.
  He takes a couple of steps out of his spot for them.
- **« Well done! »** (`web.266`, `mascotCheer`) plays when the player comes back to the home
  screen or the lobby after one of these, with the help on and nothing else on screen. It
  plays once, even for several reasons, and is dropped after 10 minutes. The reasons are:
  - a game won, from the end screen (`game/showdown.mjs`);
  - points in a Ranking game, after the result bubble;
  - a trophy unlocked in training (`pth-achievement` event).
  The old trigger, a better LAN rank (`game/stats.mjs`), is gone.

## Tests

- `npm run test:guide-state`: parsing, marking tips seen, resets, the two-device
  merge, and the `pokerth.js` wiring.
- `npm run test:guide-core`: the decision rules (silence during a hand, priorities,
  *Later*, windows), the shipped contexts and the page wiring.
- `npm run test:guide-lang`: catalogue parity (keys and `{placeholders}`) and the two UI keys in
  every language.
- `npm run test:guide-pick`: the table choice, the point scale and the finishing place.
- `npm run test:guide-contexts`: the right context in each situation, no repeats, and the
  guest rules; every text, button and `{placeholder}` resolves.
- `npm run test:guide-admin`: `server/guide-stats.js`, the real `/__guide` route
  (spawned on a scratch file: 204, 400 for unknown pairs, 405, nothing stored), the
  beacons (no identifier, the offline queue) and the admin card.
- `npm run test:guide-ask`: every static hotspot selector exists in the page, every key
  resolves in every language, and the first matching entry wins (jsdom).
- `npm run test:guide-help`: the 83 help corpora cut into pages. It checks that every
  section is reachable, no word is lost and no page is too long, plus the search, the
  chapter of each screen and the wiring.
- `npm run test:mascot`: the scenes' size, the ways back to his spot and the
  loader rules (no option, rhythm, reactions with the help only).
- `npm run test:guide-browser`: a real browser on phones and a desktop. It checks the
  offer, the buttons, the menu, the lobby, that the Ace leaves when a hand starts, that the
  option switches him off, the plain mode, and that the docked Ace hides nothing
  tappable. For L2 it also checks the following:
  - C1: the highlight on the fullest table, the live move to another table, and Join.
  - C2: x/10 is highlighted, the facts, *Good luck!* and his exit.
  - C2.4: the result shows in the lobby.
  - Guests: only the account bubble.
  - The offer appears in French and in Arabic.

## Deliveries

| # | contents |
|---|---|
| L0 | Help sections `ranked` / `cups` / `forumcups` clarified in 83 languages (`web.256`) |
| L1 | The foundation, behind `?guide=1` (`web.259`) |
| L2 | C1 lobby "join a Ranking table" (`pickRankingTable`), C2 ranked waiting room and game result, 83 languages, help section, public (`web.260`) |
| L3 | Admin: `POST /__guide` anonymous counters, and the Ranking funnel card (`web.261`, restart needed) |
| L4 | C3 login screen, C4 normal waiting room (`web.262`) |
| L5 | C5 game creation page and windows (`web.263`) |
| L6 | C6 « ? » mode (`hotspots.mjs`, `web.264`) |
| M1 | Idle scenes folded into Ace's Help: no option, one size, from his spot and back (`web.265`) |
| M2 | « Well done! »: a game won, Ranking points, a trophy (`web.266`) |
| H1 | « More help »: the help window's knowledge in the Ace's bubble, on demand even with the tips off (`web.267`) |
| H2 | « ? » on the windows and the lobby leftovers, *More about it* → the matching help section (`web.268`) |
| H3 | « ? » and « More help » at the table, on demand, even during a hand; folds when the player's turn comes (`web.269`) |
| **H4** | The help window removed (explicit agreement, `web.270`): the Ace is the only help |
