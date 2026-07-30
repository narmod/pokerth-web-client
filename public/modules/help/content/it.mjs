// ── help/content/it.mjs — Corpus di aiuto italiano (Lotto 2) ────────────────
// Traduzione di en.mjs (riferimento). Struttura e id identici; solo
// t / b / list / keys (etichette) / note sono tradotti. I termini del poker
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) restano in
// inglese, secondo la convenzione dell'applicazione.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Primi passi',
      sections: [
        { id: 'modes', t: 'Tre modi di giocare',
          b: ['Dalla schermata di accesso, scegli come vuoi giocare.'],
          list: [
            'Internet — gioca online sul server ufficiale pokerth.net, con classifiche. Serve un account pokerth.net; la registrazione su pokerth.net è gratuita.',
            'Locale / allenamento — gioca offline contro i bot. Niente da configurare, funziona senza connessione e sblocca trofei man mano che progredisci.',
            'LAN / server dedicato — collegati a un server PokerTH privato sulla tua rete locale o sulla tua macchina.'] },
        { id: 'lan', t: 'LAN / server dedicato',
          b: ['La terza modalità si collega a qualsiasi server PokerTH gestito da te o da un amico — su una rete domestica, un VPS privato, ovunque. Inserisci indirizzo e porta del server, spunta TLS se il server usa una porta cifrata, e accedi con un nickname (l\u2019accesso ospite funziona se il server lo consente). Al tavolo tutto si comporta poi esattamente come sul server ufficiale.'] },
        { id: 'famboard', t: 'Classifica di famiglia',
          b: ['Solo sui server privati e nelle partite LAN, il client conserva statistiche cumulative per nickname — mani e partite giocate e vinte, vincita più grande, miglior serie — e le condivide tramite il server, così ogni dispositivo attorno al tavolo vede la stessa classifica. Le partite su pokerth.net non vengono mai tracciate in questo modo, e le statistiche della modalità allenamento restano completamente separate.'] },
        { id: 'language', t: 'Lingua',
          b: ['L\u2019interfaccia è disponibile in 36 lingue. Cambiala in qualsiasi momento nelle Opzioni avanzate (menu con l\u2019ingranaggio), categoria Interfaccia utente. I termini d\u2019azione del poker (Fold, Check, Call, Bet, Raise, All-In) restano in inglese per convenzione, esattamente come nel client desktop.'] },
        { id: 'pwa', t: 'Installare come app',
          b: ['Questo client è una Progressive Web App: puoi installarlo dal menu del browser (o dal pulsante di installazione nell\u2019intestazione) per avere un\u2019app a schermo intero con la sua icona. Una volta installata parte all\u2019istante e la modalità allenamento funziona completamente offline.'],
          note: 'Su Android e su Chrome/Edge desktop, il pulsante di installazione fa tutto. Su iPhone/iPad, Apple consente l\u2019installazione solo tramite Safari: pulsante Condividi \u2192 «Aggiungi alla schermata Home» — il client mostra questi passaggi quando serve. Il pulsante scompare una volta installata l\u2019app.' },
        { id: 'platforms', t: 'Piattaforme e browser',
          b: ['Il client funziona in qualsiasi browser moderno su qualsiasi sistema — Windows, macOS, Linux, Android, iOS. Alcune funzioni si basano su API recenti dei browser; quando un\u2019API manca, la funzione si nasconde o si spiega invece di rompersi. Le principali differenze da conoscere:'],
          list: [
            'Chrome / Edge (desktop): funziona tutto, compresa la scrittura del log .pdb in una cartella.',
            'Firefox: tutto, tranne la scrittura del .pdb in una cartella (API non ancora disponibile).',
            'Safari / iOS: l\u2019installazione passa per Condividi \u2192 «Aggiungi alla schermata Home»; niente vibrazione; schermo intero limitato su iPhone; l\u2019audio parte dopo il tuo primo tocco.',
            'Android: supporto completo nei browser Chromium, comprese la vibrazione e il comportamento del tasto Indietro.'] },
        { id: 'avatar', t: 'Nickname e avatar',
          b: ['Scegli nickname e avatar nella schermata di accesso prima di collegarti. Su pokerth.net il tuo nickname è il nome del tuo account; gli avatar sono condivisi con gli altri giocatori tramite il server degli avatar.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Regole del poker',
      sections: [
        { id: 'basics', t: 'Il Texas Hold\u2019em in breve',
          b: ['PokerTH si gioca a Texas Hold\u2019em No-Limit. Ogni giocatore riceve due carte private (le hole cards). Cinque carte comuni vengono poi distribuite scoperte al centro del tavolo. La migliore mano di cinque carte formata da qualsiasi combinazione delle tue due carte e delle cinque comuni vince il piatto.'] },
        { id: 'blinds', t: 'I bui e il bottone del dealer',
          b: ['Prima di ogni mano, due puntate obbligatorie alimentano il piatto: il piccolo buio e il grande buio, messi dai due giocatori a sinistra del bottone del dealer. Il bottone avanza di un posto in senso orario dopo ogni mano, così tutti pagano i bui a turno. I bui salgono a intervalli regolari nel corso della partita.',
              'Sul tavolo, bottone e bui sono contrassegnati da gettoni: D (dealer), SB (piccolo buio), BB (grande buio).'] },
        { id: 'streets', t: 'I quattro giri di puntate',
          list: [
            'Pre-flop — dopo la distribuzione delle carte private, il primo giro di puntate parte a sinistra del grande buio.',
            'Flop — tre carte comuni vengono scoperte, seguite da un giro di puntate.',
            'Turn — una quarta carta comune, poi un altro giro di puntate.',
            'River — la quinta e ultima carta comune, poi il giro di puntate finale.'],
          b: ['Un giro di puntate termina quando ogni giocatore ancora in mano ha messo la stessa somma nel piatto (o è all-in).'] },
        { id: 'actions', t: 'Cosa puoi fare al tuo turno',
          list: [
            'Fold — abbandonare la mano. Le tue carte vengono scartate e non concorri più al piatto.',
            'Check — passare senza puntare. Possibile solo quando non c\u2019è nulla da pagare.',
            'Call — vedere la puntata in corso.',
            'Bet — aprire le puntate quando nessuno ha ancora puntato in questa street.',
            'Raise — rilanciare sopra una puntata esistente. Il rilancio minimo eguaglia la puntata o il rilancio precedente.',
            'All-In — mettere tutto il tuo stack. Resti in mano fino all\u2019importo che hai coperto.'] },
        { id: 'showdown', t: 'Showdown e piatti divisi',
          b: ['Se dopo il giro di puntate del river restano più giocatori, le mani vengono mostrate e vince la migliore — la combinazione vincente è visualizzata sotto le carte comuni. Quando un giocatore è all-in per meno delle puntate complete, si creano piatti secondari: ogni giocatore può vincere solo la parte di piatto a cui ha contribuito. Le mani pari si dividono il piatto.'] },
        { id: 'hands', t: 'Classifica delle mani',
          b: ['Dalla più debole alla più forte:'],
          list: [
            '1. High Card — nessuna combinazione; decide la carta più alta.',
            '2. Pair — due carte dello stesso valore.',
            '3. Two Pair — due coppie diverse.',
            '4. Three of a Kind — tre carte dello stesso valore.',
            '5. Straight — cinque carte in sequenza (l\u2019Asso vale alto o basso).',
            '6. Flush — cinque carte dello stesso seme.',
            '7. Full House — un tris più una coppia.',
            '8. Four of a Kind — quattro carte dello stesso valore.',
            '9. Straight Flush — una scala, tutta dello stesso seme.',
            '10. Royal Flush — dal Dieci all\u2019Asso, in un solo seme. La mano migliore possibile.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'La schermata di gioco',
      sections: [
        { id: 'actionbar', t: 'La barra delle azioni',
          b: ['Quando è il tuo turno, la barra delle azioni in basso si accende con fino a quattro pulsanti: Fold (rosso), Check / Call (blu), Bet / Raise (verde — l\u2019azione principale, evidenziata) e All-In (rosso scuro). Il pulsante Check / Call mostra l\u2019importo esatto da vedere; Bet / Raise mostra l\u2019importo che stai per mettere. Dopo il river, All-In può diventare un pulsante Show per mostrare le tue carte.'] },
        { id: 'betctl', t: 'Scegliere la puntata',
          b: ['Regola l\u2019importo del rilancio con il campo numerico, lo slider o i pulsanti rapidi 1/3 \u00b7 1/2 \u00b7 Pot (frazioni del piatto corrente). Gli importi sono arrotondati automaticamente e mantenuti tra il rilancio minimo e massimo consentiti. Se preferisci ragionare in grandi bui, un\u2019opzione mostra tutti gli importi in BB invece che in gettoni.'] },
        { id: 'preselect', t: 'Preselezionare un\u2019azione',
          b: ['Prima del tuo turno puoi armare un\u2019azione in anticipo: tocca un pulsante e prende un bordo dorato con un puntino dorato. Quando arriva il tuo turno, l\u2019azione parte all\u2019istante. Un Fold preselezionato diventa automaticamente Check quando il check è gratuito — non passi mai per niente. Le preselezioni si azzerano a ogni nuova mano, cambio di street e showdown, e vengono annullate se la situazione cambia (per esempio se cambia l\u2019importo da vedere).'] },
        { id: 'automodes', t: 'Modalità automatiche',
          b: ['Il menu a tendina accanto ai pulsanti d\u2019azione offre tre modalità di gioco: Manuale, Auto Check/Call e Auto Check/Fold. Le modalità auto giocano per te finché non torni indietro — qualsiasi clic manuale su un\u2019azione riporta subito a Manuale.'] },
        { id: 'readtable', t: 'Leggere il tavolo',
          b: ['Ogni riquadro giocatore mostra avatar, nome, stack e puntata in corso. Dealer e bui sono contrassegnati da gettoni D / SB / BB. Un badge colorato sul riquadro indica l\u2019ultima azione del giocatore; una sottile barra blu scandisce il suo tempo di riflessione. Il riquadro del giocatore di turno si illumina; il tuo riquadro prende una cornice dorata pulsante al tuo turno.',
              'La barra di stato sopra il tavolo mostra il piatto totale, le puntate della street in corso, la fase (Pre-flop, Flop, Turn, River) e i numeri di partita e di mano. I giocatori passati hanno carte trasparenti; gli eliminati sono oscurati. A fine mano, una finestra del vincitore può riassumere chi ha vinto cosa — si disattiva nelle opzioni.'] },
        { id: 'seatlayout', t: 'Disposizione dei posti',
          b: ['Come estensione web, la disposizione dei riquadri giocatore si sceglie in Opzioni avanzate \u2192 Posti: Automatica segue il client ufficiale (posizioni fisse in verticale, ellisse calcolata in orizzontale), oppure forza la disposizione Verticale o Orizzontale — e Personalizzata ti lascia posizionare ogni posto da solo: appare una modalità di modifica in cui trascini ogni riquadro esattamente dove vuoi, e la disposizione viene salvata.'] },
        { id: 'zoom', t: 'Zoom del tavolo (telefoni)',
          b: ['Su schermi piccoli, i pulsanti lente ingrandiscono il tavolo (2\u00d7) e puoi trascinarlo col dito — il tuo riquadro e la barra delle azioni restano fissi. La vista segue automaticamente il posto attivo e si allontana allo showdown per la panoramica. Disattivabile nelle Opzioni avanzate.'],
          note: 'Su telefoni e tablet, lo zoom a pizzico del browser stesso è bloccato di default, così un gesto di zoom non scatta mai per sbaglio in piena mano; riattivalo in Opzioni avanzate \u2192 Interfaccia utente se preferisci.' },
        { id: 'protections', t: 'Anti-sbirciata e protezione dal Call accidentale',
          b: ['Due protezioni opzionali: l\u2019anti-sbirciata tiene coperte le tue carte finché non le tocchi (utile quando qualcuno può vedere il tuo schermo), e la guardia anti-Call accidentale blocca brevemente il pulsante Call subito dopo un grosso rilancio, così un tocco destinato a un Call più piccolo non finisce per sbaglio sull\u2019importo rilanciato. Entrambe vivono nelle Opzioni avanzate.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Pannello info',
      sections: [
        { id: 'open', t: 'Aprire il pannello',
          b: ['Durante una partita, il pannello info si apre dall\u2019intestazione (o Alt+L / Alt+I) e ha tre schede: Cronologia, Probabilità e Statistiche. Sul telefono fluttua sopra il tavolo; su schermi più grandi è una finestra spostabile e ridimensionabile — afferra la maniglia \u28ff per spostarla, i bordi per ridimensionarla. La sua posizione viene ricordata.'] },
        { id: 'log', t: 'Registro di partita',
          b: ['La scheda Cronologia registra tutta la partita mano per mano: bui, ogni azione con gli importi, carte mostrate e vincitori, il tutto a colori per una lettura rapida. Il pulsante di esportazione salva il registro in un file se vuoi rivedere una sessione più tardi.'] },
        { id: 'odds', t: 'Probabilità (monitor delle probabilità)',
          b: ['La scheda Probabilità mostra, per la tua mano attuale, la probabilità in tempo reale di chiudere con ciascuna delle 10 categorie di mani — da High Card a Royal Flush — ognuna con icona, percentuale e barra. La visualizzazione si oscura appena passi. Usa soltanto le tue carte e quelle comuni: non vede nulla che i tuoi avversari non mostrino.'] },
        { id: 'journal', t: 'Registri delle mani e la finestra «Logs»',
          b: ['Oltre alla cronologia dal vivo, ogni mano che giochi viene registrata localmente nel browser, nello stesso formato dei file di log .pdb del client ufficiale. La finestra Logs (Opzioni avanzate \u2192 Messaggi di log \u2192 Gestisci i log\u2026) elenca le tue sessioni e ti permette di lavorarci: vedere l\u2019anteprima di una sessione con ricerca ed evidenziazione, filtrare per partita, esportare in HTML o testo semplice, salvare il file .pdb grezzo, o importare un .pdb registrato dal client desktop. Le sessioni si eliminano una alla volta o tutte insieme (con conferma), e un\u2019impostazione di conservazione automatica può tenere solo gli ultimi 7, 30, 90, 180 o 365 giorni. I log che importi tu non vengono mai eliminati automaticamente. Una seconda impostazione limita quante sessioni vengono conservate e la colonna dell’elenco si può allargare trascinandola.',
              'Il pulsante Analizza esegue un\u2019analisi delle mani su una sessione e può inviare un log al servizio di analisi di pokerth.net. Tutto resta sul tuo dispositivo finché non esporti o invii esplicitamente.'] },
        { id: 'logopts', t: 'Opzioni di registrazione',
          b: ['In Opzioni avanzate \u2192 Messaggi di log puoi attivare o disattivare la registrazione e scegliere l\u2019intervallo di scrittura (dopo ogni azione, o una volta per mano), come nelle impostazioni del client desktop. Un\u2019opzione aggiuntiva scrive il file .pdb direttamente in una cartella a tua scelta e lo aggiorna dopo ogni mano — esattamente come il client desktop, così altri strumenti possono leggerlo dal vivo.'],
          note: 'Scrivere in una cartella locale richiede l\u2019API File System Access: solo Chrome ed Edge desktop. Firefox, Safari e i browser mobili non possono — l\u2019opzione mostra allora una breve spiegazione, e l\u2019esportazione manuale dalla finestra Logs resta disponibile ovunque.' },
        { id: 'assist', t: 'Assistenza (forza della mano)',
          b: ['In cima alla scheda Probabilità, il banner di assistenza legge la mano per te. Prima del flop nomina la tua mano di partenza e la valuta con stelle; dal flop in poi mostra la tua migliore combinazione attuale e, dopo una rapida simulazione, la tua probabilità stimata di vincere la mano in percentuale, con un indicatore di colore dal rosso (debole) al verde (forte). Come il monitor delle probabilità, usa solo informazioni che puoi vedere.',
              'Due stili di visualizzazione sono disponibili in Opzioni avanzate \u2192 Posti: Segmenti (dieci blocchi) o una classica barra di avanzamento. L\u2019intera funzione di assistenza si disattiva in Opzioni avanzate \u2192 Assistenza.'] },
        { id: 'assistwin', t: 'L\u2019assistenza come widget fluttuante',
          b: ['Il blocco di assistenza può essere staccato dal pannello in una sua piccola finestra sempre in primo piano: usa il pulsante di distacco sul blocco, poi spostala e ridimensionala ovunque sopra il tavolo — comodo per tenere d\u2019occhio la forza della mano senza il pannello completo aperto. Il pulsante di aggancio lo riporta nella scheda Probabilità, e la posizione viene ricordata. Nel pannello, una maniglia di trascinamento tra Assistenza e probabilità ti lascia ripartire lo spazio tra le due.'] },
        { id: 'stats', t: 'Statistiche',
          b: ['La scheda Statistiche segue la tua sessione: mani giocate, flop visti, showdown, percentuali di vittoria e altro. Il tracciamento statistico si disattiva nelle Opzioni avanzate.'] },
        { id: 'hud', t: 'HUD di statistiche sui posti (beta)',
          b: ['L\u2019HUD attacca un piccolo riquadro di statistiche accanto al posto di ogni giocatore, costruito dalle mani che hai registrato nei tuoi log: numero di mani osservate, poi VPIP (quanto spesso mette soldi volontariamente pre-flop), PFR (rilanci pre-flop), AF (fattore di aggressività), 3B (3-bet), CB (continuation bet) e F3B (fold al 3-bet), con codice colore dal passivo all\u2019aggressivo. Tocca un riquadro per un popover dettagliato con altri numeri (tentativi di furto, fold al furto, percentuali di showdown\u2026), e trascinalo se copre qualcosa.',
              'L\u2019HUD conosce solo ciò che hai visto ai tuoi tavoli — legge i tuoi log locali delle mani, quindi la registrazione deve essere attiva e i numeri diventano significativi dopo abbastanza mani. È una funzione beta, disattivata di default: attivala in Opzioni avanzate \u2192 Assistenza.'] },
        { id: 'handsbtn', t: 'Panoramica delle combinazioni',
          b: ['L\u2019icona delle mani di poker sul panno apre in qualsiasi momento una panoramica rapida delle 10 combinazioni — comoda mentre impari. Si nasconde nelle Opzioni avanzate.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat e social',
      sections: [
        { id: 'panels', t: 'Chat della lobby e chat del tavolo',
          b: ['C\u2019è una chat nella lobby e una al tavolo. Sul telefono, la chat del tavolo fluttua sopra il gioco; su schermi più grandi è una finestra spostabile e ridimensionabile. Un badge sul pulsante della chat conta i messaggi non letti.'] },
        { id: 'typing', t: 'Aiuti alla scrittura',
          list: [
            'Tab completa un nickname — premi ancora Tab per scorrere le corrispondenze.',
            '\u2191 / \u2193 scorrono la cronologia dei tuoi messaggi.',
            'Il pulsante emoji apre un selettore completo; digitare : suggerisce anche le emote mentre scrivi.'] },
        { id: 'emotes', t: 'Emote e smiley',
          b: ['La chat converte i codici delle emote esattamente come il client desktop ufficiale: scrivi un nome tra due punti e diventa l\u2019emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 sono supportati più di 1.900 codici (il set completo di GitHub). Anche i classici smiley testuali vengono convertiti: :-) ;) :D xD :P <3 e circa ottanta altri.',
              'Digitare : apre un riquadro di suggerimenti che completa il codice mentre scrivi (\u2191/\u2193 per scegliere, Tab o Invio per accettare). La conversione delle emoji si disattiva del tutto in Opzioni avanzate \u2192 Chat.'] },
        { id: 'commands', t: 'Comandi della chat',
          b: ['La chat capisce i comandi con la barra. Due sono visibili agli altri:'],
          keys: [
            ['/me <testo>', 'Messaggio d\u2019azione, mostrato come «* tuonick testo»'],
            ['/emoji <emoji>', 'Riproduce una reazione emoji (ciò che invia il selettore delle reazioni)']] },
        { id: 'diagcmds', t: 'Comandi di diagnostica',
          b: ['Tutto il resto è locale: le risposte le vedi solo tu e nulla viene inviato al tavolo. Digita /help per elencarli tutti. I più utili:'],
          keys: [
            ['/help', 'Elencare tutti i comandi'],
            ['/update', 'Controllare se c\u2019è una nuova versione e aggiornare'],
            ['/lang <codice>', 'Cambiare lingua (es. /lang it)'],
            ['/sound on|off', 'Attivare/silenziare i suoni di gioco'],
            ['/zoom', 'Attivare/disattivare la lente del tavolo'],
            ['/clear', 'Svuotare la chat localmente'],
            ['/table', 'Informazioni sulla partita in corso (bui, giocatori, stack)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostica dello stato del client, della rete e della fluidità'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Debug avanzato (carte, protocollo, audio, memoria, posti)'],
            ['/copy', 'Copiare l\u2019ultima risposta di comando negli appunti']] },
        { id: 'reactions', t: 'Reazioni emoji',
          b: ['Il pulsante delle reazioni apre un selettore di 30 reazioni animate (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) che si riproducono con un effetto sopra il tuo posto, visibili a tutto il tavolo — compresi i giocatori sul client desktop. Le reazioni si disattivano del tutto nelle Opzioni avanzate.'] },
        { id: 'translate', t: 'Capire tutti',
          b: ['Con la traduzione della chat attiva, un pulsante di traduzione compare sulla riga sotto il puntatore \u2014 o su quella che tocchi, su schermo tattile \u2014 e mostra il messaggio nella tua lingua con il traduttore del browser. Pu\u00f2 restare sempre visibile su tutte le righe da Opzioni avanzate \u2192 Chat, dove si trova anche il suggerimento che spiega le abbreviazioni da tavolo (gg, nh, utg\u2026).'],
          note: 'La traduzione usa il servizio Google Translate e funziona in ogni browser — serve solo una connessione internet. Un messaggio viene inviato al servizio di traduzione solo quando tocchi il suo pulsante di traduzione, mai automaticamente.' },
        { id: 'social', t: 'Giocatori: profilo, invitare, ignorare',
          b: ['Tocca un giocatore qualsiasi — al tavolo o nella lista della lobby — per aprire la sua scheda: profilo e statistiche, invitarlo alla tua partita, o ignorarlo (i suoi messaggi in chat vengono nascosti; ignorare è reversibile in qualsiasi momento). Una conferma prima di invitare/ignorare si può attivare nelle opzioni.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby e partite',
      sections: [
        { id: 'list', t: 'La lista delle partite',
          b: ['La lobby elenca tutti i tavoli del server. Ogni voce mostra il numero di giocatori, il tipo di partita, un lucchetto quando servono password o invito, e un badge di stato: «In attesa» (verde — la partita non è iniziata, puoi unirti se c\u2019è un posto libero), «In corso» (colore caldo — guardabile dal vivo quando gli spettatori sono ammessi) e «Chiusa» (oscurato). Un tavolo pieno si riconosce semplicemente dal contatore pieno, tipo 10/10; i colori dei badge seguono il tema attivo.',
              'Il menu a tendina del filtro restringe la lista esattamente come il client desktop, ogni scelta più severa della precedente: solo partite aperte \u2192 nascondendo anche i tavoli pieni \u2192 poi solo le non private, solo le private, o solo le partite classificate. La tua scelta viene ricordata. Il campo di ricerca trova una partita per nome, e il badge dei giocatori apre la lista di tutti i collegati, ricercabile e ordinabile.'] },
        { id: 'join', t: 'Unirsi e osservare',
          b: ['Seleziona una partita aperta e unisciti — un lucchetto segnala che serve una password. Le partite in corso che ammettono spettatori si possono guardare dal vivo: vedi tavolo e chat, ma le carte private restano coperte e non puoi agire.'] },
        { id: 'gameinfo', t: 'Informazioni sulla partita',
          b: ['Prima di unirti, la scheda informativa della partita mostra tutto ciò che definisce il tavolo: tipo di partita, bui e loro progressione (raddoppio o lista manuale), stack iniziale, tempo per l\u2019azione, pausa tra le mani, e chi è già seduto.'] },
        { id: 'create', t: 'Creare una partita',
          b: ['Crea il tuo tavolo: nome, numero di giocatori, stack iniziale, primo piccolo buio e progressione dei rilanci, tempo per l\u2019azione, e se ammettere spettatori. Esistono quattro tipi di partite: Normale (tutti), solo giocatori registrati, solo su invito, e Classificata (conta per la classifica ufficiale — in quel caso niente password). Le tue impostazioni preferite si possono salvare e ricaricare.'] },
        { id: 'invites', t: 'Inviti',
          b: ['I giocatori possono invitarti al loro tavolo; ricevi una notifica che puoi accettare o rifiutare. Essere invitati è l\u2019unico modo per entrare in una partita solo su invito.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Il tuo account',
          b: ['Il server Internet ufficiale è pokerth.net. Per giocarci serve un account pokerth.net gratuito — registrati sul sito, poi accedi qui con lo stesso nickname e la stessa password. Questo client web si collega allo stesso server del client desktop: stessi account, stessi tavoli, stesse classifiche, e puoi sederti a un tavolo con giocatori del client desktop.'] },
        { id: 'ranked', t: 'Partite classificate e stagioni',
          b: ['Le partite di tipo Classificata contano per la classifica ufficiale della stagione. Il tuo profilo nell\u2019app mostra la data di iscrizione, il Rango della stagione in corso, il Punteggio, la media e le partite giocate, oltre agli ultimi risultati. Le partite normali (non classificate) sono solo per divertimento e non cambiano nulla.'] },
        { id: 'rankhow', t: 'Come viene calcolata la classifica',
          b: ['In ogni partita classificata il tuo piazzamento vale punti: 15 per il primo, poi 9, 6, 4, 3, 2 e 1 fino al settimo; dall\u2019ottavo al decimo, niente. Un tavolo distribuisce quindi 40 punti in tutto.',
              'Il tuo Score non è la somma di quei punti, ma la tua media a partita, smorzata da un fattore che cresce con il numero di partite giocate: qualche buon risultato non basta per sistemarsi in alto, serve anche costanza — più giochi, più il tuo Score si avvicina alla tua media reale. Le stagioni durano un trimestre: al cambio tutto viene archiviato e i contatori ripartono da zero, mentre le stagioni passate restano consultabili. In partita, il pulsante podio mostra la classifica di stagione dei giocatori al tuo tavolo.'],
          note: 'Il punteggio per piazzamento e la formula esatta sono decisi dal server di classifica di pokerth.net e possono cambiare; fanno fede le pagine del sito.' },
        { id: 'rankings', t: 'Pagine di classifica',
          b: ['La voce classifica apre la classifica ufficiale PokerTH, ricercabile per giocatore, oltre alle classifiche della comunità (BBC, WEC). Se le classifiche non ti interessano, la voce si nasconde in Opzioni avanzate \u2192 Comunità.'] },
        { id: 'cups', t: 'Le coppe della community: BBC e WeCup',
          b: ['Due community organizzano le proprie competizioni su pokerth.net, ognuna con il suo sito e la sua classifica. La Best Brainies Cup (BBC) è un torneo a tappe nato nel 2013: si sale dallo Step 1 allo Step 4, e una nuova stagione parte dopo ogni partita di Step 4, quando la coppa viene assegnata. La WeCup (WEC) ha un suo punteggio, molto più ampio — 75 punti per il primo posto, poi 45, 30, 20… — e il suo score normalizza la tua media in base al numero di partite che hai giocato rispetto agli altri membri.',
              'Entrambe le classifiche si aprono dal pulsante trofeo, accanto alla classifica PokerTH. Le impostazioni di tavolo di queste competizioni sono disponibili come preimpostazioni quando crei una partita (BBC Step 1-4, WEC, WEC Monthly Final e WEC Grand Final), così puoi allenarti alle stesse condizioni. Per partecipare serve iscriversi sul sito della coppa interessata.'],
          note: 'Questi contenuti si nascondono in un colpo solo in Opzioni avanzate → Community, se le coppe non ti interessano.' },
        { id: 'forumcups', t: 'Coppe del forum ed eventi',
          b: ['Il forum di pokerth.net ospita anche la Monthly Cup, una serie mensile in cui i giocatori si distribuiscono su tavoli Gold, Silver e Bronze prima che venga incoronato il campione del mese, oltre a coppe speciali sparse durante l\u2019anno.',
              'Iscrizioni, orari, impostazioni di tavolo e risultati vengono pubblicati sul forum, e le partite si giocano sul server ufficiale come tutte le altre. Un account pokerth.net basta per seguire i risultati; iscriversi a una coppa passa dal thread del forum corrispondente.'] },
        { id: 'avatars', t: 'Avatar e bandiere',
          b: ['Su pokerth.net il tuo avatar viene distribuito agli altri giocatori tramite il server degli avatar, e una piccola bandiera del paese può apparire sui riquadri dei giocatori. Entrambi sono opzionali e configurabili nelle opzioni.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Modalità allenamento',
      sections: [
        { id: 'what', t: 'Che cos\u2019è',
          b: ['La modalità Locale / allenamento è una partita completa contro avversari controllati dal computer: nessuna connessione, nessun account, nulla in palio. Una volta installata l\u2019app (o anche solo visitata una volta), funziona completamente offline — perfetta per imparare il gioco, provare l\u2019interfaccia o passare il tempo in modalità aereo.'] },
        { id: 'setup', t: 'Configurare una partita',
          b: ['Scegli il numero di avversari, lo stack iniziale, i bui e la loro progressione, e la velocità di gioco. La composizione e la difficoltà dei bot si regolano in Opzioni avanzate \u2192 Partita locale — da avversari morbidi a un tavolo più duro e vario.'] },
        { id: 'trophies', t: 'Trofei',
          b: ['La modalità allenamento ha la sua progressione: 28 trofei in sei categorie (progressione, tecnica, stile, formati, divertimento e una segreta) si sbloccano giocando — mani giocate, partite vinte, grandi bluff, mani speciali e altro. Il progresso dei trofei è cumulativo e si fonde tra dispositivi quando la sincronizzazione delle impostazioni dell\u2019account è attiva.'] },
        { id: 'learn', t: 'Un buon posto per imparare',
          b: ['Tutto ciò che è descritto negli altri capitoli funziona anche qui: il monitor delle probabilità, la visualizzazione di assistenza, la preselezione, le scorciatoie da tastiera. La modalità allenamento è il posto migliore per provarli senza pressione prima di buttarti su pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stile e suono',
      sections: [
        { id: 'themes', t: 'Temi',
          b: ['La categoria Stile delle Opzioni avanzate riveste tutto il client. I preset impostano tutto con un tocco (il classico casinò verde, l\u2019aspetto ufficiale PokerTH\u2026); sotto, assi individuali regolano separatamente la tavolozza dei colori, il panno del tavolo e le facce delle carte — modifica un asse qualsiasi e il tuo mix diventa un tema personalizzato. La modalità scura, chiara o automatica si sceglie in Interfaccia utente, e le tue scelte si applicano all\u2019istante, su ogni schermata, e vengono ricordate.'] },
        { id: 'tablelook', t: 'Tavoli, mazzi, posti',
          b: ['Oltre al tema, diversi elementi si sostituiscono in modo indipendente: lo sfondo del tavolo, il mazzo di carte, il dorso delle carte (abbinato al mazzo automaticamente, o importa una tua immagine), i gettoni di dealer e bui, lo stile dei pulsanti d\u2019azione, e pacchetti di posti completi che rivestono i riquadri dei giocatori. Scegli tutto in Opzioni avanzate \u2192 Stile; le modifiche sono visibili subito al tavolo.'] },
        { id: 'music', t: 'Lettore musicale',
          b: ['La voce musica dei menu dell\u2019intestazione apre un piccolo lettore di musica d\u2019ambiente: scegli un brano dalla playlist, riproduci/pausa, precedente/successivo, casuale, e ripetizione di un brano, di tutta la playlist o di niente. Volume, brano selezionato e modalità di ripetizione vengono ricordati. La riproduzione non parte mai da sola — i browser richiedono un tocco — e il lettore è del tutto indipendente dagli effetti sonori del gioco.'] },
        { id: 'sounds', t: 'Effetti sonori',
          b: ['I suoni di gioco sono raggruppati in quattro categorie attivabili separatamente, esattamente come nel client desktop: azioni di gioco (carte distribuite, Check, Call, Raise, il tuo turno\u2026), notifica della chat della lobby, notifiche di partita in rete (giocatore entrato, partita pronta) e notifica di aumento dei bui. Un unico cursore del volume li controlla tutti, in Opzioni avanzate \u2192 Suono.'],
          note: 'Tutti i browser — iOS in particolare — si rifiutano di riprodurre audio prima che tu abbia toccato la pagina una volta. Se una partita parte in silenzio, un solo tocco ovunque risveglia il suono; il client ripara anche automaticamente il motore audio quando iOS lo sospende (chiamata in arrivo, passaggio in background\u2026).' },
        { id: 'voice', t: 'Voce e vibrazione',
          b: ['Due canali extra possono tenerti informato senza guardare lo schermo: gli annunci vocali leggono ad alta voce gli eventi di gioco tramite la sintesi vocale del tuo dispositivo, e sul telefono una breve vibrazione può segnalare il tuo turno. Entrambi sono estensioni web, attive o no di default a seconda del dispositivo, in Opzioni avanzate \u2192 Puntate e turno.'],
          note: 'La vibrazione funziona su Android (browser Chromium); Apple non espone un\u2019API di vibrazione ai siti web, quindi gli iPhone non possono vibrare. Gli annunci vocali funzionano ovunque, ma le voci e le lingue disponibili dipendono dal tuo sistema — il client usa la migliore corrispondenza che trova.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opzioni e scorciatoie',
      sections: [
        { id: 'where', t: 'Dove vivono le opzioni',
          b: ['Le Opzioni avanzate si aprono dalla voce con l\u2019ingranaggio di qualsiasi menu dell\u2019intestazione. Sono raggruppate come nel client desktop: Interfaccia utente, Stile, Suono, Partita locale, Partita in rete, Partita Internet, Nickname / Avatar, Messaggi di log, e Ripristina predefiniti. Ogni funzione specifica del web ha lì il suo interruttore, così puoi disattivare tutto ciò che non usi.'] },
        { id: 'cfgxml', t: 'Scambiare le impostazioni con il client desktop',
          b: ['Le tue impostazioni possono viaggiare tra i client: la categoria Messaggi di log offre esportazione/importazione del file config.xml ufficiale (il \u007e/.pokerth/config.xml usato dai client desktop e QML). L\u2019esportazione scrive le impostazioni condivise — nome, opzioni di visualizzazione, suoni, preferenze del tavolo, bui, stili — e l\u2019importazione applica qui un file del desktop. Le impostazioni che questo client non conosce restano intatte nel file.'] },
        { id: 'sync', t: 'Impostazioni che ti seguono',
          b: ['Quando giochi con un account, le tue opzioni, il tema, le assegnazioni dei tasti, la lingua e i trofei di allenamento sono sincronizzati: cambia qualcosa su un dispositivo e il prossimo dispositivo da cui accedi lo recupera. Il progresso dei trofei viene fuso, mai sovrascritto, quindi giocare su due dispositivi mantiene sempre il meglio di entrambi.'] },
        { id: 'updates', t: 'Restare aggiornati',
          b: ['Il client si aggiorna da solo: quando viene distribuita una nuova versione, un banner ti invita ad aggiornare (o digita /update in chat per controllare manualmente). Ogni tanto può apparire un piccolo sondaggio di prodotto per chiedere la tua opinione su una funzione — partecipare è facoltativo e i sondaggi si disattivano del tutto in Opzioni avanzate \u2192 Comunità.'] },
        { id: 'fkeys', t: 'Scorciatoie da tastiera ufficiali',
          b: ['I tasti funzione ufficiali di PokerTH funzionano durante una partita:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (ordine invertibile nelle opzioni)'],
            ['F5', 'Mostrare le tue carte (quando possibile)'],
            ['F6 / F7 / F8', 'Manuale \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manuale \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Cronologia \u00b7 Pannello delle probabilità'],
            ['Alt+S', 'Impostazioni \u2014 ovunque nell\u2019app, non solo in partita'],
            ['F11', 'Schermo intero']],
          note: 'Le scorciatoie richiedono una tastiera fisica. Su Mac i tasti F controllano i media di default: tieni premuto Fn (o attiva «Utilizza i tasti F1, F2 ecc. come tasti funzione standard» nelle impostazioni di macOS). Su iPhone lo schermo intero è limitato da iOS — installare l\u2019app come PWA offre la stessa esperienza a schermo intero.' },
        { id: 'webkeys', t: 'Tasti lettera del web',
          b: ['Estensione web: i tasti a lettera singola e Alt+T attivano anch\u2019essi le azioni, e tutti si possono riassegnare in Opzioni avanzate \u2192 Scorciatoie da tastiera:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Pannello statistiche'],
            ['Esc', 'Chiudere la finestra in primo piano (anche il tasto Indietro di Android)']],
          note: 'Su Android, il tasto/gesto Indietro di sistema chiude le finestre come Esc invece di lasciare la partita (configurabile nelle opzioni). iOS non ha un tasto di sistema equivalente — usa la \u2715 di ogni finestra.' }
      ]
    }
  ]
};
