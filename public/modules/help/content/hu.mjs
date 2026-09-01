// ── help/content/hu.mjs — Magyar súgókorpusz (5. adag) ──────────────────────
// Az en.mjs (referencia) fordítása. A szerkezet és az id-k azonosak; csak a
// t / b / list / keys (címkék) / note van lefordítva. A pókerkifejezések
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) az alkalmazás
// konvenciója szerint angolul maradnak.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Első lépések',
      sections: [
        { id: 'modes', t: 'Háromféle játékmód',
          b: ['A bejelentkezési képernyőn válaszd ki, hogyan szeretnél játszani.'],
          list: [
            'Internet — játssz online a hivatalos pokerth.net szerveren, ranglistákkal. pokerth.net-fiók szükséges; a regisztráció a pokerth.net oldalon ingyenes.',
            'Helyi / gyakorlás — játssz offline botok ellen. Nincs mit beállítani, kapcsolat nélkül is működik, és a fejlődéseddel trófeákat oldasz fel.',
            'LAN / saját szerver — csatlakozz egy privát PokerTH szerverhez a helyi hálózatodon vagy a saját gépeden.'] },
        { id: 'lan', t: 'LAN / saját szerver',
          b: ['A harmadik mód bármely PokerTH szerverhez csatlakozik, amelyet te vagy egy barátod futtat — otthoni hálózaton, privát VPS-en, bárhol. Add meg a szerver címét és portját, pipáld be a TLS-t, ha a szerver titkosított portot használ, és jelentkezz be egy becenévvel (a vendégbelépés is működik, ha a szerver engedélyezi). Az asztalnál ezután minden pontosan úgy viselkedik, mint a hivatalos szerveren.'] },
        { id: 'famboard', t: 'Családi ranglista',
          b: ['Csak privát szervereken és LAN-játékokban tart a kliens becenevenkénti összesített statisztikákat — játszott és megnyert leosztások és játszmák, legnagyobb nyeremény, legjobb sorozat — és a szerveren keresztül megosztja őket, így az asztal körül minden eszköz ugyanazt a ranglistát látja. A pokerth.net játékokat soha nem követi így, és a gyakorlómód statisztikái teljesen külön vannak tárolva.'] },
        { id: 'language', t: 'Nyelv',
          b: ['A felület 45 nyelven érhető el. Bármikor átválthatod a Speciális beállításokban (fogaskerék menü), a Felhasználói felület kategóriában. A póker akciókifejezései (Fold, Check, Call, Bet, Raise, All-In) konvenció szerint angolul maradnak, pontosan úgy, mint az asztali kliensben.'] },
        { id: 'pwa', t: 'Telepítés alkalmazásként',
          b: ['Ez a kliens egy Progressive Web App: telepítheted a böngésző menüjéből (vagy a fejléc telepítés gombjával), és saját ikonnal rendelkező, teljes képernyős alkalmazást kapsz. Telepítés után azonnal indul, a gyakorlómód pedig teljesen offline működik.'],
          note: 'Androidon és asztali Chrome/Edge böngészőben a telepítés gomb mindent elintéz. iPhone-on/iPaden az Apple csak a Safarin keresztül engedi a telepítést: Megosztás gomb \u2192 \u201eHozzáadás a Főképernyőhöz\u201d — a kliens szükség esetén megmutatja ezeket a lépéseket. A gomb eltűnik, amint az alkalmazás telepítve van.' },
        { id: 'platforms', t: 'Platformok és böngészők',
          b: ['A kliens minden modern böngészőben fut, minden rendszeren — Windows, macOS, Linux, Android, iOS. Néhány funkció újabb böngésző-API-kra támaszkodik; ha egy API hiányzik, a funkció elrejtőzik vagy elmagyarázza a helyzetet, ahelyett hogy elromlana. A főbb különbségek, amiket érdemes tudni:'],
          list: [
            'Chrome / Edge (asztali): minden működik, beleértve a .pdb napló mappába írását is.',
            'Firefox: minden, kivéve a .pdb mappába írását (az API még nem érhető el).',
            'Safari / iOS: a telepítés a Megosztás \u2192 \u201eHozzáadás a Főképernyőhöz\u201d útvonalon megy; nincs rezgés; a teljes képernyő korlátozott iPhone-on; a hang az első érintésed után indul.',
            'Android: teljes támogatás a Chromium-böngészőkben, beleértve a rezgést és a Vissza gomb viselkedését.'] },
        { id: 'avatar', t: 'Becenév és avatár',
          b: ['Csatlakozás előtt a bejelentkezési képernyőn válaszd ki a beceneved és az avatárod. A pokerth.net oldalon a beceneved a fiókod neve; az avatárokat az avatárszerveren keresztül osztja meg a rendszer a többi játékossal.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'A póker szabályai',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em dióhéjban',
          b: ['A PokerTH-ban No-Limit Texas Hold\u2019em megy. Minden játékos két zárt lapot kap (hole cards). Ezután öt közös lap kerül képpel felfelé az asztal közepére. A két lapod és az öt közös lap tetszőleges kombinációjából alkotott legjobb ötlapos kéz nyeri a potot.'] },
        { id: 'blinds', t: 'A vakok és az osztógomb',
          b: ['Minden leosztás előtt két kötelező tét táplálja a potot: a small blind és a big blind, amelyet az osztógombtól balra ülő két játékos tesz be. A gomb minden leosztás után egy hellyel arrébb lép az óramutató járása szerint, így mindenki sorban fizeti a vakokat. A vakok a játszma során szabályos időközönként emelkednek.',
              'Az asztalon a gombot és a vakokat zsetonok jelölik: D (osztó), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'A négy licitkör',
          list: [
            'Pre-flop — a zárt lapok kiosztása után az első licitkör a big blindtól balra kezdődik.',
            'Flop — három közös lap felfedésre kerül, majd licitkör következik.',
            'Turn — negyedik közös lap, aztán újabb licitkör.',
            'River — az ötödik és utolsó közös lap, majd az utolsó licitkör.'],
          b: ['Egy licitkör akkor ér véget, amikor minden, a leosztásban maradt játékos ugyanannyit tett a potba (vagy all-in van).'] },
        { id: 'actions', t: 'Mit tehetsz, amikor te következel',
          list: [
            'Fold — feladod a leosztást. A lapjaid kikerülnek, és többé nem versenyzel a potért.',
            'Check — továbblépsz tét nélkül. Csak akkor lehetséges, ha nincs mit megadni.',
            'Call — megadod az aktuális tétet.',
            'Bet — megnyitod a licitet, ha ezen a streeten még senki sem tett tétet.',
            'Raise — emelsz egy meglévő tét fölé. A minimális emelés az előző téttel vagy emeléssel egyenlő.',
            'All-In — belerakod a teljes stackedet. A leosztásban maradsz addig az összegig, amelyet fedeztél.'] },
        { id: 'showdown', t: 'Showdown és osztott potok',
          b: ['Ha a riveren zajló licitkör után több játékos marad, a kezek felfedésre kerülnek, és a legjobb nyer — a nyertes kombináció a közös lapok alatt jelenik meg. Ha egy játékos kevesebbel van all-in, mint a teljes tétek, mellékpotok jönnek létre: minden játékos csak a pot azon részét nyerheti el, amelyhez hozzájárult. A holtversenyben lévő kezek osztoznak a poton.',
            'Nem mindenkinek kell megmutatnia: az utolsó licitáló vagy emelő játékostól kezdve egy lap csak akkor fordul fel, ha veri azt, ami már nyitva van. Aki eldobhatja, lefordítva tartja a lapjait, és kap egy Show gombot, hogy mégis megmutassa.'] },
        { id: 'hands', t: 'A kezek rangsora',
          b: ['A leggyengébbtől a legerősebbig:'],
          list: [
            '1. High Card — semmilyen kombináció; a legmagasabb lap dönt.',
            '2. Pair — két azonos értékű lap.',
            '3. Two Pair — két különböző pár.',
            '4. Three of a Kind — három azonos értékű lap.',
            '5. Straight — öt egymást követő lap (az ász a legmagasabbként vagy legalacsonyabbként számít).',
            '6. Flush — öt azonos színű lap.',
            '7. Full House — drill plusz egy pár.',
            '8. Four of a Kind — négy azonos értékű lap.',
            '9. Straight Flush — sor, teljes egészében egy színben.',
            '10. Royal Flush — tízestől ászig egy színben. A lehető legjobb kéz.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'A játékképernyő',
      sections: [
        { id: 'actionbar', t: 'Az akciósáv',
          b: ['Amikor te következel, az alsó akciósáv kigyullad legfeljebb négy gombbal: Fold (piros), Check / Call (kék), Bet / Raise (zöld — a fő akció, kiemelve) és All-In (sötétvörös). A Check / Call gomb a pontos megadandó összeget mutatja; a Bet / Raise azt az összeget, amelyet berakni készülsz. A river után az All-In átalakulhat Show gombbá a lapjaid megmutatásához.'] },
        { id: 'betctl', t: 'A téted kiválasztása',
          b: ['Az emelés összegét a számmezővel, a csúszkával vagy az 1/3 \u00b7 1/2 \u00b7 Pot gyorsgombokkal (az aktuális pot törtrészei) állítod be. Az összegek automatikusan kerekítődnek, és a megengedett minimális és maximális emelés között maradnak. Ha inkább big blindokban gondolkodsz, egy beállítással minden összeg BB-ben jelenik meg zsetonok helyett.'] },
        { id: 'preselect', t: 'Akció előválasztása',
          b: ['A köröd előtt előre élesíthetsz egy akciót: érints meg egy gombot, és az arany keretet kap egy kis arany ponttal. Amikor te következel, az akció azonnal végrehajtódik. Az élesített Fold automatikusan Check lesz, ha a check ingyenes — soha nem dobsz feleslegesen. Az előválasztások minden új leosztásnál, streetváltásnál és showdownnál nullázódnak, és érvénytelenné válnak, ha a helyzet megváltozik (például ha a megadandó összeg változik).'] },
        { id: 'automodes', t: 'Automatikus módok',
          b: ['Az akciógombok melletti legördülő menü három játékmódot kínál: Kézi, Auto Check/Call és Auto Check/Fold. Az automatikus módok helyetted játszanak, amíg vissza nem váltasz — bármely akcióra tett kézi kattintás azonnal visszaállítja a Kézi módot.'] },
        { id: 'readtable', t: 'Az asztal olvasása',
          b: ['Minden játékosdoboz mutatja az avatárt, a nevet, a stacket és az aktuális tétet. Az osztót és a vakokat D / SB / BB zsetonok jelölik. A dobozon lévő színes jelvény a játékos legutóbbi akcióját mutatja; egy vékony kék sáv visszaszámolja a gondolkodási idejét. A soron lévő játékos doboza kigyullad; a te dobozod lüktető arany keretet kap, amikor te következel.',
              'Az asztal fölötti állapotsor mutatja a teljes potot, az aktuális street tétjeit, a fázist (Pre-flop, Flop, Turn, River), valamint a játszma- és leosztásszámokat. A bedobó játékosok lapjai áttetszők; a kiesettek elsötétülnek. A leosztás végén egy győztes-ablak összegezheti, ki mit nyert — a beállításokban kikapcsolható.'] },
        { id: 'seatlayout', t: 'Az ülések elrendezése',
          b: ['Webes kiterjesztésként a játékosdobozok elrendezése a Speciális beállítások \u2192 Ülések alatt választható: az Automatikus a hivatalos klienst követi (rögzített pozíciók állóban, számított ellipszis fekvőben), vagy kényszerítheted az Álló vagy Fekvő elrendezést — az Egyéni pedig hagyja, hogy minden ülést magad helyezz el: megjelenik egy szerkesztőmód, amelyben minden dobozt pontosan oda húzol, ahová akarod, és az elrendezés mentésre kerül.'] },
        { id: 'zoom', t: 'Asztali nagyítás (telefonok)',
          b: ['Kis képernyőkön a nagyító gombok felnagyítják az asztalt (2\u00d7), és ujjal húzhatod — a saját dobozod és az akciósáv a helyén marad. A nézet automatikusan követi az aktív ülést, és showdownnál kizoomol az áttekintéshez. A Speciális beállításokban kikapcsolható.'],
          note: 'Telefonokon és tableteken a böngésző saját csippentéses nagyítása alapból tiltva van, hogy egy nagyítási mozdulat sose induljon el véletlenül egy leosztás közepén; ha úgy szereted, kapcsold vissza a Speciális beállítások \u2192 Felhasználói felület alatt.' },
        { id: 'protections', t: 'Leskelődés elleni és véletlen Call elleni védelem',
          b: ['Két választható védelem: a leskelődés elleni védelem addig tartja lefordítva a lapjaidat, amíg meg nem érinted őket (hasznos, ha valaki láthatja a képernyődet), a véletlen Call elleni védelem pedig egy nagy emelés után rövid időre zárolja a Call gombot, hogy egy kisebb Callnak szánt érintés ne essen véletlenül a megemelt összegre. Mindkettő a Speciális beállításokban található.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Az információs panel',
      sections: [
        { id: 'open', t: 'A panel megnyitása',
          b: ['Játék közben az információs panel a fejlécből nyílik (vagy Alt+L / Alt+I), és három lapja van: Napló, Esélyek és Statisztikák. Telefonon az asztal fölött lebeg; nagyobb képernyőkön mozgatható és átméretezhető ablak — fogd meg a \u28ff fogantyút a mozgatáshoz, a széleket az átméretezéshez. A helyzete megjegyzésre kerül.'] },
        { id: 'log', t: 'Játéknapló',
          b: ['A Napló lap az egész játszmát leosztásról leosztásra rögzíti: a vakokat, minden akciót az összegekkel, a felfedett lapokat és a győzteseket, mindent színezve a gyors olvashatóságért. Az exportálás gomb fájlba menti a naplót, ha később át akarod nézni a munkamenetet.'] },
        { id: 'odds', t: 'Esélyek (valószínűség-figyelő)',
          b: ['Az Esélyek lap az aktuális kezedhez élőben mutatja annak valószínűségét, hogy a 10 kézkategória mindegyikével végzel — a High Cardtól a Royal Flushig — mindegyikhez ikon, százalék és sáv tartozik. A kijelzés elszürkül, amint bedobsz. Csak a saját lapjaidat és a közös lapokat használja: semmit sem lát, amit az ellenfeleid nem mutatnak meg.'] },
        { id: 'journal', t: 'Leosztásnaplók és a \u201eNaplók\u201d ablak',
          b: ['Az élő naplón túl minden játszott leosztás helyben rögzül a böngésződben, ugyanabban a formátumban, mint a hivatalos kliens .pdb naplófájljai. A Naplók ablak (Speciális beállítások \u2192 Naplóüzenetek \u2192 Naplók kezelése\u2026) felsorolja a munkameneteidet, és lehetővé teszi a munkát velük: munkamenet előnézete kereséssel és kiemeléssel, szűrés játszma szerint, exportálás HTML-be vagy sima szövegbe, a nyers .pdb fájl mentése, vagy az asztali kliens által rögzített .pdb importálása. A munkamenetek egyenként vagy egyszerre törölhetők (megerősítéssel), az automatikus megőrzés pedig csak az utolsó 7, 30, 90, 180 vagy 365 napot tarthatja meg. A magad importálta naplók soha nem törlődnek automatikusan. Egy második beállítás korlátozza a megőrzött munkamenetek számát, a lista oszlopa pedig szélesebbre húzható.',
              'Ha egyszerre több munkamenetet szeretne kitakarítani, a Kijelölés… gomb minden bejegyzéshez jelölőnégyzetet tesz: pipálja ki a feleslegeseket, és a Törlés egyetlen megerősítés után eltávolítja az egész csomagot. Számítógépen a Ctrl (⌘) + kattintás egyesével adja hozzá a munkameneteket, a Shift + kattintás pedig egész tartományt jelöl ki.',
              'Az Elemzés gomb kézelemzést futtat egy munkameneten, és elküldhet egy naplót a pokerth.net elemzőszolgáltatásának. Minden az eszközödön marad, amíg kifejezetten nem exportálsz vagy küldesz.'] },
        { id: 'logopts', t: 'Naplóbeállítások',
          b: ['A Speciális beállítások \u2192 Naplóüzenetek alatt be- vagy kikapcsolhatod a naplózást, és kiválaszthatod az írási időközt, ugyanazzal a három beállítással, mint az asztali kliensben: minden akció után, minden kör után (alapértelmezett) vagy minden játék után. Egy másik beállítás a .pdb fájlt egy általad választott mappába írja, és ezzel az időközzel tartja naprakészen, plusz még egyszer az oldal elhagyásakor, hogy egy másik eszköz élőben követhesse a játékot.'],
          note: 'A helyi mappába írás File System Access API-t igényel: csak asztali Chrome, Edge és Opera. Máshol a beállítás elmagyarázza magát, és a kézi exportálás a Naplók ablakból továbbra is elérhető. A böngésző egy fájlt csak lecserélni tud, hozzáfűzni soha, ezért a .pdb-t olvasó eszköznek minden változás után újra meg kell nyitnia.' },
        { id: 'assist', t: 'Segéd (kézerősség)',
          b: ['Az Esélyek lap tetején a segédsáv helyetted olvassa a kezed. A flop előtt megnevezi a kezdőkezed, és csillagokkal értékeli; a floptól kezdve az aktuális legjobb kombinációdat mutatja, és egy gyors szimuláció után a leosztás megnyerésének becsült esélyét százalékban, pirostól (gyenge) zöldig (erős) terjedő színjelzéssel. A valószínűség-figyelőhöz hasonlóan csak olyan információt használ, amelyet láthatsz.',
              'Két megjelenítési stílus a Speciális beállítások \u2192 Ülések alatt: Szegmensek (tíz blokk) vagy klasszikus folyamatjelző. Az egész segédfunkció kikapcsolható a Speciális beállítások \u2192 Segéd alatt.'] },
        { id: 'assistwin', t: 'A segéd lebegő widgetként',
          b: ['A segédblokk leválasztható a panelről egy mindig felül lévő saját kis ablakba: használd a blokkon lévő leválasztás gombot, majd mozgasd és méretezd bárhová az asztal fölött — praktikus a kézerősség figyeléséhez a teljes panel megnyitása nélkül. A dokkolás gomb visszateszi az Esélyek lapra, a helyzet megjegyzésre kerül. A panelen belül a Segéd és az esélyek közötti húzófogantyúval oszthatod el a helyet a kettő között.'] },
        { id: 'stats', t: 'Statisztikák',
          b: ['A Statisztikák lap követi a munkameneted: játszott leosztások, látott flopok, showdownok, nyerési arányok és még sok más. A statisztikakövetés a Speciális beállításokban kikapcsolható.'] },
        { id: 'hud', t: 'Statisztika-HUD az üléseknél',
          b: ['A HUD minden játékos helye mellé egy kis statisztikadobozt tesz, amelyet a naplóidban rögzített leosztásokból épít: a megfigyelt leosztások száma, majd VPIP (milyen gyakran tesz be önként pénzt pre-flop), PFR (pre-flop emelések) és AF (agresszivitási tényező), passzívtól agresszívig színkódolva. Alattuk egy jelvény szavakkal foglalja össze a játékost \u2014 Szoros-Passzív, Laza-Agresszív és így tovább \u2014 egy kis számlap mellett, amelynek kivilágított negyede balról jobbra szorosból lazába, alulról felfelé passzívból agresszívba olvasandó. A jelvény már az első leosztástól látszik, de 25 leosztásig halvány marad, onnantól megbízható. Koppints egy dobozra a részletes felugró ablakért, amelyben minden szám szerepel (3-bet, continuation bet, fold 3-betre, lopási kísérletek, showdown-arányok\u2026), és húzd arrébb, ha eltakar valamit.',
              'A HUD csak azt tudja, amit a saját asztalaidnál láttál — a helyi leosztásnaplóidat olvassa, ezért a rögzítésnek bekapcsolva kell lennie, és a számok csak elég leosztás után válnak értelmessé. Alapból ki van kapcsolva: kapcsold be a Speciális beállítások \u2192 Segéd alatt.'] },
        { id: 'handsbtn', t: 'A kombinációk áttekintése',
          b: ['A posztón lévő pókerkéz-ikon bármikor megnyitja a 10 kombináció gyors áttekintését — praktikus tanulás közben. A Speciális beállításokban elrejthető.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Csevegés és közösség',
      sections: [
        { id: 'panels', t: 'Lobbicsevegés és asztali csevegés',
          b: ['Egy csevegés van a lobbiban, egy másik az asztalnál. Telefonon az asztali csevegés a játék fölött lebeg; nagyobb képernyőkön mozgatható és átméretezhető ablak. A csevegés gombján lévő jelvény számolja az olvasatlan üzeneteket.'] },
        { id: 'typing', t: 'Gépelési segítségek',
          list: [
            'A Tab kiegészít egy becenevet — nyomd meg újra a Tabot a találatok közötti lépkedéshez.',
            'A \u2191 / \u2193 a saját üzeneteid előzményeit lapozza.',
            'Az emodzsi gomb teljes választót nyit; a : begépelése is emote-okat ajánl gépelés közben.'] },
        { id: 'emotes', t: 'Emote-ok és hangulatjelek',
          b: ['A csevegés pontosan úgy alakítja át az emote-kódokat, mint a hivatalos asztali kliens: írj egy nevet két kettőspont közé, és emodzsivá válik — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 több mint 1 900 kód támogatott (a teljes GitHub-készlet). A klasszikus szöveges hangulatjelek is átalakulnak: :-) ;) :D xD :P <3 és úgy nyolcvan másik.',
              'A : begépelése javaslatdobozt nyit, amely gépelés közben kiegészíti a kódot (\u2191/\u2193 a választáshoz, Tab vagy Enter az elfogadáshoz). Az emodzsi-átalakítás teljesen kikapcsolható a Speciális beállítások \u2192 Csevegés alatt.'] },
        { id: 'commands', t: 'Csevegőparancsok',
          b: ['A csevegés érti a perjeles parancsokat. Kettő látható mások számára:'],
          keys: [
            ['/me <szöveg>', 'Akcióüzenet, így jelenik meg: \u201e* beceneved szöveg\u201d'],
            ['/emoji <emodzsi>', 'Lejátszik egy emodzsi-reakciót (ugyanazt, amit a reakcióválasztó küld)']] },
        { id: 'diagcmds', t: 'Diagnosztikai parancsok',
          b: ['Minden más helyi: a válaszokat csak te látod, és semmi sem megy az asztalhoz. Írd be a /help parancsot az összes felsorolásához. A leghasznosabbak:'],
          keys: [
            ['/help', 'Az összes parancs felsorolása'],
            ['/update', 'Új verzió keresése és frissítés'],
            ['/lang <kód>', 'Nyelvváltás (pl. /lang hu)'],
            ['/sound on|off', 'Játékhangok be-/kikapcsolása'],
            ['/zoom', 'Az asztali nagyító átkapcsolása'],
            ['/clear', 'A csevegés helyi törlése'],
            ['/table', 'Az aktuális játszma adatai (vakok, játékosok, stackek)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Kliensállapot-, hálózat- és folyékonyság-diagnosztika'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Haladó hibakeresés (lapok, protokoll, hang, tárolás, ülések)'],
            ['/copy', 'Az utolsó parancsválasz vágólapra másolása']] },
        { id: 'reactions', t: 'Emodzsi-reakciók',
          b: ['A reakciógomb 30 animált reakció választóját nyitja meg (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026), amelyek effekttel játszódnak le az ülésed fölött, az egész asztal számára láthatóan — az asztali kliens játékosait is beleértve. A reakciók teljesen kikapcsolhatók a Speciális beállításokban.'] },
        { id: 'translate', t: 'Érts meg mindenkit',
          b: ['Bekapcsolt csevegésfordítással a fordítás gomb a mutató alatti soron jelenik meg — vagy azon a soron, amelyre érintőképernyőn rákoppintasz — és a böngésző fordítójával mutatja az üzenetet a nyelveden. A Speciális beállítások → Csevegés alatt állandóan megjeleníthető minden soron; ott lakik a gyakori asztali rövidítéseket (gg, nh, utg…) magyarázó buborék is.'],
          note: 'A fordítás a Google Translate szolgáltatást használja, és minden böngészőben működik — csak internetkapcsolat kell. Egy üzenet csak akkor kerül a fordítószolgáltatáshoz, amikor megérinted a fordítás gombját, soha nem automatikusan.' },
        { id: 'social', t: 'Játékosok: profil, meghívás, mellőzés',
          b: ['Érints meg bármely játékost — az asztalnál vagy a lobbi listáján — a kártyája megnyitásához: profil és statisztikák, meghívás a játszmádba, vagy mellőzés (a csevegőüzenetei elrejtődnek; a mellőzés bármikor visszavonható). A meghívás/mellőzés előtti megerősítés a beállításokban bekapcsolható.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobbi és játszmák',
      sections: [
        { id: 'list', t: 'A játszmalista',
          b: ['A lobbi a szerver összes asztalát felsorolja. Minden bejegyzés mutatja a játékosok számát, a játszmatípust, egy lakatot, ha jelszó vagy meghívó szükséges, és egy állapotjelvényt: \u201eVárakozik\u201d (zöld — a játszma nem indult el, beléphetsz, ha van szabad hely), \u201eFolyamatban\u201d (meleg szín — élőben nézhető, ha a nézők engedélyezettek) és \u201eLezárva\u201d (tompított). A teli asztal egyszerűen a teli számlálóról ismerhető fel, pl. 10/10; a jelvények színei az aktív témát követik.',
              'A szűrő legördülő pontosan úgy szűkíti a listát, mint az asztali kliens, minden választás szigorúbb az előzőnél: csak nyitott játszmák \u2192 a teli asztalokat is elrejtve \u2192 majd csak a nem privátak, csak a privátak, vagy csak a rangsorolt játszmák. A választásod megjegyzésre kerül. A keresőmező név alapján talál játszmát, a játékosjelvény pedig megnyitja az összes online lévő kereshető és rendezhető listáját.'] },
        { id: 'join', t: 'Belépés és nézés',
          b: ['Válassz egy nyitott játszmát, és lépj be — a lakat azt jelzi, hogy jelszó kell. A nézőket engedő, folyamatban lévő játszmák élőben nézhetők: látod az asztalt és a csevegést, de a zárt lapok rejtve maradnak, és nem cselekedhetsz.'] },
        { id: 'gameinfo', t: 'Játszmaadatok',
          b: ['Belépés előtt a játszmaadat-kártya mindent megmutat, ami az asztalt meghatározza: játszmatípus, vakok és emelkedésük (duplázás vagy kézi lista), kezdőstack, akcióidő, szünet a leosztások között, és ki ül már ott.'] },
        { id: 'create', t: 'Játszma létrehozása',
          b: ['Hozd létre a saját asztalod: név, játékosszám, kezdőstack, első small blind és emelési ütemterv, akcióidő, és hogy engedélyezettek-e a nézők. Négy játszmatípus van: Normál (mindenki), csak regisztrált játékosok, csak meghívóval, és Rangsorolt (beszámít a hivatalos ranglistába — ebben az esetben jelszó nem lehetséges). A kedvenc beállításaid menthetők és újratölthetők.'] },
        { id: 'invites', t: 'Meghívók',
          b: ['A játékosok meghívhatnak az asztalukhoz; értesítést kapsz, amelyet elfogadhatsz vagy elutasíthatsz. A meghívás az egyetlen módja a csak meghívós játszmába való belépésnek.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'A fiókod',
          b: ['A hivatalos internetes szerver a pokerth.net. Az ottani játékhoz ingyenes pokerth.net-fiók kell — regisztrálj a weboldalon, majd jelentkezz be itt ugyanazzal a becenévvel és jelszóval. Ez a webkliens pontosan ugyanahhoz a szerverhez csatlakozik, mint az asztali kliens: ugyanazok a fiókok, ugyanazok az asztalok, ugyanazok a ranglisták, és egy asztalhoz ülhetsz az asztali kliens játékosaival.'] },
        { id: 'ranked', t: 'Rangsorolt játszmák és szezonok',
          b: ['A Rangsorolt típusú játszmák beszámítanak a hivatalos szezonranglistába. Az alkalmazásbeli profilod mutatja a regisztrációd dátumát, az aktuális szezonbeli Rankedet, a Score-odat, az átlagodat és a játszott játszmáidat, valamint a legutóbbi eredményeidet. A normál (nem rangsorolt) játszmák csak szórakozásra valók, és semmit sem változtatnak.'] },
        { id: 'rankhow', t: 'Hogyan számolják a ranglistát',
          b: ['Minden rangsorolt játékban a helyezésed pontot ér: az elsőért 15, majd 9, 6, 4, 3, 2 és 1 a hetedikig; a nyolcadiktól a tizedikig semmi. Egy asztal tehát összesen 40 pontot oszt ki.',
              'A Score-od nem ezeknek a pontoknak az összege, hanem a játékonkénti átlagod, tompítva egy tényezővel, amely a lejátszott játékok számával nő: néhány jó eredmény nem elég ahhoz, hogy fent maradj, kell hozzá rendszeresség is — minél többet játszol, annál közelebb kerül a Score-od a valódi átlagodhoz. Egy szezon egy negyedévig tart: váltáskor minden archívumba kerül, a számlálók nulláról indulnak, a korábbi szezonok pedig továbbra is megtekinthetők. Játék közben a dobogó gomb az asztalodnál ülő játékosok szezonbeli helyezését mutatja.'],
          note: 'A pontskálát és a pontos képletet a pokerth.net ranglistakiszolgálója határozza meg, és változhatnak; a mérvadó a webhely oldalai.' },
        { id: 'rankings', t: 'Ranglistaoldalak',
          b: ['A ranglista bejegyzés megnyitja a játékosonként kereshető hivatalos PokerTH-ranglistát, valamint a közösségi ranglistákat (BBC, WEC). Ha a ranglisták nem érdekelnek, a bejegyzés elrejthető a Speciális beállítások \u2192 Közösség alatt.'] },
        { id: 'cups', t: 'A közösségi kupák: BBC és WeCup',
          b: ['Két közösség rendezi a saját versenyeit a pokerth.neten, mindegyik saját webhellyel és saját ranglistával. A Best Brainies Cup (BBC) 2013-ban született lépcsős torna: Step 1-től Step 4-ig lehet feljutni, és minden Step 4-es játék után, a kupa átadásakor új szezon indul. A WeCupnak (WEC) saját, sokkal szélesebbre húzott skálája van — az első helyért 75 pont, majd 45, 30, 20… — és a score-ja a többi taghoz mért játékszámod alapján normalizálja az átlagodat.',
              'Mindkét ranglista a kupa gombbal nyílik, a PokerTH-ranglista mellett. E versenyek asztalbeállításai előbeállításként ott vannak a játék létrehozásakor (BBC Step 1-től 4-ig, WEC, WEC Monthly Final és WEC Grand Final), így ugyanolyan körülmények között gyakorolhatsz. A részvételhez az adott kupa webhelyén kell regisztrálni.'],
          note: 'Ha a kupák nem érdekelnek, ezt a tartalmat egyben elrejtheted a Speciális beállítások → Közösség alatt.' },
        { id: 'forumcups', t: 'Fórumkupák és események',
          b: ['A pokerth.net fóruma ad otthont a Monthly Cupnak is: havi sorozat, amelyben a játékosok Gold, Silver és Bronze asztalok között oszlanak meg, mielőtt a hónap bajnokát megkoronáznák, ezen felül az év során egy-egy különleges kupa is akad.',
              'A jelentkezések, időpontok, asztalbeállítások és eredmények a fórumon jelennek meg, a játékok pedig a hivatalos szerveren zajlanak, mint bármely másik. Az eredmények követéséhez elég egy pokerth.net-fiók; egy kupára a megfelelő fórumtémán keresztül lehet jelentkezni.'] },
        { id: 'forumnews', t: 'Fórumhírek a lobbiban',
          b: ['A lobbi fejlécének újság gombja megnyitja a pokerth.net fórum legfrissebb bejegyzéseit, témánként egy sorral, minden fórum saját színnel. A gombon lévő jelvény a olvasatlan bejegyzéseket számolja; egy bejegyzés megnyitása (új lap) olvasottnak jelöli, az „Összes megjelölése olvasottként” pedig egyszerre töröl mindent.',
              'Ez webes extra: a gomb elrejthető a speciális beállításokban („Fórum gomb a lobbi fejlécében”).'] },
        { id: 'avatars', t: 'Avatárok és zászlók',
          b: ['A pokerth.net oldalon az avatárodat az avatárszerver juttatja el a többi játékoshoz, és a játékosdobozokon egy kis országzászló jelenhet meg. Mindkettő választható, és a beállításokban konfigurálható.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Gyakorlómód',
      sections: [
        { id: 'what', t: 'Mi ez',
          b: ['A Helyi / gyakorlás mód teljes értékű játszma számítógép vezérelte ellenfelek ellen: nincs kapcsolat, nincs fiók, semmi sincs kockán. Ha az alkalmazás telepítve van (vagy akár csak egyszer meglátogattad), teljesen offline működik — tökéletes a játék tanulásához, a felület kipróbálásához vagy az időtöltéshez repülő üzemmódban.'] },
        { id: 'setup', t: 'Játszma beállítása',
          b: ['Válaszd ki az ellenfelek számát, a kezdőstacket, a vakokat és emelkedésüket, valamint a játéksebességet. A botok összetétele és nehézsége a Speciális beállítások \u2192 Helyi játszma alatt hangolható — a szelíd ellenfelektől a keményebb és változatosabb asztalig.'] },
        { id: 'trophies', t: 'Trófeák',
          b: ['A gyakorlómódnak saját előrehaladása van: 28 trófea hat kategóriában (előrehaladás, technika, stílus, formátumok, móka és egy titkos) oldható fel játékkal — játszott leosztások, megnyert játszmák, nagy blöffök, különleges kezek és még sok más. A trófea-előrehaladásod halmozódik, és a fiók beállításszinkronizálásának bekapcsolásakor egyesül az eszközök között.'] },
        { id: 'learn', t: 'Jó hely a tanuláshoz',
          b: ['Minden, amit a többi fejezet leír, itt is működik: a valószínűség-figyelő, a segédkijelző, az előválasztás, a billentyűparancsok. A gyakorlómód a legjobb hely, hogy nyomás nélkül kipróbáld őket, mielőtt a pokerth.netre vetnéd magad.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stílus és hang',
      sections: [
        { id: 'themes', t: 'Témák',
          b: ['A Speciális beállítások Stílus kategóriája az egész klienst felöltözteti. Az előbeállítások mindent egy érintéssel beállítanak (a klasszikus zöld kaszinó, a hivatalos PokerTH-megjelenés\u2026); alattuk önálló tengelyek külön-külön hangolják a színpalettát, az asztalposztót és a lapok előlapját — változtass bármely tengelyen, és a keveréked egyéni témává válik. A sötét, világos vagy automatikus mód a Felhasználói felület alatt választható, a döntéseid azonnal, minden képernyőn érvényesülnek, és megjegyzésre kerülnek.'] },
        { id: 'tablelook', t: 'Asztalok, paklik, ülések',
          b: ['A témán túl több elem függetlenül cserélhető: az asztal háttere, a kártyapakli, a lapok hátlapja (automatikusan illik a paklihoz, vagy importáld a saját képed), az osztó- és vakzsetonok, az akciógombok stílusa, valamint teljes üléscsomagok, amelyek átöltöztetik a játékosdobozokat. Mindet a Speciális beállítások \u2192 Stílus alatt választhatod; a változtatások azonnal láthatók az asztalnál.'] },
        { id: 'music', t: 'Zenelejátszó',
          b: ['A fejlécmenük zene bejegyzése egy kis háttérzene-lejátszót nyit: válassz számot a lejátszási listáról, lejátszás/szünet, előző/következő, keverés, valamint egy szám, a teljes lista vagy semmi ismétlése. A hangerő, a kiválasztott szám és az ismétlési mód megjegyzésre kerül. A lejátszás soha nem indul magától — a böngészők érintést követelnek — a lejátszó pedig teljesen független a játék hangeffektjeitől.'] },
        { id: 'sounds', t: 'Hangeffektek',
          b: ['A játékhangok négy, külön kapcsolható kategóriába vannak csoportosítva, pontosan úgy, mint az asztali kliensben: játékakciók (kiosztott lapok, Check, Call, Raise, te következel\u2026), lobbicsevegés-értesítés, hálózati játszma értesítései (játékos csatlakozott, játszma kész) és vakemelés-értesítés. Egyetlen hangerőcsúszka vezérli mindet, a Speciális beállítások \u2192 Hang alatt.'],
          note: 'Minden böngésző — különösen az iOS — megtagadja a hanglejátszást, amíg egyszer meg nem érintetted az oldalt. Ha egy játszma némán indul, egyetlen érintés bárhol felébreszti a hangot; a kliens automatikusan meg is javítja a hangmotort, amikor az iOS felfüggeszti (bejövő hívás, háttér\u2026).' },
        { id: 'voice', t: 'Hang és rezgés',
          b: ['Két további csatorna tarthat képben anélkül, hogy a képernyőt néznéd: a hangbemondás az eszközöd beszédszintézisével felolvassa a játékeseményeket, telefonon pedig egy rövid rezgés jelezheti, hogy te következel. Mindkettő webes kiterjesztés, eszköztől függően alapból be- vagy kikapcsolva, a Speciális beállítások \u2192 Tétek és kör alatt.'],
          note: 'A rezgés Androidon működik (Chromium-böngészők); az Apple nem ad rezgés-API-t a weboldalaknak, így az iPhone-ok nem tudnak rezegni. A hangbemondás mindenhol működik, de az elérhető hangok és nyelvek a rendszeredtől függnek — a kliens a legjobb talált egyezést használja.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Beállítások és gyorsbillentyűk',
      sections: [
        { id: 'where', t: 'Hol laknak a beállítások',
          b: ['A Speciális beállítások bármely fejlécmenü fogaskerék-bejegyzéséből nyílnak. Az asztali klienshez hasonlóan vannak csoportosítva: Felhasználói felület, Stílus, Hang, Helyi játszma, Hálózati játszma, Internetes játszma, Becenevek / Avatárok, Naplóüzenetek és Alapértelmezések visszaállítása. Minden webspecifikus funkciónak ott saját kapcsolója van, így mindent kikapcsolhatsz, amit nem használsz.'] },
        { id: 'cfgxml', t: 'Beállításcsere az asztali klienssel',
          b: ['A beállításaid utazhatnak a kliensek között: a Naplóüzenetek kategória a hivatalos config.xml fájl exportját/importját kínálja (azt a \u007e/.pokerth/config.xml-t, amelyet az asztali és a QML kliensek használnak). Az export a közös beállításokat írja ki — név, megjelenítési opciók, hangok, asztalpreferenciák, vakok, stílusok — az import pedig egy asztali fájlt alkalmaz itt. Az ezen kliens által nem ismert beállítások érintetlenül maradnak a fájlban.'] },
        { id: 'sync', t: 'Beállítások, amelyek követnek',
          b: ['Ha fiókkal játszol, a beállításaid, a témád, a billentyűkiosztásaid, a nyelved és a gyakorlótrófeáid szinkronizálódnak: változtass valamit az egyik eszközön, és a következő eszköz, amelyen bejelentkezel, átveszi. A trófea-előrehaladás egyesül, sosem íródik felül, így két eszközön játszva mindig mindkettő legjobbja marad meg.'] },
        { id: 'updates', t: 'Maradj naprakész',
          b: ['A kliens magát frissíti: amikor új verzió jelenik meg, egy szalag újratöltésre hív (vagy írd be a /update parancsot a csevegésbe a kézi ellenőrzéshez). Időnként megjelenhet egy kis termékkérdőív, amely egy funkcióról kérdezi a véleményed — a részvétel önkéntes, a kérdőívek pedig teljesen kikapcsolhatók a Speciális beállítások \u2192 Közösség alatt.'] },
        { id: 'fkeys', t: 'Hivatalos billentyűparancsok',
          b: ['A hivatalos PokerTH funkci\u00f3billenty\u0171k j\u00e1t\u00e9k k\u00f6zben m\u0171k\u00f6dnek \u2014 az Alt+S mindenhol m\u0171k\u00f6dik:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (a sorrend a beállításokban megfordítható)'],
            ['F5', 'Lapjaid megmutatása (amikor lehetséges)'],
            ['F6 / F7 / F8', 'Kézi \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Kézi \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Csevegés \u00b7 Napló \u00b7 Esélypanel'],
            ['Alt+S', 'Beállítások — bárhol az alkalmazásban, nem csak játék közben'],
            ['F11', 'Teljes képernyő']],
          note: 'A gyorsbillentyűkhöz fizikai billentyűzet kell. Macen az F billentyűk alapból a médiát vezérlik: tartsd lenyomva az Fn-t (vagy kapcsold be a macOS beállításaiban az \u201eF1, F2 stb. billentyűk használata szabványos funkcióbillentyűként\u201d opciót). iPhone-on a teljes képernyőt az iOS korlátozza — az alkalmazás PWA-ként való telepítése ugyanazt a teljes képernyős élményt adja.' },
        { id: 'webkeys', t: 'Webes betűbillentyűk',
          b: ['Webes kiegészítés: az egybetűs billentyűk és az Alt+T is akciókat indít, és mind átrendelhető a Speciális beállítások → Gyorsbillentyűk alatt:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Statisztikapanel'],
            ['Esc', 'A legfelső ablak bezárása (az Android Vissza gombja is)']],
          note: 'Androidon a rendszer Vissza gombja/mozdulata az ablakokat zárja be, mint az Esc, ahelyett hogy kilépne a játszmából (a beállításokban konfigurálható). Az iOS-nek nincs megfelelő rendszergombja — használd minden ablak \u2715 jelét.' }
      ]
    }
  ]
};
