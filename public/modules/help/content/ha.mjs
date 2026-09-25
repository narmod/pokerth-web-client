// ── help/content/ha.mjs — Hausa (Hausa) help corpus ────────────────────
//
// Same structure as en.mjs (reference): chapters[] → { id, icon, title,
// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand
// names of the rules chapter stay in English, as in the other help corpora.
export const help = {
  chapters: [
    {
      id: "start", icon: "🚀", title: "Farawa",
      sections: [
        { id: "modes",
          t: "Hanyoyi uku na wasa",
          b: [
            "A allon shiga, zaɓi yadda kake so ka yi wasa."],
          list: [
            "Intanet — yi wasa a kan layi a sabar hukuma ta pokerth.net tare da matsayi. Ana buƙatar asusun pokerth.net; yi rajista kyauta a pokerth.net.",
            "Na gida / horo — yi wasa ba tare da intanet ba da bots. Babu abin da za a saita, yana aiki ba tare da haɗi ba kuma yana buɗe kofuna yayin da kake ci gaba.",
            "LAN / Keɓaɓɓiyar sabar — haɗa da sabar PokerTH ta sirri a hanyar sadarwarka ta gida ko a kwamfutarka."] },
        { id: "lan",
          t: "LAN / keɓaɓɓiyar sabar",
          b: [
            "Yanayi na uku yana haɗawa da kowace sabar PokerTH da kai ko aboki ke gudanarwa — a hanyar sadarwar gida, a VPS na sirri, a ko'ina. Shigar da adireshi da tashar haɗin sabar, yi alama a TLS idan sabar tana amfani da tashar da aka ɓoye, kuma shiga da laƙabi (shiga a matsayin baƙo yana aiki idan sabar ta yarda). Daga nan komai a tebur yana aiki kamar a sabar hukuma."] },
        { id: "famboard",
          t: "Jerin manyan 'yan wasan iyali",
          b: [
            "A sabar sirri da wasannin LAN kawai, abokin ciniki yana riƙe ƙididdigar gaba ɗaya ga kowane laƙabi — hannaye da wasannin da aka buga da aka ci, mafi girman nasara, mafi kyawun jerin nasara — kuma yana raba su ta sabar don kowace na'ura a kusa da tebur ta ga jeri ɗaya. Ba a taɓa bibiyar wasannin pokerth.net haka ba, kuma ana adana ƙididdigar yanayin horo daban gaba ɗaya.",
            "A cikin waɗannan wasanni, maɓallin kofi yana buɗe tagar matsayi a shafin LAN: duk 'yan wasa, ana iya jera su bisa ma'auni da yawa."] },
        { id: "language",
          t: "Harshe",
          b: [
            "Fuskar tana samuwa cikin harsuna 81. Canja ta a kowane lokaci a cikin Zaɓuɓɓuka na ci gaba (menu na giya) ƙarƙashin Fuskar mai amfani. Kalmomin motsin poker (Fold, Check, Call, Bet, Raise, All-In) suna zama da Turanci bisa al'ada, kamar a manhajar kwamfuta. Sunayen hannayen poker ma suna zama da Turanci."] },
        { id: "pwa",
          t: "Sanya a matsayin manhaja",
          b: [
            "Wannan abokin ciniki Progressive Web App ne: za ka iya sanya shi daga menu na burauzarka (ko maɓallin sanyawa a saman shafi) don samun manhaja ta cikakken allo mai alamarta. Da zarar an sanya shi, yana buɗewa nan take kuma yanayin horo yana aiki gaba ɗaya ba tare da intanet ba."],
          note: "A Android da Chrome/Edge na kwamfuta, maɓallin sanyawa yana yin komai. A iPhone/iPad Apple yana ba da damar sanyawa ta Safari kawai: maɓallin Raba → “Ƙara zuwa Allon Gida” — abokin ciniki yana nuna waɗannan matakan idan ana buƙata. Maɓallin yana ɓacewa da zarar an sanya manhajar." },
        { id: "platforms",
          t: "Dandamali da burauzoji",
          b: [
            "Abokin ciniki yana aiki a kowace burauza ta zamani a kowane tsari — Windows, macOS, Linux, Android, iOS. Wasu fasaloli sun dogara da sabbin API na burauza; idan API ya ɓace, fasalin yana ɓoye kansa ko ya bayyana dalili maimakon ya lalace. Manyan bambance-bambancen da ya kamata a sani:"],
          list: [
            "Chrome / Edge (kwamfuta): komai yana aiki, har da rubuta log na .pdb a babban fayil.",
            "Firefox: komai sai rubuta log na .pdb a babban fayil (API ɗin bai samu ba tukuna).",
            "Safari / iOS: sanyawa ta Raba → Ƙara zuwa Allon Gida; babu girgiza; cikakken allo yana da iyaka a iPhone; sauti yana farawa bayan taɓawarka ta farko.",
            "Android: cikakken tallafi a burauzojin Chromium, har da girgiza da halayyar maɓallin Baya."] },
        { id: "avatar",
          t: "Laƙabi da avatar",
          b: [
            "Zaɓi laƙabinka da avatar ɗinka a allon shiga kafin ka haɗa. A pokerth.net, laƙabinka shi ne sunan asusunka; ana raba avatar da sauran 'yan wasa ta sabar avatar.",
            "Ana aika avatar ɗinka lokacin haɗawa, kuma duk 'yan wasa suna ganin iri ɗaya. Idan ka canja shi yayin da kake haɗe, sabon avatar zai fara aiki daga haɗinka na gaba. Ba a aika harafin farko (Aa) ba: sauran 'yan wasa suna ganin avatar na asali."] }
      ]
    },
    {
      id: "rules", icon: "🃏", title: "Ƙa'idojin poker",
      sections: [
        { id: "basics",
          t: "Texas Hold’em a taƙaice",
          b: [
            "PokerTH yana buga No-Limit Texas Hold’em. Kowane ɗan wasa yana samun katuna biyu na sirri (katunan aljihu). Sannan ana ajiye katunan jama'a guda biyar a buɗe a tsakiyar tebur. Mafi kyawun hannu na katuna biyar daga kowace haɗuwar katunanka biyu da katunan jama'a biyar ne ke cin pot."] },
        { id: "blinds",
          t: "Blinds da maɓallin mai rabawa",
          b: [
            "Kafin kowane hannu, caca biyu na tilas suna fara pot: ƙaramin blind da babban blind, waɗanda 'yan wasa biyu da ke hagu da maɓallin mai rabawa ke sanyawa. Maɓallin yana matsawa kujera ɗaya bisa hanyar agogo bayan kowane hannu, don haka kowa yana biyan blinds bi-da-bi. Blinds suna ƙaruwa lokaci-lokaci yayin da wasa ke ci gaba.",
            "A tebur, ana yi wa maɓalli da blinds alama da fayafai: D (mai rabawa), SB (ƙaramin blind), BB (babban blind)."] },
        { id: "streets",
          t: "Zagaye huɗu na caca",
          list: [
            "Pre-flop — bayan raba katunan aljihu, zagayen farko yana farawa daga hagu da babban blind.",
            "Flop — ana bayyana katunan jama'a uku, sannan zagayen caca.",
            "Turn — katin jama'a na huɗu, sannan wani zagayen caca.",
            "River — katin jama'a na biyar kuma na ƙarshe, sannan zagayen caca na ƙarshe."],
          b: [
            "Zagayen caca yana ƙarewa idan kowane ɗan wasa da ke cikin hannu ya saka adadi ɗaya a pot (ko yana all-in)."] },
        { id: "actions",
          t: "Abin da za ka iya yi a lokacinka",
          list: [
            "Fold — bar hannun. Ana jefar da katunanka kuma ba ka cikin gasar pot kuma.",
            "Check — wuce ba tare da caca ba. Yana yiwuwa ne kawai idan babu abin da za a yi call.",
            "Call — daidaita cacar yanzu.",
            "Bet — buɗe caca idan babu wanda ya yi caca a wannan zagaye.",
            "Raise — ƙara cacar da ke akwai. Mafi ƙarancin raise daidai yake da caca ko raise na baya.",
            "All-In — saka duk tarinka. Kana cikin hannu har zuwa adadin da ka rufe."] },
        { id: "showdown",
          t: "Showdown da pot da aka raba",
          b: [
            "Idan fiye da ɗan wasa ɗaya ya rage bayan zagayen caca na river, ana bayyana katuna kuma mafi kyawun hannu ne ke nasara — ana nuna hannun nasara a ƙarƙashin katunan jama'a. Idan ɗan wasa yana all-in da ƙasa da cikakken caca, ana ƙirƙirar pot na gefe: kowane ɗan wasa zai iya cin sashen pot da ya ba da gudummawa kawai. Hannaye daidai suna raba pot.",
            "Ba kowa ne dole ya nuna ba: farawa daga ɗan wasan da ya yi caca ko raise na ƙarshe, ana bayyana hannu ne kawai idan ya doke abin da aka riga aka nuna. Duk wanda ke da haƙƙin jefar da katunansa yana ɓoye su kuma yana samun maɓallin Nuna don bayyana su duk da haka."] },
        { id: "hands",
          t: "Tsarin hannaye",
          b: [
            "Daga mafi rauni zuwa mafi ƙarfi:"],
          list: [
            "1. High Card — babu haɗuwa; kati mafi girma ne ke yanke hukunci.",
            "2. One Pair — katuna biyu masu ƙima ɗaya.",
            "3. Two Pair — pair biyu daban-daban.",
            "4. Three of a Kind — katuna uku masu ƙima ɗaya.",
            "5. Straight — katuna biyar a jere (ana ƙirga Ace babba ko ƙarami).",
            "6. Flush — katuna biyar masu launi ɗaya.",
            "7. Full House — Three of a Kind da pair.",
            "8. Four of a Kind — katuna huɗu masu ƙima ɗaya.",
            "9. Straight Flush — straight duka masu launi ɗaya.",
            "10. Royal Flush — daga Goma zuwa Ace, duka masu launi ɗaya. Mafi kyawun hannu da ake iya samu."] }
      ]
    },
    {
      id: "game", icon: "🎮", title: "Allon wasa",
      sections: [
        { id: "actionbar",
          t: "Sandar motsi",
          b: [
            "Idan lokacinka ne, sandar motsi da ke ƙasa tana haskakawa da maɓallai har huɗu: Fold (ja), Check / Call (shuɗi), Bet / Raise (kore — babban motsi da aka haskaka) da All-In (ja mai duhu). Maɓallin Check / Call yana nuna ainihin adadin da za a yi call; Bet / Raise yana nuna adadin da kake shirin sakawa. Bayan river, All-In zai iya zama maɓallin Nuna don bayyana katunanka."] },
        { id: "betctl",
          t: "Zaɓar cacarka",
          b: [
            "Saita adadin raise da filin lamba, madaidaicin ja ko maɓallai masu sauri 1/3 · 1/2 · Pot (rabon pot na yanzu). Ana zagaye adadi kai tsaye kuma ana riƙe su tsakanin mafi ƙanƙanci da mafi girman raise da aka yarda. Idan ka fi son tunani cikin manyan blinds, wani zaɓi yana nuna duk adadi cikin BB maimakon chips."] },
        { id: "preselect",
          t: "Zaɓar motsi tun kafin lokaci",
          b: [
            "Kafin lokacinka za ka iya shirya motsi tun da wuri: taɓa maɓalli kuma zai sami gefen zinare da ɗan digo na zinare. Idan lokacinka ya zo, motsin yana aiki nan take. Fold da aka zaɓa tun da wuri yana zama Check kai tsaye idan check kyauta ne — ba za ka taɓa yin fold a banza ba. Ana sake saita zaɓin da aka yi tun da wuri a kowane sabon hannu, canjin zagaye da showdown, kuma ana soke su idan yanayi ya canja (misali adadin call ya canja)."] },
        { id: "automodes",
          t: "Yanayin kai tsaye",
          b: [
            "Menu na zaɓi kusa da maɓallan motsi yana ba da yanayin wasa uku: Da hannu, Check/Call kai tsaye da Check/Fold kai tsaye. Yanayin kai tsaye suna yin wasa a madadinka har sai ka canja baya — kowane danna da hannu a kan motsi yana mayar da kai zuwa Da hannu nan take."] },
        { id: "readtable",
          t: "Karanta tebur",
          b: [
            "Akwatin kowane ɗan wasa yana nuna avatar, suna, tari da cacar yanzu. Ana yi wa mai rabawa da blinds alama da fayafai D / SB / BB. Alama mai launi a akwatin tana nuna motsin ƙarshe na ɗan wasa; siririn sanda shuɗi yana ƙirga lokacin tunaninsa. Akwatin ɗan wasan da lokacinsa ne yana haskakawa; akwatinka yana samun firam na zinare mai bugawa a lokacinka.",
            "Sandar yanayi da ke saman tebur tana nuna jimlar pot, cacar zagayen yanzu, mataki (Pre-flop, Flop, Turn, River) da lambobin wasa da hannu. Katunan 'yan wasan da suka yi fold suna rabin bayyane; 'yan wasan da aka fitar an dusashe su. A ƙarshen hannu, tagar mai nasara za ta iya taƙaita wanda ya ci me — ana iya kashe ta a cikin zaɓuɓɓuka."] },
        { id: "seatlayout",
          t: "Tsarin kujeru",
          b: [
            "A matsayin ƙarin yanar gizo, ana iya zaɓar tsarin akwatunan 'yan wasa a Zaɓuɓɓuka na ci gaba → Kujeru: Kai tsaye yana bin manhajar hukuma (wurare kafaffu a tsaye, da'irar da aka lissafa a kwance), ko tilasta tsarin A tsaye ko A kwance — kuma Na kanka yana ba ka damar sanya kowace kujera da kanka: yanayin gyara yana buɗewa inda za ka ja kowane akwati zuwa daidai inda kake so, kuma ana adana tsarin."] },
        { id: "zoom",
          t: "Zuƙowa na tebur (wayoyi)",
          b: [
            "A ƙananan allo, maɓallan madubin girma suna ƙara girman tebur (2×) kuma za ka iya matsar da shi da yatsa — sandar motsi kawai ce ke zama a wuri ɗaya; akwatinka ma ana ƙara girmansa, kuma kallo yana komawa gare shi idan lokacinka ne. Kallo yana bin kujerar da ke aiki kai tsaye kuma yana komawa baya don duban gaba ɗaya a showdown. Ana iya kashe wannan a cikin Zaɓuɓɓuka na ci gaba. A lokacinka, idan katunan jama'a suna waje da kallo, ƙaramin kwafinsu yana bayyana a saman tebur; taɓa shi don zuwa katunan da dawowa."],
          note: "A wayoyi da kwamfutocin hannu, zuƙowa ta tsunkule na burauza an toshe ta ta asali don kada motsin zuƙowa ya faru bisa kuskure a tsakiyar hannu; sake kunna ta a Zaɓuɓɓuka na ci gaba → Fuskar mai amfani idan kana so." },
        { id: "protections",
          t: "Anti-peek da kariya daga call na bazata",
          b: [
            "Kariya biyu na zaɓi: Anti-peek yana ɓoye katunanka har sai ka taɓa su (mai amfani idan wani zai iya ganin allonka), kuma kariya daga call na bazata tana toshe maɓallin Call na ɗan lokaci nan da nan bayan babban raise, don kada taɓawa da aka nufa don ƙaramin call ta faɗa kan adadin da aka ƙara bisa kuskure. Duka biyun suna cikin Zaɓuɓɓuka na ci gaba."] }
      ]
    },
    {
      id: "info", icon: "📊", title: "Fanel na bayani",
      sections: [
        { id: "open",
          t: "Buɗe fanel",
          b: [
            "Yayin wasa, fanel na bayani yana buɗewa daga saman shafi (ko Alt+L / Alt+I) kuma yana da shafuka uku: Log, Dama da Ƙididdiga. A wayoyi yana shawagi a saman tebur; a manyan allo taga ce da ake iya ja da canja girma — riƙe maƙalin ⣿ don matsar da ita, gefuna don canja girma. Ana tuna matsayinta."] },
        { id: "log",
          t: "Log na wasa",
          b: [
            "Shafin Log yana rubuta dukan wasa hannu bayan hannu: blinds, kowane motsi da adadinsa, katunan da aka bayyana da masu nasara, da launuka don karantawa da sauri. Maɓallin fitarwa yana adana log a matsayin fayil idan kana so ka sake duba zaman daga baya."] },
        { id: "odds",
          t: "Dama (mai lura da yiwuwa)",
          b: [
            "Shafin Dama yana nuna, ga hannunka na yanzu, yiwuwar kai tsaye ta ƙarewa da kowane ɗaya daga cikin rukunoni 10 na hannaye — daga High Card zuwa Royal Flush — kowane da alamarsa, kashi da sanda. Nuni yana zama toka idan ka yi fold. Yana amfani da katunanka da katunan jama'a ne kawai: ba ya ganin komai da abokan hamayyarka ba su nuna ba."] },
        { id: "journal",
          t: "Log na hannaye da tagar Log",
          b: [
            "Baya ga log na kai tsaye, ana rubuta kowane hannu da ka buga a gida a burauzarka, a tsari ɗaya da fayilolin log .pdb na manhajar hukuma. Tagar Log (Zaɓuɓɓuka na ci gaba → Saƙonnin log → Sarrafa log…) tana lissafa zamanka kuma tana ba ka damar aiki da su: samfotin zama tare da nema da haskakawa, tace bisa wasa, fitar a matsayin HTML ko rubutu, adana fayil ɗin .pdb na asali, ko shigo da .pdb da manhajar kwamfuta ta rubuta. Ana iya share zama ɗaya-ɗaya ko duka a lokaci ɗaya (tare da tabbatarwa), kuma saitin adana kai tsaye zai iya riƙe kwanaki 7, 30, 90, 180 ko 365 na ƙarshe kawai. Ba a taɓa share log da ka shigo da su da kanka kai tsaye ba. Saiti na biyu yana iyakance adadin zaman da ake adanawa, kuma ana iya faɗaɗa ginshiƙin jeri ta hanyar ja.",
            "Don share zama da yawa a lokaci ɗaya, maɓallin Zaɓi… yana mayar da jerin zuwa akwatunan alama: yi alama a waɗanda kake so ka cire kuma Share zai cire duk rukunin bayan tabbatarwa ɗaya. A kwamfuta kuma za ka iya yin Ctrl (⌘) + danna don ƙara zama ɗaya-ɗaya, ko Shift + danna don ɗaukar dukan jeri.",
            "Maɓallin Bincika yana gudanar da binciken hannaye a kan zama kuma zai iya aika log zuwa sabis na bincike na pokerth.net. Komai yana zama a na'urarka sai dai idan ka fitar ko ka loda a fili."] },
        { id: "logopts",
          t: "Zaɓuɓɓukan log",
          b: [
            "A Zaɓuɓɓuka na ci gaba → Saƙonnin log za ka iya kunna ko kashe rubuta log kuma ka zaɓi tazarar rubutu, da saituna uku iri ɗaya da manhajar kwamfuta: bayan kowane motsi, bayan kowane hannu (na asali) ko bayan kowane wasa. Wani zaɓi yana rubuta fayil ɗin .pdb a babban fayil da ka zaɓa kuma yana sabunta shi a wannan tazarar, sannan sau ɗaya kuma idan ka bar shafi, don wani kayan aiki ya iya bin wasan kai tsaye."],
          note: "Rubutu a babban fayil na gida yana buƙatar File System Access API: Chrome, Edge da Opera na kwamfuta kawai. A wasu wurare zaɓin yana bayyana dalili, kuma fitarwa da hannu daga tagar Log tana nan. Burauza tana iya maye gurbin fayil ne kawai, ba ta taɓa ƙara masa ba, don haka kayan aikin da ke karanta .pdb dole ne ya sake buɗe shi bayan kowane canji." },
        { id: "assist",
          t: "Mataimaki (ƙarfin hannu)",
          b: [
            "A saman shafin Dama, tutar mataimaki tana karanta maka hannunka. Kafin flop tana ambaton hannunka na farko kuma tana ba shi taurari; daga flop tana nuna mafi kyawun haɗuwarka ta yanzu kuma, bayan ɗan kwaikwayo, damarka ta cin hannun a kashi, da ma'auni mai launi daga ja (mai rauni) zuwa kore (mai ƙarfi). Kamar mai lura da yiwuwa, tana amfani da bayanan da kake iya gani ne kawai.",
            "Salon nuni biyu suna samuwa a Zaɓuɓɓuka na ci gaba → Kujeru: Sassa (tubali goma) ko sandar ci gaba ta gargajiya. Ana iya kashe dukan fasalin mataimaki a Zaɓuɓɓuka na ci gaba → Mataimaki."] },
        { id: "assistwin",
          t: "Mataimaki a matsayin ɗan taga mai shawagi",
          b: [
            "Ana iya cire tubalin mataimaki daga fanel zuwa ƙaramar tagarsa da ke koyaushe a sama: yi amfani da maɓallin cirewa a tubalin, sannan ka matsar da shi ka canja girmansa a ko'ina a saman tebur — mai amfani don bibiyar ƙarfin hannunka ba tare da buɗe dukan fanel ba. Maɓallin mayarwa yana mayar da shi shafin Dama, kuma ana tuna matsayinsa. A cikin fanel, maƙalin ja tsakanin Mataimaki da yiwuwa yana ba ka damar raba wuri tsakaninsu."] },
        { id: "stats",
          t: "Ƙididdiga",
          b: [
            "Shafin Ƙididdiga yana bibiyar zamanka: hannayen da aka buga, flop da aka gani, showdown, adadin nasara da ƙari. Ana iya kashe bibiyar ƙididdiga a cikin Zaɓuɓɓuka na ci gaba."] },
        { id: "hud",
          t: "HUD na ƙididdiga a kujeru",
          b: [
            "HUD yana maƙala ƙaramin akwatin ƙididdiga kusa da kujerar kowane ɗan wasa, wanda aka gina daga hannayen da aka rubuta a log ɗinka: adadin hannayen da aka lura, sannan VPIP (sau nawa yake saka kuɗi da son rai kafin flop), PFR (raise kafin flop) da AF (ma'aunin tsauri), da launuka daga mai sanyi zuwa mai tsauri. A ƙarƙashinsu, alama tana taƙaita ɗan wasan cikin sauƙaƙan kalmomi — Mai taka-tsantsan mai sanyi, Mai sako-sako mai tsauri da sauransu — kusa da ƙaramin agogo wanda kwatarsa da ke haske ke karantawa daga taka-tsantsan zuwa sako-sako daga hagu zuwa dama, da daga mai sanyi zuwa mai tsauri daga ƙasa zuwa sama. Ana nuna alamar tun daga hannu na farko amma tana zama a dusashe har zuwa hannaye 25, sannan ta zama abin dogara. Taɓa akwatin don taga mai cikakken bayani da duk alƙaluma (3-bet, continuation bet, fold ga 3-bet, ƙoƙarin sata, adadin showdown…), kuma ja akwatin idan yana rufe wani abu.",
            "HUD yana sanin abin da ka gani a teburanka ne kawai — yana karanta log na hannayenka na gida, don haka dole ne rubuta log ya kasance a kunne, kuma alƙaluman suna da ma'ana bayan isassun hannaye. A kashe ta asali: kunna shi a Zaɓuɓɓuka na ci gaba → Mataimaki."] },
        { id: "handsbtn",
          t: "Taƙaitaccen hannaye",
          b: [
            "Alamar hannayen poker a kan rigar tebur tana buɗe taƙaitaccen hannaye 10 a kowane lokaci — mai amfani yayin koyo. Ana iya ɓoye ta a cikin Zaɓuɓɓuka na ci gaba."] }
      ]
    },
    {
      id: "chat", icon: "💬", title: "Hira da zamantakewa",
      sections: [
        { id: "panels",
          t: "Hirar zaure da hirar wasa",
          b: [
            "Akwai hira a zaure da wata a tebur. A wayoyi hirar wasa tana shawagi a saman tebur; a manyan allo taga ce da ake iya ja da canja girma. Alama a maɓallin hira tana ƙirga saƙonnin da ba a karanta ba."] },
        { id: "typing",
          t: "Taimakon rubutu",
          list: [
            "Tab yana kammala laƙabi — sake danna Tab don zagaya daidaituwar.",
            "↑ / ↓ suna bincika tarihin saƙonninka.",
            "Maɓallin emoji yana buɗe cikakken mai zaɓa; rubuta : ma yana ba da shawarar emoji yayin da kake rubutu."] },
        { id: "emotes",
          t: "Emoji da murmushi",
          b: [
            "Hira tana canja gajerun lambobin emoji kamar manhajar kwamfuta ta hukuma: rubuta suna tsakanin ruɓi biyu kuma ya zama emoji — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… ana tallafa wa lambobi sama da 1,900 (cikakken tsarin GitHub). Ana canja murmushin rubutu na gargajiya ma: :-) ;) :D xD :P <3 da wasu kusan tamanin.",
            "Rubuta : yana buɗe tagar shawarwari da ke kammala lambar yayin da kake rubutu (↑/↓ don zaɓa, Tab ko Enter don karɓa). Ana iya kashe canjin emoji gaba ɗaya a Zaɓuɓɓuka na ci gaba → Hira."] },
        { id: "commands",
          t: "Umarnin hira",
          b: [
            "Hira tana fahimtar umarnin da ke farawa da slash. Biyu ne wasu za su gani:"],
          keys: [
            ["/me <text>", "Saƙon aiki, ana nuna shi kamar “* sunanka rubutu”   ⟦/me <rubutu>⟧"],
            ["/emoji <emoji>", "Yana kunna martanin emoji (abin da mai zaɓar martani ke aikawa)   ⟦/emoji <emoji>⟧"]] },
        { id: "diagcmds",
          t: "Umarnin bincike",
          b: [
            "Duk sauran na gida ne: ana nuna amsoshi gare ka kawai kuma ba a aika komai zuwa tebur. Rubuta /help don lissafa su duka. Mafi amfani:"],
          keys: [
            ["/help", "Lissafa duk umarni   ⟦/help⟧"],
            ["/update", "Duba ko akwai sabuwar siga kuma sabunta   ⟦/update⟧"],
            ["/lang <code>", "Canja harshe (misali /lang fr)   ⟦/lang <code>⟧"],
            ["/sound on|off", "Kunna/kashe sautukan wasa   ⟦/sound on|off⟧"],
            ["/zoom", "Kunna/kashe madubin girma na tebur   ⟦/zoom⟧"],
            ["/clear", "Share hira a gida   ⟦/clear⟧"],
            ["/table", "Bayanin wasan yanzu (blinds, 'yan wasa, tari)   ⟦/table⟧"],
            ["/diag · /netdbg · /fps", "Binciken yanayin abokin ciniki, hanyar sadarwa da saurin hoto   ⟦/diag · /netdbg · /fps⟧"],
            ["/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg", "Gyaran kurakurai na ci gaba (katuna, yarjejeniya, sauti, ajiya, kujeru)   ⟦/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg⟧"],
            ["/copy", "Kwafi amsar umarni na ƙarshe zuwa allon kwafi   ⟦/copy⟧"]] },
        { id: "privatemsg",
          t: "Saƙonnin sirri",
          b: [
            "Rubuta wa ɗan wasa ɗaya ba tare da dukan zaure ya karanta ba. Ambulan kusa da suna a jerin 'yan wasa yana buɗe tattaunawa da shi; ambulan a saman zaure yana sake buɗe na ƙarshe. Ana adana tattaunawa a wannan na'ura kuma suna nan idan ka dawo, don haka tattaunawar da aka ci gaba bayan kwanaki tana ɗauke da tarihinta — lambar ja a kan ambulan tana nuna abin da ba ka karanta ba tukuna, kuma kwandon shara a taken taga yana share tattaunawa har abada."],
          keys: [
            ["/msg <nickname> <text>", "Aika saƙon sirri daga hirar zaure   ⟦/msg <laƙabi> <rubutu>⟧"],
            ["/msg \"<nickname with spaces>\" <text>", "Haka nan, idan laƙabin yana da sarari   ⟦/msg \"<laƙabi mai sarari>\" <rubutu>⟧"]],
          note: "Saƙonni suna da iyakar haruffa 128. Sabar ba ta isar da saƙon sirri ga ɗan wasan da ke zaune a tebur da wasa ke gudana, kuma ana adana tarihi a wannan burauza kawai — ba ya bin ka zuwa wata na'ura." },
        { id: "reactions",
          t: "Martanin emoji",
          b: [
            "Maɓallin martani yana buɗe mai zaɓar martani 30 masu motsi (🎉, 😂, 😱, 🔥…) waɗanda ke kunnawa da tasiri a saman kujerarka, kowa a tebur yana gani — har da 'yan wasa a manhajar kwamfuta. Ana iya kashe martani gaba ɗaya a cikin Zaɓuɓɓuka na ci gaba."] },
        { id: "translate",
          t: "Fahimtar kowa",
          b: [
            "Idan fassarar hira tana kunne, maɓallin fassara yana bayyana a layin da ke ƙarƙashin mai nunawarka — ko, a allon taɓawa, a layin da ka taɓa — kuma yana nuna wannan saƙon cikin harshenka da mai fassara na burauza. Ana iya nuna shi koyaushe a kowane layi a Zaɓuɓɓuka na ci gaba → Hira, inda kuma akwai shawara da ke bayyana gajerun kalmomin tebur (gg, nh, utg…)."],
          note: "Fassara tana amfani da sabis na Google Translate kuma tana aiki a kowace burauza — ana buƙatar haɗin intanet kawai. Ana aika saƙo zuwa sabis ɗin fassara ne kawai idan ka taɓa maɓallin fassararsa, ba a taɓa yin haka kai tsaye ba." },
        { id: "social",
          t: "'Yan wasa: bayani, gayyata, ƙin kula",
          b: [
            "Taɓa kowane ɗan wasa — a tebur ko a jerin zaure — don buɗe katinsa: bayani da ƙididdiga, gayyace shi zuwa wasanka, ko ƙin kula da shi (ana ɓoye saƙonnin hirarsa; ana iya soke ƙin kula a kowane lokaci). Ana iya kunna tabbatarwa kafin gayyata/ƙin kula a cikin zaɓuɓɓuka."] }
      ]
    },
    {
      id: "lobby", icon: "🏛️", title: "Zaure da wasanni",
      sections: [
        { id: "list",
          t: "Jerin wasanni",
          b: [
            "Zaure yana lissafa duk teburan da ke sabar. Kowace shigarwa tana nuna adadin 'yan wasa, nau'in wasa, kulle idan ana buƙatar kalmar sirri ko gayyata, da alamar yanayi: “Ana jira” (kore — wasa bai fara ba, za ka iya shiga idan akwai kujera), “Yana gudana” (launi mai ɗumi — ana iya kallo kai tsaye idan an yarda da 'yan kallo) da “A rufe” (a dusashe). Teburin da ya cika yana nuna cikakken adadi kawai, misali 10/10; launukan alamomi suna bin jigon da ke aiki.",
            "Menu na tacewa yana taƙaita jerin kamar manhajar kwamfuta, kowane zaɓi ya fi na baya tsauri: wasannin da ke buɗe kawai → ɓoye teburan da suka cika ma → sannan waɗanda ba na sirri ba kawai, na sirri kawai ko masu matsayi kawai. Ana tuna zaɓinka. Filin nema yana samun wasa ta suna, kuma alamar 'yan wasa tana buɗe jerin duk waɗanda ke kan layi, ana iya nema da jera shi."] },
        { id: "join",
          t: "Shiga da kallo",
          b: [
            "Zaɓi wasan da ke buɗe kuma ka shiga — kulle yana nufin ana buƙatar kalmar sirri. Wasannin da ke gudana waɗanda suka yarda da 'yan kallo ana iya kallonsu kai tsaye: kana ganin tebur da hira, amma katunan aljihu suna ɓoye kuma ba za ka iya yin motsi ba."] },
        { id: "gameinfo",
          t: "Bayanin wasa",
          b: [
            "Kafin ka shiga, katin bayanin wasa yana nuna duk abin da ke bayyana tebur: nau'in wasa, blinds da yadda suke ƙaruwa (ninkawa ko jeri da hannu), kuɗin farko, iyakar lokacin motsi, jinkiri tsakanin hannaye da wanda ya riga ya zauna."] },
        { id: "create",
          t: "Ƙirƙirar wasa",
          b: [
            "Ƙirƙiri teburinka: suna, adadin 'yan wasa, kuɗin farko, ƙaramin blind na farko da jadawalin ƙari, iyakar lokacin motsi da ko an yarda da 'yan kallo. Akwai nau'ikan wasa huɗu: Na al'ada (kowa), 'yan wasa masu rajista kawai, da gayyata kawai da Ranking (ana ƙirga shi a matsayi na hukuma — ba a yarda da kalmar sirri a can ba). Ana iya adana saitunan da ka fi so kuma a sake loda su."] },
        { id: "invites",
          t: "Gayyata",
          b: [
            "'Yan wasa za su iya gayyatarka zuwa teburinsu; kana samun sanarwa da za ka iya karɓa ko ƙi. Samun gayyata ita ce kawai hanyar shiga wasan da ke da gayyata kawai."] }
      ]
    },
    {
      id: "pthnet", icon: "🌐", title: "pokerth.net",
      sections: [
        { id: "account",
          t: "Asusunka",
          b: [
            "Sabar intanet ta hukuma ita ce pokerth.net. Yin wasa a can yana buƙatar asusun pokerth.net kyauta — yi rajista a shafin, sannan ka shiga nan da laƙabi da kalmar sirri iri ɗaya. Wannan abokin cinikin yanar gizo yana haɗawa da sabar ɗaya da manhajar kwamfuta: asusu ɗaya, teburi ɗaya, matsayi ɗaya, kuma za ka iya zama a tebur ɗaya da 'yan wasan kwamfuta."] },
        { id: "ranked",
          t: "Wasannin matsayi da kaka",
          b: [
            "Wasannin nau'in Ranking ana ƙirga su a matsayin kaka na hukuma. Bayaninka a cikin manhaja yana nuna lokacin da ka shiga, Matsayinka, Makinka, matsakaicinka da wasannin da ka buga a kakar yanzu, tare da sakamakonka na ƙarshe. Wasanni na al'ada (marasa matsayi) don nishaɗi ne kawai kuma ba sa canja komai."] },
        { id: "rankhow",
          t: "Yadda ake lissafa matsayi",
          b: [
            "A kowane wasan matsayi, matsayin da ka gama yana ba da maki: 15 ga na farko, sannan 9, 6, 4, 3, 2 da 1 har zuwa na bakwai; na takwas zuwa na goma ba sa samun komai. Don haka tebur ɗaya yana raba jimlar maki 40.",
            "Makinka ba jimlar waɗannan maki ba ne, amma matsakaicinka ne na kowane wasa, wanda aka tausasa da ma'auni da ke ƙaruwa tare da adadin wasannin da aka buga: 'yan sakamako masu kyau ba su isa su zauna a sama ba, ana buƙatar dagewa ma — yawan yadda kake wasa, yawan yadda Makinka ke kusantar matsakaicinka na gaskiya. Kaka tana ɗaukar wata uku: a canji, ana ajiye komai kuma ƙirge-ƙirge suna farawa daga sifili, yayin da kakar da ta wuce ke nan. A wasa, maɓallin dandamalin nasara yana nuna matsayin kaka na 'yan wasan teburinka."],
          note: "Sabar matsayi ta pokerth.net ce ke saita ma'aunin maki da ainihin dabara kuma suna iya canjawa; shafukan shafin su ne tushen dogaro." },
        { id: "rankings",
          t: "Shafukan matsayi",
          b: [
            "Abin matsayi yana buɗe matsayin PokerTH na hukuma, ana iya nema bisa ɗan wasa, tare da matsayin al'ummomi (BBC, WEC). Idan matsayi ba ya burge ka, ana iya ɓoye abin a Zaɓuɓɓuka na ci gaba → Al'umma."] },
        { id: "cups",
          t: "Kofunan al'umma: BBC da WeCup",
          b: [
            "Al'ummomi biyu suna gudanar da gasa nasu a pokerth.net, kowane da shafinsa da matsayinsa. Best Brainies Cup (BBC) gasa ce ta matakai da aka fara a 2013: kana ci gaba daga Step 1 zuwa Step 4, kuma sabuwar kaka tana farawa bayan kowane wasan Step 4, lokacin da aka ba da kofi. WeCup (WEC) yana da ma'aunin kansa, wanda ya fi yaɗuwa sosai — maki 75 ga matsayi na farko, sannan 45, 30, 20… — kuma makinsa yana daidaita matsakaicinka bisa adadin wasannin da ka buga idan aka kwatanta da sauran membobi.",
            "Duka matsayin biyu suna buɗewa daga maɓallin kofi, kusa da matsayin PokerTH. Saitunan tebur na waɗannan gasa suna zuwa a matsayin samfura lokacin ƙirƙirar wasa (BBC Step 1 zuwa 4, WEC, WEC Monthly Final da WEC Grand Final), don ka iya yin horo a yanayi ɗaya. Don shiga, dole ne ka yi rajista a shafin kofin da abin ya shafa."],
          note: "Ana iya ɓoye duk waɗannan abubuwan a lokaci ɗaya a Zaɓuɓɓuka na ci gaba → Al'umma idan kofuna ba su burge ka ba." },
        { id: "forumcups",
          t: "Kofunan dandali da abubuwan da ke faruwa",
          b: [
            "Dandalin pokerth.net yana kuma ɗaukar Monthly Cup — jerin wasa na wata-wata inda ake raba 'yan wasa tsakanin teburan Gold, Silver da Bronze kafin a tantance zakaran wata — da kofuna na musamman na lokaci ɗaya a cikin shekara.",
            "Ana buga rajista, jadawali, saitunan tebur da sakamako a dandali, kuma ana buga wasannin a sabar hukuma kamar kowane. Asusun pokerth.net ya isa don bibiyar sakamako; shiga kofi yana gudana ta zaren dandalin da abin ya shafa."] },
        { id: "forumnews",
          t: "Labaran dandali a zaure",
          b: [
            "Maɓallin jarida a saman zaure yana buɗe sababbin rubuce-rubucen dandalin pokerth.net, shigarwa ɗaya ga kowane batu, kowane dandali da launinsa. Alama a maɓallin tana ƙirga rubuce-rubucen da ba a karanta ba; buɗe rubutu (a sabon shafi) yana yi masa alamar an karanta, kuma “Yi wa duka alamar an karanta” yana share komai a lokaci ɗaya.",
            "Wannan ƙari ne na yanar gizo: ana iya ɓoye maɓallin a Zaɓuɓɓuka na ci gaba (“Maɓallin dandali a saman zaure”).",
            "Shafin “Abubuwan da ke faruwa” yana nuna wasannin BBC masu zuwa da Monthly Cup na gaba tare da adadin 'yan wasan da suka yi rajista, da kuma masu nasarar BBC, WEC da Monthly Cup na ƙarshe. Lokutan suna a lokacinka na gida, kuma taɓawa tana buɗe shafin al'umma. Zaɓin “Nuna abubuwan al'umma (BBC / WEC)” yana ɓoye wannan shafin."] },
        { id: "avatars",
          t: "Avatar da tutoci",
          b: [
            "A pokerth.net ana rarraba avatar ɗinka ga sauran 'yan wasa ta sabar avatar, kuma ana iya nuna ƙaramar tutar ƙasa a akwatunan 'yan wasa. Duka biyun na zaɓi ne kuma ana daidaita su a cikin zaɓuɓɓuka."] }
      ]
    },
    {
      id: "offline", icon: "🏋️", title: "Yanayin horo",
      sections: [
        { id: "what",
          t: "Mene ne",
          b: [
            "Yanayin Na gida / horo cikakken wasa ne da abokan hamayya na kwamfuta: babu haɗi, babu asusu, babu abin da ke cikin haɗari. Da zarar an sanya manhajar (ko an ziyarce ta sau ɗaya kawai), tana aiki gaba ɗaya ba tare da intanet ba — cikakke don koyon wasan, gwada fuskar ko wuce lokaci a yanayin jirgin sama."] },
        { id: "setup",
          t: "Shirya wasa",
          b: [
            "Zaɓi adadin abokan hamayya, kuɗin farko, blinds da jadawalin ƙari, da saurin wasa. Ana iya daidaita haɗin bots da wahalarsu a Zaɓuɓɓuka na ci gaba → Wasan gida — daga abokan hamayya masu laushi zuwa tebur mai gauraye da ya fi wahala."] },
        { id: "trophies",
          t: "Kofuna",
          b: [
            "Yanayin horo yana da ci gabansa: kofuna 28 a rukunoni shida (ci gaba, ƙwarewa, salo, tsare-tsare, nishaɗi da ɗaya na sirri) suna buɗewa yayin da kake wasa — hannayen da aka buga, wasannin da aka ci, manyan bluff, hannaye na musamman da ƙari. Ci gaban kofunanka yana taruwa kuma ana haɗa shi tsakanin na'urori idan daidaita saitunan asusu yana aiki."] },
        { id: "learn",
          t: "Wuri mai kyau don koyo",
          b: [
            "Komai daga sauran babuka yana aiki a nan ma: mai lura da yiwuwa, nunin mataimaki, zaɓi tun da wuri, gajerun hanyoyin maɓallai. Yanayin horo shi ne wuri mafi kyau don gwada su ba tare da matsi ba kafin ka tafi pokerth.net."] }
      ]
    },
    {
      id: "style", icon: "🎨", title: "Salo da sauti",
      sections: [
        { id: "themes",
          t: "Jigogi",
          b: [
            "Rukunin Salo a cikin Zaɓuɓɓuka na ci gaba yana canja kamannin dukan abokin ciniki. Samfura suna saita komai da taɓawa ɗaya (gidan caca kore na gargajiya, kamannin PokerTH na hukuma…); a ƙarƙashinsu, wasu ma'auni daban suna ba ka damar gyara launuka, rigar tebur da fuskokin katuna daban-daban — canja kowane ma'auni kuma haɗinka ya zama jigo na kanka. Ana zaɓar yanayin duhu, haske ko kai tsaye a Fuskar mai amfani, kuma zaɓuɓɓukanka suna aiki nan take, a kowane allo, kuma ana tuna su."] },
        { id: "tablelook",
          t: "Teburi, katuna, kujeru",
          b: [
            "Baya ga jigo, ana iya canja abubuwa da dama ba tare da dogara da juna ba: bangon tebur, katunan, bayan kati (daidaita shi da katunan kai tsaye ko shigo da hotonka), fayafan mai rabawa da blinds, salon maɓallan motsi da cikakkun fakitin kujeru da ke canja kamannin akwatunan 'yan wasa. Zaɓi komai a Zaɓuɓɓuka na ci gaba → Salo; ana ganin canje-canje a tebur nan take."] },
        { id: "music",
          t: "Mai kunna kiɗa",
          b: [
            "Abin kiɗa a menu na saman shafi yana buɗe ƙaramin mai kunna kiɗan lounge: zaɓi waƙa daga jerin waƙoƙi, kunna/dakata, na baya/na gaba, gauraya, kuma maimaita waƙa ɗaya, dukan jerin ko babu. Ana tuna ƙara, waƙar da aka zaɓa da yanayin maimaitawa. Kunnawa ba ta taɓa farawa da kanta ba — burauzoji suna buƙatar taɓawa — kuma mai kunnawa ba ya dogara da tasirin sautin wasa ko kaɗan.",
            "Manyan yatsu biyu a ƙarƙashin sunan waƙa suna nuna ko kana son abin da ake kunnawa. Ƙuri'a ɗaya ba tare da suna ba ga kowace na'ura, har da rediyo, kuma za ka iya canja ta ko janye ta a kowane lokaci; sai dai idan mai gudanarwa ya bayyana jimla, kana ganin babban yatsanka ne kawai.",
            "A iPhone da iPad mai kunnawa yana amfani da kunnawa mai sauƙi ta asali, don kiɗa ya ci gaba da CarPlay, Bluetooth ko allon da aka kulle; ana daidaita ƙara da maɓallan na'ura ko mota a lokacin. Zaɓin “Ƙarar cikin manhaja” yana dawo da madaidaicin ƙara, daidaito da ma'aunin VU, amma sauti zai iya tsayawa-tsayawa a mota."] },
        { id: "sounds",
          t: "Tasirin sauti",
          b: [
            "An haɗa sautukan wasa a rukunoni huɗu da ake iya kunna/kashe su daban, kamar a manhajar kwamfuta: motsin wasa (raba katuna, Check, Call, Raise, lokacinka…), sanarwar hirar zaure, sanarwar wasan hanyar sadarwa (ɗan wasa ya shiga, wasa a shirye) da sanarwar ƙarin blinds. Madaidaicin ƙara ɗaya yana sarrafa su duka, a Zaɓuɓɓuka na ci gaba → Sauti."],
          note: "Duk burauzoji — musamman iOS — suna ƙin kunna sauti har sai ka taɓa shafi sau ɗaya. Idan wasa ya fara shiru, taɓawa ɗaya a ko'ina tana farkar da sauti; abokin ciniki kuma yana dawo da injin sauti kai tsaye idan iOS ta dakatar da shi (kiran shigowa, zuwa baya…)." },
        { id: "voice",
          t: "Sanarwar murya da girgiza",
          b: [
            "Ƙarin hanyoyi biyu za su iya sanar da kai ba tare da ka kalli allo ba: sanarwar murya tana karanta abubuwan da ke faruwa a wasa da muryar na'urarka, kuma a wayoyi ɗan girgiza zai iya nuna lokacinka. Duka biyun ƙarin yanar gizo ne, a kunne ko a kashe ta asali bisa na'ura, a Zaɓuɓɓuka na ci gaba → Caca da lokaci."],
          note: "Girgiza tana aiki a Android (burauzojin Chromium); Apple ba ta ba shafukan yanar gizo API na girgiza ba, don haka iPhone ba za su iya girgiza ba. Sanarwar murya tana aiki a ko'ina, amma muryoyi da harsunan da ake da su sun dogara da tsarinka — abokin ciniki yana amfani da mafi dacewa da ya samu." }
      ]
    },
    {
      id: "options", icon: "⚙️", title: "Zaɓuɓɓuka da gajerun hanyoyi",
      sections: [
        { id: "where",
          t: "Ina zaɓuɓɓukan suke",
          b: [
            "Zaɓuɓɓuka na ci gaba suna buɗewa daga abin giya a kowane menu na saman shafi. An tsara su kamar a manhajar kwamfuta: Fuskar mai amfani, Salo, Sauti, Wasan gida, Wasan hanyar sadarwa, Wasan intanet, Laƙabi / Avatar, Saƙonnin log da Ajiya da sake saiti. Kowane fasali na musamman na yanar gizo yana da maɓallin kunnawa nasa a can, don haka za ka iya kashe duk abin da ba ka amfani da shi."] },
        { id: "cfgxml",
          t: "Musanya saituna da manhajar kwamfuta",
          b: [
            "Saitunanka za su iya matsawa tsakanin abokan ciniki: rukunin Ajiya da sake saiti yana ba da fitarwa/shigowa na fayil ɗin config.xml na hukuma (~/.pokerth/config.xml, wanda manhajojin kwamfuta da QML ke amfani da shi). Fitarwa tana rubuta saitunan da ake rabawa — suna, zaɓuɓɓukan nuni, sautuka, zaɓin tebur, blinds, salo — kuma shigowa tana aiwatar da fayil ɗin kwamfuta a nan. Saitunan da wannan abokin ciniki bai sani ba suna nan ba tare da an taɓa su ba a cikin fayil.",
            "Bayananka game da 'yan wasa ma suna tafiya tare da fayil — rubutu da ƙimar taurari, an rubuta su yadda manhajojin kwamfuta ke karanta su. Alamomin launi suna zama a wannan abokin ciniki: tsarin hukuma ba shi da filin su, don haka shigowa ba ta taɓa taɓa naka ba."] },
        { id: "sync",
          t: "Saitunan da ke bin ka",
          b: [
            "Idan kana wasa da asusu, ana daidaita zaɓuɓɓukanka, jigo, maɓallan da ka saita, harshe da kofunan horo: canja wani abu a na'ura ɗaya kuma na'urar da za ka shiga ta gaba za ta ɗauke shi. Ana haɗa ci gaban kofuna, ba a taɓa maye gurbinsa ba, don haka wasa a na'urori biyu koyaushe yana riƙe mafi kyau daga duka biyun."] },
        { id: "updates",
          t: "Kasancewa sabunta",
          b: [
            "Abokin ciniki yana sabunta kansa: idan an fitar da sabuwar siga, tuta tana gayyatarka don sabunta shafi (ko rubuta /update a hira don duba da hannu). Wani lokaci ƙaramin binciken ra'ayi zai iya bayyana yana tambayar ra'ayinka game da wani fasali — shiga na zaɓi ne, kuma ana iya kashe binciken ra'ayi gaba ɗaya a Zaɓuɓɓuka na ci gaba → Al'umma."] },
        { id: "fkeys",
          t: "Gajerun hanyoyin maɓallai na hukuma",
          b: [
            "Maɓallan aiki na hukuma na PokerTH suna aiki yayin wasa — Alt+S yana aiki a ko'ina:"],
          keys: [
            ["F1 / F2 / F3 / F4", "Fold · Check/Call · Bet/Raise · All-In (ana iya juya tsarin a cikin zaɓuɓɓuka)   ⟦F1 / F2 / F3 / F4⟧"],
            ["F5", "Nuna katunanka (idan zai yiwu)   ⟦F5⟧"],
            ["F6 / F7 / F8", "Da hannu · Check/Fold kai tsaye · Check/Call kai tsaye   ⟦F6 / F7 / F8⟧"],
            ["Alt+M / Alt+K / Alt+F", "Da hannu · Check/Call kai tsaye · Check/Fold kai tsaye   ⟦Alt+M / Alt+K / Alt+F⟧"],
            ["Alt+C / Alt+L / Alt+I", "Hira · Log na wasa · Fanel na yiwuwa   ⟦Alt+C / Alt+L / Alt+I⟧"],
            ["Alt+S", "Saituna — a ko'ina a manhaja, ba yayin wasa kawai ba   ⟦Alt+S⟧"],
            ["F11", "Cikakken allo   ⟦F11⟧"]],
          note: "Gajerun hanyoyi suna buƙatar maɓallan zahiri. A Mac maɓallan F na sarrafa kafofin watsa labarai ne ta asali: riƙe Fn (ko kunna “Yi amfani da F1, F2 da sauransu a matsayin maɓallan aiki na yau da kullum” a saitunan macOS). A iPhone, iOS ke iyakance cikakken allo — sanya manhajar a matsayin PWA yana ba da irin wannan ƙwarewar cikakken allo." },
        { id: "webkeys",
          t: "Maɓallan haruffa na yanar gizo",
          b: [
            "A matsayin ƙarin yanar gizo, maɓallan harafi ɗaya da Alt+T ma suna kunna ayyuka, kuma ana iya sake saita kowannensu a Zaɓuɓɓuka na ci gaba → Gajerun hanyoyin maɓallai:"],
          keys: [
            ["F", "Fold   ⟦F⟧"],
            ["C", "Check / Call   ⟦C⟧"],
            ["R", "Raise   ⟦R⟧"],
            ["A", "All-In   ⟦A⟧"],
            ["1 / 2 / 3", "Caca 1/3 · 1/2 · Pot   ⟦1 / 2 / 3⟧"],
            ["Alt+T", "Fanel na ƙididdiga   ⟦Alt+T⟧"],
            ["Esc", "Rufe taga mafi sama (har da maɓallin Baya na Android)   ⟦Esc⟧"],
            ["↑ ↓ · ↵", "Jerin teburan zaure (kai ta Tab): zaɓi tebur · shiga   ⟦↑ ↓ · ↵⟧"]],
          note: "A Android, maɓallin/motsin Baya na tsarin yana rufe tagogi kamar Escape maimakon barin wasa (ana iya daidaitawa a cikin zaɓuɓɓuka). iOS ba ta da maɓallin tsarin da ya yi daidai — yi amfani da ✕ na kowace taga." }
      ]
    }
  ]
};
