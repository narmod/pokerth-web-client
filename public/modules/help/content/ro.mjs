// ── help/content/ro.mjs — Corpus de ajutor în română (lotul 4) ──────────────
// Traducere din en.mjs (referință). Structură și id-uri identice; doar
// t / b / list / keys (etichete) / note sunt traduse. Termenii de poker
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) rămân în
// engleză, conform convenției aplicației. Registru: tu.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Primii pași',
      sections: [
        { id: 'modes', t: 'Trei moduri de a juca',
          b: ['Pe ecranul de conectare, alege cum vrei să joci.'],
          list: [
            'Internet — joacă online pe serverul oficial pokerth.net, cu clasamente. E nevoie de un cont pokerth.net; înregistrarea pe pokerth.net este gratuită.',
            'Local / antrenament — joacă offline împotriva boților. Nimic de configurat, funcționează fără conexiune și deblochează trofee pe măsură ce progresezi.',
            'LAN / server dedicat — conectează-te la un server PokerTH privat din rețeaua ta locală sau de pe propriul calculator.'] },
        { id: 'lan', t: 'LAN / server dedicat',
          b: ['Al treilea mod se conectează la orice server PokerTH rulat de tine sau de un prieten — într-o rețea de acasă, pe un VPS privat, oriunde. Introdu adresa și portul serverului, bifează TLS dacă serverul folosește un port criptat și conectează-te cu un pseudonim (accesul ca invitat funcționează dacă serverul îl permite). La masă, totul se comportă apoi exact ca pe serverul oficial.'] },
        { id: 'famboard', t: 'Clasamentul familiei',
          b: ['Doar pe serverele private și în partidele LAN, clientul păstrează statistici cumulate pe pseudonim — mâini și partide jucate și câștigate, cel mai mare câștig, cea mai bună serie — și le partajează prin server, astfel încât fiecare dispozitiv de la masă vede același clasament. Partidele de pe pokerth.net nu sunt niciodată urmărite astfel, iar statisticile modului de antrenament rămân complet separate.'] },
        { id: 'language', t: 'Limba',
          b: ['Interfața este disponibilă în 40 de limbi. Schimb-o oricând în Opțiuni avansate (meniul cu rotiță), categoria Interfață utilizator. Termenii de acțiune din poker (Fold, Check, Call, Bet, Raise, All-In) rămân în engleză prin convenție, exact ca în clientul desktop.'] },
        { id: 'pwa', t: 'Instalează ca aplicație',
          b: ['Acest client este o Progressive Web App: o poți instala din meniul browserului (sau cu butonul de instalare din antet) și obții o aplicație pe tot ecranul, cu propria pictogramă. Odată instalată, pornește instantaneu, iar modul de antrenament funcționează complet offline.'],
          note: 'Pe Android și în Chrome/Edge pe desktop, butonul de instalare face totul. Pe iPhone/iPad, Apple permite instalarea doar prin Safari: butonul Partajează \u2192 \u201eAdaugă la ecranul principal\u201d — clientul arată acești pași când e nevoie. Butonul dispare după ce aplicația e instalată.' },
        { id: 'platforms', t: 'Platforme și browsere',
          b: ['Clientul rulează în orice browser modern, pe orice sistem — Windows, macOS, Linux, Android, iOS. Câteva funcții depind de API-uri de browser mai noi; când un API lipsește, funcția se ascunde sau explică situația, în loc să se strice. Principalele diferențe de știut:'],
          list: [
            'Chrome / Edge (desktop): totul funcționează, inclusiv scrierea jurnalului .pdb într-un dosar.',
            'Firefox: totul, cu excepția scrierii .pdb într-un dosar (API-ul nu e încă disponibil).',
            'Safari / iOS: instalarea trece prin Partajează \u2192 \u201eAdaugă la ecranul principal\u201d; fără vibrație; ecran complet limitat pe iPhone; sunetul pornește după prima ta atingere.',
            'Android: suport complet în browserele Chromium, inclusiv vibrația și comportamentul butonului Înapoi.'] },
        { id: 'avatar', t: 'Pseudonim și avatar',
          b: ['Alege-ți pseudonimul și avatarul pe ecranul de conectare înainte de a te conecta. Pe pokerth.net, pseudonimul este numele contului tău; avatarurile sunt partajate cu ceilalți jucători prin serverul de avataruri.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Regulile pokerului',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em pe scurt',
          b: ['PokerTH se joacă în varianta No-Limit Texas Hold\u2019em. Fiecare jucător primește două cărți acoperite (hole cards). Apoi cinci cărți comune sunt așezate cu fața în sus în mijlocul mesei. Cea mai bună mână de cinci cărți, formată din orice combinație a celor două cărți ale tale cu cele cinci comune, câștigă potul.'] },
        { id: 'blinds', t: 'Blindurile și butonul dealerului',
          b: ['Înainte de fiecare mână, două mize obligatorii alimentează potul: small blind și big blind, plătite de cei doi jucători din stânga butonului dealerului. Butonul avansează cu un loc în sensul acelor de ceasornic după fiecare mână, așa că toți plătesc blindurile pe rând. Blindurile cresc la intervale regulate pe parcursul partidei.',
              'Pe masă, butonul și blindurile sunt marcate cu jetoane: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Cele patru runde de pariere',
          list: [
            'Pre-flop — după împărțirea cărților acoperite, prima rundă de pariere începe în stânga big blindului.',
            'Flop — trei cărți comune sunt dezvăluite, urmate de o rundă de pariere.',
            'Turn — a patra carte comună, apoi încă o rundă de pariere.',
            'River — a cincea și ultima carte comună, apoi runda finală de pariere.'],
          b: ['O rundă de pariere se încheie când fiecare jucător rămas în mână a pus aceeași sumă în pot (sau este all-in).'] },
        { id: 'actions', t: 'Ce poți face când e rândul tău',
          list: [
            'Fold — renunți la mână. Cărțile tale ies din joc și nu mai concurezi pentru pot.',
            'Check — treci mai departe fără să pariezi. Posibil doar când nu e nimic de plătit.',
            'Call — egalezi miza în curs.',
            'Bet — deschizi pariurile când nimeni nu a pariat încă pe acest street.',
            'Raise — mărești peste o miză existentă. Mărirea minimă este egală cu miza sau mărirea anterioară.',
            'All-In — pui tot stack-ul. Rămâi în mână până la suma pe care ai acoperit-o.'] },
        { id: 'showdown', t: 'Showdown și poturi împărțite',
          b: ['Dacă mai mulți jucători rămân după runda de pariere de pe river, mâinile sunt arătate și cea mai bună câștigă — combinația câștigătoare apare sub cărțile comune. Când un jucător este all-in cu mai puțin decât mizele complete, se formează poturi laterale: fiecare jucător poate câștiga doar partea de pot la care a contribuit. Mâinile egale împart potul.',
            'Nu toți trebuie să arate: începând cu ultimul jucător care a pariat sau a mărit, o mână este descoperită doar dacă bate ceea ce este deja la vedere. Cine are dreptul să dea muck își ține cărțile acoperite și primește un buton Show pentru a le arăta totuși.'] },
        { id: 'hands', t: 'Ierarhia mâinilor',
          b: ['De la cea mai slabă la cea mai puternică:'],
          list: [
            '1. High Card — nicio combinație; decide cartea cea mai mare.',
            '2. Pair — două cărți de aceeași valoare.',
            '3. Two Pair — două perechi diferite.',
            '4. Three of a Kind — trei cărți de aceeași valoare.',
            '5. Straight — cinci cărți consecutive (asul contează ca mare sau mic).',
            '6. Flush — cinci cărți de aceeași culoare.',
            '7. Full House — un brelan plus o pereche.',
            '8. Four of a Kind — patru cărți de aceeași valoare.',
            '9. Straight Flush — o chintă, toată în aceeași culoare.',
            '10. Royal Flush — de la zece la as, într-o singură culoare. Cea mai bună mână posibilă.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Ecranul de joc',
      sections: [
        { id: 'actionbar', t: 'Bara de acțiuni',
          b: ['Când e rândul tău, bara de acțiuni de jos se aprinde cu până la patru butoane: Fold (roșu), Check / Call (albastru), Bet / Raise (verde — acțiunea principală, evidențiată) și All-In (roșu închis). Butonul Check / Call arată suma exactă de plătit; Bet / Raise arată suma pe care ești pe cale să o pui. După river, All-In se poate transforma într-un buton Show pentru a-ți arăta cărțile.'] },
        { id: 'betctl', t: 'Alege-ți miza',
          b: ['Reglează suma măririi cu câmpul numeric, glisorul sau butoanele rapide 1/3 \u00b7 1/2 \u00b7 Pot (fracțiuni din potul curent). Sumele sunt rotunjite automat și menținute între mărirea minimă și maximă permise. Dacă preferi să gândești în big blinduri, o opțiune afișează toate sumele în BB în loc de jetoane.'] },
        { id: 'preselect', t: 'Preselectează o acțiune',
          b: ['Înainte de rândul tău poți pregăti o acțiune din timp: atinge un buton și acesta primește un contur auriu cu un punct auriu mic. Când îți vine rândul, acțiunea se execută imediat. Un Fold pregătit devine automat Check când check-ul e gratuit — nu renunți niciodată degeaba. Preselecțiile se resetează la fiecare mână nouă, schimbare de street și showdown, și se anulează dacă situația se schimbă (de exemplu, dacă suma de plătit se schimbă).'] },
        { id: 'automodes', t: 'Moduri automate',
          b: ['Meniul derulant de lângă butoanele de acțiune oferă trei moduri de joc: Manual, Auto Check/Call și Auto Check/Fold. Modurile automate joacă în locul tău până revii — orice clic manual pe o acțiune revine imediat la Manual.'] },
        { id: 'readtable', t: 'Citește masa',
          b: ['Fiecare casetă de jucător arată avatarul, numele, stack-ul și miza în curs. Dealerul și blindurile sunt marcate cu jetoane D / SB / BB. O insignă colorată pe casetă indică ultima acțiune a jucătorului; o bară subțire albastră numără invers timpul lui de gândire. Caseta jucătorului aflat la rând se aprinde; propria ta casetă primește un chenar auriu pulsând când e rândul tău.',
              'Bara de stare de deasupra mesei arată potul total, mizele street-ului curent, faza (Pre-flop, Flop, Turn, River) și numerele partidei și ale mâinii. Jucătorii care au renunțat au cărți translucide; cei eliminați sunt estompați. La sfârșitul unei mâini, o fereastră a câștigătorului poate rezuma cine a câștigat ce — dezactivabilă din opțiuni.'] },
        { id: 'seatlayout', t: 'Așezarea locurilor',
          b: ['Ca extensie web, dispunerea casetelor de jucători se alege în Opțiuni avansate \u2192 Locuri: Automată urmează clientul oficial (poziții fixe pe verticală, elipsă calculată pe orizontală), sau forțează dispunerea Verticală ori Orizontală — iar Personalizată te lasă să așezi fiecare loc singur: apare un mod de editare în care tragi fiecare casetă exact unde vrei, iar dispunerea se salvează.'] },
        { id: 'zoom', t: 'Zoom pe masă (telefoane)',
          b: ['Pe ecrane mici, butoanele cu lupă măresc masa (2\u00d7) și o poți deplasa cu degetul — propria casetă și bara de acțiuni rămân fixe. Vederea urmărește automat locul activ și se depărtează la showdown pentru imaginea de ansamblu. Dezactivabil în Opțiuni avansate.'],
          note: 'Pe telefoane și tablete, zoom-ul prin ciupire al browserului este blocat implicit, ca un gest de zoom să nu se declanșeze niciodată din greșeală în mijlocul unei mâini; reactivează-l în Opțiuni avansate \u2192 Interfață utilizator dacă preferi.' },
        { id: 'protections', t: 'Protecție anti-tras cu ochiul și anti-Call accidental',
          b: ['Două protecții opționale: protecția anti-tras cu ochiul îți ține cărțile acoperite până le atingi (utilă când cineva îți poate vedea ecranul), iar protecția anti-Call accidental blochează pentru o clipă butonul Call imediat după o mărire mare, ca o atingere destinată unui Call mai mic să nu cadă din greșeală pe suma mărită. Ambele se află în Opțiuni avansate.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Panoul de informații',
      sections: [
        { id: 'open', t: 'Deschide panoul',
          b: ['În timpul unei partide, panoul de informații se deschide din antet (sau Alt+L / Alt+I) și are trei file: Jurnal, Șanse și Statistici. Pe telefon plutește deasupra mesei; pe ecrane mai mari este o fereastră mobilă și redimensionabilă — prinde mânerul \u28ff pentru a o muta, marginile pentru a o redimensiona. Poziția este memorată.'] },
        { id: 'log', t: 'Jurnalul partidei',
          b: ['Fila Jurnal înregistrează întreaga partidă mână cu mână: blindurile, fiecare acțiune cu sumele, cărțile arătate și câștigătorii, totul colorat pentru citire rapidă. Butonul de export salvează jurnalul într-un fișier dacă vrei să revezi o sesiune mai târziu.'] },
        { id: 'odds', t: 'Șanse (monitorul de probabilități)',
          b: ['Fila Șanse arată, pentru mâna ta curentă, probabilitatea în timp real de a termina cu fiecare dintre cele 10 categorii de mâini — de la High Card la Royal Flush — fiecare cu pictogramă, procent și bară. Afișajul se estompează imediat ce renunți. Folosește doar cărțile tale și pe cele comune: nu vede nimic din ce adversarii nu arată.'] },
        { id: 'journal', t: 'Jurnalele de mâini și fereastra \u201eJurnale\u201d',
          b: ['Pe lângă jurnalul în timp real, fiecare mână jucată este înregistrată local în browser, în același format ca fișierele de jurnal .pdb ale clientului oficial. Fereastra Jurnale (Opțiuni avansate \u2192 Mesaje de jurnal \u2192 Gestionează jurnalele\u2026) îți listează sesiunile și te lasă să lucrezi cu ele: previzualizezi o sesiune cu căutare și evidențiere, filtrezi după partidă, exporți în HTML sau text simplu, salvezi fișierul .pdb brut sau imporți un .pdb înregistrat de clientul desktop. Sesiunile se șterg una câte una sau toate odată (cu confirmare), iar o retenție automată poate păstra doar ultimele 7, 30, 90, 180 sau 365 de zile. Jurnalele importate de tine nu sunt niciodată șterse automat. O a doua setări limitează câte sesiuni sunt păstrate, iar coloana cu lista poate fi lărgită prin tragere.',
              'Butonul Analizează rulează o analiză de mâini pe o sesiune și poate trimite un jurnal serviciului de analiză pokerth.net. Totul rămâne pe dispozitivul tău până când exporți sau trimiți explicit.'] },
        { id: 'logopts', t: 'Opțiuni de jurnal',
          b: ['În Opțiuni avansate \u2192 Mesaje de jurnal poți activa sau opri jurnalizarea și alege intervalul de scriere, cu aceleași trei setări ca și clientul desktop: după fiecare acțiune, după fiecare mână (implicit) sau după fiecare joc. O altă opțiune scrie fișierul .pdb într-un dosar ales de tine și îl menține la zi cu acel interval, plus încă o dată la părăsirea paginii, astfel încât un alt instrument să poată urmări jocul în direct.'],
          note: 'Scrierea într-un dosar local necesită API-ul File System Access: doar Chrome, Edge și Opera pe desktop. În rest opțiunea se explică singură, iar exportul manual din fereastra de jurnale rămâne disponibil. Un browser poate doar înlocui un fișier, niciodată adăuga la el, așa că un instrument care citește .pdb ar trebui să îl redeschidă după fiecare modificare.' },
        { id: 'assist', t: 'Asistență (puterea mâinii)',
          b: ['În partea de sus a filei Șanse, bannerul de asistență îți citește mâna în locul tău. Înainte de flop, îți numește mâna de start și o notează cu stele; de la flop, arată cea mai bună combinație curentă și, după o simulare rapidă, șansa estimată de a câștiga mâna, în procente, cu un indicator colorat de la roșu (slabă) la verde (puternică). Ca și monitorul de probabilități, folosește doar informațiile pe care le poți vedea.',
              'Două stiluri de afișare se află în Opțiuni avansate \u2192 Locuri: Segmente (zece blocuri) sau o bară de progres clasică. Toată asistența poate fi dezactivată în Opțiuni avansate \u2192 Asistență.'] },
        { id: 'assistwin', t: 'Asistența ca widget plutitor',
          b: ['Blocul de asistență poate fi desprins din panou într-o mică fereastră proprie, mereu deasupra: folosește butonul de desprindere de pe bloc, apoi mut-o și redimensioneaz-o oriunde deasupra mesei — practic pentru a urmări puterea mâinii fără tot panoul deschis. Butonul de andocare îl pune înapoi în fila Șanse, iar poziția este memorată. În panou, un mâner de tragere între Asistență și șanse îți permite să împarți spațiul între cele două.'] },
        { id: 'stats', t: 'Statistici',
          b: ['Fila Statistici îți urmărește sesiunea: mâini jucate, flopuri văzute, showdown-uri, rate de câștig și altele. Urmărirea statistică poate fi dezactivată în Opțiuni avansate.'] },
        { id: 'hud', t: 'HUD de statistici la locuri (beta)',
          b: ['HUD-ul atașează o mică fereastră de statistici lângă locul fiecărui jucător, construită din mâinile pe care le-ai înregistrat în jurnalele tale: numărul de mâini observate, apoi VPIP (cât de des pune bani voluntar pre-flop), PFR (măriri pre-flop) și AF (factorul de agresivitate), colorate de la pasiv la agresiv. Dedesubt, o insignă rezumă jucătorul în cuvinte \u2014 Strâns-Pasiv, Larg-Agresiv și așa mai departe \u2014 lângă un mic cadran al cărui sfert aprins se citește de la stânga la dreapta de la strâns la larg, și de jos în sus de la pasiv la agresiv. Insigna apare de la prima mână, dar rămâne estompată până la 25 de mâini, prag de la care devine fiabilă. Atinge o fereastră pentru un popover detaliat cu toate cifrele (3-bet, continuation bet, fold la 3-bet, încercări de furt, rate de showdown\u2026), și trage-o dacă acoperă ceva.',
              'HUD-ul știe doar ce ai văzut la mesele tale — citește jurnalele tale locale de mâini, deci înregistrarea trebuie să fie pornită, iar cifrele capătă sens abia după destule mâini. E o funcție beta, dezactivată implicit: activeaz-o în Opțiuni avansate \u2192 Asistență.'] },
        { id: 'handsbtn', t: 'Rezumatul combinațiilor',
          b: ['Pictograma mâinilor de poker de pe postav deschide oricând un rezumat rapid al celor 10 combinații — practic cât înveți. Poate fi ascunsă în Opțiuni avansate.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat și social',
      sections: [
        { id: 'panels', t: 'Chatul din lobby și chatul de la masă',
          b: ['Există un chat în lobby și altul la masă. Pe telefon, chatul mesei plutește deasupra jocului; pe ecrane mai mari e o fereastră mobilă și redimensionabilă. O insignă pe butonul de chat numără mesajele necitite.'] },
        { id: 'typing', t: 'Ajutoare la tastare',
          list: [
            'Tab completează un pseudonim — apasă Tab din nou pentru a parcurge potrivirile.',
            '\u2191 / \u2193 parcurg istoricul propriilor mesaje.',
            'Butonul emoji deschide un selector complet; tastarea : sugerează și emote-uri în timp ce scrii.'] },
        { id: 'emotes', t: 'Emote-uri și smiley-uri',
          b: ['Chatul convertește codurile de emote exact ca clientul desktop oficial: scrie un nume între două puncte duble și devine emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 sunt acceptate peste 1 900 de coduri (setul complet GitHub). Smiley-urile text clasice sunt și ele convertite: :-) ;) :D xD :P <3 și vreo optzeci de altele.',
              'Tastarea : deschide o casetă de sugestii care completează codul în timp ce scrii (\u2191/\u2193 pentru a alege, Tab sau Enter pentru a accepta). Conversia emoji poate fi dezactivată complet în Opțiuni avansate \u2192 Chat.'] },
        { id: 'commands', t: 'Comenzi de chat',
          b: ['Chatul înțelege comenzile cu bară oblică. Două sunt vizibile pentru ceilalți:'],
          keys: [
            ['/me <text>', 'Mesaj de acțiune, afișat ca \u201e* pseudonimultau text\u201d'],
            ['/emoji <emoji>', 'Redă o reacție emoji (aceeași pe care o trimite selectorul de reacții)']] },
        { id: 'diagcmds', t: 'Comenzi de diagnostic',
          b: ['Tot restul este local: doar tu vezi răspunsurile și nimic nu se trimite la masă. Tastează /help pentru a le lista pe toate. Cele mai utile:'],
          keys: [
            ['/help', 'Listează toate comenzile'],
            ['/update', 'Verifică o versiune nouă și reîncarcă'],
            ['/lang <cod>', 'Schimbă limba (ex.: /lang ro)'],
            ['/sound on|off', 'Pornește/oprește sunetele jocului'],
            ['/zoom', 'Comută lupa mesei'],
            ['/clear', 'Golește chatul local'],
            ['/table', 'Informații despre partida curentă (blinduri, jucători, stack-uri)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostice de stare a clientului, rețea și fluiditate'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Depanare avansată (cărți, protocol, audio, stocare, locuri)'],
            ['/copy', 'Copiază ultimul răspuns de comandă în clipboard']] },
        { id: 'reactions', t: 'Reacții emoji',
          b: ['Butonul de reacții deschide un selector cu 30 de reacții animate (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) care se redau cu efect deasupra locului tău, vizibile pentru toată masa — inclusiv jucătorii de pe clientul desktop. Reacțiile pot fi dezactivate complet în Opțiuni avansate.'] },
        { id: 'translate', t: 'Înțelege-i pe toți',
          b: ['Cu traducerea chatului activată, un buton de traducere apare pe linia de sub cursor — sau pe linia atinsă, pe ecran tactil — și arată mesajul în limba ta cu traducătorul navigatorului. Poate fi afișat permanent pe toate liniile din Opțiuni avansate → Chat, unde stă și indiciul care explică abrevierile obișnuite de la masă (gg, nh, utg…).'],
          note: 'Traducerea folosește serviciul Google Translate și funcționează în orice browser — e nevoie doar de conexiune la internet. Un mesaj este trimis serviciului de traducere doar când atingi butonul lui de traducere, niciodată automat.' },
        { id: 'social', t: 'Jucători: profil, invită, ignoră',
          b: ['Atinge orice jucător — la masă sau în lista din lobby — pentru a-i deschide fișa: profil și statistici, invită-l la partida ta sau ignoră-l (mesajele lui de chat sunt ascunse; ignorarea e reversibilă oricând). O confirmare înainte de invitare/ignorare poate fi activată din opțiuni.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby și partide',
      sections: [
        { id: 'list', t: 'Lista partidelor',
          b: ['Lobby-ul listează toate mesele serverului. Fiecare intrare arată numărul de jucători, tipul partidei, un lacăt când e nevoie de parolă sau invitație, și o insignă de stare: \u201eÎn așteptare\u201d (verde — partida nu a început, poți intra dacă e un loc liber), \u201eÎn desfășurare\u201d (culoare caldă — vizibilă în direct când spectatorii sunt permiși) și \u201eÎnchisă\u201d (estompată). O masă plină se recunoaște pur și simplu după contorul plin, gen 10/10; culorile insignelor urmează tema activă.',
              'Meniul de filtrare îngustează lista exact ca clientul desktop, fiecare alegere mai strictă decât precedenta: doar partide deschise \u2192 ascunzând și mesele pline \u2192 apoi doar cele ne-private, doar cele private sau doar partidele clasate. Alegerea ta e memorată. Câmpul de căutare găsește o partidă după nume, iar insigna jucătorilor deschide lista tuturor celor online, cu căutare și sortare.'] },
        { id: 'join', t: 'Intră și privește',
          b: ['Selectează o partidă deschisă și intră — un lacăt indică faptul că e nevoie de parolă. Partidele în desfășurare care acceptă spectatori pot fi urmărite în direct: vezi masa și chatul, dar cărțile acoperite rămân ascunse și nu poți acționa.'] },
        { id: 'gameinfo', t: 'Informații despre partidă',
          b: ['Înainte să intri, fișa de informații a partidei arată tot ce definește masa: tipul partidei, blindurile și evoluția lor (dublare sau listă manuală), stack-ul de start, timpul de acțiune, pauza dintre mâini și cine e deja așezat.'] },
        { id: 'create', t: 'Creează o partidă',
          b: ['Creează-ți propria masă: nume, număr de jucători, stack de start, primul small blind și programul de creștere, timp de acțiune și dacă spectatorii sunt permiși. Există patru tipuri de partide: Normală (toți), doar jucători înregistrați, doar pe bază de invitație, și Clasată (contează pentru clasamentul oficial — fără parolă posibilă în acest caz). Setările tale preferate pot fi salvate și reîncărcate.'] },
        { id: 'invites', t: 'Invitații',
          b: ['Jucătorii te pot invita la masa lor; primești o notificare pe care o poți accepta sau refuza. A fi invitat este singura cale de a intra într-o partidă doar pe bază de invitație.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Contul tău',
          b: ['Serverul oficial de internet este pokerth.net. Jocul acolo necesită un cont pokerth.net gratuit — înregistrează-te pe site, apoi conectează-te aici cu același pseudonim și aceeași parolă. Acest client web se conectează exact la același server ca clientul desktop: aceleași conturi, aceleași mese, aceleași clasamente, și poți sta la o masă cu jucători de pe clientul desktop.'] },
        { id: 'ranked', t: 'Partide clasate și sezoane',
          b: ['Partidele de tip Clasată contează pentru clasamentul oficial al sezonului. Profilul tău din aplicație arată data înregistrării, Rank-ul tău din sezonul curent, Scorul, media și partidele jucate, plus ultimele rezultate. Partidele normale (neclasate) sunt doar pentru distracție și nu schimbă nimic.'] },
        { id: 'rankhow', t: 'Cum se calculează clasamentul',
          b: ['În fiecare partidă clasată, locul tău aduce puncte: 15 pentru primul, apoi 9, 6, 4, 3, 2 și 1 până la al șaptelea; de la al optulea la al zecelea, nimic. O masă împarte așadar 40 de puncte în total.',
              'Scorul tău nu este suma acestor puncte, ci media ta pe partidă, temperată de un factor care crește odată cu numărul de partide jucate: câteva rezultate bune nu ajung ca să te instalezi în vârf, e nevoie și de regularitate — cu cât joci mai mult, cu atât Scorul tău se apropie de media ta reală. Sezoanele durează un trimestru: la schimbare totul se arhivează și contoarele pornesc de la zero, iar sezoanele trecute rămân de consultat. În joc, butonul podium arată clasamentul de sezon al jucătorilor de la masa ta.'],
          note: 'Baremul de puncte și formula exactă sunt stabilite de serverul de clasament al pokerth.net și se pot schimba; paginile de pe site sunt cele care contează.' },
        { id: 'rankings', t: 'Paginile de clasament',
          b: ['Intrarea de clasament deschide clasamentul oficial PokerTH, cu căutare după jucător, plus clasamentele comunității (BBC, WEC). Dacă nu te interesează clasamentele, intrarea poate fi ascunsă în Opțiuni avansate \u2192 Comunitate.'] },
        { id: 'cups', t: 'Cupele comunității: BBC și WeCup',
          b: ['Două comunități își organizează propriile competiții pe pokerth.net, fiecare cu site și clasament proprii. Best Brainies Cup (BBC) este un turneu pe etape născut în 2013: se urcă de la Step 1 la Step 4, iar un nou sezon începe după fiecare partidă de Step 4, când se acordă cupa. WeCup (WEC) are baremul său, mult mai întins — 75 de puncte pentru primul loc, apoi 45, 30, 20… — iar scorul său îți normalizează media în funcție de numărul de partide jucate față de ceilalți membri.',
              'Ambele clasamente se deschid din butonul trofeu, lângă clasamentul PokerTH. Setările de masă ale acestor competiții vin ca presetări la crearea unei partide (BBC Step 1 până la 4, WEC, WEC Monthly Final și WEC Grand Final), așa că poți exersa în aceleași condiții. Participarea cere o înscriere pe site-ul cupei respective.'],
          note: 'Dacă nu te interesează cupele, ascunzi tot conținutul dintr-o dată în Opțiuni avansate → Comunitate.' },
        { id: 'forumcups', t: 'Cupele forumului și evenimente',
          b: ['Forumul pokerth.net găzduiește și Monthly Cup, o serie lunară în care jucătorii sunt împărțiți pe mese Gold, Silver și Bronze înainte de a fi încoronat campionul lunii, plus cupe speciale punctuale de-a lungul anului.',
              'Înscrierile, orarele, setările de masă și rezultatele se publică pe forum, iar partidele se joacă pe serverul oficial ca oricare altele. Un cont pokerth.net ajunge pentru a urmări rezultatele; înscrierea la o cupă trece prin firul de forum corespunzător.'] },
        { id: 'forumnews', t: 'Noutăți de pe forum în lobby',
          b: ['Butonul cu ziar din antetul lobby-ului deschide cele mai noi mesaje de pe forumul pokerth.net, o intrare pe subiect, fiecare forum cu propria culoare. Insigna de pe buton numără mesajele necitite; deschiderea unui mesaj (filă nouă) îl marchează drept citit, iar „Marchează tot ca citit” golește totul dintr-odată.',
              'Este un extra web: butonul poate fi ascuns din Opțiuni avansate („Buton forum în antetul lobby-ului”).'] },
        { id: 'avatars', t: 'Avataruri și steaguri',
          b: ['Pe pokerth.net, avatarul tău este distribuit celorlalți jucători prin serverul de avataruri, iar un mic steag de țară poate apărea pe casetele jucătorilor. Ambele sunt opționale și configurabile din opțiuni.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Modul de antrenament',
      sections: [
        { id: 'what', t: 'Ce este',
          b: ['Modul Local / antrenament este o partidă completă împotriva unor adversari controlați de calculator: fără conexiune, fără cont, nimic în joc. Odată instalată aplicația (sau doar vizitată o dată), funcționează complet offline — perfect pentru a învăța jocul, a testa interfața sau a-ți trece timpul în modul avion.'] },
        { id: 'setup', t: 'Configurează o partidă',
          b: ['Alege numărul de adversari, stack-ul de start, blindurile și evoluția lor, și viteza jocului. Componența și dificultatea boților se reglează în Opțiuni avansate \u2192 Partidă locală — de la adversari blânzi la o masă mai dură și mai variată.'] },
        { id: 'trophies', t: 'Trofee',
          b: ['Modul de antrenament are propria progresie: 28 de trofee în șase categorii (progresie, tehnică, stil, formate, distracție și una secretă) se deblochează jucând — mâini jucate, partide câștigate, cacealmale mari, mâini speciale și altele. Progresul trofeelor e cumulativ și se îmbină între dispozitive când sincronizarea setărilor contului e activă.'] },
        { id: 'learn', t: 'Un loc bun pentru a învăța',
          b: ['Tot ce e descris în celelalte capitole funcționează și aici: monitorul de probabilități, afișajul de asistență, preselecția, scurtăturile de tastatură. Modul de antrenament e cel mai bun loc să le încerci fără presiune, înainte să te arunci pe pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stil și sunet',
      sections: [
        { id: 'themes', t: 'Teme',
          b: ['Categoria Stil din Opțiunile avansate îmbracă întregul client. Presetările configurează totul dintr-o atingere (clasicul cazinou verde, aspectul oficial PokerTH\u2026); dedesubt, axe individuale reglează separat paleta de culori, postavul mesei și fețele cărților — schimbă orice axă și amestecul tău devine o temă personalizată. Modul întunecat, luminos sau automat se alege în Interfață utilizator, iar alegerile tale se aplică imediat, pe fiecare ecran, și sunt memorate.'] },
        { id: 'tablelook', t: 'Mese, pachete, locuri',
          b: ['Dincolo de temă, mai multe elemente se schimbă independent: fundalul mesei, pachetul de cărți, spatele cărților (asortat automat cu pachetul, sau importă propria imagine), jetoanele de dealer și blinduri, stilul butoanelor de acțiune și pachete complete de locuri care reîmbracă în întregime casetele jucătorilor. Alege totul în Opțiuni avansate \u2192 Stil; schimbările sunt vizibile imediat la masă.'] },
        { id: 'music', t: 'Player de muzică',
          b: ['Intrarea de muzică din meniurile antetului deschide un mic player de muzică ambientală: alege o piesă din listă, redare/pauză, anterioară/următoarea, amestecare, și repetarea unei piese, a întregii liste sau deloc. Volumul, piesa aleasă și modul de repetare sunt memorate. Redarea nu pornește niciodată singură — browserele cer o atingere — iar playerul este complet independent de efectele sonore ale jocului.'] },
        { id: 'sounds', t: 'Efecte sonore',
          b: ['Sunetele jocului sunt grupate în patru categorii activabile separat, exact ca în clientul desktop: acțiuni de joc (cărți împărțite, Check, Call, Raise, rândul tău\u2026), notificarea chatului din lobby, notificările partidei în rețea (jucător conectat, partidă gata) și notificarea de creștere a blindurilor. Un singur glisor de volum le controlează pe toate, în Opțiuni avansate \u2192 Sunet.'],
          note: 'Toate browserele — iOS în special — refuză să redea sunet înainte să fi atins pagina o dată. Dacă o partidă începe în tăcere, o singură atingere oriunde trezește sunetul; clientul repară și el automat motorul audio când iOS îl suspendă (apel primit, fundal\u2026).' },
        { id: 'voice', t: 'Voce și vibrație',
          b: ['Două canale suplimentare te pot ține la curent fără să privești ecranul: anunțurile vocale citesc cu voce tare evenimentele jocului prin sinteza vocală a dispozitivului, iar pe telefon o vibrație scurtă îți poate marca rândul. Ambele sunt extensii web, active sau nu implicit în funcție de dispozitiv, în Opțiuni avansate \u2192 Mize și rând.'],
          note: 'Vibrația funcționează pe Android (browsere Chromium); Apple nu expune un API de vibrație site-urilor web, așa că iPhone-urile nu pot vibra. Anunțurile vocale funcționează peste tot, dar vocile și limbile disponibile depind de sistemul tău — clientul folosește cea mai bună potrivire pe care o găsește.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opțiuni și scurtături',
      sections: [
        { id: 'where', t: 'Unde locuiesc opțiunile',
          b: ['Opțiunile avansate se deschid din intrarea cu rotiță a oricărui meniu din antet. Sunt grupate ca în clientul desktop: Interfață utilizator, Stil, Sunet, Partidă locală, Partidă în rețea, Partidă pe internet, Pseudonime / Avataruri, Mesaje de jurnal și Restaurează valorile implicite. Fiecare funcție specifică web are acolo propriul comutator, ca să poți opri tot ce nu folosești.'] },
        { id: 'cfgxml', t: 'Schimbă setări cu clientul desktop',
          b: ['Setările tale pot călători între clienți: categoria Mesaje de jurnal oferă exportul/importul fișierului oficial config.xml (acel \u007e/.pokerth/config.xml folosit de clienții desktop și QML). Exportul scrie setările partajate — nume, opțiuni de afișare, sunete, preferințe de masă, blinduri, stiluri — iar importul aplică aici un fișier de pe desktop. Setările pe care acest client nu le cunoaște rămân neatinse în fișier.'] },
        { id: 'sync', t: 'Setări care te urmează',
          b: ['Când joci cu un cont, opțiunile, tema, legăturile de taste, limba și trofeele de antrenament se sincronizează: schimbă ceva pe un dispozitiv și următorul dispozitiv pe care te conectezi îl preia. Progresul trofeelor se îmbină, nu se suprascrie niciodată, așa că jocul pe două dispozitive păstrează mereu ce e mai bun din ambele.'] },
        { id: 'updates', t: 'Rămâi la zi',
          b: ['Clientul se actualizează singur: când o versiune nouă e lansată, un banner te invită să reîncarci (sau tastează /update în chat pentru o verificare manuală). Din când în când poate apărea un mic sondaj de produs care îți cere părerea despre o funcție — participarea e opțională, iar sondajele pot fi dezactivate complet în Opțiuni avansate \u2192 Comunitate.'] },
        { id: 'fkeys', t: 'Scurtături de tastatură oficiale',
          b: ['Tastele func\u021bionale oficiale PokerTH func\u021bioneaz\u0103 \u00een timpul unei partide \u2014 Alt+S func\u021bioneaz\u0103 oriunde:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (ordinea se poate inversa din opțiuni)'],
            ['F5', 'Arată-ți cărțile (când e posibil)'],
            ['F6 / F7 / F8', 'Manual \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manual \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Jurnal \u00b7 Panoul de șanse'],
            ['Alt+S', 'Setări — oriunde în aplicație, nu doar în timpul unei partide'],
            ['F11', 'Ecran complet']],
          note: 'Scurtăturile necesită o tastatură fizică. Pe Mac, tastele F controlează implicit media: ține apăsat Fn (sau activează \u201eUtilizează tastele F1, F2 etc. ca taste funcționale standard\u201d în setările macOS). Pe iPhone, ecranul complet e limitat de iOS — instalarea aplicației ca PWA oferă aceeași experiență pe tot ecranul.' },
        { id: 'webkeys', t: 'Taste literă web',
          b: ['Extensie web: tastele de o singură literă și Alt+T declanșează de asemenea acțiuni, iar toate pot fi reatribuite în Opțiuni avansate → Scurtături de tastatură:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Panoul de statistici'],
            ['Esc', 'Închide fereastra din față (și butonul Înapoi pe Android)']],
          note: 'Pe Android, butonul/gestul Înapoi al sistemului închide ferestrele ca Esc, în loc să părăsească partida (configurabil din opțiuni). iOS nu are un buton de sistem echivalent — folosește \u2715 al fiecărei ferestre.' }
      ]
    }
  ]
};
