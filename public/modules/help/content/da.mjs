// ── help/content/da.mjs — Dansk hjælpekorpus (4. parti) ─────────────────────
// Oversættelse af en.mjs (reference). Struktur og id'er identiske; kun
// t / b / list / keys (etiketter) / note er oversat. Pokertermer
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) forbliver på
// engelsk efter appens konvention.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Kom godt i gang',
      sections: [
        { id: 'modes', t: 'Tre måder at spille på',
          b: ['Vælg på loginskærmen, hvordan du vil spille.'],
          list: [
            'Internet — spil online på den officielle pokerth.net-server med ranglister. Der kræves en pokerth.net-konto; registrering på pokerth.net er gratis.',
            'Lokalt / træning — spil offline mod botter. Intet at sætte op, virker uden forbindelse og låser trofæer op, efterhånden som du gør fremskridt.',
            'LAN / dedikeret server — forbind til en privat PokerTH-server på dit lokale netværk eller din egen maskine.'] },
        { id: 'lan', t: 'LAN / dedikeret server',
          b: ['Den tredje tilstand forbinder til enhver PokerTH-server, som du eller en ven kører — på et hjemmenetværk, en privat VPS, hvor som helst. Indtast serverens adresse og port, sæt kryds ved TLS, hvis serveren bruger en krypteret port, og log ind med et kaldenavn (gæsteadgang virker, hvis serveren tillader det). Ved bordet opfører alt sig derefter nøjagtigt som på den officielle server.'] },
        { id: 'famboard', t: 'Familierangliste',
          b: ['Kun på private servere og i LAN-spil gemmer klienten samlede statistikker pr. kaldenavn — spillede og vundne hænder og partier, største gevinst, bedste stime — og deler dem via serveren, så alle enheder rundt om bordet ser den samme rangliste. pokerth.net-spil registreres aldrig på denne måde, og træningstilstandens statistikker holdes helt adskilt.'] },
        { id: 'language', t: 'Sprog',
          b: ['Grænsefladen findes på 36 sprog. Skift det når som helst i Avancerede indstillinger (tandhjulsmenuen), kategorien Brugergrænseflade. Pokerens handlingstermer (Fold, Check, Call, Bet, Raise, All-In) forbliver på engelsk efter konventionen, nøjagtigt som i skrivebordsklienten.'] },
        { id: 'pwa', t: 'Installér som app',
          b: ['Denne klient er en Progressive Web App: du kan installere den fra browserens menu (eller installationsknappen i headeren) og få en fuldskærmsapp med sit eget ikon. Når den er installeret, starter den øjeblikkeligt, og træningstilstanden virker helt offline.'],
          note: 'På Android og i Chrome/Edge til computer klarer installationsknappen det hele. På iPhone/iPad tillader Apple kun installation via Safari: Del-knappen \u2192 \u201cFøj til hjemmeskærm\u201d — klienten viser disse trin, når det er nødvendigt. Knappen forsvinder, når appen er installeret.' },
        { id: 'platforms', t: 'Platforme og browsere',
          b: ['Klienten kører i enhver moderne browser på ethvert system — Windows, macOS, Linux, Android, iOS. Nogle få funktioner afhænger af nyere browser-API\u2019er; når en API mangler, skjuler funktionen sig eller forklarer det i stedet for at gå i stykker. De vigtigste forskelle at kende:'],
          list: [
            'Chrome / Edge (computer): alt virker, inklusive at skrive .pdb-loggen til en mappe.',
            'Firefox: alt undtagen at skrive .pdb til en mappe (API endnu ikke tilgængelig).',
            'Safari / iOS: installation via Del \u2192 \u201cFøj til hjemmeskærm\u201d; ingen vibration; fuld skærm begrænset på iPhone; lyden starter efter dit første tryk.',
            'Android: fuld understøttelse i Chromium-browsere, inklusive vibration og Tilbage-knappens opførsel.'] },
        { id: 'avatar', t: 'Kaldenavn og avatar',
          b: ['Vælg dit kaldenavn og din avatar på loginskærmen, før du forbinder. På pokerth.net er dit kaldenavn dit kontonavn; avatarer deles med andre spillere via avatarserveren.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pokerregler',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em kort fortalt',
          b: ['PokerTH spilles som No-Limit Texas Hold\u2019em. Hver spiller får to lukkede kort (hole cards). Derefter lægges fem fælleskort med billedsiden opad midt på bordet. Den bedste hånd på fem kort dannet af enhver kombination af dine to kort og de fem fælleskort vinder potten.'] },
        { id: 'blinds', t: 'Blinds og dealerknappen',
          b: ['Før hver hånd fylder to tvungne indsatser potten: small blind og big blind, som lægges af de to spillere til venstre for dealerknappen. Knappen rykker én plads med uret efter hver hånd, så alle betaler blinds på skift. Blinds stiger med jævne mellemrum gennem partiet.',
              'På bordet er knappen og blinds markeret med jetoner: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'De fire indsatsrunder',
          list: [
            'Pre-flop — efter de lukkede kort er delt ud, begynder første indsatsrunde til venstre for big blind.',
            'Flop — tre fælleskort afsløres, efterfulgt af en indsatsrunde.',
            'Turn — et fjerde fælleskort, derefter endnu en indsatsrunde.',
            'River — det femte og sidste fælleskort, derefter den sidste indsatsrunde.'],
          b: ['En indsatsrunde slutter, når hver spiller, der stadig er med i hånden, har lagt det samme beløb i potten (eller er all-in).'] },
        { id: 'actions', t: 'Hvad du kan gøre, når det er din tur',
          list: [
            'Fold — opgive hånden. Dine kort ryger ud, og du spiller ikke længere om potten.',
            'Check — gå videre uden at satse. Kun muligt, når der ikke er noget at betale.',
            'Call — gå med den aktuelle indsats.',
            'Bet — åbne indsatserne, når ingen har satset endnu på denne street.',
            'Raise — forhøje oven på en eksisterende indsats. Den mindste forhøjelse svarer til den forrige indsats eller forhøjelse.',
            'All-In — sætte hele din stak. Du bliver i hånden op til det beløb, du har dækket.'] },
        { id: 'showdown', t: 'Showdown og delte potter',
          b: ['Hvis flere spillere er tilbage efter indsatsrunden på river, vises hænderne, og den bedste vinder — den vindende kombination vises under fælleskortene. Når en spiller er all-in for mindre end de fulde indsatser, opstår sidepotter: hver spiller kan kun vinde den del af potten, som vedkommende har bidraget til. Lige hænder deler potten.'] },
        { id: 'hands', t: 'Hændernes rangorden',
          b: ['Fra svagest til stærkest:'],
          list: [
            '1. High Card — ingen kombination; det højeste kort afgør.',
            '2. Pair — to kort af samme værdi.',
            '3. Two Pair — to forskellige par.',
            '4. Three of a Kind — tre kort af samme værdi.',
            '5. Straight — fem kort i rækkefølge (esset tæller højt eller lavt).',
            '6. Flush — fem kort i samme kulør.',
            '7. Full House — tre ens plus et par.',
            '8. Four of a Kind — fire kort af samme værdi.',
            '9. Straight Flush — en straight, helt i én kulør.',
            '10. Royal Flush — fra ti til es i én kulør. Den bedst mulige hånd.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Spilleskærmen',
      sections: [
        { id: 'actionbar', t: 'Handlingsbjælken',
          b: ['Når det er din tur, lyser handlingsbjælken forneden op med op til fire knapper: Fold (rød), Check / Call (blå), Bet / Raise (grøn — den primære handling, fremhævet) og All-In (mørkerød). Check / Call-knappen viser det nøjagtige beløb, der skal betales; Bet / Raise viser det beløb, du er ved at lægge. Efter river kan All-In blive til en Show-knap til at vise dine kort.'] },
        { id: 'betctl', t: 'Vælg din indsats',
          b: ['Justér forhøjelsesbeløbet med talfeltet, skyderen eller hurtigknapperne 1/3 \u00b7 1/2 \u00b7 Pot (brøkdele af den aktuelle pot). Beløbene afrundes automatisk og holdes mellem den mindste og største tilladte forhøjelse. Hvis du hellere tænker i big blinds, kan en indstilling vise alle beløb i BB i stedet for jetoner.'] },
        { id: 'preselect', t: 'Forvælg en handling',
          b: ['Før din tur kan du lade en handling på forhånd: tryk på en knap, og den får en gylden kant med en lille gylden prik. Når din tur kommer, udføres handlingen øjeblikkeligt. En forvalgt Fold bliver automatisk til Check, når check er gratis — du folder aldrig gratis. Forvalg nulstilles ved hver ny hånd, hvert streetskift og showdown, og annulleres, hvis situationen ændrer sig (for eksempel hvis beløbet, der skal betales, ændrer sig).'] },
        { id: 'automodes', t: 'Automatiske tilstande',
          b: ['Rullemenuen ved siden af handlingsknapperne tilbyder tre spilletilstande: Manuel, Auto Check/Call og Auto Check/Fold. Autotilstandene spiller for dig, indtil du skifter tilbage — ethvert manuelt klik på en handling vender straks tilbage til Manuel.'] },
        { id: 'readtable', t: 'Læs bordet',
          b: ['Hver spillerboks viser avatar, navn, stak og aktuel indsats. Dealer og blinds er markeret med D-/SB-/BB-jetoner. Et farvet mærke på boksen viser spillerens seneste handling; en tynd blå bjælke tæller vedkommendes betænkningstid ned. Boksen for spilleren i tur lyser op; din egen boks får en pulserende gylden ramme, når det er din tur.',
              'Statusbjælken over bordet viser den samlede pot, indsatserne på den aktuelle street, fasen (Pre-flop, Flop, Turn, River) samt spil- og håndnumre. Foldede spillere har gennemsigtige kort; udslåede spillere er nedtonede. Ved håndens afslutning kan et vindervindue opsummere, hvem der vandt hvad — kan slås fra i indstillingerne.'] },
        { id: 'seatlayout', t: 'Pladsernes placering',
          b: ['Som webudvidelse vælges spillerboksenes layout i Avancerede indstillinger \u2192 Pladser: Automatisk følger den officielle klient (faste positioner i stående, beregnet ellipse i liggende), eller gennemtving Stående eller Liggende layout — og Brugerdefineret lader dig placere hver plads selv: en redigeringstilstand dukker op, hvor du trækker hver boks nøjagtigt derhen, hvor du vil, og layoutet gemmes.'] },
        { id: 'zoom', t: 'Bordzoom (telefoner)',
          b: ['På små skærme forstørrer lupknapperne bordet (2\u00d7), og du kan trække det med fingeren — din egen boks og handlingsbjælken bliver stående. Visningen følger automatisk den aktive plads og zoomer ud ved showdown for at give overblik. Kan slås fra i Avancerede indstillinger.'],
          note: 'På telefoner og tablets er browserens egen knibezoom blokeret som standard, så en zoombevægelse aldrig udløses ved et uheld midt i en hånd; slå den til igen i Avancerede indstillinger \u2192 Brugergrænseflade, hvis du foretrækker det.' },
        { id: 'protections', t: 'Kigge-beskyttelse og beskyttelse mod utilsigtet Call',
          b: ['To valgfrie beskyttelser: kigge-beskyttelsen holder dine egne kort skjult, indtil du rører dem (nyttigt, når nogen kan se din skærm), og værnet mod utilsigtet Call låser kortvarigt Call-knappen lige efter en stor forhøjelse, så et tryk beregnet til et mindre Call ikke ved et uheld rammer det forhøjede beløb. Begge findes i Avancerede indstillinger.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Infopanelet',
      sections: [
        { id: 'open', t: 'Åbn panelet',
          b: ['Under et spil åbnes infopanelet fra headeren (eller Alt+L / Alt+I) og har tre faner: Log, Odds og Statistik. På telefonen svæver det over bordet; på større skærme er det et flytbart vindue, der kan ændres i størrelse — grib \u28ff-håndtaget for at flytte det, kanterne for at ændre størrelsen. Positionen huskes.'] },
        { id: 'log', t: 'Spillog',
          b: ['Fanen Log registrerer hele partiet hånd for hånd: blinds, hver handling med beløb, viste kort og vindere, alt sammen i farver, så det er hurtigt at læse. Eksportknappen gemmer loggen i en fil, hvis du vil gennemgå en session senere.'] },
        { id: 'odds', t: 'Odds (sandsynlighedsmonitor)',
          b: ['Fanen Odds viser for din aktuelle hånd den løbende sandsynlighed for at ende med hver af de 10 håndkategorier — fra High Card til Royal Flush — hver med ikon, procent og bjælke. Visningen nedtones, så snart du folder. Den bruger kun dine egne kort og fælleskortene: den ser intet, som dine modstandere ikke viser.'] },
        { id: 'journal', t: 'Håndlogs og vinduet \u201cLogs\u201d',
          b: ['Ud over den løbende log optages hver hånd, du spiller, lokalt i din browser i samme format som den officielle klients .pdb-logfiler. Vinduet Logs (Avancerede indstillinger \u2192 Logbeskeder \u2192 Administrér logs\u2026) viser dine sessioner og lader dig arbejde med dem: forhåndsvise en session med søgning og fremhævning, filtrere efter spil, eksportere som HTML eller ren tekst, gemme den rå .pdb-fil eller importere en .pdb optaget af skrivebordsklienten. Sessioner slettes én ad gangen eller alle på én gang (med bekræftelse), og en automatisk opbevaring kan nøjes med at beholde de seneste 7, 30, 90, 180 eller 365 dage. Logfiler, du selv importerer, slettes aldrig automatisk. En anden indstilling begrænser antallet af gemte sessioner, og listekolonnen kan trækkes bredere.',
              'Knappen Analysér kører en håndanalyse på en session og kan sende en log til pokerth.nets analysetjeneste. Alt bliver på din enhed, indtil du udtrykkeligt eksporterer eller sender.'] },
        { id: 'logopts', t: 'Logindstillinger',
          b: ['I Avancerede indstillinger \u2192 Logbeskeder kan du slå optagelse til eller fra og vælge skriveintervallet (efter hver handling eller én gang pr. hånd), ligesom i skrivebordsklientens indstillinger. En ekstra indstilling skriver .pdb-filen direkte til en mappe efter dit valg og opdaterer den efter hver hånd — nøjagtigt som skrivebordsklienten gør, så andre værktøjer kan læse den live.'],
          note: 'At skrive til en lokal mappe kræver File System Access-API\u2019en: kun Chrome og Edge til computer. Firefox, Safari og mobilbrowsere kan ikke — indstillingen viser så en kort forklaring, og manuel eksport fra Logs-vinduet er stadig tilgængelig overalt.' },
        { id: 'assist', t: 'Assistance (håndstyrke)',
          b: ['Øverst på fanen Odds læser assistancebanneret din hånd for dig. Før floppet navngiver det din starthånd og bedømmer den med stjerner; fra floppet viser det din aktuelt bedste kombination og, efter en hurtig simulering, din anslåede chance for at vinde hånden i procent, med en farveindikator fra rød (svag) til grøn (stærk). Ligesom sandsynlighedsmonitoren bruger den kun information, du kan se.',
              'To visningsstile findes i Avancerede indstillinger \u2192 Pladser: Segmenter (ti blokke) eller en klassisk statuslinje. Hele assistancefunktionen kan slås fra i Avancerede indstillinger \u2192 Assistance.'] },
        { id: 'assistwin', t: 'Assistancen som svævende widget',
          b: ['Assistanceblokken kan rives løs fra panelet til sit eget lille vindue, der altid ligger øverst: brug løsriv-knappen på blokken, og flyt og skalér den, hvor du vil over bordet — praktisk til at holde øje med håndstyrken uden hele panelet åbent. Dok-knappen sætter den tilbage i fanen Odds, og positionen huskes. Inde i panelet lader et trækhåndtag mellem Assistance og odds dig fordele pladsen mellem de to.'] },
        { id: 'stats', t: 'Statistik',
          b: ['Fanen Statistik følger din session: spillede hænder, sete flops, showdowns, sejrsprocenter og mere. Statistiksporingen kan slås fra i Avancerede indstillinger.'] },
        { id: 'hud', t: 'Statistik-HUD ved pladserne (beta)',
          b: ['HUD\u2019en hæfter en lille statistikboks ved hver spillers plads, opbygget af de hænder, du har optaget i dine logs: antal observerede hænder, derefter VPIP (hvor ofte vedkommende frivilligt lægger penge pre-flop), PFR (pre-flop-forhøjelser), AF (aggressionsfaktor), 3B (3-bet), CB (continuation bet) og F3B (fold mod 3-bet), med farvekoder fra passiv til aggressiv. Tryk på en boks for en detaljeret popover med flere tal (steal-forsøg, fold mod steal, showdown-procenter\u2026), og træk den, hvis den dækker noget.',
              'HUD\u2019en kender kun det, du har set ved dine egne borde — den læser dine lokale håndlogs, så optagelsen skal være slået til, og tallene giver først mening efter tilstrækkeligt mange hænder. Det er en betafunktion, slået fra som standard: slå den til i Avancerede indstillinger \u2192 Assistance.'] },
        { id: 'handsbtn', t: 'Overblik over kombinationerne',
          b: ['Pokerhånds-ikonet på klædet åbner når som helst et hurtigt overblik over de 10 kombinationer — praktisk, mens du lærer. Kan skjules i Avancerede indstillinger.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat og socialt',
      sections: [
        { id: 'panels', t: 'Lobbychat og bordchat',
          b: ['Der er en chat i lobbyen og en ved bordet. På telefonen svæver bordchatten over spillet; på større skærme er det et flytbart vindue, der kan ændres i størrelse. Et mærke på chatknappen tæller ulæste beskeder.'] },
        { id: 'typing', t: 'Skrivehjælp',
          list: [
            'Tab fuldfører et kaldenavn — tryk Tab igen for at bladre gennem matchene.',
            '\u2191 / \u2193 bladrer i din egen beskedhistorik.',
            'Emoji-knappen åbner en komplet vælger; at skrive : foreslår også emotes, mens du taster.'] },
        { id: 'emotes', t: 'Emotes og smileys',
          b: ['Chatten konverterer emote-koder nøjagtigt som den officielle skrivebordsklient: skriv et navn mellem to koloner, og det bliver til emojien — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 mere end 1.900 koder understøttes (hele GitHub-sættet). Klassiske tekstsmileys konverteres også: :-) ;) :D xD :P <3 og omkring firs andre.',
              'At skrive : åbner en forslagsboks, der fuldfører koden, mens du taster (\u2191/\u2193 for at vælge, Tab eller Enter for at acceptere). Emoji-konverteringen kan slås helt fra i Avancerede indstillinger \u2192 Chat.'] },
        { id: 'commands', t: 'Chatkommandoer',
          b: ['Chatten forstår skråstregskommandoer. To er synlige for andre:'],
          keys: [
            ['/me <tekst>', 'Handlingsbesked, vises som \u201c* ditkaldenavn tekst\u201d'],
            ['/emoji <emoji>', 'Afspiller en emoji-reaktion (det samme, som reaktionsvælgeren sender)']] },
        { id: 'diagcmds', t: 'Diagnosekommandoer',
          b: ['Alt andet er lokalt: kun du ser svarene, og intet sendes til bordet. Skriv /help for at få dem alle vist. De mest nyttige:'],
          keys: [
            ['/help', 'Vis alle kommandoer'],
            ['/update', 'Tjek for ny version og opdatér'],
            ['/lang <kode>', 'Skift sprog (fx /lang da)'],
            ['/sound on|off', 'Slå spillyde til/fra'],
            ['/zoom', 'Slå bordluppen til/fra'],
            ['/clear', 'Ryd chatten lokalt'],
            ['/table', 'Info om det aktuelle spil (blinds, spillere, stakke)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostik af klientstatus, netværk og flydende afvikling'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Avanceret fejlfinding (kort, protokol, lyd, lager, pladser)'],
            ['/copy', 'Kopiér det seneste kommandosvar til udklipsholderen']] },
        { id: 'reactions', t: 'Emoji-reaktioner',
          b: ['Reaktionsknappen åbner en vælger med 30 animerede reaktioner (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026), der afspilles med en effekt over din plads, synlige for hele bordet — også spillere på skrivebordsklienten. Reaktioner kan slås helt fra i Avancerede indstillinger.'] },
        { id: 'translate', t: 'Forstå alle',
          b: ['Med chatoversættelse slået til får hver besked en oversættelsesknap, der viser den på dit sprog via browserens oversætter. Almindelige bordforkortelser (gg, nh, utg\u2026) forklares i et værktøjstip, når du peger på dem — begge indstillinger findes i Avancerede indstillinger \u2192 Chat.'],
          note: 'Oversættelsen bruger Google Translate-tjenesten og virker i alle browsere — der kræves kun internetforbindelse. En besked sendes kun til oversættelsestjenesten, når du trykker på dens oversættelsesknap, aldrig automatisk.' },
        { id: 'social', t: 'Spillere: profil, invitér, ignorér',
          b: ['Tryk på en hvilken som helst spiller — ved bordet eller på lobbylisten — for at åbne vedkommendes kort: profil og statistik, invitér til dit spil, eller ignorér (chatbeskederne skjules; ignorering kan altid fortrydes). En bekræftelse før invitér/ignorér kan slås til i indstillingerne.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby og spil',
      sections: [
        { id: 'list', t: 'Spillisten',
          b: ['Lobbyen viser alle serverens borde. Hver post viser antal spillere, spiltype, en hængelås, når der kræves adgangskode eller invitation, og et statusmærke: \u201cVenter\u201d (grønt — spillet er ikke startet, du kan deltage, hvis der er en ledig plads), \u201cI gang\u201d (varm farve — kan ses live, når tilskuere er tilladt) og \u201cLukket\u201d (nedtonet). Et fuldt bord kendes simpelthen på den fulde tæller, fx 10/10; mærkernes farver følger det aktive tema.',
              'Filterrullemenuen indsnævrer listen nøjagtigt som skrivebordsklienten, hvor hvert valg er strengere end det forrige: kun åbne spil \u2192 skjul også fulde borde \u2192 derefter kun ikke-private, kun private eller kun ranglistespil. Dit valg huskes. Søgefeltet finder et spil ud fra navnet, og spillermærket åbner listen over alle online, som kan søges og sorteres.'] },
        { id: 'join', t: 'Deltag og se med',
          b: ['Vælg et åbent spil, og deltag — en hængelås betyder, at der kræves adgangskode. Igangværende spil, der tillader tilskuere, kan ses live: du ser bordet og chatten, men de lukkede kort forbliver skjulte, og du kan ikke handle.'] },
        { id: 'gameinfo', t: 'Spilinfo',
          b: ['Før du deltager, viser spilinfokortet alt, hvad der definerer bordet: spiltype, blinds og deres udvikling (fordobling eller manuel liste), startstak, handlingstid, pause mellem hænderne, og hvem der allerede sidder.'] },
        { id: 'create', t: 'Opret et spil',
          b: ['Opret dit eget bord: navn, antal spillere, startstak, første small blind og forhøjelsesplan, handlingstid, og om tilskuere er tilladt. Der findes fire spiltyper: Normal (alle), kun registrerede spillere, kun på invitation, og Rangliste (tæller til den officielle rangliste — ingen adgangskode mulig i det tilfælde). Dine yndlingsindstillinger kan gemmes og genindlæses.'] },
        { id: 'invites', t: 'Invitationer',
          b: ['Spillere kan invitere dig til deres bord; du får en notifikation, du kan acceptere eller afvise. At blive inviteret er den eneste måde at komme ind i et spil kun på invitation.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Din konto',
          b: ['Den officielle internetserver er pokerth.net. At spille dér kræver en gratis pokerth.net-konto — registrér dig på hjemmesiden, og log derefter ind her med samme kaldenavn og adgangskode. Denne webklient forbinder til nøjagtig samme server som skrivebordsklienten: samme konti, samme borde, samme ranglister, og du kan sidde ved et bord med spillere fra skrivebordsklienten.'] },
        { id: 'ranked', t: 'Ranglistespil og sæsoner',
          b: ['Spil af typen Rangliste tæller til den officielle sæsonrangliste. Din profil i appen viser din registreringsdato, din Rank i den aktuelle sæson, din Score, dit gennemsnit og dine spillede spil samt dine seneste resultater. Normale (ikke-rangliste) spil er kun for sjov og ændrer intet.'] },
        { id: 'rankhow', t: 'Sådan beregnes ranglisten',
          b: ['I hvert rangeret spil giver din placering point: 15 for førstepladsen, så 9, 6, 4, 3, 2 og 1 ned til syvendepladsen; fra ottende til tiende gives der intet. Et bord uddeler altså 40 point i alt.',
              'Din Score er ikke summen af de point, men dit gennemsnit pr. spil, dæmpet af en faktor, der vokser med antallet af spillede spil: nogle få gode resultater rækker ikke til at slå sig ned i toppen, der skal også regelmæssighed til — jo mere du spiller, jo tættere kommer din Score på dit sande gennemsnit. En sæson varer et kvartal: ved skiftet arkiveres alt, og tællerne begynder forfra på nul, mens tidligere sæsoner stadig kan ses. I spillet viser podie-knappen sæsonplaceringen for spillerne ved dit bord.'],
          note: 'Pointskalaen og den præcise formel fastsættes af pokerth.nets rangliste-server og kan ændre sig; siderne på webstedet er det gældende.' },
        { id: 'rankings', t: 'Ranglistesider',
          b: ['Ranglistepunktet åbner den officielle PokerTH-rangliste, der kan søges efter spiller, samt fællesskabsranglisterne (BBC, WEC). Hvis ranglister ikke interesserer dig, kan punktet skjules i Avancerede indstillinger \u2192 Fællesskab.'] },
        { id: 'cups', t: 'Fællesskabets cups: BBC og WeCup',
          b: ['To fællesskaber afvikler deres egne turneringer på pokerth.net, hver med sit websted og sin rangliste. Best Brainies Cup (BBC) er en trinturnering fra 2013: man arbejder sig fra Step 1 til Step 4, og en ny sæson begynder efter hvert Step 4-spil, når pokalen uddeles. WeCup (WEC) har sin egen, langt mere spredte skala — 75 point for førstepladsen, så 45, 30, 20… — og dens score normaliserer dit gennemsnit efter antallet af spil, du har spillet, sammenlignet med de øvrige medlemmer.',
              'Begge ranglister åbnes fra pokal-knappen ved siden af PokerTH-ranglisten. Bordindstillingerne for disse turneringer følger med som forudindstillinger, når du opretter et spil (BBC Step 1 til 4, WEC, WEC Monthly Final og WEC Grand Final), så du kan træne under de samme betingelser. Deltagelse kræver tilmelding på den pågældende cups websted.'],
          note: 'Interesserer cups dig ikke, skjuler du hele indholdet på én gang i Avancerede indstillinger → Fællesskab.' },
        { id: 'forumcups', t: 'Forum-cups og events',
          b: ['pokerth.nets forum huser også Monthly Cup, en månedlig serie, hvor spillerne fordeles på Gold-, Silver- og Bronze-borde, før månedens mester kåres, dertil enkeltstående særlige cups i løbet af året.',
              'Tilmeldinger, tidspunkter, bordindstillinger og resultater offentliggøres på forummet, og spillene afvikles på den officielle server som alle andre. En pokerth.net-konto er nok til at følge resultaterne; tilmelding til en cup går gennem den tilhørende forumtråd.'] },
        { id: 'avatars', t: 'Avatarer og flag',
          b: ['På pokerth.net distribueres din avatar til andre spillere via avatarserveren, og et lille landeflag kan vises på spillerboksene. Begge dele er valgfrie og kan indstilles i indstillingerne.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Træningstilstand',
      sections: [
        { id: 'what', t: 'Hvad det er',
          b: ['Tilstanden Lokalt / træning er et komplet spil mod computerstyrede modstandere: ingen forbindelse, ingen konto, intet på spil. Når appen er installeret (eller bare besøgt én gang), virker den helt offline — perfekt til at lære spillet, afprøve grænsefladen eller fordrive tiden i flytilstand.'] },
        { id: 'setup', t: 'Opsæt et spil',
          b: ['Vælg antal modstandere, startstak, blinds og deres udvikling samt spilhastighed. Botternes sammensætning og sværhedsgrad justeres i Avancerede indstillinger \u2192 Lokalt spil — fra blide modstandere til et hårdere og mere varieret bord.'] },
        { id: 'trophies', t: 'Trofæer',
          b: ['Træningstilstanden har sin egen progression: 28 trofæer fordelt på seks kategorier (progression, teknik, stil, formater, sjov og en hemmelig) låses op ved at spille — spillede hænder, vundne partier, store bluffs, særlige hænder og mere. Din trofæfremgang er kumulativ og flettes mellem enheder, når kontoens indstillingssynkronisering er aktiv.'] },
        { id: 'learn', t: 'Et godt sted at lære',
          b: ['Alt, hvad der er beskrevet i de andre kapitler, virker også her: sandsynlighedsmonitoren, assistancevisningen, forvalget, tastaturgenvejene. Træningstilstanden er det bedste sted at prøve dem uden pres, før du kaster dig ud på pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stil og lyd',
      sections: [
        { id: 'themes', t: 'Temaer',
          b: ['Kategorien Stil i Avancerede indstillinger klæder hele klienten på. Forudindstillinger sætter alt op med ét tryk (det klassiske grønne kasino, det officielle PokerTH-look\u2026); nedenunder finjusterer individuelle akser hver for sig farvepaletten, bordklædet og kortenes forsider — ændr en hvilken som helst akse, og din blanding bliver et brugerdefineret tema. Mørk, lys eller automatisk tilstand vælges under Brugergrænseflade, og dine valg gælder øjeblikkeligt, på alle skærme, og huskes.'] },
        { id: 'tablelook', t: 'Borde, kortspil, pladser',
          b: ['Ud over temaet kan flere elementer udskiftes uafhængigt: bordbaggrunden, kortspillet, kortryggen (matcher automatisk kortspillet, eller importér dit eget billede), dealer- og blindjetonerne, handlingsknappernes stil samt komplette pladspakker, der omklæder spillerboksene. Vælg det hele i Avancerede indstillinger \u2192 Stil; ændringerne ses straks ved bordet.'] },
        { id: 'music', t: 'Musikafspiller',
          b: ['Musikpunktet i headermenuerne åbner en lille baggrundsmusikafspiller: vælg et nummer fra afspilningslisten, afspil/pause, forrige/næste, bland, og gentag ét nummer, hele listen eller intet. Lydstyrke, valgt nummer og gentagelsestilstand huskes. Afspilningen starter aldrig af sig selv — browsere kræver et tryk — og afspilleren er helt uafhængig af spillets lydeffekter.'] },
        { id: 'sounds', t: 'Lydeffekter',
          b: ['Spillydene er samlet i fire kategorier, der kan slås til hver for sig, nøjagtigt som i skrivebordsklienten: spilhandlinger (uddelte kort, Check, Call, Raise, din tur\u2026), lobbychat-notifikation, netværksspilnotifikationer (spiller tilsluttet, spil klar) og notifikation om blindforhøjelse. Én lydstyrkeskyder styrer dem alle, i Avancerede indstillinger \u2192 Lyd.'],
          note: 'Alle browsere — især iOS — nægter at afspille lyd, før du har rørt siden én gang. Hvis et spil starter i stilhed, vækker et enkelt tryk hvor som helst lyden; klienten reparerer også automatisk lydmotoren, når iOS suspenderer den (indgående opkald, baggrund\u2026).' },
        { id: 'voice', t: 'Stemme og vibration',
          b: ['To ekstra kanaler kan holde dig orienteret uden at kigge på skærmen: stemmeannonceringer læser spilbegivenheder højt via enhedens talesyntese, og på telefonen kan en kort vibration markere din tur. Begge er webudvidelser, som standard slået til eller fra afhængigt af enheden, i Avancerede indstillinger \u2192 Indsatser og tur.'],
          note: 'Vibration virker på Android (Chromium-browsere); Apple stiller ikke en vibrations-API til rådighed for hjemmesider, så iPhones kan ikke vibrere. Stemmeannonceringer virker overalt, men de tilgængelige stemmer og sprog afhænger af dit system — klienten bruger det bedste match, den finder.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Indstillinger og genveje',
      sections: [
        { id: 'where', t: 'Hvor indstillingerne bor',
          b: ['Avancerede indstillinger åbnes fra tandhjulspunktet i enhver headermenu. De er grupperet som i skrivebordsklienten: Brugergrænseflade, Stil, Lyd, Lokalt spil, Netværksspil, Internetspil, Kaldenavne / Avatarer, Logbeskeder og Gendan standarder. Hver webspecifik funktion har sin egen kontakt dér, så du kan slå alt fra, du ikke bruger.'] },
        { id: 'cfgxml', t: 'Udveksl indstillinger med skrivebordsklienten',
          b: ['Dine indstillinger kan rejse mellem klienter: kategorien Logbeskeder tilbyder eksport/import af den officielle config.xml-fil (den \u007e/.pokerth/config.xml, som skrivebords- og QML-klienterne bruger). Eksporten skriver de delte indstillinger — navn, visningsindstillinger, lyde, bordpræferencer, blinds, stilarter — og importen anvender en fil fra computeren her. Indstillinger, som denne klient ikke kender, bevares urørte i filen.'] },
        { id: 'sync', t: 'Indstillinger, der følger dig',
          b: ['Når du spiller med en konto, synkroniseres dine indstillinger, dit tema, dine tastebindinger, dit sprog og dine træningstrofæer: ændr noget på én enhed, og den næste enhed, du logger ind fra, samler det op. Trofæfremgangen flettes, aldrig overskrives, så spil på to enheder bevarer altid det bedste fra begge.'] },
        { id: 'updates', t: 'Hold dig opdateret',
          b: ['Klienten opdaterer sig selv: når en ny version udrulles, inviterer et banner dig til at genindlæse (eller skriv /update i chatten for at tjekke manuelt). Fra tid til anden kan en lille produktundersøgelse dukke op og spørge om din mening om en funktion — deltagelse er valgfri, og undersøgelser kan slås helt fra i Avancerede indstillinger \u2192 Fællesskab.'] },
        { id: 'fkeys', t: 'Officielle tastaturgenveje',
          b: ['PokerTH\u2019s officielle funktionstaster virker under et spil:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (rækkefølgen kan vendes i indstillingerne)'],
            ['F5', 'Vis dine kort (når det er muligt)'],
            ['F6 / F7 / F8', 'Manuel \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manuel \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Log \u00b7 Oddspanel'],
            ['F11', 'Fuld skærm']],
          note: 'Genvejene kræver et fysisk tastatur. På Mac styrer F-tasterne medier som standard: hold Fn nede (eller slå \u201cBrug F1-, F2-taster osv. som standardfunktionstaster\u201d til i macOS-indstillingerne). På iPhone er fuld skærm begrænset af iOS — at installere appen som PWA giver den samme fuldskærmsoplevelse.' },
        { id: 'webkeys', t: 'Webbogstavtaster',
          b: ['Webudvidelse: enkeltbogstavtaster udløser også handlingerne og kan omtildeles i Avancerede indstillinger \u2192 Tastaturgenveje:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Esc', 'Luk det forreste vindue (også Androids Tilbage-knap)']],
          note: 'På Android lukker systemets Tilbage-knap/-bevægelse vinduer som Esc i stedet for at forlade spillet (kan indstilles). iOS har ingen tilsvarende systemknap — brug \u2715 i hvert vindue.' }
      ]
    }
  ]
};
