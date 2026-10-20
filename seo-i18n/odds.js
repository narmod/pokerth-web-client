'use strict';
// Translations for the /poker-odds page (outs, rule of 2 and 4, pot odds,
// preflop matchups, starting-hand odds).
//
// English lives in proxy.js (_SEO_ODDS) and is the fallback; a language is
// advertised (hreflang, sitemap, nav link, IndexNow) the moment its entry
// lands here, never before. Same keys as _SEO_ODDS. Numbers are never
// written here: the text keeps the {placeholders} of the English, filled at
// render time from seo-i18n/odds-data.json in the reader's number format.
module.exports = {
  af: {
    "title": "Pokerkanse — outs, potkanse en hande teen mekaar | PokerTH",
    "desc": "Texas Hold’em-kanse presies uitgewerk: outs en jou kans om hulle te tref, die reël van 2 en 4, potkanse, en hoe dikwels AA vir KK klop of QQ vir AK.",
    "ldHeadline": "Pokerkanse: outs, potkanse en hande teen mekaar voor die flop",
    "ldDesc": "Texas Hold’em-kanse presies bereken: outs, die reël van 2 en 4, potkanse en hande teen mekaar voor die flop.",
    "h1": "Pokerkanse: outs, potkanse en hande teen mekaar voor die flop",
    "lead": "Goeie pokerbesluite kom neer op ’n paar getalle: hoe waarskynlik dit is dat jou hand verbeter, hoeveel jy moet betaal om dit uit te vind, en hoe twee hande voor die flop teen mekaar staan. Elke syfer op hierdie bladsy is presies bereken, nie uit ’n tabel oorgeskryf nie.",
    "calc": {
      "h2": "Pokerkanse-sakrekenaar",
      "intro": "Kies jou twee kaarte en, as jy wil, die tafel en ’n teenstander se hand. Die sakrekenaar deel elke oorblywende kaart uit — presies waar dit kan, andersins deur simulasie — en wys hoe dikwels jy wen.",
      "you": "Jou hand",
      "board": "Tafel",
      "opp": "Teenstander (opsioneel)",
      "players": "Teenstanders",
      "pick": "Tik op ’n kaart om dit in die gemerkte gleuf te plaas; tik op ’n gleuf om dit leeg te maak.",
      "clear": "Vee uit",
      "win": "Wen",
      "tie": "Gelykop",
      "lose": "Verloor",
      "exact": "Presies: elkeen van die {n} moontlike uitdelings.",
      "sim": "Simulasie van {n} ewekansige uitdelings.",
      "working": "Bereken…",
      "need": "Kies jou twee kaarte om jou kanse te sien.",
      "boardHint": "Die tafel neem drie kaarte (die flop), dan vier, dan vyf.",
      "oppHint": "Kies albei jou teenstander se kaarte, of geen.",
      "final": "Jou finale hand",
      "noscript": "Die sakrekenaar het JavaScript nodig. Die tabelle hieronder werk daarsonder."
    },
    "outsH2": "Outs: jou kans om te tref",
    "outsP": "’n Out is ’n kaart wat nog in die pak is en jou hand in die waarskynlike wenner verander. Op die flop is 47 kaarte nog ongesien: met 9 outs tref een kaart op die turn {f9turn} van die tyd, en teen die river — met twee kaarte wat nog kom — {f9river}.",
    "outsCols": [
      "Trek",
      "Outs",
      "Turn",
      "River (vanaf die turn)",
      "Turn of river (vanaf die flop)"
    ],
    "draws": {
      "gutshot": "Binne-straight-trek (gutshot)",
      "twoPairFull": "Twee pare na ’n volhuis",
      "pairTrips": "Een paar na twee pare of drie eenders",
      "twoOver": "Twee oorkaarte na ’n paar",
      "setFull": "Set na ’n volhuis of vier eenders",
      "oesd": "Oopkant-straight-trek",
      "flush": "Flush-trek",
      "flushGut": "Flush-trek en gutshot",
      "flushOesd": "Flush-trek en oopkant-straight-trek"
    },
    "outsNote": "Dit is die kanse om een van jou outs te vang. Runner-runner-ekstras is nie ingereken nie, en ’n out wat ook ’n teenstander ’n beter hand gee, is nie werklik ’n out nie.",
    "ruleH2": "Die reël van 2 en 4",
    "ruleP": "’n Vinnige skatting aan die tafel: vermenigvuldig jou outs met 4 op die flop as jy sowel die turn as die river gaan sien, en met 2 as net een kaart nog kom. ’n Flush-trek op die flop is 9 × 4 = 36%, teenoor presies {f9river}. Die reël oorskat groot treke: 15 outs gee 60%, die werklike syfer is {f15river}.",
    "potH2": "Potkanse: moet jy gelykmaak?",
    "potP": "Potkanse vergelyk wat jy moet betaal met wat jy kan wen. Die pot staan op 100 en jou teenstander wed 50: jy maak 50 gelyk om ’n pot van 200 te wen, so die call moet meer as 50 ÷ 200 = 25% van die tyd wen om die moeite werd te wees. Met ’n flush-trek en een kaart wat nog kom, tref jy {f9one} van die tyd, so om ’n inset gelyk te maak as net die river oorbly, kos jou op die lange duur fiches. All-in op die flop, met albei kaarte nog om te kom, tref dieselfde trek {f9river}, en dan is die call die moeite werd.",
    "matchH2": "Hande teen mekaar voor die flop",
    "matchP": "Hoe twee beginhande teen mekaar vaar as al vyf tafelkaarte uitgedeel word, getel oor elkeen van die {boards} moontlike tafels. Kleure maak ’n klein verskil: die hande hieronder deel geen kleur nie, tensy hulle as dieselfde kleur gewys word.",
    "matchCols": [
      "Hand",
      "Teen",
      "Wen",
      "Gelykop",
      "Verloor"
    ],
    "startH2": "Kanse op beginhande",
    "startP": "Daar is {combos} verskillende beginhande van twee kaarte. Hoe dikwels jy kry:",
    "startCols": [
      "Hand",
      "Kans",
      "Ongeveer een hand uit"
    ],
    "starting": {
      "specificPair": "’n Bepaalde paar in die hand, soos aase",
      "anyPair": "Enige paar in die hand",
      "specificNonPair": "’n Bepaalde hand sonder paar, soos aas-heer",
      "specificSuited": "’n Bepaalde hand van dieselfde kleur, soos aas-heer van dieselfde kleur",
      "anySuited": "Enige twee kaarte van dieselfde kleur",
      "twoBroadway": "Twee kaarte van tien of hoër"
    },
    "faqH2": "Vrae",
    "faq": [
      [
        "Wat is outs in poker?",
        "Die kaarte wat nog in die pak is en jou die beste hand sou gee. Tel net die kaarte wat jy nie gesien het nie: 47 op die flop, 46 op die turn."
      ],
      [
        "Hoe dikwels klop ’n paar aase ’n paar here?",
        "Ongeveer vier uit vyf keer: {aakk} as al vyf tafelkaarte uitgedeel word, terwyl die here {kkaa} wen."
      ],
      [
        "Is aas-heer teen ’n paar ’n muntgooi?",
        "Amper, teen ’n middelpaar: vroue wen {qqak} teen aas-heer. Teen ’n klein paar is dit nog nader — twees wen {22ak}."
      ],
      [
        "Wat is potkanse?",
        "Die prys van ’n call vergeleke met die pot wat jy kan wen. As jou kans om te wen groter is as die deel van die finale pot wat jy inbetaal, loon dit op die lange duur om gelyk te maak."
      ],
      [
        "Wys PokerTH my kanse tydens ’n spel?",
        "Ja. Die Kanse-oortjie noem jou huidige beste hand en jou kans om te wen soos die kaarte uitkom, sodat jy jou eie redenasie aan die tafel kan toets."
      ]
    ]
  },
  am: {
    "title": "የፖከር ዕድሎች — አውትስ፣ የፖት ዕድሎች፣ የእጅ ፍልሚያዎች | PokerTH",
    "desc": "የ Texas Hold’em ዕድሎች በትክክል የተሰሉ፦ አውትስ እና እነሱን የማግኘት ዕድልዎ፣ የ2 እና 4 ደንብ፣ የፖት ዕድሎች፣ እና AA ምን ያህል ጊዜ KKን ወይም QQ AKን እንደሚያሸንፍ።",
    "ldHeadline": "የፖከር ዕድሎች፦ አውትስ፣ የፖት ዕድሎች እና ከፍሎፕ በፊት የእጅ ፍልሚያዎች",
    "ldDesc": "በትክክል የተሰሉ የ Texas Hold’em ዕድሎች፦ አውትስ፣ የ2 እና 4 ደንብ፣ የፖት ዕድሎች እና ከፍሎፕ በፊት የእጅ ፍልሚያዎች።",
    "h1": "የፖከር ዕድሎች፦ አውትስ፣ የፖት ዕድሎች እና ከፍሎፕ በፊት የእጅ ፍልሚያዎች",
    "lead": "ጥሩ የፖከር ውሳኔዎች በጥቂት ቁጥሮች ላይ ይመሰረታሉ፦ እጅዎ የመሻሻል ዕድሉ ምን ያህል እንደሆነ፣ ይህን ለማወቅ ምን ያህል መክፈል እንዳለብዎ፣ እና ሁለት እጆች ከፍሎፕ በፊት እርስ በርሳቸው እንዴት እንደሚነጻጸሩ። በዚህ ገጽ ላይ ያለው እያንዳንዱ አሃዝ ከሰንጠረዥ የተገለበጠ ሳይሆን በትክክል የተሰላ ነው።",
    "calc": {
      "h2": "የፖከር ዕድሎች ማስያ",
      "intro": "ሁለቱን ካርታዎችዎን ይምረጡ፤ ከፈለጉም ቦርዱን እና የተቃዋሚን እጅ። ማስያው ቀሪዎቹን ካርታዎች በሙሉ ያከፋፍላል — በሚቻልበት ጊዜ ሁሉ በትክክል፣ ካልሆነ ደግሞ በማስመሰል — እና ምን ያህል ጊዜ እንደሚያሸንፉ ያሳያል።",
      "you": "የእርስዎ እጅ",
      "board": "ቦርድ",
      "opp": "ተቃዋሚ (አማራጭ)",
      "players": "ተቃዋሚዎች",
      "pick": "ካርታን በደመቀው ቦታ ለማስቀመጥ ይንኩት፤ ቦታን ባዶ ለማድረግ ይንኩት።",
      "clear": "አጽዳ",
      "win": "ማሸነፍ",
      "tie": "እኩል",
      "lose": "መሸነፍ",
      "exact": "ትክክለኛ፦ ሁሉም {n} ሊሆኑ የሚችሉ አከፋፈሎች።",
      "sim": "የ{n} የዘፈቀደ አከፋፈሎች ማስመሰል።",
      "working": "በማስላት ላይ…",
      "need": "ዕድሎችዎን ለማየት ሁለቱን ካርታዎችዎን ይምረጡ።",
      "boardHint": "ቦርዱ ሦስት ካርታዎችን (ፍሎፕ)፣ ከዚያ አራት፣ ከዚያ አምስት ይይዛል።",
      "oppHint": "የተቃዋሚዎን ሁለቱንም ካርታዎች ይምረጡ፣ ወይም አንዱንም አይምረጡ።",
      "final": "የመጨረሻ እጅዎ",
      "noscript": "ማስያው JavaScript ያስፈልገዋል። ከታች ያሉት ሰንጠረዦች ያለ እሱ ይሰራሉ።"
    },
    "outsH2": "አውትስ፦ የማግኘት ዕድልዎ",
    "outsP": "አውት ማለት በስብስቡ ውስጥ ገና ያለ እና እጅዎን ሊያሸንፍ የሚችል እጅ የሚያደርግ ካርታ ነው። በፍሎፕ ላይ 47 ካርታዎች አልታዩም፦ በ9 አውትስ፣ አንድ ካርታ በተርን ላይ ከጊዜው {f9turn} ይመጣል፣ እስከ ሪቨር ድረስ ደግሞ — ሁለት ካርታዎች ሲቀሩ — {f9river}።",
    "outsCols": [
      "Draw",
      "አውትስ",
      "ተርን",
      "ሪቨር (ከተርን)",
      "ተርን ወይም ሪቨር (ከፍሎፕ)"
    ],
    "draws": {
      "gutshot": "የውስጥ straight draw (gutshot)",
      "twoPairFull": "Two Pair ወደ Full House",
      "pairTrips": "One Pair ወደ Two Pair ወይም Three of a Kind",
      "twoOver": "ሁለት ኦቨርካርዶች ወደ ጥንድ",
      "setFull": "Set ወደ Full House ወይም Four of a Kind",
      "oesd": "ሁለት ጫፍ ክፍት straight draw",
      "flush": "Flush draw",
      "flushGut": "Flush draw እና gutshot",
      "flushOesd": "Flush draw እና ሁለት ጫፍ ክፍት straight draw"
    },
    "outsNote": "እነዚህ ከአውትስዎ አንዱን የማግኘት ዕድሎች ናቸው። በተከታታይ በሚመጡ ሁለት ካርታዎች (runner-runner) የሚገኙ ተጨማሪዎችን አያካትቱም፣ እና ለተቃዋሚም የተሻለ እጅ የሚሰጥ አውት በእርግጥ አውት አይደለም።",
    "ruleH2": "የ2 እና 4 ደንብ",
    "ruleP": "በጠረጴዛው ላይ ፈጣን ግምት፦ ተርኑንም ሪቨሩንም የሚያዩ ከሆነ በፍሎፕ ላይ አውትስዎን በ4 ያባዙ፣ አንድ ካርታ ብቻ ሲቀር ደግሞ በ2። በፍሎፕ ላይ ያለ flush draw 9 × 4 = 36% ይሆናል፣ ትክክለኛው ግን {f9river} ነው። ደንቡ ትላልቅ draws ከልክ በላይ ይገምታል፦ 15 አውትስ 60% ይሰጣሉ፣ እውነተኛው አሃዝ {f15river} ነው።",
    "potH2": "የፖት ዕድሎች፦ Call ማድረግ አለብዎት?",
    "potP": "የፖት ዕድሎች መክፈል ያለብዎትን ሊያሸንፉ ከሚችሉት ጋር ያነጻጽራሉ። ፖቱ 100 ይዟል፣ ተቃዋሚዎ 50 ይወራረዳል፦ የ200 ፖት ለማሸነፍ 50 Call ያደርጋሉ፣ ስለዚህ Call ትርፋማ እንዲሆን ከጊዜው ከ50 ÷ 200 = 25% በላይ ማሸነፍ አለበት። በ flush draw እና አንድ ካርታ ሲቀር ከጊዜው {f9one} ያገኛሉ፣ ስለዚህ ሪቨር ብቻ ሲቀር ውርርድን Call ማድረግ በረጅም ጊዜ ቺፕ ያሳጣል። በፍሎፕ ላይ All-In ሲሆን፣ ሁለቱም ካርታዎች ገና ሲቀሩ፣ ያው draw {f9river} ይመጣል፣ እና Call ማድረጉ ተገቢ ነው።",
    "matchH2": "ከፍሎፕ በፊት የእጅ ፍልሚያዎች",
    "matchP": "አምስቱም የቦርድ ካርታዎች ሲከፋፈሉ ሁለት የመነሻ እጆች እርስ በርሳቸው እንዴት እንደሚወጡ፣ በሁሉም {boards} ሊሆኑ የሚችሉ ቦርዶች ላይ የተቆጠረ። ቀለሞች ትንሽ ተጽዕኖ አላቸው፦ ከታች ያሉት እጆች ተመሳሳይ ቀለም ተብለው ካልተገለጹ በስተቀር ምንም ቀለም አይጋሩም።",
    "matchCols": [
      "እጅ",
      "ተቃራኒ",
      "ያሸንፋል",
      "እኩል",
      "ይሸነፋል"
    ],
    "startH2": "የመነሻ እጅ ዕድሎች",
    "startP": "{combos} የተለያዩ ባለ ሁለት ካርታ የመነሻ እጆች አሉ። ምን ያህል ጊዜ እንደሚደርስዎ፦",
    "startCols": [
      "እጅ",
      "ዕድል",
      "በግምት ከስንት እጅ አንድ ጊዜ"
    ],
    "starting": {
      "specificPair": "አንድ የተወሰነ ፖኬት ጥንድ፣ ለምሳሌ ኤሶች",
      "anyPair": "ማንኛውም ፖኬት ጥንድ",
      "specificNonPair": "አንድ የተወሰነ ጥንድ ያልሆነ እጅ፣ ለምሳሌ ኤስ-ኪንግ",
      "specificSuited": "አንድ የተወሰነ ተመሳሳይ ቀለም እጅ፣ ለምሳሌ ተመሳሳይ ቀለም ኤስ-ኪንግ",
      "anySuited": "ማንኛውም ሁለት ተመሳሳይ ቀለም ካርታዎች",
      "twoBroadway": "አስር ወይም ከዚያ በላይ የሆኑ ሁለት ካርታዎች"
    },
    "faqH2": "ጥያቄዎች",
    "faq": [
      [
        "በፖከር ውስጥ አውትስ ምንድን ናቸው?",
        "ምርጡን እጅ የሚሰጡዎት በስብስቡ ውስጥ የቀሩ ካርታዎች። ያላዩአቸውን ካርታዎች ብቻ ይቁጠሩ፦ በፍሎፕ ላይ 47፣ በተርን ላይ 46።"
      ],
      [
        "የፖኬት ኤሶች ኪንጎችን ምን ያህል ጊዜ ያሸንፋሉ?",
        "ከአምስት አራት ጊዜ ገደማ፦ አምስቱም የቦርድ ካርታዎች ሲከፋፈሉ {aakk}፣ ኪንጎቹ ደግሞ {kkaa} ያሸንፋሉ።"
      ],
      [
        "ኤስ-ኪንግ ከጥንድ ጋር የሳንቲም ውርወራ ነው?",
        "ከሞላ ጎደል፣ ከመካከለኛ ጥንድ ጋር፦ ኩዊኖች ከኤስ-ኪንግ ጋር {qqak} ያሸንፋሉ። ከትንሽ ጥንድ ጋር ደግሞ ይበልጥ ይቀራረባል — ሁለቶች {22ak} ያሸንፋሉ።"
      ],
      [
        "የፖት ዕድሎች ምንድን ናቸው?",
        "ሊያሸንፉት ከሚችሉት ፖት ጋር ሲነጻጸር የ Call ዋጋ። የማሸነፍ ዕድልዎ እርስዎ ከሚያስገቡት የመጨረሻው ፖት ድርሻ በላይ ከሆነ፣ Call ማድረግ በጊዜ ሂደት ትርፋማ ይሆናል።"
      ],
      [
        "PokerTH በጨዋታ ጊዜ ዕድሎቼን ያሳያል?",
        "አዎ። የ“ዕድሎች” ትር ካርታዎች ሲወጡ የአሁኑን ምርጥ እጅዎን እና የማሸነፍ ዕድልዎን ይጠራል፣ ስለዚህ በጠረጴዛው ላይ የራስዎን ምክንያት ማረጋገጥ ይችላሉ።"
      ]
    ]
  },
  ar: {
    "title": "احتمالات البوكر — الأوراق المنقذة واحتمالات القدر والمواجهات | PokerTH",
    "desc": "احتمالات Texas Hold’em محسوبة بدقة: الأوراق المنقذة وفرصة إصابتها، قاعدة 2 و4، احتمالات القدر، وكم مرة يفوز AA على KK أو QQ على AK.",
    "ldHeadline": "احتمالات البوكر: الأوراق المنقذة واحتمالات القدر ومواجهات ما قبل الفلوب",
    "ldDesc": "احتمالات Texas Hold’em محسوبة بدقة: الأوراق المنقذة، قاعدة 2 و4، احتمالات القدر ومواجهات ما قبل الفلوب.",
    "h1": "احتمالات البوكر: الأوراق المنقذة واحتمالات القدر ومواجهات ما قبل الفلوب",
    "lead": "القرارات الجيدة في البوكر تعود إلى بضعة أرقام: ما مدى احتمال أن تتحسّن يدك، وكم عليك أن تدفع لتعرف ذلك، وكيف تقف يدان إحداهما أمام الأخرى قبل الفلوب. كل رقم في هذه الصفحة محسوب بدقة، لا منقول من جدول.",
    "calc": {
      "h2": "حاسبة احتمالات البوكر",
      "intro": "اختر ورقتيك، وإن شئت أوراق الطاولة ويد أحد الخصوم. توزّع الحاسبة كل الأوراق المتبقية — بدقة كلما أمكن، وبالمحاكاة في غير ذلك — وتُظهر كم مرة تفوز.",
      "you": "يدك",
      "board": "أوراق الطاولة",
      "opp": "الخصم (اختياري)",
      "players": "الخصوم",
      "pick": "المس ورقة لتضعها في الخانة المحدّدة؛ والمس خانة لتفرغها.",
      "clear": "مسح",
      "win": "فوز",
      "tie": "تعادل",
      "lose": "خسارة",
      "exact": "دقيق: جميع التوزيعات الممكنة، وعددها {n}.",
      "sim": "محاكاة بعدد {n} من التوزيعات العشوائية.",
      "working": "جارٍ الحساب…",
      "need": "اختر ورقتيك لترى احتمالاتك.",
      "boardHint": "تأخذ أوراق الطاولة ثلاث أوراق (الفلوب)، ثم أربعًا، ثم خمسًا.",
      "oppHint": "اختر ورقتَي خصمك كلتيهما، أو لا شيء.",
      "final": "يدك النهائية",
      "noscript": "تحتاج الحاسبة إلى JavaScript. الجداول أدناه تعمل من دونها."
    },
    "outsH2": "الأوراق المنقذة: فرصتك في الإصابة",
    "outsP": "الورقة المنقذة (out) ورقة ما زالت في المجموعة وتجعل يدك هي الأرجح للفوز. على الفلوب تبقى 47 ورقة لم تُرَ: مع 9 أوراق منقذة تصيب ورقة واحدة على التيرن في {f9turn} من المرات، وحتى الريفر — مع ورقتين قادمتين — في {f9river}.",
    "outsCols": [
      "المشروع",
      "الأوراق المنقذة",
      "التيرن",
      "الريفر (من التيرن)",
      "التيرن أو الريفر (من الفلوب)"
    ],
    "draws": {
      "gutshot": "مشروع ستريت داخلي (gutshot)",
      "twoPairFull": "زوجان نحو فُل هاوس",
      "pairTrips": "زوج نحو زوجين أو ثلاثية",
      "twoOver": "ورقتان أعلى من أوراق الطاولة نحو زوج",
      "setFull": "ثلاثية مخفية نحو فُل هاوس أو رباعية",
      "oesd": "مشروع ستريت مفتوح الطرفين",
      "flush": "مشروع فلَش",
      "flushGut": "مشروع فلَش ومشروع ستريت داخلي",
      "flushOesd": "مشروع فلَش ومشروع ستريت مفتوح الطرفين"
    },
    "outsNote": "هذه فرص الحصول على إحدى أوراقك المنقذة. لا تشمل الإضافات التي تأتي من ورقتين متتاليتين (runner-runner)، والورقة التي تمنح الخصم أيضًا يدًا أفضل ليست ورقة منقذة حقًا.",
    "ruleH2": "قاعدة 2 و4",
    "ruleP": "تقدير سريع على الطاولة: اضرب عدد أوراقك المنقذة في 4 على الفلوب حين سترى التيرن والريفر معًا، وفي 2 حين لا تبقى إلا ورقة واحدة. مشروع الفلَش على الفلوب يعطي 9 × 4 = 36%، مقابل {f9river} بالضبط. القاعدة تبالغ في تقدير المشاريع الكبيرة: 15 ورقة منقذة تعطي 60%، والرقم الحقيقي {f15river}.",
    "potH2": "احتمالات القدر: هل تجاري؟",
    "potP": "تقارن احتمالات القدر بين ما يجب أن تدفعه وما يمكن أن تربحه. في القدر 100 ويراهن خصمك بـ50: تجاري بـ50 لتربح قدرًا من 200، فيجب أن تفوز المجاراة في أكثر من 50 ÷ 200 = 25% من المرات كي تكون مربحة. مع مشروع فلَش وورقة واحدة قادمة تصيب في {f9one} من المرات، لذا فإن مجاراة رهان حين لا يبقى إلا الريفر تُخسرك رقائق على المدى الطويل. أما في All-In على الفلوب، مع ورقتين قادمتين، فالمشروع نفسه يصيب في {f9river}، والمجاراة تستحق العناء.",
    "matchH2": "مواجهات ما قبل الفلوب",
    "matchP": "كيف تتواجه يدا بداية حين تُوزَّع أوراق الطاولة الخمس كلها، محسوبة على كل التشكيلات الممكنة لأوراق الطاولة وعددها {boards}. للأنواع أثر طفيف: الأيدي أدناه لا تشترك في أي نوع ما لم تظهر من النوع نفسه.",
    "matchCols": [
      "اليد",
      "مقابل",
      "تفوز",
      "تعادل",
      "تخسر"
    ],
    "startH2": "احتمالات أيدي البداية",
    "startP": "يوجد {combos} من أيدي البداية المختلفة ذات الورقتين. كم مرة تحصل على:",
    "startCols": [
      "اليد",
      "الاحتمال",
      "نحو مرة واحدة كل كذا يد"
    ],
    "starting": {
      "specificPair": "زوج معيّن في اليد، مثل الآصين",
      "anyPair": "أي زوج في اليد",
      "specificNonPair": "يد معيّنة بلا زوج، مثل آص-ملك",
      "specificSuited": "يد معيّنة من النوع نفسه، مثل آص-ملك من النوع نفسه",
      "anySuited": "أي ورقتين من النوع نفسه",
      "twoBroadway": "ورقتان من العشرة فما فوق"
    },
    "faqH2": "أسئلة",
    "faq": [
      [
        "ما هي الأوراق المنقذة (outs) في البوكر؟",
        "الأوراق الباقية في المجموعة والتي تمنحك أفضل يد. لا تَعُدّ إلا الأوراق التي لم ترها: 47 على الفلوب، و46 على التيرن."
      ],
      [
        "كم مرة يتغلب زوج الآصات على زوج الملوك؟",
        "نحو أربع مرات من خمس: {aakk} حين تُوزَّع أوراق الطاولة الخمس كلها، فيما تفوز الملوك في {kkaa}."
      ],
      [
        "هل مواجهة آص-ملك أمام زوج رمية عملة؟",
        "تقريبًا، أمام زوج متوسط: الملكات تفوز في {qqak} أمام آص-ملك. وأمام زوج صغير تكون أقرب من ذلك — زوج الاثنين يفوز في {22ak}."
      ],
      [
        "ما هي احتمالات القدر؟",
        "سعر المجاراة مقارنة بالقدر الذي يمكنك ربحه. إذا كانت فرصتك في الفوز أعلى من حصتك في القدر النهائي، أي ما تضعه أنت فيه، فإن المجاراة تكون مربحة مع الوقت."
      ],
      [
        "هل يعرض PokerTH احتمالاتي أثناء اللعب؟",
        "نعم. تبويب «الاحتمالات» يسمّي أفضل يد لديك حاليًا ويعرض فرصتك في الفوز مع ظهور الأوراق، فتتحقق من استنتاجاتك وأنت على الطاولة."
      ]
    ]
  },
  az: {
    "title": "Poker ehtimalları — autlar, bank ehtimalları, duellər | PokerTH",
    "desc": "Texas Hold’em ehtimalları dəqiq hesablanıb: autlar və onları tutmaq şansı, 2 və 4 qaydası, bank ehtimalları, AA-nın KK-ni, QQ-nun AK-nı nə qədər tez-tez udduğu.",
    "ldHeadline": "Poker ehtimalları: autlar, bank ehtimalları və preflop qarşılaşmaları",
    "ldDesc": "Dəqiq hesablanmış Texas Hold’em ehtimalları: autlar, 2 və 4 qaydası, bank ehtimalları və preflop qarşılaşmaları.",
    "h1": "Poker ehtimalları: autlar, bank ehtimalları və preflop qarşılaşmaları",
    "lead": "Yaxşı poker qərarları bir neçə rəqəmə əsaslanır: əlinizin güclənmə ehtimalı nə qədərdir, bunu öyrənmək üçün nə qədər ödəməlisiniz və floptan əvvəl iki əl bir-birinə qarşı necə dayanır. Bu səhifədəki hər rəqəm cədvəldən köçürülməyib, dəqiq hesablanıb.",
    "calc": {
      "h2": "Poker ehtimalları kalkulyatoru",
      "intro": "İki kartınızı və istəsəniz, bordu və rəqibin əlini seçin. Kalkulyator qalan bütün kartları paylayır — mümkün olduqda dəqiq, əks halda simulyasiya ilə — və nə qədər tez-tez qazandığınızı göstərir.",
      "you": "Sizin əliniz",
      "board": "Bord",
      "opp": "Rəqib (istəyə görə)",
      "players": "Rəqiblər",
      "pick": "Kartı işıqlandırılmış yerə qoymaq üçün ona toxunun; yeri boşaltmaq üçün yerə toxunun.",
      "clear": "Təmizlə",
      "win": "Qələbə",
      "tie": "Heç-heçə",
      "lose": "Məğlubiyyət",
      "exact": "Dəqiq: {n} mümkün paylanmanın hamısı.",
      "sim": "{n} təsadüfi paylanmanın simulyasiyası.",
      "working": "Hesablanır…",
      "need": "Ehtimallarınızı görmək üçün iki kartınızı seçin.",
      "boardHint": "Borda əvvəlcə üç kart (flop), sonra dörd, sonra beş kart qoyulur.",
      "oppHint": "Rəqibin hər iki kartını seçin və ya heç birini.",
      "final": "Son əliniz",
      "noscript": "Kalkulyator üçün JavaScript lazımdır. Aşağıdakı cədvəllər onsuz da işləyir."
    },
    "outsH2": "Autlar: tutmaq şansınız",
    "outsP": "Aut dəstədə hələ qalan və əlinizi ehtimal olunan qalibə çevirən kartdır. Flopda 47 kart görünməyib: 9 autla bir kart turnda {f9turn} ehtimalla gəlir, river-ə qədər isə — hələ iki kart qabaqda olanda — {f9river} ehtimalla.",
    "outsCols": [
      "Dro",
      "Autlar",
      "Turn",
      "River (turndan)",
      "Turn və ya river (flopdan)"
    ],
    "draws": {
      "gutshot": "Daxili streyt dro (gutshot)",
      "twoPairFull": "İki cütdən full-hauza",
      "pairTrips": "Cütdən iki cütə və ya üçlüyə",
      "twoOver": "Cüt üçün iki overkart",
      "setFull": "Setdən full-hauza və ya kareyə",
      "oesd": "Açıq streyt dro",
      "flush": "Flaş dro",
      "flushGut": "Flaş dro və gutshot",
      "flushOesd": "Flaş dro və açıq streyt dro"
    },
    "outsNote": "Bunlar autlarınızdan birini tutmaq şanslarıdır. Runner-runner (bekdor) əlavələri nəzərə alınmayıb, rəqibə də daha güclü əl verən aut isə əslində aut deyil.",
    "ruleH2": "2 və 4 qaydası",
    "ruleP": "Masada sürətli təxmin: həm turnu, həm də riveri görəcəksinizsə, flopda autlarınızı 4-ə, yalnız bir kart qalırsa 2-yə vurun. Flopda flaş dro 9 × 4 = 36% edir, dəqiq hesabla isə {f9river}. Qayda böyük droları şişirdir: 15 aut 60% verir, real rəqəm isə {f15river}.",
    "potH2": "Bank ehtimalları: call etməyə dəyərmi?",
    "potP": "Bank ehtimalları ödəməli olduğunuzu qazana biləcəyinizlə müqayisə edir. Bankda 100 var və rəqibiniz 50 qoyur: 200-lük bankı qazanmaq üçün 50 call edirsiniz, deməli call özünü doğrultmaq üçün halların 50 ÷ 200 = 25%-dən çoxunda qazanmalıdır. Flaş dro ilə və bir kart qalanda {f9one} ehtimalla tutursunuz, ona görə də yalnız river qalanda mərcə call etmək uzun müddətdə fişka itirdir. Flopda all-in olanda, hər iki kart qabaqda ikən, eyni dro {f9river} ehtimalla tutur və call etməyə dəyər.",
    "matchH2": "Preflop qarşılaşmaları",
    "matchP": "Bordun bütün beş kartı paylananda iki başlanğıc əlin bir-birinə qarşı nəticəsi, {boards} mümkün bordun hər biri üzrə hesablanıb. Rənglər bir az rol oynayır: aşağıdakı əllər eyni rəngli göstərilmədikcə ortaq rəngə malik deyil.",
    "matchCols": [
      "Əl",
      "Qarşı",
      "Qazanır",
      "Heç-heçə",
      "Uduzur"
    ],
    "startH2": "Başlanğıc əllərin ehtimalları",
    "startP": "{combos} müxtəlif iki kartlıq başlanğıc əl var. Nə qədər tez-tez sizə düşür:",
    "startCols": [
      "Əl",
      "Ehtimal",
      "Təxminən neçə əldən biri"
    ],
    "starting": {
      "specificPair": "Müəyyən cib cütü, məsələn, tuzlar",
      "anyPair": "İstənilən cib cütü",
      "specificNonPair": "Müəyyən cütsüz əl, məsələn, tuz-kral",
      "specificSuited": "Müəyyən eyni rəngli əl, məsələn, eyni rəngli tuz-kral",
      "anySuited": "İstənilən iki eyni rəngli kart",
      "twoBroadway": "Ondan və daha yüksək iki kart"
    },
    "faqH2": "Suallar",
    "faq": [
      [
        "Pokerdə autlar nədir?",
        "Dəstədə qalan və sizə ən yaxşı əli verəcək kartlar. Yalnız görmədiyiniz kartları sayın: flopda 47, turnda 46."
      ],
      [
        "Cib tuzları kralları nə qədər tez-tez udur?",
        "Təxminən beşdən dörd dəfə: bordun bütün beş kartı paylananda {aakk}, krallar isə {kkaa} ehtimalla qazanır."
      ],
      [
        "Tuz-kral cütə qarşı yazı-turadırmı?",
        "Orta cütə qarşı demək olar ki, bəli: damalar tuz-krala qarşı {qqak} qazanır. Kiçik cütə qarşı daha da bərabərdir — ikilər {22ak} qazanır."
      ],
      [
        "Bank ehtimalları nədir?",
        "Call-un qiymətinin qazana biləcəyiniz bankla müqayisəsi. Qazanma şansınız son bankda öz qoyduğunuz paydan yüksəkdirsə, call etmək zamanla özünü doğruldur."
      ],
      [
        "PokerTH oyun zamanı ehtimallarımı göstərirmi?",
        "Bəli. Ehtimallar tabı kartlar açıldıqca hazırkı ən yaxşı əlinizi və qazanma şansınızı göstərir, beləliklə masada öz mühakimənizi yoxlaya bilərsiniz."
      ]
    ]
  },
  be: {
    "title": "Шанцы ў покеры — аўты, шанцы банка, дуэлі рук | PokerTH",
    "desc": "Шанцы ў Texas Hold’em, разлічаныя дакладна: аўты і ваш шанец іх злавіць, правіла 2 і 4, шанцы банка і як часта AA б’е KK, а QQ — AK.",
    "ldHeadline": "Шанцы ў покеры: аўты, шанцы банка і супрацьстаянні на прэфлопе",
    "ldDesc": "Шанцы ў Texas Hold’em, разлічаныя дакладна: аўты, правіла 2 і 4, шанцы банка і супрацьстаянні на прэфлопе.",
    "h1": "Шанцы ў покеры: аўты, шанцы банка і супрацьстаянні на прэфлопе",
    "lead": "Добрыя рашэнні ў покеры зводзяцца да некалькіх лічбаў: наколькі верагодна, што ваша рука палепшыцца, колькі трэба заплаціць, каб гэта даведацца, і як дзве рукі стаяць адна супраць адной да флопа. Кожная лічба на гэтай старонцы разлічана дакладна, а не перапісана з табліцы.",
    "calc": {
      "h2": "Калькулятар шанцаў у покеры",
      "intro": "Выберыце дзве свае карты і, калі хочаце, борд і руку суперніка. Калькулятар перабірае ўсе карты, што засталіся, — дакладна, калі гэта магчыма, інакш сімуляцыяй — і паказвае, як часта вы выйграеце.",
      "you": "Ваша рука",
      "board": "Борд",
      "opp": "Супернік (неабавязкова)",
      "players": "Супернікі",
      "pick": "Націсніце на карту, каб пакласці яе ў падсветлены слот; націсніце на слот, каб ачысціць яго.",
      "clear": "Ачысціць",
      "win": "Выйгрыш",
      "tie": "Нічыя",
      "lose": "Пройгрыш",
      "exact": "Дакладна: усе {n} магчымых раздач.",
      "sim": "Сімуляцыя {n} выпадковых раздач.",
      "working": "Разлік…",
      "need": "Выберыце дзве свае карты, каб убачыць свае шанцы.",
      "boardHint": "На борд ідуць тры карты (флоп), потым чатыры, потым пяць.",
      "oppHint": "Выберыце абедзве карты суперніка або ніводнай.",
      "final": "Ваша выніковая камбінацыя",
      "noscript": "Калькулятару патрэбны JavaScript. Табліцы ніжэй працуюць і без яго."
    },
    "outsH2": "Аўты: ваш шанец трапіць",
    "outsP": "Аўт — гэта карта, якая яшчэ ў калодзе і робіць вашу руку верагодна выйгрышнай. На флопе 47 карт нябачныя: з 9 аўтамі карта прыходзіць на тэрне ў {f9turn} выпадкаў, а да рывера — калі наперадзе дзве карты — у {f9river}.",
    "outsCols": [
      "Дро",
      "Аўты",
      "Тэрн",
      "Рывер (з тэрна)",
      "Тэрн або рывер (з флопа)"
    ],
    "draws": {
      "gutshot": "Дро на ўнутраны стрыт (гатшот)",
      "twoPairFull": "Дзве пары да фул-хаўса",
      "pairTrips": "Пара да дзвюх пар або тройкі",
      "twoOver": "Дзве оверкарты да пары",
      "setFull": "Сэт да фул-хаўса або карэ",
      "oesd": "Двухбаковае дро на стрыт",
      "flush": "Дро на флэш",
      "flushGut": "Дро на флэш і гатшот",
      "flushOesd": "Дро на флэш і двухбаковае дро на стрыт"
    },
    "outsNote": "Гэта шанцы злавіць адзін з вашых аўтаў. Дадатковыя варыянты раннер-раннер не ўлічаны, а аўт, які заадно дае суперніку лепшую руку, насамрэч не аўт.",
    "ruleH2": "Правіла 2 і 4",
    "ruleP": "Хуткая ацэнка за сталом: памножце аўты на 4 на флопе, калі ўбачыце і тэрн, і рывер, і на 2, калі наперадзе толькі адна карта. Дро на флэш на флопе — гэта 9 × 4 = 36 %, а дакладна {f9river}. Правіла завышае вялікія дро: 15 аўтаў дае 60 %, а сапраўдная лічба — {f15river}.",
    "potH2": "Шанцы банка: ці рабіць Call?",
    "potP": "Шанцы банка параўноўваюць тое, што вы павінны заплаціць, з тым, што можаце выйграць. У банку 100, а супернік ставіць 50: вы ўраўноўваеце 50, каб выйграць банк у 200, таму Call павінен выйграваць часцей за 50 ÷ 200 = 25 % выпадкаў, каб акупіцца. З дро на флэш і адной картай наперадзе вы трапляеце ў {f9one} выпадкаў, таму ўраўноўваць стаўку, калі застаўся толькі рывер, у доўгай перспектыве — гэта страта фішак. Пры All-In на флопе, калі наперадзе абедзве карты, тое ж дро спрацоўвае ў {f9river}, і Call апраўданы.",
    "matchH2": "Супрацьстаянні на прэфлопе",
    "matchP": "Як дзве стартавыя рукі гуляюць адна супраць адной, калі здадзены ўсе пяць карт борда, з падлікам па кожным з {boards} магчымых бордаў. Масці крыху важныя: у рук ніжэй няма агульнай масці, калі яны не пазначаны як аднамасныя.",
    "matchCols": [
      "Рука",
      "Супраць",
      "Выйгрыш",
      "Нічыя",
      "Пройгрыш"
    ],
    "startH2": "Шанцы стартавых рук",
    "startP": "Існуе {combos} розных стартавых рук з дзвюх карт. Як часта вам здаюць:",
    "startCols": [
      "Рука",
      "Шанец",
      "Прыкладна адна раздача з"
    ],
    "starting": {
      "specificPair": "Пэўная кішэнная пара, напрыклад тузы",
      "anyPair": "Любая кішэнная пара",
      "specificNonPair": "Пэўная рука без пары, напрыклад туз-кароль",
      "specificSuited": "Пэўная аднамасная рука, напрыклад аднамасныя туз-кароль",
      "anySuited": "Любыя дзве карты адной масці",
      "twoBroadway": "Дзве карты ад дзесяткі і вышэй"
    },
    "faqH2": "Пытанні",
    "faq": [
      [
        "Што такое аўты ў покеры?",
        "Карты, што засталіся ў калодзе і дадуць вам лепшую руку. Лічыце толькі карты, якіх вы не бачылі: 47 на флопе, 46 на тэрне."
      ],
      [
        "Як часта кішэнныя тузы б’юць каралёў?",
        "Прыкладна чатыры разы з пяці: {aakk}, калі здадзены ўсе пяць карт борда, а каралі выйграюць {kkaa}."
      ],
      [
        "Туз-кароль супраць пары — гэта «манетка»?",
        "Амаль, супраць сярэдняй пары: дамы выйграюць {qqak} супраць туза-караля. Супраць малой пары яшчэ раўней — двойкі выйграюць {22ak}."
      ],
      [
        "Што такое шанцы банка?",
        "Цана Call у параўнанні з банкам, які вы можаце выйграць. Калі ваш шанец выйграць вышэйшы за долю выніковага банка, якую ўносіце вы, Call з часам акупляецца."
      ],
      [
        "Ці паказвае PokerTH мае шанцы падчас гульні?",
        "Так. Укладка «Шанцы» называе вашу бягучую лепшую камбінацыю і шанец выйграць па меры адкрыцця карт, так што вы можаце праверыць уласныя разлікі за сталом."
      ]
    ]
  },
  bg: {
    "title": "Покер шансове — аути, шансове на пота, двубои | PokerTH",
    "desc": "Шансовете в Texas Hold’em, изчислени точно: аути и шансът да ги хванете, правилото на 2 и 4, шансове на пота и колко често AA бие KK или QQ бие AK.",
    "ldHeadline": "Покер шансове: аути, шансове на пота и двубои преди флопа",
    "ldDesc": "Шансовете в Texas Hold’em, изчислени точно: аути, правилото на 2 и 4, шансове на пота и двубои преди флопа.",
    "h1": "Покер шансове: аути, шансове на пота и двубои преди флопа",
    "lead": "Добрите решения в покера се свеждат до няколко числа: колко вероятно е ръката ви да се подобри, колко трябва да платите, за да разберете, и как стоят две ръце една срещу друга преди флопа. Всяко число на тази страница е изчислено точно, а не преписано от таблица.",
    "calc": {
      "h2": "Калкулатор за покер шансове",
      "intro": "Изберете двете си карти и, ако желаете, борда и ръката на противник. Калкулаторът раздава всички оставащи карти — точно, когато е възможно, иначе чрез симулация — и показва колко често печелите.",
      "you": "Вашата ръка",
      "board": "Борд",
      "opp": "Противник (по избор)",
      "players": "Противници",
      "pick": "Докоснете карта, за да я поставите в осветеното място; докоснете място, за да го изпразните.",
      "clear": "Изчисти",
      "win": "Победа",
      "tie": "Равенство",
      "lose": "Загуба",
      "exact": "Точно: всяко от {n} възможни раздавания.",
      "sim": "Симулация на {n} случайни раздавания.",
      "working": "Изчисляване…",
      "need": "Изберете двете си карти, за да видите шансовете си.",
      "boardHint": "Бордът приема три карти (флопа), после четири, после пет.",
      "oppHint": "Изберете и двете карти на противника или нито една.",
      "final": "Крайната ви ръка",
      "noscript": "Калкулаторът изисква JavaScript. Таблиците по-долу работят и без него."
    },
    "outsH2": "Аути: шансът да хванете",
    "outsP": "Аут е карта, която още е в тестето и прави ръката ви вероятния победител. На флопа 47 карти са невидими: с 9 аута една карта уцелва на търна в {f9turn} от случаите, а до ривъра — с още две карти — в {f9river}.",
    "outsCols": [
      "Проект",
      "Аути",
      "Търн",
      "Ривър (от търна)",
      "Търн или ривър (от флопа)"
    ],
    "draws": {
      "gutshot": "Вътрешен стрейт проект (гътшот)",
      "twoPairFull": "Два чифта към фул хаус",
      "pairTrips": "Чифт към два чифта или тройка",
      "twoOver": "Две овъркарти към чифт",
      "setFull": "Сет към фул хаус или каре",
      "oesd": "Двустранен стрейт проект",
      "flush": "Флъш проект",
      "flushGut": "Флъш проект и гътшот",
      "flushOesd": "Флъш проект и двустранен стрейт проект"
    },
    "outsNote": "Това са шансовете да хванете един от аутите си. Не са включени допълнителните runner-runner варианти, а аут, който дава и на противника по-добра ръка, всъщност не е аут.",
    "ruleH2": "Правилото на 2 и 4",
    "ruleP": "Бърза оценка на масата: умножете аутите си по 4 на флопа, когато ще видите и търна, и ривъра, и по 2, когато предстои само една карта. Флъш проект на флопа дава 9 × 4 = 36%, срещу точно {f9river}. Правилото надценява големите проекти: 15 аута дават 60%, а реалната стойност е {f15river}.",
    "potH2": "Шансове на пота: да платите ли?",
    "potP": "Шансовете на пота сравняват това, което трябва да платите, с това, което можете да спечелите. В пота има 100 и противникът залага 50: плащате 50, за да спечелите пот от 200, така че плащането трябва да печели в повече от 50 ÷ 200 = 25% от случаите, за да се изплати. С флъш проект и една оставаща карта уцелвате в {f9one} от случаите, така че да платите залог, когато остава само ривърът, в дългосрочен план губи чипове. При All-In на флопа, с две оставащи карти, същият проект уцелва в {f9river} и си струва да платите.",
    "matchH2": "Двубои преди флопа",
    "matchP": "Как се представят две начални ръце една срещу друга, когато се раздадат и петте карти на борда, преброено за всеки от {boards} възможни борда. Боите имат малко значение: ръцете по-долу нямат обща боя, освен ако не са показани като едноцветни.",
    "matchCols": [
      "Ръка",
      "Срещу",
      "Печели",
      "Равенство",
      "Губи"
    ],
    "startH2": "Шансове за начални ръце",
    "startP": "Съществуват {combos} различни начални ръце от две карти. Колко често ви се пада:",
    "startCols": [
      "Ръка",
      "Шанс",
      "Около една ръка на"
    ],
    "starting": {
      "specificPair": "Определен чифт в ръката, например аса",
      "anyPair": "Който и да е чифт в ръката",
      "specificNonPair": "Определена ръка без чифт, например асо-поп",
      "specificSuited": "Определена едноцветна ръка, например асо-поп от една боя",
      "anySuited": "Които и да е две карти от една боя",
      "twoBroadway": "Две карти от десетка нагоре"
    },
    "faqH2": "Въпроси",
    "faq": [
      [
        "Какво са аутите в покера?",
        "Картите, останали в тестето, които биха ви дали най-добрата ръка. Броят се само картите, които не сте видели: 47 на флопа, 46 на търна."
      ],
      [
        "Колко често чифт аса бие чифт попове?",
        "Около четири пъти от пет: {aakk}, когато се раздадат и петте карти на борда, а поповете печелят {kkaa}."
      ],
      [
        "Асо-поп срещу чифт — ези-тура ли е?",
        "Почти, срещу среден чифт: дамите печелят {qqak} срещу асо-поп. Срещу малък чифт е още по-близо — двойките печелят {22ak}."
      ],
      [
        "Какво са шансовете на пота?",
        "Цената на плащането в сравнение с пота, който можете да спечелите. Ако шансът ви да спечелите е по-голям от дела от крайния пот, който влагате, плащането се изплаща с времето."
      ],
      [
        "Показва ли PokerTH шансовете ми по време на игра?",
        "Да. Разделът Шансове показва текущата ви най-добра ръка и шанса ви за победа, докато картите излизат, така че можете да проверите собствените си разсъждения на масата."
      ]
    ]
  },
  bn: {
    "title": "পোকার অডস চার্ট — আউট, পট অডস, হাতের লড়াই | PokerTH",
    "desc": "নিখুঁতভাবে হিসাব করা Texas Hold’em অডস: আউট ও সেগুলো পাওয়ার সম্ভাবনা, ২ ও ৪-এর নিয়ম, পট অডস, আর AA কত ঘন ঘন KK-কে বা QQ কত ঘন ঘন AK-কে হারায়।",
    "ldHeadline": "পোকার অডস: আউট, পট অডস আর ফ্লপের আগের লড়াই",
    "ldDesc": "নিখুঁতভাবে হিসাব করা Texas Hold’em অডস: আউট, ২ ও ৪-এর নিয়ম, পট অডস আর ফ্লপের আগের লড়াই।",
    "h1": "পোকার অডস: আউট, পট অডস আর ফ্লপের আগের লড়াই",
    "lead": "পোকারে ভালো সিদ্ধান্ত কয়েকটি সংখ্যায় এসে দাঁড়ায়: আপনার হাত উন্নত হওয়ার সম্ভাবনা কতটা, তা জানতে কত দিতে হবে, আর ফ্লপের আগে দুটি হাত একে অপরের বিরুদ্ধে কোথায় দাঁড়িয়ে। এই পাতার প্রতিটি সংখ্যা নিখুঁতভাবে হিসাব করা, কোনো চার্ট থেকে নকল করা নয়।",
    "calc": {
      "h2": "পোকার অডস ক্যালকুলেটর",
      "intro": "আপনার দুটি কার্ড বেছে নিন, আর চাইলে বোর্ড ও একজন প্রতিপক্ষের হাতও। ক্যালকুলেটর বাকি সব কার্ড বেঁটে দেখে — যখনই সম্ভব নিখুঁতভাবে, নইলে সিমুলেশনে — এবং দেখায় আপনি কত ঘন ঘন জেতেন।",
      "you": "আপনার হাত",
      "board": "বোর্ড",
      "opp": "প্রতিপক্ষ (ঐচ্ছিক)",
      "players": "প্রতিপক্ষ",
      "pick": "হাইলাইট করা ঘরে বসাতে একটি কার্ডে ট্যাপ করুন; ঘর খালি করতে সেই ঘরে ট্যাপ করুন।",
      "clear": "মুছুন",
      "win": "জয়",
      "tie": "সমান",
      "lose": "হার",
      "exact": "নিখুঁত: সম্ভাব্য {n}টি বাঁটের প্রতিটি।",
      "sim": "{n}টি এলোমেলো বাঁটের সিমুলেশন।",
      "working": "হিসাব চলছে…",
      "need": "আপনার সম্ভাবনা দেখতে আপনার দুটি কার্ড বেছে নিন।",
      "boardHint": "বোর্ডে প্রথমে তিনটি কার্ড (ফ্লপ), তারপর চারটি, তারপর পাঁচটি।",
      "oppHint": "প্রতিপক্ষের দুটি কার্ডই বেছে নিন, অথবা একটিও নয়।",
      "final": "আপনার চূড়ান্ত হাত",
      "noscript": "ক্যালকুলেটরের জন্য JavaScript দরকার। নিচের সারণিগুলো তা ছাড়াই কাজ করে।"
    },
    "outsH2": "আউট: মেলার সম্ভাবনা",
    "outsP": "আউট হলো ডেকে এখনও থাকা এমন কার্ড, যা আপনার হাতকে সম্ভাব্য বিজয়ী করে তোলে। ফ্লপে ৪৭টি কার্ড অদেখা: ৯টি আউট থাকলে টার্নে একটি কার্ড মেলে {f9turn} ক্ষেত্রে, আর রিভার পর্যন্ত — দুটি কার্ড আসা বাকি থাকলে — {f9river} ক্ষেত্রে।",
    "outsCols": [
      "অপেক্ষা",
      "আউট",
      "টার্ন",
      "রিভার (টার্ন থেকে)",
      "টার্ন বা রিভার (ফ্লপ থেকে)"
    ],
    "draws": {
      "gutshot": "ভেতরের স্ট্রেটের অপেক্ষা (গাটশট)",
      "twoPairFull": "Two Pair থেকে Full House",
      "pairTrips": "One Pair থেকে Two Pair বা Three of a Kind",
      "twoOver": "বোর্ডের চেয়ে বড় দুটি কার্ড থেকে জোড়া",
      "setFull": "লুকানো তিন (সেট) থেকে Full House বা Four of a Kind",
      "oesd": "দুই দিক খোলা স্ট্রেটের অপেক্ষা",
      "flush": "ফ্লাশের অপেক্ষা",
      "flushGut": "ফ্লাশের অপেক্ষা ও গাটশট",
      "flushOesd": "ফ্লাশের অপেক্ষা ও দুই দিক খোলা স্ট্রেটের অপেক্ষা"
    },
    "outsNote": "এগুলো আপনার আউটগুলোর একটি পাওয়ার সম্ভাবনা। রানার-রানারের বাড়তি সুযোগ এতে ধরা হয়নি, আর যে আউট প্রতিপক্ষকেও আরও ভালো হাত দেয়, সেটি আসলে আউট নয়।",
    "ruleH2": "২ ও ৪-এর নিয়ম",
    "ruleP": "টেবিলে দ্রুত আন্দাজ: ফ্লপে যখন টার্ন ও রিভার দুটোই দেখবেন, তখন আউটের সংখ্যাকে ৪ দিয়ে গুণ করুন, আর যখন মাত্র একটি কার্ড আসা বাকি, তখন ২ দিয়ে। ফ্লপে ফ্লাশের অপেক্ষা মানে ৯ × ৪ = ৩৬%, যেখানে নিখুঁত হিসাব {f9river}। বড় অপেক্ষার বেলায় নিয়মটি বাড়িয়ে বলে: ১৫টি আউটে আসে ৬০%, আসল সংখ্যা {f15river}।",
    "potH2": "পট অডস: কল করবেন কি?",
    "potP": "পট অডস (পটের হিসাব) মেলায় আপনাকে কত দিতে হবে আর আপনি কত জিততে পারেন। পটে আছে ১০০ আর প্রতিপক্ষ বাজি ধরেন ৫০: আপনি ২০০-র পট জিততে ৫০ দিয়ে কল করেন, তাই লাভজনক হতে কলটিকে ৫০ ÷ ২০০ = ২৫%-এর বেশি ক্ষেত্রে জিততে হবে। ফ্লাশের অপেক্ষা নিয়ে একটি কার্ড বাকি থাকলে আপনার কার্ড মেলে {f9one} ক্ষেত্রে, তাই কেবল রিভার বাকি থাকতে একটি বাজিতে কল করলে দীর্ঘমেয়াদে চিপ হারাবেন। ফ্লপে All-In হলে, দুটি কার্ডই আসা বাকি থাকায়, একই অপেক্ষা পূর্ণ হয় {f9river} ক্ষেত্রে, আর কলটি করা লাভজনক।",
    "matchH2": "ফ্লপের আগের লড়াই",
    "matchP": "বোর্ডের পাঁচটি কার্ডই দেওয়া হলে দুটি শুরুর হাত একে অপরের বিরুদ্ধে কেমন করে, সম্ভাব্য {boards}টি বোর্ডের প্রতিটি ধরে গোনা। সুট সামান্য প্রভাব ফেলে: নিচের হাতগুলোর কোনো সুট মেলে না, যদি না একই সুট বলে দেখানো থাকে।",
    "matchCols": [
      "হাত",
      "বিপক্ষে",
      "জেতে",
      "সমান",
      "হারে"
    ],
    "startH2": "শুরুর হাতের সম্ভাবনা",
    "startP": "দুই কার্ডের শুরুর হাত মোট {combos} রকমের। কত ঘন ঘন আপনি পান:",
    "startCols": [
      "হাত",
      "সম্ভাবনা",
      "মোটামুটি প্রতি কত হাতে একবার"
    ],
    "starting": {
      "specificPair": "নির্দিষ্ট একটি হাতের জোড়া, যেমন দুটি টেক্কা",
      "anyPair": "যেকোনো হাতের জোড়া",
      "specificNonPair": "নির্দিষ্ট একটি জোড়াহীন হাত, যেমন টেক্কা-সাহেব",
      "specificSuited": "নির্দিষ্ট একটি একই সুটের হাত, যেমন একই সুটের টেক্কা-সাহেব",
      "anySuited": "একই সুটের যেকোনো দুটি কার্ড",
      "twoBroadway": "দশ বা তার বড় দুটি কার্ড"
    },
    "faqH2": "প্রশ্নোত্তর",
    "faq": [
      [
        "পোকারে আউট কী?",
        "ডেকে বাকি থাকা যে কার্ডগুলো আপনাকে সেরা হাত দেবে। কেবল যে কার্ডগুলো দেখেননি সেগুলোই গুনুন: ফ্লপে ৪৭টি, টার্নে ৪৬টি।"
      ],
      [
        "হাতের জোড়া টেক্কা কত ঘন ঘন সাহেবের জোড়াকে হারায়?",
        "মোটামুটি পাঁচবারে চারবার: বোর্ডের পাঁচটি কার্ডই দেওয়া হলে {aakk}, আর সাহেবরা জেতে {kkaa}।"
      ],
      [
        "টেক্কা-সাহেব বনাম একটি জোড়া কি টস করার মতো?",
        "মাঝারি জোড়ার বিপক্ষে প্রায় তা-ই: বিবির জোড়া টেক্কা-সাহেবের বিপক্ষে জেতে {qqak}। ছোট জোড়ার বিপক্ষে আরও কাছাকাছি — দুরির জোড়া জেতে {22ak}।"
      ],
      [
        "পট অডস কী?",
        "কল করার দাম, যে পট জিততে পারেন তার তুলনায়। চূড়ান্ত পটে আপনার দেওয়া অংশের চেয়ে জেতার সম্ভাবনা বেশি হলে, দীর্ঘমেয়াদে কল করা লাভজনক।"
      ],
      [
        "খেলার সময় PokerTH কি আমার সম্ভাবনা দেখায়?",
        "হ্যাঁ। Odds ট্যাব কার্ড খুলতে খুলতে আপনার তখনকার সেরা হাতের নাম আর জেতার সম্ভাবনা দেখায়, যাতে টেবিলেই নিজের যুক্তি যাচাই করতে পারেন।"
      ]
    ]
  },
  bs: {
    "title": "Šanse u pokeru — outsi, izgledi pota i dueli | PokerTH",
    "desc": "Šanse u Texas Hold’emu izračunate tačno: outsi i šansa da ih pogodiš, pravilo 2 i 4, izgledi pota i koliko često AA pobjeđuje KK ili QQ pobjeđuje AK.",
    "ldHeadline": "Šanse u pokeru: outsi, izgledi pota i dueli prije flopa",
    "ldDesc": "Šanse u Texas Hold’emu izračunate tačno: outsi, pravilo 2 i 4, izgledi pota i dueli ruku prije flopa.",
    "h1": "Šanse u pokeru: outsi, izgledi pota i dueli prije flopa",
    "lead": "Dobre odluke u pokeru svode se na nekoliko brojeva: koliko je vjerovatno da će se tvoja ruka popraviti, koliko moraš platiti da to saznaš i kako dvije ruke stoje jedna protiv druge prije flopa. Svaki broj na ovoj stranici izračunat je tačno, a ne prepisan iz tabele.",
    "calc": {
      "h2": "Kalkulator šansi u pokeru",
      "intro": "Izaberi svoje dvije karte i, ako želiš, karte na stolu i ruku protivnika. Kalkulator dijeli sve preostale karte — tačno kad god može, inače simulacijom — i pokazuje koliko često pobjeđuješ.",
      "you": "Tvoja ruka",
      "board": "Sto",
      "opp": "Protivnik (neobavezno)",
      "players": "Protivnici",
      "pick": "Dodirni kartu da je staviš u istaknuto polje; dodirni polje da ga isprazniš.",
      "clear": "Očisti",
      "win": "Pobjeda",
      "tie": "Neriješeno",
      "lose": "Poraz",
      "exact": "Tačno: svako od {n} mogućih dijeljenja.",
      "sim": "Simulacija {n} nasumičnih dijeljenja.",
      "working": "Računam…",
      "need": "Izaberi svoje dvije karte da vidiš svoje šanse.",
      "boardHint": "Na sto idu tri karte (flop), zatim četiri, pa pet.",
      "oppHint": "Izaberi obje karte protivnika ili nijednu.",
      "final": "Tvoja konačna ruka",
      "noscript": "Kalkulatoru treba JavaScript. Tabele ispod rade i bez njega."
    },
    "outsH2": "Outsi: tvoja šansa za pogodak",
    "outsP": "Outs je karta koja je još u špilu i koja tvoju ruku pretvara u vjerovatnog pobjednika. Na flopu je 47 karata neviđeno: s 9 outsa jedna karta pogađa na turnu u {f9turn} slučajeva, a do rivera — s još dvije karte koje dolaze — u {f9river}.",
    "outsCols": [
      "Čekanje",
      "Outsi",
      "Turn",
      "River (od turna)",
      "Turn ili river (od flopa)"
    ],
    "draws": {
      "gutshot": "Čekanje na unutrašnju skalu (gutshot)",
      "twoPairFull": "Dva para do full housea",
      "pairTrips": "Par do dva para ili trojke",
      "twoOver": "Dvije overkarte do para",
      "setFull": "Set do full housea ili četvorke",
      "oesd": "Čekanje na otvorenu skalu",
      "flush": "Čekanje na boju",
      "flushGut": "Čekanje na boju i gutshot",
      "flushOesd": "Čekanje na boju i otvorenu skalu"
    },
    "outsNote": "Ovo su šanse da pogodiš jedan od svojih outsa. Ne uključuju dodatne runner-runner kombinacije, a outs koji i protivniku daje bolju ruku zapravo nije outs.",
    "ruleH2": "Pravilo 2 i 4",
    "ruleP": "Brza procjena za stolom: pomnoži outse sa 4 na flopu kad ćeš vidjeti i turn i river, a sa 2 kad dolazi još samo jedna karta. Čekanje na boju na flopu je 9 × 4 = 36%, naspram tačnih {f9river}. Pravilo precjenjuje velika čekanja: 15 outsa daje 60%, a stvarna brojka je {f15river}.",
    "potH2": "Izgledi pota: da li platiti?",
    "potP": "Izgledi pota upoređuju ono što moraš platiti s onim što možeš osvojiti. U potu je 100, a protivnik ulaže 50: plaćaš 50 da osvojiš pot od 200, pa plaćanje mora pobjeđivati u više od 50 ÷ 200 = 25% slučajeva da bi se isplatilo. S čekanjem na boju i jednom kartom koja dolazi pogađaš u {f9one} slučajeva, pa plaćanje uloga kad je ostao samo river dugoročno gubi žetone. Kod all-ina na flopu, kad dolaze još obje karte, isto čekanje pogađa u {f9river} slučajeva i plaćanje se isplati.",
    "matchH2": "Dueli prije flopa",
    "matchP": "Kako dvije početne ruke stoje jedna protiv druge kad se podijeli svih pet karata na stolu, prebrojano na svakom od {boards} mogućih stolova. Boje malo utiču: ruke ispod ne dijele nijednu boju, osim ako nisu prikazane u istoj boji.",
    "matchCols": [
      "Ruka",
      "Protiv",
      "Pobjeđuje",
      "Neriješeno",
      "Gubi"
    ],
    "startH2": "Šanse početnih ruku",
    "startP": "Postoji {combos} različitih početnih ruku od dvije karte. Koliko često dobiješ:",
    "startCols": [
      "Ruka",
      "Šansa",
      "Otprilike jedna ruka od"
    ],
    "starting": {
      "specificPair": "Određeni par u ruci, npr. asovi",
      "anyPair": "Bilo koji par u ruci",
      "specificNonPair": "Određena ruka bez para, npr. as-kralj",
      "specificSuited": "Određena ruka iste boje, npr. as-kralj u istoj boji",
      "anySuited": "Bilo koje dvije karte iste boje",
      "twoBroadway": "Dvije karte od desetke naviše"
    },
    "faqH2": "Pitanja",
    "faq": [
      [
        "Šta su outsi u pokeru?",
        "Karte koje su ostale u špilu i dale bi ti najbolju ruku. Broji samo karte koje nisi vidio: 47 na flopu, 46 na turnu."
      ],
      [
        "Koliko često asovi pobjeđuju kraljeve?",
        "Otprilike četiri puta od pet: {aakk} kad se podijeli svih pet karata na stolu, dok kraljevi pobjeđuju u {kkaa}."
      ],
      [
        "Je li as-kralj protiv para bacanje novčića?",
        "Gotovo, protiv srednjeg para: dame pobjeđuju as-kralja u {qqak}. Protiv malog para još je tješnje — dvojke pobjeđuju u {22ak}."
      ],
      [
        "Šta su izgledi pota?",
        "Cijena plaćanja u poređenju s potom koji možeš osvojiti. Ako je tvoja šansa za pobjedu veća od udjela konačnog pota koji ti uložiš, plaćanje se s vremenom isplati."
      ],
      [
        "Prikazuje li PokerTH moje šanse tokom igre?",
        "Da. Kartica „Izgledi” navodi tvoju trenutno najbolju kombinaciju i šansu za pobjedu kako karte izlaze, pa za stolom možeš provjeriti vlastito razmišljanje."
      ]
    ]
  },
  ca: {
    "title": "Probabilitats del pòquer — outs, pot i duels de mans | PokerTH",
    "desc": "Probabilitats exactes del Texas Hold’em: outs i la probabilitat d’encertar-los, la regla del 2 i el 4, probabilitats del pot i quants cops AA guanya KK o QQ guanya AK.",
    "ldHeadline": "Probabilitats del pòquer: outs, probabilitats del pot i duels abans del flop",
    "ldDesc": "Probabilitats del Texas Hold’em calculades exactament: outs, la regla del 2 i el 4, probabilitats del pot i duels abans del flop.",
    "h1": "Probabilitats del pòquer: outs, probabilitats del pot i duels abans del flop",
    "lead": "Les bones decisions al pòquer es redueixen a uns quants números: com de probable és que la teva mà millori, quant has de pagar per saber-ho, i com estan dues mans l’una contra l’altra abans del flop. Cada xifra d’aquesta pàgina està calculada exactament, no copiada d’una taula.",
    "calc": {
      "h2": "Calculadora de probabilitats de pòquer",
      "intro": "Tria les teves dues cartes i, si vols, la taula i la mà d’un rival. La calculadora reparteix totes les cartes que queden — exactament sempre que pot, per simulació si no — i mostra quantes vegades guanyes.",
      "you": "La teva mà",
      "board": "Taula",
      "opp": "Rival (opcional)",
      "players": "Rivals",
      "pick": "Toca una carta per posar-la a la casella marcada; toca una casella per buidar-la.",
      "clear": "Esborra",
      "win": "Victòria",
      "tie": "Empat",
      "lose": "Derrota",
      "exact": "Exacte: cadascun dels {n} repartiments possibles.",
      "sim": "Simulació de {n} repartiments a l’atzar.",
      "working": "Calculant…",
      "need": "Tria les teves dues cartes per veure les teves probabilitats.",
      "boardHint": "La taula admet tres cartes (el flop), després quatre i després cinc.",
      "oppHint": "Tria les dues cartes del rival, o cap.",
      "final": "La teva mà final",
      "noscript": "La calculadora necessita JavaScript. Les taules de sota funcionen sense."
    },
    "outsH2": "Outs: la teva probabilitat d’encertar",
    "outsP": "Un out és una carta que encara és a la baralla i que converteix la teva mà en la probable guanyadora. Al flop hi ha 47 cartes no vistes: amb 9 outs, una carta encerta al turn el {f9turn} de les vegades, i fins al river — amb dues cartes per sortir — el {f9river}.",
    "outsCols": [
      "Projecte",
      "Outs",
      "Turn",
      "River (des del turn)",
      "Turn o river (des del flop)"
    ],
    "draws": {
      "gutshot": "Projecte d’escala interior (gutshot)",
      "twoPairFull": "Dobles parelles cap a full",
      "pairTrips": "Una parella cap a dobles parelles o trio",
      "twoOver": "Dues cartes superiors cap a parella",
      "setFull": "Set cap a full o pòquer",
      "oesd": "Projecte d’escala oberta",
      "flush": "Projecte de color",
      "flushGut": "Projecte de color i gutshot",
      "flushOesd": "Projecte de color i d’escala oberta"
    },
    "outsNote": "Aquestes són les probabilitats d’encertar un dels teus outs. No compten els extres runner-runner, i un out que també dona una mà millor a un rival no és realment un out.",
    "ruleH2": "La regla del 2 i el 4",
    "ruleP": "Una estimació ràpida a la taula: multiplica els teus outs per 4 al flop quan veuràs tant el turn com el river, i per 2 quan només falta una carta. Un projecte de color al flop és 9 × 4 = 36 %, davant d’un {f9river} exacte. La regla sobreestima els projectes grans: 15 outs donen un 60 %, i la xifra real és {f15river}.",
    "potH2": "Probabilitats del pot: has d’igualar?",
    "potP": "Les probabilitats del pot comparen el que has de pagar amb el que pots guanyar. Al pot hi ha 100 i el rival aposta 50: iguales 50 per guanyar un pot de 200, de manera que el Call ha de guanyar més del 50 ÷ 200 = 25 % de les vegades per sortir a compte. Amb un projecte de color i una carta per sortir encertes el {f9one} de les vegades, així que igualar una aposta quan només queda el river fa perdre fitxes a la llarga. All-in al flop, amb les dues cartes per sortir, el mateix projecte encerta el {f9river}, i val la pena igualar.",
    "matchH2": "Duels abans del flop",
    "matchP": "Com rendeixen dues mans inicials l’una contra l’altra quan es reparteixen les cinc cartes de la taula, comptat sobre cadascuna de les {boards} taules possibles. Els pals importen una mica: les mans de sota no comparteixen cap pal tret que es mostrin del mateix pal.",
    "matchCols": [
      "Mà",
      "Contra",
      "Guanya",
      "Empat",
      "Perd"
    ],
    "startH2": "Probabilitats de les mans inicials",
    "startP": "Hi ha {combos} mans inicials diferents de dues cartes. Amb quina freqüència et toca:",
    "startCols": [
      "Mà",
      "Probabilitat",
      "Aprox. una mà de cada"
    ],
    "starting": {
      "specificPair": "Una parella servida concreta, com ara asos",
      "anyPair": "Qualsevol parella servida",
      "specificNonPair": "Una mà concreta sense parella, com ara as-rei",
      "specificSuited": "Una mà concreta del mateix pal, com ara as-rei del mateix pal",
      "anySuited": "Qualsevol parell de cartes del mateix pal",
      "twoBroadway": "Dues cartes de deu o més"
    },
    "faqH2": "Preguntes",
    "faq": [
      [
        "Què són els outs al pòquer?",
        "Les cartes que queden a la baralla i que et donarien la millor mà. Compta només les cartes que no has vist: 47 al flop, 46 al turn."
      ],
      [
        "Quantes vegades guanyen els asos servits als reis?",
        "Unes quatre vegades de cada cinc: el {aakk} quan es reparteixen les cinc cartes de la taula, i els reis guanyen el {kkaa}."
      ],
      [
        "As-rei contra una parella és un cara o creu?",
        "Gairebé, contra una parella mitjana: les dames guanyen el {qqak} contra as-rei. Contra una parella petita encara és més ajustat — els dosos guanyen el {22ak}."
      ],
      [
        "Què són les probabilitats del pot?",
        "El preu d’un Call comparat amb el pot que pots guanyar. Si la teva probabilitat de guanyar és més alta que la part del pot final que hi poses, igualar surt a compte amb el temps."
      ],
      [
        "El PokerTH mostra les meves probabilitats durant la partida?",
        "Sí. La pestanya «Probabilitats» indica la teva millor mà del moment i la teva probabilitat de guanyar a mesura que surten les cartes, perquè puguis comprovar el teu propi raonament a la taula."
      ]
    ]
  },
  cs: {
    "title": "Pokerové pravděpodobnosti — outy, pot odds, souboje | PokerTH",
    "desc": "Pravděpodobnosti v Texas Hold’em přesně spočítané: outy a vaše šance je trefit, pravidlo 2 a 4, pot odds a jak často AA porazí KK nebo QQ porazí AK.",
    "ldHeadline": "Pravděpodobnosti v pokeru: outy, pot odds a souboje před flopem",
    "ldDesc": "Pravděpodobnosti v Texas Hold’em spočítané přesně: outy, pravidlo 2 a 4, pot odds a souboje před flopem.",
    "h1": "Pravděpodobnosti v pokeru: outy, pot odds a souboje před flopem",
    "lead": "Dobrá rozhodnutí v pokeru se točí kolem několika čísel: jak pravděpodobně se vaše kombinace zlepší, kolik musíte zaplatit, abyste to zjistili, a jak si dvě ruce stojí proti sobě před flopem. Každé číslo na této stránce je spočítané přesně, ne opsané z tabulky.",
    "calc": {
      "h2": "Kalkulačka pokerových pravděpodobností",
      "intro": "Vyberte své dvě karty a případně i stůl a ruku soupeře. Kalkulačka rozdá všechny zbývající karty — přesně, kdykoli to jde, jinak simulací — a ukáže, jak často vyhrajete.",
      "you": "Vaše ruka",
      "board": "Stůl",
      "opp": "Soupeř (nepovinné)",
      "players": "Soupeři",
      "pick": "Klepnutím na kartu ji vložíte na zvýrazněné místo; klepnutím na místo ho vyprázdníte.",
      "clear": "Vymazat",
      "win": "Výhra",
      "tie": "Dělba",
      "lose": "Prohra",
      "exact": "Přesně: všech {n} možných rozdání.",
      "sim": "Simulace {n} náhodných rozdání.",
      "working": "Počítám…",
      "need": "Vyberte své dvě karty a uvidíte své šance.",
      "boardHint": "Na stůl patří tři karty (flop), pak čtyři, pak pět.",
      "oppHint": "Vyberte obě karty soupeře, nebo žádnou.",
      "final": "Vaše konečná kombinace",
      "noscript": "Kalkulačka potřebuje JavaScript. Tabulky níže fungují i bez něj."
    },
    "outsH2": "Outy: vaše šance trefit",
    "outsP": "Out je karta, která je ještě v balíčku a udělá z vaší ruky pravděpodobného vítěze. Na flopu je 47 karet neviděných: s 9 outy jedna karta trefí na turnu v {f9turn} případů a do riveru — se dvěma kartami k rozdání — v {f9river} případů.",
    "outsCols": [
      "Dotažení",
      "Outy",
      "Turn",
      "River (od turnu)",
      "Turn nebo river (od flopu)"
    ],
    "draws": {
      "gutshot": "Dotažení na vnitřní postupku (gutshot)",
      "twoPairFull": "Dvě dvojice na full house",
      "pairTrips": "Pár na dvě dvojice nebo trojici",
      "twoOver": "Dvě vyšší karty (overcards) na pár",
      "setFull": "Set na full house nebo čtveřici",
      "oesd": "Oboustranné dotažení na postupku",
      "flush": "Dotažení na barvu",
      "flushGut": "Dotažení na barvu a gutshot",
      "flushOesd": "Dotažení na barvu a oboustranné dotažení na postupku"
    },
    "outsNote": "Jde o šance, že dojde jeden z vašich outů. Nezahrnují dodatečné šance přes dvě karty po sobě (runner-runner) a out, který zároveň dá soupeři lepší kombinaci, vlastně out není.",
    "ruleH2": "Pravidlo 2 a 4",
    "ruleP": "Rychlý odhad u stolu: na flopu vynásobte své outy 4, když uvidíte turn i river, a 2, když zbývá jen jedna karta. Dotažení na barvu na flopu dává 9 × 4 = 36 %, zatímco přesně je to {f9river}. Pravidlo velká dotažení nadhodnocuje: 15 outů dává 60 %, skutečné číslo je {f15river}.",
    "potH2": "Pot odds: dorovnat, nebo ne?",
    "potP": "Pot odds (šance banku) porovnávají, kolik musíte zaplatit, s tím, kolik můžete vyhrát. V banku je 100 a soupeř vsadí 50: dorovnáte 50, abyste vyhráli bank 200, takže aby se dorovnání vyplatilo, musí vyhrávat ve více než 50 ÷ 200 = 25 % případů. S dotažením na barvu a jednou kartou k rozdání trefíte v {f9one} případů, takže dorovnat sázku, když zbývá jen river, z dlouhodobého hlediska prodělává žetony. All-in na flopu, se dvěma kartami k rozdání, trefí stejné dotažení v {f9river} případů a dorovnání se vyplatí.",
    "matchH2": "Souboje před flopem",
    "matchP": "Jak si dvě startovní ruce vedou proti sobě, když se rozdá všech pět karet na stůl, spočítáno přes všech {boards} možných rozdání stolu. Barvy hrají malou roli: ruce níže nesdílejí žádnou barvu, pokud nejsou uvedeny jako stejnobarevné.",
    "matchCols": [
      "Ruka",
      "Proti",
      "Vyhrává",
      "Dělba",
      "Prohrává"
    ],
    "startH2": "Pravděpodobnost startovních rukou",
    "startP": "Existuje {combos} různých startovních rukou ze dvou karet. Jak často dostanete:",
    "startCols": [
      "Ruka",
      "Šance",
      "Zhruba jedna ruka z"
    ],
    "starting": {
      "specificPair": "Určitý pár v ruce, třeba esa",
      "anyPair": "Jakýkoli pár v ruce",
      "specificNonPair": "Určitá ruka bez páru, třeba eso-král",
      "specificSuited": "Určitá stejnobarevná ruka, třeba eso-král stejné barvy",
      "anySuited": "Jakékoli dvě karty stejné barvy",
      "twoBroadway": "Dvě karty od desítky výš"
    },
    "faqH2": "Otázky",
    "faq": [
      [
        "Co jsou outy v pokeru?",
        "Karty zbývající v balíčku, které by vám daly nejlepší kombinaci. Počítejte jen karty, které jste neviděli: 47 na flopu, 46 na turnu."
      ],
      [
        "Jak často porazí pár es pár králů?",
        "Zhruba čtyřikrát z pěti: {aakk}, když se rozdá všech pět karet na stůl, zatímco králové vyhrají {kkaa}."
      ],
      [
        "Je eso-král proti páru hod mincí?",
        "Skoro, proti střednímu páru: dámy vyhrají {qqak} proti eso-král. Proti malému páru je to ještě vyrovnanější — dvojky vyhrají {22ak}."
      ],
      [
        "Co jsou pot odds?",
        "Cena dorovnání v porovnání s bankem, který můžete vyhrát. Pokud je vaše šance na výhru vyšší než podíl na konečném banku, který do něj vložíte, dorovnávání se dlouhodobě vyplatí."
      ],
      [
        "Ukazuje PokerTH mé šance během hry?",
        "Ano. Karta „Šance“ pojmenuje vaši aktuálně nejlepší kombinaci a vaši šanci na výhru, jak karty přicházejí, takže si můžete u stolu ověřit vlastní úvahu."
      ]
    ]
  },
  cy: {
    "title": "Tebygolrwydd pocer — outs, tebygolrwydd y pot, dwylo benben | PokerTH",
    "desc": "Tebygolrwydd Texas Hold’em wedi'i gyfrifo'n union: outs a'ch siawns o'u taro, rheol 2 a 4, tebygolrwydd y pot, a pha mor aml mae AA yn curo KK neu QQ yn curo AK.",
    "ldHeadline": "Tebygolrwydd pocer: outs, tebygolrwydd y pot a dwylo benben preflop",
    "ldDesc": "Tebygolrwydd Texas Hold’em wedi'i gyfrifo'n union: outs, rheol 2 a 4, tebygolrwydd y pot a dwylo benben preflop.",
    "h1": "Tebygolrwydd pocer: outs, tebygolrwydd y pot a dwylo benben preflop",
    "lead": "Mae penderfyniadau pocer da yn dibynnu ar ychydig o rifau: pa mor debygol yw hi y bydd eich llaw yn gwella, faint sy'n rhaid i chi ei dalu i gael gwybod, a sut mae dwy law yn sefyll yn erbyn ei gilydd cyn y flop. Mae pob ffigur ar y dudalen hon wedi'i gyfrifo'n union, nid wedi'i gopïo o siart.",
    "calc": {
      "h2": "Cyfrifiannell tebygolrwydd pocer",
      "intro": "Dewiswch eich dau gerdyn ac, os mynnwch, y bwrdd a llaw gwrthwynebydd. Mae'r gyfrifiannell yn delio pob cerdyn sy'n weddill — yn union pryd bynnag y gall, drwy efelychiad fel arall — ac yn dangos pa mor aml rydych chi'n ennill.",
      "you": "Eich llaw",
      "board": "Bwrdd",
      "opp": "Gwrthwynebydd (dewisol)",
      "players": "Gwrthwynebwyr",
      "pick": "Tapiwch gerdyn i'w roi yn y slot sydd wedi'i amlygu; tapiwch slot i'w wagio.",
      "clear": "Clirio",
      "win": "Ennill",
      "tie": "Cyfartal",
      "lose": "Colli",
      "exact": "Union: pob un o'r {n} delio posibl.",
      "sim": "Efelychiad o {n} delio ar hap.",
      "working": "Wrthi'n cyfrifo…",
      "need": "Dewiswch eich dau gerdyn i weld eich siawns.",
      "boardHint": "Mae'r bwrdd yn cymryd tri cherdyn (y flop), yna pedwar, yna pump.",
      "oppHint": "Dewiswch ddau gerdyn eich gwrthwynebydd, neu ddim un.",
      "final": "Eich llaw derfynol",
      "noscript": "Mae angen JavaScript ar y gyfrifiannell. Mae'r tablau isod yn gweithio hebddo."
    },
    "outsH2": "Outs: eich siawns o daro",
    "outsP": "Out yw cerdyn sy'n dal yn y pecyn ac sy'n troi eich llaw yn enillydd tebygol. Ar y flop, mae 47 cerdyn heb eu gweld: gyda 9 out, mae un cerdyn yn taro ar y turn {f9turn} o'r amser, ac erbyn y river — gyda dau gerdyn i ddod — {f9river}.",
    "outsCols": [
      "Draw",
      "Outs",
      "Turn",
      "River (o'r turn)",
      "Turn neu river (o'r flop)"
    ],
    "draws": {
      "gutshot": "Draw syth mewnol (gutshot)",
      "twoPairFull": "Dau bâr → Tŷ llawn",
      "pairTrips": "Pâr → Dau bâr neu Tri o’r un fath",
      "twoOver": "Dau gerdyn uwch na'r bwrdd → Pâr",
      "setFull": "Set → Tŷ llawn neu Pedwar o’r un fath",
      "oesd": "Draw syth agored ar y ddau ben",
      "flush": "Draw fflysh",
      "flushGut": "Draw fflysh a gutshot",
      "flushOesd": "Draw fflysh a draw syth agored ar y ddau ben"
    },
    "outsNote": "Dyma'r siawns o ddal un o'ch outs. Nid ydynt yn cynnwys ychwanegion runner-runner, ac nid yw out sydd hefyd yn rhoi llaw well i wrthwynebydd yn out go iawn.",
    "ruleH2": "Rheol 2 a 4",
    "ruleP": "Amcangyfrif cyflym wrth y bwrdd: lluoswch eich outs â 4 ar y flop pan fyddwch yn gweld y turn a'r river, ac â 2 pan nad oes ond un cerdyn i ddod. Mae draw fflysh ar y flop yn 9 × 4 = 36%, o'i gymharu â {f9river} yn union. Mae'r rheol yn goramcangyfrif draws mawr: mae 15 out yn rhoi 60%, a'r ffigur go iawn yw {f15river}.",
    "potH2": "Tebygolrwydd y pot: a ddylech chi wneud Call?",
    "potP": "Mae tebygolrwydd y pot yn cymharu'r hyn sy'n rhaid i chi ei dalu â'r hyn y gallwch ei ennill. Mae 100 yn y pot ac mae eich gwrthwynebydd yn betio 50: rydych chi'n talu 50 i ennill pot o 200, felly mae angen i'r Call ennill mwy na 50 ÷ 200 = 25% o'r amser i dalu'r ffordd. Gyda draw fflysh ac un cerdyn i ddod rydych chi'n taro {f9one} o'r amser, felly mae gwneud Call ar fet pan nad oes ond y river ar ôl yn colli sglodion yn y tymor hir. All-In ar y flop, gyda'r ddau gerdyn i ddod, mae'r un draw yn taro {f9river}, ac mae'r Call yn werth ei wneud.",
    "matchH2": "Dwylo benben preflop",
    "matchP": "Sut mae dwy law gychwynnol yn gwneud yn erbyn ei gilydd pan fydd pob un o'r pum cerdyn bwrdd wedi'u delio, wedi'i gyfrif dros bob un o'r {boards} bwrdd posibl. Mae'r siwtiau'n cyfrif ychydig: nid yw'r dwylo isod yn rhannu unrhyw siwt oni bai eu bod wedi'u dangos o'r un siwt.",
    "matchCols": [
      "Llaw",
      "Yn erbyn",
      "Ennill",
      "Cyfartal",
      "Colli"
    ],
    "startH2": "Tebygolrwydd dwylo cychwynnol",
    "startP": "Mae {combos} o ddwylo cychwynnol dau gerdyn gwahanol. Pa mor aml y cewch chi:",
    "startCols": [
      "Llaw",
      "Siawns",
      "Tua un llaw ym mhob"
    ],
    "starting": {
      "specificPair": "Pâr poced penodol, fel asau",
      "anyPair": "Unrhyw bâr poced",
      "specificNonPair": "Llaw benodol heb bâr, fel as-brenin",
      "specificSuited": "Llaw benodol o'r un siwt, fel as-brenin o'r un siwt",
      "anySuited": "Unrhyw ddau gerdyn o'r un siwt",
      "twoBroadway": "Dau gerdyn deg neu uwch"
    },
    "faqH2": "Cwestiynau",
    "faq": [
      [
        "Beth yw outs mewn pocer?",
        "Y cardiau sydd ar ôl yn y pecyn a fyddai'n rhoi'r llaw orau i chi. Cyfrifwch dim ond y cardiau nad ydych wedi'u gweld: 47 ar y flop, 46 ar y turn."
      ],
      [
        "Pa mor aml mae asau poced yn curo brenhinoedd?",
        "Tua phedair gwaith o bob pump: {aakk} pan fydd pob un o'r pum cerdyn bwrdd wedi'u delio, gyda'r brenhinoedd yn ennill {kkaa}."
      ],
      [
        "Ai taflu ceiniog yw as-brenin yn erbyn pâr?",
        "Bron iawn, yn erbyn pâr canol: mae breninesau'n ennill {qqak} yn erbyn as-brenin. Yn erbyn pâr bach mae'n agosach fyth — mae pâr o ddauoedd yn ennill {22ak}."
      ],
      [
        "Beth yw tebygolrwydd y pot?",
        "Pris Call o'i gymharu â'r pot y gallwch ei ennill. Os yw eich siawns o ennill yn uwch na'r gyfran o'r pot terfynol rydych chi'n ei rhoi i mewn, mae gwneud Call yn talu ar ei ganfed dros amser."
      ],
      [
        "Ydy PokerTH yn dangos fy siawns yn ystod gêm?",
        "Ydy. Mae'r tab Siawns yn enwi eich llaw orau bresennol a'ch siawns o ennill wrth i'r cardiau ddod allan, fel y gallwch wirio eich rhesymu eich hun wrth y bwrdd."
      ]
    ]
  },
  da: {
    "title": "Pokerodds-tabel — outs, potodds, hænder mod hinanden | PokerTH",
    "desc": "Texas Hold’em-odds regnet præcist ud: outs og din chance for at ramme dem, 2- og 4-reglen, potodds, og hvor ofte AA slår KK eller QQ slår AK.",
    "ldHeadline": "Pokerodds: outs, potodds og preflop-opgør",
    "ldDesc": "Texas Hold’em-odds beregnet præcist: outs, 2- og 4-reglen, potodds og preflop-opgør.",
    "h1": "Pokerodds: outs, potodds og preflop-opgør",
    "lead": "Gode pokerbeslutninger handler om nogle få tal: hvor sandsynligt det er, at din hånd bliver bedre, hvor meget du skal betale for at finde ud af det, og hvordan to hænder står mod hinanden før floppen. Hvert tal på denne side er beregnet præcist, ikke kopieret fra en tabel.",
    "calc": {
      "h2": "Pokerodds-beregner",
      "intro": "Vælg dine to kort og, hvis du vil, bordet og en modstanders hånd. Beregneren deler alle de resterende kort ud — præcist, når den kan, ellers ved simulering — og viser, hvor ofte du vinder.",
      "you": "Din hånd",
      "board": "Bord",
      "opp": "Modstander (valgfri)",
      "players": "Modstandere",
      "pick": "Tryk på et kort for at lægge det på den markerede plads; tryk på en plads for at tømme den.",
      "clear": "Ryd",
      "win": "Sejr",
      "tie": "Uafgjort",
      "lose": "Tab",
      "exact": "Præcist: hver eneste af de {n} mulige uddelinger.",
      "sim": "Simulering af {n} tilfældige uddelinger.",
      "working": "Beregner…",
      "need": "Vælg dine to kort for at se dine odds.",
      "boardHint": "Bordet tager tre kort (floppen), så fire, så fem.",
      "oppHint": "Vælg begge modstanderens kort eller ingen.",
      "final": "Din endelige hånd",
      "noscript": "Beregneren kræver JavaScript. Tabellerne nedenfor virker uden."
    },
    "outsH2": "Outs: din chance for at ramme",
    "outsP": "En out er et kort, der stadig er i bunken, og som gør din hånd til den sandsynlige vinder. På floppen er 47 kort usete: med 9 outs rammer ét kort på turn i {f9turn} af tilfældene, og inden river — med to kort tilbage — i {f9river}.",
    "outsCols": [
      "Trækning",
      "Outs",
      "Turn",
      "River (fra turn)",
      "Turn eller river (fra floppen)"
    ],
    "draws": {
      "gutshot": "Indvendig straight-trækning (gutshot)",
      "twoPairFull": "To par til fuldt hus",
      "pairTrips": "Et par til to par eller tre ens",
      "twoOver": "To overkort til et par",
      "setFull": "Set til fuldt hus eller fire ens",
      "oesd": "Åben straight-trækning",
      "flush": "Flush-trækning",
      "flushGut": "Flush-trækning og gutshot",
      "flushOesd": "Flush-trækning og åben straight-trækning"
    },
    "outsNote": "Det er chancerne for at fange en af dine outs. Runner-runner-ekstra (bagdør) er ikke medregnet, og en out, der også giver en modstander en bedre hånd, er ikke rigtig en out.",
    "ruleH2": "2- og 4-reglen",
    "ruleP": "Et hurtigt overslag ved bordet: gang dine outs med 4 på floppen, når du skal se både turn og river, og med 2, når der kun er ét kort tilbage. En flush-trækning på floppen giver 9 × 4 = 36 %, mod præcist {f9river}. Reglen overvurderer store trækninger: 15 outs giver 60 %, det rigtige tal er {f15river}.",
    "potH2": "Potodds: skal du calle?",
    "potP": "Potodds sammenligner, hvad du skal betale, med hvad du kan vinde. Puljen er på 100, og din modstander satser 50: du caller 50 for at vinde en pulje på 200, så dit call skal vinde mere end 50 ÷ 200 = 25 % af gangene for at betale sig. Med en flush-trækning og ét kort tilbage rammer du i {f9one} af tilfældene, så at calle en indsats, når kun river mangler, taber jetoner i det lange løb. All-in på floppen, med begge kort tilbage, rammer den samme trækning i {f9river}, og så er dit call det værd.",
    "matchH2": "Preflop-opgør",
    "matchP": "Sådan klarer to starthænder sig mod hinanden, når alle fem fælleskort deles ud, talt over hver eneste af de {boards} mulige bordkombinationer. Kulørerne betyder en smule: hænderne nedenfor deler ingen kulør, medmindre de er vist i samme kulør.",
    "matchCols": [
      "Hånd",
      "Mod",
      "Vinder",
      "Uafgjort",
      "Taber"
    ],
    "startH2": "Odds for starthænder",
    "startP": "Der findes {combos} forskellige starthænder med to kort. Så ofte får du:",
    "startCols": [
      "Hånd",
      "Chance",
      "Cirka én hånd ud af"
    ],
    "starting": {
      "specificPair": "Et bestemt par på hånden, fx esser",
      "anyPair": "Et vilkårligt par på hånden",
      "specificNonPair": "En bestemt hånd uden par, fx es-konge",
      "specificSuited": "En bestemt hånd i samme kulør, fx es-konge i samme kulør",
      "anySuited": "Hvilke som helst to kort i samme kulør",
      "twoBroadway": "To kort fra ti og opefter"
    },
    "faqH2": "Spørgsmål",
    "faq": [
      [
        "Hvad er outs i poker?",
        "De kort, der er tilbage i bunken og ville give dig den bedste hånd. Tæl kun de kort, du ikke har set: 47 på floppen, 46 på turn."
      ],
      [
        "Hvor ofte slår et par esser et par konger?",
        "Cirka fire gange ud af fem: {aakk}, når alle fem fælleskort deles ud, mens kongerne vinder {kkaa}."
      ],
      [
        "Er es-konge mod et par et møntkast?",
        "Næsten, mod et mellempar: damer vinder {qqak} mod es-konge. Mod et lille par er det endnu tættere — toere vinder {22ak}."
      ],
      [
        "Hvad er potodds?",
        "Prisen for et call sammenlignet med den pulje, du kan vinde. Hvis din chance for at vinde er større end den andel af den endelige pulje, du selv lægger i, betaler det sig at calle i det lange løb."
      ],
      [
        "Viser PokerTH mine odds under spillet?",
        "Ja. Fanen Chancer viser din aktuelt bedste hånd og din chance for at vinde, efterhånden som kortene kommer, så du kan tjekke din egen tankegang ved bordet."
      ]
    ]
  },
  de: {
    "title": "Poker-Odds-Tabelle — Outs, Pot Odds, Hand-Duelle | PokerTH",
    "desc": "Texas-Hold’em-Wahrscheinlichkeiten exakt berechnet: Outs und Ihre Trefferchance, die 2-und-4-Regel, Pot Odds und wie oft AA gegen KK oder QQ gegen AK gewinnt.",
    "ldHeadline": "Poker-Wahrscheinlichkeiten: Outs, Pot Odds und Preflop-Duelle",
    "ldDesc": "Texas-Hold’em-Wahrscheinlichkeiten exakt berechnet: Outs, die 2-und-4-Regel, Pot Odds und Preflop-Duelle.",
    "h1": "Poker-Wahrscheinlichkeiten: Outs, Pot Odds und Preflop-Duelle",
    "lead": "Gute Pokerentscheidungen hängen an wenigen Zahlen: wie wahrscheinlich sich Ihre Hand verbessert, wie viel Sie zahlen müssen, um es herauszufinden, und wie zwei Hände vor dem Flop gegeneinander stehen. Jede Zahl auf dieser Seite ist exakt berechnet, nicht aus einer Tabelle abgeschrieben.",
    "calc": {
      "h2": "Poker-Odds-Rechner",
      "intro": "Wählen Sie Ihre zwei Karten und, wenn Sie möchten, das Board und die Hand eines Gegners. Der Rechner spielt alle restlichen Karten durch — exakt, wann immer es geht, sonst per Simulation — und zeigt, wie oft Sie gewinnen.",
      "you": "Ihre Hand",
      "board": "Board",
      "opp": "Gegner (optional)",
      "players": "Gegner",
      "pick": "Tippen Sie auf eine Karte, um sie in das markierte Feld zu legen; tippen Sie auf ein Feld, um es zu leeren.",
      "clear": "Leeren",
      "win": "Sieg",
      "tie": "Split",
      "lose": "Niederlage",
      "exact": "Exakt: jede der {n} möglichen Kartenverteilungen.",
      "sim": "Simulation von {n} zufälligen Kartenverteilungen.",
      "working": "Wird berechnet…",
      "need": "Wählen Sie Ihre zwei Karten, um Ihre Chancen zu sehen.",
      "boardHint": "Das Board nimmt drei Karten auf (den Flop), dann vier, dann fünf.",
      "oppHint": "Wählen Sie beide Karten Ihres Gegners oder keine.",
      "final": "Ihr Endblatt",
      "noscript": "Der Rechner braucht JavaScript. Die Tabellen unten funktionieren auch ohne."
    },
    "outsH2": "Outs: Ihre Trefferchance",
    "outsP": "Ein Out ist eine Karte, die noch im Deck liegt und Ihre Hand zur wahrscheinlichen Gewinnerhand macht. Auf dem Flop sind 47 Karten ungesehen: Mit 9 Outs trifft eine Karte am Turn in {f9turn} der Fälle und bis zum River — zwei Karten kommen noch — in {f9river}.",
    "outsCols": [
      "Draw",
      "Outs",
      "Turn",
      "River (ab dem Turn)",
      "Turn oder River (ab dem Flop)"
    ],
    "draws": {
      "gutshot": "Inside-Straight-Draw (Gutshot)",
      "twoPairFull": "Zwei Paare zum Full House",
      "pairTrips": "Ein Paar zu Zwei Paaren oder Drilling",
      "twoOver": "Zwei Overcards zu einem Paar",
      "setFull": "Set zu Full House oder Vierling",
      "oesd": "Open-Ended-Straight-Draw",
      "flush": "Flush-Draw",
      "flushGut": "Flush-Draw und Gutshot",
      "flushOesd": "Flush-Draw und Open-Ended-Straight-Draw"
    },
    "outsNote": "Das sind die Chancen, eines Ihrer Outs zu treffen. Runner-Runner-Extras sind nicht berücksichtigt, und ein Out, das auch einem Gegner eine bessere Hand gibt, ist eigentlich kein Out.",
    "ruleH2": "Die 2-und-4-Regel",
    "ruleP": "Eine schnelle Schätzung am Tisch: Multiplizieren Sie Ihre Outs auf dem Flop mit 4, wenn Sie Turn und River beide sehen, und mit 2, wenn nur noch eine Karte kommt. Ein Flush-Draw auf dem Flop ergibt 9 × 4 = 36 %, gegenüber exakt {f9river}. Die Regel überschätzt große Draws: 15 Outs ergeben 60 %, der echte Wert ist {f15river}.",
    "potH2": "Pot Odds: Lohnt sich der Call?",
    "potP": "Pot Odds vergleichen, was Sie zahlen müssen, mit dem, was Sie gewinnen können. Im Pot liegen 100, und Ihr Gegner setzt 50: Sie zahlen 50, um einen Pot von 200 zu gewinnen, also muss der Call in mehr als 50 ÷ 200 = 25 % der Fälle gewinnen, damit er sich lohnt. Mit einem Flush-Draw und einer kommenden Karte treffen Sie in {f9one} der Fälle; einen Einsatz mitzugehen, wenn nur noch der River fehlt, kostet also auf lange Sicht Chips. All-In auf dem Flop, mit beiden Karten noch offen, trifft derselbe Draw in {f9river}, und der Call lohnt sich.",
    "matchH2": "Preflop-Duelle",
    "matchP": "Wie zwei Starthände gegeneinander abschneiden, wenn alle fünf Boardkarten ausgeteilt werden, gezählt über jedes der {boards} möglichen Boards. Farben spielen eine kleine Rolle: Die Hände unten haben keine gemeinsame Farbe, außer sie sind als suited angegeben.",
    "matchCols": [
      "Hand",
      "Gegen",
      "Gewinnt",
      "Split",
      "Verliert"
    ],
    "startH2": "Wahrscheinlichkeiten der Starthände",
    "startP": "Es gibt {combos} verschiedene Starthände aus zwei Karten. So oft bekommen Sie:",
    "startCols": [
      "Hand",
      "Chance",
      "Etwa eine Hand von"
    ],
    "starting": {
      "specificPair": "Ein bestimmtes Pocket Pair, etwa Asse",
      "anyPair": "Irgendein Pocket Pair",
      "specificNonPair": "Eine bestimmte ungepaarte Hand, etwa Ass-König",
      "specificSuited": "Eine bestimmte suited Hand, etwa Ass-König suited",
      "anySuited": "Zwei beliebige Karten derselben Farbe",
      "twoBroadway": "Zwei Karten ab der Zehn aufwärts"
    },
    "faqH2": "Fragen",
    "faq": [
      [
        "Was sind Outs beim Poker?",
        "Die Karten im Deck, die Ihnen die beste Hand geben würden. Zählen Sie nur die Karten, die Sie nicht gesehen haben: 47 auf dem Flop, 46 auf dem Turn."
      ],
      [
        "Wie oft schlagen Pocket-Asse Könige?",
        "Etwa viermal von fünf: {aakk}, wenn alle fünf Boardkarten ausgeteilt werden; die Könige gewinnen {kkaa}."
      ],
      [
        "Ist Ass-König gegen ein Paar ein Coinflip?",
        "Fast, gegen ein mittleres Paar: Damen gewinnen {qqak} gegen Ass-König. Gegen ein kleines Paar ist es noch knapper — Zweier gewinnen {22ak}."
      ],
      [
        "Was sind Pot Odds?",
        "Der Preis eines Calls im Vergleich zum Pot, den Sie gewinnen können. Ist Ihre Gewinnchance höher als der Anteil am endgültigen Pot, den Sie einzahlen, lohnt sich das Mitgehen auf Dauer."
      ],
      [
        "Zeigt PokerTH meine Chancen während des Spiels?",
        "Ja. Der Reiter Chancen benennt Ihr aktuell bestes Blatt und Ihre Gewinnchance, während die Karten kommen, sodass Sie Ihre eigenen Überlegungen am Tisch überprüfen können."
      ]
    ]
  },
  el: {
    "title": "Πιθανότητες πόκερ — άουτς, αποδόσεις πότ, μονομαχίες | PokerTH",
    "desc": "Πιθανότητες Texas Hold’em με ακρίβεια: άουτς και πόσο συχνά έρχονται, ο κανόνας του 2 και του 4, αποδόσεις πότ, και πόσο συχνά AA κερδίζει KK ή QQ κερδίζει AK.",
    "ldHeadline": "Πιθανότητες πόκερ: άουτς, αποδόσεις πότ και μονομαχίες πριν το φλοπ",
    "ldDesc": "Πιθανότητες Texas Hold’em με ακριβή υπολογισμό: άουτς, ο κανόνας του 2 και του 4, αποδόσεις πότ και μονομαχίες πριν το φλοπ.",
    "h1": "Πιθανότητες πόκερ: άουτς, αποδόσεις πότ και μονομαχίες πριν το φλοπ",
    "lead": "Οι σωστές αποφάσεις στο πόκερ καταλήγουν σε λίγους αριθμούς: πόσο πιθανό είναι να βελτιωθεί το χέρι σας, πόσα πρέπει να πληρώσετε για να το μάθετε, και πώς στέκονται δύο χέρια το ένα απέναντι στο άλλο πριν το φλοπ. Κάθε νούμερο σε αυτή τη σελίδα έχει υπολογιστεί με ακρίβεια, δεν έχει αντιγραφεί από κάποιον πίνακα.",
    "calc": {
      "h2": "Υπολογιστής πιθανοτήτων πόκερ",
      "intro": "Διαλέξτε τα δύο φύλλα σας και, αν θέλετε, το τραπέζι και το χέρι ενός αντιπάλου. Ο υπολογιστής μοιράζει όλα τα υπόλοιπα φύλλα — με ακρίβεια όποτε γίνεται, αλλιώς με προσομοίωση — και δείχνει πόσο συχνά κερδίζετε.",
      "you": "Το χέρι σας",
      "board": "Τραπέζι",
      "opp": "Αντίπαλος (προαιρετικά)",
      "players": "Αντίπαλοι",
      "pick": "Πατήστε ένα φύλλο για να το βάλετε στη φωτισμένη θέση· πατήστε μια θέση για να την αδειάσετε.",
      "clear": "Καθαρισμός",
      "win": "Νίκη",
      "tie": "Ισοπαλία",
      "lose": "Ήττα",
      "exact": "Ακριβώς: καθένα από τα {n} δυνατά μοιράσματα.",
      "sim": "Προσομοίωση {n} τυχαίων μοιρασμάτων.",
      "working": "Υπολογισμός…",
      "need": "Διαλέξτε τα δύο φύλλα σας για να δείτε τις πιθανότητές σας.",
      "boardHint": "Το τραπέζι παίρνει τρία φύλλα (το φλοπ), μετά τέσσερα, μετά πέντε.",
      "oppHint": "Διαλέξτε και τα δύο φύλλα του αντιπάλου ή κανένα.",
      "final": "Το τελικό σας χέρι",
      "noscript": "Ο υπολογιστής χρειάζεται JavaScript. Οι πίνακες παρακάτω λειτουργούν και χωρίς αυτό."
    },
    "outsH2": "Άουτς: η πιθανότητα να έρθουν",
    "outsP": "Άουτ είναι ένα φύλλο που βρίσκεται ακόμη στην τράπουλα και κάνει το χέρι σας πιθανό νικητή. Στο φλοπ υπάρχουν 47 άγνωστα φύλλα: με 9 άουτς, ένα φύλλο έρχεται στο τερν στο {f9turn} των περιπτώσεων, και ως το ριβέρ — με δύο φύλλα ακόμη — στο {f9river}.",
    "outsCols": [
      "Σχέδιο",
      "Άουτς",
      "Τερν",
      "Ριβέρ (από το τερν)",
      "Τερν ή ριβέρ (από το φλοπ)"
    ],
    "draws": {
      "gutshot": "Εσωτερικό σχέδιο κέντας (γκατσότ)",
      "twoPairFull": "Δύο ζευγάρια προς φουλ",
      "pairTrips": "Ζευγάρι προς δύο ζευγάρια ή τριάδα",
      "twoOver": "Δύο υπερφύλλα προς ζευγάρι",
      "setFull": "Σετ προς φουλ ή καρέ",
      "oesd": "Ανοιχτό σχέδιο κέντας",
      "flush": "Σχέδιο φλος",
      "flushGut": "Σχέδιο φλος και γκατσότ",
      "flushOesd": "Σχέδιο φλος και ανοιχτό σχέδιο κέντας"
    },
    "outsNote": "Αυτές είναι οι πιθανότητες να έρθει ένα από τα άουτς σας. Δεν περιλαμβάνουν τα επιπλέον runner-runner, και ένα άουτ που δίνει και στον αντίπαλο καλύτερο χέρι δεν είναι στην πραγματικότητα άουτ.",
    "ruleH2": "Ο κανόνας του 2 και του 4",
    "ruleP": "Μια γρήγορη εκτίμηση στο τραπέζι: πολλαπλασιάστε τα άουτς σας επί 4 στο φλοπ όταν θα δείτε και το τερν και το ριβέρ, και επί 2 όταν έρχεται μόνο ένα φύλλο. Ένα σχέδιο φλος στο φλοπ δίνει 9 × 4 = 36%, έναντι {f9river} ακριβώς. Ο κανόνας υπερεκτιμά τα μεγάλα σχέδια: 15 άουτς δίνουν 60%, ενώ το πραγματικό ποσοστό είναι {f15river}.",
    "potH2": "Αποδόσεις πότ: να κάνετε Call;",
    "potP": "Οι αποδόσεις πότ συγκρίνουν όσα πρέπει να πληρώσετε με όσα μπορείτε να κερδίσετε. Στο πότ υπάρχουν 100 και ο αντίπαλος ποντάρει 50: πληρώνετε 50 για να κερδίσετε πότ 200, άρα το Call πρέπει να κερδίζει πάνω από 50 ÷ 200 = 25% των φορών για να βγαίνει κερδοφόρο. Με σχέδιο φλος και ένα φύλλο ακόμη, πετυχαίνετε στο {f9one} των περιπτώσεων, οπότε ένα Call σε ποντάρισμα όταν απομένει μόνο το ριβέρ χάνει μάρκες μακροπρόθεσμα. All-In στο φλοπ, με δύο φύλλα ακόμη, το ίδιο σχέδιο πετυχαίνει στο {f9river}, και το Call αξίζει.",
    "matchH2": "Μονομαχίες πριν το φλοπ",
    "matchP": "Πώς τα πάνε δύο αρχικά χέρια μεταξύ τους όταν μοιραστούν και τα πέντε φύλλα του τραπεζιού, μετρημένο σε καθένα από τα {boards} δυνατά τραπέζια. Τα χρώματα μετράνε λίγο: τα χέρια παρακάτω δεν έχουν κοινό χρώμα, εκτός αν εμφανίζονται στο ίδιο χρώμα.",
    "matchCols": [
      "Χέρι",
      "Έναντι",
      "Κερδίζει",
      "Ισοπαλία",
      "Χάνει"
    ],
    "startH2": "Πιθανότητες αρχικών χεριών",
    "startP": "Υπάρχουν {combos} διαφορετικά αρχικά χέρια δύο φύλλων. Πόσο συχνά σας μοιράζεται:",
    "startCols": [
      "Χέρι",
      "Πιθανότητα",
      "Περίπου ένα χέρι στα"
    ],
    "starting": {
      "specificPair": "Ένα συγκεκριμένο ζευγάρι στο χέρι, π.χ. άσσοι",
      "anyPair": "Οποιοδήποτε ζευγάρι στο χέρι",
      "specificNonPair": "Ένα συγκεκριμένο χέρι χωρίς ζευγάρι, π.χ. άσσος-ρήγας",
      "specificSuited": "Ένα συγκεκριμένο χέρι στο ίδιο χρώμα, π.χ. άσσος-ρήγας στο ίδιο χρώμα",
      "anySuited": "Οποιαδήποτε δύο φύλλα στο ίδιο χρώμα",
      "twoBroadway": "Δύο φύλλα από δέκα και πάνω"
    },
    "faqH2": "Ερωτήσεις",
    "faq": [
      [
        "Τι είναι τα άουτς στο πόκερ;",
        "Τα φύλλα που μένουν στην τράπουλα και θα σας έδιναν το καλύτερο χέρι. Μετράτε μόνο τα φύλλα που δεν έχετε δει: 47 στο φλοπ, 46 στο τερν."
      ],
      [
        "Πόσο συχνά οι άσσοι στο χέρι κερδίζουν τους ρηγάδες;",
        "Περίπου τέσσερις φορές στις πέντε: {aakk} όταν μοιραστούν και τα πέντε φύλλα του τραπεζιού, ενώ οι ρηγάδες κερδίζουν {kkaa}."
      ],
      [
        "Είναι το άσσος-ρήγας απέναντι σε ζευγάρι κορόνα-γράμματα;",
        "Σχεδόν, απέναντι σε μεσαίο ζευγάρι: οι ντάμες κερδίζουν {qqak} απέναντι στο άσσος-ρήγας. Απέναντι σε μικρό ζευγάρι είναι ακόμη πιο κοντά — τα δυάρια κερδίζουν {22ak}."
      ],
      [
        "Τι είναι οι αποδόσεις πότ;",
        "Η τιμή ενός Call σε σύγκριση με το πότ που μπορείτε να κερδίσετε. Αν η πιθανότητά σας να κερδίσετε είναι μεγαλύτερη από το μερίδιο του τελικού πότ που βάζετε εσείς, το Call αποδίδει μακροπρόθεσμα."
      ],
      [
        "Δείχνει το PokerTH τις πιθανότητές μου κατά τη διάρκεια του παιχνιδιού;",
        "Ναι. Η καρτέλα Πιθανότητες δείχνει το τρέχον καλύτερο χέρι σας και την πιθανότητα νίκης σας καθώς βγαίνουν τα φύλλα, ώστε να ελέγχετε τη δική σας σκέψη στο τραπέζι."
      ]
    ]
  },
  eo: {
    "title": "Pokeraj probabloj — outs, potprobabloj, dueloj | PokerTH",
    "desc": "Texas Hold’em-probabloj kalkulitaj ekzakte: outs kaj via ŝanco trafi ilin, la regulo de 2 kaj 4, potprobabloj, kaj kiom ofte AA venkas KK aŭ QQ venkas AK.",
    "ldHeadline": "Pokeraj probabloj: outs, potprobabloj kaj preflop-dueloj",
    "ldDesc": "Texas Hold’em-probabloj kalkulitaj ekzakte: outs, la regulo de 2 kaj 4, potprobabloj kaj preflop-dueloj.",
    "h1": "Pokeraj probabloj: outs, potprobabloj kaj preflop-dueloj",
    "lead": "Bonaj pokeraj decidoj dependas de kelkaj nombroj: kiom verŝajne via mano pliboniĝos, kiom vi devas pagi por ekscii tion, kaj kiel du manoj staras unu kontraŭ la alia antaŭ la flop. Ĉiu cifero en ĉi tiu paĝo estas kalkulita ekzakte, ne kopiita el tabelo.",
    "calc": {
      "h2": "Kalkulilo de pokeraj probabloj",
      "intro": "Elektu viajn du kartojn kaj, se vi volas, la bordon kaj la manon de kontraŭulo. La kalkulilo disdonas ĉiujn restantajn kartojn — ekzakte kiam ajn eblas, alie per simulado — kaj montras kiom ofte vi gajnas.",
      "you": "Via mano",
      "board": "Bordo",
      "opp": "Kontraŭulo (nedeviga)",
      "players": "Kontraŭuloj",
      "pick": "Tuŝu karton por meti ĝin en la emfazitan lokon; tuŝu lokon por malplenigi ĝin.",
      "clear": "Viŝi",
      "win": "Venko",
      "tie": "Egalo",
      "lose": "Malvenko",
      "exact": "Ekzakte: ĉiu el la {n} eblaj disdonoj.",
      "sim": "Simulado de {n} hazardaj disdonoj.",
      "working": "Kalkulante…",
      "need": "Elektu viajn du kartojn por vidi viajn ŝancojn.",
      "boardHint": "La bordo prenas tri kartojn (la flop), poste kvar, poste kvin.",
      "oppHint": "Elektu ambaŭ kartojn de via kontraŭulo, aŭ neniun.",
      "final": "Via fina mano",
      "noscript": "La kalkulilo bezonas JavaScript. La tabeloj sube funkcias sen ĝi."
    },
    "outsH2": "Outs: via ŝanco trafi",
    "outsP": "Out estas karto ankoraŭ en la kartaro, kiu igas vian manon la verŝajna gajnanto. Ĉe la flop 47 kartoj estas nevidataj: kun 9 outs, unu karto trafas ĉe la turn en {f9turn} de la okazoj, kaj ĝis la river — kun du kartoj venontaj — en {f9river}.",
    "outsCols": [
      "Draw",
      "Outs",
      "Turn",
      "River (de la turn)",
      "Turn aŭ river (de la flop)"
    ],
    "draws": {
      "gutshot": "Interna vico-draw (gutshot)",
      "twoPairFull": "Du paroj al Plena domo",
      "pairTrips": "Paro al Du paroj aŭ Triopo",
      "twoOver": "Du superkartoj al paro",
      "setFull": "Set al Plena domo aŭ Kvaropo",
      "oesd": "Malferma vico-draw",
      "flush": "Samkolora draw",
      "flushGut": "Samkolora draw kaj gutshot",
      "flushOesd": "Samkolora draw kaj malferma vico-draw"
    },
    "outsNote": "Jen la ŝancoj kapti unu el viaj outs. Ili ne kalkulas runner-runner-aldonojn, kaj out, kiu ankaŭ donas al kontraŭulo pli bonan manon, ne vere estas out.",
    "ruleH2": "La regulo de 2 kaj 4",
    "ruleP": "Rapida takso ĉe la tablo: multobligu viajn outs per 4 ĉe la flop, kiam vi vidos kaj la turn kaj la river, kaj per 2, kiam venos nur unu karto. Samkolora draw ĉe la flop estas 9 × 4 = 36%, kontraŭ ekzakte {f9river}. La regulo trotaksas grandajn draws: 15 outs donas 60%, la vera cifero estas {f15river}.",
    "potH2": "Potprobabloj: ĉu voki?",
    "potP": "Potprobabloj komparas tion, kion vi devas pagi, kun tio, kion vi povas gajni. La poto enhavas 100 kaj via kontraŭulo vetas 50: vi vokas 50 por gajni poton de 200, do la voko devas gajni en pli ol 50 ÷ 200 = 25% de la okazoj por esti profita. Kun samkolora draw kaj unu karto venonta vi trafas en {f9one} de la okazoj, do voki veton, kiam restas nur la river, longtempe perdigas ĵetonojn. Je All-In ĉe la flop, kun ambaŭ kartoj venontaj, la sama draw trafas en {f9river}, kaj la voko valoras la penon.",
    "matchH2": "Preflop-dueloj",
    "matchP": "Kiel du startmanoj fartas unu kontraŭ la alia, kiam ĉiuj kvin bordkartoj estas disdonitaj, kalkulite super ĉiu el la {boards} eblaj bordoj. Koloroj iom gravas: la ĉi-subaj manoj havas neniun komunan koloron, krom se ili estas montritaj kiel samkoloraj.",
    "matchCols": [
      "Mano",
      "Kontraŭ",
      "Gajnas",
      "Egalo",
      "Perdas"
    ],
    "startH2": "Probabloj de startmanoj",
    "startP": "Ekzistas {combos} malsamaj dukartaj startmanoj. Kiom ofte vi ricevas:",
    "startCols": [
      "Mano",
      "Ŝanco",
      "Proksimume unu mano el"
    ],
    "starting": {
      "specificPair": "Difinita poŝparo, ekzemple asoj",
      "anyPair": "Ajna poŝparo",
      "specificNonPair": "Difinita neparigita mano, ekzemple aso-reĝo",
      "specificSuited": "Difinita samkolora mano, ekzemple samkolora aso-reĝo",
      "anySuited": "Ajnaj du samkoloraj kartoj",
      "twoBroadway": "Du kartoj de dek aŭ pli altaj"
    },
    "faqH2": "Demandoj",
    "faq": [
      [
        "Kio estas outs en pokero?",
        "La kartoj restantaj en la kartaro, kiuj donus al vi la plej bonan manon. Kalkulu nur la kartojn, kiujn vi ne vidis: 47 ĉe la flop, 46 ĉe la turn."
      ],
      [
        "Kiom ofte poŝasoj venkas reĝojn?",
        "Proksimume kvar fojojn el kvin: {aakk}, kiam ĉiuj kvin bordkartoj estas disdonitaj, dum la reĝoj gajnas {kkaa}."
      ],
      [
        "Ĉu aso-reĝo kontraŭ paro estas monerĵeto?",
        "Preskaŭ, kontraŭ meza paro: damoj gajnas {qqak} kontraŭ aso-reĝo. Kontraŭ malgranda paro ĝi estas eĉ pli proksima — duoj gajnas {22ak}."
      ],
      [
        "Kio estas potprobabloj?",
        "La prezo de voko kompare kun la poto, kiun vi povas gajni. Se via ŝanco gajni estas pli alta ol la parto de la fina poto, kiun vi metis, voki profitas longtempe."
      ],
      [
        "Ĉu PokerTH montras miajn ŝancojn dum ludo?",
        "Jes. La langeto Ŝancoj nomas vian nunan plej bonan manon kaj vian ŝancon gajni dum la kartoj malkaŝiĝas, por ke vi povu kontroli vian propran rezonadon ĉe la tablo."
      ]
    ]
  },
  es: {
    "title": "Probabilidades de póker — outs, pot odds y duelos | PokerTH",
    "desc": "Probabilidades del Texas Hold’em calculadas con exactitud: outs y tu probabilidad de ligarlos, la regla del 2 y el 4, pot odds y cuánto gana AA a KK o QQ a AK.",
    "ldHeadline": "Probabilidades de póker: outs, pot odds y enfrentamientos preflop",
    "ldDesc": "Probabilidades del Texas Hold’em calculadas con exactitud: outs, la regla del 2 y el 4, pot odds y enfrentamientos preflop.",
    "h1": "Probabilidades de póker: outs, pot odds y enfrentamientos preflop",
    "lead": "Las buenas decisiones en el póker se reducen a unos pocos números: qué probabilidad tiene tu mano de mejorar, cuánto tienes que pagar para averiguarlo y cómo se comparan dos manos antes del flop. Cada cifra de esta página está calculada con exactitud, no copiada de una tabla.",
    "calc": {
      "h2": "Calculadora de probabilidades de póker",
      "intro": "Elige tus dos cartas y, si quieres, la mesa y la mano de un rival. La calculadora reparte todas las cartas restantes —de forma exacta siempre que puede y, si no, por simulación— y muestra con qué frecuencia ganas.",
      "you": "Tu mano",
      "board": "Mesa",
      "opp": "Rival (opcional)",
      "players": "Rivales",
      "pick": "Toca una carta para colocarla en la casilla resaltada; toca una casilla para vaciarla.",
      "clear": "Borrar",
      "win": "Victoria",
      "tie": "Empate",
      "lose": "Derrota",
      "exact": "Exacto: cada uno de los {n} repartos posibles.",
      "sim": "Simulación de {n} repartos aleatorios.",
      "working": "Calculando…",
      "need": "Elige tus dos cartas para ver tus probabilidades.",
      "boardHint": "La mesa lleva tres cartas (el flop), luego cuatro y luego cinco.",
      "oppHint": "Elige las dos cartas de tu rival, o ninguna.",
      "final": "Tu mano final",
      "noscript": "La calculadora necesita JavaScript. Las tablas de abajo funcionan sin él."
    },
    "outsH2": "Outs: tu probabilidad de ligar",
    "outsP": "Un out es una carta que sigue en la baraja y que convierte tu mano en la probable ganadora. En el flop hay 47 cartas sin ver: con 9 outs, una carta liga en el turn el {f9turn} de las veces y, hasta el river —con dos cartas por salir—, el {f9river}.",
    "outsCols": [
      "Proyecto",
      "Outs",
      "Turn",
      "River (desde el turn)",
      "Turn o river (desde el flop)"
    ],
    "draws": {
      "gutshot": "Proyecto de escalera interna (gutshot)",
      "twoPairFull": "Doble Pareja a Full",
      "pairTrips": "Pareja a Doble Pareja o Trío",
      "twoOver": "Dos overcards a Pareja",
      "setFull": "Set a Full o Póker",
      "oesd": "Proyecto de escalera abierta",
      "flush": "Proyecto de color",
      "flushGut": "Proyecto de color y gutshot",
      "flushOesd": "Proyecto de color y de escalera abierta"
    },
    "outsNote": "Son las probabilidades de ligar uno de tus outs. No incluyen los extras runner-runner, y un out que también le da a un rival una mano mejor no es realmente un out.",
    "ruleH2": "La regla del 2 y el 4",
    "ruleP": "Una estimación rápida en la mesa: multiplica tus outs por 4 en el flop cuando vayas a ver el turn y el river, y por 2 cuando solo quede una carta por salir. Un proyecto de color en el flop da 9 × 4 = 36 %, frente al {f9river} exacto. La regla sobrestima los proyectos grandes: 15 outs dan 60 %, y la cifra real es {f15river}.",
    "potH2": "Pot odds: ¿deberías igualar?",
    "potP": "Las pot odds comparan lo que tienes que pagar con lo que puedes ganar. El bote tiene 100 y tu rival apuesta 50: igualas 50 para ganar un bote de 200, así que igualar tiene que ganar más del 50 ÷ 200 = 25 % de las veces para salir rentable. Con un proyecto de color y una carta por salir ligas el {f9one} de las veces, así que igualar una apuesta cuando solo queda el river pierde fichas a la larga. Con un all-in en el flop y dos cartas por salir, el mismo proyecto liga el {f9river}, y merece la pena igualar.",
    "matchH2": "Enfrentamientos preflop",
    "matchP": "Cómo les va a dos manos iniciales una contra otra cuando se reparten las cinco cartas de la mesa, contado sobre cada una de las {boards} mesas posibles. Los palos influyen un poco: las manos de abajo no comparten palo salvo que se muestren del mismo palo.",
    "matchCols": [
      "Mano",
      "Contra",
      "Gana",
      "Empate",
      "Pierde"
    ],
    "startH2": "Probabilidades de las manos iniciales",
    "startP": "Hay {combos} manos iniciales distintas de dos cartas. Con qué frecuencia te reparten:",
    "startCols": [
      "Mano",
      "Probabilidad",
      "Aprox. una mano de cada"
    ],
    "starting": {
      "specificPair": "Una pareja servida concreta, por ejemplo ases",
      "anyPair": "Cualquier pareja servida",
      "specificNonPair": "Una mano concreta sin pareja, por ejemplo as-rey",
      "specificSuited": "Una mano concreta del mismo palo, por ejemplo as-rey del mismo palo",
      "anySuited": "Dos cartas cualesquiera del mismo palo",
      "twoBroadway": "Dos cartas de diez o más"
    },
    "faqH2": "Preguntas",
    "faq": [
      [
        "¿Qué son los outs en el póker?",
        "Las cartas que quedan en la baraja y te darían la mejor mano. Cuenta solo las cartas que no has visto: 47 en el flop, 46 en el turn."
      ],
      [
        "¿Con qué frecuencia ganan los ases a los reyes?",
        "Unas cuatro de cada cinco veces: el {aakk} cuando se reparten las cinco cartas de la mesa, y los reyes ganan el {kkaa}."
      ],
      [
        "¿As-rey contra una pareja es un cara o cruz?",
        "Casi, contra una pareja media: las damas ganan el {qqak} contra as-rey. Contra una pareja baja está aún más igualado: los doses ganan el {22ak}."
      ],
      [
        "¿Qué son las pot odds?",
        "El precio de igualar comparado con el bote que puedes ganar. Si tu probabilidad de ganar es mayor que la parte del bote final que pones tú, igualar sale rentable con el tiempo."
      ],
      [
        "¿PokerTH muestra mis probabilidades durante la partida?",
        "Sí. La pestaña Probabilidades nombra tu mejor mano actual y tu probabilidad de ganar según van saliendo las cartas, para que puedas comprobar tu propio razonamiento en la mesa."
      ]
    ]
  },
  "es-419": {
    "title": "Probabilidades de póker — outs, pot odds, enfrentamientos | PokerTH",
    "desc": "Probabilidades exactas del Texas Hold’em: outs y tu probabilidad de ligarlos, la regla del 2 y el 4, pot odds y cuántas veces AA le gana a KK o QQ a AK.",
    "ldHeadline": "Probabilidades de póker: outs, pot odds y enfrentamientos preflop",
    "ldDesc": "Probabilidades del Texas Hold’em calculadas con exactitud: outs, la regla del 2 y el 4, pot odds y enfrentamientos preflop.",
    "h1": "Probabilidades de póker: outs, pot odds y enfrentamientos preflop",
    "lead": "Las buenas decisiones en el póker se reducen a unos pocos números: qué tan probable es que tu mano mejore, cuánto tienes que pagar para averiguarlo y cómo están dos manos una contra otra antes del flop. Cada cifra de esta página está calculada con exactitud, no copiada de una tabla.",
    "calc": {
      "h2": "Calculadora de probabilidades de póker",
      "intro": "Elige tus dos cartas y, si quieres, la mesa y la mano de un rival. La calculadora reparte todas las cartas restantes — de forma exacta siempre que puede, por simulación si no — y muestra con qué frecuencia ganas.",
      "you": "Tu mano",
      "board": "Mesa",
      "opp": "Rival (opcional)",
      "players": "Rivales",
      "pick": "Toca una carta para ponerla en la casilla resaltada; toca una casilla para vaciarla.",
      "clear": "Borrar",
      "win": "Victoria",
      "tie": "Empate",
      "lose": "Derrota",
      "exact": "Exacto: cada uno de los {n} repartos posibles.",
      "sim": "Simulación de {n} repartos al azar.",
      "working": "Calculando…",
      "need": "Elige tus dos cartas para ver tus probabilidades.",
      "boardHint": "La mesa admite tres cartas (el flop), luego cuatro y luego cinco.",
      "oppHint": "Elige las dos cartas de tu rival, o ninguna.",
      "final": "Tu mano final",
      "noscript": "La calculadora necesita JavaScript. Las tablas de abajo funcionan sin él."
    },
    "outsH2": "Outs: tu probabilidad de ligar",
    "outsP": "Un out es una carta que sigue en la baraja y que convierte tu mano en la probable ganadora. En el flop quedan 47 cartas sin ver: con 9 outs, una carta liga en el turn el {f9turn} de las veces, y hasta el river — con dos cartas por salir — el {f9river}.",
    "outsCols": [
      "Proyecto",
      "Outs",
      "Turn",
      "River (desde el turn)",
      "Turn o river (desde el flop)"
    ],
    "draws": {
      "gutshot": "Proyecto de escalera interna (gutshot)",
      "twoPairFull": "Doble pareja a full",
      "pairTrips": "Una pareja a doble pareja o trío",
      "twoOver": "Dos cartas altas (overcards) a pareja",
      "setFull": "Set a full o póker",
      "oesd": "Proyecto de escalera abierta",
      "flush": "Proyecto de color",
      "flushGut": "Proyecto de color y gutshot",
      "flushOesd": "Proyecto de color y de escalera abierta"
    },
    "outsNote": "Estas son las probabilidades de ligar uno de tus outs. No incluyen los extras runner-runner, y un out que también le da una mano mejor a un rival no es realmente un out.",
    "ruleH2": "La regla del 2 y el 4",
    "ruleP": "Una estimación rápida en la mesa: multiplica tus outs por 4 en el flop cuando vayas a ver el turn y el river, y por 2 cuando solo falte una carta. Un proyecto de color en el flop da 9 × 4 = 36%, frente a un {f9river} exacto. La regla sobrestima los proyectos grandes: 15 outs dan 60%, y la cifra real es {f15river}.",
    "potH2": "Pot odds: ¿debes igualar?",
    "potP": "Las pot odds comparan lo que debes pagar con lo que puedes ganar. El pozo tiene 100 y tu rival apuesta 50: igualas 50 para ganar un pozo de 200, así que el Call tiene que ganar más del 50 ÷ 200 = 25% de las veces para ser rentable. Con un proyecto de color y una carta por salir ligas el {f9one} de las veces, así que igualar una apuesta cuando solo queda el river pierde fichas a la larga. All-in en el flop, con las dos cartas por salir, el mismo proyecto liga el {f9river}, y vale la pena igualar.",
    "matchH2": "Enfrentamientos preflop",
    "matchP": "Cómo les va a dos manos iniciales una contra otra cuando se reparten las cinco cartas de la mesa, contado sobre cada una de las {boards} mesas posibles. Los palos importan un poco: las manos de abajo no comparten palo salvo que se muestren del mismo palo.",
    "matchCols": [
      "Mano",
      "Contra",
      "Gana",
      "Empate",
      "Pierde"
    ],
    "startH2": "Probabilidades de las manos iniciales",
    "startP": "Hay {combos} manos iniciales distintas de dos cartas. Con qué frecuencia te toca:",
    "startCols": [
      "Mano",
      "Probabilidad",
      "Aprox. una mano de cada"
    ],
    "starting": {
      "specificPair": "Una pareja servida concreta, como ases",
      "anyPair": "Cualquier pareja servida",
      "specificNonPair": "Una mano concreta sin pareja, como as-rey",
      "specificSuited": "Una mano concreta del mismo palo, como as-rey del mismo palo",
      "anySuited": "Cualquier par de cartas del mismo palo",
      "twoBroadway": "Dos cartas de diez o más"
    },
    "faqH2": "Preguntas",
    "faq": [
      [
        "¿Qué son los outs en el póker?",
        "Las cartas que quedan en la baraja y que te darían la mejor mano. Cuenta solo las cartas que no has visto: 47 en el flop, 46 en el turn."
      ],
      [
        "¿Con qué frecuencia los ases servidos les ganan a los reyes?",
        "Unas cuatro veces de cada cinco: el {aakk} cuando se reparten las cinco cartas de la mesa, y los reyes ganan el {kkaa}."
      ],
      [
        "¿As-rey contra una pareja es una moneda al aire?",
        "Casi, contra una pareja media: las reinas le ganan el {qqak} a as-rey. Contra una pareja baja es aún más parejo — los doses ganan el {22ak}."
      ],
      [
        "¿Qué son las pot odds?",
        "El precio de un Call comparado con el pozo que puedes ganar. Si tu probabilidad de ganar es mayor que la parte del pozo final que pones, igualar sale rentable con el tiempo."
      ],
      [
        "¿PokerTH muestra mis probabilidades durante la partida?",
        "Sí. La pestaña Probabilidades nombra tu mejor mano actual y tu probabilidad de ganar a medida que salen las cartas, para que puedas comprobar tu propio razonamiento en la mesa."
      ]
    ]
  },
  et: {
    "title": "Pokkeri tõenäosused — outid, poti šansid, käte duellid | PokerTH",
    "desc": "Texas Hold’emi tõenäosused täpselt välja arvutatud: outid ja sinu võimalus neid tabada, 2 ja 4 reegel, poti šansid ning kui tihti AA võidab KK-d või QQ AK-d.",
    "ldHeadline": "Pokkeri tõenäosused: outid, poti šansid ja duellid enne floppi",
    "ldDesc": "Texas Hold’emi tõenäosused täpselt arvutatud: outid, 2 ja 4 reegel, poti šansid ja duellid enne floppi.",
    "h1": "Pokkeri tõenäosused: outid, poti šansid ja duellid enne floppi",
    "lead": "Head pokkeriotsused taanduvad mõnele arvule: kui tõenäoliselt su käsi paraneb, kui palju pead selle teadasaamiseks maksma ja kuidas kaks kätt enne floppi teineteise vastu seisavad. Iga arv sellel lehel on arvutatud täpselt, mitte kopeeritud tabelist.",
    "calc": {
      "h2": "Pokkeri tõenäosuste kalkulaator",
      "intro": "Vali oma kaks kaarti ja soovi korral laud ning vastase käsi. Kalkulaator jagab välja kõik ülejäänud kaardid — täpselt alati, kui saab, muidu simulatsiooniga — ja näitab, kui tihti sa võidad.",
      "you": "Sinu käsi",
      "board": "Laud",
      "opp": "Vastane (valikuline)",
      "players": "Vastased",
      "pick": "Puuduta kaarti, et panna see esiletõstetud kohale; puuduta kohta, et see tühjendada.",
      "clear": "Tühjenda",
      "win": "Võit",
      "tie": "Viik",
      "lose": "Kaotus",
      "exact": "Täpne: kõik {n} võimalikku jagamist.",
      "sim": "{n} juhusliku jagamise simulatsioon.",
      "working": "Arvutan…",
      "need": "Vali oma kaks kaarti, et näha oma šansse.",
      "boardHint": "Lauale tuleb kolm kaarti (flop), siis neli, siis viis.",
      "oppHint": "Vali vastase mõlemad kaardid või mitte ühtegi.",
      "final": "Sinu lõplik käsi",
      "noscript": "Kalkulaator vajab JavaScripti. Allolevad tabelid töötavad ka ilma selleta."
    },
    "outsH2": "Outid: sinu võimalus tabada",
    "outsP": "Out on pakki jäänud kaart, mis teeb sinu käest tõenäolise võitja. Flopil on nägemata 47 kaarti: 9 outiga tabab üks kaart turnil {f9turn} juhtudest ja riverini — kui tulemas on veel kaks kaarti — {f9river}.",
    "outsCols": [
      "Väljavaade",
      "Outid",
      "Turn",
      "River (turnilt)",
      "Turn või river (flopilt)"
    ],
    "draws": {
      "gutshot": "Sisemine rea väljavaade (gutshot)",
      "twoPairFull": "Kaks paari täismajaks",
      "pairTrips": "Paar kaheks paariks või kolmikuks",
      "twoOver": "Kaks ülekaarti paariks",
      "setFull": "Set täismajaks või neljikuks",
      "oesd": "Kahepoolselt avatud rea väljavaade",
      "flush": "Masti väljavaade",
      "flushGut": "Masti väljavaade ja gutshot",
      "flushOesd": "Masti väljavaade ja kahepoolselt avatud rea väljavaade"
    },
    "outsNote": "Need on võimalused saada üks oma outidest. Neis pole arvestatud lisavõimalusi kahe järjestikuse kaardiga (runner-runner) ning out, mis annab ka vastasele parema käe, pole tegelikult out.",
    "ruleH2": "2 ja 4 reegel",
    "ruleP": "Kiire hinnang laua taga: korruta flopil oma outid 4-ga, kui näed nii turni kui ka riverit, ja 2-ga, kui tulemas on ainult üks kaart. Masti väljavaade flopil annab 9 × 4 = 36%, samas kui täpne väärtus on {f9river}. Reegel hindab suuri väljavaateid üle: 15 outi annab 60%, tegelik arv on {f15river}.",
    "potH2": "Poti šansid: kas maksta?",
    "potP": "Poti šansid võrdlevad seda, mida pead maksma, sellega, mida saad võita. Potis on 100 ja vastane panustab 50: maksad 50, et võita 200 suurune pott, seega peab maksmine end ära tasumiseks võitma rohkem kui 50 ÷ 200 = 25% juhtudest. Masti väljavaate ja ühe tulemata kaardiga tabad {f9one} juhtudest, nii et panuse maksmine, kui alles on ainult river, kaotab pikas plaanis žetoone. All-in flopil, kui tulemas on veel mõlemad kaardid, tabab sama väljavaade {f9river} ja maksmine tasub end ära.",
    "matchH2": "Duellid enne floppi",
    "matchP": "Kuidas kaks stardikätt teineteise vastu hakkama saavad, kui jagatakse kõik viis lauakaarti, loetuna üle kõigi {boards} võimaliku laua. Mastid mõjutavad veidi: allpool olevatel kätel pole ühist masti, kui neid pole näidatud sama masti kätena.",
    "matchCols": [
      "Käsi",
      "Vastu",
      "Võidab",
      "Viik",
      "Kaotab"
    ],
    "startH2": "Stardikäte tõenäosused",
    "startP": "On {combos} erinevat kahekaardilist stardikätt. Kui tihti sulle jagatakse:",
    "startCols": [
      "Käsi",
      "Tõenäosus",
      "Umbes üks käsi iga"
    ],
    "starting": {
      "specificPair": "Kindel taskupaar, näiteks ässad",
      "anyPair": "Ükskõik milline taskupaar",
      "specificNonPair": "Kindel paarita käsi, näiteks äss-kuningas",
      "specificSuited": "Kindel sama masti käsi, näiteks sama masti äss-kuningas",
      "anySuited": "Ükskõik millised kaks sama masti kaarti",
      "twoBroadway": "Kaks kaarti kümnest ülespoole"
    },
    "faqH2": "Küsimused",
    "faq": [
      [
        "Mis on outid pokkeris?",
        "Pakki jäänud kaardid, mis annaksid sulle parima käe. Loe ainult kaarte, mida sa pole näinud: flopil 47, turnil 46."
      ],
      [
        "Kui tihti võidavad taskuässad kuningaid?",
        "Umbes neli korda viiest: {aakk}, kui jagatakse kõik viis lauakaarti, ja kuningad võidavad {kkaa}."
      ],
      [
        "Kas äss-kuningas paari vastu on mündivise?",
        "Peaaegu, keskmise paari vastu: emandad võidavad äss-kuninga vastu {qqak}. Väikese paari vastu on see veelgi võrdsem — kahesed võidavad {22ak}."
      ],
      [
        "Mis on poti šansid?",
        "Maksmise hind võrrelduna potiga, mida saad võita. Kui sinu võiduvõimalus on suurem kui osa lõplikust potist, mille sina sisse paned, tasub maksmine end aja jooksul ära."
      ],
      [
        "Kas PokerTH näitab mängu ajal minu šansse?",
        "Jah. Vahekaart Šansid nimetab sinu hetke parima käe ja võiduvõimaluse kaartide avanedes, nii et saad laua taga oma arutluskäiku kontrollida."
      ]
    ]
  },
  eu: {
    "title": "Pokerreko probabilitateak — outs-ak, potearen aukerak | PokerTH",
    "desc": "Texas Hold’em-eko probabilitate zehatzak: outs-ak eta ateratzeko aukera, 2 eta 4ren araua, potearen aukerak eta zenbatetan irabazten dien AA-k KK-ri edo QQ-k AK-ri.",
    "ldHeadline": "Pokerreko probabilitateak: outs-ak, potearen aukerak eta preflop norgehiagokak",
    "ldDesc": "Texas Hold’em-eko probabilitateak zehazki kalkulatuta: outs-ak, 2 eta 4ren araua, potearen aukerak eta preflop norgehiagokak.",
    "h1": "Pokerreko probabilitateak: outs-ak, potearen aukerak eta preflop norgehiagokak",
    "lead": "Pokerreko erabaki onak zenbaki gutxi batzuetara mugatzen dira: zure eskua hobetzeko zenbat aukera dagoen, hori jakiteko zenbat ordaindu behar duzun, eta flop-aren aurretik bi esku elkarren aurka nola dauden. Orrialde honetako zifra guztiak zehazki kalkulatuta daude, ez taula batetik kopiatuta.",
    "calc": {
      "h2": "Pokerreko probabilitate-kalkulagailua",
      "intro": "Aukeratu zure bi kartak eta, nahi baduzu, board-a eta aurkari baten eskua. Kalkulagailuak geratzen diren karta guztiak banatzen ditu — zehazki ahal duen guztietan, simulazio bidez bestela — eta zenbatetan irabazten duzun erakusten du.",
      "you": "Zure eskua",
      "board": "Board-a",
      "opp": "Aurkaria (aukerakoa)",
      "players": "Aurkariak",
      "pick": "Ukitu karta bat nabarmendutako tokian jartzeko; ukitu toki bat hura husteko.",
      "clear": "Garbitu",
      "win": "Irabazi",
      "tie": "Berdinketa",
      "lose": "Galdu",
      "exact": "Zehatza: posible diren {n} banaketa guztiak.",
      "sim": "Ausazko {n} banaketaren simulazioa.",
      "working": "Kalkulatzen…",
      "need": "Aukeratu zure bi kartak zure aukerak ikusteko.",
      "boardHint": "Board-ak hiru karta hartzen ditu (flop-a), gero lau, gero bost.",
      "oppHint": "Aukeratu aurkariaren bi kartak, edo bat ere ez.",
      "final": "Zure azken eskua",
      "noscript": "Kalkulagailuak JavaScript behar du. Beheko taulek hura gabe ere funtzionatzen dute."
    },
    "outsH2": "Outs-ak: zure aukera karta ateratzeko",
    "outsP": "Out bat sortan oraindik dagoen karta bat da, zure eskua irabazle probable bihurtzen duena. Flop-ean 47 karta daude ikusi gabe: 9 out-ekin, karta batek turn-ean asmatzen du kasuen {f9turn}, eta river-erako — bi karta etortzeko — kasuen {f9river}.",
    "outsCols": [
      "Proiektua",
      "Outs",
      "Turn",
      "River (turn-etik)",
      "Turn edo river (flop-etik)"
    ],
    "draws": {
      "gutshot": "Barneko eskailera-proiektua (gutshot)",
      "twoPairFull": "Bi bikote → Full",
      "pairTrips": "Bikotea → Bi bikote edo Hirukoa",
      "twoOver": "Bi overcard → Bikotea",
      "setFull": "Set-a → Full edo Pokerra",
      "oesd": "Bi muturretan irekitako eskailera-proiektua",
      "flush": "Kolore-proiektua",
      "flushGut": "Kolore-proiektua eta gutshot-a",
      "flushOesd": "Kolore-proiektua eta bi muturretan irekitako eskailera-proiektua"
    },
    "outsNote": "Hauek dira zure outs-etako bat ateratzeko aukerak. Ez dute runner-runner gehigarririk barne hartzen, eta aurkari bati ere esku hobea ematen dion out bat ez da benetan out bat.",
    "ruleH2": "2 eta 4ren araua",
    "ruleP": "Mahaian egiteko estimazio azkarra: biderkatu zure outs-ak 4z flop-ean turn-a eta river-a biak ikusiko dituzunean, eta 2z karta bakarra falta denean. Flop-eko kolore-proiektu bat 9 × 4 = % 36 da, zehazki {f9river} izan arren. Arauak gehiegi estimatzen ditu proiektu handiak: 15 out-ek % 60 ematen dute, eta benetako zifra {f15river} da.",
    "potH2": "Potearen aukerak: Call egin behar duzu?",
    "potP": "Potearen aukerek ordaindu behar duzuna irabaz dezakezunarekin alderatzen dute. Poteak 100 ditu eta aurkariak 50 apostatzen ditu: 50 ordaintzen dituzu 200eko potea irabazteko, beraz Call-ak kasuen 50 ÷ 200 = % 25 baino gehiagotan irabazi behar du errentagarria izateko. Kolore-proiektu batekin eta karta bat etortzeko, kasuen {f9one} asmatzen duzu, beraz river-a bakarrik falta denean apustu bati Call egiteak txipak galarazten dizkizu epe luzean. Flop-ean All-In, bi kartak etortzeko, proiektu berak kasuen {f9river} asmatzen du, eta Call egiteak merezi du.",
    "matchH2": "Preflop norgehiagokak",
    "matchP": "Bi hasierako esku elkarren aurka nola ateratzen diren board-eko bost kartak banatzen direnean, posible diren {boards} board guztien gainean kontatuta. Koloreek pixka bat eragiten dute: beheko eskuek ez dute kolorerik partekatzen, kolore berekoak direla erakusten ez bada.",
    "matchCols": [
      "Eskua",
      "Aurka",
      "Irabazi",
      "Berdinketa",
      "Galdu"
    ],
    "startH2": "Hasierako eskuen probabilitateak",
    "startP": "{combos} bi kartako hasierako esku desberdin daude. Zenbatetan egokitzen zaizu:",
    "startCols": [
      "Eskua",
      "Aukera",
      "Gutxi gorabehera esku hauetatik bat"
    ],
    "starting": {
      "specificPair": "Poltsikoko bikote jakin bat, batekoak adibidez",
      "anyPair": "Edozein poltsikoko bikote",
      "specificNonPair": "Bikoterik gabeko esku jakin bat, bateko-errege adibidez",
      "specificSuited": "Kolore bereko esku jakin bat, kolore bereko bateko-errege adibidez",
      "anySuited": "Kolore bereko edozein bi karta",
      "twoBroadway": "Hamarra edo handiagoak diren bi karta"
    },
    "faqH2": "Galderak",
    "faq": [
      [
        "Zer dira outs-ak pokerrean?",
        "Sortan geratzen diren eta esku onena emango lizuketen kartak. Zenbatu ikusi ez dituzun kartak bakarrik: 47 flop-ean, 46 turn-ean."
      ],
      [
        "Zenbatetan irabazten diete poltsikoko batekoek erregeei?",
        "Bost alditik lau gutxi gorabehera: kasuen {aakk} board-eko bost kartak banatzen direnean, eta erregeek kasuen {kkaa} irabazten dute."
      ],
      [
        "Bateko-errege bikote baten aurka txanpon-jaurtiketa bat al da?",
        "Ia, erdiko bikote baten aurka: damek kasuen {qqak} irabazten dute bateko-erregeren aurka. Bikote txiki baten aurka are estuagoa da — 22 bikoteak kasuen {22ak} irabazten du."
      ],
      [
        "Zer dira potearen aukerak?",
        "Call baten prezioa, irabaz dezakezun potearekin alderatuta. Irabazteko duzun aukera azken potean zuk jartzen duzun zatia baino handiagoa bada, Call egiteak irabaziak ematen ditu denborarekin."
      ],
      [
        "PokerTH-k nire aukerak erakusten al ditu partidan?",
        "Bai. Aukerak fitxak zure uneko esku onena eta irabazteko duzun aukera adierazten ditu kartak ateratzen diren heinean, mahaian bertan zure arrazoibidea egiaztatu ahal izateko."
      ]
    ]
  },
  fa: {
    "title": "جدول شانس پوکر — اوت‌ها، شانس پات، رویارویی دست‌ها | PokerTH",
    "desc": "شانس‌های Texas Hold’em با محاسبهٔ دقیق: اوت‌ها و شانس رسیدن به آن‌ها، قانون ۲ و ۴، شانس پات، و اینکه AA چند بار KK را و QQ چند بار AK را می‌برد.",
    "ldHeadline": "شانس‌های پوکر: اوت‌ها، شانس پات و رویارویی‌های پیش از فلاپ",
    "ldDesc": "شانس‌های Texas Hold’em با محاسبهٔ دقیق: اوت‌ها، قانون ۲ و ۴، شانس پات و رویارویی‌های پیش از فلاپ.",
    "h1": "شانس‌های پوکر: اوت‌ها، شانس پات و رویارویی‌های پیش از فلاپ",
    "lead": "تصمیم‌های خوب در پوکر به چند عدد برمی‌گردد: احتمال اینکه دستتان بهتر شود چقدر است، برای فهمیدنش چقدر باید بپردازید، و دو دست پیش از فلاپ در برابر هم چه وضعی دارند. هر عددی در این صفحه به‌طور دقیق محاسبه شده است، نه اینکه از جدولی رونویسی شده باشد.",
    "calc": {
      "h2": "ماشین‌حساب شانس پوکر",
      "intro": "دو کارت خود را انتخاب کنید و اگر خواستید، کارت‌های میز و دست یک حریف را هم. ماشین‌حساب همهٔ کارت‌های باقی‌مانده را پخش می‌کند — هر جا ممکن باشد دقیق، وگرنه با شبیه‌سازی — و نشان می‌دهد چند وقت یک‌بار می‌برید.",
      "you": "دست شما",
      "board": "کارت‌های میز",
      "opp": "حریف (اختیاری)",
      "players": "حریفان",
      "pick": "روی یک کارت بزنید تا در خانهٔ برجسته قرار گیرد؛ روی یک خانه بزنید تا خالی شود.",
      "clear": "پاک کردن",
      "win": "برد",
      "tie": "مساوی",
      "lose": "باخت",
      "exact": "دقیق: همهٔ {n} پخش ممکن.",
      "sim": "شبیه‌سازی {n} پخش تصادفی.",
      "working": "در حال محاسبه…",
      "need": "برای دیدن شانس‌هایتان دو کارت خود را انتخاب کنید.",
      "boardHint": "روی میز سه کارت (فلاپ)، سپس چهار و سپس پنج کارت قرار می‌گیرد.",
      "oppHint": "هر دو کارت حریف را انتخاب کنید، یا هیچ‌کدام را.",
      "final": "دست نهایی شما",
      "noscript": "ماشین‌حساب به JavaScript نیاز دارد. جدول‌های زیر بدون آن هم کار می‌کنند."
    },
    "outsH2": "اوت‌ها: شانس رسیدن شما",
    "outsP": "اوت کارتی است که هنوز در دسته مانده و دست شما را به برندهٔ احتمالی تبدیل می‌کند. روی فلاپ ۴۷ کارت دیده نشده است: با ۹ اوت، یک کارت در ترن در {f9turn} مواقع می‌آید، و تا ریور — با دو کارت در پیش — در {f9river}.",
    "outsCols": [
      "درآ",
      "اوت‌ها",
      "ترن",
      "ریور (از ترن)",
      "ترن یا ریور (از فلاپ)"
    ],
    "draws": {
      "gutshot": "درآی استریت از وسط (گات‌شات)",
      "twoPairFull": "دو جفت به فول هاوس",
      "pairTrips": "یک جفت به دو جفت یا سه‌تایی",
      "twoOver": "دو اورکارت به یک جفت",
      "setFull": "ست به فول هاوس یا کاره",
      "oesd": "درآی استریت دوطرفه",
      "flush": "درآی فلاش",
      "flushGut": "درآی فلاش و گات‌شات",
      "flushOesd": "درآی فلاش و درآی استریت دوطرفه"
    },
    "outsNote": "این‌ها شانس گرفتن یکی از اوت‌های شماست. حالت‌های رانر-رانر (در پشتی) حساب نشده‌اند، و اوتی که به حریف هم دست بهتری بدهد، در واقع اوت نیست.",
    "ruleH2": "قانون ۲ و ۴",
    "ruleP": "یک تخمین سریع سر میز: روی فلاپ، وقتی هم ترن و هم ریور را می‌بینید، اوت‌هایتان را در ۴ ضرب کنید، و وقتی فقط یک کارت مانده، در ۲. درآی فلاش روی فلاپ می‌شود ۹ × ۴ = ۳۶٪، در برابر {f9river} دقیق. این قانون درآهای بزرگ را بیش از واقع برآورد می‌کند: ۱۵ اوت ۶۰٪ می‌دهد، رقم واقعی {f15river} است.",
    "potH2": "شانس پات: کال کنید یا نه؟",
    "potP": "شانس پات آنچه باید بپردازید را با آنچه می‌توانید ببرید مقایسه می‌کند. پات ۱۰۰ است و حریف ۵۰ شرط می‌بندد: شما ۵۰ کال می‌کنید تا پاتی به اندازهٔ ۲۰۰ را ببرید، پس کال باید در بیش از ۵۰ ÷ ۲۰۰ = ۲۵٪ مواقع ببرد تا بصرفد. با درآی فلاش و یک کارت در پیش، در {f9one} مواقع می‌رسید، پس کال‌کردن یک شرط وقتی فقط ریور مانده، در درازمدت ژتون از دست می‌دهد. اگر روی فلاپ همه‌چیز وسط باشد و هر دو کارت در پیش باشند، همان درآ در {f9river} مواقع می‌رسد و کال‌کردن می‌ارزد.",
    "matchH2": "رویارویی‌های پیش از فلاپ",
    "matchP": "دو دست شروع در برابر هم چگونه عمل می‌کنند وقتی هر پنج کارت میز پخش شود، با شمارش روی تک‌تک {boards} میز ممکن. خال‌ها کمی اهمیت دارند: دست‌های زیر هیچ خال مشترکی ندارند، مگر آنکه هم‌خال نشان داده شده باشند.",
    "matchCols": [
      "دست",
      "در برابر",
      "برد",
      "مساوی",
      "باخت"
    ],
    "startH2": "شانس دست‌های شروع",
    "startP": "{combos} دست شروع دوکارتی متفاوت وجود دارد. چند وقت یک‌بار به شما می‌رسد:",
    "startCols": [
      "دست",
      "شانس",
      "حدوداً یک دست از هر"
    ],
    "starting": {
      "specificPair": "یک جفت در دست مشخص، مثلاً آس‌ها",
      "anyPair": "هر جفت در دستی",
      "specificNonPair": "یک دست بی‌جفت مشخص، مثلاً آس-شاه",
      "specificSuited": "یک دست هم‌خال مشخص، مثلاً آس-شاه هم‌خال",
      "anySuited": "هر دو کارت هم‌خالی",
      "twoBroadway": "دو کارت از ده به بالا"
    },
    "faqH2": "پرسش‌ها",
    "faq": [
      [
        "اوت در پوکر چیست؟",
        "کارت‌هایی که در دسته مانده‌اند و بهترین دست را به شما می‌دهند. فقط کارت‌هایی را بشمارید که ندیده‌اید: ۴۷ روی فلاپ، ۴۶ روی ترن."
      ],
      [
        "جفت آس چند وقت یک‌بار جفت شاه را می‌برد؟",
        "تقریباً چهار بار از پنج بار: {aakk} وقتی هر پنج کارت میز پخش شود، و شاه‌ها {kkaa} می‌برند."
      ],
      [
        "آیا آس-شاه در برابر یک جفت شیر یا خط است؟",
        "تقریباً، در برابر یک جفت متوسط: بی‌بی‌ها {qqak} در برابر آس-شاه می‌برند. در برابر یک جفت کوچک حتی نزدیک‌تر است — دوها {22ak} می‌برند."
      ],
      [
        "شانس پات چیست؟",
        "قیمت یک کال در مقایسه با پاتی که می‌توانید ببرید. اگر شانس بردتان از سهمی از پات نهایی که خودتان می‌گذارید بیشتر باشد، کال‌کردن در درازمدت سود می‌دهد."
      ],
      [
        "آیا PokerTH در طول بازی شانس‌هایم را نشان می‌دهد؟",
        "بله. زبانهٔ «شانس‌ها» بهترین دست فعلی شما و شانس بردتان را همزمان با آمدن کارت‌ها نشان می‌دهد، تا بتوانید استدلال خودتان را سر میز بسنجید."
      ]
    ]
  },
  fi: {
    "title": "Pokerin todennäköisyydet — outit, pottikerroin, kädet | PokerTH",
    "desc": "Texas Hold’emin todennäköisyydet tarkasti laskettuina: outit ja osumamahdollisuutesi, 2:n ja 4:n sääntö, pottikerroin ja kuinka usein AA voittaa KK:n tai QQ AK:n.",
    "ldHeadline": "Pokerin todennäköisyydet: outit, pottikerroin ja kädet vastakkain ennen floppia",
    "ldDesc": "Texas Hold’emin todennäköisyydet tarkasti laskettuina: outit, 2:n ja 4:n sääntö, pottikerroin ja kädet vastakkain ennen floppia.",
    "h1": "Pokerin todennäköisyydet: outit, pottikerroin ja kädet vastakkain ennen floppia",
    "lead": "Hyvät pokeripäätökset palautuvat muutamaan lukuun: kuinka todennäköisesti kätesi paranee, paljonko sinun on maksettava saadaksesi sen selville ja miten kaksi kättä pärjäävät toisiaan vastaan ennen floppia. Jokainen luku tällä sivulla on laskettu tarkasti, ei kopioitu taulukosta.",
    "calc": {
      "h2": "Pokerin todennäköisyyslaskuri",
      "intro": "Valitse kaksi korttiasi ja halutessasi pöydän kortit ja vastustajan käsi. Laskuri jakaa läpi kaikki jäljellä olevat kortit — tarkasti aina kun mahdollista, muuten simuloimalla — ja näyttää, kuinka usein voitat.",
      "you": "Kätesi",
      "board": "Pöytä",
      "opp": "Vastustaja (valinnainen)",
      "players": "Vastustajat",
      "pick": "Napauta korttia asettaaksesi sen korostettuun paikkaan; napauta paikkaa tyhjentääksesi sen.",
      "clear": "Tyhjennä",
      "win": "Voitto",
      "tie": "Tasapeli",
      "lose": "Häviö",
      "exact": "Tarkka: kaikki {n} mahdollista jakoa.",
      "sim": "Simulaatio {n} satunnaisesta jaosta.",
      "working": "Lasketaan…",
      "need": "Valitse kaksi korttiasi nähdäksesi mahdollisuutesi.",
      "boardHint": "Pöytään tulee kolme korttia (floppi), sitten neljä, sitten viisi.",
      "oppHint": "Valitse vastustajan molemmat kortit tai ei kumpaakaan.",
      "final": "Lopullinen kätesi",
      "noscript": "Laskuri tarvitsee JavaScriptin. Alla olevat taulukot toimivat ilmankin."
    },
    "outsH2": "Outit: mahdollisuutesi osua",
    "outsP": "Outti on pakassa vielä oleva kortti, joka tekee kädestäsi todennäköisen voittajan. Flopissa 47 korttia on näkemättä: 9 outilla kortti osuu turnissa {f9turn} kerroista ja riveriin mennessä — kaksi korttia tulossa — {f9river}.",
    "outsCols": [
      "Veto",
      "Outit",
      "Turn",
      "River (turnista)",
      "Turn tai river (flopista)"
    ],
    "draws": {
      "gutshot": "Sisäsuoranveto (gutshot)",
      "twoPairFull": "Kaksi paria täyskäteen",
      "pairTrips": "Pari kahteen pariin tai kolmosiin",
      "twoOver": "Kaksi yläkorttia pariin",
      "setFull": "Piilotetut kolmoset täyskäteen tai nelosiin",
      "oesd": "Avoin suoranveto",
      "flush": "Värinveto",
      "flushGut": "Värinveto ja gutshot",
      "flushOesd": "Värinveto ja avoin suoranveto"
    },
    "outsNote": "Nämä ovat mahdollisuudet osua johonkin outeistasi. Niissä ei ole mukana runner-runner-lisiä, eikä outti, joka antaa myös vastustajalle paremman käden, ole oikeasti outti.",
    "ruleH2": "2:n ja 4:n sääntö",
    "ruleP": "Nopea arvio pöydässä: kerro outit flopissa 4:llä, kun näet sekä turnin että riverin, ja 2:lla, kun tulossa on vain yksi kortti. Värinveto flopissa on 9 × 4 = 36 %, tarkka luku on {f9river}. Sääntö yliarvioi isot vedot: 15 outia antaa 60 %, todellinen luku on {f15river}.",
    "potH2": "Pottikerroin: kannattaako maksaa?",
    "potP": "Pottikerroin vertaa sitä, mitä sinun on maksettava, siihen, mitä voit voittaa. Potissa on 100 ja vastustajasi panostaa 50: maksat 50 voittaaksesi 200:n potin, joten maksun on voitettava useammin kuin 50 ÷ 200 = 25 % kerroista, jotta se kannattaa. Värinvedolla ja yhdellä tulevalla kortilla osut {f9one} kerroista, joten panoksen maksaminen, kun jäljellä on vain river, häviää pelimerkkejä pitkällä aikavälillä. All-In flopissa, kun molemmat kortit ovat vielä tulossa, sama veto osuu {f9river}, ja maksaminen kannattaa.",
    "matchH2": "Kädet vastakkain ennen floppia",
    "matchP": "Miten kaksi aloituskättä pärjäävät toisiaan vastaan, kun kaikki viisi pöytäkorttia jaetaan, laskettuna kaikista {boards} mahdollisesta pöydästä. Maat vaikuttavat hieman: alla olevilla käsillä ei ole yhteistä maata, ellei niitä ole merkitty samaa maata oleviksi.",
    "matchCols": [
      "Käsi",
      "Vastaan",
      "Voittaa",
      "Tasapeli",
      "Häviää"
    ],
    "startH2": "Aloituskäsien todennäköisyydet",
    "startP": "Erilaisia kahden kortin aloituskäsiä on {combos}. Näin usein saat:",
    "startCols": [
      "Käsi",
      "Todennäköisyys",
      "Kerran noin … kädessä"
    ],
    "starting": {
      "specificPair": "Tietty käsipari, esimerkiksi ässät",
      "anyPair": "Mikä tahansa käsipari",
      "specificNonPair": "Tietty käsi ilman paria, esimerkiksi ässä-kuningas",
      "specificSuited": "Tietty samaa maata oleva käsi, esimerkiksi ässä-kuningas samaa maata",
      "anySuited": "Mitkä tahansa kaksi samaa maata olevaa korttia",
      "twoBroadway": "Kaksi korttia kympistä ylöspäin"
    },
    "faqH2": "Kysymyksiä",
    "faq": [
      [
        "Mitä outit ovat pokerissa?",
        "Pakkaan jääneet kortit, jotka antaisivat sinulle parhaan käden. Laske vain kortit, joita et ole nähnyt: 47 flopissa, 46 turnissa."
      ],
      [
        "Kuinka usein ässäpari kädessä voittaa kuninkaat?",
        "Noin neljä kertaa viidestä: {aakk}, kun kaikki viisi pöytäkorttia jaetaan; kuninkaat voittavat {kkaa}."
      ],
      [
        "Onko ässä-kuningas paria vastaan kolikonheitto?",
        "Melkein, keskikokoista paria vastaan: rouvat voittavat ässä-kuninkaan {qqak}. Pientä paria vastaan se on vielä tasaisempi — kakkoset voittavat {22ak}."
      ],
      [
        "Mikä on pottikerroin?",
        "Maksun hinta verrattuna pottiin, jonka voit voittaa. Jos voittomahdollisuutesi on suurempi kuin osuus lopullisesta potista, jonka itse maksat, maksaminen kannattaa ajan mittaan."
      ],
      [
        "Näyttääkö PokerTH mahdollisuuteni pelin aikana?",
        "Kyllä. Mahdollisuudet-välilehti nimeää parhaan kätesi ja voittotodennäköisyytesi sitä mukaa kuin kortit tulevat, joten voit tarkistaa oman päättelysi pöydässä."
      ]
    ]
  },
  fil: {
    "title": "Tsart ng poker odds — outs, pot odds, tapatan | PokerTH",
    "desc": "Odds ng Texas Hold’em, eksaktong kinuwenta: outs at ang tsansang tamaan ito, ang patakaran ng 2 at 4, pot odds, at gaano kadalas tinatalo ng AA ang KK o ng QQ ang AK.",
    "ldHeadline": "Poker odds: outs, pot odds at mga tapatan bago ang flop",
    "ldDesc": "Eksaktong kinuwentang odds sa Texas Hold’em: outs, ang patakaran ng 2 at 4, pot odds at mga tapatan bago ang flop.",
    "h1": "Poker odds: outs, pot odds at mga tapatan bago ang flop",
    "lead": "Ang magagandang desisyon sa poker ay nauuwi sa ilang numero: gaano kalamang na gumanda ang kamay mo, magkano ang kailangan mong bayaran para malaman, at paano nagtatapat ang dalawang kamay bago ang flop. Bawat numero sa pahinang ito ay eksaktong kinuwenta, hindi kinopya mula sa isang tsart.",
    "calc": {
      "h2": "Calculator ng poker odds",
      "intro": "Piliin ang dalawang baraha mo at, kung gusto mo, ang mesa at ang kamay ng isang kalaban. Ilalabas ng calculator ang bawat natitirang baraha — eksakto kapag kaya, sa simulation kung hindi — at ipapakita kung gaano ka kadalas mananalo.",
      "you": "Kamay mo",
      "board": "Mesa",
      "opp": "Kalaban (opsyonal)",
      "players": "Mga kalaban",
      "pick": "I-tap ang baraha para ilagay ito sa naka-highlight na puwesto; i-tap ang puwesto para alisan ito ng laman.",
      "clear": "I-clear",
      "win": "Panalo",
      "tie": "Tabla",
      "lose": "Talo",
      "exact": "Eksakto: lahat ng {n} posibleng bigayan.",
      "sim": "Simulation ng {n} random na bigayan.",
      "working": "Kinukuwenta…",
      "need": "Piliin ang dalawang baraha mo para makita ang odds mo.",
      "boardHint": "Tatlong baraha muna ang mesa (ang flop), pagkatapos apat, pagkatapos lima.",
      "oppHint": "Piliin ang parehong baraha ng kalaban mo, o wala.",
      "final": "Ang huling kamay mo",
      "noscript": "Kailangan ng calculator ang JavaScript. Gumagana ang mga talahanayan sa ibaba kahit wala ito."
    },
    "outsH2": "Outs: ang tsansa mong tumama",
    "outsP": "Ang out ay barahang nasa deck pa at gagawing malamang na panalo ang kamay mo. Sa flop, 47 baraha ang hindi pa nakikita: sa 9 na outs, tatama ang isang baraha sa turn nang {f9turn} ng pagkakataon, at pagdating ng river — dalawang baraha pa ang darating — {f9river}.",
    "outsCols": [
      "Hinihintay",
      "Outs",
      "Turn",
      "River (mula sa turn)",
      "Turn o river (mula sa flop)"
    ],
    "draws": {
      "gutshot": "Inside straight draw (gutshot)",
      "twoPairFull": "Two Pair papuntang Full House",
      "pairTrips": "One Pair papuntang Two Pair o Three of a Kind",
      "twoOver": "Dalawang overcard papuntang pares",
      "setFull": "Set papuntang Full House o Four of a Kind",
      "oesd": "Open-ended straight draw",
      "flush": "Flush draw",
      "flushGut": "Flush draw at gutshot",
      "flushOesd": "Flush draw at open-ended straight draw"
    },
    "outsNote": "Ito ang tsansang makuha ang isa sa mga outs mo. Hindi kasama ang mga dagdag na runner-runner, at ang out na nagbibigay rin ng mas magandang kamay sa kalaban ay hindi talaga out.",
    "ruleH2": "Ang patakaran ng 2 at 4",
    "ruleP": "Mabilis na tantiya sa mesa: i-multiply ang outs mo sa 4 sa flop kapag makikita mo pa ang turn at ang river, at sa 2 kapag isang baraha na lang ang darating. Ang flush draw sa flop ay 9 × 4 = 36%, kumpara sa eksaktong {f9river}. Sobra ang tantiya ng patakaran sa malalaking draw: 60% ang 15 outs, pero ang totoong numero ay {f15river}.",
    "potH2": "Pot odds: dapat ka bang mag-Call?",
    "potP": "Pinaghahambing ng pot odds ang kailangan mong bayaran at ang puwede mong mapanalunan. May 100 sa pot at tumaya ng 50 ang kalaban mo: magko-Call ka ng 50 para manalo ng pot na 200, kaya kailangang manalo ang call nang higit sa 50 ÷ 200 = 25% ng pagkakataon para sumulit. Sa flush draw na isang baraha na lang ang darating, tatama ka nang {f9one} ng pagkakataon, kaya ang pag-Call sa taya kapag river na lang ang natitira ay nagpapatalo ng chips sa katagalan. All-In sa flop, na dalawang baraha pa ang darating, tatama ang parehong draw nang {f9river}, at sulit ang call.",
    "matchH2": "Mga tapatan bago ang flop",
    "matchP": "Kung paano nagtatapat ang dalawang panimulang kamay kapag nailabas na ang limang baraha sa mesa, binilang sa bawat isa sa {boards} posibleng mesa. Medyo mahalaga ang palo: walang parehong palo ang mga kamay sa ibaba maliban kung ipinakitang suited.",
    "matchCols": [
      "Kamay",
      "Laban sa",
      "Panalo",
      "Tabla",
      "Talo"
    ],
    "startH2": "Odds ng panimulang kamay",
    "startP": "May {combos} iba't ibang panimulang kamay na dalawang baraha. Gaano kadalas mo makukuha:",
    "startCols": [
      "Kamay",
      "Tsansa",
      "Mga isang kamay sa bawat"
    ],
    "starting": {
      "specificPair": "Isang partikular na pares sa kamay, gaya ng mga alas",
      "anyPair": "Kahit anong pares sa kamay",
      "specificNonPair": "Isang partikular na kamay na hindi pares, gaya ng alas-hari",
      "specificSuited": "Isang partikular na suited na kamay, gaya ng alas-hari suited",
      "anySuited": "Kahit anong dalawang baraha na iisa ang palo",
      "twoBroadway": "Dalawang barahang sampu pataas"
    },
    "faqH2": "Mga tanong",
    "faq": [
      [
        "Ano ang outs sa poker?",
        "Ang mga barahang nasa deck pa na magbibigay sa iyo ng pinakamagandang kamay. Bilangin lang ang mga barahang hindi mo pa nakikita: 47 sa flop, 46 sa turn."
      ],
      [
        "Gaano kadalas tinatalo ng pares ng alas ang pares ng hari?",
        "Mga apat sa bawat lima: {aakk} kapag nailabas na ang limang baraha sa mesa, at nananalo ang pares ng hari nang {kkaa}."
      ],
      [
        "Coin flip ba ang alas-hari laban sa isang pares?",
        "Halos, laban sa katamtamang pares: nananalo ang pares ng reyna nang {qqak} laban sa alas-hari. Laban sa maliit na pares, mas dikit pa — nananalo ang pares ng dos nang {22ak}."
      ],
      [
        "Ano ang pot odds?",
        "Ang presyo ng isang call kumpara sa pot na puwede mong mapanalunan. Kung mas mataas ang tsansa mong manalo kaysa sa bahagi ng huling pot na inilagay mo, sulit ang pag-Call sa katagalan."
      ],
      [
        "Ipinapakita ba ng PokerTH ang odds ko habang naglalaro?",
        "Oo. Ipinapakita ng tab na Odds ang kasalukuyan mong pinakamagandang kamay at ang tsansa mong manalo habang lumalabas ang mga baraha, kaya masusuri mo ang sarili mong pangangatwiran sa mesa."
      ]
    ]
  },
  fr: {
    "title": "Probabilités au poker — outs, cotes du pot, duels | PokerTH",
    "desc": "Les probabilités du Texas Hold’em calculées exactement : outs et chances de les toucher, règle du 2 et du 4, cotes du pot, et combien de fois AA bat KK ou QQ bat AK.",
    "ldHeadline": "Probabilités au poker : outs, cotes du pot et duels préflop",
    "ldDesc": "Les probabilités du Texas Hold’em calculées exactement : outs, règle du 2 et du 4, cotes du pot et duels préflop.",
    "h1": "Probabilités au poker : outs, cotes du pot et duels préflop",
    "lead": "Les bonnes décisions au poker tiennent à quelques chiffres : la probabilité que votre main s’améliore, ce qu’il vous en coûte pour le savoir, et ce que valent deux mains l’une contre l’autre avant le flop. Chaque chiffre de cette page est calculé exactement, et non recopié d’un tableau.",
    "calc": {
      "h2": "Calculateur de probabilités au poker",
      "intro": "Choisissez vos deux cartes et, si vous le souhaitez, le tableau et la main d’un adversaire. Le calculateur distribue toutes les cartes restantes — exactement chaque fois que c’est possible, par simulation sinon — et indique combien de fois vous gagnez.",
      "you": "Votre main",
      "board": "Tableau",
      "opp": "Adversaire (facultatif)",
      "players": "Adversaires",
      "pick": "Touchez une carte pour la placer dans la case en surbrillance ; touchez une case pour la vider.",
      "clear": "Effacer",
      "win": "Victoire",
      "tie": "Égalité",
      "lose": "Défaite",
      "exact": "Exact : chacune des {n} donnes possibles.",
      "sim": "Simulation de {n} donnes aléatoires.",
      "working": "Calcul en cours…",
      "need": "Choisissez vos deux cartes pour voir vos chances.",
      "boardHint": "Le tableau prend trois cartes (le flop), puis quatre, puis cinq.",
      "oppHint": "Choisissez les deux cartes de votre adversaire, ou aucune.",
      "final": "Votre main finale",
      "noscript": "Le calculateur nécessite JavaScript. Les tables de chiffres ci-dessous fonctionnent sans."
    },
    "outsH2": "Outs : vos chances de toucher",
    "outsP": "Un out est une carte encore dans le paquet qui fait de votre main la gagnante probable. Au flop, 47 cartes restent inconnues : avec 9 outs, une carte touche à la turn dans {f9turn} des cas, et d’ici la river — deux cartes à venir — dans {f9river} des cas.",
    "outsCols": [
      "Tirage",
      "Outs",
      "Turn",
      "River (depuis la turn)",
      "Turn ou river (depuis le flop)"
    ],
    "draws": {
      "gutshot": "Tirage quinte par le ventre (gutshot)",
      "twoPairFull": "Deux Paires vers un Full",
      "pairTrips": "Paire vers Deux Paires ou un Brelan",
      "twoOver": "Deux surcartes vers une paire",
      "setFull": "Set vers un Full ou un Carré",
      "oesd": "Tirage quinte par les deux bouts",
      "flush": "Tirage couleur",
      "flushGut": "Tirage couleur et quinte par le ventre",
      "flushOesd": "Tirage couleur et quinte par les deux bouts"
    },
    "outsNote": "Ce sont les chances de toucher l’un de vos outs. Elles laissent de côté les compléments runner-runner, et un out qui donne aussi une meilleure main à un adversaire n’en est pas vraiment un.",
    "ruleH2": "La règle du 2 et du 4",
    "ruleP": "Une estimation rapide à table : multipliez vos outs par 4 au flop quand vous verrez la turn et la river, et par 2 quand il ne reste qu’une carte à venir. Un tirage couleur au flop donne 9 × 4 = 36 %, contre {f9river} exactement. La règle surestime les gros tirages : 15 outs donnent 60 %, le chiffre réel est {f15river}.",
    "potH2": "Cotes du pot : faut-il suivre ?",
    "potP": "Les cotes du pot comparent ce que vous devez payer à ce que vous pouvez gagner. Le pot contient 100 et votre adversaire mise 50 : vous payez 50 pour gagner un pot de 200, donc le call doit l’emporter dans plus de 50 ÷ 200 = 25 % des cas pour être rentable. Avec un tirage couleur et une seule carte à venir, vous touchez dans {f9one} des cas : suivre une mise quand il ne reste que la river fait perdre des jetons à la longue. À tapis au flop, avec les deux cartes à venir, le même tirage touche dans {f9river} des cas, et le call en vaut la peine.",
    "matchH2": "Duels préflop",
    "matchP": "Comment deux mains de départ s’en sortent l’une contre l’autre quand les cinq cartes du tableau sont distribuées, compté sur chacun des {boards} tableaux possibles. Les couleurs comptent un peu : les mains ci-dessous n’ont aucune couleur en commun, sauf si elles sont indiquées assorties.",
    "matchCols": [
      "Main",
      "Contre",
      "Gagne",
      "Égalité",
      "Perd"
    ],
    "startH2": "Probabilités des mains de départ",
    "startP": "Il existe {combos} mains de départ de deux cartes différentes. Fréquence à laquelle vous recevez :",
    "startCols": [
      "Main",
      "Probabilité",
      "Environ une main sur"
    ],
    "starting": {
      "specificPair": "Une paire servie donnée, par exemple les as",
      "anyPair": "N’importe quelle paire servie",
      "specificNonPair": "Une main sans paire donnée, par exemple as-roi",
      "specificSuited": "Une main assortie donnée, par exemple as-roi assortis",
      "anySuited": "Deux cartes assorties quelconques",
      "twoBroadway": "Deux cartes de dix ou plus"
    },
    "faqH2": "Questions",
    "faq": [
      [
        "Que sont les outs au poker ?",
        "Les cartes restant dans le paquet qui vous donneraient la meilleure main. Ne comptez que les cartes que vous n’avez pas vues : 47 au flop, 46 à la turn."
      ],
      [
        "Combien de fois une paire d’as bat-elle une paire de rois ?",
        "Environ quatre fois sur cinq : {aakk} quand les cinq cartes du tableau sont distribuées, contre {kkaa} pour les rois."
      ],
      [
        "As-roi contre une paire, est-ce pile ou face ?",
        "Presque, contre une paire moyenne : les dames gagnent {qqak} contre as-roi. Contre une petite paire, c’est plus serré encore — la paire de deux gagne {22ak}."
      ],
      [
        "Que sont les cotes du pot ?",
        "Le prix d’un call comparé au pot que vous pouvez gagner. Si votre chance de gagner dépasse la part du pot final que vous y avez mise, suivre est rentable sur la durée."
      ],
      [
        "PokerTH affiche-t-il mes chances pendant une partie ?",
        "Oui. L’onglet Chances nomme votre meilleure main du moment et vos chances de gagner au fur et à mesure que les cartes sortent, pour que vous puissiez vérifier votre propre raisonnement à la table."
      ]
    ]
  },
  ga: {
    "title": "Dóchúlachtaí pócair — outs, dóchúlachtaí an phota, lámha | PokerTH",
    "desc": "Dóchúlachtaí Texas Hold’em go beacht: outs agus do sheans iad a fháil, riail 2 agus 4, dóchúlachtaí an phota, agus cé chomh minic a bhuann AA ar KK nó QQ ar AK.",
    "ldHeadline": "Dóchúlachtaí pócair: outs, dóchúlachtaí an phota agus coimhlintí roimh an flop",
    "ldDesc": "Dóchúlachtaí Texas Hold’em ríofa go beacht: outs, riail 2 agus 4, dóchúlachtaí an phota agus coimhlintí lámh roimh an flop.",
    "h1": "Dóchúlachtaí pócair: outs, dóchúlachtaí an phota agus coimhlintí roimh an flop",
    "lead": "Is ar roinnt uimhreacha a bhraitheann cinntí maithe pócair: cé chomh dóchúil is atá sé go dtiocfaidh feabhas ar do lámh, cé mhéad a chaithfidh tú a íoc le fáil amach, agus conas a sheasann dhá lámh in aghaidh a chéile roimh an flop. Ríomhtar gach figiúr ar an leathanach seo go beacht; ní chóipeáiltear ó chairt é.",
    "calc": {
      "h2": "Áireamhán dóchúlachtaí pócair",
      "intro": "Roghnaigh do dhá chárta agus, más maith leat, an bord agus lámh chéile comhraic. Déileálann an t-áireamhán gach cárta atá fágtha — go beacht aon uair is féidir, trí insamhladh murach sin — agus taispeánann sé cé chomh minic a bhuann tú.",
      "you": "Do lámh",
      "board": "Bord",
      "opp": "Céile comhraic (roghnach)",
      "players": "Céilí comhraic",
      "pick": "Tapáil cárta chun é a chur sa sliotán aibhsithe; tapáil sliotán chun é a fholmhú.",
      "clear": "Glan",
      "win": "Bua",
      "tie": "Comhscór",
      "lose": "Cailleadh",
      "exact": "Beacht: gach ceann de na {n} déileáil is féidir.",
      "sim": "Insamhladh ar {n} déileáil randamach.",
      "working": "Á ríomh…",
      "need": "Roghnaigh do dhá chárta chun do sheans a fheiceáil.",
      "boardHint": "Tógann an bord trí chárta (an flop), ansin ceithre cinn, ansin cúig.",
      "oppHint": "Roghnaigh an dá chárta atá ag do chéile comhraic, nó ceann ar bith.",
      "final": "Do lámh dheiridh",
      "noscript": "Tá JavaScript ag teastáil ón áireamhán. Oibríonn na táblaí thíos gan é."
    },
    "outsH2": "Outs: do sheans é a fháil",
    "outsP": "Is éard is out ann ná cárta atá fós sa phaca a dhéanann an lámh is dóchúla a bhuafaidh de do lámh. Ar an flop, tá 47 cárta nach bhfaca tú: le 9 out, buaileann cárta amháin ar an turn {f9turn} den am, agus faoin river — dhá chárta le teacht — {f9river}.",
    "outsCols": [
      "Draw",
      "Outs",
      "Turn",
      "River (ón turn)",
      "Turn nó river (ón flop)"
    ],
    "draws": {
      "gutshot": "Draw srutha istigh (gutshot)",
      "twoPairFull": "Dhá phéire go teach lán",
      "pairTrips": "Péire go dhá phéire nó trí den saghas céanna",
      "twoOver": "Dhá chárta níos airde ná an bord, go péire",
      "setFull": "Set go teach lán nó ceathair den saghas céanna",
      "oesd": "Draw srutha oscailte",
      "flush": "Draw datha",
      "flushGut": "Draw datha agus gutshot",
      "flushOesd": "Draw datha agus draw srutha oscailte"
    },
    "outsNote": "Seo iad na seansanna go bhfaighidh tú ceann de d’outs. Ní áirítear breiseáin runner-runner iontu, agus ní out i ndáiríre é out a thugann lámh níos fearr do chéile comhraic freisin.",
    "ruleH2": "Riail 2 agus 4",
    "ruleP": "Meastachán tapa ag an mbord: méadaigh d’outs faoi 4 ar an flop nuair a fheicfidh tú an turn agus an river araon, agus faoi 2 nuair nach bhfuil ach cárta amháin le teacht. Is ionann draw datha ar an flop agus 9 × 4 = 36%, i gcomparáid le {f9river} go beacht. Déanann an riail ró-mheastachán ar dhraws móra: tugann 15 out 60%, ach is é {f15river} an fíorfhigiúr.",
    "potH2": "Dóchúlachtaí an phota: ar cheart duit glaoch?",
    "potP": "Cuireann dóchúlachtaí an phota a bhfuil le híoc agat i gcomparáid leis an méid is féidir leat a bhuachan. Tá 100 sa phota agus cuireann do chéile comhraic geall 50: glaonn tú 50 chun pota 200 a bhuachan, mar sin caithfidh an glao buachan níos mó ná 50 ÷ 200 = 25% den am le híoc as féin. Le draw datha agus cárta amháin le teacht, buaileann tú {f9one} den am, mar sin cailleann glao ar gheall nuair nach bhfuil ach an river fágtha sceallóga san fhadtéarma. All-in ar an flop, agus an dá chárta le teacht, buaileann an draw céanna {f9river}, agus is fiú an glao.",
    "matchH2": "Coimhlintí roimh an flop",
    "matchP": "Conas a éiríonn le dhá lámh tosaigh in aghaidh a chéile nuair a dhéileáiltear na cúig chárta phobail ar fad, comhairithe thar gach ceann de na {boards} bord is féidir. Is beag tionchar atá ag na culaithe: níl aon chulaith i gcoitinne ag na lámha thíos mura dtaispeántar iad den chulaith chéanna.",
    "matchCols": [
      "Lámh",
      "In aghaidh",
      "Buann",
      "Comhscór",
      "Cailleann"
    ],
    "startH2": "Dóchúlachtaí na lámh tosaigh",
    "startP": "Tá {combos} lámh tosaigh éagsúla dhá chárta ann. Cé chomh minic a dhéileáiltear duit:",
    "startCols": [
      "Lámh",
      "Seans",
      "Thart ar lámh amháin as"
    ],
    "starting": {
      "specificPair": "Péire póca áirithe, mar shampla aonta",
      "anyPair": "Péire póca ar bith",
      "specificNonPair": "Lámh áirithe gan phéire, mar shampla aon-rí",
      "specificSuited": "Lámh áirithe den chulaith chéanna, mar shampla aon-rí den chulaith chéanna",
      "anySuited": "Dhá chárta ar bith den chulaith chéanna",
      "twoBroadway": "Dhá chárta, deich nó níos airde"
    },
    "faqH2": "Ceisteanna",
    "faq": [
      [
        "Cad is outs ann sa phócar?",
        "Na cártaí atá fágtha sa phaca a thabharfadh an lámh is fearr duit. Ná comhair ach na cártaí nach bhfaca tú: 47 ar an flop, 46 ar an turn."
      ],
      [
        "Cé chomh minic a bhuann aonta póca ar ríthe?",
        "Thart ar cheithre huaire as cúig: {aakk} nuair a dhéileáiltear na cúig chárta phobail ar fad, agus buann na ríthe {kkaa}."
      ],
      [
        "An caitheamh boinn é aon-rí in aghaidh péire?",
        "Beagnach, in aghaidh péire láir: buann banríonacha {qqak} in aghaidh aon-rí. In aghaidh péire bhig is gaire fós é — buann 22 {22ak}."
      ],
      [
        "Cad is dóchúlachtaí an phota ann?",
        "Praghas glao i gcomparáid leis an bpota is féidir leat a bhuachan. Má tá do sheans buaite níos airde ná an sciar den phota deiridh a chuireann tú féin isteach, íocann glaoch as féin le himeacht ama."
      ],
      [
        "An dtaispeánann PokerTH mo sheansanna le linn cluiche?",
        "Taispeánann. Ainmníonn an cluaisín Seans do lámh is fearr reatha agus do sheans buaite de réir mar a nochtar na cártaí, ionas gur féidir leat do réasúnaíocht féin a sheiceáil ag an mbord."
      ]
    ]
  },
  gd: {
    "title": "Cothroman pòcair — outs, cothroman a’ phota, còmhstri | PokerTH",
    "desc": "Cothroman Texas Hold’em gu mionaideach: outs is do chothrom orra, riaghailt 2 is 4, cothroman a’ phota, is dè cho tric ’s a bhuannaicheas AA air KK no QQ air AK.",
    "ldHeadline": "Cothroman pòcair: outs, cothroman a’ phota agus còmhstri ron fhlop",
    "ldDesc": "Cothroman Texas Hold’em air an cunntadh gu mionaideach: outs, riaghailt 2 is 4, cothroman a’ phota agus còmhstri ron fhlop.",
    "h1": "Cothroman pòcair: outs, cothroman a’ phota agus còmhstri ron fhlop",
    "lead": "Tha co-dhùnaidhean math pòcair an urra ri beagan àireamhan: dè cho coltach ’s a tha e gun tig piseach air do làimh, na dh’fheumas tu pàigheadh airson faighinn a-mach, agus mar a sheasas dà làimh an aghaidh a chèile ron fhlop. Chaidh gach àireamh air an duilleag seo a chunntadh gu mionaideach, cha deach a lethbhreacadh à clàr.",
    "calc": {
      "h2": "Àireamhair chothroman pòcair",
      "intro": "Tagh an dà chairt agad agus, ma thogras tu, am bòrd agus làmh neach-dùbhlain. Riaraichidh an t-àireamhair gach cairt a tha air fhàgail — gu mionaideach nuair a ghabhas e, le samhlachadh air dhòigh eile — agus seallaidh e dè cho tric ’s a bhuannaicheas tu.",
      "you": "Do làmh",
      "board": "Am bòrd",
      "opp": "Neach-dùbhlain (roghainneil)",
      "players": "Luchd-dùbhlain",
      "pick": "Thoir gnogag air cairt gus a cur san t-slot a tha soilleir; thoir gnogag air slot gus fhalamhachadh.",
      "clear": "Falamhaich",
      "win": "Buannachd",
      "tie": "Co-ionann",
      "lose": "Air chall",
      "exact": "Mionaideach: gach aon dhe na {n} riarachaidhean a ghabhas dèanamh.",
      "sim": "Samhlachadh de {n} riarachaidhean air thuaiream.",
      "working": "Ga obrachadh…",
      "need": "Tagh an dà chairt agad gus na cothroman agad fhaicinn.",
      "boardHint": "Gabhaidh am bòrd trì cairtean (am flop), an uairsin ceithir, an uairsin còig.",
      "oppHint": "Tagh an dà chairt aig an neach-dùbhlain, no gin dhiubh.",
      "final": "Do làmh mu dheireadh",
      "noscript": "Feumaidh an t-àireamhair JavaScript. Obraichidh na clàran gu h-ìosal às aonais."
    },
    "outsH2": "Outs: do chothrom an glacadh",
    "outsP": "’S e out cairt a tha fhathast sa phaca agus a dhèanadh an làmh agad dhen fhear as coltaiche a bhuannachadh. Air an fhlop, tha 47 cairtean ann nach fhaca tu: le 9 outs, thig cairt fheumail air an turn {f9turn} dhen ùine, agus ron river — le dà chairt ri thighinn — {f9river}.",
    "outsCols": [
      "Tarraing",
      "Outs",
      "Turn",
      "River (on turn)",
      "Turn no river (on fhlop)"
    ],
    "draws": {
      "gutshot": "Tarraing sreatha a-staigh (gutshot)",
      "twoPairFull": "Dà phaidhir gu taigh làn",
      "pairTrips": "Aon phaidhir gu dà phaidhir no trì co-ionann",
      "twoOver": "Dà chairt nas àirde na am bòrd gu paidhir",
      "setFull": "Set gu taigh làn no ceithir co-ionann",
      "oesd": "Tarraing sreatha fosgailte aig gach ceann",
      "flush": "Tarraing gu flush",
      "flushGut": "Tarraing gu flush agus gutshot",
      "flushOesd": "Tarraing gu flush agus tarraing sreatha fosgailte"
    },
    "outsNote": "Seo na cothroman gun glac thu aon dhe na outs agad. Chan eil cothroman runner-runner a bharrachd annta, agus out a bheir làmh nas fheàrr do neach-dùbhlain cuideachd, chan e fìor out a th’ ann.",
    "ruleH2": "Riaghailt 2 is 4",
    "ruleP": "Tuairmse luath aig a’ bhòrd: iomadaich na outs agad le 4 air an fhlop nuair a chì thu an turn agus an river le chèile, agus le 2 nuair nach eil ach aon chairt ri thighinn. ’S e 9 × 4 = 36% a th’ ann an tarraing gu flush air an fhlop, an aghaidh {f9river} gu mionaideach. Bidh an riaghailt a’ dèanamh cus de tharraingean mòra: bheir 15 outs 60%, ach ’s e {f15river} an fhìor àireamh.",
    "potH2": "Cothroman a’ phota: an dèan thu Call?",
    "potP": "Bidh cothroman a’ phota a’ coimeas na dh’fheumas tu pàigheadh ris na dh’fhaodas tu a bhuannachadh. Tha 100 sa phota agus cuiridh an neach-dùbhlain 50 mar gheall: pàighidh tu 50 gus pota de 200 a bhuannachadh, mar sin feumaidh an Call buannachadh barrachd air 50 ÷ 200 = 25% dhen ùine gus a bhith luachmhor. Le tarraing gu flush agus aon chairt ri thighinn, glacaidh tu i {f9one} dhen ùine, mar sin ma nì thu Call air geall nuair nach eil ach an river air fhàgail, caillidh tu sliseagan san fhad-ùine. All-in air an fhlop, le dà chairt ri thighinn, glacaidh an aon tarraing {f9river}, agus is fhiach an Call.",
    "matchH2": "Còmhstri ron fhlop",
    "matchP": "Mar a nì dà làimh tòiseachaidh an aghaidh a chèile nuair a thèid na còig cairtean bùird uile a riarachadh, air an cunntadh thar gach aon dhe na {boards} bùird a ghabhas a bhith ann. Tha na dathan cudromach beagan: chan eil dath an cumantas aig na làmhan gu h-ìosal mura h-eil iad air an sealltainn dhen aon dath.",
    "matchCols": [
      "Làmh",
      "An aghaidh",
      "Buannaichidh",
      "Co-ionann",
      "Caillidh"
    ],
    "startH2": "Cothroman nan làmhan tòiseachaidh",
    "startP": "Tha {combos} làmhan tòiseachaidh eadar-dhealaichte de dhà chairt ann. Dè cho tric ’s a gheibh thu:",
    "startCols": [
      "Làmh",
      "Cothrom",
      "Mu aon làmh à"
    ],
    "starting": {
      "specificPair": "Paidhir shònraichte nad làimh, mar àsaichean",
      "anyPair": "Paidhir sam bith nad làimh",
      "specificNonPair": "Làmh shònraichte gun phaidhir, mar às is rìgh",
      "specificSuited": "Làmh shònraichte dhen aon dath, mar às is rìgh dhen aon dath",
      "anySuited": "Dà chairt sam bith dhen aon dath",
      "twoBroadway": "Dà chairt de dheich no nas àirde"
    },
    "faqH2": "Ceistean",
    "faq": [
      [
        "Dè th’ ann an outs ann am pòcair?",
        "Na cairtean a tha air fhàgail sa phaca a bheireadh dhut an làmh as fheàrr. Na cunnt ach na cairtean nach fhaca tu: 47 air an fhlop, 46 air an turn."
      ],
      [
        "Dè cho tric ’s a bhuannaicheas paidhir àsaichean an aghaidh paidhir rìghrean?",
        "Mu cheithir tursan às gach còig: {aakk} nuair a thèid na còig cairtean bùird uile a riarachadh, agus buannaichidh na rìghrean {kkaa}."
      ],
      [
        "A bheil às is rìgh an aghaidh paidhir coltach ri tilgeil bonn?",
        "Cha mhòr, an aghaidh paidhir mheadhanach: buannaichidh paidhir bhanrighrean {qqak} an aghaidh àis is rìgh. An aghaidh paidhir bheag tha e nas dlùithe buileach — buannaichidh paidhir dhithisean {22ak}."
      ],
      [
        "Dè th’ ann an cothroman a’ phota?",
        "Prìs Call an coimeas ris a’ phota as urrainn dhut a bhuannachadh. Ma tha do chothrom buannachadh nas àirde na a’ chuibhreann dhen phota mu dheireadh a chuir thu a-steach, bheir Call buannachd dhut thar ùine."
      ],
      [
        "An seall PokerTH na cothroman agam rè geama?",
        "Seallaidh. Ainmichidh an taba Cothroman an làmh as fheàrr a th’ agad an-dràsta agus do chothrom buannachadh fhad ’s a thig na cairtean a-mach, gus an urrainn dhut do reusanachadh fhèin a dhearbhadh aig a’ bhòrd."
      ]
    ]
  },
  gl: {
    "title": "Probabilidades no póker — outs, pot odds e duelos | PokerTH",
    "desc": "Probabilidades do Texas Hold’em calculadas con exactitude: outs e a probabilidade de ligalos, a regra do 2 e do 4, pot odds e cantas veces AA gaña a KK ou QQ a AK.",
    "ldHeadline": "Probabilidades no póker: outs, probabilidades do bote e duelos antes do flop",
    "ldDesc": "Probabilidades do Texas Hold’em calculadas con exactitude: outs, a regra do 2 e do 4, probabilidades do bote e duelos antes do flop.",
    "h1": "Probabilidades no póker: outs, probabilidades do bote e duelos antes do flop",
    "lead": "As boas decisións no póker redúcense a uns poucos números: que probabilidade ten a túa man de mellorar, canto tes que pagar para sabelo e como se comparan dúas mans antes do flop. Cada cifra desta páxina está calculada con exactitude, non copiada dunha táboa.",
    "calc": {
      "h2": "Calculadora de probabilidades de póker",
      "intro": "Escolle as túas dúas cartas e, se queres, a mesa e a man dun rival. A calculadora reparte todas as cartas que quedan — con exactitude sempre que pode, por simulación se non — e amosa cantas veces gañas.",
      "you": "A túa man",
      "board": "Mesa",
      "opp": "Rival (opcional)",
      "players": "Rivais",
      "pick": "Toca unha carta para poñela no oco resaltado; toca un oco para baleiralo.",
      "clear": "Limpar",
      "win": "Vitoria",
      "tie": "Empate",
      "lose": "Derrota",
      "exact": "Exacto: cada unha das {n} reparticións posibles.",
      "sim": "Simulación de {n} reparticións aleatorias.",
      "working": "Calculando…",
      "need": "Escolle as túas dúas cartas para ver as túas probabilidades.",
      "boardHint": "A mesa leva tres cartas (o flop), despois catro, despois cinco.",
      "oppHint": "Escolle as dúas cartas do rival, ou ningunha.",
      "final": "A túa man final",
      "noscript": "A calculadora precisa JavaScript. As táboas de abaixo funcionan sen el."
    },
    "outsH2": "Outs: a túa probabilidade de ligar",
    "outsP": "Un out é unha carta que segue na baralla e que converte a túa man na probable gañadora. No flop hai 47 cartas sen ver: con 9 outs, unha carta liga no turn o {f9turn} das veces e, ata o river — con dúas cartas por saír —, o {f9river}.",
    "outsCols": [
      "Proxecto",
      "Outs",
      "Turn",
      "River (desde o turn)",
      "Turn ou river (desde o flop)"
    ],
    "draws": {
      "gutshot": "Proxecto de escaleira interior (gutshot)",
      "twoPairFull": "Dobre parella a full",
      "pairTrips": "Parella a dobre parella ou trío",
      "twoOver": "Dúas cartas altas (overcards) a parella",
      "setFull": "Trío agochado (set) a full ou póker",
      "oesd": "Proxecto de escaleira aberta",
      "flush": "Proxecto de cor",
      "flushGut": "Proxecto de cor e gutshot",
      "flushOesd": "Proxecto de cor e de escaleira aberta"
    },
    "outsNote": "Estas son as probabilidades de ligar un dos teus outs. Non contan os extras de dúas cartas seguidas (runner-runner), e un out que tamén lle dá a un rival unha man mellor non é realmente un out.",
    "ruleH2": "A regra do 2 e do 4",
    "ruleP": "Unha estimación rápida na mesa: multiplica os teus outs por 4 no flop cando vas ver o turn e o river, e por 2 cando só queda unha carta. Un proxecto de cor no flop dá 9 × 4 = 36 %, fronte ao {f9river} exacto. A regra sobreestima os proxectos grandes: 15 outs dan 60 %, e a cifra real é {f15river}.",
    "potH2": "Probabilidades do bote: paga a pena igualar?",
    "potP": "As probabilidades do bote (pot odds) comparan o que tes que pagar co que podes gañar. O bote ten 100 e o teu rival aposta 50: igualas 50 para gañar un bote de 200, así que, para compensar, igualar ten que gañar máis do 50 ÷ 200 = 25 % das veces. Cun proxecto de cor e unha carta por saír ligas o {f9one} das veces, así que igualar unha aposta cando só queda o river perde fichas a longo prazo. All-in no flop, coas dúas cartas por saír, o mesmo proxecto liga o {f9river}, e paga a pena igualar.",
    "matchH2": "Duelos antes do flop",
    "matchP": "Como lles vai a dúas mans iniciais unha contra a outra cando saen as cinco cartas da mesa, contado sobre cada unha das {boards} mesas posibles. Os paus importan un pouco: as mans de abaixo non comparten pau salvo que se amosen do mesmo pau.",
    "matchCols": [
      "Man",
      "Contra",
      "Gaña",
      "Empate",
      "Perde"
    ],
    "startH2": "Probabilidades das mans iniciais",
    "startP": "Hai {combos} mans iniciais diferentes de dúas cartas. Con que frecuencia che toca:",
    "startCols": [
      "Man",
      "Probabilidade",
      "Arredor dunha man de cada"
    ],
    "starting": {
      "specificPair": "Unha parella servida concreta, como ases",
      "anyPair": "Calquera parella servida",
      "specificNonPair": "Unha man sen parella concreta, como ás-rei",
      "specificSuited": "Unha man do mesmo pau concreta, como ás-rei do mesmo pau",
      "anySuited": "Calquera dúas cartas do mesmo pau",
      "twoBroadway": "Dúas cartas de dez para arriba"
    },
    "faqH2": "Preguntas",
    "faq": [
      [
        "Que son os outs no póker?",
        "As cartas que quedan na baralla e que che darían a mellor man. Conta só as cartas que non viches: 47 no flop, 46 no turn."
      ],
      [
        "Cantas veces gañan os ases servidos aos reis?",
        "Arredor de catro de cada cinco: o {aakk} cando saen as cinco cartas da mesa, e os reis gañan o {kkaa}."
      ],
      [
        "Ás-rei contra unha parella é cara ou cruz?",
        "Case, contra unha parella media: as damas gañan o {qqak} contra ás-rei. Contra unha parella pequena está aínda máis igualado — os douses gañan o {22ak}."
      ],
      [
        "Que son as probabilidades do bote?",
        "O prezo de igualar comparado co bote que podes gañar. Se a túa probabilidade de gañar é maior ca parte do bote final que poñes ti, igualar compensa co tempo."
      ],
      [
        "Amosa PokerTH as miñas probabilidades durante a partida?",
        "Si. A lapela Posibilidades nomea a túa mellor xogada do momento e a túa probabilidade de gañar a medida que saen as cartas, para que poidas comprobar o teu propio razoamento na mesa."
      ]
    ]
  },
  gu: {
    "title": "પોકર ઓડ્સ ચાર્ટ — આઉટ્સ, પોટ ઓડ્સ, હેન્ડ મુકાબલા | PokerTH",
    "desc": "Texas Hold’em ના ઓડ્સ ચોક્કસ ગણતરીથી: આઉટ્સ અને તે આવવાની શક્યતા, 2 અને 4 નો નિયમ, પોટ ઓડ્સ, અને AA કેટલી વાર KK ને કે QQ કેટલી વાર AK ને હરાવે છે.",
    "ldHeadline": "પોકર ઓડ્સ: આઉટ્સ, પોટ ઓડ્સ અને પ્રી-ફ્લોપ મુકાબલા",
    "ldDesc": "Texas Hold’em ના ઓડ્સ ચોક્કસ ગણતરીથી: આઉટ્સ, 2 અને 4 નો નિયમ, પોટ ઓડ્સ અને પ્રી-ફ્લોપ મુકાબલા.",
    "h1": "પોકર ઓડ્સ: આઉટ્સ, પોટ ઓડ્સ અને પ્રી-ફ્લોપ મુકાબલા",
    "lead": "પોકરના સારા નિર્ણયો થોડા આંકડા પર આધાર રાખે છે: તમારો હેન્ડ સુધરવાની કેટલી શક્યતા છે, તે જાણવા તમારે કેટલું ચૂકવવું પડશે, અને ફ્લોપ પહેલાં બે હેન્ડ એકબીજા સામે ક્યાં ઊભા છે. આ પાનાનો દરેક આંકડો ચોક્કસ ગણવામાં આવ્યો છે, કોઈ ચાર્ટમાંથી નકલ કરેલો નથી.",
    "calc": {
      "h2": "પોકર ઓડ્સ કેલ્ક્યુલેટર",
      "intro": "તમારાં બે કાર્ડ્સ પસંદ કરો અને, ઇચ્છો તો, બોર્ડ અને પ્રતિસ્પર્ધીનો હેન્ડ પણ. કેલ્ક્યુલેટર બાકીનું દરેક કાર્ડ વહેંચી જુએ છે — શક્ય હોય ત્યારે ચોક્કસ, નહીં તો સિમ્યુલેશનથી — અને બતાવે છે કે તમે કેટલી વાર જીતો છો.",
      "you": "તમારો હેન્ડ",
      "board": "બોર્ડ",
      "opp": "પ્રતિસ્પર્ધી (વૈકલ્પિક)",
      "players": "પ્રતિસ્પર્ધીઓ",
      "pick": "કાર્ડ પર ટૅપ કરીને તેને હાઇલાઇટ કરેલા ખાનામાં મૂકો; ખાનું ખાલી કરવા તેના પર ટૅપ કરો.",
      "clear": "સાફ કરો",
      "win": "જીત",
      "tie": "બરાબરી",
      "lose": "હાર",
      "exact": "ચોક્કસ: શક્ય એવી બધી {n} વહેંચણી.",
      "sim": "{n} રેન્ડમ વહેંચણીનું સિમ્યુલેશન.",
      "working": "ગણતરી ચાલુ છે…",
      "need": "તમારા ઓડ્સ જોવા તમારાં બે કાર્ડ્સ પસંદ કરો.",
      "boardHint": "બોર્ડમાં ત્રણ કાર્ડ્સ (ફ્લોપ), પછી ચાર, પછી પાંચ આવે છે.",
      "oppHint": "પ્રતિસ્પર્ધીનાં બંને કાર્ડ્સ પસંદ કરો, અથવા એક પણ નહીં.",
      "final": "તમારો અંતિમ હેન્ડ",
      "noscript": "કેલ્ક્યુલેટરને JavaScript ની જરૂર છે. નીચેનાં કોષ્ટકો તેના વગર પણ ચાલે છે."
    },
    "outsH2": "આઉટ્સ: કાર્ડ આવવાની તમારી શક્યતા",
    "outsP": "આઉટ એટલે ડેકમાં હજી રહેલું એવું કાર્ડ જે તમારા હેન્ડને સંભવિત વિજેતા બનાવે. ફ્લોપ પર 47 કાર્ડ્સ અદીઠ હોય છે: 9 આઉટ્સ સાથે, ટર્ન પર એક કાર્ડ {f9turn} વખત આવે છે, અને રિવર સુધીમાં — બે કાર્ડ્સ આવવાનાં બાકી હોય ત્યારે — {f9river}.",
    "outsCols": [
      "ડ્રો",
      "આઉટ્સ",
      "ટર્ન",
      "રિવર (ટર્નથી)",
      "ટર્ન કે રિવર (ફ્લોપથી)"
    ],
    "draws": {
      "gutshot": "અંદરનો સ્ટ્રેટ ડ્રો (ગટશોટ)",
      "twoPairFull": "Two Pair → Full House",
      "pairTrips": "One Pair → Two Pair કે Three of a Kind",
      "twoOver": "બે ઓવરકાર્ડ્સ → One Pair",
      "setFull": "સેટ → Full House કે Four of a Kind",
      "oesd": "બંને છેડે ખુલ્લો સ્ટ્રેટ ડ્રો",
      "flush": "ફ્લશ ડ્રો",
      "flushGut": "ફ્લશ ડ્રો અને ગટશોટ",
      "flushOesd": "ફ્લશ ડ્રો અને બંને છેડે ખુલ્લો સ્ટ્રેટ ડ્રો"
    },
    "outsNote": "આ તમારા કોઈ એક આઉટ આવવાની શક્યતાઓ છે. તેમાં રનર-રનર (સળંગ બે કાર્ડ્સ) થી મળતા વધારાના હેન્ડ્સ ગણ્યા નથી, અને જે આઉટ પ્રતિસ્પર્ધીને પણ વધુ સારો હેન્ડ આપે તે ખરેખર આઉટ નથી.",
    "ruleH2": "2 અને 4 નો નિયમ",
    "ruleP": "ટેબલ પર ઝડપી અંદાજ: ફ્લોપ પર, જ્યારે તમે ટર્ન અને રિવર બંને જોવાના હો, ત્યારે આઉટ્સને 4 વડે ગુણો, અને ફક્ત એક કાર્ડ આવવાનું બાકી હોય ત્યારે 2 વડે. ફ્લોપ પર ફ્લશ ડ્રો 9 × 4 = 36% થાય, જ્યારે ચોક્કસ આંકડો {f9river} છે. આ નિયમ મોટા ડ્રોને વધારે આંકે છે: 15 આઉટ્સથી 60% આવે, પણ સાચો આંકડો {f15river} છે.",
    "potH2": "પોટ ઓડ્સ: Call કરવું કે નહીં?",
    "potP": "પોટ ઓડ્સ તમારે જે ચૂકવવું પડે તેની સરખામણી તમે જે જીતી શકો તેની સાથે કરે છે. પોટમાં 100 છે અને પ્રતિસ્પર્ધી 50 ની બેટ લગાવે છે: તમે 200 નો પોટ જીતવા 50 Call કરો છો, તેથી ફાયદો થાય તે માટે Call એ 50 ÷ 200 = 25% કરતાં વધુ વાર જીતવું જોઈએ. ફ્લશ ડ્રો સાથે એક કાર્ડ આવવાનું બાકી હોય ત્યારે કાર્ડ {f9one} વખત આવે છે, તેથી ફક્ત રિવર બાકી હોય ત્યારે બેટ Call કરવાથી લાંબા ગાળે ચિપ્સ ગુમાવાય છે. ફ્લોપ પર All-In હોય અને બંને કાર્ડ્સ આવવાનાં બાકી હોય, ત્યારે એ જ ડ્રો {f9river} આવે છે, અને Call કરવું લાભદાયી છે.",
    "matchH2": "પ્રી-ફ્લોપ મુકાબલા",
    "matchP": "બોર્ડનાં પાંચેય કાર્ડ્સ વહેંચાય ત્યારે બે શરૂઆતના હેન્ડ્સ એકબીજા સામે કેવું કરે છે, શક્ય એવાં બધાં {boards} બોર્ડ પર ગણીને. સૂટનો થોડો ફરક પડે છે: નીચેના હેન્ડ્સમાં કોઈ સૂટ સરખો નથી, સિવાય કે સૂટેડ બતાવ્યા હોય.",
    "matchCols": [
      "હેન્ડ",
      "સામે",
      "જીતે",
      "બરાબરી",
      "હારે"
    ],
    "startH2": "શરૂઆતના હેન્ડ્સના ઓડ્સ",
    "startP": "બે કાર્ડ્સના {combos} જુદા જુદા શરૂઆતના હેન્ડ્સ હોય છે. તમને કેટલી વાર મળે છે:",
    "startCols": [
      "હેન્ડ",
      "શક્યતા",
      "આશરે આટલા હેન્ડ્સમાં એક વાર"
    ],
    "starting": {
      "specificPair": "કોઈ ચોક્કસ પોકેટ જોડી, જેમ કે એક્કા",
      "anyPair": "કોઈ પણ પોકેટ જોડી",
      "specificNonPair": "કોઈ ચોક્કસ જોડી વગરનો હેન્ડ, જેમ કે એક્કો-બાદશાહ",
      "specificSuited": "કોઈ ચોક્કસ સૂટેડ હેન્ડ, જેમ કે સૂટેડ એક્કો-બાદશાહ",
      "anySuited": "એક જ સૂટનાં કોઈ પણ બે કાર્ડ્સ",
      "twoBroadway": "દસ કે તેથી ઉપરનાં બે કાર્ડ્સ"
    },
    "faqH2": "પ્રશ્નો",
    "faq": [
      [
        "પોકરમાં આઉટ્સ એટલે શું?",
        "ડેકમાં બાકી રહેલાં એવાં કાર્ડ્સ જે તમને શ્રેષ્ઠ હેન્ડ આપે. ફક્ત તમે ન જોયેલાં કાર્ડ્સ જ ગણો: ફ્લોપ પર 47, ટર્ન પર 46."
      ],
      [
        "પોકેટ એક્કા બાદશાહોને કેટલી વાર હરાવે છે?",
        "પાંચમાંથી આશરે ચાર વાર: બોર્ડનાં પાંચેય કાર્ડ્સ વહેંચાય ત્યારે {aakk}, અને બાદશાહો {kkaa} જીતે છે."
      ],
      [
        "શું જોડી સામે એક્કો-બાદશાહ સિક્કો ઉછાળવા જેવું છે?",
        "મધ્યમ જોડી સામે લગભગ હા: રાણીની જોડી એક્કો-બાદશાહ સામે {qqak} જીતે છે. નાની જોડી સામે તો એથી પણ નજીકની ટક્કર છે — દૂરીની જોડી {22ak} જીતે છે."
      ],
      [
        "પોટ ઓડ્સ એટલે શું?",
        "તમે જીતી શકો તે પોટની સરખામણીમાં Call ની કિંમત. જો તમારી જીતવાની શક્યતા અંતિમ પોટમાં તમે નાખેલા હિસ્સા કરતાં વધુ હોય, તો સમય જતાં Call કરવું ફાયદાકારક બને છે."
      ],
      [
        "શું PokerTH રમત દરમિયાન મારા ઓડ્સ બતાવે છે?",
        "હા. «ઓડ્સ» ટૅબ તમારો હાલનો શ્રેષ્ઠ હેન્ડ અને કાર્ડ્સ ખૂલતાં જાય તેમ તમારી જીતવાની શક્યતા બતાવે છે, જેથી તમે ટેબલ પર જ તમારા તર્કને ચકાસી શકો."
      ]
    ]
  },
  ha: {
    "title": "Yiwuwar poker — outs, yiwuwar pot, karawar hannaye | PokerTH",
    "desc": "Yiwuwar Texas Hold’em da aka lissafa daidai: outs da damarka ta samun su, ka'idar 2 da 4, yiwuwar pot, da sau nawa AA ke doke KK ko QQ ke doke AK.",
    "ldHeadline": "Yiwuwar poker: outs, yiwuwar pot da karawar preflop",
    "ldDesc": "Yiwuwar Texas Hold’em da aka lissafa daidai: outs, ka'idar 2 da 4, yiwuwar pot da karawar preflop.",
    "h1": "Yiwuwar poker: outs, yiwuwar pot da karawar preflop",
    "lead": "Kyawawan shawarwari a poker suna komawa kan wasu ƙididdiga kaɗan: yaya yiwuwar hannunka ya inganta, nawa za ka biya don ka gano, da yadda hannaye biyu suke a gaban juna kafin flop. Kowane adadi a wannan shafin an lissafa shi daidai, ba a kwafo shi daga taswira ba.",
    "calc": {
      "h2": "Na'urar lissafin yiwuwar poker",
      "intro": "Zaɓi katunanka biyu kuma, idan kana so, board da hannun abokin hamayya. Na'urar lissafin tana raba duk katunan da suka rage — daidai a duk lokacin da za ta iya, ta hanyar kwaikwayo in ba haka ba — kuma tana nuna sau nawa kake cin nasara.",
      "you": "Hannunka",
      "board": "Board",
      "opp": "Abokin hamayya (na zaɓi)",
      "players": "Abokan hamayya",
      "pick": "Taɓa kati don saka shi a gurbin da aka haskaka; taɓa gurbi don share shi.",
      "clear": "Share",
      "win": "Nasara",
      "tie": "Kunnen doki",
      "lose": "Rashin nasara",
      "exact": "Daidai: duk rabe-rabe {n} da za su yiwu.",
      "sim": "Kwaikwayon rabe-rabe {n} na bazuwar.",
      "working": "Ana lissafawa…",
      "need": "Zaɓi katunanka biyu don ganin damarka.",
      "boardHint": "Board yana ɗaukar katuna uku (flop), sannan huɗu, sannan biyar.",
      "oppHint": "Zaɓi katunan abokin hamayyarka duka biyu, ko kada ka zaɓi ko ɗaya.",
      "final": "Hannunka na ƙarshe",
      "noscript": "Na'urar lissafin tana buƙatar JavaScript. Teburan da ke ƙasa suna aiki ba tare da shi ba."
    },
    "outsH2": "Outs: damarka ta samu",
    "outsP": "Out kati ne da har yanzu yake cikin katuna wanda zai mai da hannunka mai yiwuwar cin nasara. A flop, katuna 47 ba a gani ba: da outs 9, kati ɗaya yana fitowa a turn a {f9turn} na lokuta, kuma zuwa river — da katuna biyu masu zuwa — a {f9river}.",
    "outsCols": [
      "Draw",
      "Outs",
      "Turn",
      "River (daga turn)",
      "Turn ko river (daga flop)"
    ],
    "draws": {
      "gutshot": "Draw na Straight na ciki (gutshot)",
      "twoPairFull": "Daga Two Pair zuwa Full House",
      "pairTrips": "Daga One Pair zuwa Two Pair ko Three of a Kind",
      "twoOver": "Overcards biyu zuwa pair",
      "setFull": "Daga set zuwa Full House ko Four of a Kind",
      "oesd": "Draw na Straight a buɗe ɓangarori biyu",
      "flush": "Draw na Flush",
      "flushGut": "Draw na Flush da gutshot",
      "flushOesd": "Draw na Flush da draw na Straight a buɗe"
    },
    "outsNote": "Waɗannan su ne damar kama ɗaya daga cikin outs ɗinka. Ba su haɗa da ƙarin runner-runner (backdoor) ba, kuma out da shi ma ke ba abokin hamayya hannu mafi kyau ba out ba ne da gaske.",
    "ruleH2": "Ka'idar 2 da 4",
    "ruleP": "Ƙiyasi mai sauri a tebur: ninka outs ɗinka da 4 a flop idan za ka ga turn da river duka, da kuma 2 idan kati ɗaya ne kawai ya rage. Draw na Flush a flop shi ne 9 × 4 = 36%, idan aka kwatanta da {f9river} daidai. Ka'idar tana ƙara wa manyan draws: outs 15 suna ba da 60%, ainihin adadin shi ne {f15river}.",
    "potH2": "Yiwuwar pot: shin ya kamata ka yi call?",
    "potP": "Yiwuwar pot tana kwatanta abin da dole ka biya da abin da za ka iya ci. Pot yana da 100 kuma abokin hamayyarka ya ci caca 50: kana yin call na 50 don cin pot na 200, don haka call ɗin yana buƙatar cin nasara fiye da 50 ÷ 200 = 25% na lokuta don ya biya. Da draw na Flush da kati ɗaya mai zuwa kana samu a {f9one} na lokuta, don haka yin call ga caca lokacin da river kaɗai ya rage yana asarar chips a dogon lokaci. Idan an yi All-In a flop, da katuna biyu masu zuwa, draw ɗin nan yana samuwa a {f9river}, kuma call ɗin ya cancanta.",
    "matchH2": "Karawar preflop",
    "matchP": "Yadda hannayen farko biyu suke a gaban juna idan aka raba duk katunan board biyar, an ƙirga a kan kowane ɗaya daga cikin boards {boards} da za su yiwu. Launuka suna da ɗan muhimmanci: hannayen da ke ƙasa ba su raba launi ba sai dai idan an nuna su a launi ɗaya.",
    "matchCols": [
      "Hannu",
      "A gaban",
      "Nasara",
      "Kunnen doki",
      "Rashin nasara"
    ],
    "startH2": "Yiwuwar hannayen farko",
    "startP": "Akwai hannayen farko na katuna biyu daban-daban {combos}. Sau nawa ake raba maka:",
    "startCols": [
      "Hannu",
      "Dama",
      "Kusan hannu ɗaya cikin"
    ],
    "starting": {
      "specificPair": "Takamaiman pair na aljihu, kamar aces",
      "anyPair": "Kowane pair na aljihu",
      "specificNonPair": "Takamaiman hannu da ba pair ba, kamar ace-king",
      "specificSuited": "Takamaiman hannu mai launi ɗaya, kamar ace-king mai launi ɗaya",
      "anySuited": "Kowane katuna biyu masu launi ɗaya",
      "twoBroadway": "Katuna biyu daga goma zuwa sama"
    },
    "faqH2": "Tambayoyi",
    "faq": [
      [
        "Mene ne outs a poker?",
        "Katunan da suka rage a cikin katuna da za su ba ka hannu mafi kyau. Ka ƙirga katunan da ba ka gani ba kawai: 47 a flop, 46 a turn."
      ],
      [
        "Sau nawa pocket aces ke doke kings?",
        "Kusan sau huɗu cikin biyar: {aakk} idan aka raba duk katunan board biyar, kings kuma suna cin {kkaa}."
      ],
      [
        "Shin ace-king a gaban pair kamar jefa tsabar kuɗi ne?",
        "Kusan haka, a gaban pair na tsakiya: queens suna cin {qqak} a gaban ace-king. A gaban ƙaramin pair ya fi kusanci — twos suna cin {22ak}."
      ],
      [
        "Mene ne yiwuwar pot?",
        "Farashin call idan aka kwatanta da pot da za ka iya ci. Idan damarka ta cin nasara ta fi rabon pot na ƙarshe da kai ka saka, yin call yana biya a tsawon lokaci."
      ],
      [
        "Shin PokerTH yana nuna damata yayin wasa?",
        "Ee. Shafin Dama yana ambaton hannunka mafi kyau na yanzu da damarka ta cin nasara yayin da katuna ke fitowa, don ka iya duba tunaninka a tebur."
      ]
    ]
  },
  he: {
    "title": "סיכויים בפוקר — אאוטים, יחסי קופה, ידיים ראש בראש | PokerTH",
    "desc": "סיכויי Texas Hold’em מחושבים במדויק: אאוטים והסיכוי שלכם לפגוע בהם, כלל ה־2 וה־4, יחסי קופה, וכמה פעמים AA מנצחת את KK או QQ את AK.",
    "ldHeadline": "סיכויים בפוקר: אאוטים, יחסי קופה וידיים ראש בראש לפני הפלופ",
    "ldDesc": "סיכויי Texas Hold’em מחושבים במדויק: אאוטים, כלל ה־2 וה־4, יחסי קופה וידיים ראש בראש לפני הפלופ.",
    "h1": "סיכויים בפוקר: אאוטים, יחסי קופה וידיים ראש בראש לפני הפלופ",
    "lead": "החלטות טובות בפוקר מסתכמות בכמה מספרים: עד כמה סביר שהיד שלכם תשתפר, כמה תצטרכו לשלם כדי לגלות זאת, ואיך שתי ידיים עומדות זו מול זו לפני הפלופ. כל מספר בעמוד הזה מחושב במדויק, ולא מועתק מטבלה.",
    "calc": {
      "h2": "מחשבון סיכויים לפוקר",
      "intro": "בחרו את שני הקלפים שלכם, ואם תרצו גם את קלפי השולחן ואת היד של יריב. המחשבון עובר על כל הקלפים שנותרו — במדויק בכל פעם שאפשר, ואחרת בסימולציה — ומראה באיזו תדירות אתם מנצחים.",
      "you": "היד שלכם",
      "board": "קלפי השולחן",
      "opp": "יריב (לא חובה)",
      "players": "יריבים",
      "pick": "הקישו על קלף כדי להניח אותו במשבצת המסומנת; הקישו על משבצת כדי לרוקן אותה.",
      "clear": "ניקוי",
      "win": "ניצחון",
      "tie": "תיקו",
      "lose": "הפסד",
      "exact": "מדויק: כל {n} החלוקות האפשריות.",
      "sim": "סימולציה של {n} חלוקות אקראיות.",
      "working": "מחשב…",
      "need": "בחרו את שני הקלפים שלכם כדי לראות את הסיכויים.",
      "boardHint": "על השולחן נכנסים שלושה קלפים (הפלופ), אחר כך ארבעה ואחר כך חמישה.",
      "oppHint": "בחרו את שני הקלפים של היריב, או אף אחד מהם.",
      "final": "היד הסופית שלכם",
      "noscript": "המחשבון דורש JavaScript. הטבלאות שלמטה עובדות גם בלעדיו."
    },
    "outsH2": "אאוטים: הסיכוי שלכם לפגוע",
    "outsP": "אאוט הוא קלף שעדיין נמצא בחפיסה והופך את היד שלכם למנצחת הסבירה. בפלופ 47 קלפים עוד לא נראו: עם 9 אאוטים, קלף אחד פוגע בטרן ב־{f9turn} מהפעמים, ועד הריבר — כששני קלפים עוד יבואו — ב־{f9river}.",
    "outsCols": [
      "השלמה",
      "אאוטים",
      "טרן",
      "ריבר (מהטרן)",
      "טרן או ריבר (מהפלופ)"
    ],
    "draws": {
      "gutshot": "השלמה לסטרייט פנימי (גאטשוט)",
      "twoPairFull": "שני זוגות לפול האוס",
      "pairTrips": "זוג לשני זוגות או לשלישייה",
      "twoOver": "שני קלפים עליונים (אוברקארדס) לזוג",
      "setFull": "סט לפול האוס או לרביעייה",
      "oesd": "השלמה לסטרייט פתוח משני הצדדים",
      "flush": "השלמה לפלאש",
      "flushGut": "השלמה לפלאש וגאטשוט",
      "flushOesd": "השלמה לפלאש והשלמה לסטרייט פתוח משני הצדדים"
    },
    "outsNote": "אלה הסיכויים לתפוס אחד מהאאוטים שלכם. הם אינם כוללים תוספות של ראנר־ראנר, ואאוט שנותן גם ליריב יד טובה יותר אינו באמת אאוט.",
    "ruleH2": "כלל ה־2 וה־4",
    "ruleP": "הערכה מהירה ליד השולחן: הכפילו את האאוטים ב־4 בפלופ כשתראו גם את הטרן וגם את הריבר, וב־2 כשנותר רק קלף אחד לבוא. השלמה לפלאש בפלופ היא 9 × 4 = 36%, לעומת {f9river} במדויק. הכלל מגזים בהשלמות גדולות: 15 אאוטים נותנים 60%, והמספר האמיתי הוא {f15river}.",
    "potH2": "יחסי קופה: לעשות Call?",
    "potP": "יחסי קופה משווים בין מה שעליכם לשלם לבין מה שתוכלו לזכות בו. בקופה יש 100 והיריב מהמר 50: אתם משלמים 50 כדי לזכות בקופה של 200, ולכן ה־Call צריך לנצח ביותר מ־50 ÷ 200 = 25% מהפעמים כדי להשתלם. עם השלמה לפלאש וקלף אחד שעוד יבוא אתם פוגעים ב־{f9one} מהפעמים, ולכן השוואת הימור כשנותר רק הריבר מפסידה ז׳טונים בטווח הארוך. ב־All-In בפלופ, כששני הקלפים עוד יבואו, אותה השלמה פוגעת ב־{f9river}, וה־Call משתלם.",
    "matchH2": "ידיים ראש בראש לפני הפלופ",
    "matchP": "איך שתי ידיים פותחות מסתדרות זו מול זו כשכל חמשת קלפי השולחן מחולקים, בספירה על פני כל {boards} השולחנות האפשריים. לסדרות יש השפעה קטנה: לידיים שלמטה אין סדרה משותפת, אלא אם הן מוצגות מאותה סדרה.",
    "matchCols": [
      "יד",
      "נגד",
      "מנצחת",
      "תיקו",
      "מפסידה"
    ],
    "startH2": "סיכויי ידיים פותחות",
    "startP": "יש {combos} ידיים פותחות שונות של שני קלפים. באיזו תדירות תקבלו:",
    "startCols": [
      "יד",
      "סיכוי",
      "בערך יד אחת מתוך"
    ],
    "starting": {
      "specificPair": "זוג ביד מסוים, למשל אסים",
      "anyPair": "זוג ביד כלשהו",
      "specificNonPair": "יד מסוימת בלי זוג, למשל אס־מלך",
      "specificSuited": "יד מסוימת מאותה סדרה, למשל אס־מלך מאותה סדרה",
      "anySuited": "שני קלפים כלשהם מאותה סדרה",
      "twoBroadway": "שני קלפים מעשר ומעלה"
    },
    "faqH2": "שאלות",
    "faq": [
      [
        "מה הם אאוטים בפוקר?",
        "הקלפים שנותרו בחפיסה ויעניקו לכם את היד הטובה ביותר. ספרו רק קלפים שלא ראיתם: 47 בפלופ, 46 בטרן."
      ],
      [
        "באיזו תדירות זוג אסים ביד מנצח זוג מלכים?",
        "בערך ארבע פעמים מתוך חמש: {aakk} כשכל חמשת קלפי השולחן מחולקים, והמלכים מנצחים ב־{kkaa}."
      ],
      [
        "האם אס־מלך מול זוג הוא הטלת מטבע?",
        "כמעט, מול זוג בינוני: זוג מלכות מנצח ב־{qqak} מול אס־מלך. מול זוג קטן זה צמוד עוד יותר — זוג שתיים מנצח ב־{22ak}."
      ],
      [
        "מה הם יחסי קופה?",
        "מחיר ה־Call לעומת הקופה שבה תוכלו לזכות. אם הסיכוי שלכם לנצח גבוה מהחלק בקופה הסופית שאתם מכניסים, ה־Call משתלם לאורך זמן."
      ],
      [
        "האם PokerTH מציג את הסיכויים שלי במהלך המשחק?",
        "כן. לשונית סיכויים מציגה את שם היד הטובה ביותר שלכם ברגע נתון ואת סיכויי הניצחון שלכם ככל שהקלפים יוצאים, כך שתוכלו לבדוק את השיקולים שלכם ליד השולחן."
      ]
    ]
  },
  hi: {
    "title": "पोकर ऑड्स चार्ट — आउट्स, पॉट ऑड्स, हाथों के मुकाबले | PokerTH",
    "desc": "Texas Hold’em की संभावनाएँ, सटीक गणना से: आउट्स और उनके आने की संभावना, 2 और 4 का नियम, पॉट ऑड्स, और AA कितनी बार KK को या QQ कितनी बार AK को हराता है।",
    "ldHeadline": "पोकर ऑड्स: आउट्स, पॉट ऑड्स और फ़्लॉप से पहले के मुकाबले",
    "ldDesc": "Texas Hold’em की संभावनाएँ सटीक रूप से गिनी गईं: आउट्स, 2 और 4 का नियम, पॉट ऑड्स और फ़्लॉप से पहले के मुकाबले।",
    "h1": "पोकर ऑड्स: आउट्स, पॉट ऑड्स और फ़्लॉप से पहले के मुकाबले",
    "lead": "पोकर के अच्छे फ़ैसले कुछ अंकों पर टिके होते हैं: आपके हाथ के बेहतर होने की कितनी संभावना है, यह जानने के लिए आपको कितना चुकाना होगा, और फ़्लॉप से पहले दो हाथ एक-दूसरे के मुकाबले कहाँ खड़े हैं। इस पेज का हर आँकड़ा सटीक रूप से गिना गया है, किसी चार्ट से नक़ल नहीं किया गया।",
    "calc": {
      "h2": "पोकर ऑड्स कैलकुलेटर",
      "intro": "अपने दो कार्ड चुनें और, चाहें तो, बोर्ड और किसी विरोधी का हाथ भी। कैलकुलेटर बचे हुए हर कार्ड को बाँटकर देखता है — जहाँ संभव हो सटीक रूप से, वरना सिमुलेशन से — और दिखाता है कि आप कितनी बार जीतते हैं।",
      "you": "आपका हाथ",
      "board": "बोर्ड",
      "opp": "विरोधी (वैकल्पिक)",
      "players": "विरोधी खिलाड़ी",
      "pick": "किसी कार्ड पर टैप करके उसे हाइलाइट किए गए खाने में रखें; किसी खाने पर टैप करके उसे खाली करें।",
      "clear": "साफ़ करें",
      "win": "जीत",
      "tie": "बराबरी",
      "lose": "हार",
      "exact": "सटीक: सभी {n} संभावित बँटवारे।",
      "sim": "{n} बेतरतीब बँटवारों का सिमुलेशन।",
      "working": "गणना हो रही है…",
      "need": "अपनी संभावनाएँ देखने के लिए अपने दो कार्ड चुनें।",
      "boardHint": "बोर्ड में पहले तीन कार्ड आते हैं (फ़्लॉप), फिर चार, फिर पाँच।",
      "oppHint": "विरोधी के दोनों कार्ड चुनें, या एक भी नहीं।",
      "final": "आपका अंतिम हाथ",
      "noscript": "कैलकुलेटर के लिए JavaScript चाहिए। नीचे की तालिकाएँ उसके बिना भी काम करती हैं।"
    },
    "outsH2": "आउट्स: कार्ड लगने की संभावना",
    "outsP": "आउट वह कार्ड है जो अभी गड्डी में है और आपके हाथ को संभावित विजेता बना देता है। फ़्लॉप पर 47 कार्ड अनदेखे होते हैं: 9 आउट्स के साथ, टर्न पर {f9turn} बार एक कार्ड लगता है, और रिवर तक — जब दो कार्ड आने बाकी हों — {f9river} बार।",
    "outsCols": [
      "ड्रॉ",
      "आउट्स",
      "टर्न",
      "रिवर (टर्न से)",
      "टर्न या रिवर (फ़्लॉप से)"
    ],
    "draws": {
      "gutshot": "इनसाइड स्ट्रेट ड्रॉ (गटशॉट)",
      "twoPairFull": "टू पेयर से फ़ुल हाउस",
      "pairTrips": "वन पेयर से टू पेयर या थ्री ऑफ़ अ काइंड",
      "twoOver": "दो ओवरकार्ड से पेयर",
      "setFull": "सेट से फ़ुल हाउस या फ़ोर ऑफ़ अ काइंड",
      "oesd": "ओपन-एंडेड स्ट्रेट ड्रॉ",
      "flush": "फ्लश ड्रॉ",
      "flushGut": "फ्लश ड्रॉ और गटशॉट",
      "flushOesd": "फ्लश ड्रॉ और ओपन-एंडेड स्ट्रेट ड्रॉ"
    },
    "outsNote": "ये आपके किसी एक आउट के आने की संभावनाएँ हैं। इनमें रनर-रनर वाले अतिरिक्त मौक़े शामिल नहीं हैं, और जो आउट विरोधी को भी बेहतर हाथ दे दे, वह असल में आउट नहीं है।",
    "ruleH2": "2 और 4 का नियम",
    "ruleP": "मेज़ पर एक झटपट अनुमान: फ़्लॉप पर जब आप टर्न और रिवर दोनों देखेंगे तो अपने आउट्स को 4 से गुणा करें, और जब सिर्फ़ एक कार्ड आना बाकी हो तो 2 से। फ़्लॉप पर फ्लश ड्रॉ 9 × 4 = 36% होता है, जबकि सटीक आँकड़ा {f9river} है। यह नियम बड़े ड्रॉ को बढ़ाकर आँकता है: 15 आउट्स से 60% आता है, असली आँकड़ा {f15river} है।",
    "potH2": "पॉट ऑड्स: Call करें या नहीं?",
    "potP": "पॉट ऑड्स इसकी तुलना करते हैं कि आपको कितना चुकाना है और आप कितना जीत सकते हैं। पॉट में 100 है और आपका विरोधी 50 का दांव लगाता है: आप 200 का पॉट जीतने के लिए 50 देकर Call करते हैं, इसलिए फ़ायदे के लिए इस Call को 50 ÷ 200 = 25% से ज़्यादा बार जीतना चाहिए। फ्लश ड्रॉ के साथ जब एक कार्ड आना बाकी हो, तो आपका कार्ड {f9one} बार लगता है, इसलिए जब सिर्फ़ रिवर बचा हो तब किसी दांव को Call करना लंबे समय में चिप्स गँवाता है। फ़्लॉप पर All-In हो और दोनों कार्ड आने बाकी हों, तो वही ड्रॉ {f9river} बार लगता है, और Call करना फ़ायदे का सौदा है।",
    "matchH2": "फ़्लॉप से पहले के मुकाबले",
    "matchP": "बोर्ड के पाँचों कार्ड बँट जाने पर दो शुरुआती हाथ एक-दूसरे के ख़िलाफ़ कैसा करते हैं, सभी {boards} संभावित बोर्ड पर गिनकर। सूट का थोड़ा असर होता है: नीचे के हाथों में कोई साझा सूट नहीं है, जब तक उन्हें एक ही सूट का न दिखाया गया हो।",
    "matchCols": [
      "हाथ",
      "किसके ख़िलाफ़",
      "जीत",
      "बराबरी",
      "हार"
    ],
    "startH2": "शुरुआती हाथों की संभावनाएँ",
    "startP": "दो कार्ड वाले {combos} अलग-अलग शुरुआती हाथ होते हैं। आपको कितनी बार मिलता है:",
    "startCols": [
      "हाथ",
      "संभावना",
      "लगभग इतने हाथों में एक"
    ],
    "starting": {
      "specificPair": "हाथ का कोई ख़ास जोड़ा, जैसे दो इक्के",
      "anyPair": "हाथ का कोई भी जोड़ा",
      "specificNonPair": "बिना जोड़े का कोई ख़ास हाथ, जैसे इक्का-बादशाह",
      "specificSuited": "एक ही सूट का कोई ख़ास हाथ, जैसे एक ही सूट का इक्का-बादशाह",
      "anySuited": "एक ही सूट के कोई भी दो कार्ड",
      "twoBroadway": "दस या उससे ऊँचे दो कार्ड"
    },
    "faqH2": "सवाल",
    "faq": [
      [
        "पोकर में आउट्स क्या होते हैं?",
        "गड्डी में बचे वे कार्ड जो आपको सबसे अच्छा हाथ दे दें। सिर्फ़ वे कार्ड गिनें जो आपने नहीं देखे: फ़्लॉप पर 47, टर्न पर 46।"
      ],
      [
        "हाथ में दो इक्के कितनी बार दो बादशाहों को हराते हैं?",
        "लगभग पाँच में से चार बार: बोर्ड के पाँचों कार्ड बँटने पर {aakk}, और बादशाह {kkaa} जीतते हैं।"
      ],
      [
        "क्या जोड़े के ख़िलाफ़ इक्का-बादशाह सिक्का उछालने जैसा है?",
        "लगभग, बीच के जोड़े के ख़िलाफ़: इक्का-बादशाह के ख़िलाफ़ दो बेगमें {qqak} जीतती हैं। छोटे जोड़े के ख़िलाफ़ मुक़ाबला और भी क़रीबी है — दो दुक्के {22ak} जीतते हैं।"
      ],
      [
        "पॉट ऑड्स क्या होते हैं?",
        "Call की क़ीमत, उस पॉट की तुलना में जो आप जीत सकते हैं। अगर आपकी जीत की संभावना अंतिम पॉट में आपके डाले गए हिस्से से ज़्यादा है, तो समय के साथ Call करना फ़ायदेमंद रहता है।"
      ],
      [
        "क्या PokerTH खेल के दौरान मेरी संभावनाएँ दिखाता है?",
        "हाँ। संभावनाएँ टैब कार्ड खुलते-खुलते आपका मौजूदा सबसे अच्छा हाथ और आपकी जीत की संभावना बताता है, ताकि आप मेज़ पर अपनी सोच ख़ुद जाँच सकें।"
      ]
    ]
  },
  hr: {
    "title": "Poker vjerojatnosti — outsi, izgledi pota, dvoboji | PokerTH",
    "desc": "Izgledi u Texas Hold’emu točno izračunati: outsi i šansa da ih pogodite, pravilo 2 i 4, izgledi pota te koliko često AA pobjeđuje KK ili QQ pobjeđuje AK.",
    "ldHeadline": "Poker vjerojatnosti: outsi, izgledi pota i dvoboji prije flopa",
    "ldDesc": "Izgledi u Texas Hold’emu točno izračunati: outsi, pravilo 2 i 4, izgledi pota i dvoboji prije flopa.",
    "h1": "Poker vjerojatnosti: outsi, izgledi pota i dvoboji prije flopa",
    "lead": "Dobre odluke u pokeru svode se na nekoliko brojeva: koliko je vjerojatno da će se vaša ruka poboljšati, koliko morate platiti da biste to saznali i kako dvije ruke stoje jedna protiv druge prije flopa. Svaki broj na ovoj stranici točno je izračunat, a ne prepisan iz tablice.",
    "calc": {
      "h2": "Kalkulator poker vjerojatnosti",
      "intro": "Odaberite svoje dvije karte i, ako želite, stol i ruku protivnika. Kalkulator podijeli sve preostale karte — točno kad god može, inače simulacijom — i pokaže koliko često pobjeđujete.",
      "you": "Vaša ruka",
      "board": "Stol",
      "opp": "Protivnik (neobavezno)",
      "players": "Protivnici",
      "pick": "Dodirnite kartu da je stavite na označeno mjesto; dodirnite mjesto da ga ispraznite.",
      "clear": "Očisti",
      "win": "Pobjeda",
      "tie": "Neriješeno",
      "lose": "Poraz",
      "exact": "Točno: svako od {n} mogućih dijeljenja.",
      "sim": "Simulacija {n} nasumičnih dijeljenja.",
      "working": "Računam…",
      "need": "Odaberite svoje dvije karte da vidite svoje izglede.",
      "boardHint": "Na stol idu tri karte (flop), zatim četiri, zatim pet.",
      "oppHint": "Odaberite obje protivnikove karte ili nijednu.",
      "final": "Vaša konačna ruka",
      "noscript": "Kalkulator treba JavaScript. Tablice ispod rade i bez njega."
    },
    "outsH2": "Outsi: vaša šansa za pogodak",
    "outsP": "Out je karta koja je još u špilu i od vaše ruke čini vjerojatnog pobjednika. Na flopu 47 karata nije viđeno: s 9 outsa jedna karta pogađa na turnu u {f9turn} slučajeva, a do rivera — s dvije karte koje dolaze — u {f9river} slučajeva.",
    "outsCols": [
      "Čekanje",
      "Outsi",
      "Turn",
      "River (s turna)",
      "Turn ili river (s flopa)"
    ],
    "draws": {
      "gutshot": "Čekanje unutarnje skale (gutshot)",
      "twoPairFull": "Dva para do Full housea",
      "pairTrips": "Par do dva para ili trojke",
      "twoOver": "Dvije karte više od stola do para",
      "setFull": "Skrivena trojka (set) do Full housea ili četvorke",
      "oesd": "Čekanje otvorene skale",
      "flush": "Čekanje boje",
      "flushGut": "Čekanje boje i unutarnje skale",
      "flushOesd": "Čekanje boje i otvorene skale"
    },
    "outsNote": "Ovo su šanse da uhvatite jedan od svojih outsa. Ne uključuju runner-runner dodatke, a out koji i protivniku daje bolju ruku zapravo nije out.",
    "ruleH2": "Pravilo 2 i 4",
    "ruleP": "Brza procjena za stolom: pomnožite outse s 4 na flopu kad ćete vidjeti i turn i river, a s 2 kad dolazi samo jedna karta. Čekanje boje na flopu daje 9 × 4 = 36 %, naspram točnih {f9river}. Pravilo precjenjuje velika čekanja: 15 outsa daje 60 %, a stvarni broj je {f15river}.",
    "potH2": "Izgledi pota: trebate li platiti?",
    "potP": "Izgledi pota uspoređuju ono što morate platiti s onim što možete osvojiti. U potu je 100, a protivnik ulaže 50: plaćate 50 da biste osvojili pot od 200, pa plaćanje mora pobijediti u više od 50 ÷ 200 = 25 % slučajeva da bi se isplatilo. S čekanjem boje i jednom kartom koja dolazi pogađate u {f9one} slučajeva, pa plaćanje uloga kad je ostao samo river dugoročno gubi žetone. Uz All-In na flopu, s obje karte koje dolaze, isto čekanje pogađa u {f9river} slučajeva, i plaćanje se isplati.",
    "matchH2": "Dvoboji prije flopa",
    "matchP": "Kako dvije početne ruke prolaze jedna protiv druge kad se podijeli svih pet karata na stolu, prebrojano na svakoj od {boards} mogućih kombinacija stola. Boje malo utječu: ruke ispod nemaju zajedničku boju, osim ako nisu prikazane kao iste boje.",
    "matchCols": [
      "Ruka",
      "Protiv",
      "Pobjeđuje",
      "Neriješeno",
      "Gubi"
    ],
    "startH2": "Vjerojatnosti početnih ruku",
    "startP": "Postoji {combos} različitih početnih ruku od dvije karte. Koliko često dobijete:",
    "startCols": [
      "Ruka",
      "Šansa",
      "Otprilike jedna ruka od"
    ],
    "starting": {
      "specificPair": "Određeni par u ruci, primjerice asovi",
      "anyPair": "Bilo koji par u ruci",
      "specificNonPair": "Određena ruka bez para, primjerice as-kralj",
      "specificSuited": "Određena ruka iste boje, primjerice as-kralj iste boje",
      "anySuited": "Bilo koje dvije karte iste boje",
      "twoBroadway": "Dvije karte od desetke naviše"
    },
    "faqH2": "Pitanja",
    "faq": [
      [
        "Što su outsi u pokeru?",
        "Karte preostale u špilu koje bi vam dale najbolju ruku. Brojite samo karte koje niste vidjeli: 47 na flopu, 46 na turnu."
      ],
      [
        "Koliko često par asova pobjeđuje par kraljeva?",
        "Otprilike četiri puta od pet: {aakk} kad se podijeli svih pet karata na stolu, dok kraljevi pobjeđuju u {kkaa}."
      ],
      [
        "Je li as-kralj protiv para bacanje novčića?",
        "Gotovo, protiv srednjeg para: dame pobjeđuju as-kralja u {qqak}. Protiv malog para još je tješnje — dvojke pobjeđuju u {22ak}."
      ],
      [
        "Što su izgledi pota?",
        "Cijena plaćanja u usporedbi s potom koji možete osvojiti. Ako je vaša šansa za pobjedu veća od udjela u konačnom potu koji ste uložili, plaćanje se dugoročno isplati."
      ],
      [
        "Pokazuje li PokerTH moje izglede tijekom igre?",
        "Da. Kartica Izgledi imenuje vašu trenutačno najbolju ruku i vašu šansu za pobjedu kako karte izlaze, pa za stolom možete provjeriti vlastito razmišljanje."
      ]
    ]
  },
  hu: {
    "title": "Póker esélyek — outok, pot odds, kezek párharca | PokerTH",
    "desc": "Texas Hold’em esélyek pontosan kiszámolva: outok és az esélyed, hogy bejöjjenek, a 2-es és 4-es szabály, pot odds, és milyen gyakran veri AA a KK-t vagy QQ az AK-t.",
    "ldHeadline": "Póker esélyek: outok, pot odds és flop előtti párharcok",
    "ldDesc": "Texas Hold’em esélyek pontosan kiszámolva: outok, a 2-es és 4-es szabály, pot odds és flop előtti párharcok.",
    "h1": "Póker esélyek: outok, pot odds és flop előtti párharcok",
    "lead": "A jó pókerdöntések néhány számon múlnak: mennyire valószínű, hogy a kezed javul, mennyit kell fizetned, hogy kiderüljön, és hogyan áll egymással szemben két kéz a flop előtt. Az oldalon minden szám pontosan ki van számolva, nem táblázatból van másolva.",
    "calc": {
      "h2": "Póker esélyszámító",
      "intro": "Válaszd ki a két lapodat, és ha szeretnéd, az asztal lapjait és egy ellenfél kezét is. A kalkulátor kiosztja az összes maradék lapot — pontosan, amikor csak lehet, egyébként szimulációval —, és megmutatja, milyen gyakran nyersz.",
      "you": "A kezed",
      "board": "Asztal",
      "opp": "Ellenfél (nem kötelező)",
      "players": "Ellenfelek",
      "pick": "Koppints egy lapra, hogy a kiemelt helyre kerüljön; koppints egy helyre, hogy kiürítsd.",
      "clear": "Törlés",
      "win": "Nyerés",
      "tie": "Döntetlen",
      "lose": "Vesztés",
      "exact": "Pontos: mind a {n} lehetséges osztás.",
      "sim": "{n} véletlen osztás szimulációja.",
      "working": "Számolás…",
      "need": "Válaszd ki a két lapodat, hogy lásd az esélyeidet.",
      "boardHint": "Az asztalra három lap kerül (a flop), aztán négy, majd öt.",
      "oppHint": "Az ellenfél mindkét lapját válaszd ki, vagy egyiket se.",
      "final": "A végső kezed",
      "noscript": "A kalkulátorhoz JavaScript kell. Az alábbi táblázatok nélküle is működnek."
    },
    "outsH2": "Outok: az esélyed a találatra",
    "outsP": "Az out olyan lap, amely még a pakliban van, és a kezedet valószínű nyerővé teszi. A flopon 47 lapot nem látsz: 9 outtal egy lap a turnön {f9turn} eséllyel talál, a riverig pedig — még két lappal — {f9river} eséllyel.",
    "outsCols": [
      "Lehívás",
      "Outok",
      "Turn",
      "River (a turnről)",
      "Turn vagy river (a flopról)"
    ],
    "draws": {
      "gutshot": "Belső sorlehívás (gutshot)",
      "twoPairFull": "Két párból full",
      "pairTrips": "Párból két pár vagy drill",
      "twoOver": "Két overcard párhoz",
      "setFull": "Setből full vagy póker",
      "oesd": "Nyitott sorlehívás",
      "flush": "Színlehívás",
      "flushGut": "Színlehívás és gutshot",
      "flushOesd": "Színlehívás és nyitott sorlehívás"
    },
    "outsNote": "Ezek annak az esélyei, hogy bejön valamelyik outod. Nem számolják a runner-runner pluszokat, és az az out, amely az ellenfélnek is jobb kezet ad, valójában nem out.",
    "ruleH2": "A 2-es és 4-es szabály",
    "ruleP": "Gyors becslés az asztalnál: a flopon szorozd meg az outjaidat 4-gyel, ha a turnt és a rivert is látni fogod, és 2-vel, ha már csak egy lap jön. Egy színlehívás a flopon 9 × 4 = 36%, szemben a pontos {f9river} értékkel. A szabály túlbecsüli a nagy lehívásokat: 15 out 60%-ot ad, a valós szám {f15river}.",
    "potH2": "Pot odds: megadjam?",
    "potP": "A pot odds összeveti, mennyit kell fizetned azzal, amennyit nyerhetsz. A potban 100 van, az ellenfeled 50-et tesz: 50-et adsz meg, hogy egy 200-as potot nyerj, tehát a megadásnak az esetek több mint 50 ÷ 200 = 25%-ában kell nyernie, hogy megérje. Színlehívással, amikor még egy lap jön, {f9one} eséllyel találsz, így ha egy tétet már csak a river előtt adsz meg, az hosszú távon zsetonokat veszít. All-in a flopon, amikor még mindkét lap jön, ugyanez a lehívás {f9river} eséllyel jön be, és megéri megadni.",
    "matchH2": "Flop előtti párharcok",
    "matchP": "Hogyan teljesít két kezdőkéz egymás ellen, ha mind az öt közös lapot kiosztják, mind a {boards} lehetséges asztalon megszámolva. A színek kicsit számítanak: az alábbi kezeknek nincs közös színe, hacsak nincsenek azonos színűként jelölve.",
    "matchCols": [
      "Kéz",
      "Ellene",
      "Nyer",
      "Döntetlen",
      "Veszít"
    ],
    "startH2": "Kezdőkezek esélyei",
    "startP": "{combos} különböző kétlapos kezdőkéz létezik. Milyen gyakran kapod:",
    "startCols": [
      "Kéz",
      "Esély",
      "Kb. ennyi kézből egyszer"
    ],
    "starting": {
      "specificPair": "Egy adott kézben lévő pár, pl. ászok",
      "anyPair": "Bármilyen kézben lévő pár",
      "specificNonPair": "Egy adott pár nélküli kéz, pl. ász-király",
      "specificSuited": "Egy adott azonos színű kéz, pl. azonos színű ász-király",
      "anySuited": "Bármely két azonos színű lap",
      "twoBroadway": "Két tízes vagy magasabb lap"
    },
    "faqH2": "Kérdések",
    "faq": [
      [
        "Mik az outok a pókerben?",
        "A pakliban maradt lapok, amelyek a legjobb kezet adnák neked. Csak azokat a lapokat számold, amelyeket nem láttál: a flopon 47-et, a turnön 46-ot."
      ],
      [
        "Milyen gyakran verik az ászok a királyokat?",
        "Nagyjából ötből négyszer: {aakk}, ha mind az öt közös lapot kiosztják, a királyok pedig {kkaa} eséllyel nyernek."
      ],
      [
        "Az ász-király egy pár ellen pénzfeldobás?",
        "Majdnem, egy közepes pár ellen: a dámák {qqak} eséllyel nyernek az ász-király ellen. Kis pár ellen még szorosabb — a kettesek {22ak} eséllyel nyernek."
      ],
      [
        "Mi az a pot odds?",
        "A megadás ára a megnyerhető pothoz képest. Ha a nyerési esélyed nagyobb, mint a végső pot általad befizetett része, a megadás hosszú távon megéri."
      ],
      [
        "Mutatja a PokerTH az esélyeimet játék közben?",
        "Igen. Az Esélyek fül megnevezi az éppen legjobb kezedet és a nyerési esélyedet, ahogy jönnek a lapok, így az asztalnál ellenőrizheted a saját gondolatmenetedet."
      ]
    ]
  },
  hy: {
    "title": "Պոկերի հավանականություններ — աութներ, pot odds, մենամարտեր | PokerTH",
    "desc": "Texas Hold’em-ի ճշգրիտ հավանականություններ՝ աութներ և դրանք բռնելու շանսը, 2-ի և 4-ի կանոնը, բանկի հավանականություններ, և որքան հաճախ է AA-ն հաղթում KK-ին, QQ-ն՝ AK-ին։",
    "ldHeadline": "Պոկերի հավանականություններ՝ աութներ, բանկի հավանականություններ և մենամարտեր մինչև flop-ը",
    "ldDesc": "Texas Hold’em-ի ճշգրիտ հաշվարկված հավանականություններ՝ աութներ, 2-ի և 4-ի կանոնը, բանկի հավանականություններ և մենամարտեր մինչև flop-ը։",
    "h1": "Պոկերի հավանականություններ՝ աութներ, բանկի հավանականություններ և մենամարտեր մինչև flop-ը",
    "lead": "Պոկերում լավ որոշումները հանգում են մի քանի թվի՝ որքան հավանական է, որ ձեր ձեռքը կուժեղանա, որքան պետք է վճարեք դա իմանալու համար, և ինչպես են երկու ձեռքերը դիմակայում միմյանց մինչև flop-ը։ Այս էջի յուրաքանչյուր թիվ հաշվարկված է ճշգրիտ, ոչ թե արտագրված աղյուսակից։",
    "calc": {
      "h2": "Պոկերի հավանականությունների հաշվիչ",
      "intro": "Ընտրեք ձեր երկու խաղաթուղթը և, ցանկության դեպքում, բորդը և մրցակցի ձեռքը։ Հաշվիչը բաժանում է մնացած բոլոր խաղաթղթերը — ճշգրիտ՝ երբ հնարավոր է, հակառակ դեպքում՝ սիմուլյացիայով — և ցույց է տալիս, թե որքան հաճախ եք հաղթում։",
      "you": "Ձեր ձեռքը",
      "board": "Բորդ",
      "opp": "Մրցակից (ըստ ցանկության)",
      "players": "Մրցակիցներ",
      "pick": "Հպեք խաղաթղթին՝ այն ընդգծված դիրքում դնելու համար, հպեք դիրքին՝ այն դատարկելու համար։",
      "clear": "Մաքրել",
      "win": "Հաղթանակ",
      "tie": "Ոչ-ոքի",
      "lose": "Պարտություն",
      "exact": "Ճշգրիտ՝ բոլոր {n} հնարավոր բաժանումները։",
      "sim": "{n} պատահական բաժանումների սիմուլյացիա։",
      "working": "Հաշվարկվում է…",
      "need": "Ընտրեք ձեր երկու խաղաթուղթը՝ ձեր շանսերը տեսնելու համար։",
      "boardHint": "Բորդն ընդունում է երեք խաղաթուղթ (flop), հետո չորս, հետո հինգ։",
      "oppHint": "Ընտրեք մրցակցի երկու խաղաթղթերն էլ կամ ոչ մեկը։",
      "final": "Ձեր վերջնական ձեռքը",
      "noscript": "Հաշվիչին անհրաժեշտ է JavaScript։ Ստորև բերված աղյուսակներն աշխատում են առանց դրա։"
    },
    "outsH2": "Աութներ և դրանք բռնելու ձեր շանսը",
    "outsP": "Աութն այն խաղաթուղթն է, որը դեռ կապուկում է և ձեր ձեռքը դարձնում է հավանական հաղթող։ Flop-ում 47 խաղաթուղթ դեռ չի երևացել. 9 աութի դեպքում turn-ում մեկ խաղաթղթով բռնելու հավանականությունը {f9turn} է, իսկ մինչև river-ը՝ երբ դեռ երկու խաղաթուղթ կա գալու, {f9river}։",
    "outsCols": [
      "Դրո",
      "Աութներ",
      "Turn",
      "River (turn-ից)",
      "Turn կամ river (flop-ից)"
    ],
    "draws": {
      "gutshot": "Ներքին սթրիթի դրո (gutshot)",
      "twoPairFull": "Երկու զույգից Ֆուլ հաուս",
      "pairTrips": "Զույգից Երկու զույգ կամ Եռյակ",
      "twoOver": "Երկու օվերքարդից զույգ",
      "setFull": "Սեթից Ֆուլ հաուս կամ Կարե",
      "oesd": "Բաց սթրիթի դրո",
      "flush": "Ֆլեշի դրո",
      "flushGut": "Ֆլեշի դրո և gutshot",
      "flushOesd": "Ֆլեշի դրո և բաց սթրիթի դրո"
    },
    "outsNote": "Սրանք ձեր աութներից մեկը բռնելու հավանականություններն են։ Դրանցում հաշվի չեն առնված runner-runner հավելումները, և աութը, որը մրցակցին էլ ավելի լավ ձեռք է տալիս, իրականում աութ չէ։",
    "ruleH2": "2-ի և 4-ի կանոնը",
    "ruleP": "Արագ գնահատում սեղանի մոտ՝ flop-ում բազմապատկեք ձեր աութները 4-ով, եթե տեսնելու եք և՛ turn-ը, և՛ river-ը, և 2-ով, երբ մնացել է միայն մեկ խաղաթուղթ։ Ֆլեշի դրոն flop-ում տալիս է 9 × 4 = 36%, մինչդեռ ճշգրիտ արժեքը {f9river} է։ Կանոնը գերագնահատում է մեծ դրոները. 15 աութը տալիս է 60%, իսկ իրական թիվը {f15river} է։",
    "potH2": "Բանկի հավանականություններ. արժե՞ Call անել",
    "potP": "Բանկի հավանականությունները համեմատում են այն, ինչ պետք է վճարեք, այն բանի հետ, ինչ կարող եք շահել։ Բանկում 100 է, և մրցակիցը դնում է 50. դուք վճարում եք 50՝ 200-անոց բանկ շահելու համար, ուստի Call-ը պետք է հաղթի դեպքերի 50 ÷ 200 = 25%-ից ավելիում, որպեսզի արդարանա։ Ֆլեշի դրոյով և մեկ մնացած խաղաթղթով բռնելու ձեր հավանականությունը {f9one} է, ուստի երբ մնացել է միայն river-ը, խաղադրույքին Call անելը երկարաժամկետում ֆիշկաներ է կորցնում։ Flop-ում All-In-ի դեպքում, երբ դեռ երկու խաղաթուղթ կա գալու, նույն դրոն բռնելու հավանականությունը {f9river} է, և Call-ն արժե անել։",
    "matchH2": "Մենամարտեր մինչև flop-ը",
    "matchP": "Ինչպես են երկու մեկնարկային ձեռքերը հանդես գալիս միմյանց դեմ, երբ բորդի բոլոր հինգ խաղաթղթերը բաժանված են՝ հաշվարկված {boards} հնարավոր բորդերից յուրաքանչյուրի վրա։ Մաստերը մի փոքր նշանակություն ունեն. ստորև բերված ձեռքերը ընդհանուր մաստ չունեն, եթե ցույց տրված չեն որպես նույն մաստի։",
    "matchCols": [
      "Ձեռք",
      "Ընդդեմ",
      "Հաղթում է",
      "Ոչ-ոքի",
      "Պարտվում է"
    ],
    "startH2": "Մեկնարկային ձեռքերի հավանականություններ",
    "startP": "Գոյություն ունի երկու խաղաթղթից կազմված {combos} տարբեր մեկնարկային ձեռք։ Որքան հաճախ եք ստանում՝",
    "startCols": [
      "Ձեռք",
      "Հավանականություն",
      "Մոտավորապես մեկ ձեռք՝ ամեն"
    ],
    "starting": {
      "specificPair": "Կոնկրետ գրպանի զույգ, օրինակ՝ տուզեր",
      "anyPair": "Ցանկացած գրպանի զույգ",
      "specificNonPair": "Կոնկրետ ձեռք առանց զույգի, օրինակ՝ տուզ-թագավոր",
      "specificSuited": "Կոնկրետ նույն մաստի ձեռք, օրինակ՝ նույն մաստի տուզ-թագավոր",
      "anySuited": "Նույն մաստի ցանկացած երկու խաղաթուղթ",
      "twoBroadway": "Տասնոց կամ ավելի բարձր երկու խաղաթուղթ"
    },
    "faqH2": "Հարցեր",
    "faq": [
      [
        "Ի՞նչ են աութները պոկերում։",
        "Կապուկում մնացած խաղաթղթերը, որոնք ձեզ կտան լավագույն ձեռքը։ Հաշվեք միայն այն խաղաթղթերը, որոնք չեք տեսել՝ 47-ը flop-ում, 46-ը turn-ում։"
      ],
      [
        "Որքա՞ն հաճախ են գրպանի տուզերը հաղթում թագավորներին։",
        "Հինգից մոտավորապես չորս անգամ՝ {aakk}, երբ բորդի բոլոր հինգ խաղաթղթերը բաժանված են, իսկ թագավորների հաղթելու հավանականությունը {kkaa} է։"
      ],
      [
        "Տուզ-թագավորն ընդդեմ զույգի մետաղադրամի նետո՞ւմ է։",
        "Գրեթե, եթե զույգը միջին է. դամաների հաղթելու հավանականությունը տուզ-թագավորի դեմ {qqak} է։ Փոքր զույգի դեմ ավելի մոտ է — երկուսների զույգի հաղթելու հավանականությունը {22ak} է։"
      ],
      [
        "Ի՞նչ են բանկի հավանականությունները։",
        "Call-ի գինը՝ համեմատած այն բանկի հետ, որը կարող եք շահել։ Եթե հաղթելու ձեր շանսը մեծ է վերջնական բանկում ձեր ներդրած բաժնից, Call անելը ժամանակի ընթացքում արդարանում է։"
      ],
      [
        "PokerTH-ը ցույց տալի՞ս է իմ շանսերը խաղի ընթացքում։",
        "Այո։ Հավանականություններ ներդիրը նշում է ձեր ընթացիկ լավագույն ձեռքը և հաղթելու ձեր հավանականությունը, մինչ խաղաթղթերը բացվում են, որպեսզի սեղանի մոտ ստուգեք ձեր սեփական դատողությունը։"
      ]
    ]
  },
  id: {
    "title": "Tabel peluang poker — outs, pot odds, adu tangan | PokerTH",
    "desc": "Peluang Texas Hold’em dihitung secara tepat: outs dan peluang Anda mendapatkannya, aturan 2 dan 4, pot odds, dan seberapa sering AA menang atas KK atau QQ atas AK.",
    "ldHeadline": "Peluang poker: outs, pot odds, dan adu tangan sebelum flop",
    "ldDesc": "Peluang Texas Hold’em dihitung secara tepat: outs, aturan 2 dan 4, pot odds, dan adu tangan sebelum flop.",
    "h1": "Peluang poker: outs, pot odds, dan adu tangan sebelum flop",
    "lead": "Keputusan poker yang baik bergantung pada beberapa angka: seberapa besar kemungkinan kartu Anda membaik, berapa yang harus Anda bayar untuk mengetahuinya, dan bagaimana dua tangan saling berhadapan sebelum flop. Setiap angka di halaman ini dihitung secara tepat, bukan disalin dari tabel.",
    "calc": {
      "h2": "Kalkulator peluang poker",
      "intro": "Pilih dua kartu Anda dan, jika mau, meja serta kartu lawan. Kalkulator membagikan setiap kartu yang tersisa — secara tepat bila memungkinkan, dengan simulasi bila tidak — dan menunjukkan seberapa sering Anda menang.",
      "you": "Tangan Anda",
      "board": "Meja",
      "opp": "Lawan (opsional)",
      "players": "Lawan",
      "pick": "Ketuk kartu untuk menaruhnya di slot yang disorot; ketuk slot untuk mengosongkannya.",
      "clear": "Hapus",
      "win": "Menang",
      "tie": "Seri",
      "lose": "Kalah",
      "exact": "Tepat: semua {n} kemungkinan pembagian.",
      "sim": "Simulasi {n} pembagian acak.",
      "working": "Menghitung…",
      "need": "Pilih dua kartu Anda untuk melihat peluang Anda.",
      "boardHint": "Meja berisi tiga kartu (flop), lalu empat, lalu lima.",
      "oppHint": "Pilih kedua kartu lawan, atau tidak sama sekali.",
      "final": "Tangan akhir Anda",
      "noscript": "Kalkulator ini memerlukan JavaScript. Tabel di bawah tetap berfungsi tanpanya."
    },
    "outsH2": "Outs: peluang Anda untuk kena",
    "outsP": "Out adalah kartu yang masih ada di dek dan membuat tangan Anda berpeluang besar menang. Di flop ada 47 kartu yang belum terlihat: dengan 9 outs, peluang satu kartu kena di turn adalah {f9turn}, dan sampai river — dengan dua kartu lagi — {f9river}.",
    "outsCols": [
      "Draw",
      "Outs",
      "Turn",
      "River (dari turn)",
      "Turn atau river (dari flop)"
    ],
    "draws": {
      "gutshot": "Straight draw dalam (gutshot)",
      "twoPairFull": "Two Pair menjadi Full House",
      "pairTrips": "One Pair menjadi Two Pair atau Three of a Kind",
      "twoOver": "Dua overcard menjadi One Pair",
      "setFull": "Set menjadi Full House atau Four of a Kind",
      "oesd": "Straight draw terbuka dua sisi",
      "flush": "Flush draw",
      "flushGut": "Flush draw dan gutshot",
      "flushOesd": "Flush draw dan straight draw terbuka dua sisi"
    },
    "outsNote": "Ini adalah peluang mendapatkan salah satu outs Anda. Tambahan dari dua kartu berturut-turut (runner-runner) tidak dihitung, dan out yang juga memberi lawan tangan lebih baik sebenarnya bukan out.",
    "ruleH2": "Aturan 2 dan 4",
    "ruleP": "Perkiraan cepat di meja: kalikan outs Anda dengan 4 di flop bila Anda akan melihat turn dan river, dan dengan 2 bila tinggal satu kartu lagi. Flush draw di flop menjadi 9 × 4 = 36%, dibanding angka tepatnya {f9river}. Aturan ini melebih-lebihkan draw besar: 15 outs memberi 60%, padahal angka sebenarnya {f15river}.",
    "potH2": "Pot odds: perlukah Anda menyamakan?",
    "potP": "Pot odds membandingkan apa yang harus Anda bayar dengan apa yang bisa Anda menangkan. Pot berisi 100 dan lawan bertaruh 50: Anda menyamakan 50 untuk memenangkan pot 200, jadi agar menguntungkan, call itu harus menang lebih sering dari 50 ÷ 200 = 25%. Dengan flush draw dan satu kartu lagi, peluang Anda kena adalah {f9one}, jadi menyamakan taruhan ketika hanya tersisa river akan menghabiskan chip dalam jangka panjang. All-in di flop, dengan dua kartu lagi, draw yang sama kena {f9river}, dan call itu layak dilakukan.",
    "matchH2": "Adu tangan sebelum flop",
    "matchP": "Bagaimana dua tangan awal saling berhadapan bila kelima kartu meja dibagikan, dihitung atas semua {boards} kemungkinan meja. Jenis kartu sedikit berpengaruh: tangan di bawah tidak berbagi jenis kecuali ditandai sejenis.",
    "matchCols": [
      "Tangan",
      "Melawan",
      "Menang",
      "Seri",
      "Kalah"
    ],
    "startH2": "Peluang tangan awal",
    "startP": "Ada {combos} tangan awal dua kartu yang berbeda. Seberapa sering Anda mendapat:",
    "startCols": [
      "Tangan",
      "Peluang",
      "Kira-kira satu tangan dari"
    ],
    "starting": {
      "specificPair": "Pasangan di tangan tertentu, misalnya as",
      "anyPair": "Pasangan di tangan apa saja",
      "specificNonPair": "Tangan tanpa pasangan tertentu, misalnya as-king",
      "specificSuited": "Tangan sejenis tertentu, misalnya as-king sejenis",
      "anySuited": "Dua kartu sejenis apa saja",
      "twoBroadway": "Dua kartu sepuluh atau lebih tinggi"
    },
    "faqH2": "Pertanyaan",
    "faq": [
      [
        "Apa itu outs dalam poker?",
        "Kartu yang tersisa di dek yang akan memberi Anda tangan terbaik. Hitung hanya kartu yang belum Anda lihat: 47 di flop, 46 di turn."
      ],
      [
        "Seberapa sering pasangan as mengalahkan pasangan king?",
        "Sekitar empat dari lima kali: {aakk} bila kelima kartu meja dibagikan, sedangkan pasangan king menang {kkaa}."
      ],
      [
        "Apakah as-king melawan pasangan itu seperti lempar koin?",
        "Hampir, melawan pasangan menengah: pasangan queen menang {qqak} melawan as-king. Melawan pasangan kecil bahkan lebih seimbang — pasangan dua menang {22ak}."
      ],
      [
        "Apa itu pot odds?",
        "Harga sebuah call dibanding pot yang bisa Anda menangkan. Jika peluang menang Anda lebih tinggi daripada bagian pot akhir yang Anda masukkan, menyamakan akan menguntungkan dalam jangka panjang."
      ],
      [
        "Apakah PokerTH menampilkan peluang saya selama permainan?",
        "Ya. Tab Peluang menyebutkan susunan terbaik Anda saat itu dan peluang menang Anda seiring kartu dibuka, sehingga Anda bisa memeriksa penalaran Anda sendiri di meja."
      ]
    ]
  },
  is: {
    "title": "Líkur í póker — útspil, potthlutfall og viðureignir | PokerTH",
    "desc": "Líkur í Texas Hold’em reiknaðar nákvæmlega: útspil og líkurnar á að hitta þau, reglan um 2 og 4, potthlutfall og hve oft AA vinnur KK eða QQ vinnur AK.",
    "ldHeadline": "Líkur í póker: útspil, potthlutfall og viðureignir fyrir flop",
    "ldDesc": "Líkur í Texas Hold’em reiknaðar nákvæmlega: útspil, reglan um 2 og 4, potthlutfall og viðureignir fyrir flop.",
    "h1": "Líkur í póker: útspil, potthlutfall og viðureignir fyrir flop",
    "lead": "Góðar ákvarðanir í póker snúast um fáeinar tölur: hve líklegt er að höndin þín batni, hve mikið þú þarft að borga til að komast að því, og hvernig tvær hendur standa hvor gegn annarri fyrir floppið. Hver einasta tala á þessari síðu er reiknuð nákvæmlega, ekki afrituð úr töflu.",
    "calc": {
      "h2": "Líkindareiknir fyrir póker",
      "intro": "Veldu spilin þín tvö og, ef þú vilt, borðið og hönd andstæðings. Reiknirinn gefur öll spilin sem eftir eru — nákvæmlega þegar hann getur, annars með hermun — og sýnir hve oft þú vinnur.",
      "you": "Höndin þín",
      "board": "Borðið",
      "opp": "Andstæðingur (valfrjálst)",
      "players": "Andstæðingar",
      "pick": "Ýttu á spil til að setja það í auðkennda reitinn; ýttu á reit til að tæma hann.",
      "clear": "Hreinsa",
      "win": "Sigur",
      "tie": "Jafnt",
      "lose": "Tap",
      "exact": "Nákvæmt: allar {n} mögulegar gjafir.",
      "sim": "Hermun á {n} slembigjöfum.",
      "working": "Reikna…",
      "need": "Veldu spilin þín tvö til að sjá líkurnar.",
      "boardHint": "Á borðið koma þrjú spil (floppið), svo fjögur, svo fimm.",
      "oppHint": "Veldu bæði spil andstæðingsins, eða hvorugt.",
      "final": "Lokahöndin þín",
      "noscript": "Reiknirinn þarf JavaScript. Töflurnar hér fyrir neðan virka án þess."
    },
    "outsH2": "Útspil: líkurnar á að hitta",
    "outsP": "Útspil er spil sem enn er í stokknum og gerir höndina þína að líklegum sigurvegara. Á floppinu eru 47 spil óséð: með 9 útspil hittir eitt spil á turn í {f9turn} tilvika, og fram að river — með tvö spil eftir — í {f9river} tilvika.",
    "outsCols": [
      "Dráttur",
      "Útspil",
      "Turn",
      "River (frá turn)",
      "Turn eða river (frá floppi)"
    ],
    "draws": {
      "gutshot": "Innri röðardráttur (gutshot)",
      "twoPairFull": "Tvö pör → Fullt hús",
      "pairTrips": "Par → Tvö pör eða Þrenna",
      "twoOver": "Tvö yfirspil → Par",
      "setFull": "Sett → Fullt hús eða Ferna",
      "oesd": "Opinn röðardráttur í báða enda",
      "flush": "Litardráttur",
      "flushGut": "Litardráttur og gutshot",
      "flushOesd": "Litardráttur og opinn röðardráttur í báða enda"
    },
    "outsNote": "Þetta eru líkurnar á að fá eitt af útspilunum þínum. Þær taka ekki með aukamöguleika úr runner-runner, og útspil sem gefur andstæðingi líka betri hönd er í raun ekki útspil.",
    "ruleH2": "Reglan um 2 og 4",
    "ruleP": "Fljótlegt mat við borðið: margfaldaðu útspilin með 4 á floppinu þegar þú færð að sjá bæði turn og river, og með 2 þegar aðeins eitt spil er eftir. Litardráttur á floppinu gefur 9 × 4 = 36%, á móti nákvæmlega {f9river}. Reglan ofmetur stóra drætti: 15 útspil gefa 60%, en rétta talan er {f15river}.",
    "potH2": "Potthlutfall: áttu að jafna?",
    "potP": "Potthlutfall ber saman það sem þú þarft að borga og það sem þú getur unnið. Í pottinum eru 100 og andstæðingurinn veðjar 50: þú jafnar 50 til að vinna pott upp á 200, svo jöfnunin þarf að vinna í meira en 50 ÷ 200 = 25% tilvika til að borga sig. Með litardrátt og eitt spil eftir hittir þú í {f9one} tilvika, svo að jafna veðmál þegar aðeins river er eftir tapar spilapeningum til lengri tíma. All-In á floppinu, með bæði spilin eftir, hittir sami dráttur í {f9river} tilvika og það borgar sig að jafna.",
    "matchH2": "Viðureignir fyrir flop",
    "matchP": "Hvernig tvær byrjunarhendur standa sig hvor gegn annarri þegar öll fimm borðspilin hafa verið gefin, talið yfir öll {boards} möguleg borð. Sortir skipta litlu: hendurnar hér fyrir neðan deila engri sort nema þær séu sýndar í sömu sort.",
    "matchCols": [
      "Hönd",
      "Gegn",
      "Vinnur",
      "Jafnt",
      "Tapar"
    ],
    "startH2": "Líkur á byrjunarhöndum",
    "startP": "Til eru {combos} ólíkar tveggja spila byrjunarhendur. Hve oft þú færð:",
    "startCols": [
      "Hönd",
      "Líkur",
      "Um það bil ein hönd af hverjum"
    ],
    "starting": {
      "specificPair": "Tiltekið par á hendi, til dæmis ásar",
      "anyPair": "Hvaða par á hendi sem er",
      "specificNonPair": "Tiltekin hönd án pars, til dæmis ás-kóngur",
      "specificSuited": "Tiltekin hönd í sömu sort, til dæmis ás-kóngur í sömu sort",
      "anySuited": "Hvaða tvö spil í sömu sort sem er",
      "twoBroadway": "Tvö spil, tía eða hærra"
    },
    "faqH2": "Spurningar",
    "faq": [
      [
        "Hvað eru útspil í póker?",
        "Spilin sem eftir eru í stokknum og myndu gefa þér bestu höndina. Teldu aðeins spilin sem þú hefur ekki séð: 47 á floppinu, 46 á turn."
      ],
      [
        "Hve oft vinna ásar á hendi kónga?",
        "Um það bil fjórum sinnum af fimm: í {aakk} tilvika þegar öll fimm borðspilin eru gefin, og kóngarnir vinna í {kkaa} tilvika."
      ],
      [
        "Er ás-kóngur gegn pari hreint hlutkesti?",
        "Nánast, gegn miðlungspari: drottningar vinna í {qqak} tilvika gegn ás-kóngi. Gegn litlu pari er það enn jafnara — tvistar vinna í {22ak} tilvika."
      ],
      [
        "Hvað er potthlutfall?",
        "Verðið á að jafna borið saman við pottinn sem þú getur unnið. Ef líkurnar á að þú vinnir eru hærri en sá hluti lokapottsins sem þú leggur til, borgar sig að jafna þegar til lengri tíma er litið."
      ],
      [
        "Sýnir PokerTH líkurnar mínar meðan á leik stendur?",
        "Já. Flipinn Líkur sýnir bestu höndina þína hverju sinni og líkurnar á að þú vinnir eftir því sem spilin koma upp, svo þú getur sannreynt eigin röksemdir við borðið."
      ]
    ]
  },
  it: {
    "title": "Probabilità del poker — outs, pot odds, mani a confronto | PokerTH",
    "desc": "Le probabilità del Texas Hold’em calcolate esattamente: outs e probabilità di chiuderle, regola del 2 e del 4, pot odds, e quanto spesso AA batte KK o QQ batte AK.",
    "ldHeadline": "Probabilità del poker: outs, pot odds e scontri preflop",
    "ldDesc": "Le probabilità del Texas Hold’em calcolate esattamente: outs, regola del 2 e del 4, pot odds e scontri preflop.",
    "h1": "Probabilità del poker: outs, pot odds e scontri preflop",
    "lead": "Le buone decisioni al poker si riducono a pochi numeri: quanto è probabile che la tua mano migliori, quanto devi pagare per scoprirlo, e come stanno due mani l’una contro l’altra prima del flop. Ogni cifra di questa pagina è calcolata esattamente, non copiata da una tabella.",
    "calc": {
      "h2": "Calcolatore di probabilità del poker",
      "intro": "Scegli le tue due carte e, se vuoi, il tavolo e la mano di un avversario. Il calcolatore distribuisce tutte le carte restanti — in modo esatto quando può, altrimenti per simulazione — e mostra quanto spesso vinci.",
      "you": "La tua mano",
      "board": "Tavolo",
      "opp": "Avversario (facoltativo)",
      "players": "Avversari",
      "pick": "Tocca una carta per metterla nella casella evidenziata; tocca una casella per svuotarla.",
      "clear": "Cancella",
      "win": "Vittoria",
      "tie": "Pareggio",
      "lose": "Sconfitta",
      "exact": "Esatto: tutte le {n} distribuzioni possibili.",
      "sim": "Simulazione di {n} distribuzioni casuali.",
      "working": "Calcolo in corso…",
      "need": "Scegli le tue due carte per vedere le tue probabilità.",
      "boardHint": "Il tavolo prende tre carte (il flop), poi quattro, poi cinque.",
      "oppHint": "Scegli entrambe le carte dell’avversario, o nessuna.",
      "final": "La tua mano finale",
      "noscript": "Il calcolatore richiede JavaScript. Le tabelle qui sotto funzionano anche senza."
    },
    "outsH2": "Outs: le tue probabilità di chiudere",
    "outsP": "Un out è una carta ancora nel mazzo che trasforma la tua mano nella probabile vincente. Al flop restano 47 carte non viste: con 9 outs, una carta entra al turn nel {f9turn} dei casi, ed entro il river — con due carte ancora da uscire — nel {f9river}.",
    "outsCols": [
      "Progetto",
      "Outs",
      "Turn",
      "River (dal turn)",
      "Turn o river (dal flop)"
    ],
    "draws": {
      "gutshot": "Progetto di scala interna (gutshot)",
      "twoPairFull": "Da doppia coppia a full",
      "pairTrips": "Da coppia a doppia coppia o tris",
      "twoOver": "Due overcard per fare coppia",
      "setFull": "Da set a full o poker",
      "oesd": "Progetto di scala bilaterale",
      "flush": "Progetto di colore",
      "flushGut": "Progetto di colore e gutshot",
      "flushOesd": "Progetto di colore e di scala bilaterale"
    },
    "outsNote": "Sono le probabilità di prendere uno dei tuoi outs. Non contano i progetti di rimessa (runner-runner), e un out che dà anche a un avversario una mano migliore non è davvero un out.",
    "ruleH2": "La regola del 2 e del 4",
    "ruleP": "Una stima rapida al tavolo: al flop moltiplica i tuoi outs per 4 quando vedrai sia il turn sia il river, e per 2 quando resta una sola carta da uscire. Un progetto di colore al flop fa 9 × 4 = 36%, contro {f9river} esatti. La regola sovrastima i progetti grandi: 15 outs danno 60%, il dato reale è {f15river}.",
    "potH2": "Pot odds: conviene vedere?",
    "potP": "Le pot odds confrontano quanto devi pagare con quanto puoi vincere. Nel piatto ci sono 100 e l’avversario punta 50: vedi 50 per vincere un piatto di 200, quindi il call deve vincere più del 50 ÷ 200 = 25% delle volte per rendere. Con un progetto di colore e una carta da uscire chiudi nel {f9one} dei casi, quindi vedere una puntata quando resta solo il river fa perdere fiche alla lunga. All-in al flop, con entrambe le carte da uscire, lo stesso progetto chiude nel {f9river} dei casi, e il call vale la pena.",
    "matchH2": "Scontri preflop",
    "matchP": "Come se la cavano due mani di partenza l’una contro l’altra quando escono tutte e cinque le carte comuni, contando ognuno dei {boards} tavoli possibili. I semi contano un poco: le mani qui sotto non hanno semi in comune, salvo quando sono indicate dello stesso seme.",
    "matchCols": [
      "Mano",
      "Contro",
      "Vince",
      "Pareggio",
      "Perde"
    ],
    "startH2": "Probabilità delle mani di partenza",
    "startP": "Esistono {combos} diverse mani di partenza di due carte. Quanto spesso ricevi:",
    "startCols": [
      "Mano",
      "Probabilità",
      "Circa una mano su"
    ],
    "starting": {
      "specificPair": "Una data coppia servita, per esempio due assi",
      "anyPair": "Una coppia servita qualsiasi",
      "specificNonPair": "Una data mano non accoppiata, per esempio asso-re",
      "specificSuited": "Una data mano dello stesso seme, per esempio asso-re dello stesso seme",
      "anySuited": "Due carte qualsiasi dello stesso seme",
      "twoBroadway": "Due carte dal dieci in su"
    },
    "faqH2": "Domande",
    "faq": [
      [
        "Cosa sono gli outs nel poker?",
        "Le carte rimaste nel mazzo che ti darebbero la mano migliore. Conta solo le carte che non hai visto: 47 al flop, 46 al turn."
      ],
      [
        "Quanto spesso una coppia d’assi batte una coppia di re?",
        "Circa quattro volte su cinque: {aakk} quando escono tutte e cinque le carte comuni, mentre i re vincono nel {kkaa} dei casi."
      ],
      [
        "Asso-re contro una coppia è un testa o croce?",
        "Quasi, contro una coppia media: la coppia di donne vince il {qqak} contro asso-re. Contro una coppia piccola è ancora più equilibrato — la coppia di due vince il {22ak}."
      ],
      [
        "Cosa sono le pot odds?",
        "Il prezzo di un call rispetto al piatto che puoi vincere. Se la tua probabilità di vincere è più alta della quota del piatto finale che ci metti tu, vedere rende nel tempo."
      ],
      [
        "PokerTH mostra le mie probabilità durante la partita?",
        "Sì. La scheda Probabilità indica il tuo punto migliore del momento e la tua probabilità di vincere mentre escono le carte, così puoi verificare il tuo ragionamento al tavolo."
      ]
    ]
  },
  ja: {
    "title": "ポーカー確率表 — アウツ・ポットオッズ・ハンド対決 | PokerTH",
    "desc": "Texas Hold’em の確率を正確に計算：アウツとそれを引く確率、2と4のルール、ポットオッズ、そして AA が KK に、QQ が AK に勝つ頻度。",
    "ldHeadline": "ポーカーの確率：アウツ、ポットオッズ、プリフロップの対決",
    "ldDesc": "Texas Hold’em の確率を正確に計算：アウツ、2と4のルール、ポットオッズ、プリフロップの対決。",
    "h1": "ポーカーの確率：アウツ、ポットオッズ、プリフロップの対決",
    "lead": "ポーカーでの良い判断は、いくつかの数字に行き着きます。自分のハンドが良くなる見込みはどれくらいか、それを確かめるのにいくら払う必要があるか、そしてフロップ前に2つのハンドがどう渡り合うか。このページの数字はすべて正確に計算したもので、表から書き写したものではありません。",
    "calc": {
      "h2": "ポーカー確率計算機",
      "intro": "自分の2枚のカードを選び、必要ならボードと相手のハンドも選んでください。計算機は残りのカードをすべて配り切り——可能なら正確に、それ以外はシミュレーションで——あなたが勝つ頻度を表示します。",
      "you": "自分のハンド",
      "board": "ボード",
      "opp": "相手（任意）",
      "players": "相手の人数",
      "pick": "カードをタップすると強調表示された枠に置かれます。枠をタップすると空になります。",
      "clear": "クリア",
      "win": "勝ち",
      "tie": "引き分け",
      "lose": "負け",
      "exact": "正確：起こりうる {n} 通りの配り方すべて。",
      "sim": "ランダムな {n} 回の配りによるシミュレーション。",
      "working": "計算中…",
      "need": "2枚のカードを選ぶと勝率が表示されます。",
      "boardHint": "ボードには3枚（フロップ）、次に4枚、そして5枚が入ります。",
      "oppHint": "相手のカードは2枚とも選ぶか、1枚も選ばないでください。",
      "final": "最終的な役",
      "noscript": "計算機には JavaScript が必要です。下の表は JavaScript なしでも表示されます。"
    },
    "outsH2": "アウツ：引き当てる確率",
    "outsP": "アウツとは、まだデッキに残っていて、引けば自分のハンドがおそらく勝ちになるカードのことです。フロップの時点で見えていないカードは47枚。アウツが9枚なら、ターンで引ける確率は {f9turn}、リバーまで——残り2枚——なら {f9river} です。",
    "outsCols": [
      "ドロー",
      "アウツ",
      "ターン",
      "リバー（ターンから）",
      "ターンかリバー（フロップから）"
    ],
    "draws": {
      "gutshot": "インサイドストレートドロー（ガットショット）",
      "twoPairFull": "ツーペアからフルハウス",
      "pairTrips": "ワンペアからツーペアかスリーカード",
      "twoOver": "オーバーカード2枚からワンペア",
      "setFull": "セットからフルハウスかフォーカード",
      "oesd": "オープンエンド・ストレートドロー",
      "flush": "フラッシュドロー",
      "flushGut": "フラッシュドロー＋ガットショット",
      "flushOesd": "フラッシュドロー＋オープンエンド・ストレートドロー"
    },
    "outsNote": "これはアウツのどれかを引く確率です。ランナーランナーによる上乗せ分は含みません。また、相手にもっと強いハンドを与えてしまうアウツは、本当のアウツとは言えません。",
    "ruleH2": "2と4のルール",
    "ruleP": "テーブルでの手早い見積もり方：フロップでターンとリバーの両方を見られるならアウツを4倍、残り1枚なら2倍します。フロップでのフラッシュドローは 9 × 4 = 36% で、正確な値は {f9river} です。このルールは大きなドローを過大評価します。15アウツなら60%になりますが、実際の値は {f15river} です。",
    "potH2": "ポットオッズ：コールすべきか？",
    "potP": "ポットオッズは、払わなければならない額と勝ち取れる額を比べるものです。ポットが100で相手が50をベットしたとします。50をコールして200のポットを取りに行くので、元を取るにはそのコールが 50 ÷ 200 = 25% より高い頻度で勝つ必要があります。フラッシュドローで残り1枚なら引ける確率は {f9one} なので、リバーだけが残った状態でベットにコールすると、長い目で見てチップを失います。フロップで All-In となり2枚とも残っているなら、同じドローが引ける確率は {f9river} で、コールする価値があります。",
    "matchH2": "プリフロップの対決",
    "matchP": "2つのスターティングハンドが、ボード5枚がすべて配られたときにどう戦うかを、起こりうる {boards} 通りのボードすべてで数えたものです。スートは少しだけ影響します。下のハンドは、スーテッドと示していない限り同じスートを共有していません。",
    "matchCols": [
      "ハンド",
      "相手",
      "勝ち",
      "引き分け",
      "負け"
    ],
    "startH2": "スターティングハンドの確率",
    "startP": "2枚のスターティングハンドは {combos} 通りあります。配られる頻度は次のとおりです：",
    "startCols": [
      "ハンド",
      "確率",
      "約何ハンドに1回"
    ],
    "starting": {
      "specificPair": "特定のポケットペア（例：エースのペア）",
      "anyPair": "いずれかのポケットペア",
      "specificNonPair": "特定のペアでないハンド（例：エース・キング）",
      "specificSuited": "特定のスーテッドハンド（例：エース・キングのスーテッド）",
      "anySuited": "同じスートの任意の2枚",
      "twoBroadway": "10以上のカード2枚"
    },
    "faqH2": "よくある質問",
    "faq": [
      [
        "ポーカーのアウツとは？",
        "デッキに残っていて、引けば最も強いハンドになるカードです。数えるのはまだ見ていないカードだけで、フロップでは47枚、ターンでは46枚です。"
      ],
      [
        "ポケットエースはキングのペアにどれくらい勝つ？",
        "およそ5回に4回です。ボード5枚がすべて配られた場合の勝率は {aakk}、キングが勝つのは {kkaa} です。"
      ],
      [
        "エース・キング対ペアは五分五分？",
        "ミドルペアが相手ならほぼそうです。クイーンのペアはエース・キングに対して {qqak} 勝ちます。スモールペアが相手ならさらに接戦で、2のペアの勝率は {22ak} です。"
      ],
      [
        "ポットオッズとは？",
        "コールの値段を、勝ち取れるポットと比べたものです。最終的なポットのうち自分が出す割合よりも勝つ確率が高ければ、コールは長い目で見て得になります。"
      ],
      [
        "PokerTH はゲーム中に勝率を表示してくれる？",
        "はい。「勝率」タブには、カードが開かれるたびに現在のあなたの最強の役と勝つ確率が表示されるので、テーブルで自分の読みを確かめられます。"
      ]
    ]
  },
  ka: {
    "title": "პოკერის ალბათობები — აუთები, ბანკის შანსები, ხელები | PokerTH",
    "desc": "Texas Hold’em-ის ალბათობები ზუსტად გამოთვლილი: აუთები და მათი მოსვლის შანსი, 2-ისა და 4-ის წესი, ბანკის შანსები და რამდენად ხშირად ჯობნის AA KK-ს ან QQ AK-ს.",
    "ldHeadline": "პოკერის ალბათობები: აუთები, ბანკის შანსები და პრეფლოპ დაპირისპირებები",
    "ldDesc": "Texas Hold’em-ის ალბათობები ზუსტად გამოთვლილი: აუთები, 2-ისა და 4-ის წესი, ბანკის შანსები და პრეფლოპ დაპირისპირებები.",
    "h1": "პოკერის ალბათობები: აუთები, ბანკის შანსები და პრეფლოპ დაპირისპირებები",
    "lead": "პოკერში კარგი გადაწყვეტილებები რამდენიმე რიცხვზეა დამოკიდებული: რამდენად სავარაუდოა, რომ თქვენი ხელი გაძლიერდება, რამდენი უნდა გადაიხადოთ ამის გასაგებად და როგორ დგას ორი ხელი ერთმანეთის წინააღმდეგ Flop-მდე. ამ გვერდზე ყველა რიცხვი ზუსტად არის გამოთვლილი და არა ცხრილიდან გადაწერილი.",
    "calc": {
      "h2": "პოკერის ალბათობების კალკულატორი",
      "intro": "აირჩიეთ თქვენი ორი კარტი და, თუ გსურთ, ბორდი და მოწინააღმდეგის ხელი. კალკულატორი ყველა დარჩენილ კარტს არიგებს — ზუსტად, როცა ეს შესაძლებელია, სხვა შემთხვევაში სიმულაციით — და აჩვენებს, რამდენად ხშირად იგებთ.",
      "you": "თქვენი ხელი",
      "board": "ბორდი",
      "opp": "მოწინააღმდეგე (არასავალდებულო)",
      "players": "მოწინააღმდეგეები",
      "pick": "შეეხეთ კარტს, რომ მონიშნულ ადგილას ჩასვათ; შეეხეთ ადგილს, რომ დაცალოთ.",
      "clear": "გასუფთავება",
      "win": "მოგება",
      "tie": "ფრე",
      "lose": "წაგება",
      "exact": "ზუსტი: ყველა {n} შესაძლო დარიგება.",
      "sim": "{n} შემთხვევითი დარიგების სიმულაცია.",
      "working": "გამოთვლა…",
      "need": "აირჩიეთ თქვენი ორი კარტი, რომ შანსები ნახოთ.",
      "boardHint": "ბორდზე ჯერ სამი კარტი იდება (Flop), შემდეგ ოთხი, შემდეგ ხუთი.",
      "oppHint": "აირჩიეთ მოწინააღმდეგის ორივე კარტი ან არცერთი.",
      "final": "თქვენი საბოლოო ხელი",
      "noscript": "კალკულატორს JavaScript სჭირდება. ქვემოთ მოცემული ცხრილები მის გარეშეც მუშაობს."
    },
    "outsH2": "აუთები: მოსვლის შანსი",
    "outsP": "აუთი არის დასტაში დარჩენილი კარტი, რომელიც თქვენს ხელს სავარაუდო გამარჯვებულად აქცევს. Flop-ზე 47 კარტი უცნობია: 9 აუთით Turn-ზე საჭირო კარტი შემთხვევების {f9turn}-ში მოდის, ხოლო River-მდე — როცა ორი კარტია მოსასვლელი — {f9river}-ში.",
    "outsCols": [
      "დროუ",
      "აუთები",
      "Turn",
      "River (Turn-იდან)",
      "Turn ან River (Flop-იდან)"
    ],
    "draws": {
      "gutshot": "შიდა სტრეიტ-დროუ (გატშოტი)",
      "twoPairFull": "ორი წყვილი ფულ ჰაუსამდე",
      "pairTrips": "ერთი წყვილი ორ წყვილამდე ან სამ ერთნაირამდე",
      "twoOver": "ორი ოვერკარტი წყვილამდე",
      "setFull": "სეტი ფულ ჰაუსამდე ან კარემდე",
      "oesd": "ღია სტრეიტ-დროუ",
      "flush": "ფლეშ-დროუ",
      "flushGut": "ფლეშ-დროუ და გატშოტი",
      "flushOesd": "ფლეშ-დროუ და ღია სტრეიტ-დროუ"
    },
    "outsNote": "ეს არის თქვენი რომელიმე აუთის მოსვლის შანსები. მათში არ შედის დამატებითი runner-runner ვარიანტები, ხოლო აუთი, რომელიც მოწინააღმდეგესაც უკეთეს ხელს აძლევს, სინამდვილეში აუთი არ არის.",
    "ruleH2": "2-ისა და 4-ის წესი",
    "ruleP": "სწრაფი შეფასება მაგიდასთან: Flop-ზე, როცა Turn-საც და River-საც ნახავთ, აუთები 4-ზე გაამრავლეთ, ხოლო როცა მხოლოდ ერთი კარტია მოსასვლელი — 2-ზე. ფლეშ-დროუ Flop-ზე იძლევა 9 × 4 = 36%-ს, ზუსტი მნიშვნელობა კი {f9river}-ია. წესი დიდ დროუებს ზედმეტად აფასებს: 15 აუთი იძლევა 60%-ს, რეალური მაჩვენებელი კი {f15river}-ია.",
    "potH2": "ბანკის შანსები: გააკეთოთ თუ არა Call?",
    "potP": "ბანკის შანსები ადარებს იმას, რაც უნდა გადაიხადოთ, იმასთან, რისი მოგებაც შეგიძლიათ. ბანკში 100-ია და მოწინააღმდეგე 50-ს დებს: თქვენ Call-ს აკეთებთ 50-ით, რომ მოიგოთ 200-იანი ბანკი, ამიტომ, რომ Call-მა თავი გაიმართლოს, შემთხვევების 50 ÷ 200 = 25%-ზე მეტში უნდა მოიგოს. ფლეშ-დროუთი, როცა ერთი კარტია მოსასვლელი, საჭირო კარტი შემთხვევების {f9one}-ში მოდის, ამიტომ ფსონზე Call, როცა მხოლოდ River არის დარჩენილი, გრძელვადიან პერსპექტივაში ჩიპებს გაკარგვინებთ. All-In Flop-ზე, როცა ორივე კარტია მოსასვლელი, იგივე დროუ {f9river}-ში ხვდება და Call ღირს.",
    "matchH2": "პრეფლოპ დაპირისპირებები",
    "matchP": "როგორ გამოდიან ორი საწყისი ხელი ერთმანეთის წინააღმდეგ, როცა ბორდის ხუთივე კარტი დარიგდება — დათვლილი ყველა {boards} შესაძლო ბორდზე. მასტებს მცირე მნიშვნელობა აქვს: ქვემოთ მოცემულ ხელებს საერთო მასტი არ აქვთ, თუ ერთი მასტისად არ არის ნაჩვენები.",
    "matchCols": [
      "ხელი",
      "წინააღმდეგ",
      "იგებს",
      "ფრე",
      "აგებს"
    ],
    "startH2": "საწყისი ხელების ალბათობები",
    "startP": "არსებობს {combos} განსხვავებული ორკარტიანი საწყისი ხელი. რამდენად ხშირად გხვდებათ:",
    "startCols": [
      "ხელი",
      "შანსი",
      "დაახლოებით ერთი ხელი ყოველ"
    ],
    "starting": {
      "specificPair": "კონკრეტული პოკეტ-პეარი, მაგალითად ტუზები",
      "anyPair": "ნებისმიერი პოკეტ-პეარი",
      "specificNonPair": "კონკრეტული ხელი წყვილის გარეშე, მაგალითად ტუზი-მეფე",
      "specificSuited": "კონკრეტული ერთი მასტის ხელი, მაგალითად ერთი მასტის ტუზი-მეფე",
      "anySuited": "ნებისმიერი ორი ერთი მასტის კარტი",
      "twoBroadway": "ორი კარტი ათიანიდან ზემოთ"
    },
    "faqH2": "კითხვები",
    "faq": [
      [
        "რა არის აუთები პოკერში?",
        "დასტაში დარჩენილი კარტები, რომლებიც საუკეთესო ხელს მოგცემთ. დათვალეთ მხოლოდ ის კარტები, რომლებიც არ გინახავთ: Flop-ზე 47, Turn-ზე 46."
      ],
      [
        "რამდენად ხშირად ჯობნის ტუზების წყვილი მეფეებს?",
        "დაახლოებით ხუთიდან ოთხჯერ: {aakk}, როცა ბორდის ხუთივე კარტი დარიგდება, მეფეები კი {kkaa}-ს იგებენ."
      ],
      [
        "ტუზი-მეფე წყვილის წინააღმდეგ — მონეტის აგდებაა?",
        "თითქმის, საშუალო წყვილის წინააღმდეგ: ქალები ტუზი-მეფის წინააღმდეგ {qqak}-ს იგებენ. პატარა წყვილის წინააღმდეგ კიდევ უფრო თანაბარია — ორიანები {22ak}-ს იგებენ."
      ],
      [
        "რა არის ბანკის შანსები?",
        "Call-ის ფასი იმ ბანკთან შედარებით, რომლის მოგებაც შეგიძლიათ. თუ თქვენი მოგების შანსი მეტია, ვიდრე საბოლოო ბანკში თქვენ მიერ შეტანილი წილი, Call დროთა განმავლობაში თავს იმართლებს."
      ],
      [
        "აჩვენებს თუ არა PokerTH ჩემს შანსებს თამაშის დროს?",
        "დიახ. ჩანართი ალბათობები კარტების გახსნისას გიჩვენებთ თქვენს მიმდინარე საუკეთესო ხელს და მოგების შანსს, ასე რომ, მაგიდასთანვე შეგიძლიათ საკუთარი მსჯელობის შემოწმება."
      ]
    ]
  },
  kk: {
    "title": "Покер ықтималдығы — ауттар, банк мүмкіндіктері, жекпе-жек | PokerTH",
    "desc": "Texas Hold’em ықтималдықтары дәл есептелген: ауттар мен оларды ұстау мүмкіндігі, 2 мен 4 ережесі, банк мүмкіндіктері, AA KK-ны, QQ AK-ны қаншалықты жиі жеңетіні.",
    "ldHeadline": "Покер ықтималдығы: ауттар, банк мүмкіндіктері және префлоп жекпе-жектері",
    "ldDesc": "Texas Hold’em ықтималдықтары дәл есептелген: ауттар, 2 мен 4 ережесі, банк мүмкіндіктері және префлоп жекпе-жектері.",
    "h1": "Покер ықтималдығы: ауттар, банк мүмкіндіктері және префлоп жекпе-жектері",
    "lead": "Покердегі дұрыс шешімдер бірнеше санға келіп тіреледі: қолыңыздың жақсару ықтималдығы, мұны білу үшін қанша төлеу керектігі және флопқа дейін екі қолдың бір-біріне қарсы қалай тұратыны. Бұл беттегі әр сан кестеден көшірілмей, дәл есептелген.",
    "calc": {
      "h2": "Покер ықтималдығы калькуляторы",
      "intro": "Екі картаңызды және, қаласаңыз, бордты әрі қарсыластың қолын таңдаңыз. Калькулятор қалған барлық картаны таратып шығады — мүмкін болған сайын дәл, әйтпесе симуляциямен — және қаншалықты жиі ұтатыныңызды көрсетеді.",
      "you": "Сіздің қолыңыз",
      "board": "Борд",
      "opp": "Қарсылас (міндетті емес)",
      "players": "Қарсыластар",
      "pick": "Картаны белгіленген ұяшыққа қою үшін оны түртіңіз; ұяшықты босату үшін ұяшықты түртіңіз.",
      "clear": "Тазалау",
      "win": "Жеңіс",
      "tie": "Тең",
      "lose": "Жеңіліс",
      "exact": "Дәл: {n} мүмкін таратудың әрқайсысы.",
      "sim": "{n} кездейсоқ тарату симуляциясы.",
      "working": "Есептелуде…",
      "need": "Мүмкіндіктеріңізді көру үшін екі картаңызды таңдаңыз.",
      "boardHint": "Бордқа үш карта (флоп), содан кейін төрт, содан кейін бес карта қойылады.",
      "oppHint": "Қарсыластың екі картасын да таңдаңыз немесе ешқайсысын таңдамаңыз.",
      "final": "Соңғы қолыңыз",
      "noscript": "Калькуляторға JavaScript қажет. Төмендегі кестелер онсыз да жұмыс істейді."
    },
    "outsH2": "Ауттар: ұстау мүмкіндігіңіз",
    "outsP": "Аут — колодада әлі тұрған, қолыңызды ықтимал жеңімпазға айналдыратын карта. Флопта 47 карта көрінбейді: 9 аутпен бір карта тёрнде {f9turn} жағдайда түседі, ал риверге дейін — екі карта келетін болса — {f9river} жағдайда.",
    "outsCols": [
      "Дро",
      "Ауттар",
      "Тёрн",
      "Ривер (тёрннен)",
      "Тёрн не ривер (флоптан)"
    ],
    "draws": {
      "gutshot": "Ішкі стрит дросы (гатшот)",
      "twoPairFull": "Екі жұптан Фулл-хаусқа",
      "pairTrips": "Жұптан екі жұпқа не үштікке",
      "twoOver": "Екі овер-картадан жұпқа",
      "setFull": "Сеттен Фулл-хаусқа не Кареге",
      "oesd": "Ашық стрит дросы",
      "flush": "Флеш дросы",
      "flushGut": "Флеш дросы және гатшот",
      "flushOesd": "Флеш дросы және ашық стрит дросы"
    },
    "outsNote": "Бұл — ауттарыңыздың бірін ұстау мүмкіндіктері. Оларға раннер-раннер қосымшалары кірмейді, ал қарсыласқа да мықтырақ қол беретін аут шын мәнінде аут емес.",
    "ruleH2": "2 мен 4 ережесі",
    "ruleP": "Үстел басындағы жылдам бағалау: тёрнді де, риверді де көретін болсаңыз, флопта ауттарыңызды 4-ке, ал тек бір карта қалғанда 2-ге көбейтіңіз. Флоптағы флеш дросы 9 × 4 = 36% береді, ал дәл мәні — {f9river}. Ереже үлкен дроларды асыра бағалайды: 15 аут 60% береді, нақты сан — {f15river}.",
    "potH2": "Банк мүмкіндіктері: теңестіру керек пе?",
    "potP": "Банк мүмкіндіктері сіз төлеуге тиіс соманы ұта алатын сомамен салыстырады. Банкте 100, қарсылас 50 қояды: сіз 200 банкті ұту үшін 50 төлеп теңестіресіз, сондықтан теңестіру ақталуы үшін ол жағдайлардың 50 ÷ 200 = 25%-ынан көбінде ұтуы керек. Флеш дросымен және бір карта қалғанда сіз {f9one} жағдайда ұстайсыз, сондықтан тек ривер қалғанда ставканы теңестіру ұзақ мерзімде фишка жоғалтады. Флопта All-In болса, екі карта да келетіндіктен, сол дро {f9river} жағдайда түседі, және теңестіру тиімді.",
    "matchH2": "Префлоп жекпе-жектері",
    "matchP": "Бордтың бес картасы түгел таратылғанда екі бастапқы қолдың бір-біріне қарсы қалай ойнайтыны, {boards} мүмкін бордтың әрқайсысы бойынша есептелген. Масть сәл маңызды: төмендегі қолдардың, бір масть деп көрсетілмесе, ортақ мастьі жоқ.",
    "matchCols": [
      "Қол",
      "Қарсы",
      "Ұтады",
      "Тең",
      "Ұтылады"
    ],
    "startH2": "Бастапқы қолдардың ықтималдығы",
    "startP": "Екі картадан тұратын {combos} түрлі бастапқы қол бар. Олардың қаншалықты жиі түсетіні:",
    "startCols": [
      "Қол",
      "Ықтималдық",
      "Шамамен неше қолда бір рет"
    ],
    "starting": {
      "specificPair": "Белгілі бір қалталық жұп, мысалы тұздар",
      "anyPair": "Кез келген қалталық жұп",
      "specificNonPair": "Белгілі бір жұпсыз қол, мысалы тұз-король",
      "specificSuited": "Белгілі бір бір масть қол, мысалы бір масть тұз-король",
      "anySuited": "Кез келген бір масть екі карта",
      "twoBroadway": "Ондық немесе одан жоғары екі карта"
    },
    "faqH2": "Сұрақтар",
    "faq": [
      [
        "Покердегі ауттар деген не?",
        "Колодада қалған, сізге ең үздік қол беретін карталар. Тек көрмеген карталарыңызды санаңыз: флопта 47, тёрнде 46."
      ],
      [
        "Қалталық тұздар корольдерді қаншалықты жиі жеңеді?",
        "Шамамен бес реттің төртеуінде: бордтың бес картасы түгел таратылғанда {aakk}, ал корольдер {kkaa} жағдайда ұтады."
      ],
      [
        "Тұз-король жұпқа қарсы — тиын лақтыру ма?",
        "Орта жұпқа қарсы — шамамен иә: дамалар тұз-корольге қарсы {qqak} жағдайда ұтады. Кіші жұпқа қарсы одан да тең — екілер {22ak} жағдайда ұтады."
      ],
      [
        "Банк мүмкіндіктері деген не?",
        "Теңестірудің бағасы ұта алатын банкпен салыстырғанда. Егер ұту мүмкіндігіңіз соңғы банктегі өзіңіз салған үлестен жоғары болса, теңестіру уақыт өте келе ақталады."
      ],
      [
        "PokerTH ойын барысында менің мүмкіндіктерімді көрсете ме?",
        "Иә. «Ықтималдық» қойындысы карталар ашылған сайын ағымдағы ең үздік қолыңызды және ұту мүмкіндігіңізді атап тұрады, сондықтан үстел басында өз пайымыңызды тексере аласыз."
      ]
    ]
  },
  km: {
    "title": "ឱកាសបៀ — Outs, Pot odds និងការប្រកួតដៃ | PokerTH",
    "desc": "ឱកាស Texas Hold’em គណនាយ៉ាងជាក់លាក់៖ outs និងឱកាសចេញត្រូវ ច្បាប់ 2 និង 4, pot odds និងញឹកញាប់ប៉ុណ្ណាដែល AA ឈ្នះ KK ឬ QQ ឈ្នះ AK។",
    "ldHeadline": "ឱកាសបៀ៖ outs, pot odds និងការប្រកួតដៃមុន flop",
    "ldDesc": "ឱកាស Texas Hold’em គណនាយ៉ាងជាក់លាក់៖ outs ច្បាប់ 2 និង 4, pot odds និងការប្រកួតដៃមុន flop។",
    "h1": "ឱកាសបៀ៖ outs, pot odds និងការប្រកួតដៃមុន flop",
    "lead": "ការសម្រេចចិត្តល្អក្នុងបៀ ពឹងលើលេខតែប៉ុន្មាន៖ ដៃរបស់អ្នកមានឱកាសប៉ុណ្ណាដើម្បីប្រសើរឡើង អ្នកត្រូវបង់ប៉ុន្មានដើម្បីដឹង និងដៃពីរប្រៀបធៀបគ្នាយ៉ាងណាមុន flop។ គ្រប់តួលេខនៅលើទំព័រនេះត្រូវបានគណនាយ៉ាងជាក់លាក់ មិនមែនចម្លងពីតារាងទេ។",
    "calc": {
      "h2": "ម៉ាស៊ីនគណនាឱកាសបៀ",
      "intro": "ជ្រើសបៀពីរសន្លឹករបស់អ្នក ហើយបើចង់ ជ្រើសក្ដារ និងដៃរបស់គូប្រកួតម្នាក់ផង។ ម៉ាស៊ីនគណនាចែកបៀដែលនៅសល់ទាំងអស់ — យ៉ាងជាក់លាក់ពេលណាដែលអាច បើមិនដូច្នោះទេដោយការក្លែងធ្វើ — ហើយបង្ហាញថាអ្នកឈ្នះញឹកញាប់ប៉ុណ្ណា។",
      "you": "ដៃរបស់អ្នក",
      "board": "ក្ដារ",
      "opp": "គូប្រកួត (ស្រេចចិត្ត)",
      "players": "គូប្រកួត",
      "pick": "ប៉ះបៀមួយសន្លឹកដើម្បីដាក់វាក្នុងប្រអប់ដែលបានរំលេច; ប៉ះប្រអប់មួយដើម្បីសម្អាតវា។",
      "clear": "សម្អាត",
      "win": "ឈ្នះ",
      "tie": "ស្មើ",
      "lose": "ចាញ់",
      "exact": "ជាក់លាក់៖ គ្រប់ការចែកដែលអាចមានទាំង {n}។",
      "sim": "ការក្លែងធ្វើនៃការចែកចៃដន្យ {n} ដង។",
      "working": "កំពុងគណនា…",
      "need": "ជ្រើសបៀពីរសន្លឹករបស់អ្នកដើម្បីមើលឱកាសរបស់អ្នក។",
      "boardHint": "ក្ដារយកបៀបីសន្លឹក (flop) បន្ទាប់មកបួន រួចប្រាំ។",
      "oppHint": "ជ្រើសបៀទាំងពីរសន្លឹករបស់គូប្រកួត ឬមិនជ្រើសសោះ។",
      "final": "ដៃចុងក្រោយរបស់អ្នក",
      "noscript": "ម៉ាស៊ីនគណនាត្រូវការ JavaScript។ តារាងខាងក្រោមដំណើរការបានដោយគ្មានវា។"
    },
    "outsH2": "Outs៖ ឱកាសចេញត្រូវរបស់អ្នក",
    "outsP": "Out គឺជាបៀដែលនៅក្នុងឈុតនៅឡើយ ហើយធ្វើឱ្យដៃរបស់អ្នកក្លាយជាដៃដែលទំនងជាឈ្នះ។ នៅ flop មានបៀ 47 សន្លឹកដែលមិនទាន់ឃើញ៖ ជាមួយ outs 9 បៀមួយសន្លឹកចេញត្រូវនៅ turn {f9turn} នៃពេលវេលា ហើយរហូតដល់ river — បៀពីរសន្លឹកនៅត្រូវមក — {f9river}។",
    "outsCols": [
      "Draw",
      "Outs",
      "Turn",
      "River (ពី turn)",
      "Turn ឬ river (ពី flop)"
    ],
    "draws": {
      "gutshot": "Straight draw ខាងក្នុង (gutshot)",
      "twoPairFull": "Two Pair ទៅ Full House",
      "pairTrips": "One Pair ទៅ Two Pair ឬ Three of a Kind",
      "twoOver": "Overcard ពីរ ទៅ One Pair",
      "setFull": "Set ទៅ Full House ឬ Four of a Kind",
      "oesd": "Straight draw ចំហពីរចុង",
      "flush": "Flush draw",
      "flushGut": "Flush draw និង gutshot",
      "flushOesd": "Flush draw និង straight draw ចំហពីរចុង"
    },
    "outsNote": "ទាំងនេះជាឱកាសចាប់បាន out មួយរបស់អ្នក។ វាមិនរាប់បន្ថែម runner-runner ទេ ហើយ out ដែលផ្ដល់ដៃល្អជាងឱ្យគូប្រកួតផងដែរ មិនមែនជា out ពិតប្រាកដទេ។",
    "ruleH2": "ច្បាប់ 2 និង 4",
    "ruleP": "ការប៉ាន់ស្មានរហ័សនៅតុ៖ គុណ outs របស់អ្នកនឹង 4 នៅ flop ពេលអ្នកនឹងឃើញទាំង turn និង river ហើយនឹង 2 ពេលនៅសល់តែមួយសន្លឹកត្រូវមក។ Flush draw នៅ flop គឺ 9 × 4 = 36% ធៀបនឹង {f9river} ជាក់លាក់។ ច្បាប់នេះប៉ាន់ស្មាន draw ធំៗលើសការពិត៖ outs 15 ផ្ដល់ 60% ខណៈតួលេខពិតគឺ {f15river}។",
    "potH2": "Pot odds៖ តើអ្នកគួរ Call ទេ?",
    "potP": "Pot odds ប្រៀបធៀបអ្វីដែលអ្នកត្រូវបង់ ជាមួយអ្វីដែលអ្នកអាចឈ្នះ។ Pot មាន 100 ហើយគូប្រកួតភ្នាល់ 50៖ អ្នក call 50 ដើម្បីឈ្នះ pot 200 ដូច្នេះការ call ត្រូវឈ្នះលើសពី 50 ÷ 200 = 25% នៃពេលវេលា ទើបចំណេញ។ ជាមួយ flush draw និងបៀមួយសន្លឹកនៅត្រូវមក អ្នកចេញត្រូវ {f9one} នៃពេលវេលា ដូច្នេះការ call ការភ្នាល់ពេលនៅសល់តែ river ធ្វើឱ្យខាតស៊ីបក្នុងរយៈពេលវែង។ All-in នៅ flop ដោយបៀទាំងពីរសន្លឹកនៅត្រូវមក draw ដដែលចេញត្រូវ {f9river} ហើយការ call គឺសមនឹងធ្វើ។",
    "matchH2": "ការប្រកួតដៃមុន flop",
    "matchP": "ដៃចាប់ផ្ដើមពីរប្រឆាំងគ្នាយ៉ាងណា នៅពេលបៀក្ដារទាំងប្រាំសន្លឹកត្រូវបានចែក ដោយរាប់លើគ្រប់ក្ដារដែលអាចមានទាំង {boards}។ ពណ៌មានឥទ្ធិពលបន្តិច៖ ដៃខាងក្រោមមិនមានពណ៌រួមគ្នាទេ លុះត្រាតែបង្ហាញថាពណ៌ដូចគ្នា។",
    "matchCols": [
      "ដៃ",
      "ប្រឆាំង",
      "ឈ្នះ",
      "ស្មើ",
      "ចាញ់"
    ],
    "startH2": "ឱកាសដៃចាប់ផ្ដើម",
    "startP": "មានដៃចាប់ផ្ដើមពីរសន្លឹកខុសៗគ្នា {combos}។ ញឹកញាប់ប៉ុណ្ណាដែលអ្នកទទួលបាន៖",
    "startCols": [
      "ដៃ",
      "ឱកាស",
      "ប្រហែលមួយដៃក្នុងចំណោម"
    ],
    "starting": {
      "specificPair": "គូ pocket ជាក់លាក់មួយ ដូចជា AA",
      "anyPair": "គូ pocket ណាមួយ",
      "specificNonPair": "ដៃមិនមែនគូជាក់លាក់មួយ ដូចជា A-K",
      "specificSuited": "ដៃពណ៌ដូចគ្នាជាក់លាក់មួយ ដូចជា A-K ពណ៌ដូចគ្នា",
      "anySuited": "បៀពីរសន្លឹកណាក៏ដោយដែលពណ៌ដូចគ្នា",
      "twoBroadway": "បៀពីរសន្លឹក 10 ឬខ្ពស់ជាង"
    },
    "faqH2": "សំណួរ",
    "faq": [
      [
        "តើ outs ក្នុងបៀជាអ្វី?",
        "បៀដែលនៅសល់ក្នុងឈុត ដែលនឹងផ្ដល់ដៃល្អបំផុតឱ្យអ្នក។ រាប់តែបៀដែលអ្នកមិនទាន់ឃើញ៖ 47 នៅ flop, 46 នៅ turn។"
      ],
      [
        "តើ AA ឈ្នះ KK ញឹកញាប់ប៉ុណ្ណា?",
        "ប្រហែលបួនដងក្នុងប្រាំ៖ {aakk} នៅពេលបៀក្ដារទាំងប្រាំសន្លឹកត្រូវបានចែក ហើយ KK ឈ្នះ {kkaa}។"
      ],
      [
        "តើ A-K ប្រឆាំងនឹងគូមួយ ដូចការបោះកាក់មែនទេ?",
        "ស្ទើរតែ ប្រឆាំងនឹងគូកណ្ដាល៖ QQ ឈ្នះ {qqak} ប្រឆាំងនឹង A-K។ ប្រឆាំងនឹងគូតូច វាកាន់តែជិតគ្នា — 22 ឈ្នះ {22ak}។"
      ],
      [
        "តើ pot odds ជាអ្វី?",
        "តម្លៃនៃការ call ធៀបនឹង pot ដែលអ្នកអាចឈ្នះ។ ប្រសិនបើឱកាសឈ្នះរបស់អ្នកខ្ពស់ជាងចំណែកនៃ pot ចុងក្រោយដែលអ្នកដាក់ចូល ការ call នឹងចំណេញតាមរយៈពេល។"
      ],
      [
        "តើ PokerTH បង្ហាញឱកាសរបស់ខ្ញុំក្នុងពេលលេងទេ?",
        "បាទ/ចាស។ ផ្ទាំង “ឱកាស” ប្រាប់ឈ្មោះដៃល្អបំផុតបច្ចុប្បន្នរបស់អ្នក និងឱកាសឈ្នះរបស់អ្នក នៅពេលបៀចេញ ដូច្នេះអ្នកអាចពិនិត្យការគិតរបស់ខ្លួនឯងនៅតុ។"
      ]
    ]
  },
  kn: {
    "title": "ಪೋಕರ್ ಆಡ್ಸ್ ಚಾರ್ಟ್ — ಔಟ್ಸ್, ಪಾಟ್ ಆಡ್ಸ್, ಹ್ಯಾಂಡ್ ಮುಖಾಮುಖಿ | PokerTH",
    "desc": "ನಿಖರವಾಗಿ ಲೆಕ್ಕಹಾಕಿದ Texas Hold’em ಆಡ್ಸ್: ಔಟ್ಸ್ ಮತ್ತು ಅವು ಬರುವ ಸಾಧ್ಯತೆ, 2 ಮತ್ತು 4 ರ ನಿಯಮ, ಪಾಟ್ ಆಡ್ಸ್, ಮತ್ತು AA ಎಷ್ಟು ಬಾರಿ KK ಅನ್ನು, QQ ಎಷ್ಟು ಬಾರಿ AK ಅನ್ನು ಸೋಲಿಸುತ್ತದೆ.",
    "ldHeadline": "ಪೋಕರ್ ಆಡ್ಸ್: ಔಟ್ಸ್, ಪಾಟ್ ಆಡ್ಸ್ ಮತ್ತು ಪ್ರೀ-ಫ್ಲಾಪ್ ಮುಖಾಮುಖಿಗಳು",
    "ldDesc": "ನಿಖರವಾಗಿ ಲೆಕ್ಕಹಾಕಿದ Texas Hold’em ಆಡ್ಸ್: ಔಟ್ಸ್, 2 ಮತ್ತು 4 ರ ನಿಯಮ, ಪಾಟ್ ಆಡ್ಸ್ ಮತ್ತು ಪ್ರೀ-ಫ್ಲಾಪ್ ಮುಖಾಮುಖಿಗಳು.",
    "h1": "ಪೋಕರ್ ಆಡ್ಸ್: ಔಟ್ಸ್, ಪಾಟ್ ಆಡ್ಸ್ ಮತ್ತು ಪ್ರೀ-ಫ್ಲಾಪ್ ಮುಖಾಮುಖಿಗಳು",
    "lead": "ಒಳ್ಳೆಯ ಪೋಕರ್ ನಿರ್ಧಾರಗಳು ಕೆಲವೇ ಸಂಖ್ಯೆಗಳನ್ನು ಅವಲಂಬಿಸಿವೆ: ನಿಮ್ಮ ಹ್ಯಾಂಡ್ ಸುಧಾರಿಸುವ ಸಾಧ್ಯತೆ ಎಷ್ಟು, ಅದನ್ನು ತಿಳಿಯಲು ನೀವು ಎಷ್ಟು ಪಾವತಿಸಬೇಕು, ಮತ್ತು ಫ್ಲಾಪ್‌ಗೆ ಮೊದಲು ಎರಡು ಹ್ಯಾಂಡ್‌ಗಳು ಪರಸ್ಪರ ಎದುರು ಹೇಗೆ ನಿಲ್ಲುತ್ತವೆ. ಈ ಪುಟದ ಪ್ರತಿ ಅಂಕಿಯನ್ನೂ ನಿಖರವಾಗಿ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ, ಯಾವುದೋ ಚಾರ್ಟ್‌ನಿಂದ ನಕಲಿಸಲಾಗಿಲ್ಲ.",
    "calc": {
      "h2": "ಪೋಕರ್ ಆಡ್ಸ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
      "intro": "ನಿಮ್ಮ ಎರಡು ಕಾರ್ಡ್‌ಗಳನ್ನು ಆರಿಸಿ, ಬೇಕಿದ್ದರೆ ಬೋರ್ಡ್ ಮತ್ತು ಎದುರಾಳಿಯ ಹ್ಯಾಂಡ್ ಅನ್ನೂ ಆರಿಸಿ. ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಉಳಿದ ಪ್ರತಿ ಕಾರ್ಡ್ ಅನ್ನೂ ಹಂಚುತ್ತದೆ — ಸಾಧ್ಯವಾದಾಗಲೆಲ್ಲ ನಿಖರವಾಗಿ, ಇಲ್ಲದಿದ್ದರೆ ಸಿಮ್ಯುಲೇಶನ್ ಮೂಲಕ — ಮತ್ತು ನೀವು ಎಷ್ಟು ಬಾರಿ ಗೆಲ್ಲುತ್ತೀರಿ ಎಂದು ತೋರಿಸುತ್ತದೆ.",
      "you": "ನಿಮ್ಮ ಹ್ಯಾಂಡ್",
      "board": "ಬೋರ್ಡ್",
      "opp": "ಎದುರಾಳಿ (ಐಚ್ಛಿಕ)",
      "players": "ಎದುರಾಳಿಗಳು",
      "pick": "ಹೈಲೈಟ್ ಮಾಡಿದ ಸ್ಥಳದಲ್ಲಿ ಇಡಲು ಕಾರ್ಡ್ ಅನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ; ಸ್ಥಳವನ್ನು ಖಾಲಿ ಮಾಡಲು ಅದನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.",
      "clear": "ತೆರವುಗೊಳಿಸಿ",
      "win": "ಗೆಲುವು",
      "tie": "ಟೈ",
      "lose": "ಸೋಲು",
      "exact": "ನಿಖರ: ಸಾಧ್ಯವಿರುವ ಎಲ್ಲ {n} ಹಂಚಿಕೆಗಳು.",
      "sim": "{n} ಯಾದೃಚ್ಛಿಕ ಹಂಚಿಕೆಗಳ ಸಿಮ್ಯುಲೇಶನ್.",
      "working": "ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ…",
      "need": "ನಿಮ್ಮ ಆಡ್ಸ್ ನೋಡಲು ನಿಮ್ಮ ಎರಡು ಕಾರ್ಡ್‌ಗಳನ್ನು ಆರಿಸಿ.",
      "boardHint": "ಬೋರ್ಡ್‌ಗೆ ಮೊದಲು ಮೂರು ಕಾರ್ಡ್‌ಗಳು (ಫ್ಲಾಪ್), ನಂತರ ನಾಲ್ಕು, ನಂತರ ಐದು.",
      "oppHint": "ಎದುರಾಳಿಯ ಎರಡೂ ಕಾರ್ಡ್‌ಗಳನ್ನು ಆರಿಸಿ, ಅಥವಾ ಯಾವುದನ್ನೂ ಬೇಡ.",
      "final": "ನಿಮ್ಮ ಅಂತಿಮ ಹ್ಯಾಂಡ್",
      "noscript": "ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗೆ JavaScript ಬೇಕು. ಕೆಳಗಿನ ಕೋಷ್ಟಕಗಳು ಅದಿಲ್ಲದೆಯೂ ಕೆಲಸ ಮಾಡುತ್ತವೆ."
    },
    "outsH2": "ಔಟ್ಸ್: ಕಾರ್ಡ್ ಬರುವ ನಿಮ್ಮ ಸಾಧ್ಯತೆ",
    "outsP": "ಔಟ್ ಎಂದರೆ ಡೆಕ್‌ನಲ್ಲಿ ಇನ್ನೂ ಇರುವ, ನಿಮ್ಮ ಹ್ಯಾಂಡ್ ಅನ್ನು ಬಹುಶಃ ಗೆಲ್ಲುವ ಹ್ಯಾಂಡ್ ಆಗಿ ಮಾಡುವ ಕಾರ್ಡ್. ಫ್ಲಾಪ್‌ನಲ್ಲಿ 47 ಕಾರ್ಡ್‌ಗಳು ಕಾಣದೆ ಇರುತ್ತವೆ: 9 ಔಟ್ಸ್ ಇದ್ದರೆ, ಟರ್ನ್‌ನಲ್ಲಿ ಒಂದು ಕಾರ್ಡ್ ಬರುವ ಸಾಧ್ಯತೆ {f9turn}, ಮತ್ತು ರಿವರ್‌ವರೆಗೆ — ಇನ್ನೂ ಎರಡು ಕಾರ್ಡ್‌ಗಳು ಬರಲಿರುವಾಗ — {f9river}.",
    "outsCols": [
      "ಡ್ರಾ",
      "ಔಟ್ಸ್",
      "ಟರ್ನ್",
      "ರಿವರ್ (ಟರ್ನ್‌ನಿಂದ)",
      "ಟರ್ನ್ ಅಥವಾ ರಿವರ್ (ಫ್ಲಾಪ್‌ನಿಂದ)"
    ],
    "draws": {
      "gutshot": "ಒಳಗಿನ ಸ್ಟ್ರೈಟ್ ಡ್ರಾ (ಗಟ್‌ಶಾಟ್)",
      "twoPairFull": "Two Pair ನಿಂದ Full House",
      "pairTrips": "One Pair ನಿಂದ Two Pair ಅಥವಾ Three of a Kind",
      "twoOver": "ಎರಡು ಓವರ್‌ಕಾರ್ಡ್‌ಗಳಿಂದ ಜೋಡಿ",
      "setFull": "ಸೆಟ್‌ನಿಂದ Full House ಅಥವಾ Four of a Kind",
      "oesd": "ಓಪನ್-ಎಂಡೆಡ್ ಸ್ಟ್ರೈಟ್ ಡ್ರಾ",
      "flush": "ಫ್ಲಶ್ ಡ್ರಾ",
      "flushGut": "ಫ್ಲಶ್ ಡ್ರಾ ಮತ್ತು ಗಟ್‌ಶಾಟ್",
      "flushOesd": "ಫ್ಲಶ್ ಡ್ರಾ ಮತ್ತು ಓಪನ್-ಎಂಡೆಡ್ ಸ್ಟ್ರೈಟ್ ಡ್ರಾ"
    },
    "outsNote": "ಇವು ನಿಮ್ಮ ಔಟ್ಸ್‌ಗಳಲ್ಲಿ ಒಂದು ಬರುವ ಸಾಧ್ಯತೆಗಳು. ರನ್ನರ್-ರನ್ನರ್ ಹೆಚ್ಚುವರಿಗಳನ್ನು ಇವು ಒಳಗೊಂಡಿಲ್ಲ, ಮತ್ತು ಎದುರಾಳಿಗೂ ಉತ್ತಮ ಹ್ಯಾಂಡ್ ನೀಡುವ ಔಟ್ ನಿಜವಾಗಿ ಔಟ್ ಅಲ್ಲ.",
    "ruleH2": "2 ಮತ್ತು 4 ರ ನಿಯಮ",
    "ruleP": "ಟೇಬಲ್‌ನಲ್ಲಿ ತ್ವರಿತ ಅಂದಾಜು: ಟರ್ನ್ ಮತ್ತು ರಿವರ್ ಎರಡನ್ನೂ ನೀವು ನೋಡಲಿರುವಾಗ ಫ್ಲಾಪ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಔಟ್ಸ್ ಅನ್ನು 4 ರಿಂದ ಗುಣಿಸಿ, ಒಂದೇ ಕಾರ್ಡ್ ಬರಲಿರುವಾಗ 2 ರಿಂದ ಗುಣಿಸಿ. ಫ್ಲಾಪ್‌ನಲ್ಲಿ ಫ್ಲಶ್ ಡ್ರಾ 9 × 4 = 36%, ನಿಖರ ಅಂಕಿ {f9river}. ದೊಡ್ಡ ಡ್ರಾಗಳನ್ನು ಈ ನಿಯಮ ಹೆಚ್ಚು ಅಂದಾಜಿಸುತ್ತದೆ: 15 ಔಟ್ಸ್ 60% ಕೊಡುತ್ತವೆ, ನಿಜವಾದ ಅಂಕಿ {f15river}.",
    "potH2": "ಪಾಟ್ ಆಡ್ಸ್: ನೀವು Call ಮಾಡಬೇಕೇ?",
    "potP": "ಪಾಟ್ ಆಡ್ಸ್ ನೀವು ಪಾವತಿಸಬೇಕಾದುದನ್ನು ನೀವು ಗೆಲ್ಲಬಹುದಾದುದರೊಂದಿಗೆ ಹೋಲಿಸುತ್ತವೆ. ಪಾಟ್‌ನಲ್ಲಿ 100 ಇದೆ ಮತ್ತು ಎದುರಾಳಿ 50 ಬೆಟ್ ಮಾಡುತ್ತಾರೆ: 200 ರ ಪಾಟ್ ಗೆಲ್ಲಲು ನೀವು 50 call ಮಾಡುತ್ತೀರಿ, ಹಾಗಾಗಿ ಲಾಭವಾಗಲು ಆ Call 50 ÷ 200 = 25% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಬಾರಿ ಗೆಲ್ಲಬೇಕು. ಫ್ಲಶ್ ಡ್ರಾ ಇದ್ದು ಇನ್ನೊಂದೇ ಕಾರ್ಡ್ ಬರಲಿರುವಾಗ ನಿಮಗೆ ಕಾರ್ಡ್ ಬರುವ ಸಾಧ್ಯತೆ {f9one}, ಆದ್ದರಿಂದ ರಿವರ್ ಮಾತ್ರ ಉಳಿದಿರುವಾಗ ಬೆಟ್ ಅನ್ನು call ಮಾಡಿದರೆ ದೀರ್ಘಾವಧಿಯಲ್ಲಿ ಚಿಪ್‌ಗಳು ನಷ್ಟವಾಗುತ್ತವೆ. ಫ್ಲಾಪ್‌ನಲ್ಲೇ All-In ಆದರೆ, ಎರಡೂ ಕಾರ್ಡ್‌ಗಳು ಬರಲಿರುವಾಗ, ಅದೇ ಡ್ರಾ ಬರುವ ಸಾಧ್ಯತೆ {f9river}, ಮತ್ತು ಆ Call ಯೋಗ್ಯ.",
    "matchH2": "ಪ್ರೀ-ಫ್ಲಾಪ್ ಮುಖಾಮುಖಿಗಳು",
    "matchP": "ಬೋರ್ಡ್‌ನ ಐದೂ ಕಾರ್ಡ್‌ಗಳನ್ನು ಹಂಚಿದಾಗ ಎರಡು ಆರಂಭಿಕ ಹ್ಯಾಂಡ್‌ಗಳು ಪರಸ್ಪರ ಎದುರು ಹೇಗೆ ಆಡುತ್ತವೆ, ಸಾಧ್ಯವಿರುವ ಎಲ್ಲ {boards} ಬೋರ್ಡ್‌ಗಳ ಮೇಲೆ ಎಣಿಸಲಾಗಿದೆ. ಸೂಟ್‌ಗಳು ಸ್ವಲ್ಪ ಮಟ್ಟಿಗೆ ಮುಖ್ಯ: ಸೂಟೆಡ್ ಎಂದು ತೋರಿಸದ ಹೊರತು ಕೆಳಗಿನ ಹ್ಯಾಂಡ್‌ಗಳಲ್ಲಿ ಯಾವುದೇ ಸೂಟ್ ಸಾಮಾನ್ಯವಲ್ಲ.",
    "matchCols": [
      "ಹ್ಯಾಂಡ್",
      "ಎದುರು",
      "ಗೆಲುವು",
      "ಟೈ",
      "ಸೋಲು"
    ],
    "startH2": "ಆರಂಭಿಕ ಹ್ಯಾಂಡ್ ಆಡ್ಸ್",
    "startP": "ಎರಡು ಕಾರ್ಡ್‌ಗಳ {combos} ವಿಭಿನ್ನ ಆರಂಭಿಕ ಹ್ಯಾಂಡ್‌ಗಳಿವೆ. ನಿಮಗೆ ಎಷ್ಟು ಬಾರಿ ಬರುತ್ತದೆ:",
    "startCols": [
      "ಹ್ಯಾಂಡ್",
      "ಸಾಧ್ಯತೆ",
      "ಸುಮಾರು ಇಷ್ಟು ಹ್ಯಾಂಡ್‌ಗಳಲ್ಲಿ ಒಮ್ಮೆ"
    ],
    "starting": {
      "specificPair": "ಒಂದು ನಿರ್ದಿಷ್ಟ ಪಾಕೆಟ್ ಜೋಡಿ, ಉದಾ. ಏಸ್‌ಗಳು",
      "anyPair": "ಯಾವುದೇ ಪಾಕೆಟ್ ಜೋಡಿ",
      "specificNonPair": "ಒಂದು ನಿರ್ದಿಷ್ಟ ಜೋಡಿಯಲ್ಲದ ಹ್ಯಾಂಡ್, ಉದಾ. ಏಸ್-ಕಿಂಗ್",
      "specificSuited": "ಒಂದು ನಿರ್ದಿಷ್ಟ ಸೂಟೆಡ್ ಹ್ಯಾಂಡ್, ಉದಾ. ಸೂಟೆಡ್ ಏಸ್-ಕಿಂಗ್",
      "anySuited": "ಒಂದೇ ಸೂಟ್‌ನ ಯಾವುದೇ ಎರಡು ಕಾರ್ಡ್‌ಗಳು",
      "twoBroadway": "ಹತ್ತು ಅಥವಾ ಅದಕ್ಕಿಂತ ದೊಡ್ಡ ಎರಡು ಕಾರ್ಡ್‌ಗಳು"
    },
    "faqH2": "ಪ್ರಶ್ನೆಗಳು",
    "faq": [
      [
        "ಪೋಕರ್‌ನಲ್ಲಿ ಔಟ್ಸ್ ಎಂದರೇನು?",
        "ನಿಮಗೆ ಅತ್ಯುತ್ತಮ ಹ್ಯಾಂಡ್ ನೀಡುವ, ಡೆಕ್‌ನಲ್ಲಿ ಉಳಿದಿರುವ ಕಾರ್ಡ್‌ಗಳು. ನೀವು ನೋಡದ ಕಾರ್ಡ್‌ಗಳನ್ನು ಮಾತ್ರ ಎಣಿಸಿ: ಫ್ಲಾಪ್‌ನಲ್ಲಿ 47, ಟರ್ನ್‌ನಲ್ಲಿ 46."
      ],
      [
        "ಪಾಕೆಟ್ ಏಸ್‌ಗಳು ಕಿಂಗ್‌ಗಳನ್ನು ಎಷ್ಟು ಬಾರಿ ಸೋಲಿಸುತ್ತವೆ?",
        "ಸುಮಾರು ಐದರಲ್ಲಿ ನಾಲ್ಕು ಬಾರಿ: ಬೋರ್ಡ್‌ನ ಐದೂ ಕಾರ್ಡ್‌ಗಳನ್ನು ಹಂಚಿದಾಗ {aakk}, ಕಿಂಗ್‌ಗಳು ಗೆಲ್ಲುವುದು {kkaa}."
      ],
      [
        "ಜೋಡಿಯ ಎದುರು ಏಸ್-ಕಿಂಗ್ ನಾಣ್ಯ ಚಿಮ್ಮಿದಂತೆಯೇ?",
        "ಮಧ್ಯಮ ಜೋಡಿಯ ಎದುರು ಬಹುತೇಕ ಹೌದು: ಏಸ್-ಕಿಂಗ್ ಎದುರು ಕ್ವೀನ್‌ಗಳು ಗೆಲ್ಲುವುದು {qqak}. ಸಣ್ಣ ಜೋಡಿಯ ಎದುರು ಇನ್ನೂ ಹತ್ತಿರ — ಎರಡರ ಜೋಡಿ ಗೆಲ್ಲುವುದು {22ak}."
      ],
      [
        "ಪಾಟ್ ಆಡ್ಸ್ ಎಂದರೇನು?",
        "ನೀವು ಗೆಲ್ಲಬಹುದಾದ ಪಾಟ್‌ಗೆ ಹೋಲಿಸಿದರೆ ಒಂದು Call ನ ಬೆಲೆ. ನಿಮ್ಮ ಗೆಲುವಿನ ಸಾಧ್ಯತೆ, ಅಂತಿಮ ಪಾಟ್‌ನಲ್ಲಿ ನೀವು ಹಾಕುವ ಪಾಲಿಗಿಂತ ಹೆಚ್ಚಿದ್ದರೆ, ದೀರ್ಘಾವಧಿಯಲ್ಲಿ call ಮಾಡುವುದು ಲಾಭದಾಯಕ."
      ],
      [
        "ಆಟದ ಸಮಯದಲ್ಲಿ PokerTH ನನ್ನ ಆಡ್ಸ್ ತೋರಿಸುತ್ತದೆಯೇ?",
        "ಹೌದು. ಕಾರ್ಡ್‌ಗಳು ಬರುತ್ತಿದ್ದಂತೆ “ಆಡ್ಸ್” ಟ್ಯಾಬ್ ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಅತ್ಯುತ್ತಮ ಹ್ಯಾಂಡ್‌ನ ಹೆಸರನ್ನು ಮತ್ತು ನಿಮ್ಮ ಗೆಲುವಿನ ಸಾಧ್ಯತೆಯನ್ನು ತೋರಿಸುತ್ತದೆ, ಹೀಗಾಗಿ ಟೇಬಲ್‌ನಲ್ಲೇ ನಿಮ್ಮ ಸ್ವಂತ ತರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಬಹುದು."
      ]
    ]
  },
  ko: {
    "title": "포커 확률표 — 아웃츠, 팟 오즈, 핸드 대결 | PokerTH",
    "desc": "Texas Hold’em 확률을 정확하게 계산했습니다: 아웃츠와 그것을 맞출 확률, 2와 4의 법칙, 팟 오즈, 그리고 AA가 KK를, QQ가 AK를 얼마나 자주 이기는지.",
    "ldHeadline": "포커 확률: 아웃츠, 팟 오즈, 프리플롭 핸드 대결",
    "ldDesc": "정확하게 계산한 Texas Hold’em 확률: 아웃츠, 2와 4의 법칙, 팟 오즈, 프리플롭 핸드 대결.",
    "h1": "포커 확률: 아웃츠, 팟 오즈, 프리플롭 핸드 대결",
    "lead": "좋은 포커 판단은 몇 가지 숫자로 귀결됩니다. 당신의 핸드가 좋아질 가능성이 얼마나 되는지, 그것을 확인하려면 얼마를 내야 하는지, 그리고 플롭 전에 두 핸드가 서로 어떻게 맞서는지입니다. 이 페이지의 모든 수치는 표에서 옮겨 온 것이 아니라 정확하게 계산한 것입니다.",
    "calc": {
      "h2": "포커 확률 계산기",
      "intro": "당신의 카드 두 장을 고르고, 원하면 보드와 상대의 핸드도 고르세요. 계산기는 남은 카드를 모두 깔아 봅니다 — 가능하면 정확하게, 그렇지 않으면 시뮬레이션으로 — 그리고 당신이 얼마나 자주 이기는지 보여 줍니다.",
      "you": "내 핸드",
      "board": "보드",
      "opp": "상대 (선택)",
      "players": "상대 수",
      "pick": "카드를 탭하면 강조된 칸에 놓이고, 칸을 탭하면 비워집니다.",
      "clear": "지우기",
      "win": "승",
      "tie": "무승부",
      "lose": "패",
      "exact": "정확: 가능한 {n}가지 경우를 모두 계산.",
      "sim": "무작위 {n}회 시뮬레이션.",
      "working": "계산 중…",
      "need": "카드 두 장을 고르면 확률이 표시됩니다.",
      "boardHint": "보드에는 카드 세 장(플롭), 그다음 네 장, 다섯 장이 놓입니다.",
      "oppHint": "상대 카드는 두 장 모두 고르거나 하나도 고르지 마세요.",
      "final": "최종 핸드",
      "noscript": "계산기는 JavaScript가 필요합니다. 아래 표는 JavaScript 없이도 볼 수 있습니다."
    },
    "outsH2": "아웃츠: 맞출 확률",
    "outsP": "아웃은 덱에 아직 남아 있으면서 당신의 핸드를 이길 가능성이 높은 핸드로 만들어 주는 카드입니다. 플롭에서는 보이지 않은 카드가 47장입니다. 아웃이 9장이면 턴에서 한 장이 맞을 확률은 {f9turn}, 두 장이 더 나오는 리버까지는 {f9river}입니다.",
    "outsCols": [
      "드로",
      "아웃츠",
      "턴",
      "리버 (턴에서)",
      "턴 또는 리버 (플롭에서)"
    ],
    "draws": {
      "gutshot": "인사이드 스트레이트 드로 (거트샷)",
      "twoPairFull": "투페어에서 풀하우스",
      "pairTrips": "원페어에서 투페어 또는 쓰리 오브 어 카인드",
      "twoOver": "오버카드 두 장에서 원페어",
      "setFull": "셋에서 풀하우스 또는 포 오브 어 카인드",
      "oesd": "양방향 스트레이트 드로",
      "flush": "플러시 드로",
      "flushGut": "플러시 드로 + 거트샷",
      "flushOesd": "플러시 드로 + 양방향 스트레이트 드로"
    },
    "outsNote": "이것은 아웃 중 한 장을 잡을 확률입니다. 두 장이 연달아 맞는 러너러너는 포함하지 않았으며, 상대에게도 더 좋은 핸드를 만들어 주는 카드는 진짜 아웃이 아닙니다.",
    "ruleH2": "2와 4의 법칙",
    "ruleP": "테이블에서 빠르게 어림하는 법: 턴과 리버를 모두 보게 되는 플롭에서는 아웃 수에 4를, 카드가 한 장만 남았을 때는 2를 곱합니다. 플롭의 플러시 드로는 9 × 4 = 36%인데, 정확한 값은 {f9river}입니다. 이 법칙은 큰 드로를 과대평가합니다. 아웃 15장이면 60%가 나오지만 실제 수치는 {f15river}입니다.",
    "potH2": "팟 오즈: 콜해야 할까?",
    "potP": "팟 오즈는 내야 하는 금액과 딸 수 있는 금액을 비교합니다. 팟에 100이 있고 상대가 50을 베팅하면, 당신은 200짜리 팟을 따기 위해 50을 콜합니다. 따라서 그 콜이 이득이 되려면 50 ÷ 200 = 25%보다 더 자주 이겨야 합니다. 플러시 드로에 카드가 한 장 남았다면 맞출 확률은 {f9one}이므로, 리버만 남은 상황에서 베팅에 콜하면 장기적으로 칩을 잃습니다. 플롭에서 올인이 나와 카드 두 장이 남았다면 같은 드로가 {f9river} 확률로 맞으므로 콜할 가치가 있습니다.",
    "matchH2": "프리플롭 핸드 대결",
    "matchP": "보드 카드 다섯 장이 모두 깔렸을 때 두 스타팅 핸드가 맞붙으면 어떻게 되는지를, 가능한 {boards}가지 보드 전부에 대해 센 결과입니다. 무늬도 약간 영향을 줍니다. 아래 핸드들은 수티드로 표시되지 않은 한 같은 무늬를 공유하지 않습니다.",
    "matchCols": [
      "핸드",
      "상대",
      "승",
      "무승부",
      "패"
    ],
    "startH2": "스타팅 핸드 확률",
    "startP": "서로 다른 두 장짜리 스타팅 핸드는 {combos}가지입니다. 각 핸드를 받을 확률:",
    "startCols": [
      "핸드",
      "확률",
      "대략 몇 핸드에 한 번"
    ],
    "starting": {
      "specificPair": "특정 포켓 페어 (예: 에이스 페어)",
      "anyPair": "아무 포켓 페어",
      "specificNonPair": "페어가 아닌 특정 핸드 (예: 에이스-킹)",
      "specificSuited": "특정 수티드 핸드 (예: 에이스-킹 수티드)",
      "anySuited": "아무 수티드 카드 두 장",
      "twoBroadway": "10 이상 카드 두 장"
    },
    "faqH2": "질문",
    "faq": [
      [
        "포커에서 아웃츠란 무엇인가요?",
        "덱에 남아 있으면서 당신에게 가장 좋은 핸드를 만들어 줄 카드입니다. 보지 못한 카드만 세세요: 플롭에서는 47장, 턴에서는 46장입니다."
      ],
      [
        "포켓 에이스는 킹 페어를 얼마나 자주 이기나요?",
        "대략 다섯 번 중 네 번입니다. 보드 카드 다섯 장이 모두 깔리면 {aakk}이고, 킹이 이기는 경우는 {kkaa}입니다."
      ],
      [
        "에이스-킹 대 페어는 동전 던지기인가요?",
        "중간 페어를 상대로는 거의 그렇습니다. 퀸 페어는 에이스-킹을 상대로 {qqak} 이깁니다. 낮은 페어를 상대로는 더 팽팽합니다 — 2 페어는 {22ak} 이깁니다."
      ],
      [
        "팟 오즈란 무엇인가요?",
        "딸 수 있는 팟에 비한 콜의 가격입니다. 이길 확률이 최종 팟에서 당신이 넣는 몫보다 높다면, 콜은 길게 보아 이득입니다."
      ],
      [
        "PokerTH는 게임 중에 내 확률을 보여 주나요?",
        "네. 「확률」 탭은 카드가 열릴 때마다 현재 당신의 최고 핸드 이름과 이길 확률을 보여 주므로, 테이블에서 자신의 판단을 직접 확인할 수 있습니다."
      ]
    ]
  },
  ky: {
    "title": "Покер ыктымалдыктары — ауттар, банк мүмкүнчүлүктөрү | PokerTH",
    "desc": "Texas Hold’em ыктымалдыктары так эсептелген: ауттар жана аларды тартуу мүмкүнчүлүгү, 2 жана 4 эрежеси, банк мүмкүнчүлүктөрү, AA канча жолу KK'ни же QQ AK'ни утат.",
    "ldHeadline": "Покер ыктымалдыктары: ауттар, банк мүмкүнчүлүктөрү жана префлоп беттешүүлөр",
    "ldDesc": "Texas Hold’em ыктымалдыктары так эсептелген: ауттар, 2 жана 4 эрежеси, банк мүмкүнчүлүктөрү жана префлоп беттешүүлөр.",
    "h1": "Покер ыктымалдыктары: ауттар, банк мүмкүнчүлүктөрү жана префлоп беттешүүлөр",
    "lead": "Покердеги жакшы чечимдер бир нече санга келип такалат: колуңуздун жакшыруу ыктымалдыгы канча, муну билүү үчүн канча төлөшүңүз керек, жана флопко чейин эки кол бири-бирине каршы кандай турат. Бул беттеги ар бир сан так эсептелген, кандайдыр бир таблицадан көчүрүлгөн эмес.",
    "calc": {
      "h2": "Покер ыктымалдыктарынын калькулятору",
      "intro": "Эки картаңызды, кааласаңыз борд менен атаандаштын колун да тандаңыз. Калькулятор калган бардык карталарды таратып чыгат — мүмкүн болсо так, болбосо симуляция аркылуу — жана канча жолу утарыңызды көрсөтөт.",
      "you": "Сиздин колуңуз",
      "board": "Борд",
      "opp": "Атаандаш (милдеттүү эмес)",
      "players": "Атаандаштар",
      "pick": "Картаны белгиленген уячага коюу үчүн басыңыз; уячаны бошотуу үчүн аны басыңыз.",
      "clear": "Тазалоо",
      "win": "Утуш",
      "tie": "Тең",
      "lose": "Утулуу",
      "exact": "Так: мүмкүн болгон {n} таратуунун баары.",
      "sim": "{n} кокус таратуунун симуляциясы.",
      "working": "Эсептелүүдө…",
      "need": "Ыктымалдыктарыңызды көрүү үчүн эки картаңызды тандаңыз.",
      "boardHint": "Бордго адегенде үч карта (флоп), андан кийин төрт, андан кийин беш карта чыгат.",
      "oppHint": "Атаандаштын эки картасын тең тандаңыз, же бирин да тандабаңыз.",
      "final": "Акыркы колуңуз",
      "noscript": "Калькуляторго JavaScript керек. Төмөнкү таблицалар ансыз да иштейт."
    },
    "outsH2": "Ауттар: картаны тартуу мүмкүнчүлүгүңүз",
    "outsP": "Аут — колодада али турган, колуңузду утушу ыктымал комбинацияга айландыра турган карта. Флопто 47 карта көрүнбөйт: 9 аут менен тёрнде бир карта {f9turn} учурда түшөт, ал эми риверге чейин — эки карта калганда — {f9river}.",
    "outsCols": [
      "Дро",
      "Ауттар",
      "Тёрн",
      "Ривер (тёрндөн)",
      "Тёрн же ривер (флоптон)"
    ],
    "draws": {
      "gutshot": "Ички стрит-дро (гатшот)",
      "twoPairFull": "Эки жуп → Фулл-хаус",
      "pairTrips": "Жуп → Эки жуп же Үчтүк",
      "twoOver": "Эки оверкарта → Жуп",
      "setFull": "Сет → Фулл-хаус же Каре",
      "oesd": "Эки тарабы ачык стрит-дро",
      "flush": "Флеш-дро",
      "flushGut": "Флеш-дро жана гатшот",
      "flushOesd": "Флеш-дро жана эки тарабы ачык стрит-дро"
    },
    "outsNote": "Бул ауттарыңыздын бирин тартуу мүмкүнчүлүктөрү. Алар раннер-раннер (катары менен эки карта) кошумчаларын эсепке албайт, ал эми атаандашка да мыктыраак кол бере турган аут чындыгында аут эмес.",
    "ruleH2": "2 жана 4 эрежеси",
    "ruleP": "Үстөлдө тез баалоо: тёрнду да, риверди да көрө турган болсоңуз, флопто ауттарыңызды 4кө, бир гана карта калганда 2ге көбөйтүңүз. Флоптогу флеш-дро 9 × 4 = 36% берет, ал эми так эсеп боюнча {f9river}. Эреже чоң дролорду ашыкча баалайт: 15 аут 60% берет, чыныгы сан {f15river}.",
    "potH2": "Банк мүмкүнчүлүктөрү: Call кылуу керекпи?",
    "potP": "Банк мүмкүнчүлүктөрү төлөшүңүз керек болгон сумманы утуп ала турган суммаңыз менен салыштырат. Банкта 100 бар, атаандашыңыз 50 коёт: 200 банкты утуу үчүн 50 Call кыласыз, демек Call пайда алып келиши үчүн учурлардын 50 ÷ 200 = 25%инен көбүндө утушу керек. Флеш-дро менен бир карта калганда {f9one} учурда тартасыз, ошондуктан ривер гана калганда ставкага Call кылуу узак мөөнөттө чиптерди жоготот. Флопто All-In болсо, эки карта калганда, ошол эле дро {f9river} учурда толукталат жана Call кылууга арзыйт.",
    "matchH2": "Префлоп беттешүүлөр",
    "matchP": "Борддун беш картасы тең таратылганда эки баштапкы кол бири-бирине каршы кандай натыйжа берет — мүмкүн болгон {boards} борддун баарында эсептелген. Масттардын бир аз таасири бар: төмөнкү колдордо, бир масть деп көрсөтүлбөсө, жалпы масть жок.",
    "matchCols": [
      "Кол",
      "Каршы",
      "Утат",
      "Тең",
      "Утулат"
    ],
    "startH2": "Баштапкы колдордун ыктымалдыктары",
    "startP": "Эки карталык {combos} ар түрдүү баштапкы кол бар. Сизге канча жолу түшөт:",
    "startCols": [
      "Кол",
      "Ыктымалдык",
      "Болжол менен ушунча колдун бири"
    ],
    "starting": {
      "specificPair": "Белгилүү бир чөнтөк жубу, мисалы туздар",
      "anyPair": "Каалаган чөнтөк жубу",
      "specificNonPair": "Белгилүү бир жупсуз кол, мисалы туз-король",
      "specificSuited": "Белгилүү бир масттагы кол, мисалы бир масттагы туз-король",
      "anySuited": "Бир масттагы каалаган эки карта",
      "twoBroadway": "Он же андан жогору эки карта"
    },
    "faqH2": "Суроолор",
    "faq": [
      [
        "Покердеги ауттар деген эмне?",
        "Колодада калган, сизге эң мыкты комбинация бере турган карталар. Көрө элек карталарыңызды гана санаңыз: флопто 47, тёрнде 46."
      ],
      [
        "Чөнтөктөгү туздар королдорду канча жолу утат?",
        "Болжол менен бештен төрт жолу: борддун беш картасы тең таратылганда {aakk}, ал эми королдор {kkaa} утат."
      ],
      [
        "Жупка каршы туз-король — тыйын ыргытуу менен барабарбы?",
        "Орточо жупка каршы дээрлик ошондой: дамалар туз-королго каршы {qqak} утат. Кичине жупка каршы андан да тең — экилер {22ak} утат."
      ],
      [
        "Банк мүмкүнчүлүктөрү деген эмне?",
        "Call баасынын сиз утуп ала турган банкка салыштырмасы. Эгер утуу мүмкүнчүлүгүңүз акыркы банкка сиз салган үлүштөн жогору болсо, Call кылуу убакыттын өтүшү менен пайда алып келет."
      ],
      [
        "PokerTH оюн учурунда менин ыктымалдыктарымды көрсөтөбү?",
        "Ооба. «Мүмкүнчүлүктөр» өтмөгү карталар ачылган сайын учурдагы эң мыкты комбинацияңызды жана утуу мүмкүнчүлүгүңүздү көрсөтөт, ошентип үстөлдө эле өз ой жүгүртүүңүздү текшере аласыз."
      ]
    ]
  },
  lt: {
    "title": "Pokerio tikimybės — autai, banko šansai, rankų dvikovos | PokerTH",
    "desc": "Texas Hold’em tikimybės, apskaičiuotos tiksliai: autai ir šansas juos surinkti, 2 ir 4 taisyklė, banko šansai ir kaip dažnai AA įveikia KK ar QQ įveikia AK.",
    "ldHeadline": "Pokerio tikimybės: autai, banko šansai ir dvikovos prieš flopą",
    "ldDesc": "Texas Hold’em tikimybės, apskaičiuotos tiksliai: autai, 2 ir 4 taisyklė, banko šansai ir dvikovos prieš flopą.",
    "h1": "Pokerio tikimybės: autai, banko šansai ir dvikovos prieš flopą",
    "lead": "Geri pokerio sprendimai remiasi keliais skaičiais: kokia tikimybė, kad jūsų ranka pagerės, kiek turite sumokėti, kad tai sužinotumėte, ir kaip dvi rankos atrodo viena prieš kitą prieš flopą. Kiekvienas skaičius šiame puslapyje apskaičiuotas tiksliai, o ne nukopijuotas iš lentelės.",
    "calc": {
      "h2": "Pokerio tikimybių skaičiuoklė",
      "intro": "Pasirinkite dvi savo kortas ir, jei norite, stalo kortas bei varžovo ranką. Skaičiuoklė išdalija visas likusias kortas — tiksliai, kai tik gali, kitaip simuliacijos būdu — ir parodo, kaip dažnai laimite.",
      "you": "Jūsų ranka",
      "board": "Stalas",
      "opp": "Varžovas (nebūtina)",
      "players": "Varžovai",
      "pick": "Bakstelėkite kortą, kad ją padėtumėte į paryškintą vietą; bakstelėkite vietą, kad ją išvalytumėte.",
      "clear": "Išvalyti",
      "win": "Pergalė",
      "tie": "Lygiosios",
      "lose": "Pralaimėjimas",
      "exact": "Tiksliai: visi {n} galimi išdalijimai.",
      "sim": "{n} atsitiktinių išdalijimų simuliacija.",
      "working": "Skaičiuojama…",
      "need": "Pasirinkite dvi savo kortas, kad pamatytumėte savo šansus.",
      "boardHint": "Ant stalo dedamos trys kortos (flopas), tada keturios, tada penkios.",
      "oppHint": "Pasirinkite abi varžovo kortas arba nė vienos.",
      "final": "Jūsų galutinė ranka",
      "noscript": "Skaičiuoklei reikia JavaScript. Toliau esančios lentelės veikia ir be jo."
    },
    "outsH2": "Autai: jūsų šansas pagauti",
    "outsP": "Autas — tai kaladėje dar likusi korta, kuri jūsų ranką paverčia tikėtina nugalėtoja. Per flopą nematytų kortų yra 47: turint 9 autus, viena korta ateina terne {f9turn} atvejų, o iki riverio — kai dar laukia dvi kortos — {f9river}.",
    "outsCols": [
      "Laukimas",
      "Autai",
      "Ternas",
      "Riveris (nuo terno)",
      "Ternas ar riveris (nuo flopo)"
    ],
    "draws": {
      "gutshot": "Vidinės eilės laukimas (gutshot)",
      "twoPairFull": "Iš dviejų porų į pilną namą",
      "pairTrips": "Iš poros į dvi poras ar trejetą",
      "twoOver": "Dvi aukštesnės kortos iki poros",
      "setFull": "Iš seto į pilną namą ar ketvertą",
      "oesd": "Atviros eilės laukimas",
      "flush": "Spalvos laukimas",
      "flushGut": "Spalvos laukimas ir gutshot",
      "flushOesd": "Spalvos ir atviros eilės laukimas"
    },
    "outsNote": "Tai šansai pagauti vieną iš savo autų. Neįskaičiuoti runner-runner priedai (užpakalinės durys), o autas, kuris ir varžovui duoda geresnę ranką, iš tiesų nėra autas.",
    "ruleH2": "2 ir 4 taisyklė",
    "ruleP": "Greitas įvertinimas prie stalo: per flopą padauginkite savo autus iš 4, kai pamatysite ir terną, ir riverį, ir iš 2, kai liko tik viena korta. Spalvos laukimas per flopą — 9 × 4 = 36 %, palyginti su tiksliais {f9river}. Taisyklė pervertina didelius laukimus: 15 autų duoda 60 %, tikrasis skaičius — {f15river}.",
    "potH2": "Banko šansai: ar verta atsakyti?",
    "potP": "Banko šansai lygina tai, ką turite sumokėti, su tuo, ką galite laimėti. Banke yra 100, varžovas stato 50: jūs atsakote 50, kad laimėtumėte 200 banką, todėl atsakymas turi laimėti dažniau nei 50 ÷ 200 = 25 % atvejų, kad atsipirktų. Turėdami spalvos laukimą ir vieną likusią kortą, surenkate {f9one} atvejų, todėl atsakyti į statymą, kai liko tik riveris, ilgainiui reiškia prarasti žetonus. Jei viskas statoma per flopą ir laukia abi kortos, tas pats laukimas susirenka {f9river} atvejų, ir atsakyti verta.",
    "matchH2": "Dvikovos prieš flopą",
    "matchP": "Kaip dvi pradinės rankos atrodo viena prieš kitą, kai išdalijamos visos penkios bendrosios kortos, suskaičiuota per visus {boards} galimus stalo variantus. Rūšys šiek tiek svarbios: toliau pateiktos rankos neturi bendros rūšies, nebent nurodyta, kad jos tos pačios rūšies.",
    "matchCols": [
      "Ranka",
      "Prieš",
      "Laimi",
      "Lygiosios",
      "Pralaimi"
    ],
    "startH2": "Pradinių rankų tikimybės",
    "startP": "Yra {combos} skirtingos dviejų kortų pradinės rankos. Kaip dažnai jums išdalijama:",
    "startCols": [
      "Ranka",
      "Tikimybė",
      "Maždaug viena ranka iš"
    ],
    "starting": {
      "specificPair": "Tam tikra pora rankoje, pavyzdžiui, tūzai",
      "anyPair": "Bet kuri pora rankoje",
      "specificNonPair": "Tam tikra ranka be poros, pavyzdžiui, tūzas-karalius",
      "specificSuited": "Tam tikra tos pačios rūšies ranka, pavyzdžiui, tos pačios rūšies tūzas-karalius",
      "anySuited": "Bet kurios dvi tos pačios rūšies kortos",
      "twoBroadway": "Dvi kortos nuo dešimtuko ir aukščiau"
    },
    "faqH2": "Klausimai",
    "faq": [
      [
        "Kas yra autai pokeryje?",
        "Kaladėje likusios kortos, kurios duotų jums geriausią ranką. Skaičiuokite tik tas kortas, kurių nematėte: 47 per flopą, 46 per terną."
      ],
      [
        "Kaip dažnai tūzų pora rankoje įveikia karalių porą?",
        "Maždaug keturis kartus iš penkių: {aakk}, kai išdalijamos visos penkios bendrosios kortos, o karaliai laimi {kkaa}."
      ],
      [
        "Ar tūzas-karalius prieš porą — tai monetos metimas?",
        "Beveik, prieš vidutinę porą: damos laimi {qqak} prieš tūzą-karalių. Prieš mažą porą dar arčiau — dvejetai laimi {22ak}."
      ],
      [
        "Kas yra banko šansai?",
        "Atsakymo kaina, palyginti su banku, kurį galite laimėti. Jei jūsų šansas laimėti didesnis už galutinio banko dalį, kurią įnešate jūs, atsakyti ilgainiui apsimoka."
      ],
      [
        "Ar PokerTH rodo mano šansus žaidimo metu?",
        "Taip. Kortelė „Tikimybės“ nurodo jūsų dabartinę geriausią ranką ir šansą laimėti, kai atverčiamos kortos, tad prie stalo galite pasitikrinti savo samprotavimus."
      ]
    ]
  },
  lv: {
    "title": "Pokera izredzes — izejas, bankas izredzes, dueļi | PokerTH",
    "desc": "Texas Hold’em izredzes, aprēķinātas precīzi: izejas un tava iespēja tās trāpīt, 2 un 4 likums, bankas izredzes un cik bieži AA pārspēj KK vai QQ pārspēj AK.",
    "ldHeadline": "Pokera izredzes: izejas, bankas izredzes un dueļi pirms flopa",
    "ldDesc": "Texas Hold’em izredzes, aprēķinātas precīzi: izejas, 2 un 4 likums, bankas izredzes un dueļi pirms flopa.",
    "h1": "Pokera izredzes: izejas, bankas izredzes un dueļi pirms flopa",
    "lead": "Labi lēmumi pokerā balstās uz dažiem skaitļiem: cik ticams, ka tava kombinācija uzlabosies, cik tev jāmaksā, lai to uzzinātu, un kā divas kombinācijas stāv viena pret otru pirms flopa. Katrs skaitlis šajā lapā ir aprēķināts precīzi, nevis norakstīts no tabulas.",
    "calc": {
      "h2": "Pokera izredžu kalkulators",
      "intro": "Izvēlies savas divas kārtis un, ja vēlies, galda kārtis un pretinieka kārtis. Kalkulators izdala visas atlikušās kārtis — precīzi, kad vien iespējams, citādi ar simulāciju — un parāda, cik bieži tu uzvari.",
      "you": "Tavas kārtis",
      "board": "Galds",
      "opp": "Pretinieks (nav obligāti)",
      "players": "Pretinieki",
      "pick": "Pieskaries kārtij, lai noliktu to izceltajā vietā; pieskaries vietai, lai to iztukšotu.",
      "clear": "Notīrīt",
      "win": "Uzvara",
      "tie": "Neizšķirts",
      "lose": "Zaudējums",
      "exact": "Precīzi: visas {n} iespējamās izdales.",
      "sim": "Simulācija ar {n} nejaušām izdalēm.",
      "working": "Aprēķina…",
      "need": "Izvēlies savas divas kārtis, lai redzētu izredzes.",
      "boardHint": "Uz galda nāk trīs kārtis (flops), tad četras, tad piecas.",
      "oppHint": "Izvēlies abas pretinieka kārtis vai nevienu.",
      "final": "Tava galīgā kombinācija",
      "noscript": "Kalkulatoram vajag JavaScript. Tabulas zemāk darbojas arī bez tā."
    },
    "outsH2": "Izejas: tava iespēja trāpīt",
    "outsP": "Izeja ir kārts, kas vēl ir kavā un padara tavu kombināciju par iespējamo uzvarētāju. Uz flopa 47 kārtis nav redzētas: ar 9 izejām viena kārts trāpa uz turn {f9turn} gadījumu, bet līdz river — kad priekšā vēl divas kārtis — {f9river}.",
    "outsCols": [
      "Izvilkums",
      "Izejas",
      "Turn",
      "River (no turn)",
      "Turn vai river (no flopa)"
    ],
    "draws": {
      "gutshot": "Iekšējās rindas izvilkums (gutshot)",
      "twoPairFull": "Divi pāri uz pilnu māju",
      "pairTrips": "Pāris uz diviem pāriem vai trijnieku",
      "twoOver": "Divas virskārtis uz pāri",
      "setFull": "Sets uz pilnu māju vai četrinieku",
      "oesd": "Abpusēji atvērts rindas izvilkums",
      "flush": "Krāsas izvilkums",
      "flushGut": "Krāsas izvilkums un gutshot",
      "flushOesd": "Krāsas izvilkums un abpusēji atvērts rindas izvilkums"
    },
    "outsNote": "Tās ir iespējas noķert kādu no savām izejām. Tajās nav ieskaitīti runner-runner papildgadījumi, un izeja, kas arī pretiniekam dod labāku kombināciju, īstenībā nav izeja.",
    "ruleH2": "2 un 4 likums",
    "ruleP": "Ātrs novērtējums pie galda: uz flopa reizini izejas ar 4, ja redzēsi gan turn, gan river, un ar 2, ja nāk tikai viena kārts. Krāsas izvilkums uz flopa ir 9 × 4 = 36%, bet precīzi {f9river}. Likums pārvērtē lielus izvilkumus: 15 izejas dod 60%, bet patiesais skaitlis ir {f15river}.",
    "potH2": "Bankas izredzes: vai izlīdzināt?",
    "potP": "Bankas izredzes salīdzina to, kas tev jāmaksā, ar to, ko vari laimēt. Bankā ir 100, un pretinieks liek 50: tu izlīdzini 50, lai laimētu 200 lielu banku, tātad izlīdzināšanai jāuzvar biežāk nekā 50 ÷ 200 = 25% gadījumu, lai tā atmaksātos. Ar krāsas izvilkumu un vienu nākamo kārti tu trāpi {f9one} gadījumu, tāpēc izlīdzināt likmi, kad palicis tikai river, ilgtermiņā nozīmē zaudēt žetonus. All-In uz flopa, kad nāk vēl abas kārtis, tas pats izvilkums trāpa {f9river}, un izlīdzināt ir vērts.",
    "matchH2": "Dueļi pirms flopa",
    "matchP": "Kā divas sākuma kombinācijas cīnās viena pret otru, kad izdalītas visas piecas galda kārtis, saskaitot katru no {boards} iespējamajiem galdiem. Mastiem ir neliela nozīme: zemāk esošajām kombinācijām nav kopīga masta, ja vien tās nav norādītas kā vienā mastā.",
    "matchCols": [
      "Kārtis",
      "Pret",
      "Uzvar",
      "Neizšķirts",
      "Zaudē"
    ],
    "startH2": "Sākuma kāršu izredzes",
    "startP": "Pastāv {combos} dažādas divu kāršu sākuma kombinācijas. Cik bieži tev izdala:",
    "startCols": [
      "Kārtis",
      "Iespēja",
      "Aptuveni viena partija no"
    ],
    "starting": {
      "specificPair": "Konkrēts pāris rokā, piemēram, dūži",
      "anyPair": "Jebkurš pāris rokā",
      "specificNonPair": "Konkrētas kārtis bez pāra, piemēram, dūzis-kungs",
      "specificSuited": "Konkrētas kārtis vienā mastā, piemēram, dūzis-kungs vienā mastā",
      "anySuited": "Jebkuras divas viena masta kārtis",
      "twoBroadway": "Divas kārtis no desmitnieka uz augšu"
    },
    "faqH2": "Jautājumi",
    "faq": [
      [
        "Kas ir izejas pokerā?",
        "Kārtis, kas palikušas kavā un dotu tev labāko kombināciju. Skaiti tikai kārtis, ko neesi redzējis: 47 uz flopa, 46 uz turn."
      ],
      [
        "Cik bieži dūžu pāris rokā pārspēj kungus?",
        "Aptuveni četras reizes no piecām: {aakk}, kad izdalītas visas piecas galda kārtis, bet kungi uzvar {kkaa}."
      ],
      [
        "Vai dūzis-kungs pret pāri ir monētas mešana?",
        "Gandrīz, pret vidēju pāri: dāmas uzvar dūzi-kungu {qqak}. Pret mazu pāri vēl līdzīgāk — divnieki uzvar {22ak}."
      ],
      [
        "Kas ir bankas izredzes?",
        "Izlīdzināšanas cena salīdzinājumā ar banku, ko vari laimēt. Ja tava uzvaras iespēja ir lielāka par daļu, ko tu ieliec galīgajā bankā, izlīdzināšana laika gaitā atmaksājas."
      ],
      [
        "Vai PokerTH spēles laikā rāda manas izredzes?",
        "Jā. Cilnē Izredzes tiek nosaukta tava pašreizējā labākā kombinācija un uzvaras iespēja, kārtīm atklājoties, tāpēc vari pārbaudīt savus spriedumus pie galda."
      ]
    ]
  },
  mk: {
    "title": "Покер шанси — аути, изгледи на потот, дуели | PokerTH",
    "desc": "Шансите во Texas Hold’em пресметани точно: аути и шансата да ги фатиш, правилото на 2 и 4, изгледи на потот и колку често AA го бие KK или QQ го бие AK.",
    "ldHeadline": "Покер шанси: аути, изгледи на потот и дуели пред флопот",
    "ldDesc": "Шансите во Texas Hold’em пресметани точно: аути, правилото на 2 и 4, изгледи на потот и дуели пред флопот.",
    "h1": "Покер шанси: аути, изгледи на потот и дуели пред флопот",
    "lead": "Добрите одлуки во покерот се сведуваат на неколку бројки: колку е веројатно твојата рака да се подобри, колку мораш да платиш за да дознаеш, и како стојат две раце една против друга пред флопот. Секоја бројка на оваа страница е пресметана точно, а не препишана од табела.",
    "calc": {
      "h2": "Калкулатор за покер шанси",
      "intro": "Избери ги твоите две карти и, ако сакаш, масата и раката на противникот. Калкулаторот ги дели сите преостанати карти — точно секогаш кога може, инаку со симулација — и покажува колку често победуваш.",
      "you": "Твојата рака",
      "board": "Маса",
      "opp": "Противник (по избор)",
      "players": "Противници",
      "pick": "Допри карта за да ја ставиш во означеното место; допри место за да го испразниш.",
      "clear": "Исчисти",
      "win": "Победа",
      "tie": "Нерешено",
      "lose": "Пораз",
      "exact": "Точно: секое од {n} можни делења.",
      "sim": "Симулација на {n} случајни делења.",
      "working": "Пресметување…",
      "need": "Избери ги твоите две карти за да ги видиш шансите.",
      "boardHint": "Масата прима три карти (флопот), потоа четири, потоа пет.",
      "oppHint": "Избери ги двете карти на противникот, или ниту една.",
      "final": "Твојата конечна рака",
      "noscript": "Калкулаторот бара JavaScript. Табелите подолу работат и без него."
    },
    "outsH2": "Аути: шансата да фатиш",
    "outsP": "Аут е карта што сè уште е во шпилот и ја прави твојата рака веројатен победник. На флопот 47 карти се невидени: со 9 аути, една карта погодува на тернот во {f9turn} од случаите, а до риверот — со уште две карти — во {f9river}.",
    "outsCols": [
      "Изглед",
      "Аути",
      "Терн",
      "Ривер (од тернот)",
      "Терн или ривер (од флопот)"
    ],
    "draws": {
      "gutshot": "Внатрешен изглед за стрит (гатшот)",
      "twoPairFull": "Два пара кон фул хаус",
      "pairTrips": "Еден пар кон два пара или трилинг",
      "twoOver": "Две повисоки карти кон пар",
      "setFull": "Сет кон фул хаус или кара",
      "oesd": "Отворен изглед за стрит",
      "flush": "Изглед за флаш",
      "flushGut": "Изглед за флаш и гатшот",
      "flushOesd": "Изглед за флаш и отворен изглед за стрит"
    },
    "outsNote": "Ова се шансите да фатиш еден од твоите аути. Не ги вклучуваат дополнителните runner-runner можности, а аут што и на противникот му дава подобра рака всушност не е аут.",
    "ruleH2": "Правилото на 2 и 4",
    "ruleP": "Брза проценка на масата: помножи ги аутите со 4 на флопот кога ќе ги видиш и тернот и риверот, а со 2 кога доаѓа само уште една карта. Изглед за флаш на флопот дава 9 × 4 = 36 %, наспроти точно {f9river}. Правилото ги преценува големите изгледи: 15 аути даваат 60 %, а вистинската бројка е {f15river}.",
    "potH2": "Изгледи на потот: да платиш ли?",
    "potP": "Изгледите на потот го споредуваат она што мораш да платиш со она што можеш да добиеш. Во потот има 100, а противникот вложува 50: плаќаш 50 за да добиеш пот од 200, па плаќањето мора да победува во повеќе од 50 ÷ 200 = 25 % од случаите за да се исплати. Со изглед за флаш и уште една карта погодуваш во {f9one} од случаите, па плаќањето влог кога останува само риверот губи жетони на долг рок. All-In на флопот, со уште две карти, истиот изглед погодува во {f9river}, и плаќањето се исплати.",
    "matchH2": "Дуели пред флопот",
    "matchP": "Како се снаоѓаат две почетни раце една против друга кога ќе се поделат сите пет карти на масата, пресметано на секоја од {boards} можни маси. Боите малку влијаат: рацете подолу немаат заедничка боја, освен ако не се прикажани во иста боја.",
    "matchCols": [
      "Рака",
      "Против",
      "Победува",
      "Нерешено",
      "Губи"
    ],
    "startH2": "Шанси за почетни раце",
    "startP": "Постојат {combos} различни почетни раце од две карти. Колку често ти се паѓа:",
    "startCols": [
      "Рака",
      "Шанса",
      "Околу една рака на"
    ],
    "starting": {
      "specificPair": "Одреден пар во раката, на пример аси",
      "anyPair": "Кој било пар во раката",
      "specificNonPair": "Одредена рака без пар, на пример ас-крал",
      "specificSuited": "Одредена рака во иста боја, на пример ас-крал во иста боја",
      "anySuited": "Кои било две карти во иста боја",
      "twoBroadway": "Две карти од десетка нагоре"
    },
    "faqH2": "Прашања",
    "faq": [
      [
        "Што се аути во покерот?",
        "Картите што остануваат во шпилот и би ти ја дале најдобрата рака. Брои ги само картите што не си ги видел: 47 на флопот, 46 на тернот."
      ],
      [
        "Колку често пар аси ги бие кралевите?",
        "Отприлика четири пати од пет: {aakk} кога ќе се поделат сите пет карти на масата, а кралевите победуваат во {kkaa}."
      ],
      [
        "Дали ас-крал против пар е фрлање паричка?",
        "Речиси, против среден пар: дамите победуваат во {qqak} против ас-крал. Против мал пар е уште поблиску — двојките победуваат во {22ak}."
      ],
      [
        "Што се изгледи на потот?",
        "Цената на плаќањето споредена со потот што можеш да го добиеш. Ако твојата шанса за победа е поголема од делот од конечниот пот што го вложуваш ти, плаќањето се исплати со текот на времето."
      ],
      [
        "Дали PokerTH ми ги покажува шансите за време на игра?",
        "Да. Јазичето Изгледи ја именува твојата моментално најдобра рака и твојата шанса за победа додека излегуваат картите, за да можеш сам да го провериш своето размислување на масата."
      ]
    ]
  },
  ml: {
    "title": "പോക്കർ ഓഡ്സ് — ഔട്ട്സ്, പോട്ട് ഓഡ്സ്, മത്സരങ്ങൾ | PokerTH",
    "desc": "കൃത്യമായി കണക്കാക്കിയ Texas Hold’em ഓഡ്സ്: ഔട്ട്സും അവ കിട്ടാനുള്ള സാധ്യതയും, 2-ന്റെയും 4-ന്റെയും നിയമം, പോട്ട് ഓഡ്സ്, AA KK-യെയും QQ AK-യെയും എത്ര തവണ തോൽപ്പിക്കുന്നു.",
    "ldHeadline": "പോക്കർ ഓഡ്സ്: ഔട്ട്സ്, പോട്ട് ഓഡ്സ്, പ്രീ-ഫ്ലോപ്പ് മത്സരങ്ങൾ",
    "ldDesc": "കൃത്യമായി കണക്കാക്കിയ Texas Hold’em ഓഡ്സ്: ഔട്ട്സ്, 2-ന്റെയും 4-ന്റെയും നിയമം, പോട്ട് ഓഡ്സ്, പ്രീ-ഫ്ലോപ്പ് മത്സരങ്ങൾ.",
    "h1": "പോക്കർ ഓഡ്സ്: ഔട്ട്സ്, പോട്ട് ഓഡ്സ്, പ്രീ-ഫ്ലോപ്പ് മത്സരങ്ങൾ",
    "lead": "നല്ല പോക്കർ തീരുമാനങ്ങൾ ചില സംഖ്യകളിലേക്ക് ചുരുങ്ങുന്നു: നിങ്ങളുടെ ഹാൻഡ് മെച്ചപ്പെടാൻ എത്ര സാധ്യതയുണ്ട്, അത് അറിയാൻ എത്ര നൽകണം, ഫ്ലോപ്പിന് മുമ്പ് രണ്ട് ഹാൻഡുകൾ പരസ്പരം എങ്ങനെ നിൽക്കുന്നു. ഈ പേജിലെ ഓരോ സംഖ്യയും കൃത്യമായി കണക്കാക്കിയതാണ്, ഒരു ചാർട്ടിൽ നിന്ന് പകർത്തിയതല്ല.",
    "calc": {
      "h2": "പോക്കർ ഓഡ്സ് കാൽക്കുലേറ്റർ",
      "intro": "നിങ്ങളുടെ രണ്ട് കാർഡുകൾ തിരഞ്ഞെടുക്കുക, വേണമെങ്കിൽ ബോർഡും ഒരു എതിരാളിയുടെ ഹാൻഡും. കാൽക്കുലേറ്റർ ബാക്കിയുള്ള എല്ലാ കാർഡുകളും വിതരണം ചെയ്ത് നോക്കുന്നു — സാധ്യമാകുമ്പോഴെല്ലാം കൃത്യമായി, അല്ലെങ്കിൽ സിമുലേഷൻ വഴി — നിങ്ങൾ എത്ര തവണ ജയിക്കുന്നുവെന്ന് കാണിക്കുന്നു.",
      "you": "നിങ്ങളുടെ ഹാൻഡ്",
      "board": "ബോർഡ്",
      "opp": "എതിരാളി (ഐച്ഛികം)",
      "players": "എതിരാളികൾ",
      "pick": "ഹൈലൈറ്റ് ചെയ്ത സ്ഥാനത്ത് വെക്കാൻ ഒരു കാർഡിൽ ടാപ്പ് ചെയ്യുക; ഒരു സ്ഥാനം ഒഴിവാക്കാൻ അതിൽ ടാപ്പ് ചെയ്യുക.",
      "clear": "മായ്ക്കുക",
      "win": "ജയം",
      "tie": "സമനില",
      "lose": "തോൽവി",
      "exact": "കൃത്യം: സാധ്യമായ {n} വിതരണങ്ങളിൽ ഓരോന്നും.",
      "sim": "ക്രമരഹിതമായ {n} വിതരണങ്ങളുടെ സിമുലേഷൻ.",
      "working": "കണക്കാക്കുന്നു…",
      "need": "നിങ്ങളുടെ സാധ്യതകൾ കാണാൻ രണ്ട് കാർഡുകൾ തിരഞ്ഞെടുക്കുക.",
      "boardHint": "ബോർഡിൽ ആദ്യം മൂന്ന് കാർഡുകൾ (ഫ്ലോപ്പ്), പിന്നെ നാല്, പിന്നെ അഞ്ച്.",
      "oppHint": "എതിരാളിയുടെ രണ്ട് കാർഡുകളും തിരഞ്ഞെടുക്കുക, അല്ലെങ്കിൽ ഒന്നും വേണ്ട.",
      "final": "നിങ്ങളുടെ അന്തിമ ഹാൻഡ്",
      "noscript": "കാൽക്കുലേറ്ററിന് JavaScript വേണം. താഴെയുള്ള പട്ടികകൾ അതില്ലാതെയും പ്രവർത്തിക്കും."
    },
    "outsH2": "ഔട്ട്സ്: കിട്ടാനുള്ള നിങ്ങളുടെ സാധ്യത",
    "outsP": "നിങ്ങളുടെ ഹാൻഡിനെ മിക്കവാറും വിജയിയാക്കുന്ന, ഡെക്കിൽ ഇപ്പോഴും ഉള്ള കാർഡാണ് ഔട്ട്. ഫ്ലോപ്പിൽ 47 കാർഡുകൾ കാണാത്തവയാണ്: 9 ഔട്ട്സ് ഉണ്ടെങ്കിൽ, ടേണിൽ ഒരു കാർഡ് കിട്ടുന്നത് {f9turn} സന്ദർഭങ്ങളിൽ, റിവർ വരെ — രണ്ട് കാർഡുകൾ വരാനുള്ളപ്പോൾ — {f9river} സന്ദർഭങ്ങളിൽ.",
    "outsCols": [
      "ഡ്രോ",
      "ഔട്ട്സ്",
      "ടേൺ",
      "റിവർ (ടേണിൽ നിന്ന്)",
      "ടേൺ അല്ലെങ്കിൽ റിവർ (ഫ്ലോപ്പിൽ നിന്ന്)"
    ],
    "draws": {
      "gutshot": "ഇൻസൈഡ് Straight ഡ്രോ (ഗട്ട്ഷോട്ട്)",
      "twoPairFull": "Two Pair-ൽ നിന്ന് Full House",
      "pairTrips": "One Pair-ൽ നിന്ന് Two Pair അല്ലെങ്കിൽ Three of a Kind",
      "twoOver": "രണ്ട് ഓവർകാർഡുകളിൽ നിന്ന് ജോടി",
      "setFull": "സെറ്റിൽ നിന്ന് Full House അല്ലെങ്കിൽ Four of a Kind",
      "oesd": "ഓപ്പൺ-എൻഡഡ് Straight ഡ്രോ",
      "flush": "Flush ഡ്രോ",
      "flushGut": "Flush ഡ്രോയും ഗട്ട്ഷോട്ടും",
      "flushOesd": "Flush ഡ്രോയും ഓപ്പൺ-എൻഡഡ് Straight ഡ്രോയും"
    },
    "outsNote": "ഇവ നിങ്ങളുടെ ഔട്ട്സിൽ ഒന്ന് കിട്ടാനുള്ള സാധ്യതകളാണ്. റണ്ണർ-റണ്ണർ അധിക സാധ്യതകൾ ഇതിൽ ഉൾപ്പെടുന്നില്ല, എതിരാളിക്കും മികച്ച ഹാൻഡ് നൽകുന്ന ഔട്ട് യഥാർത്ഥത്തിൽ ഔട്ട് അല്ല.",
    "ruleH2": "2-ന്റെയും 4-ന്റെയും നിയമം",
    "ruleP": "ടേബിളിലെ ഒരു വേഗത്തിലുള്ള കണക്ക്: ടേണും റിവറും രണ്ടും കാണാനുള്ളപ്പോൾ ഫ്ലോപ്പിൽ നിങ്ങളുടെ ഔട്ട്സിനെ 4 കൊണ്ട് ഗുണിക്കുക, ഒരു കാർഡ് മാത്രം വരാനുള്ളപ്പോൾ 2 കൊണ്ട്. ഫ്ലോപ്പിലെ Flush ഡ്രോ 9 × 4 = 36% ആണ്, കൃത്യമായ കണക്ക് {f9river}. വലിയ ഡ്രോകളെ ഈ നിയമം അധികമായി കണക്കാക്കുന്നു: 15 ഔട്ട്സിന് 60% കിട്ടും, യഥാർത്ഥ സംഖ്യ {f15river} ആണ്.",
    "potH2": "പോട്ട് ഓഡ്സ്: Call ചെയ്യണോ?",
    "potP": "നിങ്ങൾ നൽകേണ്ട തുകയെ നിങ്ങൾക്ക് ജയിക്കാവുന്ന തുകയുമായി പോട്ട് ഓഡ്സ് താരതമ്യം ചെയ്യുന്നു. പോട്ടിൽ 100 ഉണ്ട്, എതിരാളി 50 ബെറ്റ് ചെയ്യുന്നു: 200-ന്റെ പോട്ട് ജയിക്കാൻ നിങ്ങൾ 50 Call ചെയ്യുന്നു, അതിനാൽ ലാഭകരമാകാൻ ആ Call 50 ÷ 200 = 25%-ൽ കൂടുതൽ സന്ദർഭങ്ങളിൽ ജയിക്കണം. Flush ഡ്രോയും ഒരു കാർഡ് മാത്രം ബാക്കിയുമുള്ളപ്പോൾ {f9one} സന്ദർഭങ്ങളിലാണ് നിങ്ങൾക്ക് കിട്ടുന്നത്, അതിനാൽ റിവർ മാത്രം ബാക്കിയുള്ളപ്പോൾ ഒരു ബെറ്റ് Call ചെയ്യുന്നത് ദീർഘകാലത്ത് ചിപ്പുകൾ നഷ്ടപ്പെടുത്തും. ഫ്ലോപ്പിൽ All-In ആണെങ്കിൽ, രണ്ട് കാർഡുകളും വരാനുള്ളതിനാൽ, അതേ ഡ്രോ {f9river} സന്ദർഭങ്ങളിൽ കിട്ടും, Call ചെയ്യുന്നത് മൂല്യമുള്ളതാണ്.",
    "matchH2": "പ്രീ-ഫ്ലോപ്പ് മത്സരങ്ങൾ",
    "matchP": "ബോർഡിലെ അഞ്ച് കാർഡുകളും വിതരണം ചെയ്യുമ്പോൾ രണ്ട് സ്റ്റാർട്ടിംഗ് ഹാൻഡുകൾ പരസ്പരം എങ്ങനെ നിൽക്കുന്നു, സാധ്യമായ {boards} ബോർഡുകളിൽ ഓരോന്നിലും എണ്ണിയത്. സ്യൂട്ടുകൾക്ക് ചെറിയ സ്വാധീനമുണ്ട്: സ്യൂട്ടഡ് എന്ന് കാണിച്ചിട്ടില്ലെങ്കിൽ താഴെയുള്ള ഹാൻഡുകൾ ഒരു സ്യൂട്ടും പങ്കിടുന്നില്ല.",
    "matchCols": [
      "ഹാൻഡ്",
      "എതിരെ",
      "ജയിക്കും",
      "സമനില",
      "തോൽക്കും"
    ],
    "startH2": "സ്റ്റാർട്ടിംഗ് ഹാൻഡ് സാധ്യതകൾ",
    "startP": "രണ്ട് കാർഡുകളുള്ള {combos} വ്യത്യസ്ത സ്റ്റാർട്ടിംഗ് ഹാൻഡുകളുണ്ട്. നിങ്ങൾക്ക് എത്ര തവണ കിട്ടും:",
    "startCols": [
      "ഹാൻഡ്",
      "സാധ്യത",
      "ഏകദേശം എത്ര ഹാൻഡിൽ ഒന്ന്"
    ],
    "starting": {
      "specificPair": "ഒരു നിശ്ചിത പോക്കറ്റ് ജോടി, ഉദാഹരണത്തിന് ഏസുകൾ",
      "anyPair": "ഏതെങ്കിലും പോക്കറ്റ് ജോടി",
      "specificNonPair": "ഒരു നിശ്ചിത ജോടിയല്ലാത്ത ഹാൻഡ്, ഉദാഹരണത്തിന് ഏസ്-കിംഗ്",
      "specificSuited": "ഒരു നിശ്ചിത സ്യൂട്ടഡ് ഹാൻഡ്, ഉദാഹരണത്തിന് സ്യൂട്ടഡ് ഏസ്-കിംഗ്",
      "anySuited": "ഏതെങ്കിലും രണ്ട് സ്യൂട്ടഡ് കാർഡുകൾ",
      "twoBroadway": "പത്തോ അതിനു മുകളിലോ ഉള്ള രണ്ട് കാർഡുകൾ"
    },
    "faqH2": "ചോദ്യങ്ങൾ",
    "faq": [
      [
        "പോക്കറിൽ ഔട്ട്സ് എന്നാൽ എന്ത്?",
        "നിങ്ങൾക്ക് ഏറ്റവും നല്ല ഹാൻഡ് നൽകുന്ന, ഡെക്കിൽ ബാക്കിയുള്ള കാർഡുകൾ. നിങ്ങൾ കാണാത്ത കാർഡുകൾ മാത്രം എണ്ണുക: ഫ്ലോപ്പിൽ 47, ടേണിൽ 46."
      ],
      [
        "പോക്കറ്റ് ഏസുകൾ കിംഗുകളെ എത്ര തവണ തോൽപ്പിക്കും?",
        "അഞ്ചിൽ ഏകദേശം നാല് തവണ: ബോർഡിലെ അഞ്ച് കാർഡുകളും വിതരണം ചെയ്യുമ്പോൾ {aakk}, കിംഗുകൾ ജയിക്കുന്നത് {kkaa}."
      ],
      [
        "ജോടിക്കെതിരെ ഏസ്-കിംഗ് ഒരു കോയിൻ ഫ്ലിപ്പ് ആണോ?",
        "ഇടത്തരം ജോടിക്കെതിരെ ഏതാണ്ട് അതെ: ഏസ്-കിംഗിനെതിരെ ക്വീനുകൾ {qqak} ജയിക്കും. ചെറിയ ജോടിക്കെതിരെ ഇതിലും അടുത്താണ് — ടൂസ് {22ak} ജയിക്കും."
      ],
      [
        "പോട്ട് ഓഡ്സ് എന്നാൽ എന്ത്?",
        "നിങ്ങൾക്ക് ജയിക്കാവുന്ന പോട്ടുമായി താരതമ്യം ചെയ്യുമ്പോൾ ഒരു Call-ന്റെ വില. അവസാന പോട്ടിൽ നിങ്ങൾ ഇട്ട പങ്കിനേക്കാൾ നിങ്ങളുടെ ജയസാധ്യത കൂടുതലാണെങ്കിൽ, Call ചെയ്യുന്നത് ദീർഘകാലത്ത് ലാഭകരമാണ്."
      ],
      [
        "കളിക്കുമ്പോൾ PokerTH എന്റെ സാധ്യതകൾ കാണിക്കുമോ?",
        "ഉവ്വ്. കാർഡുകൾ വരുന്തോറും ഓഡ്സ് ടാബ് നിങ്ങളുടെ നിലവിലെ ഏറ്റവും നല്ല ഹാൻഡിന്റെ പേരും ജയിക്കാനുള്ള സാധ്യതയും കാണിക്കും, അതിനാൽ ടേബിളിൽ വെച്ചുതന്നെ നിങ്ങളുടെ ചിന്ത പരിശോധിക്കാം."
      ]
    ]
  },
  mn: {
    "title": "Покерын магадлал — аут, банкны магадлал, тулаан | PokerTH",
    "desc": "Texas Hold’em-ийн магадлалыг яг тооцоолсон: аут ба түүнийг буулгах боломж, 2 ба 4-ийн дүрэм, банкны магадлал, AA нь KK-г, QQ нь AK-г хэр олон удаа ялдаг вэ.",
    "ldHeadline": "Покерын магадлал: аут, банкны магадлал ба префлоп тулаан",
    "ldDesc": "Texas Hold’em-ийн магадлалыг яг тооцоолсон: аут, 2 ба 4-ийн дүрэм, банкны магадлал ба префлоп тулаан.",
    "h1": "Покерын магадлал: аут, банкны магадлал ба префлоп тулаан",
    "lead": "Покерын зөв шийдвэр хэдхэн тооноос шалтгаалдаг: таны гар сайжрах магадлал хэр вэ, үүнийг мэдэхийн тулд хэдийг төлөх вэ, флопоос өмнө хоёр гар бие биенийхээ эсрэг ямар байдаг вэ. Энэ хуудасны тоо бүрийг хүснэгтээс хуулалгүй, яг тооцоолсон.",
    "calc": {
      "h2": "Покерын магадлалын тооцоолуур",
      "intro": "Хоёр хөзрөө сонгоод, хүсвэл борд болон өрсөлдөгчийн гарыг сонгоно уу. Тооцоолуур үлдсэн бүх хөзрийг тараана — боломжтой үед яг, үгүй бол симуляциар — мөн та хэр олон удаа хождгийг харуулна.",
      "you": "Таны гар",
      "board": "Борд",
      "opp": "Өрсөлдөгч (заавал биш)",
      "players": "Өрсөлдөгчид",
      "pick": "Хөзөр дээр дарж тодруулсан нүдэнд байрлуулна; нүдэн дээр дарж хоосолно.",
      "clear": "Цэвэрлэх",
      "win": "Хожил",
      "tie": "Тэнцээ",
      "lose": "Хожигдол",
      "exact": "Яг: боломжит {n} тараалт бүрээр.",
      "sim": "Санамсаргүй {n} тараалтын симуляци.",
      "working": "Тооцоолж байна…",
      "need": "Магадлалаа харахын тулд хоёр хөзрөө сонгоно уу.",
      "boardHint": "Борд эхлээд гурван хөзөр (флоп), дараа нь дөрөв, тэгээд тав авна.",
      "oppHint": "Өрсөлдөгчийн хоёр хөзрийг хоёуланг нь сонгоно уу, эсвэл алийг нь ч бүү сонго.",
      "final": "Таны эцсийн гар",
      "noscript": "Тооцоолуурт JavaScript хэрэгтэй. Доорх хүснэгтүүд түүнгүйгээр ажиллана."
    },
    "outsH2": "Аут: таны буулгах боломж",
    "outsP": "Аут гэдэг нь багцад үлдсэн, таны гарыг магадгүй ялагч болгох хөзөр юм. Флоп дээр 47 хөзөр харагдаагүй байна: 9 аутаар нэг хөзөр терн дээр {f9turn} тохиолдолд буух бөгөөд ривер хүртэл — хоёр хөзөр ирэх үед — {f9river}.",
    "outsCols": [
      "Дро",
      "Аут",
      "Терн",
      "Ривер (тернээс)",
      "Терн эсвэл ривер (флопоос)"
    ],
    "draws": {
      "gutshot": "Дотоод стрейт дро (гатшот)",
      "twoPairFull": "Хоёр хосоос фулл хаус",
      "pairTrips": "Хосоос хоёр хос эсвэл гурвал",
      "twoOver": "Хоёр оверкардаас хос",
      "setFull": "Сетээс фулл хаус эсвэл каре",
      "oesd": "Хоёр талт стрейт дро",
      "flush": "Флэш дро",
      "flushGut": "Флэш дро ба гатшот",
      "flushOesd": "Флэш дро ба хоёр талт стрейт дро"
    },
    "outsNote": "Эдгээр нь аутынхаа нэгийг авах магадлал юм. Раннер-раннерын нэмэлтийг тооцоогүй бөгөөд өрсөлдөгчид ч илүү сайн гар өгдөг аут бол жинхэнэ аут биш.",
    "ruleH2": "2 ба 4-ийн дүрэм",
    "ruleP": "Ширээн дээрх хурдан тооцоо: терн, ривер хоёуланг харах үед флоп дээр аутаа 4-өөр, ганц хөзөр л ирэх үед 2-оор үржүүлнэ. Флоп дээрх флэш дро 9 × 4 = 36% болох ба яг утга нь {f9river}. Дүрэм том дро-г хэтрүүлж үнэлдэг: 15 аут 60% өгөх боловч бодит тоо нь {f15river}.",
    "potH2": "Банкны магадлал: Call хийх үү?",
    "potP": "Банкны магадлал нь таны төлөх дүнг хожиж болох дүнтэй харьцуулна. Банкинд 100 байгаа бөгөөд өрсөлдөгч 50 тавьжээ: та 200-ийн банк хожихын тулд 50 төлнө, тиймээс Call ашигтай байхын тулд 50 ÷ 200 = 25%-иас илүү тохиолдолд хожих ёстой. Флэш дро ба нэг хөзөр ирэх үед та {f9one} тохиолдолд буулгана, тиймээс зөвхөн ривер үлдсэн үед бооцоонд Call хийх нь урт хугацаанд чип алдана. Флоп дээр All-In хийгээд хоёр хөзөр ирэх үед ижил дро {f9river} буух бөгөөд Call хийх нь зүйтэй.",
    "matchH2": "Префлоп тулаан",
    "matchP": "Бордын таван хөзрийг бүгдийг нь тараасан үед хоёр эхлэлийн гар бие биенийхээ эсрэг ямар үр дүнтэй байдгийг боломжит {boards} борд бүр дээр тоолсон. Зүс бага зэрэг нөлөөлнө: доорх гарууд нэг зүстэй гэж заагаагүй бол ижил зүс хуваалцахгүй.",
    "matchCols": [
      "Гар",
      "Эсрэг",
      "Хожно",
      "Тэнцээ",
      "Хожигдоно"
    ],
    "startH2": "Эхлэлийн гарын магадлал",
    "startP": "Хоёр хөзрийн {combos} өөр эхлэлийн гар байдаг. Танд хэр олон удаа ирэх вэ:",
    "startCols": [
      "Гар",
      "Магадлал",
      "Ойролцоогоор хэдэн гарт нэг"
    ],
    "starting": {
      "specificPair": "Тодорхой халаасны хос, жишээ нь AA",
      "anyPair": "Дурын халаасны хос",
      "specificNonPair": "Тодорхой хосгүй гар, жишээ нь A-K",
      "specificSuited": "Тодорхой нэг зүстэй гар, жишээ нь нэг зүстэй A-K",
      "anySuited": "Нэг зүстэй дурын хоёр хөзөр",
      "twoBroadway": "Арав буюу түүнээс дээш хоёр хөзөр"
    },
    "faqH2": "Асуултууд",
    "faq": [
      [
        "Покерт аут гэж юу вэ?",
        "Танд хамгийн сайн гар өгөх, багцад үлдсэн хөзрүүд. Зөвхөн хараагүй хөзрөө тоолно: флоп дээр 47, терн дээр 46."
      ],
      [
        "AA нь KK-г хэр олон удаа ялдаг вэ?",
        "Таваас дөрөв орчим удаа: бордын таван хөзрийг бүгдийг нь тараасан үед {aakk}, харин KK {kkaa} хожно."
      ],
      [
        "AK хосын эсрэг зоос шидэхтэй адил уу?",
        "Бараг, дунд хосын эсрэг: QQ нь AK-гийн эсрэг {qqak} хожно. Жижиг хосын эсрэг бүр ч ойр — 22 {22ak} хожно."
      ],
      [
        "Банкны магадлал гэж юу вэ?",
        "Call-ын үнийг хожиж болох банктай харьцуулсан харьцаа. Хэрэв таны хожих магадлал эцсийн банкинд таны оруулах хувиас өндөр бол Call хийх нь цаг хугацааны явцад ашигтай."
      ],
      [
        "PokerTH тоглолтын үеэр миний магадлалыг харуулдаг уу?",
        "Тийм. «Боломж» таб хөзөр нээгдэх тусам таны одоогийн хамгийн сайн гар болон хожих магадлалыг нэрлэдэг тул ширээн дээр өөрийн бодлоо шалгаж болно."
      ]
    ]
  },
  mr: {
    "title": "पोकर ऑड्स चार्ट — आउट्स, पॉट ऑड्स, हँड्सची टक्कर | PokerTH",
    "desc": "अचूक मोजलेले Texas Hold’em ऑड्स: आउट्स आणि ते लागण्याची तुमची शक्यता, 2 आणि 4 चा नियम, पॉट ऑड्स, आणि AA किती वेळा KK ला किंवा QQ किती वेळा AK ला हरवतो.",
    "ldHeadline": "पोकर ऑड्स: आउट्स, पॉट ऑड्स आणि प्री-फ्लॉप टक्कर",
    "ldDesc": "अचूक मोजलेले Texas Hold’em ऑड्स: आउट्स, 2 आणि 4 चा नियम, पॉट ऑड्स आणि प्री-फ्लॉप टक्कर.",
    "h1": "पोकर ऑड्स: आउट्स, पॉट ऑड्स आणि प्री-फ्लॉप टक्कर",
    "lead": "पोकरमधले चांगले निर्णय काही आकड्यांवर येऊन ठेपतात: तुमचा हँड सुधारण्याची शक्यता किती, ते कळण्यासाठी तुम्हाला किती मोजावं लागेल, आणि फ्लॉपपूर्वी दोन हँड्स एकमेकांविरुद्ध कसे उभे आहेत. या पानावरचा प्रत्येक आकडा अचूक मोजलेला आहे, कुठल्या चार्टमधून उतरवलेला नाही.",
    "calc": {
      "h2": "पोकर ऑड्स कॅल्क्युलेटर",
      "intro": "तुमची दोन कार्ड्स निवडा आणि हवं असल्यास बोर्ड आणि एका प्रतिस्पर्ध्याचा हँडही निवडा. कॅल्क्युलेटर उरलेलं प्रत्येक कार्ड वाटतो — शक्य असेल तेव्हा अचूकपणे, नाहीतर सिम्युलेशनने — आणि तुम्ही किती वेळा जिंकता ते दाखवतो.",
      "you": "तुमचा हँड",
      "board": "बोर्ड",
      "opp": "प्रतिस्पर्धी (ऐच्छिक)",
      "players": "प्रतिस्पर्धी",
      "pick": "कार्ड हायलाइट केलेल्या जागी ठेवण्यासाठी त्यावर टॅप करा; जागा रिकामी करण्यासाठी तिच्यावर टॅप करा.",
      "clear": "साफ करा",
      "win": "विजय",
      "tie": "बरोबरी",
      "lose": "पराभव",
      "exact": "अचूक: सर्व {n} शक्य वाटपं.",
      "sim": "{n} यादृच्छिक वाटपांचं सिम्युलेशन.",
      "working": "मोजत आहे…",
      "need": "तुमचे ऑड्स पाहण्यासाठी तुमची दोन कार्ड्स निवडा.",
      "boardHint": "बोर्डवर आधी तीन कार्ड्स (फ्लॉप), मग चार, मग पाच.",
      "oppHint": "प्रतिस्पर्ध्याची दोन्ही कार्ड्स निवडा, किंवा एकही नाही.",
      "final": "तुमचा अंतिम हँड",
      "noscript": "कॅल्क्युलेटरला JavaScript लागते. खालील तक्ते त्याशिवायही चालतात."
    },
    "outsH2": "आउट्स: कार्ड लागण्याची तुमची शक्यता",
    "outsP": "आउट म्हणजे डेकमध्ये अजून असलेलं असं कार्ड, जे तुमचा हँड संभाव्य विजेता बनवतं. फ्लॉपवर 47 कार्ड्स न पाहिलेली असतात: 9 आउट्स असताना, टर्नवर एक कार्ड लागण्याची शक्यता {f9turn}, आणि रिव्हरपर्यंत — अजून दोन कार्ड्स यायची असताना — {f9river}.",
    "outsCols": [
      "ड्रॉ",
      "आउट्स",
      "टर्न",
      "रिव्हर (टर्नपासून)",
      "टर्न किंवा रिव्हर (फ्लॉपपासून)"
    ],
    "draws": {
      "gutshot": "आतला स्ट्रेट ड्रॉ (गटशॉट)",
      "twoPairFull": "Two Pair पासून Full House",
      "pairTrips": "One Pair पासून Two Pair किंवा Three of a Kind",
      "twoOver": "दोन ओव्हरकार्ड्सपासून जोडी",
      "setFull": "सेटपासून Full House किंवा Four of a Kind",
      "oesd": "ओपन-एंडेड स्ट्रेट ड्रॉ",
      "flush": "फ्लश ड्रॉ",
      "flushGut": "फ्लश ड्रॉ आणि गटशॉट",
      "flushOesd": "फ्लश ड्रॉ आणि ओपन-एंडेड स्ट्रेट ड्रॉ"
    },
    "outsNote": "या तुमच्या आउट्सपैकी एक लागण्याच्या शक्यता आहेत. यात रनर-रनर अतिरिक्त शक्यता धरलेल्या नाहीत, आणि जो आउट प्रतिस्पर्ध्यालाही अधिक चांगला हँड देतो, तो खरं तर आउट नसतो.",
    "ruleH2": "2 आणि 4 चा नियम",
    "ruleP": "टेबलवर झटपट अंदाज: टर्न आणि रिव्हर दोन्ही पाहणार असाल तेव्हा फ्लॉपवर तुमचे आउट्स 4 ने गुणा, आणि फक्त एक कार्ड यायचं असेल तेव्हा 2 ने. फ्लॉपवर फ्लश ड्रॉ म्हणजे 9 × 4 = 36%, तर अचूक आकडा {f9river}. मोठ्या ड्रॉजचा हा नियम जास्त अंदाज करतो: 15 आउट्सचे 60% होतात, खरा आकडा {f15river} आहे.",
    "potH2": "पॉट ऑड्स: तुम्ही Call करावं का?",
    "potP": "पॉट ऑड्स तुम्हाला काय भरावं लागेल याची तुम्ही काय जिंकू शकता याच्याशी तुलना करतात. पॉटमध्ये 100 आहेत आणि प्रतिस्पर्धी 50 ची बेट लावतो: 200 चा पॉट जिंकण्यासाठी तुम्ही 50 कॉल करता, म्हणून फायदा होण्यासाठी हा Call 50 ÷ 200 = 25% पेक्षा जास्त वेळा जिंकायला हवा. फ्लश ड्रॉ असताना आणि एकच कार्ड यायचं असताना कार्ड लागण्याची शक्यता {f9one}, म्हणून फक्त रिव्हर उरलेला असताना बेट कॉल करणं दीर्घकाळात चिप्स गमावतं. फ्लॉपवरच All-In झाल्यास, दोन्ही कार्ड्स यायची असताना, त्याच ड्रॉची शक्यता {f9river}, आणि हा Call करणं फायद्याचं आहे.",
    "matchH2": "प्री-फ्लॉप टक्कर",
    "matchP": "बोर्डची पाचही कार्ड्स वाटल्यावर दोन सुरुवातीचे हँड्स एकमेकांविरुद्ध कसे टिकतात, सर्व {boards} शक्य बोर्ड्सवर मोजलेलं. सूट्सचा थोडा फरक पडतो: सूटेड दाखवलेले नसतील तर खालील हँड्समध्ये कोणतीही सूट समान नाही.",
    "matchCols": [
      "हँड",
      "विरुद्ध",
      "जिंकतो",
      "बरोबरी",
      "हरतो"
    ],
    "startH2": "सुरुवातीच्या हँड्सच्या शक्यता",
    "startP": "दोन कार्ड्सचे {combos} वेगवेगळे सुरुवातीचे हँड्स असतात. तुम्हाला किती वेळा मिळतो:",
    "startCols": [
      "हँड",
      "शक्यता",
      "साधारण इतक्या हँड्समध्ये एकदा"
    ],
    "starting": {
      "specificPair": "एक ठराविक पॉकेट जोडी, उदा. एक्के",
      "anyPair": "कोणतीही पॉकेट जोडी",
      "specificNonPair": "एक ठराविक बिनजोडीचा हँड, उदा. एक्का-किंग",
      "specificSuited": "एक ठराविक सूटेड हँड, उदा. सूटेड एक्का-किंग",
      "anySuited": "एकाच सूटची कोणतीही दोन कार्ड्स",
      "twoBroadway": "दहा किंवा त्याहून मोठी दोन कार्ड्स"
    },
    "faqH2": "प्रश्न",
    "faq": [
      [
        "पोकरमध्ये आउट्स म्हणजे काय?",
        "डेकमध्ये उरलेली, तुम्हाला सर्वोत्तम हँड देणारी कार्ड्स. फक्त तुम्ही न पाहिलेली कार्ड्स मोजा: फ्लॉपवर 47, टर्नवर 46."
      ],
      [
        "पॉकेट एक्के किंग्सना किती वेळा हरवतात?",
        "साधारण पाचपैकी चार वेळा: बोर्डची पाचही कार्ड्स वाटल्यावर {aakk}, तर किंग्स जिंकतात {kkaa}."
      ],
      [
        "जोडीविरुद्ध एक्का-किंग म्हणजे नाणेफेक आहे का?",
        "मध्यम जोडीविरुद्ध जवळजवळ हो: एक्का-किंगविरुद्ध क्वीन्स जिंकतात {qqak}. छोट्या जोडीविरुद्ध हे आणखी जवळचं आहे — दोनची जोडी जिंकते {22ak}."
      ],
      [
        "पॉट ऑड्स म्हणजे काय?",
        "तुम्ही जिंकू शकणाऱ्या पॉटच्या तुलनेत एका Call ची किंमत. जिंकण्याची तुमची शक्यता अंतिम पॉटमधल्या तुमच्या वाट्यापेक्षा जास्त असेल, तर कॉल करणं दीर्घकाळात फायद्याचं ठरतं."
      ],
      [
        "खेळताना PokerTH माझे ऑड्स दाखवतो का?",
        "हो. कार्ड्स येतात तसं ऑड्स टॅब तुमचा सध्याचा सर्वोत्तम हँड आणि जिंकण्याची शक्यता सांगतो, त्यामुळे तुम्ही टेबलवरच तुमचा स्वतःचा अंदाज तपासू शकता."
      ]
    ]
  },
  ms: {
    "title": "Peluang poker — out, pot odds, pertembungan tangan | PokerTH",
    "desc": "Peluang Texas Hold’em dikira tepat: out dan peluang anda mendapatkannya, peraturan 2 dan 4, pot odds, dan berapa kerap AA menewaskan KK atau QQ menewaskan AK.",
    "ldHeadline": "Peluang poker: out, pot odds dan pertembungan sebelum flop",
    "ldDesc": "Peluang Texas Hold’em dikira dengan tepat: out, peraturan 2 dan 4, pot odds dan pertembungan sebelum flop.",
    "h1": "Peluang poker: out, pot odds dan pertembungan sebelum flop",
    "lead": "Keputusan poker yang baik bergantung pada beberapa angka: berapa besar kemungkinan tangan anda bertambah baik, berapa banyak yang perlu anda bayar untuk mengetahuinya, dan bagaimana dua tangan bersaing antara satu sama lain sebelum flop. Setiap angka di halaman ini dikira dengan tepat, bukan disalin daripada carta.",
    "calc": {
      "h2": "Kalkulator peluang poker",
      "intro": "Pilih dua kad anda dan, jika mahu, board serta tangan lawan. Kalkulator mengedarkan setiap kad yang tinggal — dengan tepat apabila boleh, melalui simulasi jika tidak — dan menunjukkan berapa kerap anda menang.",
      "you": "Tangan anda",
      "board": "Board",
      "opp": "Lawan (pilihan)",
      "players": "Lawan",
      "pick": "Ketik kad untuk meletakkannya dalam slot yang diserlahkan; ketik slot untuk mengosongkannya.",
      "clear": "Kosongkan",
      "win": "Menang",
      "tie": "Seri",
      "lose": "Kalah",
      "exact": "Tepat: setiap satu daripada {n} edaran yang mungkin.",
      "sim": "Simulasi {n} edaran rawak.",
      "working": "Mengira…",
      "need": "Pilih dua kad anda untuk melihat peluang anda.",
      "boardHint": "Board mengambil tiga kad (flop), kemudian empat, kemudian lima.",
      "oppHint": "Pilih kedua-dua kad lawan anda, atau tiada langsung.",
      "final": "Tangan akhir anda",
      "noscript": "Kalkulator ini memerlukan JavaScript. Jadual di bawah berfungsi tanpanya."
    },
    "outsH2": "Out: peluang anda untuk kena",
    "outsP": "Out ialah kad yang masih dalam dek yang menjadikan tangan anda calon pemenang. Pada flop, 47 kad belum dilihat: dengan 9 out, satu kad kena pada turn sebanyak {f9turn} daripada semua kali, dan menjelang river — dengan dua kad lagi akan datang — {f9river}.",
    "outsCols": [
      "Draw",
      "Out",
      "Turn",
      "River (dari turn)",
      "Turn atau river (dari flop)"
    ],
    "draws": {
      "gutshot": "Straight draw dalam (gutshot)",
      "twoPairFull": "Two Pair kepada Full House",
      "pairTrips": "One Pair kepada Two Pair atau Three of a Kind",
      "twoOver": "Dua overcard kepada One Pair",
      "setFull": "Set kepada Full House atau Four of a Kind",
      "oesd": "Straight draw terbuka dua hujung",
      "flush": "Flush draw",
      "flushGut": "Flush draw dan gutshot",
      "flushOesd": "Flush draw dan straight draw terbuka dua hujung"
    },
    "outsNote": "Ini ialah peluang untuk mendapat salah satu out anda. Ia tidak mengambil kira tambahan daripada dua kad berturut-turut (runner-runner), dan out yang turut memberi lawan tangan yang lebih baik sebenarnya bukan out.",
    "ruleH2": "Peraturan 2 dan 4",
    "ruleP": "Anggaran pantas di meja: darabkan out anda dengan 4 pada flop apabila anda akan melihat turn dan river, dan dengan 2 apabila hanya tinggal satu kad. Flush draw pada flop ialah 9 × 4 = 36%, berbanding {f9river} secara tepat. Peraturan ini terlebih menganggar draw yang besar: 15 out memberi 60%, angka sebenar ialah {f15river}.",
    "potH2": "Pot odds: patutkah anda call?",
    "potP": "Pot odds membandingkan apa yang perlu anda bayar dengan apa yang boleh anda menangi. Pot berisi 100 dan lawan anda bertaruh 50: anda call 50 untuk memenangi pot 200, jadi call itu perlu menang lebih daripada 50 ÷ 200 = 25% daripada semua kali untuk berbaloi. Dengan flush draw dan satu kad lagi akan datang, anda kena {f9one} daripada semua kali, jadi call terhadap pertaruhan apabila hanya river yang tinggal akan merugikan cip dalam jangka panjang. All-in pada flop, dengan dua kad lagi akan datang, draw yang sama kena {f9river}, dan call itu berbaloi.",
    "matchH2": "Pertembungan sebelum flop",
    "matchP": "Bagaimana dua tangan permulaan bersaing antara satu sama lain apabila kesemua lima kad board diedarkan, dikira atas setiap satu daripada {boards} board yang mungkin. Jenis kad sedikit penting: tangan di bawah tidak berkongsi jenis kad kecuali ditunjukkan sebagai sekad.",
    "matchCols": [
      "Tangan",
      "Lawan",
      "Menang",
      "Seri",
      "Kalah"
    ],
    "startH2": "Peluang tangan permulaan",
    "startP": "Terdapat {combos} tangan permulaan dua kad yang berbeza. Berapa kerap anda menerima:",
    "startCols": [
      "Tangan",
      "Peluang",
      "Lebih kurang satu tangan dalam"
    ],
    "starting": {
      "specificPair": "Pocket pair tertentu, contohnya ace",
      "anyPair": "Mana-mana pocket pair",
      "specificNonPair": "Tangan tanpa pasangan tertentu, contohnya ace-king",
      "specificSuited": "Tangan sekad tertentu, contohnya ace-king sekad",
      "anySuited": "Mana-mana dua kad sekad",
      "twoBroadway": "Dua kad sepuluh atau lebih tinggi"
    },
    "faqH2": "Soalan",
    "faq": [
      [
        "Apakah out dalam poker?",
        "Kad yang tinggal dalam dek yang akan memberi anda tangan terbaik. Kira hanya kad yang belum anda lihat: 47 pada flop, 46 pada turn."
      ],
      [
        "Berapa kerap pocket ace menewaskan king?",
        "Lebih kurang empat kali daripada lima: {aakk} apabila kesemua lima kad board diedarkan, manakala king menang {kkaa}."
      ],
      [
        "Adakah ace-king lawan pasangan sama seperti lambung syiling?",
        "Hampir, lawan pasangan sederhana: queen menang {qqak} lawan ace-king. Lawan pasangan kecil, ia lebih rapat lagi — pasangan dua menang {22ak}."
      ],
      [
        "Apakah pot odds?",
        "Harga sesuatu call berbanding pot yang boleh anda menangi. Jika peluang anda untuk menang lebih tinggi daripada bahagian pot akhir yang anda masukkan, call akan berbaloi dari masa ke masa."
      ],
      [
        "Adakah PokerTH menunjukkan peluang saya semasa permainan?",
        "Ya. Tab Peluang menamakan tangan terbaik anda pada masa itu dan peluang anda untuk menang semasa kad keluar, supaya anda boleh menyemak penaakulan anda sendiri di meja."
      ]
    ]
  },
  my: {
    "title": "ပိုကာ ဖြစ်နိုင်ခြေ ဇယား — outs၊ pot odds၊ လက်ချင်းယှဉ်ခြင်း | PokerTH",
    "desc": "Texas Hold’em ဖြစ်နိုင်ခြေကို အတိအကျ တွက်ထားသည်: outs နှင့် ကျလာနိုင်ခြေ၊ ၂ နှင့် ၄ စည်းမျဉ်း၊ pot odds၊ AA က KK ကို သို့မဟုတ် QQ က AK ကို မည်မျှ မကြာခဏ နိုင်သည်။",
    "ldHeadline": "ပိုကာ ဖြစ်နိုင်ခြေ: outs၊ pot odds နှင့် preflop လက်ချင်းယှဉ်ခြင်း",
    "ldDesc": "Texas Hold’em ဖြစ်နိုင်ခြေကို အတိအကျ တွက်ထားသည်: outs၊ ၂ နှင့် ၄ စည်းမျဉ်း၊ pot odds နှင့် preflop လက်ချင်းယှဉ်ခြင်း။",
    "h1": "ပိုကာ ဖြစ်နိုင်ခြေ: outs၊ pot odds နှင့် preflop လက်ချင်းယှဉ်ခြင်း",
    "lead": "ကောင်းမွန်သော ပိုကာဆုံးဖြတ်ချက်များသည် ကိန်းဂဏန်း အနည်းငယ်အပေါ် မူတည်သည်: သင့်လက် ပိုကောင်းလာနိုင်ခြေ မည်မျှရှိသည်၊ ထိုအရာကို သိရန် မည်မျှ ပေးရမည်၊ flop မတိုင်မီ လက်နှစ်ခု အချင်းချင်း မည်သို့ ရပ်တည်နေသည်။ ဤစာမျက်နှာရှိ ကိန်းဂဏန်းတိုင်းကို ဇယားတစ်ခုမှ ကူးယူခြင်းမဟုတ်ဘဲ အတိအကျ တွက်ချက်ထားသည်။",
    "calc": {
      "h2": "ပိုကာ ဖြစ်နိုင်ခြေ တွက်စက်",
      "intro": "သင့်ဖဲနှစ်ချပ်ကို ရွေးပါ၊ လိုလျှင် စားပွဲဖဲများနှင့် ပြိုင်ဘက်တစ်ဦး၏ လက်ကိုလည်း ရွေးနိုင်သည်။ တွက်စက်သည် ကျန်ရှိသော ဖဲတိုင်းကို ဝေကြည့်ပြီး — ဖြစ်နိုင်သည့်အခါတိုင်း အတိအကျ၊ မဖြစ်နိုင်လျှင် simulation ဖြင့် — သင် မည်မျှ မကြာခဏ နိုင်သည်ကို ပြသည်။",
      "you": "သင့်လက်",
      "board": "စားပွဲဖဲများ",
      "opp": "ပြိုင်ဘက် (ရွေးချယ်နိုင်)",
      "players": "ပြိုင်ဘက်များ",
      "pick": "ဖဲတစ်ချပ်ကို တို့၍ အရောင်ပြထားသော နေရာတွင် ထည့်ပါ; နေရာတစ်ခုကို တို့၍ ရှင်းပါ။",
      "clear": "ရှင်းရန်",
      "win": "နိုင်",
      "tie": "သရေ",
      "lose": "ရှုံး",
      "exact": "အတိအကျ: ဖြစ်နိုင်သော ဝေပုံ {n} မျိုးလုံး။",
      "sim": "ကျပန်း ဝေပုံ {n} ခု၏ simulation။",
      "working": "တွက်ချက်နေသည်…",
      "need": "သင့်ဖြစ်နိုင်ခြေကို ကြည့်ရန် ဖဲနှစ်ချပ် ရွေးပါ။",
      "boardHint": "စားပွဲဖဲများသည် သုံးချပ် (flop)၊ ထို့နောက် လေးချပ်၊ ထို့နောက် ငါးချပ် ဖြစ်သည်။",
      "oppHint": "ပြိုင်ဘက်၏ ဖဲနှစ်ချပ်လုံးကို ရွေးပါ၊ သို့မဟုတ် တစ်ချပ်မျှ မရွေးပါနှင့်။",
      "final": "သင့်နောက်ဆုံးလက်",
      "noscript": "တွက်စက်သည် JavaScript လိုအပ်သည်။ အောက်ပါ ဇယားများမှာ ၎င်းမပါဘဲ အလုပ်လုပ်သည်။"
    },
    "outsH2": "Outs: ဖဲကျလာနိုင်ခြေ",
    "outsP": "out ဆိုသည်မှာ သင့်လက်ကို နိုင်ဖွယ်ရှိသောလက် ဖြစ်စေမည့် ဖဲထုပ်ထဲ ကျန်နေသေးသော ဖဲတစ်ချပ် ဖြစ်သည်။ flop တွင် မမြင်ရသေးသော ဖဲ ၄၇ ချပ် ရှိသည်: outs ၉ ချပ်ဖြင့် turn တွင် ဖဲတစ်ချပ် ကျလာနိုင်ခြေ {f9turn} ရှိပြီး river အထိ — ဖဲနှစ်ချပ် လာရန်ကျန်လျှင် — {f9river} ရှိသည်။",
    "outsCols": [
      "Draw",
      "Outs",
      "Turn",
      "River (turn မှ)",
      "Turn သို့မဟုတ် river (flop မှ)"
    ],
    "draws": {
      "gutshot": "အတွင်း straight draw (gutshot)",
      "twoPairFull": "Two Pair → Full House",
      "pairTrips": "One Pair → Two Pair သို့မဟုတ် Three of a Kind",
      "twoOver": "overcard နှစ်ချပ် → One Pair",
      "setFull": "Set → Full House သို့မဟုတ် Four of a Kind",
      "oesd": "နှစ်ဖက်ပွင့် straight draw",
      "flush": "Flush draw",
      "flushGut": "Flush draw နှင့် gutshot",
      "flushOesd": "Flush draw နှင့် နှစ်ဖက်ပွင့် straight draw"
    },
    "outsNote": "ဤအရာများသည် သင့် outs တစ်ချပ်ချပ် ကျလာနိုင်ခြေများ ဖြစ်သည်။ runner-runner (ဆက်တိုက်ဖဲနှစ်ချပ်) မှ ရနိုင်သော အပိုအခွင့်အလမ်းများ မပါဝင်ပါ၊ ပြိုင်ဘက်ကိုလည်း ပိုကောင်းသောလက် ပေးမည့် out သည် အမှန်တကယ် out မဟုတ်ပါ။",
    "ruleH2": "၂ နှင့် ၄ စည်းမျဉ်း",
    "ruleP": "စားပွဲတွင် အမြန်ခန့်မှန်းနည်း: flop တွင် turn ရော river ပါ မြင်ရမည်ဆိုလျှင် သင့် outs ကို ၄ ဖြင့် မြှောက်ပါ၊ ဖဲတစ်ချပ်သာ လာရန်ကျန်လျှင် ၂ ဖြင့် မြှောက်ပါ။ flop ပေါ်ရှိ flush draw သည် ၉ × ၄ = ၃၆% ဖြစ်ပြီး အတိအကျမှာ {f9river} ဖြစ်သည်။ ဤစည်းမျဉ်းသည် draw ကြီးများကို ပိုခန့်မှန်းသည်: outs ၁၅ ချပ်ဆိုလျှင် ၆၀% ရပြီး အမှန်ကိန်းဂဏန်းမှာ {f15river} ဖြစ်သည်။",
    "potH2": "Pot odds: call လုပ်သင့်သလား။",
    "potP": "Pot odds သည် သင်ပေးရမည့်ပမာဏကို သင်နိုင်နိုင်သည့်ပမာဏနှင့် နှိုင်းယှဉ်သည်။ ပေါ့တ်ထဲတွင် ၁၀၀ ရှိပြီး ပြိုင်ဘက်က ၅၀ လောင်းသည်: ၂၀၀ ရှိသော ပေါ့တ်ကို နိုင်ရန် ၅၀ call လုပ်ရသည်၊ ထို့ကြောင့် အမြတ်ရရန် call သည် အကြိမ်ရေ၏ ၅၀ ÷ ၂၀၀ = ၂၅% ထက် ပို၍ နိုင်ရမည်။ flush draw နှင့် ဖဲတစ်ချပ်သာ လာရန်ကျန်လျှင် {f9one} သာ ကျလာသည်၊ ထို့ကြောင့် river သာ ကျန်ချိန်တွင် လောင်းကြေးကို call လုပ်ခြင်းသည် ရေရှည်တွင် ချစ်ပ်များ ဆုံးရှုံးစေသည်။ flop တွင် All-In ဖြစ်ပြီး ဖဲနှစ်ချပ်လုံး လာရန်ကျန်လျှင် ထို draw တူသည် {f9river} ကျလာပြီး call လုပ်ခြင်းက တန်သည်။",
    "matchH2": "Preflop လက်ချင်းယှဉ်ခြင်း",
    "matchP": "စားပွဲဖဲ ငါးချပ်လုံး ဝေပြီးသောအခါ စတင်လက်နှစ်ခု အချင်းချင်း မည်သို့ ရလဒ်ထွက်သည်ကို ဖြစ်နိုင်သော စားပွဲဖဲ {boards} မျိုးလုံးအပေါ် ရေတွက်ထားသည်။ အပွင့်များ အနည်းငယ် အရေးပါသည်: အောက်ပါလက်များသည် suited ဟု ပြထားခြင်းမရှိလျှင် အပွင့်တစ်ခုမျှ မတူပါ။",
    "matchCols": [
      "လက်",
      "ယှဉ်ပြိုင်လက်",
      "နိုင်",
      "သရေ",
      "ရှုံး"
    ],
    "startH2": "စတင်လက် ဖြစ်နိုင်ခြေ",
    "startP": "မတူညီသော ဖဲနှစ်ချပ် စတင်လက် {combos} မျိုး ရှိသည်။ သင် မည်မျှ မကြာခဏ ရသနည်း:",
    "startCols": [
      "လက်",
      "ဖြစ်နိုင်ခြေ",
      "ခန့်မှန်း လက်ပေါင်း ဤမျှတွင် တစ်ကြိမ်"
    ],
    "starting": {
      "specificPair": "သတ်မှတ်ထားသော pocket pair တစ်ခု၊ ဥပမာ ace နှစ်ချပ်",
      "anyPair": "မည်သည့် pocket pair မဆို",
      "specificNonPair": "သတ်မှတ်ထားသော pair မဟုတ်သည့်လက်၊ ဥပမာ ace-king",
      "specificSuited": "သတ်မှတ်ထားသော suited လက်၊ ဥပမာ ace-king suited",
      "anySuited": "အပွင့်တူ ဖဲနှစ်ချပ် မည်သည့်ဟာမဆို",
      "twoBroadway": "ဆယ် သို့မဟုတ် ထို့ထက်မြင့်သော ဖဲနှစ်ချပ်"
    },
    "faqH2": "မေးခွန်းများ",
    "faq": [
      [
        "ပိုကာတွင် outs ဆိုသည်မှာ အဘယ်နည်း။",
        "သင့်ကို အကောင်းဆုံးလက် ပေးမည့် ဖဲထုပ်ထဲ ကျန်သေးသော ဖဲများ။ သင် မမြင်ရသေးသော ဖဲများကိုသာ ရေတွက်ပါ: flop တွင် ၄၇ ချပ်၊ turn တွင် ၄၆ ချပ်။"
      ],
      [
        "Pocket ace များက king များကို မည်မျှ မကြာခဏ နိုင်သနည်း။",
        "ငါးကြိမ်လျှင် လေးကြိမ်ခန့်: စားပွဲဖဲ ငါးချပ်လုံး ဝေသောအခါ {aakk} နိုင်ပြီး king များက {kkaa} နိုင်သည်။"
      ],
      [
        "Pair တစ်တွဲကို ace-king နှင့် ယှဉ်လျှင် ခေါင်းပန်းလှန်သလို ဖြစ်သလား။",
        "အလယ်အလတ် pair နှင့်ဆိုလျှင် နီးပါး ဖြစ်သည်: queen များက ace-king ကို {qqak} နိုင်သည်။ pair ငယ်နှင့်ဆိုလျှင် ပို၍ပင် နီးကပ်သည် — two နှစ်ချပ်က {22ak} နိုင်သည်။"
      ],
      [
        "Pot odds ဆိုသည်မှာ အဘယ်နည်း။",
        "call တစ်ခု၏ ဈေးနှုန်းကို သင်နိုင်နိုင်သော ပေါ့တ်နှင့် နှိုင်းယှဉ်ခြင်း။ သင့်နိုင်ခြေသည် နောက်ဆုံးပေါ့တ်ထဲ သင်ထည့်သော ဝေစုထက် မြင့်လျှင် call လုပ်ခြင်းသည် ကာလရှည်တွင် အမြတ်ရစေသည်။"
      ],
      [
        "ဂိမ်းကစားနေစဉ် PokerTH က ကျွန်ုပ်၏ ဖြစ်နိုင်ခြေကို ပြသလား။",
        "ဟုတ်ကဲ့။ «ဖြစ်နိုင်ခြေ» တက်ဘ်သည် သင့်လက်ရှိ အကောင်းဆုံးလက်နှင့် ဖဲများ ထွက်လာသည်နှင့်အမျှ သင့်နိုင်ခြေကို ပြသပေးသဖြင့် စားပွဲတွင်ပင် သင့်ကိုယ်ပိုင် တွေးခေါ်ပုံကို စစ်ဆေးနိုင်သည်။"
      ]
    ]
  },
  nb: {
    "title": "Pokerodds-tabell — outs, pottodds, hender mot hverandre | PokerTH",
    "desc": "Texas Hold’em-odds regnet ut helt nøyaktig: outs og sjansen for å treffe dem, 2- og 4-regelen, pottodds, og hvor ofte AA slår KK eller QQ slår AK.",
    "ldHeadline": "Pokerodds: outs, pottodds og preflop-oppgjør",
    "ldDesc": "Texas Hold’em-odds beregnet nøyaktig: outs, 2- og 4-regelen, pottodds og preflop-oppgjør.",
    "h1": "Pokerodds: outs, pottodds og preflop-oppgjør",
    "lead": "Gode pokeravgjørelser handler om noen få tall: hvor sannsynlig det er at hånden din blir bedre, hvor mye du må betale for å finne det ut, og hvordan to hender står mot hverandre før floppen. Hvert tall på denne siden er beregnet nøyaktig, ikke kopiert fra en tabell.",
    "calc": {
      "h2": "Pokerodds-kalkulator",
      "intro": "Velg de to kortene dine og, om du vil, bordet og hånden til en motstander. Kalkulatoren deler ut alle gjenværende kort — nøyaktig når den kan, ellers ved simulering — og viser hvor ofte du vinner.",
      "you": "Din hånd",
      "board": "Bord",
      "opp": "Motstander (valgfritt)",
      "players": "Motstandere",
      "pick": "Trykk på et kort for å legge det i den markerte plassen; trykk på en plass for å tømme den.",
      "clear": "Tøm",
      "win": "Seier",
      "tie": "Uavgjort",
      "lose": "Tap",
      "exact": "Nøyaktig: hver eneste av de {n} mulige utdelingene.",
      "sim": "Simulering av {n} tilfeldige utdelinger.",
      "working": "Beregner…",
      "need": "Velg de to kortene dine for å se oddsen din.",
      "boardHint": "Bordet tar tre kort (floppen), så fire, så fem.",
      "oppHint": "Velg begge kortene til motstanderen, eller ingen.",
      "final": "Din endelige hånd",
      "noscript": "Kalkulatoren trenger JavaScript. Tabellene nedenfor virker uten."
    },
    "outsH2": "Outs: sjansen for å treffe",
    "outsP": "En out er et kort som fortsatt er i bunken og gjør hånden din til den sannsynlige vinneren. På floppen er 47 kort usett: med 9 outs treffer ett kort på turn i {f9turn} av tilfellene, og innen river — med to kort igjen — i {f9river}.",
    "outsCols": [
      "Trekning",
      "Outs",
      "Turn",
      "River (fra turn)",
      "Turn eller river (fra floppen)"
    ],
    "draws": {
      "gutshot": "Innvendig stigetrekning (gutshot)",
      "twoPairFull": "To par til fullt hus",
      "pairTrips": "Par til to par eller tress",
      "twoOver": "To overkort til et par",
      "setFull": "Set til fullt hus eller firtall",
      "oesd": "Åpen stigetrekning",
      "flush": "Fargetrekning",
      "flushGut": "Fargetrekning og gutshot",
      "flushOesd": "Fargetrekning og åpen stigetrekning"
    },
    "outsNote": "Dette er sjansene for å treffe en av outsene dine. Runner-runner-ekstra (bakdør) er ikke tatt med, og en out som også gir en motstander en bedre hånd, er egentlig ikke en out.",
    "ruleH2": "2- og 4-regelen",
    "ruleP": "Et raskt overslag ved bordet: gang outsene dine med 4 på floppen når du får se både turn og river, og med 2 når bare ett kort gjenstår. En fargetrekning på floppen gir 9 × 4 = 36 %, mot nøyaktig {f9river}. Regelen overvurderer store trekninger: 15 outs gir 60 %, det reelle tallet er {f15river}.",
    "potH2": "Pottodds: bør du syne?",
    "potP": "Pottodds sammenligner hva du må betale med hva du kan vinne. Potten er på 100 og motstanderen satser 50: du syner 50 for å vinne en pott på 200, så synet må vinne mer enn 50 ÷ 200 = 25 % av gangene for å lønne seg. Med en fargetrekning og ett kort igjen treffer du i {f9one} av tilfellene, så å syne en innsats når bare river gjenstår, taper sjetonger i det lange løp. All-in på floppen, med begge kortene igjen, treffer den samme trekningen i {f9river}, og da er det verdt å syne.",
    "matchH2": "Preflop-oppgjør",
    "matchP": "Hvordan to starthender gjør det mot hverandre når alle fem felleskortene deles ut, telt over hvert eneste av de {boards} mulige bordene. Fargene betyr litt: hendene nedenfor deler ingen farge med mindre de er vist i samme farge.",
    "matchCols": [
      "Hånd",
      "Mot",
      "Vinner",
      "Uavgjort",
      "Taper"
    ],
    "startH2": "Odds for starthender",
    "startP": "Det finnes {combos} ulike starthender med to kort. Så ofte får du utdelt:",
    "startCols": [
      "Hånd",
      "Sjanse",
      "Omtrent én hånd av"
    ],
    "starting": {
      "specificPair": "Et bestemt par på hånden, for eksempel ess",
      "anyPair": "Et hvilket som helst par på hånden",
      "specificNonPair": "En bestemt hånd uten par, for eksempel ess-konge",
      "specificSuited": "En bestemt hånd i samme farge, for eksempel ess-konge i samme farge",
      "anySuited": "Hvilke som helst to kort i samme farge",
      "twoBroadway": "To kort fra tier og oppover"
    },
    "faqH2": "Spørsmål",
    "faq": [
      [
        "Hva er outs i poker?",
        "Kortene som er igjen i bunken og ville gitt deg den beste hånden. Tell bare kortene du ikke har sett: 47 på floppen, 46 på turn."
      ],
      [
        "Hvor ofte slår et par ess et par konger?",
        "Omtrent fire ganger av fem: {aakk} når alle fem felleskortene deles ut, mens kongene vinner {kkaa}."
      ],
      [
        "Er ess-konge mot et par et myntkast?",
        "Nesten, mot et middels par: damer vinner {qqak} mot ess-konge. Mot et lite par er det enda jevnere — toere vinner {22ak}."
      ],
      [
        "Hva er pottodds?",
        "Prisen for å syne sammenlignet med potten du kan vinne. Er sjansen din for å vinne større enn den andelen av den endelige potten du selv legger inn, lønner det seg å syne over tid."
      ],
      [
        "Viser PokerTH oddsen min under spillet?",
        "Ja. Fanen Sjanser viser den beste hånden din akkurat nå og sjansen din for å vinne etter hvert som kortene kommer, så du kan sjekke dine egne vurderinger ved bordet."
      ]
    ]
  },
  ne: {
    "title": "पोकर सम्भावना — आउट, पोटको सम्भावना, ह्यान्ड मुकाबला | PokerTH",
    "desc": "Texas Hold’em का सम्भावना ठ्याक्कै गणना गरिएका: आउट र तिनलाई पाउने तपाईंको सम्भावना, 2 र 4 को नियम, पोटको सम्भावना, र AA ले KK लाई वा QQ ले AK लाई कति पटक हराउँछ।",
    "ldHeadline": "पोकर सम्भावना: आउट, पोटको सम्भावना र प्रि-फ्लप मुकाबला",
    "ldDesc": "Texas Hold’em का सम्भावना ठ्याक्कै गणना गरिएका: आउट, 2 र 4 को नियम, पोटको सम्भावना र प्रि-फ्लप मुकाबला।",
    "h1": "पोकर सम्भावना: आउट, पोटको सम्भावना र प्रि-फ्लप मुकाबला",
    "lead": "पोकरका राम्रा निर्णय केही अङ्कमा आएर टुङ्गिन्छन्: तपाईंको ह्यान्ड सुध्रने सम्भावना कति छ, त्यो थाहा पाउन कति तिर्नुपर्छ, र फ्लपअघि दुई ह्यान्ड एकअर्काविरुद्ध कस्ता छन्। यस पृष्ठका सबै अङ्क ठ्याक्कै गणना गरिएका हुन्, कुनै तालिकाबाट सारिएका होइनन्।",
    "calc": {
      "h2": "पोकर सम्भावना क्याल्कुलेटर",
      "intro": "आफ्ना दुई कार्ड छान्नुहोस्, र चाहनुहुन्छ भने बोर्ड र प्रतिद्वन्द्वीको ह्यान्ड पनि। क्याल्कुलेटरले बाँकी सबै कार्ड बाँडेर हेर्छ — सम्भव भएसम्म ठ्याक्कै, नत्र सिमुलेसनद्वारा — र तपाईं कति पटक जित्नुहुन्छ भनेर देखाउँछ।",
      "you": "तपाईंको ह्यान्ड",
      "board": "बोर्ड",
      "opp": "प्रतिद्वन्द्वी (ऐच्छिक)",
      "players": "प्रतिद्वन्द्वीहरू",
      "pick": "कार्डलाई उज्यालो खाली ठाउँमा राख्न त्यसमा छुनुहोस्; ठाउँ खाली गर्न त्यसमा छुनुहोस्।",
      "clear": "खाली गर्नुहोस्",
      "win": "जित",
      "tie": "बराबरी",
      "lose": "हार",
      "exact": "ठ्याक्कै: सम्भावित सबै {n} बाँडाइ।",
      "sim": "{n} अनियमित बाँडाइको सिमुलेसन।",
      "working": "गणना हुँदैछ…",
      "need": "आफ्नो सम्भावना हेर्न आफ्ना दुई कार्ड छान्नुहोस्।",
      "boardHint": "बोर्डमा पहिले तीन कार्ड (फ्लप), त्यसपछि चार, त्यसपछि पाँच कार्ड राखिन्छन्।",
      "oppHint": "प्रतिद्वन्द्वीका दुवै कार्ड छान्नुहोस्, वा एउटा पनि नछान्नुहोस्।",
      "final": "तपाईंको अन्तिम ह्यान्ड",
      "noscript": "क्याल्कुलेटरलाई JavaScript चाहिन्छ। तलका तालिकाहरू त्यसबिना पनि चल्छन्।"
    },
    "outsH2": "आउट: कार्ड लाग्ने तपाईंको सम्भावना",
    "outsP": "आउट भनेको डेकमा अझै रहेको त्यस्तो कार्ड हो जसले तपाईंको ह्यान्डलाई सम्भावित विजेता बनाउँछ। फ्लपमा 47 कार्ड नदेखिएका हुन्छन्: 9 आउट हुँदा टर्नमा एउटा कार्ड लाग्ने सम्भावना {f9turn} हुन्छ, र रिभरसम्म — दुई कार्ड आउन बाँकी हुँदा — {f9river}।",
    "outsCols": [
      "ड्र",
      "आउट",
      "टर्न",
      "रिभर (टर्नबाट)",
      "टर्न वा रिभर (फ्लपबाट)"
    ],
    "draws": {
      "gutshot": "भित्री स्ट्रेट ड्र (गटशट)",
      "twoPairFull": "टु पेयरबाट फुल हाउस",
      "pairTrips": "वन पेयरबाट टु पेयर वा थ्री अफ अ काइन्ड",
      "twoOver": "दुई ओभरकार्डबाट जोडी",
      "setFull": "सेटबाट फुल हाउस वा फोर अफ अ काइन्ड",
      "oesd": "दुवैतर्फ खुला स्ट्रेट ड्र",
      "flush": "फ्लस ड्र",
      "flushGut": "फ्लस ड्र र गटशट",
      "flushOesd": "फ्लस ड्र र दुवैतर्फ खुला स्ट्रेट ड्र"
    },
    "outsNote": "यी तपाईंका आउटमध्ये कुनै एउटा पाउने सम्भावना हुन्। यसमा रनर-रनरबाट हुने थप सम्भावना समावेश छैन, र प्रतिद्वन्द्वीलाई पनि अझ राम्रो ह्यान्ड दिने आउट वास्तवमा आउट होइन।",
    "ruleH2": "2 र 4 को नियम",
    "ruleP": "टेबलमा छिटो अनुमान: टर्न र रिभर दुवै हेर्न पाइने हो भने फ्लपमा आफ्ना आउटलाई 4 ले गुणन गर्नुहोस्, र एउटा मात्र कार्ड आउन बाँकी हुँदा 2 ले। फ्लपमा फ्लस ड्र 9 × 4 = 36% हुन्छ, जबकि ठ्याक्कै अङ्क {f9river} हो। यो नियमले ठूला ड्रलाई बढी आँक्छ: 15 आउटले 60% दिन्छ, वास्तविक अङ्क {f15river} हो।",
    "potH2": "पोटको सम्भावना: Call गर्ने कि नगर्ने?",
    "potP": "पोटको सम्भावनाले तपाईंले तिर्नुपर्ने रकमलाई जित्न सकिने रकमसँग तुलना गर्छ। पोटमा 100 छ र प्रतिद्वन्द्वीले 50 बाजी लगाउँछ: तपाईं 200 को पोट जित्न 50 Call गर्नुहुन्छ, त्यसैले फाइदा हुन Call ले 50 ÷ 200 = 25% भन्दा बढी पटक जित्नुपर्छ। फ्लस ड्र र एउटा कार्ड आउन बाँकी हुँदा कार्ड लाग्ने सम्भावना {f9one} हुन्छ, त्यसैले रिभर मात्र बाँकी हुँदा बाजी Call गर्दा लामो समयमा चिप्स गुम्छन्। फ्लपमा All-In हुँदा, दुवै कार्ड आउन बाँकी भएकाले, त्यही ड्र लाग्ने सम्भावना {f9river} हुन्छ, र Call गर्नु उचित हुन्छ।",
    "matchH2": "प्रि-फ्लप मुकाबला",
    "matchP": "बोर्डका पाँचै कार्ड बाँडिँदा दुई सुरुआती ह्यान्ड एकअर्काविरुद्ध कस्तो गर्छन्, सम्भावित सबै {boards} बोर्डमा गनेर। सूटको अलिकति महत्त्व हुन्छ: तलका ह्यान्डहरू सुटेड भनी नदेखाइएसम्म एउटै सूट साझा गर्दैनन्।",
    "matchCols": [
      "ह्यान्ड",
      "विरुद्ध",
      "जित",
      "बराबरी",
      "हार"
    ],
    "startH2": "सुरुआती ह्यान्डको सम्भावना",
    "startP": "दुई कार्डका {combos} फरक सुरुआती ह्यान्ड हुन्छन्। तपाईंलाई कति पटक बाँडिन्छ:",
    "startCols": [
      "ह्यान्ड",
      "सम्भावना",
      "लगभग यति ह्यान्डमा एक पटक"
    ],
    "starting": {
      "specificPair": "कुनै निश्चित पकेट जोडी, जस्तै एक्का",
      "anyPair": "जुनसुकै पकेट जोडी",
      "specificNonPair": "जोडी नभएको कुनै निश्चित ह्यान्ड, जस्तै एक्का-बादशाह",
      "specificSuited": "कुनै निश्चित सुटेड ह्यान्ड, जस्तै सुटेड एक्का-बादशाह",
      "anySuited": "एउटै सूटका जुनसुकै दुई कार्ड",
      "twoBroadway": "दस वा सोभन्दा माथिका दुई कार्ड"
    },
    "faqH2": "प्रश्नहरू",
    "faq": [
      [
        "पोकरमा आउट भनेको के हो?",
        "डेकमा बाँकी रहेका ती कार्ड जसले तपाईंलाई सबैभन्दा राम्रो ह्यान्ड दिन्छन्। आफूले नदेखेका कार्ड मात्र गन्नुहोस्: फ्लपमा 47, टर्नमा 46।"
      ],
      [
        "पकेट एक्काले बादशाहको जोडीलाई कति पटक हराउँछ?",
        "लगभग पाँचमा चार पटक: बोर्डका पाँचै कार्ड बाँडिँदा {aakk}, र बादशाहले {kkaa} जित्छ।"
      ],
      [
        "जोडीविरुद्ध एक्का-बादशाह सिक्का उछालजस्तै हो?",
        "लगभग, बीचको जोडीविरुद्ध: बेगमको जोडीले एक्का-बादशाहविरुद्ध {qqak} जित्छ। सानो जोडीविरुद्ध झन् नजिक हुन्छ — दुरीको जोडीले {22ak} जित्छ।"
      ],
      [
        "पोटको सम्भावना भनेको के हो?",
        "जित्न सकिने पोटको तुलनामा Call को मूल्य। अन्तिम पोटमा तपाईंले हाल्ने हिस्साभन्दा तपाईंको जित्ने सम्भावना बढी छ भने, समयक्रममा Call फाइदाजनक हुन्छ।"
      ],
      [
        "के PokerTH ले खेलका बेला मेरो सम्भावना देखाउँछ?",
        "हो। सम्भावना ट्याबले कार्ड खुल्दै जाँदा तपाईंको हालको उत्कृष्ट ह्यान्डको नाम र जित्ने सम्भावना देखाउँछ, जसले गर्दा तपाईं टेबलमै आफ्नो तर्क जाँच्न सक्नुहुन्छ।"
      ]
    ]
  },
  nl: {
    "title": "Pokerkansen-tabel — outs, pot odds, matchups | PokerTH",
    "desc": "Texas Hold’em-kansen exact berekend: outs en je kans om ze te raken, de regel van 2 en 4, pot odds, en hoe vaak AA wint van KK of QQ van AK.",
    "ldHeadline": "Pokerkansen: outs, pot odds en preflop-matchups",
    "ldDesc": "Texas Hold’em-kansen exact berekend: outs, de regel van 2 en 4, pot odds en preflop-matchups.",
    "h1": "Pokerkansen: outs, pot odds en preflop-matchups",
    "lead": "Goede pokerbeslissingen draaien om een paar getallen: hoe groot de kans is dat je hand beter wordt, hoeveel je moet betalen om dat te zien, en hoe twee handen er vóór de flop tegenover elkaar voor staan. Elk getal op deze pagina is exact berekend, niet overgenomen uit een tabel.",
    "calc": {
      "h2": "Pokerkansen-calculator",
      "intro": "Kies je twee kaarten en, als je wilt, het bord en de hand van een tegenstander. De calculator deelt alle resterende kaarten uit — exact waar dat kan, anders via simulatie — en laat zien hoe vaak je wint.",
      "you": "Jouw hand",
      "board": "Bord",
      "opp": "Tegenstander (optioneel)",
      "players": "Tegenstanders",
      "pick": "Tik op een kaart om hem in het gemarkeerde vak te leggen; tik op een vak om het leeg te maken.",
      "clear": "Wissen",
      "win": "Winst",
      "tie": "Gelijk",
      "lose": "Verlies",
      "exact": "Exact: alle {n} mogelijke verdelingen.",
      "sim": "Simulatie van {n} willekeurige verdelingen.",
      "working": "Bezig met berekenen…",
      "need": "Kies je twee kaarten om je kansen te zien.",
      "boardHint": "Het bord krijgt eerst drie kaarten (de flop), dan vier, dan vijf.",
      "oppHint": "Kies beide kaarten van je tegenstander, of geen.",
      "final": "Je uiteindelijke hand",
      "noscript": "De calculator heeft JavaScript nodig. De tabellen hieronder werken ook zonder."
    },
    "outsH2": "Outs: je kans om te raken",
    "outsP": "Een out is een kaart die nog in het spel zit en van jouw hand de waarschijnlijke winnaar maakt. Op de flop zijn 47 kaarten onbekend: met 9 outs valt er op de turn in {f9turn} van de gevallen een out, en tot en met de river — met nog twee kaarten te gaan — in {f9river}.",
    "outsCols": [
      "Trekking",
      "Outs",
      "Turn",
      "River (vanaf de turn)",
      "Turn of river (vanaf de flop)"
    ],
    "draws": {
      "gutshot": "Binnenstraat-trekking (gutshot)",
      "twoPairFull": "Twee Paar naar Full House",
      "pairTrips": "Paar naar Twee Paar of Drieling",
      "twoOver": "Twee overkaarten naar een paar",
      "setFull": "Set naar Full House of Vierling",
      "oesd": "Open straattrekking (open-ended)",
      "flush": "Flushtrekking",
      "flushGut": "Flushtrekking en gutshot",
      "flushOesd": "Flushtrekking en open straattrekking"
    },
    "outsNote": "Dit zijn de kansen om een van je outs te raken. Runner-runner-extra’s tellen niet mee, en een out die een tegenstander ook een betere hand geeft, is eigenlijk geen out.",
    "ruleH2": "De regel van 2 en 4",
    "ruleP": "Een snelle schatting aan tafel: vermenigvuldig je outs met 4 op de flop als je zowel de turn als de river te zien krijgt, en met 2 als er nog maar één kaart komt. Een flushtrekking op de flop geeft 9 × 4 = 36%, tegenover exact {f9river}. De regel overschat grote trekkingen: 15 outs geeft 60%, terwijl het echte getal {f15river} is.",
    "potH2": "Pot odds: moet je callen?",
    "potP": "Pot odds zetten wat je moet betalen af tegen wat je kunt winnen. In de pot zit 100 en je tegenstander zet 50 in: je callt 50 om een pot van 200 te winnen, dus de call moet in meer dan 50 ÷ 200 = 25% van de gevallen winnen om zich terug te betalen. Met een flushtrekking en nog één kaart te gaan raak je in {f9one} van de gevallen, dus een inzet callen als alleen de river nog komt, kost op den duur fiches. All-in op de flop, met nog beide kaarten te gaan, raakt dezelfde trekking in {f9river}, en dan is de call de moeite waard.",
    "matchH2": "Preflop-matchups",
    "matchP": "Hoe twee starthanden het tegen elkaar doen als alle vijf bordkaarten worden gedeeld, geteld over elk van de {boards} mogelijke borden. Kleuren tellen een beetje mee: de handen hieronder delen geen kleur, tenzij ze als suited worden getoond.",
    "matchCols": [
      "Hand",
      "Tegen",
      "Wint",
      "Gelijk",
      "Verliest"
    ],
    "startH2": "Kansen op starthanden",
    "startP": "Er zijn {combos} verschillende starthanden van twee kaarten. Hoe vaak je krijgt:",
    "startCols": [
      "Hand",
      "Kans",
      "Ongeveer één hand op"
    ],
    "starting": {
      "specificPair": "Een bepaald pocketpaar, zoals azen",
      "anyPair": "Een willekeurig pocketpaar",
      "specificNonPair": "Een bepaalde hand zonder paar, zoals aas-heer",
      "specificSuited": "Een bepaalde suited hand, zoals aas-heer suited",
      "anySuited": "Twee willekeurige kaarten van dezelfde kleur",
      "twoBroadway": "Twee kaarten van tien of hoger"
    },
    "faqH2": "Vragen",
    "faq": [
      [
        "Wat zijn outs bij poker?",
        "De kaarten die nog in het spel zitten en je de beste hand zouden geven. Tel alleen de kaarten die je niet hebt gezien: 47 op de flop, 46 op de turn."
      ],
      [
        "Hoe vaak winnen pocket azen van heren?",
        "Ongeveer vier op de vijf keer: {aakk} als alle vijf bordkaarten worden gedeeld, terwijl de heren {kkaa} winnen."
      ],
      [
        "Is aas-heer tegen een paar een coinflip?",
        "Bijna, tegen een middelhoog paar: vrouwen winnen {qqak} tegen aas-heer. Tegen een klein paar ligt het nog dichter bij elkaar — tweeën winnen {22ak}."
      ],
      [
        "Wat zijn pot odds?",
        "De prijs van een call vergeleken met de pot die je kunt winnen. Is je winkans groter dan het deel van de uiteindelijke pot dat jij inlegt, dan betaalt callen zich op den duur terug."
      ],
      [
        "Toont PokerTH mijn kansen tijdens een spel?",
        "Ja. Het tabblad Kansen noemt je huidige beste hand en je winkans terwijl de kaarten vallen, zodat je je eigen redenering aan tafel kunt controleren."
      ]
    ]
  },
  pa: {
    "title": "ਪੋਕਰ ਓਡਸ ਚਾਰਟ — ਆਊਟਸ, ਪਾਟ ਓਡਸ, ਹੱਥਾਂ ਦੇ ਮੁਕਾਬਲੇ | PokerTH",
    "desc": "ਬਿਲਕੁਲ ਸਹੀ ਗਿਣੇ Texas Hold’em ਓਡਸ: ਆਊਟਸ ਅਤੇ ਉਹਨਾਂ ਦੇ ਲੱਗਣ ਦੀ ਸੰਭਾਵਨਾ, 2 ਅਤੇ 4 ਦਾ ਨਿਯਮ, ਪਾਟ ਓਡਸ, ਅਤੇ AA ਕਿੰਨੀ ਵਾਰ KK ਨੂੰ ਜਾਂ QQ ਕਿੰਨੀ ਵਾਰ AK ਨੂੰ ਹਰਾਉਂਦਾ ਹੈ।",
    "ldHeadline": "ਪੋਕਰ ਓਡਸ: ਆਊਟਸ, ਪਾਟ ਓਡਸ ਅਤੇ ਪ੍ਰੀ-ਫਲਾਪ ਮੁਕਾਬਲੇ",
    "ldDesc": "ਬਿਲਕੁਲ ਸਹੀ ਗਿਣੇ Texas Hold’em ਓਡਸ: ਆਊਟਸ, 2 ਅਤੇ 4 ਦਾ ਨਿਯਮ, ਪਾਟ ਓਡਸ ਅਤੇ ਪ੍ਰੀ-ਫਲਾਪ ਮੁਕਾਬਲੇ।",
    "h1": "ਪੋਕਰ ਓਡਸ: ਆਊਟਸ, ਪਾਟ ਓਡਸ ਅਤੇ ਪ੍ਰੀ-ਫਲਾਪ ਮੁਕਾਬਲੇ",
    "lead": "ਪੋਕਰ ਦੇ ਚੰਗੇ ਫੈਸਲੇ ਕੁਝ ਅੰਕੜਿਆਂ ’ਤੇ ਟਿਕੇ ਹੁੰਦੇ ਹਨ: ਤੁਹਾਡੇ ਹੱਥ ਦੇ ਬਿਹਤਰ ਹੋਣ ਦੀ ਕਿੰਨੀ ਸੰਭਾਵਨਾ ਹੈ, ਇਹ ਜਾਣਨ ਲਈ ਤੁਹਾਨੂੰ ਕਿੰਨਾ ਦੇਣਾ ਪਵੇਗਾ, ਅਤੇ ਫਲਾਪ ਤੋਂ ਪਹਿਲਾਂ ਦੋ ਹੱਥ ਇੱਕ-ਦੂਜੇ ਦੇ ਮੁਕਾਬਲੇ ਕਿੱਥੇ ਖੜ੍ਹੇ ਹਨ। ਇਸ ਪੰਨੇ ਦਾ ਹਰ ਅੰਕੜਾ ਬਿਲਕੁਲ ਸਹੀ ਗਿਣਿਆ ਗਿਆ ਹੈ, ਕਿਸੇ ਚਾਰਟ ਤੋਂ ਨਕਲ ਨਹੀਂ ਕੀਤਾ।",
    "calc": {
      "h2": "ਪੋਕਰ ਓਡਸ ਕੈਲਕੁਲੇਟਰ",
      "intro": "ਆਪਣੇ ਦੋ ਪੱਤੇ ਚੁਣੋ ਅਤੇ, ਜੇ ਚਾਹੋ, ਬੋਰਡ ਅਤੇ ਕਿਸੇ ਵਿਰੋਧੀ ਦਾ ਹੱਥ ਵੀ। ਕੈਲਕੁਲੇਟਰ ਬਾਕੀ ਸਾਰੇ ਪੱਤੇ ਵੰਡ ਕੇ ਵੇਖਦਾ ਹੈ — ਜਦੋਂ ਵੀ ਹੋ ਸਕੇ ਬਿਲਕੁਲ ਸਹੀ, ਨਹੀਂ ਤਾਂ ਸਿਮੂਲੇਸ਼ਨ ਨਾਲ — ਅਤੇ ਵਿਖਾਉਂਦਾ ਹੈ ਕਿ ਤੁਸੀਂ ਕਿੰਨੀ ਵਾਰ ਜਿੱਤਦੇ ਹੋ।",
      "you": "ਤੁਹਾਡਾ ਹੱਥ",
      "board": "ਬੋਰਡ",
      "opp": "ਵਿਰੋਧੀ (ਚੋਣਵਾਂ)",
      "players": "ਵਿਰੋਧੀ",
      "pick": "ਪੱਤੇ ਨੂੰ ਉਭਾਰੇ ਖ਼ਾਨੇ ਵਿੱਚ ਰੱਖਣ ਲਈ ਉਸ ’ਤੇ ਟੈਪ ਕਰੋ; ਖ਼ਾਨਾ ਖ਼ਾਲੀ ਕਰਨ ਲਈ ਉਸ ’ਤੇ ਟੈਪ ਕਰੋ।",
      "clear": "ਸਾਫ਼ ਕਰੋ",
      "win": "ਜਿੱਤ",
      "tie": "ਬਰਾਬਰ",
      "lose": "ਹਾਰ",
      "exact": "ਸਹੀ: ਸਾਰੀਆਂ {n} ਸੰਭਵ ਵੰਡਾਂ ਵਿੱਚੋਂ ਹਰ ਇੱਕ।",
      "sim": "{n} ਬੇਤਰਤੀਬ ਵੰਡਾਂ ਦਾ ਸਿਮੂਲੇਸ਼ਨ।",
      "working": "ਗਿਣਤੀ ਹੋ ਰਹੀ ਹੈ…",
      "need": "ਆਪਣੇ ਓਡਸ ਵੇਖਣ ਲਈ ਆਪਣੇ ਦੋ ਪੱਤੇ ਚੁਣੋ।",
      "boardHint": "ਬੋਰਡ ’ਤੇ ਪਹਿਲਾਂ ਤਿੰਨ ਪੱਤੇ (ਫਲਾਪ), ਫੇਰ ਚਾਰ, ਫੇਰ ਪੰਜ ਆਉਂਦੇ ਹਨ।",
      "oppHint": "ਆਪਣੇ ਵਿਰੋਧੀ ਦੇ ਦੋਵੇਂ ਪੱਤੇ ਚੁਣੋ, ਜਾਂ ਕੋਈ ਵੀ ਨਹੀਂ।",
      "final": "ਤੁਹਾਡਾ ਅੰਤਿਮ ਹੱਥ",
      "noscript": "ਕੈਲਕੁਲੇਟਰ ਨੂੰ JavaScript ਚਾਹੀਦੀ ਹੈ। ਹੇਠਲੀਆਂ ਸਾਰਣੀਆਂ ਇਸ ਤੋਂ ਬਿਨਾਂ ਵੀ ਚੱਲਦੀਆਂ ਹਨ।"
    },
    "outsH2": "ਆਊਟਸ: ਤੁਹਾਡਾ ਪੱਤਾ ਲੱਗਣ ਦੀ ਸੰਭਾਵਨਾ",
    "outsP": "ਆਊਟ ਡੈੱਕ ਵਿੱਚ ਬਚਿਆ ਓਹ ਪੱਤਾ ਹੈ ਜੋ ਤੁਹਾਡੇ ਹੱਥ ਨੂੰ ਸੰਭਾਵੀ ਜੇਤੂ ਬਣਾ ਦਿੰਦਾ ਹੈ। ਫਲਾਪ ’ਤੇ 47 ਪੱਤੇ ਅਣਦੇਖੇ ਹੁੰਦੇ ਹਨ: 9 ਆਊਟਸ ਨਾਲ, ਟਰਨ ’ਤੇ ਇੱਕ ਪੱਤਾ {f9turn} ਵਾਰ ਲੱਗਦਾ ਹੈ, ਅਤੇ ਰਿਵਰ ਤੱਕ — ਦੋ ਪੱਤੇ ਆਉਣੇ ਬਾਕੀ ਹੋਣ ’ਤੇ — {f9river} ਵਾਰ।",
    "outsCols": [
      "ਡਰਾਅ",
      "ਆਊਟਸ",
      "ਟਰਨ",
      "ਰਿਵਰ (ਟਰਨ ਤੋਂ)",
      "ਟਰਨ ਜਾਂ ਰਿਵਰ (ਫਲਾਪ ਤੋਂ)"
    ],
    "draws": {
      "gutshot": "ਅੰਦਰੂਨੀ ਸਟ੍ਰੇਟ ਡਰਾਅ (ਗਟਸ਼ਾਟ)",
      "twoPairFull": "Two Pair ਤੋਂ Full House",
      "pairTrips": "One Pair ਤੋਂ Two Pair ਜਾਂ Three of a Kind",
      "twoOver": "ਦੋ ਓਵਰਕਾਰਡ ਤੋਂ ਜੋੜਾ",
      "setFull": "Set ਤੋਂ Full House ਜਾਂ Four of a Kind",
      "oesd": "ਓਪਨ-ਐਂਡਡ ਸਟ੍ਰੇਟ ਡਰਾਅ",
      "flush": "ਫਲੱਸ਼ ਡਰਾਅ",
      "flushGut": "ਫਲੱਸ਼ ਡਰਾਅ ਅਤੇ ਗਟਸ਼ਾਟ",
      "flushOesd": "ਫਲੱਸ਼ ਡਰਾਅ ਅਤੇ ਓਪਨ-ਐਂਡਡ ਸਟ੍ਰੇਟ ਡਰਾਅ"
    },
    "outsNote": "ਇਹ ਤੁਹਾਡੇ ਆਊਟਸ ਵਿੱਚੋਂ ਕੋਈ ਇੱਕ ਲੱਗਣ ਦੀਆਂ ਸੰਭਾਵਨਾਵਾਂ ਹਨ। ਇਹਨਾਂ ਵਿੱਚ ਰਨਰ-ਰਨਰ ਵਾਧੂ ਮੌਕੇ ਸ਼ਾਮਲ ਨਹੀਂ, ਅਤੇ ਜੋ ਆਊਟ ਵਿਰੋਧੀ ਨੂੰ ਵੀ ਬਿਹਤਰ ਹੱਥ ਦੇ ਦੇਵੇ, ਓਹ ਅਸਲ ਵਿੱਚ ਆਊਟ ਨਹੀਂ।",
    "ruleH2": "2 ਅਤੇ 4 ਦਾ ਨਿਯਮ",
    "ruleP": "ਟੇਬਲ ’ਤੇ ਛੇਤੀ ਅੰਦਾਜ਼ਾ: ਜਦੋਂ ਤੁਸੀਂ ਟਰਨ ਅਤੇ ਰਿਵਰ ਦੋਵੇਂ ਵੇਖੋਗੇ ਤਾਂ ਫਲਾਪ ’ਤੇ ਆਪਣੇ ਆਊਟਸ ਨੂੰ 4 ਨਾਲ ਗੁਣਾ ਕਰੋ, ਅਤੇ ਜਦੋਂ ਸਿਰਫ਼ ਇੱਕ ਪੱਤਾ ਆਉਣਾ ਹੋਵੇ ਤਾਂ 2 ਨਾਲ। ਫਲਾਪ ’ਤੇ ਫਲੱਸ਼ ਡਰਾਅ 9 × 4 = 36% ਬਣਦਾ ਹੈ, ਜਦਕਿ ਸਹੀ ਅੰਕੜਾ {f9river} ਹੈ। ਨਿਯਮ ਵੱਡੇ ਡਰਾਅ ਨੂੰ ਵਧਾ ਕੇ ਅੰਕਦਾ ਹੈ: 15 ਆਊਟਸ 60% ਦਿੰਦੇ ਹਨ, ਅਸਲ ਅੰਕੜਾ {f15river} ਹੈ।",
    "potH2": "ਪਾਟ ਓਡਸ: ਕੀ ਤੁਹਾਨੂੰ Call ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?",
    "potP": "ਪਾਟ ਓਡਸ ਇਸ ਦੀ ਤੁਲਨਾ ਕਰਦੇ ਹਨ ਕਿ ਤੁਹਾਨੂੰ ਕਿੰਨਾ ਦੇਣਾ ਪਵੇਗਾ ਅਤੇ ਤੁਸੀਂ ਕਿੰਨਾ ਜਿੱਤ ਸਕਦੇ ਹੋ। ਪਾਟ ਵਿੱਚ 100 ਹੈ ਅਤੇ ਵਿਰੋਧੀ 50 ਦੀ ਬੈਟ ਲਾਉਂਦਾ ਹੈ: ਤੁਸੀਂ 200 ਦਾ ਪਾਟ ਜਿੱਤਣ ਲਈ 50 Call ਕਰਦੇ ਹੋ, ਇਸ ਲਈ ਫ਼ਾਇਦੇਮੰਦ ਹੋਣ ਲਈ Call ਨੂੰ 50 ÷ 200 = 25% ਤੋਂ ਵੱਧ ਵਾਰ ਜਿੱਤਣਾ ਚਾਹੀਦਾ ਹੈ। ਫਲੱਸ਼ ਡਰਾਅ ਅਤੇ ਇੱਕ ਪੱਤਾ ਬਾਕੀ ਹੋਣ ’ਤੇ ਤੁਹਾਡਾ ਪੱਤਾ {f9one} ਵਾਰ ਲੱਗਦਾ ਹੈ, ਇਸ ਲਈ ਸਿਰਫ਼ ਰਿਵਰ ਬਾਕੀ ਹੋਣ ’ਤੇ ਕਿਸੇ ਬੈਟ ਨੂੰ Call ਕਰਨਾ ਲੰਮੇ ਸਮੇਂ ਵਿੱਚ ਚਿਪਸ ਗੁਆਉਂਦਾ ਹੈ। ਫਲਾਪ ’ਤੇ All-In ਹੋਵੇ, ਦੋਵੇਂ ਪੱਤੇ ਆਉਣੇ ਬਾਕੀ ਹੋਣ, ਤਾਂ ਓਹੀ ਡਰਾਅ {f9river} ਵਾਰ ਪੂਰਾ ਹੁੰਦਾ ਹੈ, ਅਤੇ Call ਕਰਨਾ ਬਣਦਾ ਹੈ।",
    "matchH2": "ਪ੍ਰੀ-ਫਲਾਪ ਮੁਕਾਬਲੇ",
    "matchP": "ਜਦੋਂ ਬੋਰਡ ਦੇ ਪੰਜੇ ਪੱਤੇ ਵੰਡੇ ਜਾਣ ਤਾਂ ਦੋ ਸ਼ੁਰੂਆਤੀ ਹੱਥ ਇੱਕ-ਦੂਜੇ ਵਿਰੁੱਧ ਕਿਵੇਂ ਰਹਿੰਦੇ ਹਨ, {boards} ਸੰਭਵ ਬੋਰਡਾਂ ਵਿੱਚੋਂ ਹਰ ਇੱਕ ’ਤੇ ਗਿਣਿਆ। ਰੰਗਾਂ ਦਾ ਥੋੜ੍ਹਾ ਅਸਰ ਹੁੰਦਾ ਹੈ: ਹੇਠਲੇ ਹੱਥਾਂ ਦਾ ਕੋਈ ਰੰਗ ਸਾਂਝਾ ਨਹੀਂ, ਜਦ ਤੱਕ ਉਹਨਾਂ ਨੂੰ ਸੂਟਿਡ ਨਾ ਵਿਖਾਇਆ ਹੋਵੇ।",
    "matchCols": [
      "ਹੱਥ",
      "ਵਿਰੁੱਧ",
      "ਜਿੱਤਦਾ",
      "ਬਰਾਬਰ",
      "ਹਾਰਦਾ"
    ],
    "startH2": "ਸ਼ੁਰੂਆਤੀ ਹੱਥਾਂ ਦੇ ਓਡਸ",
    "startP": "ਦੋ ਪੱਤਿਆਂ ਵਾਲੇ {combos} ਵੱਖ-ਵੱਖ ਸ਼ੁਰੂਆਤੀ ਹੱਥ ਹੁੰਦੇ ਹਨ। ਤੁਹਾਨੂੰ ਇਹ ਕਿੰਨੀ ਵਾਰ ਮਿਲਦੇ ਹਨ:",
    "startCols": [
      "ਹੱਥ",
      "ਸੰਭਾਵਨਾ",
      "ਲਗਭਗ ਕਿੰਨੇ ਹੱਥਾਂ ਵਿੱਚ ਇੱਕ"
    ],
    "starting": {
      "specificPair": "ਕੋਈ ਖ਼ਾਸ ਪਾਕੇਟ ਜੋੜਾ, ਜਿਵੇਂ ਯੱਕੇ",
      "anyPair": "ਕੋਈ ਵੀ ਪਾਕੇਟ ਜੋੜਾ",
      "specificNonPair": "ਕੋਈ ਖ਼ਾਸ ਬਿਨਾਂ ਜੋੜੇ ਵਾਲਾ ਹੱਥ, ਜਿਵੇਂ ਯੱਕਾ-ਬਾਦਸ਼ਾਹ",
      "specificSuited": "ਕੋਈ ਖ਼ਾਸ ਸੂਟਿਡ ਹੱਥ, ਜਿਵੇਂ ਸੂਟਿਡ ਯੱਕਾ-ਬਾਦਸ਼ਾਹ",
      "anySuited": "ਕੋਈ ਵੀ ਦੋ ਸੂਟਿਡ ਪੱਤੇ",
      "twoBroadway": "ਦਹਿਲਾ ਜਾਂ ਉਸ ਤੋਂ ਵੱਡੇ ਦੋ ਪੱਤੇ"
    },
    "faqH2": "ਸਵਾਲ",
    "faq": [
      [
        "ਪੋਕਰ ਵਿੱਚ ਆਊਟਸ ਕੀ ਹੁੰਦੇ ਹਨ?",
        "ਡੈੱਕ ਵਿੱਚ ਬਚੇ ਓਹ ਪੱਤੇ ਜੋ ਤੁਹਾਨੂੰ ਸਭ ਤੋਂ ਵਧੀਆ ਹੱਥ ਦੇਣਗੇ। ਸਿਰਫ਼ ਓਹ ਪੱਤੇ ਗਿਣੋ ਜੋ ਤੁਸੀਂ ਨਹੀਂ ਵੇਖੇ: ਫਲਾਪ ’ਤੇ 47, ਟਰਨ ’ਤੇ 46।"
      ],
      [
        "ਪਾਕੇਟ ਯੱਕੇ ਬਾਦਸ਼ਾਹਾਂ ਨੂੰ ਕਿੰਨੀ ਵਾਰ ਹਰਾਉਂਦੇ ਹਨ?",
        "ਲਗਭਗ ਪੰਜ ਵਿੱਚੋਂ ਚਾਰ ਵਾਰ: ਬੋਰਡ ਦੇ ਪੰਜੇ ਪੱਤੇ ਵੰਡੇ ਜਾਣ ’ਤੇ {aakk}, ਜਦਕਿ ਬਾਦਸ਼ਾਹ {kkaa} ਜਿੱਤਦੇ ਹਨ।"
      ],
      [
        "ਕੀ ਜੋੜੇ ਵਿਰੁੱਧ ਯੱਕਾ-ਬਾਦਸ਼ਾਹ ਸਿੱਕਾ ਉਛਾਲਣ ਵਰਗਾ ਹੈ?",
        "ਲਗਭਗ, ਵਿਚਕਾਰਲੇ ਜੋੜੇ ਵਿਰੁੱਧ: ਬੇਗੀਆਂ ਯੱਕਾ-ਬਾਦਸ਼ਾਹ ਵਿਰੁੱਧ {qqak} ਜਿੱਤਦੀਆਂ ਹਨ। ਛੋਟੇ ਜੋੜੇ ਵਿਰੁੱਧ ਇਹ ਹੋਰ ਵੀ ਨੇੜੇ ਹੈ — ਦੁੱਕੀਆਂ {22ak} ਜਿੱਤਦੀਆਂ ਹਨ।"
      ],
      [
        "ਪਾਟ ਓਡਸ ਕੀ ਹੁੰਦੇ ਹਨ?",
        "ਜਿੱਤੇ ਜਾ ਸਕਣ ਵਾਲੇ ਪਾਟ ਦੇ ਮੁਕਾਬਲੇ Call ਦੀ ਕੀਮਤ। ਜੇ ਤੁਹਾਡੀ ਜਿੱਤਣ ਦੀ ਸੰਭਾਵਨਾ ਆਖਰੀ ਪਾਟ ਵਿੱਚ ਤੁਹਾਡੇ ਪਾਏ ਹਿੱਸੇ ਤੋਂ ਵੱਧ ਹੈ, ਤਾਂ Call ਕਰਨਾ ਸਮੇਂ ਨਾਲ ਫ਼ਾਇਦੇਮੰਦ ਰਹਿੰਦਾ ਹੈ।"
      ],
      [
        "ਕੀ PokerTH ਖੇਡ ਦੌਰਾਨ ਮੇਰੇ ਓਡਸ ਵਿਖਾਉਂਦਾ ਹੈ?",
        "ਹਾਂ। ਓਡਸ ਟੈਬ ਪੱਤੇ ਆਉਣ ਦੇ ਨਾਲ ਤੁਹਾਡੇ ਮੌਜੂਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਹੱਥ ਅਤੇ ਜਿੱਤਣ ਦੀ ਸੰਭਾਵਨਾ ਦਾ ਨਾਮ ਦੱਸਦਾ ਹੈ, ਤਾਂ ਜੋ ਤੁਸੀਂ ਟੇਬਲ ’ਤੇ ਆਪਣੀ ਸੋਚ ਖ਼ੁਦ ਪਰਖ ਸਕੋ।"
      ]
    ]
  },
  pl: {
    "title": "Szanse w pokerze — outy, pot odds, starcia rąk | PokerTH",
    "desc": "Szanse w Texas Hold’em wyliczone dokładnie: outy i szansa ich trafienia, reguła 2 i 4, pot odds oraz jak często AA wygrywa z KK, a QQ z AK.",
    "ldHeadline": "Szanse w pokerze: outy, pot odds i starcia rąk przed flopem",
    "ldDesc": "Szanse w Texas Hold’em wyliczone dokładnie: outy, reguła 2 i 4, pot odds i starcia rąk przed flopem.",
    "h1": "Szanse w pokerze: outy, pot odds i starcia rąk przed flopem",
    "lead": "Dobre decyzje w pokerze sprowadzają się do kilku liczb: jak bardzo prawdopodobne jest, że twój układ się poprawi, ile musisz zapłacić, żeby się o tym przekonać, i jak dwie ręce wypadają przeciwko sobie przed flopem. Każda liczba na tej stronie jest wyliczona dokładnie, a nie przepisana z tabeli.",
    "calc": {
      "h2": "Kalkulator szans w pokerze",
      "intro": "Wybierz swoje dwie karty i, jeśli chcesz, karty na stole oraz rękę przeciwnika. Kalkulator rozdaje wszystkie pozostałe karty — dokładnie, gdy tylko się da, a w przeciwnym razie przez symulację — i pokazuje, jak często wygrywasz.",
      "you": "Twoja ręka",
      "board": "Stół",
      "opp": "Przeciwnik (opcjonalnie)",
      "players": "Przeciwnicy",
      "pick": "Dotknij karty, aby umieścić ją w podświetlonym polu; dotknij pola, aby je opróżnić.",
      "clear": "Wyczyść",
      "win": "Wygrana",
      "tie": "Remis",
      "lose": "Przegrana",
      "exact": "Dokładnie: każde z {n} możliwych rozdań.",
      "sim": "Symulacja {n} losowych rozdań.",
      "working": "Obliczanie…",
      "need": "Wybierz swoje dwie karty, aby zobaczyć szanse.",
      "boardHint": "Na stole leżą trzy karty (flop), potem cztery, potem pięć.",
      "oppHint": "Wybierz obie karty przeciwnika albo żadnej.",
      "final": "Twój końcowy układ",
      "noscript": "Kalkulator wymaga JavaScriptu. Tabele poniżej działają bez niego."
    },
    "outsH2": "Outy: twoja szansa na trafienie",
    "outsP": "Out to karta, która wciąż jest w talii i zamienia twoją rękę w prawdopodobnie zwycięską. Na flopie nie widać 47 kart: z 9 outami jedna karta trafia na turnie w {f9turn} przypadków, a do rivera — gdy przyjdą jeszcze dwie karty — w {f9river}.",
    "outsCols": [
      "Draw",
      "Outy",
      "Turn",
      "River (od turna)",
      "Turn lub river (od flopa)"
    ],
    "draws": {
      "gutshot": "Draw do strita wewnętrznego (gutshot)",
      "twoPairFull": "Dwie pary do fulla",
      "pairTrips": "Para do dwóch par lub trójki",
      "twoOver": "Dwie overkarty do pary",
      "setFull": "Set do fulla lub karety",
      "oesd": "Draw do strita otwartego",
      "flush": "Draw do koloru",
      "flushGut": "Draw do koloru i gutshot",
      "flushOesd": "Draw do koloru i do strita otwartego"
    },
    "outsNote": "To szanse na trafienie jednego z twoich outów. Nie uwzględniają dodatkowych układów runner-runner, a out, który daje też przeciwnikowi lepszy układ, nie jest tak naprawdę outem.",
    "ruleH2": "Reguła 2 i 4",
    "ruleP": "Szybkie oszacowanie przy stole: pomnóż liczbę outów przez 4 na flopie, gdy zobaczysz i turn, i river, a przez 2, gdy została już tylko jedna karta. Draw do koloru na flopie to 9 × 4 = 36%, wobec dokładnych {f9river}. Reguła zawyża duże drawy: 15 outów daje 60%, a w rzeczywistości jest to {f15river}.",
    "potH2": "Pot odds: sprawdzać czy nie?",
    "potP": "Pot odds porównują to, ile musisz zapłacić, z tym, ile możesz wygrać. W puli jest 100, a przeciwnik stawia 50: sprawdzasz 50, aby wygrać pulę 200, więc sprawdzenie musi wygrywać w więcej niż 50 ÷ 200 = 25% przypadków, żeby się opłacało. Z drawem do koloru i jedną kartą do przyjścia trafiasz w {f9one} przypadków, więc sprawdzanie zakładu, gdy został już tylko river, na dłuższą metę kosztuje żetony. Przy all-inie na flopie, gdy przyjdą jeszcze obie karty, ten sam draw trafia w {f9river} przypadków i sprawdzenie się opłaca.",
    "matchH2": "Starcia rąk przed flopem",
    "matchP": "Jak dwie ręce startowe wypadają przeciwko sobie, gdy wyłożone zostanie wszystkie pięć kart wspólnych, policzone na każdym z {boards} możliwych układów stołu. Kolory mają niewielkie znaczenie: poniższe ręce nie dzielą żadnego koloru, chyba że pokazano je w jednym kolorze.",
    "matchCols": [
      "Ręka",
      "Przeciwko",
      "Wygrywa",
      "Remis",
      "Przegrywa"
    ],
    "startH2": "Szanse rąk startowych",
    "startP": "Istnieje {combos} różnych dwukartowych rąk startowych. Jak często dostajesz:",
    "startCols": [
      "Ręka",
      "Szansa",
      "Mniej więcej jedna ręka na"
    ],
    "starting": {
      "specificPair": "Konkretna para w ręce, np. asy",
      "anyPair": "Dowolna para w ręce",
      "specificNonPair": "Konkretna ręka bez pary, np. as-król",
      "specificSuited": "Konkretna ręka w jednym kolorze, np. as-król w kolorze",
      "anySuited": "Dowolne dwie karty w jednym kolorze",
      "twoBroadway": "Dwie karty od dziesiątki w górę"
    },
    "faqH2": "Pytania",
    "faq": [
      [
        "Czym są outy w pokerze?",
        "To karty pozostałe w talii, które dałyby ci najlepszy układ. Licz tylko karty, których nie widziałeś: 47 na flopie, 46 na turnie."
      ],
      [
        "Jak często asy wygrywają z królami?",
        "Mniej więcej cztery razy na pięć: {aakk}, gdy wyłożone zostanie wszystkie pięć kart wspólnych; króle wygrywają w {kkaa}."
      ],
      [
        "Czy as-król przeciwko parze to rzut monetą?",
        "Prawie, przeciwko średniej parze: damy wygrywają z as-królem w {qqak}. Przeciwko niskiej parze jest jeszcze bliżej — dwójki wygrywają w {22ak}."
      ],
      [
        "Czym są pot odds?",
        "To cena sprawdzenia w porównaniu z pulą, którą możesz wygrać. Jeśli twoja szansa na wygraną jest większa niż część końcowej puli, którą wkładasz, sprawdzanie opłaca się na dłuższą metę."
      ],
      [
        "Czy PokerTH pokazuje moje szanse w trakcie gry?",
        "Tak. Zakładka Szanse nazywa twój aktualnie najlepszy układ i twoją szansę na wygraną w miarę wychodzenia kart, więc możesz sprawdzić własne rozumowanie przy stole."
      ]
    ]
  },
  "pt-BR": {
    "title": "Probabilidades no pôquer — outs, pot odds e confrontos | PokerTH",
    "desc": "Probabilidades do Texas Hold’em calculadas com exatidão: outs e sua chance de acertá-los, a regra do 2 e 4, pot odds e quantas vezes AA vence KK ou QQ vence AK.",
    "ldHeadline": "Probabilidades no pôquer: outs, pot odds e confrontos pré-flop",
    "ldDesc": "Probabilidades do Texas Hold’em calculadas com exatidão: outs, a regra do 2 e 4, pot odds e confrontos pré-flop.",
    "h1": "Probabilidades no pôquer: outs, pot odds e confrontos pré-flop",
    "lead": "Boas decisões no pôquer se resumem a alguns números: qual a chance de a sua mão melhorar, quanto você precisa pagar para descobrir e como duas mãos se saem uma contra a outra antes do flop. Cada número desta página é calculado com exatidão, não copiado de uma tabela.",
    "calc": {
      "h2": "Calculadora de probabilidades de pôquer",
      "intro": "Escolha suas duas cartas e, se quiser, a mesa e a mão de um adversário. A calculadora distribui todas as cartas restantes — de forma exata sempre que possível, por simulação nos outros casos — e mostra com que frequência você vence.",
      "you": "Sua mão",
      "board": "Mesa",
      "opp": "Adversário (opcional)",
      "players": "Adversários",
      "pick": "Toque numa carta para colocá-la no espaço destacado; toque num espaço para esvaziá-lo.",
      "clear": "Limpar",
      "win": "Vitória",
      "tie": "Empate",
      "lose": "Derrota",
      "exact": "Exato: cada uma das {n} distribuições possíveis.",
      "sim": "Simulação de {n} distribuições aleatórias.",
      "working": "Calculando…",
      "need": "Escolha suas duas cartas para ver suas chances.",
      "boardHint": "A mesa recebe três cartas (o flop), depois quatro, depois cinco.",
      "oppHint": "Escolha as duas cartas do adversário, ou nenhuma.",
      "final": "Sua mão final",
      "noscript": "A calculadora precisa de JavaScript. As tabelas abaixo funcionam sem ele."
    },
    "outsH2": "Outs: sua chance de acertar",
    "outsP": "Um out é uma carta ainda no baralho que transforma a sua mão na provável vencedora. No flop há 47 cartas não vistas: com 9 outs, uma carta acerta no turn em {f9turn} das vezes, e até o river — com duas cartas por vir — em {f9river}.",
    "outsCols": [
      "Projeto",
      "Outs",
      "Turn",
      "River (a partir do turn)",
      "Turn ou river (a partir do flop)"
    ],
    "draws": {
      "gutshot": "Projeto de sequência interna (gutshot)",
      "twoPairFull": "Dois pares para full house",
      "pairTrips": "Um par para dois pares ou trinca",
      "twoOver": "Duas overcards para um par",
      "setFull": "Set para full house ou quadra",
      "oesd": "Projeto de sequência aberta",
      "flush": "Projeto de flush",
      "flushGut": "Projeto de flush e gutshot",
      "flushOesd": "Projeto de flush e de sequência aberta"
    },
    "outsNote": "Estas são as chances de acertar um dos seus outs. Não incluem os extras runner-runner, e um out que também dá uma mão melhor a um adversário não é de fato um out.",
    "ruleH2": "A regra do 2 e 4",
    "ruleP": "Uma estimativa rápida na mesa: multiplique seus outs por 4 no flop quando for ver o turn e o river, e por 2 quando só falta uma carta. Um projeto de flush no flop dá 9 × 4 = 36%, contra {f9river} exatos. A regra superestima os projetos grandes: 15 outs dão 60%, e o número real é {f15river}.",
    "potH2": "Pot odds: você deve pagar?",
    "potP": "As pot odds comparam o que você precisa pagar com o que pode ganhar. O pote tem 100 e o adversário aposta 50: você paga 50 para ganhar um pote de 200, então o Call precisa vencer mais de 50 ÷ 200 = 25% das vezes para compensar. Com um projeto de flush e uma carta por vir, você acerta em {f9one} das vezes, então pagar uma aposta quando só falta o river perde fichas no longo prazo. All-in no flop, com as duas cartas por vir, o mesmo projeto acerta em {f9river}, e o Call vale a pena.",
    "matchH2": "Confrontos pré-flop",
    "matchP": "Como duas mãos iniciais se saem uma contra a outra quando as cinco cartas da mesa são distribuídas, contando cada uma das {boards} mesas possíveis. Os naipes importam um pouco: as mãos abaixo não compartilham naipe, a não ser quando mostradas do mesmo naipe.",
    "matchCols": [
      "Mão",
      "Contra",
      "Vence",
      "Empate",
      "Perde"
    ],
    "startH2": "Probabilidades das mãos iniciais",
    "startP": "Existem {combos} mãos iniciais diferentes de duas cartas. Com que frequência você recebe:",
    "startCols": [
      "Mão",
      "Chance",
      "Cerca de uma mão a cada"
    ],
    "starting": {
      "specificPair": "Um par na mão específico, como ases",
      "anyPair": "Qualquer par na mão",
      "specificNonPair": "Uma mão específica sem par, como ás-rei",
      "specificSuited": "Uma mão específica do mesmo naipe, como ás-rei do mesmo naipe",
      "anySuited": "Quaisquer duas cartas do mesmo naipe",
      "twoBroadway": "Duas cartas de dez ou mais"
    },
    "faqH2": "Perguntas",
    "faq": [
      [
        "O que são outs no pôquer?",
        "As cartas que restam no baralho e que dariam a você a melhor mão. Conte só as cartas que você não viu: 47 no flop, 46 no turn."
      ],
      [
        "Com que frequência um par de ases vence um par de reis?",
        "Cerca de quatro vezes em cada cinco: {aakk} quando as cinco cartas da mesa são distribuídas, com os reis vencendo {kkaa}."
      ],
      [
        "Ás-rei contra um par é cara ou coroa?",
        "Quase, contra um par médio: um par de damas vence {qqak} contra ás-rei. Contra um par baixo é ainda mais equilibrado — um par de dois vence {22ak}."
      ],
      [
        "O que são pot odds?",
        "O preço de um Call comparado com o pote que você pode ganhar. Se a sua chance de vencer for maior do que a fatia do pote final que você coloca, pagar compensa com o tempo."
      ],
      [
        "O PokerTH mostra minhas chances durante o jogo?",
        "Sim. A aba Chances mostra o nome da sua melhor mão do momento e a sua chance de vitória conforme as cartas saem, para você conferir o seu próprio raciocínio na mesa."
      ]
    ]
  },
  "pt-PT": {
    "title": "Odds no póquer — outs, odds do pote e confrontos | PokerTH",
    "desc": "Probabilidades exactas do Texas Hold’em: outs e a hipótese de os apanhar, a regra do 2 e do 4, odds do pote e quantas vezes AA bate KK ou QQ bate AK.",
    "ldHeadline": "Probabilidades no póquer: outs, odds do pote e confrontos pré-flop",
    "ldDesc": "Probabilidades do Texas Hold’em calculadas com exactidão: outs, a regra do 2 e do 4, odds do pote e confrontos pré-flop.",
    "h1": "Probabilidades no póquer: outs, odds do pote e confrontos pré-flop",
    "lead": "As boas decisões no póquer resumem-se a alguns números: a probabilidade de a sua mão melhorar, quanto tem de pagar para o saber e como duas mãos se comparam antes do flop. Todos os números desta página são calculados com exactidão, não copiados de uma tabela.",
    "calc": {
      "h2": "Calculadora de probabilidades de póquer",
      "intro": "Escolha as suas duas cartas e, se quiser, a mesa e a mão de um adversário. A calculadora distribui todas as cartas restantes — com exactidão sempre que possível, por simulação nos outros casos — e mostra quantas vezes ganha.",
      "you": "A sua mão",
      "board": "Mesa",
      "opp": "Adversário (opcional)",
      "players": "Adversários",
      "pick": "Toque numa carta para a colocar no lugar destacado; toque num lugar para o esvaziar.",
      "clear": "Limpar",
      "win": "Vitória",
      "tie": "Empate",
      "lose": "Derrota",
      "exact": "Exacto: todas as {n} distribuições possíveis.",
      "sim": "Simulação de {n} distribuições aleatórias.",
      "working": "A calcular…",
      "need": "Escolha as suas duas cartas para ver as suas probabilidades.",
      "boardHint": "A mesa leva três cartas (o flop), depois quatro, depois cinco.",
      "oppHint": "Escolha as duas cartas do adversário, ou nenhuma.",
      "final": "A sua mão final",
      "noscript": "A calculadora precisa de JavaScript. As tabelas abaixo funcionam sem ele."
    },
    "outsH2": "Outs: a sua hipótese de acertar",
    "outsP": "Um out é uma carta ainda no baralho que torna a sua mão a provável vencedora. No flop há 47 cartas por ver: com 9 outs, uma carta acerta no turn em {f9turn} das vezes e, até ao river — com duas cartas por sair —, em {f9river}.",
    "outsCols": [
      "Projecto",
      "Outs",
      "Turn",
      "River (a partir do turn)",
      "Turn ou river (a partir do flop)"
    ],
    "draws": {
      "gutshot": "Projecto de sequência interior (gutshot)",
      "twoPairFull": "Dois Pares para Full House",
      "pairTrips": "Um Par para Dois Pares ou Trinca",
      "twoOver": "Duas cartas acima da mesa (overcards) para um Par",
      "setFull": "Set para Full House ou Quadra",
      "oesd": "Projecto de sequência aberta",
      "flush": "Projecto de flush",
      "flushGut": "Projecto de flush e gutshot",
      "flushOesd": "Projecto de flush e de sequência aberta"
    },
    "outsNote": "Estas são as hipóteses de apanhar um dos seus outs. Não incluem os extras de duas cartas seguidas (runner-runner), e um out que também dá a um adversário uma mão melhor não é verdadeiramente um out.",
    "ruleH2": "A regra do 2 e do 4",
    "ruleP": "Uma estimativa rápida à mesa: multiplique os seus outs por 4 no flop quando vai ver o turn e o river, e por 2 quando só falta uma carta. Um projecto de flush no flop dá 9 × 4 = 36%, contra {f9river} exactos. A regra sobrestima os projectos grandes: 15 outs dão 60%, e o valor real é {f15river}.",
    "potH2": "Odds do pote: deve igualar?",
    "potP": "As odds do pote comparam o que tem de pagar com o que pode ganhar. O pote tem 100 e o adversário aposta 50: iguala 50 para ganhar um pote de 200, por isso, para compensar, igualar tem de ganhar mais de 50 ÷ 200 = 25% das vezes. Com um projecto de flush e uma carta por sair acerta em {f9one} das vezes, por isso igualar uma aposta quando só falta o river perde fichas a longo prazo. All-in no flop, com as duas cartas por sair, o mesmo projecto acerta em {f9river}, e vale a pena igualar.",
    "matchH2": "Confrontos pré-flop",
    "matchP": "Como se comportam duas mãos iniciais uma contra a outra quando saem as cinco cartas da mesa, contado sobre todas as {boards} mesas possíveis. Os naipes contam um pouco: as mãos abaixo não partilham naipe, salvo quando indicadas do mesmo naipe.",
    "matchCols": [
      "Mão",
      "Contra",
      "Ganha",
      "Empate",
      "Perde"
    ],
    "startH2": "Probabilidades das mãos iniciais",
    "startP": "Há {combos} mãos iniciais diferentes de duas cartas. Com que frequência recebe:",
    "startCols": [
      "Mão",
      "Probabilidade",
      "Cerca de uma mão em"
    ],
    "starting": {
      "specificPair": "Um par na mão determinado, como ases",
      "anyPair": "Qualquer par na mão",
      "specificNonPair": "Uma mão sem par determinada, como ás-rei",
      "specificSuited": "Uma mão do mesmo naipe determinada, como ás-rei do mesmo naipe",
      "anySuited": "Quaisquer duas cartas do mesmo naipe",
      "twoBroadway": "Duas cartas de dez para cima"
    },
    "faqH2": "Perguntas",
    "faq": [
      [
        "O que são outs no póquer?",
        "As cartas que restam no baralho e que lhe dariam a melhor mão. Conte só as cartas que não viu: 47 no flop, 46 no turn."
      ],
      [
        "Com que frequência um par de ases bate um par de reis?",
        "Cerca de quatro vezes em cinco: {aakk} quando saem as cinco cartas da mesa, com os reis a ganharem {kkaa}."
      ],
      [
        "Ás-rei contra um par é cara ou coroa?",
        "Quase, contra um par médio: as damas ganham {qqak} contra ás-rei. Contra um par baixo é ainda mais equilibrado — um par de dois ganha {22ak}."
      ],
      [
        "O que são odds do pote?",
        "O preço de igualar comparado com o pote que pode ganhar. Se a sua hipótese de ganhar for maior do que a parte do pote final que lá põe, igualar compensa a longo prazo."
      ],
      [
        "O PokerTH mostra as minhas probabilidades durante o jogo?",
        "Sim. O separador Probabilidades indica a sua melhor mão do momento e a sua probabilidade de ganhar à medida que as cartas saem, para que possa verificar o seu próprio raciocínio à mesa."
      ]
    ]
  },
  ro: {
    "title": "Șanse la poker — outs, cotele potului, dueluri de mâini | PokerTH",
    "desc": "Șansele la Texas Hold’em calculate exact: outs și șansa de a le prinde, regula lui 2 și 4, cotele potului și cât de des bate AA pe KK sau QQ pe AK.",
    "ldHeadline": "Șanse la poker: outs, cotele potului și dueluri înainte de flop",
    "ldDesc": "Șansele la Texas Hold’em calculate exact: outs, regula lui 2 și 4, cotele potului și dueluri înainte de flop.",
    "h1": "Șanse la poker: outs, cotele potului și dueluri înainte de flop",
    "lead": "Deciziile bune la poker se reduc la câteva cifre: cât de probabil e ca mâna ta să se îmbunătățească, cât trebuie să plătești ca să afli și cum stau două mâini una față de alta înainte de flop. Fiecare cifră de pe această pagină este calculată exact, nu copiată dintr-un tabel.",
    "calc": {
      "h2": "Calculator de șanse la poker",
      "intro": "Alege-ți cele două cărți și, dacă vrei, masa și mâna unui adversar. Calculatorul împarte toate cărțile rămase — exact ori de câte ori se poate, altfel prin simulare — și îți arată cât de des câștigi.",
      "you": "Mâna ta",
      "board": "Masa",
      "opp": "Adversar (opțional)",
      "players": "Adversari",
      "pick": "Atinge o carte ca s-o pui în locul evidențiat; atinge un loc ca să-l golești.",
      "clear": "Golește",
      "win": "Câștig",
      "tie": "Egalitate",
      "lose": "Pierdere",
      "exact": "Exact: toate cele {n} împărțiri posibile.",
      "sim": "Simulare pe {n} împărțiri aleatorii.",
      "working": "Se calculează…",
      "need": "Alege-ți cele două cărți ca să-ți vezi șansele.",
      "boardHint": "Pe masă vin trei cărți (flopul), apoi patru, apoi cinci.",
      "oppHint": "Alege ambele cărți ale adversarului sau niciuna.",
      "final": "Mâna ta finală",
      "noscript": "Calculatorul are nevoie de JavaScript. Tabelele de mai jos funcționează și fără el."
    },
    "outsH2": "Outs: șansa ta de a prinde cartea",
    "outsP": "Un out este o carte rămasă în pachet care îți transformă mâna în probabila câștigătoare. Pe flop sunt 47 de cărți nevăzute: cu 9 outs, o carte intră pe turn în {f9turn} din cazuri, iar până la river — cu două cărți de venit — în {f9river}.",
    "outsCols": [
      "Proiect",
      "Outs",
      "Turn",
      "River (de la turn)",
      "Turn sau river (de la flop)"
    ],
    "draws": {
      "gutshot": "Proiect de chintă din interior (gutshot)",
      "twoPairFull": "Două perechi → Full house",
      "pairTrips": "Pereche → Două perechi sau Trei de un fel",
      "twoOver": "Două overcarduri → Pereche",
      "setFull": "Set → Full house sau Careu",
      "oesd": "Proiect de chintă deschis la ambele capete",
      "flush": "Proiect de culoare",
      "flushGut": "Proiect de culoare și gutshot",
      "flushOesd": "Proiect de culoare și proiect de chintă deschis la ambele capete"
    },
    "outsNote": "Acestea sunt șansele de a prinde unul dintre outs. Nu includ extra-urile runner-runner, iar un out care îi dă și unui adversar o mână mai bună nu este cu adevărat un out.",
    "ruleH2": "Regula lui 2 și 4",
    "ruleP": "O estimare rapidă la masă: înmulțește-ți outs cu 4 pe flop când vei vedea și turnul, și riverul, și cu 2 când mai vine o singură carte. Un proiect de culoare pe flop dă 9 × 4 = 36 %, față de exact {f9river}. Regula supraestimează proiectele mari: 15 outs dau 60 %, cifra reală este {f15river}.",
    "potH2": "Cotele potului: merită să dai Call?",
    "potP": "Cotele potului compară ce trebuie să plătești cu ce poți câștiga. În pot sunt 100, iar adversarul pariază 50: plătești 50 ca să câștigi un pot de 200, așa că un Call trebuie să câștige în mai mult de 50 ÷ 200 = 25 % din cazuri ca să fie profitabil. Cu un proiect de culoare și o singură carte de venit, nimerești în {f9one} din cazuri, deci un Call la un pariu când a rămas doar riverul te costă jetoane pe termen lung. All-In pe flop, cu ambele cărți de venit, același proiect intră în {f9river} din cazuri, iar Call-ul merită făcut.",
    "matchH2": "Dueluri înainte de flop",
    "matchP": "Cum se descurcă două mâini de start una împotriva celeilalte când toate cele cinci cărți comune sunt împărțite, numărat pe fiecare dintre cele {boards} de mese posibile. Culorile contează puțin: mâinile de mai jos nu au nicio culoare comună, decât dacă sunt arătate de aceeași culoare.",
    "matchCols": [
      "Mână",
      "Contra",
      "Câștigă",
      "Egalitate",
      "Pierde"
    ],
    "startH2": "Șansele mâinilor de start",
    "startP": "Există {combos} de mâini de start diferite din două cărți. Cât de des primești:",
    "startCols": [
      "Mână",
      "Șansă",
      "Cam o mână din"
    ],
    "starting": {
      "specificPair": "O anumită pereche în mână, de exemplu așii",
      "anyPair": "Orice pereche în mână",
      "specificNonPair": "O anumită mână fără pereche, de exemplu as-rege",
      "specificSuited": "O anumită mână de aceeași culoare, de exemplu as-rege de aceeași culoare",
      "anySuited": "Oricare două cărți de aceeași culoare",
      "twoBroadway": "Două cărți de la zece în sus"
    },
    "faqH2": "Întrebări",
    "faq": [
      [
        "Ce sunt outs la poker?",
        "Cărțile rămase în pachet care ți-ar da cea mai bună mână. Numără doar cărțile pe care nu le-ai văzut: 47 pe flop, 46 pe turn."
      ],
      [
        "Cât de des bat așii în mână regii?",
        "Cam de patru ori din cinci: {aakk} când toate cele cinci cărți comune sunt împărțite, regii câștigând {kkaa}."
      ],
      [
        "As-rege contra unei perechi e cap sau pajură?",
        "Aproape, contra unei perechi mijlocii: damele câștigă {qqak} contra lui as-rege. Contra unei perechi mici e și mai strâns — perechea de doi câștigă {22ak}."
      ],
      [
        "Ce sunt cotele potului?",
        "Prețul unui Call comparat cu potul pe care îl poți câștiga. Dacă șansa ta de câștig e mai mare decât partea din potul final pe care o pui tu, Call-ul e profitabil în timp."
      ],
      [
        "PokerTH îmi arată șansele în timpul jocului?",
        "Da. Fila Șanse îți arată cea mai bună mână curentă și șansa de câștig pe măsură ce apar cărțile, ca să-ți poți verifica propriul raționament la masă."
      ]
    ]
  },
  ru: {
    "title": "Шансы в покере — ауты, шансы банка, рука против руки | PokerTH",
    "desc": "Шансы в Texas Hold’em, рассчитанные точно: ауты и вероятность их собрать, правило 2 и 4, шансы банка и как часто AA бьёт KK, а QQ бьёт AK.",
    "ldHeadline": "Шансы в покере: ауты, шансы банка и противостояния на префлопе",
    "ldDesc": "Шансы в Texas Hold’em, рассчитанные точно: ауты, правило 2 и 4, шансы банка и противостояния на префлопе.",
    "h1": "Шансы в покере: ауты, шансы банка и противостояния на префлопе",
    "lead": "Хорошие решения в покере сводятся к нескольким числам: насколько вероятно, что ваша рука усилится, сколько нужно заплатить, чтобы это узнать, и как две руки соотносятся друг с другом до флопа. Каждая цифра на этой странице рассчитана точно, а не списана из таблицы.",
    "calc": {
      "h2": "Калькулятор шансов в покере",
      "intro": "Выберите две свои карты и, если хотите, борд и руку соперника. Калькулятор раздаёт все оставшиеся карты — точно, когда это возможно, иначе методом симуляции — и показывает, как часто вы выигрываете.",
      "you": "Ваша рука",
      "board": "Борд",
      "opp": "Соперник (необязательно)",
      "players": "Соперники",
      "pick": "Нажмите на карту, чтобы положить её в выделенную ячейку; нажмите на ячейку, чтобы освободить её.",
      "clear": "Очистить",
      "win": "Победа",
      "tie": "Ничья",
      "lose": "Поражение",
      "exact": "Точно: все {n} возможных раздач.",
      "sim": "Симуляция {n} случайных раздач.",
      "working": "Расчёт…",
      "need": "Выберите две свои карты, чтобы увидеть шансы.",
      "boardHint": "На борд кладутся три карты (флоп), затем четыре, затем пять.",
      "oppHint": "Выберите обе карты соперника или ни одной.",
      "final": "Ваша итоговая рука",
      "noscript": "Калькулятору нужен JavaScript. Таблицы ниже работают и без него."
    },
    "outsH2": "Ауты: ваш шанс собрать руку",
    "outsP": "Аут — это карта, ещё оставшаяся в колоде, которая делает вашу руку вероятным победителем. На флопе неизвестны 47 карт: с 9 аутами одна карта приходит на тёрне в {f9turn} случаев, а к риверу — когда впереди ещё две карты — в {f9river}.",
    "outsCols": [
      "Дро",
      "Ауты",
      "Тёрн",
      "Ривер (с тёрна)",
      "Тёрн или ривер (с флопа)"
    ],
    "draws": {
      "gutshot": "Дро на стрит в середину (гатшот)",
      "twoPairFull": "Две пары до фулл-хауса",
      "pairTrips": "Пара до двух пар или тройки",
      "twoOver": "Две оверкарты до пары",
      "setFull": "Сет до фулл-хауса или каре",
      "oesd": "Двустороннее дро на стрит",
      "flush": "Флеш-дро",
      "flushGut": "Флеш-дро и гатшот",
      "flushOesd": "Флеш-дро и двустороннее дро на стрит"
    },
    "outsNote": "Это шансы поймать один из ваших аутов. Бэкдор-варианты (раннер-раннер) не учтены, а аут, который заодно даёт сопернику руку сильнее, на самом деле не аут.",
    "ruleH2": "Правило 2 и 4",
    "ruleP": "Быстрая оценка за столом: на флопе умножьте число аутов на 4, если увидите и тёрн, и ривер, и на 2, если осталась одна карта. Флеш-дро на флопе — это 9 × 4 = 36 %, против точных {f9river}. Правило завышает сильные дро: 15 аутов дают 60 %, а на деле — {f15river}.",
    "potH2": "Шансы банка: стоит ли уравнивать?",
    "potP": "Шансы банка сравнивают то, что вы должны заплатить, с тем, что можете выиграть. В банке 100, соперник ставит 50: вы уравниваете 50, чтобы выиграть банк в 200, значит, колл должен выигрывать больше чем в 50 ÷ 200 = 25 % случаев, чтобы окупиться. С флеш-дро и одной картой впереди вы собираете руку в {f9one} случаев, поэтому уравнивать ставку, когда остался только ривер, на дистанции значит терять фишки. При ставке ва-банк на флопе, когда впереди обе карты, то же дро собирается в {f9river}, и колл того стоит.",
    "matchH2": "Противостояния на префлопе",
    "matchP": "Как две стартовые руки играют друг против друга, когда выложены все пять общих карт, с подсчётом по каждому из {boards} возможных бордов. Масти немного важны: у рук ниже нет общих мастей, если не указано, что они одномастные.",
    "matchCols": [
      "Рука",
      "Против",
      "Выигрыш",
      "Ничья",
      "Проигрыш"
    ],
    "startH2": "Вероятности стартовых рук",
    "startP": "Существует {combos} различных стартовых рук из двух карт. Как часто вам приходит:",
    "startCols": [
      "Рука",
      "Вероятность",
      "Примерно одна рука из"
    ],
    "starting": {
      "specificPair": "Определённая карманная пара, например тузы",
      "anyPair": "Любая карманная пара",
      "specificNonPair": "Определённая рука без пары, например туз-король",
      "specificSuited": "Определённая одномастная рука, например одномастные туз-король",
      "anySuited": "Любые две карты одной масти",
      "twoBroadway": "Две карты от десятки и выше"
    },
    "faqH2": "Вопросы",
    "faq": [
      [
        "Что такое ауты в покере?",
        "Карты, оставшиеся в колоде, которые дали бы вам лучшую руку. Считайте только карты, которых вы не видели: 47 на флопе, 46 на тёрне."
      ],
      [
        "Как часто карманные тузы обыгрывают королей?",
        "Примерно четыре раза из пяти: {aakk}, когда выложены все пять общих карт, а короли выигрывают {kkaa}."
      ],
      [
        "Туз-король против пары — это монетка?",
        "Почти, против средней пары: дамы выигрывают {qqak} против туза-короля. Против маленькой пары ещё ближе — двойки выигрывают {22ak}."
      ],
      [
        "Что такое шансы банка?",
        "Цена колла в сравнении с банком, который можно выиграть. Если ваш шанс на победу выше, чем доля итогового банка, которую вносите вы, колл окупается на дистанции."
      ],
      [
        "Показывает ли PokerTH мои шансы во время игры?",
        "Да. Вкладка «Шансы» называет вашу текущую лучшую руку и ваш шанс на победу по мере выхода карт, так что вы можете проверить собственные рассуждения прямо за столом."
      ]
    ]
  },
  si: {
    "title": "පෝකර් සම්භාවිතා වගුව — outs, pot odds, අත් ගැටුම් | PokerTH",
    "desc": "නිවැරදිව ගණනය කළ Texas Hold’em සම්භාවිතා: outs සහ ඒවා ලැබීමේ ඔබේ අවස්ථාව, 2 සහ 4 රීතිය, pot odds, සහ AA විසින් KK ද QQ විසින් AK ද පරදින වාර ගණන.",
    "ldHeadline": "පෝකර් සම්භාවිතා: outs, pot odds සහ preflop අත් ගැටුම්",
    "ldDesc": "නිවැරදිව ගණනය කළ Texas Hold’em සම්භාවිතා: outs, 2 සහ 4 රීතිය, pot odds සහ preflop අත් ගැටුම්.",
    "h1": "පෝකර් සම්භාවිතා: outs, pot odds සහ preflop අත් ගැටුම්",
    "lead": "හොඳ පෝකර් තීරණ අංක කිහිපයකට සීමා වේ: ඔබේ අත වැඩිදියුණු වීමට ඇති ඉඩ කොපමණද, එය දැනගැනීමට ඔබ කොපමණ ගෙවිය යුතුද, සහ ෆ්ලොප් එකට පෙර අත් දෙකක් එකිනෙකාට එරෙහිව සිටින්නේ කෙසේද යන්නයි. මෙම පිටුවේ සෑම අගයක්ම නිවැරදිව ගණනය කර ඇති අතර, වගුවකින් පිටපත් කළ ඒවා නොවේ.",
    "calc": {
      "h2": "පෝකර් සම්භාවිතා ගණකය",
      "intro": "ඔබේ කාඩ් දෙක තෝරන්න, කැමති නම් බෝඩ් එක සහ ප්‍රතිවාදියෙකුගේ අතද තෝරන්න. ගණකය ඉතිරි සියලු කාඩ් බෙදා බලයි — හැකි සෑම විටම නිවැරදිව, නැතිනම් සමාකරණයෙන් — සහ ඔබ කොපමණ වාරයක් දිනනවාද යන්න පෙන්වයි.",
      "you": "ඔබේ අත",
      "board": "බෝඩ් එක",
      "opp": "ප්‍රතිවාදියා (විකල්ප)",
      "players": "ප්‍රතිවාදීන්",
      "pick": "කාඩ් එකක් ඉස්මතු කළ ස්ථානයට තැබීමට එය තට්ටු කරන්න; ස්ථානයක් හිස් කිරීමට එය තට්ටු කරන්න.",
      "clear": "හිස් කරන්න",
      "win": "ජය",
      "tie": "සම",
      "lose": "පරාජය",
      "exact": "නිවැරදි: හැකි සියලු බෙදීම් {n} ම.",
      "sim": "අහඹු බෙදීම් {n} ක සමාකරණය.",
      "working": "ගණනය කරමින්…",
      "need": "ඔබේ අවස්ථා බැලීමට ඔබේ කාඩ් දෙක තෝරන්න.",
      "boardHint": "බෝඩ් එකට කාඩ් තුනක් (ෆ්ලොප්), පසුව හතරක්, පසුව පහක් වැටේ.",
      "oppHint": "ප්‍රතිවාදියාගේ කාඩ් දෙකම තෝරන්න, නැතිනම් එකක්වත් නොතෝරන්න.",
      "final": "ඔබේ අවසාන අත",
      "noscript": "ගණකයට JavaScript අවශ්‍යයි. පහත වගු එය නොමැතිවද ක්‍රියා කරයි."
    },
    "outsH2": "Outs: කාඩ් ලැබීමේ ඔබේ අවස්ථාව",
    "outsP": "Out එකක් යනු තවමත් කාඩ් කට්ටලයේ ඇති, ඔබේ අත බොහෝ විට ජයග්‍රාහී අත බවට පත් කරන කාඩ් එකකි. ෆ්ලොප් එකේදී කාඩ් 47 ක් නොපෙනී ඇත: outs 9 ක් සමඟ, ටර්න් එකේදී කාඩ් එකක් ලැබීමේ අවස්ථාව {f9turn} වන අතර, රිවර් දක්වා — තවත් කාඩ් දෙකක් එන විට — {f9river} වේ.",
    "outsCols": [
      "ඩ්‍රෝ",
      "Outs",
      "ටර්න්",
      "රිවර් (ටර්න් සිට)",
      "ටර්න් හෝ රිවර් (ෆ්ලොප් සිට)"
    ],
    "draws": {
      "gutshot": "ඇතුළත Straight ඩ්‍රෝ (gutshot)",
      "twoPairFull": "Two Pair සිට Full House",
      "pairTrips": "One Pair සිට Two Pair හෝ Three of a Kind",
      "twoOver": "Overcards දෙකක් සිට යුගලයක්",
      "setFull": "Set සිට Full House හෝ Four of a Kind",
      "oesd": "දෙපසින් විවෘත Straight ඩ්‍රෝ",
      "flush": "Flush ඩ්‍රෝ",
      "flushGut": "Flush ඩ්‍රෝ සහ gutshot",
      "flushOesd": "Flush ඩ්‍රෝ සහ දෙපසින් විවෘත Straight ඩ්‍රෝ"
    },
    "outsNote": "මේවා ඔබේ outs වලින් එකක් ලැබීමේ අවස්ථා වේ. runner-runner අමතර අවස්ථා මෙහි ඇතුළත් නොවන අතර, ප්‍රතිවාදියෙකුටද වඩා හොඳ අතක් ලබාදෙන out එකක් ඇත්තටම out එකක් නොවේ.",
    "ruleH2": "2 සහ 4 රීතිය",
    "ruleP": "මේසයේදී ඉක්මන් ඇස්තමේන්තුවක්: ටර්න් සහ රිවර් දෙකම දකින විට ෆ්ලොප් එකේදී ඔබේ outs 4 න් ගුණ කරන්න, තවත් එක් කාඩ් එකක් පමණක් එන විට 2 න් ගුණ කරන්න. ෆ්ලොප් එකේ Flush ඩ්‍රෝ එකක් 9 × 4 = 36% වන අතර, නිවැරදි අගය {f9river} වේ. මෙම රීතිය විශාල ඩ්‍රෝ අධිතක්සේරු කරයි: outs 15 ක් 60% ලබාදෙන නමුත්, සැබෑ අගය {f15river} වේ.",
    "potH2": "Pot odds: ඔබ Call කළ යුතුද?",
    "potP": "Pot odds මඟින් ඔබ ගෙවිය යුතු දේ ඔබට දිනිය හැකි දේ සමඟ සසඳයි. පොට් එකේ 100 ක් ඇති අතර ප්‍රතිවාදියා 50 ක් ඔට්ටු තබයි: 200 ක පොට් එකක් දිනීමට ඔබ 50 Call කරයි, එබැවින් ලාභදායී වීමට එම Call එක 50 ÷ 200 = 25% කට වඩා වැඩි වාර ගණනක් දිනිය යුතුය. Flush ඩ්‍රෝ එකක් සමඟ තවත් එක් කාඩ් එකක් එන විට ඔබට ලැබීමේ අවස්ථාව {f9one} වේ, එබැවින් රිවර් පමණක් ඉතිරිව ඇති විට ඔට්ටුවකට Call කිරීම දිගුකාලීනව චිප්ස් අහිමි කරයි. ෆ්ලොප් එකේදී All-In වූ විට, කාඩ් දෙකම එන්නට ඇති බැවින්, එම ඩ්‍රෝ එක ලැබීමේ අවස්ථාව {f9river} වන අතර, Call කිරීම වටී.",
    "matchH2": "Preflop අත් ගැටුම්",
    "matchP": "බෝඩ් කාඩ් පහම බෙදූ විට ආරම්භක අත් දෙකක් එකිනෙකාට එරෙහිව කෙසේ ක්‍රියා කරයිද යන්න, හැකි සියලු බෝඩ් {boards} ම ගණන් කර. කාඩ් වර්ග සුළු වශයෙන් වැදගත් වේ: suited ලෙස පෙන්වා නැත්නම්, පහත අත්වලට පොදු වර්ගයක් නැත.",
    "matchCols": [
      "අත",
      "එරෙහිව",
      "ජය",
      "සම",
      "පරාජය"
    ],
    "startH2": "ආරම්භක අත් සම්භාවිතා",
    "startP": "කාඩ් දෙකේ වෙනස් ආරම්භක අත් {combos} ක් ඇත. ඔබට ඒවා බෙදෙන වාර ගණන:",
    "startCols": [
      "අත",
      "අවස්ථාව",
      "දළ වශයෙන් අත් කීයකට එකක්"
    ],
    "starting": {
      "specificPair": "නිශ්චිත pocket pair එකක්, උදා. ඒස් යුගලය",
      "anyPair": "ඕනෑම pocket pair එකක්",
      "specificNonPair": "යුගලයක් නොවන නිශ්චිත අතක්, උදා. ඒස්-කිං",
      "specificSuited": "නිශ්චිත suited අතක්, උදා. ඒස්-කිං suited",
      "anySuited": "එකම වර්ගයේ ඕනෑම කාඩ් දෙකක්",
      "twoBroadway": "දහය හෝ ඊට ඉහළ කාඩ් දෙකක්"
    },
    "faqH2": "ප්‍රශ්න",
    "faq": [
      [
        "පෝකර්වල outs යනු මොනවාද?",
        "ඔබට හොඳම අත ලබාදෙන, කාඩ් කට්ටලයේ ඉතිරිව ඇති කාඩ්. ඔබ නොදුටු කාඩ් පමණක් ගණන් කරන්න: ෆ්ලොප් එකේදී 47, ටර්න් එකේදී 46."
      ],
      [
        "ඒස් pocket pair එක කිං යුගලය පරදින්නේ කොපමණ වාරයක්ද?",
        "දළ වශයෙන් පහෙන් හතරක්: බෝඩ් කාඩ් පහම බෙදූ විට {aakk}, කිං යුගලය දිනන්නේ {kkaa}."
      ],
      [
        "ඒස්-කිං එදිරිව යුගලයක් යනු කාසියක් උඩ දැමීමක්ද?",
        "බොහෝ දුරට, මධ්‍යම යුගලයකට එරෙහිව: ක්වීන් යුගලය ඒස්-කිං එදිරිව {qqak} දිනයි. කුඩා යුගලයකට එරෙහිව එය තවත් සමීපයි — දෙක යුගලය {22ak} දිනයි."
      ],
      [
        "Pot odds යනු මොනවාද?",
        "ඔබට දිනිය හැකි පොට් එකට සාපේක්ෂව Call එකක මිල. අවසාන පොට් එකට ඔබ දමන කොටසට වඩා ඔබේ ජය ගැනීමේ අවස්ථාව වැඩි නම්, Call කිරීම කාලයත් සමඟ ලාභදායී වේ."
      ],
      [
        "ක්‍රීඩාව අතරතුර PokerTH මගේ අවස්ථා පෙන්වයිද?",
        "ඔව්. සම්භාවිතා ටැබය කාඩ් එළියට එන විට ඔබේ වත්මන් හොඳම අත සහ ජය ගැනීමේ ඔබේ සම්භාවිතාව නම් කරයි, එබැවින් මේසයේදීම ඔබේ තර්කනය පරීක්ෂා කළ හැක."
      ]
    ]
  },
  sk: {
    "title": "Pokerové šance — outy, pot odds, súboje rúk | PokerTH",
    "desc": "Šance v Texas Hold’em presne vypočítané: outy a šanca, že ich trafíte, pravidlo 2 a 4, pot odds a ako často AA porazí KK alebo QQ porazí AK.",
    "ldHeadline": "Pokerové šance: outy, pot odds a súboje pred flopom",
    "ldDesc": "Šance v Texas Hold’em presne vypočítané: outy, pravidlo 2 a 4, pot odds a súboje pred flopom.",
    "h1": "Pokerové šance: outy, pot odds a súboje pred flopom",
    "lead": "Dobré rozhodnutia v pokri závisia od niekoľkých čísel: aká je pravdepodobnosť, že sa vaša ruka zlepší, koľko musíte zaplatiť, aby ste to zistili, a ako na tom sú dve ruky proti sebe pred flopom. Každé číslo na tejto stránke je presne vypočítané, nie odpísané z tabuľky.",
    "calc": {
      "h2": "Kalkulačka pokerových šancí",
      "intro": "Vyberte svoje dve karty a, ak chcete, aj stôl a karty súpera. Kalkulačka rozdá všetky zostávajúce karty — presne, kedykoľvek sa dá, inak simuláciou — a ukáže, ako často vyhrávate.",
      "you": "Vaše karty",
      "board": "Stôl",
      "opp": "Súper (voliteľné)",
      "players": "Súperi",
      "pick": "Ťuknite na kartu, aby ste ju vložili do zvýrazneného miesta; ťuknutím na miesto ho vyprázdnite.",
      "clear": "Vymazať",
      "win": "Výhra",
      "tie": "Remíza",
      "lose": "Prehra",
      "exact": "Presne: všetkých {n} možných rozdaní.",
      "sim": "Simulácia {n} náhodných rozdaní.",
      "working": "Počíta sa…",
      "need": "Vyberte svoje dve karty a uvidíte svoje šance.",
      "boardHint": "Na stôl idú najprv tri karty (flop), potom štyri, potom päť.",
      "oppHint": "Vyberte obe karty súpera, alebo žiadnu.",
      "final": "Vaša konečná kombinácia",
      "noscript": "Kalkulačka potrebuje JavaScript. Tabuľky nižšie fungujú aj bez neho."
    },
    "outsH2": "Outy: šanca, že trafíte",
    "outsP": "Out je karta, ktorá je ešte v balíčku a urobí z vašej ruky pravdepodobného víťaza. Na flope je 47 kariet nevidených: s 9 outmi padne potrebná karta na turne v {f9turn} prípadov a do riveru — keď prídu ešte dve karty — v {f9river}.",
    "outsCols": [
      "Dotiahnutie",
      "Outy",
      "Turn",
      "River (od turnu)",
      "Turn alebo river (od flopu)"
    ],
    "draws": {
      "gutshot": "Vnútorné dotiahnutie na postupku (gutshot)",
      "twoPairFull": "Dve dvojice na full house",
      "pairTrips": "Pár na dve dvojice alebo trojicu",
      "twoOver": "Dve vyššie karty (overcards) na pár",
      "setFull": "Set na full house alebo štvoricu",
      "oesd": "Obojstranné dotiahnutie na postupku",
      "flush": "Dotiahnutie na farbu",
      "flushGut": "Dotiahnutie na farbu a gutshot",
      "flushOesd": "Dotiahnutie na farbu a obojstranné na postupku"
    },
    "outsNote": "Toto sú šance, že chytíte jeden zo svojich outov. Nezahŕňajú runner-runner možnosti navyše a out, ktorý dá lepšiu ruku aj súperovi, v skutočnosti nie je out.",
    "ruleH2": "Pravidlo 2 a 4",
    "ruleP": "Rýchly odhad pri stole: na flope vynásobte outy číslom 4, keď uvidíte turn aj river, a číslom 2, keď príde už len jedna karta. Dotiahnutie na farbu na flope je 9 × 4 = 36 %, oproti presným {f9river}. Pravidlo veľké dotiahnutia nadhodnocuje: 15 outov dáva 60 %, skutočné číslo je {f15river}.",
    "potH2": "Pot odds: oplatí sa Call?",
    "potP": "Pot odds porovnávajú, koľko musíte zaplatiť, s tým, koľko môžete vyhrať. V banku je 100 a súper vsadí 50: dorovnáte 50, aby ste vyhrali bank 200, takže Call musí vyhrať vo viac ako 50 ÷ 200 = 25 % prípadov, aby sa oplatil. S dotiahnutím na farbu a jednou kartou, ktorá ešte príde, trafíte v {f9one} prípadov, takže dorovnať stávku, keď zostáva už len river, vás z dlhodobého hľadiska stojí žetóny. Pri All-In na flope, keď prídu ešte obe karty, to isté dotiahnutie trafí v {f9river} a Call sa oplatí.",
    "matchH2": "Súboje pred flopom",
    "matchP": "Ako si vedú dve štartovacie ruky proti sebe, keď sa rozdá všetkých päť kariet na stôl, spočítané na každom z {boards} možných stolov. Farby majú malý vplyv: ruky nižšie nemajú spoločnú farbu, pokiaľ nie sú uvedené v rovnakej farbe.",
    "matchCols": [
      "Ruka",
      "Proti",
      "Vyhráva",
      "Remíza",
      "Prehráva"
    ],
    "startH2": "Šance na štartovacie ruky",
    "startP": "Existuje {combos} rôznych štartovacích rúk z dvoch kariet. Ako často dostanete:",
    "startCols": [
      "Ruka",
      "Šanca",
      "Približne jedna ruka z"
    ],
    "starting": {
      "specificPair": "Konkrétny pár v ruke, napríklad esá",
      "anyPair": "Akýkoľvek pár v ruke",
      "specificNonPair": "Konkrétna ruka bez páru, napríklad eso s kráľom",
      "specificSuited": "Konkrétna ruka v rovnakej farbe, napríklad eso s kráľom v rovnakej farbe",
      "anySuited": "Ľubovoľné dve karty rovnakej farby",
      "twoBroadway": "Dve karty od desiatky vyššie"
    },
    "faqH2": "Otázky",
    "faq": [
      [
        "Čo sú outy v pokri?",
        "Karty zostávajúce v balíčku, ktoré by vám dali najlepšiu ruku. Počítajte len karty, ktoré ste nevideli: 47 na flope, 46 na turne."
      ],
      [
        "Ako často porazia esá v ruke kráľov?",
        "Približne štyrikrát z piatich: {aakk}, keď sa rozdá všetkých päť kariet na stôl, a králi vyhrajú {kkaa}."
      ],
      [
        "Je eso s kráľom proti páru hod mincou?",
        "Takmer, proti strednému páru: dámy vyhrávajú {qqak} proti esu s kráľom. Proti malému páru je to ešte vyrovnanejšie — dvojky vyhrávajú {22ak}."
      ],
      [
        "Čo sú pot odds?",
        "Cena za Call v porovnaní s bankom, ktorý môžete vyhrať. Ak je vaša šanca na výhru vyššia ako podiel konečného banku, ktorý doň vložíte, dorovnávanie sa vám z dlhodobého hľadiska oplatí."
      ],
      [
        "Ukazuje PokerTH moje šance počas hry?",
        "Áno. Karta Šance zobrazuje vašu aktuálne najlepšiu kombináciu a šancu na výhru, ako prichádzajú karty, takže si pri stole môžete overiť vlastnú úvahu."
      ]
    ]
  },
  sl: {
    "title": "Poker verjetnosti — outi, kvote banke, dvoboji | PokerTH",
    "desc": "Verjetnosti v Texas Hold’emu, natančno izračunane: outi in možnost, da jih zadeneš, pravilo 2 in 4, kvote banke ter kako pogosto AA premaga KK ali QQ premaga AK.",
    "ldHeadline": "Poker verjetnosti: outi, kvote banke in dvoboji pred flopom",
    "ldDesc": "Verjetnosti v Texas Hold’emu, natančno izračunane: outi, pravilo 2 in 4, kvote banke in dvoboji pred flopom.",
    "h1": "Poker verjetnosti: outi, kvote banke in dvoboji pred flopom",
    "lead": "Dobre odločitve v pokru se skrčijo na nekaj številk: kako verjetno se bo tvoja roka izboljšala, koliko moraš plačati, da to izveš, in kako dve roki stojita druga proti drugi pred flopom. Vsaka številka na tej strani je natančno izračunana, ne prepisana iz tabele.",
    "calc": {
      "h2": "Kalkulator pokrskih verjetnosti",
      "intro": "Izberi svoji dve karti in po želji še karte na mizi ter roko nasprotnika. Kalkulator razdeli vse preostale karte — natančno, kadar je le mogoče, sicer s simulacijo — in pokaže, kako pogosto zmagaš.",
      "you": "Tvoja roka",
      "board": "Miza",
      "opp": "Nasprotnik (neobvezno)",
      "players": "Nasprotniki",
      "pick": "Tapni karto, da jo postaviš na označeno mesto; tapni mesto, da ga izprazniš.",
      "clear": "Počisti",
      "win": "Zmaga",
      "tie": "Izenačeno",
      "lose": "Poraz",
      "exact": "Natančno: vsaka od {n} možnih delitev.",
      "sim": "Simulacija {n} naključnih delitev.",
      "working": "Računam…",
      "need": "Izberi svoji dve karti, da vidiš svoje možnosti.",
      "boardHint": "Na mizo gredo tri karte (flop), nato štiri, nato pet.",
      "oppHint": "Izberi obe karti nasprotnika ali nobene.",
      "final": "Tvoja končna roka",
      "noscript": "Kalkulator potrebuje JavaScript. Tabele spodaj delujejo tudi brez njega."
    },
    "outsH2": "Outi: tvoja možnost zadetka",
    "outsP": "Out je karta, ki je še v špilu in iz tvoje roke naredi verjetno zmagovalno. Na flopu je 47 kart nevidnih: z 9 outi ena karta zadene na turnu v {f9turn} primerov, do riverja — ko prideta še dve karti — pa v {f9river} primerov.",
    "outsCols": [
      "Izgled",
      "Outi",
      "Turn",
      "River (s turna)",
      "Turn ali river (s flopa)"
    ],
    "draws": {
      "gutshot": "Izgled za notranji straight (gutshot)",
      "twoPairFull": "Dva para do Full Housea",
      "pairTrips": "En par do dveh parov ali trojke",
      "twoOver": "Dve karti, višji od mize, do para",
      "setFull": "Set do Full Housea ali kareja",
      "oesd": "Izgled za odprti straight",
      "flush": "Izgled za flush",
      "flushGut": "Izgled za flush in gutshot",
      "flushOesd": "Izgled za flush in odprti straight"
    },
    "outsNote": "To so možnosti, da ujameš enega od svojih outov. Ne upoštevajo dodatkov runner-runner, out, ki tudi nasprotniku da boljšo roko, pa v resnici ni out.",
    "ruleH2": "Pravilo 2 in 4",
    "ruleP": "Hitra ocena za mizo: na flopu pomnoži svoje oute s 4, kadar boš videl turn in river, in z 2, kadar pride le še ena karta. Izgled za flush na flopu da 9 × 4 = 36 %, natančno pa {f9river}. Pravilo precenjuje velike izglede: 15 outov da 60 %, resnična številka je {f15river}.",
    "potH2": "Kvote banke: ali plačati?",
    "potP": "Kvote banke primerjajo, koliko moraš plačati, s tem, koliko lahko zmagaš. V banki je 100, nasprotnik stavi 50: plačaš 50, da zmagaš banko 200, zato mora plačilo zmagati v več kot 50 ÷ 200 = 25 % primerov, da se izplača. Z izgledom za flush in eno karto do konca zadeneš v {f9one} primerov, zato plačilo stave, ko ostane le še river, na dolgi rok izgublja žetone. Pri All-In na flopu, ko prideta še obe karti, isti izgled zadene v {f9river} primerov, in plačilo se splača.",
    "matchH2": "Dvoboji pred flopom",
    "matchP": "Kako se dve začetni roki odrežeta druga proti drugi, ko je razdeljenih vseh pet kart na mizi, prešteto na vsaki od {boards} možnih postavitev mize. Barve malo štejejo: roke spodaj nimajo skupne barve, razen če so prikazane kot iste barve.",
    "matchCols": [
      "Roka",
      "Proti",
      "Zmaga",
      "Izenačeno",
      "Izgubi"
    ],
    "startH2": "Verjetnosti začetnih rok",
    "startP": "Obstaja {combos} različnih začetnih rok z dvema kartama. Kako pogosto dobiš:",
    "startCols": [
      "Roka",
      "Možnost",
      "Približno ena roka od"
    ],
    "starting": {
      "specificPair": "Določen žepni par, na primer asa",
      "anyPair": "Kateri koli žepni par",
      "specificNonPair": "Določena roka brez para, na primer as-kralj",
      "specificSuited": "Določena roka iste barve, na primer as-kralj iste barve",
      "anySuited": "Kateri koli dve karti iste barve",
      "twoBroadway": "Dve karti od desetke navzgor"
    },
    "faqH2": "Vprašanja",
    "faq": [
      [
        "Kaj so outi v pokru?",
        "Karte, ki so ostale v špilu in bi ti dale najboljšo roko. Štej samo karte, ki jih nisi videl: 47 na flopu, 46 na turnu."
      ],
      [
        "Kako pogosto par asov premaga par kraljev?",
        "Približno štirikrat od petih: {aakk}, ko je razdeljenih vseh pet kart na mizi, kralji pa zmagajo v {kkaa}."
      ],
      [
        "Je as-kralj proti paru met kovanca?",
        "Skoraj, proti srednjemu paru: dame zmagajo proti as-kralju v {qqak}. Proti majhnemu paru je še bolj tesno — dvojke zmagajo v {22ak}."
      ],
      [
        "Kaj so kvote banke?",
        "Cena plačila v primerjavi z banko, ki jo lahko zmagaš. Če je tvoja možnost za zmago večja od deleža končne banke, ki si ga vložil, se plačilo na dolgi rok izplača."
      ],
      [
        "Ali PokerTH med igro pokaže moje možnosti?",
        "Da. Zavihek Kvote poimenuje tvojo trenutno najboljšo roko in tvojo možnost za zmago, ko se karte razkrivajo, tako da lahko za mizo preveriš svoje razmišljanje."
      ]
    ]
  },
  sq: {
    "title": "Shanset në poker — outs, shanset e bankës, duelet | PokerTH",
    "desc": "Shanset në Texas Hold’em të llogaritura saktë: outs dhe shansi yt për t’i goditur, rregulli i 2 dhe 4, shanset e bankës dhe sa shpesh AA mund KK ose QQ mund AK.",
    "ldHeadline": "Shanset në poker: outs, shanset e bankës dhe duelet para flop-it",
    "ldDesc": "Shanset në Texas Hold’em të llogaritura saktë: outs, rregulli i 2 dhe 4, shanset e bankës dhe duelet para flop-it.",
    "h1": "Shanset në poker: outs, shanset e bankës dhe duelet para flop-it",
    "lead": "Vendimet e mira në poker varen nga disa numra: sa e mundshme është që dora jote të përmirësohet, sa duhet të paguash për ta zbuluar dhe si qëndrojnë dy duar kundër njëra-tjetrës para flop-it. Çdo shifër në këtë faqe është llogaritur saktë, jo kopjuar nga ndonjë tabelë.",
    "calc": {
      "h2": "Kalkulator i shanseve në poker",
      "intro": "Zgjidh dy letrat e tua dhe, nëse dëshiron, letrat në tavolinë dhe dorën e një kundërshtari. Kalkulatori shpërndan çdo letër të mbetur — saktë kurdo që mundet, përndryshe me simulim — dhe tregon sa shpesh fiton.",
      "you": "Dora jote",
      "board": "Tavolina",
      "opp": "Kundërshtari (opsionale)",
      "players": "Kundërshtarë",
      "pick": "Prek një letër për ta vendosur te vendi i theksuar; prek një vend për ta zbrazur.",
      "clear": "Pastro",
      "win": "Fitore",
      "tie": "Barazim",
      "lose": "Humbje",
      "exact": "Saktë: secila nga {n} shpërndarjet e mundshme.",
      "sim": "Simulim i {n} shpërndarjeve të rastësishme.",
      "working": "Duke llogaritur…",
      "need": "Zgjidh dy letrat e tua për të parë shanset.",
      "boardHint": "Në tavolinë shkojnë tri letra (flop-i), pastaj katër, pastaj pesë.",
      "oppHint": "Zgjidh të dyja letrat e kundërshtarit, ose asnjërën.",
      "final": "Dora jote përfundimtare",
      "noscript": "Kalkulatori ka nevojë për JavaScript. Tabelat më poshtë funksionojnë edhe pa të."
    },
    "outsH2": "Outs: shansi yt për të goditur",
    "outsP": "Një out është një letër që është ende në deke dhe që e kthen dorën tënde në fituesen e mundshme. Në flop ka 47 letra të padukura: me 9 outs, një letër godet në turn në {f9turn} të rasteve, dhe deri në river — me dy letra që vijnë — në {f9river}.",
    "outsCols": [
      "Draw",
      "Outs",
      "Turn",
      "River (nga turn-i)",
      "Turn ose river (nga flop-i)"
    ],
    "draws": {
      "gutshot": "Draw i brendshëm për straight (gutshot)",
      "twoPairFull": "Dy çifte drejt Full House",
      "pairTrips": "Një çift drejt dy çifteve ose treshes",
      "twoOver": "Dy overcards drejt një çifti",
      "setFull": "Set drejt Full House ose katërshes",
      "oesd": "Draw i hapur për straight",
      "flush": "Draw për flush",
      "flushGut": "Draw për flush dhe gutshot",
      "flushOesd": "Draw për flush dhe draw i hapur për straight"
    },
    "outsNote": "Këto janë shanset për të kapur një nga outs-at e tu. Nuk përfshijnë shtesat runner-runner, dhe një out që i jep edhe kundërshtarit një dorë më të mirë nuk është vërtet out.",
    "ruleH2": "Rregulli i 2 dhe 4",
    "ruleP": "Një vlerësim i shpejtë te tavolina: shumëzo outs-at me 4 në flop kur do të shohësh edhe turn-in edhe river-in, dhe me 2 kur vjen vetëm një letër. Një draw për flush në flop jep 9 × 4 = 36%, kundrejt {f9river} të sakta. Rregulli i mbivlerëson draw-et e mëdha: 15 outs japin 60%, ndërsa shifra e vërtetë është {f15river}.",
    "potH2": "Shanset e bankës: a duhet të paguash?",
    "potP": "Shanset e bankës krahasojnë atë që duhet të paguash me atë që mund të fitosh. Banka ka 100 dhe kundërshtari vë bast 50: ti paguan 50 për të fituar një bankë prej 200, kështu që pagesa duhet të fitojë më shumë se 50 ÷ 200 = 25% të rasteve që të dalë me fitim. Me një draw për flush dhe një letër që vjen, godet në {f9one} të rasteve, kështu që të paguash një bast kur ka mbetur vetëm river-i të humb zhetonë në afat të gjatë. All-in në flop, me të dyja letrat që vijnë, i njëjti draw godet në {f9river} të rasteve, dhe pagesa ia vlen.",
    "matchH2": "Duelet para flop-it",
    "matchP": "Si dalin dy duar fillestare kundër njëra-tjetrës kur shpërndahen të pesë letrat e tavolinës, të numëruara mbi secilën nga {boards} tavolinat e mundshme. Bojërat kanë pak rëndësi: duart më poshtë nuk ndajnë asnjë bojë, përveç kur tregohen me të njëjtën bojë.",
    "matchCols": [
      "Dora",
      "Kundër",
      "Fiton",
      "Barazim",
      "Humb"
    ],
    "startH2": "Shanset e duarve fillestare",
    "startP": "Ekzistojnë {combos} duar fillestare të ndryshme me dy letra. Sa shpesh të bien:",
    "startCols": [
      "Dora",
      "Shansi",
      "Rreth një dorë në"
    ],
    "starting": {
      "specificPair": "Një çift privat i caktuar, p.sh. asët",
      "anyPair": "Çfarëdo çift privat",
      "specificNonPair": "Një dorë e caktuar pa çift, p.sh. as-mbret",
      "specificSuited": "Një dorë e caktuar me të njëjtën bojë, p.sh. as-mbret me të njëjtën bojë",
      "anySuited": "Çfarëdo dy letra me të njëjtën bojë",
      "twoBroadway": "Dy letra dhjetë ose më të larta"
    },
    "faqH2": "Pyetje",
    "faq": [
      [
        "Çfarë janë outs në poker?",
        "Letrat që mbeten në deke dhe që do të të jepnin dorën më të mirë. Numëro vetëm letrat që nuk i ke parë: 47 në flop, 46 në turn."
      ],
      [
        "Sa shpesh i mundin asët mbretërit?",
        "Rreth katër herë në pesë: {aakk} kur shpërndahen të pesë letrat e tavolinës, ndërsa mbretërit fitojnë {kkaa}."
      ],
      [
        "A është as-mbret kundër një çifti hedhje monedhe?",
        "Pothuajse, kundër një çifti të mesëm: damat fitojnë {qqak} kundër as-mbretit. Kundër një çifti të vogël është edhe më e barabartë — dyshet fitojnë {22ak}."
      ],
      [
        "Çfarë janë shanset e bankës?",
        "Çmimi i një pagese krahasuar me bankën që mund të fitosh. Nëse shansi yt për të fituar është më i lartë se pjesa e bankës përfundimtare që vë ti, pagesa ia vlen me kohë."
      ],
      [
        "A i tregon PokerTH shanset e mia gjatë lojës?",
        "Po. Skeda Shanset emërton kombinimin tënd aktualisht më të mirë dhe shansin tënd për të fituar ndërsa dalin letrat, që ta kontrollosh vetë arsyetimin tënd te tavolina."
      ]
    ]
  },
  sr: {
    "title": "Покер шансе — аутси, изгледи пота, дуели руку | PokerTH",
    "desc": "Шансе у Texas Hold’em-у израчунате тачно: аутси и ваша шанса да их погодите, правило 2 и 4, изгледи пота и колико често AA побеђује KK или QQ побеђује AK.",
    "ldHeadline": "Покер шансе: аутси, изгледи пота и дуели пре флопа",
    "ldDesc": "Шансе у Texas Hold’em-у израчунате тачно: аутси, правило 2 и 4, изгледи пота и дуели пре флопа.",
    "h1": "Покер шансе: аутси, изгледи пота и дуели пре флопа",
    "lead": "Добре одлуке у покеру своде се на неколико бројева: колико је вероватно да ће се ваша рука побољшати, колико морате да платите да бисте то сазнали и како две руке стоје једна према другој пре флопа. Сваки број на овој страници израчунат је тачно, а не преписан из табеле.",
    "calc": {
      "h2": "Калкулатор покер шанси",
      "intro": "Изаберите своје две карте и, ако желите, сто и руку противника. Калкулатор дели све преостале карте — тачно кад год може, у супротном симулацијом — и показује колико често побеђујете.",
      "you": "Ваша рука",
      "board": "Сто",
      "opp": "Противник (опционо)",
      "players": "Противници",
      "pick": "Додирните карту да бисте је ставили у означено поље; додирните поље да бисте га испразнили.",
      "clear": "Очисти",
      "win": "Победа",
      "tie": "Нерешено",
      "lose": "Пораз",
      "exact": "Тачно: свако од {n} могућих дељења.",
      "sim": "Симулација {n} насумичних дељења.",
      "working": "Рачунам…",
      "need": "Изаберите своје две карте да бисте видели шансе.",
      "boardHint": "На сто иду три карте (флоп), затим четири, затим пет.",
      "oppHint": "Изаберите обе карте противника или ниједну.",
      "final": "Ваша коначна рука",
      "noscript": "Калкулатору је потребан JavaScript. Табеле испод раде и без њега."
    },
    "outsH2": "Аутси: ваша шанса да погодите",
    "outsP": "Аут је карта која је још у шпилу и која вашу руку претвара у вероватног победника. На флопу 47 карата још није виђено: са 9 аутса једна карта погађа на терну у {f9turn} случајева, а до ривера — уз још две карте — у {f9river}.",
    "outsCols": [
      "Чекање",
      "Аутси",
      "Терн",
      "Ривер (од терна)",
      "Терн или ривер (од флопа)"
    ],
    "draws": {
      "gutshot": "Чекање на унутрашњу кенту (гатшот)",
      "twoPairFull": "Два пара ка фулу",
      "pairTrips": "Један пар ка два пара или трилингу",
      "twoOver": "Две више карте ка пару",
      "setFull": "Сет ка фулу или карету",
      "oesd": "Чекање на отворену кенту",
      "flush": "Чекање на флеш",
      "flushGut": "Чекање на флеш и гатшот",
      "flushOesd": "Чекање на флеш и отворену кенту"
    },
    "outsNote": "Ово су шансе да ухватите један од својих аутса. Не урачунавају додатке runner-runner, а аут који и противнику даје бољу руку није заправо аут.",
    "ruleH2": "Правило 2 и 4",
    "ruleP": "Брза процена за столом: помножите аутсе са 4 на флопу када ћете видети и терн и ривер, а са 2 када долази још само једна карта. Чекање на флеш на флопу даје 9 × 4 = 36%, наспрам тачних {f9river}. Правило прецењује велика чекања: 15 аутса даје 60%, а стварни број је {f15river}.",
    "potH2": "Изгледи пота: да ли да платите?",
    "potP": "Изгледи пота пореде оно што морате да платите са оним што можете да освојите. У поту је 100 и противник улаже 50: плаћате 50 да бисте освојили пот од 200, па Call мора да побеђује у више од 50 ÷ 200 = 25% случајева да би се исплатио. Са чекањем на флеш и још једном картом погађате у {f9one} случајева, па плаћање улога кад је остао само ривер на дуже стазе губи жетоне. All-In на флопу, уз још две карте, исто чекање погађа у {f9river}, и Call се исплати.",
    "matchH2": "Дуели пре флопа",
    "matchP": "Како две почетне руке пролазе једна против друге када се поделе свих пет карата на столу, рачунато преко свих {boards} могућих столова. Боје мало утичу: руке испод немају заједничку боју осим ако нису приказане као исте боје.",
    "matchCols": [
      "Рука",
      "Против",
      "Добија",
      "Нерешено",
      "Губи"
    ],
    "startH2": "Шансе за почетне руке",
    "startP": "Постоји {combos} различитих почетних руку од две карте. Колико често добијате:",
    "startCols": [
      "Рука",
      "Шанса",
      "Отприлике једна рука на"
    ],
    "starting": {
      "specificPair": "Одређен пар у руци, на пример асови",
      "anyPair": "Било који пар у руци",
      "specificNonPair": "Одређена рука без пара, на пример ас-краљ",
      "specificSuited": "Одређена рука исте боје, на пример ас-краљ исте боје",
      "anySuited": "Било које две карте исте боје",
      "twoBroadway": "Две карте од десетке навише"
    },
    "faqH2": "Питања",
    "faq": [
      [
        "Шта су аутси у покеру?",
        "Карте преостале у шпилу које би вам дале најбољу руку. Бројте само карте које нисте видели: 47 на флопу, 46 на терну."
      ],
      [
        "Колико често пар асова побеђује пар краљева?",
        "Отприлике четири пута од пет: {aakk} када се поделе свих пет карата на столу, а краљеви добијају {kkaa}."
      ],
      [
        "Да ли је ас-краљ против пара бацање новчића?",
        "Скоро, против средњег пара: даме добијају {qqak} против ас-краља. Против малог пара још је тесније — двојке добијају {22ak}."
      ],
      [
        "Шта су изгледи пота?",
        "Цена Call-а у поређењу са потом који можете да освојите. Ако је ваша шанса за победу већа од удела у коначном поту који сте уложили, плаћање се временом исплати."
      ],
      [
        "Да ли PokerTH приказује моје шансе током игре?",
        "Да. Картица Шансе приказује вашу тренутно најбољу руку и вашу шансу за победу како карте излазе, па за столом можете да проверите сопствено резоновање."
      ]
    ]
  },
  sv: {
    "title": "Pokerodds-tabell — outs, pottodds, händer mot varandra | PokerTH",
    "desc": "Odds i Texas Hold’em exakt uträknade: outs och din chans att träffa dem, regeln om 2 och 4, pottodds och hur ofta AA slår KK eller QQ slår AK.",
    "ldHeadline": "Pokerodds: outs, pottodds och möten före floppen",
    "ldDesc": "Odds i Texas Hold’em exakt uträknade: outs, regeln om 2 och 4, pottodds och möten före floppen.",
    "h1": "Pokerodds: outs, pottodds och möten före floppen",
    "lead": "Bra pokerbeslut handlar om några få siffror: hur troligt det är att din hand förbättras, hur mycket du måste betala för att få veta det, och hur två händer står sig mot varandra före floppen. Varje siffra på den här sidan är exakt uträknad, inte kopierad från en tabell.",
    "calc": {
      "h2": "Pokeroddskalkylator",
      "intro": "Välj dina två kort och, om du vill, bordet och en motståndares hand. Kalkylatorn delar ut alla återstående kort — exakt när det går, annars genom simulering — och visar hur ofta du vinner.",
      "you": "Din hand",
      "board": "Bordet",
      "opp": "Motståndare (valfritt)",
      "players": "Motståndare",
      "pick": "Tryck på ett kort för att lägga det på den markerade platsen; tryck på en plats för att tömma den.",
      "clear": "Rensa",
      "win": "Vinst",
      "tie": "Delad",
      "lose": "Förlust",
      "exact": "Exakt: alla {n} möjliga utdelningar.",
      "sim": "Simulering av {n} slumpmässiga utdelningar.",
      "working": "Räknar…",
      "need": "Välj dina två kort för att se dina odds.",
      "boardHint": "Bordet tar tre kort (floppen), sedan fyra, sedan fem.",
      "oppHint": "Välj båda motståndarens kort, eller inget.",
      "final": "Din slutliga hand",
      "noscript": "Kalkylatorn kräver JavaScript. Tabellerna nedan fungerar utan."
    },
    "outsH2": "Outs: din chans att träffa",
    "outsP": "En out är ett kort som fortfarande finns i leken och som gör din hand till den troliga vinnaren. På floppen är 47 kort osedda: med 9 outs träffar ett kort på turn {f9turn} av gångerna, och fram till river — med två kort kvar — {f9river}.",
    "outsCols": [
      "Dragning",
      "Outs",
      "Turn",
      "River (från turn)",
      "Turn eller river (från floppen)"
    ],
    "draws": {
      "gutshot": "Inre stegdragning (gutshot)",
      "twoPairFull": "Två par till kåk",
      "pairTrips": "Par till två par eller triss",
      "twoOver": "Två överkort till par",
      "setFull": "Dolt tretal (set) till kåk eller fyrtal",
      "oesd": "Öppen stegdragning",
      "flush": "Färgdragning",
      "flushGut": "Färgdragning och gutshot",
      "flushOesd": "Färgdragning och öppen stegdragning"
    },
    "outsNote": "Det här är chanserna att få ett av dina outs. Extra chanser via två kort i rad (runner-runner) är inte medräknade, och ett out som också ger en motståndare en bättre hand är egentligen inget out.",
    "ruleH2": "Regeln om 2 och 4",
    "ruleP": "En snabb uppskattning vid bordet: multiplicera dina outs med 4 på floppen när du får se både turn och river, och med 2 när bara ett kort återstår. En färgdragning på floppen ger 9 × 4 = 36 %, mot exakt {f9river}. Regeln överskattar stora dragningar: 15 outs ger 60 %, den verkliga siffran är {f15river}.",
    "potH2": "Pottodds: ska du syna?",
    "potP": "Pottodds jämför vad du måste betala med vad du kan vinna. Potten innehåller 100 och motståndaren satsar 50: du synar 50 för att vinna en pott på 200, så synen måste vinna mer än 50 ÷ 200 = 25 % av gångerna för att löna sig. Med en färgdragning och ett kort kvar träffar du {f9one} av gångerna, så att syna en insats när bara river återstår förlorar marker i längden. All-in på floppen, med båda korten kvar, träffar samma dragning {f9river}, och då är det värt att syna.",
    "matchH2": "Möten före floppen",
    "matchP": "Hur två starthänder klarar sig mot varandra när alla fem bordskort delas ut, räknat över alla {boards} möjliga bord. Färgerna spelar lite roll: händerna nedan delar ingen färg om de inte visas i samma färg.",
    "matchCols": [
      "Hand",
      "Mot",
      "Vinner",
      "Delad",
      "Förlorar"
    ],
    "startH2": "Odds för starthänder",
    "startP": "Det finns {combos} olika starthänder med två kort. Så ofta får du:",
    "startCols": [
      "Hand",
      "Chans",
      "Ungefär en hand på"
    ],
    "starting": {
      "specificPair": "Ett bestämt par på handen, till exempel ess",
      "anyPair": "Valfritt par på handen",
      "specificNonPair": "En bestämd hand utan par, till exempel ess-kung",
      "specificSuited": "En bestämd hand i samma färg, till exempel ess-kung i samma färg",
      "anySuited": "Två valfria kort i samma färg",
      "twoBroadway": "Två kort tio eller högre"
    },
    "faqH2": "Frågor",
    "faq": [
      [
        "Vad är outs i poker?",
        "Korten som finns kvar i leken och som skulle ge dig den bästa handen. Räkna bara de kort du inte har sett: 47 på floppen, 46 på turn."
      ],
      [
        "Hur ofta slår ett par ess ett par kungar?",
        "Ungefär fyra gånger av fem: {aakk} när alla fem bordskort delas ut, medan kungarna vinner {kkaa}."
      ],
      [
        "Är ess-kung mot ett par ett myntkast?",
        "Nästan, mot ett mellanpar: damer vinner {qqak} mot ess-kung. Mot ett litet par är det ännu jämnare — tvåor vinner {22ak}."
      ],
      [
        "Vad är pottodds?",
        "Priset för en syn jämfört med potten du kan vinna. Om din vinstchans är högre än den andel av slutpotten som du själv lägger in, lönar det sig att syna i längden."
      ],
      [
        "Visar PokerTH mina odds under spelet?",
        "Ja. Fliken Chanser namnger din bästa hand för stunden och din chans att vinna allteftersom korten kommer, så att du kan kontrollera ditt eget resonemang vid bordet."
      ]
    ]
  },
  sw: {
    "title": "Uwezekano katika poka — auti, uwiano wa pot, mikono | PokerTH",
    "desc": "Uwezekano wa Texas Hold’em uliokokotolewa kwa usahihi: auti na nafasi yako ya kuzipata, kanuni ya 2 na 4, uwiano wa pot, na mara ngapi AA hushinda KK au QQ hushinda AK.",
    "ldHeadline": "Uwezekano katika poka: auti, uwiano wa pot na mapambano kabla ya flop",
    "ldDesc": "Uwezekano wa Texas Hold’em uliokokotolewa kwa usahihi: auti, kanuni ya 2 na 4, uwiano wa pot na mapambano kabla ya flop.",
    "h1": "Uwezekano katika poka: auti, uwiano wa pot na mapambano kabla ya flop",
    "lead": "Maamuzi mazuri katika poka hutegemea namba chache: uwezekano wa mkono wako kuimarika ni kiasi gani, unapaswa kulipa kiasi gani ili ujue, na mikono miwili inasimamaje dhidi ya mwingine kabla ya flop. Kila namba kwenye ukurasa huu imekokotolewa kwa usahihi, haikunakiliwa kutoka kwenye jedwali.",
    "calc": {
      "h2": "Kikokotoo cha uwezekano wa poka",
      "intro": "Chagua karata zako mbili na, ukipenda, karata za mezani na mkono wa mpinzani. Kikokotoo hugawa kila karata iliyosalia — kwa usahihi kila kinapoweza, vinginevyo kwa uigaji — na kuonyesha mara ngapi unashinda.",
      "you": "Mkono wako",
      "board": "Meza",
      "opp": "Mpinzani (si lazima)",
      "players": "Wapinzani",
      "pick": "Gusa karata ili kuiweka kwenye nafasi iliyoangaziwa; gusa nafasi ili kuiacha wazi.",
      "clear": "Futa",
      "win": "Ushindi",
      "tie": "Sare",
      "lose": "Kushindwa",
      "exact": "Sahihi: migawo yote {n} inayowezekana.",
      "sim": "Uigaji wa migawo {n} ya nasibu.",
      "working": "Inakokotoa…",
      "need": "Chagua karata zako mbili ili uone uwezekano wako.",
      "boardHint": "Meza huchukua karata tatu (flop), kisha nne, kisha tano.",
      "oppHint": "Chagua karata zote mbili za mpinzani wako, au usichague yoyote.",
      "final": "Mkono wako wa mwisho",
      "noscript": "Kikokotoo kinahitaji JavaScript. Majedwali yaliyo hapa chini hufanya kazi bila hiyo."
    },
    "outsH2": "Auti: nafasi yako ya kupata karata",
    "outsP": "Auti ni karata ambayo bado iko kwenye deki na inaugeuza mkono wako kuwa mshindi anayetarajiwa. Kwenye flop, karata 47 hazijaonekana: ukiwa na auti 9, karata moja hukuingia kwenye turn katika {f9turn} ya mara, na hadi river — karata mbili zikiwa bado zinakuja — katika {f9river}.",
    "outsCols": [
      "Msubiri",
      "Auti",
      "Turn",
      "River (kutoka turn)",
      "Turn au river (kutoka flop)"
    ],
    "draws": {
      "gutshot": "Msubiri wa straight wa ndani (gutshot)",
      "twoPairFull": "Two Pair → Full House",
      "pairTrips": "One Pair → Two Pair au Three of a Kind",
      "twoOver": "Overcard mbili → One Pair",
      "setFull": "Set → Full House au Four of a Kind",
      "oesd": "Msubiri wa straight ulio wazi pande zote mbili",
      "flush": "Msubiri wa flush",
      "flushGut": "Msubiri wa flush na gutshot",
      "flushOesd": "Msubiri wa flush na msubiri wa straight ulio wazi pande zote mbili"
    },
    "outsNote": "Hizi ni nafasi za kupata mojawapo ya auti zako. Hazihesabu nyongeza za runner-runner, na auti inayompa pia mpinzani mkono bora si auti kwa kweli.",
    "ruleH2": "Kanuni ya 2 na 4",
    "ruleP": "Makadirio ya haraka mezani: zidisha auti zako kwa 4 kwenye flop utakapoona turn na river zote mbili, na kwa 2 ikiwa imebaki karata moja tu. Msubiri wa flush kwenye flop ni 9 × 4 = 36%, ukilinganisha na {f9river} kwa usahihi. Kanuni hii hukadiria kupita kiasi misubiri mikubwa: auti 15 hutoa 60%, ilhali takwimu halisi ni {f15river}.",
    "potH2": "Uwiano wa pot: je, ufanye Call?",
    "potP": "Uwiano wa pot hulinganisha kile unachopaswa kulipa na kile unachoweza kushinda. Pot ina 100 na mpinzani wako anaweka dau la 50: unalipa 50 ili kushinda pot ya 200, kwa hivyo Call hiyo inahitaji kushinda zaidi ya 50 ÷ 200 = 25% ya mara ili ilipe. Ukiwa na msubiri wa flush na karata moja ikiwa bado inakuja, unapata katika {f9one} ya mara, kwa hivyo kufanya Call kwenye dau wakati imebaki river tu hukupotezea chipu kwa muda mrefu. All-In kwenye flop, karata zote mbili zikiwa bado zinakuja, msubiri huohuo hukamilika katika {f9river}, na Call inafaa.",
    "matchH2": "Mapambano kabla ya flop",
    "matchP": "Jinsi mikono miwili ya kuanzia inavyofanya dhidi ya mwingine karata zote tano za mezani zikigawiwa, imehesabiwa juu ya kila meza kati ya meza {boards} zinazowezekana. Rangi zina athari ndogo: mikono iliyo hapa chini haishiriki rangi yoyote isipokuwa ikionyeshwa kuwa ya rangi moja.",
    "matchCols": [
      "Mkono",
      "Dhidi ya",
      "Hushinda",
      "Sare",
      "Hushindwa"
    ],
    "startH2": "Uwezekano wa mikono ya kuanzia",
    "startP": "Kuna mikono {combos} tofauti ya kuanzia ya karata mbili. Ni mara ngapi unapewa:",
    "startCols": [
      "Mkono",
      "Nafasi",
      "Takriban mkono mmoja kati ya"
    ],
    "starting": {
      "specificPair": "Jozi fulani mkononi, kama ace mbili",
      "anyPair": "Jozi yoyote mkononi",
      "specificNonPair": "Mkono fulani usio jozi, kama ace-king",
      "specificSuited": "Mkono fulani wa rangi moja, kama ace-king za rangi moja",
      "anySuited": "Karata zozote mbili za rangi moja",
      "twoBroadway": "Karata mbili za kumi au zaidi"
    },
    "faqH2": "Maswali",
    "faq": [
      [
        "Auti ni nini katika poka?",
        "Karata zilizosalia kwenye deki ambazo zingekupa mkono bora. Hesabu tu karata ambazo hujaziona: 47 kwenye flop, 46 kwenye turn."
      ],
      [
        "Ni mara ngapi jozi ya ace hushinda jozi ya king?",
        "Takriban mara nne kati ya tano: {aakk} karata zote tano za mezani zikigawiwa, huku king zikishinda {kkaa}."
      ],
      [
        "Je, ace-king dhidi ya jozi ni kama kurusha sarafu?",
        "Karibu hivyo, dhidi ya jozi ya kati: queen hushinda {qqak} dhidi ya ace-king. Dhidi ya jozi ndogo ni karibu zaidi — jozi ya mbili hushinda {22ak}."
      ],
      [
        "Uwiano wa pot ni nini?",
        "Bei ya Call ikilinganishwa na pot unayoweza kushinda. Ikiwa nafasi yako ya kushinda ni kubwa kuliko sehemu ya pot ya mwisho unayoiweka wewe, kufanya Call hulipa kwa muda."
      ],
      [
        "Je, PokerTH huonyesha uwezekano wangu wakati wa mchezo?",
        "Ndiyo. Kichupo cha Uwezekano kinataja mkono wako bora wa sasa na nafasi yako ya kushinda karata zinapotoka, ili uweze kukagua hoja zako mwenyewe ukiwa mezani."
      ]
    ]
  },
  ta: {
    "title": "போக்கர் வாய்ப்புகள் — அவுட்கள், பானை விகிதம், கை மோதல் | PokerTH",
    "desc": "துல்லியமாகக் கணக்கிட்ட Texas Hold’em வாய்ப்புகள்: அவுட்களும் அவை வரும் வாய்ப்பும், 2 மற்றும் 4 விதி, பானை விகிதம், AA எத்தனை முறை KK-ஐ, QQ எத்தனை முறை AK-ஐ வெல்கிறது.",
    "ldHeadline": "போக்கர் வாய்ப்புகள்: அவுட்கள், பானை விகிதம், ஃப்ளாப்புக்கு முந்தைய மோதல்கள்",
    "ldDesc": "துல்லியமாகக் கணக்கிடப்பட்ட Texas Hold’em வாய்ப்புகள்: அவுட்கள், 2 மற்றும் 4 விதி, பானை விகிதம், ஃப்ளாப்புக்கு முந்தைய மோதல்கள்.",
    "h1": "போக்கர் வாய்ப்புகள்: அவுட்கள், பானை விகிதம், ஃப்ளாப்புக்கு முந்தைய மோதல்கள்",
    "lead": "நல்ல போக்கர் முடிவுகள் சில எண்களைச் சார்ந்தவை: உங்கள் கை மேம்பட எவ்வளவு வாய்ப்பு, அதை அறிய நீங்கள் எவ்வளவு செலுத்த வேண்டும், ஃப்ளாப்புக்கு முன் இரு கைகள் ஒன்றுக்கொன்று எதிராக எப்படி நிற்கின்றன. இந்தப் பக்கத்தின் ஒவ்வொரு எண்ணும் ஓர் அட்டவணையிலிருந்து நகலெடுக்கப்படாமல், துல்லியமாகக் கணக்கிடப்பட்டது.",
    "calc": {
      "h2": "போக்கர் வாய்ப்புக் கணிப்பான்",
      "intro": "உங்கள் இரு சீட்டுகளையும், விரும்பினால் மேசைச் சீட்டுகளையும் ஓர் எதிரியின் கையையும் தேர்ந்தெடுங்கள். கணிப்பான் மீதமுள்ள எல்லாச் சீட்டுகளையும் வழங்குகிறது — இயன்றபோதெல்லாம் துல்லியமாக, இல்லையெனில் பாவனை மூலம் — நீங்கள் எத்தனை முறை வெல்கிறீர்கள் என்பதைக் காட்டுகிறது.",
      "you": "உங்கள் கை",
      "board": "மேசை",
      "opp": "எதிரி (விருப்பத்தேர்வு)",
      "players": "எதிரிகள்",
      "pick": "ஒரு சீட்டைத் தட்டி ஒளிரும் இடத்தில் வையுங்கள்; ஓர் இடத்தைத் தட்டி அதைக் காலியாக்குங்கள்.",
      "clear": "அழி",
      "win": "வெற்றி",
      "tie": "சமநிலை",
      "lose": "தோல்வி",
      "exact": "துல்லியம்: சாத்தியமான {n} வழங்கல்கள் அனைத்தும்.",
      "sim": "{n} சீரற்ற வழங்கல்களின் பாவனை.",
      "working": "கணக்கிடுகிறது…",
      "need": "உங்கள் வாய்ப்புகளைக் காண இரு சீட்டுகளைத் தேர்ந்தெடுங்கள்.",
      "boardHint": "மேசையில் முதலில் மூன்று சீட்டுகள் (ஃப்ளாப்), பிறகு நான்கு, பிறகு ஐந்து.",
      "oppHint": "எதிரியின் இரு சீட்டுகளையும் தேர்ந்தெடுங்கள், அல்லது எதையும் வேண்டாம்.",
      "final": "உங்கள் இறுதிக் கை",
      "noscript": "கணிப்பானுக்கு JavaScript தேவை. கீழுள்ள அட்டவணைகள் அது இல்லாமலும் வேலை செய்யும்."
    },
    "outsH2": "அவுட்கள்: உங்களுக்கு வரும் வாய்ப்பு",
    "outsP": "அவுட் என்பது கட்டில் இன்னும் இருக்கும், உங்கள் கையை வெல்லக்கூடிய கையாக மாற்றும் சீட்டு. ஃப்ளாப்பில் 47 சீட்டுகள் பார்க்கப்படாதவை: 9 அவுட்களுடன், டர்னில் ஒரு சீட்டு {f9turn} முறை வரும்; ரிவர் வரை — இன்னும் இரு சீட்டுகள் வர இருக்கையில் — {f9river}.",
    "outsCols": [
      "காத்திருப்பு",
      "அவுட்கள்",
      "டர்ன்",
      "ரிவர் (டர்னிலிருந்து)",
      "டர்ன் அல்லது ரிவர் (ஃப்ளாப்பிலிருந்து)"
    ],
    "draws": {
      "gutshot": "உள் வரிசைக் காத்திருப்பு (கட்ஷாட்)",
      "twoPairFull": "இரட்டை ஜோடியிலிருந்து முழு வீடு",
      "pairTrips": "ஜோடியிலிருந்து இரட்டை ஜோடி அல்லது மும்மை",
      "twoOver": "ஜோடிக்கு இரு உயர் சீட்டுகள்",
      "setFull": "மறைந்த மும்மையிலிருந்து முழு வீடு அல்லது நான்மை",
      "oesd": "இருமுனை வரிசைக் காத்திருப்பு",
      "flush": "ஒரே நிறக் காத்திருப்பு",
      "flushGut": "ஒரே நிறக் காத்திருப்பும் கட்ஷாட்டும்",
      "flushOesd": "ஒரே நிறக் காத்திருப்பும் இருமுனை வரிசைக் காத்திருப்பும்"
    },
    "outsNote": "இவை உங்கள் அவுட்களில் ஒன்றைப் பெறும் வாய்ப்புகள். ரன்னர்-ரன்னர் (பின்கதவு) கூடுதல்கள் சேர்க்கப்படவில்லை; எதிரிக்கும் சிறந்த கையைத் தரும் அவுட் உண்மையில் அவுட் அல்ல.",
    "ruleH2": "2 மற்றும் 4 விதி",
    "ruleP": "மேசையில் விரைவான மதிப்பீடு: டர்ன், ரிவர் இரண்டையும் பார்க்கப் போகும்போது ஃப்ளாப்பில் உங்கள் அவுட்களை 4 ஆல் பெருக்குங்கள்; ஒரே ஒரு சீட்டு மட்டும் வர இருக்கும்போது 2 ஆல். ஃப்ளாப்பில் ஒரே நிறக் காத்திருப்பு 9 × 4 = 36%; துல்லியக் கணக்கில் {f9river}. இந்த விதி பெரிய காத்திருப்புகளை மிகைப்படுத்துகிறது: 15 அவுட்கள் 60% தரும்; உண்மையான எண் {f15river}.",
    "potH2": "பானை விகிதம்: சமன் செய்யலாமா?",
    "potP": "நீங்கள் செலுத்த வேண்டியதை நீங்கள் வெல்லக்கூடியதுடன் பானை விகிதம் ஒப்பிடுகிறது. பானையில் 100 உள்ளது, எதிரி 50 பணயம் வைக்கிறார்: 200 பானையை வெல்ல நீங்கள் 50 சமன் செய்கிறீர்கள்; எனவே லாபம் தர, இந்தச் சமன் 50 ÷ 200 = 25% முறைக்கும் அதிகமாக வெல்ல வேண்டும். ஒரே நிறக் காத்திருப்புடன் ஒரு சீட்டு மட்டும் வர இருக்கையில் நீங்கள் {f9one} முறை பெறுகிறீர்கள்; எனவே ரிவர் மட்டும் மீதமிருக்கும்போது ஒரு பணயத்தைச் சமன் செய்வது நீண்ட காலத்தில் காசுகளை இழக்கச் செய்யும். ஃப்ளாப்பில் அனைத்தையும் பணயம் வைத்து, இரு சீட்டுகளும் வர இருக்கையில், அதே காத்திருப்பு {f9river} முறை நிறைவடைகிறது; அப்போது சமன் செய்வது தகும்.",
    "matchH2": "ஃப்ளாப்புக்கு முந்தைய மோதல்கள்",
    "matchP": "ஐந்து மேசைச் சீட்டுகளும் வழங்கப்படும்போது இரு தொடக்கக் கைகள் ஒன்றுக்கொன்று எதிராக எப்படிச் செயல்படுகின்றன — சாத்தியமான {boards} மேசைகள் ஒவ்வொன்றின் மீதும் கணக்கிடப்பட்டது. நிறங்கள் சற்று முக்கியம்: ஒரே நிறம் எனக் காட்டப்படாவிட்டால், கீழுள்ள கைகள் எந்த நிறத்தையும் பகிர்வதில்லை.",
    "matchCols": [
      "கை",
      "எதிராக",
      "வெற்றி",
      "சமநிலை",
      "தோல்வி"
    ],
    "startH2": "தொடக்கக் கைகளின் வாய்ப்புகள்",
    "startP": "இரு சீட்டுகளால் ஆன {combos} வெவ்வேறு தொடக்கக் கைகள் உள்ளன. உங்களுக்கு எத்தனை முறை கிடைக்கும்:",
    "startCols": [
      "கை",
      "வாய்ப்பு",
      "ஏறத்தாழ இத்தனை கைகளில் ஒன்று"
    ],
    "starting": {
      "specificPair": "குறிப்பிட்ட ஒரு கையில் ஜோடி, எ.கா. ஏஸ்கள்",
      "anyPair": "ஏதேனும் ஒரு கையில் ஜோடி",
      "specificNonPair": "குறிப்பிட்ட ஜோடியற்ற கை, எ.கா. ஏஸ்-கிங்",
      "specificSuited": "குறிப்பிட்ட ஒரே நிறக் கை, எ.கா. ஒரே நிற ஏஸ்-கிங்",
      "anySuited": "ஒரே நிறத்தின் ஏதேனும் இரு சீட்டுகள்",
      "twoBroadway": "பத்து அல்லது அதற்கு மேலான இரு சீட்டுகள்"
    },
    "faqH2": "கேள்விகள்",
    "faq": [
      [
        "போக்கரில் அவுட்கள் என்றால் என்ன?",
        "கட்டில் எஞ்சியிருந்து உங்களுக்குச் சிறந்த கையைத் தரும் சீட்டுகள். நீங்கள் பார்க்காத சீட்டுகளை மட்டும் எண்ணுங்கள்: ஃப்ளாப்பில் 47, டர்னில் 46."
      ],
      [
        "கையில் ஏஸ் ஜோடி எத்தனை முறை கிங் ஜோடியை வெல்லும்?",
        "ஏறத்தாழ ஐந்தில் நான்கு முறை: ஐந்து மேசைச் சீட்டுகளும் வழங்கப்படும்போது {aakk}; கிங்குகள் {kkaa} வெல்லும்."
      ],
      [
        "ஜோடிக்கு எதிராக ஏஸ்-கிங் என்பது பூவா தலையா?",
        "ஏறக்குறைய, நடுத்தர ஜோடிக்கு எதிராக: ஏஸ்-கிங்குக்கு எதிராக குயின்கள் {qqak} வெல்லும். சிறிய ஜோடிக்கு எதிராக இன்னும் நெருக்கம் — இரண்டுகள் {22ak} வெல்லும்."
      ],
      [
        "பானை விகிதம் என்றால் என்ன?",
        "நீங்கள் வெல்லக்கூடிய பானையுடன் ஒப்பிடுகையில் சமன் செய்வதற்கான விலை. இறுதிப் பானையில் நீங்கள் இடும் பங்கை விட உங்கள் வெற்றி வாய்ப்பு அதிகமெனில், சமன் செய்வது காலப்போக்கில் லாபம் தரும்."
      ],
      [
        "விளையாட்டின்போது PokerTH என் வாய்ப்புகளைக் காட்டுமா?",
        "ஆம். சீட்டுகள் வெளிவரும்போது வாய்ப்புகள் தாவல் உங்கள் தற்போதைய சிறந்த கையையும் வெற்றி வாய்ப்பையும் காட்டுகிறது; எனவே மேசையிலேயே உங்கள் சொந்தக் கணிப்பைச் சரிபார்க்கலாம்."
      ]
    ]
  },
  te: {
    "title": "పోకర్ ఆడ్స్ — అవుట్స్, పాట్ ఆడ్స్, హ్యాండ్ పోటీలు | PokerTH",
    "desc": "కచ్చితంగా లెక్కించిన Texas Hold’em ఆడ్స్: అవుట్స్, వాటిని పొందే మీ అవకాశం, 2 మరియు 4 నియమం, పాట్ ఆడ్స్, AA ఎంత తరచుగా KK ని, QQ ఎంత తరచుగా AK ని ఓడిస్తాయి.",
    "ldHeadline": "పోకర్ ఆడ్స్: అవుట్స్, పాట్ ఆడ్స్ మరియు ప్రీ-ఫ్లాప్ పోటీలు",
    "ldDesc": "కచ్చితంగా లెక్కించిన Texas Hold’em ఆడ్స్: అవుట్స్, 2 మరియు 4 నియమం, పాట్ ఆడ్స్ మరియు ప్రీ-ఫ్లాప్ పోటీలు.",
    "h1": "పోకర్ ఆడ్స్: అవుట్స్, పాట్ ఆడ్స్ మరియు ప్రీ-ఫ్లాప్ పోటీలు",
    "lead": "మంచి పోకర్ నిర్ణయాలు కొన్ని సంఖ్యలపైనే ఆధారపడతాయి: మీ హ్యాండ్ మెరుగుపడే అవకాశం ఎంత, అది తెలుసుకోవడానికి మీరు ఎంత చెల్లించాలి, ఫ్లాప్‌కు ముందు రెండు హ్యాండ్‌లు ఒకదానికొకటి ఎదురుగా ఎలా నిలుస్తాయి. ఈ పేజీలోని ప్రతి సంఖ్య కచ్చితంగా లెక్కించబడింది, ఏ చార్ట్ నుండీ కాపీ చేసినది కాదు.",
    "calc": {
      "h2": "పోకర్ ఆడ్స్ కాలిక్యులేటర్",
      "intro": "మీ రెండు కార్డులను ఎంచుకోండి, కావాలంటే బోర్డును, ప్రత్యర్థి హ్యాండ్‌ను కూడా ఎంచుకోండి. కాలిక్యులేటర్ మిగిలిన ప్రతి కార్డునూ పంచి చూస్తుంది — వీలైనప్పుడల్లా కచ్చితంగా, లేకపోతే సిమ్యులేషన్ ద్వారా — మీరు ఎంత తరచుగా గెలుస్తారో చూపిస్తుంది.",
      "you": "మీ హ్యాండ్",
      "board": "బోర్డు",
      "opp": "ప్రత్యర్థి (ఐచ్ఛికం)",
      "players": "ప్రత్యర్థులు",
      "pick": "హైలైట్ చేసిన స్లాట్‌లో ఉంచడానికి కార్డును ట్యాప్ చేయండి; స్లాట్‌ను ఖాళీ చేయడానికి దాన్ని ట్యాప్ చేయండి.",
      "clear": "క్లియర్ చేయి",
      "win": "గెలుపు",
      "tie": "టై",
      "lose": "ఓటమి",
      "exact": "కచ్చితం: సాధ్యమయ్యే మొత్తం {n} పంపకాలు.",
      "sim": "{n} యాదృచ్ఛిక పంపకాల సిమ్యులేషన్.",
      "working": "లెక్కిస్తోంది…",
      "need": "మీ ఆడ్స్ చూడటానికి మీ రెండు కార్డులను ఎంచుకోండి.",
      "boardHint": "బోర్డుపై మొదట మూడు కార్డులు (ఫ్లాప్), తర్వాత నాలుగు, తర్వాత ఐదు.",
      "oppHint": "ప్రత్యర్థి రెండు కార్డులనూ ఎంచుకోండి, లేదా ఒక్కటీ వద్దు.",
      "final": "మీ చివరి హ్యాండ్",
      "noscript": "కాలిక్యులేటర్‌కు JavaScript అవసరం. కింది పట్టికలు అది లేకుండానూ పనిచేస్తాయి."
    },
    "outsH2": "అవుట్స్: మీకు కార్డు పడే అవకాశం",
    "outsP": "అవుట్ అంటే డెక్‌లో ఇంకా ఉండి, మీ హ్యాండ్‌ను గెలిచే అవకాశం ఉన్న హ్యాండ్‌గా మార్చే కార్డు. ఫ్లాప్‌లో 47 కార్డులు కనిపించవు: 9 అవుట్స్‌తో, టర్న్‌లో ఒక కార్డు పడే అవకాశం {f9turn}, రివర్ వరకు — ఇంకా రెండు కార్డులు రావాల్సి ఉండగా — {f9river}.",
    "outsCols": [
      "డ్రా",
      "అవుట్స్",
      "టర్న్",
      "రివర్ (టర్న్ నుండి)",
      "టర్న్ లేదా రివర్ (ఫ్లాప్ నుండి)"
    ],
    "draws": {
      "gutshot": "ఇన్‌సైడ్ Straight డ్రా (గట్‌షాట్)",
      "twoPairFull": "Two Pair నుండి Full House",
      "pairTrips": "One Pair నుండి Two Pair లేదా Three of a Kind",
      "twoOver": "రెండు ఓవర్‌కార్డుల నుండి జత",
      "setFull": "సెట్ నుండి Full House లేదా Four of a Kind",
      "oesd": "ఓపెన్-ఎండెడ్ Straight డ్రా",
      "flush": "Flush డ్రా",
      "flushGut": "Flush డ్రా మరియు గట్‌షాట్",
      "flushOesd": "Flush డ్రా మరియు ఓపెన్-ఎండెడ్ Straight డ్రా"
    },
    "outsNote": "ఇవి మీ అవుట్స్‌లో ఒకటి పడే అవకాశాలు. ఇందులో రన్నర్-రన్నర్ అదనపు అవకాశాలు లేవు, మరియు ప్రత్యర్థికి కూడా మెరుగైన హ్యాండ్ ఇచ్చే అవుట్ నిజానికి అవుట్ కాదు.",
    "ruleH2": "2 మరియు 4 నియమం",
    "ruleP": "టేబుల్ వద్ద వేగవంతమైన అంచనా: టర్న్, రివర్ రెండూ చూడబోతున్నప్పుడు ఫ్లాప్‌లో మీ అవుట్స్‌ను 4 తో గుణించండి, ఇంకా ఒకే కార్డు రావాల్సి ఉంటే 2 తో గుణించండి. ఫ్లాప్‌లో Flush డ్రా అంటే 9 × 4 = 36%, కచ్చితమైన విలువ {f9river}. ఈ నియమం పెద్ద డ్రాలను ఎక్కువగా అంచనా వేస్తుంది: 15 అవుట్స్ 60% ఇస్తాయి, అసలు సంఖ్య {f15river}.",
    "potH2": "పాట్ ఆడ్స్: మీరు Call చేయాలా?",
    "potP": "పాట్ ఆడ్స్ మీరు చెల్లించాల్సిన దాన్ని మీరు గెలవగల దానితో పోలుస్తాయి. పాట్‌లో 100 ఉంది, మీ ప్రత్యర్థి 50 బెట్ చేస్తారు: 200 పాట్‌ను గెలవడానికి మీరు 50 కాల్ చేస్తారు, కాబట్టి లాభం రావాలంటే ఆ కాల్ 50 ÷ 200 = 25% కంటే ఎక్కువ సార్లు గెలవాలి. Flush డ్రాతో ఇంకా ఒక కార్డు రావాల్సి ఉంటే మీకు కార్డు పడే అవకాశం {f9one}, కాబట్టి రివర్ మాత్రమే మిగిలి ఉన్నప్పుడు బెట్‌కు కాల్ చేస్తే దీర్ఘకాలంలో చిప్స్ పోతాయి. ఫ్లాప్‌లో All-In అయినప్పుడు, రెండు కార్డులూ రావాల్సి ఉండగా, అదే డ్రా పడే అవకాశం {f9river}, కాబట్టి కాల్ చేయడం విలువైనది.",
    "matchH2": "ప్రీ-ఫ్లాప్ పోటీలు",
    "matchP": "బోర్డుపై ఐదు కార్డులూ పంచినప్పుడు రెండు ప్రారంభ హ్యాండ్‌లు ఒకదానిపై ఒకటి ఎలా నిలుస్తాయో, సాధ్యమయ్యే మొత్తం {boards} బోర్డులపై లెక్కించినది. సూట్‌లకు కొంచెం ప్రాధాన్యం ఉంటుంది: సూటెడ్ అని చూపిస్తే తప్ప, కింది హ్యాండ్‌లకు ఉమ్మడి సూట్ లేదు.",
    "matchCols": [
      "హ్యాండ్",
      "ఎదురుగా",
      "గెలుపు",
      "టై",
      "ఓటమి"
    ],
    "startH2": "ప్రారంభ హ్యాండ్‌ల ఆడ్స్",
    "startP": "రెండు కార్డుల ప్రారంభ హ్యాండ్‌లు {combos} రకాలు ఉన్నాయి. అవి మీకు ఎంత తరచుగా వస్తాయి:",
    "startCols": [
      "హ్యాండ్",
      "అవకాశం",
      "సుమారు ఇన్ని హ్యాండ్‌లకు ఒకసారి"
    ],
    "starting": {
      "specificPair": "ఒక నిర్దిష్ట పాకెట్ జత, ఉదా. ఏస్‌లు",
      "anyPair": "ఏదైనా పాకెట్ జత",
      "specificNonPair": "జత లేని ఒక నిర్దిష్ట హ్యాండ్, ఉదా. ఏస్-కింగ్",
      "specificSuited": "ఒక నిర్దిష్ట సూటెడ్ హ్యాండ్, ఉదా. ఏస్-కింగ్ సూటెడ్",
      "anySuited": "ఒకే సూట్ గల ఏవైనా రెండు కార్డులు",
      "twoBroadway": "పది లేదా అంతకంటే ఎక్కువ విలువ గల రెండు కార్డులు"
    },
    "faqH2": "ప్రశ్నలు",
    "faq": [
      [
        "పోకర్‌లో అవుట్స్ అంటే ఏమిటి?",
        "డెక్‌లో మిగిలి ఉండి మీకు ఉత్తమ హ్యాండ్‌ను ఇచ్చే కార్డులు. మీరు చూడని కార్డులను మాత్రమే లెక్కించండి: ఫ్లాప్‌లో 47, టర్న్‌లో 46."
      ],
      [
        "పాకెట్ ఏస్‌లు కింగ్‌లను ఎంత తరచుగా ఓడిస్తాయి?",
        "సుమారు ఐదుసార్లలో నాలుగుసార్లు: బోర్డుపై ఐదు కార్డులూ పంచినప్పుడు {aakk}, కింగ్‌లు గెలిచేది {kkaa}."
      ],
      [
        "జతకు ఎదురుగా ఏస్-కింగ్ అంటే కాయిన్ ఫ్లిప్ లాంటిదేనా?",
        "దాదాపుగా, మధ్యస్థ జతకు ఎదురుగా: క్వీన్‌లు ఏస్-కింగ్‌పై {qqak} గెలుస్తాయి. చిన్న జతకు ఎదురుగా ఇంకా దగ్గరగా ఉంటుంది — రెండుల జత {22ak} గెలుస్తుంది."
      ],
      [
        "పాట్ ఆడ్స్ అంటే ఏమిటి?",
        "మీరు గెలవగల పాట్‌తో పోలిస్తే ఒక కాల్ ధర. చివరి పాట్‌లో మీరు పెట్టే వాటా కంటే మీ గెలుపు అవకాశం ఎక్కువైతే, కాలక్రమంలో కాల్ చేయడం లాభిస్తుంది."
      ],
      [
        "ఆట జరుగుతున్నప్పుడు PokerTH నా ఆడ్స్ చూపిస్తుందా?",
        "అవును. ఆడ్స్ ట్యాబ్ కార్డులు వచ్చే కొద్దీ మీ ప్రస్తుత అత్యుత్తమ హ్యాండ్ పేరును మరియు గెలిచే అవకాశాన్ని చూపుతుంది, కాబట్టి టేబుల్ వద్దే మీ ఆలోచనను సరిచూసుకోవచ్చు."
      ]
    ]
  },
  tg: {
    "title": "Эҳтимолиятҳои покер — аутҳо, эҳтимолияти банк, дастҳо | PokerTH",
    "desc": "Эҳтимолиятҳои Texas Hold’em, дақиқ ҳисобшуда: аутҳо ва имкони омадани онҳо, қоидаи 2 ва 4, эҳтимолияти банк ва AA чанд бор KK-ро ё QQ AK-ро мебарад.",
    "ldHeadline": "Эҳтимолиятҳои покер: аутҳо, эҳтимолияти банк ва муқобилаҳои префлоп",
    "ldDesc": "Эҳтимолиятҳои Texas Hold’em, дақиқ ҳисобшуда: аутҳо, қоидаи 2 ва 4, эҳтимолияти банк ва муқобилаҳои префлоп.",
    "h1": "Эҳтимолиятҳои покер: аутҳо, эҳтимолияти банк ва муқобилаҳои префлоп",
    "lead": "Қарорҳои хуб дар покер ба чанд рақам вобастаанд: дасти шумо бо кадом эҳтимол беҳтар мешавад, барои фаҳмидани он чӣ қадар бояд пардохт кунед ва ду даст пеш аз флоп нисбат ба ҳамдигар дар чӣ ҳоланд. Ҳар рақами ин саҳифа дақиқ ҳисоб карда шудааст, на аз ягон ҷадвал нусхабардорӣ.",
    "calc": {
      "h2": "Ҳисобкунаки эҳтимолиятҳои покер",
      "intro": "Ду корти худро интихоб кунед ва, агар хоҳед, борд ва дасти рақибро низ. Ҳисобкунак ҳамаи кортҳои боқимондаро тақсим мекунад — ҳар ҷо имкон бошад дақиқ, вагарна бо симулятсия — ва нишон медиҳад, ки шумо чанд бор мебаред.",
      "you": "Дасти шумо",
      "board": "Борд",
      "opp": "Рақиб (ихтиёрӣ)",
      "players": "Рақибон",
      "pick": "Ба корт ламс кунед, то онро ба ҷойи ҷудокардашуда гузоред; ба ҷой ламс кунед, то онро холӣ кунед.",
      "clear": "Тоза кардан",
      "win": "Бурд",
      "tie": "Баробар",
      "lose": "Бохт",
      "exact": "Дақиқ: ҳамаи {n} тақсимоти имконпазир.",
      "sim": "Симулятсияи {n} тақсимоти тасодуфӣ.",
      "working": "Ҳисоб карда мешавад…",
      "need": "Барои дидани эҳтимолиятҳоятон ду корти худро интихоб кунед.",
      "boardHint": "Ба борд аввал се корт (флоп), баъд чор, баъд панҷ корт гузошта мешавад.",
      "oppHint": "Ҳарду корти рақибро интихоб кунед ё ҳеҷ кадомашро.",
      "final": "Дасти ниҳоии шумо",
      "noscript": "Ҳисобкунак JavaScript-ро талаб мекунад. Ҷадвалҳои зер бе он ҳам кор мекунанд."
    },
    "outsH2": "Аутҳо: имкони омадани корт",
    "outsP": "Аут кортест, ки ҳоло дар даста аст ва дасти шуморо ғолиби эҳтимолӣ мегардонад. Дар флоп 47 корт нодида аст: бо 9 аут, дар тёрн дар {f9turn} ҳолатҳо корти лозимӣ меояд ва то ривер — вақте ду корт дар пеш аст — дар {f9river}.",
    "outsCols": [
      "Дро",
      "Аутҳо",
      "Тёрн",
      "Ривер (аз тёрн)",
      "Тёрн ё ривер (аз флоп)"
    ],
    "draws": {
      "gutshot": "Стрит-дрои дохилӣ (гатшот)",
      "twoPairFull": "Ду ҷуфт ба фулл-хаус",
      "pairTrips": "Ҷуфт ба ду ҷуфт ё сеягӣ",
      "twoOver": "Ду корти болотар (оверкарт) ба ҷуфт",
      "setFull": "Сет ба фулл-хаус ё каре",
      "oesd": "Стрит-дрои кушода",
      "flush": "Флеш-дро",
      "flushGut": "Флеш-дро ва гатшот",
      "flushOesd": "Флеш-дро ва стрит-дрои кушода"
    },
    "outsNote": "Инҳо имконҳои гирифтани яке аз аутҳои шумоянд. Имконҳои иловагии runner-runner ба ҳисоб гирифта нашудаанд ва ауте, ки ба рақиб низ дасти беҳтар медиҳад, дар асл аут нест.",
    "ruleH2": "Қоидаи 2 ва 4",
    "ruleP": "Баҳодиҳии зуд дар сари миз: дар флоп, вақте ки ҳам тёрн ва ҳам риверро мебинед, аутҳоро ба 4 зарб занед ва вақте ки танҳо як корт дар пеш аст — ба 2. Флеш-дро дар флоп 9 × 4 = 36% медиҳад, дар ҳоле ки рақами дақиқ {f9river} аст. Қоида дроҳои калонро аз ҳад зиёд баҳо медиҳад: 15 аут 60% медиҳад, рақами воқеӣ {f15river} аст.",
    "potH2": "Эҳтимолияти банк: Call кунед ё не?",
    "potP": "Эҳтимолияти банк он чиро, ки бояд пардохт кунед, бо он чи ки бурда метавонед, муқоиса мекунад. Дар банк 100 аст ва рақиб 50 мегузорад: шумо 50 Call мекунед, то банки 200-ро баред, пас Call барои фоида овардан бояд дар зиёда аз 50 ÷ 200 = 25% ҳолатҳо бурд кунад. Бо флеш-дро ва як корти боқимонда корти лозимӣ дар {f9one} ҳолатҳо меояд, бинобар ин Call кардани гаров вақте ки танҳо ривер мондааст, дар дарозмуддат чипҳоро аз даст медиҳад. All-In дар флоп, вақте ки ҳарду корт дар пеш аст, ҳамон дро дар {f9river} ҳолатҳо мегирад ва Call арзанда аст.",
    "matchH2": "Муқобилаҳои префлоп",
    "matchP": "Ду дасти ибтидоӣ ба муқобили якдигар чӣ натиҷа медиҳанд, вақте ки ҳамаи панҷ корти борд тақсим мешаванд — дар ҳар яке аз {boards} борди имконпазир ҳисоб карда шудааст. Либосҳо каме аҳамият доранд: дастҳои зер либоси умумӣ надоранд, магар ки ҳамчун як либос нишон дода шуда бошанд.",
    "matchCols": [
      "Даст",
      "Бар зидди",
      "Мебарад",
      "Баробар",
      "Мебозад"
    ],
    "startH2": "Эҳтимолиятҳои дастҳои ибтидоӣ",
    "startP": "{combos} дасти ибтидоии гуногуни дукорта мавҷуд аст. Чанд бор ба шумо меафтад:",
    "startCols": [
      "Даст",
      "Эҳтимол",
      "Тақрибан як даст аз"
    ],
    "starting": {
      "specificPair": "Ҷуфти ҷайбии муайян, масалан тузҳо",
      "anyPair": "Ҳар гуна ҷуфти ҷайбӣ",
      "specificNonPair": "Дасти муайяни бе ҷуфт, масалан туз-шоҳ",
      "specificSuited": "Дасти муайяни як либос, масалан туз-шоҳи як либос",
      "anySuited": "Ҳар ду корти як либос",
      "twoBroadway": "Ду корти аз даҳ боло"
    },
    "faqH2": "Саволҳо",
    "faq": [
      [
        "Аутҳо дар покер чист?",
        "Кортҳои боқимонда дар даста, ки ба шумо беҳтарин дастро медиҳанд. Танҳо кортҳоеро ҳисоб кунед, ки надидаед: 47 дар флоп, 46 дар тёрн."
      ],
      [
        "Ҷуфти тузҳо чанд бор шоҳҳоро мебарад?",
        "Тақрибан чор бор аз панҷ: {aakk}, вақте ки ҳамаи панҷ корти борд тақсим мешаванд, шоҳҳо бошанд {kkaa} мебаранд."
      ],
      [
        "Оё туз-шоҳ бар зидди ҷуфт мисли партофтани танга аст?",
        "Қариб, бар зидди ҷуфти миёна: QQ бар зидди туз-шоҳ {qqak} мебарад. Бар зидди ҷуфти хурд боз ҳам баробартар аст — 22 {22ak} мебарад."
      ],
      [
        "Эҳтимолияти банк чист?",
        "Нархи Call дар муқоиса бо банке, ки бурда метавонед. Агар имкони бурди шумо аз ҳиссаи банки ниҳоӣ, ки шумо мегузоред, зиёдтар бошад, Call кардан бо мурури вақт худро сафед мекунад."
      ],
      [
        "Оё PokerTH ҳангоми бозӣ эҳтимолиятҳои маро нишон медиҳад?",
        "Ҳа. Панели «Имкониятҳо» беҳтарин дасти ҳозираи шумо ва имкони бурдатонро ҳангоми кушода шудани кортҳо нишон медиҳад, то шумо дар сари миз мулоҳизаи худро санҷед."
      ]
    ]
  },
  th: {
    "title": "โอกาสโป๊กเกอร์ — ไพ่ช่วย อัตราต่อรองกองกลาง การดวลมือ | PokerTH",
    "desc": "โอกาสใน Texas Hold’em ที่คำนวณอย่างแม่นยำ: ไพ่ช่วยและโอกาสที่จะได้ กฎ 2 และ 4 อัตราต่อรองกองกลาง และ AA ชนะ KK หรือ QQ ชนะ AK บ่อยแค่ไหน",
    "ldHeadline": "โอกาสในโป๊กเกอร์: ไพ่ช่วย อัตราต่อรองกองกลาง และการดวลก่อนฟลอป",
    "ldDesc": "โอกาสใน Texas Hold’em ที่คำนวณอย่างแม่นยำ: ไพ่ช่วย กฎ 2 และ 4 อัตราต่อรองกองกลาง และการดวลก่อนฟลอป",
    "h1": "โอกาสในโป๊กเกอร์: ไพ่ช่วย อัตราต่อรองกองกลาง และการดวลก่อนฟลอป",
    "lead": "การตัดสินใจที่ดีในโป๊กเกอร์ขึ้นอยู่กับตัวเลขไม่กี่ตัว: มือของคุณมีโอกาสดีขึ้นแค่ไหน คุณต้องจ่ายเท่าไรเพื่อจะรู้ และไพ่สองมือสู้กันอย่างไรก่อนฟลอป ทุกตัวเลขในหน้านี้คำนวณอย่างแม่นยำ ไม่ได้ลอกมาจากตาราง",
    "calc": {
      "h2": "เครื่องคำนวณโอกาสโป๊กเกอร์",
      "intro": "เลือกไพ่สองใบของคุณ และถ้าต้องการ ก็เลือกไพ่กองกลางและไพ่ของคู่ต่อสู้ด้วย เครื่องคำนวณจะแจกไพ่ที่เหลือทั้งหมด — แบบแม่นยำเมื่อทำได้ ไม่เช่นนั้นใช้การจำลอง — และแสดงว่าคุณชนะบ่อยแค่ไหน",
      "you": "ไพ่ของคุณ",
      "board": "ไพ่กองกลาง",
      "opp": "คู่ต่อสู้ (ไม่บังคับ)",
      "players": "คู่ต่อสู้",
      "pick": "แตะไพ่เพื่อวางลงในช่องที่ไฮไลต์ แตะช่องเพื่อล้างออก",
      "clear": "ล้าง",
      "win": "ชนะ",
      "tie": "เสมอ",
      "lose": "แพ้",
      "exact": "แม่นยำ: ครบทุกแบบจากการแจกที่เป็นไปได้ {n} แบบ",
      "sim": "จำลองการแจกแบบสุ่ม {n} ครั้ง",
      "working": "กำลังคำนวณ…",
      "need": "เลือกไพ่สองใบของคุณเพื่อดูโอกาส",
      "boardHint": "ไพ่กองกลางรับสามใบ (ฟลอป) จากนั้นสี่ใบ แล้วห้าใบ",
      "oppHint": "เลือกไพ่ของคู่ต่อสู้ทั้งสองใบ หรือไม่เลือกเลย",
      "final": "ไพ่สุดท้ายของคุณ",
      "noscript": "เครื่องคำนวณต้องใช้ JavaScript ตารางด้านล่างใช้ได้โดยไม่ต้องมี"
    },
    "outsH2": "ไพ่ช่วย: โอกาสที่คุณจะได้ไพ่",
    "outsP": "ไพ่ช่วยคือไพ่ที่ยังอยู่ในสำรับและจะทำให้มือของคุณน่าจะเป็นฝ่ายชนะ ที่ฟลอปมีไพ่ 47 ใบที่ยังไม่เห็น: ถ้ามีไพ่ช่วย 9 ใบ ไพ่ใบเดียวจะเข้าที่เทิร์น {f9turn} ของครั้ง และจนถึงริเวอร์ — เมื่อยังมีไพ่มาอีกสองใบ — {f9river}",
    "outsCols": [
      "ไพ่รอ",
      "ไพ่ช่วย",
      "เทิร์น",
      "ริเวอร์ (จากเทิร์น)",
      "เทิร์นหรือริเวอร์ (จากฟลอป)"
    ],
    "draws": {
      "gutshot": "ไพ่รอสเตรทตรงกลาง (gutshot)",
      "twoPairFull": "Two Pair รอ Full House",
      "pairTrips": "One Pair รอ Two Pair หรือ Three of a Kind",
      "twoOver": "ไพ่สูงกว่ากองกลางสองใบรอเป็นคู่",
      "setFull": "ตองซ่อน (set) รอ Full House หรือ Four of a Kind",
      "oesd": "ไพ่รอสเตรทหัวท้าย",
      "flush": "ไพ่รอฟลัช",
      "flushGut": "ไพ่รอฟลัชและสเตรทตรงกลาง",
      "flushOesd": "ไพ่รอฟลัชและสเตรทหัวท้าย"
    },
    "outsNote": "นี่คือโอกาสที่จะได้ไพ่ช่วยใบใดใบหนึ่งของคุณ ยังไม่รวมโอกาสเสริมแบบ runner-runner และไพ่ช่วยที่ทำให้คู่ต่อสู้ได้มือที่ดีกว่าด้วย ก็ไม่ใช่ไพ่ช่วยจริง ๆ",
    "ruleH2": "กฎ 2 และ 4",
    "ruleP": "การประมาณอย่างเร็วที่โต๊ะ: คูณจำนวนไพ่ช่วยด้วย 4 ที่ฟลอปเมื่อคุณจะได้เห็นทั้งเทิร์นและริเวอร์ และคูณด้วย 2 เมื่อเหลือไพ่มาอีกใบเดียว ไพ่รอฟลัชที่ฟลอปคือ 9 × 4 = 36% เทียบกับค่าที่แม่นยำ {f9river} กฎนี้ประเมินไพ่รอใหญ่ ๆ สูงเกินไป: ไพ่ช่วย 15 ใบได้ 60% แต่ตัวเลขจริงคือ {f15river}",
    "potH2": "อัตราต่อรองกองกลาง: ควรตามไหม?",
    "potP": "อัตราต่อรองกองกลางเปรียบเทียบสิ่งที่คุณต้องจ่ายกับสิ่งที่คุณอาจได้ กองกลางมี 100 และคู่ต่อสู้เดิมพัน 50: คุณตาม 50 เพื่อชิงกองกลาง 200 ดังนั้นการตามต้องชนะมากกว่า 50 ÷ 200 = 25% ของครั้งจึงจะคุ้ม เมื่อมีไพ่รอฟลัชและเหลือไพ่อีกใบเดียว คุณจะได้ไพ่ {f9one} ของครั้ง ดังนั้นการตามเดิมพันเมื่อเหลือแค่ริเวอร์จะเสียชิปในระยะยาว ถ้า All-In ที่ฟลอป โดยยังมีไพ่อีกสองใบ ไพ่รอเดียวกันจะเข้า {f9river} และการตามก็คุ้มค่า",
    "matchH2": "การดวลก่อนฟลอป",
    "matchP": "ไพ่เริ่มต้นสองมือสู้กันอย่างไรเมื่อแจกไพ่กองกลางครบทั้งห้าใบ นับจากไพ่กองกลางที่เป็นไปได้ทุกแบบ {boards} แบบ ดอกมีผลเล็กน้อย: มือด้านล่างไม่มีดอกร่วมกัน เว้นแต่จะแสดงว่าเป็นดอกเดียวกัน",
    "matchCols": [
      "มือ",
      "เจอกับ",
      "ชนะ",
      "เสมอ",
      "แพ้"
    ],
    "startH2": "โอกาสของไพ่เริ่มต้น",
    "startP": "ไพ่เริ่มต้นสองใบมีทั้งหมด {combos} แบบ คุณจะได้รับบ่อยแค่ไหน:",
    "startCols": [
      "มือ",
      "โอกาส",
      "ประมาณ 1 มือในทุก ๆ"
    ],
    "starting": {
      "specificPair": "คู่ในมือที่ระบุ เช่น คู่เอซ",
      "anyPair": "คู่ในมือใดก็ได้",
      "specificNonPair": "มือที่ไม่ใช่คู่ที่ระบุ เช่น เอซ-คิง",
      "specificSuited": "มือดอกเดียวกันที่ระบุ เช่น เอซ-คิงดอกเดียวกัน",
      "anySuited": "ไพ่สองใบดอกเดียวกันใดก็ได้",
      "twoBroadway": "ไพ่สองใบตั้งแต่สิบขึ้นไป"
    },
    "faqH2": "คำถาม",
    "faq": [
      [
        "ไพ่ช่วย (outs) ในโป๊กเกอร์คืออะไร?",
        "ไพ่ที่เหลืออยู่ในสำรับซึ่งจะทำให้คุณได้มือที่ดีที่สุด นับเฉพาะไพ่ที่คุณยังไม่เห็น: 47 ใบที่ฟลอป 46 ใบที่เทิร์น"
      ],
      [
        "คู่เอซในมือชนะคู่คิงบ่อยแค่ไหน?",
        "ประมาณสี่ในห้าครั้ง: {aakk} เมื่อแจกไพ่กองกลางครบห้าใบ ส่วนคู่คิงชนะ {kkaa}"
      ],
      [
        "เอซ-คิงเจอคู่คือการเสี่ยงหัวก้อยหรือเปล่า?",
        "เกือบใช่ ถ้าเจอคู่กลาง: คู่ควีนชนะเอซ-คิง {qqak} ถ้าเจอคู่เล็กยิ่งสูสีกว่านั้น — คู่สองชนะ {22ak}"
      ],
      [
        "อัตราต่อรองกองกลางคืออะไร?",
        "ราคาของการตามเทียบกับกองกลางที่คุณอาจได้ ถ้าโอกาสชนะของคุณสูงกว่าสัดส่วนที่คุณใส่ลงในกองกลางสุดท้าย การตามจะคุ้มในระยะยาว"
      ],
      [
        "PokerTH แสดงโอกาสของฉันระหว่างเกมไหม?",
        "แสดง แท็บโอกาสจะบอกชื่อมือที่ดีที่สุดของคุณ ณ ตอนนั้นและโอกาสชนะเมื่อไพ่ทยอยเปิด คุณจึงตรวจสอบการคิดของตัวเองได้ที่โต๊ะ"
      ]
    ]
  },
  tk: {
    "title": "Poker ähtimallyklary — autlar, bank ähtimallygy, eller | PokerTH",
    "desc": "Texas Hold’em ähtimallyklary takyk: autlar we olaryň düşmek mümkinçiligi, 2 we 4 düzgüni, bank ähtimallygy, AA-nyň KK-ny, QQ-nyň AK-ny näçe gezek ýeňýändigi.",
    "ldHeadline": "Poker ähtimallyklary: autlar, bank ähtimallygy we preflop duşuşyklary",
    "ldDesc": "Texas Hold’em ähtimallyklary takyk hasaplanan: autlar, 2 we 4 düzgüni, bank ähtimallygy we preflop duşuşyklary.",
    "h1": "Poker ähtimallyklary: autlar, bank ähtimallygy we preflop duşuşyklary",
    "lead": "Pokerdäki gowy kararlar birnäçe sana bagly: eliňiziň gowulanmak ähtimallygy näçe, muny bilmek üçin näçe tölemeli we flopdan öň iki el biri-birine garşy nähili durýar. Bu sahypadaky her san tablisadan göçürilmän, takyk hasaplanandyr.",
    "calc": {
      "h2": "Poker ähtimallyk kalkulýatory",
      "intro": "Iki kartyňyzy, isleseňiz bordy we garşydaşyň elini hem saýlaň. Kalkulýator galan ähli kartlary paýlaýar — mümkin bolanda takyk, bolmasa simulýasiýa arkaly — we näçe gezek utýandygyňyzy görkezýär.",
      "you": "Siziň eliňiz",
      "board": "Bord",
      "opp": "Garşydaş (hökman däl)",
      "players": "Garşydaşlar",
      "pick": "Kartany belgilenen öýjüge goýmak üçin oňa basyň; öýjügi boşatmak üçin oňa basyň.",
      "clear": "Arassala",
      "win": "Utuş",
      "tie": "Deňlik",
      "lose": "Utulyş",
      "exact": "Takyk: mümkin bolan {n} paýlamanyň hersi.",
      "sim": "{n} tötänleýin paýlamanyň simulýasiýasy.",
      "working": "Hasaplanýar…",
      "need": "Ähtimallyklaryňyzy görmek üçin iki kartyňyzy saýlaň.",
      "boardHint": "Borda ilki üç kart (flop), soňra dört, soňra bäş kart goýulýar.",
      "oppHint": "Garşydaşyňyzyň iki kartyny hem saýlaň ýa-da hiç birini saýlamaň.",
      "final": "Siziň soňky eliňiz",
      "noscript": "Kalkulýatora JavaScript gerek. Aşakdaky tablisalar onsuz hem işleýär."
    },
    "outsH2": "Autlar: düşmek mümkinçiligiňiz",
    "outsP": "Aut — destede henizem bar bolan we eliňizi ähtimal ýeňiji edýän kart. Flopda 47 kart görülmedik: 9 aut bilen bir kart terne {f9turn} ähtimallyk bilen düşýär, riwere çenli bolsa — ýene iki kart gelende — {f9river}.",
    "outsCols": [
      "Dro",
      "Autlar",
      "Tern",
      "Riwer (ternden)",
      "Tern ýa-da riwer (flopdan)"
    ],
    "draws": {
      "gutshot": "Içki strit drosy (gatşot)",
      "twoPairFull": "Iki jübütden full-hausa",
      "pairTrips": "Jübütden iki jübüte ýa-da üçlüge",
      "twoOver": "Iki owerkartdan jübüte",
      "setFull": "Setden full-hausa ýa-da kare",
      "oesd": "Açyk strit drosy",
      "flush": "Fleş drosy",
      "flushGut": "Fleş drosy we gatşot",
      "flushOesd": "Fleş drosy we açyk strit drosy"
    },
    "outsNote": "Bular autlaryňyzyň birini tutmagyň ähtimallyklary. Olara ranner-ranner goşmaçalary girmeýär, garşydaşa-da has gowy el berýän aut bolsa hakykatda aut däl.",
    "ruleH2": "2 we 4 düzgüni",
    "ruleP": "Stolda çalt baha: tern hem, riwer hem görjek bolsaňyz, flopda autlaryňyzy 4-e, diňe bir kart galan bolsa 2-ä köpeldiň. Flopdaky fleş drosy 9 × 4 = 36 % edýär, takyk bahasy bolsa {f9river}. Düzgün uly drolary artyk bahalandyrýar: 15 aut 60 % berýär, hakyky san bolsa {f15river}.",
    "potH2": "Bank ähtimallygy: Call etmelimi?",
    "potP": "Bank ähtimallygy tölemeli zadyňyzy utup biljek zadyňyz bilen deňeşdirýär. Bankda 100 bar, garşydaşyňyz 50 goýýar: 200-lük banky utmak üçin 50 töleýärsiňiz, şonuň üçin Call peýdaly bolmagy üçin 50 ÷ 200 = 25 %-den köp ýagdaýda utmaly. Fleş drosy bilen ýene bir kart galanda {f9one} ähtimallyk bilen düşýär, şonuň üçin diňe riwer galanda stawka Call etmek uzak möhletde çip ýitirýär. Flopda All-In bolanda, iki kart hem galanda, şol bir dro {f9river} ähtimallyk bilen düşýär we Call etmäge degýär.",
    "matchH2": "Preflop duşuşyklary",
    "matchP": "Bäş umumy kartyň hemmesi paýlananda iki başlangyç eliň biri-birine garşy nähili netije berýändigi, mümkin bolan {boards} bordyň hersinde sanalan. Mastlar azajyk täsir edýär: aşakdaky eller bir mastly diýlip görkezilmedik bolsa, umumy masty ýok.",
    "matchCols": [
      "El",
      "Garşy",
      "Utýar",
      "Deňlik",
      "Utulýar"
    ],
    "startH2": "Başlangyç elleriň ähtimallyklary",
    "startP": "{combos} dürli iki kartly başlangyç el bar. Size näçe gezek düşýär:",
    "startCols": [
      "El",
      "Ähtimallyk",
      "Takmynan şunça eliň biri"
    ],
    "starting": {
      "specificPair": "Belli bir jübi jübüti, mysal üçin tuzlar",
      "anyPair": "Islendik jübi jübüti",
      "specificNonPair": "Belli bir jübütsiz el, mysal üçin tuz-korol",
      "specificSuited": "Belli bir mastly el, mysal üçin bir mastly tuz-korol",
      "anySuited": "Bir mastly islendik iki kart",
      "twoBroadway": "Onluk ýa-da ondan ýokary iki kart"
    },
    "faqH2": "Soraglar",
    "faq": [
      [
        "Pokerde autlar näme?",
        "Destede galan, size iň gowy eli berjek kartlar. Diňe görmedik kartlaryňyzy sanaň: flopda 47, ternde 46."
      ],
      [
        "Tuzlar korollary näçe gezek ýeňýär?",
        "Takmynan bäşden dört gezek: bäş umumy kartyň hemmesi paýlananda {aakk}, korollar bolsa {kkaa} utýar."
      ],
      [
        "Tuz-korol jübüte garşy teňňe atmak ýalymy?",
        "Diýen ýaly, orta jübüte garşy: damalar tuz-korola garşy {qqak} utýar. Kiçi jübüte garşy has-da deň — ikilikler {22ak} utýar."
      ],
      [
        "Bank ähtimallygy näme?",
        "Call-yň bahasynyň utup boljak bankyňyz bilen deňeşdirilmesi. Eger utmak ähtimallygyňyz soňky bankdaky goýan paýyňyzdan ýokary bolsa, Call etmek wagtyň geçmegi bilen özüni ödeýär."
      ],
      [
        "PokerTH oýun wagtynda ähtimallyklarymy görkezýärmi?",
        "Hawa. «Mümkinçilikler» goýmasy kartlar açyldygyça häzirki iň gowy kombinasiýaňyzy we utmak mümkinçiligiňizi atlandyrýar, şonuň üçin stolda öz pikiriňizi barlap bilersiňiz."
      ]
    ]
  },
  tr: {
    "title": "Poker olasılıkları — out, pot oranı, el eşleşmeleri | PokerTH",
    "desc": "Tam olarak hesaplanmış Texas Hold’em olasılıkları: out’lar ve onları yakalama şansınız, 2 ve 4 kuralı, pot oranları, AA’nın KK’yi, QQ’nun AK’yi ne sıklıkla yendiği.",
    "ldHeadline": "Poker olasılıkları: out’lar, pot oranları ve flop öncesi eşleşmeler",
    "ldDesc": "Tam olarak hesaplanmış Texas Hold’em olasılıkları: out’lar, 2 ve 4 kuralı, pot oranları ve flop öncesi eşleşmeler.",
    "h1": "Poker olasılıkları: out’lar, pot oranları ve flop öncesi eşleşmeler",
    "lead": "İyi poker kararları birkaç sayıya dayanır: elinizin güçlenme olasılığı, bunu öğrenmek için ne kadar ödemeniz gerektiği ve iki elin flop öncesinde birbirine karşı durumu. Bu sayfadaki her rakam bir tablodan kopyalanmadı, tam olarak hesaplandı.",
    "calc": {
      "h2": "Poker olasılık hesaplayıcı",
      "intro": "İki kartınızı ve isterseniz masayı ve bir rakibin elini seçin. Hesaplayıcı kalan bütün kartları dağıtır — mümkün olduğunda tam olarak, değilse simülasyonla — ve ne sıklıkla kazandığınızı gösterir.",
      "you": "Eliniz",
      "board": "Masa",
      "opp": "Rakip (isteğe bağlı)",
      "players": "Rakipler",
      "pick": "Bir kartı vurgulanan yere koymak için ona dokunun; bir yeri boşaltmak için ona dokunun.",
      "clear": "Temizle",
      "win": "Kazanma",
      "tie": "Beraberlik",
      "lose": "Kaybetme",
      "exact": "Tam: olası {n} dağıtımın her biri.",
      "sim": "{n} rastgele dağıtımın simülasyonu.",
      "working": "Hesaplanıyor…",
      "need": "Şansınızı görmek için iki kartınızı seçin.",
      "boardHint": "Masaya önce üç kart (flop), sonra dört, sonra beş kart konur.",
      "oppHint": "Rakibinizin iki kartını da seçin ya da hiçbirini seçmeyin.",
      "final": "Son eliniz",
      "noscript": "Hesaplayıcı JavaScript gerektirir. Aşağıdaki tablolar onsuz da çalışır."
    },
    "outsH2": "Out’lar: isabet şansınız",
    "outsP": "Out, destede hâlâ duran ve elinizi muhtemel kazanan ele dönüştüren karttır. Flop’ta 47 kart görülmemiştir: 9 out ile tek kartın turn’de isabet etme olasılığı {f9turn}, iki kart daha gelecekken river’a kadar ise {f9river} olur.",
    "outsCols": [
      "Bekleyiş",
      "Out",
      "Turn",
      "River (turn’den)",
      "Turn veya river (flop’tan)"
    ],
    "draws": {
      "gutshot": "İçten kent bekleyişi (gutshot)",
      "twoPairFull": "İki Çift’ten Full’e",
      "pairTrips": "Çift’ten İki Çift’e veya Üçlü’ye",
      "twoOver": "İki üst karttan (overcard) çifte",
      "setFull": "Set’ten Full’e veya Kare’ye",
      "oesd": "İki uçlu kent bekleyişi",
      "flush": "Floş bekleyişi",
      "flushGut": "Floş bekleyişi ve gutshot",
      "flushOesd": "Floş bekleyişi ve iki uçlu kent bekleyişi"
    },
    "outsNote": "Bunlar out’larınızdan birini yakalama olasılıklarıdır. Runner-runner ekstraları dahil değildir ve bir rakibe de daha iyi bir el veren out aslında gerçek bir out değildir.",
    "ruleH2": "2 ve 4 kuralı",
    "ruleP": "Masada hızlı bir tahmin: hem turn’ü hem river’ı göreceğiniz durumda flop’ta out’larınızı 4 ile, yalnızca bir kart kaldığında 2 ile çarpın. Flop’ta bir floş bekleyişi 9 × 4 = %36 eder; tam değer ise {f9river}. Kural büyük bekleyişleri abartır: 15 out %60 verir, gerçek değer {f15river}.",
    "potH2": "Pot oranları: görmeli misiniz?",
    "potP": "Pot oranları, ödemeniz gerekeni kazanabileceğinizle karşılaştırır. Potta 100 var ve rakibiniz 50 bahis yapıyor: 200’lük bir potu kazanmak için 50 ödersiniz, yani bu Call’un kâr getirmesi için zamanın 50 ÷ 200 = %25’inden fazlasında kazanması gerekir. Floş bekleyişiyle ve tek kart kalmışken isabet olasılığınız {f9one}; dolayısıyla yalnızca river kalmışken bir bahsi görmek uzun vadede çip kaybettirir. Flop’ta All-In olunduğunda, iki kart daha gelecekken aynı bekleyişin isabet olasılığı {f9river} olur ve Call yapmaya değer.",
    "matchH2": "Flop öncesi eşleşmeler",
    "matchP": "Masanın beş kartı da açıldığında iki başlangıç elinin birbirine karşı durumu; olası {boards} masanın her biri üzerinden sayıldı. Semboller biraz fark eder: aşağıdaki eller, aynı sembol olarak gösterilmedikçe ortak sembol paylaşmaz.",
    "matchCols": [
      "El",
      "Karşı",
      "Kazanır",
      "Beraberlik",
      "Kaybeder"
    ],
    "startH2": "Başlangıç eli olasılıkları",
    "startP": "İki karttan oluşan {combos} farklı başlangıç eli vardır. Size ne sıklıkla gelir:",
    "startCols": [
      "El",
      "Olasılık",
      "Yaklaşık kaç elde bir"
    ],
    "starting": {
      "specificPair": "Belirli bir elde çift, örneğin aslar",
      "anyPair": "Herhangi bir elde çift",
      "specificNonPair": "Belirli bir çiftsiz el, örneğin as-papaz",
      "specificSuited": "Belirli bir aynı sembollü el, örneğin aynı sembol as-papaz",
      "anySuited": "Aynı sembolden herhangi iki kart",
      "twoBroadway": "On veya daha yüksek iki kart"
    },
    "faqH2": "Sorular",
    "faq": [
      [
        "Pokerde out nedir?",
        "Destede kalan ve size en iyi eli verecek kartlar. Yalnızca görmediğiniz kartları sayın: flop’ta 47, turn’de 46."
      ],
      [
        "Elde as çifti papaz çiftini ne sıklıkla yener?",
        "Yaklaşık beşte dört: masanın beş kartı da açıldığında {aakk}; papazların kazanma olasılığı ise {kkaa}."
      ],
      [
        "As-papaz bir çifte karşı yazı tura mı?",
        "Orta bir çifte karşı neredeyse: kız çiftinin as-papaza karşı kazanma olasılığı {qqak}. Küçük bir çifte karşı daha da yakındır — ikili çiftin kazanma olasılığı {22ak}."
      ],
      [
        "Pot oranı nedir?",
        "Bir Call’un fiyatının kazanabileceğiniz pota oranı. Kazanma şansınız, son pota koyduğunuz payın üzerindeyse görmek uzun vadede kâr getirir."
      ],
      [
        "PokerTH oyun sırasında şansımı gösteriyor mu?",
        "Evet. Kartlar açıldıkça Şanslar sekmesi o anki en iyi elinizi ve kazanma şansınızı gösterir; böylece masada kendi akıl yürütmenizi kontrol edebilirsiniz."
      ]
    ]
  },
  uk: {
    "title": "Ймовірності в покері — аути, шанси банку, протистояння | PokerTH",
    "desc": "Ймовірності Texas Hold’em, пораховані точно: аути та шанс їх зібрати, правило 2 і 4, шанси банку (pot odds) і як часто AA б’є KK, а QQ б’є AK.",
    "ldHeadline": "Ймовірності в покері: аути, шанси банку та протистояння на префлопі",
    "ldDesc": "Ймовірності Texas Hold’em, пораховані точно: аути, правило 2 і 4, шанси банку та протистояння на префлопі.",
    "h1": "Ймовірності в покері: аути, шанси банку та протистояння на префлопі",
    "lead": "Добрі рішення в покері зводяться до кількох чисел: наскільки ймовірно, що ваша рука посилиться, скільки треба заплатити, щоб це дізнатися, і як дві руки співвідносяться одна з одною до флопу. Кожне число на цій сторінці пораховане точно, а не переписане з таблиці.",
    "calc": {
      "h2": "Калькулятор покерних ймовірностей",
      "intro": "Виберіть дві свої карти і, за бажання, борд та руку суперника. Калькулятор роздає всі карти, що лишилися, — точно, коли це можливо, інакше симуляцією — і показує, як часто ви виграєте.",
      "you": "Ваша рука",
      "board": "Борд",
      "opp": "Суперник (необов’язково)",
      "players": "Суперники",
      "pick": "Торкніться карти, щоб покласти її у виділене місце; торкніться місця, щоб його звільнити.",
      "clear": "Очистити",
      "win": "Виграш",
      "tie": "Нічия",
      "lose": "Програш",
      "exact": "Точно: усі {n} можливих роздач.",
      "sim": "Симуляція {n} випадкових роздач.",
      "working": "Обчислення…",
      "need": "Виберіть дві свої карти, щоб побачити шанси.",
      "boardHint": "На борд кладуть три карти (флоп), потім чотири, потім п’ять.",
      "oppHint": "Виберіть обидві карти суперника або жодної.",
      "final": "Ваша підсумкова комбінація",
      "noscript": "Калькулятору потрібен JavaScript. Таблиці нижче працюють і без нього."
    },
    "outsH2": "Аути: ваш шанс зібрати",
    "outsP": "Аут — це карта, що ще лишилася в колоді й робить вашу руку ймовірним переможцем. На флопі невідомі 47 карт: з 9 аутами одна карта приходить на терні в {f9turn} випадків, а до ривера — коли ще мають вийти дві карти — у {f9river}.",
    "outsCols": [
      "Дро",
      "Аути",
      "Терн",
      "Ривер (з терну)",
      "Терн або ривер (з флопу)"
    ],
    "draws": {
      "gutshot": "Дро на внутрішній стрит (гатшот)",
      "twoPairFull": "Дві пари до фул-хаусу",
      "pairTrips": "Пара до двох пар або трійки",
      "twoOver": "Дві оверкарти до пари",
      "setFull": "Сет до фул-хаусу або каре",
      "oesd": "Двостороннє дро на стрит",
      "flush": "Флеш-дро",
      "flushGut": "Флеш-дро і гатшот",
      "flushOesd": "Флеш-дро і двостороннє дро на стрит"
    },
    "outsNote": "Це шанси зловити один із ваших аутів. Вони не враховують додаткових шансів через дві карти поспіль (раннер-раннер), а аут, який водночас дає супернику кращу руку, насправді не аут.",
    "ruleH2": "Правило 2 і 4",
    "ruleP": "Швидка оцінка за столом: на флопі помножте кількість аутів на 4, якщо побачите і терн, і ривер, і на 2, коли лишилася одна карта. Флеш-дро на флопі дає 9 × 4 = 36%, тоді як точно — {f9river}. Правило переоцінює великі дро: 15 аутів дають 60%, а насправді — {f15river}.",
    "potH2": "Шанси банку: чи варто зрівнювати?",
    "potP": "Шанси банку (pot odds) порівнюють, скільки ви маєте заплатити, з тим, скільки можете виграти. У банку 100, суперник ставить 50: ви зрівнюєте 50, щоб виграти банк 200, тож колл має вигравати частіше, ніж у 50 ÷ 200 = 25% випадків, щоб окупитися. З флеш-дро й однією картою попереду ви збираєте в {f9one} випадків, тож колл ставки, коли лишився тільки ривер, на дистанції втрачає фішки. Ва-банк на флопі, коли попереду ще дві карти: те саме дро збирається в {f9river} випадків, і колл того вартий.",
    "matchH2": "Протистояння на префлопі",
    "matchP": "Як дві стартові руки виступають одна проти одної, коли роздано всі п’ять карт борду, пораховано по всіх {boards} можливих бордах. Масті трохи важать: руки нижче не мають спільної масті, якщо не позначені як одномасні.",
    "matchCols": [
      "Рука",
      "Проти",
      "Виграє",
      "Нічия",
      "Програє"
    ],
    "startH2": "Ймовірності стартових рук",
    "startP": "Існує {combos} різних стартових рук із двох карт. Як часто вам роздають:",
    "startCols": [
      "Рука",
      "Шанс",
      "Приблизно одна роздача з"
    ],
    "starting": {
      "specificPair": "Певна кишенькова пара, наприклад тузи",
      "anyPair": "Будь-яка кишенькова пара",
      "specificNonPair": "Певна рука без пари, наприклад туз-король",
      "specificSuited": "Певна одномасна рука, наприклад одномасні туз-король",
      "anySuited": "Будь-які дві одномасні карти",
      "twoBroadway": "Дві карти від десятки й вище"
    },
    "faqH2": "Запитання",
    "faq": [
      [
        "Що таке аути в покері?",
        "Карти, що лишилися в колоді й дали б вам найкращу руку. Рахуйте лише ті карти, яких ви не бачили: 47 на флопі, 46 на терні."
      ],
      [
        "Як часто кишенькові тузи б’ють королів?",
        "Приблизно чотири рази з п’яти: {aakk}, коли роздано всі п’ять карт борду, а королі виграють {kkaa}."
      ],
      [
        "Туз-король проти пари — це підкидання монетки?",
        "Майже, проти середньої пари: дами виграють {qqak} проти туза-короля. Проти малої пари ще рівніше — двійки виграють {22ak}."
      ],
      [
        "Що таке шанси банку?",
        "Ціна колу порівняно з банком, який можна виграти. Якщо ваш шанс на виграш вищий за частку підсумкового банку, яку вкладаєте ви, колл окупається з часом."
      ],
      [
        "Чи показує PokerTH мої шанси під час гри?",
        "Так. Вкладка «Шанси» називає вашу найкращу на цю мить комбінацію та ваші шанси на виграш у міру виходу карт, тож ви можете перевірити власні міркування за столом."
      ]
    ]
  },
  ur: {
    "title": "پوکر اوڈز چارٹ — آؤٹس، پاٹ اوڈز، ہاتھوں کے مقابلے | PokerTH",
    "desc": "Texas Hold’em کے امکانات بالکل درست حساب سے: آؤٹس اور انہیں پانے کا امکان، 2 اور 4 کا اصول، پاٹ اوڈز، اور AA کتنی بار KK کو یا QQ کتنی بار AK کو ہراتا ہے۔",
    "ldHeadline": "پوکر اوڈز: آؤٹس، پاٹ اوڈز اور فلاپ سے پہلے کے مقابلے",
    "ldDesc": "Texas Hold’em کے امکانات بالکل درست حساب سے: آؤٹس، 2 اور 4 کا اصول، پاٹ اوڈز اور فلاپ سے پہلے کے مقابلے۔",
    "h1": "پوکر اوڈز: آؤٹس، پاٹ اوڈز اور فلاپ سے پہلے کے مقابلے",
    "lead": "پوکر کے اچھے فیصلے چند اعداد پر آ کر ٹھہرتے ہیں: آپ کا ہاتھ بہتر ہونے کا کتنا امکان ہے، یہ جاننے کے لیے آپ کو کتنا دینا ہوگا، اور فلاپ سے پہلے دو ہاتھ ایک دوسرے کے مقابل کہاں کھڑے ہیں۔ اس صفحے کا ہر عدد بالکل درست حساب کیا گیا ہے، کسی چارٹ سے نقل نہیں کیا گیا۔",
    "calc": {
      "h2": "پوکر اوڈز کیلکولیٹر",
      "intro": "اپنے دو کارڈ چنیں اور، چاہیں تو، میز کے کارڈ اور کسی حریف کا ہاتھ بھی۔ کیلکولیٹر باقی تمام کارڈ بانٹ کر دیکھتا ہے — جہاں ممکن ہو بالکل درست، ورنہ سمیولیشن سے — اور دکھاتا ہے کہ آپ کتنی بار جیتتے ہیں۔",
      "you": "آپ کا ہاتھ",
      "board": "میز کے کارڈ",
      "opp": "حریف (اختیاری)",
      "players": "حریف",
      "pick": "کارڈ کو نمایاں خانے میں رکھنے کے لیے اسے ٹیپ کریں؛ خانہ خالی کرنے کے لیے اسے ٹیپ کریں۔",
      "clear": "صاف کریں",
      "win": "جیت",
      "tie": "برابر",
      "lose": "ہار",
      "exact": "درست: تمام {n} ممکنہ تقسیمیں۔",
      "sim": "{n} بے ترتیب تقسیموں کی سمیولیشن۔",
      "working": "حساب ہو رہا ہے…",
      "need": "اپنے امکانات دیکھنے کے لیے اپنے دو کارڈ چنیں۔",
      "boardHint": "میز پر تین کارڈ (فلاپ) آتے ہیں، پھر چار، پھر پانچ۔",
      "oppHint": "حریف کے دونوں کارڈ چنیں، یا کوئی بھی نہیں۔",
      "final": "آپ کا آخری ہاتھ",
      "noscript": "کیلکولیٹر کو JavaScript درکار ہے۔ نیچے دی گئی جدولیں اس کے بغیر بھی کام کرتی ہیں۔"
    },
    "outsH2": "آؤٹس: کارڈ لگنے کا آپ کا امکان",
    "outsP": "آؤٹ وہ کارڈ ہے جو ابھی گڈی میں ہے اور آپ کے ہاتھ کو ممکنہ جیتنے والا بنا دیتا ہے۔ فلاپ پر 47 کارڈ ان دیکھے ہوتے ہیں: 9 آؤٹس کے ساتھ ٹرن کا ایک کارڈ {f9turn} بار لگتا ہے، اور ریور تک — جب دو کارڈ آنے باقی ہوں — {f9river}۔",
    "outsCols": [
      "ڈرا",
      "آؤٹس",
      "ٹرن",
      "ریور (ٹرن سے)",
      "ٹرن یا ریور (فلاپ سے)"
    ],
    "draws": {
      "gutshot": "اندرونی اسٹریٹ ڈرا (گٹ شاٹ)",
      "twoPairFull": "دو جوڑے ← فل ہاؤس",
      "pairTrips": "ایک جوڑا ← دو جوڑے یا تین ایک جیسے",
      "twoOver": "دو اوور کارڈ ← ایک جوڑا",
      "setFull": "سیٹ ← فل ہاؤس یا چار ایک جیسے",
      "oesd": "دونوں سروں سے کھلا اسٹریٹ ڈرا",
      "flush": "فلش ڈرا",
      "flushGut": "فلش ڈرا اور گٹ شاٹ",
      "flushOesd": "فلش ڈرا اور دونوں سروں سے کھلا اسٹریٹ ڈرا"
    },
    "outsNote": "یہ آپ کے آؤٹس میں سے کوئی ایک لگنے کے امکانات ہیں۔ ان میں رنر رنر (لگاتار دو کارڈ) سے بننے والے اضافی ہاتھ شامل نہیں، اور جو آؤٹ حریف کو بھی بہتر ہاتھ دے دے وہ دراصل آؤٹ نہیں۔",
    "ruleH2": "2 اور 4 کا اصول",
    "ruleP": "میز پر فوری اندازہ: فلاپ پر، جب آپ ٹرن اور ریور دونوں دیکھیں گے، اپنے آؤٹس کو 4 سے ضرب دیں، اور جب صرف ایک کارڈ آنا باقی ہو تو 2 سے۔ فلاپ پر فلش ڈرا 9 × 4 = 36% بنتا ہے، جبکہ درست عدد {f9river} ہے۔ یہ اصول بڑے ڈرا کو بڑھا چڑھا کر بتاتا ہے: 15 آؤٹس پر 60% آتا ہے، اصل عدد {f15river} ہے۔",
    "potH2": "پاٹ اوڈز: کیا آپ کو کال کرنا چاہیے؟",
    "potP": "پاٹ اوڈز اس کا موازنہ کرتے ہیں جو آپ کو دینا ہے اور جو آپ جیت سکتے ہیں۔ پاٹ میں 100 ہیں اور حریف 50 کی شرط لگاتا ہے: آپ 200 کا پاٹ جیتنے کے لیے 50 کال کرتے ہیں، اس لیے فائدہ مند ہونے کے لیے کال کو 50 ÷ 200 = 25% سے زیادہ بار جیتنا چاہیے۔ فلش ڈرا کے ساتھ جب ایک کارڈ آنا باقی ہو تو آپ کا کارڈ {f9one} بار لگتا ہے، اس لیے جب صرف ریور باقی ہو تو شرط کال کرنا طویل مدت میں چپس گنواتا ہے۔ فلاپ پر All-In ہو اور دونوں کارڈ آنے باقی ہوں تو یہی ڈرا {f9river} لگتا ہے، اور کال کرنا فائدہ مند ہے۔",
    "matchH2": "فلاپ سے پہلے کے مقابلے",
    "matchP": "جب میز کے پانچوں کارڈ بانٹ دیے جائیں تو دو ابتدائی ہاتھ ایک دوسرے کے خلاف کیسا کرتے ہیں، تمام {boards} ممکنہ میزوں پر گن کر۔ رنگ کا تھوڑا اثر ہوتا ہے: نیچے دیے گئے ہاتھوں کا کوئی رنگ مشترک نہیں، سوائے ان کے جو ایک ہی رنگ کے دکھائے گئے ہوں۔",
    "matchCols": [
      "ہاتھ",
      "مقابل",
      "جیت",
      "برابر",
      "ہار"
    ],
    "startH2": "ابتدائی ہاتھوں کے امکانات",
    "startP": "دو کارڈوں والے {combos} مختلف ابتدائی ہاتھ ہوتے ہیں۔ آپ کو کتنی بار ملتا ہے:",
    "startCols": [
      "ہاتھ",
      "امکان",
      "تقریباً اتنے ہاتھوں میں ایک"
    ],
    "starting": {
      "specificPair": "ہاتھ میں کوئی مخصوص جوڑا، جیسے اِکّے",
      "anyPair": "ہاتھ میں کوئی بھی جوڑا",
      "specificNonPair": "کوئی مخصوص بغیر جوڑے والا ہاتھ، جیسے اِکّا-بادشاہ",
      "specificSuited": "کوئی مخصوص ایک رنگ والا ہاتھ، جیسے ایک ہی رنگ کے اِکّا-بادشاہ",
      "anySuited": "ایک ہی رنگ کے کوئی بھی دو کارڈ",
      "twoBroadway": "دس یا اس سے اوپر کے دو کارڈ"
    },
    "faqH2": "سوالات",
    "faq": [
      [
        "پوکر میں آؤٹس کیا ہوتے ہیں؟",
        "گڈی میں بچے وہ کارڈ جو آپ کو بہترین ہاتھ دے دیں۔ صرف وہ کارڈ گنیں جو آپ نے نہیں دیکھے: فلاپ پر 47، ٹرن پر 46۔"
      ],
      [
        "اِکّوں کا جوڑا بادشاہوں کے جوڑے کو کتنی بار ہراتا ہے؟",
        "تقریباً پانچ میں سے چار بار: جب میز کے پانچوں کارڈ بانٹے جائیں تو {aakk}، جبکہ بادشاہ {kkaa} جیتتے ہیں۔"
      ],
      [
        "کیا جوڑے کے خلاف اِکّا-بادشاہ سکہ اچھالنے جیسا ہے؟",
        "درمیانے جوڑے کے خلاف تقریباً: بیگمیں اِکّا-بادشاہ کے خلاف {qqak} جیتتی ہیں۔ چھوٹے جوڑے کے خلاف مقابلہ اور بھی قریب ہے — دُکّیاں {22ak} جیتتی ہیں۔"
      ],
      [
        "پاٹ اوڈز کیا ہیں؟",
        "کال کی قیمت کا اس پاٹ سے موازنہ جو آپ جیت سکتے ہیں۔ اگر آپ کے جیتنے کا امکان آخری پاٹ میں آپ کے ڈالے گئے حصے سے زیادہ ہو، تو وقت کے ساتھ کال کرنا فائدہ دیتا ہے۔"
      ],
      [
        "کیا PokerTH کھیل کے دوران میرے امکانات دکھاتا ہے؟",
        "جی ہاں۔ «امکانات» ٹیب آپ کا موجودہ بہترین ہاتھ بتاتا ہے اور کارڈ کھلنے کے ساتھ ساتھ آپ کے جیتنے کا امکان دکھاتا ہے، تاکہ آپ میز پر ہی اپنے اندازے کو جانچ سکیں۔"
      ]
    ]
  },
  uz: {
    "title": "Poker ehtimollari — autlar, bank imkoniyatlari, duellar | PokerTH",
    "desc": "Texas Hold’em ehtimollari aniq hisoblangan: autlar va ularni tutish imkoniyati, 2 va 4 qoidasi, bank imkoniyatlari, AA KK’ni va QQ AK’ni qanchalik tez-tez yengishi.",
    "ldHeadline": "Poker ehtimollari: autlar, bank imkoniyatlari va preflop toʻqnashuvlari",
    "ldDesc": "Aniq hisoblangan Texas Hold’em ehtimollari: autlar, 2 va 4 qoidasi, bank imkoniyatlari va preflop toʻqnashuvlari.",
    "h1": "Poker ehtimollari: autlar, bank imkoniyatlari va preflop toʻqnashuvlari",
    "lead": "Pokerdagi yaxshi qarorlar bir necha raqamga borib taqaladi: qoʻlingiz kuchayishi qanchalik ehtimol, buni bilish uchun qancha toʻlashingiz kerak va flopdan oldin ikki qoʻl bir-biriga qarshi qanday turadi. Bu sahifadagi har bir raqam jadvaldan koʻchirilmagan, aniq hisoblangan.",
    "calc": {
      "h2": "Poker ehtimollari kalkulyatori",
      "intro": "Ikkita kartangizni va xohlasangiz, stol kartalari hamda raqib qoʻlini tanlang. Kalkulyator qolgan barcha kartalarni tarqatadi — iloji boʻlsa aniq, aks holda simulyatsiya orqali — va qanchalik tez-tez yutishingizni koʻrsatadi.",
      "you": "Sizning qoʻlingiz",
      "board": "Stol",
      "opp": "Raqib (ixtiyoriy)",
      "players": "Raqiblar",
      "pick": "Kartani belgilangan joyga qoʻyish uchun unga bosing; joyni boʻshatish uchun joyning oʻziga bosing.",
      "clear": "Tozalash",
      "win": "Gʻalaba",
      "tie": "Durang",
      "lose": "Magʻlubiyat",
      "exact": "Aniq: {n} ta mumkin boʻlgan tarqatishning barchasi.",
      "sim": "{n} ta tasodifiy tarqatish simulyatsiyasi.",
      "working": "Hisoblanmoqda…",
      "need": "Ehtimollaringizni koʻrish uchun ikkita kartangizni tanlang.",
      "boardHint": "Stolga avval uchta karta (flop), soʻng toʻrtta, keyin beshta qoʻyiladi.",
      "oppHint": "Raqibning ikkala kartasini tanlang yoki birortasini ham tanlamang.",
      "final": "Yakuniy qoʻlingiz",
      "noscript": "Kalkulyator uchun JavaScript kerak. Quyidagi jadvallar usiz ham ishlaydi."
    },
    "outsH2": "Autlar: tutish imkoniyatingiz",
    "outsP": "Aut — kolodada hali qolgan va qoʻlingizni ehtimoliy gʻolibga aylantiradigan karta. Flopda 47 ta karta koʻrinmagan: 9 ta aut bilan bitta karta turnda {f9turn} ehtimol bilan chiqadi, riverga qadar esa — oldinda yana ikki karta borida — {f9river}.",
    "outsCols": [
      "Dro",
      "Autlar",
      "Turn",
      "River (turndan)",
      "Turn yoki river (flopdan)"
    ],
    "draws": {
      "gutshot": "Ichki strit-dro (gutshot)",
      "twoPairFull": "Ikki juftlikdan full-xausga",
      "pairTrips": "Juftlikdan ikki juftlik yoki uchlikka",
      "twoOver": "Juftlik uchun ikkita overkarta",
      "setFull": "Setdan full-xaus yoki karega",
      "oesd": "Ochiq strit-dro",
      "flush": "Flesh-dro",
      "flushGut": "Flesh-dro va gutshot",
      "flushOesd": "Flesh-dro va ochiq strit-dro"
    },
    "outsNote": "Bular autlaringizdan birini tutish imkoniyatlari. Runner-runner (bekdor) qoʻshimchalari hisobga olinmagan, raqibga ham kuchliroq qoʻl beradigan aut esa aslida aut emas.",
    "ruleH2": "2 va 4 qoidasi",
    "ruleP": "Stolda tezkor baho: turn va riverni ham koʻradigan boʻlsangiz, flopda autlaringizni 4 ga, faqat bitta karta qolganda esa 2 ga koʻpaytiring. Flopdagi flesh-dro 9 × 4 = 36% beradi, aniq hisobda esa {f9river}. Qoida katta drolarni oshirib koʻrsatadi: 15 ta aut 60% beradi, haqiqiy raqam esa {f15river}.",
    "potH2": "Bank imkoniyatlari: call qilish kerakmi?",
    "potP": "Bank imkoniyatlari toʻlashingiz kerak boʻlgan narsani yutishingiz mumkin boʻlgan narsa bilan solishtiradi. Bankda 100 bor va raqibingiz 50 tikadi: 200 lik bankni yutish uchun 50 call qilasiz, demak call oʻzini oqlashi uchun 50 ÷ 200 = 25% dan koʻproq hollarda yutishi kerak. Flesh-dro bilan va bitta karta qolganda {f9one} ehtimol bilan tutasiz, shuning uchun faqat river qolganda stavkaga call qilish uzoq muddatda fishka yoʻqotadi. Flopda all-in boʻlganda, oldinda ikkala karta borida, oʻsha dro {f9river} ehtimol bilan tutadi va call qilishga arziydi.",
    "matchH2": "Preflop toʻqnashuvlari",
    "matchP": "Stolning barcha beshta kartasi tarqatilganda ikki boshlangʻich qoʻl bir-biriga qarshi qanday natija koʻrsatadi — {boards} ta mumkin boʻlgan stolning har biri boʻyicha hisoblangan. Mastlar biroz ahamiyatga ega: quyidagi qoʻllar bir mastli deb koʻrsatilmagan boʻlsa, umumiy mastga ega emas.",
    "matchCols": [
      "Qoʻl",
      "Qarshi",
      "Yutadi",
      "Durang",
      "Yutqazadi"
    ],
    "startH2": "Boshlangʻich qoʻllar ehtimollari",
    "startP": "{combos} ta turli ikki kartali boshlangʻich qoʻl mavjud. Sizga qanchalik tez-tez tushadi:",
    "startCols": [
      "Qoʻl",
      "Ehtimol",
      "Taxminan nechta qoʻldan biri"
    ],
    "starting": {
      "specificPair": "Muayyan choʻntak juftligi, masalan, tuzlar",
      "anyPair": "Istalgan choʻntak juftligi",
      "specificNonPair": "Muayyan juftsiz qoʻl, masalan, tuz-qirol",
      "specificSuited": "Muayyan bir mastli qoʻl, masalan, bir mastli tuz-qirol",
      "anySuited": "Istalgan ikkita bir mastli karta",
      "twoBroadway": "Oʻnlik va undan yuqori ikkita karta"
    },
    "faqH2": "Savollar",
    "faq": [
      [
        "Pokerda autlar nima?",
        "Kolodada qolgan va sizga eng yaxshi qoʻlni beradigan kartalar. Faqat koʻrmagan kartalaringizni sanang: flopda 47 ta, turnda 46 ta."
      ],
      [
        "Choʻntak tuzlari qirollarni qanchalik tez-tez yengadi?",
        "Taxminan beshdan toʻrt marta: stolning barcha beshta kartasi tarqatilganda {aakk}, qirollar esa {kkaa} ehtimol bilan yutadi."
      ],
      [
        "Tuz-qirol juftlikka qarshi — tanga tashlashmi?",
        "Oʻrtacha juftlikka qarshi deyarli shunday: malikalar tuz-qirolga qarshi {qqak} yutadi. Kichik juftlikka qarshi yanada teng — ikkiliklar {22ak} yutadi."
      ],
      [
        "Bank imkoniyatlari nima?",
        "Call narxining yutishingiz mumkin boʻlgan bank bilan solishtirmasi. Agar yutish imkoniyatingiz yakuniy bankka oʻzingiz qoʻshgan ulushdan yuqori boʻlsa, call qilish vaqt oʻtishi bilan oʻzini oqlaydi."
      ],
      [
        "PokerTH oʻyin davomida ehtimollarimni koʻrsatadimi?",
        "Ha. Ehtimollar paneli kartalar ochilgan sari hozirgi eng yaxshi qoʻlingizni va yutish imkoniyatingizni koʻrsatadi, shuning uchun stolda oʻz mulohazalaringizni tekshirib koʻrishingiz mumkin."
      ]
    ]
  },
  vi: {
    "title": "Xác suất poker — cửa thắng, tỉ lệ pot, đối đầu tay bài | PokerTH",
    "desc": "Xác suất Texas Hold’em tính chính xác: cửa thắng (outs) và khả năng bạn bắt được, quy tắc 2 và 4, tỉ lệ pot, và AA thắng KK hay QQ thắng AK thường xuyên đến đâu.",
    "ldHeadline": "Xác suất poker: cửa thắng, tỉ lệ pot và đối đầu trước flop",
    "ldDesc": "Xác suất Texas Hold’em tính chính xác: cửa thắng, quy tắc 2 và 4, tỉ lệ pot và đối đầu trước flop.",
    "h1": "Xác suất poker: cửa thắng, tỉ lệ pot và đối đầu trước flop",
    "lead": "Quyết định poker đúng đắn quy về vài con số: khả năng tay bài của bạn mạnh lên là bao nhiêu, bạn phải trả bao nhiêu để biết điều đó, và hai tay bài so với nhau thế nào trước flop. Mọi con số trên trang này đều được tính chính xác, không chép từ bảng nào.",
    "calc": {
      "h2": "Công cụ tính xác suất poker",
      "intro": "Chọn hai lá bài của bạn và, nếu muốn, bài chung và bài của một đối thủ. Công cụ chia hết mọi lá còn lại — chính xác bất cứ khi nào có thể, nếu không thì bằng mô phỏng — và cho biết bạn thắng thường xuyên đến đâu.",
      "you": "Bài của bạn",
      "board": "Bài chung",
      "opp": "Đối thủ (tùy chọn)",
      "players": "Số đối thủ",
      "pick": "Chạm vào một lá để đặt nó vào ô đang sáng; chạm vào một ô để làm trống ô đó.",
      "clear": "Xóa",
      "win": "Thắng",
      "tie": "Hòa",
      "lose": "Thua",
      "exact": "Chính xác: toàn bộ {n} cách chia có thể.",
      "sim": "Mô phỏng {n} lần chia ngẫu nhiên.",
      "working": "Đang tính…",
      "need": "Chọn hai lá bài của bạn để xem xác suất.",
      "boardHint": "Bài chung gồm ba lá (flop), rồi bốn, rồi năm.",
      "oppHint": "Chọn cả hai lá của đối thủ, hoặc không chọn lá nào.",
      "final": "Tay bài cuối cùng của bạn",
      "noscript": "Công cụ tính cần JavaScript. Các bảng bên dưới vẫn dùng được khi không có nó."
    },
    "outsH2": "Cửa thắng (outs): khả năng bạn bắt được bài",
    "outsP": "Cửa thắng là lá bài còn trong bộ bài có thể biến tay bài của bạn thành tay nhiều khả năng thắng. Ở flop, có 47 lá chưa lộ: với 9 cửa thắng, khả năng ra đúng lá ở turn là {f9turn}, và tới river — còn hai lá nữa — là {f9river}.",
    "outsCols": [
      "Bài chờ",
      "Cửa thắng",
      "Turn",
      "River (từ turn)",
      "Turn hoặc river (từ flop)"
    ],
    "draws": {
      "gutshot": "Chờ sảnh giữa (gutshot)",
      "twoPairFull": "Thú chờ cù lũ",
      "pairTrips": "Đôi chờ thú hoặc sám cô",
      "twoOver": "Hai lá cao hơn bài chung chờ đôi",
      "setFull": "Sám cô ngầm chờ cù lũ hoặc tứ quý",
      "oesd": "Chờ sảnh hai đầu",
      "flush": "Chờ thùng",
      "flushGut": "Chờ thùng và sảnh giữa",
      "flushOesd": "Chờ thùng và sảnh hai đầu"
    },
    "outsNote": "Đây là khả năng bắt được một trong các cửa thắng của bạn. Chưa tính các trường hợp runner-runner, và một lá đồng thời cho đối thủ tay bài mạnh hơn thì không thực sự là cửa thắng.",
    "ruleH2": "Quy tắc 2 và 4",
    "ruleP": "Cách ước tính nhanh tại bàn: ở flop, nhân số cửa thắng với 4 khi bạn sẽ được xem cả turn lẫn river, và với 2 khi chỉ còn một lá. Chờ thùng ở flop là 9 × 4 = 36%, so với con số chính xác {f9river}. Quy tắc này đánh giá quá cao các tay chờ lớn: 15 cửa thắng cho ra 60%, trong khi con số thật là {f15river}.",
    "potH2": "Tỉ lệ pot: có nên Call?",
    "potP": "Tỉ lệ pot so sánh số tiền bạn phải bỏ ra với số tiền bạn có thể thắng. Pot có 100 và đối thủ cược 50: bạn theo 50 để thắng pot 200, nên lần theo này phải thắng nhiều hơn 50 ÷ 200 = 25% số lần mới có lời. Với bài chờ thùng và còn một lá, bạn ra bài {f9one} số lần, nên theo cược khi chỉ còn river sẽ mất phỉnh về lâu dài. All-In ở flop, khi còn cả hai lá, cùng tay chờ đó ra bài {f9river}, và theo là đáng.",
    "matchH2": "Đối đầu trước flop",
    "matchP": "Hai tay bài khởi đầu đọ nhau ra sao khi chia đủ năm lá bài chung, tính trên toàn bộ {boards} khả năng của bài chung. Chất bài có ảnh hưởng chút ít: các tay bài bên dưới không chung chất nào, trừ khi được ghi là cùng chất.",
    "matchCols": [
      "Tay bài",
      "Gặp",
      "Thắng",
      "Hòa",
      "Thua"
    ],
    "startH2": "Xác suất tay bài khởi đầu",
    "startP": "Có {combos} tay bài khởi đầu hai lá khác nhau. Bạn được chia những tay sau thường xuyên đến đâu:",
    "startCols": [
      "Tay bài",
      "Xác suất",
      "Khoảng một lần trong số ván"
    ],
    "starting": {
      "specificPair": "Một đôi trên tay cụ thể, ví dụ đôi át",
      "anyPair": "Bất kỳ đôi trên tay nào",
      "specificNonPair": "Một tay không đôi cụ thể, ví dụ át-già",
      "specificSuited": "Một tay cùng chất cụ thể, ví dụ át-già cùng chất",
      "anySuited": "Hai lá bất kỳ cùng chất",
      "twoBroadway": "Hai lá từ mười trở lên"
    },
    "faqH2": "Câu hỏi",
    "faq": [
      [
        "Cửa thắng (outs) trong poker là gì?",
        "Những lá còn trong bộ bài có thể cho bạn tay bài mạnh nhất. Chỉ đếm những lá bạn chưa thấy: 47 lá ở flop, 46 lá ở turn."
      ],
      [
        "Đôi át trên tay thắng đôi già thường xuyên đến đâu?",
        "Khoảng bốn trên năm lần: {aakk} khi chia đủ năm lá bài chung, còn đôi già thắng {kkaa}."
      ],
      [
        "Át-già gặp một đôi có phải là kèo năm ăn năm thua?",
        "Gần như vậy, khi gặp đôi trung bình: đôi đầm thắng át-già {qqak}. Gặp đôi nhỏ còn sát hơn nữa — đôi hai thắng {22ak}."
      ],
      [
        "Tỉ lệ pot là gì?",
        "Cái giá của một lần theo, so với pot bạn có thể thắng. Nếu khả năng thắng của bạn cao hơn phần bạn góp vào pot cuối cùng, theo cược sẽ có lời về lâu dài."
      ],
      [
        "PokerTH có hiển thị xác suất của tôi trong ván chơi không?",
        "Có. Tab Cơ hội ghi tên tay bài mạnh nhất hiện tại của bạn và khả năng thắng của bạn khi các lá được lật, để bạn tự kiểm tra lập luận của mình ngay tại bàn."
      ]
    ]
  },
  yo: {
    "title": "Àǹfààní poker — outs, pot odds, ọwọ́ sí ọwọ́ | PokerTH",
    "desc": "Àǹfààní Texas Hold’em tí a ṣírò ní pàtó: outs àti àǹfààní rẹ láti rí wọn, òfin 2 àti 4, pot odds, àti bí AA ṣe ń borí KK tàbí QQ ṣe ń borí AK tó.",
    "ldHeadline": "Àǹfààní poker: outs, pot odds àti ìfigagbága ṣáájú flop",
    "ldDesc": "Àǹfààní Texas Hold’em tí a ṣírò ní pàtó: outs, òfin 2 àti 4, pot odds àti ìfigagbága ṣáájú flop.",
    "h1": "Àǹfààní poker: outs, pot odds àti ìfigagbága ṣáájú flop",
    "lead": "Ìpinnu tó dára nínú poker dá lórí nọ́ńbà díẹ̀: bí ó ṣe ṣeé ṣe tó pé ọwọ́ rẹ yóò dára sí i, iye tí o gbọ́dọ̀ san láti mọ̀, àti bí ọwọ́ méjì ṣe dúró sí ara wọn ṣáájú flop. Gbogbo nọ́ńbà ojú-ewé yìí ni a ṣírò ní pàtó, a kò dà á kọ láti inú àtẹ kankan.",
    "calc": {
      "h2": "Ẹ̀rọ ìṣírò àǹfààní poker",
      "intro": "Yan káàdì rẹ méjì àti, tí o bá fẹ́, board àti ọwọ́ alátakò kan. Ẹ̀rọ ìṣírò náà ń pín gbogbo káàdì tó kù — ní pàtó nígbàkúùgbà tí ó bá ṣeé ṣe, bí bẹ́ẹ̀ kọ́ nípasẹ̀ ìṣàfarawé — ó sì ń fi bí o ṣe ń borí tó hàn.",
      "you": "Ọwọ́ rẹ",
      "board": "Board",
      "opp": "Alátakò (àṣàyàn)",
      "players": "Àwọn alátakò",
      "pick": "Tẹ káàdì kan láti fi sí àyè tí a tàn; tẹ àyè kan láti sọ ọ́ di òfo.",
      "clear": "Pa rẹ́",
      "win": "Ìborí",
      "tie": "Ọ̀mì",
      "lose": "Ìpàdánù",
      "exact": "Pàtó: gbogbo ìpín {n} tí ó ṣeé ṣe.",
      "sim": "Ìṣàfarawé ìpín àìròtẹ́lẹ̀ {n}.",
      "working": "À ń ṣírò…",
      "need": "Yan káàdì rẹ méjì láti rí àǹfààní rẹ.",
      "boardHint": "Board ń gba káàdì mẹ́ta (flop), lẹ́yìn náà mẹ́rin, lẹ́yìn náà márùn-ún.",
      "oppHint": "Yan káàdì alátakò rẹ méjèèjì, tàbí kò sí ọ̀kankan.",
      "final": "Ọwọ́ ìkẹyìn rẹ",
      "noscript": "Ẹ̀rọ ìṣírò náà nílò JavaScript. Àwọn àtẹ ìsàlẹ̀ ń ṣiṣẹ́ láìsí rẹ̀."
    },
    "outsH2": "Outs: àǹfààní rẹ láti rí káàdì tí o nílò",
    "outsP": "Out jẹ́ káàdì tí ó ṣì wà nínú àkójọ káàdì tí yóò sọ ọwọ́ rẹ di èyí tí ó ṣeé ṣe kí ó borí. Lórí flop, káàdì 47 ni a kò tíì rí: pẹ̀lú outs 9, káàdì kan máa ń dé lórí turn ní {f9turn} ìgbà, àti títí dé river — pẹ̀lú káàdì méjì tí ń bọ̀ — {f9river}.",
    "outsCols": [
      "Draw",
      "Outs",
      "Turn",
      "River (láti turn)",
      "Turn tàbí river (láti flop)"
    ],
    "draws": {
      "gutshot": "Straight draw inú (gutshot)",
      "twoPairFull": "Two Pair sí Full House",
      "pairTrips": "One Pair sí Two Pair tàbí Three of a Kind",
      "twoOver": "Overcard méjì sí pair",
      "setFull": "Set sí Full House tàbí Four of a Kind",
      "oesd": "Straight draw olópin-méjì (open-ended)",
      "flush": "Flush draw",
      "flushGut": "Flush draw àti gutshot",
      "flushOesd": "Flush draw àti open-ended straight draw"
    },
    "outsNote": "Ìwọ̀nyí ni àǹfààní láti rí ọ̀kan nínú outs rẹ. Wọn kò ka àfikún runner-runner, àti pé out tí ó tún fún alátakò ní ọwọ́ tí ó dára jù kì í ṣe out gidi.",
    "ruleH2": "Òfin 2 àti 4",
    "ruleP": "Ìṣirò kíákíá ní tábìlì: lórí flop, fi 4 sọ outs rẹ di púpọ̀ nígbà tí o máa rí turn àti river méjèèjì, kí o sì fi 2 nígbà tí káàdì kan ṣoṣo ló kù láti dé. Flush draw lórí flop jẹ́ 9 × 4 = 36%, ní ìfiwéra pẹ̀lú {f9river} ní pàtó. Òfin náà ń fi kún iye draw ńlá: outs 15 ń fún ọ ní 60%, ṣùgbọ́n iye gidi jẹ́ {f15river}.",
    "potH2": "Pot odds: ṣé kí o ṣe Call?",
    "potP": "Pot odds ń fi ohun tí o gbọ́dọ̀ san wé ohun tí o lè borí. Pot ní 100, alátakò rẹ sì ta tẹ́tẹ́ 50: o ṣe Call 50 láti borí pot 200, nítorí náà Call náà gbọ́dọ̀ borí ju 50 ÷ 200 = 25% ìgbà lọ kí ó tó lérè. Pẹ̀lú flush draw àti káàdì kan tó kù, o máa rí i ní {f9one} ìgbà, nítorí náà ṣíṣe Call sí tẹ́tẹ́ nígbà tí river nìkan ló kù máa ń pàdánù chips lọ́jọ́ pípẹ́. All-In lórí flop, pẹ̀lú káàdì méjèèjì tí ń bọ̀, draw kan náà ń dé ní {f9river}, Call náà sì yẹ.",
    "matchH2": "Ìfigagbága ṣáájú flop",
    "matchP": "Bí ọwọ́ ìbẹ̀rẹ̀ méjì ṣe ń ṣe sí ara wọn nígbà tí a bá pín gbogbo káàdì board márùn-ún, tí a kà lórí ọ̀kọ̀ọ̀kan nínú board {boards} tí ó ṣeé ṣe. Àwọ̀ káàdì ṣe pàtàkì díẹ̀: àwọn ọwọ́ ìsàlẹ̀ kò ní àwọ̀ kan náà àyàfi tí a bá fi hàn bí suited.",
    "matchCols": [
      "Ọwọ́",
      "Lòdì sí",
      "Ń borí",
      "Ọ̀mì",
      "Ń pàdánù"
    ],
    "startH2": "Àǹfààní ọwọ́ ìbẹ̀rẹ̀",
    "startP": "Ọwọ́ ìbẹ̀rẹ̀ olókàdì méjì {combos} ló yàtọ̀ síra. Bí wọ́n ṣe ń pín in fún ọ tó:",
    "startCols": [
      "Ọwọ́",
      "Àǹfààní",
      "Ní nǹkan bí ọwọ́ kan nínú"
    ],
    "starting": {
      "specificPair": "Pocket pair kan pàtó, bí Ace méjì",
      "anyPair": "Pocket pair èyíkéyìí",
      "specificNonPair": "Ọwọ́ kan pàtó tí kì í ṣe pair, bí Ace-Ọba",
      "specificSuited": "Ọwọ́ suited kan pàtó, bí Ace-Ọba suited",
      "anySuited": "Káàdì méjì èyíkéyìí tí àwọ̀ wọn jẹ́ ọ̀kan",
      "twoBroadway": "Káàdì méjì láti mẹ́wàá sókè"
    },
    "faqH2": "Ìbéèrè",
    "faq": [
      [
        "Kí ni outs nínú poker?",
        "Àwọn káàdì tí ó kù nínú àkójọ káàdì tí yóò fún ọ ní ọwọ́ tó dára jù. Ka káàdì tí o kò tíì rí nìkan: 47 lórí flop, 46 lórí turn."
      ],
      [
        "Ìgbà mélòó ni pocket Ace ń borí Ọba?",
        "Ní nǹkan bí ìgbà mẹ́rin nínú márùn-ún: {aakk} nígbà tí a bá pín gbogbo káàdì board márùn-ún, Ọba sì ń borí ní {kkaa}."
      ],
      [
        "Ṣé Ace-Ọba lòdì sí pair dà bí ju owó sókè?",
        "Ó fẹ́rẹ̀ẹ́ bẹ́ẹ̀, lòdì sí pair àárín: pair Ayaba ń borí {qqak} lòdì sí Ace-Ọba. Lòdì sí pair kékeré, ó tún sún mọ́ra jù — pair 2 ń borí {22ak}."
      ],
      [
        "Kí ni pot odds?",
        "Iye owó Call kan ní ìfiwéra pẹ̀lú pot tí o lè borí. Bí àǹfààní rẹ láti borí bá ga ju ìpín pot ìkẹyìn tí o fi sínú rẹ̀, ṣíṣe Call máa ń lérè bí àkókò ti ń lọ."
      ],
      [
        "Ṣé PokerTH ń fi àǹfààní mi hàn nígbà eré?",
        "Bẹ́ẹ̀ ni. Táàbù Àǹfààní ń sọ ọwọ́ rẹ tó dára jù lọ́wọ́lọ́wọ́ àti àǹfààní rẹ láti borí bí àwọn káàdì ṣe ń jáde, kí o lè ṣàyẹ̀wò èrò tìrẹ ní tábìlì."
      ]
    ]
  },
  zh: {
    "title": "扑克概率表 — 补牌、底池赔率、起手牌对决 | PokerTH",
    "desc": "精确计算的 Texas Hold’em 概率：补牌及其击中几率、2 和 4 法则、底池赔率，以及 AA 胜 KK、QQ 胜 AK 的频率。",
    "ldHeadline": "扑克概率：补牌、底池赔率与翻牌前对决",
    "ldDesc": "精确计算的 Texas Hold’em 概率：补牌、2 和 4 法则、底池赔率与翻牌前对决。",
    "h1": "扑克概率：补牌、底池赔率与翻牌前对决",
    "lead": "好的扑克决策取决于几个数字：你的牌有多大可能变好，你要付出多少才能知道结果，以及两手牌在翻牌前孰强孰弱。本页的每一个数字都是精确计算得出的，而不是从图表里抄来的。",
    "calc": {
      "h2": "扑克胜率计算器",
      "intro": "选择你的两张底牌；如果愿意，也可以选择公共牌和一名对手的手牌。计算器会发完所有剩余的牌——能精确计算时就精确计算，否则用模拟——并显示你获胜的频率。",
      "you": "你的手牌",
      "board": "公共牌",
      "opp": "对手（可选）",
      "players": "对手",
      "pick": "点击一张牌，把它放入高亮的位置；点击一个位置可将其清空。",
      "clear": "清除",
      "win": "胜",
      "tie": "平",
      "lose": "负",
      "exact": "精确：全部 {n} 种可能的发牌。",
      "sim": "模拟 {n} 次随机发牌。",
      "working": "计算中…",
      "need": "选择你的两张牌即可查看胜率。",
      "boardHint": "公共牌先放三张（翻牌），然后四张，然后五张。",
      "oppHint": "选择对手的两张牌，或者一张都不选。",
      "final": "你的最终牌型",
      "noscript": "计算器需要 JavaScript。下面的表格无需它也能查看。"
    },
    "outsH2": "补牌：你的击中几率",
    "outsP": "补牌是牌堆里还剩下、能让你的牌成为可能赢家的牌。翻牌圈有 47 张牌未见：有 9 张补牌时，转牌击中的几率为 {f9turn}，而到河牌为止——还有两张牌要发——为 {f9river}。",
    "outsCols": [
      "听牌",
      "补牌",
      "转牌",
      "河牌（从转牌起）",
      "转牌或河牌（从翻牌起）"
    ],
    "draws": {
      "gutshot": "卡顺听牌（gutshot）",
      "twoPairFull": "两对听葫芦",
      "pairTrips": "一对听两对或三条",
      "twoOver": "两张高张听一对",
      "setFull": "暗三条听葫芦或四条",
      "oesd": "两头顺听牌",
      "flush": "同花听牌",
      "flushGut": "同花听牌加卡顺",
      "flushOesd": "同花听牌加两头顺"
    },
    "outsNote": "这些是击中任意一张补牌的几率。其中不包括 runner-runner（后门）带来的额外机会；而一张同时让对手成更大牌的补牌，并不算真正的补牌。",
    "ruleH2": "2 和 4 法则",
    "ruleP": "牌桌上的快速估算：在翻牌圈，如果你能看到转牌和河牌，就把补牌数乘以 4；只剩一张牌要发时乘以 2。翻牌圈的同花听牌是 9 × 4 = 36%，而精确值是 {f9river}。这条法则会高估大听牌：15 张补牌估算为 60%，实际数字是 {f15river}。",
    "potH2": "底池赔率：该不该跟注？",
    "potP": "底池赔率比较的是你要付出的和你能赢得的。底池有 100，对手下注 50：你跟注 50 去赢一个 200 的底池，所以这次跟注需要在超过 50 ÷ 200 = 25% 的情况下获胜才划算。拿着同花听牌、只剩一张牌要发时，你的击中几率是 {f9one}，所以只剩河牌时跟注一个下注，长期来看会输掉筹码。如果在翻牌圈全下，两张牌都还要发，同样的听牌击中几率为 {f9river}，这时跟注就值得。",
    "matchH2": "翻牌前对决",
    "matchP": "两手起手牌在五张公共牌全部发出时的对抗结果，基于全部 {boards} 种可能的公共牌组合统计。花色有一点影响：除非标为同花，下列手牌之间没有相同花色。",
    "matchCols": [
      "手牌",
      "对阵",
      "胜",
      "平",
      "负"
    ],
    "startH2": "起手牌概率",
    "startP": "两张牌的起手牌共有 {combos} 种不同组合。拿到下列起手牌的频率：",
    "startCols": [
      "手牌",
      "几率",
      "约每多少手一次"
    ],
    "starting": {
      "specificPair": "某一特定口袋对，例如一对 A",
      "anyPair": "任意口袋对",
      "specificNonPair": "某一特定非对子手牌，例如 A-K",
      "specificSuited": "某一特定同花手牌，例如同花 A-K",
      "anySuited": "任意两张同花牌",
      "twoBroadway": "两张 10 或更大的牌"
    },
    "faqH2": "常见问题",
    "faq": [
      [
        "扑克中的补牌是什么？",
        "牌堆里剩下的、能让你拿到最大牌的那些牌。只数你没见过的牌：翻牌圈 47 张，转牌圈 46 张。"
      ],
      [
        "口袋 A 打败口袋 K 的频率有多高？",
        "大约五次赢四次：五张公共牌全部发出时为 {aakk}，K 获胜的几率为 {kkaa}。"
      ],
      [
        "AK 对一个对子是五五开吗？",
        "对中等对子时接近：QQ 对 AK 的胜率是 {qqak}。对小对子则更接近——22 的胜率是 {22ak}。"
      ],
      [
        "什么是底池赔率？",
        "跟注的代价与你可能赢得的底池之比。如果你的获胜几率高于你投入的部分在最终底池中所占的比例，长期来看跟注就是划算的。"
      ],
      [
        "PokerTH 在游戏中会显示我的胜率吗？",
        "会。「胜率」标签页会随着牌发出，标明你当前的最佳牌型和获胜几率，让你可以在牌桌上检验自己的判断。"
      ]
    ]
  },
  "zh-HK": {
    "title": "撲克機率表 — 補牌 outs、底池賠率、手牌對決 | PokerTH",
    "desc": "精確計算的 Texas Hold’em 德州撲克機率：補牌（outs）及你中牌的機會、2 與 4 法則、底池賠率，以及 AA 贏 KK、QQ 贏 AK 的頻率。",
    "ldHeadline": "撲克機率：補牌、底池賠率與翻牌前對決",
    "ldDesc": "精確計算的 Texas Hold’em 機率：補牌、2 與 4 法則、底池賠率及翻牌前對決。",
    "h1": "撲克機率：補牌、底池賠率與翻牌前對決",
    "lead": "好的撲克決定歸根結底取決於幾個數字：你的牌有多大機會變強、要付多少才能知道結果，以及翻牌前兩手牌對陣時誰佔上風。本頁每個數字都是精確計算出來的，而不是從圖表抄來的。",
    "calc": {
      "h2": "撲克機率計算器",
      "intro": "揀選你的兩張底牌，如有需要，再加上公共牌和一位對手的手牌。計算器會發出所有剩餘的牌——能精確計算時就精確計算，否則以模擬方式——並顯示你獲勝的頻率。",
      "you": "你的手牌",
      "board": "公共牌",
      "opp": "對手（可選）",
      "players": "對手人數",
      "pick": "點按一張牌放入高亮的位置；點按位置可將其清空。",
      "clear": "清除",
      "win": "勝",
      "tie": "和",
      "lose": "負",
      "exact": "精確：涵蓋全部 {n} 種可能的發牌。",
      "sim": "模擬 {n} 次隨機發牌。",
      "working": "計算中…",
      "need": "揀選你的兩張底牌以查看機率。",
      "boardHint": "公共牌先放三張（翻牌），然後四張，再到五張。",
      "oppHint": "揀選對手的兩張牌，或一張都不選。",
      "final": "你的最終牌型",
      "noscript": "計算器需要 JavaScript。下面的表格毋須 JavaScript 亦可使用。"
    },
    "outsH2": "補牌：你中牌的機會",
    "outsP": "補牌（out）是指仍在牌堆中、能令你的牌成為大熱贏家的牌。在翻牌圈有 47 張牌未見：有 9 張補牌時，轉牌中牌的機會是 {f9turn}，而到河牌為止——還有兩張牌要發——是 {f9river}。",
    "outsCols": [
      "聽牌",
      "補牌",
      "轉牌",
      "河牌（由轉牌起）",
      "轉牌或河牌（由翻牌起）"
    ],
    "draws": {
      "gutshot": "卡順聽牌（gutshot）",
      "twoPairFull": "兩對聽葫蘆",
      "pairTrips": "一對聽兩對或三條",
      "twoOver": "兩張高張聽一對",
      "setFull": "暗三條聽葫蘆或四條",
      "oesd": "兩頭順聽牌",
      "flush": "同花聽牌",
      "flushGut": "同花聽牌加卡順",
      "flushOesd": "同花聽牌加兩頭順"
    },
    "outsNote": "以上是中任何一張補牌的機率，並不包括後門（runner-runner）的額外機會；而一張同時令對手拿到更大牌的補牌，其實並不算真正的補牌。",
    "ruleH2": "2 與 4 法則",
    "ruleP": "牌桌上的快速估算：在翻牌圈，若會看到轉牌和河牌，把補牌數乘以 4；若只剩一張牌要發，則乘以 2。翻牌圈的同花聽牌約為 9 × 4 = 36%，而精確數字是 {f9river}。這條法則會高估大聽牌：15 張補牌得出 60%，實際數字是 {f15river}。",
    "potH2": "底池賠率：應否跟注？",
    "potP": "底池賠率比較你要付出的和你可以贏得的。底池有 100，對手下注 50：你跟注 50 去爭奪 200 的底池，所以跟注要有超過 50 ÷ 200 = 25% 的勝率才划算。拿著同花聽牌、只剩一張牌要發時，你中牌的機會是 {f9one}，因此只剩河牌時跟注一個下注，長遠來說會輸籌碼。若在翻牌圈全下、兩張牌都還要發，同一個聽牌的中牌機會是 {f9river}，這時跟注就值得。",
    "matchH2": "翻牌前對決",
    "matchP": "兩手起手牌在五張公共牌全部發出時的對戰結果，以全部 {boards} 種可能的公共牌組合計算。花色有少許影響：除非標明同花，下面的手牌之間沒有共同花色。",
    "matchCols": [
      "手牌",
      "對手",
      "勝",
      "和",
      "負"
    ],
    "startH2": "起手牌機率",
    "startP": "兩張牌的起手牌共有 {combos} 種。你拿到以下起手牌的頻率：",
    "startCols": [
      "手牌",
      "機率",
      "約每多少手一次"
    ],
    "starting": {
      "specificPair": "某一特定口袋對，例如一對 A",
      "anyPair": "任何口袋對",
      "specificNonPair": "某一特定非對子手牌，例如 AK",
      "specificSuited": "某一特定同花手牌，例如同花 AK",
      "anySuited": "任何兩張同花牌",
      "twoBroadway": "兩張 10 或以上的牌"
    },
    "faqH2": "問題",
    "faq": [
      [
        "撲克中的補牌（outs）是甚麼？",
        "牌堆中剩下、能讓你拿到最好牌型的牌。只計算你未見過的牌：翻牌圈 47 張，轉牌圈 46 張。"
      ],
      [
        "一對 A 對一對 K 有多常贏？",
        "大約五次贏四次：五張公共牌全部發出時是 {aakk}，一對 K 則贏 {kkaa}。"
      ],
      [
        "AK 對一對是否等於拋硬幣？",
        "差不多，對中等對子時：一對 Q 對 AK 的勝率是 {qqak}。對小對子時更接近——一對 2 贏 {22ak}。"
      ],
      [
        "甚麼是底池賠率？",
        "跟注的價錢與你可以贏得的底池之比。如果你的勝率高於你投入的部分佔最終底池的比例，長遠來說跟注是划算的。"
      ],
      [
        "PokerTH 在遊戲中會顯示我的機率嗎？",
        "會。「勝率」分頁會隨著牌逐張發出，標明你目前的最佳牌型和獲勝機率，讓你在牌桌上驗證自己的判斷。"
      ]
    ]
  },
  "zh-TW": {
    "title": "撲克機率表 — 補牌（outs）、底池賠率、手牌對決 | PokerTH",
    "desc": "精確計算的 Texas Hold’em 機率：補牌（outs）與擊中機率、2 與 4 法則、底池賠率，以及 AA 贏 KK、QQ 贏 AK 的頻率。",
    "ldHeadline": "撲克機率：補牌、底池賠率與翻牌前對決",
    "ldDesc": "精確計算的 Texas Hold’em 機率：補牌、2 與 4 法則、底池賠率與翻牌前對決。",
    "h1": "撲克機率：補牌、底池賠率與翻牌前對決",
    "lead": "好的撲克決策歸結為幾個數字：你的牌變強的可能性有多大、要付多少才能知道，以及翻牌前兩手牌誰強誰弱。本頁每個數字都是精確計算出來的，而不是從表格抄來的。",
    "calc": {
      "h2": "撲克勝率計算器",
      "intro": "選出你的兩張底牌，也可以再選公共牌和一位對手的手牌。計算器會發完所有剩餘的牌——能精確列舉時就精確列舉，否則用模擬——並顯示你獲勝的頻率。",
      "you": "你的手牌",
      "board": "公共牌",
      "opp": "對手（選填）",
      "players": "對手人數",
      "pick": "點一張牌，把它放進標示的位置；點一個位置可將它清空。",
      "clear": "清除",
      "win": "勝",
      "tie": "平手",
      "lose": "負",
      "exact": "精確：全部 {n} 種可能的發牌。",
      "sim": "隨機模擬 {n} 次發牌。",
      "working": "計算中…",
      "need": "選出你的兩張牌即可看到勝率。",
      "boardHint": "公共牌先放三張（翻牌），再放第四張、第五張。",
      "oppHint": "對手的兩張牌要全選，或都不選。",
      "final": "你的最終牌型",
      "noscript": "計算器需要 JavaScript。下方的表格不需要也能使用。"
    },
    "outsH2": "補牌（outs）：你的擊中機率",
    "outsP": "補牌是牌堆裡還剩下、能讓你的牌成為可能贏家的牌。翻牌時有 47 張牌未見：有 9 張補牌時，轉牌一張就擊中的機率是 {f9turn}，而到河牌為止——還有兩張牌要發——是 {f9river}。",
    "outsCols": [
      "聽牌",
      "補牌",
      "轉牌",
      "河牌（從轉牌起）",
      "轉牌或河牌（從翻牌起）"
    ],
    "draws": {
      "gutshot": "卡順聽牌（gutshot）",
      "twoPairFull": "兩對聽葫蘆",
      "pairTrips": "一對聽兩對或三條",
      "twoOver": "兩張高張聽一對",
      "setFull": "暗三條聽葫蘆或四條",
      "oesd": "兩頭順聽牌",
      "flush": "同花聽牌",
      "flushGut": "同花聽牌加卡順",
      "flushOesd": "同花聽牌加兩頭順"
    },
    "outsNote": "以上是擊中任一張補牌的機率。不計入 runner-runner（連續兩張）的額外機會；而同時也讓對手成更大牌的補牌，並不是真正的補牌。",
    "ruleH2": "2 與 4 法則",
    "ruleP": "牌桌上的快速估算：在翻牌時，若你會看到轉牌和河牌，就把補牌數乘以 4；只剩一張牌時乘以 2。翻牌時的同花聽牌是 9 × 4 = 36%，精確值則是 {f9river}。這個法則會高估大聽牌：15 張補牌估得 60%，實際是 {f15river}。",
    "potH2": "底池賠率：該不該跟注？",
    "potP": "底池賠率比較你必須付出的與你能贏到的。底池有 100，對手下注 50：你跟注 50 去贏一個 200 的底池，所以這個 Call 必須有超過 50 ÷ 200 = 25% 的時候獲勝才划算。同花聽牌只剩一張牌時，你擊中的機率是 {f9one}，因此只剩河牌時去跟一筆下注，長期下來會輸籌碼。若在翻牌時 All-In、兩張牌都還要發，同樣的聽牌擊中機率是 {f9river}，這時跟注就值得。",
    "matchH2": "翻牌前對決",
    "matchP": "兩手起手牌在五張公共牌全部發出時的對戰結果，涵蓋全部 {boards} 種可能的公共牌。花色有一點影響：除非標示為同花，下表中的兩手牌沒有共同花色。",
    "matchCols": [
      "手牌",
      "對手",
      "勝",
      "平手",
      "負"
    ],
    "startH2": "起手牌機率",
    "startP": "兩張牌的起手牌共有 {combos} 種。拿到以下牌的頻率：",
    "startCols": [
      "手牌",
      "機率",
      "約每幾手一次"
    ],
    "starting": {
      "specificPair": "某一特定口袋對，例如一對 A",
      "anyPair": "任意口袋對",
      "specificNonPair": "某一特定非對子手牌，例如 AK",
      "specificSuited": "某一特定同花手牌，例如同花 AK",
      "anySuited": "任意兩張同花牌",
      "twoBroadway": "兩張都是 10 以上"
    },
    "faqH2": "常見問題",
    "faq": [
      [
        "撲克裡的補牌（outs）是什麼？",
        "牌堆裡剩下、能讓你拿到最大牌的那些牌。只計算你沒看過的牌：翻牌時 47 張，轉牌時 46 張。"
      ],
      [
        "口袋 A 贏口袋 K 的頻率有多高？",
        "大約五次贏四次：五張公共牌全部發完時為 {aakk}，K 獲勝的機率是 {kkaa}。"
      ],
      [
        "AK 對上一對是擲硬幣嗎？",
        "對上中等對子時差不多：一對 Q 對 AK 的勝率是 {qqak}。對上小對子時更接近——一對 2 的勝率是 {22ak}。"
      ],
      [
        "什麼是底池賠率？",
        "跟注的價格與你能贏的底池之比。若你的獲勝機率高於你投入的部分在最終底池中所占的比例，長期而言跟注是划算的。"
      ],
      [
        "PokerTH 在牌局中會顯示我的勝率嗎？",
        "會。「勝率」分頁會隨著發牌標明你目前的最佳牌型和獲勝機率，讓你在牌桌上驗證自己的判斷。"
      ]
    ]
  },
  zu: {
    "title": "Amathuba e-poker — ama-outs, ama-pot odds, ukubhekana | PokerTH",
    "desc": "Amathuba e-Texas Hold’em abalwe ngqo: ama-outs nethuba lakho lokuwathola, umthetho we-2 no-4, ama-pot odds, nokuthi kangaki i-AA ishaya i-KK noma i-QQ ishaya i-AK.",
    "ldHeadline": "Amathuba e-poker: ama-outs, ama-pot odds nokubhekana ngaphambi kwe-flop",
    "ldDesc": "Amathuba e-Texas Hold’em abalwe ngqo: ama-outs, umthetho we-2 no-4, ama-pot odds nokubhekana kwezandla ngaphambi kwe-flop.",
    "h1": "Amathuba e-poker: ama-outs, ama-pot odds nokubhekana ngaphambi kwe-flop",
    "lead": "Izinqumo ezinhle ze-poker zincike ezinombolweni ezimbalwa: ukuthi kungenzeka kangakanani ukuthi isandla sakho sithuthuke, ukuthi kufanele ukhokhe malini ukuze ukuthole lokho, nokuthi izandla ezimbili zimelana kanjani ngaphambi kwe-flop. Yonke inombolo ekuleli khasi ibalwe ngqo, ayikopishwanga ethebulweni.",
    "calc": {
      "h2": "Isibali samathuba e-poker",
      "intro": "Khetha amakhadi akho amabili futhi, uma uthanda, i-board nesandla sombangi. Isibali sabela wonke amakhadi asele — ngqo noma nini lapho kungenzeka, ngokulingisa uma kungenjalo — bese sibonisa ukuthi kangaki uwina.",
      "you": "Isandla sakho",
      "board": "I-board",
      "opp": "Umbangi (ongakukhetha)",
      "players": "Ababangi",
      "pick": "Thepha ikhadi ukulibeka endaweni egqanyisiwe; thepha indawo ukuyikhulula.",
      "clear": "Sula",
      "win": "Ukuwina",
      "tie": "Ukulingana",
      "lose": "Ukuhlulwa",
      "exact": "Ngqo: konke ukwaba okungu-{n} okungenzeka.",
      "sim": "Ukulingisa kokwaba okungahleliwe okungu-{n}.",
      "working": "Iyabala…",
      "need": "Khetha amakhadi akho amabili ukuze ubone amathuba akho.",
      "boardHint": "I-board ithatha amakhadi amathathu (i-flop), bese amane, bese amahlanu.",
      "oppHint": "Khetha womabili amakhadi ombangi wakho, noma ungakhethi nelilodwa.",
      "final": "Isandla sakho sokugcina",
      "noscript": "Isibali sidinga i-JavaScript. Amathebula angezansi asebenza ngaphandle kwayo."
    },
    "outsH2": "Ama-outs: ithuba lakho lokuthola",
    "outsP": "I-out yikhadi elisekhona emakhadini elenza isandla sakho sibe yisona okungenzeka siwine. Ku-flop, amakhadi angu-47 awakabonwa: ngama-outs angu-9, ikhadi elilodwa liyafika ku-turn ngo-{f9turn} wezikhathi, kuthi kuze kube ku-river — kusasele amakhadi amabili — ngo-{f9river}.",
    "outsCols": [
      "I-draw",
      "Ama-outs",
      "I-turn",
      "I-river (kusukela ku-turn)",
      "I-turn noma i-river (kusukela ku-flop)"
    ],
    "draws": {
      "gutshot": "I-straight draw yangaphakathi (i-gutshot)",
      "twoPairFull": "I-Two Pair iye ku-Full House",
      "pairTrips": "I-One Pair iye ku-Two Pair noma ku-Three of a Kind",
      "twoOver": "Ama-overcard amabili aye ku-One Pair",
      "setFull": "I-set iye ku-Full House noma ku-Four of a Kind",
      "oesd": "I-straight draw evulekile nhlangothi zombili",
      "flush": "I-flush draw",
      "flushGut": "I-flush draw ne-gutshot",
      "flushOesd": "I-flush draw ne-straight draw evulekile nhlangothi zombili"
    },
    "outsNote": "La amathuba okuthola enye yama-outs akho. Awabandakanyi okwengeziwe kwamakhadi amabili alandelanayo (i-runner-runner), futhi i-out enikeza nombangi isandla esingcono empeleni akuyona i-out.",
    "ruleH2": "Umthetho we-2 no-4",
    "ruleP": "Isilinganiso esisheshayo etafuleni: phindaphinda ama-outs akho ngo-4 ku-flop lapho uzobona kokubili i-turn ne-river, nango-2 lapho kusele ikhadi elilodwa kuphela. I-flush draw ku-flop ingu-9 × 4 = 36%, kanti ngqo ingu-{f9river}. Umthetho ulinganisela ngaphezulu ama-draw amakhulu: ama-outs angu-15 anikeza u-60%, kanti inombolo yangempela ingu-{f15river}.",
    "potH2": "Ama-pot odds: ingabe kufanele wenze i-call?",
    "potP": "Ama-pot odds aqhathanisa okumele ukukhokhe nalokho ongakuwina. I-pot inokungu-100 futhi umbangi wakho ubheja ngo-50: wenza i-call ngo-50 ukuze uwine i-pot engu-200, ngakho i-call kufanele iwine ngaphezu kuka-50 ÷ 200 = 25% wezikhathi ukuze ikhokhe. Nge-flush draw nekhadi elilodwa elisazayo, uthola ngo-{f9one} wezikhathi, ngakho ukwenza i-call ekubhejeni lapho kusele i-river kuphela kulahlekisa ama-chip ngokuhamba kwesikhathi. Uma kuyi-All-In ku-flop, kusasele womabili amakhadi, i-draw efanayo ifika ngo-{f9river}, futhi i-call iyakufanele.",
    "matchH2": "Ukubhekana ngaphambi kwe-flop",
    "matchP": "Ukuthi izandla ezimbili zokuqala zenza kanjani uma zibhekene lapho wonke amakhadi amahlanu e-board esabiwe, kubalwe kuwo wonke ama-board angu-{boards} angenzeka. Imibala inomthelela omncane: izandla ezingezansi azabelani ngombala ngaphandle uma kuboniswe ukuthi zinombala ofanayo.",
    "matchCols": [
      "Isandla",
      "Ngokumelene",
      "Iyawina",
      "Ukulingana",
      "Iyahlulwa"
    ],
    "startH2": "Amathuba ezandla zokuqala",
    "startP": "Kunezandla zokuqala ezingu-{combos} ezahlukene zamakhadi amabili. Kangaki uthola:",
    "startCols": [
      "Isandla",
      "Ithuba",
      "Cishe kanye ezandleni"
    ],
    "starting": {
      "specificPair": "I-pair yephakethe ethile, njengama-ace",
      "anyPair": "Noma iyiphi i-pair yephakethe",
      "specificNonPair": "Isandla esithile esingenayo i-pair, njenge-ace-king",
      "specificSuited": "Isandla esithile esinombala ofanayo, njenge-ace-king enombala ofanayo",
      "anySuited": "Noma imaphi amakhadi amabili anombala ofanayo",
      "twoBroadway": "Amakhadi amabili ayishumi noma ngaphezulu"
    },
    "faqH2": "Imibuzo",
    "faq": [
      [
        "Yini ama-outs ku-poker?",
        "Amakhadi asele emakhadini angakunika isandla esingcono kakhulu. Bala kuphela amakhadi ongakawaboni: angu-47 ku-flop, angu-46 ku-turn."
      ],
      [
        "Kangaki ama-ace ephakethe eshaya ama-king?",
        "Cishe kane kokuhlanu: {aakk} uma wonke amakhadi amahlanu e-board esabiwe, kanti ama-king awina {kkaa}."
      ],
      [
        "Ingabe i-ace-king ibhekene ne-pair iwukuphonsa uhlamvu lwemali?",
        "Cishe, uma ibhekene ne-pair ephakathi: ama-queen awina {qqak} ngokumelene ne-ace-king. Ngokumelene ne-pair encane kusondelene nakakhulu — ama-two awina {22ak}."
      ],
      [
        "Yini ama-pot odds?",
        "Intengo ye-call uma iqhathaniswa ne-pot ongayiwina. Uma ithuba lakho lokuwina liphakeme kunengxenye ye-pot yokugcina oyifakayo, ukwenza i-call kuyakhokha ngokuhamba kwesikhathi."
      ],
      [
        "Ingabe i-PokerTH ibonisa amathuba ami ngesikhathi somdlalo?",
        "Yebo. Ithebhu elithi Amathuba liqamba isandla sakho esingcono kakhulu samanje kanye nethuba lakho lokuwina njengoba amakhadi evezwa, ukuze ukwazi ukuhlola imicabango yakho etafuleni."
      ]
    ]
  }
};
