/* Live / embedded spectator mode — lobby feed subscription.
 *
 * A client that is watching one table has no use for the lobby feed, and the
 * server offers a way to say so: SubscriptionRequestMessage, unsubscribe (1)
 * on the way in, resubscribe (2) on the way back. The official spectator tool
 * does exactly this. We never sent it, so every embedded viewer kept
 * receiving every update of every table while watching a single hand — cheap
 * for one visitor, not for a front page full of them.
 *
 * Live mode only: a seated player's lobby has filters, a player list and a
 * game-info panel that all read the live feed, and there is no reason to
 * change what they see.
 *
 * On the way back the game list is cleared before resubscribing: while we
 * were away tables were created and closed, and the server replays the list
 * on resubscribe. Keeping the old entries would show tables that no longer
 * exist until each one happened to be updated.
 */
import { S } from '../game/state.mjs';
import { Proto } from '../net/proto.mjs';
import { send } from '../net/session.mjs';

const UNSUBSCRIBE = 1;
const RESUBSCRIBE = 2;

let unsubscribed = false;

function socketOpen() {
  return !!(S.ws && S.ws.readyState === 1);
}

function sendAction(action) {
  // Type 20 -> field 21, one varint field inside (subscriptionAction).
  return send(Proto.encode([[1, 0, 20], [21, 2, Proto.encode([[1, 0, action]])]]));
}

function atTable() {
  const g = document.getElementById('s-game');
  return !!(g && g.classList.contains('active'));
}

function sync() {
  if (!socketOpen()) {
    // A dropped socket resets the server side too: whatever we sent before is
    // forgotten, so the flag must not survive the disconnect.
    unsubscribed = false;
    return;
  }
  const away = atTable();
  if (away && !unsubscribed) {
    if (sendAction(UNSUBSCRIBE)) unsubscribed = true;
    return;
  }
  if (!away && unsubscribed) {
    try { S.games = {}; } catch (e) {}
    if (sendAction(RESUBSCRIBE)) {
      unsubscribed = false;
      try { if (window.renderGames) window.renderGames(); } catch (e) {}
    }
  }
}

export function initLobbySubscription() {
  // The client emits no screen-change event; one check a second is far
  // cheaper than the traffic it saves.
  setInterval(sync, 1000);
  sync();
}

// Exposed for the deterministic test, which drives the transitions directly.
export const _internals = { sync, sendAction, isUnsubscribed: () => unsubscribed };
