// ── help/content/lt.mjs — Lietuviškas pagalbos tekstynas (5 partija) ────────
// Vertimas iš en.mjs (etalonas). Struktūra ir id identiški; verčiami tik
// t / b / list / keys (etiketės) / note. Pokerio terminai (Fold, Check,
// Call, Bet, Raise, All-In, flop, turn, river…) lieka anglų kalba pagal
// programos susitarimą.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Pradžia',
      sections: [
        { id: 'modes', t: 'Trys būdai žaisti',
          b: ['Prisijungimo ekrane pasirink, kaip nori žaisti.'],
          list: [
            'Internetas — žaisk internete oficialiame pokerth.net serveryje su reitingais. Reikia pokerth.net paskyros; registracija pokerth.net svetainėje nemokama.',
            'Vietinis / treniruotė — žaisk neprisijungęs prieš botus. Nieko nereikia nustatinėti, veikia be ryšio ir tobulėjant atrakina trofėjus.',
            'LAN / atskiras serveris — prisijunk prie privataus PokerTH serverio savo vietiniame tinkle ar savo kompiuteryje.'] },
        { id: 'lan', t: 'LAN / atskiras serveris',
          b: ['Trečiasis režimas jungiasi prie bet kurio PokerTH serverio, kurį paleidi tu ar draugas — namų tinkle, privačiame VPS, kur tik nori. Įvesk serverio adresą ir prievadą, pažymėk TLS, jei serveris naudoja šifruotą prievadą, ir prisijunk slapyvardžiu (svečio prisijungimas veikia, jei serveris jį leidžia). Prie stalo viskas paskui elgiasi lygiai taip pat kaip oficialiame serveryje.'] },
        { id: 'famboard', t: 'Šeimos reitingas',
          b: ['Tik privačiuose serveriuose ir LAN žaidimuose klientas saugo suvestinę statistiką pagal slapyvardį — sužaistos ir laimėtos rankos bei partijos, didžiausias laimėjimas, geriausia serija — ir dalijasi ja per serverį, tad kiekvienas įrenginys prie stalo mato tą patį reitingą. pokerth.net žaidimai taip niekada nesekami, o treniruotės režimo statistika laikoma visiškai atskirai.'] },
        { id: 'language', t: 'Kalba',
          b: ['Sąsaja prieinama 36 kalbomis. Keisk ją bet kada Išplėstinėse parinktyse (krumpliaračio meniu), kategorijoje Naudotojo sąsaja. Pokerio veiksmų terminai (Fold, Check, Call, Bet, Raise, All-In) pagal susitarimą lieka anglų kalba, lygiai kaip darbalaukio kliente.'] },
        { id: 'pwa', t: 'Įdiek kaip programėlę',
          b: ['Šis klientas yra Progressive Web App: gali jį įdiegti iš naršyklės meniu (ar diegimo mygtuku antraštėje) ir gauti viso ekrano programėlę su sava piktograma. Įdiegus paleidžiama akimirksniu, o treniruotės režimas veikia visiškai neprisijungus.'],
          note: '\u201eAndroid\u201c ir darbalaukio \u201eChrome\u201c/\u201eEdge\u201c diegimo mygtukas padaro viską. \u201eiPhone\u201c/\u201eiPad\u201c įrenginiuose \u201eApple\u201c leidžia diegti tik per \u201eSafari\u201c: mygtukas Bendrinti \u2192 \u201ePridėti prie pagrindinio ekrano\u201c — klientas prireikus parodo šiuos žingsnius. Mygtukas dingsta, kai tik programėlė įdiegta.' },
        { id: 'platforms', t: 'Platformos ir naršyklės',
          b: ['Klientas veikia bet kurioje šiuolaikinėje naršyklėje bet kurioje sistemoje — Windows, macOS, Linux, Android, iOS. Kelios funkcijos priklauso nuo naujesnių naršyklių API; kai API trūksta, funkcija pasislepia arba paaiškina padėtį, užuot sugedusi. Pagrindiniai skirtumai, kuriuos verta žinoti:'],
          list: [
            '\u201eChrome\u201c / \u201eEdge\u201c (darbalaukis): veikia viskas, įskaitant .pdb žurnalo rašymą į aplanką.',
            '\u201eFirefox\u201c: viskas, išskyrus .pdb rašymą į aplanką (API dar neprieinama).',
            '\u201eSafari\u201c / iOS: diegimas eina per Bendrinti \u2192 \u201ePridėti prie pagrindinio ekrano\u201c; be vibracijos; visas ekranas ribotas \u201eiPhone\u201c; garsas prasideda po pirmo tavo palietimo.',
            '\u201eAndroid\u201c: visiškas palaikymas \u201eChromium\u201c naršyklėse, įskaitant vibraciją ir mygtuko Atgal elgseną.'] },
        { id: 'avatar', t: 'Slapyvardis ir avataras',
          b: ['Prieš prisijungdamas prisijungimo ekrane pasirink slapyvardį ir avatarą. pokerth.net svetainėje tavo slapyvardis yra paskyros vardas; avatarai dalijami kitiems žaidėjams per avatarų serverį.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pokerio taisyklės',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em trumpai',
          b: ['PokerTH žaidžiamas kaip No-Limit Texas Hold\u2019em. Kiekvienas žaidėjas gauna dvi uždaras kortas (hole cards). Paskui penkios bendros kortos dedamos atverstos stalo viduryje. Geriausia penkių kortų ranka, sudaryta iš bet kokio tavo dviejų kortų ir penkių bendrų derinio, laimi banką.'] },
        { id: 'blinds', t: 'Blindai ir dalintojo mygtukas',
          b: ['Prieš kiekvieną ranką banką papildo du privalomi statymai: small blind ir big blind, kuriuos deda du žaidėjai kairiau dalintojo mygtuko. Mygtukas po kiekvienos rankos pasislenka viena vieta pagal laikrodžio rodyklę, tad blindus visi moka paeiliui. Blindai partijos eigoje reguliariai kyla.',
              'Ant stalo mygtukas ir blindai pažymėti žetonais: D (dalintojas), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Keturi statymų ratai',
          list: [
            'Pre-flop — išdalijus uždaras kortas, pirmasis statymų ratas prasideda kairiau big blindo.',
            'Flop — atverčiamos trys bendros kortos, po jų statymų ratas.',
            'Turn — ketvirta bendra korta, tada dar vienas statymų ratas.',
            'River — penkta ir paskutinė bendra korta, tada baigiamasis statymų ratas.'],
          b: ['Statymų ratas baigiasi, kai kiekvienas rankoje likęs žaidėjas į banką įdėjo tą pačią sumą (arba yra all-in).'] },
        { id: 'actions', t: 'Ką gali daryti, kai tavo eilė',
          list: [
            'Fold — atsisakai rankos. Tavo kortos iškrenta ir dėl banko nebekovoji.',
            'Check — tęsi be statymo. Įmanoma tik tada, kai nėra ko mokėti.',
            'Call — atsakai į esamą statymą.',
            'Bet — atidarai statymus, kai šiame streete dar niekas nestatė.',
            'Raise — keli virš esamo statymo. Mažiausias kėlimas lygus ankstesniam statymui ar kėlimui.',
            'All-In — statai visą savo krūvą. Rankoje lieki iki sumos, kurią padengei.'] },
        { id: 'showdown', t: 'Showdown ir dalinami bankai',
          b: ['Jei po statymų rato river\u2019yje lieka keli žaidėjai, rankos parodomos ir geriausia laimi — laiminti kombinacija rodoma po bendromis kortomis. Kai žaidėjas yra all-in su mažiau nei pilni statymai, susidaro šalutiniai bankai: kiekvienas žaidėjas gali laimėti tik tą banko dalį, prie kurios prisidėjo. Lygios rankos banką dalijasi.'] },
        { id: 'hands', t: 'Rankų hierarchija',
          b: ['Nuo silpniausios iki stipriausios:'],
          list: [
            '1. High Card — jokios kombinacijos; lemia aukščiausia korta.',
            '2. Pair — dvi vienodos vertės kortos.',
            '3. Two Pair — dvi skirtingos poros.',
            '4. Three of a Kind — trys vienodos vertės kortos.',
            '5. Straight — penkios kortos iš eilės (tūzas skaitosi aukščiausias arba žemiausias).',
            '6. Flush — penkios tos pačios rūšies kortos.',
            '7. Full House — trejetas plius pora.',
            '8. Four of a Kind — keturios vienodos vertės kortos.',
            '9. Straight Flush — eilė, visa vienos rūšies.',
            '10. Royal Flush — nuo dešimtakės iki tūzo vienos rūšies. Geriausia įmanoma ranka.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Žaidimo ekranas',
      sections: [
        { id: 'actionbar', t: 'Veiksmų juosta',
          b: ['Kai tavo eilė, apatinė veiksmų juosta įsižiebia su iki keturių mygtukų: Fold (raudonas), Check / Call (mėlynas), Bet / Raise (žalias — pagrindinis veiksmas, paryškintas) ir All-In (tamsiai raudonas). Mygtukas Check / Call rodo tikslią mokėtiną sumą; Bet / Raise rodo sumą, kurią ruošiesi įdėti. Po river\u2019io All-In gali virsti mygtuku Show kortoms parodyti.'] },
        { id: 'betctl', t: 'Pasirink statymą',
          b: ['Kėlimo sumą reguliuok skaičių lauku, šliaužikliu ar sparčiaisiais mygtukais 1/3 \u00b7 1/2 \u00b7 Pot (esamo banko dalys). Sumos automatiškai apvalinamos ir laikomos tarp mažiausio ir didžiausio leistino kėlimo. Jei mieliau mąstai big blindais, parinktis rodo visas sumas BB, o ne žetonais.'] },
        { id: 'preselect', t: 'Veiksmo išankstinis pasirinkimas',
          b: ['Prieš savo eilę gali užtaisyti veiksmą iš anksto: paliesk mygtuką ir jis gauna auksinį rėmelį su mažu auksiniu tašku. Kai ateina tavo eilė, veiksmas įvykdomas iškart. Užtaisytas Fold automatiškai virsta Check, kai check nemokamas — niekada nenusimeti veltui. Išankstiniai pasirinkimai nusistato iš naujo su kiekviena nauja ranka, streeto pakeitimu ir showdownu, ir atšaukiami, jei padėtis pasikeičia (pavyzdžiui, jei pasikeičia mokėtina suma).'] },
        { id: 'automodes', t: 'Automatiniai režimai',
          b: ['Išskleidžiamasis meniu šalia veiksmų mygtukų siūlo tris žaidimo režimus: Rankinis, Auto Check/Call ir Auto Check/Fold. Automatiniai režimai žaidžia už tave, kol grįžti — bet koks rankinis paspaudimas ant veiksmo iškart grąžina Rankinį režimą.'] },
        { id: 'readtable', t: 'Stalo skaitymas',
          b: ['Kiekviena žaidėjo dėžutė rodo avatarą, vardą, krūvą ir esamą statymą. Dalintojas ir blindai pažymėti žetonais D / SB / BB. Spalvotas ženkliukas ant dėžutės rodo paskutinį žaidėjo veiksmą; plona mėlyna juostelė skaičiuoja jo mąstymo laiką. Eilės sulaukusio žaidėjo dėžutė įsižiebia; tavo paties dėžutė gauna pulsuojantį auksinį rėmelį, kai tavo eilė.',
              'Būsenos juosta virš stalo rodo bendrą banką, esamo streeto statymus, fazę (Pre-flop, Flop, Turn, River) ir partijos bei rankos numerius. Nusimetusių žaidėjų kortos peršviečiamos; iškritę pritamsinti. Rankos pabaigoje laimėtojo langas gali apibendrinti, kas ką laimėjo — išjungiama parinktyse.'] },
        { id: 'seatlayout', t: 'Vietų išdėstymas',
          b: ['Kaip žiniatinklio plėtinys žaidėjų dėžučių išdėstymas pasirenkamas Išplėstinės parinktys \u2192 Vietos: Automatinis seka oficialų klientą (fiksuotos padėtys stačiai, apskaičiuota elipsė gulsčiai), arba priverstinai taikyk Stačią ar Gulsčią išdėstymą — o Pasirinktinis leidžia kiekvieną vietą sudėlioti pačiam: atsiranda redagavimo režimas, kuriame kiekvieną dėžutę nutempi lygiai ten, kur nori, ir išdėstymas išsaugomas.'] },
        { id: 'zoom', t: 'Stalo mastelis (telefonai)',
          b: ['Mažuose ekranuose didinamojo stiklo mygtukai padidina stalą (2\u00d7) ir gali jį tempti pirštu — tavo dėžutė ir veiksmų juosta lieka vietoje. Vaizdas automatiškai seka aktyvią vietą ir showdown metu atitolsta bendram vaizdui. Išjungiama Išplėstinėse parinktyse.'],
          note: 'Telefonuose ir planšetėse pačios naršyklės suspaudimo mastelis pagal numatytuosius nustatymus užblokuotas, kad mastelio gestas niekada netyčia nesuveiktų rankos viduryje; jei nori, vėl įjunk jį Išplėstinės parinktys \u2192 Naudotojo sąsaja.' },
        { id: 'protections', t: 'Apsauga nuo žvilgčiojimo ir atsitiktinio Call',
          b: ['Dvi pasirenkamos apsaugos: apsauga nuo žvilgčiojimo laiko tavo kortas uždengtas, kol jų nepalieti (naudinga, kai kas nors mato tavo ekraną), o apsauga nuo atsitiktinio Call trumpam užrakina mygtuką Call iškart po didelio kėlimo, kad mažesniam Call skirtas palietimas netyčia nepataikytų į pakeltą sumą. Abi rasi Išplėstinėse parinktyse.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Informacijos skydelis',
      sections: [
        { id: 'open', t: 'Skydelio atidarymas',
          b: ['Žaidimo metu informacijos skydelis atidaromas iš antraštės (arba Alt+L / Alt+I) ir turi tris korteles: Žurnalas, Tikimybės ir Statistika. Telefone jis sklando virš stalo; didesniuose ekranuose tai perkeliamas ir keičiamo dydžio langas — suimk rankenėlę \u28ff perkelti, kraštus — dydžiui keisti. Jo padėtis įsimenama.'] },
        { id: 'log', t: 'Žaidimo žurnalas',
          b: ['Kortelė Žurnalas fiksuoja visą partiją ranka po rankos: blindus, kiekvieną veiksmą su sumomis, parodytas kortas ir laimėtojus, viskas nuspalvinta greitam skaitymui. Eksporto mygtukas išsaugo žurnalą į failą, jei nori vėliau peržiūrėti sesiją.'] },
        { id: 'odds', t: 'Tikimybės (tikimybių monitorius)',
          b: ['Kortelė Tikimybės tavo dabartinei rankai gyvai rodo tikimybę baigti su kiekviena iš 10 rankų kategorijų — nuo High Card iki Royal Flush — kiekviena su piktograma, procentu ir juostele. Rodymas papilkėja vos nusimeti. Naudoja tik tavo kortas ir bendras: nemato nieko, ko varžovai nerodo.'] },
        { id: 'journal', t: 'Rankų žurnalai ir langas \u201eŽurnalai\u201c',
          b: ['Be gyvo žurnalo, kiekviena sužaista ranka vietoje įrašoma į tavo naršyklę tuo pačiu formatu kaip oficialaus kliento .pdb žurnalo failai. Langas Žurnalai (Išplėstinės parinktys \u2192 Žurnalo pranešimai \u2192 Tvarkyti žurnalus\u2026) išvardija tavo sesijas ir leidžia su jomis dirbti: peržiūrėti sesiją su paieška ir paryškinimu, filtruoti pagal partiją, eksportuoti į HTML ar paprastą tekstą, išsaugoti neapdorotą .pdb failą arba importuoti darbalaukio kliento įrašytą .pdb. Sesijos trinamos po vieną arba visos iškart (su patvirtinimu), o automatinis saugojimas gali laikyti tik paskutines 7, 30, 90, 180 ar 365 dienų. Jūsų pačių importuoti žurnalai niekada nėra šalinami automatiškai. Antras nustatymas riboja, kiek seansų laikoma, o sąrašo stulpelį galima išplėsti tempiant.',
              'Mygtukas Analizuoti paleidžia sesijos rankų analizę ir gali nusiųsti žurnalą pokerth.net analizės paslaugai. Viskas lieka tavo įrenginyje, kol aiškiai neeksportuoji ar nenusiunti.'] },
        { id: 'logopts', t: 'Žurnalo parinktys',
          b: ['Išplėstinės parinktys \u2192 Žurnalo pranešimai gali įjungti ar išjungti įrašymą ir pasirinkti rašymo intervalą (po kiekvieno veiksmo ar kartą per ranką), kaip darbalaukio kliento nustatymuose. Papildoma parinktis rašo .pdb failą tiesiai į tavo pasirinktą aplanką ir atnaujina jį po kiekvienos rankos — lygiai kaip darbalaukio klientas, kad kiti įrankiai galėtų skaityti jį gyvai.'],
          note: 'Rašymui į vietinį aplanką reikia File System Access API: tik darbalaukio \u201eChrome\u201c ir \u201eEdge\u201c. \u201eFirefox\u201c, \u201eSafari\u201c ir mobiliosios naršyklės negali — parinktis tada rodo trumpą paaiškinimą, o rankinis eksportas iš lango Žurnalai lieka prieinamas visur.' },
        { id: 'assist', t: 'Asistentas (rankos stiprumas)',
          b: ['Kortelės Tikimybės viršuje asistento juosta skaito tavo ranką už tave. Prieš flopą ji įvardija tavo pradinę ranką ir įvertina ją žvaigždutėmis; nuo flopo rodo tavo dabartinę geriausią kombinaciją ir po greitos simuliacijos — numatomą tikimybę laimėti ranką procentais, su spalvos indikatoriumi nuo raudonos (silpna) iki žalios (stipri). Kaip ir tikimybių monitorius, naudoja tik informaciją, kurią gali matyti.',
              'Du rodymo stiliai yra Išplėstinės parinktys \u2192 Vietos: Segmentai (dešimt blokų) arba klasikinė eigos juosta. Visą asistentą galima išjungti Išplėstinės parinktys \u2192 Asistentas.'] },
        { id: 'assistwin', t: 'Asistentas kaip plūduriuojantis valdiklis',
          b: ['Asistento bloką galima atplėšti nuo skydelio į savą, visada viršuje esantį langelį: naudok atplėšimo mygtuką ant bloko, tada perkelk ir keisk jo dydį bet kur virš stalo — patogu stebėti rankos stiprumą neatidarant viso skydelio. Pritvirtinimo mygtukas grąžina jį į kortelę Tikimybės, o padėtis įsimenama. Skydelio viduje tempimo rankenėlė tarp Asistento ir tikimybių leidžia paskirstyti erdvę tarp jų.'] },
        { id: 'stats', t: 'Statistika',
          b: ['Kortelė Statistika seka tavo sesiją: sužaistos rankos, matyti flopai, showdownai, laimėjimų procentai ir dar daugiau. Statistikos sekimą galima išjungti Išplėstinėse parinktyse.'] },
        { id: 'hud', t: 'Statistikos HUD prie vietų (beta)',
          b: ['HUD prie kiekvieno žaidėjo vietos prisega mažą statistikos dėžutę, sudarytą iš tavo žurnaluose įrašytų rankų: stebėtų rankų skaičius, tada VPIP (kaip dažnai savanoriškai deda pinigus pre-flop), PFR (pre-flop kėlimai), AF (agresijos koeficientas), 3B (3-bet), CB (continuation bet) ir F3B (fold į 3-bet), su spalvų kodais nuo pasyvaus iki agresyvaus. Paliesk dėžutę detaliam iškylančiajam su daugiau skaičių (steal bandymai, fold į steal, showdown dalys\u2026), ir patempk ją, jei ką nors uždengia.',
              'HUD žino tik tai, ką matei prie savo stalų — jis skaito tavo vietinius rankų žurnalus, tad įrašymas turi būti įjungtas, o skaičiai prasmingi tampa tik po pakankamai rankų. Tai beta funkcija, pagal numatytuosius nustatymus išjungta: įjunk ją Išplėstinės parinktys \u2192 Asistentas.'] },
        { id: 'handsbtn', t: 'Kombinacijų apžvalga',
          b: ['Pokerio rankų piktograma ant stalo audeklo bet kada atidaro greitą 10 kombinacijų apžvalgą — patogu mokantis. Galima paslėpti Išplėstinėse parinktyse.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Pokalbiai ir bendravimas',
      sections: [
        { id: 'panels', t: 'Fojė pokalbis ir stalo pokalbis',
          b: ['Vienas pokalbis yra fojė, kitas prie stalo. Telefone stalo pokalbis sklando virš žaidimo; didesniuose ekranuose tai perkeliamas ir keičiamo dydžio langas. Ženkliukas ant pokalbio mygtuko skaičiuoja neskaitytas žinutes.'] },
        { id: 'typing', t: 'Rašymo pagalbininkai',
          list: [
            'Tab užbaigia slapyvardį — spausk Tab dar kartą, kad pereitum per atitikmenis.',
            '\u2191 / \u2193 varto tavo paties žinučių istoriją.',
            'Jaustukų mygtukas atidaro pilną parinkiklį; rašant : taip pat siūlomi emote rašymo metu.'] },
        { id: 'emotes', t: 'Emote ir šypsenėlės',
          b: ['Pokalbis emote kodus verčia lygiai taip pat kaip oficialus darbalaukio klientas: parašyk pavadinimą tarp dviejų dvitaškių ir jis virsta jaustuku — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 palaikoma per 1 900 kodų (pilnas GitHub rinkinys). Verčiamos ir klasikinės tekstinės šypsenėlės: :-) ;) :D xD :P <3 ir dar apie aštuoniasdešimt.',
              'Rašant : atsidaro pasiūlymų dėžutė, kuri užbaigia kodą rašymo metu (\u2191/\u2193 pasirinkti, Tab ar Enter patvirtinti). Jaustukų vertimą galima visiškai išjungti Išplėstinės parinktys \u2192 Pokalbis.'] },
        { id: 'commands', t: 'Pokalbio komandos',
          b: ['Pokalbis supranta pasvirojo brūkšnio komandas. Dvi matomos kitiems:'],
          keys: [
            ['/me <tekstas>', 'Veiksmo žinutė, rodoma kaip \u201e* tavoslapyvardis tekstas\u201c'],
            ['/emoji <jaustukas>', 'Paleidžia jaustuko reakciją (tą pačią, kurią siunčia reakcijų parinkiklis)']] },
        { id: 'diagcmds', t: 'Diagnostikos komandos',
          b: ['Visa kita vietinė: atsakymus matai tik tu ir niekas nesiunčiama stalui. Parašyk /help visoms išvardyti. Naudingiausios:'],
          keys: [
            ['/help', 'Išvardyti visas komandas'],
            ['/update', 'Patikrinti naują versiją ir atnaujinti'],
            ['/lang <kodas>', 'Pakeisti kalbą (pvz., /lang lt)'],
            ['/sound on|off', 'Įjungti/nutildyti žaidimo garsus'],
            ['/zoom', 'Perjungti stalo didinamąjį stiklą'],
            ['/clear', 'Išvalyti pokalbį vietoje'],
            ['/table', 'Dabartinės partijos informacija (blindai, žaidėjai, krūvos)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Kliento būsenos, tinklo ir sklandumo diagnostika'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Išplėstinis derinimas (kortos, protokolas, garsas, saugykla, vietos)'],
            ['/copy', 'Nukopijuoti paskutinį komandos atsakymą į iškarpinę']] },
        { id: 'reactions', t: 'Jaustukų reakcijos',
          b: ['Reakcijų mygtukas atidaro parinkiklį su 30 animuotų reakcijų (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026), kurios su efektu paleidžiamos virš tavo vietos, matomos visam stalui — įskaitant darbalaukio kliento žaidėjus. Reakcijas galima visiškai išjungti Išplėstinėse parinktyse.'] },
        { id: 'translate', t: 'Suprask visus',
          b: ['Įjungus pokalbių vertimą, vertimo mygtukas atsiranda eilutėje po žymekliu — arba toje, kurią bakstelsi jutikliniame ekrane — ir parodo žinutę tavo kalba naršyklės vertėju. Jį galima nuolat rodyti visose eilutėse per Papildomas parinktis → Pokalbiai, kur gyvena ir paaiškinimas apie įprastas stalo santrumpas (gg, nh, utg…).'],
          note: 'Vertimas naudoja Google Translate paslaugą ir veikia bet kurioje naršyklėje — reikia tik interneto ryšio. Žinutė vertimo paslaugai siunčiama tik tada, kai palieti jos vertimo mygtuką, niekada automatiškai.' },
        { id: 'social', t: 'Žaidėjai: profilis, kvietimas, ignoravimas',
          b: ['Paliesk bet kurį žaidėją — prie stalo ar fojė sąraše — kad atidarytum jo kortelę: profilis ir statistika, kvietimas į tavo partiją arba ignoravimas (jo pokalbio žinutės paslepiamos; ignoravimą bet kada gali atšaukti). Patvirtinimą prieš kvietimą/ignoravimą galima įjungti parinktyse.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Fojė ir partijos',
      sections: [
        { id: 'list', t: 'Partijų sąrašas',
          b: ['Fojė išvardija visus serverio stalus. Kiekvienas įrašas rodo žaidėjų skaičių, partijos tipą, spynelę, kai reikia slaptažodžio ar kvietimo, ir būsenos ženkliuką: \u201eLaukiama\u201c (žalias — partija neprasidėjo, gali prisijungti, jei yra laisva vieta), \u201eVyksta\u201c (šilta spalva — galima žiūrėti gyvai, kai leidžiami žiūrovai) ir \u201eUždaryta\u201c (pritemdytas). Pilnas stalas atpažįstamas tiesiog iš pilno skaitiklio, pvz., 10/10; ženkliukų spalvos seka aktyvią temą.',
              'Filtro išskleidžiamasis siaurina sąrašą lygiai kaip darbalaukio klientas, kiekvienas pasirinkimas griežtesnis už ankstesnį: tik atviros partijos \u2192 slepiant ir pilnus stalus \u2192 tada tik neprivačios, tik privačios arba tik reitinguojamos partijos. Tavo pasirinkimas įsimenamas. Paieškos laukas randa partiją pagal pavadinimą, o žaidėjų ženkliukas atidaro visų prisijungusiųjų sąrašą su paieška ir rikiavimu.'] },
        { id: 'join', t: 'Prisijungimas ir stebėjimas',
          b: ['Pasirink atvirą partiją ir prisijunk — spynelė reiškia, kad reikia slaptažodžio. Vykstančias partijas, kurios leidžia žiūrovus, galima žiūrėti gyvai: matai stalą ir pokalbį, bet uždaros kortos lieka paslėptos ir veikti negali.'] },
        { id: 'gameinfo', t: 'Partijos informacija',
          b: ['Prieš prisijungiant partijos informacijos kortelė rodo viską, kas apibrėžia stalą: partijos tipą, blindus ir jų kilimą (dvigubinimas ar rankinis sąrašas), pradinę krūvą, veiksmo laiką, pauzę tarp rankų ir kas jau sėdi.'] },
        { id: 'create', t: 'Partijos kūrimas',
          b: ['Sukurk savo stalą: pavadinimas, žaidėjų skaičius, pradinė krūva, pirmas small blind ir kėlimo grafikas, veiksmo laikas ir ar leidžiami žiūrovai. Yra keturi partijų tipai: Normali (visi), tik registruoti žaidėjai, tik su kvietimu ir Reitinguojama (skaičiuojama į oficialų reitingą — tokiu atveju slaptažodis negalimas). Mėgstamus nustatymus gali išsaugoti ir vėl įkelti.'] },
        { id: 'invites', t: 'Kvietimai',
          b: ['Žaidėjai gali pakviesti tave prie savo stalo; gauni pranešimą, kurį gali priimti ar atmesti. Būti pakviestam — vienintelis būdas patekti į partiją tik su kvietimu.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Tavo paskyra',
          b: ['Oficialus interneto serveris yra pokerth.net. Žaidimui ten reikia nemokamos pokerth.net paskyros — užsiregistruok svetainėje, tada prisijunk čia tuo pačiu slapyvardžiu ir slaptažodžiu. Šis žiniatinklio klientas jungiasi prie lygiai to paties serverio kaip darbalaukio klientas: tos pačios paskyros, tie patys stalai, tie patys reitingai, ir gali sėsti prie stalo su darbalaukio kliento žaidėjais.'] },
        { id: 'ranked', t: 'Reitinguojamos partijos ir sezonai',
          b: ['Reitinguojamo tipo partijos skaičiuojamos į oficialų sezono reitingą. Tavo profilis programėlėje rodo registracijos datą, dabartinio sezono Rank, tavo Score, vidurkį ir sužaistas partijas bei paskutinius rezultatus. Normalios (nereitinguojamos) partijos — tik pramogai ir nieko nekeičia.'] },
        { id: 'rankhow', t: 'Kaip skaičiuojamas reitingas',
          b: ['Kiekvienoje reitinguojamoje partijoje tavo vieta duoda taškų: 15 už pirmą, paskui 9, 6, 4, 3, 2 ir 1 iki septintos; nuo aštuntos iki dešimtos – nieko. Taigi stalas išdalija iš viso 40 taškų.',
              'Tavo Score – ne šių taškų suma, o tavo vidurkis vienai partijai, sušvelnintas koeficiento, kuris auga su sužaistų partijų skaičiumi: kelių gerų rezultatų neužtenka įsitvirtinti viršuje, reikia ir pastovumo — kuo daugiau žaidi, tuo arčiau tavo Score prie tikrojo tavo vidurkio. Sezonas trunka ketvirtį: keičiantis viskas suarchyvuojama, o skaitikliai pradeda nuo nulio, praėję sezonai lieka peržiūrimi. Žaidime pjedestalo mygtukas rodo prie tavo stalo sėdinčių žaidėjų sezono reitingą.'],
          note: 'Taškų skalę ir tikslią formulę nustato pokerth.net reitingų serveris, jos gali keistis; lemiami yra svetainės puslapiai.' },
        { id: 'rankings', t: 'Reitingų puslapiai',
          b: ['Reitingų įrašas atidaro oficialų PokerTH reitingą su paieška pagal žaidėją, taip pat bendruomenės reitingus (BBC, WEC). Jei reitingai tavęs nedomina, įrašą galima paslėpti Išplėstinės parinktys \u2192 Bendruomenė.'] },
        { id: 'cups', t: 'Bendruomenės taurės: BBC ir WeCup',
          b: ['Dvi bendruomenės pokerth.net rengia savo varžybas, kiekviena su sava svetaine ir savu reitingu. Best Brainies Cup (BBC) – 2013 m. gimęs pakopų turnyras: kylama nuo Step 1 iki Step 4, o naujas sezonas prasideda po kiekvienos Step 4 partijos, kai įteikiama taurė. WeCup (WEC) turi savo, kur kas plačiau išdėstytą skalę — 75 taškai už pirmą vietą, paskui 45, 30, 20… — o jo score normalizuoja tavo vidurkį pagal sužaistų partijų skaičių, palyginti su kitais nariais.',
              'Abu reitingai atveriami taurės mygtuku, šalia PokerTH reitingo. Šių varžybų stalo nustatymai pateikiami kaip išankstiniai rinkiniai kuriant partiją (BBC Step 1–4, WEC, WEC Monthly Final ir WEC Grand Final), tad gali treniruotis tomis pačiomis sąlygomis. Dalyvavimui reikia registracijos atitinkamos taurės svetainėje.'],
          note: 'Jei taurės tavęs nedomina, visą šį turinį paslėpsi iškart Išplėstinės parinktys → Bendruomenė.' },
        { id: 'forumcups', t: 'Forumo taurės ir renginiai',
          b: ['pokerth.net forume vyksta ir Monthly Cup – mėnesinis ciklas, kuriame žaidėjai paskirstomi prie Gold, Silver ir Bronze stalų, kol išaiškinamas mėnesio čempionas, o be to per metus būna pavienių specialių taurių.',
              'Registracijos, laikai, stalo nustatymai ir rezultatai skelbiami forume, o partijos žaidžiamos oficialiame serveryje kaip ir visos kitos. Rezultatams sekti užtenka pokerth.net paskyros; į taurę registruojamasi atitinkamoje forumo gijoje.'] },
        { id: 'avatars', t: 'Avatarai ir vėliavos',
          b: ['pokerth.net svetainėje tavo avataras platinamas kitiems žaidėjams per avatarų serverį, o ant žaidėjų dėžučių gali būti rodoma maža šalies vėliava. Abu dalykai pasirenkami ir nustatomi parinktyse.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Treniruotės režimas',
      sections: [
        { id: 'what', t: 'Kas tai',
          b: ['Vietinis / treniruotės režimas — pilnavertė partija prieš kompiuterio valdomus varžovus: be ryšio, be paskyros, niekas nestatoma. Kai programėlė įdiegta (ar net tik kartą aplankyta), ji veikia visiškai neprisijungus — puikiai tinka mokytis žaidimo, išbandyti sąsają ar leisti laiką lėktuvo režimu.'] },
        { id: 'setup', t: 'Partijos nustatymas',
          b: ['Pasirink varžovų skaičių, pradinę krūvą, blindus ir jų kilimą bei žaidimo greitį. Botų sudėtis ir sudėtingumas reguliuojami Išplėstinės parinktys \u2192 Vietinė partija — nuo švelnių varžovų iki kietesnio ir įvairesnio stalo.'] },
        { id: 'trophies', t: 'Trofėjai',
          b: ['Treniruotės režimas turi savą pažangą: 28 trofėjai šešiose kategorijose (pažanga, technika, stilius, formatai, pramoga ir viena slapta) atrakinami žaidžiant — sužaistos rankos, laimėtos partijos, dideli blefai, ypatingos rankos ir dar daugiau. Trofėjų pažanga kaupiama ir sujungiama tarp įrenginių, kai įjungtas paskyros nustatymų sinchronizavimas.'] },
        { id: 'learn', t: 'Gera vieta mokytis',
          b: ['Viskas, kas aprašyta kituose skyriuose, veikia ir čia: tikimybių monitorius, asistento rodymas, išankstinis pasirinkimas, spartieji klavišai. Treniruotės režimas — geriausia vieta juos išbandyti be spaudimo, prieš neriant į pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stilius ir garsas',
      sections: [
        { id: 'themes', t: 'Temos',
          b: ['Išplėstinių parinkčių kategorija Stilius aprengia visą klientą. Šablonai viską nustato vienu palietimu (klasikinis žalias kazino, oficiali PokerTH išvaizda\u2026); žemiau atskiros ašys atskirai derina spalvų paletę, stalo audeklą ir kortų priekius — pakeisk bet kurią ašį, ir tavo derinys taps pasirinktine tema. Tamsus, šviesus ar automatinis režimas pasirenkamas Naudotojo sąsajoje, o tavo pasirinkimai galioja iškart, kiekviename ekrane, ir įsimenami.'] },
        { id: 'tablelook', t: 'Stalai, kaladės, vietos',
          b: ['Be temos, keli elementai keičiami nepriklausomai: stalo fonas, kortų kaladė, kortų nugarėlė (automatiškai derinama prie kaladės, arba importuok savo paveikslėlį), dalintojo ir blindų žetonai, veiksmų mygtukų stilius bei pilni vietų paketai, perrengiantys žaidėjų dėžutes. Viską pasirink Išplėstinės parinktys \u2192 Stilius; pakeitimai iškart matomi prie stalo.'] },
        { id: 'music', t: 'Muzikos grotuvas',
          b: ['Muzikos įrašas antraštės meniu atidaro mažą foninės muzikos grotuvą: pasirink kūrinį iš grojaraščio, groti/pauzė, ankstesnis/kitas, maišymas ir vieno kūrinio, viso sąrašo ar nieko kartojimas. Garsumas, pasirinktas kūrinys ir kartojimo režimas įsimenami. Grojimas niekada neprasideda savaime — naršyklės reikalauja palietimo — o grotuvas visiškai nepriklausomas nuo žaidimo garso efektų.'] },
        { id: 'sounds', t: 'Garso efektai',
          b: ['Žaidimo garsai sugrupuoti į keturias atskirai įjungiamas kategorijas, lygiai kaip darbalaukio kliente: žaidimo veiksmai (išdalytos kortos, Check, Call, Raise, tavo eilė\u2026), fojė pokalbio pranešimas, tinklo partijos pranešimai (žaidėjas prisijungė, partija paruošta) ir blindų kilimo pranešimas. Vienas garsumo šliaužiklis valdo visus, Išplėstinės parinktys \u2192 Garsas.'],
          note: 'Visos naršyklės — ypač iOS — atsisako groti garsą, kol kartą nepaliesi puslapio. Jei partija prasideda tyloje, vienas palietimas bet kur pažadina garsą; klientas taip pat automatiškai pataiso garso variklį, kai iOS jį pristabdo (įeinantis skambutis, fonas\u2026).' },
        { id: 'voice', t: 'Balsas ir vibracija',
          b: ['Du papildomi kanalai gali laikyti tave informuotą nežiūrint į ekraną: balso pranešimai garsiai skaito žaidimo įvykius per tavo įrenginio kalbos sintezę, o telefone trumpa vibracija gali pažymėti tavo eilę. Abu yra žiniatinklio plėtiniai, pagal numatytuosius nustatymus įjungti ar ne priklausomai nuo įrenginio, Išplėstinės parinktys \u2192 Statymai ir eilė.'],
          note: 'Vibracija veikia \u201eAndroid\u201c (\u201eChromium\u201c naršyklės); \u201eApple\u201c nesuteikia vibracijos API svetainėms, tad \u201eiPhone\u201c vibruoti negali. Balso pranešimai veikia visur, bet prieinami balsai ir kalbos priklauso nuo tavo sistemos — klientas naudoja geriausią rastą atitikmenį.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Parinktys ir spartieji klavišai',
      sections: [
        { id: 'where', t: 'Kur gyvena parinktys',
          b: ['Išplėstinės parinktys atidaromos krumpliaračio įrašu bet kuriame antraštės meniu. Jos sugrupuotos kaip darbalaukio kliente: Naudotojo sąsaja, Stilius, Garsas, Vietinė partija, Tinklo partija, Interneto partija, Slapyvardžiai / Avatarai, Žurnalo pranešimai ir Atkurti numatytuosius. Kiekviena žiniatinkliui būdinga funkcija ten turi savą jungiklį, tad gali išjungti viską, ko nenaudoji.'] },
        { id: 'cfgxml', t: 'Nustatymų mainai su darbalaukio klientu',
          b: ['Tavo nustatymai gali keliauti tarp klientų: kategorija Žurnalo pranešimai siūlo oficialaus config.xml failo eksportą/importą (to \u007e/.pokerth/config.xml, kurį naudoja darbalaukio ir QML klientai). Eksportas įrašo bendrus nustatymus — vardą, rodymo parinktis, garsus, stalo pageidavimus, blindus, stilius — o importas čia pritaiko failą iš kompiuterio. Nustatymai, kurių šis klientas nežino, faile lieka nepaliesti.'] },
        { id: 'sync', t: 'Nustatymai, kurie tave seka',
          b: ['Žaidžiant su paskyra tavo parinktys, tema, klavišų priskyrimai, kalba ir treniruotės trofėjai sinchronizuojami: pakeisk ką nors viename įrenginyje, ir kitas įrenginys, kuriame prisijungsi, tai perims. Trofėjų pažanga sujungiama, niekada neperrašoma, tad žaidimas dviejuose įrenginiuose visada išlaiko geriausią iš abiejų.'] },
        { id: 'updates', t: 'Lik atnaujintas',
          b: ['Klientas atsinaujina pats: išleidus naują versiją juosta pakviečia perkrauti (arba parašyk /update pokalbyje rankiniam patikrinimui). Retkarčiais gali pasirodyti maža produkto apklausa apie tavo nuomonę dėl funkcijos — dalyvavimas savanoriškas, o apklausas galima visiškai išjungti Išplėstinės parinktys \u2192 Bendruomenė.'] },
        { id: 'fkeys', t: 'Oficialūs spartieji klavišai',
          b: ['Oficialūs PokerTH funkciniai klavišai veikia partijos metu:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (tvarką galima apversti parinktyse)'],
            ['F5', 'Parodyti savo kortas (kai įmanoma)'],
            ['F6 / F7 / F8', 'Rankinis \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Rankinis \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Pokalbis \u00b7 Žurnalas \u00b7 Tikimybių skydelis'],
            ['Alt+S', 'Nustatymai — bet kur programoje, ne tik žaidimo metu'],
            ['F11', 'Visas ekranas']],
          note: 'Spartiesiems klavišams reikia fizinės klaviatūros. \u201eMac\u201c F klavišai pagal numatytuosius nustatymus valdo mediją: laikyk Fn (arba macOS nustatymuose įjunk \u201eNaudoti F1, F2 ir kt. klavišus kaip standartinius funkcinius klavišus\u201c). \u201eiPhone\u201c visą ekraną riboja iOS — programėlės įdiegimas kaip PWA suteikia tą pačią viso ekrano patirtį.' },
        { id: 'webkeys', t: 'Žiniatinklio raidžių klavišai',
          b: ['Žiniatinklio plėtinys: vienos raidės klavišai ir Alt+T taip pat vykdo veiksmus, o visus galima perskirti Papildomose parinktyse → Sparčiieji klavišai:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Statistikos skydelis'],
            ['Esc', 'Uždaryti viršutinį langą (taip pat \u201eAndroid\u201c mygtukas Atgal)']],
          note: '\u201eAndroid\u201c sistemos mygtukas/gestas Atgal uždaro langus kaip Esc, užuot palikęs partiją (nustatoma parinktyse). iOS neturi atitinkamo sistemos mygtuko — naudok kiekvieno lango \u2715.' }
      ]
    }
  ]
};
