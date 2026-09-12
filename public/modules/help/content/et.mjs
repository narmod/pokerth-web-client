// ── help/content/et.mjs — Estonian help corpus ──────────────────────────────
//
// Structure: chapters[] → { id, icon, title, sections[] }.
// Section: { id, t (title), b (paragraphs[]), list (bullets[]), keys ([kbd,
// label][]) }. Plain text only — the renderer escapes everything.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) stay in English,
// as everywhere else.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Alustamine',
      sections: [
        { id: 'modes', t: 'Kolm viisi mängimiseks',
          b: ['Vali sisselogimise ekraanil, kuidas soovid mängida.'],
          list: [
            'Internet — mängi veebis ametlikus pokerth.net serveris koos edetabelitega. Vajalik on pokerth.net konto; registreeru tasuta pokerth.net-is.',
            'Kohalik / treening — mängi võrguvabalt bottide vastu. Midagi ei ole vaja seadistada, töötab ilma ühenduseta ja avab edenedes auhindu.',
            'LAN / pühendatud server — ühendu privaatse PokerTH serveriga oma kohtvõrgus või oma masinas.'] },
        { id: 'lan', t: 'LAN / pühendatud server',
          b: ['Kolmas režiim ühendub iga PokerTH serveriga, mida sina või sõber haldab \u2014 koduvõrgus, privaatses VPS-is, ükskõik kus. Sisesta serveri aadress ja port, märgi TLS, kui server kasutab krüptitud porti, ja logi sisse hüüdnimega (külalisena pääseb ligi, kui server seda lubab). Kõik lauas käitub seejärel täpselt nagu ametlikus serveris.'] },
        { id: 'famboard', t: 'Pere edetabel',
          b: ['Ainult privaatserverites ja LAN-mängudes peab klient hüüdnime kaupa kogu aja statistikat \u2014 mängitud ja võidetud käed ja mängud, suurim võit, parim seeria \u2014 ning jagab seda serveri kaudu, nii et iga seade laua ümber näeb sama edetabelit. pokerth.net mänge ei jälgita kunagi sel viisil ja treeningrežiimi statistikat hoitakse täiesti eraldi.', 'Neis mängudes avab auhinnanupp edetabeliakna selle LAN-vahekaardil: kõik mängijad, sorditavad mitme kriteeriumi järgi.'] },
        { id: 'language', t: 'Keel',
          b: ['Liides on saadaval 47 keeles. Muuda seda millal tahes täpsemates valikutes (hammasrattamenüü) jaotises Kasutajaliides. Pokkeri käiguterminid (Fold, Check, Call, Bet, Raise, All-In) jäävad kokkuleppeliselt inglise keelde, täpselt nagu töölauakliendis.'] },
        { id: 'pwa', t: 'Paigalda rakendusena',
          b: ['See klient on progressiivne veebirakendus (PWA): saad selle brauseri menüüst (või päises olevast paigaldusnupust) paigaldada ja saada täisekraanirakenduse oma ikooniga. Pärast paigaldamist käivitub see kohe ja treeningrežiim töötab täielikult võrguvabalt.'],
          note: 'Androidis ja töölaua Chrome\u2019is/Edge\u2019is teeb paigaldusnupp kõik ära. iPhone\u2019is/iPadis lubab Apple paigaldamist ainult Safari kaudu: jagamisnupp \u2192 \u201cLisa avakuvale\u201d \u2014 klient näitab neid samme vajaduse korral. Nupp kaob, kui rakendus on paigaldatud.' },
        { id: 'platforms', t: 'Platvormid ja brauserid',
          b: ['Klient töötab igas kaasaegses brauseris igas süsteemis \u2014 Windows, macOS, Linux, Android, iOS. Mõni funktsioon tugineb uuematele brauseri API-dele; kui API puudub, peidab funktsioon end ära või selgitab põhjust, selle asemel et katki minna. Peamised erinevused, mida teada:'],
          list: [
            'Chrome / Edge (töölaud): kõik töötab, sealhulgas .pdb-logi kirjutamine kausta.',
            'Firefox: kõik peale .pdb-logi kirjutamise kausta (API ei ole veel saadaval).',
            'Safari / iOS: paigaldamine käib jagamisnupu \u2192 „Lisa avakuvale“ kaudu; vibratsiooni ei ole; iPhone\u2019is on täisekraan piiratud; heli käivitub pärast sinu esimest puudutust.',
            'Android: täielik tugi Chromiumi-põhistes brauserites, sealhulgas vibratsioon ja tagasi-nupu käitumine.'] },
        { id: 'avatar', t: 'Hüüdnimi ja avatar',
          b: ['Vali enne ühendumist sisselogimise ekraanil oma hüüdnimi ja avatar. pokerth.net-is on sinu hüüdnimi sinu konto nimi; avatare jagatakse teiste mängijatega avatariserveri kaudu.', 'Sinu avatar saadetakse ühendumisel ja kõik mängijad näevad sedasama. Kui muudad seda ühenduse ajal, rakendub uus avatar järgmisest ühendusest. Algustähte (Aa) ei saadeta: teised mängijad näevad vaikimisi avatari.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pokkeri reeglid',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em lühidalt',
          b: ['PokerTH-s mängitakse No-Limit Texas Hold\u2019emi. Iga mängija saab kaks isiklikku kaarti (hole-kaardid). Seejärel jagatakse laua keskele avatuna viis ühist kaarti. Potti võidab parim viiekaardiline käsi, mis on moodustatud sinu kahe kaardi ja viie ühise kaardi suvalisest kombinatsioonist.'] },
        { id: 'blinds', t: 'Blindid ja jagaja nupp',
          b: ['Enne iga kätt panevad potti alguse kaks sundpanust: väike blind ja suur blind, mille panevad jagaja nupust vasakul istuvad kaks mängijat. Nupp liigub pärast iga kätt ühe koha võrra päripäeva, nii et blinde maksavad kõik kordamööda. Mängu käigus blindid korrapäraste ajavahemike järel tõusevad.',
              'Lauas on nupp ja blindid tähistatud märgistega: D (jagaja), SB (väike blind), BB (suur blind).'] },
        { id: 'streets', t: 'Neli panustamisvooru',
          list: [
            'Pre-flop — pärast hole-kaartide jagamist algab esimene panustamisvoor suurest blindist vasakul.',
            'Flop — avatakse kolm ühist kaarti, seejärel järgneb panustamisvoor.',
            'Turn — neljas ühine kaart, seejärel järgmine panustamisvoor.',
            'River — viies ja viimane ühine kaart, seejärel viimane panustamisvoor.'],
          b: ['Panustamisvoor lõpeb, kui kõik käes olevad mängijad on potti pannud sama summa (või on all-in).'] },
        { id: 'actions', t: 'Mida saad oma käigul teha',
          list: [
            'Fold — loobu käest. Sinu kaardid lähevad ära ja sa ei võistle enam poti pärast.',
            'Check — anna käik edasi ilma panustamata. Võimalik ainult siis, kui midagi ei ole maksta.',
            'Call — maksa praegune panus.',
            'Bet — ava panustamine, kui keegi ei ole selles voorus veel panustanud.',
            'Raise — tõsta olemasolevat panust. Väikseim tõstmine võrdub eelmise panuse või tõstmisega.',
            'All-In — pane mängu kõik oma žetoonid. Jääd käes püsima kuni selle summani, mille katsid.'] },
        { id: 'showdown', t: 'Showdown ja kõrvalpotid',
          b: ['Kui pärast riveri panustamisvooru on alles rohkem kui üks mängija, näidatakse käed ette ja võidab parim käsi \u2014 võitnud kombinatsioon kuvatakse ühiste kaartide all. Kui mängija on all-in väiksema summa eest kui täispanused, luuakse kõrvalpotid: iga mängija saab võita ainult selle osa potist, millesse ta panustas. Võrdsed käed jagavad poti.',
            'Kõik ei pea kaarte näitama: alates viimasest panustajast või tõstjast avatakse käsi ainult siis, kui see lööb juba nähtaval olevat. Igaüks, kellel on õigus kaardid ära anda, hoiab need varjatuna ja saab nupu Näita, et need siiski avada.'] },
        { id: 'hands', t: 'Käte tugevus',
          b: ['Nõrgimast tugevaimani:'],
          list: [
            '1. Kõrgeim kaart — kombinatsioon puudub; otsustab kõrgeim kaart.',
            '2. Paar — kaks sama tugevusega kaarti.',
            '3. Kaks paari — kaks erinevat paari.',
            '4. Kolmik — kolm sama tugevusega kaarti.',
            '5. Rida — viis järjestikust kaarti (äss loeb kõrge või madalana).',
            '6. Mast — viis sama masti kaarti.',
            '7. Täismaja — kolmik pluss paar.',
            '8. Neljik — neli sama tugevusega kaarti.',
            '9. Mastirida — rida, kõik ühes mastis.',
            '10. Kuninglik mastirida — kümnest ässani, kõik ühes mastis. Parim võimalik käsi.'] }
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Mänguekraan',
      sections: [
        { id: 'actionbar', t: 'Käiguriba',
          b: ['Kui on sinu kord, süttib all olev käiguriba kuni nelja nupuga: Fold (punane), Check / Call (sinine), Bet / Raise (roheline \u2014 esile tõstetud põhikäik) ja All-In (tumepunane). Nupp Check / Call näitab täpset maksmisele kuuluvat summat; Bet / Raise näitab summat, mille kavatsed panna. Pärast riverit võib All-In muutuda nupuks Näita, millega oma kaardid avada.'] },
        { id: 'betctl', t: 'Panuse valimine',
          b: ['Määra tõstmise summa numbriväljal, liuguriga või kiirnuppudega 1/3 \u00b7 1/2 \u00b7 pott (osad praegusest potist). Summad ümardatakse automaatselt ja hoitakse lubatud väikseima ja suurima tõstmise vahel. Kui mõtled pigem suurtes blindides, kuvab üks valik kõik summad BB-des žetoonide asemel.'] },
        { id: 'preselect', t: 'Käigu eelvalimine',
          b: ['Enne oma korda saad käigu ette valmis panna: puuduta nuppu ja see saab kuldse ääre koos väikese kuldse täpiga. Kui sinu kord kätte jõuab, tehakse käik kohe. Ette valitud Fold muutub automaatselt Check\u2019iks, kui check on tasuta \u2014 sa ei loobu kunagi asja ees, teist taga. Eelvalikud lähtestatakse iga uue käe, vooruvahetuse ja showdown\u2019i puhul ning tühistatakse, kui olukord muutub (näiteks kui maksmisele kuuluv summa muutub).'] },
        { id: 'automodes', t: 'Automaatrežiimid',
          b: ['Käigunuppude kõrval olev rippmenüü pakub kolme mängurežiimi: käsitsi, automaatne Check/Call ja automaatne Check/Fold. Automaatrežiimid mängivad sinu eest, kuni lülitad tagasi \u2014 iga käsitsi tehtud klõps käigul viib kohe käsitsirežiimi.'] },
        { id: 'readtable', t: 'Laua lugemine',
          b: ['Iga mängija kast näitab avatari, nime, žetoone ja praegust panust. Jagaja ja blindid on tähistatud märgistega D / SB / BB. Kastil olev värviline märgis näitab mängija viimast käiku; õhuke sinine riba loendab tema mõtlemisaega. Käigul oleva mängija kast helendab; sinu enda kast saab sinu käigul pulseeriva kuldse raami.',
              'Laua kohal olev olekuriba näitab kogupotti, praeguse vooru panuseid, faasi (Pre-flop, Flop, Turn, River) ning mängu ja käe numbrit. Loobunud mängijatel on läbipaistvad kaardid; välja langenud mängijad on tuhmid. Käe lõpus võib võitja aken kokku võtta, kes mida võitis \u2014 selle saab valikutes välja lülitada.'] },
        { id: 'seatlayout', t: 'Istekohtade paigutus',
          b: ['Veebilisana saab mängijakastide paigutust valida täpsemates valikutes \u2192 Istekohad: automaatne järgib ametlikku klienti (püstpaigutuses kindlad kohad, rõhtpaigutuses arvutatud ellips), samuti saab sundida püst- või rõhtpaigutuse \u2014 ning kohandatud paigutus laseb sul iga istekoha ise paika panna: avaneb muutmisrežiim, kus lohistad iga kasti täpselt sinna, kuhu soovid, ja paigutus salvestatakse.'] },
        { id: 'zoom', t: 'Laua suum (telefonid)',
          b: ['Väikestel ekraanidel suurendavad suurendusnupud lauda (2\u00d7) ja vaadet saab sõrmega liigutada \u2014 sinu enda kast ja käiguriba jäävad paigale. Vaade järgib automaatselt aktiivset istekohta ja suumib showdown\u2019il ülevaate saamiseks tagasi välja. Selle saab täpsemates valikutes välja lülitada.'],
          note: 'Telefonides ja tahvelarvutites on brauseri enda näpistussuum vaikimisi blokeeritud, et suumiliigutus ei käivituks kogemata keset kätt; kui eelistad, luba see täpsemates valikutes \u2192 Kasutajaliides.' },
        { id: 'protections', t: 'Piilumisvastane ja juhusliku Call\u2019i kaitse',
          b: ['Kaks valikulist kaitset: piilumisvastane hoiab sinu enda kaardid varjatuna, kuni neid puudutad (kasulik, kui keegi näeb sinu ekraani), ja juhusliku Call\u2019i kaitse blokeerib nupu Call korraks kohe pärast suurt tõstmist, nii et väiksemale maksmisele mõeldud puudutus ei taba kogemata tõstetud summat. Mõlemad on täpsemates valikutes.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Teabepaneel',
      sections: [
        { id: 'open', t: 'Paneeli avamine',
          b: ['Mängu ajal avaneb teabepaneel päisest (või klahvidega Alt+L / Alt+I) ja sellel on kolm vahekaarti: Logi, Šansid ja Statistika. Telefonides hõljub see laua kohal; suurematel ekraanidel on see lohistatav ja muudetava suurusega aken \u2014 liigutamiseks haara pidemest \u28ff, suuruse muutmiseks servadest. Selle asukoht jäetakse meelde.'] },
        { id: 'log', t: 'Mängulogi',
          b: ['Vahekaart Logi salvestab kogu mängu käsi käe haaval: blindid, iga käik koos summadega, avatud kaardid ja võitjad, kiireks lugemiseks värvidega eristatud. Ekspordinupp salvestab logi failina, kui soovid sessiooni hiljem üle vaadata.'] },
        { id: 'odds', t: 'Šansid (šansside monitor)',
          b: ['Vahekaart Šansid näitab sinu praeguse käe kohta jooksvat tõenäosust jõuda igasse kümnest kätekategooriast \u2014 kõrgeimast kaardist kuningliku mastireani \u2014 igaüks koos ikooni, protsendi ja ribaga. Pärast loobumist muutub kuva halliks. See kasutab ainult sinu enda kaarte ja ühiseid kaarte: see ei näe midagi, mida vastased ei näita.'] },
        { id: 'journal', t: 'Käte logid ja logiaken',
          b: ['Lisaks jooksvale logile salvestatakse iga sinu mängitud käsi kohapeal sinu brauserisse, samas vormingus nagu ametliku kliendi .pdb-logifailid. Logiaken (täpsemad valikud \u2192 Logisõnumid \u2192 Halda logisid\u2026) loetleb sinu sessioonid ja laseb nendega töötada: vaata sessiooni eelvaadet koos otsingu ja esiletõstmisega, filtreeri mängu järgi, ekspordi HTML-i või lihttekstina, salvesta töötlemata .pdb-fail või impordi töölauakliendi salvestatud .pdb. Sessioone saab kustutada ükshaaval või kõik korraga (kinnitusega) ning automaatne säilitusseade võib hoida ainult viimased 7, 30, 90, 180 või 365 päeva. Ise imporditud logisid ei eemaldata kunagi automaatselt. Teine seade piirab säilitatavate sessioonide arvu ja loendi veeru saab lohistades laiemaks teha.',
              'Mitme sessiooni korraga koristamiseks muudab nupp Vali… loendi märkeruutudeks: märgi need, mida soovid kaotada, ja nupp Kustuta eemaldab kogu hulga pärast üht kinnitust. Arvutis saad ka Ctrl (⌘) + klõpsuga sessioone ükshaaval lisada või Shift + klõpsuga võtta terve vahemiku.',
              'Nupp Analüüsi käivitab sessiooni käteanalüüsi ja võib saata logi pokerth.net analüüsiteenusesse. Kõik jääb sinu seadmesse, kui sa seda ise ei ekspordi ega üles laadi.'] },
        { id: 'logopts', t: 'Logimise valikud',
          b: ['Täpsemates valikutes \u2192 Logisõnumid saad logimise sisse või välja lülitada ja valida kirjutamise sageduse, samade kolme seadega nagu töölauakliendis: pärast iga käiku, pärast iga kätt (vaikimisi) või pärast iga mängu. Teine valik kirjutab .pdb-faili sinu valitud kausta ja hoiab seda selle sagedusega ajakohasena ning veel korra lehelt lahkumisel, nii et mõni muu tööriist saab mängul otse järge hoida.'],
          note: 'Kohalikku kausta kirjutamine vajab File System Access API-t: ainult töölaua Chrome, Edge ja Opera. Mujal selgitab valik end ise ja käsitsi eksport logiaknast jääb alles. Brauser saab faili ainult asendada, mitte kunagi lõppu lisada, nii et .pdb-d lugev tööriist peaks selle pärast iga muudatust uuesti avama.' },
        { id: 'assist', t: 'Abi (käe tugevus)',
          b: ['Vahekaardi Šansid ülaosas loeb abiriba sinu käe sinu eest ette. Enne floppi nimetab see sinu algkäe ja hindab seda tärnidega; alates flopist näitab see sinu praegust parimat kombinatsiooni ja pärast kiiret simulatsiooni hinnangulist käe võitmise tõenäosust protsentides koos värviskaalaga punasest (nõrk) roheliseni (tugev). Nagu šansside monitor, kasutab see ainult teavet, mida sa näed.',
              'Täpsemates valikutes \u2192 Istekohad on saadaval kaks kuvamisstiili: segmendid (kümme plokki) või klassikaline edenemisriba. Kogu abifunktsiooni saab välja lülitada täpsemates valikutes \u2192 Abi.'] },
        { id: 'assistwin', t: 'Abi hõljuva vidinana',
          b: ['Abiploki saab paneelist lahti haakida omaette väikesesse alati pealmisse aknasse: kasuta ploki lahtihaakimise nuppu ning liiguta ja muuda selle suurust kus tahes laua kohal \u2014 mugav, kui tahad käe tugevusel silma peal hoida ilma tervet paneeli avamata. Dokkimisnupp paneb selle tagasi vahekaardile Šansid ja selle asukoht jäetakse meelde. Paneeli sees laseb abi ja šansside vaheline lohistuspide ruumi nende kahe vahel jagada.'] },
        { id: 'stats', t: 'Statistika',
          b: ['Vahekaart Statistika jälgib sinu sessiooni: mängitud käed, nähtud flopid, showdown\u2019id, võiduprotsendid ja muu. Statistika jälgimise saab täpsemates valikutes välja lülitada.'] },
        { id: 'hud', t: 'Statistika HUD istekohtadel',
          b: ['HUD lisab iga mängija istekoha kõrvale väikese statistikakasti, mis on koostatud sinu logidesse salvestatud kätest: vaadeldud käte arv, seejärel VPIP (kui sageli ta paneb pre-flop\u2019il vabatahtlikult raha sisse), PFR (pre-flop\u2019i tõstmised) ja AF (agressiivsustegur), värvidega passiivsest agressiivseni. Nende all võtab märgis mängija lihtsate sõnadega kokku \u2014 kitsas-passiivne, lai-agressiivne jne \u2014 kõrval väike ketas, mille valgustatud veerand loeb vasakult paremale kitsast laiani ja alt üles passiivsest agressiivseni. Märgis kuvatakse juba esimesest käest, kuid jääb tuhmiks kuni 25 käeni, mil see muutub usaldusväärseks. Puuduta kasti, et avada üksikasjalik hüpikaken kõigi numbritega (3-bet, jätkupanus, 3-beti ees loobumine, varastamiskatsed, showdown\u2019i määrad\u2026), ja lohista kasti, kui see midagi katab.',
              'HUD teab ainult seda, mida sa oled oma laudades näinud \u2014 see loeb sinu kohalikke käte logisid, nii et logimine peab olema sisse lülitatud ja numbrid muutuvad tähendusrikkaks piisava arvu käte järel. Vaikimisi on see väljas: lülita sisse täpsemates valikutes \u2192 Abi.'] },
        { id: 'handsbtn', t: 'Käte kombinatsioonide ülevaade',
          b: ['Kalevil olev pokkerikäte ikoon avab igal ajal kiirülevaate kümnest kombinatsioonist \u2014 õppimisel mugav. Selle saab täpsemates valikutes peita.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Vestlus ja suhtlus',
      sections: [
        { id: 'panels', t: 'Fuajee vestlus ja mänguvestlus',
          b: ['Vestlus on nii fuajees kui ka lauas. Telefonides hõljub mänguvestlus laua kohal; suurematel ekraanidel on see lohistatav ja muudetava suurusega aken. Vestlusnupul olev märgis loendab lugemata sõnumeid.'] },
        { id: 'typing', t: 'Kirjutamise abid',
          list: [
            'Tab täiendab hüüdnime \u2014 vajuta uuesti Tab, et vastete vahel liikuda.',
            '\u2191 / \u2193 sirvivad sinu enda sõnumite ajalugu.',
            'Emoji-nupp avab täieliku valiku; kooloni : kirjutamine pakub kirjutamise ajal ka emote\u2019e.'] },
        { id: 'emotes', t: 'Emote\u2019id ja smailid',
          b: ['Vestlus teisendab emote\u2019ide lühikoode täpselt nagu ametlik töölauaklient: kirjuta nimi kooloonide vahele ja sellest saab emoji \u2014 :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 toetatud on üle 1900 koodi (kogu GitHubi komplekt). Teisendatakse ka klassikalised tekstismailid: :-) ;) :D xD :P <3 ja umbes kaheksakümmend muud.',
              'Kooloni : kirjutamine avab soovituste hüpikakna, mis täiendab koodi kirjutamise ajal (\u2191/\u2193 valimiseks, Tab või Enter kinnitamiseks). Emojide teisendamise saab täielikult välja lülitada täpsemates valikutes \u2192 Vestlus.'] },
        { id: 'commands', t: 'Vestluskäsud',
          b: ['Vestlus mõistab kaldkriipsuga käske. Kaks neist on teistele nähtavad:'],
          keys: [
            ['/me <tekst>', 'Tegevussõnum, kuvatakse kujul \u201c* sinunimi tekst\u201d'],
            ['/emoji <emoji>', 'Esitab emoji-reaktsiooni (sama, mida saadab reaktsioonide valija)']] },
        { id: 'diagcmds', t: 'Diagnostikakäsud',
          b: ['Kõik ülejäänu on kohalik: vastuseid näed ainult sina ja lauda ei saadeta midagi. Kirjuta /help, et need kõik loetleda. Kõige kasulikumad:'],
          keys: [
            ['/help', 'Loetle kõik käsud'],
            ['/update', 'Kontrolli uut versiooni ja värskenda'],
            ['/lang <kood>', 'Vaheta keelt (nt /lang et)'],
            ['/sound on|off', 'Lülita mänguhelid sisse või välja'],
            ['/zoom', 'Lülita laua suurendus sisse või välja'],
            ['/clear', 'Tühjenda vestlus kohapeal'],
            ['/table', 'Praeguse mängu teave (blindid, mängijad, žetoonid)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Kliendi oleku, võrgu ja kaadrisageduse diagnostika'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Täpsem silumine (kaardid, protokoll, heli, salvestusruum, istekohad)'],
            ['/copy', 'Kopeeri viimase käsu vastus lõikelauale']] },
        { id: 'privatemsg', t: 'Privaatsõnumid',
          b: ['Kirjuta ühele mängijale, ilma et kogu fuajee kaasa loeks. Mängijate loendis nime kõrval olev ümbrik avab temaga vestluse; fuajee päises olev ümbrik avab uuesti viimase. Vestlusi hoitakse selles seadmes ja need on tagasi tulles alles, nii et päevi hiljem jätkatud vestlusel on oma ajalugu kaasas \u2014 ümbrikul olev punane loendur näitab, mida sa ei ole veel lugenud, ja akna pealkirjas olev prügikast kustutab vestluse jäädavalt.'],
          keys: [
            ['/msg <hüüdnimi> <tekst>', 'Saada fuajee vestlusest privaatsõnum'],
            ['/msg "<tühikutega hüüdnimi>" <tekst>', 'Sama, kui hüüdnimes on tühikud']],
          note: 'Sõnumid on piiratud 128 märgiga. Server ei toimeta privaatsõnumit kohale mängijale, kes istub käimasolevas lauas, ja ajalugu hoitakse ainult selles brauseris \u2014 see ei järgne sulle teise seadmesse.' },
        { id: 'reactions', t: 'Emoji-reaktsioonid',
          b: ['Reaktsiooninupp avab 30 animeeritud reaktsiooni valiku (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026), mis esitatakse efektiga sinu istekoha kohal ja on nähtavad kõigile lauas \u2014 sealhulgas töölaua kliendi mängijatele. Reaktsioonid saab täpsemates valikutes täielikult välja lülitada.'] },
        { id: 'translate', t: 'Kõigist arusaamine',
          b: ['Kui vestluse tõlge on sisse lülitatud, ilmub tõlkenupp reale, mille kohal on sinu kursor \u2014 või puuteekraanil reale, mida puudutad \u2014 ja esitab selle sõnumi sinu keeles brauseri sisseehitatud tõlkija abil. Selle saab püsivalt igale reale kuvada täpsemates valikutes \u2192 Vestlus, kus asub ka tavalisi lauaväljendite lühendeid (gg, nh, utg\u2026) selgitav kohtspikker.'],
          note: 'Tõlkimine kasutab Google Translate\u2019i teenust ja töötab igas brauseris \u2014 vaja on ainult internetiühendust. Sõnum saadetakse tõlketeenusesse ainult siis, kui puudutad selle tõlkenuppu, mitte kunagi automaatselt.' },
        { id: 'social', t: 'Mängijad: profiil, kutse, eiramine',
          b: ['Puuduta mis tahes mängijat \u2014 lauas või fuajee loendis \u2014 et avada tema kaart: profiil ja statistika, kutsu ta oma mängu või eira teda (tema vestlussõnumid peidetakse; eiramise saab igal ajal tagasi võtta). Kutsumise/eiramise eelse kinnituse saab valikutes sisse lülitada.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Fuajee ja mängud',
      sections: [
        { id: 'list', t: 'Mängude loend',
          b: ['Fuajee loetleb serveri kõik lauad. Iga kirje näitab mängijate arvu, mängu tüüpi, tabalukku, kui on vaja parooli või kutset, ning olekumärgist: „Ootel“ (roheline \u2014 mäng ei ole alanud, saad liituda, kui koht on vaba), „Käimas“ (soe värv \u2014 vaadatav otse, kui pealtvaatajad on lubatud) ja „Suletud“ (tuhm). Täis laud näitab lihtsalt täisarvu, näiteks 10/10; märgiste värvid järgivad aktiivset teemat.',
              'Filtri rippmenüü kitsendab loendit täpselt nagu töölauakliendis, iga valik on eelmisest rangem: ainult avatud mängud \u2192 lisaks täis laudade peitmine \u2192 seejärel ainult mitteprivaatsed, ainult privaatsed või ainult edetabelimängud. Sinu valik jäetakse meelde. Otsinguväli leiab mängu nime järgi ja mängijate nupp avab kõigi võrgus olijate loendi, mis on otsitav ja sorditav.'] },
        { id: 'join', t: 'Liitumine ja jälgimine',
          b: ['Vali avatud mäng ja liitu sellega \u2014 tabalukk tähendab, et vaja on parooli. Käimasolevaid mänge, mis lubavad pealtvaatajaid, saab otse jälgida: näed lauda ja vestlust, kuid hole-kaardid jäävad varjatuks ja sa ei saa käike teha.'] },
        { id: 'gameinfo', t: 'Mängu teave',
          b: ['Enne liitumist näitab mängu teabekaart kõike, mis lauda määratleb: mängu tüüp, blindid ja nende tõusuviis (kahekordistumine või käsitsi koostatud loend), algraha, käigu ajalimiit, kätevaheline viivitus ning kes juba laua taga istuvad.'] },
        { id: 'create', t: 'Mängu loomine',
          b: ['Loo oma laud: nimi, mängijate arv, algraha, esimene väike blind ja tõusugraafik, käigu ajalimiit ning kas pealtvaatajad on lubatud. Mängutüüpe on neli: tavaline (kõigile), ainult registreeritud mängijatele, ainult kutsutuile ja edetabelimäng (läheb ametlikku edetabelisse \u2014 parooli seal lubatud ei ole). Lemmikseaded saab salvestada ja uuesti laadida.'] },
        { id: 'invites', t: 'Kutsed',
          b: ['Mängijad võivad kutsuda sind oma lauda; saad teate, mille võid vastu võtta või tagasi lükata. Kutse saamine on ainus viis pääseda ainult kutsutuile mõeldud mängu.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Sinu konto',
          b: ['Ametlik internetiserver on pokerth.net. Seal mängimiseks on vaja tasuta pokerth.net kontot \u2014 registreeru veebilehel ja logi siin sisse sama hüüdnime ja parooliga. See veebiklient ühendub täpselt sama serveriga nagu töölauaklient: samad kontod, samad lauad, samad edetabelid, ja sa võid istuda lauda koos töölauamängijatega.'] },
        { id: 'ranked', t: 'Edetabelimängud ja hooajad',
          b: ['Edetabelimängu tüüpi mängud lähevad ametlikku hooaja edetabelisse. Sinu rakendusesisene profiil näitab, millal liitusid, praeguse hooaja kohta, skoori, keskmist ja mängitud mänge ning sinu viimaseid tulemusi. Tavalised (edetabelivälised) mängud on lihtsalt lõbu pärast ega muuda midagi.'] },
        { id: 'rankhow', t: 'Kuidas edetabelit arvutatakse',
          b: ['Igas edetabelimängus annab sinu lõppkoht punkte: 15 esimese eest, seejärel 9, 6, 4, 3, 2 ja 1 kuni seitsmendani; kaheksas kuni kümnes ei saa midagi. Üks laud jagab seega kokku 40 punkti.',
              'Sinu skoor ei ole nende punktide summa, vaid keskmine mängu kohta, mida tempereerib mängitud mängude arvuga kasvav tegur: käputäiest headest tulemustest ei piisa tipus püsimiseks, vaja on ka regulaarsust — mida rohkem mängid, seda lähemale jõuab sinu skoor sinu tegelikule keskmisele. Hooaeg kestab kvartali: vahetusel arhiveeritakse kõik ja loendurid algavad nullist, möödunud hooajad jäävad kättesaadavaks. Mängus näitab poodiuminupp sinu laua mängijate hooaja edetabelit.'],
          note: 'Punktiskaala ja täpse valemi määrab pokerth.net edetabeliserver ning need võivad muutuda; aluseks on lehel olevad leheküljed.' },
        { id: 'rankings', t: 'Edetabelilehed',
          b: ['Edetabeli sissepääs avab ametliku PokerTH edetabeli, mis on mängija järgi otsitav, koos kogukondade edetabelitega (BBC, WEC). Kui edetabelid sind ei huvita, saab sissepääsu peita täpsemates valikutes \u2192 Kogukond.'] },
        { id: 'cups', t: 'Kogukonna karikad: BBC ja WeCup',
          b: ['Kaks kogukonda korraldavad pokerth.net-is oma võistlusi, kummalgi oma leht ja edetabel. Best Brainies Cup (BBC) on 2013. aastal sündinud astmeturniir: liigud astmelt 1 astmele 4 ja uus hooaeg algab pärast iga 4. astme mängu, kui karikas välja antakse. WeCupil (WEC) on oma, palju laiem skaala — 75 punkti esimese koha eest, seejärel 45, 30, 20… — ja selle skoor normaliseerib sinu keskmise sinu mängitud mängude arvu suhtes võrreldes teiste liikmetega.',
              'Mõlemad edetabelid avanevad auhinnanupust, PokerTH edetabeli kõrvalt. Nende võistluste lauaseaded on mängu loomisel saadaval eelseadetena (BBC 1. kuni 4. aste, WEC, WEC kuufinaal ja WEC suurfinaal), nii et saad samadel tingimustel harjutada. Osalemiseks tuleb registreeruda vastava karika lehel.'],
          note: 'Kui karikad ei ole sinu teema, saab selle sisu ühe korraga peita täpsemates valikutes → Kogukond.' },
        { id: 'forumcups', t: 'Foorumi karikad ja sündmused',
          b: ['pokerth.net foorum korraldab ka Monthly Cupi, igakuist sarja, kus mängijad jaotatakse kuld-, hõbe- ja pronkslaudadesse, enne kui kuu meister kroonitakse, ning aasta jooksul toimuvaid ühekordseid erikarikaid.',
              'Registreerimised, ajakavad, lauaseaded ja tulemused avaldatakse foorumis ning mänge mängitakse ametlikus serveris nagu kõiki teisi. Tulemuste jälgimiseks piisab pokerth.net kontost; karikale registreerumine käib vastava foorumiteema kaudu.'] },
        { id: 'forumnews', t: 'Foorumi uudised fuajees',
          b: ['Fuajee päises olev ajalehenupp avab pokerth.net foorumi viimased postitused, üks kirje teema kohta, igal foorumil oma värv. Nupul olev märgis loendab lugemata postitusi; postituse avamine (uus vahekaart) märgib selle loetuks ja „Märgi kõik loetuks“ tühjendab kõik korraga.',
              'See on veebi lisa: nupu saab peita täpsemates valikutes („Foorumi nupp fuajee päises“).'] },
        { id: 'avatars', t: 'Avatarid ja lipud',
          b: ['pokerth.net-is jagatakse sinu avatari teistele mängijatele avatariserveri kaudu ning mängijakastidel saab kuvada väikest riigilippu. Mõlemad on valikulised ja valikutes seadistatavad.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Treeningrežiim',
      sections: [
        { id: 'what', t: 'Mis see on',
          b: ['Kohalik / treeningrežiim on täisväärtuslik mäng arvutivastaste vastu: ühendust ei ole vaja, kontot ei ole vaja, kaalul ei ole midagi. Kui rakendus on paigaldatud (või lihtsalt korra külastatud), töötab see täiesti võrguvabalt \u2014 ideaalne mängu õppimiseks, liidese proovimiseks või lennurežiimis aja veetmiseks.'] },
        { id: 'setup', t: 'Mängu seadistamine',
          b: ['Vali vastaste arv, algraha, blindid ja tõusugraafik ning mängu kiirus. Bottide koosseisu ja raskusastet saab kohandada täpsemates valikutes \u2192 Kohalik mäng \u2014 leebetest vastastest karmima, segase koosseisuga lauani.'] },
        { id: 'trophies', t: 'Auhinnad',
          b: ['Treeningrežiimil on oma edenemine: mängides avaneb 28 auhinda kuues kategoorias (edenemine, oskus, stiil, formaadid, lõbu ja üks salajane) \u2014 mängitud käed, võidetud mängud, suured blufid, erilised käed ja muu. Sinu auhindade edenemine on kumulatiivne ja liidetakse seadmete vahel, kui konto seadete sünkroonimine on aktiivne.'] },
        { id: 'learn', t: 'Hea koht õppimiseks',
          b: ['Kõik teistest peatükkidest töötab ka siin: šansside monitor, abi kuvamine, eelvalimine, kiirklahvid. Treeningrežiim on parim koht neid surveta proovida, enne kui suundud pokerth.net-i.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stiil ja heli',
      sections: [
        { id: 'themes', t: 'Teemad',
          b: ['Täpsemate valikute kategooria Stiil kujundab kogu kliendi ümber. Eelseaded seavad ühe puudutusega kõik paika (klassikaline roheline kasiino, ametlik PokerTH välimus\u2026); nende all saab üksikute telgede kaupa eraldi häälestada värvipaletti, laua kalevit ja kaartide esikülgi \u2014 muuda ükskõik millist telge ja sinu segust saab kohandatud teema. Tume, hele või automaatne režiim valitakse jaotises Kasutajaliides ning sinu valikud rakenduvad kohe, igal ekraanil, ja jäetakse meelde.'] },
        { id: 'tablelook', t: 'Lauad, kaardipakid, istekohad',
          b: ['Lisaks teemale saab mitut elementi eraldi vahetada: laua tausta, kaardipakki, kaardi tagakülge (sobita pakiga automaatselt või impordi oma pilt), jagaja ja blindide märgiseid, käigunuppude stiili ning terveid istekohtade pakke, mis kujundavad mängijakastid ümber. Vali kõik täpsemates valikutes \u2192 Stiil; muudatused on lauas kohe näha.'] },
        { id: 'music', t: 'Muusikamängija',
          b: ['Päisemenüüde muusikakirje avab väikese lounge-muusika mängija: vali esitusloendist lugu, esita/peata, eelmine/järgmine, juhuslik järjekord ning korda üht lugu, tervet esitusloendit või mitte midagi. Helitugevus, valitud lugu ja korduse režiim jäetakse meelde. Esitus ei alga kunagi iseenesest \u2014 brauserid nõuavad puudutust \u2014 ja mängija on mängu heliefektidest täiesti sõltumatu.', 'Kaks pöialt loo pealkirja all ütlevad, kas esitatav sulle meeldib. Üks anonüümne hääl seadme kohta, raadiod kaasa arvatud, ja saad seda igal ajal muuta või tagasi võtta; kui haldaja kogusummasid ei avalda, näed ainult oma pöialt.'] },
        { id: 'sounds', t: 'Heliefektid',
          b: ['Mänguhelid on koondatud nelja eraldi lülitatavasse kategooriasse, täpselt nagu töölauakliendis: mängukäigud (kaartide jagamine, Check, Call, Raise, sinu kord\u2026), fuajee vestluse teavitus, võrgumängu teavitused (mängija liitus, mäng valmis) ja blindide tõusu teavitus. Neid kõiki juhib üks helitugevuse liugur täpsemates valikutes \u2192 Heli.'],
          note: 'Kõik brauserid \u2014 eriti iOS \u2014 keelduvad heli esitamast, enne kui oled lehte korra puudutanud. Kui mäng algab vaikselt, äratab üksainus puudutus kus tahes heli ellu; klient parandab heli mootori ka automaatselt, kui iOS selle peatab (sissetulev kõne, taustale viimine\u2026).' },
        { id: 'voice', t: 'Hääl ja vibratsioon',
          b: ['Kaks lisakanalit hoiavad sind kursis ilma ekraanile vaatamata: hääleteated loevad mängusündmused sinu seadme kõnesünteesi abil ette ja telefonides võib lühike vibratsioon sinu käiku märkida. Mõlemad on veebi lisad, seadmest olenevalt vaikimisi väljas või sees, täpsemates valikutes \u2192 Panustamine ja käik.'],
          note: 'Vibratsioon töötab Androidis (Chromiumi-põhised brauserid); Apple ei paku veebilehtedele vibratsiooni API-t, nii et iPhone\u2019id ei saa vibreerida. Hääleteated töötavad kõikjal, kuid saadaolevad hääled ja keeled sõltuvad sinu süsteemist \u2014 klient kasutab parimat leitud vastet.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Valikud ja kiirklahvid',
      sections: [
        { id: 'where', t: 'Kus valikud asuvad',
          b: ['Täpsemad valikud avanevad iga päisemenüü hammasrattakirjest. Need on rühmitatud nagu töölauakliendis: Kasutajaliides, Stiil, Heli, Kohalik mäng, Võrgumäng, Internetimäng, Hüüdnimed / avatarid, Logisõnumid ja Taasta vaikeseaded. Igal veebispetsiifilisel funktsioonil on seal oma lüliti, nii et saad välja lülitada kõik, mida sa ei kasuta.'] },
        { id: 'cfgxml', t: 'Seadete vahetamine töölauakliendiga',
          b: ['Sinu seaded võivad klientide vahel rännata: kategooria Logisõnumid pakub ametliku config.xml faili (\u007e/.pokerth/config.xml, mida kasutavad töölaua- ja QML-klient) eksporti ja importi. Eksport kirjutab ühised seaded \u2014 nimi, kuvamisvalikud, helid, laua eelistused, blindid, stiilid \u2014 ja import rakendab töölauafaili siin. Seaded, mida see klient ei tunne, säilivad failis puutumata.', 'Ka sinu mängijamärkused rändavad failiga kaasa — tekst ja tärnihinnang, kirjutatud kujul, nagu töölauakliendid neid loevad. Värvisildid jäävad sellesse klienti: ametlikus vormingus ei ole nende jaoks välja, nii et import ei puuduta kunagi sinu omi.'] },
        { id: 'sync', t: 'Seaded, mis järgnevad sulle',
          b: ['Kui mängid kontoga, sünkroonitakse sinu valikud, teema, klahviseosed, keel ja treeningu auhinnad: muuda midagi ühes seadmes ja järgmine seade, millest sisse logid, võtab selle üle. Auhindade edenemine liidetakse, mitte ei kirjutata üle, nii et kahes seadmes mängides jääb alati alles mõlema parim.'] },
        { id: 'updates', t: 'Ajakohasena püsimine',
          b: ['Klient uuendab end ise: uue versiooni juurutamisel kutsub riba sind lehte värskendama (või kirjuta vestlusesse /update, et käsitsi kontrollida). Aeg-ajalt võib ilmuda väike tooteküsitlus, et küsida sinu arvamust mõne funktsiooni kohta \u2014 osalemine on vabatahtlik ja küsitlused saab täpsemates valikutes \u2192 Kogukond täielikult välja lülitada.'] },
        { id: 'fkeys', t: 'Ametlikud kiirklahvid',
          b: ['Ametlikud PokerTH funktsiooniklahvid töötavad mängu ajal \u2014 Alt+S töötab kõikjal:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (järjekorra saab valikutes ümber pöörata)'],
            ['F5', 'Näita oma kaarte (kui võimalik)'],
            ['F6 / F7 / F8', 'Käsitsi \u00b7 automaatne Check/Fold \u00b7 automaatne Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Käsitsi \u00b7 automaatne Check/Call \u00b7 automaatne Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Vestlus \u00b7 mängulogi \u00b7 šansside paneel'],
            ['Alt+S', 'Seaded \u2014 kõikjal rakenduses, mitte ainult mängu ajal'],
            ['F11', 'Täisekraan']],
          note: 'Kiirklahvid vajavad füüsilist klaviatuuri. Macis on F-klahvid vaikimisi meediajuhikud: hoia all Fn (või luba macOS-i seadetes \u201cUse F1, F2, etc. as standard function keys\u201d). iPhone\u2019is on täisekraan iOS-i tõttu piiratud \u2014 rakenduse paigaldamine PWA-na annab sama täisekraanikogemuse.' },
        { id: 'webkeys', t: 'Veebi tähtklahvid',
          b: ['Veebi lisana käivitavad käike ka üksiktähed ja Alt+T ning igaühe neist saab ümber seadistada täpsemates valikutes \u2192 Kiirklahvid:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Panus 1/3 \u00b7 1/2 \u00b7 pott'],
            ['Alt+T', 'Statistikapaneel'],
            ['Esc', 'Sulge pealmine aken (ka Androidi tagasi-nupp)'],
            ['\u2191 \u2193 \u00b7 \u21b5', 'Fuajee laudade loend (jõuad sinna Tab-klahviga): vali laud \u00b7 liitu sellega']],
          note: 'Androidis sulgeb süsteemi tagasi-nupp/-liigutus aknad nagu Escape, selle asemel et mängust lahkuda (valikutes seadistatav). iOS-is vastavat süsteeminuppu ei ole \u2014 kasuta iga akna nuppu \u2715.' }
      ]
    }
  ]
};
