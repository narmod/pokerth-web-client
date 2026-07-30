// ── help/content/gl.mjs — Corpus de axuda en galego ─────────────────────────
// Tradución de en.mjs (referencia). Estrutura e id idénticos; só se traducen
// t / b / list / keys (etiquetas) / note. Os termos de póker (Fold, Check,
// Call, Bet, Raise, All-In, flop, turn, river…) mantéñense en inglés segundo
// a convención da aplicación. Tratamento: ti.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Primeiros pasos',
      sections: [
        { id: 'modes', t: 'Tres maneiras de xogar',
          b: ['Na pantalla de acceso, escolle como queres xogar.'],
          list: [
            'Internet — xoga en liña no servidor oficial pokerth.net, con clasificacións. Fai falta unha conta de pokerth.net; o rexistro en pokerth.net é de balde.',
            'Local / adestramento — xoga sen conexión contra bots. Nada que configurar, funciona sen rede e desbloquea trofeos a medida que progresas.',
            'LAN / servidor propio — conéctate a un servidor PokerTH privado da túa rede local ou do teu propio computador.'] },
        { id: 'lan', t: 'LAN / servidor propio',
          b: ['O terceiro modo conéctase a calquera servidor PokerTH que teñas ti ou un amigo en funcionamento — nunha rede doméstica, nun VPS privado, onde sexa. Introduce o enderezo e o porto do servidor, marca TLS se o servidor usa un porto cifrado, e accede cunha alcume (o acceso como convidado funciona se o servidor o permite). Na mesa, todo se comporta despois exactamente como no servidor oficial.'] },
        { id: 'famboard', t: 'Clasificación familiar',
          b: ['Só en servidores privados e partidas LAN, o cliente garda estatísticas acumuladas por alcume — mans e partidas xogadas e gañadas, maior ganancia, mellor racha — e compárteas a través do servidor, de xeito que cada dispositivo arredor da mesa vexa a mesma clasificación. As partidas de pokerth.net nunca se rexistran así, e as estatísticas do modo adestramento gárdanse completamente á parte.'] },
        { id: 'language', t: 'Idioma',
          b: ['A interface está dispoñible en 36 idiomas. Cámbiao cando queiras nas Opcións avanzadas (menú da engrenaxe), categoría Interface de usuario. Os termos de acción do póker (Fold, Check, Call, Bet, Raise, All-In) manteñen o inglés por convención, igual ca no cliente de escritorio.'] },
        { id: 'pwa', t: 'Instálao como aplicación',
          b: ['Este cliente é unha Progressive Web App: podes instalalo desde o menú do navegador (ou co botón de instalación da cabeceira) e obter unha aplicación a pantalla completa coa súa propia icona. Unha vez instalada, ábrese ao instante e o modo adestramento funciona totalmente sen conexión.'],
          note: 'En Android e no Chrome/Edge de escritorio, o botón de instalación faino todo. No iPhone/iPad, Apple só permite a instalación a través de Safari: botón Compartir \u2192 \u00abEngadir á pantalla de inicio\u00bb — o cliente amosa estes pasos cando cómpre. O botón desaparece unha vez instalada a aplicación.' },
        { id: 'platforms', t: 'Plataformas e navegadores',
          b: ['O cliente funciona en calquera navegador moderno, en calquera sistema — Windows, macOS, Linux, Android, iOS. Algunhas funcións dependen de API de navegador recentes; cando falta unha API, a función agóchase ou explícase en vez de romper. As diferenzas principais que convén coñecer:'],
          list: [
            'Chrome / Edge (escritorio): funciona todo, incluída a escritura do rexistro .pdb nun cartafol.',
            'Firefox: todo agás escribir o .pdb nun cartafol (a API aínda non está dispoñible).',
            'Safari / iOS: a instalación pasa por Compartir \u2192 \u00abEngadir á pantalla de inicio\u00bb; sen vibración; pantalla completa limitada no iPhone; o son comeza tras o teu primeiro toque.',
            'Android: compatibilidade completa nos navegadores Chromium, incluída a vibración e o comportamento do botón Atrás.'] },
        { id: 'avatar', t: 'Alcume e avatar',
          b: ['Escolle o teu alcume e o teu avatar na pantalla de acceso antes de conectarte. En pokerth.net, o teu alcume é o nome da túa conta; os avatares compártense cos demais xogadores a través do servidor de avatares.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Regras do póker',
      sections: [
        { id: 'basics', t: 'O Texas Hold\u2019em en poucas palabras',
          b: ['PokerTH xógase na modalidade No-Limit Texas Hold\u2019em. Cada xogador recibe dúas cartas tapadas (hole cards). Despois colócanse cinco cartas comunitarias boca arriba no centro da mesa. A mellor man de cinco cartas formada por calquera combinación das túas dúas cartas e das cinco comunitarias gaña o bote.'] },
        { id: 'blinds', t: 'As cegas e o botón do repartidor',
          b: ['Antes de cada man, dúas apostas obrigatorias alimentan o bote: a small blind e a big blind, postas polos dous xogadores á esquerda do botón do repartidor. O botón avanza unha posición en sentido horario despois de cada man, de xeito que todos pagan as cegas por quendas. As cegas soben a intervalos regulares ao longo da partida.',
              'Na mesa, o botón e as cegas márcanse con fichas: D (repartidor), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'As catro roldas de aposta',
          list: [
            'Pre-flop — unha vez repartidas as cartas tapadas, a primeira rolda de aposta comeza á esquerda da big blind.',
            'Flop — revélanse tres cartas comunitarias, seguidas dunha rolda de aposta.',
            'Turn — unha cuarta carta comunitaria, despois outra rolda de aposta.',
            'River — a quinta e última carta comunitaria, despois a rolda final de aposta.'],
          b: ['Unha rolda de aposta remata cando cada xogador que segue na man puxo a mesma cantidade no bote (ou está all-in).'] },
        { id: 'actions', t: 'Que podes facer cando che toca',
          list: [
            'Fold — abandonas a man. As túas cartas saen e xa non disputas o bote.',
            'Check — pasas sen apostar. Só é posible cando non hai nada que pagar.',
            'Call — igualas a aposta en curso.',
            'Bet — abres as apostas cando aínda ninguén apostou neste street.',
            'Raise — subes por riba dunha aposta existente. A suba mínima equivale á aposta ou suba anterior.',
            'All-In — pos toda a túa pila. Segues na man ata a cantidade que cubriches.'] },
        { id: 'showdown', t: 'Showdown e botes divididos',
          b: ['Se tras a rolda de aposta do river quedan varios xogadores, amósanse as mans e gaña a mellor — a combinación gañadora aparece baixo as cartas comunitarias. Cando un xogador vai all-in por menos que as apostas completas, fórmanse botes secundarios: cada xogador só pode gañar a parte do bote á que contribuíu. As mans empatadas reparten o bote.'] },
        { id: 'hands', t: 'Xerarquía das mans',
          b: ['Da máis feble á máis forte:'],
          list: [
            '1. High Card — ningunha combinación; decide a carta máis alta.',
            '2. Pair — dúas cartas do mesmo valor.',
            '3. Two Pair — dúas parellas distintas.',
            '4. Three of a Kind — tres cartas do mesmo valor.',
            '5. Straight — cinco cartas consecutivas (o as conta alto ou baixo).',
            '6. Flush — cinco cartas do mesmo pau.',
            '7. Full House — un trío máis unha parella.',
            '8. Four of a Kind — catro cartas do mesmo valor.',
            '9. Straight Flush — unha escaleira, toda do mesmo pau.',
            '10. Royal Flush — do dez ao as nun só pau. A mellor man posible.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'A pantalla de xogo',
      sections: [
        { id: 'actionbar', t: 'A barra de accións',
          b: ['Cando che toca, a barra de accións de abaixo acéndese con ata catro botóns: Fold (vermello), Check / Call (azul), Bet / Raise (verde — a acción principal, destacada) e All-In (vermello escuro). O botón Check / Call amosa a cantidade exacta que hai que pagar; Bet / Raise amosa a cantidade que estás a piques de poñer. Despois do river, All-In pode converterse nun botón Show para amosar as túas cartas.'] },
        { id: 'betctl', t: 'Escolle a túa aposta',
          b: ['Axusta a cantidade da suba co campo numérico, o control desprazable ou os botóns rápidos 1/3 \u00b7 1/2 \u00b7 Pot (fraccións do bote actual). As cantidades redondéanse automaticamente e mantéñense entre a suba mínima e a máxima permitidas. Se prefires pensar en big blinds, unha opción amosa todas as cantidades en BB en vez de fichas.'] },
        { id: 'preselect', t: 'Preseleccionar unha acción',
          b: ['Antes da túa quenda podes cargar unha acción de antemán: toca un botón e recibe un bordo dourado cun puntiño dourado. Cando chega a túa quenda, a acción execútase de inmediato. Un Fold cargado convértese automaticamente en Check cando o check é de balde — nunca abandonas de balde. As preseleccións reiníciase en cada man nova, en cada cambio de street e no showdown, e anúlanse se a situación cambia (por exemplo, se cambia a cantidade a pagar).'] },
        { id: 'automodes', t: 'Modos automáticos',
          b: ['O menú despregable xunto aos botóns de acción ofrece tres modos de xogo: Manual, Auto Check/Call e Auto Check/Fold. Os modos automáticos xogan por ti ata que volvas atrás — calquera clic manual sobre unha acción volve de inmediato ao Manual.'] },
        { id: 'readtable', t: 'Ler a mesa',
          b: ['Cada caixa de xogador amosa o avatar, o nome, a pila e a aposta en curso. O repartidor e as cegas márcanse con fichas D / SB / BB. Unha insignia de cor na caixa indica a última acción do xogador; unha barra azul fina conta cara atrás o seu tempo de reflexión. A caixa do xogador ao que lle toca acéndese; a túa propia caixa recibe un marco dourado que latexa cando che toca a ti.',
              'A barra de estado sobre a mesa amosa o bote total, as apostas do street en curso, a fase (Pre-flop, Flop, Turn, River) e os números de partida e de man. Os xogadores que abandonaron teñen as cartas translúcidas; os eliminados quedan escurecidos. Ao remate dunha man, unha xanela de gañador pode resumir quen gañou que — pódese desactivar nas opcións.'] },
        { id: 'seatlayout', t: 'Disposición dos asentos',
          b: ['Como extensión web, a disposición das caixas de xogador escóllese en Opcións avanzadas \u2192 Asentos: Automática segue o cliente oficial (posicións fixas en vertical, elipse calculada en horizontal), ou forza a disposición Vertical ou Horizontal — e Personalizada déixache colocar cada asento ti mesmo: aparece un modo de edición no que arrastras cada caixa exactamente onde queiras, e a disposición gárdase.'] },
        { id: 'zoom', t: 'Zoom da mesa (móbiles)',
          b: ['En pantallas pequenas, os botóns de lupa amplían a mesa (2\u00d7) e podes arrastrala co dedo — a túa caixa e a barra de accións quedan fixas. A vista segue automaticamente o asento activo e afástase no showdown para ver o conxunto. Pódese desactivar nas Opcións avanzadas.'],
          note: 'En móbiles e tabletas, o zoom de belisco do propio navegador está bloqueado por defecto para que un xesto de zoom non se active nunca por accidente no medio dunha man; volve activalo en Opcións avanzadas \u2192 Interface de usuario se o prefires.' },
        { id: 'protections', t: 'Protección antiespía e anti-Call accidental',
          b: ['Dúas proteccións opcionais: a protección antiespía mantén as túas cartas tapadas ata que as tocas (útil cando alguén pode ver a túa pantalla), e a protección anti-Call accidental bloquea un momento o botón Call xusto tras unha suba grande, para que un toque destinado a un Call máis pequeno non caia por accidente sobre a cantidade subida. Ambas están nas Opcións avanzadas.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'O panel de información',
      sections: [
        { id: 'open', t: 'Abrir o panel',
          b: ['Durante unha partida, o panel de información ábrese desde a cabeceira (ou Alt+L / Alt+I) e ten tres lapelas: Rexistro, Probabilidades e Estatísticas. No móbil flota sobre a mesa; en pantallas máis grandes é unha xanela que se pode mover e redimensionar — colle a asa \u28ff para movela, os bordos para cambiar o tamaño. A posición lémbrase.'] },
        { id: 'log', t: 'Rexistro da partida',
          b: ['A lapela Rexistro anota toda a partida man a man: as cegas, cada acción coas cantidades, as cartas amosadas e os gañadores, todo coloreado para lelo axiña. O botón de exportación garda o rexistro nun ficheiro se queres repasar unha sesión máis adiante.'] },
        { id: 'odds', t: 'Probabilidades (monitor de probabilidades)',
          b: ['A lapela Probabilidades amosa, para a túa man actual, a probabilidade en directo de rematar con cada unha das 10 categorías de mans — de High Card a Royal Flush — cada unha coa súa icona, a súa porcentaxe e a súa barra. A visualización escurécese en canto abandonas. Só usa as túas cartas e as comunitarias: non ve nada que os rivais non amosen.'] },
        { id: 'journal', t: 'Rexistros de mans e a xanela \u00abRexistros\u00bb',
          b: ['Alén do rexistro en directo, cada man que xogas grávase localmente no teu navegador, no mesmo formato ca os ficheiros de rexistro .pdb do cliente oficial. A xanela Rexistros (Opcións avanzadas \u2192 Mensaxes de rexistro \u2192 Xestionar os rexistros\u2026) lista as túas sesións e permíteche traballar con elas: previsualizar unha sesión con busca e realce, filtrar por partida, exportar a HTML ou texto plano, gardar o ficheiro .pdb en bruto, ou importar un .pdb gravado polo cliente de escritorio. As sesións bórranse unha a unha ou todas de vez (con confirmación), e unha retención automática pode conservar só os últimos 7, 30, 90, 180 ou 365 días. Os rexistros que importas ti nunca se eliminan automaticamente. Un segundo axuste limita cantas sesións se conservan, e a columna da lista pódese ensanchar arrastrando.',
              'O botón Analizar executa unha análise de mans sobre unha sesión e pode enviar un rexistro ao servizo de análise de pokerth.net. Todo queda no teu dispositivo ata que exportes ou envíes explicitamente.'] },
        { id: 'logopts', t: 'Opcións de rexistro',
          b: ['En Opcións avanzadas \u2192 Mensaxes de rexistro podes activar ou desactivar o rexistro e escoller o intervalo de escritura, cos mesmos tres axustes que o cliente de escritorio: despois de cada acción, despois de cada man (por defecto) ou despois de cada partida. Outra opción escribe o ficheiro .pdb nun cartafol da túa escolla e mantéño ao día con ese intervalo, e unha vez máis ao saír da páxina, para que outra ferramenta poida seguir a partida en directo.'],
          note: 'Escribir nun cartafol local precisa da API File System Access: só Chrome, Edge e Opera de escritorio. No resto a opción explícase soa e a exportación manual desde a xanela de rexistros segue dispoñible. Un navegador só pode substituír un ficheiro, nunca engadir ao final, así que unha ferramenta que lea o .pdb debería reabrilo despois de cada cambio.' },
        { id: 'assist', t: 'Asistencia (forza da man)',
          b: ['Na parte superior da lapela Probabilidades, a faixa de asistencia leche a man. Antes do flop nomea a túa man inicial e puntúaa con estrelas; a partir do flop amosa a túa mellor combinación actual e, tras unha simulación rápida, a túa probabilidade estimada de gañar a man en porcentaxe, cun indicador de cor do vermello (feble) ao verde (forte). Coma o monitor de probabilidades, só usa información que podes ver.',
              'Hai dous estilos de visualización en Opcións avanzadas \u2192 Asentos: Segmentos (dez bloques) ou unha barra de progreso clásica. Toda a asistencia pódese desactivar en Opcións avanzadas \u2192 Asistencia.'] },
        { id: 'assistwin', t: 'A asistencia como trebello flotante',
          b: ['O bloque de asistencia pode separarse do panel nunha pequena xanela propia sempre por diante: usa o botón de separación do bloque, despois móvea e redimensiónaa onde queiras sobre a mesa — práctico para vixiar a forza da man sen todo o panel aberto. O botón de ancoraxe devólvea á lapela Probabilidades, e a posición lémbrase. Dentro do panel, unha asa de arrastre entre a Asistencia e as probabilidades permíteche repartir o espazo entre as dúas.'] },
        { id: 'stats', t: 'Estatísticas',
          b: ['A lapela Estatísticas fai o seguimento da túa sesión: mans xogadas, flops vistos, showdowns, taxas de vitoria e máis. O seguimento estatístico pódese desactivar nas Opcións avanzadas.'] },
        { id: 'hud', t: 'HUD de estatísticas nos asentos (beta)',
          b: ['O HUD pega xunto ao asento de cada xogador unha pequena caixa de estatísticas, construída coas mans gravadas nos teus rexistros: número de mans observadas, despois VPIP (con que frecuencia pon cartos voluntariamente pre-flop), PFR (subas pre-flop), AF (factor de agresividade), 3B (3-bet), CB (continuation bet) e F3B (fold ante un 3-bet), con códigos de cor do pasivo ao agresivo. Toca unha caixa para obter unha xanela emerxente detallada con máis cifras (intentos de roubo, fold ante roubo, taxas de showdown\u2026), e arrástraa se tapa algo.',
              'O HUD só sabe o que viches nas túas propias mesas — le os teus rexistros locais de mans, así que a gravación ten que estar activada e as cifras só teñen sentido tras suficientes mans. É unha función beta, desactivada por defecto: actívaa en Opcións avanzadas \u2192 Asistencia.'] },
        { id: 'handsbtn', t: 'Resumo das combinacións',
          b: ['A icona de mans de póker sobre o tapete abre en calquera momento un resumo rápido das 10 combinacións — práctico mentres aprendes. Pódese agochar nas Opcións avanzadas.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat e social',
      sections: [
        { id: 'panels', t: 'Chat do vestíbulo e chat da mesa',
          b: ['Hai un chat no vestíbulo e outro na mesa. No móbil, o chat da mesa flota sobre o xogo; en pantallas máis grandes é unha xanela que se pode mover e redimensionar. Unha insignia no botón de chat conta as mensaxes sen ler.'] },
        { id: 'typing', t: 'Axudas de escritura',
          list: [
            'O tabulador completa un alcume — preme o tabulador de novo para percorrer as coincidencias.',
            '\u2191 / \u2193 percorren o historial das túas mensaxes.',
            'O botón de emoji abre un selector completo; escribir : tamén suxire emotes mentres escribes.'] },
        { id: 'emotes', t: 'Emotes e caretas',
          b: ['O chat converte os códigos de emote exactamente coma o cliente de escritorio oficial: escribe un nome entre dous puntos e convértese no emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 admítense máis de 1.900 códigos (o conxunto completo de GitHub). As caretas de texto clásicas tamén se converten: :-) ;) :D xD :P <3 e unhas oitenta máis.',
              'Escribir : abre unha caixa de suxestións que completa o código mentres escribes (\u2191/\u2193 para escoller, tabulador ou Intro para aceptar). A conversión de emojis pódese desactivar de todo en Opcións avanzadas \u2192 Chat.'] },
        { id: 'commands', t: 'Ordes do chat',
          b: ['O chat entende ordes con barra. Dúas son visibles para os demais:'],
          keys: [
            ['/me <texto>', 'Mensaxe de acción, amósase como \u00ab* oteualcume texto\u00bb'],
            ['/emoji <emoji>', 'Reproduce unha reacción de emoji (a mesma que envía o selector de reaccións)']] },
        { id: 'diagcmds', t: 'Ordes de diagnóstico',
          b: ['Todo o demais é local: só ti ves as respostas e non se envía nada á mesa. Escribe /help para listalas todas. As máis útiles:'],
          keys: [
            ['/help', 'Lista todas as ordes'],
            ['/update', 'Comproba se hai versión nova e recarga'],
            ['/lang <código>', 'Cambia de idioma (p. ex. /lang gl)'],
            ['/sound on|off', 'Activa/silencia os sons do xogo'],
            ['/zoom', 'Alterna a lupa da mesa'],
            ['/clear', 'Baleira o chat localmente'],
            ['/table', 'Información da partida actual (cegas, xogadores, pilas)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnósticos de estado do cliente, rede e fluidez'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Depuración avanzada (cartas, protocolo, audio, almacenamento, asentos)'],
            ['/copy', 'Copia a última resposta de orde ao portapapeis']] },
        { id: 'reactions', t: 'Reaccións de emoji',
          b: ['O botón de reaccións abre un selector con 30 reaccións animadas (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) que se reproducen cun efecto sobre o teu asento, visibles para toda a mesa — incluídos os xogadores do cliente de escritorio. As reaccións pódense desactivar de todo nas Opcións avanzadas.'] },
        { id: 'translate', t: 'Entender a todos',
          b: ['Coa tradución do chat activada, aparece un botón de tradución na liña baixo o punteiro — ou na que toques, en pantalla táctil — e mostra a mensaxe no teu idioma co tradutor do navegador. Pode amosarse sempre en todas as liñas desde Opcións avanzadas → Chat, onde tamén vive a axuda que explica as abreviaturas de mesa (gg, nh, utg…).'],
          note: 'A tradución usa o servizo Google Translate e funciona en calquera navegador — só fai falta conexión a internet. Unha mensaxe só se envía ao servizo de tradución cando tocas o seu botón de tradución, nunca automaticamente.' },
        { id: 'social', t: 'Xogadores: perfil, convidar, ignorar',
          b: ['Toca calquera xogador — na mesa ou na lista do vestíbulo — para abrir a súa ficha: perfil e estatísticas, convidalo á túa partida, ou ignoralo (as súas mensaxes de chat agóchanse; ignorar pódese desfacer en calquera momento). Pódese activar unha confirmación antes de convidar/ignorar nas opcións.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Vestíbulo e partidas',
      sections: [
        { id: 'list', t: 'A lista de partidas',
          b: ['O vestíbulo lista todas as mesas do servidor. Cada entrada amosa o número de xogadores, o tipo de partida, un cadeado cando fai falta contrasinal ou convite, e unha insignia de estado: \u00abAgardando\u00bb (verde — a partida non comezou, podes unirte se hai sitio libre), \u00abEn curso\u00bb (cor cálida — pódese ver en directo cando se admiten espectadores) e \u00abPechada\u00bb (atenuada). Unha mesa chea recoñécese simplemente polo contador cheo, coma 10/10; as cores das insignias seguen o tema activo.',
              'O despregable de filtro estreita a lista exactamente coma o cliente de escritorio, con cada opción máis estrita ca a anterior: só partidas abertas \u2192 agochando tamén as mesas cheas \u2192 despois só as non privadas, só as privadas, ou só as partidas de clasificación. A túa escolla lémbrase. O campo de busca atopa unha partida polo nome, e a insignia de xogadores abre a lista de todos os que están en liña, con busca e ordenación.'] },
        { id: 'join', t: 'Unirse e mirar',
          b: ['Selecciona unha partida aberta e únete — un cadeado indica que fai falta contrasinal. As partidas en curso que admiten espectadores pódense mirar en directo: ves a mesa e o chat, pero as cartas tapadas seguen agochadas e non podes actuar.'] },
        { id: 'gameinfo', t: 'Información da partida',
          b: ['Antes de unirte, a ficha de información da partida amosa todo o que define a mesa: tipo de partida, cegas e a súa progresión (duplicación ou lista manual), pila inicial, tempo de acción, pausa entre mans, e quen xa está sentado.'] },
        { id: 'create', t: 'Crear unha partida',
          b: ['Crea a túa propia mesa: nome, número de xogadores, pila inicial, primeira small blind e calendario de subas, tempo de acción, e se se admiten espectadores. Hai catro tipos de partida: Normal (todos), só xogadores rexistrados, só con convite, e De clasificación (conta para a clasificación oficial — sen contrasinal posible nese caso). Os teus axustes favoritos pódense gardar e volver cargar.'] },
        { id: 'invites', t: 'Convites',
          b: ['Os xogadores poden convidarte á súa mesa; recibes unha notificación que podes aceptar ou rexeitar. Ser convidado é a única maneira de entrar nunha partida só con convite.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'A túa conta',
          b: ['O servidor oficial de internet é pokerth.net. Xogar alí require unha conta gratuíta de pokerth.net — rexístrate no sitio web e despois accede aquí co mesmo alcume e o mesmo contrasinal. Este cliente web conéctase exactamente ao mesmo servidor ca o cliente de escritorio: as mesmas contas, as mesmas mesas, as mesmas clasificacións, e podes sentar nunha mesa con xogadores do cliente de escritorio.'] },
        { id: 'ranked', t: 'Partidas de clasificación e tempadas',
          b: ['As partidas do tipo De clasificación contan para a clasificación oficial da tempada. O teu perfil dentro da aplicación amosa a data de rexistro, o teu Rank da tempada actual, a túa Score, a túa media e as partidas xogadas, ademais dos últimos resultados. As partidas normais (sen clasificación) son só por diversión e non cambian nada.'] },
        { id: 'rankhow', t: 'Como se calcula a clasificación',
          b: ['En cada partida clasificada o teu posto dá puntos: 15 para o primeiro, despois 9, 6, 4, 3, 2 e 1 ata o sétimo; do oitavo ao décimo, nada. Unha mesa reparte polo tanto 40 puntos en total.',
              'A túa Score non é a suma deses puntos, senón a túa media por partida, atenuada por un factor que medra co número de partidas xogadas: uns poucos bos resultados non chegan para instalarse arriba, tamén fai falta regularidade — canto máis xogas, máis se achega a túa Score á túa media real. As temporadas duran un trimestre: no cambio todo se arquiva e os contadores volven a cero, e as temporadas pasadas seguen consultables. En partida, o botón do podio amosa a clasificación de temporada dos xogadores da túa mesa.'],
          note: 'O baremo e a fórmula exacta fíxaos o servidor de clasificación de pokerth.net e poden cambiar; as páxinas do sitio son a referencia.' },
        { id: 'rankings', t: 'Páxinas de clasificación',
          b: ['A entrada de clasificación abre a clasificación oficial de PokerTH, con busca por xogador, así como as clasificacións da comunidade (BBC, WEC). Se as clasificacións non che interesan, a entrada pódese agochar en Opcións avanzadas \u2192 Comunidade.'] },
        { id: 'cups', t: 'As copas da comunidade: BBC e WeCup',
          b: ['Dúas comunidades organizan as súas propias competicións en pokerth.net, cada unha co seu sitio e a súa clasificación. A Best Brainies Cup (BBC) é un torneo por etapas nacido en 2013: progrésase do Step 1 ao Step 4, e unha nova temporada comeza tras cada partida de Step 4, cando se entrega a copa. A WeCup (WEC) ten o seu propio baremo, moito máis repartido — 75 puntos para o primeiro posto, despois 45, 30, 20… — e a súa score normaliza a túa media segundo o número de partidas que xogaches en comparación cos demais membros.',
              'As dúas clasificacións ábrense desde o botón do trofeo, ao lado da clasificación de PokerTH. Os axustes de mesa destas competicións veñen como predefinicións ao crear unha partida (BBC Step 1 a 4, WEC, WEC Monthly Final e WEC Grand Final), así que podes adestrar nas mesmas condicións. Participar require rexistrarse no sitio da copa correspondente.'],
          note: 'Estes contidos agóchanse dunha vez en Opcións avanzadas → Comunidade se as copas non che interesan.' },
        { id: 'forumcups', t: 'Copas do foro e eventos',
          b: ['O foro de pokerth.net acolle tamén a Monthly Cup, unha serie mensual na que os xogadores se reparten en mesas Gold, Silver e Bronze antes de coroar o campión do mes, ademais de copas especiais puntuais ao longo do ano.',
              'Inscricións, horarios, axustes de mesa e resultados publícanse no foro, e as partidas xóganse no servidor oficial coma calquera outra. Unha conta de pokerth.net abonda para seguir os resultados; apuntarse a unha copa pasa polo fío do foro correspondente.'] },
        { id: 'avatars', t: 'Avatares e bandeiras',
          b: ['En pokerth.net, o teu avatar distribúese aos demais xogadores a través do servidor de avatares, e pode aparecer unha pequena bandeira do país nas caixas de xogador. Ambas as cousas son opcionais e configurables nas opcións.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Modo adestramento',
      sections: [
        { id: 'what', t: 'Que é',
          b: ['O modo Local / adestramento é unha partida completa contra rivais controlados polo computador: sen conexión, sen conta, sen nada en xogo. Unha vez instalada a aplicación (ou mesmo só visitada unha vez), funciona totalmente sen conexión — perfecto para aprender o xogo, probar a interface ou pasar o tempo en modo avión.'] },
        { id: 'setup', t: 'Preparar unha partida',
          b: ['Escolle o número de rivais, a pila inicial, as cegas e a súa progresión, e a velocidade do xogo. A composición e a dificultade dos bots axústanse en Opcións avanzadas \u2192 Partida local — desde rivais suaves ata unha mesa máis dura e variada.'] },
        { id: 'trophies', t: 'Trofeos',
          b: ['O modo adestramento ten a súa propia progresión: 28 trofeos en seis categorías (progresión, técnica, estilo, formatos, diversión e unha secreta) desbloquéanse xogando — mans xogadas, partidas gañadas, grandes bluffs, mans especiais e máis. A túa progresión de trofeos é acumulativa e fusiónase entre dispositivos cando a sincronización de axustes da conta está activa.'] },
        { id: 'learn', t: 'Un bo sitio para aprender',
          b: ['Todo o que se describe nos outros capítulos tamén funciona aquí: o monitor de probabilidades, a visualización de asistencia, a preselección, os atallos de teclado. O modo adestramento é o mellor sitio para probalos sen presión antes de lanzarte a pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Estilo e son',
      sections: [
        { id: 'themes', t: 'Temas',
          b: ['A categoría Estilo das Opcións avanzadas viste todo o cliente. As predefinicións configúrano todo cun toque (o clásico casino verde, o aspecto oficial de PokerTH\u2026); debaixo, eixos individuais axustan por separado a paleta de cores, o tapete da mesa e as caras das cartas — cambia calquera eixo e a túa mestura convértese nun tema personalizado. O modo escuro, claro ou automático escóllese en Interface de usuario, e as túas escollas aplícanse ao instante, en todas as pantallas, e lémbranse.'] },
        { id: 'tablelook', t: 'Mesas, baralla, asentos',
          b: ['Alén do tema, varios elementos pódense cambiar de xeito independente: o fondo da mesa, a baralla, o reverso das cartas (a xogo coa baralla automaticamente, ou importa a túa propia imaxe), as fichas de repartidor e cegas, o estilo dos botóns de acción, e paquetes de asentos completos que revisten as caixas de xogador. Escólleo todo en Opcións avanzadas \u2192 Estilo; os cambios vense ao instante na mesa.'] },
        { id: 'music', t: 'Reprodutor de música',
          b: ['A entrada de música dos menús de cabeceira abre un pequeno reprodutor de música ambiental: escolle unha pista da lista, reproducir/pausar, anterior/seguinte, aleatorio, e repetición dunha pista, de toda a lista ou de nada. O volume, a pista escollida e o modo de repetición lémbranse. A reprodución nunca comeza soa — os navegadores esixen un toque — e o reprodutor é totalmente independente dos efectos de son do xogo.'] },
        { id: 'sounds', t: 'Efectos de son',
          b: ['Os sons do xogo agrúpanse en catro categorías activables por separado, igual ca no cliente de escritorio: accións de xogo (cartas repartidas, Check, Call, Raise, tócache\u2026), notificación do chat do vestíbulo, notificacións de partida en rede (xogador conectado, partida lista) e notificación de suba de cegas. Un único control de volume gobérnaos todos, en Opcións avanzadas \u2192 Son.'],
          note: 'Todos os navegadores — o iOS en especial — négana a reproducir son antes de que teñas tocado a páxina unha vez. Se unha partida comeza en silencio, un só toque en calquera sitio esperta o son; o cliente tamén repara automaticamente o motor de audio cando o iOS o suspende (chamada entrante, segundo plano\u2026).' },
        { id: 'voice', t: 'Voz e vibración',
          b: ['Dúas canles adicionais poden manterte informado sen mirar a pantalla: os anuncios de voz len en alto os acontecementos do xogo mediante a síntese de voz do dispositivo, e no móbil unha vibración curta pode marcar a túa quenda. Ambos son extensións web, activados ou non por defecto segundo o dispositivo, en Opcións avanzadas \u2192 Apostas e quenda.'],
          note: 'A vibración funciona en Android (navegadores Chromium); Apple non ofrece unha API de vibración aos sitios web, así que os iPhone non poden vibrar. Os anuncios de voz funcionan en todas partes, pero as voces e os idiomas dispoñibles dependen do teu sistema — o cliente usa a mellor coincidencia que atope.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opcións e atallos',
      sections: [
        { id: 'where', t: 'Onde viven as opcións',
          b: ['As Opcións avanzadas ábrense desde a entrada da engrenaxe de calquera menú de cabeceira. Están agrupadas coma no cliente de escritorio: Interface de usuario, Estilo, Son, Partida local, Partida en rede, Partida por internet, Alcumes / Avatares, Mensaxes de rexistro, e Restaurar os valores por defecto. Cada función específica da web ten alí o seu propio interruptor, así podes desactivar todo o que non uses.'] },
        { id: 'cfgxml', t: 'Intercambiar axustes co cliente de escritorio',
          b: ['Os teus axustes poden viaxar entre clientes: a categoría Mensaxes de rexistro ofrece exportación/importación do ficheiro oficial config.xml (aquel \u007e/.pokerth/config.xml que usan os clientes de escritorio e QML). A exportación escribe os axustes compartidos — nome, opcións de visualización, sons, preferencias de mesa, cegas, estilos — e a importación aplica aquí un ficheiro do escritorio. Os axustes que este cliente non coñece consérvanse intactos no ficheiro.'] },
        { id: 'sync', t: 'Axustes que te seguen',
          b: ['Cando xogas cunha conta, as túas opcións, o teu tema, as túas asignacións de teclas, o teu idioma e os teus trofeos de adestramento sincronízanse: cambia algo nun dispositivo e o seguinte dispositivo no que accedas recollerao. A progresión de trofeos fusiónase, nunca se sobrescribe, así que xogar en dous dispositivos conserva sempre o mellor de ambos.'] },
        { id: 'updates', t: 'Manterse ao día',
          b: ['O cliente actualízase só: cando se publica unha versión nova, un báner convídate a recargar (ou escribe /update no chat para comprobalo manualmente). De cando en vez pode aparecer unha pequena enquisa de produto que che pide a opinión sobre unha función — a participación é opcional, e as enquisas pódense desactivar de todo en Opcións avanzadas \u2192 Comunidade.'] },
        { id: 'fkeys', t: 'Atallos de teclado oficiais',
          b: ['As teclas de funci\u00f3n oficiais de PokerTH funcionan durante unha partida \u2014 Alt+S funciona en calquera parte:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (a orde pódese inverter nas opcións)'],
            ['F5', 'Amosa as túas cartas (cando é posible)'],
            ['F6 / F7 / F8', 'Manual \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manual \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Rexistro \u00b7 Panel de probabilidades'],
            ['Alt+S', 'Configuración — en calquera parte da aplicación, non só en partida'],
            ['F11', 'Pantalla completa']],
          note: 'Os atallos requiren un teclado físico. No Mac, as teclas F controlan os multimedia por defecto: mantén Fn premida (ou activa \u00abUsar as teclas F1, F2, etc. como teclas de función estándar\u00bb nos axustes do macOS). No iPhone, a pantalla completa está limitada polo iOS — instalar a aplicación como PWA dá a mesma experiencia de pantalla completa.' },
        { id: 'webkeys', t: 'Teclas de letra web',
          b: ['Extensión web: as teclas dunha soa letra e Alt+T tamén activan accións, e todas se poden reasignar en Opcións avanzadas → Atallos de teclado:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Panel de estatísticas'],
            ['Esc', 'Pecha a xanela da fronte (tamén o botón Atrás de Android)']],
          note: 'En Android, o botón/xesto Atrás do sistema pecha as xanelas coma Esc, en vez de saír da partida (configurable nas opcións). O iOS non ten ningún botón de sistema equivalente — usa o \u2715 de cada xanela.' }
      ]
    }
  ]
};
