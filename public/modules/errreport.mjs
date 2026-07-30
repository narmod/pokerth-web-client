// ── Remontée des erreurs JavaScript du client vers l'administrateur ──────────
//
// Le collecteur lui-même est un script en ligne placé tout en haut de
// pokerth-client.html : il s'installe AVANT tous les autres scripts, donc il
// attrape aussi les échecs de démarrage (module absent, erreur de syntaxe), et
// il se contente d'empiler dans window.__pthErrQ. Ce module est l'étage du
// dessus : il vide la file et la transmet au serveur.
//
// Ce qui part : message, fichier, ligne, colonne, 3 premières lignes de pile,
// version du client, mode de jeu, page. Rien d'autre — pas de pseudo, pas de
// contenu de partie, pas de chat. Le serveur y ajoute le User-Agent et une IP
// masquée (voir _maskIp dans proxy.js).
//
// Option « advErrReport » (clé localStorage pth_err_report, activée par
// défaut) : décochée, plus rien ne sort et la file est simplement vidée.
//
// Garde-fous, parce qu'une boucle de rendu qui casse peut lever 60 erreurs par
// seconde : signature de déduplication (message + première ligne de pile),
// 5 signatures distinctes au maximum par session, 10 s minimum entre deux
// envois, et le serveur regroupe de toute façon par signature.

const ENDPOINT = '/clienterr';
const MAX_SIGS = 5;          // signatures distinctes envoyées par session
const MIN_GAP_MS = 10000;    // délai minimum entre deux envois
const MAX_STACK = 600;       // caractères de pile conservés

const _seen = new Set();
let _lastSent = 0;
let _timer = null;

function _optOn() {
  try {
    const v = localStorage.getItem('pth_err_report');
    return v === null ? true : v === '1';   // activée par défaut
  } catch (e) { return true; }
}

// Signature stable : message + première ligne de pile. Deux occurrences du
// même bug se replient sur une seule entrée, ici comme côté serveur.
function _sig(it) {
  const first = String(it.stack || '').split('\n')[1] || (it.src + ':' + it.line);
  return String(it.msg || '').slice(0, 120) + '|' + String(first).trim().slice(0, 120);
}

function _trim(it) {
  return {
    msg: String(it.msg || '').slice(0, 300),
    src: String(it.src || '').slice(0, 200),
    line: parseInt(it.line, 10) || 0,
    col: parseInt(it.col, 10) || 0,
    // 3 premières lignes de pile : assez pour situer, pas assez pour peser.
    stack: String(it.stack || '').split('\n').slice(0, 4).join('\n').slice(0, MAX_STACK),
  };
}

function _mode() {
  try { return String(window._playingMode || window._currentLoginMode || ''); } catch (e) { return ''; }
}

function _send(items) {
  const body = JSON.stringify({
    ver: String(window.BUILD_VERSION || ''),
    mode: _mode(),
    path: String(location.pathname || '').slice(0, 120),
    lang: String((document.documentElement && document.documentElement.lang) || ''),
    items: items,
  });
  // keepalive : la requête survit à la fermeture de l'onglet, ce qui compte
  // pour l'erreur qui vient justement de faire fuir le joueur.
  try {
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true })
      .catch(function () {});
  } catch (e) {
    try { navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' })); } catch (_) {}
  }
}

function flush() {
  const q = window.__pthErrQ;
  if (!q || !q.length) return;
  if (!_optOn()) { q.length = 0; return; }

  const batch = [];
  while (q.length) {
    const it = q.shift();
    if (!it) continue;
    const s = _sig(it);
    if (_seen.has(s)) continue;
    if (_seen.size >= MAX_SIGS) continue;
    _seen.add(s);
    batch.push(_trim(it));
  }
  if (!batch.length) return;

  const wait = Math.max(0, MIN_GAP_MS - (Date.now() - _lastSent));
  if (wait > 0) {
    // Trop tôt : on remet le lot en file et on réessaie plus tard (une seule
    // minuterie en vol, sinon une rafale d'erreurs en programmerait autant).
    for (let i = batch.length - 1; i >= 0; i--) { _seen.delete(_sig(batch[i])); q.unshift(batch[i]); }
    if (!_timer) _timer = setTimeout(function () { _timer = null; flush(); }, wait + 50);
    return;
  }
  _lastSent = Date.now();
  _send(batch);
}

window.__pthErrFlush = flush;

// Les erreurs de démarrage sont déjà dans la file : on la vide dès que ce
// module s'exécute, puis à chaque passage en arrière-plan (dernière chance
// d'expédier avant que l'onglet ne soit gelé, notamment sur iOS).
flush();
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });

// Remise à zéro de l'état interne — existe uniquement pour le test
// déterministe (scripts/test-errreport.mjs), qui doit pouvoir rejouer les
// garde-fous depuis une session vierge. Sans effet en production.
function __testReset() {
  _seen.clear();
  _lastSent = 0;
  if (_timer) { clearTimeout(_timer); _timer = null; }
  if (window.__pthErrQ) window.__pthErrQ.length = 0;
}

export { flush, __testReset };
