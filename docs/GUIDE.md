# Ace's Help — contextual assistant

Status: **L1 (foundation) shipped in `2.1.9-web.259`, hidden behind `?guide=1`.**
The contexts that explain Ranking games (C1 lobby, C2 waiting room) come with L2.

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

## Texts (`modules/guide/lang/<code>.mjs`)

The Ace's texts live in their own catalogues, loaded on demand. English (`en.mjs`) is the
reference and its keys are stable. The fallback order is: language, then base language,
then English, then the key. Placeholders are written `{name}`. Only the two labels that
exist before the help is on live in the UI catalogues: `guideBtn` (button and menu entry)
and `advGuide` (the option).

L1 keys: `name`, `aceLabel`, `offer`, `offerYes`, `offerNo`, `gotIt`, `later`, `next`,
`close`, `welcome`, `menuOn`, `turnOff`, `resetTips`, `resetDone`, `turnedOff`,
`nothingHere`.

## Tests

- `npm run test:guide-state`: parsing, marking tips seen, resets, the two-device
  merge, and the `pokerth.js` wiring.
- `npm run test:guide-core`: the decision rules (silence during a hand, priorities,
  *Later*, windows), the shipped contexts and the page wiring.
- `npm run test:guide-lang`: catalogue parity (keys and `{placeholders}`) and the two UI keys in
  every language.
- `npm run test:guide-browser`: a real browser on phones and a desktop. It checks the
  offer, the buttons, the menu, the lobby, that the Ace leaves when a hand starts, that the
  option switches him off, the plain mode, and that the docked Ace hides nothing
  tappable.

## Deliveries

| # | contents |
|---|---|
| L0 | Help sections `ranked` / `cups` / `forumcups` clarified in 83 languages (`web.256`) |
| **L1** | This foundation, behind `?guide=1` (`web.259`) |
| L2 | C1 lobby "join a Ranking table" (`pickRankingTable`) and C2 ranked waiting room, 83 languages, public |
| L3 | Admin: `POST /__guide` anonymous counters, and the Ranking funnel card |
| L4 | C3 login screen, C4 normal waiting room |
| L5 | C5 windows |
| L6 | C6 "?" mode (`hotspots.mjs`) |
