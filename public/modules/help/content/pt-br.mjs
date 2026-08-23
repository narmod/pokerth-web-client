// ── help/content/pt-br.mjs — Corpus de ajuda em português do Brasil (Lote 2) ─
// Tradução de en.mjs (referência). Estrutura e ids idênticos; apenas
// t / b / list / keys (rótulos) / note são traduzidos. Os termos de pôquer
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) permanecem em
// inglês, conforme a convenção do aplicativo.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Primeiros passos',
      sections: [
        { id: 'modes', t: 'Três jeitos de jogar',
          b: ['Na tela de conexão, escolha como você quer jogar.'],
          list: [
            'Internet — jogue online no servidor oficial pokerth.net, com rankings. É preciso uma conta pokerth.net; o registro em pokerth.net é gratuito.',
            'Local / treino — jogue offline contra bots. Nada para configurar, funciona sem conexão e desbloqueia troféus conforme você progride.',
            'LAN / servidor dedicado — conecte-se a um servidor PokerTH privado na sua rede local ou na sua própria máquina.'] },
        { id: 'lan', t: 'LAN / servidor dedicado',
          b: ['O terceiro modo conecta a qualquer servidor PokerTH que você ou um amigo rodem — numa rede doméstica, num VPS privado, onde for. Digite o endereço e a porta do servidor, marque TLS se o servidor usar uma porta criptografada, e entre com um apelido (o acesso como convidado funciona se o servidor permitir). Na mesa, tudo se comporta depois exatamente como no servidor oficial.'] },
        { id: 'famboard', t: 'Ranking da família',
          b: ['Somente em servidores privados e partidas LAN, o cliente mantém estatísticas acumuladas por apelido — mãos e partidas jogadas e vencidas, maior ganho, melhor sequência — e as compartilha pelo servidor, para que cada dispositivo na mesa veja o mesmo ranking. Partidas do pokerth.net nunca são registradas assim, e as estatísticas do modo treino ficam completamente separadas.'] },
        { id: 'language', t: 'Idioma',
          b: ['A interface está disponível em 45 idiomas. Troque a qualquer momento nas Opções avançadas (menu da engrenagem), categoria Interface do usuário. Os termos de ação do pôquer (Fold, Check, Call, Bet, Raise, All-In) permanecem em inglês por convenção, exatamente como no cliente de desktop.'] },
        { id: 'pwa', t: 'Instalar como aplicativo',
          b: ['Este cliente é um Progressive Web App: você pode instalá-lo pelo menu do navegador (ou pelo botão de instalação no cabeçalho) para ter um aplicativo em tela cheia com ícone próprio. Depois de instalado, ele abre na hora e o modo treino funciona totalmente offline.'],
          note: 'No Android e no Chrome/Edge de desktop, o botão de instalação faz tudo. No iPhone/iPad, a Apple só permite a instalação pelo Safari: botão Compartilhar \u2192 \u201cAdicionar à Tela de Início\u201d — o cliente mostra esses passos quando necessário. O botão some depois que o aplicativo é instalado.' },
        { id: 'platforms', t: 'Plataformas e navegadores',
          b: ['O cliente roda em qualquer navegador moderno em qualquer sistema — Windows, macOS, Linux, Android, iOS. Alguns recursos dependem de APIs recentes dos navegadores; quando uma API falta, o recurso se esconde ou se explica em vez de quebrar. As principais diferenças:'],
          list: [
            'Chrome / Edge (desktop): tudo funciona, inclusive gravar o log .pdb numa pasta.',
            'Firefox: tudo, exceto gravar o .pdb numa pasta (API ainda indisponível).',
            'Safari / iOS: a instalação passa por Compartilhar \u2192 \u201cAdicionar à Tela de Início\u201d; sem vibração; tela cheia limitada no iPhone; o som começa após o seu primeiro toque.',
            'Android: suporte completo nos navegadores Chromium, inclusive vibração e o comportamento do botão Voltar.'] },
        { id: 'avatar', t: 'Apelido e avatar',
          b: ['Escolha seu apelido e avatar na tela de conexão antes de conectar. No pokerth.net, seu apelido é o nome da sua conta; os avatares são compartilhados com os outros jogadores pelo servidor de avatares.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Regras do pôquer',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em em resumo',
          b: ['O PokerTH é jogado no Texas Hold\u2019em No-Limit. Cada jogador recebe duas cartas fechadas (as hole cards). Depois, cinco cartas comunitárias são abertas no centro da mesa. A melhor mão de cinco cartas formada por qualquer combinação das suas duas cartas com as cinco comunitárias leva o pote.'] },
        { id: 'blinds', t: 'Os blinds e o botão do dealer',
          b: ['Antes de cada mão, duas apostas obrigatórias alimentam o pote: o small blind e o big blind, pagos pelos dois jogadores à esquerda do botão do dealer. O botão avança uma posição no sentido horário após cada mão, então todos pagam os blinds por turnos. Os blinds sobem em intervalos regulares ao longo da partida.',
              'Na mesa, o botão e os blinds são marcados com fichas: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'As quatro rodadas de apostas',
          list: [
            'Pre-flop — depois de distribuídas as cartas fechadas, a primeira rodada de apostas começa à esquerda do big blind.',
            'Flop — três cartas comunitárias são reveladas, seguidas de uma rodada de apostas.',
            'Turn — uma quarta carta comunitária, depois outra rodada de apostas.',
            'River — a quinta e última carta comunitária, depois a rodada final de apostas.'],
          b: ['Uma rodada de apostas termina quando cada jogador ainda na mão colocou a mesma quantia no pote (ou está all-in).'] },
        { id: 'actions', t: 'O que você pode fazer na sua vez',
          list: [
            'Fold — desistir da mão. Suas cartas saem e você não disputa mais o pote.',
            'Check — passar sem apostar. Só é possível quando não há nada a pagar.',
            'Call — igualar a aposta em andamento.',
            'Bet — abrir as apostas quando ninguém apostou ainda nesta street.',
            'Raise — aumentar sobre uma aposta existente. O aumento mínimo iguala a aposta ou o aumento anterior.',
            'All-In — colocar todo o seu stack. Você continua na mão até o valor que cobriu.'] },
        { id: 'showdown', t: 'Showdown e potes divididos',
          b: ['Se vários jogadores restarem após a rodada de apostas do river, as mãos são mostradas e a melhor vence — a combinação vencedora aparece abaixo das cartas comunitárias. Quando um jogador está all-in por menos que as apostas completas, formam-se potes laterais: cada jogador só pode ganhar a parte do pote para a qual contribuiu. Mãos empatadas dividem o pote.',
            'Nem todos precisam mostrar: a partir do último jogador que apostou ou aumentou, uma mão só é revelada se vencer o que já está aberto. Quem tem direito a dar muck mantém as cartas fechadas e recebe um botão Show para exibi-las mesmo assim.'] },
        { id: 'hands', t: 'Classificação das mãos',
          b: ['Da mais fraca à mais forte:'],
          list: [
            '1. High Card — nenhuma combinação; a carta mais alta decide.',
            '2. Pair — duas cartas do mesmo valor.',
            '3. Two Pair — dois pares diferentes.',
            '4. Three of a Kind — três cartas do mesmo valor.',
            '5. Straight — cinco cartas em sequência (o Ás vale alto ou baixo).',
            '6. Flush — cinco cartas do mesmo naipe.',
            '7. Full House — uma trinca mais um par.',
            '8. Four of a Kind — quatro cartas do mesmo valor.',
            '9. Straight Flush — uma sequência, toda do mesmo naipe.',
            '10. Royal Flush — do Dez ao Ás, num só naipe. A melhor mão possível.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'A tela de jogo',
      sections: [
        { id: 'actionbar', t: 'A barra de ações',
          b: ['Quando é a sua vez, a barra de ações embaixo acende com até quatro botões: Fold (vermelho), Check / Call (azul), Bet / Raise (verde — a ação principal, destacada) e All-In (vermelho escuro). O botão Check / Call mostra o valor exato a pagar; Bet / Raise mostra o valor que você está prestes a colocar. Depois do river, All-In pode virar um botão Show para mostrar suas cartas.'] },
        { id: 'betctl', t: 'Escolher sua aposta',
          b: ['Ajuste o valor do aumento com o campo numérico, o controle deslizante ou os botões rápidos 1/3 \u00b7 1/2 \u00b7 Pot (frações do pote atual). Os valores são arredondados automaticamente e mantidos entre o aumento mínimo e máximo permitidos. Se você prefere pensar em big blinds, uma opção mostra todos os valores em BB em vez de fichas.'] },
        { id: 'preselect', t: 'Pré-selecionar uma ação',
          b: ['Antes da sua vez, você pode armar uma ação com antecedência: toque num botão e ele ganha uma borda dourada com um pontinho dourado. Quando chega a sua vez, a ação dispara na hora. Um Fold armado vira automaticamente Check quando o check é grátis — você nunca desiste de graça. As pré-seleções zeram a cada nova mão, mudança de street e showdown, e são canceladas se a situação mudar (por exemplo, se o valor a pagar mudar).'] },
        { id: 'automodes', t: 'Modos automáticos',
          b: ['O menu ao lado dos botões de ação oferece três modos de jogo: Manual, Auto Check/Call e Auto Check/Fold. Os modos automáticos jogam por você até você voltar — qualquer clique manual numa ação retorna imediatamente ao Manual.'] },
        { id: 'readtable', t: 'Ler a mesa',
          b: ['Cada caixa de jogador mostra avatar, nome, stack e aposta em andamento. O dealer e os blinds são marcados com fichas D / SB / BB. Um selo colorido na caixa indica a última ação do jogador; uma fina barra azul conta o tempo de reflexão dele. A caixa do jogador da vez se acende; a sua própria ganha uma moldura dourada pulsante na sua vez.',
              'A barra de status acima da mesa mostra o pote total, as apostas da street atual, a fase (Pre-flop, Flop, Turn, River) e os números da partida e da mão. Jogadores que desistiram têm cartas translúcidas; os eliminados ficam esmaecidos. No fim de uma mão, uma janela do vencedor pode resumir quem ganhou o quê — desativável nas opções.'] },
        { id: 'seatlayout', t: 'Posição dos assentos',
          b: ['Como extensão web, a disposição das caixas de jogadores é escolhida em Opções avançadas \u2192 Assentos: Automática segue o cliente oficial (posições fixas em retrato, elipse calculada em paisagem), ou force a disposição Retrato ou Paisagem — e Personalizada deixa você posicionar cada assento sozinho: aparece um modo de edição em que você arrasta cada caixa exatamente para onde quiser, e a disposição fica salva.'] },
        { id: 'zoom', t: 'Zoom da mesa (celulares)',
          b: ['Em telas pequenas, botões de lupa ampliam a mesa (2\u00d7) e você a desloca com o dedo — a sua caixa e a barra de ações ficam fixas. A vista segue automaticamente o assento ativo e se afasta no showdown para a visão geral. Desativável nas Opções avançadas.'],
          note: 'Em celulares e tablets, o zoom de pinça do próprio navegador vem bloqueado por padrão, para que um gesto de zoom nunca dispare por acidente no meio de uma mão; reative-o em Opções avançadas \u2192 Interface do usuário se preferir.' },
        { id: 'protections', t: 'Antiespiada e proteção contra Call acidental',
          b: ['Duas proteções opcionais: a antiespiada mantém suas cartas viradas até você tocá-las (útil quando alguém pode ver sua tela), e a guarda contra Call acidental bloqueia por um instante o botão Call logo após um grande aumento, para que um toque destinado a um Call menor não caia por acidente no valor aumentado. As duas ficam nas Opções avançadas.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Painel de informações',
      sections: [
        { id: 'open', t: 'Abrir o painel',
          b: ['Durante uma partida, o painel de informações abre pelo cabeçalho (ou Alt+L / Alt+I) e tem três abas: Histórico, Chances e Estatísticas. No celular ele flutua sobre a mesa; em telas maiores é uma janela móvel e redimensionável — pegue a alça \u28ff para mover, as bordas para redimensionar. A posição fica memorizada.'] },
        { id: 'log', t: 'Registro da partida',
          b: ['A aba Histórico registra a partida inteira mão a mão: blinds, cada ação com valores, cartas mostradas e vencedores, tudo colorido para leitura rápida. O botão de exportação salva o registro num arquivo se você quiser rever uma sessão depois.'] },
        { id: 'odds', t: 'Chances (monitor de probabilidades)',
          b: ['A aba Chances mostra, para a sua mão atual, a probabilidade ao vivo de terminar com cada uma das 10 categorias de mãos — de High Card a Royal Flush — cada uma com ícone, porcentagem e barra. A exibição esmaece assim que você desiste. Ela usa somente suas cartas e as comunitárias: não vê nada que os adversários não mostrem.'] },
        { id: 'journal', t: 'Registros de mãos e a janela \u201cLogs\u201d',
          b: ['Além do histórico ao vivo, cada mão que você joga é gravada localmente no navegador, no mesmo formato dos arquivos de log .pdb do cliente oficial. A janela Logs (Opções avançadas \u2192 Mensagens de log \u2192 Gerenciar logs\u2026) lista suas sessões e deixa você trabalhar com elas: visualizar uma sessão com busca e destaque, filtrar por partida, exportar em HTML ou texto simples, salvar o arquivo .pdb bruto, ou importar um .pdb gravado pelo cliente de desktop. As sessões são apagadas uma a uma ou todas de uma vez (com confirmação), e uma retenção automática pode manter só os últimos 7, 30, 90, 180 ou 365 dias. Os registros que você importa nunca são removidos automaticamente. Um segundo ajuste limita quantas sessões são mantidas, e a coluna da lista pode ser alargada arrastando.',
              'Para limpar várias sessões de uma vez, o botão Selecionar… mostra uma caixa em cada entrada: marque as que não quer mais e Excluir apaga todo o lote após uma única confirmação. No computador, Ctrl (⌘) + clique adiciona sessões uma a uma e Shift + clique abrange um intervalo inteiro.',
              'O botão Analisar roda uma análise de mãos sobre uma sessão e pode enviar um log ao serviço de análise do pokerth.net. Tudo fica no seu dispositivo enquanto você não exportar ou enviar explicitamente.'] },
        { id: 'logopts', t: 'Opções de registro',
          b: ['Em Opções avançadas \u2192 Mensagens de log você pode ligar ou desligar o registro e escolher o intervalo de escrita, com os mesmos três ajustes do cliente de desktop: após cada ação, após cada mão (padrão) ou após cada jogo. Outra opção grava o arquivo .pdb em uma pasta à sua escolha e o mantém atualizado nesse intervalo, e mais uma vez quando você sai da página, para que outra ferramenta possa acompanhar o jogo ao vivo.'],
          note: 'Gravar em uma pasta local exige a API File System Access: apenas Chrome, Edge e Opera de desktop. Nos demais a opção se explica e a exportação manual pela janela de logs continua disponível. Um navegador só consegue substituir um arquivo, nunca acrescentar, então uma ferramenta que lê o .pdb deve reabri-lo após cada mudança.' },
        { id: 'assist', t: 'Assistência (força da mão)',
          b: ['No topo da aba Chances, o banner de assistência lê a sua mão por você. Antes do flop, nomeia sua mão inicial e a avalia com estrelas; do flop em diante, mostra sua melhor combinação atual e, após uma simulação rápida, sua chance estimada de vencer a mão em porcentagem, com um indicador de cor do vermelho (fraca) ao verde (forte). Como o monitor de probabilidades, usa apenas informações que você pode ver.',
              'Dois estilos de exibição estão em Opções avançadas \u2192 Assentos: Segmentos (dez blocos) ou uma barra de progresso clássica. Toda a assistência é desativável em Opções avançadas \u2192 Assistência.'] },
        { id: 'assistwin', t: 'A assistência como widget flutuante',
          b: ['O bloco de assistência pode se soltar do painel numa janelinha própria sempre por cima: use o botão de soltar no bloco, depois mova e redimensione onde quiser sobre a mesa — prático para vigiar a força da mão sem o painel inteiro aberto. O botão de encaixe o devolve à aba Chances, e a posição fica memorizada. No painel, uma alça de arraste entre a Assistência e as chances deixa você dividir o espaço entre as duas.'] },
        { id: 'stats', t: 'Estatísticas',
          b: ['A aba Estatísticas acompanha sua sessão: mãos jogadas, flops vistos, showdowns, taxas de vitória e mais. O acompanhamento estatístico é desativável nas Opções avançadas.'] },
        { id: 'hud', t: 'HUD de estatísticas nos assentos (beta)',
          b: ['O HUD anexa uma pequena caixa de estatísticas ao lado do lugar de cada jogador, construída a partir das mãos que você registrou nos seus registros: número de mãos observadas, depois VPIP (com que frequência ele coloca dinheiro voluntariamente pre-flop), PFR (aumentos pre-flop) e AF (fator de agressividade), com um código de cores do passivo ao agressivo. Abaixo, um emblema resume o jogador por extenso \u2014 Fechado-Passivo, Aberto-Agressivo, etc. \u2014 ao lado de um pequeno quadrante cujo setor aceso se lê da esquerda para a direita do fechado ao aberto, e de baixo para cima do passivo ao agressivo. O emblema aparece já na primeira mão, mas fica esmaecido até 25 mãos, limiar a partir do qual se torna confiável. Toque em uma caixa para um popover detalhado com todos os números (3-bet, continuation bet, fold ao 3-bet, tentativas de roubo, taxas de showdown\u2026), e arraste-a se ela cobrir alguma coisa.',
              'O HUD só conhece o que você viu nas suas próprias mesas — ele lê seus registros locais de mãos, então o registro precisa estar ligado e os números ganham sentido depois de mãos suficientes. É um recurso beta, desligado por padrão: ligue-o em Opções avançadas \u2192 Assistência.'] },
        { id: 'handsbtn', t: 'Resumo das combinações',
          b: ['O ícone das mãos de pôquer sobre o pano abre a qualquer momento um resumo rápido das 10 combinações — prático enquanto você aprende. Pode ser ocultado nas Opções avançadas.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat e social',
      sections: [
        { id: 'panels', t: 'Chat do lobby e chat da mesa',
          b: ['Há um chat no lobby e outro na mesa. No celular, o chat da mesa flutua sobre o jogo; em telas maiores é uma janela móvel e redimensionável. Um selo no botão do chat conta as mensagens não lidas.'] },
        { id: 'typing', t: 'Ajudas de digitação',
          list: [
            'Tab completa um apelido — aperte Tab de novo para percorrer as correspondências.',
            '\u2191 / \u2193 percorrem o histórico das suas mensagens.',
            'O botão de emoji abre um seletor completo; digitar : também sugere emotes enquanto você escreve.'] },
        { id: 'emotes', t: 'Emotes e carinhas',
          b: ['O chat converte os códigos de emotes exatamente como o cliente de desktop oficial: digite um nome entre dois-pontos e ele vira o emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 mais de 1.900 códigos são aceitos (o conjunto completo do GitHub). As carinhas de texto clássicas também são convertidas: :-) ;) :D xD :P <3 e mais uns oitenta.',
              'Digitar : abre uma caixa de sugestões que completa o código enquanto você digita (\u2191/\u2193 para escolher, Tab ou Enter para aceitar). A conversão de emojis é totalmente desativável em Opções avançadas \u2192 Chat.'] },
        { id: 'commands', t: 'Comandos do chat',
          b: ['O chat entende comandos com barra. Dois são visíveis para os outros:'],
          keys: [
            ['/me <texto>', 'Mensagem de ação, exibida como \u201c* seuapelido texto\u201d'],
            ['/emoji <emoji>', 'Toca uma reação emoji (o que o seletor de reações envia)']] },
        { id: 'diagcmds', t: 'Comandos de diagnóstico',
          b: ['Todo o resto é local: só você vê as respostas e nada é enviado à mesa. Digite /help para listar todos. Os mais úteis:'],
          keys: [
            ['/help', 'Listar todos os comandos'],
            ['/update', 'Verificar se há versão nova e atualizar'],
            ['/lang <código>', 'Trocar de idioma (ex.: /lang pt)'],
            ['/sound on|off', 'Ligar/silenciar os sons do jogo'],
            ['/zoom', 'Alternar a lupa da mesa'],
            ['/clear', 'Limpar o chat localmente'],
            ['/table', 'Informações da partida atual (blinds, jogadores, stacks)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnósticos do estado do cliente, da rede e da fluidez'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Depuração avançada (cartas, protocolo, áudio, armazenamento, assentos)'],
            ['/copy', 'Copiar a última resposta de comando para a área de transferência']] },
        { id: 'reactions', t: 'Reações emoji',
          b: ['O botão de reação abre um seletor de 30 reações animadas (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) que tocam com um efeito sobre o seu assento, visíveis para a mesa inteira — inclusive jogadores do cliente de desktop. As reações são totalmente desativáveis nas Opções avançadas.'] },
        { id: 'translate', t: 'Entender todo mundo',
          b: ['Com a tradu\u00e7\u00e3o do chat ativada, um bot\u00e3o de tradu\u00e7\u00e3o aparece na linha sob o ponteiro \u2014 ou na linha que voc\u00ea tocar, em tela sens\u00edvel ao toque \u2014 e mostra a mensagem no seu idioma com o tradutor do navegador. Ele pode ficar sempre vis\u00edvel em todas as linhas em Op\u00e7\u00f5es avan\u00e7adas \u2192 Chat, onde tamb\u00e9m fica a dica que explica as abrevia\u00e7\u00f5es de mesa (gg, nh, utg\u2026).'],
          note: 'A tradução usa o serviço Google Translate e funciona em qualquer navegador — só precisa de conexão com a internet. Uma mensagem só é enviada ao serviço de tradução quando você toca no botão de traduzir dela, nunca automaticamente.' },
        { id: 'social', t: 'Jogadores: perfil, convidar, ignorar',
          b: ['Toque em qualquer jogador — na mesa ou na lista do lobby — para abrir a ficha dele: perfil e estatísticas, convidá-lo para a sua partida, ou ignorá-lo (as mensagens dele no chat ficam ocultas; ignorar é reversível a qualquer momento). Uma confirmação antes de convidar/ignorar pode ser ativada nas opções.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby e partidas',
      sections: [
        { id: 'list', t: 'A lista de partidas',
          b: ['O lobby lista todas as mesas do servidor. Cada entrada mostra o número de jogadores, o tipo de partida, um cadeado quando senha ou convite são exigidos, e um selo de status: \u201cAguardando\u201d (verde — a partida não começou, você pode entrar se houver assento livre), \u201cEm andamento\u201d (cor quente — assistível ao vivo quando espectadores são permitidos) e \u201cFechada\u201d (esmaecido). Uma mesa cheia se reconhece simplesmente pelo contador cheio, tipo 10/10; as cores dos selos seguem o tema ativo.',
              'O menu de filtro estreita a lista exatamente como o cliente de desktop, cada escolha mais rígida que a anterior: só partidas abertas \u2192 escondendo também as mesas cheias \u2192 depois só as não privadas, só as privadas, ou só as partidas ranqueadas. Sua escolha fica memorizada. O campo de busca encontra uma partida pelo nome, e o selo de jogadores abre a lista de todos os conectados, pesquisável e ordenável.'] },
        { id: 'join', t: 'Entrar e assistir',
          b: ['Selecione uma partida aberta e entre — um cadeado indica que uma senha é exigida. Partidas em andamento que admitem espectadores podem ser assistidas ao vivo: você vê a mesa e o chat, mas as cartas fechadas ficam ocultas e você não pode agir.'] },
        { id: 'gameinfo', t: 'Informações da partida',
          b: ['Antes de entrar, a ficha de informações da partida mostra tudo o que define a mesa: tipo de partida, blinds e sua progressão (dobra ou lista manual), stack inicial, tempo de ação, pausa entre as mãos, e quem já está sentado.'] },
        { id: 'create', t: 'Criar uma partida',
          b: ['Crie sua própria mesa: nome, número de jogadores, stack inicial, primeiro small blind e progressão de aumentos, tempo de ação, e se espectadores são permitidos. Existem quatro tipos de partidas: Normal (todos), só jogadores registrados, só por convite, e Ranqueada (conta para o ranking oficial — sem senha possível nesse caso). Suas configurações favoritas podem ser salvas e recarregadas.'] },
        { id: 'invites', t: 'Convites',
          b: ['Os jogadores podem convidar você para a mesa deles; você recebe uma notificação que pode aceitar ou recusar. Ser convidado é o único jeito de entrar numa partida só por convite.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Sua conta',
          b: ['O servidor oficial de Internet é o pokerth.net. Jogar lá exige uma conta pokerth.net gratuita — registre-se no site e depois entre aqui com o mesmo apelido e senha. Este cliente web conecta ao mesmíssimo servidor do cliente de desktop: mesmas contas, mesmas mesas, mesmos rankings, e você pode sentar numa mesa com jogadores do cliente de desktop.'] },
        { id: 'ranked', t: 'Partidas ranqueadas e temporadas',
          b: ['Partidas do tipo Ranqueada contam para o ranking oficial da temporada. Seu perfil no aplicativo mostra sua data de registro, seu Rank da temporada atual, sua Pontuação, sua média e suas partidas jogadas, além dos últimos resultados. Partidas normais (não ranqueadas) são só por diversão e não mudam nada.'] },
        { id: 'rankhow', t: 'Como a classificação é calculada',
          b: ['Em cada partida classificatória sua colocação rende pontos: 15 para o primeiro, depois 9, 6, 4, 3, 2 e 1 até o sétimo; do oitavo ao décimo, nada. Uma mesa distribui portanto 40 pontos no total.',
              'Seu Score não é a soma desses pontos, mas sua média por partida, amortecida por um fator que cresce com o número de partidas jogadas: alguns bons resultados não bastam para se firmar no topo, também é preciso regularidade — quanto mais você joga, mais seu Score se aproxima da sua média real. As temporadas duram um trimestre: na virada tudo é arquivado e os contadores voltam a zero, e as temporadas passadas continuam consultáveis. Na partida, o botão do pódio mostra a classificação da temporada dos jogadores da sua mesa.'],
          note: 'A tabela de pontos e a fórmula exata são definidas pelo servidor de classificação do pokerth.net e podem mudar; as páginas do site é que valem.' },
        { id: 'rankings', t: 'Páginas de ranking',
          b: ['A entrada de ranking abre o ranking oficial do PokerTH, pesquisável por jogador, além dos rankings comunitários (BBC, WEC). Se rankings não interessam a você, a entrada pode ser ocultada em Opções avançadas \u2192 Comunidade.'] },
        { id: 'cups', t: 'As copas da comunidade: BBC e WeCup',
          b: ['Duas comunidades organizam suas próprias competições no pokerth.net, cada uma com seu site e sua classificação. A Best Brainies Cup (BBC) é um torneio por etapas nascido em 2013: você avança do Step 1 ao Step 4, e uma nova temporada começa depois de cada partida de Step 4, quando a copa é entregue. A WeCup (WEC) tem sua própria tabela, bem mais espalhada — 75 pontos para o primeiro lugar, depois 45, 30, 20… — e seu score normaliza sua média conforme o número de partidas que você jogou em comparação com os demais membros.',
              'As duas classificações abrem pelo botão do troféu, ao lado da classificação do PokerTH. Os ajustes de mesa dessas competições vêm como predefinições ao criar uma partida (BBC Step 1 a 4, WEC, WEC Monthly Final e WEC Grand Final), então dá para treinar nas mesmas condições. Participar exige cadastro no site da copa em questão.'],
          note: 'Esses conteúdos somem de uma vez em Opções avançadas → Comunidade, se copas não forem o seu interesse.' },
        { id: 'forumcups', t: 'Copas do fórum e eventos',
          b: ['O fórum do pokerth.net também abriga a Monthly Cup, uma série mensal em que os jogadores se dividem em mesas Gold, Silver e Bronze antes de o campeão do mês ser coroado, além de copas especiais pontuais ao longo do ano.',
              'Inscrições, horários, ajustes de mesa e resultados são publicados no fórum, e as partidas acontecem no servidor oficial como qualquer outra. Uma conta pokerth.net basta para acompanhar os resultados; inscrever-se numa copa passa pelo tópico correspondente do fórum.'] },
        { id: 'forumnews', t: 'Novidades do fórum no lobby',
          b: ['O botão de jornal no cabeçalho do lobby abre as últimas mensagens do fórum pokerth.net, uma entrada por tópico, cada fórum com sua cor. O selo no botão conta as mensagens não lidas; abrir uma mensagem (nova aba) a marca como lida, e “Marcar tudo como lido” limpa tudo de uma vez.',
              'É um extra web: o botão pode ser ocultado nas Opções avançadas (“Botão do fórum no cabeçalho do lobby”).'] },
        { id: 'avatars', t: 'Avatares e bandeiras',
          b: ['No pokerth.net, seu avatar é distribuído aos outros jogadores pelo servidor de avatares, e uma pequena bandeira do país pode aparecer nas caixas de jogadores. Ambos são opcionais e configuráveis nas opções.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Modo treino',
      sections: [
        { id: 'what', t: 'O que é',
          b: ['O modo Local / treino é uma partida completa contra adversários controlados pelo computador: sem conexão, sem conta, nada em jogo. Uma vez instalado o aplicativo (ou apenas visitado uma vez), funciona totalmente offline — perfeito para aprender o jogo, testar a interface ou passar o tempo no modo avião.'] },
        { id: 'setup', t: 'Configurar uma partida',
          b: ['Escolha o número de adversários, o stack inicial, os blinds e sua progressão, e a velocidade do jogo. A composição e a dificuldade dos bots se ajustam em Opções avançadas \u2192 Partida local — de adversários leves a uma mesa mais dura e variada.'] },
        { id: 'trophies', t: 'Troféus',
          b: ['O modo treino tem sua própria progressão: 28 troféus em seis categorias (progressão, técnica, estilo, formatos, diversão e uma secreta) são desbloqueados jogando — mãos jogadas, partidas vencidas, grandes blefes, mãos especiais e mais. Seu progresso de troféus é acumulativo e se mescla entre dispositivos quando a sincronização de configurações da conta está ativa.'] },
        { id: 'learn', t: 'Um bom lugar para aprender',
          b: ['Tudo o que está descrito nos outros capítulos também funciona aqui: o monitor de probabilidades, a tela de assistência, a pré-seleção, os atalhos de teclado. O modo treino é o melhor lugar para experimentá-los sem pressão antes de partir para o pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Estilo e som',
      sections: [
        { id: 'themes', t: 'Temas',
          b: ['A categoria Estilo das Opções avançadas veste o cliente inteiro. Os presets configuram tudo num toque (o clássico cassino verde, o visual oficial do PokerTH\u2026); abaixo, eixos individuais afinam separadamente a paleta de cores, o pano da mesa e as faces das cartas — mude qualquer eixo e sua mistura vira um tema personalizado. O modo escuro, claro ou automático é escolhido em Interface do usuário, e suas escolhas valem na hora, em todas as telas, e ficam memorizadas.'] },
        { id: 'tablelook', t: 'Mesas, baralhos, assentos',
          b: ['Além do tema, vários elementos se trocam de forma independente: o fundo da mesa, o baralho, o verso das cartas (combinando com o baralho automaticamente, ou importe sua própria imagem), as fichas de dealer e blinds, o estilo dos botões de ação, e pacotes de assentos completos que revestem as caixas de jogadores. Escolha tudo em Opções avançadas \u2192 Estilo; as mudanças aparecem na mesa imediatamente.'] },
        { id: 'music', t: 'Reprodutor de música',
          b: ['A entrada de música dos menus do cabeçalho abre um pequeno reprodutor de música ambiente: escolha uma faixa da playlist, tocar/pausar, anterior/próxima, aleatório, e repetição de uma faixa, da playlist inteira ou de nada. O volume, a faixa escolhida e o modo de repetição ficam memorizados. A reprodução nunca começa sozinha — os navegadores exigem um toque — e o reprodutor é totalmente independente dos efeitos sonoros do jogo.'] },
        { id: 'sounds', t: 'Efeitos sonoros',
          b: ['Os sons do jogo se agrupam em quatro categorias ativáveis separadamente, exatamente como no cliente de desktop: ações de jogo (cartas distribuídas, Check, Call, Raise, sua vez\u2026), notificação do chat do lobby, notificações de partida em rede (jogador entrou, partida pronta) e notificação de subida de blinds. Um único controle de volume regula todos, em Opções avançadas \u2192 Som.'],
          note: 'Todos os navegadores — o iOS em particular — se recusam a tocar som antes de você tocar a página uma vez. Se uma partida começar em silêncio, um único toque em qualquer lugar acorda o som; o cliente também conserta automaticamente o motor de áudio quando o iOS o suspende (chamada recebida, segundo plano\u2026).' },
        { id: 'voice', t: 'Voz e vibração',
          b: ['Dois canais extras podem manter você informado sem olhar a tela: os anúncios de voz leem em voz alta os eventos do jogo pela síntese de voz do dispositivo, e no celular uma vibração curta pode marcar a sua vez. Ambos são extensões web, ativas ou não por padrão conforme o dispositivo, em Opções avançadas \u2192 Apostas e vez.'],
          note: 'A vibração funciona no Android (navegadores Chromium); a Apple não expõe uma API de vibração aos sites, então iPhones não podem vibrar. Os anúncios de voz funcionam em todo lugar, mas as vozes e idiomas disponíveis dependem do seu sistema — o cliente usa a melhor correspondência que encontrar.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opções e atalhos',
      sections: [
        { id: 'where', t: 'Onde as opções moram',
          b: ['As Opções avançadas abrem pela entrada da engrenagem de qualquer menu do cabeçalho. Estão agrupadas como no cliente de desktop: Interface do usuário, Estilo, Som, Partida local, Partida em rede, Partida pela Internet, Apelidos / Avatares, Mensagens de log, e Restaurar padrões. Cada recurso específico da web tem lá seu próprio interruptor, para você desligar tudo o que não usa.'] },
        { id: 'cfgxml', t: 'Trocar configurações com o cliente de desktop',
          b: ['Suas configurações podem viajar entre clientes: a categoria Mensagens de log oferece exportar/importar o arquivo config.xml oficial (o \u007e/.pokerth/config.xml usado pelos clientes de desktop e QML). A exportação grava as configurações compartilhadas — nome, opções de exibição, sons, preferências de mesa, blinds, estilos — e a importação aplica aqui um arquivo do desktop. As configurações que este cliente não conhece ficam intactas no arquivo.'] },
        { id: 'sync', t: 'Configurações que seguem você',
          b: ['Quando você joga com uma conta, suas opções, seu tema, seus atalhos de teclado, seu idioma e seus troféus de treino são sincronizados: mude algo num dispositivo e o próximo dispositivo em que você entrar recebe a mudança. O progresso dos troféus é mesclado, nunca sobrescrito, então jogar em dois dispositivos sempre guarda o melhor dos dois.'] },
        { id: 'updates', t: 'Manter-se atualizado',
          b: ['O cliente se atualiza sozinho: quando uma nova versão é publicada, um aviso convida você a recarregar (ou digite /update no chat para verificar manualmente). De vez em quando pode aparecer uma pequena pesquisa de produto pedindo sua opinião sobre um recurso — participar é opcional e as pesquisas são totalmente desativáveis em Opções avançadas \u2192 Comunidade.'] },
        { id: 'fkeys', t: 'Atalhos de teclado oficiais',
          b: ['As teclas de fun\u00e7\u00e3o oficiais do PokerTH funcionam durante uma partida \u2014 Alt+S funciona em qualquer lugar:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (ordem inversível nas opções)'],
            ['F5', 'Mostrar suas cartas (quando possível)'],
            ['F6 / F7 / F8', 'Manual \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manual \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Histórico \u00b7 Painel de chances'],
            ['Alt+S', 'Configura\u00e7\u00f5es \u2014 em qualquer parte do aplicativo, n\u00e3o s\u00f3 na partida'],
            ['F11', 'Tela cheia']],
          note: 'Os atalhos exigem um teclado físico. No Mac, as teclas F controlam a mídia por padrão: segure Fn (ou ative \u201cUsar as teclas F1, F2 etc. como teclas de função padrão\u201d nos ajustes do macOS). No iPhone, a tela cheia é limitada pelo iOS — instalar o aplicativo como PWA dá a mesma experiência de tela cheia.' },
        { id: 'webkeys', t: 'Teclas de letra da web',
          b: ['Extens\u00e3o web: as teclas de uma s\u00f3 letra e Alt+T tamb\u00e9m disparam a\u00e7\u00f5es, e todas podem ser remapeadas em Op\u00e7\u00f5es avan\u00e7adas \u2192 Atalhos de teclado:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Painel de estat\u00edsticas'],
            ['Esc', 'Fechar a janela da frente (também o botão Voltar do Android)']],
          note: 'No Android, o botão/gesto Voltar do sistema fecha as janelas como Esc em vez de sair da partida (configurável nas opções). O iOS não tem botão de sistema equivalente — use o \u2715 de cada janela.' }
      ]
    }
  ]
};
