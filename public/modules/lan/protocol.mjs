// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lan/protocol.mjs — « Play nearby » wire constants
// (web extension, no QML counterpart; narmod 2026-10-31).
// Shared by the host (local-server.mjs) and the guest side (signal.mjs,
// rtc-link.mjs), so a guest never loads the server and its engine.
// ─────────────────────────────────────────────────────────────────────────

/** Wire version of everything « nearby » adds to PokerTH (custom messages, connection codes). */
export const NEARBY_PROTOCOL = 1;

/** Messages of our own, outside PokerTH's type numbering (envelope field = type + 1). */
export const NEARBY_TYPE = Object.freeze({ Scoreboard: 240 });
