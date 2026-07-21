# Couche de tokens générique — PokerTH Web Client

But : **unifier toutes les tailles** (typographie, espacement, rayons, hauteurs de
contrôle) derrière un jeu de variables CSS uniques, pour que l'application soit
cohérente dans son affichage et pilotable depuis un seul endroit — y compris si
l'interface est un jour réécrite hors JS (les tokens sont de simples variables CSS,
agnostiques du moteur).

État initial constaté (build 0.3.951-beta) : **77 valeurs distinctes de `font-size`
en rem**, espacements et rayons ad hoc, et le seul jeu de tokens existant
(`--cf-fs-*`) était défini localement dans `#create-form`. La couche générique
remplace cette dispersion par un barème **discret** (pas fixes), fidèle au QML.

---

## 1. Principe

- Tokens définis dans `:root` de `public/pokerth.css` (bloc « COUCHE DE TOKENS GÉNÉRIQUE »).
- **Barème discret** : des pas fixes, surchargés par breakpoint en un seul bloc
  `@media` (voir §3), au lieu de répéter chaque taille dans des dizaines de règles.
- **Fidélité QML encodée** : les valeurs officielles (barre d'action 54 / 40 px,
  All-In 52 px, radius bouton 9 / barre 10) sont les valeurs des tokens → la parité
  est garantie par construction.
- **Additif et non destructif** : un élément ne « suit » les tokens que lorsqu'on
  remplace sa valeur en dur par `var(--…)`. Tant qu'on ne l'a pas fait, rien ne bouge.
- `--cf-fs-*` sont désormais des **alias** des tokens globaux (valeurs identiques) :
  `#create-form` continue de fonctionner à l'identique.

---

## 2. Les échelles

### Typographie (rem)

| Token | Valeur | Usage type |
|---|---|---|
| `--fs-3xs` | .55rem | HUD, compteurs minuscules |
| `--fs-2xs` | .62rem | sur-titres, méta |
| `--fs-xs` | .70rem | labels secondaires · = `--cf-fs-xs` |
| `--fs-sm` | .78rem | texte dense |
| `--fs-base` | .85rem | corps courant · = `--cf-fs-body` |
| `--fs-md` | .95rem | valeurs, champs · = `--cf-fs-value` |
| `--fs-lg` | 1.05rem | sous-titres · = `--cf-fs-ico-sm` |
| `--fs-xl` | 1.35rem | icônes, titres · = `--cf-fs-ico` |
| `--fs-2xl` | 1.6rem | gros titres |
| `--fs-hero` | 2.6rem | splash, avatars, hero |

Ligne : `--lh-tight: 1.1` · `--lh-base: 1.35`.

### Espacement (px, base 2)

`--sp-0: 2` · `--sp-1: 4` · `--sp-2: 6` · `--sp-3: 8` · `--sp-4: 10`
· `--sp-5: 12` · `--sp-6: 16` · `--sp-7: 20`

Cibles : `gap`, `padding`, `margin`. `--sp-2` (6) et `--sp-3` (8) couvrent la majorité.

### Rayons

`--r-xs: 3` · `--r-sm: 6` · `--r-md: 9` (bouton QML) · `--r-lg: 12`
· `--r-bar: 10` (barre QML) · `--r-pill: 999px`

### Hauteurs de contrôle

`--ctrl-sm: 26` (inputs) · `--ctrl-md: 34` · `--ctrl-lg: 40` (landscapeCompact)
· `--ctrl-xl: 54` (barre normale) · `--ctrl-allin: 52`

---

## 3. Responsive : surcharge par breakpoint (un seul endroit)

On aligne sur les breakpoints QML déjà en place (600 / 900 / 1400, + orientation
et hauteur). Au lieu de rétrécir chaque élément, on rétrécit **le barème** :

```css
/* Exemple — phonePortrait : tout le texte descend d'un cran, en un bloc. */
@media (max-width: 599.98px) {
  :root {
    --fs-3xs: .52rem; --fs-2xs: .58rem; --fs-xs: .66rem; --fs-sm: .74rem;
    --fs-base: .82rem; --fs-md: .90rem; --fs-lg: 1.0rem;  --fs-xl: 1.25rem;
    --sp-6: 12px; --sp-7: 16px;
  }
}
```

