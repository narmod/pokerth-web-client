// ── help/content/sw.mjs — Swahili help corpus ───────────────────────────────
//
// Structure: chapters[] → { id, icon, title, sections[] }.
// Section: { id, t (title), b (paragraphs[]), list (bullets[]), keys ([kbd,
// label][]) }. Plain text only — the renderer escapes everything.
// Translated from en.mjs. Poker action terms (Fold, Check, Call, Bet, Raise,
// All-In) stay in English, as everywhere else.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Kuanza',
      sections: [
        { id: 'modes', t: 'Njia tatu za kucheza',
          b: ['Kutoka skrini ya kuingia, chagua jinsi unavyotaka kucheza.'],
          list: [
            'Intaneti — cheza mtandaoni kwenye seva rasmi ya pokerth.net, na viwango. Akaunti ya pokerth.net inahitajika; jisajili bure kwenye pokerth.net.',
            'Ndani / mazoezi — cheza nje ya mtandao dhidi ya boti. Hakuna usanidi, hufanya kazi bila muunganisho, na hufungua vikombe kadri unavyoendelea.',
            'LAN / Seva maalum — unganisha na seva binafsi ya PokerTH kwenye mtandao wako wa ndani au kwenye mashine yako mwenyewe.'] },
        { id: 'lan', t: 'LAN / seva maalum',
          b: ['Hali ya tatu huunganisha na seva yoyote ya PokerTH unayoendesha wewe au rafiki \u2014 kwenye mtandao wa nyumbani, VPS binafsi, popote. Weka anwani na bandari ya seva, weka alama TLS ikiwa seva inatumia bandari iliyofichwa, na uingie kwa jina la utani (ufikiaji wa mgeni hufanya kazi seva ikiruhusu). Baada ya hapo kila kitu mezani hufanya kazi sawasawa na seva rasmi.'] },
        { id: 'famboard', t: 'Orodha ya familia',
          b: ['Kwenye seva binafsi na michezo ya LAN pekee, kiteja huweka takwimu za maisha kwa kila jina la utani \u2014 mikono na michezo iliyochezwa na kushindwa, ushindi mkubwa zaidi, mfululizo bora \u2014 na kuzishiriki kupitia seva ili kila kifaa mezani kione orodha moja. Michezo ya pokerth.net haifuatiliwi hivi kamwe, na takwimu za hali ya mazoezi huhifadhiwa tofauti kabisa.'] },
        { id: 'language', t: 'Lugha',
          b: ['Kiolesura kinapatikana kwa lugha 45. Kibadilishe wakati wowote kwenye chaguo za kina (menyu ya gia) chini ya Kiolesura cha mtumiaji. Maneno ya hatua za poker (Fold, Check, Call, Bet, Raise, All-In) hubaki kwa Kiingereza kwa desturi, sawasawa na kiteja cha kompyuta.'] },
        { id: 'pwa', t: 'Sakinisha kama programu',
          b: ['Kiteja hiki ni Progressive Web App: unaweza kukisakinisha kutoka menyu ya kivinjari (au kitufe cha kusakinisha kwenye kichwa) ili kupata programu ya skrini nzima yenye ikoni yake. Baada ya kusakinishwa hufunguka mara moja na hali ya mazoezi hufanya kazi kikamilifu nje ya mtandao.'],
          note: 'Kwenye Android na Chrome/Edge za kompyuta, kitufe cha kusakinisha hufanya yote. Kwenye iPhone/iPad, Apple huruhusu usakinishaji kupitia Safari pekee: kitufe cha Kushiriki \u2192 \u201cAdd to Home Screen\u201d \u2014 kiteja huonyesha hatua hizi inapohitajika. Kitufe hupotea programu ikishasakinishwa.' },
        { id: 'platforms', t: 'Mifumo na vivinjari',
          b: ['Kiteja huendesha kwenye kivinjari chochote cha kisasa kwenye mfumo wowote \u2014 Windows, macOS, Linux, Android, iOS. Vipengele vichache hutegemea API mpya za vivinjari; API ikikosekana, kipengele hujificha au kueleza sababu badala ya kuvunjika. Tofauti kuu za kujua:'],
          list: [
            'Chrome / Edge (kompyuta): kila kitu hufanya kazi, pamoja na kuandika kumbukumbu za .pdb kwenye folda.',
            'Firefox: kila kitu isipokuwa kuandika kumbukumbu za .pdb kwenye folda (API bado haipo).',
            'Safari / iOS: usakinishaji kupitia Kushiriki \u2192 Add to Home Screen; hakuna mtetemo; skrini nzima ni finyu kwenye iPhone; sauti huanza baada ya kugusa kwako kwa kwanza.',
            'Android: msaada kamili kwenye vivinjari vya Chromium, pamoja na mtetemo na tabia ya kitufe cha Kurudi.'] },
        { id: 'avatar', t: 'Jina la utani na avatari',
          b: ['Chagua jina lako la utani na avatari kwenye skrini ya kuingia kabla ya kuunganisha. Kwenye pokerth.net, jina lako la utani ni jina la akaunti yako; avatari hushirikiwa na wachezaji wengine kupitia seva ya avatari.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Sheria za poker',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em kwa ufupi',
          b: ['PokerTH hucheza No-Limit Texas Hold\u2019em. Kila mchezaji hupokea karata mbili binafsi (hole cards). Karata tano za pamoja hugawiwa wazi katikati ya meza. Mkono bora wa karata tano kutoka mchanganyiko wowote wa karata zako mbili na karata tano za pamoja hushinda poti.'] },
        { id: 'blinds', t: 'Blind na kitufe cha mgawaji',
          b: ['Kabla ya kila mkono, dau mbili za lazima huanzisha poti: small blind na big blind, zinazowekwa na wachezaji wawili kushoto mwa kitufe cha mgawaji. Kitufe huhamia kiti kimoja kufuata saa baada ya kila mkono, hivyo kila mtu hulipa blind kwa zamu. Blind hupanda kwa vipindi vya kawaida mchezo unavyoendelea.',
              'Mezani, vidonge huweka alama kitufe na blind: D (mgawaji), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Raundi nne za dau',
          list: [
            'Pre-flop — baada ya kugawiwa hole cards, raundi ya kwanza ya dau huanza kushoto mwa big blind.',
            'Flop — karata tatu za pamoja hufunuliwa, ikifuatiwa na raundi ya dau.',
            'Turn — karata ya nne ya pamoja, kisha raundi nyingine ya dau.',
            'River — karata ya tano na ya mwisho ya pamoja, kisha raundi ya mwisho ya dau.'],
          b: ['Raundi ya dau huisha wachezaji wote waliobaki kwenye mkono wakiwa wameweka kiasi sawa kwenye poti (au wako all-in).'] },
        { id: 'actions', t: 'Unachoweza kufanya zamu yako',
          list: [
            'Fold — achia mkono. Karata zako zinatupwa na hushindanii poti tena.',
            'Check — pita bila kuweka dau. Inawezekana tu kukiwa hakuna cha ku-call.',
            'Call — lingana na dau la sasa.',
            'Bet — fungua dau kukiwa hakuna aliyeweka dau kwenye street hii.',
            'Raise — ongeza dau lililopo. Raise ya chini kabisa ni sawa na bet au raise iliyotangulia.',
            'All-In — weka rundo lako lote. Unabaki kwenye mkono hadi kiasi ulichofikia.'] },
        { id: 'showdown', t: 'Showdown na poti zilizogawanywa',
          b: ['Ikiwa zaidi ya mchezaji mmoja amebaki baada ya raundi ya dau ya river, mikono hufunuliwa na bora zaidi hushinda \u2014 mchanganyiko ulioshinda huonyeshwa chini ya karata za pamoja. Mchezaji anapokuwa all-in kwa chini ya dau kamili, side pot huundwa: kila mchezaji anaweza kushinda tu sehemu ya poti aliyochangia. Mikono iliyolingana hugawana poti.',
            'Si kila mtu lazima aonyeshe: kuanzia mchezaji wa mwisho aliyeweka bet au raise, mkono hufunuliwa tu ukishinda ulioonyeshwa tayari. Mwenye haki ya kutupa anaweza kuficha karata zake na kupata kitufe cha Show kuzionyesha akipenda.'] },
        { id: 'hands', t: 'Viwango vya mikono',
          b: ['Kutoka dhaifu zaidi hadi imara zaidi:'],
          list: [
            '1. High Card — hakuna mchanganyiko; karata ya juu huamua.',
            '2. Pair — karata mbili za thamani moja.',
            '3. Two Pair — jozi mbili tofauti.',
            '4. Three of a Kind — karata tatu za thamani moja.',
            '5. Straight — karata tano zinazofuatana (Ace inaweza kuwa juu au chini).',
            '6. Flush — karata tano za aina moja.',
            '7. Full House — three of a kind pamoja na jozi.',
            '8. Four of a Kind — karata nne za thamani moja.',
            '9. Straight Flush — straight ya aina moja yote.',
            '10. Royal Flush — Kumi hadi Ace, aina moja yote. Mkono bora zaidi unaowezekana.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Skrini ya mchezo',
      sections: [
        { id: 'actionbar', t: 'Upau wa hatua',
          b: ['Zamu yako ikifika, upau wa hatua chini huwaka na vitufe hadi vinne: Fold (nyekundu), Check / Call (bluu), Bet / Raise (kijani \u2014 hatua kuu iliyoangaziwa) na All-In (nyekundu iliyokolea). Kitufe cha Check / Call huonyesha kiasi kamili cha ku-call; Bet / Raise huonyesha kiasi unachokaribia kuweka. Baada ya river, All-In inaweza kuwa kitufe cha Show cha kufunua karata zako.'] },
        { id: 'betctl', t: 'Kuchagua dau lako',
          b: ['Weka kiasi cha raise kwa sehemu ya nambari, kitelezi, au vitufe vya haraka 1/3 \u00b7 1/2 \u00b7 Pot (sehemu za poti ya sasa). Kiasi hukamilishwa kiotomatiki na hubaki kati ya raise ya chini na ya juu halali. Ukipendelea kufikiria kwa big blind, kuna chaguo la kuonyesha kiasi vyote kwa BB badala ya vipande.'] },
        { id: 'preselect', t: 'Kuchagua hatua mapema',
          b: ['Kabla ya zamu yako, unaweza kuandaa hatua mapema: gusa kitufe na kitapata fremu ya dhahabu na doti ndogo ya dhahabu. Zamu yako ikifika, hatua huchezwa mara moja. Fold iliyoandaliwa hubadilika kiotomatiki kuwa Check ikiwa check ni bure \u2014 hutawahi ku-fold bila sababu. Uchaguzi wa mapema huwekwa upya kila mkono mpya, mabadiliko ya street na showdown, na hufutwa hali ikibadilika (kwa mfano kiasi cha call kikibadilika).'] },
        { id: 'automodes', t: 'Hali za kiotomatiki',
          b: ['Menyu kando ya vitufe vya hatua hutoa hali tatu za kucheza: Mwenyewe, Auto Check/Call na Auto Check/Fold. Hali za kiotomatiki hucheza kwa niaba yako hadi urudi \u2014 kubofya hatua yoyote mwenyewe hurudisha mara moja kwa Mwenyewe.'] },
        { id: 'readtable', t: 'Kusoma meza',
          b: ['Kila kisanduku cha mchezaji huonyesha avatari, jina, rundo na dau la sasa. Vidonge vya D / SB / BB huweka alama mgawaji na blind. Beji ya rangi kwenye kisanduku huonyesha hatua ya mwisho ya mchezaji; upau mwembamba wa bluu huhesabu muda wake wa kufikiria. Kisanduku cha mchezaji mwenye zamu huwaka; chako mwenyewe hupata fremu ya dhahabu inayomulika zamu yako.',
              'Upau wa hali juu ya meza huonyesha poti jumla, dau za street ya sasa, awamu (Pre-flop, Flop, Turn, River) na nambari za mchezo na mkono. Wachezaji walio-fold wana karata za kupenyeza mwanga; walioondolewa wamefifishwa. Mwishoni mwa mkono, dirisha la mshindi linaweza kutoa muhtasari wa nani ameshinda nini \u2014 linaweza kuzimwa kwenye chaguo.'] },
        { id: 'seatlayout', t: 'Mpangilio wa viti',
          b: ['Kama nyongeza ya wavuti, mpangilio wa visanduku vya wachezaji unachaguliwa kwenye chaguo za kina \u2192 Viti: Otomatiki hufuata kiteja rasmi (nafasi maalum wima, duaradufu iliyohesabiwa mlalo), au lazimisha mpangilio wa Wima au Mlalo \u2014 na Maalum hukuruhusu kuweka kila kiti mwenyewe: hali ya kuhariri huonekana ambapo unaburuta kila kisanduku mahali unapotaka hasa, na mpangilio huhifadhiwa.'] },
        { id: 'zoom', t: 'Kukuza meza (simu)',
          b: ['Kwenye skrini ndogo, vitufe vya kikuza hukuza meza (2\u00d7) na unaweza kusogeza kwa kidole \u2014 kisanduku chako mwenyewe na upau wa hatua hubaki mahali. Mwonekano hufuata kiti kinachocheza kiotomatiki na hupunguza kukuza kwenye showdown kwa muhtasari. Inaweza kuzimwa kwenye chaguo za kina.'],
          note: 'Kwenye simu na kompyuta kibao, kukuza kwa kubana kwa kivinjari kumezuiwa kwa chaguo-msingi ili ishara ya kukuza isitokee kwa bahati mbaya katikati ya mkono; iwashe tena kwenye chaguo za kina \u2192 Kiolesura cha mtumiaji ukipenda.' },
        { id: 'protections', t: 'Kinga ya kuchungulia na Call ya bahati mbaya',
          b: ['Kinga mbili za hiari: kinga ya kuchungulia huficha karata zako mwenyewe hadi uziguse (muhimu mtu akiona skrini yako), na kizuizi cha call ya bahati mbaya huzuia kitufe cha Call kwa muda mfupi mara tu baada ya raise kubwa, ili kugusa kulikokusudiwa call ndogo kusigonge kiasi kilichopandishwa kwa bahati mbaya. Zote zipo kwenye chaguo za kina.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Paneli ya taarifa',
      sections: [
        { id: 'open', t: 'Kufungua paneli',
          b: ['Wakati wa mchezo, paneli ya taarifa hufunguka kutoka kichwa (au Alt+L / Alt+I) na ina vichupo vitatu: Kumbukumbu, Nafasi na Takwimu. Kwenye simu huelea juu ya meza; kwenye skrini kubwa ni dirisha linaloburutwa na kubadilishwa ukubwa \u2014 shika mshiko wa \u28ff kusogeza, kingo kubadilisha ukubwa. Nafasi yake hukumbukwa.'] },
        { id: 'log', t: 'Kumbukumbu ya mchezo',
          b: ['Kichupo cha Kumbukumbu hurekodi mchezo mzima mkono kwa mkono: blind, kila hatua na kiasi, karata zilizofunuliwa na washindi, na msimbo wa rangi kwa usomaji wa haraka. Kitufe cha kuhamisha huhifadhi kumbukumbu kama faili ukipenda kupitia kipindi baadaye.'] },
        { id: 'odds', t: 'Nafasi (kifuatiliaji cha uwezekano)',
          b: ['Kichupo cha Nafasi huonyesha, kwa mkono wako wa sasa, uwezekano wa moja kwa moja wa kuishia kwenye kila moja ya aina 10 za mikono \u2014 kutoka High Card hadi Royal Flush \u2014 kila moja na ikoni, asilimia na upau. Onyesho huwa kijivu uki-fold. Hutumia tu karata zako mwenyewe na karata za pamoja: haioni kitu ambacho wapinzani hawaonyeshi.'] },
        { id: 'journal', t: 'Kumbukumbu za mikono na dirisha la Kumbukumbu',
          b: ['Mbali na kumbukumbu ya moja kwa moja, kila mkono unaocheza hurekodiwa ndani ya kivinjari chako, kwa muundo uleule wa faili la kumbukumbu la .pdb la kiteja rasmi. Dirisha la Kumbukumbu (chaguo za kina \u2192 Jumbe za kumbukumbu \u2192 Simamia kumbukumbu\u2026) huorodhesha vipindi vyako na kukuruhusu kuvifanyia kazi: hakiki kipindi na utafutaji na uangaziaji, chuja kwa mchezo, hamisha kama HTML au maandishi matupu, hifadhi faili la .pdb ghafi, au ingiza .pdb lililorekodiwa na kiteja cha kompyuta. Vipindi vinaweza kufutwa kimoja kimoja au vyote pamoja (na uthibitisho), na mpangilio wa uhifadhi wa kiotomatiki unaweza kubaki na siku 7, 30, 90, 180 au 365 za mwisho pekee. Kumbukumbu ulizoziingiza mwenyewe haziondolewi kamwe kiotomatiki. Mpangilio wa pili huweka kikomo cha idadi ya vipindi vinavyohifadhiwa, na safu ya orodha inaweza kuburutwa kuwa pana zaidi.',
              'Kitufe cha Changanua huendesha uchambuzi wa mikono kwenye kipindi na kinaweza kutuma kumbukumbu kwa huduma ya uchambuzi ya pokerth.net. Kila kitu hubaki kwenye kifaa chako isipokuwa uhamishe au upakie wewe mwenyewe.'] },
        { id: 'logopts', t: 'Chaguo za uwekaji kumbukumbu',
          b: ['Kwenye chaguo za kina \u2192 Jumbe za kumbukumbu unaweza kuwasha au kuzima uwekaji kumbukumbu na kuchagua kipindi cha kuandika, na mipangilio mitatu ileile ya kiteja cha kompyuta: baada ya kila hatua, baada ya kila mkono (chaguo-msingi) au baada ya kila mchezo. Chaguo lingine huandika faili la .pdb kwenye folda unayochagua na kulisasisha kwa kipindi hicho, na tena unapoondoka kwenye ukurasa, ili zana nyingine ziweze kufuata mchezo moja kwa moja.'],
          note: 'Kuandika kwenye folda ya ndani kunahitaji File System Access API: Chrome, Edge na Opera za kompyuta pekee. Kwingine chaguo hujieleza na uhamishaji wa mwenyewe kutoka dirisha la Kumbukumbu hubaki. Kivinjari kinaweza tu kubadilisha faili, kamwe kuongeza, hivyo zana inayosoma .pdb inapaswa kulifungua tena baada ya kila mabadiliko.' },
        { id: 'assist', t: 'Msaidizi (nguvu ya mkono)',
          b: ['Juu ya kichupo cha Nafasi, bango la msaidizi husoma mkono kwa niaba yako. Kabla ya flop hutaja mkono wako wa kuanzia na kuupima kwa nyota; kuanzia flop huonyesha mchanganyiko wako bora wa sasa na, baada ya uigaji wa haraka, nafasi yako inayokadiriwa ya kushinda mkono kwa asilimia, na kipimo cha rangi kutoka nyekundu (dhaifu) hadi kijani (imara). Kama kifuatiliaji cha uwezekano, hutumia tu taarifa unazoziona.',
              'Mitindo miwili ya maonyesho ipo kwenye chaguo za kina \u2192 Viti: Vipande (vitalu kumi) au upau wa maendeleo wa kawaida. Kipengele chote cha msaidizi kinaweza kuzimwa kwenye chaguo za kina \u2192 Msaidizi.'] },
        { id: 'assistwin', t: 'Msaidizi kama wijeti inayoelea',
          b: ['Kitalu cha msaidizi kinaweza kutenganishwa kutoka paneli kwenda dirisha lake dogo lililo juu daima: tumia kitufe cha kutenganisha kwenye kitalu, kisha kisogeze na kubadilisha ukubwa popote juu ya meza \u2014 rahisi kufuatilia nguvu ya mkono bila paneli nzima wazi. Kitufe cha kurudisha hukirudisha kwenye kichupo cha Nafasi, na nafasi yake hukumbukwa. Ndani ya paneli, mshiko wa kuburuta kati ya Msaidizi na uwezekano hukuruhusu kugawa nafasi kati ya viwili.'] },
        { id: 'stats', t: 'Takwimu',
          b: ['Kichupo cha Takwimu hufuatilia kipindi chako: mikono iliyochezwa, flop zilizoonwa, showdown, kiwango cha ushindi na zaidi. Ufuatiliaji wa takwimu unaweza kuzimwa kwenye chaguo za kina.'] },
        { id: 'hud', t: 'HUD ya takwimu kwenye viti (beta)',
          b: ['HUD huambatanisha kisanduku kidogo cha takwimu kando ya kiti cha kila mchezaji, kilichojengwa kutoka mikono uliyorekodi kwenye kumbukumbu zako: idadi ya mikono iliyoangaliwa, kisha VPIP (mara ngapi wanaweka pesa kwa hiari pre-flop), PFR (raise za pre-flop) na AF (kipimo cha ushambuliaji), na msimbo wa rangi kutoka mtulivu hadi mshambuliaji. Chini yake beji hufupisha mchezaji kwa maneno rahisi \u2014 Mkali-Mtulivu, Huru-Mshambuliaji na kadhalika \u2014 kando ya kipimo kidogo ambacho robo yake inayowaka husomwa kushoto-kwenda-kulia kwa mkali hadi huru, na chini-kwenda-juu kwa mtulivu hadi mshambuliaji. Beji huonekana kutoka mkono wa kwanza kabisa lakini hubaki imefifia hadi mikono 25, inapokuwa ya kuaminika. Gusa kisanduku kwa dirisha dogo la maelezo lenye seti kamili ya nambari (3-bet, continuation bet, fold to 3-bet, majaribio ya steal, kiwango cha showdown\u2026), na buruta kisanduku kukisogeza kikifunika kitu.',
              'HUD hujua tu ulichokiona kwenye meza zako mwenyewe \u2014 husoma kumbukumbu zako za ndani za mikono, hivyo uwekaji kumbukumbu lazima uwe umewashwa na nambari huwa na maana baada ya mikono ya kutosha. Ni kipengele cha beta, kimezimwa kwa chaguo-msingi: kiwashe kwenye chaguo za kina \u2192 Msaidizi.'] },
        { id: 'handsbtn', t: 'Muhtasari wa michanganyiko ya mikono',
          b: ['Ikoni ya mikono ya poker mezani hufungua muhtasari wa haraka wa michanganyiko 10 wakati wowote \u2014 rahisi wakati wa kujifunza. Inaweza kufichwa kwenye chaguo za kina.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chati na kijamii',
      sections: [
        { id: 'panels', t: 'Chati ya ukumbi na chati ya mchezo',
          b: ['Kuna chati kwenye ukumbi na moja mezani. Kwenye simu, chati ya mchezo huelea juu ya meza; kwenye skrini kubwa ni dirisha linaloburutwa na kubadilishwa ukubwa. Beji kwenye kitufe cha chati huhesabu jumbe ambazo hazijasomwa.'] },
        { id: 'typing', t: 'Misaada ya kuandika',
          list: [
            'Tab hukamilisha jina la utani \u2014 bonyeza Tab tena kuzunguka mafanano.',
            '\u2191 / \u2193 huvinjari historia ya jumbe zako mwenyewe.',
            'Kitufe cha emoji hufungua kichagua kamili; kuandika : pia hupendekeza emoti unapoandika.'] },
        { id: 'emotes', t: 'Emoti na tabasamu',
          b: ['Chati hubadilisha misimbo ya emoti sawasawa na kiteja rasmi cha kompyuta: andika jina kati ya nukta mbili na linakuwa emoji \u2014 :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 misimbo zaidi ya 1,900 inasaidiwa (seti kamili ya GitHub). Tabasamu za maandishi za kawaida pia hubadilishwa: :-) ;) :D xD :P <3 na nyingine takriban themanini.',
              'Kuandika : hufungua dirisha dogo la mapendekezo linalokamilisha msimbo unapoandika (\u2191/\u2193 kuchagua, Tab au Enter kukubali). Ubadilishaji wa emoji unaweza kuzimwa kabisa kwenye chaguo za kina \u2192 Chati.'] },
        { id: 'commands', t: 'Amri za chati',
          b: ['Chati huelewa amri za mkwaju. Mbili huonekana na wengine:'],
          keys: [
            ['/me <maandishi>', 'Ujumbe wa kitendo, huonyeshwa kama \u201c* jinalako maandishi\u201d'],
            ['/emoji <emoji>', 'Hucheza mwitikio wa emoji (kile kichagua miitikio kinachotuma)']] },
        { id: 'diagcmds', t: 'Amri za uchunguzi',
          b: ['Zilizobaki zote ni za ndani: majibu huonyeshwa kwako pekee na hakuna kinachotumwa mezani. Andika /help kuorodhesha zote. Muhimu zaidi:'],
          keys: [
            ['/help', 'Orodhesha amri zote'],
            ['/update', 'Angalia toleo jipya na uonyeshe upya'],
            ['/lang <msimbo>', 'Badilisha lugha (mfano /lang sw)'],
            ['/sound on|off', 'Washa/zima sauti za mchezo'],
            ['/zoom', 'Washa/zima kikuza cha meza'],
            ['/clear', 'Safisha chati kwa ndani'],
            ['/table', 'Taarifa za mchezo wa sasa (blind, wachezaji, marundo)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Uchunguzi wa hali ya kiteja, mtandao na kasi ya fremu'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Utatuzi wa kina (karata, itifaki, sauti, hifadhi, viti)'],
            ['/copy', 'Nakili jibu la amri ya mwisho kwenye ubao wa kunakili']] },
        { id: 'reactions', t: 'Miitikio ya emoji',
          b: ['Kitufe cha miitikio hufungua kichagua cha miitikio 30 ya uhuishaji (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) inayocheza na athari juu ya kiti chako, ikionekana na wote mezani \u2014 pamoja na wachezaji kwenye kiteja cha kompyuta. Miitikio inaweza kuzimwa kabisa kwenye chaguo za kina.'] },
        { id: 'translate', t: 'Kuelewa kila mtu',
          b: ['Tafsiri ya chati ikiwa imewashwa, kitufe cha kutafsiri huonekana kwenye mstari chini ya kielekezi chako \u2014 au kwenye mstari uliogusa, kwenye skrini ya kugusa \u2014 na huonyesha ujumbe huo kwa lugha yako kwa kutumia mtafsiri wa ndani wa kivinjari. Kinaweza kuonyeshwa kudumu kwenye kila mstari kwenye chaguo za kina \u2192 Chati, ambapo pia kuna kidokezo kinachoeleza vifupisho vya kawaida vya meza (gg, nh, utg\u2026).'],
          note: 'Tafsiri hutumia huduma ya Google Translate na hufanya kazi kwenye kila kivinjari \u2014 muunganisho wa intaneti tu unahitajika. Ujumbe hutumwa kwa huduma ya tafsiri tu unapogusa kitufe chake cha kutafsiri, kamwe kiotomatiki.' },
        { id: 'social', t: 'Wachezaji: wasifu, alika, puuza',
          b: ['Gusa mchezaji yeyote \u2014 mezani au kwenye orodha ya ukumbi \u2014 kufungua kadi yake: wasifu na takwimu, mwalike kwenye mchezo wako, au mpuuze (jumbe zake za chati zinafichwa; unaweza kuacha kupuuza wakati wowote). Uthibitisho kabla ya kualika/kupuuza unaweza kuwashwa kwenye chaguo.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Ukumbi na michezo',
      sections: [
        { id: 'list', t: 'Orodha ya michezo',
          b: ['Ukumbi huorodhesha kila meza kwenye seva. Kila kiingilio huonyesha idadi ya wachezaji, aina ya mchezo, kufuli nenosiri au mwaliko ukihitajika, na beji ya hali: \u201cUnasubiri\u201d (kijani \u2014 mchezo bado haujaanza, unaweza kujiunga kukiwa na kiti), \u201cUnaendelea\u201d (rangi ya joto \u2014 unaweza kutazama moja kwa moja watazamaji wakiruhusiwa) na \u201cUmefungwa\u201d (umefifishwa). Meza iliyojaa huonyesha tu hesabu iliyojaa, kama 10/10; rangi za beji hufuata mandhari inayotumika.',
              'Menyu ya vichujio hupunguza orodha sawasawa na kiteja cha kompyuta, kila chaguo kali zaidi ya lililotangulia: michezo iliyo wazi pekee \u2192 huficha pia meza zilizojaa \u2192 kisha isiyo binafsi pekee, binafsi pekee, au michezo ya ranking pekee. Chaguo lako hukumbukwa. Sehemu ya kutafuta hupata michezo kwa jina, na kidonge cha wachezaji hufungua orodha ya wote walio mtandaoni, inayotafutika na kupangika.'] },
        { id: 'join', t: 'Kujiunga na kutazama',
          b: ['Chagua mchezo ulio wazi na ujiunge \u2014 kufuli inamaanisha nenosiri linahitajika. Michezo inayoendelea inayoruhusu watazamaji inaweza kutazamwa moja kwa moja: unaona meza na chati, lakini hole cards zimefichwa na huwezi kucheza.'] },
        { id: 'gameinfo', t: 'Taarifa za mchezo',
          b: ['Kabla ya kujiunga, kadi ya taarifa za mchezo huonyesha kila kinachofafanua meza: aina ya mchezo, blind na jinsi zinavyopanda (kuongeza mara mbili au orodha ya mwenyewe), pesa za kuanzia, muda wa hatua, kuchelewa kati ya mikono, na nani tayari ameketi.'] },
        { id: 'create', t: 'Kuunda mchezo',
          b: ['Unda meza yako mwenyewe: jina, idadi ya wachezaji, pesa za kuanzia, small blind ya kwanza na ratiba ya kupandisha, muda wa hatua, na kama watazamaji wanaruhusiwa. Aina nne za michezo zipo: Kawaida (yeyote), wachezaji waliosajiliwa pekee, kwa mwaliko pekee, na Ranking (huhesabiwa kwenye viwango rasmi \u2014 hakuna nenosiri linaruhusiwa hapo). Mipangilio unayopenda inaweza kuhifadhiwa na kupakiwa tena.'] },
        { id: 'invites', t: 'Mialiko',
          b: ['Wachezaji wanaweza kukualika kwenye meza zao; utapata arifa unayoweza kukubali au kukataa. Kualikwa ndiyo njia pekee ya kuingia kwenye mchezo wa kwa mwaliko pekee.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Akaunti yako',
          b: ['Seva rasmi ya Intaneti ni pokerth.net. Kucheza huko kunahitaji akaunti ya bure ya pokerth.net \u2014 jisajili kwenye tovuti, kisha uingie hapa kwa jina lile la utani na nenosiri. Kiteja hiki cha wavuti huunganisha na seva ileile hasa ya kiteja cha kompyuta: akaunti zilezile, meza zilezile, viwango vilevile, na unaweza kuketi mezani na wachezaji wa kompyuta.'] },
        { id: 'ranked', t: 'Michezo ya ranking na misimu',
          b: ['Michezo ya aina ya Ranking huhesabiwa kwenye viwango rasmi vya msimu. Wasifu wa ndani ya programu huonyesha ulipojiunga, Kiwango, Alama, wastani na michezo iliyochezwa ya msimu wa sasa, pamoja na matokeo yako ya hivi karibuni. Michezo ya kawaida (isiyo ya ranking) ni ya burudani tu na haibadilishi kitu.'] },
        { id: 'rankhow', t: 'Jinsi viwango vinavyohesabiwa',
          b: ['Kwenye kila mchezo wa viwango, nafasi yako ya mwisho hupata pointi: 15 kwa wa kwanza, kisha 9, 6, 4, 3, 2 na 1 hadi wa saba; wa nane hadi wa kumi hawapati kitu. Hivyo meza moja hugawa jumla ya pointi 40.',
              'Alama yako si jumla ya pointi hizo bali wastani wako kwa mchezo, uliorekebishwa na kipimo kinachokua na idadi ya michezo iliyochezwa: matokeo machache mazuri hayatoshi kubaki juu, unahitaji pia uthabiti — kadri unavyocheza zaidi, Alama inakaribia wastani wako halisi. Misimu huchukua robo mwaka: mabadilikoni, kila kitu huhifadhiwa na vihesabu huanza upya kutoka sifuri, huku misimu iliyopita ikionekana bado. Mchezoni, kitufe cha jukwaa la ushindi huonyesha viwango vya msimu vya wachezaji wa meza yako.'],
          note: 'Kipimo cha pointi na fomula halisi huamuliwa na seva ya viwango ya pokerth.net na vinaweza kubadilika; kurasa za tovuti ndizo rejea.' },
        { id: 'rankings', t: 'Kurasa za viwango',
          b: ['Kiingilio cha viwango hufungua viwango rasmi vya PokerTH, vinavyotafutika kwa mchezaji, pamoja na viwango vya jumuiya (BBC, WEC). Usipojali viwango, kiingilio kinaweza kufichwa kwenye chaguo za kina \u2192 Jumuiya.'] },
        { id: 'cups', t: 'Vikombe vya jumuiya: BBC na WeCup',
          b: ['Jumuiya mbili huendesha mashindano yao kwenye pokerth.net, kila moja na tovuti na viwango vyake. Best Brainies Cup (BBC) ni mashindano ya hatua yaliyoanza 2013: unapanda kutoka Step 1 hadi Step 4, na msimu mpya huanza baada ya kila mchezo wa Step 4, kikombe kinapotolewa. WeCup (WEC) ina kipimo chake, kilichoenea zaidi — pointi 75 kwa nafasi ya kwanza, kisha 45, 30, 20… — na alama yake hurekebisha wastani wako dhidi ya idadi ya michezo uliyocheza ukilinganishwa na wanachama wengine.',
              'Viwango vyote viwili hufunguka kutoka kitufe cha kikombe, kando ya viwango vya PokerTH. Mipangilio ya meza ya mashindano haya imejumuishwa kama violezo unapounda mchezo (BBC Step 1 hadi 4, WEC, WEC Monthly Final na WEC Grand Final), ili ufanye mazoezi kwa masharti yaleyale. Kushiriki kunahitaji kujisajili kwenye tovuti ya kikombe husika.'],
          note: 'Maudhui haya yanaweza kufichwa kwa pamoja kwenye chaguo za kina → Jumuiya vikombe visipokupendeza.' },
        { id: 'forumcups', t: 'Vikombe vya jukwaa na matukio',
          b: ['Jukwaa la pokerth.net pia huandaa Monthly Cup, mfululizo wa kila mwezi ambapo wachezaji hugawanywa kwenye meza za Dhahabu, Fedha na Shaba kabla ya bingwa wa mwezi kutawazwa, pamoja na vikombe maalum vya mara moja mwaka mzima.',
              'Usajili, ratiba, mipangilio ya meza na matokeo huchapishwa kwenye jukwaa, na michezo huchezwa kwenye seva rasmi kama mingine. Akaunti ya pokerth.net inatosha kufuata matokeo; kuingia kikombeni ni kupitia uzi wa jukwaa husika.'] },
        { id: 'forumnews', t: 'Habari za jukwaa ukumbini',
          b: ['Kitufe cha gazeti kwenye kichwa cha ukumbi hufungua machapisho ya hivi karibuni kutoka jukwaa la pokerth.net, kiingilio kimoja kwa kila mada, kila jukwaa na rangi yake. Beji kwenye kitufe huhesabu machapisho ambayo hayajasomwa; kufungua chapisho (kichupo kipya) hukiweka alama ya kusomwa, na “Weka zote kama zimesomwa” husafisha zote kwa pamoja.',
              'Hii ni nyongeza ya wavuti: kitufe kinaweza kufichwa kwenye chaguo za kina (“Kitufe cha jukwaa kwenye kichwa cha ukumbi”).'] },
        { id: 'avatars', t: 'Avatari na bendera',
          b: ['Kwenye pokerth.net, avatari yako husambazwa kwa wachezaji wengine kupitia seva ya avatari, na bendera ndogo ya nchi inaweza kuonyeshwa kwenye visanduku vya wachezaji. Zote ni za hiari na zinaweza kusanidiwa kwenye chaguo.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Hali ya mazoezi',
      sections: [
        { id: 'what', t: 'Ni nini',
          b: ['Hali ya Ndani / mazoezi ni mchezo kamili dhidi ya wapinzani wa kompyuta: hakuna muunganisho, hakuna akaunti, hakuna kilicho hatarini. Programu ikishasakinishwa (au ukitembelea mara moja tu), hufanya kazi kikamilifu nje ya mtandao \u2014 bora kwa kujifunza mchezo, kujaribu kiolesura au kupitisha muda kwenye hali ya ndege.'] },
        { id: 'setup', t: 'Kusanidi mchezo',
          b: ['Chagua idadi ya wapinzani, pesa za kuanzia, blind na ratiba ya kupandisha, na kasi ya mchezo. Safu na ugumu wa boti vinaweza kurekebishwa kwenye chaguo za kina \u2192 Mchezo wa ndani \u2014 kutoka wapinzani wapole hadi meza ngumu zaidi ya mchanganyiko.'] },
        { id: 'trophies', t: 'Vikombe',
          b: ['Hali ya mazoezi ina maendeleo yake: vikombe 28 katika makundi sita (maendeleo, ujuzi, mtindo, miundo, burudani na moja ya siri) hufunguka unapocheza \u2014 mikono iliyochezwa, michezo iliyoshindwa, bluff kubwa, mikono maalum na zaidi. Maendeleo yako ya vikombe hujilimbikiza na kuunganishwa kati ya vifaa usawazishaji wa mipangilio ya akaunti ukiwa umewashwa.'] },
        { id: 'learn', t: 'Mahali pazuri pa kujifunza',
          b: ['Kila kitu kutoka sura nyingine kinafanya kazi hapa pia: kifuatiliaji cha uwezekano, maonyesho ya msaidizi, uchaguzi wa mapema, njia za mkato za kibodi. Hali ya mazoezi ni mahali bora zaidi pa kuvijaribu bila shinikizo kabla ya kwenda pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Mtindo na sauti',
      sections: [
        { id: 'themes', t: 'Mandhari',
          b: ['Sehemu ya Mtindo ya chaguo za kina hubadilisha mwonekano wa kiteja chote. Violezo huweka kila kitu kwa mguso mmoja (kasino ya kijani ya kawaida, mwonekano rasmi wa PokerTH\u2026); chini yake, mihimili binafsi hukuruhusu kurekebisha kando paleti ya rangi, kitambaa cha meza na nyuso za karata \u2014 badilisha mhimili wowote na mchanganyiko wako unakuwa mandhari maalum. Hali ya giza, mwanga au otomatiki huchaguliwa kwenye Kiolesura cha mtumiaji, na chaguo zako hutumika mara moja, kila skrini, na hukumbukwa.'] },
        { id: 'tablelook', t: 'Meza, deki, viti',
          b: ['Mbali na mandhari, vipengele vingi vinaweza kubadilishwa kando: mandharinyuma ya meza, deki ya karata, mgongo wa karata (fuata deki kiotomatiki au ingiza picha yako), vidonge vya mgawaji na blind, mtindo wa vitufe vya hatua, na vifurushi kamili vya viti vinavyobadilisha mwonekano wa visanduku vya wachezaji. Chagua yote kwenye chaguo za kina \u2192 Mtindo; mabadiliko huonekana mara moja mezani.'] },
        { id: 'music', t: 'Kichezaji muziki',
          b: ['Kiingilio cha muziki kwenye menyu za kichwa hufungua kichezaji kidogo cha muziki wa starehe: chagua wimbo kutoka orodha, cheza/simamisha, iliyotangulia/ifuatayo, changanya, na rudia wimbo mmoja, orodha nzima au usirudie. Kiwango, wimbo uliochaguliwa na hali ya kurudia hukumbukwa. Uchezaji hauanzi wenyewe kamwe \u2014 vivinjari vinahitaji mguso \u2014 na kichezaji ni huru kabisa na athari za sauti za mchezo.'] },
        { id: 'sounds', t: 'Athari za sauti',
          b: ['Sauti za mchezo zimewekwa kwenye makundi manne yanayoweza kuwashwa kando, sawasawa na kiteja cha kompyuta: hatua za mchezoni (karata zinazogawiwa, Check, Call, Raise, zamu yako\u2026), arifa za chati ya ukumbi, arifa za mchezo wa mtandao (mchezaji amejiunga, mchezo tayari) na arifa ya kupanda kwa blind. Kitelezi kimoja cha kiwango huvidhibiti vyote, kwenye chaguo za kina \u2192 Sauti.'],
          note: 'Kila kivinjari \u2014 hasa iOS \u2014 hukataa kucheza sauti kabla hujagusa ukurasa mara moja. Mchezo ukianza kimya, mguso mmoja popote huamsha sauti; kiteja pia hurekebisha injini ya sauti kiotomatiki iOS ikiisimamisha (simu inayoingia, kwenda nyuma\u2026).' },
        { id: 'voice', t: 'Sauti ya kusoma na mtetemo',
          b: ['Njia mbili za ziada zinaweza kukujulisha bila kuangalia skrini: matangazo ya sauti husoma matukio ya mchezo kwa kutumia usanisi wa sauti wa kifaa chako, na kwenye simu mtetemo mfupi unaweza kuashiria zamu yako. Zote ni nyongeza za wavuti, zimezimwa au kuwashwa kwa chaguo-msingi kulingana na kifaa, kwenye chaguo za kina \u2192 Dau na zamu.'],
          note: 'Mtetemo hufanya kazi kwenye Android (vivinjari vya Chromium); Apple haitoi API ya mtetemo kwa tovuti, hivyo iPhone haziwezi kutetema. Matangazo ya sauti hufanya kazi kila mahali, lakini sauti na lugha zinazopatikana hutegemea mfumo wako \u2014 kiteja hutumia mfanano bora unaopatikana.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Chaguo na njia za mkato',
      sections: [
        { id: 'where', t: 'Chaguo zipo wapi',
          b: ['Chaguo za kina hufunguka kutoka kiingilio cha gia cha menyu yoyote ya kichwa. Zimepangwa kama kiteja cha kompyuta: Kiolesura cha mtumiaji, Mtindo, Sauti, Mchezo wa ndani, Mchezo wa mtandao, Mchezo wa intaneti, Majina ya utani / Avatari, Jumbe za kumbukumbu, na Rejesha chaguo-msingi. Kila kipengele maalum cha wavuti kina swichi yake hapo, hivyo unaweza kuzima chochote usichotumia.'] },
        { id: 'cfgxml', t: 'Kubadilishana mipangilio na kiteja cha kompyuta',
          b: ['Mipangilio yako inaweza kusafiri kati ya viteja: sehemu ya Jumbe za kumbukumbu inatoa uhamishaji/uingizaji wa faili rasmi la config.xml (\u007e/.pokerth/config.xml linalotumiwa na viteja vya kompyuta na QML). Uhamishaji huandika mipangilio inayoshirikiwa \u2014 jina, chaguo za maonyesho, sauti, mapendeleo ya meza, blind, mitindo \u2014 na uingizaji hutumia faili la kompyuta hapa. Mipangilio isiyojulikana na kiteja hiki hubaki kwenye faili bila kuguswa.'] },
        { id: 'sync', t: 'Mipangilio inayokufuata',
          b: ['Unapocheza kwa akaunti, chaguo zako, mandhari, mifungo ya vitufe, lugha na vikombe vya mazoezi husawazishwa: badilisha kitu kwenye kifaa kimoja na kifaa kinachofuata unachoingia kitakichukua. Maendeleo ya vikombe huunganishwa, kamwe hayafutwi, hivyo kucheza kwenye vifaa viwili daima hubaki na bora ya vyote viwili.'] },
        { id: 'updates', t: 'Kubaki na toleo jipya',
          b: ['Kiteja hujisasisha chenyewe: toleo jipya likitolewa, bango hukualika kuonyesha upya (au andika /update kwenye chati kuangalia mwenyewe). Mara chache kura ndogo ya maoni ya bidhaa inaweza kutokea kuuliza maoni yako kuhusu kipengele \u2014 kushiriki ni hiari na kura zinaweza kuzimwa kabisa kwenye chaguo za kina \u2192 Jumuiya.'] },
        { id: 'fkeys', t: 'Njia rasmi za mkato za kibodi',
          b: ['Vitufe rasmi vya kazi vya PokerTH hufanya kazi wakati wa mchezo \u2014 Alt+S hufanya kazi kila mahali:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (mpangilio unaweza kugeuzwa kwenye chaguo)'],
            ['F5', 'Onyesha karata zako (inapowezekana)'],
            ['F6 / F7 / F8', 'Mwenyewe \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Mwenyewe \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chati \u00b7 Kumbukumbu ya mchezo \u00b7 Paneli ya uwezekano'],
            ['Alt+S', 'Mipangilio \u2014 popote kwenye programu, si wakati wa mchezo tu'],
            ['F11', 'Skrini nzima']],
          note: 'Njia za mkato zinahitaji kibodi halisi. Kwenye Mac, vitufe vya F ni vidhibiti vya media kwa chaguo-msingi: shikilia Fn (au washa \u201cUse F1, F2, etc. as standard function keys\u201d kwenye mipangilio ya macOS). Kwenye iPhone, iOS huzuia skrini nzima \u2014 kusakinisha programu kama PWA hutoa uzoefu uleule wa skrini nzima.' },
        { id: 'webkeys', t: 'Vitufe vya herufi vya wavuti',
          b: ['Kama nyongeza ya wavuti, vitufe vya herufi moja na Alt+T pia huamsha hatua, na kila kimoja kinaweza kufungwa upya kwenye chaguo za kina \u2192 Njia za mkato za kibodi:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Paneli ya takwimu'],
            ['Esc', 'Funga dirisha la juu kabisa (pia kitufe cha Kurudi cha Android)']],
          note: 'Kwenye Android, kitufe/ishara ya Kurudi ya mfumo hufunga madirisha kama Escape badala ya kuondoka mchezoni (inasanidika kwenye chaguo). iOS haina kitufe cha mfumo sawa \u2014 tumia \u2715 ya kila dirisha.' }
      ]
    }
  ]
};
