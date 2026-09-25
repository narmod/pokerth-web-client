// ── help/content/eo.mjs — Esperanto (Esperanto) help corpus ────────────────────
//
// Same structure as en.mjs (reference): chapters[] → { id, icon, title,
// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand
// names of the rules chapter stay in English, as in the other help corpora.
export const help = {
  chapters: [
    {
      id: "start", icon: "🚀", title: "Unuaj paŝoj",
      sections: [
        { id: "modes",
          t: "Tri manieroj ludi",
          b: [
            "Sur la ensaluta ekrano, elektu kiel vi volas ludi."],
          list: [
            "Interreto — ludu rete ĉe la oficiala servilo pokerth.net kun rangigo. Necesas konto ĉe pokerth.net; registriĝu senpage ĉe pokerth.net.",
            "Loka / trejnado — ludu senkonekte kontraŭ robotoj. Nenio por agordi, funkcias sen konekto kaj malŝlosas trofeojn dum vi progresas.",
            "LAN / Dediĉita servilo — konektiĝu al privata PokerTH-servilo en via loka reto aŭ en via propra komputilo."] },
        { id: "lan",
          t: "LAN / dediĉita servilo",
          b: [
            "La tria reĝimo konektiĝas al ajna PokerTH-servilo, kiun vi aŭ amiko funkciigas — en hejma reto, ĉe privata VPS, ie ajn. Entajpu la adreson kaj pordon de la servilo, marku TLS se la servilo uzas ĉifritan pordon, kaj ensalutu per kaŝnomo (gasta aliro funkcias se la servilo permesas ĝin). Poste ĉio ĉe la tablo funkcias ĝuste kiel ĉe la oficiala servilo."] },
        { id: "famboard",
          t: "Familia rangolisto",
          b: [
            "Nur ĉe privataj serviloj kaj en LAN-ludoj, la kliento tenas tutvivajn statistikojn por ĉiu kaŝnomo — luditaj kaj gajnitaj manoj kaj ludoj, plej granda gajno, plej bona serio — kaj kunhavigas ilin tra la servilo, por ke ĉiu aparato ĉirkaŭ la tablo vidu la saman rangoliston. Ludoj ĉe pokerth.net neniam estas spurataj tiel, kaj la statistikoj de la trejna reĝimo estas konservataj tute aparte.",
            "En tiuj ludoj, la trofea butono malfermas la rangigan fenestron ĉe ĝia LAN-langeto: ĉiuj ludantoj, ordigeblaj laŭ pluraj kriterioj."] },
        { id: "language",
          t: "Lingvo",
          b: [
            "La interfaco disponeblas en 83 lingvoj. Ŝanĝu ĝin iam ajn en Altnivelaj opcioj (dentrada menuo) sub Uzantinterfaco. La terminoj de pokeraj agoj (Fold, Check, Call, Bet, Raise, All-In) tradicie restas en la angla, ĝuste kiel en la labortabla kliento."] },
        { id: "pwa",
          t: "Instali kiel aplikaĵon",
          b: [
            "Ĉi tiu kliento estas Progressive Web App: vi povas instali ĝin el la menuo de via retumilo (aŭ per la instala butono en la kaplinio) por akiri plenekranan aplikaĵon kun propra piktogramo. Post instalo ĝi lanĉiĝas tuj kaj la trejna reĝimo funkcias tute senkonekte."],
          note: "Ĉe Android kaj labortablaj Chrome/Edge, la instala butono faras ĉion. Ĉe iPhone/iPad Apple permesas instaladon nur per Safari: butono Kunhavigi → “Aldoni al hejmekrano” — la kliento montras tiujn paŝojn kiam necese. La butono malaperas post instalo de la aplikaĵo." },
        { id: "platforms",
          t: "Platformoj kaj retumiloj",
          b: [
            "La kliento funkcias en ajna moderna retumilo en ajna sistemo — Windows, macOS, Linux, Android, iOS. Kelkaj funkcioj dependas de pli novaj retumilaj API-oj; kiam API mankas, la funkcio kaŝas sin aŭ klarigas kial anstataŭ rompiĝi. La ĉefaj diferencoj:"],
          list: [
            "Chrome / Edge (labortablo): ĉio funkcias, inkluzive de skribado de la .pdb-protokolo en dosierujon.",
            "Firefox: ĉio krom skribado de la .pdb-protokolo en dosierujon (la API ankoraŭ ne disponeblas).",
            "Safari / iOS: instalado per Kunhavigi → Aldoni al hejmekrano; neniu vibrado; plenekrano limigita ĉe iPhone; la sono komenciĝas post via unua tuŝo.",
            "Android: plena subteno en Chromium-retumiloj, inkluzive de vibrado kaj la konduto de la butono Reen."] },
        { id: "avatar",
          t: "Kaŝnomo kaj avataro",
          b: [
            "Elektu vian kaŝnomon kaj avataron sur la ensaluta ekrano antaŭ ol konektiĝi. Ĉe pokerth.net, via kaŝnomo estas via kontonomo; avataroj estas kunhavigataj kun aliaj ludantoj tra la avatara servilo.",
            "Via avataro estas sendata ĉe konektiĝo, kaj ĉiuj ludantoj vidas la saman. Se vi ŝanĝas ĝin dum konektita, la nova avataro validos ekde via sekva konekto. La inicialo (Aa) ne estas sendata: aliaj ludantoj vidas la defaŭltan avataron."] }
      ]
    },
    {
      id: "rules", icon: "🃏", title: "Pokeraj reguloj",
      sections: [
        { id: "basics",
          t: "Texas Hold’em mallonge",
          b: [
            "PokerTH ludas No-Limit Texas Hold’em. Ĉiu ludanto ricevas du privatajn kartojn (poŝkartojn). Poste kvin komunaj kartoj estas metataj vizaĝe supren en la mezo de la tablo. La plej bona kvinkarta mano el ajna kombinaĵo de viaj du kartoj kaj la kvin komunaj kartoj gajnas la poton."] },
        { id: "blinds",
          t: "Blindoj kaj la butono de la disdonanto",
          b: [
            "Antaŭ ĉiu mano, du devigaj vetoj komencas la poton: la malgranda blindo kaj la granda blindo, metataj de la du ludantoj maldekstre de la butono de la disdonanto. La butono moviĝas unu sidlokon laŭ la horloĝa direkto post ĉiu mano, do ĉiuj pagas la blindojn laŭvice. La blindoj regule altiĝas dum la ludo progresas.",
            "Sur la tablo, la butono kaj la blindoj estas markitaj per diskoj: D (disdonanto), SB (malgranda blindo), BB (granda blindo)."] },
        { id: "streets",
          t: "La kvar vetrondoj",
          list: [
            "Pre-flop — post la disdono de la poŝkartoj, la unua rondo komenciĝas maldekstre de la granda blindo.",
            "Flop — tri komunaj kartoj estas malkaŝitaj, sekvataj de vetrondo.",
            "Turn — kvara komuna karto, poste plia vetrondo.",
            "River — la kvina kaj lasta komuna karto, poste la fina vetrondo."],
          b: [
            "Vetrondo finiĝas kiam ĉiu ludanto ankoraŭ en la mano metis la saman sumon en la poton (aŭ estas all-in)."] },
        { id: "actions",
          t: "Kion vi povas fari dum via vico",
          list: [
            "Fold — rezigni la manon. Viaj kartoj estas forĵetitaj kaj vi ne plu konkuras por la poto.",
            "Check — pasi sen veti. Eblas nur kiam estas nenio por voki.",
            "Call — egaligi la nunan veton.",
            "Bet — malfermi la vetadon kiam neniu ankoraŭ vetis en ĉi tiu strato.",
            "Raise — pliigi ekzistantan veton. La minimuma raise egalas la antaŭan veton aŭ raise.",
            "All-In — meti vian tutan stakon. Vi restas en la mano ĝis la sumo, kiun vi kovris."] },
        { id: "showdown",
          t: "Showdown kaj dividitaj potoj",
          b: [
            "Se post la vetrondo de la river restas pli ol unu ludanto, la kartoj estas malkaŝitaj kaj la plej bona mano gajnas — la gajnanta kombinaĵo estas montrata sub la komunaj kartoj. Kiam ludanto estas all-in por malpli ol la plenaj vetoj, kreiĝas flankaj potoj: ĉiu ludanto povas gajni nur la parton de la poto al kiu li kontribuis. Egalaj manoj dividas la poton.",
            "Ne ĉiuj devas montri: komencante de la ludanto kiu faris la lastan veton aŭ raise, mano estas malkaŝita nur se ĝi batas tion, kio jam estas montrita. Ĉiu, kiu rajtas forĵeti siajn kartojn, tenas ilin kaŝitaj kaj ricevas butonon Montri por tamen malkaŝi ilin."] },
        { id: "hands",
          t: "Rangordo de manoj",
          b: [
            "De la plej malforta al la plej forta:"],
          list: [
            "1. Alta karto — neniu kombinaĵo; decidas la plej alta karto.",
            "2. Paro — du kartoj de sama valoro.",
            "3. Du paroj — du malsamaj paroj.",
            "4. Triopo — tri kartoj de sama valoro.",
            "5. Vico — kvin sinsekvaj kartoj (la Aso kalkuliĝas alta aŭ malalta).",
            "6. Samkoloro — kvin kartoj de sama koloro.",
            "7. Plena domo — triopo plus paro.",
            "8. Kvaropo — kvar kartoj de sama valoro.",
            "9. Samkolora vico — vico tute de sama koloro.",
            "10. Reĝa samkolora vico — de Dek ĝis Aso, ĉio de sama koloro. La plej bona ebla mano."] }
      ]
    },
    {
      id: "game", icon: "🎮", title: "La ludekrano",
      sections: [
        { id: "actionbar",
          t: "La agobreto",
          b: [
            "Kiam estas via vico, la agobreto malsupre ekbrilas kun ĝis kvar butonoj: Fold (ruĝa), Check / Call (blua), Bet / Raise (verda — la emfazita ĉefa ago) kaj All-In (malhelruĝa). La butono Check / Call montras la ĝustan sumon por voki; Bet / Raise montras la sumon, kiun vi estas metonta. Post la river, All-In povas iĝi butono Montri por malkaŝi viajn kartojn."] },
        { id: "betctl",
          t: "Elekti vian veton",
          b: [
            "Agordu la sumon de la raise per la nombra kampo, la ŝovilo aŭ la rapidaj butonoj 1/3 · 1/2 · Poto (frakcioj de la nuna poto). Sumoj estas aŭtomate rondigitaj kaj tenataj inter la minimuma kaj maksimuma laŭleĝa raise. Se vi preferas pensi en grandaj blindoj, opcio montras ĉiujn sumojn en BB anstataŭ ĵetonoj."] },
        { id: "preselect",
          t: "Antaŭelekti agon",
          b: [
            "Antaŭ via vico vi povas prepari agon anticipe: tuŝu butonon kaj ĝi ricevas oran randon kun eta ora punkto. Kiam venas via vico, la ago plenumiĝas tuj. Antaŭelektita Fold aŭtomate iĝas Check kiam check estas senpaga — vi neniam senbezone faras fold. Antaŭelektoj estas restarigitaj je ĉiu nova mano, stratŝanĝo kaj showdown, kaj nuligitaj se la situacio ŝanĝiĝas (ekzemple la sumo por call ŝanĝiĝas)."] },
        { id: "automodes",
          t: "Aŭtomataj reĝimoj",
          b: [
            "La falmenuo apud la agobutonoj proponas tri ludreĝimojn: Permane, Aŭtomata Check/Call kaj Aŭtomata Check/Fold. Aŭtomataj reĝimoj ludas anstataŭ vi ĝis vi reŝanĝas — ajna permana klako sur ago tuj revenigas al Permane."] },
        { id: "readtable",
          t: "Legi la tablon",
          b: [
            "La skatolo de ĉiu ludanto montras la avataron, nomon, stakon kaj nunan veton. La disdonanto kaj la blindoj estas markitaj per diskoj D / SB / BB. Kolora insigno sur la skatolo montras la lastan agon de la ludanto; maldika blua breto retronombras lian pensotempon. La skatolo de la ludanto, kies vico estas, brilas; via propra skatolo ricevas pulsantan oran kadron dum via vico.",
            "La statobreto super la tablo montras la tutan poton, la vetojn de la nuna strato, la fazon (Pre-flop, Flop, Turn, River) kaj la numerojn de ludo kaj mano. La kartoj de ludantoj, kiuj faris fold, estas duontravideblaj; eliminitaj ludantoj estas malheligitaj. Je la fino de mano, fenestro de la gajninto povas resumi kiu gajnis kion — ĝi estas malŝaltebla en la opcioj."] },
        { id: "seatlayout",
          t: "Aranĝo de sidlokoj",
          b: [
            "Kiel reta etendaĵo, la aranĝo de la ludantaj skatoloj elekteblas en Altnivelaj opcioj → Sidlokoj: Aŭtomata sekvas la oficialan klienton (fiksaj lokoj en vertikala orientiĝo, kalkulita elipso en horizontala), aŭ trudi Vertikalan aŭ Horizontalan aranĝon — kaj Propra lasas vin meti ĉiun sidlokon mem: redakta reĝimo malfermiĝas, kie vi trenas ĉiun skatolon ĝuste tien, kien vi volas, kaj la aranĝo estas konservata."] },
        { id: "zoom",
          t: "Tabla zomo (telefonoj)",
          b: [
            "Sur malgrandaj ekranoj, la lupeaj butonoj pligrandigas la tablon (2×) kaj vi povas ŝovi ĝin per la fingro — nur la agobreto restas fiksa; via propra skatolo ankaŭ estas pligrandigita, kaj la vido revenas al ĝi kiam estas via vico. La vido aŭtomate sekvas la aktivan sidlokon kaj malzomas por superrigardo ĉe la showdown. Tio estas malŝaltebla en Altnivelaj opcioj. Dum via vico, se la komunaj kartoj estas ekster la vido, eta kopio de ili aperas supre de la tablo; tuŝu ĝin por iri al la kartoj kaj reen."],
          note: "Sur telefonoj kaj tabulkomputiloj, la propra pinĉa zomo de la retumilo estas defaŭlte blokita, por ke zoma gesto ne okazu hazarde meze de mano; reŝaltu ĝin en Altnivelaj opcioj → Uzantinterfaco se vi deziras." },
        { id: "protections",
          t: "Anti-peek kaj protekto kontraŭ hazarda call",
          b: [
            "Du nedevigaj protektoj: Anti-peek tenas viajn proprajn kartojn kaŝitaj ĝis vi tuŝas ilin (utila kiam iu povus vidi vian ekranon), kaj la protekto kontraŭ hazarda call blokas la butonon Call momente tuj post granda raise, por ke tuŝo celita al pli malgranda call ne hazarde trafu la plialtigitan sumon. Ambaŭ estas en Altnivelaj opcioj."] }
      ]
    },
    {
      id: "info", icon: "📊", title: "La informa panelo",
      sections: [
        { id: "open",
          t: "Malfermi la panelon",
          b: [
            "Dum ludo, la informa panelo malfermiĝas el la kaplinio (aŭ Alt+L / Alt+I) kaj havas tri langetojn: Protokolo, Ŝancoj kaj Statistikoj. Sur telefonoj ĝi flosas super la tablo; sur pli grandaj ekranoj ĝi estas trenebla kaj grandecŝanĝebla fenestro — prenu la tenilon ⣿ por movi ĝin, la randojn por ŝanĝi la grandon. Ĝia pozicio estas memorata."] },
        { id: "log",
          t: "La ludprotokolo",
          b: [
            "La langeto Protokolo registras la tutan ludon manon post mano: blindojn, ĉiun agon kun ĝia sumo, malkaŝitajn kartojn kaj gajnintojn, kolore kodita por rapida legado. Eksporta butono konservas la protokolon kiel dosieron, se vi volas revizii la seancon poste."] },
        { id: "odds",
          t: "Ŝancoj (probabla monitoro)",
          b: [
            "La langeto Ŝancoj montras, por via nuna mano, la vivan probablon fini kun ĉiu el la 10 kategorioj de manoj — de Alta karto ĝis Reĝa samkolora vico — ĉiu kun sia piktogramo, procento kaj breto. La montrado griziĝas kiam vi faris fold. Ĝi uzas nur viajn proprajn kartojn kaj la komunajn kartojn: ĝi vidas nenion, kion viaj kontraŭuloj ne montris."] },
        { id: "journal",
          t: "Manprotokoloj kaj la fenestro Protokoloj",
          b: [
            "Krom la viva protokolo, ĉiu mano, kiun vi ludas, estas registrata loke en via retumilo, en la sama formato kiel la .pdb-protokolaj dosieroj de la oficiala kliento. La fenestro Protokoloj (Altnivelaj opcioj → Protokolaj mesaĝoj → Administri protokolojn…) listigas viajn seancojn kaj lasas vin labori kun ili: antaŭrigardi seancon kun serĉo kaj emfazo, filtri laŭ ludo, eksporti kiel HTML aŭ plata teksto, konservi la krudan .pdb-dosieron, aŭ importi .pdb registritan de la labortabla kliento. Seancoj forigeblas unuope aŭ ĉiuj samtempe (kun konfirmo), kaj aŭtomata konserva agordo povas teni nur la lastajn 7, 30, 90, 180 aŭ 365 tagojn. Protokoloj, kiujn vi mem importis, neniam estas aŭtomate forigitaj. Dua agordo limigas la nombron de konservataj seancoj, kaj la kolumno de la listo larĝigeblas per trenado.",
            "Por forigi plurajn seancojn samtempe, la butono Elekti… transformas la liston en markobutonojn: marku tiujn, kiujn vi volas forigi, kaj Forigi forprenas la tutan aron post unu konfirmo. Ĉe komputilo vi ankaŭ povas fari Ctrl (⌘) + klakon por aldoni seancojn unuope, aŭ Shift + klakon por preni tutan intervalon.",
            "La butono Analizi faras manan analizon de seanco kaj povas sendi protokolon al la analiza servo de pokerth.net. Ĉio restas en via aparato krom se vi eksplicite eksportas aŭ alŝutas."] },
        { id: "logopts",
          t: "Protokolaj opcioj",
          b: [
            "En Altnivelaj opcioj → Protokolaj mesaĝoj vi povas ŝalti aŭ malŝalti protokoladon kaj elekti la skriban intervalon, kun la samaj tri agordoj kiel la labortabla kliento: post ĉiu ago, post ĉiu mano (defaŭlte) aŭ post ĉiu ludo. Alia opcio skribas la .pdb-dosieron en dosierujon de via elekto kaj ĝisdatigas ĝin je tiu intervalo, kaj ankoraŭfoje kiam vi forlasas la paĝon, por ke alia ilo povu sekvi la ludon vive."],
          note: "Skribado en lokan dosierujon postulas la File System Access API: nur labortablaj Chrome, Edge kaj Opera. Aliloke la opcio klarigas kial, kaj permana eksporto el la fenestro Protokoloj restas disponebla. La retumilo povas nur anstataŭigi la dosieron, neniam aldoni al ĝi, do ilo leganta la .pdb devas remalfermi ĝin post ĉiu ŝanĝo." },
        { id: "assist",
          t: "Asistanto (forto de la mano)",
          b: [
            "Supre de la langeto Ŝancoj, la asistanta rubando legas vian manon por vi. Antaŭ la flop ĝi nomas vian komencan manon kaj taksas ĝin per steloj; ekde la flop ĝi montras vian nunan plej bonan kombinaĵon kaj, post mallonga simulado, vian taksitan ŝancon gajni la manon en procentoj, kun kolora mezurilo de ruĝa (malforta) ĝis verda (forta). Kiel la probabla monitoro, ĝi uzas nur informojn, kiujn vi povas vidi.",
            "Du montrostiloj disponeblas en Altnivelaj opcioj → Sidlokoj: Segmentoj (dek blokoj) aŭ klasika progresbreto. La tuta asistanta funkcio estas malŝaltebla en Altnivelaj opcioj → Asistanto."] },
        { id: "assistwin",
          t: "La asistanto kiel flosanta fenestraĵo",
          b: [
            "La asistanta bloko povas esti malkroĉita de la panelo en sian propran etan fenestron, ĉiam supre: uzu la malkroĉan butonon sur la bloko, poste movu kaj grandecŝanĝu ĝin ie ajn super la tablo — oportune por sekvi la forton de via mano sen malfermi la tutan panelon. La alkroĉa butono redonas ĝin al la langeto Ŝancoj, kaj ĝia pozicio estas memorata. Ene de la panelo, trena tenilo inter la Asistanto kaj la probabloj lasas vin dividi la spacon inter ambaŭ."] },
        { id: "stats",
          t: "Statistikoj",
          b: [
            "La langeto Statistikoj spuras vian seancon: luditajn manojn, viditajn flopojn, showdown-ojn, venkoprocentojn kaj pli. La spurado de statistikoj estas malŝaltebla en Altnivelaj opcioj."] },
        { id: "hud",
          t: "Statistika HUD ĉe la sidlokoj",
          b: [
            "La HUD alkroĉas etan statistikan skatolon apud la sidloko de ĉiu ludanto, konstruitan el la manoj registritaj en viaj protokoloj: la nombro de observitaj manoj, poste VPIP (kiom ofte li libervole metas monon antaŭ la flop), PFR (raise-oj antaŭ la flop) kaj AF (agresema faktoro), kolore koditaj de pasiva al agresema. Sub ili, insigno resumas la ludanton per simplaj vortoj — Streta-pasiva, Malstreta-agresema ktp. — apud eta ciferplato, kies lumigita kvarono legiĝas de maldekstre dekstren de streta al malstreta, kaj de malsupre supren de pasiva al agresema. La insigno montriĝas ekde la unua mano sed restas malheligita ĝis 25 manoj, poste ĝi iĝas fidinda. Tuŝu la skatolon por detala fenestro kun la plena aro da ciferoj (3-bet, continuation bet, fold al 3-bet, ŝtelprovoj, procentoj de showdown…), kaj trenu la skatolon se ĝi kovras ion.",
            "La HUD scias nur tion, kion vi vidis ĉe viaj propraj tabloj — ĝi legas viajn lokajn manprotokolojn, do protokolado devas esti ŝaltita, kaj la ciferoj iĝas signifaj post sufiĉe da manoj. Malŝaltita defaŭlte: ŝaltu ĝin en Altnivelaj opcioj → Asistanto."] },
        { id: "handsbtn",
          t: "Superrigardo de la manoj",
          b: [
            "La piktogramo de pokeraj manoj sur la tablotuko malfermas rapidan superrigardon de la 10 manoj iam ajn — oportune dum lernado. Ĝi estas kaŝebla en Altnivelaj opcioj."] }
      ]
    },
    {
      id: "chat", icon: "💬", title: "Babilado kaj socio",
      sections: [
        { id: "panels",
          t: "Hala babilejo kaj ludbabilejo",
          b: [
            "Estas babilejo en la halo kaj alia ĉe la tablo. Sur telefonoj la ludbabilejo flosas super la tablo; sur pli grandaj ekranoj ĝi estas trenebla kaj grandecŝanĝebla fenestro. Insigno sur la babila butono nombras nelegitajn mesaĝojn."] },
        { id: "typing",
          t: "Tajpaj helpiloj",
          list: [
            "Tab kompletigas kaŝnomon — premu Tab denove por trairi la kongruojn.",
            "↑ / ↓ foliumas vian propran mesaĝhistorion.",
            "La emoĝia butono malfermas plenan elektilon; tajpi : ankaŭ proponas emociulojn dum vi tajpas."] },
        { id: "emotes",
          t: "Emociuloj kaj ridetoj",
          b: [
            "La babilejo konvertas mallongajn emociulajn kodojn ĝuste kiel la oficiala labortabla kliento: tajpu nomon inter du dupunktoj kaj ĝi iĝas emoĝio — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… pli ol 1 900 kodoj estas subtenataj (la plena aro de GitHub). Klasikaj tekstaj ridetoj ankaŭ estas konvertataj: :-) ;) :D xD :P <3 kaj ĉirkaŭ okdek aliaj.",
            "Tajpi : malfermas proponan fenestron, kiu kompletigas la kodon dum vi tajpas (↑/↓ por elekti, Tab aŭ Enter por akcepti). La konvertado de emoĝioj estas tute malŝaltebla en Altnivelaj opcioj → Babilado."] },
        { id: "commands",
          t: "Babilaj komandoj",
          b: [
            "La babilejo komprenas oblikvajn komandojn. Du estas videblaj por aliaj:"],
          keys: [
            ["/me <text>", "Aga mesaĝo, montrata kiel “* vianomo teksto”   ⟦/me <teksto>⟧"],
            ["/emoji <emoji>", "Ludas emoĝian reagon (tion, kion sendas la reagelektilo)   ⟦/emoji <emoji>⟧"]] },
        { id: "diagcmds",
          t: "Diagnozaj komandoj",
          b: [
            "Ĉio alia estas loka: la respondoj estas montrataj nur al vi kaj nenio estas sendata al la tablo. Tajpu /help por listigi ilin ĉiujn. La plej utilaj:"],
          keys: [
            ["/help", "Listigi ĉiujn komandojn   ⟦/help⟧"],
            ["/update", "Kontroli ĉu estas nova versio kaj refreŝigi   ⟦/update⟧"],
            ["/lang <code>", "Ŝanĝi la lingvon (ekz. /lang fr)   ⟦/lang <code>⟧"],
            ["/sound on|off", "Ŝalti/malŝalti ludsonojn   ⟦/sound on|off⟧"],
            ["/zoom", "Ŝalti/malŝalti la tablan lupeon   ⟦/zoom⟧"],
            ["/clear", "Vakigi la babilejon loke   ⟦/clear⟧"],
            ["/table", "Informoj pri la nuna ludo (blindoj, ludantoj, stakoj)   ⟦/table⟧"],
            ["/diag · /netdbg · /fps", "Diagnozo de klienta stato, reto kaj kadrofrekvenco   ⟦/diag · /netdbg · /fps⟧"],
            ["/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg", "Altnivela sencimigo (kartoj, protokolo, sono, memoro, sidlokoj)   ⟦/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg⟧"],
            ["/copy", "Kopii la respondon de la lasta komando al la tondujo   ⟦/copy⟧"]] },
        { id: "privatemsg",
          t: "Privataj mesaĝoj",
          b: [
            "Skribu al unu ludanto sen ke la tuta halo legu. La koverto apud nomo en la ludantlisto malfermas konversacion kun tiu persono; la koverto en la kaplinio de la halo remalfermas la lastan. Konversacioj estas konservataj en ĉi tiu aparato kaj ankoraŭ estas tie kiam vi revenas, do konversacio daŭrigita tagojn poste portas sian historion — la ruĝa nombro sur la koverto montras kion vi ankoraŭ ne legis, kaj la rubujo en la titolo de la fenestro definitive forigas konversacion."],
          keys: [
            ["/msg <nickname> <text>", "Sendi privatan mesaĝon el la hala babilejo   ⟦/msg <kaŝnomo> <teksto>⟧"],
            ["/msg \"<nickname with spaces>\" <text>", "Same, kiam la kaŝnomo enhavas spacetojn   ⟦/msg \"<kaŝnomo kun spacetoj>\" <teksto>⟧"]],
          note: "Mesaĝoj estas limigitaj al 128 signoj. La servilo ne liveras privatan mesaĝon al ludanto sidanta ĉe tablo kun okazanta ludo, kaj la historio estas konservata nur en ĉi tiu retumilo — ĝi ne sekvas vin al alia aparato." },
        { id: "reactions",
          t: "Emoĝiaj reagoj",
          b: [
            "La reaga butono malfermas elektilon de 30 animaciaj reagoj (🎉, 😂, 😱, 🔥…), kiuj ludiĝas kun efekto super via sidloko, videblaj por ĉiuj ĉe la tablo — inkluzive de ludantoj en la labortabla kliento. Reagoj estas tute malŝalteblaj en Altnivelaj opcioj."] },
        { id: "translate",
          t: "Kompreni ĉiujn",
          b: [
            "Kiam la babila tradukado estas ŝaltita, traduka butono aperas sur la linio sub via montrilo — aŭ, sur tuŝekrano, sur la linio kiun vi tuŝis — kaj montras tiun mesaĝon en via lingvo per la enkonstruita tradukilo de la retumilo. Ĝi povas esti montrata konstante sur ĉiu linio en Altnivelaj opcioj → Babilado, kie ankaŭ troviĝas ŝpruchelpilo klariganta oftajn tablajn mallongigojn (gg, nh, utg…)."],
          note: "La tradukado uzas la servon Google Translate kaj funkcias en ĉiu retumilo — necesas nur interreta konekto. Mesaĝo estas sendata al la traduka servo nur kiam vi tuŝas ĝian tradukan butonon, neniam aŭtomate." },
        { id: "social",
          t: "Ludantoj: profilo, invito, ignoro",
          b: [
            "Tuŝu ajnan ludanton — ĉe la tablo aŭ en la hala listo — por malfermi lian karton: profilo kaj statistikoj, inviti al via ludo, aŭ ignori (liaj babilaj mesaĝoj estas kaŝitaj; ignoro estas malfarebla iam ajn). Konfirmo antaŭ invito/ignoro ŝalteblas en la opcioj."] }
      ]
    },
    {
      id: "lobby", icon: "🏛️", title: "Halo kaj ludoj",
      sections: [
        { id: "list",
          t: "La ludlisto",
          b: [
            "La halo listigas ĉiujn tablojn ĉe la servilo. Ĉiu ero montras la nombron de ludantoj, la ludtipon, seruron kiam pasvorto aŭ invito necesas, kaj statusan insignon: “Atendante” (verda — la ludo ne komenciĝis, vi povas aliĝi se sidloko estas libera), “Okazanta” (varma koloro — spektebla vive kiam spektantoj estas permesitaj) kaj “Fermita” (malheligita). Plena tablo simple montras la plenan nombron, ekz. 10/10; la koloroj de la insignoj sekvas la aktivan etoson.",
            "La filtra falmenuo mallarĝigas la liston ĝuste kiel la labortabla kliento, ĉiu elekto pli strikta ol la antaŭa: nur malfermitaj ludoj → kaŝi ankaŭ plenajn tablojn → poste nur neprivataj, nur privataj aŭ nur rangigaj ludoj. Via elekto estas memorata. La serĉkampo trovas ludon laŭ nomo, kaj la ludanta insigno malfermas serĉeblan kaj ordigeblan liston de ĉiuj enretaj."] },
        { id: "join",
          t: "Aliĝi kaj spekti",
          b: [
            "Elektu malfermitan ludon kaj aliĝu — seruro signifas, ke pasvorto necesas. Okazantaj ludoj, kiuj permesas spektantojn, estas spekteblaj vive: vi vidas la tablon kaj la babilejon, sed la poŝkartoj restas kaŝitaj kaj vi ne povas agi."] },
        { id: "gameinfo",
          t: "Informoj pri la ludo",
          b: [
            "Antaŭ aliĝo, la informkarto de la ludo montras ĉion, kio difinas la tablon: la ludtipon, la blindojn kaj kiel ili altiĝas (duobligo aŭ permana listo), la komencan monon, la tempolimon por ago, la paŭzon inter manoj kaj kiu jam sidas."] },
        { id: "create",
          t: "Krei ludon",
          b: [
            "Kreu vian propran tablon: nomo, nombro de ludantoj, komenca mono, unua malgranda blindo kaj plialtiga plano, tempolimo por ago kaj ĉu spektantoj estas permesitaj. Estas kvar ludtipoj: Normala (iu ajn), nur registritaj ludantoj, nur per invito kaj Ranking (kalkuliĝas en la oficiala rangigo — pasvorto tie ne estas permesita). Viaj preferataj agordoj estas konserveblaj kaj reŝargeblaj."] },
        { id: "invites",
          t: "Invitoj",
          b: [
            "Ludantoj povas inviti vin al sia tablo; vi ricevas sciigon, kiun vi povas akcepti aŭ rifuzi. Esti invitita estas la sola maniero eniri ludon nur per invito."] }
      ]
    },
    {
      id: "pthnet", icon: "🌐", title: "pokerth.net",
      sections: [
        { id: "account",
          t: "Via konto",
          b: [
            "La oficiala interreta servilo estas pokerth.net. Ludi tie postulas senpagan konton ĉe pokerth.net — registriĝu en la retejo, poste ensalutu ĉi tie per la sama kaŝnomo kaj pasvorto. Ĉi tiu retkliento konektiĝas al la sama servilo kiel la labortabla kliento: samaj kontoj, samaj tabloj, sama rangigo, kaj vi povas sidi ĉe la sama tablo kun labortablaj ludantoj."] },
        { id: "ranked",
          t: "Rangigaj ludoj kaj sezonoj",
          b: [
            "Ludoj de la tipo Ranking kalkuliĝas en la oficiala sezona rangigo. Via profilo en la aplikaĵo montras kiam vi aliĝis, vian Lokon, Poentaron, mezumon kaj luditajn ludojn en la nuna sezono, plus viajn lastajn rezultojn. Normalaj (nerangigaj) ludoj estas nur por amuzo kaj ŝanĝas nenion."] },
        { id: "rankhow",
          t: "Kiel la rangigo estas kalkulata",
          b: [
            "En ĉiu rangiga ludo, la loko en kiu vi finas donas poentojn: 15 por la unua, poste 9, 6, 4, 3, 2 kaj 1 ĝis la sepa; de la oka ĝis la deka ricevas nenion. Tiel unu tablo disdonas entute 40 poentojn.",
            "Via Poentaro ne estas la sumo de tiuj poentoj, sed via mezumo por ludo, moderigita per faktoro kiu kreskas kun la nombro de luditaj ludoj: kelkaj bonaj rezultoj ne sufiĉas por stariĝi supre, necesas ankaŭ reguleco — ju pli vi ludas, des pli via Poentaro alproksimiĝas al via vera mezumo. Sezonoj daŭras trimonaton: ĉe la ŝanĝo ĉio estas arkivita kaj la nombriloj rekomencas de nulo, dum pasintaj sezonoj restas alireblaj. En la ludo, la podia butono montras la sezonan rangigon de la ludantoj ĉe via tablo."],
          note: "La poentoskalo kaj la preciza formulo estas difinitaj de la rangiga servilo de pokerth.net kaj povas ŝanĝiĝi; la paĝoj de la retejo estas la referenco." },
        { id: "rankings",
          t: "Rangigaj paĝoj",
          b: [
            "La rangiga ero malfermas la oficialan rangigon de PokerTH, serĉeblan laŭ ludanto, kune kun la komunumaj rangigoj (BBC, WEC). Se rangigoj ne interesas vin, la ero estas kaŝebla en Altnivelaj opcioj → Komunumo."] },
        { id: "cups",
          t: "Komunumaj pokaloj: BBC kaj WeCup",
          b: [
            "Du komunumoj organizas siajn proprajn konkursojn ĉe pokerth.net, ĉiu kun sia retejo kaj rangigo. Best Brainies Cup (BBC) estas ŝtupa turniro naskita en 2013: vi progresas de Step 1 ĝis Step 4, kaj nova sezono komenciĝas post ĉiu Step 4-ludo, kiam la pokalo estas transdonita. WeCup (WEC) havas sian propran, multe pli disvastigitan skalon — 75 poentoj por la unua loko, poste 45, 30, 20… — kaj ĝia poentaro normaligas vian mezumon laŭ la nombro de ludoj, kiujn vi ludis kompare kun aliaj membroj.",
            "Ambaŭ rangigoj malfermiĝas el la trofea butono, apud la rangigo de PokerTH. La tablaj agordoj de ĉi tiuj konkursoj venas kiel ŝablonoj dum kreado de ludo (BBC Step 1 ĝis 4, WEC, WEC Monthly Final kaj WEC Grand Final), por ke vi povu trejni en la samaj kondiĉoj. Por partopreni, necesas registriĝi en la retejo de la koncerna pokalo."],
          note: "Ĉi tiu enhavo estas kaŝebla per unu klako en Altnivelaj opcioj → Komunumo, se la pokaloj ne interesas vin." },
        { id: "forumcups",
          t: "Forumaj pokaloj kaj eventoj",
          b: [
            "La forumo de pokerth.net ankaŭ gastigas la Monthly Cup — monatan serion, en kiu ludantoj estas disdividitaj inter tabloj Gold, Silver kaj Bronze antaŭ ol la ĉampiono de la monato estas decidita — plus unufojajn specialajn pokalojn dum la jaro.",
            "Aliĝoj, horaroj, tablaj agordoj kaj rezultoj estas publikigataj en la forumo, kaj la ludoj okazas ĉe la oficiala servilo kiel ĉiuj aliaj. Konto ĉe pokerth.net sufiĉas por sekvi la rezultojn; partopreno en pokalo okazas tra la koncerna forumfadeno."] },
        { id: "forumnews",
          t: "Forumaj novaĵoj en la halo",
          b: [
            "La gazeta butono en la kaplinio de la halo malfermas la lastajn afiŝojn de la forumo de pokerth.net, unu ero por ĉiu temo, ĉiu forumo en sia propra koloro. Insigno sur la butono nombras nelegitajn afiŝojn; malfermi afiŝon (en nova langeto) markas ĝin legita, kaj “Marki ĉion legita” vakigas ĉion samtempe.",
            "Tio estas reta aldonaĵo: la butono estas kaŝebla en Altnivelaj opcioj (“Forumbutono en la kaplinio de la halo”).",
            "La langeto “Eventoj” montras la venontajn BBC-ludojn kaj la sekvan Monthly Cup kun la nombro de aliĝintaj ludantoj, kaj ankaŭ la lastajn gajnintojn de BBC, WEC kaj Monthly Cup. La horoj estas en via loka horo, kaj tuŝo malfermas la retejon de la komunumo. La opcio “Montri komunuman enhavon (BBC / WEC)” kaŝas ĉi tiun langeton."] },
        { id: "avatars",
          t: "Avataroj kaj flagoj",
          b: [
            "Ĉe pokerth.net via avataro estas disdonata al aliaj ludantoj tra la avatara servilo, kaj eta landa flago povas esti montrata sur la ludantaj skatoloj. Ambaŭ estas nedevigaj kaj agordeblaj en la opcioj."] }
      ]
    },
    {
      id: "offline", icon: "🏋️", title: "Trejna reĝimo",
      sections: [
        { id: "what",
          t: "Kio ĝi estas",
          b: [
            "La reĝimo Loka / trejnado estas plena ludo kontraŭ komputilaj kontraŭuloj: sen konekto, sen konto, nenio en risko. Post instalo de la aplikaĵo (aŭ eĉ post unu vizito), ĝi funkcias tute senkonekte — perfekta por lerni la ludon, testi la interfacon aŭ pasigi tempon en aviadila reĝimo."] },
        { id: "setup",
          t: "Prepari ludon",
          b: [
            "Elektu la nombron de kontraŭuloj, la komencan monon, la blindojn kaj plialtigan planon, kaj la rapidon de la ludo. La kunmeto kaj malfacileco de la robotoj estas alĝustigeblaj en Altnivelaj opcioj → Loka ludo — de mildaj kontraŭuloj ĝis pli malmola, miksita tablo."] },
        { id: "trophies",
          t: "Trofeoj",
          b: [
            "La trejna reĝimo havas sian propran progreson: 28 trofeoj en ses kategorioj (progreso, lerteco, stilo, formatoj, amuzo kaj unu sekreta) malŝlosiĝas dum vi ludas — luditaj manoj, gajnitaj ludoj, grandaj blufoj, specialaj manoj kaj pli. Via trofea progreso akumuliĝas kaj kunfandiĝas inter aparatoj kiam la sinkronigo de kontaj agordoj estas aktiva."] },
        { id: "learn",
          t: "Bona loko por lerni",
          b: [
            "Ĉio el la aliaj ĉapitroj funkcias ankaŭ ĉi tie: la probabla monitoro, la asistanta montrado, antaŭelekto, fulmoklavoj. La trejna reĝimo estas la plej bona loko por provi ilin sen premo antaŭ ol iri al pokerth.net."] }
      ]
    },
    {
      id: "style", icon: "🎨", title: "Stilo kaj sono",
      sections: [
        { id: "themes",
          t: "Etosoj",
          b: [
            "La kategorio Stilo en la Altnivelaj opcioj ŝanĝas la aspekton de la tuta kliento. Ŝablonoj agordas ĉion per unu tuŝo (klasika verda kazino, oficiala aspekto de PokerTH…); sub ili apartaj aksoj lasas vin fajnagordi la kolorpaletron, la tablotukon kaj la kartvizaĝojn aparte — ŝanĝu ajnan akson kaj via miksaĵo iĝas propra etoso. Malhela, hela aŭ aŭtomata reĝimo estas elektata en Uzantinterfaco, kaj viaj elektoj validas tuj, sur ĉiu ekrano, kaj estas memorataj."] },
        { id: "tablelook",
          t: "Tabloj, kartaroj, sidlokoj",
          b: [
            "Krom la etoso, pluraj elementoj estas ŝanĝeblaj sendepende: la tablofono, la kartaro, la kartdorso (aŭtomate kongrui kun la kartaro aŭ importi vian propran bildon), la diskoj de disdonanto kaj blindoj, la stilo de la agobutonoj kaj plenaj sidlokaj pakoj, kiuj ŝanĝas la aspekton de la ludantaj skatoloj. Elektu ĉion en Altnivelaj opcioj → Stilo; ŝanĝoj estas tuj videblaj ĉe la tablo."] },
        { id: "music",
          t: "Muzikludilo",
          b: [
            "La muzika ero en la kaplinaj menuoj malfermas etan ludilon de salonmuziko: elektu trakon el la ludlisto, ludu/paŭzu, antaŭa/sekva, miksu, kaj ripetu unu trakon, la tutan ludliston aŭ nenion. Laŭteco, elektita trako kaj ripeta reĝimo estas memorataj. La ludado neniam komenciĝas memstare — retumiloj postulas tuŝon — kaj la ludilo estas tute sendependa de la sonefektoj de la ludo.",
            "La du dikfingroj sub la nomo de la trako diras ĉu vi ŝatas tion, kio ludas. Unu anonima voĉdono por aparato, radioj inkluzivitaj, kaj vi povas ŝanĝi aŭ retiri ĝin iam ajn; krom se la operaciisto malkaŝas la sumojn, vi vidas nur vian propran dikfingron.",
            "Ĉe iPhone kaj iPad la ludilo defaŭlte uzas simplan ludadon, por ke muziko daŭru kun CarPlay, Bluetooth aŭ ŝlosita ekrano; la laŭteco tiam estas alĝustigata per la butonoj de la aparato aŭ de la aŭto. La opcio “Laŭteco en la aplikaĵo” redonas la laŭtecan ŝovilon, la ekvilibron kaj la VU-mezurilon, sed en aŭto la sono povas ŝanceliĝi."] },
        { id: "sounds",
          t: "Sonefektoj",
          b: [
            "Ludsonoj estas grupigitaj en kvar kategorioj, kiuj estas ŝalteblaj/malŝalteblaj aparte, ĝuste kiel en la labortabla kliento: ludagoj (disdonitaj kartoj, Check, Call, Raise, via vico…), sciigo de la hala babilejo, sciigoj de reta ludo (ludanto aliĝis, ludo preta) kaj sciigo pri plialtigo de blindoj. Unu laŭteca ŝovilo regas ĉiujn, en Altnivelaj opcioj → Sono."],
          note: "Ĉiuj retumiloj — precipe iOS — rifuzas ludi sonon ĝis vi unufoje tuŝis la paĝon. Se la ludo komenciĝas silente, unu tuŝo ie ajn vekas la sonon; la kliento ankaŭ aŭtomate restarigas la sonmotoron kiam iOS paŭzigas ĝin (envenanta voko, iro en la fonon…)." },
        { id: "voice",
          t: "Voĉaj anoncoj kaj vibrado",
          b: [
            "Du pliaj kanaloj povas informi vin sen rigardi la ekranon: voĉaj anoncoj legas la ludokazaĵojn per la parolsintezo de via aparato, kaj sur telefonoj mallonga vibrado povas signali vian vicon. Ambaŭ estas retaj etendaĵoj, defaŭlte ŝaltitaj aŭ malŝaltitaj laŭ la aparato, en Altnivelaj opcioj → Vetoj kaj vico."],
          note: "Vibrado funkcias ĉe Android (Chromium-retumiloj); Apple ne provizas vibradan API al retejoj, do iPhone-oj ne povas vibri. Voĉaj anoncoj funkcias ĉie, sed la disponeblaj voĉoj kaj lingvoj dependas de via sistemo — la kliento uzas la plej bonan kongruon, kiun ĝi trovas." }
      ]
    },
    {
      id: "options", icon: "⚙️", title: "Opcioj kaj fulmoklavoj",
      sections: [
        { id: "where",
          t: "Kie troviĝas la opcioj",
          b: [
            "La Altnivelaj opcioj malfermiĝas el la dentrada ero en ajna kaplinia menuo. Ili estas grupigitaj kiel en la labortabla kliento: Uzantinterfaco, Stilo, Sono, Loka ludo, Reta ludo, Interreta ludo, Kaŝnomoj / Avataroj, Protokolaj mesaĝoj kaj Savkopio kaj restarigo. Ĉiu reta funkcio havas tie sian propran ŝaltilon, do vi povas malŝalti ĉion, kion vi ne uzas."] },
        { id: "cfgxml",
          t: "Interŝanĝi agordojn kun la labortabla kliento",
          b: [
            "Viaj agordoj povas moviĝi inter klientoj: la kategorio Savkopio kaj restarigo proponas eksporton/importon de la oficiala dosiero config.xml (~/.pokerth/config.xml, uzata de la labortablaj kaj QML-klientoj). Eksporto skribas la komunajn agordojn — nomon, montrajn opciojn, sonojn, tablajn preferojn, blindojn, stilojn — kaj importo aplikas la labortablan dosieron ĉi tie. Agordoj nekonataj de ĉi tiu kliento restas netuŝitaj en la dosiero.",
            "Viaj notoj pri ludantoj ankaŭ vojaĝas kun la dosiero — la teksto kaj la stela taksado, skribitaj tiel, kiel la labortablaj klientoj legas ilin. La koloraj etikedoj restas en ĉi tiu kliento: la oficiala formato ne havas kampon por ili, do importo neniam tuŝas la viajn."] },
        { id: "sync",
          t: "Agordoj, kiuj sekvas vin",
          b: [
            "Kiam vi ludas kun konto, viaj opcioj, etoso, klavasignoj, lingvo kaj trejnaj trofeoj estas sinkronigataj: ŝanĝu ion en unu aparato kaj la sekva aparato, en kiu vi ensalutas, prenos ĝin. Trofea progreso estas kunfandata, neniam anstataŭigata, do ludi en du aparatoj ĉiam konservas la plej bonan el ambaŭ."] },
        { id: "updates",
          t: "Resti ĝisdata",
          b: [
            "La kliento ĝisdatigas sin mem: kiam nova versio estas deplojita, rubando invitas vin refreŝigi (aŭ tajpu /update en la babilejo por kontroli permane). Foje eta produkta enketo povas aperi por demandi vian opinion pri funkcio — partopreno estas nedeviga, kaj enketoj estas tute malŝalteblaj en Altnivelaj opcioj → Komunumo."] },
        { id: "fkeys",
          t: "Oficialaj fulmoklavoj",
          b: [
            "La oficialaj funkciklavoj de PokerTH funkcias dum ludo — Alt+S funkcias ĉie:"],
          keys: [
            ["F1 / F2 / F3 / F4", "Fold · Check/Call · Bet/Raise · All-In (la ordo estas inversigebla en la opcioj)   ⟦F1 / F2 / F3 / F4⟧"],
            ["F5", "Montri viajn kartojn (kiam eblas)   ⟦F5⟧"],
            ["F6 / F7 / F8", "Permane · Aŭtomata Check/Fold · Aŭtomata Check/Call   ⟦F6 / F7 / F8⟧"],
            ["Alt+M / Alt+K / Alt+F", "Permane · Aŭtomata Check/Call · Aŭtomata Check/Fold   ⟦Alt+M / Alt+K / Alt+F⟧"],
            ["Alt+C / Alt+L / Alt+I", "Babilado · Ludprotokolo · Probabla panelo   ⟦Alt+C / Alt+L / Alt+I⟧"],
            ["Alt+S", "Agordoj — ie ajn en la aplikaĵo, ne nur dum ludo   ⟦Alt+S⟧"],
            ["F11", "Plenekrane   ⟦F11⟧"]],
          note: "Fulmoklavoj postulas fizikan klavaron. Ĉe Mac la F-klavoj defaŭlte estas aŭdvidaj regiloj: tenu Fn (aŭ ŝaltu “Uzi F1, F2 ktp. kiel normajn funkciklavojn” en la agordoj de macOS). Ĉe iPhone la plenekrano estas limigita de iOS — instali la aplikaĵon kiel PWA donas la saman plenekranan sperton." },
        { id: "webkeys",
          t: "Retaj literklavoj",
          b: [
            "Kiel reta etendaĵo, unuliteraj klavoj kaj Alt+T ankaŭ ekigas agojn, kaj ĉiu el ili estas reasignebla en Altnivelaj opcioj → Fulmoklavoj:"],
          keys: [
            ["F", "Fold   ⟦F⟧"],
            ["C", "Check / Call   ⟦C⟧"],
            ["R", "Raise   ⟦R⟧"],
            ["A", "All-In   ⟦A⟧"],
            ["1 / 2 / 3", "Veto 1/3 · 1/2 · Poto   ⟦1 / 2 / 3⟧"],
            ["Alt+T", "Statistika panelo   ⟦Alt+T⟧"],
            ["Esc", "Fermi la plej supran fenestron (ankaŭ la butono Reen de Android)   ⟦Esc⟧"],
            ["↑ ↓ · ↵", "Tabla listo de la halo (atingu per Tab): elekti tablon · aliĝi   ⟦↑ ↓ · ↵⟧"]],
          note: "Ĉe Android, la sistema butono/gesto Reen fermas fenestrojn kiel Escape anstataŭ forlasi la ludon (agordebla en la opcioj). iOS ne havas ekvivalentan sisteman butonon — uzu la ✕ de ĉiu fenestro." }
      ]
    }
  ]
};
