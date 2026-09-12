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
    },
    {
      id: 'chat', icon: '💬', title: 'Tērzēšana un saziņa',
      sections: [
        { id: 'panels', t: 'Vestibila un spēles tērzēšana',
          b: ['Tērzēšana ir gan vestibilā, gan pie galda. Telefonos spēles tērzēšana peld virs galda; lielākos ekrānos tas ir pārvietojams logs ar maināmu izmēru. Nozīmīte uz tērzēšanas pogas skaita neizlasītās ziņas.'] },
        { id: 'typing', t: 'Rakstīšanas palīgi',
          list: [
            'Tab pabeidz segvārdu — nospied Tab vēlreiz, lai pārslēgtos starp sakritībām.',
            '↑ / ↓ pārlūko tavu paša ziņu vēsturi.',
            'Emocijzīmju poga atver pilnu izvēlni; rakstot : arī tiek piedāvātas emocijzīmes.'] },
        { id: 'emotes', t: 'Emocijzīmes un smaidiņi',
          b: ['Tērzēšana pārveido emocijzīmju kodus tieši tāpat kā oficiālais darbvirsmas klients: ieraksti nosaukumu starp koliem, un tas kļūst par emocijzīmi — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… tiek atbalstīti vairāk nekā 1900 kodu (viss GitHub komplekts). Tiek pārveidoti arī klasiskie teksta smaidiņi: :-) ;) :D xD :P <3 un vēl kādi astoņdesmit citi.',
              'Rakstot : atveras ieteikumu logs, kas kodu pabeidz rakstīšanas laikā (↑/↓, lai izvēlētos, Tab vai Enter, lai apstiprinātu). Emocijzīmju pārveidošanu var pilnībā atspējot papildu opcijās → Tērzēšana.'] },
        { id: 'commands', t: 'Tērzēšanas komandas',
          b: ['Tērzēšana saprot slīpsvītras komandas. Divas no tām redz arī citi:'],
          keys: [
            ['/me <teksts>', 'Darbības ziņa, ko rāda kā “* tavsvārds teksts”'],
            ['/emoji <emocijzīme>', 'Atskaņo emocijzīmes reakciju (to pašu, ko sūta reakciju izvēlne)']] },
        { id: 'diagcmds', t: 'Diagnostikas komandas',
          b: ['Viss pārējais ir lokāls: atbildes redzi tikai tu, un pie galda netiek nosūtīts nekas. Ieraksti /help, lai uzskaitītu visas. Noderīgākās:'],
          keys: [
            ['/help', 'Uzskaitīt visas komandas'],
            ['/update', 'Pārbaudīt, vai ir jauna versija, un pārlādēt'],
            ['/lang <kods>', 'Mainīt valodu (piem., /lang lv)'],
            ['/sound on|off', 'Ieslēgt vai izslēgt spēles skaņas'],
            ['/zoom', 'Ieslēgt vai izslēgt galda lupu'],
            ['/clear', 'Notīrīt tērzēšanu lokāli'],
            ['/table', 'Pašreizējās spēles informācija (aklās likmes, spēlētāji, žetoni)'],
            ['/diag · /netdbg · /fps', 'Klienta stāvokļa, tīkla un kadru ātruma diagnostika'],
            ['/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg', 'Padziļināta atkļūdošana (kārtis, protokols, audio, krātuve, vietas)'],
            ['/copy', 'Kopēt pēdējās komandas atbildi starpliktuvē']] },
        { id: 'privatemsg', t: 'Privātās ziņas',
          b: ['Raksti vienam spēlētājam tā, lai nelasa viss vestibils. Aploksne blakus vārdam spēlētāju sarakstā atver sarunu ar viņu; aploksne vestibila galvenē atkal atver pēdējo sarunu. Sarunas tiek glabātas šajā ierīcē un ir klāt arī tad, kad atgriezies, tāpēc pēc dažām dienām atsākta saruna nes līdzi savu vēsturi — sarkans skaitlis uz aploksnes rāda, cik ziņu vēl neesi izlasījis, un miskaste loga virsrakstā izdzēš sarunu pavisam.'],
          keys: [
            ['/msg <segvārds> <teksts>', 'Nosūtīt privātu ziņu no vestibila tērzēšanas'],
            ['/msg "<segvārds ar atstarpēm>" <teksts>', 'Tas pats, ja segvārdā ir atstarpes']],
          note: 'Ziņas nedrīkst pārsniegt 128 rakstzīmes. Serveris nepiegādā privātu ziņu spēlētājam, kurš sēž pie notiekošas spēles galda, un vēsture glabājas tikai šajā pārlūkā — uz citu ierīci tā tev līdzi neseko.' },
        { id: 'reactions', t: 'Emocijzīmju reakcijas',
          b: ['Reakciju poga atver izvēlni ar 30 animētām reakcijām (🎉, 😂, 😱, 🔥…), kas ar efektu atskan virs tavas vietas un ir redzamas visiem pie galda — arī spēlētājiem darbvirsmas klientā. Reakcijas var pilnībā atspējot papildu opcijās.'] },
        { id: 'translate', t: 'Kā saprast visus',
          b: ['Kad tērzēšanas tulkošana ir ieslēgta, uz rindas zem tava kursora — vai uz rindas, kurai pieskaries skārienekrānā — parādās tulkošanas poga, kas šo ziņu atveido tavā valodā, izmantojot pārlūka iebūvēto tulkotāju. Papildu opcijās → Tērzēšana to var rādīt pastāvīgi uz katras rindas; tur atrodas arī paskaidrojums par biežākajiem galda saīsinājumiem (gg, nh, utg…).'],
          note: 'Tulkošana izmanto Google Translate pakalpojumu un darbojas jebkurā pārlūkā — vajadzīgs tikai interneta savienojums. Ziņa tulkošanas pakalpojumam tiek nosūtīta tikai tad, kad pieskaries tās tulkošanas pogai, nekad automātiski.' },
        { id: 'social', t: 'Spēlētāji: profils, uzaicinājums, ignorēšana',
          b: ['Pieskaries jebkuram spēlētājam — pie galda vai vestibila sarakstā — lai atvērtu viņa kartīti: profils un statistika, uzaicinājums uz tavu spēli vai ignorēšana (viņa tērzēšanas ziņas tiek paslēptas; ignorēšanu jebkurā brīdī var atcelt). Opcijās var ieslēgt apstiprinājumu pirms uzaicināšanas vai ignorēšanas.'] }
      ]
    },
    {
      id: 'lobby', icon: '🏛️', title: 'Vestibils un spēles',
      sections: [
        { id: 'list', t: 'Spēļu saraksts',
          b: ['Vestibils uzskaita visus serverī esošos galdus. Katrs ieraksts rāda spēlētāju skaitu, spēles veidu, piekaramo atslēgu, ja vajadzīga parole vai uzaicinājums, un statusa nozīmīti: “Gaida” (zaļa — spēle vēl nav sākusies, vari pievienoties, ja ir brīva vieta), “Notiek” (silta krāsa — skatāma tiešraidē, ja skatītāji ir atļauti) un “Slēgts” (notumšota). Pilns galds vienkārši rāda pilnu skaitu, piemēram, 10/10; nozīmīšu krāsas seko aktīvajam motīvam.',
              'Filtru izvēlne sašaurina sarakstu tieši tāpat kā darbvirsmas klientā, katra izvēle stingrāka par iepriekšējo: tikai atvērtas spēles → tad arī paslēpjot pilnos galdus → tad tikai neprivātās, tikai privātās vai tikai reitinga spēles. Tava izvēle tiek atcerēta. Meklēšanas lauks atrod spēli pēc nosaukuma, un spēlētāju plāksnīte atver visu tiešsaistē esošo sarakstu, kurā var meklēt un kārtot.'] },
        { id: 'join', t: 'Pievienošanās un vērošana',
          b: ['Izvēlies atvērtu spēli un pievienojies tai — piekaramā atslēga nozīmē, ka vajadzīga parole. Notiekošas spēles, kurās ir atļauti skatītāji, var vērot tiešraidē: tu redzi galdu un tērzēšanu, taču slēptās kārtis paliek neredzamas, un rīkoties tu nevari.'] },
        { id: 'gameinfo', t: 'Spēles informācija',
          b: ['Pirms pievienošanās spēles informācijas kartīte rāda visu, kas galdu raksturo: spēles veidu, aklās likmes un to pieaugumu (dubultošana vai manuāls saraksts), sākuma žetonus, darbības noildzi, pauzi starp partijām un to, kurš jau sēž pie galda.'] },
        { id: 'create', t: 'Spēles izveide',
          b: ['Izveido savu galdu: nosaukums, spēlētāju skaits, sākuma žetoni, pirmā mazā aklā likme un paaugstināšanas grafiks, darbības noildze un tas, vai ir atļauti skatītāji. Ir četri spēles veidi: parasta (ikvienam), tikai reģistrētiem spēlētājiem, tikai ar uzaicinājumu un Ranking (ieskaitās oficiālajā reitingā — tur parole nav atļauta). Iecienītos iestatījumus var saglabāt un ielādēt atkal.'] },
        { id: 'invites', t: 'Uzaicinājumi',
          b: ['Spēlētāji var uzaicināt tevi pie sava galda; tu saņem paziņojumu, ko vari pieņemt vai noraidīt. Uzaicinājums ir vienīgais ceļš uz spēli, kurā piedalās tikai uzaicinātie.'] }
      ]
    },
    {
      id: 'pthnet', icon: '🌐', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Tavs konts',
          b: ['Oficiālais interneta serveris ir pokerth.net. Lai tur spēlētu, ir nepieciešams bezmaksas pokerth.net konts — reģistrējies vietnē, tad piesakies šeit ar to pašu segvārdu un paroli. Šis tīmekļa klients savienojas ar tieši to pašu serveri, ar kuru darbvirsmas klients: tie paši konti, tie paši galdi, tie paši reitingi, un tu vari sēdēt pie viena galda ar darbvirsmas spēlētājiem.'] },
        { id: 'ranked', t: 'Reitinga spēles un sezonas',
          b: ['Ranking veida spēles ieskaitās oficiālajā sezonas reitingā. Tavs profils lietotnē rāda, kad pievienojies, tavu pašreizējās sezonas vietu, rezultātu, vidējo un nospēlēto spēļu skaitu, kā arī jaunākos rezultātus. Parastās (ne reitinga) spēles ir tikai priekam un neko nemaina.'] },
        { id: 'rankhow', t: 'Kā tiek aprēķināts reitings',
          b: ['Katrā reitinga spēlē iegūtā vieta dod punktus: 15 par pirmo, tad 9, 6, 4, 3, 2 un 1 līdz septītajai vietai; no astotās līdz desmitajai punktu nav. Tātad viens galds izdala kopā 40 punktus.',
              'Tavs rezultāts nav šo punktu summa, bet gan tavs vidējais rādītājs par spēli, ko mēreno koeficients, kas pieaug līdz ar nospēlēto spēļu skaitu: ar dažiem labiem rezultātiem, lai nostiprinātos augšgalā, nepietiek — vajadzīga arī regularitāte: jo vairāk spēlē, jo tuvāk tavs rezultāts ir tavam patiesajam vidējam. Sezona ilgst ceturksni: pārejā viss tiek arhivēts un skaitītāji sākas no nulles, bet iepriekšējās sezonas paliek pieejamas. Spēlē pjedestāla poga rāda tava galda spēlētāju sezonas reitingu.'],
          note: 'Punktu skalu un precīzo formulu nosaka pokerth.net reitinga serveris, un tās var mainīties; atsauce ir lapas vietnē.' },
        { id: 'rankings', t: 'Reitinga lapas',
          b: ['Reitinga ieraksts atver oficiālo PokerTH reitingu, kurā var meklēt pēc spēlētāja, kā arī kopienu reitingus (BBC, WEC). Ja reitingi tevi neinteresē, šo ierakstu var paslēpt papildu opcijās → Kopiena.'] },
        { id: 'cups', t: 'Kopienu kausi: BBC un WeCup',
          b: ['Divas kopienas pokerth.net serverī rīko savas sacensības, katra ar savu vietni un reitingu. Best Brainies Cup (BBC) ir pakāpienu turnīrs, kas radies 2013. gadā: tu virzies no 1. pakāpiena līdz 4. pakāpienam, un pēc katras 4. pakāpiena spēles, kad tiek pasniegts kauss, sākas jauna sezona. WeCup (WEC) ir sava, daudz plašāka skala — 75 punkti par pirmo vietu, tad 45, 30, 20… — un tā rezultāts normalizē tavu vidējo pret nospēlēto spēļu skaitu salīdzinājumā ar pārējiem dalībniekiem.',
              'Abi reitingi atveras no trofeju pogas, blakus PokerTH reitingam. Šo sacensību galda iestatījumi ir pieejami kā sagataves, kad izveido spēli (BBC Step 1 līdz 4, WEC, WEC Monthly Final un WEC Grand Final), tāpēc vari trenēties tādos pašos apstākļos. Lai piedalītos, ir jāpiesakās attiecīgā kausa vietnē.'],
          note: 'Ja kausi nav tava interese, šos saturus var paslēpt visus uzreiz papildu opcijās → Kopiena.' },
        { id: 'forumcups', t: 'Foruma kausi un pasākumi',
          b: ['pokerth.net forumā notiek arī Monthly Cup — ikmēneša sērija, kurā spēlētāji tiek sadalīti pie zelta, sudraba un bronzas galdiem, pirms tiek kronēts mēneša čempions, kā arī atsevišķi īpašie kausi gada garumā.',
              'Pieteikšanās, grafiki, galda iestatījumi un rezultāti tiek publicēti forumā, un spēles notiek oficiālajā serverī tāpat kā jebkuras citas. Lai sekotu rezultātiem, pietiek ar pokerth.net kontu; pieteikšanās kausam notiek attiecīgajā foruma tēmā.'] },
        { id: 'forumnews', t: 'Foruma jaunumi vestibilā',
          b: ['Avīzes poga vestibila galvenē atver jaunākos pokerth.net foruma ierakstus, pa vienam ierakstam no katras tēmas, katram forumam savā krāsā. Nozīmīte uz pogas skaita neizlasītos ierakstus; ieraksta atvēršana (jaunā cilnē) to atzīmē kā izlasītu, un “Atzīmēt visus kā lasītus” notīra visu uzreiz.',
              'Šis ir tīmekļa papildinājums: pogu var paslēpt papildu opcijās (“Foruma poga vestibila galvenē”).'] },
        { id: 'avatars', t: 'Avatari un karogi',
          b: ['pokerth.net serverī tavs avatars tiek izplatīts citiem spēlētājiem caur avataru serveri, un uz spēlētāju lodziņiem var rādīt mazu valsts karogu. Abas iespējas ir brīvi izvēlamas un konfigurējamas opcijās.'] }
      ]
    },
    {
      id: 'offline', icon: '🏋️', title: 'Treniņa režīms',
      sections: [
        { id: 'what', t: 'Kas tas ir',
          b: ['Lokālais / treniņa režīms ir pilnvērtīga spēle pret datora pretiniekiem: bez savienojuma, bez konta, bez likmēm. Kad lietotne ir instalēta (vai vienkārši reizi apmeklēta), tā darbojas pilnīgi bezsaistē — lieliski piemērots, lai mācītos spēli, izmēģinātu saskarni vai pavadītu laiku lidmašīnas režīmā.'] },
        { id: 'setup', t: 'Spēles iestatīšana',
          b: ['Izvēlies pretinieku skaitu, sākuma žetonus, aklās likmes un to paaugstināšanas grafiku, kā arī spēles ātrumu. Botu sastāvu un grūtību var pielāgot papildu opcijās → Lokālā spēle — no maigiem pretiniekiem līdz stingrākam, jauktam galdam.'] },
        { id: 'trophies', t: 'Trofejas',
          b: ['Treniņa režīmam ir sava progresa sistēma: spēlējot atbloķējas 28 trofejas sešās kategorijās (progress, prasme, stils, formāti, izklaide un viena slepenā) — par nospēlētajām partijām, uzvarētajām spēlēm, lieliem blefiem, īpašām kombinācijām un vēl. Tavs trofeju progress uzkrājas un tiek apvienots starp ierīcēm, kad ir aktīva konta iestatījumu sinhronizācija.'] },
        { id: 'learn', t: 'Laba vieta, kur mācīties',
          b: ['Šeit darbojas viss no pārējām nodaļām: izredžu monitors, asistenta attēlojums, darbību iepriekšēja izvēle, īsinājumtaustiņi. Treniņa režīms ir labākā vieta, kur tos izmēģināt bez spiediena, pirms dodies uz pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '🎨', title: 'Stils un skaņa',
      sections: [
        { id: 'themes', t: 'Motīvi',
          b: ['Papildu opciju sadaļa Stils pārveido visa klienta izskatu. Sagataves iestata visu ar vienu pieskārienu (klasiskais zaļais kazino, oficiālais PokerTH izskats…); zem tām atsevišķas asis ļauj atsevišķi precizēt krāsu paleti, galda audumu un kāršu attēlus — mainot jebkuru asi, tavs salikums kļūst par pielāgotu motīvu. Tumšais, gaišais vai automātiskais režīms tiek izvēlēts sadaļā Lietotāja saskarne, un tavas izvēles stājas spēkā uzreiz, visos ekrānos, un tiek atcerētas.'] },
        { id: 'tablelook', t: 'Galdi, kāršu komplekti, vietas',
          b: ['Papildus motīvam vairākus elementus var nomainīt atsevišķi: galda fonu, kāršu komplektu, kāršu aizmuguri (automātiski atbilstoši komplektam vai importējot savu attēlu), dalītāja un aklo likmju žetonus, darbību pogu stilu un veselus vietu komplektus, kas pārveido spēlētāju lodziņus. Visu izvēlies papildu opcijās → Stils; izmaiņas pie galda ir redzamas nekavējoties.'] },
        { id: 'music', t: 'Mūzikas atskaņotājs',
          b: ['Mūzikas ieraksts galvenes izvēlnēs atver nelielu lounge mūzikas atskaņotāju: izvēlies ierakstu no saraksta, atskaņo/pauzē, iepriekšējais/nākamais, sajauc un atkārto vienu ierakstu, visu sarakstu vai neko. Skaļums, izvēlētais ieraksts un atkārtošanas režīms tiek atcerēti. Atskaņošana nekad nesākas pati no sevis — pārlūkiem ir vajadzīgs pieskāriens — un atskaņotājs ir pilnīgi neatkarīgs no spēles skaņas efektiem.', 'Divi īkšķi zem ieraksta nosaukuma pasaka, vai tev patīk tas, kas skan. Viens anonīms balsojums no ierīces, arī par radio, un to jebkurā brīdī vari mainīt vai atsaukt; ja vien operators neatklāj kopsummas, tu redzi tikai savu īkšķi.'] },
        { id: 'sounds', t: 'Skaņas efekti',
          b: ['Spēles skaņas ir sagrupētas četrās kategorijās, ko var ieslēgt atsevišķi, tieši tāpat kā darbvirsmas klientā: spēles darbības (kāršu dalīšana, Check, Call, Raise, tavs gājiens…), vestibila tērzēšanas paziņojums, tīkla spēles paziņojumi (spēlētājs pievienojies, spēle gatava) un aklo likmju paaugstināšanas paziņojums. Tos visus vada viens skaļuma slīdnis papildu opcijās → Skaņa.'],
          note: 'Visi pārlūki — it īpaši iOS — atsakās atskaņot audio, pirms neesi vismaz reizi pieskāries lapai. Ja spēle sākas klusumā, viens pieskāriens jebkur atdzīvina skaņu; klients arī pats salabo audio dzinēju, kad iOS to aptur (ienākošs zvans, pāreja fonā…).' },
        { id: 'voice', t: 'Balss un vibrācija',
          b: ['Divi papildu kanāli var tevi informēt, neskatoties ekrānā: balss paziņojumi nolasa spēles notikumus, izmantojot tavas ierīces runas sintēzi, un telefonos īsa vibrācija var atzīmēt tavu gājienu. Abi ir tīmekļa papildinājumi, kas atkarībā no ierīces pēc noklusējuma ir ieslēgti vai izslēgti, papildu opcijās → Likmes un gājiens.'],
          note: 'Vibrācija darbojas Android ierīcēs (Chromium pārlūkos); Apple vietnēm nepiedāvā vibrācijas API, tāpēc iPhone vibrēt nevar. Balss paziņojumi darbojas visur, taču pieejamās balsis un valodas ir atkarīgas no tavas sistēmas — klients izmanto labāko atrasto atbilstību.' }
      ]
    },
    {
      id: 'options', icon: '⚙️', title: 'Opcijas un īsinājumtaustiņi',
      sections: [
        { id: 'where', t: 'Kur atrodas opcijas',
          b: ['Papildu opcijas atveras no zobrata ieraksta jebkurā galvenes izvēlnē. Tās ir sagrupētas tāpat kā darbvirsmas klientā: Lietotāja saskarne, Stils, Skaņa, Lokālā spēle, Tīkla spēle, Interneta spēle, Segvārdi / avatari, Žurnāla ziņojumi un Atjaunot noklusējumus. Katrai tīmeklim raksturīgajai funkcijai tur ir savs slēdzis, tāpēc vari izslēgt visu, ko nelieto.'] },
        { id: 'cfgxml', t: 'Iestatījumu apmaiņa ar darbvirsmas klientu',
          b: ['Tavi iestatījumi var ceļot starp klientiem: sadaļa Žurnāla ziņojumi piedāvā oficiālā config.xml faila eksportu un importu (~/.pokerth/config.xml, ko izmanto darbvirsmas un QML klienti). Eksports ieraksta kopīgos iestatījumus — vārdu, attēlošanas opcijas, skaņas, galda izvēles, aklās likmes, stilus — un imports piemēro darbvirsmas failu šeit. Iestatījumi, ko šis klients nepazīst, failā paliek neskarti.', 'Kopā ar failu ceļo arī tavas spēlētāju piezīmes — teksts un zvaigžņu vērtējums, ierakstīti tā, kā tos lasa darbvirsmas klienti. Krāsu etiķetes paliek šajā klientā: oficiālajā formātā tām nav lauka, tāpēc imports tavējās nekad neaiztiek.'] },
        { id: 'sync', t: 'Iestatījumi, kas seko tev līdzi',
          b: ['Kad spēlē ar kontu, tavas opcijas, motīvs, taustiņu piesaistes, valoda un treniņa trofejas tiek sinhronizētas: nomaini kaut ko vienā ierīcē, un nākamā ierīce, no kuras piesakies, to pārņem. Trofeju progress tiek apvienots, nevis pārrakstīts, tāpēc, spēlējot divās ierīcēs, vienmēr saglabājas labākais no abām.'] },
        { id: 'updates', t: 'Kā palikt aktuālam',
          b: ['Klients atjauninās pats: kad tiek izvietota jauna versija, josla aicina pārlādēt lapu (vai ieraksti tērzēšanā /update, lai pārbaudītu manuāli). Retumis var parādīties neliela produkta aptauja, kas jautā tavu viedokli par kādu funkciju — dalība ir brīvprātīga, un aptaujas var pilnībā atspējot papildu opcijās → Kopiena.'] },
        { id: 'fkeys', t: 'Oficiālie īsinājumtaustiņi',
          b: ['Spēles laikā darbojas oficiālie PokerTH funkciju taustiņi — Alt+S darbojas jebkur:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold · Check/Call · Bet/Raise · All-In (secību opcijās var apgriezt)'],
            ['F5', 'Rādīt savas kārtis (kad tas iespējams)'],
            ['F6 / F7 / F8', 'Manuāli · Auto Check/Fold · Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manuāli · Auto Check/Call · Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Tērzēšana · Spēles žurnāls · Izredžu panelis'],
            ['Alt+S', 'Iestatījumi — jebkur lietotnē, ne tikai spēles laikā'],
            ['F11', 'Pilnekrāna režīms']],
          note: 'Īsinājumtaustiņiem ir vajadzīga fiziska tastatūra. Mac datoros F taustiņi pēc noklusējuma vada multividi: turi Fn (vai macOS iestatījumos ieslēdz “Use F1, F2, etc. as standard function keys”). iPhone ierīcēs pilnekrāna režīmu ierobežo iOS — lietotnes instalēšana kā PWA sniedz to pašu pilnekrāna pieredzi.' },
        { id: 'webkeys', t: 'Tīmekļa burtu taustiņi',
          b: ['Kā tīmekļa papildinājumu darbības izsauc arī atsevišķi burtu taustiņi un Alt+T, un katru no tiem var piesaistīt no jauna papildu opcijās → Īsinājumtaustiņi:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Likme 1/3 · 1/2 · Banka'],
            ['Alt+T', 'Statistikas panelis'],
            ['Esc', 'Aizvērt augšējo logu (arī Android poga “Atpakaļ”)'],
            ['↑ ↓ · ↵', 'Vestibila galdu saraksts (nokļūsti tur ar Tab): izvēlies galdu · pievienojies tam']],
          note: 'Android ierīcēs sistēmas poga vai žests “Atpakaļ” aizver logus tāpat kā Escape, nevis pamet spēli (konfigurējams opcijās). iOS līdzvērtīgas sistēmas pogas nav — izmanto katra loga ✕.' }
      ]
    }
  ]
};
