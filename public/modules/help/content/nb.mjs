// ── help/content/nb.mjs — Norsk (bokmål) hjelpekorpus (4. parti) ────────────
// Oversettelse av en.mjs (referanse). Struktur og id-er identiske; bare
// t / b / list / keys (etiketter) / note er oversatt. Pokertermer
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) forblir på
// engelsk etter appens konvensjon.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Kom i gang',
      sections: [
        { id: 'modes', t: 'Tre måter å spille på',
          b: ['Velg på innloggingsskjermen hvordan du vil spille.'],
          list: [
            'Internett — spill på nett på den offisielle pokerth.net-serveren, med rangeringer. En pokerth.net-konto kreves; registrering på pokerth.net er gratis.',
            'Lokalt / trening — spill offline mot botter. Ingenting å sette opp, fungerer uten tilkobling og låser opp trofeer etter hvert som du gjør fremskritt.',
            'LAN / dedikert server — koble til en privat PokerTH-server på lokalnettet ditt eller din egen maskin.'] },
        { id: 'lan', t: 'LAN / dedikert server',
          b: ['Den tredje modusen kobler til enhver PokerTH-server som du eller en venn kjører — på et hjemmenettverk, en privat VPS, hvor som helst. Skriv inn serverens adresse og port, huk av for TLS hvis serveren bruker en kryptert port, og logg inn med et kallenavn (gjestetilgang fungerer hvis serveren tillater det). Ved bordet oppfører alt seg deretter nøyaktig som på den offisielle serveren.'] },
        { id: 'famboard', t: 'Familierangering',
          b: ['Bare på private servere og i LAN-spill lagrer klienten samlede statistikker per kallenavn — spilte og vunne hender og partier, største gevinst, beste rekke — og deler dem via serveren, slik at hver enhet rundt bordet ser den samme rangeringen. pokerth.net-spill spores aldri på denne måten, og treningsmodusens statistikk holdes helt adskilt.'] },
        { id: 'language', t: 'Språk',
          b: ['Grensesnittet finnes på 36 språk. Bytt når som helst i Avanserte innstillinger (tannhjulmenyen), kategorien Brukergrensesnitt. Pokerens handlingstermer (Fold, Check, Call, Bet, Raise, All-In) forblir på engelsk etter konvensjonen, nøyaktig som i skrivebordsklienten.'] },
        { id: 'pwa', t: 'Installer som app',
          b: ['Denne klienten er en Progressive Web App: du kan installere den fra nettleserens meny (eller installeringsknappen i toppfeltet) og få en fullskjermsapp med eget ikon. Når den er installert, starter den umiddelbart, og treningsmodusen fungerer helt offline.'],
          note: 'På Android og i Chrome/Edge på datamaskin gjør installeringsknappen alt. På iPhone/iPad tillater Apple installasjon bare via Safari: Del-knappen \u2192 \u201cLegg til på Hjem-skjerm\u201d — klienten viser disse trinnene når det trengs. Knappen forsvinner når appen er installert.' },
        { id: 'platforms', t: 'Plattformer og nettlesere',
          b: ['Klienten kjører i enhver moderne nettleser på ethvert system — Windows, macOS, Linux, Android, iOS. Noen få funksjoner avhenger av nyere nettleser-API-er; når et API mangler, skjuler funksjonen seg eller forklarer det i stedet for å gå i stykker. De viktigste forskjellene å kjenne til:'],
          list: [
            'Chrome / Edge (datamaskin): alt fungerer, inkludert å skrive .pdb-loggen til en mappe.',
            'Firefox: alt unntatt å skrive .pdb til en mappe (API ennå ikke tilgjengelig).',
            'Safari / iOS: installasjon via Del \u2192 \u201cLegg til på Hjem-skjerm\u201d; ingen vibrasjon; full skjerm begrenset på iPhone; lyden starter etter ditt første trykk.',
            'Android: full støtte i Chromium-nettlesere, inkludert vibrasjon og Tilbake-knappens oppførsel.'] },
        { id: 'avatar', t: 'Kallenavn og avatar',
          b: ['Velg kallenavn og avatar på innloggingsskjermen før du kobler til. På pokerth.net er kallenavnet ditt kontonavnet ditt; avatarer deles med andre spillere via avatarserveren.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pokerregler',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em i et nøtteskall',
          b: ['PokerTH spilles som No-Limit Texas Hold\u2019em. Hver spiller får to lukkede kort (hole cards). Deretter legges fem felleskort med billedsiden opp midt på bordet. Den beste hånden på fem kort dannet av enhver kombinasjon av dine to kort og de fem felleskortene vinner potten.'] },
        { id: 'blinds', t: 'Blinds og dealerknappen',
          b: ['Før hver hånd fyller to tvungne innsatser potten: small blind og big blind, som legges av de to spillerne til venstre for dealerknappen. Knappen flytter seg én plass med klokken etter hver hånd, slik at alle betaler blinds etter tur. Blinds stiger med jevne mellomrom gjennom partiet.',
              'På bordet er knappen og blinds merket med sjetonger: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'De fire innsatsrundene',
          list: [
            'Pre-flop — etter at de lukkede kortene er delt ut, begynner første innsatsrunde til venstre for big blind.',
            'Flop — tre felleskort avsløres, etterfulgt av en innsatsrunde.',
            'Turn — et fjerde felleskort, deretter enda en innsatsrunde.',
            'River — det femte og siste felleskortet, deretter den siste innsatsrunden.'],
          b: ['En innsatsrunde slutter når hver spiller som fortsatt er med i hånden, har lagt samme beløp i potten (eller er all-in).'] },
        { id: 'actions', t: 'Hva du kan gjøre når det er din tur',
          list: [
            'Fold — gi opp hånden. Kortene dine går ut, og du spiller ikke lenger om potten.',
            'Check — gå videre uten å satse. Bare mulig når det ikke er noe å betale.',
            'Call — gå med den gjeldende innsatsen.',
            'Bet — åpne innsatsene når ingen har satset ennå på denne streeten.',
            'Raise — høyne oppå en eksisterende innsats. Minste høyning tilsvarer forrige innsats eller høyning.',
            'All-In — sette hele stakken din. Du blir i hånden opp til beløpet du har dekket.'] },
        { id: 'showdown', t: 'Showdown og delte potter',
          b: ['Hvis flere spillere er igjen etter innsatsrunden på river, vises hendene, og den beste vinner — den vinnende kombinasjonen vises under felleskortene. Når en spiller er all-in for mindre enn de fulle innsatsene, oppstår sidepotter: hver spiller kan bare vinne den delen av potten vedkommende har bidratt til. Like hender deler potten.'] },
        { id: 'hands', t: 'Hendenes rangering',
          b: ['Fra svakest til sterkest:'],
          list: [
            '1. High Card — ingen kombinasjon; det høyeste kortet avgjør.',
            '2. Pair — to kort av samme verdi.',
            '3. Two Pair — to forskjellige par.',
            '4. Three of a Kind — tre kort av samme verdi.',
            '5. Straight — fem kort i rekkefølge (esset teller høyt eller lavt).',
            '6. Flush — fem kort i samme farge.',
            '7. Full House — tre like pluss et par.',
            '8. Four of a Kind — fire kort av samme verdi.',
            '9. Straight Flush — en straight, helt i én farge.',
            '10. Royal Flush — fra ti til ess i én farge. Den best mulige hånden.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Spillskjermen',
      sections: [
        { id: 'actionbar', t: 'Handlingslinjen',
          b: ['Når det er din tur, lyser handlingslinjen nederst opp med inntil fire knapper: Fold (rød), Check / Call (blå), Bet / Raise (grønn — hovedhandlingen, fremhevet) og All-In (mørkerød). Check / Call-knappen viser det nøyaktige beløpet som skal betales; Bet / Raise viser beløpet du er i ferd med å legge. Etter river kan All-In bli en Show-knapp for å vise kortene dine.'] },
        { id: 'betctl', t: 'Velg innsatsen din',
          b: ['Juster høyningsbeløpet med tallfeltet, glidebryteren eller hurtigknappene 1/3 \u00b7 1/2 \u00b7 Pot (brøkdeler av gjeldende pott). Beløpene avrundes automatisk og holdes mellom minste og største tillatte høyning. Hvis du heller tenker i big blinds, kan en innstilling vise alle beløp i BB i stedet for sjetonger.'] },
        { id: 'preselect', t: 'Forhåndsvelg en handling',
          b: ['Før din tur kan du klargjøre en handling på forhånd: trykk på en knapp, og den får en gyllen kant med en liten gyllen prikk. Når turen din kommer, utføres handlingen umiddelbart. En klargjort Fold blir automatisk til Check når check er gratis — du folder aldri gratis. Forhåndsvalg nullstilles ved hver ny hånd, hvert streetskifte og showdown, og oppheves hvis situasjonen endrer seg (for eksempel hvis beløpet som skal betales, endres).'] },
        { id: 'automodes', t: 'Automatiske moduser',
          b: ['Nedtrekksmenyen ved siden av handlingsknappene tilbyr tre spillmoduser: Manuell, Auto Check/Call og Auto Check/Fold. Automodusene spiller for deg til du bytter tilbake — ethvert manuelt klikk på en handling går straks tilbake til Manuell.'] },
        { id: 'readtable', t: 'Les bordet',
          b: ['Hver spillerboks viser avatar, navn, stakk og gjeldende innsats. Dealer og blinds er merket med D-/SB-/BB-sjetonger. Et farget merke på boksen viser spillerens siste handling; en tynn blå linje teller ned betenkningstiden. Boksen til spilleren i tur lyser opp; din egen boks får en pulserende gyllen ramme når det er din tur.',
              'Statuslinjen over bordet viser den samlede potten, innsatsene på gjeldende street, fasen (Pre-flop, Flop, Turn, River) samt spill- og håndnumre. Foldede spillere har gjennomsiktige kort; utslåtte spillere er nedtonet. Ved håndens slutt kan et vinnervindu oppsummere hvem som vant hva — kan slås av i innstillingene.'] },
        { id: 'seatlayout', t: 'Plassenes plassering',
          b: ['Som webutvidelse velges spillerboksenes oppsett i Avanserte innstillinger \u2192 Plasser: Automatisk følger den offisielle klienten (faste posisjoner i stående, beregnet ellipse i liggende), eller tving Stående eller Liggende oppsett — og Egendefinert lar deg plassere hver plass selv: en redigeringsmodus dukker opp der du drar hver boks nøyaktig dit du vil, og oppsettet lagres.'] },
        { id: 'zoom', t: 'Bordzoom (telefoner)',
          b: ['På små skjermer forstørrer lupeknappene bordet (2\u00d7), og du kan dra det med fingeren — din egen boks og handlingslinjen står fast. Visningen følger automatisk den aktive plassen og zoomer ut ved showdown for oversikten. Kan slås av i Avanserte innstillinger.'],
          note: 'På telefoner og nettbrett er nettleserens egen knipezoom blokkert som standard, slik at en zoombevegelse aldri utløses ved et uhell midt i en hånd; slå den på igjen i Avanserte innstillinger \u2192 Brukergrensesnitt hvis du foretrekker det.' },
        { id: 'protections', t: 'Kikkebeskyttelse og vern mot utilsiktet Call',
          b: ['To valgfrie beskyttelser: kikkebeskyttelsen holder dine egne kort skjult til du berører dem (nyttig når noen kan se skjermen din), og vernet mot utilsiktet Call låser Call-knappen et øyeblikk rett etter en stor høyning, slik at et trykk ment for en mindre Call ikke ved et uhell treffer det høynede beløpet. Begge finnes i Avanserte innstillinger.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Infopanelet',
      sections: [
        { id: 'open', t: 'Åpne panelet',
          b: ['Under et spill åpnes infopanelet fra toppfeltet (eller Alt+L / Alt+I) og har tre faner: Logg, Odds og Statistikk. På telefonen svever det over bordet; på større skjermer er det et flyttbart vindu som kan endre størrelse — grip \u28ff-håndtaket for å flytte det, kantene for å endre størrelsen. Posisjonen huskes.'] },
        { id: 'log', t: 'Spillogg',
          b: ['Fanen Logg registrerer hele partiet hånd for hånd: blinds, hver handling med beløp, viste kort og vinnere, alt i farger for rask lesing. Eksportknappen lagrer loggen i en fil hvis du vil gå gjennom en økt senere.'] },
        { id: 'odds', t: 'Odds (sannsynlighetsmonitor)',
          b: ['Fanen Odds viser for din nåværende hånd den løpende sannsynligheten for å ende med hver av de 10 håndkategoriene — fra High Card til Royal Flush — hver med ikon, prosent og linje. Visningen nedtones så snart du folder. Den bruker bare dine egne kort og felleskortene: den ser ingenting som motstanderne dine ikke viser.'] },
        { id: 'journal', t: 'Håndlogger og vinduet \u201cLogger\u201d',
          b: ['I tillegg til den løpende loggen tas hver hånd du spiller opp lokalt i nettleseren din, i samme format som den offisielle klientens .pdb-loggfiler. Vinduet Logger (Avanserte innstillinger \u2192 Loggmeldinger \u2192 Administrer logger\u2026) viser øktene dine og lar deg jobbe med dem: forhåndsvise en økt med søk og utheving, filtrere etter spill, eksportere som HTML eller ren tekst, lagre den rå .pdb-filen eller importere en .pdb tatt opp av skrivebordsklienten. Økter slettes én og én eller alle på en gang (med bekreftelse), og en automatisk oppbevaring kan beholde bare de siste 7, 30, 90, 180 eller 365 dagene. Logger du selv importerer, slettes aldri automatisk.',
              'Knappen Analyser kjører en håndanalyse på en økt og kan sende en logg til pokerth.nets analysetjeneste. Alt blir på enheten din til du eksporterer eller sender uttrykkelig.'] },
        { id: 'logopts', t: 'Logginnstillinger',
          b: ['I Avanserte innstillinger \u2192 Loggmeldinger kan du slå opptak av eller på og velge skriveintervallet (etter hver handling, eller én gang per hånd), som i skrivebordsklientens innstillinger. En ekstra innstilling skriver .pdb-filen direkte til en mappe du velger, og oppdaterer den etter hver hånd — nøyaktig som skrivebordsklienten gjør, slik at andre verktøy kan lese den direkte.'],
          note: 'Å skrive til en lokal mappe krever File System Access-API-et: bare Chrome og Edge på datamaskin. Firefox, Safari og mobilnettlesere kan ikke — innstillingen viser da en kort forklaring, og manuell eksport fra Logger-vinduet er fortsatt tilgjengelig overalt.' },
        { id: 'assist', t: 'Assistanse (håndstyrke)',
          b: ['Øverst på fanen Odds leser assistansebanneret hånden din for deg. Før floppen navngir det starthånden din og vurderer den med stjerner; fra floppen viser det din nåværende beste kombinasjon og, etter en rask simulering, din anslåtte sjanse for å vinne hånden i prosent, med en fargeindikator fra rød (svak) til grønn (sterk). Som sannsynlighetsmonitoren bruker den bare informasjon du kan se.',
              'To visningsstiler finnes i Avanserte innstillinger \u2192 Plasser: Segmenter (ti blokker) eller en klassisk fremdriftslinje. Hele assistansefunksjonen kan slås av i Avanserte innstillinger \u2192 Assistanse.'] },
        { id: 'assistwin', t: 'Assistansen som svevende widget',
          b: ['Assistanseblokken kan løsnes fra panelet til sitt eget lille vindu som alltid ligger øverst: bruk løsne-knappen på blokken, og flytt og skaler den hvor du vil over bordet — praktisk for å følge med på håndstyrken uten hele panelet åpent. Dokk-knappen setter den tilbake i fanen Odds, og posisjonen huskes. Inne i panelet lar et drahåndtak mellom Assistanse og oddsene deg fordele plassen mellom de to.'] },
        { id: 'stats', t: 'Statistikk',
          b: ['Fanen Statistikk følger økten din: spilte hender, sette flopper, showdowns, seiersprosenter og mer. Statistikksporingen kan slås av i Avanserte innstillinger.'] },
        { id: 'hud', t: 'Statistikk-HUD ved plassene (beta)',
          b: ['HUD-en fester en liten statistikkboks ved hver spillers plass, bygget av hendene du har tatt opp i loggene dine: antall observerte hender, deretter VPIP (hvor ofte vedkommende frivillig legger penger pre-flop), PFR (pre-flop-høyninger), AF (aggresjonsfaktor), 3B (3-bet), CB (continuation bet) og F3B (fold mot 3-bet), med fargekoder fra passiv til aggressiv. Trykk på en boks for en detaljert popover med flere tall (steal-forsøk, fold mot steal, showdown-andeler\u2026), og dra den hvis den dekker noe.',
              'HUD-en kjenner bare det du har sett ved dine egne bord — den leser dine lokale håndlogger, så opptaket må være på, og tallene gir først mening etter nok hender. Det er en betafunksjon, av som standard: slå den på i Avanserte innstillinger \u2192 Assistanse.'] },
        { id: 'handsbtn', t: 'Oversikt over kombinasjonene',
          b: ['Pokerhånd-ikonet på duken åpner når som helst en rask oversikt over de 10 kombinasjonene — praktisk mens du lærer. Kan skjules i Avanserte innstillinger.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat og sosialt',
      sections: [
        { id: 'panels', t: 'Lobbychat og bordchat',
          b: ['Det er en chat i lobbyen og en ved bordet. På telefonen svever bordchatten over spillet; på større skjermer er det et flyttbart vindu som kan endre størrelse. Et merke på chatknappen teller uleste meldinger.'] },
        { id: 'typing', t: 'Skrivehjelp',
          list: [
            'Tab fullfører et kallenavn — trykk Tab igjen for å bla gjennom treffene.',
            '\u2191 / \u2193 blar i din egen meldingshistorikk.',
            'Emoji-knappen åpner en komplett velger; å skrive : foreslår også emotes mens du taster.'] },
        { id: 'emotes', t: 'Emotes og smilefjes',
          b: ['Chatten konverterer emote-koder nøyaktig som den offisielle skrivebordsklienten: skriv et navn mellom to kolon, og det blir til emojien — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 mer enn 1 900 koder støttes (hele GitHub-settet). Klassiske tekstsmilefjes konverteres også: :-) ;) :D xD :P <3 og rundt åtti andre.',
              'Å skrive : åpner en forslagsboks som fullfører koden mens du taster (\u2191/\u2193 for å velge, Tab eller Enter for å godta). Emoji-konverteringen kan slås helt av i Avanserte innstillinger \u2192 Chat.'] },
        { id: 'commands', t: 'Chatkommandoer',
          b: ['Chatten forstår skråstrekkommandoer. To er synlige for andre:'],
          keys: [
            ['/me <tekst>', 'Handlingsmelding, vises som \u201c* kallenavnetditt tekst\u201d'],
            ['/emoji <emoji>', 'Spiller av en emoji-reaksjon (det samme som reaksjonsvelgeren sender)']] },
        { id: 'diagcmds', t: 'Diagnosekommandoer',
          b: ['Alt annet er lokalt: bare du ser svarene, og ingenting sendes til bordet. Skriv /help for å liste alle. De mest nyttige:'],
          keys: [
            ['/help', 'List alle kommandoer'],
            ['/update', 'Sjekk etter ny versjon og oppdater'],
            ['/lang <kode>', 'Bytt språk (f.eks. /lang nb)'],
            ['/sound on|off', 'Slå spillydene på/av'],
            ['/zoom', 'Slå bordlupen av/på'],
            ['/clear', 'Tøm chatten lokalt'],
            ['/table', 'Info om gjeldende spill (blinds, spillere, stakker)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostikk av klientstatus, nettverk og flyt'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Avansert feilsøking (kort, protokoll, lyd, lagring, plasser)'],
            ['/copy', 'Kopier det siste kommandosvaret til utklippstavlen']] },
        { id: 'reactions', t: 'Emoji-reaksjoner',
          b: ['Reaksjonsknappen åpner en velger med 30 animerte reaksjoner (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) som spilles av med en effekt over plassen din, synlige for hele bordet — også spillere på skrivebordsklienten. Reaksjoner kan slås helt av i Avanserte innstillinger.'] },
        { id: 'translate', t: 'Forstå alle',
          b: ['Med chatoversettelse på får hver melding en oversettelsesknapp som viser den på ditt språk via nettleserens oversetter. Vanlige bordforkortelser (gg, nh, utg\u2026) forklares i et verktøytips når du peker på dem — begge innstillingene finnes i Avanserte innstillinger \u2192 Chat.'],
          note: 'Oversettelsen bruker Google Translate-tjenesten og fungerer i alle nettlesere — det trengs bare internettforbindelse. En melding sendes bare til oversettelsestjenesten når du trykker på oversettelsesknappen dens, aldri automatisk.' },
        { id: 'social', t: 'Spillere: profil, inviter, ignorer',
          b: ['Trykk på en hvilken som helst spiller — ved bordet eller på lobbylisten — for å åpne kortet deres: profil og statistikk, inviter til spillet ditt, eller ignorer (chatmeldingene deres skjules; ignorering kan alltid angres). En bekreftelse før inviter/ignorer kan slås på i innstillingene.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby og spill',
      sections: [
        { id: 'list', t: 'Spillisten',
          b: ['Lobbyen viser alle serverens bord. Hver oppføring viser antall spillere, spilltype, en hengelås når passord eller invitasjon kreves, og et statusmerke: \u201cVenter\u201d (grønt — spillet har ikke startet, du kan bli med hvis det er en ledig plass), \u201cPågår\u201d (varm farge — kan ses direkte når tilskuere er tillatt) og \u201cLukket\u201d (nedtonet). Et fullt bord kjennes rett og slett på den fulle telleren, som 10/10; merkefargene følger det aktive temaet.',
              'Filternedtrekket snevrer inn listen nøyaktig som skrivebordsklienten, der hvert valg er strengere enn det forrige: bare åpne spill \u2192 skjul også fulle bord \u2192 deretter bare ikke-private, bare private eller bare rangerte spill. Valget ditt huskes. Søkefeltet finner et spill etter navn, og spillermerket åpner listen over alle pålogget, søkbar og sorterbar.'] },
        { id: 'join', t: 'Bli med og se på',
          b: ['Velg et åpent spill og bli med — en hengelås betyr at passord kreves. Pågående spill som tillater tilskuere, kan ses direkte: du ser bordet og chatten, men de lukkede kortene forblir skjult, og du kan ikke handle.'] },
        { id: 'gameinfo', t: 'Spillinfo',
          b: ['Før du blir med, viser spillinfokortet alt som definerer bordet: spilltype, blinds og deres utvikling (dobling eller manuell liste), startstakk, handlingstid, pause mellom hendene, og hvem som allerede sitter.'] },
        { id: 'create', t: 'Opprett et spill',
          b: ['Opprett ditt eget bord: navn, antall spillere, startstakk, første small blind og høyningsplan, handlingstid, og om tilskuere er tillatt. Det finnes fire spilltyper: Normal (alle), bare registrerte spillere, bare på invitasjon, og Rangert (teller til den offisielle rangeringen — ikke noe passord mulig i det tilfellet). Favorittinnstillingene dine kan lagres og lastes inn igjen.'] },
        { id: 'invites', t: 'Invitasjoner',
          b: ['Spillere kan invitere deg til bordet sitt; du får et varsel du kan godta eller avslå. Å bli invitert er den eneste måten å komme inn i et spill bare på invitasjon.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Kontoen din',
          b: ['Den offisielle internettserveren er pokerth.net. Å spille der krever en gratis pokerth.net-konto — registrer deg på nettstedet, og logg deretter inn her med samme kallenavn og passord. Denne webklienten kobler til nøyaktig samme server som skrivebordsklienten: samme kontoer, samme bord, samme rangeringer, og du kan sitte ved et bord med spillere fra skrivebordsklienten.'] },
        { id: 'ranked', t: 'Rangerte spill og sesonger',
          b: ['Spill av typen Rangert teller til den offisielle sesongrangeringen. Profilen din i appen viser registreringsdatoen din, din Rank i inneværende sesong, din Score, ditt snitt og dine spilte spill, samt de siste resultatene dine. Normale (ikke-rangerte) spill er bare for moro og endrer ingenting.'] },
        { id: 'rankhow', t: 'Slik regnes rangeringen ut',
          b: ['I hvert rangerte spill gir plasseringen din poeng: 15 for førsteplassen, så 9, 6, 4, 3, 2 og 1 ned til sjuende; fra åttende til tiende gis det ingenting. Et bord deler altså ut 40 poeng til sammen.',
              'Scoren din er ikke summen av disse poengene, men gjennomsnittet ditt per spill, dempet av en faktor som vokser med antallet spilte spill: noen få gode resultater holder ikke til å slå seg ned på toppen, det kreves også jevnhet — jo mer du spiller, desto nærmere kommer Scoren ditt virkelige gjennomsnitt. En sesong varer et kvartal: ved overgangen arkiveres alt og tellerne starter på null igjen, mens tidligere sesonger fortsatt kan ses. I spillet viser pallknappen sesongrangeringen til spillerne ved bordet ditt.'],
          note: 'Poengskalaen og den nøyaktige formelen fastsettes av rangeringsserveren til pokerth.net og kan endres; sidene på nettstedet er det som gjelder.' },
        { id: 'rankings', t: 'Rangeringssider',
          b: ['Rangeringsoppføringen åpner den offisielle PokerTH-rangeringen, søkbar etter spiller, samt fellesskapsrangeringene (BBC, WEC). Hvis rangeringer ikke interesserer deg, kan oppføringen skjules i Avanserte innstillinger \u2192 Fellesskap.'] },
        { id: 'cups', t: 'Fellesskapets cuper: BBC og WeCup',
          b: ['To fellesskap arrangerer sine egne konkurranser på pokerth.net, hvert med eget nettsted og egen rangering. Best Brainies Cup (BBC) er en trinnturnering fra 2013: man jobber seg fra Step 1 til Step 4, og en ny sesong starter etter hvert Step 4-spill, når pokalen deles ut. WeCup (WEC) har sin egen, langt mer spredte skala — 75 poeng for førsteplassen, så 45, 30, 20… — og scoren normaliserer gjennomsnittet ditt ut fra hvor mange spill du har spilt sammenlignet med de andre medlemmene.',
              'Begge rangeringene åpnes fra pokalknappen, ved siden av PokerTH-rangeringen. Bordinnstillingene til disse konkurransene følger med som forhåndsinnstillinger når du oppretter et spill (BBC Step 1 til 4, WEC, WEC Monthly Final og WEC Grand Final), så du kan øve under de samme forholdene. Deltakelse krever påmelding på nettstedet til den aktuelle cupen.'],
          note: 'Interesserer cuper deg ikke, skjuler du hele innholdet på én gang i Avanserte innstillinger → Fellesskap.' },
        { id: 'forumcups', t: 'Forumcuper og arrangementer',
          b: ['Forumet til pokerth.net huser også Monthly Cup, en månedlig serie der spillerne fordeles på Gold-, Silver- og Bronze-bord før månedens mester kåres, i tillegg til enkeltstående spesialcuper gjennom året.',
              'Påmeldinger, tidspunkter, bordinnstillinger og resultater publiseres på forumet, og spillene går på den offisielle serveren som alle andre. En pokerth.net-konto er nok til å følge resultatene; påmelding til en cup går via den tilhørende forumtråden.'] },
        { id: 'avatars', t: 'Avatarer og flagg',
          b: ['På pokerth.net distribueres avataren din til andre spillere via avatarserveren, og et lite landflagg kan vises på spillerboksene. Begge deler er valgfrie og kan stilles inn i innstillingene.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Treningsmodus',
      sections: [
        { id: 'what', t: 'Hva det er',
          b: ['Modusen Lokalt / trening er et komplett spill mot datamaskinstyrte motstandere: ingen tilkobling, ingen konto, ingenting på spill. Når appen er installert (eller bare besøkt én gang), fungerer den helt offline — perfekt for å lære spillet, prøve grensesnittet eller fordrive tiden i flymodus.'] },
        { id: 'setup', t: 'Sett opp et spill',
          b: ['Velg antall motstandere, startstakk, blinds og deres utvikling samt spillhastighet. Bottenes sammensetning og vanskelighetsgrad justeres i Avanserte innstillinger \u2192 Lokalt spill — fra milde motstandere til et hardere og mer variert bord.'] },
        { id: 'trophies', t: 'Trofeer',
          b: ['Treningsmodusen har sin egen progresjon: 28 trofeer fordelt på seks kategorier (progresjon, teknikk, stil, formater, moro og en hemmelig) låses opp ved å spille — spilte hender, vunne partier, store bløffer, spesielle hender og mer. Trofeprogresjonen din er kumulativ og flettes mellom enheter når kontoens innstillingssynkronisering er aktiv.'] },
        { id: 'learn', t: 'Et godt sted å lære',
          b: ['Alt som er beskrevet i de andre kapitlene, fungerer også her: sannsynlighetsmonitoren, assistansevisningen, forhåndsvalget, hurtigtastene. Treningsmodusen er det beste stedet å prøve dem uten press før du kaster deg ut på pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stil og lyd',
      sections: [
        { id: 'themes', t: 'Temaer',
          b: ['Kategorien Stil i Avanserte innstillinger kler opp hele klienten. Forhåndsinnstillinger setter opp alt med ett trykk (det klassiske grønne kasinoet, det offisielle PokerTH-utseendet\u2026); nedenfor finjusterer individuelle akser hver for seg fargepaletten, bordduken og kortenes forsider — endre en hvilken som helst akse, og blandingen din blir et eget tema. Mørk, lys eller automatisk modus velges under Brukergrensesnitt, og valgene dine gjelder umiddelbart, på alle skjermer, og huskes.'] },
        { id: 'tablelook', t: 'Bord, kortstokker, plasser',
          b: ['I tillegg til temaet kan flere elementer byttes uavhengig: bordbakgrunnen, kortstokken, kortryggen (matcher kortstokken automatisk, eller importer ditt eget bilde), dealer- og blindsjetongene, handlingsknappenes stil samt komplette plasspakker som kler om spillerboksene. Velg alt i Avanserte innstillinger \u2192 Stil; endringene vises straks ved bordet.'] },
        { id: 'music', t: 'Musikkspiller',
          b: ['Musikkoppføringen i toppfeltmenyene åpner en liten bakgrunnsmusikkspiller: velg et spor fra spillelisten, spill/pause, forrige/neste, tilfeldig, og gjentakelse av ett spor, hele listen eller ingenting. Volum, valgt spor og gjentakelsesmodus huskes. Avspillingen starter aldri av seg selv — nettlesere krever et trykk — og spilleren er helt uavhengig av spillets lydeffekter.'] },
        { id: 'sounds', t: 'Lydeffekter',
          b: ['Spillydene er samlet i fire kategorier som kan slås på hver for seg, nøyaktig som i skrivebordsklienten: spillhandlinger (utdelte kort, Check, Call, Raise, din tur\u2026), lobbychat-varsel, nettverksspillvarsler (spiller tilkoblet, spill klart) og varsel om blindhøyning. Én volumglidebryter styrer dem alle, i Avanserte innstillinger \u2192 Lyd.'],
          note: 'Alle nettlesere — spesielt iOS — nekter å spille av lyd før du har berørt siden én gang. Hvis et spill starter i stillhet, vekker et enkelt trykk hvor som helst lyden; klienten reparerer også lydmotoren automatisk når iOS suspenderer den (innkommende anrop, bakgrunn\u2026).' },
        { id: 'voice', t: 'Stemme og vibrasjon',
          b: ['To ekstra kanaler kan holde deg orientert uten å se på skjermen: stemmeannonseringer leser spillhendelser høyt via enhetens talesyntese, og på telefonen kan en kort vibrasjon markere turen din. Begge er webutvidelser, som standard på eller av avhengig av enheten, i Avanserte innstillinger \u2192 Innsatser og tur.'],
          note: 'Vibrasjon fungerer på Android (Chromium-nettlesere); Apple tilbyr ikke et vibrasjons-API til nettsteder, så iPhoner kan ikke vibrere. Stemmeannonseringer fungerer overalt, men tilgjengelige stemmer og språk avhenger av systemet ditt — klienten bruker den beste matchen den finner.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Innstillinger og snarveier',
      sections: [
        { id: 'where', t: 'Hvor innstillingene bor',
          b: ['Avanserte innstillinger åpnes fra tannhjuloppføringen i enhver toppfeltmeny. De er gruppert som i skrivebordsklienten: Brukergrensesnitt, Stil, Lyd, Lokalt spill, Nettverksspill, Internettspill, Kallenavn / Avatarer, Loggmeldinger og Gjenopprett standarder. Hver webspesifikke funksjon har sin egen bryter der, så du kan slå av alt du ikke bruker.'] },
        { id: 'cfgxml', t: 'Utveksle innstillinger med skrivebordsklienten',
          b: ['Innstillingene dine kan reise mellom klienter: kategorien Loggmeldinger tilbyr eksport/import av den offisielle config.xml-filen (den \u007e/.pokerth/config.xml som skrivebords- og QML-klientene bruker). Eksporten skriver de delte innstillingene — navn, visningsvalg, lyder, bordpreferanser, blinds, stiler — og importen bruker en fil fra datamaskinen her. Innstillinger denne klienten ikke kjenner, bevares urørt i filen.'] },
        { id: 'sync', t: 'Innstillinger som følger deg',
          b: ['Når du spiller med en konto, synkroniseres innstillingene, temaet, tastebindingene, språket og treningstrofeene dine: endre noe på én enhet, og den neste enheten du logger inn fra, plukker det opp. Trofeprogresjonen flettes, aldri overskrives, så spilling på to enheter beholder alltid det beste fra begge.'] },
        { id: 'updates', t: 'Hold deg oppdatert',
          b: ['Klienten oppdaterer seg selv: når en ny versjon rulles ut, inviterer et banner deg til å laste inn på nytt (eller skriv /update i chatten for å sjekke manuelt). Fra tid til annen kan en liten produktundersøkelse dukke opp og spørre om din mening om en funksjon — deltakelse er valgfritt, og undersøkelser kan slås helt av i Avanserte innstillinger \u2192 Fellesskap.'] },
        { id: 'fkeys', t: 'Offisielle hurtigtaster',
          b: ['PokerTHs offisielle funksjonstaster fungerer under et spill:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (rekkefølgen kan snus i innstillingene)'],
            ['F5', 'Vis kortene dine (når det er mulig)'],
            ['F6 / F7 / F8', 'Manuell \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manuell \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Logg \u00b7 Oddspanel'],
            ['F11', 'Full skjerm']],
          note: 'Snarveiene krever et fysisk tastatur. På Mac styrer F-tastene medier som standard: hold Fn nede (eller slå på \u201cBruk F1-, F2-taster osv. som standard funksjonstaster\u201d i macOS-innstillingene). På iPhone er full skjerm begrenset av iOS — å installere appen som PWA gir den samme fullskjermsopplevelsen.' },
        { id: 'webkeys', t: 'Webbokstavtaster',
          b: ['Webutvidelse: enkeltbokstavtaster utløser også handlingene og kan tilordnes på nytt i Avanserte innstillinger \u2192 Hurtigtaster:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Esc', 'Lukk det forreste vinduet (også Androids Tilbake-knapp)']],
          note: 'På Android lukker systemets Tilbake-knapp/-bevegelse vinduer som Esc i stedet for å forlate spillet (kan stilles inn). iOS har ingen tilsvarende systemknapp — bruk \u2715 i hvert vindu.' }
      ]
    }
  ]
};
