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
