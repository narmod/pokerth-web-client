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
          b: ['Liides on saadaval 46 keeles. Muuda seda millal tahes täpsemates valikutes (hammasrattamenüü) jaotises Kasutajaliides. Pokkeri käiguterminid (Fold, Check, Call, Bet, Raise, All-In) jäävad kokkuleppeliselt inglise keelde, täpselt nagu töölauakliendis.'] },
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
      ]
    }
  ]
};
