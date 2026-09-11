# Low-vision Real-device acceptance

Use this checklist with the low-vision player on the release-candidate commit.
Automation is prerequisite evidence, not a substitute for these checks. Do not
release while a required row is `NOT RUN`, `BLOCKED`, or `FAIL`. Every `FAIL` must
include a defect link or identifier before release.

Allowed status: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`.

## Test record

- Candidate commit:
- Client version:
- Tester:
- Date and timezone:
- Device model:
- OS and version:
- Browser and exact version:
- Mode: browser tab / installed PWA
- Input: mouse / keyboard / touch / assistive technology:
- Evidence location:
- Overall status: `NOT RUN`
- Failed outcome and defect link:
- Notes:

## Required browser and device rows

Record one test record above for each applicable row. Record an unavailable browser
as `BLOCKED` with the reason; do not silently omit it.

| Surface | Required mode | Orientation | Status | Evidence or blocker | Defect if failed |
|---|---|---|---|---|---|
| Chrome desktop | Browser | Landscape window | `NOT RUN` | | |
| Edge desktop | Browser | Landscape window | `NOT RUN` | | |
| Firefox desktop | Browser | Landscape window | `NOT RUN` | | |
| Safari desktop | Browser | Landscape window | `NOT RUN` | | |
| Safari on iPhone/iPad | Browser | Portrait | `NOT RUN` | | |
| Safari on iPhone/iPad | Browser | Landscape | `NOT RUN` | | |
| Safari-installed PWA | Installed PWA | Portrait | `NOT RUN` | | |
| Safari-installed PWA | Installed PWA | Landscape | `NOT RUN` | | |
| Chrome on Android | Browser | Portrait | `NOT RUN` | | |
| Chrome on Android | Browser | Landscape | `NOT RUN` | | |
| Chrome-installed PWA | Installed PWA | Portrait | `NOT RUN` | | |
| Chrome-installed PWA | Installed PWA | Landscape | `NOT RUN` | | |

## Desktop checks

At Standard, Large, and Extra Large on login, populated lobby, and a live active
hand, record each outcome.

| Outcome | Status | Evidence or notes | Defect if failed |
|---|---|---|---|
| Text, labels, player names, chip values, and headings are readable and not clipped | `NOT RUN` | | |
| Controls are visible, comfortably targetable, and operable with pointer and keyboard | `NOT RUN` | | |
| Cards expose unambiguous rank and suit; pot and blinds remain readable | `NOT RUN` | | |
| Current turn and timer remain visible without relying only on color | `NOT RUN` | | |
| Fold, Check/Call, Raise, amount, slider, and All-In remain reachable and operable | `NOT RUN` | | |
| Accessibility, chat, information, hands, and reactions controls/drawers are reachable | `NOT RUN` | | |
| Keyboard focus is visible; drawers return focus to their invoking control | `NOT RUN` | | |
| Switching Interface size and High contrast live preserves connection, game, hand, drafts, and open drawer state | `NOT RUN` | | |
| Interface size and High contrast survive reload and restore through configuration export/import | `NOT RUN` | | |
| Standard at actual 200% browser zoom loses no required content or operation | `NOT RUN` | | |
| Browser zoom remains independent of Interface size and High contrast | `NOT RUN` | | |

## Mobile browser and installed-PWA checks

Run every outcome in portrait and landscape at Extra Large in both the normal
mobile browser and the installed PWA.

| Outcome | Status | Evidence or notes | Defect if failed |
|---|---|---|---|
| Cards, pot, blinds, current turn, timer, and actions remain visible and readable | `NOT RUN` | | |
| Text, controls, cards, timer, and action targets are comfortably usable by the player | `NOT RUN` | | |
| Chat, information/statistics, hands, and reactions drawers open, reflow, and close without covering critical play | `NOT RUN` | | |
| Drawer content and draft text persist; focus returns to the invoking control | `NOT RUN` | | |
| Live Interface-size and High-contrast switching does not reconnect or lose play state | `NOT RUN` | | |
| Rotate portrait to landscape and back without stale, clipped, or overlapping geometry | `NOT RUN` | | |
| Pinch zoom can be enabled and used; disabling it restores the restriction | `NOT RUN` | | |
| Pinch zoom, Interface size, High contrast, and table magnifier remain independent | `NOT RUN` | | |
| Preferences survive closing/reopening the browser or installed PWA | `NOT RUN` | | |

## Release decision

- Required rows completed:
- Failed outcomes have defect records: yes / no / not applicable
- Residual blockers:
- Player accepts candidate: yes / no
- Release decision: `BLOCKED`
