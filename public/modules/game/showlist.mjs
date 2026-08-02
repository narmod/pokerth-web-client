// ═══════════════════════════════════════════════════════════════════
// determinePlayerNeedToShowCards — 1:1 port of the official engine
// (src/engine/local_engine/localboard.cpp, LocalBoard::
// determinePlayerNeedToShowCards) as it is re-run client-side by the
// QML/Widgets clients in ClientState on EndOfHandShowCards.
//
// Poker showdown rule implemented by PokerTH:
//   · all-in condition  -> every player still in the hand shows.
//   · otherwise         -> the last aggressor shows first, then each
//     following player (clockwise) only shows if he can BEAT what is
//     already on the table, or ties it while having put in more money.
//     Everybody else may muck.
//
// The web client needs this list for two reasons: to know whether the
// local player is REQUIRED to show (in which case the voluntary
// "Show" button must not appear — GameHandler::onShowdown), and to
// know which opponents actually expose their cards.
//
// The function is deliberately pure: no S, no DOM, no i18n. See
// buildShowCtx() for the glue with the live game state and
// scripts/test-showlist.mjs for the fixtures.
// ═══════════════════════════════════════════════════════════════════
import { S } from './state.mjs';

// ctx = {
//   order:         [pid, …]  activePlayerList order (seat order, cyclic)
//   folded:        Set(pid)  players who folded during the hand
//   cardsValue:    { pid: int }  PlayerResult.cardsValue (field 7)
//   invested:      { pid: int }  roundStartCash - cash, i.e. what the
//                                player put in during the whole hand
//   allInCondition: bool     AllInShowCards was received for this hand
//   lastActionPid:  pid      last aggressor (see trackLastActionPid)
// }
function determineShowList(ctx) {
  const order = (ctx && ctx.order) || [];
  const out   = [];
  if (!order.length) return out;

  const folded    = ctx.folded || new Set();
  const notFolded = function (pid) { return !folded.has(pid); };
  const cv        = function (pid) { return (ctx.cardsValue && ctx.cardsValue[pid]) || 0; };
  const inv       = function (pid) { return (ctx.invested   && ctx.invested[pid])   || 0; };

  // « in All In Condition everybody have to show the cards »
  if (ctx.allInCondition) {
    for (const pid of order) if (notFolded(pid)) out.push(pid);
    return _sortUnique(out);
  }

  // The player who made the last action has to show his cards first. If he
  // folded (or is unknown), fall back to the first non-folded player of the
  // list, exactly like the C++ loop does.
  let start = -1;
  for (let i = 0; i < order.length; i++) {
    if (order[i] === ctx.lastActionPid && notFolded(order[i])) { start = i; break; }
  }
  if (start < 0) {
    for (let i = 0; i < order.length; i++) if (notFolded(order[i])) { start = i; break; }
  }
  if (start < 0) return out;

  const first = order[start];
  out.push(first);

  // level = ordered list of [cardsValue, invested] "levels" already beaten.
  const level = [[cv(first), inv(first)]];

  let i = start + 1;
  for (let k = 0; k < order.length; k++) {
    if (i >= order.length) i = 0;
    const pid = order[i];
    if (notFolded(pid)) {
      for (let li = 0; li < level.length; li++) {
        const L = level[li];
        if (cv(pid) > L[0]) {
          // Better hand: only shows once it beats the TOP level. If a higher
          // level still exists we keep walking the list (no break in C++).
          if (li + 1 >= level.length) {
            out.push(pid);
            level.push([cv(pid), inv(pid)]);
            break;
          }
        } else if (cv(pid) === L[0]) {
          // Same hand value: shows if it is the top level, or if he put in
          // more money than the next level up (split-pot bookkeeping).
          if (li + 1 >= level.length || inv(pid) > level[li + 1][1]) {
            out.push(pid);
            if (inv(pid) > L[1]) L[1] = inv(pid);
          }
          break;
        } else {
          // Worse hand: shows only if he had invested more than this level
          // (he cannot win, but he paid to see it).
          if (inv(pid) > L[1]) {
            out.push(pid);
            level.splice(li, 0, [cv(pid), inv(pid)]);
            break;
          }
        }
      }
    }
    i++;
  }
  return _sortUnique(out);
}

function _sortUnique(a) {
  const s = a.slice().sort(function (x, y) { return x - y; });
  const r = [];
  for (const v of s) if (!r.length || r[r.length - 1] !== v) r.push(v);
  return r;
}

// activePlayerList order: seats still in the GAME (not busted, not gone),
// in seat order. Only the cyclic order matters to determineShowList().
function activeOrder() {
  const out = [];
  for (const pid of (S.seats || [])) {
    const sd = S.seatData[pid];
    if (!sd || sd.gone) continue;
    if (sd.active === false) continue;
    out.push(pid);
  }
  return out;
}

// lastActionPlayerID at hand start (LocalHand::LocalHand): "first player
// after dealer have to show his cards first (in showdown)".
function firstAfterDealer() {
  const order = activeOrder();
  if (!order.length) return 0;
  const d = order.indexOf(S.dealerPid);
  if (d < 0) return order[0];
  return order[(d + 1) % order.length];
}

// PlayersActionDone -> lastActionPlayerID, byte-for-byte the ClientState
// logic (clientstate.cpp, "Track lastActionPlayerID for showdown card
// reveal logic"). NOTE: the all-in branch compares the player's set with
// the highestSet that was JUST taken from the very same message, so it can
// never be true on a network client. This is reproduced as-is on purpose —
// diverging here would hand web players a different showdown from the one
// the QML players see at the same table.
function trackLastActionPid(pid, action, totalBet, newHighestSet) {
  if (action === 4 || action === 5) S._lastActionPid = pid;
  else if (action === 6 && totalBet > newHighestSet) S._lastActionPid = pid;
}

// Builds the ctx for the current hand from the EndOfHandShowCards results.
// results: [{ pid, cardsValue, playerMoney }]
function buildShowCtx(results) {
  const folded     = new Set();
  const cardsValue = {};
  const invested   = {};
  for (const pid of (S.seats || [])) {
    const sd = S.seatData[pid];
    if (sd && sd.folded) folded.add(pid);
  }
  for (const r of results) {
    cardsValue[r.pid] = r.cardsValue || 0;
    const sd = S.seatData[r.pid];
    // getMyRoundStartCash() - getMyCash(); the official client also runs this
    // AFTER the pot has been credited, so a winner's value can go negative.
    const start = (sd && sd.handStartMoney != null) ? sd.handStartMoney : null;
    invested[r.pid] = (start != null) ? (start - (r.playerMoney || 0)) : 0;
  }
  return {
    order: activeOrder(),
    folded: folded,
    cardsValue: cardsValue,
    invested: invested,
    allInCondition: !!S._allInCondition,
    lastActionPid: S._lastActionPid || 0
  };
}

export { determineShowList, buildShowCtx, activeOrder, firstAfterDealer, trackLastActionPid };

for (const [k, v] of Object.entries({ determineShowList, buildShowCtx,
  activeOrder, firstAfterDealer, trackLastActionPid })) window[k] = v;
