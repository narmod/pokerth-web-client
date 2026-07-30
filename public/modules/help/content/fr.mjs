// ── help/content/fr.mjs — Corpus d'aide français (Lot 1) ────────────────────
// Traduction de en.mjs (référence). Structure et ids identiques ; seuls
// t / b / list / keys (libellés) / note sont traduits. Les termes de poker
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) restent en
// anglais, conformément à la convention de l'application.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Premiers pas',
      sections: [
        { id: 'modes', t: 'Trois façons de jouer',
          b: ['Depuis l\u2019écran de connexion, choisis comment tu veux jouer.'],
          list: [
            'Internet — joue en ligne sur le serveur officiel pokerth.net, avec classements. Un compte pokerth.net est requis ; l\u2019inscription est gratuite sur pokerth.net.',
            'Local / entraînement — joue hors ligne contre des bots. Rien à configurer, fonctionne sans connexion, et débloque des trophées au fil de ta progression.',
            'LAN / serveur dédié — connecte-toi à un serveur PokerTH privé sur ton réseau local ou ta propre machine.'] },
        { id: 'lan', t: 'LAN / serveur dédié',
          b: ['Le troisième mode se connecte à n\u2019importe quel serveur PokerTH que toi ou un ami faites tourner — sur un réseau domestique, un VPS privé, où tu veux. Saisis l\u2019adresse et le port du serveur, coche TLS si le serveur utilise un port chiffré, et connecte-toi avec un pseudo (l\u2019accès invité fonctionne si le serveur l\u2019autorise). Tout se passe ensuite à table exactement comme sur le serveur officiel.'] },
        { id: 'famboard', t: 'Classement familial',
          b: ['Sur les serveurs privés et les parties LAN uniquement, le client conserve des statistiques cumulées par pseudo — mains et parties jouées et gagnées, plus gros gain, meilleure série — et les partage via le serveur pour que chaque appareil autour de la table voie le même classement. Les parties pokerth.net ne sont jamais suivies de cette façon, et les statistiques du mode entraînement restent complètement séparées.'] },
        { id: 'language', t: 'Langue',
          b: ['L\u2019interface est disponible en 36 langues. Change-la à tout moment dans les Options avancées (menu roue crantée), catégorie Interface utilisateur. Les termes d\u2019action du poker (Fold, Check, Call, Bet, Raise, All-In) restent en anglais par convention, exactement comme dans le client de bureau.'] },
        { id: 'pwa', t: 'Installer comme application',
          b: ['Ce client est une Progressive Web App : tu peux l\u2019installer depuis le menu de ton navigateur (ou le bouton d\u2019installation du header) pour obtenir une application plein écran avec sa propre icône. Une fois installée, elle démarre instantanément et le mode entraînement fonctionne entièrement hors ligne.'],
          note: 'Sur Android et sur Chrome/Edge de bureau, le bouton d\u2019installation fait tout. Sur iPhone/iPad, Apple n\u2019autorise l\u2019installation que via Safari : bouton Partager \u2192 « Sur l\u2019écran d\u2019accueil » — le client affiche ces étapes quand il le faut. Le bouton disparaît une fois l\u2019application installée.' },
        { id: 'platforms', t: 'Plateformes et navigateurs',
          b: ['Le client fonctionne dans tout navigateur moderne sur tout système — Windows, macOS, Linux, Android, iOS. Quelques fonctions reposent sur des API récentes des navigateurs ; quand une API manque, la fonction se masque ou s\u2019explique au lieu de casser. Les principales différences à connaître :'],
          list: [
            'Chrome / Edge (bureau) : tout fonctionne, y compris l\u2019écriture du journal .pdb dans un dossier.',
            'Firefox : tout, sauf l\u2019écriture du .pdb dans un dossier (API pas encore disponible).',
            'Safari / iOS : installation via Partager \u2192 « Sur l\u2019écran d\u2019accueil » ; pas de vibration ; plein écran limité sur iPhone ; le son démarre après ton premier appui.',
            'Android : support complet dans les navigateurs Chromium, vibration et comportement du bouton Retour compris.'] },
        { id: 'avatar', t: 'Pseudo et avatar',
          b: ['Choisis ton pseudo et ton avatar sur l\u2019écran de connexion avant de te connecter. Sur pokerth.net, ton pseudo est le nom de ton compte ; les avatars sont partagés avec les autres joueurs via le serveur d\u2019avatars.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Règles du poker',
      sections: [
        { id: 'basics', t: 'Le Texas Hold\u2019em en bref',
          b: ['PokerTH se joue en Texas Hold\u2019em No-Limit. Chaque joueur reçoit deux cartes privées (les hole cards). Cinq cartes communes sont ensuite distribuées face visible au milieu de la table. La meilleure main de cinq cartes composée de n\u2019importe quelle combinaison de tes deux cartes et des cinq cartes communes remporte le pot.'] },
        { id: 'blinds', t: 'Les blinds et le bouton du donneur',
          b: ['Avant chaque main, deux mises obligatoires amorcent le pot : la small blind et la big blind, posées par les deux joueurs à gauche du bouton du donneur. Le bouton avance d\u2019un siège dans le sens horaire après chaque main, si bien que tout le monde paie les blinds à tour de rôle. Les blinds augmentent à intervalles réguliers au fil de la partie.',
              'Sur la table, le bouton et les blinds sont marqués par des jetons : D (donneur), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Les quatre tours d\u2019enchères',
          list: [
            'Pre-flop — après la distribution des cartes privées, le premier tour d\u2019enchères démarre à gauche de la big blind.',
            'Flop — trois cartes communes sont révélées, suivies d\u2019un tour d\u2019enchères.',
            'Turn — une quatrième carte commune, puis un autre tour d\u2019enchères.',
            'River — la cinquième et dernière carte commune, puis le tour d\u2019enchères final.'],
          b: ['Un tour d\u2019enchères se termine quand chaque joueur encore dans la main a mis le même montant dans le pot (ou est all-in).'] },
        { id: 'actions', t: 'Ce que tu peux faire à ton tour',
          list: [
            'Fold — abandonner la main. Tes cartes sont couchées et tu ne joues plus pour le pot.',
            'Check — passer sans miser. Possible uniquement quand il n\u2019y a rien à suivre.',
            'Call — suivre la mise en cours.',
            'Bet — ouvrir les enchères quand personne n\u2019a encore misé sur cette street.',
            'Raise — relancer par-dessus une mise existante. La relance minimale égale la mise ou la relance précédente.',
            'All-In — mettre tout ton tapis. Tu restes dans la main à hauteur du montant que tu as couvert.'] },
        { id: 'showdown', t: 'Abattage et pots partagés',
          b: ['Si plusieurs joueurs restent après le tour d\u2019enchères de la river, les mains sont révélées et la meilleure l\u2019emporte — la combinaison gagnante est affichée sous les cartes communes. Quand un joueur est all-in pour moins que les mises complètes, des pots secondaires sont créés : chaque joueur ne peut gagner que la partie du pot à laquelle il a contribué. Les mains égales se partagent le pot.'] },
        { id: 'hands', t: 'Classement des mains',
          b: ['De la plus faible à la plus forte :'],
          list: [
            '1. High Card — aucune combinaison ; la carte la plus haute décide.',
            '2. Pair — deux cartes de même rang.',
            '3. Two Pair — deux paires différentes.',
            '4. Three of a Kind — trois cartes de même rang.',
            '5. Straight — cinq cartes qui se suivent (l\u2019As compte haut ou bas).',
            '6. Flush — cinq cartes de la même couleur.',
            '7. Full House — un brelan plus une paire.',
            '8. Four of a Kind — quatre cartes de même rang.',
            '9. Straight Flush — une quinte, entièrement dans une seule couleur.',
            '10. Royal Flush — du Dix à l\u2019As, dans une seule couleur. La meilleure main possible.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'L\u2019écran de jeu',
      sections: [
        { id: 'actionbar', t: 'La barre d\u2019action',
          b: ['Quand c\u2019est ton tour, la barre d\u2019action en bas s\u2019allume avec jusqu\u2019à quatre boutons : Fold (rouge), Check / Call (bleu), Bet / Raise (vert — l\u2019action primaire, mise en avant) et All-In (rouge sombre). Le bouton Check / Call affiche le montant exact à suivre ; Bet / Raise affiche le montant que tu t\u2019apprêtes à mettre. Après la river, All-In peut devenir un bouton Show pour révéler tes cartes.'] },
        { id: 'betctl', t: 'Choisir ta mise',
          b: ['Règle le montant de la relance avec le champ numérique, le slider, ou les boutons rapides 1/3 \u00b7 1/2 \u00b7 Pot (fractions du pot en cours). Les montants sont automatiquement arrondis et maintenus entre la relance minimale et maximale légale. Si tu préfères raisonner en big blinds, une option affiche tous les montants en BB plutôt qu\u2019en jetons.'] },
        { id: 'preselect', t: 'Pré-sélectionner une action',
          b: ['Avant ton tour, tu peux armer une action à l\u2019avance : touche un bouton et il prend un bord doré avec un petit point doré. Quand ton tour arrive, l\u2019action se joue instantanément. Un Fold pré-armé devient automatiquement un Check quand le check est gratuit — tu ne te couches jamais pour rien. Les pré-sélections se réinitialisent à chaque nouvelle main, changement de street et abattage, et sont annulées si la situation change (par exemple si le montant à suivre change).'] },
        { id: 'automodes', t: 'Modes automatiques',
          b: ['La liste déroulante à côté des boutons d\u2019action propose trois modes de jeu : Manuel, Auto Check/Call et Auto Check/Fold. Les modes auto jouent pour toi jusqu\u2019à ce que tu reviennes en arrière — tout clic manuel sur une action repasse immédiatement en Manuel.'] },
        { id: 'readtable', t: 'Lire la table',
          b: ['Chaque boîte de joueur montre l\u2019avatar, le nom, le tapis et la mise en cours. Le donneur et les blinds sont marqués par des jetons D / SB / BB. Un badge coloré sur la boîte indique la dernière action du joueur ; une fine barre bleue décompte son temps de réflexion. La boîte du joueur dont c\u2019est le tour s\u2019illumine ; ta propre boîte prend un cadre doré pulsant à ton tour.',
              'La barre d\u2019état au-dessus de la table affiche le pot total, les mises de la street en cours, la phase (Pre-flop, Flop, Turn, River) et les numéros de partie et de main. Les joueurs couchés ont des cartes translucides ; les joueurs éliminés sont grisés. En fin de main, une fenêtre du vainqueur peut résumer qui a gagné quoi — elle se désactive dans les options.'] },
        { id: 'seatlayout', t: 'Placement des sièges',
          b: ['Extension web : la disposition des boîtes de joueurs se choisit dans Options avancées \u2192 Sièges. Automatique suit le client officiel (emplacements fixes en portrait, ellipse calculée en paysage), ou force la disposition Portrait ou Paysage — et Personnalisé te laisse placer chaque siège toi-même : un mode édition apparaît où tu glisses chaque boîte exactement où tu veux, et la disposition est enregistrée.'] },
        { id: 'zoom', t: 'Zoom de table (téléphones)',
          b: ['Sur petit écran, des boutons loupe zooment la table (2\u00d7) et tu peux la faire défiler au doigt — ta propre boîte et la barre d\u2019action restent fixes. La vue suit automatiquement le siège actif et dézoome à l\u2019abattage pour la vue d\u2019ensemble. Désactivable dans les Options avancées.'],
          note: 'Sur téléphones et tablettes, le zoom par pincement du navigateur lui-même est bloqué par défaut pour qu\u2019un geste de zoom ne parte jamais par accident en pleine main ; réactive-le dans Options avancées \u2192 Interface utilisateur si tu préfères.' },
        { id: 'protections', t: 'Anti-regard et protection anti-Call accidentel',
          b: ['Deux protections optionnelles : l\u2019anti-regard garde tes propres cartes masquées jusqu\u2019à ce que tu les touches (utile quand quelqu\u2019un peut voir ton écran), et la garde anti-Call accidentel bloque brièvement le bouton Call juste après une grosse relance, pour qu\u2019un appui visant un Call plus petit ne tombe pas par accident sur le montant relancé. Les deux vivent dans les Options avancées.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Panneau info',
      sections: [
        { id: 'open', t: 'Ouvrir le panneau',
          b: ['En partie, le panneau info s\u2019ouvre depuis le header (ou Alt+L / Alt+I) et comporte trois onglets : Historique, Chances et Stats. Sur téléphone il flotte au-dessus de la table ; sur écran plus grand c\u2019est une fenêtre déplaçable et redimensionnable — attrape la poignée \u28ff pour la déplacer, les bords pour la redimensionner. Sa position est mémorisée.'] },
        { id: 'log', t: 'Journal de partie',
          b: ['L\u2019onglet Historique enregistre toute la partie main par main : blinds, chaque action avec les montants, cartes révélées et vainqueurs, le tout en couleurs pour une lecture rapide. Le bouton d\u2019export enregistre le journal dans un fichier si tu veux revoir une session plus tard.'] },
        { id: 'odds', t: 'Chances (moniteur de probabilités)',
          b: ['L\u2019onglet Chances montre, pour ta main en cours, la probabilité en direct de finir avec chacune des 10 catégories de mains — de High Card à Royal Flush — chacune avec son icône, son pourcentage et sa barre. L\u2019affichage se grise dès que tu te couches. Il n\u2019utilise jamais que tes propres cartes et les cartes communes : il ne voit rien que tes adversaires ne montrent pas.'] },
        { id: 'journal', t: 'Journaux de mains et fenêtre « Logs »',
          b: ['Au-delà de l\u2019historique en direct, chaque main que tu joues est enregistrée localement dans ton navigateur, au même format que les fichiers de journal .pdb du client officiel. La fenêtre Logs (Options avancées \u2192 Messages de log \u2192 Gérer les logs\u2026) liste tes sessions et te permet de travailler avec : prévisualiser une session avec recherche et surlignage, filtrer par partie, exporter en HTML ou en texte brut, enregistrer le fichier .pdb brut, ou importer un .pdb enregistré par le client de bureau. Les sessions se suppriment une par une ou toutes d\u2019un coup (avec confirmation), et un réglage de rétention automatique peut ne garder que les 7, 30, 90, 180 ou 365 derniers jours. Les journaux que vous importez ne sont jamais supprimés automatiquement. Un second réglage plafonne le nombre de sessions conservées, et la colonne de la liste s’élargit en la tirant.',
              'Le bouton Analyser lance une analyse de mains sur une session et peut envoyer un journal au service d\u2019analyse de pokerth.net. Tout reste sur ton appareil tant que tu n\u2019exportes ou n\u2019envoies pas explicitement.'] },
        { id: 'logopts', t: 'Options de journalisation',
          b: ['Dans Options avancées \u2192 Messages de log, tu peux activer ou couper la journalisation et choisir l\u2019intervalle d\u2019écriture, avec les trois mêmes réglages que le client de bureau : après chaque action, après chaque main (le défaut) ou après chaque partie. Une autre option écrit le fichier .pdb dans un dossier de ton choix et le tient à jour à cet intervalle, plus une dernière fois quand tu quittes la page, pour qu\u2019un autre outil puisse suivre la partie en direct.'],
          note: 'L\u2019écriture dans un dossier local nécessite l\u2019API File System Access : Chrome, Edge et Opera de bureau uniquement. Ailleurs, l\u2019option affiche une courte explication et l\u2019export manuel depuis la fenêtre Logs reste disponible. Un navigateur ne peut que remplacer un fichier, jamais y ajouter, donc un outil qui lit le .pdb doit le rouvrir après chaque changement.' },
        { id: 'assist', t: 'Assistance (force de main)',
          b: ['En haut de l\u2019onglet Chances, le bandeau d\u2019assistance lit ta main pour toi. Avant le flop, il nomme ta main de départ et la note avec des étoiles ; à partir du flop, il montre ta meilleure combinaison courante et, après une simulation rapide, ta chance estimée de gagner la main en pourcentage, avec une jauge de couleur du rouge (faible) au vert (fort). Comme le moniteur de probabilités, il n\u2019utilise que l\u2019information que tu peux voir.',
              'Deux styles d\u2019affichage sont disponibles dans Options avancées \u2192 Sièges : Segments (dix blocs) ou une barre de progression classique. Toute la fonction d\u2019assistance se désactive dans Options avancées \u2192 Assistance.'] },
        { id: 'assistwin', t: 'L\u2019assistance en widget flottant',
          b: ['Le bloc d\u2019assistance peut être détaché du panneau dans sa propre petite fenêtre toujours au premier plan : utilise le bouton de détachement sur le bloc, puis déplace-la et redimensionne-la n\u2019importe où au-dessus de la table — pratique pour garder un œil sur ta force de main sans le panneau complet ouvert. Le bouton d\u2019ancrage la remet dans l\u2019onglet Chances, et sa position est mémorisée. Dans le panneau, une poignée de glissement entre Assistance et les probabilités te laisse répartir l\u2019espace entre les deux.'] },
        { id: 'stats', t: 'Stats',
          b: ['L\u2019onglet Stats suit ta session : mains jouées, flops vus, abattages, taux de gains et plus. Le suivi statistique se désactive dans les Options avancées.'] },
        { id: 'hud', t: 'HUD de stats sur les sièges (bêta)',
          b: ['Le HUD attache une petite boîte de statistiques à côté du siège de chaque joueur, construite à partir des mains que tu as enregistrées dans tes journaux : nombre de mains observées, puis VPIP (fréquence à laquelle il met volontairement de l\u2019argent pre-flop), PFR (relances pre-flop), AF (facteur d\u2019agressivité), 3B (3-bet), CB (continuation bet) et F3B (fold face au 3-bet), avec un code couleur du passif à l\u2019agressif. Touche une boîte pour un popover détaillé avec plus de chiffres (tentatives de vol, fold face au vol, taux d\u2019abattage\u2026), et fais-la glisser si elle masque quelque chose.',
              'Le HUD ne connaît que ce que tu as vu à tes propres tables — il lit tes journaux de mains locaux, la journalisation doit donc être active et les chiffres deviennent significatifs après suffisamment de mains. C\u2019est une fonction bêta, désactivée par défaut : active-la dans Options avancées \u2192 Assistance.'] },
        { id: 'handsbtn', t: 'Aperçu des combinaisons',
          b: ['L\u2019icône des mains de poker sur le tapis ouvre à tout moment un aperçu rapide des 10 combinaisons — pratique pendant l\u2019apprentissage. Elle se masque dans les Options avancées.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat & social',
      sections: [
        { id: 'panels', t: 'Chat du lobby et chat de table',
          b: ['Il y a un chat dans le lobby et un à la table. Sur téléphone, le chat de table flotte au-dessus du jeu ; sur écran plus grand, c\u2019est une fenêtre déplaçable et redimensionnable. Un badge sur le bouton du chat compte les messages non lus.'] },
        { id: 'typing', t: 'Aides à la saisie',
          list: [
            'Tab complète un pseudo — appuie encore sur Tab pour parcourir les correspondances.',
            '\u2191 / \u2193 parcourent l\u2019historique de tes propres messages.',
            'Le bouton emoji ouvre un sélecteur complet ; taper : suggère aussi des émoticônes au fil de la frappe.'] },
        { id: 'emotes', t: 'Émoticônes et smileys',
          b: ['Le chat convertit les codes d\u2019émoticônes exactement comme le client de bureau officiel : tape un nom entre deux-points et il devient l\u2019emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 plus de 1\u202f900 codes sont pris en charge (le jeu complet GitHub). Les smileys texte classiques sont aussi convertis : :-) ;) :D xD :P <3 et environ quatre-vingts autres.',
              'Taper : ouvre un popup de suggestions qui complète le code au fil de la frappe (\u2191/\u2193 pour choisir, Tab ou Entrée pour accepter). La conversion des emojis se désactive entièrement dans Options avancées \u2192 Chat.'] },
        { id: 'commands', t: 'Commandes de chat',
          b: ['Le chat comprend des commandes commençant par une barre oblique. Deux sont visibles des autres :'],
          keys: [
            ['/me <texte>', 'Message d\u2019action, affiché « * tonpseudo texte »'],
            ['/emoji <emoji>', 'Joue une réaction emoji (ce que le sélecteur de réactions envoie)']] },
        { id: 'diagcmds', t: 'Commandes de diagnostic',
          b: ['Tout le reste est local : les réponses ne sont visibles que de toi et rien n\u2019est envoyé à la table. Tape /help pour toutes les lister. Les plus utiles :'],
          keys: [
            ['/help', 'Lister toutes les commandes'],
            ['/update', 'Vérifier s\u2019il y a une nouvelle version et rafraîchir'],
            ['/lang <code>', 'Changer de langue (ex. /lang fr)'],
            ['/sound on|off', 'Activer/couper les sons du jeu'],
            ['/zoom', 'Basculer la loupe de table'],
            ['/clear', 'Vider le chat localement'],
            ['/table', 'Infos de la partie en cours (blinds, joueurs, tapis)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostics d\u2019état du client, du réseau et de la fluidité'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Débogage avancé (cartes, protocole, audio, stockage, sièges)'],
            ['/copy', 'Copier la dernière réponse de commande dans le presse-papiers']] },
        { id: 'reactions', t: 'Réactions emoji',
          b: ['Le bouton de réaction ouvre un sélecteur de 30 réactions animées (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) qui se jouent avec un effet au-dessus de ton siège, visibles de toute la table — y compris des joueurs sur le client de bureau. Les réactions se désactivent entièrement dans les Options avancées.'] },
        { id: 'translate', t: 'Comprendre tout le monde',
          b: ['Avec la traduction du chat activ\u00e9e, un bouton de traduction appara\u00eet sur la ligne sous le pointeur \u2014 ou sur la ligne que tu touches, sur \u00e9cran tactile \u2014 et affiche ce message dans ta langue via le traducteur du navigateur. Il peut rester visible en permanence sur toutes les lignes depuis Options avanc\u00e9es \u2192 Chat, o\u00f9 vit aussi l\u2019infobulle qui explique les abr\u00e9viations courantes de table (gg, nh, utg\u2026).'],
          note: 'La traduction utilise le service Google Translate et fonctionne dans tous les navigateurs — il faut juste une connexion internet. Un message n\u2019est envoyé au service de traduction que lorsque tu touches son bouton de traduction, jamais automatiquement.' },
        { id: 'social', t: 'Joueurs : profil, inviter, ignorer',
          b: ['Touche n\u2019importe quel joueur — à la table ou dans la liste du lobby — pour ouvrir sa fiche : profil et statistiques, l\u2019inviter à ta partie, ou l\u2019ignorer (ses messages de chat sont masqués ; ignorer est réversible à tout moment). Une confirmation avant inviter/ignorer peut être activée dans les options.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby & parties',
      sections: [
        { id: 'list', t: 'La liste des parties',
          b: ['Le lobby liste toutes les tables du serveur. Chaque entrée montre le nombre de joueurs, le type de partie, un cadenas quand un mot de passe ou une invitation est requis, et un badge d\u2019état : « En attente » (vert — la partie n\u2019a pas démarré, tu peux rejoindre s\u2019il reste un siège), « En cours » (couleur chaude — regardable en direct quand les spectateurs sont autorisés) et « Fermée » (grisé). Une table pleine se voit simplement à son compteur complet, comme 10/10 ; les couleurs des badges suivent le thème actif.',
              'La liste déroulante de filtre réduit la liste exactement comme le client de bureau, chaque choix plus strict que le précédent : parties ouvertes seulement \u2192 en masquant aussi les tables pleines \u2192 puis seulement les non privées, seulement les privées, ou seulement les parties classées. Ton choix est mémorisé. Le champ de recherche trouve une partie par son nom, et la pastille des joueurs ouvre la liste de tous les connectés, cherchable et triable.'] },
        { id: 'join', t: 'Rejoindre et regarder',
          b: ['Sélectionne une partie ouverte et rejoins-la — un cadenas signale qu\u2019un mot de passe est requis. Les parties en cours qui autorisent les spectateurs peuvent être regardées en direct : tu vois la table et le chat, mais les cartes privées restent cachées et tu ne peux pas agir.'] },
        { id: 'gameinfo', t: 'Infos de partie',
          b: ['Avant de rejoindre, la fiche d\u2019infos de la partie montre tout ce qui définit la table : type de partie, blinds et leur progression (doublement ou liste manuelle), tapis de départ, délai d\u2019action, pause entre les mains, et qui est déjà assis.'] },
        { id: 'create', t: 'Créer une partie',
          b: ['Crée ta propre table : nom, nombre de joueurs, tapis de départ, première small blind et progression des relances, délai d\u2019action, et si les spectateurs sont autorisés. Quatre types de parties existent : Normale (tout le monde), joueurs enregistrés uniquement, sur invitation uniquement, et Classée (compte pour le classement officiel — pas de mot de passe possible dans ce cas). Tes réglages favoris peuvent être enregistrés et rechargés.'] },
        { id: 'invites', t: 'Invitations',
          b: ['Les joueurs peuvent t\u2019inviter à leur table ; tu reçois une notification que tu peux accepter ou refuser. Être invité est la seule façon d\u2019entrer dans une partie sur invitation.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Ton compte',
          b: ['Le serveur Internet officiel est pokerth.net. Y jouer nécessite un compte pokerth.net gratuit — inscris-toi sur le site, puis connecte-toi ici avec les mêmes pseudo et mot de passe. Ce client web se connecte au même serveur que le client de bureau : mêmes comptes, mêmes tables, mêmes classements, et tu peux t\u2019asseoir à une table avec des joueurs du client de bureau.'] },
        { id: 'ranked', t: 'Parties classées et saisons',
          b: ['Les parties de type Classée comptent pour le classement officiel de la saison. Ton profil dans l\u2019application montre ta date d\u2019inscription, ton Rang de la saison en cours, ton Score, ta moyenne et tes parties jouées, plus tes derniers résultats. Les parties normales (non classées) sont juste pour le plaisir et ne changent rien.'] },
        { id: 'rankhow', t: 'Comment le classement est calculé',
          b: ['À chaque partie classée, ta place rapporte des points : 15 pour la première, puis 9, 6, 4, 3, 2 et 1 jusqu\u2019à la septième ; de la huitième à la dixième, rien. Une table distribue donc 40 points en tout.',
              'Ton Score n\u2019est pas la somme de ces points, mais ta moyenne par partie tempérée par un facteur qui monte avec le nombre de parties jouées : quelques bons résultats ne suffisent pas à s\u2019installer en haut du classement, il faut aussi de la régularité — plus tu joues, plus ton Score se rapproche de ta vraie moyenne. Les saisons durent un trimestre : à la bascule, tout est archivé et les compteurs repartent de zéro, les saisons passées restant consultables. En jeu, le bouton podium montre le classement de saison des joueurs présents à ta table.'],
          note: 'Le barème et la formule exacte sont fixés par le serveur de classement de pokerth.net et peuvent évoluer ; les pages du site font foi.' },
        { id: 'rankings', t: 'Pages de classement',
          b: ['L\u2019entrée classement ouvre le classement officiel PokerTH, cherchable par joueur, ainsi que les classements communautaires (BBC, WEC). Si les classements ne t\u2019intéressent pas, l\u2019entrée se masque dans Options avancées \u2192 Communauté.'] },
        { id: 'cups', t: 'Les coupes communautaires : BBC et WeCup',
          b: ['Deux communautés organisent leurs propres compétitions sur pokerth.net, chacune avec son site et son classement. La Best Brainies Cup (BBC) est un tournoi à étapes né en 2013 : on progresse de Step 1 à Step 4, et une nouvelle saison démarre après chaque partie de Step 4, quand la coupe est remise. La WeCup (WEC) a son propre barème, nettement plus étalé — 75 points pour la première place, puis 45, 30, 20… — et son score normalise ta moyenne selon le nombre de parties que tu as jouées par rapport aux autres membres.',
              'Les deux classements s\u2019ouvrent depuis le bouton trophée, à côté du classement PokerTH. Les réglages de table de ces compétitions sont fournis comme préréglages à la création d\u2019une partie (BBC Step 1 à 4, WEC, WEC Monthly Final et WEC Grand Final), donc tu peux t\u2019entraîner dans les mêmes conditions. Participer demande une inscription sur le site de la coupe concernée.'],
          note: 'Ces contenus se masquent d\u2019un coup dans Options avancées → Communauté si les coupes ne t\u2019intéressent pas.' },
        { id: 'forumcups', t: 'Coupes du forum et événements',
          b: ['Le forum pokerth.net accueille aussi la Monthly Cup, une série mensuelle où les joueurs se répartissent sur des tables Gold, Silver et Bronze avant que le champion du mois soit désigné, ainsi que des coupes spéciales ponctuelles au fil de l\u2019année.',
              'Inscriptions, horaires, réglages de table et résultats se publient sur le forum, et les parties se jouent sur le serveur officiel comme n\u2019importe quelle autre. Un compte pokerth.net suffit pour suivre les résultats ; s\u2019inscrire à une coupe passe par le fil du forum correspondant.'] },
        { id: 'avatars', t: 'Avatars et drapeaux',
          b: ['Sur pokerth.net, ton avatar est distribué aux autres joueurs via le serveur d\u2019avatars, et un petit drapeau de pays peut s\u2019afficher sur les boîtes de joueurs. Les deux sont optionnels et configurables dans les options.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Mode entraînement',
      sections: [
        { id: 'what', t: 'Ce que c\u2019est',
          b: ['Le mode Local / entraînement est une partie complète contre des adversaires contrôlés par l\u2019ordinateur : pas de connexion, pas de compte, rien en jeu. Une fois l\u2019application installée (ou simplement visitée une fois), il fonctionne entièrement hors ligne — parfait pour apprendre le jeu, tester l\u2019interface ou passer le temps en mode avion.'] },
        { id: 'setup', t: 'Configurer une partie',
          b: ['Choisis le nombre d\u2019adversaires, le tapis de départ, les blinds et leur progression, et la vitesse de jeu. La composition et la difficulté des bots se règlent dans Options avancées \u2192 Partie locale — d\u2019adversaires doux à une table plus coriace et variée.'] },
        { id: 'trophies', t: 'Trophées',
          b: ['Le mode entraînement a sa propre progression : 28 trophées répartis en six catégories (progression, technique, style, formats, fun et une secrète) se débloquent en jouant — mains jouées, parties gagnées, gros bluffs, mains spéciales et plus. Ta progression de trophées est cumulative et fusionne entre appareils quand la synchronisation des réglages de compte est active.'] },
        { id: 'learn', t: 'Un bon endroit pour apprendre',
          b: ['Tout ce qui est décrit dans les autres chapitres fonctionne ici aussi : le moniteur de probabilités, l\u2019affichage d\u2019assistance, la pré-sélection, les raccourcis clavier. Le mode entraînement est le meilleur endroit pour les essayer sans pression avant de partir sur pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Style & son',
      sections: [
        { id: 'themes', t: 'Thèmes',
          b: ['La catégorie Style des Options avancées rhabille tout le client. Les préréglages règlent tout d\u2019un seul geste (le casino vert classique, le look PokerTH officiel\u2026) ; en dessous, des axes individuels affinent séparément la palette de couleurs, le tapis de la table et les faces des cartes — modifie n\u2019importe quel axe et ton mélange devient un thème personnalisé. Le mode sombre, clair ou automatique se choisit dans Interface utilisateur, et tes choix s\u2019appliquent instantanément, sur chaque écran, et sont mémorisés.'] },
        { id: 'tablelook', t: 'Tables, decks, sièges',
          b: ['Au-delà du thème, plusieurs éléments se remplacent indépendamment : le fond de table, le deck de cartes, le dos des cartes (assorti au deck automatiquement, ou importe ta propre image), les jetons de donneur et de blinds, le style des boutons d\u2019action, et des packs de sièges complets qui rhabillent les boîtes de joueurs. Choisis tout dans Options avancées \u2192 Style ; les changements sont visibles immédiatement à la table.'] },
        { id: 'music', t: 'Lecteur de musique',
          b: ['L\u2019entrée musique des menus du header ouvre un petit lecteur de musique d\u2019ambiance : choisis un morceau dans la playlist, lecture/pause, précédent/suivant, aléatoire, et répétition d\u2019un morceau, de toute la playlist ou de rien. Le volume, le morceau sélectionné et le mode de répétition sont mémorisés. La lecture ne démarre jamais toute seule — les navigateurs exigent un appui — et le lecteur est entièrement indépendant des effets sonores du jeu.'] },
        { id: 'sounds', t: 'Effets sonores',
          b: ['Les sons du jeu sont regroupés en quatre catégories activables séparément, exactement comme dans le client de bureau : actions de jeu (cartes distribuées, Check, Call, Raise, ton tour\u2026), notification du chat du lobby, notifications de partie réseau (joueur arrivé, partie prête) et notification de hausse des blinds. Un seul curseur de volume les contrôle tous, dans Options avancées \u2192 Son.'],
          note: 'Tous les navigateurs — iOS en particulier — refusent de jouer du son avant que tu aies touché la page une fois. Si une partie démarre en silence, un seul appui n\u2019importe où réveille le son ; le client répare aussi automatiquement le moteur audio quand iOS le suspend (appel entrant, passage en arrière-plan\u2026).' },
        { id: 'voice', t: 'Voix et vibration',
          b: ['Deux canaux supplémentaires peuvent te tenir informé sans regarder l\u2019écran : les annonces vocales lisent à voix haute les événements du jeu via la synthèse vocale de ton appareil, et sur téléphone une courte vibration peut marquer ton tour. Les deux sont des extensions web, actives ou non par défaut selon l\u2019appareil, dans Options avancées \u2192 Mises & tour.'],
          note: 'La vibration fonctionne sur Android (navigateurs Chromium) ; Apple n\u2019expose pas d\u2019API de vibration aux sites web, les iPhone ne peuvent donc pas vibrer. Les annonces vocales fonctionnent partout, mais les voix et langues disponibles dépendent de ton système — le client utilise la meilleure correspondance qu\u2019il trouve.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Options & raccourcis',
      sections: [
        { id: 'where', t: 'Où vivent les options',
          b: ['Les Options avancées s\u2019ouvrent depuis l\u2019entrée roue crantée de n\u2019importe quel menu de header. Elles sont regroupées comme dans le client de bureau : Interface utilisateur, Style, Son, Partie locale, Partie réseau, Partie Internet, Pseudos / Avatars, Messages de log, et Restaurer les défauts. Chaque fonction spécifique au web y a son propre interrupteur, pour que tu puisses désactiver tout ce que tu n\u2019utilises pas.'] },
        { id: 'cfgxml', t: 'Échanger ses réglages avec le client de bureau',
          b: ['Tes réglages peuvent voyager entre clients : la catégorie Messages de log propose un export/import du fichier config.xml officiel (le \u007e/.pokerth/config.xml utilisé par les clients de bureau et QML). L\u2019export écrit les réglages partagés — nom, options d\u2019affichage, sons, préférences de table, blinds, styles — et l\u2019import applique ici un fichier venu du bureau. Les réglages que ce client ne connaît pas sont préservés intacts dans le fichier.'] },
        { id: 'sync', t: 'Des réglages qui te suivent',
          b: ['Quand tu joues avec un compte, tes options, ton thème, tes raccourcis clavier, ta langue et tes trophées d\u2019entraînement sont synchronisés : change quelque chose sur un appareil et le prochain appareil depuis lequel tu te connectes le récupère. La progression des trophées est fusionnée, jamais écrasée, donc jouer sur deux appareils garde toujours le meilleur des deux.'] },
        { id: 'updates', t: 'Rester à jour',
          b: ['Le client se met à jour tout seul : quand une nouvelle version est déployée, une bannière t\u2019invite à rafraîchir (ou tape /update dans le chat pour vérifier manuellement). De temps en temps, un petit sondage produit peut apparaître pour demander ton avis sur une fonction — participer est optionnel et les sondages se désactivent entièrement dans Options avancées \u2192 Communauté.'] },
        { id: 'fkeys', t: 'Raccourcis clavier officiels',
          b: ['Les touches de fonction officielles de PokerTH fonctionnent pendant une partie \u2014 Alt+S fonctionne partout :'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (ordre inversable dans les options)'],
            ['F5', 'Montrer tes cartes (quand c\u2019est possible)'],
            ['F6 / F7 / F8', 'Manuel \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manuel \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Historique \u00b7 Panneau des chances'],
            ['Alt+S', 'R\u00e9glages \u2014 partout dans l\u2019application, pas seulement en partie'],
            ['F11', 'Plein écran']],
          note: 'Les raccourcis exigent un clavier physique. Sur Mac, les touches F pilotent les médias par défaut : maintiens Fn (ou active « Utiliser les touches F1, F2, etc. comme touches de fonction standard » dans les réglages macOS). Sur iPhone, le plein écran est limité par iOS — installer l\u2019application en PWA donne la même expérience plein écran.' },
        { id: 'webkeys', t: 'Touches lettres du web',
          b: ['Extension web : les touches d\u2019une seule lettre et Alt+T d\u00e9clenchent aussi les actions, et toutes se r\u00e9assignent dans Options avanc\u00e9es \u2192 Raccourcis clavier :'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Panneau de statistiques'],
            ['Échap', 'Fermer la fenêtre au premier plan (aussi le bouton Retour Android)']],
          note: 'Sur Android, le bouton/geste Retour du système ferme les fenêtres comme Échap au lieu de quitter la partie (configurable dans les options). iOS n\u2019a pas de bouton système équivalent — utilise le \u2715 de chaque fenêtre.' }
      ]
    }
  ]
};
