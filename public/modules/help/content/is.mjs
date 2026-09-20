// ── help/content/is.mjs — Icelandic (Íslenska) help corpus ─────────────────────────
//
// Same structure as en.mjs (reference): chapters[] → { id, icon, title,
// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand
// names of the rules chapter stay in English, as in the other help corpora.
export const help = {
  chapters: [
    {
      id: "start", icon: "🚀", title: "Fyrstu skrefin",
      sections: [
        { id: "modes",
          t: "Þrjár leiðir til að spila",
          b: [
            "Á innskráningarskjánum velurðu hvernig þú vilt spila."],
          list: [
            "Internet — spilaðu á netinu með stigatöflu á opinbera pokerth.net þjóninum. Krefst pokerth.net aðgangs; skráðu þig ókeypis á pokerth.net.",
            "Staðbundið / æfing — spilaðu ótengt gegn bottum. Ekkert þarf að setja upp, virkar án tengingar og opnar verðlaun eftir því sem þér miðar áfram.",
            "LAN / sérþjónn — tengstu PokerTH einkaþjóni á staðarnetinu þínu eða á þinni eigin vél."] },
        { id: "lan",
          t: "LAN / sérþjónn",
          b: [
            "Þriðji hamurinn tengist hvaða PokerTH þjóni sem þú eða vinur rekur — á heimaneti, einka-VPS, hvar sem er. Sláðu inn vistfang og gátt þjónsins, hakaðu við TLS ef þjónninn notar dulkóðuðu gáttina og skráðu þig inn með gælunafni (gestaaðgangur virkar ef þjónninn leyfir). Eftir það virkar allt við borðið nákvæmlega eins og á opinbera þjóninum."] },
        { id: "famboard",
          t: "Fjölskyldustigatafla",
          b: [
            "Aðeins á einkaþjónum og í LAN-leikjum heldur biðlarinn ævitölfræði fyrir hvert gælunafn — spilaðar og unnar hendur og leiki, stærsta vinning, bestu sigurrunu — og deilir henni í gegnum þjóninn, þannig að öll tæki við borðið sjá sömu stigatöflu. Leikir á pokerth.net eru aldrei skráðir á þennan hátt og tölfræði æfingahams er geymd alveg sér.",
            "Í þessum leikjum opnar bikarhnappurinn stigatöflugluggann á LAN-flipanum: allir leikmenn, hægt að raða eftir nokkrum viðmiðum."] },
        { id: "language",
          t: "Tungumál",
          b: [
            "Viðmótið er til á 63 tungumáli. Skiptu um hvenær sem er í ítarlegum valkostum (tannhjólsvalmyndin), undir Notendaviðmót. Aðgerðaorð pókersins (Fold, Check, Call, Bet, Raise, All-In) haldast á ensku samkvæmt hefð, alveg eins og í skjáborðsbiðlaranum."] },
        { id: "pwa",
          t: "Setja upp sem forrit",
          b: [
            "Þessi biðlari er Progressive Web App: þú getur sett hann upp úr valmynd vafrans (eða með uppsetningarhnappinum í hausnum) og fengið forrit á öllum skjánum með eigin tákni. Eftir uppsetningu ræsist það samstundis og æfingahamurinn virkar alveg ótengt."],
          note: "Á Android og í Chrome/Edge á tölvu sér uppsetningarhnappurinn um allt. Á iPhone/iPad leyfir Apple aðeins uppsetningu í gegnum Safari: deilihnappurinn → “Bæta við heimaskjá” — biðlarinn sýnir þessi skref þegar þarf. Hnappurinn hverfur þegar forritið hefur verið sett upp." },
        { id: "platforms",
          t: "Stýrikerfi og vafrar",
          b: [
            "Biðlarinn keyrir í hvaða nútímavafra sem er, á hvaða kerfi sem er — Windows, macOS, Linux, Android, iOS. Nokkrir eiginleikar reiða sig á nýleg vafra-API; þegar API vantar felur eiginleikinn sig eða útskýrir ástæðuna í stað þess að bila. Helstu munurinn sem vert er að vita af:"],
          list: [
            "Chrome / Edge (tölva): allt virkar, líka að skrifa .pdb skrána í möppu.",
            "Firefox: allt nema að skrifa .pdb skrána í möppu (API ekki enn í boði).",
            "Safari / iOS: uppsetning í gegnum Deila → Bæta við heimaskjá; enginn titringur; allur skjárinn takmarkaður á iPhone; hljóð byrjar eftir fyrstu snertingu þína.",
            "Android: fullur stuðningur í Chromium-vöfrum, þar á meðal titringur og hegðun Til baka-hnappsins."] },
        { id: "avatar",
          t: "Gælunafn og avatar",
          b: [
            "Veldu gælunafn og avatar á innskráningarskjánum áður en þú tengist. Á pokerth.net er gælunafnið þitt heiti aðgangsins; avatörum er deilt með öðrum leikmönnum í gegnum avatarþjóninn.",
            "Avatarinn er sendur þegar þú tengist og allir leikmenn sjá sama avatar. Ef þú breytir honum meðan þú ert tengd(ur) tekur nýi avatarinn gildi við næstu tengingu. Upphafsstafurinn (Aa) er ekki sendur: aðrir leikmenn sjá sjálfgefna avatarinn."] },
      ]
    },
    {
      id: "rules", icon: "🃏", title: "Pókerreglur",
      sections: [
        { id: "basics",
          t: "Texas Hold’em í hnotskurn",
          b: [
            "PokerTH spilar No-Limit Texas Hold’em. Hver leikmaður fær tvö einkaspil (holuspil). Síðan eru fimm sameiginleg spil lögð upp í loft á mitt borðið. Besta fimm spila höndin, mynduð úr hvaða samsetningu sem er af spilunum þínum tveimur og sameiginlegu spilunum fimm, vinnur pottinn."] },
        { id: "blinds",
          t: "Blindir og gjafarahnappurinn",
          b: [
            "Fyrir hverja hönd hefja tvö skylduveðmál pottinn: litli blindur og stóri blindur, sem leikmennirnir tveir vinstra megin við gjafarahnappinn leggja út. Hnappurinn færist um eitt sæti réttsælis eftir hverja hönd, svo allir borga blindana til skiptis. Blindarnir hækka með reglulegu millibili eftir því sem líður á leikinn.",
            "Á borðinu eru hnappurinn og blindarnir merktir með skífum: D (gjafari), SB (litli blindur) og BB (stóri blindur)."] },
        { id: "streets",
          t: "Veðloturnar fjórar",
          list: [
            "Pre-flop — eftir að holuspilin hafa verið gefin hefst fyrsta veðlotan vinstra megin við stóra blindinn.",
            "Flop — þrjú sameiginleg spil eru sýnd og svo kemur veðlota.",
            "Turn — fjórða sameiginlega spilið og svo önnur veðlota.",
            "River — fimmta og síðasta sameiginlega spilið og svo lokaveðlotan."],
          b: [
            "Veðlotu lýkur þegar allir leikmenn sem enn eru í höndinni hafa lagt jafnmikið í pottinn (eða eru all-in)."] },
        { id: "actions",
          t: "Það sem þú getur gert þegar þú átt leik",
          list: [
            "Fold — gefa höndina eftir. Spilin þín eru lögð til hliðar og þú keppir ekki lengur um pottinn.",
            "Check — láta leikinn ganga áfram án þess að veðja. Aðeins hægt þegar ekkert er til að jafna.",
            "Call — jafna núverandi veðmál.",
            "Bet — opna veðmálin þegar enginn hefur veðjað í þessari lotu.",
            "Raise — hækka veðmálið sem fyrir er. Lágmarks-Raise jafngildir fyrra veðmáli eða Raise.",
            "All-In — leggja allan staflann þinn undir. Þú ert áfram í höndinni upp að þeirri upphæð sem þú dekkar."] },
        { id: "showdown",
          t: "Uppgjör og skipting potta",
          b: [
            "Ef fleiri en einn leikmaður er eftir að lokinni veðlotunni á river eru hendur sýndar og besta höndin vinnur — vinningssamsetningin er sýnd fyrir neðan sameiginlegu spilin. Þegar leikmaður er all-in fyrir minna en full veðmál myndast hliðarpottar: hver leikmaður getur aðeins unnið þann hluta pottsins sem hann lagði í. Jafnar hendur skipta pottinum.",
            "Ekki þurfa allir að sýna: byrjað er á þeim sem síðast sagði Bet eða Raise, og hönd er aðeins sýnd ef hún slær það sem þegar hefur verið sýnt. Þeir sem eiga rétt á að halda spilunum leyndum geta gert það og fá Sýna-hnapp ef þeir vilja samt sýna þau."] },
        { id: "hands",
          t: "Röðun handa",
          b: [
            "Frá veikustu til sterkustu:"],
          list: [
            "1. High Card — engin samsetning; hæsta spilið ræður.",
            "2. Pair — tvö spil með sama gildi.",
            "3. Two Pair — tvö ólík pör.",
            "4. Three of a Kind — þrjú spil með sama gildi.",
            "5. Straight — fimm spil í röð (ásinn getur talið sem hár eða lágur).",
            "6. Flush — fimm spil í sömu sort.",
            "7. Full House — þrjú spil með sama gildi og par.",
            "8. Four of a Kind — fjögur spil með sama gildi.",
            "9. Straight Flush — Straight í einni og sömu sort.",
            "10. Royal Flush — tía upp í ás, öll í sömu sort. Besta mögulega höndin."] },
      ]
    },
    {
      id: "game", icon: "🎮", title: "Leikskjárinn",
      sections: [
        { id: "actionbar",
          t: "Aðgerðastikan",
          b: [
            "Þegar þú átt leik lýsist aðgerðastikan neðst upp með allt að fjórum hnöppum: Fold (rauður), Check / Call (blár), Bet / Raise (grænn — auðkennd aðalaðgerð) og All-In (dökkrauður). Check / Call hnappurinn sýnir nákvæma upphæð sem þarf til að jafna; Bet / Raise sýnir upphæðina sem þú ert að fara að leggja undir. Eftir river getur All-In hnappurinn breyst í Sýna-hnapp til að sýna spilin þín."] },
        { id: "betctl",
          t: "Að velja veðmálið",
          b: [
            "Stilltu Raise-upphæðina með talnareitnum, sleðanum eða hraðhnöppunum 1/3 · 1/2 · pottur (hlutar af núverandi potti). Upphæðir eru námundaðar sjálfkrafa og haldið á milli leyfilegs lágmarks- og hámarks-Raise. Ef þú hugsar frekar í stórum blindum sýnir valkostur allar upphæðir í BB í stað spilapeninga."] },
        { id: "preselect",
          t: "Að velja aðgerð fyrirfram",
          b: [
            "Þú getur virkjað aðgerð áður en kemur að þér: snertu hnapp og hann fær gylltan ramma og lítinn gylltan punkt. Þegar þú átt leik er aðgerðin spiluð samstundis. Fold sem valið var fyrirfram verður sjálfkrafa Check ef Check er ókeypis — þú segir aldrei Fold að óþörfu. Forval endurstillist við hverja nýja hönd, þegar skipt er um lotu og í uppgjöri, og fellur niður ef aðstæður breytast (til dæmis ef upphæðin sem þarf að jafna breytist)."] },
        { id: "automodes",
          t: "Sjálfvirkir hamir",
          b: [
            "Fellilistinn við hlið aðgerðahnappanna býður upp á þrjá spilunarhami: Handvirkt, Sjálfv. Check/Call og Sjálfv. Check/Fold. Sjálfvirku hamirnir spila fyrir þig þar til þú skiptir til baka — ef þú smellir sjálf(ur) á einhverja aðgerð ferðu strax aftur í Handvirkt."] },
        { id: "readtable",
          t: "Að lesa borðið",
          b: [
            "Reitur hvers leikmanns sýnir avatar, nafn, stafla og núverandi veðmál. Gjafari og blindir eru merktir með skífunum D / SB / BB. Litað merki á reitnum sýnir síðustu aðgerð leikmannsins; mjó blá stika telur niður umhugsunartíma hans. Reitur þess sem á leik glóir; þegar þú átt leik fær þinn eigin reitur gylltan ramma sem púlsar.",
            "Stöðustikan fyrir ofan borðið sýnir heildarpottinn, veðmál núverandi lotu, stigið (Pre-flop, Flop, Turn, River) og númer leiks og handar. Spil leikmanna sem sögðu Fold verða hálfgegnsæ; leikmenn sem eru úr leik dofna. Í lok handar getur sigurvegaragluggi tekið saman hver vann hvað — hægt er að slökkva á honum í valkostunum."] },
        { id: "seatlayout",
          t: "Uppröðun sæta",
          b: [
            "Sem vefviðbót er hægt að velja uppröðun leikmannareitanna í Ítarlegir valkostir → Sæti: Sjálfvirkt fylgir opinbera biðlaranum (fastar stöður í lóðréttri stöðu, reiknaður sporbaugur í láréttri), eða þú getur þvingað fram lóðrétta eða lárétta uppröðun — og Sérsniðið leyfir þér að staðsetja hvert sæti sjálf(ur): breytingahamur birtist þar sem þú dregur hvern reit þangað sem þú vilt, og uppröðunin er vistuð."] },
        { id: "zoom",
          t: "Aðdráttur borðs (símar)",
          b: [
            "Á litlum skjám draga stækkunarglershnapparnir borðið að (2×) og þú getur fært það til með fingri — þinn eigin reitur og aðgerðastikan haldast föst. Sýnin fylgir virka sætinu sjálfkrafa og dregur aftur frá í uppgjöri til að sýna allt borðið. Hægt er að slökkva á þessu í ítarlegum valkostum."],
          note: "Í símum og spjaldtölvum er klípuaðdráttur vafrans sjálfs sjálfgefið óvirkur svo aðdráttarbending í miðri hönd geti ekki virkjast af slysni; kveiktu aftur á honum í Ítarlegir valkostir → Notendaviðmót ef þú þarft á honum að halda." },
        { id: "protections",
          t: "Gægjuvörn og vörn gegn Call af slysni",
          b: [
            "Tvær valfrjálsar varnir: gægjuvörnin heldur þínum eigin spilum földum þar til þú snertir þau (gagnlegt þegar einhver sér á skjáinn þinn), og vörnin gegn Call af slysni lokar Call-hnappinum stutta stund strax eftir stórt Raise, svo snerting sem ætluð var litlu Call lendi ekki óvart á mun stærri upphæð. Báðar eru í ítarlegum valkostum."] },
      ]
    },
    {
      id: "info", icon: "📊", title: "Upplýsingaspjaldið",
      sections: [
        { id: "open",
          t: "Að opna spjaldið",
          b: [
            "Meðan á leik stendur opnast upplýsingaspjaldið úr hausnum (eða með Alt+L / Alt+I) og hefur þrjá flipa: Skrá, Líkur og Tölfræði. Í símum flýtur það yfir borðinu; á stærri skjám er það gluggi sem hægt er að draga og breyta stærð á — gríptu í ⣿ handfangið til að færa hann og í brúnirnar til að breyta stærð. Staðsetningin er munuð."] },
        { id: "log",
          t: "Leikskráin",
          b: [
            "Skrá-flipinn skráir allan leikinn, hönd fyrir hönd: blinda, hverja aðgerð með upphæðum, sýnd spil og sigurvegara, með litum svo auðvelt sé að renna yfir. Útflutningshnappur vistar skrána í skrá ef þú vilt fara yfir lotu seinna."] },
        { id: "odds",
          t: "Líkur (líkindavakt)",
          b: [
            "Líkur-flipinn sýnir, fyrir höndina sem þú ert með, rauntímalíkur á að enda með hvern af 10 handaflokkunum — frá High Card upp í Royal Flush — hvern með sínu tákni, prósentu og stiku. Birtingin verður grá ef þú segir Fold. Hún notar aldrei annað en þín eigin spil og sameiginlegu spilin: hún sér aldrei neitt sem andstæðingarnir hafa ekki sýnt."] },
        { id: "journal",
          t: "Handaskrár og Skrár-glugginn",
          b: [
            "Auk rauntímaskrárinnar er hver hönd sem þú spilar skráð staðbundið í vafranum þínum, á sama sniði og .pdb skrár opinbera biðlarans. Skrár-glugginn (Ítarlegir valkostir → Skráarskilaboð → Sýsla með skrár…) sýnir lista yfir loturnar þínar og leyfir þér að vinna með þær: forskoða lotu með leit og auðkenningu, sía eftir leik, flytja út sem HTML eða hreinan texta, vista hráu .pdb skrána eða flytja inn .pdb sem skjáborðsbiðlarinn skráði. Hægt er að eyða lotum einni í einu eða öllum í einu (með staðfestingu), og sjálfvirk geymslustilling getur haldið aðeins síðustu 7, 30, 90, 180 eða 365 dögum. Skrár sem þú fluttir inn sjálf(ur) eru aldrei fjarlægðar sjálfkrafa. Önnur stilling takmarkar hve margar lotur eru geymdar, og hægt er að breikka dálk listans með því að draga.",
            "Til að fjarlægja nokkrar lotur í einu breytir hnappurinn Velja… listanum í gátreiti: hakaðu við þær sem þú vilt ekki lengur og Eyða fjarlægir allan hópinn eftir eina staðfestingu. Á tölvu geturðu líka notað Ctrl (⌘) + smell til að bæta lotum við einni í einu, eða Shift + smell til að taka heilt bil.",
            "Greina-hnappurinn keyrir handagreiningu á lotu, og einnig er hægt að senda skrána til greiningarþjónustu pokerth.net. Allt helst á tækinu þínu nema þú flytjir það sérstaklega út eða hlaðir því upp."] },
        { id: "logopts",
          t: "Valkostir skráningar",
          b: [
            "Í Ítarlegir valkostir → Skráarskilaboð geturðu kveikt eða slökkt á skráningu og valið hve oft er skrifað, með sömu þremur stillingum og í skjáborðsbiðlaranum: eftir hverja aðgerð, eftir hverja hönd (sjálfgefið) eða eftir hvern leik. Annar valkostur skrifar .pdb skrána í möppu sem þú velur og heldur henni uppfærðri með sömu tíðni, og skrifar einu sinni enn þegar þú yfirgefur síðuna, svo annað tól geti fylgst með leiknum í rauntíma."],
          note: "Til að skrifa í staðbundna möppu þarf File System Access API: aðeins Chrome, Edge og Opera á tölvu. Annars staðar útskýrir valkosturinn ástæðuna, og handvirkur útflutningur úr Skrár-glugganum er áfram í boði. Vafrinn getur aðeins skipt skránni út, ekki bætt við hana, svo tól sem les .pdb þarf að opna hana aftur eftir hverja breytingu." },
        { id: "assist",
          t: "Aðstoð (styrkur handar)",
          b: [
            "Efst á Líkur-flipanum les aðstoðarborðinn höndina fyrir þig. Fyrir flop nefnir hann upphafshöndina þína og gefur henni stjörnur; frá flop sýnir hann bestu núverandi samsetninguna þína og, eftir snögga hermun, áætlaðar líkur þínar á að vinna höndina í prósentum, með lituðum mæli frá rauðu (veik) yfir í grænt (sterk). Eins og líkindavaktin notar hann aðeins upplýsingar sem þú sérð.",
            "Tveir birtingarstílar eru í boði í Ítarlegir valkostir → Sæti: bútar (tíu kubbar) eða sígild framvindustika. Hægt er að slökkva á allri aðstoðinni í Ítarlegir valkostir → Aðstoð."] },
        { id: "assistwin",
          t: "Aðstoð sem fljótandi smágluggi",
          b: [
            "Hægt er að losa aðstoðarkubbinn úr spjaldinu í sinn eigin litla glugga sem er alltaf efst: notaðu losunarhnappinn á kubbnum, færðu hann svo og breyttu stærð hans hvar sem er yfir borðinu — hentugt til að hafa auga með styrk handarinnar án þess að opna allt spjaldið. Festihnappurinn setur hann aftur á Líkur-flipann og staðsetningin er munuð. Inni í spjaldinu leyfir draghandfang milli Aðstoðar og Líkna þér að skipta plássinu á milli þeirra."] },
        { id: "stats",
          t: "Tölfræði",
          b: [
            "Tölfræði-flipinn fylgist með lotunni þinni: spilaðar hendur, séð flop, uppgjör, vinningshlutföll og fleira. Hægt er að slökkva á skráningu tölfræði í ítarlegum valkostum."] },
        { id: "hud",
          t: "Tölfræði-HUD á sætum",
          b: [
            "HUD bætir litlum tölfræðireit við sæti hvers leikmanns, byggðum á höndunum sem skráðar eru í skrárnar þínar: fjöldi handa sem fylgst hefur verið með, síðan VPIP (hve oft hann leggur fé í pottinn af fúsum vilja pre-flop), PFR (Raise pre-flop) og AF (ágengnistuðull), með litum frá óvirkum yfir í ágengan. Fyrir neðan þá lýsir merki leikmanninum í einföldum orðum — þéttur-óvirkur, laus-ágengur og svo framvegis — við hlið lítillar skífu þar sem upplýsti hlutinn les þéttur-til-laus frá vinstri til hægri og óvirkur-til-ágengur að neðan og upp. Merkið birtist frá fyrstu hönd en helst dauft fram að 25 höndum, þegar það verður áreiðanlegt. Snertu reit til að fá ítarlegan sprettiglugga með öllum tölunum (3-bet, framhaldsveðmál, Fold við 3-bet, stuldartilraunir, uppgjörshlutföll…) og dragðu reit ef hann hylur eitthvað.",
            "HUD veit aðeins það sem þú hefur séð við þín eigin borð — það les staðbundnu handaskrárnar þínar, svo skráning þarf að vera virk og tölurnar verða fyrst marktækar eftir nógu margar hendur. Sjálfgefið er slökkt á því: kveiktu á því í Ítarlegir valkostir → Aðstoð."] },
        { id: "handsbtn",
          t: "Yfirlit yfir handasamsetningar",
          b: [
            "Pókerhandatáknið á dúknum opnar fljótlegt yfirlit yfir samsetningarnar 10 hvenær sem er — gagnlegt meðan þú ert að læra. Hægt er að fela það í ítarlegum valkostum."] },
      ]
    },
    {
      id: "chat", icon: "💬", title: "Spjall og samskipti",
      sections: [
        { id: "panels",
          t: "Spjall anddyris og spjall leiks",
          b: [
            "Það er eitt spjall í anddyrinu og eitt við borðið. Í símum flýtur leikspjallið yfir borðinu; á stærri skjám er það gluggi sem hægt er að draga og breyta stærð á. Merki á spjallhnappinum telur ólesin skilaboð."] },
        { id: "typing",
          t: "Innsláttarhjálp",
          list: [
            "Tab klárar gælunafn — ýttu aftur á Tab til að fletta á milli þeirra sem passa.",
            "↑ / ↓ fletta í gegnum sögu þinna eigin skilaboða.",
            "Emoji-hnappurinn opnar allan veljarann; ef þú slærð inn : eru tákn lögð til jafnóðum."] },
        { id: "emotes",
          t: "Tákn og broskarlar",
          b: [
            "Spjallið breytir stuttkóðum tákna nákvæmlega eins og opinberi skjáborðsbiðlarinn: sláðu inn heiti milli tvípunkta og það verður að emoji — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… Yfir 1.900 kóðar eru studdir (allt GitHub-safnið). Sígildir textabroskarlar breytast líka: :-) ;) :D xD :P <3 og um áttatíu aðrir.",
            "Ef þú slærð inn : opnast tillögugluggi sem klárar kóðann jafnóðum (↑/↓ til að velja, Tab eða Enter til að samþykkja). Hægt er að slökkva alveg á emoji-umbreytingu í Ítarlegir valkostir → Spjall."] },
        { id: "commands",
          t: "Spjallskipanir",
          b: [
            "Spjallið skilur skástriksskipanir. Tvær eru sýnilegar öðrum:"],
          keys: [
            ["/me <text>", "aðgerðarskilaboð, sýnd sem “* NafniðÞitt texti”"],
            ["/emoji <emoji>", "spilar emoji-viðbragð (það sem viðbragðaveljarinn sendir)"]] },
        { id: "diagcmds",
          t: "Greiningarskipanir",
          b: [
            "Allt annað er staðbundið: svörin eru aðeins sýnd þér og ekkert er sent til borðsins. Sláðu inn /help til að sjá allan listann. Þær gagnlegustu:"],
          keys: [
            ["/help", "listi yfir allar skipanir"],
            ["/update", "leita að nýrri útgáfu og endurnýja"],
            ["/lang <code>", "skipta um tungumál (t.d. /lang fr)"],
            ["/sound on|off", "kveikja/slökkva á leikhljóðum"],
            ["/zoom", "kveikja/slökkva á stækkunargleri borðsins"],
            ["/clear", "hreinsa spjallið staðbundið"],
            ["/table", "upplýsingar um núverandi leik (blindir, leikmenn, staflar)"],
            ["/diag · /netdbg · /fps", "staða biðlara, greining nets og rammatíðni"],
            ["/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg", "ítarleg villuleit (spil, samskiptareglur, hljóð, geymsla, sæti)"],
            ["/copy", "afrita svar síðustu skipunar á klippiborðið"]] },
        { id: "privatemsg",
          t: "Einkaskilaboð",
          b: [
            "Skrifaðu einum leikmanni án þess að allt anddyrið lesi það. Umslagið við hlið nafns á leikmannalistanum opnar samtal við hann; umslagið í haus anddyrisins opnar síðasta samtal aftur. Samtöl eru geymd á þessu tæki og eru enn til staðar þegar þú kemur aftur, þannig að spjall sem er tekið upp nokkrum dögum síðar heldur sögu sinni — rauð tala á umslaginu sýnir þau sem þú hefur ekki lesið, og ruslatunnan í titli gluggans eyðir samtali fyrir fullt og allt."],
          keys: [
            ["/msg <nickname> <text>", "senda einkaskilaboð úr spjalli anddyrisins"],
            ["/msg \"<nickname with spaces>\" <text>", "sama, þegar bil eru í gælunafninu"]],
          note: "Skilaboð eru takmörkuð við 128 stafi. Þjónninn kemur ekki einkaskilaboðum til leikmanns sem situr við borð í gangi, og sagan er aðeins geymd í þessum vafra — hún fylgir þér ekki á annað tæki." },
        { id: "reactions",
          t: "Emoji-viðbrögð",
          b: [
            "Viðbragðahnappurinn opnar veljara með 30 hreyfðum viðbrögðum (🎉, 😂, 😱, 🔥…) sem spilast fyrir ofan sætið þitt með brellu og eru sýnileg öllum við borðið — líka leikmönnum í skjáborðsbiðlaranum. Hægt er að slökkva alveg á viðbrögðum í ítarlegum valkostum."] },
        { id: "translate",
          t: "Að skilja alla",
          b: [
            "Með spjallþýðingu virka birtist þýðingarhnappur á línunni undir bendlinum — eða á línunni sem þú snertir á snertiskjá — sem sýnir þau skilaboð á þínu tungumáli með innbyggðum þýðanda vafrans. Hægt er að sýna hann varanlega á hverri línu í Ítarlegir valkostir → Spjall, ásamt ábendingu sem útskýrir algengar skammstafanir við borðið (gg, nh, utg…)."],
          note: "Þýðingin notar Google Translate þjónustuna og virkar í öllum vöfrum — hún þarf aðeins internettengingu. Skilaboð eru aðeins send þýðingarþjónustunni þegar þú snertir þýðingarhnappinn, aldrei sjálfkrafa." },
        { id: "social",
          t: "Leikmenn: prófíll, boð, hunsun",
          b: [
            "Snertu hvaða leikmann sem er — við borðið eða á lista anddyrisins — til að opna spjaldið hans: prófíll og tölfræði, bjóða honum í leikinn þinn eða hunsa hann (spjallskilaboð hans eru falin; hægt er að afturkalla hunsun hvenær sem er). Hægt er að kveikja á staðfestingu fyrir boð/hunsun í valkostunum."] },
      ]
    },
    {
      id: "lobby", icon: "🏛️", title: "Anddyri og leikir",
      sections: [
        { id: "list",
          t: "Leikjalistinn",
          b: [
            "Anddyrið sýnir lista yfir öll borð á þjóninum. Hver færsla sýnir fjölda leikmanna, gerð leiks, lás ef þörf er á lykilorði eða boði, og stöðumerki: “Bið” (grænt — leikurinn er ekki hafinn, þú getur sest ef sæti er laust), “Í gangi” (hlýr litur — þú getur horft á í beinni ef áhorfendur eru leyfðir) eða “Lokað” (dauft). Fullt borð sýnir fulla talningu eins og 10/10; litir merkjanna fylgja virka þemanu.",
            "Síufellilistinn þrengir listann alveg eins og skjáborðsbiðlarinn, þar sem hver valkostur er strangari en sá fyrri: aðeins opnir leikir → fela líka full borð → síðan aðeins ekki-einka, aðeins einka eða aðeins stigaleikir. Valið þitt er munað. Leitarreitur finnur leik eftir heiti og leikmannapillan opnar lista yfir alla sem eru á netinu, með leit og röðun."] },
        { id: "join",
          t: "Að setjast við borð og horfa á",
          b: [
            "Veldu opinn leik og sestu við hann — lás þýðir að lykilorð þarf. Leiki í gangi sem leyfa áhorfendur er hægt að horfa á í beinni: þú sérð borðið og spjallið, en holuspilin haldast falin og þú getur ekkert gert."] },
        { id: "gameinfo",
          t: "Upplýsingar um leik",
          b: [
            "Áður en þú sest sýnir upplýsingaspjald leiksins allt sem skilgreinir borðið: gerð leiks, blinda og hvernig þeir hækka (tvöföldun eða handvirkur listi), upphafsstafla, tíma á aðgerð, töf milli handa og hverjir eru þegar sestir."] },
        { id: "create",
          t: "Að búa til leik",
          b: [
            "Búðu til þitt eigið borð: heiti, fjöldi leikmanna, upphafsstafli, fyrsti litli blindur og hækkunaráætlun, tími á aðgerð og hvort áhorfendur eru leyfðir. Fjórar gerðir leikja eru til: Venjulegur (hver sem er), Aðeins skráðir leikmenn, Aðeins með boði og Stigaleikur (telur í opinberu stigatöflunni — engin lykilorð leyfð þar). Þú getur vistað uppáhaldsstillingarnar þínar og hlaðið þeim aftur."] },
        { id: "invites",
          t: "Boð",
          b: [
            "Leikmenn geta boðið þér að borðinu sínu; þú færð tilkynningu sem þú getur þegið eða hafnað. Eina leiðin inn í leik sem er aðeins með boði er að fá boð."] },
      ]
    },
    {
      id: "pthnet", icon: "🌐", title: "pokerth.net",
      sections: [
        { id: "account",
          t: "Aðgangurinn þinn",
          b: [
            "Opinberi internetþjónninn er pokerth.net. Til að spila þar þarf ókeypis pokerth.net aðgang — skráðu þig á vefsíðunni og skráðu þig svo inn hér með sama gælunafni og lykilorði. Þessi vefbiðlari tengist sama þjóni og skjáborðsbiðlarinn: sömu aðgangar, sömu borð, sama stigatafla, og þú getur setið við sama borð og leikmenn í skjáborðsbiðlaranum."] },
        { id: "ranked",
          t: "Stigaleikir og tímabil",
          b: [
            "Leikir af gerðinni Stigaleikur telja í opinberu stigatöflu tímabilsins. Prófíllinn þinn í forritinu sýnir hvenær þú skráðir þig, sæti þitt á yfirstandandi tímabili, skor, meðaltal og spilaða leiki, auk nýjustu úrslita þinna. Venjulegir leikir (ekki stigaleikir) eru bara til gamans og breyta engu."] },
        { id: "rankhow",
          t: "Hvernig stigataflan er reiknuð",
          b: [
            "Í hverjum stigaleik gefur lokasætið þitt stig: 15 fyrir fyrsta sæti, síðan 9, 6, 4, 3, 2 og 1 niður í sjöunda sæti; ekkert fyrir áttunda til tíunda sæti. Borð deilir þannig út 40 stigum alls.",
            "Skorið þitt er ekki summa þessara stiga heldur meðaltalið þitt á leik, leiðrétt með stuðli sem vex með fjölda spilaðra leikja: nokkur góð úrslit duga ekki til að halda sér á toppnum, það þarf líka stöðugleika — því meira sem þú spilar, því nær færist skorið þínu raunverulega meðaltali. Tímabil standa í ársfjórðung: allt er sett í geymslu og teljarar byrja aftur á núlli við skiptin, og fyrri tímabil eru áfram aðgengileg. Í leik sýnir verðlaunapallshnappurinn stöðu leikmannanna við borðið þitt á tímabilinu."],
          note: "Stigaskalinn og nákvæm formúla eru ákveðin af stigatöfluþjóni pokerth.net og geta breyst; síðurnar á vefnum eru það sem gildir." },
        { id: "rankings",
          t: "Stigatöflusíður",
          b: [
            "Stigatöflufærslan opnar opinberu PokerTH stigatöfluna, með leit eftir leikmanni, ásamt stigatöflum samfélaganna (BBC, WEC). Ef þú hefur ekki áhuga á stigatöflum er hægt að fela færsluna í Ítarlegir valkostir → Samfélag."] },
        { id: "cups",
          t: "Bikarar samfélaganna: BBC og WeCup",
          b: [
            "Tvö samfélög halda eigin keppnir á pokerth.net, hvort með sína síðu og sína stigatöflu. Best Brainies Cup (BBC) er þrepamót sem varð til 2013: þú klifrar úr Step 1 upp í Step 4, og bikar er veittur eftir hvern Step 4 leik og nýtt tímabil hefst. WeCup (WEC) hefur sinn eigin, mun breiðari skala — 75 stig fyrir fyrsta sæti, síðan 45, 30, 20… — og skorið staðlar meðaltalið þitt eftir fjölda spilaðra leikja miðað við aðra meðlimi.",
            "Báðar stigatöflurnar opnast úr bikarhnappinum, við hlið PokerTH stigatöflunnar. Borðstillingar þessara keppna eru í boði sem forstillingar þegar leikur er búinn til (BBC Step 1 til 4, WEC, WEC Monthly Final, WEC Grand Final), svo þú getur æft við sömu aðstæður. Til að taka þátt þarf að skrá sig á síðu viðkomandi bikars."],
          note: "Ef þú hefur ekki áhuga á bikurunum er hægt að fela þetta efni í einu lagi í Ítarlegir valkostir → Samfélag." },
        { id: "forumcups",
          t: "Bikarar og viðburðir spjallborðsins",
          b: [
            "Spjallborð pokerth.net heldur líka Monthly Cup, mánaðarlega mótaröð sem skiptir leikmönnum á Gold, Silver og Bronze borð áður en meistari mánaðarins er krýndur, auk sérstakra bikara yfir árið.",
            "Skráningar, dagskrá, borðstillingar og úrslit eru birt á spjallborðinu og leikirnir eru spilaðir á opinbera þjóninum eins og allir aðrir leikir. pokerth.net aðgangur nægir til að fylgjast með úrslitum; þátttaka í bikar fer fram í gegnum viðkomandi þráð á spjallborðinu."] },
        { id: "forumnews",
          t: "Fréttir af spjallborðinu í anddyrinu",
          b: [
            "Dagblaðshnappurinn í haus anddyrisins opnar nýjustu innleggin á spjallborði pokerth.net, eina færslu fyrir hvert efni, hvert spjallborð í sínum lit. Merki á hnappinum telur ólesin innlegg; ef innlegg er opnað (nýr flipi) er það merkt sem lesið, og „Merkja allt sem lesið“ hreinsar allt í einu.",
            "Þetta er vefviðbót: hægt er að fela hnappinn í ítarlegum valkostum („Spjallborðshnappur í haus anddyris“)."] },
        { id: "avatars",
          t: "Avatarar og fánar",
          b: [
            "Á pokerth.net er avatarnum þínum dreift til annarra leikmanna í gegnum avatarþjóninn, og hægt er að sýna lítinn þjóðfána á reitum leikmanna. Hvort tveggja er valfrjálst og stillanlegt í valkostunum."] },
      ]
    },
    {
      id: "offline", icon: "🏋️", title: "Æfingahamur",
      sections: [
        { id: "what",
          t: "Hvað þetta er",
          b: [
            "Staðbundið / æfing er heill leikur gegn tölvuandstæðingum: engin tenging, enginn aðgangur, ekkert í húfi. Þegar forritið hefur verið sett upp (eða bara heimsótt einu sinni) virkar það alveg ótengt — kjörið til að læra leikinn, prófa viðmótið eða drepa tímann í flugham."] },
        { id: "setup",
          t: "Að setja upp leik",
          b: [
            "Veldu fjölda andstæðinga, upphafsstafla, blinda og hækkunaráætlun þeirra, og leikhraða. Hægt er að stilla uppröðun og erfiðleikastig bottanna í Ítarlegir valkostir → Staðbundinn leikur — frá mildum andstæðingum upp í erfitt, blandað borð."] },
        { id: "trophies",
          t: "Verðlaun",
          b: [
            "Æfingahamurinn hefur sína eigin framvindu: 28 verðlaun í sex flokkum (Framvinda, Færni, Stíll, Snið, Skemmtun og leynilegur flokkur) opnast eftir því sem þú spilar — spilaðar hendur, unnir leikir, stór blöff, sérstakar hendur og fleira. Verðlaunaframvindan safnast upp og sameinast milli tækja þegar samstilling stillinga aðgangsins er virk."] },
        { id: "learn",
          t: "Góður staður til að læra",
          b: [
            "Allt úr hinum köflunum virkar líka hér: líkindavaktin, aðstoðarbirtingin, forval, flýtilyklar. Æfingahamurinn er besti staðurinn til að prófa þetta án pressu áður en haldið er á pokerth.net."] },
      ]
    },
    {
      id: "style", icon: "🎨", title: "Útlit og hljóð",
      sections: [
        { id: "themes",
          t: "Þemu",
          b: [
            "Útlit-hlutinn í ítarlegum valkostum breytir öllu útliti biðlarans. Forstillingar stilla allt með einni snertingu (sígilda græna spilavítið, opinbera PokerTH útlitið…); fyrir neðan þær leyfa aðskildir þættir þér að breyta litaspjaldinu, borðdúknum og framhlið spilanna hverju fyrir sig — ef þú breytir einhverjum þætti verður blandan þín að sérsniðnu þema. Dökkur, ljós eða sjálfvirkur hamur er valinn undir Notendaviðmót, og valið þitt tekur strax gildi, á öllum skjám, og er munað."] },
        { id: "tablelook",
          t: "Borð, stokkar og sæti",
          b: [
            "Fyrir utan þemað er hægt að breyta nokkrum þáttum hverjum fyrir sig: bakgrunni borðsins, spilastokknum, bakhlið spilanna (sjálfkrafa í stíl við stokkinn eða flyttu inn þína eigin mynd), gjafara- og blindaskífum, stíl aðgerðahnappa og heilum sætapökkum sem breyta útliti leikmannareitanna. Veldu allt í Ítarlegir valkostir → Útlit; breytingar sjást strax við borðið."] },
        { id: "music",
          t: "Tónlistarspilari",
          b: [
            "Tónlistarfærslan í valmynd haussins opnar lítinn spilara með setustofutónlist: veldu lag af lagalistanum, spila/hlé, fyrra/næsta, stokka, og endurtaka eitt lag, allan lagalistann eða ekkert. Hljóðstyrkur, valið lag og endurtekningarhamur eru munuð. Spilun hefst aldrei sjálfkrafa — vafrar krefjast snertingar — og spilarinn er alveg óháður hljóðbrellum leiksins.",
            "Tveir þumlar undir titli lagsins segja til um hvort þér líkar það sem er í spilun. Eitt nafnlaust atkvæði á tæki, líka fyrir útvarpsstöðvar, og þú getur breytt því eða afturkallað hvenær sem er; nema rekstraraðilinn birti heildartölurnar sérðu aðeins þinn eigin þumal."] },
        { id: "sounds",
          t: "Hljóðbrellur",
          b: [
            "Leikhljóðum er skipt í fjóra flokka sem hægt er að kveikja og slökkva á hverjum fyrir sig, eins og í skjáborðsbiðlaranum: leikaðgerðir (gjöf, Check, Call, Raise, þú átt leik…), tilkynning um spjall í anddyri, tilkynningar netleiks (leikmaður mættur, leikur tilbúinn) og tilkynning um hækkun blindra. Einn hljóðstyrkssleði stýrir þeim öllum, í Ítarlegir valkostir → Hljóð."],
          note: "Allir vafrar — sérstaklega iOS — neita að spila hljóð fyrr en þú hefur snert síðuna einu sinni. Ef leikurinn byrjar hljóðlaus nægir ein snerting hvar sem er til að fá hljóðið aftur; biðlarinn lagar það líka sjálfkrafa þegar iOS stöðvar hljóðvélina (innhringing, forrit sett í bakgrunn…)." },
        { id: "voice",
          t: "Raddtilkynningar og titringur",
          b: [
            "Tvær leiðir í viðbót til að láta þig vita án þess að þú horfir á skjáinn: raddtilkynningar lesa atburði leiksins upphátt með talgervli tækisins, og í símum getur stuttur titringur gefið til kynna að þú eigir leik. Hvort tveggja eru vefviðbætur, sjálfgefið af eða á eftir tæki, í Ítarlegir valkostir → Veðmál og umferð."],
          note: "Titringur virkar á Android (Chromium-vafrar); Apple veitir vefsíðum ekki aðgang að titrings-API, svo iPhone getur ekki titrað. Raddtilkynningar virka alls staðar, en raddir og tungumál í boði fara eftir kerfinu þínu — biðlarinn notar bestu samsvörun sem hann finnur." },
      ]
    },
    {
      id: "options", icon: "⚙️", title: "Valkostir og flýtilyklar",
      sections: [
        { id: "where",
          t: "Hvar valkostirnir eru",
          b: [
            "Ítarlegir valkostir opnast úr tannhjólsfærslunni í hvaða hausvalmynd sem er. Þeim er raðað í flokka eins og í skjáborðsbiðlaranum: Notendaviðmót, Útlit, Hljóð, Staðbundinn leikur, Netleikur, Internetleikur, Gælunöfn / avatarar, Skráarskilaboð og Afrit og endurstilling. Hver eiginleiki sem er aðeins á vefnum hefur sinn eigin rofa þar, svo þú getur slökkt á öllu sem þú notar ekki."] },
        { id: "cfgxml",
          t: "Að skiptast á stillingum við skjáborðsbiðlarann",
          b: [
            "Stillingarnar þínar geta ferðast á milli biðlara: flokkurinn Afrit og endurstilling býður upp á út-/innflutning opinberu config.xml skrárinnar (~/.pokerth/config.xml sem skjáborðs- og QML-biðlararnir nota). Útflutningur skrifar sameiginlegu stillingarnar — nafn, skjávalkosti, hljóð, borðstillingar, blinda, útlit — og innflutningur beitir skrá úr skjáborðsbiðlaranum hér. Stillingar sem þessi biðlari þekkir ekki eru varðveittar óbreyttar í skránni.",
            "Minnispunktarnir þínir um leikmenn ferðast líka með skránni — texti og stjörnueinkunn, skrifað á sama hátt og skjáborðsbiðlararnir lesa það. Litaðir miðar haldast í þessum biðlara: opinbera sniðið hefur engan reit fyrir þá, svo innflutningur snertir aldrei miðana þína."] },
        { id: "sync",
          t: "Stillingar sem fylgja þér",
          b: [
            "Þegar þú spilar með aðgangi samstillast valkostir þínir, þema, lyklabindingar, tungumál og æfingaverðlaun: breyttu einhverju á einu tæki og næsta tæki sem þú skráir þig inn á tekur við því. Verðlaunaframvinda er sameinuð, aldrei yfirskrifuð, svo ef þú spilar á tveimur tækjum helst það besta úr báðum."] },
        { id: "updates",
          t: "Að vera með nýjustu útgáfu",
          b: [
            "Biðlarinn uppfærir sig sjálfur: þegar ný útgáfa er gefin út býður borði þér að endurnýja (eða sláðu inn /update í spjallinu til að athuga sjálf(ur)). Stöku sinnum getur lítil vörukönnun birst til að spyrja um álit þitt á eiginleika — þátttaka er valfrjáls og hægt er að slökkva alveg á könnunum í Ítarlegir valkostir → Samfélag."] },
        { id: "fkeys",
          t: "Opinberir flýtilyklar",
          b: [
            "Opinberu PokerTH aðgerðalyklarnir virka meðan á leik stendur — Alt+S virkar alls staðar:"],
          keys: [
            ["F1 / F2 / F3 / F4", "Fold · Check/Call · Bet/Raise · All-In (hægt að snúa röðinni við í valkostunum)"],
            ["F5", "Sýna spilin þín (þegar það er hægt)"],
            ["F6 / F7 / F8", "Handvirkt · Sjálfv. Check/Fold · Sjálfv. Check/Call"],
            ["Alt+M / Alt+K / Alt+F", "Handvirkt · Sjálfv. Check/Call · Sjálfv. Check/Fold"],
            ["Alt+C / Alt+L / Alt+I", "Spjall · Leikskrá · Líkindaspjald"],
            ["Alt+S", "Stillingar — hvar sem er í forritinu, ekki aðeins í leik"],
            ["F11", "Allur skjárinn"]],
          note: "Flýtilyklar krefjast raunverulegs lyklaborðs. Á Mac eru F-lyklarnir sjálfgefið miðlunarstýringar: haltu Fn niðri (eða kveiktu á “Use F1, F2, etc. as standard function keys” í stillingum macOS). Allur skjárinn er takmarkaður af iOS á iPhone — uppsetning forritsins sem PWA gefur sömu upplifun á öllum skjánum." },
        { id: "webkeys",
          t: "Stafalyklar vefsins",
          b: [
            "Sem vefviðbót virkja stakir stafalyklar og Alt+T aðgerðir, og hvern þeirra er hægt að endurúthluta í Ítarlegir valkostir → Flýtilyklar:"],
          keys: [
            ["F", "Fold"],
            ["C", "Check / Call"],
            ["R", "Raise"],
            ["A", "All-In"],
            ["1 / 2 / 3", "Bet 1/3 · 1/2 · pottur"],
            ["Alt+T", "Tölfræðispjald"],
            ["Esc", "Loka efsta glugganum (líka Til baka-hnappur Android)"],
            ["↑ ↓ · ↵", "Borðalisti anddyris (náðu í hann með Tab): velja borð · setjast"]],
          note: "Á Android lokar Til baka-hnappur/bending kerfisins gluggum eins og Escape, í stað þess að yfirgefa leikinn (stillanlegt í valkostunum). iOS hefur engan sambærilegan kerfishnapp — notaðu ✕ á hverjum glugga." },
      ]
    },
  ]
};
