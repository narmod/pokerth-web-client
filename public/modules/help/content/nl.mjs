// ── help/content/nl.mjs — Nederlands hulpcorpus (Partij 2) ──────────────────
// Vertaling van en.mjs (referentie). Structuur en ids identiek; alleen
// t / b / list / keys (labels) / note zijn vertaald. Pokertermen
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) blijven
// Engels, volgens de conventie van de app.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Aan de slag',
      sections: [
        { id: 'modes', t: 'Drie manieren om te spelen',
          b: ['Kies op het inlogscherm hoe je wilt spelen.'],
          list: [
            'Internet — speel online op de officiële pokerth.net-server, met ranglijsten. Een pokerth.net-account is vereist; registreren op pokerth.net is gratis.',
            'Lokaal / training — speel offline tegen bots. Niets in te stellen, werkt zonder verbinding en ontgrendelt trofeeën naarmate je vordert.',
            'LAN / dedicated server — verbind met een privé PokerTH-server op je lokale netwerk of je eigen machine.'] },
        { id: 'lan', t: 'LAN / dedicated server',
          b: ['De derde modus verbindt met elke PokerTH-server die jij of een vriend draait — op een thuisnetwerk, een privé-VPS, waar dan ook. Voer het adres en de poort van de server in, vink TLS aan als de server een versleutelde poort gebruikt, en log in met een bijnaam (gasttoegang werkt als de server het toestaat). Aan tafel gedraagt alles zich daarna precies als op de officiële server.'] },
        { id: 'famboard', t: 'Familieranglijst',
          b: ['Alleen op privéservers en in LAN-spellen houdt de client langetermijnstatistieken per bijnaam bij — gespeelde en gewonnen handen en partijen, grootste winst, beste reeks — en deelt ze via de server, zodat elk apparaat rond de tafel dezelfde ranglijst ziet. pokerth.net-spellen worden nooit op deze manier bijgehouden, en de statistieken van de trainingsmodus blijven volledig gescheiden.'] },
        { id: 'language', t: 'Taal',
          b: ['De interface is beschikbaar in 36 talen. Wijzig hem op elk moment in de Geavanceerde opties (tandwielmenu), categorie Gebruikersinterface. De pokeractietermen (Fold, Check, Call, Bet, Raise, All-In) blijven per conventie Engels, precies zoals in de desktopclient.'] },
        { id: 'pwa', t: 'Installeren als app',
          b: ['Deze client is een Progressive Web App: je kunt hem installeren via het browsermenu (of de installatieknop in de header) voor een schermvullende app met eigen pictogram. Eenmaal geïnstalleerd start hij direct en werkt de trainingsmodus volledig offline.'],
          note: 'Op Android en desktop-Chrome/Edge doet de installatieknop alles. Op iPhone/iPad staat Apple installatie alleen toe via Safari: Deel-knop \u2192 \u201cZet op beginscherm\u201d — de client toont deze stappen wanneer nodig. De knop verdwijnt zodra de app geïnstalleerd is.' },
        { id: 'platforms', t: 'Platformen en browsers',
          b: ['De client draait in elke moderne browser op elk systeem — Windows, macOS, Linux, Android, iOS. Enkele functies steunen op nieuwere browser-API\u2019s; ontbreekt een API, dan verbergt de functie zich of legt ze het uit in plaats van kapot te gaan. De belangrijkste verschillen:'],
          list: [
            'Chrome / Edge (desktop): alles werkt, inclusief het wegschrijven van het .pdb-logboek naar een map.',
            'Firefox: alles behalve het wegschrijven van de .pdb naar een map (API nog niet beschikbaar).',
            'Safari / iOS: installatie via Delen \u2192 \u201cZet op beginscherm\u201d; geen trilfunctie; volledig scherm beperkt op iPhone; geluid start na je eerste tik.',
            'Android: volledige ondersteuning in Chromium-browsers, inclusief trillen en het gedrag van de Terug-knop.'] },
        { id: 'avatar', t: 'Bijnaam en avatar',
          b: ['Kies je bijnaam en avatar op het inlogscherm voordat je verbindt. Op pokerth.net is je bijnaam je accountnaam; avatars worden via de avatarserver met andere spelers gedeeld.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pokerregels',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em in het kort',
          b: ['PokerTH speelt No-Limit Texas Hold\u2019em. Elke speler krijgt twee gesloten kaarten (de hole cards). Vijf gemeenschappelijke kaarten worden daarna open in het midden van de tafel gelegd. De beste hand van vijf kaarten uit elke combinatie van je twee kaarten en de vijf gemeenschappelijke kaarten wint de pot.'] },
        { id: 'blinds', t: 'De blinds en de dealerbutton',
          b: ['Voor elke hand vullen twee verplichte inzetten de pot: de small blind en de big blind, geplaatst door de twee spelers links van de dealerbutton. De button schuift na elke hand één plaats met de klok mee, zodat iedereen om de beurt de blinds betaalt. De blinds stijgen met regelmatige tussenpozen tijdens de partij.',
              'Op tafel zijn de button en de blinds met fiches gemarkeerd: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'De vier inzetronden',
          list: [
            'Pre-flop — na het delen van de gesloten kaarten begint de eerste inzetronde links van de big blind.',
            'Flop — drie gemeenschappelijke kaarten worden onthuld, gevolgd door een inzetronde.',
            'Turn — een vierde gemeenschappelijke kaart, dan nog een inzetronde.',
            'River — de vijfde en laatste gemeenschappelijke kaart, dan de laatste inzetronde.'],
          b: ['Een inzetronde eindigt wanneer elke speler die nog in de hand zit hetzelfde bedrag in de pot heeft gelegd (of all-in is).'] },
        { id: 'actions', t: 'Wat je kunt doen als je aan de beurt bent',
          list: [
            'Fold — de hand opgeven. Je kaarten gaan weg en je speelt niet meer om de pot.',
            'Check — doorschuiven zonder in te zetten. Alleen mogelijk als er niets te betalen valt.',
            'Call — de lopende inzet meegaan.',
            'Bet — de inzetten openen wanneer nog niemand op deze street heeft ingezet.',
            'Raise — verhogen bovenop een bestaande inzet. De minimale verhoging is gelijk aan de vorige inzet of verhoging.',
            'All-In — je hele stack inzetten. Je blijft in de hand tot het bedrag dat je hebt gedekt.'] },
        { id: 'showdown', t: 'Showdown en gedeelde potten',
          b: ['Blijven er na de inzetronde van de river meerdere spelers over, dan worden de handen getoond en wint de beste — de winnende combinatie verschijnt onder de gemeenschappelijke kaarten. Wanneer een speler all-in is voor minder dan de volledige inzetten, ontstaan side-pots: elke speler kan alleen het deel van de pot winnen waaraan hij heeft bijgedragen. Gelijke handen delen de pot.'] },
        { id: 'hands', t: 'Rangorde van de handen',
          b: ['Van zwakste naar sterkste:'],
          list: [
            '1. High Card — geen combinatie; de hoogste kaart beslist.',
            '2. Pair — twee kaarten van dezelfde waarde.',
            '3. Two Pair — twee verschillende paren.',
            '4. Three of a Kind — drie kaarten van dezelfde waarde.',
            '5. Straight — vijf opeenvolgende kaarten (de Aas telt hoog of laag).',
            '6. Flush — vijf kaarten van dezelfde kleur.',
            '7. Full House — drie gelijke plus een paar.',
            '8. Four of a Kind — vier kaarten van dezelfde waarde.',
            '9. Straight Flush — een straat, volledig in één kleur.',
            '10. Royal Flush — van Tien tot Aas, in één kleur. De best mogelijke hand.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Het spelscherm',
      sections: [
        { id: 'actionbar', t: 'De actiebalk',
          b: ['Als je aan de beurt bent, licht de actiebalk onderaan op met maximaal vier knoppen: Fold (rood), Check / Call (blauw), Bet / Raise (groen — de primaire actie, uitgelicht) en All-In (donkerrood). De knop Check / Call toont het exacte bedrag om mee te gaan; Bet / Raise toont het bedrag dat je gaat inzetten. Na de river kan All-In een Show-knop worden om je kaarten te tonen.'] },
        { id: 'betctl', t: 'Je inzet kiezen',
          b: ['Stel het verhogingsbedrag in met het invoerveld, de schuifregelaar of de snelknoppen 1/3 \u00b7 1/2 \u00b7 Pot (delen van de huidige pot). Bedragen worden automatisch afgerond en tussen de minimale en maximale toegestane verhoging gehouden. Denk je liever in big blinds, dan toont een optie alle bedragen in BB in plaats van fiches.'] },
        { id: 'preselect', t: 'Een actie vooraf kiezen',
          b: ['Vóór je beurt kun je een actie alvast klaarzetten: tik op een knop en hij krijgt een gouden rand met een klein gouden stipje. Als je beurt komt, wordt de actie direct uitgevoerd. Een vooraf gekozen Fold wordt automatisch een Check als checken gratis is — je gooit nooit voor niets weg. Voorkeuzes worden bij elke nieuwe hand, elke street-wissel en de showdown gereset, en vervallen als de situatie verandert (bijvoorbeeld als het te betalen bedrag verandert).'] },
        { id: 'automodes', t: 'Automatische modi',
          b: ['Het keuzemenu naast de actieknoppen biedt drie speelmodi: Handmatig, Auto Check/Call en Auto Check/Fold. De automodi spelen voor je totdat je terugschakelt — elke handmatige klik op een actie zet direct terug naar Handmatig.'] },
        { id: 'readtable', t: 'De tafel lezen',
          b: ['Elk spelersvak toont avatar, naam, stack en lopende inzet. Dealer en blinds zijn gemarkeerd met D-/SB-/BB-fiches. Een gekleurd embleem op het vak toont de laatste actie van de speler; een dun blauw balkje telt zijn bedenktijd af. Het vak van de speler aan de beurt licht op; je eigen vak krijgt bij jouw beurt een pulserend gouden kader.',
              'De statusbalk boven de tafel toont de totale pot, de inzetten van de lopende street, de fase (Pre-flop, Flop, Turn, River) en de spel- en handnummers. Gefolde spelers hebben doorschijnende kaarten; uitgeschakelde spelers zijn gedimd. Aan het einde van een hand kan een winnaarsvenster samenvatten wie wat won — uit te schakelen in de opties.'] },
        { id: 'seatlayout', t: 'Plaatsing van de stoelen',
          b: ['Als webuitbreiding kies je de indeling van de spelersvakken in Geavanceerde opties \u2192 Stoelen: Automatisch volgt de officiële client (vaste plekken in staand, berekende ellips in liggend), of forceer de Staande of Liggende indeling — en Aangepast laat je elke stoel zelf plaatsen: er verschijnt een bewerkingsmodus waarin je elk vak precies sleept waar je het wilt, en de indeling wordt opgeslagen.'] },
        { id: 'zoom', t: 'Tafelzoom (telefoons)',
          b: ['Op kleine schermen zoomen loepknoppen de tafel in (2\u00d7) en kun je met je vinger schuiven — je eigen vak en de actiebalk blijven vast. Het beeld volgt automatisch de actieve stoel en zoomt bij de showdown uit voor het overzicht. Uit te schakelen in de Geavanceerde opties.'],
          note: 'Op telefoons en tablets is de knijpzoom van de browser zelf standaard geblokkeerd, zodat een zoomgebaar nooit per ongeluk midden in een hand afgaat; zet hem weer aan in Geavanceerde opties \u2192 Gebruikersinterface als je dat liever hebt.' },
        { id: 'protections', t: 'Anti-gluur- en per-ongeluk-Call-bescherming',
          b: ['Twee optionele beschermingen: de anti-gluurmodus houdt je eigen kaarten verborgen totdat je ze aanraakt (handig als iemand je scherm kan zien), en de bescherming tegen een per-ongeluk-Call blokkeert de Call-knop kort na een grote verhoging, zodat een tik bedoeld voor een kleinere Call niet per ongeluk op het verhoogde bedrag terechtkomt. Beide zitten in de Geavanceerde opties.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Infopaneel',
      sections: [
        { id: 'open', t: 'Het paneel openen',
          b: ['Tijdens een spel opent het infopaneel via de header (of Alt+L / Alt+I) en heeft het drie tabbladen: Logboek, Kansen en Stats. Op de telefoon zweeft het boven de tafel; op grotere schermen is het een verplaatsbaar en schaalbaar venster — pak de \u28ff-greep om het te verplaatsen, de randen om het te schalen. De positie wordt onthouden.'] },
        { id: 'log', t: 'Spellogboek',
          b: ['Het tabblad Logboek legt het hele spel hand voor hand vast: blinds, elke actie met bedragen, getoonde kaarten en winnaars, alles in kleur voor snel lezen. De exportknop bewaart het logboek als bestand als je een sessie later wilt terugkijken.'] },
        { id: 'odds', t: 'Kansen (waarschijnlijkheidsmonitor)',
          b: ['Het tabblad Kansen toont voor je huidige hand de live kans om te eindigen met elk van de 10 handcategorieën — van High Card tot Royal Flush — elk met pictogram, percentage en balk. De weergave wordt gedimd zodra je foldt. Hij gebruikt uitsluitend je eigen kaarten en de gemeenschappelijke kaarten: hij ziet niets wat je tegenstanders niet tonen.'] },
        { id: 'journal', t: 'Handlogboeken en het venster \u201cLogs\u201d',
          b: ['Naast het live logboek wordt elke hand die je speelt lokaal in je browser vastgelegd, in hetzelfde formaat als de .pdb-logbestanden van de officiële client. Het Logs-venster (Geavanceerde opties \u2192 Logmeldingen \u2192 Logs beheren\u2026) toont je sessies en laat je ermee werken: een sessie bekijken met zoeken en markeren, filteren per spel, exporteren als HTML of platte tekst, het rauwe .pdb-bestand opslaan, of een door de desktopclient opgenomen .pdb importeren. Sessies verwijder je één voor één of allemaal tegelijk (met bevestiging), en een automatische bewaartermijn kan alleen de laatste 7, 30, 90, 180 of 365 dagen behouden. Logboeken die je zelf importeert, worden nooit automatisch verwijderd. Een tweede instelling beperkt hoeveel sessies worden bewaard, en de lijstkolom kan breder worden gesleept.',
              'De knop Analyseren voert een handanalyse over een sessie uit en kan een logboek naar de analysedienst van pokerth.net sturen. Alles blijft op je apparaat zolang je niet expliciet exporteert of verstuurt.'] },
        { id: 'logopts', t: 'Logopties',
          b: ['Bij Geavanceerde opties \u2192 Logberichten kun je het loggen aan- of uitzetten en het schrijfinterval kiezen, met dezelfde drie instellingen als de desktopclient: na elke handeling, na elke hand (standaard) of na elke partij. Een andere optie schrijft het .pdb-bestand naar een map naar keuze en houdt het op dat interval bij, plus nog één keer als je de pagina verlaat, zodat een ander programma de partij live kan volgen.'],
          note: 'Schrijven naar een lokale map vereist de File System Access API: alleen Chrome, Edge en Opera op desktop. Elders legt de optie zichzelf uit en blijft handmatige export uit het logvenster beschikbaar. Een browser kan een bestand alleen vervangen, nooit aanvullen, dus een programma dat de .pdb leest moet het na elke wijziging opnieuw openen.' },
        { id: 'assist', t: 'Assistentie (handsterkte)',
          b: ['Bovenin het tabblad Kansen leest de assistentiebanner je hand voor je. Vóór de flop benoemt hij je starthand en waardeert hij hem met sterren; vanaf de flop toont hij je huidige beste combinatie en, na een snelle simulatie, je geschatte winkans als percentage, met een kleurmeter van rood (zwak) naar groen (sterk). Net als de waarschijnlijkheidsmonitor gebruikt hij alleen informatie die jij kunt zien.',
              'Twee weergavestijlen zijn beschikbaar in Geavanceerde opties \u2192 Stoelen: Segmenten (tien blokken) of een klassieke voortgangsbalk. De hele assistentiefunctie is uit te schakelen in Geavanceerde opties \u2192 Assistentie.'] },
        { id: 'assistwin', t: 'Assistentie als zwevende widget',
          b: ['Het assistentieblok kan uit het paneel worden losgemaakt naar een eigen klein venster dat altijd bovenop ligt: gebruik de losmaakknop op het blok, en verplaats en schaal het waar je wilt boven de tafel — handig om je handsterkte in de gaten te houden zonder het volledige paneel open. De aankoppelknop zet het terug in het tabblad Kansen, en de positie wordt onthouden. In het paneel laat een sleepgreep tussen Assistentie en de kansen je de ruimte tussen beide verdelen.'] },
        { id: 'stats', t: 'Stats',
          b: ['Het tabblad Stats volgt je sessie: gespeelde handen, geziene flops, showdowns, winstpercentages en meer. Het bijhouden van statistieken is uit te schakelen in de Geavanceerde opties.'] },
        { id: 'hud', t: 'Stats-HUD op de stoelen (bèta)',
          b: ['De HUD hangt een klein statistiekvak naast de stoel van elke speler, opgebouwd uit de handen die je in je logboeken hebt vastgelegd: aantal waargenomen handen, dan VPIP (hoe vaak hij pre-flop vrijwillig geld inzet), PFR (pre-flop-verhogingen), AF (agressiefactor), 3B (3-bet), CB (continuation bet) en F3B (fold op 3-bet), met kleurcodering van passief naar agressief. Tik op een vak voor een gedetailleerde popover met meer cijfers (steal-pogingen, fold op steal, showdown-percentages\u2026), en sleep een vak opzij als het iets bedekt.',
              'De HUD kent alleen wat je aan je eigen tafels hebt gezien — hij leest je lokale handlogboeken, dus het loggen moet aanstaan en de cijfers worden pas betekenisvol na genoeg handen. Het is een bètafunctie, standaard uit: zet hem aan in Geavanceerde opties \u2192 Assistentie.'] },
        { id: 'handsbtn', t: 'Overzicht van de combinaties',
          b: ['Het pokerhanden-pictogram op het laken opent op elk moment een snel overzicht van de 10 combinaties — handig tijdens het leren. Het is te verbergen in de Geavanceerde opties.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat & sociaal',
      sections: [
        { id: 'panels', t: 'Lobbychat en tafelchat',
          b: ['Er is een chat in de lobby en een aan tafel. Op de telefoon zweeft de tafelchat boven het spel; op grotere schermen is het een verplaatsbaar en schaalbaar venster. Een embleem op de chatknop telt de ongelezen berichten.'] },
        { id: 'typing', t: 'Typhulpjes',
          list: [
            'Tab vult een bijnaam aan — druk nogmaals op Tab om door de treffers te bladeren.',
            '\u2191 / \u2193 bladeren door de geschiedenis van je eigen berichten.',
            'De emoji-knop opent een volledige kiezer; het typen van : stelt ook emotes voor tijdens het typen.'] },
        { id: 'emotes', t: 'Emotes en smileys',
          b: ['De chat zet emote-codes precies zo om als de officiële desktopclient: typ een naam tussen dubbele punten en hij wordt de emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 meer dan 1.900 codes worden ondersteund (de volledige GitHub-set). Klassieke tekstsmileys worden ook omgezet: :-) ;) :D xD :P <3 en zo\u2019n tachtig andere.',
              'Het typen van : opent een suggestievenster dat de code aanvult terwijl je typt (\u2191/\u2193 om te kiezen, Tab of Enter om te bevestigen). De emoji-omzetting is volledig uit te schakelen in Geavanceerde opties \u2192 Chat.'] },
        { id: 'commands', t: 'Chatcommando\u2019s',
          b: ['De chat begrijpt schuine-streepcommando\u2019s. Twee zijn zichtbaar voor anderen:'],
          keys: [
            ['/me <tekst>', 'Actiebericht, getoond als \u201c* jouwnaam tekst\u201d'],
            ['/emoji <emoji>', 'Speelt een emoji-reactie af (wat de reactiekiezer verstuurt)']] },
        { id: 'diagcmds', t: 'Diagnosecommando\u2019s',
          b: ['Al het andere is lokaal: de antwoorden zie alleen jij en er wordt niets naar de tafel gestuurd. Typ /help om ze allemaal te tonen. De nuttigste:'],
          keys: [
            ['/help', 'Alle commando\u2019s tonen'],
            ['/update', 'Op een nieuwe versie controleren en verversen'],
            ['/lang <code>', 'Van taal wisselen (bv. /lang nl)'],
            ['/sound on|off', 'Spelgeluiden aan/uit'],
            ['/zoom', 'De tafelloep aan/uit'],
            ['/clear', 'De chat lokaal leegmaken'],
            ['/table', 'Info over het huidige spel (blinds, spelers, stacks)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnose van clientstatus, netwerk en beeldsnelheid'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Geavanceerd debuggen (kaarten, protocol, audio, opslag, stoelen)'],
            ['/copy', 'Het laatste commando-antwoord naar het klembord kopiëren']] },
        { id: 'reactions', t: 'Emoji-reacties',
          b: ['De reactieknop opent een kiezer met 30 geanimeerde reacties (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) die met een effect boven je stoel worden afgespeeld, zichtbaar voor de hele tafel — ook voor spelers op de desktopclient. Reacties zijn volledig uit te schakelen in de Geavanceerde opties.'] },
        { id: 'translate', t: 'Iedereen begrijpen',
          b: ['Met chatvertaling aan verschijnt een vertaalknop op de regel onder je aanwijzer \u2014 of op de regel die je aantikt, op een aanraakscherm \u2014 en toont dat bericht in jouw taal met de vertaler van de browser. Hij kan permanent op alle regels staan via Geavanceerde opties \u2192 Chat, waar ook de tooltip woont die de gangbare tafelafkortingen (gg, nh, utg\u2026) uitlegt.'],
          note: 'De vertaling gebruikt de Google Translate-dienst en werkt in elke browser — er is alleen een internetverbinding nodig. Een bericht wordt pas naar de vertaaldienst gestuurd als je op de vertaalknop ervan tikt, nooit automatisch.' },
        { id: 'social', t: 'Spelers: profiel, uitnodigen, negeren',
          b: ['Tik op een speler — aan tafel of in de lobbylijst — om zijn kaart te openen: profiel en statistieken, hem uitnodigen voor je spel, of hem negeren (zijn chatberichten worden verborgen; negeren is op elk moment omkeerbaar). Een bevestiging vóór uitnodigen/negeren kan in de opties worden ingeschakeld.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby & spellen',
      sections: [
        { id: 'list', t: 'De spellenlijst',
          b: ['De lobby toont elke tafel van de server. Elke regel toont het aantal spelers, het speltype, een hangslot wanneer een wachtwoord of uitnodiging vereist is, en een statusembleem: \u201cWachtend\u201d (groen — het spel is niet begonnen, je kunt meedoen als er een stoel vrij is), \u201cBezig\u201d (warme kleur — live te bekijken als toeschouwers zijn toegestaan) en \u201cGesloten\u201d (gedimd). Een volle tafel herken je gewoon aan de volle teller, zoals 10/10; de emblemenkleuren volgen het actieve thema.',
              'Het filterkeuzemenu grenst de lijst precies zo af als de desktopclient, elke keuze strenger dan de vorige: alleen open spellen \u2192 ook volle tafels verbergen \u2192 dan alleen niet-privé, alleen privé, of alleen gewaardeerde spellen. Je keuze wordt onthouden. Het zoekveld vindt een spel op naam, en het spelersembleem opent de lijst van iedereen online, doorzoek- en sorteerbaar.'] },
        { id: 'join', t: 'Meedoen en toekijken',
          b: ['Selecteer een open spel en doe mee — een hangslot betekent dat een wachtwoord nodig is. Lopende spellen die toeschouwers toestaan zijn live te bekijken: je ziet de tafel en de chat, maar de gesloten kaarten blijven verborgen en je kunt niet handelen.'] },
        { id: 'gameinfo', t: 'Spelinfo',
          b: ['Vóór het meedoen toont de spelinfokaart alles wat de tafel bepaalt: speltype, blinds en hun verloop (verdubbeling of handmatige lijst), startstack, actietijd, pauze tussen de handen, en wie er al zit.'] },
        { id: 'create', t: 'Een spel maken',
          b: ['Maak je eigen tafel: naam, aantal spelers, startstack, eerste small blind en verhogingsschema, actietijd, en of toeschouwers zijn toegestaan. Er zijn vier speltypes: Normaal (iedereen), alleen geregistreerde spelers, alleen op uitnodiging, en Gewaardeerd (telt voor de officiële ranglijst — dan is geen wachtwoord mogelijk). Je favoriete instellingen kun je opslaan en opnieuw laden.'] },
        { id: 'invites', t: 'Uitnodigingen',
          b: ['Spelers kunnen je aan hun tafel uitnodigen; je krijgt een melding die je kunt aannemen of afwijzen. Uitgenodigd worden is de enige manier om een alleen-op-uitnodiging-spel binnen te komen.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Je account',
          b: ['De officiële internetserver is pokerth.net. Daar spelen vereist een gratis pokerth.net-account — registreer je op de website en log hier in met dezelfde bijnaam en hetzelfde wachtwoord. Deze webclient verbindt met precies dezelfde server als de desktopclient: dezelfde accounts, dezelfde tafels, dezelfde ranglijsten, en je kunt aan tafel zitten met spelers van de desktopclient.'] },
        { id: 'ranked', t: 'Gewaardeerde spellen en seizoenen',
          b: ['Spellen van het type Gewaardeerd tellen voor de officiële seizoensranglijst. Je profiel in de app toont je registratiedatum, je Rang van het lopende seizoen, je Score, je gemiddelde en je gespeelde spellen, plus je laatste resultaten. Normale (niet-gewaardeerde) spellen zijn puur voor het plezier en veranderen niets.'] },
        { id: 'rankhow', t: 'Hoe de ranglijst wordt berekend',
          b: ['In elk gerangschikt spel levert je plaats punten op: 15 voor de eerste, dan 9, 6, 4, 3, 2 en 1 tot en met de zevende; van de achtste tot de tiende niets. Een tafel verdeelt dus in totaal 40 punten.',
              'Je Score is niet de som van die punten, maar je gemiddelde per spel, getemperd door een factor die meegroeit met het aantal gespeelde spellen: een handvol goede resultaten is niet genoeg om bovenin te blijven, er is ook regelmaat nodig — hoe meer je speelt, hoe dichter je Score bij je echte gemiddelde komt. Een seizoen duurt een kwartaal: bij de overgang wordt alles gearchiveerd en beginnen de tellers weer bij nul, terwijl vorige seizoenen raadpleegbaar blijven. In het spel toont de podiumknop de seizoensrangschikking van de spelers aan jouw tafel.'],
          note: 'De puntenverdeling en de exacte formule worden bepaald door de ranglijstserver van pokerth.net en kunnen veranderen; de pagina\u2019s op de site zijn maatgevend.' },
        { id: 'rankings', t: 'Ranglijstpagina\u2019s',
          b: ['De ranglijstknop opent de officiële PokerTH-ranglijst, doorzoekbaar op speler, plus de communityranglijsten (BBC, WEC). Interesseren ranglijsten je niet, dan is de knop te verbergen in Geavanceerde opties \u2192 Community.'] },
        { id: 'cups', t: 'De community-cups: BBC en WeCup',
          b: ['Twee community\u2019s organiseren hun eigen competities op pokerth.net, elk met een eigen site en eigen ranglijst. De Best Brainies Cup (BBC) is een stappentoernooi uit 2013: je werkt je op van Step 1 naar Step 4, en na elk Step 4-spel begint een nieuw seizoen, wanneer de cup wordt uitgereikt. De WeCup (WEC) heeft een eigen puntenverdeling, veel breder — 75 punten voor de eerste plaats, dan 45, 30, 20… — en de score normaliseert je gemiddelde aan de hand van het aantal spellen dat je hebt gespeeld ten opzichte van de andere leden.',
              'Beide ranglijsten open je via de trofeeknop, naast de PokerTH-ranglijst. De tafelinstellingen van deze competities zitten als voorinstellingen in het aanmaken van een spel (BBC Step 1 tot 4, WEC, WEC Monthly Final en WEC Grand Final), zodat je onder dezelfde omstandigheden kunt oefenen. Meedoen vraagt een inschrijving op de site van de betreffende cup.'],
          note: 'Deze inhoud verberg je in één keer in Geavanceerde opties → Community als cups je niet interesseren.' },
        { id: 'forumcups', t: 'Forumcups en evenementen',
          b: ['Het forum van pokerth.net herbergt ook de Monthly Cup, een maandelijkse serie waarin spelers worden verdeeld over Gold-, Silver- en Bronze-tafels voordat de kampioen van de maand wordt gekroond, plus losse speciale cups door het jaar heen.',
              'Inschrijvingen, tijden, tafelinstellingen en uitslagen worden op het forum gepubliceerd, en de spellen worden net als alle andere op de officiële server gespeeld. Een pokerth.net-account volstaat om de uitslagen te volgen; je inschrijven voor een cup gaat via het bijbehorende forumdraadje.'] },
        { id: 'avatars', t: 'Avatars en vlaggen',
          b: ['Op pokerth.net wordt je avatar via de avatarserver naar andere spelers verspreid, en kan een kleine landvlag op de spelersvakken verschijnen. Beide zijn optioneel en instelbaar in de opties.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Trainingsmodus',
      sections: [
        { id: 'what', t: 'Wat het is',
          b: ['De Lokaal-/trainingsmodus is een volledig spel tegen computergestuurde tegenstanders: geen verbinding, geen account, niets op het spel. Zodra de app is geïnstalleerd (of gewoon één keer bezocht), werkt hij volledig offline — perfect om het spel te leren, de interface te testen of de tijd te doden in vliegtuigmodus.'] },
        { id: 'setup', t: 'Een spel instellen',
          b: ['Kies het aantal tegenstanders, de startstack, de blinds en hun verloop, en het speltempo. De samenstelling en moeilijkheid van de bots stel je in via Geavanceerde opties \u2192 Lokaal spel — van milde tegenstanders tot een hardere, gevarieerde tafel.'] },
        { id: 'trophies', t: 'Trofeeën',
          b: ['De trainingsmodus heeft zijn eigen voortgang: 28 trofeeën in zes categorieën (voortgang, techniek, stijl, formaten, plezier en een geheime) worden spelend ontgrendeld — gespeelde handen, gewonnen partijen, grote bluffs, bijzondere handen en meer. Je trofeevoortgang is cumulatief en wordt tussen apparaten samengevoegd wanneer de accountsynchronisatie van de instellingen actief is.'] },
        { id: 'learn', t: 'Een goede plek om te leren',
          b: ['Alles uit de andere hoofdstukken werkt hier ook: de waarschijnlijkheidsmonitor, de assistentieweergave, de voorkeuze, de sneltoetsen. De trainingsmodus is de beste plek om ze zonder druk uit te proberen voordat je naar pokerth.net gaat.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stijl & geluid',
      sections: [
        { id: 'themes', t: 'Thema\u2019s',
          b: ['De categorie Stijl van de Geavanceerde opties kleedt de hele client opnieuw aan. Voorinstellingen zetten alles met één tik (het klassieke groene casino, de officiële PokerTH-look\u2026); daaronder stemmen aparte assen het kleurenpalet, het tafellaken en de kaartbeelden afzonderlijk af — wijzig een as en je mix wordt een eigen thema. Donker, licht of automatisch kies je onder Gebruikersinterface, en je keuzes gelden direct, op elk scherm, en worden onthouden.'] },
        { id: 'tablelook', t: 'Tafels, decks, stoelen',
          b: ['Naast het thema zijn meerdere elementen los te verwisselen: de tafelachtergrond, het kaartendeck, de kaartrug (automatisch passend bij het deck, of importeer je eigen afbeelding), de dealer- en blindfiches, de stijl van de actieknoppen, en complete stoelpakketten die de spelersvakken opnieuw aankleden. Kies alles in Geavanceerde opties \u2192 Stijl; wijzigingen zijn meteen zichtbaar aan tafel.'] },
        { id: 'music', t: 'Muziekspeler',
          b: ['De muziekknop in de headermenu\u2019s opent een kleine loungemuziekspeler: kies een nummer uit de afspeellijst, afspelen/pauzeren, vorige/volgende, willekeurig, en herhaling van één nummer, de hele lijst of niets. Volume, gekozen nummer en herhaalmodus worden onthouden. Het afspelen start nooit vanzelf — browsers vereisen een tik — en de speler staat volledig los van de spelgeluidseffecten.'] },
        { id: 'sounds', t: 'Geluidseffecten',
          b: ['De spelgeluiden zijn gegroepeerd in vier apart schakelbare categorieën, precies zoals in de desktopclient: spelacties (gedeelde kaarten, Check, Call, Raise, jouw beurt\u2026), lobbychat-melding, netwerkspel-meldingen (speler binnengekomen, spel klaar) en de blindverhoging-melding. Eén volumeregelaar bestuurt ze allemaal, in Geavanceerde opties \u2192 Geluid.'],
          note: 'Alle browsers — iOS in het bijzonder — weigeren geluid af te spelen voordat je de pagina één keer hebt aangeraakt. Start een spel stil, dan wekt één tik waar dan ook het geluid; de client herstelt de audio-engine ook automatisch wanneer iOS hem onderbreekt (inkomend gesprek, achtergrond\u2026).' },
        { id: 'voice', t: 'Stem en trillen',
          b: ['Twee extra kanalen kunnen je informeren zonder naar het scherm te kijken: gesproken aankondigingen lezen de spelgebeurtenissen voor via de spraaksynthese van je apparaat, en op de telefoon kan een korte trilling je beurt markeren. Beide zijn webuitbreidingen, standaard aan of uit afhankelijk van het apparaat, in Geavanceerde opties \u2192 Inzet & beurt.'],
          note: 'Trillen werkt op Android (Chromium-browsers); Apple biedt websites geen trilfunctie-API, dus iPhones kunnen niet trillen. Gesproken aankondigingen werken overal, maar de beschikbare stemmen en talen hangen van je systeem af — de client gebruikt de beste match die hij vindt.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opties & sneltoetsen',
      sections: [
        { id: 'where', t: 'Waar de opties wonen',
          b: ['De Geavanceerde opties openen via de tandwielknop van elk headermenu. Ze zijn gegroepeerd zoals in de desktopclient: Gebruikersinterface, Stijl, Geluid, Lokaal spel, Netwerkspel, Internetspel, Bijnamen / Avatars, Logmeldingen, en Standaardwaarden herstellen. Elke webspecifieke functie heeft daar zijn eigen schakelaar, zodat je alles kunt uitschakelen wat je niet gebruikt.'] },
        { id: 'cfgxml', t: 'Instellingen uitwisselen met de desktopclient',
          b: ['Je instellingen kunnen tussen clients reizen: de categorie Logmeldingen biedt export/import van het officiële config.xml-bestand (de \u007e/.pokerth/config.xml van de desktop- en QML-clients). De export schrijft de gedeelde instellingen — naam, weergaveopties, geluiden, tafelvoorkeuren, blinds, stijlen — en de import past hier een desktopbestand toe. Instellingen die deze client niet kent, blijven onaangetast in het bestand bewaard.'] },
        { id: 'sync', t: 'Instellingen die je volgen',
          b: ['Speel je met een account, dan worden je opties, thema, toetsbindingen, taal en trainingstrofeeën gesynchroniseerd: wijzig iets op één apparaat en het volgende apparaat waarop je inlogt neemt het over. Trofeevoortgang wordt samengevoegd, nooit overschreven — spelen op twee apparaten behoudt dus altijd het beste van beide.'] },
        { id: 'updates', t: 'Up-to-date blijven',
          b: ['De client werkt zichzelf bij: wordt een nieuwe versie uitgerold, dan nodigt een banner je uit om te verversen (of typ /update in de chat om handmatig te controleren). Af en toe kan een kleine productenquête verschijnen om je mening over een functie te vragen — meedoen is vrijwillig en enquêtes zijn volledig uit te schakelen in Geavanceerde opties \u2192 Community.'] },
        { id: 'fkeys', t: 'Officiële sneltoetsen',
          b: ['De offici\u00eble PokerTH-functietoetsen werken tijdens een partij \u2014 Alt+S werkt overal:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (volgorde omkeerbaar in de opties)'],
            ['F5', 'Je kaarten tonen (wanneer mogelijk)'],
            ['F6 / F7 / F8', 'Handmatig \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Handmatig \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Logboek \u00b7 Kansenpaneel'],
            ['Alt+S', 'Instellingen \u2014 overal in de app, niet alleen tijdens een partij'],
            ['F11', 'Volledig scherm']],
          note: 'Sneltoetsen vereisen een fysiek toetsenbord. Op een Mac sturen de F-toetsen standaard de media aan: houd Fn ingedrukt (of zet \u201cGebruik F1-, F2-toetsen enz. als standaardfunctietoetsen\u201d aan in de macOS-instellingen). Op iPhone is volledig scherm door iOS beperkt — de app als PWA installeren geeft dezelfde schermvullende ervaring.' },
        { id: 'webkeys', t: 'Webletter-toetsen',
          b: ['Webuitbreiding: losse lettertoetsen en Alt+T activeren ook acties, en ze zijn allemaal opnieuw toe te wijzen in Geavanceerde opties \u2192 Sneltoetsen:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Statistiekenpaneel'],
            ['Esc', 'Het bovenste venster sluiten (ook de Android-Terug-knop)']],
          note: 'Op Android sluit de systeem-Terug-knop/-beweging vensters zoals Esc in plaats van het spel te verlaten (instelbaar in de opties). iOS heeft geen vergelijkbare systeemknop — gebruik de \u2715 van elk venster.' }
      ]
    }
  ]
};
