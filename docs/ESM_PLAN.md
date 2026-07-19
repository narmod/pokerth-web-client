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

**3. Piège majeur : `const App`.** pokerth.js expose l'app comme `const App`
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
