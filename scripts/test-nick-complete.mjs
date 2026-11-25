// Deterministic tests for Tab nickname completion ranking
// (public/modules/chat/nick-complete.mjs). Run: node scripts/test-nick-complete.mjs
globalThis.window = {};
const { rankNickMatches, recentSpeakers } = await import('../public/modules/chat/nick-complete.mjs');

let fails = 0;
function eq(a, b, label) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (!ok) { console.error('FAIL ' + label + '  got ' + JSON.stringify(a)); fails++; }
  else console.log('ok   ' + label);
}

// The case from the lobby chat: « noobass » arrived before « noob ».
eq(rankNickMatches('noob', ['noobass', 'xTriXplEx', 'noob'], [], 'xTriXplEx'),
  ['noob', 'noobass'], 'exact nickname first');
eq(rankNickMatches('NOOB', ['noobass', 'noob'], [], ''), ['noob', 'noobass'], 'exact match ignores case');
eq(rankNickMatches('no', ['noobass', 'noob'], ['noob'], ''), ['noob', 'noobass'], 'latest speaker before list order');
eq(rankNickMatches('no', ['noobass', 'noob'], ['noobass', 'noob'], ''), ['noobass', 'noob'], 'most recent speaker first');
eq(rankNickMatches('no', ['noobass', 'noob'], [], ''), ['noobass', 'noob'], 'no speaker known: original order kept');
eq(rankNickMatches('no', ['noob', 'nora'], ['nora'], 'noob'), ['nora', 'noob'], 'own nickname last');
eq(rankNickMatches('noob', ['noobass', 'noob'], [], 'noob'), ['noob', 'noobass'], 'own exact nickname still first');
eq(rankNickMatches('red', ['Red Gremlin', 'red gremlin', 'Ruka_88'], [], ''), ['Red Gremlin'], 'duplicates (case) dropped');
eq(rankNickMatches('zz', ['noob'], [], ''), [], 'no match');
eq(rankNickMatches('', ['noob'], [], ''), [], 'empty prefix');
eq(rankNickMatches('a', ['', null, 'ab'], null, null), ['ab'], 'empty entries and null args tolerated');

// recentSpeakers: reads .who spans bottom-up, distinct, capped.
function fakeChat(names) {
  return { querySelectorAll: () => names.map((n) => ({ textContent: n })) };
}
eq(recentSpeakers(fakeChat(['noobass', 'noob', 'il Buono', 'noob'])), ['noob', 'il Buono', 'noobass'], 'speakers most recent first, distinct');
eq(recentSpeakers(fakeChat(['a', 'b', 'c']), 2), ['c', 'b'], 'cap respected');
eq(recentSpeakers(null), [], 'no container');

if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('all nick-complete tests passed');
