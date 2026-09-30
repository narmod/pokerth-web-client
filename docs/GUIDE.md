# Ace's Help — contextual assistant

Status: **L4 shipped in `2.1.9-web.262`: C3 on the login screen and C4 in the Normal /
training waiting room.** L3 (`web.261`) added the statistics, and L2 (`web.260`) made the
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
- **Separate from "Animated mascot"**, which only plays idle scenes. Those scenes wait
  while the Ace is helping.
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

## Statistics (L3)

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
- L4: `c3Modes`, `c3Account`, `c3Profile`, `c4Host`, `c4Guest`, `c4Offline`.
- L2: `join`, `createRanking`, `signup`, `seeRanking`, `c1Join` `{n}` `{max}`, `c1None`,
  `c1Guest`, `c2Wait` `{n}` `{max}`, `c2Points`, `c2Score`, `c2Seasons`, `c2Why55`,
  `c2Where`, `oneMore`, `goodLuck`, `c2Result` `{place}` `{points}`, `c2ResultTie`.
  `**…**` marks bold.

The help has an *Ace's Help* section (`start.acehelp`) in all 83 languages.

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
| **L4** | C3 login screen, C4 normal waiting room (`web.262`) |
| L5 | C5 windows |
| L6 | C6 "?" mode (`hotspots.mjs`) |
