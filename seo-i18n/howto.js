'use strict';
// Translations for the /how-to-play page. Same policy and same reason for
// living outside proxy.js as seo-i18n/hands.js — see the header there.
//
// English is not in this file. It lives in seoHowToPage() in proxy.js and is
// the fallback for every language still missing below.
//
// Shape per language:
//   title, desc            <title> and <meta name="description">
//   ldHeadline, ldDesc     JSON-LD HowTo name and description
//   h1                     page heading
//   lead(href)             opening paragraph; receives the link resolver, so
//                          the pointers to the rules and the hand rankings
//                          stay in the reader's language
//   steps[6]               [title, text] per step, in the order of _SEO_HOWTO
//   phoneH2, phoneP        playing on a phone
//   friendsH2, friendsP    playing with friends
//   faqH2, faqP(href)      closing note, links to the FAQ
//
// The JSON-LD HowTo steps in proxy.js are built from _SEO_HOWTO, which is
// English: structured data describes the procedure, and the visible page is
// what the reader actually gets. Translating the markup as well would be an
// improvement, not a correctness fix, and is not done here.

var PARTS = {

  fr: {
    title: "Comment jouer au poker en ligne gratuitement — PokerTH Web",
    desc: "Pas à pas : jouez au poker Texas Hold’em gratuitement dans votre navigateur, sans téléchargement ni compte — hors ligne contre des bots, sur le réseau officiel pokerth.net ou à une table privée entre amis.",
    ldHeadline: "Comment jouer gratuitement au poker Texas Hold’em dans son navigateur",
    ldDesc: "Guide pas à pas pour jouer gratuitement au Texas Hold’em dans le client web PokerTH.",
    h1: "Comment jouer au poker en ligne, gratuitement, dans votre navigateur",
    lead: function (h, c) { return "Voici la version courte, de l’onglet vide à votre première main de Texas Hold’em sur PokerTH. Si ce sont les règles elles-mêmes qui vous intéressent — blindes, tours d’enchères, ce qui bat quoi — commencez plutôt par la <a href=\"{rules}\">page des règles</a> et les <a href=\"{hands}\">combinaisons</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Ouvrez le site — il n’y a rien à installer",
       "PokerTH tourne dans le navigateur. Pas de téléchargement, pas de compte, pas de greffon. Sur téléphone, vous pouvez l’ajouter à l’écran d’accueil depuis le menu du navigateur : il s’ouvre alors comme une application, en plein écran, et fonctionne hors ligne."],
      ["Choisissez où vous voulez jouer",
       "Trois modes. L’<strong>entraînement hors ligne</strong> vous installe immédiatement à une table d’adversaires gérés par l’ordinateur et ne demande aucune connexion — c’est là qu’on apprend. <strong>pokerth.net</strong> est le réseau officiel : de vrais adversaires, des classements saisonniers, un pseudo gratuit à enregistrer une seule fois. <strong>LAN / serveur privé</strong> vous connecte à un serveur PokerTH dédié, le vôtre ou celui de quelqu’un d’autre."],
      ["Asseyez-vous à une table",
       "Dans le lobby, vous rejoignez une table de la liste ou vous créez la vôtre. En la créant, vous fixez le nombre de sièges, le tapis de départ, la vitesse de montée des blindes et, si vous le souhaitez, un mot de passe. Partagez le lien d’invitation : votre ami arrive directement à votre table, dans son navigateur, sans rien avoir à enregistrer."],
      ["Jouez la main",
       "Vous recevez deux cartes privées. Les enchères font le tour de la table avant le flop, puis après le flop, la turn et la river. Quand c’est à vous, la barre d’action s’allume et ne propose que ce qui est autorisé : Fold, Check ou Call, Raise ou All-In. Le montant se tape, se règle au curseur, ou se pose d’un seul geste sur Min, la moitié du pot, le pot ou votre tapis entier."],
      ["Lisez la table",
       "Votre meilleure combinaison du moment est nommée sous le tableau au fur et à mesure que les cartes sortent. Le pot, chaque tapis et le niveau de blindes restent affichés en permanence, le bouton du donneur indique qui parle en dernier, et un compte à rebours montre le temps qu’il vous reste. Au showdown, les cinq cartes qui ont formé chaque main sont mises en évidence."],
      ["Gagnez le tournoi",
       "Les parties PokerTH sont des tournois sit-and-go : tout le monde démarre avec le même tapis, les blindes montent à intervalles réguliers, et les joueurs sont éliminés jusqu’à ce qu’un seul détienne tous les jetons. Rien ne coûte d’argent et aucun jeton ne s’achète — tout est en argent fictif, si bien que le seul enjeu est la partie elle-même."]
    ],
    phoneH2: "Jouer sur téléphone",
    phoneP: "La table est pensée pour l’écran tactile autant que pour l’ordinateur : toucher le champ de mise ouvre un pavé numérique à l’intérieur de la barre d’action plutôt que le clavier du système, si bien que la table ne saute jamais, et le curseur avance par les mêmes paliers que le client de bureau. Les notifications de tour peuvent vous parvenir avec les boutons Fold et Check/Call directement dessus : une main se joue sans revenir dans l’onglet.",
    friendsH2: "Jouer entre amis",
    friendsP: "Créez une table, mettez un mot de passe si vous la voulez privée, et envoyez le lien d’invitation. Il ouvre la table directement — dans l’application installée si vos amis l’ont ajoutée à leur écran d’accueil, dans un onglet de navigateur sinon. Personne n’a rien à installer ni d’adresse e-mail à donner.",
    faqH2: "Questions fréquentes",
    faqP: function (h, c) { return "Aucun argent n’intervient jamais, dans aucun mode. Vos réglages, vos packs de style et votre progression hors ligne restent sur votre appareil. L’interface existe en 45 langues, tandis que les cinq mots d’action — Fold, Check, Call, Raise, All-In — restent en anglais, comme à toutes les tables du monde. La suite dans la <a href=\"{faq}\">FAQ</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  de: {
    title: "Poker online kostenlos spielen — so geht’s | PokerTH Web",
    desc: "Schritt für Schritt: kostenlos Texas Hold’em im Browser spielen, ohne Download und ohne Konto — offline gegen Bots, im offiziellen Netzwerk pokerth.net oder am privaten Tisch mit Freunden.",
    ldHeadline: "Kostenlos Texas Hold’em Poker im Browser spielen",
    ldDesc: "Eine Schritt-für-Schritt-Anleitung zum kostenlosen Texas Hold’em im PokerTH-Web-Client.",
    h1: "Poker online spielen — kostenlos, direkt im Browser",
    lead: function (h, c) { return "Das hier ist die Kurzfassung: vom leeren Tab zur ersten Hand Texas Hold’em in PokerTH. Wenn es Ihnen um die Regeln selbst geht — Blinds, Setzrunden, was was schlägt — lesen Sie zuerst die <a href=\"{rules}\">Regelseite</a> und die <a href=\"{hands}\">Pokerblätter</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Seite öffnen — es gibt nichts zu installieren",
       "PokerTH läuft im Browser. Kein Download, kein Konto, kein Plugin. Auf dem Handy können Sie es über das Browsermenü zum Startbildschirm hinzufügen; dann öffnet es sich wie eine App, im Vollbild und offlinefähig."],
      ["Wählen Sie, wo Sie spielen möchten",
       "Drei Modi. Das <strong>Offline-Training</strong> setzt Sie sofort an einen Tisch mit Computergegnern und braucht überhaupt keine Verbindung — hier lernt man. <strong>pokerth.net</strong> ist das offizielle Netzwerk: echte Gegner, Saisonranglisten, ein kostenloser Nickname, den Sie einmal registrieren. <strong>LAN / privater Server</strong> verbindet Sie mit einem dedizierten PokerTH-Server, Ihrem eigenen oder dem eines anderen."],
      ["Setzen Sie sich an einen Tisch",
       "In der Lobby treten Sie entweder einem Tisch aus der Liste bei oder erstellen Ihren eigenen. Beim Erstellen legen Sie die Zahl der Plätze fest, den Startstack, wie schnell die Blinds steigen und ob der Tisch mit Passwort geschützt ist. Teilen Sie den Einladungslink, und ein Freund landet direkt an Ihrem Tisch, in seinem Browser, ohne sich irgendwo anzumelden."],
      ["Spielen Sie die Hand",
       "Sie erhalten zwei verdeckte Karten. Gesetzt wird reihum vor dem Flop und noch einmal nach Flop, Turn und River. Wenn Sie an der Reihe sind, leuchtet die Aktionsleiste auf und bietet nur an, was erlaubt ist: Fold, Check oder Call, Raise oder All-In. Den Betrag können Sie eintippen, am Schieberegler ziehen oder mit einem Tipp auf Min, halben Pot, Pot oder Ihren ganzen Stack setzen."],
      ["Lesen Sie den Tisch",
       "Ihr aktuell bestes Blatt wird unter dem Board benannt, während die Karten kommen. Pot, jeder Stack und die Blind-Stufe stehen jederzeit auf dem Bildschirm, der Dealer-Button zeigt, wer zuletzt handelt, und ein Countdown zeigt Ihre verbleibende Zeit. Beim Showdown werden die fünf Karten hervorgehoben, die das jeweilige Blatt gebildet haben."],
      ["Gewinnen Sie das Turnier",
       "PokerTH-Partien sind Sit-and-go-Turniere: alle starten mit demselben Stack, die Blinds steigen nach Uhr, und es wird ausgeschieden, bis einer alle Chips hält. Nichts kostet Geld und Chips lassen sich nicht kaufen — es ist durchweg Spielgeld, auf dem Spiel steht also nur das Spiel selbst."]
    ],
    phoneH2: "Am Telefon spielen",
    phoneP: "Der Tisch ist ebenso für den Touchscreen gebaut wie für den Desktop: Ein Tippen auf das Einsatzfeld öffnet ein Ziffernfeld innerhalb der Aktionsleiste statt der Systemtastatur, sodass der Tisch nie herumspringt, und der Schieberegler bewegt sich in denselben Schritten wie im Desktop-Client. Zug-Benachrichtigungen können Sie mit Fold- und Check/Call-Schaltflächen darauf erreichen, sodass sich eine Hand spielen lässt, ohne in den Tab zurückzuwechseln.",
    friendsH2: "Mit Freunden spielen",
    friendsP: "Erstellen Sie einen Tisch, vergeben Sie ein Passwort, wenn er privat sein soll, und schicken Sie den Einladungslink. Er öffnet den Tisch direkt — in der installierten App, falls sie auf dem Startbildschirm liegt, sonst in einem Browser-Tab. Niemand muss etwas installieren oder eine E-Mail-Adresse herausgeben.",
    faqH2: "Häufige Fragen",
    faqP: function (h, c) { return "Geld ist in keinem Modus jemals im Spiel. Ihre Einstellungen, Stilpakete und der Offline-Fortschritt bleiben auf Ihrem eigenen Gerät. Die Oberfläche gibt es in 45 Sprachen, während die fünf Aktionswörter — Fold, Check, Call, Raise, All-In — auf Englisch bleiben, wie an jedem Tisch der Welt. Mehr in den <a href=\"{faq}\">FAQ</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  es: {
    title: "Cómo jugar al póker online gratis — PokerTH Web",
    desc: "Paso a paso: juega al póker Texas Hold’em gratis en tu navegador, sin descargas ni cuenta — sin conexión contra bots, en la red oficial pokerth.net o en una mesa privada con amigos.",
    ldHeadline: "Cómo jugar gratis al póker Texas Hold’em en el navegador",
    ldDesc: "Una guía paso a paso para jugar gratis al Texas Hold’em en el cliente web de PokerTH.",
    h1: "Cómo jugar al póker online, gratis, en tu navegador",
    lead: function (h, c) { return "Esta es la versión corta: de una pestaña en blanco a tu primera mano de Texas Hold’em en PokerTH. Si lo que buscas son las reglas en sí — ciegas, rondas de apuestas, qué gana a qué — empieza por la <a href=\"{rules}\">página de reglas</a> y por las <a href=\"{hands}\">jugadas de póker</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Abre el sitio — no hay nada que instalar",
       "PokerTH funciona en el navegador. Sin descargas, sin cuenta, sin complementos. En el móvil puedes añadirlo a la pantalla de inicio desde el menú del navegador y se abre como una aplicación, a pantalla completa y con soporte sin conexión."],
      ["Elige dónde quieres jugar",
       "Tres modos. La <strong>práctica sin conexión</strong> te sienta de inmediato a una mesa de oponentes controlados por el ordenador y no necesita conexión alguna: es donde se aprende. <strong>pokerth.net</strong> es la red oficial: rivales reales, clasificaciones por temporada y un apodo gratuito que registras una sola vez. <strong>LAN / servidor privado</strong> te conecta a un servidor PokerTH dedicado, tuyo o de otra persona."],
      ["Siéntate a una mesa",
       "En el lobby puedes unirte a una mesa de la lista o crear la tuya. Al crearla eliges el número de asientos, la pila inicial, la rapidez con la que suben las ciegas y si la mesa lleva contraseña. Comparte el enlace de invitación y tu amigo aparece directamente en tu mesa, en su navegador, sin registrar nada."],
      ["Juega la mano",
       "Recibes dos cartas privadas. Se apuesta alrededor de la mesa antes del flop y otra vez después del flop, el turn y el river. Cuando te toca, la barra de acciones se enciende y ofrece solo lo que es legal: Fold, Check o Call, Raise o All-In. La cantidad se puede escribir, arrastrar en el deslizador o fijar con un toque en Min, la mitad del bote, el bote o toda tu pila."],
      ["Lee la mesa",
       "Tu mejor jugada actual aparece nombrada bajo la mesa según van saliendo las cartas. El bote, cada pila y el nivel de ciegas están siempre en pantalla, el botón de repartidor indica quién habla último y una cuenta atrás muestra el tiempo que te queda. En el showdown se resaltan las cinco cartas que formaron cada mano."],
      ["Gana el torneo",
       "Las partidas de PokerTH son torneos sit-and-go: todos empiezan con la misma pila, las ciegas suben por reloj y los jugadores van cayendo hasta que uno tiene todas las fichas. Nada cuesta dinero y no se pueden comprar fichas — todo es dinero ficticio, así que lo único en juego es la propia partida."]
    ],
    phoneH2: "Jugar en el móvil",
    phoneP: "La mesa está pensada tanto para pantalla táctil como para ordenador: tocar el campo de apuesta abre un teclado numérico dentro de la barra de acciones en lugar del teclado del sistema, así la mesa nunca da saltos, y el deslizador avanza en los mismos pasos que el cliente de escritorio. Las notificaciones de turno pueden llegarte con los botones Fold y Check/Call incorporados, de modo que se puede jugar una mano sin volver a la pestaña.",
    friendsH2: "Jugar con amigos",
    friendsP: "Crea una mesa, ponle contraseña si la quieres privada y envía el enlace de invitación. Abre la mesa directamente: en la aplicación instalada si la han añadido a su pantalla de inicio, y en una pestaña del navegador si no. Nadie tiene que instalar nada ni dar una dirección de correo.",
    faqH2: "Preguntas frecuentes",
    faqP: function (h, c) { return "Nunca hay dinero de por medio, en ningún modo. Tus ajustes, tus paquetes de estilo y tu progreso sin conexión se quedan en tu propio dispositivo. La interfaz está disponible en 45 idiomas, mientras que las cinco palabras de acción — Fold, Check, Call, Raise, All-In — se mantienen en inglés, como en cualquier mesa del mundo. Más en las <a href=\"{faq}\">preguntas frecuentes</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  'pt-BR': {
    title: "Como jogar pôquer online grátis — PokerTH Web",
    desc: "Passo a passo: jogue pôquer Texas Hold’em grátis no navegador, sem download e sem cadastro — offline contra bots, na rede oficial pokerth.net ou numa mesa privada com amigos.",
    ldHeadline: "Como jogar pôquer Texas Hold’em grátis no navegador",
    ldDesc: "Um guia passo a passo para jogar Texas Hold’em de graça no cliente web do PokerTH.",
    h1: "Como jogar pôquer online, de graça, no seu navegador",
    lead: function (h, c) { return "Esta é a versão curta: da aba em branco até a sua primeira mão de Texas Hold’em no PokerTH. Se o que você quer são as regras em si — blinds, rodadas de apostas, o que ganha de quê — comece pela <a href=\"{rules}\">página de regras</a> e pelas <a href=\"{hands}\">mãos do pôquer</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Abra o site — não há nada para instalar",
       "O PokerTH roda no navegador. Sem download, sem cadastro, sem plugin. No celular dá para adicioná-lo à tela de início pelo menu do navegador: ele abre como um aplicativo, em tela cheia, e funciona offline."],
      ["Escolha onde quer jogar",
       "Três modos. O <strong>treino offline</strong> coloca você na hora numa mesa de oponentes controlados pelo computador e não precisa de conexão nenhuma — é onde se aprende. O <strong>pokerth.net</strong> é a rede oficial: adversários de verdade, rankings por temporada e um apelido gratuito que você registra uma única vez. <strong>LAN / servidor privado</strong> conecta a um servidor PokerTH dedicado, seu ou de outra pessoa."],
      ["Sente-se a uma mesa",
       "No lobby você entra numa mesa da lista ou cria a sua. Ao criar, define o número de lugares, as fichas iniciais, a velocidade com que os blinds sobem e se a mesa tem senha. Compartilhe o link de convite e o amigo cai direto na sua mesa, no navegador dele, sem cadastrar nada."],
      ["Jogue a mão",
       "Você recebe duas cartas fechadas. As apostas dão a volta na mesa antes do flop e de novo depois do flop, do turn e do river. Quando chega a sua vez, a barra de ações acende e oferece só o que é permitido: Fold, Check ou Call, Raise ou All-In. O valor pode ser digitado, arrastado no controle deslizante ou definido com um toque em Min, metade do pote, o pote ou todas as suas fichas."],
      ["Leia a mesa",
       "Sua melhor mão do momento aparece nomeada abaixo da mesa conforme as cartas saem. O pote, cada pilha de fichas e o nível dos blinds ficam sempre na tela, o botão do dealer mostra quem fala por último e uma contagem regressiva indica quanto tempo você tem. No showdown, as cinco cartas que formaram cada mão ficam destacadas."],
      ["Vença o torneio",
       "As partidas do PokerTH são torneios sit-and-go: todos começam com as mesmas fichas, os blinds sobem no relógio e os jogadores vão sendo eliminados até que um fique com tudo. Nada custa dinheiro e não dá para comprar fichas — é tudo dinheiro fictício, então o único risco é o do próprio jogo."]
    ],
    phoneH2: "Jogando no celular",
    phoneP: "A mesa foi feita tanto para tela sensível ao toque quanto para computador: tocar no campo de aposta abre um teclado numérico dentro da barra de ações em vez do teclado do sistema, então a mesa nunca dá pulos, e o controle deslizante anda nos mesmos passos do cliente desktop. As notificações de vez podem chegar com os botões Fold e Check/Call nelas, de modo que dá para jogar uma mão sem voltar para a aba.",
    friendsH2: "Jogando com amigos",
    friendsP: "Crie uma mesa, ponha senha se quiser que seja privada e mande o link de convite. Ele abre a mesa direto — no aplicativo instalado, se a pessoa já o adicionou à tela de início, ou numa aba do navegador. Ninguém precisa instalar nada nem informar um e-mail.",
    faqH2: "Perguntas frequentes",
    faqP: function (h, c) { return "Dinheiro nunca entra em jogo, em modo nenhum. Suas configurações, seus pacotes de estilo e seu progresso offline ficam no seu próprio aparelho. A interface está disponível em 45 idiomas, enquanto as cinco palavras de ação — Fold, Check, Call, Raise, All-In — continuam em inglês, como em qualquer mesa do mundo. Mais no <a href=\"{faq}\">FAQ</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  it: {
    title: "Come giocare a poker online gratis — PokerTH Web",
    desc: "Passo dopo passo: gioca a poker Texas Hold’em gratis nel browser, senza download e senza account — offline contro i bot, sulla rete ufficiale pokerth.net o a un tavolo privato con gli amici.",
    ldHeadline: "Come giocare gratis a poker Texas Hold’em nel browser",
    ldDesc: "Una guida passo dopo passo per giocare gratis a Texas Hold’em nel client web di PokerTH.",
    h1: "Come giocare a poker online, gratis, nel browser",
    lead: function (h, c) { return "Questa è la versione breve: da una scheda vuota alla prima mano di Texas Hold’em su PokerTH. Se quello che cerchi sono le regole vere e proprie — bui, giri di puntate, cosa batte cosa — parti dalla <a href=\"{rules}\">pagina delle regole</a> e dai <a href=\"{hands}\">punti del poker</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Apri il sito — non c’è niente da installare",
       "PokerTH gira nel browser. Nessun download, nessun account, nessun plugin. Sul telefono puoi aggiungerlo alla schermata iniziale dal menu del browser: si apre come un’app, a schermo intero, e funziona anche offline."],
      ["Scegli dove vuoi giocare",
       "Tre modalità. L’<strong>allenamento offline</strong> ti mette subito a un tavolo di avversari gestiti dal computer e non richiede alcuna connessione: è lì che si impara. <strong>pokerth.net</strong> è la rete ufficiale: avversari veri, classifiche stagionali e un nickname gratuito da registrare una volta sola. <strong>LAN / server privato</strong> ti collega a un server PokerTH dedicato, tuo o di qualcun altro."],
      ["Siediti a un tavolo",
       "Nella lobby puoi unirti a un tavolo dell’elenco o crearne uno tuo. Creandolo scegli il numero di posti, lo stack iniziale, la velocità con cui salgono i bui e se il tavolo ha una password. Condividi il link d’invito e l’amico arriva direttamente al tuo tavolo, nel suo browser, senza registrare nulla."],
      ["Gioca la mano",
       "Ricevi due carte coperte. Si punta in giro per il tavolo prima del flop e di nuovo dopo il flop, il turn e il river. Quando tocca a te la barra delle azioni si accende e propone solo ciò che è consentito: Fold, Check o Call, Raise o All-In. L’importo si può digitare, trascinare sullo slider oppure impostare con un tocco su Min, metà piatto, piatto o tutto il tuo stack."],
      ["Leggi il tavolo",
       "Il tuo punto migliore del momento viene indicato sotto il board mentre escono le carte. Il piatto, ogni stack e il livello dei bui restano sempre a schermo, il bottone del mazziere mostra chi parla per ultimo e un conto alla rovescia indica quanto tempo hai. Allo showdown vengono evidenziate le cinque carte che hanno formato ogni mano."],
      ["Vinci il torneo",
       "Le partite di PokerTH sono tornei sit-and-go: tutti partono con lo stesso stack, i bui salgono a tempo e i giocatori vengono eliminati finché uno solo non ha tutte le fiche. Niente costa denaro e le fiche non si comprano — è tutto denaro finto, quindi l’unica posta in gioco è la partita stessa."]
    ],
    phoneH2: "Giocare da telefono",
    phoneP: "Il tavolo è pensato per il touch tanto quanto per il desktop: toccare il campo della puntata apre un tastierino dentro la barra delle azioni invece della tastiera di sistema, così il tavolo non salta mai, e lo slider si muove con gli stessi passi del client desktop. Le notifiche del turno possono arrivarti con i pulsanti Fold e Check/Call già sopra, così una mano si gioca senza tornare nella scheda.",
    friendsH2: "Giocare con gli amici",
    friendsP: "Crea un tavolo, metti una password se lo vuoi privato e manda il link d’invito. Apre il tavolo direttamente — nell’app installata se l’hanno aggiunta alla schermata iniziale, altrimenti in una scheda del browser. Nessuno deve installare niente né lasciare un indirizzo email.",
    faqH2: "Domande frequenti",
    faqP: function (h, c) { return "Non c’è mai denaro in gioco, in nessuna modalità. Le tue impostazioni, i pacchetti di stile e i progressi offline restano sul tuo dispositivo. L’interfaccia è disponibile in 45 lingue, mentre le cinque parole d’azione — Fold, Check, Call, Raise, All-In — restano in inglese, come a qualsiasi tavolo del mondo. Il resto nelle <a href=\"{faq}\">FAQ</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  pl: {
    title: "Jak grać w pokera online za darmo — PokerTH Web",
    desc: "Krok po kroku: graj w pokera Texas Hold’em za darmo w przeglądarce, bez pobierania i bez konta — offline z botami, w oficjalnej sieci pokerth.net albo przy prywatnym stole ze znajomymi.",
    ldHeadline: "Jak grać za darmo w pokera Texas Hold’em w przeglądarce",
    ldDesc: "Przewodnik krok po kroku po darmowej grze w Texas Hold’em w kliencie webowym PokerTH.",
    h1: "Jak grać w pokera online, za darmo, w przeglądarce",
    lead: function (h, c) { return "To jest wersja skrócona: od pustej karty przeglądarki do pierwszego rozdania Texas Hold’em w PokerTH. Jeśli szukasz samych zasad — ciemne, rundy licytacji, co co bije — zacznij od <a href=\"{rules}\">strony z zasadami</a> i od <a href=\"{hands}\">układów w pokerze</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Otwórz stronę — nie ma czego instalować",
       "PokerTH działa w przeglądarce. Bez pobierania, bez konta, bez wtyczek. Na telefonie możesz dodać go do ekranu głównego z menu przeglądarki: otwiera się wtedy jak aplikacja, na pełnym ekranie, i działa offline."],
      ["Wybierz, gdzie chcesz grać",
       "Trzy tryby. <strong>Trening offline</strong> od razu sadza cię przy stole z przeciwnikami sterowanymi przez komputer i w ogóle nie wymaga połączenia — tu się uczysz. <strong>pokerth.net</strong> to oficjalna sieć: prawdziwi przeciwnicy, rankingi sezonowe, darmowy nick rejestrowany raz. <strong>LAN / serwer prywatny</strong> łączy cię z dedykowanym serwerem PokerTH, twoim albo cudzym."],
      ["Usiądź przy stole",
       "W lobby albo dołączasz do stołu z listy, albo tworzysz własny. Tworząc, ustawiasz liczbę miejsc, stack początkowy, tempo wzrostu ciemnych i to, czy stół jest chroniony hasłem. Udostępnij link z zaproszeniem, a znajomy trafi prosto do twojego stołu, w swojej przeglądarce, bez żadnej rejestracji."],
      ["Rozegraj rozdanie",
       "Dostajesz dwie zakryte karty. Licytacja idzie dookoła stołu przed flopem, a potem jeszcze raz po flopie, turnie i riverze. Kiedy przychodzi twoja kolej, pasek akcji się rozświetla i proponuje tylko to, co dozwolone: Fold, Check lub Call, Raise albo All-In. Kwotę można wpisać, przeciągnąć suwakiem albo ustawić jednym dotknięciem na Min, połowę puli, pulę lub cały swój stack."],
      ["Czytaj stół",
       "Twój aktualnie najlepszy układ jest nazwany pod stołem w miarę wychodzenia kart. Pula, każdy stack i poziom ciemnych są cały czas na ekranie, żeton rozdającego pokazuje, kto mówi ostatni, a odliczanie pokazuje, ile masz czasu. Przy showdownie podświetlane jest tych pięć kart, które utworzyły każdy układ."],
      ["Wygraj turniej",
       "Gry w PokerTH to turnieje sit-and-go: wszyscy zaczynają z tym samym stackiem, ciemne rosną według zegara, a gracze odpadają, aż jeden zgarnie wszystkie żetony. Nic nie kosztuje pieniędzy i żetonów nie da się kupić — wszystko jest na wirtualne pieniądze, więc jedyną stawką jest sama gra."]
    ],
    phoneH2: "Gra na telefonie",
    phoneP: "Stół jest zrobiony pod ekran dotykowy tak samo jak pod komputer: dotknięcie pola zakładu otwiera klawiaturę numeryczną wewnątrz paska akcji zamiast klawiatury systemowej, więc stół nigdy nie skacze, a suwak przesuwa się tymi samymi krokami co w kliencie desktopowym. Powiadomienia o turze mogą dotrzeć do ciebie z przyciskami Fold i Check/Call na nich, więc rozdanie da się rozegrać bez wracania do karty przeglądarki.",
    friendsH2: "Gra ze znajomymi",
    friendsP: "Utwórz stół, ustaw hasło, jeśli ma być prywatny, i wyślij link z zaproszeniem. Otwiera on stół bezpośrednio — w zainstalowanej aplikacji, jeśli znajomy dodał ją do ekranu głównego, a w przeciwnym razie w karcie przeglądarki. Nikt nie musi niczego instalować ani podawać adresu e-mail.",
    faqH2: "Częste pytania",
    faqP: function (h, c) { return "W żadnym trybie nie ma prawdziwych pieniędzy. Twoje ustawienia, paczki stylów i postępy offline zostają na twoim urządzeniu. Interfejs jest dostępny w 45 językach, a pięć słów akcji — Fold, Check, Call, Raise, All-In — pozostaje po angielsku, tak jak przy każdym stole na świecie. Więcej w <a href=\"{faq}\">FAQ</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  ru: {
    title: "Как играть в покер онлайн бесплатно — PokerTH Web",
    desc: "Пошагово: играйте в техасский холдем бесплатно прямо в браузере, без скачивания и без аккаунта — офлайн против ботов, в официальной сети pokerth.net или за закрытым столом с друзьями.",
    ldHeadline: "Как бесплатно играть в техасский холдем в браузере",
    ldDesc: "Пошаговое руководство по бесплатной игре в техасский холдем в веб-клиенте PokerTH.",
    h1: "Как играть в покер онлайн, бесплатно, прямо в браузере",
    lead: function (h, c) { return "Это краткая версия: от пустой вкладки до первой раздачи техасского холдема в PokerTH. Если вам нужны сами правила — блайнды, круги торговли, что чем бьётся — начните со <a href=\"{rules}\">страницы правил</a> и с <a href=\"{hands}\">комбинаций</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Откройте сайт — устанавливать нечего",
       "PokerTH работает в браузере. Без загрузки, без аккаунта, без плагинов. На телефоне его можно добавить на домашний экран из меню браузера: тогда он открывается как приложение, на весь экран, и работает офлайн."],
      ["Выберите, где играть",
       "Три режима. <strong>Офлайн-тренировка</strong> сразу сажает вас за стол с компьютерными соперниками и вообще не требует соединения — здесь и учатся. <strong>pokerth.net</strong> — официальная сеть: живые соперники, сезонные рейтинги, бесплатный ник, который регистрируется один раз. <strong>LAN / частный сервер</strong> подключает к выделенному серверу PokerTH — вашему или чужому."],
      ["Сядьте за стол",
       "В лобби вы либо присоединяетесь к столу из списка, либо создаёте свой. При создании задаются число мест, стартовый стек, скорость роста блайндов и пароль, если стол должен быть закрытым. Поделитесь ссылкой-приглашением — и друг попадёт прямо за ваш стол, в своём браузере, ничего не регистрируя."],
      ["Разыграйте руку",
       "Вам сдают две закрытые карты. Торговля идёт по кругу до флопа и затем ещё раз после флопа, тёрна и ривера. Когда очередь доходит до вас, панель действий загорается и предлагает только допустимое: Fold, Check или Call, Raise или All-In. Сумму можно ввести, потянуть ползунком или задать одним касанием — Min, половина банка, банк или весь стек."],
      ["Читайте стол",
       "Ваша лучшая на данный момент комбинация подписана под бордом по мере выхода карт. Банк, каждый стек и уровень блайндов всё время на экране, кнопка дилера показывает, кто говорит последним, а обратный отсчёт — сколько у вас времени. На вскрытии подсвечиваются те пять карт, которые составили каждую руку."],
      ["Выиграйте турнир",
       "Игры в PokerTH — это турниры sit-and-go: все начинают с одинаковым стеком, блайнды растут по таймеру, игроки выбывают, пока у одного не окажутся все фишки. Ничто не стоит денег, и фишки нельзя купить — всё на условные фишки, так что на кону только сама игра."]
    ],
    phoneH2: "Игра на телефоне",
    phoneP: "Стол рассчитан на сенсорный экран не меньше, чем на компьютер: касание поля ставки открывает цифровую клавиатуру внутри панели действий, а не системную, поэтому стол никогда не прыгает, и ползунок движется теми же шагами, что и в настольном клиенте. Уведомления о ходе могут приходить с кнопками Fold и Check/Call прямо на них, так что руку можно разыграть, не возвращаясь во вкладку.",
    friendsH2: "Игра с друзьями",
    friendsP: "Создайте стол, поставьте пароль, если хотите закрытый, и отправьте ссылку-приглашение. Она открывает стол напрямую — в установленном приложении, если его добавили на домашний экран, иначе во вкладке браузера. Никому не нужно ничего устанавливать и оставлять адрес почты.",
    faqH2: "Частые вопросы",
    faqP: function (h, c) { return "Реальные деньги не участвуют ни в одном режиме. Ваши настройки, стилевые паки и офлайн-прогресс остаются на вашем устройстве. Интерфейс доступен на 45 языках, а пять слов действий — Fold, Check, Call, Raise, All-In — остаются английскими, как за любым столом в мире. Подробнее в <a href=\"{faq}\">FAQ</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  zh: {
    title: "如何免费在线玩扑克 — PokerTH 网页版",
    desc: "一步一步教你在浏览器里免费玩德州扑克，无需下载、无需注册——离线对战电脑、加入官方 pokerth.net 网络，或和朋友开一桌私人牌局。",
    ldHeadline: "如何在浏览器中免费玩德州扑克",
    ldDesc: "在 PokerTH 网页版客户端免费玩德州扑克的分步指南。",
    h1: "如何在浏览器里免费在线玩扑克",
    lead: function (h, c) { return "这是精简版：从一个空白标签页到你在 PokerTH 的第一手德州扑克。如果你想了解的是规则本身——盲注、下注轮次、什么牌大过什么牌——请先看<a href=\"{rules}\">规则页面</a>和<a href=\"{hands}\">牌型大小</a>。".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["打开网站——没有任何东西需要安装",
       "PokerTH 在浏览器里运行。无需下载、无需注册、无需插件。在手机上，你可以从浏览器菜单把它添加到主屏幕，之后它就像一个应用一样全屏打开，并且支持离线使用。"],
      ["选择你想在哪里玩",
       "共三种模式。<strong>离线练习</strong>会立刻为你安排一桌电脑对手，完全不需要联网——这是学习的地方。<strong>pokerth.net</strong> 是官方网络：真人对手、赛季排名，注册一次即可获得免费昵称。<strong>局域网／私人服务器</strong>连接到专用的 PokerTH 服务器，你自己的或别人的都行。"],
      ["坐到牌桌前",
       "在大厅里，你可以从列表加入一桌，也可以自己开一桌。开桌时可以设置座位数、起始筹码、盲注上涨的速度，以及是否设密码。把邀请链接分享出去，朋友就会直接落座在你的牌桌上，在他自己的浏览器里，什么都不用注册。"],
      ["打这手牌",
       "你会拿到两张底牌。翻牌前绕桌下注一轮，翻牌、转牌、河牌之后各再下注一轮。轮到你时，操作栏会亮起，并且只提供当前合法的选项：Fold、Check 或 Call、Raise 或 All-In。下注金额可以输入、可以拖动滑杆，也可以一键设为最小注、半池、一池或全部筹码。"],
      ["读懂牌桌",
       "随着公共牌发出，你当前的最佳牌型会标注在牌桌下方。底池、每个人的筹码和盲注级别始终显示在屏幕上，庄家按钮标明谁最后行动，倒计时显示你还剩多少时间。摊牌时，组成每一手牌的那五张会被高亮。"],
      ["赢下比赛",
       "PokerTH 的牌局是 sit-and-go 锦标赛：所有人以相同筹码开局，盲注按时上涨，玩家陆续被淘汰，直到一人赢下全部筹码。不花一分钱，也无法购买筹码——全部是虚拟筹码，因此唯一的赌注就是这局牌本身。"]
    ],
    phoneH2: "在手机上玩",
    phoneP: "牌桌为触摸屏所做的考虑不亚于桌面端：点击下注框会在操作栏内打开数字键盘，而不是弹出系统键盘，因此牌桌永远不会跳动；滑杆的步进也与桌面客户端一致。轮到你时的通知上可以直接带有 Fold 和 Check/Call 按钮，因此一手牌无需切回标签页也能打完。",
    friendsH2: "和朋友一起玩",
    friendsP: "开一桌，想私密就设个密码，然后把邀请链接发出去。链接会直接打开牌桌——如果对方已把应用添加到主屏幕，就在应用里打开，否则在浏览器标签页里打开。谁都不用安装任何东西，也不用交出电子邮箱。",
    faqH2: "常见问题",
    faqP: function (h, c) { return "任何模式都不涉及金钱。你的设置、样式包和离线进度都保存在你自己的设备上。界面提供 45 种语言，而 Fold、Check、Call、Raise、All-In 这五个动作词保持英文，和全世界的牌桌一样。更多内容见<a href=\"{faq}\">常见问题</a>。".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  nl: {
    title: "Hoe speel je gratis poker online — PokerTH Web",
    desc: "Stap voor stap: speel gratis Texas Hold’em poker in je browser, zonder download en zonder account — offline tegen bots, op het officiële pokerth.net-netwerk of aan een privétafel met vrienden.",
    ldHeadline: "Gratis Texas Hold’em poker spelen in je browser",
    ldDesc: "Een stapsgewijze handleiding om gratis Texas Hold’em te spelen in de PokerTH-webclient.",
    h1: "Hoe je gratis poker online speelt, in je browser",
    lead: function (h, c) { return "Dit is de korte versie: van een leeg tabblad naar je eerste hand Texas Hold’em in PokerTH. Gaat het je om de regels zelf — blinds, biedrondes, wat wint van wat — begin dan eerst bij de <a href=\"{rules}\">regelpagina</a> en de <a href=\"{hands}\">pokerhanden</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Open de site — er valt niets te installeren",
       "PokerTH draait in de browser. Geen download, geen account, geen plug-in. Op een telefoon kun je het via het browsermenu aan je beginscherm toevoegen; het opent dan als een app, schermvullend, en werkt ook offline."],
      ["Kies waar je wilt spelen",
       "Drie modi. <strong>Offline oefenen</strong> zet je meteen aan een tafel met computertegenstanders en heeft helemaal geen verbinding nodig — daar leer je het. <strong>pokerth.net</strong> is het officiële netwerk: echte tegenstanders, seizoensranglijsten en een gratis bijnaam die je één keer registreert. <strong>LAN / eigen server</strong> verbindt met een toegewijde PokerTH-server, van jou of van iemand anders."],
      ["Ga aan een tafel zitten",
       "In de lobby sluit je je aan bij een tafel uit de lijst of maak je er zelf een. Bij het aanmaken kies je het aantal plaatsen, de startstack, hoe snel de blinds stijgen en of de tafel een wachtwoord heeft. Deel de uitnodigingslink en een vriend komt rechtstreeks aan jouw tafel terecht, in zijn eigen browser, zonder zich ergens aan te melden."],
      ["Speel de hand",
       "Je krijgt twee gesloten kaarten. Er wordt rondom de tafel geboden vóór de flop, en daarna opnieuw na de flop, de turn en de river. Als jij aan de beurt bent, licht de actiebalk op en biedt alleen aan wat is toegestaan: Fold, Check of Call, Raise of All-In. Het bedrag kun je intypen, met de schuifregelaar slepen of met één tik zetten op Min, de helft van de pot, de pot of je hele stack."],
      ["Lees de tafel",
       "Je op dat moment beste hand staat onder het bord benoemd terwijl de kaarten komen. De pot, elke stack en het blindniveau staan permanent in beeld, de dealerknop laat zien wie als laatste handelt, en een aftelling toont hoeveel tijd je nog hebt. Bij de showdown worden de vijf kaarten uitgelicht die elke hand vormden."],
      ["Win het toernooi",
       "Partijen in PokerTH zijn sit-and-go-toernooien: iedereen begint met dezelfde stack, de blinds stijgen op de klok en spelers vallen af tot er één alle fiches heeft. Niets kost geld en fiches zijn niet te koop — het is allemaal speelgeld, dus het enige wat op het spel staat is het spel zelf."]
    ],
    phoneH2: "Spelen op een telefoon",
    phoneP: "De tafel is net zo goed voor een aanraakscherm gemaakt als voor een computer: op het inzetveld tikken opent een cijferblok binnen de actiebalk in plaats van het systeemtoetsenbord, waardoor de tafel nooit verspringt, en de schuifregelaar beweegt in dezelfde stappen als de desktopclient. Meldingen dat je aan de beurt bent kunnen Fold- en Check/Call-knoppen bevatten, zodat je een hand kunt spelen zonder terug te gaan naar het tabblad.",
    friendsH2: "Spelen met vrienden",
    friendsP: "Maak een tafel, zet er een wachtwoord op als je hem privé wilt, en stuur de uitnodigingslink. Die opent de tafel rechtstreeks — in de geïnstalleerde app als ze die aan hun beginscherm hebben toegevoegd, anders in een browsertabblad. Niemand hoeft iets te installeren of een e-mailadres af te staan.",
    faqH2: "Veelgestelde vragen",
    faqP: function (h, c) { return "Er komt in geen enkele modus geld aan te pas. Je instellingen, stijlpakketten en offline voortgang blijven op je eigen apparaat. De interface is beschikbaar in 45 talen, terwijl de vijf actiewoorden — Fold, Check, Call, Raise, All-In — in het Engels blijven, zoals aan elke tafel ter wereld. Meer in de <a href=\"{faq}\">veelgestelde vragen</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  tr: {
    title: "Ücretsiz online poker nasıl oynanır — PokerTH Web",
    desc: "Adım adım: tarayıcınızda ücretsiz Texas Hold’em pokeri oynayın, indirme ve hesap gerekmeden — botlara karşı çevrimdışı, resmî pokerth.net ağında ya da arkadaşlarınızla özel bir masada.",
    ldHeadline: "Tarayıcıda ücretsiz Texas Hold’em pokeri nasıl oynanır",
    ldDesc: "PokerTH web istemcisinde ücretsiz Texas Hold’em oynamak için adım adım kılavuz.",
    h1: "Tarayıcınızda ücretsiz online poker nasıl oynanır",
    lead: function (h, c) { return "Bu, boş bir sekmeden PokerTH’deki ilk Texas Hold’em elinize kadar olan kısa yol. Aradığınız kuralların kendisiyse — körler, bahis turları, hangi el hangisini yener — önce <a href=\"{rules}\">kurallar sayfasına</a> ve <a href=\"{hands}\">el sıralamasına</a> bakın.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Siteyi açın — kurulacak bir şey yok",
       "PokerTH tarayıcıda çalışır. İndirme yok, hesap yok, eklenti yok. Telefonda tarayıcı menüsünden ana ekrana ekleyebilirsiniz; o zaman bir uygulama gibi tam ekran açılır ve çevrimdışı da çalışır."],
      ["Nerede oynamak istediğinizi seçin",
       "Üç mod var. <strong>Çevrimdışı çalışma</strong> sizi doğrudan bilgisayar rakiplerinin olduğu bir masaya oturtur ve hiç bağlantı gerektirmez — öğrenmenin yeri burasıdır. <strong>pokerth.net</strong> resmî ağdır: gerçek rakipler, sezonluk sıralamalar ve bir kez kaydettiğiniz ücretsiz bir takma ad. <strong>LAN / özel sunucu</strong> sizinki ya da bir başkasınınki olsun, adanmış bir PokerTH sunucusuna bağlanır."],
      ["Bir masaya oturun",
       "Lobide ya listedeki bir masaya katılırsınız ya da kendi masanızı kurarsınız. Kurarken koltuk sayısını, başlangıç çipini, körlerin ne kadar hızlı yükseleceğini ve masanın parolalı olup olmayacağını belirlersiniz. Davet bağlantısını paylaşın; arkadaşınız hiçbir yere kayıt olmadan, kendi tarayıcısında doğrudan masanıza gelir."],
      ["Eli oynayın",
       "Size kapalı iki kart dağıtılır. Bahis flop öncesinde masayı dolaşır, sonra flop, turn ve river’dan sonra yeniden. Sıra size geldiğinde işlem çubuğu yanar ve yalnızca kurallara uyanı sunar: Fold, Check ya da Call, Raise ya da All-In. Tutarı yazabilir, kaydırıcıyla sürükleyebilir ya da tek dokunuşla Min, potun yarısı, pot veya tüm çipiniz olarak ayarlayabilirsiniz."],
      ["Masayı okuyun",
       "Kartlar açıldıkça o anki en iyi eliniz masanın altında adıyla yazılır. Pot, herkesin çipi ve kör seviyesi sürekli ekrandadır, dağıtıcı düğmesi en son kimin konuşacağını gösterir, geri sayım ise ne kadar süreniz kaldığını. Açılışta her eli oluşturan beş kart vurgulanır."],
      ["Turnuvayı kazanın",
       "PokerTH oyunları sit-and-go turnuvalarıdır: herkes aynı çiple başlar, körler saate göre yükselir ve tüm çipler tek kişide toplanana dek oyuncular elenir. Hiçbir şey para tutmaz ve çip satın alınamaz — hepsi oyun parasıdır, dolayısıyla ortada yalnızca oyunun kendisi vardır."]
    ],
    phoneH2: "Telefonda oynamak",
    phoneP: "Masa, masaüstü kadar dokunmatik ekran için de tasarlandı: bahis alanına dokunmak sistem klavyesi yerine işlem çubuğunun içinde bir tuş takımı açar, böylece masa hiç yerinden oynamaz; kaydırıcı da masaüstü istemcisiyle aynı adımlarla ilerler. Sıra bildirimleri üzerlerinde Fold ve Check/Call düğmeleriyle gelebilir, yani bir el sekmeye dönmeden oynanabilir.",
    friendsH2: "Arkadaşlarla oynamak",
    friendsP: "Bir masa kurun, özel olsun istiyorsanız parola koyun ve davet bağlantısını gönderin. Bağlantı masayı doğrudan açar — uygulamayı ana ekranına eklemişlerse kurulu uygulamada, aksi hâlde bir tarayıcı sekmesinde. Kimsenin bir şey kurması ya da e-posta adresi vermesi gerekmez.",
    faqH2: "Sık sorulanlar",
    faqP: function (h, c) { return "Hiçbir modda para söz konusu değildir. Ayarlarınız, stil paketleriniz ve çevrimdışı ilerlemeniz kendi cihazınızda kalır. Arayüz 45 dilde sunulur; beş işlem sözcüğü — Fold, Check, Call, Raise, All-In — dünyanın her masasında olduğu gibi İngilizce kalır. Gerisi <a href=\"{faq}\">SSS</a> sayfasında.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  uk: {
    title: "Як грати в покер онлайн безкоштовно — PokerTH Web",
    desc: "Покроково: грайте в техаський холдем безкоштовно прямо в браузері, без завантаження та без облікового запису — офлайн проти ботів, в офіційній мережі pokerth.net або за приватним столом із друзями.",
    ldHeadline: "Як безкоштовно грати в техаський холдем у браузері",
    ldDesc: "Покрокова інструкція, як безкоштовно грати в техаський холдем у вебклієнті PokerTH.",
    h1: "Як грати в покер онлайн, безкоштовно, просто в браузері",
    lead: function (h, c) { return "Це коротка версія: від порожньої вкладки до вашої першої роздачі техаського холдему в PokerTH. Якщо вам потрібні самі правила — блайнди, кола торгів, що чим б’ється — почніть зі <a href=\"{rules}\">сторінки правил</a> і з <a href=\"{hands}\">комбінацій</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Відкрийте сайт — установлювати нічого не треба",
       "PokerTH працює в браузері. Без завантаження, без облікового запису, без плагінів. На телефоні його можна додати на головний екран із меню браузера: тоді він відкривається як застосунок, на весь екран, і працює офлайн."],
      ["Оберіть, де хочете грати",
       "Три режими. <strong>Офлайн-тренування</strong> одразу садить вас за стіл із комп’ютерними суперниками й узагалі не потребує з’єднання — саме тут і вчаться. <strong>pokerth.net</strong> — офіційна мережа: живі суперники, сезонні рейтинги, безкоштовний нік, який реєструють один раз. <strong>LAN / приватний сервер</strong> під’єднує до виділеного сервера PokerTH — вашого або чужого."],
      ["Сядьте за стіл",
       "У лобі ви або приєднуєтеся до столу зі списку, або створюєте власний. Створюючи, задаєте кількість місць, стартовий стек, швидкість зростання блайндів і те, чи буде стіл під паролем. Поділіться посиланням-запрошенням — і друг потрапить прямо за ваш стіл, у своєму браузері, нічого не реєструючи."],
      ["Розіграйте роздачу",
       "Вам роздають дві закриті карти. Торги йдуть по колу до флопу, а потім ще раз після флопу, терну й риверу. Коли черга доходить до вас, панель дій засвічується й пропонує лише дозволене: Fold, Check або Call, Raise чи All-In. Суму можна ввести, потягнути повзунком або задати одним дотиком — Min, половина банку, банк чи весь стек."],
      ["Читайте стіл",
       "Ваша найкраща на цю мить комбінація підписана під бордом у міру виходу карт. Банк, кожен стек і рівень блайндів увесь час на екрані, кнопка дилера показує, хто говорить останнім, а зворотний відлік — скільки у вас часу. На розкритті підсвічуються ті п’ять карт, які склали кожну руку."],
      ["Виграйте турнір",
       "Ігри в PokerTH — це турніри sit-and-go: усі починають з однаковим стеком, блайнди зростають за таймером, гравці вибувають, доки в одного не опиняться всі фішки. Ніщо не коштує грошей, і фішки не можна купити — усе на умовні фішки, тож на кону лише сама гра."]
    ],
    phoneH2: "Гра на телефоні",
    phoneP: "Стіл розрахований на сенсорний екран не менше, ніж на комп’ютер: дотик до поля ставки відкриває цифрову клавіатуру всередині панелі дій, а не системну, тому стіл ніколи не стрибає, а повзунок рухається тими самими кроками, що й у настільному клієнті. Сповіщення про хід можуть приходити з кнопками Fold і Check/Call прямо на них, тож роздачу можна зіграти, не повертаючись у вкладку.",
    friendsH2: "Гра з друзями",
    friendsP: "Створіть стіл, поставте пароль, якщо хочете зробити його приватним, і надішліть посилання-запрошення. Воно відкриває стіл напряму — у встановленому застосунку, якщо його додали на головний екран, інакше у вкладці браузера. Нікому не треба нічого встановлювати чи лишати адресу пошти.",
    faqH2: "Часті запитання",
    faqP: function (h, c) { return "Справжні гроші не беруть участі в жодному режимі. Ваші налаштування, набори стилів і офлайн-прогрес лишаються на вашому пристрої. Інтерфейс доступний 45 мовами, а п’ять слів дій — Fold, Check, Call, Raise, All-In — лишаються англійськими, як за будь-яким столом у світі. Докладніше в <a href=\"{faq}\">FAQ</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  ja: {
    title: "ブラウザで無料ポーカーを遊ぶ方法 — PokerTH ウェブ版",
    desc: "手順で解説：ダウンロードもアカウントも不要で、ブラウザから無料でテキサスホールデムを。オフラインで対コンピュータ、公式 pokerth.net、あるいは友達だけのプライベートテーブルで。",
    ldHeadline: "ブラウザで無料のテキサスホールデムを遊ぶ方法",
    ldDesc: "PokerTH ウェブ版クライアントで無料のテキサスホールデムを遊ぶための手順ガイド。",
    h1: "ブラウザで無料のオンラインポーカーを遊ぶ方法",
    lead: function (h, c) { return "空のタブから PokerTH で最初のテキサスホールデムを配られるまでの、短い手順です。ルールそのもの——ブラインド、ベットラウンド、役の強さ——を知りたい場合は、まず<a href=\"{rules}\">ルールのページ</a>と<a href=\"{hands}\">役の強さ</a>をご覧ください。".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["サイトを開く——インストールするものはありません",
       "PokerTH はブラウザで動きます。ダウンロードもアカウントもプラグインも不要です。スマートフォンではブラウザのメニューからホーム画面に追加でき、アプリのように全画面で開き、オフラインでも動作します。"],
      ["どこで遊ぶかを選ぶ",
       "モードは3つです。<strong>オフライン練習</strong>はすぐにコンピュータ相手のテーブルを用意し、通信はいっさい不要です——覚えるならここから。<strong>pokerth.net</strong> は公式ネットワークで、実際の対戦相手、シーズンごとのランキング、一度登録するだけの無料のニックネームがあります。<strong>LAN／プライベートサーバー</strong>は、自分または誰かの専用 PokerTH サーバーに接続します。"],
      ["テーブルに着く",
       "ロビーでは一覧からテーブルに参加するか、自分で作成します。作成時には座席数、開始スタック、ブラインドの上がる速さ、パスワードの有無を設定できます。招待リンクを共有すれば、友達は何も登録せずに自分のブラウザからそのままあなたのテーブルに着きます。"],
      ["ハンドをプレイする",
       "手札が2枚配られます。ベットはフロップ前にテーブルを一周し、フロップ、ターン、リバーの後にもう一度行われます。自分の番になるとアクションバーが点灯し、その場で認められている選択肢だけを表示します：Fold、Check または Call、Raise または All-In。金額は入力、スライダー操作、あるいはワンタップで Min・ポットの半分・ポット・全スタックに設定できます。"],
      ["テーブルを読む",
       "カードが開かれるたびに、現在のあなたの最強の役がボードの下に表示されます。ポット、各プレイヤーのスタック、ブラインドのレベルは常に画面上にあり、ディーラーボタンは誰が最後に行動するかを示し、カウントダウンが残り時間を知らせます。ショーダウンでは、それぞれの役を作った5枚が強調表示されます。"],
      ["トーナメントで勝つ",
       "PokerTH のゲームはシット＆ゴー形式のトーナメントです。全員が同じスタックで始まり、ブラインドは時間で上がり、1人がすべてのチップを持つまで脱落が続きます。費用は一切かからず、チップを購入することもできません——すべて遊び用のチップなので、賭かっているのはゲームそのものだけです。"]
    ],
    phoneH2: "スマートフォンで遊ぶ",
    phoneP: "テーブルはデスクトップと同じくらいタッチ操作を前提に作られています。ベット欄をタップするとシステムのキーボードではなくアクションバー内にテンキーが開くため、テーブルがずれることがありません。スライダーの刻み幅もデスクトップ版と同じです。手番の通知には Fold と Check/Call のボタンを付けられるので、タブに戻らなくても1ハンド打ち切れます。",
    friendsH2: "友達と遊ぶ",
    friendsP: "テーブルを作り、非公開にしたければパスワードを設定して、招待リンクを送るだけです。リンクはテーブルを直接開きます——ホーム画面に追加済みならインストールされたアプリで、そうでなければブラウザのタブで。誰も何かをインストールする必要はなく、メールアドレスを渡す必要もありません。",
    faqH2: "よくある質問",
    faqP: function (h, c) { return "どのモードでもお金は一切関係ありません。設定、スタイルパック、オフラインの進行状況はすべて自分の端末に残ります。インターフェイスは45言語で利用でき、5つのアクション用語——Fold、Check、Call、Raise、All-In——は世界中のテーブルと同じく英語のままです。詳しくは<a href=\"{faq}\">よくある質問</a>をご覧ください。".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  ko: {
    title: "브라우저에서 무료로 포커 하는 방법 — PokerTH 웹",
    desc: "단계별 안내: 다운로드도 계정도 없이 브라우저에서 무료로 텍사스 홀덤을 즐기세요 — 오프라인으로 컴퓨터와, 공식 pokerth.net 네트워크에서, 또는 친구들과 비공개 테이블에서.",
    ldHeadline: "브라우저에서 무료로 텍사스 홀덤 하는 방법",
    ldDesc: "PokerTH 웹 클라이언트에서 무료로 텍사스 홀덤을 즐기기 위한 단계별 안내.",
    h1: "브라우저에서 무료로 온라인 포커 하는 방법",
    lead: function (h, c) { return "빈 탭에서 시작해 PokerTH에서 첫 텍사스 홀덤 핸드를 받기까지의 간단한 안내입니다. 규칙 자체 — 블라인드, 베팅 라운드, 무엇이 무엇을 이기는지 — 가 궁금하시다면 <a href=\"{rules}\">규칙 페이지</a>와 <a href=\"{hands}\">포커 족보</a>를 먼저 보세요.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["사이트를 엽니다 — 설치할 것은 없습니다",
       "PokerTH는 브라우저에서 돌아갑니다. 다운로드도, 계정도, 플러그인도 필요 없습니다. 휴대폰에서는 브라우저 메뉴로 홈 화면에 추가할 수 있고, 그러면 앱처럼 전체 화면으로 열리며 오프라인에서도 동작합니다."],
      ["어디서 플레이할지 고릅니다",
       "세 가지 모드가 있습니다. <strong>오프라인 연습</strong>은 곧바로 컴퓨터 상대가 앉은 테이블을 열어 주고 연결이 전혀 필요 없습니다 — 배우기에 가장 좋은 곳입니다. <strong>pokerth.net</strong>은 공식 네트워크로, 실제 상대와 시즌 랭킹이 있고 닉네임은 한 번만 무료로 등록하면 됩니다. <strong>LAN / 개인 서버</strong>는 본인이나 다른 사람의 전용 PokerTH 서버에 접속합니다."],
      ["테이블에 앉습니다",
       "로비에서 목록의 테이블에 참여하거나 직접 하나를 만들 수 있습니다. 만들 때는 좌석 수, 시작 칩, 블라인드가 오르는 속도, 비밀번호 설정 여부를 정합니다. 초대 링크를 공유하면 친구는 아무것도 등록하지 않고 자기 브라우저에서 곧장 당신의 테이블로 들어옵니다."],
      ["핸드를 플레이합니다",
       "비공개 카드 두 장을 받습니다. 베팅은 플롭 전에 테이블을 한 바퀴 돌고, 플롭·턴·리버 뒤에 다시 돌아갑니다. 차례가 오면 액션 바가 켜지면서 지금 가능한 선택지만 보여 줍니다: Fold, Check 또는 Call, Raise 또는 All-In. 금액은 직접 입력하거나 슬라이더로 끌거나, 최소·팟의 절반·팟·전체 칩 중 하나를 한 번에 누를 수 있습니다."],
      ["테이블을 읽습니다",
       "카드가 열릴 때마다 현재 당신의 최고 핸드 이름이 보드 아래에 표시됩니다. 팟, 각자의 칩, 블라인드 레벨이 항상 화면에 있고, 딜러 버튼은 누가 마지막에 행동하는지 알려 주며, 카운트다운이 남은 시간을 보여 줍니다. 쇼다운에서는 각 핸드를 이룬 다섯 장이 강조됩니다."],
      ["토너먼트에서 우승합니다",
       "PokerTH의 게임은 싯앤고 토너먼트입니다. 모두 같은 칩으로 시작하고 블라인드는 시간에 따라 오르며, 한 사람이 모든 칩을 가질 때까지 탈락이 이어집니다. 돈이 드는 일은 전혀 없고 칩을 살 수도 없습니다 — 전부 가상 칩이라 걸린 것은 게임 그 자체뿐입니다."]
    ],
    phoneH2: "휴대폰에서 플레이하기",
    phoneP: "테이블은 데스크톱만큼이나 터치 화면을 염두에 두고 만들었습니다. 베팅 칸을 누르면 시스템 키보드 대신 액션 바 안에 숫자판이 열리므로 테이블이 흔들리지 않고, 슬라이더도 데스크톱 클라이언트와 같은 단위로 움직입니다. 차례 알림에는 Fold와 Check/Call 버튼을 함께 띄울 수 있어서 탭으로 돌아가지 않고도 한 핸드를 끝낼 수 있습니다.",
    friendsH2: "친구와 플레이하기",
    friendsP: "테이블을 만들고, 비공개로 하고 싶다면 비밀번호를 걸고, 초대 링크를 보내면 됩니다. 링크는 테이블을 바로 엽니다 — 홈 화면에 앱을 추가해 두었다면 설치된 앱에서, 아니면 브라우저 탭에서. 아무도 무언가를 설치하거나 이메일 주소를 넘길 필요가 없습니다.",
    faqH2: "자주 묻는 질문",
    faqP: function (h, c) { return "어떤 모드에서도 돈이 오가지 않습니다. 설정, 스타일 팩, 오프라인 진행 상황은 모두 본인 기기에 남습니다. 인터페이스는 45개 언어로 제공되며, 다섯 개의 액션 단어 — Fold, Check, Call, Raise, All-In — 는 전 세계 어느 테이블에서나 그렇듯 영어 그대로입니다. 자세한 내용은 <a href=\"{faq}\">자주 묻는 질문</a>에 있습니다.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  id: {
    title: "Cara main poker online gratis — PokerTH Web",
    desc: "Langkah demi langkah: main poker Texas Hold’em gratis di peramban, tanpa unduhan dan tanpa akun — offline melawan bot, di jaringan resmi pokerth.net, atau di meja privat bersama teman.",
    ldHeadline: "Cara main poker Texas Hold’em gratis di peramban",
    ldDesc: "Panduan langkah demi langkah untuk main Texas Hold’em gratis di klien web PokerTH.",
    h1: "Cara main poker online gratis, langsung di peramban",
    lead: function (h, c) { return "Ini versi singkatnya: dari tab kosong sampai kartu Texas Hold’em pertama Anda di PokerTH. Kalau yang Anda cari aturan mainnya sendiri — blind, ronde taruhan, kartu apa mengalahkan apa — mulailah dari <a href=\"{rules}\">halaman aturan</a> dan <a href=\"{hands}\">peringkat kartu</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Buka situsnya — tidak ada yang perlu dipasang",
       "PokerTH berjalan di peramban. Tanpa unduhan, tanpa akun, tanpa pengaya. Di ponsel Anda bisa menambahkannya ke layar utama lewat menu peramban; ia lalu terbuka seperti aplikasi, layar penuh, dan tetap jalan tanpa koneksi."],
      ["Pilih tempat Anda ingin bermain",
       "Ada tiga mode. <strong>Latihan offline</strong> langsung mendudukkan Anda di meja berisi lawan komputer dan sama sekali tidak perlu koneksi — di sinilah tempat belajar. <strong>pokerth.net</strong> adalah jaringan resmi: lawan sungguhan, peringkat musiman, dan nama panggilan gratis yang didaftarkan sekali saja. <strong>LAN / server pribadi</strong> menyambung ke server PokerTH khusus, milik Anda atau milik orang lain."],
      ["Duduk di sebuah meja",
       "Di lobi, Anda bisa bergabung ke meja dari daftar atau membuat meja sendiri. Saat membuatnya, Anda menentukan jumlah kursi, chip awal, seberapa cepat blind naik, dan apakah meja dilindungi kata sandi. Bagikan tautan undangan, dan teman Anda mendarat langsung di meja Anda, lewat peramban mereka, tanpa mendaftar apa pun."],
      ["Mainkan kartunya",
       "Anda dibagikan dua kartu tertutup. Taruhan berputar mengelilingi meja sebelum flop, lalu sekali lagi setelah flop, turn, dan river. Ketika giliran Anda, bilah aksi menyala dan hanya menawarkan yang sah: Fold, Check atau Call, Raise atau All-In. Jumlah taruhan bisa diketik, digeser lewat penggeser, atau disetel sekali sentuh ke Min, separuh pot, seluruh pot, atau semua chip Anda."],
      ["Baca mejanya",
       "Susunan terbaik Anda saat itu tertulis di bawah meja seiring kartu dibuka. Pot, chip setiap pemain, dan tingkat blind selalu ada di layar, tombol dealer menunjukkan siapa yang bicara terakhir, dan hitung mundur menampilkan sisa waktu Anda. Saat showdown, lima kartu yang membentuk tiap susunan disorot."],
      ["Menangkan turnamennya",
       "Permainan di PokerTH berbentuk turnamen sit-and-go: semua mulai dengan chip yang sama, blind naik menurut waktu, dan pemain tersingkir satu per satu sampai satu orang memegang seluruh chip. Tidak ada yang berbayar dan chip tidak bisa dibeli — semuanya chip main-main, jadi yang dipertaruhkan hanyalah permainannya sendiri."]
    ],
    phoneH2: "Bermain di ponsel",
    phoneP: "Meja dirancang untuk layar sentuh sama seriusnya dengan untuk komputer: menyentuh kolom taruhan membuka papan angka di dalam bilah aksi, bukan papan ketik sistem, sehingga meja tidak pernah melompat-lompat, dan penggeser bergerak dengan langkah yang sama seperti klien desktop. Notifikasi giliran bisa datang lengkap dengan tombol Fold dan Check/Call, jadi satu putaran bisa dimainkan tanpa kembali ke tab.",
    friendsH2: "Bermain bersama teman",
    friendsP: "Buat meja, beri kata sandi kalau ingin privat, lalu kirim tautan undangan. Tautan itu membuka mejanya langsung — di aplikasi yang terpasang bila mereka sudah menambahkannya ke layar utama, atau di tab peramban bila belum. Tidak ada yang perlu memasang apa pun atau menyerahkan alamat surel.",
    faqH2: "Pertanyaan umum",
    faqP: function (h, c) { return "Tidak ada uang yang terlibat, di mode mana pun. Pengaturan, paket gaya, dan kemajuan offline Anda tetap di perangkat sendiri. Antarmukanya tersedia dalam 45 bahasa, sementara lima kata aksi — Fold, Check, Call, Raise, All-In — tetap dalam bahasa Inggris, seperti di meja mana pun di dunia. Selengkapnya di <a href=\"{faq}\">tanya jawab</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  vi: {
    title: "Cách chơi poker trực tuyến miễn phí — PokerTH Web",
    desc: "Từng bước: chơi poker Texas Hold’em miễn phí ngay trên trình duyệt, không cần tải và không cần tài khoản — chơi ngoại tuyến với máy, trên mạng chính thức pokerth.net, hoặc ở bàn riêng với bạn bè.",
    ldHeadline: "Cách chơi poker Texas Hold’em miễn phí trên trình duyệt",
    ldDesc: "Hướng dẫn từng bước để chơi Texas Hold’em miễn phí trên ứng dụng web PokerTH.",
    h1: "Cách chơi poker trực tuyến miễn phí ngay trên trình duyệt",
    lead: function (h, c) { return "Đây là bản rút gọn: từ một tab trống đến ván Texas Hold’em đầu tiên của bạn trên PokerTH. Nếu bạn cần chính luật chơi — tiền cược mù, các vòng cược, bài nào thắng bài nào — hãy bắt đầu từ <a href=\"{rules}\">trang luật chơi</a> và <a href=\"{hands}\">thứ tự các tay bài</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Mở trang web — không có gì phải cài đặt",
       "PokerTH chạy ngay trong trình duyệt. Không tải về, không tài khoản, không tiện ích mở rộng. Trên điện thoại, bạn có thể thêm vào màn hình chính từ menu trình duyệt: khi đó nó mở như một ứng dụng, toàn màn hình, và vẫn dùng được khi không có mạng."],
      ["Chọn nơi bạn muốn chơi",
       "Có ba chế độ. <strong>Luyện tập ngoại tuyến</strong> xếp bạn vào bàn với các đối thủ máy ngay lập tức và hoàn toàn không cần kết nối — đây là chỗ để học. <strong>pokerth.net</strong> là mạng chính thức: đối thủ thật, bảng xếp hạng theo mùa, một biệt danh miễn phí chỉ cần đăng ký một lần. <strong>LAN / máy chủ riêng</strong> kết nối tới một máy chủ PokerTH chuyên dụng, của bạn hoặc của người khác."],
      ["Ngồi vào bàn",
       "Ở sảnh, bạn có thể vào một bàn trong danh sách hoặc tự tạo bàn. Khi tạo, bạn đặt số ghế, số chip khởi đầu, tốc độ tăng tiền cược mù và có đặt mật khẩu hay không. Chia sẻ liên kết mời, bạn bè sẽ vào thẳng bàn của bạn, ngay trên trình duyệt của họ, không phải đăng ký gì cả."],
      ["Chơi ván bài",
       "Bạn được chia hai lá tẩy. Vòng cược đi quanh bàn trước khi lật bài chung, rồi lặp lại sau flop, turn và river. Đến lượt bạn, thanh thao tác sáng lên và chỉ đưa ra những lựa chọn hợp lệ: Fold, Check hoặc Call, Raise hoặc All-In. Số tiền cược có thể gõ vào, kéo trên thanh trượt, hoặc đặt bằng một chạm ở mức Min, nửa pot, cả pot hay toàn bộ chip của bạn."],
      ["Đọc bàn chơi",
       "Tay bài mạnh nhất hiện tại của bạn được ghi tên ngay dưới bài chung khi các lá được lật. Pot, số chip của từng người và mức cược mù luôn hiển thị trên màn hình, nút chia bài cho biết ai nói sau cùng, và đồng hồ đếm ngược cho biết bạn còn bao nhiêu thời gian. Khi lật bài, năm lá tạo nên mỗi tay bài được làm nổi bật."],
      ["Thắng giải đấu",
       "Các ván PokerTH là giải sit-and-go: mọi người bắt đầu với cùng số chip, tiền cược mù tăng theo đồng hồ, và người chơi lần lượt bị loại cho đến khi một người giữ toàn bộ chip. Không tốn tiền và cũng không mua được chip — tất cả đều là chip ảo, nên thứ duy nhất đặt cược chính là ván bài."]
    ],
    phoneH2: "Chơi trên điện thoại",
    phoneP: "Bàn chơi được thiết kế cho màn hình cảm ứng không kém gì cho máy tính: chạm vào ô cược sẽ mở bàn phím số ngay trong thanh thao tác thay vì bàn phím hệ thống, nên bàn chơi không bao giờ bị nhảy, và thanh trượt di chuyển theo đúng các bước như ứng dụng máy tính. Thông báo đến lượt có thể kèm sẵn nút Fold và Check/Call, nhờ vậy bạn chơi hết một ván mà không cần quay lại tab.",
    friendsH2: "Chơi cùng bạn bè",
    friendsP: "Tạo một bàn, đặt mật khẩu nếu muốn riêng tư, rồi gửi liên kết mời. Liên kết mở thẳng bàn chơi — trong ứng dụng đã cài nếu họ đã thêm vào màn hình chính, còn không thì trong một tab trình duyệt. Không ai phải cài gì hay đưa địa chỉ email.",
    faqH2: "Câu hỏi thường gặp",
    faqP: function (h, c) { return "Không có tiền thật ở bất kỳ chế độ nào. Cài đặt, gói giao diện và tiến trình ngoại tuyến của bạn đều nằm trên thiết bị của bạn. Giao diện có 45 ngôn ngữ, còn năm từ thao tác — Fold, Check, Call, Raise, All-In — vẫn giữ nguyên tiếng Anh, như ở mọi bàn poker trên thế giới. Xem thêm ở <a href=\"{faq}\">câu hỏi thường gặp</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  ar: {
    title: "كيف تلعب البوكر مجانًا على الإنترنت — PokerTH ويب",
    desc: "خطوة بخطوة: العب بوكر تكساس هولدم مجانًا في متصفحك، دون تنزيل ودون حساب — بلا اتصال أمام خصوم الحاسوب، على شبكة pokerth.net الرسمية، أو على طاولة خاصة مع الأصدقاء.",
    ldHeadline: "كيف تلعب بوكر تكساس هولدم مجانًا في المتصفح",
    ldDesc: "دليل خطوة بخطوة للعب تكساس هولدم مجانًا في عميل PokerTH على الويب.",
    h1: "كيف تلعب البوكر على الإنترنت مجانًا، من متصفحك",
    lead: function (h, c) { return "هذه النسخة المختصرة: من لسان تبويب فارغ إلى أول يد تكساس هولدم لك في PokerTH. أما إن كنت تبحث عن القواعد نفسها — الرهانات العمياء، جولات المراهنة، وأي يد تغلب أيها — فابدأ من <a href=\"{rules}\">صفحة القواعد</a> ومن <a href=\"{hands}\">ترتيب الأيدي</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["افتح الموقع — لا شيء لتثبيته",
       "يعمل PokerTH داخل المتصفح. لا تنزيل ولا حساب ولا إضافات. على الهاتف يمكنك إضافته إلى الشاشة الرئيسية من قائمة المتصفح، فيفتح عندها كتطبيق بملء الشاشة ويعمل دون اتصال."],
      ["اختر أين تريد اللعب",
       "ثلاثة أوضاع. <strong>التدرّب دون اتصال</strong> يجلسك فورًا إلى طاولة من خصوم يديرهم الحاسوب ولا يحتاج اتصالًا البتة — وهو المكان الذي تتعلم فيه. <strong>pokerth.net</strong> هي الشبكة الرسمية: خصوم حقيقيون وتصنيفات موسمية واسم لاعب مجاني تسجّله مرة واحدة. أما <strong>الشبكة المحلية / الخادم الخاص</strong> فيصلك بخادم PokerTH مخصّص، خادمك أو خادم شخص آخر."],
      ["اجلس إلى طاولة",
       "في الردهة إمّا تنضم إلى طاولة من القائمة أو تنشئ طاولتك. عند الإنشاء تحدّد عدد المقاعد ورصيد البداية وسرعة ارتفاع الرهانات العمياء وما إذا كانت الطاولة محمية بكلمة مرور. شارك رابط الدعوة، فيصل صديقك مباشرة إلى طاولتك، من متصفحه، دون أن يسجّل أي شيء."],
      ["العب اليد",
       "تُوزَّع لك ورقتان مغلقتان. تدور المراهنة حول الطاولة قبل الفلوب، ثم مرة أخرى بعد الفلوب والتيرن والريفر. حين يحين دورك يضيء شريط الإجراءات ولا يعرض إلا ما هو مسموح: Fold أو Check أو Call أو Raise أو All-In. ويمكن كتابة المبلغ أو سحبه على المؤشر أو ضبطه بلمسة واحدة على الحد الأدنى أو نصف القدر أو القدر كله أو كامل رصيدك."],
      ["اقرأ الطاولة",
       "تُكتب أفضل يد لديك في تلك اللحظة أسفل أوراق الطاولة كلما ظهرت ورقة جديدة. يبقى القدر ورصيد كل لاعب ومستوى الرهانات العمياء على الشاشة طوال الوقت، ويبيّن زر الموزّع من يتكلم أخيرًا، ويعرض العدّاد كم بقي لك من وقت. وعند كشف الأوراق تُبرَز الأوراق الخمس التي كوّنت كل يد."],
      ["اربح البطولة",
       "مباريات PokerTH بطولات من نوع sit-and-go: يبدأ الجميع برصيد واحد، وترتفع الرهانات العمياء بحسب المؤقّت، ويخرج اللاعبون تباعًا حتى يجمع واحد كل الرقائق. لا شيء يكلّف مالًا ولا يمكن شراء الرقائق — كلها رقائق لعب، فالمطروح على الطاولة هو اللعبة نفسها لا غير."]
    ],
    phoneH2: "اللعب على الهاتف",
    phoneP: "صُمّمت الطاولة لشاشة اللمس بقدر ما صُمّمت للحاسوب: لمس حقل الرهان يفتح لوحة أرقام داخل شريط الإجراءات بدل لوحة مفاتيح النظام، فلا تقفز الطاولة أبدًا، ويتحرك المؤشر بالخطوات نفسها المعتمدة في عميل سطح المكتب. وقد تصلك إشعارات الدور وعليها زرّا Fold وCheck/Call مباشرة، فتلعب اليد كاملة دون العودة إلى لسان التبويب.",
    friendsH2: "اللعب مع الأصدقاء",
    friendsP: "أنشئ طاولة، وضع كلمة مرور إن أردتها خاصة، وأرسل رابط الدعوة. يفتح الرابط الطاولة مباشرة — في التطبيق المثبّت إن كانوا قد أضافوه إلى شاشتهم الرئيسية، وفي لسان تبويب في المتصفح إن لم يفعلوا. لا أحد مضطر إلى تثبيت شيء أو إعطاء بريده الإلكتروني.",
    faqH2: "أسئلة شائعة",
    faqP: function (h, c) { return "لا مال في الأمر إطلاقًا، في أي وضع. تبقى إعداداتك وحزم الأنماط وتقدّمك دون اتصال على جهازك أنت. الواجهة متاحة بخمس وأربعين لغة، بينما تبقى كلمات الإجراءات الخمس — Fold وCheck وCall وRaise وAll-In — بالإنجليزية، كما هي على كل طاولة في العالم. والمزيد في <a href=\"{faq}\">الأسئلة الشائعة</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  fa: {
    title: "چطور رایگان پوکر آنلاین بازی کنیم — PokerTH وب",
    desc: "گام‌به‌گام: پوکر تگزاس هولدم را رایگان در مرورگر خود بازی کنید، بدون دانلود و بدون حساب کاربری — آفلاین مقابل حریفان رایانه‌ای، در شبکهٔ رسمی pokerth.net، یا سر میزی خصوصی با دوستان.",
    ldHeadline: "چطور در مرورگر رایگان تگزاس هولدم بازی کنیم",
    ldDesc: "راهنمای گام‌به‌گام بازی رایگان تگزاس هولدم در کلاینت وب PokerTH.",
    h1: "چطور رایگان پوکر آنلاین بازی کنیم، همان‌جا در مرورگر",
    lead: function (h, c) { return "این نسخهٔ کوتاه است: از یک زبانهٔ خالی تا نخستین دست تگزاس هولدم شما در PokerTH. اگر خودِ قوانین را می‌خواهید — بلایندها، دورهای شرط‌بندی، اینکه چه دستی چه دستی را می‌برد — نخست <a href=\"{rules}\">صفحهٔ قوانین</a> و <a href=\"{hands}\">رتبه‌بندی دست‌ها</a> را بخوانید.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["سایت را باز کنید — چیزی برای نصب وجود ندارد",
       "PokerTH در مرورگر اجرا می‌شود. بدون دانلود، بدون حساب کاربری، بدون افزونه. روی گوشی می‌توانید از منوی مرورگر آن را به صفحهٔ اصلی اضافه کنید؛ آن‌گاه مثل یک برنامه تمام‌صفحه باز می‌شود و آفلاین هم کار می‌کند."],
      ["انتخاب کنید کجا بازی کنید",
       "سه حالت وجود دارد. <strong>تمرین آفلاین</strong> بی‌درنگ شما را سر میزی از حریفان رایانه‌ای می‌نشاند و اصلاً به اتصال نیاز ندارد — جای یادگیری همین‌جاست. <strong>pokerth.net</strong> شبکهٔ رسمی است: حریفان واقعی، رتبه‌بندی فصلی، و یک نام مستعار رایگان که یک‌بار ثبت می‌کنید. <strong>شبکهٔ محلی / سرور خصوصی</strong> شما را به یک سرور اختصاصی PokerTH وصل می‌کند، مال خودتان یا کس دیگری."],
      ["سر یک میز بنشینید",
       "در لابی یا به میزی از فهرست می‌پیوندید یا میز خودتان را می‌سازید. هنگام ساختن، تعداد صندلی‌ها، موجودی آغازین، سرعت بالا رفتن بلایندها و داشتن یا نداشتن رمز را تعیین می‌کنید. پیوند دعوت را بفرستید تا دوستتان مستقیم سر میز شما بیاید، در مرورگر خودش، بدون ثبت‌نام هیچ چیزی."],
      ["دست را بازی کنید",
       "دو کارت بسته به شما داده می‌شود. شرط‌بندی پیش از فلاپ دور میز می‌چرخد و پس از فلاپ، ترن و ریور دوباره تکرار می‌شود. وقتی نوبت شما شد، نوار کنش روشن می‌شود و فقط گزینه‌های مجاز را نشان می‌دهد: Fold، Check یا Call، Raise یا All-In. مبلغ را می‌توان تایپ کرد، با لغزنده کشید، یا با یک لمس روی حداقل، نصف پات، کل پات یا تمام موجودی گذاشت."],
      ["میز را بخوانید",
       "با باز شدن کارت‌ها، بهترین دست فعلی شما زیر میز نوشته می‌شود. پات، موجودی هر بازیکن و سطح بلایند همیشه روی صفحه‌اند، دکمهٔ دیلر نشان می‌دهد چه کسی آخر حرف می‌زند، و شمارش معکوس می‌گوید چقدر وقت دارید. در شودان، همان پنج کارتی که هر دست را ساخته‌اند برجسته می‌شوند."],
      ["مسابقه را ببرید",
       "بازی‌های PokerTH تورنمنت‌های sit-and-go هستند: همه با موجودی یکسان شروع می‌کنند، بلایندها با زمان بالا می‌روند و بازیکنان حذف می‌شوند تا یک نفر همهٔ ژتون‌ها را در دست بگیرد. هیچ چیز پول نمی‌خواهد و ژتون هم خریدنی نیست — همه‌چیز ژتون بازی است، پس تنها چیزی که در میان است خودِ بازی است."]
    ],
    phoneH2: "بازی روی گوشی",
    phoneP: "میز به همان اندازه که برای رایانه ساخته شده برای صفحهٔ لمسی هم طراحی شده است: لمس کادر شرط به‌جای صفحه‌کلید سیستم، یک صفحه‌کلید عددی درون نوار کنش باز می‌کند، بنابراین میز هرگز جابه‌جا نمی‌شود، و لغزنده با همان گام‌های کلاینت دسکتاپ حرکت می‌کند. اعلان نوبت می‌تواند با دکمه‌های Fold و Check/Call روی خودش برسد، پس می‌شود یک دست را بدون بازگشت به زبانه بازی کرد.",
    friendsH2: "بازی با دوستان",
    friendsP: "میزی بسازید، اگر می‌خواهید خصوصی باشد رمز بگذارید، و پیوند دعوت را بفرستید. این پیوند میز را مستقیم باز می‌کند — در برنامهٔ نصب‌شده اگر آن را به صفحهٔ اصلی افزوده باشند، وگرنه در یک زبانهٔ مرورگر. هیچ‌کس لازم نیست چیزی نصب کند یا نشانی ایمیلش را بدهد.",
    faqH2: "پرسش‌های پرتکرار",
    faqP: function (h, c) { return "در هیچ حالتی پول واقعی در کار نیست. تنظیمات، بسته‌های ظاهری و پیشرفت آفلاین شما روی دستگاه خودتان می‌ماند. رابط کاربری به ۴۵ زبان در دسترس است، در حالی که پنج واژهٔ کنش — Fold، Check، Call، Raise، All-In — مانند هر میز دیگری در جهان انگلیسی می‌مانند. بیشتر در <a href=\"{faq}\">پرسش‌های پرتکرار</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  he: {
    title: "איך משחקים פוקר אונליין בחינם — PokerTH ווב",
    desc: "שלב אחר שלב: לשחק פוקר טקסס הולדם בחינם בדפדפן, בלי הורדה ובלי חשבון — לא מקוון מול המחשב, ברשת הרשמית pokerth.net, או בשולחן פרטי עם חברים.",
    ldHeadline: "איך לשחק פוקר טקסס הולדם בחינם בדפדפן",
    ldDesc: "מדריך שלב אחר שלב לשחק טקסס הולדם בחינם בלקוח הווב של PokerTH.",
    h1: "איך משחקים פוקר אונליין בחינם, ישר מהדפדפן",
    lead: function (h, c) { return "זו הגרסה הקצרה: מלשונית ריקה ועד היד הראשונה שלכם בטקסס הולדם ב־PokerTH. אם מה שאתם מחפשים הוא החוקים עצמם — עיוורים, סבבי הימורים, מה מנצח את מה — התחילו דווקא ב<a href=\"{rules}\">עמוד החוקים</a> וב<a href=\"{hands}\">דירוג הידיים</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["פותחים את האתר — אין מה להתקין",
       "PokerTH רץ בדפדפן. בלי הורדה, בלי חשבון, בלי תוסף. בטלפון אפשר להוסיף אותו למסך הבית מתפריט הדפדפן, ואז הוא נפתח כמו אפליקציה, במסך מלא, ועובד גם ללא חיבור."],
      ["בוחרים איפה לשחק",
       "שלושה מצבים. <strong>אימון לא מקוון</strong> מושיב אתכם מיד לשולחן של יריבי מחשב ואינו דורש חיבור כלל — כאן לומדים. <strong>pokerth.net</strong> היא הרשת הרשמית: יריבים אמיתיים, דירוגים עונתיים וכינוי חינמי שנרשם פעם אחת. <strong>רשת מקומית / שרת פרטי</strong> מתחבר לשרת PokerTH ייעודי, שלכם או של מישהו אחר."],
      ["מתיישבים לשולחן",
       "בלובי אפשר להצטרף לשולחן מהרשימה או ליצור שולחן משלכם. ביצירה קובעים את מספר המושבים, את הערימה ההתחלתית, את קצב עליית העיוורים ואם השולחן מוגן בסיסמה. שתפו את קישור ההזמנה וחבר יגיע ישירות לשולחן שלכם, בדפדפן שלו, בלי להירשם לשום דבר."],
      ["משחקים את היד",
       "מחלקים לכם שני קלפים סגורים. ההימורים עוברים סביב השולחן לפני הפלופ, ושוב אחרי הפלופ, הטרן והריבר. כשמגיע תורכם, סרגל הפעולות נדלק ומציע רק את מה שמותר: Fold, Check או Call, Raise או All-In. את הסכום אפשר להקליד, לגרור על המחוון, או לקבוע בנגיעה אחת על מינימום, חצי מהקופה, הקופה כולה או כל הערימה שלכם."],
      ["קוראים את השולחן",
       "היד הטובה ביותר שלכם ברגע נתון נכתבת מתחת לשולחן ככל שהקלפים יוצאים. הקופה, כל ערימה ורמת העיוורים מוצגות כל הזמן, כפתור הדילר מראה מי מדבר אחרון, וספירה לאחור מראה כמה זמן נותר לכם. בשואודאון מודגשים חמשת הקלפים שהרכיבו כל יד."],
      ["מנצחים בטורניר",
       "המשחקים ב־PokerTH הם טורנירי sit-and-go: כולם מתחילים עם אותה ערימה, העיוורים עולים לפי שעון, ושחקנים נפלטים עד שאחד מחזיק בכל הז'טונים. שום דבר לא עולה כסף ואי אפשר לקנות ז'טונים — הכול כסף משחק, ולכן היחיד שמונח על השולחן הוא המשחק עצמו."]
    ],
    phoneH2: "לשחק בטלפון",
    phoneP: "השולחן בנוי למסך מגע לא פחות מאשר למחשב: נגיעה בשדה ההימור פותחת לוח מקשים מספרי בתוך סרגל הפעולות במקום את מקלדת המערכת, כך שהשולחן לעולם אינו קופץ, והמחוון זז באותם צעדים כמו בלקוח שולחן העבודה. התראות תור יכולות להגיע אליכם עם כפתורי Fold ו־Check/Call עליהן, כך שאפשר לשחק יד שלמה בלי לחזור ללשונית.",
    friendsH2: "לשחק עם חברים",
    friendsP: "צרו שולחן, הוסיפו סיסמה אם אתם רוצים אותו פרטי, ושלחו את קישור ההזמנה. הוא פותח את השולחן ישירות — באפליקציה המותקנת אם הוסיפו אותה למסך הבית, ובלשונית דפדפן אם לא. אף אחד לא צריך להתקין כלום או למסור כתובת דוא\"ל.",
    faqH2: "שאלות נפוצות",
    faqP: function (h, c) { return "כסף אמיתי אינו מעורב בשום מצב. ההגדרות שלכם, חבילות העיצוב וההתקדמות הלא מקוונת נשארות במכשיר שלכם. הממשק זמין ב־45 שפות, בעוד חמש מילות הפעולה — Fold, Check, Call, Raise, All-In — נשארות באנגלית, כמו בכל שולחן בעולם. עוד ב<a href=\"{faq}\">שאלות הנפוצות</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  ur: {
    title: "مفت آن لائن پوکر کیسے کھیلیں — PokerTH ویب",
    desc: "قدم بہ قدم: اپنے براؤزر میں مفت ٹیکساس ہولڈم پوکر کھیلیں، بغیر ڈاؤن لوڈ اور بغیر اکاؤنٹ کے — آف لائن کمپیوٹر کے مقابل، سرکاری pokerth.net نیٹ ورک پر، یا دوستوں کے ساتھ نجی میز پر۔",
    ldHeadline: "براؤزر میں مفت ٹیکساس ہولڈم پوکر کیسے کھیلیں",
    ldDesc: "PokerTH ویب کلائنٹ میں مفت ٹیکساس ہولڈم کھیلنے کی قدم بہ قدم رہنمائی۔",
    h1: "اپنے براؤزر میں مفت آن لائن پوکر کیسے کھیلیں",
    lead: function (h, c) { return "یہ مختصر صورت ہے: ایک خالی ٹیب سے لے کر PokerTH پر آپ کے پہلے ٹیکساس ہولڈم ہاتھ تک۔ اگر آپ کو خود قواعد درکار ہیں — بلائنڈز، بیٹنگ کے راؤنڈ، کون سا ہاتھ کس کو ہراتا ہے — تو پہلے <a href=\"{rules}\">قواعد کا صفحہ</a> اور <a href=\"{hands}\">ہاتھوں کی درجہ بندی</a> دیکھ لیں۔".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["سائٹ کھولیں — انسٹال کرنے کو کچھ نہیں",
       "PokerTH براؤزر میں چلتا ہے۔ نہ ڈاؤن لوڈ، نہ اکاؤنٹ، نہ کوئی پلگ ان۔ فون پر آپ اسے براؤزر کے مینو سے ہوم اسکرین پر شامل کر سکتے ہیں؛ پھر یہ ایک ایپ کی طرح پوری اسکرین پر کھلتا ہے اور آف لائن بھی کام کرتا ہے۔"],
      ["منتخب کریں کہ کہاں کھیلنا ہے",
       "تین طریقے ہیں۔ <strong>آف لائن مشق</strong> آپ کو فوراً کمپیوٹر کے حریفوں والی میز پر بٹھا دیتی ہے اور اسے کسی کنیکشن کی ضرورت ہی نہیں — سیکھنے کی جگہ یہی ہے۔ <strong>pokerth.net</strong> سرکاری نیٹ ورک ہے: اصلی حریف، موسمی درجہ بندیاں، اور ایک مفت عرفی نام جو ایک بار رجسٹر کرنا ہوتا ہے۔ <strong>LAN / نجی سرور</strong> آپ کو کسی مخصوص PokerTH سرور سے جوڑتا ہے، خواہ آپ کا اپنا ہو یا کسی اور کا۔"],
      ["کسی میز پر بیٹھیں",
       "لابی میں آپ فہرست میں سے کسی میز میں شامل ہو سکتے ہیں یا اپنی میز بنا سکتے ہیں۔ بناتے وقت آپ نشستوں کی تعداد، ابتدائی چپس، بلائنڈز کے بڑھنے کی رفتار، اور یہ طے کرتے ہیں کہ میز پاس ورڈ سے محفوظ ہو یا نہیں۔ دعوتی لنک بھیجیں، اور دوست بغیر کچھ رجسٹر کیے، اپنے براؤزر میں سیدھا آپ کی میز پر آ جائے گا۔"],
      ["ہاتھ کھیلیں",
       "آپ کو دو بند کارڈ ملتے ہیں۔ فلاپ سے پہلے بولی میز کے گرد گھومتی ہے، اور پھر فلاپ، ٹرن اور ریور کے بعد دوبارہ۔ جب آپ کی باری آتی ہے تو ایکشن بار روشن ہو جاتا ہے اور صرف وہی پیش کرتا ہے جو جائز ہے: Fold، Check یا Call، Raise یا All-In۔ رقم ٹائپ کی جا سکتی ہے، سلائیڈر سے گھسیٹی جا سکتی ہے، یا ایک ٹچ سے کم از کم، آدھا پاٹ، پورا پاٹ یا آپ کے سارے چپس پر رکھی جا سکتی ہے۔"],
      ["میز پڑھیں",
       "جیسے جیسے کارڈ کھلتے ہیں، آپ کا اُس وقت کا بہترین ہاتھ میز کے نیچے نام سمیت لکھا آتا ہے۔ پاٹ، ہر کھلاڑی کے چپس اور بلائنڈ کی سطح ہر وقت اسکرین پر رہتے ہیں، ڈیلر بٹن بتاتا ہے کہ آخر میں کون بولے گا، اور الٹی گنتی دکھاتی ہے کہ آپ کے پاس کتنا وقت ہے۔ شوڈاؤن پر ہر ہاتھ بنانے والے وہی پانچ کارڈ نمایاں کیے جاتے ہیں۔"],
      ["ٹورنامنٹ جیتیں",
       "PokerTH کے کھیل sit-and-go ٹورنامنٹ ہوتے ہیں: سب ایک جیسے چپس سے شروع کرتے ہیں، بلائنڈز گھڑی کے مطابق بڑھتے ہیں، اور کھلاڑی باہر ہوتے جاتے ہیں یہاں تک کہ سارے چپس ایک کے پاس آ جائیں۔ کچھ بھی پیسوں کا نہیں اور چپس خریدے نہیں جا سکتے — سب کھیل کے چپس ہیں، سو داؤ پر صرف کھیل ہی لگا ہوتا ہے۔"]
    ],
    phoneH2: "فون پر کھیلنا",
    phoneP: "میز جتنی کمپیوٹر کے لیے بنی ہے اتنی ہی ٹچ اسکرین کے لیے بھی: بیٹ کے خانے کو چھونے پر سسٹم کی بورڈ کے بجائے ایکشن بار کے اندر ہی نمبر پیڈ کھلتا ہے، اس لیے میز کبھی اچھلتی نہیں، اور سلائیڈر انہی مرحلوں میں چلتا ہے جن میں ڈیسک ٹاپ کلائنٹ کا۔ باری کی اطلاعات پر Fold اور Check/Call کے بٹن بھی ہو سکتے ہیں، سو ایک ہاتھ ٹیب پر واپس آئے بغیر کھیلا جا سکتا ہے۔",
    friendsH2: "دوستوں کے ساتھ کھیلنا",
    friendsP: "ایک میز بنائیں، نجی رکھنی ہو تو پاس ورڈ لگا دیں، اور دعوتی لنک بھیج دیں۔ لنک میز کو سیدھا کھولتا ہے — اگر انہوں نے ایپ ہوم اسکرین پر شامل کر رکھی ہے تو نصب شدہ ایپ میں، ورنہ براؤزر کے ٹیب میں۔ کسی کو کچھ انسٹال کرنے یا ای میل پتہ دینے کی ضرورت نہیں۔",
    faqH2: "عام سوالات",
    faqP: function (h, c) { return "کسی بھی طریقے میں اصلی پیسہ شامل نہیں ہوتا۔ آپ کی ترتیبات، اسٹائل پیک اور آف لائن پیش رفت آپ ہی کے آلے پر رہتی ہیں۔ انٹرفیس 45 زبانوں میں دستیاب ہے، جبکہ پانچ ایکشن الفاظ — Fold، Check، Call، Raise، All-In — دنیا کی ہر میز کی طرح انگریزی ہی میں رہتے ہیں۔ مزید <a href=\"{faq}\">عام سوالات</a> میں۔".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  hi: {
    title: "मुफ़्त ऑनलाइन पोकर कैसे खेलें — PokerTH वेब",
    desc: "चरण दर चरण: बिना डाउनलोड और बिना खाते के अपने ब्राउज़र में मुफ़्त टेक्सास होल्डम पोकर खेलें — ऑफ़लाइन कंप्यूटर के ख़िलाफ़, आधिकारिक pokerth.net नेटवर्क पर, या दोस्तों के साथ निजी टेबल पर।",
    ldHeadline: "ब्राउज़र में मुफ़्त टेक्सास होल्डम पोकर कैसे खेलें",
    ldDesc: "PokerTH वेब क्लाइंट में मुफ़्त टेक्सास होल्डम खेलने की चरण दर चरण गाइड।",
    h1: "अपने ब्राउज़र में मुफ़्त ऑनलाइन पोकर कैसे खेलें",
    lead: function (h, c) { return "यह छोटा रास्ता है: एक ख़ाली टैब से PokerTH पर आपके पहले टेक्सास होल्डम हाथ तक। अगर आपको नियम ही चाहिए — ब्लाइंड, दांव के दौर, कौन सा हाथ किसे हराता है — तो पहले <a href=\"{rules}\">नियमों का पन्ना</a> और <a href=\"{hands}\">हैंड रैंकिंग</a> पढ़ लें।".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["साइट खोलिए — इंस्टॉल करने को कुछ नहीं है",
       "PokerTH ब्राउज़र में चलता है। न डाउनलोड, न खाता, न कोई प्लगइन। फ़ोन पर आप इसे ब्राउज़र के मेन्यू से होम स्क्रीन पर जोड़ सकते हैं; तब यह किसी ऐप की तरह पूरी स्क्रीन पर खुलता है और ऑफ़लाइन भी चलता है।"],
      ["चुनिए कि कहाँ खेलना है",
       "तीन तरीक़े हैं। <strong>ऑफ़लाइन अभ्यास</strong> आपको तुरंत कंप्यूटर के प्रतिद्वंद्वियों वाली मेज़ पर बैठा देता है और इसे किसी कनेक्शन की ज़रूरत ही नहीं — सीखने की जगह यही है। <strong>pokerth.net</strong> आधिकारिक नेटवर्क है: असली प्रतिद्वंद्वी, सीज़न की रैंकिंग, और एक मुफ़्त उपनाम जो एक ही बार दर्ज करना होता है। <strong>LAN / निजी सर्वर</strong> आपको किसी समर्पित PokerTH सर्वर से जोड़ता है, आपका अपना हो या किसी और का।"],
      ["किसी मेज़ पर बैठिए",
       "लॉबी में या तो आप सूची से किसी मेज़ में शामिल होते हैं या अपनी मेज़ बनाते हैं। बनाते समय आप सीटों की संख्या, शुरुआती चिप्स, ब्लाइंड कितनी तेज़ी से बढ़ें, और मेज़ पर पासवर्ड होगा या नहीं, यह तय करते हैं। न्योते का लिंक साझा कीजिए और दोस्त बिना कुछ दर्ज किए, अपने ब्राउज़र में सीधे आपकी मेज़ पर पहुँच जाएगा।"],
      ["हाथ खेलिए",
       "आपको दो निजी कार्ड मिलते हैं। फ़्लॉप से पहले दांव मेज़ के चारों ओर घूमता है, और फिर फ़्लॉप, टर्न तथा रिवर के बाद दोबारा। जब आपकी बारी आती है तो एक्शन बार जल उठता है और सिर्फ़ वही दिखाता है जो नियमों के भीतर है: Fold, Check या Call, Raise या All-In। रक़म टाइप की जा सकती है, स्लाइडर से खींची जा सकती है, या एक ही टैप में न्यूनतम, आधा पॉट, पूरा पॉट या आपके सारे चिप्स पर रखी जा सकती है।"],
      ["मेज़ पढ़िए",
       "जैसे-जैसे कार्ड खुलते हैं, इस समय आपका सबसे अच्छा हाथ बोर्ड के नीचे नाम सहित लिखा रहता है। पॉट, हर खिलाड़ी के चिप्स और ब्लाइंड का स्तर हर वक़्त स्क्रीन पर रहते हैं, डीलर बटन बताता है कि आख़िर में कौन बोलेगा, और उल्टी गिनती दिखाती है कि आपके पास कितना समय है। शोडाउन पर हर हाथ बनाने वाले वही पाँच कार्ड उभारकर दिखाए जाते हैं।"],
      ["टूर्नामेंट जीतिए",
       "PokerTH की बाज़ियाँ sit-and-go टूर्नामेंट होती हैं: सब एक जैसे चिप्स से शुरू करते हैं, ब्लाइंड घड़ी के हिसाब से बढ़ते हैं, और खिलाड़ी बाहर होते जाते हैं जब तक सारे चिप्स एक के पास न आ जाएँ। कुछ भी पैसे का नहीं है और चिप्स ख़रीदे नहीं जा सकते — सब खेल के चिप्स हैं, इसलिए दांव पर सिर्फ़ खेल ही लगा होता है।"]
    ],
    phoneH2: "फ़ोन पर खेलना",
    phoneP: "मेज़ जितनी कंप्यूटर के लिए बनी है उतनी ही टच स्क्रीन के लिए भी: दांव के ख़ाने को छूने पर सिस्टम का कीबोर्ड नहीं, बल्कि एक्शन बार के भीतर ही नंबर पैड खुलता है, इसलिए मेज़ कभी उछलती नहीं, और स्लाइडर उन्हीं चरणों में चलता है जिनमें डेस्कटॉप क्लाइंट का। बारी की सूचनाएँ Fold और Check/Call बटनों के साथ आ सकती हैं, तो एक हाथ टैब पर लौटे बिना खेला जा सकता है।",
    friendsH2: "दोस्तों के साथ खेलना",
    friendsP: "एक मेज़ बनाइए, निजी रखनी हो तो पासवर्ड लगा दीजिए, और न्योते का लिंक भेज दीजिए। लिंक मेज़ को सीधे खोलता है — अगर उन्होंने ऐप होम स्क्रीन पर जोड़ रखी है तो इंस्टॉल की गई ऐप में, वरना ब्राउज़र के टैब में। किसी को कुछ इंस्टॉल करने या ईमेल पता देने की ज़रूरत नहीं।",
    faqH2: "आम सवाल",
    faqP: function (h, c) { return "किसी भी मोड में पैसा शामिल नहीं होता। आपकी सेटिंग्स, स्टाइल पैक और ऑफ़लाइन प्रगति आपके ही डिवाइस पर रहती हैं। इंटरफ़ेस 45 भाषाओं में उपलब्ध है, जबकि पाँच एक्शन शब्द — Fold, Check, Call, Raise, All-In — दुनिया की हर मेज़ की तरह अंग्रेज़ी में ही रहते हैं। और जानकारी <a href=\"{faq}\">आम सवालों</a> में।".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  th: {
    title: "วิธีเล่นโป๊กเกอร์ออนไลน์ฟรี — PokerTH เว็บ",
    desc: "ทีละขั้น: เล่นโป๊กเกอร์เท็กซัสโฮลด์เอ็มฟรีในเบราว์เซอร์ ไม่ต้องดาวน์โหลดและไม่ต้องสมัคร — เล่นออฟไลน์กับคอมพิวเตอร์ บนเครือข่ายทางการ pokerth.net หรือที่โต๊ะส่วนตัวกับเพื่อน",
    ldHeadline: "วิธีเล่นโป๊กเกอร์เท็กซัสโฮลด์เอ็มฟรีในเบราว์เซอร์",
    ldDesc: "คู่มือทีละขั้นสำหรับเล่นเท็กซัสโฮลด์เอ็มฟรีบนไคลเอนต์เว็บ PokerTH",
    h1: "วิธีเล่นโป๊กเกอร์ออนไลน์ฟรีในเบราว์เซอร์ของคุณ",
    lead: function (h, c) { return "นี่คือฉบับย่อ ตั้งแต่แท็บว่างเปล่าจนถึงไพ่เท็กซัสโฮลด์เอ็มมือแรกของคุณใน PokerTH ถ้าสิ่งที่คุณต้องการคือกติกาเอง — ไพ่บังคับ รอบการเดิมพัน อะไรชนะอะไร — ให้เริ่มที่<a href=\"{rules}\">หน้ากติกา</a>และ<a href=\"{hands}\">ลำดับไพ่</a>ก่อน".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["เปิดเว็บไซต์ — ไม่มีอะไรต้องติดตั้ง",
       "PokerTH ทำงานในเบราว์เซอร์ ไม่ต้องดาวน์โหลด ไม่ต้องสมัคร ไม่ต้องใช้ปลั๊กอิน บนมือถือคุณเพิ่มลงหน้าจอหลักได้จากเมนูของเบราว์เซอร์ จากนั้นมันจะเปิดเหมือนแอปเต็มหน้าจอ และใช้งานแบบออฟไลน์ได้ด้วย"],
      ["เลือกว่าจะเล่นที่ไหน",
       "มีสามโหมด <strong>ฝึกซ้อมออฟไลน์</strong> จัดโต๊ะที่มีคู่แข่งคอมพิวเตอร์ให้คุณทันทีและไม่ต้องใช้การเชื่อมต่อเลย — ที่นี่คือที่สำหรับหัดเล่น <strong>pokerth.net</strong> คือเครือข่ายทางการ มีคู่แข่งจริง อันดับประจำฤดูกาล และชื่อผู้เล่นฟรีที่สมัครเพียงครั้งเดียว ส่วน <strong>LAN / เซิร์ฟเวอร์ส่วนตัว</strong> จะเชื่อมต่อไปยังเซิร์ฟเวอร์ PokerTH เฉพาะ ไม่ว่าจะของคุณเองหรือของคนอื่น"],
      ["นั่งลงที่โต๊ะ",
       "ในล็อบบี้คุณจะเข้าร่วมโต๊ะจากรายการหรือสร้างโต๊ะของตัวเองก็ได้ ตอนสร้าง คุณกำหนดจำนวนที่นั่ง ชิปเริ่มต้น ความเร็วในการขึ้นของไพ่บังคับ และจะตั้งรหัสผ่านหรือไม่ แชร์ลิงก์เชิญ แล้วเพื่อนจะมาโผล่ที่โต๊ะของคุณโดยตรง ในเบราว์เซอร์ของเขาเอง โดยไม่ต้องสมัครอะไรเลย"],
      ["เล่นไพ่มือนั้น",
       "คุณจะได้ไพ่ปิดสองใบ การเดิมพันจะวนรอบโต๊ะก่อนไพ่ฟลอป แล้ววนอีกครั้งหลังฟลอป เทิร์น และริเวอร์ เมื่อถึงตาคุณ แถบปฏิบัติการจะสว่างขึ้นและเสนอเฉพาะสิ่งที่ทำได้: Fold, Check หรือ Call, Raise หรือ All-In จำนวนเงินพิมพ์เองก็ได้ ลากแถบเลื่อนก็ได้ หรือแตะครั้งเดียวเพื่อตั้งเป็นขั้นต่ำ ครึ่งกองกลาง เต็มกองกลาง หรือชิปทั้งหมดของคุณ"],
      ["อ่านโต๊ะ",
       "เมื่อไพ่ทยอยเปิด ระบบจะเขียนชื่อไพ่ที่ดีที่สุดของคุณ ณ ตอนนั้นไว้ใต้กองกลาง กองกลาง ชิปของทุกคน และระดับไพ่บังคับอยู่บนจอตลอดเวลา ปุ่มดีลเลอร์บอกว่าใครพูดคนสุดท้าย และตัวนับถอยหลังบอกว่าคุณเหลือเวลาเท่าไร ตอนเปิดไพ่ ระบบจะเน้นไพ่ห้าใบที่ประกอบเป็นมือของแต่ละคน"],
      ["ชนะทัวร์นาเมนต์",
       "เกมใน PokerTH เป็นทัวร์นาเมนต์แบบ sit-and-go ทุกคนเริ่มด้วยชิปเท่ากัน ไพ่บังคับขึ้นตามเวลา และผู้เล่นทยอยตกรอบจนเหลือคนเดียวที่ถือชิปทั้งหมด ไม่มีอะไรเสียเงินและซื้อชิปไม่ได้ — ทั้งหมดเป็นชิปสมมติ สิ่งเดียวที่วางเดิมพันไว้จึงเป็นตัวเกมเอง"]
    ],
    phoneH2: "เล่นบนมือถือ",
    phoneP: "โต๊ะถูกออกแบบมาเพื่อจอสัมผัสไม่แพ้เดสก์ท็อป การแตะช่องเดิมพันจะเปิดแป้นตัวเลขภายในแถบปฏิบัติการแทนแป้นพิมพ์ของระบบ โต๊ะจึงไม่กระโดดไปมา และแถบเลื่อนก็ขยับเป็นขั้นเท่ากับไคลเอนต์เดสก์ท็อป การแจ้งเตือนเมื่อถึงตาคุณสามารถมีปุ่ม Fold และ Check/Call ติดมาด้วย จึงเล่นจบหนึ่งมือได้โดยไม่ต้องกลับไปที่แท็บ",
    friendsH2: "เล่นกับเพื่อน",
    friendsP: "สร้างโต๊ะ ตั้งรหัสผ่านถ้าอยากให้เป็นส่วนตัว แล้วส่งลิงก์เชิญไป ลิงก์จะเปิดโต๊ะให้ทันที — ในแอปที่ติดตั้งไว้ถ้าเขาเพิ่มลงหน้าจอหลักแล้ว ไม่อย่างนั้นก็ในแท็บเบราว์เซอร์ ไม่มีใครต้องติดตั้งอะไรหรือให้อีเมล",
    faqH2: "คำถามที่พบบ่อย",
    faqP: function (h, c) { return "ไม่มีเงินจริงเข้ามาเกี่ยวข้องในโหมดใดเลย การตั้งค่า ชุดตกแต่ง และความคืบหน้าแบบออฟไลน์ของคุณอยู่บนเครื่องของคุณเอง ส่วนติดต่อผู้ใช้มีให้เลือก 45 ภาษา ขณะที่คำสั่งห้าคำ — Fold, Check, Call, Raise, All-In — ยังคงเป็นภาษาอังกฤษ เหมือนโต๊ะโป๊กเกอร์ทุกแห่งในโลก อ่านเพิ่มเติมได้ที่<a href=\"{faq}\">คำถามที่พบบ่อย</a>".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  bn: {
    title: "বিনামূল্যে অনলাইন পোকার কীভাবে খেলবেন — PokerTH ওয়েব",
    desc: "ধাপে ধাপে: ডাউনলোড ছাড়া আর অ্যাকাউন্ট ছাড়াই ব্রাউজারে বিনামূল্যে টেক্সাস হোল্ডেম পোকার খেলুন — অফলাইনে কম্পিউটারের বিরুদ্ধে, সরকারি pokerth.net নেটওয়ার্কে, বা বন্ধুদের সঙ্গে ব্যক্তিগত টেবিলে।",
    ldHeadline: "ব্রাউজারে বিনামূল্যে টেক্সাস হোল্ডেম পোকার কীভাবে খেলবেন",
    ldDesc: "PokerTH ওয়েব ক্লায়েন্টে বিনামূল্যে টেক্সাস হোল্ডেম খেলার ধাপে ধাপে নির্দেশিকা।",
    h1: "ব্রাউজারেই বিনামূল্যে অনলাইন পোকার কীভাবে খেলবেন",
    lead: function (h, c) { return "এটি সংক্ষিপ্ত পথ: একটি ফাঁকা ট্যাব থেকে PokerTH-এ আপনার প্রথম টেক্সাস হোল্ডেম হাত পর্যন্ত। আপনি যদি নিয়মগুলোই খুঁজছেন — ব্লাইন্ড, বাজির রাউন্ড, কোন হাত কাকে হারায় — তবে আগে <a href=\"{rules}\">নিয়মের পাতা</a> আর <a href=\"{hands}\">হ্যান্ড র‍্যাঙ্কিং</a> দেখে নিন।".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["সাইটটি খুলুন — ইনস্টল করার কিছু নেই",
       "PokerTH ব্রাউজারেই চলে। ডাউনলোড নেই, অ্যাকাউন্ট নেই, প্লাগইন নেই। ফোনে ব্রাউজারের মেনু থেকে একে হোম স্ক্রিনে যোগ করা যায়; তখন এটি অ্যাপের মতো পুরো পর্দায় খোলে এবং অফলাইনেও কাজ করে।"],
      ["কোথায় খেলবেন বেছে নিন",
       "তিনটি ধরন। <strong>অফলাইন অনুশীলন</strong> সঙ্গে সঙ্গেই আপনাকে কম্পিউটার প্রতিপক্ষের টেবিলে বসিয়ে দেয় এবং কোনো সংযোগই লাগে না — শেখার জায়গা এটিই। <strong>pokerth.net</strong> হলো সরকারি নেটওয়ার্ক: সত্যিকারের প্রতিপক্ষ, মৌসুমি র‍্যাঙ্কিং, আর একবার নিবন্ধন করা বিনামূল্যের ডাকনাম। <strong>LAN / ব্যক্তিগত সার্ভার</strong> আপনাকে কোনো নির্দিষ্ট PokerTH সার্ভারে যুক্ত করে, আপনার নিজের হোক বা অন্য কারও।"],
      ["একটি টেবিলে বসুন",
       "লবিতে আপনি তালিকা থেকে কোনো টেবিলে যোগ দিতে পারেন, নয়তো নিজের টেবিল বানাতে পারেন। বানানোর সময় আসনসংখ্যা, শুরুর চিপ, ব্লাইন্ড কত দ্রুত বাড়বে, আর টেবিলে পাসওয়ার্ড থাকবে কি না তা ঠিক করেন। আমন্ত্রণের লিঙ্কটি পাঠান, বন্ধু কিছু নিবন্ধন না করেই নিজের ব্রাউজারে সোজা আপনার টেবিলে এসে হাজির হবে।"],
      ["হাতটি খেলুন",
       "আপনাকে দুটি গোপন কার্ড দেওয়া হয়। ফ্লপের আগে বাজি টেবিল ঘুরে আসে, তারপর ফ্লপ, টার্ন ও রিভারের পরে আবার। আপনার পালা এলে অ্যাকশন বার জ্বলে ওঠে এবং কেবল যা বৈধ তা-ই দেখায়: Fold, Check বা Call, Raise বা All-In। পরিমাণটা টাইপ করা যায়, স্লাইডারে টেনে নেওয়া যায়, কিংবা এক ছোঁয়ায় সর্বনিম্ন, পটের অর্ধেক, পুরো পট বা আপনার সব চিপে বসানো যায়।"],
      ["টেবিল পড়ুন",
       "কার্ড খুলতে খুলতে আপনার তখনকার সেরা হাতটির নাম বোর্ডের নিচে লেখা থাকে। পট, প্রত্যেকের চিপ আর ব্লাইন্ডের স্তর সবসময় পর্দায় থাকে, ডিলার বোতাম দেখায় কে শেষে বলবে, আর কাউন্টডাউন দেখায় আপনার কত সময় বাকি। শোডাউনে প্রতিটি হাত গড়ে তোলা ঠিক পাঁচটি কার্ড আলাদা করে দেখানো হয়।"],
      ["টুর্নামেন্ট জিতুন",
       "PokerTH-এর খেলা sit-and-go টুর্নামেন্ট: সবাই একই চিপ নিয়ে শুরু করে, ব্লাইন্ড ঘড়ি ধরে বাড়ে, আর একজনের হাতে সব চিপ না আসা পর্যন্ত খেলোয়াড়েরা বাদ পড়তে থাকেন। কিছুতেই টাকা লাগে না আর চিপ কেনাও যায় না — সবই খেলার চিপ, তাই বাজি ধরা থাকে কেবল খেলাটাই।"]
    ],
    phoneH2: "ফোনে খেলা",
    phoneP: "টেবিলটি কম্পিউটারের জন্য যতটা, স্পর্শপর্দার জন্যও ঠিক ততটাই বানানো: বাজির ঘরে ছোঁয়া দিলে সিস্টেমের কি-বোর্ডের বদলে অ্যাকশন বারের ভেতরেই সংখ্যার প্যাড খোলে, ফলে টেবিল কখনও লাফায় না, আর স্লাইডারও ডেস্কটপ ক্লায়েন্টের মতো একই ধাপে নড়ে। পালা আসার বিজ্ঞপ্তিতে Fold আর Check/Call বোতাম থাকতে পারে, তাই ট্যাবে না ফিরেও একটি হাত খেলে ফেলা যায়।",
    friendsH2: "বন্ধুদের সঙ্গে খেলা",
    friendsP: "একটি টেবিল বানান, ব্যক্তিগত রাখতে চাইলে পাসওয়ার্ড দিন, আর আমন্ত্রণের লিঙ্কটি পাঠিয়ে দিন। লিঙ্কটি টেবিলটি সরাসরি খোলে — অ্যাপ হোম স্ক্রিনে যোগ করা থাকলে ইনস্টল করা অ্যাপে, নয়তো ব্রাউজারের ট্যাবে। কাউকে কিছু ইনস্টল করতে বা ইমেইল ঠিকানা দিতে হয় না।",
    faqH2: "সাধারণ প্রশ্ন",
    faqP: function (h, c) { return "কোনো ধরনেই আসল টাকা জড়িত নয়। আপনার সেটিংস, স্টাইল প্যাক আর অফলাইন অগ্রগতি আপনার নিজের যন্ত্রেই থাকে। ইন্টারফেস ৪৫টি ভাষায় পাওয়া যায়, আর পাঁচটি অ্যাকশন শব্দ — Fold, Check, Call, Raise, All-In — দুনিয়ার যেকোনো টেবিলের মতোই ইংরেজিতে থাকে। আরও জানুন <a href=\"{faq}\">সাধারণ প্রশ্নে</a>।".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  'pt-PT': {
    title: "Como jogar póquer online grátis — PokerTH Web",
    desc: "Passo a passo: jogue póquer Texas Hold’em grátis no navegador, sem transferências e sem registo — offline contra o computador, na rede oficial pokerth.net ou numa mesa privada com amigos.",
    ldHeadline: "Como jogar póquer Texas Hold’em grátis no navegador",
    ldDesc: "Um guia passo a passo para jogar Texas Hold’em grátis no cliente web do PokerTH.",
    h1: "Como jogar póquer online, grátis, no seu navegador",
    lead: function (h, c) { return "Esta é a versão curta: de um separador vazio até à sua primeira mão de Texas Hold’em no PokerTH. Se o que procura são as regras em si — blinds, rondas de apostas, o que ganha a quê — comece pela <a href=\"{rules}\">página das regras</a> e pelas <a href=\"{hands}\">mãos do póquer</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Abra o site — não há nada para instalar",
       "O PokerTH corre no navegador. Sem transferências, sem registo, sem extensões. No telemóvel pode adicioná-lo ao ecrã principal a partir do menu do navegador: abre então como uma aplicação, em ecrã inteiro, e funciona offline."],
      ["Escolha onde quer jogar",
       "Três modos. O <strong>treino offline</strong> senta-o de imediato numa mesa de adversários controlados pelo computador e não precisa de ligação nenhuma — é aqui que se aprende. O <strong>pokerth.net</strong> é a rede oficial: adversários reais, classificações por época e uma alcunha gratuita que regista uma só vez. <strong>LAN / servidor privado</strong> liga-o a um servidor PokerTH dedicado, seu ou de outra pessoa."],
      ["Sente-se a uma mesa",
       "No lobby, junta-se a uma mesa da lista ou cria a sua. Ao criá-la define o número de lugares, as fichas iniciais, a rapidez com que os blinds sobem e se a mesa tem palavra-passe. Partilhe a ligação de convite e o amigo chega directamente à sua mesa, no navegador dele, sem registar nada."],
      ["Jogue a mão",
       "Recebe duas cartas fechadas. As apostas dão a volta à mesa antes do flop e outra vez depois do flop, do turn e do river. Quando é a sua vez, a barra de acções acende-se e oferece apenas o que é permitido: Fold, Check ou Call, Raise ou All-In. O valor pode ser escrito, arrastado no cursor ou definido com um toque em Mín., metade do pote, o pote ou todas as suas fichas."],
      ["Leia a mesa",
       "A sua melhor mão do momento aparece nomeada por baixo da mesa à medida que as cartas saem. O pote, as fichas de cada jogador e o nível dos blinds estão sempre no ecrã, o botão do dealer mostra quem fala em último e uma contagem decrescente indica o tempo que lhe resta. No showdown ficam destacadas as cinco cartas que formaram cada mão."],
      ["Ganhe o torneio",
       "Os jogos do PokerTH são torneios sit-and-go: toda a gente começa com as mesmas fichas, os blinds sobem ao relógio e os jogadores vão sendo eliminados até um deles ficar com tudo. Nada custa dinheiro e não se compram fichas — é tudo dinheiro fictício, por isso o único risco é o do próprio jogo."]
    ],
    phoneH2: "Jogar no telemóvel",
    phoneP: "A mesa foi pensada tanto para o ecrã táctil como para o computador: tocar no campo da aposta abre um teclado numérico dentro da barra de acções em vez do teclado do sistema, pelo que a mesa nunca salta, e o cursor avança nos mesmos passos do cliente de secretária. As notificações de vez podem chegar-lhe já com os botões Fold e Check/Call, de modo que se joga uma mão sem voltar ao separador.",
    friendsH2: "Jogar com amigos",
    friendsP: "Crie uma mesa, ponha palavra-passe se a quiser privada e envie a ligação de convite. Ela abre a mesa directamente — na aplicação instalada, se a tiverem adicionado ao ecrã principal, ou num separador do navegador. Ninguém tem de instalar seja o que for nem dar um endereço de email.",
    faqH2: "Perguntas frequentes",
    faqP: function (h, c) { return "Nunca há dinheiro envolvido, em modo nenhum. As suas definições, pacotes de estilo e progresso offline ficam no seu próprio aparelho. A interface está disponível em 45 idiomas, ao passo que as cinco palavras de acção — Fold, Check, Call, Raise, All-In — continuam em inglês, tal como em qualquer mesa do mundo. Mais nas <a href=\"{faq}\">perguntas frequentes</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  'zh-TW': {
    title: "如何免費線上玩撲克 — PokerTH 網頁版",
    desc: "一步步教你在瀏覽器裡免費玩德州撲克，不必下載、不必註冊——離線對戰電腦、加入官方 pokerth.net 網路，或和朋友開一桌私人牌局。",
    ldHeadline: "如何在瀏覽器中免費玩德州撲克",
    ldDesc: "在 PokerTH 網頁版用戶端免費玩德州撲克的分步指南。",
    h1: "如何在瀏覽器裡免費線上玩撲克",
    lead: function (h, c) { return "這是精簡版：從一個空白分頁到你在 PokerTH 的第一手德州撲克。如果你想了解的是規則本身——盲注、下注輪次、什麼牌大過什麼牌——請先看<a href=\"{rules}\">規則頁面</a>和<a href=\"{hands}\">牌型大小</a>。".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["打開網站——沒有任何東西需要安裝",
       "PokerTH 在瀏覽器裡執行。不必下載、不必註冊、不必外掛。在手機上，你可以從瀏覽器選單把它加到主畫面，之後它就像一個應用程式一樣全螢幕開啟，而且支援離線使用。"],
      ["選擇你想在哪裡玩",
       "共三種模式。<strong>離線練習</strong>會立刻為你安排一桌電腦對手，完全不需要連線——這是學習的地方。<strong>pokerth.net</strong> 是官方網路：真人對手、賽季排名，註冊一次即可取得免費暱稱。<strong>區域網路／私人伺服器</strong>連接到專用的 PokerTH 伺服器，你自己的或別人的都行。"],
      ["坐到牌桌前",
       "在大廳裡，你可以從清單加入一桌，也可以自己開一桌。開桌時可以設定座位數、起始籌碼、盲注上漲的速度，以及是否設密碼。把邀請連結分享出去，朋友就會直接落座在你的牌桌上，在他自己的瀏覽器裡，什麼都不用註冊。"],
      ["打這手牌",
       "你會拿到兩張底牌。翻牌前繞桌下注一輪，翻牌、轉牌、河牌之後各再下注一輪。輪到你時，操作列會亮起，而且只提供當下合法的選項：Fold、Check 或 Call、Raise 或 All-In。下注金額可以輸入、可以拖曳滑桿，也可以一鍵設為最小注、半池、一池或全部籌碼。"],
      ["讀懂牌桌",
       "隨著公共牌發出，你目前的最佳牌型會標註在牌桌下方。底池、每個人的籌碼和盲注級別始終顯示在螢幕上，莊家按鈕標明誰最後行動，倒數計時顯示你還剩多少時間。攤牌時，組成每一手牌的那五張會被高亮。"],
      ["贏下比賽",
       "PokerTH 的牌局是 sit-and-go 錦標賽：所有人以相同籌碼開局，盲注按時上漲，玩家陸續被淘汰，直到一人贏下全部籌碼。不花一分錢，也無法購買籌碼——全部是虛擬籌碼，因此唯一的賭注就是這局牌本身。"]
    ],
    phoneH2: "在手機上玩",
    phoneP: "牌桌為觸控螢幕所做的考量不亞於桌面端：點擊下注框會在操作列內開啟數字鍵盤，而不是彈出系統鍵盤，因此牌桌永遠不會跳動；滑桿的級距也與桌面用戶端一致。輪到你時的通知上可以直接帶有 Fold 和 Check/Call 按鈕，因此一手牌不必切回分頁也能打完。",
    friendsH2: "和朋友一起玩",
    friendsP: "開一桌，想私密就設個密碼，然後把邀請連結發出去。連結會直接開啟牌桌——如果對方已把應用程式加到主畫面，就在應用程式裡開啟，否則在瀏覽器分頁裡開啟。誰都不用安裝任何東西，也不用交出電子郵件。",
    faqH2: "常見問題",
    faqP: function (h, c) { return "任何模式都不涉及金錢。你的設定、樣式包和離線進度都保存在你自己的裝置上。介面提供 45 種語言，而 Fold、Check、Call、Raise、All-In 這五個動作詞維持英文，和全世界的牌桌一樣。更多內容見<a href=\"{faq}\">常見問題</a>。".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  sv: {
    title: "Så spelar du poker online gratis — PokerTH Web",
    desc: "Steg för steg: spela Texas Hold’em-poker gratis i webbläsaren, utan nedladdning och utan konto — offline mot datorn, på det officiella nätverket pokerth.net eller vid ett privat bord med vänner.",
    ldHeadline: "Så spelar du gratis Texas Hold’em-poker i webbläsaren",
    ldDesc: "En steg-för-steg-guide till att spela Texas Hold’em gratis i PokerTH:s webbklient.",
    h1: "Så spelar du poker online gratis, direkt i webbläsaren",
    lead: function (h, c) { return "Det här är kortversionen: från en tom flik till din första hand Texas Hold’em i PokerTH. Är det reglerna i sig du är ute efter — mörkar, budrundor, vad som slår vad — börja hellre med <a href=\"{rules}\">regelsidan</a> och <a href=\"{hands}\">pokerhänderna</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Öppna sajten — det finns inget att installera",
       "PokerTH körs i webbläsaren. Ingen nedladdning, inget konto, inget tillägg. På en telefon kan du lägga till den på hemskärmen från webbläsarmenyn; då öppnas den som en app, i helskärm, och fungerar även offline."],
      ["Välj var du vill spela",
       "Tre lägen. <strong>Offlineträning</strong> sätter dig direkt vid ett bord med datormotståndare och kräver ingen uppkoppling alls — det är här man lär sig. <strong>pokerth.net</strong> är det officiella nätverket: riktiga motståndare, säsongsrankningar och ett gratis smeknamn som du registrerar en gång. <strong>LAN / privat server</strong> ansluter till en dedikerad PokerTH-server, din egen eller någon annans."],
      ["Sätt dig vid ett bord",
       "I lobbyn går du antingen med i ett bord från listan eller skapar ett eget. När du skapar ett väljer du antal platser, startstack, hur snabbt mörkarna höjs och om bordet ska ha lösenord. Dela inbjudningslänken så hamnar en vän direkt vid ditt bord, i sin egen webbläsare, utan att registrera något."],
      ["Spela handen",
       "Du får två dolda kort. Budgivningen går runt bordet före floppen och sedan igen efter floppen, turn och river. När det blir din tur tänds åtgärdsraden och erbjuder bara det som är tillåtet: Fold, Check eller Call, Raise eller All-In. Beloppet kan skrivas in, dras på reglaget eller sättas med en tryckning på Min, halva potten, potten eller hela din stack."],
      ["Läs bordet",
       "Din bästa hand för stunden namnges under bordet allteftersom korten kommer. Potten, varje stack och mörknivån syns hela tiden, dealerknappen visar vem som agerar sist och en nedräkning visar hur lång tid du har. Vid showdown markeras de fem kort som utgjorde varje hand."],
      ["Vinn turneringen",
       "Spelen i PokerTH är sit-and-go-turneringar: alla börjar med samma stack, mörkarna höjs på klockan och spelare slås ut tills en enda har alla marker. Ingenting kostar pengar och marker går inte att köpa — allt är låtsaspengar, så det enda som står på spel är själva spelet."]
    ],
    phoneH2: "Spela på telefon",
    phoneP: "Bordet är byggt lika mycket för pekskärm som för dator: att trycka på insatsfältet öppnar en sifferknappsats inuti åtgärdsraden i stället för systemtangentbordet, så bordet hoppar aldrig omkring, och reglaget rör sig i samma steg som skrivbordsklienten. Aviseringar om att det är din tur kan komma med Fold- och Check/Call-knappar på sig, så en hand går att spela utan att växla tillbaka till fliken.",
    friendsH2: "Spela med vänner",
    friendsP: "Skapa ett bord, sätt lösenord om du vill ha det privat och skicka inbjudningslänken. Den öppnar bordet direkt — i den installerade appen om de har lagt till den på hemskärmen, annars i en webbläsarflik. Ingen behöver installera något eller lämna ifrån sig en e-postadress.",
    faqH2: "Vanliga frågor",
    faqP: function (h, c) { return "Inga pengar är någonsin inblandade, i något läge. Dina inställningar, stilpaket och offlineframsteg stannar på din egen enhet. Gränssnittet finns på 45 språk, medan de fem åtgärdsorden — Fold, Check, Call, Raise, All-In — förblir på engelska, precis som vid alla bord i världen. Mer i <a href=\"{faq}\">vanliga frågor</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  da: {
    title: "Sådan spiller du poker online gratis — PokerTH Web",
    desc: "Trin for trin: spil Texas Hold’em-poker gratis i browseren, uden download og uden konto — offline mod computeren, på det officielle netværk pokerth.net eller ved et privat bord med venner.",
    ldHeadline: "Sådan spiller du gratis Texas Hold’em-poker i browseren",
    ldDesc: "En trin-for-trin-guide til at spille Texas Hold’em gratis i PokerTH’s webklient.",
    h1: "Sådan spiller du poker online gratis, direkte i browseren",
    lead: function (h, c) { return "Det her er kortversionen: fra en tom fane til din første hånd Texas Hold’em i PokerTH. Er det selve reglerne, du er ude efter — blinds, budrunder, hvad der slår hvad — så start hellere med <a href=\"{rules}\">reglerne</a> og <a href=\"{hands}\">pokerhænderne</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Åbn siden — der er intet at installere",
       "PokerTH kører i browseren. Ingen download, ingen konto, ingen udvidelse. På en telefon kan du lægge den på hjemmeskærmen fra browsermenuen; så åbner den som en app, i fuld skærm, og virker også offline."],
      ["Vælg hvor du vil spille",
       "Tre tilstande. <strong>Offlinetræning</strong> sætter dig med det samme ved et bord med computermodstandere og kræver slet ingen forbindelse — det er her, man lærer det. <strong>pokerth.net</strong> er det officielle netværk: rigtige modstandere, sæsonrangliste og et gratis kaldenavn, du registrerer én gang. <strong>LAN / privat server</strong> forbinder til en dedikeret PokerTH-server, din egen eller en andens."],
      ["Sæt dig ved et bord",
       "I lobbyen kan du enten gå med i et bord fra listen eller oprette dit eget. Når du opretter, vælger du antal pladser, startstakken, hvor hurtigt blinds stiger, og om bordet skal have adgangskode. Del invitationslinket, så lander en ven direkte ved dit bord, i sin egen browser, uden at registrere noget."],
      ["Spil hånden",
       "Du får to lukkede kort. Der bydes rundt om bordet før floppen og igen efter floppen, turn og river. Når det bliver din tur, lyser handlingslinjen op og tilbyder kun det, der er tilladt: Fold, Check eller Call, Raise eller All-In. Beløbet kan tastes, trækkes på skyderen eller sættes med ét tryk på Min, halvdelen af puljen, puljen eller hele din stak."],
      ["Læs bordet",
       "Din bedste hånd lige nu står navngivet under bordet, efterhånden som kortene kommer. Puljen, hver stak og blindniveauet er på skærmen hele tiden, dealerknappen viser, hvem der handler sidst, og en nedtælling viser, hvor lang tid du har. Ved showdown fremhæves de fem kort, der udgjorde hver hånd."],
      ["Vind turneringen",
       "Spillene i PokerTH er sit-and-go-turneringer: alle starter med samme stak, blinds stiger efter uret, og spillere ryger ud, indtil én sidder med alle jetoner. Intet koster penge, og jetoner kan ikke købes — det hele er legepenge, så det eneste, der står på spil, er selve spillet."]
    ],
    phoneH2: "Spil på telefonen",
    phoneP: "Bordet er lavet til touchskærm lige så meget som til computer: et tryk på indsatsfeltet åbner et taltastatur inde i handlingslinjen i stedet for systemtastaturet, så bordet aldrig hopper rundt, og skyderen bevæger sig i samme trin som desktopklienten. Notifikationer om, at det er din tur, kan komme med Fold- og Check/Call-knapper på, så en hånd kan spilles uden at skifte tilbage til fanen.",
    friendsH2: "Spil med venner",
    friendsP: "Opret et bord, sæt en adgangskode hvis det skal være privat, og send invitationslinket. Det åbner bordet direkte — i den installerede app, hvis de har lagt den på hjemmeskærmen, ellers i en browserfane. Ingen skal installere noget eller aflevere en mailadresse.",
    faqH2: "Ofte stillede spørgsmål",
    faqP: function (h, c) { return "Der er aldrig penge involveret, i nogen tilstand. Dine indstillinger, stilpakker og offlinefremskridt bliver på din egen enhed. Brugerfladen findes på 45 sprog, mens de fem handlingsord — Fold, Check, Call, Raise, All-In — forbliver på engelsk, ligesom ved ethvert bord i verden. Mere i <a href=\"{faq}\">ofte stillede spørgsmål</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  nb: {
    title: "Slik spiller du poker på nett gratis — PokerTH Web",
    desc: "Steg for steg: spill Texas Hold’em-poker gratis i nettleseren, uten nedlasting og uten konto — offline mot datamaskinen, på det offisielle nettverket pokerth.net eller ved et privat bord med venner.",
    ldHeadline: "Slik spiller du gratis Texas Hold’em-poker i nettleseren",
    ldDesc: "En steg-for-steg-guide til å spille Texas Hold’em gratis i PokerTHs nettklient.",
    h1: "Slik spiller du poker på nett gratis, rett i nettleseren",
    lead: function (h, c) { return "Dette er kortversjonen: fra en tom fane til din første hånd Texas Hold’em i PokerTH. Er det selve reglene du er ute etter — blindene, budrundene, hva som slår hva — start heller med <a href=\"{rules}\">regelsiden</a> og <a href=\"{hands}\">pokerhendene</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Åpne nettstedet — det er ingenting å installere",
       "PokerTH kjører i nettleseren. Ingen nedlasting, ingen konto, ingen utvidelse. På telefonen kan du legge det til på startskjermen fra nettlesermenyen; da åpnes det som en app, i fullskjerm, og virker også uten nett."],
      ["Velg hvor du vil spille",
       "Tre moduser. <strong>Offlinetrening</strong> setter deg straks ved et bord med datamotstandere og trenger ingen forbindelse i det hele tatt — det er her man lærer. <strong>pokerth.net</strong> er det offisielle nettverket: ekte motstandere, sesongrangeringer og et gratis kallenavn du registrerer én gang. <strong>LAN / privat server</strong> kobler deg til en dedikert PokerTH-server, din egen eller en annens."],
      ["Sett deg ved et bord",
       "I lobbyen blir du enten med på et bord fra listen eller lager ditt eget. Når du lager ett, velger du antall plasser, startstacken, hvor raskt blindene stiger og om bordet skal ha passord. Del invitasjonslenken, så havner en venn rett ved bordet ditt, i sin egen nettleser, uten å registrere noe."],
      ["Spill hånden",
       "Du får to lukkede kort. Det bys rundt bordet før floppen, og igjen etter floppen, turn og river. Når turen kommer til deg, lyser handlingslinjen opp og tilbyr bare det som er lov: Fold, Check eller Call, Raise eller All-In. Beløpet kan skrives inn, dras på glidebryteren eller settes med ett trykk på Min, halve potten, potten eller hele stacken din."],
      ["Les bordet",
       "Den beste hånden du har akkurat nå, står navngitt under bordet etter hvert som kortene kommer. Potten, hver stack og blindnivået vises hele tiden, dealerknappen viser hvem som handler sist, og en nedtelling viser hvor lang tid du har. Ved showdown fremheves de fem kortene som utgjorde hver hånd."],
      ["Vinn turneringen",
       "Spillene i PokerTH er sit-and-go-turneringer: alle starter med samme stack, blindene stiger etter klokka, og spillere slås ut til én sitter med alle sjetongene. Ingenting koster penger, og sjetonger kan ikke kjøpes — alt er lekepenger, så det eneste som står på spill, er selve spillet."]
    ],
    phoneH2: "Spille på telefon",
    phoneP: "Bordet er laget for berøringsskjerm like mye som for datamaskin: å trykke på innsatsfeltet åpner et talltastatur inne i handlingslinjen i stedet for systemtastaturet, slik at bordet aldri hopper rundt, og glidebryteren beveger seg i de samme trinnene som skrivebordsklienten. Varsler om at det er din tur kan komme med Fold- og Check/Call-knapper på seg, så en hånd kan spilles uten å gå tilbake til fanen.",
    friendsH2: "Spille med venner",
    friendsP: "Lag et bord, sett passord hvis du vil ha det privat, og send invitasjonslenken. Den åpner bordet direkte — i den installerte appen hvis de har lagt den til på startskjermen, ellers i en nettleserfane. Ingen trenger å installere noe eller gi fra seg en e-postadresse.",
    faqH2: "Vanlige spørsmål",
    faqP: function (h, c) { return "Det er aldri penger inne i bildet, i noen modus. Innstillingene dine, stilpakkene og offlinefremgangen blir liggende på din egen enhet. Grensesnittet finnes på 45 språk, mens de fem handlingsordene — Fold, Check, Call, Raise, All-In — forblir på engelsk, som ved ethvert bord i verden. Mer i <a href=\"{faq}\">vanlige spørsmål</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  fi: {
    title: "Näin pelaat pokeria ilmaiseksi netissä — PokerTH Web",
    desc: "Vaihe vaiheelta: pelaa Texas Hold’em -pokeria ilmaiseksi selaimessa, ilman latausta ja ilman tiliä — offline tietokonetta vastaan, virallisessa pokerth.net-verkossa tai yksityisessä pöydässä kavereiden kanssa.",
    ldHeadline: "Näin pelaat ilmaista Texas Hold’em -pokeria selaimessa",
    ldDesc: "Vaiheittainen opas ilmaiseen Texas Hold’emiin PokerTH:n selainversiossa.",
    h1: "Näin pelaat pokeria ilmaiseksi netissä, suoraan selaimessa",
    lead: function (h, c) { return "Tämä on lyhyt versio: tyhjästä välilehdestä ensimmäiseen Texas Hold’em -käteesi PokerTH:ssa. Jos etsit itse sääntöjä — blindit, panostuskierrokset, mikä voittaa minkä — aloita mieluummin <a href=\"{rules}\">sääntösivulta</a> ja <a href=\"{hands}\">pokerikäsistä</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Avaa sivusto — mitään ei tarvitse asentaa",
       "PokerTH toimii selaimessa. Ei latausta, ei tiliä, ei lisäosia. Puhelimessa voit lisätä sen aloitusnäytölle selaimen valikosta; silloin se avautuu kuin sovellus, koko näytölle, ja toimii myös ilman verkkoyhteyttä."],
      ["Valitse missä haluat pelata",
       "Kolme tapaa. <strong>Offline-harjoittelu</strong> istuttaa sinut heti pöytään tietokonevastustajien kanssa eikä vaadi yhteyttä lainkaan — täällä opitaan. <strong>pokerth.net</strong> on virallinen verkko: oikeita vastustajia, kausikohtaiset sijoitukset ja ilmainen nimimerkki, jonka rekisteröit kerran. <strong>LAN / oma palvelin</strong> yhdistää omaan tai jonkun toisen PokerTH-palvelimeen."],
      ["Istu pöytään",
       "Aulassa liityt joko listalta löytyvään pöytään tai luot oman. Luodessasi valitset paikkojen määrän, aloituspinon, kuinka nopeasti blindit nousevat ja onko pöydässä salasana. Jaa kutsulinkki, niin kaveri päätyy suoraan pöytääsi omassa selaimessaan rekisteröimättä mitään."],
      ["Pelaa käsi",
       "Saat kaksi omaa korttia. Panostus kiertää pöydän ennen floppia ja uudelleen flopin, turnin ja riverin jälkeen. Kun vuoro on sinun, toimintopalkki syttyy ja tarjoaa vain sallitut vaihtoehdot: Fold, Check tai Call, Raise tai All-In. Summan voi kirjoittaa, vetää liukusäätimellä tai asettaa yhdellä napautuksella minimiin, puoleen pottiin, koko pottiin tai koko pinoosi."],
      ["Lue pöytää",
       "Paras sen hetkinen kätesi nimetään pöydän alle sitä mukaa kuin kortit tulevat. Potti, jokaisen pino ja blinditaso näkyvät koko ajan, jakajanappula kertoo kuka puhuu viimeisenä, ja lähtölaskenta näyttää paljonko aikaa sinulla on. Korttien näyttövaiheessa korostetaan ne viisi korttia, jotka muodostivat kunkin käden."],
      ["Voita turnaus",
       "PokerTH:n pelit ovat sit-and-go-turnauksia: kaikki aloittavat samalla pinolla, blindit nousevat kellon mukaan ja pelaajia putoaa, kunnes yhdellä on kaikki pelimerkit. Mikään ei maksa rahaa eikä pelimerkkejä voi ostaa — kaikki on leikkirahaa, joten pelissä on vain peli itse."]
    ],
    phoneH2: "Pelaaminen puhelimella",
    phoneP: "Pöytä on rakennettu kosketusnäytölle yhtä lailla kuin tietokoneelle: panoskentän napauttaminen avaa numeronäppäimistön toimintopalkin sisään järjestelmän näppäimistön sijaan, joten pöytä ei hyppele, ja liukusäädin liikkuu samoin askelin kuin työpöytäversiossa. Vuoroilmoitukset voivat sisältää Fold- ja Check/Call-painikkeet, joten käden voi pelata palaamatta välilehdelle.",
    friendsH2: "Pelaaminen kavereiden kanssa",
    friendsP: "Luo pöytä, aseta salasana jos haluat sen yksityiseksi, ja lähetä kutsulinkki. Se avaa pöydän suoraan — asennetussa sovelluksessa, jos he ovat lisänneet sen aloitusnäytölle, muuten selaimen välilehdessä. Kenenkään ei tarvitse asentaa mitään eikä luovuttaa sähköpostiosoitetta.",
    faqH2: "Usein kysyttyä",
    faqP: function (h, c) { return "Rahaa ei ole missään pelimuodossa mukana. Asetuksesi, tyylipaketit ja offline-edistyminen pysyvät omalla laitteellasi. Käyttöliittymä on saatavilla 45 kielellä, kun taas viisi toimintosanaa — Fold, Check, Call, Raise, All-In — pysyvät englanniksi, kuten jokaisessa pöydässä maailmassa. Lisää <a href=\"{faq}\">usein kysytyissä kysymyksissä</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  cs: {
    title: "Jak hrát poker online zdarma — PokerTH Web",
    desc: "Krok za krokem: hrajte poker Texas Hold’em zdarma v prohlížeči, bez stahování a bez účtu — offline proti počítači, v oficiální síti pokerth.net nebo u soukromého stolu s přáteli.",
    ldHeadline: "Jak hrát zdarma poker Texas Hold’em v prohlížeči",
    ldDesc: "Návod krok za krokem, jak si zdarma zahrát Texas Hold’em ve webovém klientu PokerTH.",
    h1: "Jak hrát poker online zdarma, přímo v prohlížeči",
    lead: function (h, c) { return "Tohle je krátká verze: od prázdné karty prohlížeče k vašemu prvnímu rozdání Texas Hold’em v PokerTH. Pokud hledáte samotná pravidla — blindy, kola sázek, co co přebíjí — začněte raději <a href=\"{rules}\">stránkou s pravidly</a> a <a href=\"{hands}\">pokerovými kombinacemi</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Otevřete web — není co instalovat",
       "PokerTH běží v prohlížeči. Žádné stahování, žádný účet, žádný doplněk. Na telefonu si ho můžete z nabídky prohlížeče přidat na plochu; pak se otevírá jako aplikace, na celou obrazovku, a funguje i bez připojení."],
      ["Vyberte, kde chcete hrát",
       "Tři režimy. <strong>Trénink offline</strong> vás okamžitě posadí ke stolu s počítačovými soupeři a nepotřebuje vůbec žádné připojení — tady se člověk učí. <strong>pokerth.net</strong> je oficiální síť: skuteční soupeři, sezónní žebříčky a přezdívka zdarma, kterou zaregistrujete jednou. <strong>LAN / vlastní server</strong> vás připojí k vyhrazenému serveru PokerTH, vašemu nebo cizímu."],
      ["Sedněte si ke stolu",
       "V lobby se buď připojíte ke stolu ze seznamu, nebo si vytvoříte vlastní. Při vytváření nastavíte počet míst, počáteční stack, jak rychle rostou blindy a jestli má stůl heslo. Sdílejte odkaz s pozvánkou a kamarád přistane rovnou u vašeho stolu, ve svém prohlížeči, aniž by cokoli registroval."],
      ["Zahrajte rozdání",
       "Dostanete dvě vlastní karty. Sází se dokola před flopem a pak znovu po flopu, turnu a riveru. Když jste na řadě, akční lišta se rozsvítí a nabídne jen to, co je povolené: Fold, Check nebo Call, Raise či All-In. Částku můžete napsat, přetáhnout posuvníkem nebo jedním klepnutím nastavit na minimum, polovinu banku, celý bank nebo celý svůj stack."],
      ["Čtěte stůl",
       "Vaše aktuálně nejlepší kombinace je pojmenovaná pod stolem, jak karty přicházejí. Bank, každý stack i úroveň blindů jsou pořád na obrazovce, tlačítko dealera ukazuje, kdo mluví poslední, a odpočet ukazuje, kolik máte času. Při showdownu se u každé odkryté kombinace zvýrazní těch pět karet, které se počítaly."],
      ["Vyhrajte turnaj",
       "Hry v PokerTH jsou turnaje sit-and-go: všichni začínají se stejným stackem, blindy rostou podle hodin a hráči vypadávají, dokud jeden nemá všechny žetony. Nic nestojí peníze a žetony se nedají koupit — všechno jsou herní peníze, takže ve hře je jen hra sama."]
    ],
    phoneH2: "Hraní na telefonu",
    phoneP: "Stůl je stavěný pro dotykovou obrazovku stejně jako pro počítač: klepnutí na pole sázky otevře číselnou klávesnici přímo v akční liště místo systémové klávesnice, takže stůl nikdy neposkakuje, a posuvník se pohybuje po stejných krocích jako v desktopovém klientu. Upozornění na váš tah může přijít rovnou s tlačítky Fold a Check/Call, takže rozdání se dá dohrát bez přepínání zpět na kartu prohlížeče.",
    friendsH2: "Hraní s přáteli",
    friendsP: "Vytvořte stůl, nastavte heslo, pokud ho chcete soukromý, a pošlete odkaz s pozvánkou. Otevře stůl přímo — v nainstalované aplikaci, pokud si ji přidali na plochu, jinak na kartě prohlížeče. Nikdo nemusí nic instalovat ani dávat e-mailovou adresu.",
    faqH2: "Časté dotazy",
    faqP: function (h, c) { return "V žádném režimu nejsou ve hře skutečné peníze. Vaše nastavení, stylové balíčky i offline postup zůstávají ve vašem zařízení. Rozhraní je k dispozici ve 45 jazycích, zatímco pět akčních slov — Fold, Check, Call, Raise, All-In — zůstává anglicky, jako u každého stolu na světě. Více v <a href=\"{faq}\">častých dotazech</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  sk: {
    title: "Ako hrať poker online zadarmo — PokerTH Web",
    desc: "Krok za krokom: hrajte poker Texas Hold’em zadarmo v prehliadači, bez sťahovania a bez účtu — offline proti počítaču, v oficiálnej sieti pokerth.net alebo pri súkromnom stole s priateľmi.",
    ldHeadline: "Ako hrať zadarmo poker Texas Hold’em v prehliadači",
    ldDesc: "Návod krok za krokom, ako si zadarmo zahrať Texas Hold’em vo webovom klientovi PokerTH.",
    h1: "Ako hrať poker online zadarmo, priamo v prehliadači",
    lead: function (h, c) { return "Toto je krátka verzia: od prázdnej karty prehliadača k vášmu prvému rozdaniu Texas Hold’em v PokerTH. Ak hľadáte samotné pravidlá — blindy, kolá stávok, čo čo prebíja — začnite radšej <a href=\"{rules}\">stránkou s pravidlami</a> a <a href=\"{hands}\">pokerovými kombináciami</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Otvorte web — nie je čo inštalovať",
       "PokerTH beží v prehliadači. Žiadne sťahovanie, žiadny účet, žiadny doplnok. Na telefóne si ho z ponuky prehliadača môžete pridať na plochu; potom sa otvára ako aplikácia, na celú obrazovku, a funguje aj bez pripojenia."],
      ["Vyberte si, kde chcete hrať",
       "Tri režimy. <strong>Tréning offline</strong> vás okamžite posadí k stolu s počítačovými súpermi a nepotrebuje vôbec žiadne pripojenie — tu sa človek učí. <strong>pokerth.net</strong> je oficiálna sieť: skutoční súperi, sezónne rebríčky a prezývka zadarmo, ktorú zaregistrujete raz. <strong>LAN / vlastný server</strong> vás pripojí k vyhradenému serveru PokerTH, vášmu alebo cudziemu."],
      ["Sadnite si k stolu",
       "V lobby sa buď pripojíte k stolu zo zoznamu, alebo si vytvoríte vlastný. Pri vytváraní nastavíte počet miest, počiatočný stack, ako rýchlo rastú blindy a či má stôl heslo. Zdieľajte odkaz s pozvánkou a kamarát pristane rovno pri vašom stole, vo svojom prehliadači, bez toho aby čokoľvek registroval."],
      ["Zahrajte rozdanie",
       "Dostanete dve vlastné karty. Stávkuje sa dookola pred flopom a potom znova po flope, turne a riveri. Keď ste na rade, akčná lišta sa rozsvieti a ponúkne len to, čo je dovolené: Fold, Check alebo Call, Raise či All-In. Sumu môžete napísať, potiahnuť posuvníkom alebo jedným klepnutím nastaviť na minimum, polovicu banku, celý bank či celý svoj stack."],
      ["Čítajte stôl",
       "Vaša aktuálne najlepšia kombinácia je pomenovaná pod stolom, ako karty prichádzajú. Bank, každý stack aj úroveň blindov sú stále na obrazovke, tlačidlo dealera ukazuje, kto hovorí posledný, a odpočet ukazuje, koľko máte času. Pri showdowne sa pri každej odkrytej kombinácii zvýrazní tých päť kariet, ktoré sa rátali."],
      ["Vyhrajte turnaj",
       "Hry v PokerTH sú turnaje sit-and-go: všetci začínajú s rovnakým stackom, blindy rastú podľa hodín a hráči vypadávajú, kým jeden nemá všetky žetóny. Nič nestojí peniaze a žetóny sa nedajú kúpiť — všetko sú herné peniaze, takže v hre je len hra sama."]
    ],
    phoneH2: "Hranie na telefóne",
    phoneP: "Stôl je stavaný pre dotykovú obrazovku rovnako ako pre počítač: klepnutie na pole stávky otvorí číselnú klávesnicu priamo v akčnej lište namiesto systémovej klávesnice, takže stôl nikdy nepodskakuje, a posuvník sa pohybuje po rovnakých krokoch ako v desktopovom klientovi. Upozornenie na váš ťah môže prísť rovno s tlačidlami Fold a Check/Call, takže rozdanie sa dá dohrať bez prepínania späť na kartu prehliadača.",
    friendsH2: "Hranie s priateľmi",
    friendsP: "Vytvorte stôl, nastavte heslo, ak ho chcete súkromný, a pošlite odkaz s pozvánkou. Otvorí stôl priamo — v nainštalovanej aplikácii, ak si ju pridali na plochu, inak na karte prehliadača. Nikto nemusí nič inštalovať ani dávať e-mailovú adresu.",
    faqH2: "Časté otázky",
    faqP: function (h, c) { return "V žiadnom režime nie sú v hre skutočné peniaze. Vaše nastavenia, štýlové balíčky aj offline postup zostávajú vo vašom zariadení. Rozhranie je k dispozícii v 45 jazykoch, zatiaľ čo päť akčných slov — Fold, Check, Call, Raise, All-In — zostáva po anglicky, ako pri každom stole na svete. Viac v <a href=\"{faq}\">častých otázkach</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  ro: {
    title: "Cum să joci poker online gratis — PokerTH Web",
    desc: "Pas cu pas: joacă poker Texas Hold’em gratis în browser, fără descărcare și fără cont — offline împotriva calculatorului, în rețeaua oficială pokerth.net sau la o masă privată cu prietenii.",
    ldHeadline: "Cum să joci gratis poker Texas Hold’em în browser",
    ldDesc: "Un ghid pas cu pas pentru a juca gratis Texas Hold’em în clientul web PokerTH.",
    h1: "Cum să joci poker online gratis, direct în browser",
    lead: function (h, c) { return "Aceasta e versiunea scurtă: de la o filă goală până la prima ta mână de Texas Hold’em în PokerTH. Dacă ceea ce cauți sunt regulile în sine — blindurile, rundele de pariere, ce bate ce — începe mai bine cu <a href=\"{rules}\">pagina de reguli</a> și cu <a href=\"{hands}\">combinațiile la poker</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Deschide site-ul — nu ai ce instala",
       "PokerTH rulează în browser. Fără descărcare, fără cont, fără extensii. Pe telefon îl poți adăuga pe ecranul principal din meniul browserului; atunci se deschide ca o aplicație, pe tot ecranul, și funcționează și fără conexiune."],
      ["Alege unde vrei să joci",
       "Trei moduri. <strong>Antrenamentul offline</strong> te așază imediat la o masă cu adversari controlați de calculator și nu are nevoie de nicio conexiune — aici se învață. <strong>pokerth.net</strong> este rețeaua oficială: adversari reali, clasamente sezoniere și o poreclă gratuită pe care o înregistrezi o singură dată. <strong>LAN / server privat</strong> te conectează la un server PokerTH dedicat, al tău sau al altcuiva."],
      ["Așază-te la o masă",
       "În lobby fie te alături unei mese din listă, fie îți creezi una. Când o creezi, stabilești numărul de locuri, stiva de start, cât de repede cresc blindurile și dacă masa are parolă. Trimite linkul de invitație și prietenul ajunge direct la masa ta, în browserul lui, fără să înregistreze nimic."],
      ["Joacă mâna",
       "Primești două cărți proprii. Se pariază în jurul mesei înainte de flop și încă o dată după flop, turn și river. Când îți vine rândul, bara de acțiuni se aprinde și oferă doar ce este permis: Fold, Check sau Call, Raise ori All-In. Suma poate fi scrisă, trasă pe cursor sau fixată dintr-o atingere pe Min, jumătate din pot, potul întreg sau toată stiva ta."],
      ["Citește masa",
       "Cea mai bună mână a ta de moment este scrisă sub masă pe măsură ce ies cărțile. Potul, stiva fiecăruia și nivelul blindurilor sunt permanent pe ecran, butonul de dealer arată cine vorbește ultimul, iar o numărătoare inversă arată cât timp mai ai. La showdown sunt evidențiate cele cinci cărți care au format fiecare mână."],
      ["Câștigă turneul",
       "Partidele din PokerTH sunt turnee sit-and-go: toată lumea începe cu aceeași stivă, blindurile cresc după ceas, iar jucătorii sunt eliminați până când unul singur are toate jetoanele. Nimic nu costă bani și jetoanele nu se pot cumpăra — totul este bani de joc, așa că singurul lucru pus în joc este partida însăși."]
    ],
    phoneH2: "Jocul pe telefon",
    phoneP: "Masa este gândită pentru ecranul tactil la fel de mult ca pentru calculator: atingerea câmpului de pariu deschide o tastatură numerică chiar în bara de acțiuni, nu tastatura sistemului, așa că masa nu sare niciodată, iar cursorul se mișcă în aceiași pași ca la clientul de desktop. Notificările de rând pot ajunge la tine cu butoanele Fold și Check/Call pe ele, astfel încât o mână se poate juca fără a reveni în filă.",
    friendsH2: "Jocul cu prietenii",
    friendsP: "Creează o masă, pune o parolă dacă o vrei privată și trimite linkul de invitație. Acesta deschide masa direct — în aplicația instalată, dacă au adăugat-o pe ecranul principal, altfel într-o filă de browser. Nimeni nu trebuie să instaleze ceva sau să dea o adresă de e-mail.",
    faqH2: "Întrebări frecvente",
    faqP: function (h, c) { return "Nu sunt bani implicați niciodată, în niciun mod. Setările tale, pachetele de stil și progresul offline rămân pe propriul tău dispozitiv. Interfața este disponibilă în 45 de limbi, în timp ce cele cinci cuvinte de acțiune — Fold, Check, Call, Raise, All-In — rămân în engleză, ca la orice masă din lume. Mai multe în <a href=\"{faq}\">întrebările frecvente</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  hu: {
    title: "Hogyan játssz ingyen online pókert — PokerTH Web",
    desc: "Lépésről lépésre: játssz ingyen Texas Hold’em pókert a böngésződben, letöltés és regisztráció nélkül — offline a gép ellen, a hivatalos pokerth.net hálózaton, vagy zárt asztalnál a barátaiddal.",
    ldHeadline: "Hogyan játssz ingyen Texas Hold’em pókert a böngésződben",
    ldDesc: "Lépésről lépésre útmutató az ingyenes Texas Hold’emhez a PokerTH webes kliensében.",
    h1: "Hogyan játssz ingyen online pókert, egyenesen a böngésződben",
    lead: function (h, c) { return "Ez a rövid változat: az üres fültől az első Texas Hold’em leosztásodig a PokerTH-ben. Ha maguk a szabályok érdekelnek — vakok, licitkörök, mi mit ver — kezdd inkább a <a href=\"{rules}\">szabályok oldalával</a> és a <a href=\"{hands}\">kézsorrenddel</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Nyisd meg az oldalt — nincs mit telepíteni",
       "A PokerTH a böngészőben fut. Se letöltés, se fiók, se bővítmény. Telefonon a böngésző menüjéből hozzáadhatod a kezdőképernyőhöz; ekkor alkalmazásként nyílik meg, teljes képernyőn, és offline is működik."],
      ["Válaszd ki, hol akarsz játszani",
       "Három mód van. Az <strong>offline gyakorlás</strong> azonnal leültet egy asztalhoz gépi ellenfelekkel, és egyáltalán nem igényel kapcsolatot — itt lehet megtanulni. A <strong>pokerth.net</strong> a hivatalos hálózat: valódi ellenfelek, szezonális ranglisták és egy ingyenes becenév, amit egyszer kell regisztrálni. A <strong>LAN / saját szerver</strong> egy dedikált PokerTH-szerverhez csatlakoztat, a sajátodhoz vagy valaki máséhoz."],
      ["Ülj le egy asztalhoz",
       "A lobbiban vagy csatlakozol egy asztalhoz a listáról, vagy létrehozod a sajátodat. Létrehozáskor megadod a helyek számát, a kezdő zsetonmennyiséget, a vakok emelkedésének ütemét, és hogy legyen-e jelszó. Oszd meg a meghívó linket, és a barátod egyenesen a te asztalodnál köt ki, a saját böngészőjében, anélkül hogy bármit regisztrálna."],
      ["Játszd le a leosztást",
       "Két saját lapot kapsz. A licit körbemegy az asztalon a flop előtt, majd újra a flop, a turn és a river után. Amikor rád kerül a sor, a műveletsáv kigyullad, és csak azt kínálja fel, ami szabályos: Fold, Check vagy Call, Raise vagy All-In. Az összeget beírhatod, húzhatod a csúszkán, vagy egy koppintással beállíthatod a minimumra, a pot felére, a teljes potra vagy az összes zsetonodra."],
      ["Olvasd az asztalt",
       "Ahogy jönnek a lapok, az éppen legjobb kezed neve ott áll az asztal alatt. A pot, mindenki zsetonmennyisége és a vakszint végig a képernyőn van, az osztógomb mutatja, ki beszél utoljára, a visszaszámláló pedig azt, mennyi időd maradt. A leosztás végén minden felfedett kéznél kiemelődik az az öt lap, amelyik számított."],
      ["Nyerd meg a versenyt",
       "A PokerTH játékai sit-and-go versenyek: mindenki ugyanannyi zsetonnal kezd, a vakok óra szerint nőnek, és sorra esnek ki a játékosok, amíg valakinél össze nem gyűlik az összes zseton. Semmi sem kerül pénzbe, és zsetont sem lehet venni — minden játékpénz, így csak maga a játék a tét."]
    ],
    phoneH2: "Játék telefonon",
    phoneP: "Az asztal ugyanúgy érintőképernyőre készült, mint számítógépre: a tétmezőre koppintva a rendszerbillentyűzet helyett a műveletsávon belül nyílik egy számbillentyűzet, így az asztal soha nem ugrál, a csúszka pedig ugyanolyan lépésekben mozog, mint az asztali kliensben. A soron következést jelző értesítés Fold és Check/Call gombokkal is érkezhet, így egy leosztás lejátszható anélkül, hogy visszaváltanál a fülre.",
    friendsH2: "Játék barátokkal",
    friendsP: "Hozz létre egy asztalt, tegyél rá jelszót, ha zártnak szeretnéd, és küldd el a meghívó linket. Ez közvetlenül megnyitja az asztalt — a telepített alkalmazásban, ha felvették a kezdőképernyőre, egyébként egy böngészőfülön. Senkinek nem kell semmit telepítenie vagy e-mail-címet megadnia.",
    faqH2: "Gyakori kérdések",
    faqP: function (h, c) { return "Egyik módban sincs szó pénzről. A beállításaid, a stíluscsomagok és az offline haladásod a saját eszközödön maradnak. A felület 45 nyelven érhető el, míg az öt műveletszó — Fold, Check, Call, Raise, All-In — angolul marad, ahogy a világ minden asztalánál. Bővebben a <a href=\"{faq}\">gyakori kérdések</a> között.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  el: {
    title: "Πώς να παίξετε πόκερ online δωρεάν — PokerTH Web",
    desc: "Βήμα βήμα: παίξτε πόκερ Texas Hold’em δωρεάν στον περιηγητή σας, χωρίς λήψη και χωρίς λογαριασμό — εκτός σύνδεσης απέναντι στον υπολογιστή, στο επίσημο δίκτυο pokerth.net ή σε ιδιωτικό τραπέζι με φίλους.",
    ldHeadline: "Πώς να παίξετε δωρεάν πόκερ Texas Hold’em στον περιηγητή",
    ldDesc: "Οδηγός βήμα βήμα για να παίξετε δωρεάν Texas Hold’em στον πελάτη ιστού του PokerTH.",
    h1: "Πώς να παίξετε πόκερ online δωρεάν, μέσα από τον περιηγητή σας",
    lead: function (h, c) { return "Αυτή είναι η σύντομη εκδοχή: από μια κενή καρτέλα ως το πρώτο σας χέρι Texas Hold’em στο PokerTH. Αν αυτό που ψάχνετε είναι οι ίδιοι οι κανόνες — τυφλά, γύροι στοιχηματισμού, τι κερδίζει τι — ξεκινήστε καλύτερα από τη <a href=\"{rules}\">σελίδα των κανόνων</a> και την <a href=\"{hands}\">κατάταξη των χεριών</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Ανοίξτε τον ιστότοπο — δεν υπάρχει τίποτα να εγκαταστήσετε",
       "Το PokerTH τρέχει μέσα στον περιηγητή. Καμία λήψη, κανένας λογαριασμός, καμία επέκταση. Στο κινητό μπορείτε να το προσθέσετε στην αρχική οθόνη από το μενού του περιηγητή· τότε ανοίγει σαν εφαρμογή, σε πλήρη οθόνη, και λειτουργεί και εκτός σύνδεσης."],
      ["Διαλέξτε πού θέλετε να παίξετε",
       "Τρεις τρόποι. Η <strong>εξάσκηση εκτός σύνδεσης</strong> σας βάζει αμέσως σε τραπέζι με αντιπάλους του υπολογιστή και δεν χρειάζεται καμία σύνδεση — εδώ μαθαίνει κανείς. Το <strong>pokerth.net</strong> είναι το επίσημο δίκτυο: αληθινοί αντίπαλοι, κατατάξεις ανά σεζόν και ένα δωρεάν ψευδώνυμο που δηλώνετε μία φορά. Το <strong>LAN / ιδιωτικός διακομιστής</strong> σας συνδέει σε έναν αποκλειστικό διακομιστή PokerTH, δικό σας ή κάποιου άλλου."],
      ["Καθίστε σε ένα τραπέζι",
       "Στο λόμπι είτε μπαίνετε σε τραπέζι από τη λίστα είτε φτιάχνετε το δικό σας. Φτιάχνοντάς το ορίζετε τον αριθμό των θέσεων, το αρχικό κεφάλαιο, πόσο γρήγορα ανεβαίνουν τα τυφλά και αν το τραπέζι έχει κωδικό. Μοιραστείτε τον σύνδεσμο πρόσκλησης και ο φίλος σας προσγειώνεται κατευθείαν στο τραπέζι σας, από τον δικό του περιηγητή, χωρίς να δηλώσει τίποτα."],
      ["Παίξτε το χέρι",
       "Σας μοιράζονται δύο κλειστά φύλλα. Ο στοιχηματισμός γυρίζει το τραπέζι πριν από το φλοπ και ξανά μετά το φλοπ, το τερν και το ριβέρ. Όταν έρθει η σειρά σας, η μπάρα ενεργειών ανάβει και προσφέρει μόνο ό,τι επιτρέπεται: Fold, Check ή Call, Raise ή All-In. Το ποσό μπορείτε να το πληκτρολογήσετε, να το σύρετε στον ολισθητή ή να το ορίσετε με ένα άγγιγμα σε Min, μισό πότ, ολόκληρο πότ ή όλο σας το κεφάλαιο."],
      ["Διαβάστε το τραπέζι",
       "Το καλύτερο χέρι που έχετε τη στιγμή εκείνη γράφεται κάτω από το τραπέζι καθώς βγαίνουν τα φύλλα. Το πότ, το κεφάλαιο του καθενός και το επίπεδο των τυφλών είναι διαρκώς στην οθόνη, το κουμπί του ντίλερ δείχνει ποιος μιλά τελευταίος και μια αντίστροφη μέτρηση δείχνει πόσο χρόνο έχετε. Στο σόουνταουν τονίζονται τα πέντε φύλλα που σχημάτισαν κάθε χέρι."],
      ["Κερδίστε το τουρνουά",
       "Οι παρτίδες στο PokerTH είναι τουρνουά sit-and-go: όλοι ξεκινούν με το ίδιο κεφάλαιο, τα τυφλά ανεβαίνουν με το ρολόι και οι παίκτες αποκλείονται ώσπου ένας να έχει όλες τις μάρκες. Τίποτα δεν κοστίζει χρήματα και μάρκες δεν αγοράζονται — όλα είναι πλασματικά, οπότε το μόνο που παίζεται είναι το ίδιο το παιχνίδι."]
    ],
    phoneH2: "Παίζοντας από κινητό",
    phoneP: "Το τραπέζι είναι φτιαγμένο για οθόνη αφής όσο και για υπολογιστή: το άγγιγμα στο πεδίο του ποντάρισματος ανοίγει ένα αριθμητικό πληκτρολόγιο μέσα στη μπάρα ενεργειών αντί για το πληκτρολόγιο του συστήματος, ώστε το τραπέζι να μην αναπηδά ποτέ, και ο ολισθητής κινείται με τα ίδια βήματα όπως στον πελάτη υπολογιστή. Οι ειδοποιήσεις σειράς μπορούν να φτάνουν με κουμπιά Fold και Check/Call επάνω τους, οπότε ένα χέρι παίζεται χωρίς να γυρίσετε στην καρτέλα.",
    friendsH2: "Παίζοντας με φίλους",
    friendsP: "Φτιάξτε τραπέζι, βάλτε κωδικό αν το θέλετε ιδιωτικό, και στείλτε τον σύνδεσμο πρόσκλησης. Ανοίγει το τραπέζι απευθείας — στην εγκατεστημένη εφαρμογή αν την έχουν προσθέσει στην αρχική οθόνη, αλλιώς σε μια καρτέλα του περιηγητή. Κανείς δεν χρειάζεται να εγκαταστήσει κάτι ούτε να δώσει διεύθυνση email.",
    faqH2: "Συχνές ερωτήσεις",
    faqP: function (h, c) { return "Χρήματα δεν εμπλέκονται ποτέ, σε κανέναν τρόπο παιχνιδιού. Οι ρυθμίσεις σας, τα πακέτα εμφάνισης και η πρόοδος εκτός σύνδεσης μένουν στη δική σας συσκευή. Η διεπαφή διατίθεται σε 45 γλώσσες, ενώ οι πέντε λέξεις ενεργειών — Fold, Check, Call, Raise, All-In — παραμένουν στα αγγλικά, όπως σε κάθε τραπέζι του κόσμου. Περισσότερα στις <a href=\"{faq}\">συχνές ερωτήσεις</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  bg: {
    title: "Как да играете покер онлайн безплатно — PokerTH Web",
    desc: "Стъпка по стъпка: играйте покер Тексас Холдем безплатно в браузъра, без изтегляне и без регистрация — офлайн срещу компютъра, в официалната мрежа pokerth.net или на частна маса с приятели.",
    ldHeadline: "Как да играете безплатно покер Тексас Холдем в браузъра",
    ldDesc: "Ръководство стъпка по стъпка за безплатна игра на Тексас Холдем в уеб клиента на PokerTH.",
    h1: "Как да играете покер онлайн безплатно, направо в браузъра",
    lead: function (h, c) { return "Това е кратката версия: от празен раздел до първата ви ръка Тексас Холдем в PokerTH. Ако търсите самите правила — тъмни залози, кръгове на наддаване, коя ръка коя бие — започнете по-скоро със <a href=\"{rules}\">страницата с правилата</a> и с <a href=\"{hands}\">комбинациите</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Отворете сайта — няма какво да инсталирате",
       "PokerTH работи в браузъра. Без изтегляне, без регистрация, без добавки. На телефон можете да го добавите към началния екран от менюто на браузъра; тогава се отваря като приложение, на цял екран, и работи и офлайн."],
      ["Изберете къде искате да играете",
       "Три режима. <strong>Офлайн тренировката</strong> веднага ви сяда на маса с компютърни съперници и изобщо не се нуждае от връзка — тук се учи. <strong>pokerth.net</strong> е официалната мрежа: истински съперници, сезонни класирания и безплатен псевдоним, който регистрирате веднъж. <strong>LAN / частен сървър</strong> ви свързва със специален сървър на PokerTH, ваш или на някой друг."],
      ["Седнете на маса",
       "В лобито или се присъединявате към маса от списъка, или създавате своя. При създаването задавате броя места, началния стек, колко бързо растат тъмните залози и дали масата е с парола. Споделете поканата и приятелят ви попада направо на вашата маса, в своя браузър, без да регистрира каквото и да било."],
      ["Изиграйте ръката",
       "Получавате две закрити карти. Наддаването обикаля масата преди флопа и отново след флопа, търна и ривъра. Когато дойде вашият ред, лентата с действия светва и предлага само позволеното: Fold, Check или Call, Raise или All-In. Сумата може да се въведе, да се плъзне с плъзгача или да се зададе с едно докосване на Min, половин пот, целия пот или целия ви стек."],
      ["Четете масата",
       "Най-добрата ви в момента комбинация се изписва под масата, докато излизат картите. Потът, стекът на всеки и нивото на тъмните залози са през цялото време на екрана, бутонът на дилъра показва кой говори последен, а отброяването — с колко време разполагате. При разкриването се откроят онези пет карти, които са съставили всяка ръка."],
      ["Спечелете турнира",
       "Игрите в PokerTH са турнири sit-and-go: всички започват с еднакъв стек, тъмните залози растат по часовник, а играчите отпадат, докато един не събере всички чипове. Нищо не струва пари и чипове не могат да се купуват — всичко е на игрални чипове, така че заложена е само самата игра."]
    ],
    phoneH2: "Игра на телефон",
    phoneP: "Масата е направена за сензорен екран точно толкова, колкото и за компютър: докосването на полето за залог отваря цифрова клавиатура вътре в лентата с действия вместо системната, така че масата никога не подскача, а плъзгачът се движи със същите стъпки като в настолния клиент. Известията за вашия ред могат да идват с бутони Fold и Check/Call върху тях, така че една ръка може да се изиграе, без да се връщате в раздела.",
    friendsH2: "Игра с приятели",
    friendsP: "Създайте маса, сложете парола, ако я искате частна, и изпратете поканата. Тя отваря масата направо — в инсталираното приложение, ако са го добавили към началния екран, иначе в раздел на браузъра. Никой не трябва да инсталира нищо, нито да дава имейл адрес.",
    faqH2: "Чести въпроси",
    faqP: function (h, c) { return "В нито един режим не участват истински пари. Настройките, стиловите пакети и офлайн напредъкът ви остават на собственото ви устройство. Интерфейсът е достъпен на 45 езика, докато петте думи за действие — Fold, Check, Call, Raise, All-In — остават на английски, както на всяка маса по света. Повече в <a href=\"{faq}\">честите въпроси</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  hr: {
    title: "Kako besplatno igrati poker online — PokerTH Web",
    desc: "Korak po korak: igrajte Texas Hold’em poker besplatno u pregledniku, bez preuzimanja i bez računa — offline protiv računala, na službenoj mreži pokerth.net ili za privatnim stolom s prijateljima.",
    ldHeadline: "Kako besplatno igrati Texas Hold’em poker u pregledniku",
    ldDesc: "Vodič korak po korak za besplatnu igru Texas Hold’ema u PokerTH web klijentu.",
    h1: "Kako besplatno igrati poker online, izravno u pregledniku",
    lead: function (h, c) { return "Ovo je kratka verzija: od prazne kartice do vaše prve ruke Texas Hold’ema u PokerTH-u. Ako tražite sama pravila — mali i veliki ulog, krugove klađenja, što što pobjeđuje — krenite radije od <a href=\"{rules}\">stranice s pravilima</a> i <a href=\"{hands}\">jačine kombinacija</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Otvorite stranicu — nema se što instalirati",
       "PokerTH radi u pregledniku. Bez preuzimanja, bez računa, bez dodataka. Na telefonu ga možete iz izbornika preglednika dodati na početni zaslon; tada se otvara kao aplikacija, preko cijelog zaslona, i radi i bez veze."],
      ["Odaberite gdje želite igrati",
       "Tri načina. <strong>Vježbanje offline</strong> odmah vas posjeda za stol s računalnim protivnicima i uopće ne treba vezu — tu se uči. <strong>pokerth.net</strong> je službena mreža: pravi protivnici, sezonske ljestvice i besplatan nadimak koji registrirate jednom. <strong>LAN / privatni poslužitelj</strong> spaja vas na namjenski PokerTH poslužitelj, vaš ili tuđi."],
      ["Sjednite za stol",
       "U predvorju se pridružujete stolu s popisa ili stvarate vlastiti. Pri stvaranju određujete broj mjesta, početni stog, koliko brzo rastu ulozi i ima li stol lozinku. Podijelite poveznicu s pozivom i prijatelj slijeće ravno za vaš stol, u svom pregledniku, bez ikakve registracije."],
      ["Odigrajte ruku",
       "Dobivate dvije zatvorene karte. Kladi se ukrug prije flopa, pa ponovno nakon flopa, turna i rivera. Kad dođete na red, traka radnji zasvijetli i nudi samo ono što je dopušteno: Fold, Check ili Call, Raise ili All-In. Iznos možete upisati, povući klizačem ili jednim dodirom postaviti na najmanji, pola pota, cijeli pot ili cijeli svoj stog."],
      ["Čitajte stol",
       "Vaša trenutačno najbolja kombinacija ispisana je ispod stola kako karte izlaze. Pot, svaki stog i razina uloga stalno su na zaslonu, gumb djelitelja pokazuje tko govori zadnji, a odbrojavanje koliko vam je vremena ostalo. Pri otvaranju karata istaknuto je onih pet karata koje su činile svaku ruku."],
      ["Pobijedite na turniru",
       "Igre u PokerTH-u su sit-and-go turniri: svi počinju s istim stogom, ulozi rastu po satu, a igrači ispadaju dok jedan ne ostane sa svim žetonima. Ništa ne stoji novca i žetoni se ne mogu kupiti — sve je igrački novac, pa je na kocki samo sama igra."]
    ],
    phoneH2: "Igranje na telefonu",
    phoneP: "Stol je jednako građen za dodirni zaslon kao i za računalo: dodir na polje uloga otvara brojčanu tipkovnicu unutar trake radnji umjesto sistemske, pa stol nikada ne poskakuje, a klizač se pomiče istim koracima kao u stolnom klijentu. Obavijesti da ste na redu mogu stići s gumbima Fold i Check/Call na sebi, pa se ruka može odigrati bez vraćanja u karticu.",
    friendsH2: "Igranje s prijateljima",
    friendsP: "Stvorite stol, stavite lozinku ako ga želite privatnim, i pošaljite poveznicu s pozivom. Ona otvara stol izravno — u instaliranoj aplikaciji ako su je dodali na početni zaslon, inače u kartici preglednika. Nitko ne mora ništa instalirati ni davati adresu e-pošte.",
    faqH2: "Česta pitanja",
    faqP: function (h, c) { return "Ni u jednom načinu nema pravog novca. Vaše postavke, paketi stilova i offline napredak ostaju na vašem uređaju. Sučelje je dostupno na 45 jezika, dok pet riječi za radnje — Fold, Check, Call, Raise, All-In — ostaju na engleskom, kao za svakim stolom na svijetu. Više u <a href=\"{faq}\">čestim pitanjima</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  sr: {
    title: "Kako besplatno igrati poker onlajn — PokerTH Web",
    desc: "Korak po korak: igrajte Teksas Holdem poker besplatno u pregledaču, bez preuzimanja i bez naloga — oflajn protiv računara, na zvaničnoj mreži pokerth.net ili za privatnim stolom sa prijateljima.",
    ldHeadline: "Kako besplatno igrati Teksas Holdem poker u pregledaču",
    ldDesc: "Vodič korak po korak za besplatnu igru Teksas Holdema u PokerTH veb klijentu.",
    h1: "Kako besplatno igrati poker onlajn, direktno u pregledaču",
    lead: function (h, c) { return "Ovo je kratka verzija: od prazne kartice do vaše prve ruke Teksas Holdema u PokerTH-u. Ako tražite sama pravila — mali i veliki ulog, krugove klađenja, šta šta pobeđuje — krenite radije od <a href=\"{rules}\">stranice sa pravilima</a> i <a href=\"{hands}\">jačine kombinacija</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Otvorite sajt — nema šta da se instalira",
       "PokerTH radi u pregledaču. Bez preuzimanja, bez naloga, bez dodataka. Na telefonu ga iz menija pregledača možete dodati na početni ekran; tada se otvara kao aplikacija, preko celog ekrana, i radi i bez veze."],
      ["Izaberite gde želite da igrate",
       "Tri načina. <strong>Vežbanje oflajn</strong> vas odmah posadi za sto sa računarskim protivnicima i uopšte ne traži vezu — tu se uči. <strong>pokerth.net</strong> je zvanična mreža: pravi protivnici, sezonske liste i besplatan nadimak koji registrujete jednom. <strong>LAN / privatni server</strong> vas povezuje na namenski PokerTH server, vaš ili tuđi."],
      ["Sedite za sto",
       "U predvorju se pridružujete stolu sa spiska ili pravite svoj. Pri pravljenju određujete broj mesta, početni stek, koliko brzo rastu ulozi i da li sto ima lozinku. Podelite pozivnu vezu i prijatelj sleti pravo za vaš sto, u svom pregledaču, bez ikakve registracije."],
      ["Odigrajte ruku",
       "Dobijate dve zatvorene karte. Kladi se ukrug pre flopa, pa ponovo posle flopa, terna i rivera. Kada dođete na red, traka radnji zasvetli i nudi samo ono što je dozvoljeno: Fold, Check ili Call, Raise ili All-In. Iznos možete upisati, povući klizačem ili jednim dodirom postaviti na najmanji, pola pota, ceo pot ili ceo svoj stek."],
      ["Čitajte sto",
       "Vaša trenutno najbolja kombinacija ispisana je ispod stola kako karte izlaze. Pot, svaki stek i nivo uloga stalno su na ekranu, dugme delioca pokazuje ko govori poslednji, a odbrojavanje koliko vam je vremena ostalo. Pri otvaranju karata istaknuto je onih pet karata koje su činile svaku ruku."],
      ["Pobedite na turniru",
       "Igre u PokerTH-u su sit-and-go turniri: svi počinju sa istim stekom, ulozi rastu po satu, a igrači ispadaju dok jedan ne ostane sa svim žetonima. Ništa ne košta novca i žetoni se ne mogu kupiti — sve je igrački novac, pa je na kocki samo sama igra."]
    ],
    phoneH2: "Igranje na telefonu",
    phoneP: "Sto je podjednako pravljen za dodirni ekran kao i za računar: dodir na polje uloga otvara brojčanu tastaturu unutar trake radnji umesto sistemske, pa sto nikada ne poskakuje, a klizač se pomera istim koracima kao u desktop klijentu. Obaveštenja da ste na redu mogu stići sa dugmadima Fold i Check/Call na sebi, pa se ruka može odigrati bez vraćanja u karticu.",
    friendsH2: "Igranje sa prijateljima",
    friendsP: "Napravite sto, stavite lozinku ako želite da bude privatan, i pošaljite pozivnu vezu. Ona otvara sto direktno — u instaliranoj aplikaciji ako su je dodali na početni ekran, inače u kartici pregledača. Niko ne mora ništa da instalira niti da daje adresu e-pošte.",
    faqH2: "Česta pitanja",
    faqP: function (h, c) { return "Ni u jednom režimu nema pravog novca. Vaša podešavanja, paketi stilova i oflajn napredak ostaju na vašem uređaju. Interfejs je dostupan na 45 jezika, dok pet reči za radnje — Fold, Check, Call, Raise, All-In — ostaju na engleskom, kao za svakim stolom na svetu. Više u <a href=\"{faq}\">čestim pitanjima</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  ca: {
    title: "Com jugar al pòquer en línia gratis — PokerTH Web",
    desc: "Pas a pas: juga al pòquer Texas Hold’em gratis al navegador, sense descàrregues i sense compte — fora de línia contra l’ordinador, a la xarxa oficial pokerth.net o en una taula privada amb amics.",
    ldHeadline: "Com jugar gratis al pòquer Texas Hold’em al navegador",
    ldDesc: "Una guia pas a pas per jugar gratis al Texas Hold’em al client web de PokerTH.",
    h1: "Com jugar al pòquer en línia gratis, des del navegador",
    lead: function (h, c) { return "Aquesta és la versió curta: d’una pestanya en blanc a la teva primera mà de Texas Hold’em a PokerTH. Si el que busques són les regles mateixes — cegues, rondes d’apostes, què guanya a què — comença per la <a href=\"{rules}\">pàgina de regles</a> i per les <a href=\"{hands}\">jugades de pòquer</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Obre el lloc — no hi ha res per instal·lar",
       "PokerTH funciona al navegador. Sense descàrregues, sense compte, sense connectors. Al mòbil el pots afegir a la pantalla d’inici des del menú del navegador; llavors s’obre com una aplicació, a pantalla completa, i funciona fora de línia."],
      ["Tria on vols jugar",
       "Tres modes. La <strong>pràctica fora de línia</strong> et fa seure de seguida en una taula d’oponents controlats per l’ordinador i no necessita cap connexió: aquí és on s’aprèn. <strong>pokerth.net</strong> és la xarxa oficial: rivals reals, classificacions per temporada i un sobrenom gratuït que registres una sola vegada. <strong>LAN / servidor privat</strong> et connecta a un servidor PokerTH dedicat, teu o d’algú altre."],
      ["Seu en una taula",
       "Al vestíbul t’afegeixes a una taula de la llista o crees la teva. En crear-la tries el nombre de seients, la pila inicial, la rapidesa amb què pugen les cegues i si la taula té contrasenya. Comparteix l’enllaç d’invitació i un amic aterra directament a la teva taula, al seu navegador, sense registrar res."],
      ["Juga la mà",
       "Reps dues cartes tapades. S’aposta al voltant de la taula abans del flop i un altre cop després del flop, el turn i el river. Quan et toca, la barra d’accions s’encén i només ofereix el que és permès: Fold, Check o Call, Raise o All-In. L’import es pot escriure, arrossegar amb el control lliscant o fixar amb un toc a Mín., mig pot, el pot o tota la teva pila."],
      ["Llegeix la taula",
       "La teva millor jugada del moment surt anomenada sota la taula a mesura que van sortint les cartes. El pot, cada pila i el nivell de cegues són sempre a la pantalla, el botó de repartidor indica qui parla últim i un compte enrere mostra el temps que et queda. A l’obertura de cartes es destaquen les cinc cartes que van formar cada mà."],
      ["Guanya el torneig",
       "Les partides de PokerTH són tornejos sit-and-go: tothom comença amb la mateixa pila, les cegues pugen per rellotge i els jugadors van caient fins que un té totes les fitxes. Res no costa diners i no es poden comprar fitxes — tot són diners ficticis, així que l’única cosa en joc és la partida mateixa."]
    ],
    phoneH2: "Jugar al mòbil",
    phoneP: "La taula està feta tant per a pantalla tàctil com per a ordinador: tocar el camp d’aposta obre un teclat numèric dins la barra d’accions en comptes del teclat del sistema, de manera que la taula no salta mai, i el control lliscant avança amb els mateixos passos que el client d’escriptori. Les notificacions de torn poden arribar amb els botons Fold i Check/Call incorporats, així es pot jugar una mà sense tornar a la pestanya.",
    friendsH2: "Jugar amb amics",
    friendsP: "Crea una taula, posa-hi contrasenya si la vols privada i envia l’enllaç d’invitació. Obre la taula directament — a l’aplicació instal·lada si l’han afegida a la pantalla d’inici, o en una pestanya del navegador si no. Ningú no ha d’instal·lar res ni donar cap adreça de correu.",
    faqH2: "Preguntes freqüents",
    faqP: function (h, c) { return "No hi ha mai diners pel mig, en cap mode. La teva configuració, els paquets d’estil i el progrés fora de línia es queden al teu propi dispositiu. La interfície està disponible en 45 idiomes, mentre que les cinc paraules d’acció — Fold, Check, Call, Raise, All-In — es mantenen en anglès, com a qualsevol taula del món. Més a les <a href=\"{faq}\">preguntes freqüents</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  gl: {
    title: "Como xogar ao póker en liña de balde — PokerTH Web",
    desc: "Paso a paso: xoga ao póker Texas Hold’em de balde no navegador, sen descargas e sen conta — sen conexión contra o computador, na rede oficial pokerth.net ou nunha mesa privada cos amigos.",
    ldHeadline: "Como xogar de balde ao póker Texas Hold’em no navegador",
    ldDesc: "Unha guía paso a paso para xogar de balde ao Texas Hold’em no cliente web de PokerTH.",
    h1: "Como xogar ao póker en liña de balde, desde o navegador",
    lead: function (h, c) { return "Esta é a versión curta: dunha lapela en branco á túa primeira man de Texas Hold’em en PokerTH. Se o que buscas son as regras mesmas — cegas, roldas de apostas, que gaña a que — comeza pola <a href=\"{rules}\">páxina de regras</a> e polas <a href=\"{hands}\">xogadas de póker</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Abre o sitio — non hai nada que instalar",
       "PokerTH funciona no navegador. Sen descargas, sen conta, sen complementos. No móbil podes engadilo á pantalla de inicio desde o menú do navegador; entón ábrese como unha aplicación, a pantalla completa, e funciona sen conexión."],
      ["Escolle onde queres xogar",
       "Tres modos. A <strong>práctica sen conexión</strong> senta-te de contado nunha mesa de adversarios controlados polo computador e non precisa conexión ningunha: aquí é onde se aprende. <strong>pokerth.net</strong> é a rede oficial: rivais reais, clasificacións por tempada e unha alcuma de balde que rexistras unha soa vez. <strong>LAN / servidor privado</strong> conéctate a un servidor PokerTH dedicado, teu ou doutra persoa."],
      ["Senta nunha mesa",
       "No vestíbulo únesche a unha mesa da lista ou creas a túa. Ao crear escolles o número de asentos, as fichas iniciais, a rapidez coa que soben as cegas e se a mesa leva contrasinal. Comparte a ligazón de convite e o amigo chega directamente á túa mesa, no seu navegador, sen rexistrar nada."],
      ["Xoga a man",
       "Recibes dúas cartas tapadas. Apóstase arredor da mesa antes do flop e outra vez despois do flop, o turn e o river. Cando che toca, a barra de accións acéndese e só ofrece o permitido: Fold, Check ou Call, Raise ou All-In. A cantidade pódese escribir, arrastrar no desprazador ou fixar cun toque en Mín., a metade do bote, o bote ou todas as túas fichas."],
      ["Le a mesa",
       "A túa mellor xogada do momento aparece nomeada baixo a mesa a medida que saen as cartas. O bote, as fichas de cada quen e o nivel das cegas están sempre na pantalla, o botón de repartidor indica quen fala en último lugar e unha conta atrás amosa canto tempo che queda. Na apertura de cartas destácanse as cinco cartas que formaron cada man."],
      ["Gaña o torneo",
       "As partidas de PokerTH son torneos sit-and-go: todo o mundo comeza coas mesmas fichas, as cegas soben por reloxo e os xogadores van caendo ata que un ten todas as fichas. Nada custa cartos e non se poden mercar fichas — todo son cartos ficticios, así que o único en xogo é a propia partida."]
    ],
    phoneH2: "Xogar no móbil",
    phoneP: "A mesa está pensada tanto para pantalla táctil como para computador: tocar o campo da aposta abre un teclado numérico dentro da barra de accións en lugar do teclado do sistema, así a mesa nunca dá saltos, e o desprazador avanza cos mesmos pasos que o cliente de escritorio. As notificacións de quenda poden chegar cos botóns Fold e Check/Call postos, de xeito que se pode xogar unha man sen volver á lapela.",
    friendsH2: "Xogar cos amigos",
    friendsP: "Crea unha mesa, ponlle contrasinal se a queres privada e envía a ligazón de convite. Abre a mesa directamente — na aplicación instalada se a engadiron á pantalla de inicio, ou nunha lapela do navegador se non. Ninguén ten que instalar nada nin dar un enderezo de correo.",
    faqH2: "Preguntas frecuentes",
    faqP: function (h, c) { return "Nunca hai cartos polo medio, en ningún modo. A túa configuración, os paquetes de estilo e o progreso sen conexión quedan no teu propio dispositivo. A interface está dispoñible en 45 idiomas, mentres que as cinco palabras de acción — Fold, Check, Call, Raise, All-In — quedan en inglés, coma en calquera mesa do mundo. Máis nas <a href=\"{faq}\">preguntas frecuentes</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  lt: {
    title: "Kaip nemokamai žaisti pokerį internete — PokerTH Web",
    desc: "Žingsnis po žingsnio: žaiskite Texas Hold’em pokerį nemokamai naršyklėje, be atsisiuntimo ir be paskyros — neprisijungus prieš kompiuterį, oficialiame pokerth.net tinkle arba prie privataus stalo su draugais.",
    ldHeadline: "Kaip nemokamai žaisti Texas Hold’em pokerį naršyklėje",
    ldDesc: "Žingsnis po žingsnio vadovas, kaip nemokamai žaisti Texas Hold’em PokerTH žiniatinklio kliente.",
    h1: "Kaip nemokamai žaisti pokerį internete, tiesiai naršyklėje",
    lead: function (h, c) { return "Tai trumpoji versija: nuo tuščios kortelės iki pirmosios jūsų Texas Hold’em rankos PokerTH. Jei ieškote pačių taisyklių — aklųjų statymų, statymų ratų, kas ką muša — pradėkite geriau nuo <a href=\"{rules}\">taisyklių puslapio</a> ir <a href=\"{hands}\">derinių eiliškumo</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Atverkite svetainę — nieko diegti nereikia",
       "PokerTH veikia naršyklėje. Jokio atsisiuntimo, jokios paskyros, jokių papildinių. Telefone jį galite pridėti į pradžios ekraną iš naršyklės meniu; tada jis atsiveria kaip programėlė, visame ekrane, ir veikia net be ryšio."],
      ["Pasirinkite, kur norite žaisti",
       "Trys būdai. <strong>Treniruotė neprisijungus</strong> iškart pasodina jus prie stalo su kompiuterio varžovais ir jai visai nereikia ryšio — čia ir mokomasi. <strong>pokerth.net</strong> yra oficialus tinklas: tikri varžovai, sezono reitingai ir nemokamas slapyvardis, kurį užregistruojate vieną kartą. <strong>LAN / privatus serveris</strong> prijungia prie skirtojo PokerTH serverio — jūsų ar kieno nors kito."],
      ["Atsisėskite prie stalo",
       "Vestibiulyje arba prisijungiate prie stalo iš sąrašo, arba susikuriate savo. Kurdami nustatote vietų skaičių, pradinį žetonų kiekį, kaip greitai kyla aklieji statymai ir ar stalas apsaugotas slaptažodžiu. Pasidalykite pakvietimo nuoroda — draugas atsidurs tiesiai prie jūsų stalo, savo naršyklėje, nieko neregistruodamas."],
      ["Sužaiskite ranką",
       "Jums išdalijamos dvi uždaros kortos. Statoma ratu prieš flopą ir dar kartą po flopo, terno bei riverio. Kai ateina jūsų eilė, veiksmų juosta įsižiebia ir siūlo tik tai, kas leidžiama: Fold, Check arba Call, Raise ar All-In. Sumą galima įvesti, patempti šliaužikliu arba vienu palietimu nustatyti į minimumą, pusę banko, visą banką ar visus savo žetonus."],
      ["Skaitykite stalą",
       "Kortoms atsiverčiant, geriausias tuo metu jūsų derinys užrašomas po stalu. Bankas, kiekvieno žetonai ir aklųjų statymų lygis visą laiką matomi ekrane, dalytojo mygtukas rodo, kas kalba paskutinis, o atgalinis laikmatis — kiek jums liko laiko. Atskleidžiant kortas kiekvienoje atverstoje rankoje paryškinamos tos penkios kortos, kurios iš tikrųjų buvo skaičiuojamos."],
      ["Laimėkite turnyrą",
       "PokerTH žaidimai yra sit-and-go turnyrai: visi pradeda su tokiu pat žetonų kiekiu, aklieji statymai kyla pagal laikrodį, o žaidėjai iškrenta, kol vienam atitenka visi žetonai. Niekas nekainuoja pinigų ir žetonų nusipirkti negalima — visi jie žaidimo, tad statoma tik pati partija."]
    ],
    phoneH2: "Žaidimas telefonu",
    phoneP: "Stalas pritaikytas jutikliniam ekranui ne mažiau nei kompiuteriui: palietus statymo lauką, vietoj sistemos klaviatūros veiksmų juostoje atsiveria skaitmenų klaviatūra, todėl stalas niekada nešokinėja, o šliaužiklis juda tokiais pat žingsniais kaip staliniame kliente. Pranešimai apie jūsų eilę gali ateiti su Fold ir Check/Call mygtukais, tad ranką galima sužaisti negrįžtant į kortelę.",
    friendsH2: "Žaidimas su draugais",
    friendsP: "Sukurkite stalą, uždėkite slaptažodį, jei norite, kad būtų privatus, ir išsiųskite pakvietimo nuorodą. Ji atveria stalą tiesiogiai — įdiegtoje programėlėje, jei ją pridėjo į pradžios ekraną, kitu atveju naršyklės kortelėje. Niekam nereikia nieko diegti ar palikti el. pašto adreso.",
    faqH2: "Dažni klausimai",
    faqP: function (h, c) { return "Nė viename režime tikri pinigai nedalyvauja. Jūsų nustatymai, stiliaus paketai ir pažanga neprisijungus lieka jūsų pačių įrenginyje. Sąsaja pateikiama 45 kalbomis, o penki veiksmų žodžiai — Fold, Check, Call, Raise, All-In — lieka angliški, kaip ir prie bet kurio stalo pasaulyje. Daugiau <a href=\"{faq}\">dažnuose klausimuose</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  af: {
    title: "Hoe om gratis aanlyn poker te speel — PokerTH Web",
    desc: "Stap vir stap: speel Texas Hold’em-poker gratis in jou blaaier, sonder aflaai en sonder rekening — vanlyn teen die rekenaar, op die amptelike pokerth.net-netwerk, of aan ’n privaat tafel met vriende.",
    ldHeadline: "Hoe om gratis Texas Hold’em-poker in jou blaaier te speel",
    ldDesc: "’n Stap-vir-stap-gids om gratis Texas Hold’em in die PokerTH-webkliënt te speel.",
    h1: "Hoe om gratis aanlyn poker te speel, reg in jou blaaier",
    lead: function (h, c) { return "Dit is die kort weergawe: van ’n leë oortjie tot jou eerste hand Texas Hold’em in PokerTH. As dit die reëls self is wat jy soek — blindes, bierondes, wat wat klop — begin eerder by die <a href=\"{rules}\">reëlsbladsy</a> en die <a href=\"{hands}\">pokerhande</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Maak die werf oop — daar is niks om te installeer nie",
       "PokerTH loop in die blaaier. Geen aflaai, geen rekening, geen inprop nie. Op ’n foon kan jy dit uit die blaaierkieslys by die tuisskerm voeg; dan open dit soos ’n toep, volskerm, en werk ook vanlyn."],
      ["Kies waar jy wil speel",
       "Drie maniere. <strong>Vanlyn oefening</strong> laat jou dadelik aan ’n tafel met rekenaarteenstanders sit en het glad nie ’n verbinding nodig nie — hier leer ’n mens. <strong>pokerth.net</strong> is die amptelike netwerk: regte teenstanders, seisoenranglyste en ’n gratis bynaam wat jy een keer registreer. <strong>LAN / privaat bediener</strong> koppel aan ’n toegewyde PokerTH-bediener, joune of iemand anders s’n."],
      ["Sit aan ’n tafel",
       "In die voorportaal sluit jy by ’n tafel uit die lys aan of skep jy jou eie. Wanneer jy een skep, stel jy die aantal plekke, die beginstapel, hoe vinnig die blindes styg en of die tafel ’n wagwoord het. Deel die uitnodigingskakel en ’n vriend land reg by jou tafel, in sy eie blaaier, sonder om enigiets te registreer."],
      ["Speel die hand",
       "Jy kry twee toe kaarte. Daar word om die tafel gewed voor die flop, en weer ná die flop, die turn en die river. Wanneer dit jou beurt is, gaan die aksiebalk aan en bied net aan wat toegelaat word: Fold, Check of Call, Raise of All-In. Die bedrag kan getik word, op die skuifbalk gesleep word, of met een tik op Min, die helfte van die pot, die pot of jou hele stapel gestel word."],
      ["Lees die tafel",
       "Jou beste hand op daardie oomblik word onder die tafel benoem soos die kaarte kom. Die pot, elke stapel en die blindevlak is heeltyd op die skerm, die delerknoppie wys wie laaste handel, en ’n aftelling wys hoeveel tyd jy het. By die showdown word die vyf kaarte uitgelig wat elke hand gevorm het."],
      ["Wen die toernooi",
       "Spele in PokerTH is sit-and-go-toernooie: almal begin met dieselfde stapel, die blindes styg op die klok, en spelers val uit totdat een al die fiches het. Niks kos geld nie en fiches kan nie gekoop word nie — dis alles speelgeld, dus die enigste ding op die spel is die spel self."]
    ],
    phoneH2: "Speel op ’n foon",
    phoneP: "Die tafel is net so goed vir ’n raakskerm gebou as vir ’n rekenaar: as jy op die wedveld tik, open ’n syferbord binne die aksiebalk in plaas van die stelselsleutelbord, sodat die tafel nooit rondspring nie, en die skuifbalk beweeg in dieselfde stappe as die werkskermkliënt. Kennisgewings dat dit jou beurt is, kan met Fold- en Check/Call-knoppies daarop kom, sodat ’n hand gespeel kan word sonder om terug te skakel na die oortjie.",
    friendsH2: "Speel saam met vriende",
    friendsP: "Skep ’n tafel, sit ’n wagwoord op as jy dit privaat wil hê, en stuur die uitnodigingskakel. Dit open die tafel direk — in die geïnstalleerde toep as hulle dit by hul tuisskerm gevoeg het, anders in ’n blaaieroortjie. Niemand hoef iets te installeer of ’n e-posadres af te staan nie.",
    faqH2: "Algemene vrae",
    faqP: function (h, c) { return "Daar is nooit geld ter sprake nie, in geen modus nie. Jou instellings, stylpakkette en vanlyn vordering bly op jou eie toestel. Die koppelvlak is in 45 tale beskikbaar, terwyl die vyf aksiewoorde — Fold, Check, Call, Raise, All-In — in Engels bly, soos aan enige tafel ter wêreld. Meer by die <a href=\"{faq}\">algemene vrae</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  fil: {
    title: "Paano maglaro ng libreng poker online — PokerTH Web",
    desc: "Hakbang-hakbang: maglaro ng libreng Texas Hold’em poker sa browser mo, walang download at walang account — offline laban sa kompyuter, sa opisyal na pokerth.net, o sa pribadong mesa kasama ang mga kaibigan.",
    ldHeadline: "Paano maglaro ng libreng Texas Hold’em poker sa browser",
    ldDesc: "Gabay hakbang-hakbang sa paglalaro ng libreng Texas Hold’em sa web client ng PokerTH.",
    h1: "Paano maglaro ng libreng poker online, diretso sa browser mo",
    lead: function (h, c) { return "Ito ang maikling bersyon: mula sa blangkong tab hanggang sa unang Texas Hold’em na kamay mo sa PokerTH. Kung ang hinahanap mo ay ang mismong tuntunin — blind, mga ronda ng taya, ano ang tumatalo sa ano — simulan mo muna sa <a href=\"{rules}\">pahina ng tuntunin</a> at sa <a href=\"{hands}\">ranggo ng mga kamay</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Buksan ang site — walang kailangang i-install",
       "Tumatakbo ang PokerTH sa loob ng browser. Walang download, walang account, walang plugin. Sa telepono, maidaragdag mo ito sa home screen mula sa menu ng browser; bubukas ito na parang app, buong screen, at gumagana kahit walang koneksyon."],
      ["Piliin kung saan mo gustong maglaro",
       "Tatlong paraan. Ang <strong>offline na pagsasanay</strong> ay agad kang pinauupo sa mesang may mga kalaban ng kompyuter at hindi na kailangan ng koneksyon — dito natututo. Ang <strong>pokerth.net</strong> ang opisyal na network: tunay na kalaban, ranggo kada season, at libreng palayaw na minsan lang irerehistro. Ang <strong>LAN / pribadong server</strong> ay kumokonekta sa isang nakalaang PokerTH server, sa iyo o sa iba."],
      ["Umupo sa isang mesa",
       "Sa lobby, sasali ka sa mesa mula sa listahan o gagawa ng sarili mo. Sa paggawa, itinatakda mo ang bilang ng upuan, panimulang chips, kung gaano kabilis tumaas ang blind, at kung may password ang mesa. Ibahagi ang link ng imbitasyon at diretso sa mesa mo darating ang kaibigan mo, sa sarili niyang browser, nang walang irerehistro."],
      ["Laruin ang kamay",
       "Bibigyan ka ng dalawang saradong baraha. Umiikot ang taya sa mesa bago ang flop, at muli pagkatapos ng flop, turn at river. Pagdating ng turno mo, magliliwanag ang action bar at ipapakita lang ang pinapayagan: Fold, Check o Call, Raise o All-In. Ang halaga ay puwedeng i-type, i-drag sa slider, o itakda sa isang pindot sa Min, kalahati ng pot, buong pot, o lahat ng chips mo."],
      ["Basahin ang mesa",
       "Habang lumalabas ang mga baraha, nakasulat sa ilalim ng mesa ang pinakamalakas mong kamay sa sandaling iyon. Nasa screen palagi ang pot, ang chips ng bawat isa, at ang antas ng blind; ipinapakita ng dealer button kung sino ang huling magsasalita, at ang countdown kung gaano ka pa katagal. Sa showdown, itinatampok ang limang barahang bumuo ng bawat kamay."],
      ["Panalunin ang torneo",
       "Ang mga laro sa PokerTH ay sit-and-go na torneo: pare-pareho ang panimulang chips ng lahat, tumataas ang blind ayon sa oras, at unti-unting natatanggal ang mga manlalaro hanggang isa na lang ang may hawak ng lahat. Walang binabayaran at hindi mabibili ang chips — pawang pantaya-taya lang ang lahat, kaya ang laro mismo lang ang nakataya."]
    ],
    phoneH2: "Paglalaro sa telepono",
    phoneP: "Ginawa ang mesa para sa touch screen nang kasinghusay ng para sa desktop: kapag pinindot ang kahon ng taya, isang number pad ang bubukas sa loob mismo ng action bar sa halip na ang keyboard ng sistema, kaya hindi kailanman lumulundag ang mesa, at ang slider ay gumagalaw sa parehong hakbang tulad ng desktop client. Ang abiso ng turno ay puwedeng may kasamang Fold at Check/Call na pindutan, kaya matatapos ang isang kamay nang hindi na bumabalik sa tab.",
    friendsH2: "Paglalaro kasama ang mga kaibigan",
    friendsP: "Gumawa ng mesa, lagyan ng password kung gusto mong pribado, at ipadala ang link ng imbitasyon. Diretsong bubuksan nito ang mesa — sa naka-install na app kung naidagdag na nila ito sa home screen, o sa isang tab ng browser kung hindi. Walang kailangang mag-install ng kahit ano o magbigay ng email.",
    faqH2: "Karaniwang tanong",
    faqP: function (h, c) { return "Walang perang kasangkot, sa alinmang mode. Nananatili sa sarili mong device ang mga setting, style pack at offline na progreso mo. Available ang interface sa 45 wika, samantalang ang limang salitang aksyon — Fold, Check, Call, Raise, All-In — ay nananatiling Ingles, gaya sa anumang mesa sa mundo. Higit pa sa <a href=\"{faq}\">karaniwang tanong</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  sw: {
    title: "Jinsi ya kucheza poka mtandaoni bila malipo — PokerTH Web",
    desc: "Hatua kwa hatua: cheza poka ya Texas Hold’em bila malipo kwenye kivinjari chako, bila kupakua na bila akaunti — nje ya mtandao dhidi ya kompyuta, kwenye mtandao rasmi wa pokerth.net, au kwenye meza ya faragha na marafiki.",
    ldHeadline: "Jinsi ya kucheza poka ya Texas Hold’em bila malipo kwenye kivinjari",
    ldDesc: "Mwongozo wa hatua kwa hatua wa kucheza Texas Hold’em bila malipo kwenye programu ya wavuti ya PokerTH.",
    h1: "Jinsi ya kucheza poka mtandaoni bila malipo, moja kwa moja kwenye kivinjari",
    lead: function (h, c) { return "Hii ndiyo toleo fupi: kutoka kichupo kitupu hadi mkono wako wa kwanza wa Texas Hold’em katika PokerTH. Kama unachotafuta ni kanuni zenyewe — dau la kulazimishwa, raundi za kuweka dau, mkono upi unashinda upi — anza na <a href=\"{rules}\">ukurasa wa kanuni</a> na <a href=\"{hands}\">mpangilio wa mikono</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Fungua tovuti — hakuna cha kusakinisha",
       "PokerTH hufanya kazi ndani ya kivinjari. Hakuna kupakua, hakuna akaunti, hakuna programu-jalizi. Kwenye simu unaweza kuiongeza kwenye skrini ya kwanza kupitia menyu ya kivinjari; kisha hufunguka kama programu, skrini nzima, na hufanya kazi hata bila mtandao."],
      ["Chagua unapotaka kucheza",
       "Njia tatu. <strong>Mazoezi nje ya mtandao</strong> hukuketisha mara moja kwenye meza ya wapinzani wa kompyuta na haihitaji muunganisho hata kidogo — hapa ndipo mtu hujifunza. <strong>pokerth.net</strong> ni mtandao rasmi: wapinzani halisi, viwango vya msimu, na jina la utani bila malipo unalosajili mara moja tu. <strong>LAN / seva binafsi</strong> hukuunganisha na seva maalum ya PokerTH, yako mwenyewe au ya mtu mwingine."],
      ["Keti kwenye meza",
       "Katika ukumbi unaweza kujiunga na meza kutoka orodha au kutengeneza yako. Unapotengeneza, unaweka idadi ya viti, chipu za kuanzia, kasi ya kupanda kwa dau la kulazimishwa, na kama meza itakuwa na nenosiri. Shiriki kiungo cha mwaliko, na rafiki yako atatua moja kwa moja kwenye meza yako, kwenye kivinjari chake, bila kusajili chochote."],
      ["Cheza mkono",
       "Unagawiwa karata mbili za siri. Kuweka dau huzunguka meza kabla ya flop, na tena baada ya flop, turn na river. Zamu yako ikifika, upau wa vitendo huwaka na hutoa tu kile kinachoruhusiwa: Fold, Check au Call, Raise au All-In. Kiasi kinaweza kuandikwa, kuvutwa kwenye kitelezi, au kuwekwa kwa mguso mmoja kuwa Min, nusu ya pot, pot nzima, au chipu zako zote."],
      ["Soma meza",
       "Karata zinapotolewa, mkono wako bora kwa wakati huo huandikwa chini ya meza. Pot, chipu za kila mtu na kiwango cha dau la kulazimishwa vipo skrini muda wote, kitufe cha mgawaji huonyesha nani anazungumza mwisho, na kihesabu huonyesha muda uliobaki. Wakati wa kufunua karata, zile karata tano zilizounda kila mkono huangaziwa."],
      ["Shinda mashindano",
       "Michezo ya PokerTH ni mashindano ya sit-and-go: kila mtu huanza na chipu sawa, dau la kulazimishwa hupanda kwa saa, na wachezaji hutolewa hadi mmoja abaki na chipu zote. Hakuna kinachogharimu pesa na chipu haziwezi kununuliwa — zote ni za mchezo tu, kwa hivyo kinachowekwa hatarini ni mchezo wenyewe."]
    ],
    phoneH2: "Kucheza kwa simu",
    phoneP: "Meza imejengwa kwa skrini ya kugusa kama vile ilivyojengwa kwa kompyuta: kugusa kisanduku cha dau hufungua kibodi ya namba ndani ya upau wa vitendo badala ya kibodi ya mfumo, hivyo meza haizungukizunguki kamwe, na kitelezi husogea kwa hatua zile zile za programu ya kompyuta. Arifa za zamu zinaweza kufika zikiwa na vitufe vya Fold na Check/Call juu yake, hivyo mkono unaweza kuchezwa bila kurudi kwenye kichupo.",
    friendsH2: "Kucheza na marafiki",
    friendsP: "Tengeneza meza, weka nenosiri kama unataka iwe ya faragha, kisha tuma kiungo cha mwaliko. Kiungo hufungua meza moja kwa moja — kwenye programu iliyosakinishwa kama waliiongeza kwenye skrini ya kwanza, vinginevyo kwenye kichupo cha kivinjari. Hakuna anayelazimika kusakinisha chochote wala kutoa anwani ya barua pepe.",
    faqH2: "Maswali ya kawaida",
    faqP: function (h, c) { return "Hakuna pesa halisi zinazohusika, katika hali yoyote ile. Mipangilio yako, vifurushi vya mtindo na maendeleo yako ya nje ya mtandao hubaki kwenye kifaa chako mwenyewe. Kiolesura kinapatikana katika lugha 45, huku maneno matano ya vitendo — Fold, Check, Call, Raise, All-In — yakibaki Kiingereza, kama ilivyo kwenye kila meza duniani. Zaidi katika <a href=\"{faq}\">maswali ya kawaida</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  gd: {
    title: "Mar a chluicheas tu pòcair air-loidhne an-asgaidh — PokerTH Web",
    desc: "Ceum air cheum: cluich pòcair Texas Hold’em an-asgaidh sa bhrabhsair agad, gun luchdachadh a-nuas is gun chunntas — far-loidhne an aghaidh a’ choimpiutair, air lìonra oifigeil pokerth.net, no aig bòrd prìobhaideach còmhla ri caraidean.",
    ldHeadline: "Mar a chluicheas tu pòcair Texas Hold’em an-asgaidh sa bhrabhsair",
    ldDesc: "Iùl ceum air cheum gus Texas Hold’em a chluich an-asgaidh ann an cliant-lìn PokerTH.",
    h1: "Mar a chluicheas tu pòcair air-loidhne an-asgaidh, sa bhrabhsair agad fhèin",
    lead: function (h, c) { return "Seo an dreach goirid: o thaba bhàn gun chiad làmh Texas Hold’em agad ann am PokerTH. Mas e na riaghailtean fhèin a tha thu ag iarraidh — na dallabhan, na cuairtean geallaidh, dè bhuannaicheas air dè — tòisich an àite sin air <a href=\"{rules}\">duilleag nan riaghailtean</a> agus air <a href=\"{hands}\">rangachadh nan làmhan</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["Fosgail an làrach — chan eil dad ri stàladh",
       "Ruithidh PokerTH sa bhrabhsair. Gun luchdachadh a-nuas, gun chunntas, gun phlugan. Air fòn, ’s urrainn dhut a chur ris an sgrion-dachaigh o chlàr-taice a’ bhrabhsair; fosglaidh e an uair sin mar aplacaid, làn-sgrion, agus obraichidh e far-loidhne cuideachd."],
      ["Tagh càite a bheil thu airson cluich",
       "Trì dòighean. Cuiridh <strong>trèanadh far-loidhne</strong> nad shuidhe sa bhad aig bòrd le co-fharpaisich coimpiutair agus chan fheum e ceangal idir — ’s ann an seo a dh’ionnsaicheas tu. ’S e <strong>pokerth.net</strong> an lìonra oifigeil: co-fharpaisich fhìor, rangachaidhean ràitheil, agus far-ainm an-asgaidh a chlàraicheas tu aon turas. Ceanglaidh <strong>LAN / frithealaiche prìobhaideach</strong> ri frithealaiche PokerTH sònraichte, agad fhèin no aig cuideigin eile."],
      ["Suidh aig bòrd",
       "Anns an lobaidh, no thèid thu a-steach do bhòrd on liosta no cruthaichidh tu fear agad fhèin. Nuair a chruthaicheas tu fear, suidhichidh tu an àireamh de shuidheachain, an stoc tòiseachaidh, cho luath ’s a dh’èireas na dallabhan, agus a bheil facal-faire air a’ bhòrd. Roinn an ceangal cuiridh, agus thig caraid dìreach gun bhòrd agad, na bhrabhsair fhèin, gun dad a chlàradh."],
      ["Cluich an làmh",
       "Gheibh thu dà chairt dhùinte. Thèid geall a chur mun cuairt a’ bhùird ron fhlop, agus a-rithist às dèidh an fhlop, an turn agus an river. Nuair a thig do chuairt, lasaidh am bàr gnìomhan agus cha nochd ach na tha ceadaichte: Fold, Check no Call, Raise no All-In. Gabhaidh an t-suim a sgrìobhadh, a shlaodadh air an t-sleamhnachan, no a shuidheachadh le aon bhuille air Min, leth a’ phota, am pota, no an stoc agad gu lèir."],
      ["Leugh am bòrd",
       "Mar a thig na cairtean a-mach, thèid an làmh as fheàrr a th’ agad an-dràsta ainmeachadh fon bhòrd. Tha am pota, gach stoc agus ìre nan dallabhan air an sgrion fad na h-ùine, seallaidh putan an neach-riarachaidh cò bhruidhneas mu dheireadh, agus innsidh an cunntas-sìos dè an ùine a th’ agad. Aig an showdown thèid na còig cairtean a rinn gach làmh a chomharrachadh."],
      ["Buannaich am farpais",
       "’S e farpaisean sit-and-go a th’ anns na geamannan ann am PokerTH: tòisichidh a h-uile duine leis an aon stoc, èiridh na dallabhan a rèir a’ ghleoc, agus thèid cluicheadairean a-mach gus am bi na sliseagan uile aig aon neach. Cha chosg dad airgead agus chan urrainn sliseagan a cheannach — ’s e airgead cluiche a th’ anns a h-uile gin, agus mar sin chan eil ach an geama fhèin an geall."]
    ],
    phoneH2: "A’ cluich air fòn",
    phoneP: "Tha am bòrd air a thogail airson sgrion-suathaidh a cheart cho math ri coimpiutair: nuair a bhuaileas tu air raon a’ gheallaidh, fosglaidh meur-chlàr àireamhan am broinn a’ bhàr gnìomhan an àite meur-chlàr an t-siostaim, mar sin cha leum am bòrd a-riamh, agus gluaisidh an sleamhnachan leis na h-aon cheumannan ris a’ chliant deasg. Faodaidh brathan mun chuairt agad tighinn le putanan Fold agus Check/Call orra, agus mar sin gabhaidh làmh a chluich gun tilleadh dhan taba.",
    friendsH2: "A’ cluich còmhla ri caraidean",
    friendsP: "Cruthaich bòrd, cuir facal-faire air ma tha thu airson gum bi e prìobhaideach, agus cuir an ceangal cuiridh. Fosglaidh e am bòrd gu dìreach — anns an aplacaid stàlaichte ma chuir iad ris an sgrion-dachaigh i, air neo ann an taba brabhsair. Chan fheum duine dad a stàladh no seòladh puist-d a thoirt seachad.",
    faqH2: "Ceistean cumanta",
    faqP: function (h, c) { return "Chan eil airgead an sàs ann idir, ann am modh sam bith. Fanaidh na roghainnean agad, na pasganan stoidhle agus an adhartas far-loidhne air an uidheam agad fhèin. Tha an eadar-aghaidh ri fhaighinn ann an 45 cànan, fhad ’s a dh’fhanas na còig faclan gnìomh — Fold, Check, Call, Raise, All-In — sa Bheurla, mar a tha aig gach bòrd air an t-saoghal. Barrachd anns na <a href=\"{faq}\">ceistean cumanta</a>.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  },

  ta: {
    title: "இணையத்தில் இலவசமாக போக்கர் விளையாடுவது எப்படி — PokerTH வலை",
    desc: "படிப்படியாக: பதிவிறக்கம் இல்லாமல், கணக்கு இல்லாமல் உங்கள் உலாவியிலேயே இலவசமாக டெக்சாஸ் ஹோல்டெம் போக்கர் விளையாடுங்கள் — இணையம் இல்லாமல் கணினிக்கு எதிராக, அதிகாரப்பூர்வ pokerth.net வலையமைப்பில், அல்லது நண்பர்களுடன் தனி மேசையில்.",
    ldHeadline: "உலாவியில் இலவசமாக டெக்சாஸ் ஹோல்டெம் போக்கர் விளையாடுவது எப்படி",
    ldDesc: "PokerTH வலை செயலியில் இலவசமாக டெக்சாஸ் ஹோல்டெம் விளையாடுவதற்கான படிப்படியான வழிகாட்டி.",
    h1: "உங்கள் உலாவியிலேயே இலவசமாக இணையப் போக்கர் விளையாடுவது எப்படி",
    lead: function (h, c) { return "இது சுருக்கமான வழி: வெறும் தாவலிலிருந்து PokerTH-இல் உங்கள் முதல் டெக்சாஸ் ஹோல்டெம் கை வரை. நீங்கள் தேடுவது விதிகளையே என்றால் — கட்டாயப் பணயம், பந்தய சுற்றுகள், எது எதை வெல்லும் — முதலில் <a href=\"{rules}\">விதிகள் பக்கத்தையும</a> <a href=\"{hands}\">சீட்டுக் கோர்வைகளையும்</a> பாருங்கள்.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); },
    steps: [
      ["தளத்தைத் திறங்கள் — நிறுவ எதுவும் இல்லை",
       "PokerTH உலாவியிலேயே இயங்குகிறது. பதிவிறக்கம் இல்லை, கணக்கு இல்லை, செருகுநிரல் இல்லை. கைபேசியில் உலாவி பட்டியலிலிருந்து இதை முகப்புத் திரையில் சேர்க்கலாம்; பிறகு இது ஒரு செயலி போலவே முழுத் திரையில் திறக்கும், இணையம் இல்லாமலும் இயங்கும்."],
      ["எங்கே விளையாட விரும்புகிறீர்கள் என்பதைத் தேர்வுசெய்யுங்கள்",
       "மூன்று வழிகள். <strong>இணையம் இல்லாத பயிற்சி</strong> உடனடியாக கணினி எதிராளிகள் அமர்ந்த மேசையில் உங்களை அமர்த்தும், இணைப்பே தேவையில்லை — கற்றுக்கொள்ள இதுவே சரியான இடம். <strong>pokerth.net</strong> அதிகாரப்பூர்வ வலையமைப்பு: உண்மையான எதிராளிகள், பருவகால தரவரிசைகள், ஒருமுறை மட்டும் பதிவுசெய்யும் இலவச புனைபெயர். <strong>LAN / தனிப்பட்ட சேவையகம்</strong> உங்களுடையதோ பிறருடையதோ ஆன ஒரு PokerTH சேவையகத்துடன் இணைக்கும்."],
      ["ஒரு மேசையில் அமருங்கள்",
       "நுழைவறையில் பட்டியலிலிருந்து ஒரு மேசையில் சேரலாம், அல்லது உங்கள் சொந்த மேசையை உருவாக்கலாம். உருவாக்கும்போது இருக்கைகளின் எண்ணிக்கை, தொடக்கக் காசுகள், கட்டாயப் பணயம் எவ்வளவு வேகமாக உயரும், மேசைக்குக் கடவுச்சொல் வேண்டுமா என்பதை நீங்களே அமைக்கிறீர்கள். அழைப்பு இணைப்பைப் பகிர்ந்தால், நண்பர் எதையும் பதிவுசெய்யாமல், தன் உலாவியிலேயே நேராக உங்கள் மேசைக்கு வந்துவிடுவார்."],
      ["கையை விளையாடுங்கள்",
       "உங்களுக்கு இரண்டு மறைமுக சீட்டுகள் வழங்கப்படும். ஃப்ளாப்புக்கு முன் பந்தயம் மேசையைச் சுற்றி வரும், பிறகு ஃப்ளாப், டர்ன், ரிவர் ஒவ்வொன்றுக்குப் பிறகும் மீண்டும். உங்கள் முறை வரும்போது செயல் பட்டை ஒளிரும், அனுமதிக்கப்பட்டவற்றை மட்டுமே காட்டும்: Fold, Check அல்லது Call, Raise அல்லது All-In. தொகையைத் தட்டச்சு செய்யலாம், நழுவியில் இழுக்கலாம், அல்லது ஒரே தொடுதலில் குறைந்தபட்சம், பானையில் பாதி, முழுப் பானை, அல்லது உங்கள் அனைத்துக் காசுகள் என அமைக்கலாம்."],
      ["மேசையைப் படியுங்கள்",
       "சீட்டுகள் திறக்கத் திறக்க, அந்நேரத்தில் உங்கள் சிறந்த கோர்வையின் பெயர் மேசைக்குக் கீழே எழுதப்படும். பானை, ஒவ்வொருவரின் காசுகள், கட்டாயப் பணய நிலை ஆகியவை எப்போதும் திரையில் இருக்கும்; வழங்குநர் பொத்தான் கடைசியாகப் பேசுபவர் யார் என்பதைக் காட்டும், எண்ணிக்கை உங்களுக்கு எவ்வளவு நேரம் உள்ளது என்பதைக் காட்டும். சீட்டு திறக்கும்போது ஒவ்வொரு கையையும் உருவாக்கிய ஐந்து சீட்டுகள் தனித்துக் காட்டப்படும்."],
      ["போட்டியை வெல்லுங்கள்",
       "PokerTH ஆட்டங்கள் sit-and-go வகைப் போட்டிகள்: அனைவரும் ஒரே அளவு காசுகளுடன் தொடங்குகிறார்கள், கட்டாயப் பணயம் நேரத்துக்கேற்ப உயரும், ஒருவரிடம் அனைத்துக் காசுகளும் சேரும் வரை ஆட்டக்காரர்கள் வெளியேறுவார்கள். எதற்கும் பணம் தேவையில்லை, காசுகளை வாங்கவும் முடியாது — அனைத்தும் விளையாட்டுக் காசுகளே, எனவே பணயத்தில் இருப்பது ஆட்டம் மட்டுமே."]
    ],
    phoneH2: "கைபேசியில் விளையாடுவது",
    phoneP: "மேசை கணினிக்குப் போலவே தொடுதிரைக்கும் வடிவமைக்கப்பட்டுள்ளது: பந்தயப் புலத்தைத் தொட்டால் அமைப்பின் விசைப்பலகைக்குப் பதிலாக செயல் பட்டைக்குள்ளேயே எண் பலகை திறக்கும், எனவே மேசை ஒருபோதும் குதிக்காது; நழுவியும் கணினிச் செயலியின் அதே படிகளில் நகரும். உங்கள் முறை குறித்த அறிவிப்புகளில் Fold மற்றும் Check/Call பொத்தான்களே இருக்கலாம், எனவே தாவலுக்குத் திரும்பாமலேயே ஒரு கையை விளையாடி முடிக்கலாம்.",
    friendsH2: "நண்பர்களுடன் விளையாடுவது",
    friendsP: "ஒரு மேசையை உருவாக்குங்கள், தனிப்பட்டதாக வேண்டுமெனில் கடவுச்சொல் இடுங்கள், அழைப்பு இணைப்பை அனுப்புங்கள். அந்த இணைப்பு மேசையை நேரடியாகத் திறக்கும் — முகப்புத் திரையில் செயலியைச் சேர்த்திருந்தால் நிறுவப்பட்ட செயலியில், இல்லையெனில் உலாவித் தாவலில். யாரும் எதையும் நிறுவவோ மின்னஞ்சல் முகவரி தரவோ தேவையில்லை.",
    faqH2: "அடிக்கடி கேட்கப்படுபவை",
    faqP: function (h, c) { return "எந்த முறையிலும் பணம் சம்பந்தப்படுவதில்லை. உங்கள் அமைப்புகள், தோற்றத் தொகுப்புகள், இணையமில்லா முன்னேற்றம் அனைத்தும் உங்கள் சாதனத்திலேயே இருக்கும். இடைமுகம் 45 மொழிகளில் கிடைக்கிறது; ஐந்து செயல் சொற்கள் — Fold, Check, Call, Raise, All-In — உலகின் எந்த மேசையிலும் போலவே ஆங்கிலத்திலேயே இருக்கும். மேலும் <a href=\"{faq}\">அடிக்கடி கேட்கப்படுபவை</a> பக்கத்தில்.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)).replace('{faq}', h('faq', c)); }
  }

};

// Assemble one page body per language, once, at load. `steps` is the
// language-neutral _SEO_HOWTO array — only its length is used, since each
// language supplies its own step text — and `href(page, lang)` resolves an
// internal link to the right language variant.
function build(steps, href) {
  var out = {};
  for (var code in PARTS) {
    var p = PARTS[code], body = '<h1>' + p.h1 + '</h1><p>' + p.lead(href, code) + '</p>', i;
    for (i = 0; i < steps.length; i++) {
      body += '<h2>' + (i + 1) + '. ' + p.steps[i][0] + '</h2><p>' + p.steps[i][1] + '</p>';
    }
    body += '<h2>' + p.phoneH2 + '</h2><p>' + p.phoneP + '</p>' +
      '<h2>' + p.friendsH2 + '</h2><p>' + p.friendsP + '</p>' +
      '<h2>' + p.faqH2 + '</h2><p>' + p.faqP(href, code) + '</p>';
    out[code] = {
      title: p.title, desc: p.desc, ldHeadline: p.ldHeadline, ldDesc: p.ldDesc, body: body
    };
  }
  return out;
}

module.exports = { PARTS: PARTS, build: build };
