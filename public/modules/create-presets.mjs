// ═══════════════════════════════════════════════════════════════════
// Create-game settings: the one source for the lists and limits of the
// « Create a table » form (pokerth-client.html, pokerth.js) and of the
// tournament director's table settings (tournament/lib/tournaments.mjs,
// served to its organizer page by /admin/tournaments/table-presets).
// Change a style, a community template or a limit here and both follow.
//
// Pure data, no import: the tournament service imports this file from disk,
// the web client loads it as a module (it also sets window._createPresets).
// scripts/test-create-presets.mjs checks that the form's min/max match LIMITS.
// ═══════════════════════════════════════════════════════════════════

export const CREATE_PRESETS_VERSION = 1;

// Field limits of the form (min, max, step where the form has one). They stay
// inside what the game server accepts (src/net/netpacketvalidator.cpp,
// ValidateGameInfo): a create-game request outside these is refused and the
// server closes the session. Server: players 2–10, raise every 1–1000, delay
// 5–20, time to act ≤ 60, first small blind 1–20000, stack 1–1000000,
// « raise by » ≤ 1000000, manual list ≤ 30 entries of 1–1000000.
export const LIMITS = Object.freeze({
  players:       Object.freeze({ min: 2,    max: 10 }),
  stack:         Object.freeze({ min: 1000, max: 1000000, step: 500 }),
  blind:         Object.freeze({ min: 5,    max: 20000 }),
  raiseEvery:    Object.freeze({ min: 1,    max: 999 }),
  timeout:       Object.freeze({ min: 5,    max: 60 }),
  delay:         Object.freeze({ min: 5,    max: 20 }),
  blindValue:    Object.freeze({ min: 2,    max: 1000000 }),   // one entry of the manual blinds order
  endRaiseValue: Object.freeze({ min: 1,    max: 1000000 }),   // « raise blinds by » after the manual list
  manualBlinds:  Object.freeze({ max: 30 }),                   // entries in the manual list
});

// « Game style » buttons: pace only (never the number of players).
// raiseMode: 1 = hands, 2 = minutes. Names and icons as on the form.
//   Relaxed = deep stack, slow blinds; Normal = PokerTH desktop defaults;
//   Fast = turbo; Ranking = the server's ranking-game constants;
//   We Cup = the official WEC pace; BBC = BBC Step 3 (raise by time).
export const STYLES = Object.freeze([
  { id: 'tranquille', name: 'Relaxed', icon: '🐢', stack: 5000,  blind: 10, timeout: 30, raiseEvery: 15, delay: 10, raiseMode: 1 },
  { id: 'normal',     name: 'Normal',  icon: '⚖️', stack: 3000,  blind: 10, timeout: 20, raiseEvery: 8,  delay: 7,  raiseMode: 1 },
  { id: 'rapide',     name: 'Fast',    icon: '⚡', stack: 1500,  blind: 25, timeout: 7,  raiseEvery: 4,  delay: 5,  raiseMode: 1 },
  { id: 'ranking',    name: 'Ranking', icon: '🏆', stack: 10000, blind: 50, timeout: 5,  raiseEvery: 11, delay: 5,  raiseMode: 1 },
  { id: 'wecup',      name: 'We Cup',  icon: '🏅', stack: 10000, blind: 50, timeout: 12, raiseEvery: 22, delay: 7,  raiseMode: 1 },
  { id: 'bbc',        name: 'BBC',     icon: '⏱️', stack: 5000,  blind: 25, timeout: 10, raiseEvery: 5,  delay: 7,  raiseMode: 2 },
].map(Object.freeze));
export const DEFAULT_STYLE = 'normal';

// Community templates (« Community template », invite-only games; QML
// LobbyCreateGamePage communityPresets). They also serve as a fingerprint to
// recognise a table one did not create (modules/ui/botsuggest.mjs). Every
// template plays with a delay of TEMPLATE_DELAY seconds between hands.
export const TEMPLATE_DELAY = 7;
export const TEMPLATES = [
  { name: 'BBC Step 1', suggestType: 'step1', startCash: 3000, firstSmallBlind: 15,
    raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
    blinds: [20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500,
             600, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000,
             10000, 12000, 15000] },
  { name: 'BBC Step 2', suggestType: 'step2', startCash: 4000, firstSmallBlind: 20,
    raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
    blinds: [25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600,
             800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000,
             12000, 15000, 20000] },
  { name: 'BBC Step 3', suggestType: 'step3', startCash: 5000, firstSmallBlind: 25,
    raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
    blinds: [30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 800,
             1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000,
             12000, 15000, 20000, 25000] },
  { name: 'BBC Step 4', suggestType: 'step4', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
    blinds: [60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1200,
             1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 15000,
             20000, 25000, 30000, 40000, 50000] },
  { name: 'Monthly Cup', titleCommand: 'mcup', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: true, raiseEveryHands: 16, raiseEveryMinutes: 5, playerActionTimeout: 10,
    blinds: [] },
  { name: 'Monthly Cup Final', titleCommand: 'mcupfinal', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: true, raiseEveryHands: 22, raiseEveryMinutes: 5, playerActionTimeout: 12,
    blinds: [] },
  { name: 'WEC', suggestType: 'wec', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: true, raiseEveryHands: 22, raiseEveryMinutes: 5, playerActionTimeout: 12,
    blinds: [] },
  // Added by sp0ck in QML 2.1.4. Official settings of the WeC monthly finals
  // (thread « WEC Monthly and Yearly Grand Finals », still in force for the
  // 2026 finals): 10 000 / SB 50 / 15 s to act / doubled every 25 hands.
  { name: 'WEC Monthly Final', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: true, raiseEveryHands: 25, raiseEveryMinutes: 5, playerActionTimeout: 15,
    blinds: [] },
  { name: 'WEC Grand Final', suggestType: 'wec', startCash: 10000, firstSmallBlind: 50,
    raiseOnHands: true, raiseEveryHands: 35, raiseEveryMinutes: 5, playerActionTimeout: 25,
    blinds: [] },
];

// Everything at once, as the tournament service serves it.
export function createPresets() {
  return { v: CREATE_PRESETS_VERSION, limits: LIMITS, styles: STYLES, defaultStyle: DEFAULT_STYLE, templates: TEMPLATES, templateDelay: TEMPLATE_DELAY };
}

if (typeof window !== 'undefined') {
  window._createPresets = { LIMITS, STYLES, DEFAULT_STYLE, TEMPLATES, TEMPLATE_DELAY,
    style: (id) => STYLES.find((s) => s.id === id) || null };
}
