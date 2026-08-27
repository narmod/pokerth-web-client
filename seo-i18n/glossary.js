'use strict';
// Translations for the /glossary page. Same policy and same reason for living
// outside proxy.js as seo-i18n/hands.js — see the header there.
//
// English is not in this file. It lives in seoGlossaryPage() in proxy.js and
// is the fallback for every language still missing below.
//
// Shape per language:
//   title, desc            <title> and <meta name="description">
//   ldHeadline, ldDesc     JSON-LD DefinedTermSet name and description
//   h1                     page heading
//   lead                   opening paragraph
//   terms[]                one entry per term in _SEO_GLOSSARY, same order:
//                            [localEquivalent | null, definition]
//   footer(href)           closing line; receives the link resolver so the
//                          pointers to the rules and the hand rankings stay in
//                          the reader's language
//
// The headword is not translated away. What a player meets in the chat and on
// the action bar is the English term, so that is what the entry is keyed on;
// the local equivalent follows in parentheses where the language actually has
// one, which is also what someone searching in their own language types. Pass
// null when there is no established local word — inventing one would send the
// reader looking for something nobody says.
//
// The JSON-LD DefinedTermSet in proxy.js is built from _SEO_GLOSSARY and stays
// English: it describes the term set itself, while the visible page is what
// the reader gets.

