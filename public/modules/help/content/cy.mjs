// ── help/content/cy.mjs — Welsh (Cymraeg) help corpus ────────────────────
//
// Same structure as en.mjs (reference): chapters[] → { id, icon, title,
// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand
// names of the rules chapter stay in English, as in the other help corpora.
export const help = {
  chapters: [
    {
      id: "start", icon: "🚀", title: "Dechrau arni",
      sections: [
        { id: "modes",
          t: "Tair ffordd o chwarae",
          b: [
            "Ar y sgrin mewngofnodi, dewiswch sut rydych chi am chwarae."],
          list: [
            "Rhyngrwyd — chwaraewch ar-lein ar weinydd swyddogol pokerth.net gyda safleoedd. Mae angen cyfrif pokerth.net; cofrestrwch am ddim ar pokerth.net.",
            "Lleol / ymarfer — chwaraewch all-lein yn erbyn botiaid. Dim byd i'w osod, mae'n gweithio heb gysylltiad ac yn datgloi tlysau wrth i chi fynd yn eich blaen.",
            "LAN / Gweinydd pwrpasol — cysylltwch â gweinydd PokerTH preifat ar eich rhwydwaith lleol neu ar eich cyfrifiadur eich hun."] },
        { id: "lan",
          t: "LAN / gweinydd pwrpasol",
          b: [
            "Mae'r trydydd modd yn cysylltu ag unrhyw weinydd PokerTH rydych chi neu ffrind yn ei redeg — ar rwydwaith cartref, ar VPS preifat, unrhyw le. Rhowch gyfeiriad a phorth y gweinydd, ticiwch TLS os yw'r gweinydd yn defnyddio porth wedi'i amgryptio, a mewngofnodwch gyda llysenw (mae mynediad gwestai'n gweithio os yw'r gweinydd yn ei ganiatáu). Wedyn mae popeth wrth y bwrdd yn gweithio'n union fel ar y gweinydd swyddogol."] },
        { id: "famboard",
          t: "Bwrdd arweinwyr y teulu",
          b: [
            "Ar weinyddion preifat a gemau LAN yn unig, mae'r cleient yn cadw ystadegau oes ar gyfer pob llysenw — dwylo a gemau a chwaraewyd ac a enillwyd, yr enillion mwyaf, y rhediad gorau — ac yn eu rhannu drwy'r gweinydd fel bod pob dyfais o amgylch y bwrdd yn gweld yr un bwrdd arweinwyr. Nid yw gemau pokerth.net byth yn cael eu holrhain fel hyn, ac mae ystadegau'r modd ymarfer yn cael eu cadw'n gwbl ar wahân.",
            "Yn y gemau hyn, mae'r botwm tlws yn agor y ffenestr safleoedd ar ei thab LAN: pob chwaraewr, y gellir eu trefnu yn ôl sawl maen prawf."] },
        { id: "language",
          t: "Iaith",
          b: [
            "Mae'r rhyngwyneb ar gael mewn 79 iaith. Newidiwch hi unrhyw bryd yn y Dewisiadau uwch (dewislen y gêr) dan Rhyngwyneb defnyddiwr. Mae termau symudiadau pocer (Fold, Check, Call, Bet, Raise, All-In) yn aros yn Saesneg yn ôl y traddodiad, yn union fel yn y cleient bwrdd gwaith."] },
        { id: "pwa",
          t: "Gosod fel ap",
          b: [
            "Mae'r cleient hwn yn Progressive Web App: gallwch ei osod o ddewislen eich porwr (neu'r botwm gosod yn y pennyn) i gael ap sgrin lawn gyda'i eicon ei hun. Unwaith y bydd wedi'i osod, mae'n agor ar unwaith ac mae'r modd ymarfer yn gweithio'n gyfan gwbl all-lein."],
          note: "Ar Android ac ar Chrome/Edge ar y bwrdd gwaith, mae'r botwm gosod yn gwneud y cyfan. Ar iPhone/iPad dim ond drwy Safari y mae Apple yn caniatáu gosod: botwm Rhannu → “Ychwanegu at y Sgrin Gartref” — mae'r cleient yn dangos y camau hyn pan fo angen. Mae'r botwm yn diflannu unwaith y bydd yr ap wedi'i osod." },
        { id: "platforms",
          t: "Platfformau a phorwyr",
          b: [
            "Mae'r cleient yn rhedeg mewn unrhyw borwr modern ar unrhyw system — Windows, macOS, Linux, Android, iOS. Mae ambell nodwedd yn dibynnu ar APIs porwr mwy newydd; pan fydd API ar goll, mae'r nodwedd yn ei chuddio'i hun neu'n esbonio pam yn hytrach na thorri. Y prif wahaniaethau i'w gwybod:"],
          list: [
            "Chrome / Edge (bwrdd gwaith): mae popeth yn gweithio, gan gynnwys ysgrifennu'r log .pdb i ffolder.",
            "Firefox: popeth ac eithrio ysgrifennu'r log .pdb i ffolder (nid yw'r API ar gael eto).",
            "Safari / iOS: gosod drwy Rhannu → Ychwanegu at y Sgrin Gartref; dim dirgryniad; sgrin lawn gyfyngedig ar iPhone; mae'r sain yn dechrau ar ôl eich cyffyrddiad cyntaf.",
            "Android: cefnogaeth lawn mewn porwyr Chromium, gan gynnwys dirgryniad ac ymddygiad y botwm Yn ôl."] },
        { id: "avatar",
          t: "Llysenw ac afatar",
          b: [
            "Dewiswch eich llysenw a'ch afatar ar y sgrin mewngofnodi cyn cysylltu. Ar pokerth.net, eich llysenw yw enw eich cyfrif; mae afatarau'n cael eu rhannu â chwaraewyr eraill drwy'r gweinydd afatarau.",
            "Mae eich afatar yn cael ei anfon wrth gysylltu, ac mae pob chwaraewr yn gweld yr un un. Os byddwch yn ei newid tra byddwch wedi cysylltu, bydd yr afatar newydd yn berthnasol o'ch cysylltiad nesaf. Nid yw'r llythyren gyntaf (Aa) yn cael ei hanfon: mae chwaraewyr eraill yn gweld yr afatar diofyn."] }
      ]
    },
    {
      id: "rules", icon: "🃏", title: "Rheolau pocer",
      sections: [
        { id: "basics",
          t: "Texas Hold’em yn gryno",
          b: [
            "Mae PokerTH yn chwarae No-Limit Texas Hold’em. Mae pob chwaraewr yn cael dau gerdyn preifat (cardiau poced). Yna mae pum cerdyn cymunedol yn cael eu gosod wyneb i fyny yng nghanol y bwrdd. Y llaw pum cerdyn orau o unrhyw gyfuniad o'ch dau gerdyn a'r pum cerdyn cymunedol sy'n ennill y pot."] },
        { id: "blinds",
          t: "Blinds a botwm y deliwr",
          b: [
            "Cyn pob llaw, mae dau fet gorfodol yn dechrau'r pot: y blind bach a'r blind mawr, a osodir gan y ddau chwaraewr i'r chwith o fotwm y deliwr. Mae'r botwm yn symud un sedd yn glocwedd ar ôl pob llaw, felly mae pawb yn talu'r blinds yn eu tro. Mae'r blinds yn codi'n rheolaidd wrth i'r gêm fynd yn ei blaen.",
            "Ar y bwrdd, mae'r botwm a'r blinds wedi'u marcio gan ddisgiau: D (deliwr), SB (blind bach), BB (blind mawr)."] },
        { id: "streets",
          t: "Y pedair rownd fetio",
          list: [
            "Pre-flop — ar ôl delio'r cardiau poced, mae'r rownd gyntaf yn dechrau i'r chwith o'r blind mawr.",
            "Flop — mae tri cherdyn cymunedol yn cael eu datgelu, ac yna rownd fetio.",
            "Turn — pedwerydd cerdyn cymunedol, ac yna rownd fetio arall.",
            "River — y pumed cerdyn cymunedol a'r olaf, ac yna'r rownd fetio olaf."],
          b: [
            "Mae rownd fetio'n dod i ben pan fydd pob chwaraewr sy'n dal yn y llaw wedi rhoi'r un swm yn y pot (neu'n all-in)."] },
        { id: "actions",
          t: "Beth allwch chi ei wneud ar eich tro",
          list: [
            "Fold — rhoi'r gorau i'r llaw. Mae eich cardiau'n cael eu taflu ac rydych chi allan o'r frwydr am y pot.",
            "Check — pasio heb fetio. Dim ond yn bosibl pan nad oes dim i'w alw.",
            "Call — cyfateb y bet presennol.",
            "Bet — agor y betio pan nad oes neb wedi betio eto ar y stryd hon.",
            "Raise — cynyddu bet sy'n bodoli. Mae'r raise lleiaf yn hafal i'r bet neu'r raise blaenorol.",
            "All-In — rhoi eich stac cyfan yn y pot. Rydych chi'n aros yn y llaw hyd at y swm rydych chi wedi'i gyfateb."] },
        { id: "showdown",
          t: "Showdown a photiau wedi'u rhannu",
          b: [
            "Os oes mwy nag un chwaraewr ar ôl wedi rownd fetio'r river, mae'r cardiau'n cael eu datgelu a'r llaw orau sy'n ennill — mae'r llaw fuddugol yn cael ei dangos o dan y cardiau cymunedol. Pan fydd chwaraewr yn all-in am lai na'r betiau llawn, mae potiau ochr yn cael eu creu: dim ond y rhan o'r pot y cyfrannodd ati y gall pob chwaraewr ei hennill. Mae dwylo cyfartal yn rhannu'r pot.",
            "Does dim rhaid i bawb ddangos: gan ddechrau gyda'r chwaraewr a wnaeth y bet neu'r raise olaf, dim ond os yw'n curo'r hyn sydd eisoes wedi'i ddangos y caiff llaw ei datgelu. Mae unrhyw un sydd â'r hawl i daflu ei gardiau yn eu cadw'n gudd ac yn cael botwm Dangos i'w datgelu beth bynnag."] },
        { id: "hands",
          t: "Trefn y dwylo",
          b: [
            "O'r gwannaf i'r cryfaf:"],
          list: [
            "1. Cerdyn uchel — dim cyfuniad; y cerdyn uchaf sy'n penderfynu.",
            "2. Pâr — dau gerdyn o'r un gwerth.",
            "3. Dau bâr — dau bâr gwahanol.",
            "4. Tri o’r un fath — tri cherdyn o'r un gwerth.",
            "5. Syth — pum cerdyn yn olynol (mae'r As yn cyfrif yn uchel neu'n isel).",
            "6. Fflysh — pum cerdyn o'r un siwt.",
            "7. Tŷ llawn — tri o’r un fath ynghyd â phâr.",
            "8. Pedwar o’r un fath — pedwar cerdyn o'r un gwerth.",
            "9. Fflysh syth — syth, i gyd o'r un siwt.",
            "10. Fflysh brenhinol — o'r Deg i'r As, i gyd o'r un siwt. Y llaw orau bosibl."] }
      ]
    },
    {
      id: "game", icon: "🎮", title: "Sgrin y gêm",
      sections: [
        { id: "actionbar",
          t: "Y bar gweithredu",
          b: [
            "Pan mai eich tro chi yw hi, mae'r bar gweithredu ar y gwaelod yn goleuo gyda hyd at bedwar botwm: Fold (coch), Check / Call (glas), Bet / Raise (gwyrdd — y prif symudiad wedi'i amlygu) ac All-In (coch tywyll). Mae'r botwm Check / Call yn dangos yr union swm i'w alw; mae Bet / Raise yn dangos y swm rydych ar fin ei roi i mewn. Ar ôl y river, gall All-In droi'n fotwm Dangos i ddatgelu eich cardiau."] },
        { id: "betctl",
          t: "Dewis eich bet",
          b: [
            "Gosodwch swm y raise gyda'r maes rhif, y llithrydd neu'r botymau cyflym 1/3 · 1/2 · Pot (ffracsiynau o'r pot presennol). Mae'r symiau'n cael eu talgrynnu'n awtomatig a'u cadw rhwng y raise cyfreithlon lleiaf a mwyaf. Os yw'n well gennych feddwl mewn blinds mawr, mae dewis yn dangos pob swm mewn BB yn lle sglodion."] },
        { id: "preselect",
          t: "Dewis symudiad ymlaen llaw",
          b: [
            "Cyn eich tro gallwch baratoi symudiad ymlaen llaw: tapiwch fotwm a bydd yn cael ymyl aur gyda dot aur bach. Pan ddaw eich tro, mae'r symudiad yn digwydd ar unwaith. Mae Fold wedi'i ddewis ymlaen llaw yn troi'n Check yn awtomatig pan fydd check am ddim — fyddwch chi byth yn taflu'ch cardiau'n ddiangen. Mae'r dewisiadau ymlaen llaw yn cael eu hailosod gyda phob llaw newydd, newid stryd a showdown, ac yn cael eu canslo os bydd y sefyllfa'n newid (er enghraifft swm y call yn newid)."] },
        { id: "automodes",
          t: "Moddau awtomatig",
          b: [
            "Mae'r gwymplen wrth ymyl y botymau gweithredu yn cynnig tri modd chwarae: Â llaw, Check/Call awtomatig a Check/Fold awtomatig. Mae'r moddau awtomatig yn chwarae ar eich rhan nes i chi newid yn ôl — mae unrhyw glic â llaw ar symudiad yn dychwelyd i Â llaw ar unwaith."] },
        { id: "readtable",
          t: "Darllen y bwrdd",
          b: [
            "Mae blwch pob chwaraewr yn dangos yr afatar, yr enw, y stac a'r bet presennol. Mae'r deliwr a'r blinds wedi'u marcio â disgiau D / SB / BB. Mae bathodyn lliw ar y blwch yn dangos symudiad olaf y chwaraewr; mae bar glas tenau yn cyfri i lawr ei amser meddwl. Mae blwch y chwaraewr y mae ei dro yn tywynnu; mae eich blwch chi yn cael ffrâm aur sy'n curo pan ddaw eich tro.",
            "Mae'r bar statws uwchben y bwrdd yn dangos cyfanswm y pot, betiau'r stryd bresennol, y cam (Pre-flop, Flop, Turn, River) a rhifau'r gêm a'r llaw. Mae cardiau chwaraewyr sydd wedi gwneud fold yn hanner tryloyw; mae chwaraewyr sydd allan wedi'u pylu. Ar ddiwedd llaw, gall ffenestr yr enillydd grynhoi pwy enillodd beth — gellir ei diffodd yn y dewisiadau."] },
        { id: "seatlayout",
          t: "Trefniant y seddi",
          b: [
            "Fel estyniad gwe, gellir dewis trefniant blychau'r chwaraewyr yn Dewisiadau uwch → Seddi: mae Awtomatig yn dilyn y cleient swyddogol (safleoedd sefydlog mewn portread, elips wedi'i gyfrifo mewn tirwedd), neu gorfodwch drefniant Portread neu Dirwedd — ac mae Personol yn gadael i chi osod pob sedd eich hun: mae modd golygu'n agor lle rydych chi'n llusgo pob blwch i'r union le rydych chi eisiau, ac mae'r trefniant yn cael ei gadw."] },
        { id: "zoom",
          t: "Chwyddo'r bwrdd (ffonau)",
          b: [
            "Ar sgriniau bach, mae'r botymau chwyddwydr yn chwyddo'r bwrdd (2×) a gallwch ei symud â'ch bys — dim ond y bar gweithredu sy'n aros yn ei unfan; mae eich blwch chi'n cael ei chwyddo hefyd, ac mae'r olwg yn dychwelyd ato pan ddaw eich tro. Mae'r olwg yn dilyn y sedd weithredol yn awtomatig ac yn tynnu'n ôl am olwg lawn yn y showdown. Gellir diffodd hyn yn y Dewisiadau uwch. Ar eich tro, os yw'r cardiau cymunedol y tu hwnt i'r olwg, mae copi bach ohonynt yn ymddangos ar ben y bwrdd; tapiwch ef i fynd at y cardiau ac yn ôl."],
          note: "Ar ffonau a llechi, mae chwyddo pinsio'r porwr ei hun wedi'i rwystro'n ddiofyn fel na fydd ystum chwyddo'n digwydd yn ddamweiniol ar ganol llaw; ail-alluogwch ef yn Dewisiadau uwch → Rhyngwyneb defnyddiwr os dymunwch." },
        { id: "protections",
          t: "Anti-peek a gwarchod rhag call damweiniol",
          b: [
            "Dwy amddiffynfa ddewisol: mae Anti-peek yn cadw'ch cardiau'n gudd nes i chi eu cyffwrdd (defnyddiol pan allai rhywun weld eich sgrin), ac mae'r gwarchod rhag call damweiniol yn rhwystro'r botwm Call am ennyd yn syth ar ôl raise mawr, fel na fydd tap a fwriadwyd ar gyfer call llai yn glanio'n ddamweiniol ar y swm uwch. Mae'r ddau yn y Dewisiadau uwch."] }
      ]
    },
    {
      id: "info", icon: "📊", title: "Y panel gwybodaeth",
      sections: [
        { id: "open",
          t: "Agor y panel",
          b: [
            "Yn ystod gêm, mae'r panel gwybodaeth yn agor o'r pennyn (neu Alt+L / Alt+I) ac mae ganddo dri thab: Log, Siawns ac Ystadegau. Ar ffonau mae'n arnofio dros y bwrdd; ar sgriniau mwy mae'n ffenestr y gellir ei llusgo a newid ei maint — gafaelwch yn y ddolen ⣿ i'w symud, yn yr ymylon i newid ei maint. Mae ei safle'n cael ei gofio."] },
        { id: "log",
          t: "Log y gêm",
          b: [
            "Mae'r tab Log yn cofnodi'r gêm gyfan llaw wrth law: blinds, pob symudiad gyda'i swm, cardiau a ddatgelwyd ac enillwyr, gyda lliwiau i'w darllen yn gyflym. Mae botwm allforio'n cadw'r log fel ffeil os ydych am adolygu'r sesiwn yn nes ymlaen."] },
        { id: "odds",
          t: "Siawns (monitor tebygolrwydd)",
          b: [
            "Mae'r tab Siawns yn dangos, ar gyfer eich llaw bresennol, y tebygolrwydd byw o orffen gyda phob un o'r 10 categori o ddwylo — o Gerdyn uchel i Fflysh brenhinol — pob un gyda'i eicon, canran a bar. Mae'r arddangosfa'n troi'n llwyd pan fyddwch wedi gwneud fold. Dim ond eich cardiau chi a'r cardiau cymunedol y mae'n eu defnyddio: dydy hi ddim yn gweld dim na ddangosodd eich gwrthwynebwyr."] },
        { id: "journal",
          t: "Logiau dwylo a'r ffenestr Logiau",
          b: [
            "Yn ogystal â'r log byw, mae pob llaw rydych chi'n ei chwarae yn cael ei chofnodi'n lleol yn eich porwr, yn yr un fformat â ffeiliau log .pdb y cleient swyddogol. Mae'r ffenestr Logiau (Dewisiadau uwch → Negeseuon log → Rheoli logiau…) yn rhestru eich sesiynau ac yn gadael i chi weithio gyda nhw: rhagweld sesiwn gyda chwilio ac amlygu, hidlo yn ôl gêm, allforio fel HTML neu destun plaen, cadw'r ffeil .pdb amrwd, neu fewnforio .pdb a gofnodwyd gan y cleient bwrdd gwaith. Gellir dileu sesiynau fesul un neu i gyd ar unwaith (gyda chadarnhad), a gall gosodiad cadw awtomatig gadw'r 7, 30, 90, 180 neu 365 diwrnod diwethaf yn unig. Nid yw logiau rydych chi wedi'u mewnforio eich hun byth yn cael eu dileu'n awtomatig. Mae ail osodiad yn cyfyngu nifer y sesiynau a gedwir, a gellir lledu colofn y rhestr drwy ei llusgo.",
            "I ddileu sawl sesiwn ar unwaith, mae'r botwm Dewis… yn troi'r rhestr yn flychau ticio: ticiwch y rhai rydych am gael gwared arnynt a bydd Dileu yn tynnu'r swp cyfan ar ôl un cadarnhad. Ar gyfrifiadur gallwch hefyd wneud Ctrl (⌘) + clic i ychwanegu sesiynau fesul un, neu Shift + clic i gymryd ystod gyfan.",
            "Mae'r botwm Dadansoddi yn rhedeg dadansoddiad dwylo ar sesiwn a gall anfon log i wasanaeth dadansoddi pokerth.net. Mae popeth yn aros ar eich dyfais oni bai eich bod yn allforio neu'n llwytho i fyny'n benodol."] },
        { id: "logopts",
          t: "Dewisiadau'r log",
          b: [
            "Yn Dewisiadau uwch → Negeseuon log gallwch alluogi neu analluogi'r log a dewis y cyfwng ysgrifennu, gyda'r un tri gosodiad â'r cleient bwrdd gwaith: ar ôl pob symudiad, ar ôl pob llaw (diofyn) neu ar ôl pob gêm. Mae dewis arall yn ysgrifennu'r ffeil .pdb i ffolder o'ch dewis ac yn ei diweddaru ar y cyfwng hwnnw, ac unwaith eto pan fyddwch yn gadael y dudalen, fel y gall offeryn arall ddilyn y gêm yn fyw."],
          note: "Mae ysgrifennu i ffolder lleol yn gofyn am y File System Access API: Chrome, Edge ac Opera ar y bwrdd gwaith yn unig. Mewn mannau eraill mae'r dewis yn esbonio pam, ac mae allforio â llaw o'r ffenestr Logiau ar gael o hyd. Dim ond disodli'r ffeil y gall y porwr ei wneud, byth ychwanegu ati, felly rhaid i offeryn sy'n darllen y .pdb ei hailagor ar ôl pob newid." },
        { id: "assist",
          t: "Cynorthwyydd (cryfder y llaw)",
          b: [
            "Ar frig y tab Siawns, mae baner y cynorthwyydd yn darllen eich llaw i chi. Cyn y flop mae'n enwi eich llaw gychwynnol ac yn rhoi sgôr iddi mewn sêr; o'r flop ymlaen mae'n dangos eich cyfuniad gorau presennol ac, ar ôl efelychiad byr, eich siawns amcangyfrifedig o ennill y llaw fel canran, gyda mesurydd lliw o goch (gwan) i wyrdd (cryf). Fel y monitor tebygolrwydd, dim ond gwybodaeth y gallwch chi ei gweld y mae'n ei defnyddio.",
            "Mae dwy arddull arddangos ar gael yn Dewisiadau uwch → Seddi: Segmentau (deg bloc) neu far cynnydd clasurol. Gellir diffodd holl nodwedd y cynorthwyydd yn Dewisiadau uwch → Cynorthwyydd."] },
        { id: "assistwin",
          t: "Y cynorthwyydd fel teclyn arnofiol",
          b: [
            "Gellir datgysylltu bloc y cynorthwyydd o'r panel i'w ffenestr fach ei hun sydd bob amser ar y brig: defnyddiwch y botwm datgysylltu ar y bloc, yna symudwch a newidiwch ei maint unrhyw le dros y bwrdd — defnyddiol i gadw llygad ar gryfder eich llaw heb agor y panel llawn. Mae'r botwm docio yn ei ddychwelyd i'r tab Siawns, ac mae ei safle'n cael ei gofio. Y tu mewn i'r panel, mae dolen lusgo rhwng y Cynorthwyydd a'r tebygolrwydd yn gadael i chi rannu'r gofod rhwng y ddau."] },
        { id: "stats",
          t: "Ystadegau",
          b: [
            "Mae'r tab Ystadegau yn olrhain eich sesiwn: dwylo a chwaraewyd, flops a welwyd, showdowns, cyfraddau ennill a mwy. Gellir diffodd olrhain ystadegau yn y Dewisiadau uwch."] },
        { id: "hud",
          t: "HUD ystadegau ar y seddi",
          b: [
            "Mae'r HUD yn pinio blwch ystadegau bach wrth ymyl sedd pob chwaraewr, wedi'i adeiladu o'r dwylo a gofnodwyd yn eich logiau: nifer y dwylo a welwyd, yna VPIP (pa mor aml mae'n rhoi arian i mewn yn wirfoddol cyn y flop), PFR (raises cyn y flop) ac AF (ffactor ymosodedd), gyda lliwiau o oddefol i ymosodol. Oddi tanynt, mae bathodyn yn crynhoi'r chwaraewr mewn geiriau syml — Tynn-Goddefol, Llac-Ymosodol ac ati — wrth ymyl deial bach y mae ei chwarter goleuedig yn darllen o dynn i lac o'r chwith i'r dde, ac o oddefol i ymosodol o'r gwaelod i'r brig. Mae'r bathodyn yn cael ei ddangos o'r llaw gyntaf ond yn aros yn bŵl hyd at 25 llaw, ac wedyn mae'n ddibynadwy. Tapiwch y blwch am ffenestr fanwl gyda'r set lawn o ffigurau (3-bet, continuation bet, fold i 3-bet, ymdrechion i ddwyn, cyfraddau showdown…), a llusgwch y blwch os yw'n cuddio rhywbeth.",
            "Dim ond yr hyn rydych chi wedi'i weld wrth eich byrddau eich hun y mae'r HUD yn ei wybod — mae'n darllen eich logiau dwylo lleol, felly rhaid i'r log fod ymlaen, ac mae'r ffigurau'n dod yn ystyrlon ar ôl digon o ddwylo. I ffwrdd yn ddiofyn: trowch ef ymlaen yn Dewisiadau uwch → Cynorthwyydd."] },
        { id: "handsbtn",
          t: "Crynodeb o'r dwylo",
          b: [
            "Mae'r eicon dwylo pocer ar liain y bwrdd yn agor crynodeb cyflym o'r 10 llaw unrhyw bryd — defnyddiol wrth ddysgu. Gellir ei guddio yn y Dewisiadau uwch."] }
      ]
    },
    {
      id: "chat", icon: "💬", title: "Sgwrs a chymdeithasol",
      sections: [
        { id: "panels",
          t: "Sgwrs y lobi a sgwrs y gêm",
          b: [
            "Mae sgwrs yn y lobi ac un arall wrth y bwrdd. Ar ffonau mae sgwrs y gêm yn arnofio dros y bwrdd; ar sgriniau mwy mae'n ffenestr y gellir ei llusgo a newid ei maint. Mae bathodyn ar y botwm sgwrsio yn cyfrif negeseuon heb eu darllen."] },
        { id: "typing",
          t: "Help teipio",
          list: [
            "Mae Tab yn cwblhau llysenw — pwyswch Tab eto i fynd drwy'r cyfatebiaethau.",
            "Mae ↑ / ↓ yn pori hanes eich negeseuon eich hun.",
            "Mae'r botwm emoji yn agor dewisydd llawn; mae teipio : hefyd yn awgrymu emosiynau wrth i chi deipio."] },
        { id: "emotes",
          t: "Emosiynau a gwenogluniau",
          b: [
            "Mae'r sgwrs yn trosi codau byr emosiynau yn union fel y cleient bwrdd gwaith swyddogol: teipiwch enw rhwng dau colon a bydd yn troi'n emoji — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… mae dros 1,900 o godau'n cael eu cefnogi (set lawn GitHub). Mae gwenogluniau testun clasurol yn cael eu trosi hefyd: :-) ;) :D xD :P <3 a thua wyth deg arall.",
            "Mae teipio : yn agor ffenestr awgrymiadau sy'n cwblhau'r cod wrth i chi deipio (↑/↓ i ddewis, Tab neu Enter i dderbyn). Gellir diffodd trosi emoji yn llwyr yn Dewisiadau uwch → Sgwrs."] },
        { id: "commands",
          t: "Gorchmynion sgwrs",
          b: [
            "Mae'r sgwrs yn deall gorchmynion slaes. Mae dau yn weladwy i eraill:"],
          keys: [
            ["/me <text>", "Neges weithred, wedi'i dangos fel “* eichenw testun”   ⟦/me <testun>⟧"],
            ["/emoji <emoji>", "Chwarae ymateb emoji (yr hyn y mae'r dewisydd ymatebion yn ei anfon)   ⟦/emoji <emoji>⟧"]] },
        { id: "diagcmds",
          t: "Gorchmynion diagnostig",
          b: [
            "Mae popeth arall yn lleol: dim ond i chi y mae'r atebion yn cael eu dangos ac nid oes dim yn cael ei anfon at y bwrdd. Teipiwch /help i'w rhestru i gyd. Y rhai mwyaf defnyddiol:"],
          keys: [
            ["/help", "Rhestru pob gorchymyn   ⟦/help⟧"],
            ["/update", "Chwilio am fersiwn newydd ac adnewyddu   ⟦/update⟧"],
            ["/lang <code>", "Newid iaith (e.e. /lang fr)   ⟦/lang <code>⟧"],
            ["/sound on|off", "Troi synau'r gêm ymlaen/i ffwrdd   ⟦/sound on|off⟧"],
            ["/zoom", "Troi chwyddwydr y bwrdd ymlaen/i ffwrdd   ⟦/zoom⟧"],
            ["/clear", "Clirio'r sgwrs yn lleol   ⟦/clear⟧"],
            ["/table", "Gwybodaeth am y gêm bresennol (blinds, chwaraewyr, stacs)   ⟦/table⟧"],
            ["/diag · /netdbg · /fps", "Diagnosteg cyflwr y cleient, y rhwydwaith a'r gyfradd ffrâm   ⟦/diag · /netdbg · /fps⟧"],
            ["/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg", "Dadfygio uwch (cardiau, protocol, sain, storfa, seddi)   ⟦/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg⟧"],
            ["/copy", "Copïo ateb y gorchymyn olaf i'r clipfwrdd   ⟦/copy⟧"]] },
        { id: "privatemsg",
          t: "Negeseuon preifat",
          b: [
            "Ysgrifennwch at un chwaraewr heb i'r lobi gyfan ddarllen. Mae'r amlen wrth ymyl enw yn y rhestr chwaraewyr yn agor sgwrs gyda'r person hwnnw; mae'r amlen ym mhennyn y lobi yn ailagor yr un ddiwethaf. Mae sgyrsiau'n cael eu cadw ar y ddyfais hon ac yn dal yno pan ddewch yn ôl, felly mae sgwrs sy'n parhau ddyddiau'n ddiweddarach yn cario'i hanes — mae'r rhif coch ar yr amlen yn dangos beth nad ydych wedi'i ddarllen eto, ac mae'r bin yn nheitl y ffenestr yn dileu sgwrs am byth."],
          keys: [
            ["/msg <nickname> <text>", "Anfon neges breifat o sgwrs y lobi   ⟦/msg <llysenw> <testun>⟧"],
            ["/msg \"<nickname with spaces>\" <text>", "Yr un peth, pan fo bylchau yn y llysenw   ⟦/msg \"<llysenw gyda bylchau>\" <testun>⟧"]],
          note: "Mae negeseuon wedi'u cyfyngu i 128 nod. Nid yw'r gweinydd yn danfon neges breifat at chwaraewr sy'n eistedd wrth fwrdd lle mae gêm ar y gweill, a dim ond yn y porwr hwn y mae'r hanes yn cael ei gadw — nid yw'n eich dilyn i ddyfais arall." },
        { id: "reactions",
          t: "Ymatebion emoji",
          b: [
            "Mae'r botwm ymateb yn agor dewisydd o 30 o ymatebion animeiddiedig (🎉, 😂, 😱, 🔥…) sy'n chwarae gydag effaith uwchben eich sedd, yn weladwy i bawb wrth y bwrdd — gan gynnwys chwaraewyr ar y cleient bwrdd gwaith. Gellir diffodd ymatebion yn llwyr yn y Dewisiadau uwch."] },
        { id: "translate",
          t: "Deall pawb",
          b: [
            "Pan fydd cyfieithu'r sgwrs ymlaen, mae botwm cyfieithu'n ymddangos ar y llinell dan eich pwyntydd — neu, ar sgrin gyffwrdd, ar y llinell rydych chi wedi'i thapio — ac yn dangos y neges honno yn eich iaith chi gyda chyfieithydd adeiledig y porwr. Gellir ei ddangos yn barhaol ar bob llinell yn Dewisiadau uwch → Sgwrs, lle mae awgrym hefyd sy'n esbonio byrfoddau cyffredin y bwrdd (gg, nh, utg…)."],
          note: "Mae cyfieithu'n defnyddio gwasanaeth Google Translate ac yn gweithio ym mhob porwr — dim ond cysylltiad â'r rhyngrwyd sydd ei angen. Dim ond pan fyddwch yn tapio botwm cyfieithu neges y caiff ei hanfon at y gwasanaeth cyfieithu, byth yn awtomatig." },
        { id: "social",
          t: "Chwaraewyr: proffil, gwahodd, anwybyddu",
          b: [
            "Tapiwch unrhyw chwaraewr — wrth y bwrdd neu yn rhestr y lobi — i agor ei gerdyn: proffil ac ystadegau, gwahodd i'ch gêm, neu anwybyddu (mae ei negeseuon sgwrsio'n cael eu cuddio; gellir dadwneud anwybyddu unrhyw bryd). Gellir galluogi cadarnhad cyn gwahodd/anwybyddu yn y dewisiadau."] }
      ]
    },
    {
      id: "lobby", icon: "🏛️", title: "Lobi a gemau",
      sections: [
        { id: "list",
          t: "Rhestr y gemau",
          b: [
            "Mae'r lobi'n rhestru pob bwrdd ar y gweinydd. Mae pob cofnod yn dangos nifer y chwaraewyr, y math o gêm, clo pan fo angen cyfrinair neu wahoddiad, a bathodyn statws: “Yn aros” (gwyrdd — nid yw'r gêm wedi dechrau, gallwch ymuno os oes sedd yn rhydd), “Ar y gweill” (lliw cynnes — gellir ei gwylio'n fyw pan fo gwylwyr yn cael eu caniatáu) ac “Ar gau” (wedi pylu). Mae bwrdd llawn yn dangos y cyfrif llawn, e.e. 10/10; mae lliwiau'r bathodynnau'n dilyn y thema weithredol.",
            "Mae'r gwymplen hidlo yn culhau'r rhestr yn union fel y cleient bwrdd gwaith, pob dewis yn llymach na'r un blaenorol: gemau agored yn unig → cuddio byrddau llawn hefyd → yna dim ond rhai nad ydynt yn breifat, dim ond rhai preifat neu dim ond gemau gyda safle. Mae eich dewis yn cael ei gofio. Mae'r maes chwilio yn dod o hyd i gêm yn ôl ei henw, ac mae bathodyn y chwaraewyr yn agor rhestr o bawb sydd ar-lein, y gellir ei chwilio a'i threfnu."] },
        { id: "join",
          t: "Ymuno a gwylio",
          b: [
            "Dewiswch gêm agored ac ymunwch â hi — mae clo yn golygu bod angen cyfrinair. Gellir gwylio gemau ar y gweill sy'n caniatáu gwylwyr yn fyw: rydych chi'n gweld y bwrdd a'r sgwrs, ond mae'r cardiau poced yn aros yn gudd ac ni allwch weithredu."] },
        { id: "gameinfo",
          t: "Gwybodaeth am y gêm",
          b: [
            "Cyn ymuno, mae cerdyn gwybodaeth y gêm yn dangos popeth sy'n diffinio'r bwrdd: y math o gêm, y blinds a sut maen nhw'n codi (dyblu neu restr â llaw), yr arian cychwynnol, y terfyn amser ar gyfer symudiad, yr oedi rhwng dwylo a phwy sydd eisoes yn eistedd."] },
        { id: "create",
          t: "Creu gêm",
          b: [
            "Crëwch eich bwrdd eich hun: enw, nifer y chwaraewyr, yr arian cychwynnol, y blind bach cyntaf a'r amserlen codi, y terfyn amser ar gyfer symudiad ac a yw gwylwyr yn cael eu caniatáu. Mae pedwar math o gêm: Arferol (unrhyw un), chwaraewyr cofrestredig yn unig, drwy wahoddiad yn unig a Ranking (yn cyfrif yn y safleoedd swyddogol — ni chaniateir cyfrinair yno). Gellir cadw eich hoff osodiadau a'u llwytho eto."] },
        { id: "invites",
          t: "Gwahoddiadau",
          b: [
            "Gall chwaraewyr eich gwahodd at eu bwrdd; rydych chi'n cael hysbysiad y gallwch ei dderbyn neu ei wrthod. Cael gwahoddiad yw'r unig ffordd i mewn i gêm drwy wahoddiad yn unig."] }
      ]
    },
    {
      id: "pthnet", icon: "🌐", title: "pokerth.net",
      sections: [
        { id: "account",
          t: "Eich cyfrif",
          b: [
            "Y gweinydd rhyngrwyd swyddogol yw pokerth.net. Mae chwarae yno'n gofyn am gyfrif pokerth.net am ddim — cofrestrwch ar y wefan, yna mewngofnodwch yma gyda'r un llysenw a chyfrinair. Mae'r cleient gwe hwn yn cysylltu â'r un gweinydd â'r cleient bwrdd gwaith: yr un cyfrifon, yr un byrddau, yr un safleoedd, a gallwch eistedd wrth yr un bwrdd â chwaraewyr bwrdd gwaith."] },
        { id: "ranked",
          t: "Gemau gyda safle a thymhorau",
          b: [
            "Mae gemau o'r math Ranking yn cyfrif tuag at safleoedd swyddogol y tymor. Mae eich proffil yn yr ap yn dangos pryd ymunoch chi, eich Safle, eich Sgôr, eich cyfartaledd a'r gemau a chwaraewyd yn y tymor presennol, ynghyd â'ch canlyniadau diweddaraf. Mae gemau arferol (heb safle) er hwyl yn unig ac nid ydynt yn newid dim."] },
        { id: "rankhow",
          t: "Sut mae'r safle'n cael ei gyfrifo",
          b: [
            "Ym mhob gêm gyda safle, mae'r lle rydych chi'n gorffen ynddo'n rhoi pwyntiau: 15 am y cyntaf, yna 9, 6, 4, 3, 2 ac 1 hyd at y seithfed; nid yw'r wythfed i'r degfed yn cael dim. Felly mae un bwrdd yn dosbarthu 40 pwynt i gyd.",
            "Nid swm y pwyntiau hynny yw eich Sgôr ond eich cyfartaledd fesul gêm, wedi'i leddfu gan ffactor sy'n tyfu gyda nifer y gemau a chwaraewyd: nid yw ychydig o ganlyniadau da yn ddigon i setlo ar y brig, mae angen cysondeb hefyd — po fwyaf rydych chi'n chwarae, agosaf y daw eich Sgôr at eich gwir gyfartaledd. Mae tymhorau'n para chwarter: wrth newid, mae popeth yn cael ei archifo a'r cownteri'n dechrau o sero, tra bod tymhorau'r gorffennol ar gael o hyd. Yn y gêm, mae'r botwm podiwm yn dangos safleoedd tymor y chwaraewyr wrth eich bwrdd."],
          note: "Gweinydd safleoedd pokerth.net sy'n gosod y raddfa bwyntiau a'r union fformiwla a gallant newid; tudalennau'r wefan yw'r cyfeirnod." },
        { id: "rankings",
          t: "Tudalennau safleoedd",
          b: [
            "Mae'r eitem safleoedd yn agor safleoedd swyddogol PokerTH, y gellir eu chwilio yn ôl chwaraewr, ochr yn ochr â safleoedd y cymunedau (BBC, WEC). Os nad oes gennych ddiddordeb mewn safleoedd, gellir cuddio'r eitem yn Dewisiadau uwch → Cymuned."] },
        { id: "cups",
          t: "Cwpanau cymunedol: BBC a WeCup",
          b: [
            "Mae dwy gymuned yn cynnal eu cystadlaethau eu hunain ar pokerth.net, pob un gyda'i gwefan a'i safleoedd ei hun. Twrnamaint grisiog a ddechreuodd yn 2013 yw Best Brainies Cup (BBC): rydych chi'n symud ymlaen o Step 1 i Step 4, ac mae tymor newydd yn dechrau ar ôl pob gêm Step 4, pan gyflwynir y cwpan. Mae gan WeCup (WEC) ei raddfa ei hun, wedi'i lledaenu'n llawer ehangach — 75 pwynt am y lle cyntaf, yna 45, 30, 20… — ac mae ei sgôr yn normaleiddio eich cyfartaledd yn ôl nifer y gemau rydych chi wedi'u chwarae o'u cymharu ag aelodau eraill.",
            "Mae'r ddau safle'n agor o'r botwm tlws, wrth ymyl safleoedd PokerTH. Mae gosodiadau byrddau'r cystadlaethau hyn ar gael fel rhagosodiadau wrth greu gêm (BBC Step 1 i 4, WEC, WEC Monthly Final a WEC Grand Final), fel y gallwch ymarfer dan yr un amodau. I gymryd rhan, rhaid cofrestru ar wefan y cwpan dan sylw."],
          note: "Gellir cuddio'r holl gynnwys hwn ar unwaith yn Dewisiadau uwch → Cymuned os nad oes gennych ddiddordeb yn y cwpanau." },
        { id: "forumcups",
          t: "Cwpanau a digwyddiadau'r fforwm",
          b: [
            "Mae fforwm pokerth.net hefyd yn cynnal y Monthly Cup — cyfres fisol lle mae chwaraewyr yn cael eu rhannu rhwng byrddau Gold, Silver a Bronze cyn i bencampwr y mis gael ei benderfynu — ynghyd â chwpanau arbennig unwaith yn unig drwy'r flwyddyn.",
            "Mae cofrestriadau, amserlenni, gosodiadau byrddau a chanlyniadau'n cael eu cyhoeddi ar y fforwm, ac mae'r gemau'n cael eu chwarae ar y gweinydd swyddogol fel unrhyw rai eraill. Mae cyfrif pokerth.net yn ddigon i ddilyn y canlyniadau; mae cymryd rhan mewn cwpan drwy'r edefyn fforwm perthnasol."] },
        { id: "forumnews",
          t: "Newyddion y fforwm yn y lobi",
          b: [
            "Mae'r botwm papur newydd ym mhennyn y lobi yn agor y negeseuon diweddaraf o fforwm pokerth.net, un cofnod i bob pwnc, pob fforwm yn ei liw ei hun. Mae bathodyn ar y botwm yn cyfrif negeseuon heb eu darllen; mae agor neges (mewn tab newydd) yn ei marcio fel wedi'i darllen, ac mae “Marcio'r cyfan fel wedi'i ddarllen” yn clirio popeth ar unwaith.",
            "Ychwanegiad gwe yw hwn: gellir cuddio'r botwm yn y Dewisiadau uwch (“Botwm fforwm ym mhennyn y lobi”).",
            "Mae'r tab “Digwyddiadau” yn dangos y gemau BBC sydd i ddod a'r Monthly Cup nesaf gyda nifer y chwaraewyr sydd wedi cofrestru, ynghyd ag enillwyr diweddaraf BBC, WEC a'r Monthly Cup. Mae'r amseroedd yn eich amser lleol, ac mae tapio'n agor gwefan y gymuned. Mae'r dewis “Dangos cynnwys y gymuned (BBC / WEC)” yn cuddio'r tab hwn."] },
        { id: "avatars",
          t: "Afatarau a baneri",
          b: [
            "Ar pokerth.net mae eich afatar yn cael ei ddosbarthu i chwaraewyr eraill drwy'r gweinydd afatarau, a gellir dangos baner gwlad fach ar flychau'r chwaraewyr. Mae'r ddau'n ddewisol ac yn cael eu haddasu yn y dewisiadau."] }
      ]
    },
    {
      id: "offline", icon: "🏋️", title: "Modd ymarfer",
      sections: [
        { id: "what",
          t: "Beth ydyw",
          b: [
            "Mae'r modd Lleol / ymarfer yn gêm lawn yn erbyn gwrthwynebwyr cyfrifiadur: dim cysylltiad, dim cyfrif, dim byd yn y fantol. Unwaith y bydd yr ap wedi'i osod (neu wedi ymweld ag ef unwaith yn unig), mae'n gweithio'n gyfan gwbl all-lein — perffaith i ddysgu'r gêm, profi'r rhyngwyneb neu dreulio amser yn y modd awyren."] },
        { id: "setup",
          t: "Paratoi gêm",
          b: [
            "Dewiswch nifer y gwrthwynebwyr, yr arian cychwynnol, y blinds a'r amserlen codi, a chyflymder y gêm. Gellir addasu cyfansoddiad ac anhawster y botiaid yn Dewisiadau uwch → Gêm leol — o wrthwynebwyr addfwyn i fwrdd cymysg, caletach."] },
        { id: "trophies",
          t: "Tlysau",
          b: [
            "Mae gan y modd ymarfer ei gynnydd ei hun: mae 28 tlws mewn chwe chategori (cynnydd, sgil, arddull, fformatau, hwyl ac un cyfrinachol) yn datgloi wrth i chi chwarae — dwylo a chwaraewyd, gemau a enillwyd, blyffiau mawr, dwylo arbennig a mwy. Mae eich cynnydd tlysau'n cronni ac yn cael ei uno rhwng dyfeisiau pan fydd cysoni gosodiadau'r cyfrif yn weithredol."] },
        { id: "learn",
          t: "Lle da i ddysgu",
          b: [
            "Mae popeth o'r penodau eraill yn gweithio yma hefyd: y monitor tebygolrwydd, arddangosfa'r cynorthwyydd, dewis ymlaen llaw, llwybrau byr bysellfwrdd. Y modd ymarfer yw'r lle gorau i roi cynnig arnynt heb bwysau cyn mentro i pokerth.net."] }
      ]
    },
    {
      id: "style", icon: "🎨", title: "Arddull a sain",
      sections: [
        { id: "themes",
          t: "Themâu",
          b: [
            "Mae'r categori Arddull yn y Dewisiadau uwch yn newid golwg y cleient cyfan. Mae rhagosodiadau'n gosod popeth ag un tap (casino gwyrdd clasurol, golwg swyddogol PokerTH…); oddi tanynt mae echelinau ar wahân yn gadael i chi fireinio'r palet lliw, lliain y bwrdd a wynebau'r cardiau ar wahân — newidiwch unrhyw echelin a bydd eich cymysgedd yn dod yn thema bersonol. Mae modd tywyll, golau neu awtomatig yn cael ei ddewis yn y Rhyngwyneb defnyddiwr, ac mae eich dewisiadau'n dod i rym ar unwaith, ar bob sgrin, ac yn cael eu cofio."] },
        { id: "tablelook",
          t: "Byrddau, pecynnau, seddi",
          b: [
            "Y tu hwnt i'r thema, gellir newid sawl elfen yn annibynnol: cefndir y bwrdd, y pecyn cardiau, cefn y cerdyn (ei gyfateb i'r pecyn yn awtomatig neu fewnforio eich delwedd eich hun), disgiau'r deliwr a'r blinds, arddull y botymau gweithredu a phecynnau seddi llawn sy'n newid golwg blychau'r chwaraewyr. Dewiswch y cyfan yn Dewisiadau uwch → Arddull; mae'r newidiadau i'w gweld wrth y bwrdd ar unwaith."] },
        { id: "music",
          t: "Chwaraewr cerddoriaeth",
          b: [
            "Mae'r eitem gerddoriaeth yn newislenni'r pennyn yn agor chwaraewr cerddoriaeth lounge bach: dewiswch drac o'r rhestr chwarae, chwarae/saib, blaenorol/nesaf, cymysgu, ac ailadrodd un trac, y rhestr chwarae gyfan neu ddim byd. Mae'r sŵn, y trac a ddewiswyd a'r modd ailadrodd yn cael eu cofio. Nid yw'r chwarae byth yn dechrau ar ei ben ei hun — mae porwyr yn gofyn am dap — ac mae'r chwaraewr yn gwbl annibynnol ar effeithiau sain y gêm.",
            "Mae'r ddau fawd o dan enw'r trac yn dweud a ydych chi'n hoffi'r hyn sy'n chwarae. Un bleidlais ddienw i bob dyfais, radios wedi'u cynnwys, a gallwch ei newid neu ei thynnu'n ôl unrhyw bryd; oni bai bod y gweithredwr yn datgelu'r cyfansymiau, dim ond eich bawd eich hun a welwch.",
            "Ar iPhone ac iPad mae'r chwaraewr yn defnyddio chwarae syml yn ddiofyn, fel bod cerddoriaeth yn parhau gyda CarPlay, Bluetooth neu sgrin wedi'i chloi; yna mae'r sŵn yn cael ei addasu gyda botymau'r ddyfais neu'r car. Mae'r dewis “Sŵn o fewn yr ap” yn dod â'r llithrydd sŵn, y cydbwysedd a'r mesurydd VU yn ôl, ond gall y sain atal yn y car."] },
        { id: "sounds",
          t: "Effeithiau sain",
          b: [
            "Mae synau'r gêm wedi'u grwpio mewn pedwar categori y gellir eu troi ymlaen/i ffwrdd ar wahân, yn union fel yn y cleient bwrdd gwaith: symudiadau'r gêm (cardiau'n cael eu delio, Check, Call, Raise, eich tro…), hysbysiad sgwrs y lobi, hysbysiadau gêm rwydwaith (chwaraewr wedi ymuno, gêm yn barod) a hysbysiad codi'r blinds. Mae un llithrydd sŵn yn rheoli'r cyfan, yn Dewisiadau uwch → Sain."],
          note: "Mae pob porwr — iOS yn arbennig — yn gwrthod chwarae sain nes i chi dapio'r dudalen unwaith. Os yw'r gêm yn dechrau'n dawel, mae un tap unrhyw le yn deffro'r sain; mae'r cleient hefyd yn adfer yr injan sain yn awtomatig pan fydd iOS yn ei hatal (galwad yn dod i mewn, newid i'r cefndir…)." },
        { id: "voice",
          t: "Cyhoeddiadau llais a dirgryniad",
          b: [
            "Gall dwy sianel ychwanegol roi gwybod i chi heb edrych ar y sgrin: mae cyhoeddiadau llais yn darllen digwyddiadau'r gêm gyda synthesis lleferydd eich dyfais, ac ar ffonau gall dirgryniad byr nodi eich tro. Estyniadau gwe yw'r ddau, ymlaen neu i ffwrdd yn ddiofyn yn dibynnu ar y ddyfais, yn Dewisiadau uwch → Betiau a thro."],
          note: "Mae dirgryniad yn gweithio ar Android (porwyr Chromium); nid yw Apple yn darparu API dirgryniad i wefannau, felly ni all iPhones ddirgrynu. Mae cyhoeddiadau llais yn gweithio ym mhobman, ond mae'r lleisiau a'r ieithoedd sydd ar gael yn dibynnu ar eich system — mae'r cleient yn defnyddio'r gyfatebiaeth orau y mae'n ei chanfod." }
      ]
    },
    {
      id: "options", icon: "⚙️", title: "Dewisiadau a llwybrau byr",
      sections: [
        { id: "where",
          t: "Ble mae'r dewisiadau",
          b: [
            "Mae'r Dewisiadau uwch yn agor o eitem y gêr mewn unrhyw ddewislen pennyn. Maen nhw wedi'u grwpio fel yn y cleient bwrdd gwaith: Rhyngwyneb defnyddiwr, Arddull, Sain, Gêm leol, Gêm rwydwaith, Gêm ar y rhyngrwyd, Llysenwau / Afatarau, Negeseuon log a Chopi wrth gefn ac ailosod. Mae gan bob nodwedd sy'n benodol i'r we ei switsh ei hun yno, felly gallwch ddiffodd unrhyw beth nad ydych yn ei ddefnyddio."] },
        { id: "cfgxml",
          t: "Cyfnewid gosodiadau gyda'r cleient bwrdd gwaith",
          b: [
            "Gall eich gosodiadau symud rhwng cleientiaid: mae'r categori Copi wrth gefn ac ailosod yn cynnig allforio/mewnforio ffeil swyddogol config.xml (~/.pokerth/config.xml, a ddefnyddir gan y cleientiaid bwrdd gwaith a QML). Mae allforio yn ysgrifennu'r gosodiadau a rennir — enw, dewisiadau arddangos, synau, dewisiadau bwrdd, blinds, arddulliau — ac mae mewnforio yn gweithredu ffeil y bwrdd gwaith yma. Mae gosodiadau nad yw'r cleient hwn yn eu hadnabod yn cael eu cadw heb eu cyffwrdd yn y ffeil.",
            "Mae eich nodiadau am chwaraewyr yn teithio gyda'r ffeil hefyd — y testun a'r sgôr sêr, wedi'u hysgrifennu fel y mae'r cleientiaid bwrdd gwaith yn eu darllen. Mae'r labeli lliw yn aros yn y cleient hwn: nid oes gan y fformat swyddogol faes ar eu cyfer, felly nid yw mewnforio byth yn cyffwrdd â'ch rhai chi."] },
        { id: "sync",
          t: "Gosodiadau sy'n eich dilyn",
          b: [
            "Pan fyddwch yn chwarae gyda chyfrif, mae eich dewisiadau, thema, aseiniadau bysellau, iaith a thlysau ymarfer yn cael eu cysoni: newidiwch rywbeth ar un ddyfais a bydd y ddyfais nesaf y byddwch yn mewngofnodi arni'n ei godi. Mae cynnydd tlysau'n cael ei uno, byth yn cael ei drosysgrifo, felly mae chwarae ar ddwy ddyfais bob amser yn cadw'r gorau o'r ddwy."] },
        { id: "updates",
          t: "Cadw'n gyfredol",
          b: [
            "Mae'r cleient yn diweddaru ei hun: pan fydd fersiwn newydd yn cael ei gosod, mae baner yn eich gwahodd i adnewyddu (neu teipiwch /update yn y sgwrs i wirio â llaw). Weithiau gall arolwg cynnyrch bach ymddangos i ofyn eich barn am nodwedd — mae cymryd rhan yn ddewisol, a gellir diffodd arolygon yn llwyr yn Dewisiadau uwch → Cymuned."] },
        { id: "fkeys",
          t: "Llwybrau byr bysellfwrdd swyddogol",
          b: [
            "Mae bysellau ffwythiant swyddogol PokerTH yn gweithio yn ystod gêm — mae Alt+S yn gweithio ym mhobman:"],
          keys: [
            ["F1 / F2 / F3 / F4", "Fold · Check/Call · Bet/Raise · All-In (gellir gwrthdroi'r drefn yn y dewisiadau)   ⟦F1 / F2 / F3 / F4⟧"],
            ["F5", "Dangos eich cardiau (pan fo'n bosibl)   ⟦F5⟧"],
            ["F6 / F7 / F8", "Â llaw · Check/Fold awtomatig · Check/Call awtomatig   ⟦F6 / F7 / F8⟧"],
            ["Alt+M / Alt+K / Alt+F", "Â llaw · Check/Call awtomatig · Check/Fold awtomatig   ⟦Alt+M / Alt+K / Alt+F⟧"],
            ["Alt+C / Alt+L / Alt+I", "Sgwrs · Log y gêm · Panel tebygolrwydd   ⟦Alt+C / Alt+L / Alt+I⟧"],
            ["Alt+S", "Gosodiadau — unrhyw le yn yr ap, nid yn ystod gêm yn unig   ⟦Alt+S⟧"],
            ["F11", "Sgrin lawn   ⟦F11⟧"]],
          note: "Mae angen bysellfwrdd ffisegol ar gyfer y llwybrau byr. Ar Mac, rheolyddion cyfryngau yw'r bysellau F yn ddiofyn: daliwch Fn (neu galluogwch “Defnyddio F1, F2, ac ati fel bysellau ffwythiant safonol” yng ngosodiadau macOS). Ar iPhone mae sgrin lawn yn cael ei chyfyngu gan iOS — mae gosod yr ap fel PWA yn rhoi'r un profiad sgrin lawn." },
        { id: "webkeys",
          t: "Bysellau llythrennau'r we",
          b: [
            "Fel estyniad gwe, mae bysellau un llythyren ac Alt+T hefyd yn sbarduno gweithredoedd, a gellir ailbennu pob un ohonynt yn Dewisiadau uwch → Llwybrau byr bysellfwrdd:"],
          keys: [
            ["F", "Fold   ⟦F⟧"],
            ["C", "Check / Call   ⟦C⟧"],
            ["R", "Raise   ⟦R⟧"],
            ["A", "All-In   ⟦A⟧"],
            ["1 / 2 / 3", "Bet 1/3 · 1/2 · Pot   ⟦1 / 2 / 3⟧"],
            ["Alt+T", "Panel ystadegau   ⟦Alt+T⟧"],
            ["Esc", "Cau'r ffenestr uchaf (hefyd botwm Yn ôl Android)   ⟦Esc⟧"],
            ["↑ ↓ · ↵", "Rhestr byrddau'r lobi (cyrraedd gyda Tab): dewis bwrdd · ymuno ag ef   ⟦↑ ↓ · ↵⟧"]],
          note: "Ar Android, mae botwm/ystum Yn ôl y system yn cau ffenestri fel Escape yn lle gadael y gêm (gellir ei addasu yn y dewisiadau). Nid oes botwm system cyfatebol gan iOS — defnyddiwch ✕ pob ffenestr." }
      ]
    }
  ]
};
