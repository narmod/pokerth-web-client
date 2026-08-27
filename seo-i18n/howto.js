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
