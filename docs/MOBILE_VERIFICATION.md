# Mobile verification (iOS Safari / Android Chrome)

`scripts/test-mobile-browser.mjs` runs the client in real browser engines with
phone profiles and checks the geometry a player depends on. Run it before every
push that touches the table, the seats, the loupe, the action bar or the CSS.

```sh
npx playwright install chromium webkit   # once per machine
npm run test:mobile                      # all profiles
PTH_MOBILE=ios npm run test:mobile       # iPhone profiles only (WebKit)
PTH_MOBILE=android npm run test:mobile   # Pixel / Galaxy profiles only (Chromium)
PTH_DEVICES="iPhone 15,Pixel 7" npm run test:mobile
PTH_ENGINE=chromium npm run test:mobile  # every profile in one engine (iPhone viewports without WebKit)
PTH_VIEWPORT=734x400 npm run test:mobile # override the viewport of every profile (odd sizes, height thresholds)
```

On GitHub the `Mobile verification` workflow runs the same command on every push
that touches `public/`; failed checks appear as annotations on the run page and
the screenshots are attached as the `mobile-screenshots` artifact.

| Family | Engine | Profiles |
|---|---|---|
| iOS Safari | Playwright WebKit | iPhone SE (3rd gen), iPhone 15, iPhone 15 landscape |
| Android Chrome | Playwright Chromium | Pixel 7, Galaxy S24, Galaxy A55 landscape |

Any other Playwright device name can be passed through `PTH_DEVICES`. An engine
that is not installed is skipped with a notice.

## What is checked, per phone

A 10-seat hand is driven through a fixture WebSocket (flop dealt, my turn) -
deterministic, no bots, no network.

1. Boot without a JavaScript error; no horizontal page overflow.
2. Table: every seat inside the zone; self box centred and clear of the action
   bar; action buttons on screen and finger-sized (36 px, 28 px in the flattened
   landscape row); community cards inside the zone and under no seat.
3. Loupe: button offered; layer at x2; the view follows a side seat; then on
   **my turn the self box is centred and magnified** (the `web.90` regression:
   it landed at `left = W/2 + panX`, off-screen).
4. Mini-board (`web.91`): shown on my turn when the board is out of view,
   inside the zone, clear of the floating buttons and of the self box, mirrors
   the dealt cards (flop, then turn), tap = cards <-> self box; on a wide screen
   it hides once every real card is readable.
5. Loupe off: mini-board hidden and the layout back to the pixel.

Screenshots of every step land in `test-artifacts/mobile/` (git-ignored):
`<device>-1-table`, `-2-loupe-follow`, `-3-loupe-my-turn`, `-4-loupe-board`.
The assertions catch geometry; look at the pictures for everything else.

## Table sweep: every table size, seated and spectator

`npm run test:table-sweep` (`scripts/test-table-sweep.mjs`) opens the table for
**2 to 10 players, seated and as a spectator**, on portrait and landscape phones
(iPhone SE, iPhone 15, iPhone 15 landscape, Pixel 7, Galaxy A55 landscape) with
the full board dealt - 18 configurations per phone, about 10 s each. Per
configuration:

- the expected number of seats is drawn, each box inside the table zone;
- no two player boxes overlap;
- no player box covers a community card or the pot badge, none sits under a
  floating zone button;
- dealer / blind pucks and bet chips stay inside the zone and cover neither
  another player's box nor a community card;
- seated: self box centred and clear of the action bar; spectator: no self
  box, no action button.

A configuration that aborts (navigation, timeout) is retried once; layout findings
never are. On GitHub the failures are grouped in one annotation per phone (GitHub
keeps at most 10 error annotations per step).

Narrow it while working on one case:

```sh
PTH_DEVICES="Pixel 7" PTH_SEATS="4,6" PTH_MODES=seated npm run test:table-sweep
```

Screenshots: `test-artifacts/mobile/<device>-sweep-<mode>-<nn>.png`. Both tests
share `scripts/lib/mobile-harness.mjs` (server, phone profiles, fixture hand,
reporter, screenshots).

## End of hand: showdown, all-in, side pot, next hand

`npm run test:showdown-browser` (`scripts/test-showdown-browser.mjs`) plays the
end of a hand on iPhone 15, iPhone 15 landscape, Pixel 7 and Galaxy A55
landscape - three scenarios, about 35 s per phone:

- **A, classic showdown** (6 players, 3 folded): the winner window fits the
  screen, shows the right name and amounts (`-$20`, never `$-20`), only the
  players who show have face-up cards, Continue is reachable; then on the table:
  winner class and badge, winning-hand badge, revealed cards, card backs for the
  folded players, loser fade, stacks, dead action bar, translated waiting text,
  boxes / badges / board clear of one another; then the **next hand** wipes every
  mark, clears the board, deals my new cards and re-arms the action bar.
- **B, all-in + side pot** (4 players): cards face up before the river with
  nobody marked as winner, then two winners and their stacks.
- **C, no showdown** (5 players, everybody folds): winner marked and paid, no
  opponent card revealed.

## Text overflow in every language

`npm run test:i18n-overflow` (`scripts/test-i18n-overflow.mjs`) switches the
interface through **all the languages** on iPhone SE (375 px), Galaxy S24
(360 px) and iPhone 15 landscape, on five screens: mode picker, login form,
lobby, create table, and the game table on my turn facing a big bet
(`Call $1,500` / `Raise $2,990`, the longest labels). One page per phone, the
language is switched in place: about 4 minutes per phone. Per language:

