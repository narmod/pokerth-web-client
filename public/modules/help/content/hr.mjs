// ── help/content/hr.mjs — Hrvatski korpus pomoći (5. serija) ────────────────
// Prijevod en.mjs (referenca). Struktura i id-ovi identični; prevedeni su
// samo t / b / list / keys (oznake) / note. Pokerski izrazi (Fold, Check,
// Call, Bet, Raise, All-In, flop, turn, river…) ostaju na engleskom prema
// konvenciji aplikacije.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Prvi koraci',
      sections: [
        { id: 'modes', t: 'Tri načina igranja',
          b: ['Na zaslonu za prijavu odaberi kako želiš igrati.'],
          list: [
            'Internet — igraj online na službenom poslužitelju pokerth.net, s ljestvicama. Potreban je pokerth.net račun; registracija na pokerth.net je besplatna.',
            'Lokalno / trening — igraj offline protiv botova. Ništa za postavljanje, radi bez veze i otključava trofeje kako napreduješ.',
            'LAN / namjenski poslužitelj — spoji se na privatni PokerTH poslužitelj u svojoj lokalnoj mreži ili na vlastitom računalu.'] },
        { id: 'lan', t: 'LAN / namjenski poslužitelj',
          b: ['Treći način spaja se na bilo koji PokerTH poslužitelj koji vodiš ti ili prijatelj — u kućnoj mreži, na privatnom VPS-u, bilo gdje. Unesi adresu i port poslužitelja, označi TLS ako poslužitelj koristi šifrirani port i prijavi se nadimkom (gostujuća prijava radi ako je poslužitelj dopušta). Za stolom se potom sve ponaša točno kao na službenom poslužitelju.'] },
        { id: 'famboard', t: 'Obiteljska ljestvica',
          b: ['Samo na privatnim poslužiteljima i u LAN igrama klijent čuva kumulativne statistike po nadimku — odigrane i dobivene ruke i partije, najveći dobitak, najbolji niz — i dijeli ih preko poslužitelja, tako da svaki uređaj oko stola vidi istu ljestvicu. Igre na pokerth.net nikad se ne prate na taj način, a statistike trening načina drže se potpuno odvojeno.'] },
        { id: 'language', t: 'Jezik',
          b: ['Sučelje je dostupno na 36 jezika. Promijeni ga bilo kada u Naprednim opcijama (izbornik sa zupčanikom), kategorija Korisničko sučelje. Pokerski izrazi za akcije (Fold, Check, Call, Bet, Raise, All-In) ostaju na engleskom prema konvenciji, točno kao u desktop klijentu.'] },
        { id: 'pwa', t: 'Instaliraj kao aplikaciju',
          b: ['Ovaj klijent je Progressive Web App: možeš ga instalirati iz izbornika preglednika (ili gumbom za instalaciju u zaglavlju) i dobiti aplikaciju preko cijelog zaslona s vlastitom ikonom. Nakon instalacije pokreće se trenutačno, a trening način radi potpuno offline.'],
          note: 'Na Androidu i u Chromeu/Edgeu na računalu gumb za instalaciju obavlja sve. Na iPhoneu/iPadu Apple dopušta instalaciju samo kroz Safari: gumb Dijeli \u2192 \u201eDodaj na početni zaslon\u201c — klijent prikazuje te korake kad je potrebno. Gumb nestaje čim je aplikacija instalirana.' },
        { id: 'platforms', t: 'Platforme i preglednici',
          b: ['Klijent radi u svakom modernom pregledniku na svakom sustavu — Windows, macOS, Linux, Android, iOS. Nekoliko funkcija oslanja se na novije API-je preglednika; kad API nedostaje, funkcija se sakrije ili objasni situaciju umjesto da se pokvari. Glavne razlike koje treba znati:'],
          list: [
            'Chrome / Edge (računalo): sve radi, uključujući zapisivanje .pdb dnevnika u mapu.',
            'Firefox: sve osim zapisivanja .pdb u mapu (API još nije dostupan).',
            'Safari / iOS: instalacija ide kroz Dijeli \u2192 \u201eDodaj na početni zaslon\u201c; bez vibracije; puni zaslon ograničen na iPhoneu; zvuk kreće nakon tvog prvog dodira.',
            'Android: puna podrška u Chromium preglednicima, uključujući vibraciju i ponašanje gumba Natrag.'] },
        { id: 'avatar', t: 'Nadimak i avatar',
          b: ['Odaberi nadimak i avatar na zaslonu za prijavu prije spajanja. Na pokerth.net nadimak je ime tvog računa; avatari se dijele s drugim igračima preko avatar-poslužitelja.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pravila pokera',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em ukratko',
          b: ['PokerTH se igra kao No-Limit Texas Hold\u2019em. Svaki igrač dobiva dvije zatvorene karte (hole cards). Zatim se pet zajedničkih karata polaže licem prema gore na sredinu stola. Najbolja ruka od pet karata sastavljena od bilo koje kombinacije tvojih dviju karata i pet zajedničkih osvaja pot.'] },
        { id: 'blinds', t: 'Blindovi i dealerov gumb',
          b: ['Prije svake ruke pot pune dvije obavezne oklade: small blind i big blind, koje polažu dva igrača lijevo od dealerovog gumba. Gumb se nakon svake ruke pomiče jedno mjesto u smjeru kazaljke na satu, pa svi plaćaju blindove redom. Blindovi rastu u pravilnim razmacima tijekom partije.',
              'Na stolu su gumb i blindovi označeni žetonima: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Četiri kruga klađenja',
          list: [
            'Pre-flop — nakon dijeljenja zatvorenih karata prvi krug klađenja počinje lijevo od big blinda.',
            'Flop — otkrivaju se tri zajedničke karte, slijedi krug klađenja.',
            'Turn — četvrta zajednička karta, zatim još jedan krug klađenja.',
            'River — peta i posljednja zajednička karta, zatim završni krug klađenja.'],
          b: ['Krug klađenja završava kad je svaki igrač koji je još u ruci uložio u pot isti iznos (ili je all-in).'] },
        { id: 'actions', t: 'Što možeš učiniti kad si na potezu',
          list: [
            'Fold — odustaješ od ruke. Tvoje karte izlaze i više se ne boriš za pot.',
            'Check — nastavljaš bez oklade. Moguće samo kad nema što platiti.',
            'Call — izjednačavaš tekuću okladu.',
            'Bet — otvaraš oklade kad nitko još nije uložio na ovom streetu.',
            'Raise — povisuješ preko postojeće oklade. Minimalno povišenje jednako je prethodnoj okladi ili povišenju.',
            'All-In — ulažeš cijeli svoj stack. Ostaješ u ruci do iznosa koji si pokrio.'] },
        { id: 'showdown', t: 'Showdown i podijeljeni potovi',
          b: ['Ako nakon kruga klađenja na riveru ostane više igrača, ruke se pokazuju i najbolja pobjeđuje — pobjednička kombinacija prikazuje se ispod zajedničkih karata. Kad je igrač all-in s manje od punih oklada, nastaju sporedni potovi: svaki igrač može osvojiti samo dio pota kojem je pridonio. Izjednačene ruke dijele pot.'] },
        { id: 'hands', t: 'Redoslijed ruku',
          b: ['Od najslabije do najjače:'],
          list: [
            '1. High Card — nikakva kombinacija; odlučuje najviša karta.',
            '2. Pair — dvije karte iste vrijednosti.',
            '3. Two Pair — dva različita para.',
            '4. Three of a Kind — tri karte iste vrijednosti.',
            '5. Straight — pet uzastopnih karata (as vrijedi kao najviši ili najniži).',
            '6. Flush — pet karata iste boje.',
            '7. Full House — tris plus par.',
            '8. Four of a Kind — četiri karte iste vrijednosti.',
            '9. Straight Flush — skala, cijela u jednoj boji.',
            '10. Royal Flush — od desetke do asa u jednoj boji. Najbolja moguća ruka.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Zaslon igre',
      sections: [
        { id: 'actionbar', t: 'Traka akcija',
          b: ['Kad si na potezu, donja traka akcija zasvijetli s do četiri gumba: Fold (crveni), Check / Call (plavi), Bet / Raise (zeleni — glavna akcija, istaknuta) i All-In (tamnocrveni). Gumb Check / Call prikazuje točan iznos za plaćanje; Bet / Raise prikazuje iznos koji se spremaš uložiti. Nakon rivera All-In se može pretvoriti u gumb Show za pokazivanje karata.'] },
        { id: 'betctl', t: 'Odaberi svoju okladu',
          b: ['Iznos povišenja podesi brojčanim poljem, klizačem ili brzim gumbima 1/3 \u00b7 1/2 \u00b7 Pot (dijelovi trenutnog pota). Iznosi se automatski zaokružuju i drže između najmanjeg i najvećeg dopuštenog povišenja. Ako radije razmišljaš u big blindovima, opcija prikazuje sve iznose u BB umjesto u žetonima.'] },
        { id: 'preselect', t: 'Predodabir akcije',
          b: ['Prije svog poteza možeš unaprijed pripremiti akciju: dodirni gumb i on dobiva zlatni obrub s malom zlatnom točkom. Kad dođe tvoj potez, akcija se odmah izvršava. Pripremljeni Fold automatski postaje Check kad je check besplatan — nikad ne odustaješ uzalud. Predodabiri se poništavaju sa svakom novom rukom, promjenom streeta i showdownom, a otkazuju se ako se situacija promijeni (primjerice ako se promijeni iznos za plaćanje).'] },
        { id: 'automodes', t: 'Automatski načini',
          b: ['Padajući izbornik pokraj gumba akcija nudi tri načina igre: Ručni, Auto Check/Call i Auto Check/Fold. Automatski načini igraju umjesto tebe dok se ne vratiš — svaki ručni klik na akciju odmah vraća Ručni način.'] },
        { id: 'readtable', t: 'Čitanje stola',
          b: ['Svaka kutija igrača prikazuje avatar, ime, stack i tekuću okladu. Dealer i blindovi označeni su žetonima D / SB / BB. Obojena značka na kutiji pokazuje posljednju akciju igrača; tanka plava traka odbrojava njegovo vrijeme za razmišljanje. Kutija igrača na potezu zasvijetli; tvoja vlastita kutija dobiva pulsirajući zlatni obrub kad si ti na potezu.',
              'Statusna traka iznad stola prikazuje ukupni pot, oklade tekućeg streeta, fazu (Pre-flop, Flop, Turn, River) te brojeve partije i ruke. Igrači koji su odustali imaju prozirne karte; ispali su zatamnjeni. Na kraju ruke prozor pobjednika može sažeti tko je što osvojio — isključuje se u opcijama.'] },
        { id: 'seatlayout', t: 'Raspored mjesta',
          b: ['Kao web proširenje, raspored kutija igrača bira se u Napredne opcije \u2192 Mjesta: Automatski slijedi službeni klijent (fiksne pozicije uspravno, izračunata elipsa vodoravno), ili nametni Uspravni ili Vodoravni raspored — a Prilagođeni ti dopušta da svako mjesto postaviš sam: pojavljuje se način uređivanja u kojem svaku kutiju povučeš točno gdje želiš, a raspored se sprema.'] },
        { id: 'zoom', t: 'Zumiranje stola (telefoni)',
          b: ['Na malim zaslonima gumbi s povećalom povećavaju stol (2\u00d7) i možeš ga vući prstom — tvoja kutija i traka akcija ostaju na mjestu. Prikaz automatski prati aktivno mjesto i udaljava se pri showdownu za cjelovitu sliku. Isključuje se u Naprednim opcijama.'],
          note: 'Na telefonima i tabletima zumiranje štipanjem samog preglednika blokirano je prema zadanim postavkama, kako se gesta zumiranja nikad ne bi slučajno aktivirala usred ruke; ponovno je uključi u Napredne opcije \u2192 Korisničko sučelje ako ti tako više odgovara.' },
        { id: 'protections', t: 'Zaštita od virenja i od slučajnog Calla',
          b: ['Dvije neobavezne zaštite: zaštita od virenja drži tvoje karte zatvorene dok ih ne dodirneš (korisno kad ti netko može vidjeti zaslon), a zaštita od slučajnog Calla nakratko zaključava gumb Call odmah nakon velikog povišenja, da dodir namijenjen manjem Callu ne padne slučajno na povišeni iznos. Obje su u Naprednim opcijama.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Informacijska ploča',
      sections: [
        { id: 'open', t: 'Otvaranje ploče',
          b: ['Tijekom igre informacijska ploča otvara se iz zaglavlja (ili Alt+L / Alt+I) i ima tri kartice: Dnevnik, Izgledi i Statistike. Na telefonu lebdi iznad stola; na većim zaslonima to je pomični prozor promjenjive veličine — uhvati ručku \u28ff za pomicanje, rubove za promjenu veličine. Njegov se položaj pamti.'] },
        { id: 'log', t: 'Dnevnik igre',
          b: ['Kartica Dnevnik bilježi cijelu partiju ruku po ruku: blindove, svaku akciju s iznosima, pokazane karte i pobjednike, sve obojeno za brzo čitanje. Gumb za izvoz sprema dnevnik u datoteku ako želiš kasnije pregledati sesiju.'] },
        { id: 'odds', t: 'Izgledi (monitor vjerojatnosti)',
          b: ['Kartica Izgledi prikazuje za tvoju trenutnu ruku vjerojatnost uživo da završiš sa svakom od 10 kategorija ruku — od High Card do Royal Flush — svaka s ikonom, postotkom i trakom. Prikaz posivi čim odustaneš. Koristi samo tvoje karte i zajedničke: ne vidi ništa što protivnici ne pokažu.'] },
        { id: 'journal', t: 'Dnevnici ruku i prozor \u201eZapisnici\u201c',
          b: ['Osim dnevnika uživo, svaka odigrana ruka lokalno se snima u tvoj preglednik, u istom formatu kao .pdb datoteke zapisnika službenog klijenta. Prozor Zapisnici (Napredne opcije \u2192 Poruke zapisnika \u2192 Upravljanje zapisnicima\u2026) navodi tvoje sesije i omogućuje rad s njima: pregled sesije s pretraživanjem i isticanjem, filtriranje po partiji, izvoz u HTML ili obični tekst, spremanje sirove .pdb datoteke ili uvoz .pdb-a snimljenog desktop klijentom. Sesije se brišu jedna po jedna ili sve odjednom (uz potvrdu), a automatsko zadržavanje može čuvati samo zadnjih 7, 30, 90, 180 ili 365 dana. Zapisi koje sami uvezete nikada se ne brišu automatski. Druga postavka ograničava koliko se sesija čuva, a stupac s popisom može se povući širi.',
              'Gumb Analiziraj pokreće analizu ruku nad sesijom i može poslati zapisnik usluzi za analizu na pokerth.net. Sve ostaje na tvom uređaju dok izričito ne izvezeš ili pošalješ.'] },
        { id: 'logopts', t: 'Opcije zapisnika',
          b: ['U Naprednim opcijama \u2192 Poruke zapisnika možeš uključiti ili isključiti zapisivanje i odabrati interval pisanja, s ista tri postavljanja kao stolni klijent: nakon svake akcije, nakon svake ruke (zadano) ili nakon svake igre. Druga opcija zapisuje datoteku .pdb u mapu po tvom izboru i održava je aktualnom u tom intervalu, uz još jednom pri napuštanju stranice, kako bi drugi alat mogao pratiti igru uživo.'],
          note: 'Pisanje u lokalnu mapu zahtijeva File System Access API: samo Chrome, Edge i Opera na računalu. Drugdje se opcija sama objašnjava, a ručni izvoz iz prozora zapisnika ostaje dostupan. Preglednik datoteku može samo zamijeniti, nikada nadopisati, pa bi alat koji čita .pdb trebao ponovno otvoriti datoteku nakon svake promjene.' },
        { id: 'assist', t: 'Pomoćnik (snaga ruke)',
          b: ['Na vrhu kartice Izgledi traka pomoćnika čita tvoju ruku umjesto tebe. Prije flopa imenuje tvoju početnu ruku i ocjenjuje je zvjezdicama; od flopa nadalje prikazuje tvoju trenutnu najbolju kombinaciju i, nakon brze simulacije, procijenjenu vjerojatnost da dobiješ ruku u postocima, s indikatorom u boji od crvene (slaba) do zelene (jaka). Kao i monitor vjerojatnosti, koristi samo informacije koje možeš vidjeti.',
              'Dva stila prikaza nalaze se u Napredne opcije \u2192 Mjesta: Segmenti (deset blokova) ili klasična traka napretka. Cijeli se pomoćnik može isključiti u Napredne opcije \u2192 Pomoćnik.'] },
        { id: 'assistwin', t: 'Pomoćnik kao plutajući widget',
          b: ['Blok pomoćnika može se otkinuti od ploče u vlastiti prozorčić koji je uvijek na vrhu: upotrijebi gumb za otkidanje na bloku, zatim ga pomiči i mijenjaj mu veličinu gdje god želiš iznad stola — praktično za praćenje snage ruke bez otvorene cijele ploče. Gumb za usidravanje vraća ga u karticu Izgledi, a položaj se pamti. Unutar ploče ručka za povlačenje između Pomoćnika i izgleda omogućuje da rasporediš prostor između njih.'] },
        { id: 'stats', t: 'Statistike',
          b: ['Kartica Statistike prati tvoju sesiju: odigrane ruke, viđene flopove, showdowne, postotke pobjeda i još. Praćenje statistika može se isključiti u Naprednim opcijama.'] },
        { id: 'hud', t: 'HUD sa statistikama uz mjesta (beta)',
          b: ['HUD uz mjesto svakog igrača pričvršćuje malu statističku kutiju, izgrađenu od ruku snimljenih u tvojim zapisnicima: broj promatranih ruku, zatim VPIP (koliko često dobrovoljno ulaže novac pre-flop), PFR (pre-flop povišenja), AF (faktor agresivnosti), 3B (3-bet), CB (continuation bet) i F3B (fold na 3-bet), s bojama od pasivnog do agresivnog. Dodirni kutiju za detaljni skočni prozor s više brojki (pokušaji steala, fold na steal, postoci showdowna\u2026), i povuci je ako nešto zaklanja.',
              'HUD zna samo ono što si vidio za vlastitim stolovima — čita tvoje lokalne dnevnike ruku, pa snimanje mora biti uključeno, a brojke dobivaju smisao tek nakon dovoljno ruku. To je beta funkcija, isključena prema zadanim postavkama: uključi je u Napredne opcije \u2192 Pomoćnik.'] },
        { id: 'handsbtn', t: 'Pregled kombinacija',
          b: ['Ikona pokerskih ruku na suknu u svakom trenutku otvara brzi pregled 10 kombinacija — praktično dok učiš. Može se sakriti u Naprednim opcijama.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat i društvene funkcije',
      sections: [
        { id: 'panels', t: 'Chat predvorja i chat stola',
          b: ['Jedan chat je u predvorju, drugi za stolom. Na telefonu chat stola lebdi iznad igre; na većim zaslonima to je pomični prozor promjenjive veličine. Značka na gumbu chata broji nepročitane poruke.'] },
        { id: 'typing', t: 'Pomoć pri tipkanju',
          list: [
            'Tab dovršava nadimak — pritisni Tab ponovno za kretanje kroz podudaranja.',
            '\u2191 / \u2193 listaju povijest tvojih poruka.',
            'Gumb za emojije otvara potpuni birač; tipkanje : također predlaže emote dok pišeš.'] },
        { id: 'emotes', t: 'Emote i smajlići',
          b: ['Chat pretvara kodove emotea točno kao službeni desktop klijent: napiši ime između dvije dvotočke i ono postaje emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 podržano je više od 1 900 kodova (kompletan GitHubov skup). Pretvaraju se i klasični tekstualni smajlići: :-) ;) :D xD :P <3 i osamdesetak drugih.',
              'Tipkanje : otvara okvir s prijedlozima koji dovršava kod dok pišeš (\u2191/\u2193 za odabir, Tab ili Enter za potvrdu). Pretvorba emojija može se potpuno isključiti u Napredne opcije \u2192 Chat.'] },
        { id: 'commands', t: 'Naredbe chata',
          b: ['Chat razumije naredbe s kosom crtom. Dvije su vidljive drugima:'],
          keys: [
            ['/me <tekst>', 'Poruka akcije, prikazuje se kao \u201e* tvojnadimak tekst\u201c'],
            ['/emoji <emoji>', 'Reproducira emoji reakciju (istu koju šalje birač reakcija)']] },
        { id: 'diagcmds', t: 'Dijagnostičke naredbe',
          b: ['Sve ostalo je lokalno: odgovore vidiš samo ti i ništa se ne šalje stolu. Utipkaj /help za popis svih. Najkorisnije:'],
          keys: [
            ['/help', 'Popis svih naredbi'],
            ['/update', 'Provjeri novu verziju i osvježi'],
            ['/lang <kod>', 'Promijeni jezik (npr. /lang hr)'],
            ['/sound on|off', 'Uključi/utišaj zvukove igre'],
            ['/zoom', 'Uključi/isključi povećalo stola'],
            ['/clear', 'Lokalno očisti chat'],
            ['/table', 'Podaci o trenutnoj partiji (blindovi, igrači, stackovi)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Dijagnostika stanja klijenta, mreže i glatkoće'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Napredno otklanjanje pogrešaka (karte, protokol, zvuk, pohrana, mjesta)'],
            ['/copy', 'Kopiraj zadnji odgovor naredbe u međuspremnik']] },
        { id: 'reactions', t: 'Emoji reakcije',
          b: ['Gumb za reakcije otvara birač s 30 animiranih reakcija (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) koje se reproduciraju s efektom iznad tvog mjesta, vidljive cijelom stolu — uključujući igrače na desktop klijentu. Reakcije se mogu potpuno isključiti u Naprednim opcijama.'] },
        { id: 'translate', t: 'Razumij sve',
          b: ['S uključenim prijevodom razgovora gumb za prijevod pojavljuje se u retku ispod pokazivača — ili u retku koji dodirneš na dodirnom zaslonu — i prikazuje poruku na tvom jeziku pomoću prevoditelja preglednika. Može se trajno prikazivati u svim recima u Napredne opcije → Razgovor, gdje živi i savjet koji objašnjava uobičajene kratice za stolom (gg, nh, utg…).'],
          note: 'Prijevod koristi uslugu Google Translate i radi u svakom pregledniku — potrebna je samo internetska veza. Poruka se šalje usluzi prijevoda tek kad dodirneš njezin gumb za prijevod, nikad automatski.' },
        { id: 'social', t: 'Igrači: profil, pozivanje, ignoriranje',
          b: ['Dodirni bilo kojeg igrača — za stolom ili na popisu predvorja — da otvoriš njegovu karticu: profil i statistike, pozivanje u svoju partiju ili ignoriranje (njegove poruke u chatu se sakrivaju; ignoriranje je uvijek opozivo). Potvrda prije pozivanja/ignoriranja može se uključiti u opcijama.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Predvorje i partije',
      sections: [
        { id: 'list', t: 'Popis partija',
          b: ['Predvorje navodi sve stolove poslužitelja. Svaki redak prikazuje broj igrača, vrstu partije, lokot kad je potrebna lozinka ili pozivnica, i značku stanja: \u201eČeka se\u201c (zelena — partija nije počela, možeš ući ako ima slobodnog mjesta), \u201eU tijeku\u201c (topla boja — može se gledati uživo kad su gledatelji dopušteni) i \u201eZatvorena\u201c (prigušena). Pun stol prepoznaje se jednostavno po punom brojaču, npr. 10/10; boje značaka prate aktivnu temu.',
              'Padajući filtar sužava popis točno kao desktop klijent, pri čemu je svaki izbor stroži od prethodnog: samo otvorene partije \u2192 skrivajući i pune stolove \u2192 zatim samo ne-privatne, samo privatne ili samo rangirane partije. Tvoj se izbor pamti. Polje za pretraživanje pronalazi partiju po imenu, a značka igrača otvara popis svih prisutnih, s pretraživanjem i sortiranjem.'] },
        { id: 'join', t: 'Ulazak i gledanje',
          b: ['Odaberi otvorenu partiju i uđi — lokot znači da je potrebna lozinka. Partije u tijeku koje dopuštaju gledatelje mogu se gledati uživo: vidiš stol i chat, ali zatvorene karte ostaju skrivene i ne možeš djelovati.'] },
        { id: 'gameinfo', t: 'Podaci o partiji',
          b: ['Prije ulaska kartica s podacima o partiji prikazuje sve što definira stol: vrstu partije, blindove i njihov rast (udvostručenje ili ručni popis), početni stack, vrijeme za akciju, stanku između ruku i tko već sjedi.'] },
        { id: 'create', t: 'Stvori partiju',
          b: ['Stvori vlastiti stol: ime, broj igrača, početni stack, prvi small blind i raspored povišenja, vrijeme za akciju i jesu li gledatelji dopušteni. Postoje četiri vrste partija: Normalna (svi), samo registrirani igrači, samo na pozivnicu i Rangirana (računa se za službenu ljestvicu — bez moguće lozinke u tom slučaju). Omiljene postavke možeš spremiti i ponovno učitati.'] },
        { id: 'invites', t: 'Pozivnice',
          b: ['Igrači te mogu pozvati za svoj stol; dobivaš obavijest koju možeš prihvatiti ili odbiti. Biti pozvan jedini je način ulaska u partiju samo na pozivnicu.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Tvoj račun',
          b: ['Službeni internetski poslužitelj je pokerth.net. Igranje ondje zahtijeva besplatan pokerth.net račun — registriraj se na stranici, zatim se ovdje prijavi istim nadimkom i lozinkom. Ovaj web klijent spaja se na potpuno isti poslužitelj kao desktop klijent: isti računi, isti stolovi, iste ljestvice, i možeš sjesti za stol s igračima desktop klijenta.'] },
        { id: 'ranked', t: 'Rangirane partije i sezone',
          b: ['Partije vrste Rangirana računaju se za službenu sezonsku ljestvicu. Tvoj profil u aplikaciji prikazuje datum registracije, tvoj Rank tekuće sezone, tvoj Score, prosjek i odigrane partije, plus posljednje rezultate. Normalne (nerangirane) partije samo su za zabavu i ništa ne mijenjaju.'] },
        { id: 'rankhow', t: 'Kako se računa ljestvica',
          b: ['U svakoj rangiranoj partiji tvoje mjesto donosi bodove: 15 za prvo, zatim 9, 6, 4, 3, 2 i 1 do sedmog; od osmog do desetog ništa. Stol dakle dijeli ukupno 40 bodova.',
              'Tvoj Score nije zbroj tih bodova, nego tvoj prosjek po partiji, ublažen koeficijentom koji raste s brojem odigranih partija: nekoliko dobrih rezultata nije dovoljno da se zadržiš na vrhu, treba i redovitost — što više igraš, to je tvoj Score bliži tvom stvarnom prosjeku. Sezona traje tromjesečje: pri promjeni sve se arhivira, a brojači kreću od nule, dok prošle sezone ostaju dostupne. U igri gumb s postoljem prikazuje sezonski poredak igrača za tvojim stolom.'],
          note: 'Bodovnu ljestvicu i točnu formulu određuje poslužitelj ljestvice pokerth.net i mogu se mijenjati; mjerodavne su stranice web-mjesta.' },
        { id: 'rankings', t: 'Stranice ljestvica',
          b: ['Stavka ljestvica otvara službenu PokerTH ljestvicu s pretraživanjem po igraču, kao i ljestvice zajednice (BBC, WEC). Ako te ljestvice ne zanimaju, stavka se može sakriti u Napredne opcije \u2192 Zajednica.'] },
        { id: 'cups', t: 'Kupovi zajednice: BBC i WeCup',
          b: ['Dvije zajednice na pokerth.netu vode vlastita natjecanja, svaka sa svojim web-mjestom i vlastitom ljestvicom. Best Brainies Cup (BBC) stepenasti je turnir nastao 2013.: napreduje se od Step 1 do Step 4, a nova sezona počinje nakon svake partije Step 4, kad se dodijeli pehar. WeCup (WEC) ima vlastitu, znatno razvučeniju ljestvicu — 75 bodova za prvo mjesto, zatim 45, 30, 20… — a njegov score normalizira tvoj prosjek prema broju partija koje si odigrao u usporedbi s ostalim članovima.',
              'Obje se ljestvice otvaraju gumbom pehara, pokraj ljestvice PokerTH. Postavke stolova tih natjecanja dolaze kao predlošci pri stvaranju partije (BBC Step 1 do 4, WEC, WEC Monthly Final i WEC Grand Final), pa možeš vježbati u istim uvjetima. Sudjelovanje traži prijavu na web-mjestu dotičnog kupa.'],
          note: 'Ako te kupovi ne zanimaju, ovaj sadržaj sakriješ odjednom u Napredne opcije → Zajednica.' },
        { id: 'forumcups', t: 'Kupovi foruma i događaji',
          b: ['Forum pokerth.neta ugošćuje i Monthly Cup, mjesečnu seriju u kojoj se igrači raspoređuju za stolove Gold, Silver i Bronze prije nego što se okruni prvak mjeseca, uz pojedinačne posebne kupove tijekom godine.',
              'Prijave, termini, postavke stolova i rezultati objavljuju se na forumu, a partije se igraju na službenom poslužitelju kao i sve druge. Za praćenje rezultata dovoljan je pokerth.net račun; prijava na kup ide preko odgovarajuće teme na forumu.'] },
        { id: 'avatars', t: 'Avatari i zastave',
          b: ['Na pokerth.net tvoj se avatar distribuira drugim igračima preko avatar-poslužitelja, a mala zastava zemlje može se prikazivati na kutijama igrača. Oboje je neobavezno i podesivo u opcijama.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Trening način',
      sections: [
        { id: 'what', t: 'Što je to',
          b: ['Način Lokalno / trening potpuna je partija protiv protivnika kojima upravlja računalo: bez veze, bez računa, ništa na kocki. Nakon što je aplikacija instalirana (ili samo jednom posjećena), radi potpuno offline — savršeno za učenje igre, isprobavanje sučelja ili kraćenje vremena u zrakoplovnom načinu.'] },
        { id: 'setup', t: 'Postavi partiju',
          b: ['Odaberi broj protivnika, početni stack, blindove i njihov rast te brzinu igre. Sastav i težina botova podešavaju se u Napredne opcije \u2192 Lokalna partija — od blagih protivnika do tvrđeg i raznolikijeg stola.'] },
        { id: 'trophies', t: 'Trofeji',
          b: ['Trening način ima vlastiti napredak: 28 trofeja u šest kategorija (napredak, tehnika, stil, formati, zabava i jedna tajna) otključava se igranjem — odigrane ruke, dobivene partije, veliki blefovi, posebne ruke i još. Napredak trofeja je kumulativan i spaja se između uređaja kad je sinkronizacija postavki računa aktivna.'] },
        { id: 'learn', t: 'Dobro mjesto za učenje',
          b: ['Sve opisano u drugim poglavljima radi i ovdje: monitor vjerojatnosti, prikaz pomoćnika, predodabir, tipkovnički prečaci. Trening način najbolje je mjesto da ih isprobaš bez pritiska prije nego se baciš na pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stil i zvuk',
      sections: [
        { id: 'themes', t: 'Teme',
          b: ['Kategorija Stil u Naprednim opcijama odijeva cijeli klijent. Predlošci postavljaju sve jednim dodirom (klasični zeleni casino, službeni izgled PokerTH-a\u2026); ispod, pojedinačne osi zasebno podešavaju paletu boja, sukno stola i lica karata — promijeni bilo koju os i tvoja kombinacija postaje prilagođena tema. Tamni, svijetli ili automatski način bira se u Korisničkom sučelju, a tvoji izbori vrijede odmah, na svakom zaslonu, i pamte se.'] },
        { id: 'tablelook', t: 'Stolovi, špilovi, mjesta',
          b: ['Osim teme, više elemenata mijenja se neovisno: pozadina stola, špil karata, poleđina karata (automatski usklađena sa špilom, ili uvezi vlastitu sliku), žetoni dealera i blindova, stil gumba akcija te potpuni paketi mjesta koji preodijevaju kutije igrača. Sve odaberi u Napredne opcije \u2192 Stil; promjene su odmah vidljive za stolom.'] },
        { id: 'music', t: 'Glazbeni player',
          b: ['Stavka glazbe u izbornicima zaglavlja otvara mali player ambijentalne glazbe: odaberi pjesmu s popisa, reprodukcija/pauza, prethodna/sljedeća, nasumično te ponavljanje jedne pjesme, cijelog popisa ili ničega. Glasnoća, odabrana pjesma i način ponavljanja pamte se. Reprodukcija nikad ne počinje sama — preglednici zahtijevaju dodir — a player je potpuno neovisan o zvučnim efektima igre.'] },
        { id: 'sounds', t: 'Zvučni efekti',
          b: ['Zvukovi igre grupirani su u četiri kategorije s odvojenim uključivanjem, točno kao u desktop klijentu: akcije igre (podijeljene karte, Check, Call, Raise, tvoj potez\u2026), obavijest chata predvorja, obavijesti mrežne partije (igrač se spojio, partija spremna) i obavijest o rastu blindova. Jedan klizač glasnoće upravlja svima, u Napredne opcije \u2192 Zvuk.'],
          note: 'Svi preglednici — posebno iOS — odbijaju reproducirati zvuk prije nego jednom dodirneš stranicu. Ako partija počne u tišini, jedan dodir bilo gdje budi zvuk; klijent također automatski popravlja audio motor kad ga iOS suspendira (dolazni poziv, pozadina\u2026).' },
        { id: 'voice', t: 'Glas i vibracija',
          b: ['Dva dodatna kanala mogu te držati informiranim bez gledanja u zaslon: glasovne najave naglas čitaju događaje igre putem govorne sinteze tvog uređaja, a na telefonu kratka vibracija može označiti tvoj potez. Oboje su web proširenja, uključena ili ne prema zadanim postavkama ovisno o uređaju, u Napredne opcije \u2192 Oklade i potez.'],
          note: 'Vibracija radi na Androidu (Chromium preglednici); Apple ne izlaže API vibracije web stranicama, pa iPhonei ne mogu vibrirati. Glasovne najave rade posvuda, ali dostupni glasovi i jezici ovise o tvom sustavu — klijent koristi najbolje podudaranje koje pronađe.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opcije i prečaci',
      sections: [
        { id: 'where', t: 'Gdje opcije žive',
          b: ['Napredne opcije otvaraju se stavkom sa zupčanikom u bilo kojem izborniku zaglavlja. Grupirane su kao u desktop klijentu: Korisničko sučelje, Stil, Zvuk, Lokalna partija, Mrežna partija, Internetska partija, Nadimci / Avatari, Poruke zapisnika i Vrati zadano. Svaka funkcija specifična za web ondje ima vlastiti prekidač, pa možeš isključiti sve što ne koristiš.'] },
        { id: 'cfgxml', t: 'Razmjena postavki s desktop klijentom',
          b: ['Tvoje postavke mogu putovati između klijenata: kategorija Poruke zapisnika nudi izvoz/uvoz službene datoteke config.xml (onog \u007e/.pokerth/config.xml koji koriste desktop i QML klijenti). Izvoz zapisuje dijeljene postavke — ime, opcije prikaza, zvukove, preferencije stola, blindove, stilove — a uvoz ovdje primjenjuje datoteku s računala. Postavke koje ovaj klijent ne poznaje ostaju netaknute u datoteci.'] },
        { id: 'sync', t: 'Postavke koje te prate',
          b: ['Kad igraš s računom, tvoje opcije, tema, tipkovničke veze, jezik i trening trofeji sinkroniziraju se: promijeni nešto na jednom uređaju i sljedeći uređaj na kojem se prijaviš to preuzima. Napredak trofeja se spaja, nikad ne prepisuje, pa igranje na dva uređaja uvijek zadržava najbolje od oba.'] },
        { id: 'updates', t: 'Ostani ažuran',
          b: ['Klijent se ažurira sam: kad izađe nova verzija, natpis te poziva da osvježiš (ili utipkaj /update u chat za ručnu provjeru). S vremena na vrijeme može se pojaviti mala anketa o proizvodu koja pita tvoje mišljenje o nekoj funkciji — sudjelovanje je dobrovoljno, a ankete se mogu potpuno isključiti u Napredne opcije \u2192 Zajednica.'] },
        { id: 'fkeys', t: 'Službeni tipkovnički prečaci',
          b: ['Slu\u017ebene funkcijske tipke PokerTH-a rade tijekom igre \u2014 Alt+S radi svugdje:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (redoslijed se može obrnuti u opcijama)'],
            ['F5', 'Pokaži svoje karte (kad je moguće)'],
            ['F6 / F7 / F8', 'Ručni \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Ručni \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Dnevnik \u00b7 Ploča izgleda'],
            ['Alt+S', 'Postavke — bilo gdje u aplikaciji, ne samo u igri'],
            ['F11', 'Puni zaslon']],
          note: 'Prečaci zahtijevaju fizičku tipkovnicu. Na Macu tipke F prema zadanim postavkama upravljaju multimedijom: drži Fn (ili u postavkama macOS-a uključi \u201eKoristi tipke F1, F2 itd. kao standardne funkcijske tipke\u201c). Na iPhoneu je puni zaslon ograničen iOS-om — instaliranje aplikacije kao PWA daje isto iskustvo punog zaslona.' },
        { id: 'webkeys', t: 'Web slovne tipke',
          b: ['Web proširenje: jednoslovne tipke i Alt+T također pokreću radnje, a sve se mogu preraspodijeliti u Napredne opcije → Tipkovni prečaci:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Ploča statistike'],
            ['Esc', 'Zatvori prednji prozor (i gumb Natrag na Androidu)']],
          note: 'Na Androidu sustavski gumb/gesta Natrag zatvara prozore poput Esc, umjesto da napusti partiju (podesivo u opcijama). iOS nema ekvivalentan sustavski gumb — koristi \u2715 svakog prozora.' }
      ]
    }
  ]
};
