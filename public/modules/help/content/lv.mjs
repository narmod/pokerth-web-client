// ── help/content/lv.mjs — Latvian help corpus ───────────────────────────────
//
// Structure: chapters[] → { id, icon, title, sections[] }.
// Section: { id, t (title), b (paragraphs[]), list (bullets[]), keys ([kbd,
// label][]) }. Plain text only — the renderer escapes everything.
// Same ids in the same order as en.mjs, with the same fields and the same
// list lengths. Poker action terms (Fold, Check, Call, Bet, Raise, All-In)
// stay in English, as everywhere else.
//
// WORK IN PROGRESS: written in stages. The language is not registered in
// modules/i18n.mjs yet, so nothing loads this file.
export const help = {
  chapters: [
    {
      id: 'start', icon: '🚀', title: 'Pirmie soļi',
      sections: [
        { id: 'modes', t: 'Trīs veidi, kā spēlēt',
          b: ['Pieteikšanās ekrānā izvēlies, kā vēlies spēlēt.'],
          list: [
            'Internets — spēlē tiešsaistē oficiālajā pokerth.net serverī, ar reitingiem. Nepieciešams pokerth.net konts; reģistrējies bez maksas vietnē pokerth.net.',
            'Lokāli / treniņš — spēlē bezsaistē pret botiem. Nekas nav jāiestata, darbojas bez savienojuma, un spēlējot atbloķējas trofejas.',
            'LAN / Dedicētais serveris — savienojies ar privātu PokerTH serveri savā lokālajā tīklā vai savā datorā.'] },
        { id: 'lan', t: 'LAN / dedicētais serveris',
          b: ['Trešais režīms savienojas ar jebkuru PokerTH serveri, ko darbini tu vai draugs — mājas tīklā, privātā VPS, jebkur. Ievadi servera adresi un portu, atzīmē TLS, ja serveris izmanto šifrētu portu, un piesakies ar segvārdu (viesa piekļuve darbojas, ja serveris to atļauj). Viss pie galda pēc tam notiek tieši tāpat kā oficiālajā serverī.'] },
        { id: 'famboard', t: 'Ģimenes rezultātu tabula',
          b: ['Tikai privātos serveros un LAN spēlēs klients par katru segvārdu uztur pastāvīgu statistiku — nospēlētās un uzvarētās partijas un spēles, lielākais ieguvums, labākā sērija — un koplieto to caur serveri, tāpēc visas ierīces ap galdu redz vienu un to pašu rezultātu tabulu. pokerth.net spēles šādi netiek uzskaitītas nekad, un treniņa režīma statistika glabājas pilnīgi atsevišķi.', 'Šajās spēlēs trofeju poga atver reitinga logu tā LAN cilnē: visi spēlētāji, kārtojami pēc vairākiem kritērijiem.'] },
        { id: 'language', t: 'Valoda',
          b: ['Saskarne ir pieejama 47 valodās. To jebkurā laikā vari mainīt papildu opcijās (zobrata izvēlne) sadaļā Lietotāja saskarne. Pokera darbību termini (Fold, Check, Call, Bet, Raise, All-In) pēc vienošanās paliek angliski, tieši tāpat kā darbvirsmas klientā.'] },
        { id: 'pwa', t: 'Instalēt kā lietotni',
          b: ['Šis klients ir progresīva tīmekļa lietotne (PWA): to vari instalēt no pārlūka izvēlnes (vai ar instalēšanas pogu galvenē) un iegūt pilnekrāna lietotni ar savu ikonu. Pēc instalēšanas tā startē uzreiz, un treniņa režīms pilnībā darbojas bezsaistē.'],
          note: 'Android un darbvirsmas Chrome/Edge pārlūkā visu izdara instalēšanas poga. iPhone un iPad ierīcēs Apple atļauj instalēt tikai caur Safari: kopīgošanas poga → “Pievienot sākuma ekrānam” — klients šos soļus parāda, kad tie ir vajadzīgi. Kad lietotne ir instalēta, poga pazūd.' },
        { id: 'platforms', t: 'Platformas un pārlūki',
          b: ['Klients darbojas jebkurā mūsdienīgā pārlūkā jebkurā sistēmā — Windows, macOS, Linux, Android, iOS. Dažas funkcijas balstās uz jaunākām pārlūka saskarnēm (API); ja kādas trūkst, funkcija paslēpjas vai paskaidro, kāpēc tā nav pieejama, nevis salūzt. Galvenās atšķirības, kas jāzina:'],
          list: [
            'Chrome / Edge (dators): darbojas viss, arī .pdb žurnāla rakstīšana mapē.',
            'Firefox: darbojas viss, izņemot .pdb žurnāla rakstīšanu mapē (šī API vēl nav pieejama).',
            'Safari / iOS: instalēšana notiek caur kopīgošanu → Pievienot sākuma ekrānam; nav vibrācijas; pilnekrāna režīms iPhone ierīcēs ir ierobežots; skaņa sākas pēc tava pirmā pieskāriena.',
            'Android: pilns atbalsts Chromium pārlūkos, ieskaitot vibrāciju un pogas “Atpakaļ” darbību.'] },
        { id: 'avatar', t: 'Segvārds un avatars',
          b: ['Pirms savienošanās pieteikšanās ekrānā izvēlies savu segvārdu un avataru. pokerth.net serverī tavs segvārds ir tava konta nosaukums; avatari tiek koplietoti ar citiem spēlētājiem caur avataru serveri.', 'Tavs avatars tiek nosūtīts, kad savienojies, un visi spēlētāji redz tieši to pašu. Ja to nomaini savienojuma laikā, jaunais avatars sāks darboties no nākamā savienojuma. Sākuma burts (Aa) netiek sūtīts: citi spēlētāji redz noklusējuma avataru.'] }
      ]
    },
    {
      id: 'rules', icon: '🃏', title: 'Pokera noteikumi',
      sections: [
        { id: 'basics', t: 'Teksasas Hold’em īsumā',
          b: ['PokerTH spēlē Teksasas Hold’em bez limita. Katrs spēlētājs saņem divas slēptās kārtis. Pēc tam galda vidū ar attēlu uz augšu tiek izliktas piecas kopējās kārtis. Uzvar labākā piecu kāršu kombinācija, kas izveidota no tavām divām kārtīm un piecām kopējām kārtīm jebkurā salikumā.'] },
        { id: 'blinds', t: 'Aklās likmes un dalītāja poga',
          b: ['Pirms katras partijas banku iesāk divas piespiedu likmes: mazā aklā likme un lielā aklā likme, ko liek divi spēlētāji pa kreisi no dalītāja pogas. Poga pēc katras partijas pārvietojas par vienu vietu pulksteņrādītāja virzienā, tāpēc aklās likmes pēc kārtas maksā visi. Spēlei turpinoties, aklās likmes regulāri pieaug.',
              'Pie galda dalītāju un aklās likmes apzīmē žetoni: D (dalītājs), SB (mazā aklā likme), BB (lielā aklā likme).'] },
        { id: 'streets', t: 'Četras likmju kārtas',
          list: [
            'Pre-flop — pēc slēpto kāršu izdalīšanas pirmā likmju kārta sākas pa kreisi no lielās aklās likmes.',
            'Flop — tiek atsegtas trīs kopējās kārtis, kam seko likmju kārta.',
            'Turn — ceturtā kopējā kārts, tad vēl viena likmju kārta.',
            'River — piektā un pēdējā kopējā kārts, tad noslēdzošā likmju kārta.'],
          b: ['Likmju kārta beidzas, kad visi partijā palikušie spēlētāji bankā ir ielikuši vienādu summu (vai ir all-in).'] },
        { id: 'actions', t: 'Ko vari darīt savā gājienā',
          list: [
            'Fold — atmet partiju. Tavas kārtis tiek noliktas malā, un tu vairs necīnies par banku.',
            'Check — paej garām, neliekot likmi. Iespējams tikai tad, kad nav nekā, ko izlīdzināt.',
            'Call — izlīdzini pašreizējo likmi.',
            'Bet — atklāj likmju kārtu, kad šajā posmā vēl neviens nav licis likmi.',
            'Raise — paaugstini jau esošu likmi. Minimālais paaugstinājums ir vienāds ar iepriekšējo likmi vai paaugstinājumu.',
            'All-In — ieliec visus savus žetonus. Tu paliec partijā līdz tai summai, ko esi nosedzis.'] },
        { id: 'showdown', t: 'Kāršu atklāšana un sadalītas bankas',
          b: ['Ja pēc river likmju kārtas ir palicis vairāk nekā viens spēlētājs, kārtis tiek atsegtas un uzvar labākā kombinācija — uzvarošā kombinācija tiek parādīta zem kopējām kārtīm. Kad spēlētājs ir all-in ar mazāku summu, nekā ir likmes, tiek veidotas sānu bankas: katrs spēlētājs var laimēt tikai to bankas daļu, kurā ir ielicis. Vienādas kombinācijas banku sadala.',
            'Atsegt kārtis nav jāvisiem: sākot ar pēdējo spēlētāju, kas licis likmi vai paaugstinājis, kombinācija tiek rādīta tikai tad, ja tā pārspēj to, kas jau ir atsegts. Ikviens, kam ir tiesības kārtis nerādīt, tās patur slēptas un saņem pogu “Rādīt”, lai tās tomēr atsegtu.'] },
        { id: 'hands', t: 'Kombināciju stiprums',
          b: ['No vājākās līdz stiprākajai:'],
          list: [
            '1. Augstākā kārts — nav kombinācijas; izšķir augstākā kārts.',
            '2. Pāris — divas viena ranga kārtis.',
            '3. Divi pāri — divi dažādi pāri.',
            '4. Trijnieks — trīs viena ranga kārtis.',
            '5. Rinda — piecas kārtis pēc kārtas (dūzis skaitās augstākais vai zemākais).',
            '6. Krāsa — piecas viena masta kārtis.',
            '7. Pilna māja — trijnieks kopā ar pāri.',
            '8. Četrinieks — četras viena ranga kārtis.',
            '9. Krāsainā rinda — rinda, visa vienā mastā.',
            '10. Karaliskā rinda — no desmitnieka līdz dūzim, visa vienā mastā. Labākā iespējamā kombinācija.'] },
      ]
    },
    {
      id: 'game', icon: '🎮', title: 'Spēles ekrāns',
      sections: [
        { id: 'actionbar', t: 'Darbību josla',
          b: ['Kad pienāk tavs gājiens, apakšā iedegas darbību josla ar līdz pat četrām pogām: Fold (sarkana), Check / Call (zila), Bet / Raise (zaļa — izceltā galvenā darbība) un All-In (tumši sarkana). Poga Check / Call rāda precīzu summu, kas jāizlīdzina; Bet / Raise rāda summu, ko gatavojies ielikt. Pēc river poga All-In var pārvērsties par pogu “Rādīt”, lai atsegtu savas kārtis.'] },
        { id: 'betctl', t: 'Likmes izvēle',
          b: ['Paaugstinājuma summu iestati ar ciparu lauku, slīdni vai ātrajām pogām 1/3 · 1/2 · Banka (pašreizējās bankas daļas). Summas tiek automātiski noapaļotas un turētas starp minimālo un maksimālo atļauto paaugstinājumu. Ja tev ērtāk domāt lielajās aklajās likmēs, ir opcija, kas visas summas rāda BB, nevis žetonos.'] },
        { id: 'preselect', t: 'Darbības iepriekšēja izvēle',
          b: ['Pirms sava gājiena vari darbību sagatavot jau iepriekš: pieskaries pogai, un tā iegūst zeltainu apmali ar mazu zeltainu punktu. Kad pienāk tava kārta, darbība notiek uzreiz. Iepriekš sagatavots Fold automātiski kļūst par Check, ja check ir bez maksas — tu nekad neatmet partiju par velti. Iepriekšējās izvēles tiek atiestatītas katrā jaunā partijā, posma maiņā un kāršu atklāšanā, un tiek atceltas, ja situācija mainās (piemēram, mainās izlīdzināmā summa).'] },
        { id: 'automodes', t: 'Automātiskie režīmi',
          b: ['Izvēlne blakus darbību pogām piedāvā trīs spēles režīmus: Manuāli, Auto Check/Call un Auto Check/Fold. Automātiskie režīmi spēlē tavā vietā, līdz pārslēdzies atpakaļ — jebkurš manuāls klikšķis uz darbības nekavējoties atgriež režīmu Manuāli.'] },
        { id: 'readtable', t: 'Kā lasīt galdu',
          b: ['Katrs spēlētāja lodziņš rāda avataru, vārdu, žetonus un pašreizējo likmi. Dalītāju un aklās likmes apzīmē žetoni D / SB / BB. Krāsaina nozīmīte uz lodziņa rāda spēlētāja pēdējo darbību; plāna zila josla atskaita viņa domāšanas laiku. Tā spēlētāja lodziņš, kura gājiens ir pašlaik, mirdz; tavs paša lodziņš tavā gājienā iegūst pulsējošu zeltainu rāmi.',
              'Statusa josla virs galda rāda kopējo banku, pašreizējā posma likmes, posmu (Pre-flop, Flop, Turn, River) un spēles un partijas numuru. Spēlētājiem, kas izdarījuši fold, kārtis ir caurspīdīgas; izslēgtie spēlētāji ir notumšoti. Partijas beigās uzvarētāja logs var apkopot, kurš ko laimēja — to var izslēgt opcijās.'] },
        { id: 'seatlayout', t: 'Vietu izvietojums',
          b: ['Kā tīmekļa papildinājumu spēlētāju lodziņu izkārtojumu vari izvēlēties papildu opcijās → Vietas: Automātisks seko oficiālajam klientam (fiksētas vietas portreta režīmā, aprēķināta elipse ainavas režīmā), vai arī uzspied Portreta vai Ainavas izkārtojumu — un Pielāgots ļauj katru vietu novietot pašam: parādās rediģēšanas režīms, kurā katru lodziņu vari aizvilkt tieši tur, kur vēlies, un izkārtojums tiek saglabāts.'] },
        { id: 'zoom', t: 'Galda tālummaiņa (telefoni)',
          b: ['Mazos ekrānos lupas pogas pietuvina galdu (2×), un ar pirkstu vari pārvietot skatu — tavs paša lodziņš un darbību josla paliek fiksēti. Skats automātiski seko aktīvajai vietai un kāršu atklāšanā attālinās atpakaļ, lai redzētu visu. To var izslēgt papildu opcijās.'],
          note: 'Telefonos un planšetēs pārlūka paša savilkšanas tālummaiņa pēc noklusējuma ir bloķēta, lai partijas vidū nejauši nenostrādātu tālummaiņas žests; ja tev tā ērtāk, ieslēdz to atpakaļ papildu opcijās → Lietotāja saskarne.' },
        { id: 'protections', t: 'Aizsardzība pret ieskatīšanos un nejaušu Call',
          b: ['Divas izvēles aizsardzības: aizsardzība pret ieskatīšanos patur tavas kārtis slēptas, līdz tām pieskaries (noder, kad kāds var redzēt tavu ekrānu), bet nejauša Call aizsardzība uz brīdi bloķē pogu Call tūlīt pēc liela paaugstinājuma, lai pieskāriens, kas bija domāts mazākai summai, nejauši netrāpītu paaugstinātajai. Abas ir atrodamas papildu opcijās.'] }
      ]
    },
    {
      id: 'info', icon: '📊', title: 'Informācijas panelis',
      sections: [
        { id: 'open', t: 'Paneļa atvēršana',
          b: ['Spēles laikā informācijas panelis atveras no galvenes (vai ar Alt+L / Alt+I), un tam ir trīs cilnes: Žurnāls, Iespējas un Statistika. Telefonos tas peld virs galda; lielākos ekrānos tas ir pārvietojams logs ar maināmu izmēru — satver ⣿ rokturi, lai pārvietotu, malas, lai mainītu izmēru. Tā novietojums tiek atcerēts.'] },
        { id: 'log', t: 'Spēles žurnāls',
          b: ['Cilne Žurnāls fiksē visu spēli partiju pa partijai: aklās likmes, katru darbību ar summām, atsegtās kārtis un uzvarētājus, krāsu kodētus ātrai lasīšanai. Eksporta poga saglabā žurnālu kā failu, ja vēlies sesiju pārskatīt vēlāk.'] },
        { id: 'odds', t: 'Iespējas (izredžu monitors)',
          b: ['Cilne Iespējas rāda tavai pašreizējai partijai dzīvu varbūtību, ka beigās iegūsi katru no 10 kombināciju veidiem — no Augstākās kārts līdz Karaliskajai rindai — katru ar savu ikonu, procentiem un joslu. Kad esi izdarījis fold, attēlojums kļūst pelēks. Tas izmanto tikai tavas paša kārtis un kopējās kārtis: tas neredz neko, ko pretinieki nerāda.'] },
        { id: 'journal', t: 'Partiju žurnāli un logs “Žurnāli”',
          b: ['Papildus dzīvajam žurnālam katra tava nospēlētā partija tiek lokāli ierakstīta tavā pārlūkā tādā pašā formātā kā oficiālā klienta .pdb žurnālu faili. Logs “Žurnāli” (papildu opcijas → Žurnāla ziņojumi → Pārvaldīt žurnālus…) uzskaita tavas sesijas un ļauj ar tām strādāt: priekšskatīt sesiju ar meklēšanu un izcelšanu, filtrēt pēc spēles, eksportēt kā HTML vai vienkāršu tekstu, saglabāt neapstrādāto .pdb failu vai importēt .pdb, ko ierakstījis darbvirsmas klients. Sesijas var dzēst pa vienai vai visas uzreiz (ar apstiprinājumu), un automātiskās glabāšanas iestatījums var paturēt tikai pēdējās 7, 30, 90, 180 vai 365 dienas. Žurnāli, ko importē pats, nekad netiek noņemti automātiski. Otrs iestatījums ierobežo paturēto sesiju skaitu, un saraksta kolonnu var paplašināt, to aizvelkot.',
              'Lai iztīrītu vairākas sesijas uzreiz, poga “Atlasīt…” pārvērš sarakstu ķeksīšos: atzīmē tās, no kurām gribi atbrīvoties, un “Dzēst” noņem visu grupu pēc viena apstiprinājuma. Datorā vari arī ar Ctrl (⌘) + klikšķi pievienot sesijas pa vienai vai ar Shift + klikšķi paņemt veselu diapazonu.',
              'Poga “Analizēt” veic partiju analīzi par sesiju un var nosūtīt žurnālu pokerth.net analīzes pakalpojumam. Viss paliek tavā ierīcē, ja vien to pats nepārprotami neeksportē vai neaugšupielādē.'] },
        { id: 'logopts', t: 'Žurnalēšanas opcijas',
          b: ['Papildu opcijās → Žurnāla ziņojumi vari ieslēgt vai izslēgt žurnalēšanu un izvēlēties rakstīšanas intervālu ar tiem pašiem trim iestatījumiem, kas darbvirsmas klientā: pēc katras darbības, pēc katras partijas (noklusējums) vai pēc katras spēles. Vēl viena opcija raksta .pdb failu tevis izvēlētā mapē un uztur to aktuālu ar šo intervālu, kā arī vēlreiz, kad pamet lapu, lai cits rīks varētu sekot spēlei tiešraidē.'],
          note: 'Rakstīšanai lokālā mapē ir vajadzīga File System Access API: tikai darbvirsmas Chrome, Edge un Opera. Citur opcija pati paskaidro situāciju, un manuālais eksports no loga “Žurnāli” paliek pieejams. Pārlūks failu var tikai aizstāt, nevis tam kaut ko pievienot beigās, tāpēc rīkam, kas lasa .pdb, tas pēc katras izmaiņas jāatver no jauna.' },
        { id: 'assist', t: 'Asistents (kombinācijas stiprums)',
          b: ['Cilnes Iespējas augšdaļā asistenta josla nolasa tavu kombināciju tavā vietā. Pirms flopa tā nosauc tavas sākuma kārtis un novērtē tās ar zvaigznēm; sākot ar flopu, tā rāda tavu pašreizējo labāko kombināciju un pēc ātras simulācijas — tavas aplēstās izredzes uzvarēt partijā procentos, ar krāsu skalu no sarkanas (vāja) līdz zaļai (stipra). Tāpat kā izredžu monitors, tas izmanto tikai to informāciju, ko redzi arī tu.',
              'Papildu opcijās → Vietas ir pieejami divi attēlojuma stili: Segmenti (desmit bloki) vai klasiska progresa josla. Visu asistenta funkciju var izslēgt papildu opcijās → Asistents.'] },
        { id: 'assistwin', t: 'Asistents kā peldošs logs',
          b: ['Asistenta bloku var atdalīt no paneļa savā mazā logā, kas vienmēr ir virspusē: izmanto bloka atdalīšanas pogu, tad pārvieto un maini tā izmēru jebkur virs galda — ērti, lai sekotu savas kombinācijas stiprumam, neturot atvērtu visu paneli. Piestiprināšanas poga to liek atpakaļ cilnē Iespējas, un tā novietojums tiek atcerēts. Paneļa iekšpusē vilkšanas rokturis starp Asistentu un izredzēm ļauj sadalīt vietu starp abiem.'] },
        { id: 'stats', t: 'Statistika',
          b: ['Cilne Statistika seko tavai sesijai: nospēlētās partijas, redzētie flopi, kāršu atklāšanas, uzvaru īpatsvars un vēl. Statistikas uzskaiti var izslēgt papildu opcijās.'] },
        { id: 'hud', t: 'Statistikas HUD uz vietām',
          b: ['HUD pievieno mazu statistikas lodziņu blakus katra spēlētāja vietai, veidotu no partijām, ko esi ierakstījis savos žurnālos: novēroto partiju skaits, tad VPIP (cik bieži spēlētājs pre-flop brīvprātīgi iegulda naudu), PFR (paaugstinājumi pre-flop) un AF (agresivitātes koeficients), krāsu kodēti no pasīva līdz agresīvam. Zem tiem nozīmīte raksturo spēlētāju vienkāršos vārdos — Šaurs-pasīvs, Plašs-agresīvs un tā tālāk — blakus mazam ciparnīcas attēlam, kura izgaismotais sektors no kreisās uz labo nozīmē no šaura līdz plašam, bet no apakšas uz augšu — no pasīva līdz agresīvam. Nozīmīte parādās jau no pirmās partijas, bet paliek notumšota līdz 25 partijām, kad tā kļūst uzticama. Pieskaries lodziņam, lai atvērtu detalizētu logu ar visiem skaitļiem (3-bet, turpinājuma likme, fold pret 3-bet, mēģinājumi nozagt banku, kāršu atklāšanas rādītāji…), un aizvelc lodziņu, ja tas kaut ko aizsedz.',
              'HUD zina tikai to, ko esi redzējis pie saviem galdiem — tas lasa tavus lokālos partiju žurnālus, tāpēc žurnalēšanai ir jābūt ieslēgtai, un skaitļi kļūst jēgpilni pēc pietiekami daudzām partijām. Pēc noklusējuma tas ir izslēgts: ieslēdz to papildu opcijās → Asistents.'] },
        { id: 'handsbtn', t: 'Kombināciju pārskats',
          b: ['Pokera kombināciju ikona uz galda jebkurā brīdī atver ātru pārskatu par 10 kombinācijām — noderīgi, kamēr mācies. To var paslēpt papildu opcijās.'] }
      ]
    }
  ]
};