Ces surcharges **ne sont pas encore posées** : elles n'ont d'effet qu'une fois les
éléments migrés vers les tokens (sinon elles ne toucheraient que `#create-form` et
changeraient son rendu). Elles s'ajoutent surface par surface, pour rester revuables.

---

## 4. Table de correspondance (règle de migration valeur → token)

`font-size` rem :

| Ancien (cluster) | → Token |
|---|---|
| .50–.56 | `--fs-3xs` |
| .58–.66 | `--fs-2xs` |
| .66–.72 | `--fs-xs` |
| .74–.80 | `--fs-sm` |
| .82–.90 | `--fs-base` |
| .92–1.02 | `--fs-md` |
| 1.05–1.16 | `--fs-lg` |
| 1.20–1.40 | `--fs-xl` |
| 1.50–1.70 | `--fs-2xl` |
| ≥ 1.80 | `--fs-hero` |

`font-size` px (QML) : conservés tels quels **s'ils ont déjà leurs variantes par
breakpoint** (status bar, barre d'action, sièges qml, HUD). Sinon → token rem le
plus proche.

`gap`/`padding`/`margin` px → `--sp-*` de même valeur (2→sp-0 … 20→sp-7 ;
arrondir les intermédiaires 5→sp-2, 7→sp-3, 9→sp-3, 14→sp-6).

`border-radius` px → `--r-*` (3→xs, 6→sm, 9→md, 10→bar, 12→lg, 999→pill).

`height`/`min-height` de contrôles → `--ctrl-*`.

---

## 5. Plan de migration — surface par surface (ne rien laisser de côté)

Chaque lot = un push additif, validé, revu, sans changement visuel non voulu.
Ordre proposé, du plus visible au plus périphérique :

- [ ] **Lot 0 — Fondation** *(fait, 0.3.952-beta)* : tokens `:root` + alias `--cf-fs-*`.
- [x] **Lot 1 — Table de jeu** : espacements/rayons → `--sp-*`/`--r-*` (inerte, 0.3.953)
      + typo harmonisée sur `--fs-*` (72 tailles snappées ≤ 0,05rem, 0.3.954-beta).
      Polices px QML conservées (documentées).
- [x] **Lot 2 — Panneaux en jeu** : espacements/rayons + polices rem migrés (inerte,
      0.3.955) ; typo harmonisée (21 snaps ≤0,05rem) + entêtes odds/stats/assist px→rem
      (0.3.956-beta). Px fins HUD/range-grid conservés (trop fins pour le barème).
- [ ] **Lot 3 — Lobby** : liste des parties, tri/recherche, chat lobby, stats bar.
- [ ] **Lot 4 — Formulaires** : login, `#create-form` (déjà aliasé → généraliser),
      réglages / options avancées, modales de confirmation.
- [ ] **Lot 5 — Ranking / profil** : `.rk-search`, `.rk-season`, pages de classement.
- [ ] **Lot 6 — Thèmes de sièges** (`public/seats/*/style.css`) : aligner sur les tokens.
- [ ] **Lot 7 — Surcharges responsive** : poser les blocs `@media :root { … }` par
      breakpoint une fois les surfaces migrées.
- [ ] **Lot 8 — Surfaces annexes** : `admin.html`, `studio.html` (peu responsives —
      décider si desktop-only assumé ou à harmoniser).

---

## 6. Garde-fous

- **Additif d'abord** : jamais de changement visuel non annoncé ; chaque lot se relit.
- **Fidélité QML prioritaire** : ne pas « arrondir » une valeur que le QML fixe.
- **Ne pas retirer un effet/fonction joueur** sans accord (règle établie).
- **Validation avant push** : `node --check` (JS), JSON valide, équilibre des accolades
  CSS (`{` == `}`), tests déterministes.
- **Versionnage** : les lots touchant des fichiers servis bumpent les 3 versions ;
  ce document (docs/) ne déclenche pas de bump.
