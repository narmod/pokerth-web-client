# ADR 0001: Low-vision presentation architecture

- Status: Accepted
- Date: 2026-09-10
- Decision owners: PokerTH Web Client maintainers
- Scope: Supported web surface

## Context

Players need readable and operable login, lobby, and active-play surfaces without
coupling a personal accessibility choice to a PokerTH account or game session.
Active play cannot enlarge a fixed table uniformly on constrained screens because
cards, pot, blinds, turn, timer, and actions must remain continuously available.
Decorative themes also cannot supply a bounded, testable contrast guarantee.

## Decision

1. Interface size uses semantic scaling. Standard, Large, and Extra Large set
   shared typography, control, spacing, card, timer, and seat tokens to 1x, 1.5x,
   and 2x. Components reflow; the client does not use CSS `zoom` or a transformed
   fixed canvas.
2. Active play uses an adaptive play layout when the viewport cannot preserve the
   standard table at the selected Interface size. Critical play information stays
   visible. Chat, hand information, hand help, and reactions move to reachable,
   focus-managed drawers.
3. High contrast selects one dedicated, tested palette. It temporarily overrides
   incompatible UI, felt, card, and browser-theme presentation without changing
   the player's saved cosmetic selections; disabling it restores those choices.
4. Interface size, High contrast, browser/pinch zoom permission, and the table
   magnifier are independent controls. Interface size and 200% browser zoom are
   supported independently; combining both beyond 200% is best-effort.
5. The Accessibility preference set is browser-local. It applies on boot and live
   on every surface, travels through existing configuration export/import and
   account web preference sync, and falls back property-by-property when saved
   values are malformed. Unavailable storage falls back to the Accessibility
   baseline and must not block boot.
6. Presentation changes do not recreate the application session, reconnect the
   WebSocket, send gameplay traffic, replace game/hand state, or discard form and
   drawer state. Responsive layout recalculation owns geometry; the accessibility
   module owns preference validation, persistence, document state, and modal focus.

## Alternatives considered

- Uniform CSS `zoom` or `transform`: rejected because it magnifies coordinates and
  clipping rather than allowing semantic reflow and usable controls.
- Scaling the complete poker table: rejected because constrained viewports cannot
  keep critical and secondary information simultaneously visible.
- A high-contrast variant for every decorative theme, or a filter: rejected because
  the combinations are unbounded and filters do not preserve semantic color cues.
- Server- or session-owned preferences: rejected because accessibility choices are
  personal to a browser/device and must work before login and without reconnection.

## Consequences

- New readable or actionable components must consume the shared scale tokens and
  participate in the applicable adaptive layout.
- High-contrast changes are reviewed against one palette, while decorative theme
  growth does not multiply the accessibility test matrix.
- Automated Outcome checks cover representative geometry, state, and operability.
  Actual browser, device, zoom gesture, and installed-PWA usability remain a
  release-blocking Real-device acceptance step.

## References

- [Issue #8](https://github.com/seanpianka/pokerth-web-client/issues/8)
- [WCAG 2.2: Resize Text, Contrast, Focus, and Target Size](https://www.w3.org/TR/WCAG22/)
- [Design tokens](../DESIGN_TOKENS.md)
- [Real-device acceptance checklist](../LOW_VISION_REAL_DEVICE_ACCEPTANCE.md)
