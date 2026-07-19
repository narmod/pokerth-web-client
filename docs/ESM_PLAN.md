# Découpage ESM de pokerth.js — plan d'extraction incrémentale

Objectif : transformer `public/pokerth.js` (~950 Ko, ~17 700 lignes, script
classique) en une constellation de modules ES sous `public/modules/`, sans
jamais casser l'app entre deux étapes. Méthode : **strangler pattern** — on
extrait un bloc à la fois, le monolithe rétrécit, l'app tourne à chaque commit.

## Contraintes qui dictent la méthode

- `pokerth.js` est un **script classique** (pas `type=module`) : il ne peut pas
  faire de `import` statique. Le pont entre les deux mondes est le pattern déjà
  utilisé par `i18n.mjs` (« still global via window.setLang ») : le module
  exporte proprement **et** s'attache à `window.*` pour le code legacy.
- ~766 usages de `window.` : chaque extraction garde des ponts
  `window.xxx = ...` tant qu'un consommateur legacy existe. On ne supprime un
  pont qu'après avoir migré son dernier appelant (grep obligatoire).
- La logique de restauration d'UI est fragile : les blocs UI partent en dernier.
- Chaque extraction = un push complet (3 versions bumpées, tests, déploiement),
  jamais deux extractions dans le même push.

## Phase 0 — Audit du câblage — ✅ FAIT (2026-07-19, base v0.3.807-beta)

**1. Gabarit de chargement (pokerth-client.html L2023-2033 + L2084).**
Les modules sont des `<script type="module" src="modules/x.mjs">` placés AVANT
`<script src="pokerth.js" defer>`. Modules et defer partagent la même file
différée exécutée dans l'ordre du document → quand pokerth.js démarre, les
`window.*` des modules existent déjà. Aucun mécanisme d'attente nécessaire :
l'ordre suffit. Tout nouveau module s'insère dans ce bloc, avant pokerth.js.

**2. Gabarit interne (i18n.mjs).** Trois étages : exports ES nommés (pour les
futurs imports) · alias legacy `window.t = t` etc. + `Object.defineProperty`
pour les variables partagées (`_lang`) · un objet namespace propre
(`window.I18N = {...}`). Auto-init sur `DOMContentLoaded` avec repli immédiat
si le DOM est déjà parsé. Reproduire ces trois étages à chaque extraction.

**3. Piège `const App` — atténué (découverte #6).** L'IIFE App expose déjà
`seats`, `seatData`, `myId`, `players` (getters) et `_ipBlockUntil` (get/set)
via `Object.defineProperty(window, …)` (~L10664). Les modules peuvent donc
référencer ces noms nus à runtime. Le piège reste entier pour tout AUTRE état
interne de l'App.

**3bis. Piège originel : `const App`.** pokerth.js expose l'app comme `const App`
au scope du script — PAS `window.App` (commentaire HTML L525). Un module ES ne
peut pas y accéder. Règle : ne jamais extraire du code qui référence `App` ;
si inévitable, exposer d'abord `window.App = App` dans le monolithe (mini-push
préalable dédié).

