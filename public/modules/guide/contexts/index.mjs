// Ace's Help — every context, as plain data (see modules/guide/core.mjs for
// the format). One file per context; the order here breaks priority ties.
import welcome from './welcome.mjs';
import lobbyRanking from './lobby-ranking.mjs';
import lobbyRankingCreate from './lobby-ranking-create.mjs';
import lobbyGuest from './lobby-guest.mjs';
import waitRanking from './wait-ranking.mjs';
import rankedResult from './ranked-result.mjs';
import login from './login.mjs';
import loginProfile from './login-profile.mjs';
import waitNormal from './wait-normal.mjs';

export const CONTEXTS = [rankedResult, lobbyRanking, lobbyRankingCreate, lobbyGuest, waitRanking, waitNormal, login, loginProfile, welcome];
