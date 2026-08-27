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
