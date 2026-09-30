// Ace's Help — every context, as plain data (see modules/guide/core.mjs for
// the format). One file per context; the order here breaks priority ties.
// L1 ships the foundation only; the lobby / waiting-room contexts (C1, C2)
// arrive with L2.
import welcome from './welcome.mjs';

export const CONTEXTS = [welcome];