var PARTS = {

  fr: {
    title: "Glossaire du poker — les termes du Texas Hold’em — PokerTH",
    desc: "Ce que veulent dire les termes du poker, de all-in à wheel : blindes, kicker, outs, cotes du pot, set et trips, pots annexes et abattage, expliqués simplement.",
    ldHeadline: "Glossaire du poker — les termes du Texas Hold’em expliqués",
    ldDesc: "Un glossaire des termes du poker Texas Hold’em, de all-in à wheel.",
    h1: "Glossaire du poker — les termes du Texas Hold’em",
    lead: "Les mots que vous croiserez à une table de Hold’em, dans le chat et dans PokerTH lui-même. Les cinq mots d’action — Fold, Check, Call, Raise et All-In — restent en anglais dans chacune des 45 langues d’interface, parce qu’il en va ainsi à toutes les tables du monde.",
    terms: [
      ["tapis", "Miser tous ses jetons. Vous ne pouvez gagner que la part du pot que vous avez payée ; le reste part dans un pot annexe."],
      ["ante", "Petite mise forcée versée par chaque joueur avant la donne, en plus des blindes. Utilisée aux niveaux avancés de certains tournois."],
      [null, "Un tirage qui a besoin à la fois de la turn et de la river pour se compléter, par exemple deux cœurs de plus pour une couleur."],
      ["mauvaise battue", "Perdre une main que vous étiez largement favori à gagner."],
      ["grosse blinde", "La plus grande des deux mises forcées, versée deux sièges à gauche du bouton. En tournoi, les tapis se comptent généralement en grosses blindes."],
      ["blindes", "Les deux mises forcées qui lancent chaque main et donnent aux joueurs quelque chose à se disputer. Dans PokerTH, elles montent à intervalles réguliers."],
      ["tableau", "Les cinq cartes communes, partagées par tout le monde."],
      ["bulle", "Le moment d’un tournoi juste avant que ne commencent les places payées ou classées."],
      ["bouton", "Le jeton qui marque le donneur nominal. Le joueur au bouton parle en dernier après le flop, ce qui en fait la meilleure position à la table."],
      ["suivre", "Égaler la mise en cours, sans plus."],
      ["parole", "Passer la parole sans miser. Possible seulement si personne n’a misé dans le tour en cours."],
      ["check-relance", "Checker, puis relancer après la mise d’un autre. Une façon de construire le pot avec une main forte."],
      ["cartes communes", "Les cinq cartes face visible que tous les joueurs peuvent utiliser, distribuées en flop, turn et river."],
      ["connecteurs", "Deux cartes privées de rangs consécutifs, par exemple 8-9. Les connecteurs assortis partagent en plus la même couleur."],
      ["tirage", "Une main incomplète à qui il manque une ou plusieurs cartes pour devenir forte — quatre cartes vers une couleur, quatre vers une quinte."],
      [null, "Avoir un tirage qui ne peut pas gagner, même s’il se complète."],
      ["équité", "Votre part du pot compte tenu des cartes à venir — en pratique, la fréquence à laquelle vous gagnez à partir d’ici."],
      ["flop", "Les trois premières cartes communes, distribuées d’un coup."],
      ["se coucher", "Abandonner la main, et avec elle tous les jetons déjà misés."],
      [null, "Un tournoi dont l’entrée est gratuite. Dans PokerTH, toutes les tables le sont, puisqu’il n’y a d’argent nulle part."],
      ["tête-à-tête", "Une main, ou une phase de tournoi, où il ne reste que deux joueurs."],
      ["cartes privées", "Vos deux cartes fermées."],
      [null, "La plus haute carte restante en dehors de la combinaison elle-même, qui départage deux mains de même rang."],
      ["suivre passivement", "Entrer dans le coup avant le flop en se contentant de suivre la grosse blinde plutôt que de relancer."],
      ["jeter", "Se défausser d’une main face cachée à l’abattage plutôt que de la montrer."],
      ["la meilleure main", "La meilleure main possible compte tenu du tableau. Elle ne peut pas être battue, seulement égalée."],
      ["dépareillées", "Deux cartes privées de couleurs différentes."],
      ["cartes gagnantes", "Les cartes encore dans le paquet qui vous donneraient la main gagnante. Il reste neuf outs pour une couleur à quatre cartes."],
      ["grosse paire", "Une paire servie plus haute que n’importe quelle carte du tableau."],
      ["paire servie", "Deux cartes privées de même rang."],
      ["pot", "Les jetons en jeu dans la main en cours."],
      ["cotes du pot", "Le prix que vous propose le pot : ce que vous devez payer, face à ce que vous pouvez gagner."],
      ["préflop", "Le premier tour d’enchères, avant qu’aucune carte commune ne soit distribuée."],
      ["arc-en-ciel", "Un flop de trois couleurs différentes, qui rend impossible tout tirage couleur immédiat."],
      ["relancer", "Augmenter la mise en cours. En No-Limit, de n’importe quel montant jusqu’à votre tapis entier."],
      ["sur-relance", "Relancer une relance."],
      ["river", "La cinquième et dernière carte commune, ainsi que le tour d’enchères qui la suit."],
      [null, "Un brelan formé d’une paire servie plus une carte assortie au tableau — bien caché, contrairement aux trips."],
      ["tapis court", "Un tapis faible par rapport aux blindes, qui ne laisse guère d’autre choix que se coucher ou faire tapis."],
      ["abattage", "Dévoiler les mains restantes après le dernier tour d’enchères pour désigner le gagnant."],
      ["pot annexe", "Un pot distinct créé lorsqu’un joueur est à tapis et que les autres continuent à miser au-delà de ce montant."],
      [null, "Un tournoi qui démarre dès que les sièges sont pleins, plutôt qu’à heure fixe. Toutes les parties PokerTH en sont."],
      ["jouer lentement", "Jouer faiblement une main forte pour garder les adversaires dans le coup."],
      ["petite blinde", "La plus petite des mises forcées, versée immédiatement à gauche du bouton."],
      ["pot partagé", "Un pot partagé entre des mains de force égale. Au Hold’em, les couleurs ne départagent jamais."],
      ["tapis", "Les jetons qu’un joueur a devant lui."],
      ["sur-blinde", "Une relance à l’aveugle, facultative, versée avant la donne. Non utilisée dans PokerTH."],
      ["assorties", "Deux cartes privées de la même couleur."],
      [null, "Jouer mal sous l’effet de la frustration, souvent après une mauvaise battue."],
      [null, "Un brelan formé d’une seule carte privée et d’une paire au tableau. Tout le monde en voit deux cartes sur trois."],
      ["turn", "La quatrième carte commune, ainsi que le tour d’enchères qui la suit."],
      ["sous le canon", "Le siège qui parle en premier avant le flop, juste à gauche de la grosse blinde."],
      ["mise de valeur", "Une mise faite pour être suivie par une main plus faible, et non pour faire coucher qui que ce soit."],
      ["la roue", "La quinte A-2-3-4-5, où l’as joue en bas. La plus faible des quintes."]
    ],
    footer: function (h, c) { return "Vous n’êtes toujours pas au clair sur le déroulement d’une main ? Les <a href=\"{rules}\">règles</a> la suivent des blindes jusqu’à l’abattage, et les <a href=\"{hands}\">combinaisons</a> disent ce qui bat quoi.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)); }
  },

  de: {
    title: "Poker-Glossar — Texas-Hold’em-Begriffe — PokerTH",
    desc: "Was die Pokerbegriffe bedeuten, von All-In bis Wheel: Blinds, Kicker, Outs, Pot Odds, Set und Trips, Side Pots und Showdown, in klarer Sprache erklärt.",
    ldHeadline: "Poker-Glossar — Texas-Hold’em-Begriffe erklärt",
    ldDesc: "Ein Glossar der Texas-Hold’em-Pokerbegriffe, von All-In bis Wheel.",
    h1: "Poker-Glossar — Texas-Hold’em-Begriffe",
    lead: "Die Wörter, die Ihnen an einem Hold’em-Tisch begegnen, im Chat und in PokerTH selbst. Die fünf Aktionswörter — Fold, Check, Call, Raise und All-In — bleiben in allen 45 Oberflächensprachen auf Englisch, weil sie das an jedem Tisch der Welt tun.",
    terms: [
      ["alles setzen", "Alle eigenen Chips setzen. Gewinnen können Sie nur den Teil des Pots, in den Sie eingezahlt haben; der Rest geht in einen Side Pot."],
      ["Ante", "Ein kleiner Zwangseinsatz, den jeder Spieler vor dem Geben zusätzlich zu den Blinds zahlt. Wird in späteren Turnierstufen verwendet."],
      [null, "Ein Draw, der sowohl Turn als auch River braucht, etwa zwei weitere Herz für einen Flush."],
      [null, "Eine Hand verlieren, als deren klarer Favorit man galt."],
      ["Big Blind", "Der größere der beiden Zwangseinsätze, zwei Plätze links vom Button. Turnierstacks werden meist in Big Blinds gezählt."],
      ["Blinds", "Die beiden Zwangseinsätze, die jede Hand eröffnen und den Spielern etwas geben, worum sie kämpfen. In PokerTH steigen sie nach Uhr."],
      ["Board", "Die fünf Gemeinschaftskarten, die allen gehören."],
      ["Bubble", "Der Punkt kurz vor Beginn der bezahlten oder gewerteten Plätze eines Turniers."],
      ["Button", "Die Scheibe, die den nominellen Geber markiert. Wer auf dem Button sitzt, handelt nach dem Flop zuletzt — der beste Platz am Tisch."],
      ["mitgehen", "Den aktuellen Einsatz mitgehen, nicht mehr."],
      ["schieben", "Weitergeben, ohne zu setzen. Nur möglich, wenn in der laufenden Runde noch niemand gesetzt hat."],
      ["Check-Raise", "Erst checken, dann erhöhen, nachdem jemand anderes gesetzt hat. Eine Art, mit einer starken Hand den Pot zu bauen."],
      ["Gemeinschaftskarten", "Die fünf offenen Karten, die jeder benutzen darf, ausgeteilt als Flop, Turn und River."],
      ["Connectors", "Zwei Hole Cards mit aufeinanderfolgendem Rang, etwa 8-9. Suited Connectors teilen zusätzlich die Farbe."],
      ["Draw", "Eine unfertige Hand, der eine oder mehrere Karten zur Stärke fehlen — vier zu einem Flush, vier zu einer Straße."],
      [null, "Einen Draw halten, der selbst dann nicht gewinnen kann, wenn er ankommt."],
      ["Equity", "Ihr Anteil am Pot angesichts der noch kommenden Karten — praktisch: wie oft Sie von hier aus gewinnen."],
      ["Flop", "Die ersten drei Gemeinschaftskarten, auf einmal ausgeteilt."],
      ["aussteigen", "Die Hand aufgeben, und mit ihr jeden bereits gesetzten Chip."],
      ["Freeroll", "Ein Turnier, dessen Teilnahme nichts kostet. In PokerTH ist jeder Tisch eines, denn Geld gibt es nirgends."],
      ["Heads-up", "Eine Hand oder eine Turnierphase, in der nur noch zwei Spieler übrig sind."],
      ["Hole Cards", "Ihre beiden verdeckten Karten."],
      ["Kicker", "Die höchste Karte, die nach der Kombination übrig bleibt; sie entscheidet Gleichstände zwischen Händen desselben Rangs."],
      ["Limp", "Vor dem Flop in den Pot einsteigen, indem man den Big Blind nur mitgeht statt zu erhöhen."],
      ["wegwerfen", "Eine Hand beim Showdown verdeckt abwerfen, statt sie zu zeigen."],
      ["Nuts", "Die bestmögliche Hand für das gegebene Board. Sie kann nicht geschlagen, nur eingeholt werden."],
      ["Offsuit", "Zwei Hole Cards unterschiedlicher Farbe."],
      ["Outs", "Die Karten im Deck, die Ihnen die Gewinnerhand geben würden. Für einen Vierer-Flush bleiben neun Outs."],
      ["Overpair", "Ein Pocket Pair, das höher ist als jede Karte auf dem Board."],
      ["Pocket Pair", "Zwei Hole Cards desselben Rangs."],
      ["Pot", "Die Chips, um die in der laufenden Hand gespielt wird."],
      ["Pot Odds", "Der Preis, den der Pot Ihnen bietet: was Sie zahlen müssen, gegen das, was Sie gewinnen können."],
      ["Preflop", "Die erste Setzrunde, bevor eine Gemeinschaftskarte ausgeteilt ist."],
      ["Rainbow", "Ein Flop aus drei verschiedenen Farben, der einen sofortigen Flush-Draw unmöglich macht."],
      ["erhöhen", "Den aktuellen Einsatz erhöhen. Im No-Limit um jeden Betrag bis zum gesamten Stack."],
      ["Re-Raise", "Eine Erhöhung erhöhen."],
      ["River", "Die fünfte und letzte Gemeinschaftskarte samt der darauf folgenden Setzrunde."],
      ["Set", "Ein Drilling aus einem Pocket Pair plus einer passenden Karte auf dem Board — gut versteckt, anders als Trips."],
      ["Short Stack", "Ein im Verhältnis zu den Blinds kleiner Stack, der kaum mehr zulässt als Fold oder All-In."],
      ["Showdown", "Das Aufdecken der verbliebenen Hände nach der letzten Setzrunde, um den Gewinner zu bestimmen."],
      ["Side Pot", "Ein eigener Pot, der entsteht, wenn ein Spieler all-in ist und die übrigen darüber hinaus weitersetzen."],
      ["Sit and Go", "Ein Turnier, das startet, sobald die Plätze voll sind, statt zu fester Zeit. Jede PokerTH-Partie ist eines."],
      ["Slow Play", "Eine starke Hand schwach spielen, um Gegner im Pot zu halten."],
      ["Small Blind", "Der kleinere Zwangseinsatz, direkt links vom Button."],
      ["Split Pot", "Ein Pot, den gleich starke Hände teilen. Farben brechen im Hold’em nie den Gleichstand."],
      ["Stack", "Die Chips, die ein Spieler vor sich hat."],
      ["Straddle", "Eine freiwillige Blind-Erhöhung vor dem Geben. In PokerTH nicht verwendet."],
      ["Suited", "Zwei Hole Cards derselben Farbe."],
      ["Tilt", "Schlecht spielen aus Frust, meist nach einem Bad Beat."],
      ["Trips", "Ein Drilling aus einer Hole Card und einem Paar auf dem Board. Zwei der drei Karten sehen alle."],
      ["Turn", "Die vierte Gemeinschaftskarte samt der darauf folgenden Setzrunde."],
      ["Under the Gun", "Der Platz, der vor dem Flop zuerst handelt, direkt links vom Big Blind."],
      ["Value Bet", "Ein Einsatz, der von einer schwächeren Hand bezahlt werden soll, statt jemanden zum Folden zu bringen."],
      ["Wheel", "Die Straße A-2-3-4-5, in der das Ass unten spielt. Die schwächste Straße überhaupt."]
    ],
    footer: function (h, c) { return "Noch unklar, wie eine Hand tatsächlich abläuft? Die <a href=\"{rules}\">Regeln</a> begleiten sie von den Blinds bis zum Showdown, und die <a href=\"{hands}\">Pokerblätter</a> sagen, was was schlägt.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)); }
  },

  es: {
    title: "Glosario de póker — términos del Texas Hold’em — PokerTH",
    desc: "Qué significan los términos del póker, de all-in a wheel: ciegas, kicker, outs, pot odds, set y trips, botes secundarios y showdown, explicados en lenguaje claro.",
    ldHeadline: "Glosario de póker — términos del Texas Hold’em explicados",
    ldDesc: "Un glosario de términos del póker Texas Hold’em, de all-in a wheel.",
    h1: "Glosario de póker — términos del Texas Hold’em",
    lead: "Las palabras que te encontrarás en una mesa de Hold’em, en el chat y en el propio PokerTH. Las cinco palabras de acción — Fold, Check, Call, Raise y All-In — se mantienen en inglés en los 45 idiomas de la interfaz, porque así es en todas las mesas del mundo.",
    terms: [
      ["ir con todo", "Apostar todas tus fichas. Solo puedes ganar la parte del bote que hayas pagado; el resto va a un bote secundario."],
      ["ante", "Una pequeña apuesta obligatoria que paga cada jugador antes del reparto, además de las ciegas. Se usa en los niveles altos de algunos torneos."],
      ["proyecto por la puerta de atrás", "Un proyecto que necesita tanto el turn como el river para completarse, por ejemplo dos corazones más para un color."],
      ["mala suerte", "Perder una mano en la que eras claro favorito."],
      ["ciega grande", "La mayor de las dos apuestas obligatorias, puesta dos asientos a la izquierda del botón. En torneo las pilas suelen contarse en ciegas grandes."],
      ["ciegas", "Las dos apuestas obligatorias que abren cada mano y dan a los jugadores algo por lo que pelear. En PokerTH suben por reloj."],
      ["mesa", "Las cinco cartas comunitarias, compartidas por todos."],
      ["burbuja", "El momento de un torneo justo antes de que empiecen los puestos pagados o clasificados."],
      ["botón", "El disco que marca al repartidor nominal. Quien está en el botón habla el último tras el flop, la mejor posición de la mesa."],
      ["igualar", "Igualar la apuesta actual, nada más."],
      ["pasar", "Ceder la acción sin apostar. Solo es posible si nadie ha apostado en la ronda en curso."],
      ["check-subida", "Pasar y luego subir cuando otro apuesta. Una forma de agrandar el bote con una mano fuerte."],
      ["cartas comunitarias", "Las cinco cartas boca arriba que todos pueden usar, repartidas como flop, turn y river."],
      ["conectores", "Dos cartas privadas de valores consecutivos, por ejemplo 8-9. Los conectores del mismo palo comparten además el palo."],
      ["proyecto", "Una mano incompleta a la que le faltan una o más cartas para ser fuerte: cuatro para color, cuatro para escalera."],
      [null, "Tener un proyecto que no puede ganar ni aunque se complete."],
      ["equity", "Tu parte del bote dadas las cartas que faltan por salir: en la práctica, con qué frecuencia ganas desde aquí."],
      ["flop", "Las tres primeras cartas comunitarias, repartidas de golpe."],
      ["retirarse", "Abandonar la mano, y con ella todas las fichas ya apostadas."],
      ["torneo gratuito", "Un torneo cuya entrada no cuesta nada. En PokerTH lo es cada mesa, porque no hay dinero en ninguna parte."],
      ["mano a mano", "Una mano, o una fase de torneo, en la que solo quedan dos jugadores."],
      ["cartas privadas", "Tus dos cartas tapadas."],
      ["carta de desempate", "La carta más alta que sobra tras la jugada; sirve para desempatar manos de la misma categoría."],
      ["entrar pasivamente", "Entrar en el bote antes del flop igualando la ciega grande en lugar de subir."],
      ["descartar", "Tirar una mano boca abajo en el showdown en vez de mostrarla."],
      ["la mejor mano posible", "La mejor mano que permite la mesa. No se puede ganar, solo empatar."],
      ["de distinto palo", "Dos cartas privadas de palos diferentes."],
      ["cartas que ayudan", "Las cartas que quedan en la baraja y te darían la mano ganadora. Para un color de cuatro cartas quedan nueve outs."],
      ["pareja alta", "Una pareja servida más alta que cualquier carta de la mesa."],
      ["pareja servida", "Dos cartas privadas del mismo valor."],
      ["bote", "Las fichas en juego en la mano actual."],
      ["cotización del bote", "El precio que te ofrece el bote: lo que tienes que igualar frente a lo que puedes ganar."],
      ["preflop", "La primera ronda de apuestas, antes de repartir ninguna carta comunitaria."],
      ["arcoíris", "Un flop de tres palos distintos, que hace imposible un proyecto de color inmediato."],
      ["subir", "Aumentar la apuesta actual. En No-Limit, la cantidad que quieras hasta toda tu pila."],
      ["resubida", "Subir una subida."],
      ["river", "La quinta y última carta comunitaria, y la ronda de apuestas que la sigue."],
      [null, "Un trío formado por una pareja servida más una carta igual en la mesa: bien escondido, al contrario que los trips."],
      ["pila corta", "Una pila pequeña respecto a las ciegas, que deja poco margen más allá de retirarse o ir con todo."],
      ["apertura de cartas", "Descubrir las manos que quedan tras la última ronda de apuestas para decidir quién gana."],
      ["bote secundario", "Un bote aparte que se crea cuando un jugador está all-in y los demás siguen apostando por encima."],
      [null, "Un torneo que empieza en cuanto se llenan los asientos, no a una hora fija. Todas las partidas de PokerTH lo son."],
      ["juego lento", "Jugar flojo una mano fuerte para mantener a los rivales en el bote."],
      ["ciega pequeña", "La menor de las apuestas obligatorias, puesta justo a la izquierda del botón."],
      ["bote repartido", "Un bote que se reparte entre manos de igual fuerza. En Hold’em los palos nunca desempatan."],
      ["pila", "Las fichas que un jugador tiene delante."],
      [null, "Una subida a ciegas opcional puesta antes del reparto. No se usa en PokerTH."],
      ["del mismo palo", "Dos cartas privadas del mismo palo."],
      ["descontrol", "Jugar mal por frustración, normalmente tras una mala suerte."],
      [null, "Un trío formado por una carta privada y una pareja en la mesa. Todo el mundo ve dos de las tres."],
      ["turn", "La cuarta carta comunitaria, y la ronda de apuestas que la sigue."],
      ["primero en hablar", "El asiento que actúa primero antes del flop, justo a la izquierda de la ciega grande."],
      ["apuesta de valor", "Una apuesta hecha para que la iguale una mano peor, no para hacer que alguien se retire."],
      ["la rueda", "La escalera A-2-3-4-5, en la que el as juega bajo. La escalera más débil que hay."]
    ],
    footer: function (h, c) { return "¿Sigues sin tener claro cómo transcurre una mano? Las <a href=\"{rules}\">reglas</a> la siguen desde las ciegas hasta el showdown, y las <a href=\"{hands}\">jugadas de póker</a> enumeran qué gana a qué.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)); }
  },

  'pt-BR': {
    title: "Glossário de pôquer — termos do Texas Hold’em — PokerTH",
    desc: "O que significam os termos do pôquer, de all-in a wheel: blinds, kicker, outs, pot odds, set e trips, potes laterais e showdown, explicados em linguagem simples.",
    ldHeadline: "Glossário de pôquer — termos do Texas Hold’em explicados",
    ldDesc: "Um glossário dos termos do pôquer Texas Hold’em, de all-in a wheel.",
    h1: "Glossário de pôquer — termos do Texas Hold’em",
    lead: "As palavras que você vai encontrar numa mesa de Hold’em, no chat e no próprio PokerTH. As cinco palavras de ação — Fold, Check, Call, Raise e All-In — continuam em inglês nos 45 idiomas da interface, porque é assim em qualquer mesa do mundo.",
    terms: [
      ["apostar tudo", "Apostar todas as suas fichas. Você só pode ganhar a parte do pote que pagou; o resto vai para um pote lateral."],
      ["ante", "Uma pequena aposta obrigatória paga por todos antes da distribuição, além dos blinds. Usada nos níveis avançados de alguns torneios."],
      ["projeto pelos fundos", "Um projeto que precisa tanto do turn quanto do river para se completar, como mais duas copas para um flush."],
      ["virada cruel", "Perder uma mão em que você era amplamente favorito."],
      ["blind grande", "A maior das duas apostas obrigatórias, colocada duas cadeiras à esquerda do botão. Em torneio, as fichas costumam ser contadas em blinds grandes."],
      ["blinds", "As duas apostas obrigatórias que iniciam cada mão e dão aos jogadores algo para disputar. No PokerTH elas sobem no relógio."],
      ["mesa", "As cinco cartas comunitárias, compartilhadas por todos."],
      ["bolha", "O momento do torneio logo antes de começarem as posições pagas ou pontuadas."],
      ["botão", "O disco que marca o dealer nominal. Quem está no botão fala por último depois do flop, a melhor posição da mesa."],
      ["pagar", "Igualar a aposta atual, nada além disso."],
      ["passar", "Passar a vez sem apostar. Só é possível quando ninguém apostou na rodada atual."],
      ["check-aumento", "Passar e depois aumentar quando outro aposta. Um jeito de engordar o pote com uma mão forte."],
      ["cartas comunitárias", "As cinco cartas abertas que todos podem usar, distribuídas como flop, turn e river."],
      ["conectores", "Duas cartas fechadas de valores seguidos, como 8-9. Os conectores do mesmo naipe também compartilham o naipe."],
      ["projeto", "Uma mão incompleta que precisa de uma ou mais cartas para ficar forte — quatro para um flush, quatro para uma sequência."],
      [null, "Ter um projeto que não pode vencer nem se completar."],
      ["equity", "Sua fatia do pote considerando as cartas que faltam — na prática, com que frequência você vence a partir daqui."],
      ["flop", "As três primeiras cartas comunitárias, abertas de uma vez."],
      ["desistir", "Abandonar a mão, e com ela todas as fichas já apostadas."],
      ["torneio gratuito", "Um torneio cuja entrada não custa nada. No PokerTH toda mesa é assim, já que não há dinheiro em lugar nenhum."],
      ["mano a mano", "Uma mão, ou uma fase de torneio, com apenas dois jogadores restantes."],
      ["cartas fechadas", "Suas duas cartas privadas."],
      ["carta de desempate", "A carta mais alta que sobra depois da combinação, usada para desempatar mãos da mesma categoria."],
      ["entrar pagando", "Entrar no pote antes do flop apenas pagando o blind grande, em vez de aumentar."],
      ["descartar", "Jogar a mão fora virada para baixo no showdown em vez de mostrá-la."],
      ["a melhor mão possível", "A melhor mão que a mesa permite. Não pode ser batida, apenas empatada."],
      ["naipes diferentes", "Duas cartas fechadas de naipes distintos."],
      ["cartas que ajudam", "As cartas ainda no baralho que dariam a você a mão vencedora. Para um flush de quatro cartas restam nove outs."],
      ["par alto", "Um par na mão maior do que qualquer carta da mesa."],
      ["par na mão", "Duas cartas fechadas do mesmo valor."],
      ["pote", "As fichas em jogo na mão atual."],
      ["odds do pote", "O preço que o pote oferece: quanto você precisa pagar contra quanto pode ganhar."],
      ["pré-flop", "A primeira rodada de apostas, antes de qualquer carta comunitária."],
      ["arco-íris", "Um flop com três naipes diferentes, o que torna impossível um projeto de flush imediato."],
      ["aumentar", "Aumentar a aposta atual. No No-Limit, qualquer valor até todas as suas fichas."],
      ["reaumento", "Aumentar um aumento."],
      ["river", "A quinta e última carta comunitária, e a rodada de apostas que vem depois."],
      [null, "Uma trinca formada por um par na mão mais uma carta igual na mesa — bem escondida, ao contrário da trips."],
      ["pilha curta", "Uma quantidade de fichas pequena em relação aos blinds, que deixa pouca escolha além de desistir ou apostar tudo."],
      ["abertura das cartas", "Revelar as mãos restantes depois da última rodada de apostas para decidir quem vence."],
      ["pote lateral", "Um pote separado, criado quando um jogador está all-in e os outros continuam apostando acima daquele valor."],
      [null, "Um torneio que começa assim que as cadeiras enchem, e não em horário fixo. Toda partida do PokerTH é assim."],
      ["jogo lento", "Jogar de forma fraca com uma mão forte para manter os adversários no pote."],
      ["blind pequeno", "A menor das apostas obrigatórias, colocada logo à esquerda do botão."],
      ["pote dividido", "Um pote repartido entre mãos de mesma força. No Hold’em os naipes nunca desempatam."],
      ["pilha", "As fichas que um jogador tem à sua frente."],
      [null, "Um aumento às cegas, opcional, feito antes da distribuição. Não é usado no PokerTH."],
      ["mesmo naipe", "Duas cartas fechadas do mesmo naipe."],
      ["descontrole", "Jogar mal por frustração, normalmente depois de uma virada cruel."],
      [null, "Uma trinca formada por uma carta fechada e um par na mesa. Todo mundo enxerga duas das três."],
      ["turn", "A quarta carta comunitária, e a rodada de apostas que vem depois."],
      ["primeiro a falar", "A cadeira que age primeiro antes do flop, logo à esquerda do blind grande."],
      ["aposta por valor", "Uma aposta feita para ser paga por uma mão pior, e não para fazer alguém desistir."],
      ["a roda", "A sequência A-2-3-4-5, em que o ás vale embaixo. A sequência mais fraca que existe."]
    ],
    footer: function (h, c) { return "Ainda não está claro como uma mão acontece? As <a href=\"{rules}\">regras</a> acompanham tudo, dos blinds ao showdown, e as <a href=\"{hands}\">mãos do pôquer</a> listam o que ganha de quê.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)); }
  },

  it: {
    title: "Glossario del poker — i termini del Texas Hold’em — PokerTH",
    desc: "Che cosa significano i termini del poker, da all-in a wheel: bui, kicker, outs, pot odds, set e trips, piatti laterali e showdown, spiegati in parole semplici.",
    ldHeadline: "Glossario del poker — i termini del Texas Hold’em spiegati",
    ldDesc: "Un glossario dei termini del poker Texas Hold’em, da all-in a wheel.",
    h1: "Glossario del poker — i termini del Texas Hold’em",
    lead: "Le parole che incontrerai a un tavolo di Hold’em, in chat e in PokerTH stesso. Le cinque parole d’azione — Fold, Check, Call, Raise e All-In — restano in inglese in tutte e 45 le lingue dell’interfaccia, perché è così a ogni tavolo del mondo.",
    terms: [
      ["puntare tutto", "Puntare tutte le proprie fiche. Puoi vincere solo la parte di piatto che hai pagato; il resto va in un piatto laterale."],
      ["ante", "Una piccola puntata obbligata versata da ogni giocatore prima della distribuzione, oltre ai bui. Usata nei livelli avanzati di alcuni tornei."],
      ["progetto di rimessa", "Un progetto che ha bisogno sia del turn sia del river per completarsi, per esempio altri due cuori per un colore."],
      ["batosta", "Perdere una mano di cui eri largamente favorito."],
      ["buio grande", "La maggiore delle due puntate obbligate, versata due posti a sinistra del bottone. Nei tornei gli stack si contano di solito in bui grandi."],
      ["bui", "Le due puntate obbligate che aprono ogni mano e danno ai giocatori qualcosa per cui contendersi. In PokerTH salgono a tempo."],
      ["tavolo", "Le cinque carte comuni, condivise da tutti."],
      ["bolla", "Il momento del torneo appena prima che inizino i posti pagati o validi per la classifica."],
      ["bottone", "Il disco che indica il mazziere nominale. Chi è sul bottone parla per ultimo dopo il flop: la posizione migliore al tavolo."],
      ["vedere", "Pareggiare la puntata in corso, niente di più."],
      ["passare", "Cedere la parola senza puntare. Possibile solo se nessuno ha puntato nel giro in corso."],
      ["check-rilancio", "Passare e poi rilanciare dopo la puntata di un altro. Un modo per costruire il piatto con una mano forte."],
      ["carte comuni", "Le cinque carte scoperte che chiunque può usare, distribuite come flop, turn e river."],
      ["connettori", "Due carte coperte di valore consecutivo, per esempio 8-9. I connettori dello stesso seme condividono anche il seme."],
      ["progetto", "Una mano incompleta a cui manca una o più carte per diventare forte: quattro per un colore, quattro per una scala."],
      [null, "Avere un progetto che non può vincere nemmeno se si completa."],
      ["equity", "La tua quota di piatto viste le carte ancora da uscire: in pratica, quanto spesso vinci da qui."],
      ["flop", "Le prime tre carte comuni, distribuite in una volta sola."],
      ["lasciare", "Abbandonare la mano, e con essa ogni fiche già puntata."],
      ["torneo gratuito", "Un torneo che non costa nulla per iscriversi. In PokerTH lo è ogni tavolo, dato che non c’è denaro da nessuna parte."],
      ["testa a testa", "Una mano, o una fase di torneo, in cui restano solo due giocatori."],
      ["carte coperte", "Le tue due carte private."],
      [null, "La carta più alta che avanza dopo la combinazione, usata per risolvere la parità fra mani dello stesso punto."],
      [null, "Entrare nel piatto prima del flop limitandosi a vedere il buio grande invece di rilanciare."],
      ["scartare", "Buttare la mano coperta allo showdown invece di mostrarla."],
      ["la mano massima", "La mano migliore possibile dato il tavolo. Non può essere battuta, solo pareggiata."],
      ["di semi diversi", "Due carte coperte di semi diversi."],
      ["carte utili", "Le carte ancora nel mazzo che ti darebbero la mano vincente. Per un colore a quattro carte restano nove outs."],
      ["coppia alta", "Una coppia servita più alta di qualsiasi carta sul tavolo."],
      ["coppia servita", "Due carte coperte dello stesso valore."],
      ["piatto", "Le fiche in gioco nella mano in corso."],
      ["quote del piatto", "Il prezzo che il piatto ti propone: quanto devi vedere, contro quanto puoi vincere."],
      ["preflop", "Il primo giro di puntate, prima che sia distribuita qualsiasi carta comune."],
      ["arcobaleno", "Un flop di tre semi diversi, che rende impossibile un progetto di colore immediato."],
      ["rilanciare", "Aumentare la puntata in corso. Nel No-Limit, di qualsiasi importo fino a tutto il proprio stack."],
      ["controrilancio", "Rilanciare un rilancio."],
      ["river", "La quinta e ultima carta comune, e il giro di puntate che la segue."],
      [null, "Un tris formato da una coppia servita più una carta uguale sul tavolo: ben nascosto, al contrario del trips."],
      ["stack corto", "Uno stack piccolo rispetto ai bui, che lascia poco margine oltre a lasciare o andare all-in."],
      ["showdown", "Scoprire le mani rimaste dopo l’ultimo giro di puntate per stabilire chi vince."],
      ["piatto laterale", "Un piatto separato, creato quando un giocatore è all-in e gli altri continuano a puntare oltre quella cifra."],
      [null, "Un torneo che parte appena i posti sono pieni, invece che a orario fisso. Ogni partita di PokerTH lo è."],
      ["gioco lento", "Giocare debolmente una mano forte per tenere gli avversari nel piatto."],
      ["buio piccolo", "La minore delle puntate obbligate, versata subito a sinistra del bottone."],
      ["piatto diviso", "Un piatto spartito fra mani di pari forza. Nell’Hold’em i semi non risolvono mai la parità."],
      ["stack", "Le fiche che un giocatore ha davanti a sé."],
      [null, "Un rilancio al buio facoltativo, versato prima della distribuzione. Non usato in PokerTH."],
      ["dello stesso seme", "Due carte coperte dello stesso seme."],
      [null, "Giocare male per la frustrazione, di solito dopo una batosta."],
      [null, "Un tris formato da una carta coperta e una coppia sul tavolo. Due delle tre carte le vedono tutti."],
      ["turn", "La quarta carta comune, e il giro di puntate che la segue."],
      ["primo di parola", "Il posto che agisce per primo prima del flop, subito a sinistra del buio grande."],
      ["puntata di valore", "Una puntata fatta per essere vista da una mano peggiore, non per far lasciare qualcuno."],
      ["la ruota", "La scala A-2-3-4-5, in cui l’asso vale in basso. La scala più debole che ci sia."]
    ],
    footer: function (h, c) { return "Non ti è ancora chiaro come si svolge una mano? Le <a href=\"{rules}\">regole</a> la seguono dai bui allo showdown, e i <a href=\"{hands}\">punti del poker</a> elencano che cosa batte che cosa.".replace('{rules}', h('rules', c)).replace('{hands}', h('hands', c)); }
  }

};

// Assemble one page body per language, once, at load. `glossary` is the
// language-neutral _SEO_GLOSSARY array, which supplies the English headwords
// so a translation cannot drift from them or reorder them, and
// `href(page, lang)` resolves an internal link to the right language variant.
function build(glossary, href) {
  var out = {};
  for (var code in PARTS) {
    var p = PARTS[code], dl = '<dl>', i;
    for (i = 0; i < glossary.length; i++) {
      var en = glossary[i][0], loc = p.terms[i][0];
      // Many languages have simply adopted the English word — ante, flop,
      // turn, river, pot. Printing "Ante (ante)" would be noise, so an
      // equivalent that only differs by case is dropped here rather than
      // relying on every translation to have passed null for it.
      if (loc && loc.toLowerCase() === en.toLowerCase()) loc = null;
      dl += '<dt><span class="en">' + en + '</span>' +
        (loc ? ' <span class="loc">(' + loc + ')</span>' : '') + '</dt>' +
        '<dd>' + p.terms[i][1] + '</dd>';
    }
    dl += '</dl>';
    out[code] = {
      title: p.title, desc: p.desc, ldHeadline: p.ldHeadline, ldDesc: p.ldDesc,
      body: '<h1>' + p.h1 + '</h1><p>' + p.lead + '</p>' + dl +
        '<p style="margin-top:1.6em">' + p.footer(href, code) + '</p>'
    };
  }
  return out;
}

module.exports = { PARTS: PARTS, build: build };
