# Low-vision accessibility verification matrix

This report maps the automated release-candidate evidence for
[Issue #8](https://github.com/seanpianka/pokerth-web-client/issues/8). It keeps
real-browser execution distinct from Playwright engines, responsive emulation,
and manual acceptance.

## Candidate status

- Candidate commit under test: `4810e57a69a2994029a289aa9e66ad4a537ae69e`
  plus the Issue #8 verification commit.
- Automated result date: 2026-09-10.
- Automated Outcome status: passing in bundled Playwright Chromium 141.0.7390.37
  and installed branded Google Chrome 152.0.7977.83.
- Real-device acceptance: pending; no manual row is marked passed.
- Build number: unchanged because Issue #8 changes only tests and documentation,
  neither of which is served or precached.

## Issue #8 Outcome inventory

The named checks are in `scripts/test-accessibility-browser.mjs` unless noted.

| Acceptance outcome | Existing or added evidence |
|---|---|
| Desktop login at Standard, Large, Extra Large | `desktop login remains readable and operable at every Interface size` |
| Desktop populated lobby at all sizes | `desktop lobby...`, `populated lobby names and player counts...`, and operable Join/Spectate checks |
| Desktop active play at all sizes | `desktop active-hand critical information follows every Interface size live`; two- and ten-seat Outcome check |
| Mobile portrait active play at Extra Large | Dense active-hand, drawer reflow, content, and focus checks |
| Mobile landscape active play at Extra Large | Dense ten-seat decision and four-drawer operability checks |
| Standard at 200% browser zoom | A half-size CSS viewport checks the 200%-zoom reflow equivalent; actual browser-chrome zoom remains a Real-device acceptance item |
| Critical information and actions | Geometry, card glyph, pot/blind, current-turn, timer, action target, focus, and production-message assertions |
| Secondary drawers reachable | Portrait/landscape chat, information, hands, and reactions checks |
| Live switching preserves play | Connection count, socket state, outbound traffic, game/hand identity, drafts, selected tab, and drawer state assertions |
| Persistence and safe recovery | Real reload, full export/import, malformed-property recovery, and unavailable-storage checks |
| Installed PWA portrait and landscape | Added standalone-mode approximation exercises Extra Large active play, critical geometry, information drawer, and action in both orientations |
| Interface size, High contrast, pinch/browser zoom independence | Cross-size/viewport palette check plus pinch/table-magnifier round trips |

## Browser and device evidence

| Target requested by Issue #8 | Evidence level | Result |
|---|---|---|
| Desktop Chromium | Playwright-managed Chromium 141.0.7390.37, real engine | 39/39 browser Outcomes pass |
| Desktop Google Chrome | Installed branded browser 152.0.7977.83, real engine | 39/39 browser Outcomes pass; Chrome 153 began stable rollout on 2026-09-08 and is not installed, so current-stable acceptance remains manual |
| Desktop Microsoft Edge | Actual browser | Unavailable: application is not installed |
| Desktop Firefox | Actual browser | Unavailable: application is not installed |
| Desktop Safari | Actual browser | Safari 26.6.2 is installed, but `safaridriver` session creation is blocked because Safari Allow Remote Automation is disabled; not changed by this work |
| Firefox via Playwright | Engine approximation | Unavailable: Playwright Firefox binary is not installed |
| Safari via Playwright WebKit | Engine approximation, not Safari | Unavailable: Playwright WebKit binary is not installed |
| Safari mobile | Actual device/browser | Unavailable; requires Real-device acceptance |
| Chrome mobile | Actual device/browser | Unavailable; requires Real-device acceptance |
| Mobile portrait/landscape | Responsive viewport emulation in desktop Chromium/Chrome | Automated Extra Large active-play Outcomes pass at 390x844 and 844x390; this is not a mobile browser claim |
| Installed PWA | Standalone-presentation approximation | `navigator.standalone` is emulated and service workers are blocked; portrait/landscape Outcomes pass, but actual installation and browser chrome remain manual |
| Browser zoom | CSS viewport equivalence | The 640x450 viewport models a 1280x900 window at 200% for reflow; automation did not change actual browser UI zoom, which remains manual |

Playwright documents the distinction between its Chromium, Firefox, and WebKit
engines, branded Chrome/Edge channels, and emulated mobile devices in its
[browser support guide](https://playwright.dev/docs/browsers). Safari WebDriver
requires the user-controlled Allow Remote Automation setting per
[Apple's WebDriver setup](https://developer.apple.com/documentation/safari-developer-tools/macos-enabling-webdriver).
Google announced the
[Chrome 153 stable rollout](https://developer.chrome.com/blog/chrome-two-week-start)
on 2026-09-08.

### Canonical screenshot ownership

The default `chromium` target captures the two High-contrast screenshots in
memory and pixel-compares them with the committed canonical fixtures. The
mobile capture waits for the randomized `.fly-card` deal sequence to finish;
every screenshot pixel and the separate contrast/operability assertions remain
exact. Alternate
targets such as `PTH_BROWSER=chrome` log that screenshots are omitted and retain
all non-pixel Outcome checks; they never read, write, or update the canonical
fixtures. To accept an intentional visual change, run
`PTH_UPDATE_ACCESSIBILITY_SCREENSHOTS=1 npm run test:accessibility-browser` with
the default Chromium target, review both PNG diffs, then rerun without the update
variable to prove the new fixtures match. The update variable has no effect on
alternate targets.

## Deterministic command record

Fill this table from a clean candidate immediately before handoff. Preserve any
baseline failure separately from Issue #8 results.

| Area | Command | Result |
|---|---|---|
| Accessibility unit | `npm run test:accessibility` | 20/20 pass |
| Accessibility browser, Chromium | `npm run test:accessibility-browser` | 39/39 pass |
| Accessibility locales | `npm run test:accessibility-locales` | 45 catalogues x 7 keys pass |
| Accessibility browser, installed Chrome 152 | `PTH_BROWSER=chrome npm run test:accessibility-browser` | 39/39 pass; current Chrome 153 unavailable locally |
| Layout | `npm run test:layout` | All pass |
| Seats | `npm run test:seats`; `npm run test:seat-render` | All pass; 32/32 pass |
| Actions | `npm run test:action-bar` | 70/70 pass |
| Session | `npm run test:session` | 12/12 pass |
| Configuration | `node scripts/test-cfg-sync-hold.mjs`; `npm run test:state` | All pass; 77/77 pass |
| Theme and palette | `npm run test:accessibility-browser` | 39/39 integrated Outcomes pass |
| Deck | `npm run test:deck` | All pass |
| Navigation | `npm run test:keynav` | 11/11 pass |
| Boot | `npm run test:boot` | 19/19 pass |
| Precache | `npm run test:precache` | 12/12 pass |
| Protobuf build | `npm run build:proto` | Exit 0; current generator rewrote tracked bundles, so the unrelated generated diff was discarded |
| Version consistency | `node scripts/test-build-id.mjs` | All pass; version remains 2.1.8-web.129 |
| Known baseline | `npm run test:table-cards` | Fails unchanged in the fake DOM: `gip.style.setProperty is not a function` in `odds-panel.mjs:175`; not repaired in Issue #8 |