**4. Les marqueurs ══ de section MENTENT.** Le bloc « ANIMATIONS » (L44-1492)
contient en réalité prefs, options avancées, HUD, rendu de sièges… (39 écritures
`window.*` hétérogènes). L'extraction se délimite par SURFACE DE FONCTIONS
(défs + usages externes, script d'audit ci-dessous), jamais par marqueur.

**5. Deux listes de precache à tenir.** `sw.js` → `ASSETS`, ET le boot-loader
autonome du HTML (L469, tableau `CRIT`) qui liste les assets critiques. Tout
nouveau module doit figurer dans les deux.

**6. Surfaces d'export mesurées (défs utilisées hors du bloc) :**
- cards+odds (L2313-2825) : `evaluateBestHand`, `evaluatePreFlopHand`,
  `normalizeHoleCard`, `_cmpHand`, `_oddsCompute`, `_qmlWinningHandText`
  (le bloc contient aussi les réactions et `animateChipToPot` → à laisser
  sur place, ils partiront avec leurs blocs respectifs #6/#7).
- proto (L3446-3533) : objet unique `Proto`.
- crypto (L3534-3711) : objet unique `PTHCrypto`.
- messages (L3712-4121) : objet unique `MSG` (+ `window._pthScram`).
→ #2 et #3 sont quasi mécaniques (un seul nom à ponter chacun).

Audit reproductible : croiser `^(function|const|var|let)\s+(\w+)` du bloc avec
les usages `\b<nom>\b` du reste du fichier avant chaque extraction.

## Ordre d'extraction (du plus autonome au plus intriqué)

| # | Bloc (lignes actuelles) | Cible | Risque | Pourquoi cet ordre |
|---|---|---|---|---|
| 1 | Évaluateur de main + force pré-flop + glue phe/odds (L2313–2820) | `modules/game/cards.mjs` | faible | Fonctions pures, déjà partiellement testées (test-phe) ; testable en node immédiatement |
| 2 | PROTOBUF codec minimal (L3446–3533) | `modules/net/proto.mjs` | faible | Pur ; s'aligner/fusionner avec `offline/proto.mjs` si recouvrement |
| 3 | PTHCrypto — déchiffrement cartes (L3534–3711) | `modules/net/crypto.mjs` | faible | Pur, périmètre net |
| 4 | MESSAGES POKERTH — build/parse (L3712–4121) | `modules/net/messages.mjs` | moyen | Dépend de proto (fait en #2) ; cœur réseau mais sans DOM |
| 5 | RACCOURCIS CLAVIER (L1493–2312) | `modules/ui/shortcuts.mjs` | moyen | Autonome mais touche au DOM et aux handlers d'action |
| 6 | RÉACTIONS RAPIDES /emoji (L2419–2620) | `modules/ui/reactions.mjs` | moyen | Périmètre clair, interop sp0ck à ne pas casser |
| 7 | ANIMATIONS (L44–1492 + L9283–…) | `modules/ui/anim.mjs` | moyen | Gros volume, mais surtout des fonctions appelées ponctuellement |
| 8 | Placement custom des sièges (L15881–…) | `modules/game/seats.mjs` | élevé | Interagit avec la restauration d'UI et le zoom |
| 9 | APPLICATION (L4122–…) : état de table, rendu sièges, action bar, panneaux | reste dans `pokerth.js` puis éclatement final | élevé | Orchestrateur ; on ne l'attaque qu'une fois tout le reste sorti |

Jalon final : quand pokerth.js ne contient plus que l'orchestrateur, le passer
en `type=module` et remplacer les ponts `window.*` par de vrais imports.

## #9 — Sous-plan orchestrateur App (audit du 2026-07-19, base 0.3.815-beta)

L'IIFE App = L2581-13827, **11 246 lignes, 199 fonctions, 170 vars d'état de
closure**. Audit automatique (identifiants libres ∩ état de closure) :
**64 fonctions déménageables** (1 123 l, zéro var de closure — globaux/DOM
seulement) et **135 immobilisées** (6 009 l), dont les deux géants
`handleMsg` (2 078 l) et `renderSeatsImmediate` (999 l).

Mécanique identique aux extractions #1-#8 : les appels nus internes à l'IIFE
résolvent la chaîne de portées jusqu'au global → les ponts `window.*`
suffisent, aucun changement des sites d'appel.

| Étape | Module | Contenu (fonctions clés) | ~lignes | Intérêt |
|---|---|---|---|---|
| 9a | `game/layout.mjs` | `_qmlLandscapeLayout` · `_qmlPortraitScale` · `_officialSeatPix` · `_applyQmlBgCenter` | ~455 | Maths pures de l'ellipse/slots QML — **testables contre la Bible et DELTA_QML_2_1_3** (angles 230°/310°, bornes radiusX 0.22-0.36, morsure 55 %…) |
| 9b | `ui/deck.mjs` | `cardToHtml/cardHtml/cardName` · `_deckFace/_deckBack/_refreshDeck` · `flipCommCards` · `chipSvg/dealerChipSvg/_pthPuck` · `_timerSvg` | ~200 | Rendu cartes/pucks, très sollicité, dépendances = DOM + StyleProvider-like globaux |
| 9c | `net/avatar-cache.mjs` | famille `_pth*` (cache LRU avatars pokerth.net, assemblage data-url) | ~120 | Périmètre net clair |
| 9d | `ui/misc.mjs` | `_attachPanelDrag` · wake lock (`show/acquire/release`) · `_getSessionId/_sidStore` · `setPct` · `confirmCall` (guard_call) · `_handleCtrlFrame` | ~250 | Reliquat déménageable, à découper si hétérogène |
| 9e+ | — | Les 135 immobilisées : stratégie « module d'état » (extraire l'état de closure vers un objet partagé exporté) OU statu quo assumé — décision d'architecture À PRENDRE avec Arnaud avant tout code | 6 009 | `handleMsg` et `renderSeatsImmediate` sont le cœur fragile ; ne pas y toucher sans plan dédié |

Après 9a-9d : re-scanner (les fonctions devenues sans dépendance interne
peuvent se libérer par vagues). Le monolithe devrait passer sous ~830 Ko.

## #9e — Module d'état partagé `game/state.mjs` (option A) — ✅ TERMINÉ 2026-07-19 (V0→V10, 153 clés dans S)

Ré-audit à v0.3.822 : IIFE = L2581–12888, ~154 vars top-level. Une var de closure
ne s'aliase pas → migration = **renommage mécanique** `nom` → `S.nom` (nommage
plat 1:1, préfixe `_` conservé), **atomique par nom**, par vagues de domaines.
`const S = window.PthState;` en tête de l'IIFE (jamais de nom `S` local dans
l'IIFE — vérifié). La libération des fonctions (déménagement en modules) vient
APRÈS les vagues d'état, en pushes séparés (#9f).

| Vague | Domaine | Vars | Risque |
|---|---|---|---|
| V0 | Timer de tour (+ création state.mjs, câblage HTML/CRIT/sw) | 3 | pilote |
| V1 | Voix / haptique | 7 | faible |
| V2 | Stats / board / profil | 12 | faible |
| V3 | Pétitions/invitations + chat/notifs/titre | 13 | faible |
| V4 | Avatars | 12 | faible |
| V5 | Lobby (`players` 159 occ. + pont window) | 15 | moyen |
| V6 | Config partie / blinds | 17 | moyen |
| V7 | Connexion (`ws` 112 occ., pont `_ipBlockUntil`, watchdog) | 28 | moyen+ |
| V8 | Action bar / pré-action | 9 | moyen+ |
| V9 | Cœur de main, 3 sous-vagues : snapshots → cartes/mises → sièges/latches (`seats seatData` + ponts window) | 27 | élevé |
| V10 | UI divers + `myId` (145 occ., pont window) | 10 | moyen |

Mécanique par vague : renommage BORNÉ À LA PLAGE DE L'IIFE UNIQUEMENT
(leçon V4 : un nom identique hors IIFE peut être un global implicite distinct
— L1626 `_myAvatarCache` → ReferenceError sur `S.` hors portée, rebroadcast
avatar LAN cassé). Depuis V5 : renommage par AST (acorn, local non commité) — nœuds Identifier
libres uniquement (clés d'objet, propriétés membres et déclarations exclues
par construction), anti-shadowing vérifié, plage IIFE bornée par le parseur.
Avant V5 : script Python, comptage attendu par nom + `assert`,
classification des exclusions (`.nom`, `nom:` littéral, chaînes, shadowing
local), re-grep résiduel = zéro nom nu, `node --check`. Noms courants (`pot
players games seats seatData myId ws myName loaded`) : diff intégral relu.
Ponts `defineProperty` (L~9540 : seats/seatData/myId/players/_ipBlockUntil) :
rebranchés sur `S` dans le MÊME push que leur var. V7–V9 : test manuel
reconnexion/rejoin en ligne obligatoire. Rollback = revert du commit entier,
jamais de rustine sur un renommage partiel.

## #9f — Libération des fonctions (plan court, scan 2026-07-19 à v0.3.836)

175 fonctions top-level dans l'IIFE : 77 feuilles (1 067 l, zéro dépendance
interne), 85 à faible couplage (1 638 l, 1-3 dép), 13 fortement couplées
(3 821 l — `handleMsg` 2 080 l, `renderSeatsImmediate` 999 l). L'état étant
dans `S`, une libération = déplacer un CLUSTER de fonctions (dépendances
internes closes sur le cluster) vers un module, gabarit i18n.mjs.

