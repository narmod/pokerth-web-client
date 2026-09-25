'use strict';
// Translations for the /hand-rankings page.
//
// Why this is not in proxy.js: a full translation of this page is ~3 KB of
// prose, and there are 44 of them to write. Inlined, the three content-page
// tables would have added about a megabyte to a file that already weighs one,
// so each page gets its own module here. proxy.js reads the result exactly as
// before — seoPageLangs() still decides which languages are advertised in the
// hreflang set and in the sitemap, and a language is advertised the moment its
// entry lands here, not before.
//
// English is not in this file. It lives in seoHandsPage() in proxy.js and is
// the fallback for every language still missing below.
//
// Shape per language:
//   title, desc            <title> and <meta name="description">
//   ldHeadline, ldDesc     JSON-LD Article headline and description
//   h1, lead               page heading and opening paragraph
//   names[10]              hand names, strongest first
//   texts[10]              one sentence per hand, same order
//   dealt                  '%s' is replaced by the frequency
//   tiesH2, tiesP          tie-breaking section
//   wrongH2, wrong[]       common misconceptions, one string per <li>
//   seeH2, seeP            closing section about the client itself
//
// names[] must match the h1n…h10n keys of public/modules/lang/<code>.mjs: the
// page and the in-game hand list have to call a full house the same thing.
// scripts/test-seo-hands-i18n.mjs checks that, and that every entry is
// complete — a half-filled entry would publish a half-English page.

var PARTS = {

  fr: {
    title: 'Combinaisons du poker — ordre des mains au Texas Hold’em',
    desc: 'Les dix combinaisons du poker Texas Hold’em classées de la quinte flush royale à la carte haute, avec des exemples, la probabilité de chacune et la façon dont les égalités sont départagées.',
    ldHeadline: 'Combinaisons du poker — Texas Hold’em',
    ldDesc: 'Les dix combinaisons du Texas Hold’em dans l’ordre, avec exemples, fréquences et règles de départage.',
    h1: 'Combinaisons du poker',
    lead: 'Au Texas Hold’em, les mains se classent de la plus forte à la plus faible comme suit. Une main fait toujours exactement cinq cartes, choisies parmi les sept que vous voyez : vos deux cartes privées et les cinq cartes communes. Rien ne vous oblige à utiliser les vôtres — si le tableau à lui seul forme les cinq meilleures, c’est aussi votre main.',
    names: ['Quinte Flush Royale', 'Quinte Flush', 'Carré', 'Full', 'Couleur', 'Quinte', 'Brelan', 'Deux Paires', 'Paire', 'Carte Haute'],
    texts: [
      'A K Q J 10, tous de la même couleur. La meilleure main possible : elle ne peut pas être battue, seulement égalisée.',
      'Cinq cartes qui se suivent, toutes de la même couleur. Entre deux quintes flush, la plus haute carte l’emporte.',
      'Quatre cartes de même rang. La cinquième carte (le kicker) tranche le rare cas où le carré est sur le tableau.',
      'Un brelan accompagné d’une paire. On compare d’abord le brelan, ensuite la paire.',
      'Cinq cartes de la même couleur, sans se suivre. On les compare une à une en partant de la plus haute ; aucune couleur ne prime sur une autre.',
      'Cinq cartes qui se suivent, couleurs mélangées. L’as joue en haut (10-J-Q-K-A) ou en bas (A-2-3-4-5), jamais les deux à la fois.',
      'Trois cartes de même rang, accompagnées de deux cartes sans lien.',
      'Deux paires différentes plus une cinquième carte. On compare la paire haute, puis la basse, puis le kicker.',
      'Deux cartes de même rang plus trois cartes sans lien, comparées dans l’ordre.',
      'Aucune des combinaisons ci-dessus. La carte la plus haute décide, puis la suivante, et ainsi de suite.'
    ],
    dealt: 'apparaît dans %s des mains de sept cartes',
    tiesH2: 'Comment les égalités se départagent',
    tiesP: 'On compare d’abord la catégorie : n’importe quelle couleur bat n’importe quelle quinte, quelles que soient les cartes. À catégorie égale, on compare rang par rang en partant du haut. Ce qui reste après la combinaison s’appelle le <em>kicker</em>, et il décide de bien plus de coups que les débutants ne l’imaginent : A♠ K♦ et A♣ 7♥ forment tous deux une paire d’as sur un tableau A-9-4, mais le roi bat le sept au kicker. Les couleurs ne départagent jamais rien au Hold’em — deux joueurs avec les mêmes cinq rangs se partagent le pot, jusqu’au dernier jeton.',
    wrongH2: 'Ce que l’on croit à tort',
    wrong: [
      'L’as est à la fois la carte la plus haute et la plus basse d’une quinte : A-K-Q-J-10 est la meilleure, A-2-3-4-5 (la <em>roue</em>) la plus faible. La séquence ne boucle pas — Q-K-A-2-3 ne vaut rien du tout.',
      'Une couleur, ce sont cinq cartes de la même famille, pas quatre. Quatre cœurs entre votre main et le tableau ne valent rien en soi.',
      'Un brelan formé d’une paire dans votre main plus une carte du tableau s’appelle un <em>set</em> ; formé d’une carte de votre main plus une paire au tableau, ce sont des <em>trips</em>. Même classement, force très différente, parce que les trips sont visibles de tous.',
      'Seules les cinq meilleures cartes comptent. Avec deux paires en main et une troisième paire au tableau, vous avez deux paires, pas trois.',
      'Les pourcentages ci-dessus indiquent à quelle fréquence chaque main apparaît à la river sur sept cartes, pas à quelle fréquence elle gagne. Deux paires semblent banales et restent devant la plupart de ce qu’elles rencontrent.'
    ],
    seeH2: 'Le voir à la table',
    seeP: 'PokerTH nomme votre meilleure combinaison sous le tableau pendant la partie, pour que vous n’ayez jamais à la reconstituer sous la pression du temps, et affiche au showdown chaque main dévoilée avec les cinq cartes qui ont compté mises en évidence. S’entraîner hors ligne contre les adversaires gérés par l’ordinateur reste le moyen le plus rapide de faire entrer ce classement dans les doigts.'
  },

  de: {
    title: 'Pokerblätter — Reihenfolge der Hände beim Texas Hold’em',
    desc: 'Alle zehn Texas-Hold’em-Pokerblätter vom Royal Flush bis zur höchsten Karte, mit Beispielen, der Wahrscheinlichkeit jedes Blatts und der Frage, wie Kicker und Gleichstände entschieden werden.',
    ldHeadline: 'Pokerblätter — Texas Hold’em',
    ldDesc: 'Die zehn Texas-Hold’em-Blätter der Reihe nach, mit Beispielen, Häufigkeiten und Regeln für Gleichstände.',
    h1: 'Pokerblätter',
    lead: 'Texas-Hold’em-Blätter sind von stark nach schwach wie folgt geordnet. Ein Blatt besteht immer aus genau fünf Karten, ausgewählt aus den sieben, die Sie sehen : Ihren beiden Hole Cards und den fünf Gemeinschaftskarten. Sie müssen Ihre eigenen Karten nicht verwenden — wenn das Board allein die besten fünf bildet, ist das ebenfalls Ihr Blatt.',
    names: ['Royal Flush', 'Straight Flush', 'Vierling', 'Full House', 'Flush', 'Straße', 'Drilling', 'Zwei Paare', 'Ein Paar', 'Höchste Karte'],
    texts: [
      'A K Q J 10, alle in derselben Farbe. Das bestmögliche Blatt : Es kann nicht geschlagen, nur eingeholt werden.',
      'Fünf aufeinanderfolgende Karten derselben Farbe. Zwischen zwei Straight Flushes gewinnt die höhere oberste Karte.',
      'Vier Karten desselben Ranges. Die fünfte Karte (der Kicker) entscheidet den seltenen Fall, dass der Vierling auf dem Board liegt.',
      'Ein Drilling plus ein Paar. Zuerst wird der Drilling verglichen, dann das Paar.',
      'Fünf Karten derselben Farbe, nicht in Folge. Von oben Karte für Karte verglichen ; keine Farbe steht über einer anderen.',
      'Fünf aufeinanderfolgende Karten gemischter Farben. Das Ass zählt oben (10-J-Q-K-A) oder unten (A-2-3-4-5), nie beides zugleich.',
      'Drei Karten desselben Ranges, dazu zwei unabhängige Karten.',
      'Zwei verschiedene Paare plus eine fünfte Karte. Zuerst zählt das höhere Paar, dann das niedrigere, dann der Kicker.',
      'Zwei Karten desselben Ranges plus drei unabhängige Karten, der Reihe nach verglichen.',
      'Nichts von alledem. Die höchste Karte entscheidet, dann die nächste und so weiter.'
    ],
    dealt: 'kommt in %s der Sieben-Karten-Blätter vor',
    tiesH2: 'Wie Gleichstände entschieden werden',
    tiesP: 'Zuerst zählt die Kategorie : jeder Flush schlägt jede Straße, unabhängig von den Karten. Innerhalb derselben Kategorie wird von oben Rang für Rang verglichen. Was nach der Kombination übrig bleibt, heißt <em>Kicker</em>, und er entscheidet mehr Hände, als Anfänger erwarten : A♠ K♦ und A♣ 7♥ ergeben auf einem Board A-9-4 beide ein Ass-Paar, aber der König sticht die Sieben aus. Farben brechen beim Hold’em nie einen Gleichstand — zwei Spieler mit denselben fünf Rängen teilen den Pot, bis auf den letzten Chip.',
    wrongH2: 'Häufige Irrtümer',
    wrong: [
      'Das Ass ist für eine Straße zugleich die höchste und die niedrigste Karte : A-K-Q-J-10 ist die beste, A-2-3-4-5 (das <em>Wheel</em>) die schwächste. Sie läuft nicht um — Q-K-A-2-3 ist überhaupt nichts.',
      'Ein Flush sind fünf Karten einer Farbe, nicht vier. Vier Herz zwischen Hand und Board sind für sich genommen wertlos.',
      'Ein Drilling aus einem Paar in der Hand plus einer Karte auf dem Board heißt <em>Set</em> ; aus einer Karte in der Hand plus einem Paar auf dem Board heißt er <em>Trips</em>. Gleicher Rang, sehr unterschiedliche Stärke, denn Trips sind für alle sichtbar.',
      'Nur die besten fünf Karten zählen. Zwei Paare in der Hand und ein drittes Paar auf dem Board ergeben zwei Paare, nicht drei.',
      'Die Prozentwerte oben sagen, wie oft ein Blatt bis zum River über sieben Karten überhaupt entsteht, nicht wie oft es gewinnt. Zwei Paare wirken alltäglich und liegen trotzdem vor dem meisten, was ihnen begegnet.'
    ],
    seeH2: 'Am Tisch sichtbar',
    seeP: 'PokerTH benennt Ihr aktuell bestes Blatt während des Spiels unterhalb des Boards, sodass Sie es nie unter Zeitdruck selbst zusammensetzen müssen, und zeigt beim Showdown jedes aufgedeckte Blatt mit den fünf Karten, die gezählt haben, hervorgehoben. Offline gegen die Computergegner zu üben ist der schnellste Weg, diese Reihenfolge in die Finger zu bekommen.'
  },

  es: {
    title: 'Jugadas de póker — orden de las manos en Texas Hold’em',
    desc: 'Las diez jugadas del póker Texas Hold’em ordenadas de la escalera real a la carta alta, con ejemplos, la probabilidad de cada una y cómo se resuelven los kickers y los empates.',
    ldHeadline: 'Jugadas de póker — Texas Hold’em',
    ldDesc: 'Las diez jugadas del Texas Hold’em en orden, con ejemplos, frecuencias y reglas de desempate.',
    h1: 'Jugadas de póker',
    lead: 'En Texas Hold’em las manos se ordenan de la más fuerte a la más débil como sigue. Una mano son siempre exactamente cinco cartas, elegidas entre las siete que ves : tus dos cartas privadas y las cinco comunitarias. Nunca estás obligado a usar las tuyas — si la mesa por sí sola forma las mejores cinco, esa también es tu mano.',
    names: ['Escalera Real', 'Escalera de Color', 'Póker', 'Full', 'Color', 'Escalera', 'Trío', 'Doble Pareja', 'Pareja', 'Carta Alta'],
    texts: [
      'A K Q J 10, todas del mismo palo. La mejor mano posible : no se puede ganar, solo empatar.',
      'Cinco cartas consecutivas del mismo palo. Entre dos escaleras de color gana la de carta más alta.',
      'Cuatro cartas del mismo valor. La quinta carta (el kicker) resuelve el raro empate cuando el póker está en la mesa.',
      'Un trío más una pareja. Primero se compara el trío y después la pareja.',
      'Cinco cartas del mismo palo, sin ser consecutivas. Se comparan una a una empezando por la más alta ; ningún palo vale más que otro.',
      'Cinco cartas consecutivas de palos mezclados. El as juega alto (10-J-Q-K-A) o bajo (A-2-3-4-5), nunca las dos cosas a la vez.',
      'Tres cartas del mismo valor, más dos cartas sin relación.',
      'Dos parejas distintas más una quinta carta. Se compara primero la pareja alta, luego la baja y luego el kicker.',
      'Dos cartas del mismo valor más tres cartas sin relación, comparadas en orden.',
      'Ninguna de las anteriores. Decide la carta más alta, luego la siguiente, y así sucesivamente.'
    ],
    dealt: 'aparece en el %s de las manos de siete cartas',
    tiesH2: 'Cómo se resuelven los empates',
    tiesP: 'Primero se compara la categoría : cualquier color gana a cualquier escalera, sean cuales sean las cartas. Dentro de la misma categoría se compara valor por valor empezando por arriba. Lo que sobra tras la jugada se llama <em>kicker</em>, y decide muchas más manos de las que esperan los principiantes : A♠ K♦ y A♣ 7♥ forman pareja de ases en una mesa A-9-4, pero el rey supera al siete. Los palos nunca desempatan en Hold’em — dos jugadores con los mismos cinco valores reparten el bote hasta la última ficha.',
    wrongH2: 'Errores frecuentes',
    wrong: [
      'El as es a la vez la carta más alta y la más baja de una escalera : A-K-Q-J-10 es la mejor, A-2-3-4-5 (la <em>rueda</em>) la peor. La secuencia no da la vuelta — Q-K-A-2-3 no vale absolutamente nada.',
      'Un color son cinco cartas de un palo, no cuatro. Cuatro corazones entre tu mano y la mesa no valen nada por sí solos.',
      'Un trío formado con una pareja de tu mano más una carta de la mesa se llama <em>set</em> ; formado con una carta tuya más una pareja en la mesa son <em>trips</em>. Misma categoría, fuerza muy distinta, porque los trips los ve todo el mundo.',
      'Solo cuentan las mejores cinco cartas. Con dos parejas y una tercera pareja en la mesa tienes doble pareja, no triple.',
      'Los porcentajes de arriba indican con qué frecuencia aparece cada jugada al llegar al river sobre siete cartas, no con qué frecuencia gana. La doble pareja parece común y aún así va por delante de casi todo lo que se encuentra.'
    ],
    seeH2: 'Verlo en la mesa',
    seeP: 'PokerTH nombra tu mejor jugada actual bajo la mesa mientras juegas, de modo que nunca tengas que deducirla con el reloj en contra, y en el showdown muestra cada mano revelada con las cinco cartas que contaron resaltadas. Practicar sin conexión contra los oponentes del ordenador es la forma más rápida de aprenderse el orden de memoria.'
  },
  'es-419': {
    title: 'Jugadas de póker — orden de las manos en Texas Hold’em',
    desc: 'Las diez jugadas del póker Texas Hold’em ordenadas de la escalera real a la carta alta, con ejemplos, la probabilidad de cada una y cómo se resuelven los kickers y los empates.',
    ldHeadline: 'Jugadas de póker — Texas Hold’em',
    ldDesc: 'Las diez jugadas del Texas Hold’em en orden, con ejemplos, frecuencias y reglas de desempate.',
    h1: 'Jugadas de póker',
    lead: 'En Texas Hold’em las manos se ordenan de la más fuerte a la más débil como sigue. Una mano son siempre exactamente cinco cartas, elegidas entre las siete que ves : tus dos cartas privadas y las cinco comunitarias. Nunca estás obligado a usar las tuyas — si la mesa por sí sola forma las mejores cinco, esa también es tu mano.',
    names: ['Escalera Real', 'Escalera de Color', 'Póker', 'Full', 'Color', 'Escalera', 'Trío', 'Doble Pareja', 'Pareja', 'Carta Alta'],
    texts: [
      'A K Q J 10, todas del mismo palo. La mejor mano posible : no se puede ganar, solo empatar.',
      'Cinco cartas consecutivas del mismo palo. Entre dos escaleras de color gana la de carta más alta.',
      'Cuatro cartas del mismo valor. La quinta carta (el kicker) resuelve el raro empate cuando el póker está en la mesa.',
      'Un trío más una pareja. Primero se compara el trío y después la pareja.',
      'Cinco cartas del mismo palo, sin ser consecutivas. Se comparan una a una empezando por la más alta ; ningún palo vale más que otro.',
      'Cinco cartas consecutivas de palos mezclados. El as juega alto (10-J-Q-K-A) o bajo (A-2-3-4-5), nunca las dos cosas a la vez.',
      'Tres cartas del mismo valor, más dos cartas sin relación.',
      'Dos parejas distintas más una quinta carta. Se compara primero la pareja alta, luego la baja y luego el kicker.',
      'Dos cartas del mismo valor más tres cartas sin relación, comparadas en orden.',
      'Ninguna de las anteriores. Decide la carta más alta, luego la siguiente, y así sucesivamente.'
    ],
    dealt: 'aparece en el %s de las manos de siete cartas',
    tiesH2: 'Cómo se resuelven los empates',
    tiesP: 'Primero se compara la categoría : cualquier color gana a cualquier escalera, sean cuales sean las cartas. Dentro de la misma categoría se compara valor por valor empezando por arriba. Lo que sobra tras la jugada se llama <em>kicker</em>, y decide muchas más manos de las que esperan los principiantes : A♠ K♦ y A♣ 7♥ forman pareja de ases en una mesa A-9-4, pero el rey supera al siete. Los palos nunca desempatan en Hold’em — dos jugadores con los mismos cinco valores reparten el pozo hasta la última ficha.',
    wrongH2: 'Errores frecuentes',
    wrong: [
      'El as es a la vez la carta más alta y la más baja de una escalera : A-K-Q-J-10 es la mejor, A-2-3-4-5 (la <em>rueda</em>) la peor. La secuencia no da la vuelta — Q-K-A-2-3 no vale absolutamente nada.',
      'Un color son cinco cartas de un palo, no cuatro. Cuatro corazones entre tu mano y la mesa no valen nada por sí solos.',
      'Un trío formado con una pareja de tu mano más una carta de la mesa se llama <em>set</em> ; formado con una carta tuya más una pareja en la mesa son <em>trips</em>. Misma categoría, fuerza muy distinta, porque los trips los ve todo el mundo.',
      'Solo cuentan las mejores cinco cartas. Con dos parejas y una tercera pareja en la mesa tienes doble pareja, no triple.',
      'Los porcentajes de arriba indican con qué frecuencia aparece cada jugada al llegar al river sobre siete cartas, no con qué frecuencia gana. La doble pareja parece común y aún así va por delante de casi todo lo que se encuentra.'
    ],
    seeH2: 'Verlo en la mesa',
    seeP: 'PokerTH nombra tu mejor jugada actual bajo la mesa mientras juegas, de modo que nunca tengas que deducirla con el reloj en contra, y en el showdown muestra cada mano revelada con las cinco cartas que contaron resaltadas. Practicar sin conexión contra los oponentes de la computadora es la forma más rápida de aprenderse el orden de memoria.'
  },

  'pt-BR': {
    title: 'Mãos do pôquer — ordem das mãos no Texas Hold’em',
    desc: 'As dez mãos do pôquer Texas Hold’em em ordem, do royal flush à carta alta, com exemplos, a probabilidade de cada uma e como kickers e empates são resolvidos.',
    ldHeadline: 'Mãos do pôquer — Texas Hold’em',
    ldDesc: 'As dez mãos do Texas Hold’em em ordem, com exemplos, frequências e regras de desempate.',
    h1: 'Mãos do pôquer',
    lead: 'No Texas Hold’em as mãos são classificadas da mais forte para a mais fraca como segue. Uma mão tem sempre exatamente cinco cartas, escolhidas entre as sete que você vê : suas duas cartas fechadas e as cinco comunitárias. Você nunca é obrigado a usar as suas — se a mesa sozinha formar as melhores cinco, essa também é a sua mão.',
    names: ['Royal Flush', 'Straight Flush', 'Quadra', 'Full House', 'Flush', 'Sequência', 'Trinca', 'Dois Pares', 'Par', 'Carta Alta'],
    texts: [
      'A K Q J 10, todas do mesmo naipe. A melhor mão possível : não pode ser batida, apenas empatada.',
      'Cinco cartas em sequência, todas do mesmo naipe. Entre dois straight flushes vence o de carta mais alta.',
      'Quatro cartas do mesmo valor. A quinta carta (o kicker) resolve o raro empate quando a quadra está na mesa.',
      'Uma trinca mais um par. Compara-se primeiro a trinca, depois o par.',
      'Cinco cartas do mesmo naipe, sem estarem em sequência. Comparadas uma a uma a partir da mais alta ; nenhum naipe vale mais que outro.',
      'Cinco cartas em sequência, naipes misturados. O ás vale em cima (10-J-Q-K-A) ou embaixo (A-2-3-4-5), nunca os dois ao mesmo tempo.',
      'Três cartas do mesmo valor, mais duas cartas sem relação.',
      'Dois pares diferentes mais uma quinta carta. Compara-se primeiro o par mais alto, depois o mais baixo, depois o kicker.',
      'Duas cartas do mesmo valor mais três cartas sem relação, comparadas em ordem.',
      'Nenhuma das anteriores. Decide a carta mais alta, depois a seguinte, e assim por diante.'
    ],
    dealt: 'aparece em %s das mãos de sete cartas',
    tiesH2: 'Como os empates são resolvidos',
    tiesP: 'Primeiro compara-se a categoria : qualquer flush vence qualquer sequência, sejam quais forem as cartas. Dentro da mesma categoria, compara-se valor por valor a partir do topo. O que sobra depois da combinação chama-se <em>kicker</em>, e ele decide muito mais mãos do que os iniciantes imaginam : A♠ K♦ e A♣ 7♥ formam par de áses numa mesa A-9-4, mas o rei supera o sete. Naipes nunca desempatam no Hold’em — dois jogadores com os mesmos cinco valores dividem o pote até a última ficha.',
    wrongH2: 'O que costumam entender errado',
    wrong: [
      'O ás é ao mesmo tempo a carta mais alta e a mais baixa de uma sequência : A-K-Q-J-10 é a melhor, A-2-3-4-5 (a <em>roda</em>) é a pior. A sequência não dá a volta — Q-K-A-2-3 não vale nada.',
      'Um flush são cinco cartas de um naipe, não quatro. Quatro copas entre a sua mão e a mesa não valem nada por si só.',
      'Uma trinca formada por um par na sua mão mais uma carta da mesa chama-se <em>set</em> ; formada por uma carta sua mais um par na mesa chama-se <em>trips</em>. Mesma classificação, força bem diferente, porque a trips todo mundo enxerga.',
      'Só as melhores cinco cartas contam. Com dois pares e um terceiro par na mesa, você tem dois pares, não três.',
      'As porcentagens acima dizem com que frequência cada mão aparece até o river em sete cartas, não com que frequência ela vence. Dois pares parecem banais e ainda assim estão à frente da maior parte do que encontram.'
    ],
    seeH2: 'Vendo na mesa',
    seeP: 'O PokerTH mostra o nome da sua melhor mão atual logo abaixo da mesa enquanto você joga, para que você nunca precise montar isso com o relógio correndo, e no showdown exibe cada mão revelada com as cinco cartas que contaram em destaque. Treinar offline contra os oponentes do computador é a forma mais rápida de gravar essa ordem.'
  },

  it: {
    title: 'Punti del poker — ordine delle mani nel Texas Hold’em',
    desc: 'Tutti e dieci i punti del poker Texas Hold’em dalla scala reale alla carta alta, con esempi, la probabilità di ciascuno e come si risolvono kicker e parità.',
    ldHeadline: 'Punti del poker — Texas Hold’em',
    ldDesc: 'I dieci punti del Texas Hold’em in ordine, con esempi, frequenze e regole di parità.',
    h1: 'Punti del poker',
    lead: 'Nel Texas Hold’em le mani si ordinano dalla più forte alla più debole come segue. Una mano è sempre di esattamente cinque carte, scelte tra le sette che vedi : le tue due carte coperte e le cinque comuni. Non sei mai obbligato a usare le tue — se il tavolo da solo forma le cinque migliori, quella è anche la tua mano.',
    names: ['Scala Reale', 'Scala colore', 'Poker', 'Full', 'Colore', 'Scala', 'Tris', 'Doppia Coppia', 'Coppia', 'Carta Alta'],
    texts: [
      'A K Q J 10, tutte dello stesso seme. La mano migliore possibile : non può essere battuta, solo pareggiata.',
      'Cinque carte in sequenza, tutte dello stesso seme. Tra due scale colore vince quella con la carta più alta.',
      'Quattro carte dello stesso valore. La quinta carta (il kicker) risolve il raro pareggio quando il poker è sul tavolo.',
      'Un tris più una coppia. Si confronta prima il tris, poi la coppia.',
      'Cinque carte dello stesso seme, non in sequenza. Si confrontano una a una partendo dalla più alta ; nessun seme vale più di un altro.',
      'Cinque carte in sequenza, semi misti. L’asso vale in alto (10-J-Q-K-A) o in basso (A-2-3-4-5), mai entrambi insieme.',
      'Tre carte dello stesso valore, più due carte non collegate.',
      'Due coppie diverse più una quinta carta. Si confronta prima la coppia alta, poi quella bassa, poi il kicker.',
      'Due carte dello stesso valore più tre carte non collegate, confrontate in ordine.',
      'Nessuno dei punti precedenti. Decide la carta più alta, poi la successiva, e così via.'
    ],
    dealt: 'compare nel %s delle mani da sette carte',
    tiesH2: 'Come si risolvono le parità',
    tiesP: 'Prima si confronta la categoria : qualsiasi colore batte qualsiasi scala, quali che siano le carte. All’interno della stessa categoria si confronta valore per valore partendo dall’alto. Ciò che avanza dopo la combinazione si chiama <em>kicker</em>, e decide molte più mani di quante i principianti si aspettino : A♠ K♦ e A♣ 7♥ fanno entrambi coppia d’assi su un tavolo A-9-4, ma il re supera il sette. I semi non risolvono mai una parità nell’Hold’em — due giocatori con gli stessi cinque valori dividono il piatto, fino all’ultima fiche.',
    wrongH2: 'Gli errori più comuni',
    wrong: [
      'L’asso è insieme la carta più alta e la più bassa di una scala : A-K-Q-J-10 è la migliore, A-2-3-4-5 (la <em>ruota</em>) la peggiore. La sequenza non gira — Q-K-A-2-3 non vale nulla.',
      'Un colore è fatto di cinque carte dello stesso seme, non quattro. Quattro cuori tra la tua mano e il tavolo da soli non valgono niente.',
      'Un tris formato da una coppia in mano più una carta sul tavolo si chiama <em>set</em> ; formato da una carta in mano più una coppia sul tavolo si chiama <em>trips</em>. Stesso punto, forza molto diversa, perché il trips lo vedono tutti.',
      'Contano solo le cinque carte migliori. Con doppia coppia e una terza coppia sul tavolo hai doppia coppia, non tripla.',
      'Le percentuali qui sopra dicono quanto spesso ogni punto si forma entro il river su sette carte, non quanto spesso vince. La doppia coppia sembra banale ed è comunque avanti alla maggior parte di ciò che incontra.'
    ],
    seeH2: 'Vederlo al tavolo',
    seeP: 'PokerTH indica il tuo punto migliore sotto il tavolo mentre giochi, così non devi mai ricostruirlo con il tempo che scorre, e allo showdown mostra ogni mano scoperta con in evidenza le cinque carte che hanno contato. Allenarsi offline contro gli avversari gestiti dal computer è il modo più rapido per farsi entrare l’ordine nelle dita.'
  },

  nl: {
    title: 'Pokerhanden — volgorde van de handen bij Texas Hold’em',
    desc: 'Alle tien Texas Hold’em-pokerhanden van royal flush tot hoge kaart, met voorbeelden, de kans op elke hand en hoe kickers en gelijke handen worden beslist.',
    ldHeadline: 'Pokerhanden — Texas Hold’em',
    ldDesc: 'De tien Texas Hold’em-handen op volgorde, met voorbeelden, frequenties en regels bij gelijke handen.',
    h1: 'Pokerhanden',
    lead: 'Texas Hold’em-handen zijn van sterk naar zwak als volgt gerangschikt. Een hand bestaat altijd uit precies vijf kaarten, gekozen uit de zeven die je ziet : je twee gesloten kaarten en de vijf gemeenschappelijke kaarten. Je hoeft je eigen kaarten nooit te gebruiken — als het bord zelf de beste vijf vormt, is dat ook jouw hand.',
    names: ['Royal Flush', 'Straight Flush', 'Vierling', 'Full House', 'Flush', 'Straat', 'Drieling', 'Twee Paar', 'Paar', 'Hoge Kaart'],
    texts: [
      'A K Q J 10, allemaal van dezelfde kleur. De best mogelijke hand : hij kan niet verslagen worden, alleen geëvenaard.',
      'Vijf opeenvolgende kaarten van dezelfde kleur. Tussen twee straight flushes wint de hoogste bovenste kaart.',
      'Vier kaarten van dezelfde waarde. De vijfde kaart (de kicker) beslist het zeldzame geval waarin de vierling op het bord ligt.',
      'Een drieling plus een paar. Eerst wordt de drieling vergeleken, daarna het paar.',
      'Vijf kaarten van dezelfde kleur, niet op volgorde. Kaart voor kaart vergeleken vanaf de hoogste ; geen enkele kleur gaat boven een andere.',
      'Vijf opeenvolgende kaarten van gemengde kleuren. De aas telt hoog (10-J-Q-K-A) of laag (A-2-3-4-5), nooit allebei tegelijk.',
      'Drie kaarten van dezelfde waarde, plus twee losse kaarten.',
      'Twee verschillende paren plus een vijfde kaart. Eerst telt het hoogste paar, dan het laagste, dan de kicker.',
      'Twee kaarten van dezelfde waarde plus drie losse kaarten, op volgorde vergeleken.',
      'Geen van bovenstaande. De hoogste kaart beslist, dan de volgende, enzovoort.'
    ],
    dealt: 'komt voor in %s van de handen van zeven kaarten',
    tiesH2: 'Hoe gelijke handen worden beslist',
    tiesP: 'Vergelijk eerst de categorie : elke flush verslaat elke straat, ongeacht de kaarten. Binnen dezelfde categorie vergelijk je waarde voor waarde vanaf boven. Wat na de combinatie overblijft heet de <em>kicker</em>, en die beslist meer handen dan beginners verwachten : A♠ K♦ en A♣ 7♥ maken allebei een paar azen op een bord A-9-4, maar de heer verslaat de zeven. Kleuren beslissen bij Hold’em nooit — twee spelers met dezelfde vijf waarden delen de pot, tot de laatste fiche.',
    wrongH2: 'Wat men vaak verkeerd heeft',
    wrong: [
      'De aas is voor een straat zowel de hoogste als de laagste kaart : A-K-Q-J-10 is de beste, A-2-3-4-5 (het <em>wiel</em>) de zwakste. De reeks loopt niet rond — Q-K-A-2-3 is helemaal niets.',
      'Een flush bestaat uit vijf kaarten van één kleur, niet vier. Vier harten tussen je hand en het bord zijn op zichzelf niets waard.',
      'Een drieling uit een paar in je hand plus één kaart op het bord heet een <em>set</em> ; uit één kaart in je hand plus een paar op het bord heet het <em>trips</em>. Dezelfde rangschikking, heel andere sterkte, want trips ziet iedereen.',
      'Alleen de beste vijf tellen. Twee paar in handen en een derde paar op het bord levert twee paar op, geen drie.',
      'De percentages hierboven zeggen hoe vaak elke hand tot en met de river over zeven kaarten voorkomt, niet hoe vaak hij wint. Twee paar lijkt gewoon en staat toch voor op het meeste wat het tegenkomt.'
    ],
    seeH2: 'Aan tafel zien',
    seeP: 'PokerTH noemt je huidige beste hand onder het bord terwijl je speelt, zodat je hem nooit onder tijdsdruk zelf hoeft uit te rekenen, en toont bij de showdown elke open hand met de vijf kaarten die telden gemarkeerd. Offline oefenen tegen de computertegenstanders is de snelste manier om de volgorde in je vingers te krijgen.'
  }
,

  pl: {
    title: "Układy w pokerze — kolejność kart w Texas Hold’em",
    desc: "Wszystkie dziesięć układów pokerowych Texas Hold’em, od pokera królewskiego po wysoką kartę, z przykładami, prawdopodobieństwem każdego z nich oraz zasadami rozstrzygania remisów.",
    ldHeadline: "Układy w pokerze — Texas Hold’em",
    ldDesc: "Dziesięć układów Texas Hold’em po kolei, z przykładami, częstością występowania i zasadami remisów.",
    h1: "Układy w pokerze",
    lead: "W Texas Hold’em układy są uszeregowane od najsilniejszego do najsłabszego w następujący sposób. Układ to zawsze dokładnie pięć kart, wybranych spośród siedmiu, które widzisz: twoich dwóch kart własnych i pięciu kart wspólnych. Nie musisz używać własnych kart — jeśli najlepszą piątkę tworzy sam stół, to również jest twój układ.",
    names: ["Poker królewski", "Strit fleszowy", "Kareta", "Full", "Kolor", "Strit", "Trójka", "Dwie pary", "Para", "Wysoka karta"],
    texts: [
      "A K Q J 10 w jednym kolorze. Najlepszy możliwy układ: nie da się go pokonać, można go jedynie wyrównać.",
      "Pięć kolejnych kart w jednym kolorze. Spośród dwóch stritów fleszowych wygrywa ten z wyższą kartą.",
      "Cztery karty tej samej wysokości. Piąta karta (kicker) rozstrzyga rzadki remis, gdy kareta leży na stole.",
      "Trójka i para. Najpierw porównuje się trójkę, potem parę.",
      "Pięć kart w jednym kolorze, nie po kolei. Porównuje się je kolejno od najwyższej; żaden kolor nie stoi wyżej od innego.",
      "Pięć kolejnych kart w różnych kolorach. As gra u góry (10-J-Q-K-A) albo na dole (A-2-3-4-5), nigdy w obie strony naraz.",
      "Trzy karty tej samej wysokości plus dwie niepowiązane karty.",
      "Dwie różne pary i piąta karta. Porównuje się najpierw wyższą parę, potem niższą, potem kickera.",
      "Dwie karty tej samej wysokości plus trzy niepowiązane karty, porównywane po kolei.",
      "Żaden z powyższych układów. Decyduje najwyższa karta, potem następna i tak dalej."
    ],
    dealt: "występuje w %s układów z siedmiu kart",
    tiesH2: "Jak rozstrzyga się remisy",
    tiesP: "Najpierw porównuje się kategorię: każdy kolor bije każdego strita, bez względu na karty. W obrębie tej samej kategorii porównuje się wysokość po wysokości, od góry. To, co zostaje poza układem, nazywa się <em>kickerem</em> i rozstrzyga znacznie więcej rozdań, niż początkujący się spodziewają: A♠ K♦ i A♣ 7♥ dają na stole A-9-4 parę asów, ale król bije siódemkę. Kolory nigdy nie rozstrzygają remisu w Hold’em — dwóch graczy z tymi samymi pięcioma wysokościami dzieli pulę, co do ostatniego żetonu.",
    wrongH2: "Najczęstsze nieporozumienia",
    wrong: [
      "As jest jednocześnie najwyższą i najniższą kartą strita: A-K-Q-J-10 to najlepszy, A-2-3-4-5 (tak zwane <em>koło</em>) najsłabszy. Sekwencja nie zawija się — Q-K-A-2-3 nie jest niczym.",
      "Kolor to pięć kart jednego koloru, nie cztery. Cztery kiery między ręką a stołem same w sobie nic nie znaczą.",
      "Trójka złożona z pary w ręce i jednej karty ze stołu to <em>set</em>; z jednej karty w ręce i pary na stole to <em>trips</em>. Ta sama kategoria, bardzo różna siła, bo trips widzą wszyscy.",
      "Liczy się tylko najlepsza piątka. Dwie pary w ręce i trzecia para na stole dają dwie pary, nie trzy.",
      "Powyższe procenty mówią, jak często dany układ w ogóle powstaje do rivera na siedmiu kartach, a nie jak często wygrywa. Dwie pary wyglądają pospolicie, a i tak biją większość tego, co spotykają."
    ],
    seeH2: "Jak to wygląda przy stole",
    seeP: "PokerTH podaje nazwę twojego aktualnie najlepszego układu pod stołem w trakcie gry, więc nigdy nie musisz go składać pod presją czasu, a przy showdownie pokazuje każdy odkryty układ z podświetlonymi pięcioma kartami, które się liczyły. Trening offline przeciwko przeciwnikom sterowanym przez komputer to najszybszy sposób, żeby wbić sobie tę kolejność w palce."
  },

  ru: {
    title: "Комбинации в покере — старшинство рук в техасском холдеме",
    desc: "Все десять покерных комбинаций техасского холдема по старшинству, от флеш-рояля до старшей карты, с примерами, вероятностью каждой и правилами разрешения ничьих.",
    ldHeadline: "Комбинации в покере — техасский холдем",
    ldDesc: "Десять комбинаций техасского холдема по порядку, с примерами, частотой выпадения и правилами кикера.",
    h1: "Комбинации в покере",
    lead: "В техасском холдеме руки располагаются от сильнейшей к слабейшей так. Рука — это всегда ровно пять карт, выбранных из семи, которые вы видите: двух ваших закрытых и пяти общих. Использовать свои карты вы не обязаны — если лучшую пятёрку составляет сам борд, это тоже ваша рука.",
    names: ["Флеш-рояль", "Стрит-флеш", "Каре", "Фулл-хаус", "Флеш", "Стрит", "Тройка", "Две пары", "Пара", "Старшая карта"],
    texts: [
      "A K Q J 10 одной масти. Лучшая возможная рука: её нельзя побить, можно только повторить.",
      "Пять карт подряд одной масти. Из двух стрит-флешей выигрывает тот, у кого старше верхняя карта.",
      "Четыре карты одного достоинства. Пятая карта (кикер) решает редкую ничью, когда каре лежит на борде.",
      "Тройка вместе с парой. Сначала сравнивают тройку, затем пару.",
      "Пять карт одной масти, не подряд. Сравниваются по одной сверху вниз; ни одна масть не старше другой.",
      "Пять карт подряд разных мастей. Туз играет сверху (10-J-Q-K-A) или снизу (A-2-3-4-5), но никогда одновременно.",
      "Три карты одного достоинства плюс две несвязанные карты.",
      "Две разные пары плюс пятая карта. Сначала сравнивают старшую пару, затем младшую, затем кикер.",
      "Две карты одного достоинства плюс три несвязанные карты, сравниваемые по порядку.",
      "Ничего из перечисленного. Решает старшая карта, затем следующая, и так далее."
    ],
    dealt: "встречается в %s рук из семи карт",
    tiesH2: "Как разрешаются ничьи",
    tiesP: "Сначала сравнивают категорию: любой флеш бьёт любой стрит, какими бы ни были карты. Внутри одной категории сравнивают достоинства сверху вниз. То, что остаётся после комбинации, называется <em>кикером</em>, и он решает куда больше раздач, чем ожидают новички: A♠ K♦ и A♣ 7♥ на борде A-9-4 дают пару тузов, но король перебивает семёрку. Масти в холдеме никогда не разрешают ничью — два игрока с одинаковыми пятью достоинствами делят банк до последней фишки.",
    wrongH2: "Частые заблуждения",
    wrong: [
      "Туз для стрита одновременно и старшая, и младшая карта: A-K-Q-J-10 — лучший стрит, A-2-3-4-5 (так называемое <em>колесо</em>) — худший. Последовательность не замыкается: Q-K-A-2-3 не стоит вообще ничего.",
      "Флеш — это пять карт одной масти, а не четыре. Четыре червы между рукой и бордом сами по себе ничего не стоят.",
      "Тройка, собранная из пары в руке и одной карты на борде, называется <em>сет</em>; из одной карты в руке и пары на борде — <em>трипс</em>. Категория та же, сила совсем разная, потому что трипс виден всем.",
      "Считаются только лучшие пять карт. Две пары на руках и третья пара на борде дают две пары, а не три.",
      "Проценты выше показывают, как часто комбинация вообще складывается к риверу на семи картах, а не как часто она выигрывает. Две пары выглядят обыденно и всё же опережают большую часть того, что им встречается."
    ],
    seeH2: "Как это видно за столом",
    seeP: "PokerTH называет вашу текущую лучшую комбинацию под бордом прямо во время игры, так что её никогда не приходится собирать в голове под таймер, а на вскрытии показывает каждую открытую руку с подсветкой тех пяти карт, которые сыграли. Тренировка офлайн против компьютерных соперников — самый быстрый способ довести это старшинство до автоматизма."
  },

  tr: {
    title: "Poker el sıralaması — Texas Hold’em el sırası",
    desc: "Texas Hold’em pokerinin on elinin floş royalden yüksek karta sıralaması: örnekler, her elin gelme olasılığı ve kicker ile beraberliklerin nasıl çözüldüğü.",
    ldHeadline: "Poker el sıralaması — Texas Hold’em",
    ldDesc: "Texas Hold’em’in on eli sırasıyla; örnekler, sıklıklar ve beraberlik kuralları.",
    h1: "Poker el sıralaması",
    lead: "Texas Hold’em’de eller en güçlüden en zayıfa şöyle sıralanır. Bir el her zaman tam olarak beş karttır ve gördüğünüz yedi kart arasından seçilir: iki kapalı kartınız ve beş ortak kart. Kendi kartlarınızı kullanmak zorunda değilsiniz — en iyi beşliyi masanın kendisi oluşturuyorsa o da sizin elinizdir.",
    names: ["Floş Royal", "Sıralı Floş", "Kare", "Full", "Floş", "Kent", "Üçlü", "İki Çift", "Çift", "Yüksek Kart"],
    texts: [
      "Aynı sembolden A K Q J 10. Mümkün olan en iyi el: yenilemez, yalnızca eşitlenebilir.",
      "Aynı sembolden art arda beş kart. İki sıralı floş arasında üstteki kartı yüksek olan kazanır.",
      "Aynı değerden dört kart. Beşinci kart (kicker) kare masada olduğunda çıkan nadir beraberliği çözer.",
      "Bir üçlü ve bir çift. Önce üçlü, sonra çift karşılaştırılır.",
      "Aynı sembolden beş kart, sıralı olmadan. Yukarıdan aşağıya tek tek karşılaştırılır; hiçbir sembol diğerinden üstün değildir.",
      "Art arda beş kart, semboller karışık. As yukarıda (10-J-Q-K-A) ya da aşağıda (A-2-3-4-5) oynar, ikisi birden asla olmaz.",
      "Aynı değerden üç kart ve ilgisiz iki kart.",
      "Farklı iki çift ve beşinci bir kart. Önce yüksek çift, sonra düşük çift, sonra kicker karşılaştırılır.",
      "Aynı değerden iki kart ve ilgisiz üç kart, sırayla karşılaştırılır.",
      "Yukarıdakilerin hiçbiri. En yüksek kart belirler, sonra bir sonraki, ve böyle devam eder."
    ],
    dealt: "yedi kartlık ellerin %s kadarında görülür",
    tiesH2: "Beraberlikler nasıl çözülür",
    tiesP: "Önce kategoriye bakılır: kartlar ne olursa olsun her floş her kenti yener. Aynı kategori içinde yukarıdan aşağıya değer değer karşılaştırılır. Kombinasyondan artan karta <em>kicker</em> denir ve yeni başlayanların sandığından çok daha fazla eli o belirler: A♠ K♦ ile A♣ 7♥, A-9-4 masasında ikisi de as çifti yapar ama papaz yediyi geçer. Hold’em’de semboller beraberliği asla bozmaz — aynı beş değere sahip iki oyuncu potu son çipe kadar paylaşır.",
    wrongH2: "Sık yapılan yanlışlar",
    wrong: [
      "As bir kent için hem en yüksek hem en düşük karttır: A-K-Q-J-10 en iyisi, A-2-3-4-5 (<em>tekerlek</em>) en zayıfı. Dizi başa dönmez — Q-K-A-2-3 hiçbir şey değildir.",
      "Floş, bir sembolden dört değil beş karttır. Elinizle masada toplam dört kupa tek başına hiçbir işe yaramaz.",
      "Elinizdeki çift ile masadaki bir karttan oluşan üçlüye <em>set</em>, elinizdeki bir kart ile masadaki çiftten oluşana <em>trips</em> denir. Sıralaması aynı, gücü çok farklıdır, çünkü trips’i herkes görür.",
      "Yalnızca en iyi beş kart sayılır. Elinizde iki çift, masada üçüncü bir çift varsa eliniz iki çifttir, üç değil.",
      "Yukarıdaki yüzdeler her elin yedi kart üzerinden river’a kadar ne sıklıkta oluştuğunu gösterir, ne sıklıkta kazandığını değil. İki çift sıradan görünür ama karşılaştığı şeylerin çoğunun önündedir."
    ],
    seeH2: "Masada görmek",
    seeP: "PokerTH oynarken mevcut en iyi elinizin adını masanın altında gösterir, böylece süre baskısı altında bunu kafanızdan çıkarmak zorunda kalmazsınız; showdown’da ise açılan her eli, sayılan beş kart vurgulanmış olarak gösterir. Bilgisayar rakiplerine karşı çevrimdışı çalışmak bu sıralamayı parmaklarınıza yerleştirmenin en hızlı yoludur."
  },

  uk: {
    title: "Комбінації в покері — старшинство рук у техаському холдемі",
    desc: "Усі десять покерних комбінацій техаського холдему за старшинством, від флеш-роялю до старшої карти, з прикладами, ймовірністю кожної та правилами розв’язання нічиїх.",
    ldHeadline: "Комбінації в покері — техаський холдем",
    ldDesc: "Десять комбінацій техаського холдему по порядку, з прикладами, частотою та правилами кікера.",
    h1: "Комбінації в покері",
    lead: "У техаському холдемі руки шикуються від найсильнішої до найслабшої так. Рука — це завжди рівно п’ять карт, обраних із семи, які ви бачите: двох ваших закритих і п’яти спільних. Використовувати власні карти ви не зобов’язані — якщо найкращу п’ятірку складає сам борд, це теж ваша рука.",
    names: ["Флеш-рояль", "Стрит-флеш", "Каре", "Фул-хаус", "Флеш", "Стрит", "Трійка", "Дві пари", "Пара", "Старша карта"],
    texts: [
      "A K Q J 10 однієї масті. Найкраща можлива рука: її не можна побити, лише повторити.",
      "П’ять карт поспіль однієї масті. З двох стрит-флешів виграє той, у кого старша верхня карта.",
      "Чотири карти одного номіналу. П’ята карта (кікер) вирішує рідкісну нічию, коли каре лежить на борді.",
      "Трійка разом із парою. Спершу порівнюють трійку, потім пару.",
      "П’ять карт однієї масті, не поспіль. Порівнюються по одній згори вниз; жодна масть не старша за іншу.",
      "П’ять карт поспіль різних мастей. Туз грає згори (10-J-Q-K-A) або знизу (A-2-3-4-5), але ніколи одночасно.",
      "Три карти одного номіналу плюс дві не пов’язані карти.",
      "Дві різні пари плюс п’ята карта. Спершу порівнюють старшу пару, потім молодшу, потім кікер.",
      "Дві карти одного номіналу плюс три не пов’язані карти, які порівнюють по порядку.",
      "Нічого з переліченого. Вирішує старша карта, потім наступна, і так далі."
    ],
    dealt: "трапляється в %s рук із семи карт",
    tiesH2: "Як розв’язуються нічиї",
    tiesP: "Спершу порівнюють категорію: будь-який флеш б’є будь-який стрит, хай які карти. У межах однієї категорії порівнюють номінали згори вниз. Те, що лишається після комбінації, називають <em>кікером</em>, і він вирішує значно більше роздач, ніж очікують новачки: A♠ K♦ і A♣ 7♥ на борді A-9-4 дають пару тузів, але король перебиває сімку. Масті в холдемі ніколи не розв’язують нічию — двоє гравців з однаковими п’ятьма номіналами ділять банк до останньої фішки.",
    wrongH2: "Поширені хиби",
    wrong: [
      "Туз для стрита водночас і найстарша, і наймолодша карта: A-K-Q-J-10 — найкращий, A-2-3-4-5 (так зване <em>колесо</em>) — найслабший. Послідовність не замикається: Q-K-A-2-3 не варте нічого.",
      "Флеш — це п’ять карт однієї масті, а не чотири. Чотири чирви між рукою і бордом самі по собі нічого не варті.",
      "Трійка, зібрана з пари в руці та однієї карти на борді, зветься <em>сет</em>; з однієї карти в руці та пари на борді — <em>трипс</em>. Категорія та сама, сила зовсім різна, бо трипс бачать усі.",
      "Рахуються лише найкращі п’ять карт. Дві пари в руках і третя пара на борді дають дві пари, а не три.",
      "Відсотки вище показують, як часто комбінація взагалі складається до риверу на семи картах, а не як часто вона виграє. Дві пари виглядають буденно і все одно випереджають більшість того, що їм трапляється."
    ],
    seeH2: "Як це видно за столом",
    seeP: "PokerTH називає вашу поточну найкращу комбінацію під бордом просто під час гри, тож її ніколи не доводиться складати подумки під таймер, а на розкритті показує кожну відкриту руку з підсвіченими п’ятьма картами, які зіграли. Тренування офлайн проти комп’ютерних суперників — найшвидший спосіб довести це старшинство до автоматизму."
  },

  zh: {
    title: "扑克牌型大小 — 德州扑克牌型排名",
    desc: "德州扑克全部十种牌型从皇家同花顺到高牌的排序，附示例、每种牌型出现的概率，以及踢脚牌和平局的判定方式。",
    ldHeadline: "扑克牌型大小 — 德州扑克",
    ldDesc: "德州扑克十种牌型依次排列，附示例、出现频率与平局判定规则。",
    h1: "扑克牌型大小",
    lead: "德州扑克的牌型从大到小排列如下。一手牌永远正好是五张，从你能看到的七张里选出：你的两张底牌和五张公共牌。你并不一定要用自己的底牌——如果公共牌本身就组成最好的五张，那同样是你的牌。",
    names: ["皇家同花顺", "同花顺", "四条", "葫芦", "同花", "顺子", "三条", "两对", "一对", "高牌"],
    texts: [
      "同花色的 A K Q J 10。可能出现的最大牌型：无法被击败，只能打平。",
      "同花色的五张连续牌。两副同花顺相比，最大的那张牌更大者获胜。",
      "四张相同点数的牌。第五张牌（踢脚牌）用于判定四条出现在公共牌上的罕见平局。",
      "三条加一对。先比三条，再比对子。",
      "五张同花色但不连续的牌。从最大的一张开始逐张比较；花色之间没有大小之分。",
      "五张连续但花色不一致的牌。A 可以当最大（10-J-Q-K-A）或最小（A-2-3-4-5），但不能同时兼顾。",
      "三张相同点数的牌，加两张无关的牌。",
      "两组不同的对子加第五张牌。先比大对，再比小对，最后比踢脚牌。",
      "两张相同点数的牌加三张无关的牌，依次比较。",
      "以上都不是。由最大的一张牌决定，然后是下一张，依此类推。"
    ],
    dealt: "在七张牌中出现的概率为 %s",
    tiesH2: "平局如何判定",
    tiesP: "先比牌型类别：无论具体牌面，任何同花都大过任何顺子。同一类别之内，从大到小逐个点数比较。组成牌型之后剩下的牌称为<em>踢脚牌</em>，它决定的牌局远比初学者想象的多：在 A-9-4 的公共牌上，A♠ K♦ 和 A♣ 7♥ 都是一对 A，但 K 压过 7。德州扑克中花色从不用来判定大小——五张点数完全相同的两名玩家平分底池，直到最后一枚筹码。",
    wrongH2: "常见的误解",
    wrong: [
      "组成顺子时，A 既是最大的牌也是最小的牌：A-K-Q-J-10 最大，A-2-3-4-5（即<em>轮子</em>）最小。顺序不会首尾相接——Q-K-A-2-3 什么都不是。",
      "同花是五张同花色的牌，不是四张。手牌加公共牌一共四张红心，本身毫无价值。",
      "用手中的一对加公共牌上的一张组成的三条叫 <em>set</em>；用手中的一张加公共牌上的一对组成的叫 <em>trips</em>。牌型相同，强度却大不一样，因为 trips 所有人都看得见。",
      "只有最好的五张才算数。手上两对、公共牌上还有第三对，你的牌仍然是两对，而不是三对。",
      "上面的百分比表示每种牌型在七张牌中到河牌为止出现的频率，而不是它获胜的频率。两对看起来很普通，却依然领先于它所遇到的大部分牌。"
    ],
    seeH2: "在牌桌上看到它",
    seeP: "游戏过程中，PokerTH 会在公共牌下方标出你当前的最佳牌型，你不必在时间压力下自己去凑；摊牌时则会把每一手亮出的牌连同真正生效的那五张一起高亮显示。离线对战电脑对手是把这套牌型大小练成本能的最快方式。"
  },

  ja: {
    title: "ポーカーの役の強さ — テキサスホールデムの役一覧",
    desc: "テキサスホールデムの10種類の役をロイヤルフラッシュからハイカードまで順に解説。例、それぞれの出現率、キッカーと同点時の決着方法も掲載しています。",
    ldHeadline: "ポーカーの役の強さ — テキサスホールデム",
    ldDesc: "テキサスホールデムの10の役を強い順に、例・出現率・同点時のルールとともに。",
    h1: "ポーカーの役の強さ",
    lead: "テキサスホールデムの役は、強い順に次のように並びます。役は必ずちょうど5枚で、見えている7枚——自分のホールカード2枚とコミュニティカード5枚——から選びます。自分の手札を使う義務はありません。ボードだけで最強の5枚ができるなら、それもあなたの役です。",
    names: ["ロイヤルフラッシュ", "ストレートフラッシュ", "フォーカード", "フルハウス", "フラッシュ", "ストレート", "スリーカード", "ツーペア", "ワンペア", "ハイカード"],
    texts: [
      "同じスートの A K Q J 10。考えうる最強の役で、負けることはなく、引き分けになるだけです。",
      "同じスートの5枚連続。ストレートフラッシュ同士では、一番上のカードが高いほうが勝ちます。",
      "同じランクの4枚。5枚目（キッカー）は、フォーカードがボードにある稀な同点を決めるときに使われます。",
      "スリーカードとワンペアの組み合わせ。まずスリーカードを比べ、次にペアを比べます。",
      "同じスートの5枚で、連続していないもの。上から1枚ずつ比較します。スートに上下はありません。",
      "スートが揃わない5枚連続。エースは上（10-J-Q-K-A）か下（A-2-3-4-5）のどちらかで働き、同時に両方にはなりません。",
      "同じランクの3枚と、無関係な2枚。",
      "異なる2組のペアと5枚目のカード。上のペア、下のペア、キッカーの順に比べます。",
      "同じランクの2枚と、無関係な3枚を順に比較します。",
      "上のいずれでもない役。一番高いカードで決まり、同じなら次のカードへ進みます。"
    ],
    dealt: "7枚のうちに完成する確率は %s",
    tiesH2: "同点はどう決まるか",
    tiesP: "まず役の種類を比べます。カードが何であれ、フラッシュはあらゆるストレートに勝ちます。同じ種類どうしなら、上からランクを1つずつ比べます。役に使われずに残った札を<em>キッカー</em>と呼び、初心者が思う以上に多くのハンドがこれで決まります。ボードが A-9-4 のとき、A♠ K♦ と A♣ 7♥ はどちらもエースのワンペアですが、K が 7 を上回ります。ホールデムではスートで優劣がつくことは決してなく、同じ5つのランクなら最後のチップまでポットを山分けします。",
    wrongH2: "よくある勘違い",
    wrong: [
      "ストレートにおいて、エースは最も高いカードであると同時に最も低いカードでもあります。A-K-Q-J-10 が最強、A-2-3-4-5（<em>ホイール</em>）が最弱です。数字は一周しません。Q-K-A-2-3 は何の役にもなりません。",
      "フラッシュは同じスート5枚であって、4枚ではありません。手札とボードを合わせてハートが4枚あっても、それだけでは無価値です。",
      "手札のペアとボードの1枚でできたスリーカードを <em>set</em>、手札の1枚とボードのペアでできたものを <em>trips</em> と呼びます。役の強さは同じでも実際の強さは大きく異なります。trips は全員に見えているからです。",
      "数えるのは最良の5枚だけです。ツーペアを持っていてボードにもう1組ペアがあっても、役はツーペアであってスリーペアではありません。",
      "上の百分率は、7枚のうちリバーまでにその役が完成する頻度であって、勝つ頻度ではありません。ツーペアはありふれて見えますが、それでも出会う相手の大半より上です。"
    ],
    seeH2: "テーブルでの見え方",
    seeP: "PokerTH はプレイ中、ボードの下に現在の最強の役の名前を表示するので、時間に追われながら自分で組み立てる必要はありません。ショーダウンでは、公開された各ハンドについて実際に使われた5枚がハイライトされます。オフラインでコンピュータの相手と練習するのが、この順位を体に覚えさせる一番の近道です。"
  },

  ko: {
    title: "포커 족보 — 텍사스 홀덤 핸드 순위",
    desc: "텍사스 홀덤 포커의 열 가지 핸드를 로열 플러시부터 하이 카드까지 순서대로 정리했습니다. 예시, 각 핸드가 나올 확률, 키커와 동점 처리 방법까지 함께 설명합니다.",
    ldHeadline: "포커 족보 — 텍사스 홀덤",
    ldDesc: "텍사스 홀덤의 열 가지 핸드를 순서대로, 예시와 출현 빈도, 동점 규칙과 함께 정리했습니다.",
    h1: "포커 족보",
    lead: "텍사스 홀덤의 핸드는 강한 것부터 약한 것까지 다음 순서로 정해집니다. 핸드는 언제나 정확히 다섯 장이며, 눈에 보이는 일곱 장 — 내 홀 카드 두 장과 커뮤니티 카드 다섯 장 — 중에서 고릅니다. 내 카드를 반드시 써야 하는 것은 아닙니다. 보드만으로 최고의 다섯 장이 만들어진다면 그것도 내 핸드입니다.",
    names: ["로열 플러시", "스트레이트 플러시", "포 오브 어 카인드", "풀하우스", "플러시", "스트레이트", "쓰리 오브 어 카인드", "투페어", "원페어", "하이 카드"],
    texts: [
      "같은 무늬의 A K Q J 10. 가능한 가장 높은 핸드로, 지는 일은 없고 비길 수만 있습니다.",
      "같은 무늬로 이어지는 다섯 장. 스트레이트 플러시끼리는 맨 위 카드가 높은 쪽이 이깁니다.",
      "같은 숫자 네 장. 다섯 번째 카드(키커)는 포카드가 보드에 깔린 드문 동점을 가릅니다.",
      "트리플과 페어의 조합. 트리플을 먼저 비교하고 그다음에 페어를 봅니다.",
      "같은 무늬 다섯 장이지만 이어지지는 않는 핸드. 높은 카드부터 한 장씩 비교하며, 무늬 사이에 우열은 없습니다.",
      "무늬가 섞인 다섯 장 연속. 에이스는 위(10-J-Q-K-A)나 아래(A-2-3-4-5) 한쪽으로만 쓰이며 동시에 둘 다는 안 됩니다.",
      "같은 숫자 세 장에 관련 없는 두 장.",
      "서로 다른 두 페어에 다섯 번째 카드. 높은 페어, 낮은 페어, 키커 순으로 비교합니다.",
      "같은 숫자 두 장에 관련 없는 세 장을 순서대로 비교합니다.",
      "위의 어느 것도 아닌 경우. 가장 높은 카드가 결정하고, 같으면 그다음 카드로 넘어갑니다."
    ],
    dealt: "일곱 장 중 %s의 확률로 완성",
    tiesH2: "동점은 어떻게 가리나",
    tiesP: "먼저 족보의 종류를 비교합니다. 카드가 무엇이든 플러시는 어떤 스트레이트보다도 높습니다. 같은 종류라면 위에서부터 숫자를 하나씩 비교합니다. 조합을 만들고 남은 카드를 <em>키커</em>라고 하며, 초보자가 생각하는 것보다 훨씬 많은 판이 이것으로 갈립니다. 보드가 A-9-4일 때 A♠ K♦와 A♣ 7♥는 둘 다 에이스 원페어지만 K가 7을 앞섭니다. 홀덤에서 무늬로 우열을 가리는 일은 결코 없으며, 다섯 숫자가 같은 두 플레이어는 마지막 칩까지 팟을 나눠 가집니다.",
    wrongH2: "자주 틀리는 부분",
    wrong: [
      "스트레이트에서 에이스는 가장 높은 카드이자 가장 낮은 카드입니다. A-K-Q-J-10이 가장 높고 A-2-3-4-5(이른바 <em>휠</em>)가 가장 낮습니다. 숫자는 한 바퀴 돌지 않습니다. Q-K-A-2-3은 아무것도 아닙니다.",
      "플러시는 같은 무늬 다섯 장이지 네 장이 아닙니다. 손패와 보드를 합쳐 하트가 네 장 있어도 그 자체로는 아무 가치가 없습니다.",
      "손에 든 페어와 보드의 한 장으로 만든 트리플은 <em>set</em>, 손에 든 한 장과 보드의 페어로 만든 것은 <em>trips</em>라고 합니다. 족보는 같지만 실제 강도는 크게 다릅니다. trips는 모두에게 보이기 때문입니다.",
      "오직 가장 좋은 다섯 장만 셉니다. 투페어를 들고 보드에 세 번째 페어가 있어도 핸드는 투페어이지 쓰리페어가 아닙니다.",
      "위의 백분율은 일곱 장 기준으로 리버까지 각 핸드가 만들어지는 빈도이지 이기는 빈도가 아닙니다. 투페어는 흔해 보이지만 마주치는 대부분의 핸드보다 앞섭니다."
    ],
    seeH2: "테이블에서 확인하기",
    seeP: "PokerTH는 게임 중 보드 아래에 현재 내 최고 핸드의 이름을 표시하므로 시간에 쫓기며 직접 계산할 필요가 없습니다. 쇼다운에서는 공개된 각 핸드에서 실제로 쓰인 다섯 장을 강조해 보여 줍니다. 컴퓨터 상대와 오프라인으로 연습하는 것이 이 순위를 몸에 익히는 가장 빠른 방법입니다."
  },

  id: {
    title: "Peringkat kartu poker — urutan kartu Texas Hold’em",
    desc: "Sepuluh susunan kartu poker Texas Hold’em dari royal flush sampai kartu tinggi, lengkap dengan contoh, peluang munculnya masing-masing, serta cara kicker dan hasil seri ditentukan.",
    ldHeadline: "Peringkat kartu poker — Texas Hold’em",
    ldDesc: "Sepuluh susunan kartu Texas Hold’em berurutan, dengan contoh, frekuensi, dan aturan penentuan seri.",
    h1: "Peringkat kartu poker",
    lead: "Di Texas Hold’em, susunan kartu diurutkan dari yang terkuat sampai yang terlemah seperti berikut. Satu susunan selalu terdiri atas tepat lima kartu, dipilih dari tujuh yang terlihat: dua kartu tertutup Anda dan lima kartu bersama. Anda tidak wajib memakai kartu sendiri — kalau meja saja sudah membentuk lima kartu terbaik, itu juga susunan Anda.",
    names: ["Royal Flush", "Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind", "Two Pair", "One Pair", "High Card"],
    texts: [
      "A K Q J 10 dengan jenis yang sama. Susunan terbaik yang mungkin: tidak bisa dikalahkan, hanya bisa seri.",
      "Lima kartu berurutan dengan jenis yang sama. Di antara dua straight flush, kartu teratas yang lebih tinggi menang.",
      "Empat kartu bernilai sama. Kartu kelima (kicker) menentukan hasil seri langka ketika keempatnya ada di meja.",
      "Tiga kartu sama ditambah satu pasang. Yang dibandingkan lebih dulu adalah tiga kartunya, baru pasangannya.",
      "Lima kartu berjenis sama tetapi tidak berurutan. Dibandingkan satu per satu dari yang tertinggi; tidak ada jenis yang lebih tinggi dari jenis lain.",
      "Lima kartu berurutan dengan jenis campur. As berlaku di atas (10-J-Q-K-A) atau di bawah (A-2-3-4-5), tidak pernah keduanya sekaligus.",
      "Tiga kartu bernilai sama, ditambah dua kartu lepas.",
      "Dua pasang berbeda ditambah kartu kelima. Pasangan tertinggi dibandingkan lebih dulu, lalu yang lebih rendah, lalu kicker.",
      "Dua kartu bernilai sama ditambah tiga kartu lepas, dibandingkan berurutan.",
      "Bukan salah satu di atas. Kartu tertinggi yang menentukan, lalu berikutnya, dan seterusnya."
    ],
    dealt: "muncul pada %s dari susunan tujuh kartu",
    tiesH2: "Cara hasil seri ditentukan",
    tiesP: "Bandingkan kategorinya lebih dulu: flush apa pun mengalahkan straight apa pun, berapa pun kartunya. Dalam kategori yang sama, bandingkan nilai demi nilai dari atas. Kartu yang tersisa setelah susunan terbentuk disebut <em>kicker</em>, dan ia menentukan jauh lebih banyak permainan daripada yang diduga pemula: A♠ K♦ dan A♣ 7♥ sama-sama membentuk sepasang As di meja A-9-4, tetapi King mengungguli angka tujuh. Jenis kartu tidak pernah memutuskan seri di Hold’em — dua pemain dengan lima nilai yang sama membagi pot sampai chip terakhir.",
    wrongH2: "Hal yang sering disalahpahami",
    wrong: [
      "As sekaligus kartu tertinggi dan terendah untuk sebuah straight: A-K-Q-J-10 yang terbaik, A-2-3-4-5 (disebut <em>wheel</em>) yang terlemah. Urutannya tidak berputar — Q-K-A-2-3 sama sekali bukan apa-apa.",
      "Flush adalah lima kartu sejenis, bukan empat. Empat kartu hati di tangan dan di meja tidak berarti apa-apa dengan sendirinya.",
      "Three of a kind dari sepasang kartu di tangan ditambah satu kartu di meja disebut <em>set</em>; dari satu kartu di tangan ditambah sepasang di meja disebut <em>trips</em>. Peringkatnya sama, kekuatannya jauh berbeda, karena trips terlihat oleh semua orang.",
      "Hanya lima kartu terbaik yang dihitung. Punya dua pasang lalu ada pasangan ketiga di meja tetap berarti two pair, bukan tiga pasang.",
      "Persentase di atas menunjukkan seberapa sering tiap susunan terbentuk sampai river dari tujuh kartu, bukan seberapa sering ia menang. Two pair terlihat biasa saja tetapi tetap unggul atas sebagian besar yang ditemuinya."
    ],
    seeH2: "Melihatnya di meja",
    seeP: "PokerTH menuliskan nama susunan terbaik Anda saat itu di bawah meja selama permainan, jadi Anda tidak pernah harus menghitungnya sendiri dikejar waktu, dan saat showdown menampilkan setiap kartu yang dibuka dengan lima kartu yang benar-benar dipakai disorot. Berlatih offline melawan lawan komputer adalah cara tercepat membuat urutan ini melekat."
  },

  vi: {
    title: "Thứ tự các tay bài poker — xếp hạng bài Texas Hold’em",
    desc: "Toàn bộ mười tay bài poker Texas Hold’em xếp từ thùng phá sảnh rồng đến mậu thầu, kèm ví dụ, xác suất của từng tay bài và cách phân định khi hai bên bằng nhau.",
    ldHeadline: "Thứ tự các tay bài poker — Texas Hold’em",
    ldDesc: "Mười tay bài Texas Hold’em theo thứ tự, kèm ví dụ, tần suất và quy tắc phân định hòa.",
    h1: "Thứ tự các tay bài poker",
    lead: "Trong Texas Hold’em, các tay bài được xếp từ mạnh đến yếu như sau. Một tay bài luôn gồm đúng năm lá, chọn trong bảy lá bạn nhìn thấy: hai lá tẩy của bạn và năm lá bài chung. Bạn không bắt buộc phải dùng lá của mình — nếu riêng bài chung đã tạo thành năm lá tốt nhất thì đó cũng là tay bài của bạn.",
    names: ["Thùng phá sảnh rồng", "Thùng phá sảnh", "Tứ quý", "Cù lũ", "Thùng", "Sảnh", "Sám cô", "Thú (hai đôi)", "Đôi", "Mậu thầu"],
    texts: [
      "A K Q J 10 cùng một chất. Tay bài mạnh nhất có thể có: không thể bị đánh bại, chỉ có thể hòa.",
      "Năm lá liên tiếp cùng một chất. Giữa hai thùng phá sảnh, bên có lá trên cùng lớn hơn sẽ thắng.",
      "Bốn lá cùng giá trị. Lá thứ năm (quân phụ) phân định trường hợp hiếm khi tứ quý nằm ngay trên bài chung.",
      "Một sám cô kèm một đôi. So sám cô trước, sau đó mới so đôi.",
      "Năm lá cùng chất nhưng không liên tiếp. So từng lá một từ lá lớn nhất; không chất nào lớn hơn chất nào.",
      "Năm lá liên tiếp khác chất. Át đứng ở đầu trên (10-J-Q-K-A) hoặc đầu dưới (A-2-3-4-5), không bao giờ cả hai cùng lúc.",
      "Ba lá cùng giá trị, kèm hai lá không liên quan.",
      "Hai đôi khác nhau kèm lá thứ năm. So đôi lớn trước, rồi đôi nhỏ, rồi đến quân phụ.",
      "Hai lá cùng giá trị kèm ba lá không liên quan, so lần lượt.",
      "Không thuộc trường hợp nào ở trên. Lá cao nhất quyết định, rồi đến lá tiếp theo, và cứ thế."
    ],
    dealt: "xuất hiện ở %s số tay bảy lá",
    tiesH2: "Cách phân định khi bằng nhau",
    tiesP: "So loại tay bài trước: thùng nào cũng thắng sảnh nào, bất kể lá bài ra sao. Trong cùng một loại, so từng giá trị từ trên xuống. Phần còn lại sau khi ghép bài gọi là <em>quân phụ</em> (kicker), và nó quyết định nhiều ván hơn người mới nghĩ: với bài chung A-9-4, cả A♠ K♦ lẫn A♣ 7♥ đều là một đôi át, nhưng K ăn đứt 7. Chất bài không bao giờ dùng để phân định trong Hold’em — hai người chơi có cùng năm giá trị sẽ chia đôi pot, đến đồng phỉnh cuối cùng.",
    wrongH2: "Những điều hay bị hiểu sai",
    wrong: [
      "Át vừa là lá cao nhất vừa là lá thấp nhất của một sảnh: A-K-Q-J-10 là sảnh lớn nhất, A-2-3-4-5 (gọi là <em>bánh xe</em>) là sảnh nhỏ nhất. Dãy không nối vòng — Q-K-A-2-3 chẳng là gì cả.",
      "Thùng là năm lá cùng chất, không phải bốn. Bốn lá cơ tính cả bài trên tay lẫn bài chung tự nó không có giá trị gì.",
      "Sám cô tạo từ một đôi trên tay cộng một lá dưới bài chung gọi là <em>set</em>; tạo từ một lá trên tay cộng một đôi dưới bài chung gọi là <em>trips</em>. Cùng thứ hạng nhưng sức mạnh rất khác, vì trips thì ai cũng nhìn thấy.",
      "Chỉ năm lá tốt nhất được tính. Có hai đôi trên tay và thêm một đôi thứ ba dưới bài chung thì bạn vẫn chỉ có hai đôi, không phải ba.",
      "Các tỉ lệ ở trên cho biết mỗi tay bài hình thành đến vòng river trên bảy lá thường xuyên đến mức nào, chứ không phải nó thắng thường xuyên đến mức nào. Hai đôi trông tầm thường nhưng vẫn trên cơ phần lớn những gì nó gặp."
    ],
    seeH2: "Nhìn thấy ngay tại bàn",
    seeP: "PokerTH hiển thị tên tay bài mạnh nhất hiện tại của bạn ngay dưới bài chung trong lúc chơi, nên bạn không bao giờ phải tự ghép bài khi đồng hồ đang chạy; đến vòng lật bài, mỗi tay bài được mở đều hiện rõ năm lá thực sự có giá trị. Luyện tập ngoại tuyến với đối thủ máy là cách nhanh nhất để thuộc nằm lòng thứ tự này."
  },

  th: {
    title: "ลำดับไพ่โป๊กเกอร์ — อันดับมือไพ่เท็กซัสโฮลด์เอ็ม",
    desc: "มือไพ่โป๊กเกอร์เท็กซัสโฮลด์เอ็มทั้งสิบแบบเรียงจาก Royal Flush ถึง High Card พร้อมตัวอย่าง โอกาสเกิดของแต่ละมือ และวิธีตัดสินเมื่อไพ่เสมอกัน",
    ldHeadline: "ลำดับไพ่โป๊กเกอร์ — เท็กซัสโฮลด์เอ็ม",
    ldDesc: "มือไพ่เท็กซัสโฮลด์เอ็มทั้งสิบแบบตามลำดับ พร้อมตัวอย่าง ความถี่ และกฎการตัดสินเสมอ",
    h1: "ลำดับไพ่โป๊กเกอร์",
    lead: "มือไพ่ในเท็กซัสโฮลด์เอ็มเรียงจากแข็งแรงที่สุดไปอ่อนที่สุดดังนี้ หนึ่งมือคือไพ่ห้าใบพอดีเสมอ เลือกจากเจ็ดใบที่คุณเห็น นั่นคือไพ่ในมือสองใบกับไพ่กองกลางห้าใบ คุณไม่จำเป็นต้องใช้ไพ่ของตัวเอง — ถ้าไพ่กองกลางอย่างเดียวประกอบเป็นห้าใบที่ดีที่สุด นั่นก็คือมือของคุณเช่นกัน",
    names: ["Royal Flush", "Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind", "Two Pair", "One Pair", "High Card"],
    texts: [
      "A K Q J 10 ดอกเดียวกันทั้งหมด มือที่ดีที่สุดเท่าที่เป็นไปได้ ไม่มีอะไรชนะได้ ทำได้แค่เสมอ",
      "ไพ่ห้าใบเรียงกันในดอกเดียวกัน ระหว่างสองมือ ใบบนสุดที่สูงกว่าเป็นฝ่ายชนะ",
      "ไพ่สี่ใบแต้มเดียวกัน ใบที่ห้า (คิกเกอร์) ใช้ตัดสินกรณีหายากที่สี่ใบนั้นอยู่บนกองกลาง",
      "ตองบวกคู่ เปรียบเทียบตองก่อน แล้วจึงดูคู่",
      "ไพ่ห้าใบดอกเดียวกันแต่ไม่เรียงกัน เทียบทีละใบจากใบสูงสุดลงมา ไม่มีดอกใดใหญ่กว่าดอกใด",
      "ไพ่ห้าใบเรียงกันแต่คละดอก เอซใช้เป็นใบสูง (10-J-Q-K-A) หรือใบต่ำ (A-2-3-4-5) อย่างใดอย่างหนึ่ง ไม่ใช่ทั้งสองพร้อมกัน",
      "ไพ่สามใบแต้มเดียวกัน บวกไพ่ที่ไม่เกี่ยวข้องอีกสองใบ",
      "สองคู่ที่ต่างกันบวกไพ่ใบที่ห้า เทียบคู่สูงก่อน แล้วคู่ต่ำ แล้วจึงถึงคิกเกอร์",
      "ไพ่สองใบแต้มเดียวกัน บวกไพ่ที่ไม่เกี่ยวข้องอีกสามใบ เทียบไล่ตามลำดับ",
      "ไม่เข้าข่ายข้อใดข้างต้น ใบที่สูงที่สุดเป็นตัวตัดสิน แล้วจึงถึงใบถัดไป เรื่อยไปเช่นนี้"
    ],
    dealt: "เกิดขึ้นใน %s ของมือเจ็ดใบ",
    tiesH2: "ตัดสินอย่างไรเมื่อไพ่เสมอกัน",
    tiesP: "เทียบประเภทมือก่อน ฟลัชใด ๆ ชนะสเตรทใด ๆ เสมอ ไม่ว่าไพ่จะเป็นอะไร ภายในประเภทเดียวกันให้ไล่เทียบแต้มจากบนลงล่าง ไพ่ที่เหลือหลังประกอบมือแล้วเรียกว่า <em>คิกเกอร์</em> และมันตัดสินเกมมากกว่าที่มือใหม่คาดไว้มาก บนกองกลาง A-9-4 ทั้ง A♠ K♦ และ A♣ 7♥ ต่างก็เป็นคู่เอซ แต่ K เหนือกว่า 7 ในโฮลด์เอ็มดอกไพ่ไม่เคยใช้ตัดสิน — ผู้เล่นสองคนที่มีแต้มห้าใบเหมือนกันจะแบ่งกองกลางกันจนถึงชิปสุดท้าย",
    wrongH2: "สิ่งที่คนมักเข้าใจผิด",
    wrong: [
      "เอซเป็นทั้งใบสูงสุดและใบต่ำสุดของสเตรท A-K-Q-J-10 คือสเตรทที่ดีที่สุด ส่วน A-2-3-4-5 (เรียกว่า <em>wheel</em>) คือที่ต่ำที่สุด ลำดับไม่วนกลับ — Q-K-A-2-3 ไม่ใช่อะไรเลย",
      "ฟลัชคือไพ่ดอกเดียวกันห้าใบ ไม่ใช่สี่ใบ มีโพแดงสี่ใบรวมทั้งในมือและบนกองกลางนั้นไม่มีค่าอะไรในตัวเอง",
      "ตองที่เกิดจากคู่ในมือบวกไพ่หนึ่งใบบนกองกลางเรียกว่า <em>set</em> ส่วนที่เกิดจากไพ่หนึ่งใบในมือบวกคู่บนกองกลางเรียกว่า <em>trips</em> อันดับเท่ากันแต่ความแข็งแรงต่างกันมาก เพราะ trips นั้นทุกคนมองเห็น",
      "นับเฉพาะห้าใบที่ดีที่สุดเท่านั้น ถือสองคู่อยู่แล้วมีคู่ที่สามบนกองกลาง มือของคุณก็ยังเป็นสองคู่ ไม่ใช่สามคู่",
      "เปอร์เซ็นต์ข้างต้นบอกว่าแต่ละมือเกิดขึ้นบ่อยแค่ไหนเมื่อครบเจ็ดใบถึงไพ่ริเวอร์ ไม่ได้บอกว่าชนะบ่อยแค่ไหน สองคู่ดูธรรมดาแต่ก็ยังเหนือกว่าไพ่ส่วนใหญ่ที่มันเจอ"
    ],
    seeH2: "ดูได้จริงที่โต๊ะ",
    seeP: "ระหว่างเล่น PokerTH จะบอกชื่อมือที่ดีที่สุดของคุณไว้ใต้กองกลาง คุณจึงไม่ต้องมานั่งประกอบเองตอนเวลากำลังจะหมด และเมื่อถึงตอนเปิดไพ่ ระบบจะเน้นห้าใบที่ใช้จริงของทุกมือที่เปิดออกมา การฝึกออฟไลน์กับคู่แข่งคอมพิวเตอร์คือวิธีที่เร็วที่สุดที่จะจำลำดับนี้ได้ขึ้นใจ"
  },

  hi: {
    title: "पोकर हैंड रैंकिंग — टेक्सास होल्डम में हाथों का क्रम",
    desc: "टेक्सास होल्डम पोकर के सभी दस हाथ रॉयल फ्लश से हाई कार्ड तक क्रम में, उदाहरण, हर हाथ बनने की संभावना और किकर व बराबरी सुलझाने के नियमों के साथ।",
    ldHeadline: "पोकर हैंड रैंकिंग — टेक्सास होल्डम",
    ldDesc: "टेक्सास होल्डम के दस हाथ क्रम से, उदाहरण, आवृत्ति और बराबरी सुलझाने के नियमों सहित।",
    h1: "पोकर हैंड रैंकिंग",
    lead: "टेक्सास होल्डम में हाथ सबसे मज़बूत से सबसे कमज़ोर तक इस क्रम में आते हैं। हाथ हमेशा ठीक पाँच कार्ड का होता है, जो आपको दिख रहे सात कार्डों में से चुना जाता है: आपके दो निजी कार्ड और पाँच साझा कार्ड। अपने कार्ड इस्तेमाल करना ज़रूरी नहीं — अगर बोर्ड अकेले ही सबसे अच्छे पाँच बना दे, तो वही आपका हाथ है।",
    names: ["रॉयल फ्लश", "स्ट्रेट फ्लश", "फ़ोर ऑफ़ अ काइंड", "फ़ुल हाउस", "फ्लश", "स्ट्रेट", "थ्री ऑफ़ अ काइंड", "टू पेयर", "वन पेयर", "हाई कार्ड"],
    texts: [
      "एक ही सूट के A K Q J 10। सबसे बड़ा संभव हाथ: इसे हराया नहीं जा सकता, सिर्फ़ बराबरी की जा सकती है।",
      "एक ही सूट के लगातार पाँच कार्ड। दो स्ट्रेट फ्लश में ऊपर वाला बड़ा कार्ड जीतता है।",
      "एक ही अंक के चार कार्ड। पाँचवाँ कार्ड (किकर) उस दुर्लभ बराबरी को सुलझाता है जब चारों बोर्ड पर ही हों।",
      "तीन एक जैसे कार्ड और एक जोड़ा। पहले तीन की तुलना होती है, फिर जोड़े की।",
      "एक ही सूट के पाँच कार्ड, पर क्रम में नहीं। सबसे बड़े से शुरू करके एक-एक कर तुलना; कोई सूट किसी दूसरे से बड़ा नहीं होता।",
      "लगातार पाँच कार्ड, सूट अलग-अलग। इक्का ऊपर (10-J-Q-K-A) या नीचे (A-2-3-4-5) चलता है, दोनों एक साथ कभी नहीं।",
      "एक ही अंक के तीन कार्ड और दो असंबंधित कार्ड।",
      "दो अलग जोड़े और पाँचवाँ कार्ड। पहले बड़े जोड़े की तुलना, फिर छोटे की, फिर किकर की।",
      "एक ही अंक के दो कार्ड और तीन असंबंधित कार्ड, क्रम से तुलना किए जाते हैं।",
      "ऊपर में से कुछ भी नहीं। सबसे बड़ा कार्ड तय करता है, फिर अगला, और इसी तरह आगे।"
    ],
    dealt: "सात कार्डों में %s बार बनता है",
    tiesH2: "बराबरी कैसे सुलझती है",
    tiesP: "पहले श्रेणी देखी जाती है: कार्ड चाहे जो हों, कोई भी फ्लश किसी भी स्ट्रेट को हरा देता है। एक ही श्रेणी के भीतर ऊपर से नीचे अंक दर अंक तुलना होती है। हाथ बनने के बाद जो कार्ड बचता है उसे <em>किकर</em> कहते हैं, और यह नए खिलाड़ियों की सोच से कहीं ज़्यादा हाथ तय करता है: A-9-4 बोर्ड पर A♠ K♦ और A♣ 7♥ दोनों इक्कों का जोड़ा बनाते हैं, पर बादशाह सत्ते से ऊपर है। होल्डम में सूट कभी बराबरी नहीं तोड़ता — एक जैसे पाँच अंकों वाले दो खिलाड़ी आख़िरी चिप तक पॉट बाँट लेते हैं।",
    wrongH2: "जो अक्सर ग़लत समझा जाता है",
    wrong: [
      "स्ट्रेट के लिए इक्का सबसे बड़ा भी है और सबसे छोटा भी: A-K-Q-J-10 सबसे अच्छा, A-2-3-4-5 (जिसे <em>wheel</em> कहते हैं) सबसे कमज़ोर। क्रम गोल घूमता नहीं — Q-K-A-2-3 कुछ भी नहीं है।",
      "फ्लश एक सूट के पाँच कार्ड होते हैं, चार नहीं। हाथ और बोर्ड मिलाकर चार पान अपने आप में किसी काम के नहीं।",
      "हाथ के जोड़े और बोर्ड के एक कार्ड से बना तीन का सेट <em>set</em> कहलाता है; हाथ के एक कार्ड और बोर्ड के जोड़े से बना <em>trips</em>। रैंक वही, ताक़त बहुत अलग, क्योंकि trips सबको दिखता है।",
      "सिर्फ़ सबसे अच्छे पाँच गिने जाते हैं। आपके पास दो जोड़े हों और बोर्ड पर तीसरा जोड़ा हो, तब भी हाथ दो जोड़े का ही है, तीन का नहीं।",
      "ऊपर दिए प्रतिशत बताते हैं कि सात कार्डों में रिवर तक हर हाथ कितनी बार बनता है, यह नहीं कि वह कितनी बार जीतता है। दो जोड़े आम लगते हैं, फिर भी उन्हें जो मिलता है उसमें से ज़्यादातर से आगे रहते हैं।"
    ],
    seeH2: "मेज़ पर इसे देखना",
    seeP: "खेलते समय PokerTH बोर्ड के नीचे आपका मौजूदा सबसे अच्छा हाथ नाम सहित दिखाता है, ताकि घड़ी चलते हुए आपको ख़ुद जोड़-घटाव न करना पड़े, और शोडाउन पर हर खुले हाथ में वही पाँच कार्ड उभारकर दिखाता है जो असल में गिने गए। कंप्यूटर विरोधियों के साथ ऑफ़लाइन अभ्यास इस क्रम को याद कराने का सबसे तेज़ तरीक़ा है।"
  },

  bn: {
    title: "পোকার হ্যান্ড র‍্যাঙ্কিং — টেক্সাস হোল্ডেমে হাতের ক্রম",
    desc: "টেক্সাস হোল্ডেম পোকারের দশটি হাত রয়্যাল ফ্লাশ থেকে হাই কার্ড পর্যন্ত ক্রম অনুসারে, উদাহরণ, প্রতিটি হাত আসার সম্ভাবনা এবং কিকার ও সমতা মীমাংসার নিয়মসহ।",
    ldHeadline: "পোকার হ্যান্ড র‍্যাঙ্কিং — টেক্সাস হোল্ডেম",
    ldDesc: "টেক্সাস হোল্ডেমের দশটি হাত ক্রম অনুসারে, উদাহরণ, কত ঘন ঘন আসে এবং সমতার নিয়মসহ।",
    h1: "পোকার হ্যান্ড র‍্যাঙ্কিং",
    lead: "টেক্সাস হোল্ডেমে হাতগুলো সবচেয়ে শক্তিশালী থেকে দুর্বলতম এই ক্রমে সাজানো। একটি হাত সবসময় ঠিক পাঁচটি কার্ড, যা আপনার দেখা সাতটি কার্ড থেকে বাছাই করা হয়: আপনার দুটি গোপন কার্ড এবং পাঁচটি সাধারণ কার্ড। নিজের কার্ড ব্যবহার করা বাধ্যতামূলক নয় — বোর্ড একাই যদি সেরা পাঁচটি বানিয়ে ফেলে, সেটিও আপনার হাত।",
    names: ["Royal Flush", "Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind", "Two Pair", "One Pair", "High Card"],
    texts: [
      "একই সুটের A K Q J 10। সম্ভাব্য সেরা হাত: একে হারানো যায় না, কেবল সমান করা যায়।",
      "একই সুটের পরপর পাঁচটি কার্ড। দুটি স্ট্রেট ফ্লাশের মধ্যে উপরের কার্ড বড় যার, সে জেতে।",
      "একই মানের চারটি কার্ড। পঞ্চম কার্ড (কিকার) সেই বিরল সমতা মেটায় যখন চারটিই বোর্ডে থাকে।",
      "তিনটি একই মানের কার্ড ও একটি জোড়া। আগে তিনটির তুলনা, তারপর জোড়ার।",
      "একই সুটের পাঁচটি কার্ড, পরপর নয়। সবচেয়ে বড়টি থেকে একটি একটি করে তুলনা; কোনো সুট অন্যটির চেয়ে বড় নয়।",
      "পরপর পাঁচটি কার্ড, সুট মেশানো। টেক্কা উপরে (10-J-Q-K-A) বা নিচে (A-2-3-4-5) চলে, কখনও দুই দিকেই নয়।",
      "একই মানের তিনটি কার্ড, সঙ্গে সম্পর্কহীন দুটি কার্ড।",
      "আলাদা দুটি জোড়া ও পঞ্চম একটি কার্ড। আগে বড় জোড়া, তারপর ছোট জোড়া, তারপর কিকার।",
      "একই মানের দুটি কার্ড ও সম্পর্কহীন তিনটি কার্ড, ক্রমানুসারে তুলনা করা হয়।",
      "উপরের কোনোটিই নয়। সবচেয়ে বড় কার্ড ঠিক করে দেয়, তারপর পরেরটি, এভাবেই চলে।"
    ],
    dealt: "সাত কার্ডের হাতে %s ক্ষেত্রে আসে",
    tiesH2: "সমতা কীভাবে মেটে",
    tiesP: "আগে শ্রেণি মেলানো হয়: কার্ড যা-ই হোক, যেকোনো ফ্লাশ যেকোনো স্ট্রেটকে হারায়। একই শ্রেণির ভেতরে উপর থেকে নিচে মান ধরে ধরে তুলনা হয়। হাত বানানোর পর যা বাকি থাকে তাকে বলে <em>কিকার</em>, আর নতুনদের ধারণার চেয়ে অনেক বেশি হাত এটিই ঠিক করে দেয়: A-9-4 বোর্ডে A♠ K♦ এবং A♣ 7♥ দুটোই টেক্কার জোড়া, কিন্তু সাহেব সাতকে ছাড়িয়ে যায়। হোল্ডেমে সুট কখনও সমতা ভাঙে না — একই পাঁচ মানের দুই খেলোয়াড় শেষ চিপ পর্যন্ত পট ভাগ করে নেন।",
    wrongH2: "যা প্রায়ই ভুল বোঝা হয়",
    wrong: [
      "স্ট্রেটের ক্ষেত্রে টেক্কা একই সঙ্গে সবচেয়ে বড় ও সবচেয়ে ছোট কার্ড: A-K-Q-J-10 সেরা, A-2-3-4-5 (যাকে বলে <em>wheel</em>) সবচেয়ে দুর্বল। ক্রমটি ঘুরে আসে না — Q-K-A-2-3 কিছুই নয়।",
      "ফ্লাশ মানে এক সুটের পাঁচটি কার্ড, চারটি নয়। হাতে ও বোর্ডে মিলিয়ে চারটি হরতন নিজে থেকে কোনো মূল্য রাখে না।",
      "হাতের জোড়া আর বোর্ডের একটি কার্ড মিলে হওয়া তিনটিকে বলে <em>set</em>; হাতের একটি কার্ড আর বোর্ডের জোড়া মিলে হলে <em>trips</em>। শ্রেণি এক, শক্তি অনেক আলাদা, কারণ trips সবাই দেখতে পায়।",
      "কেবল সেরা পাঁচটিই গোনা হয়। হাতে দুই জোড়া আর বোর্ডে তৃতীয় জোড়া থাকলেও হাত দুই জোড়াই থাকে, তিন নয়।",
      "উপরের শতাংশগুলো বলে সাত কার্ডে রিভার পর্যন্ত প্রতিটি হাত কত ঘন ঘন তৈরি হয়, কত ঘন ঘন জেতে তা নয়। দুই জোড়া সাধারণ মনে হলেও যা যা সামনে পড়ে তার বেশিরভাগের চেয়ে এগিয়ে থাকে।"
    ],
    seeH2: "টেবিলেই দেখা",
    seeP: "খেলার সময় PokerTH বোর্ডের নিচে আপনার এখনকার সেরা হাতের নাম দেখায়, তাই ঘড়ির চাপে নিজে হিসাব কষতে হয় না; শোডাউনে খোলা প্রতিটি হাতের ঠিক যে পাঁচটি কার্ড গোনা হয়েছে সেগুলো আলাদা করে দেখানো হয়। কম্পিউটার প্রতিপক্ষের বিরুদ্ধে অফলাইনে অনুশীলনই এই ক্রম মুখস্থ করার দ্রুততম উপায়।"
  },

  ar: {
    title: "ترتيب أيدي البوكر — تسلسل الأيدي في تكساس هولدم",
    desc: "أيدي بوكر تكساس هولدم العشر مرتبة من الرويال فلَش إلى الورقة العليا، مع أمثلة واحتمال تكوين كل يد وكيفية حسم التعادل والورقة المرجّحة.",
    ldHeadline: "ترتيب أيدي البوكر — تكساس هولدم",
    ldDesc: "أيدي تكساس هولدم العشر بالترتيب، مع أمثلة ونسب التكرار وقواعد حسم التعادل.",
    h1: "ترتيب أيدي البوكر",
    lead: "ترتَّب أيدي تكساس هولدم من الأقوى إلى الأضعف على النحو التالي. اليد دائمًا خمس أوراق بالضبط، تُختار من السبع التي تراها: ورقتاك المغلقتان والأوراق المشتركة الخمس. لست ملزمًا باستعمال ورقتيك — إذا كوّنت أوراق الطاولة وحدها أفضل خمس، فتلك يدك أيضًا.",
    names: ["رويال فلَش", "ستريت فلَش", "رباعية", "فُل هاوس", "فلَش", "ستريت", "ثلاثية", "زوجان", "زوج", "الورقة العليا"],
    texts: [
      "<span class=\"ltr\">A K Q J 10</span> من النوع نفسه. أقوى يد ممكنة: لا يمكن هزيمتها، بل التعادل معها فقط.",
      "خمس أوراق متتالية من النوع نفسه. بين ستريت فلَشين تفوز اليد ذات الورقة العليا الأكبر.",
      "أربع أوراق من القيمة نفسها. الورقة الخامسة (المرجّحة) تحسم التعادل النادر حين تكون الرباعية على الطاولة.",
      "ثلاثية مع زوج. تُقارن الثلاثية أولًا ثم الزوج.",
      "خمس أوراق من النوع نفسه وغير متتالية. تُقارن واحدة تلو الأخرى بدءًا من الأعلى؛ ولا نوع يعلو على آخر.",
      "خمس أوراق متتالية بأنواع مختلطة. الآص يلعب في الأعلى (<span class=\"ltr\">10-J-Q-K-A</span>) أو في الأسفل (<span class=\"ltr\">A-2-3-4-5</span>)، ولا يجمع الطرفين معًا أبدًا.",
      "ثلاث أوراق من القيمة نفسها، مع ورقتين لا صلة لهما.",
      "زوجان مختلفان مع ورقة خامسة. يُقارن الزوج الأعلى أولًا ثم الأدنى ثم الورقة المرجّحة.",
      "ورقتان من القيمة نفسها مع ثلاث أوراق لا صلة لها، تُقارن بالترتيب.",
      "لا شيء مما سبق. تحسم الورقة الأعلى، ثم التي تليها، وهكذا."
    ],
    dealt: "تظهر في %s من أيدي السبع أوراق",
    tiesH2: "كيف يُحسم التعادل",
    tiesP: "تُقارن الفئة أولًا: أي فلَش يهزم أي ستريت مهما كانت الأوراق. وداخل الفئة نفسها تُقارن القيم من الأعلى إلى الأدنى. ما يتبقى بعد تكوين اليد يُسمّى <em>الورقة المرجّحة</em> (kicker)، وهي تحسم من الأيدي أكثر مما يتوقع المبتدئ: على طاولة <span class=\"ltr\">A-9-4</span> تكوّن <span class=\"ltr\">A♠ K♦</span> و<span class=\"ltr\">A♣ 7♥</span> زوج آصات، لكن الشايب يتفوق على السبعة. الأنواع لا تحسم التعادل في هولدم أبدًا — لاعبان بالقيم الخمس نفسها يقتسمان القدر حتى آخر رقاقة.",
    wrongH2: "أخطاء شائعة",
    wrong: [
      "الآص هو الورقة الأعلى والأدنى للستريت في آنٍ واحد: <span class=\"ltr\">A-K-Q-J-10</span> هو الأفضل، و<span class=\"ltr\">A-2-3-4-5</span> (ما يُعرف بـ<em>wheel</em>) هو الأضعف. والتسلسل لا يلتف — <span class=\"ltr\">Q-K-A-2-3</span> لا يساوي شيئًا.",
      "الفلَش خمس أوراق من نوع واحد لا أربع. أربع أوراق قلوب بين يدك والطاولة لا قيمة لها بذاتها.",
      "الثلاثية المكوّنة من زوج في يدك وورقة على الطاولة تُسمّى <em>set</em>، والمكوّنة من ورقة في يدك وزوج على الطاولة تُسمّى <em>trips</em>. الترتيب واحد والقوة مختلفة تمامًا، لأن الـtrips يراها الجميع.",
      "لا يُحتسب سوى أفضل خمس أوراق. إن كان لديك زوجان وظهر زوج ثالث على الطاولة، فيدك زوجان لا ثلاثة.",
      "النسب أعلاه تبيّن كم مرة تتكوّن كل يد حتى الريفر ضمن سبع أوراق، لا كم مرة تفوز. الزوجان يبدوان عاديين ومع ذلك يتقدمان على معظم ما يواجهانه."
    ],
    seeH2: "رؤيتها على الطاولة",
    seeP: "يعرض PokerTH اسم أفضل يد لديك أسفل الطاولة أثناء اللعب، فلا تضطر إلى تركيبها والوقت يداهمك، ويُبرز عند كشف الأوراق الخمس التي احتُسبت فعلًا في كل يد مكشوفة. والتدرّب دون اتصال أمام خصوم الحاسوب أسرع طريقة لترسيخ هذا الترتيب."
  },

  fa: {
    title: "رتبه‌بندی دست‌های پوکر — ترتیب دست‌ها در تگزاس هولدم",
    desc: "هر ده دست پوکر تگزاس هولدم از رویال فلاش تا کارت بالا، همراه با مثال، احتمال تشکیل هر دست و شیوهٔ تعیین برنده در تساوی و نقش کیکر.",
    ldHeadline: "رتبه‌بندی دست‌های پوکر — تگزاس هولدم",
    ldDesc: "ده دست تگزاس هولدم به ترتیب، با مثال، فراوانی و قواعد تساوی.",
    h1: "رتبه‌بندی دست‌های پوکر",
    lead: "دست‌های تگزاس هولدم از قوی‌ترین به ضعیف‌ترین به این ترتیب‌اند. هر دست همیشه دقیقاً پنج کارت است که از میان هفت کارت پیش چشم شما انتخاب می‌شود: دو کارت بستهٔ خودتان و پنج کارت مشترک. استفاده از کارت‌های خودتان الزامی نیست — اگر خود میز بهترین پنج کارت را بسازد، آن هم دست شماست.",
    names: ["رویال فلاش", "استریت فلاش", "کاره (چهارتایی)", "فول هاوس", "فلاش", "استریت", "سه‌تایی", "دو جفت", "یک جفت", "کارت بالا"],
    texts: [
      "<span class=\"ltr\">A K Q J 10</span> از یک خال. بهترین دست ممکن: شکست نمی‌خورد و تنها می‌توان با آن مساوی شد.",
      "پنج کارت پیاپی از یک خال. میان دو استریت فلاش، آن که کارت بالاترش بزرگ‌تر است می‌برد.",
      "چهار کارت هم‌ارزش. کارت پنجم (کیکر) تساوی نادری را که کاره روی میز باشد تعیین می‌کند.",
      "یک سه‌تایی به همراه یک جفت. نخست سه‌تایی مقایسه می‌شود و سپس جفت.",
      "پنج کارت از یک خال که پیاپی نیستند. از بالاترین کارت یکی‌یکی مقایسه می‌شوند؛ هیچ خالی بر خال دیگر برتری ندارد.",
      "پنج کارت پیاپی با خال‌های متفاوت. آس یا بالا بازی می‌کند (<span class=\"ltr\">10-J-Q-K-A</span>) یا پایین (<span class=\"ltr\">A-2-3-4-5</span>)، هرگز هر دو با هم.",
      "سه کارت هم‌ارزش به همراه دو کارت بی‌ربط.",
      "دو جفت متفاوت به همراه کارت پنجم. نخست جفت بالاتر، سپس جفت پایین‌تر و در آخر کیکر مقایسه می‌شود.",
      "دو کارت هم‌ارزش به همراه سه کارت بی‌ربط که به ترتیب مقایسه می‌شوند.",
      "هیچ‌کدام از موارد بالا. بالاترین کارت تعیین‌کننده است، سپس کارت بعدی، و به همین ترتیب."
    ],
    dealt: "در %s از دست‌های هفت‌کارتی پیش می‌آید",
    tiesH2: "تساوی چگونه تعیین می‌شود",
    tiesP: "نخست دسته مقایسه می‌شود: هر فلاشی هر استریتی را می‌برد، کارت‌ها هرچه باشند. درون یک دسته، ارزش‌ها از بالا به پایین سنجیده می‌شوند. آنچه پس از تشکیل دست باقی می‌ماند <em>کیکر</em> نام دارد و بیش از آنچه تازه‌کارها گمان می‌کنند سرنوشت دست‌ها را رقم می‌زند: روی میز <span class=\"ltr\">A-9-4</span>، هم <span class=\"ltr\">A♠ K♦</span> و هم <span class=\"ltr\">A♣ 7♥</span> جفت آس می‌سازند، اما شاه از هفت بالاتر است. در هولدم خال هرگز تساوی را نمی‌شکند — دو بازیکن با پنج ارزش یکسان پات را تا آخرین ژتون تقسیم می‌کنند.",
    wrongH2: "خطاهای رایج",
    wrong: [
      "آس برای استریت هم بالاترین کارت است و هم پایین‌ترین: <span class=\"ltr\">A-K-Q-J-10</span> بهترین و <span class=\"ltr\">A-2-3-4-5</span> (به‌اصطلاح <em>wheel</em>) ضعیف‌ترین است. دنباله دور نمی‌زند — <span class=\"ltr\">Q-K-A-2-3</span> هیچ ارزشی ندارد.",
      "فلاش پنج کارت از یک خال است، نه چهار. چهار دل میان دست شما و میز به‌تنهایی هیچ ارزشی ندارد.",
      "سه‌تایی که از جفت دست شما و یک کارت روی میز ساخته شود <em>set</em> نام دارد؛ اگر از یک کارت دست شما و جفت روی میز ساخته شود <em>trips</em> است. رتبه یکی است اما قدرت بسیار متفاوت، چون trips را همه می‌بینند.",
      "تنها بهترین پنج کارت شمرده می‌شود. اگر دو جفت داشته باشید و جفت سومی روی میز باشد، دست شما همچنان دو جفت است، نه سه.",
      "درصدهای بالا می‌گویند هر دست تا ریور روی هفت کارت چقدر تشکیل می‌شود، نه اینکه چقدر برنده می‌شود. دو جفت معمولی به نظر می‌رسد و با این حال از بیشتر آنچه با آن روبه‌رو می‌شود جلوتر است."
    ],
    seeH2: "دیدن آن سر میز",
    seeP: "PokerTH در جریان بازی نام بهترین دست فعلی شما را زیر میز نشان می‌دهد تا هرگز مجبور نباشید زیر فشار زمان آن را در ذهن بچینید، و در شودان هر دست رو شده را با برجسته‌کردن همان پنج کارتی که به حساب آمده‌اند نمایش می‌دهد. تمرین آفلاین مقابل حریفان رایانه‌ای سریع‌ترین راه برای ملکهٔ ذهن شدن این ترتیب است."
  },

  ur: {
    title: "پوکر ہاتھوں کی درجہ بندی — ٹیکساس ہولڈم میں ہاتھوں کی ترتیب",
    desc: "ٹیکساس ہولڈم پوکر کے دسوں ہاتھ رائل فلش سے اونچے کارڈ تک ترتیب سے، مثالوں، ہر ہاتھ بننے کے امکان اور کِکر و برابری طے کرنے کے اصولوں کے ساتھ۔",
    ldHeadline: "پوکر ہاتھوں کی درجہ بندی — ٹیکساس ہولڈم",
    ldDesc: "ٹیکساس ہولڈم کے دس ہاتھ ترتیب سے، مثالوں، تعدد اور برابری کے اصولوں کے ساتھ۔",
    h1: "پوکر ہاتھوں کی درجہ بندی",
    lead: "ٹیکساس ہولڈم میں ہاتھ سب سے مضبوط سے سب سے کمزور تک اس ترتیب میں آتے ہیں۔ ہاتھ ہمیشہ ٹھیک پانچ کارڈ کا ہوتا ہے، جو آپ کے سامنے موجود سات میں سے چنا جاتا ہے: آپ کے دو بند کارڈ اور پانچ مشترکہ کارڈ۔ اپنے کارڈ استعمال کرنا لازم نہیں — اگر میز کے کارڈ ہی بہترین پانچ بنا دیں تو وہ بھی آپ کا ہاتھ ہے۔",
    names: ["رائل فلش", "اسٹریٹ فلش", "چار ایک جیسے", "فل ہاؤس", "فلش", "اسٹریٹ", "تین ایک جیسے", "دو جوڑے", "ایک جوڑا", "اونچا کارڈ"],
    texts: [
      "ایک ہی رنگ کے <span class=\"ltr\">A K Q J 10</span>۔ ممکنہ بہترین ہاتھ: اسے ہرایا نہیں جا سکتا، صرف برابر کیا جا سکتا ہے۔",
      "ایک ہی رنگ کے مسلسل پانچ کارڈ۔ دو اسٹریٹ فلش میں جس کا اوپر والا کارڈ بڑا ہو وہ جیتتا ہے۔",
      "ایک ہی قدر کے چار کارڈ۔ پانچواں کارڈ (کِکر) اس نادر برابری کو طے کرتا ہے جب چاروں میز پر ہی ہوں۔",
      "تین ایک جیسے کارڈ اور ایک جوڑا۔ پہلے تینوں کا موازنہ ہوتا ہے، پھر جوڑے کا۔",
      "ایک ہی رنگ کے پانچ کارڈ، مگر مسلسل نہیں۔ سب سے بڑے سے شروع کر کے ایک ایک کر کے موازنہ؛ کوئی رنگ کسی دوسرے سے بڑا نہیں ہوتا۔",
      "مسلسل پانچ کارڈ، رنگ مختلف۔ اِکّا اوپر (<span class=\"ltr\">10-J-Q-K-A</span>) یا نیچے (<span class=\"ltr\">A-2-3-4-5</span>) چلتا ہے، دونوں ایک ساتھ کبھی نہیں۔",
      "ایک ہی قدر کے تین کارڈ، اور دو غیر متعلق کارڈ۔",
      "دو الگ جوڑے اور پانچواں کارڈ۔ پہلے بڑا جوڑا، پھر چھوٹا، پھر کِکر۔",
      "ایک ہی قدر کے دو کارڈ اور تین غیر متعلق کارڈ، ترتیب سے موازنہ کیے جاتے ہیں۔",
      "اوپر میں سے کچھ نہیں۔ سب سے بڑا کارڈ فیصلہ کرتا ہے، پھر اگلا، اور اسی طرح آگے۔"
    ],
    dealt: "سات کارڈ کے ہاتھوں میں %s بار بنتا ہے",
    tiesH2: "برابری کیسے طے ہوتی ہے",
    tiesP: "پہلے قسم دیکھی جاتی ہے: کارڈ کچھ بھی ہوں، کوئی بھی فلش کسی بھی اسٹریٹ کو ہرا دیتا ہے۔ ایک ہی قسم کے اندر اوپر سے نیچے قدر بہ قدر موازنہ ہوتا ہے۔ ہاتھ بننے کے بعد جو کارڈ بچتا ہے اسے <em>کِکر</em> کہتے ہیں، اور یہ نئے کھلاڑیوں کے اندازے سے کہیں زیادہ ہاتھ طے کرتا ہے: <span class=\"ltr\">A-9-4</span> کی میز پر <span class=\"ltr\">A♠ K♦</span> اور <span class=\"ltr\">A♣ 7♥</span> دونوں اِکّوں کا جوڑا بناتے ہیں، مگر بادشاہ ساتّے سے اوپر ہے۔ ہولڈم میں رنگ کبھی برابری نہیں توڑتا — ایک جیسی پانچ قدروں والے دو کھلاڑی آخری چِپ تک پاٹ بانٹ لیتے ہیں۔",
    wrongH2: "عام غلط فہمیاں",
    wrong: [
      "اسٹریٹ کے لیے اِکّا بیک وقت سب سے بڑا اور سب سے چھوٹا کارڈ ہے: <span class=\"ltr\">A-K-Q-J-10</span> سب سے بہتر، <span class=\"ltr\">A-2-3-4-5</span> (جسے <em>wheel</em> کہتے ہیں) سب سے کمزور۔ ترتیب گھوم کر نہیں ملتی — <span class=\"ltr\">Q-K-A-2-3</span> کچھ بھی نہیں۔",
      "فلش ایک رنگ کے پانچ کارڈ ہوتے ہیں، چار نہیں۔ ہاتھ اور میز ملا کر چار پان اپنے آپ میں بےکار ہیں۔",
      "ہاتھ کے جوڑے اور میز کے ایک کارڈ سے بنے تین کو <em>set</em> کہتے ہیں؛ ہاتھ کے ایک کارڈ اور میز کے جوڑے سے بنے کو <em>trips</em>۔ درجہ ایک ہی، مگر طاقت بہت مختلف، کیونکہ trips سب کو نظر آتا ہے۔",
      "صرف بہترین پانچ گنے جاتے ہیں۔ آپ کے پاس دو جوڑے ہوں اور میز پر تیسرا جوڑا ہو، تب بھی ہاتھ دو جوڑے ہی رہتا ہے، تین نہیں۔",
      "اوپر دیے گئے فیصد بتاتے ہیں کہ سات کارڈوں میں ریور تک ہر ہاتھ کتنی بار بنتا ہے، یہ نہیں کہ کتنی بار جیتتا ہے۔ دو جوڑے عام لگتے ہیں، پھر بھی جن سے سامنا ہوتا ہے ان میں سے اکثر سے آگے رہتے ہیں۔"
    ],
    seeH2: "میز پر اسے دیکھنا",
    seeP: "کھیل کے دوران PokerTH میز کے نیچے آپ کے موجودہ بہترین ہاتھ کا نام دکھاتا ہے، تاکہ وقت کے دباؤ میں آپ کو خود جوڑ توڑ نہ کرنا پڑے، اور شوڈاؤن پر ہر کھلے ہاتھ کے وہی پانچ کارڈ نمایاں کر دیتا ہے جو واقعی گنے گئے۔ کمپیوٹر حریفوں کے ساتھ آف لائن مشق اس ترتیب کو ذہن نشین کرنے کا تیز ترین طریقہ ہے۔"
  },

  he: {
    title: "דירוג ידיים בפוקר — סדר הידיים בטקסס הולדם",
    desc: "עשר ידיים הפוקר של טקסס הולדם מרויאל פלאש ועד קלף גבוה, עם דוגמאות, ההסתברות לכל יד וכיצד מוכרעים קיקר ותיקו.",
    ldHeadline: "דירוג ידיים בפוקר — טקסס הולדם",
    ldDesc: "עשר ידיים טקסס הולדם לפי הסדר, עם דוגמאות, שכיחויות וכללי הכרעה בתיקו.",
    h1: "דירוג ידיים בפוקר",
    lead: "בטקסס הולדם הידיים מדורגות מהחזקה לחלשה כך. יד היא תמיד בדיוק חמישה קלפים, הנבחרים מתוך השבעה שאתם רואים: שני הקלפים הסגורים שלכם וחמשת קלפי הקהילה. אינכם חייבים להשתמש בקלפים שלכם — אם השולחן לבדו יוצר את חמשת הקלפים הטובים ביותר, גם זו היד שלכם.",
    names: ["רויאל פלאש", "סטרייט פלאש", "רביעייה", "פול האוס", "פלאש", "סטרייט", "שלישייה", "שני זוגות", "זוג", "קלף גבוה"],
    texts: [
      "<span class=\"ltr\">A K Q J 10</span> באותה סדרה. היד הטובה ביותר האפשרית: אי אפשר לנצח אותה, רק להשוות.",
      "חמישה קלפים רצופים באותה סדרה. בין שני סטרייט פלאש מנצח זה שהקלף העליון שלו גבוה יותר.",
      "ארבעה קלפים באותו ערך. הקלף החמישי (הקיקר) מכריע את התיקו הנדיר שבו הרביעייה מונחת על השולחן.",
      "שלישייה יחד עם זוג. תחילה משווים את השלישייה ואחר כך את הזוג.",
      "חמישה קלפים באותה סדרה שאינם רצופים. משווים אחד־אחד מהגבוה כלפי מטה; אין סדרה שגוברת על אחרת.",
      "חמישה קלפים רצופים בסדרות מעורבות. האס משחק למעלה (<span class=\"ltr\">10-J-Q-K-A</span>) או למטה (<span class=\"ltr\">A-2-3-4-5</span>), לעולם לא בשני הכיוונים יחד.",
      "שלושה קלפים באותו ערך, ועוד שני קלפים ללא קשר.",
      "שני זוגות שונים ועוד קלף חמישי. משווים תחילה את הזוג הגבוה, אחר כך את הנמוך ואז את הקיקר.",
      "שני קלפים באותו ערך ועוד שלושה קלפים ללא קשר, המושווים לפי הסדר.",
      "אף אחת מהאפשרויות שלמעלה. הקלף הגבוה מכריע, אחריו הבא, וכן הלאה."
    ],
    dealt: "מופיעה ב־%s מהידיים בנות שבעה קלפים",
    tiesH2: "כיצד מוכרע תיקו",
    tiesP: "תחילה משווים את הקטגוריה: כל פלאש מנצח כל סטרייט, יהיו הקלפים אשר יהיו. בתוך אותה קטגוריה משווים ערך אחר ערך מלמעלה למטה. מה שנותר אחרי הצירוף נקרא <em>קיקר</em>, והוא מכריע הרבה יותר ידיים משמתחילים מצפים: על שולחן <span class=\"ltr\">A-9-4</span> גם <span class=\"ltr\">A♠ K♦</span> וגם <span class=\"ltr\">A♣ 7♥</span> יוצרים זוג אסים, אך המלך גובר על השבע. הסדרות לעולם אינן שוברות תיקו בהולדם — שני שחקנים עם אותם חמישה ערכים מתחלקים בקופה עד לז'טון האחרון.",
    wrongH2: "טעויות נפוצות",
    wrong: [
      "האס הוא בו־זמנית הקלף הגבוה והנמוך ביותר לסטרייט: <span class=\"ltr\">A-K-Q-J-10</span> הוא הטוב ביותר, <span class=\"ltr\">A-2-3-4-5</span> (המכונה <em>wheel</em>) הוא החלש ביותר. הרצף אינו נסגר במעגל — <span class=\"ltr\">Q-K-A-2-3</span> אינו כלום.",
      "פלאש הוא חמישה קלפים מסדרה אחת, לא ארבעה. ארבעה לבבות בין היד לשולחן אינם שווים דבר כשלעצמם.",
      "שלישייה שנוצרה מזוג ביד ועוד קלף על השולחן נקראת <em>set</em>; שנוצרה מקלף אחד ביד וזוג על השולחן נקראת <em>trips</em>. אותו דירוג, עוצמה שונה מאוד, משום ש־trips גלויה לכולם.",
      "נספרים רק חמשת הקלפים הטובים ביותר. שני זוגות בידכם וזוג שלישי על השולחן עדיין נותנים שני זוגות, לא שלושה.",
      "האחוזים שלמעלה מציינים כמה פעמים כל יד נוצרת עד לריבר מתוך שבעה קלפים, ולא כמה פעמים היא מנצחת. שני זוגות נראים שגרתיים ובכל זאת גוברים על רוב מה שהם פוגשים."
    ],
    seeH2: "לראות את זה בשולחן",
    seeP: "במהלך המשחק PokerTH מציג את שם היד הטובה ביותר שלכם מתחת לשולחן, כך שלעולם אינכם צריכים להרכיב אותה בעצמכם בלחץ הזמן, ובשואודאון הוא מדגיש בכל יד חשופה בדיוק את חמשת הקלפים שנספרו. אימון לא־מקוון מול יריבי המחשב הוא הדרך המהירה ביותר להטמיע את הסדר הזה."
  },

  sv: {
    title: "Pokerhänder — handordningen i Texas Hold’em",
    desc: "Alla tio pokerhänder i Texas Hold’em från royal flush till högt kort, med exempel, sannolikheten för varje hand och hur kickers och lika händer avgörs.",
    ldHeadline: "Pokerhänder — Texas Hold’em",
    ldDesc: "De tio händerna i Texas Hold’em i ordning, med exempel, frekvenser och regler vid lika hand.",
    h1: "Pokerhänder",
    lead: "I Texas Hold’em rangordnas händerna från starkast till svagast så här. En hand är alltid exakt fem kort, valda bland de sju du ser: dina två hålkort och de fem gemensamma korten. Du måste aldrig använda dina egna kort — om bordet i sig utgör de bästa fem är det också din hand.",
    names: ["Royal flush", "Färgstege", "Fyrtal", "Kåk", "Färg", "Stege", "Triss", "Två par", "Par", "Högt kort"],
    texts: [
      "A K Q J 10 i samma färg. Den bästa möjliga handen: den kan inte slås, bara delas.",
      "Fem kort i följd i samma färg. Mellan två färgstegar vinner den med högsta toppkort.",
      "Fyra kort av samma valör. Det femte kortet (kickern) avgör det sällsynta läget då fyrtalet ligger på bordet.",
      "Triss plus ett par. Först jämförs trissen, därefter paret.",
      "Fem kort i samma färg, inte i följd. Jämförs kort för kort uppifrån; ingen färg går före någon annan.",
      "Fem kort i följd i blandade färger. Esset spelar högt (10-J-Q-K-A) eller lågt (A-2-3-4-5), aldrig båda samtidigt.",
      "Tre kort av samma valör, plus två kort utan samband.",
      "Två olika par plus ett femte kort. Först jämförs det höga paret, sedan det låga, sedan kickern.",
      "Två kort av samma valör plus tre kort utan samband, jämförda i tur och ordning.",
      "Inget av ovanstående. Det högsta kortet avgör, sedan nästa, och så vidare."
    ],
    dealt: "förekommer i %s av alla sjukortshänder",
    tiesH2: "Hur lika händer avgörs",
    tiesP: "Jämför kategorin först: vilken färg som helst slår vilken stege som helst, oavsett kort. Inom samma kategori jämförs valör för valör uppifrån. Det som blir över efter kombinationen kallas <em>kicker</em>, och den avgör fler händer än nybörjare tror: A♠ K♦ och A♣ 7♥ ger båda ess i par på ett bord med A-9-4, men kungen slår sjuan. Färger avgör aldrig i Hold’em — två spelare med samma fem valörer delar potten, in i sista marker.",
    wrongH2: "Vanliga missuppfattningar",
    wrong: [
      "Esset är både det högsta och det lägsta kortet i en stege: A-K-Q-J-10 är den bästa, A-2-3-4-5 (så kallad <em>wheel</em>) den svagaste. Följden går inte runt — Q-K-A-2-3 är ingenting alls.",
      "En färg är fem kort i samma färg, inte fyra. Fyra hjärter mellan handen och bordet är i sig värdelöst.",
      "En triss byggd på ett par på handen plus ett kort på bordet kallas <em>set</em>; byggd på ett kort på handen plus ett par på bordet kallas den <em>trips</em>. Samma rang, mycket olika styrka, eftersom trips syns för alla.",
      "Bara de bästa fem räknas. Två par på handen och ett tredje par på bordet ger två par, inte tre.",
      "Procenttalen ovan visar hur ofta varje hand över huvud taget uppstår fram till river över sju kort, inte hur ofta den vinner. Två par ser vardagligt ut och ligger ändå före det mesta det möter."
    ],
    seeH2: "Se det vid bordet",
    seeP: "PokerTH skriver ut din just nu bästa hand under bordet medan du spelar, så du aldrig behöver räkna ut den under tidspress, och vid showdown visas varje uppvisad hand med de fem kort som faktiskt räknades markerade. Att träna offline mot datamotståndarna är det snabbaste sättet att få ordningen i fingrarna."
  },

  da: {
    title: "Pokerhænder — rækkefølgen af hænder i Texas Hold’em",
    desc: "Alle ti pokerhænder i Texas Hold’em fra royal flush til højt kort, med eksempler, sandsynligheden for hver hånd og hvordan kickers og lige hænder afgøres.",
    ldHeadline: "Pokerhænder — Texas Hold’em",
    ldDesc: "De ti hænder i Texas Hold’em i rækkefølge, med eksempler, hyppigheder og regler ved lige hænder.",
    h1: "Pokerhænder",
    lead: "I Texas Hold’em rangordnes hænderne fra stærkest til svagest sådan her. En hånd er altid præcis fem kort, valgt blandt de syv du kan se: dine to lukkede kort og de fem fælleskort. Du er aldrig tvunget til at bruge dine egne kort — hvis bordet alene udgør de bedste fem, er det også din hånd.",
    names: ["Royal flush", "Straight flush", "Fire ens", "Fuldt hus", "Flush", "Straight", "Tre ens", "To par", "Et par", "Højt kort"],
    texts: [
      "A K Q J 10 i samme kulør. Den bedst mulige hånd: den kan ikke slås, kun deles.",
      "Fem kort i træk i samme kulør. Mellem to straight flushes vinder den med det højeste topkort.",
      "Fire kort af samme værdi. Det femte kort (kickeren) afgør det sjældne tilfælde, hvor de fire ligger på bordet.",
      "Tre ens plus et par. Først sammenlignes de tre ens, derefter parret.",
      "Fem kort i samme kulør, ikke i træk. Sammenlignes kort for kort oppefra; ingen kulør går forud for en anden.",
      "Fem kort i træk i blandede kulører. Esset spiller højt (10-J-Q-K-A) eller lavt (A-2-3-4-5), aldrig begge dele på én gang.",
      "Tre kort af samme værdi plus to kort uden sammenhæng.",
      "To forskellige par plus et femte kort. Først sammenlignes det høje par, så det lave, så kickeren.",
      "To kort af samme værdi plus tre kort uden sammenhæng, sammenlignet i rækkefølge.",
      "Ingen af ovenstående. Det højeste kort afgør, derefter det næste, og så videre."
    ],
    dealt: "forekommer i %s af alle syvkortshænder",
    tiesH2: "Hvordan lige hænder afgøres",
    tiesP: "Sammenlign kategorien først: enhver flush slår enhver straight, uanset kortene. Inden for samme kategori sammenlignes værdi for værdi oppefra. Det, der er tilbage efter kombinationen, kaldes <em>kickeren</em>, og den afgør flere hænder, end begyndere regner med: A♠ K♦ og A♣ 7♥ giver begge et par esser på et bord med A-9-4, men kongen slår syveren. Kulører afgør aldrig noget i Hold’em — to spillere med de samme fem værdier deler puljen, helt ned til sidste jeton.",
    wrongH2: "De typiske misforståelser",
    wrong: [
      "Esset er både det højeste og det laveste kort i en straight: A-K-Q-J-10 er den bedste, A-2-3-4-5 (kaldet <em>wheel</em>) den svageste. Rækken går ikke rundt — Q-K-A-2-3 er ingenting.",
      "En flush er fem kort i samme kulør, ikke fire. Fire hjerter mellem hånd og bord er i sig selv intet værd.",
      "Tre ens dannet af et par på hånden plus et kort på bordet kaldes et <em>set</em>; dannet af ét kort på hånden plus et par på bordet kaldes det <em>trips</em>. Samme rangering, meget forskellig styrke, for trips kan alle se.",
      "Kun de bedste fem tæller. To par på hånden og et tredje par på bordet giver to par, ikke tre.",
      "Procenterne ovenfor viser, hvor ofte hver hånd overhovedet opstår frem til river over syv kort, ikke hvor ofte den vinder. To par ser dagligdags ud og ligger alligevel foran det meste, det møder."
    ],
    seeH2: "Se det ved bordet",
    seeP: "PokerTH skriver navnet på din bedste hånd lige nu under bordet, mens du spiller, så du aldrig skal regne den ud under tidspres, og ved showdown vises hver åbnet hånd med de fem kort, der rent faktisk talte, fremhævet. At træne offline mod computermodstanderne er den hurtigste vej til at få rækkefølgen ind i fingrene."
  },

  nb: {
    title: "Pokerhender — rekkefølgen på hender i Texas Hold’em",
    desc: "Alle ti pokerhender i Texas Hold’em fra royal flush til høyt kort, med eksempler, sannsynligheten for hver hånd og hvordan kickere og like hender avgjøres.",
    ldHeadline: "Pokerhender — Texas Hold’em",
    ldDesc: "De ti hendene i Texas Hold’em i rekkefølge, med eksempler, hyppighet og regler ved like hender.",
    h1: "Pokerhender",
    lead: "I Texas Hold’em rangeres hendene fra sterkest til svakest slik. En hånd er alltid nøyaktig fem kort, valgt blant de sju du ser: dine to lukkede kort og de fem felleskortene. Du må aldri bruke dine egne kort — hvis bordet alene utgjør de fem beste, er det også din hånd.",
    names: ["Royal flush", "Fargestige", "Firtall", "Fullt hus", "Farge", "Stige", "Tress", "To par", "Par", "Høyt kort"],
    texts: [
      "A K Q J 10 i samme farge. Den beste hånden som finnes: den kan ikke slås, bare deles.",
      "Fem kort på rad i samme farge. Mellom to fargestiger vinner den med høyest toppkort.",
      "Fire kort av samme verdi. Det femte kortet (kickeren) avgjør det sjeldne tilfellet der firtallet ligger på bordet.",
      "Tress pluss et par. Først sammenlignes tressen, deretter paret.",
      "Fem kort i samme farge, ikke på rad. Sammenlignes kort for kort ovenfra; ingen farge går foran en annen.",
      "Fem kort på rad i blandede farger. Esset spiller høyt (10-J-Q-K-A) eller lavt (A-2-3-4-5), aldri begge deler samtidig.",
      "Tre kort av samme verdi, pluss to kort uten sammenheng.",
      "To ulike par pluss et femte kort. Først sammenlignes det høye paret, så det lave, så kickeren.",
      "To kort av samme verdi pluss tre kort uten sammenheng, sammenlignet i rekkefølge.",
      "Ingen av delene over. Det høyeste kortet avgjør, deretter det neste, og så videre."
    ],
    dealt: "forekommer i %s av alle sjukortshender",
    tiesH2: "Hvordan like hender avgjøres",
    tiesP: "Sammenlign kategorien først: en hvilken som helst farge slår en hvilken som helst stige, uansett kort. Innenfor samme kategori sammenlignes verdi for verdi ovenfra. Det som blir igjen etter kombinasjonen, kalles <em>kicker</em>, og den avgjør flere hender enn nybegynnere venter seg: A♠ K♦ og A♣ 7♥ gir begge et par ess på et bord med A-9-4, men kongen slår sjueren. Farger avgjør aldri i Hold’em — to spillere med de samme fem verdiene deler potten, ned til siste sjetong.",
    wrongH2: "Det folk oftest tar feil av",
    wrong: [
      "Esset er både det høyeste og det laveste kortet i en stige: A-K-Q-J-10 er den beste, A-2-3-4-5 (kalt <em>wheel</em>) den svakeste. Rekken går ikke rundt — Q-K-A-2-3 er ingenting.",
      "En farge er fem kort i samme farge, ikke fire. Fire hjerter mellom hånden og bordet er i seg selv verdiløst.",
      "En tress bygget på et par på hånden pluss ett kort på bordet kalles <em>set</em>; bygget på ett kort på hånden pluss et par på bordet kalles den <em>trips</em>. Samme rangering, svært ulik styrke, for trips ser alle.",
      "Bare de fem beste teller. To par på hånden og et tredje par på bordet gir to par, ikke tre.",
      "Prosentene over viser hvor ofte hver hånd i det hele tatt oppstår fram til river over sju kort, ikke hvor ofte den vinner. To par ser hverdagslig ut og ligger likevel foran det meste den møter."
    ],
    seeH2: "Se det ved bordet",
    seeP: "PokerTH skriver navnet på den beste hånden du har akkurat nå under bordet mens du spiller, så du aldri trenger å regne den ut under tidspress, og ved showdown vises hver åpnet hånd med de fem kortene som faktisk talte, uthevet. Å trene offline mot datamotstanderne er den raskeste måten å få rekkefølgen inn i fingrene på."
  },
  ne: {
    title: "पोकर ह्यान्ड — Texas Hold’em मा ह्यान्डको क्रम",
    desc: "Texas Hold’em पोकरका दस ह्यान्ड रोयल फ्लसदेखि हाई कार्डसम्म क्रमबद्ध, उदाहरण, हरेकको सम्भावना र बराबरी कसरी छुट्याइन्छ भन्नेसहित।",
    ldHeadline: "पोकर ह्यान्ड — Texas Hold’em",
    ldDesc: "Texas Hold’em का दस ह्यान्ड क्रमैसँग, उदाहरण, आवृत्ति र बराबरीका नियमसहित।",
    h1: "पोकर ह्यान्ड",
    lead: "Texas Hold’em मा ह्यान्डहरू बलियोदेखि कमजोरसम्म यसरी क्रमबद्ध हुन्छन्। ह्यान्ड सधैं ठ्याक्कै पाँच कार्डको हुन्छ, जुन तपाईंले देख्ने सातमध्ये छानिन्छ: तपाईंका दुई निजी कार्ड र टेबलका पाँच साझा कार्ड।",
    names: [
      "रोयल फ्लस",
      "स्ट्रेट फ्लस",
      "फोर अफ अ काइन्ड",
      "फुल हाउस",
      "फ्लस",
      "स्ट्रेट",
      "थ्री अफ अ काइन्ड",
      "टु पेयर",
      "वन पेयर",
      "हाई कार्ड",
    ],
    texts: [
      "A K Q J 10, सबै एउटै सूटका। सम्भव भएसम्मको उत्कृष्ट ह्यान्ड; यसलाई हराउन सकिँदैन, बराबरी मात्र गर्न सकिन्छ।",
      "लगातार पाँच कार्ड, सबै एउटै सूटका। दुई स्ट्रेट फ्लसबीच माथिल्लो कार्ड ठूलो हुनेले जित्छ।",
      "एउटै मानका चार कार्ड। पाँचौं कार्ड (किकर) ले टेबलमा दुई उस्तै फोर अफ अ काइन्डबीचको दुर्लभ बराबरी छुट्याउँछ।",
      "थ्री अफ अ काइन्ड र एउटा जोडी। पहिले तीन कार्डको भाग, त्यसपछि जोडी तुलना गरिन्छ।",
      "एउटै सूटका पाँच कार्ड, क्रममा नभएका। माथिबाट एक-एक कार्ड तुलना गरिन्छ; कुनै सूट अर्कोभन्दा ठूलो हुँदैन।",
      "लगातार पाँच कार्ड, मिश्रित सूट। एक्का ठूलो (10-J-Q-K-A) वा सानो (A-2-3-4-5) खेल्छ, कहिल्यै दुवै एकैपटक होइन।",
      "एउटै मानका तीन कार्ड, र दुई असम्बन्धित कार्ड।",
      "दुई फरक जोडी र पाँचौं कार्ड। पहिले ठूलो जोडी, त्यसपछि सानो जोडी, त्यसपछि किकर तुलना गरिन्छ।",
      "एउटै मानका दुई कार्ड र तीन असम्बन्धित कार्ड, क्रमैसँग तुलना गरिन्छ।",
      "माथिका कुनै पनि होइन। सबैभन्दा ठूलो कार्डले निर्णय गर्छ, त्यसपछि अर्कोले, र यस्तै।",
    ],
    dealt: "सात-कार्डका ह्यान्डमध्ये %s मा देखिन्छ",
    tiesH2: "बराबरी कसरी छुट्याइन्छ",
    tiesP: "पहिले वर्ग तुलना गरिन्छ: जुनसुकै फ्लसले कार्ड जेसुकै भए पनि जुनसुकै स्ट्रेटलाई हराउँछ। उही वर्ग भए माथिबाट मान-मान तुलना गरिन्छ। संयोजनपछि बाँकी रहेको कार्डलाई <em>किकर</em> भनिन्छ, र यसले सुरुवाती खेलाडीले सोचेभन्दा धेरै ह्यान्डको निर्णय गर्छ: A♠ K♦ र A♣ 7♥ दुवैले A-9-4 टेबलमा एक्काको जोडी बनाउँछन्, तर किकरमा राजाले सातलाई हराउँछ। Hold’em मा सूटले कहिल्यै केही छुट्याउँदैन — उही पाँच मान भएका दुई खेलाडीले अन्तिम चिपसम्म पोट बाँड्छन्।",
    wrongH2: "गलत धारणाहरू",
    wrong: [
      "एक्का स्ट्रेटको सबैभन्दा ठूलो र सबैभन्दा सानो दुवै कार्ड हो: A-K-Q-J-10 उत्कृष्ट हो, A-2-3-4-5 (<em>व्हील</em>) सबैभन्दा कमजोर। क्रम घुम्दैन — Q-K-A-2-3 केही होइन।",
      "फ्लस भनेको चार होइन, एउटै सूटका पाँच कार्ड हो। तपाईंको हात र टेबलबीचका चार पान आफैंमा केही होइनन्।",
      "हातको जोडी र टेबलको एक कार्डबाट बनेको थ्री अफ अ काइन्डलाई <em>set</em> भनिन्छ; हातको एक कार्ड र टेबलको जोडीबाट बनेकोलाई <em>trips</em>। उही क्रम, तर बल धेरै फरक, किनकि trips सबैले देख्छन्।",
      "उत्कृष्ट पाँच कार्ड मात्र गनिन्छन्। हातमा दुई जोडी र टेबलमा तेस्रो जोडी भए तपाईंसँग तीन होइन, दुई जोडी हुन्छ।",
      "माथिका प्रतिशतले सात कार्डसहित रिभरमा हरेक ह्यान्ड कति पटक देखिन्छ भन्छन्, कति पटक जित्छ भन्दैनन्। टु पेयर साधारण लाग्छ तर भेटिनेमध्ये धेरैजसोभन्दा अगाडि रहन्छ।",
    ],
    seeH2: "टेबलमा हेर्नुहोस्",
    seeP: "खेलको बेला PokerTH ले तपाईंको उत्कृष्ट संयोजन टेबलमुनि बताउँछ, ताकि समयको दबाबमा आफैं जोड्नु नपरोस्, र शोडाउनमा हरेक खुलेको ह्यान्ड गनिएका पाँच कार्ड हाइलाइट गरेर देखाउँछ। कम्प्युटरले चलाउने प्रतिद्वन्द्वीविरुद्ध अफलाइन अभ्यास यो क्रम कण्ठ गर्ने सबैभन्दा छिटो तरिका हो।",
  },

  fi: {
    title: "Pokerikädet — käsien järjestys Texas Hold’emissa",
    desc: "Texas Hold’emin kaikki kymmenen pokerikättä värisuorasta ässästä korkeimpaan korttiin, esimerkkeineen, kunkin käden todennäköisyys sekä kickerin ja tasatilanteiden ratkaisu.",
    ldHeadline: "Pokerikädet — Texas Hold’em",
    ldDesc: "Texas Hold’emin kymmenen kättä järjestyksessä, esimerkit, yleisyydet ja tasatilanteiden säännöt.",
    h1: "Pokerikädet",
    lead: "Texas Hold’emissa kädet asettuvat vahvimmasta heikoimpaan näin. Käsi on aina täsmälleen viisi korttia, jotka valitaan näkemästäsi seitsemästä: kahdesta omasta korttistasi ja viidestä yhteisestä kortista. Omia korttejasi ei ole pakko käyttää — jos pöytä yksin muodostaa parhaan viisikon, se on myös sinun kätesi.",
    names: ["Värisuora ässästä", "Värisuora", "Neloset", "Täyskäsi", "Väri", "Suora", "Kolmoset", "Kaksi paria", "Pari", "Korkein kortti"],
    texts: [
      "A K Q J 10 samaa maata. Paras mahdollinen käsi: sitä ei voi voittaa, vain tasata.",
      "Viisi peräkkäistä korttia samaa maata. Kahdesta värisuorasta voittaa se, jonka ylin kortti on korkeampi.",
      "Neljä samanarvoista korttia. Viides kortti (kicker) ratkaisee harvinaisen tasatilanteen, jossa neloset ovat pöydässä.",
      "Kolmoset ja pari. Ensin verrataan kolmosia, sitten paria.",
      "Viisi samaa maata olevaa korttia, ei peräkkäin. Vertaillaan kortti kerrallaan ylhäältä alas; mikään maa ei ole toista arvokkaampi.",
      "Viisi peräkkäistä korttia sekamaissa. Ässä pelaa ylhäällä (10-J-Q-K-A) tai alhaalla (A-2-3-4-5), ei koskaan molemmissa yhtä aikaa.",
      "Kolme samanarvoista korttia sekä kaksi irrallista korttia.",
      "Kaksi eri paria ja viides kortti. Ensin verrataan korkeampi pari, sitten matalampi, sitten kicker.",
      "Kaksi samanarvoista korttia ja kolme irrallista korttia, joita verrataan järjestyksessä.",
      "Ei mikään edellisistä. Korkein kortti ratkaisee, sitten seuraava, ja niin edelleen."
    ],
    dealt: "syntyy %s:ssa seitsemän kortin käsistä",
    tiesH2: "Miten tasatilanteet ratkaistaan",
    tiesP: "Ensin verrataan kategoriaa: mikä tahansa väri voittaa minkä tahansa suoran, korteista riippumatta. Saman kategorian sisällä verrataan arvo kerrallaan ylhäältä alas. Yhdistelmän jälkeen jäävää korttia kutsutaan <em>kickeriksi</em>, ja se ratkaisee useampia käsiä kuin aloittelija odottaa: pöydässä A-9-4 sekä A♠ K♦ että A♣ 7♥ muodostavat ässäparin, mutta kuningas voittaa seiskan. Maat eivät koskaan ratkaise tasatilannetta Hold’emissa — kaksi pelaajaa samoilla viidellä arvolla jakavat potin viimeistä pelimerkkiä myöten.",
    wrongH2: "Yleisimmät väärinkäsitykset",
    wrong: [
      "Ässä on suoralle sekä korkein että matalin kortti: A-K-Q-J-10 on paras, A-2-3-4-5 (niin sanottu <em>wheel</em>) heikoin. Sarja ei kierrä ympäri — Q-K-A-2-3 ei ole yhtään mitään.",
      "Väri on viisi samaa maata olevaa korttia, ei neljä. Neljä hertta kädessä ja pöydässä yhteensä ei ole itsessään minkään arvoinen.",
      "Kädessä olevasta parista ja yhdestä pöydän kortista syntyvää kolmosta kutsutaan nimellä <em>set</em>; yhdestä käden kortista ja pöydän parista syntyvää nimellä <em>trips</em>. Sama sija, hyvin eri vahvuus, sillä trips näkyy kaikille.",
      "Vain viisi parasta korttia lasketaan. Kaksi paria kädessä ja kolmas pari pöydässä antaa kaksi paria, ei kolmea.",
      "Yllä olevat prosentit kertovat, kuinka usein kukin käsi ylipäätään syntyy riveriin mennessä seitsemästä kortista, ei kuinka usein se voittaa. Kaksi paria näyttää arkiselta ja on silti edellä useimpia vastaantulijoita."
    ],
    seeH2: "Näin se näkyy pöydässä",
    seeP: "PokerTH kertoo pelin aikana pöydän alla, mikä on tällä hetkellä paras kätesi, joten sitä ei tarvitse koskaan koota itse kellon käydessä, ja showdownissa jokaisesta avatusta kädestä korostetaan ne viisi korttia, jotka todella ratkaisivat. Offline-harjoittelu tietokonevastustajia vastaan on nopein tapa saada järjestys sormiin."
  },

  cs: {
    title: "Pokerové kombinace — pořadí karet v Texas Hold’em",
    desc: "Všech deset pokerových kombinací Texas Hold’em od královské postupky po vysokou kartu, s příklady, pravděpodobností každé z nich a pravidly pro kickera a shodné kombinace.",
    ldHeadline: "Pokerové kombinace — Texas Hold’em",
    ldDesc: "Deset kombinací Texas Hold’em popořadě, s příklady, četností a pravidly pro shodu.",
    h1: "Pokerové kombinace",
    lead: "V Texas Hold’em jsou kombinace seřazeny od nejsilnější po nejslabší takto. Kombinace je vždy přesně pět karet vybraných ze sedmi, které vidíte: vašich dvou vlastních karet a pěti společných. Vlastní karty použít nemusíte — pokud nejlepší pětici tvoří samotný stůl, je to také vaše kombinace.",
    names: ["Královská postupka", "Postupka v barvě", "Čtveřice", "Full house", "Barva", "Postupka", "Trojice", "Dvě dvojice", "Pár", "Vysoká karta"],
    texts: [
      "A K Q J 10 v jedné barvě. Nejlepší možná kombinace: nelze ji porazit, jen jí vyrovnat.",
      "Pět karet za sebou v jedné barvě. Ze dvou postupek v barvě vyhrává ta s vyšší horní kartou.",
      "Čtyři karty stejné hodnoty. Pátá karta (kicker) rozhoduje vzácnou shodu, kdy čtveřice leží přímo na stole.",
      "Trojice a k tomu pár. Nejprve se porovnává trojice, potom pár.",
      "Pět karet jedné barvy, které nejdou za sebou. Porovnávají se po jedné odshora; žádná barva není nad jinou.",
      "Pět karet za sebou v různých barvách. Eso hraje nahoře (10-J-Q-K-A) nebo dole (A-2-3-4-5), nikdy obojí zároveň.",
      "Tři karty stejné hodnoty a dvě nesouvisející karty.",
      "Dvě různé dvojice a pátá karta. Nejprve se porovná vyšší pár, pak nižší, pak kicker.",
      "Dvě karty stejné hodnoty a tři nesouvisející karty, porovnávané popořadě.",
      "Nic z výše uvedeného. Rozhoduje nejvyšší karta, pak další, a tak dál."
    ],
    dealt: "vznikne v %s sedmikartových kombinací",
    tiesH2: "Jak se rozhoduje shoda",
    tiesP: "Nejprve se porovná kategorie: jakákoli barva porazí jakoukoli postupku, ať jsou karty jakékoli. V rámci téže kategorie se porovnává hodnota po hodnotě odshora. Tomu, co po kombinaci zbude, se říká <em>kicker</em>, a rozhoduje víc rozdání, než začátečníci čekají: na stole A-9-4 tvoří A♠ K♦ i A♣ 7♥ pár es, ale král přebíjí sedmičku. Barvy v Hold’em shodu nikdy nerozhodují — dva hráči se stejnými pěti hodnotami si bank rozdělí do posledního žetonu.",
    wrongH2: "Co si lidé vykládají špatně",
    wrong: [
      "Eso je pro postupku zároveň nejvyšší i nejnižší karta: A-K-Q-J-10 je nejlepší, A-2-3-4-5 (takzvané <em>wheel</em>) nejslabší. Řada se neuzavírá — Q-K-A-2-3 není vůbec nic.",
      "Barva je pět karet jedné barvy, ne čtyři. Čtyři srdce mezi rukou a stolem samy o sobě nemají žádnou cenu.",
      "Trojici složené z páru v ruce a jedné karty na stole se říká <em>set</em>; složené z jedné karty v ruce a páru na stole <em>trips</em>. Stejné pořadí, velmi odlišná síla, protože trips vidí všichni.",
      "Počítá se jen nejlepších pět karet. Dvě dvojice v ruce a třetí pár na stole dávají dvě dvojice, ne tři.",
      "Procenta výše říkají, jak často každá kombinace do riveru ze sedmi karet vůbec vznikne, ne jak často vyhraje. Dvě dvojice vypadají všedně a přesto jsou před většinou toho, co potkají."
    ],
    seeH2: "Jak to vidíte u stolu",
    seeP: "PokerTH během hry pod stolem pojmenuje vaši aktuálně nejlepší kombinaci, takže ji nikdy nemusíte skládat pod časovým tlakem, a při showdownu u každé odkryté kombinace zvýrazní právě těch pět karet, které se počítaly. Trénink offline proti počítačovým soupeřům je nejrychlejší způsob, jak si pořadí zafixovat."
  },

  sk: {
    title: "Pokerové kombinácie — poradie kariet v Texas Hold’em",
    desc: "Všetkých desať pokerových kombinácií Texas Hold’em od kráľovskej postupky po vysokú kartu, s príkladmi, pravdepodobnosťou každej z nich a pravidlami pre kickera a zhodu.",
    ldHeadline: "Pokerové kombinácie — Texas Hold’em",
    ldDesc: "Desať kombinácií Texas Hold’em po poradí, s príkladmi, početnosťou a pravidlami pri zhode.",
    h1: "Pokerové kombinácie",
    lead: "V Texas Hold’em sú kombinácie zoradené od najsilnejšej po najslabšiu takto. Kombinácia je vždy presne päť kariet vybraných zo siedmich, ktoré vidíte: vašich dvoch vlastných a piatich spoločných. Vlastné karty použiť nemusíte — ak najlepšiu päticu tvorí samotný stôl, je to takisto vaša kombinácia.",
    names: ["Kráľovská postupka", "Farebná postupka", "Štvorica", "Full house", "Farba", "Postupka", "Trojica", "Dve dvojice", "Pár", "Vysoká karta"],
    texts: [
      "A K Q J 10 v jednej farbe. Najlepšia možná kombinácia: poraziť sa nedá, len vyrovnať.",
      "Päť kariet za sebou v jednej farbe. Z dvoch farebných postupiek vyhráva tá s vyššou hornou kartou.",
      "Štyri karty rovnakej hodnoty. Piata karta (kicker) rozhoduje zriedkavú zhodu, keď štvorica leží priamo na stole.",
      "Trojica a k tomu pár. Najprv sa porovnáva trojica, potom pár.",
      "Päť kariet jednej farby, ktoré nejdú za sebou. Porovnávajú sa po jednej zhora; žiadna farba nie je nad inou.",
      "Päť kariet za sebou v rôznych farbách. Eso hrá hore (10-J-Q-K-A) alebo dole (A-2-3-4-5), nikdy oboje naraz.",
      "Tri karty rovnakej hodnoty a dve nesúvisiace karty.",
      "Dve rôzne dvojice a piata karta. Najprv sa porovná vyšší pár, potom nižší, potom kicker.",
      "Dve karty rovnakej hodnoty a tri nesúvisiace karty, porovnávané po poradí.",
      "Nič z uvedeného. Rozhoduje najvyššia karta, potom ďalšia, a tak ďalej."
    ],
    dealt: "vznikne v %s sedemkartových kombinácií",
    tiesH2: "Ako sa rozhoduje zhoda",
    tiesP: "Najprv sa porovná kategória: hocijaká farba porazí hocijakú postupku, nech sú karty akékoľvek. V rámci tej istej kategórie sa porovnáva hodnota po hodnote zhora. Tomu, čo po kombinácii zostane, sa hovorí <em>kicker</em>, a rozhoduje viac rozdaní, než začiatočníci čakajú: na stole A-9-4 tvoria A♠ K♦ aj A♣ 7♥ pár es, ale kráľ prebíja sedmičku. Farby v Hold’em zhodu nikdy nerozhodujú — dvaja hráči s rovnakými piatimi hodnotami si bank rozdelia do posledného žetónu.",
    wrongH2: "Čo si ľudia vykladajú zle",
    wrong: [
      "Eso je pre postupku zároveň najvyššia aj najnižšia karta: A-K-Q-J-10 je najlepšia, A-2-3-4-5 (takzvané <em>wheel</em>) najslabšia. Rad sa neuzatvára — Q-K-A-2-3 nie je vôbec nič.",
      "Farba je päť kariet jednej farby, nie štyri. Štyri srdcia medzi rukou a stolom samy osebe nemajú žiadnu cenu.",
      "Trojici zloženej z páru v ruke a jednej karty na stole sa hovorí <em>set</em>; zloženej z jednej karty v ruke a páru na stole <em>trips</em>. Rovnaké poradie, veľmi odlišná sila, lebo trips vidia všetci.",
      "Počíta sa len najlepších päť kariet. Dve dvojice v ruke a tretí pár na stole dávajú dve dvojice, nie tri.",
      "Percentá vyššie hovoria, ako často každá kombinácia do riveru zo siedmich kariet vôbec vznikne, nie ako často vyhrá. Dve dvojice vyzerajú všedne a napriek tomu sú pred väčšinou toho, čo stretnú."
    ],
    seeH2: "Ako to vidíte pri stole",
    seeP: "PokerTH počas hry pod stolom pomenuje vašu aktuálne najlepšiu kombináciu, takže ju nikdy nemusíte skladať pod časovým tlakom, a pri showdowne pri každej odkrytej kombinácii zvýrazní práve tých päť kariet, ktoré sa rátali. Tréning offline proti počítačovým súperom je najrýchlejší spôsob, ako si poradie zafixovať."
  },

  ro: {
    title: "Combinații la poker — ordinea mâinilor la Texas Hold’em",
    desc: "Toate cele zece combinații de poker Texas Hold’em, de la chinta roială la carte mare, cu exemple, probabilitatea fiecăreia și modul în care se departajează kickerul și egalitățile.",
    ldHeadline: "Combinații la poker — Texas Hold’em",
    ldDesc: "Cele zece combinații de la Texas Hold’em în ordine, cu exemple, frecvențe și reguli de departajare.",
    h1: "Combinații la poker",
    lead: "La Texas Hold’em mâinile se clasează de la cea mai puternică la cea mai slabă astfel. O mână înseamnă întotdeauna exact cinci cărți, alese dintre cele șapte pe care le vezi: cele două cărți proprii și cele cinci cărți comune. Nu ești obligat să îți folosești propriile cărți — dacă masa singură formează cele mai bune cinci, aceea este și mâna ta.",
    names: ["Chintă roială", "Chintă de culoare", "Careu", "Full house", "Culoare", "Chintă", "Trei de un fel", "Două perechi", "Pereche", "Carte mare"],
    texts: [
      "A K Q J 10 în aceeași culoare. Cea mai bună mână posibilă: nu poate fi bătută, doar egalată.",
      "Cinci cărți consecutive în aceeași culoare. Între două chinte de culoare câștigă cea cu cartea de sus mai mare.",
      "Patru cărți de aceeași valoare. A cincea carte (kickerul) departajează cazul rar în care careul se află chiar pe masă.",
      "Trei de un fel plus o pereche. Se compară întâi cele trei, apoi perechea.",
      "Cinci cărți de aceeași culoare, fără să fie consecutive. Se compară una câte una de sus în jos; nicio culoare nu este mai mare decât alta.",
      "Cinci cărți consecutive, cu culori amestecate. Asul joacă sus (10-J-Q-K-A) sau jos (A-2-3-4-5), niciodată în ambele sensuri deodată.",
      "Trei cărți de aceeași valoare, plus două cărți fără legătură.",
      "Două perechi diferite plus o a cincea carte. Se compară întâi perechea mare, apoi cea mică, apoi kickerul.",
      "Două cărți de aceeași valoare plus trei cărți fără legătură, comparate în ordine.",
      "Niciuna dintre cele de mai sus. Decide cartea cea mai mare, apoi următoarea, și tot așa."
    ],
    dealt: "apare în %s dintre mâinile de șapte cărți",
    tiesH2: "Cum se departajează egalitățile",
    tiesP: "Se compară întâi categoria: orice culoare bate orice chintă, indiferent de cărți. În aceeași categorie se compară valoare cu valoare, de sus în jos. Ce rămâne după combinație se numește <em>kicker</em> și decide mult mai multe mâini decât se așteaptă începătorii: pe o masă A-9-4, atât A♠ K♦ cât și A♣ 7♥ formează o pereche de ași, dar regele întrece șeptarul. La Hold’em culorile nu departajează niciodată — doi jucători cu aceleași cinci valori împart potul, până la ultima fisă.",
    wrongH2: "Ce se înțelege cel mai des greșit",
    wrong: [
      "Asul este în același timp cea mai mare și cea mai mică carte a unei chinte: A-K-Q-J-10 este cea mai bună, A-2-3-4-5 (numită <em>wheel</em>) cea mai slabă. Șirul nu se închide în cerc — Q-K-A-2-3 nu înseamnă nimic.",
      "O culoare înseamnă cinci cărți de aceeași culoare, nu patru. Patru cupe între mâna ta și masă nu valorează nimic prin ele însele.",
      "Trei de un fel formate dintr-o pereche din mână plus o carte de pe masă se numesc <em>set</em>; formate dintr-o carte din mână plus o pereche de pe masă se numesc <em>trips</em>. Aceeași clasare, putere foarte diferită, fiindcă trips se vede de către toată lumea.",
      "Contează doar cele mai bune cinci cărți. Două perechi în mână și a treia pereche pe masă înseamnă tot două perechi, nu trei.",
      "Procentele de mai sus arată cât de des se formează fiecare mână până la river din șapte cărți, nu cât de des câștigă. Două perechi par banale și totuși sunt înaintea celor mai multe mâini pe care le întâlnesc."
    ],
    seeH2: "Cum se vede la masă",
    seeP: "În timpul jocului, PokerTH scrie sub masă numele celei mai bune mâini pe care o ai în acel moment, așa că nu trebuie să o calculezi niciodată cu ceasul pornit, iar la showdown evidențiază, pentru fiecare mână descoperită, exact cele cinci cărți care au contat. Antrenamentul offline împotriva adversarilor controlați de calculator este cea mai rapidă cale de a-ți intra ordinea în reflexe."
  },

  hu: {
    title: "Póker kézsorrend — a lapok rangsora Texas Hold’emben",
    desc: "A Texas Hold’em mind a tíz póker kombinációja a royal flushtől a magas lapig, példákkal, az egyes kezek valószínűségével, valamint a kicker és a döntetlen eldöntésének szabályaival.",
    ldHeadline: "Póker kézsorrend — Texas Hold’em",
    ldDesc: "A Texas Hold’em tíz kombinációja sorrendben, példákkal, gyakoriságokkal és a döntetlen szabályaival.",
    h1: "Póker kézsorrend",
    lead: "Texas Hold’emben a kezek a legerősebbtől a leggyengébbig így rangsorolódnak. Egy kéz mindig pontosan öt lap, amelyet a látható hétből választasz ki: a két saját lapodból és az öt közös lapból. A saját lapjaidat nem kötelező használni — ha maga az asztal adja ki a legjobb ötöst, az is a te kezed.",
    names: ["Royal flush", "Színsor", "Póker", "Full", "Szín", "Sor", "Drill", "Két pár", "Pár", "Magas lap"],
    texts: [
      "A K Q J 10 azonos színben. A lehető legjobb kéz: nem lehet megverni, csak holtversenyt elérni vele.",
      "Öt egymást követő lap azonos színben. Két színsor közül a magasabb felső lapú nyer.",
      "Négy azonos értékű lap. Az ötödik lap (a kicker) azt a ritka holtversenyt dönti el, amikor a négyes maga az asztalon fekszik.",
      "Egy drill és egy pár. Először a drillt hasonlítjuk össze, utána a párt.",
      "Öt azonos színű lap, nem egymás után. Felülről lapról lapra hasonlítjuk össze; egyik szín sem előzi meg a másikat.",
      "Öt egymást követő lap vegyes színben. Az ász felül (10-J-Q-K-A) vagy alul (A-2-3-4-5) játszik, sosem mindkét helyen egyszerre.",
      "Három azonos értékű lap, plusz két össze nem tartozó lap.",
      "Két különböző pár és egy ötödik lap. Először a magasabb párt hasonlítjuk össze, aztán az alacsonyabbat, aztán a kickert.",
      "Két azonos értékű lap és három össze nem tartozó lap, sorrendben összehasonlítva.",
      "A fentiek egyike sem. A legmagasabb lap dönt, aztán a következő, és így tovább."
    ],
    dealt: "a hétlapos kezek %s-ában jön ki",
    tiesH2: "Hogyan dől el a holtverseny",
    tiesP: "Először a kategóriát hasonlítjuk össze: bármelyik szín veri bármelyik sort, akármik is a lapok. Azonos kategórián belül felülről lefelé, értékről értékre haladunk. Amit a kombináció után megmarad, azt <em>kickernek</em> hívjuk, és sokkal több leosztást dönt el, mint a kezdők gondolnák: A-9-4 asztalon az A♠ K♦ és az A♣ 7♥ is ászpárt ad, de a király veri a hetest. Hold’emben a színek soha nem döntenek holtversenyt — két azonos öt értékkel rendelkező játékos az utolsó zsetonig megosztozik a poton.",
    wrongH2: "Amit a legtöbben félreértenek",
    wrong: [
      "Az ász a sorban egyszerre a legmagasabb és a legalacsonyabb lap: A-K-Q-J-10 a legjobb, A-2-3-4-5 (az úgynevezett <em>wheel</em>) a leggyengébb. A sorozat nem fordul körbe — Q-K-A-2-3 az égvilágon semmi.",
      "A szín öt azonos színű lap, nem négy. Négy kőr a kezed és az asztal között önmagában semmit sem ér.",
      "A kézben lévő párból és egy asztali lapból összeálló drillt <em>setnek</em> hívják; a kézben lévő egy lapból és az asztali párból összeállót <em>tripsnek</em>. Ugyanaz a rang, egészen más erő, mert a tripset mindenki látja.",
      "Csak a legjobb öt lap számít. Ha két párod van, és az asztalon ott egy harmadik pár, a kezed akkor is két pár, nem három.",
      "A fenti százalékok azt mutatják, milyen gyakran jön össze egyáltalán az adott kéz a riverig hét lapból, nem azt, milyen gyakran nyer. A két pár hétköznapinak tűnik, mégis a legtöbb szembejövő kéz előtt jár."
    ],
    seeH2: "Így látszik az asztalnál",
    seeP: "A PokerTH játék közben az asztal alatt kiírja az éppen legjobb kezed nevét, így soha nem kell időzavarban fejben összeraknod, a showdownnál pedig minden felfedett kéznél kiemeli azt az öt lapot, amelyik ténylegesen számított. A gép ellenfelek elleni offline gyakorlás a leggyorsabb módja annak, hogy a sorrend az ujjaidba álljon."
  },
  hy: {
    title: "Պոկերի կոմբինացիաներ — կոմբինացիաների կարգը Texas Hold’em-ում",
    desc: "Texas Hold’em պոկերի տասը կոմբինացիաները՝ դասակարգված ռոյալ ֆլեշից մինչև բարձր խաղաթուղթ, օրինակներով, յուրաքանչյուրի հավանականությամբ և թե ինչպես են լուծվում հավասարությունները։",
    ldHeadline: "Պոկերի կոմբինացիաներ — Texas Hold’em",
    ldDesc: "Texas Hold’em-ի տասը կոմբինացիաները հերթականությամբ՝ օրինակներով, հաճախականություններով և հավասարության կանոններով։",
    h1: "Պոկերի կոմբինացիաներ",
    lead: "Texas Hold’em-ում կոմբինացիաները դասակարգվում են ամենաուժեղից ամենաթույլը հետևյալ կերպ։ Կոմբինացիան միշտ բաղկացած է ճիշտ հինգ խաղաթղթից՝ ընտրված ձեր տեսած յոթից. ձեր երկու անձնական խաղաթղթերը և սեղանի հինգ ընդհանուր խաղաթղթերը։",
    names: [
      "Ռոյալ ֆլեշ",
      "Սթրիթ ֆլեշ",
      "Կարե",
      "Ֆուլ հաուս",
      "Ֆլեշ",
      "Սթրիթ",
      "Եռյակ",
      "Երկու զույգ",
      "Զույգ",
      "Բարձր խաղաթուղթ",
    ],
    texts: [
      "A K Q J 10, բոլորը նույն մաստի։ Հնարավոր լավագույն կոմբինացիան. այն հնարավոր չէ հաղթել, միայն հավասարվել։",
      "Հինգ հաջորդական խաղաթուղթ, բոլորը նույն մաստի։ Երկու սթրիթ ֆլեշի միջև հաղթում է ավելի բարձր վերին խաղաթուղթ ունեցողը։",
      "Նույն արժեքի չորս խաղաթուղթ։ Հինգերորդ խաղաթուղթը (կիկերը) լուծում է սեղանի վրա երկու միանման կարեների միջև հազվագյուտ հավասարությունը։",
      "Եռյակ գումարած զույգ։ Նախ համեմատվում է երեք խաղաթղթանոց մասը, ապա զույգը։",
      "Նույն մաստի հինգ խաղաթուղթ, ոչ հաջորդական։ Համեմատվում են խաղաթուղթ առ խաղաթուղթ՝ վերևից. ոչ մի մաստ գերակա չէ մյուսից։",
      "Հինգ հաջորդական խաղաթուղթ, խառը մաստեր։ Տուզը խաղում է բարձր (10-J-Q-K-A) կամ ցածր (A-2-3-4-5), երբեք երկուսը միաժամանակ։",
      "Նույն արժեքի երեք խաղաթուղթ, գումարած երկու չկապված խաղաթուղթ։",
      "Երկու տարբեր զույգ գումարած հինգերորդ խաղաթուղթ։ Նախ համեմատվում է բարձր զույգը, ապա ցածրը, ապա կիկերը։",
      "Նույն արժեքի երկու խաղաթուղթ գումարած երեք չկապված խաղաթուղթ՝ համեմատված հերթականությամբ։",
      "Վերոնշյալներից ոչ մեկը։ Որոշում է ամենաբարձր խաղաթուղթը, ապա հաջորդը և այլն։",
    ],
    dealt: "հանդիպում է յոթ խաղաթղթանոց ձեռքերի %s-ում",
    tiesH2: "Ինչպես են լուծվում հավասարությունները",
    tiesP: "Նախ համեմատվում է կատեգորիան. ցանկացած ֆլեշ հաղթում է ցանկացած սթրիթին՝ անկախ խաղաթղթերից։ Նույն կատեգորիայի դեպքում համեմատվում է արժեք առ արժեք՝ սկսած վերևից։ Կոմբինացիայից հետո մնացածը կոչվում է <em>կիկեր</em>, և այն որոշում է շատ ավելի ձեռքեր, քան սկսնակները պատկերացնում են. A♠ K♦ և A♣ 7♥ երկուսն էլ տալիս են տուզերի զույգ A-9-4 սեղանի վրա, բայց թագավորը կիկերով հաղթում է յոթին։ Hold’em-ում մաստերը երբեք ոչինչ չեն որոշում — նույն հինգ արժեքներով երկու խաղաթղթեր կիսում են բանկը մինչև վերջին ֆիշկան։",
    wrongH2: "Ինչ են սխալմամբ կարծում",
    wrong: [
      "Տուզը սթրիթում և՛ ամենաբարձր, և՛ ամենացածր խաղաթուղթն է. A-K-Q-J-10-ը լավագույնն է, A-2-3-4-5-ը (<em>անիվը</em>)՝ ամենաթույլը։ Հաջորդականությունը չի փակվում — Q-K-A-2-3-ը ոչինչ չէ։",
      "Ֆլեշը նույն մաստի հինգ խաղաթուղթ է, ոչ թե չորս։ Ձեր ձեռքի և սեղանի միջև չորս սիրտն ինքնին ոչինչ չարժե։",
      "Ձեր ձեռքի զույգից գումարած սեղանի խաղաթղթից կազմված եռյակը կոչվում է <em>set</em>. ձեր ձեռքի մեկ խաղաթղթից գումարած սեղանի զույգից կազմվածը՝ <em>trips</em>։ Նույն դասակարգում, շատ տարբեր ուժ, որովհետև trips-ը տեսանելի է բոլորին։",
      "Հաշվվում են միայն լավագույն հինգ խաղաթղթերը։ Ձեռքում երկու զույգով և սեղանին երրորդ զույգով դուք ունեք երկու զույգ, ոչ թե երեք։",
      "Վերևի տոկոսները ցույց են տալիս, թե որքան հաճախ է յուրաքանչյուր կոմբինացիա հայտնվում river-ում յոթ խաղաթղթով, ոչ թե որքան հաճախ է այն հաղթում։ Երկու զույգը սովորական է թվում և մնում է առջևում իր հանդիպածների մեծ մասից։",
    ],
    seeH2: "Տեսնել սեղանի մոտ",
    seeP: "PokerTH-ը խաղի ընթացքում անվանում է ձեր լավագույն կոմբինացիան սեղանի տակ, որպեսզի երբեք ստիպված չլինեք այն վերակազմել ժամանակի ճնշման տակ, իսկ showdown-ում ցույց է տալիս յուրաքանչյուր բացված ձեռքը՝ ընդգծելով հաշվի առնված հինգ խաղաթղթերը։ Համակարգչով կառավարվող մրցակիցների դեմ անցանց մարզումը մնում է այս դասակարգումը յուրացնելու ամենաարագ ճանապարհը։",
  },

  'pt-PT': {
    title: "Mãos do póquer — ordem das mãos no Texas Hold’em",
    desc: "As dez mãos do póquer Texas Hold’em por ordem, do royal flush à carta alta, com exemplos, a probabilidade de cada uma e a forma como kickers e empates são resolvidos.",
    ldHeadline: "Mãos do póquer — Texas Hold’em",
    ldDesc: "As dez mãos do Texas Hold’em por ordem, com exemplos, frequências e regras de desempate.",
    h1: "Mãos do póquer",
    lead: "No Texas Hold’em as mãos são ordenadas da mais forte para a mais fraca da seguinte forma. Uma mão tem sempre exactamente cinco cartas, escolhidas entre as sete que vê: as suas duas cartas fechadas e as cinco cartas comuns. Não é obrigado a usar as suas — se a mesa sozinha formar as melhores cinco, essa é também a sua mão.",
    names: ["Royal Flush", "Straight Flush", "Quadra", "Full House", "Flush", "Sequência", "Trinca", "Dois Pares", "Par", "Carta Alta"],
    texts: [
      "A K Q J 10, todas do mesmo naipe. A melhor mão possível: não pode ser batida, apenas empatada.",
      "Cinco cartas seguidas, todas do mesmo naipe. Entre dois straight flushes ganha o que tiver a carta de topo mais alta.",
      "Quatro cartas do mesmo valor. A quinta carta (o kicker) resolve o raro empate em que a quadra está na própria mesa.",
      "Uma trinca acompanhada de um par. Compara-se primeiro a trinca e depois o par.",
      "Cinco cartas do mesmo naipe, sem serem seguidas. Comparadas uma a uma a partir da mais alta; nenhum naipe vale mais do que outro.",
      "Cinco cartas seguidas, com naipes misturados. O ás joga em cima (10-J-Q-K-A) ou em baixo (A-2-3-4-5), nunca dos dois lados ao mesmo tempo.",
      "Três cartas do mesmo valor, mais duas cartas sem relação.",
      "Dois pares diferentes mais uma quinta carta. Compara-se primeiro o par mais alto, depois o mais baixo e depois o kicker.",
      "Duas cartas do mesmo valor mais três cartas sem relação, comparadas por ordem.",
      "Nenhuma das anteriores. Decide a carta mais alta, depois a seguinte, e assim sucessivamente."
    ],
    dealt: "aparece em %s das mãos de sete cartas",
    tiesH2: "Como se resolvem os empates",
    tiesP: "Compara-se primeiro a categoria: qualquer flush ganha a qualquer sequência, sejam quais forem as cartas. Dentro da mesma categoria, compara-se valor a valor de cima para baixo. O que sobra depois da combinação chama-se <em>kicker</em>, e decide muito mais mãos do que os principiantes supõem: numa mesa A-9-4, tanto A♠ K♦ como A♣ 7♥ formam um par de ases, mas o rei supera o sete. No Hold’em os naipes nunca desempatam — dois jogadores com os mesmos cinco valores dividem o pote até à última ficha.",
    wrongH2: "O que se costuma perceber mal",
    wrong: [
      "O ás é ao mesmo tempo a carta mais alta e a mais baixa de uma sequência: A-K-Q-J-10 é a melhor, A-2-3-4-5 (a chamada <em>roda</em>) é a mais fraca. A sequência não dá a volta — Q-K-A-2-3 não vale nada.",
      "Um flush são cinco cartas de um naipe, não quatro. Quatro copas entre a sua mão e a mesa não valem nada por si só.",
      "Uma trinca formada por um par na mão mais uma carta da mesa chama-se <em>set</em>; formada por uma carta da mão mais um par na mesa chama-se <em>trips</em>. A mesma classificação, força muito diferente, porque a trips está à vista de todos.",
      "Só contam as melhores cinco cartas. Ter dois pares e um terceiro par na mesa continua a ser dois pares, não três.",
      "As percentagens acima indicam com que frequência cada mão se forma até ao river a partir de sete cartas, e não com que frequência ganha. Dois pares parecem banais e ainda assim estão à frente da maior parte do que encontram."
    ],
    seeH2: "Ver isto na mesa",
    seeP: "Durante o jogo, o PokerTH escreve por baixo da mesa o nome da sua melhor mão nesse momento, para que nunca tenha de a montar com o relógio a correr, e no showdown mostra cada mão revelada com as cinco cartas que realmente contaram em destaque. Treinar offline contra os adversários do computador é a forma mais rápida de fixar esta ordem."
  },

  'zh-TW': {
    title: "撲克牌型大小 — 德州撲克牌型排名",
    desc: "德州撲克全部十種牌型從皇家同花順到高牌的排序，附範例、每種牌型出現的機率，以及踢腳牌與平手的判定方式。",
    ldHeadline: "撲克牌型大小 — 德州撲克",
    ldDesc: "德州撲克十種牌型依序排列，附範例、出現頻率與平手判定規則。",
    h1: "撲克牌型大小",
    lead: "德州撲克的牌型由大到小排列如下。一手牌永遠正好是五張，從你看得到的七張中選出：你的兩張底牌和五張公共牌。你並不一定要用自己的底牌——如果公共牌本身就湊成最好的五張，那同樣是你的牌。",
    names: ["皇家同花順", "同花順", "四條", "葫蘆", "同花", "順子", "三條", "兩對", "一對", "高牌"],
    texts: [
      "同花色的 A K Q J 10。可能出現的最大牌型：無法被擊敗，只能打平。",
      "同花色的五張連續牌。兩副同花順相比，最大的那張牌較大者獲勝。",
      "四張相同點數的牌。第五張牌（踢腳牌）用來判定四條出現在公共牌上的罕見平手。",
      "三條加一對。先比三條，再比對子。",
      "五張同花色但不連續的牌。從最大的一張開始逐張比較；花色之間沒有大小之分。",
      "五張連續但花色不一致的牌。A 可以當最大（10-J-Q-K-A）或最小（A-2-3-4-5），但不能同時兼顧。",
      "三張相同點數的牌，加兩張無關的牌。",
      "兩組不同的對子加第五張牌。先比大對，再比小對，最後比踢腳牌。",
      "兩張相同點數的牌加三張無關的牌，依序比較。",
      "以上皆非。由最大的一張牌決定，接著是下一張，依此類推。"
    ],
    dealt: "在七張牌中出現的機率為 %s",
    tiesH2: "平手如何判定",
    tiesP: "先比牌型類別：無論牌面為何，任何同花都大過任何順子。同一類別之內，由大到小逐個點數比較。組成牌型之後剩下的牌稱為<em>踢腳牌</em>，它決定的牌局遠比初學者想像的多：在 A-9-4 的公共牌上，A♠ K♦ 和 A♣ 7♥ 都是一對 A，但 K 壓過 7。德州撲克中花色從不用來判定大小——五張點數完全相同的兩名玩家平分底池，直到最後一枚籌碼。",
    wrongH2: "常見的誤解",
    wrong: [
      "組成順子時，A 既是最大的牌也是最小的牌：A-K-Q-J-10 最大，A-2-3-4-5（即<em>輪子</em>）最小。順序不會首尾相接——Q-K-A-2-3 什麼都不是。",
      "同花是五張同花色的牌，不是四張。手牌加公共牌一共四張紅心，本身毫無價值。",
      "用手中的一對加公共牌上的一張組成的三條叫 <em>set</em>；用手中的一張加公共牌上的一對組成的叫 <em>trips</em>。牌型相同，強度卻大不一樣，因為 trips 所有人都看得見。",
      "只有最好的五張才算數。手上兩對、公共牌上還有第三對，你的牌仍然是兩對，而不是三對。",
      "上面的百分比表示每種牌型在七張牌中到河牌為止出現的頻率，而不是它獲勝的頻率。兩對看起來很普通，卻依然領先於它所遇到的大部分牌。"
    ],
    seeH2: "在牌桌上看到它",
    seeP: "遊戲過程中，PokerTH 會在公共牌下方標出你目前的最佳牌型，你不必在時間壓力下自己去湊；攤牌時則會把每一手亮出的牌連同真正生效的那五張一起高亮顯示。離線對戰電腦對手是把這套牌型大小練成本能的最快方式。"
  },

  el: {
    title: "Κατάταξη χεριών στο πόκερ — η σειρά των χεριών στο Texas Hold’em",
    desc: "Και τα δέκα χέρια του πόκερ Texas Hold’em με τη σειρά, από το ρουαγιάλ φλος ως το υψηλό φύλλο, με παραδείγματα, την πιθανότητα κάθε χεριού και τον τρόπο που κρίνονται το κίκερ και οι ισοπαλίες.",
    ldHeadline: "Κατάταξη χεριών στο πόκερ — Texas Hold’em",
    ldDesc: "Τα δέκα χέρια του Texas Hold’em με τη σειρά, με παραδείγματα, συχνότητες και κανόνες ισοπαλίας.",
    h1: "Κατάταξη χεριών στο πόκερ",
    lead: "Στο Texas Hold’em τα χέρια κατατάσσονται από το ισχυρότερο στο ασθενέστερο ως εξής. Ένα χέρι είναι πάντα ακριβώς πέντε φύλλα, επιλεγμένα ανάμεσα στα εφτά που βλέπετε: τα δύο κλειστά σας φύλλα και τα πέντε κοινά. Δεν είστε υποχρεωμένοι να χρησιμοποιήσετε τα δικά σας — αν το τραπέζι από μόνο του σχηματίζει την καλύτερη πεντάδα, αυτό είναι επίσης το χέρι σας.",
    names: ["Ρουαγιάλ φλος", "Κέντα φλος", "Καρέ", "Φουλ", "Φλος", "Κέντα", "Τριάδα", "Δύο ζευγάρια", "Ζευγάρι", "Υψηλό φύλλο"],
    texts: [
      "A K Q J 10 στο ίδιο χρώμα. Το καλύτερο δυνατό χέρι: δεν νικιέται, μόνο ισοφαρίζεται.",
      "Πέντε συνεχόμενα φύλλα στο ίδιο χρώμα. Ανάμεσα σε δύο κέντες φλος κερδίζει αυτή με το υψηλότερο πάνω φύλλο.",
      "Τέσσερα φύλλα ίδιας αξίας. Το πέμπτο φύλλο (το κίκερ) κρίνει τη σπάνια ισοπαλία όταν το καρέ βρίσκεται στο ίδιο το τραπέζι.",
      "Μια τριάδα μαζί με ένα ζευγάρι. Πρώτα συγκρίνεται η τριάδα και μετά το ζευγάρι.",
      "Πέντε φύλλα ίδιου χρώματος, χωρίς να είναι συνεχόμενα. Συγκρίνονται ένα προς ένα από το υψηλότερο· κανένα χρώμα δεν υπερέχει άλλου.",
      "Πέντε συνεχόμενα φύλλα με ανάμεικτα χρώματα. Ο άσος παίζει ψηλά (10-J-Q-K-A) ή χαμηλά (A-2-3-4-5), ποτέ και στα δύο μαζί.",
      "Τρία φύλλα ίδιας αξίας, συν δύο άσχετα φύλλα.",
      "Δύο διαφορετικά ζευγάρια συν ένα πέμπτο φύλλο. Συγκρίνεται πρώτα το ψηλό ζευγάρι, μετά το χαμηλό, μετά το κίκερ.",
      "Δύο φύλλα ίδιας αξίας συν τρία άσχετα φύλλα, που συγκρίνονται με τη σειρά.",
      "Τίποτα από τα παραπάνω. Κρίνει το υψηλότερο φύλλο, μετά το επόμενο, και ούτω καθεξής."
    ],
    dealt: "εμφανίζεται στο %s των χεριών των εφτά φύλλων",
    tiesH2: "Πώς κρίνονται οι ισοπαλίες",
    tiesP: "Πρώτα συγκρίνεται η κατηγορία: οποιοδήποτε φλος νικά οποιαδήποτε κέντα, όποια κι αν είναι τα φύλλα. Μέσα στην ίδια κατηγορία η σύγκριση γίνεται αξία προς αξία από πάνω προς τα κάτω. Ό,τι περισσεύει μετά τον συνδυασμό λέγεται <em>κίκερ</em>, και κρίνει πολύ περισσότερα χέρια απ’ όσο περιμένουν οι αρχάριοι: σε τραπέζι A-9-4 τόσο το A♠ K♦ όσο και το A♣ 7♥ δίνουν ζευγάρι άσων, αλλά ο ρήγας υπερτερεί του εφτά. Στο Hold’em τα χρώματα δεν λύνουν ποτέ ισοπαλία — δύο παίκτες με τις ίδιες πέντε αξίες μοιράζονται το πότ ως την τελευταία μάρκα.",
    wrongH2: "Τα πιο συνηθισμένα λάθη",
    wrong: [
      "Ο άσος είναι ταυτόχρονα το υψηλότερο και το χαμηλότερο φύλλο μιας κέντας: A-K-Q-J-10 η καλύτερη, A-2-3-4-5 (η λεγόμενη <em>wheel</em>) η ασθενέστερη. Η σειρά δεν κλείνει κύκλο — το Q-K-A-2-3 δεν είναι απολύτως τίποτα.",
      "Το φλος είναι πέντε φύλλα ενός χρώματος, όχι τέσσερα. Τέσσερα κούπα ανάμεσα στο χέρι σας και στο τραπέζι δεν αξίζουν από μόνα τους τίποτα.",
      "Η τριάδα από ζευγάρι στο χέρι συν ένα φύλλο στο τραπέζι λέγεται <em>set</em>· από ένα φύλλο στο χέρι συν ζευγάρι στο τραπέζι λέγεται <em>trips</em>. Ίδια κατάταξη, πολύ διαφορετική δύναμη, γιατί το trips το βλέπουν όλοι.",
      "Μετρούν μόνο τα πέντε καλύτερα φύλλα. Δύο ζευγάρια στο χέρι και τρίτο ζευγάρι στο τραπέζι δίνουν δύο ζευγάρια, όχι τρία.",
      "Τα παραπάνω ποσοστά δείχνουν πόσο συχνά σχηματίζεται κάθε χέρι ως το ριβέρ μέσα σε εφτά φύλλα, όχι πόσο συχνά κερδίζει. Τα δύο ζευγάρια μοιάζουν κοινότοπα κι όμως προηγούνται των περισσότερων που συναντούν."
    ],
    seeH2: "Πώς φαίνεται στο τραπέζι",
    seeP: "Κατά τη διάρκεια του παιχνιδιού το PokerTH γράφει κάτω από το τραπέζι το όνομα του καλύτερου χεριού σας εκείνη τη στιγμή, ώστε να μη χρειάζεται να το συνθέσετε μόνοι σας με τον χρόνο να τρέχει, και στο σόουνταουν δείχνει κάθε αποκαλυμμένο χέρι με τονισμένα τα πέντε φύλλα που πράγματι μέτρησαν. Η προπόνηση εκτός σύνδεσης απέναντι στους αντιπάλους του υπολογιστή είναι ο γρηγορότερος τρόπος να εμπεδώσετε αυτή τη σειρά."
  },

  bg: {
    title: "Комбинации в покера — подредба на ръцете в Тексас Холдем",
    desc: "Всичките десет покер комбинации в Тексас Холдем по ред, от роял флъш до висока карта, с примери, вероятността за всяка и правилата за кикер и равенство.",
    ldHeadline: "Комбинации в покера — Тексас Холдем",
    ldDesc: "Десетте комбинации в Тексас Холдем по ред, с примери, честота и правила при равенство.",
    h1: "Комбинации в покера",
    lead: "В Тексас Холдем ръцете се подреждат от най-силната към най-слабата така. Ръката винаги е точно пет карти, избрани измежду седемте, които виждате: вашите две закрити карти и петте общи. Не сте длъжни да използвате своите — ако само бордът образува най-добрите пет, това също е вашата ръка.",
    names: ["Роял флъш", "Стрейт флъш", "Каре", "Фул хаус", "Флъш", "Стрейт", "Тройка", "Два чифта", "Чифт", "Висока карта"],
    texts: [
      "A K Q J 10 от една боя. Възможно най-добрата ръка: не може да бъде победена, само изравнена.",
      "Пет последователни карти от една боя. Между два стрейт флъша печели този с по-високата горна карта.",
      "Четири карти с еднаква стойност. Петата карта (кикерът) решава редкия случай, в който карето лежи на самия борд.",
      "Тройка заедно с чифт. Първо се сравнява тройката, после чифтът.",
      "Пет карти от една боя, без да са последователни. Сравняват се една по една отгоре надолу; никоя боя не стои над друга.",
      "Пет последователни карти в смесени бои. Асото играе горе (10-J-Q-K-A) или долу (A-2-3-4-5), но никога и двете едновременно.",
      "Три карти с еднаква стойност плюс две несвързани карти.",
      "Два различни чифта плюс пета карта. Първо се сравнява високият чифт, после ниският, после кикерът.",
      "Две карти с еднаква стойност плюс три несвързани карти, сравнявани по ред.",
      "Нищо от изброеното. Решава най-високата карта, после следващата, и така нататък."
    ],
    dealt: "се получава в %s от ръцете със седем карти",
    tiesH2: "Как се решава равенството",
    tiesP: "Първо се сравнява категорията: всеки флъш бие всеки стрейт, каквито и да са картите. В рамките на една категория се сравнява стойност по стойност отгоре надолу. Онова, което остава след комбинацията, се нарича <em>кикер</em> и решава далеч повече ръце, отколкото очакват начинаещите: на борд A-9-4 и A♠ K♦, и A♣ 7♥ дават чифт аса, но попът бие седмицата. В Холдем боите никога не решават равенство — двама играчи с едни и същи пет стойности си делят пота до последния чип.",
    wrongH2: "Най-честите заблуди",
    wrong: [
      "Асото е едновременно най-високата и най-ниската карта на стрейта: A-K-Q-J-10 е най-добрият, A-2-3-4-5 (така нареченото <em>колело</em>) е най-слабият. Редицата не се затваря в кръг — Q-K-A-2-3 не е абсолютно нищо.",
      "Флъшът е пет карти от една боя, не четири. Четири купи между ръката ви и борда сами по себе си не струват нищо.",
      "Тройка, съставена от чифт в ръката плюс една карта на борда, се нарича <em>set</em>; съставена от една карта в ръката плюс чифт на борда — <em>trips</em>. Същата категория, съвсем различна сила, защото trips се вижда от всички.",
      "Броят се само най-добрите пет карти. Два чифта в ръката и трети чифт на борда пак дават два чифта, не три.",
      "Процентите по-горе показват колко често всяка комбинация изобщо се получава до ривъра от седем карти, а не колко често печели. Двата чифта изглеждат обикновени и въпреки това изпреварват повечето от онова, което срещат."
    ],
    seeH2: "Как изглежда на масата",
    seeP: "По време на игра PokerTH изписва под борда името на текущата ви най-добра комбинация, така че никога не се налага да я подреждате наум под напрежение, а на разкриването показва всяка отворена ръка с осветени тъкмо онези пет карти, които са се броили. Тренировката офлайн срещу компютърните съперници е най-бързият начин подредбата да ви влезе в ръцете."
  },

  hr: {
    title: "Jačina kombinacija u pokeru — redoslijed ruku u Texas Hold’emu",
    desc: "Svih deset poker kombinacija u Texas Hold’emu, od royal flusha do visoke karte, s primjerima, vjerojatnošću svake i pravilima za kicker i izjednačene ruke.",
    ldHeadline: "Jačina kombinacija u pokeru — Texas Hold’em",
    ldDesc: "Deset kombinacija Texas Hold’ema redom, s primjerima, učestalošću i pravilima kod izjednačenja.",
    h1: "Jačina kombinacija u pokeru",
    lead: "U Texas Hold’emu ruke se rangiraju od najjače do najslabije ovako. Ruka je uvijek točno pet karata, odabranih između sedam koje vidite: vaše dvije zatvorene i pet zajedničkih. Ne morate koristiti svoje karte — ako sam stol tvori najboljih pet, to je također vaša ruka.",
    names: ["Royal flush", "Skala u boji", "Četvorka", "Full house", "Boja", "Skala", "Trojka", "Dva para", "Par", "Visoka karta"],
    texts: [
      "A K Q J 10 u istoj boji. Najbolja moguća ruka: ne može se pobijediti, samo izjednačiti.",
      "Pet uzastopnih karata u istoj boji. Između dvije skale u boji pobjeđuje ona s višom gornjom kartom.",
      "Četiri karte iste vrijednosti. Peta karta (kicker) rješava rijedak slučaj u kojem četvorka leži na samom stolu.",
      "Trojka uz par. Prvo se uspoređuje trojka, zatim par.",
      "Pet karata iste boje, ali ne uzastopnih. Uspoređuju se jedna po jedna odozgo; nijedna boja nije jača od druge.",
      "Pet uzastopnih karata u miješanim bojama. As igra gore (10-J-Q-K-A) ili dolje (A-2-3-4-5), nikad oboje istodobno.",
      "Tri karte iste vrijednosti, uz dvije nepovezane karte.",
      "Dva različita para uz petu kartu. Prvo se uspoređuje viši par, zatim niži, pa kicker.",
      "Dvije karte iste vrijednosti uz tri nepovezane karte, koje se uspoređuju redom.",
      "Ništa od navedenoga. Odlučuje najviša karta, zatim sljedeća, i tako dalje."
    ],
    dealt: "pojavljuje se u %s ruku od sedam karata",
    tiesH2: "Kako se rješava izjednačenje",
    tiesP: "Prvo se uspoređuje kategorija: bilo koja boja pobjeđuje bilo koju skalu, kakve god karte bile. Unutar iste kategorije uspoređuje se vrijednost po vrijednost odozgo. Ono što ostane nakon kombinacije zove se <em>kicker</em> i odlučuje mnogo više ruku nego što početnici očekuju: na stolu A-9-4 i A♠ K♦ i A♣ 7♥ daju par asova, ali kralj nadjačava sedmicu. U Hold’emu boje nikada ne rješavaju izjednačenje — dva igrača s istih pet vrijednosti dijele pot do zadnjeg žetona.",
    wrongH2: "Što se najčešće krivo shvaća",
    wrong: [
      "As je za skalu istodobno i najviša i najniža karta: A-K-Q-J-10 je najbolja, A-2-3-4-5 (takozvani <em>wheel</em>) najslabija. Niz se ne zatvara u krug — Q-K-A-2-3 nije baš ništa.",
      "Boja je pet karata iste boje, ne četiri. Četiri herca između vaše ruke i stola sama po sebi ne vrijede ništa.",
      "Trojka složena od para u ruci i jedne karte na stolu zove se <em>set</em>; složena od jedne karte u ruci i para na stolu zove se <em>trips</em>. Isti rang, vrlo različita snaga, jer trips vide svi.",
      "Broji se samo najboljih pet karata. Dva para u ruci i treći par na stolu i dalje su dva para, ne tri.",
      "Postoci iznad govore koliko se često svaka ruka uopće sastavi do rivera od sedam karata, a ne koliko često pobjeđuje. Dva para djeluju obično, a ipak su ispred većine onoga na što naiđu."
    ],
    seeH2: "Kako to izgleda za stolom",
    seeP: "Tijekom igre PokerTH ispod stola ispisuje naziv vaše trenutačno najbolje ruke, pa je nikada ne morate slagati u glavi dok vrijeme istječe, a na otvaranju karata svaku otkrivenu ruku prikazuje s istaknutih pet karata koje su doista vrijedile. Vježbanje offline protiv računalnih protivnika najbrži je način da vam redoslijed uđe u prste."
  },

  sr: {
    title: "Jačina kombinacija u pokeru — redosled ruku u Teksas Holdemu",
    desc: "Svih deset poker kombinacija u Teksas Holdemu, od rojal fleša do visoke karte, sa primerima, verovatnoćom svake i pravilima za kiker i izjednačene ruke.",
    ldHeadline: "Jačina kombinacija u pokeru — Teksas Holdem",
    ldDesc: "Deset kombinacija Teksas Holdema redom, sa primerima, učestalošću i pravilima kod izjednačenja.",
    h1: "Jačina kombinacija u pokeru",
    lead: "U Teksas Holdemu ruke se rangiraju od najjače do najslabije ovako. Ruka je uvek tačno pet karata, izabranih između sedam koje vidite: vaše dve zatvorene i pet zajedničkih. Ne morate da koristite svoje karte — ako sam sto čini najboljih pet, to je takođe vaša ruka.",
    names: ["Rojal fleš", "Skala u boji", "Kare", "Ful", "Fleš", "Kenta", "Triling", "Dva para", "Par", "Visoka karta"],
    texts: [
      "A K Q J 10 u istoj boji. Najbolja moguća ruka: ne može se pobediti, samo izjednačiti.",
      "Pet uzastopnih karata u istoj boji. Između dve skale u boji pobeđuje ona sa višom gornjom kartom.",
      "Četiri karte iste vrednosti. Peta karta (kiker) rešava redak slučaj u kome kare leži na samom stolu.",
      "Triling uz par. Prvo se poredi triling, zatim par.",
      "Pet karata iste boje, ali ne uzastopnih. Porede se jedna po jedna odozgo; nijedna boja nije jača od druge.",
      "Pet uzastopnih karata u mešanim bojama. As igra gore (10-J-Q-K-A) ili dole (A-2-3-4-5), nikada oboje istovremeno.",
      "Tri karte iste vrednosti, uz dve nepovezane karte.",
      "Dva različita para uz petu kartu. Prvo se poredi viši par, zatim niži, pa kiker.",
      "Dve karte iste vrednosti uz tri nepovezane karte, koje se porede redom.",
      "Ništa od navedenog. Odlučuje najviša karta, zatim sledeća, i tako dalje."
    ],
    dealt: "pojavljuje se u %s ruku od sedam karata",
    tiesH2: "Kako se rešava izjednačenje",
    tiesP: "Prvo se poredi kategorija: bilo koji fleš pobeđuje bilo koju kentu, kakve god karte bile. Unutar iste kategorije poredi se vrednost po vrednost odozgo. Ono što ostane posle kombinacije zove se <em>kiker</em> i odlučuje mnogo više ruku nego što početnici očekuju: na stolu A-9-4 i A♠ K♦ i A♣ 7♥ daju par asova, ali kralj nadjačava sedmicu. U Holdemu boje nikada ne rešavaju izjednačenje — dva igrača sa istih pet vrednosti dele pot do poslednjeg žetona.",
    wrongH2: "Šta se najčešće pogrešno shvata",
    wrong: [
      "As je za kentu istovremeno i najviša i najniža karta: A-K-Q-J-10 je najbolja, A-2-3-4-5 (takozvani <em>wheel</em>) najslabija. Niz se ne zatvara u krug — Q-K-A-2-3 nije baš ništa.",
      "Fleš je pet karata iste boje, ne četiri. Četiri herca između vaše ruke i stola sama po sebi ne vrede ništa.",
      "Triling složen od para u ruci i jedne karte na stolu zove se <em>set</em>; složen od jedne karte u ruci i para na stolu zove se <em>trips</em>. Isti rang, veoma različita snaga, jer triling na stolu vide svi.",
      "Broji se samo najboljih pet karata. Dva para u ruci i treći par na stolu i dalje su dva para, ne tri.",
      "Procenti iznad govore koliko često se svaka ruka uopšte sastavi do rivera od sedam karata, a ne koliko često pobeđuje. Dva para deluju obično, a ipak su ispred većine onoga na šta naiđu."
    ],
    seeH2: "Kako to izgleda za stolom",
    seeP: "Tokom igre PokerTH ispod stola ispisuje naziv vaše trenutno najbolje ruke, pa je nikada ne morate slagati u glavi dok vreme ističe, a pri otvaranju karata svaku otkrivenu ruku prikazuje sa istaknutih pet karata koje su zaista vredele. Vežbanje oflajn protiv računarskih protivnika najbrži je način da vam redosled uđe u prste."
  },

  ca: {
    title: "Jugades de pòquer — ordre de les mans al Texas Hold’em",
    desc: "Les deu jugades de pòquer del Texas Hold’em ordenades de l’escala reial a la carta alta, amb exemples, la probabilitat de cadascuna i com es resolen els kickers i els empats.",
    ldHeadline: "Jugades de pòquer — Texas Hold’em",
    ldDesc: "Les deu jugades del Texas Hold’em per ordre, amb exemples, freqüències i regles de desempat.",
    h1: "Jugades de pòquer",
    lead: "Al Texas Hold’em les mans s’ordenen de la més forta a la més fluixa d’aquesta manera. Una mà són sempre exactament cinc cartes, triades entre les set que veus: les teves dues cartes tapades i les cinc comunitàries. No estàs obligat a fer servir les teves — si la taula tota sola forma les cinc millors, aquesta també és la teva mà.",
    names: ["Escala reial", "Escala de color", "Pòquer", "Full", "Color", "Escala", "Trio", "Dobles parelles", "Parella", "Carta alta"],
    texts: [
      "A K Q J 10 del mateix pal. La millor mà possible: no es pot guanyar, només empatar.",
      "Cinc cartes consecutives del mateix pal. Entre dues escales de color guanya la que té la carta de dalt més alta.",
      "Quatre cartes del mateix valor. La cinquena carta (el kicker) resol l’empat rar en què el pòquer és a la mateixa taula.",
      "Un trio acompanyat d’una parella. Primer es compara el trio i després la parella.",
      "Cinc cartes del mateix pal, sense ser consecutives. Es comparen una a una començant per la més alta; cap pal no val més que un altre.",
      "Cinc cartes consecutives de pals barrejats. L’as juga a dalt (10-J-Q-K-A) o a baix (A-2-3-4-5), mai les dues coses alhora.",
      "Tres cartes del mateix valor, més dues cartes sense relació.",
      "Dues parelles diferents més una cinquena carta. Primer es compara la parella alta, després la baixa i després el kicker.",
      "Dues cartes del mateix valor més tres cartes sense relació, comparades per ordre.",
      "Cap de les anteriors. Decideix la carta més alta, després la següent, i així successivament."
    ],
    dealt: "apareix en el %s de les mans de set cartes",
    tiesH2: "Com es resolen els empats",
    tiesP: "Primer es compara la categoria: qualsevol color guanya qualsevol escala, siguin quines siguin les cartes. Dins la mateixa categoria es compara valor per valor començant per dalt. El que sobra després de la jugada s’anomena <em>kicker</em>, i decideix moltes més mans de les que esperen els principiants: en una taula A-9-4, tant A♠ K♦ com A♣ 7♥ fan parella d’asos, però el rei supera el set. Al Hold’em els pals no desempaten mai — dos jugadors amb els mateixos cinc valors es reparteixen el pot fins a l’última fitxa.",
    wrongH2: "El que sovint s’entén malament",
    wrong: [
      "L’as és alhora la carta més alta i la més baixa d’una escala: A-K-Q-J-10 és la millor, A-2-3-4-5 (l’anomenada <em>roda</em>) la més fluixa. La seqüència no dona la volta — Q-K-A-2-3 no és absolutament res.",
      "Un color són cinc cartes d’un pal, no quatre. Quatre cors entre la teva mà i la taula no valen res per si sols.",
      "Un trio format per una parella a la mà més una carta de la taula s’anomena <em>set</em>; format per una carta a la mà més una parella a la taula s’anomena <em>trips</em>. La mateixa classificació, una força molt diferent, perquè el trips el veu tothom.",
      "Només compten les cinc millors cartes. Tenir dues parelles i una tercera parella a la taula segueix sent dobles parelles, no tres.",
      "Els percentatges de dalt indiquen amb quina freqüència es forma cada jugada fins al river a partir de set cartes, no amb quina freqüència guanya. Les dobles parelles semblen corrents i tot i així van per davant de la major part del que es troben."
    ],
    seeH2: "Veure-ho a la taula",
    seeP: "Mentre jugues, el PokerTH escriu sota la taula el nom de la teva millor jugada del moment, de manera que mai no l’has de muntar tu amb el rellotge corrent, i a l’obertura de cartes mostra cada mà revelada amb les cinc cartes que realment han comptat destacades. Practicar fora de línia contra els oponents de l’ordinador és la manera més ràpida de tenir l’ordre a la punta dels dits."
  },

  gl: {
    title: "Xogadas de póker — orde das mans no Texas Hold’em",
    desc: "As dez xogadas de póker do Texas Hold’em ordenadas da escaleira real á carta alta, con exemplos, a probabilidade de cada unha e como se resolven os kickers e os empates.",
    ldHeadline: "Xogadas de póker — Texas Hold’em",
    ldDesc: "As dez xogadas do Texas Hold’em por orde, con exemplos, frecuencias e regras de desempate.",
    h1: "Xogadas de póker",
    lead: "No Texas Hold’em as mans ordénanse da máis forte á máis feble deste xeito. Unha man son sempre exactamente cinco cartas, escollidas entre as sete que ves: as túas dúas cartas tapadas e as cinco comunitarias. Non estás obrigado a usar as túas — se a mesa soa forma as cinco mellores, esa tamén é a túa man.",
    names: ["Escaleira real", "Escaleira de cor", "Póker", "Full", "Cor", "Escaleira", "Trío", "Dobre parella", "Parella", "Carta alta"],
    texts: [
      "A K Q J 10 do mesmo pau. A mellor man posible: non se pode gañar, só empatar.",
      "Cinco cartas consecutivas do mesmo pau. Entre dúas escaleiras de cor gaña a que ten a carta de arriba máis alta.",
      "Catro cartas do mesmo valor. A quinta carta (o kicker) resolve o raro empate no que o póker está na propia mesa.",
      "Un trío acompañado dunha parella. Primeiro compárase o trío e despois a parella.",
      "Cinco cartas do mesmo pau, sen seren consecutivas. Compáranse unha a unha comezando pola máis alta; ningún pau vale máis ca outro.",
      "Cinco cartas consecutivas de paus mesturados. O as xoga arriba (10-J-Q-K-A) ou abaixo (A-2-3-4-5), nunca as dúas cousas á vez.",
      "Tres cartas do mesmo valor, máis dúas cartas sen relación.",
      "Dúas parellas diferentes máis unha quinta carta. Primeiro compárase a parella alta, despois a baixa e despois o kicker.",
      "Dúas cartas do mesmo valor máis tres cartas sen relación, comparadas por orde.",
      "Ningunha das anteriores. Decide a carta máis alta, despois a seguinte, e así sucesivamente."
    ],
    dealt: "aparece no %s das mans de sete cartas",
    tiesH2: "Como se resolven os empates",
    tiesP: "Primeiro compárase a categoría: calquera cor gaña calquera escaleira, sexan cales sexan as cartas. Dentro da mesma categoría compárase valor por valor comezando por arriba. O que sobra despois da xogada chámase <em>kicker</em>, e decide moitas máis mans das que esperan os principiantes: nunha mesa A-9-4, tanto A♠ K♦ como A♣ 7♥ fan parella de ases, pero o rei supera o sete. No Hold’em os paus non desempatan nunca — dous xogadores cos mesmos cinco valores reparten o bote ata a última ficha.",
    wrongH2: "O que máis veces se entende mal",
    wrong: [
      "O as é á vez a carta máis alta e a máis baixa dunha escaleira: A-K-Q-J-10 é a mellor, A-2-3-4-5 (a chamada <em>roda</em>) a máis feble. A secuencia non dá a volta — Q-K-A-2-3 non é nada en absoluto.",
      "Unha cor son cinco cartas dun pau, non catro. Catro corazóns entre a túa man e a mesa non valen nada por si sós.",
      "Un trío formado por unha parella na man máis unha carta da mesa chámase <em>set</em>; formado por unha carta na man máis unha parella na mesa chámase <em>trips</em>. A mesma clasificación, unha forza moi diferente, porque o trips véo todo o mundo.",
      "Só contan as cinco mellores cartas. Ter dúas parellas e unha terceira parella na mesa segue a ser dobre parella, non tres.",
      "As porcentaxes de arriba indican con que frecuencia se forma cada xogada ata o river a partir de sete cartas, non con que frecuencia gaña. A dobre parella parece corrente e aínda así vai por diante da maior parte do que atopa."
    ],
    seeH2: "Velo na mesa",
    seeP: "Mentres xogas, o PokerTH escribe debaixo da mesa o nome da túa mellor xogada nese momento, así nunca tes que montala ti co reloxo a correr, e na apertura de cartas amosa cada man revelada coas cinco cartas que realmente contaron destacadas. Practicar sen conexión contra os adversarios do ordenador é a forma máis rápida de ter a orde na punta dos dedos."
  },

  af: {
    title: "Pokerhande — die rangorde van hande in Texas Hold’em",
    desc: "Al tien pokerhande in Texas Hold’em van royal flush tot hoë kaart, met voorbeelde, die kans op elke hand en hoe kickers en gelykopuitslae besleg word.",
    ldHeadline: "Pokerhande — Texas Hold’em",
    ldDesc: "Die tien hande van Texas Hold’em in volgorde, met voorbeelde, frekwensies en reëls by gelykop.",
    h1: "Pokerhande",
    lead: "In Texas Hold’em word hande soos volg van sterkste tot swakste gerangskik. ’n Hand is altyd presies vyf kaarte, gekies uit die sewe wat jy sien: jou twee toe kaarte en die vyf gemeenskaplike kaarte. Jy hoef nooit jou eie kaarte te gebruik nie — as die tafel alleen die beste vyf vorm, is dit ook jou hand.",
    names: ["Royal flush", "Straight flush", "Vier eenders", "Volhuis", "Flush", "Straight", "Drie eenders", "Twee pare", "Paar", "Hoë kaart"],
    texts: [
      "A K Q J 10, almal van dieselfde kleur. Die beste moontlike hand: dit kan nie geklop word nie, net gelykgemaak.",
      "Vyf opeenvolgende kaarte van dieselfde kleur. Tussen twee straight flushes wen die een met die hoër boonste kaart.",
      "Vier kaarte van dieselfde waarde. Die vyfde kaart (die kicker) besleg die skaars geval waar al vier op die tafel lê.",
      "Drie eenders plus ’n paar. Eers word die drie vergelyk, daarna die paar.",
      "Vyf kaarte van dieselfde kleur, nie opeenvolgend nie. Kaart vir kaart van bo af vergelyk; geen kleur staan bo ’n ander nie.",
      "Vyf opeenvolgende kaarte van gemengde kleure. Die aas speel bo (10-J-Q-K-A) of onder (A-2-3-4-5), nooit albei tegelyk nie.",
      "Drie kaarte van dieselfde waarde, plus twee kaarte sonder verband.",
      "Twee verskillende pare plus ’n vyfde kaart. Eers word die hoë paar vergelyk, dan die lae, dan die kicker.",
      "Twee kaarte van dieselfde waarde plus drie kaarte sonder verband, in volgorde vergelyk.",
      "Niks van bogenoemde nie. Die hoogste kaart beslis, dan die volgende, en so aan."
    ],
    dealt: "kom in %s van sewekaarthande voor",
    tiesH2: "Hoe gelykop besleg word",
    tiesP: "Vergelyk eers die kategorie: enige flush klop enige straight, wat die kaarte ook al is. Binne dieselfde kategorie word waarde vir waarde van bo af vergelyk. Wat na die kombinasie oorbly, heet die <em>kicker</em>, en dit beslis meer hande as wat beginners verwag: op ’n tafel met A-9-4 maak A♠ K♦ sowel as A♣ 7♥ ’n paar aase, maar die heer klop die sewe. Kleure beslis nooit in Hold’em nie — twee spelers met dieselfde vyf waardes deel die pot, tot die laaste fiche.",
    wrongH2: "Wat mense die meeste verkeerd het",
    wrong: [
      "Die aas is vir ’n straight terselfdertyd die hoogste en die laagste kaart: A-K-Q-J-10 is die beste, A-2-3-4-5 (die sogenaamde <em>wheel</em>) die swakste. Die ry loop nie om nie — Q-K-A-2-3 is glad niks.",
      "’n Flush is vyf kaarte van een kleur, nie vier nie. Vier harte tussen jou hand en die tafel is op sigself niks werd nie.",
      "Drie eenders wat uit ’n paar in die hand plus een kaart op die tafel kom, heet ’n <em>set</em>; uit een kaart in die hand plus ’n paar op die tafel heet dit <em>trips</em>. Dieselfde rang, baie verskillende sterkte, want trips sien almal.",
      "Net die beste vyf tel. Twee pare in die hand en ’n derde paar op die tafel gee twee pare, nie drie nie.",
      "Die persentasies hierbo sê hoe dikwels elke hand teen die river uit sewe kaarte gevorm word, nie hoe dikwels dit wen nie. Twee pare lyk alledaags en is nogtans voor die meeste van wat dit teëkom."
    ],
    seeH2: "Om dit by die tafel te sien",
    seeP: "Terwyl jy speel, skryf PokerTH die naam van jou beste hand op daardie oomblik onder die tafel, sodat jy dit nooit onder tyddruk self hoef uit te werk nie, en by die showdown word elke oop hand gewys met die vyf kaarte wat werklik getel het, uitgelig. Om aflyn teen die rekenaarteenstanders te oefen is die vinnigste manier om die volgorde in jou vingers te kry."
  },

  fil: {
    title: "Ranggo ng mga kamay sa poker — pagkakasunod-sunod sa Texas Hold’em",
    desc: "Lahat ng sampung kamay sa poker na Texas Hold’em mula royal flush hanggang high card, may mga halimbawa, ang tsansa ng bawat isa, at kung paano tinutukoy ang kicker at tabla.",
    ldHeadline: "Ranggo ng mga kamay sa poker — Texas Hold’em",
    ldDesc: "Ang sampung kamay ng Texas Hold’em ayon sa ranggo, may mga halimbawa, dalas, at panuntunan sa tabla.",
    h1: "Ranggo ng mga kamay sa poker",
    lead: "Sa Texas Hold’em, ganito nakaayos ang mga kamay mula sa pinakamalakas hanggang sa pinakamahina. Laging eksaktong limang baraha ang isang kamay, pinipili mula sa pitong nakikita mo: ang dalawang saradong baraha mo at ang limang baraha sa mesa. Hindi mo kailangang gamitin ang sarili mong baraha — kung ang mesa mismo ang bumubuo ng pinakamagandang lima, iyon din ang kamay mo.",
    names: ["Royal Flush", "Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind", "Two Pair", "One Pair", "High Card"],
    texts: [
      "A K Q J 10, iisa ang palo. Ang pinakamalakas na posibleng kamay: hindi ito matatalo, matatabla lang.",
      "Limang magkakasunod na baraha sa iisang palo. Sa dalawang straight flush, panalo ang may mas mataas na pinakaitaas na baraha.",
      "Apat na barahang magkakapareho ang halaga. Ang panlimang baraha (ang kicker) ang tumutukoy sa bihirang tabla kapag nasa mesa mismo ang apat.",
      "Tatlong magkakapareho kasama ang isang pares. Una ang tatlo ang pinaghahambing, saka ang pares.",
      "Limang baraha ng iisang palo, hindi magkakasunod. Isa-isang inihahambing mula sa pinakamataas; walang palong mas mataas kaysa sa iba.",
      "Limang magkakasunod na baraha na magkakaiba ang palo. Ang alas ay puwedeng nasa itaas (10-J-Q-K-A) o nasa ibaba (A-2-3-4-5), hindi kailanman pareho nang sabay.",
      "Tatlong barahang magkakapareho ang halaga, kasama ang dalawang walang kaugnayan.",
      "Dalawang magkaibang pares kasama ang panlimang baraha. Una ang mataas na pares, saka ang mababa, saka ang kicker.",
      "Dalawang barahang magkapareho ang halaga kasama ang tatlong walang kaugnayan, inihahambing nang sunod-sunod.",
      "Wala sa mga nabanggit. Ang pinakamataas na baraha ang magpapasya, saka ang sumunod, at ganoon nang ganoon."
    ],
    dealt: "lumalabas sa %s ng mga kamay na pitong baraha",
    tiesH2: "Paano tinutukoy ang tabla",
    tiesP: "Unahin ang uri: talo ng kahit anong flush ang kahit anong straight, anuman ang baraha. Sa loob ng iisang uri, halaga sa halaga ang paghahambing mula sa itaas. Ang natitira matapos mabuo ang kamay ay tinatawag na <em>kicker</em>, at mas marami itong napagpapasyahang kamay kaysa sa inaakala ng baguhan: sa mesang A-9-4, parehong pares ng alas ang A♠ K♦ at ang A♣ 7♥, pero mas mataas ang hari kaysa sa pito. Sa Hold’em ay hindi kailanman ang palo ang nagpapasya sa tabla — dalawang manlalarong may parehong limang halaga ang naghahati sa pot hanggang sa huling chip.",
    wrongH2: "Ang madalas na mali ang pagkakaintindi",
    wrong: [
      "Ang alas ay parehong pinakamataas at pinakamababang baraha sa isang straight: A-K-Q-J-10 ang pinakamalakas, A-2-3-4-5 (ang tinatawag na <em>wheel</em>) ang pinakamahina. Hindi umiikot ang pagkakasunod — walang kuwenta ang Q-K-A-2-3.",
      "Limang baraha ng iisang palo ang flush, hindi apat. Ang apat na hearts sa kamay mo at sa mesa ay walang halaga sa sarili nito.",
      "Ang tatlong magkakapareho na galing sa pares sa kamay at isang baraha sa mesa ay tinatawag na <em>set</em>; kung galing sa isang baraha sa kamay at pares sa mesa, <em>trips</em> ang tawag. Pareho ang ranggo, malayo ang lakas, dahil nakikita ng lahat ang trips.",
      "Ang pinakamagandang lima lang ang binibilang. Kung may dalawang pares ka at may pangatlong pares sa mesa, two pair pa rin ang kamay mo, hindi tatlo.",
      "Ipinapakita ng mga porsyento sa itaas kung gaano kadalas nabubuo ang bawat kamay hanggang river mula sa pitong baraha, hindi kung gaano kadalas ito nananalo. Mukhang pangkaraniwan ang two pair pero nangunguna pa rin ito sa karamihan ng nakakasalubong nito."
    ],
    seeH2: "Makikita mo ito sa mesa",
    seeP: "Habang naglalaro, isinusulat ng PokerTH sa ilalim ng mesa ang pangalan ng pinakamalakas mong kamay sa sandaling iyon, kaya hindi mo na kailangang isipin ito habang tumatakbo ang oras, at sa showdown ay itinatampok nito sa bawat bukás na kamay ang limang barahang talagang nagsilbi. Ang pagsasanay offline laban sa mga kalaban ng kompyuter ang pinakamabilis na paraan para maisaulo ang pagkakasunod-sunod na ito."
  },

  gd: {
    title: "Rangachadh làmhan puicear — òrdugh nan làmhan an Texas Hold’em",
    desc: "Na deich làmhan puicear an Texas Hold’em bhon t-sreath rìoghail chun na cairt àrd, le eisimpleirean, an teans air gach tè agus mar a thèid an kicker agus co-ionannachd a rèiteach.",
    ldHeadline: "Rangachadh làmhan puicear — Texas Hold’em",
    ldDesc: "Na deich làmhan an Texas Hold’em an òrdugh, le eisimpleirean, tricead agus riaghailtean co-ionannachd.",
    h1: "Rangachadh làmhan puicear",
    lead: "An Texas Hold’em tha na làmhan air an rangachadh bhon tè as làidire chun tè as laige mar seo. ’S e còig cairtean a th’ ann an làmh an-còmhnaidh, air an taghadh às na seachd a chì thu: an dà chairt dhùinte agad agus na còig cairtean coitcheann. Chan fheum thu na cairtean agad fhèin a chleachdadh — ma tha am bòrd leis fhèin a’ dèanamh nan còig as fheàrr, ’s e sin do làmh cuideachd.",
    names: ["Sreath rìoghail", "Sreath dhatha", "Ceithir co-ionann", "Taigh làn", "Aon dath", "Sreath", "Trì co-ionann", "Dà phaidhir", "Paidhir", "Cairt àrd"],
    texts: [
      "A K Q J 10, uile den aon dath. An làmh as fheàrr a ghabhas a bhith ann: cha ghabh a ceannsachadh, dìreach a co-ionannachadh.",
      "Còig cairtean an sreath, uile den aon dath. Eadar dà shreath dhatha, buannaichidh an tè leis a’ chairt as àirde aig a’ mhullach.",
      "Ceithir cairtean den aon luach. Rèitichidh a’ chòigeamh cairt (an kicker) an t-suidheachadh ainneamh far a bheil na ceithir air a’ bhòrd fhèin.",
      "Trì co-ionann agus paidhir còmhla riutha. Thèid na trì a choimeas an toiseach, agus an uair sin am paidhir.",
      "Còig cairtean den aon dath, gun a bhith an sreath. Thèid an coimeas tè mu seach bhon mhullach; chan eil dath sam bith os cionn dath eile.",
      "Còig cairtean an sreath le dathan measgaichte. Cluichidh an t-àsa aig a’ mhullach (10-J-Q-K-A) no aig a’ bhonn (A-2-3-4-5), ach cha chluich e an dà chuid còmhla.",
      "Trì cairtean den aon luach, agus dà chairt gun cheangal riutha.",
      "Dà phaidhir eadar-dhealaichte agus còigeamh cairt. Thèid am paidhir as àirde a choimeas an toiseach, an uair sin an tè as ìsle, an uair sin an kicker.",
      "Dà chairt den aon luach agus trì cairtean gun cheangal, air an coimeas a rèir òrduigh.",
      "Chan e gin dhiubh sin. Cuiridh a’ chairt as àirde crìoch air, agus an uair sin an ath thè, agus mar sin air adhart."
    ],
    dealt: "a’ nochdadh ann an %s de làmhan seachd cairtean",
    tiesH2: "Mar a thèid co-ionannachd a rèiteach",
    tiesP: "Coimeas an seòrsa an toiseach: buannaichidh dath sam bith an aghaidh sreath sam bith, ge b’ e dè na cairtean. Am broinn an aon seòrsa, thèid luach an dèidh luach a choimeas bhon mhullach. ’S e <em>kicker</em> a chanar ris na tha air fhàgail às dèidh na làimhe, agus rèitichidh e barrachd làmhan na tha luchd-tòiseachaidh an dùil: air bòrd A-9-4, tha A♠ K♦ agus A♣ 7♥ le chèile a’ dèanamh paidhir àsaichean, ach tha an rìgh os cionn an t-seachd. Cha rèitich na dathan co-ionannachd a-riamh an Hold’em — roinnidh dithis chluicheadairean leis na h-aon chòig luachan am poit, sìos chun an t-slise mu dheireadh.",
    wrongH2: "Na rudan a thathar a’ tuigsinn ceàrr",
    wrong: [
      "’S e an t-àsa a’ chairt as àirde agus as ìsle aig an aon àm ann an sreath: ’s e A-K-Q-J-10 an tè as fheàrr, agus A-2-3-4-5 (ris an canar an <em>wheel</em>) an tè as laige. Cha tèid an t-sreath timcheall — chan eil Q-K-A-2-3 na rud sam bith.",
      "’S e còig cairtean den aon dath a th’ ann an dath, chan e ceithir. Chan eil ceithir cridheachan eadar do làmh agus am bòrd fiù ’s luach sam bith leotha fhèin.",
      "’S e <em>set</em> a chanar ri trì co-ionann a thig bho phaidhir nad làimh agus aon chairt air a’ bhòrd; ’s e <em>trips</em> a chanar riutha ma thig iad bho aon chairt nad làimh agus paidhir air a’ bhòrd. An aon rangachadh, neart gu tur eadar-dhealaichte, oir chì a h-uile duine trips.",
      "Chan eil ach na còig as fheàrr gan cunntadh. Dà phaidhir nad làimh agus treas paidhir air a’ bhòrd — ’s e dà phaidhir a th’ agad fhathast, chan e trì.",
      "Tha na ceudadan gu h-àrd ag innse dè cho tric ’s a thig gach làmh ri chèile ron river à seachd cairtean, chan e dè cho tric ’s a bhuannaicheas i. Tha coltas cumanta air dà phaidhir agus tha i fhathast air thoiseach air a’ mhòr-chuid de na thachras rithe."
    ],
    seeH2: "Ga fhaicinn aig a’ bhòrd",
    seeP: "Fhad ’s a bhios tu a’ cluich, sgrìobhaidh PokerTH ainm na làimhe as fheàrr a th’ agad fon bhòrd, agus mar sin cha leig thu leas a cur ri chèile fhad ’s a tha an ùine a’ ruith, agus aig an showdown seallaidh e gach làmh fhosgailte leis na còig cairtean a bha gu diofar air an comharrachadh. ’S e cleachdadh far-loidhne an aghaidh nan co-fharpaiseach coimpiutair an dòigh as luaithe air an t-òrdugh seo a chur nad chorragan."
  },

  lt: {
    title: "Pokerio derinių eiliškumas — rankų tvarka Texas Hold’em",
    desc: "Visi dešimt Texas Hold’em pokerio derinių nuo karališkosios eilės iki aukščiausios kortos, su pavyzdžiais, kiekvieno tikimybe ir taisyklėmis dėl kikerio bei lygiųjų.",
    ldHeadline: "Pokerio derinių eiliškumas — Texas Hold’em",
    ldDesc: "Dešimt Texas Hold’em derinių iš eilės, su pavyzdžiais, dažniu ir lygiųjų taisyklėmis.",
    h1: "Pokerio derinių eiliškumas",
    lead: "Texas Hold’em rankos rikiuojamos nuo stipriausios iki silpniausios štai taip. Ranką visada sudaro lygiai penkios kortos, parinktos iš septynių, kurias matote: dviejų savo uždarų ir penkių bendrųjų. Savo kortų naudoti neprivalote — jei geriausias penketas susidaro vien iš stalo, tai irgi jūsų ranka.",
    names: ["Karališkoji eilė", "Spalvota eilė", "Ketvertas", "Pilnas namas", "Spalva", "Eilė", "Trejetas", "Dvi poros", "Pora", "Aukščiausia korta"],
    texts: [
      "A K Q J 10 tos pačios rūšies. Geriausia įmanoma ranka: jos nugalėti negalima, tik susilyginti.",
      "Penkios iš eilės einančios tos pačios rūšies kortos. Iš dviejų spalvotų eilių laimi ta, kurios viršutinė korta aukštesnė.",
      "Keturios tos pačios vertės kortos. Penktoji korta (kikeris) išsprendžia retą atvejį, kai ketvertas guli ant paties stalo.",
      "Trejetas su pora. Pirmiausia lyginamas trejetas, paskui pora.",
      "Penkios tos pačios rūšies kortos, ne iš eilės. Lyginamos po vieną nuo aukščiausios; nė viena rūšis nėra už kitą aukštesnė.",
      "Penkios iš eilės einančios skirtingų rūšių kortos. Tūzas eina viršuje (10-J-Q-K-A) arba apačioje (A-2-3-4-5), niekada abiejose vietose iškart.",
      "Trys tos pačios vertės kortos ir dvi nesusijusios kortos.",
      "Dvi skirtingos poros ir penktoji korta. Pirmiausia lyginama aukštesnė pora, paskui žemesnė, paskui kikeris.",
      "Dvi tos pačios vertės kortos ir trys nesusijusios kortos, lyginamos iš eilės.",
      "Nė vienas iš pirmiau išvardytų. Sprendžia aukščiausia korta, paskui kita, ir taip toliau."
    ],
    dealt: "susidaro %s septynių kortų rankų",
    tiesH2: "Kaip sprendžiamos lygiosios",
    tiesP: "Pirmiausia lyginama kategorija: bet kokia spalva įveikia bet kokią eilę, kad ir kokios būtų kortos. Toje pačioje kategorijoje lyginama vertė po vertės nuo viršaus. Tai, kas lieka sudarius derinį, vadinama <em>kikeriu</em>, ir jis nulemia kur kas daugiau rankų, nei tikisi pradedantieji: ant stalo A-9-4 ir A♠ K♦, ir A♣ 7♥ sudaro tūzų porą, bet karalius pranoksta septynetą. Hold’em rūšys lygiųjų nesprendžia niekada — du žaidėjai su tomis pačiomis penkiomis vertėmis pasidalija banką iki paskutinės žetono dalies.",
    wrongH2: "Ką dažniausiai supranta klaidingai",
    wrong: [
      "Tūzas eilei yra kartu ir aukščiausia, ir žemiausia korta: A-K-Q-J-10 yra geriausia, o A-2-3-4-5 (vadinamasis <em>wheel</em>) — silpniausia. Seka nesusijungia į ratą — Q-K-A-2-3 nėra visiškai niekas.",
      "Spalva — tai penkios vienos rūšies kortos, ne keturios. Keturios širdys tarp jūsų rankos ir stalo pačios savaime nieko nevertos.",
      "Trejetas, sudarytas iš poros rankoje ir vienos kortos ant stalo, vadinamas <em>set</em>; sudarytas iš vienos kortos rankoje ir poros ant stalo — <em>trips</em>. Ta pati vieta eilėje, visai kitokia jėga, nes trips mato visi.",
      "Skaičiuojamos tik penkios geriausios kortos. Dvi poros rankoje ir trečia pora ant stalo vis tiek yra dvi poros, o ne trys.",
      "Pirmiau pateikti procentai rodo, kaip dažnai kiekvienas derinys apskritai susidaro iki riverio iš septynių kortų, o ne kaip dažnai jis laimi. Dvi poros atrodo kasdieniškai ir vis dėlto pranoksta didžiąją dalį to, ką sutinka."
    ],
    seeH2: "Kaip tai matyti prie stalo",
    seeP: "Žaidžiant PokerTH po stalu parašo dabartinės geriausios jūsų rankos pavadinimą, tad jos niekada nereikia dėliotis mintyse spaudžiant laikui, o atskleidžiant kortas kiekvienoje atverstoje rankoje išryškina būtent tas penkias kortas, kurios iš tikrųjų buvo skaičiuojamos. Treniruotis neprisijungus prieš kompiuterio varžovus — greičiausias būdas šį eiliškumą įsiminti."
  },


  et: {
    title: "Pokkerikäte tugevus — käte järjestus Texas Hold\u2019emis",
    desc: "Kõik kümme Texas Hold\u2019emi pokkerikätt kuninglikust mastireast kõrgeima kaardini, koos näidete, iga käe tõenäosuse ning kickeri ja viikide reeglitega.",
    ldHeadline: "Pokkerikäte tugevus — Texas Hold\u2019em",
    ldDesc: "Kümme Texas Hold\u2019emi kätt järjekorras, koos näidete, esinemissageduse ja viigireeglitega.",
    h1: "Pokkerikäte tugevus",
    lead: "Texas Hold\u2019emis järjestatakse käed tugevaimast nõrgimani nii. Käsi koosneb alati täpselt viiest kaardist, mis on valitud seitsme nähtava hulgast: sinu kaks varjatud kaarti ja viis ühist kaarti. Oma kaarte ei pea tingimata kasutama — kui parim viisik tuleb ainuüksi lauast, on seegi sinu käsi.",
    names: ["Kuninglik mastirida", "Mastirida", "Neljik", "Täismaja", "Mast", "Rida", "Kolmik", "Kaks paari", "Paar", "Kõrgeim kaart"],
    texts: [
      "A K Q J 10, kõik sama masti. Parim võimalik käsi: seda ei saa lüüa, sellega saab ainult viiki jääda.",
      "Viis järjestikust sama masti kaarti. Kahest mastireast võidab see, mille ülemine kaart on kõrgem.",
      "Neli sama tugevusega kaarti. Viies kaart (kicker) lahendab harva ette tuleva viigi, kui kõik neli on laual.",
      "Kolmik koos paariga. Kõigepealt võrreldakse kolmikut, seejärel paari.",
      "Viis sama masti kaarti, mis ei ole järjestikused. Võrreldakse ükshaaval kõrgeimast alates; ükski mast ei ole teisest kõrgem.",
      "Viis järjestikust eri masti kaarti. Äss käib üleval (10-J-Q-K-A) või all (A-2-3-4-5), mitte kunagi mõlemal pool korraga.",
      "Kolm sama tugevusega kaarti ja kaks seostamata kaarti.",
      "Kaks erinevat paari ja viies kaart. Kõigepealt võrreldakse kõrgemat paari, siis madalamat, siis kickerit.",
      "Kaks sama tugevusega kaarti ja kolm seostamata kaarti, mida võrreldakse järjest.",
      "Mitte ükski eelnevatest. Otsustab kõrgeim kaart, seejärel järgmine ja nii edasi."
    ],
    dealt: "tekib %s seitsmekaardilise käe puhul",
    tiesH2: "Kuidas viigid lahendatakse",
    tiesP: "Kõigepealt võrreldakse kategooriat: iga mast lööb iga rea, ükskõik millised kaardid seal on. Sama kategooria sees võrreldakse tugevust tugevuse haaval ülalt alla. Seda, mis pärast kombinatsiooni moodustamist üle jääb, nimetatakse <em>kickeriks</em>, ja see otsustab palju rohkem käsi, kui algajad arvavad: laual A-9-4 ning A♠ K♦ ja A♣ 7♥ annavad mõlemad ässade paari, kuid kuningas lööb seitsme. Hold\u2019emis ei lahenda mastid kunagi viiki — kaks sama viie tugevusega mängijat jagavad poti viimse žetoonini.",
    wrongH2: "Mida kõige sagedamini valesti mõistetakse",
    wrong: [
      "Äss on rea jaoks korraga nii kõrgeim kui ka madalaim kaart: A-K-Q-J-10 on parim ja A-2-3-4-5 (nn <em>wheel</em>) nõrgim. Jada ei sulgu ringiks — Q-K-A-2-3 ei ole mitte midagi.",
      "Mast on viis sama masti kaarti, mitte neli. Neli ärtut sinu käe ja laua peale kokku ei ole iseenesest midagi väärt.",
      "Kolmikut, mis on moodustatud käes olevast paarist ja ühest laual olevast kaardist, nimetatakse <em>set</em>\u2019iks; ühest käes olevast kaardist ja laual olevast paarist moodustatut aga <em>trips</em>\u2019iks. Sama koht järjestuses, hoopis teine tugevus, sest tripsi näevad kõik.",
      "Arvesse lähevad ainult viis parimat kaarti. Kaks paari käes ja kolmas paar laual on ikkagi kaks paari, mitte kolm.",
      "Ülaltoodud protsendid näitavad, kui sageli iga kombinatsioon seitsmest kaardist riveriks üldse tekib, mitte kui sageli see võidab. Kaks paari tunduvad igapäevased ja löövad siiski suurema osa sellest, mida nad kohtavad."
    ],
    seeH2: "Kuidas seda lauas näha",
    seeP: "PokerTH-s mängides kirjutatakse laua alla sinu praeguse parima käe nimi, nii et seda ei pea kunagi ajasurve all peast kokku panema, ning kaartide avamisel tõstetakse igas näidatud käes esile just need viis kaarti, mis tegelikult arvesse läksid. Võrguvaba treening arvutivastaste vastu on kiireim viis see järjestus meelde jätta."
  },
  eu: {
    title: "Pokerreko eskuak — eskuen hurrenkera Texas Hold’em-en",
    desc: "Texas Hold’em pokerreko hamar eskuak, eskailera errealetik karta altura ordenatuta, adibideekin, bakoitzaren probabilitatearekin eta berdinketak nola ebazten diren.",
    ldHeadline: "Pokerreko eskuak — Texas Hold’em",
    ldDesc: "Texas Hold’em-en hamar eskuak ordenan, adibide, maiztasun eta berdinketa-arauekin.",
    h1: "Pokerreko eskuak",
    lead: "Texas Hold’em-en, eskuak indartsuenetik ahulenera honela ordenatzen dira. Esku bat beti zehazki bost kartaz osatzen da, ikusten dituzun zazpietatik aukeratuta: zure bi karta pribatuak eta mahaiko bost karta komunak.",
    names: [
      "Eskailera erreala",
      "Kolore-eskailera",
      "Pokerra",
      "Full",
      "Kolorea",
      "Eskailera",
      "Hirukoa",
      "Bi bikote",
      "Bikotea",
      "Karta altua",
    ],
    texts: [
      "A K Q J 10, guztiak kolore berekoak. Ahalik eta eskurik onena; ezin da gainditu, berdindu baizik.",
      "Bost karta jarraian, guztiak kolore berekoak. Bi kolore-eskaileraren artean, goiko karta altuena duenak irabazten du.",
      "Balio bereko lau karta. Bosgarren kartak (kickerrak) ebazten du mahaiko bi poker berdinen arteko berdinketa arraroa.",
      "Hirukoa gehi bikotea. Lehenik hiru kartako zatia konparatzen da, gero bikotea.",
      "Kolore bereko bost karta, ez jarraian. Kartaz karta konparatzen dira goitik hasita; kolore bat ere ez da beste bat baino gehiago.",
      "Bost karta jarraian, kolore nahasiak. Batekoak goian (10-J-Q-K-A) edo behean (A-2-3-4-5) jokatzen du, inoiz ez biak aldi berean.",
      "Balio bereko hiru karta, gehi erlazionatu gabeko bi karta.",
      "Bi bikote desberdin gehi bosgarren karta bat. Lehenik bikote altua, gero baxua, gero kickerra konparatzen dira.",
      "Balio bereko bi karta gehi erlazionatu gabeko hiru karta, ordenan konparatuta.",
      "Aurrekoetako bat ere ez. Kartarik altuenak erabakitzen du, gero hurrengoak, eta abar.",
    ],
    dealt: "zazpi kartako eskuen %s-(e)an agertzen da",
    tiesH2: "Nola ebazten diren berdinketak",
    tiesP: "Lehenik kategoria konparatzen da: edozein kolorek edozein eskailera gainditzen du, kartak edozein izanda ere. Kategoria bera bada, balioz balio konparatzen da goitik hasita. Konbinazioaren ondoren geratzen dena <em>kicker</em> deitzen da, eta hasiberriek uste dutena baino esku askoz gehiago erabakitzen ditu: A♠ K♦ eta A♣ 7♥-k biek bateko bikotea egiten dute A-9-4 mahai batean, baina erregeak zazpikoa gainditzen du kickerrean. Hold’em-en koloreek ez dute inoiz ezer erabakitzen — bost balio berdin dituzten bi jokalarik potea banatzen dute azken txiperaino.",
    wrongH2: "Oker uste dena",
    wrong: [
      "Batekoa eskailerako karta altuena eta baxuena da: A-K-Q-J-10 onena da, A-2-3-4-5 (<em>gurpila</em>) ahulena. Segida ez da biribiltzen — Q-K-A-2-3 ez da ezer.",
      "Kolorea kolore bereko bost karta da, ez lau. Zure eskuaren eta mahaiaren arteko lau bihotzek ez dute ezer balio berez.",
      "Eskuko bikote batek gehi mahaiko karta batek osatutako hirukoari <em>set</em> deitzen zaio; eskuko karta batek gehi mahaiko bikote batek osatutakoari, <em>trips</em>. Hurrenkera bera, indar oso desberdina, trips-a denek ikusten baitute.",
      "Bost karta onenak soilik zenbatzen dira. Eskuan bi bikote eta mahaian hirugarren bikote bat izanda, bi bikote dituzu, ez hiru.",
      "Goiko ehunekoek adierazten dute esku bakoitza zenbatetan agertzen den river-ean zazpi kartarekin, ez zenbatetan irabazten duen. Bi bikotek arrunta dirudi, eta hala ere aurkitzen duenaren gehiengoaren aurretik dago.",
    ],
    seeH2: "Ikusi mahaian",
    seeP: "Partidan zehar, PokerTH-k zure konbinaziorik onena izendatzen du mahaiaren azpian, denbora-presiopean zuk berreraiki behar izan ez dezazun, eta showdown-ean agerian jarritako esku bakoitza erakusten du kontuan hartutako bost kartak nabarmenduta. Ordenagailuak kontrolatutako aurkarien aurkako lineaz kanpoko entrenamendua da hurrenkera hau ikasteko biderik azkarrena.",
  },
  lv: {
    title: "Pokera kombināciju stiprums — kombināciju secība Teksasas Hold’emā",
    desc: "Visas desmit Teksasas Hold’ema kombinācijas no karaliskās rindas līdz augstākajai kārtij, ar piemēriem, katras kombinācijas varbūtību un kikera un neizšķirtu noteikumiem.",
    ldHeadline: "Pokera kombināciju stiprums — Teksasas Hold’em",
    ldDesc: "Desmit Teksasas Hold’ema kombinācijas pēc kārtas, ar piemēriem, to biežumu un neizšķirtu noteikumiem.",
    h1: "Pokera kombināciju stiprums",
    lead: "Teksasas Hold’emā kombinācijas no stiprākās līdz vājākajai sakārtojas šādi. Kombinācija vienmēr sastāv tieši no piecām kārtīm, kas izvēlētas no septiņām redzamajām: tavām divām slēptajām kārtīm un piecām kopējām kārtīm. Savas kārtis izmantot nav obligāti — ja labākais piecinieks veidojas tikai no galda, arī tā ir tava kombinācija.",
    names: ["Karaliskā rinda", "Krāsainā rinda", "Četrinieks", "Pilna māja", "Krāsa", "Rinda", "Trijnieks", "Divi pāri", "Pāris", "Augstākā kārts"],
    texts: [
      "A K Q J 10, visas vienā mastā. Labākā iespējamā kombinācija: to pārspēt nevar, ar to var tikai sadalīt banku.",
      "Piecas secīgas viena masta kārtis. No divām krāsainajām rindām uzvar tā, kuras augstākā kārts ir lielāka.",
      "Četras viena ranga kārtis. Piektā kārts (kikers) izšķir reto neizšķirtu, kad visas četras ir uz galda.",
      "Trijnieks kopā ar pāri. Vispirms salīdzina trijnieku, tad pāri.",
      "Piecas viena masta kārtis, kas nav secīgas. Salīdzina pa vienai, sākot no augstākās; neviens masts nav pārāks par citu.",
      "Piecas secīgas dažādu mastu kārtis. Dūzis ir vai nu augšā (10-J-Q-K-A), vai apakšā (A-2-3-4-5), nekad abās vietās vienlaikus.",
      "Trīs viena ranga kārtis un divas nesaistītas kārtis.",
      "Divi dažādi pāri un piektā kārts. Vispirms salīdzina augstāko pāri, tad zemāko, tad kikeru.",
      "Divas viena ranga kārtis un trīs nesaistītas kārtis, ko salīdzina pēc kārtas.",
      "Neviena no iepriekšējām. Izšķir augstākā kārts, tad nākamā un tā tālāk."
    ],
    dealt: "izveidojas %s septiņu kāršu gadījumu",
    tiesH2: "Kā tiek šķirti neizšķirti",
    tiesP: "Vispirms salīdzina kategoriju: jebkura krāsa pārspēj jebkuru rindu, lai kādas kārtis tajā būtu. Vienas kategorijas ietvaros salīdzina rangu pēc ranga no augšas uz leju. To, kas pēc kombinācijas izveidošanas paliek pāri, sauc par <em>kikeru</em>, un tas izšķir daudz vairāk partiju, nekā iesācēji domā: ar galdu A-9-4 gan A♠ K♦, gan A♣ 7♥ dod dūžu pāri, taču kungs pārspēj septītnieku. Hold’emā masti neizšķirtu nešķir nekad — divi spēlētāji ar vienāda stipruma piecinieku sadala banku līdz pēdējam žetonam.",
    wrongH2: "Kas visbiežāk tiek pārprasts",
    wrong: [
      "Rindā dūzis ir gan augstākā, gan zemākā kārts: A-K-Q-J-10 ir labākā, bet A-2-3-4-5 (tā sauktais <em>wheel</em>) — vājākā. Secība neveido apli — Q-K-A-2-3 nav nekas.",
      "Krāsa ir piecas viena masta kārtis, nevis četras. Četras ercenes, saskaitot tavas kārtis un galdu, pašas par sevi nav nekā vērtas.",
      "Trijnieku, kas veidots no pāra tavā rokā un vienas kārts uz galda, sauc par <em>set</em>; to, kas veidots no vienas kārts rokā un pāra uz galda — par <em>trips</em>. Tā pati vieta secībā, pavisam cits stiprums, jo trips redz visi.",
      "Skaitās tikai piecas labākās kārtis. Divi pāri rokā un trešais pāris uz galda joprojām ir divi pāri, nevis trīs.",
      "Iepriekš norādītie procenti rāda, cik bieži katra kombinācija no septiņām kārtīm vispār izveidojas līdz river, nevis cik bieži tā uzvar. Divi pāri šķiet ikdienišķi un tomēr pārspēj lielāko daļu no tā, ko sastop."
    ],
    seeH2: "Kā to redzēt pie galda",
    seeP: "Spēlējot PokerTH, tavas pašreizējās labākās kombinācijas nosaukums tiek rakstīts zem galda, tāpēc to nekad nav jāsaliek galvā laika spiedienā, un kāršu atklāšanā katrā parādītajā kombinācijā tiek izceltas tieši tās piecas kārtis, kas patiešām skaitījās. Bezsaistes treniņš pret datora pretiniekiem ir ātrākais veids, kā šo secību iegaumēt."
  },

  sl: {
    title: "Moč pokrskih rok — uvrstitev rok v Texas Hold\u2019emu",
    desc: "Vseh deset pokrskih rok Texas Hold\u2019ema, od kraljevega flusha do najvišje karte, s primeri, verjetnostjo vsake roke ter pravili za kicker in izenačenja.",
    ldHeadline: "Moč pokrskih rok — Texas Hold\u2019em",
    ldDesc: "Deset rok Texas Hold\u2019ema po vrsti, s primeri, pogostostjo in pravili za izenačenja.",
    h1: "Moč pokrskih rok",
    lead: "V Texas Hold\u2019emu se roke razvrstijo od najmočnejše do najšibkejše takole. Roka je vedno sestavljena natanko iz petih kart, izbranih med sedmimi vidnimi: tvojima dvema skritima kartama in petimi skupnimi kartami. Svojih kart ti sploh ni treba uporabiti — če najboljših pet kart pride samo z mize, je to tudi tvoja roka.",
    names: ["Royal Flush", "Straight Flush", "Kare", "Full House", "Flush", "Straight", "Trojka", "Dva para", "En par", "Visoka karta"],
    texts: [
      "A K Q J 10, vse iste barve. Najboljša možna roka: ni je mogoče premagati, lahko se ji le izenačiš.",
      "Pet zaporednih kart iste barve. Med dvema straight flushema zmaga tisti z višjo zgornjo karto.",
      "Štiri karte iste vrednosti. Peta karta (kicker) redko odloči izenačenje, kadar so vse štiri na mizi.",
      "Trojka skupaj s parom. Najprej se primerja trojka, nato par.",
      "Pet kart iste barve, ki niso zaporedne. Primerjajo se ena za drugo od najvišje naprej; nobena barva ni višja od druge.",
      "Pet zaporednih kart različnih barv. As šteje zgoraj (10-J-Q-K-A) ali spodaj (A-2-3-4-5), nikoli na obeh straneh hkrati.",
      "Tri karte iste vrednosti in dve nepovezani karti.",
      "Dva različna para in peta karta. Najprej se primerja višji par, nato nižji, nato kicker.",
      "Dve karti iste vrednosti in tri nepovezane karte, ki se primerjajo po vrsti.",
      "Nič od naštetega. Odloča najvišja karta, nato naslednja in tako naprej."
    ],
    dealt: "se pojavi pri %s sedemkartnih rok",
    tiesH2: "Kako se rešujejo izenačenja",
    tiesP: "Najprej se primerja kategorija: vsaka barva premaga vsak straight, ne glede na to, katere karte vsebuje. Znotraj iste kategorije se moč primerja karto za karto od zgoraj navzdol. Tisto, kar ostane po sestavljeni kombinaciji, se imenuje <em>kicker</em>, in ta odloča veliko več rok, kot mislijo začetniki: pri A-9-4 na mizi dasta A♠ K♦ in A♣ 7♥ oba par asov, a kralj premaga sedmico. V Hold\u2019emu barve nikoli ne rešijo izenačenja — dva igralca z enako močno roko si banko delita do zadnjega žetona.",
    wrongH2: "Kaj se najpogosteje narobe razume",
    wrong: [
      "As je za straight hkrati najvišja in najnižja karta: A-K-Q-J-10 je najboljši, A-2-3-4-5 (t. i. <em>wheel</em>) pa najšibkejši. Zaporedje se ne zaokroži v krog — Q-K-A-2-3 ni nič.",
      "Flush je pet kart iste barve, ne štiri. Štiri srca v tvoji roki in na mizi skupaj sama po sebi niso vredna nič.",
      "Trojka, sestavljena iz para v roki in ene karte na mizi, se imenuje <em>set</em>; trojka, sestavljena iz ene karte v roki in para na mizi, pa <em>trips</em>. Enako mesto v uvrstitvi, povsem druga moč, saj vsi vidijo trips.",
      "Šteje samo pet najboljših kart. Dva para v roki in tretji par na mizi sta še vedno dva para, ne trije.",
      "Zgornji odstotki kažejo, kako pogosto se posamezna kombinacija sploh pojavi med sedmimi kartami do rivera, ne kako pogosto zmaga. Dva para se zdita vsakdanja, a vseeno premagata večino tega, kar srečata."
    ],
    seeH2: "Kako to vidiš pri mizi",
    seeP: "Med igro PokerTH se pod mizo izpiše ime tvoje trenutno najboljše roke, tako da je nikoli ni treba sestavljati na pamet pod časovnim pritiskom, ob razkritju kart pa je v vsaki prikazani roki poudarjenih točno tistih pet kart, ki so dejansko štele. Brezpovezavna vadba proti računalniškim nasprotnikom je najhitrejši način, da si to zapomniš."
  },

  bs: {
    title: "Jačina kombinacija u pokeru — redoslijed ruku u Texas Hold’emu",
    desc: "Svih deset poker kombinacija u Texas Hold’emu, od royal flusha do visoke karte, s primjerima, vjerovatnoćom svake i pravilima za kicker i izjednačene ruke.",
    ldHeadline: "Jačina kombinacija u pokeru — Texas Hold’em",
    ldDesc: "Deset kombinacija Texas Hold’ema redom, s primjerima, učestalošću i pravilima kod izjednačenja.",
    h1: "Jačina kombinacija u pokeru",
    lead: "U Texas Hold’emu ruke se rangiraju od najjače do najslabije ovako. Ruka je uvijek tačno pet karata, odabranih između sedam koje vidiš: tvoje dvije zatvorene i pet zajedničkih. Ne moraš koristiti svoje karte — ako sam sto formira najboljih pet, to je takođe tvoja ruka.",
    names: ["Royal flush", "Skala u boji", "Četvorka", "Full house", "Boja", "Skala", "Trojka", "Dva para", "Par", "Visoka karta"],
    texts: [
      "A K Q J 10 u istoj boji. Najbolja moguća ruka: ne može se pobijediti, samo izjednačiti.",
      "Pet uzastopnih karata u istoj boji. Između dvije skale u boji pobjeđuje ona s višom gornjom kartom.",
      "Četiri karte iste vrijednosti. Peta karta (kicker) rješava rijedak slučaj u kojem četvorka leži na samom stolu.",
      "Trojka uz par. Prvo se poredi trojka, zatim par.",
      "Pet karata iste boje, ali ne uzastopnih. Porede se jedna po jedna odozgo; nijedna boja nije jača od druge.",
      "Pet uzastopnih karata u miješanim bojama. As igra gore (10-J-Q-K-A) ili dolje (A-2-3-4-5), nikad oboje istovremeno.",
      "Tri karte iste vrijednosti, uz dvije nepovezane karte.",
      "Dva različita para uz petu kartu. Prvo se poredi viši par, zatim niži, pa kicker.",
      "Dvije karte iste vrijednosti uz tri nepovezane karte, koje se porede redom.",
      "Ništa od navedenog. Odlučuje najviša karta, zatim sljedeća, i tako dalje."
    ],
    dealt: "pojavljuje se u %s ruku od sedam karata",
    tiesH2: "Kako se rješava izjednačenje",
    tiesP: "Prvo se poredi kategorija: bilo koja boja pobjeđuje bilo koju skalu, kakve god karte bile. Unutar iste kategorije poredi se vrijednost po vrijednost odozgo. Ono što ostane nakon kombinacije zove se <em>kicker</em> i odlučuje mnogo više ruku nego što početnici očekuju: na stolu A-9-4 i A♠ K♦ i A♣ 7♥ daju par asova, ali kralj nadjačava sedmicu. U Hold’emu boje nikada ne rješavaju izjednačenje — dva igrača s istih pet vrijednosti dijele pot do zadnjeg žetona.",
    wrongH2: "Šta se najčešće krivo shvata",
    wrong: [
      "As je za skalu istovremeno i najviša i najniža karta: A-K-Q-J-10 je najbolja, A-2-3-4-5 (takozvani <em>wheel</em>) najslabija. Niz se ne zatvara u krug — Q-K-A-2-3 nije baš ništa.",
      "Boja je pet karata iste boje, ne četiri. Četiri herca između tvoje ruke i stola sama po sebi ne vrijede ništa.",
      "Trojka složena od para u ruci i jedne karte na stolu zove se <em>set</em>; složena od jedne karte u ruci i para na stolu zove se <em>trips</em>. Isti rang, vrlo različita snaga, jer trips vide svi.",
      "Broji se samo najboljih pet karata. Dva para u ruci i treći par na stolu i dalje su dva para, ne tri.",
      "Procenti iznad govore koliko se često svaka ruka uopšte sastavi do rivera od sedam karata, a ne koliko često pobjeđuje. Dva para djeluju obično, a ipak su ispred većine onoga na šta naiđu."
    ],
    seeH2: "Kako to izgleda za stolom",
    seeP: "Tokom igre PokerTH ispod stola ispisuje naziv tvoje trenutne najbolje ruke, pa je nikad ne moraš slagati u glavi dok vrijeme ističe, a na otvaranju karata svaku otkrivenu ruku prikazuje s istaknutih pet karata koje su zaista vrijedile. Vježbanje offline protiv računarskih protivnika najbrži je način da ti redoslijed uđe u prste."
  },

  mk: {
    title: "Јачина на покер комбинации — редослед на раце во Texas Hold’em",
    desc: "Сите десет покер комбинации во Texas Hold’em, од ројал флаш до висока карта, со примери, веројатноста на секоја и правилата за кикер и изедначени раце.",
    ldHeadline: "Јачина на покер комбинации — Texas Hold’em",
    ldDesc: "Десет комбинации на Texas Hold’em по ред, со примери, зачестеност и правила за изедначување.",
    h1: "Јачина на покер комбинации",
    lead: "Во Texas Hold’em, раците се рангираат од најсилна до најслаба вака. Раката секогаш се состои од точно пет карти, избрани меѓу седумте што ги гледаш: твоите две скриени карти и петте заеднички карти. Не мораш да ги користиш своите карти — ако само масата формира најдобрите пет, тоа е исто така твоја рака.",
    names: ["Ројал флаш", "Стрит флаш", "Кара", "Фул хаус", "Флаш", "Стрит", "Трилинг", "Два пара", "Еден пар", "Висока карта"],
    texts: [
      "A K Q J 10, сите иста боја. Најдобрата можна рака: не може да се победи, само да се изедначи.",
      "Пет последователни карти иста боја. Меѓу два стрит флаша победува оној со повисока горна карта.",
      "Четири карти со иста вредност. Петтата карта (кикер) го решава реткиот случај кога сите четири лежат на масата.",
      "Трилинг заедно со пар. Прво се споредува трилингот, потоа парот.",
      "Пет карти иста боја, но не последователни. Се споредуваат една по една одозгора; ниту една боја не е посилна од друга.",
      "Пет последователни карти со мешани бои. Асот игра горе (10-J-Q-K-A) или долу (A-2-3-4-5), никогаш и двете истовремено.",
      "Три карти со иста вредност, плус две неповрзани карти.",
      "Два различни пара плус петта карта. Прво се споредува повисокиот пар, потоа понискиот, па кикерот.",
      "Две карти со иста вредност плус три неповрзани карти, кои се споредуваат по ред.",
      "Ништа од погоре наведеното. Одлучува највисоката карта, потоа следната, и така натаму."
    ],
    dealt: "се појавува кај %s раце од седум карти",
    tiesH2: "Како се решава изедначувањето",
    tiesP: "Прво се споредува категоријата: секој флаш победува секој стрит, без разлика какви карти содржи. Во рамки на истата категорија, се споредува вредност по вредност одозгора. Она што останува по составувањето на комбинацијата се вика <em>кикер</em> и решава многу повеќе раце отколку што почетниците очекуваат: на маса A-9-4, и A♠ K♦ и A♣ 7♥ даваат пар аса, но кралот победува седмица. Во Hold’em, боите никогаш не го решаваат изедначувањето — двајца играчи со иста петкартна вредност го делат потот до последниот жетон.",
    wrongH2: "Што најчесто погрешно се сфаќа",
    wrong: [
      "Асот е за стрит истовремено највисока и најниска карта: A-K-Q-J-10 е најдобар, A-2-3-4-5 (таканаречен <em>wheel</em>) е најслаб. Низата не се затвора во круг — Q-K-A-2-3 не е ништо.",
      "Флашот е пет карти со иста боја, не четири. Четири срца меѓу твојата рака и масата сами по себе не вредат ништо.",
      "Трилинг составен од пар во раката и една карта на масата се вика <em>set</em>; составен од една карта во раката и пар на масата се вика <em>trips</em>. Ист ранг, многу различна јачина, бидејќи trips го гледаат сите.",
      "Се брои само најдобрите пет карти. Два пара во раката и трет пар на масата сепак се два пара, не три.",
      "Процентите погоре покажуваат колку често секоја комбинација воопшто се составува до риверот од седум карти, не колку често победува. Двата пара изгледаат обични, а сепак победуваат поголемиот дел од тоа на што наидуваат."
    ],
    seeH2: "Како тоа изгледа за масата",
    seeP: "Додека играш PokerTH, под масата се испишува името на твојата тековна најдобра рака, така што никогаш не мораш да ја составуваш во главата под временски притисок, а при покажување на картите, секоја откриена рака ги прикажува истакнати точно тие пет карти што навистина важеле. Вежбањето офлајн против компјутерски противници е најбрзиот начин ова да ти влезе во прсти."
  },


  ms: {
    title: "Kekuatan Kombinasi Poker — Susunan Tangan dalam Texas Hold’em",
    desc: "Kesemua sepuluh kombinasi poker dalam Texas Hold’em, dari Royal Flush hingga kad tertinggi, dengan contoh, kebarangkalian setiap satu dan peraturan untuk kicker serta tangan seri.",
    ldHeadline: "Kekuatan Kombinasi Poker — Texas Hold’em",
    ldDesc: "Sepuluh kombinasi Texas Hold’em mengikut susunan, dengan contoh, kekerapan dan peraturan untuk seri.",
    h1: "Kekuatan Kombinasi Poker",
    lead: "Dalam Texas Hold’em, tangan disusun daripada yang paling kuat kepada yang paling lemah begini. Tangan sentiasa terdiri daripada tepat lima kad, dipilih daripada tujuh yang anda lihat: dua kad tertutup anda dan lima kad komuniti. Anda tidak perlu menggunakan kad anda sendiri — jika hanya meja membentuk lima terbaik, itu juga tangan anda.",
    names: ["Royal Flush", "Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind", "Two Pair", "One Pair", "High Card"],
    texts: [
      "A K Q J 10, semua sekad. Tangan terbaik yang mungkin: tidak boleh dikalahkan, hanya boleh seri.",
      "Lima kad berturutan sekad. Antara dua Straight Flush, yang menang ialah yang mempunyai kad tertinggi.",
      "Empat kad nilai sama. Kad kelima (kicker) menyelesaikan keadaan jarang apabila kesemua empat berada di atas meja.",
      "Three of a Kind bersama sepasang. Three of a Kind dibandingkan dahulu, kemudian pasangan.",
      "Lima kad sekad, tetapi tidak berturutan. Dibandingkan satu demi satu dari atas; tiada satu kad pun lebih kuat daripada yang lain.",
      "Lima kad berturutan dengan kad bercampur. As bermain tinggi (10-J-Q-K-A) atau rendah (A-2-3-4-5), tidak pernah kedua-duanya serentak.",
      "Tiga kad nilai sama, ditambah dua kad tidak berkaitan.",
      "Dua pasangan berbeza ditambah kad kelima. Pasangan lebih tinggi dibandingkan dahulu, kemudian yang lebih rendah, kemudian kicker.",
      "Dua kad nilai sama ditambah tiga kad tidak berkaitan, yang dibandingkan mengikut susunan.",
      "Tiada satu pun daripada yang di atas. Kad tertinggi menentukan, kemudian yang seterusnya, dan seterusnya."
    ],
    dealt: "berlaku pada %s tangan tujuh kad",
    tiesH2: "Cara Seri Diselesaikan",
    tiesP: "Kategori dibandingkan dahulu: mana-mana Flush mengalahkan mana-mana Straight, tidak kira apa kad yang ada. Dalam kategori yang sama, nilai dibandingkan satu demi satu dari atas. Apa yang tinggal selepas kombinasi dibentuk dipanggil <em>kicker</em>, dan ia menentukan lebih banyak tangan daripada yang disangka pemula: di atas meja A-9-4, kedua-dua A♠ K♦ dan A♣ 7♥ menghasilkan sepasang As, tetapi raja mengalahkan tujuh. Dalam Hold’em, kad tidak pernah menyelesaikan seri — dua pemain dengan nilai lima kad yang sama berkongsi pot sehingga cip terakhir.",
    wrongH2: "Apa yang Paling Sering Disalahfahamkan",
    wrong: [
      "As ialah kad tertinggi dan terendah serentak untuk Straight: A-K-Q-J-10 adalah yang terbaik, A-2-3-4-5 (dikenali sebagai <em>wheel</em>) adalah yang paling lemah. Susunan tidak menutup dalam bulatan — Q-K-A-2-3 bukan apa-apa.",
      "Flush ialah lima kad sekad, bukan empat. Empat kad hati antara tangan anda dan meja dengan sendirinya tidak bernilai apa-apa.",
      "Three of a Kind yang dibentuk daripada sepasang di tangan dan satu kad di atas meja dipanggil <em>set</em>; yang dibentuk daripada satu kad di tangan dan sepasang di atas meja dipanggil <em>trips</em>. Kedudukan sama, kekuatan sangat berbeza, kerana semua orang nampak trips.",
      "Hanya lima kad terbaik dikira. Dua pasangan di tangan dan pasangan ketiga di atas meja masih dua pasangan, bukan tiga.",
      "Peratusan di atas menunjukkan seberapa kerap setiap kombinasi terbentuk langsung sehingga river daripada tujuh kad, bukan seberapa kerap ia menang. Dua pasangan kelihatan biasa namun masih mengalahkan kebanyakan apa yang ditemuinya."
    ],
    seeH2: "Cara Melihatnya di Meja",
    seeP: "Semasa bermain PokerTH, nama kombinasi terbaik anda pada masa itu dipaparkan di bawah meja, jadi anda tidak perlu menyusunnya dalam kepala di bawah tekanan masa, dan semasa penunjukan kad, setiap tangan yang didedahkan menonjolkan tepat lima kad yang benar-benar dikira. Berlatih luar talian menentang lawan komputer adalah cara paling pantas untuk menjadikan susunan ini sebati."
  },

  sq: {
    title: "Fuqia e Kombinimeve në Poker — Renditja e Duarve në Texas Hold’em",
    desc: "Të gjitha dhjetë kombinimet e pokerit në Texas Hold’em, nga Royal Flush te letra më e lartë, me shembuj, probabilitetin e secilit dhe rregullat për kicker-in dhe duart e barabarta.",
    ldHeadline: "Fuqia e Kombinimeve në Poker — Texas Hold’em",
    ldDesc: "Dhjetë kombinimet e Texas Hold’em sipas renditjes, me shembuj, shpeshtësinë dhe rregullat për barazitë.",
    h1: "Fuqia e Kombinimeve në Poker",
    lead: "Në Texas Hold’em, duart renditen nga më e forta te më e dobëta kështu. Dora përbëhet gjithmonë saktësisht nga pesë letra, të zgjedhura mes shtatë që sheh: dy letrat e tua private dhe pesë letrat e komunitetit. Nuk je i detyruar të përdorësh letrat e tua — nëse vetëm tavolina formon pesë letrat më të mira, edhe ajo është dora jote.",
    names: ["Royal Flush", "Straight Flush", "Katërshja", "Full House", "Flush", "Straight", "Treshja", "Dy çifte", "Një çift", "Letra më e lartë"],
    texts: [
      "A K Q J 10, të gjitha e njëjta bojë. Dora më e mirë e mundshme: nuk mund të mundet, vetëm të barazohet.",
      "Pesë letra rresht e njëjta bojë. Mes dy Straight Flush-eve, fiton ai me letrën më të lartë sipër.",
      "Katër letra me të njëjtën vlerë. Letra e pestë (kicker) e zgjidh rastin e rrallë kur të katërta janë në tavolinë.",
      "Treshja bashkë me një çift. Krahasohet fillimisht treshja, pastaj çifti.",
      "Pesë letra e njëjta bojë, por jo rresht. Krahasohen një nga një duke filluar nga më e larta; asnjë bojë s’është më e fortë se tjetra.",
      "Pesë letra rresht me bojë të përziera. Asi luan lart (10-J-Q-K-A) ose poshtë (A-2-3-4-5), kurrë të dyja njëkohësisht.",
      "Tri letra me të njëjtën vlerë, plus dy letra të palidhura.",
      "Dy çifte të ndryshme plus letra e pestë. Krahasohet fillimisht çifti më i lartë, pastaj më i ulëti, pastaj kicker-i.",
      "Dy letra me të njëjtën vlerë plus tri letra të palidhura, që krahasohen me radhë.",
      "Asnjë nga sa më sipër. Vendos letra më e lartë, pastaj tjetra, e kështu me radhë."
    ],
    dealt: "ndodh në %s të duarve me shtatë letra",
    tiesH2: "Si Zgjidhen Barazitë",
    tiesP: "Krahasohet fillimisht kategoria: çdo Flush mund çdo Straight, pavarësisht cilat letra ka. Brenda së njëjtës kategori, vlera krahasohet një nga një nga lart. Ajo që mbetet pas formimit të kombinimit quhet <em>kicker</em>, dhe vendos shumë më tepër duar sesa fillestarët e presin: në tavolinë A-9-4, si A♠ K♦ ashtu edhe A♣ 7♥ japin çift asash, por mbreti mund shtatën. Në Hold’em, boja kurrë s’e zgjidh barazinë — dy lojtarë me të njëjtën vlerë pesë-letrash e ndajnë bankën deri te zhetoni i fundit.",
    wrongH2: "Çfarë Kuptohet Më Gabim",
    wrong: [
      "Asi është njëkohësisht letra më e lartë dhe më e ulët për Straight-in: A-K-Q-J-10 është më i miri, A-2-3-4-5 (i njohur si <em>wheel</em>) është më i dobëti. Radha nuk mbyllet në rreth — Q-K-A-2-3 s’është asgjë.",
      "Flush-i është pesë letra e njëjta bojë, jo katër. Katër zemra mes dorës tënde dhe tavolinës vetë s’vlejnë asgjë.",
      "Treshja e formuar nga një çift në dorë dhe një letër në tavolinë quhet <em>set</em>; ajo e formuar nga një letër në dorë dhe një çift në tavolinë quhet <em>trips</em>. I njëjti rang, forcë shumë e ndryshme, sepse trips-in e shohin të gjithë.",
      "Numërohen vetëm pesë letrat më të mira. Dy çifte në dorë dhe një çift i tretë në tavolinë mbeten prapë dy çifte, jo tri.",
      "Përqindjet më sipër tregojnë sa shpesh formohet fare çdo kombinim deri te river-i nga shtatë letra, jo sa shpesh fiton. Dy çiftet duken të zakonshme e prapëseprapë mundin shumicën e asaj që hasin."
    ],
    seeH2: "Si Duket te Tavolina",
    seeP: "Ndërsa luan PokerTH, nën tavolinë shkruhet emri i kombinimit tënd më të mirë aktual, kështu që s’të duhet ta ndërtosh kurrë në mendje nën presionin e kohës, dhe në zbulimin e letrave, çdo dorë e zbuluar i thekson saktësisht ato pesë letra që vërtet numëroheshin. Stërvitja offline kundër kundërshtarëve kompjuterikë është mënyra më e shpejtë për ta bërë këtë renditje refleks."
  },
  pa: {
    title: "ਪੋਕਰ ਹੱਥ ਰੈਂਕਿੰਗ — Texas Hold’em ਵਿੱਚ ਹੱਥਾਂ ਦਾ ਦਰਜਾ",
    desc: "Texas Hold’em ਦੇ ਸਾਰੇ ਦਸ ਪੋਕਰ ਹੱਥ, Royal Flush ਤੋਂ ਸਭ ਤੋਂ ਵੱਡੇ ਪੱਤੇ ਤੱਕ, ਉਦਾਹਰਨਾਂ, ਹਰੇਕ ਦੀ ਸੰਭਾਵਨਾ ਅਤੇ ਕਿੱਕਰ ਤੇ ਬਰਾਬਰ ਹੱਥਾਂ ਦੇ ਨਿਯਮਾਂ ਸਮੇਤ।",
    ldHeadline: "ਪੋਕਰ ਹੱਥ ਰੈਂਕਿੰਗ — Texas Hold’em",
    ldDesc: "Texas Hold’em ਦੇ ਦਸ ਹੱਥ ਦਰਜੇ ਅਨੁਸਾਰ, ਉਦਾਹਰਨਾਂ, ਵਾਰਵਾਰਤਾ ਅਤੇ ਬਰਾਬਰੀ ਦੇ ਨਿਯਮਾਂ ਸਮੇਤ।",
    h1: "ਪੋਕਰ ਹੱਥ ਰੈਂਕਿੰਗ",
    lead: "Texas Hold’em ਵਿੱਚ ਹੱਥ ਸਭ ਤੋਂ ਮਜ਼ਬੂਤ ਤੋਂ ਸਭ ਤੋਂ ਕਮਜ਼ੋਰ ਤੱਕ ਇਸ ਤਰ੍ਹਾਂ ਦਰਜ ਹੁੰਦੇ ਹਨ। ਹੱਥ ਹਮੇਸ਼ਾ ਬਿਲਕੁਲ ਪੰਜ ਪੱਤਿਆਂ ਦਾ ਹੁੰਦਾ ਹੈ, ਜੋ ਤੁਹਾਨੂੰ ਦਿਖਦੇ ਸੱਤ ਪੱਤਿਆਂ ਵਿੱਚੋਂ ਚੁਣੇ ਜਾਂਦੇ ਹਨ: ਤੁਹਾਡੇ ਦੋ ਨਿੱਜੀ ਪੱਤੇ ਅਤੇ ਪੰਜ ਕਮਿਊਨਿਟੀ ਪੱਤੇ। ਤੁਹਾਨੂੰ ਆਪਣੇ ਪੱਤੇ ਵਰਤਣ ਦੀ ਲੋੜ ਨਹੀਂ — ਜੇ ਇਕੱਲਾ ਬੋਰਡ ਹੀ ਸਭ ਤੋਂ ਵਧੀਆ ਪੰਜ ਪੱਤੇ ਬਣਾਉਂਦਾ ਹੈ, ਓਹ ਵੀ ਤੁਹਾਡਾ ਹੱਥ ਹੈ।",
    names: ["Royal Flush", "Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind", "Two Pair", "One Pair", "High Card"],
    texts: [
      "A K Q J 10, ਸਭ ਇੱਕੋ ਰੰਗ ਦੇ। ਸਭ ਤੋਂ ਵਧੀਆ ਸੰਭਵ ਹੱਥ: ਇਸਨੂੰ ਹਰਾਇਆ ਨਹੀਂ ਜਾ ਸਕਦਾ, ਸਿਰਫ਼ ਬਰਾਬਰ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ।",
      "ਲਗਾਤਾਰ ਪੰਜ ਪੱਤੇ ਇੱਕੋ ਰੰਗ ਦੇ। ਦੋ Straight Flush ਵਿੱਚੋਂ, ਸਿਖਰ \u2019ਤੇ ਵੱਡੇ ਪੱਤੇ ਵਾਲਾ ਜਿੱਤਦਾ ਹੈ।",
      "ਇੱਕੋ ਦਰਜੇ ਦੇ ਚਾਰ ਪੱਤੇ। ਪੰਜਵਾਂ ਪੱਤਾ (ਕਿੱਕਰ) ਓਸ ਦੁਰਲੱਭ ਸਥਿਤੀ ਦਾ ਫੈਸਲਾ ਕਰਦਾ ਹੈ ਜਦੋਂ ਚਾਰੇ ਬੋਰਡ \u2019ਤੇ ਹੋਣ।",
      "ਤਿੰਨ ਇੱਕੋ ਜਿਹੇ ਅਤੇ ਇੱਕ ਜੋੜਾ। ਪਹਿਲਾਂ ਤਿੰਨ ਦੀ ਤੁਲਨਾ ਹੁੰਦੀ ਹੈ, ਫੇਰ ਜੋੜੇ ਦੀ।",
      "ਇੱਕੋ ਰੰਗ ਦੇ ਪੰਜ ਪੱਤੇ, ਪਰ ਲਗਾਤਾਰ ਨਹੀਂ। ਸਭ ਤੋਂ ਵੱਡੇ ਤੋਂ ਸ਼ੁਰੂ ਕਰਕੇ ਇੱਕ-ਇੱਕ ਕਰਕੇ ਤੁਲਨਾ ਹੁੰਦੀ ਹੈ; ਕੋਈ ਰੰਗ ਦੂਜੇ ਤੋਂ ਵੱਡਾ ਨਹੀਂ।",
      "ਮਿਲੇ-ਜੁਲੇ ਰੰਗਾਂ ਦੇ ਲਗਾਤਾਰ ਪੰਜ ਪੱਤੇ। ਇੱਕਾ ਉੱਚਾ (10-J-Q-K-A) ਜਾਂ ਨੀਵਾਂ (A-2-3-4-5) ਚੱਲਦਾ ਹੈ, ਕਦੇ ਦੋਵੇਂ ਇੱਕੋ ਵੇਲੇ ਨਹੀਂ।",
      "ਇੱਕੋ ਦਰਜੇ ਦੇ ਤਿੰਨ ਪੱਤੇ, ਨਾਲ ਦੋ ਵੱਖਰੇ ਪੱਤੇ।",
      "ਦੋ ਵੱਖਰੇ ਜੋੜੇ ਅਤੇ ਪੰਜਵਾਂ ਪੱਤਾ। ਪਹਿਲਾਂ ਵੱਡੇ ਜੋੜੇ ਦੀ ਤੁਲਨਾ, ਫੇਰ ਛੋਟੇ ਦੀ, ਫੇਰ ਕਿੱਕਰ ਦੀ।",
      "ਇੱਕੋ ਦਰਜੇ ਦੇ ਦੋ ਪੱਤੇ ਅਤੇ ਤਿੰਨ ਵੱਖਰੇ ਪੱਤੇ, ਜਿਨ੍ਹਾਂ ਦੀ ਵਾਰੀ-ਵਾਰੀ ਤੁਲਨਾ ਹੁੰਦੀ ਹੈ।",
      "ਉੱਪਰਲਿਆਂ ਵਿੱਚੋਂ ਕੁਝ ਨਹੀਂ। ਸਭ ਤੋਂ ਵੱਡਾ ਪੱਤਾ ਫੈਸਲਾ ਕਰਦਾ ਹੈ, ਫੇਰ ਅਗਲਾ, ਅਤੇ ਇਸੇ ਤਰ੍ਹਾਂ।"
    ],
    dealt: "ਸੱਤ-ਪੱਤਿਆਂ ਵਾਲੇ %s ਹੱਥਾਂ ਵਿੱਚ ਬਣਦਾ ਹੈ",
    tiesH2: "ਬਰਾਬਰੀ ਦਾ ਫੈਸਲਾ ਕਿਵੇਂ ਹੁੰਦਾ ਹੈ",
    tiesP: "ਪਹਿਲਾਂ ਸ਼੍ਰੇਣੀ ਦੀ ਤੁਲਨਾ ਹੁੰਦੀ ਹੈ: ਕੋਈ ਵੀ Flush ਕਿਸੇ ਵੀ Straight ਨੂੰ ਹਰਾਉਂਦਾ ਹੈ, ਚਾਹੇ ਪੱਤੇ ਕੋਈ ਵੀ ਹੋਣ। ਇੱਕੋ ਸ਼੍ਰੇਣੀ ਦੇ ਅੰਦਰ, ਦਰਜੇ ਦੀ ਤੁਲਨਾ ਉੱਪਰੋਂ ਇੱਕ-ਇੱਕ ਕਰਕੇ ਹੁੰਦੀ ਹੈ। ਸੁਮੇਲ ਬਣਨ ਬਾਅਦ ਜੋ ਬਚਦਾ ਹੈ ਉਸਨੂੰ <em>ਕਿੱਕਰ</em> ਕਹਿੰਦੇ ਹਨ, ਅਤੇ ਇਹ ਨਵੇਂ ਖਿਡਾਰੀਆਂ ਦੀ ਉਮੀਦ ਨਾਲੋਂ ਕਿਤੇ ਵੱਧ ਹੱਥਾਂ ਦਾ ਫੈਸਲਾ ਕਰਦਾ ਹੈ: A-9-4 ਬੋਰਡ \u2019ਤੇ, A♠ K♦ ਅਤੇ A♣ 7♥ ਦੋਵੇਂ ਇੱਕਿਆਂ ਦਾ ਜੋੜਾ ਦਿੰਦੇ ਹਨ, ਪਰ ਬਾਦਸ਼ਾਹ ਸੱਤ ਨੂੰ ਹਰਾਉਂਦਾ ਹੈ। Hold’em ਵਿੱਚ ਰੰਗ ਕਦੇ ਬਰਾਬਰੀ ਦਾ ਫੈਸਲਾ ਨਹੀਂ ਕਰਦਾ — ਇੱਕੋ ਪੰਜ-ਪੱਤਾ ਦਰਜੇ ਵਾਲੇ ਦੋ ਖਿਡਾਰੀ ਪਾਟ ਨੂੰ ਆਖਰੀ ਚਿੱਪ ਤੱਕ ਵੰਡਦੇ ਹਨ।",
    wrongH2: "ਸਭ ਤੋਂ ਵੱਧ ਗ਼ਲਤ ਕੀ ਸਮਝਿਆ ਜਾਂਦਾ ਹੈ",
    wrong: [
      "ਇੱਕਾ Straight ਲਈ ਸਭ ਤੋਂ ਵੱਡਾ ਅਤੇ ਸਭ ਤੋਂ ਛੋਟਾ ਪੱਤਾ ਦੋਵੇਂ ਹੈ: A-K-Q-J-10 ਸਭ ਤੋਂ ਵਧੀਆ ਹੈ, A-2-3-4-5 (ਜਿਸਨੂੰ <em>wheel</em> ਕਹਿੰਦੇ ਹਨ) ਸਭ ਤੋਂ ਕਮਜ਼ੋਰ। ਲੜੀ ਗੋਲ ਨਹੀਂ ਘੁੰਮਦੀ — Q-K-A-2-3 ਕੁਝ ਵੀ ਨਹੀਂ ਹੈ।",
      "Flush ਇੱਕੋ ਰੰਗ ਦੇ ਪੰਜ ਪੱਤੇ ਹੈ, ਚਾਰ ਨਹੀਂ। ਤੁਹਾਡੇ ਹੱਥ ਅਤੇ ਬੋਰਡ ਵਿਚਕਾਰ ਚਾਰ ਪਾਨ ਆਪਣੇ ਆਪ ਵਿੱਚ ਕੁਝ ਨਹੀਂ ਹਨ।",
      "ਹੱਥ ਵਿਚਲੇ ਜੋੜੇ ਅਤੇ ਬੋਰਡ ਦੇ ਇੱਕ ਪੱਤੇ ਤੋਂ ਬਣੇ ਤਿੰਨ ਨੂੰ <em>set</em> ਕਹਿੰਦੇ ਹਨ; ਹੱਥ ਦੇ ਇੱਕ ਪੱਤੇ ਅਤੇ ਬੋਰਡ ਦੇ ਜੋੜੇ ਤੋਂ ਬਣੇ ਨੂੰ <em>trips</em>। ਇੱਕੋ ਦਰਜਾ, ਬਹੁਤ ਵੱਖਰੀ ਤਾਕਤ, ਕਿਉਂਕਿ trips ਸਭ ਨੂੰ ਦਿਖਦੇ ਹਨ।",
      "ਸਿਰਫ਼ ਸਭ ਤੋਂ ਵਧੀਆ ਪੰਜ ਪੱਤੇ ਗਿਣੇ ਜਾਂਦੇ ਹਨ। ਹੱਥ ਵਿੱਚ ਦੋ ਜੋੜੇ ਅਤੇ ਬੋਰਡ \u2019ਤੇ ਤੀਜਾ ਜੋੜਾ ਫੇਰ ਵੀ Two Pair ਹੈ, ਤਿੰਨ ਨਹੀਂ।",
      "ਉੱਪਰਲੀਆਂ ਪ੍ਰਤੀਸ਼ਤਾਂ ਦੱਸਦੀਆਂ ਹਨ ਕਿ ਸੱਤ ਪੱਤਿਆਂ ਤੋਂ ਰਿਵਰ ਤੱਕ ਹਰ ਸੁਮੇਲ ਕਿੰਨੀ ਵਾਰ ਬਣਦਾ ਹੈ, ਕਿੰਨੀ ਵਾਰ ਜਿੱਤਦਾ ਹੈ ਨਹੀਂ। Two Pair ਆਮ ਲੱਗਦਾ ਹੈ ਪਰ ਫੇਰ ਵੀ ਜ਼ਿਆਦਾਤਰ ਨੂੰ ਹਰਾ ਦਿੰਦਾ ਹੈ।"
    ],
    seeH2: "ਟੇਬਲ \u2019ਤੇ ਇਹ ਕਿਵੇਂ ਦਿਖਦਾ ਹੈ",
    seeP: "PokerTH ਖੇਡਦੇ ਸਮੇਂ, ਟੇਬਲ ਹੇਠਾਂ ਤੁਹਾਡੇ ਮੌਜੂਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਸੁਮੇਲ ਦਾ ਨਾਮ ਲਿਖਿਆ ਹੁੰਦਾ ਹੈ, ਤਾਂ ਜੋ ਤੁਹਾਨੂੰ ਸਮੇਂ ਦੇ ਦਬਾਅ ਹੇਠ ਕਦੇ ਇਸਨੂੰ ਦਿਮਾਗ਼ ਵਿੱਚ ਬਣਾਉਣਾ ਨਾ ਪਵੇ, ਅਤੇ ਸ਼ੋਡਾਊਨ \u2019ਤੇ ਹਰ ਖੁੱਲ੍ਹਾ ਹੱਥ ਬਿਲਕੁਲ ਓਹ ਪੰਜ ਪੱਤੇ ਉਭਾਰਦਾ ਹੈ ਜੋ ਅਸਲ ਵਿੱਚ ਗਿਣੇ ਗਏ। ਕੰਪਿਊਟਰ ਵਿਰੋਧੀਆਂ ਵਿਰੁੱਧ ਆਫਲਾਈਨ ਅਭਿਆਸ ਇਸ ਰੈਂਕਿੰਗ ਨੂੰ ਆਦਤ ਬਣਾਉਣ ਦਾ ਸਭ ਤੋਂ ਤੇਜ਼ ਤਰੀਕਾ ਹੈ।"
  },
  am: {
    title: "የፖከር እጅ ደረጃዎች — በ Texas Hold’em ውስጥ የእጆች ደረጃ",
    desc: "ከ Royal Flush እስከ ከፍተኛ ካርታ የ Texas Hold’em አሥሩም የፖከር እጆች፣ በምሳሌዎች፣ በእያንዳንዱ ዕድል እና በኪከር እና እኩል እጆች ደንቦች።",
    ldHeadline: "የፖከር እጅ ደረጃዎች — Texas Hold’em",
    ldDesc: "የ Texas Hold’em አሥሩ እጆች በደረጃ ቅደም ተከተል፣ በምሳሌዎች፣ በድግግሞሽ እና በእኩልነት ደንቦች።",
    h1: "የፖከር እጅ ደረጃዎች",
    lead: "በ Texas Hold’em ውስጥ እጆች ከጠንካራው እስከ ደካማው እንደዚህ ይደረደራሉ። እጅ ሁልጊዜ በትክክል አምስት ካርታዎች ነው፣ ከሚያዩዋቸው ሰባት የተመረጡ፦ ሁለቱ የግል ካርታዎችዎ እና አምስቱ የጋራ ካርታዎች። ካርታዎችዎን መጠቀም አይጠበቅብዎትም — ቦርዱ ብቻ ምርጡን አምስት ካርታዎች ከሠራ፣ ያም እጅዎ ነው።",
    names: ["Royal Flush", "Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind", "Two Pair", "One Pair", "High Card"],
    texts: [
      "A K Q J 10፣ ሁሉም ተመሳሳይ ቀለም። ምርጡ ሊሆን የሚችል እጅ፦ ሊሸነፍ አይችልም፣ ሊተካከል ብቻ ይችላል።",
      "አምስት ተከታታይ ካርታዎች በተመሳሳይ ቀለም። በሁለት Straight Flush መካከል ከላይ ከፍተኛ ካርታ ያለው ያሸንፋል።",
      "ተመሳሳይ ደረጃ ያላቸው አራት ካርታዎች። አምስተኛው ካርታ (ኪከር) አራቱም በቦርዱ ላይ ሲሆኑ ያለውን ብርቅ ሁኔታ ይወስናል።",
      "ሦስት ተመሳሳይ እና አንድ ጥንድ። መጀመሪያ ሦስቱ ይነጻጸራሉ፣ ከዚያ ጥንዱ።",
      "ተመሳሳይ ቀለም ያላቸው አምስት ካርታዎች፣ ግን ተከታታይ ያልሆኑ። ከከፍተኛው ጀምሮ አንድ በአንድ ይነጻጸራሉ፤ ምንም ቀለም ከሌላው አይበልጥም።",
      "ድብልቅ ቀለሞች ያሏቸው አምስት ተከታታይ ካርታዎች። ኤሱ ከፍ (10-J-Q-K-A) ወይም ዝቅ (A-2-3-4-5) ይጫወታል፣ በጭራሽ ሁለቱም በአንድ ጊዜ አይደለም።",
      "ተመሳሳይ ደረጃ ያላቸው ሦስት ካርታዎች፣ እና ሁለት ያልተያያዙ ካርታዎች።",
      "ሁለት የተለያዩ ጥንዶች እና አምስተኛ ካርታ። መጀመሪያ ከፍተኛው ጥንድ ይነጻጸራል፣ ከዚያ ዝቅተኛው፣ ከዚያ ኪከሩ።",
      "ተመሳሳይ ደረጃ ያላቸው ሁለት ካርታዎች እና ሦስት ያልተያያዙ ካርታዎች፣ በተራ የሚነጻጸሩ።",
      "ከላይ ካሉት ምንም። ከፍተኛው ካርታ ይወስናል፣ ከዚያ ቀጣዩ፣ እና ወዘተ።"
    ],
    dealt: "ከሰባት-ካርታ እጆች %s ውስጥ ይከሰታል",
    tiesH2: "እኩልነት እንዴት እንደሚፈታ",
    tiesP: "መጀመሪያ ምድቡ ይነጻጸራል፦ ማንኛውም Flush ማንኛውንም Straight ያሸንፋል፣ ካርታዎቹ ምንም ቢሆኑ። በተመሳሳይ ምድብ ውስጥ ደረጃው ከላይ አንድ በአንድ ይነጻጸራል። ጥምረቱ ከተሠራ በኋላ የቀረው <em>ኪከር</em> ይባላል፣ እና ጀማሪዎች ከሚጠብቁት እጅግ በላይ እጆችን ይወስናል፦ በ A-9-4 ቦርድ ላይ A♠ K♦ እና A♣ 7♥ ሁለቱም የኤሶች ጥንድ ይሰጣሉ፣ ግን ንጉሱ ሰባቱን ያሸንፋል። በ Hold’em ውስጥ ቀለም በጭራሽ እኩልነትን አይፈታም — ተመሳሳይ ባለ አምስት ካርታ ደረጃ ያላቸው ሁለት ተጫዋቾች ፖቱን እስከ መጨረሻው ቺፕ ይካፈላሉ።",
    wrongH2: "በብዛት በስህተት የሚረዳው",
    wrong: [
      "ኤሱ ለ Straight ከፍተኛውም ዝቅተኛውም ካርታ ነው፦ A-K-Q-J-10 ምርጡ ነው፣ A-2-3-4-5 (<em>wheel</em> የሚባለው) ደካማው ነው። ቅደም ተከተሉ አይዞርም — Q-K-A-2-3 ምንም አይደለም።",
      "Flush ተመሳሳይ ቀለም ያላቸው አምስት ካርታዎች ነው፣ አራት አይደለም። በእጅዎ እና በቦርዱ መካከል አራት ልቦች በራሳቸው ምንም አይደሉም።",
      "ከእጅ ጥንድ እና ከቦርዱ አንድ ካርታ የተሠራ ሦስት <em>set</em> ይባላል፤ ከእጅ አንድ ካርታ እና ከቦርዱ ጥንድ የተሠራው <em>trips</em> ይባላል። ተመሳሳይ ደረጃ፣ በጣም የተለየ ጥንካሬ፣ ምክንያቱም trips ሁሉም ያየዋል።",
      "ምርጦቹ አምስት ካርታዎች ብቻ ይቆጠራሉ። በእጅ ሁለት ጥንዶች እና በቦርዱ ላይ ሦስተኛ ጥንድ አሁንም Two Pair ነው፣ ሦስት አይደለም።",
      "ከላይ ያሉት መቶኛዎች እያንዳንዱ ጥምረት ከሰባት ካርታዎች እስከ ሪቨር ምን ያህል ጊዜ እንደሚሠራ ይናገራሉ፣ ምን ያህል ጊዜ እንደሚያሸንፍ አይደለም። Two Pair የተለመደ ይመስላል ግን አሁንም የሚያጋጥመውን አብዛኛውን ያሸንፋል።"
    ],
    seeH2: "በጠረጴዛው ላይ እንዴት እንደሚታይ",
    seeP: "PokerTH ሲጫወቱ የአሁኑ ምርጥ ጥምረትዎ ስም ከጠረጴዛው በታች ይጻፋል፣ በጊዜ ግፊት ውስጥ በአእምሮዎ መገንባት እንዳይኖርብዎ፣ እና በ showdown ላይ እያንዳንዱ የተገለጠ እጅ በእውነት የተቆጠሩትን አምስት ካርታዎች በትክክል ያደምቃል። ከኮምፒውተር ተቃዋሚዎች ጋር ከመስመር ውጪ መለማመድ ይህን ደረጃ ልማድ ለማድረግ ፈጣኑ መንገድ ነው።"
  },
  az: {
    title: "Poker kombinasiyaları — Texas Hold’em-də kombinasiyaların sırası",
    desc: "Texas Hold’em pokerinin royal flaşdan yüksək karta qədər sıralanmış on kombinasiyası, nümunələr, hər birinin ehtimalı və bərabərliklərin necə həll olunduğu ilə.",
    ldHeadline: "Poker kombinasiyaları — Texas Hold’em",
    ldDesc: "Texas Hold’em-in on kombinasiyası sıra ilə, nümunələr, tezliklər və bərabərlik qaydaları ilə.",
    h1: "Poker kombinasiyaları",
    lead: "Texas Hold’em-də kombinasiyalar ən güclüdən ən zəifə doğru aşağıdakı kimi sıralanır. Kombinasiya həmişə gördüyünüz yeddi kartdan seçilmiş düz beş kartdan ibarətdir: iki şəxsi kartınız və masadakı beş ümumi kart.",
    names: ["Royal flaş", "Streyt flaş", "Kare", "Full-hauz", "Flaş", "Streyt", "Üçlük", "İki cüt", "Cüt", "Yüksək kart"],
    texts: [
      "A K Q J 10, hamısı eyni rəngdə. Mümkün olan ən yaxşı kombinasiya; onu məğlub etmək olmaz, yalnız bərabərləşmək olar.",
      "Eyni rəngdə ardıcıl beş kart. İki streyt flaş arasında yuxarı kartı daha yüksək olan qazanır.",
      "Eyni dəyərli dörd kart. Beşinci kart (kiker) masada iki eyni kare arasındakı nadir bərabərliyi həll edir.",
      "Üçlük üstəgəl cüt. Əvvəlcə üç kartlıq hissə, sonra cüt müqayisə olunur.",
      "Eyni rəngdə, ardıcıl olmayan beş kart. Yuxarıdan başlayaraq kart-kart müqayisə olunur; heç bir rəng digərindən üstün deyil.",
      "Müxtəlif rəngli ardıcıl beş kart. Tuz yüksək (10-J-Q-K-A) və ya aşağı (A-2-3-4-5) oynayır, heç vaxt hər ikisi eyni anda deyil.",
      "Eyni dəyərli üç kart, üstəgəl iki əlaqəsiz kart.",
      "İki fərqli cüt üstəgəl beşinci kart. Əvvəlcə yüksək cüt, sonra aşağı cüt, sonra kiker müqayisə olunur.",
      "Eyni dəyərli iki kart üstəgəl üç əlaqəsiz kart, sıra ilə müqayisə olunur.",
      "Yuxarıdakılardan heç biri. Ən yüksək kart həll edir, sonra növbəti və s.",
    ],
    dealt: "yeddi kartlıq əllərin %s-də görünür",
    tiesH2: "Bərabərliklər necə həll olunur",
    tiesP: "Əvvəlcə kateqoriya müqayisə olunur: istənilən flaş kartlardan asılı olmayaraq istənilən streyti məğlub edir. Kateqoriya eyni olduqda yuxarıdan başlayaraq dəyər-dəyər müqayisə olunur. Kombinasiyadan sonra qalan karta <em>kiker</em> deyilir və o, yeni başlayanların düşündüyündən qat-qat çox əli həll edir: A♠ K♦ və A♣ 7♥ A-9-4 masasında hər ikisi tuz cütü düzəldir, lakin kral kikerdə yeddini məğlub edir. Hold’em-də rənglər heç vaxt heç nəyi həll etmir — eyni beş dəyərə malik iki oyunçu bankı son fişkaya qədər bölür.",
    wrongH2: "Yanlış olaraq düşünülənlər",
    wrong: [
      "Tuz streytdə həm ən yüksək, həm də ən aşağı kartdır: A-K-Q-J-10 ən yaxşısıdır, A-2-3-4-5 (<em>təkər</em>) isə ən zəifidir. Ardıcıllıq dövrə vurmur — Q-K-A-2-3 heç nə etmir.",
      "Flaş dörd deyil, eyni rəngdə beş kartdır. Əlinizlə masa arasında dörd ürək özlüyündə heç nəyə dəyməz.",
      "Əlinizdəki cüt üstəgəl masadakı kartdan düzələn üçlüyə <em>set</em> deyilir; əlinizdəki kart üstəgəl masadakı cütdən düzələnə isə <em>trips</em>. Sıralama eynidir, güc çox fərqlidir, çünki trips hamıya görünür.",
      "Yalnız ən yaxşı beş kart sayılır. Əlinizdə iki cüt və masada üçüncü cüt olduqda üç deyil, iki cütünüz var.",
      "Yuxarıdakı faizlər hər kombinasiyanın yeddi kartla river-də nə qədər tez-tez göründüyünü göstərir, nə qədər tez-tez qazandığını deyil. İki cüt adi görünür və qarşılaşdığı əksər əllərdən öndə qalır.",
    ],
    seeH2: "Masada görmək",
    seeP: "PokerTH oyun zamanı ən yaxşı kombinasiyanızı masanın altında adlandırır ki, onu heç vaxt vaxt təzyiqi altında yenidən qurmalı olmayasınız, showdown-da isə hər açılan əli nəzərə alınan beş kart vurğulanmış şəkildə göstərir. Kompüterin idarə etdiyi rəqiblərə qarşı oflayn məşq bu sıralamanı əzbərləməyin ən sürətli yolu olaraq qalır.",
  },
  be: {
    title: "Покерныя камбінацыі — старшынства рук у Texas Hold’em",
    desc: "Дзесяць камбінацый покера Texas Hold’em па старшынстве ад роял-флэша да старшай карты, з прыкладамі, верагоднасцю кожнай і тым, як вырашаюцца нічыі.",
    ldHeadline: "Покерныя камбінацыі — Texas Hold’em",
    ldDesc: "Дзесяць камбінацый Texas Hold’em па парадку, з прыкладамі, частотамі і правіламі нічыіх.",
    h1: "Покерныя камбінацыі",
    lead: "У Texas Hold’em рукі ранжыруюцца ад мацнейшай да слабейшай наступным чынам. Рука заўсёды складаецца роўна з пяці карт, выбраных з сямі, якія вы бачыце: вашых дзвюх асабістых карт і пяці агульных карт на стале.",
    names: [
      "Роял-флэш",
      "Стрыт-флэш",
      "Карэ",
      "Фул-хаўс",
      "Флэш",
      "Стрыт",
      "Тройка",
      "Дзве пары",
      "Пара",
      "Старшая карта",
    ],
    texts: [
      "A K Q J 10, усе адной масці. Лепшая магчымая рука; яе нельга перабіць, можна толькі згуляць унічыю.",
      "Пяць карт запар, усе адной масці. Паміж двума стрыт-флэшамі перамагае той, у каго вышэй старшая карта.",
      "Чатыры карты аднаго рангу. Пятая карта (кікер) вырашае рэдкую нічыю паміж двума аднолькавымі карэ на стале.",
      "Тройка плюс пара. Спачатку параўноўваецца тройка, потым пара.",
      "Пяць карт адной масці, не запар. Параўноўваюцца карта за картай зверху; ніводная масць не старэйшая за іншую.",
      "Пяць карт запар, розныя масці. Туз гуляе высока (10-J-Q-K-A) або нізка (A-2-3-4-5), але ніколі адначасова.",
      "Тры карты аднаго рангу плюс дзве не звязаныя карты.",
      "Дзве розныя пары плюс пятая карта. Спачатку параўноўваецца старшая пара, потым малодшая, потым кікер.",
      "Дзве карты аднаго рангу плюс тры не звязаныя карты, параўноўваюцца па парадку.",
      "Нічога з пералічанага. Вырашае старшая карта, потым наступная і г.д.",
    ],
    dealt: "выпадае ў %s сямікартных рук",
    tiesH2: "Як вырашаюцца нічыі",
    tiesP: "Спачатку параўноўваецца катэгорыя: любы флэш б'е любы стрыт незалежна ад карт. Пры аднолькавай катэгорыі параўноўваюць ранг за рангам зверху. Тое, што застаецца пасля камбінацыі, называецца <em>кікер</em>, і ён вырашае значна больш раздач, чым думаюць пачаткоўцы: A♠ K♦ і A♣ 7♥ абодва даюць пару тузоў на стале A-9-4, але кароль б'е сямёрку па кікеры. Масці ў Hold’em ніколі нічога не вырашаюць — два гульцы з тымі ж пяццю рангамі дзеляць банк да апошняй фішкі.",
    wrongH2: "Што памылкова думаюць",
    wrong: [
      "Туз — і старшая, і малодшая карта стрыта: A-K-Q-J-10 — лепшы, A-2-3-4-5 (<em>кола</em>) — слабейшы. Паслядоўнасць не замыкаецца — Q-K-A-2-3 нічога не значыць.",
      "Флэш — гэта пяць карт адной масці, а не чатыры. Чатыры чырвы паміж вашай рукой і сталом самі па сабе нічога не вартыя.",
      "Тройка з кішэннай пары плюс карта на стале называецца <em>сэт</em>; з адной вашай карты плюс пара на стале — <em>трыпс</em>. Аднолькавае старшынство, вельмі розная сіла, бо трыпс бачны ўсім.",
      "Лічацца толькі лепшыя пяць карт. З дзвюма парамі на руках і трэцяй парай на стале ў вас дзве пары, а не тры.",
      "Працэнты вышэй паказваюць, як часта кожная камбінацыя выпадае на рыверы з сямі карт, а не як часта яна перамагае. Дзве пары здаюцца звычайнымі і ўсё ж апярэджваюць большасць таго, што сустракаюць.",
    ],
    seeH2: "Як гэта выглядае за сталом",
    seeP: "Падчас гульні PokerTH называе вашу лепшую камбінацыю пад сталом, каб вам ніколі не даводзілася складаць яе пад ціскам часу, а на шоўдаўне паказвае кожную адкрытую руку з вылучанымі пяццю картамі, якія лічыліся. Афлайн-трэніроўка супраць камп'ютарных супернікаў застаецца самым хуткім спосабам засвоіць гэтае старшынство.",
  },
  km: {
    title: "ចំណាត់ថ្នាក់ដៃបៀ — របៀបដែលដៃត្រូវបានចាត់ថ្នាក់ក្នុង Texas Hold’em",
    desc: "ដៃបៀទាំងដប់នៃ Texas Hold’em ពី Royal Flush ដល់សន្លឹកខ្ពស់ ជាមួយឧទាហរណ៍ ប្រូបាប៊ីលីតេនីមួយៗ និងច្បាប់ kicker និងដៃស្មើគ្នា។",
    ldHeadline: "ចំណាត់ថ្នាក់ដៃបៀ — Texas Hold’em",
    ldDesc: "ដៃទាំងដប់នៃ Texas Hold’em តាមលំដាប់ចំណាត់ថ្នាក់ ជាមួយឧទាហរណ៍ ភាពញឹកញាប់ និងច្បាប់ស្មើគ្នា។",
    h1: "ចំណាត់ថ្នាក់ដៃបៀ",
    lead: "ក្នុង Texas Hold’em ដៃត្រូវបានចាត់ថ្នាក់ពីខ្លាំងបំផុតទៅខ្សោយបំផុតដូចនេះ។ ដៃមួយតែងតែមានបៀប្រាំសន្លឹកពិតប្រាកដ ជ្រើសរើសពីប្រាំពីរដែលអ្នកឃើញ៖ បៀឯកជនពីររបស់អ្នក និងបៀរួមប្រាំ។ អ្នកមិនចាំបាច់ប្រើបៀរបស់អ្នកទេ — បើក្ដារតែឯងបង្កើតបៀប្រាំល្អបំផុត នោះក៏ជាដៃរបស់អ្នកដែរ។",
    names: ["Royal Flush", "Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind", "Two Pair", "One Pair", "High Card"],
    texts: [
      "A K Q J 10 ពណ៌ដូចគ្នាទាំងអស់។ ដៃល្អបំផុតដែលអាចមាន៖ មិនអាចចាញ់ គ្រាន់តែស្មើ។",
      "ប្រាំសន្លឹកតគ្នាពណ៌ដូចគ្នា។ រវាង Straight Flush ពីរ សន្លឹកខ្ពស់ជាងនៅកំពូលឈ្នះ។",
      "បួនសន្លឹកមានចំណាត់ថ្នាក់ដូចគ្នា។ សន្លឹកទីប្រាំ (kicker) សម្រេចករណីកម្រដែលទាំងបួននៅលើក្ដារ។",
      "បីដូចគ្នា និងមួយគូ។ បីត្រូវបានប្រៀបធៀបមុន បន្ទាប់មកគូ។",
      "ប្រាំសន្លឹកពណ៌ដូចគ្នា ប៉ុន្តែមិនតគ្នា។ ប្រៀបធៀបម្ដងមួយចាប់ពីខ្ពស់បំផុត; គ្មានពណ៌ណាខ្ពស់ជាងពណ៌ផ្សេងទេ។",
      "ប្រាំសន្លឹកតគ្នាពណ៌ចម្រុះ។ អាត់លេងខ្ពស់ (10-J-Q-K-A) ឬទាប (A-2-3-4-5) មិនដែលទាំងពីរក្នុងពេលតែមួយ។",
      "បីសន្លឹកមានចំណាត់ថ្នាក់ដូចគ្នា បូកពីរសន្លឹកមិនទាក់ទង។",
      "ពីរគូខុសគ្នា និងសន្លឹកទីប្រាំ។ ប្រៀបធៀបគូខ្ពស់ជាងមុន បន្ទាប់មកគូទាបជាង បន្ទាប់មក kicker។",
      "ពីរសន្លឹកមានចំណាត់ថ្នាក់ដូចគ្នា និងបីសន្លឹកមិនទាក់ទង ប្រៀបធៀបជាវេន។",
      "គ្មានអ្វីខាងលើ។ សន្លឹកខ្ពស់បំផុតសម្រេច បន្ទាប់មកសន្លឹកបន្ទាប់ និងបន្តទៀត។"
    ],
    dealt: "កើតឡើងក្នុង %s នៃដៃប្រាំពីរសន្លឹក",
    tiesH2: "របៀបដោះស្រាយការស្មើគ្នា",
    tiesP: "ប្រភេទត្រូវបានប្រៀបធៀបមុន៖ Flush ណាមួយឈ្នះ Straight ណាមួយ មិនថាបៀអ្វី។ ក្នុងប្រភេទដូចគ្នា ចំណាត់ថ្នាក់ត្រូវបានប្រៀបធៀបពីលើចុះមកម្ដងមួយ។ អ្វីដែលនៅសល់បន្ទាប់ពីការផ្គុំហៅថា <em>kicker</em> ហើយវាសម្រេចដៃច្រើនជាងអ្នកលេងថ្មីរំពឹងទុក៖ លើក្ដារ A-9-4, A♠ K♦ និង A♣ 7♥ ទាំងពីរផ្ដល់គូអាត់ ប៉ុន្តែស្ដេចឈ្នះលេខប្រាំពីរ។ ពណ៌មិនដែលដោះស្រាយការស្មើគ្នាក្នុង Hold’em ទេ — អ្នកលេងពីរនាក់ដែលមានចំណាត់ថ្នាក់ប្រាំសន្លឹកដូចគ្នាចែក pot រហូតដល់ស៊ីបចុងក្រោយ។",
    wrongH2: "អ្វីដែលគេយល់ខុសញឹកញាប់បំផុត",
    wrong: [
      "អាត់ជាសន្លឹកខ្ពស់បំផុត និងទាបបំផុតសម្រាប់ Straight៖ A-K-Q-J-10 ល្អបំផុត A-2-3-4-5 (ហៅថា <em>wheel</em>) ខ្សោយបំផុត។ លំដាប់មិនរុំវិលទេ — Q-K-A-2-3 មិនមែនអ្វីទាំងអស់។",
      "Flush ជាប្រាំសន្លឹកពណ៌ដូចគ្នា មិនមែនបួនទេ។ បេះដូងបួនរវាងដៃរបស់អ្នក និងក្ដារមិនមែនអ្វីទាល់តែសោះ។",
      "បីដូចគ្នាដែលបង្កើតពីគូក្នុងដៃ និងមួយសន្លឹកលើក្ដារហៅថា <em>set</em>; បង្កើតពីមួយសន្លឹកក្នុងដៃ និងគូលើក្ដារហៅថា <em>trips</em>។ ចំណាត់ថ្នាក់ដូចគ្នា កម្លាំងខុសគ្នាឆ្ងាយ ព្រោះ trips អ្នកគ្រប់គ្នាឃើញ។",
      "តែប្រាំសន្លឹកល្អបំផុតរាប់។ ពីរគូក្នុងដៃ និងគូទីបីលើក្ដារនៅតែជា Two Pair មិនមែនបីទេ។",
      "ភាគរយខាងលើប្រាប់ថាការផ្គុំនីមួយៗកើតឡើងញឹកញាប់ប៉ុណ្ណាពីប្រាំពីរសន្លឹកដល់ river មិនមែនញឹកញាប់ប៉ុណ្ណាដែលវាឈ្នះ។ Two Pair មើលទៅសាមញ្ញ ប៉ុន្តែនៅតែឈ្នះភាគច្រើនដែលវាជួប។"
    ],
    seeH2: "របៀបដែលវាមើលទៅនៅតុ",
    seeP: "ពេលលេង PokerTH ឈ្មោះការផ្គុំល្អបំផុតបច្ចុប្បន្នរបស់អ្នកត្រូវបានសរសេរក្រោមតុ ដើម្បីកុំឱ្យអ្នកត្រូវសាងសង់វាក្នុងគំនិតក្រោមសម្ពាធពេលវេលា ហើយនៅ showdown ដៃដែលបើកនីមួយៗបន្លិចបៀប្រាំសន្លឹកពិតប្រាកដដែលរាប់។ ការហ្វឹកហាត់ក្រៅបណ្ដាញជាមួយគូប្រកួតកុំព្យូទ័រជាវិធីលឿនបំផុតដើម្បីធ្វើឱ្យចំណាត់ថ្នាក់នេះក្លាយជាទម្លាប់។"
  },
  te: {
    title: 'పోకర్ హ్యాండ్ ర్యాంకింగ్‌లు — Texas Hold’em లో హ్యాండ్‌ల క్రమం',
    desc: 'Texas Hold’em పోకర్‌లోని పది హ్యాండ్‌లు Royal Flush నుండి High Card వరకు క్రమంలో, ఉదాహరణలతో, ప్రతిదాని సంభావ్యతతో, సమాన హ్యాండ్‌లను ఎలా తేలుస్తారో వివరణతో.',
    ldHeadline: 'పోకర్ హ్యాండ్ ర్యాంకింగ్‌లు — Texas Hold’em',
    ldDesc: 'Texas Hold’em లోని పది హ్యాండ్‌లు క్రమంలో, ఉదాహరణలు, తరచుదనం మరియు టై-బ్రేక్ నియమాలతో.',
    h1: 'పోకర్ హ్యాండ్ ర్యాంకింగ్‌లు',
    lead: 'Texas Hold’em లో హ్యాండ్‌లు బలమైనది నుండి బలహీనమైనది వరకు కింది క్రమంలో ఉంటాయి. ఒక హ్యాండ్ ఎప్పుడూ సరిగ్గా ఐదు కార్డులతో ఉంటుంది, మీకు కనిపించే ఏడింటి నుండి ఎంచుకోబడుతుంది: మీ రెండు హోల్ కార్డులు మరియు ఐదు కమ్యూనిటీ కార్డులు. మీ సొంత కార్డులను వాడాలన్న నిబంధన లేదు — బోర్డు ఒక్కటే అత్యుత్తమ ఐదు కార్డులను ఇస్తే, అదే మీ హ్యాండ్ కూడా.',
    names: ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House', 'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'One Pair', 'High Card'],
    texts: [
      'A K Q J 10, అన్నీ ఒకే సూట్. సాధ్యమైన అత్యుత్తమ హ్యాండ్: దీన్ని ఓడించలేరు, సమం మాత్రమే చేయగలరు.',
      'వరుసగా ఐదు కార్డులు, అన్నీ ఒకే సూట్. రెండు Straight Flush ల మధ్య, అత్యధిక కార్డు గలది గెలుస్తుంది.',
      'ఒకే ర్యాంక్ గల నాలుగు కార్డులు. నాలుగూ బోర్డుపైనే ఉన్న అరుదైన సందర్భంలో ఐదవ కార్డు (కిక్కర్) తేలుస్తుంది.',
      'ఒకే ర్యాంక్ మూడు కార్డులతో పాటు ఒక జత. ముందుగా మూడు కార్డులను, తర్వాత జతను పోలుస్తారు.',
      'ఒకే సూట్‌లో ఐదు కార్డులు, వరుసలో ఉండనవసరం లేదు. అత్యధిక కార్డు నుండి ఒక్కొక్కటిగా పోలుస్తారు; ఏ సూట్ కూడా మరో సూట్ కంటే గొప్పది కాదు.',
      'వరుసగా ఐదు కార్డులు, వేర్వేరు సూట్‌లు. ఏస్ పైన (10-J-Q-K-A) లేదా కింద (A-2-3-4-5) ఆడుతుంది, రెండూ ఒకేసారి కాదు.',
      'ఒకే ర్యాంక్ గల మూడు కార్డులు, సంబంధం లేని మరో రెండు కార్డులతో.',
      'రెండు వేర్వేరు జతలు మరియు ఒక ఐదవ కార్డు. ముందు పెద్ద జతను, తర్వాత చిన్న జతను, ఆపై కిక్కర్‌ను పోలుస్తారు.',
      'ఒకే ర్యాంక్ గల రెండు కార్డులు మరియు సంబంధం లేని మూడు కార్డులు, క్రమంలో పోల్చబడతాయి.',
      'పై కలయికలలో ఏదీ లేదు. అత్యధిక కార్డు నిర్ణయిస్తుంది, తర్వాత దాని తర్వాతిది, అలా కొనసాగుతుంది.'
    ],
    dealt: 'ఏడు కార్డుల హ్యాండ్‌లలో %s లో వస్తుంది',
    tiesH2: 'సమాన హ్యాండ్‌లను ఎలా తేలుస్తారు',
    tiesP: 'ముందుగా వర్గాన్ని పోలుస్తారు: కార్డులు ఏవైనా సరే, ఏ Flush అయినా ఏ Straight నైనా ఓడిస్తుంది. వర్గం సమానమైతే, పై నుండి ర్యాంక్ వారీగా పోలుస్తారు. కలయిక తర్వాత మిగిలేదాన్ని <em>కిక్కర్</em> అంటారు, కొత్తవారు ఊహించే దాని కంటే చాలా ఎక్కువ పాట్‌లను ఇదే నిర్ణయిస్తుంది: A-9-4 బోర్డుపై A♠ K♦ మరియు A♣ 7♥ రెండూ ఏస్‌ల జతనే చేస్తాయి, కానీ కిక్కర్‌లో కింగ్ ఏడును ఓడిస్తుంది. Hold’em లో సూట్‌లు ఎప్పుడూ దేన్నీ తేల్చవు — అవే ఐదు ర్యాంక్‌లు గల ఇద్దరు ఆటగాళ్లు చివరి చిప్ వరకు పాట్‌ను పంచుకుంటారు.',
    wrongH2: 'జనం తరచుగా పొరపడే విషయాలు',
    wrong: [
      'Straight లో ఏస్ అత్యధిక కార్డు మరియు అత్యల్ప కార్డు రెండూ అవుతుంది: A-K-Q-J-10 అత్యుత్తమం, A-2-3-4-5 (<em>వీల్</em>) అత్యంత బలహీనం. వరుస చుట్టూ తిరగదు — Q-K-A-2-3 కు ఏ విలువా లేదు.',
      'Flush అంటే ఒకే సూట్‌లో ఐదు కార్డులు, నాలుగు కాదు. మీ చేతిలోనూ బోర్డుపైనా కలిపి నాలుగు హార్ట్‌లు ఉంటే వాటికవే ఏ విలువా లేదు.',
      'మీ చేతిలోని జతతో పాటు బోర్డు నుండి ఒక కార్డుతో ఏర్పడే Three of a Kind ను <em>సెట్</em> అంటారు; మీ చేతిలోని ఒక కార్డుతో పాటు బోర్డుపై ఉన్న జతతో ఏర్పడితే అవి <em>ట్రిప్స్</em>. ర్యాంక్ ఒకటే, బలం చాలా వేరు, ఎందుకంటే ట్రిప్స్ అందరికీ కనిపిస్తాయి.',
      'అత్యుత్తమ ఐదు కార్డులు మాత్రమే లెక్కలోకి వస్తాయి. మీ చేతిలో రెండు జతలు, బోర్డుపై మూడవ జత ఉంటే, మీకు ఉన్నవి రెండు జతలే, మూడు కాదు.',
      'పైన ఉన్న శాతాలు రివర్ నాటికి ఏడు కార్డులలో ప్రతి హ్యాండ్ ఎంత తరచుగా వస్తుందో చెబుతాయి, అది ఎంత తరచుగా గెలుస్తుందో కాదు. Two Pair సాధారణంగా అనిపించినా, అది ఎదుర్కొనే చాలా వాటి కంటే ముందే ఉంటుంది.'
    ],
    seeH2: 'టేబుల్ వద్ద దీన్ని చూడండి',
    seeP: 'PokerTH ఆట సమయంలో బోర్డు కింద మీ అత్యుత్తమ కలయిక పేరును చూపిస్తుంది, కాబట్టి సమయ ఒత్తిడిలో మీరే లెక్కించుకోవాల్సిన అవసరం ఉండదు, షోడౌన్‌లో చూపబడిన ప్రతి హ్యాండ్‌ను లెక్కలోకి వచ్చిన ఐదు కార్డులను హైలైట్ చేసి ప్రదర్శిస్తుంది. కంప్యూటర్ నియంత్రించే ప్రత్యర్థులతో ఆఫ్‌లైన్‌లో సాధన చేయడమే ఈ క్రమాన్ని అలవాటు చేసుకోవడానికి అత్యంత వేగవంతమైన మార్గం.'
  },
  ml: {
    title: 'പോക്കർ ഹാൻഡ് റാങ്കിംഗുകൾ — Texas Hold’em ലെ ഹാൻഡുകളുടെ ക്രമം',
    desc: 'Texas Hold’em പോക്കറിലെ പത്ത് ഹാൻഡുകൾ Royal Flush മുതൽ High Card വരെ ക്രമത്തിൽ, ഉദാഹരണങ്ങളോടെ, ഓരോന്നിന്റെയും സാധ്യതയോടെ, തുല്യ ഹാൻഡുകൾ എങ്ങനെ തീർപ്പാക്കുന്നുവെന്ന വിശദീകരണത്തോടെ.',
    ldHeadline: 'പോക്കർ ഹാൻഡ് റാങ്കിംഗുകൾ — Texas Hold’em',
    ldDesc: 'Texas Hold’em ലെ പത്ത് ഹാൻഡുകൾ ക്രമത്തിൽ, ഉദാഹരണങ്ങൾ, ആവൃത്തി, ടൈ-ബ്രേക്ക് നിയമങ്ങൾ എന്നിവയോടെ.',
    h1: 'പോക്കർ ഹാൻഡ് റാങ്കിംഗുകൾ',
    lead: 'Texas Hold’em ൽ ഹാൻഡുകൾ ഏറ്റവും ശക്തമായതിൽ നിന്ന് ഏറ്റവും ദുർബലമായതിലേക്ക് താഴെ പറയുന്ന ക്രമത്തിലാണ്. ഒരു ഹാൻഡ് എപ്പോഴും കൃത്യം അഞ്ച് കാർഡുകളാണ്, നിങ്ങൾ കാണുന്ന ഏഴിൽ നിന്ന് തിരഞ്ഞെടുക്കുന്നത്: നിങ്ങളുടെ രണ്ട് ഹോൾ കാർഡുകളും അഞ്ച് കമ്മ്യൂണിറ്റി കാർഡുകളും. സ്വന്തം കാർഡുകൾ ഉപയോഗിക്കണമെന്ന് നിർബന്ധമില്ല — ബോർഡ് മാത്രം ഏറ്റവും നല്ല അഞ്ച് കാർഡുകൾ നൽകിയാൽ, അതും നിങ്ങളുടെ ഹാൻഡ് തന്നെ.',
    names: ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House', 'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'One Pair', 'High Card'],
    texts: [
      'A K Q J 10, എല്ലാം ഒരേ സ്യൂട്ട്. സാധ്യമായ ഏറ്റവും നല്ല ഹാൻഡ്: ഇതിനെ തോൽപ്പിക്കാനാവില്ല, സമനിലയാക്കാനേ കഴിയൂ.',
      'തുടർച്ചയായ അഞ്ച് കാർഡുകൾ, എല്ലാം ഒരേ സ്യൂട്ട്. രണ്ട് Straight Flush കൾക്കിടയിൽ, ഏറ്റവും ഉയർന്ന കാർഡുള്ളത് ജയിക്കും.',
      'ഒരേ റാങ്കിലുള്ള നാല് കാർഡുകൾ. നാലും ബോർഡിലുള്ള അപൂർവ സന്ദർഭത്തിൽ അഞ്ചാമത്തെ കാർഡ് (കിക്കർ) തീർപ്പാക്കും.',
      'ഒരേ റാങ്കിലുള്ള മൂന്ന് കാർഡുകളും ഒരു ജോടിയും. ആദ്യം മൂന്ന് കാർഡുകളും, പിന്നെ ജോടിയും താരതമ്യം ചെയ്യുന്നു.',
      'ഒരേ സ്യൂട്ടിലുള്ള അഞ്ച് കാർഡുകൾ, തുടർച്ചയാകണമെന്നില്ല. ഏറ്റവും ഉയർന്നതിൽ നിന്ന് ഓരോന്നായി താരതമ്യം ചെയ്യുന്നു; ഒരു സ്യൂട്ടും മറ്റൊന്നിനേക്കാൾ വലുതല്ല.',
      'തുടർച്ചയായ അഞ്ച് കാർഡുകൾ, വ്യത്യസ്ത സ്യൂട്ടുകൾ. ഏസ് മുകളിലോ (10-J-Q-K-A) താഴെയോ (A-2-3-4-5) കളിക്കും, ഒരേസമയം രണ്ടും അല്ല.',
      'ഒരേ റാങ്കിലുള്ള മൂന്ന് കാർഡുകൾ, ബന്ധമില്ലാത്ത മറ്റ് രണ്ട് കാർഡുകളോടൊപ്പം.',
      'രണ്ട് വ്യത്യസ്ത ജോടികളും ഒരു അഞ്ചാം കാർഡും. ആദ്യം വലിയ ജോടി, പിന്നെ ചെറിയ ജോടി, പിന്നെ കിക്കർ താരതമ്യം ചെയ്യുന്നു.',
      'ഒരേ റാങ്കിലുള്ള രണ്ട് കാർഡുകളും ബന്ധമില്ലാത്ത മൂന്ന് കാർഡുകളും, ക്രമത്തിൽ താരതമ്യം ചെയ്യുന്നു.',
      'മുകളിലെ കോമ്പിനേഷനുകളൊന്നുമില്ല. ഏറ്റവും ഉയർന്ന കാർഡ് തീരുമാനിക്കും, പിന്നെ അടുത്തത്, അങ്ങനെ തുടരും.'
    ],
    dealt: 'ഏഴ്-കാർഡ് ഹാൻഡുകളിൽ %s ൽ വരുന്നു',
    tiesH2: 'തുല്യ ഹാൻഡുകൾ എങ്ങനെ തീർപ്പാക്കുന്നു',
    tiesP: 'ആദ്യം വിഭാഗം താരതമ്യം ചെയ്യുന്നു: കാർഡുകൾ ഏതായാലും, ഏത് Flush ഉം ഏത് Straight നെയും തോൽപ്പിക്കും. വിഭാഗം തുല്യമെങ്കിൽ, മുകളിൽ നിന്ന് റാങ്ക് തോറും താരതമ്യം ചെയ്യുന്നു. കോമ്പിനേഷന് ശേഷം ബാക്കിയാകുന്നതിനെ <em>കിക്കർ</em> എന്ന് വിളിക്കുന്നു, തുടക്കക്കാർ കരുതുന്നതിനേക്കാൾ വളരെ കൂടുതൽ പോട്ടുകൾ ഇതാണ് തീരുമാനിക്കുന്നത്: A-9-4 ബോർഡിൽ A♠ K♦ ഉം A♣ 7♥ ഉം ഏസുകളുടെ ജോടി തന്നെ ഉണ്ടാക്കുന്നു, പക്ഷേ കിക്കറിൽ കിംഗ് ഏഴിനെ തോൽപ്പിക്കും. Hold’em ൽ സ്യൂട്ടുകൾ ഒരിക്കലും ഒന്നും തീർപ്പാക്കില്ല — ഒരേ അഞ്ച് റാങ്കുകളുള്ള രണ്ട് കളിക്കാർ അവസാന ചിപ്പ് വരെ പോട്ട് പങ്കിടും.',
    wrongH2: 'ആളുകൾ പലപ്പോഴും തെറ്റിദ്ധരിക്കുന്നത്',
    wrong: [
      'Straight ൽ ഏസ് ഏറ്റവും ഉയർന്ന കാർഡും ഏറ്റവും താഴ്ന്ന കാർഡുമാണ്: A-K-Q-J-10 ഏറ്റവും നല്ലത്, A-2-3-4-5 (<em>വീൽ</em>) ഏറ്റവും ദുർബലം. ക്രമം ചുറ്റിവരില്ല — Q-K-A-2-3 ന് ഒരു വിലയുമില്ല.',
      'Flush എന്നാൽ ഒരേ സ്യൂട്ടിലുള്ള അഞ്ച് കാർഡുകളാണ്, നാലല്ല. നിങ്ങളുടെ കൈയിലും ബോർഡിലുമായി നാല് ഹാർട്ടുകൾക്ക് തനിയെ ഒരു വിലയുമില്ല.',
      'നിങ്ങളുടെ കൈയിലെ ജോടിയും ബോർഡിലെ ഒരു കാർഡും ചേർന്നുണ്ടാകുന്ന Three of a Kind നെ <em>സെറ്റ്</em> എന്ന് വിളിക്കുന്നു; നിങ്ങളുടെ കൈയിലെ ഒരു കാർഡും ബോർഡിലെ ജോടിയും ചേർന്നാൽ അത് <em>ട്രിപ്സ്</em>. റാങ്ക് ഒന്നുതന്നെ, ശക്തി വളരെ വ്യത്യസ്തം, കാരണം ട്രിപ്സ് എല്ലാവർക്കും കാണാം.',
      'ഏറ്റവും നല്ല അഞ്ച് കാർഡുകൾ മാത്രമേ കണക്കാക്കൂ. നിങ്ങളുടെ കൈയിൽ രണ്ട് ജോടികളും ബോർഡിൽ മൂന്നാമതൊരു ജോടിയും ഉണ്ടെങ്കിൽ, നിങ്ങൾക്കുള്ളത് രണ്ട് ജോടികളാണ്, മൂന്നല്ല.',
      'മുകളിലെ ശതമാനങ്ങൾ റിവറോടെ ഏഴ് കാർഡുകളിൽ ഓരോ ഹാൻഡും എത്ര തവണ വരുന്നുവെന്ന് പറയുന്നു, അത് എത്ര തവണ ജയിക്കുന്നുവെന്നല്ല. Two Pair സാധാരണമെന്ന് തോന്നിയാലും, അത് നേരിടുന്ന മിക്കതിനേക്കാളും മുന്നിലാണ്.'
    ],
    seeH2: 'ടേബിളിൽ ഇത് കാണുക',
    seeP: 'PokerTH കളിക്കിടയിൽ ബോർഡിന് താഴെ നിങ്ങളുടെ ഏറ്റവും നല്ല കോമ്പിനേഷന്റെ പേര് കാണിക്കുന്നു, അതിനാൽ സമയ സമ്മർദ്ദത്തിൽ നിങ്ങൾ തന്നെ കണക്കാക്കേണ്ടിവരില്ല, ഷോഡൗണിൽ കാണിച്ച ഓരോ ഹാൻഡും കണക്കിലെടുത്ത അഞ്ച് കാർഡുകൾ ഹൈലൈറ്റ് ചെയ്ത് പ്രദർശിപ്പിക്കുന്നു. കമ്പ്യൂട്ടർ നിയന്ത്രിക്കുന്ന എതിരാളികൾക്കെതിരെ ഓഫ്‌ലൈനിൽ പരിശീലിക്കുന്നതാണ് ഈ ക്രമം ശീലമാക്കാനുള്ള ഏറ്റവും വേഗമേറിയ വഴി.'
  },
  mr: {
    title: 'पोकर हँड क्रमवारी — Texas Hold’em मधील हँड्सचा क्रम',
    desc: 'Texas Hold’em पोकरमधील दहा हँड्स Royal Flush पासून High Card पर्यंत क्रमाने, उदाहरणांसह, प्रत्येकाच्या शक्यतेसह आणि समान हँड्स कसे सोडवले जातात याच्या स्पष्टीकरणासह.',
    ldHeadline: 'पोकर हँड क्रमवारी — Texas Hold’em',
    ldDesc: 'Texas Hold’em मधील दहा हँड्स क्रमाने, उदाहरणं, वारंवारता आणि टाय-ब्रेकच्या नियमांसह.',
    h1: 'पोकर हँड क्रमवारी',
    lead: 'Texas Hold’em मध्ये हँड्स सर्वात मजबूतपासून सर्वात कमकुवतपर्यंत खाली दिलेल्या क्रमाने असतात. हँड म्हणजे नेहमी नेमकी पाच कार्ड्स, जी तुम्हाला दिसणाऱ्या सात कार्ड्समधून निवडली जातात: तुमची दोन होल कार्ड्स आणि पाच कम्युनिटी कार्ड्स. तुमची स्वतःची कार्ड्स वापरलीच पाहिजेत असं नाही — फक्त बोर्डनेच सर्वोत्तम पाच कार्ड्स दिली, तर तोच तुमचा हँड.',
    names: ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House', 'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'One Pair', 'High Card'],
    texts: [
      'A K Q J 10, सगळी एकाच सूटची. शक्य असलेला सर्वोत्तम हँड: त्याला हरवता येत नाही, फक्त बरोबरी करता येते.',
      'सलग पाच कार्ड्स, सगळी एकाच सूटची. दोन Straight Flush मध्ये, ज्याचं सर्वात वरचं कार्ड मोठं तो जिंकतो.',
      'एकाच रँकची चार कार्ड्स. चारही बोर्डवर असण्याच्या दुर्मिळ प्रसंगी पाचवं कार्ड (किकर) निर्णय देतं.',
      'एकाच रँकची तीन कार्ड्स आणि एक जोडी. आधी तीन कार्ड्सची तुलना होते, मग जोडीची.',
      'एकाच सूटची पाच कार्ड्स, सलग असण्याची गरज नाही. सर्वात मोठ्यापासून एकेक करून तुलना होते; कोणतीही सूट दुसऱ्यापेक्षा मोठी नाही.',
      'सलग पाच कार्ड्स, वेगवेगळ्या सूट्सची. एक्का वर (10-J-Q-K-A) किंवा खाली (A-2-3-4-5) खेळतो, पण एकाच वेळी दोन्ही नाही.',
      'एकाच रँकची तीन कार्ड्स, असंबंधित इतर दोन कार्ड्ससह.',
      'दोन वेगवेगळ्या जोड्या आणि एक पाचवं कार्ड. आधी मोठी जोडी, मग लहान जोडी, मग किकर यांची तुलना होते.',
      'एकाच रँकची दोन कार्ड्स आणि असंबंधित तीन कार्ड्स, क्रमाने तुलना केली जाते.',
      'वरीलपैकी कोणतंही कॉम्बिनेशन नाही. सर्वात मोठं कार्ड निर्णय देतं, मग पुढचं, आणि असंच पुढे.'
    ],
    dealt: 'सात-कार्ड हँड्सपैकी %s मध्ये येतो',
    tiesH2: 'समान हँड्स कसे सोडवले जातात',
    tiesP: 'आधी प्रकाराची तुलना होते: कार्ड्स कोणतीही असली तरी, कोणताही Flush कोणत्याही Straight ला हरवतो. प्रकार समान असल्यास, वरपासून रँकनुसार तुलना होते. कॉम्बिनेशननंतर जे उरतं त्याला <em>किकर</em> म्हणतात, आणि नवशिक्यांना वाटतं त्यापेक्षा खूप जास्त पॉट्स तोच ठरवतो: A-9-4 बोर्डवर A♠ K♦ आणि A♣ 7♥ दोघंही एक्क्यांची जोडी बनवतात, पण किकरवर किंग सातला हरवतो. Hold’em मध्ये सूट्स कधीच काही ठरवत नाहीत — तीच पाच रँक्स असलेले दोन खेळाडू शेवटच्या चिपपर्यंत पॉट वाटून घेतात.',
    wrongH2: 'लोक अनेकदा काय चुकतात',
    wrong: [
      'Straight मध्ये एक्का सर्वात मोठं कार्ड आणि सर्वात लहान कार्ड दोन्ही असतो: A-K-Q-J-10 सर्वोत्तम, आणि A-2-3-4-5 (<em>व्हील</em>) सर्वात कमकुवत. क्रम गोल फिरत नाही — Q-K-A-2-3 ला काहीही किंमत नाही.',
      'Flush म्हणजे एकाच सूटची पाच कार्ड्स, चार नाही. तुमच्या हातात आणि बोर्डवर मिळून चार बदामांना स्वतःहून काहीही किंमत नाही.',
      'तुमच्या हातातली जोडी आणि बोर्डवरचं एक कार्ड मिळून बनणाऱ्या Three of a Kind ला <em>सेट</em> म्हणतात; तुमच्या हातातलं एक कार्ड आणि बोर्डवरची जोडी मिळून बनल्यास ते <em>ट्रिप्स</em>. रँक तीच, ताकद खूप वेगळी, कारण ट्रिप्स सगळ्यांना दिसतात.',
      'फक्त सर्वोत्तम पाच कार्ड्सच मोजली जातात. तुमच्या हातात दोन जोड्या असतील आणि बोर्डवर तिसरी जोडी असेल, तर तुमच्याकडे दोन जोड्या आहेत, तीन नाहीत.',
      'वरील टक्केवाऱ्या रिव्हरपर्यंत सात कार्ड्समध्ये प्रत्येक हँड किती वेळा येतो ते सांगतात, तो किती वेळा जिंकतो ते नाही. Two Pair सामान्य वाटला तरी, त्याला भेटणाऱ्या बहुतेक हँड्सच्या तो खूप पुढे असतो.'
    ],
    seeH2: 'हे टेबलवर बघा',
    seeP: 'PokerTH खेळताना बोर्डच्या खाली तुमच्या सर्वोत्तम कॉम्बिनेशनचं नाव दाखवतो, त्यामुळे वेळेच्या दबावाखाली तुम्हाला ते स्वतः काढावं लागत नाही, आणि शोडाउनला दाखवलेला प्रत्येक हँड मोजल्या गेलेल्या पाच कार्ड्सना हायलाइट करून दाखवला जातो. संगणक नियंत्रित प्रतिस्पर्ध्यांविरुद्ध ऑफलाइन सराव करणं हा हा क्रम अंगवळणी पाडण्याचा सर्वात जलद मार्ग आहे.'
  },
  kn: {
    title: 'ಪೋಕರ್ ಹ್ಯಾಂಡ್ ಶ್ರೇಯಾಂಕಗಳು — Texas Hold’em ನಲ್ಲಿ ಹ್ಯಾಂಡ್‌ಗಳ ಕ್ರಮ',
    desc: 'Texas Hold’em ಪೋಕರ್‌ನ ಹತ್ತು ಹ್ಯಾಂಡ್‌ಗಳು Royal Flush ನಿಂದ High Card ವರೆಗೆ ಕ್ರಮವಾಗಿ, ಉದಾಹರಣೆಗಳೊಂದಿಗೆ, ಪ್ರತಿಯೊಂದರ ಸಂಭವನೀಯತೆಯೊಂದಿಗೆ ಮತ್ತು ಸಮಾನ ಹ್ಯಾಂಡ್‌ಗಳನ್ನು ಹೇಗೆ ಬಗೆಹರಿಸಲಾಗುತ್ತದೆ ಎಂಬ ವಿವರಣೆಯೊಂದಿಗೆ.',
    ldHeadline: 'ಪೋಕರ್ ಹ್ಯಾಂಡ್ ಶ್ರೇಯಾಂಕಗಳು — Texas Hold’em',
    ldDesc: 'Texas Hold’em ನ ಹತ್ತು ಹ್ಯಾಂಡ್‌ಗಳು ಕ್ರಮವಾಗಿ, ಉದಾಹರಣೆಗಳು, ಆವರ್ತನಗಳು ಮತ್ತು ಟೈ-ಬ್ರೇಕ್ ನಿಯಮಗಳೊಂದಿಗೆ.',
    h1: 'ಪೋಕರ್ ಹ್ಯಾಂಡ್ ಶ್ರೇಯಾಂಕಗಳು',
    lead: 'Texas Hold’em ನಲ್ಲಿ ಹ್ಯಾಂಡ್‌ಗಳು ಅತಿ ಬಲಿಷ್ಠದಿಂದ ಅತಿ ದುರ್ಬಲದವರೆಗೆ ಕೆಳಗಿನ ಕ್ರಮದಲ್ಲಿವೆ. ಹ್ಯಾಂಡ್ ಎಂದರೆ ಯಾವಾಗಲೂ ನಿಖರವಾಗಿ ಐದು ಕಾರ್ಡ್‌ಗಳು, ನಿಮಗೆ ಕಾಣುವ ಏಳು ಕಾರ್ಡ್‌ಗಳಿಂದ ಆರಿಸಿದವು: ನಿಮ್ಮ ಎರಡು ಹೋಲ್ ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ಐದು ಕಮ್ಯೂನಿಟಿ ಕಾರ್ಡ್‌ಗಳು. ನಿಮ್ಮ ಸ್ವಂತ ಕಾರ್ಡ್‌ಗಳನ್ನು ಬಳಸಲೇಬೇಕೆಂದಿಲ್ಲ — ಬೋರ್ಡ್ ಒಂದೇ ಅತ್ಯುತ್ತಮ ಐದು ಕಾರ್ಡ್‌ಗಳನ್ನು ನೀಡಿದರೆ, ಅದೇ ನಿಮ್ಮ ಹ್ಯಾಂಡ್.',
    names: ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House', 'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'One Pair', 'High Card'],
    texts: [
      'A K Q J 10, ಎಲ್ಲವೂ ಒಂದೇ ಸೂಟ್. ಸಾಧ್ಯವಿರುವ ಅತ್ಯುತ್ತಮ ಹ್ಯಾಂಡ್: ಇದನ್ನು ಸೋಲಿಸಲು ಆಗುವುದಿಲ್ಲ, ಸಮ ಮಾಡಬಹುದಷ್ಟೇ.',
      'ಸತತ ಐದು ಕಾರ್ಡ್‌ಗಳು, ಎಲ್ಲವೂ ಒಂದೇ ಸೂಟ್. ಎರಡು Straight Flush ಗಳ ನಡುವೆ, ಮೇಲಿನ ಕಾರ್ಡ್ ದೊಡ್ಡದಿರುವುದು ಗೆಲ್ಲುತ್ತದೆ.',
      'ಒಂದೇ ರ‍್ಯಾಂಕ್‌ನ ನಾಲ್ಕು ಕಾರ್ಡ್‌ಗಳು. ನಾಲ್ಕೂ ಬೋರ್ಡ್ ಮೇಲಿರುವ ಅಪರೂಪದ ಸಂದರ್ಭದಲ್ಲಿ ಐದನೇ ಕಾರ್ಡ್ (ಕಿಕರ್) ನಿರ್ಧರಿಸುತ್ತದೆ.',
      'ಒಂದೇ ರ‍್ಯಾಂಕ್‌ನ ಮೂರು ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ಒಂದು ಜೋಡಿ. ಮೊದಲು ಮೂರು ಕಾರ್ಡ್‌ಗಳನ್ನು ಹೋಲಿಸಲಾಗುತ್ತದೆ, ನಂತರ ಜೋಡಿಯನ್ನು.',
      'ಒಂದೇ ಸೂಟ್‌ನ ಐದು ಕಾರ್ಡ್‌ಗಳು, ಕ್ರಮದಲ್ಲಿ ಇರಬೇಕೆಂದಿಲ್ಲ. ಅತಿ ದೊಡ್ಡದರಿಂದ ಒಂದೊಂದಾಗಿ ಹೋಲಿಸಲಾಗುತ್ತದೆ; ಯಾವ ಸೂಟ್ ಕೂಡ ಇನ್ನೊಂದಕ್ಕಿಂತ ದೊಡ್ಡದಲ್ಲ.',
      'ಸತತ ಐದು ಕಾರ್ಡ್‌ಗಳು, ಬೇರೆ ಬೇರೆ ಸೂಟ್‌ಗಳು. ಏಸ್ ಮೇಲೆ (10-J-Q-K-A) ಅಥವಾ ಕೆಳಗೆ (A-2-3-4-5) ಆಡುತ್ತದೆ, ಆದರೆ ಒಂದೇ ಬಾರಿಗೆ ಎರಡೂ ಅಲ್ಲ.',
      'ಒಂದೇ ರ‍್ಯಾಂಕ್‌ನ ಮೂರು ಕಾರ್ಡ್‌ಗಳು, ಸಂಬಂಧವಿಲ್ಲದ ಇನ್ನೆರಡು ಕಾರ್ಡ್‌ಗಳೊಂದಿಗೆ.',
      'ಎರಡು ಬೇರೆ ಬೇರೆ ಜೋಡಿಗಳು ಮತ್ತು ಒಂದು ಐದನೇ ಕಾರ್ಡ್. ಮೊದಲು ದೊಡ್ಡ ಜೋಡಿ, ನಂತರ ಚಿಕ್ಕ ಜೋಡಿ, ನಂತರ ಕಿಕರ್ ಅನ್ನು ಹೋಲಿಸಲಾಗುತ್ತದೆ.',
      'ಒಂದೇ ರ‍್ಯಾಂಕ್‌ನ ಎರಡು ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ಸಂಬಂಧವಿಲ್ಲದ ಮೂರು ಕಾರ್ಡ್‌ಗಳು, ಕ್ರಮವಾಗಿ ಹೋಲಿಸಲಾಗುತ್ತದೆ.',
      'ಮೇಲಿನ ಯಾವ ಸಂಯೋಜನೆಯೂ ಇಲ್ಲ. ಅತಿ ದೊಡ್ಡ ಕಾರ್ಡ್ ನಿರ್ಧರಿಸುತ್ತದೆ, ನಂತರ ಮುಂದಿನದು, ಹೀಗೆ.'
    ],
    dealt: 'ಏಳು-ಕಾರ್ಡ್ ಹ್ಯಾಂಡ್‌ಗಳಲ್ಲಿ %s ರಲ್ಲಿ ಬರುತ್ತದೆ',
    tiesH2: 'ಸಮಾನ ಹ್ಯಾಂಡ್‌ಗಳನ್ನು ಹೇಗೆ ಬಗೆಹರಿಸಲಾಗುತ್ತದೆ',
    tiesP: 'ಮೊದಲು ವರ್ಗವನ್ನು ಹೋಲಿಸಲಾಗುತ್ತದೆ: ಕಾರ್ಡ್‌ಗಳು ಯಾವುದೇ ಆಗಿರಲಿ, ಯಾವುದೇ Flush ಯಾವುದೇ Straight ಅನ್ನು ಸೋಲಿಸುತ್ತದೆ. ವರ್ಗ ಒಂದೇ ಆಗಿದ್ದರೆ, ಮೇಲಿನಿಂದ ರ‍್ಯಾಂಕ್‌ಗಳ ಪ್ರಕಾರ ಹೋಲಿಸಲಾಗುತ್ತದೆ. ಸಂಯೋಜನೆಯ ನಂತರ ಉಳಿಯುವುದನ್ನು <em>ಕಿಕರ್</em> ಎನ್ನುತ್ತಾರೆ, ಮತ್ತು ಹೊಸಬರು ಅಂದುಕೊಳ್ಳುವುದಕ್ಕಿಂತ ಎಷ್ಟೋ ಹೆಚ್ಚು ಪಾಟ್‌ಗಳನ್ನು ಅದೇ ನಿರ್ಧರಿಸುತ್ತದೆ: A-9-4 ಬೋರ್ಡ್‌ನಲ್ಲಿ A♠ K♦ ಮತ್ತು A♣ 7♥ ಎರಡೂ ಏಸ್‌ಗಳ ಜೋಡಿ ಮಾಡುತ್ತವೆ, ಆದರೆ ಕಿಕರ್‌ನಲ್ಲಿ ಕಿಂಗ್ ಏಳನ್ನು ಸೋಲಿಸುತ್ತದೆ. Hold’em ನಲ್ಲಿ ಸೂಟ್‌ಗಳು ಎಂದಿಗೂ ಏನನ್ನೂ ನಿರ್ಧರಿಸುವುದಿಲ್ಲ — ಅದೇ ಐದು ರ‍್ಯಾಂಕ್‌ಗಳಿರುವ ಇಬ್ಬರು ಆಟಗಾರರು ಕೊನೆಯ ಚಿಪ್‌ವರೆಗೆ ಪಾಟ್ ಹಂಚಿಕೊಳ್ಳುತ್ತಾರೆ.',
    wrongH2: 'ಜನರು ಆಗಾಗ ತಪ್ಪು ಮಾಡುವುದು',
    wrong: [
      'Straight ನಲ್ಲಿ ಏಸ್ ಅತಿ ದೊಡ್ಡ ಕಾರ್ಡ್ ಮತ್ತು ಅತಿ ಚಿಕ್ಕ ಕಾರ್ಡ್ ಎರಡೂ ಹೌದು: A-K-Q-J-10 ಅತ್ಯುತ್ತಮ, ಮತ್ತು A-2-3-4-5 (<em>ವೀಲ್</em>) ಅತಿ ದುರ್ಬಲ. ಕ್ರಮ ಸುತ್ತಿ ಬರುವುದಿಲ್ಲ — Q-K-A-2-3 ಗೆ ಯಾವ ಬೆಲೆಯೂ ಇಲ್ಲ.',
      'Flush ಎಂದರೆ ಒಂದೇ ಸೂಟ್‌ನ ಐದು ಕಾರ್ಡ್‌ಗಳು, ನಾಲ್ಕಲ್ಲ. ನಿಮ್ಮ ಕೈಯಲ್ಲಿ ಮತ್ತು ಬೋರ್ಡ್‌ನಲ್ಲಿ ಸೇರಿ ನಾಲ್ಕು ಹಾರ್ಟ್‌ಗಳಿಗೆ ತಾವಾಗಿಯೇ ಯಾವ ಬೆಲೆಯೂ ಇಲ್ಲ.',
      'ನಿಮ್ಮ ಕೈಯಲ್ಲಿರುವ ಜೋಡಿ ಮತ್ತು ಬೋರ್ಡ್‌ನ ಒಂದು ಕಾರ್ಡ್ ಸೇರಿ ಆಗುವ Three of a Kind ಅನ್ನು <em>ಸೆಟ್</em> ಎನ್ನುತ್ತಾರೆ; ನಿಮ್ಮ ಕೈಯ ಒಂದು ಕಾರ್ಡ್ ಮತ್ತು ಬೋರ್ಡ್‌ನ ಜೋಡಿ ಸೇರಿ ಆದರೆ ಅದು <em>ಟ್ರಿಪ್ಸ್</em>. ರ‍್ಯಾಂಕ್ ಒಂದೇ, ಬಲ ತುಂಬಾ ಬೇರೆ, ಏಕೆಂದರೆ ಟ್ರಿಪ್ಸ್ ಎಲ್ಲರಿಗೂ ಕಾಣುತ್ತದೆ.',
      'ಅತ್ಯುತ್ತಮ ಐದು ಕಾರ್ಡ್‌ಗಳನ್ನು ಮಾತ್ರ ಪರಿಗಣಿಸಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಕೈಯಲ್ಲಿ ಎರಡು ಜೋಡಿಗಳಿದ್ದು ಬೋರ್ಡ್‌ನಲ್ಲಿ ಮೂರನೇ ಜೋಡಿ ಇದ್ದರೆ, ನಿಮ್ಮ ಬಳಿ ಇರುವುದು ಎರಡು ಜೋಡಿಗಳು, ಮೂರಲ್ಲ.',
      'ಮೇಲಿನ ಶೇಕಡಾವಾರುಗಳು ರಿವರ್‌ವರೆಗಿನ ಏಳು ಕಾರ್ಡ್‌ಗಳಲ್ಲಿ ಪ್ರತಿ ಹ್ಯಾಂಡ್ ಎಷ್ಟು ಬಾರಿ ಬರುತ್ತದೆ ಎಂದು ಹೇಳುತ್ತವೆ, ಅದು ಎಷ್ಟು ಬಾರಿ ಗೆಲ್ಲುತ್ತದೆ ಎಂದಲ್ಲ. Two Pair ಸಾಮಾನ್ಯವೆನಿಸಿದರೂ, ಅದು ಎದುರಿಸುವ ಹೆಚ್ಚಿನ ಹ್ಯಾಂಡ್‌ಗಳಿಗಿಂತ ತುಂಬಾ ಮುಂದಿರುತ್ತದೆ.'
    ],
    seeH2: 'ಇದನ್ನು ಟೇಬಲ್‌ನಲ್ಲಿ ನೋಡಿ',
    seeP: 'PokerTH ನೀವು ಆಡುವಾಗ ಬೋರ್ಡ್ ಕೆಳಗೆ ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ಸಂಯೋಜನೆಯ ಹೆಸರನ್ನು ತೋರಿಸುತ್ತದೆ, ಆದ್ದರಿಂದ ಸಮಯದ ಒತ್ತಡದಲ್ಲಿ ನೀವೇ ಅದನ್ನು ಕಂಡುಹಿಡಿಯಬೇಕಿಲ್ಲ, ಮತ್ತು ಶೋಡೌನ್‌ನಲ್ಲಿ ತೋರಿಸುವ ಪ್ರತಿ ಹ್ಯಾಂಡ್ ಪರಿಗಣಿಸಲಾದ ಐದು ಕಾರ್ಡ್‌ಗಳನ್ನು ಹೈಲೈಟ್ ಮಾಡಿ ಕಾಣಿಸುತ್ತದೆ. ಕಂಪ್ಯೂಟರ್ ನಿಯಂತ್ರಿತ ಎದುರಾಳಿಗಳ ವಿರುದ್ಧ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಅಭ್ಯಾಸ ಮಾಡುವುದು ಈ ಕ್ರಮವನ್ನು ರೂಢಿಯಾಗಿಸಲು ಅತಿ ವೇಗದ ಮಾರ್ಗ.'
  },
  gu: {
    title: 'પોકર હેન્ડ રેન્કિંગ — Texas Hold’em માં હેન્ડ્સનો ક્રમ',
    desc: 'Texas Hold’em પોકરના દસ હેન્ડ્સ Royal Flush થી High Card સુધી ક્રમમાં, ઉદાહરણો સાથે, દરેકની સંભાવના સાથે અને સરખા હેન્ડ્સ કેવી રીતે ઉકેલાય છે તેની સમજૂતી સાથે.',
    ldHeadline: 'પોકર હેન્ડ રેન્કિંગ — Texas Hold’em',
    ldDesc: 'Texas Hold’em ના દસ હેન્ડ્સ ક્રમમાં, ઉદાહરણો, આવર્તન અને ટાઇ-બ્રેકના નિયમો સાથે.',
    h1: 'પોકર હેન્ડ રેન્કિંગ',
    lead: 'Texas Hold’em માં હેન્ડ્સ સૌથી મજબૂતથી સૌથી નબળા સુધી નીચેના ક્રમમાં છે. હેન્ડ એટલે હંમેશાં બરાબર પાંચ કાર્ડ્સ, જે તમને દેખાતાં સાત કાર્ડ્સમાંથી પસંદ થાય છે: તમારાં બે હોલ કાર્ડ્સ અને પાંચ કમ્યુનિટી કાર્ડ્સ. તમારાં પોતાનાં કાર્ડ્સ વાપરવાં જ પડે એવું નથી — બોર્ડ એકલું જ શ્રેષ્ઠ પાંચ કાર્ડ્સ આપે, તો તે જ તમારો હેન્ડ.',
    names: ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House', 'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'One Pair', 'High Card'],
    texts: [
      'A K Q J 10, બધાં એક જ સૂટનાં. શક્ય એવો શ્રેષ્ઠ હેન્ડ: તેને હરાવી શકાતો નથી, ફક્ત બરાબરી કરી શકાય છે.',
      'સળંગ પાંચ કાર્ડ્સ, બધાં એક જ સૂટનાં. બે Straight Flush વચ્ચે, જેનું સૌથી ઉપરનું કાર્ડ મોટું તે જીતે છે.',
      'એક જ રેન્કનાં ચાર કાર્ડ્સ. ચારેય બોર્ડ પર હોય તેવા દુર્લભ પ્રસંગે પાંચમું કાર્ડ (કિકર) નક્કી કરે છે.',
      'એક જ રેન્કનાં ત્રણ કાર્ડ્સ અને એક જોડી. પહેલાં ત્રણ કાર્ડ્સની સરખામણી થાય છે, પછી જોડીની.',
      'એક જ સૂટનાં પાંચ કાર્ડ્સ, ક્રમમાં હોવાં જરૂરી નથી. સૌથી મોટાથી એક એક કરીને સરખામણી થાય છે; કોઈ સૂટ બીજા કરતાં મોટો નથી.',
      'સળંગ પાંચ કાર્ડ્સ, જુદા જુદા સૂટનાં. એક્કો ઉપર (10-J-Q-K-A) કે નીચે (A-2-3-4-5) રમે છે, પણ એકસાથે બંને નહીં.',
      'એક જ રેન્કનાં ત્રણ કાર્ડ્સ, અસંબંધિત બીજાં બે કાર્ડ્સ સાથે.',
      'બે જુદી જુદી જોડી અને એક પાંચમું કાર્ડ. પહેલાં મોટી જોડી, પછી નાની જોડી, પછી કિકરની સરખામણી થાય છે.',
      'એક જ રેન્કનાં બે કાર્ડ્સ અને અસંબંધિત ત્રણ કાર્ડ્સ, ક્રમમાં સરખાવાય છે.',
      'ઉપરનું કોઈ કોમ્બિનેશન નથી. સૌથી મોટું કાર્ડ નક્કી કરે છે, પછી તેના પછીનું, અને એમ આગળ.'
    ],
    dealt: 'સાત-કાર્ડ હેન્ડ્સમાંથી %s માં આવે છે',
    tiesH2: 'સરખા હેન્ડ્સ કેવી રીતે ઉકેલાય છે',
    tiesP: 'પહેલાં પ્રકારની સરખામણી થાય છે: કાર્ડ્સ ગમે તે હોય, કોઈ પણ Flush કોઈ પણ Straight ને હરાવે છે. પ્રકાર સરખો હોય, તો ઉપરથી રેન્ક પ્રમાણે સરખામણી થાય છે. કોમ્બિનેશન પછી જે બાકી રહે તેને <em>કિકર</em> કહેવાય છે, અને શરૂઆત કરનારાઓ ધારે છે તેના કરતાં ઘણા વધારે પોટ્સ તે જ નક્કી કરે છે: A-9-4 બોર્ડ પર A♠ K♦ અને A♣ 7♥ બંને એક્કાની જોડી બનાવે છે, પણ કિકરમાં કિંગ સાતને હરાવે છે. Hold’em માં સૂટ્સ ક્યારેય કંઈ નક્કી કરતા નથી — એ જ પાંચ રેન્ક ધરાવતા બે ખેલાડીઓ છેલ્લી ચિપ સુધી પોટ વહેંચી લે છે.',
    wrongH2: 'લોકો ઘણી વાર શું ખોટું સમજે છે',
    wrong: [
      'Straight માં એક્કો સૌથી મોટું કાર્ડ અને સૌથી નાનું કાર્ડ બંને છે: A-K-Q-J-10 શ્રેષ્ઠ, અને A-2-3-4-5 (<em>વ્હીલ</em>) સૌથી નબળો. ક્રમ ગોળ ફરતો નથી — Q-K-A-2-3 ની કોઈ કિંમત નથી.',
      'Flush એટલે એક જ સૂટનાં પાંચ કાર્ડ્સ, ચાર નહીં. તમારા હાથમાં અને બોર્ડ પર મળીને ચાર લાલનાં કાર્ડ્સની પોતાની રીતે કોઈ કિંમત નથી.',
      'તમારા હાથની જોડી અને બોર્ડના એક કાર્ડથી બનતા Three of a Kind ને <em>સેટ</em> કહેવાય છે; તમારા હાથના એક કાર્ડ અને બોર્ડની જોડીથી બને તો તે <em>ટ્રિપ્સ</em>. રેન્ક એ જ, તાકાત ઘણી જુદી, કારણ કે ટ્રિપ્સ બધાને દેખાય છે.',
      'ફક્ત શ્રેષ્ઠ પાંચ કાર્ડ્સ જ ગણાય છે. તમારા હાથમાં બે જોડી હોય અને બોર્ડ પર ત્રીજી જોડી હોય, તો તમારી પાસે બે જોડી છે, ત્રણ નહીં.',
      'ઉપરની ટકાવારીઓ રિવર સુધીનાં સાત કાર્ડ્સમાં દરેક હેન્ડ કેટલી વાર આવે છે તે કહે છે, તે કેટલી વાર જીતે છે તે નહીં. Two Pair સામાન્ય લાગે તોય, તે સામે આવતા મોટા ભાગના હેન્ડ્સથી ઘણો આગળ હોય છે.'
    ],
    seeH2: 'આ ટેબલ પર જુઓ',
    seeP: 'PokerTH તમે રમો ત્યારે બોર્ડની નીચે તમારા શ્રેષ્ઠ કોમ્બિનેશનનું નામ બતાવે છે, તેથી સમયના દબાણ હેઠળ તમારે તે જાતે શોધવું પડતું નથી, અને શોડાઉનમાં બતાવાતો દરેક હેન્ડ ગણાયેલાં પાંચ કાર્ડ્સ હાઇલાઇટ કરીને દેખાય છે. કમ્પ્યુટર નિયંત્રિત પ્રતિસ્પર્ધીઓ સામે ઓફલાઇન પ્રેક્ટિસ કરવી એ આ ક્રમને આદત બનાવવાની સૌથી ઝડપી રીત છે.'
  },
  is: {
    title: 'Röðun pókerhanda — röð handa í Texas Hold’em',
    desc: 'Pókerhendurnar tíu í Texas Hold’em í röð, frá konunglegri litaröð niður í hátt spil, með dæmum, líkum á hverri hönd og skýringu á því hvernig skorið er úr um jafnar hendur.',
    ldHeadline: 'Röðun pókerhanda — Texas Hold’em',
    ldDesc: 'Hendurnar tíu í Texas Hold’em í röð, með dæmum, tíðni og reglum um jafnar hendur.',
    h1: 'Röðun pókerhanda',
    lead: 'Í Texas Hold’em raðast hendurnar eins og hér að neðan, frá þeirri sterkustu til þeirrar veikustu. Hönd er alltaf nákvæmlega fimm spil, valin úr þeim sjö sem þú sérð: holuspilunum þínum tveimur og sameiginlegu spilunum fimm. Þú þarft ekki að nota þín eigin spil — ef borðið eitt gefur bestu fimm spilin, þá er það höndin þín.',
    names: ['Konungleg litaröð', 'Litaröð', 'Ferna', 'Fullt hús', 'Litur', 'Röð', 'Þrenna', 'Tvö pör', 'Par', 'Hátt spil'],
    texts: [
      'A K Q J 10, öll í sömu sort. Besta mögulega höndin: hana er ekki hægt að slá, aðeins jafna.',
      'Fimm spil í röð, öll í sömu sort. Milli tveggja litaraða vinnur sú sem hefur hærra efsta spil.',
      'Fjögur spil með sama gildi. Fimmta spilið (kicker) sker úr í því sjaldgæfa tilviki að öll fjögur séu á borðinu.',
      'Þrjú spil með sama gildi auk pars. Þrennan er borin saman fyrst, svo parið.',
      'Fimm spil í sömu sort, ekki í röð. Borin saman spil fyrir spil frá því hæsta; engin sort er æðri annarri.',
      'Fimm spil í röð, í ólíkum sortum. Ásinn spilar hátt (10-J-Q-K-A) eða lágt (A-2-3-4-5), en ekki hvort tveggja í einu.',
      'Þrjú spil með sama gildi, ásamt tveimur öðrum óskyldum spilum.',
      'Tvö ólík pör og fimmta spil. Hærra parið er borið saman fyrst, svo það lægra, svo kickerinn.',
      'Tvö spil með sama gildi og þrjú óskyld spil, borin saman í röð.',
      'Ekkert af ofantöldu. Hæsta spilið ræður, svo það næsta, og svo framvegis.'
    ],
    dealt: 'kemur upp í %s af sjö spila höndum',
    tiesH2: 'Hvernig skorið er úr um jafnar hendur',
    tiesP: 'Flokkurinn er borinn saman fyrst: hvaða litur sem er slær hvaða röð sem er, sama hvaða spil eru í þeim. Innan sama flokks eru gildin borin saman ofan frá. Það sem eftir stendur þegar samsetningin er mynduð kallast <em>kicker</em>, og hann ræður mun fleiri pottum en byrjendur búast við: á borðinu A-9-4 mynda bæði A♠ K♦ og A♣ 7♥ ásapar, en kóngurinn slær sjöuna sem kicker. Sortir ráða aldrei neinu í Hold’em — tveir leikmenn með sömu fimm gildin skipta pottinum, niður í síðasta spilapening.',
    wrongH2: 'Það sem fólk ruglast oft á',
    wrong: [
      'Ásinn er bæði hæsta og lægsta spilið í röð: A-K-Q-J-10 er sú besta og A-2-3-4-5 (<em>hjólið</em>) sú veikasta. Röð fer ekki hringinn — Q-K-A-2-3 er ekkert.',
      'Litur þarf fimm spil í sömu sort, ekki fjögur. Fjögur hjörtu samtals á hendi og á borði eru einskis virði ein og sér.',
      'Þrenna sem mynduð er úr pari á hendi og einu spili á borðinu kallast <em>sett</em>; mynduð úr einu spili á hendi og pari á borðinu kallast hún <em>trips</em>. Sama sæti í röðuninni, mjög ólíkur styrkur, því allir sjá trips.',
      'Aðeins bestu fimm spilin telja. Ef þú ert með tvö pör á hendi og borðið sýnir þriðja parið ertu með tvö pör, ekki þrjú.',
      'Prósenturnar hér að ofan segja hve oft hver hönd kemur upp í sjö spilum fram að river, ekki hve oft hún vinnur. Tvö pör virðast algeng en eru samt langt á undan flestu sem þau mæta.'
    ],
    seeH2: 'Sjáðu þetta við borðið',
    seeP: 'PokerTH nefnir bestu samsetninguna þína fyrir neðan borðið meðan þú spilar, svo þú þarft aldrei að finna út úr henni undir tímapressu, og hver hönd sem sýnd er í uppgjöri birtist með spilunum fimm sem telja auðkenndum. Að æfa sig ótengt gegn tölvustýrðum andstæðingum er fljótlegasta leiðin til að gera röðunina að öðru eðli.'
  },

   sw: {

    title: "Mpangilio wa mikono ya poka — daraja la mikono katika Texas Hold’em",
    desc: "Mikono yote kumi ya poka ya Texas Hold’em kuanzia royal flush hadi karata ya juu, ikiwa na mifano, uwezekano wa kila mmoja, na jinsi kicker na sare zinavyoamuliwa.",
    ldHeadline: "Mpangilio wa mikono ya poka — Texas Hold’em",
    ldDesc: "Mikono kumi ya Texas Hold’em kwa mpangilio, ikiwa na mifano, mara ngapi hutokea, na kanuni za sare.",
    h1: "Mpangilio wa mikono ya poka",
    lead: "Katika Texas Hold’em mikono hupangwa kutoka yenye nguvu zaidi hadi dhaifu zaidi hivi. Mkono daima ni karata tano hasa, zilizochaguliwa kutoka saba unazoziona: karata zako mbili zilizofichwa na karata tano za pamoja. Huna lazima ya kutumia karata zako mwenyewe — kama meza pekee inaunda tano bora, huo pia ni mkono wako.",
    names: ["Royal Flush", "Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind", "Two Pair", "One Pair", "High Card"],
    texts: [
      "A K Q J 10, zote za rangi moja. Mkono bora zaidi unaowezekana: hauwezi kushindwa, waweza tu kusawazishwa.",
      "Karata tano mfululizo za rangi moja. Kati ya straight flush mbili, inayoshinda ni ile yenye karata ya juu kubwa zaidi.",
      "Karata nne za thamani moja. Karata ya tano (kicker) huamua sare adimu pale zote nne zikiwa mezani.",
      "Tatu zinazofanana pamoja na jozi. Kwanza hulinganishwa zile tatu, kisha jozi.",
      "Karata tano za rangi moja, bila kufuatana. Hulinganishwa moja baada ya nyingine kuanzia ya juu; hakuna rangi iliyo juu ya nyingine.",
      "Karata tano mfululizo za rangi mchanganyiko. Ace hucheza juu (10-J-Q-K-A) au chini (A-2-3-4-5), kamwe si pande zote mbili kwa wakati mmoja.",
      "Karata tatu za thamani moja, pamoja na karata mbili zisizohusiana.",
      "Jozi mbili tofauti pamoja na karata ya tano. Kwanza hulinganishwa jozi kubwa, kisha ndogo, kisha kicker.",
      "Karata mbili za thamani moja pamoja na karata tatu zisizohusiana, zinazolinganishwa kwa mpangilio.",
      "Hakuna kati ya hizo hapo juu. Karata ya juu zaidi huamua, kisha inayofuata, na kadhalika."
    ],
    dealt: "hutokea katika %s ya mikono ya karata saba",
    tiesH2: "Jinsi sare zinavyoamuliwa",
    tiesP: "Kwanza linganisha aina: flush yoyote hushinda straight yoyote, karata ziwe zipi. Ndani ya aina moja, hulinganishwa thamani baada ya thamani kuanzia juu. Kinachobaki baada ya mkono kuundwa huitwa <em>kicker</em>, nayo huamua mikono mingi zaidi kuliko wanaoanza wanavyodhani: kwenye meza ya A-9-4, A♠ K♦ na A♣ 7♥ zote zinaunda jozi ya ace, lakini king inashinda saba. Katika Hold’em rangi hazivunji sare kamwe — wachezaji wawili wenye thamani zilezile tano hugawana pot hadi chipu ya mwisho.",
    wrongH2: "Yale yanayoeleweka vibaya mara nyingi",
    wrong: [
      "Ace ni karata ya juu na ya chini kabisa ya straight kwa wakati mmoja: A-K-Q-J-10 ndiyo bora, A-2-3-4-5 (inayoitwa <em>wheel</em>) ndiyo dhaifu zaidi. Mfululizo haurudi mzunguko — Q-K-A-2-3 si kitu hata kidogo.",
      "Flush ni karata tano za rangi moja, si nne. Hearts nne kati ya mkono wako na meza hazina thamani yoyote peke yake.",
      "Tatu zinazofanana zilizoundwa na jozi mkononi mwako pamoja na karata moja mezani huitwa <em>set</em>; zilizoundwa na karata moja mkononi pamoja na jozi mezani huitwa <em>trips</em>. Daraja moja, nguvu tofauti sana, kwa sababu trips kila mtu anaiona.",
      "Karata tano bora pekee ndizo huhesabiwa. Kuwa na jozi mbili na jozi ya tatu mezani bado ni jozi mbili, si tatu.",
      "Asilimia zilizo hapo juu zinaonyesha ni mara ngapi kila mkono huundwa hadi river kutoka karata saba, si mara ngapi hushinda. Jozi mbili zinaonekana za kawaida na bado ziko mbele ya mengi zinayokutana nayo."
    ],
    seeH2: "Kuiona mezani",
    seeP: "Wakati unacheza, PokerTH huandika chini ya meza jina la mkono wako bora kwa wakati huo, hivyo huhitaji kamwe kuuunda kichwani huku saa ikienda, na wakati wa showdown huonyesha kila mkono uliofunuliwa ukiangazia karata tano zilizohesabiwa kweli. Kufanya mazoezi nje ya mtandao dhidi ya wapinzani wa kompyuta ndiyo njia ya haraka zaidi ya kuweka mpangilio huu vidoleni."
  },

  uz: {
    title: "Poker kombinatsiyalari reytingi — Texas Hold’em’da qoʻllar tartibi",
    desc: "Texas Hold’em’ning oʻnta poker kombinatsiyasi royal-fleshdan katta kartagacha tartib bilan: misollar, har birining chiqish ehtimoli hamda kiker va teng qoʻllar qanday hal qilinishi.",
    ldHeadline: "Poker kombinatsiyalari reytingi — Texas Hold’em",
    ldDesc: "Texas Hold’em’ning oʻnta kombinatsiyasi tartib bilan: misollar, uchrash chastotasi va teng qoʻllar qoidalari.",
    h1: "Poker kombinatsiyalari reytingi",
    lead: "Texas Hold’em’da qoʻllar eng kuchlisidan eng kuchsizigacha quyidagi tartibda joylashadi. Har bir qoʻl — siz koʻra oladigan yettita kartadan tanlangan roppa-rosa beshta karta: ikkita choʻntak kartangiz va beshta umumiy karta. Oʻz kartalaringizdan foydalanishga majbur emassiz — agar stolning oʻzi eng yaxshi beshlikni bersa, bu sizning ham qoʻlingiz.",
    names: ["Royal-flesh", "Strit-flesh", "Kare", "Full-xaus", "Flesh", "Strit", "Uchlik", "Ikki juftlik", "Juftlik", "Katta karta"],
    texts: [
      "A K Q J 10, hammasi bir mastda. Eng yaxshi qoʻl: uni yengib boʻlmaydi, faqat tenglashish mumkin.",
      "Ketma-ket beshta karta, hammasi bir mastda. Ikki strit-flesh orasida yuqori kartasi kattarogʻi yutadi.",
      "Bir xil darajadagi toʻrtta karta. Beshinchi karta (kiker) stolda ikkita bir xil kare chiqqan kamyob holatda tenglikni hal qiladi.",
      "Uchlik va juftlik. Avval uchlik, soʻng juftlik solishtiriladi.",
      "Bir mastdagi, ketma-ket boʻlmagan beshta karta. Eng kattasidan boshlab kartama-karta solishtiriladi; hech bir mast boshqasidan ustun emas.",
      "Turli mastdagi ketma-ket beshta karta. Tuz yuqori (10-J-Q-K-A) yoki past (A-2-3-4-5) oʻynaydi, lekin ikkalasi birdan emas.",
      "Bir xil darajadagi uchta karta va bir-biriga bogʻliq boʻlmagan yana ikkita karta.",
      "Ikki xil juftlik va beshinchi karta. Avval katta juftlik, soʻng kichigi, keyin kiker solishtiriladi.",
      "Bir xil darajadagi ikkita karta va tartib bilan solishtiriladigan uchta bogʻliq boʻlmagan karta.",
      "Yuqoridagilarning hech biri emas. Eng katta karta hal qiladi, soʻng keyingisi va hokazo."
    ],
    dealt: "yetti kartali qoʻllarning %s ida uchraydi",
    tiesH2: "Teng qoʻllar qanday hal qilinadi",
    tiesP: "Avval toifa solishtiriladi: kartalari qanday boʻlishidan qatʼi nazar, har qanday flesh har qanday stritni yengadi. Bir toifa ichida darajalar yuqoridan boshlab birma-bir solishtiriladi. Kombinatsiyadan ortib qolgan karta <em>kiker</em> deb ataladi va u yangi boshlovchilar kutganidan koʻproq qoʻllarni hal qiladi: A-9-4 stolida A♠ K♦ ham, A♣ 7♥ ham tuzlar juftligini tuzadi, lekin qirol yettilikdan ustun keladi. Hold’em’da mastlar hech qachon tenglikni hal qilmaydi — bir xil beshta darajaga ega ikki oʻyinchi bankni oxirgi fishkagacha boʻlib oladi.",
    wrongH2: "Koʻpchilik adashadigan jihatlar",
    wrong: [
      "Tuz strit uchun ham eng katta, ham eng kichik karta: A-K-Q-J-10 — eng yaxshisi, A-2-3-4-5 (<em>wheel</em>) — eng kuchsizi. Strit aylanib oʻtmaydi — Q-K-A-2-3 hech narsa emas.",
      "Flesh — bir mastdagi toʻrtta emas, beshta karta. Qoʻlingiz va stoldagi jami toʻrtta tappon oʻz-oʻzidan hech narsaga arzimaydi.",
      "Qoʻlingizdagi juftlik va stoldagi bitta kartadan tuzilgan uchlik <em>set</em> deyiladi; qoʻlingizdagi bitta karta va stoldagi juftlikdan tuzilgani esa <em>trips</em>. Reytingda oʻrni bir xil, kuchi esa juda farq qiladi, chunki tripsni hamma koʻradi.",
      "Faqat eng yaxshi beshta karta hisobga olinadi. Qoʻlingizda ikki juftlik boʻlib, stolda uchinchi juftlik chiqsa, sizda uchta emas, ikki juftlik boʻladi.",
      "Yuqoridagi foizlar har bir qoʻl rivergacha yetti kartada qanchalik tez-tez chiqishini bildiradi, qanchalik tez-tez yutishini emas. Ikki juftlik keng tarqalgandek koʻrinadi, shunga qaramay u duch keladigan qoʻllarning aksariyatidan oldinda."
    ],
    seeH2: "Buni stolda koʻring",
    seeP: "PokerTH oʻyin davomida joriy eng yaxshi qoʻlingizni stol ostida nomlab turadi, shuning uchun uni vaqt bosimi ostida oʻzingiz hisoblashingizga hojat yoʻq, shoudaunda esa har bir ochilgan qoʻlni hisobga olingan beshta kartani ajratib koʻrsatgan holda namoyish etadi. Kompyuter raqiblariga qarshi oflayn mashq qilish — reytingni yod olishning eng tez yoʻli."
  },
  my: {
    title: "ပိုကာ ဖဲလက် အဆင့်များ — Texas Hold’em ဖဲလက်များ၏ အစဉ်",
    desc: "Texas Hold’em ပိုကာ ဖဲလက် ဆယ်မျိုးလုံးကို Royal Flush မှ High Card အထိ အစဉ်လိုက်၊ ဥပမာများ၊ တစ်ခုစီ ရနိုင်ခြေ၊ kicker နှင့် သရေကျမှုများကို ဖြေရှင်းပုံတို့နှင့်အတူ။",
    ldHeadline: "ပိုကာ ဖဲလက် အဆင့်များ — Texas Hold’em",
    ldDesc: "Texas Hold’em ဖဲလက် ဆယ်မျိုးကို အစဉ်လိုက်၊ ဥပမာများ၊ ဖြစ်ပေါ်နှုန်းနှင့် သရေဖြေရှင်းရေး စည်းမျဉ်းများနှင့်အတူ။",
    h1: "ပိုကာ ဖဲလက် အဆင့်များ",
    lead: "Texas Hold’em ဖဲလက်များကို အားအကောင်းဆုံးမှ အားအနည်းဆုံးသို့ အောက်ပါအတိုင်း အဆင့်သတ်မှတ်သည်။ ဖဲလက်တိုင်းသည် သင်မြင်နိုင်သော ခုနစ်ချပ်မှ ရွေးထားသည့် ဖဲငါးချပ် အတိအကျဖြစ်သည်: သင့် hole cards နှစ်ချပ်နှင့် အများသုံးဖဲ ငါးချပ်။ သင့်ကိုယ်ပိုင်ဖဲများကို သုံးရန် ဘယ်တော့မှ မလိုအပ်ပါ — စားပွဲပေါ်ရှိ ဖဲများကိုယ်တိုင်က အကောင်းဆုံးငါးချပ် ဖြစ်နေလျှင် ၎င်းသည် သင့်ဖဲလက်လည်း ဖြစ်သည်။",
    names: ["Royal Flush", "Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind", "Two Pair", "One Pair", "High Card"],
    texts: [
      "A K Q J 10၊ အားလုံး အပွင့်တူ။ ဖြစ်နိုင်သမျှ အကောင်းဆုံးဖဲလက်; အနိုင်ယူ၍မရ၊ သရေသာ ကျနိုင်သည်။",
      "အစဉ်လိုက် ဖဲငါးချပ်၊ အားလုံး အပွင့်တူ။ straight flush နှစ်ခုကြားတွင် အပေါ်ဆုံးဖဲ ပိုမြင့်သူက နိုင်သည်။",
      "အဆင့်တူ ဖဲလေးချပ်။ စားပွဲပေါ်တွင် တူညီသော လေးချပ်တွဲ နှစ်ခု ဖြစ်သည့် ရှားပါးသော သရေတွင် ပဉ္စမဖဲ (kicker) က ဆုံးဖြတ်သည်။",
      "three of a kind နှင့် pair တစ်တွဲ။ သုံးချပ်တွဲကို ဦးစွာ နှိုင်းယှဉ်ပြီးနောက် pair ကို နှိုင်းယှဉ်သည်။",
      "အစဉ်လိုက်မဟုတ်သော အပွင့်တူ ဖဲငါးချပ်။ အပေါ်ဆုံးမှစ၍ တစ်ချပ်ချင်း နှိုင်းယှဉ်သည်; မည်သည့်အပွင့်မျှ အခြားအပွင့်ထက် မသာပါ။",
      "အပွင့်ရောနှော အစဉ်လိုက် ဖဲငါးချပ်။ Ace သည် အမြင့် (10-J-Q-K-A) သို့မဟုတ် အနိမ့် (A-2-3-4-5) ကစားနိုင်သော်လည်း နှစ်မျိုးလုံး တစ်ပြိုင်တည်း မရပါ။",
      "အဆင့်တူ ဖဲသုံးချပ်နှင့် မဆက်စပ်သော ဖဲနှစ်ချပ်။",
      "မတူညီသော အတွဲနှစ်တွဲနှင့် ပဉ္စမဖဲ။ အတွဲကြီးကို ဦးစွာ၊ ထို့နောက် အတွဲငယ်၊ ထို့နောက် kicker ကို နှိုင်းယှဉ်သည်။",
      "အဆင့်တူ ဖဲနှစ်ချပ်နှင့် အစဉ်လိုက် နှိုင်းယှဉ်ရသော မဆက်စပ်သည့် ဖဲသုံးချပ်။",
      "အထက်ပါတို့မှ တစ်ခုမျှ မဟုတ်။ အမြင့်ဆုံးဖဲက ဆုံးဖြတ်သည်၊ ထို့နောက် နောက်တစ်ချပ်၊ စသည်ဖြင့်။"
    ],
    dealt: "ဖဲခုနစ်ချပ်လက်များ၏ %s တွင် ဖြစ်ပေါ်သည်",
    tiesH2: "သရေကျမှုများကို ဖြေရှင်းပုံ",
    tiesP: "အမျိုးအစားကို ဦးစွာ နှိုင်းယှဉ်ပါ: ဖဲများ မည်သို့ပင်ရှိစေ မည်သည့် flush မဆို မည်သည့် straight ကိုမဆို နိုင်သည်။ အမျိုးအစားတူအတွင်း အပေါ်ဆုံးမှစ၍ အဆင့်တစ်ခုချင်း နှိုင်းယှဉ်ပါ။ ပေါင်းစပ်မှုအပြီး ကျန်ရှိသောဖဲကို <em>kicker</em> ဟုခေါ်ပြီး ၎င်းသည် အစပြုသူများ မျှော်လင့်သည်ထက် ပိုများသော ဖဲလက်များကို ဆုံးဖြတ်ပေးသည်: A-9-4 စားပွဲတွင် A♠ K♦ နှင့် A♣ 7♥ နှစ်ခုစလုံး Ace တစ်တွဲ ဖြစ်သော်လည်း King က 7 ကို kicker ဖြင့် နိုင်သည်။ Hold’em တွင် အပွင့်များက သရေကို ဘယ်တော့မှ မဖြေရှင်းပါ — အဆင့်ငါးခု တူညီသော ကစားသမားနှစ်ဦးသည် နောက်ဆုံးချစ်ပ်အထိ ပေါ့တ်ကို ခွဲဝေယူသည်။",
    wrongH2: "လူအများ မှားတတ်သော အချက်များ",
    wrong: [
      "Ace သည် straight အတွက် အမြင့်ဆုံးဖဲရော အနိမ့်ဆုံးဖဲပါ ဖြစ်သည်: A-K-Q-J-10 သည် အကောင်းဆုံး၊ A-2-3-4-5 (<em>wheel</em>) သည် အဆိုးဆုံး။ ၎င်းသည် ပတ်၍မရပါ — Q-K-A-2-3 သည် ဘာမျှ မဟုတ်ပါ။",
      "flush သည် အပွင့်တစ်မျိုးတည်း ဖဲလေးချပ်မဟုတ်ဘဲ ငါးချပ်ဖြစ်သည်။ သင့်လက်ထဲနှင့် စားပွဲပေါ်တွင် heart လေးချပ်ရှိရုံဖြင့် ဘာမျှ မတန်ပါ။",
      "သင့်လက်ထဲရှိ pair နှင့် စားပွဲပေါ်ရှိ တစ်ချပ်ဖြင့် ဖြစ်သော three of a kind ကို <em>set</em> ဟုခေါ်သည်; သင့်လက်ထဲရှိ တစ်ချပ်နှင့် စားပွဲပေါ်ရှိ pair ဖြင့် ဖြစ်လျှင် <em>trips</em> ဖြစ်သည်။ အဆင့်တူသော်လည်း trips ကို လူတိုင်းမြင်ရသဖြင့် အားကောင်းမှု အလွန်ကွာသည်။",
      "အကောင်းဆုံး ငါးချပ်ကိုသာ ထည့်တွက်သည်။ two pair ကိုင်ထားပြီး စားပွဲပေါ်တွင် တတိယ pair ပေါ်လျှင် သင့်တွင် သုံးတွဲမဟုတ်ဘဲ two pair သာ ရှိသည်။",
      "အထက်ပါ ရာခိုင်နှုန်းများသည် ဖဲလက်တစ်ခုစီ river အထိ ဖဲခုနစ်ချပ်တွင် မည်မျှမကြာခဏ ပေါ်သည်ကို ပြခြင်းဖြစ်ပြီး မည်မျှမကြာခဏ နိုင်သည်ကို မဟုတ်ပါ။ two pair သည် သာမန်ဟု ထင်ရသော်လည်း ၎င်းတွေ့ရသည့် ဖဲလက်အများစုထက် ရှေ့ရောက်နေဆဲဖြစ်သည်။"
    ],
    seeH2: "စားပွဲတွင် ကြည့်ပါ",
    seeP: "PokerTH သည် သင်ကစားနေစဉ် သင့်လက်ရှိ အကောင်းဆုံးဖဲလက်ကို စားပွဲဖဲများအောက်တွင် အမည်ဖော်ပြပေးသဖြင့် အချိန်ဖိအားအောက်တွင် ကိုယ်တိုင် တွက်ရန် မလိုပါ၊ ရှိုးဒေါင်းတွင် လှန်ပြသော ဖဲလက်တိုင်းကို ထည့်တွက်သည့် ဖဲငါးချပ်ကို မီးမောင်းထိုးလျက် ပြသည်။ ကွန်ပျူတာပြိုင်ဘက်များနှင့် အော့ဖ်လိုင်း လေ့ကျင့်ခြင်းသည် အဆင့်များကို အလွတ်ရရန် အမြန်ဆုံးနည်းဖြစ်သည်။"
  },
  ka: {
    title: "პოკერის კომბინაციები — Texas Hold’em ხელების რეიტინგი",
    desc: "Texas Hold’em-ის ათივე პოკერის კომბინაცია როიალ ფლეშიდან მაღალ კარტამდე, მაგალითებით, თითოეულის ალბათობით და ფრეს გადაწყვეტის წესებით.",
    ldHeadline: "პოკერის კომბინაციები — Texas Hold’em",
    ldDesc: "Texas Hold’em-ის ათი კომბინაცია თანმიმდევრობით, მაგალითებით, სიხშირითა და ფრეს გადაწყვეტის წესებით.",
    h1: "პოკერის კომბინაციები",
    lead: "Texas Hold’em-ში ხელები ძლიერიდან სუსტისკენ შემდეგნაირად ნაწილდება. ხელი ყოველთვის ზუსტად ხუთი კარტისგან შედგება, რომლებიც თქვენთვის ხილული შვიდი კარტიდან ირჩევა: თქვენი ორი პირადი და ხუთი საერთო კარტი. საკუთარი კარტების გამოყენება სავალდებულო არ არის — თუ Board-ის ხუთი კარტი უკვე საუკეთესო კომბინაციას ქმნის, ეს თქვენი ხელიცაა.",
    names: [
      "როიალ ფლეში",
      "სტრეიტ ფლეში",
      "კარე",
      "ფულ ჰაუსი",
      "ფლეში",
      "სტრეიტი",
      "სამი ერთნაირი",
      "ორი წყვილი",
      "ერთი წყვილი",
      "მაღალი კარტი",
    ],
    texts: [
      "A K Q J 10, ყველა ერთი მასტის. საუკეთესო შესაძლო ხელი; მისი დამარცხება შეუძლებელია — მხოლოდ გათანაბრება.",
      "მიმდევრობით განლაგებული ხუთი კარტი, ყველა ერთი მასტის. ორ სტრეიტ ფლეშს შორის იგებს ის, რომლის უმაღლესი კარტიც უფრო მაღალია.",
      "ერთი და იმავე მნიშვნელობის ოთხი კარტი. მეხუთე კარტი (kicker) წყვეტს იშვიათ ფრეს, როცა დაფაზე ორივე მოთამაშეს ერთნაირი კარე აქვს.",
      "სამი ერთნაირი და ერთი წყვილი. ჯერ სამკარტიანი ჯგუფი შედარება, შემდეგ — წყვილი.",
      "ერთი და იმავე მასტის ხუთი კარტი, მაგრამ არა მიმდევრობით. კარტები შედარება უმაღლესიდან ქვემოთ; არც ერთი მასტი სხვაზე მაღალი არ არის.",
      "მიმდევრობით განლაგებული ხუთი კარტი სხვადასხვა მასტით. Ace შეიძლება იყოს მაღალი (10-J-Q-K-A) ან დაბალი (A-2-3-4-5), მაგრამ ორივე ერთდროულად არა.",
      "ერთი და იმავე მნიშვნელობის სამი კარტი და ორი ერთმანეთთან დაუკავშირებელი კარტი.",
      "ორი განსხვავებული წყვილი და მეხუთე კარტი. ჯერ მაღალი წყვილი შედარება, შემდეგ დაბალი, ბოლოს კი kicker.",
      "ერთი და იმავე მნიშვნელობის ორი კარტი და სამი სხვა კარტი, რომლებიც თანმიმდევრობით შედარება.",
      "არცერთი ზემოთ ჩამოთვლილი. შედეგს განსაზღვრავს ყველაზე მაღალი კარტი, შემდეგ მომდევნო და ასე შემდეგ.",
    ],
    dealt: "გვხვდება შვიდკარტიანი ხელების %s-ში",
    tiesH2: "როგორ წყდება ფრე",
    tiesP: "ჯერ შედარება ხდება კატეგორიის მიხედვით: ნებისმიერი ფლეში სჯობნის ნებისმიერ სტრეიტს, კარტების მნიშვნელობის მიუხედავად. ერთი კატეგორიის შემთხვევაში კარტები შედარება უმაღლესიდან ქვემოთ. კომბინაციის მიღმა დარჩენილ კარტს <em>kicker</em> ეწოდება და ის ბევრად მეტ დარიგებას წყვეტს, ვიდრე დამწყებებს ჰგონიათ: A♠ K♦ და A♣ 7♥ Board-ზე A-9-4 ორივე ტუზების წყვილია, მაგრამ kicker-ად მეფე შვიდიანს სჯობნის. Hold’em-ში მასტები ფრეს არასოდეს წყვეტს — თუ ორ მოთამაშეს ერთი და იგივე ხუთი მნიშვნელობა აქვს, ბანკი ბოლო ჩიპამდე იყოფა.",
    wrongH2: "გავრცელებული მცდარი წარმოდგენები",
    wrong: [
      "Ace სტრეიტში შეიძლება იყოს როგორც ყველაზე მაღალი, ისე ყველაზე დაბალი კარტი: A-K-Q-J-10 საუკეთესო სტრეიტია, A-2-3-4-5 (<em>wheel</em>) — ყველაზე სუსტი. მიმდევრობა წრიულად არ გრძელდება — Q-K-A-2-3 საერთოდ არ წარმოადგენს სტრეიტს.",
      "ფლეში ერთი მასტის ხუთი კარტია და არა ოთხი. თქვენს ხელსა და Board-ზე ჯამში ოთხი გულის კარტი თავისთავად არაფერს ქმნის.",
      "სამი ერთნაირი, რომელიც თქვენს pocket pair-ს და Board-ზე ერთ შესაბამის კარტს იყენებს, <em>set</em>-ია; ერთი თქვენი კარტისა და Board-ზე არსებული pair-ისგან შექმნილს <em>trips</em> ეწოდება. რეიტინგი იგივეა, მაგრამ პრაქტიკული ძალა განსხვავდება, რადგან trips-ის ორი კარტი ყველასთვის ჩანს.",
      "ითვლება მხოლოდ საუკეთესო ხუთი კარტი. თუ ხელში ორი წყვილი გაქვთ და Board-ზე მესამე წყვილია, მაინც ორი წყვილი გაქვთ და არა სამი.",
      "ზემოთ მოცემული პროცენტები აჩვენებს, რამდენად ხშირად იქმნება თითოეული ხელი River-მდე შვიდ კარტზე და არა რამდენად ხშირად იგებს. ორი წყვილი შეიძლება ჩვეულებრივად გამოიყურებოდეს, მაგრამ მაინც სჯობნის ხელების უმეტესობას.",
    ],
    seeH2: "როგორ ჩანს ეს მაგიდასთან",
    seeP: "თამაშის დროს PokerTH Board-ის ქვემოთ ასახელებს თქვენს მიმდინარე საუკეთესო კომბინაციას, რათა დროის წნეხში მისი გამოთვლა არ დაგჭირდეთ, ხოლო Showdown-ზე თითოეულ გახსნილ ხელს აჩვენებს იმ ხუთი კარტის გამოკვეთით, რომლებმაც შედეგი შექმნა. ოფლაინ ვარჯიში კომპიუტერული მოწინააღმდეგეების წინააღმდეგ ამ რეიტინგის ავტომატურად დასამახსოვრებლად ყველაზე სწრაფი გზაა.",
  },
  kk: {
    title: "Покер комбинациялары — Texas Hold’em-дегі қолдардың реті",
    desc: "Texas Hold’em покерінің он комбинациясы роял-флештен үлкен картаға дейін ретімен, мысалдарымен, әрқайсысының ықтималдығымен және тең жағдайлардың қалай шешілетінімен берілген.",
    ldHeadline: "Покер комбинациялары — Texas Hold’em",
    ldDesc: "Texas Hold’em-нің он комбинациясы ретімен, мысалдарымен, жиілігімен және теңдікті шешу ережелерімен.",
    h1: "Покер комбинациялары",
    lead: "Texas Hold’em-де комбинациялар ең күштісінен ең әлсізіне қарай төмендегідей реттеледі. Комбинация әрдайым дәл бес картадан тұрады, олар сіз көретін жеті картадан таңдалады: екі жеке картаңыз бен бес ортақ карта. Өз карталарыңызды қолдануға ешкім мәжбүрлемейді — егер үстелдегі карталардың өзі ең үздік бестікті құраса, бұл сіздің де комбинацияңыз.",
    names: ["Роял-флеш", "Стрит-флеш", "Каре", "Фулл-хаус", "Флеш", "Стрит", "Үштік", "Екі жұп", "Жұп", "Үлкен карта"],
    texts: [
      "A K Q J 10, бәрі бір масть. Мүмкін болатын ең үздік комбинация; оны жеңу мүмкін емес, тек теңесуге болады.",
      "Бір масть қатарынан бес карта. Екі стрит-флештің ішінен ең үлкен картасы жоғарырағы ұтады.",
      "Бірдей дәрежелі төрт карта. Бесінші карта (кикер) үстелдегі екі бірдей каре арасындағы сирек теңдікті шешеді.",
      "Үштік пен жұп. Алдымен үш карталы топ, содан кейін жұп салыстырылады.",
      "Бір масть, бірақ қатарынан емес бес карта. Ең үлкенінен бастап карта-картамен салыстырылады; ешбір масть басқасынан жоғары емес.",
      "Әртүрлі масть қатарынан бес карта. Тұз ең үлкен (10-J-Q-K-A) немесе ең кіші (A-2-3-4-5) болып ойнайды, бірақ ешқашан екеуі бірдей емес.",
      "Бірдей дәрежелі үш карта және өзара байланыссыз екі карта.",
      "Екі түрлі жұп және бесінші карта. Алдымен үлкен жұп, содан кейін кішісі, содан кейін кикер салыстырылады.",
      "Бірдей дәрежелі екі карта және ретімен салыстырылатын байланыссыз үш карта.",
      "Жоғарыдағылардың ешқайсысы емес. Ең үлкен карта шешеді, содан кейін келесісі және солай жалғаса береді.",
    ],
    dealt: "жеті карталы қолдардың %s-ында кездеседі",
    tiesH2: "Теңдік қалай шешіледі",
    tiesP: "Алдымен санат салыстырылады: карталарына қарамастан кез келген флеш кез келген стритті жеңеді. Санат бірдей болса, ең үлкенінен бастап дәреже-дәрежемен салыстырылады. Комбинациядан кейін қалған карта <em>кикер</em> деп аталады, және ол жаңадан бастаушылар ойлағаннан әлдеқайда көп таратуды шешеді: A-9-4 бордында A♠ K♦ пен A♣ 7♥ екеуі де тұздар жұбын құрайды, бірақ кикер бойынша король жетілікті жеңеді. Hold’em-де масть ешқашан ештеңені шешпейді — бес дәрежесі бірдей екі ойыншы банкті соңғы фишкасына дейін бөліседі.",
    wrongH2: "Жиі кездесетін қате түсініктер",
    wrong: [
      "Тұз — стриттегі ең үлкен де, ең кіші де карта: A-K-Q-J-10 — ең үздігі, A-2-3-4-5 (<em>дөңгелек</em>, wheel) — ең әлсізі. Тізбек айналып тұйықталмайды — Q-K-A-2-3 мүлдем ештеңе емес.",
      "Флеш — бір масть төрт емес, бес карта. Қолыңыз бен борд арасындағы төрт жүрек өздігінен ештеңеге тұрмайды.",
      "Қолыңыздағы жұп пен бордтағы бір картадан құралған үштік <em>сет</em> деп аталады; қолыңыздағы бір карта мен бордтағы жұптан құралғаны — <em>трипс</em>. Реті бірдей, бірақ күші мүлдем бөлек, өйткені трипс бәріне көрініп тұрады.",
      "Тек ең үздік бес карта ғана есептеледі. Қолыңызда екі жұп, ал бордта үшінші жұп болса, сізде үш емес, екі жұп бар.",
      "Жоғарыдағы пайыздар әр комбинацияның риверде жеті картадан қаншалықты жиі шығатынын көрсетеді, оның қаншалықты жиі ұтатынын емес. Екі жұп қарапайым көрінеді, бірақ кездестіретінінің көбінен алда тұрады.",
    ],
    seeH2: "Мұны үстел басында көру",
    seeP: "PokerTH ойын кезінде ең үздік комбинацияңызды бордтың астында атап көрсетеді, сондықтан оны уақыт қысымында өзіңіз құрастырудың қажеті жоқ, ал шоудаунда ашылған әр қолды есепке алынған бес картасын бөлектеп көрсетеді. Компьютер басқаратын қарсыластарға қарсы офлайн жаттығу — бұл ретті жаттап алудың ең жылдам жолы.",
  },
  si: {
    title: "පෝකර් අත් — Texas Hold’em අත් ශ්‍රේණිගත කිරීම",
    desc: "Royal Flush සිට High Card දක්වා ශ්‍රේණිගත කළ Texas Hold’em පෝකර් අත් දහය, උදාහරණ, එක් එක් අතේ සම්භාවිතාව සහ සම තත්ත්ව විසඳන ආකාරය සමඟ.",
    ldHeadline: "පෝකර් අත් — Texas Hold’em",
    ldDesc: "Texas Hold’em අත් දහය අනුපිළිවෙළින්, උදාහරණ, සංඛ්‍යාත සහ සම තත්ත්ව විසඳීමේ නීති සමඟ.",
    h1: "පෝකර් අත් ශ්‍රේණිගත කිරීම",
    lead: "Texas Hold’em හි අත් ශක්තිමත්ම එකේ සිට දුර්වලම එක දක්වා පහත පරිදි ශ්‍රේණිගත වේ. අතක් සැමවිටම හරියටම කාඩ් පහකි; ඒවා ඔබට පෙනෙන කාඩ් හතෙන් තේරේ: ඔබේ පෞද්ගලික කාඩ් දෙක සහ පොදු කාඩ් පහ. ඔබේම කාඩ් භාවිත කිරීමට ඔබ බැඳී නැත — බෝඩ් එක තනිවම හොඳම කාඩ් පහ සාදන්නේ නම්, එය ඔබේ අත ද වේ.",
    names: [
      "Royal Flush",
      "Straight Flush",
      "Four of a Kind",
      "Full House",
      "Flush",
      "Straight",
      "Three of a Kind",
      "Two Pair",
      "One Pair",
      "High Card",
    ],
    texts: [
      "A K Q J 10, සියල්ල එකම වර්ගයෙන්. හැකි හොඳම අත; එය පරාජය කළ නොහැක, සම කළ හැකි පමණි.",
      "අනුපිළිවෙළට කාඩ් පහක්, සියල්ල එකම වර්ගයෙන්. Straight Flush දෙකක් අතර ඉහළම කාඩ් එක වැඩි එක දිනයි.",
      "එකම අගයේ කාඩ් හතරක්. බෝඩ් එකේ සමාන හතරේ කට්ටල දෙකක් අතර දුර්ලභ සම තත්ත්වය පස්වන කාඩ් එක (kicker) විසඳයි.",
      "එකම අගයේ කාඩ් තුනක් සහ යුගලයක්. පළමුව කාඩ් තුනේ කට්ටලය, පසුව යුගලය සසඳනු ලැබේ.",
      "එකම වර්ගයේ කාඩ් පහක්, අනුපිළිවෙළට නොවේ. ඉහළ සිට කාඩ් එකින් එක සසඳනු ලැබේ; කිසිදු වර්ගයක් තවත් එකකට වඩා ඉහළ නොවේ.",
      "අනුපිළිවෙළට කාඩ් පහක්, මිශ්‍ර වර්ග. Ace ඉහළ (10-J-Q-K-A) හෝ පහළ (A-2-3-4-5) ලෙස ක්‍රීඩා කරයි, කිසිවිටෙක එකවර දෙකම නොවේ.",
      "එකම අගයේ කාඩ් තුනක් සහ සම්බන්ධයක් නැති කාඩ් දෙකක්.",
      "වෙනස් යුගල දෙකක් සහ පස්වන කාඩ් එකක්. පළමුව ඉහළ යුගලය, පසුව පහළ යුගලය, ඉන්පසු kicker සසඳනු ලැබේ.",
      "එකම අගයේ කාඩ් දෙකක් සහ සම්බන්ධයක් නැති කාඩ් තුනක්, පිළිවෙළින් සසඳනු ලැබේ.",
      "ඉහත කිසිවක් නැත. ඉහළම කාඩ් එක තීරණය කරයි, පසුව ඊළඟ එක, ආදී වශයෙන්.",
    ],
    dealt: "කාඩ් හතේ අත්වලින් %s ක දිස්වේ",
    tiesH2: "සම තත්ත්ව විසඳෙන ආකාරය",
    tiesP: "පළමුව ප්‍රවර්ගය සසඳනු ලැබේ: කාඩ් කුමක් වුවත්, ඕනෑම Flush එකක් ඕනෑම Straight එකක් පරදවයි. ප්‍රවර්ගය සමාන නම්, ඉහළ සිට අගයෙන් අගය සසඳනු ලැබේ. සංයෝජනයෙන් පසු ඉතිරි වන දේ <em>kicker</em> ලෙස හැඳින්වෙන අතර, එය ආධුනිකයන් සිතනවාට වඩා බොහෝ අත් තීරණය කරයි: A-9-4 බෝඩ් එකකදී A♠ K♦ සහ A♣ 7♥ යන දෙකම Ace යුගලයක් සාදයි, නමුත් kicker ලෙස King හත පරදවයි. Hold’em හි කාඩ් වර්ග කිසිවිටෙක කිසිවක් විසඳන්නේ නැත — එකම අගයන් පහ ඇති ක්‍රීඩකයන් දෙදෙනෙකු අවසන් චිප් එක දක්වාම පොට් එක බෙදාගනී.",
    wrongH2: "වැරදියට විශ්වාස කරන දේ",
    wrong: [
      "Ace යනු Straight එකක ඉහළම මෙන්ම පහළම කාඩ් එකයි: A-K-Q-J-10 හොඳම එකයි, A-2-3-4-5 (<em>wheel</em>) දුර්වලම එකයි. අනුපිළිවෙළ වටයක් ලෙස නොයයි — Q-K-A-2-3 කිසිවක් නොවේ.",
      "Flush එකක් යනු එකම වර්ගයේ කාඩ් පහකි, හතරක් නොවේ. ඔබේ අත සහ බෝඩ් එක අතර hearts හතරක් තිබීම තනිවම කිසිවක් වටින්නේ නැත.",
      "ඔබේ අතේ ඇති යුගලයකින් සහ බෝඩ් එකේ එක් කාඩ් එකකින් සෑදෙන Three of a Kind එක <em>set</em> ලෙස හැඳින්වේ; ඔබේ අතේ එක් කාඩ් එකකින් සහ බෝඩ් එකේ යුගලයකින් සෑදුණු විට එය <em>trips</em> වේ. එකම ශ්‍රේණිය, නමුත් ශක්තිය බෙහෙවින් වෙනස්ය, මන්ද trips සියල්ලන්ටම පෙනෙන බැවිනි.",
      "ගැනෙන්නේ හොඳම කාඩ් පහ පමණි. අතේ යුගල දෙකක් සහ බෝඩ් එකේ තෙවන යුගලයක් ඇති විට ඔබට ඇත්තේ Two Pair ය, යුගල තුනක් නොවේ.",
      "ඉහත ප්‍රතිශත පෙන්වන්නේ කාඩ් හතක් මත රිවර් එකේදී එක් එක් අත කොපමණ වාරයක් දිස්වේද යන්නයි, එය කොපමණ වාරයක් දිනයිද යන්න නොවේ. Two Pair සාමාන්‍ය දෙයක් සේ පෙනුණත් එයට හමුවන බොහෝ දේට වඩා ඉදිරියෙන් සිටී.",
    ],
    seeH2: "මේසයේදී එය දැකීම",
    seeP: "ක්‍රීඩාව අතරතුර PokerTH ඔබේ හොඳම සංයෝජනය බෝඩ් එකට යටින් නම් කරයි; එබැවින් කාල පීඩනය යටතේ ඔබට එය කිසිවිටෙක තනිවම සෙවීමට සිදු නොවේ. ෂෝඩවුන්හිදී හෙළි වූ සෑම අතක්ම, ගණන් ගැනුණු කාඩ් පහ උද්දීපනය කර පෙන්වයි. පරිගණකය පාලනය කරන ප්‍රතිවාදීන්ට එරෙහිව මාර්ගගත නොවී පුහුණු වීම මෙම ශ්‍රේණිගත කිරීම හුරු කරගැනීමට ඇති වේගවත්ම මඟයි.",
  },
  ta: {
    title: "போக்கர் சீட்டுக் கோர்வைகள் — டெக்சாஸ் ஹோல்டெம் வரிசை",
    desc: "டெக்சாஸ் ஹோல்டெம் போக்கரின் பத்து கோர்வைகளும் அரச வரிசை முதல் உயர் சீட்டு வரை, எடுத்துக்காட்டுகள், ஒவ்வொன்றும் வர வாய்ப்பு, கிக்கர் மற்றும் சமநிலை தீர்வு விதிகளுடன்.",
    ldHeadline: "போக்கர் சீட்டுக் கோர்வைகள் — டெக்சாஸ் ஹோல்டெம்",
    ldDesc: "டெக்சாஸ் ஹோல்டெம்மின் பத்து கோர்வைகள் வரிசைப்படி, எடுத்துக்காட்டுகள், அடிக்கடி வரும் விகிதம், சமநிலை விதிகளுடன்.",
    h1: "போக்கர் சீட்டுக் கோர்வைகள்",
    lead: "டெக்சாஸ் ஹோல்டெம்மில் கோர்வைகள் வலிமையான ஒன்றிலிருந்து பலவீனமானது வரை இப்படி வரிசைப்படுத்தப்படுகின்றன. ஒரு கை எப்போதும் சரியாக ஐந்து சீட்டுகள்; நீங்கள் காணும் ஏழிலிருந்து தேர்ந்தெடுக்கப்படுகிறது: உங்கள் இரு மறைமுக சீட்டுகள் மற்றும் ஐந்து பொது சீட்டுகள். உங்கள் சொந்த சீட்டுகளைப் பயன்படுத்த வேண்டிய கட்டாயம் இல்லை — மேசையிலுள்ளவை மட்டுமே சிறந்த ஐந்தை உருவாக்கினால், அதுவும் உங்கள் கைதான்.",
    names: ["அரச வரிசை", "ஒரே நிற வரிசை", "நான்மை", "முழு வீடு", "ஒரே நிறம்", "வரிசை", "மும்மை", "இரட்டை ஜோடி", "ஜோடி", "உயர் சீட்டு"],
    texts: [
      "ஒரே நிறத்தில் A K Q J 10. சாத்தியமான சிறந்த கை: இதை வெல்ல முடியாது, சமன் செய்ய மட்டுமே முடியும்.",
      "ஒரே நிறத்தில் தொடர்ச்சியான ஐந்து சீட்டுகள். இரு ஒரே நிற வரிசைகளில் மேல் சீட்டு பெரியது வெல்லும்.",
      "ஒரே மதிப்புள்ள நான்கு சீட்டுகள். நான்கும் மேசையிலேயே இருக்கும் அரிய சமநிலையை ஐந்தாவது சீட்டு (கிக்கர்) தீர்க்கிறது.",
      "ஒரு மும்மையுடன் ஒரு ஜோடி. முதலில் மும்மை ஒப்பிடப்படும், பிறகு ஜோடி.",
      "ஒரே நிறத்தில் ஐந்து சீட்டுகள், தொடர்ச்சியாக இல்லாமல். மேலிருந்து ஒவ்வொன்றாக ஒப்பிடப்படும்; எந்த நிறமும் மற்றொன்றை விட உயர்ந்ததல்ல.",
      "தொடர்ச்சியான ஐந்து சீட்டுகள், நிறங்கள் கலந்து. ஏஸ் மேலே (10-J-Q-K-A) அல்லது கீழே (A-2-3-4-5) செயல்படும், ஒருபோதும் இரண்டிலும் ஒரே நேரத்தில் அல்ல.",
      "ஒரே மதிப்புள்ள மூன்று சீட்டுகள், உடன் தொடர்பற்ற இரண்டு சீட்டுகள்.",
      "வெவ்வேறு இரு ஜோடிகள் உடன் ஐந்தாவது சீட்டு. முதலில் உயர் ஜோடி, பிறகு தாழ் ஜோடி, பிறகு கிக்கர் ஒப்பிடப்படும்.",
      "ஒரே மதிப்புள்ள இரு சீட்டுகள் உடன் தொடர்பற்ற மூன்று சீட்டுகள், வரிசைப்படி ஒப்பிடப்படும்.",
      "மேற்கண்ட எதுவும் இல்லை. மிக உயர்ந்த சீட்டு முடிவு செய்யும், பிறகு அடுத்தது, அப்படியே தொடரும்."
    ],
    dealt: "ஏழு சீட்டுக் கைகளில் %s அளவில் வருகிறது",
    tiesH2: "சமநிலை எப்படித் தீர்க்கப்படுகிறது",
    tiesP: "முதலில் வகை ஒப்பிடப்படுகிறது: சீட்டுகள் எதுவாக இருந்தாலும் எந்த ஒரே நிறமும் எந்த வரிசையையும் வெல்லும். ஒரே வகைக்குள் மேலிருந்து கீழாக மதிப்பு வாரியாக ஒப்பிடப்படும். கோர்வை அமைந்த பிறகு எஞ்சுவது <em>கிக்கர்</em> எனப்படும், தொடக்கநிலையாளர்கள் நினைப்பதை விட அதிக கைகளை அதுவே தீர்மானிக்கிறது: A-9-4 மேசையில் A♠ K♦ மற்றும் A♣ 7♥ இரண்டுமே ஏஸ் ஜோடி தருகின்றன, ஆனால் ராஜா ஏழை மிஞ்சுகிறது. ஹோல்டெம்மில் நிறம் ஒருபோதும் சமநிலையை உடைப்பதில்லை — ஒரே ஐந்து மதிப்புகள் கொண்ட இரு வீரர்கள் கடைசி சில்லு வரை பானைப் பங்கிட்டுக் கொள்வர்.",
    wrongH2: "பொதுவாகத் தவறாகப் புரிந்துகொள்ளப்படுவது",
    wrong: [
      "வரிசைக்கு ஏஸ் ஒரே நேரத்தில் மிக உயர்ந்த மற்றும் மிகத் தாழ்ந்த சீட்டு: A-K-Q-J-10 சிறந்தது, A-2-3-4-5 (<em>wheel</em> எனப்படுவது) மிகப் பலவீனமானது. வரிசை சுற்றி வருவதில்லை — Q-K-A-2-3 என்பது ஒன்றுமே இல்லை.",
      "ஒரே நிறம் என்பது ஒரே நிறத்தில் ஐந்து சீட்டுகள், நான்கு அல்ல. உங்கள் கையிலும் மேசையிலும் சேர்ந்து நான்கு ஹார்ட்ஸ் இருப்பது தனியே எந்தப் பயனும் அளிக்காது.",
      "கையிலுள்ள ஜோடியுடன் மேசையின் ஒரு சீட்டு சேர்ந்து அமையும் மும்மை <em>set</em> எனப்படும்; கையிலுள்ள ஒரு சீட்டுடன் மேசையின் ஜோடி சேர்ந்தால் <em>trips</em>. வரிசை ஒன்றே, வலிமை மிகவும் வேறு, ஏனெனில் trips அனைவருக்கும் தெரியும்.",
      "சிறந்த ஐந்து சீட்டுகள் மட்டுமே கணக்கிடப்படும். கையில் இரு ஜோடிகளும் மேசையில் மூன்றாவது ஜோடியும் இருந்தாலும் உங்கள் கை இரட்டை ஜோடிதான், மூன்று அல்ல.",
      "மேலுள்ள சதவீதங்கள் ஏழு சீட்டுகளில் ரிவர் வரை ஒவ்வொரு கையும் எத்தனை முறை அமைகிறது என்பதைக் காட்டுகின்றன, எத்தனை முறை வெல்கிறது என்பதை அல்ல. இரட்டை ஜோடி சாதாரணமாகத் தோன்றினாலும் அது எதிர்கொள்ளும் பெரும்பாலானவற்றை விட முன்னிலையிலேயே இருக்கிறது."
    ],
    seeH2: "மேசையில் இதைப் பார்ப்பது",
    seeP: "விளையாடும்போது PokerTH உங்கள் தற்போதைய சிறந்த கையின் பெயரை மேசைக்குக் கீழே காட்டுகிறது, எனவே நேரம் ஓடும் அழுத்தத்தில் அதை நீங்களே கணக்கிட வேண்டியதில்லை; சீட்டு திறக்கும்போது வெளிப்படுத்தப்பட்ட ஒவ்வொரு கையிலும் உண்மையில் கணக்கில் வந்த ஐந்து சீட்டுகள் தனித்துக் காட்டப்படும். கணினி எதிரிகளுடன் இணையம் இல்லாமல் பயிற்சி செய்வதே இந்த வரிசையை மனதில் பதிய வைக்கும் விரைவான வழி."
  }
};

// Assemble one page body per language, once, at load. The card examples and
// the frequencies are language-neutral and stay in proxy.js, so they are
// passed in rather than duplicated 44 times; sd() is the suit-colouring
// helper, for the same reason.
function build(hands, sd) {
  var out = {};
  for (var code in PARTS) {
    var p = PARTS[code];
    var rows = '', i;
    for (i = 0; i < hands.length; i++) {
      rows += '<li><strong>' + p.names[i] + '</strong> — ' + p.texts[i] +
        '<br>' + sd(hands[i][2]) + ' <span style="opacity:.6">· ' +
        p.dealt.replace('%s', hands[i][3]) + '</span></li>';
    }
    var wrong = '';
    for (i = 0; i < p.wrong.length; i++) wrong += '<li>' + p.wrong[i] + '</li>';
    out[code] = {
      title: p.title, desc: p.desc, ldHeadline: p.ldHeadline, ldDesc: p.ldDesc,
      body: '<h1>' + p.h1 + '</h1>' +
        '<p>' + p.lead + '</p>' +
        '<ol class="hr">' + rows + '</ol>' +
        '<h2>' + p.tiesH2 + '</h2><p>' + p.tiesP + '</p>' +
        '<h2>' + p.wrongH2 + '</h2><ul>' + wrong + '</ul>' +
        '<h2>' + p.seeH2 + '</h2><p>' + p.seeP + '</p>'
    };
  }
  return out;
}

module.exports = { PARTS: PARTS, build: build };
