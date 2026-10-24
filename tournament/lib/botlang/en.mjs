// What the director writes in the chat — English, the reference catalogue.
// One file per language of the app, same keys; {x} are filled in. Lines are
// in lowercase on purpose (the server's chat filter mutes text in capitals).
// The server takes at most 128 bytes per line: longer lines are split.
export const strings = {
  welcome: 'welcome {nick}, you are seated ({n} of {of}). the game starts once every registered player is here.',
  notRegistered: 'you are not registered for this tournament: its table is kept for its players.',
  youAdmin: 'you are the table admin now: please start the game when everyone is ready. good luck!',
  newAdmin: '{nick} is now the table admin and starts the game. good luck!',
  waiting: 'the players are waiting: the game starts when you press start.',
  reminder: 'reminder: only the table admin can start the game.',
  started: 'the game has started. the director follows it to the end and records the result. good luck!',
  outOne: '{nick} is out, {n} players left.',
  outMany: '{list} are out, {n} players left.',
  listAnd: '{list} and {last}',
  headsUp: 'heads-up: {a} against {b}.',
  wins: '{nick} wins the tournament. congratulations to all, the result is recorded.',
  winsSecond: '{nick} wins the tournament, {second} second. congratulations to all, the result is recorded.',
  absentMarked: 'you did not join the table in time: you are marked absent for this tournament.',
  closedByOrganizer: 'the organizer closed this table: this game does not count for the tournament.',
  strangerSeated: '{nick} is not registered for this tournament: please remove them before starting.',
  strangersAtStart: 'not registered for this tournament: {list}. an organizer checks this game before it counts.',
};