Mécanique par cluster : copier les fonctions → module ; `window.nom = nom`
pour chacune (les appels dans l'IIFE résolvent la chaîne de portées jusqu'à
window, zéro site d'appel modifié) ; réécrire `$(` → `document.getElementById(`
dans le code déplacé ; `import { S } from '../game/state.mjs'` remplace le
`window.PthState` ; câblage HTML + CRIT + sw.js ; test node du module ;
équivalence prouvée (corps de fonctions normalisé). Un cluster = un push.

| Vague | Module | Cluster (≈lignes) |
|---|---|---|
| 9f-1 | `ui/fmt.mjs` | _groupThousands · fmtChips · fmtChipsVoice (~60) — débloque presque tous les autres |
| 9f-2 | `ui/media.mjs` | voix (speak/_speakNext/_pickVoice/_voiceLangTag/_voiceUtterance/_loadVoices/voiceActionPhrase/toggleVoice) + haptique (hapticBuzz/toggleHaptic) + _syncMediaToggleButtons (~180) |
| 9f-3 | `game/turn-timer.mjs` | _updateTimer · startTurnTimer · stopTurnTimer · _timerRectSvg (~90) |
| 9f-4 | `game/stats.mjs` | famille _life* · _pushStats · _stats*/renderStats · _board*/renderBoard · toggleStats/initStats/recordHand (~350) |
| 9f-5 | `net/petitions.mjs` | _pet* (kick-petitions) + _inv* (invitations) (~250) |
| 9f-6 | `ui/chat.mjs` | addChat · _chatLocalCmd (~300) |
| 9f-7 | `ui/player-popup.mjs` | openPlayerInfoPopup · _otherPlayerInfoHtml · _pim* · picker avatar lobby · _avatarChipHtml · _pthAvatarFor · _myAvatarDisplay/ToBroadcast · _ccToFlag (~450) |
| 9f-8 | `ui/lobby.mjs` | renderGames · renderTablePlayers · _renderInfo* · renderGameInfoPanel · _renderLobbyWaitActions · updateLobbyStatsBar · _tableMatches/_refreshFilterChips · MODE_LABEL/GTYPE (~400) |
| 9f-9 | `game/showdown.mjs` | _snapshotHandResults · showWinHandBadge · showWinnerOverlay/dismissWinner/_maybeShowNextHandBtn · showEndGameOverlay (~400) |
| 9f-10 | `net/session.mjs` | show · _armRejoin · _maybeReconnectOnResume · _forceReconnect · _begin/_endConnecting/_connectBtnEl · setStatus · send (~250 ; onRawData reste avec handleMsg) |

Reste après 9f-10 : le noyau (~3 600 l — handleMsg, renderSeatsImmediate,
renderMyTurnActions, doAction/doRaise/confirmCall, renderSeats, renderComm…)
= l'orchestrateur assumé de pokerth.js ; son éclatement éventuel fera l'objet
d'un plan dédié (#9g) une fois les 10 vagues livrées et stabilisées.

## Protocole par extraction (checklist à suivre à CHAQUE fois)

1. Re-fetch pokerth.js à HEAD ; délimiter le bloc exact (marqueurs ══).
2. Créer `modules/<zone>/<nom>.mjs` : copie du bloc + `export` nommés +
   bloc de compatibilité `window.xxx = ...` en fin de module.
3. Dans pokerth.js : supprimer le bloc, ne rien renommer ailleurs (les appels
   passent par les mêmes noms globaux).
4. Câbler le chargement dans `pokerth-client.html` sur le gabarit i18n.mjs.
5. Ajouter le fichier au precache de `sw.js`.
6. Écrire/étendre un test node (`scripts/test-<nom>.mjs` + script npm) pour la
   partie pure du module.
7. Valider : `node --check` sur les deux fichiers, tests, partie d'entraînement
   complète, partie en ligne (connexion + une main).
8. Bump 3 fichiers, push atomique, vérif post-push, déploiement.
9. Noter dans ce fichier la date, la version et le delta de taille du monolithe.

## Règles de sécurité

- Jamais deux blocs dans un push. Jamais d'extraction + feature dans un push.
- Si un doute apparaît en cours d'extraction (dépendance cachée, global
  inattendu), on s'arrête et on revient à l'état HEAD — pas de rustine.
