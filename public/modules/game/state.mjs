// ═══════════════════════════════════════════════════════════════════
// État partagé de l'application — chantier ESM #9e (option A).
// Chaque vague migre un domaine de variables de closure de l'IIFE App
// (pokerth.js) vers cet objet : les noms restent STRICTEMENT identiques
// (S.<nom> ⇔ ancien <nom> de closure), les valeurs initiales sont
// recopiées telles quelles. Aucune logique ici : uniquement de l'état.
// Gabarit i18n.mjs : export ES nommé + pont legacy window.*.
// ⚠ Pas de t() ni d'accès DOM au top-level de ce module.
// ═══════════════════════════════════════════════════════════════════

export const S = {
  // ── V0 · Timer de tour (domaine F) ──
  _timerID: null,   // setInterval handle
  _timerSec: 0,     // seconds remaining
  _timerTot: 30,    // total seconds
};

// Pont legacy : pokerth.js (script classique) fait `const S = window.PthState;`
// en tête de l'IIFE App. Aussi pratique pour l'inspection console.
window.PthState = S;
