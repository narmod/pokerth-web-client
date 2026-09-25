// ── help/content/zu.mjs — Zulu (isiZulu) help corpus ────────────────────
//
// Same structure as en.mjs (reference): chapters[] → { id, icon, title,
// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand
// names of the rules chapter stay in English, as in the other help corpora.
export const help = {
  chapters: [
    {
      id: "start", icon: "🚀", title: "Ukuqala",
      sections: [
        { id: "modes",
          t: "Izindlela ezintathu zokudlala",
          b: [
            "Esikrinini sokungena, khetha ukuthi ufuna ukudlala kanjani."],
          list: [
            "Ku-inthanethi — dlala ku-inthanethi kuseva esemthethweni ye-pokerth.net ngokulinganiswa. Udinga i-akhawunti ye-pokerth.net; bhalisa mahhala ku-pokerth.net.",
            "Okwasendaweni / ukuziqeqesha — dlala ungaxhunyiwe namabhothi. Akukho okumele kusethwe, kusebenza ngaphandle koxhumano, futhi kuvula izindondo njengoba uqhubeka.",
            "LAN / Iseva ezinikele — xhuma kuseva yangasese ye-PokerTH kunethiwekhi yakho yendawo noma kukhompyutha yakho."] },
        { id: "lan",
          t: "LAN / iseva ezinikele",
          b: [
            "Imodi yesithathu ixhuma kunoma iyiphi iseva ye-PokerTH eqhutshwa nguwe noma ngumngane — kunethiwekhi yasekhaya, ku-VPS yangasese, noma kuphi. Faka ikheli nembobo yeseva, maka i-TLS uma iseva isebenzisa imbobo ebethelwe, bese ungena ngesiteketiso (ukungena kwesivakashi kuyasebenza uma iseva ikuvumela). Emva kwalokho yonke into etafuleni isebenza njengakuseva esemthethweni."] },
        { id: "famboard",
          t: "Uhlu lwabanqobi lomndeni",
          b: [
            "Kumaseva angasese nasemidlalweni ye-LAN kuphela, iklayenti ligcina izibalo zesikhathi sonke zesiteketiso ngasinye — izandla nemidlalo edlaliwe newiniwe, ukuwina okukhulu, uchungechunge lokuwina olungcono kakhulu — futhi lizabelana ngazo ngeseva ukuze yonke idivayisi ezungeze itafula ibone uhlu olufanayo. Imidlalo ye-pokerth.net ayilandelelwa neze ngale ndlela, futhi izibalo zemodi yokuziqeqesha zigcinwa zihlukene ngokuphelele.",
            "Kule midlalo, inkinobho yendondo ivula iwindi lezinga ekhasini layo le-LAN: bonke abadlali, abangahlelwa ngezilinganiso eziningana."] },
        { id: "language",
          t: "Ulimi",
          b: [
            "Isixhumi esibonakalayo sitholakala ngezilimi ezingu-81. Sishintshe noma nini ku-Izinketho ezithuthukisiwe (imenyu yegiya) ngaphansi kokuthi Isixhumi esibonakalayo. Amagama ezenzo ze-poker (Fold, Check, Call, Bet, Raise, All-In) ahlala esesiNgisini ngokwesiko, njengasekhasimendeni ledeskithophu. Amagama ezandla ze-poker nawo asesiNgisini."] },
        { id: "pwa",
          t: "Faka njengohlelo",
          b: [
            "Leli klayenti liyi-Progressive Web App: ungalifaka usebenzisa imenyu yesiphequluli sakho (noma inkinobho yokufaka esihlokweni) ukuze uthole uhlelo lwesikrini esigcwele olunesithonjana salo. Uma selifakiwe, liqala ngokushesha futhi imodi yokuziqeqesha isebenza ngokuphelele ngaphandle kwe-inthanethi."],
          note: "Ku-Android nase-Chrome/Edge yedeskithophu, inkinobho yokufaka yenza konke. Ku-iPhone/iPad i-Apple ivumela ukufaka nge-Safari kuphela: inkinobho ethi Yabelana → “Engeza Esikrinini Sasekhaya” — iklayenti likubonisa lezi zinyathelo lapho kudingeka. Inkinobho iyanyamalala uma uhlelo selufakiwe." },
        { id: "platforms",
          t: "Izinkundla neziphequluli",
          b: [
            "Iklayenti lisebenza kunoma yisiphi isiphequluli sesimanje kunoma yiluphi uhlelo — Windows, macOS, Linux, Android, iOS. Izici ezimbalwa zincike kuma-API esiphequluli amasha; lapho i-API ingekho, isici siyazifihla noma sichaze isizathu esikhundleni sokuphuka. Umehluko obalulekile okufanele uwazi:"],
          list: [
            "Chrome / Edge (deskithophu): konke kuyasebenza, kuhlanganise nokubhala amalogi e-.pdb kufolda.",
            "Firefox: konke ngaphandle kokubhala amalogi e-.pdb kufolda (i-API ayikabi khona).",
            "Safari / iOS: ukufaka nge-Yabelana → Engeza Esikrinini Sasekhaya; akukho ukudlidliza; isikrini esigcwele sinemikhawulo ku-iPhone; umsindo uqala ngemuva kokuthinta kwakho kokuqala.",
            "Android: ukusekelwa okugcwele kuziphequluli ze-Chromium, kuhlanganise nokudlidliza nokuziphatha kwenkinobho ethi Emuva."] },
        { id: "avatar",
          t: "Isiteketiso ne-avatar",
          b: [
            "Khetha isiteketiso sakho ne-avatar esikrinini sokungena ngaphambi kokuxhuma. Ku-pokerth.net, isiteketiso sakho yigama le-akhawunti yakho; i-avatar yabelwana nabanye abadlali ngeseva yama-avatar.",
            "I-avatar yakho ithunyelwa lapho uxhuma, futhi wonke umdlali ubona efanayo. Uma uyishintsha usuxhunyiwe, i-avatar entsha iqala ukusebenza ekuxhumeni kwakho okulandelayo. Uhlamvu lokuqala (Aa) aluthunyelwa: abanye abadlali babona i-avatar ezenzakalelayo."] }
      ]
    },
    {
      id: "rules", icon: "🃏", title: "Imithetho ye-poker",
      sections: [
        { id: "basics",
          t: "I-Texas Hold’em ngamafuphi",
          b: [
            "I-PokerTH idlala i-No-Limit Texas Hold’em. Umdlali ngamunye uthola amakhadi amabili ayimfihlo (amakhadi ephakethe). Bese amakhadi omphakathi amahlanu abekwa obala phakathi netafula. Isandla esingcono kakhulu samakhadi amahlanu esivela kunoma iyiphi inhlanganisela yamakhadi akho amabili namakhadi omphakathi amahlanu siwina i-pot."] },
        { id: "blinds",
          t: "Ama-blinds nenkinobho yomabi",
          b: [
            "Ngaphambi kwesandla ngasinye, ukubheja okuphoqelekile okubili kuqala i-pot: i-blind encane ne-blind enkulu, ezibekwa ngabadlali ababili abangakwesokunxele senkinobho yomabi. Inkinobho idlulela esihlalweni esisodwa ngendlela yewashi ngemuva kwesandla ngasinye, ngakho wonke umuntu ukhokha ama-blinds ngethuba lakhe. Ama-blinds ayakhuphuka njalo njengoba umdlalo uqhubeka.",
            "Etafuleni, inkinobho nama-blinds kumakwe ngama-puck: D (umabi), SB (i-blind encane), BB (i-blind enkulu)."] },
        { id: "streets",
          t: "Imizuliswano emine yokubheja",
          list: [
            "Pre-flop — ngemuva kokwabiwa kwamakhadi ephakethe, umzuliswano wokuqala uqala ngakwesokunxele se-blind enkulu.",
            "Flop — amakhadi omphakathi amathathu aphendulwa, bese kuba umzuliswano wokubheja.",
            "Turn — ikhadi lomphakathi lesine, bese kuba omunye umzuliswano wokubheja.",
            "River — ikhadi lomphakathi lesihlanu nelokugcina, bese kuba umzuliswano wokubheja wokugcina."],
          b: [
            "Umzuliswano wokubheja uyaphela lapho bonke abadlali abasesesandleni sebefake inani elifanayo ku-pot (noma bengu-all-in)."] },
        { id: "actions",
          t: "Ongakwenza ngethuba lakho",
          list: [
            "Fold — shiya isandla. Amakhadi akho ayalahlwa futhi awusancintisani nge-pot.",
            "Check — dlula ungabhejanga. Kuyenzeka kuphela uma kungekho lutho okufanele wenze i-call kulo.",
            "Call — lingana nokubheja kwamanje.",
            "Bet — vula ukubheja lapho kungekho muntu obhejile kulo mzuliswano.",
            "Raise — khulisa ukubheja okukhona. I-raise encane kunazo zonke ilingana nokubheja noma i-raise yangaphambilini.",
            "All-In — faka isitaki sakho sonke. Uhlala esandleni kuze kube yinani olimbozile."] },
        { id: "showdown",
          t: "I-showdown ne-pot ehlukanisiwe",
          b: [
            "Uma kusele umdlali ongaphezu koyedwa ngemuva komzuliswano wokubheja we-river, amakhadi ayavezwa futhi isandla esingcono kakhulu siyawina — isandla esiwinayo siboniswa ngaphansi kwamakhadi omphakathi. Lapho umdlali engu-all-in ngenani elingaphansi kokubheja okugcwele, kudalwa i-pot eseceleni: umdlali ngamunye angawina ingxenye ye-pot abe nesandla kuyo kuphela. Izandla ezilinganayo zihlukanisa i-pot.",
            "Akuwona wonke umuntu okufanele abonise: kuqala ngomdlali owenze ukubheja noma i-raise yokugcina, isandla siyavezwa kuphela uma sihlula lokho osekuboniswe kakade. Noma ubani onelungelo lokulahla amakhadi akhe uyawafihla futhi uthola inkinobho ethi Bonisa ukuze awaveze uma ethanda."] },
        { id: "hands",
          t: "Ukulandelana kwezandla",
          b: [
            "Kusukela kobuthakathaka kakhulu kuya koqine kakhulu:"],
          list: [
            "1. High Card — akukho nhlanganisela; ikhadi eliphezulu liyanquma.",
            "2. One Pair — amakhadi amabili anenani elifanayo.",
            "3. Two Pair — ama-pair amabili ahlukene.",
            "4. Three of a Kind — amakhadi amathathu anenani elifanayo.",
            "5. Straight — amakhadi amahlanu alandelanayo (i-Ace ingaba phezulu noma phansi).",
            "6. Flush — amakhadi amahlanu anombala ofanayo.",
            "7. Full House — Three of a Kind kanye ne-pair.",
            "8. Four of a Kind — amakhadi amane anenani elifanayo.",
            "9. Straight Flush — i-straight yombala ofanayo wonke.",
            "10. Royal Flush — kusukela ku-Ten kuya ku-Ace, konke umbala ofanayo. Isandla esingcono kakhulu esingenzeka."] }
      ]
    },
    {
      id: "game", icon: "🎮", title: "Isikrini somdlalo",
      sections: [
        { id: "actionbar",
          t: "Ibha yezenzo",
          b: [
            "Lapho kuyithuba lakho, ibha yezenzo ngezansi iyakhanya ngezinkinobho ezifika kwezine: Fold (bomvu), Check / Call (luhlaza okwesibhakabhaka), Bet / Raise (luhlaza — isenzo esiyinhloko esigqanyisiwe) ne-All-In (bomvu okumnyama). Inkinobho ethi Check / Call ibonisa inani eliqondile le-call; i-Bet / Raise ibonisa inani ozolifaka. Ngemuva kwe-river, i-All-In ingaba yinkinobho ethi Bonisa ukuze uveze amakhadi akho."] },
        { id: "betctl",
          t: "Ukukhetha ukubheja kwakho",
          b: [
            "Setha inani le-raise ngenkambu yezinombolo, isilayida, noma izinkinobho ezisheshayo 1/3 · 1/2 · Pot (izingxenye ze-pot yamanje). Amanani ayahlanganiswa ngokuzenzakalelayo futhi agcinwe phakathi kwe-raise encane nenkulu evumelekile. Uma ukhetha ukucabanga ngama-blind amakhulu, inketho ibonisa wonke amanani nge-BB esikhundleni sama-chip."] },
        { id: "preselect",
          t: "Ukukhetha isenzo kusengaphambili",
          b: [
            "Ngaphambi kwethuba lakho, ungalungiselela isenzo kusengaphambili: thepha inkinobho futhi izothola umngcele wegolide nechashazi elincane legolide. Lapho ithuba lakho lifika, isenzo senzeka ngokushesha. I-Fold elungiselelwe iba yi-Check ngokuzenzakalelayo lapho i-check imahhala — awulokothi wenze i-fold ngeze. Ukukhetha kusengaphambili kuyazisetha kabusha esandleni ngasinye esisha, ekushintsheni komzuliswano naku-showdown, futhi kuyakhanselwa uma isimo sishintsha (isibonelo uma inani le-call lishintsha)."] },
        { id: "automodes",
          t: "Amamodi azenzakalelayo",
          b: [
            "Imenyu eseduze nezinkinobho zezenzo inikeza amamodi amathathu okudlala: Mathupha, I-Check/Call ezenzakalelayo ne-Check/Fold ezenzakalelayo. Amamodi azenzakalelayo akudlalela kuze kube ubuyela emuva — noma yikuphi ukuchofoza isenzo mathupha kubuyela ku-Mathupha ngokushesha."] },
        { id: "readtable",
          t: "Ukufunda itafula",
          b: [
            "Ibhokisi lomdlali ngamunye libonisa i-avatar, igama, isitaki nokubheja kwamanje. Umabi nama-blinds kumakwe ngama-puck D / SB / BB. Uphawu olunombala ebhokisini lubonisa isenzo sokugcina somdlali; ibha encane eluhlaza okwesibhakabhaka ibala emuva isikhathi sakhe sokucabanga. Ibhokisi lomdlali okuyithuba lakhe liyakhanya; ibhokisi lakho lithola ifreyimu yegolide eshaya ngethuba lakho.",
            "Ibha yesimo ngaphezu kwetafula ibonisa isamba se-pot, ukubheja komzuliswano wamanje, isigaba (Pre-flop, Flop, Turn, River) nezinombolo zomdlalo nezesandla. Abadlali abenze i-fold banamakhadi abonakala kancane; abakhishiwe bafiphele. Ekupheleni kwesandla, iwindi lomnqobi lingafingqa ukuthi ubani owine ini — lingavalwa ezinketho."] },
        { id: "seatlayout",
          t: "Ukuhlelwa kwezihlalo",
          b: [
            "Njengengezo lewebhu, ukuhlelwa kwamabhokisi abadlali kungakhethwa ku-Izinketho ezithuthukisiwe → Izihlalo: Okuzenzakalelayo kulandela iklayenti elisemthethweni (izindawo ezingaguquki ngokuma, i-ellipse ebaliwe ngokulala), noma uphoqe ukuhlelwa Okuqondile noma Okulele — futhi Okwakho kukuvumela ukubeka isihlalo ngasinye ngokwakho: kuvela imodi yokuhlela lapho uhudula khona ibhokisi ngalinye uliyise lapho ulifuna khona, futhi ukuhlelwa kuyalondolozwa."] },
        { id: "zoom",
          t: "Ukusondeza itafula (amafoni)",
          b: [
            "Ezikrinini ezincane, izinkinobho zengilazi ekhulisayo zisondeza itafula (2×) futhi ungalihambisa ngomunwe — ibha yezenzo kuphela ehlala ingashukumi; ibhokisi lakho nalo liyakhuliswa, futhi ukubuka kubuyela kulo lapho kuyithuba lakho. Ukubuka kulandela isihlalo esisebenzayo ngokuzenzakalelayo futhi kuyahlehla ku-showdown ukuze kubonakale konke. Lokhu kungavalwa ku-Izinketho ezithuthukisiwe. Ngethuba lakho, uma amakhadi omphakathi engabonakali, ikhophi yawo encane ivela phezulu etafuleni; yithephe ukuze ugxumele kumakhadi bese ubuya."],
          note: "Kumafoni nakumathebhulethi, ukusondeza ngokuncinza kwesiphequluli kuvinjwe ngokuzenzakalelayo ukuze ukunyakaza kokusondeza kungenzeki ngephutha phakathi nesandla; kuvule futhi ku-Izinketho ezithuthukisiwe → Isixhumi esibonakalayo uma uthanda." },
        { id: "protections",
          t: "Ukuvikela ekulunguzeni nase-call engahlosiwe",
          b: [
            "Ukuvikela okubili ongakukhetha: Ukuvikela ekulunguzeni kugcina amakhadi akho efihliwe uze uwathinte (kuwusizo lapho othile engabona isikrini sakho), futhi ukuvikela i-call engahlosiwe kuvimba inkinobho ethi Call isikhashana ngemuva kwe-raise enkulu, ukuze ukuthinta okuhloselwe i-call encane kungashayi inani le-raise ngephutha. Kokubili kuku-Izinketho ezithuthukisiwe."] }
      ]
    },
    {
      id: "info", icon: "📊", title: "Iphaneli yolwazi",
      sections: [
        { id: "open",
          t: "Ukuvula iphaneli",
          b: [
            "Phakathi nomdlalo, iphaneli yolwazi ivuleka esihlokweni (noma i-Alt+L / Alt+I) futhi inamathebhu amathathu: Ilogi, Amathuba nezibalo. Kumafoni intanta phezu kwetafula; ezikrinini ezinkulu iyiwindi elingahudulwa futhi lishintshwe usayizi — bamba isibambo ⣿ ukuze ulihambise, imiphetho ukuze ushintshe usayizi. Indawo yalo iyakhunjulwa."] },
        { id: "log",
          t: "Ilogi yomdlalo",
          b: [
            "Ithebhu yeLogi irekhoda umdlalo wonke isandla ngesandla: ama-blinds, isenzo ngasinye namanani, amakhadi avezwe nabanqobi, ngemibala ukuze kufundeke ngokushesha. Inkinobho yokuthumela ilondoloza ilogi njengefayela uma ufuna ukubuyekeza iseshini kamuva."] },
        { id: "odds",
          t: "Amathuba (isiqapheli samathuba)",
          b: [
            "Ithebhu yamaThuba ibonisa, esandleni sakho samanje, amathuba abukhoma okugcina nesigaba ngasinye sezigaba zezandla eziyi-10 — kusukela ku-High Card kuya ku-Royal Flush — ngasinye nesithonjana saso, iphesenti nebha. Ukubonisa kuba mpunga uma usenze i-fold. Kusebenzisa amakhadi akho namakhadi omphakathi kuphela: akuboni lutho abaphikisi bakho abangalubonisi."] },
        { id: "journal",
          t: "Amalogi ezandla newindi lamaLogi",
          b: [
            "Ngaphandle kwelogi ebukhoma, isandla ngasinye osidlalayo sirekhodwa esipheqululini sakho, ngefomethi efanayo namafayela elogi e-.pdb eklayenti elisemthethweni. Iwindi lamaLogi (Izinketho ezithuthukisiwe → Imilayezo yelogi → Phatha amalogi…) libala amaseshini akho futhi likuvumela ukusebenza ngawo: buka iseshini kuqala ngokusesha nokugqamisa, hlunga ngomdlalo, thumela njenge-HTML noma umbhalo ongenalutho, londoloza ifayela le-.pdb elingaphathwanga, noma ungenise i-.pdb erekhodwe yiklayenti ledeskithophu. Amaseshini angasulwa ngalinye noma wonke kanyekanye (ngokuqinisekisa), futhi isilungiselelo sokugcina esizenzakalelayo singagcina izinsuku zokugcina ezingu-7, 30, 90, 180 noma 365 kuphela. Amalogi owangenisa ngokwakho awasuswa neze ngokuzenzakalelayo. Isilungiselelo sesibili sibeka umkhawulo wamaseshini agcinwayo, futhi ikholomu yohlu ingahudulwa ibe banzi.",
            "Ukuze usule amaseshini amaningana kanyekanye, inkinobho ethi Khetha… iguqula uhlu lube amabhokisi okumaka: maka lawo ofuna ukuwasusa bese u-Susa ususa iqoqo lonke ngemuva kokuqinisekisa okukodwa. Ekhompyutheni ungasebenzisa futhi i-Ctrl (⌘) + chofoza ukuze wengeze amaseshini ngalinye, noma i-Shift + chofoza ukuze uthathe uhla lonke.",
            "Inkinobho ethi Hlaziya iqhuba ukuhlaziywa kwezandla eseshinini futhi ingathumela ilogi kusevisi yokuhlaziya ye-pokerth.net. Konke kuhlala kudivayisi yakho ngaphandle kokuthi ukuthumele noma ukulayishe ngokucacile."] },
        { id: "logopts",
          t: "Izinketho zokurekhoda",
          b: [
            "Ku-Izinketho ezithuthukisiwe → Imilayezo yelogi ungavula noma uvale ukurekhoda futhi ukhethe isikhawu sokubhala, ngezilungiselelo ezintathu ezifanayo neklayenti ledeskithophu: ngemuva kwesenzo ngasinye, ngemuva kwesandla ngasinye (okuzenzakalelayo) noma ngemuva komdlalo ngamunye. Enye inketho ibhala ifayela le-.pdb kufolda oyikhethayo futhi ilibuyekeze ngaleso sikhawu, naphinde lapho ushiya ikhasi, ukuze elinye ithuluzi lilandele umdlalo bukhoma."],
          note: "Ukubhala kufolda yendawo kudinga i-File System Access API: i-Chrome, i-Edge ne-Opera zedeskithophu kuphela. Kwezinye izindawo inketho iyazichaza futhi ukuthumela mathupha kusuka ewindini lamaLogi kuhlala kutholakala. Isiphequluli singathatha indawo yefayela kuphela, hhayi ukwengeza kulo, ngakho ithuluzi elifunda i-.pdb kufanele liyivule kabusha ngemuva koshintsho ngalunye." },
        { id: "assist",
          t: "Umsizi (amandla esandla)",
          b: [
            "Phezulu kwethebhu yamaThuba, isibhengezo somsizi sikufundela isandla sakho. Ngaphambi kwe-flop siqamba isandla sakho sokuqala futhi sisilinganise ngezinkanyezi; kusukela ku-flop sibonisa inhlanganisela yakho engcono kakhulu yamanje futhi, ngemuva kokulingisa okusheshayo, amathuba akho alinganisiwe okuwina isandla njengephesenti, nesilinganiso sombala kusukela kokubomvu (okubuthakathaka) kuya kokuluhlaza (okuqinile). Njengesiqapheli samathuba, sisebenzisa ulwazi ongalubona kuphela.",
            "Kunezitayela ezimbili zokubonisa ku-Izinketho ezithuthukisiwe → Izihlalo: Izingxenye (amabhlogo ayishumi) noma ibha yenqubekelaphambili yakudala. Isici somsizi sonke singavalwa ku-Izinketho ezithuthukisiwe → Umsizi."] },
        { id: "assistwin",
          t: "Umsizi njengewijethi entantayo",
          b: [
            "Ibhlogo yomsizi ingasuswa kuphaneli ibe yiwindi layo elincane elihlala phezulu njalo: sebenzisa inkinobho yokukhipha ebhlogweni, bese uyihambisa futhi ushintshe usayizi wayo noma kuphi phezu kwetafula — kuwusizo ukuqaphela amandla esandla sakho ngaphandle kokuvula iphaneli yonke. Inkinobho yokubuyisela iyibuyisela kuthebhu yamaThuba, futhi indawo yayo iyakhunjulwa. Ngaphakathi kwephaneli, isibambo sokuhudula phakathi komsizi namathuba sikuvumela ukwabelana ngendawo phakathi kwakho kokubili."] },
        { id: "stats",
          t: "Izibalo",
          b: [
            "Ithebhu yezibalo ilandelela iseshini yakho: izandla ezidlaliwe, ama-flop abonwe, ama-showdown, amazinga okuwina nokunye. Ukulandelela izibalo kungavalwa ku-Izinketho ezithuthukisiwe."] },
        { id: "hud",
          t: "I-HUD yezibalo ezihlalweni",
          b: [
            "I-HUD inamathisela ibhokisi elincane lezibalo eduze kwesihlalo somdlali ngamunye, elakhiwe ngezandla ozirekhode kumalogi akho: inani lezandla eziqashelwe, bese i-VPIP (kangaki efaka imali ngokuzithandela ngaphambi kwe-flop), i-PFR (ama-raise angaphambi kwe-flop) ne-AF (isici sonya), ngemibala kusukela konesineke kuya konolaka. Ngaphansi kwazo uphawu lufingqa umdlali ngamagama alula — Oqinile, onesineke; Oxegayo, onolaka njalonjalo — eduze kwedayela encane ingxenye yayo ekhanyayo ifundwa kusukela kwesokunxele kuya kwesokudla kusuka koqinile kuya koxegayo, nangezansi kuya phezulu kusuka konesineke kuya konolaka. Uphawu luvela kusukela esandleni sokuqala kodwa luhlala lufiphele kuze kube yizandla ezingu-25, lapho luthembeka khona. Thepha ibhokisi ukuze uthole iwindi lemininingwane elinazo zonke izinombolo (3-bet, continuation bet, fold ku-3-bet, imizamo ye-steal, amazinga e-showdown…), futhi uhudule ibhokisi ukuze ulihambise uma limboza okuthile.",
            "I-HUD yazi kuphela lokho okubonile ematafuleni akho — ifunda amalogi akho ezandla endawo, ngakho ukurekhoda kufanele kuvulwe futhi izinombolo ziba nomqondo ngemuva kwezandla ezanele. Ivaliwe ngokuzenzakalelayo: yivule ku-Izinketho ezithuthukisiwe → Umsizi."] },
        { id: "handsbtn",
          t: "Ukubuka konke kwezinhlanganisela zezandla",
          b: [
            "Isithonjana sezandla ze-poker endwangwini sivula ukubuka okusheshayo kwezinhlanganisela eziyi-10 noma nini — kuwusizo uma usafunda. Singafihlwa ku-Izinketho ezithuthukisiwe."] }
      ]
    },
    {
      id: "chat", icon: "💬", title: "Ingxoxo nezenhlalo",
      sections: [
        { id: "panels",
          t: "Ingxoxo yelobhi nengxoxo yomdlalo",
          b: [
            "Kunengxoxo elobhini neyodwa etafuleni. Kumafoni ingxoxo yomdlalo intanta phezu kwetafula; ezikrinini ezinkulu iyiwindi elingahudulwa futhi lishintshwe usayizi. Uphawu enkinobhweni yengxoxo lubala imilayezo engafundiwe."] },
        { id: "typing",
          t: "Abasizi bokubhala",
          list: [
            "I-Tab iqedela isiteketiso — cindezela i-Tab futhi ukuze uhambe phakathi kwalokho okufanayo.",
            "↑ / ↓ kuhamba emlandweni wemilayezo yakho.",
            "Inkinobho ye-emoji ivula isikhethi esigcwele; ukubhala u-: nakho kuphakamisa ama-emote njengoba ubhala."] },
        { id: "emotes",
          t: "Ama-emote nama-smiley",
          b: [
            "Ingxoxo iguqula amakhodi amafushane ama-emote ngendlela efanayo neklayenti ledeskithophu elisemthethweni: bhala igama phakathi kwamakholoni futhi liba yi-emoji — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… amakhodi angaphezu kuka-1,900 ayasekelwa (isethi ephelele ye-GitHub). Ama-smiley ombhalo akudala nawo ayaguqulwa: :-) ;) :D xD :P <3 nabanye abangaba ngamashumi ayisishiyagalombili.",
            "Ukubhala u-: kuvula iwindi lokuphakamisa eliqedela ikhodi njengoba ubhala (↑/↓ ukukhetha, Tab noma Enter ukwamukela). Ukuguqulwa kwe-emoji kungavalwa ngokuphelele ku-Izinketho ezithuthukisiwe → Ingxoxo."] },
        { id: "commands",
          t: "Imiyalo yengxoxo",
          b: [
            "Ingxoxo iyayiqonda imiyalo eqala ngo-/. Emibili ibonakala kwabanye:"],
          keys: [
            ["/me <text>", "Umlayezo wesenzo, oboniswa ngokuthi “* igamalakho umbhalo”   ⟦/me <umbhalo>⟧"],
            ["/emoji <emoji>", "Idlala ukusabela kwe-emoji (lokho okuthunyelwa yisikhethi sokusabela)   ⟦/emoji <emoji>⟧"]] },
        { id: "diagcmds",
          t: "Imiyalo yokuxilonga",
          b: [
            "Konke okunye kungokwendawo: izimpendulo ziboniswa kuwe kuphela futhi akukho okuthunyelwa etafuleni. Bhala /help ukuze ubone yonke. Ewusizo kakhulu:"],
          keys: [
            ["/help", "Bonisa yonke imiyalo   ⟦/help⟧"],
            ["/update", "Hlola inguqulo entsha bese uvuselela   ⟦/update⟧"],
            ["/lang <code>", "Shintsha ulimi (isib. /lang fr)   ⟦/lang <code>⟧"],
            ["/sound on|off", "Vula / vala imisindo yomdlalo   ⟦/sound on|off⟧"],
            ["/zoom", "Vula / vala ingilazi ekhulisayo yetafula   ⟦/zoom⟧"],
            ["/clear", "Sula ingxoxo kule divayisi   ⟦/clear⟧"],
            ["/table", "Ulwazi lomdlalo wamanje (ama-blinds, abadlali, izitaki)   ⟦/table⟧"],
            ["/diag · /netdbg · /fps", "Ukuxilongwa kwesimo seklayenti, kwenethiwekhi nezinga lamafreyimu   ⟦/diag · /netdbg · /fps⟧"],
            ["/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg", "Ukulungisa amaphutha okuthuthukisiwe (amakhadi, iphrothokholi, umsindo, isitoreji, izihlalo)   ⟦/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg⟧"],
            ["/copy", "Kopisha impendulo yomyalo wokugcina ebhodini lokunamathisela   ⟦/copy⟧"]] },
        { id: "privatemsg",
          t: "Imilayezo yangasese",
          b: [
            "Bhalela umdlali oyedwa ngaphandle kokuthi ilobhi lonke lifunde. Imvilophu eduze kwegama ohlwini lwabadlali ivula ingxoxo naye; imvilophu esihlokweni selobhi ivula kabusha eyokugcina. Izingxoxo zigcinwa kule divayisi futhi zisekhona lapho ubuya, ngakho ingxoxo oqhubeka nayo ngemuva kwezinsuku inomlando wayo — inombolo ebomvu emvilophini ibonisa lokho ongakakufundi, futhi umgqomo osihlokweni sewindi usula ingxoxo unomphela."],
          keys: [
            ["/msg <nickname> <text>", "Thumela umlayezo wangasese usuka engxoxweni yelobhi   ⟦/msg <isiteketiso> <umbhalo>⟧"],
            ["/msg \"<nickname with spaces>\" <text>", "Kuyafana, uma isiteketiso sinezikhala   ⟦/msg \"<isiteketiso esinezikhala>\" <umbhalo>⟧"]],
          note: "Imilayezo ilinganiselwe ezinhlamvwini eziyi-128. Iseva ayiwulethi umlayezo wangasese kumdlali ohlezi etafuleni eliqhubekayo, futhi umlando ugcinwa kulesi siphequluli kuphela — awukulandeli uye kwenye idivayisi." },
        { id: "reactions",
          t: "Ukusabela kwe-emoji",
          b: [
            "Inkinobho yokusabela ivula isikhethi sokusabela okugqwayizayo okungu-30 (🎉, 😂, 😱, 🔥…) okudlala nomphumela ngaphezu kwesihlalo sakho, okubonwa yibo bonke etafuleni — kuhlanganise nabadlali abasekhasimendeni ledeskithophu. Ukusabela kungavalwa ngokuphelele ku-Izinketho ezithuthukisiwe."] },
        { id: "translate",
          t: "Ukuqonda wonke umuntu",
          b: [
            "Lapho ukuhumusha ingxoxo kuvuliwe, inkinobho yokuhumusha ivela emugqeni onekhesa lakho — noma emugqeni owuthephayo, esikrinini sokuthinta — futhi ibonisa lowo mlayezo ngolimi lwakho. Ingaboniswa njalo kuwo wonke umugqa ku-Izinketho ezithuthukisiwe → Ingxoxo, lapho kukhona nethiphu echaza izifinyezo ezijwayelekile zetafula (gg, nh, utg…)."],
          note: "Ukuhumusha kusebenzisa isevisi ye-Google Translate futhi kusebenza kuzo zonke iziphequluli — kudinga nje uxhumano lwe-inthanethi. Umlayezo uthunyelwa kusevisi yokuhumusha kuphela lapho uthepha inkinobho yawo yokuhumusha, hhayi neze ngokuzenzakalelayo." },
        { id: "social",
          t: "Abadlali: iphrofayela, isimemo, ukuziba",
          b: [
            "Thepha noma yimuphi umdlali — etafuleni noma ohlwini lwelobhi — ukuze uvule ikhadi lakhe: iphrofayela nezibalo, mmeme emdlalweni wakho, noma umzibe (imilayezo yakhe yengxoxo iyafihlwa; ukuziba kungahlehliswa noma nini). Ukuqinisekisa ngaphambi kokumema/ukuziba kungavulwa ezinketho."] }
      ]
    },
    {
      id: "lobby", icon: "🏛️", title: "Ilobhi nemidlalo",
      sections: [
        { id: "list",
          t: "Uhlu lwemidlalo",
          b: [
            "Ilobhi ibala wonke amatafula aseseva. Ukufakwa ngakunye kubonisa inani labadlali, uhlobo lomdlalo, ingidi lapho kudingeka iphasiwedi noma isimemo, nophawu lwesimo: “Kulindiwe” (kuluhlaza — umdlalo awukaqali, ungajoyina uma kunesihlalo esingenalutho), “Kuyaqhubeka” (umbala ofudumele — kungabukwa bukhoma uma ababukeli bevunyelwe) no-“Kuvaliwe” (kufiphele). Itafula eligcwele libonisa nje inani eligcwele, njengo-10/10; imibala yezimpawu ilandela itimu esebenzayo.",
            "Imenyu yesihlungi inciphisa uhlu ngendlela efanayo neklayenti ledeskithophu, ukukhetha ngakunye kuqinile kunokwangaphambilini: imidlalo evuliwe kuphela → ifihla namatafula agcwele → bese kuba engeyona eyangasese kuphela, eyangasese kuphela, noma imidlalo yezinga kuphela. Ukukhetha kwakho kuyakhunjulwa. Inkambu yokusesha ithola umdlalo ngegama, futhi uphawu lwabadlali luvula uhlu lwabo bonke abaku-inthanethi, olungaseshwa futhi luhlelwe."] },
        { id: "join",
          t: "Ukujoyina nokubuka",
          b: [
            "Khetha umdlalo ovuliwe bese uyajoyina — ingidi isho ukuthi kudingeka iphasiwedi. Imidlalo eqhubekayo evumela ababukeli ingabukwa bukhoma: ubona itafula nengxoxo, kodwa amakhadi ephakethe ahlala efihliwe futhi awukwazi ukwenza lutho."] },
        { id: "gameinfo",
          t: "Ulwazi lomdlalo",
          b: [
            "Ngaphambi kokujoyina, ikhadi lolwazi lomdlalo libonisa konke okuchaza itafula: uhlobo lomdlalo, ama-blinds nendlela akhuphuka ngayo (ukuphinda kabili noma uhlu lwamathupha), imali yokuqala, isikhathi sesenzo, ukubambezeleka phakathi kwezandla, nokuthi ubani osehlezi."] },
        { id: "create",
          t: "Ukudala umdlalo",
          b: [
            "Dala itafula lakho: igama, inani labadlali, imali yokuqala, i-blind encane yokuqala nohlelo lokukhuphula, isikhathi sesenzo, nokuthi ababukeli bavunyelwe yini. Kunezinhlobo ezine zemidlalo: Okujwayelekile (noma ubani), abadlali ababhalisiwe kuphela, ngesimemo kuphela, ne-Ranking (ibalelwa ezingeni elisemthethweni — ayikho iphasiwedi evunyelwe lapho). Izilungiselelo zakho ozithandayo zingalondolozwa futhi zilayishwe kabusha."] },
        { id: "invites",
          t: "Izimemo",
          b: [
            "Abadlali bangakumema etafuleni labo; uthola isaziso ongasamukela noma usenqabe. Ukumenywa ukuphela kwendlela yokungena emdlalweni wesimemo kuphela."] }
      ]
    },
    {
      id: "pthnet", icon: "🌐", title: "pokerth.net",
      sections: [
        { id: "account",
          t: "I-akhawunti yakho",
          b: [
            "Iseva esemthethweni ye-inthanethi yi-pokerth.net. Ukudlala lapho kudinga i-akhawunti ye-pokerth.net yamahhala — bhalisa kuwebhusayithi, bese ungena lapha ngesiteketiso nephasiwedi efanayo. Leli klayenti lewebhu lixhuma kuseva efanayo neklayenti ledeskithophu: ama-akhawunti afanayo, amatafula afanayo, amazinga afanayo, futhi ungahlala etafuleni nabadlali bedeskithophu."] },
        { id: "ranked",
          t: "Imidlalo yezinga namasizini",
          b: [
            "Imidlalo yohlobo lwe-Ranking ibalelwa ezingeni lesizini elisemthethweni. Iphrofayela yakho ohlelweni ibonisa ukuthi wajoyina nini, iZinga lakho lesizini yamanje, Amaphuzu, isilinganiso nemidlalo edlaliwe, kanye nemiphumela yakho yakamuva. Imidlalo ejwayelekile (engeyona eyezinga) ingeyokuzijabulisa nje futhi ayishintshi lutho."] },
        { id: "rankhow",
          t: "Indlela izinga elibalwa ngayo",
          b: [
            "Emdlalweni wezinga ngamunye, indawo oqeda kuyo ikunika amaphuzu: 15 kowokuqala, bese kuba ngu-9, 6, 4, 3, 2 no-1 kuze kube owesikhombisa; owesishiyagalombili kuya kowesishumi abatholi lutho. Ngakho itafula linikeza amaphuzu angu-40 esewonke.",
            "Amaphuzu akho awasona isamba salawo maphuzu kodwa isilinganiso sakho ngomdlalo ngamunye, silungiswa yisici esikhula ngenani lemidlalo edlaliwe: imiphumela emihle embalwa ayanele ukuhlala phezulu, kudingeka nokuzinza — lapho udlala kakhulu, amaphuzu akho asondela kakhulu esilinganisweni sakho sangempela. Amasizini athatha ikota yonyaka: ekushintsheni konke kuyagcinwa futhi izibali ziqala kabusha kusukela ku-zero, amasizini angaphambilini esatholakala. Emdlalweni, inkinobho yesiteji ibonisa izinga lesizini labadlali abasetafuleni lakho."],
          note: "Isikali samaphuzu nefomula eqondile kusethwa yiseva yezinga ye-pokerth.net futhi kungashintsha; amakhasi awebhusayithi ayireferensi." },
        { id: "rankings",
          t: "Amakhasi ezinga",
          b: [
            "Into yezinga ivula izinga elisemthethweni le-PokerTH, elingaseshwa ngomdlali, kanye namazinga omphakathi (BBC, WEC). Uma ungenandaba namazinga, into ingafihlwa ku-Izinketho ezithuthukisiwe → Umphakathi."] },
        { id: "cups",
          t: "Izindebe zomphakathi: BBC ne-WeCup",
          b: [
            "Imiphakathi emibili iqhuba imiqhudelwano yayo ku-pokerth.net, ngamunye unewebhusayithi nezinga lawo. I-Best Brainies Cup (BBC) ingumqhudelwano wezinyathelo owazalwa ngo-2013: ukhuphuka kusukela ku-Step 1 kuya ku-Step 4, futhi isizini entsha iqala ngemuva komdlalo ngamunye we-Step 4, lapho kunikezwa indebe. I-WeCup (WEC) inesikali sayo, esisabalele kakhulu — amaphuzu angu-75 endaweni yokuqala, bese kuba ngu-45, 30, 20… — futhi amaphuzu ayo alungisa isilinganiso sakho ngokwenani lemidlalo oyidlalile uma kuqhathaniswa namanye amalungu.",
            "Womabili amazinga avuleka enkinobhweni yendondo, eduze kwezinga le-PokerTH. Izilungiselelo zamatafula ale miqhudelwano zitholakala njengezilungiselelo ezingaphambili lapho udala umdlalo (BBC Step 1 kuya ku-4, WEC, WEC Monthly Final ne-WEC Grand Final), ukuze uziqeqeshe ngaphansi kwezimo ezifanayo. Ukuhlanganyela kudinga ukubhalisa kuwebhusayithi yendebe ethintekayo."],
          note: "Lokhu okuqukethwe kungafihlwa kanye ku-Izinketho ezithuthukisiwe → Umphakathi uma izindebe zingakuthandi." },
        { id: "forumcups",
          t: "Izindebe zeforamu nemicimbi",
          b: [
            "Iforamu ye-pokerth.net iphinde isingathe i-Monthly Cup, uchungechunge lwanyanga zonke lapho abadlali behlukaniswa ngamatafula e-Gold, Silver ne-Bronze ngaphambi kokuthweswa umqhele iqhawe lenyanga, kanye nezindebe ezikhethekile ngezikhathi ezithile ngonyaka.",
            "Ukubhalisa, izinhlelo, izilungiselelo zamatafula nemiphumela kushicilelwa kuforamu, futhi imidlalo idlalwa kuseva esemthethweni njenganoma yimuphi omunye. I-akhawunti ye-pokerth.net yanele ukulandela imiphumela; ukungena endebeni kwenziwa ngendikimba yeforamu efanele."] },
        { id: "forumnews",
          t: "Izindaba zeforamu elobhini",
          b: [
            "Inkinobho yephephandaba esihlokweni selobhi ivula okuthunyelwe kwakamuva kweforamu ye-pokerth.net, into eyodwa ngendikimba ngayinye, iforamu ngayinye inombala wayo. Uphawu enkinobhweni lubala okuthunyelwe okungafundiwe; ukuvula okuthunyelwe (ithebhu entsha) kukumaka njengokufundiwe, futhi u-“Maka konke njengokufundiwe” usula konke kanyekanye.",
            "Lokhu kuyingezo lewebhu: inkinobho ingafihlwa ku-Izinketho ezithuthukisiwe (“Inkinobho yeforamu esihlokweni selobhi”).",
            "Ithebhu ethi “Imicimbi” ibonisa imidlalo ye-BBC ezayo ne-Monthly Cup elandelayo nenani labadlali ababhalisile, kanye nabanqobi bakamuva be-BBC, be-WEC nabe-Monthly Cup. Izikhathi zisesikhathini sakho sendawo, futhi ukuthepha kuvula iwebhusayithi yomphakathi. Inketho ethi “Bonisa okuqukethwe komphakathi (BBC / WEC)” iyayifihla le thebhu."] },
        { id: "avatars",
          t: "Ama-avatar namafulegi",
          b: [
            "Ku-pokerth.net i-avatar yakho isatshalaliswa kwabanye abadlali ngeseva yama-avatar, futhi ifulegi elincane lezwe lingaboniswa emabhokisini abadlali. Kokubili kungokuzikhethela futhi kuyahleleka ezinketho."] }
      ]
    },
    {
      id: "offline", icon: "🏋️", title: "Imodi yokuziqeqesha",
      sections: [
        { id: "what",
          t: "Iyini",
          b: [
            "Imodi yendawo / yokuziqeqesha ingumdlalo ogcwele nabaphikisi bekhompyutha: akukho uxhumano, akukho i-akhawunti, akukho okusengcupheni. Uma uhlelo selufakiwe (noma nje luvakashelwe kanye), lusebenza ngokuphelele ngaphandle kwe-inthanethi — kulungele ukufunda umdlalo, ukuhlola isixhumi esibonakalayo noma ukuchitha isikhathi kumodi yendiza."] },
        { id: "setup",
          t: "Ukusetha umdlalo",
          b: [
            "Khetha inani labaphikisi, imali yokuqala, ama-blinds nohlelo lokukhuphula, nesivinini somdlalo. Ukuhlelwa kwamabhothi nobunzima bawo kungalungiswa ku-Izinketho ezithuthukisiwe → Umdlalo wendawo — kusukela kubaphikisi abamnene kuya etafuleni elixubile elinzima kakhudlwana."] },
        { id: "trophies",
          t: "Izindondo",
          b: [
            "Imodi yokuziqeqesha inenqubekelaphambili yayo: izindondo ezingu-28 ezigabeni eziyisithupha (intuthuko, ikhono, isitayela, amafomethi, ubumnandi neyimfihlo eyodwa) ziyavuleka njengoba udlala — izandla ezidlaliwe, imidlalo ewiniwe, ama-bluff amakhulu, izandla ezikhethekile nokunye. Inqubekelaphambili yakho yezindondo iyanqwabelana futhi ihlangana phakathi kwamadivayisi lapho ukuvumelaniswa kwezilungiselelo ze-akhawunti kusebenza."] },
        { id: "learn",
          t: "Indawo enhle yokufunda",
          b: [
            "Konke okusezahlukweni ezinye kusebenza nalapha: isiqapheli samathuba, ukubonisa komsizi, ukukhetha kusengaphambili, izinqamuleli zekhibhodi. Imodi yokuziqeqesha iyindawo engcono kakhulu yokukuzama ngaphandle kwengcindezi ngaphambi kokuya ku-pokerth.net."] }
      ]
    },
    {
      id: "style", icon: "🎨", title: "Isitayela nomsindo",
      sections: [
        { id: "themes",
          t: "Amatimu",
          b: [
            "Isigaba sesiTayela ku-Izinketho ezithuthukisiwe sishintsha ukubukeka kweklayenti lonke. Izilungiselelo ezingaphambili zisetha konke ngokuthepha kanye (ikhasino eluhlaza yakudala, ukubukeka okusemthethweni kwe-PokerTH…); ngaphansi kwazo, izingxenye ezihlukene zikuvumela ukulungisa imibala, indwangu yetafula nobuso bamakhadi ngokwehlukana — shintsha noma iyiphi ingxenye futhi inhlanganisela yakho iba yitimu yakho. Imodi emnyama, ekhanyayo noma ezenzakalelayo ikhethwa ku-Isixhumi esibonakalayo, futhi ukukhetha kwakho kusebenza ngokushesha, kuzo zonke izikrini, futhi kuyakhunjulwa."] },
        { id: "tablelook",
          t: "Amatafula, amakhadi, izihlalo",
          b: [
            "Ngaphandle kwetimu, izinto eziningana zingashintshwa ngokuzimela: ingemuva letafula, amakhadi, ingemuva lekhadi (hambisana namakhadi ngokuzenzakalelayo noma ungenise isithombe sakho), ama-puck omabi nawama-blinds, isitayela sezinkinobho zezenzo, namaphakethe ezihlalo agcwele ashintsha ukubukeka kwamabhokisi abadlali. Khetha konke ku-Izinketho ezithuthukisiwe → Isitayela; izinguquko zibonakala ngokushesha etafuleni."] },
        { id: "music",
          t: "Isidlali somculo",
          b: [
            "Into yomculo kumamenyu esihloko ivula isidlali esincane somculo we-lounge: khetha ithrekhi ohlwini lokudlalwayo, dlala/misa kancane, okwangaphambili/okulandelayo, xuba, futhi uphinde ithrekhi eyodwa, uhlu lonke noma lutho. Ivolumu, ithrekhi ekhethiwe nemodi yokuphinda kuyakhunjulwa. Ukudlala akuqali ngokwakho neze — iziphequluli zidinga ukuthepha — futhi isidlali sizimele ngokuphelele emisindweni yomdlalo.",
            "Izithupha ezimbili ngaphansi kwesihloko sethrekhi zisho ukuthi uyakuthanda yini okudlalayo. Ivoti elilodwa elingaziwa ngedivayisi ngayinye, kuhlanganise nemisakazo, futhi ungalishintsha noma ulihoxise noma nini; ngaphandle kokuthi umqhubi aveze izamba, ubona isithupha sakho kuphela.",
            "Ku-iPhone naku-iPad isidlali sisebenzisa ukudlala okulula ngokuzenzakalelayo, ukuze umculo uqhubeke ne-CarPlay, i-Bluetooth noma isikrini esikhiyiwe; ivolumu isethwa ngezinkinobho zedivayisi noma zemoto. Inketho ethi “Ivolumu ngaphakathi kohlelo” ibuyisela isilayida sevolumu, ibhalansi nemitha ye-VU, kodwa umsindo ungase unqamuke emotweni."] },
        { id: "sounds",
          t: "Imiphumela yomsindo",
          b: [
            "Imisindo yomdlalo ihlelwe ngezigaba ezine ezingavulwa noma zivalwe ngokwehlukana, ngendlela efanayo neklayenti ledeskithophu: izenzo zomdlalo (amakhadi abiwe, Check, Call, Raise, ithuba lakho…), isaziso sengxoxo yelobhi, izaziso zomdlalo wenethiwekhi (umdlali ujoyine, umdlalo ulungile) nesaziso sokukhushulwa kwama-blinds. Isilayida sevolumu esisodwa siyazilawula zonke, ku-Izinketho ezithuthukisiwe → Umsindo."],
          note: "Zonke iziphequluli — ikakhulukazi i-iOS — ziyenqaba ukudlala umsindo ngaphambi kokuthi uthinte ikhasi kanye. Uma umdlalo uqala uthule, ukuthepha okukodwa noma kuphi kuletha umsindo; iklayenti liphinde lilungise injini yomsindo ngokuzenzakalelayo lapho i-iOS iyimisa (ikholi engenayo, ukusebenza ngemuva…)." },
        { id: "voice",
          t: "Izwi nokudlidliza",
          b: [
            "Iziteshi ezimbili ezengeziwe zingakwazisa ngaphandle kokubheka isikrini: izimemezelo zezwi zifunda izehlakalo zomdlalo ngokuzwakalayo zisebenzisa ukuhlanganiswa kwenkulumo kwedivayisi yakho, futhi kumafoni ukudlidliza okufushane kungamaka ithuba lakho. Kokubili kuyizengezo zewebhu, kuvaliwe noma kuvuliwe ngokuzenzakalelayo kuya ngedivayisi, ku-Izinketho ezithuthukisiwe → Ukubheja nethuba."],
          note: "Ukudlidliza kusebenza ku-Android (iziphequluli ze-Chromium); i-Apple ayiyinikezi i-API yokudlidliza kumawebhusayithi, ngakho ama-iPhone awakwazi ukudlidliza. Izimemezelo zezwi zisebenza yonke indawo, kodwa amazwi nezilimi ezitholakalayo kuncike ohlelweni lwakho — iklayenti lisebenzisa elifanele kakhulu elilitholayo." }
      ]
    },
    {
      id: "options", icon: "⚙️", title: "Izinketho nezinqamuleli",
      sections: [
        { id: "where",
          t: "Lapho izinketho zikhona khona",
          b: [
            "Izinketho ezithuthukisiwe zivuleka entweni yegiya kunoma iyiphi imenyu yesihloko. Zihlelwe njengeklayenti ledeskithophu: Isixhumi esibonakalayo, Isitayela, Umsindo, Umdlalo wendawo, Umdlalo wenethiwekhi, Umdlalo we-inthanethi, Iziteketiso / Ama-avatar, Imilayezo yelogi, nesipele nokusetha kabusha. Isici ngasinye sewebhu sinokushintsha kwaso lapho, ngakho ungavala noma yini ongayisebenzisi."] },
        { id: "cfgxml",
          t: "Ukushintshanisa izilungiselelo neklayenti ledeskithophu",
          b: [
            "Izilungiselelo zakho zingahamba phakathi kwamaklayenti: isigaba sesipele nokusetha kabusha sinikeza ukuthumela/ukungenisa ifayela elisemthethweni le-config.xml (i-~/.pokerth/config.xml esetshenziswa amaklayenti edeskithophu ne-QML). Ukuthumela kubhala izilungiselelo ezabiwe — igama, izinketho zokubonisa, imisindo, okuthandwayo kwetafula, ama-blinds, izitayela — futhi ukungenisa kusebenzisa ifayela ledeskithophu lapha. Izilungiselelo leli klayenti elingazazi zigcinwa efayeleni zingathintiwe.",
            "Amanothi akho ngabadlali nawo ahamba nefayela — umbhalo nesilinganiso sezinkanyezi, kubhalwe ngendlela amaklayenti edeskithophu akufunda ngayo. Amalebula emibala ahlala kuleli klayenti: ifomethi esemthethweni ayinayo inkambu yawo, ngakho ukungenisa akulokothi kuthinte awakho."] },
        { id: "sync",
          t: "Izilungiselelo ezikulandelayo",
          b: [
            "Lapho udlala nge-akhawunti, izinketho zakho, itimu, izinqamuleli zekhibhodi, ulimi nezindondo zokuziqeqesha kuyavumelaniswa: shintsha okuthile kudivayisi eyodwa futhi idivayisi elandelayo ongena ngayo iyakuthatha. Inqubekelaphambili yezindondo iyahlanganiswa, ayibhalwa phezu kwayo neze, ngakho ukudlala kumadivayisi amabili kuhlala kugcina okungcono kakhulu kokubili."] },
        { id: "updates",
          t: "Ukuhlala ubuyekeziwe",
          b: [
            "Iklayenti liyazibuyekeza: lapho inguqulo entsha ikhishwa, isibhengezo sikumema ukuthi uvuselele (noma bhala /update engxoxweni ukuze uhlole mathupha). Ngezikhathi ezithile kungavela inhlolovo encane yomkhiqizo ibuza umbono wakho ngesici — ukuhlanganyela kungokuzikhethela futhi izinhlolovo zingavalwa ngokuphelele ku-Izinketho ezithuthukisiwe → Umphakathi."] },
        { id: "fkeys",
          t: "Izinqamuleli zekhibhodi ezisemthethweni",
          b: [
            "Okhiye bemisebenzi abasemthethweni be-PokerTH bayasebenza phakathi nomdlalo — i-Alt+S isebenza noma kuphi:"],
          keys: [
            ["F1 / F2 / F3 / F4", "Fold · Check/Call · Bet/Raise · All-In (uhlelo lungahlehliswa ezinketho)   ⟦F1 / F2 / F3 / F4⟧"],
            ["F5", "Bonisa amakhadi akho (lapho kungenzeka)   ⟦F5⟧"],
            ["F6 / F7 / F8", "Mathupha · I-Check/Fold ezenzakalelayo · I-Check/Call ezenzakalelayo   ⟦F6 / F7 / F8⟧"],
            ["Alt+M / Alt+K / Alt+F", "Mathupha · I-Check/Call ezenzakalelayo · I-Check/Fold ezenzakalelayo   ⟦Alt+M / Alt+K / Alt+F⟧"],
            ["Alt+C / Alt+L / Alt+I", "Ingxoxo · Ilogi yomdlalo · Iphaneli yamathuba   ⟦Alt+C / Alt+L / Alt+I⟧"],
            ["Alt+S", "Izilungiselelo — noma kuphi ohlelweni, hhayi phakathi nomdlalo kuphela   ⟦Alt+S⟧"],
            ["F11", "Isikrini esigcwele   ⟦F11⟧"]],
          note: "Izinqamuleli zidinga ikhibhodi ephathekayo. Ku-Mac, okhiye be-F balawula imidiya ngokuzenzakalelayo: bamba i-Fn (noma uvule ethi “Use F1, F2, etc. as standard function keys” kuzilungiselelo ze-macOS). Ku-iPhone, isikrini esigcwele sinqunyelwe yi-iOS — ukufaka uhlelo njenge-PWA kunikeza ulwazi olufanayo lwesikrini esigcwele." },
        { id: "webkeys",
          t: "Okhiye bezinhlamvu bewebhu",
          b: [
            "Njengengezo lewebhu, okhiye bohlamvu olulodwa ne-Alt+T nabo benza izenzo, futhi ngamunye wabo angabelwa kabusha ku-Izinketho ezithuthukisiwe → Izinqamuleli zekhibhodi:"],
          keys: [
            ["F", "Fold   ⟦F⟧"],
            ["C", "Check / Call   ⟦C⟧"],
            ["R", "Raise   ⟦R⟧"],
            ["A", "All-In   ⟦A⟧"],
            ["1 / 2 / 3", "Bheja 1/3 · 1/2 · Pot   ⟦1 / 2 / 3⟧"],
            ["Alt+T", "Iphaneli yezibalo   ⟦Alt+T⟧"],
            ["Esc", "Vala iwindi eliphezulu (nenkinobho ethi Emuva ye-Android)   ⟦Esc⟧"],
            ["↑ ↓ · ↵", "Uhlu lwamatafula elobhi (lifinyelele nge-Tab): khetha itafula · joyina   ⟦↑ ↓ · ↵⟧"]],
          note: "Ku-Android, inkinobho/ukunyakaza kohlelo okuthi Emuva kuvala amawindi njenge-Escape esikhundleni sokushiya umdlalo (kuyahleleka ezinketho). I-iOS ayinayo inkinobho yohlelo efanayo — sebenzisa u-✕ wewindi ngalinye." }
      ]
    }
  ]
};
