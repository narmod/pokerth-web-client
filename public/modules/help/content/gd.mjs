// ── help/content/gd.mjs — Corpas na cobharach sa Ghàidhlig ──────────────────
// Eadar-theangachadh o en.mjs (iomradh). Structar agus id-an co-ionann; chan
// eil ach t / b / list / keys (bileagan) / note air an eadar-theangachadh.
// Fanaidh briathran a' phoker (Fold, Check, Call, Bet, Raise, All-In, flop,
// turn, river…) sa Bheurla a-rèir gnàth na h-aplacaid. Modh: thu.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'A\u2019 tòiseachadh',
      sections: [
        { id: 'modes', t: 'Trì dòighean air cluich',
          b: ['Air sgrìn a\u2019 chlàraidh a-steach, tagh ciamar a tha thu airson cluich.'],
          list: [
            'Eadar-lìon — cluich air-loidhne air an fhrithealaiche oifigeil pokerth.net, le clàran-rangachaidh. Feumar cunntas pokerth.net; tha clàradh air pokerth.net an-asgaidh.',
            'Ionadail / trèanadh — cluich far-loidhne an aghaidh bhotaichean. Chan eil dad ri shuidheachadh, obraichidh e gun cheangal, agus fosglaidh e duaisean mar a thig piseach ort.',
            'LAN / frithealaiche sònraichte — ceangail ri frithealaiche PokerTH prìobhaideach air an lìonra ionadail agad no air an inneal agad fhèin.'] },
        { id: 'lan', t: 'LAN / frithealaiche sònraichte',
          b: ['Ceanglaidh an treas modh ri frithealaiche PokerTH sam bith a tha thu fhèin no caraid a\u2019 ruith — air lìonra dachaigh, air VPS prìobhaideach, àite sam bith. Cuir a-steach seòladh agus port an fhrithealaiche, cuir cromag ri TLS ma chleachdas am frithealaiche port crioptaichte, agus clàraich a-steach le far-ainm (obraichidh clàradh aoigh ma cheadaicheas am frithealaiche e). Aig a\u2019 bhòrd, giùlainidh a h-uile càil e fhèin an uair sin dìreach mar a nì e air an fhrithealaiche oifigeil.'] },
        { id: 'famboard', t: 'Clàr-rangachaidh an teaghlaich',
          b: ['Air frithealaichean prìobhaideach agus ann an geamannan LAN a-mhàin, cumaidh an cliant staitistigean cruinnichte a-rèir far-ainm — làmhan is geamannan a chaidh a chluich agus a bhuannachadh, an duais as motha, an t-sreath as fheàrr — agus roinnidh e iad tron fhrithealaiche, gus am faic gach inneal timcheall a\u2019 bhùird an aon chlàr. Cha tèid geamannan pokerth.net a chlàradh mar seo a-riamh, agus cumar staitistigean a\u2019 mhodh trèanaidh gu tur air leth.'] },
        { id: 'language', t: 'Cànan',
          b: ['Tha an eadar-aghaidh ri fhaotainn ann an 36 cànan. Atharraich e uair sam bith anns na Roghainnean adhartach (clàr a\u2019 ghèar), roinn Eadar-aghaidh a\u2019 chleachdaiche. Fanaidh briathran gnìomh a\u2019 phoker (Fold, Check, Call, Bet, Raise, All-In) sa Bheurla a-rèir gnàth, dìreach mar anns a\u2019 chliant deasg.'] },
        { id: 'pwa', t: 'Stàlaich mar aplacaid',
          b: ['\u2019S e Progressive Web App a th\u2019 anns a\u2019 chliant seo: \u2019s urrainn dhut a stàladh o chlàr a\u2019 bhrabhsair (no leis a\u2019 phutan stàlaidh sa bhann-cinn) agus aplacaid làn-sgrìn le ìomhaigheag fhèin fhaighinn. Nuair a tha e stàlaichte, tòisichidh e sa bhad, agus obraichidh am modh trèanaidh gu tur far-loidhne.'],
          note: 'Air Android agus air Chrome/Edge deasg, nì am putan stàlaidh a h-uile càil. Air iPhone/iPad, chan eil Apple a\u2019 ceadachadh stàlaidh ach tro Safari: putan Co-roinn \u2192 \u201cCuir ris an Sgrìn Dhachaigh\u201d — seallaidh an cliant na ceumannan sin nuair a tha feum orra. Falbhaidh am putan cho luath \u2019s a tha an aplacaid stàlaichte.' },
        { id: 'platforms', t: 'Ùrlaran agus brabhsairean',
          b: ['Ruithidh an cliant ann am brabhsair ùr-nodha sam bith air siostam sam bith — Windows, macOS, Linux, Android, iOS. Tha beagan fheartan an eisimeil API brabhsair nas ùire; nuair a bhios API a dhìth, falaichidh am feart e fhèin no mìnichidh e an suidheachadh seach a bhith briste. Na prìomh eadar-dhealachaidhean as fhiach eòlas orra:'],
          list: [
            'Chrome / Edge (deasg): obraichidh a h-uile càil, a\u2019 gabhail a-steach sgrìobhadh an loga .pdb gu pasgan.',
            'Firefox: a h-uile càil ach sgrìobhadh an .pdb gu pasgan (chan eil an API ann fhathast).',
            'Safari / iOS: thèid an stàladh tro Cho-roinn \u2192 \u201cCuir ris an Sgrìn Dhachaigh\u201d; gun chrith; làn-sgrìn cuingichte air iPhone; tòisichidh am fuaim às dèidh a\u2019 chiad shuathaidh agad.',
            'Android: taic iomlan ann am brabhsairean Chromium, a\u2019 gabhail a-steach crith agus giùlan a\u2019 phutain Air ais.'] },
        { id: 'avatar', t: 'Far-ainm agus avatar',
          b: ['Tagh d\u2019 fhar-ainm agus d\u2019 avatar air sgrìn a\u2019 chlàraidh a-steach mus ceangail thu. Air pokerth.net, \u2019s e d\u2019 fhar-ainm ainm a\u2019 chunntais agad; thèid avataran a cho-roinn le cluicheadairean eile tron fhrithealaiche avatar.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Riaghailtean a\u2019 phoker',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em ann am beagan fhaclan',
          b: ['Thathar a\u2019 cluich PokerTH mar No-Limit Texas Hold\u2019em. Gheibh gach cluicheadair dà chairt dhùinte (hole cards). An uair sin thèid còig cairtean coitcheann a chur sìos an aghaidh suas ann am meadhan a\u2019 bhùird. Buannaichidh an làmh as fheàrr de chòig cairtean, air a dèanamh de mheasgachadh sam bith den dà chairt agad agus na còig cairtean coitcheann, am poit.'] },
        { id: 'blinds', t: 'Na blinds agus putan an neach-riarachaidh',
          b: ['Ro gach làmh, bidh dà gheall èigneachail a\u2019 biathadh a\u2019 phoit: an small blind agus am big blind, air an cur leis an dithis chluicheadairean air taobh clì putan an neach-riarachaidh. Gluaisidh am putan aon àite deiseil às dèidh gach làimhe, agus mar sin pàighidh a h-uile duine na blinds mun cuairt. Èiridh na blinds aig amannan cunbhalach tron gheama.',
              'Air a\u2019 bhòrd, tha am putan agus na blinds air an comharrachadh le sligean: D (neach-riarachaidh), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Na ceithir cuairtean gheall',
          list: [
            'Pre-flop — às dèidh na cairtean dùinte a riarachadh, tòisichidh a\u2019 chiad chuairt gheall air taobh clì a\u2019 bhig blind.',
            'Flop — thèid trì cairtean coitcheann fhoillseachadh, agus cuairt gheall às an dèidh.',
            'Turn — ceathramh cairt choitcheann, agus an uair sin cuairt gheall eile.',
            'River — a\u2019 chòigeamh agus an cairt choitcheann mu dheireadh, agus an uair sin a\u2019 chuairt gheall dheireannach.'],
          b: ['Thig cuairt gheall gu crìch nuair a tha gach cluicheadair a tha fhathast san làimh air an aon shuim a chur sa phoit (no nuair a tha e all-in).'] },
        { id: 'actions', t: 'Na \u2019s urrainn dhut a dhèanamh nuair as e do thuras a th\u2019 ann',
          list: [
            'Fold — leigidh tu seachad an làmh. Falbhaidh na cairtean agad agus chan eil thu a\u2019 strì airson a\u2019 phoit tuilleadh.',
            'Check — thèid thu air adhart gun gheall. Chan eil e comasach ach nuair nach eil dad ri phàigheadh.',
            'Call — bidh thu a\u2019 co-ionannachadh a\u2019 gheall làithrich.',
            'Bet — fosglaidh tu na geallan nuair nach do chuir duine geall fhathast air an street seo.',
            'Raise — àrdaichidh tu os cionn geall a tha ann mu thràth. Tha an t-àrdachadh as lugha co-ionann ris a\u2019 gheall no an àrdachadh roimhe.',
            'All-In — cuiridh tu do chruach gu lèir a-steach. Fanaidh tu san làimh suas ris an t-suim a chòmhdaich thu.'] },
        { id: 'showdown', t: 'Showdown agus poitean roinnte',
          b: ['Ma dh\u2019fhanas grunn chluicheadairean às dèidh na cuairt gheall air an river, thèid na làmhan a shealltainn agus buannaichidh an tè as fheàrr — nochdaidh am measgachadh buadhach fo na cairtean coitcheann. Nuair a tha cluicheadair all-in airson nas lugha na na geallan slàna, thig poitean-taobh gu bith: chan urrainn do gach cluicheadair ach am pàirt den phoit ris an do chuir e buannachadh. Roinnidh làmhan co-ionann am poit.'] },
        { id: 'hands', t: 'Rangachadh nan làmhan',
          b: ['On tè as laige chun tè as làidire:'],
          list: [
            '1. High Card — gun mheasgachadh; \u2019s i a\u2019 chairt as àirde a cho-dhùineas.',
            '2. Pair — dà chairt den aon luach.',
            '3. Two Pair — dà phaidhir eadar-dhealaichte.',
            '4. Three of a Kind — trì cairtean den aon luach.',
            '5. Straight — còig cairtean an dèidh a chèile (cunntar an t-àsa àrd no ìosal).',
            '6. Flush — còig cairtean den aon dath.',
            '7. Full House — triùir agus paidhir.',
            '8. Four of a Kind — ceithir cairtean den aon luach.',
            '9. Straight Flush — sreath, uile den aon dath.',
            '10. Royal Flush — o dheich chun àsa ann an aon dath. An làmh as fheàrr a ghabhas a bhith ann.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Sgrìn a\u2019 gheama',
      sections: [
        { id: 'actionbar', t: 'Am bàr gnìomhan',
          b: ['Nuair as e do thuras a th\u2019 ann, lasaidh am bàr gnìomhan aig a\u2019 bhonn le suas ri ceithir putanan: Fold (dearg), Check / Call (gorm), Bet / Raise (uaine — am prìomh ghnìomh, air a chomharrachadh) agus All-In (dearg dorcha). Seallaidh am putan Check / Call an t-suim cheart ri phàigheadh; seallaidh Bet / Raise an t-suim a tha thu gu bhith a\u2019 cur a-steach. Às dèidh an river, faodaidh All-In tionndadh gu putan Show gus na cairtean agad a shealltainn.'] },
        { id: 'betctl', t: 'Tagh do gheall',
          b: ['Gleus suim an àrdachaidh leis an raon àireamhan, an sleamhnachan no na putanan luatha 1/3 \u00b7 1/2 \u00b7 Pot (bloighean den phoit làithreach). Thèid na suimean a chruinneachadh gu fèin-obrachail agus an cumail eadar an t-àrdachadh as lugha agus as motha a tha ceadaichte. Ma \u2019s fheàrr leat smaoineachadh ann am big blinds, seallaidh roghainn a h-uile suim ann am BB seach ann an sligean.'] },
        { id: 'preselect', t: 'Gnìomh a thaghadh ro-làimh',
          b: ['Ron turas agad \u2019s urrainn dhut gnìomh a luchdachadh ro-làimh: suath putan agus gheibh e oir òir le dotag bheag òir. Nuair a thig do thuras, thèid an gnìomh a chur an gnìomh sa bhad. Tionndaidhidh Fold luchdaichte gu Check gu fèin-obrachail nuair a tha an check an-asgaidh — cha leig thu seachad an làmh gu dìomhain a-riamh. Thèid na ro-thaghaidhean ath-shuidheachadh aig gach làimh ùr, gach atharrachadh street agus aig an showdown, agus thèid an cur dheth ma dh\u2019atharraicheas an suidheachadh (mar eisimpleir ma dh\u2019atharraicheas an t-suim ri phàigheadh).'] },
        { id: 'automodes', t: 'Modhan fèin-obrachail',
          b: ['Tha an clàr-taice ri taobh nam putanan gnìomh a\u2019 tabhann trì modhan cluiche: Làimhe, Auto Check/Call agus Auto Check/Fold. Cluichidh na modhan fèin-obrachail nad àite gus an till thu — tillidh briogadh làimhe sam bith air gnìomh chun mhodh Làimhe sa bhad.'] },
        { id: 'readtable', t: 'A\u2019 leughadh a\u2019 bhùird',
          b: ['Seallaidh gach bogsa cluicheadair an avatar, an t-ainm, a\u2019 chruach agus an geall làithreach. Tha an neach-riarachaidh agus na blinds air an comharrachadh le sligean D / SB / BB. Innsidh bràiste dhathte air a\u2019 bhogsa an gnìomh mu dheireadh aig a\u2019 chluicheadair; cunntaidh bàr caol gorm sìos an ùine smaoineachaidh aige. Lasaidh bogsa a\u2019 chluicheadair aig a bheil an turas; gheibh am bogsa agad fhèin frèam òir a phlosgas nuair as e do thuras a th\u2019 ann.',
              'Seallaidh am bàr-staide os cionn a\u2019 bhùird am poit iomlan, geallan an street làithrich, an ìre (Pre-flop, Flop, Turn, River) agus àireamhan a\u2019 gheama is na làimhe. Tha cairtean nan cluicheadairean a dh\u2019fhalbh leth-shoilleir; tha an fheadhainn a chaidh a-mach doilleir. Aig deireadh làimhe, faodaidh uinneag buannaiche geàrr-chunntas a thoirt air cò a bhuannaich dè — gabhaidh a chur dheth sna roghainnean.'] },
        { id: 'seatlayout', t: 'Rian nan suidheachan',
          b: ['Mar leudachan lìn, thathar a\u2019 taghadh rian bhogsaichean nan cluicheadairean ann an Roghainnean adhartach \u2192 Suidheachan: leanaidh Fèin-obrachail an cliant oifigeil (àiteachan stèidhichte gu dìreach, elips àireamhaichte gu tarsainn), no sparr an rian Dìreach no Tarsainn — agus leigidh Gnàthaichte leat gach suidheachan a chur an àite thu fhèin: nochdaidh modh deasachaidh far an slaod thu gach bogsa dìreach far a bheil thu ag iarraidh, agus thèid an rian a shàbhaladh.'] },
        { id: 'zoom', t: 'Sùm a\u2019 bhùird (fònaichean)',
          b: ['Air sgrìnichean beaga, meudaichidh putanan a\u2019 ghlainne-mheudachaidh am bòrd (2\u00d7) agus \u2019s urrainn dhut a shlaodadh le do mheur — fanaidh am bogsa agad fhèin agus am bàr gnìomhan far a bheil iad. Leanaidh an sealladh an suidheachan gnìomhach gu fèin-obrachail agus sùmaidh e a-mach aig an showdown airson an t-sealladh fharsaing. Gabhaidh a chur dheth sna Roghainnean adhartach.'],
          note: 'Air fònaichean agus tablaidean, tha sùm-teannachaidh a\u2019 bhrabhsair fhèin bacte a ghnàth gus nach tòisich gluasad sùm gu tubaisteach am meadhan làimhe; cuir air ais e ann an Roghainnean adhartach \u2192 Eadar-aghaidh a\u2019 chleachdaiche ma \u2019s fheàrr leat.' },
        { id: 'protections', t: 'Dìon o phriobadh agus o Call tubaisteach',
          b: ['Dà dhìon roghainneil: cumaidh an dìon o phriobadh na cairtean agad dùinte gus an suath thu iad (feumail nuair a chì cuideigin an sgrìn agad), agus glasaidh an dìon o Call tubaisteach am putan Call greis bheag dìreach às dèidh àrdachadh mòr, gus nach tuit suathadh a bha an dùil airson Call nas lugha gu tubaisteach air an t-suim àrdaichte. Tha an dà chuid sna Roghainnean adhartach.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Panail an fhiosrachaidh',
      sections: [
        { id: 'open', t: 'A\u2019 fosgladh na panail',
          b: ['Rè geama, fosglaidh panail an fhiosrachaidh on bhann-cinn (no Alt+L / Alt+I) agus tha trì tabaichean aice: Loga, Coltasan agus Staitistigean. Air an fhòn snàmhaidh i os cionn a\u2019 bhùird; air sgrìnichean nas motha \u2019s e uinneag ghluasadach le meud atharrachail a th\u2019 innte — glac an làmh \u28ff gus a gluasad, na h-oirean gus am meud atharrachadh. Thèid a h-àite a chuimhneachadh.'] },
        { id: 'log', t: 'Loga a\u2019 gheama',
          b: ['Clàraidh an taba Loga an geama gu lèir làmh air làimh: na blinds, gach gnìomh leis na suimean, na cairtean a chaidh a shealltainn agus na buannaichean, uile air an dathadh airson leughadh luath. Sàbhalaidh am putan às-phortaidh an loga ann am faidhle ma tha thu airson seisean ath-sgrùdadh nas fhaide air adhart.'] },
        { id: 'odds', t: 'Coltasan (monatair coltachd)',
          b: ['Seallaidh an taba Coltasan, airson na làimhe làithrich agad, an coltachd bheò gun crìochnaich thu le gach tè de na 10 roinnean làmhan — o High Card gu Royal Flush — gach tè le a h-ìomhaigheag, a ceudad agus a bàr. Doilleiridh an taisbeanadh cho luath \u2019s a leigeas tu seachad. Cha chleachd e ach na cairtean agad fhèin agus na cairtean coitcheann: chan fhaic e dad nach seall na farpaisich agad.'] },
        { id: 'journal', t: 'Logaichean làmhan agus an uinneag \u201cLogaichean\u201d',
          b: ['A bharrachd air an loga bheò, thèid gach làmh a chluicheas tu a chlàradh gu h-ionadail sa bhrabhsair agad, san aon chruth ris na faidhlichean loga .pdb aig a\u2019 chliant oifigeil. Liostaichidh an uinneag Logaichean (Roghainnean adhartach \u2192 Teachdaireachdan loga \u2192 Stiùirich na logaichean\u2026) na seiseanan agad agus leigidh i leat obrachadh leotha: ro-shealladh de sheisean le lorg agus soillseachadh, sìoladh a-rèir geama, às-phortadh gu HTML no teacsa lom, sàbhaladh an fhaidhle .pdb amh, no in-phortadh .pdb a chlàraich an cliant deasg. Thèid seiseanan a sguabadh às fear mu seach no uile còmhla (le dearbhadh), agus \u2019s urrainn do ghlèidheadh fèin-obrachail dìreach na 7, 30, 90, 180 no 365 latha mu dheireadh a chumail. Cha tèid logaichean a rinn thu ion-phortadh a sguabadh às gu fèin-obrachail idir. Cuingichidh dara roghainn cò mheud seisean a thèid a chumail, agus gabhaidh an colbh liosta a shlàodadh nas fharsainge.',
              'Ruithidh am putan Sgrùdaich sgrùdadh làmhan air seisean agus \u2019s urrainn dha loga a chur gu seirbheis sgrùdaidh pokerth.net. Fanaidh a h-uile càil air an inneal agad gus an às-phortaich no gus an cuir thu e gu soilleir.'] },
        { id: 'logopts', t: 'Roghainnean loga',
          b: ['Ann an Roghainnean adhartach \u2192 Teachdaireachdan loga, faodaidh tu an clàradh a chur air no dheth agus an eadaramh sgrìobhaidh a thaghadh, leis na trì roghainnean a tha aig a\u2019 chliant deasg: às dèidh gach gnìomhachd, às dèidh gach làmh (bunaiteach) no às dèidh gach geama. Bidh roghainn eile a\u2019 sgrìobhadh am faidhle .pdb gu pasgan a thaghas tu agus ga chumail suas ri latha aig an eadaramh sin, agus aon uair eile nuair a dh\u2019fhàgas tu an duilleag, gus an urrainn inneal eile an geama a leantainn beò.'],
          note: 'Feumaidh sgrìobhadh gu pasgan ionadail an File System Access API: dìreach Chrome, Edge agus Opera air an deasg. Air feadh chàich, mìnichidh an roghainn i fhèin agus tha às-phortadh làimhe às an uinneig logaichean fhathast ri fhaighinn. Chan urrainn do bhrabhsair ach faidhle a chur na àite, cha chuir e ris a-riamh, agus mar sin bu chòir do dh\u2019inneal a leughas an .pdb fhosgladh às ùr às dèidh gach atharrachaidh.' },
        { id: 'assist', t: 'Taic (neart na làimhe)',
          b: ['Aig mullach an taba Coltasan, leughaidh bratach na taice an làmh agad às do leth. Ron flop ainmichidh i an làmh thòiseachaidh agad agus bheir i comharra rionnagan dhi; on flop a-mach seallaidh i am measgachadh as fheàrr a th\u2019 agad an-dràsta agus, às dèidh atharrais luath, an cothrom tuairmseach a th\u2019 agad an làmh a bhuannachadh mar cheudad, le taisbeanair dhathan o dhearg (lag) gu uaine (làidir). Mar am monatair coltachd, cha chleachd i ach fiosrachadh a chì thu.',
              'Tha dà stoidhle taisbeanaidh ann an Roghainnean adhartach \u2192 Suidheachan: Earrannan (deich blocaichean) no bàr adhartais clasaigeach. Gabhaidh an taic gu lèir a chur dheth ann an Roghainnean adhartach \u2192 Taic.'] },
        { id: 'assistwin', t: 'An taic mar uidheam air fleòd',
          b: ['Gabhaidh bloc na taice a spìonadh far na panail gu uinneag bheag aige fhèin a bhios an-còmhnaidh air uachdar: cleachd am putan spìonaidh air a\u2019 bhloc, an uair sin gluais agus atharraich a mheud àite sam bith os cionn a\u2019 bhùird — feumail gus sùil a chumail air neart na làimhe gun a\u2019 phanail gu lèir fosgailte. Cuiridh am putan docaidh air ais e chun taba Coltasan, agus thèid an t-àite a chuimhneachadh. Am broinn na panail, leigidh làmh slaodaidh eadar an Taic agus na coltasan leat an t-àite a roinn eatarra.'] },
        { id: 'stats', t: 'Staitistigean',
          b: ['Cumaidh an taba Staitistigean sùil air an t-seisean agad: làmhan a chaidh a chluich, flopan a chunnaic thu, showdownan, ìrean buannachaidh agus barrachd. Gabhaidh cumail sùil nan staitistigean a chur dheth sna Roghainnean adhartach.'] },
        { id: 'hud', t: 'HUD staitistigean aig na suidheachan (beta)',
          b: ['Ceanglaidh an HUD bogsa beag staitistigean ri taobh suidheachan gach cluicheadair, air a thogail o na làmhan a chlàraich thu sna logaichean agad: an àireamh de làmhan a chunnacas, an uair sin VPIP (dè cho tric \u2019s a chuireas e airgead a-steach a dheòin pre-flop), PFR (àrdachaidhean pre-flop), AF (factar ionnsaigh), 3B (3-bet), CB (continuation bet) agus F3B (fold an aghaidh 3-bet), le còdan dhathan on fhulangach chun ionnsaigheach. Suath bogsa airson uinneag mhionaideach le tuilleadh àireamhan (oidhirpean steal, fold an aghaidh steal, ìrean showdown\u2026), agus slaod e ma tha e a\u2019 falach rudeigin.',
              'Chan eil fios aig an HUD ach air na chunnaic thu aig na bùird agad fhèin — leughaidh e na logaichean làmhan ionadail agad, agus mar sin feumaidh clàradh a bhith air, agus cha bhi na h-àireamhan brìoghmhor ach às dèidh làmhan gu leòr. \u2019S e feart beta a th\u2019 ann, dheth a ghnàth: cuir air e ann an Roghainnean adhartach \u2192 Taic.'] },
        { id: 'handsbtn', t: 'Geàrr-shealladh nam measgachaidhean',
          b: ['Fosglaidh ìomhaigheag làmhan a\u2019 phoker air an aodach geàrr-shealladh luath de na 10 measgachaidhean uair sam bith — feumail fhad \u2019s a tha thu ag ionnsachadh. Gabhaidh a falach sna Roghainnean adhartach.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Cabadaich agus sòisealta',
      sections: [
        { id: 'panels', t: 'Cabadaich an lobaidh agus cabadaich a\u2019 bhùird',
          b: ['Tha aon chabadaich san lobaidh agus tè eile aig a\u2019 bhòrd. Air an fhòn snàmhaidh cabadaich a\u2019 bhùird os cionn a\u2019 gheama; air sgrìnichean nas motha \u2019s e uinneag ghluasadach le meud atharrachail a th\u2019 innte. Cunntaidh bràiste air putan na cabadaich na teachdaireachdan gun leughadh.'] },
        { id: 'typing', t: 'Cuideachadh le sgrìobhadh',
          list: [
            'Coilionaidh Tab far-ainm — brùth Tab a-rithist gus gluasad tro na maidsean.',
            'Gluaisidh \u2191 / \u2193 tro eachdraidh nan teachdaireachdan agad fhèin.',
            'Fosglaidh am putan emoji taghadair slàn; molaidh sgrìobhadh : emotes cuideachd fhad \u2019s a tha thu a\u2019 sgrìobhadh.'] },
        { id: 'emotes', t: 'Emotes agus gnùisean',
          b: ['Tionndaidhidh a\u2019 chabadaich còdan emote dìreach mar a nì an cliant deasg oifigeil: sgrìobh ainm eadar dà chòilean agus thig e gu bhith na emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 tha taic ann do chòrr air 1 900 còd (seata slàn GitHub). Thèid gnùisean teacsa clasaigeach a thionndadh cuideachd: :-) ;) :D xD :P <3 agus mu cheithir fichead eile.',
              'Fosglaidh sgrìobhadh : bogsa mholaidhean a choilionas an còd fhad \u2019s a tha thu a\u2019 sgrìobhadh (\u2191/\u2193 airson taghadh, Tab no Enter airson gabhail ris). Gabhaidh an tionndadh emoji a chur dheth gu tur ann an Roghainnean adhartach \u2192 Cabadaich.'] },
        { id: 'commands', t: 'Àitheantan na cabadaich',
          b: ['Tuigidh a\u2019 chabadaich àitheantan le slais. Tha dhà dhiubh ri fhaicinn do chàch:'],
          keys: [
            ['/me <teacsa>', 'Teachdaireachd gnìomh, air a sealltainn mar \u201c* dofhar-ainm teacsa\u201d'],
            ['/emoji <emoji>', 'Cluichidh e freagairt emoji (an tè cheudna a chuireas an taghadair fhreagairtean)']] },
        { id: 'diagcmds', t: 'Àitheantan sgrùdaidh',
          b: ['Tha a h-uile càil eile ionadail: chan fhaic ach thusa na freagairtean agus cha tèid dad a chur chun bhùird. Sgrìobh /help gus an liostachadh uile. An fheadhainn as feumaile:'],
          keys: [
            ['/help', 'Liostaich a h-uile àithne'],
            ['/update', 'Thoir sùil airson tionndadh ùr agus ath-luchdaich'],
            ['/lang <còd>', 'Atharraich cànan (m.e. /lang gd)'],
            ['/sound on|off', 'Cuir air / mùch fuaimean a\u2019 gheama'],
            ['/zoom', 'Toglaich glainne-mheudachaidh a\u2019 bhùird'],
            ['/clear', 'Falamhaich a\u2019 chabadaich gu h-ionadail'],
            ['/table', 'Fiosrachadh mun gheama làithreach (blinds, cluicheadairean, cruachan)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Sgrùdaidhean air staid a\u2019 chliant, an lìonra agus an rèidhead'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Dì-bhugachadh adhartach (cairtean, pròtacal, fuaim, stòradh, suidheachan)'],
            ['/copy', 'Dèan lethbhreac den fhreagairt àithne mu dheireadh gun stòr-bhòrd']] },
        { id: 'reactions', t: 'Freagairtean emoji',
          b: ['Fosglaidh putan nam freagairtean taghadair le 30 freagairt bheòthaichte (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) a chluicheas le buaidh os cionn an t-suidheachain agad, ri fhaicinn don bhòrd gu lèir — a\u2019 gabhail a-steach cluicheadairean a\u2019 chliant deasg. Gabhaidh na freagairtean a chur dheth gu tur sna Roghainnean adhartach.'] },
        { id: 'translate', t: 'Tuig a h-uile duine',
          b: ['Le eadar-theangachadh na cabadaich air, nochdaidh putan eadar-theangachaidh air an loidhne fon tomhaire — no air an loidhne air an gnog thu, air sgrìn-suathaidh — agus seallaidh e an teachdaireachd sin nad chànan fhèin le eadar-theangair a’ bhrabhsair. Faodar a shealltainn an-còmhnaidh air a h-uile loidhne ann an Roghainnean adhartach → Cabadaich, far a bheil am moladh a mhìnicheas giorrachaidhean cumanta a’ bhòrd (gg, nh, utg…) a’ fuireach cuideachd.'],
          note: 'Cleachdaidh an t-eadar-theangachadh seirbheis Google Translate agus obraichidh e ann am brabhsair sam bith — chan fheumar ach ceangal ris an eadar-lìon. Cha tèid teachdaireachd a chur chun t-seirbheis eadar-theangachaidh ach nuair a shuathas tu am putan eadar-theangachaidh aice, cha tèid a-riamh gu fèin-obrachail.' },
        { id: 'social', t: 'Cluicheadairean: pròifil, cuireadh, leigeil seachad',
          b: ['Suath cluicheadair sam bith — aig a\u2019 bhòrd no air liosta an lobaidh — gus a chairt fhosgladh: pròifil is staitistigean, cuireadh dhan gheama agad, no a leigeil seachad (thèid na teachdaireachdan cabadaich aige fhalach; gabhaidh an leigeil seachad a thoirt air ais uair sam bith). Gabhaidh dearbhadh ro chuireadh/leigeil seachad a chur air sna roghainnean.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobaidh agus geamannan',
      sections: [
        { id: 'list', t: 'Liosta nan geamannan',
          b: ['Liostaichidh an lobaidh a h-uile bòrd air an fhrithealaiche. Seallaidh gach loidhne an àireamh chluicheadairean, seòrsa a\u2019 gheama, glas nuair a dh\u2019fheumar facal-faire no cuireadh, agus bràiste staide: \u201cA\u2019 feitheamh\u201d (uaine — cha do thòisich an geama, faodaidh tu tighinn a-steach ma tha àite saor ann), \u201cA\u2019 dol\u201d (dath blàth — ri fhaicinn beò nuair a tha luchd-amhairc ceadaichte) agus \u201cDùinte\u201d (doilleir). Aithnichear bòrd làn gu sìmplidh air a\u2019 chunntair làn, mar 10/10; leanaidh dathan nam bràistean an ùrlar gnìomhach.',
              'Cumhnaichidh an clàr-sìolaidh an liosta dìreach mar a nì an cliant deasg, gach roghainn nas cruaidhe na an tè roimhpe: dìreach geamannan fosgailte \u2192 a\u2019 falach nam bòrd làn cuideachd \u2192 an uair sin dìreach an fheadhainn nach eil prìobhaideach, dìreach an fheadhainn phrìobhaideach, no dìreach geamannan rangachaidh. Thèid do roghainn a chuimhneachadh. Lorgaidh an raon-luirg geama a-rèir ainm, agus fosglaidh bràiste nan cluicheadairean liosta a h-uile duine air-loidhne, le lorg is seòrsachadh.'] },
        { id: 'join', t: 'Tighinn a-steach agus coimhead',
          b: ['Tagh geama fosgailte agus thig a-steach — tha glas a\u2019 sealltainn gum feumar facal-faire. Gabhaidh geamannan a tha a\u2019 dol agus a leigeas le luchd-amhairc am faicinn beò: chì thu am bòrd agus a\u2019 chabadaich, ach fanaidh na cairtean dùinte falaichte agus chan urrainn dhut gnìomh a dhèanamh.'] },
        { id: 'gameinfo', t: 'Fiosrachadh a\u2019 gheama',
          b: ['Mus tig thu a-steach, seallaidh cairt fiosrachaidh a\u2019 gheama a h-uile càil a mhìnicheas am bòrd: seòrsa a\u2019 gheama, na blinds agus mar a dh\u2019èireas iad (dùblachadh no liosta làimhe), a\u2019 chruach thòiseachaidh, an ùine gnìomh, an stad eadar làmhan, agus cò a tha nan suidhe mu thràth.'] },
        { id: 'create', t: 'Cruthaich geama',
          b: ['Cruthaich do bhòrd fhèin: ainm, àireamh chluicheadairean, cruach thòiseachaidh, a\u2019 chiad small blind agus clàr nan àrdachaidhean, an ùine gnìomh, agus a bheil luchd-amhairc ceadaichte. Tha ceithir seòrsaichean gheamannan ann: Àbhaisteach (a h-uile duine), dìreach cluicheadairean clàraichte, dìreach le cuireadh, agus Rangachaidh (cunntar e airson a\u2019 chlàir oifigeil — chan eil facal-faire comasach san t-suidheachadh sin). Gabhaidh na roghainnean as fheàrr leat a shàbhaladh agus an ath-luchdachadh.'] },
        { id: 'invites', t: 'Cuiridhean',
          b: ['\u2019S urrainn do chluicheadairean cuireadh a thoirt dhut chun bhùird aca; gheibh thu brath as urrainn dhut gabhail ris no a dhiùltadh. \u2019S e cuireadh fhaighinn an aon dòigh air faighinn a-steach do gheama a tha dìreach le cuireadh.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'An cunntas agad',
          b: ['\u2019S e pokerth.net am frithealaiche eadar-lìn oifigeil. Feumaidh cluich an sin cunntas pokerth.net an-asgaidh — clàraich air an làrach-lìn, an uair sin clàraich a-steach an seo leis an aon fhar-ainm agus facal-faire. Ceanglaidh an cliant lìn seo ris an dearbh fhrithealaiche ris an ceangail an cliant deasg: na h-aon chunntasan, na h-aon bhùird, na h-aon chlàran, agus \u2019s urrainn dhut suidhe aig bòrd le cluicheadairean a\u2019 chliant deasg.'] },
        { id: 'ranked', t: 'Geamannan rangachaidh agus seusanan',
          b: ['Cunntar geamannan den t-seòrsa Rangachaidh airson clàr oifigeil an t-seusain. Seallaidh a\u2019 phròifil agad san aplacaid ceann-là a\u2019 chlàraidh agad, an Rank agad airson an t-seusain làithrich, an Score agad, an cuibheasachd agad agus na geamannan a chluich thu, cuide ris na toraidhean as ùire. Chan eil ann an geamannan àbhaisteach (gun rangachadh) ach spòrs agus chan atharraich iad dad.'] },
        { id: 'rankhow', t: 'Mar a thèid an rangachadh a thomhas',
          b: ['Anns gach geama rangaichte bidh an t-àite agad a\u2019 cosnadh phuingean: 15 airson a\u2019 chiad àite, an uair sin 9, 6, 4, 3, 2 agus 1 sìos chun an t-seachdamh; on ochdamh chun an deicheamh, chan eil dad. Mar sin bidh bòrd a\u2019 roinn 40 puing gu lèir.',
              'Chan e suim nam puingean sin a th\u2019 anns an Score agad ach a\u2019 chuibheasachd agad gach geama, air a mhaothachadh le factar a dh\u2019fhàsas leis an àireamh de gheamannan a chluich thu: chan eil beagan deagh thoraidhean gu leòr gus fuireach aig a\u2019 mhullach, tha cunbhalachd a dhìth cuideachd — mar as motha a chluicheas tu, \u2019s ann as fhaisge a thig an Score agad air an fhìor chuibheasachd agad. Mairidh seusan cairteal: nuair a thig an t-atharrachadh thèid a h-uile càil a thasglannachadh agus tòisichidh na cunntairean o neoni a-rithist, ach fanaidh seusanan a chaidh seachad rim faicinn. Anns a\u2019 gheama seallaidh am putan pòdiaim rangachadh an t-seusain aig na cluicheadairean aig a\u2019 bhòrd agad.'],
          note: '\u2019S e frithealaiche rangachaidh pokerth.net a shuidhicheas an sgèile phuingean agus am foirmle mhionaideach, agus faodaidh iad atharrachadh; \u2019s iad duilleagan na làraich a tha ceart.' },
        { id: 'rankings', t: 'Duilleagan nan clàran',
          b: ['Fosglaidh an t-innteart clàran clàr oifigeil PokerTH, a ghabhas sireadh a-rèir cluicheadair, cho math ri clàran na coimhearsnachd (BBC, WEC). Mura h-eil ùidh agad sna clàran, gabhaidh an t-innteart fhalach ann an Roghainnean adhartach \u2192 Coimhearsnachd.'] },
        { id: 'cups', t: 'Cupannan na coimhearsnachd: BBC agus WeCup',
          b: ['Bidh dà choimhearsnachd a\u2019 ruith am farpaisean fhèin air pokerth.net, gach tè le a làrach-lìn fhèin agus a rangachadh fhèin. \u2019S e farpais cheumnach a rugadh ann an 2013 a th\u2019 anns a\u2019 Best Brainies Cup (BBC): thèid thu suas o Step 1 gu Step 4, agus tòisichidh seusan ùr às dèidh gach geama Step 4, nuair a thèid an cupa a thoirt seachad. Tha sgèile fhèin aig a\u2019 WeCup (WEC), fada nas sgaoilte — 75 puing airson a\u2019 chiad àite, an uair sin 45, 30, 20… — agus bidh an score aige a\u2019 normalachadh na cuibheasachd agad a-rèir na h-àireimh de gheamannan a chluich thu an coimeas ris na buill eile.',
              'Fosglaidh an dà rangachadh on phutan chupa, ri taobh rangachadh PokerTH. Tha roghainnean bùird nam farpaisean seo rim faighinn mar ro-shocraichidhean nuair a chruthaicheas tu geama (BBC Step 1 gu 4, WEC, WEC Monthly Final agus WEC Grand Final), agus mar sin \u2019s urrainn dhut cleachdadh a dhèanamh fon aon suidheachadh. Feumaidh tu clàradh air làrach a\u2019 chupa a tha fa-near gus pàirt a ghabhail.'],
          note: 'Mura h-eil ùidh agad ann an cupannan, falaichidh tu an t-susbaint seo uile aig an aon àm ann an Roghainnean adhartach → Coimhearsnachd.' },
        { id: 'forumcups', t: 'Cupannan an fhòraim agus tachartasan',
          b: ['Bidh fòram pokerth.net a\u2019 cumail a\u2019 Monthly Cup cuideachd, sreath mhìosail far a bheil na cluicheadairean air an sgaoileadh air bùird Gold, Silver agus Bronze mus tèid curaidh na mìosa a chrùnadh, agus cupannan sònraichte fa leth tron bhliadhna.',
              'Thèid clàraidhean, amannan, roghainnean bùird agus toraidhean fhoillseachadh air an fhòram, agus thèid na geamannan a chluich air an fhrithealaiche oifigeil mar a h-uile geama eile. Tha cunntas pokerth.net gu leòr gus na toraidhean a leantainn; thèid clàradh airson cupa tron t-snàithlean fòraim a bhuineas dha.'] },
        { id: 'avatars', t: 'Avataran agus brataichean',
          b: ['Air pokerth.net thèid an t-avatar agad a sgaoileadh gu cluicheadairean eile tron fhrithealaiche avatar, agus faodaidh bratach bheag dùthcha nochdadh air bogsaichean nan cluicheadairean. Tha an dà chuid roghainneil agus gan rèiteachadh sna roghainnean.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Modh trèanaidh',
      sections: [
        { id: 'what', t: 'Dè a th\u2019 ann',
          b: ['\u2019S e geama slàn an aghaidh farpaisich fo smachd a\u2019 choimpiutair a th\u2019 anns a\u2019 mhodh Ionadail / trèanadh: gun cheangal, gun chunntas, gun dad an geall. Aon uair \u2019s gu bheil an aplacaid stàlaichte (no eadhon dìreach air tadhal aon turas), obraichidh i gu tur far-loidhne — foirfe airson an geama ionnsachadh, an eadar-aghaidh fheuchainn no ùine a chur seachad ann am modh itealain.'] },
        { id: 'setup', t: 'Cuir geama air dòigh',
          b: ['Tagh an àireamh de dh\u2019fharpaisich, a\u2019 chruach thòiseachaidh, na blinds agus mar a dh\u2019èireas iad, agus astar a\u2019 gheama. Thèid dèanamh suas agus duilgheadas nam bot a ghleusadh ann an Roghainnean adhartach \u2192 Geama ionadail — o fharpaisich shocair gu bòrd nas cruaidhe agus nas measgaichte.'] },
        { id: 'trophies', t: 'Duaisean',
          b: ['Tha adhartas fhèin aig a\u2019 mhodh trèanaidh: fosglar 28 duaisean ann an sia roinnean (adhartas, dòigh-obrach, stoidhle, cruthan, spòrs agus tè dhìomhair) le bhith a\u2019 cluich — làmhan a chluich thu, geamannan a bhuannaich thu, bluffan mòra, làmhan sònraichte agus barrachd. Tha adhartas nan duaisean cruinneachail agus thèid a cho-mheasgachadh eadar innealan nuair a tha sioncronachadh roghainnean a\u2019 chunntais air.'] },
        { id: 'learn', t: 'Deagh àite airson ionnsachadh',
          b: ['Obraichidh a h-uile càil a tha air a mhìneachadh sna caibideilean eile an seo cuideachd: am monatair coltachd, taisbeanadh na taice, an ro-thaghadh, na h-ath-ghoiridean meur-chlàir. \u2019S e am modh trèanaidh an t-àite as fheàrr airson am feuchainn gun chuideam mus tilg thu thu fhèin a-steach do pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stoidhle agus fuaim',
      sections: [
        { id: 'themes', t: 'Ùrlaran',
          b: ['Cuiridh roinn Stoidhle nan Roghainnean adhartach aodach air a\u2019 chliant gu lèir. Suidhichidh na ro-shocraichidhean a h-uile càil le aon shuathadh (an casino uaine clasaigeach, coltas oifigeil PokerTH\u2026); fodhpa, gleusaidh aiseanan fa leth am pailead dhathan, aodach a\u2019 bhùird agus aghaidhean nan cairtean air leth — atharraich aisean sam bith agus thig am measgachadh agad gu bhith na ùrlar gnàthaichte. Thathar a\u2019 taghadh modh dorcha, soilleir no fèin-obrachail ann an Eadar-aghaidh a\u2019 chleachdaiche, agus bidh na roghainnean agad an gnìomh sa bhad, air gach sgrìn, agus thèid an cuimhneachadh.'] },
        { id: 'tablelook', t: 'Bùird, pacaidean, suidheachan',
          b: ['A bharrachd air an ùrlar, gabhaidh grunn eileamaidean atharrachadh gu neo-eisimeileach: cùl-raon a\u2019 bhùird, pacaid nan cairtean, cùl nan cairtean (a\u2019 freagairt ris a\u2019 phacaid gu fèin-obrachail, no in-phortaich an dealbh agad fhèin), sligean an neach-riarachaidh agus nam blinds, stoidhle nam putanan gnìomh, agus pacaidean suidheachain slàn a chuireas aodach ùr air bogsaichean nan cluicheadairean. Tagh a h-uile càil ann an Roghainnean adhartach \u2192 Stoidhle; chithear na h-atharrachaidhean sa bhad aig a\u2019 bhòrd.'] },
        { id: 'music', t: 'Cluicheadair ciùil',
          b: ['Fosglaidh an t-innteart ciùil ann an clàran a\u2019 bhanna-chinn cluicheadair beag airson ceòl cùl-raoin: tagh òran on liosta-chluich, cluich/stad, roimhe/às dèidh, tuaireamach, agus ath-chluich aon òrain, na liosta gu lèir no dad. Thèid an àirde-fuaim, an t-òran a thagh thu agus am modh ath-chluich a chuimhneachadh. Cha tòisich a\u2019 chluich leatha fhèin a-riamh — iarraidh brabhsairean suathadh — agus tha an cluicheadair gu tur neo-eisimeileach o bhuaidhean fuaim a\u2019 gheama.'] },
        { id: 'sounds', t: 'Buaidhean fuaim',
          b: ['Tha fuaimean a\u2019 gheama air an cruinneachadh ann an ceithir roinnean a ghabhas cur air fa leth, dìreach mar a tha sa chliant deasg: gnìomhan geama (cairtean gan riarachadh, Check, Call, Raise, do thuras\u2026), brath cabadaich an lobaidh, brathan geama lìonraidh (cluicheadair air ceangal, geama deiseil) agus brath àrdachadh nam blinds. Stiùiridh aon sleamhnachan àirde-fuaim iad uile, ann an Roghainnean adhartach \u2192 Fuaim.'],
          note: 'Diùltaidh a h-uile brabhsair — iOS gu h-àraidh — fuaim a chluich mus do shuath thu an duilleag aon uair. Ma thòisicheas geama nad shàmhchair, dùisgidh aon shuathadh àite sam bith am fuaim; càraichidh an cliant an einnsean fuaime gu fèin-obrachail cuideachd nuair a chuireas iOS stad air (gairm a\u2019 tighinn a-steach, cùl-raon\u2026).' },
        { id: 'voice', t: 'Guth agus crith',
          b: ['\u2019S urrainn do dhà shianal a bharrachd fios a chumail riut gun a bhith a\u2019 coimhead air an sgrìn: leughaidh na h-innsidhean guth tachartasan a\u2019 gheama a-mach àrd tro cho-chur cainnte an inneil agad, agus air an fhòn faodaidh crith ghoirid do thuras a chomharrachadh. \u2019S e leudachain lìn a th\u2019 anns an dà chuid, air no dheth a ghnàth a-rèir an inneil, ann an Roghainnean adhartach \u2192 Geallan agus turas.'],
          note: 'Obraichidh crith air Android (brabhsairean Chromium); chan eil Apple a\u2019 toirt API crith do làraich-lìn, agus mar sin chan urrainn do iPhone crith. Obraichidh na h-innsidhean guth anns a h-uile àite, ach tha na guthan agus na cànanan a tha ri fhaotainn an eisimeil an t-siostaim agad — cleachdaidh an cliant am maids as fheàrr a lorgas e.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Roghainnean agus ath-ghoiridean',
      sections: [
        { id: 'where', t: 'Càite a bheil na roghainnean',
          b: ['Fosglar na Roghainnean adhartach on innteart gèar ann an clàr banna-chinn sam bith. Tha iad air an cruinneachadh mar a tha sa chliant deasg: Eadar-aghaidh a\u2019 chleachdaiche, Stoidhle, Fuaim, Geama ionadail, Geama lìonraidh, Geama eadar-lìn, Far-ainmean / Avataran, Teachdaireachdan loga, agus Aisig na bun-roghainnean. Tha suidse fhèin aig gach feart a tha sònraichte don lìon an sin, agus mar sin \u2019s urrainn dhut a h-uile càil nach cleachd thu a chur dheth.'] },
        { id: 'cfgxml', t: 'Roghainnean iomlaid leis a\u2019 chliant deasg',
          b: ['\u2019S urrainn do na roghainnean agad siubhal eadar cliantan: tha roinn nan Teachdaireachdan loga a\u2019 tabhann às-phortadh/in-phortadh an fhaidhle oifigeil config.xml (an \u007e/.pokerth/config.xml sin a chleachdas na cliantan deasg agus QML). Sgrìobhaidh an t-às-phortadh na roghainnean co-roinnte — ainm, roghainnean taisbeanaidh, fuaimean, roghainnean bùird, blinds, stoidhlean — agus cuiridh an t-in-phortadh faidhle on deasg an sàs an seo. Fanaidh roghainnean nach aithne don chliant seo gun bhean san fhaidhle.'] },
        { id: 'sync', t: 'Roghainnean a leanas thu',
          b: ['Nuair a chluicheas tu le cunntas, thèid na roghainnean agad, an t-ùrlar agad, na ceanglaichean iuchrach agad, an cànan agad agus na duaisean trèanaidh agad a shioncronachadh: atharraich rudeigin air aon inneal agus togaidh an ath inneal air an clàraich thu a-steach e. Thèid adhartas nan duaisean a cho-mheasgachadh, cha tèid a sgrìobhadh thairis a-riamh, agus mar sin cumaidh cluich air dà inneal an rud as fheàrr on dà chuid an-còmhnaidh.'] },
        { id: 'updates', t: 'Fuirich cùrsach',
          b: ['Ùraichidh an cliant e fhèin: nuair a thèid tionndadh ùr a sgaoileadh, iarraidh bratach ort ath-luchdachadh (no sgrìobh /update sa chabadaich airson sgrùdadh làimhe). O àm gu àm faodaidh suirbhidh bheag toraidh nochdadh a dh\u2019fhaighnicheas do bheachd air feart — tha com-pàirteachadh roghainneil, agus gabhaidh na suirbhidhean a chur dheth gu tur ann an Roghainnean adhartach \u2192 Coimhearsnachd.'] },
        { id: 'fkeys', t: 'Ath-ghoiridean meur-chlàir oifigeil',
          b: ['Bidh iuchraichean gn\u00ecomh oifigeil PokerTH ag obair ann an geama \u2014 tha Alt+S ag obair \u00e0ite sam bith:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (gabhaidh an t-òrdugh tionndadh sna roghainnean)'],
            ['F5', 'Seall na cairtean agad (nuair a tha e comasach)'],
            ['F6 / F7 / F8', 'Làimhe \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Làimhe \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Cabadaich \u00b7 Loga \u00b7 Panail nan coltasan'],
            ['Alt+S', 'Roghainnean — àite sam bith san aplacaid, chan ann a-mhàin ann an geama'],
            ['F11', 'Làn-sgrìn']],
          note: 'Feumaidh na h-ath-ghoiridean meur-chlàr fiosaigeach. Air Mac, stiùiridh na h-iuchraichean F na meadhanan a ghnàth: cùm Fn sìos (no cuir air \u201cCleachd na h-iuchraichean F1, F2 msaa mar iuchraichean gnìomh àbhaisteach\u201d ann an roghainnean macOS). Air iPhone, tha iOS a\u2019 cuingealachadh na làn-sgrìn — bheir stàladh na h-aplacaid mar PWA an aon eòlas làn-sgrìn dhut.' },
        { id: 'webkeys', t: 'Iuchraichean litreach lìn',
          b: ['Leudachadh lìn: bidh iuchraichean aon-litreach agus Alt+T cuideachd a’ cur gnìomhan air bhog, agus gabhaidh iad uile ath-shuidheachadh ann an Roghainnean adhartach → Ath-ghoiridean:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Panail nan staitistig'],
            ['Esc', 'Dùin an uinneag aghaidh (agus putan Air ais Android)']],
          note: 'Air Android, dùinidh putan/gluasad Air ais an t-siostaim uinneagan mar Esc, seach a bhith a\u2019 fàgail a\u2019 gheama (gabhaidh a rèiteachadh sna roghainnean). Chan eil putan siostaim co-ionann aig iOS — cleachd an \u2715 aig gach uinneig.' }
      ]
    }
  ]
};