- Le monolithe reste la référence de comportement : une extraction ne change
  AUCUNE logique (les améliorations viennent dans des pushes séparés, après).
- `t()` : tout appel doit rester dans un corps de fonction exécuté à runtime
  (jamais au top-level d'un module — ReferenceError silencieux).

## Suivi

| Date | Version | Extraction | pokerth.js avant → après |
|---|---|---|---|
| 2026-07-19 | — | Phase 0 (audit, docs seulement) | 954 Ko |
| 2026-07-19 | 0.3.808-beta | #1 game/cards.mjs (évaluateur, pré-flop, odds+phe) — 19 tests | 954 → 944 Ko |
| 2026-07-19 | 0.3.809-beta | #2 net/proto.mjs (codec protobuf) — 22 tests | 944 → 941 Ko |
| 2026-07-19 | 0.3.810-beta | #3 net/crypto.mjs (PTHCrypto AES/SHA-1) — 14 tests croisés node:crypto | 941 → 933 Ko |
| 2026-07-19 | 0.3.811-beta | #4 net/messages.mjs (MSG + SCRAM, import Proto explicite) — 18 tests | 933 → 912 Ko |
| 2026-07-19 | 0.3.812-beta | #5 ui/shortcuts.mjs (clavier + rebind, pont defineProperty _rebindAction) — 14 tests (stubs DOM) | 912 → 902 Ko |
| 2026-07-19 | 0.3.813-beta | #6 ui/reactions.mjs (/emoji, dédup sp0ck, mute/pin pontés) — 12 tests (stubs DOM) | 902 → 891 Ko |
| 2026-07-19 | 0.3.814-beta | #7 ui/anim.mjs (15 animations, 3 plages ; ping/prefs/état showdown restés monolithe) — 11 tests | 891 → 882 Ko |
| 2026-07-19 | 0.3.815-beta | #8 game/seats.mjs (placement custom + édition + autoScaleTable ; état déjà via window.*) — 13 tests | 882 → 872 Ko |
| 2026-07-19 | 0.3.816-beta | 9a game/layout.mjs (géométrie QML : slots portrait, bisections, ellipse — verrouillée par 34 tests Bible/DELTA) | 872 → 844 Ko |
| 2026-07-19 | 0.3.817-beta | 9b ui/deck.mjs (cardName/cardHtml, decks, pucks SVG, timer — encodage 0..51 verrouillé, 22 tests) | 844 → 833 Ko |
| 2026-07-19 | 0.3.818-beta | 9c net/avatar-cache.mjs (LRU 200, quota-retry, assemble data:URL — 16 tests) | 833 → 830 Ko |
| 2026-07-19 | 0.3.819-beta | 9d ui/misc.mjs (esc, session/onglet, wake lock, trames ctrl, setPct, drag — 17 tests ; show/confirmCall/addChat exclus, life/pet reporté) | 830 → 825 Ko |
| 2026-07-19 | 0.3.823-beta | 9e-V0 game/state.mjs (store S + pilote timer : 3 vars, 38 renommages) — 7 tests | 822 → 822 Ko |
| 2026-07-19 | 0.3.824-beta | 9e-V1 état voix/haptique → S (7 vars, 53 renommages) — test-state 14 ✓ | 822 Ko (stable) |
| 2026-07-19 | 0.3.825-beta | 9e-V2 état stats/board/profil → S (12 vars, 96 renommages) — test-state 19 ✓ | 822 Ko (stable) |
| 2026-07-19 | 0.3.826-beta | 9e-V3 état pet/inv + chat/notifs/titre → S (13 vars, 74 renommages) — test-state 25 ✓ | 822 Ko (stable) |
| 2026-07-19 | 0.3.827-beta | 9e-V4 état avatars → S (12 vars, 83 renommages) — test-state 30 ✓ | 822 Ko (stable) |
| 2026-07-19 | 0.3.828-beta | 9e hotfix : S._myAvatarCache hors IIFE (L1626) → window._myAvatarCache (global implicite d'origine) ; règle « renommage borné à l'IIFE » | régression V4 avatar LAN corrigée |
| 2026-07-19 | 0.3.829-beta | 9e-V5 état lobby → S (15 vars, 204 renommages AST, pont window.players rebranché) — test-state 36 ✓ | 822 Ko (stable) |
| 2026-07-19 | 0.3.830-beta | 9e-V6 état config partie/blinds → S (17 vars, 250 renommages AST) — test-state 42 ✓ | 822 Ko (stable) |
| 2026-07-19 | 0.3.831-beta | 9e-V7 état connexion → S (28 vars, 257 renommages AST, pont _ipBlockUntil rebranché) — test-state 52 ✓ · ⚠ test manuel reconnexion/rejoin requis après déploiement | 822 Ko (stable) |
| 2026-07-19 | 0.3.832-beta | 9e-V8 état action bar/pré-action → S (9 vars, 55 renommages AST, équivalence prouvée) — test-state 57 ✓ | 822 Ko (stable) |
| 2026-07-19 | 0.3.833-beta | 9e-V9.1 état snapshots showdown → S (6 vars, 49 renommages AST, équivalence prouvée) — test-state 60 ✓ | 822 Ko (stable) |
| 2026-07-19 | 0.3.834-beta | 9e-V9.2 état cartes/mises/phases → S (13 vars, 230 renommages AST ; 2 shadowings locaux renommés _potVal/_potNow, équivalence prouvée) — test-state 64 ✓ | 822 Ko (stable) |
| 2026-07-19 | 0.3.835-beta | 9e-V9.3 état sièges/verrous → S (8 vars, 338 renommages AST ; outil v3 = fix shorthand {myName} détecté par node --check ; 2 locaux _gseats renommés ; ponts window seats/seatData rebranchés ; équivalence prouvée) — test-state 67 ✓ | 822 Ko (stable) |
| 2026-07-19 | 0.3.836-beta | 9e-V10 état UI divers + myId → S (10 vars, 153 renommages AST, dernier pont window.myId rebranché) — test-state 73 ✓ · **#9e TERMINÉ : les seules déclarations du corps de l'IIFE sont `S` et `$` (vérifié AST) ; 153 clés dans state.mjs ; prochaine étape #9f = re-scan de mobilité + vagues de libération de fonctions** | 822 Ko (stable) |
| 2026-07-19 | — | #9f : scan de mobilité (77 feuilles/85 faibles/13 fortes) + plan des 10 vagues de libération (docs seulement) | 822 Ko |
| 2026-07-19 | 0.3.837-beta | 9f-1 ui/fmt.mjs (_groupThousands/fmtChips/fmtChipsVoice ; _lang lu via window._lang, seule adaptation) — 11 tests | 822 → 820 Ko |
| 2026-07-19 | 0.3.838-beta | 9f-2 ui/media.mjs (voix TTS + haptique, 11 fonctions ; adaptations window._lang/showKeyHint/getPlayerName + pont getPlayerName ajouté ; corps identiques vérifiés) — 12 tests | 820 → 815 Ko |
| 2026-07-19 | 0.3.839-beta | 9f-3 game/turn-timer.mjs (4 fonctions ; adaptations window.setUrgentMode/notifyTick*/renderSeats + pont renderSeats ajouté ; corps identiques) — 13 tests | 815 → 811 Ko |
| 2026-07-19 | 0.3.840-beta | 9f-4 game/stats.mjs (25 fonctions : _life*, _pushStats, panneau/board/session ; imports t/fmt/esc, pont _renderProfileStats ; corps identiques) — 16 tests | 811 → 799 Ko |
| 2026-07-19 | 0.3.841-beta | 9f-5 net/petitions.mjs (14 fonctions vote-kick + invitations ; imports t/esc/MSG, ponts send & addChat ajoutés ; corps identiques) — 11 tests | 799 → 791 Ko |
| 2026-07-19 | 0.3.842-beta | 9f-6 ui/chat.mjs (addChat + _chatLocalCmd ; imports t/esc/MSG, globaux script via window.*, garde typeof adaptée, 1× $( réécrit ; corps identiques) — 10 tests | 791 → 778 Ko |
| 2026-07-19 | 0.3.843-beta | 9f-7 ui/player-popup.mjs (13 fonctions popup joueur + avatars + drapeaux ; ponts isBot/updateLobbyPill ajoutés, wrapper _renderProfileStats 9f-4 retiré, balayage par occurrence adopté ; corps identiques) — 11 tests | 778 → 764 Ko |
| 2026-07-19 | 0.3.844-beta | 9f-8 ui/lobby.mjs (18 fonctions : filtres/liste des tables, panneau infos, wait-actions, en-tête ; 4 segments, bug latent T nu conservé à l’identique et documenté ; corps identiques) — 10 tests | 764 → 714 Ko |
