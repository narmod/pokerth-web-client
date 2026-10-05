// ── help/content/eu.mjs — Basque (Euskara) help corpus ────────────────────
//
// Same structure as en.mjs (reference): chapters[] → { id, icon, title,
// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand
// names of the rules chapter stay in English, as in the other help corpora.
export const help = {
  chapters: [
    {
      id: "start", icon: "🚀", title: "Hasteko",
      sections: [
        { id: "modes",
          t: "Jokatzeko hiru modu",
          b: [
            "Saio-hasierako pantailan, aukeratu nola jokatu nahi duzun."],
          list: [
            "Internet — jokatu linean pokerth.net zerbitzari ofizialean, sailkapenekin. pokerth.net kontu bat behar da; erregistratu doan pokerth.net-en.",
            "Lokala / entrenamendua — jokatu lineaz kanpo boten aurka. Ez da ezer konfiguratu behar, konexiorik gabe dabil eta garaikurrak desblokeatzen ditu aurrera egin ahala.",
            "LAN / Zerbitzari dedikatua — konektatu zure tokiko sareko edo zure ordenagailuko PokerTH zerbitzari pribatu batera."] },
        { id: "acehelp", t: "Batekoaren laguntza",
          b: ["Batekoaren laguntzak Batekoa, web-bezeroaren maskota, gidari bihurtzen du: onartzen duzunean, Bateko txiki bat behean eskuinean esertzen da eta zauden lekuan garrantzitsua dena azaltzen du — benetako aplikazioan, benetako mahaietan. Lehen abiaraztean behin eskaintzen da. Saio-hasierako pantailako eta goiburuko menuetako «Batekoaren laguntza» botoiak bere menua irekitzen du edonoiz, aholkuak desaktibatuta egonda ere: «Laguntza gehiago» (laguntza osoa, bilaketarekin), «Zer da hau?» eta «Aktibatu aholkuak» edo «Desaktibatu» (baita Aukera aurreratuak → Laguntzailea atalean ere).",
              "pokerth.net-eko atondoan, hasteko gertuen dagoen sailkapeneko partida seinalatzen du eta bertan sartzea proposatzen dizu — edo bat sortzea, bat ere irekita ez dagoenean (kontua duen edozein jokalarik egin dezake; gonbidatuek partida arruntak jokatzen dituzte). Jokalarien zain dagoen sailkapeneko mahai batean, sailkapena azaltzen du mahaia betetzen den bitartean, eta gero zure postua eta zure puntuak esaten dizkizu. Aholku bakoitza behin erakusten da: «Geroago» botoiak Batekoaren gaineko ikur batean biltzen du, eta hura sakatzean berriro erakusten da. Ez du inoiz hitz egiten esku batean zehar bere kabuz — baina mahaian galdetu diezaiokezu oraindik. Saka ezazu bere menua irekitzeko: «Laguntza gehiago» (laguntza osoa, bilaketarekin), «Zer da hau?» — gero saka ezazu pantailako edozer eta berak azalduko dizu zer egiten duen; bere hizketa-globoen izkinako «?» horiak gauza bera egiten du —, «Pantailaren aholkua», «Desaktibatu» edo «Erakutsi aholku guztiak berriro»."],
          note: "Noizean behin, inork pantaila ukitzen ez duenean saio-hasierako pantailan edo atondoan, Batekoak eszena labur barregarri bat jokatzen du. Batekoaren laguntza aktibatuta dagoenean, bere lekutik abiatu eta hara itzultzen da, eta inoiz ez aholku bat zain dagoenean. Efektu murriztuekin edo mugimendu murriztuarekin ez dago eszenarik, eta burbuila soil batek ordezten du Batekoa. Dagoeneko ikusi duzuna zure pokerth.net kontuarekin batera doa. (⚙ Aukera aurreratuak → Laguntzailea → Batekoaren bihurrikeriak: eszenak, dantzak eta erreakzioak)" },
        { id: "lan",
          t: "LAN / zerbitzari dedikatua",
          b: [
            "Hirugarren moduak zuk edo lagun batek martxan duen edozein PokerTH zerbitzarira konektatzen du — etxeko sarean, VPS pribatu batean, edonon. Idatzi zerbitzariaren helbidea eta ataka, markatu TLS zerbitzariak ataka enkriptatua erabiltzen badu, eta hasi saioa ezizen batekin (gonbidatu-sarbideak funtzionatzen du zerbitzariak baimentzen badu). Hortik aurrera, mahaian dena zerbitzari ofizialean bezala dabil."] },
        { id: "famboard",
          t: "Familiako sailkapen-taula",
          b: [
            "Zerbitzari pribatuetan eta LAN partidetan soilik, bezeroak ezizen bakoitzeko estatistika orokorrak gordetzen ditu — jokatutako eta irabazitako eskuak eta partidak, irabazirik handiena, boladarik onena — eta zerbitzariaren bidez partekatzen ditu, mahaiaren inguruko gailu guztiek sailkapen-taula bera ikus dezaten. pokerth.net-eko partidei ez zaie inoiz horrela jarraitzen, eta entrenamendu-moduko estatistikak guztiz bereiz gordetzen dira.",
            "Partida horietan, garaikur-botoiak sailkapen-leihoa irekitzen du bere LAN fitxan: jokalari guztiak, hainbat irizpideren arabera ordenagarriak."] },
        { id: "language",
          t: "Hizkuntza",
          b: [
            "Interfazea 83 hizkuntzatan dago eskuragarri. Alda ezazu noiznahi Aukera aurreratuetan (engranaje-menua), Erabiltzaile-interfazea atalean. Pokerreko jokaldien terminoak (Fold, Check, Call, Bet, Raise, All-In) ingelesez geratzen dira ohituraz, mahaigaineko bezeroan bezala."] },
        { id: "pwa",
          t: "Instalatu aplikazio gisa",
          b: [
            "Bezero hau Progressive Web App bat da: nabigatzailearen menutik (edo goiburuko instalatzeko botoitik) instala dezakezu eta pantaila osoko aplikazio bat izango duzu bere ikonoarekin. Instalatu ondoren, berehala abiarazten da eta entrenamendu-modua erabat lineaz kanpo dabil."],
          list: ["Android (Chrome, Edge, Samsung Internet, Firefox): sakatu goiburuko instalatzeko botoia, edo ireki nabigatzailearen menua (⋮ edo ≡) eta aukeratu «Instalatu aplikazioa» edo «Gehitu hasierako pantailan», gero berretsi.",
            "iPhone / iPad: sakatu Partekatu botoia (gezi bat gora duen koadroa; iOS berrietan ⋯ menuan egon daiteke), aukeratu «Gehitu hasierako pantailan» eta gero «Gehitu». Safarik egiten du; iOS bertsio berriek Chrome eta Edge-tik ere onartzen dute.",
            "Ordenagailua: Chrome edo Edge-n, egin klik goiburuko instalatzeko botoian edo helbide-barraren eskuinaldeko instalatzeko ikonoan (edo ⋮ / ⋯ menua → «Instalatu»); Mac-eko Safarin: Fitxategia → «Gehitu Dock-era»."],
          note: "Batekoaren laguntzak zure gailuaren urratsak erakusten ditu: sakatu Batekoa → «Instalatu aplikazioa». Instalatzeko botoia eta menuko sarrera hori desagertu egiten dira instalatutako aplikazioa erabiltzen duzunean; ordutik aurrera, ireki ikonotik." },
        { id: "platforms",
          t: "Plataformak eta nabigatzaileak",
          b: [
            "Bezeroak edozein nabigatzaile modernotan dabil edozein sistematan — Windows, macOS, Linux, Android, iOS. Funtzio batzuk nabigatzaileen API berriagoetan oinarritzen dira; APIa falta denean, funtzioa ezkutatu egiten da edo arrazoia azaltzen du, hautsi beharrean. Jakin beharreko desberdintasun nagusiak:"],
          list: [
            "Chrome / Edge (mahaigainekoa): dena dabil, .pdb egunkaria karpeta batean idaztea barne.",
            "Firefox: dena, .pdb egunkaria karpeta batean idaztea izan ezik (APIa ez dago oraindik).",
            "Safari / iOS: instalazioa Partekatu → Gehitu hasierako pantailan bidez; bibraziorik ez; pantaila osoa mugatua iPhone-n; soinua zure lehen ukituaren ondoren hasten da.",
            "Android: euskarri osoa Chromium nabigatzaileetan, bibrazioa eta Atzera botoiaren portaera barne."] },
        { id: "avatar",
          t: "Ezizena eta abatarra",
          b: [
            "Aukeratu zure ezizena eta abatarra saio-hasierako pantailan konektatu aurretik. pokerth.net-en, zure ezizena zure kontuaren izena da; abatarrak beste jokalariekin partekatzen dira abatar-zerbitzariaren bidez.",
            "Zure abatarra konektatzean bidaltzen da, eta jokalari guztiek bera ikusten dute. Konektatuta zaudela aldatzen baduzu, abatar berria hurrengo konexiotik aurrera aplikatzen da. Iniziala (Aa) ez da bidaltzen: beste jokalariek abatar lehenetsia ikusten dute."] }
      ]
    },
    {
      id: "rules", icon: "🃏", title: "Pokerraren arauak",
      sections: [
        { id: "basics",
          t: "Texas Hold’em laburrean",
          b: [
            "PokerTH-n No-Limit Texas Hold’em jokatzen da. Jokalari bakoitzak bi karta pribatu jasotzen ditu (poltsikoko kartak). Ondoren, bost karta komun jartzen dira ahoz gora mahaiaren erdian. Zure bi kartekin eta bost karta komunekin osa daitekeen bost kartako eskurik onenak irabazten du potea."] },
        { id: "blinds",
          t: "Blindak eta banatzailearen botoia",
          b: [
            "Esku bakoitzaren aurretik, derrigorrezko bi apustuk hasten dute potea: blind txikia eta blind handia, banatzailearen botoiaren ezkerreko bi jokalariek jartzen dituztenak. Botoia eserleku bat mugitzen da erlojuaren noranzkoan esku bakoitzaren ondoren, beraz denek ordaintzen dituzte blindak txandaka. Partidak aurrera egin ahala, blindak aldizka igotzen dira.",
            "Mahaian, botoia eta blindak fitxekin markatzen dira: D (banatzailea), SB (blind txikia), BB (blind handia)."] },
        { id: "streets",
          t: "Lau apustu-txandak",
          list: [
            "Preflop — poltsikoko kartak banatu ondoren, lehen txanda blind handiaren ezkerretik hasten da.",
            "Flop — hiru karta komun agertzen dira, eta apustu-txanda bat dator ondoren.",
            "Turn — laugarren karta komuna, eta beste apustu-txanda bat.",
            "River — bosgarren eta azken karta komuna, eta azken apustu-txanda."],
          b: [
            "Apustu-txanda amaitzen da eskuan geratzen den jokalari bakoitzak kopuru bera jarri duenean potean (edo all-in dagoenean)."] },
        { id: "actions",
          t: "Zer egin dezakezun zure txandan",
          list: [
            "Fold — utzi eskua. Zure kartak botatzen dira eta ez zara gehiago lehiatzen potearen alde.",
            "Check — pasatu apusturik egin gabe. Deitzeko ezer ez dagoenean soilik.",
            "Call — berdindu uneko apustua.",
            "Bet — ireki apustuak, kale honetan inork apusturik egin ez badu.",
            "Raise — handitu dagoen apustua. Gutxieneko raise-a aurreko apustuaren edo raise-aren berdina da.",
            "All-In — jarri zure txipa guztiak. Estali duzun kopuruaren neurrian geratzen zara eskuan."] },
        { id: "showdown",
          t: "Showdown eta pote banatuak",
          b: [
            "River-eko apustu-txandaren ondoren jokalari bat baino gehiago geratzen bada, kartak agerian jartzen dira eta esku onenak irabazten du — esku irabazlea karta komunen azpian erakusten da. Jokalari bat apustu osoak baino gutxiagorekin all-in dagoenean, alboko poteak sortzen dira: jokalari bakoitzak ekarpena egin duen pote-zatia soilik irabaz dezake. Esku berdinek potea banatzen dute.",
            "Denek ez dute kartak erakutsi behar: azken apustua edo raise-a egin zuen jokalaritik hasita, esku bat erakusten da jada agerian dagoena gainditzen badu soilik. Kartak botatzeko eskubidea duenak ezkutuan gordetzen ditu eta Erakutsi botoi bat jasotzen du hala ere agerian jartzeko."] },
        { id: "hands",
          t: "Eskuen hurrenkera",
          b: [
            "Ahulenetik indartsuenera:"],
          list: [
            "1. Karta altua — konbinaziorik ez; kartarik altuenak erabakitzen du.",
            "2. Bikotea — balio bereko bi karta.",
            "3. Bi bikote — bi bikote desberdin.",
            "4. Hirukoa — balio bereko hiru karta.",
            "5. Eskailera — bost karta jarraian (batekoa altu edo baxu kontatzen da).",
            "6. Kolorea — kolore bereko bost karta.",
            "7. Full — hirukoa gehi bikotea.",
            "8. Pokerra — balio bereko lau karta.",
            "9. Kolore-eskailera — eskailera bat, kolore berekoa osorik.",
            "10. Eskailera erreala — hamarretik batekora, kolore berekoa osorik. Ahalik eta eskurik onena."] }
      ]
    },
    {
      id: "game", icon: "🎮", title: "Joko-pantaila",
      sections: [
        { id: "actionbar",
          t: "Ekintza-barra",
          b: [
            "Zure txanda denean, beheko ekintza-barra pizten da lau botoi arterekin: Fold (gorria), Check / Call (urdina), Bet / Raise (berdea — nabarmendutako ekintza nagusia) eta All-In (gorri iluna). Check / Call botoiak deitzeko kopuru zehatza erakusten du; Bet / Raise-k jartzear zauden kopurua. River-aren ondoren, All-In Erakutsi botoi bihur daiteke zure kartak agerian jartzeko."] },
        { id: "betctl",
          t: "Zure apustua aukeratzea",
          b: [
            "Ezarri raise-aren kopurua zenbaki-eremuarekin, graduatzailearekin edo 1/3 · 1/2 · Potea botoi azkarrekin (uneko potearen zatiak). Kopuruak automatikoki biribiltzen dira eta gutxieneko eta gehienezko raise legalen artean mantentzen dira. Blind handitan pentsatzea nahiago baduzu, aukera batek kopuru guztiak BBtan erakusten ditu txipen ordez."] },
        { id: "preselect",
          t: "Jokaldia aurrez hautatzea",
          b: [
            "Zure txanda iritsi aurretik jokaldia prest utz dezakezu: ukitu botoi bat eta urrezko ertza hartuko du urrezko puntu txiki batekin. Zure txanda iristean, jokaldia berehala exekutatzen da. Aurrez hautatutako Fold bat automatikoki Check bihurtzen da check-a doakoa denean — ez duzu inoiz alferrik botatzen. Aurrez hautatutakoak esku berri bakoitzean, kalez aldatzean eta showdown-ean berrezartzen dira, eta egoera aldatzen bada (adibidez, call-aren kopurua aldatzen bada) bertan behera geratzen dira."] },
        { id: "automodes",
          t: "Modu automatikoak",
          b: [
            "Ekintza-botoien ondoko goitibeherak hiru joko-modu eskaintzen ditu: Eskuzkoa, Auto Check/Call eta Auto Check/Fold. Modu automatikoek zure ordez jokatzen dute atzera aldatu arte — ekintza bateko edozein eskuzko klikek Eskuzkora itzultzen zaitu berehala."] },
        { id: "readtable",
          t: "Mahaia irakurtzea",
          b: [
            "Jokalari bakoitzaren koadroak abatarra, izena, txipak eta uneko apustua erakusten ditu. Banatzailea eta blindak D / SB / BB fitxekin markatzen dira. Koadroko bereizgarri koloretsuak jokalariaren azken ekintza erakusten du; barra urdin fin batek bere pentsatzeko denbora deskontatzen du. Txanda duen jokalariaren koadroak distira egiten du; zure koadroak taupaka dabilen urrezko markoa hartzen du zure txandan.",
            "Mahaiaren gaineko egoera-barrak pote osoa, uneko kaleko apustuak, fasea (Preflop, Flop, Turn, River) eta partidaren eta eskuaren zenbakiak erakusten ditu. Fold egin duten jokalarien kartak erdi gardenak dira; kanporatutako jokalariak ilunduta daude. Eskuaren amaieran, irabazlearen leiho batek nork zer irabazi duen laburbil dezake — aukeretan desgai daiteke."] },
        { id: "seatlayout",
          t: "Eserlekuen antolaketa",
          b: [
            "Web hedapen gisa, jokalarien koadroen antolaketa Aukera aurreratuak → Eserlekuak atalean aukera daiteke: Automatikoak bezero ofizialari jarraitzen dio (leku finkoak bertikalean, elipse kalkulatua horizontalean), edo behartu antolaketa Bertikala edo Horizontala — eta Pertsonalizatuak eserleku bakoitza zuk zeuk kokatzen uzten dizu: edizio-modu bat irekitzen da, non koadro bakoitza nahi duzun tokira arrastatzen duzun, eta antolaketa gordetzen da."] },
        { id: "zoom",
          t: "Mahaiaren zooma (telefonoak)",
          b: [
            "Pantaila txikietan, lupa-botoiek mahaia handitzen dute (2×) eta hatzarekin mugi dezakezu — ekintza-barra bakarrik geratzen da finko; zure koadroa ere handitzen da, eta ikuspegia hara itzultzen da zure txanda denean. Ikuspegiak automatikoki jarraitzen dio eserleku aktiboari eta showdown-ean urruntzen da ikuspegi orokorra emateko. Aukera aurreratuetan desgai daiteke. Zure txandan, karta komunak ikuspegitik kanpo badaude, haien kopia txiki bat agertzen da mahaiaren goialdean; ukitu kartetara joan eta itzultzeko."],
          note: "Telefonoetan eta tabletetan, nabigatzailearen atximurka-zooma lehenespenez blokeatuta dago, zoom-keinua eskuaren erdian nahi gabe abiaraz ez dadin; nahi izanez gero, gaitu berriro Aukera aurreratuak → Erabiltzaile-interfazea atalean." },
        { id: "protections",
          t: "Anti-peek eta nahi gabeko call-aren aurkako babesa",
          b: [
            "Aukerako bi babes: Anti-peek-ek zure kartak ezkutuan mantentzen ditu ukitu arte (baliagarria norbaitek zure pantaila ikus dezakeenean), eta nahi gabeko call-aren babesak Call botoia blokeatzen du une batez raise handi baten ondoren, call txikiago baterako ukitu bat nahi gabe kopuru igoaren gainera eror ez dadin. Biak Aukera aurreratuetan daude."] }
      ]
    },
    {
      id: "info", icon: "📊", title: "Informazio-panela",
      sections: [
        { id: "open",
          t: "Panela irekitzea",
          b: [
            "Partidan zehar, informazio-panela goiburutik irekitzen da (edo Alt+L / Alt+I) eta hiru fitxa ditu: Egunkaria, Aukerak eta Estatistikak. Telefonoetan mahaiaren gainean flotatzen du; pantaila handiagoetan arrastatu eta tamainaz alda daitekeen leiho bat da — heldu ⣿ heldulekutik mugitzeko, ertzetatik tamaina aldatzeko. Bere posizioa gogoratzen da."] },
        { id: "log",
          t: "Partidaren egunkaria",
          b: [
            "Egunkaria fitxak partida osoa grabatzen du eskuz esku: blindak, jokaldi bakoitza bere kopuruekin, agertutako kartak eta irabazleak, koloreekin kodetuta irakurketa azkarrerako. Esportatzeko botoiak egunkaria fitxategi gisa gordetzen du saioa geroago berrikusi nahi baduzu."] },
        { id: "odds",
          t: "Aukerak (probabilitateen monitorea)",
          b: [
            "Aukerak fitxak zure uneko eskuarentzat 10 esku-kategorietako bakoitzean amaitzeko zuzeneko probabilitatea erakusten du — Karta altutik Eskailera errealera — bakoitza bere ikonoarekin, ehunekoarekin eta barrarekin. Bistaratzea grisa bihurtzen da fold egindakoan. Zure kartak eta karta komunak soilik erabiltzen ditu: ez du ikusten aurkariek erakusten ez duten ezer."] },
        { id: "journal",
          t: "Eskuen egunkariak eta Egunkariak leihoa",
          b: [
            "Zuzeneko egunkariaz gain, jokatzen duzun esku bakoitza zure nabigatzailean grabatzen da lokalki, bezero ofizialaren .pdb egunkari-fitxategien formatu berean. Egunkariak leihoak (Aukera aurreratuak → Egunkariko mezuak → Kudeatu egunkariak…) zure saioak zerrendatzen ditu eta haiekin lan egiten uzten dizu: saio baten aurrebista bilaketarekin eta nabarmentzearekin, partidaren arabera iragazi, HTML edo testu arrunt gisa esportatu, .pdb fitxategi gordina gorde, edo mahaigaineko bezeroak grabatutako .pdb bat inportatu. Saioak banan-banan edo guztiak batera ezaba daitezke (berrespenarekin), eta gordetze automatikoko ezarpen batek azken 7, 30, 90, 180 edo 365 egunak soilik gorde ditzake. Zuk zeuk inportatutako egunkariak ez dira inoiz automatikoki ezabatzen. Bigarren ezarpen batek gordetako saioen kopurua mugatzen du, eta zerrendaren zutabea arrastatuz zabal daiteke.",
            "Hainbat saio batera ezabatzeko, Hautatu… botoiak zerrenda kontrol-lauki bihurtzen du: markatu kendu nahi dituzunak eta Ezabatu-k multzo osoa kentzen du berrespen bakar baten ondoren. Ordenagailuan Ctrl (⌘) + klik ere egin dezakezu saioak banan-banan gehitzeko, edo Shift + klik tarte oso bat hartzeko.",
            "Aztertu botoiak saio bateko eskuen analisia egiten du eta egunkaria pokerth.net-en analisi-zerbitzura bidal dezake. Dena zure gailuan geratzen da esplizituki esportatu edo igotzen ez baduzu."] },
        { id: "logopts",
          t: "Egunkariaren aukerak",
          b: [
            "Aukera aurreratuak → Egunkariko mezuak atalean egunkaria gaitu edo desgai dezakezu eta idazteko tartea aukeratu, mahaigaineko bezeroaren hiru ezarpen berekin: jokaldi bakoitzaren ondoren, esku bakoitzaren ondoren (lehenetsia) edo partida bakoitzaren ondoren. Beste aukera batek .pdb fitxategia aukeratzen duzun karpeta batean idazten du eta tarte horretan eguneratzen du, eta beste behin orritik irtetean, beste tresna batek partidari zuzenean jarraitu ahal izan diezaion."],
          note: "Tokiko karpeta batean idazteko File System Access APIa behar da: mahaigaineko Chrome, Edge eta Opera soilik. Beste leku batzuetan aukerak arrazoia azaltzen du, eta Egunkariak leihotik eskuzko esportazioa erabilgarri geratzen da. Nabigatzaileak fitxategia ordeztu besterik ezin du egin, inoiz ez gehitu, beraz .pdb irakurtzen duen tresnak berriro ireki behar du aldaketa bakoitzaren ondoren." },
        { id: "assist",
          t: "Laguntzailea (eskuaren indarra)",
          b: [
            "Aukerak fitxaren goialdean, laguntzailearen bandak zure eskua irakurtzen du zure ordez. Flop-aren aurretik, zure hasierako eskua izendatzen du eta izarrekin baloratzen; flop-etik aurrera, zure uneko konbinaziorik onena eta, simulazio labur baten ondoren, eskua irabazteko aukera estimatua erakusten ditu ehunekotan, gorritik (ahula) berdera (indartsua) doan kolore-neurgailu batekin. Probabilitateen monitorea bezala, zuk ikus dezakezun informazioa soilik erabiltzen du.",
            "Aukera aurreratuak → Eserlekuak atalean bi bistaratze-estilo daude: Segmentuak (hamar bloke) edo aurrerapen-barra klasikoa. Laguntzailearen funtzio osoa Aukera aurreratuak → Laguntzailea atalean desgai daiteke."] },
        { id: "assistwin",
          t: "Laguntzailea widget flotatzaile gisa",
          b: [
            "Laguntzailearen blokea paneletik askatu eta bere leiho txikira atera daiteke, beti gainean dagoena: erabili blokeko askatzeko botoia, eta gero mugitu eta aldatu tamaina mahaiaren gainean edonon — erabilgarria eskuaren indarrari jarraitzeko panel osoa ireki gabe. Ainguratzeko botoiak Aukerak fitxara itzultzen du, eta bere posizioa gogoratzen da. Panelaren barruan, Laguntzailearen eta probabilitateen arteko arrastatze-heldulekuak lekua bien artean banatzen uzten dizu."] },
        { id: "stats",
          t: "Estatistikak",
          b: [
            "Estatistikak fitxak zure saioari jarraitzen dio: jokatutako eskuak, ikusitako flop-ak, showdown-ak, garaipen-tasak eta gehiago. Estatistiken jarraipena Aukera aurreratuetan desgai daiteke."] },
        { id: "hud",
          t: "Estatistiken HUDa eserlekuetan",
          b: [
            "HUDak estatistika-koadro txiki bat jartzen du jokalari bakoitzaren eserlekuaren ondoan, zure egunkarietan grabatutako eskuetatik eraikia: behatutako eskuen kopurua, gero VPIP (zenbatetan jartzen duen dirua borondatez preflop-ean), PFR (preflop-eko raise-ak) eta AF (oldarkortasun-faktorea), pasibotik oldarkorrera koloreekin kodetuta. Horien azpian, bereizgarri batek jokalaria hitz errazetan laburbiltzen du — Estua-pasiboa, Zabala-oldarkorra eta abar — koadrante txiki baten ondoan, zeinaren laurden argiztatua ezkerretik eskuinera estutik zabalera irakurtzen den, eta behetik gora pasibotik oldarkorrera. Bereizgarria lehen eskutik bertatik erakusten da, baina ilun geratzen da 25 esku arte, eta orduan fidagarri bihurtzen da. Ukitu koadroa zenbaki guztiak dituen leiho zehatza ikusteko (3-bet, continuation bet, fold 3-bet-aren aurrean, lapurreta-saiakerak, showdown-tasak…), eta arrastatu koadroa zerbait estaltzen badu.",
            "HUDak zure mahaietan ikusi duzuna soilik daki — zure tokiko eskuen egunkariak irakurtzen ditu, beraz egunkariak gaituta egon behar du eta zenbakiek esku nahikoren ondoren hartzen dute zentzua. Lehenespenez desgaituta: gaitu Aukera aurreratuak → Laguntzailea atalean."] },
        { id: "handsbtn",
          t: "Eskuen laburpena",
          b: [
            "Mahai-oihaleko pokerreko eskuen ikonoak 10 eskuen laburpen azkar bat irekitzen du noiznahi — erabilgarria ikasten ari zarenean. Aukera aurreratuetan ezkuta daiteke."] }
      ]
    },
    {
      id: "chat", icon: "💬", title: "Txata eta gizartea",
      sections: [
        { id: "panels",
          t: "Egongelako txata eta partidako txata",
          b: [
            "Txat bat dago egongelan eta beste bat mahaian. Telefonoetan, partidako txatak mahaiaren gainean flotatzen du; pantaila handiagoetan arrastatu eta tamainaz alda daitekeen leiho bat da. Txat-botoiko bereizgarriak irakurri gabeko mezuak zenbatzen ditu."] },
        { id: "typing",
          t: "Idazteko laguntzak",
          list: [
            "Tab-ek ezizena osatzen du — sakatu Tab berriro bat-etortzeen artean ibiltzeko.",
            "↑ / ↓ zure mezuen historian zehar mugitzen dira.",
            "Emoji-botoiak hautatzaile osoa irekitzen du; : idazteak ere emotikonoak proposatzen ditu idatzi ahala."] },
        { id: "emotes",
          t: "Emotikonoak eta aurpegierak",
          b: [
            "Txatak emotikonoen kode laburrak bihurtzen ditu mahaigaineko bezero ofizialak bezala: idatzi izen bat bi puntuen artean eta emoji bihurtzen da — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… 1.900 kode baino gehiago onartzen dira (GitHub-eko multzo osoa). Testuzko aurpegiera klasikoak ere bihurtzen dira: :-) ;) :D xD :P <3 eta beste laurogei bat.",
            ": idazteak iradokizun-leiho bat irekitzen du kodea idatzi ahala osatzen duena (↑/↓ aukeratzeko, Tab edo Enter onartzeko). Emojien bihurketa erabat desgai daiteke Aukera aurreratuak → Txata atalean."] },
        { id: "commands",
          t: "Txateko komandoak",
          b: [
            "Txatak barra-komandoak ulertzen ditu. Bi beste batzuentzat ikusgai daude:"],
          keys: [
            ["/me <text>", "Ekintza-mezua, «* zureizena testua» gisa erakutsia   ⟦/me <testua>⟧"],
            ["/emoji <emoji>", "Emoji-erreakzio bat erreproduzitzen du (erreakzio-hautatzaileak bidaltzen duena)   ⟦/emoji <emoji>⟧"]] },
        { id: "diagcmds",
          t: "Diagnostiko-komandoak",
          b: [
            "Gainerako guztia lokala da: erantzunak zuri bakarrik erakusten zaizkizu eta ez da ezer bidaltzen mahaira. Idatzi /help guztiak zerrendatzeko. Erabilgarrienak:"],
          keys: [
            ["/help", "Zerrendatu komando guztiak   ⟦/help⟧"],
            ["/update", "Egiaztatu bertsio berririk dagoen eta freskatu   ⟦/update⟧"],
            ["/lang <code>", "Aldatu hizkuntza (adib. /lang fr)   ⟦/lang <code>⟧"],
            ["/sound on|off", "Aktibatu/desaktibatu jokoaren soinuak   ⟦/sound on|off⟧"],
            ["/zoom", "Aktibatu/desaktibatu mahaiaren lupa   ⟦/zoom⟧"],
            ["/clear", "Garbitu txata lokalki   ⟦/clear⟧"],
            ["/table", "Uneko partidaren informazioa (blindak, jokalariak, txipak)   ⟦/table⟧"],
            ["/diag · /netdbg · /fps", "Bezeroaren egoeraren, sarearen eta fotograma-tasaren diagnostikoa   ⟦/diag · /netdbg · /fps⟧"],
            ["/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg", "Arazketa aurreratua (kartak, protokoloa, audioa, biltegia, eserlekuak)   ⟦/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg⟧"],
            ["/copy", "Kopiatu azken komandoaren erantzuna arbelera   ⟦/copy⟧"]] },
        { id: "privatemsg",
          t: "Mezu pribatuak",
          b: [
            "Idatzi jokalari bati egongela osoak irakurri gabe. Jokalarien zerrendan izenaren ondoko gutun-azalak elkarrizketa bat irekitzen du harekin; egongelaren goiburuko gutun-azalak azkena berriro irekitzen du. Elkarrizketak gailu honetan gordetzen dira eta bertan jarraitzen dute itzultzen zarenean, beraz egun batzuk geroago jarraitutako elkarrizketak bere historia darama — gutun-azaleko zenbaki gorriak oraindik irakurri ez duzuna erakusten du, eta leihoaren izenburuko zakarrontziak elkarrizketa betiko ezabatzen du."],
          keys: [
            ["/msg <nickname> <text>", "Bidali mezu pribatu bat egongelako txatetik   ⟦/msg <ezizena> <testua>⟧"],
            ["/msg \"<nickname with spaces>\" <text>", "Berdin, ezizenak zuriuneak dituenean   ⟦/msg \"<ezizena zuriuneekin>\" <testua>⟧"]],
          note: "Mezuak 128 karakterera mugatuta daude. Zerbitzariak ez dio mezu pribatua entregatzen martxan dagoen mahai batean eserita dagoen jokalari bati, eta historia nabigatzaile honetan soilik gordetzen da — ez zaitu beste gailu batera jarraitzen." },
        { id: "reactions",
          t: "Emoji-erreakzioak",
          b: [
            "Erreakzio-botoiak 30 erreakzio animaturen hautatzailea irekitzen du (🎉, 😂, 😱, 🔥…), zure eserlekuaren gainean efektu batekin erreproduzitzen direnak, mahaiko guztiek ikusteko — mahaigaineko bezeroko jokalariek barne. Erreakzioak erabat desgai daitezke Aukera aurreratuetan."] },
        { id: "translate",
          t: "Denak ulertzea",
          b: [
            "Txataren itzulpena gaituta dagoenean, itzulpen-botoi bat agertzen da zure erakuslearen azpiko lerroan — edo, ukipen-pantailan, ukitu duzun lerroan — eta mezu hori zure hizkuntzan erakusten du nabigatzailearen itzultzaile integratuarekin. Lerro bakoitzean beti erakuts daiteke Aukera aurreratuak → Txata atalean, non mahaiko laburdura ohikoak (gg, nh, utg…) azaltzen dituen argibidea ere badagoen."],
          note: "Itzulpenak Google Translate zerbitzua erabiltzen du eta nabigatzaile guztietan dabil — Interneteko konexioa besterik ez da behar. Mezu bat itzulpen-zerbitzura bidaltzen da haren itzulpen-botoia sakatzen duzunean soilik, inoiz ez automatikoki." },
        { id: "social",
          t: "Jokalariak: profila, gonbidapena, ezikustea",
          b: [
            "Ukitu edozein jokalari — mahaian edo egongelako zerrendan — bere txartela irekitzeko: profila eta estatistikak, gonbidatu zure partidara, edo ezikusi (bere txateko mezuak ezkutatzen dira; ezikustea noiznahi desegin daiteke). Gonbidatu/ezikusi aurretik berrespena gaitu daiteke aukeretan."] }
      ]
    },
    {
      id: "lobby", icon: "🏛️", title: "Egongela eta partidak",
      sections: [
        { id: "list",
          t: "Partiden zerrenda",
          b: [
            "Egongelak zerbitzariko mahai guztiak zerrendatzen ditu. Sarrera bakoitzak jokalari kopurua, partida mota, giltzarrapoa pasahitza edo gonbidapena behar denean, eta egoera-bereizgarri bat erakusten ditu: «Zain» (berdea — partida ez da hasi, sar zaitezke eserleku librerik badago), «Martxan» (kolore beroa — zuzenean ikus daiteke ikusleak baimenduta badaude) eta «Itxita» (iluna). Mahai betea kopuru osoa erakusten du besterik gabe, adib. 10/10; bereizgarrien koloreek gai aktiboari jarraitzen diote.",
            "Iragazki-goitibeherak zerrenda murrizten du mahaigaineko bezeroak bezala, aukera bakoitza aurrekoa baino zorrotzagoa: partida irekiak soilik → ezkutatu mahai beteak ere → gero ez-pribatuak soilik, pribatuak soilik edo sailkapenekoak soilik. Zure aukera gogoratzen da. Bilaketa-eremuak partida bat aurkitzen du izenaren arabera, eta jokalarien bereizgarriak linean dauden guztien zerrenda bilagarri eta ordenagarria irekitzen du."] },
        { id: "join",
          t: "Sartu eta ikusi",
          b: [
            "Aukeratu partida ireki bat eta sartu — giltzarrapoak pasahitza behar dela esan nahi du. Ikusleak baimentzen dituzten partidak zuzenean ikus daitezke: mahaia eta txata ikusten dituzu, baina poltsikoko kartak ezkutuan geratzen dira eta ezin duzu jokatu."] },
        { id: "gameinfo",
          t: "Partidaren informazioa",
          b: [
            "Sartu aurretik, partidaren informazio-txartelak mahaia definitzen duen guztia erakusten du: partida mota, blindak eta nola igotzen diren (bikoiztuz edo eskuzko zerrendaz), hasierako dirua, ekintzaren denbora-muga, eskuen arteko atzerapena eta nor dagoen jada eserita."] },
        { id: "create",
          t: "Partida bat sortzea",
          b: [
            "Sortu zure mahaia: izena, jokalari kopurua, hasierako dirua, lehen blind txikia eta igoeren egutegia, ekintzaren denbora-muga, eta ikusleak baimentzen diren ala ez. Lau partida mota daude: Arrunta (edonork), erregistratutako jokalariak soilik, gonbidapenez soilik eta Ranking (sailkapen ofizialean zenbatzen da — ez da pasahitzik baimentzen). Zure ezarpen gogokoenak gorde eta berriro karga daitezke."] },
        { id: "invites",
          t: "Gonbidapenak",
          b: [
            "Jokalariek beren mahaira gonbida zaitzakete; onartu edo baztertu dezakezun jakinarazpen bat jasotzen duzu. Gonbidatua izatea da gonbidapenez soilik den partida batean sartzeko modu bakarra."] }
      ]
    },
    {
      id: "pthnet", icon: "🌐", title: "pokerth.net",
      sections: [
        { id: "account",
          t: "Zure kontua",
          b: [
            "Interneteko zerbitzari ofiziala pokerth.net da. Bertan jokatzeko pokerth.net kontu doakoa behar da — erregistratu webgunean, eta gero hasi saioa hemen ezizen eta pasahitz berarekin. Web bezero hau mahaigaineko bezeroaren zerbitzari berera konektatzen da: kontu berak, mahai berak, sailkapen berak, eta mahaigaineko jokalariekin mahai berean eser zaitezke."] },
        { id: "ranked",
          t: "Sailkapeneko partidak eta denboraldiak",
          b: [
            "Ranking motako partidak denboraldiko sailkapen ofizialean zenbatzen dira. Aplikazioko zure profilak noiz sartu zinen, uneko denboraldiko zure Postua, Puntuazioa, batez bestekoa eta jokatutako partidak erakusten ditu, gehi zure azken emaitzak. Partida arruntak (sailkapenik gabekoak) dibertsiorako dira eta ez dute ezer aldatzen.",
            "pokerth.net kontua duen edozein jokalarik sor dezake Ranking mahai bat; gonbidatuek ezin dute sailkapeneko partidetan sartu ez halakorik sortu, eta partida arruntak baino ez dituzte jokatzen. Ranking mahai batek 10 jokalarirentzako lekua du, ez du pasahitzik eta automatikoki hasten da bete bezain laster. Ranking txantiloia erabiltzen du, «5/5» formatua: 5 segundo jokatzeko, 5 segundo eskuen artean, 10.000 txip eta 50eko blind txikia, 11 eskutik behin bikoizten dena — azkarra eta berdina guztientzat, partidak laburrak eta denboraldi osoan alderagarriak izan daitezen."] },
        { id: "rankhow",
          t: "Nola kalkulatzen den sailkapena",
          b: [
            "Sailkapeneko partida bakoitzean, lortzen duzun postuak puntuak ematen ditu: 15 lehenarentzat, gero 9, 6, 4, 3, 2 eta 1 zazpigarrenera arte; zortzigarrenetik hamargarrenera ez dute ezer jasotzen. Beraz, mahai batek 40 puntu banatzen ditu guztira.",
            "Zure Puntuazioa ez da puntu horien batura, partida bakoitzeko zure batez bestekoa baizik, jokatutako partiden kopuruarekin hazten den faktore batez leundua: emaitza on batzuk ez dira nahikoak goian finkatzeko, erregulartasuna ere behar da — zenbat eta gehiago jokatu, orduan eta gehiago hurbiltzen da zure Puntuazioa zure benetako batez bestekora. Denboraldiek hiruhileko bat irauten dute: aldaketan, dena artxibatzen da eta kontagailuak zerotik hasten dira, eta iraganeko denboraldiak eskuragarri geratzen dira. Partidan, podium-botoiak zure mahaiko jokalarien denboraldiko sailkapena erakusten du."],
          note: "Puntu-eskala eta formula zehatza pokerth.net-en sailkapen-zerbitzariak ezartzen ditu eta alda daitezke; webguneko orriak dira erreferentzia." },
        { id: "rankings",
          t: "Sailkapen-orriak",
          b: [
            "Sailkapen-aukerak PokerTH sailkapen ofiziala irekitzen du, jokalariaren arabera bilagarria, komunitateko sailkapenekin batera (BBC, WEC). Sailkapenek ez bazaituzte interesatzen, aukera ezkuta daiteke Aukera aurreratuak → Komunitatea atalean."] },
        { id: "cups",
          t: "Komunitateko kopak: BBC eta We Cup",
          b: [
            "Bi komunitatek beren lehiaketak antolatzen dituzte pokerth.net-en, bakoitza bere webgune eta sailkapenarekin. Best Brainies Cup (BBC) 2013an sortutako mailaka egindako txapelketa da: Step 1etik Step 4ra aurrera egiten duzu, eta denboraldi berri bat hasten da Step 4 partida bakoitzaren ondoren, kopa ematen denean. We Cup-ek (WeC) bere eskala propioa du, askoz zabalagoa — 75 puntu lehen postuarentzat, gero 45, 30, 20… — eta bere puntuazioak zure batez bestekoa normalizatzen du jokatu dituzun partiden kopuruaren arabera, beste kideekin alderatuta.",
            "Bi sailkapenak garaikur-botoitik irekitzen dira, PokerTH sailkapenaren ondoan. Lehiaketa hauen mahai-ezarpenak txantiloi gisa datoz partida bat sortzean (BBC Step 1etik 4ra, WEC, WEC Monthly Final eta WEC Grand Final), baldintza berdinetan entrenatu ahal izateko. Kopako administratzaileek bakarrik sortzen dituzte partida ofizialak: jokalariek kopako webgunean edo haren foroko harian ematen dute izena, eta WECen eguneroko partidak, 22:00etan (zerbitzariaren orduan), ez du izen-ematerik behar. Txantiloiak entrenatzeko baino ez dira, eta ez dute benetako kopa-partidarik sortzen."],
          note: "Kopek interesik ez badizute, eduki hau guztia batera ezkuta daiteke Aukera aurreratuak → Komunitatea atalean." },
        { id: "bbc", t: "BBC (Best Brainies Cup)",
          b: ["BBC lau mailako txapelketa da, bere komunitateak antolatua pokerth.net-en 2013tik. Sarrerekin igotzen zara: Step 1 partidan lehen bi jokalariek Step 2 sarrera irabazten dute; Step 2 eta Step 3 partidetan lehen biak maila bat igotzen dira eta hirugarrenak sarrera mantentzen du. Step 4 finala da: kopa ematen da, denboraldia amaitzen da eta berri bat hasten da — orduan sarrerak berrezartzen dira. Denboraldiko irabazlea denboraldiko sailkapenetik koroatzen da.",
              "Partidak egunero jokatzen dira 19:30, 21:30, 23:15 eta 01:00etan, Berlingo orduan (CET/CEST). BBCko administratzaileek bakarrik irekitzen dituzte mahaiak eta gonbidatzen dituzte jokalariak: administratzailerik ez badago, partida ez da jokatzen. Partida batek 10 jokalari behar ditu (Step 4 ere baliozkoa da 9rekin, 10 izena eman bazuten). Step 4 ezartzen da Step 4 sarrera duten 10 jokalari izan bezain laster: gutxienez 10 egun geroagoko lehen ostiralean 19:30ean; 10 baino gutxiagok izena emanda, 8 egun geroagora aldatzen da hurrengo BBC ordura, 10 jokalarik izena eman arte.",
              "Eman izena BBCren webgunean — edo foroko berrien Ekitaldiak fitxako «Eman izena BBCn» botoiarekin — hasi baino 20 minutu lehenagora arte. Lagun batek edo administratzaile batek eman diezazuke izena, baina zu zara jokatzeko edo bertan behera uzteko arduraduna. Step 2, 3 edo 4 partida bat jokatu ezin baduzu, utzi bertan behera (edo galdetu BBCko Shoutbox-ean) hasi baino gutxienez 20 minutu lehenago, bestela normalean sarrera galtzen duzu. PokerTH kontu bat jokalari bakoitzeko; gutxienez 10 PokerTH sailkapen-partida jokatu izana espero da emaitza duinekin — administratzaileek erabakitzen dute.",
              "Denboraldiko sailkapenak puntuak zenbatzen ditu postuaren arabera: Step 1ean 10 puntu lehenarentzat eta 1 hamargarrenarentzat; Step 2k bikoizten ditu (20tik 2ra), Step 3k hirukoizten (30etik 3ra) eta Step 4k laukoizten (40tik 4ra). Zure Puntuazioa partida bakoitzeko dituzun puntuak dira, jokatzen dituzun partiden kopuruarekin hazten den koefiziente batez biderkatuta: 1 partida baten ondoren, 2 bi partidaren ondoren, 3 lau partidaren ondoren, 4 zortzi partidaren ondoren, 5 hamasei partidaren ondoren. Maiz jokatzeak bonus txiki bat ematen du, baina Puntuazio altua lortzeko emaitza onak behar dira oraindik.",
              "Begiratu partidako txata lehen minutuetan: partida berrabiarazi behar bada, jarraitu administratzailearen jarraibideak. Hasi eta berehala konexioa galtzen baduzu, esan BBCko Shoutbox-ean. Mahaiko administratzaileak emaitza jakinarazten du; amaiera baino lehen alde egiten badu, jokalari batek emaitza argitaratu dezake Shoutbox-ean egunkariaren azterketaren estekarekin (bezero honetan: Egunkariak leihoa → «Aztertu pokerth.net-en»)."],
          note: "Izan adeitsua eta errespetuzkoa. Kontu anitzak eta manipulatutako izen-emateak ez dira onartzen; beste jokalari batekin Interneteko konexioa partekatzen baduzu, esan administratzaile bati jokatu aurretik. BBCko webgunea eta bere jokalarien eskuliburua dira erreferentzia: arauak alda daitezke." },
        { id: "wec", t: "We Cup (WeC)",
          b: ["We Cup (WeC, WEC ere idatzia) komunitateko kopa bat da, bere administratzaileek pokerth.net-en antolatua, bere webgune eta sailkapenarekin. WeCko administratzaileek bakarrik sortzen dituzte bere partidak: 22:00etako eguneroko partidak (zerbitzariaren orduan) ez du izen-ematerik behar. Hileko sailkapenak Monthly Final batera darama, eta urtea Grand Final batekin amaitzen da.",
              "Parte hartzeko gutxienez 300 sailkapen-partida behar dituzu, zure profilean agertzen den All-Time sailkapenean 1.etik 4.era arteko postuen % 60 gutxienez, guztiak batuta, eta amaitutako bi denboraldi. Beteranoentzat — 500 partida baino gehiago eta lehenagoko lau denboraldi — neurria azken 300 partidetako 5,75eko batez bestekoa da: uneko denboraldiaren eta aurreko hiruren batez besteko haztatua, non denboraldi bakoitzaren batez bestekoak bertan jokatutako partiden kopuruaren arabera balio duen.",
              "Monthly Finals: 2019tik, 10 jokalariko azken mahai bakarra. Hileko sailkapeneko lehen 10ak sailkatzen dira, hiru ordezkorekin. Mahaia 22:00etarako irekitzen da eta egongelan dauden jokalari sailkatuak gonbidatzen dira; 10ak bertan daudenean, berehala hasten da; bestela, administratzaileek 22:05 arte itxaroten dute, eta gero 11., 12. eta 13.a gonbidatzen dituzte. Ezarpenak: 10.000 txip, 50eko blind txikia, blindak 25 eskutik behin bikoizten dira, 15 s jokatzeko, 7 s-ko atzerapena.",
              "Grand Final: hurrengo urtearen hasieran, Monthly Finalen irabazleen eta Monthly Finalik irabazi ez duten WeCko urteko sailkapeneko lehen 10en artean; jokalari sailkatuei mezu pribatuz jakinarazten zaie abenduko finalaren ondoren. Bi mahaitako finalerdiek erabakitzen dituzte 10 finalistak. Ezarpenak: 10.000 txip, 50eko blind txikia, blindak 35 eskutik behin bikoizten dira, 25 s jokatzeko, 7 s-ko atzerapena. WEC, WEC Monthly Final eta WEC Grand Final txantiloiek ezarpen hauek kopiatzen dituzte entrenatzeko."],
          note: "Kontu bat jokalari bakoitzeko: kontua aldatzeko, eskatu WeCko Administrazioari. Irainak, jazarpena eta tranpak ez dira onartzen, eta WeCko Administrazioak kudeatzen du edozein jokabide desegoki. WeCko webgunea eta bere foroko haria dira erreferentzia: arauak alda daitezke." },
        { id: "forumcups",
          t: "Foroko kopak eta ekitaldiak",
          b: [
            "pokerth.net-eko foroak Monthly Cup ere antolatzen du — hileko serie bat, non jokalariak Gold, Silver eta Bronze mahaietan banatzen diren hilabeteko txapelduna erabaki aurretik — gehi urtean zehar behin bakarrik egiten diren kopa bereziak.",
            "Izen-emateak, egutegiak, mahai-ezarpenak eta emaitzak foroan argitaratzen dira, eta partidak zerbitzari ofizialean jokatzen dira, beste edozein bezala. Emaitzei jarraitzeko pokerth.net kontu bat nahikoa da; kopa batean parte hartzea dagokion foroko harian egiten da. Jokalariek Monthly Cupen zuzenean ere eman dezakete izena haren webgunean, monthlycup.pokerth.net."] },
        { id: "forumnews",
          t: "Foroko berriak egongelan",
          b: [
            "Egongelaren goiburuko egunkari-botoiak pokerth.net foroko azken mezuak irekitzen ditu, sarrera bat gai bakoitzeko, foro bakoitza bere kolorearekin. Botoiko bereizgarriak irakurri gabeko mezuak zenbatzen ditu; mezu bat irekitzeak (fitxa berri batean) irakurritzat markatzen du, eta «Markatu guztiak irakurritzat»-ek dena batera garbitzen du.",
            "Web gehigarri bat da: botoia Aukera aurreratuetan ezkuta daiteke («Foroaren botoia egongelaren goiburuan»).",
            "«Ekitaldiak» fitxak hurrengo BBC partidak, WECen eguneroko partida eta hurrengo Monthly Cup erakusten ditu, izena emandako jokalarien kopuruarekin, baita BBC, WEC eta Monthly Cupeko azken irabazleak ere. Orduak zure tokiko orduan daude; ↗ ikonoak bakarrik irekitzen du komunitatearen webgunea. «Erakutsi komunitateko edukia (BBC / WEC)» aukerak fitxa hau ezkutatzen du.",
            "Hurrengo partidak arratsaldeka taldekatzen dira. Sakatu gertaera bat hautatzeko: beheko botoiak jarraitzen dio (BBCn edo Monthly Cupen izena ematea; WECen eguneroko partidak, zerbitzariaren orduko 22:00etan, ez du behar). Izen-emateak dituen BBC partida bat ere zabaltzen da nork eman duen izena erakusteko, BBCko administratzaileak urrez."] },
        { id: "avatars",
          t: "Abatarrak eta banderak",
          b: [
            "pokerth.net-en zure abatarra beste jokalariei banatzen zaie abatar-zerbitzariaren bidez, eta herrialde-bandera txiki bat erakuts daiteke jokalarien koadroetan. Biak aukerakoak dira eta aukeretan doitzen dira."] }
      ]
    },
    {
      id: "offline", icon: "🏋️", title: "Entrenamendu-modua",
      sections: [
        { id: "what",
          t: "Zer da",
          b: [
            "Modu lokala / entrenamendua ordenagailuko aurkarien aurkako partida osoa da: konexiorik ez, konturik ez, ezer ez jokoan. Aplikazioa instalatuta dagoenean (edo behin bisitatuta besterik ez), erabat lineaz kanpo dabil — ezin hobea jokoa ikasteko, interfazea probatzeko edo hegazkin moduan denbora pasatzeko."] },
        { id: "setup",
          t: "Partida prestatzea",
          b: [
            "Aukeratu aurkari kopurua, hasierako dirua, blindak eta igoeren egutegia, eta partidaren abiadura. Boten osaera eta zailtasuna Aukera aurreratuak → Tokiko partida atalean doitu daitezke — aurkari leunetatik mahai gogorrago eta nahasi bateraino."] },
        { id: "trophies",
          t: "Garaikurrak",
          b: [
            "Entrenamendu-moduak bere aurrerapena du: sei kategoriatako 28 garaikur (aurrerapena, trebetasuna, estiloa, formatuak, dibertsioa eta bat sekretua) desblokeatzen dira jokatu ahala — jokatutako eskuak, irabazitako partidak, farol handiak, esku bereziak eta gehiago. Zure garaikurren aurrerapena metatu egiten da eta gailuen artean batzen da kontuaren ezarpenen sinkronizazioa aktibo dagoenean."] },
        { id: "learn",
          t: "Ikasteko toki ona",
          b: [
            "Beste kapituluetako guztiak hemen ere funtzionatzen du: probabilitateen monitorea, laguntzailearen bistaratzea, aurrez hautatzea, teklatuko lasterbideak. Entrenamendu-modua da presiorik gabe probatzeko tokirik onena pokerth.net-era jauzi egin aurretik."] }
      ]
    },
    {
      id: "style", icon: "🎨", title: "Estiloa eta soinua",
      sections: [
        { id: "themes",
          t: "Gaiak",
          b: [
            "Aukera aurreratuetako Estiloa kategoriak bezero osoaren itxura aldatzen du. Txantiloiek dena ezartzen dute ukitu bakar batean (kasino berde klasikoa, PokerTH itxura ofiziala…); horien azpian, ardatz bereiziek kolore-paleta, mahai-oihala eta karta-aurpegiak bereiz doitzeko aukera ematen dute — aldatu edozein ardatz eta zure nahasketa gai pertsonalizatu bihurtzen da. Modu iluna, argia edo automatikoa Erabiltzaile-interfazean aukeratzen da, eta zure aukerak berehala aplikatzen dira, pantaila guztietan, eta gogoratzen dira."] },
        { id: "tablelook",
          t: "Mahaiak, sortak, eserlekuak",
          b: [
            "Gaiaz gain, hainbat elementu independenteki alda daitezke: mahaiaren atzeko planoa, karta-sorta, kartaren atzealdea (egokitu automatikoki sortari edo inportatu zure irudia), banatzailearen eta blinden fitxak, ekintza-botoien estiloa, eta jokalarien koadroen itxura aldatzen duten eserleku-pakete osoak. Aukeratu dena Aukera aurreratuak → Estiloa atalean; aldaketak berehala ikusten dira mahaian."] },
        { id: "music",
          t: "Musika-erreproduzigailua",
          b: [
            "Goiburuko menuetako musika-aukerak lounge musikako erreproduzigailu txiki bat irekitzen du: aukeratu pista bat zerrendatik, erreproduzitu/pausatu, aurrekoa/hurrengoa, nahastu, eta errepikatu pista bat, zerrenda osoa edo ezer ez. Bolumena, hautatutako pista eta errepikatze-modua gogoratzen dira. Erreprodukzioa ez da inoiz berez hasten — nabigatzaileek ukitu bat eskatzen dute — eta erreproduzigailua jokoaren soinu-efektuetatik guztiz independentea da.",
            "Pistaren izenaren azpiko bi erpuruek esaten dute entzuten ari dena gustatzen zaizun ala ez. Boto anonimo bat gailu bakoitzeko, irratiak barne, eta noiznahi alda edo ken dezakezu; operadoreak guztizkoak erakusten ez baditu, zure erpurua soilik ikusten duzu.",
            "iPhone eta iPad-en, erreproduzigailuak erreprodukzio sinplea erabiltzen du lehenespenez, musikak CarPlay, Bluetooth edo pantaila blokeatuarekin jarrai dezan; bolumena gailuaren edo autoaren botoiekin doitzen da orduan. «Aplikazioaren barneko bolumena» aukerak bolumen-graduatzailea, balantzea eta VU-neurgailua itzultzen ditu, baina soinua moztu egin daiteke autoan."] },
        { id: "sounds",
          t: "Soinu-efektuak",
          b: [
            "Jokoaren soinuak bereiz aktibatu/desaktibatu daitezkeen lau kategoriatan taldekatzen dira, mahaigaineko bezeroan bezala: jokaldiak (banatutako kartak, Check, Call, Raise, zure txanda…), egongelako txataren jakinarazpena, sareko partidaren jakinarazpenak (jokalaria sartu da, partida prest) eta blinden igoeraren jakinarazpena. Bolumen-graduatzaile bakar batek guztiak kontrolatzen ditu, Aukera aurreratuak → Soinua atalean."],
          note: "Nabigatzaile guztiek — batez ere iOS-ek — ez dute audiorik erreproduzitzen orria behin ukitu arte. Partida isilik hasten bada, edonon ukitu bakar batek soinua pizten du; bezeroak ere automatikoki berreskuratzen du iOS-ek audio-motorra eteten duenean (sarrerako deia, atzeko planora igarotzea…)." },
        { id: "voice",
          t: "Ahots-iragarpenak eta bibrazioa",
          b: [
            "Beste bi kanalek informa zaitzakete pantailari begiratu gabe: ahots-iragarpenek jokoaren gertaerak irakurtzen dituzte zure gailuaren hizketa-sintesiarekin, eta telefonoetan bibrazio labur batek zure txanda adieraz dezake. Biak web hedapenak dira, lehenespenez gaituta edo desgaituta gailuaren arabera, Aukera aurreratuak → Apustuak eta txanda atalean."],
          note: "Bibrazioak Android-en funtzionatzen du (Chromium nabigatzaileak); Apple-k ez die bibrazio-APIa eskaintzen webguneei, beraz iPhone-ek ezin dute bibratu. Ahots-iragarpenek edonon funtzionatzen dute, baina ahots eta hizkuntza erabilgarriak zure sistemaren araberakoak dira — bezeroak aurkitzen duen egokiena erabiltzen du." }
      ]
    },
    {
      id: "options", icon: "⚙️", title: "Aukerak eta lasterbideak",
      sections: [
        { id: "where",
          t: "Non dauden aukerak",
          b: [
            "Aukera aurreratuak edozein goiburu-menutako engranaje-aukeratik irekitzen dira. Mahaigaineko bezeroan bezala taldekatuta daude: Erabiltzaile-interfazea, Estiloa, Soinua, Tokiko partida, Sareko partida, Interneteko partida, Ezizenak / Abatarrak, Egunkariko mezuak, eta Babeskopia eta berrezarpena. Webeko funtzio berezi bakoitzak bere etengailua du bertan, beraz erabiltzen ez duzun guztia desgai dezakezu."] },
        { id: "cfgxml",
          t: "Ezarpenak trukatzea mahaigaineko bezeroarekin",
          b: [
            "Zure ezarpenak bezeroen artean mugi daitezke: Babeskopia eta berrezarpena kategoriak config.xml fitxategi ofizialaren esportazioa/inportazioa eskaintzen du (~/.pokerth/config.xml, mahaigaineko eta QML bezeroek erabiltzen dutena). Esportatzeak ezarpen partekatuak idazten ditu — izena, bistaratze-aukerak, soinuak, mahaiko hobespenak, blindak, estiloak — eta inportatzeak mahaigaineko fitxategia hemen aplikatzen du. Bezero honek ezagutzen ez dituen ezarpenak ukitu gabe gordetzen dira fitxategian.",
            "Jokalariei buruzko zure oharrak ere fitxategiarekin batera doaz — testua eta izar-balorazioa, mahaigaineko bezeroek irakurtzen dituzten moduan idatzita. Kolore-etiketak bezero honetan geratzen dira: formatu ofizialak ez du horientzako eremurik, beraz inportatzeak ez ditu inoiz zureak ukitzen."] },
        { id: "sync",
          t: "Zurekin doazen ezarpenak",
          b: [
            "Kontu batekin jokatzen duzunean, zure aukerak, gaia, tekla-esleipenak, hizkuntza eta entrenamenduko garaikurrak sinkronizatzen dira: aldatu zerbait gailu batean, eta saioa hasten duzun hurrengo gailuak jasoko du. Garaikurren aurrerapena batu egiten da, inoiz ez gainidatzi, beraz bi gailutan jokatzeak bietako onena gordetzen du beti."] },
        { id: "updates",
          t: "Eguneratuta egotea",
          b: [
            "Bezeroa bere kabuz eguneratzen da: bertsio berri bat zabaltzen denean, banda batek orria freskatzera gonbidatzen zaitu (edo idatzi /update txatean eskuz egiaztatzeko). Noizean behin inkesta txiki bat ager daiteke funtzio bati buruzko zure iritzia galdetzeko — parte hartzea aukerakoa da, eta inkestak erabat desgai daitezke Aukera aurreratuak → Komunitatea atalean."] },
        { id: "fkeys",
          t: "Teklatuko lasterbide ofizialak",
          b: [
            "PokerTH-ren funtzio-tekla ofizialek partidan zehar funtzionatzen dute — Alt+S-k edonon:"],
          keys: [
            ["F1 / F2 / F3 / F4", "Fold · Check/Call · Bet/Raise · All-In (ordena alderantzika daiteke aukeretan)   ⟦F1 / F2 / F3 / F4⟧"],
            ["F5", "Erakutsi zure kartak (posible denean)   ⟦F5⟧"],
            ["F6 / F7 / F8", "Eskuzkoa · Auto Check/Fold · Auto Check/Call   ⟦F6 / F7 / F8⟧"],
            ["Alt+M / Alt+K / Alt+F", "Eskuzkoa · Auto Check/Call · Auto Check/Fold   ⟦Alt+M / Alt+K / Alt+F⟧"],
            ["Alt+C / Alt+L / Alt+I", "Txata · Partidaren egunkaria · Probabilitateen panela   ⟦Alt+C / Alt+L / Alt+I⟧"],
            ["Alt+S", "Ezarpenak — aplikazioko edozein lekutan, ez partidan soilik   ⟦Alt+S⟧"],
            ["F11", "Pantaila osoa   ⟦F11⟧"]],
          note: "Lasterbideek teklatu fisikoa behar dute. Mac-en F teklak multimedia-kontrolak dira lehenespenez: eutsi Fn-i (edo gaitu «Erabili F1, F2 eta abar funtzio-tekla estandar gisa» macOS-en ezarpenetan). iPhone-n pantaila osoa iOS-ek mugatzen du — aplikazioa PWA gisa instalatzeak pantaila osoko esperientzia bera ematen du." },
        { id: "webkeys",
          t: "Webeko letra-teklak",
          b: [
            "Web hedapen gisa, letra bakarreko teklek eta Alt+T-k ere ekintzak abiarazten dituzte, eta bakoitza berriro esleitu daiteke Aukera aurreratuak → Teklatuko lasterbideak atalean:"],
          keys: [
            ["F", "Fold   ⟦F⟧"],
            ["C", "Check / Call   ⟦C⟧"],
            ["R", "Raise   ⟦R⟧"],
            ["A", "All-In   ⟦A⟧"],
            ["1 / 2 / 3", "Apustua 1/3 · 1/2 · Potea   ⟦1 / 2 / 3⟧"],
            ["Alt+T", "Estatistiken panela   ⟦Alt+T⟧"],
            ["Esc", "Itxi goiko leihoa (baita Android-en Atzera botoia ere)   ⟦Esc⟧"],
            ["↑ ↓ · ↵", "Egongelako mahai-zerrenda (iritsi Tab-ekin): aukeratu mahaia · sartu   ⟦↑ ↓ · ↵⟧"]],
          note: "Android-en, sistemaren Atzera botoiak/keinuak leihoak ixten ditu Escape bezala, partidatik irten beharrean (aukeretan doi daiteke). iOS-ek ez du sistema-botoi baliokiderik — erabili leiho bakoitzaren ✕." }
      ]
    }
  ]
};
