// Ace's Help — C2, seated at a Ranking table that waits for players.
// Highlights the « x/10 » notice, then uses the waiting time: one fact about
// the ranking every ~20 s (auto), until the game starts (then « Good luck! »
// and he leaves — silent during play, D8). Arrivals make him hop, and at
// 9/10 he says « Just one more! » (index.mjs).
const AUTO = 20000;
export default {
  id: 'wait-ranking',
  priority: 30,
  screens: ['wait'],
  needs: { net: true, ranked: true },
  live: true,
  steps: [
    // « x/10 »: the notice of the game info panel, or — on a phone, where that
    // panel is hidden while waiting — the row of my table, or the hint below.
    { text: 'c2Wait', vars: (w) => ({ n: w.waitCount, max: w.waitMax }), auto: AUTO,
      target: (w) => ['#s-lobby .lgi-rankwait', '#g-list .game-row[data-gid="' + w.gid + '"]', '#lobby-wait-actions .lfb-waithint'] },
    { text: 'c2Points', auto: AUTO },
    { text: 'c2Score', auto: AUTO },
    { text: 'c2Seasons', auto: AUTO },
    { text: 'c2Why55', auto: AUTO },
    { text: 'c2Where' },
  ],
};
