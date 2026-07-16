# 🩺 Diagnostiquer un problème / Diagnosing a problem

Guide pour collecter les informations utiles quand quelque chose ne va pas
(cartes invisibles, connexion bloquée, mauvaise version affichée…).
*English speakers: commands are identical; field names in the JSON output are French but self-explanatory — include the raw output as-is in your report.*

## 1. Le numéro de build

En bas de l'écran de connexion : `PokerTH Web Client x.y.z · build x.y.z`.
Si le build affiché ne correspond pas à la dernière version déployée, forcez le
rafraîchissement (bannière « nouvelle version » ou bouton ↺) avant de tester à nouveau.

## 2. Ouvrir la console du navigateur

| Plateforme | Comment |
|---|---|
| Desktop (Edge, Chrome, Firefox) | `F12` → onglet **Console** |
| macOS Safari | Réglages → Avancé → « Afficher le menu Développement », puis `⌥⌘C` |
| iPhone / iPad | Pas de console locale. Soit brancher l'appareil à un Mac (Safari → Développement → \<appareil\>), soit utiliser les diagnostics visibles décrits plus bas |

## 3. Commandes de diagnostic

### `pthDiag()` — instantané général

À taper dans la console, à n'importe quel moment (idéalement pendant que le
problème se produit) :

```js
pthDiag()
```

Retourne et loggue un JSON : build, navigateur, écran, langue, service worker,
état WebSocket, mode de connexion (`guest` / `auth` / `unauth` / `lan`), pseudo,
partie et main en cours, présence des cartes propres, présence de la clé de
déchiffrement, et le dernier diagnostic cartes. **Copiez tout le bloc dans votre
rapport.**

### `window._pthCardDiag` — pipeline des cartes propres

Rempli à chaque début de main. Trace la voie de réception des deux cartes :

```js
window._pthCardDiag
// { hand: 12, plain: false, enc: 16, encU8: true, key: true, dec: true, cleared: false, money: 2980 }
```

| Champ | Sens |
|---|---|
| `plain` | cartes reçues en clair (`plainCards`) — mode invité/LAN |
| `enc` | taille en octets des cartes chiffrées (`encryptedCards`, comptes pokerth.net) ; `-1` = absent |
| `encU8` | les octets chiffrés ont bien été extraits |
| `key` | clé AES dérivée du mot de passe présente |
| `dec` | déchiffrement réussi |
| `cleared` | cartes effacées par le garde « tapis à 0 » |
| `money` | stack vu au début de la main |

Cas typiques : `key:false` → mot de passe non capté à la connexion ;
`dec:false` → déchiffrement échoué ; `cleared:true` → stack mal initialisé.

### Diagnostics visibles sans console (mobile)

Si les cartes propres restent invisibles alors que le serveur a envoyé des
données, une ligne de statut rouge s'affiche pendant les deux premières mains
concernées :

```
diag cartes: plain=false enc=16 u8=true cle=true dec=false clr=false $=3000
```

Photographiez-la ou recopiez-la telle quelle dans votre rapport.

## 4. Que mettre dans un rapport de bug

1. La sortie complète de `pthDiag()` (ou la ligne rouge sur mobile).
2. Navigateur + OS (ex. Safari iOS 19, Edge Windows 11).
3. Le build affiché.
4. Mode de connexion (invité, compte pokerth.net, serveur privé, entraînement).
5. Ce que vous faisiez et ce que vous attendiez.

Ouvrez ensuite une issue : <https://github.com/narmod/pokerth-web-client/issues>.
