# PokerTH Web Client

> Client web moderne pour PokerTH — jouez au Texas Hold'em directement depuis votre navigateur, sans installation.

[![Version](https://img.shields.io/badge/version-0.1.0--alpha-gold)](https://github.com/narmod/pokerth-web-client)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-GPL--2.0-blue)](LICENSE)

---

## 📖 Présentation

**PokerTH Web Client** est une alternative web au client historique PokerTH (C++/Qt).  
Il permet de se connecter à n'importe quel serveur PokerTH directement depuis un navigateur moderne, sans rien installer, via un proxy WebSocket-to-TCP.

### Objectifs
- Remplacer le client lourd par une interface web responsive
- Compatibilité totale avec les serveurs PokerTH existants (protocole Protobuf)
- Utilisable sur ordinateur, tablette et mobile

---

## ✨ Fonctionnalités

### Connexion
- 4 modes : LAN, Serveur privé Invité, pokerth.net Invité, pokerth.net Compte
- Sauvegarde des identifiants (localStorage)
- Support TLS optionnel
- Reconnexion automatique

### Lobby
- Liste des tables en temps réel
- Rejoindre ou créer une partie en un clic (⚡ Join or Create)
- Création avancée : blindes, timeout, bots, joueurs min, mot de passe
- Mode spectateur

### Table de poker
- Affichage complet de la table ovale avec sièges positionnés
- Jetons SVG style casino (SB 🔵, BB 🔴, D ⚫) avec animation
- Cartes communes avec retournement flip 3D (flop/turn/river)
- Distribution animée des cartes en début de main
- Jetons animés glissant vers le pot lors des mises
- Timer arc SVG + badge secondes sous chaque avatar
- Force de la main affichée (pré-flop → river)

### Joueur
- Avatar emoji personnalisé (43 choix : famille, animaux, créatures, personnages)
- Visible par tous les joueurs via le proxy (`AVATAR:pid:emoji`)
- Statistiques de session : mains jouées, victoires, gain/perte, historique
- Panneau stats accessible en cliquant sur son avatar

### Chat & social
- Chat lobby et chat en partie
- 25 réactions emoji animées avec compteur
- Diffusion temps réel via proxy WebSocket

### Confort
- Notifications navigateur quand c'est votre tour
- Titre d'onglet dynamique (⚡ TON TOUR / YOUR TURN)
- Raccourcis clavier : F=Fold, C=Call, R=Raise, A=All-in
- Son : actions, victoire, timer urgent
- Mode plein écran
- Bascule langue EN/FR complète

### PWA
- Installable comme application native (manifest.json + Service Worker)
- Fonctionne hors-ligne (cache statique)

---

## 🏗️ Architecture

```
Navigateur (WebSocket)
        ↕
   proxy.js (Node.js)        ← pont WebSocket ↔ TCP/TLS
        ↕
Serveur PokerTH (TCP/TLS)
```

### Fichiers principaux
| Fichier | Rôle |
|---|---|
| `proxy.js` | Serveur Node.js : proxy WebSocket→TCP + HTTP statique |
| `public/pokerth-client.html` | Interface HTML (65 KB) |
| `public/pokerth.js` | Logique applicative JS (164 KB) |
| `public/pokerth.css` | Styles (64 KB) |
| `public/manifest.json` | PWA manifest |
| `public/sw.js` | Service Worker |

### Messages proxy custom (texte, broadcast à tous les clients)
| Message | Description |
|---|---|
| `REACT:pid:emoji` | Réaction emoji d'un joueur |
| `AVATAR:pid:emoji` | Avatar emoji d'un joueur |

---

## 🚀 Installation & démarrage

### Prérequis
- Node.js 18+
- Un serveur PokerTH accessible

### Démarrage rapide

```bash
git clone https://github.com/narmod/pokerth-web-client.git
cd pokerth-web-client
npm install
node proxy.js
```

Ouvrir [http://localhost:8080](http://localhost:8080)

### Options de lancement
```bash
node proxy.js            # TLS activé (pour pokerth.net)
node proxy.js --notls    # Sans TLS (LAN / serveur privé)
node proxy.js --insecure # TLS sans vérification de certificat
node proxy.js 9090       # Port personnalisé
```

### Avec PM2 (production)
```bash
npm install -g pm2
pm2 start proxy.js --name pokerth-web
pm2 save
```

---

## ⚙️ Configuration du serveur PokerTH

Pour un serveur privé avec le mode invité activé :

```ini
# pokerth.cfg
ServerRestrictGuestLogin=0    # Autoriser les invités
ServerAllowSpectator=1        # Autoriser les spectateurs
```

---

## 🖥️ Compatibilité

| Navigateur | Support |
|---|---|
| Chrome / Edge 90+ | ✅ Complet |
| Firefox 88+ | ✅ Complet |
| Safari 15+ | ✅ Complet |
| Mobile Chrome/Safari | ✅ Responsive |

---

## 📁 Structure du projet

```
pokerth-web-client/
├── proxy.js              # Serveur proxy Node.js
├── package.json
├── public/
│   ├── pokerth-client.html   # HTML principal
│   ├── pokerth.js            # JS applicatif
│   ├── pokerth.css           # Styles
│   ├── manifest.json         # PWA
│   ├── sw.js                 # Service Worker
│   └── favicon.*             # Icônes (svg, ico, png)
└── docs/                     # Documentation
```

---

## 📜 Licence

GPL-2.0 — comme PokerTH lui-même.

---

## 🙏 Crédits

- [PokerTH](https://www.pokerth.net/) — le serveur et protocole open source
- Développé avec ❤️ par [narmod](https://github.com/narmod)
