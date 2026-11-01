// Offline in the player's language (2.1.11-web.2, traffic audit 2026-11-01).
//
// The service worker precaches English only for the three language-dependent
// sets — interface (modules/lang), help (modules/help/content) and Ace's Help
// (modules/guide/lang). The 82 other languages were 59 % of the precache
// (≈ 6 MB of ≈ 10 MB) for a visitor who uses one of them. This module asks the
// active service worker to cache the player's own language too:
//   · after boot (also on a first visit: `ready` waits for the worker that is
//     still installing, then its cache gets the language);
//   · on every language change;
//   · when a new worker takes over (its cache starts without the language).
// The worker skips what it already has. A language never used on this device
// cannot be picked while offline: setLang() keeps the current one and shows
// its usual error toast (choice approved by narmod, 2026-11-01).
import { getLang, onLangChange } from './i18n.mjs';

function send() {
  try {
    if (!('serviceWorker' in navigator) || window.LIVE_MODE) return;
    const lang = String(getLang() || 'en').toLowerCase();
    if (lang === 'en') return;   // English is in the precache
    navigator.serviceWorker.ready.then((reg) => {
      if (reg && reg.active) reg.active.postMessage({ type: 'CACHE_LANG', lang });
    }).catch(() => {});
  } catch (_e) { /* never in the way of the app */ }
}

onLangChange(send);
try { if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('controllerchange', send); } catch (_e) {}
if (document.readyState === 'complete') setTimeout(send, 2000);
else window.addEventListener('load', () => setTimeout(send, 2000), { once: true });

export { send as cacheLangForOffline };
