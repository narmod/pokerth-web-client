// ── help/content/sv.mjs — Svensk hjälpkorpus (4:e omgången) ─────────────────
// Översättning av en.mjs (referens). Struktur och id:n identiska; endast
// t / b / list / keys (etiketter) / note är översatta. Pokertermer
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) förblir på
// engelska enligt appens konvention.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Kom igång',
      sections: [
        { id: 'modes', t: 'Tre sätt att spela',
          b: ['Välj på inloggningsskärmen hur du vill spela.'],
          list: [
            'Internet — spela online på den officiella pokerth.net-servern, med rankningar. Ett pokerth.net-konto krävs; registrering på pokerth.net är gratis.',
            'Lokalt / träning — spela offline mot bottar. Inget att ställa in, fungerar utan uppkoppling och låser upp troféer allteftersom du gör framsteg.',
            'LAN / dedikerad server — anslut till en privat PokerTH-server på ditt lokala nätverk eller din egen dator.'] },
        { id: 'lan', t: 'LAN / dedikerad server',
          b: ['Det tredje läget ansluter till vilken PokerTH-server som helst som du eller en vän kör — på ett hemnätverk, en privat VPS, var som helst. Ange serverns adress och port, bocka i TLS om servern använder en krypterad port, och logga in med ett smeknamn (gästinloggning fungerar om servern tillåter det). Vid bordet beter sig sedan allt exakt som på den officiella servern.'] },
        { id: 'famboard', t: 'Familjeranking',
          b: ['Endast på privata servrar och i LAN-spel sparar klienten samlad statistik per smeknamn — spelade och vunna händer och partier, största vinst, bästa svit — och delar den via servern, så att varje enhet runt bordet ser samma ranking. pokerth.net-spel spåras aldrig på det här sättet, och träningslägets statistik hålls helt åtskild.'] },
        { id: 'language', t: 'Språk',
          b: ['Gränssnittet finns på 45 språk. Byt när som helst i Avancerade inställningar (kugghjulsmenyn), kategorin Användargränssnitt. Pokerns handlingstermer (Fold, Check, Call, Bet, Raise, All-In) förblir på engelska enligt konventionen, precis som i skrivbordsklienten.'] },
        { id: 'pwa', t: 'Installera som app',
          b: ['Den här klienten är en Progressive Web App: du kan installera den från webbläsarens meny (eller installationsknappen i sidhuvudet) och få en helskärmsapp med egen ikon. När den är installerad startar den direkt, och träningsläget fungerar helt offline.'],
          note: 'På Android och i Chrome/Edge på dator sköter installationsknappen allt. På iPhone/iPad tillåter Apple installation endast via Safari: Dela-knappen \u2192 \u201dLägg till på hemskärmen\u201d — klienten visar dessa steg när det behövs. Knappen försvinner när appen är installerad.' },
        { id: 'platforms', t: 'Plattformar och webbläsare',
          b: ['Klienten körs i alla moderna webbläsare på alla system — Windows, macOS, Linux, Android, iOS. Några funktioner beror på nyare webbläsar-API:er; när ett API saknas döljer sig funktionen eller förklarar läget i stället för att gå sönder. De viktigaste skillnaderna att känna till:'],
          list: [
            'Chrome / Edge (dator): allt fungerar, inklusive att skriva .pdb-loggen till en mapp.',
            'Firefox: allt utom att skriva .pdb till en mapp (API:et ännu inte tillgängligt).',
            'Safari / iOS: installation via Dela \u2192 \u201dLägg till på hemskärmen\u201d; ingen vibration; helskärm begränsad på iPhone; ljudet startar efter din första tryckning.',
            'Android: fullt stöd i Chromium-webbläsare, inklusive vibration och Bakåt-knappens beteende.'] },
        { id: 'avatar', t: 'Smeknamn och avatar',
          b: ['Välj ditt smeknamn och din avatar på inloggningsskärmen innan du ansluter. På pokerth.net är ditt smeknamn ditt kontonamn; avatarer delas med andra spelare via avatarservern.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pokerregler',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em i ett nötskal',
          b: ['PokerTH spelas som No-Limit Texas Hold\u2019em. Varje spelare får två dolda kort (hole cards). Sedan läggs fem gemensamma kort med framsidan uppåt mitt på bordet. Den bästa handen på fem kort bildad av valfri kombination av dina två kort och de fem gemensamma vinner potten.'] },
        { id: 'blinds', t: 'Mörkarna och dealerknappen',
          b: ['Före varje hand fyller två tvingade insatser potten: small blind och big blind, som läggs av de två spelarna till vänster om dealerknappen. Knappen flyttas en plats medurs efter varje hand, så alla betalar mörkarna i tur och ordning. Mörkarna höjs med jämna mellanrum under partiet.',
              'På bordet är knappen och mörkarna markerade med marker: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'De fyra satsningsrundorna',
          list: [
            'Pre-flop — efter att de dolda korten delats ut börjar den första satsningsrundan till vänster om big blind.',
            'Flop — tre gemensamma kort avslöjas, följt av en satsningsrunda.',
            'Turn — ett fjärde gemensamt kort, sedan ännu en satsningsrunda.',
            'River — det femte och sista gemensamma kortet, sedan den sista satsningsrundan.'],
          b: ['En satsningsrunda avslutas när varje spelare som är kvar i handen har lagt samma belopp i potten (eller är all-in).'] },
        { id: 'actions', t: 'Vad du kan göra när det är din tur',
          list: [
            'Fold — ge upp handen. Dina kort försvinner och du spelar inte längre om potten.',
            'Check — gå vidare utan att satsa. Endast möjligt när det inte finns något att betala.',
            'Call — syna den pågående insatsen.',
            'Bet — öppna satsningen när ingen ännu satsat på denna street.',
            'Raise — höja ovanpå en befintlig insats. Minsta höjning motsvarar föregående insats eller höjning.',
            'All-In — satsa hela din stack. Du är kvar i handen upp till det belopp du täckt.'] },
        { id: 'showdown', t: 'Showdown och delade potter',
          b: ['Om flera spelare är kvar efter satsningsrundan på river visas händerna och den bästa vinner — den vinnande kombinationen visas under de gemensamma korten. När en spelare är all-in för mindre än de fulla insatserna uppstår sidopotter: varje spelare kan bara vinna den del av potten som hen bidragit till. Lika händer delar potten.',
            'Alla behöver inte visa: från den sista spelaren som satsade eller höjde vänds en hand bara upp om den slår det som redan ligger öppet. Den som får mucka behåller korten dolda och får en Show-knapp för att ändå visa dem.'] },
        { id: 'hands', t: 'Händernas rangordning',
          b: ['Från svagast till starkast:'],
          list: [
            '1. High Card — ingen kombination; det högsta kortet avgör.',
            '2. Pair — två kort av samma valör.',
            '3. Two Pair — två olika par.',
            '4. Three of a Kind — tre kort av samma valör.',
            '5. Straight — fem kort i följd (esset räknas högt eller lågt).',
            '6. Flush — fem kort i samma färg.',
            '7. Full House — triss plus ett par.',
            '8. Four of a Kind — fyra kort av samma valör.',
            '9. Straight Flush — en stege, helt i en färg.',
            '10. Royal Flush — från tio till ess i en färg. Den bästa möjliga handen.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Spelskärmen',
      sections: [
        { id: 'actionbar', t: 'Handlingsraden',
          b: ['När det är din tur tänds handlingsraden längst ner med upp till fyra knappar: Fold (röd), Check / Call (blå), Bet / Raise (grön — huvudhandlingen, framhävd) och All-In (mörkröd). Check / Call-knappen visar det exakta beloppet att syna; Bet / Raise visar beloppet du är på väg att lägga. Efter river kan All-In bli en Show-knapp för att visa dina kort.'] },
        { id: 'betctl', t: 'Välj din insats',
          b: ['Justera höjningsbeloppet med sifferfältet, reglaget eller snabbknapparna 1/3 \u00b7 1/2 \u00b7 Pot (andelar av den aktuella potten). Beloppen avrundas automatiskt och hålls mellan minsta och största tillåtna höjning. Om du hellre tänker i big blinds kan en inställning visa alla belopp i BB i stället för marker.'] },
        { id: 'preselect', t: 'Förvälj en handling',
          b: ['Före din tur kan du ladda en handling i förväg: tryck på en knapp så får den en gyllene kant med en liten gyllene prick. När din tur kommer utförs handlingen direkt. En laddad Fold blir automatiskt Check när check är gratis — du lägger dig aldrig i onödan. Förval nollställs vid varje ny hand, varje streetbyte och showdown, och avbryts om situationen ändras (till exempel om beloppet att syna ändras).'] },
        { id: 'automodes', t: 'Automatiska lägen',
          b: ['Rullgardinsmenyn bredvid handlingsknapparna erbjuder tre spellägen: Manuellt, Auto Check/Call och Auto Check/Fold. Autolägena spelar åt dig tills du byter tillbaka — varje manuellt klick på en handling återgår genast till Manuellt.'] },
        { id: 'readtable', t: 'Läs bordet',
          b: ['Varje spelarruta visar avatar, namn, stack och pågående insats. Dealern och mörkarna är markerade med D-/SB-/BB-marker. Ett färgat märke på rutan visar spelarens senaste handling; en tunn blå stapel räknar ner hens betänketid. Rutan för spelaren i tur lyser upp; din egen ruta får en pulserande gyllene ram när det är din tur.',
              'Statusraden ovanför bordet visar den totala potten, insatserna på den aktuella streeten, fasen (Pre-flop, Flop, Turn, River) samt spel- och handnummer. Spelare som lagt sig har genomskinliga kort; utslagna spelare är nedtonade. I slutet av en hand kan ett vinnarfönster sammanfatta vem som vann vad — kan stängas av i inställningarna.'] },
        { id: 'seatlayout', t: 'Platsernas placering',
          b: ['Som webbutökning väljs spelarrutornas layout i Avancerade inställningar \u2192 Platser: Automatisk följer den officiella klienten (fasta positioner på höjden, beräknad ellips på bredden), eller tvinga Stående eller Liggande layout — och Anpassad låter dig placera varje plats själv: ett redigeringsläge dyker upp där du drar varje ruta exakt dit du vill, och layouten sparas.'] },
        { id: 'zoom', t: 'Bordszoom (telefoner)',
          b: ['På små skärmar förstorar luppknapparna bordet (2\u00d7) och du kan dra det med fingret — din egen ruta och handlingsraden står stilla. Vyn följer automatiskt den aktiva platsen och zoomar ut vid showdown för överblicken. Kan stängas av i Avancerade inställningar.'],
          note: 'På telefoner och surfplattor är webbläsarens egen nypzoom blockerad som standard, så att en zoomgest aldrig utlöses av misstag mitt i en hand; slå på den igen i Avancerade inställningar \u2192 Användargränssnitt om du föredrar det.' },
        { id: 'protections', t: 'Tjuvkiksskydd och skydd mot oavsiktlig Call',
          b: ['Två valfria skydd: tjuvkiksskyddet håller dina egna kort dolda tills du rör dem (användbart när någon kan se din skärm), och skyddet mot oavsiktlig Call låser Call-knappen ett kort ögonblick direkt efter en stor höjning, så att en tryckning avsedd för en mindre Call inte råkar träffa det höjda beloppet. Båda finns i Avancerade inställningar.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Infopanelen',
      sections: [
        { id: 'open', t: 'Öppna panelen',
          b: ['Under ett spel öppnas infopanelen från sidhuvudet (eller Alt+L / Alt+I) och har tre flikar: Logg, Odds och Statistik. På telefonen svävar den över bordet; på större skärmar är det ett flyttbart fönster som kan storleksändras — greppa \u28ff-handtaget för att flytta det, kanterna för att ändra storleken. Positionen kommer ihåg.'] },
        { id: 'log', t: 'Spellogg',
          b: ['Fliken Logg registrerar hela partiet hand för hand: mörkar, varje handling med belopp, visade kort och vinnare, allt i färg för snabb läsning. Exportknappen sparar loggen i en fil om du vill gå igenom en session senare.'] },
        { id: 'odds', t: 'Odds (sannolikhetsmonitor)',
          b: ['Fliken Odds visar för din aktuella hand den löpande sannolikheten att sluta med var och en av de 10 handkategorierna — från High Card till Royal Flush — var och en med ikon, procent och stapel. Visningen tonas ner så fort du lägger dig. Den använder bara dina egna kort och de gemensamma korten: den ser inget som dina motståndare inte visar.'] },
        { id: 'journal', t: 'Handloggar och fönstret \u201dLoggar\u201d',
          b: ['Utöver den löpande loggen spelas varje hand du spelar in lokalt i din webbläsare, i samma format som den officiella klientens .pdb-loggfiler. Fönstret Loggar (Avancerade inställningar \u2192 Loggmeddelanden \u2192 Hantera loggar\u2026) listar dina sessioner och låter dig arbeta med dem: förhandsgranska en session med sökning och markering, filtrera per spel, exportera som HTML eller ren text, spara den råa .pdb-filen eller importera en .pdb inspelad av skrivbordsklienten. Sessioner raderas en och en eller alla på en gång (med bekräftelse), och en automatisk lagringstid kan behålla bara de senaste 7, 30, 90, 180 eller 365 dagarna. Loggar du själv importerar tas aldrig bort automatiskt. En andra inställning begränsar hur många sessioner som behålls, och listkolumnen kan dras bredare.',
              'Knappen Analysera kör en handanalys på en session och kan skicka en logg till pokerth.nets analystjänst. Allt stannar på din enhet tills du uttryckligen exporterar eller skickar.'] },
        { id: 'logopts', t: 'Logginställningar',
          b: ['Under Avancerade alternativ \u2192 Loggmeddelanden kan du slå på eller av loggningen och välja skrivintervall, med samma tre inställningar som skrivbordsklienten: efter varje handling, efter varje hand (standard) eller efter varje parti. Ett annat alternativ skriver .pdb-filen till en mapp du väljer och håller den aktuell med det intervallet, plus en sista gång när du lämnar sidan, så att ett annat verktyg kan följa partiet live.'],
          note: 'Att skriva till en lokal mapp kräver File System Access API: endast Chrome, Edge och Opera på skrivbordet. I övrigt förklarar sig alternativet självt och manuell export från loggfönstret finns kvar. En webbläsare kan bara ersätta en fil, aldrig lägga till i den, så ett verktyg som läser .pdb bör öppna den på nytt efter varje ändring.' },
        { id: 'assist', t: 'Assistans (handstyrka)',
          b: ['Överst på fliken Odds läser assistansbannern din hand åt dig. Före floppen namnger den din starthand och betygsätter den med stjärnor; från floppen visar den din nuvarande bästa kombination och, efter en snabb simulering, din uppskattade chans att vinna handen i procent, med en färgindikator från rött (svag) till grönt (stark). Precis som sannolikhetsmonitorn använder den bara information du kan se.',
              'Två visningsstilar finns i Avancerade inställningar \u2192 Platser: Segment (tio block) eller en klassisk förloppsindikator. Hela assistansfunktionen kan stängas av i Avancerade inställningar \u2192 Assistans.'] },
        { id: 'assistwin', t: 'Assistansen som svävande widget',
          b: ['Assistansblocket kan lossas från panelen till ett eget litet fönster som alltid ligger överst: använd lossningsknappen på blocket, flytta och skala det sedan var du vill över bordet — praktiskt för att hålla koll på handstyrkan utan hela panelen öppen. Dockningsknappen sätter tillbaka det i fliken Odds, och positionen kommer ihåg. Inuti panelen låter ett draghandtag mellan Assistans och oddsen dig fördela utrymmet mellan de två.'] },
        { id: 'stats', t: 'Statistik',
          b: ['Fliken Statistik följer din session: spelade händer, sedda floppar, showdowns, vinstprocent och mer. Statistikspårningen kan stängas av i Avancerade inställningar.'] },
        { id: 'hud', t: 'Statistik-HUD vid platserna (beta)',
          b: ['HUD:en fäster en liten statistikruta bredvid varje spelares plats, byggd av händerna du har registrerat i dina loggar: antal observerade händer, sedan VPIP (hur ofta han frivilligt lägger in pengar pre-flop), PFR (pre-flop-höjningar) och AF (aggressionsfaktor), färgkodat från passiv till aggressiv. Under dem sammanfattar en bricka spelaren i ord \u2014 Tight-Passiv, Lös-Aggressiv och så vidare \u2014 bredvid en liten urtavla där den tända kvadranten läses från vänster till höger som tight till lös, och nedifrån och upp som passiv till aggressiv. Brickan visas från allra första handen men förblir nedtonad till 25 händer, då den blir tillförlitlig. Tryck på en ruta för en detaljerad popover med alla siffror (3-bet, continuation bet, fold mot 3-bet, stöldförsök, showdown-frekvenser\u2026), och dra undan den om den täcker något.',
              'HUD:en känner bara till det du sett vid dina egna bord — den läser dina lokala handloggar, så inspelningen måste vara på och siffrorna blir meningsfulla först efter tillräckligt många händer. Det är en betafunktion, av som standard: slå på den i Avancerade inställningar \u2192 Assistans.'] },
        { id: 'handsbtn', t: 'Snabböversikt över kombinationerna',
          b: ['Pokerhandsikonen på duken öppnar när som helst en snabb översikt över de 10 kombinationerna — praktiskt medan du lär dig. Kan döljas i Avancerade inställningar.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chatt och socialt',
      sections: [
        { id: 'panels', t: 'Lobbychatt och bordschatt',
          b: ['Det finns en chatt i lobbyn och en vid bordet. På telefonen svävar bordschatten över spelet; på större skärmar är det ett flyttbart fönster som kan storleksändras. Ett märke på chattknappen räknar olästa meddelanden.'] },
        { id: 'typing', t: 'Skrivhjälp',
          list: [
            'Tab kompletterar ett smeknamn — tryck Tab igen för att bläddra bland träffarna.',
            '\u2191 / \u2193 bläddrar i din egen meddelandehistorik.',
            'Emojiknappen öppnar en komplett väljare; att skriva : föreslår också emotes medan du skriver.'] },
        { id: 'emotes', t: 'Emotes och smilisar',
          b: ['Chatten omvandlar emote-koder exakt som den officiella skrivbordsklienten: skriv ett namn mellan två kolon så blir det emojin — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 mer än 1 900 koder stöds (hela GitHub-uppsättningen). Klassiska textsmilisar omvandlas också: :-) ;) :D xD :P <3 och ett åttiotal andra.',
              'Att skriva : öppnar en förslagsruta som kompletterar koden medan du skriver (\u2191/\u2193 för att välja, Tab eller Enter för att godta). Emojiomvandlingen kan stängas av helt i Avancerade inställningar \u2192 Chatt.'] },
        { id: 'commands', t: 'Chattkommandon',
          b: ['Chatten förstår snedstreckskommandon. Två är synliga för andra:'],
          keys: [
            ['/me <text>', 'Handlingsmeddelande, visas som \u201d* dittsmeknamn text\u201d'],
            ['/emoji <emoji>', 'Spelar upp en emojireaktion (samma som reaktionsväljaren skickar)']] },
        { id: 'diagcmds', t: 'Diagnostikkommandon',
          b: ['Allt annat är lokalt: bara du ser svaren och inget skickas till bordet. Skriv /help för att lista alla. De mest användbara:'],
          keys: [
            ['/help', 'Lista alla kommandon'],
            ['/update', 'Sök efter ny version och uppdatera'],
            ['/lang <kod>', 'Byt språk (t.ex. /lang sv)'],
            ['/sound on|off', 'Slå på/stäng av spelljuden'],
            ['/zoom', 'Växla bordsluppen'],
            ['/clear', 'Rensa chatten lokalt'],
            ['/table', 'Info om det aktuella spelet (mörkar, spelare, stackar)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostik av klientstatus, nätverk och flyt'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Avancerad felsökning (kort, protokoll, ljud, lagring, platser)'],
            ['/copy', 'Kopiera det senaste kommandosvaret till urklipp']] },
        { id: 'reactions', t: 'Emojireaktioner',
          b: ['Reaktionsknappen öppnar en väljare med 30 animerade reaktioner (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) som spelas upp med en effekt över din plats, synliga för hela bordet — även spelare på skrivbordsklienten. Reaktioner kan stängas av helt i Avancerade inställningar.'] },
        { id: 'translate', t: 'Förstå alla',
          b: ['Med chattöversättning på visas en översättningsknapp på raden under pekaren — eller på raden du trycker på, på en peksskärm — och visar meddelandet på ditt språk med webbläsarens översättare. Den kan visas permanent på alla rader under Avancerade alternativ → Chatt, där också tipsrutan som förklarar vanliga bordsförkortningar (gg, nh, utg…) bor.'],
          note: 'Översättningen använder Google Translate-tjänsten och fungerar i alla webbläsare — det krävs bara internetanslutning. Ett meddelande skickas till översättningstjänsten först när du trycker på dess översättningsknapp, aldrig automatiskt.' },
        { id: 'social', t: 'Spelare: profil, bjud in, ignorera',
          b: ['Tryck på vilken spelare som helst — vid bordet eller i lobbylistan — för att öppna hens kort: profil och statistik, bjud in till ditt spel, eller ignorera (hens chattmeddelanden döljs; ignorering kan alltid ångras). En bekräftelse före bjud in/ignorera kan slås på i inställningarna.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby och spel',
      sections: [
        { id: 'list', t: 'Spellistan',
          b: ['Lobbyn listar alla serverns bord. Varje post visar antal spelare, speltyp, ett hänglås när lösenord eller inbjudan krävs, och ett statusmärke: \u201dVäntar\u201d (grönt — spelet har inte startat, du kan gå med om det finns en ledig plats), \u201dPågår\u201d (varm färg — kan ses live när åskådare tillåts) och \u201dStängt\u201d (nedtonat). Ett fullt bord känns helt enkelt igen på den fulla räknaren, som 10/10; märkenas färger följer det aktiva temat.',
              'Filterrullgardinen smalnar av listan exakt som skrivbordsklienten, där varje val är strängare än det föregående: bara öppna spel \u2192 dölj även fulla bord \u2192 sedan bara icke-privata, bara privata eller bara rankade spel. Ditt val kommer ihåg. Sökfältet hittar ett spel på namnet, och spelarmärket öppnar listan över alla online, sökbar och sorterbar.'] },
        { id: 'join', t: 'Gå med och titta på',
          b: ['Välj ett öppet spel och gå med — ett hänglås betyder att lösenord krävs. Pågående spel som tillåter åskådare kan ses live: du ser bordet och chatten, men de dolda korten förblir dolda och du kan inte agera.'] },
        { id: 'gameinfo', t: 'Spelinfo',
          b: ['Innan du går med visar spelinfokortet allt som definierar bordet: speltyp, mörkar och deras utveckling (dubblering eller manuell lista), startstack, handlingstid, paus mellan händerna, och vilka som redan sitter.'] },
        { id: 'create', t: 'Skapa ett spel',
          b: ['Skapa ditt eget bord: namn, antal spelare, startstack, första small blind och höjningsschema, handlingstid, och om åskådare tillåts. Det finns fyra speltyper: Normalt (alla), bara registrerade spelare, bara på inbjudan, och Rankat (räknas till den officiella rankingen — inget lösenord möjligt i det fallet). Dina favoritinställningar kan sparas och läsas in igen.'] },
        { id: 'invites', t: 'Inbjudningar',
          b: ['Spelare kan bjuda in dig till sitt bord; du får en avisering som du kan godta eller avböja. Att bli inbjuden är det enda sättet att komma in i ett spel bara på inbjudan.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Ditt konto',
          b: ['Den officiella internetservern är pokerth.net. Att spela där kräver ett gratis pokerth.net-konto — registrera dig på webbplatsen och logga sedan in här med samma smeknamn och lösenord. Den här webbklienten ansluter till exakt samma server som skrivbordsklienten: samma konton, samma bord, samma rankningar, och du kan sitta vid ett bord med spelare från skrivbordsklienten.'] },
        { id: 'ranked', t: 'Rankade spel och säsonger',
          b: ['Spel av typen Rankat räknas till den officiella säsongsrankingen. Din profil i appen visar ditt registreringsdatum, din Rank i den aktuella säsongen, din Score, ditt snitt och dina spelade spel, samt dina senaste resultat. Normala (orankade) spel är bara för skojs skull och ändrar ingenting.'] },
        { id: 'rankhow', t: 'Så räknas rankningen ut',
          b: ['I varje rankad match ger din placering poäng: 15 för första, sedan 9, 6, 4, 3, 2 och 1 ner till sjunde; från åttonde till tionde ges inget. Ett bord delar alltså ut 40 poäng totalt.',
              'Din Score är inte summan av de poängen, utan ditt snitt per match, dämpat av en faktor som växer med antalet spelade matcher: några få bra resultat räcker inte för att stanna i toppen, det krävs också jämnhet — ju mer du spelar, desto närmare kommer din Score ditt verkliga snitt. En säsong varar ett kvartal: vid bytet arkiveras allt och räknarna börjar om från noll, medan tidigare säsonger fortfarande går att se. I spelet visar pallknappen säsongsrankningen för spelarna vid ditt bord.'],
          note: 'Poängskalan och den exakta formeln bestäms av rankningsservern på pokerth.net och kan ändras; sidorna på webbplatsen är det som gäller.' },
        { id: 'rankings', t: 'Rankingsidor',
          b: ['Rankingposten öppnar den officiella PokerTH-rankingen, sökbar per spelare, samt gemenskapsrankingarna (BBC, WEC). Om rankningar inte intresserar dig kan posten döljas i Avancerade inställningar \u2192 Gemenskap.'] },
        { id: 'cups', t: 'Gemenskapens cuper: BBC och WeCup',
          b: ['Två gemenskaper håller sina egna tävlingar på pokerth.net, var och en med egen webbplats och egen rankning. Best Brainies Cup (BBC) är en stegturnering från 2013: man arbetar sig från Step 1 till Step 4, och en ny säsong börjar efter varje Step 4-match, när cupen delas ut. WeCup (WEC) har sin egen, betydligt bredare skala — 75 poäng för förstaplatsen, sedan 45, 30, 20… — och dess score normaliserar ditt snitt utifrån hur många matcher du spelat jämfört med övriga medlemmar.',
              'Båda rankningarna öppnas från pokalknappen, bredvid PokerTH-rankningen. Bordsinställningarna för dessa tävlingar finns med som förinställningar när du skapar en match (BBC Step 1 till 4, WEC, WEC Monthly Final och WEC Grand Final), så du kan träna under samma villkor. Att delta kräver registrering på den aktuella cupens webbplats.'],
          note: 'Om cuper inte intresserar dig döljer du hela innehållet på en gång i Avancerade inställningar → Gemenskap.' },
        { id: 'forumcups', t: 'Forumcuper och evenemang',
          b: ['pokerth.nets forum härbärgerar också Monthly Cup, en månatlig serie där spelarna fördelas på Gold-, Silver- och Bronze-bord innan månadens mästare koras, plus enstaka specialcuper under året.',
              'Anmälningar, tider, bordsinställningar och resultat publiceras på forumet, och matcherna spelas på den officiella servern som alla andra. Ett pokerth.net-konto räcker för att följa resultaten; att anmäla sig till en cup går via motsvarande forumtråd.'] },
        { id: 'forumnews', t: 'Forumnyheter i lobbyn',
          b: ['Tidningsknappen i lobbyns sidhuvud öppnar de senaste inläggen från pokerth.net-forumet, en rad per ämne, varje forum med sin egen färg. Märket på knappen räknar olästa inlägg; öppnas ett inlägg (ny flik) markeras det som läst, och “Markera allt som läst” rensar allt på en gång.',
              'Det är ett webbtillägg: knappen kan döljas i Avancerade alternativ (“Forumknapp i lobbyns sidhuvud”).'] },
        { id: 'avatars', t: 'Avatarer och flaggor',
          b: ['På pokerth.net distribueras din avatar till andra spelare via avatarservern, och en liten landsflagga kan visas på spelarrutorna. Båda är valfria och kan ställas in i inställningarna.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Träningsläge',
      sections: [
        { id: 'what', t: 'Vad det är',
          b: ['Läget Lokalt / träning är ett komplett spel mot datorstyrda motståndare: ingen uppkoppling, inget konto, inget på spel. När appen är installerad (eller bara besökt en gång) fungerar den helt offline — perfekt för att lära sig spelet, prova gränssnittet eller fördriva tiden i flygplansläge.'] },
        { id: 'setup', t: 'Ställ in ett spel',
          b: ['Välj antal motståndare, startstack, mörkar och deras utveckling samt spelhastighet. Bottarnas sammansättning och svårighetsgrad justeras i Avancerade inställningar \u2192 Lokalt spel — från milda motståndare till ett tuffare och mer varierat bord.'] },
        { id: 'trophies', t: 'Troféer',
          b: ['Träningsläget har sin egen progression: 28 troféer i sex kategorier (progression, teknik, stil, format, kul och en hemlig) låses upp genom att spela — spelade händer, vunna partier, stora bluffar, speciella händer och mer. Din troféprogression är kumulativ och slås samman mellan enheter när kontots inställningssynkronisering är aktiv.'] },
        { id: 'learn', t: 'En bra plats att lära sig på',
          b: ['Allt som beskrivs i de andra kapitlen fungerar även här: sannolikhetsmonitorn, assistansvisningen, förvalet, tangentbordsgenvägarna. Träningsläget är den bästa platsen att prova dem utan press innan du ger dig ut på pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stil och ljud',
      sections: [
        { id: 'themes', t: 'Teman',
          b: ['Kategorin Stil i Avancerade inställningar klär hela klienten. Förinställningar ställer in allt med en tryckning (det klassiska gröna kasinot, den officiella PokerTH-looken\u2026); nedanför finjusterar enskilda axlar var för sig färgpaletten, bordsduken och kortens framsidor — ändra vilken axel som helst så blir din blandning ett eget tema. Mörkt, ljust eller automatiskt läge väljs under Användargränssnitt, och dina val gäller direkt, på alla skärmar, och kommer ihåg.'] },
        { id: 'tablelook', t: 'Bord, kortlekar, platser',
          b: ['Utöver temat kan flera element bytas oberoende: bordsbakgrunden, kortleken, kortens baksida (matchar kortleken automatiskt, eller importera din egen bild), dealer- och mörkmarkerna, handlingsknapparnas stil samt kompletta platspaket som klär om spelarrutorna. Välj allt i Avancerade inställningar \u2192 Stil; ändringarna syns genast vid bordet.'] },
        { id: 'music', t: 'Musikspelare',
          b: ['Musikposten i sidhuvudsmenyerna öppnar en liten bakgrundsmusikspelare: välj ett spår från spellistan, spela/pausa, föregående/nästa, blanda, och upprepning av ett spår, hela listan eller inget. Volym, valt spår och upprepningsläge kommer ihåg. Uppspelningen startar aldrig av sig själv — webbläsare kräver en tryckning — och spelaren är helt oberoende av spelets ljudeffekter.'] },
        { id: 'sounds', t: 'Ljudeffekter',
          b: ['Spelljuden är grupperade i fyra kategorier som kan slås på var för sig, precis som i skrivbordsklienten: spelhandlingar (utdelade kort, Check, Call, Raise, din tur\u2026), lobbychattavisering, nätverksspelaviseringar (spelare ansluten, spel redo) och avisering om mörkhöjning. Ett enda volymreglage styr dem alla, i Avancerade inställningar \u2192 Ljud.'],
          note: 'Alla webbläsare — särskilt iOS — vägrar spela ljud innan du rört sidan en gång. Om ett spel startar i tystnad väcker en enda tryckning var som helst ljudet; klienten reparerar också ljudmotorn automatiskt när iOS pausar den (inkommande samtal, bakgrund\u2026).' },
        { id: 'voice', t: 'Röst och vibration',
          b: ['Två extra kanaler kan hålla dig informerad utan att titta på skärmen: röstmeddelanden läser upp spelhändelser via enhetens talsyntes, och på telefonen kan en kort vibration markera din tur. Båda är webbutökningar, som standard på eller av beroende på enheten, i Avancerade inställningar \u2192 Insatser och tur.'],
          note: 'Vibration fungerar på Android (Chromium-webbläsare); Apple erbjuder inget vibrations-API till webbplatser, så iPhones kan inte vibrera. Röstmeddelanden fungerar överallt, men tillgängliga röster och språk beror på ditt system — klienten använder den bästa matchning den hittar.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Inställningar och genvägar',
      sections: [
        { id: 'where', t: 'Var inställningarna bor',
          b: ['Avancerade inställningar öppnas från kugghjulsposten i valfri sidhuvudsmeny. De är grupperade som i skrivbordsklienten: Användargränssnitt, Stil, Ljud, Lokalt spel, Nätverksspel, Internetspel, Smeknamn / Avatarer, Loggmeddelanden och Återställ standard. Varje webbspecifik funktion har sin egen brytare där, så att du kan stänga av allt du inte använder.'] },
        { id: 'cfgxml', t: 'Utbyt inställningar med skrivbordsklienten',
          b: ['Dina inställningar kan resa mellan klienter: kategorin Loggmeddelanden erbjuder export/import av den officiella config.xml-filen (den \u007e/.pokerth/config.xml som skrivbords- och QML-klienterna använder). Exporten skriver de delade inställningarna — namn, visningsval, ljud, bordspreferenser, mörkar, stilar — och importen tillämpar en fil från datorn här. Inställningar som den här klienten inte känner till bevaras orörda i filen.'] },
        { id: 'sync', t: 'Inställningar som följer dig',
          b: ['När du spelar med ett konto synkroniseras dina inställningar, ditt tema, dina tangentbindningar, ditt språk och dina träningstroféer: ändra något på en enhet så plockar nästa enhet du loggar in från upp det. Troféprogressionen slås samman, skrivs aldrig över, så att spela på två enheter behåller alltid det bästa från båda.'] },
        { id: 'updates', t: 'Håll dig uppdaterad',
          b: ['Klienten uppdaterar sig själv: när en ny version rullas ut bjuder en banner in dig att ladda om (eller skriv /update i chatten för att kontrollera manuellt). Då och då kan en liten produktundersökning dyka upp och fråga om din åsikt om en funktion — deltagande är frivilligt och undersökningar kan stängas av helt i Avancerade inställningar \u2192 Gemenskap.'] },
        { id: 'fkeys', t: 'Officiella tangentbordsgenvägar',
          b: ['PokerTH:s officiella funktionstangenter fungerar under ett spel \u2014 Alt+S fungerar \u00f6verallt:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (ordningen kan vändas i inställningarna)'],
            ['F5', 'Visa dina kort (när det är möjligt)'],
            ['F6 / F7 / F8', 'Manuellt \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manuellt \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chatt \u00b7 Logg \u00b7 Oddspanel'],
            ['Alt+S', 'Inställningar — var som helst i appen, inte bara under ett spel'],
            ['F11', 'Helskärm']],
          note: 'Genvägarna kräver ett fysiskt tangentbord. På Mac styr F-tangenterna media som standard: håll ner Fn (eller slå på \u201dAnvänd F1-, F2-tangenter osv. som standardfunktionstangenter\u201d i macOS-inställningarna). På iPhone är helskärm begränsad av iOS — att installera appen som PWA ger samma helskärmsupplevelse.' },
        { id: 'webkeys', t: 'Webbokstavstangenter',
          b: ['Webbtillägg: enbokstavstangenter och Alt+T utlöser också handlingar, och alla kan bindas om i Avancerade alternativ → Kortkommandon:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Statistikpanel'],
            ['Esc', 'Stäng det främsta fönstret (även Androids Bakåt-knapp)']],
          note: 'På Android stänger systemets Bakåt-knapp/gest fönster som Esc i stället för att lämna spelet (kan ställas in). iOS har ingen motsvarande systemknapp — använd \u2715 i varje fönster.' }
      ]
    }
  ]
};
