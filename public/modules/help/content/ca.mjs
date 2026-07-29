// ── help/content/ca.mjs — Corpus d'ajuda en català ──────────────────────────
// Traducció d'en.mjs (referència). Estructura i id idèntics; només es
// tradueixen t / b / list / keys (etiquetes) / note. Els termes de pòquer
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) es mantenen
// en anglès segons la convenció de l'aplicació. Tractament: tu.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Primeres passes',
      sections: [
        { id: 'modes', t: 'Tres maneres de jugar',
          b: ['A la pantalla d\u2019inici de sessió, tria com vols jugar.'],
          list: [
            'Internet — juga en línia al servidor oficial pokerth.net, amb classificacions. Cal un compte de pokerth.net; el registre a pokerth.net és gratuït.',
            'Local / entrenament — juga fora de línia contra bots. Res a configurar, funciona sense connexió i desbloqueja trofeus a mesura que progresses.',
            'LAN / servidor propi — connecta\u2019t a un servidor PokerTH privat de la teva xarxa local o del teu ordinador.'] },
        { id: 'lan', t: 'LAN / servidor propi',
          b: ['El tercer mode es connecta a qualsevol servidor PokerTH que facis anar tu o un amic — en una xarxa domèstica, en un VPS privat, on sigui. Introdueix l\u2019adreça i el port del servidor, marca TLS si el servidor fa servir un port xifrat, i entra amb un sobrenom (l\u2019accés com a convidat funciona si el servidor ho permet). A la taula, tot es comporta després exactament com al servidor oficial.'] },
        { id: 'famboard', t: 'Classificació familiar',
          b: ['Només en servidors privats i partides LAN, el client desa estadístiques acumulades per sobrenom — mans i partides jugades i guanyades, guany més gran, millor ratxa — i les comparteix mitjançant el servidor, de manera que tots els dispositius de la taula veuen la mateixa classificació. Les partides de pokerth.net no es registren mai així, i les estadístiques del mode entrenament es guarden completament a part.'] },
        { id: 'language', t: 'Idioma',
          b: ['La interfície està disponible en 36 idiomes. Canvia\u2019l quan vulguis a les Opcions avançades (menú de l\u2019engranatge), categoria Interfície d\u2019usuari. Els termes d\u2019acció del pòquer (Fold, Check, Call, Bet, Raise, All-In) es mantenen en anglès per convenció, igual que al client d\u2019escriptori.'] },
        { id: 'pwa', t: 'Instal\u00b7la\u2019l com a aplicació',
          b: ['Aquest client és una Progressive Web App: pots instal\u00b7lar-lo des del menú del navegador (o amb el botó d\u2019instal\u00b7lació de la capçalera) i obtenir una aplicació a pantalla completa amb icona pròpia. Un cop instal\u00b7lada, s\u2019obre a l\u2019instant i el mode entrenament funciona totalment fora de línia.'],
          note: 'A Android i al Chrome/Edge d\u2019escriptori, el botó d\u2019instal\u00b7lació ho fa tot. A l\u2019iPhone/iPad, Apple només permet la instal\u00b7lació mitjançant Safari: botó Comparteix \u2192 \u00abAfegeix a la pantalla d\u2019inici\u00bb — el client mostra aquests passos quan cal. El botó desapareix un cop l\u2019aplicació està instal\u00b7lada.' },
        { id: 'platforms', t: 'Plataformes i navegadors',
          b: ['El client funciona en qualsevol navegador modern, en qualsevol sistema — Windows, macOS, Linux, Android, iOS. Algunes funcions depenen d\u2019API de navegador recents; quan falta una API, la funció s\u2019amaga o s\u2019explica en comptes de trencar-se. Les diferències principals que val la pena conèixer:'],
          list: [
            'Chrome / Edge (escriptori): tot funciona, inclosa l\u2019escriptura del registre .pdb en una carpeta.',
            'Firefox: tot excepte escriure el .pdb en una carpeta (l\u2019API encara no hi és).',
            'Safari / iOS: la instal\u00b7lació passa per Comparteix \u2192 \u00abAfegeix a la pantalla d\u2019inici\u00bb; sense vibració; pantalla completa limitada a l\u2019iPhone; el so comença després del teu primer toc.',
            'Android: compatibilitat completa als navegadors Chromium, inclosa la vibració i el comportament del botó Enrere.'] },
        { id: 'avatar', t: 'Sobrenom i avatar',
          b: ['Tria el teu sobrenom i el teu avatar a la pantalla d\u2019inici de sessió abans de connectar-te. A pokerth.net, el teu sobrenom és el nom del teu compte; els avatars es comparteixen amb els altres jugadors mitjançant el servidor d\u2019avatars.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Regles del pòquer',
      sections: [
        { id: 'basics', t: 'El Texas Hold\u2019em en poques paraules',
          b: ['PokerTH es juga en la modalitat No-Limit Texas Hold\u2019em. Cada jugador rep dues cartes tapades (hole cards). Després es col\u00b7loquen cinc cartes comunitàries cara amunt al centre de la taula. La millor mà de cinc cartes formada per qualsevol combinació de les teves dues cartes i les cinc comunitàries guanya el pot.'] },
        { id: 'blinds', t: 'Les cegues i el botó del repartidor',
          b: ['Abans de cada mà, dues apostes obligatòries alimenten el pot: la small blind i la big blind, posades pels dos jugadors a l\u2019esquerra del botó del repartidor. El botó avança una posició en sentit horari després de cada mà, de manera que tothom paga les cegues per torns. Les cegues pugen a intervals regulars al llarg de la partida.',
              'A la taula, el botó i les cegues es marquen amb fitxes: D (repartidor), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Les quatre rondes d\u2019aposta',
          list: [
            'Pre-flop — un cop repartides les cartes tapades, la primera ronda d\u2019aposta comença a l\u2019esquerra de la big blind.',
            'Flop — es revelen tres cartes comunitàries, seguides d\u2019una ronda d\u2019aposta.',
            'Turn — una quarta carta comunitària, després una altra ronda d\u2019aposta.',
            'River — la cinquena i última carta comunitària, després la ronda final d\u2019aposta.'],
          b: ['Una ronda d\u2019aposta acaba quan cada jugador que encara és a la mà ha posat la mateixa quantitat al pot (o està all-in).'] },
        { id: 'actions', t: 'Què pots fer quan et toca',
          list: [
            'Fold — abandones la mà. Les teves cartes surten i ja no disputes el pot.',
            'Check — passes sense apostar. Només és possible quan no hi ha res a pagar.',
            'Call — iguales l\u2019aposta en curs.',
            'Bet — obres les apostes quan encara ningú no ha apostat en aquest street.',
            'Raise — puges per sobre d\u2019una aposta existent. La pujada mínima equival a l\u2019aposta o pujada anterior.',
            'All-In — hi poses tota la teva pila. Continues a la mà fins a la quantitat que has cobert.'] },
        { id: 'showdown', t: 'Showdown i pots dividits',
          b: ['Si després de la ronda d\u2019aposta del river queden diversos jugadors, es mostren les mans i guanya la millor — la combinació guanyadora apareix sota les cartes comunitàries. Quan un jugador va all-in per menys que les apostes senceres, es formen pots secundaris: cada jugador només pot guanyar la part del pot a la qual ha contribuït. Les mans empatades es reparteixen el pot.'] },
        { id: 'hands', t: 'Jerarquia de les mans',
          b: ['De la més feble a la més forta:'],
          list: [
            '1. High Card — cap combinació; decideix la carta més alta.',
            '2. Pair — dues cartes del mateix valor.',
            '3. Two Pair — dues parelles diferents.',
            '4. Three of a Kind — tres cartes del mateix valor.',
            '5. Straight — cinc cartes consecutives (l\u2019as compta alt o baix).',
            '6. Flush — cinc cartes del mateix pal.',
            '7. Full House — un trio més una parella.',
            '8. Four of a Kind — quatre cartes del mateix valor.',
            '9. Straight Flush — una escala, tota del mateix pal.',
            '10. Royal Flush — del deu a l\u2019as en un sol pal. La millor mà possible.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'La pantalla de joc',
      sections: [
        { id: 'actionbar', t: 'La barra d\u2019accions',
          b: ['Quan et toca, la barra d\u2019accions de baix s\u2019il\u00b7lumina amb fins a quatre botons: Fold (vermell), Check / Call (blau), Bet / Raise (verd — l\u2019acció principal, destacada) i All-In (vermell fosc). El botó Check / Call mostra la quantitat exacta que cal pagar; Bet / Raise mostra la quantitat que estàs a punt de posar. Després del river, All-In es pot convertir en un botó Show per ensenyar les teves cartes.'] },
        { id: 'betctl', t: 'Tria la teva aposta',
          b: ['Ajusta la quantitat de la pujada amb el camp numèric, el control lliscant o els botons ràpids 1/3 \u00b7 1/2 \u00b7 Pot (fraccions del pot actual). Les quantitats s\u2019arrodoneixen automàticament i es mantenen entre la pujada mínima i la màxima permeses. Si prefereixes pensar en big blinds, una opció mostra totes les quantitats en BB en comptes de fitxes.'] },
        { id: 'preselect', t: 'Preseleccionar una acció',
          b: ['Abans del teu torn pots carregar una acció per endavant: toca un botó i rep una vora daurada amb un puntet daurat. Quan arriba el teu torn, l\u2019acció s\u2019executa immediatament. Un Fold carregat es converteix automàticament en Check quan el check és gratuït — mai no abandones de franc. Les preseleccions es reinicien a cada mà nova, a cada canvi de street i al showdown, i s\u2019anul\u00b7len si la situació canvia (per exemple, si canvia la quantitat a pagar).'] },
        { id: 'automodes', t: 'Modes automàtics',
          b: ['El menú desplegable al costat dels botons d\u2019acció ofereix tres modes de joc: Manual, Auto Check/Call i Auto Check/Fold. Els modes automàtics juguen per tu fins que tornis enrere — qualsevol clic manual sobre una acció torna immediatament al Manual.'] },
        { id: 'readtable', t: 'Llegir la taula',
          b: ['Cada caixa de jugador mostra l\u2019avatar, el nom, la pila i l\u2019aposta en curs. El repartidor i les cegues es marquen amb fitxes D / SB / BB. Una insígnia de color a la caixa indica l\u2019última acció del jugador; una barra blava fina compta enrere el seu temps de reflexió. La caixa del jugador a qui toca s\u2019il\u00b7lumina; la teva pròpia caixa rep un marc daurat que batega quan et toca a tu.',
              'La barra d\u2019estat sobre la taula mostra el pot total, les apostes del street en curs, la fase (Pre-flop, Flop, Turn, River) i els números de partida i de mà. Els jugadors que han abandonat tenen les cartes translúcides; els eliminats queden enfosquits. Al final d\u2019una mà, una finestra de guanyador pot resumir qui ha guanyat què — es pot desactivar a les opcions.'] },
        { id: 'seatlayout', t: 'Disposició dels seients',
          b: ['Com a extensió web, la disposició de les caixes de jugador es tria a Opcions avançades \u2192 Seients: Automàtica segueix el client oficial (posicions fixes en vertical, el\u00b7lipse calculada en horitzontal), o força la disposició Vertical o Horitzontal — i Personalitzada et deixa col\u00b7locar cada seient tu mateix: apareix un mode d\u2019edició on arrossegues cada caixa exactament on vulguis, i la disposició es desa.'] },
        { id: 'zoom', t: 'Zoom de la taula (mòbils)',
          b: ['En pantalles petites, els botons de lupa amplien la taula (2\u00d7) i la pots arrossegar amb el dit — la teva caixa i la barra d\u2019accions es queden fixes. La vista segueix automàticament el seient actiu i s\u2019allunya al showdown per veure el conjunt. Es pot desactivar a les Opcions avançades.'],
          note: 'A mòbils i tauletes, el zoom de pessic del navegador està bloquejat per defecte perquè un gest de zoom no s\u2019activi mai per accident enmig d\u2019una mà; torna\u2019l a activar a Opcions avançades \u2192 Interfície d\u2019usuari si ho prefereixes.' },
        { id: 'protections', t: 'Protecció antiespieta i anti-Call accidental',
          b: ['Dues proteccions opcionals: la protecció antiespieta manté les teves cartes tapades fins que les toques (útil quan algú pot veure la teva pantalla), i la protecció anti-Call accidental bloqueja un moment el botó Call just després d\u2019una pujada gran, perquè un toc destinat a un Call més petit no caigui per accident sobre la quantitat pujada. Totes dues són a les Opcions avançades.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'El panell d\u2019informació',
      sections: [
        { id: 'open', t: 'Obrir el panell',
          b: ['Durant una partida, el panell d\u2019informació s\u2019obre des de la capçalera (o Alt+L / Alt+I) i té tres pestanyes: Registre, Probabilitats i Estadístiques. Al mòbil sura sobre la taula; en pantalles més grans és una finestra que es pot moure i redimensionar — agafa la nansa \u28ff per moure-la, les vores per canviar-ne la mida. La posició es recorda.'] },
        { id: 'log', t: 'Registre de la partida',
          b: ['La pestanya Registre anota tota la partida mà per mà: les cegues, cada acció amb les quantitats, les cartes mostrades i els guanyadors, tot acolorit per llegir-ho de pressa. El botó d\u2019exportació desa el registre en un fitxer si vols repassar una sessió més tard.'] },
        { id: 'odds', t: 'Probabilitats (monitor de probabilitats)',
          b: ['La pestanya Probabilitats mostra, per a la teva mà actual, la probabilitat en directe d\u2019acabar amb cadascuna de les 10 categories de mans — de High Card a Royal Flush — cadascuna amb la seva icona, el seu percentatge i la seva barra. La visualització s\u2019enfosqueix així que abandones. Només fa servir les teves cartes i les comunitàries: no veu res que els rivals no ensenyin.'] },
        { id: 'journal', t: 'Registres de mans i la finestra \u00abRegistres\u00bb',
          b: ['A més del registre en directe, cada mà que jugues es desa localment al teu navegador, en el mateix format que els fitxers de registre .pdb del client oficial. La finestra Registres (Opcions avançades \u2192 Missatges de registre \u2192 Gestiona els registres\u2026) llista les teves sessions i et permet treballar-hi: previsualitzar una sessió amb cerca i ressaltat, filtrar per partida, exportar a HTML o text pla, desar el fitxer .pdb en brut, o importar un .pdb enregistrat pel client d\u2019escriptori. Les sessions s\u2019esborren d\u2019una en una o totes de cop (amb confirmació), i una retenció automàtica pot conservar només els últims 7, 30, 90, 180 o 365 dies. Els registres que importeu no s\u2019eliminen mai automàticament.',
              'El botó Analitza executa una anàlisi de mans sobre una sessió i pot enviar un registre al servei d\u2019anàlisi de pokerth.net. Tot es queda al teu dispositiu fins que exportes o envies explícitament.'] },
        { id: 'logopts', t: 'Opcions de registre',
          b: ['A Opcions avançades \u2192 Missatges de registre pots activar o desactivar l\u2019enregistrament i triar l\u2019interval d\u2019escriptura (després de cada acció, o un cop per mà), com als paràmetres del client d\u2019escriptori. Una opció addicional escriu el fitxer .pdb directament en una carpeta que triïs i l\u2019actualitza després de cada mà — exactament com fa el client d\u2019escriptori, perquè altres eines el puguin llegir en directe.'],
          note: 'Escriure en una carpeta local requereix l\u2019API File System Access: només Chrome i Edge d\u2019escriptori. Firefox, Safari i els navegadors mòbils no poden — l\u2019opció mostra llavors una explicació breu, i l\u2019exportació manual des de la finestra Registres continua disponible a tot arreu.' },
        { id: 'assist', t: 'Assistència (força de la mà)',
          b: ['A dalt de la pestanya Probabilitats, la franja d\u2019assistència et llegeix la mà. Abans del flop anomena la teva mà inicial i la puntua amb estrelles; a partir del flop mostra la teva millor combinació actual i, després d\u2019una simulació ràpida, la teva probabilitat estimada de guanyar la mà en percentatge, amb un indicador de color del vermell (feble) al verd (forta). Com el monitor de probabilitats, només fa servir informació que pots veure.',
              'Hi ha dos estils de visualització a Opcions avançades \u2192 Seients: Segments (deu blocs) o una barra de progrés clàssica. Tota l\u2019assistència es pot desactivar a Opcions avançades \u2192 Assistència.'] },
        { id: 'assistwin', t: 'L\u2019assistència com a giny flotant',
          b: ['El bloc d\u2019assistència es pot separar del panell en una petita finestra pròpia sempre al davant: fes servir el botó de separació del bloc, després mou-la i redimensiona-la on vulguis sobre la taula — pràctic per vigilar la força de la mà sense tot el panell obert. El botó d\u2019acoblament la torna a la pestanya Probabilitats, i la posició es recorda. Dins el panell, una nansa d\u2019arrossegament entre l\u2019Assistència i les probabilitats et permet repartir l\u2019espai entre totes dues.'] },
        { id: 'stats', t: 'Estadístiques',
          b: ['La pestanya Estadístiques fa el seguiment de la teva sessió: mans jugades, flops vistos, showdowns, taxes de victòria i més. El seguiment estadístic es pot desactivar a les Opcions avançades.'] },
        { id: 'hud', t: 'HUD d\u2019estadístiques als seients (beta)',
          b: ['El HUD enganxa al costat del seient de cada jugador una petita caixa d\u2019estadístiques, construïda amb les mans enregistrades als teus registres: nombre de mans observades, després VPIP (amb quina freqüència posa diners voluntàriament pre-flop), PFR (pujades pre-flop), AF (factor d\u2019agressivitat), 3B (3-bet), CB (continuation bet) i F3B (fold davant un 3-bet), amb codis de color del passiu a l\u2019agressiu. Toca una caixa per obtenir una finestra emergent detallada amb més xifres (intents de robatori, fold davant robatori, taxes de showdown\u2026), i arrossega-la si tapa alguna cosa.',
              'El HUD només sap el que has vist a les teves pròpies taules — llegeix els teus registres locals de mans, així que l\u2019enregistrament ha d\u2019estar activat i les xifres només tenen sentit després de prou mans. És una funció beta, desactivada per defecte: activa-la a Opcions avançades \u2192 Assistència.'] },
        { id: 'handsbtn', t: 'Resum de les combinacions',
          b: ['La icona de mans de pòquer sobre el tapet obre en qualsevol moment un resum ràpid de les 10 combinacions — pràctic mentre aprens. Es pot amagar a les Opcions avançades.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Xat i social',
      sections: [
        { id: 'panels', t: 'Xat del vestíbul i xat de la taula',
          b: ['Hi ha un xat al vestíbul i un altre a la taula. Al mòbil, el xat de la taula sura sobre el joc; en pantalles més grans és una finestra que es pot moure i redimensionar. Una insígnia al botó de xat compta els missatges no llegits.'] },
        { id: 'typing', t: 'Ajudes d\u2019escriptura',
          list: [
            'El tabulador completa un sobrenom — torna a prémer el tabulador per recórrer les coincidències.',
            '\u2191 / \u2193 recorren l\u2019historial dels teus missatges.',
            'El botó d\u2019emoji obre un selector complet; escriure : també suggereix emotes mentre escrius.'] },
        { id: 'emotes', t: 'Emotes i cares',
          b: ['El xat converteix els codis d\u2019emote exactament com el client d\u2019escriptori oficial: escriu un nom entre dos punts i es converteix en l\u2019emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 s\u2019admeten més de 1.900 codis (el conjunt complet de GitHub). Les cares de text clàssiques també es converteixen: :-) ;) :D xD :P <3 i unes vuitanta més.',
              'Escriure : obre un quadre de suggeriments que completa el codi mentre escrius (\u2191/\u2193 per triar, tabulador o Retorn per acceptar). La conversió d\u2019emojis es pot desactivar del tot a Opcions avançades \u2192 Xat.'] },
        { id: 'commands', t: 'Ordres del xat',
          b: ['El xat entén ordres amb barra. Dues són visibles per als altres:'],
          keys: [
            ['/me <text>', 'Missatge d\u2019acció, es mostra com \u00ab* elteusobrenom text\u00bb'],
            ['/emoji <emoji>', 'Reprodueix una reacció d\u2019emoji (la mateixa que envia el selector de reaccions)']] },
        { id: 'diagcmds', t: 'Ordres de diagnòstic',
          b: ['Tota la resta és local: només tu veus les respostes i no s\u2019envia res a la taula. Escriu /help per llistar-les totes. Les més útils:'],
          keys: [
            ['/help', 'Llista totes les ordres'],
            ['/update', 'Comprova si hi ha versió nova i recarrega'],
            ['/lang <codi>', 'Canvia d\u2019idioma (p. ex. /lang ca)'],
            ['/sound on|off', 'Activa/silencia els sons del joc'],
            ['/zoom', 'Commuta la lupa de la taula'],
            ['/clear', 'Buida el xat localment'],
            ['/table', 'Informació de la partida actual (cegues, jugadors, piles)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnòstics d\u2019estat del client, xarxa i fluïdesa'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Depuració avançada (cartes, protocol, àudio, emmagatzematge, seients)'],
            ['/copy', 'Copia l\u2019última resposta d\u2019ordre al porta-retalls']] },
        { id: 'reactions', t: 'Reaccions d\u2019emoji',
          b: ['El botó de reaccions obre un selector amb 30 reaccions animades (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) que es reprodueixen amb un efecte sobre el teu seient, visibles per a tota la taula — inclosos els jugadors del client d\u2019escriptori. Les reaccions es poden desactivar del tot a les Opcions avançades.'] },
        { id: 'translate', t: 'Entendre tothom',
          b: ['Amb la traducció del xat activada, cada missatge rep un botó de traducció que el mostra en el teu idioma, mitjançant el traductor del navegador. Les abreviacions habituals de taula (gg, nh, utg\u2026) s\u2019expliquen en un consell en passar-hi per sobre — totes dues opcions són a Opcions avançades \u2192 Xat.'],
          note: 'La traducció fa servir el servei Google Translate i funciona en qualsevol navegador — només cal connexió a Internet. Un missatge només s\u2019envia al servei de traducció quan en toques el botó de traducció, mai automàticament.' },
        { id: 'social', t: 'Jugadors: perfil, convidar, ignorar',
          b: ['Toca qualsevol jugador — a la taula o a la llista del vestíbul — per obrir-ne la fitxa: perfil i estadístiques, convidar-lo a la teva partida, o ignorar-lo (els seus missatges de xat s\u2019amaguen; ignorar es pot desfer en qualsevol moment). Es pot activar una confirmació abans de convidar/ignorar a les opcions.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Vestíbul i partides',
      sections: [
        { id: 'list', t: 'La llista de partides',
          b: ['El vestíbul llista totes les taules del servidor. Cada entrada mostra el nombre de jugadors, el tipus de partida, un cadenat quan cal contrasenya o invitació, i una insígnia d\u2019estat: \u00abEsperant\u00bb (verd — la partida no ha començat, t\u2019hi pots afegir si hi ha lloc lliure), \u00abEn curs\u00bb (color càlid — es pot veure en directe quan s\u2019admeten espectadors) i \u00abTancada\u00bb (atenuada). Una taula plena es reconeix simplement pel comptador ple, com 10/10; els colors de les insígnies segueixen el tema actiu.',
              'El desplegable de filtre estreny la llista exactament com el client d\u2019escriptori, amb cada opció més estricta que l\u2019anterior: només partides obertes \u2192 amagant també les taules plenes \u2192 després només les no privades, només les privades, o només les partides de classificació. La teva tria es recorda. El camp de cerca troba una partida pel nom, i la insígnia de jugadors obre la llista de tothom qui és en línia, amb cerca i ordenació.'] },
        { id: 'join', t: 'Unir-s\u2019hi i mirar',
          b: ['Selecciona una partida oberta i uneix-t\u2019hi — un cadenat indica que cal contrasenya. Les partides en curs que admeten espectadors es poden mirar en directe: veus la taula i el xat, però les cartes tapades es queden amagades i no pots actuar.'] },
        { id: 'gameinfo', t: 'Informació de la partida',
          b: ['Abans d\u2019unir-t\u2019hi, la fitxa d\u2019informació de la partida mostra tot el que defineix la taula: tipus de partida, cegues i la seva progressió (doblatge o llista manual), pila inicial, temps d\u2019acció, pausa entre mans, i qui ja hi seu.'] },
        { id: 'create', t: 'Crear una partida',
          b: ['Crea la teva pròpia taula: nom, nombre de jugadors, pila inicial, primera small blind i calendari de pujades, temps d\u2019acció, i si s\u2019admeten espectadors. Hi ha quatre tipus de partida: Normal (tothom), només jugadors registrats, només amb invitació, i De classificació (compta per a la classificació oficial — sense contrasenya possible en aquest cas). Els teus paràmetres preferits es poden desar i tornar a carregar.'] },
        { id: 'invites', t: 'Invitacions',
          b: ['Els jugadors et poden convidar a la seva taula; reps una notificació que pots acceptar o rebutjar. Ser convidat és l\u2019única manera d\u2019entrar en una partida només amb invitació.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'El teu compte',
          b: ['El servidor oficial d\u2019Internet és pokerth.net. Jugar-hi requereix un compte gratuït de pokerth.net — registra\u2019t al lloc web i després entra aquí amb el mateix sobrenom i la mateixa contrasenya. Aquest client web es connecta exactament al mateix servidor que el client d\u2019escriptori: els mateixos comptes, les mateixes taules, les mateixes classificacions, i pots seure en una taula amb jugadors del client d\u2019escriptori.'] },
        { id: 'ranked', t: 'Partides de classificació i temporades',
          b: ['Les partides del tipus De classificació compten per a la classificació oficial de la temporada. El teu perfil dins l\u2019aplicació mostra la data de registre, el teu Rank de la temporada actual, la teva Score, la teva mitjana i les partides jugades, a més dels darrers resultats. Les partides normals (sense classificació) són només per divertir-se i no canvien res.'] },
        { id: 'rankhow', t: 'Com es calcula la classificació',
          b: ['A cada partida classificada el teu lloc dona punts: 15 per al primer, després 9, 6, 4, 3, 2 i 1 fins al setè; del vuitè al desè, res. Una taula reparteix, doncs, 40 punts en total.',
              'La teva Score no és la suma d\u2019aquests punts, sinó la teva mitjana per partida, atenuada per un factor que creix amb el nombre de partides jugades: uns quants bons resultats no basten per instal·lar-se a dalt, també cal regularitat — com més jugues, més s\u2019acosta la teva Score a la teva mitjana real. Les temporades duren un trimestre: en el canvi tot s\u2019arxiva i els comptadors tornen a zero, mentre que les temporades passades continuen consultables. En partida, el botó del podi mostra la classificació de temporada dels jugadors de la teva taula.'],
          note: 'El barem i la fórmula exacta els fixa el servidor de classificació de pokerth.net i poden canviar; les pàgines del lloc són la referència.' },
        { id: 'rankings', t: 'Pàgines de classificació',
          b: ['L\u2019entrada de classificació obre la classificació oficial de PokerTH, amb cerca per jugador, i també les classificacions de la comunitat (BBC, WEC). Si les classificacions no t\u2019interessen, l\u2019entrada es pot amagar a Opcions avançades \u2192 Comunitat.'] },
        { id: 'cups', t: 'Les copes de la comunitat: BBC i WeCup',
          b: ['Dues comunitats organitzen les seves pròpies competicions a pokerth.net, cadascuna amb el seu lloc web i la seva classificació. La Best Brainies Cup (BBC) és un torneig per etapes nascut el 2013: es progressa del Step 1 al Step 4, i una nova temporada comença després de cada partida de Step 4, quan es lliura la copa. La WeCup (WEC) té el seu propi barem, molt més repartit — 75 punts per al primer lloc, després 45, 30, 20… — i la seva score normalitza la teva mitjana segons el nombre de partides que has jugat en comparació amb els altres membres.',
              'Totes dues classificacions s\u2019obren des del botó del trofeu, al costat de la classificació de PokerTH. Els ajustos de taula d\u2019aquestes competicions vénen com a predefinits en crear una partida (BBC Step 1 a 4, WEC, WEC Monthly Final i WEC Grand Final), així que pots entrenar en les mateixes condicions. Participar-hi demana registrar-se al lloc de la copa corresponent.'],
          note: 'Aquests continguts s\u2019amaguen de cop a Opcions avançades → Comunitat si les copes no t\u2019interessen.' },
        { id: 'forumcups', t: 'Copes del fòrum i esdeveniments',
          b: ['El fòrum de pokerth.net acull també la Monthly Cup, una sèrie mensual on els jugadors es reparteixen en taules Gold, Silver i Bronze abans de coronar el campió del mes, a més de copes especials puntuals al llarg de l\u2019any.',
              'Inscripcions, horaris, ajustos de taula i resultats es publiquen al fòrum, i les partides es juguen al servidor oficial com qualsevol altra. Amb un compte de pokerth.net n\u2019hi ha prou per seguir els resultats; apuntar-se a una copa passa pel fil del fòrum corresponent.'] },
        { id: 'avatars', t: 'Avatars i banderes',
          b: ['A pokerth.net, el teu avatar es distribueix als altres jugadors mitjançant el servidor d\u2019avatars, i pot aparèixer una petita bandera del país a les caixes de jugador. Totes dues coses són opcionals i configurables a les opcions.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Mode entrenament',
      sections: [
        { id: 'what', t: 'Què és',
          b: ['El mode Local / entrenament és una partida completa contra rivals controlats per l\u2019ordinador: sense connexió, sense compte, sense res en joc. Un cop instal\u00b7lada l\u2019aplicació (o fins i tot només visitada un cop), funciona totalment fora de línia — perfecte per aprendre el joc, provar la interfície o passar l\u2019estona en mode avió.'] },
        { id: 'setup', t: 'Preparar una partida',
          b: ['Tria el nombre de rivals, la pila inicial, les cegues i la seva progressió, i la velocitat del joc. La composició i la dificultat dels bots s\u2019ajusten a Opcions avançades \u2192 Partida local — des de rivals suaus fins a una taula més dura i variada.'] },
        { id: 'trophies', t: 'Trofeus',
          b: ['El mode entrenament té la seva pròpia progressió: 28 trofeus en sis categories (progressió, tècnica, estil, formats, diversió i una de secreta) es desbloquegen jugant — mans jugades, partides guanyades, grans bluffs, mans especials i més. La teva progressió de trofeus és acumulativa i es fusiona entre dispositius quan la sincronització de paràmetres del compte està activa.'] },
        { id: 'learn', t: 'Un bon lloc per aprendre',
          b: ['Tot el que es descriu als altres capítols també funciona aquí: el monitor de probabilitats, la visualització d\u2019assistència, la preselecció, les dreceres de teclat. El mode entrenament és el millor lloc per provar-los sense pressió abans de llançar-te a pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Estil i so',
      sections: [
        { id: 'themes', t: 'Temes',
          b: ['La categoria Estil de les Opcions avançades vesteix tot el client. Els predefinits ho configuren tot amb un toc (el clàssic casino verd, l\u2019aspecte oficial de PokerTH\u2026); a sota, eixos individuals ajusten per separat la paleta de colors, el tapet de la taula i les cares de les cartes — canvia qualsevol eix i la teva barreja es converteix en un tema personalitzat. El mode fosc, clar o automàtic es tria a Interfície d\u2019usuari, i les teves tries s\u2019apliquen a l\u2019instant, a totes les pantalles, i es recorden.'] },
        { id: 'tablelook', t: 'Taules, baralles, seients',
          b: ['Més enllà del tema, diversos elements es poden canviar de manera independent: el fons de la taula, la baralla, el revers de les cartes (a joc amb la baralla automàticament, o importa la teva pròpia imatge), les fitxes de repartidor i cegues, l\u2019estil dels botons d\u2019acció, i paquets de seients complets que revesteixen les caixes de jugador. Tria-ho tot a Opcions avançades \u2192 Estil; els canvis es veuen a l\u2019instant a la taula.'] },
        { id: 'music', t: 'Reproductor de música',
          b: ['L\u2019entrada de música dels menús de capçalera obre un petit reproductor de música ambiental: tria una pista de la llista, reprodueix/pausa, anterior/següent, aleatori, i repetició d\u2019una pista, de tota la llista o de res. El volum, la pista triada i el mode de repetició es recorden. La reproducció no comença mai sola — els navegadors exigeixen un toc — i el reproductor és totalment independent dels efectes de so del joc.'] },
        { id: 'sounds', t: 'Efectes de so',
          b: ['Els sons del joc s\u2019agrupen en quatre categories activables per separat, igual que al client d\u2019escriptori: accions de joc (cartes repartides, Check, Call, Raise, et toca\u2026), notificació del xat del vestíbul, notificacions de partida en xarxa (jugador connectat, partida a punt) i notificació de pujada de cegues. Un únic control de volum les governa totes, a Opcions avançades \u2192 So.'],
          note: 'Tots els navegadors — l\u2019iOS especialment — es neguen a reproduir so abans que hagis tocat la pàgina un cop. Si una partida comença en silenci, un sol toc a qualsevol lloc desperta el so; el client també repara automàticament el motor d\u2019àudio quan l\u2019iOS el suspèn (trucada entrant, segon pla\u2026).' },
        { id: 'voice', t: 'Veu i vibració',
          b: ['Dos canals addicionals et poden mantenir informat sense mirar la pantalla: els anuncis de veu llegeixen en veu alta els esdeveniments del joc mitjançant la síntesi de veu del dispositiu, i al mòbil una vibració curta pot marcar el teu torn. Tots dos són extensions web, activats o no per defecte segons el dispositiu, a Opcions avançades \u2192 Apostes i torn.'],
          note: 'La vibració funciona a Android (navegadors Chromium); Apple no ofereix una API de vibració als llocs web, així que els iPhone no poden vibrar. Els anuncis de veu funcionen a tot arreu, però les veus i els idiomes disponibles depenen del teu sistema — el client fa servir la millor coincidència que troba.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opcions i dreceres',
      sections: [
        { id: 'where', t: 'On viuen les opcions',
          b: ['Les Opcions avançades s\u2019obren des de l\u2019entrada de l\u2019engranatge de qualsevol menú de capçalera. Estan agrupades com al client d\u2019escriptori: Interfície d\u2019usuari, Estil, So, Partida local, Partida en xarxa, Partida per Internet, Sobrenoms / Avatars, Missatges de registre, i Restaura els valors per defecte. Cada funció específica del web hi té el seu propi interruptor, així pots desactivar tot allò que no facis servir.'] },
        { id: 'cfgxml', t: 'Intercanviar paràmetres amb el client d\u2019escriptori',
          b: ['Els teus paràmetres poden viatjar entre clients: la categoria Missatges de registre ofereix exportació/importació del fitxer oficial config.xml (aquell \u007e/.pokerth/config.xml que fan servir els clients d\u2019escriptori i QML). L\u2019exportació escriu els paràmetres compartits — nom, opcions de visualització, sons, preferències de taula, cegues, estils — i la importació aplica aquí un fitxer de l\u2019escriptori. Els paràmetres que aquest client no coneix es conserven intactes al fitxer.'] },
        { id: 'sync', t: 'Paràmetres que et segueixen',
          b: ['Quan jugues amb un compte, les teves opcions, el teu tema, les teves assignacions de tecles, el teu idioma i els teus trofeus d\u2019entrenament se sincronitzen: canvia alguna cosa en un dispositiu i el següent dispositiu on entris ho recollirà. La progressió de trofeus es fusiona, mai no se sobreescriu, així que jugar en dos dispositius conserva sempre el millor de tots dos.'] },
        { id: 'updates', t: 'Mantenir-se al dia',
          b: ['El client s\u2019actualitza sol: quan es publica una versió nova, un bàner et convida a recarregar (o escriu /update al xat per comprovar-ho manualment). De tant en tant pot aparèixer una petita enquesta de producte que et demana l\u2019opinió sobre una funció — la participació és opcional, i les enquestes es poden desactivar del tot a Opcions avançades \u2192 Comunitat.'] },
        { id: 'fkeys', t: 'Dreceres de teclat oficials',
          b: ['Les tecles de funció oficials de PokerTH funcionen durant una partida:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (l\u2019ordre es pot invertir a les opcions)'],
            ['F5', 'Mostra les teves cartes (quan és possible)'],
            ['F6 / F7 / F8', 'Manual \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manual \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Xat \u00b7 Registre \u00b7 Panell de probabilitats'],
            ['F11', 'Pantalla completa']],
          note: 'Les dreceres requereixen un teclat físic. Al Mac, les tecles F controlen els multimèdia per defecte: mantén Fn premuda (o activa \u00abUtilitza les tecles F1, F2, etc. com a tecles de funció estàndard\u00bb als paràmetres del macOS). A l\u2019iPhone, la pantalla completa està limitada per l\u2019iOS — instal\u00b7lar l\u2019aplicació com a PWA dona la mateixa experiència de pantalla completa.' },
        { id: 'webkeys', t: 'Tecles de lletra web',
          b: ['Extensió web: les tecles d\u2019una sola lletra també disparen les accions i es poden reassignar a Opcions avançades \u2192 Dreceres de teclat:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Esc', 'Tanca la finestra del davant (també el botó Enrere d\u2019Android)']],
          note: 'A Android, el botó/gest Enrere del sistema tanca les finestres com Esc, en comptes de sortir de la partida (configurable a les opcions). L\u2019iOS no té cap botó de sistema equivalent — fes servir la \u2715 de cada finestra.' }
      ]
    }
  ]
};
