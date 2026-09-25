// ── help/content/tk.mjs — Turkmen (Türkmençe) help corpus ────────────────────
//
// Same structure as en.mjs (reference): chapters[] → { id, icon, title,
// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand
// names of the rules chapter stay in English, as in the other help corpora.
export const help = {
  chapters: [
    {
      id: "start", icon: "🚀", title: "Başlamak",
      sections: [
        { id: "modes",
          t: "Oýnamagyň üç ýoly",
          b: [
            "Giriş ekranynda nähili oýnamak isleýändigiňizi saýlaň."],
          list: [
            "Onlaýn — resmi pokerth.net serwerinde reýting bilen internetde oýnaň. Size pokerth.net hasaby gerek; pokerth.net-de mugt hasaba alnyň.",
            "Ýerli / türgenleşik — botlar bilen oflaýn oýnaň. Hiç zat sazlamak gerek däl, birikmesiz işleýär we öňe gidişiňize görä baýraklary açýar.",
            "LAN / Aýratyn serwer — ýerli toruňyzdaky ýa-da kompýuteriňizdäki hususy PokerTH serwerine birigiň."] },
        { id: "lan",
          t: "LAN / aýratyn serwer",
          b: [
            "Üçünji režim siziň ýa-da dostuňyzyň işledýän islendik PokerTH serwerine birigýär — öý torunda, hususy VPS-de, islendik ýerde. Serweriň salgysyny we portuny giriziň, serwer şifrlenen port ulanýan bolsa TLS-i belläň we lakam bilen giriň (serwer rugsat berse, myhman girişi işleýär). Şondan soň stoldaky ähli zat resmi serwerdäki ýaly işleýär."] },
        { id: "famboard",
          t: "Maşgala ýeňijiler sanawy",
          b: [
            "Diňe hususy serwerlerde we LAN oýunlarynda müşderi her lakam üçin ähli döwürleriň statistikasyny saklaýar — oýnalan we utulan eller hem oýunlar, iň uly utuş, iň gowy ýeňiş yzygiderliligi — we stoluň töweregindäki her enjam birmeňzeş sanawy görer ýaly, olary serwer arkaly paýlaşýar. pokerth.net oýunlary hiç haçan beýle hasaba alynmaýar, türgenleşik režiminiň statistikasy bolsa düýbünden aýratyn saklanýar.",
            "Bu oýunlarda kubok düwmesi reýting penjiresini onuň LAN goýmasynda açýar: ähli oýunçylar, birnäçe görkeziji boýunça tertipläp bolýar."] },
        { id: "language",
          t: "Dil",
          b: [
            "Interfeýs 82 dilde elýeterli. Ony islän wagtyňyz Giňişleýin sazlamalarda (dişli tigir menýusy) Ulanyjy interfeýsi bölüminde üýtgediň. Poker hereketleriniň adalgalary (Fold, Check, Call, Bet, Raise, All-In) iş stoly müşderisindäki ýaly däp boýunça iňlis dilinde galýar. Kombinasiýalaryň atlary rus dilinden gelen poker adalgalary bilen berilýär (roýal-fleş, strit, full-haus)."] },
        { id: "pwa",
          t: "Programma hökmünde gurnamak",
          b: [
            "Bu müşderi Progressive Web App: öz nyşany bolan doly ekranly programma almak üçin ony brauzeriňiziň menýusyndan (ýa-da sözbaşydaky gurnamak düwmesinden) gurnap bilersiňiz. Gurnalandan soň ol derrew açylýar, türgenleşik režimi bolsa internetsiz doly işleýär."],
          note: "Android-de we iş stoly Chrome/Edge-de gurnamak düwmesi hemme zady edýär. iPhone/iPad-de Apple gurnamaga diňe Safari arkaly rugsat berýär: Paýlaş düwmesi → «Baş ekrana goş» — müşderi zerur bolanda bu ädimleri görkezýär. Programma gurnalandan soň düwme ýitýär." },
        { id: "platforms",
          t: "Platformalar we brauzerler",
          b: [
            "Müşderi islendik ulgamda islendik döwrebap brauzerde işleýär — Windows, macOS, Linux, Android, iOS. Käbir aýratynlyklar täze brauzer API-lerine bagly; API ýok bolsa, aýratynlyk döwülmegiň deregine özüni gizleýär ýa-da sebäbini düşündirýär. Bilmeli esasy tapawutlar:"],
          list: [
            "Chrome / Edge (iş stoly): hemme zat işleýär, şol sanda .pdb žurnallaryny bukja ýazmak hem.",
            "Firefox: .pdb žurnallaryny bukja ýazmakdan başga hemme zat (API entek ýok).",
            "Safari / iOS: Paýlaş → Baş ekrana goş arkaly gurnamak; titreme ýok; iPhone-da doly ekran çäklendirilen; ses ilkinji degmegiňizden soň başlaýar.",
            "Android: Chromium brauzerlerinde doly goldaw, şol sanda titreme we «Yza» düwmesiniň hereketi."] },
        { id: "avatar",
          t: "Lakam we awatar",
          b: [
            "Birikmezden öň giriş ekranynda lakamyňyzy we awataryňyzy saýlaň. pokerth.net-de lakamyňyz hasabyňyzyň ady; awatar beýleki oýunçylar bilen awatar serweri arkaly paýlaşylýar.",
            "Awataryňyz birikeniňizde ugradylýar we her oýunçy birmeňzeşini görýär. Birikip durkaňyz ony üýtgetseňiz, täze awatar indiki birikmäňizden başlap işleýär. Baş harp (Aa) ugradylmaýar: beýleki oýunçylar deslapky awatary görýär."] }
      ]
    },
    {
      id: "rules", icon: "🃏", title: "Poker düzgünleri",
      sections: [
        { id: "basics",
          t: "Texas Hold’em gysgaça",
          b: [
            "PokerTH No-Limit Texas Hold’em oýnaýar. Her oýunçy iki gizlin kart alýar (şahsy kartlar). Soňra stoluň ortasyna bäş umumy kart açyk goýulýar. Iki kartyňyz bilen bäş umumy kartyň islendik utgaşmasyndan düzülen iň gowy bäş kartly kombinasiýa banky utýar."] },
        { id: "blinds",
          t: "Blaýndlar we diler düwmesi",
          b: [
            "Her eliň öňünden iki hökmany stawka banky başlaýar: kiçi blaýnd we uly blaýnd, olary diler düwmesiniň çep tarapyndaky iki oýunçy goýýar. Düwme her elden soň sagat diliniň ugruna bir orun süýşýär, şonuň üçin her kim blaýndlary öz nobatynda tölýär. Oýun dowam etdigiçe blaýndlar yzygiderli ýokarlanýar.",
            "Stolda düwme we blaýndlar fişkalar bilen bellenilýär: D (diler), SB (kiçi blaýnd), BB (uly blaýnd)."] },
        { id: "streets",
          t: "Dört stawka tapgyry",
          list: [
            "Pre-flop — şahsy kartlar paýlanandan soň birinji tapgyr uly blaýndyň çep tarapyndan başlaýar.",
            "Flop — üç umumy kart açylýar, soňra stawka tapgyry.",
            "Tern — dördünji umumy kart, soňra ýene bir stawka tapgyry.",
            "Riwer — bäşinji we soňky umumy kart, soňra soňky stawka tapgyry."],
          b: [
            "Elde galan ähli oýunçylar banka deň mukdar goýanda (ýa-da all-in bolanda) stawka tapgyry gutarýar."] },
        { id: "actions",
          t: "Nobatyňyzda näme edip bilersiňiz",
          list: [
            "Fold — eli taşlamak. Kartlaryňyz taşlanýar we indi bank üçin göreşmeýärsiňiz.",
            "Check — stawka goýman geçmek. Diňe call etmeli zat ýok bolanda mümkin.",
            "Call — häzirki stawka deňleşmek.",
            "Bet — bu tapgyrda hiç kim stawka goýmadyk bolsa, stawkany açmak.",
            "Raise — bar bolan stawkany ýokarlandyrmak. Iň kiçi raise öňki stawka ýa-da raise deňdir.",
            "All-In — ähli stegiňizi goýmak. Ýapan mukdaryňyza çenli elde galýarsyňyz."] },
        { id: "showdown",
          t: "Şoudaun we bölünen bank",
          b: [
            "Riwerdäki stawka tapgyryndan soň birden köp oýunçy galsa, kartlar açylýar we iň gowy kombinasiýa utýar — ýeňiji kombinasiýa umumy kartlaryň aşagynda görkezilýär. Oýunçy doly stawkadan az mukdar bilen all-in bolanda goşmaça bank döredilýär: her oýunçy diňe özüniň goşant goşan bölegini utup bilýär. Deň kombinasiýalar banky bölüşýär.",
            "Hemmeler görkezmäge borçly däl: soňky stawka ýa-da raise eden oýunçydan başlap, el diňe öň görkezileninden gowy bolsa açylýar. Kartlaryny taşlamaga hukugy bolan her kim olary gizleýär we isläp açmak üçin «Görkez» düwmesini alýar."] },
        { id: "hands",
          t: "Kombinasiýalaryň tertibi",
          b: [
            "Iň gowşakdan iň güýçlä çenli:"],
          list: [
            "1. Uly kart — kombinasiýa ýok; iň uly kart çözýär.",
            "2. Jübüt — birmeňzeş bahaly iki kart.",
            "3. Iki jübüt — iki dürli jübüt.",
            "4. Üçlük — birmeňzeş bahaly üç kart.",
            "5. Strit — yzygiderli bäş kart (tuz ýokary ýa-da aşaky bolup biler).",
            "6. Fleş — bir mastdaky bäş kart.",
            "7. Full-haus — üçlük we jübüt.",
            "8. Kare — birmeňzeş bahaly dört kart.",
            "9. Strit-fleş — hemmesi bir mastdaky strit.",
            "10. Roýal-fleş — ondan tuza çenli, hemmesi bir masty. Mümkin bolan iň gowy kombinasiýa."] }
      ]
    },
    {
      id: "game", icon: "🎮", title: "Oýun ekrany",
      sections: [
        { id: "actionbar",
          t: "Hereket paneli",
          b: [
            "Nobatyňyz gelende aşakdaky hereket paneli dört düwmä çenli ýanýar: Fold (gyzyl), Check / Call (gök), Bet / Raise (ýaşyl — bellenen esasy hereket) we All-In (goýy gyzyl). Check / Call düwmesi call üçin takyk mukdary görkezýär; Bet / Raise goýjak mukdaryňyzy görkezýär. Riwerden soň All-In kartlaryňyzy açmak üçin «Görkez» düwmesine öwrülip biler."] },
        { id: "betctl",
          t: "Stawkaňyzy saýlamak",
          b: [
            "Raise mukdaryny san meýdançasy, süýşüriji ýa-da 1/3 · 1/2 · Pot çalt düwmeleri (häzirki bankyň paýlary) bilen belläň. Mukdarlar awtomatik tegelekleşdirilýär we kanuny iň kiçi we iň uly raise aralygynda saklanýar. Uly blaýndlar bilen pikirlenmegi halaýan bolsaňyz, bir opsiýa ähli mukdarlary çipleriň deregine BB-de görkezýär."] },
        { id: "preselect",
          t: "Hereketi öňünden saýlamak",
          b: [
            "Nobatyňyzdan öň hereketi öňünden taýýarlap bilersiňiz: düwmä basyň, ol altyn gyra we kiçijik altyn nokat alýar. Nobatyňyz gelende hereket derrew ýerine ýetirilýär. Öňünden taýýarlanan Fold, check mugt bolanda awtomatik Check-e öwrülýär — hiç haçan biderek fold etmeýärsiňiz. Öňünden saýlawlar her täze elde, tapgyr çalşanda we şoudaunda arassalanýar, ýagdaý üýtgese (mysal üçin call mukdary üýtgese) ýatyrylýar."] },
        { id: "automodes",
          t: "Awtomatik režimler",
          b: [
            "Hereket düwmeleriniň ýanyndaky menýu üç oýun režimini hödürleýär: El bilen, Awtomatik Check/Call we Awtomatik Check/Fold. Awtomatik režimler siz yzyna geçýänçäňiz siziň deregiňize oýnaýar — hereketi el bilen basmak derrew «El bilen» režimine gaýtarýar."] },
        { id: "readtable",
          t: "Stoly okamak",
          b: [
            "Her oýunçynyň gutusy awatary, ady, stegi we häzirki stawkany görkezýär. Diler we blaýndlar D / SB / BB fişkalary bilen bellenilýär. Gutudaky reňkli belgi oýunçynyň soňky hereketini görkezýär; inçe gök zolak onuň pikirlenmek wagtyny yza sanaýar. Nobaty gelen oýunçynyň gutusy ýalpyldaýar; siziň gutuňyz nobatyňyzda urýan altyn çarçuwa alýar.",
            "Stoluň üstündäki ýagdaý zolagy jemi banky, häzirki tapgyryň stawkalaryny, tapgyry (Pre-flop, Flop, Tern, Riwer) we oýun hem-de el belgilerini görkezýär. Fold eden oýunçylaryň kartlary ýarym-aýdyň; çykanlar öçügsi. Eliň ahyrynda ýeňijiniň penjiresi kimiň näme utandygyny jemläp biler — ony opsiýalarda öçürip bolýar."] },
        { id: "seatlayout",
          t: "Orunlaryň ýerleşişi",
          b: [
            "Web goşundysy hökmünde oýunçy gutularynyň ýerleşişini Giňişleýin sazlamalar → Orunlar bölüminde saýlap bolýar: «Awtomatik» resmi müşderini yzarlaýar (dik ýagdaýda durnukly orunlar, ýatyk ýagdaýda hasaplanan ellips), ýa-da «Dik» ýa-da «Ýatyk» ýerleşişi mejbur ediň — «Özüňiziňki» bolsa her orny özüňiz goýmaga mümkinçilik berýär: üýtgetmek režimi peýda bolýar, onda her gutuny isleýän ýeriňize takyk süýräp barýarsyňyz we ýerleşiş ýatda saklanýar."] },
        { id: "zoom",
          t: "Stoly ulaltmak (telefonlar)",
          b: [
            "Kiçi ekranlarda lupa düwmeleri stoly ulaldýar (2×) we ony barmak bilen süýşürip bilersiňiz — diňe hereket paneli ýerinde galýar; siziň gutuňyz hem ulalýar, nobatyňyz gelende görnüş oňa dolanýar. Görnüş işjeň orny awtomatik yzarlaýar we şoudaunda umumy görnüş üçin kiçelýär. Muny Giňişleýin sazlamalarda öçürip bolýar. Nobatyňyzda umumy kartlar görünmeýän bolsa, olaryň kiçijik nusgasy stoluň ýokarsynda peýda bolýar; kartlara geçip, yzyna dolanmak üçin oňa basyň."],
          note: "Telefonlarda we planşetlerde brauzeriň çümdikläp ulaltmagy deslapky ýagdaýda petiklenen, ulaltma hereketi eliň ortasynda tötänleýin işlemez ýaly; isleseňiz ony Giňişleýin sazlamalar → Ulanyjy interfeýsi bölüminde täzeden açyň." },
        { id: "protections",
          t: "Kartlara göz aýlamakdan we tötänleýin call-dan gorag",
          b: [
            "Iki goşmaça gorag: «Göz aýlamakdan gorag» kartlaryňyzy olara degýänçäňiz gizleýär (kimdir biri ekranyňyzy görüp bilýän bolsa peýdaly), tötänleýin call-dan gorag bolsa uly raise-den soň Call düwmesini gysga wagtlyk petikleýär, kiçi call üçin niýetlenen degme tötänleýin raise mukdaryna düşmez ýaly. Ikisi hem Giňişleýin sazlamalarda."] }
      ]
    },
    {
      id: "info", icon: "📊", title: "Maglumat paneli",
      sections: [
        { id: "open",
          t: "Paneli açmak",
          b: [
            "Oýun wagtynda maglumat paneli sözbaşydan (ýa-da Alt+L / Alt+I) açylýar we üç goýmasy bar: Žurnal, Mümkinçilikler we Statistika. Telefonlarda ol stoluň üstünde ýüzýär; uly ekranlarda süýrenip we ölçegi üýtgedip bolýan penjire — süýşürmek üçin ⣿ tutawajyny, ölçegini üýtgetmek üçin gyralaryny tutuň. Onuň ýeri ýatda saklanýar."] },
        { id: "log",
          t: "Oýun žurnaly",
          b: [
            "Žurnal goýmasy tutuş oýny el-elden ýazga alýar: blaýndlar, mukdarlary bilen her hereket, açylan kartlar we ýeňijiler, çalt okamak üçin reňkler bilen bellenen. Eksport düwmesi sessiýany soňra gözden geçirmek isleseňiz, žurnaly faýl hökmünde ýatda saklaýar."] },
        { id: "odds",
          t: "Mümkinçilikler (ähtimallyk monitory)",
          b: [
            "Mümkinçilikler goýmasy häzirki eliňiz üçin 10 kombinasiýa kategoriýasynyň her birine — uly kartdan roýal-fleşe çenli — ýetmegiň janly ähtimallygyny görkezýär, her biri öz nyşany, göterimi we zolagy bilen. Fold edeniňizden soň görkeziş çal reňke öwrülýär. Ol diňe öz kartlaryňyzy we umumy kartlary ulanýar: garşydaşlaryňyzyň görkezmeýän zadyny görmeýär."] },
        { id: "journal",
          t: "El žurnallary we «Žurnallar» penjiresi",
          b: [
            "Janly žurnaldan başga-da, oýnaýan her eliňiz brauzeriňizde resmi müşderiniň .pdb žurnal faýllary bilen birmeňzeş formatda ýazga alynýar. «Žurnallar» penjiresi (Giňişleýin sazlamalar → Žurnal habarlary → Žurnallary dolandyr…) sessiýalaryňyzy sanaýar we olar bilen işlemäge mümkinçilik berýär: sessiýany gözleg we bellemek bilen deslapky görmek, oýun boýunça süzmek, HTML ýa-da ýönekeý tekst hökmünde eksport etmek, çig .pdb faýlyny ýatda saklamak ýa-da iş stoly müşderisiniň ýazga alan .pdb-sini import etmek. Sessiýalary birme-bir ýa-da hemmesini birbada (tassyklama bilen) pozup bolýar, awtomatik saklamak sazlamasy bolsa diňe soňky 7, 30, 90, 180 ýa-da 365 güni saklap biler. Özüňiz import eden žurnallaryňyz hiç haçan awtomatik pozulmaýar. Ikinji sazlama saklanýan sessiýalaryň sanyny çäklendirýär, sanawyň sütünini bolsa giňeltmek üçin süýräp bolýar.",
            "Birnäçe sessiýany birbada arassalamak üçin «Saýla…» düwmesi sanawy bellik gutularyna öwürýär: pozmak isleýänleriňizi belläň, «Poz» bolsa bir tassyklamadan soň tutuş topary aýyrýar. Kompýuterde sessiýalary birme-bir goşmak üçin Ctrl (⌘) + basmagy, ýa-da tutuş aralygy almak üçin Shift + basmagy hem ulanyp bilersiňiz.",
            "«Derňe» düwmesi sessiýa boýunça elleriň derňewini geçirýär we žurnaly pokerth.net derňew hyzmatyna ugradyp biler. Siz aç-açan eksport etmeseňiz ýa-da ýüklemeseňiz, hemme zat enjamyňyzda galýar."] },
        { id: "logopts",
          t: "Ýazgy opsiýalary",
          b: [
            "Giňişleýin sazlamalar → Žurnal habarlary bölüminde ýazgy etmegi açyp ýa-da öçürip, iş stoly müşderisindäki ýaly üç sazlama bilen ýazmak aralygyny saýlap bilersiňiz: her hereketden soň, her elden soň (deslapky) ýa-da her oýundan soň. Başga bir opsiýa .pdb faýlyny saýlan bukjaňyza ýazýar we ony şol aralykda hem-de sahypadan çykanyňyzda ýene bir gezek täzeleýär, başga gural oýny janly yzarlar ýaly."],
          note: "Ýerli bukja ýazmak File System Access API talap edýär: diňe iş stoly üçin Chrome, Edge we Opera. Beýleki ýerlerde opsiýa özüni düşündirýär, «Žurnallar» penjiresinden el bilen eksport etmek bolsa elýeterli bolup galýar. Brauzer faýly diňe çalşyp bilýär, oňa goşup bilmeýär, şonuň üçin .pdb-ni okaýan gural her üýtgeşmeden soň ony täzeden açmaly." },
        { id: "assist",
          t: "Kömekçi (eliň güýji)",
          b: [
            "Mümkinçilikler goýmasynyň ýokarsynda kömekçi banneri eliňizi siziň üçin okaýar. Flopdan öň ol başlangyç eliňizi atlandyrýar we ýyldyzlar bilen bahalandyrýar; flopdan başlap häzirki iň gowy utgaşmaňyzy we çalt modellemeden soň eli utmak mümkinçiligiňizi göterimde, gyzyldan (gowşak) ýaşyla (güýçli) çenli reňk şkalasy bilen görkezýär. Ähtimallyk monitory ýaly, ol diňe siziň görüp bilýän maglumatyňyzy ulanýar.",
            "Giňişleýin sazlamalar → Orunlar bölüminde iki görkeziş stili bar: Segmentler (on blok) ýa-da klassiki öňegidiş zolagy. Kömekçi aýratynlygyny doly Giňişleýin sazlamalar → Kömekçi bölüminde öçürip bolýar."] },
        { id: "assistwin",
          t: "Kömekçi ýüzýän widžet hökmünde",
          b: [
            "Kömekçi bölegini panelden aýryp, hemişe ýokarda durýan öz kiçijik penjiresine geçirip bolýar: bölekdäki aýyrmak düwmesini ulanyň, soňra ony stoluň islendik ýerine süýşüriň we ölçegini üýtgediň — tutuş paneli açman eliňiziň güýjüni gözegçilikde saklamak üçin amatly. Gaýtarmak düwmesi ony Mümkinçilikler goýmasyna gaýtarýar we ýeri ýatda saklanýar. Paneliň içinde Kömekçi bilen ähtimallyklaryň arasyndaky tutawaç ikisiniň arasyndaky ýeri paýlamaga mümkinçilik berýär."] },
        { id: "stats",
          t: "Statistika",
          b: [
            "Statistika goýmasy sessiýaňyzy hasaba alýar: oýnalan eller, görlen floplar, şoudaunlar, ýeňiş derejeleri we başgalar. Statistikany hasaba almagy Giňişleýin sazlamalarda öçürip bolýar."] },
        { id: "hud",
          t: "Orunlarda statistika HUD-y",
          b: [
            "HUD her oýunçynyň ornunyň ýanyna žurnallaryňyzda ýazga alnan elleriň esasynda düzülen kiçijik statistika gutusyny berkidýär: gözegçilik edilen elleriň sany, soňra VPIP (flopdan öň näçe ýygy öz islegi bilen pul goýýar), PFR (flopdan öňki raise-ler) we AF (agressiýa koeffisiýenti), passiwden agressiwe çenli reňkler bilen. Olaryň aşagynda belgi oýunçyny ýönekeý sözler bilen jemleýär — Taýt-passiw, Luz-agressiw we ş.m. — kiçijik diskiň ýanynda, onuň ýanýan çärýegi çepden saga taýtdan luza, aşakdan ýokary passiwden agressiwe tarap okalýar. Belgi ilkinji elden görünýär, ýöne ygtybarly bolýan 25 ele çenli öçügsi galýar. Ähli sanlar bolan jikme-jik penjire üçin gutä basyň (3-bet, continuation bet, 3-bet-e fold, steal synanyşyklary, şoudaun görkezijileri…), bir zady ýapýan bolsa, gutuny süýräp süýşüriň.",
            "HUD diňe öz stollaryňyzda gören zadyňyzy bilýär — ol ýerli el žurnallaryňyzy okaýar, şonuň üçin ýazgy açyk bolmaly we sanlar ýeterlik elden soň many alýar. Deslapky ýagdaýda öçük: ony Giňişleýin sazlamalar → Kömekçi bölüminde açyň."] },
        { id: "handsbtn",
          t: "Kombinasiýalara umumy syn",
          b: [
            "Matadaky poker kombinasiýalarynyň nyşany islän wagtyňyz 10 kombinasiýa çalt syn açýar — öwrenýän wagtyňyz amatly. Ony Giňişleýin sazlamalarda gizläp bolýar."] }
      ]
    },
    {
      id: "chat", icon: "💬", title: "Çat we jemgyýet",
      sections: [
        { id: "panels",
          t: "Lobbi çaty we oýun çaty",
          b: [
            "Lobbide bir çat we stolda bir çat bar. Telefonlarda oýun çaty stoluň üstünde ýüzýär; uly ekranlarda süýrenip we ölçegi üýtgedip bolýan penjire. Çat düwmesindäki belgi okalmadyk habarlary sanaýar."] },
        { id: "typing",
          t: "Ýazmak kömekçileri",
          list: [
            "Tab lakamy doldurýar — gabat gelýänleriň arasynda geçmek üçin Tab-y ýene basyň.",
            "↑ / ↓ öz habarlaryňyzyň taryhyny aýlaýar.",
            "Emoji düwmesi doly saýlaýjyny açýar; : ýazmak hem ýazyp durkaňyz emotlary teklip edýär."] },
        { id: "emotes",
          t: "Emotlar we smaýlikler",
          b: [
            "Çat emot gysga kodlaryny resmi iş stoly müşderisindäki ýaly öwürýär: ady iki nokadyň arasynda ýazyň, ol emoji öwrülýär — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… 1,900-den gowrak kod goldanýar (GitHub-yň doly toplumy). Klassiki tekst smaýlikleri hem öwrülýär: :-) ;) :D xD :P <3 we ýene segsene golaýy.",
            ": ýazmak teklipler penjiresini açýar, ol ýazyp durkaňyz kody doldurýar (saýlamak üçin ↑/↓, kabul etmek üçin Tab ýa-da Enter). Emoji öwrülişini Giňişleýin sazlamalar → Çat bölüminde doly öçürip bolýar."] },
        { id: "commands",
          t: "Çat buýruklary",
          b: [
            "Çat / bilen başlaýan buýruklara düşünýär. Ikisi beýlekilere görünýär:"],
          keys: [
            ["/me <text>", "Hereket habary, “* siziňadyňyz tekst” görnüşinde görkezilýär   ⟦/me <tekst>⟧"],
            ["/emoji <emoji>", "Emoji reaksiýasyny çalýar (reaksiýa saýlaýjynyň ugradýan zady)   ⟦/emoji <emoji>⟧"]] },
        { id: "diagcmds",
          t: "Diagnostika buýruklary",
          b: [
            "Galanlarynyň hemmesi ýerli: jogaplar diňe size görkezilýär we stola hiç zat ugradylmaýar. Hemmesini görmek üçin /help ýazyň. Iň peýdalylary:"],
          keys: [
            ["/help", "Ähli buýruklary görkez   ⟦/help⟧"],
            ["/update", "Täze wersiýany barla we täzele   ⟦/update⟧"],
            ["/lang <code>", "Dili çalyş (mysal üçin /lang fr)   ⟦/lang <code>⟧"],
            ["/sound on|off", "Oýun seslerini aç / öçür   ⟦/sound on|off⟧"],
            ["/zoom", "Stoluň lupasyny aç / öçür   ⟦/zoom⟧"],
            ["/clear", "Çaty şu enjamda arassala   ⟦/clear⟧"],
            ["/table", "Häzirki oýun barada maglumat (blaýndlar, oýunçylar, stekler)   ⟦/table⟧"],
            ["/diag · /netdbg · /fps", "Müşderiniň ýagdaýy, tor we kadr tizligi boýunça diagnostika   ⟦/diag · /netdbg · /fps⟧"],
            ["/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg", "Giňişleýin näsazlyk düzedişi (kartlar, protokol, ses, ammar, orunlar)   ⟦/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg⟧"],
            ["/copy", "Soňky buýrugyň jogabyny alyş-çalyş buferine göçür   ⟦/copy⟧"]] },
        { id: "privatemsg",
          t: "Hususy habarlar",
          b: [
            "Tutuş lobbi okamaz ýaly bir oýunça ýazyň. Oýunçylar sanawynda adyň ýanyndaky konwert onuň bilen söhbetdeşligi açýar; lobbiniň sözbaşysyndaky konwert soňkusyny täzeden açýar. Söhbetdeşlikler şu enjamda saklanýar we siz gaýdyp geleniňizde ýerinde bolýar, şonuň üçin birnäçe günden soň dowam etdirilen söhbetdeşligiň öz taryhy bar — konwertdäki gyzyl san entek okamadyk zatlaryňyzy görkezýär, penjiräniň sözbaşysyndaky sebet bolsa söhbetdeşligi düýbünden pozýar."],
          keys: [
            ["/msg <nickname> <text>", "Lobbi çatyndan hususy habar ugrat   ⟦/msg <lakam> <tekst>⟧"],
            ["/msg \"<nickname with spaces>\" <text>", "Edil şeýle, lakamda boşluklar bar bolanda   ⟦/msg \"<boşlukly lakam>\" <tekst>⟧"]],
          note: "Habarlar 128 nyşan bilen çäklendirilýär. Serwer dowam edýän stolda oturan oýunça hususy habar ýetirmeýär, taryh bolsa diňe şu brauzerde saklanýar — ol sizi başga enjama yzarlamaýar." },
        { id: "reactions",
          t: "Emoji reaksiýalary",
          b: [
            "Reaksiýa düwmesi 30 animasiýaly reaksiýanyň (🎉, 😂, 😱, 🔥…) saýlaýjysyny açýar, olar orunyňyzyň üstünde effekt bilen çalynýar we stoldaky hemmelere görünýär — iş stoly müşderisindäki oýunçylara hem. Reaksiýalary Giňişleýin sazlamalarda doly öçürip bolýar."] },
        { id: "translate",
          t: "Hemmä düşünmek",
          b: [
            "Çat terjimesi açyk bolanda kursoryňyzyň astyndaky setirde — ýa-da sensor ekranda degilen setirde — terjime düwmesi peýda bolýar we şol habary siziň diliňizde görkezýär. Ony Giňişleýin sazlamalar → Çat bölüminde her setirde hemişe görkezip bolýar, şol ýerde stoldaky giňden ýaýran gysgaltmalary (gg, nh, utg…) düşündirýän maslahat hem bar."],
          note: "Terjime Google Translate hyzmatyny ulanýar we ähli brauzerlerde işleýär — oňa diňe internet birikmesi gerek. Habar terjime hyzmatyna diňe siz onuň terjime düwmesine basanyňyzda ugradylýar, hiç haçan awtomatik däl." },
        { id: "social",
          t: "Oýunçylar: profil, çakylyk, äsgermezlik",
          b: [
            "Onuň kartyny açmak üçin islendik oýunça — stolda ýa-da lobbi sanawynda — basyň: profil we statistika, ony oýnuňyza çagyrmak ýa-da äsgermezlik (onuň çat habarlary gizlenýär; äsgermezligi islän wagtyňyz ýatyryp bolýar). Çagyrmazdan/äsgermezden öň tassyklamany opsiýalarda açyp bolýar."] }
      ]
    },
    {
      id: "lobby", icon: "🏛️", title: "Lobbi we oýunlar",
      sections: [
        { id: "list",
          t: "Oýunlaryň sanawy",
          b: [
            "Lobbi serwerdäki ähli stollary sanaýar. Her ýazgy oýunçylaryň sanyny, oýnuň görnüşini, parol ýa-da çakylyk gerek bolanda gulpy we ýagdaý belgisini görkezýär: «Garaşylýar» (ýaşyl — oýun başlamady, boş orun bar bolsa goşulyp bilersiňiz), «Dowam edýär» (ýyly reňk — tomaşaçylara rugsat bar bolsa göni görüp bolýar) we «Ýapyk» (öçügsi). Doly stol diňe doly sany görkezýär, mysal üçin 10/10; belgileriň reňkleri işjeň temany yzarlaýar.",
            "Süzgüç menýusy sanawy iş stoly müşderisindäki ýaly daraldýar, her saýlaw öňkisinden berkräk: diňe açyk oýunlar → doly stollary hem gizle → soňra diňe hususy däller, diňe hususylar ýa-da diňe reýting oýunlary. Saýlawyňyz ýatda saklanýar. Gözleg meýdany oýny ady boýunça tapýar, oýunçylar belgisi bolsa onlaýndakylaryň hemmesiniň sanawyny açýar, onda gözläp we tertipläp bolýar."] },
        { id: "join",
          t: "Goşulmak we tomaşa etmek",
          b: [
            "Açyk oýny saýlap, oňa goşulyň — gulp paroluň gerekdigini aňladýar. Tomaşaçylara rugsat berýän dowam edýän oýunlary göni görüp bolýar: stoly we çaty görýärsiňiz, ýöne şahsy kartlar gizlin galýar we hereket edip bilmeýärsiňiz."] },
        { id: "gameinfo",
          t: "Oýun barada maglumat",
          b: [
            "Goşulmazdan öň oýun maglumat kartoçkasy stoly kesgitleýän ähli zady görkezýär: oýnuň görnüşi, blaýndlar we olaryň nähili ýokarlanýandygy (iki esselenme ýa-da el bilen goýlan sanaw), başlangyç pul, hereket wagty, elleriň arasyndaky gijikme we kimiň eýýäm oturandygy."] },
        { id: "create",
          t: "Oýun döretmek",
          b: [
            "Öz stoluňyzy dörediň: ady, oýunçylaryň sany, başlangyç pul, ilkinji kiçi blaýnd we ýokarlanma tertibi, hereket wagty we tomaşaçylara rugsat berilýärmi. Oýnuň dört görnüşi bar: Adaty (islendik kişi), diňe hasaba alnan oýunçylar, diňe çakylyk bilen we Ranking (resmi reýtinge hasaplanýar — ol ýerde parola rugsat ýok). Halaýan sazlamalaryňyzy ýatda saklap, täzeden ýükläp bolýar."] },
        { id: "invites",
          t: "Çakylyklar",
          b: [
            "Oýunçylar sizi öz stolyna çagyryp bilýär; siz kabul edip ýa-da ret edip bilýän duýduryş alýarsyňyz. Çagyrylmak diňe çakylyk bilen oýna girmegiň ýeke-täk ýoludyr."] }
      ]
    },
    {
      id: "pthnet", icon: "🌐", title: "pokerth.net",
      sections: [
        { id: "account",
          t: "Siziň hasabyňyz",
          b: [
            "Resmi internet serweri pokerth.net. Onda oýnamak üçin mugt pokerth.net hasaby gerek — saýtda hasaba alnyň, soňra şu ýere şol bir lakam we parol bilen giriň. Bu web müşderi iş stoly müşderisi bilen şol bir serwere birigýär: şol bir hasaplar, şol bir stollar, şol bir reýtingler, iş stoly oýunçylary bilen bir stolda oturyp hem bilersiňiz."] },
        { id: "ranked",
          t: "Reýting oýunlary we möwsümler",
          b: [
            "Ranking görnüşli oýunlar resmi möwsüm reýtingine hasaplanýar. Programmadaky profiliňiz haçan goşulandygyňyzy, häzirki möwsümdäki ornuňyzy, utugyňyzy, ortaça görkezijiňizi we oýnalan oýunlary, şeýle hem soňky netijeleriňizi görkezýär. Adaty (reýting däl) oýunlar diňe güýmenje üçin we hiç zady üýtgetmeýär."] },
        { id: "rankhow",
          t: "Reýting nähili hasaplanýar",
          b: [
            "Her reýting oýnunda eýelän ornuňyz utuk getirýär: birinji orun üçin 15, soňra ýedinji orna çenli 9, 6, 4, 3, 2 we 1; sekizinjiden onunja çenli hiç zat almaýar. Şeýlelikde bir stol jemi 40 utuk paýlaýar.",
            "Siziň utugyňyz şol utuklaryň jemi däl-de, oýnalan oýunlaryň sany bilen artýan koeffisiýent arkaly ýumşadylan bir oýna düşýän ortaça görkezijiňizdir: birnäçe gowy netije ýokarda durmak üçin ýeterlik däl, durnuklylyk hem gerek — näçe köp oýnasaňyz, utugyňyz hakyky ortaça görkezijiňize şonça ýakynlaşýar. Möwsümler çärýek dowam edýär: çalşylanda hemme zat arhiwlenýär we hasaplaýjylar noldan başlaýar, geçen möwsümler bolsa elýeterli bolup galýar. Oýunda münber düwmesi stoluňyzdaky oýunçylaryň möwsüm reýtingini görkezýär."],
          note: "Utuk şkalasyny we takyk formulany pokerth.net reýting serweri kesgitleýär we olar üýtgäp biler; saýtdaky sahypalar esasy çeşmedir." },
        { id: "rankings",
          t: "Reýting sahypalary",
          b: [
            "Reýting bölümi oýunçy boýunça gözläp bolýan resmi PokerTH reýtingini, şeýle hem jemgyýet reýtinglerini (BBC, WEC) açýar. Reýtingler sizi gyzyklandyrmaýan bolsa, bölümi Giňişleýin sazlamalar → Jemgyýet bölüminde gizläp bolýar."] },
        { id: "cups",
          t: "Jemgyýet kuboklary: BBC we WeCup",
          b: [
            "pokerth.net-de iki jemgyýet öz ýaryşlaryny geçirýär, olaryň her biriniň öz saýty we reýtingi bar. Best Brainies Cup (BBC) — 2013-nji ýylda döredilen basgançakly ýaryş: Step 1-den Step 4-e çenli ýokary galýarsyňyz, her Step 4 oýnundan soň, kubok gowşurylanda, täze möwsüm başlaýar. WeCup (WEC) has giň öz şkalasyna eýe — birinji orun üçin 75 utuk, soňra 45, 30, 20… — onuň utugy bolsa ortaça görkezijiňizi beýleki agzalar bilen deňeşdirilende oýnan oýunlaryňyzyň sanyna görä kadalaşdyrýar.",
            "Iki reýting hem PokerTH reýtinginiň ýanyndaky kubok düwmesinden açylýar. Bu ýaryşlaryň stol sazlamalary oýun döredilende şablon hökmünde berilýär (BBC Step 1-den 4-e çenli, WEC, WEC Monthly Final we WEC Grand Final), şonuň üçin şol bir şertlerde türgenleşip bilersiňiz. Gatnaşmak üçin degişli kubogyň saýtynda hasaba alynmaly."],
          note: "Kuboklar sizi gyzyklandyrmaýan bolsa, bu mazmuny Giňişleýin sazlamalar → Jemgyýet bölüminde bir gezekde gizläp bolýar." },
        { id: "forumcups",
          t: "Forum kuboklary we çäreler",
          b: [
            "pokerth.net forumy Monthly Cup-y hem geçirýär — aýyň çempiony kesgitlenmezden öň oýunçylaryň Gold, Silver we Bronze stollaryna paýlanýan aýlyk tapgyry, şeýle hem ýylyň dowamynda birgezeklik ýörite kuboklar.",
            "Hasaba alyş, tertipler, stol sazlamalary we netijeler forumda çap edilýär, oýunlar bolsa beýlekiler ýaly resmi serwerde oýnalýar. Netijeleri yzarlamak üçin pokerth.net hasaby ýeterlik; kuboga gatnaşmak degişli forum temasy arkaly bolýar."] },
        { id: "forumnews",
          t: "Lobbidäki forum habarlary",
          b: [
            "Lobbiniň sözbaşysyndaky gazet düwmesi pokerth.net forumynyň iň soňky ýazgylaryny açýar, her tema üçin bir ýazgy, her forumyň öz reňki bar. Düwmedäki belgi okalmadyk ýazgylary sanaýar; ýazgyny açmak (täze goýma) ony okalan diýip belleýär, «Hemmesini okalan diýip belle» bolsa hemme zady birbada arassalaýar.",
            "Bu web goşundysy: düwmäni Giňişleýin sazlamalarda gizläp bolýar («Lobbiniň sözbaşysynda forum düwmesi»).",
            "«Çäreler» goýmasy geljekki BBC oýunlaryny we hasaba alnan oýunçylaryň sany bilen indiki Monthly Cup-y, şeýle hem soňky BBC, WEC we Monthly Cup ýeňijilerini görkezýär. Wagtlar ýerli wagtyňyz boýunça, basmak bolsa jemgyýet saýtyny açýar. «Jemgyýet mazmunyny görkez (BBC / WEC)» opsiýasy bu goýmany gizleýär."] },
        { id: "avatars",
          t: "Awatarlar we baýdaklar",
          b: [
            "pokerth.net-de awataryňyz beýleki oýunçylara awatar serweri arkaly ýaýradylýar, oýunçy gutularynda bolsa kiçijik ýurt baýdagy görkezilip bilner. Ikisi hem hökmany däl we opsiýalarda sazlanýar."] }
      ]
    },
    {
      id: "offline", icon: "🏋️", title: "Türgenleşik režimi",
      sections: [
        { id: "what",
          t: "Bu näme",
          b: [
            "Ýerli / türgenleşik režimi — kompýuter garşydaşlaryna garşy doly oýun: birikme ýok, hasap ýok, howp astynda hiç zat ýok. Programma gurnalandan soň (ýa-da diňe bir gezek açylandan soň) ol internetsiz doly işleýär — oýny öwrenmek, interfeýsi synamak ýa-da uçar režiminde wagt geçirmek üçin ajaýyp."] },
        { id: "setup",
          t: "Oýny sazlamak",
          b: [
            "Garşydaşlaryň sanyny, başlangyç puly, blaýndlary we ýokarlanma tertibini, şeýle hem oýnuň tizligini saýlaň. Botlaryň düzümini we kynlygyny Giňişleýin sazlamalar → Ýerli oýun bölüminde sazlap bolýar — ýumşak garşydaşlardan has berk, garyşyk stola çenli."] },
        { id: "trophies",
          t: "Baýraklar",
          b: [
            "Türgenleşik režiminiň öz öňegidişligi bar: alty kategoriýadaky 28 baýrak (öňegidişlik, ussatlyk, stil, formatlar, güýmenje we bir syr) oýnadygyňyzça açylýar — oýnalan eller, utulan oýunlar, uly bleflar, ýörite kombinasiýalar we başgalar. Baýraklardaky öňegidişligiňiz toplanýar we hasap sazlamalaryny sinhronlamak işjeň bolanda enjamlaryň arasynda birleşdirilýär."] },
        { id: "learn",
          t: "Öwrenmek üçin gowy ýer",
          b: [
            "Beýleki baplardaky ähli zat şu ýerde hem işleýär: ähtimallyk monitory, kömekçiniň görkezilişi, öňünden saýlamak, klawiatura gysga ýollary. Türgenleşik režimi olary pokerth.net-e gitmezden öň basyşsyz synap görmek üçin iň gowy ýer."] }
      ]
    },
    {
      id: "style", icon: "🎨", title: "Stil we ses",
      sections: [
        { id: "themes",
          t: "Temalar",
          b: [
            "Giňişleýin sazlamalardaky Stil kategoriýasy tutuş müşderiniň görnüşini üýtgedýär. Şablonlar hemme zady bir basmak bilen bellenýär (klassiki ýaşyl kazino, PokerTH-iň resmi görnüşi…); olaryň aşagynda aýratyn oklar palitrany, stol matasyny we kartlaryň ýüzüni aýratynlykda takyklamaga mümkinçilik berýär — islendik oky üýtgediň, utgaşmaňyz öz temaňyza öwrüler. Garaňky, ýagty ýa-da awtomatik režim Ulanyjy interfeýsinde saýlanýar, saýlawyňyz her ekranda derrew ulanylýar we ýatda saklanýar."] },
        { id: "tablelook",
          t: "Stollar, kart desteleri, orunlar",
          b: [
            "Temadan başga-da birnäçe elementi garaşsyz çalşyp bolýar: stoluň fony, kart destesi, kartyň arka tarapy (destä awtomatik laýyk ýa-da öz suratyňyzy import ediň), diler we blaýnd fişkalary, hereket düwmeleriniň stili we oýunçy gutularynyň görnüşini üýtgedýän doly orun toplumlary. Hemmesini Giňişleýin sazlamalar → Stil bölüminde saýlaň; üýtgeşmeler stolda derrew görünýär."] },
        { id: "music",
          t: "Aýdym-saz pleýeri",
          b: [
            "Sözbaşy menýularyndaky aýdym-saz bölümi launž aýdym-sazy üçin kiçijik pleýeri açýar: çalyş sanawyndan trek saýlaň, çal/arakesme, öňki/indiki, garyşdyr we bir treki, tutuş sanawy gaýtala ýa-da hiç zady gaýtalama. Ses güýji, saýlanan trek we gaýtalama režimi ýatda saklanýar. Çalmak hiç haçan özbaşdak başlamaýar — brauzerler basmagy talap edýär — pleýer bolsa oýun seslerinden doly garaşsyz.",
            "Trekiň adynyň aşagyndaky iki başam barmak çalynýan zadyň size ýaraýandygyny ýa-da ýaramaýandygyny aýdýar. Her enjama bir anonim ses, radiolar hem, ony islän wagtyňyz üýtgedip ýa-da yzyna alyp bilersiňiz; operator jemleri açmasa, diňe öz başam barmagyňyzy görýärsiňiz.",
            "iPhone we iPad-de pleýer deslapky ýagdaýda ýönekeý çalyşy ulanýar, şonuň üçin aýdym-saz CarPlay, Bluetooth ýa-da gulplanan ekran bilen dowam edýär; ses güýji şonda enjamyň ýa-da awtoulagyň düwmeleri bilen bellenýär. «Programmanyň içindäki ses güýji» opsiýasy ses güýjüniň süýşürijisini, deňagramlylygy we VU ölçeýjini gaýtarýar, ýöne ses awtoulagda kesilip biler."] },
        { id: "sounds",
          t: "Ses effektleri",
          b: [
            "Oýun sesleri iş stoly müşderisindäki ýaly aýratyn açyp ýa-da öçürip bolýan dört kategoriýa bölünýär: oýun hereketleri (paýlanan kartlar, Check, Call, Raise, siziň nobatyňyz…), lobbi çatynyň duýduryşy, tor oýnunyň duýduryşlary (oýunçy goşuldy, oýun taýýar) we blaýndlaryň ýokarlanmagy barada duýduryş. Ýeke-täk ses güýji süýşürijisi hemmesini dolandyrýar, Giňişleýin sazlamalar → Ses bölüminde."],
          note: "Ähli brauzerler — esasanam iOS — sahypa bir gezek degmezden öň ses çalmakdan ýüz öwürýär. Oýun sessiz başlasa, islendik ýere bir basmak sesi janlandyrýar; müşderi hem iOS ony saklanda (gelýän jaň, fonda işlemek…) ses hereketlendirijisini awtomatik dikeldýär." },
        { id: "voice",
          t: "Ses we titreme",
          b: [
            "Iki goşmaça kanal ekrana seretmezden hem sizi habarly saklap biler: ses bilen habar bermek enjamyňyzyň gürleýiş sintezi arkaly oýun wakalaryny okaýar, telefonlarda bolsa gysga titreme nobatyňyzy belläp biler. Ikisi hem web goşundylary, enjama görä deslapky ýagdaýda öçük ýa-da açyk, Giňişleýin sazlamalar → Stawkalar we nobat bölüminde."],
          note: "Titreme Android-de (Chromium brauzerleri) işleýär; Apple saýtlara titreme API-sini bermeýär, şonuň üçin iPhone titräp bilmeýär. Ses bilen habar bermek hemme ýerde işleýär, ýöne elýeterli sesler we diller ulgamyňyza bagly — müşderi tapan iň laýygyny ulanýar." }
      ]
    },
    {
      id: "options", icon: "⚙️", title: "Opsiýalar we gysga ýollar",
      sections: [
        { id: "where",
          t: "Opsiýalar nirede",
          b: [
            "Giňişleýin sazlamalar islendik sözbaşy menýusyndaky dişli tigir bölüminden açylýar. Olar iş stoly müşderisindäki ýaly toparlanýar: Ulanyjy interfeýsi, Stil, Ses, Ýerli oýun, Tor oýny, Internet oýny, Lakamlar / Awatarlar, Žurnal habarlary we Ätiýaçlyk nusga we dikeltmek. Her web aýratynlygynyň şol ýerde öz açary bar, şonuň üçin ulanmaýan zadyňyzy öçürip bilersiňiz."] },
        { id: "cfgxml",
          t: "Iş stoly müşderisi bilen sazlamalary alyş-çalyş etmek",
          b: [
            "Sazlamalaryňyz müşderileriň arasynda geçip biler: Ätiýaçlyk nusga we dikeltmek kategoriýasy resmi config.xml faýlyny (iş stoly we QML müşderileriniň ulanýan ~/.pokerth/config.xml) eksport/import etmegi hödürleýär. Eksport umumy sazlamalary ýazýar — at, görkeziş opsiýalary, sesler, stol saýlawlary, blaýndlar, stiller — import bolsa iş stoly faýlyny şu ýerde ulanýar. Bu müşderiniň bilmeýän sazlamalary faýlda üýtgedilmän saklanýar.",
            "Oýunçylar baradaky bellikleriňiz hem faýl bilen bile geçýär — tekst we ýyldyz bahasy, iş stoly müşderileriniň okaýşy ýaly ýazylan. Reňkli belgiler bu müşderide galýar: resmi formatda olar üçin meýdan ýok, şonuň üçin import hiç haçan siziňkilere degmeýär."] },
        { id: "sync",
          t: "Sizi yzarlaýan sazlamalar",
          b: [
            "Hasap bilen oýnanyňyzda opsiýalaryňyz, temaňyz, klawiatura gysga ýollaryňyz, diliňiz we türgenleşik baýraklaryňyz sinhronlanýar: bir enjamda bir zady üýtgediň, indiki giren enjamyňyz ony kabul eder. Baýraklardaky öňegidişlik birleşdirilýär, hiç haçan üstünden ýazylmaýar, şonuň üçin iki enjamda oýnamak hemişe ikisiniň iň gowusyny saklaýar."] },
        { id: "updates",
          t: "Täzelenip durmak",
          b: [
            "Müşderi özüni täzeleýär: täze wersiýa ýerleşdirilende banner sizi täzelemäge çagyrýar (ýa-da el bilen barlamak üçin çatda /update ýazyň). Käwagt bir aýratynlyk barada pikiriňizi soraýan kiçijik önüm soragy peýda bolup biler — gatnaşmak hökmany däl we soraglary Giňişleýin sazlamalar → Jemgyýet bölüminde doly öçürip bolýar."] },
        { id: "fkeys",
          t: "Resmi klawiatura gysga ýollary",
          b: [
            "Oýun wagtynda PokerTH-iň resmi funksional düwmeleri işleýär — Alt+S islendik ýerde işleýär:"],
          keys: [
            ["F1 / F2 / F3 / F4", "Fold · Check/Call · Bet/Raise · All-In (tertibi opsiýalarda tersine öwrüp bolýar)   ⟦F1 / F2 / F3 / F4⟧"],
            ["F5", "Kartlaryňyzy görkeziň (mümkin bolanda)   ⟦F5⟧"],
            ["F6 / F7 / F8", "El bilen · Awtomatik Check/Fold · Awtomatik Check/Call   ⟦F6 / F7 / F8⟧"],
            ["Alt+M / Alt+K / Alt+F", "El bilen · Awtomatik Check/Call · Awtomatik Check/Fold   ⟦Alt+M / Alt+K / Alt+F⟧"],
            ["Alt+C / Alt+L / Alt+I", "Çat · Oýun žurnaly · Ähtimallyklar paneli   ⟦Alt+C / Alt+L / Alt+I⟧"],
            ["Alt+S", "Sazlamalar — programmanyň islendik ýerinde, diňe oýun wagtynda däl   ⟦Alt+S⟧"],
            ["F11", "Doly ekran   ⟦F11⟧"]],
          note: "Gysga ýollar fiziki klawiaturany talap edýär. Mac-da F düwmeleri deslapky ýagdaýda mediany dolandyrýar: Fn-i basyp saklaň (ýa-da macOS sazlamalarynda “Use F1, F2, etc. as standard function keys” opsiýasyny açyň). iPhone-da doly ekrany iOS çäklendirýär — programmany PWA hökmünde gurnamak şol bir doly ekran tejribesini berýär." },
        { id: "webkeys",
          t: "Web harp düwmeleri",
          b: [
            "Web goşundysy hökmünde bir harply düwmeler we Alt+T hem hereketleri ýerine ýetirýär, olaryň her birini Giňişleýin sazlamalar → Klawiatura gysga ýollary bölüminde täzeden bellemek bolýar:"],
          keys: [
            ["F", "Fold   ⟦F⟧"],
            ["C", "Check / Call   ⟦C⟧"],
            ["R", "Raise   ⟦R⟧"],
            ["A", "All-In   ⟦A⟧"],
            ["1 / 2 / 3", "Stawka 1/3 · 1/2 · Pot   ⟦1 / 2 / 3⟧"],
            ["Alt+T", "Statistika paneli   ⟦Alt+T⟧"],
            ["Esc", "Iň ýokarky penjiräni ýap (Android-iň «Yza» düwmesi hem)   ⟦Esc⟧"],
            ["↑ ↓ · ↵", "Lobbidäki stollaryň sanawy (oňa Tab bilen ýetiň): stol saýla · goşul   ⟦↑ ↓ · ↵⟧"]],
          note: "Android-de ulgamyň «Yza» düwmesi/hereketi oýundan çykmagyň deregine penjireleri Escape ýaly ýapýar (opsiýalarda sazlap bolýar). iOS-da beýle ulgam düwmesi ýok — her penjiräniň ✕ belgisini ulanyň." }
      ]
    }
  ]
};
