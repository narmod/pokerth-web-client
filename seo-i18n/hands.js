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
