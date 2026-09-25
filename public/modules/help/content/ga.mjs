// ── help/content/ga.mjs — Irish (Gaeilge) help corpus ────────────────────
//
// Same structure as en.mjs (reference): chapters[] → { id, icon, title,
// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand
// names of the rules chapter stay in English, as in the other help corpora.
export const help = {
  chapters: [
    {
      id: "start", icon: "🚀", title: "Ag tosú",
      sections: [
        { id: "modes",
          t: "Trí bhealach le himirt",
          b: [
            "Ar an scáileán logála isteach, roghnaigh conas is mian leat imirt."],
          list: [
            "Idirlíon — imir ar líne ar fhreastalaí oifigiúil pokerth.net le rangú. Tá cuntas pokerth.net ag teastáil; cláraigh saor in aisce ar pokerth.net.",
            "Áitiúil / cleachtadh — imir as líne in aghaidh róbónna. Níl dada le socrú, oibríonn sé gan cheangal agus díghlasálann sé trófaithe de réir mar a théann tú chun cinn.",
            "LAN / Freastalaí tiomnaithe — ceangail le freastalaí príobháideach PokerTH ar do líonra áitiúil nó ar do ríomhaire féin."] },
        { id: "lan",
          t: "LAN / freastalaí tiomnaithe",
          b: [
            "Ceanglaíonn an tríú mód le haon fhreastalaí PokerTH a reáchtálann tusa nó cara — ar líonra baile, ar VPS príobháideach, áit ar bith. Cuir isteach seoladh agus port an fhreastalaí, cuir tic le TLS má úsáideann an freastalaí port criptithe, agus logáil isteach le leasainm (oibríonn rochtain aoi má cheadaíonn an freastalaí í). Ina dhiaidh sin oibríonn gach rud ag an mbord díreach mar a oibríonn sé ar an bhfreastalaí oifigiúil."] },
        { id: "famboard",
          t: "Clár ceannairí an teaghlaigh",
          b: [
            "Ar fhreastalaithe príobháideacha agus i gcluichí LAN amháin, coinníonn an cliant staitisticí iomlána do gach leasainm — lámha agus cluichí imeartha agus buaite, an bua is mó, an tsraith is fearr — agus roinneann sé iad tríd an bhfreastalaí ionas go bhfeiceann gach gléas timpeall an bhoird an clár ceannairí céanna. Ní rianaítear cluichí pokerth.net mar seo riamh, agus coinnítear staitisticí an mhóid cleachtaidh go hiomlán ar leith.",
            "Sna cluichí seo, osclaíonn an cnaipe trófaí fuinneog an rangaithe ar a cluaisín LAN: gach imreoir, inshórtáilte de réir roinnt critéar."] },
        { id: "language",
          t: "Teanga",
          b: [
            "Tá an comhéadan ar fáil i 75 teanga. Athraigh í am ar bith sna hArdroghanna (roghchlár an ghiar) faoi Chomhéadan úsáideora. Fanann téarmaí bheart an phócair (Fold, Check, Call, Bet, Raise, All-In) i mBéarla de réir an traidisiúin, díreach mar sa chliant deisce."] },
        { id: "pwa",
          t: "Suiteáil mar aip",
          b: [
            "Is Progressive Web App an cliant seo: is féidir leat é a shuiteáil ó roghchlár do bhrabhsálaí (nó ón gcnaipe suiteála sa cheanntásc) chun aip lánscáileáin a fháil lena deilbhín féin. Nuair atá sí suiteáilte, osclaíonn sí láithreach agus oibríonn an mód cleachtaidh go hiomlán as líne."],
          note: "Ar Android agus ar Chrome/Edge deisce, déanann an cnaipe suiteála gach rud. Ar iPhone/iPad ní cheadaíonn Apple suiteáil ach trí Safari: cnaipe Comhroinn → “Cuir leis an Scáileán Baile” — taispeánann an cliant na céimeanna seo nuair is gá. Imíonn an cnaipe nuair atá an aip suiteáilte." },
        { id: "platforms",
          t: "Ardáin agus brabhsálaithe",
          b: [
            "Ritheann an cliant in aon bhrabhsálaí nua-aimseartha ar aon chóras — Windows, macOS, Linux, Android, iOS. Braitheann cúpla gné ar APIanna brabhsálaí níos nuaí; nuair a bhíonn API ar iarraidh, folaíonn an ghné í féin nó míníonn sí an fáth in áit briseadh. Na príomhdhifríochtaí:"],
          list: [
            "Chrome / Edge (deisce): oibríonn gach rud, lena n-áirítear an loga .pdb a scríobh chuig fillteán.",
            "Firefox: gach rud seachas an loga .pdb a scríobh chuig fillteán (níl an API ar fáil fós).",
            "Safari / iOS: suiteáil trí Comhroinn → Cuir leis an Scáileán Baile; gan chreathadh; lánscáileán teoranta ar iPhone; tosaíonn an fhuaim tar éis do chéad tapáil.",
            "Android: tacaíocht iomlán i mbrabhsálaithe Chromium, creathadh agus iompar an chnaipe Siar san áireamh."] },
        { id: "avatar",
          t: "Leasainm agus abhatár",
          b: [
            "Roghnaigh do leasainm agus d'abhatár ar an scáileán logála isteach sula gceanglaíonn tú. Ar pokerth.net, is é do leasainm ainm do chuntais; roinntear abhatáir le himreoirí eile trí fhreastalaí na n-abhatár.",
            "Seoltar d'abhatár nuair a cheanglaíonn tú, agus feiceann gach imreoir an ceann céanna. Má athraíonn tú é agus tú ceangailte, beidh an t-abhatár nua i bhfeidhm ón gcéad cheangal eile. Ní sheoltar an túslitir (Aa): feiceann imreoirí eile an t-abhatár réamhshocraithe."] }
      ]
    },
    {
      id: "rules", icon: "🃏", title: "Rialacha an phócair",
      sections: [
        { id: "basics",
          t: "Texas Hold’em go hachomair",
          b: [
            "Imríonn PokerTH No-Limit Texas Hold’em. Faigheann gach imreoir dhá chárta phríobháideacha (cártaí póca). Ansin leagtar cúig chárta phobail os comhair aghaidhe i lár an bhoird. Buann an lámh cúig chárta is fearr ó aon teaglaim de do dhá chárta agus na cúig chárta phobail an pota."] },
        { id: "blinds",
          t: "Na blinds agus cnaipe an déileálaí",
          b: [
            "Roimh gach lámh, tosaíonn dhá gheall éigeantacha an pota: an blind beag agus an blind mór, a chuireann an dá imreoir ar chlé ó chnaipe an déileálaí. Bogann an cnaipe suíochán amháin deiseal tar éis gach láimhe, mar sin íocann gach duine na blinds ar a seal. Ardaítear na blinds go rialta de réir mar a théann an cluiche ar aghaidh.",
            "Ar an mbord, marcáiltear an cnaipe agus na blinds le diosca: D (déileálaí), SB (blind beag), BB (blind mór)."] },
        { id: "streets",
          t: "Na ceithre bhabhta gealltóireachta",
          list: [
            "Pre-flop — tar éis na cártaí póca a dhéileáil, tosaíonn an chéad bhabhta ar chlé ón blind mór.",
            "Flop — nochtar trí chárta phobail, agus ina dhiaidh sin babhta gealltóireachta.",
            "Turn — ceathrú cárta pobail, ansin babhta gealltóireachta eile.",
            "River — an cúigiú cárta pobail agus an ceann deireanach, ansin an babhta gealltóireachta deireanach."],
          b: [
            "Críochnaíonn babhta gealltóireachta nuair a chuir gach imreoir atá fós sa lámh an méid céanna sa phota (nó nuair atá siad all-in)."] },
        { id: "actions",
          t: "Cad is féidir leat a dhéanamh ar do sheal",
          list: [
            "Fold — tabhair suas an lámh. Caitear do chártaí uait agus níl tú san iomaíocht don phota a thuilleadh.",
            "Check — téigh ar aghaidh gan gheall. Ní féidir é ach nuair nach bhfuil aon rud le glaoch air.",
            "Call — meaitseáil an geall reatha.",
            "Bet — oscail an ghealltóireacht nuair nár chuir aon duine geall fós ar an tsráid seo.",
            "Raise — méadaigh geall atá ann cheana. Is ionann an raise is lú agus an geall nó an raise roimhe.",
            "All-In — cuir do chruach ar fad isteach. Fanann tú sa lámh suas go dtí an méid a chlúdaigh tú."] },
        { id: "showdown",
          t: "Showdown agus potaí roinnte",
          b: [
            "Má tá níos mó ná imreoir amháin fágtha tar éis bhabhta gealltóireachta an river, nochtar na cártaí agus buann an lámh is fearr — taispeántar an lámh bhuaiteach faoi na cártaí pobail. Nuair atá imreoir all-in ar níos lú ná na geallta iomlána, cruthaítear potaí taoibh: ní féidir le gach imreoir ach an chuid den phota ar chuir sé leis a bhuachan. Roinneann lámha comhionanna an pota.",
            "Ní gá do gach duine a gcártaí a thaispeáint: ag tosú leis an imreoir a rinne an geall nó an raise deireanach, ní nochtar lámh ach amháin má bhuaileann sí an méid atá taispeánta cheana. Coinníonn aon duine a bhfuil sé de cheart aige a chártaí a chaitheamh uaidh folaithe iad agus faigheann sé cnaipe Taispeáin chun iad a nochtadh mar sin féin."] },
        { id: "hands",
          t: "Ord na lámh",
          b: [
            "Ón lámh is laige go dtí an lámh is láidre:"],
          list: [
            "1. Cárta ard — gan teaglaim; socraíonn an cárta is airde.",
            "2. Péire — dhá chárta den luach céanna.",
            "3. Dhá phéire — dhá phéire éagsúla.",
            "4. Trí den saghas céanna — trí chárta den luach céanna.",
            "5. Sruth — cúig chárta i ndiaidh a chéile (comhairtear an tAon ard nó íseal).",
            "6. Dath — cúig chárta den chulaith chéanna.",
            "7. Teach lán — trí den saghas céanna agus péire.",
            "8. Ceathair den saghas céanna — ceithre chárta den luach céanna.",
            "9. Sruth datha — sruth, é ar fad den chulaith chéanna.",
            "10. Sruth ríoga — ón Deich go dtí an tAon, é ar fad den chulaith chéanna. An lámh is fearr is féidir."] }
      ]
    },
    {
      id: "game", icon: "🎮", title: "Scáileán an chluiche",
      sections: [
        { id: "actionbar",
          t: "Barra na mbeart",
          b: [
            "Nuair is é do shealsa é, lasann barra na mbeart ag an mbun le suas le ceithre chnaipe: Fold (dearg), Check / Call (gorm), Bet / Raise (glas — an príomhbheart aibhsithe) agus All-In (dearg dorcha). Taispeánann an cnaipe Check / Call an méid cruinn le glaoch air; taispeánann Bet / Raise an méid atá tú ar tí a chur isteach. Tar éis an river, féadfaidh All-In a bheith ina chnaipe Taispeáin chun do chártaí a nochtadh."] },
        { id: "betctl",
          t: "Do gheall a roghnú",
          b: [
            "Socraigh méid an raise leis an réimse uimhreach, an sleamhnán nó na cnaipí tapa 1/3 · 1/2 · Pota (codáin den phota reatha). Slánaítear na méideanna go huathoibríoch agus coinnítear idir an raise dlíthiúil is lú agus is mó iad. Más fearr leat smaoineamh i mblinds móra, taispeánann rogha gach méid i BB in áit sceallóg."] },
        { id: "preselect",
          t: "Beart a réamhroghnú",
          b: [
            "Roimh do sheal is féidir leat beart a ullmhú roimh ré: tapáil cnaipe agus gheobhaidh sé imeall óir le ponc beag óir. Nuair a thagann do sheal, déantar an beart láithreach. Iompaíonn Fold réamhroghnaithe ina Check go huathoibríoch nuair atá check saor — ní dhéanann tú fold gan ghá riamh. Athshocraítear na réamhroghanna le gach lámh nua, athrú sráide agus showdown, agus cealaítear iad má athraíonn an scéal (mar shampla má athraíonn méid an call)."] },
        { id: "automodes",
          t: "Móid uathoibríocha",
          b: [
            "Tairgeann an roghchlár anuas in aice le cnaipí na mbeart trí mhód imeartha: De láimh, Check/Call uathoibríoch agus Check/Fold uathoibríoch. Imríonn na móid uathoibríocha ar do shon go dtí go n-athraíonn tú ar ais — filleann aon chliceáil láimhe ar bheart ar De láimh láithreach."] },
        { id: "readtable",
          t: "An bord a léamh",
          b: [
            "Taispeánann bosca gach imreora an t-abhatár, an t-ainm, an chruach agus an geall reatha. Marcáiltear an déileálaí agus na blinds le diosca D / SB / BB. Taispeánann suaitheantas daite ar an mbosca beart deireanach an imreora; comhaireann barra tanaí gorm a am smaointeoireachta síos. Lonraíonn bosca an imreora a bhfuil a sheal ann; faigheann do bhosca féin fráma óir a phreabann ar do sheal.",
            "Taispeánann an barra stádais os cionn an bhoird an pota iomlán, geallta na sráide reatha, an chéim (Pre-flop, Flop, Turn, River) agus uimhreacha an chluiche agus na láimhe. Tá cártaí na n-imreoirí a rinne fold leathghardhearcach; tá na himreoirí atá amuigh múchta. Ag deireadh láimhe, is féidir le fuinneog an bhuaiteora achoimre a thabhairt ar cé a bhuaigh cad — is féidir í a mhúchadh sna roghanna."] },
        { id: "seatlayout",
          t: "Leagan amach na suíochán",
          b: [
            "Mar bhreiseán gréasáin, is féidir leagan amach bhoscaí na n-imreoirí a roghnú in Ardroghanna → Suíocháin: leanann Uathoibríoch an cliant oifigiúil (ionaid sheasta i bportráid, éilips ríofa i dtírdhreach), nó cuir Portráid nó Tírdhreach i bhfeidhm — agus ligeann Saincheaptha duit gach suíochán a shocrú tú féin: osclaítear mód eagarthóireachta ina dtarraingíonn tú gach bosca go díreach áit ar mian leat, agus sábháiltear an leagan amach."] },
        { id: "zoom",
          t: "Súmáil an bhoird (fóin)",
          b: [
            "Ar scáileáin bheaga, méadaíonn na cnaipí formhéadaitheora an bord (2×) agus is féidir leat é a bhogadh le do mhéar — ní fhanann ach barra na mbeart socair; méadaítear do bhosca féin freisin, agus filleann an t-amharc air nuair is é do shealsa é. Leanann an t-amharc an suíochán gníomhach go huathoibríoch agus téann sé siar le haghaidh forbhreathnaithe ag an showdown. Is féidir é seo a mhúchadh sna hArdroghanna. Ar do sheal, má tá na cártaí pobail lasmuigh den amharc, feictear cóip bheag díobh ag barr an bhoird; tapáil í chun dul go dtí na cártaí agus ar ais."],
          note: "Ar fhóin agus ar tháibléid, tá súmáil pinseála an bhrabhsálaí féin blocáilte de réir réamhshocraithe ionas nach dtarlóidh gotha súmála de thaisme i lár láimhe; athchumasaigh í in Ardroghanna → Comhéadan úsáideora más mian leat." },
        { id: "protections",
          t: "Anti-peek agus cosaint ar call de thaisme",
          b: [
            "Dhá chosaint roghnacha: coinníonn Anti-peek do chártaí féin folaithe go dtí go dtapálann tú iad (úsáideach nuair a d'fhéadfadh duine do scáileán a fheiceáil), agus blocálann an chosaint ar call de thaisme an cnaipe Call ar feadh nóiméid díreach tar éis raise mhóir, ionas nach dtitfidh tapáil a bhí beartaithe do call níos lú ar an méid ardaithe de thaisme. Tá an dá cheann sna hArdroghanna."] }
      ]
    },
    {
      id: "info", icon: "📊", title: "An painéal eolais",
      sections: [
        { id: "open",
          t: "An painéal a oscailt",
          b: [
            "Le linn cluiche, osclaíonn an painéal eolais ón gceanntásc (nó Alt+L / Alt+I) agus tá trí chluaisín ann: Loga, Seans agus Staitisticí. Ar fhóin bíonn sé ar snámh os cionn an bhoird; ar scáileáin níos mó is fuinneog í is féidir a tharraingt agus a méid a athrú — beir ar an hanla ⣿ chun í a bhogadh, ar na himill chun a méid a athrú. Cuimhnítear ar a hionad."] },
        { id: "log",
          t: "Loga an chluiche",
          b: [
            "Taifeadann an cluaisín Loga an cluiche ar fad lámh ar lámh: blinds, gach beart lena mhéid, cártaí nochtaithe agus buaiteoirí, le dathanna chun é a léamh go tapa. Sábhálann cnaipe easpórtála an loga mar chomhad más mian leat an seisiún a athbhreithniú níos déanaí."] },
        { id: "odds",
          t: "Seans (monatóir dóchúlachtaí)",
          b: [
            "Taispeánann an cluaisín Seans, do do lámh reatha, an dóchúlacht bheo go gcríochnóidh tú le gach ceann de na 10 gcatagóir lámh — ó Chárta ard go Sruth ríoga — gach ceann lena dheilbhín, a chéatadán agus a bharra. Éiríonn an taispeáint liath nuair a dhéanann tú fold. Ní úsáideann sé ach do chártaí féin agus na cártaí pobail: ní fheiceann sé aon rud nár thaispeáin do chéilí comhraic."] },
        { id: "journal",
          t: "Logaí lámh agus an fhuinneog Logaí",
          b: [
            "Chomh maith leis an loga beo, taifeadtar gach lámh a imríonn tú go háitiúil i do bhrabhsálaí, san fhormáid chéanna le comhaid loga .pdb an chliaint oifigiúil. Liostaíonn an fhuinneog Logaí (Ardroghanna → Teachtaireachtaí loga → Bainistigh logaí…) do sheisiúin agus ligeann sí duit oibriú leo: réamhamharc ar sheisiún le cuardach agus aibhsiú, scagadh de réir cluiche, easpórtáil mar HTML nó mar ghnáth-théacs, an comhad .pdb amh a shábháil, nó .pdb a thaifead an cliant deisce a iompórtáil. Is féidir seisiúin a scriosadh ceann ar cheann nó iad uile le chéile (le deimhniú), agus is féidir le socrú coinneála uathoibríoch na 7, 30, 90, 180 nó 365 lá deireanacha amháin a choinneáil. Ní scriostar go huathoibríoch riamh logaí a d'iompórtáil tú féin. Teorannaíonn an dara socrú líon na seisiún a choinnítear, agus is féidir colún an liosta a leathnú trína tharraingt.",
            "Chun roinnt seisiún a scriosadh le chéile, iompaíonn an cnaipe Roghnaigh… an liosta ina bhoscaí ticeála: cuir tic leo siúd is mian leat fáil réidh leo agus bainfidh Scrios an baisc ar fad tar éis deimhniú amháin. Ar ríomhaire is féidir leat Ctrl (⌘) + cliceáil a dhéanamh freisin chun seisiúin a chur leis ceann ar cheann, nó Shift + cliceáil chun raon iomlán a thógáil.",
            "Déanann an cnaipe Anailísigh anailís lámh ar sheisiún agus is féidir leis loga a sheoladh chuig seirbhís anailíse pokerth.net. Fanann gach rud ar do ghléas mura ndéanann tú easpórtáil nó uaslódáil go sainráite."] },
        { id: "logopts",
          t: "Roghanna logála",
          b: [
            "In Ardroghanna → Teachtaireachtaí loga is féidir leat logáil a chumasú nó a dhíchumasú agus an t-eatramh scríofa a roghnú, leis na trí shocrú chéanna leis an gcliant deisce: tar éis gach birt, tar éis gach láimhe (réamhshocrú) nó tar éis gach cluiche. Scríobhann rogha eile an comhad .pdb chuig fillteán de do rogha féin agus nuashonraíonn sé é ag an eatramh sin, agus uair amháin eile nuair a fhágann tú an leathanach, ionas gur féidir le huirlis eile an cluiche a leanúint beo."],
          note: "Éilíonn scríobh chuig fillteán áitiúil an File System Access API: Chrome, Edge agus Opera deisce amháin. In áiteanna eile míníonn an rogha an fáth, agus fanann easpórtáil de láimh ón bhfuinneog Logaí ar fáil. Ní féidir leis an mbrabhsálaí ach an comhad a athsholáthar, ní cur leis riamh, mar sin caithfidh uirlis a léann an .pdb é a athoscailt tar éis gach athraithe." },
        { id: "assist",
          t: "Cúntóir (neart na láimhe)",
          b: [
            "Ag barr an chluaisín Seans, léann bratach an chúntóra do lámh duit. Roimh an flop ainmníonn sé do lámh tosaigh agus rátálann sé í le réaltaí; ón flop ar aghaidh taispeánann sé do theaglaim is fearr reatha agus, tar éis ionsamhlúcháin ghairid, an seans measta atá agat an lámh a bhuachan mar chéatadán, le méadar daite ó dhearg (lag) go glas (láidir). Cosúil leis an monatóir dóchúlachtaí, ní úsáideann sé ach an t-eolas atá le feiceáil agatsa.",
            "Tá dhá stíl taispeána ar fáil in Ardroghanna → Suíocháin: Deighleáin (deich mbloc) nó barra dul chun cinn clasaiceach. Is féidir gné iomlán an chúntóra a mhúchadh in Ardroghanna → Cúntóir."] },
        { id: "assistwin",
          t: "An cúntóir mar ghiuirléid ar snámh",
          b: [
            "Is féidir bloc an chúntóra a scaradh ón bpainéal isteach ina fhuinneog bheag féin a bhíonn i gcónaí ar barr: úsáid an cnaipe scartha ar an mbloc, ansin bog é agus athraigh a mhéid áit ar bith os cionn an bhoird — úsáideach chun súil a choinneáil ar neart do láimhe gan an painéal iomlán a oscailt. Filleann an cnaipe duga é ar an gcluaisín Seans, agus cuimhnítear ar a ionad. Laistigh den phainéal, ligeann hanla tarraingthe idir an Cúntóir agus na dóchúlachtaí duit an spás a roinnt eatarthu."] },
        { id: "stats",
          t: "Staitisticí",
          b: [
            "Rianaíonn an cluaisín Staitisticí do sheisiún: lámha imeartha, flops feicthe, showdowns, rátaí buaite agus tuilleadh. Is féidir rianú staitisticí a mhúchadh sna hArdroghanna."] },
        { id: "hud",
          t: "HUD staitisticí ar na suíocháin",
          b: [
            "Greamaíonn an HUD bosca beag staitisticí in aice le suíochán gach imreora, tógtha ó na lámha a taifeadadh i do logaí: líon na lámh a breathnaíodh, ansin VPIP (cé chomh minic a chuireann sé airgead isteach go deonach roimh an flop), PFR (raises roimh an flop) agus AF (fachtóir ionsaitheachta), le dathanna ó éighníomhach go hionsaitheach. Fúthu, déanann suaitheantas achoimre ar an imreoir i bhfocail shimplí — Daingean-Éighníomhach, Scaoilte-Ionsaitheach agus mar sin de — in aice le diail bheag a léann a ceathrú soilsithe ó dhaingean go scaoilte ó chlé go deas, agus ó éighníomhach go hionsaitheach ó bhun go barr. Taispeántar an suaitheantas ón gcéad lámh ach fanann sé múchta go dtí 25 lámh, agus ansin bíonn sé iontaofa. Tapáil an bosca le haghaidh fuinneoige mionsonraithe leis an tsraith iomlán figiúirí (3-bet, continuation bet, fold do 3-bet, iarrachtaí goid, rátaí showdown…), agus tarraing an bosca má chlúdaíonn sé rud éigin.",
            "Níl a fhios ag an HUD ach an méid a chonaic tú ag do bhoird féin — léann sé do logaí lámh áitiúla, mar sin caithfidh logáil a bheith ar siúl, agus bíonn ciall leis na figiúirí tar éis go leor lámh. Múchta de réir réamhshocraithe: cuir ar siúl é in Ardroghanna → Cúntóir."] },
        { id: "handsbtn",
          t: "Achoimre ar na lámha",
          b: [
            "Osclaíonn an deilbhín lámh pócair ar éadach an bhoird achoimre thapa ar na 10 lámh am ar bith — úsáideach agus tú ag foghlaim. Is féidir é a fholú sna hArdroghanna."] }
      ]
    },
    {
      id: "chat", icon: "💬", title: "Comhrá agus sóisialta",
      sections: [
        { id: "panels",
          t: "Comhrá an fhorhalla agus comhrá an chluiche",
          b: [
            "Tá comhrá san fhorhalla agus ceann eile ag an mbord. Ar fhóin bíonn comhrá an chluiche ar snámh os cionn an bhoird; ar scáileáin níos mó is fuinneog í is féidir a tharraingt agus a méid a athrú. Comhaireann suaitheantas ar an gcnaipe comhrá na teachtaireachtaí nár léadh."] },
        { id: "typing",
          t: "Cabhair clóscríofa",
          list: [
            "Críochnaíonn Tab leasainm — brúigh Tab arís chun dul trí na meaitseálacha.",
            "Brabhsálann ↑ / ↓ stair do theachtaireachtaí féin.",
            "Osclaíonn an cnaipe emoji roghnóir iomlán; molann clóscríobh : straoiseoga freisin agus tú ag clóscríobh."] },
        { id: "emotes",
          t: "Straoiseoga agus aoibhneoga",
          b: [
            "Tiontaíonn an comhrá cóid ghearra straoiseog díreach mar a dhéanann an cliant deisce oifigiúil: clóscríobh ainm idir dhá idirstad agus éiríonn sé ina emoji — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… tacaítear le breis is 1,900 cód (sraith iomlán GitHub). Tiontaítear aoibhneoga téacs clasaiceacha freisin: :-) ;) :D xD :P <3 agus timpeall ochtó eile.",
            "Osclaíonn clóscríobh : fuinneog mholtaí a chríochnaíonn an cód agus tú ag clóscríobh (↑/↓ chun roghnú, Tab nó Enter chun glacadh). Is féidir tiontú emoji a mhúchadh go hiomlán in Ardroghanna → Comhrá."] },
        { id: "commands",
          t: "Orduithe comhrá",
          b: [
            "Tuigeann an comhrá orduithe slaise. Tá dhá cheann le feiceáil ag daoine eile:"],
          keys: [
            ["/me <text>", "Teachtaireacht ghnímh, taispeánta mar “* doainm téacs”   ⟦/me <téacs>⟧"],
            ["/emoji <emoji>", "Seinneann frithghníomh emoji (an rud a sheolann roghnóir na bhfrithghníomhartha)   ⟦/emoji <emoji>⟧"]] },
        { id: "diagcmds",
          t: "Orduithe diagnóiseacha",
          b: [
            "Tá gach rud eile áitiúil: ní thaispeántar na freagraí ach duitse agus ní sheoltar dada chuig an mbord. Clóscríobh /help chun iad uile a liostú. Na cinn is úsáidí:"],
          keys: [
            ["/help", "Liostaigh gach ordú   ⟦/help⟧"],
            ["/update", "Seiceáil an bhfuil leagan nua ann agus athnuaigh   ⟦/update⟧"],
            ["/lang <code>", "Athraigh an teanga (m.sh. /lang fr)   ⟦/lang <code>⟧"],
            ["/sound on|off", "Cuir fuaimeanna an chluiche ar siúl/as   ⟦/sound on|off⟧"],
            ["/zoom", "Cuir formhéadaitheoir an bhoird ar siúl/as   ⟦/zoom⟧"],
            ["/clear", "Glan an comhrá go háitiúil   ⟦/clear⟧"],
            ["/table", "Eolas faoin gcluiche reatha (blinds, imreoirí, cruacha)   ⟦/table⟧"],
            ["/diag · /netdbg · /fps", "Diagnóisic ar staid an chliaint, an líonra agus an ráta fráma   ⟦/diag · /netdbg · /fps⟧"],
            ["/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg", "Ard-dífhabhtú (cártaí, prótacal, fuaim, stóráil, suíocháin)   ⟦/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg⟧"],
            ["/copy", "Cóipeáil freagra an ordaithe dheireanaigh chuig an ngearrthaisce   ⟦/copy⟧"]] },
        { id: "privatemsg",
          t: "Teachtaireachtaí príobháideacha",
          b: [
            "Scríobh chuig imreoir amháin gan an forhalla ar fad á léamh. Osclaíonn an clúdach in aice le hainm i liosta na n-imreoirí comhrá leis an duine sin; athosclaíonn an clúdach i gceanntásc an fhorhalla an ceann deireanach. Coinnítear comhráite ar an ngléas seo agus bíonn siad fós ann nuair a thagann tú ar ais, mar sin iompraíonn comhrá a leantar laethanta ina dhiaidh sin a stair — taispeánann an uimhir dhearg ar an gclúdach an méid nár léigh tú fós, agus scriosann an bosca bruscair i dteideal na fuinneoige comhrá go buan."],
          keys: [
            ["/msg <nickname> <text>", "Seol teachtaireacht phríobháideach ó chomhrá an fhorhalla   ⟦/msg <leasainm> <téacs>⟧"],
            ["/msg \"<nickname with spaces>\" <text>", "An rud céanna, nuair atá spásanna sa leasainm   ⟦/msg \"<leasainm le spásanna>\" <téacs>⟧"]],
          note: "Tá teorainn 128 carachtar le teachtaireachtaí. Ní sheachadann an freastalaí teachtaireacht phríobháideach chuig imreoir atá ina shuí ag bord ina bhfuil cluiche ar siúl, agus ní choinnítear an stair ach sa bhrabhsálaí seo — ní leanann sí thú chuig gléas eile." },
        { id: "reactions",
          t: "Frithghníomhartha emoji",
          b: [
            "Osclaíonn an cnaipe frithghnímh roghnóir de 30 frithghníomh beoite (🎉, 😂, 😱, 🔥…) a sheinntear le héifeacht os cionn do shuíocháin, le feiceáil ag gach duine ag an mbord — imreoirí ar an gcliant deisce san áireamh. Is féidir frithghníomhartha a mhúchadh go hiomlán sna hArdroghanna."] },
        { id: "translate",
          t: "Gach duine a thuiscint",
          b: [
            "Nuair atá aistriúchán comhrá ar siúl, feictear cnaipe aistriúcháin ar an líne faoi do phointeoir — nó, ar scáileán tadhaill, ar an líne a thapáil tú — agus taispeánann sé an teachtaireacht sin i do theanga le haistritheoir ionsuite an bhrabhsálaí. Is féidir é a thaispeáint go buan ar gach líne in Ardroghanna → Comhrá, áit a bhfuil leid uirlise freisin a mhíníonn giorrúcháin choitianta an bhoird (gg, nh, utg…)."],
          note: "Úsáideann an t-aistriúchán seirbhís Google Translate agus oibríonn sé i ngach brabhsálaí — níl ach ceangal idirlín ag teastáil. Ní sheoltar teachtaireacht chuig an tseirbhís aistriúcháin ach nuair a thapálann tú a cnaipe aistriúcháin, riamh go huathoibríoch." },
        { id: "social",
          t: "Imreoirí: próifíl, cuireadh, neamhaird",
          b: [
            "Tapáil imreoir ar bith — ag an mbord nó i liosta an fhorhalla — chun a chárta a oscailt: próifíl agus staitisticí, tabhair cuireadh dó chuig do chluiche, nó déan neamhaird de (folaítear a theachtaireachtaí comhrá; is féidir deireadh a chur leis an neamhaird am ar bith). Is féidir deimhniú a chumasú sna roghanna sula dtugtar cuireadh nó sula ndéantar neamhaird."] }
      ]
    },
    {
      id: "lobby", icon: "🏛️", title: "Forhalla agus cluichí",
      sections: [
        { id: "list",
          t: "Liosta na gcluichí",
          b: [
            "Liostaíonn an forhalla gach bord ar an bhfreastalaí. Taispeánann gach iontráil líon na n-imreoirí, an cineál cluiche, glas nuair a bhíonn pasfhocal nó cuireadh ag teastáil, agus suaitheantas stádais: “Ag fanacht” (glas — níor thosaigh an cluiche, is féidir leat páirt a ghlacadh má tá suíochán saor), “Ar siúl” (dath te — is féidir féachaint air beo nuair a cheadaítear lucht féachana) agus “Dúnta” (múchta). Taispeánann bord lán an comhaireamh iomlán, m.sh. 10/10; leanann dathanna na suaitheantas an téama gníomhach.",
            "Caolaíonn an roghchlár scagaire an liosta díreach mar a dhéanann an cliant deisce, gach rogha níos déine ná an ceann roimhe: cluichí oscailte amháin → folaigh boird lána freisin → ansin cluichí neamhphríobháideacha amháin, príobháideacha amháin nó rangaithe amháin. Cuimhnítear ar do rogha. Aimsíonn an réimse cuardaigh cluiche de réir ainm, agus osclaíonn suaitheantas na n-imreoirí liosta de gach duine atá ar líne, inchuardaithe agus inshórtáilte."] },
        { id: "join",
          t: "Páirt a ghlacadh agus féachaint",
          b: [
            "Roghnaigh cluiche oscailte agus glac páirt ann — ciallaíonn glas go bhfuil pasfhocal ag teastáil. Is féidir féachaint beo ar chluichí atá ar siúl a cheadaíonn lucht féachana: feiceann tú an bord agus an comhrá, ach fanann na cártaí póca folaithe agus ní féidir leat beart a dhéanamh."] },
        { id: "gameinfo",
          t: "Eolas faoin gcluiche",
          b: [
            "Sula nglacann tú páirt, taispeánann cárta eolais an chluiche gach rud a shainíonn an bord: an cineál cluiche, na blinds agus conas a ardaítear iad (dúbailt nó liosta láimhe), an t-airgead tosaigh, teorainn ama an bhirt, an mhoill idir lámha agus cé atá ina shuí cheana."] },
        { id: "create",
          t: "Cluiche a chruthú",
          b: [
            "Cruthaigh do bhord féin: ainm, líon imreoirí, airgead tosaigh, an chéad blind beag agus sceideal na n-arduithe, teorainn ama an bhirt agus an gceadaítear lucht féachana. Tá ceithre chineál cluiche ann: Gnáth (aon duine), imreoirí cláraithe amháin, le cuireadh amháin agus Ranking (comhairtear sa rangú oifigiúil é — níl pasfhocal ceadaithe ansin). Is féidir do shocruithe is fearr leat a shábháil agus a athlódáil."] },
        { id: "invites",
          t: "Cuirí",
          b: [
            "Is féidir le himreoirí cuireadh a thabhairt duit chuig a mbord; faigheann tú fógra ar féidir leat glacadh leis nó é a dhiúltú. Is é cuireadh a fháil an t-aon bhealach isteach i gcluiche le cuireadh amháin."] }
      ]
    },
    {
      id: "pthnet", icon: "🌐", title: "pokerth.net",
      sections: [
        { id: "account",
          t: "Do chuntas",
          b: [
            "Is é pokerth.net an freastalaí idirlín oifigiúil. Chun imirt ansin tá cuntas pokerth.net saor in aisce ag teastáil — cláraigh ar an suíomh, ansin logáil isteach anseo leis an leasainm agus an pasfhocal céanna. Ceanglaíonn an cliant gréasáin seo leis an bhfreastalaí céanna leis an gcliant deisce: na cuntais chéanna, na boird chéanna, an rangú céanna, agus is féidir leat suí ag an mbord céanna le himreoirí deisce."] },
        { id: "ranked",
          t: "Cluichí rangaithe agus séasúir",
          b: [
            "Comhairtear cluichí den chineál Ranking sa rangú séasúrach oifigiúil. Taispeánann do phróifíl san aip cathain a chláraigh tú, d'Áit, do Scór, do mheán agus na cluichí a d'imir tú sa séasúr reatha, móide do thorthaí is déanaí. Is chun spraoi amháin na gnáthchluichí (gan rangú) agus ní athraíonn siad dada."] },
        { id: "rankhow",
          t: "Conas a ríomhtar an rangú",
          b: [
            "I ngach cluiche rangaithe, tugann an áit a gcríochnaíonn tú pointí: 15 don chéad áit, ansin 9, 6, 4, 3, 2 agus 1 go dtí an seachtú háit; ní fhaigheann an t-ochtú go dtí an deichiú háit dada. Mar sin roinneann bord amháin 40 pointe san iomlán.",
            "Ní hé suim na bpointí sin do Scór ach do mheán in aghaidh an chluiche, maolaithe ag fachtóir a mhéadaíonn le líon na gcluichí a imríodh: ní leor cúpla toradh maith chun socrú ag an mbarr, tá rialtacht ag teastáil freisin — dá mhéad a imríonn tú, is ea is gaire a thagann do Scór do d'fhíormheán. Maireann séasúir ráithe: ag an athrú, cuirtear gach rud i gcartlann agus tosaíonn na comhairimh ó nialas, agus fanann séasúir roimhe ar fáil. Sa chluiche, taispeánann an cnaipe póidiam rangú séasúrach na n-imreoirí ag do bhord."],
          note: "Socraíonn freastalaí rangaithe pokerth.net scála na bpointí agus an fhoirmle chruinn agus d'fhéadfaidís athrú; is iad leathanaigh an tsuímh an tagairt." },
        { id: "rankings",
          t: "Leathanaigh an rangaithe",
          b: [
            "Osclaíonn mír an rangaithe rangú oifigiúil PokerTH, inchuardaithe de réir imreora, in éineacht le rangú na bpobal (BBC, WEC). Mura bhfuil suim agat sna rangú, is féidir an mhír a fholú in Ardroghanna → Pobal."] },
        { id: "cups",
          t: "Cupáin phobail: BBC agus WeCup",
          b: [
            "Reáchtálann dhá phobal a gcomórtais féin ar pokerth.net, gach ceann lena shuíomh agus lena rangú féin. Comórtas céimnithe is ea Best Brainies Cup (BBC) a thosaigh in 2013: téann tú ar aghaidh ó Step 1 go Step 4, agus tosaíonn séasúr nua tar éis gach cluiche Step 4, nuair a bhronntar an cupán. Tá a scála féin ag WeCup (WEC), i bhfad níos leithne — 75 pointe don chéad áit, ansin 45, 30, 20… — agus normalaíonn a scór do mheán de réir líon na gcluichí a d'imir tú i gcomparáid le baill eile.",
            "Osclaítear an dá rangú ón gcnaipe trófaí, in aice le rangú PokerTH. Tagann socruithe boird na gcomórtas seo mar réamhshocruithe nuair a chruthaíonn tú cluiche (BBC Step 1 go 4, WEC, WEC Monthly Final agus WEC Grand Final), ionas gur féidir leat cleachtadh faoi na coinníollacha céanna. Chun páirt a ghlacadh, caithfear clárú ar shuíomh an chupáin atá i gceist."],
          note: "Is féidir an t-ábhar seo ar fad a fholú d'aon iarraidh in Ardroghanna → Pobal mura bhfuil suim agat sna cupáin." },
        { id: "forumcups",
          t: "Cupáin agus imeachtaí an fhóraim",
          b: [
            "Óstálann fóram pokerth.net an Monthly Cup freisin — sraith mhíosúil ina ndáiltear imreoirí ar bhoird Gold, Silver agus Bronze sula socraítear curadh na míosa — móide cupáin speisialta aon uaire i rith na bliana.",
            "Foilsítear clárúcháin, sceidil, socruithe boird agus torthaí ar an bhfóram, agus imrítear na cluichí ar an bhfreastalaí oifigiúil cosúil le haon chluiche eile. Is leor cuntas pokerth.net chun na torthaí a leanúint; glactar páirt i gcupán tríd an snáithe fóraim ábhartha."] },
        { id: "forumnews",
          t: "Nuacht an fhóraim san fhorhalla",
          b: [
            "Osclaíonn an cnaipe nuachtáin i gceanntásc an fhorhalla na postálacha is déanaí ó fhóram pokerth.net, iontráil amháin do gach ábhar, gach fóram ina dhath féin. Comhaireann suaitheantas ar an gcnaipe na postálacha nár léadh; marcáiltear postáil mar léite nuair a osclaítear í (i gcluaisín nua), agus glanann “Marcáil gach rud mar léite” gach rud le chéile.",
            "Breiseán gréasáin é seo: is féidir an cnaipe a fholú sna hArdroghanna (“Cnaipe fóraim i gceanntásc an fhorhalla”).",
            "Taispeánann an cluaisín “Imeachtaí” na cluichí BBC atá le teacht agus an chéad Monthly Cup eile le líon na n-imreoirí cláraithe, chomh maith le buaiteoirí is déanaí BBC, WEC agus an Monthly Cup. Tá na hamanna i d'am áitiúil, agus osclaíonn tapáil suíomh an phobail. Folaíonn an rogha “Taispeáin ábhar an phobail (BBC / WEC)” an cluaisín seo."] },
        { id: "avatars",
          t: "Abhatáir agus bratacha",
          b: [
            "Ar pokerth.net dáiltear d'abhatár ar imreoirí eile trí fhreastalaí na n-abhatár, agus is féidir bratach bheag tíre a thaispeáint ar bhoscaí na n-imreoirí. Tá an dá cheann roghnach agus socraítear iad sna roghanna."] }
      ]
    },
    {
      id: "offline", icon: "🏋️", title: "Mód cleachtaidh",
      sections: [
        { id: "what",
          t: "Cad é",
          b: [
            "Is cluiche iomlán é an mód Áitiúil / cleachtadh in aghaidh céilí comhraic ríomhaire: gan cheangal, gan chuntas, gan dada i gceist. Nuair atá an aip suiteáilte (nó fiú tar éis cuairt amháin), oibríonn sé go hiomlán as líne — foirfe chun an cluiche a fhoghlaim, an comhéadan a thriail nó am a chaitheamh i mód eitleáin."] },
        { id: "setup",
          t: "Cluiche a shocrú",
          b: [
            "Roghnaigh líon na gcéilí comhraic, an t-airgead tosaigh, na blinds agus sceideal na n-arduithe, agus luas an chluiche. Is féidir comhdhéanamh agus deacracht na róbónna a choigeartú in Ardroghanna → Cluiche áitiúil — ó chéilí comhraic séimhe go bord measctha níos crua."] },
        { id: "trophies",
          t: "Trófaithe",
          b: [
            "Tá a dhul chun cinn féin ag an mód cleachtaidh: díghlasáiltear 28 trófaí i sé chatagóir (dul chun cinn, scil, stíl, formáidí, spraoi agus ceann rúnda) de réir mar a imríonn tú — lámha imeartha, cluichí buaite, blufanna móra, lámha speisialta agus tuilleadh. Carnann do dhul chun cinn trófaithe agus cumasctar é idir gléasanna nuair atá sioncronú socruithe an chuntais gníomhach."] },
        { id: "learn",
          t: "Áit mhaith le foghlaim",
          b: [
            "Oibríonn gach rud ó na caibidlí eile anseo freisin: an monatóir dóchúlachtaí, taispeáint an chúntóra, réamhroghnú, aicearraí méarchláir. Is é an mód cleachtaidh an áit is fearr chun iad a thriail gan brú sula dtéann tú ar pokerth.net."] }
      ]
    },
    {
      id: "style", icon: "🎨", title: "Stíl agus fuaim",
      sections: [
        { id: "themes",
          t: "Téamaí",
          b: [
            "Athraíonn an chatagóir Stíl sna hArdroghanna cuma an chliaint ar fad. Socraíonn réamhshocruithe gach rud le tapáil amháin (casino glas clasaiceach, cuma oifigiúil PokerTH…); fúthu ligeann aiseanna ar leith duit an pailéad datha, éadach an bhoird agus aghaidheanna na gcártaí a mhionchoigeartú ar leith — athraigh ais ar bith agus éiríonn do mheascán ina théama saincheaptha. Roghnaítear an mód dorcha, geal nó uathoibríoch sa Chomhéadan úsáideora, agus cuirtear do roghanna i bhfeidhm láithreach, ar gach scáileán, agus cuimhnítear orthu."] },
        { id: "tablelook",
          t: "Boird, pacaí, suíocháin",
          b: [
            "Seachas an téama, is féidir roinnt eilimintí a athrú go neamhspleách: cúlra an bhoird, paca na gcártaí, cúl an chárta (meaitseáil leis an bpaca go huathoibríoch nó iompórtáil d'íomhá féin), diosca an déileálaí agus na blinds, stíl chnaipí na mbeart agus pacaí suíochán iomlána a athraíonn cuma bhoscaí na n-imreoirí. Roghnaigh gach rud in Ardroghanna → Stíl; bíonn na hathruithe le feiceáil ag an mbord láithreach."] },
        { id: "music",
          t: "Seinnteoir ceoil",
          b: [
            "Osclaíonn an mhír cheoil i roghchláir an cheanntásc seinnteoir beag ceoil lounge: roghnaigh rian ón seinnliosta, seinn/sos, roimhe/ina dhiaidh, suaith, agus athdhéan rian amháin, an seinnliosta ar fad nó dada. Cuimhnítear ar an airde, ar an rian roghnaithe agus ar an mód athdhéanta. Ní thosaíonn an seinm leis féin riamh — éilíonn brabhsálaithe tapáil — agus tá an seinnteoir go hiomlán neamhspleách ar éifeachtaí fuaime an chluiche.",
            "Insíonn an dá ordóg faoi ainm an riain an maith leat a bhfuil á sheinm. Vóta gan ainm amháin in aghaidh an ghléis, raidiónna san áireamh, agus is féidir leat é a athrú nó a tharraingt siar am ar bith; mura nochtann an t-oibreoir na hiomláin, ní fheiceann tú ach d'ordóg féin.",
            "Ar iPhone agus iPad úsáideann an seinnteoir seinm shimplí de réir réamhshocraithe, ionas go leanann an ceol ar aghaidh le CarPlay, Bluetooth nó scáileán faoi ghlas; coigeartaítear an airde ansin le cnaipí an ghléis nó an chairr. Tugann an rogha “Airde san aip” sleamhnán na hairde, an chothromaíocht agus an méadar VU ar ais, ach d'fhéadfadh an fhuaim stad sa charr."] },
        { id: "sounds",
          t: "Éifeachtaí fuaime",
          b: [
            "Tá fuaimeanna an chluiche grúpáilte i gceithre chatagóir is féidir a chur ar siúl/as ar leith, díreach mar sa chliant deisce: bearta an chluiche (cártaí á ndéileáil, Check, Call, Raise, do shealsa…), fógra chomhrá an fhorhalla, fógraí cluiche líonra (imreoir tagtha isteach, cluiche réidh) agus fógra ardú na blinds. Rialaíonn sleamhnán airde amháin iad uile, in Ardroghanna → Fuaim."],
          note: "Diúltaíonn gach brabhsálaí — iOS go háirithe — fuaim a sheinm go dtí go dtapálann tú an leathanach uair amháin. Má thosaíonn an cluiche ciúin, dúisíonn tapáil amháin áit ar bith an fhuaim; athbhunaíonn an cliant inneall na fuaime go huathoibríoch freisin nuair a chuireann iOS ar fionraí é (glao isteach, aistriú chuig an gcúlra…)." },
        { id: "voice",
          t: "Fógraí gutha agus creathadh",
          b: [
            "Is féidir le dhá chainéal bhreise eolas a thabhairt duit gan féachaint ar an scáileán: léann fógraí gutha imeachtaí an chluiche le sintéis urlabhra do ghléis, agus ar fhóin is féidir le creathadh gairid do shealsa a chur in iúl. Is breiseáin ghréasáin an dá cheann, ar siúl nó múchta de réir réamhshocraithe ag brath ar an ngléas, in Ardroghanna → Geallta agus seal."],
          note: "Oibríonn creathadh ar Android (brabhsálaithe Chromium); ní sholáthraíonn Apple API creathaidh do shuíomhanna gréasáin, mar sin ní féidir le iPhone creathadh. Oibríonn fógraí gutha i ngach áit, ach braitheann na guthanna agus na teangacha atá ar fáil ar do chóras — úsáideann an cliant an meaitseáil is fearr a aimsíonn sé." }
      ]
    },
    {
      id: "options", icon: "⚙️", title: "Roghanna agus aicearraí",
      sections: [
        { id: "where",
          t: "Cá bhfuil na roghanna",
          b: [
            "Osclaítear na hArdroghanna ó mhír an ghiar in aon roghchlár ceanntásc. Tá siad grúpáilte mar a bhíonn sa chliant deisce: Comhéadan úsáideora, Stíl, Fuaim, Cluiche áitiúil, Cluiche líonra, Cluiche idirlín, Leasainmneacha / Abhatáir, Teachtaireachtaí loga agus Cúltaca agus athshocrú. Tá a lasc féin ag gach gné atá sainiúil don ghréasán ansin, mar sin is féidir leat aon rud nach n-úsáideann tú a mhúchadh."] },
        { id: "cfgxml",
          t: "Socruithe a mhalartú leis an gcliant deisce",
          b: [
            "Is féidir le do shocruithe bogadh idir cliaint: tairgeann an chatagóir Cúltaca agus athshocrú easpórtáil/iompórtáil an chomhaid oifigiúil config.xml (~/.pokerth/config.xml, a úsáideann na cliaint deisce agus QML). Scríobhann an easpórtáil na socruithe comhroinnte — ainm, roghanna taispeána, fuaimeanna, roghanna boird, blinds, stíleanna — agus cuireann an iompórtáil comhad an deisce i bhfeidhm anseo. Coinnítear socruithe nach n-aithníonn an cliant seo gan athrú sa chomhad.",
            "Taistealaíonn do nótaí faoi imreoirí leis an gcomhad freisin — an téacs agus an rátáil réaltaí, scríofa mar a léann na cliaint deisce iad. Fanann na lipéid datha sa chliant seo: níl réimse dóibh san fhormáid oifigiúil, mar sin ní bhaineann an iompórtáil le do chinn féin riamh."] },
        { id: "sync",
          t: "Socruithe a leanann thú",
          b: [
            "Nuair a imríonn tú le cuntas, sioncronaítear do roghanna, do théama, do shannadh eochracha, do theanga agus do thrófaithe cleachtaidh: athraigh rud éigin ar ghléas amháin agus tógfaidh an chéad ghléas eile a logálann tú isteach air é. Cumasctar dul chun cinn na dtrófaithe, ní fhorscríobhtar riamh é, mar sin coinníonn imirt ar dhá ghléas an chuid is fearr den dá cheann i gcónaí."] },
        { id: "updates",
          t: "Fanacht cothrom le dáta",
          b: [
            "Nuashonraíonn an cliant é féin: nuair a imscartar leagan nua, tugann bratach cuireadh duit athnuachan (nó clóscríobh /update sa chomhrá chun seiceáil de láimh). Uaireanta d'fhéadfadh suirbhé beag táirge a bheith le feiceáil ag iarraidh do thuairime faoi ghné — tá páirt a ghlacadh roghnach, agus is féidir suirbhéanna a mhúchadh go hiomlán in Ardroghanna → Pobal."] },
        { id: "fkeys",
          t: "Aicearraí méarchláir oifigiúla",
          b: [
            "Oibríonn eochracha feidhme oifigiúla PokerTH le linn cluiche — oibríonn Alt+S i ngach áit:"],
          keys: [
            ["F1 / F2 / F3 / F4", "Fold · Check/Call · Bet/Raise · All-In (is féidir an t-ord a aisiompú sna roghanna)   ⟦F1 / F2 / F3 / F4⟧"],
            ["F5", "Taispeáin do chártaí (nuair is féidir)   ⟦F5⟧"],
            ["F6 / F7 / F8", "De láimh · Check/Fold uathoibríoch · Check/Call uathoibríoch   ⟦F6 / F7 / F8⟧"],
            ["Alt+M / Alt+K / Alt+F", "De láimh · Check/Call uathoibríoch · Check/Fold uathoibríoch   ⟦Alt+M / Alt+K / Alt+F⟧"],
            ["Alt+C / Alt+L / Alt+I", "Comhrá · Loga an chluiche · Painéal na ndóchúlachtaí   ⟦Alt+C / Alt+L / Alt+I⟧"],
            ["Alt+S", "Socruithe — áit ar bith san aip, ní le linn cluiche amháin   ⟦Alt+S⟧"],
            ["F11", "Lánscáileán   ⟦F11⟧"]],
          note: "Tá méarchlár fisiceach ag teastáil do na haicearraí. Ar Mac is rialtáin mheán iad na heochracha F de réir réamhshocraithe: coinnigh Fn síos (nó cumasaigh “Úsáid F1, F2, srl. mar ghnátheochracha feidhme” i socruithe macOS). Ar iPhone cuireann iOS teorainn leis an lánscáileán — tugann suiteáil na haipe mar PWA an taithí lánscáileáin chéanna." },
        { id: "webkeys",
          t: "Eochracha litreacha gréasáin",
          b: [
            "Mar bhreiseán gréasáin, spreagann eochracha aonlitreacha agus Alt+T bearta freisin, agus is féidir gach ceann acu a athshannadh in Ardroghanna → Aicearraí méarchláir:"],
          keys: [
            ["F", "Fold   ⟦F⟧"],
            ["C", "Check / Call   ⟦C⟧"],
            ["R", "Raise   ⟦R⟧"],
            ["A", "All-In   ⟦A⟧"],
            ["1 / 2 / 3", "Geall 1/3 · 1/2 · Pota   ⟦1 / 2 / 3⟧"],
            ["Alt+T", "Painéal na staitisticí   ⟦Alt+T⟧"],
            ["Esc", "Dún an fhuinneog is airde (cnaipe Siar Android freisin)   ⟦Esc⟧"],
            ["↑ ↓ · ↵", "Liosta boird an fhorhalla (sroich le Tab): roghnaigh bord · glac páirt ann   ⟦↑ ↓ · ↵⟧"]],
          note: "Ar Android, dúnann cnaipe/gotha Siar an chórais fuinneoga mar a dhéanann Escape in áit an cluiche a fhágáil (is féidir é a choigeartú sna roghanna). Níl cnaipe córais comhionann ag iOS — úsáid ✕ gach fuinneoige." }
      ]
    }
  ]
};
