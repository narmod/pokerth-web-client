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

  // Fallback when window.localStorage cannot be replaced: namespace the store
  // itself, through Storage.prototype, for these objects only. Until web.131
  // /live then went on reading and writing the player's settings (a console
  // warning was all), which the comment above says must not happen.
  var fallen = [];
  function patchPrototype() {
    var P = window.Storage && window.Storage.prototype;
    if (!P) return false;
    var get = P.getItem, set = P.setItem, rem = P.removeItem, key = P.key;
    var lenD = Object.getOwnPropertyDescriptor(P, 'length');
    var len = lenD && lenD.get;
    if (!get || !set || !rem || !key || !len) return false;
    var ours = function (st) { return fallen.indexOf(st) >= 0; };
    var own = function (st) {
      var out = [];
      for (var i = 0; i < len.call(st); i++) {
        var k = key.call(st, i);
        if (k && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length));
      }
      return out;
    };
    P.getItem = function (k) { return get.call(this, ours(this) ? PREFIX + k : k); };
    P.setItem = function (k, v) { return set.call(this, ours(this) ? PREFIX + k : k, v); };
    P.removeItem = function (k) { return rem.call(this, ours(this) ? PREFIX + k : k); };
    P.key = function (i) {
      if (!ours(this)) return key.call(this, i);
      var ks = own(this); return i < ks.length ? ks[i] : null;
    };
    P.clear = (function (clr) {
      return function () {
        if (!ours(this)) return clr.call(this);
        var st = this; own(st).forEach(function (k) { rem.call(st, PREFIX + k); });
      };
    })(P.clear);
    Object.defineProperty(P, 'length', {
      configurable: true, enumerable: lenD.enumerable,
      get: function () { return ours(this) ? own(this).length : len.call(this); }
    });
    return true;
  }
  var patched = null;

  ['localStorage', 'sessionStorage'].forEach(function (name) {
    var real;
    try { real = window[name]; } catch (e) { return; }
    if (!real) return;
    try {
      Object.defineProperty(window, name, {
        value: shim(real), configurable: true, writable: false
      });
    } catch (e) {
      fallen.push(real);
      try { if (patched === null) patched = patchPrototype(); } catch (e2) { patched = false; }
      if (!patched) {
        // Nothing left to hook: say so rather than pretend the isolation happened.
        try { console.warn('[live] storage isolation unavailable:', e && e.message); } catch (e3) {}
      }
    }
  });
})();
