# PokerTH LAN Web Accessibility

This context defines the player-facing accessibility language for the PokerTH
browser client used on the private LAN deployment.

## Language

**Player preference**:
An accessibility choice owned by one browser and preserved for that player on that device. It does not change the interface for other players.
_Avoid_: Host setting, server preference

**Interface size**:
The player preference that enlarges readable and actionable information throughout the interface. Critical play information reaches the selected size while spatial scaffolding may adapt instead of scaling uniformly.
_Avoid_: Font size, page zoom

**Standard**:
The 100% interface-size preset.
_Avoid_: Small, normal mode

**Large**:
The 150% interface-size preset.
_Avoid_: Zoomed mode

**Extra Large**:
The 200% interface-size preset.
_Avoid_: Maximum zoom, magnifier mode

**High contrast**:
An independently selectable player preference that increases visual distinction without changing Interface size.
_Avoid_: Low Vision Mode, large mode

**Low-vision accessibility sweep**:
The bounded accessibility effort covering interface size, contrast, non-color cues, visible focus, browser zoom and reflow, and enlarged interaction targets across desktop and mobile web. It does not claim complete WCAG conformance.
_Avoid_: Accessibility compliance, full accessibility audit

**Adaptive play layout**:
The responsive presentation used when screen space cannot preserve the standard table layout at the selected Interface size. It keeps critical play information visible and moves secondary information into accessible drawers.
_Avoid_: Magnified table, scaled canvas

**Critical play information**:
The cards, pot and blinds, current turn, timer, and action controls that remain continuously visible during play.
_Avoid_: Primary content

**High-contrast palette**:
The single tested color presentation activated by High contrast, independent of the player's decorative theme and Interface size.
_Avoid_: High-contrast theme, contrast filter

**Accessibility entry point**:
The control available before login and from every lobby or game header that opens player accessibility preferences.
_Avoid_: Appearance shortcut, zoom button

**Supported web surface**:
Current desktop and mobile browsers plus installed PWA mode, in portrait and landscape orientations.
_Avoid_: Responsive web

**Semantic scaling**:
Interface-size enlargement that changes shared typography, geometry, spacing, and control tokens and permits layout reflow. It is not geometric magnification of a fixed canvas.
_Avoid_: CSS zoom, transform scaling

**Accessibility preference set**:
The browser-local collection containing Interface size and High contrast. It is saved automatically and can travel through the client's configuration export and import without requiring an account.
_Avoid_: Accessibility profile, server accessibility settings

**Accessibility baseline**:
Standard Interface size with High contrast disabled, used only when a browser has no saved Accessibility preference set.
_Avoid_: Default player preference

**Enhanced target**:
An interactive target at least 44 by 44 CSS pixels in Large and Extra Large modes.
_Avoid_: Large button, touch target

**Independent magnification**:
The requirement that Interface size works through 200% and browser zoom works through 200% when tested separately. Combining both beyond that is best-effort.
_Avoid_: Combined 400% support

**Pinch-zoom permission**:
The existing player preference that allows mobile browser pinch magnification. It remains separate from Interface size and is presented through the Accessibility entry point.
_Avoid_: Interface size, browser zoom mode

**Outcome check**:
A focused verification that proves critical information remains readable, visible, and operable in representative play scenarios without coupling the test to internal implementation details.
_Avoid_: Implementation test, exhaustive accessibility test

**Real-device acceptance**:
The player's final usability check on representative desktop and mobile web devices after automated Outcome checks pass.
_Avoid_: Visual QA, WCAG certification
