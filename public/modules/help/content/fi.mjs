// ── help/content/fi.mjs — Suomenkielinen ohjekorpus (4. erä) ────────────────
// Käännös en.mjs-tiedostosta (viite). Rakenne ja id:t identtiset; vain
// t / b / list / keys (nimikkeet) / note on käännetty. Pokeritermit
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) pysyvät
// englanniksi sovelluksen käytännön mukaisesti.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Aloittaminen',
      sections: [
        { id: 'modes', t: 'Kolme tapaa pelata',
          b: ['Valitse kirjautumisruudulla, miten haluat pelata.'],
          list: [
            'Internet — pelaa verkossa virallisella pokerth.net-palvelimella, sijoituslistoineen. Tarvitaan pokerth.net-tili; rekisteröityminen pokerth.netissä on ilmaista.',
            'Paikallinen / harjoittelu — pelaa offline-tilassa botteja vastaan. Ei mitään säädettävää, toimii ilman yhteyttä ja avaa palkintoja edistyessäsi.',
            'LAN / oma palvelin — yhdistä yksityiseen PokerTH-palvelimeen lähiverkossasi tai omalla koneellasi.'] },
        { id: 'lan', t: 'LAN / oma palvelin',
          b: ['Kolmas tila yhdistää mihin tahansa PokerTH-palvelimeen, jota sinä tai kaverisi pyöritätte — kotiverkossa, yksityisellä VPS:llä, missä vain. Syötä palvelimen osoite ja portti, rastita TLS, jos palvelin käyttää salattua porttia, ja kirjaudu nimimerkillä (vieraskirjautuminen toimii, jos palvelin sallii sen). Pöydässä kaikki toimii sen jälkeen täsmälleen kuten virallisella palvelimella.'] },
        { id: 'famboard', t: 'Perheen sijoituslista',
          b: ['Vain yksityisillä palvelimilla ja LAN-peleissä asiakasohjelma pitää nimimerkkikohtaisia kokonaistilastoja — pelatut ja voitetut kädet ja pelit, suurin voitto, paras putki — ja jakaa ne palvelimen kautta, joten jokainen pöydän ääressä oleva laite näkee saman listan. pokerth.net-pelejä ei koskaan seurata näin, ja harjoittelutilan tilastot pysyvät täysin erillään.'] },
        { id: 'language', t: 'Kieli',
          b: ['Käyttöliittymä on saatavilla 36 kielellä. Vaihda se milloin tahansa Lisäasetuksista (ratasvalikko), kohdasta Käyttöliittymä. Pokerin toimintotermit (Fold, Check, Call, Bet, Raise, All-In) pysyvät käytännön mukaan englanniksi, aivan kuten työpöytäasiakkaassa.'] },
        { id: 'pwa', t: 'Asenna sovellukseksi',
          b: ['Tämä asiakasohjelma on Progressive Web App: voit asentaa sen selaimen valikosta (tai yläpalkin asennuspainikkeesta) ja saada koko näytön sovelluksen omalla kuvakkeella. Asennuksen jälkeen se käynnistyy heti, ja harjoittelutila toimii täysin offline-tilassa.'],
          note: 'Androidilla ja työpöydän Chromessa/Edgessä asennuspainike hoitaa kaiken. iPhonella/iPadilla Apple sallii asennuksen vain Safarin kautta: Jaa-painike \u2192 \u201dLisää Koti-valikkoon\u201d — asiakasohjelma näyttää nämä vaiheet tarvittaessa. Painike katoaa, kun sovellus on asennettu.' },
        { id: 'platforms', t: 'Alustat ja selaimet',
          b: ['Asiakasohjelma toimii jokaisessa modernissa selaimessa kaikilla järjestelmillä — Windows, macOS, Linux, Android, iOS. Muutama ominaisuus nojaa uudempiin selain-API:hin; kun API puuttuu, ominaisuus piiloutuu tai selittää tilanteen sen sijaan että hajoaisi. Tärkeimmät erot:'],
          list: [
            'Chrome / Edge (työpöytä): kaikki toimii, myös .pdb-lokin kirjoitus kansioon.',
            'Firefox: kaikki paitsi .pdb:n kirjoitus kansioon (API ei vielä saatavilla).',
            'Safari / iOS: asennus kulkee Jaa \u2192 \u201dLisää Koti-valikkoon\u201d -reittiä; ei värinää; koko näyttö rajoitettu iPhonella; ääni alkaa ensimmäisen kosketuksesi jälkeen.',
            'Android: täysi tuki Chromium-selaimissa, mukaan lukien värinä ja Takaisin-painikkeen toiminta.'] },
        { id: 'avatar', t: 'Nimimerkki ja avatar',
          b: ['Valitse nimimerkkisi ja avatarisi kirjautumisruudulla ennen yhdistämistä. pokerth.netissä nimimerkkisi on tilisi nimi; avatarit jaetaan muille pelaajille avatar-palvelimen kautta.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pokerin säännöt',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em pähkinänkuoressa',
          b: ['PokerTH:ssa pelataan No-Limit Texas Hold\u2019emia. Jokainen pelaaja saa kaksi omaa korttia (hole cards). Sen jälkeen viisi yhteistä korttia jaetaan kuvapuoli ylöspäin pöydän keskelle. Paras viiden kortin käsi, joka muodostuu kahden korttisi ja viiden yhteisen kortin mistä tahansa yhdistelmästä, voittaa potin.'] },
        { id: 'blinds', t: 'Blindit ja jakajan nappi',
          b: ['Ennen jokaista kättä pottia kartuttaa kaksi pakollista panosta: small blind ja big blind, jotka asettavat jakajan napista vasemmalla istuvat kaksi pelaajaa. Nappi siirtyy joka käden jälkeen yhden paikan myötäpäivään, joten kaikki maksavat blindit vuorollaan. Blindit nousevat pelin aikana säännöllisin välein.',
              'Pöydässä nappi ja blindit on merkitty pelimerkeillä: D (jakaja), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Neljä panostuskierrosta',
          list: [
            'Pre-flop — omien korttien jaon jälkeen ensimmäinen panostuskierros alkaa big blindin vasemmalta puolelta.',
            'Flop — kolme yhteistä korttia paljastetaan, ja niitä seuraa panostuskierros.',
            'Turn — neljäs yhteinen kortti, sitten uusi panostuskierros.',
            'River — viides ja viimeinen yhteinen kortti, sitten viimeinen panostuskierros.'],
          b: ['Panostuskierros päättyy, kun jokainen kädessä yhä mukana oleva pelaaja on laittanut pottiin saman summan (tai on all-in).'] },
        { id: 'actions', t: 'Mitä voit tehdä vuorollasi',
          list: [
            'Fold — luovuttaa käsi. Korttisi poistuvat, etkä enää tavoittele pottia.',
            'Check — jatkaa panostamatta. Mahdollista vain, kun maksettavaa ei ole.',
            'Call — maksaa käynnissä oleva panos.',
            'Bet — avata panostus, kun kukaan ei ole vielä panostanut tällä streetillä.',
            'Raise — korottaa olemassa olevan panoksen päälle. Pienin korotus vastaa edellistä panosta tai korotusta.',
            'All-In — laittaa koko pinosi peliin. Pysyt kädessä kattamaasi summaan asti.'] },
        { id: 'showdown', t: 'Showdown ja jaetut potit',
          b: ['Jos riverin panostuskierroksen jälkeen jäljellä on useita pelaajia, kädet näytetään ja paras voittaa — voittava yhdistelmä näytetään yhteisten korttien alla. Kun pelaaja on all-in pienemmällä summalla kuin täydet panokset, syntyy sivupotteja: kukin pelaaja voi voittaa vain sen osan potista, johon on osallistunut. Tasakädet jakavat potin.',
            'Kaikkien ei tarvitse näyttää: viimeisestä panostaneesta tai korottaneesta pelaajasta alkaen käsi paljastetaan vain, jos se voittaa jo näkyvissä olevan. Se joka saa mukata, pitää korttinsa piilossa ja saa Show-painikkeen näyttääkseen ne silti.'] },
        { id: 'hands', t: 'Käsien arvojärjestys',
          b: ['Heikoimmasta vahvimpaan:'],
          list: [
            '1. High Card — ei yhdistelmää; korkein kortti ratkaisee.',
            '2. Pair — kaksi samanarvoista korttia.',
            '3. Two Pair — kaksi eri paria.',
            '4. Three of a Kind — kolme samanarvoista korttia.',
            '5. Straight — viisi peräkkäistä korttia (ässä käy suurimpana tai pienimpänä).',
            '6. Flush — viisi samaa maata olevaa korttia.',
            '7. Full House — kolmoset ja pari.',
            '8. Four of a Kind — neljä samanarvoista korttia.',
            '9. Straight Flush — suora, kokonaan samaa maata.',
            '10. Royal Flush — kympistä ässään samaa maata. Paras mahdollinen käsi.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Peliruutu',
      sections: [
        { id: 'actionbar', t: 'Toimintopalkki',
          b: ['Kun on vuorosi, alareunan toimintopalkki syttyy ja näyttää enintään neljä painiketta: Fold (punainen), Check / Call (sininen), Bet / Raise (vihreä — päätoiminto, korostettu) ja All-In (tummanpunainen). Check / Call -painike näyttää tarkan maksettavan summan; Bet / Raise näyttää summan, jonka olet laittamassa. Riverin jälkeen All-In voi muuttua Show-painikkeeksi korttiesi näyttämistä varten.'] },
        { id: 'betctl', t: 'Panoksen valinta',
          b: ['Säädä korotussummaa numerokentällä, liukusäätimellä tai pikapainikkeilla 1/3 \u00b7 1/2 \u00b7 Pot (osuuksia nykyisestä potista). Summat pyöristetään automaattisesti ja pidetään sallitun pienimmän ja suurimman korotuksen välissä. Jos ajattelet mieluummin big blindeissä, asetus näyttää kaikki summat BB:inä pelimerkkien sijaan.'] },
        { id: 'preselect', t: 'Toiminnon esivalinta',
          b: ['Ennen vuoroasi voit virittää toiminnon valmiiksi: napauta painiketta, ja se saa kultaisen reunuksen ja pienen kultaisen pisteen. Kun vuorosi tulee, toiminto suoritetaan heti. Viritetty Fold muuttuu automaattisesti Checkiksi, kun check on ilmainen — et koskaan luovuta turhaan. Esivalinnat nollautuvat joka uuden käden, streetin vaihdon ja showdownin myötä, ja ne perutaan, jos tilanne muuttuu (esimerkiksi maksettava summa muuttuu).'] },
        { id: 'automodes', t: 'Automaattitilat',
          b: ['Toimintopainikkeiden vieressä oleva pudotusvalikko tarjoaa kolme pelitilaa: Manuaalinen, Auto Check/Call ja Auto Check/Fold. Automaattitilat pelaavat puolestasi, kunnes palaat takaisin — mikä tahansa manuaalinen napsautus toimintoon palauttaa heti Manuaalisen tilan.'] },
        { id: 'readtable', t: 'Pöydän lukeminen',
          b: ['Jokainen pelaajalaatikko näyttää avatarin, nimen, pinon ja käynnissä olevan panoksen. Jakaja ja blindit on merkitty D-/SB-/BB-merkeillä. Laatikon värillinen merkki kertoo pelaajan viimeisimmän toiminnon; ohut sininen palkki laskee hänen miettimisaikaansa. Vuorossa olevan pelaajan laatikko syttyy; oma laatikkosi saa vuorollasi sykkivän kultaisen kehyksen.',
              'Pöydän yläpuolella oleva tilarivi näyttää kokonaispotin, käynnissä olevan streetin panokset, vaiheen (Pre-flop, Flop, Turn, River) sekä pelin ja käden numerot. Luovuttaneiden pelaajien kortit ovat läpikuultavia; pudonneet on himmennetty. Käden lopussa voittajaikkuna voi tiivistää, kuka voitti mitä — sen voi poistaa käytöstä asetuksista.'] },
        { id: 'seatlayout', t: 'Paikkojen asettelu',
          b: ['Verkkolaajennuksena pelaajalaatikoiden asettelu valitaan kohdasta Lisäasetukset \u2192 Paikat: Automaattinen seuraa virallista asiakasta (kiinteät paikat pystysuunnassa, laskettu ellipsi vaakasuunnassa), tai pakota Pysty- tai Vaaka-asettelu — ja Mukautettu antaa sinun sijoittaa jokaisen paikan itse: esiin tulee muokkaustila, jossa vedät jokaisen laatikon täsmälleen haluamaasi kohtaan, ja asettelu tallennetaan.'] },
        { id: 'zoom', t: 'Pöydän zoomaus (puhelimet)',
          b: ['Pienillä näytöillä suurennuslasipainikkeet suurentavat pöytää (2\u00d7), ja voit vetää sitä sormella — oma laatikkosi ja toimintopalkki pysyvät paikoillaan. Näkymä seuraa automaattisesti aktiivista paikkaa ja loitontaa showdownissa kokonaiskuvaa varten. Voi poistaa käytöstä Lisäasetuksista.'],
          note: 'Puhelimilla ja tableteilla selaimen oma nipistyszoomaus on oletuksena estetty, jotta zoomausele ei koskaan laukea vahingossa kesken käden; ota se halutessasi takaisin käyttöön kohdasta Lisäasetukset \u2192 Käyttöliittymä.' },
        { id: 'protections', t: 'Kurkkimissuoja ja vahinko-Callin esto',
          b: ['Kaksi valinnaista suojaa: kurkkimissuoja pitää omat korttisi piilossa, kunnes kosketat niitä (hyödyllinen, kun joku voi nähdä näyttösi), ja vahinko-Callin esto lukitsee Call-painikkeen hetkeksi heti suuren korotuksen jälkeen, jotta pienempään Calliin tarkoitettu napautus ei osu vahingossa korotettuun summaan. Molemmat löytyvät Lisäasetuksista.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Tietopaneeli',
      sections: [
        { id: 'open', t: 'Paneelin avaaminen',
          b: ['Pelin aikana tietopaneeli avautuu yläpalkista (tai Alt+L / Alt+I) ja siinä on kolme välilehteä: Loki, Todennäköisyydet ja Tilastot. Puhelimella se leijuu pöydän päällä; suuremmilla näytöillä se on siirrettävä ja kokoa muutettava ikkuna — tartu \u28ff-kahvaan siirtääksesi, reunoihin muuttaaksesi kokoa. Sen sijainti muistetaan.'] },
        { id: 'log', t: 'Peliloki',
          b: ['Loki-välilehti tallentaa koko pelin käsi kädeltä: blindit, jokaisen toiminnon summineen, näytetyt kortit ja voittajat, kaikki värein nopeaa lukemista varten. Vientipainike tallentaa lokin tiedostoon, jos haluat käydä istunnon läpi myöhemmin.'] },
        { id: 'odds', t: 'Todennäköisyydet (todennäköisyysmonitori)',
          b: ['Todennäköisyydet-välilehti näyttää nykyiselle kädellesi reaaliaikaisen todennäköisyyden päätyä kuhunkin 10 käsikategoriasta — High Cardista Royal Flushiin — jokaisella kuvake, prosentti ja palkki. Näyttö himmenee heti, kun luovutat. Se käyttää vain omia korttejasi ja yhteisiä kortteja: se ei näe mitään, mitä vastustajasi eivät näytä.'] },
        { id: 'journal', t: 'Käsilokit ja \u201dLokit\u201d-ikkuna',
          b: ['Reaaliaikaisen lokin lisäksi jokainen pelaamasi käsi tallennetaan paikallisesti selaimeesi, samassa muodossa kuin virallisen asiakkaan .pdb-lokitiedostot. Lokit-ikkuna (Lisäasetukset \u2192 Lokiviestit \u2192 Hallitse lokeja\u2026) listaa istuntosi ja antaa työskennellä niiden kanssa: esikatsele istuntoa haulla ja korostuksella, suodata pelin mukaan, vie HTML:nä tai pelkkänä tekstinä, tallenna raaka .pdb-tiedosto tai tuo työpöytäasiakkaan tallentama .pdb. Istunnot poistetaan yksi kerrallaan tai kaikki kerralla (vahvistuksella), ja automaattinen säilytys voi pitää vain viimeiset 7, 30, 90, 180 tai 365 päivää. Itse tuomiasi lokeja ei poisteta koskaan automaattisesti. Toinen asetus rajaa säilytettävien istuntojen määrän, ja luettelosaraketta voi venyttää leveämmäksi.',
              'Analysoi-painike ajaa istunnolle käsianalyysin ja voi lähettää lokin pokerth.netin analyysipalveluun. Kaikki pysyy laitteellasi, kunnes viet tai lähetät nimenomaisesti.'] },
        { id: 'logopts', t: 'Lokiasetukset',
          b: ['Kohdassa Lisäasetukset \u2192 Lokiviestit voit kytkeä lokituksen päälle tai pois ja valita kirjoitusvälin samoilla kolmella asetuksella kuin työpöytäasiakkaassa: jokaisen toiminnon jälkeen, jokaisen käden jälkeen (oletus) tai jokaisen pelin jälkeen. Toinen asetus kirjoittaa .pdb-tiedoston valitsemaasi kansioon ja pitää sen ajan tasalla tällä välillä, sekä vielä kerran kun poistut sivulta, jotta toinen työkalu voi seurata peliä suorana.'],
          note: 'Paikalliseen kansioon kirjoittaminen vaatii File System Access -rajapinnan: vain työpöydän Chrome, Edge ja Opera. Muualla asetus selittää itsensä ja manuaalinen vienti lokien ikkunasta on yhä käytettävissä. Selain voi vain korvata tiedoston, ei koskaan lisätä sen loppuun, joten .pdb-tiedostoa lukevan työkalun kannattaa avata se uudelleen jokaisen muutoksen jälkeen.' },
        { id: 'assist', t: 'Avustin (käden vahvuus)',
          b: ['Todennäköisyydet-välilehden yläreunassa avustinpalkki lukee kätesi puolestasi. Ennen floppia se nimeää aloituskätesi ja arvioi sen tähdillä; flopista alkaen se näyttää nykyisen parhaan yhdistelmäsi ja nopean simulaation jälkeen arvioidun voittotodennäköisyytesi prosentteina, väri-ilmaisimella punaisesta (heikko) vihreään (vahva). Kuten todennäköisyysmonitori, se käyttää vain tietoa, jonka voit nähdä.',
              'Kaksi näyttötyyliä löytyy kohdasta Lisäasetukset \u2192 Paikat: Segmentit (kymmenen lohkoa) tai perinteinen edistymispalkki. Koko avustintoiminnon voi poistaa käytöstä kohdasta Lisäasetukset \u2192 Avustin.'] },
        { id: 'assistwin', t: 'Avustin kelluvana pienoisohjelmana',
          b: ['Avustinlohkon voi irrottaa paneelista omaksi aina päällimmäiseksi pikkuikkunaksi: käytä lohkon irrotuspainiketta, siirrä ja skaalaa sitä sitten minne tahansa pöydän päälle — kätevä käden vahvuuden seuraamiseen ilman koko paneelia auki. Kiinnityspainike palauttaa sen Todennäköisyydet-välilehteen, ja sijainti muistetaan. Paneelin sisällä Avustimen ja todennäköisyyksien välinen vetokahva antaa jakaa tilan niiden kesken.'] },
        { id: 'stats', t: 'Tilastot',
          b: ['Tilastot-välilehti seuraa istuntoasi: pelatut kädet, nähdyt flopit, showdownit, voittoprosentit ja paljon muuta. Tilastoseurannan voi poistaa käytöstä Lisäasetuksista.'] },
        { id: 'hud', t: 'Tilasto-HUD paikoilla (beta)',
          b: ['HUD kiinnittää pienen tilastolaatikon jokaisen pelaajan paikan viereen. Se rakennetaan käsistä, jotka olet tallentanut lokeihisi: havaittujen käsien määrä, sitten VPIP (kuinka usein hän laittaa rahaa vapaaehtoisesti pre-flopissa), PFR (pre-flop-korotukset) ja AF (aggressiokerroin), väreillä passiivisesta aggressiiviseen. Niiden alla merkki tiivistää pelaajan sanoin \u2014 Tiukka-Passiivinen, Löysä-Aggressiivinen ja niin edelleen \u2014 pienen kellotaulun vieressä, jonka syttynyt neljännes luetaan vasemmalta oikealle tiukasta löysään ja alhaalta ylös passiivisesta aggressiiviseen. Merkki näkyy heti ensimmäisestä kädestä, mutta pysyy himmennettynä 25 käteen asti, jolloin siitä tulee luotettava. Napauta laatikkoa nähdäksesi yksityiskohtaisen ponnahdusikkunan kaikilla luvuilla (3-bet, continuation bet, fold 3-bettiin, varastusyritykset, showdown-osuudet\u2026), ja vedä laatikkoa, jos se peittää jotain.',
              'HUD tietää vain sen, mitä olet nähnyt omissa pöydissäsi — se lukee paikallisia käsilokejasi, joten tallennuksen on oltava päällä ja luvut muuttuvat merkityksellisiksi vasta riittävän monen käden jälkeen. Se on beta-ominaisuus, oletuksena pois päältä: ota se käyttöön kohdasta Lisäasetukset \u2192 Avustin.'] },
        { id: 'handsbtn', t: 'Yhdistelmien pikakatsaus',
          b: ['Pokerikäsien kuvake pelipöydällä avaa milloin tahansa nopean katsauksen 10 yhdistelmään — kätevä opetellessa. Voi piilottaa Lisäasetuksista.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat ja sosiaalisuus',
      sections: [
        { id: 'panels', t: 'Aulachat ja pöytächat',
          b: ['Aulassa on oma chat ja pöydässä toinen. Puhelimella pöytächat leijuu pelin päällä; suuremmilla näytöillä se on siirrettävä ja kokoa muutettava ikkuna. Chat-painikkeen merkki laskee lukemattomat viestit.'] },
        { id: 'typing', t: 'Kirjoitusavut',
          list: [
            'Tab täydentää nimimerkin — paina Tabia uudelleen selataksesi osumia.',
            '\u2191 / \u2193 selaavat omien viestiesi historiaa.',
            'Emoji-painike avaa täyden valitsimen; myös :-merkin kirjoittaminen ehdottaa emoteja kirjoittaessasi.'] },
        { id: 'emotes', t: 'Emotet ja hymiöt',
          b: ['Chat muuntaa emote-koodit täsmälleen kuten virallinen työpöytäasiakas: kirjoita nimi kahden kaksoispisteen väliin, ja siitä tulee emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 tuettuna on yli 1 900 koodia (GitHubin koko valikoima). Myös perinteiset tekstihymiöt muunnetaan: :-) ;) :D xD :P <3 ja noin kahdeksankymmentä muuta.',
              ':-merkin kirjoittaminen avaa ehdotuslaatikon, joka täydentää koodia kirjoittaessasi (\u2191/\u2193 valitaksesi, Tab tai Enter hyväksyäksesi). Emoji-muunnoksen voi poistaa kokonaan käytöstä kohdasta Lisäasetukset \u2192 Chat.'] },
        { id: 'commands', t: 'Chat-komennot',
          b: ['Chat ymmärtää kauttaviivakomentoja. Kaksi näkyy muille:'],
          keys: [
            ['/me <teksti>', 'Toimintoviesti, näytetään muodossa \u201d* nimimerkkisi teksti\u201d'],
            ['/emoji <emoji>', 'Toistaa emoji-reaktion (saman, jonka reaktiovalitsin lähettää)']] },
        { id: 'diagcmds', t: 'Diagnostiikkakomennot',
          b: ['Kaikki muu on paikallista: vain sinä näet vastaukset, eikä pöytään lähetetä mitään. Kirjoita /help listataksesi kaikki. Hyödyllisimmät:'],
          keys: [
            ['/help', 'Listaa kaikki komennot'],
            ['/update', 'Tarkista uusi versio ja päivitä'],
            ['/lang <koodi>', 'Vaihda kieltä (esim. /lang fi)'],
            ['/sound on|off', 'Kytke/mykistä pelin äänet'],
            ['/zoom', 'Kytke pöydän suurennuslasi'],
            ['/clear', 'Tyhjennä chat paikallisesti'],
            ['/table', 'Nykyisen pelin tiedot (blindit, pelaajat, pinot)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Asiakkaan tilan, verkon ja sulavuuden diagnostiikka'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Edistynyt vianetsintä (kortit, protokolla, ääni, tallennus, paikat)'],
            ['/copy', 'Kopioi viimeisin komentovastaus leikepöydälle']] },
        { id: 'reactions', t: 'Emoji-reaktiot',
          b: ['Reaktiopainike avaa valitsimen, jossa on 30 animoitua reaktiota (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026). Ne toistuvat tehosteella paikkasi yläpuolella koko pöydän nähden — myös työpöytäasiakkaan pelaajien. Reaktiot voi poistaa kokonaan käytöstä Lisäasetuksista.'] },
        { id: 'translate', t: 'Ymmärrä kaikkia',
          b: ['Kun chatin käännös on päällä, käännöspainike ilmestyy osoittimen alla olevalle riville — tai riville, jota napautat kosketusnäytöllä — ja näyttää viestin omalla kielelläsi selaimen kääntäjällä. Sen voi näyttää pysyvästi kaikilla riveillä kohdassa Lisäasetukset → Chat, jossa asuu myös pöytälyhenteet (gg, nh, utg…) selittävä vihje.'],
          note: 'Käännös käyttää Google Translate -palvelua ja toimii kaikissa selaimissa — tarvitaan vain internetyhteys. Viesti lähetetään käännöspalveluun vain, kun napautat sen käännöspainiketta, ei koskaan automaattisesti.' },
        { id: 'social', t: 'Pelaajat: profiili, kutsu, ohitus',
          b: ['Napauta ketä tahansa pelaajaa — pöydässä tai aulan listalla — avataksesi hänen korttinsa: profiili ja tilastot, kutsu peliisi tai ohita (hänen chat-viestinsä piilotetaan; ohituksen voi perua milloin tahansa). Vahvistuksen ennen kutsua/ohitusta voi ottaa käyttöön asetuksista.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Aula ja pelit',
      sections: [
        { id: 'list', t: 'Pelilista',
          b: ['Aula listaa kaikki palvelimen pöydät. Jokainen rivi näyttää pelaajamäärän, pelityypin, lukon, kun salasana tai kutsu vaaditaan, ja tilamerkin: \u201dOdottaa\u201d (vihreä — peli ei ole alkanut, voit liittyä jos paikka on vapaana), \u201dKäynnissä\u201d (lämmin väri — katsottavissa livenä, kun katsojat sallitaan) ja \u201dSuljettu\u201d (himmennetty). Täyden pöydän tunnistaa yksinkertaisesti täydestä laskurista, kuten 10/10; merkkien värit seuraavat aktiivista teemaa.',
              'Suodattimen pudotusvalikko rajaa listaa täsmälleen kuten työpöytäasiakas, jokainen valinta edellistä tiukempi: vain avoimet pelit \u2192 piilottaen myös täydet pöydät \u2192 sitten vain ei-yksityiset, vain yksityiset tai vain sijoituspelit. Valintasi muistetaan. Hakukenttä löytää pelin nimellä, ja pelaajamerkki avaa kaikkien paikalla olevien listan, haettavissa ja lajiteltavissa.'] },
        { id: 'join', t: 'Liittyminen ja katsominen',
          b: ['Valitse avoin peli ja liity — lukko kertoo, että salasana vaaditaan. Käynnissä olevia pelejä, jotka sallivat katsojat, voi katsoa livenä: näet pöydän ja chatin, mutta omat kortit pysyvät piilossa etkä voi toimia.'] },
        { id: 'gameinfo', t: 'Pelin tiedot',
          b: ['Ennen liittymistä pelin tietokortti näyttää kaiken, mikä pöydän määrittää: pelityyppi, blindit ja niiden nousu (tuplaus tai manuaalinen lista), aloituspino, toiminta-aika, tauko käsien välillä ja ketkä jo istuvat.'] },
        { id: 'create', t: 'Pelin luominen',
          b: ['Luo oma pöytäsi: nimi, pelaajamäärä, aloituspino, ensimmäinen small blind ja korotusaikataulu, toiminta-aika ja sallitaanko katsojat. Pelityyppejä on neljä: Normaali (kaikki), vain rekisteröityneet pelaajat, vain kutsulla ja Sijoituspeli (lasketaan viralliseen sijoituslistaan — salasana ei silloin ole mahdollinen). Suosikkiasetuksesi voi tallentaa ja ladata uudelleen.'] },
        { id: 'invites', t: 'Kutsut',
          b: ['Pelaajat voivat kutsua sinut pöytäänsä; saat ilmoituksen, jonka voit hyväksyä tai hylätä. Kutsun saaminen on ainoa tapa päästä vain kutsulla -peliin.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Tilisi',
          b: ['Virallinen internet-palvelin on pokerth.net. Siellä pelaaminen vaatii ilmaisen pokerth.net-tilin — rekisteröidy verkkosivustolla ja kirjaudu sitten tänne samalla nimimerkillä ja salasanalla. Tämä verkkoasiakasohjelma yhdistää täsmälleen samaan palvelimeen kuin työpöytäasiakas: samat tilit, samat pöydät, samat sijoituslistat, ja voit istua pöydässä työpöytäasiakkaan pelaajien kanssa.'] },
        { id: 'ranked', t: 'Sijoituspelit ja kaudet',
          b: ['Sijoituspeli-tyyppiset pelit lasketaan viralliseen kausisijoituslistaan. Profiilisi sovelluksessa näyttää rekisteröitymispäiväsi, nykyisen kauden sijasi (Rank), pisteesi (Score), keskiarvosi ja pelatut pelisi sekä viimeisimmät tuloksesi. Normaalit (ei-sijoitus) pelit ovat pelkkää huvia eivätkä muuta mitään.'] },
        { id: 'rankhow', t: 'Miten sijoitus lasketaan',
          b: ['Jokaisessa sijoitetussa pelissä sijoituksesi tuo pisteitä: 15 ensimmäisestä, sitten 9, 6, 4, 3, 2 ja 1 seitsemänteen asti; kahdeksannesta kymmenenteen ei mitään. Pöytä jakaa siis yhteensä 40 pistettä.',
              'Score ei ole näiden pisteiden summa vaan keskiarvosi peliä kohti, vaimennettuna kertoimella, joka kasvaa pelattujen pelien määrän mukana: muutama hyvä tulos ei riitä pitämään sinua kärjessä, tarvitaan myös säännöllisyyttä — mitä enemmän pelaat, sitä lähemmäs Score pääsee todellista keskiarvoasi. Kausi kestää neljänneksen: vaihdon yhteydessä kaikki arkistoidaan ja laskurit alkavat nollasta, mutta menneet kaudet pysyvät katsottavissa. Pelissä palkintokorokepainike näyttää pöytäsi pelaajien kausisijoituksen.'],
          note: 'Pistetaulukon ja tarkan kaavan määrää pokerth.netin sijoituspalvelin, ja ne voivat muuttua; sivuston sivut ratkaisevat.' },
        { id: 'rankings', t: 'Sijoituslistasivut',
          b: ['Sijoituslista-kohta avaa virallisen PokerTH-sijoituslistan, jota voi hakea pelaajittain, sekä yhteisölistat (BBC, WEC). Jos sijoituslistat eivät kiinnosta, kohdan voi piilottaa kohdasta Lisäasetukset \u2192 Yhteisö.'] },
        { id: 'cups', t: 'Yhteisön cupit: BBC ja WeCup',
          b: ['Kaksi yhteisöä järjestää pokerth.netissä omat kilpailunsa, kummallakin oma sivusto ja oma sijoituslista. Best Brainies Cup (BBC) on vuonna 2013 syntynyt porrasturnaus: edetään Step 1:stä Step 4:ään, ja uusi kausi alkaa jokaisen Step 4 -pelin jälkeen, kun pokaali jaetaan. WeCupilla (WEC) on oma, paljon laajemmalle levittyvä asteikkonsa — 75 pistettä ensimmäisestä sijasta, sitten 45, 30, 20… — ja sen score normalisoi keskiarvosi sen mukaan, montako peliä olet pelannut muihin jäseniin verrattuna.',
              'Molemmat sijoituslistat avautuvat pokaalipainikkeesta PokerTH-listan vierestä. Näiden kilpailujen pöytäasetukset ovat mukana esiasetuksina, kun luot pelin (BBC Step 1–4, WEC, WEC Monthly Final ja WEC Grand Final), joten voit harjoitella samoissa oloissa. Osallistuminen vaatii ilmoittautumisen kyseisen cupin sivustolla.'],
          note: 'Jos cupit eivät kiinnosta, piilotat nämä sisällöt kerralla kohdasta Lisäasetukset → Yhteisö.' },
        { id: 'forumcups', t: 'Foorumin cupit ja tapahtumat',
          b: ['pokerth.netin foorumilla pyörii myös Monthly Cup, kuukausittainen sarja, jossa pelaajat jaetaan Gold-, Silver- ja Bronze-pöytiin ennen kuun mestarin kruunaamista, ja lisäksi vuoden mittaan yksittäisiä erikoiscupeja.',
              'Ilmoittautumiset, aikataulut, pöytäasetukset ja tulokset julkaistaan foorumilla, ja pelit pelataan virallisella palvelimella kuten kaikki muutkin. Tulosten seuraamiseen riittää pokerth.net-tili; cupiin ilmoittautuminen käy vastaavan foorumiketjun kautta.'] },
        { id: 'forumnews', t: 'Foorumin uutiset aulassa',
          b: ['Aulan yläpalkin sanomalehtipainike avaa pokerth.net-foorumin uusimmat viestit, yksi rivi aihetta kohden, kullakin foorumilla oma värinsä. Painikkeen merkki laskee lukemattomat viestit; viestin avaaminen (uusi välilehti) merkitsee sen luetuksi, ja ”Merkitse kaikki luetuiksi” tyhjentää kaiken kerralla.',
              'Tämä on web-lisä: painikkeen voi piilottaa lisäasetuksista (”Foorumipainike aulan yläpalkissa”).'] },
        { id: 'avatars', t: 'Avatarit ja liput',
          b: ['pokerth.netissä avatarisi jaetaan muille pelaajille avatar-palvelimen kautta, ja pelaajalaatikoissa voi näkyä pieni maan lippu. Molemmat ovat valinnaisia ja säädettävissä asetuksista.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Harjoittelutila',
      sections: [
        { id: 'what', t: 'Mikä se on',
          b: ['Paikallinen / harjoittelutila on täysimittainen peli tietokoneen ohjaamia vastustajia vastaan: ei yhteyttä, ei tiliä, ei mitään pelissä. Kun sovellus on asennettu (tai vain kerran vierailtu), se toimii täysin offline-tilassa — täydellinen pelin opetteluun, käyttöliittymän kokeiluun tai ajan kuluttamiseen lentotilassa.'] },
        { id: 'setup', t: 'Pelin asetukset',
          b: ['Valitse vastustajien määrä, aloituspino, blindit ja niiden nousu sekä pelinopeus. Bottien kokoonpano ja vaikeustaso säädetään kohdasta Lisäasetukset \u2192 Paikallinen peli — lempeistä vastustajista kovempaan ja monipuolisempaan pöytään.'] },
        { id: 'trophies', t: 'Palkinnot',
          b: ['Harjoittelutilalla on oma etenemisensä: 28 palkintoa kuudessa kategoriassa (eteneminen, tekniikka, tyyli, formaatit, hauskuus ja yksi salainen) avautuvat pelaamalla — pelatut kädet, voitetut pelit, isot bluffit, erikoiset kädet ja paljon muuta. Palkintoetenemisesi on kumulatiivista ja yhdistyy laitteiden välillä, kun tilin asetussynkronointi on käytössä.'] },
        { id: 'learn', t: 'Hyvä paikka oppia',
          b: ['Kaikki muissa luvuissa kuvattu toimii täälläkin: todennäköisyysmonitori, avustinnäyttö, esivalinta, pikanäppäimet. Harjoittelutila on paras paikka kokeilla niitä ilman painetta ennen kuin syöksyt pokerth.netiin.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Tyyli ja ääni',
      sections: [
        { id: 'themes', t: 'Teemat',
          b: ['Lisäasetusten Tyyli-kategoria pukee koko asiakasohjelman. Esiasetukset säätävät kaiken yhdellä napautuksella (klassinen vihreä kasino, virallinen PokerTH-ilme\u2026); alempana yksittäiset akselit hienosäätävät erikseen väripalettia, pöydän verkaa ja korttien kuvapuolia — muuta mitä tahansa akselia, ja yhdistelmästäsi tulee oma teemasi. Tumma, vaalea tai automaattinen tila valitaan Käyttöliittymästä, ja valintasi tulevat voimaan heti, joka ruudulla, ja ne muistetaan.'] },
        { id: 'tablelook', t: 'Pöydät, pakat, paikat',
          b: ['Teeman lisäksi useita elementtejä voi vaihtaa itsenäisesti: pöydän taustan, korttipakan, korttien selän (sopii pakkaan automaattisesti, tai tuo oma kuvasi), jakaja- ja blindmerkit, toimintopainikkeiden tyylin sekä kokonaiset paikkapaketit, jotka pukevat pelaajalaatikot uusiksi. Valitse kaikki kohdasta Lisäasetukset \u2192 Tyyli; muutokset näkyvät pöydässä heti.'] },
        { id: 'music', t: 'Musiikkisoitin',
          b: ['Yläpalkin valikkojen musiikkikohta avaa pienen taustamusiikkisoittimen: valitse kappale soittolistalta, toista/tauko, edellinen/seuraava, satunnaistoisto sekä yhden kappaleen, koko listan tai ei minkään toisto. Äänenvoimakkuus, valittu kappale ja toistotila muistetaan. Toisto ei koskaan ala itsestään — selaimet vaativat kosketuksen — ja soitin on täysin riippumaton pelin äänitehosteista.'] },
        { id: 'sounds', t: 'Äänitehosteet',
          b: ['Pelin äänet on ryhmitelty neljään erikseen kytkettävään kategoriaan, täsmälleen kuten työpöytäasiakkaassa: pelitoiminnot (jaetut kortit, Check, Call, Raise, vuorosi\u2026), aulachatin ilmoitus, verkkopelin ilmoitukset (pelaaja liittyi, peli valmis) ja blindien noston ilmoitus. Yksi äänenvoimakkuussäädin ohjaa niitä kaikkia, kohdassa Lisäasetukset \u2192 Ääni.'],
          note: 'Kaikki selaimet — erityisesti iOS — kieltäytyvät toistamasta ääntä, ennen kuin olet koskettanut sivua kerran. Jos peli alkaa hiljaisuudessa, yksi kosketus mihin tahansa herättää äänen; asiakasohjelma korjaa äänimoottorin myös automaattisesti, kun iOS keskeyttää sen (saapuva puhelu, tausta\u2026).' },
        { id: 'voice', t: 'Puhe ja värinä',
          b: ['Kaksi lisäkanavaa voi pitää sinut ajan tasalla katsomatta ruutua: puheilmoitukset lukevat pelitapahtumat ääneen laitteesi puhesynteesillä, ja puhelimella lyhyt värinä voi merkitä vuorosi. Molemmat ovat verkkolaajennuksia, oletuksena päällä tai pois laitteesta riippuen, kohdassa Lisäasetukset \u2192 Panokset ja vuoro.'],
          note: 'Värinä toimii Androidilla (Chromium-selaimet); Apple ei tarjoa verkkosivuille värinä-API:a, joten iPhonet eivät voi väristä. Puheilmoitukset toimivat kaikkialla, mutta saatavilla olevat äänet ja kielet riippuvat järjestelmästäsi — asiakasohjelma käyttää parasta löytämäänsä vastaavuutta.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Asetukset ja pikanäppäimet',
      sections: [
        { id: 'where', t: 'Missä asetukset asuvat',
          b: ['Lisäasetukset avataan minkä tahansa yläpalkkivalikon ratas-kohdasta. Ne on ryhmitelty kuten työpöytäasiakkaassa: Käyttöliittymä, Tyyli, Ääni, Paikallinen peli, Verkkopeli, Internet-peli, Nimimerkit / Avatarit, Lokiviestit ja Palauta oletukset. Jokaisella verkkokohtaisella ominaisuudella on siellä oma kytkimensä, joten voit kytkeä pois kaiken, mitä et käytä.'] },
        { id: 'cfgxml', t: 'Asetusten vaihto työpöytäasiakkaan kanssa',
          b: ['Asetuksesi voivat matkustaa asiakkaiden välillä: Lokiviestit-kategoria tarjoaa virallisen config.xml-tiedoston viennin/tuonnin (sen \u007e/.pokerth/config.xml-tiedoston, jota työpöytä- ja QML-asiakkaat käyttävät). Vienti kirjoittaa jaetut asetukset — nimen, näyttöasetukset, äänet, pöytämieltymykset, blindit, tyylit — ja tuonti soveltaa työpöydän tiedoston tänne. Asetukset, joita tämä asiakas ei tunne, säilyvät tiedostossa koskemattomina.'] },
        { id: 'sync', t: 'Asetukset, jotka seuraavat sinua',
          b: ['Kun pelaat tilillä, asetuksesi, teemasi, näppäinsidontasi, kielesi ja harjoittelupalkintosi synkronoidaan: muuta jotain yhdellä laitteella, ja seuraava laite, jolla kirjaudut, poimii sen. Palkintoeteneminen yhdistetään, ei koskaan ylikirjoiteta, joten kahdella laitteella pelaaminen säilyttää aina molempien parhaan.'] },
        { id: 'updates', t: 'Pysy ajan tasalla',
          b: ['Asiakasohjelma päivittyy itse: kun uusi versio julkaistaan, banneri kehottaa päivittämään (tai kirjoita /update chattiin tarkistaaksesi käsin). Silloin tällöin voi ilmestyä pieni tuotekysely, joka kysyy mielipidettäsi jostakin ominaisuudesta — osallistuminen on vapaaehtoista, ja kyselyt voi poistaa kokonaan käytöstä kohdasta Lisäasetukset \u2192 Yhteisö.'] },
        { id: 'fkeys', t: 'Viralliset pikanäppäimet',
          b: ['PokerTH:n viralliset toiminton\u00e4pp\u00e4imet toimivat pelin aikana \u2014 Alt+S toimii kaikkialla:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (järjestyksen voi kääntää asetuksista)'],
            ['F5', 'Näytä korttisi (kun mahdollista)'],
            ['F6 / F7 / F8', 'Manuaalinen \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manuaalinen \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Loki \u00b7 Todennäköisyyspaneeli'],
            ['Alt+S', 'Asetukset — missä tahansa sovelluksessa, ei vain pelin aikana'],
            ['F11', 'Koko näyttö']],
          note: 'Pikanäppäimet vaativat fyysisen näppäimistön. Macilla F-näppäimet ohjaavat oletuksena mediaa: pidä Fn pohjassa (tai ota macOS-asetuksista käyttöön \u201dKäytä F1-, F2- yms. näppäimiä tavallisina funktionäppäiminä\u201d). iPhonella koko näyttöä rajoittaa iOS — sovelluksen asentaminen PWA:na antaa saman koko näytön kokemuksen.' },
        { id: 'webkeys', t: 'Verkon kirjainnäppäimet',
          b: ['Verkkolaajennus: yhden kirjaimen näppäimet ja Alt+T käynnistävät myös toimintoja, ja ne kaikki voi määrittää uudelleen kohdassa Lisäasetukset → Pikanäppäimet:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Tilastopaneeli'],
            ['Esc', 'Sulje päällimmäinen ikkuna (myös Androidin Takaisin-painike)']],
          note: 'Androidilla järjestelmän Takaisin-painike/ele sulkee ikkunat kuten Esc sen sijaan, että poistuisi pelistä (säädettävissä asetuksista). iOS:llä ei ole vastaavaa järjestelmäpainiketta — käytä jokaisen ikkunan \u2715-merkkiä.' }
      ]
    }
  ]
};
