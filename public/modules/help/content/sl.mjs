// ── help/content/sl.mjs — Slovenian help corpus ─────────────────────────────
//
// Structure: chapters[] → { id, icon, title, sections[] }.
// Section: { id, t (title), b (paragraphs[]), list (bullets[]), keys ([kbd,
// label][]) }. Plain text only — the renderer escapes everything.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) stay in English,
// as everywhere else in this client.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Prvi koraki',
      sections: [
        { id: 'modes', t: 'Trije načini igranja',
          b: ['Na prijavnem zaslonu izberi, kako želiš igrati.'],
          list: [
            'Splet — igraj na spletu na uradnem strežniku pokerth.net, z uvrstitvami. Potreben je račun pokerth.net; registriraj se brezplačno na pokerth.net.',
            'Lokalno / vadba — igraj brez povezave proti botom. Ničesar ni treba nastavljati, deluje brez povezave in odklepa trofeje, kako napreduješ.',
            'LAN / lastni strežnik — poveži se z zasebnim strežnikom PokerTH na tvojem lokalnem omrežju ali tvojem računalniku.'] },
        { id: 'lan', t: 'LAN / lastni strežnik',
          b: ['Tretji način se poveže s katerim koli strežnikom PokerTH, ki ga poganjaš ti ali prijatelj — na domačem omrežju, zasebnem VPS-ju, kjer koli. Vnesi naslov in vrata strežnika, obkljukaj TLS, če strežnik uporablja šifrirana vrata, in se prijavi z vzdevkom (gostujoč dostop deluje, če ga strežnik dovoljuje). Vse pri mizi se nato obnaša popolnoma enako kot na uradnem strežniku.'] },
        { id: 'famboard', t: 'Družinska lestvica',
          b: ['Samo na zasebnih strežnikih in LAN igrah odjemalec vodi statistiko za celotno obdobje po vzdevku — odigranih in dobljenih rok in iger, največjo zmago, najboljši niz — in jo deli prek strežnika, tako da vsaka naprava pri mizi vidi isto lestvico. Igre pokerth.net na ta način nikoli niso beležene, statistika vadbenega načina pa je vodena povsem ločeno.', 'V teh igrah gumb s trofejo odpre okno uvrstitve na zavihku LAN: vsi igralci, razvrstljivi po več merilih.'] },
        { id: 'language', t: 'Jezik',
          b: ['Vmesnik je na voljo v 48 jezikih. Spremeniš ga lahko kadar koli v Naprednih možnostih (meni z zobnikom) pod Uporabniški vmesnik. Pokrski izrazi za poteze (Fold, Check, Call, Bet, Raise, All-In) po dogovoru ostanejo v angleščini, tako kot pri namiznem odjemalcu.'] },
        { id: 'pwa', t: 'Namesti kot aplikacijo',
          b: ['Ta odjemalec je progresivna spletna aplikacija (PWA): namestiš jo lahko iz menija brskalnika (ali z gumbom za namestitev v glavi), da dobiš celozaslonsko aplikacijo z lastno ikono. Ko je nameščena, se zažene takoj, vadbeni način pa deluje popolnoma brez povezave.'],
          note: 'Na Androidu in namiznih Chrome/Edge gumb za namestitev poskrbi za vse. Na iPhone/iPad Apple dovoljuje namestitev samo prek Safarija: gumb Deli → »Dodaj na domači zaslon« — odjemalec te korake prikaže, ko je potrebno. Gumb izgine, ko je aplikacija nameščena.' },
        { id: 'platforms', t: 'Platforme in brskalniki',
          b: ['Odjemalec deluje v vsakem sodobnem brskalniku na vsakem sistemu — Windows, macOS, Linux, Android, iOS. Nekatere funkcije se zanašajo na novejše API-je brskalnika; kadar API manjka, se funkcija skrije ali pojasni zakaj, namesto da bi se pokvarila. Glavne razlike, ki jih velja poznati:'],
          list: [
            'Chrome / Edge (namizje): vse deluje, vključno z zapisovanjem dnevnika .pdb v mapo.',
            'Firefox: vse razen zapisovanja dnevnika .pdb v mapo (API še ni na voljo).',
            'Safari / iOS: namestitev poteka prek Deli → Dodaj na domači zaslon; brez vibriranja; celozaslonski način je na iPhone omejen; zvok se zažene po tvojem prvem dotiku.',
            'Android: polna podpora v brskalnikih Chromium, vključno z vibriranjem in obnašanjem gumba Nazaj.'] },
        { id: 'avatar', t: 'Vzdevek in avatar',
          b: ['Izberi svoj vzdevek in avatar na prijavnem zaslonu, preden se povežeš. Na pokerth.net je tvoj vzdevek ime tvojega računa; avatarji so deljeni z drugimi igralci prek strežnika za avatarje.', 'Tvoj avatar je poslan, ko se povežeš, in vsi igralci vidijo isti avatar. Če ga spremeniš, ko si povezan, nov avatar velja od naslednje povezave dalje. Začetnica (Aa) ni poslana: drugi igralci vidijo privzeti avatar.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pravila pokra',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em na kratko',
          b: ['PokerTH igra No-Limit Texas Hold\u2019em. Vsak igralec dobi dve zasebni karti (hole cards). Nato se na sredini mize odkrito razdeli pet skupnih kart. Zmaga najboljša petkartna kombinacija, sestavljena iz katere koli mešanice tvojih dveh kart in petih skupnih kart.'] },
        { id: 'blinds', t: 'Blindi in gumb delivca',
          b: ['Pred vsako roko dve prisilni stavi zapolnita banko: mali blind in veliki blind, ki ju postavita dva igralca levo od gumba delivca. Gumb se po vsaki roki premakne za eno mesto v smeri urinega kazalca, tako da vsi po vrsti plačujejo blinde. Blindi se v rednih presledkih zvišujejo, kako igra napreduje.',
              'Na mizi so gumb in blindi označeni z žetoni: D (delivec), SB (mali blind), BB (veliki blind).'] },
        { id: 'streets', t: 'Štirje krogi stav',
          list: [
            'Pred flopom — po delitvi zasebnih kart se prvi krog stav začne levo od velikega blinda.',
            'Flop — razkrijejo se tri skupne karte, sledi krog stav.',
            'Turn — četrta skupna karta, nato še en krog stav.',
            'River — peta in zadnja skupna karta, nato zadnji krog stav.'],
          b: ['Krog stav se konča, ko so vsi igralci, ki so še v roki, vložili enak znesek (ali so all-in).'] },
        { id: 'actions', t: 'Kaj lahko narediš na svoji potezi',
          list: [
            'Fold — odstopi od roke. Tvoje karte gredo v odpad in se ne poteguješ več za banko.',
            'Check — mimo brez stave. Mogoče je samo, ko ni ničesar za plačati.',
            'Call — izenačiš trenutno stavo.',
            'Bet — odpreš stavo, ko na tem krogu še nihče ni stavil.',
            'Raise — zvišaš obstoječo stavo. Najmanjše zvišanje je enako prejšnji stavi ali zvišanju.',
            'All-In — vložiš vse svoje žetone. V roki ostaneš do zneska, ki si ga pokril.'] },
        { id: 'showdown', t: 'Razkritje in deljene banke',
          b: ['Če po krogu stav na riverju ostane več kot en igralec, se karte razkrijejo in zmaga najboljša roka — zmagovalna kombinacija je prikazana pod skupnimi kartami. Ko je igralec all-in za manj kot polno stavo, nastanejo stranske banke: vsak igralec lahko zmaga samo del banke, h kateremu je prispeval. Enake roke si banko delijo.',
            'Ni nujno, da vsi razkrijejo karte: začenši pri zadnjem igralcu, ki je stavil ali zvišal, se roka razkrije samo, če premaga to, kar je že na mizi. Kdor ima pravico do odpada, lahko karte obdrži skrite in dobi gumb Show, da jih vseeno razkrije.'] },
        { id: 'hands', t: 'Uvrstitve rok',
          b: ['Od najšibkejše do najmočnejše:'],
          list: [
            '1. Visoka karta — brez kombinacije; odloča najvišja karta.',
            '2. Par — dve karti iste vrednosti.',
            '3. Dva para — dva različna para.',
            '4. Trojka — tri karte iste vrednosti.',
            '5. Straight — pet zaporednih kart (as šteje visoko ali nizko).',
            '6. Flush — pet kart iste barve.',
            '7. Full House — trojka plus par.',
            '8. Kare — štiri karte iste vrednosti.',
            '9. Straight Flush — straight v eni sami barvi.',
            '10. Royal Flush — od desetke do asa, vse v eni barvi. Najboljša možna roka.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Zaslon igre',
      sections: [
        { id: 'actionbar', t: 'Vrstica potez',
          b: ['Ko si na vrsti, se spodnja vrstica potez osvetli z do štirimi gumbi: Fold (rdeč), Check / Call (moder), Bet / Raise (zelen — poudarjena glavna poteza) in All-In (temno rdeč). Gumb Check / Call prikaže natančen znesek za plačilo; Bet / Raise pa znesek, ki ga boš vložil. Po riverju se lahko All-In spremeni v gumb Show za razkritje kart.'] },
        { id: 'betctl', t: 'Izbira zneska stave',
          b: ['Znesek zvišanja nastaviš s številčnim poljem, drsnikom ali hitrimi gumbi 1/3 · 1/2 · Pot (deleži trenutne banke). Zneski se samodejno zaokrožijo in ostanejo med najmanjšim in največjim dovoljenim zvišanjem. Če raje razmišljaš v velikih blindih, možnost prikaže vse zneske v BB namesto v žetonih.'] },
        { id: 'preselect', t: 'Vnaprejšnja izbira poteze',
          b: ['Pred svojo potezo lahko potezo pripraviš vnaprej: tapni gumb in dobi zlat rob z majhno zlato piko. Ko prideš na vrsto, se poteza izvede takoj. Vnaprej pripravljen Fold samodejno postane Check, ko je check brezplačen — nikoli ne zložiš zaman. Vnaprejšnje izbire se ponastavijo ob vsaki novi roki, spremembi kroga in razkritju ter se prekličejo, če se razmere spremenijo (na primer, če se znesek za plačilo spremeni).'] },
        { id: 'automodes', t: 'Samodejni načini',
          b: ['Spustni meni ob gumbih potez ponuja tri načine igranja: Ročno, Samodejni Check/Call in Samodejni Check/Fold. Samodejni načini igrajo namesto tebe, dokler ne preklopiš nazaj — vsak ročni klik na potezo takoj vrne v Ročni način.'] },
        { id: 'readtable', t: 'Branje mize',
          b: ['Vsako polje igralca prikazuje avatar, ime, žetone in trenutno stavo. Delivec in blindi so označeni z žetoni D / SB / BB. Barvna značka na polju prikazuje igralčevo zadnjo potezo; tanka modra vrstica odšteva njegov čas za razmislek. Polje igralca, ki je na vrsti, žari; tvoje lastno polje na tvoji potezi dobi utripajoč zlat okvir.',
              'Vrstica stanja nad mizo prikazuje skupno banko, stave trenutnega kroga, fazo (Pred flopom, Flop, Turn, River) ter številke igre in roke. Zloženi igralci imajo prosojne karte; izločeni igralci so zatemnjeni. Na koncu roke lahko okno zmagovalca povzame, kdo je kaj dobil — v nastavitvah ga je mogoče izklopiti.'] },
        { id: 'seatlayout', t: 'Razporeditev mest',
          b: ['Kot spletna dodatnost je razporeditev polj igralcev mogoče izbrati v Naprednih možnostih → Mesta: Samodejno sledi uradnemu odjemalcu (fiksna mesta pokončno, izračunana elipsa ležeče), ali vsili razporeditev Pokončno ali Ležeče — Po meri pa ti omogoči, da vsako mesto postaviš sam: pojavi se način urejanja, kjer vsako polje povlečeš natanko tja, kamor želiš, razporeditev pa se shrani.'] },
        { id: 'zoom', t: 'Povečava mize (telefoni)',
          b: ['Na majhnih zaslonih gumbi za povečevalo povečajo mizo (2×), premikaš pa se lahko s prstom — tvoje polje in vrstica potez ostaneta fiksna. Pogled samodejno sledi aktivnemu mestu in se ob razkritju znova pomanjša za pregled. To je mogoče izklopiti v Naprednih možnostih.'],
          note: 'Na telefonih in tablicah je lastno ščipanje za povečavo brskalnika privzeto blokirano, tako da povečava po nesreči nikoli ne sproži sredi roke; znova jo omogočiš v Naprednih možnostih → Uporabniški vmesnik, če ti je ljubše.' },
        { id: 'protections', t: 'Zaščita pred pokukanjem in nenamernim klicem',
          b: ['Dve neobvezni zaščiti: Zaščita pred pokukanjem skrije tvoje karte, dokler jih ne tapneš (uporabno, kadar nekdo lahko vidi tvoj zaslon), zaščita pred nenamernim klicem pa za kratek čas blokira gumb Call takoj po veliki zvišani stavi, tako da tap, namenjen manjšemu klicu, po nesreči ne zadene zvišanega zneska. Obe se nahajata v Naprednih možnostih.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Informacijska plošča',
      sections: [
        { id: 'open', t: 'Odpiranje plošče',
          b: ['Med igro se informacijska plošča odpre iz glave (ali Alt+L / Alt+I) in ima tri zavihke: Dnevnik, Kvote in Statistika. Na telefonih lebdi nad mizo; na večjih zaslonih je premakljivo, velikost spremenljivo okno — zgrabi ročaj \u28ff za premik, robove za spremembo velikosti. Njegov položaj si zapomni.'] },
        { id: 'log', t: 'Dnevnik igre',
          b: ['Zavihek Dnevnik beleži celotno igro roka za roko: blinde, vsako potezo z zneski, razkrite karte in zmagovalce, barvno kodirano za hitro branje. Gumb za izvoz shrani dnevnik kot datoteko, če želiš sejo pregledati pozneje.'] },
        { id: 'odds', t: 'Kvote (nadzor kvot)',
          b: ['Zavihek Kvote za tvojo trenutno roko prikazuje sprotno verjetnost, da boš zaključil z vsako od 10 kategorij rok — od Visoke karte do Royal Flusha — vsako s svojo ikono, odstotkom in vrstico. Prikaz posivi, ko zložiš. Uporablja samo tvoje lastne karte in skupne karte: ne vidi ničesar, česar tvoji nasprotniki ne pokažejo.'] },
        { id: 'journal', t: 'Dnevniki rok in okno Dnevniki',
          b: ['Poleg sprotnega dnevnika je vsaka odigrana roka lokalno zabeležena v tvojem brskalniku, v enaki obliki kot datoteke dnevnika .pdb uradnega odjemalca. Okno Dnevniki (Napredne možnosti → Dnevniška sporočila → Upravljaj dnevnike…) prikaže tvoje seje in ti omogoča delo z njimi: predogled seje z iskanjem in poudarjanjem, filtriranje po igri, izvoz kot HTML ali navadno besedilo, shranjevanje surove datoteke .pdb ali uvoz datoteke .pdb, posnete z namiznim odjemalcem. Seje lahko izbrišeš eno po eno ali vse hkrati (s potrditvijo), samodejna nastavitev hranjenja pa lahko ohrani samo zadnjih 7, 30, 90, 180 ali 365 dni. Dnevniki, ki jih uvoziš sam, se nikoli ne izbrišejo samodejno. Druga nastavitev omeji, koliko sej se hrani, stolpec seznama pa lahko razširiš z vlečenjem.',
              'Za hkratno čiščenje več sej gumb Izberi… spremeni seznam v potrditvena polja: odkljukaj tiste, ki jih želiš odstraniti, Izbriši pa po eni sami potrditvi odstrani celoten sveženj. Na računalniku lahko tudi Ctrl (⌘) + klikneš, da dodajaš seje eno po eno, ali Shift + klik za cel obseg.',
              'Gumb Analiziraj izvede analizo rok za sejo in lahko dnevnik pošlje storitvi za analizo pokerth.net. Vse ostane na tvoji napravi, razen če ga izrecno izvoziš ali naložiš.'] },
        { id: 'logopts', t: 'Nastavitve beleženja',
          b: ['V Naprednih možnostih → Dnevniška sporočila lahko beleženje vklopiš ali izklopiš in izbereš interval zapisovanja, z enakimi tremi nastavitvami kot namizni odjemalec: po vsaki potezi, po vsaki roki (privzeto) ali po vsaki igri. Druga možnost zapiše datoteko .pdb v mapo po tvoji izbiri in jo posodablja v tem intervalu, še enkrat pa tudi, ko zapustiš stran, tako da lahko drugo orodje igro spremlja v živo.'],
          note: 'Zapisovanje v lokalno mapo potrebuje File System Access API: samo namizni Chrome, Edge in Opera. Drugod možnost sama pojasni, ročni izvoz iz okna Dnevniki pa ostane na voljo. Brskalnik lahko datoteko samo nadomesti, nikoli ji ne more dodajati, zato mora orodje, ki bere .pdb, datoteko po vsaki spremembi znova odpreti.' },
        { id: 'assist', t: 'Pomoč (moč roke)',
          b: ['Na vrhu zavihka Kvote pasica pomoči prebere tvojo roko namesto tebe. Pred flopom poimenuje tvojo začetno roko in jo oceni z zvezdicami; od flopa dalje prikaže tvojo trenutno najboljšo kombinacijo in po hitri simulaciji tvojo ocenjeno možnost zmage v roki v odstotkih, z barvno lestvico od rdeče (šibko) do zelene (močno). Kot nadzor kvot uporablja samo informacije, ki jih lahko vidiš.',
              'V Naprednih možnostih → Mesta sta na voljo dva sloga prikaza: Segmenti (deset blokov) ali klasična vrstica napredka. Celotno funkcijo pomoči lahko izklopiš v Naprednih možnostih → Pomoč.'] },
        { id: 'assistwin', t: 'Pomoč kot plavajoč pripomoček',
          b: ['Blok pomoči lahko odpneš od plošče v svoje lastno majhno okno, ki je vedno na vrhu: uporabi gumb za odpenjanje na bloku, nato ga premakni in spremeni velikost kjer koli nad mizo — priročno za spremljanje moči svoje roke brez odprte celotne plošče. Gumb za pripenjanje ga vrne nazaj v zavihek Kvote, njegov položaj pa si zapomni. Znotraj plošče ročaj za vlečenje med Pomočjo in kvotami omogoča deljenje prostora med obema.'] },
        { id: 'stats', t: 'Statistika',
          b: ['Zavihek Statistika spremlja tvojo sejo: odigrane roke, videne flope, razkritja, delež zmag in več. Sledenje statistiki je mogoče izklopiti v Naprednih možnostih.'] },
        { id: 'hud', t: 'Statistični HUD na mestih',
          b: ['HUD ob vsakem mestu igralca priloži majhno polje s statistiko, zgrajeno iz rok, ki si jih zabeležil v svojih dnevnikih: število opazovanih rok, nato VPIP (kako pogosto prostovoljno vloži denar pred flopom), PFR (zvišanja pred flopom) in AF (faktor agresivnosti), barvno kodirano od pasivnega do agresivnega. Pod njimi značka igralca povzame z besedami — Trdno-pasiven, Ohlapno-agresiven in tako naprej — poleg majhnega kazalca, katerega osvetljen kvadrant bere od leve proti desni za trdno proti ohlapno in od spodaj navzgor za pasivno proti agresivno. Značka se prikaže že od prve roke, a ostane zatemnjena do 25 rok, ko postane zanesljiva. Tapni polje za podroben pojavni prikaz s celotnim naborom številk (3-bet, continuation bet, fold to 3-bet, poskusi kraje, deleži razkritij…), polje pa lahko povlečeš, če kaj prekriva.',
              'HUD pozna samo tisto, kar si videl pri svojih lastnih mizah — bere tvoje lokalne dnevnike rok, zato mora biti beleženje omogočeno, številke pa postanejo smiselne po dovolj rokah. Privzeto je izklopljen: omogočiš ga v Naprednih možnostih → Pomoč.'] },
        { id: 'handsbtn', t: 'Pregled kombinacij rok',
          b: ['Ikona pokrskih rok na suknu kadar koli odpre hiter pregled 10 kombinacij — priročno med učenjem. Skriješ jo lahko v Naprednih možnostih.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Klepet in druženje',
      sections: [
        { id: 'panels', t: 'Klepet predverja in klepet igre',
          b: ['Obstaja klepet v predverju in klepet pri mizi. Na telefonih klepet igre lebdi nad mizo; na večjih zaslonih je premakljivo, velikost spremenljivo okno. Značka na gumbu klepeta šteje neprebrana sporočila.'] },
        { id: 'typing', t: 'Pripomočki pri tipkanju',
          list: [
            'Tab dopolni vzdevek — znova pritisni Tab za kroženje med zadetki.',
            '↑ / ↓ brskata po zgodovini tvojih lastnih sporočil.',
            'Gumb za emoji odpre poln izbirnik; tipkanje : med tipkanjem prav tako predlaga smeške.'] },
        { id: 'emotes', t: 'Smeški in emojiji',
          b: ['Klepet pretvarja kratke kode za smeške natanko tako kot uradni namizni odjemalec: vpiši ime med dvopičjema in postane emoji — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… podprtih je več kot 1.900 kod (celoten nabor GitHub). Pretvorijo se tudi klasični besedilni smeški: :-) ;) :D xD :P <3 in približno osemdeset drugih.',
              'Tipkanje : odpre pojavni predlog, ki kodo dopolni med tipkanjem (↑/↓ za izbiro, Tab ali Enter za potrditev). Pretvorbo emojijev je mogoče popolnoma onemogočiti v Naprednih možnostih → Klepet.'] },
        { id: 'commands', t: 'Ukazi v klepetu',
          b: ['Klepet razume ukaze s poševnico. Dva sta vidna drugim:'],
          keys: [
            ['/me <besedilo>', 'Sporočilo o dejanju, prikazano kot »* tvojeime besedilo«'],
            ['/emoji <emoji>', 'Predvaja emoji reakcijo (kar pošlje izbirnik reakcij)']] },
        { id: 'diagcmds', t: 'Diagnostični ukazi',
          b: ['Vse ostalo je lokalno: odgovore vidiš samo ti, mizi se nič ne pošlje. Vtipkaj /help za seznam vseh. Najbolj uporabni:'],
          keys: [
            ['/help', 'Izpiše vse ukaze'],
            ['/update', 'Preveri novo različico in osveži'],
            ['/lang <koda>', 'Zamenja jezik (npr. /lang sl)'],
            ['/sound on|off', 'Vklopi/izklopi zvoke igre'],
            ['/zoom', 'Vklopi/izklopi povečevalo mize'],
            ['/clear', 'Lokalno počisti klepet'],
            ['/table', 'Informacije o trenutni igri (blindi, igralci, žetoni)'],
            ['/diag · /netdbg · /fps', 'Diagnostika stanja odjemalca, omrežja in hitrosti sličic'],
            ['/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg', 'Napredno razhroščevanje (karte, protokol, zvok, shramba, mesta)'],
            ['/copy', 'Kopira zadnji odgovor ukaza v odložišče']] },
        { id: 'privatemsg', t: 'Zasebna sporočila',
          b: ['Piši enemu igralcu, ne da bi celotno predverje bralo zraven. Kuverta ob imenu v seznamu igralcev odpre pogovor z njim; kuverta v glavi predverja znova odpre zadnjega. Pogovori se hranijo na tej napravi in so še vedno tam, ko se vrneš, tako da pogovor, nadaljevan čez več dni, nosi svojo lastno zgodovino — rdeče število na kuverti prikazuje, česa še nisi prebral, koš za smeti v naslovu okna pa pogovor dokončno izbriše.'],
          keys: [
            ['/msg <vzdevek> <besedilo>', 'Pošlje zasebno sporočilo iz klepeta predverja'],
            ['/msg "<vzdevek s presledki>" <besedilo>', 'Enako, ko vzdevek vsebuje presledke']],
          note: 'Sporočila so omejena na 128 znakov. Strežnik ne dostavi zasebnega sporočila igralcu, ki sedi pri mizi, kjer igra teče, zgodovina pa je shranjena samo v tem brskalniku — ne sledi ti na drugo napravo.' },
        { id: 'reactions', t: 'Emoji reakcije',
          b: ['Gumb za reakcije odpre izbirnik 30 animiranih reakcij (🎉, 😂, 😱, 🔥…), ki se predvajajo z učinkom nad tvojim mestom, viden vsem pri mizi — vključno z igralci na namiznem odjemalcu. Reakcije je mogoče popolnoma onemogočiti v Naprednih možnostih.'] },
        { id: 'translate', t: 'Razumevanje vseh',
          b: ['Ko je prevajanje klepeta omogočeno, se ob vrstici pod tvojim kazalcem — ali vrstici, ki jo tapneš na zaslonu na dotik — pojavi gumb za prevod, ki to sporočilo prikaže v tvojem jeziku z vgrajenim prevajalnikom brskalnika. Prikazan je lahko trajno ob vsaki vrstici v Naprednih možnostih → Klepet, kjer se nahaja tudi namig, ki razlaga pogoste kratice za mizo (gg, nh, utg…).'],
          note: 'Prevajanje uporablja storitev Google Translate in deluje v vsakem brskalniku — potrebuje le internetno povezavo. Sporočilo je storitvi za prevajanje poslano samo, ko tapneš gumb za prevod, nikoli samodejno.' },
        { id: 'social', t: 'Igralci: profil, povabilo, ignoriranje',
          b: ['Tapni katerega koli igralca — pri mizi ali na seznamu predverja — da odpreš njegovo kartico: profil in statistiko, povabilo v svojo igro ali ignoriranje (njegova sporočila v klepetu so skrita; ignoriranje je mogoče kadar koli preklicati). Potrditev pred povabilom/ignoriranjem je mogoče omogočiti v nastavitvah.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Predverje in igre',
      sections: [
        { id: 'list', t: 'Seznam iger',
          b: ['Predverje prikaže vse mize na strežniku. Vsak vnos prikazuje število igralcev, vrsto igre, ključavnico, kadar je potrebno geslo ali povabilo, in značko stanja: »Čakanje« (zelena — igra se še ni začela, pridružiš se lahko, če je mesto prosto), »V teku« (topla barva — v živo gledljivo, kadar so opazovalci dovoljeni) in »Zaprto« (zatemnjeno). Polna miza preprosto prikaže polno število, na primer 10/10; barve značk sledijo aktivni temi.',
              'Spustni filter zoži seznam natanko tako kot namizni odjemalec, vsaka izbira strožja od prejšnje: samo odprte igre → tudi skrivanje polnih miz → nato samo nezasebne, samo zasebne ali samo igre z uvrstitvijo. Tvoja izbira si zapomni. Iskalno polje najde igro po imenu, oznaka igralcev pa odpre seznam vseh na spletu, iskljiv in razvrstljiv.'] },
        { id: 'join', t: 'Pridružitev in opazovanje',
          b: ['Izberi odprto igro in se ji pridruži — ključavnica pomeni, da je potrebno geslo. Igre v teku, ki dovoljujejo opazovalce, si lahko ogledaš v živo: vidiš mizo in klepet, tvoje karte v žepu pa ostanejo skrite in ne moreš ukrepati.'] },
        { id: 'gameinfo', t: 'Informacije o igri',
          b: ['Preden se pridružiš, kartica z informacijami o igri prikaže vse, kar določa mizo: vrsto igre, blinde in kako se zvišujejo (podvajanje ali ročni seznam), začetni kapital, časovno omejitev poteze, premor med rokami in kdo je že sedel.'] },
        { id: 'create', t: 'Ustvarjanje igre',
          b: ['Ustvari svojo lastno mizo: ime, število igralcev, začetni kapital, prvi mali blind in urnik zviševanja, časovno omejitev poteze in ali so opazovalci dovoljeni. Obstajajo štiri vrste iger: Navadna (za vse), samo za registrirane igralce, samo na povabilo in z Uvrstitvijo (šteje za uradno uvrstitev — tam geslo ni dovoljeno). Priljubljene nastavitve lahko shraniš in znova naložiš.'] },
        { id: 'invites', t: 'Povabila',
          b: ['Igralci te lahko povabijo k svoji mizi; dobiš obvestilo, ki ga lahko sprejmeš ali zavrneš. Povabilo je edini način vstopa v igro samo na povabilo.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Tvoj račun',
          b: ['Uradni spletni strežnik je pokerth.net. Za igro tam je potreben brezplačen račun pokerth.net — registriraj se na spletni strani, nato se tukaj prijavi z istim vzdevkom in geslom. Ta spletni odjemalec se poveže z istim strežnikom kot namizni odjemalec: isti računi, iste mize, iste uvrstitve, sedeš pa lahko tudi za mizo z igralci na namiznem odjemalcu.'] },
        { id: 'ranked', t: 'Igre z uvrstitvijo in sezone',
          b: ['Igre vrste Uvrstitev štejejo za uradno sezonsko uvrstitev. Tvoj profil v aplikaciji prikazuje, kdaj si se pridružil, tvojo trenutno sezonsko Uvrstitev, Rezultat, povprečje in odigrane igre ter tvoje zadnje rezultate. Navadne (brez uvrstitve) igre so samo za zabavo in ne spremenijo ničesar.'] },
        { id: 'rankhow', t: 'Kako se izračuna uvrstitev',
          b: ['V vsaki igri z uvrstitvijo ti končno mesto prinese točke: 15 za prvo mesto, nato 9, 6, 4, 3, 2 in 1 do sedmega; osmo do deseto mesto ne dobi ničesar. Miza torej podeli skupno 40 točk.',
              'Tvoj Rezultat ni vsota teh točk, temveč tvoje povprečje na igro, omiljeno s faktorjem, ki narašča s številom odigranih iger: peščica dobrih rezultatov ne zadošča za obstanek na vrhu, potrebna je tudi rednost — več ko igraš, bližje je tvoj Rezultat tvojemu resničnemu povprečju. Sezone trajajo četrtletje: ob prehodu se vse arhivira in števci znova začnejo od nič, pretekle sezone pa ostanejo na voljo. Med igro gumb s podijem prikaže sezonsko uvrstitev igralcev pri tvoji mizi.'],
          note: 'Lestvico točk in natančno formulo določa strežnik za uvrstitve pokerth.net in se lahko spremeni; strani na spletnem mestu so referenca.' },
        { id: 'rankings', t: 'Strani z uvrstitvami',
          b: ['Vnos Uvrstitev odpre uradno uvrstitev PokerTH, iskljivo po igralcu, skupaj z uvrstitvami skupnosti (BBC, WEC). Če te uvrstitve ne zanimajo, lahko vnos skriješ v Naprednih možnostih → Skupnost.'] },
        { id: 'cups', t: 'Pokala skupnosti: BBC in WeCup',
          b: ['Dve skupnosti na pokerth.net vodita svoji lastni tekmovanji, vsako s svojo stranjo in uvrstitvijo. Best Brainies Cup (BBC) je stopenjski turnir, ki se je rodil leta 2013: napreduješ od stopnje 1 do stopnje 4, nova sezona pa se začne po vsaki igri stopnje 4, ko je pokal podeljen. WeCup (WEC) ima svojo lestvico, veliko bolj razpotegnjeno — 75 točk za prvo mesto, nato 45, 30, 20… — njegov rezultat pa tvoje povprečje normalizira glede na število odigranih iger v primerjavi z drugimi člani.',
              'Obe uvrstitvi se odpreta z gumbom s pokalom, ob uvrstitvi PokerTH. Nastavitve mize teh tekmovanj so na voljo kot predloge, ko ustvariš igro (BBC stopnja 1 do 4, WEC, WEC mesečni finale in WEC veliki finale), tako da lahko vadiš pod istimi pogoji. Sodelovanje zahteva registracijo na strani zadevnega pokala.'],
          note: 'Vso to vsebino lahko naenkrat skriješ v Naprednih možnostih → Skupnost, če te pokali ne zanimajo.' },
        { id: 'forumcups', t: 'Pokali in dogodki na forumu',
          b: ['Forum pokerth.net gosti tudi Mesečni pokal, mesečno serijo, kjer so igralci razporejeni po mizah Zlato, Srebro in Bron, preden je okronan prvak meseca, poleg tega pa čez leto potekajo tudi enkratni posebni pokali.',
              'Prijave, urniki, nastavitve miz in rezultati so objavljeni na forumu, igre pa potekajo na uradnem strežniku kot vsaka druga. Za spremljanje rezultatov zadošča račun pokerth.net; za prijavo na pokal je treba iti prek ustrezne teme na forumu.'] },
        { id: 'forumnews', t: 'Novice foruma v predverju',
          b: ['Gumb s časopisom v glavi predverja odpre najnovejše objave s foruma pokerth.net, po en vnos na temo, vsak forum pa ima svojo barvo. Značka na gumbu šteje neprebrane objave; odpiranje objave (nov zavihek) jo označi kot prebrano, »Označi vse kot prebrano« pa vse pobriše naenkrat.',
              'To je spletna dodatnost: gumb lahko skriješ v Naprednih možnostih (»Gumb foruma v glavi predverja«).'] },
        { id: 'avatars', t: 'Avatarji in zastave',
          b: ['Na pokerth.net je tvoj avatar drugim igralcem posredovan prek strežnika za avatarje, na poljih igralcev pa se lahko prikaže majhna zastava države. Oboje je neobvezno in nastavljivo v možnostih.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Vadbeni način',
      sections: [
        { id: 'what', t: 'Kaj je to',
          b: ['Lokalni / vadbeni način je polna igra proti računalniškim nasprotnikom: brez povezave, brez računa, brez tveganja. Ko je aplikacija nameščena (ali samo enkrat obiskana), deluje popolnoma brez povezave — odlično za učenje igre, preizkušanje vmesnika ali kratkočasenje v letalskem načinu.'] },
        { id: 'setup', t: 'Nastavitev igre',
          b: ['Izberi število nasprotnikov, začetni kapital, blinde in urnik zviševanja ter hitrost igre. Zasedbo in težavnost botov lahko prilagodiš v Naprednih možnostih → Lokalna igra — od nežnih nasprotnikov do zahtevnejše, mešane mize.'] },
        { id: 'trophies', t: 'Trofeje',
          b: ['Vadbeni način ima svoj lasten napredek: 28 trofej v šestih kategorijah (napredek, spretnost, slog, formati, zabava in ena skrivnostna) se odklepa, kako igraš — odigrane roke, dobljene igre, veliki blefi, posebne roke in več. Tvoj napredek pri trofejah je kumulativen in se združi med napravami, ko je sinhronizacija nastavitev računa aktivna.'] },
        { id: 'learn', t: 'Dobro mesto za učenje',
          b: ['Vse iz drugih poglavij deluje tudi tukaj: nadzor kvot, prikaz pomoči, vnaprejšnja izbira, tipkovne bližnjice. Vadbeni način je najboljše mesto, da jih preizkusiš brez pritiska, preden greš na pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Slog in zvok',
      sections: [
        { id: 'themes', t: 'Teme',
          b: ['Kategorija Slog v Naprednih možnostih preoblikuje celoten odjemalec. Predloge nastavijo vse z enim tapom (klasičen zeleni kazino, uradni videz PokerTH…); pod njimi lahko posamezne osi natančno prilagodiš barvno paleto, sukno mize in videz kart ločeno — spremeni katero koli os in tvoja mešanica postane tema po meri. Temni, svetli ali samodejni način izbereš v Uporabniškem vmesniku, tvoje izbire pa veljajo takoj, na vsakem zaslonu, in si jih zapomni.'] },
        { id: 'tablelook', t: 'Mize, špili, mesta',
          b: ['Poleg teme je mogoče neodvisno zamenjati več elementov: ozadje mize, špil kart, hrbtno stran kart (samodejno ujemanje s špilom ali uvoz lastne slike), žetone delivca in blindov, slog gumbov potez ter celotne pakete mest, ki preoblikujejo polja igralcev. Vse izbereš v Naprednih možnostih → Slog; spremembe so pri mizi vidne takoj.'] },
        { id: 'music', t: 'Predvajalnik glasbe',
          b: ['Vnos za glasbo v menijih glave odpre majhen predvajalnik lounge glasbe: izberi skladbo s seznama predvajanja, predvajaj/premor, prejšnja/naslednja, naključno predvajanje in ponovi eno skladbo, cel seznam ali nič. Glasnost, izbrana skladba in način ponavljanja si zapomnijo. Predvajanje se nikoli ne začne samo od sebe — brskalniki zahtevajo tap — predvajalnik pa je popolnoma neodvisen od zvočnih učinkov igre.', 'Dva palca pod naslovom skladbe povesta, ali ti je všeč, kar se predvaja. En anonimen glas na napravo, radii vključeni, spremeniš ali umakneš ga lahko kadar koli; razen če upravljavec razkrije skupne rezultate, vidiš samo svoj lastni palec.'] },
        { id: 'sounds', t: 'Zvočni učinki',
          b: ['Zvoki igre so razdeljeni v štiri kategorije, ki jih je mogoče preklapljati ločeno, natanko tako kot pri namiznem odjemalcu: poteze igre (razdeljene karte, Check, Call, Raise, tvoja poteza…), obvestilo o klepetu predverja, obvestila omrežne igre (igralec se je pridružil, igra pripravljena) in obvestilo o zvišanju blinda. En sam drsnik glasnosti nadzoruje vse, v Naprednih možnostih → Zvok.'],
          note: 'Vsi brskalniki — zlasti iOS — zavrnejo predvajanje zvoka, dokler se strani vsaj enkrat ne dotakneš. Če se igra začne tiho, en sam tap kjer koli obudi zvok; odjemalec tudi samodejno popravi zvočni pogon, ko ga iOS začasno ustavi (dohodni klic, prehod v ozadje…).' },
        { id: 'voice', t: 'Glas in vibriranje',
          b: ['Dva dodatna kanala te lahko obveščata, ne da bi gledal na zaslon: glasovna obvestila preberejo dogodke igre s pomočjo sinteze govora tvoje naprave, na telefonih pa lahko kratko vibriranje označi tvojo potezo. Oba sta spletni dodatnosti, privzeto vklopljeni ali izklopljeni glede na napravo, v Naprednih možnostih → Stave in poteza.'],
          note: 'Vibriranje deluje na Androidu (brskalniki Chromium); Apple spletnim mestom ne izpostavlja API-ja za vibriranje, zato iPhone ne more vibrirati. Glasovna obvestila delujejo povsod, razpoložljivi glasovi in jeziki pa so odvisni od tvojega sistema — odjemalec uporabi najboljše ujemanje, ki ga najde.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Možnosti in bližnjice',
      sections: [
        { id: 'where', t: 'Kje najdeš možnosti',
          b: ['Napredne možnosti se odprejo iz vnosa z zobnikom v katerem koli meniju glave. Razvrščene so kot pri namiznem odjemalcu: Uporabniški vmesnik, Slog, Zvok, Lokalna igra, Omrežna igra, Spletna igra, Vzdevki / Avatarji, Dnevniška sporočila in Obnovi privzeto. Vsaka spletno-specifična funkcija ima tam svoje stikalo, tako da lahko izklopiš vse, česar ne uporabljaš.'] },
        { id: 'cfgxml', t: 'Izmenjava nastavitev z namiznim odjemalcem',
          b: ['Tvoje nastavitve lahko potujejo med odjemalci: kategorija Dnevniška sporočila ponuja izvoz/uvoz uradne datoteke config.xml (datoteka ~/.pokerth/config.xml, ki jo uporabljata namizni in QML odjemalec). Izvoz zapiše skupne nastavitve — ime, prikaz, zvoki, nastavitve mize, blindi, slogi — uvoz pa tukaj uporabi namizno datoteko. Nastavitve, ki jih ta odjemalec ne pozna, ostanejo v datoteki nedotaknjene.', 'S to datoteko potujejo tudi tvoji zapiski o igralcih — besedilo in ocena z zvezdicami, zapisani tako, kot jih berejo namizni odjemalci. Barvne oznake ostanejo v tem odjemalcu: uradna oblika zanje nima polja, zato uvoz nikoli ne dotakne tvojih.'] },
        { id: 'sync', t: 'Nastavitve, ki ti sledijo',
          b: ['Ko igraš z računom, se tvoje možnosti, tema, tipkovne bližnjice, jezik in vadbeni trofeji sinhronizirajo: spremeni nekaj na eni napravi in naslednja naprava, s katere se prijaviš, to prevzame. Napredek trofej se združuje, nikoli ne prepiše, tako da igranje na dveh napravah vedno ohrani najboljše od obeh.'] },
        { id: 'updates', t: 'Kako biti na tekočem',
          b: ['Odjemalec se posodobi sam: ko je nova različica objavljena, pasica te povabi k osvežitvi (ali vtipkaj /update v klepetu za ročno preverjanje). Občasno se lahko pojavi majhna anketa o izdelku, da vpraša za tvoje mnenje o funkciji — sodelovanje je neobvezno, ankete pa je mogoče popolnoma onemogočiti v Naprednih možnostih → Skupnost.'] },
        { id: 'fkeys', t: 'Uradne tipkovne bližnjice',
          b: ['Uradne funkcijske tipke PokerTH delujejo med igro — Alt+S deluje kjer koli:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold · Check/Call · Bet/Raise · All-In (vrstni red je mogoče obrniti v nastavitvah)'],
            ['F5', 'Pokaži svoje karte (kadar je mogoče)'],
            ['F6 / F7 / F8', 'Ročno · Samodejni Check/Fold · Samodejni Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Ročno · Samodejni Check/Call · Samodejni Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Klepet · Dnevnik igre · Plošča s kvotami'],
            ['Alt+S', 'Nastavitve — kjer koli v aplikaciji, ne samo med igro'],
            ['F11', 'Celozaslonski način']],
          note: 'Bližnjice potrebujejo fizično tipkovnico. Na Macu funkcijske tipke privzeto upravljajo predstavnostne kontrole: drži Fn (ali omogoči »Uporabi F1, F2 itd. kot standardne funkcijske tipke« v nastavitvah macOS). Na iPhone je celozaslonski način omejen zaradi iOS — namestitev aplikacije kot PWA da enako celozaslonsko izkušnjo.' },
        { id: 'webkeys', t: 'Spletne črkovne tipke',
          b: ['Kot spletna dodatnost tudi enočrkovne tipke in Alt+T sprožijo poteze, vsako od njih pa je mogoče znova povezati v Naprednih možnostih → Tipkovne bližnjice:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 · 1/2 · Pot'],
            ['Alt+T', 'Plošča s statistiko'],
            ['Esc', 'Zapre najvišje okno (tudi gumb Nazaj na Androidu)'],
            ['↑ ↓ · ↵', 'Seznam miz predverja (dosežeš ga s Tab): izberi mizo · pridruži se']],
          note: 'Na Androidu sistemski gumb/gesta Nazaj zapira okna kot Esc, namesto da bi zapustil igro (nastavljivo v možnostih). iOS nima ustreznega sistemskega gumba — uporabi ✕ vsakega okna.' }
      ]
    }
  ]
};
