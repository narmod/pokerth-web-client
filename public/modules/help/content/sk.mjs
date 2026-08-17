// ── help/content/sk.mjs — Slovenský korpus pomocníka (4. dávka) ─────────────
// Preklad en.mjs (vzor). Štruktúra a id zhodné; preložené sú len t / b /
// list / keys (popisky) / note. Pokrové termíny (Fold, Check, Call, Bet,
// Raise, All-In, flop, turn, river…) zostávajú po anglicky podľa konvencie
// aplikácie.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Prvé kroky',
      sections: [
        { id: 'modes', t: 'Tri spôsoby hrania',
          b: ['Na prihlasovacej obrazovke si vyber, ako chceš hrať.'],
          list: [
            'Internet — hraj online na oficiálnom serveri pokerth.net, s rebríčkami. Je potrebný účet pokerth.net; registrácia na pokerth.net je bezplatná.',
            'Lokálna hra / tréning — hraj offline proti botom. Nič sa nenastavuje, funguje bez pripojenia a s pokrokmi odomykáš trofeje.',
            'LAN / vyhradený server — pripoj sa k súkromnému serveru PokerTH vo svojej lokálnej sieti alebo na vlastnom počítači.'] },
        { id: 'lan', t: 'LAN / vyhradený server',
          b: ['Tretí režim sa pripojí k ľubovoľnému serveru PokerTH, ktorý prevádzkuješ ty alebo kamarát — v domácej sieti, na súkromnom VPS, kdekoľvek. Zadaj adresu a port servera, zaškrtni TLS, ak server používa šifrovaný port, a prihlás sa prezývkou (hosťovské prihlásenie funguje, ak ho server povoľuje). Pri stole sa potom všetko správa presne ako na oficiálnom serveri.'] },
        { id: 'famboard', t: 'Rodinný rebríček',
          b: ['Len na súkromných serveroch a v LAN hrách si klient vedie súhrnné štatistiky podľa prezývok — odohrané a vyhrané ruky aj partie, najväčšia výhra, najlepšia séria — a zdieľa ich cez server, takže každé zariadenie pri stole vidí rovnaký rebríček. Hry na pokerth.net sa takto nikdy nesledujú a štatistiky tréningového režimu zostávajú úplne oddelené.'] },
        { id: 'language', t: 'Jazyk',
          b: ['Rozhranie je k dispozícii v 45 jazykoch. Kedykoľvek ho zmeníš v Pokročilých možnostiach (menu s ozubeným kolieskom), kategória Používateľské rozhranie. Pokrové akčné termíny (Fold, Check, Call, Bet, Raise, All-In) zostávajú podľa konvencie po anglicky, presne ako v desktopovom klientovi.'] },
        { id: 'pwa', t: 'Inštalácia ako aplikácia',
          b: ['Tento klient je Progressive Web App: môžeš ho nainštalovať z menu prehliadača (alebo tlačidlom inštalácie v hlavičke) a získať celoobrazovkovú aplikáciu s vlastnou ikonou. Po inštalácii sa spúšťa okamžite a tréningový režim funguje úplne offline.'],
          note: 'Na Androide a v desktopovom Chrome/Edge zariadi všetko tlačidlo inštalácie. Na iPhone/iPade Apple povoľuje inštaláciu len cez Safari: tlačidlo Zdieľať \u2192 \u201ePridať na plochu\u201c — klient tieto kroky v prípade potreby zobrazí. Po inštalácii aplikácie tlačidlo zmizne.' },
        { id: 'platforms', t: 'Platformy a prehliadače',
          b: ['Klient beží v každom modernom prehliadači na každom systéme — Windows, macOS, Linux, Android, iOS. Niekoľko funkcií sa spolieha na novšie API prehliadačov; keď API chýba, funkcia sa skryje alebo vysvetlí situáciu, namiesto toho, aby sa pokazila. Hlavné rozdiely, ktoré treba poznať:'],
          list: [
            'Chrome / Edge (desktop): funguje všetko, vrátane zápisu logu .pdb do priečinka.',
            'Firefox: všetko okrem zápisu .pdb do priečinka (API zatiaľ nie je k dispozícii).',
            'Safari / iOS: inštalácia cez Zdieľať \u2192 \u201ePridať na plochu\u201c; bez vibrácií; celá obrazovka na iPhone obmedzená; zvuk sa spustí po tvojom prvom ťuknutí.',
            'Android: plná podpora v prehliadačoch Chromium, vrátane vibrácií a správania tlačidla Späť.'] },
        { id: 'avatar', t: 'Prezývka a avatar',
          b: ['Pred pripojením si na prihlasovacej obrazovke vyber prezývku a avatar. Na pokerth.net je prezývka menom tvojho účtu; avatary sa s ostatnými hráčmi zdieľajú cez avatarový server.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pravidlá pokru',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em v skratke',
          b: ['PokerTH sa hrá ako No-Limit Texas Hold\u2019em. Každý hráč dostane dve zakryté karty (hole cards). Potom sa doprostred stola vyloží lícom nahor päť spoločných kariet. Najlepšia päťkartová ruka zložená z ľubovoľnej kombinácie tvojich dvoch kariet a piatich spoločných vyhráva bank.'] },
        { id: 'blinds', t: 'Blindy a tlačidlo dílera',
          b: ['Pred každou rukou plnia bank dve povinné stávky: small blind a big blind, ktoré skladajú dvaja hráči naľavo od tlačidla dílera. Tlačidlo sa po každej ruke posunie o jedno miesto v smere hodinových ručičiek, takže blindy platia všetci postupne. Blindy počas partie v pravidelných intervaloch rastú.',
              'Na stole sú tlačidlo a blindy označené žetónmi: D (díler), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Štyri stávkové kolá',
          list: [
            'Pre-flop — po rozdaní zakrytých kariet začína prvé stávkové kolo naľavo od big blindu.',
            'Flop — odkryjú sa tri spoločné karty, nasleduje stávkové kolo.',
            'Turn — štvrtá spoločná karta, potom ďalšie stávkové kolo.',
            'River — piata a posledná spoločná karta, potom záverečné stávkové kolo.'],
          b: ['Stávkové kolo končí, keď každý hráč, ktorý v ruke zostáva, vložil do banku rovnakú sumu (alebo je all-in).'] },
        { id: 'actions', t: 'Čo môžeš urobiť, keď si na ťahu',
          list: [
            'Fold — zložiť ruku. Tvoje karty idú preč a o bank už nehráš.',
            'Check — pokračovať bez stávky. Dá sa len vtedy, keď niet čo dorovnávať.',
            'Call — dorovnať prebiehajúcu stávku.',
            'Bet — otvoriť stávky, keď na tejto street ešte nikto nestavil.',
            'Raise — navýšiť nad existujúcu stávku. Minimálne navýšenie sa rovná predchádzajúcej stávke alebo navýšeniu.',
            'All-In — vsadiť celý svoj stack. V ruke zostávaš do výšky pokrytej sumy.'] },
        { id: 'showdown', t: 'Showdown a delené banky',
          b: ['Ak po stávkovom kole na riveri zostane viac hráčov, ruky sa odkryjú a vyhráva najlepšia — víťazná kombinácia sa ukáže pod spoločnými kartami. Keď je hráč all-in s menším množstvom, než sú plné stávky, vznikajú vedľajšie banky: každý hráč môže vyhrať len tú časť banku, do ktorej prispel. Zhodné ruky si bank delia.',
            'Nemusia ukazovať všetci: počnúc posledným hráčom, ktorý stavil alebo zvýšil, sa karty odkryjú len vtedy, ak porazia to, čo už leží lícom nahor. Kto smie zahodiť, necháva karty zakryté a dostane tlačidlo Show, aby ich aj tak ukázal.'] },
        { id: 'hands', t: 'Poradie rúk',
          b: ['Od najslabšej po najsilnejšiu:'],
          list: [
            '1. High Card — žiadna kombinácia; rozhoduje najvyššia karta.',
            '2. Pair — dve karty rovnakej hodnoty.',
            '3. Two Pair — dva rôzne páry.',
            '4. Three of a Kind — tri karty rovnakej hodnoty.',
            '5. Straight — päť kariet za sebou (eso platí ako najvyššie aj najnižšie).',
            '6. Flush — päť kariet rovnakej farby.',
            '7. Full House — trojica plus pár.',
            '8. Four of a Kind — štyri karty rovnakej hodnoty.',
            '9. Straight Flush — postupka celá v jednej farbe.',
            '10. Royal Flush — od desiatky po eso v jednej farbe. Najlepšia možná ruka.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Herná obrazovka',
      sections: [
        { id: 'actionbar', t: 'Panel akcií',
          b: ['Keď si na ťahu, spodný panel akcií sa rozsvieti a ponúkne až štyri tlačidlá: Fold (červené), Check / Call (modré), Bet / Raise (zelené — hlavná akcia, zvýraznená) a All-In (tmavočervené). Tlačidlo Check / Call ukazuje presnú sumu na dorovnanie; Bet / Raise ukazuje sumu, ktorú sa chystáš vložiť. Po riveri sa All-In môže zmeniť na tlačidlo Show na odkrytie kariet.'] },
        { id: 'betctl', t: 'Výber stávky',
          b: ['Sumu navýšenia nastavíš číselným poľom, posuvníkom alebo rýchlymi tlačidlami 1/3 \u00b7 1/2 \u00b7 Pot (zlomky aktuálneho banku). Sumy sa automaticky zaokrúhľujú a držia sa medzi minimálnym a maximálnym povoleným navýšením. Ak radšej rozmýšľaš v big blindoch, voľba zobrazí všetky sumy v BB namiesto žetónov.'] },
        { id: 'preselect', t: 'Predvoľba akcie',
          b: ['Pred svojím ťahom si môžeš akciu nachystať dopredu: ťukni na tlačidlo a to dostane zlatý rámik s malou zlatou bodkou. Keď príde tvoj ťah, akcia sa vykoná okamžite. Nachystaný Fold sa automaticky zmení na Check, keď je check zadarmo — nikdy nezložíš zbytočne. Predvoľby sa resetujú s každou novou rukou, zmenou street a showdownom a rušia sa, ak sa situácia zmení (napríklad sa zmení suma na dorovnanie).'] },
        { id: 'automodes', t: 'Automatické režimy',
          b: ['Rozbaľovacia ponuka vedľa akčných tlačidiel ponúka tri herné režimy: Ručný, Auto Check/Call a Auto Check/Fold. Automatické režimy hrajú za teba, kým sa nevrátiš — akékoľvek ručné kliknutie na akciu okamžite vráti Ručný režim.'] },
        { id: 'readtable', t: 'Čítanie stola',
          b: ['Každý hráčsky box zobrazuje avatar, meno, stack a prebiehajúcu stávku. Díler a blindy sú označené žetónmi D / SB / BB. Farebný odznak na boxe ukazuje poslednú akciu hráča; tenký modrý prúžok odpočítava jeho čas na rozmyslenie. Box hráča na ťahu sa rozsvieti; tvoj vlastný box dostane pri tvojom ťahu pulzujúci zlatý rámik.',
              'Stavový riadok nad stolom ukazuje celkový bank, stávky prebiehajúcej street, fázu (Pre-flop, Flop, Turn, River) a čísla hry a ruky. Hráči, ktorí zložili, majú priesvitné karty; vyradení sú stmavení. Na konci ruky môže okno víťaza zhrnúť, kto čo vyhral — vypína sa v možnostiach.'] },
        { id: 'seatlayout', t: 'Rozmiestnenie miest',
          b: ['Ako webové rozšírenie sa rozloženie hráčskych boxov volí v Pokročilé možnosti \u2192 Miesta: Automatické sleduje oficiálneho klienta (pevné pozície na výšku, počítaná elipsa na šírku), alebo vynútiš rozloženie Na výšku či Na šírku — a Vlastné ti nechá rozmiestniť každé miesto ručne: objaví sa režim úprav, v ktorom potiahneš každý box presne tam, kam chceš, a rozloženie sa uloží.'] },
        { id: 'zoom', t: 'Zoom stola (telefóny)',
          b: ['Na malých obrazovkách tlačidlá lupy stôl zväčšia (2\u00d7) a môžeš ho posúvať prstom — tvoj box a panel akcií zostávajú na mieste. Pohľad automaticky sleduje aktívne miesto a pri showdowne sa oddiali pre celkový prehľad. Vypína sa v Pokročilých možnostiach.'],
          note: 'Na telefónoch a tabletoch je gesto priblíženia samotného prehliadača predvolene zablokované, aby sa zoom nikdy omylom nespustil uprostred ruky; ak ti to vyhovuje inak, zapni ho späť v Pokročilé možnosti \u2192 Používateľské rozhranie.' },
        { id: 'protections', t: 'Ochrana proti nakúkaniu a náhodnému Callu',
          b: ['Dve voliteľné ochrany: ochrana proti nakúkaniu drží tvoje karty zakryté, kým sa ich nedotkneš (užitočné, keď ti niekto vidí na obrazovku), a poistka proti náhodnému Callu krátko zablokuje tlačidlo Call hneď po veľkom navýšení, aby ťuknutie mierené na menší Call nespadlo omylom na navýšenú sumu. Obe nájdeš v Pokročilých možnostiach.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Informačný panel',
      sections: [
        { id: 'open', t: 'Otvorenie panela',
          b: ['Počas hry sa informačný panel otvára z hlavičky (alebo Alt+L / Alt+I) a má tri karty: História, Šance a Štatistiky. Na telefóne sa vznáša nad stolom; na väčších obrazovkách je to presúvateľné okno s meniteľnou veľkosťou — uchop úchyt \u28ff na presun, okraje na zmenu veľkosti. Jeho poloha sa pamätá.'] },
        { id: 'log', t: 'Herný záznam',
          b: ['Karta História zaznamenáva celú partiu ruku po ruke: blindy, každú akciu so sumami, odkryté karty a víťazov, všetko farebne pre rýchle čítanie. Tlačidlo exportu uloží záznam do súboru, ak si chceš reláciu prejsť neskôr.'] },
        { id: 'odds', t: 'Šance (monitor pravdepodobností)',
          b: ['Karta Šance ukazuje pre tvoju aktuálnu ruku živú pravdepodobnosť, že skončíš s každou z 10 kategórií rúk — od High Card po Royal Flush — každá s ikonou, percentom a prúžkom. Len čo zložíš, zobrazenie zošedne. Používa len tvoje karty a spoločné karty: nevidí nič, čo súperi neukážu.'] },
        { id: 'journal', t: 'Záznamy rúk a okno \u201eLogy\u201c',
          b: ['Okrem živej histórie sa každá odohraná ruka lokálne ukladá do prehliadača, v rovnakom formáte ako súbory logov .pdb oficiálneho klienta. Okno Logy (Pokročilé možnosti \u2192 Správy logu \u2192 Spravovať logy\u2026) vypisuje tvoje relácie a umožňuje s nimi pracovať: náhľad relácie s vyhľadávaním a zvýraznením, filtrovanie podľa hry, export do HTML alebo čistého textu, uloženie surového súboru .pdb, alebo import .pdb nahraného desktopovým klientom. Relácie sa mažú po jednej alebo všetky naraz (s potvrdením) a automatická retencia môže ponechať len posledných 7, 30, 90, 180 alebo 365 dní. Záznamy, ktoré si sami naimportujete, sa nikdy nemažu automaticky. Druhé nastavenie obmedzuje počet uchovaných relácií a stĺpec so zoznamom sa dá potiahnutím rozšíriť.',
              'Tlačidlo Analyzovať spustí nad reláciou analýzu rúk a môže odoslať log do analytickej služby pokerth.net. Všetko zostáva na tvojom zariadení, kým výslovne neexportuješ alebo neodošleš.'] },
        { id: 'logopts', t: 'Možnosti záznamu',
          b: ['V Pokročilých nastaveniach \u2192 Správy denníka môžeš zapnúť alebo vypnúť zaznamenávanie a zvoliť interval zápisu s rovnakými tromi možnosťami ako desktopový klient: po každej akcii, po každom rozdaní (predvolené) alebo po každej hre. Ďalšia voľba zapisuje súbor .pdb do priečinka podľa tvojho výberu a udržiava ho v tomto intervale aktuálny, plus ešte raz pri odchode zo stránky, aby iný nástroj mohol hru sledovať naživo.'],
          note: 'Zápis do miestneho priečinka vyžaduje File System Access API: iba Chrome, Edge a Opera na počítači. Inde sa voľba sama vysvetlí a ručný export z okna denníkov zostáva dostupný. Prehliadač vie súbor len nahradiť, nikdy doň pripájať, takže nástroj čítajúci .pdb by ho mal po každej zmene znova otvoriť.' },
        { id: 'assist', t: 'Asistencia (sila ruky)',
          b: ['Hore na karte Šance ti asistenčný pruh číta ruku za teba. Pred flopom pomenuje tvoju štartovú ruku a ohodnotí ju hviezdami; od flopu ukazuje tvoju aktuálnu najlepšiu kombináciu a po rýchlej simulácii odhadovanú šancu na výhru ruky v percentách, s farebným ukazovateľom od červenej (slabá) po zelenú (silná). Rovnako ako monitor pravdepodobností používa len informácie, ktoré vidíš.',
              'Dva štýly zobrazenia nájdeš v Pokročilé možnosti \u2192 Miesta: Segmenty (desať blokov) alebo klasický ukazovateľ priebehu. Celú asistenciu možno vypnúť v Pokročilé možnosti \u2192 Asistencia.'] },
        { id: 'assistwin', t: 'Asistencia ako plávajúci widget',
          b: ['Blok asistencie možno od panela odtrhnúť do vlastného okienka vždy navrchu: použi tlačidlo odtrhnutia na bloku, potom ho presúvaj a zväčšuj kdekoľvek nad stolom — praktické na sledovanie sily ruky bez otvoreného celého panela. Tlačidlo ukotvenia ho vráti do karty Šance a poloha sa pamätá. Vnútri panela ti úchyt medzi Asistenciou a šancami umožní rozdeliť priestor medzi obe časti.'] },
        { id: 'stats', t: 'Štatistiky',
          b: ['Karta Štatistiky sleduje tvoju reláciu: odohrané ruky, videné flopy, showdowny, úspešnosť a ďalšie. Sledovanie štatistík možno vypnúť v Pokročilých možnostiach.'] },
        { id: 'hud', t: 'HUD štatistík pri miestach (beta)',
          b: ['HUD pripojí vedľa miesta každého hráča malé okienko so štatistikami, zostavené z rozdaní, ktoré si zaznamenal vo svojich denníkoch: počet pozorovaných rozdaní, potom VPIP (ako často dobrovoľne vkladá peniaze pre-flop), PFR (pre-flop navýšenia) a AF (faktor agresivity), farebne odstupňované od pasívneho k agresívnemu. Pod nimi odznak zhrnie hráča slovami \u2014 Tesný-Pasívny, Voľný-Agresívny a tak ďalej \u2014 vedľa malého ciferníka, ktorého rozsvietený kvadrant sa číta zľava doprava od tesného k voľnému a zdola nahor od pasívneho k agresívnemu. Odznak sa objaví hneď od prvého rozdania, ale zostáva stlmený do 25 rozdaní, odkiaľ je spoľahlivý. Ťukni na okienko pre podrobné vyskakovacie okno so všetkými číslami (3-bet, continuation bet, fold na 3-bet, pokusy o krádež, miery showdownu\u2026), a potiahni ho, ak niečo zakrýva.',
              'HUD pozná len to, čo si videl pri vlastných stoloch — číta tvoje lokálne záznamy rúk, takže záznam musí byť zapnutý a čísla dávajú zmysel až po dostatku rúk. Je to beta funkcia, predvolene vypnutá: zapni ju v Pokročilé možnosti \u2192 Asistencia.'] },
        { id: 'handsbtn', t: 'Prehľad kombinácií',
          b: ['Ikona pokrových rúk na plátne kedykoľvek otvorí rýchly prehľad 10 kombinácií — šikovné pri učení. Skrýva sa v Pokročilých možnostiach.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat a sociálne funkcie',
      sections: [
        { id: 'panels', t: 'Chat lobby a chat pri stole',
          b: ['Jeden chat je v lobby, druhý pri stole. Na telefóne sa chat pri stole vznáša nad hrou; na väčších obrazovkách je to presúvateľné okno s meniteľnou veľkosťou. Odznak na tlačidle chatu počíta neprečítané správy.'] },
        { id: 'typing', t: 'Pomôcky pri písaní',
          list: [
            'Tab doplní prezývku — ďalším stlačením Tab prechádzaš zhodami.',
            '\u2191 / \u2193 listujú históriou tvojich správ.',
            'Tlačidlo emoji otvorí úplný výber; napísanie : napovedá emotikony aj počas písania.'] },
        { id: 'emotes', t: 'Emotikony a smajlíky',
          b: ['Chat prevádza kódy emotikonov úplne rovnako ako oficiálny desktopový klient: napíš meno medzi dve dvojbodky a premení sa na emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 podporovaných je vyše 1 900 kódov (kompletná sada GitHubu). Prevádzajú sa aj klasické textové smajlíky: :-) ;) :D xD :P <3 a asi osemdesiat ďalších.',
              'Napísanie : otvorí okno s návrhmi, ktoré kód dopĺňa počas písania (\u2191/\u2193 na výber, Tab alebo Enter na potvrdenie). Prevod emoji možno úplne vypnúť v Pokročilé možnosti \u2192 Chat.'] },
        { id: 'commands', t: 'Príkazy chatu',
          b: ['Chat rozumie lomkovým príkazom. Dva sú viditeľné ostatným:'],
          keys: [
            ['/me <text>', 'Akčná správa, zobrazí sa ako \u201e* tvojaprezyvka text\u201c'],
            ['/emoji <emoji>', 'Prehrá emoji reakciu (to isté, čo posiela výber reakcií)']] },
        { id: 'diagcmds', t: 'Diagnostické príkazy',
          b: ['Všetko ostatné je lokálne: odpovede vidíš len ty a k stolu sa nič neposiela. Napíš /help na výpis všetkých. Najužitočnejšie:'],
          keys: [
            ['/help', 'Vypísať všetky príkazy'],
            ['/update', 'Skontrolovať novú verziu a obnoviť'],
            ['/lang <kód>', 'Zmeniť jazyk (napr. /lang sk)'],
            ['/sound on|off', 'Zapnúť/stlmiť herné zvuky'],
            ['/zoom', 'Prepnúť lupu stola'],
            ['/clear', 'Vymazať chat lokálne'],
            ['/table', 'Informácie o aktuálnej hre (blindy, hráči, stacky)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostika stavu klienta, siete a plynulosti'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Pokročilé ladenie (karty, protokol, zvuk, úložisko, miesta)'],
            ['/copy', 'Skopírovať poslednú odpoveď príkazu do schránky']] },
        { id: 'reactions', t: 'Emoji reakcie',
          b: ['Tlačidlo reakcií otvorí výber 30 animovaných reakcií (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026), ktoré sa s efektom prehrajú nad tvojím miestom a vidí ich celý stôl — vrátane hráčov na desktopovom klientovi. Reakcie možno úplne vypnúť v Pokročilých možnostiach.'] },
        { id: 'translate', t: 'Rozumieť všetkým',
          b: ['So zapnutým prekladom chatu sa tlačidlo prekladu objaví na riadku pod ukazovateľom — alebo na riadku, na ktorý ťukneš na dotykovej obrazovke — a zobrazí správu v tvojom jazyku prekladateľom prehliadača. Dá sa trvalo zobraziť na všetkých riadkoch v Pokročilých možnostiach → Chat, kde býva aj pomôcka vysvetľujúca bežné stolové skratky (gg, nh, utg…).'],
          note: 'Preklad používa službu Google Translate a funguje v každom prehliadači — stačí pripojenie na internet. Správa sa do prekladovej služby odošle len vtedy, keď ťukneš na jej tlačidlo prekladu, nikdy automaticky.' },
        { id: 'social', t: 'Hráči: profil, pozvanie, ignorovanie',
          b: ['Ťukni na ľubovoľného hráča — pri stole alebo v zozname lobby — a otvorí sa jeho karta: profil a štatistiky, pozvanie do tvojej hry, alebo ignorovanie (jeho správy v chate sa skryjú; ignorovanie možno kedykoľvek zrušiť). Potvrdenie pred pozvaním/ignorovaním možno zapnúť v možnostiach.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby a hry',
      sections: [
        { id: 'list', t: 'Zoznam hier',
          b: ['Lobby vypisuje všetky stoly servera. Každý riadok ukazuje počet hráčov, typ hry, zámok, keď sa vyžaduje heslo alebo pozvánka, a stavový odznak: \u201eČaká sa\u201c (zelený — hra nezačala, môžeš sa pripojiť, ak je voľné miesto), \u201ePrebieha\u201c (teplá farba — dá sa sledovať naživo, ak sú povolení diváci) a \u201eUzavretá\u201c (stlmený). Plný stôl spoznáš jednoducho podľa plného počítadla, napríklad 10/10; farby odznakov sledujú aktívny motív.',
              'Rozbaľovací filter zužuje zoznam úplne rovnako ako desktopový klient, každá voľba prísnejšia než predchádzajúca: len otvorené hry \u2192 navyše skryť plné stoly \u2192 potom len neverejné, len súkromné, alebo len hodnotené hry. Tvoja voľba sa pamätá. Vyhľadávacie pole nájde hru podľa mena a odznak hráčov otvorí zoznam všetkých pripojených, prehľadávateľný a zoraditeľný.'] },
        { id: 'join', t: 'Pripojenie a sledovanie',
          b: ['Vyber otvorenú hru a pripoj sa — zámok značí, že treba heslo. Prebiehajúce hry, ktoré povoľujú divákov, možno sledovať naživo: vidíš stôl a chat, ale zakryté karty zostávajú skryté a nemôžeš konať.'] },
        { id: 'gameinfo', t: 'Informácie o hre',
          b: ['Pred pripojením ukáže karta informácií o hre všetko, čo stôl definuje: typ hry, blindy a ich rast (zdvojovanie alebo ručný zoznam), počiatočný stack, čas na akciu, pauzu medzi rukami a kto už sedí.'] },
        { id: 'create', t: 'Vytvorenie hry',
          b: ['Vytvor si vlastný stôl: meno, počet hráčov, počiatočný stack, prvý small blind a schému navyšovania, čas na akciu a či sú povolení diváci. Existujú štyri typy hier: Normálna (všetci), len registrovaní hráči, len na pozvanie, a Hodnotená (počíta sa do oficiálneho rebríčka — heslo potom nemožno nastaviť). Obľúbené nastavenia si môžeš uložiť a znova načítať.'] },
        { id: 'invites', t: 'Pozvánky',
          b: ['Hráči ťa môžu pozvať k svojmu stolu; dostaneš oznámenie, ktoré môžeš prijať alebo odmietnuť. Pozvanie je jediný spôsob, ako vstúpiť do hry len na pozvanie.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Tvoj účet',
          b: ['Oficiálny internetový server je pokerth.net. Hranie na ňom vyžaduje bezplatný účet pokerth.net — zaregistruj sa na webe a potom sa tu prihlás rovnakou prezývkou a heslom. Tento webový klient sa pripája k úplne rovnakému serveru ako desktopový klient: rovnaké účty, rovnaké stoly, rovnaké rebríčky, a môžeš si sadnúť k stolu s hráčmi desktopového klienta.'] },
        { id: 'ranked', t: 'Hodnotené hry a sezóny',
          b: ['Hry typu Hodnotená sa počítajú do oficiálneho sezónneho rebríčka. Tvoj profil v aplikácii ukazuje dátum registrácie, Rank aktuálnej sezóny, Skóre, priemer a odohrané hry, plus posledné výsledky. Normálne (nehodnotené) hry sú len pre zábavu a nič nemenia.'] },
        { id: 'rankhow', t: 'Ako sa počíta rebríček',
          b: ['V každej hodnotenej hre ti tvoje umiestnenie prinesie body: 15 za prvé, potom 9, 6, 4, 3, 2 a 1 až po siedme; od ôsmeho po desiate nič. Stôl teda rozdá spolu 40 bodov.',
              'Tvoje Score nie je súčet týchto bodov, ale tvoj priemer na hru, stlmený koeficientom, ktorý rastie s počtom odohraných hier: pár dobrých výsledkov nestačí na to, aby si sa usadil hore, treba aj pravidelnosť — čím viac hráš, tým bližšie je tvoje Score tvojmu skutočnému priemeru. Sezóna trvá štvrťrok: pri prechode sa všetko archivuje a počítadlá začínajú od nuly, minulé sezóny zostávajú k nahliadnutiu. V hre tlačidlo stupňov víťazov ukazuje sezónne poradie hráčov pri tvojom stole.'],
          note: 'Bodovú stupnicu aj presný vzorec určuje rebríčkový server pokerth.net a môžu sa meniť; rozhodujúce sú stránky webu.' },
        { id: 'rankings', t: 'Stránky rebríčkov',
          b: ['Položka rebríčka otvorí oficiálny rebríček PokerTH, prehľadávateľný podľa hráčov, ako aj komunitné rebríčky (BBC, WEC). Ak ťa rebríčky nezaujímajú, položku skryješ v Pokročilé možnosti \u2192 Komunita.'] },
        { id: 'cups', t: 'Komunitné poháre: BBC a WeCup',
          b: ['Dve komunity organizujú na pokerth.net vlastné súťaže, každá s vlastným webom a vlastným rebríčkom. Best Brainies Cup (BBC) je stupňový turnaj vzniknutý v roku 2013: postupuje sa od Step 1 k Step 4 a nová sezóna sa začína po každej hre Step 4, keď sa odovzdáva pohár. WeCup (WEC) má vlastnú, oveľa rozloženejšiu stupnicu — 75 bodov za prvé miesto, potom 45, 30, 20… — a jeho score normalizuje tvoj priemer podľa počtu hier, ktoré si odohral, v porovnaní s ostatnými členmi.',
              'Oba rebríčky otvoríš tlačidlom pohára vedľa rebríčka PokerTH. Nastavenia stolov týchto súťaží sú k dispozícii ako predvoľby pri vytváraní hry (BBC Step 1 až 4, WEC, WEC Monthly Final a WEC Grand Final), takže môžeš trénovať za rovnakých podmienok. Účasť vyžaduje registráciu na webe príslušného pohára.'],
          note: 'Ak ťa poháre nezaujímajú, skryješ tento obsah naraz v Pokročilé možnosti → Komunita.' },
        { id: 'forumcups', t: 'Poháre fóra a podujatia',
          b: ['Na fóre pokerth.net beží aj Monthly Cup, mesačná séria, v ktorej sa hráči rozdelia k stolom Gold, Silver a Bronze, kým sa korunuje šampión mesiaca, a k tomu jednotlivé mimoriadne poháre počas roka.',
              'Prihlášky, termíny, nastavenia stolov a výsledky sa zverejňujú na fóre a hry bežia na oficiálnom serveri ako všetky ostatné. Na sledovanie výsledkov stačí účet pokerth.net; prihlásenie do pohára ide cez zodpovedajúce vlákno fóra.'] },
        { id: 'forumnews', t: 'Novinky z fóra v lobby',
          b: ['Tlačidlo s novinami v záhlaví lobby otvorí najnovšie príspevky z fóra pokerth.net — jeden záznam na tému, každé fórum má svoju farbu. Odznak na tlačidle počíta neprečítané príspevky; otvorenie príspevku (nová karta) ho označí ako prečítaný a „Označiť všetko ako prečítané“ všetko naraz vymaže.',
              'Ide o webový doplnok: tlačidlo možno skryť v pokročilých voľbách („Tlačidlo fóra v záhlaví lobby“).'] },
        { id: 'avatars', t: 'Avatary a vlajky',
          b: ['Na pokerth.net sa tvoj avatar rozosiela ostatným hráčom cez avatarový server a na hráčskych boxoch sa môže zobrazovať malá vlajka krajiny. Oboje je voliteľné a nastaviteľné v možnostiach.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Tréningový režim',
      sections: [
        { id: 'what', t: 'Čo to je',
          b: ['Režim Lokálna hra / tréning je plnohodnotná partia proti súperom riadeným počítačom: bez pripojenia, bez účtu, o nič nejde. Len čo je aplikácia nainštalovaná (alebo len raz navštívená), funguje úplne offline — ideálne na učenie hry, skúšanie rozhrania alebo krátenie času v režime lietadlo.'] },
        { id: 'setup', t: 'Nastavenie hry',
          b: ['Zvoľ počet súperov, počiatočný stack, blindy a ich rast a rýchlosť hry. Zloženie a obtiažnosť botov sa ladí v Pokročilé možnosti \u2192 Lokálna hra — od miernych súperov po tvrdší a pestrejší stôl.'] },
        { id: 'trophies', t: 'Trofeje',
          b: ['Tréningový režim má vlastný postup: 28 trofejí v šiestich kategóriách (postup, technika, štýl, formáty, zábava a jedna tajná) sa odomyká hraním — odohrané ruky, vyhrané partie, veľké blafy, zvláštne ruky a ďalšie. Postup trofejí je kumulatívny a pri zapnutej synchronizácii nastavení účtu sa zlučuje medzi zariadeniami.'] },
        { id: 'learn', t: 'Dobré miesto na učenie',
          b: ['Všetko opísané v ostatných kapitolách funguje aj tu: monitor pravdepodobností, asistenčné zobrazenie, predvoľba, klávesové skratky. Tréningový režim je najlepšie miesto, kde si ich bez tlaku vyskúšať, kým vyrazíš na pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Štýl a zvuk',
      sections: [
        { id: 'themes', t: 'Motívy',
          b: ['Kategória Štýl v Pokročilých možnostiach oblieka celého klienta. Predvoľby nastavia všetko jedným ťuknutím (klasické zelené kasíno, oficiálny vzhľad PokerTH\u2026); pod nimi jednotlivé osi zvlášť ladia farebnú paletu, plátno stola a líca kariet — zmeň ľubovoľnú os a tvoja kombinácia sa stane vlastným motívom. Tmavý, svetlý alebo automatický režim sa volí v Používateľskom rozhraní a tvoje voľby platia okamžite, na každej obrazovke, a pamätajú sa.'] },
        { id: 'tablelook', t: 'Stoly, balíčky, miesta',
          b: ['Okrem motívu možno nezávisle meniť niekoľko prvkov: pozadie stola, balíček kariet, rub kariet (automaticky zladený s balíčkom, alebo importuj vlastný obrázok), žetóny dílera a blindov, štýl akčných tlačidiel a kompletné balíky miest, ktoré prezliekajú hráčske boxy. Všetko zvolíš v Pokročilé možnosti \u2192 Štýl; zmeny sú pri stole vidieť okamžite.'] },
        { id: 'music', t: 'Hudobný prehrávač',
          b: ['Položka hudby v menu hlavičky otvorí malý prehrávač hudby na pozadí: vyber skladbu z playlistu, prehrať/pauza, predchádzajúca/ďalšia, náhodne a opakovanie jednej skladby, celého playlistu alebo ničoho. Hlasitosť, vybraná skladba a režim opakovania sa pamätajú. Prehrávanie nikdy nezačne samo — prehliadače vyžadujú ťuknutie — a prehrávač je úplne nezávislý od herných zvukových efektov.'] },
        { id: 'sounds', t: 'Zvukové efekty',
          b: ['Herné zvuky sú zoskupené do štyroch samostatne zapínateľných kategórií, presne ako v desktopovom klientovi: herné akcie (rozdané karty, Check, Call, Raise, tvoj ťah\u2026), oznámenie chatu lobby, oznámenia sieťovej hry (hráč sa pripojil, hra pripravená) a oznámenie zvýšenia blindov. Jediný posuvník hlasitosti riadi všetko, v Pokročilé možnosti \u2192 Zvuk.'],
          note: 'Všetky prehliadače — najmä iOS — odmietajú prehrať zvuk, kým sa stránky raz nedotkneš. Ak sa hra začne potichu, jediné ťuknutie kamkoľvek zvuk prebudí; klient tiež automaticky opraví zvukový engine, keď ho iOS pozastaví (prichádzajúci hovor, pozadie\u2026).' },
        { id: 'voice', t: 'Hlas a vibrácie',
          b: ['Dva ďalšie kanály ťa môžu informovať bez pozerania na obrazovku: hlasové oznámenia predčítavajú herné udalosti pomocou syntézy reči tvojho zariadenia a na telefóne môže krátka vibrácia označiť tvoj ťah. Oboje sú webové rozšírenia, predvolene zapnuté či nie podľa zariadenia, v Pokročilé možnosti \u2192 Stávky a ťah.'],
          note: 'Vibrácie fungujú na Androide (prehliadače Chromium); Apple webom API vibrácií nesprístupňuje, takže iPhony vibrovať nemôžu. Hlasové oznámenia fungujú všade, ale dostupné hlasy a jazyky závisia od tvojho systému — klient použije najlepšiu nájdenú zhodu.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Možnosti a skratky',
      sections: [
        { id: 'where', t: 'Kde možnosti bývajú',
          b: ['Pokročilé možnosti otvoríš položkou s ozubeným kolieskom v ľubovoľnom menu hlavičky. Sú zoskupené ako v desktopovom klientovi: Používateľské rozhranie, Štýl, Zvuk, Lokálna hra, Sieťová hra, Internetová hra, Prezývky / Avatary, Správy logu a Obnoviť predvolené. Každá webová funkcia tam má vlastný vypínač, takže si vypneš všetko, čo nepoužívaš.'] },
        { id: 'cfgxml', t: 'Výmena nastavení s desktopovým klientom',
          b: ['Tvoje nastavenia môžu cestovať medzi klientmi: kategória Správy logu ponúka export/import oficiálneho súboru config.xml (toho \u007e/.pokerth/config.xml, ktorý používajú desktopoví a QML klienti). Export zapíše zdieľané nastavenia — meno, možnosti zobrazenia, zvuky, predvoľby stola, blindy, štýly — a import tu aplikuje súbor z desktopu. Nastavenia, ktoré tento klient nepozná, zostanú v súbore nedotknuté.'] },
        { id: 'sync', t: 'Nastavenia, ktoré ťa nasledujú',
          b: ['Keď hráš s účtom, tvoje možnosti, motív, priradenia klávesov, jazyk a tréningové trofeje sa synchronizujú: zmeň niečo na jednom zariadení a ďalšie zariadenie, kde sa prihlásiš, to prevezme. Postup trofejí sa zlučuje, nikdy neprepisuje, takže hranie na dvoch zariadeniach vždy zachová to najlepšie z oboch.'] },
        { id: 'updates', t: 'Zostať aktuálny',
          b: ['Klient sa aktualizuje sám: keď je nasadená nová verzia, banner ťa vyzve na obnovenie (alebo napíš /update do chatu na ručnú kontrolu). Občas sa môže objaviť malý produktový dotazník na tvoj názor na niektorú funkciu — účasť je dobrovoľná a dotazníky možno úplne vypnúť v Pokročilé možnosti \u2192 Komunita.'] },
        { id: 'fkeys', t: 'Oficiálne klávesové skratky',
          b: ['Ofici\u00e1lne funk\u010dn\u00e9 kl\u00e1vesy PokerTH funguj\u00fa v hre \u2014 Alt+S funguje kdeko\u013evek:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (poradie možno v možnostiach obrátiť)'],
            ['F5', 'Ukázať svoje karty (keď sa dá)'],
            ['F6 / F7 / F8', 'Ručný \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Ručný \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 História \u00b7 Panel šancí'],
            ['Alt+S', 'Nastavenia — kdekoľvek v aplikácii, nielen v hre'],
            ['F11', 'Celá obrazovka']],
          note: 'Skratky vyžadujú fyzickú klávesnicu. Na Macu F klávesy predvolene ovládajú médiá: drž Fn (alebo v nastaveniach macOS zapni \u201ePoužívať klávesy F1, F2 atď. ako štandardné funkčné klávesy\u201c). Na iPhone je celá obrazovka obmedzená systémom iOS — inštalácia aplikácie ako PWA dá rovnaký celoobrazovkový zážitok.' },
        { id: 'webkeys', t: 'Webové písmenové klávesy',
          b: ['Webové rozšírenie: jednopísmenové klávesy a Alt+T tiež spúšťajú akcie a všetky sa dajú premapovať v Pokročilých možnostiach → Klávesové skratky:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Panel štatistík'],
            ['Esc', 'Zavrieť vrchné okno (aj tlačidlo Späť na Androide)']],
          note: 'Na Androide systémové tlačidlo/gesto Späť zatvára okná ako Esc, namiesto toho, aby opustilo hru (nastaviteľné v možnostiach). iOS obdobné systémové tlačidlo nemá — použi \u2715 každého okna.' }
      ]
    }
  ]
};
