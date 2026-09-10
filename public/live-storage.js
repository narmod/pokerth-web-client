/* Live / embedded spectator mode — storage isolation.
 *
 * /live is served from the same origin as the web client, so it shares one
 * localStorage with it. That is wrong on both sides: a spectator would inherit
 * the player's theme, nickname and settings, and — worse — watching a table on
 * the site would write into the account the player uses to sit at one.
 *
 * The browser gives us no way to be a different origin here, so every key is
 * namespaced instead: to the page, /live has its own empty store, and nothing
 * it writes is visible to the client at /.
 *
 * This must run BEFORE any client code, hence a classic blocking script in
 * <head> rather than a module: proxy.js injects it for /live only, so the
 * ordinary client pays nothing, not even a request.
 */
(function () {
  if (!window.LIVE_MODE) return;

  var PREFIX = 'live:';

  function shim(real) {
    // Keys belonging to this namespace, with the prefix stripped, in the
    // order the underlying store reports them.
    function ownKeys() {
      var out = [];
      try {
        for (var i = 0; i < real.length; i++) {
          var k = real.key(i);
          if (k && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length));
        }
      } catch (e) {}
      return out;
    }
    var api = {
      getItem: function (k) { return real.getItem(PREFIX + k); },
      setItem: function (k, v) { return real.setItem(PREFIX + k, v); },
      removeItem: function (k) { return real.removeItem(PREFIX + k); },
      key: function (i) { var ks = ownKeys(); return i < ks.length ? ks[i] : null; },
      // clear() must not touch the client's keys, only ours.
      clear: function () {
        ownKeys().forEach(function (k) { real.removeItem(PREFIX + k); });
      }
    };
    try {
      Object.defineProperty(api, 'length', { get: function () { return ownKeys().length; } });
    } catch (e) {}
    return api;
  }

  ['localStorage', 'sessionStorage'].forEach(function (name) {
    var real;
    try { real = window[name]; } catch (e) { return; }
    if (!real) return;
    try {
      Object.defineProperty(window, name, {
        value: shim(real), configurable: true, writable: false
      });
    } catch (e) {
      // A browser that refuses the redefinition keeps the shared store. Say so
      // in the console rather than pretending the isolation happened.
      try { console.warn('[live] storage isolation unavailable:', e && e.message); } catch (e2) {}
    }
  });
})();