- **clipped** - a label wider / taller than its box with hidden overflow (an
  ellipsis counts on buttons, tabs and titles, not on secondary descriptions);
- **spills** - text running out of its button;
- **off-screen** - a label partly beyond the screen edge (panes of the lobby
  pager that sit fully off-screen are ignored);
- **overlap** - two controls, or a label and a control it does not belong to,
  on top of each other (wrapped inline links are compared line by line, clipped
  text by what is actually painted);
- **page overflow** - the page scrolls sideways.

A problem present in every language is reported once as `ALL languages`
(structural); the others list their languages and the worst case. A screenshot
is kept per failing language x screen. Narrow it:

```sh
PTH_DEVICES="Galaxy S24" PTH_LANGS="de,fi,ar" PTH_SCREENS="game,login" npm run test:i18n-overflow
```

## PWA and service worker

`npm run test:pwa-browser` (`scripts/test-pwa-browser.mjs`) is the only browser
test that runs WITH the service worker (iPhone 15 + Pixel 7, about 40 s each):

1. the worker installs, activates and controls the next load;
2. the precache is complete **in a real browser**: every `ASSETS` entry of
   `sw.js` is in the `CACHE_VERSION` cache (a 404 there is silent until the day
   someone is offline), `sw.js` and `pokerth.js` agree on the version, no old
   cache is left behind;
3. **origin unreachable** (the test server resets every connection - browser
   offline emulation does not always reach the worker): the app still boots
   from the cache without a JavaScript error, the login screen is complete and
   translated, a training table against the bots opens and deals a hand, no
   image is missing;
4. **update banner**: the `/__ver` deploy stamp changes -> the banner appears on
   top, inside the screen, translated, on at most a couple of lines; dismissing
   it works and it does not come back for the same version;
5. the manifest is valid and every icon exists with the announced size.

Playwright's WebKit build cannot reload a page whose origin is down (internal
engine error, then the browser stays wedged): on the iPhone profile step 3 is
not attempted and Chromium covers it; steps 1, 2, 4 and 5 run on both engines.
Steps 4 and 5 do not need the worker: they run in a second context with service
workers blocked (on Playwright's WebKit a second navigation of a worker-controlled
page crashes the page). Every browser test also has a watchdog (`runPlan(..., hardTimeoutMin)`, 8 min
for this one, 40 by default): a hung browser ends the script with exit code 3.

Not covered (needs a real device): the install prompt itself, the standalone
window, iOS "Add to Home Screen", push / share target.

## Connection loss in the middle of a hand

`npm run test:reconnect-browser` (`scripts/test-reconnect-browser.mjs`) cuts the
fixture socket on iPhone 15, Pixel 7 and Galaxy A55 landscape; the app's timers
are driven with Playwright's clock, so the ~110 s of real back-off take seconds.

- **A, the link comes back at the first retry**: the table stays on screen, a
  translated notice appears on it (inside the screen, countdown, `1/6`, "your
  seat stays reserved"), no socket is opened before the 5 s back-off, then ONE
  retry to the same URL without `fresh=1` (a rebind - a fresh login would kill
  the seat); the hand goes on over the new socket, the notice goes away, the
  action bar is live and the click leaves on the new socket.
- **B, the network stays down**: six attempts with a growing delay and not one
  more (hammering gets the IP blocked), counter `n/6` throughout, then the login
  screen **with** the "Connection lost" window and its translated message.
- **C, leaving on purpose**: no notice, no reconnection attempt.
- **D, the link comes back on my own turn and the server says nothing more**
  (it is waiting for me): the action bar - greyed out and inert while the link
  is down - is live as soon as the retry socket is open, the notice goes away
  within 10 s instead of staying over the cards, and my action is sent.

The fixture socket (`scripts/lib/mobile-harness.mjs`) has `drop()` (the link
dies under the app) and `window.__fxRefuse = true` (every new socket fails).
Not covered: the proxy side of the rebind (session grace, `sid`), and a rejoin
after the grace expired - they need the real proxy.

## Operator notices (broadcasts, restart notice, notice windows)

`npm run test:notices-browser` (`scripts/test-notices-browser.mjs`) shows the
broadcast toast (short and 500-character text, with countdown), the restart
notice together with a broadcast, and the welcome / guest / account / LAN
windows with a 2 500-character text, on iPhone SE, iPhone 15, iPhone 15
landscape and Pixel 7 - each time flat and with the **iPhone safe areas**
emulated (`--pth-sat: 59px`, `--pth-sab: 34px` on `<html>`; the app reads the
real insets through those two custom properties). Per notice: entirely inside
the usable screen (below the status bar, above the home indicator), close
control fully visible, on top, at least 32 x 32 px, and it closes; two notices
at once do not overlap; a window keeps its button on screen whatever the length.

## Limits - what still needs a real phone

Playwright WebKit is the Safari engine, not Safari on an iPhone, and Chromium
with a Galaxy profile is not a Galaxy. Not covered here, to be checked on a real
device before a release: audio (`AudioContext` closed / interrupted on iOS),
the collapsing Safari toolbar and `100vh`, the notch / home-indicator safe area,
the on-screen keyboard over the bet field, PWA install and the service worker,
real touch latency and scrolling inertia.

## Adding a check

Add an `await check('label', async () => { ... })` block in `runDevice()`. Use
`geometry(page)` for rectangles, `turnTo / acted / dealTurn` to move the hand,
and `settle(page)` after anything that re-renders or pans. A good check fails
when the bug is put back: verify that once before relying on it.
