// ── help/content/pt-pt.mjs — Corpus de ajuda em português europeu (Lote 3) ──
// Tradução de en.mjs (referência). Estrutura e ids idênticos; apenas
// t / b / list / keys (rótulos) / note são traduzidos. Os termos de póquer
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) mantêm-se em
// inglês, conforme a convenção da aplicação. Registo: tu (português europeu).
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Primeiros passos',
      sections: [
        { id: 'modes', t: 'Três formas de jogar',
          b: ['No ecrã de ligação, escolhe como queres jogar.'],
          list: [
            'Internet — joga online no servidor oficial pokerth.net, com classificações. É precisa uma conta pokerth.net; o registo em pokerth.net é gratuito.',
            'Local / treino — joga offline contra bots. Nada para configurar, funciona sem ligação e desbloqueia troféus à medida que progrides.',
            'LAN / servidor dedicado — liga-te a um servidor PokerTH privado na tua rede local ou na tua própria máquina.'] },
        { id: 'lan', t: 'LAN / servidor dedicado',
          b: ['O terceiro modo liga-se a qualquer servidor PokerTH que tu ou um amigo tenham a correr — numa rede doméstica, num VPS privado, onde for. Introduz o endereço e a porta do servidor, marca TLS se o servidor usar uma porta cifrada, e inicia sessão com uma alcunha (o acesso como convidado funciona se o servidor o permitir). Depois, na mesa, tudo se comporta exatamente como no servidor oficial.'] },
        { id: 'famboard', t: 'Classificação da família',
          b: ['Apenas em servidores privados e partidas LAN, o cliente guarda estatísticas acumuladas por alcunha — mãos e partidas jogadas e ganhas, maior ganho, melhor série — e partilha-as através do servidor, para que cada dispositivo à mesa veja a mesma classificação. As partidas de pokerth.net nunca são registadas desta forma, e as estatísticas do modo treino ficam completamente separadas.'] },
        { id: 'language', t: 'Idioma',
          b: ['A interface está disponível em 36 idiomas. Muda-o a qualquer momento nas Opções avançadas (menu da engrenagem), categoria Interface do utilizador. Os termos de ação do póquer (Fold, Check, Call, Bet, Raise, All-In) mantêm-se em inglês por convenção, exatamente como no cliente de secretária.'] },
        { id: 'pwa', t: 'Instalar como aplicação',
          b: ['Este cliente é uma Progressive Web App: podes instalá-lo a partir do menu do navegador (ou do botão de instalação no cabeçalho) para obteres uma aplicação em ecrã inteiro com o seu próprio ícone. Depois de instalada, arranca de imediato e o modo treino funciona totalmente offline.'],
          note: 'No Android e no Chrome/Edge de secretária, o botão de instalação trata de tudo. No iPhone/iPad, a Apple só permite a instalação através do Safari: botão Partilhar \u2192 \u201cAdicionar ao ecrã principal\u201d — o cliente mostra estes passos quando é preciso. O botão desaparece assim que a aplicação fica instalada.' },
        { id: 'platforms', t: 'Plataformas e navegadores',
          b: ['O cliente corre em qualquer navegador moderno em qualquer sistema — Windows, macOS, Linux, Android, iOS. Algumas funcionalidades dependem de APIs recentes dos navegadores; quando falta uma API, a funcionalidade esconde-se ou explica-se em vez de se partir. As principais diferenças a conhecer:'],
          list: [
            'Chrome / Edge (secretária): tudo funciona, incluindo escrever o registo .pdb numa pasta.',
            'Firefox: tudo, exceto escrever o .pdb numa pasta (API ainda indisponível).',
            'Safari / iOS: a instalação passa por Partilhar \u2192 \u201cAdicionar ao ecrã principal\u201d; sem vibração; ecrã inteiro limitado no iPhone; o som começa após o teu primeiro toque.',
            'Android: suporte completo nos navegadores Chromium, incluindo vibração e o comportamento do botão Voltar.'] },
        { id: 'avatar', t: 'Alcunha e avatar',
          b: ['Escolhe a tua alcunha e o teu avatar no ecrã de ligação antes de te ligares. Em pokerth.net, a tua alcunha é o nome da tua conta; os avatares são partilhados com os outros jogadores através do servidor de avatares.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Regras do póquer',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em em resumo',
          b: ['O PokerTH joga-se no Texas Hold\u2019em No-Limit. Cada jogador recebe duas cartas fechadas (as hole cards). Depois, cinco cartas comunitárias são colocadas viradas para cima no centro da mesa. A melhor mão de cinco cartas formada por qualquer combinação das tuas duas cartas com as cinco comunitárias ganha o pote.'] },
        { id: 'blinds', t: 'As blinds e o botão do dealer',
          b: ['Antes de cada mão, duas apostas obrigatórias alimentam o pote: a small blind e a big blind, pagas pelos dois jogadores à esquerda do botão do dealer. O botão avança uma posição no sentido dos ponteiros do relógio após cada mão, pelo que todos pagam as blinds à vez. As blinds sobem a intervalos regulares ao longo da partida.',
              'Na mesa, o botão e as blinds estão marcados com fichas: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'As quatro rondas de apostas',
          list: [
            'Pre-flop — depois de distribuídas as cartas fechadas, a primeira ronda de apostas começa à esquerda da big blind.',
            'Flop — três cartas comunitárias são reveladas, seguidas de uma ronda de apostas.',
            'Turn — uma quarta carta comunitária, depois outra ronda de apostas.',
            'River — a quinta e última carta comunitária, depois a ronda final de apostas.'],
          b: ['Uma ronda de apostas termina quando cada jogador ainda na mão colocou a mesma quantia no pote (ou está all-in).'] },
        { id: 'actions', t: 'O que podes fazer na tua vez',
          list: [
            'Fold — desistir da mão. As tuas cartas são descartadas e deixas de disputar o pote.',
            'Check — passar sem apostar. Só é possível quando não há nada a pagar.',
            'Call — igualar a aposta em curso.',
            'Bet — abrir as apostas quando ninguém apostou ainda nesta street.',
            'Raise — subir sobre uma aposta existente. A subida mínima iguala a aposta ou a subida anterior.',
            'All-In — colocar todo o teu stack. Continuas na mão até ao montante que cobriste.'] },
        { id: 'showdown', t: 'Showdown e potes divididos',
          b: ['Se vários jogadores restarem após a ronda de apostas do river, as mãos são mostradas e a melhor vence — a combinação vencedora aparece por baixo das cartas comunitárias. Quando um jogador está all-in por menos do que as apostas completas, formam-se potes laterais: cada jogador só pode ganhar a parte do pote para a qual contribuiu. Mãos empatadas dividem o pote.'] },
        { id: 'hands', t: 'Classificação das mãos',
          b: ['Da mais fraca à mais forte:'],
          list: [
            '1. High Card — nenhuma combinação; decide a carta mais alta.',
            '2. Pair — duas cartas do mesmo valor.',
            '3. Two Pair — dois pares diferentes.',
            '4. Three of a Kind — três cartas do mesmo valor.',
            '5. Straight — cinco cartas seguidas (o Ás vale alto ou baixo).',
            '6. Flush — cinco cartas do mesmo naipe.',
            '7. Full House — um trio mais um par.',
            '8. Four of a Kind — quatro cartas do mesmo valor.',
            '9. Straight Flush — uma sequência, toda do mesmo naipe.',
            '10. Royal Flush — do Dez ao Ás, num só naipe. A melhor mão possível.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'O ecrã de jogo',
      sections: [
        { id: 'actionbar', t: 'A barra de ações',
          b: ['Quando é a tua vez, a barra de ações em baixo acende-se com até quatro botões: Fold (vermelho), Check / Call (azul), Bet / Raise (verde — a ação principal, destacada) e All-In (vermelho escuro). O botão Check / Call mostra o montante exato a pagar; Bet / Raise mostra o montante que estás prestes a colocar. Depois do river, All-In pode transformar-se num botão Show para mostrares as tuas cartas.'] },
        { id: 'betctl', t: 'Escolher a tua aposta',
          b: ['Ajusta o montante da subida com o campo numérico, o cursor ou os botões rápidos 1/3 \u00b7 1/2 \u00b7 Pot (frações do pote atual). Os montantes são arredondados automaticamente e mantidos entre a subida mínima e máxima permitidas. Se preferires pensar em big blinds, uma opção mostra todos os montantes em BB em vez de fichas.'] },
        { id: 'preselect', t: 'Pré-selecionar uma ação',
          b: ['Antes da tua vez podes armar uma ação com antecedência: toca num botão e ele ganha um contorno dourado com um pequeno ponto dourado. Quando chega a tua vez, a ação dispara de imediato. Um Fold armado transforma-se automaticamente em Check quando o check é grátis — nunca desistes de graça. As pré-seleções são repostas a cada nova mão, mudança de street e showdown, e são anuladas se a situação mudar (por exemplo, se o montante a pagar mudar).'] },
        { id: 'automodes', t: 'Modos automáticos',
          b: ['O menu ao lado dos botões de ação oferece três modos de jogo: Manual, Auto Check/Call e Auto Check/Fold. Os modos automáticos jogam por ti até voltares atrás — qualquer clique manual numa ação regressa imediatamente ao Manual.'] },
        { id: 'readtable', t: 'Ler a mesa',
          b: ['Cada caixa de jogador mostra o avatar, o nome, o stack e a aposta em curso. O dealer e as blinds estão marcados com fichas D / SB / BB. Um distintivo colorido na caixa indica a última ação do jogador; uma fina barra azul faz a contagem do seu tempo de reflexão. A caixa do jogador da vez ilumina-se; a tua própria caixa ganha uma moldura dourada pulsante na tua vez.',
              'A barra de estado por cima da mesa mostra o pote total, as apostas da street em curso, a fase (Pre-flop, Flop, Turn, River) e os números da partida e da mão. Os jogadores que desistiram têm cartas translúcidas; os eliminados ficam esbatidos. No fim de uma mão, uma janela do vencedor pode resumir quem ganhou o quê — desativável nas opções.'] },
        { id: 'seatlayout', t: 'Disposição dos lugares',
          b: ['Como extensão web, a disposição das caixas de jogadores escolhe-se em Opções avançadas \u2192 Lugares: Automática segue o cliente oficial (posições fixas ao alto, elipse calculada ao baixo), ou força a disposição Vertical ou Horizontal — e Personalizada deixa-te posicionar cada lugar por ti próprio: surge um modo de edição em que arrastas cada caixa exatamente para onde quiseres, e a disposição fica guardada.'] },
        { id: 'zoom', t: 'Zoom da mesa (telemóveis)',
          b: ['Em ecrãs pequenos, botões de lupa ampliam a mesa (2\u00d7) e podes deslocá-la com o dedo — a tua caixa e a barra de ações ficam fixas. A vista segue automaticamente o lugar ativo e afasta-se no showdown para a visão geral. Desativável nas Opções avançadas.'],
          note: 'Em telemóveis e tablets, o zoom de pinça do próprio navegador vem bloqueado por predefinição, para que um gesto de zoom nunca dispare por acidente a meio de uma mão; reativa-o em Opções avançadas \u2192 Interface do utilizador se preferires.' },
        { id: 'protections', t: 'Antiespreitadela e proteção contra Call acidental',
          b: ['Duas proteções opcionais: a antiespreitadela mantém as tuas cartas tapadas até lhes tocares (útil quando alguém pode ver o teu ecrã), e a guarda contra Call acidental bloqueia por instantes o botão Call logo após uma grande subida, para que um toque destinado a um Call mais pequeno não caia por acidente no montante subido. Ambas vivem nas Opções avançadas.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Painel de informações',
      sections: [
        { id: 'open', t: 'Abrir o painel',
          b: ['Durante uma partida, o painel de informações abre-se a partir do cabeçalho (ou Alt+L / Alt+I) e tem três separadores: Histórico, Probabilidades e Estatísticas. No telemóvel flutua sobre a mesa; em ecrãs maiores é uma janela móvel e redimensionável — agarra a pega \u28ff para a mover, as bordas para a redimensionar. A posição fica memorizada.'] },
        { id: 'log', t: 'Registo da partida',
          b: ['O separador Histórico regista a partida inteira mão a mão: blinds, cada ação com os montantes, cartas mostradas e vencedores, tudo colorido para uma leitura rápida. O botão de exportação guarda o registo num ficheiro se quiseres rever uma sessão mais tarde.'] },
        { id: 'odds', t: 'Probabilidades (monitor de probabilidades)',
          b: ['O separador Probabilidades mostra, para a tua mão atual, a probabilidade em direto de terminares com cada uma das 10 categorias de mãos — de High Card a Royal Flush — cada uma com o seu ícone, a sua percentagem e a sua barra. A visualização esbate-se assim que desistes. Usa apenas as tuas cartas e as comunitárias: não vê nada que os adversários não mostrem.'] },
        { id: 'journal', t: 'Registos de mãos e a janela \u201cRegistos\u201d',
          b: ['Além do histórico em direto, cada mão que jogas é gravada localmente no navegador, no mesmo formato dos ficheiros de registo .pdb do cliente oficial. A janela Registos (Opções avançadas \u2192 Mensagens de registo \u2192 Gerir registos\u2026) lista as tuas sessões e deixa-te trabalhar com elas: pré-visualizar uma sessão com pesquisa e realce, filtrar por partida, exportar em HTML ou texto simples, guardar o ficheiro .pdb em bruto, ou importar um .pdb gravado pelo cliente de secretária. As sessões apagam-se uma a uma ou todas de uma vez (com confirmação), e uma retenção automática pode manter só os últimos 7, 30, 90, 180 ou 365 dias. Os registos que importa nunca são removidos automaticamente. Um segundo ajuste limita quantas sessões são mantidas, e a coluna da lista pode ser alargada arrastando.',
              'O botão Analisar corre uma análise de mãos sobre uma sessão e pode enviar um registo ao serviço de análise de pokerth.net. Tudo fica no teu dispositivo enquanto não exportares ou enviares explicitamente.'] },
        { id: 'logopts', t: 'Opções de registo',
          b: ['Em Opções avançadas \u2192 Mensagens de registo podes ligar ou desligar o registo e escolher o intervalo de escrita (após cada ação, ou uma vez por mão), como nas definições do cliente de secretária. Uma opção adicional escreve o ficheiro .pdb diretamente numa pasta à tua escolha e atualiza-o após cada mão — exatamente como faz o cliente de secretária, para que outras ferramentas o possam ler em direto.'],
          note: 'Escrever numa pasta local exige a API File System Access: só Chrome e Edge de secretária. Firefox, Safari e navegadores móveis não conseguem — a opção mostra então uma breve explicação, e a exportação manual a partir da janela Registos continua disponível em todo o lado.' },
        { id: 'assist', t: 'Assistência (força da mão)',
          b: ['No topo do separador Probabilidades, a faixa de assistência lê a tua mão por ti. Antes do flop nomeia a tua mão inicial e avalia-a com estrelas; a partir do flop mostra a tua melhor combinação atual e, após uma simulação rápida, a tua probabilidade estimada de ganhar a mão em percentagem, com um indicador de cor do vermelho (fraca) ao verde (forte). Como o monitor de probabilidades, usa apenas informação que podes ver.',
              'Dois estilos de visualização estão em Opções avançadas \u2192 Lugares: Segmentos (dez blocos) ou uma barra de progresso clássica. Toda a assistência é desativável em Opções avançadas \u2192 Assistência.'] },
        { id: 'assistwin', t: 'A assistência como widget flutuante',
          b: ['O bloco de assistência pode soltar-se do painel numa pequena janela própria sempre por cima: usa o botão de soltar no bloco, depois move-a e redimensiona-a onde quiseres sobre a mesa — prático para vigiares a força da mão sem o painel inteiro aberto. O botão de encaixe devolve-o ao separador Probabilidades, e a posição fica memorizada. No painel, uma pega de arrasto entre a Assistência e as probabilidades deixa-te repartir o espaço entre as duas.'] },
        { id: 'stats', t: 'Estatísticas',
          b: ['O separador Estatísticas acompanha a tua sessão: mãos jogadas, flops vistos, showdowns, taxas de vitória e mais. O acompanhamento estatístico é desativável nas Opções avançadas.'] },
        { id: 'hud', t: 'HUD de estatísticas nos lugares (beta)',
          b: ['O HUD prende uma pequena caixa de estatísticas ao lado do lugar de cada jogador, construída a partir das mãos gravadas nos teus registos: número de mãos observadas, depois VPIP (com que frequência mete dinheiro voluntariamente pre-flop), PFR (subidas pre-flop), AF (fator de agressividade), 3B (3-bet), CB (continuation bet) e F3B (fold ao 3-bet), com código de cores do passivo ao agressivo. Toca numa caixa para um popover detalhado com mais números (tentativas de roubo, fold ao roubo, taxas de showdown\u2026), e arrasta-a se tapar alguma coisa.',
              'O HUD só conhece o que viste nas tuas próprias mesas — lê os teus registos locais de mãos, pelo que o registo tem de estar ligado e os números ganham sentido depois de mãos suficientes. É uma funcionalidade beta, desligada por predefinição: liga-a em Opções avançadas \u2192 Assistência.'] },
        { id: 'handsbtn', t: 'Resumo das combinações',
          b: ['O ícone das mãos de póquer sobre o pano abre a qualquer momento um resumo rápido das 10 combinações — prático enquanto aprendes. Pode ser ocultado nas Opções avançadas.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Conversa e social',
      sections: [
        { id: 'panels', t: 'Conversa do lobby e conversa da mesa',
          b: ['Há uma conversa no lobby e outra na mesa. No telemóvel, a conversa da mesa flutua sobre o jogo; em ecrãs maiores é uma janela móvel e redimensionável. Um distintivo no botão da conversa conta as mensagens por ler.'] },
        { id: 'typing', t: 'Ajudas de escrita',
          list: [
            'Tab completa uma alcunha — prime Tab de novo para percorreres as correspondências.',
            '\u2191 / \u2193 percorrem o histórico das tuas mensagens.',
            'O botão de emoji abre um seletor completo; escrever : também sugere emotes enquanto escreves.'] },
        { id: 'emotes', t: 'Emotes e risonhos',
          b: ['A conversa converte os códigos de emotes exatamente como o cliente de secretária oficial: escreve um nome entre dois-pontos e ele torna-se o emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 são aceites mais de 1.900 códigos (o conjunto completo do GitHub). Os risonhos de texto clássicos também são convertidos: :-) ;) :D xD :P <3 e cerca de oitenta outros.',
              'Escrever : abre uma caixa de sugestões que completa o código enquanto escreves (\u2191/\u2193 para escolher, Tab ou Enter para aceitar). A conversão de emojis é totalmente desativável em Opções avançadas \u2192 Conversa.'] },
        { id: 'commands', t: 'Comandos da conversa',
          b: ['A conversa entende comandos com barra. Dois são visíveis para os outros:'],
          keys: [
            ['/me <texto>', 'Mensagem de ação, mostrada como \u201c* tuaalcunha texto\u201d'],
            ['/emoji <emoji>', 'Reproduz uma reação emoji (o que o seletor de reações envia)']] },
        { id: 'diagcmds', t: 'Comandos de diagnóstico',
          b: ['Tudo o resto é local: só tu vês as respostas e nada é enviado à mesa. Escreve /help para os listar todos. Os mais úteis:'],
          keys: [
            ['/help', 'Listar todos os comandos'],
            ['/update', 'Verificar se há versão nova e atualizar'],
            ['/lang <código>', 'Mudar de idioma (ex.: /lang pt-pt)'],
            ['/sound on|off', 'Ligar/silenciar os sons do jogo'],
            ['/zoom', 'Alternar a lupa da mesa'],
            ['/clear', 'Limpar a conversa localmente'],
            ['/table', 'Informações da partida atual (blinds, jogadores, stacks)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnósticos do estado do cliente, da rede e da fluidez'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Depuração avançada (cartas, protocolo, áudio, armazenamento, lugares)'],
            ['/copy', 'Copiar a última resposta de comando para a área de transferência']] },
        { id: 'reactions', t: 'Reações emoji',
          b: ['O botão de reação abre um seletor de 30 reações animadas (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) que tocam com um efeito sobre o teu lugar, visíveis para a mesa inteira — incluindo jogadores do cliente de secretária. As reações são totalmente desativáveis nas Opções avançadas.'] },
        { id: 'translate', t: 'Entender toda a gente',
          b: ['Com a tradu\u00e7\u00e3o do chat activada, aparece um bot\u00e3o de tradu\u00e7\u00e3o na linha sob o ponteiro \u2014 ou na linha que tocares, em ecr\u00e3 t\u00e1ctil \u2014 e mostra a mensagem na tua l\u00edngua com o tradutor do navegador. Pode ficar sempre vis\u00edvel em todas as linhas em Op\u00e7\u00f5es avan\u00e7adas \u2192 Chat, onde tamb\u00e9m vive a dica que explica as abreviaturas de mesa (gg, nh, utg\u2026).'],
          note: 'A tradução usa o serviço Google Translate e funciona em qualquer navegador — só precisa de ligação à internet. Uma mensagem só é enviada ao serviço de tradução quando tocas no botão de traduzir dela, nunca automaticamente.' },
        { id: 'social', t: 'Jogadores: perfil, convidar, ignorar',
          b: ['Toca em qualquer jogador — na mesa ou na lista do lobby — para abrires a ficha dele: perfil e estatísticas, convidá-lo para a tua partida, ou ignorá-lo (as mensagens dele na conversa ficam ocultas; ignorar é reversível a qualquer momento). Uma confirmação antes de convidar/ignorar pode ser ativada nas opções.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby e partidas',
      sections: [
        { id: 'list', t: 'A lista de partidas',
          b: ['O lobby lista todas as mesas do servidor. Cada entrada mostra o número de jogadores, o tipo de partida, um cadeado quando é exigida palavra-passe ou convite, e um distintivo de estado: \u201cÀ espera\u201d (verde — a partida não começou, podes juntar-te se houver lugar livre), \u201cEm curso\u201d (cor quente — visível em direto quando os espectadores são permitidos) e \u201cFechada\u201d (esbatido). Uma mesa cheia reconhece-se simplesmente pelo contador cheio, tipo 10/10; as cores dos distintivos seguem o tema ativo.',
              'O menu de filtro estreita a lista exatamente como o cliente de secretária, cada escolha mais rigorosa do que a anterior: só partidas abertas \u2192 escondendo também as mesas cheias \u2192 depois só as não privadas, só as privadas, ou só as partidas classificadas. A tua escolha fica memorizada. O campo de pesquisa encontra uma partida pelo nome, e o distintivo de jogadores abre a lista de todos os ligados, pesquisável e ordenável.'] },
        { id: 'join', t: 'Juntar-se e observar',
          b: ['Seleciona uma partida aberta e junta-te — um cadeado indica que é exigida uma palavra-passe. As partidas em curso que admitem espectadores podem ser vistas em direto: vês a mesa e a conversa, mas as cartas fechadas ficam ocultas e não podes agir.'] },
        { id: 'gameinfo', t: 'Informações da partida',
          b: ['Antes de te juntares, a ficha de informações da partida mostra tudo o que define a mesa: tipo de partida, blinds e a sua progressão (duplicação ou lista manual), stack inicial, tempo de ação, pausa entre as mãos, e quem já está sentado.'] },
        { id: 'create', t: 'Criar uma partida',
          b: ['Cria a tua própria mesa: nome, número de jogadores, stack inicial, primeira small blind e progressão de subidas, tempo de ação, e se os espectadores são permitidos. Existem quatro tipos de partidas: Normal (todos), só jogadores registados, só por convite, e Classificada (conta para a classificação oficial — sem palavra-passe possível nesse caso). As tuas definições favoritas podem ser guardadas e recarregadas.'] },
        { id: 'invites', t: 'Convites',
          b: ['Os jogadores podem convidar-te para a mesa deles; recebes uma notificação que podes aceitar ou recusar. Ser convidado é a única forma de entrar numa partida só por convite.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'A tua conta',
          b: ['O servidor oficial de Internet é o pokerth.net. Jogar lá exige uma conta pokerth.net gratuita — regista-te no sítio web e depois inicia sessão aqui com a mesma alcunha e palavra-passe. Este cliente web liga-se exatamente ao mesmo servidor que o cliente de secretária: as mesmas contas, as mesmas mesas, as mesmas classificações, e podes sentar-te numa mesa com jogadores do cliente de secretária.'] },
        { id: 'ranked', t: 'Partidas classificadas e temporadas',
          b: ['As partidas do tipo Classificada contam para a classificação oficial da temporada. O teu perfil na aplicação mostra a data de registo, o teu Rank da temporada atual, a tua Pontuação, a tua média e as partidas jogadas, além dos últimos resultados. As partidas normais (não classificadas) são só por diversão e não mudam nada.'] },
        { id: 'rankhow', t: 'Como é calculada a classificação',
          b: ['Em cada partida classificada, a tua posição rende pontos: 15 para o primeiro, depois 9, 6, 4, 3, 2 e 1 até ao sétimo; do oitavo ao décimo, nada. Uma mesa distribui portanto 40 pontos no total.',
              'A tua Score não é a soma desses pontos, mas a tua média por partida, atenuada por um fator que cresce com o número de partidas jogadas: alguns bons resultados não chegam para te instalares no topo, é precisa também regularidade — quanto mais jogas, mais a tua Score se aproxima da tua média real. As temporadas duram um trimestre: na mudança tudo é arquivado e os contadores recomeçam do zero, ficando as temporadas passadas consultáveis. Em jogo, o botão do pódio mostra a classificação da temporada dos jogadores da tua mesa.'],
          note: 'A tabela de pontos e a fórmula exata são definidas pelo servidor de classificação do pokerth.net e podem mudar; as páginas do sítio é que fazem fé.' },
        { id: 'rankings', t: 'Páginas de classificação',
          b: ['A entrada de classificação abre a classificação oficial do PokerTH, pesquisável por jogador, além das classificações comunitárias (BBC, WEC). Se as classificações não te interessarem, a entrada pode ser ocultada em Opções avançadas \u2192 Comunidade.'] },
        { id: 'cups', t: 'As taças da comunidade: BBC e WeCup',
          b: ['Duas comunidades organizam as suas próprias competições no pokerth.net, cada uma com o seu sítio e a sua classificação. A Best Brainies Cup (BBC) é um torneio por etapas nascido em 2013: avança-se do Step 1 ao Step 4, e uma nova temporada começa depois de cada partida de Step 4, quando a taça é entregue. A WeCup (WEC) tem a sua própria tabela, bastante mais repartida — 75 pontos para o primeiro lugar, depois 45, 30, 20… — e a sua score normaliza a tua média consoante o número de partidas que jogaste em comparação com os outros membros.',
              'As duas classificações abrem-se pelo botão do troféu, ao lado da classificação do PokerTH. As definições de mesa destas competições vêm como predefinições ao criar uma partida (BBC Step 1 a 4, WEC, WEC Monthly Final e WEC Grand Final), por isso podes treinar nas mesmas condições. Participar exige inscrição no sítio da taça em causa.'],
          note: 'Estes conteúdos escondem-se de uma vez em Opções avançadas → Comunidade, se as taças não te interessarem.' },
        { id: 'forumcups', t: 'Taças do fórum e eventos',
          b: ['O fórum do pokerth.net acolhe também a Monthly Cup, uma série mensal em que os jogadores se repartem por mesas Gold, Silver e Bronze antes de ser coroado o campeão do mês, além de taças especiais pontuais ao longo do ano.',
              'Inscrições, horários, definições de mesa e resultados são publicados no fórum, e as partidas jogam-se no servidor oficial como qualquer outra. Uma conta pokerth.net chega para seguir os resultados; inscrever-te numa taça passa pelo tópico correspondente do fórum.'] },
        { id: 'avatars', t: 'Avatares e bandeiras',
          b: ['Em pokerth.net, o teu avatar é distribuído aos outros jogadores através do servidor de avatares, e uma pequena bandeira do país pode aparecer nas caixas de jogadores. Ambos são opcionais e configuráveis nas opções.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Modo treino',
      sections: [
        { id: 'what', t: 'O que é',
          b: ['O modo Local / treino é uma partida completa contra adversários controlados pelo computador: sem ligação, sem conta, nada em jogo. Uma vez instalada a aplicação (ou apenas visitada uma vez), funciona totalmente offline — perfeito para aprenderes o jogo, testares a interface ou passares o tempo em modo de voo.'] },
        { id: 'setup', t: 'Configurar uma partida',
          b: ['Escolhe o número de adversários, o stack inicial, as blinds e a sua progressão, e a velocidade do jogo. A composição e a dificuldade dos bots ajustam-se em Opções avançadas \u2192 Partida local — de adversários brandos a uma mesa mais dura e variada.'] },
        { id: 'trophies', t: 'Troféus',
          b: ['O modo treino tem a sua própria progressão: 28 troféus em seis categorias (progressão, técnica, estilo, formatos, diversão e uma secreta) desbloqueiam-se a jogar — mãos jogadas, partidas ganhas, grandes bluffs, mãos especiais e mais. O teu progresso de troféus é acumulativo e funde-se entre dispositivos quando a sincronização de definições da conta está ativa.'] },
        { id: 'learn', t: 'Um bom sítio para aprender',
          b: ['Tudo o que está descrito nos outros capítulos também funciona aqui: o monitor de probabilidades, o ecrã de assistência, a pré-seleção, os atalhos de teclado. O modo treino é o melhor sítio para os experimentares sem pressão antes de te lançares no pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Estilo e som',
      sections: [
        { id: 'themes', t: 'Temas',
          b: ['A categoria Estilo das Opções avançadas veste o cliente inteiro. As predefinições configuram tudo num toque (o clássico casino verde, o visual oficial do PokerTH\u2026); por baixo, eixos individuais afinam separadamente a paleta de cores, o pano da mesa e as faces das cartas — muda qualquer eixo e a tua mistura torna-se um tema personalizado. O modo escuro, claro ou automático escolhe-se em Interface do utilizador, e as tuas escolhas aplicam-se de imediato, em todos os ecrãs, e ficam memorizadas.'] },
        { id: 'tablelook', t: 'Mesas, baralhos, lugares',
          b: ['Além do tema, vários elementos trocam-se de forma independente: o fundo da mesa, o baralho, o verso das cartas (a condizer com o baralho automaticamente, ou importa a tua própria imagem), as fichas de dealer e blinds, o estilo dos botões de ação, e pacotes de lugares completos que revestem as caixas de jogadores. Escolhe tudo em Opções avançadas \u2192 Estilo; as mudanças são visíveis de imediato na mesa.'] },
        { id: 'music', t: 'Leitor de música',
          b: ['A entrada de música dos menus do cabeçalho abre um pequeno leitor de música ambiente: escolhe uma faixa da lista, reproduzir/pausar, anterior/seguinte, aleatório, e repetição de uma faixa, de toda a lista ou de nada. O volume, a faixa escolhida e o modo de repetição ficam memorizados. A reprodução nunca começa sozinha — os navegadores exigem um toque — e o leitor é totalmente independente dos efeitos sonoros do jogo.'] },
        { id: 'sounds', t: 'Efeitos sonoros',
          b: ['Os sons do jogo agrupam-se em quatro categorias ativáveis separadamente, exatamente como no cliente de secretária: ações de jogo (cartas distribuídas, Check, Call, Raise, a tua vez\u2026), notificação da conversa do lobby, notificações de partida em rede (jogador entrou, partida pronta) e notificação de subida de blinds. Um único cursor de volume regula todos, em Opções avançadas \u2192 Som.'],
          note: 'Todos os navegadores — o iOS em particular — recusam-se a tocar som antes de teres tocado na página uma vez. Se uma partida começar em silêncio, um único toque em qualquer lado acorda o som; o cliente também repara automaticamente o motor de áudio quando o iOS o suspende (chamada recebida, segundo plano\u2026).' },
        { id: 'voice', t: 'Voz e vibração',
          b: ['Dois canais extra podem manter-te informado sem olhares para o ecrã: os anúncios de voz leem em voz alta os eventos do jogo através da síntese de voz do dispositivo, e no telemóvel uma vibração curta pode marcar a tua vez. Ambos são extensões web, ativas ou não por predefinição consoante o dispositivo, em Opções avançadas \u2192 Apostas e vez.'],
          note: 'A vibração funciona no Android (navegadores Chromium); a Apple não expõe uma API de vibração aos sítios web, pelo que os iPhone não podem vibrar. Os anúncios de voz funcionam em todo o lado, mas as vozes e idiomas disponíveis dependem do teu sistema — o cliente usa a melhor correspondência que encontrar.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opções e atalhos',
      sections: [
        { id: 'where', t: 'Onde vivem as opções',
          b: ['As Opções avançadas abrem-se pela entrada da engrenagem de qualquer menu do cabeçalho. Estão agrupadas como no cliente de secretária: Interface do utilizador, Estilo, Som, Partida local, Partida em rede, Partida pela Internet, Alcunhas / Avatares, Mensagens de registo, e Repor predefinições. Cada funcionalidade específica da web tem lá o seu próprio interruptor, para desligares tudo o que não usas.'] },
        { id: 'cfgxml', t: 'Trocar definições com o cliente de secretária',
          b: ['As tuas definições podem viajar entre clientes: a categoria Mensagens de registo oferece exportar/importar o ficheiro config.xml oficial (o \u007e/.pokerth/config.xml usado pelos clientes de secretária e QML). A exportação escreve as definições partilhadas — nome, opções de visualização, sons, preferências de mesa, blinds, estilos — e a importação aplica aqui um ficheiro da secretária. As definições que este cliente não conhece ficam intactas no ficheiro.'] },
        { id: 'sync', t: 'Definições que te seguem',
          b: ['Quando jogas com uma conta, as tuas opções, o teu tema, os teus atalhos de teclado, o teu idioma e os teus troféus de treino são sincronizados: muda algo num dispositivo e o próximo dispositivo em que iniciares sessão recebe-o. O progresso dos troféus é fundido, nunca substituído, pelo que jogar em dois dispositivos guarda sempre o melhor de ambos.'] },
        { id: 'updates', t: 'Manter-se atualizado',
          b: ['O cliente atualiza-se sozinho: quando uma nova versão é publicada, uma faixa convida-te a recarregar (ou escreve /update na conversa para verificares manualmente). De vez em quando pode aparecer um pequeno inquérito de produto a pedir a tua opinião sobre uma funcionalidade — participar é opcional e os inquéritos são totalmente desativáveis em Opções avançadas \u2192 Comunidade.'] },
        { id: 'fkeys', t: 'Atalhos de teclado oficiais',
          b: ['As teclas de função oficiais do PokerTH funcionam durante uma partida:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (ordem inversível nas opções)'],
            ['F5', 'Mostrar as tuas cartas (quando possível)'],
            ['F6 / F7 / F8', 'Manual \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manual \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Conversa \u00b7 Histórico \u00b7 Painel de probabilidades'],
            ['Alt+S', 'Defini\u00e7\u00f5es \u2014 em qualquer parte da aplica\u00e7\u00e3o, n\u00e3o s\u00f3 em jogo'],
            ['F11', 'Ecrã inteiro']],
          note: 'Os atalhos exigem um teclado físico. No Mac, as teclas F controlam os multimédia por predefinição: mantém premido Fn (ou ativa \u201cUsar as teclas F1, F2, etc. como teclas de função padrão\u201d nas definições do macOS). No iPhone, o ecrã inteiro é limitado pelo iOS — instalar a aplicação como PWA dá a mesma experiência de ecrã inteiro.' },
        { id: 'webkeys', t: 'Teclas de letra da web',
          b: ['Extens\u00e3o web: as teclas de uma s\u00f3 letra e Alt+T tamb\u00e9m accionam ac\u00e7\u00f5es, e todas se podem reatribuir em Op\u00e7\u00f5es avan\u00e7adas \u2192 Atalhos de teclado:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Painel de estat\u00edsticas'],
            ['Esc', 'Fechar a janela da frente (também o botão Voltar do Android)']],
          note: 'No Android, o botão/gesto Voltar do sistema fecha as janelas como Esc em vez de sair da partida (configurável nas opções). O iOS não tem botão de sistema equivalente — usa o \u2715 de cada janela.' }
      ]
    }
  ]
};
