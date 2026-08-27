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
    title: 'Combinaisons du poker \u2014 ordre des mains au Texas Hold\u2019em',
    desc: 'Les dix combinaisons du poker Texas Hold\u2019em class\u00e9es de la quinte flush royale \u00e0 la carte haute, avec des exemples, la probabilit\u00e9 de chacune et la fa\u00e7on dont les \u00e9galit\u00e9s sont d\u00e9partag\u00e9es.',
    ldHeadline: 'Combinaisons du poker \u2014 Texas Hold\u2019em',
    ldDesc: 'Les dix combinaisons du Texas Hold\u2019em dans l\u2019ordre, avec exemples, fr\u00e9quences et r\u00e8gles de d\u00e9partage.',
    h1: 'Combinaisons du poker',
    lead: 'Au Texas Hold\u2019em, les mains se classent de la plus forte \u00e0 la plus faible comme suit. Une main fait toujours exactement cinq cartes, choisies parmi les sept que vous voyez\u00a0: vos deux cartes priv\u00e9es et les cinq cartes communes. Rien ne vous oblige \u00e0 utiliser les v\u00f4tres \u2014 si le tableau \u00e0 lui seul forme les cinq meilleures, c\u2019est aussi votre main.',
    names: ['Quinte Flush Royale', 'Quinte Flush', 'Carr\u00e9', 'Full', 'Couleur', 'Quinte', 'Brelan', 'Deux Paires', 'Paire', 'Carte Haute'],
    texts: [
      'A K Q J 10, tous de la m\u00eame couleur. La meilleure main possible\u00a0: elle ne peut pas \u00eatre battue, seulement \u00e9galis\u00e9e.',
      'Cinq cartes qui se suivent, toutes de la m\u00eame couleur. Entre deux quintes flush, la plus haute carte l\u2019emporte.',
      'Quatre cartes de m\u00eame rang. La cinqui\u00e8me carte (le kicker) tranche le rare cas o\u00f9 le carr\u00e9 est sur le tableau.',
      'Un brelan accompagn\u00e9 d\u2019une paire. On compare d\u2019abord le brelan, ensuite la paire.',
      'Cinq cartes de la m\u00eame couleur, sans se suivre. On les compare une \u00e0 une en partant de la plus haute\u00a0; aucune couleur ne prime sur une autre.',
      'Cinq cartes qui se suivent, couleurs m\u00e9lang\u00e9es. L\u2019as joue en haut (10-J-Q-K-A) ou en bas (A-2-3-4-5), jamais les deux \u00e0 la fois.',
      'Trois cartes de m\u00eame rang, accompagn\u00e9es de deux cartes sans lien.',
      'Deux paires diff\u00e9rentes plus une cinqui\u00e8me carte. On compare la paire haute, puis la basse, puis le kicker.',
      'Deux cartes de m\u00eame rang plus trois cartes sans lien, compar\u00e9es dans l\u2019ordre.',
      'Aucune des combinaisons ci-dessus. La carte la plus haute d\u00e9cide, puis la suivante, et ainsi de suite.'
    ],
    dealt: 'appara\u00eet dans %s des mains de sept cartes',
    tiesH2: 'Comment les \u00e9galit\u00e9s se d\u00e9partagent',
    tiesP: 'On compare d\u2019abord la cat\u00e9gorie\u00a0: n\u2019importe quelle couleur bat n\u2019importe quelle quinte, quelles que soient les cartes. \u00c0 cat\u00e9gorie \u00e9gale, on compare rang par rang en partant du haut. Ce qui reste apr\u00e8s la combinaison s\u2019appelle le <em>kicker</em>, et il d\u00e9cide de bien plus de coups que les d\u00e9butants ne l\u2019imaginent\u00a0: A\u2660 K\u2666 et A\u2663 7\u2665 forment tous deux une paire d\u2019as sur un tableau A-9-4, mais le roi bat le sept au kicker. Les couleurs ne d\u00e9partagent jamais rien au Hold\u2019em \u2014 deux joueurs avec les m\u00eames cinq rangs se partagent le pot, jusqu\u2019au dernier jeton.',
    wrongH2: 'Ce que l\u2019on croit \u00e0 tort',
    wrong: [
      'L\u2019as est \u00e0 la fois la carte la plus haute et la plus basse d\u2019une quinte\u00a0: A-K-Q-J-10 est la meilleure, A-2-3-4-5 (la <em>roue</em>) la plus faible. La s\u00e9quence ne boucle pas \u2014 Q-K-A-2-3 ne vaut rien du tout.',
      'Une couleur, ce sont cinq cartes de la m\u00eame famille, pas quatre. Quatre c\u0153urs entre votre main et le tableau ne valent rien en soi.',
      'Un brelan form\u00e9 d\u2019une paire dans votre main plus une carte du tableau s\u2019appelle un <em>set</em>\u00a0; form\u00e9 d\u2019une carte de votre main plus une paire au tableau, ce sont des <em>trips</em>. M\u00eame classement, force tr\u00e8s diff\u00e9rente, parce que les trips sont visibles de tous.',
      'Seules les cinq meilleures cartes comptent. Avec deux paires en main et une troisi\u00e8me paire au tableau, vous avez deux paires, pas trois.',
      'Les pourcentages ci-dessus indiquent \u00e0 quelle fr\u00e9quence chaque main appara\u00eet \u00e0 la river sur sept cartes, pas \u00e0 quelle fr\u00e9quence elle gagne. Deux paires semblent banales et restent devant la plupart de ce qu\u2019elles rencontrent.'
    ],
    seeH2: 'Le voir \u00e0 la table',
    seeP: 'PokerTH nomme votre meilleure combinaison sous le tableau pendant la partie, pour que vous n\u2019ayez jamais \u00e0 la reconstituer sous la pression du temps, et affiche au showdown chaque main d\u00e9voil\u00e9e avec les cinq cartes qui ont compt\u00e9 mises en \u00e9vidence. S\u2019entra\u00eener hors ligne contre les adversaires g\u00e9r\u00e9s par l\u2019ordinateur reste le moyen le plus rapide de faire entrer ce classement dans les doigts.'
  },

  de: {
    title: 'Pokerbl\u00e4tter \u2014 Reihenfolge der H\u00e4nde beim Texas Hold\u2019em',
    desc: 'Alle zehn Texas-Hold\u2019em-Pokerbl\u00e4tter vom Royal Flush bis zur h\u00f6chsten Karte, mit Beispielen, der Wahrscheinlichkeit jedes Blatts und der Frage, wie Kicker und Gleichst\u00e4nde entschieden werden.',
    ldHeadline: 'Pokerbl\u00e4tter \u2014 Texas Hold\u2019em',
    ldDesc: 'Die zehn Texas-Hold\u2019em-Bl\u00e4tter der Reihe nach, mit Beispielen, H\u00e4ufigkeiten und Regeln f\u00fcr Gleichst\u00e4nde.',
    h1: 'Pokerbl\u00e4tter',
    lead: 'Texas-Hold\u2019em-Bl\u00e4tter sind von stark nach schwach wie folgt geordnet. Ein Blatt besteht immer aus genau f\u00fcnf Karten, ausgew\u00e4hlt aus den sieben, die Sie sehen\u00a0: Ihren beiden Hole Cards und den f\u00fcnf Gemeinschaftskarten. Sie m\u00fcssen Ihre eigenen Karten nicht verwenden \u2014 wenn das Board allein die besten f\u00fcnf bildet, ist das ebenfalls Ihr Blatt.',
    names: ['Royal Flush', 'Straight Flush', 'Vierling', 'Full House', 'Flush', 'Stra\u00dfe', 'Drilling', 'Zwei Paare', 'Ein Paar', 'H\u00f6chste Karte'],
    texts: [
      'A K Q J 10, alle in derselben Farbe. Das bestm\u00f6gliche Blatt\u00a0: Es kann nicht geschlagen, nur eingeholt werden.',
      'F\u00fcnf aufeinanderfolgende Karten derselben Farbe. Zwischen zwei Straight Flushes gewinnt die h\u00f6here oberste Karte.',
      'Vier Karten desselben Ranges. Die f\u00fcnfte Karte (der Kicker) entscheidet den seltenen Fall, dass der Vierling auf dem Board liegt.',
      'Ein Drilling plus ein Paar. Zuerst wird der Drilling verglichen, dann das Paar.',
      'F\u00fcnf Karten derselben Farbe, nicht in Folge. Von oben Karte f\u00fcr Karte verglichen\u00a0; keine Farbe steht \u00fcber einer anderen.',
      'F\u00fcnf aufeinanderfolgende Karten gemischter Farben. Das Ass z\u00e4hlt oben (10-J-Q-K-A) oder unten (A-2-3-4-5), nie beides zugleich.',
      'Drei Karten desselben Ranges, dazu zwei unabh\u00e4ngige Karten.',
      'Zwei verschiedene Paare plus eine f\u00fcnfte Karte. Zuerst z\u00e4hlt das h\u00f6here Paar, dann das niedrigere, dann der Kicker.',
      'Zwei Karten desselben Ranges plus drei unabh\u00e4ngige Karten, der Reihe nach verglichen.',
      'Nichts von alledem. Die h\u00f6chste Karte entscheidet, dann die n\u00e4chste und so weiter.'
    ],
    dealt: 'kommt in %s der Sieben-Karten-Bl\u00e4tter vor',
    tiesH2: 'Wie Gleichst\u00e4nde entschieden werden',
    tiesP: 'Zuerst z\u00e4hlt die Kategorie\u00a0: jeder Flush schl\u00e4gt jede Stra\u00dfe, unabh\u00e4ngig von den Karten. Innerhalb derselben Kategorie wird von oben Rang f\u00fcr Rang verglichen. Was nach der Kombination \u00fcbrig bleibt, hei\u00dft <em>Kicker</em>, und er entscheidet mehr H\u00e4nde, als Anf\u00e4nger erwarten\u00a0: A\u2660 K\u2666 und A\u2663 7\u2665 ergeben auf einem Board A-9-4 beide ein Ass-Paar, aber der K\u00f6nig sticht die Sieben aus. Farben brechen beim Hold\u2019em nie einen Gleichstand \u2014 zwei Spieler mit denselben f\u00fcnf R\u00e4ngen teilen den Pot, bis auf den letzten Chip.',
    wrongH2: 'H\u00e4ufige Irrt\u00fcmer',
    wrong: [
      'Das Ass ist f\u00fcr eine Stra\u00dfe zugleich die h\u00f6chste und die niedrigste Karte\u00a0: A-K-Q-J-10 ist die beste, A-2-3-4-5 (das <em>Wheel</em>) die schw\u00e4chste. Sie l\u00e4uft nicht um \u2014 Q-K-A-2-3 ist \u00fcberhaupt nichts.',
      'Ein Flush sind f\u00fcnf Karten einer Farbe, nicht vier. Vier Herz zwischen Hand und Board sind f\u00fcr sich genommen wertlos.',
      'Ein Drilling aus einem Paar in der Hand plus einer Karte auf dem Board hei\u00dft <em>Set</em>\u00a0; aus einer Karte in der Hand plus einem Paar auf dem Board hei\u00dft er <em>Trips</em>. Gleicher Rang, sehr unterschiedliche St\u00e4rke, denn Trips sind f\u00fcr alle sichtbar.',
      'Nur die besten f\u00fcnf Karten z\u00e4hlen. Zwei Paare in der Hand und ein drittes Paar auf dem Board ergeben zwei Paare, nicht drei.',
      'Die Prozentwerte oben sagen, wie oft ein Blatt bis zum River \u00fcber sieben Karten \u00fcberhaupt entsteht, nicht wie oft es gewinnt. Zwei Paare wirken allt\u00e4glich und liegen trotzdem vor dem meisten, was ihnen begegnet.'
    ],
    seeH2: 'Am Tisch sichtbar',
    seeP: 'PokerTH benennt Ihr aktuell bestes Blatt w\u00e4hrend des Spiels unterhalb des Boards, sodass Sie es nie unter Zeitdruck selbst zusammensetzen m\u00fcssen, und zeigt beim Showdown jedes aufgedeckte Blatt mit den f\u00fcnf Karten, die gez\u00e4hlt haben, hervorgehoben. Offline gegen die Computergegner zu \u00fcben ist der schnellste Weg, diese Reihenfolge in die Finger zu bekommen.'
  },

  es: {
    title: 'Jugadas de p\u00f3ker \u2014 orden de las manos en Texas Hold\u2019em',
    desc: 'Las diez jugadas del p\u00f3ker Texas Hold\u2019em ordenadas de la escalera real a la carta alta, con ejemplos, la probabilidad de cada una y c\u00f3mo se resuelven los kickers y los empates.',
    ldHeadline: 'Jugadas de p\u00f3ker \u2014 Texas Hold\u2019em',
    ldDesc: 'Las diez jugadas del Texas Hold\u2019em en orden, con ejemplos, frecuencias y reglas de desempate.',
    h1: 'Jugadas de p\u00f3ker',
    lead: 'En Texas Hold\u2019em las manos se ordenan de la m\u00e1s fuerte a la m\u00e1s d\u00e9bil como sigue. Una mano son siempre exactamente cinco cartas, elegidas entre las siete que ves\u00a0: tus dos cartas privadas y las cinco comunitarias. Nunca est\u00e1s obligado a usar las tuyas \u2014 si la mesa por s\u00ed sola forma las mejores cinco, esa tambi\u00e9n es tu mano.',
    names: ['Escalera Real', 'Escalera de Color', 'P\u00f3ker', 'Full', 'Color', 'Escalera', 'Tr\u00edo', 'Doble Pareja', 'Pareja', 'Carta Alta'],
    texts: [
      'A K Q J 10, todas del mismo palo. La mejor mano posible\u00a0: no se puede ganar, solo empatar.',
      'Cinco cartas consecutivas del mismo palo. Entre dos escaleras de color gana la de carta m\u00e1s alta.',
      'Cuatro cartas del mismo valor. La quinta carta (el kicker) resuelve el raro empate cuando el p\u00f3ker est\u00e1 en la mesa.',
      'Un tr\u00edo m\u00e1s una pareja. Primero se compara el tr\u00edo y despu\u00e9s la pareja.',
      'Cinco cartas del mismo palo, sin ser consecutivas. Se comparan una a una empezando por la m\u00e1s alta\u00a0; ning\u00fan palo vale m\u00e1s que otro.',
      'Cinco cartas consecutivas de palos mezclados. El as juega alto (10-J-Q-K-A) o bajo (A-2-3-4-5), nunca las dos cosas a la vez.',
      'Tres cartas del mismo valor, m\u00e1s dos cartas sin relaci\u00f3n.',
      'Dos parejas distintas m\u00e1s una quinta carta. Se compara primero la pareja alta, luego la baja y luego el kicker.',
      'Dos cartas del mismo valor m\u00e1s tres cartas sin relaci\u00f3n, comparadas en orden.',
      'Ninguna de las anteriores. Decide la carta m\u00e1s alta, luego la siguiente, y as\u00ed sucesivamente.'
    ],
    dealt: 'aparece en el %s de las manos de siete cartas',
    tiesH2: 'C\u00f3mo se resuelven los empates',
    tiesP: 'Primero se compara la categor\u00eda\u00a0: cualquier color gana a cualquier escalera, sean cuales sean las cartas. Dentro de la misma categor\u00eda se compara valor por valor empezando por arriba. Lo que sobra tras la jugada se llama <em>kicker</em>, y decide muchas m\u00e1s manos de las que esperan los principiantes\u00a0: A\u2660 K\u2666 y A\u2663 7\u2665 forman pareja de ases en una mesa A-9-4, pero el rey supera al siete. Los palos nunca desempatan en Hold\u2019em \u2014 dos jugadores con los mismos cinco valores reparten el bote hasta la \u00faltima ficha.',
    wrongH2: 'Errores frecuentes',
    wrong: [
      'El as es a la vez la carta m\u00e1s alta y la m\u00e1s baja de una escalera\u00a0: A-K-Q-J-10 es la mejor, A-2-3-4-5 (la <em>rueda</em>) la peor. La secuencia no da la vuelta \u2014 Q-K-A-2-3 no vale absolutamente nada.',
      'Un color son cinco cartas de un palo, no cuatro. Cuatro corazones entre tu mano y la mesa no valen nada por s\u00ed solos.',
      'Un tr\u00edo formado con una pareja de tu mano m\u00e1s una carta de la mesa se llama <em>set</em>\u00a0; formado con una carta tuya m\u00e1s una pareja en la mesa son <em>trips</em>. Misma categor\u00eda, fuerza muy distinta, porque los trips los ve todo el mundo.',
      'Solo cuentan las mejores cinco cartas. Con dos parejas y una tercera pareja en la mesa tienes doble pareja, no triple.',
      'Los porcentajes de arriba indican con qu\u00e9 frecuencia aparece cada jugada al llegar al river sobre siete cartas, no con qu\u00e9 frecuencia gana. La doble pareja parece com\u00fan y a\u00fan as\u00ed va por delante de casi todo lo que se encuentra.'
    ],
    seeH2: 'Verlo en la mesa',
    seeP: 'PokerTH nombra tu mejor jugada actual bajo la mesa mientras juegas, de modo que nunca tengas que deducirla con el reloj en contra, y en el showdown muestra cada mano revelada con las cinco cartas que contaron resaltadas. Practicar sin conexi\u00f3n contra los oponentes del ordenador es la forma m\u00e1s r\u00e1pida de aprenderse el orden de memoria.'
  },

  'pt-BR': {
    title: 'M\u00e3os do p\u00f4quer \u2014 ordem das m\u00e3os no Texas Hold\u2019em',
    desc: 'As dez m\u00e3os do p\u00f4quer Texas Hold\u2019em em ordem, do royal flush \u00e0 carta alta, com exemplos, a probabilidade de cada uma e como kickers e empates s\u00e3o resolvidos.',
    ldHeadline: 'M\u00e3os do p\u00f4quer \u2014 Texas Hold\u2019em',
    ldDesc: 'As dez m\u00e3os do Texas Hold\u2019em em ordem, com exemplos, frequ\u00eancias e regras de desempate.',
    h1: 'M\u00e3os do p\u00f4quer',
    lead: 'No Texas Hold\u2019em as m\u00e3os s\u00e3o classificadas da mais forte para a mais fraca como segue. Uma m\u00e3o tem sempre exatamente cinco cartas, escolhidas entre as sete que voc\u00ea v\u00ea\u00a0: suas duas cartas fechadas e as cinco comunit\u00e1rias. Voc\u00ea nunca \u00e9 obrigado a usar as suas \u2014 se a mesa sozinha formar as melhores cinco, essa tamb\u00e9m \u00e9 a sua m\u00e3o.',
    names: ['Royal Flush', 'Straight Flush', 'Quadra', 'Full House', 'Flush', 'Sequ\u00eancia', 'Trinca', 'Dois Pares', 'Par', 'Carta Alta'],
    texts: [
      'A K Q J 10, todas do mesmo naipe. A melhor m\u00e3o poss\u00edvel\u00a0: n\u00e3o pode ser batida, apenas empatada.',
      'Cinco cartas em sequ\u00eancia, todas do mesmo naipe. Entre dois straight flushes vence o de carta mais alta.',
      'Quatro cartas do mesmo valor. A quinta carta (o kicker) resolve o raro empate quando a quadra est\u00e1 na mesa.',
      'Uma trinca mais um par. Compara-se primeiro a trinca, depois o par.',
      'Cinco cartas do mesmo naipe, sem estarem em sequ\u00eancia. Comparadas uma a uma a partir da mais alta\u00a0; nenhum naipe vale mais que outro.',
      'Cinco cartas em sequ\u00eancia, naipes misturados. O \u00e1s vale em cima (10-J-Q-K-A) ou embaixo (A-2-3-4-5), nunca os dois ao mesmo tempo.',
      'Tr\u00eas cartas do mesmo valor, mais duas cartas sem rela\u00e7\u00e3o.',
      'Dois pares diferentes mais uma quinta carta. Compara-se primeiro o par mais alto, depois o mais baixo, depois o kicker.',
      'Duas cartas do mesmo valor mais tr\u00eas cartas sem rela\u00e7\u00e3o, comparadas em ordem.',
      'Nenhuma das anteriores. Decide a carta mais alta, depois a seguinte, e assim por diante.'
    ],
    dealt: 'aparece em %s das m\u00e3os de sete cartas',
    tiesH2: 'Como os empates s\u00e3o resolvidos',
    tiesP: 'Primeiro compara-se a categoria\u00a0: qualquer flush vence qualquer sequ\u00eancia, sejam quais forem as cartas. Dentro da mesma categoria, compara-se valor por valor a partir do topo. O que sobra depois da combina\u00e7\u00e3o chama-se <em>kicker</em>, e ele decide muito mais m\u00e3os do que os iniciantes imaginam\u00a0: A\u2660 K\u2666 e A\u2663 7\u2665 formam par de \u00e1ses numa mesa A-9-4, mas o rei supera o sete. Naipes nunca desempatam no Hold\u2019em \u2014 dois jogadores com os mesmos cinco valores dividem o pote at\u00e9 a \u00faltima ficha.',
    wrongH2: 'O que costumam entender errado',
    wrong: [
      'O \u00e1s \u00e9 ao mesmo tempo a carta mais alta e a mais baixa de uma sequ\u00eancia\u00a0: A-K-Q-J-10 \u00e9 a melhor, A-2-3-4-5 (a <em>roda</em>) \u00e9 a pior. A sequ\u00eancia n\u00e3o d\u00e1 a volta \u2014 Q-K-A-2-3 n\u00e3o vale nada.',
      'Um flush s\u00e3o cinco cartas de um naipe, n\u00e3o quatro. Quatro copas entre a sua m\u00e3o e a mesa n\u00e3o valem nada por si s\u00f3.',
      'Uma trinca formada por um par na sua m\u00e3o mais uma carta da mesa chama-se <em>set</em>\u00a0; formada por uma carta sua mais um par na mesa chama-se <em>trips</em>. Mesma classifica\u00e7\u00e3o, for\u00e7a bem diferente, porque a trips todo mundo enxerga.',
      'S\u00f3 as melhores cinco cartas contam. Com dois pares e um terceiro par na mesa, voc\u00ea tem dois pares, n\u00e3o tr\u00eas.',
      'As porcentagens acima dizem com que frequ\u00eancia cada m\u00e3o aparece at\u00e9 o river em sete cartas, n\u00e3o com que frequ\u00eancia ela vence. Dois pares parecem banais e ainda assim est\u00e3o \u00e0 frente da maior parte do que encontram.'
    ],
    seeH2: 'Vendo na mesa',
    seeP: 'O PokerTH mostra o nome da sua melhor m\u00e3o atual logo abaixo da mesa enquanto voc\u00ea joga, para que voc\u00ea nunca precise montar isso com o rel\u00f3gio correndo, e no showdown exibe cada m\u00e3o revelada com as cinco cartas que contaram em destaque. Treinar offline contra os oponentes do computador \u00e9 a forma mais r\u00e1pida de gravar essa ordem.'
  },

  it: {
    title: 'Punti del poker \u2014 ordine delle mani nel Texas Hold\u2019em',
    desc: 'Tutti e dieci i punti del poker Texas Hold\u2019em dalla scala reale alla carta alta, con esempi, la probabilit\u00e0 di ciascuno e come si risolvono kicker e parit\u00e0.',
    ldHeadline: 'Punti del poker \u2014 Texas Hold\u2019em',
    ldDesc: 'I dieci punti del Texas Hold\u2019em in ordine, con esempi, frequenze e regole di parit\u00e0.',
    h1: 'Punti del poker',
    lead: 'Nel Texas Hold\u2019em le mani si ordinano dalla pi\u00f9 forte alla pi\u00f9 debole come segue. Una mano \u00e8 sempre di esattamente cinque carte, scelte tra le sette che vedi\u00a0: le tue due carte coperte e le cinque comuni. Non sei mai obbligato a usare le tue \u2014 se il tavolo da solo forma le cinque migliori, quella \u00e8 anche la tua mano.',
    names: ['Scala Reale', 'Scala colore', 'Poker', 'Full', 'Colore', 'Scala', 'Tris', 'Doppia Coppia', 'Coppia', 'Carta Alta'],
    texts: [
      'A K Q J 10, tutte dello stesso seme. La mano migliore possibile\u00a0: non pu\u00f2 essere battuta, solo pareggiata.',
      'Cinque carte in sequenza, tutte dello stesso seme. Tra due scale colore vince quella con la carta pi\u00f9 alta.',
      'Quattro carte dello stesso valore. La quinta carta (il kicker) risolve il raro pareggio quando il poker \u00e8 sul tavolo.',
      'Un tris pi\u00f9 una coppia. Si confronta prima il tris, poi la coppia.',
      'Cinque carte dello stesso seme, non in sequenza. Si confrontano una a una partendo dalla pi\u00f9 alta\u00a0; nessun seme vale pi\u00f9 di un altro.',
      'Cinque carte in sequenza, semi misti. L\u2019asso vale in alto (10-J-Q-K-A) o in basso (A-2-3-4-5), mai entrambi insieme.',
      'Tre carte dello stesso valore, pi\u00f9 due carte non collegate.',
      'Due coppie diverse pi\u00f9 una quinta carta. Si confronta prima la coppia alta, poi quella bassa, poi il kicker.',
      'Due carte dello stesso valore pi\u00f9 tre carte non collegate, confrontate in ordine.',
      'Nessuno dei punti precedenti. Decide la carta pi\u00f9 alta, poi la successiva, e cos\u00ec via.'
    ],
    dealt: 'compare nel %s delle mani da sette carte',
    tiesH2: 'Come si risolvono le parit\u00e0',
    tiesP: 'Prima si confronta la categoria\u00a0: qualsiasi colore batte qualsiasi scala, quali che siano le carte. All\u2019interno della stessa categoria si confronta valore per valore partendo dall\u2019alto. Ci\u00f2 che avanza dopo la combinazione si chiama <em>kicker</em>, e decide molte pi\u00f9 mani di quante i principianti si aspettino\u00a0: A\u2660 K\u2666 e A\u2663 7\u2665 fanno entrambi coppia d\u2019assi su un tavolo A-9-4, ma il re supera il sette. I semi non risolvono mai una parit\u00e0 nell\u2019Hold\u2019em \u2014 due giocatori con gli stessi cinque valori dividono il piatto, fino all\u2019ultima fiche.',
    wrongH2: 'Gli errori pi\u00f9 comuni',
    wrong: [
      'L\u2019asso \u00e8 insieme la carta pi\u00f9 alta e la pi\u00f9 bassa di una scala\u00a0: A-K-Q-J-10 \u00e8 la migliore, A-2-3-4-5 (la <em>ruota</em>) la peggiore. La sequenza non gira \u2014 Q-K-A-2-3 non vale nulla.',
      'Un colore \u00e8 fatto di cinque carte dello stesso seme, non quattro. Quattro cuori tra la tua mano e il tavolo da soli non valgono niente.',
      'Un tris formato da una coppia in mano pi\u00f9 una carta sul tavolo si chiama <em>set</em>\u00a0; formato da una carta in mano pi\u00f9 una coppia sul tavolo si chiama <em>trips</em>. Stesso punto, forza molto diversa, perch\u00e9 il trips lo vedono tutti.',
      'Contano solo le cinque carte migliori. Con doppia coppia e una terza coppia sul tavolo hai doppia coppia, non tripla.',
      'Le percentuali qui sopra dicono quanto spesso ogni punto si forma entro il river su sette carte, non quanto spesso vince. La doppia coppia sembra banale ed \u00e8 comunque avanti alla maggior parte di ci\u00f2 che incontra.'
    ],
    seeH2: 'Vederlo al tavolo',
    seeP: 'PokerTH indica il tuo punto migliore sotto il tavolo mentre giochi, cos\u00ec non devi mai ricostruirlo con il tempo che scorre, e allo showdown mostra ogni mano scoperta con in evidenza le cinque carte che hanno contato. Allenarsi offline contro gli avversari gestiti dal computer \u00e8 il modo pi\u00f9 rapido per farsi entrare l\u2019ordine nelle dita.'
  },

  nl: {
    title: 'Pokerhanden \u2014 volgorde van de handen bij Texas Hold\u2019em',
    desc: 'Alle tien Texas Hold\u2019em-pokerhanden van royal flush tot hoge kaart, met voorbeelden, de kans op elke hand en hoe kickers en gelijke handen worden beslist.',
    ldHeadline: 'Pokerhanden \u2014 Texas Hold\u2019em',
    ldDesc: 'De tien Texas Hold\u2019em-handen op volgorde, met voorbeelden, frequenties en regels bij gelijke handen.',
    h1: 'Pokerhanden',
    lead: 'Texas Hold\u2019em-handen zijn van sterk naar zwak als volgt gerangschikt. Een hand bestaat altijd uit precies vijf kaarten, gekozen uit de zeven die je ziet\u00a0: je twee gesloten kaarten en de vijf gemeenschappelijke kaarten. Je hoeft je eigen kaarten nooit te gebruiken \u2014 als het bord zelf de beste vijf vormt, is dat ook jouw hand.',
    names: ['Royal Flush', 'Straight Flush', 'Vierling', 'Full House', 'Flush', 'Straat', 'Drieling', 'Twee Paar', 'Paar', 'Hoge Kaart'],
    texts: [
      'A K Q J 10, allemaal van dezelfde kleur. De best mogelijke hand\u00a0: hij kan niet verslagen worden, alleen ge\u00ebvenaard.',
      'Vijf opeenvolgende kaarten van dezelfde kleur. Tussen twee straight flushes wint de hoogste bovenste kaart.',
      'Vier kaarten van dezelfde waarde. De vijfde kaart (de kicker) beslist het zeldzame geval waarin de vierling op het bord ligt.',
      'Een drieling plus een paar. Eerst wordt de drieling vergeleken, daarna het paar.',
      'Vijf kaarten van dezelfde kleur, niet op volgorde. Kaart voor kaart vergeleken vanaf de hoogste\u00a0; geen enkele kleur gaat boven een andere.',
      'Vijf opeenvolgende kaarten van gemengde kleuren. De aas telt hoog (10-J-Q-K-A) of laag (A-2-3-4-5), nooit allebei tegelijk.',
      'Drie kaarten van dezelfde waarde, plus twee losse kaarten.',
      'Twee verschillende paren plus een vijfde kaart. Eerst telt het hoogste paar, dan het laagste, dan de kicker.',
      'Twee kaarten van dezelfde waarde plus drie losse kaarten, op volgorde vergeleken.',
      'Geen van bovenstaande. De hoogste kaart beslist, dan de volgende, enzovoort.'
    ],
    dealt: 'komt voor in %s van de handen van zeven kaarten',
    tiesH2: 'Hoe gelijke handen worden beslist',
    tiesP: 'Vergelijk eerst de categorie\u00a0: elke flush verslaat elke straat, ongeacht de kaarten. Binnen dezelfde categorie vergelijk je waarde voor waarde vanaf boven. Wat na de combinatie overblijft heet de <em>kicker</em>, en die beslist meer handen dan beginners verwachten\u00a0: A\u2660 K\u2666 en A\u2663 7\u2665 maken allebei een paar azen op een bord A-9-4, maar de heer verslaat de zeven. Kleuren beslissen bij Hold\u2019em nooit \u2014 twee spelers met dezelfde vijf waarden delen de pot, tot de laatste fiche.',
    wrongH2: 'Wat men vaak verkeerd heeft',
    wrong: [
      'De aas is voor een straat zowel de hoogste als de laagste kaart\u00a0: A-K-Q-J-10 is de beste, A-2-3-4-5 (het <em>wiel</em>) de zwakste. De reeks loopt niet rond \u2014 Q-K-A-2-3 is helemaal niets.',
      'Een flush bestaat uit vijf kaarten van \u00e9\u00e9n kleur, niet vier. Vier harten tussen je hand en het bord zijn op zichzelf niets waard.',
      'Een drieling uit een paar in je hand plus \u00e9\u00e9n kaart op het bord heet een <em>set</em>\u00a0; uit \u00e9\u00e9n kaart in je hand plus een paar op het bord heet het <em>trips</em>. Dezelfde rangschikking, heel andere sterkte, want trips ziet iedereen.',
      'Alleen de beste vijf tellen. Twee paar in handen en een derde paar op het bord levert twee paar op, geen drie.',
      'De percentages hierboven zeggen hoe vaak elke hand tot en met de river over zeven kaarten voorkomt, niet hoe vaak hij wint. Twee paar lijkt gewoon en staat toch voor op het meeste wat het tegenkomt.'
    ],
    seeH2: 'Aan tafel zien',
    seeP: 'PokerTH noemt je huidige beste hand onder het bord terwijl je speelt, zodat je hem nooit onder tijdsdruk zelf hoeft uit te rekenen, en toont bij de showdown elke open hand met de vijf kaarten die telden gemarkeerd. Offline oefenen tegen de computertegenstanders is de snelste manier om de volgorde in je vingers te krijgen.'
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
      rows += '<li><strong>' + p.names[i] + '</strong> \u2014 ' + p.texts[i] +
        '<br>' + sd(hands[i][2]) + ' <span style="opacity:.6">\u00b7 ' +
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
