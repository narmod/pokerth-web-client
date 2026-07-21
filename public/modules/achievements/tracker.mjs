// achievements/tracker.mjs
// Réducteur d'état : consomme le vocabulaire d'events du moteur et maintient S.
// Vocabulaire attendu (identique à OfflineTable.onEvent) :
//   gameStart {players:[{id,name,stack,isBot,skill?}]}
//   handStart {handNum, bb, seats:[{id,stack}], holeByPlayer}
//   actionDone {playerId, action}
//   endOfHandHide {playerId, moneyWon, aggressorId?}      // victoire sans abattage
//   showdown {results:[{playerId, won, cards}]}
//   gameOver {winnerId}
// Les autres events (dealFlop/Turn/River, eliminated, handComplete) sont ignorés.
//
// reduce() renvoie la liste des "moments" déclenchés ('gameStart'|'handStart'|'hand'|'game')
// pour que l'appelant évalue les succès correspondants.

const MIDNIGHT_END_HOUR = 5;   // "après minuit" = [00h, 05h[
const BLUFF_MIN_POT_BB  = 3;   // exclut le walk BB gratuit

export function createSession() {
  return {
    meId: null,
    _hour: 0,
    bb: 0,
    myHole: null,
    myAllinThisHand: false,
    myFoldedPreflopThisHand: false,
    place: null,
    hand: null,
    game: {
      numPlayers: 0, oppSkills: [], winStreak: 0, allinThisGame: false,
      stackStart: 0, stackMin: Infinity, seatsAtHandStart: 0, foldPreStreak: 0,
      style: null, maxBlindLevel: 0,
    },
  };
}

export function reduce(S, ev, meId, store, now, style) {
  if (meId != null) S.meId = meId;
  const me = S.meId;
  if (!ev || !ev.type) return [];

  switch (ev.type) {
    case 'gameStart': {
      const players = ev.players || [];
      const mine = players.find(p => p.id === me);
      S.game = {
        numPlayers: players.length,
        oppSkills: players.filter(p => p.id !== me).map(p => p.skill).filter(Boolean),
        winStreak: 0, allinThisGame: false,
        stackStart: mine ? (mine.stack || 0) : 0,
        stackMin: mine ? (mine.stack || 0) : Infinity,
        seatsAtHandStart: 0, foldPreStreak: 0,
        style: style || null, maxBlindLevel: 0,
      };
      const d = new Date(now());
      S._hour = d.getHours();
      S.place = null; S.hand = null; S.bb = 0; S.myHole = null;
      S.myAllinThisHand = false; S.myFoldedPreflopThisHand = false;
      return ['gameStart'];
    }

    case 'handStart': {
      S.bb = ev.bb || S.bb;
      S.myHole = (ev.holeByPlayer && ev.holeByPlayer[me]) ? ev.holeByPlayer[me].slice() : null;
      S.myAllinThisHand = false;
      S.myFoldedPreflopThisHand = false;
      S.game.seatsAtHandStart = (ev.seats || []).length;
      if (typeof ev.level === 'number' && ev.level > S.game.maxBlindLevel) S.game.maxBlindLevel = ev.level;
      const seat = (ev.seats || []).find(s => s.id === me);
      if (seat && seat.stack < S.game.stackMin) S.game.stackMin = seat.stack;
      store.bump('hands', 1);
      return ['handStart'];
    }

    case 'actionDone': {
      if (ev.playerId === me && ev.action === 'allin') {
        S.myAllinThisHand = true;
        S.game.allinThisGame = true;
      }
      if (ev.playerId === me && ev.action === 'fold' && ev.gameState === 'preflop') {
        S.myFoldedPreflopThisHand = true;
      }
      return [];
    }

    case 'endOfHandHide': {                 // tout le monde s'est couché
      const iWon = ev.playerId === me;
      const potBb = S.bb ? (ev.moneyWon || 0) / S.bb : 0;
      const aggr = ev.aggressorId;          // absent tant que le moteur n'est pas patché
      const bluff = iWon && potBb >= BLUFF_MIN_POT_BB && (aggr == null || aggr === me);
      S.hand = { iWon, viaShowdown: false, potBb, myCards: S.myHole,
                 wentAllin: S.myAllinThisHand, bluff,
                 foldPreBefore: S.game.foldPreStreak };
      if (iWon) S.game.winStreak++;         // un fold ne casse pas la série
      if (S.myFoldedPreflopThisHand && !iWon) S.game.foldPreStreak++;
      else S.game.foldPreStreak = 0;
      return ['hand'];
    }

    case 'showdown': {
      const mine = (ev.results || []).find(r => r.playerId === me);
      const iWon = !!(mine && mine.won > 0);
      S.hand = {
        iWon, viaShowdown: true,
        potBb: S.bb && mine ? (mine.won || 0) / S.bb : 0,
        myCards: mine ? mine.cards.slice() : S.myHole,
        wentAllin: S.myAllinThisHand, bluff: false,
        foldPreBefore: S.game.foldPreStreak,
      };
      if (iWon) S.game.winStreak++;
      else if (mine) S.game.winStreak = 0;  // abattage disputé et perdu → série cassée
      if (S.myFoldedPreflopThisHand && !iWon) S.game.foldPreStreak++;
      else S.game.foldPreStreak = 0;
      return ['hand'];
    }

    case 'gameOver': {
      S.place = ev.winnerId === me ? 1 : null;
      if (S.place === 1) store.bump('gamesWon', 1);
      if (S.place === 1 && S.game.style) {
        const pv = store.get('wonStyles') || [];
        store.set('wonStyles', [...new Set([...pv, S.game.style])]);
      }
      if (S.place === 1 && S.game.oppSkills.length) {
        const prev = store.get('beatenSkills') || [];
        store.set('beatenSkills', [...new Set([...prev, ...S.game.oppSkills])]);
      }
      return ['game'];
    }

    default:
      return [];
  }
}
