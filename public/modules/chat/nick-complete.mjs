// Tab nickname completion — ranking of the candidates.
//
// The QML ChatBox (StaticData.nickComplete) keeps the nicknames in list order,
// i.e. the order players arrived in. A prefix that is a whole nickname could
// therefore complete to a longer one first: « noob » + Tab gave « noobass »
// when that player had connected earlier (reported in the lobby chat,
// 2026-11-21 and 2026-11-24). Ranking, Tab still cycling through every match:
//   1. the nickname equal to the typed word (case ignored);
//   2. the players who spoke last in this chat, most recent first;
//   3. everybody else, in the original list order;
//   4. my own nickname, last — it is rarely the one I mean to write.
// Pure function plus a DOM reader; pokerth.js keeps the old order if this
// module is not loaded.

// Distinct names of the latest speakers in a chat container, most recent first.
// Reads the .who spans the chat renders (plain lines and /me lines alike).
function recentSpeakers(container, max) {
  var out = [];
  if (!container || typeof container.querySelectorAll !== 'function') return out;
  var cap = max || 50;
  var seen = {};
  try {
    var whos = container.querySelectorAll('.msg .who');
    for (var i = whos.length - 1; i >= 0 && out.length < cap; i--) {
      var n = String(whos[i].textContent || '').trim();
      var k = n.toLowerCase();
      if (!n || seen[k]) continue;
      seen[k] = 1;
      out.push(n);
    }
  } catch (e) {}
  return out;
}

// Nicknames starting with `prefix` (case ignored), deduplicated, ranked as
// described above. `recent` = names, most recent first; `self` = my nickname.
function rankNickMatches(prefix, nicks, recent, self) {
  var p = String(prefix || '').toLowerCase();
  if (!p) return [];
  var me = String(self || '').toLowerCase();
  var rec = {};
  (recent || []).forEach(function (n, i) {
    var k = String(n || '').toLowerCase();
    if (k && !(k in rec)) rec[k] = i;
  });
  var seen = {};
  var list = [];
  (nicks || []).forEach(function (n, i) {
    if (!n) return;
    var k = String(n).toLowerCase();
    if (seen[k] || k.indexOf(p) !== 0) return;
    seen[k] = 1;
    list.push({
      n: String(n),
      exact: k === p ? 0 : 1,
      self: (me && k === me) ? 1 : 0,
      rec: (k in rec) ? rec[k] : Infinity,
      i: i
    });
  });
  list.sort(function (a, b) {
    return (a.exact - b.exact) || (a.self - b.self) ||
      (a.rec === b.rec ? 0 : (a.rec < b.rec ? -1 : 1)) || (a.i - b.i);
  });
  return list.map(function (x) { return x.n; });
}

export { rankNickMatches, recentSpeakers };
if (typeof window !== 'undefined') {
  window._rankNickMatches = rankNickMatches;
  window._recentChatSpeakers = recentSpeakers;
}
