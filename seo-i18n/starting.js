'use strict';
// Translations for the /starting-hands page (the 169 starting hands, charted
// and ranked).
//
// English lives in proxy.js (_SEO_START) and is the fallback; a language is
// advertised (hreflang, sitemap, nav link, IndexNow) the moment its entry
// lands here, never before. Same keys as _SEO_START. Numbers are never written
// here: the text keeps the {placeholders} of the English, filled at render
// time from seo-i18n/starting-hands.json in the reader's number format. Hand
// names (AKs, T9o…) stay in the international notation.
module.exports = {
  af: {
    "title": "Pokerbeginhande-tabel — al 169 hande gerangskik | PokerTH",
    "desc": "Al 169 Texas Hold’em-beginhande in een tabel, gerangskik volgens hul kans om teen een, drie en ses teenstanders te wen. Dieselfde kleur of nie, pare en die swakste hand.",
    "ldHeadline": "Texas Hold’em-beginhande-tabel: al 169 hande gerangskik",
    "ldDesc": "Die 169 Texas Hold’em-beginhande in ’n tabel, gerangskik volgens hul kans om teen een, drie en ses ewekansige hande te wen.",
    "h1": "Texas Hold’em-beginhande: al 169, gerangskik",
    "lead": "Jou twee toe kaarte is die eerste besluit van elke hand. Daar is {combos} maniere om twee kaarte uitgedeel te kry, maar net 169 verskillende beginhande as die kleure buite rekening gelaat word. Hierdie bladsy wys hulle almal in ’n tabel met hul kans om te wen, bereken deur vir elkeen ’n miljoen uitdelings te simuleer.",
    "chartH2": "Die beginhande-tabel",
    "chartP": "Die pare loop met die hoeklyn af. Daarbo is die hande van dieselfde kleur (s, albei kaarte van dieselfde kleur), daaronder die hande van verskillende kleure (o). T staan vir tien. Die getal in elke blokkie is die kans dat die hand teen een ewekansige hand wen as al vyf tafelkaarte uitgedeel word, met gelykop as ’n halwe oorwinning getel; hoe groener die blokkie, hoe sterker die hand.",
    "topH2": "Die beste beginhande",
    "topP": "Die twintig sterkste hande teen een teenstander, en hoe hulle teen drie en ses vaar:",
    "cols": [
      "Rang",
      "Hand",
      "1 teenstander",
      "3 teenstanders",
      "6 teenstanders"
    ],
    "multiH2": "Meer teenstanders, ander hande",
    "multiP": "Elke hand wen minder dikwels namate spelers by die pot aansluit, maar nie teen dieselfde tempo nie, so die rangorde verander. ’n Paar aase bly bo: {aa1} een teen een, steeds {aa6} teen ses teenstanders. Opeenvolgende kaarte van dieselfde kleur klim, want hulle maak straights en flushes wat groot potte wen: sewe-ses van dieselfde kleur gaan van rang {r76s1} een teen een na rang {r76s6} teen ses, boer-tien van dieselfde kleur van {rjts1} na {rjts6}. Middelpare daal — sewes val van rang {r77_1} na {r77_6} — en so ook hande van verskillende kleure met een hoë kaart en ’n swak kicker, soos heer-ses van verskillende kleure, van {rk6o1} na {rk6o6}.",
    "suitedH2": "Dieselfde kleur of verskillende kleure?",
    "suitedP": "Twee kaarte van dieselfde kleur is meer werd as dieselfde kaarte van verskillende kleure — gemiddeld ongeveer {suitGain} meer oor al 78 kombinasies van twee waardes, van {suitMin} tot {suitMax} na gelang van die hand. Dit maak saak, maar minder as wat dit lyk: flushes is skaars, en ’n swak hand van dieselfde kleur is steeds ’n swak hand.",
    "worstH2": "Die swakste beginhand",
    "worstP": "Teen een ewekansige hand is drie-twee van verskillende kleure die swakste van almal met {w32}. Sewe-twee van verskillende kleure, dikwels die swakste hand in poker genoem, wen {w72} en is een teen een nommer {r72} uit 169 — maar teen ses teenstanders is dit heel laaste, want sy twee kaarte is te ver uitmekaar om saam ’n straight te maak en te laag om veel anders te wen.",
    "countH2": "Hoe dikwels jy elke soort kry",
    "countP": "Van die {combos} moontlike hande van twee kaarte is {pairCombos} pare ({pairPct}), {suitedCombos} van dieselfde kleur ({suitedPct}) en {offCombos} van verskillende kleure ({offPct}). Elke paar kan op 6 maniere uitgedeel word, elke hand van dieselfde kleur op 4 maniere en elke hand van verskillende kleure op 12 maniere — daarom kry jy aas-heer van verskillende kleure drie keer so dikwels as aas-heer van dieselfde kleur.",
    "useH2": "Hoe om so ’n tabel te gebruik",
    "useP": "’n Tabel rangskik hande volgens rou krag, voordat iemand iets gedoen het. Aan ’n regte tafel speel jy minder hande uit ’n vroeë posisie, waar baie spelers ná jou aan die beurt is, en meer vanaf die knoppie en die cut-off. Maak eerder ’n Raise as ’n Call met die hande wat jy speel, Fold die onderkant van die tabel, en onthou dat ’n hand se waarde ook van die stapels, die blindes en jou teenstanders afhang. In ’n PokerTH-toernooi styg die blindes aanhoudend, so hoe korter die stapels word, hoe meer hande is die moeite werd om te speel.",
    "faqH2": "Vrae",
    "faq": [
      [
        "Wat is die beste beginhand in Texas Hold’em?",
        "’n Paar aase. Hulle wen {aa1} teen een ewekansige hand, en hulle is die gunsteling teen elke ander beginhand."
      ],
      [
        "Is aas-heer beter as ’n paar vroue?",
        "Nee, maar dit is naby: vroue wen {qqak} teen aas-heer van verskillende kleure. Teen een ewekansige hand wen aas-heer van dieselfde kleur {aks1} en vroue {qq1}."
      ],
      [
        "Hoeveel beginhande is daar?",
        "{combos} kombinasies van twee kaarte, wat 169 verskillende beginhande vorm: 13 pare, 78 van dieselfde kleur en 78 van verskillende kleure."
      ],
      [
        "Hoeveel is ’n hand van dieselfde kleur werd?",
        "Gemiddeld ongeveer {suitGain} meer kans om te wen as dieselfde hand van verskillende kleure."
      ],
      [
        "Waar kan ek die keuse van beginhande oefen?",
        "In PokerTH se oefenmodus teen rekenaarteenstanders, met die Kanse-oortjie wat jou kans om te wen wys soos die kaarte uitkom."
      ]
    ]
  },
  am: {
    "title": "የፖከር የመነሻ እጆች ሰንጠረዥ — 169ኙም እጆች በደረጃ | PokerTH",
    "desc": "169ኙም የ Texas Hold’em የመነሻ እጆች በአንድ ሰንጠረዥ፣ ከአንድ፣ ከሦስት እና ከስድስት ተቃዋሚዎች ጋር ባላቸው የማሸነፍ ዕድል የተደረደሩ። ተመሳሳይ ቀለም ወይም የተለያየ ቀለም፣ ጥንዶች እና መጥፎው እጅ።",
    "ldHeadline": "የ Texas Hold’em የመነሻ እጆች ሰንጠረዥ፦ 169ኙም እጆች በደረጃ",
    "ldDesc": "169ኙ የ Texas Hold’em የመነሻ እጆች በሰንጠረዥ፣ ከአንድ፣ ከሦስት እና ከስድስት የዘፈቀደ እጆች ጋር ባላቸው የማሸነፍ ዕድል የተደረደሩ።",
    "h1": "የ Texas Hold’em የመነሻ እጆች፦ 169ኙም በደረጃ",
    "lead": "ሁለቱ ሆል ካርታዎችዎ የእያንዳንዱ እጅ የመጀመሪያ ውሳኔ ናቸው። ሁለት ካርታዎች የሚደርሱበት {combos} መንገዶች አሉ፣ ነገር ግን ቀለሞችን ወደ ጎን ካደረግን 169 የተለያዩ የመነሻ እጆች ብቻ አሉ። ይህ ገጽ ሁሉንም ከማሸነፍ ዕድላቸው ጋር በሰንጠረዥ ያሳያል፤ ዕድሉ ለእያንዳንዱ እጅ አንድ ሚሊዮን ክፍፍሎችን በማስመሰል የተሰላ ነው።",
    "chartH2": "የመነሻ እጆች ሰንጠረዥ",
    "chartP": "ጥንዶች በሰያፉ መስመር ላይ ይወርዳሉ። ከሱ በላይ ተመሳሳይ ቀለም ያላቸው እጆች (s፣ ሁለቱም ካርታዎች አንድ ቀለም)፣ ከሱ በታች ደግሞ የተለያየ ቀለም ያላቸው እጆች (o) አሉ። T አስርን ያመለክታል። በእያንዳንዱ ካሬ ውስጥ ያለው ቁጥር አምስቱም የቦርድ ካርታዎች ሲከፋፈሉ እጁ ከአንድ የዘፈቀደ እጅ ጋር የሚያሸንፍበት ዕድል ነው፤ እኩል መውጣት እንደ ግማሽ ድል ይቆጠራል። ካሬው ይበልጥ አረንጓዴ በሆነ ቁጥር እጁ የበለጠ ጠንካራ ነው።",
    "topH2": "ምርጦቹ የመነሻ እጆች",
    "topP": "ከአንድ ተቃዋሚ ጋር ሃያዎቹ በጣም ጠንካራ እጆች፣ እና ከሦስት እና ከስድስት ጋር እንዴት እንደሚቋቋሙ፦",
    "cols": [
      "ደረጃ",
      "እጅ",
      "1 ተቃዋሚ",
      "3 ተቃዋሚዎች",
      "6 ተቃዋሚዎች"
    ],
    "multiH2": "ብዙ ተቃዋሚዎች፣ የተለያዩ እጆች",
    "multiP": "ተጫዋቾች ወደ ፖቱ ሲገቡ እያንዳንዱ እጅ የሚያሸንፈው በጥቂት ጊዜ ነው፣ ግን በተመሳሳይ መጠን አይደለም፣ ስለዚህ ደረጃው ይለወጣል። ፖኬት ኤሶች በአናት ይቆያሉ፦ ራስ-ለ-ራስ {aa1}፣ ከስድስት ተቃዋሚዎች ጋርም አሁንም {aa6}። ተመሳሳይ ቀለም ተከታታዮች ከፍ ይላሉ፣ ምክንያቱም ትልልቅ ፖቶችን የሚያሸንፉ straight እና flush ይሠራሉ፦ ተመሳሳይ ቀለም ሰባት-ስድስት ራስ-ለ-ራስ ከደረጃ {r76s1} ከስድስት ጋር ወደ ደረጃ {r76s6}፣ ተመሳሳይ ቀለም ጃክ-አስር ከ{rjts1} ወደ {rjts6} ይሸጋገራሉ። መካከለኛ ጥንዶች ይወርዳሉ — ሰባቶች ከደረጃ {r77_1} ወደ {r77_6} ይወድቃሉ — እንዲሁም አንድ ከፍተኛ ካርታ እና ደካማ ኪከር ያላቸው የተለያየ ቀለም እጆች፣ ለምሳሌ የተለያየ ቀለም ኪንግ-ስድስት፣ ከ{rk6o1} ወደ {rk6o6}።",
    "suitedH2": "ተመሳሳይ ቀለም ወይስ የተለያየ ቀለም?",
    "suitedP": "አንድ ቀለም ያላቸው ሁለት ካርታዎች ከተመሳሳዮቹ የተለያየ ቀለም ካርታዎች የበለጠ ዋጋ አላቸው — በ78ቱም የደረጃ ጥንዶች ላይ በአማካይ {suitGain} ገደማ ብልጫ፣ እንደ እጁ ከ{suitMin} እስከ {suitMax}። ይህ ጠቃሚ ነው፣ ግን ከሚመስለው ያነሰ፦ flush እምብዛም አይመጣም፣ እና ደካማ ተመሳሳይ ቀለም እጅ አሁንም ደካማ እጅ ነው።",
    "worstH2": "መጥፎው የመነሻ እጅ",
    "worstP": "ከአንድ የዘፈቀደ እጅ ጋር፣ የተለያየ ቀለም ሦስት-ሁለት በ{w32} ከሁሉም ደካማው ነው። ብዙ ጊዜ በፖከር ውስጥ መጥፎው እጅ ተብሎ የሚጠራው የተለያየ ቀለም ሰባት-ሁለት {w72} ያሸንፋል እና ራስ-ለ-ራስ ከ169 ውስጥ {r72}ኛ ደረጃ ላይ ነው — ከስድስት ተቃዋሚዎች ጋር ግን ፍጹም የመጨረሻው ነው፣ ምክንያቱም ሁለቱ ካርታዎቹ አንድ ላይ straight ለመሥራት በጣም የተራራቁ ናቸው፣ ሌላ ብዙ ነገር ለማሸነፍም በጣም ዝቅተኛ ናቸው።",
    "countH2": "እያንዳንዱ ዓይነት ምን ያህል ጊዜ እንደሚደርስዎ",
    "countP": "ሊሆኑ ከሚችሉት {combos} ባለ ሁለት ካርታ እጆች ውስጥ {pairCombos} ጥንዶች ({pairPct})፣ {suitedCombos} ተመሳሳይ ቀለም ({suitedPct}) እና {offCombos} የተለያየ ቀለም ({offPct}) ናቸው። እያንዳንዱ ጥንድ በ6 መንገዶች፣ እያንዳንዱ ተመሳሳይ ቀለም እጅ በ4 መንገዶች፣ እያንዳንዱ የተለያየ ቀለም እጅ በ12 መንገዶች ሊከፋፈል ይችላል — ለዚህ ነው የተለያየ ቀለም ኤስ-ኪንግን ከተመሳሳይ ቀለም ኤስ-ኪንግ ሦስት እጥፍ ደጋግመው የሚያዩት።",
    "useH2": "እንደዚህ ያለ ሰንጠረዥን እንዴት መጠቀም እንደሚቻል",
    "useP": "ሰንጠረዡ ማንም እርምጃ ከመውሰዱ በፊት እጆችን በጥሬ ጥንካሬያቸው ይደረድራል። በእውነተኛ ጠረጴዛ ላይ፣ ብዙ ተጫዋቾች ከእርስዎ በኋላ በሚንቀሳቀሱበት የመጀመሪያ ቦታ ጥቂት እጆችን ይጫወቱ፣ ከአዝራሩ እና ከ cut-off ደግሞ ብዙ። በሚጫወቷቸው እጆች Call ከማድረግ ይልቅ Raise ያድርጉ፣ የሰንጠረዡን ታችኛ ክፍል Fold ያድርጉ፣ እና የአንድ እጅ ዋጋ በስታኮቹ፣ በብላይንዶቹ እና በተቃዋሚዎችዎ ላይም እንደሚወሰን ያስታውሱ። በ PokerTH ውድድር ውስጥ ብላይንዶቹ መጨመራቸውን ይቀጥላሉ፣ ስለዚህ ስታኮች ሲያጥሩ መጫወት የሚገባቸው እጆች ይሰፋሉ።",
    "faqH2": "ጥያቄዎች",
    "faq": [
      [
        "በ Texas Hold’em ውስጥ ምርጡ የመነሻ እጅ ምንድን ነው?",
        "ፖኬት ኤሶች። ከአንድ የዘፈቀደ እጅ ጋር {aa1} ያሸንፋሉ፣ እና ከሌሎቹ የመነሻ እጆች ሁሉ ጋር ተመራጭ ናቸው።"
      ],
      [
        "ኤስ-ኪንግ ከኩዊን ጥንድ ይሻላል?",
        "አይደለም፣ ግን ይቀራረባሉ፦ ኩዊኖች ከተለያየ ቀለም ኤስ-ኪንግ ጋር {qqak} ያሸንፋሉ። ከአንድ የዘፈቀደ እጅ ጋር ተመሳሳይ ቀለም ኤስ-ኪንግ {aks1}፣ ኩዊኖች ደግሞ {qq1} ያሸንፋሉ።"
      ],
      [
        "ስንት የመነሻ እጆች አሉ?",
        "{combos} ባለ ሁለት ካርታ ጥምረቶች፣ እነሱም 169 የተለያዩ የመነሻ እጆችን ይሠራሉ፦ 13 ጥንዶች፣ 78 ተመሳሳይ ቀለም እና 78 የተለያየ ቀለም።"
      ],
      [
        "ተመሳሳይ ቀለም እጅ ምን ያህል ዋጋ አለው?",
        "በአማካይ ከተመሳሳዩ የተለያየ ቀለም እጅ {suitGain} ገደማ የበለጠ የማሸነፍ ዕድል።"
      ],
      [
        "የመነሻ እጅ ምርጫን የት መለማመድ እችላለሁ?",
        "በ PokerTH የልምምድ ሁነታ ውስጥ ከኮምፒውተር ተቃዋሚዎች ጋር፣ ካርታዎች ሲወጡ የማሸነፍ ዕድልዎን የሚያሳየው የ“ዕድሎች” ትር ባለበት።"
      ]
    ]
  },
  ar: {
    "title": "جدول أيدي البداية في البوكر — ترتيب الأيدي الـ169 | PokerTH",
    "desc": "أيدي البداية الـ169 في Texas Hold’em في جدول واحد، مرتبة حسب فرصتها في الفوز أمام خصم واحد وثلاثة وستة. من النوع نفسه أو لا، الأزواج، وأسوأ يد.",
    "ldHeadline": "جدول أيدي البداية في Texas Hold’em: ترتيب الأيدي الـ169 كلها",
    "ldDesc": "أيدي البداية الـ169 في Texas Hold’em في جدول، مرتبة حسب فرصتها في الفوز أمام يد واحدة وثلاث وست أيدٍ عشوائية.",
    "h1": "أيدي البداية في Texas Hold’em: الـ169 كلها مرتبة",
    "lead": "ورقتاك المغلقتان هما أول قرار في كل يد. هناك {combos} طريقة لتلقي ورقتين، لكن لا توجد سوى 169 يد بداية مختلفة إذا تركنا الأنواع جانبًا. تعرضها هذه الصفحة كلها في جدول مع فرصة فوز كل منها، محسوبة بمحاكاة مليون توزيعة لكل يد.",
    "chartH2": "جدول أيدي البداية",
    "chartP": "الأزواج على القطر. فوقه الأيدي من النوع نفسه (s، الورقتان من النوع نفسه)، وتحته الأيدي من نوعين مختلفين (o). الحرف T يعني العشرة. الرقم في كل مربع هو فرصة فوز اليد أمام يد عشوائية واحدة حين تُوزَّع أوراق الطاولة الخمس كلها، مع احتساب التعادل نصف فوز؛ وكلما كان المربع أكثر خضرة كانت اليد أقوى.",
    "topH2": "أفضل أيدي البداية",
    "topP": "أقوى عشرين يدًا أمام خصم واحد، وكيف تصمد أمام ثلاثة خصوم وستة:",
    "cols": [
      "الترتيب",
      "اليد",
      "خصم واحد",
      "3 خصوم",
      "6 خصوم"
    ],
    "multiH2": "خصوم أكثر، أيدٍ مختلفة",
    "multiP": "كل يد تفوز أقل كلما انضم لاعبون إلى القدر، لكن ليس بالمعدل نفسه، فيتغير الترتيب. يبقى زوج الآصات في القمة: {aa1} وجهًا لوجه، ولا يزال {aa6} أمام ستة خصوم. وترتقي الأوراق المتتالية من النوع نفسه، لأنها تكوّن ستريت وفلَش تربح قدورًا كبيرة: سبعة-ستة من النوع نفسه تنتقل من المرتبة {r76s1} وجهًا لوجه إلى المرتبة {r76s6} أمام ستة، وولد-عشرة من النوع نفسه من {rjts1} إلى {rjts6}. أما الأزواج المتوسطة فتتراجع — زوج السبعات يهبط من المرتبة {r77_1} إلى {r77_6} — وكذلك الأيدي من نوعين مختلفين التي فيها ورقة عالية واحدة وورقة مرجّحة ضعيفة، مثل ملك-ستة من نوعين مختلفين، من {rk6o1} إلى {rk6o6}.",
    "suitedH2": "من النوع نفسه أم من نوعين مختلفين؟",
    "suitedP": "ورقتان من النوع نفسه تساويان أكثر من الورقتين نفسيهما من نوعين مختلفين — بنحو {suitGain} أكثر في المتوسط على أزواج القيم الـ78 كلها، من {suitMin} إلى {suitMax} حسب اليد. للأمر أهمية، لكنها أقل مما يبدو: الفلَش نادر، واليد الضعيفة من النوع نفسه تبقى يدًا ضعيفة.",
    "worstH2": "أسوأ يد بداية",
    "worstP": "أمام يد عشوائية واحدة، ثلاثة-اثنان من نوعين مختلفين هي الأضعف على الإطلاق بنسبة {w32}. أما سبعة-اثنان من نوعين مختلفين، التي تُوصف غالبًا بأنها أسوأ يد في البوكر، فتفوز في {w72} وتحتل المرتبة {r72} من 169 وجهًا لوجه — لكنها أمام ستة خصوم الأخيرة تمامًا، لأن ورقتيها متباعدتان أكثر من أن تكوّنا معًا ستريت، ومنخفضتان أكثر من أن تربحا بشيء آخر يُذكر.",
    "countH2": "كم مرة تحصل على كل نوع",
    "countP": "من بين {combos} يدًا ممكنة من ورقتين، {pairCombos} أزواج ({pairPct})، و{suitedCombos} من النوع نفسه ({suitedPct})، و{offCombos} من نوعين مختلفين ({offPct}). كل زوج يمكن أن يُوزَّع بـ6 طرق، وكل يد من النوع نفسه بـ4 طرق، وكل يد من نوعين مختلفين بـ12 طريقة — ولهذا ترى آص-ملك من نوعين مختلفين ثلاث مرات أكثر من آص-ملك من النوع نفسه.",
    "useH2": "كيف تستخدم جدولًا كهذا",
    "useP": "يرتب الجدول الأيدي حسب قوتها الخام، قبل أن يتصرف أي لاعب. على طاولة حقيقية، العب أيدي أقل من المراكز المبكرة، حيث يتكلم بعدك لاعبون كثيرون، وأكثر من زر الموزّع ومن الكت-أوف. فضّل الزيادة على المجاراة بالأيدي التي تلعبها، وانسحب بأيدي أسفل الجدول، وتذكّر أن قيمة اليد تتوقف أيضًا على الأرصدة والرهانات العمياء وخصومك. في بطولة PokerTH ترتفع الرهانات العمياء باستمرار، فتتسع دائرة الأيدي التي تستحق اللعب كلما قصرت الأرصدة.",
    "faqH2": "أسئلة",
    "faq": [
      [
        "ما هي أفضل يد بداية في Texas Hold’em؟",
        "زوج الآصات. يفوز في {aa1} أمام يد عشوائية واحدة، وهو المرشح للفوز أمام كل يد بداية أخرى."
      ],
      [
        "هل آص-ملك أفضل من زوج ملكات؟",
        "لا، لكن الفارق ضئيل: الملكات تفوز في {qqak} أمام آص-ملك من نوعين مختلفين. وأمام يد عشوائية واحدة يفوز آص-ملك من النوع نفسه في {aks1} والملكات في {qq1}."
      ],
      [
        "كم عدد أيدي البداية؟",
        "{combos} تشكيلة من ورقتين، تكوّن 169 يد بداية مختلفة: 13 زوجًا، و78 من النوع نفسه، و78 من نوعين مختلفين."
      ],
      [
        "كم تساوي اليد من النوع نفسه؟",
        "نحو {suitGain} زيادة في فرصة الفوز مقارنة باليد نفسها من نوعين مختلفين، في المتوسط."
      ],
      [
        "أين يمكنني التدرّب على اختيار أيدي البداية؟",
        "في وضع التدريب في PokerTH أمام خصوم يديرهم الحاسوب، مع تبويب «الاحتمالات» الذي يعرض فرصتك في الفوز مع ظهور الأوراق."
      ]
    ]
  },
  az: {
    "title": "Poker başlanğıc əllər cədvəli — bütün 169 əl sıralanıb | PokerTH",
    "desc": "Texas Hold’em-in bütün 169 başlanğıc əli bir cədvəldə, bir, üç və altı rəqibə qarşı qazanma şansına görə sıralanıb. Eyni və ya müxtəlif rəngli, cütlər və ən pis əl.",
    "ldHeadline": "Texas Hold’em başlanğıc əllər cədvəli: bütün 169 əl sıralanıb",
    "ldDesc": "Texas Hold’em-in 169 başlanğıc əli cədvəldə, bir, üç və altı təsadüfi ələ qarşı qazanma şansına görə sıralanıb.",
    "h1": "Texas Hold’em-də başlanğıc əllər: bütün 169 əl sıra ilə",
    "lead": "İki cib kartınız hər əldə ilk qərardır. İki kartın sizə düşməsinin {combos} yolu var, amma rənglər nəzərə alınmadıqda cəmi 169 fərqli başlanğıc əl qalır. Bu səhifə onların hamısını qazanma şanslarıyla birlikdə cədvəldə göstərir; şanslar hər əl üçün bir milyon paylanma simulyasiya edilərək hesablanıb.",
    "chartH2": "Başlanğıc əllər cədvəli",
    "chartP": "Cütlər diaqonal boyunca düzülüb. Diaqonalın üstündə eyni rəngli əllər (s, hər iki kart eyni rəngdə), altında isə müxtəlif rəngli əllər (o) yerləşir. T onluq deməkdir. Hər xanadakı rəqəm bordun bütün beş kartı paylananda əlin bir təsadüfi ələ qarşı qazanma şansıdır; heç-heçə yarım qələbə sayılır. Xana nə qədər yaşıl olsa, əl o qədər güclüdür.",
    "topH2": "Ən yaxşı başlanğıc əllər",
    "topP": "Bir rəqibə qarşı ən güclü iyirmi əl və onların üç və altı rəqibə qarşı nəticəsi:",
    "cols": [
      "Yer",
      "Əl",
      "1 rəqib",
      "3 rəqib",
      "6 rəqib"
    ],
    "multiH2": "Daha çox rəqib, fərqli əllər",
    "multiP": "Banka oyunçular qoşulduqca hər əl daha az qazanır, amma eyni dərəcədə yox, ona görə də sıralama dəyişir. Cib tuzları zirvədə qalır: heads-up-da {aa1}, altı rəqibə qarşı isə yenə də {aa6}. Eyni rəngli konnektorlar yuxarı qalxır, çünki böyük bankları udan streyt və flaşlar yığırlar: eyni rəngli yeddi-altının sıra nömrəsi heads-up-da {r76s1}, altı rəqibə qarşı isə {r76s6} olur, eyni rəngli valet-onluğunku {rjts1} və {rjts6}. Orta cütlər aşağı düşür — yeddilərin sıra nömrəsi {r77_1} ikən {r77_6} olur — eləcə də bir yüksək kartı və zəif kikeri olan müxtəlif rəngli əllər, məsələn, müxtəlif rəngli kral-altı: {rk6o1} ikən {rk6o6}.",
    "suitedH2": "Eyni rəngli, yoxsa müxtəlif rəngli?",
    "suitedP": "Eyni rəngli iki kart eyni kartların müxtəlif rəngli variantından daha qiymətlidir — bütün 78 dəyər cütü üzrə orta hesabla təxminən {suitGain} çox, ələ görə {suitMin} ilə {suitMax} arasında. Bu önəmlidir, amma göründüyü qədər yox: flaş nadir düşür, zəif eyni rəngli əl isə yenə də zəif əldir.",
    "worstH2": "Ən pis başlanğıc əl",
    "worstP": "Bir təsadüfi ələ qarşı hamısından ən zəifi {w32} ilə müxtəlif rəngli üç-ikidir. Çox vaxt pokerdə ən pis əl adlandırılan müxtəlif rəngli yeddi-iki {w72} qazanır və heads-up-da 169 əl arasında sıra nömrəsi {r72} olur — amma altı rəqibə qarşı tam sonuncudur, çünki iki kartı birlikdə streyt yığmaq üçün bir-birindən çox uzaq, başqa bir şey udmaq üçün isə çox aşağıdır.",
    "countH2": "Hər növ əl nə qədər tez-tez düşür",
    "countP": "Mümkün {combos} iki kartlıq əldən {pairCombos} cütdür ({pairPct}), {suitedCombos} eyni rənglidir ({suitedPct}) və {offCombos} müxtəlif rənglidir ({offPct}). Hər cüt 6 yolla, hər eyni rəngli əl 4 yolla, hər müxtəlif rəngli əl isə 12 yolla düşə bilər — məhz buna görə müxtəlif rəngli tuz-kral eyni rəngli tuz-kraldan üç dəfə tez-tez gəlir.",
    "useH2": "Belə cədvəldən necə istifadə etməli",
    "useP": "Cədvəl əlləri heç kim hərəkət etməmişdən əvvəlki xalis gücünə görə sıralayır. Real masada erkən mövqedən, yəni sizdən sonra çox oyunçunun danışdığı yerdən daha az, baton və cut-off-dan isə daha çox əl oynayın. Oynadığınız əllərlə call yox, raise edin, cədvəlin aşağısındakıları fold edin və unutmayın ki, əlin dəyəri steklərdən, blaindlərdən və rəqiblərinizdən də asılıdır. PokerTH turnirində blaindlər daim artır, ona görə də steklər qısaldıqca oynamağa dəyən əllərin dairəsi genişlənir.",
    "faqH2": "Suallar",
    "faq": [
      [
        "Texas Hold’em-də ən yaxşı başlanğıc əl hansıdır?",
        "Cib tuzları. Onlar bir təsadüfi ələ qarşı {aa1} qazanır və hər bir başqa başlanğıc ələ qarşı favoritdir."
      ],
      [
        "Tuz-kral dama cütündən yaxşıdırmı?",
        "Xeyr, amma fərq azdır: damalar müxtəlif rəngli tuz-krala qarşı {qqak} qazanır. Bir təsadüfi ələ qarşı eyni rəngli tuz-kral {aks1}, damalar isə {qq1} qazanır."
      ],
      [
        "Neçə başlanğıc əl var?",
        "{combos} iki kartlıq kombinasiya; bunlar 169 fərqli başlanğıc əl təşkil edir: 13 cüt, 78 eyni rəngli və 78 müxtəlif rəngli."
      ],
      [
        "Eyni rəngli əl nə qədər dəyərlidir?",
        "Orta hesabla eyni əlin müxtəlif rəngli variantından təxminən {suitGain} çox qazanma şansı."
      ],
      [
        "Başlanğıc əl seçimini harada məşq edə bilərəm?",
        "PokerTH-in məşq rejimində kompüter rəqiblərə qarşı; Ehtimallar tabı kartlar açıldıqca qazanma şansınızı göstərir."
      ]
    ]
  },
  be: {
    "title": "Стартавыя рукі ў покеры — табліца ўсіх 169 рук | PokerTH",
    "desc": "Усе 169 стартавых рук Texas Hold’em у адной табліцы па шанцы выйграць супраць аднаго, трох і шасці супернікаў. Аднамасныя і рознамасныя, пары, горшая рука.",
    "ldHeadline": "Табліца стартавых рук Texas Hold’em: усе 169 рук па рангу",
    "ldDesc": "169 стартавых рук Texas Hold’em у табліцы, ранжыраваныя па шанцы выйграць супраць адной, трох і шасці выпадковых рук.",
    "h1": "Стартавыя рукі ў Texas Hold’em: усе 169 па рангу",
    "lead": "Вашы дзве кішэнныя карты — першае рашэнне ў кожнай раздачы. Існуе {combos} спосабаў атрымаць дзве карты, але толькі 169 розных стартавых рук, калі не зважаць на масці. На гэтай старонцы ўсе яны сабраны ў табліцу з шанцам на перамогу, вылічаным праз сімуляцыю мільёна раздач для кожнай.",
    "chartH2": "Табліца стартавых рук",
    "chartP": "Пары ідуць па дыяганалі. Над ёй — аднамасныя рукі (s, абедзве карты адной масці), пад ёй — рознамасныя (o). T азначае дзесятку. Лік у кожнай клетцы — гэта шанец, што рука выйграе супраць адной выпадковай рукі, калі здадзены ўсе пяць карт борда, пры гэтым нічыя лічыцца як палова перамогі; чым зелянейшая клетка, тым мацнейшая рука.",
    "topH2": "Лепшыя стартавыя рукі",
    "topP": "Дваццаць наймацнейшых рук супраць аднаго суперніка і тое, як яны трымаюцца супраць трох і шасці:",
    "cols": [
      "Ранг",
      "Рука",
      "1 супернік",
      "3 суперніка",
      "6 супернікаў"
    ],
    "multiH2": "Больш супернікаў — іншыя рукі",
    "multiP": "Кожная рука выйграе радзей, калі ў банк уваходзяць новыя гульцы, але не з аднолькавай хуткасцю, таму рэйтынг мяняецца. Кішэнныя тузы застаюцца наверсе: {aa1} у хэдз-апе і ўсё яшчэ {aa6} супраць шасці супернікаў. Аднамасныя канектары падымаюцца, бо збіраюць стрыты і флэшы, што выйграюць вялікія банкі: аднамасныя сямёрка-шастка пераходзяць з месца {r76s1} у хэдз-апе на месца {r76s6} супраць шасці, аднамасныя валет-дзесятка — з {rjts1} на {rjts6}. Сярэднія пары падаюць — сямёркі з месца {r77_1} на {r77_6}, — як і рознамасныя рукі з адной высокай картай і слабым кікерам, напрыклад рознамасныя кароль-шастка: з {rk6o1} на {rk6o6}.",
    "suitedH2": "Аднамасныя ці рознамасныя?",
    "suitedP": "Дзве карты адной масці каштуюць больш, чым тыя ж карты розных масцей, — у сярэднім прыкладна на {suitGain} больш па ўсіх 78 парах рангаў, ад {suitMin} да {suitMax} у залежнасці ад рукі. Гэта важна, але менш, чым здаецца: флэшы рэдкія, а слабая аднамасная рука ўсё роўна застаецца слабой.",
    "worstH2": "Горшая стартавая рука",
    "worstP": "Супраць адной выпадковай рукі слабейшыя з усіх — рознамасныя тройка-двойка: {w32}. Рознамасныя сямёрка-двойка, якую часта называюць горшай рукой у покеры, выйграюць {w72} і займаюць месца {r72} з 169 у хэдз-апе — але супраць шасці супернікаў гэта самая апошняя рука, бо яе дзве карты занадта далёка адна ад адной, каб разам скласці стрыт, і занадта нізкія, каб выйграць штосьці іншае.",
    "countH2": "Як часта вам здаюць кожны тып рук",
    "countP": "З {combos} магчымых рук з дзвюх карт {pairCombos} — пары ({pairPct}), {suitedCombos} — аднамасныя ({suitedPct}) і {offCombos} — рознамасныя ({offPct}). Кожную пару можна атрымаць 6 спосабамі, кожную аднамасную руку — 4, кожную рознамасную — 12: таму рознамасныя туз-кароль вы бачыце ў тры разы часцей, чым аднамасныя туз-кароль.",
    "useH2": "Як карыстацца такой табліцай",
    "useP": "Табліца ранжыруе рукі па чыстай сіле, пакуль ніхто яшчэ не дзейнічаў. За сапраўдным сталом гуляйце менш рук з ранняй пазіцыі, дзе пасля вас ходзіць шмат гульцоў, і больш — з батана і катофа. З рукамі, якія вы гуляеце, лепш рабіце Raise, чым Call, скідвайце ніз табліцы ў Fold і памятайце, што вартасць рукі залежыць таксама ад стэкаў, блайндаў і вашых супернікаў. У турніры PokerTH блайнды ўвесь час растуць, таму, калі стэкі карацеюць, кола рук, вартых гульні, пашыраецца.",
    "faqH2": "Пытанні",
    "faq": [
      [
        "Якая лепшая стартавая рука ў Texas Hold’em?",
        "Кішэнныя тузы. Яны выйграюць {aa1} супраць адной выпадковай рукі і з’яўляюцца фаварытам супраць любой іншай стартавай рукі."
      ],
      [
        "Ці лепшы туз-кароль за пару дам?",
        "Не, але розніца невялікая: дамы выйграюць {qqak} супраць рознамасных туза-караля. Супраць адной выпадковай рукі аднамасныя туз-кароль выйграюць {aks1}, а дамы — {qq1}."
      ],
      [
        "Колькі існуе стартавых рук?",
        "{combos} камбінацый з дзвюх карт, якія даюць 169 розных стартавых рук: 13 пар, 78 аднамасных і 78 рознамасных."
      ],
      [
        "Наколькі каштоўнейшая аднамасная рука?",
        "У сярэднім прыкладна на {suitGain} больш шанцаў выйграць, чым у той самай рукі розных масцей."
      ],
      [
        "Дзе можна патрэніраваць выбар стартавых рук?",
        "У трэніровачным рэжыме PokerTH супраць камп’ютарных супернікаў: укладка «Шанцы» паказвае ваш шанец выйграць па меры адкрыцця карт."
      ]
    ]
  },
  bg: {
    "title": "Таблица на началните ръце — класация на всички 169 | PokerTH",
    "desc": "Всички 169 начални ръце в Texas Hold’em в таблица, подредени по шанс за победа срещу един, трима и шестима противници. Едноцветни или не, чифтове, най-лошата ръка.",
    "ldHeadline": "Таблица на началните ръце в Texas Hold’em: всички 169 ръце, подредени",
    "ldDesc": "169-те начални ръце в Texas Hold’em в таблица, подредени по шанса им за победа срещу една, три и шест случайни ръце.",
    "h1": "Начални ръце в Texas Hold’em: всички 169, подредени по сила",
    "lead": "Двете ви собствени карти са първото решение във всяка ръка. Има {combos} начина да получите две карти, но само 169 различни начални ръце, ако не се гледат боите. Тази страница ги показва всички в таблица с шанса им за победа, изчислен чрез симулация на милион раздавания за всяка.",
    "chartH2": "Таблицата на началните ръце",
    "chartP": "Чифтовете са по диагонала. Над него са едноцветните ръце (s, двете карти от една боя), под него — разноцветните ръце (o). T означава десетка. Числото във всяко квадратче е шансът ръката да спечели срещу една случайна ръка, когато се раздадат и петте карти на борда, като равенството се брои за половин победа; колкото по-зелено е квадратчето, толкова по-силна е ръката.",
    "topH2": "Най-добрите начални ръце",
    "topP": "Двадесетте най-силни ръце срещу един противник и как се справят срещу трима и шестима:",
    "cols": [
      "Място",
      "Ръка",
      "1 противник",
      "3 противници",
      "6 противници"
    ],
    "multiH2": "Повече противници, други ръце",
    "multiP": "Всяка ръка печели по-рядко, когато в пота влизат още играчи, но не с еднакво темпо, затова класирането се променя. Чифт аса остава на върха: {aa1} един срещу един и все още {aa6} срещу шестима противници. Едноцветните последователни карти се изкачват, защото правят стрейтове и флъшове, които печелят големи потове: седем-шест от една боя се качва от място {r76s1} един срещу един на място {r76s6} срещу шестима, вале-десет от една боя — от {rjts1} на {rjts6}. Средните чифтове падат — седмиците слизат от място {r77_1} на {r77_6} — както и разноцветните ръце с една висока карта и слаб кикър, например поп-шест от различни бои, от {rk6o1} на {rk6o6}.",
    "suitedH2": "Едноцветни или разноцветни?",
    "suitedP": "Две карти от една боя струват повече от същите карти от различни бои — средно с около {suitGain} повече за всички 78 комбинации от две стойности, от {suitMin} до {suitMax} в зависимост от ръката. Това има значение, но по-малко, отколкото изглежда: флъшовете са редки, а слабата едноцветна ръка си остава слаба ръка.",
    "worstH2": "Най-лошата начална ръка",
    "worstP": "Срещу една случайна ръка тройка-двойка от различни бои е най-слабата от всички с {w32}. Седем-две от различни бои, често наричана най-лошата ръка в покера, печели {w72} и е на място {r72} от 169 един срещу един — но срещу шестима противници е на последно място, защото двете ѝ карти са твърде далеч една от друга, за да направят заедно стрейт, и твърде ниски, за да спечелят много друго.",
    "countH2": "Колко често получавате всеки вид",
    "countP": "От {combos} възможни ръце от две карти {pairCombos} са чифтове ({pairPct}), {suitedCombos} са едноцветни ({suitedPct}) и {offCombos} са разноцветни ({offPct}). Всеки чифт може да се раздаде по 6 начина, всяка едноцветна ръка — по 4 начина, всяка разноцветна ръка — по 12 начина; затова асо-поп от различни бои ви се пада три пъти по-често от асо-поп от една боя.",
    "useH2": "Как да използвате такава таблица",
    "useP": "Таблицата подрежда ръцете по чиста сила, преди някой да е действал. На истинска маса играйте по-малко ръце от ранна позиция, където след вас действат много играчи, и повече от бутона и кътофа. С ръцете, които играете, по-скоро повишавайте, отколкото да плащате, хвърляйте ръцете от дъното на таблицата и помнете, че стойността на една ръка зависи и от стековете, блайндовете и противниците ви. В турнир на PokerTH блайндовете непрекъснато растат, затова кръгът на ръцете, които си струва да играете, се разширява, когато стековете намаляват.",
    "faqH2": "Въпроси",
    "faq": [
      [
        "Коя е най-добрата начална ръка в Texas Hold’em?",
        "Чифт аса. Печели {aa1} срещу една случайна ръка и е фаворит срещу всяка друга начална ръка."
      ],
      [
        "Асо-поп по-добър ли е от чифт дами?",
        "Не, но е близо: дамите печелят {qqak} срещу асо-поп от различни бои. Срещу една случайна ръка асо-поп от една боя печели {aks1}, а дамите — {qq1}."
      ],
      [
        "Колко начални ръце има?",
        "{combos} комбинации от две карти, които образуват 169 различни начални ръце: 13 чифта, 78 едноцветни и 78 разноцветни."
      ],
      [
        "Колко струва едноцветната ръка?",
        "Средно около {suitGain} повече шанс за победа от същата ръка от различни бои."
      ],
      [
        "Къде мога да се упражнявам в избора на начални ръце?",
        "В тренировъчния режим на PokerTH срещу компютърни противници, с раздела Шансове, който показва шанса ви за победа, докато картите излизат."
      ]
    ]
  },
  bn: {
    "title": "পোকারের শুরুর হাতের চার্ট — ১৬৯টি হাতের র‍্যাঙ্কিং | PokerTH",
    "desc": "Texas Hold’em-এর ১৬৯টি শুরুর হাত এক চার্টে, এক, তিন ও ছয় প্রতিপক্ষের বিরুদ্ধে জেতার সম্ভাবনা অনুযায়ী সাজানো। একই সুট না ভিন্ন সুট, জোড়া, আর সবচেয়ে খারাপ হাত।",
    "ldHeadline": "Texas Hold’em শুরুর হাতের চার্ট: ১৬৯টি হাতেরই র‍্যাঙ্কিং",
    "ldDesc": "Texas Hold’em-এর ১৬৯টি শুরুর হাত, চার্টে সাজানো এবং একটি, তিনটি ও ছয়টি এলোমেলো হাতের বিরুদ্ধে জেতার সম্ভাবনা অনুযায়ী র‍্যাঙ্ক করা।",
    "h1": "Texas Hold’em-এর শুরুর হাত: ১৬৯টিই, র‍্যাঙ্ক অনুযায়ী",
    "lead": "আপনার দুটি গোপন কার্ডই প্রতিটি হাতের প্রথম সিদ্ধান্ত। দুটি কার্ড পাওয়ার {combos}টি উপায় আছে, কিন্তু সুট বাদ দিলে আলাদা শুরুর হাত মাত্র ১৬৯টি। এই পাতা সবগুলোকে জেতার সম্ভাবনাসহ চার্টে দেখায়, যা প্রতিটির জন্য দশ লক্ষবার তাস বাঁটা সিমুলেট করে হিসাব করা।",
    "chartH2": "শুরুর হাতের চার্ট",
    "chartP": "জোড়াগুলো কোণাকুণি রেখা বরাবর নেমে গেছে। তার ওপরে একই সুটের হাত (s, দুটি কার্ডই একই সুটের), নিচে ভিন্ন সুটের হাত (o)। T মানে দশ। প্রতিটি ঘরের সংখ্যাটি হলো বোর্ডের পাঁচটি কার্ডই দেওয়া হলে একটি এলোমেলো হাতের বিরুদ্ধে হাতটির জেতার সম্ভাবনা, যেখানে সমান ফলকে অর্ধেক জয় ধরা হয়েছে; ঘর যত সবুজ, হাত তত শক্তিশালী।",
    "topH2": "সেরা শুরুর হাত",
    "topP": "একজন প্রতিপক্ষের বিরুদ্ধে সবচেয়ে শক্তিশালী বিশটি হাত, আর তিন ও ছয়জনের বিরুদ্ধে সেগুলো কেমন টেকে:",
    "cols": [
      "র‍্যাঙ্ক",
      "হাত",
      "১ প্রতিপক্ষ",
      "৩ প্রতিপক্ষ",
      "৬ প্রতিপক্ষ"
    ],
    "multiH2": "বেশি প্রতিপক্ষ, ভিন্ন হাত",
    "multiP": "পটে খেলোয়াড় যত বাড়ে, প্রতিটি হাত তত কম জেতে, তবে একই হারে নয়, তাই র‍্যাঙ্কিং বদলে যায়। হাতের জোড়া টেক্কা শীর্ষেই থাকে: মুখোমুখি খেলায় {aa1}, ছয় প্রতিপক্ষের বিরুদ্ধেও {aa6}। একই সুটের পরপর কার্ড ওপরে ওঠে, কারণ সেগুলো স্ট্রেট আর ফ্লাশ বানায়, যা বড় পট জেতে: একই সুটের সাত-ছয় মুখোমুখি খেলায় {r76s1} নম্বর থেকে ছয়জনের বিরুদ্ধে {r76s6} নম্বরে ওঠে, একই সুটের গোলাম-দশ {rjts1} থেকে {rjts6} নম্বরে। মাঝারি জোড়া নেমে যায় — সাতের জোড়া {r77_1} নম্বর থেকে {r77_6} নম্বরে পড়ে — আর তেমনি নামে একটি বড় কার্ড ও দুর্বল কিকারওয়ালা ভিন্ন সুটের হাত, যেমন ভিন্ন সুটের সাহেব-ছয়, {rk6o1} থেকে {rk6o6} নম্বরে।",
    "suitedH2": "একই সুট না ভিন্ন সুট?",
    "suitedP": "একই সুটের দুটি কার্ডের দাম ভিন্ন সুটের সেই একই কার্ডের চেয়ে বেশি — দুই ভিন্ন মানের ৭৮টি জুটি মিলিয়ে গড়ে প্রায় {suitGain} বেশি, হাতভেদে {suitMin} থেকে {suitMax}। এর গুরুত্ব আছে, তবে যতটা মনে হয় ততটা নয়: ফ্লাশ বিরল, আর দুর্বল একই সুটের হাত তবুও দুর্বল হাতই।",
    "worstH2": "সবচেয়ে খারাপ শুরুর হাত",
    "worstP": "একটি এলোমেলো হাতের বিরুদ্ধে ভিন্ন সুটের তিরি-দুরিই সবচেয়ে দুর্বল: {w32}। ভিন্ন সুটের সাত-দুরি, যাকে প্রায়ই পোকারের সবচেয়ে খারাপ হাত বলা হয়, জেতে {w72} এবং মুখোমুখি খেলায় ১৬৯টির মধ্যে {r72} নম্বরে থাকে — কিন্তু ছয় প্রতিপক্ষের বিরুদ্ধে এটি একেবারে শেষে, কারণ এর দুটি কার্ড একসঙ্গে স্ট্রেট বানানোর পক্ষে অনেক দূরে, আর অন্য কিছু জেতার পক্ষে অনেক ছোট।",
    "countH2": "কোন ধরনের হাত কত ঘন ঘন আসে",
    "countP": "সম্ভাব্য {combos}টি দুই-কার্ডের হাতের মধ্যে {pairCombos}টি জোড়া ({pairPct}), {suitedCombos}টি একই সুটের ({suitedPct}) আর {offCombos}টি ভিন্ন সুটের ({offPct})। প্রতিটি জোড়া ৬ রকমভাবে আসতে পারে, প্রতিটি একই সুটের হাত ৪ রকমভাবে, প্রতিটি ভিন্ন সুটের হাত ১২ রকমভাবে — তাই একই সুটের টেক্কা-সাহেবের চেয়ে ভিন্ন সুটের টেক্কা-সাহেব আপনি তিন গুণ বেশি দেখেন।",
    "useH2": "এমন চার্ট কীভাবে ব্যবহার করবেন",
    "useP": "চার্ট হাতগুলোকে কাঁচা শক্তি অনুযায়ী সাজায়, কেউ কোনো চাল দেওয়ার আগেই। আসল টেবিলে আগের পজিশন থেকে কম হাত খেলুন, যেখানে আপনার পরে অনেক খেলোয়াড় চাল দেয়, আর বোতাম ও কাট-অফ থেকে বেশি। যে হাত খেলবেন তাতে সমান না করে বাড়ান, চার্টের নিচের দিকের হাত ছেড়ে দিন, আর মনে রাখবেন হাতের মূল্য চিপের স্তূপ, ব্লাইন্ড আর প্রতিপক্ষদের ওপরও নির্ভর করে। PokerTH টুর্নামেন্টে ব্লাইন্ড বাড়তেই থাকে, তাই চিপ কমে এলে খেলার মতো হাতের পরিসর বড় হয়।",
    "faqH2": "প্রশ্নোত্তর",
    "faq": [
      [
        "Texas Hold’em-এ সেরা শুরুর হাত কোনটি?",
        "হাতের জোড়া টেক্কা। একটি এলোমেলো হাতের বিরুদ্ধে এটি জেতে {aa1}, আর অন্য যেকোনো শুরুর হাতের বিরুদ্ধে এটিই ফেভারিট।"
      ],
      [
        "টেক্কা-সাহেব কি বিবির জোড়ার চেয়ে ভালো?",
        "না, তবে কাছাকাছি: ভিন্ন সুটের টেক্কা-সাহেবের বিরুদ্ধে বিবির জোড়া জেতে {qqak}। একটি এলোমেলো হাতের বিরুদ্ধে একই সুটের টেক্কা-সাহেব জেতে {aks1}, আর বিবির জোড়া {qq1}।"
      ],
      [
        "শুরুর হাত মোট কতগুলো?",
        "{combos}টি দুই-কার্ডের সমন্বয়, যা থেকে ১৬৯টি আলাদা শুরুর হাত হয়: ১৩টি জোড়া, ৭৮টি একই সুটের আর ৭৮টি ভিন্ন সুটের।"
      ],
      [
        "একই সুটের হাতের মূল্য কতটা বেশি?",
        "গড়ে, ভিন্ন সুটের সেই একই হাতের চেয়ে জেতার সম্ভাবনা প্রায় {suitGain} বেশি।"
      ],
      [
        "শুরুর হাত বাছাই কোথায় অনুশীলন করা যায়?",
        "PokerTH-এর অনুশীলন মোডে, কম্পিউটার প্রতিপক্ষের বিরুদ্ধে, যেখানে Odds ট্যাব তাস খুলতে খুলতে আপনার জেতার সম্ভাবনা দেখায়।"
      ]
    ]
  },
  bs: {
    "title": "Tabela početnih ruku u pokeru — rang svih 169 ruku | PokerTH",
    "desc": "Svih 169 početnih ruku Texas Hold’ema u tabeli, poredanih po šansi za pobjedu protiv jednog, tri i šest protivnika. Iste ili različite boje, parovi i najgora ruka.",
    "ldHeadline": "Tabela početnih ruku u Texas Hold’emu: svih 169 ruku po rangu",
    "ldDesc": "169 početnih ruku Texas Hold’ema u tabeli, poredanih po šansi za pobjedu protiv jedne, tri i šest nasumičnih ruku.",
    "h1": "Početne ruke u Texas Hold’emu: svih 169, po rangu",
    "lead": "Tvoje dvije zatvorene karte prva su odluka u svakom dijeljenju. Dvije karte možeš dobiti na {combos} načina, ali kad se boje zanemare, postoji samo 169 različitih početnih ruku. Ova stranica ih sve prikazuje u tabeli sa šansom za pobjedu, izračunatom simulacijom miliona dijeljenja za svaku od njih.",
    "chartH2": "Tabela početnih ruku",
    "chartP": "Parovi idu po dijagonali. Iznad nje su ruke iste boje (s, obje karte iste boje), ispod nje ruke različitih boja (o). T znači desetka. Broj u svakom polju je šansa da ruka pobijedi jednu nasumičnu ruku kad se podijeli svih pet karata na stolu, pri čemu se neriješeno računa kao pola pobjede; što je polje zelenije, to je ruka jača.",
    "topH2": "Najbolje početne ruke",
    "topP": "Dvadeset najjačih ruku protiv jednog protivnika i kako se drže protiv tri i protiv šest:",
    "cols": [
      "Rang",
      "Ruka",
      "1 protivnik",
      "3 protivnika",
      "6 protivnika"
    ],
    "multiH2": "Više protivnika, druge ruke",
    "multiP": "Svaka ruka pobjeđuje rjeđe kako se igrači pridružuju potu, ali ne istim tempom, pa se poredak mijenja. Par asova u ruci ostaje na vrhu: {aa1} jedan na jedan i još uvijek {aa6} protiv šest protivnika. Uzastopne karte iste boje penju se, jer prave skale i boje koje osvajaju velike potove: sedmica-šestica iste boje ide s {r76s1}. mjesta jedan na jedan na {r76s6}. protiv šest, a žandar-desetka iste boje s {rjts1}. na {rjts6}. Srednji parovi padaju — sedmice s {r77_1}. na {r77_6}. mjesto — a isto tako i ruke različitih boja s jednom visokom kartom i slabim kickerom, kao kralj-šestica različitih boja, s {rk6o1}. na {rk6o6}.",
    "suitedH2": "Iste boje ili različitih boja?",
    "suitedP": "Dvije karte iste boje vrijede više od istih karata različitih boja — u prosjeku oko {suitGain} više kroz svih 78 kombinacija dvije različite vrijednosti, od {suitMin} do {suitMax}, zavisno od ruke. To je važno, ali manje nego što izgleda: boje su rijetke, a slaba ruka iste boje i dalje je slaba ruka.",
    "worstH2": "Najgora početna ruka",
    "worstP": "Protiv jedne nasumične ruke najslabija od svih je trojka-dvojka različitih boja, sa {w32}. Sedmica-dvojka različitih boja, koju često zovu najgorom rukom u pokeru, pobjeđuje u {w72} slučajeva i zauzima {r72}. mjesto od 169 jedan na jedan — ali protiv šest protivnika je posljednja, jer su joj dvije karte predaleko jedna od druge da bi zajedno napravile skalu i preniske da bi često pobjeđivale nečim drugim.",
    "countH2": "Koliko često dobiješ koju vrstu ruke",
    "countP": "Od {combos} mogućih ruku od dvije karte, {pairCombos} su parovi ({pairPct}), {suitedCombos} su iste boje ({suitedPct}), a {offCombos} različitih boja ({offPct}). Svaki par možeš dobiti na 6 načina, svaku ruku iste boje na 4, a svaku ruku različitih boja na 12 — zato as-kralja različitih boja viđaš tri puta češće nego as-kralja iste boje.",
    "useH2": "Kako koristiti ovakvu tabelu",
    "useP": "Tabela rangira ruke po sirovoj jačini, prije nego što je iko odigrao potez. Za pravim stolom igraj manje ruku s rane pozicije, gdje poslije tebe igra mnogo igrača, a više s dugmeta i cut-offa. S rukama koje igraš radije povisi nego plati, odustani od onih s dna tabele i zapamti da vrijednost ruke zavisi i od stekova, obaveznih uloga i tvojih protivnika. Na PokerTH turniru obavezni ulozi stalno rastu, pa se izbor ruku vrijednih igre širi kako stekovi postaju kraći.",
    "faqH2": "Pitanja",
    "faq": [
      [
        "Koja je najbolja početna ruka u Texas Hold’emu?",
        "Par asova u ruci. Pobjeđuje u {aa1} slučajeva protiv jedne nasumične ruke i favorit je protiv svake druge početne ruke."
      ],
      [
        "Je li as-kralj bolji od para dama?",
        "Nije, ali je blizu: dame pobjeđuju as-kralja različitih boja u {qqak} slučajeva. Protiv jedne nasumične ruke as-kralj iste boje pobjeđuje u {aks1}, a dame u {qq1}."
      ],
      [
        "Koliko ima početnih ruku?",
        "{combos} kombinacija od dvije karte, koje čine 169 različitih početnih ruku: 13 parova, 78 iste boje i 78 različitih boja."
      ],
      [
        "Koliko vrijedi ruka iste boje?",
        "U prosjeku oko {suitGain} veću šansu za pobjedu od iste ruke različitih boja."
      ],
      [
        "Gdje mogu vježbati izbor početnih ruku?",
        "U trening načinu PokerTH-a protiv protivnika kojima upravlja računar, uz karticu „Izgledi” koja pokazuje tvoju šansu za pobjedu kako karte izlaze."
      ]
    ]
  },
  ca: {
    "title": "Taula de mans inicials de pòquer — les 169 ordenades | PokerTH",
    "desc": "Les 169 mans inicials del Texas Hold’em en una taula, ordenades per la probabilitat de guanyar contra un, tres i sis rivals. Mateix pal o no, parelles i la pitjor mà.",
    "ldHeadline": "Taula de mans inicials del Texas Hold’em: les 169 mans ordenades",
    "ldDesc": "Les 169 mans inicials del Texas Hold’em, en una taula i ordenades per la probabilitat de guanyar contra una, tres i sis mans aleatòries.",
    "h1": "Mans inicials del Texas Hold’em: les 169, ordenades",
    "lead": "Les teves dues cartes tapades són la primera decisió de cada mà. Hi ha {combos} maneres de rebre dues cartes, però només 169 mans inicials diferents si no es tenen en compte els pals. Aquesta pàgina les mostra totes en una taula amb la seva probabilitat de guanyar, calculada simulant un milió de reparticions per a cadascuna.",
    "chartH2": "La taula de mans inicials",
    "chartP": "Les parelles ocupen la diagonal. Per sobre hi ha les mans del mateix pal (s, de suited: les dues cartes del mateix pal), per sota les de pals diferents (o, d’offsuit). T vol dir deu. El número de cada casella és la probabilitat que la mà guanyi contra una mà aleatòria quan es reparteixen les cinc cartes de la taula, comptant els empats com a mitja victòria; com més verda és la casella, més forta és la mà.",
    "topH2": "Les millors mans inicials",
    "topP": "Les vint mans més fortes contra un rival, i com aguanten contra tres i sis:",
    "cols": [
      "Lloc",
      "Mà",
      "1 rival",
      "3 rivals",
      "6 rivals"
    ],
    "multiH2": "Més rivals, altres mans",
    "multiP": "Totes les mans guanyen menys sovint a mesura que entren jugadors al pot, però no al mateix ritme, i per això l’ordre canvia. Els asos servits es mantenen al capdamunt: el {aa1} en un contra un, i encara el {aa6} contra sis rivals. Les cartes consecutives del mateix pal pugen, perquè fan escales i colors que guanyen pots grans: set-sis del mateix pal passa del lloc {r76s1} en un contra un al {r76s6} contra sis, i jota-deu del mateix pal del {rjts1} al {rjts6}. Les parelles mitjanes baixen — la parella de sets cau del lloc {r77_1} al {r77_6} — i també les mans de pals diferents amb una carta alta i un kicker fluix, com rei-sis de pals diferents, del {rk6o1} al {rk6o6}.",
    "suitedH2": "Mateix pal o pals diferents?",
    "suitedP": "Dues cartes del mateix pal valen més que les mateixes cartes de pals diferents: de mitjana, al voltant d’un {suitGain} més en el conjunt de les 78 combinacions de dos valors, entre el {suitMin} i el {suitMax} segons la mà. Importa, però menys del que sembla: els colors són rars, i una mà fluixa del mateix pal continua sent una mà fluixa.",
    "worstH2": "La pitjor mà inicial",
    "worstP": "Contra una mà aleatòria, tres-dos de pals diferents és la més fluixa de totes, amb el {w32}. Set-dos de pals diferents, sovint anomenada la pitjor mà del pòquer, guanya el {w72} i ocupa el lloc {r72} de 169 en un contra un — però contra sis rivals és l’última de totes, perquè les seves dues cartes són massa allunyades per fer escala juntes i massa baixes per guanyar gaire res més.",
    "countH2": "Amb quina freqüència et toca cada tipus",
    "countP": "De les {combos} mans possibles de dues cartes, {pairCombos} són parelles ({pairPct}), {suitedCombos} són del mateix pal ({suitedPct}) i {offCombos} són de pals diferents ({offPct}). Cada parella es pot repartir de 6 maneres, cada mà del mateix pal de 4 maneres i cada mà de pals diferents de 12 maneres — per això as-rei de pals diferents et toca tres vegades més sovint que as-rei del mateix pal.",
    "useH2": "Com fer servir una taula com aquesta",
    "useP": "Una taula ordena les mans per força pura, abans que ningú hagi actuat. En una partida real, juga menys mans des de les primeres posicions, on molts jugadors parlen després de tu, i més des del botó i el cut-off. Fes Raise en lloc de Call amb les mans que juguis, fes Fold amb les de la part baixa de la taula, i recorda que el valor d’una mà també depèn de les piles, de les cegues i dels teus rivals. En un torneig del PokerTH les cegues no paren de pujar, així que les mans que val la pena jugar s’amplien a mesura que les piles s’escurcen.",
    "faqH2": "Preguntes",
    "faq": [
      [
        "Quina és la millor mà inicial del Texas Hold’em?",
        "Els asos servits. Guanyen el {aa1} contra una mà aleatòria, i són favorits contra qualsevol altra mà inicial."
      ],
      [
        "As-rei és millor que una parella de dames?",
        "No, però és ajustat: les dames guanyen el {qqak} contra as-rei de pals diferents. Contra una mà aleatòria, as-rei del mateix pal guanya el {aks1} i les dames el {qq1}."
      ],
      [
        "Quantes mans inicials hi ha?",
        "{combos} combinacions de dues cartes, que formen 169 mans inicials diferents: 13 parelles, 78 del mateix pal i 78 de pals diferents."
      ],
      [
        "Quant val que una mà sigui del mateix pal?",
        "De mitjana, al voltant d’un {suitGain} més de probabilitat de guanyar que la mateixa mà de pals diferents."
      ],
      [
        "On puc practicar la tria de mans inicials?",
        "Al mode d’entrenament del PokerTH contra rivals de l’ordinador, amb la pestanya «Probabilitats» mostrant la teva probabilitat de guanyar a mesura que surten les cartes."
      ]
    ]
  },
  cs: {
    "title": "Startovní ruce v pokeru — tabulka a pořadí všech 169 | PokerTH",
    "desc": "Všech 169 startovních rukou Texas Hold’em v tabulce podle šance na výhru proti jednomu, třem a šesti soupeřům. Stejná barva i různé barvy, páry a nejhorší ruka.",
    "ldHeadline": "Tabulka startovních rukou Texas Hold’em: pořadí všech 169 rukou",
    "ldDesc": "169 startovních rukou Texas Hold’em v tabulce, seřazených podle šance na výhru proti jedné, třem a šesti náhodným rukám.",
    "h1": "Startovní ruce v Texas Hold’em: všech 169 podle pořadí",
    "lead": "Vaše dvě vlastní karty jsou prvním rozhodnutím každého rozdání. Dvě karty můžete dostat {combos} způsoby, ale když odhlédneme od barev, existuje jen 169 různých startovních rukou. Tato stránka je všechny ukazuje v tabulce s jejich šancí na výhru, spočítanou simulací milionu rozdání pro každou z nich.",
    "chartH2": "Tabulka startovních rukou",
    "chartP": "Páry vedou po úhlopříčce. Nad ní jsou stejnobarevné ruce (s, obě karty stejné barvy), pod ní ruce v různých barvách (o). T znamená desítku. Číslo v každém políčku je šance, že ruka vyhraje proti jedné náhodné ruce, když se rozdá všech pět karet na stůl, přičemž dělba se počítá jako poloviční výhra; čím zelenější políčko, tím silnější ruka.",
    "topH2": "Nejlepší startovní ruce",
    "topP": "Dvacet nejsilnějších rukou proti jednomu soupeři a jak obstojí proti třem a šesti:",
    "cols": [
      "Pořadí",
      "Ruka",
      "1 soupeř",
      "3 soupeři",
      "6 soupeřů"
    ],
    "multiH2": "Víc soupeřů, jiné ruce",
    "multiP": "Každá ruka vyhrává méně často, když do banku vstupují další hráči, ale ne stejným tempem, takže se pořadí mění. Pár es zůstává na vrcholu: {aa1} jeden na jednoho, stále {aa6} proti šesti soupeřům. Stejnobarevné navazující karty stoupají, protože skládají postupky a barvy, které vyhrávají velké banky: sedmička-šestka stejné barvy se posune z pozice {r76s1} při hře jeden na jednoho na pozici {r76s6} proti šesti, kluk-desítka stejné barvy z {rjts1} na {rjts6}. Střední páry klesají — sedmičky spadnou z pozice {r77_1} na {r77_6} — a stejně tak ruce v různých barvách s jednou vysokou kartou a slabým kickerem, například král-šestka v různých barvách, z {rk6o1} na {rk6o6}.",
    "suitedH2": "Stejná barva, nebo různé barvy?",
    "suitedP": "Dvě karty stejné barvy mají větší hodnotu než tytéž karty v různých barvách — v průměru asi o {suitGain} víc napříč všemi 78 dvojicemi hodnot, od {suitMin} do {suitMax} podle ruky. Hraje to roli, ale menší, než se zdá: barvy padají zřídka a slabá stejnobarevná ruka je pořád slabá ruka.",
    "worstH2": "Nejhorší startovní ruka",
    "worstP": "Proti jedné náhodné ruce je nejslabší ze všech trojka-dvojka v různých barvách s {w32}. Sedmička-dvojka v různých barvách, často označovaná za nejhorší ruku v pokeru, vyhrává {w72} a při hře jeden na jednoho je na pozici {r72} ze 169 — ale proti šesti soupeřům je úplně poslední, protože její dvě karty jsou od sebe příliš daleko, aby spolu vytvořily postupku, a příliš nízké, aby vyhrály mnoho jiného.",
    "countH2": "Jak často dostanete který druh",
    "countP": "Z {combos} možných dvoukaretních rukou tvoří páry {pairCombos} ({pairPct}), stejnobarevné ruce {suitedCombos} ({suitedPct}) a ruce v různých barvách {offCombos} ({offPct}). Každý pár lze rozdat 6 způsoby, každou stejnobarevnou ruku 4 způsoby a každou ruku v různých barvách 12 způsoby — proto vidíte eso-krále v různých barvách třikrát častěji než eso-krále stejné barvy.",
    "useH2": "Jak takovou tabulku používat",
    "useP": "Tabulka řadí ruce podle holé síly, dřív než kdokoli jednal. U skutečného stolu hrajte méně rukou z rané pozice, kde po vás jedná hodně hráčů, a víc z buttonu a cut-offu. S rukama, které hrajete, raději zvyšujte, než dorovnávejte, spodek tabulky skládejte a pamatujte, že hodnota ruky závisí i na stackech, blindech a soupeřích. V turnaji PokerTH blindy neustále rostou, takže s ubývajícími stacky přibývá rukou, které stojí za to hrát.",
    "faqH2": "Otázky",
    "faq": [
      [
        "Jaká je nejlepší startovní ruka v Texas Hold’em?",
        "Pár es. Vyhrává {aa1} proti jedné náhodné ruce a je favoritem proti každé jiné startovní ruce."
      ],
      [
        "Je eso-král lepší než pár dam?",
        "Ne, ale je to těsné: dámy vyhrají {qqak} proti eso-král v různých barvách. Proti jedné náhodné ruce vyhrává eso-král stejné barvy {aks1} a dámy {qq1}."
      ],
      [
        "Kolik je startovních rukou?",
        "{combos} dvoukaretních kombinací, které tvoří 169 různých startovních rukou: 13 párů, 78 stejnobarevných a 78 v různých barvách."
      ],
      [
        "Kolik má stejnobarevná ruka navíc?",
        "V průměru asi o {suitGain} vyšší šanci na výhru než stejná ruka v různých barvách."
      ],
      [
        "Kde si můžu procvičit výběr startovních rukou?",
        "V tréninkovém režimu PokerTH proti počítačovým soupeřům, s kartou „Šance“, která ukazuje vaši šanci na výhru, jak přicházejí karty."
      ]
    ]
  },
  cy: {
    "title": "Siart dwylo cychwynnol pocer — y 169 llaw mewn trefn | PokerTH",
    "desc": "Y 169 llaw gychwynnol Texas Hold’em mewn siart, yn ôl eu siawns o ennill yn erbyn un, tri a chwe gwrthwynebydd. Un siwt neu beidio, parau a'r llaw waethaf.",
    "ldHeadline": "Siart dwylo cychwynnol Texas Hold’em: y 169 llaw mewn trefn",
    "ldDesc": "Y 169 llaw gychwynnol Texas Hold’em, mewn siart ac mewn trefn yn ôl eu siawns o ennill yn erbyn un, tair a chwe llaw ar hap.",
    "h1": "Dwylo cychwynnol Texas Hold’em: pob un o'r 169, mewn trefn",
    "lead": "Eich dau gerdyn poced yw'r penderfyniad cyntaf ym mhob llaw. Mae {combos} ffordd o gael dau gerdyn, ond dim ond 169 llaw gychwynnol wahanol os rhowch y siwtiau o'r neilltu. Mae'r dudalen hon yn eu dangos i gyd mewn siart gyda'u siawns o ennill, wedi'i chyfrifo drwy efelychu miliwn o ddeliadau ar gyfer pob un.",
    "chartH2": "Siart y dwylo cychwynnol",
    "chartP": "Mae'r parau'n rhedeg i lawr y groeslin. Uwch ei phen mae'r dwylo o'r un siwt (s, y ddau gerdyn o'r un siwt), ac oddi tani'r dwylo o siwtiau gwahanol (o). Mae T yn golygu deg. Y rhif ym mhob sgwâr yw'r siawns y bydd y llaw yn ennill yn erbyn un llaw ar hap pan fydd pob un o'r pum cerdyn bwrdd wedi'u delio, gyda chanlyniad cyfartal yn cyfrif fel hanner buddugoliaeth; po wyrddaf y sgwâr, cryfaf y llaw.",
    "topH2": "Y dwylo cychwynnol gorau",
    "topP": "Yr ugain llaw gryfaf yn erbyn un gwrthwynebydd, a sut maen nhw'n dal eu tir yn erbyn tri a chwech:",
    "cols": [
      "Safle",
      "Llaw",
      "1 gwrthwynebydd",
      "3 gwrthwynebydd",
      "6 gwrthwynebydd"
    ],
    "multiH2": "Mwy o wrthwynebwyr, dwylo gwahanol",
    "multiP": "Mae pob llaw yn ennill yn llai aml wrth i chwaraewyr ymuno â'r pot, ond nid ar yr un raddfa, felly mae'r drefn yn newid. Mae asau poced yn aros ar y brig: {aa1} heads-up, a {aa6} o hyd yn erbyn chwe gwrthwynebydd. Mae cysylltwyr o'r un siwt yn dringo, am eu bod yn gwneud sythau a fflysiau sy'n ennill potiau mawr: mae saith-chwech o'r un siwt yn codi o safle {r76s1} heads-up i safle {r76s6} yn erbyn chwech, a jac-deg o'r un siwt o {rjts1} i {rjts6}. Mae parau canol yn disgyn — mae'r seithau'n syrthio o safle {r77_1} i {r77_6} — ac felly hefyd y dwylo o siwtiau gwahanol sydd ag un cerdyn uchel a kicker gwan, fel brenin-chwech o siwtiau gwahanol, o {rk6o1} i {rk6o6}.",
    "suitedH2": "O'r un siwt neu o siwtiau gwahanol?",
    "suitedP": "Mae dau gerdyn o'r un siwt yn werth mwy na'r un cardiau o siwtiau gwahanol — tua {suitGain} yn fwy ar gyfartaledd ar draws pob un o'r 78 pâr o werthoedd, o {suitMin} i {suitMax} yn dibynnu ar y llaw. Mae'n bwysig, ond yn llai nag y mae'n ymddangos: mae fflysiau'n brin, ac mae llaw wan o'r un siwt yn dal yn llaw wan.",
    "worstH2": "Y llaw gychwynnol waethaf",
    "worstP": "Yn erbyn un llaw ar hap, tri-dau o siwtiau gwahanol yw'r wannaf oll, gyda {w32}. Mae saith-dau o siwtiau gwahanol, a elwir yn aml yn llaw waethaf pocer, yn ennill {w72} ac yn safle {r72} o 169 heads-up — ond yn erbyn chwe gwrthwynebydd hi yw'r olaf un, am fod ei dau gerdyn yn rhy bell oddi wrth ei gilydd i wneud syth gyda'i gilydd ac yn rhy isel i ennill fawr ddim arall.",
    "countH2": "Pa mor aml y cewch chi bob math",
    "countP": "O'r {combos} llaw dau gerdyn bosibl, mae {pairCombos} yn barau ({pairPct}), {suitedCombos} o'r un siwt ({suitedPct}) a {offCombos} o siwtiau gwahanol ({offPct}). Gellir delio pob pâr mewn 6 ffordd, pob llaw o'r un siwt mewn 4 ffordd, a phob llaw o siwtiau gwahanol mewn 12 ffordd — dyna pam y gwelwch as-brenin o siwtiau gwahanol dair gwaith mor aml ag as-brenin o'r un siwt.",
    "useH2": "Sut i ddefnyddio siart fel hwn",
    "useP": "Mae siart yn rhestru dwylo yn ôl eu cryfder moel, cyn i neb weithredu. Wrth fwrdd go iawn, chwaraewch lai o ddwylo o safle cynnar, lle mae llawer o chwaraewyr yn gweithredu ar eich ôl, a mwy o'r botwm a'r cut-off. Gwnewch Raise yn hytrach na Call gyda'r dwylo rydych chi'n eu chwarae, gwnewch Fold gyda gwaelod y siart, a chofiwch fod gwerth llaw hefyd yn dibynnu ar y stacs, y blinds a'ch gwrthwynebwyr. Mewn twrnamaint PokerTH mae'r blinds yn dal i godi, felly mae'r dwylo sy'n werth eu chwarae yn lledu wrth i'r stacs fynd yn fyr.",
    "faqH2": "Cwestiynau",
    "faq": [
      [
        "Beth yw'r llaw gychwynnol orau yn Texas Hold’em?",
        "Asau poced. Maen nhw'n ennill {aa1} yn erbyn un llaw ar hap, a nhw yw'r ffefryn yn erbyn pob llaw gychwynnol arall."
      ],
      [
        "Ydy as-brenin yn well na phâr o freninesau?",
        "Nac ydy, ond mae'n agos: mae breninesau'n ennill {qqak} yn erbyn as-brenin o siwtiau gwahanol. Yn erbyn un llaw ar hap mae as-brenin o'r un siwt yn ennill {aks1} a breninesau {qq1}."
      ],
      [
        "Faint o ddwylo cychwynnol sydd?",
        "{combos} cyfuniad dau gerdyn, sy'n gwneud 169 llaw gychwynnol wahanol: 13 pâr, 78 o'r un siwt a 78 o siwtiau gwahanol."
      ],
      [
        "Faint yw gwerth llaw o'r un siwt?",
        "Tua {suitGain} yn fwy o siawns o ennill na'r un llaw o siwtiau gwahanol, ar gyfartaledd."
      ],
      [
        "Ble alla i ymarfer dewis dwylo cychwynnol?",
        "Ym modd ymarfer PokerTH yn erbyn gwrthwynebwyr cyfrifiadur, gyda'r tab Siawns yn dangos eich siawns o ennill wrth i'r cardiau ddod allan."
      ]
    ]
  },
  da: {
    "title": "Starthænder i poker — alle 169 hænder rangeret | PokerTH",
    "desc": "Alle 169 starthænder i Texas Hold’em i én tabel, rangeret efter chancen for at vinde mod én, tre og seks modstandere. Samme kulør eller ej, par og den værste hånd.",
    "ldHeadline": "Tabel over starthænder i Texas Hold’em: alle 169 hænder rangeret",
    "ldDesc": "De 169 starthænder i Texas Hold’em, sat op i en tabel og rangeret efter chancen for at vinde mod én, tre og seks tilfældige hænder.",
    "h1": "Starthænder i Texas Hold’em: alle 169, rangeret",
    "lead": "Dine to lukkede kort er den første beslutning i hver hånd. Der er {combos} måder at få delt to kort på, men kun 169 forskellige starthænder, når man ser bort fra kulørerne. Denne side viser dem alle i en tabel med deres chance for at vinde, beregnet ved at simulere en million uddelinger for hver.",
    "chartH2": "Tabellen over starthænder",
    "chartP": "Parrene går ned ad diagonalen. Over den står hænderne i samme kulør (s, begge kort i samme kulør), under den hænderne i forskellige kulører (o). T står for ti. Tallet i hvert felt er chancen for, at hånden vinder mod én tilfældig hånd, når alle fem fælleskort er delt ud, hvor uafgjort tæller som en halv sejr; jo grønnere feltet er, jo stærkere er hånden.",
    "topH2": "De bedste starthænder",
    "topP": "De tyve stærkeste hænder mod én modstander, og hvordan de klarer sig mod tre og seks:",
    "cols": [
      "Plads",
      "Hånd",
      "1 modstander",
      "3 modstandere",
      "6 modstandere"
    ],
    "multiH2": "Flere modstandere, andre hænder",
    "multiP": "Alle hænder vinder sjældnere, jo flere spillere der går med i puljen, men ikke lige meget, så rangeringen ændrer sig. Et par esser bliver på toppen: {aa1} heads-up, stadig {aa6} mod seks modstandere. Kort i række i samme kulør stiger, fordi de laver straights og flushes, der vinder store puljer: syv-seks i samme kulør går fra plads {r76s1} heads-up til plads {r76s6} mod seks, knægt-ti i samme kulør fra {rjts1} til {rjts6}. Mellempar falder — syvere falder fra plads {r77_1} til {r77_6} — og det gør hænder i forskellige kulører med ét højt kort og en svag kicker også, som konge-seks i forskellige kulører, fra {rk6o1} til {rk6o6}.",
    "suitedH2": "Samme kulør eller forskellige kulører?",
    "suitedP": "To kort i samme kulør er mere værd end de samme kort i forskellige kulører — i gennemsnit omkring {suitGain} mere over alle 78 kombinationer af værdier, fra {suitMin} til {suitMax} afhængigt af hånden. Det betyder noget, men mindre end man skulle tro: flushes er sjældne, og en svag hånd i samme kulør er stadig en svag hånd.",
    "worstH2": "Den værste starthånd",
    "worstP": "Mod én tilfældig hånd er tre-to i forskellige kulører den svageste af alle med {w32}. Syv-to i forskellige kulører, ofte kaldt den værste hånd i poker, vinder {w72} og ligger på plads {r72} af 169 heads-up — men mod seks modstandere er den helt sidst, fordi dens to kort ligger for langt fra hinanden til at lave en straight sammen og er for lave til at vinde meget andet.",
    "countH2": "Hvor ofte du får hver slags hånd",
    "countP": "Af de {combos} mulige hænder med to kort er {pairCombos} par ({pairPct}), {suitedCombos} i samme kulør ({suitedPct}) og {offCombos} i forskellige kulører ({offPct}). Hvert par kan deles ud på 6 måder, hver hånd i samme kulør på 4 måder og hver hånd i forskellige kulører på 12 måder — derfor får du es-konge i forskellige kulører tre gange så ofte som es-konge i samme kulør.",
    "useH2": "Sådan bruger du en tabel som denne",
    "useP": "En tabel rangerer hænder efter rå styrke, før nogen har handlet. Ved et rigtigt bord skal du spille færre hænder fra tidlig position, hvor mange spillere handler efter dig, og flere fra knappen og cut-off. Raise i stedet for at calle med de hænder, du spiller, fold bunden af tabellen, og husk, at en hånds værdi også afhænger af stakkene, blinds og dine modstandere. I en PokerTH-turnering bliver blinds ved med at stige, så flere hænder bliver værd at spille, efterhånden som stakkene bliver korte.",
    "faqH2": "Spørgsmål",
    "faq": [
      [
        "Hvad er den bedste starthånd i Texas Hold’em?",
        "Et par esser. De vinder {aa1} mod én tilfældig hånd og er favorit mod alle andre starthænder."
      ],
      [
        "Er es-konge bedre end et par damer?",
        "Nej, men det er tæt: damer vinder {qqak} mod es-konge i forskellige kulører. Mod én tilfældig hånd vinder es-konge i samme kulør {aks1} og damer {qq1}."
      ],
      [
        "Hvor mange starthænder findes der?",
        "{combos} kombinationer af to kort, som giver 169 forskellige starthænder: 13 par, 78 i samme kulør og 78 i forskellige kulører."
      ],
      [
        "Hvor meget er en hånd i samme kulør værd?",
        "I gennemsnit omkring {suitGain} større chance for at vinde end den samme hånd i forskellige kulører."
      ],
      [
        "Hvor kan jeg øve mig i at vælge starthænder?",
        "I PokerTH’s træningstilstand mod computermodstandere, hvor fanen Chancer viser din chance for at vinde, efterhånden som kortene kommer."
      ]
    ]
  },
  de: {
    "title": "Poker-Starthände-Tabelle — alle 169 Hände im Ranking | PokerTH",
    "desc": "Alle 169 Starthände im Texas Hold’em in einer Tabelle, geordnet nach Gewinnchance gegen einen, drei und sechs Gegner. Suited oder offsuit, Paare, schlechteste Hand.",
    "ldHeadline": "Starthände-Tabelle für Texas Hold’em: alle 169 Hände im Ranking",
    "ldDesc": "Die 169 Starthände im Texas Hold’em als Tabelle, geordnet nach ihrer Gewinnchance gegen eine, drei und sechs zufällige Hände.",
    "h1": "Starthände im Texas Hold’em: alle 169 im Ranking",
    "lead": "Ihre zwei Hole Cards sind die erste Entscheidung jeder Hand. Es gibt {combos} Möglichkeiten, zwei Karten zu bekommen, aber nur 169 verschiedene Starthände, wenn man die Farben beiseitelässt. Diese Seite zeigt sie alle in einer Tabelle mit ihrer Gewinnchance, ermittelt durch die Simulation von einer Million Kartenverteilungen für jede Hand.",
    "chartH2": "Die Starthände-Tabelle",
    "chartP": "Die Paare verlaufen entlang der Diagonale. Darüber stehen die suited Hände (s, beide Karten in derselben Farbe), darunter die offsuit Hände (o). T steht für die Zehn. Die Zahl in jedem Feld ist die Chance, dass die Hand gegen eine zufällige Hand gewinnt, wenn alle fünf Boardkarten ausgeteilt werden, wobei ein Split als halber Sieg zählt; je grüner das Feld, desto stärker die Hand.",
    "topH2": "Die besten Starthände",
    "topP": "Die zwanzig stärksten Hände gegen einen Gegner und wie sie sich gegen drei und sechs Gegner halten:",
    "cols": [
      "Rang",
      "Hand",
      "1 Gegner",
      "3 Gegner",
      "6 Gegner"
    ],
    "multiH2": "Mehr Gegner, andere Hände",
    "multiP": "Jede Hand gewinnt seltener, je mehr Spieler in den Pot einsteigen, aber nicht im gleichen Maß, und so ändert sich die Rangfolge. Pocket-Asse bleiben vorn: {aa1} im Heads-up, immer noch {aa6} gegen sechs Gegner. Suited Connectors steigen auf, weil sie Straßen und Flushes bilden, die große Pots gewinnen: Sieben-Sechs suited klettert von Rang {r76s1} im Heads-up auf Rang {r76s6} gegen sechs, Bube-Zehn suited von {rjts1} auf {rjts6}. Mittlere Paare fallen zurück — Siebener von Rang {r77_1} auf {r77_6} —, ebenso offsuit Hände mit einer hohen Karte und schwachem Kicker, etwa König-Sechs offsuit, von {rk6o1} auf {rk6o6}.",
    "suitedH2": "Suited oder offsuit?",
    "suitedP": "Zwei Karten derselben Farbe sind mehr wert als dieselben Karten offsuit — im Schnitt etwa {suitGain} mehr über alle 78 Rangpaare, je nach Hand zwischen {suitMin} und {suitMax}. Das zählt, aber weniger, als es scheint: Flushes sind selten, und eine schwache suited Hand bleibt eine schwache Hand.",
    "worstH2": "Die schlechteste Starthand",
    "worstP": "Gegen eine zufällige Hand ist Drei-Zwei offsuit mit {w32} die schwächste von allen. Sieben-Zwei offsuit, oft die schlechteste Hand im Poker genannt, gewinnt {w72} und liegt im Heads-up auf Rang {r72} von 169 — gegen sechs Gegner ist sie aber ganz am Ende, denn ihre beiden Karten liegen zu weit auseinander, um zusammen eine Straße zu bilden, und sind zu niedrig, um viel anderes zu gewinnen.",
    "countH2": "Wie oft Sie welche Art bekommen",
    "countP": "Von den {combos} möglichen Zwei-Karten-Händen sind {pairCombos} Paare ({pairPct}), {suitedCombos} suited ({suitedPct}) und {offCombos} offsuit ({offPct}). Jedes Paar kann auf 6 Arten ausgeteilt werden, jede suited Hand auf 4, jede offsuit Hand auf 12 — deshalb sehen Sie Ass-König offsuit dreimal so oft wie Ass-König suited.",
    "useH2": "So nutzen Sie eine solche Tabelle",
    "useP": "Eine Tabelle ordnet Hände nach ihrer reinen Stärke, bevor jemand gehandelt hat. An einem echten Tisch spielen Sie aus früher Position, wo viele Spieler nach Ihnen handeln, weniger Hände und mehr vom Button und vom Cut-off. Mit den Händen, die Sie spielen, raisen Sie lieber, statt zu callen, folden Sie das untere Ende der Tabelle, und denken Sie daran, dass der Wert einer Hand auch von den Stacks, den Blinds und Ihren Gegnern abhängt. In einem PokerTH-Turnier steigen die Blinds immer weiter, also werden die spielbaren Hände breiter, je kürzer die Stacks werden.",
    "faqH2": "Fragen",
    "faq": [
      [
        "Was ist die beste Starthand im Texas Hold’em?",
        "Pocket-Asse. Sie gewinnen {aa1} gegen eine zufällige Hand und sind gegen jede andere Starthand Favorit."
      ],
      [
        "Ist Ass-König besser als ein Paar Damen?",
        "Nein, aber es ist knapp: Damen gewinnen {qqak} gegen Ass-König offsuit. Gegen eine zufällige Hand gewinnt Ass-König suited {aks1}, Damen gewinnen {qq1}."
      ],
      [
        "Wie viele Starthände gibt es?",
        "{combos} Kombinationen aus zwei Karten, die 169 verschiedene Starthände ergeben: 13 Paare, 78 suited und 78 offsuit."
      ],
      [
        "Wie viel ist eine suited Hand wert?",
        "Im Schnitt etwa {suitGain} mehr Gewinnchance als dieselbe Hand offsuit."
      ],
      [
        "Wo kann ich die Auswahl der Starthände üben?",
        "Im Trainingsmodus von PokerTH gegen Computergegner, während der Reiter Chancen Ihre Gewinnchance anzeigt, sobald die Karten kommen."
      ]
    ]
  },
  el: {
    "title": "Πίνακας αρχικών χεριών πόκερ — και τα 169 κατά σειρά | PokerTH",
    "desc": "Και τα 169 αρχικά χέρια του Texas Hold’em σε πίνακα, κατά πιθανότητα νίκης απέναντι σε έναν, τρεις και έξι αντιπάλους. Ίδιο χρώμα ή όχι, ζευγάρια, το χειρότερο χέρι.",
    "ldHeadline": "Πίνακας αρχικών χεριών Texas Hold’em: και τα 169 χέρια κατά σειρά",
    "ldDesc": "Τα 169 αρχικά χέρια του Texas Hold’em σε πίνακα, ταξινομημένα κατά την πιθανότητα νίκης τους απέναντι σε ένα, τρία και έξι τυχαία χέρια.",
    "h1": "Αρχικά χέρια στο Texas Hold’em: και τα 169, κατά σειρά",
    "lead": "Τα δύο κλειστά φύλλα σας είναι η πρώτη απόφαση σε κάθε χέρι. Υπάρχουν {combos} τρόποι να σας μοιραστούν δύο φύλλα, αλλά μόνο 169 διαφορετικά αρχικά χέρια αν αφήσουμε στην άκρη τα χρώματα. Αυτή η σελίδα τα παρουσιάζει όλα σε πίνακα με την πιθανότητα νίκης τους, υπολογισμένη με προσομοίωση ενός εκατομμυρίου μοιρασιών για το καθένα.",
    "chartH2": "Ο πίνακας αρχικών χεριών",
    "chartP": "Τα ζευγάρια βρίσκονται στη διαγώνιο. Από πάνω της είναι τα χέρια στο ίδιο χρώμα (s, και τα δύο φύλλα στο ίδιο χρώμα), από κάτω τα χέρια σε διαφορετικά χρώματα (o). Το T σημαίνει δέκα. Ο αριθμός σε κάθε τετράγωνο είναι η πιθανότητα το χέρι να κερδίσει ένα τυχαίο χέρι όταν μοιραστούν και τα πέντε φύλλα του τραπεζιού, με την ισοπαλία να μετρά ως μισή νίκη· όσο πιο πράσινο το τετράγωνο, τόσο πιο δυνατό το χέρι.",
    "topH2": "Τα καλύτερα αρχικά χέρια",
    "topP": "Τα είκοσι πιο δυνατά χέρια απέναντι σε έναν αντίπαλο, και πώς αντέχουν απέναντι σε τρεις και έξι:",
    "cols": [
      "Θέση",
      "Χέρι",
      "1 αντίπαλος",
      "3 αντίπαλοι",
      "6 αντίπαλοι"
    ],
    "multiH2": "Περισσότεροι αντίπαλοι, άλλα χέρια",
    "multiP": "Κάθε χέρι κερδίζει λιγότερο συχνά όσο μπαίνουν παίκτες στο πότ, αλλά όχι με τον ίδιο ρυθμό, οπότε η κατάταξη αλλάζει. Οι άσσοι στο χέρι μένουν στην κορυφή: {aa1} ένας εναντίον ενός, και ακόμη {aa6} απέναντι σε έξι αντιπάλους. Τα συνεχόμενα φύλλα στο ίδιο χρώμα ανεβαίνουν, γιατί φτιάχνουν κέντες και φλος που κερδίζουν μεγάλα πότ: το επτά-έξι στο ίδιο χρώμα ανεβαίνει από τη θέση {r76s1} ένας εναντίον ενός στη θέση {r76s6} απέναντι σε έξι, το βαλές-δέκα στο ίδιο χρώμα από {rjts1} σε {rjts6}. Τα μεσαία ζευγάρια πέφτουν — τα εφτάρια πέφτουν από τη θέση {r77_1} στη {r77_6} — όπως και τα χέρια σε διαφορετικά χρώματα με ένα ψηλό φύλλο και αδύναμο κίκερ, π.χ. ρήγας-έξι σε διαφορετικά χρώματα, από {rk6o1} σε {rk6o6}.",
    "suitedH2": "Ίδιο χρώμα ή διαφορετικά χρώματα;",
    "suitedP": "Δύο φύλλα στο ίδιο χρώμα αξίζουν περισσότερο από τα ίδια φύλλα σε διαφορετικά χρώματα — κατά μέσο όρο περίπου {suitGain} περισσότερο σε όλους τους 78 συνδυασμούς δύο αξιών, από {suitMin} έως {suitMax} ανάλογα με το χέρι. Μετράει, αλλά λιγότερο απ’ ό,τι φαίνεται: τα φλος είναι σπάνια, και ένα αδύναμο χέρι στο ίδιο χρώμα παραμένει αδύναμο χέρι.",
    "worstH2": "Το χειρότερο αρχικό χέρι",
    "worstP": "Απέναντι σε ένα τυχαίο χέρι, το τρία-δύο σε διαφορετικά χρώματα είναι το πιο αδύναμο απ’ όλα με {w32}. Το επτά-δύο σε διαφορετικά χρώματα, που συχνά αποκαλείται το χειρότερο χέρι στο πόκερ, κερδίζει {w72} και είναι στη θέση {r72} από τις 169 ένας εναντίον ενός — αλλά απέναντι σε έξι αντιπάλους είναι το τελευταίο απ’ όλα, γιατί τα δύο φύλλα του απέχουν πολύ για να φτιάξουν μαζί κέντα και είναι πολύ χαμηλά για να κερδίσουν πολλά άλλα.",
    "countH2": "Πόσο συχνά σας μοιράζεται κάθε είδος",
    "countP": "Από τα {combos} δυνατά χέρια δύο φύλλων, τα {pairCombos} είναι ζευγάρια ({pairPct}), τα {suitedCombos} στο ίδιο χρώμα ({suitedPct}) και τα {offCombos} σε διαφορετικά χρώματα ({offPct}). Κάθε ζευγάρι μπορεί να μοιραστεί με 6 τρόπους, κάθε χέρι στο ίδιο χρώμα με 4 τρόπους, κάθε χέρι σε διαφορετικά χρώματα με 12 τρόπους — γι’ αυτό βλέπετε το άσσος-ρήγας σε διαφορετικά χρώματα τρεις φορές πιο συχνά από το άσσος-ρήγας στο ίδιο χρώμα.",
    "useH2": "Πώς να χρησιμοποιήσετε έναν τέτοιο πίνακα",
    "useP": "Ένας πίνακας κατατάσσει τα χέρια με βάση την καθαρή δύναμη, πριν μιλήσει οποιοσδήποτε. Σε πραγματικό τραπέζι, παίξτε λιγότερα χέρια από πρώιμη θέση, όπου πολλοί παίκτες μιλούν μετά από εσάς, και περισσότερα από το κουμπί και το cut-off. Με τα χέρια που παίζετε, προτιμήστε το Raise από το Call, κάντε Fold τα χέρια στο κάτω μέρος του πίνακα, και θυμηθείτε ότι η αξία ενός χεριού εξαρτάται επίσης από τα κεφάλαια, τα τυφλά και τους αντιπάλους σας. Σε ένα τουρνουά PokerTH τα τυφλά ανεβαίνουν συνεχώς, οπότε τα χέρια που αξίζει να παίξετε πληθαίνουν όσο τα κεφάλαια μικραίνουν.",
    "faqH2": "Ερωτήσεις",
    "faq": [
      [
        "Ποιο είναι το καλύτερο αρχικό χέρι στο Texas Hold’em;",
        "Οι άσσοι στο χέρι. Κερδίζουν {aa1} απέναντι σε ένα τυχαίο χέρι και είναι το φαβορί απέναντι σε κάθε άλλο αρχικό χέρι."
      ],
      [
        "Είναι το άσσος-ρήγας καλύτερο από ένα ζευγάρι ντάμες;",
        "Όχι, αλλά είναι κοντά: οι ντάμες κερδίζουν {qqak} απέναντι στο άσσος-ρήγας σε διαφορετικά χρώματα. Απέναντι σε ένα τυχαίο χέρι, το άσσος-ρήγας στο ίδιο χρώμα κερδίζει {aks1} και οι ντάμες {qq1}."
      ],
      [
        "Πόσα αρχικά χέρια υπάρχουν;",
        "{combos} συνδυασμοί δύο φύλλων, που σχηματίζουν 169 διαφορετικά αρχικά χέρια: 13 ζευγάρια, 78 στο ίδιο χρώμα και 78 σε διαφορετικά χρώματα."
      ],
      [
        "Πόσο αξίζει ένα χέρι στο ίδιο χρώμα;",
        "Περίπου {suitGain} περισσότερη πιθανότητα νίκης από το ίδιο χέρι σε διαφορετικά χρώματα, κατά μέσο όρο."
      ],
      [
        "Πού μπορώ να εξασκηθώ στην επιλογή αρχικών χεριών;",
        "Στη λειτουργία εξάσκησης του PokerTH απέναντι σε αντιπάλους υπολογιστή, με την καρτέλα Πιθανότητες να δείχνει την πιθανότητα νίκης σας καθώς βγαίνουν τα φύλλα."
      ]
    ]
  },
  eo: {
    "title": "Tabelo de pokeraj startmanoj — ĉiuj 169 rangigitaj | PokerTH",
    "desc": "Ĉiuj 169 startmanoj de Texas Hold’em en unu tabelo, rangigitaj laŭ ŝanco gajni kontraŭ unu, tri kaj ses kontraŭuloj. Samkoloraj aŭ ne, paroj, la plej malbona mano.",
    "ldHeadline": "Tabelo de startmanoj en Texas Hold’em: ĉiuj 169 manoj rangigitaj",
    "ldDesc": "La 169 startmanoj de Texas Hold’em, en tabelo kaj rangigitaj laŭ ilia ŝanco gajni kontraŭ unu, tri kaj ses hazardaj manoj.",
    "h1": "Startmanoj en Texas Hold’em: ĉiuj 169, rangigitaj",
    "lead": "Viaj du poŝkartoj estas la unua decido de ĉiu mano. Estas {combos} manieroj ricevi du kartojn, sed nur 169 malsamaj startmanoj, kiam oni ne konsideras la kolorojn. Ĉi tiu paĝo montras ĉiujn en tabelo kun ilia ŝanco gajni, kalkulita per simulado de miliono da disdonoj por ĉiu.",
    "chartH2": "La tabelo de startmanoj",
    "chartP": "La paroj kuŝas laŭ la diagonalo. Super ĝi estas la samkoloraj manoj (s, ambaŭ kartoj de la sama koloro), sub ĝi la malsamkoloraj manoj (o). T signifas dekon. La nombro en ĉiu kvadrato estas la ŝanco, ke la mano gajnas kontraŭ unu hazarda mano, kiam ĉiuj kvin bordkartoj estas disdonitaj, kun egalo kalkulita kiel duona venko; ju pli verda la kvadrato, des pli forta la mano.",
    "topH2": "La plej bonaj startmanoj",
    "topP": "La dudek plej fortaj manoj kontraŭ unu kontraŭulo, kaj kiel ili tenas sin kontraŭ tri kaj ses:",
    "cols": [
      "Rango",
      "Mano",
      "1 kontraŭulo",
      "3 kontraŭuloj",
      "6 kontraŭuloj"
    ],
    "multiH2": "Pli da kontraŭuloj, aliaj manoj",
    "multiP": "Ĉiu mano gajnas malpli ofte, dum ludantoj aliĝas al la poto, sed ne same rapide, do la rangordo ŝanĝiĝas. Poŝasoj restas supre: {aa1} heads-up, ankoraŭ {aa6} kontraŭ ses kontraŭuloj. Samkoloraj konektiloj grimpas, ĉar ili faras vicojn kaj samkolorojn, kiuj gajnas grandajn potojn: samkolora sep-ses iras de rango {r76s1} heads-up al rango {r76s6} kontraŭ ses, samkolora fanto-dek de {rjts1} al {rjts6}. Mezaj paroj falas — sepoj falas de rango {r77_1} al {r77_6} — kaj same malsamkoloraj manoj kun unu alta karto kaj malforta kicker, ekzemple malsamkolora reĝo-ses, de {rk6o1} al {rk6o6}.",
    "suitedH2": "Samkoloraj aŭ malsamkoloraj?",
    "suitedP": "Du kartoj de la sama koloro valoras pli ol la samaj kartoj de malsamaj koloroj — ĉirkaŭ {suitGain} pli averaĝe tra ĉiuj 78 paroj de valoroj, de {suitMin} ĝis {suitMax} depende de la mano. Tio gravas, sed malpli ol ŝajnas: samkoloroj estas maloftaj, kaj malforta samkolora mano restas malforta mano.",
    "worstH2": "La plej malbona startmano",
    "worstP": "Kontraŭ unu hazarda mano, malsamkolora tri-du estas la plej malforta el ĉiuj, kun {w32}. Malsamkolora sep-du, ofte nomata la plej malbona mano de pokero, gajnas {w72} kaj estas je rango {r72} el 169 heads-up — sed kontraŭ ses kontraŭuloj ĝi estas la tute lasta, ĉar ĝiaj du kartoj estas tro malproksimaj por kune fari vicon kaj tro malaltaj por gajni multon alian.",
    "countH2": "Kiom ofte vi ricevas ĉiun specon",
    "countP": "El la {combos} eblaj dukartaj manoj, {pairCombos} estas paroj ({pairPct}), {suitedCombos} estas samkoloraj ({suitedPct}) kaj {offCombos} estas malsamkoloraj ({offPct}). Ĉiu paro povas esti disdonita en 6 manieroj, ĉiu samkolora mano en 4 manieroj, ĉiu malsamkolora mano en 12 manieroj — tial vi vidas malsamkoloran aso-reĝon trioble pli ofte ol samkoloran aso-reĝon.",
    "useH2": "Kiel uzi tian tabelon",
    "useP": "Tabelo rangigas manojn laŭ kruda forto, antaŭ ol iu ajn agis. Ĉe vera tablo, ludu malpli da manoj el frua pozicio, kie multaj ludantoj agas post vi, kaj pli el la butono kaj la cut-off. Altigu prefere ol voki kun la manoj, kiujn vi ludas, forĵetu la manojn ĉe la fundo de la tabelo, kaj memoru, ke la valoro de mano ankaŭ dependas de la stakoj, la blindoj kaj viaj kontraŭuloj. En PokerTH-turniro la blindoj daŭre altiĝas, do la ludindaj manoj plimultiĝas, dum la stakoj mallongiĝas.",
    "faqH2": "Demandoj",
    "faq": [
      [
        "Kio estas la plej bona startmano en Texas Hold’em?",
        "Poŝasoj. Ili gajnas {aa1} kontraŭ unu hazarda mano, kaj ili estas favoratoj kontraŭ ĉiu alia startmano."
      ],
      [
        "Ĉu aso-reĝo estas pli bona ol paro de damoj?",
        "Ne, sed estas proksime: damoj gajnas {qqak} kontraŭ malsamkolora aso-reĝo. Kontraŭ unu hazarda mano samkolora aso-reĝo gajnas {aks1} kaj damoj {qq1}."
      ],
      [
        "Kiom da startmanoj ekzistas?",
        "{combos} dukartaj kombinoj, kiuj faras 169 malsamajn startmanojn: 13 parojn, 78 samkolorajn kaj 78 malsamkolorajn."
      ],
      [
        "Kiom valoras samkolora mano?",
        "Averaĝe ĉirkaŭ {suitGain} pli da ŝanco gajni ol la sama mano malsamkolora."
      ],
      [
        "Kie mi povas ekzerci la elekton de startmanoj?",
        "En la trejna reĝimo de PokerTH kontraŭ komputilaj kontraŭuloj, kun la langeto Ŝancoj, kiu montras vian ŝancon gajni dum la kartoj malkaŝiĝas."
      ]
    ]
  },
  es: {
    "title": "Tabla de manos iniciales de póker — las 169 ordenadas | PokerTH",
    "desc": "Las 169 manos iniciales del Texas Hold’em en una tabla, ordenadas por probabilidad de ganar contra uno, tres y seis rivales. Mismo palo o no, parejas y la peor mano.",
    "ldHeadline": "Tabla de manos iniciales del Texas Hold’em: las 169 manos ordenadas",
    "ldDesc": "Las 169 manos iniciales del Texas Hold’em, en una tabla y ordenadas por su probabilidad de ganar contra una, tres y seis manos aleatorias.",
    "h1": "Manos iniciales del Texas Hold’em: las 169, ordenadas",
    "lead": "Tus dos cartas privadas son la primera decisión de cada mano. Hay {combos} formas de recibir dos cartas, pero solo 169 manos iniciales distintas si se dejan de lado los palos. Esta página las muestra todas en una tabla con su probabilidad de ganar, calculada simulando un millón de repartos para cada una.",
    "chartH2": "La tabla de manos iniciales",
    "chartP": "Las parejas recorren la diagonal. Por encima están las manos del mismo palo (s, las dos cartas del mismo palo) y por debajo las de distinto palo (o). La T significa diez. El número de cada casilla es la probabilidad de que la mano gane contra una mano aleatoria cuando se reparten las cinco cartas de la mesa, contando los empates como media victoria; cuanto más verde la casilla, más fuerte la mano.",
    "topH2": "Las mejores manos iniciales",
    "topP": "Las veinte manos más fuertes contra un rival, y cómo aguantan contra tres y contra seis:",
    "cols": [
      "Puesto",
      "Mano",
      "1 rival",
      "3 rivales",
      "6 rivales"
    ],
    "multiH2": "Más rivales, otras manos",
    "multiP": "Toda mano gana menos a menudo a medida que entran jugadores en el bote, pero no al mismo ritmo, así que la clasificación cambia. Los ases servidos siguen en cabeza: {aa1} en un mano a mano y todavía {aa6} contra seis rivales. Los conectores del mismo palo suben, porque forman escaleras y colores que ganan botes grandes: siete-seis del mismo palo pasa del puesto {r76s1} en un mano a mano al {r76s6} contra seis, y jota-diez del mismo palo del {rjts1} al {rjts6}. Las parejas medias bajan —los sietes caen del puesto {r77_1} al {r77_6}— y también las manos de distinto palo con una carta alta y un kicker débil, como rey-seis de distinto palo, del {rk6o1} al {rk6o6}.",
    "suitedH2": "¿Del mismo palo o de distinto palo?",
    "suitedP": "Dos cartas del mismo palo valen más que las mismas cartas de distinto palo: de media, unos {suitGain} más sobre las 78 combinaciones de dos valores distintos, de {suitMin} a {suitMax} según la mano. Importa, pero menos de lo que parece: los colores son raros, y una mano débil del mismo palo sigue siendo una mano débil.",
    "worstH2": "La peor mano inicial",
    "worstP": "Contra una mano aleatoria, tres-dos de distinto palo es la más débil de todas, con un {w32}. Siete-dos de distinto palo, a menudo llamada la peor mano del póker, gana el {w72} y ocupa el puesto {r72} de 169 en un mano a mano, pero contra seis rivales es la última de todas, porque sus dos cartas están demasiado separadas para formar juntas una escalera y son demasiado bajas para ganar con mucho más.",
    "countH2": "Con qué frecuencia te reparten cada tipo",
    "countP": "De las {combos} manos posibles de dos cartas, {pairCombos} son parejas ({pairPct}), {suitedCombos} son del mismo palo ({suitedPct}) y {offCombos} de distinto palo ({offPct}). Cada pareja puede repartirse de 6 formas, cada mano del mismo palo de 4 y cada mano de distinto palo de 12; por eso ves as-rey de distinto palo tres veces más a menudo que as-rey del mismo palo.",
    "useH2": "Cómo usar una tabla como esta",
    "useP": "Una tabla ordena las manos por su fuerza bruta, antes de que nadie haya actuado. En una mesa real, juega menos manos desde las primeras posiciones, donde muchos jugadores hablan después de ti, y más desde el botón y el cut-off. Sube en lugar de igualar con las manos que juegues, retírate con las del fondo de la tabla y recuerda que el valor de una mano depende también de las pilas, las ciegas y tus rivales. En un torneo de PokerTH las ciegas no paran de subir, así que el abanico de manos que vale la pena jugar se amplía a medida que las pilas se acortan.",
    "faqH2": "Preguntas",
    "faq": [
      [
        "¿Cuál es la mejor mano inicial del Texas Hold’em?",
        "Los ases servidos. Ganan el {aa1} contra una mano aleatoria y son favoritos contra cualquier otra mano inicial."
      ],
      [
        "¿Es mejor as-rey que una pareja de damas?",
        "No, pero está igualado: las damas ganan el {qqak} contra as-rey de distinto palo. Contra una mano aleatoria, as-rey del mismo palo gana el {aks1} y las damas el {qq1}."
      ],
      [
        "¿Cuántas manos iniciales hay?",
        "{combos} combinaciones de dos cartas, que forman 169 manos iniciales distintas: 13 parejas, 78 del mismo palo y 78 de distinto palo."
      ],
      [
        "¿Cuánto vale que una mano sea del mismo palo?",
        "De media, unos {suitGain} más de probabilidad de ganar que la misma mano de distinto palo."
      ],
      [
        "¿Dónde puedo practicar la selección de manos iniciales?",
        "En el modo de entrenamiento de PokerTH contra rivales controlados por el ordenador, con la pestaña Probabilidades mostrando tu probabilidad de ganar según van saliendo las cartas."
      ]
    ]
  },
  "es-419": {
    "title": "Tabla de manos iniciales de póker — las 169 ordenadas | PokerTH",
    "desc": "Las 169 manos iniciales del Texas Hold’em en una tabla, ordenadas por su probabilidad de ganar contra uno, tres y seis rivales. Mismo palo o no, parejas y la peor mano.",
    "ldHeadline": "Tabla de manos iniciales del Texas Hold’em: las 169 manos ordenadas",
    "ldDesc": "Las 169 manos iniciales del Texas Hold’em, en una tabla y ordenadas por su probabilidad de ganar contra una, tres y seis manos al azar.",
    "h1": "Manos iniciales del Texas Hold’em: las 169, ordenadas",
    "lead": "Tus dos cartas privadas son la primera decisión de cada mano. Hay {combos} formas de recibir dos cartas, pero solo 169 manos iniciales distintas si se dejan de lado los palos. Esta página las muestra todas en una tabla con su probabilidad de ganar, calculada simulando un millón de repartos para cada una.",
    "chartH2": "La tabla de manos iniciales",
    "chartP": "Las parejas van por la diagonal. Por encima están las manos del mismo palo (s, de suited: las dos cartas del mismo palo), por debajo las de distinto palo (o, de offsuit). T significa diez. El número de cada casilla es la probabilidad de que la mano le gane a una mano al azar cuando se reparten las cinco cartas de la mesa, contando los empates como media victoria; cuanto más verde la casilla, más fuerte la mano.",
    "topH2": "Las mejores manos iniciales",
    "topP": "Las veinte manos más fuertes contra un rival, y cómo aguantan contra tres y seis:",
    "cols": [
      "Puesto",
      "Mano",
      "1 rival",
      "3 rivales",
      "6 rivales"
    ],
    "multiH2": "Más rivales, otras manos",
    "multiP": "Toda mano gana menos a medida que entran jugadores al pozo, pero no al mismo ritmo, así que el orden cambia. Los ases servidos siguen arriba: el {aa1} mano a mano y todavía el {aa6} contra seis rivales. Los conectores del mismo palo suben, porque forman escaleras y colores que ganan pozos grandes: siete-seis del mismo palo pasa del puesto {r76s1} mano a mano al {r76s6} contra seis, y jota-diez del mismo palo del {rjts1} al {rjts6}. Las parejas medias bajan — los sietes caen del puesto {r77_1} al {r77_6} — y también las manos de distinto palo con una carta alta y un kicker débil, como rey-seis de distinto palo, del {rk6o1} al {rk6o6}.",
    "suitedH2": "¿Del mismo palo o de distinto palo?",
    "suitedP": "Dos cartas del mismo palo valen más que las mismas cartas de distinto palo: en promedio, cerca de un {suitGain} más en las 78 combinaciones de dos valores, entre el {suitMin} y el {suitMax} según la mano. Importa, pero menos de lo que parece: los colores son raros, y una mano débil del mismo palo sigue siendo una mano débil.",
    "worstH2": "La peor mano inicial",
    "worstP": "Contra una mano al azar, tres-dos de distinto palo es la más débil de todas, con el {w32}. Siete-dos de distinto palo, a menudo llamada la peor mano del póker, gana el {w72} y ocupa el puesto {r72} de 169 mano a mano — pero contra seis rivales es la última de todas, porque sus dos cartas están demasiado separadas para formar escalera juntas y son demasiado bajas para ganar mucho más.",
    "countH2": "Con qué frecuencia te toca cada tipo",
    "countP": "De las {combos} manos posibles de dos cartas, {pairCombos} son parejas ({pairPct}), {suitedCombos} son del mismo palo ({suitedPct}) y {offCombos} son de distinto palo ({offPct}). Cada pareja puede salir de 6 formas, cada mano del mismo palo de 4 formas y cada mano de distinto palo de 12 formas — por eso ves as-rey de distinto palo tres veces más seguido que as-rey del mismo palo.",
    "useH2": "Cómo usar una tabla como esta",
    "useP": "Una tabla ordena las manos por fuerza bruta, antes de que nadie haya actuado. En una mesa real, juega menos manos desde las primeras posiciones, donde muchos jugadores hablan después de ti, y más desde el botón y el cut-off. Haz Raise en lugar de Call con las manos que juegues, haz Fold con las de la parte baja de la tabla, y recuerda que el valor de una mano también depende de las pilas, las ciegas y tus rivales. En un torneo de PokerTH las ciegas no paran de subir, así que las manos que vale la pena jugar se amplían a medida que las pilas se acortan.",
    "faqH2": "Preguntas",
    "faq": [
      [
        "¿Cuál es la mejor mano inicial en Texas Hold’em?",
        "Los ases servidos. Ganan el {aa1} contra una mano al azar y son favoritos contra cualquier otra mano inicial."
      ],
      [
        "¿As-rey es mejor que una pareja de reinas?",
        "No, pero es parejo: las reinas le ganan el {qqak} a as-rey de distinto palo. Contra una mano al azar, as-rey del mismo palo gana el {aks1} y las reinas el {qq1}."
      ],
      [
        "¿Cuántas manos iniciales hay?",
        "{combos} combinaciones de dos cartas, que forman 169 manos iniciales distintas: 13 parejas, 78 del mismo palo y 78 de distinto palo."
      ],
      [
        "¿Cuánto vale que una mano sea del mismo palo?",
        "En promedio, cerca de un {suitGain} más de probabilidad de ganar que la misma mano de distinto palo."
      ],
      [
        "¿Dónde puedo practicar la selección de manos iniciales?",
        "En el modo de entrenamiento de PokerTH contra rivales de la computadora, con la pestaña Probabilidades mostrando tu probabilidad de ganar a medida que salen las cartas."
      ]
    ]
  },
  et: {
    "title": "Pokkeri stardikäte tabel — kõik 169 kätt pingereas | PokerTH",
    "desc": "Kõik 169 Texas Hold’emi stardikätt ühes tabelis, järjestatud võiduvõimaluse järgi ühe, kolme ja kuue vastase vastu. Sama mast või eri mastid, paarid ja halvim käsi.",
    "ldHeadline": "Texas Hold’emi stardikäte tabel: kõik 169 kätt pingereas",
    "ldDesc": "Texas Hold’emi 169 stardikätt tabelis, järjestatud võiduvõimaluse järgi ühe, kolme ja kuue juhusliku käe vastu.",
    "h1": "Texas Hold’emi stardikäed: kõik 169 pingereas",
    "lead": "Sinu kaks taskukaarti on iga käe esimene otsus. Kahte kaarti saab jagada {combos} viisil, kuid kui mastid kõrvale jätta, on erinevaid stardikätt ainult 169. See leht näitab neid kõiki tabelis koos võiduvõimalusega, mis on iga käe jaoks arvutatud miljoni jagamise simuleerimisel.",
    "chartH2": "Stardikäte tabel",
    "chartP": "Paarid kulgevad mööda diagonaali. Selle kohal on sama masti käed (s, mõlemad kaardid samast mastist), all eri mastides käed (o). T tähendab kümmet. Arv igas ruudus on tõenäosus, et käsi võidab ühe juhusliku käe vastu, kui jagatakse kõik viis lauakaarti, kusjuures viik loetakse pooleks võiduks; mida rohelisem ruut, seda tugevam käsi.",
    "topH2": "Parimad stardikäed",
    "topP": "Kakskümmend tugevaimat kätt ühe vastase vastu ja kuidas need peavad vastu kolmele ja kuuele:",
    "cols": [
      "Koht",
      "Käsi",
      "1 vastane",
      "3 vastast",
      "6 vastast"
    ],
    "multiH2": "Rohkem vastaseid, teised käed",
    "multiP": "Iga käsi võidab harvemini, kui potti tuleb mängijaid juurde, kuid mitte ühesuguses tempos, nii et järjestus muutub. Taskuässad jäävad tippu: kahekesi {aa1}, kuue vastase vastu ikka {aa6}. Sama masti järjestikused kaardid tõusevad, sest need teevad ridu ja maste, mis võidavad suuri potte: sama masti seitse-kuus liigub kahekesi kohalt {r76s1} kuue vastase vastu kohale {r76s6}, sama masti poiss-kümme kohalt {rjts1} kohale {rjts6}. Keskmised paarid langevad — seitsmesed kukuvad kohalt {r77_1} kohale {r77_6} — ja samuti eri mastides käed, millel on üks kõrge kaart ja nõrk kicker, näiteks eri mastides kuningas-kuus, kohalt {rk6o1} kohale {rk6o6}.",
    "suitedH2": "Sama mast või eri mastid?",
    "suitedP": "Kaks sama masti kaarti on väärt rohkem kui samad kaardid eri mastides — keskmiselt umbes {suitGain} rohkem üle kõigi 78 tugevuspaari, olenevalt käest {suitMin} kuni {suitMax}. See loeb, aga vähem, kui paistab: mastid tulevad harva ja nõrk sama masti käsi on ikkagi nõrk käsi.",
    "worstH2": "Halvim stardikäsi",
    "worstP": "Ühe juhusliku käe vastu on kõige nõrgem eri mastides kolm-kaks, {w32}. Eri mastides seitse-kaks, mida nimetatakse sageli pokkeri halvimaks käeks, võidab {w72} ja on kahekesi 169-st kohal {r72} — kuid kuue vastase vastu on see päris viimane, sest selle kaks kaarti on liiga kaugel, et koos rida moodustada, ja liiga madalad, et palju muud võita.",
    "countH2": "Kui tihti iga liiki kätt saad",
    "countP": "{combos} võimalikust kahekaardilisest käest on {pairCombos} paarid ({pairPct}), {suitedCombos} sama masti ({suitedPct}) ja {offCombos} eri mastides ({offPct}). Iga paari saab jagada 6 viisil, iga sama masti kätt 4 viisil, iga eri mastides kätt 12 viisil — seepärast näed eri mastides äss-kuningat kolm korda sagedamini kui sama masti äss-kuningat.",
    "useH2": "Kuidas sellist tabelit kasutada",
    "useP": "Tabel järjestab käed puhta tugevuse järgi, enne kui keegi on tegutsenud. Päris laua taga mängi varajasest positsioonist, kus pärast sind tegutseb palju mängijaid, vähem käsi ning jagaja nupult ja cut-off’ilt rohkem. Mängitavate kätega pigem tõsta kui maksa, loobu tabeli alumisest osast ja pea meeles, et käe väärtus sõltub ka žetoonivarudest, blindidest ja vastastest. PokerTH turniiril blindid aina tõusevad, nii et žetoonivarude kahanedes muutub mängimist väärt käsi rohkemaks.",
    "faqH2": "Küsimused",
    "faq": [
      [
        "Mis on Texas Hold’emi parim stardikäsi?",
        "Taskuässad. Need võidavad ühe juhusliku käe vastu {aa1} ja on soosikud iga teise stardikäe vastu."
      ],
      [
        "Kas äss-kuningas on parem kui emandate paar?",
        "Ei, aga vahe on väike: emandad võidavad eri mastides äss-kuninga vastu {qqak}. Ühe juhusliku käe vastu võidab sama masti äss-kuningas {aks1} ja emandad {qq1}."
      ],
      [
        "Mitu stardikätt on olemas?",
        "{combos} kahekaardilist kombinatsiooni, mis moodustavad 169 erinevat stardikätt: 13 paari, 78 sama masti ja 78 eri mastides."
      ],
      [
        "Kui palju on sama masti käsi väärt?",
        "Keskmiselt umbes {suitGain} suurem võiduvõimalus kui samal käel eri mastides."
      ],
      [
        "Kus saan stardikäte valikut harjutada?",
        "PokerTH treeningrežiimis arvutivastaste vastu, kus vahekaart Šansid näitab kaartide avanedes sinu võiduvõimalust."
      ]
    ]
  },
  eu: {
    "title": "Pokerreko hasierako eskuen taula — 169 eskuak sailkatuta | PokerTH",
    "desc": "Texas Hold’em-eko 169 hasierako eskuen taula, 1, 3 eta 6 aurkariren aurka irabazteko aukeraren arabera sailkatuta. Kolore berekoak ala ez, bikoteak, esku txarrena.",
    "ldHeadline": "Texas Hold’em-eko hasierako eskuen taula: 169 eskuak sailkatuta",
    "ldDesc": "Texas Hold’em-eko 169 hasierako eskuak, taulan jarrita eta ausazko esku baten, hiruren eta seiren aurka irabazteko aukeraren arabera sailkatuta.",
    "h1": "Texas Hold’em-eko hasierako eskuak: 169ak, sailkatuta",
    "lead": "Zure bi poltsikoko kartak dira esku bakoitzeko lehen erabakia. {combos} modu daude bi karta jasotzeko, baina koloreak alde batera utzita 169 hasierako esku desberdin baino ez. Orrialde honek guztiak taulan biltzen ditu irabazteko duten aukerarekin, bakoitzarentzat milioi bat banaketa simulatuz kalkulatuta.",
    "chartH2": "Hasierako eskuen taula",
    "chartP": "Bikoteak diagonalean behera doaz. Haren gainean kolore bereko eskuak daude (s, bi kartak kolore berekoak), eta azpian kolore desberdinekoak (o). T-k hamarra esan nahi du. Lauki bakoitzeko zenbakia eskuak ausazko esku baten aurka irabazteko duen aukera da, board-eko bost kartak banatzen direnean, berdinketak garaipen erdi gisa kontatuta; zenbat eta berdeagoa laukia, orduan eta indartsuagoa eskua.",
    "topH2": "Hasierako esku onenak",
    "topP": "Aurkari baten aurka indartsuenak diren hogei eskuak, eta hiru eta sei aurkariren aurka nola eusten dioten:",
    "cols": [
      "Postua",
      "Eskua",
      "Aurkari 1",
      "3 aurkari",
      "6 aurkari"
    ],
    "multiH2": "Aurkari gehiago, esku desberdinak",
    "multiP": "Esku orok gutxiagotan irabazten du jokalariak potera batu ahala, baina ez erritmo berean, eta sailkapena aldatu egiten da. Poltsikoko batekoak goian geratzen dira: kasuen {aa1} heads-up, eta oraindik kasuen {aa6} sei aurkariren aurka. Kolore bereko konektoreak gora doaz, pote handiak irabazten dituzten eskailerak eta koloreak osatzen dituztelako: zazpi-sei kolore berekoa heads-up {r76s1}. postutik sei aurkariren aurka {r76s6}. postura igotzen da, eta J-hamar kolore berekoa {rjts1}. postutik {rjts6}. postura. Erdiko bikoteak jaitsi egiten dira — zazpikoak {r77_1}. postutik {r77_6}. postura erortzen dira —, baita karta altu bakarra eta kicker ahula duten kolore desberdineko eskuak ere, errege-sei kolore desberdinekoa adibidez, {rk6o1}. postutik {rk6o6}. postura.",
    "suitedH2": "Kolore berekoa ala desberdinekoa?",
    "suitedP": "Kolore bereko bi kartek gehiago balio dute kolore desberdineko karta berberek baino — batez beste {suitGain} inguru gehiago 78 balio-bikote guztietan, eskuaren arabera {suitMin} eta {suitMax} artean. Garrantzia du, baina dirudiena baino gutxiago: koloreak arraroak dira, eta kolore bereko esku ahula esku ahula da oraindik ere.",
    "worstH2": "Hasierako esku txarrena",
    "worstP": "Ausazko esku baten aurka, hiru-bi kolore desberdinekoa da guztien artean ahulena, kasuen {w32} irabazita. Zazpi-bi kolore desberdinekoak, askotan pokerreko esku txarrena deitzen denak, kasuen {w72} irabazten du eta heads-up 169tik {r72}. postuan dago — baina sei aurkariren aurka azkena da, bere bi kartak elkarrengandik urrunegi daudelako elkarrekin eskailera bat osatzeko, eta baxuegiak beste ezer askorekin irabazteko.",
    "countH2": "Zenbatetan jasotzen duzun mota bakoitza",
    "countP": "Bi kartako {combos} esku posibleetatik, {pairCombos} bikoteak dira ({pairPct}), {suitedCombos} kolore berekoak ({suitedPct}) eta {offCombos} kolore desberdinekoak ({offPct}). Bikote bakoitza 6 modutan bana daiteke, kolore bereko esku bakoitza 4 modutan eta kolore desberdineko esku bakoitza 12 modutan — horregatik ikusten duzu bateko-errege kolore desberdinekoa bateko-errege kolore berekoa baino hiru aldiz maizago.",
    "useH2": "Nola erabili horrelako taula bat",
    "useP": "Taula batek eskuak indar hutsaren arabera sailkatzen ditu, inork jokatu aurretik. Benetako mahai batean, jokatu esku gutxiago hasierako posizioan, jokalari askok zure ondoren jokatzen baitute, eta gehiago botoitik eta cut-off-etik. Egin Raise Call egin beharrean jokatzen dituzun eskuekin, egin Fold taularen beheko aldeko eskuekin, eta gogoratu esku baten balioa txipen, blinden eta zure aurkarien araberakoa ere badela. PokerTH txapelketa batean blindak etengabe igotzen dira, beraz jokatzea merezi duten eskuak zabaldu egiten dira txipak gutxitu ahala.",
    "faqH2": "Galderak",
    "faq": [
      [
        "Zein da Texas Hold’em-eko hasierako esku onena?",
        "Poltsikoko batekoak. Ausazko esku baten aurka kasuen {aa1} irabazten dute, eta faborito dira beste edozein hasierako eskuren aurka."
      ],
      [
        "Bateko-errege dama-bikotea baino hobea al da?",
        "Ez, baina gertu dago: damek kasuen {qqak} irabazten dute kolore desberdineko bateko-erregeren aurka. Ausazko esku baten aurka, kolore bereko bateko-erregek kasuen {aks1} irabazten du eta damek kasuen {qq1}."
      ],
      [
        "Zenbat hasierako esku daude?",
        "Bi kartako {combos} konbinazio, 169 hasierako esku desberdin osatzen dituztenak: 13 bikote, 78 kolore berekoak eta 78 kolore desberdinekoak."
      ],
      [
        "Zenbat balio du kolore bereko esku batek?",
        "Batez beste, {suitGain} inguru irabazteko aukera gehiago kolore desberdineko esku berak baino."
      ],
      [
        "Non landu dezaket hasierako eskuen aukeraketa?",
        "PokerTH-ren entrenamendu moduan, ordenagailuko aurkarien aurka, Aukerak fitxak irabazteko duzun aukera erakusten duela kartak ateratzen diren heinean."
      ]
    ]
  },
  fa: {
    "title": "جدول دست‌های شروع پوکر — رتبه‌بندی هر ۱۶۹ دست | PokerTH",
    "desc": "هر ۱۶۹ دست شروع Texas Hold’em در یک جدول، رتبه‌بندی‌شده بر اساس شانس برد در برابر یک، سه و شش حریف. هم‌خال یا ناهم‌خال، جفت‌ها و بدترین دست.",
    "ldHeadline": "جدول دست‌های شروع Texas Hold’em: رتبه‌بندی هر ۱۶۹ دست",
    "ldDesc": "۱۶۹ دست شروع Texas Hold’em، در یک جدول و رتبه‌بندی‌شده بر اساس شانس برد در برابر یک، سه و شش دست تصادفی.",
    "h1": "دست‌های شروع در Texas Hold’em: هر ۱۶۹ دست، به ترتیب قدرت",
    "lead": "دو کارت بستهٔ شما نخستین تصمیم هر دست است. {combos} حالت برای گرفتن دو کارت وجود دارد، اما اگر خال‌ها را کنار بگذاریم فقط ۱۶۹ دست شروع متفاوت می‌ماند. این صفحه همهٔ آن‌ها را با شانس بردشان در یک جدول نشان می‌دهد؛ این شانس با شبیه‌سازی یک میلیون پخش برای هر دست به دست آمده است.",
    "chartH2": "جدول دست‌های شروع",
    "chartP": "جفت‌ها روی قطر جدول قرار دارند. بالای قطر دست‌های هم‌خال (s، هر دو کارت از یک خال) و پایین آن دست‌های ناهم‌خال (o) هستند. T به معنای ده است. عدد هر خانه شانس آن است که دست در برابر یک دست تصادفی ببرد، وقتی هر پنج کارت میز پخش شده باشد؛ تساوی نیم برد حساب می‌شود. هر چه خانه سبزتر باشد، دست قوی‌تر است.",
    "topH2": "بهترین دست‌های شروع",
    "topP": "بیست دست قوی‌تر در برابر یک حریف، و عملکردشان در برابر سه و شش حریف:",
    "cols": [
      "رتبه",
      "دست",
      "۱ حریف",
      "۳ حریف",
      "۶ حریف"
    ],
    "multiH2": "حریفان بیشتر، دست‌های متفاوت",
    "multiP": "هر دستی با ورود بازیکنان بیشتر به پات کمتر می‌برد، اما نه به یک اندازه، پس رتبه‌بندی تغییر می‌کند. جفت آس در صدر می‌ماند: {aa1} در بازی رودررو و هنوز {aa6} در برابر شش حریف. کارت‌های پیاپی هم‌خال بالا می‌روند، چون استریت و فلاش می‌سازند که پات‌های بزرگ را می‌برند: هفت-شش هم‌خال از رتبهٔ {r76s1} در بازی رودررو به رتبهٔ {r76s6} در برابر شش حریف می‌رسد، سرباز-دهِ هم‌خال از {rjts1} به {rjts6}. جفت‌های متوسط پایین می‌آیند — هفت‌ها از رتبهٔ {r77_1} به {r77_6} سقوط می‌کنند — و همین‌طور دست‌های ناهم‌خال با یک کارت بالا و کیکر ضعیف، مثل شاه-شش ناهم‌خال، از {rk6o1} به {rk6o6}.",
    "suitedH2": "هم‌خال یا ناهم‌خال؟",
    "suitedP": "دو کارت از یک خال از همان کارت‌ها به‌صورت ناهم‌خال ارزش بیشتری دارند — به‌طور میانگین حدود {suitGain} بیشتر در میان همهٔ ۷۸ ترکیب ارزش‌ها، از {suitMin} تا {suitMax} بسته به دست. این مهم است، اما کمتر از آنچه به نظر می‌رسد: فلاش کمیاب است، و دست هم‌خال ضعیف همچنان دستی ضعیف است.",
    "worstH2": "بدترین دست شروع",
    "worstP": "در برابر یک دست تصادفی، سه-دوی ناهم‌خال با {w32} ضعیف‌ترین دست است. هفت-دوی ناهم‌خال، که اغلب بدترین دست پوکر نامیده می‌شود، {w72} می‌برد و در بازی رودررو رتبهٔ {r72} از ۱۶۹ را دارد — اما در برابر شش حریف درست آخرین دست است، چون دو کارتش برای ساختن استریت با هم بیش از حد از هم دورند و برای بردن با چیز دیگری بیش از حد پایین.",
    "countH2": "هر نوع دست چند وقت یک‌بار به شما می‌رسد",
    "countP": "از {combos} دست دوکارتی ممکن، {pairCombos} دست جفت است ({pairPct})، {suitedCombos} دست هم‌خال ({suitedPct}) و {offCombos} دست ناهم‌خال ({offPct}). هر جفت به ۶ حالت پخش می‌شود، هر دست هم‌خال به ۴ حالت و هر دست ناهم‌خال به ۱۲ حالت — به همین دلیل آس-شاه ناهم‌خال سه برابر آس-شاه هم‌خال به دستتان می‌رسد.",
    "useH2": "چگونه از چنین جدولی استفاده کنیم",
    "useP": "جدول دست‌ها را بر اساس قدرت خام رتبه‌بندی می‌کند، پیش از آنکه کسی حرکتی کرده باشد. سر یک میز واقعی، از موقعیت‌های اول، که بازیکنان زیادی پس از شما حرکت می‌کنند، دست‌های کمتری بازی کنید و از دکمهٔ دیلر و کات‌آف دست‌های بیشتری. با دست‌هایی که بازی می‌کنید به‌جای کال، ریز کنید، دست‌های پایین جدول را فولد کنید، و به یاد داشته باشید که ارزش یک دست به تعداد ژتون‌ها، بلایندها و حریفانتان هم بستگی دارد. در تورنمنت PokerTH بلایندها مدام بالا می‌روند، پس هر چه ژتون‌ها کمتر شود، دست‌های بیشتری ارزش بازی کردن پیدا می‌کنند.",
    "faqH2": "پرسش‌ها",
    "faq": [
      [
        "بهترین دست شروع در Texas Hold’em چیست؟",
        "جفت آس. در برابر یک دست تصادفی {aa1} می‌برد و در برابر هر دست شروع دیگری برتری دارد."
      ],
      [
        "آیا آس-شاه از جفت بی‌بی بهتر است؟",
        "نه، اما فاصله کم است: بی‌بی‌ها در برابر آس-شاه ناهم‌خال {qqak} می‌برند. در برابر یک دست تصادفی، آس-شاه هم‌خال {aks1} و بی‌بی‌ها {qq1} می‌برند."
      ],
      [
        "چند دست شروع وجود دارد؟",
        "{combos} ترکیب دوکارتی، که ۱۶۹ دست شروع متفاوت می‌سازند: ۱۳ جفت، ۷۸ دست هم‌خال و ۷۸ دست ناهم‌خال."
      ],
      [
        "دست هم‌خال چقدر ارزش دارد؟",
        "به‌طور میانگین حدود {suitGain} شانس برد بیشتر از همان دست به‌صورت ناهم‌خال."
      ],
      [
        "کجا می‌توانم انتخاب دست شروع را تمرین کنم؟",
        "در حالت تمرین PokerTH در برابر حریفان رایانه‌ای، با زبانهٔ «شانس‌ها» که همزمان با آمدن کارت‌ها شانس بردتان را نشان می‌دهد."
      ]
    ]
  },
  fi: {
    "title": "Pokerin aloituskädet — kaikki 169 kättä järjestyksessä | PokerTH",
    "desc": "Kaikki 169 Texas Hold’emin aloituskättä taulukossa, järjestettynä voittomahdollisuuden mukaan 1, 3 ja 6 vastustajaa vastaan. Samaa vai eri maata, parit, huonoin käsi.",
    "ldHeadline": "Texas Hold’emin aloituskäsitaulukko: kaikki 169 kättä järjestyksessä",
    "ldDesc": "Texas Hold’emin 169 aloituskättä taulukkona, järjestettynä voittomahdollisuuden mukaan yhtä, kolmea ja kuutta satunnaista kättä vastaan.",
    "h1": "Texas Hold’emin aloituskädet: kaikki 169 järjestyksessä",
    "lead": "Kaksi omaa korttiasi ovat jokaisen käden ensimmäinen päätös. Kaksi korttia voi saada {combos} eri tavalla, mutta kun maat jätetään huomiotta, erilaisia aloituskäsiä on vain 169. Tällä sivulla ne kaikki ovat taulukossa voittomahdollisuuksineen, jotka on laskettu simuloimalla miljoona jakoa kullekin kädelle.",
    "chartH2": "Aloituskäsitaulukko",
    "chartP": "Parit kulkevat lävistäjää pitkin. Sen yläpuolella ovat samaa maata olevat kädet (s, molemmat kortit samaa maata), alapuolella eri maata olevat kädet (o). T tarkoittaa kymppiä. Kunkin ruudun luku on todennäköisyys, että käsi voittaa yhden satunnaisen käden, kun kaikki viisi pöytäkorttia jaetaan, ja tasapeli lasketaan puoleksi voitoksi; mitä vihreämpi ruutu, sitä vahvempi käsi.",
    "topH2": "Parhaat aloituskädet",
    "topP": "Kaksikymmentä vahvinta kättä yhtä vastustajaa vastaan ja miten ne pärjäävät kolmea ja kuutta vastaan:",
    "cols": [
      "Sija",
      "Käsi",
      "1 vastustaja",
      "3 vastustajaa",
      "6 vastustajaa"
    ],
    "multiH2": "Enemmän vastustajia, eri kädet",
    "multiP": "Jokainen käsi voittaa harvemmin, kun pottiin tulee lisää pelaajia, mutta ei samaa tahtia, joten järjestys muuttuu. Ässäpari kädessä pysyy kärjessä: {aa1} kaksinpelissä ja yhä {aa6} kuutta vastustajaa vastaan. Samaa maata olevat peräkkäiset kortit nousevat, koska ne tekevät suoria ja värejä, jotka voittavat isoja potteja: seiska-kutonen samaa maata nousee kaksinpelin sijalta {r76s1} sijalle {r76s6} kuutta vastaan, jätkä-kymppi samaa maata sijalta {rjts1} sijalle {rjts6}. Keskiparit putoavat — seiskapari sijalta {r77_1} sijalle {r77_6} — samoin eri maata olevat kädet, joissa on yksi korkea kortti ja heikko kicker, kuten kuningas-kutonen eri maata, sijalta {rk6o1} sijalle {rk6o6}.",
    "suitedH2": "Samaa maata vai eri maata?",
    "suitedP": "Kaksi samaa maata olevaa korttia ovat arvokkaammat kuin samat kortit eri maata — keskimäärin noin {suitGain} enemmän kaikissa 78 arvoparissa, kädestä riippuen vähintään {suitMin} ja enintään {suitMax}. Sillä on merkitystä, mutta vähemmän kuin näyttää: värit ovat harvinaisia, ja heikko samaa maata oleva käsi on silti heikko käsi.",
    "worstH2": "Huonoin aloituskäsi",
    "worstP": "Yhtä satunnaista kättä vastaan kolmonen-kakkonen eri maata on kaikista heikoin: {w32}. Seiska-kakkonen eri maata, jota kutsutaan usein pokerin huonoimmaksi kädeksi, voittaa {w72} ja on kaksinpelissä sijalla {r72} 169:stä — mutta kuutta vastustajaa vastaan se on aivan viimeinen, koska sen kaksi korttia ovat liian kaukana toisistaan muodostaakseen yhdessä suoran ja liian matalia voittaakseen juuri muuta.",
    "countH2": "Kuinka usein saat kunkin tyypin",
    "countP": "{combos} mahdollisesta kahden kortin kädestä {pairCombos} on pareja ({pairPct}), {suitedCombos} samaa maata ({suitedPct}) ja {offCombos} eri maata ({offPct}). Jokaisen parin voi saada 6 tavalla, jokaisen samaa maata olevan käden 4 tavalla ja jokaisen eri maata olevan käden 12 tavalla — siksi näet ässä-kuninkaan eri maata kolme kertaa niin usein kuin ässä-kuninkaan samaa maata.",
    "useH2": "Näin käytät tällaista taulukkoa",
    "useP": "Taulukko asettaa kädet järjestykseen pelkän vahvuuden mukaan, ennen kuin kukaan on toiminut. Oikeassa pöydässä pelaa vähemmän käsiä aikaisesta asemasta, jossa moni pelaaja toimii jälkeesi, ja enemmän jakajanapista ja cutoffista. Korota mieluummin kuin maksa niillä käsillä, joita pelaat, luovuta taulukon heikoimmat kädet ja muista, että käden arvo riippuu myös pinoista, blindeistä ja vastustajistasi. PokerTH-turnauksessa blindit nousevat jatkuvasti, joten pelaamisen arvoisten käsien joukko laajenee, kun pinot lyhenevät.",
    "faqH2": "Kysymyksiä",
    "faq": [
      [
        "Mikä on Texas Hold’emin paras aloituskäsi?",
        "Ässäpari kädessä. Se voittaa yhden satunnaisen käden {aa1} ja on suosikki jokaista muuta aloituskättä vastaan."
      ],
      [
        "Onko ässä-kuningas parempi kuin rouvapari?",
        "Ei, mutta ero on pieni: rouvat voittavat ässä-kuninkaan eri maata {qqak}. Yhtä satunnaista kättä vastaan ässä-kuningas samaa maata voittaa {aks1} ja rouvat {qq1}."
      ],
      [
        "Montako aloituskättä on olemassa?",
        "{combos} kahden kortin yhdistelmää, joista tulee 169 erilaista aloituskättä: 13 paria, 78 samaa maata ja 78 eri maata."
      ],
      [
        "Kuinka paljon samaa maata oleva käsi on arvokkaampi?",
        "Keskimäärin noin {suitGain} enemmän voittomahdollisuutta kuin sama käsi eri maata."
      ],
      [
        "Missä voin harjoitella aloituskäsien valintaa?",
        "PokerTH:n harjoittelutilassa tietokonevastustajia vastaan, kun Mahdollisuudet-välilehti näyttää voittotodennäköisyytesi korttien tullessa esiin."
      ]
    ]
  },
  fil: {
    "title": "Tsart ng panimulang kamay — ranggo ng lahat ng 169 | PokerTH",
    "desc": "Ang 169 panimulang kamay ng Texas Hold’em sa isang tsart, nakaranggo sa tsansang manalo kontra isa, tatlo at anim na kalaban. Suited o offsuit, pares, pinakamasama.",
    "ldHeadline": "Tsart ng panimulang kamay sa Texas Hold’em: lahat ng 169, nakaranggo",
    "ldDesc": "Ang 169 na panimulang kamay ng Texas Hold’em, nakatsart at nakaranggo ayon sa tsansang manalo laban sa isa, tatlo at anim na random na kamay.",
    "h1": "Mga panimulang kamay sa Texas Hold’em: lahat ng 169, nakaranggo",
    "lead": "Ang dalawa mong saradong baraha ang unang desisyon sa bawat kamay. May {combos} paraan para mabigyan ng dalawang baraha, pero 169 lang ang magkakaibang panimulang kamay kapag isinantabi ang mga palo. Ipinapakita ng pahinang ito ang lahat ng iyon sa isang tsart kasama ang tsansa nilang manalo, na kinuwenta sa pag-simulate ng isang milyong deal para sa bawat isa.",
    "chartH2": "Ang tsart ng panimulang kamay",
    "chartP": "Nasa dayagonal ang mga pares. Sa itaas nito ang mga suited na kamay (s, iisa ang palo ng dalawang baraha), sa ibaba ang mga offsuit na kamay (o). Ang T ay sampu. Ang numero sa bawat kahon ay ang tsansang manalo ang kamay laban sa isang random na kamay kapag nailabas na ang limang baraha sa mesa, at binibilang na kalahating panalo ang tabla; habang mas berde ang kahon, mas malakas ang kamay.",
    "topH2": "Ang pinakamagagandang panimulang kamay",
    "topP": "Ang dalawampung pinakamalakas na kamay laban sa isang kalaban, at kung paano sila tumatagal laban sa tatlo at anim:",
    "cols": [
      "Ranggo",
      "Kamay",
      "1 kalaban",
      "3 kalaban",
      "6 na kalaban"
    ],
    "multiH2": "Mas maraming kalaban, ibang mga kamay",
    "multiP": "Mas madalang manalo ang bawat kamay habang mas maraming manlalaro ang pumapasok sa pot, pero hindi sa parehong bilis, kaya nagbabago ang ranggo. Nananatili sa itaas ang pares ng alas: {aa1} sa heads-up, {aa6} pa rin laban sa anim na kalaban. Umaakyat ang mga suited connector, dahil bumubuo sila ng straight at flush na nananalo ng malalaking pot: umaakyat ang siyete-sais suited mula ranggo {r76s1} sa heads-up hanggang ranggo {r76s6} laban sa anim, ang sota-diyes suited mula {rjts1} hanggang {rjts6}. Bumababa ang katamtamang pares — bumabagsak ang pares ng siyete mula ranggo {r77_1} hanggang {r77_6} — at ganoon din ang mga offsuit na kamay na may isang mataas na baraha at mahinang kicker, gaya ng hari-sais offsuit, mula {rk6o1} hanggang {rk6o6}.",
    "suitedH2": "Suited o offsuit?",
    "suitedP": "Mas mahalaga ang dalawang barahang iisa ang palo kaysa sa parehong mga baraha na offsuit — mga {suitGain} na higit sa karaniwan sa lahat ng 78 kombinasyon ng dalawang ranggo, mula {suitMin} hanggang {suitMax} depende sa kamay. Mahalaga ito, pero mas kaunti kaysa sa inaakala: bihira ang flush, at mahinang kamay pa rin ang mahinang suited na kamay.",
    "worstH2": "Ang pinakamasamang panimulang kamay",
    "worstP": "Laban sa isang random na kamay, ang tres-dos offsuit ang pinakamahina sa lahat sa {w32}. Ang siyete-dos offsuit, na madalas tawaging pinakamasamang kamay sa poker, ay nananalo nang {w72} at nasa ranggo {r72} sa 169 sa heads-up — pero laban sa anim na kalaban, ito ang pinakahuli, dahil masyadong magkalayo ang dalawang baraha nito para magkasamang bumuo ng straight at masyadong mababa para manalo ng iba pa.",
    "countH2": "Gaano kadalas mo makukuha ang bawat uri",
    "countP": "Sa {combos} posibleng kamay na dalawang baraha, {pairCombos} ang pares ({pairPct}), {suitedCombos} ang suited ({suitedPct}) at {offCombos} ang offsuit ({offPct}). Puwedeng maibigay ang bawat pares sa 6 na paraan, ang bawat suited na kamay sa 4 na paraan, at ang bawat offsuit na kamay sa 12 paraan — kaya tatlong beses na mas madalas mong makikita ang alas-hari offsuit kaysa sa alas-hari suited.",
    "useH2": "Paano gamitin ang ganitong tsart",
    "useP": "Niraranggo ng tsart ang mga kamay ayon sa hilaw na lakas, bago pa kumilos ang sinuman. Sa totoong mesa, maglaro ng mas kaunting kamay mula sa maagang posisyon, kung saan maraming manlalaro ang kikilos pagkatapos mo, at mas marami mula sa button at sa cut-off. Mag-Raise sa halip na mag-Call sa mga kamay na nilalaro mo, mag-Fold sa mga kamay sa ibaba ng tsart, at tandaan na nakadepende rin ang halaga ng kamay sa mga stack, sa mga blind at sa mga kalaban mo. Sa torneo ng PokerTH, patuloy na tumataas ang mga blind, kaya lumalawak ang mga kamay na sulit laruin habang lumiliit ang mga stack.",
    "faqH2": "Mga tanong",
    "faq": [
      [
        "Ano ang pinakamagandang panimulang kamay sa Texas Hold’em?",
        "Ang pares ng alas. Nananalo ito nang {aa1} laban sa isang random na kamay, at ito ang paborito laban sa bawat ibang panimulang kamay."
      ],
      [
        "Mas maganda ba ang alas-hari kaysa sa pares ng reyna?",
        "Hindi, pero dikit: nananalo ang pares ng reyna nang {qqak} laban sa alas-hari offsuit. Laban sa isang random na kamay, nananalo ang alas-hari suited nang {aks1} at ang pares ng reyna nang {qq1}."
      ],
      [
        "Ilan ang panimulang kamay?",
        "{combos} kombinasyon ng dalawang baraha, na bumubuo ng 169 na magkakaibang panimulang kamay: 13 pares, 78 suited at 78 offsuit."
      ],
      [
        "Gaano kahalaga ang suited na kamay?",
        "Mga {suitGain} na mas mataas na tsansang manalo kaysa sa parehong kamay na offsuit, sa karaniwan."
      ],
      [
        "Saan ako puwedeng magsanay sa pagpili ng panimulang kamay?",
        "Sa mode na pagsasanay ng PokerTH laban sa mga kalabang kompyuter, kasama ang tab na Odds na nagpapakita ng tsansa mong manalo habang lumalabas ang mga baraha."
      ]
    ]
  },
  fr: {
    "title": "Tableau des mains de départ au poker — les 169 classées | PokerTH",
    "desc": "Les 169 mains de départ du Texas Hold’em en un tableau, classées selon leurs chances de gagner contre un, trois et six adversaires. Assorties ou non, paires, pire main.",
    "ldHeadline": "Tableau des mains de départ au Texas Hold’em : les 169 mains classées",
    "ldDesc": "Les 169 mains de départ du Texas Hold’em, présentées en tableau et classées selon leurs chances de gagner contre une, trois et six mains aléatoires.",
    "h1": "Mains de départ au Texas Hold’em : les 169, classées",
    "lead": "Vos deux cartes privées sont la première décision de chaque main. Il existe {combos} façons de recevoir deux cartes, mais seulement 169 mains de départ différentes une fois les couleurs mises de côté. Cette page les présente toutes en tableau avec leurs chances de gagner, calculées en simulant un million de donnes pour chacune.",
    "chartH2": "Le tableau des mains de départ",
    "chartP": "Les paires occupent la diagonale. Au-dessus se trouvent les mains assorties (s, deux cartes de la même couleur), en dessous les mains dépareillées (o). T désigne le dix. Le nombre dans chaque case est la probabilité que la main gagne contre une main aléatoire quand les cinq cartes communes sont distribuées, une égalité comptant pour une demi-victoire ; plus la case est verte, plus la main est forte.",
    "topH2": "Les meilleures mains de départ",
    "topP": "Les vingt mains les plus fortes contre un adversaire, et leur tenue contre trois et six :",
    "cols": [
      "Rang",
      "Main",
      "1 adversaire",
      "3 adversaires",
      "6 adversaires"
    ],
    "multiH2": "Plus d’adversaires, d’autres mains",
    "multiP": "Chaque main gagne moins souvent à mesure que des joueurs entrent dans le pot, mais pas au même rythme, si bien que le classement change. La paire d’as servie reste en tête : {aa1} en tête-à-tête, encore {aa6} contre six adversaires. Les connecteurs assortis montent, car ils font des quintes et des couleurs qui remportent de gros pots : sept-six assortis passe du rang {r76s1} en tête-à-tête au rang {r76s6} contre six, valet-dix assortis du rang {rjts1} au rang {rjts6}. Les paires moyennes reculent — la paire de sept tombe du rang {r77_1} au rang {r77_6} — tout comme les mains dépareillées avec une seule carte haute et un kicker faible, comme roi-six dépareillés, du rang {rk6o1} au rang {rk6o6}.",
    "suitedH2": "Assorties ou dépareillées ?",
    "suitedP": "Deux cartes de la même couleur valent plus que les mêmes cartes dépareillées — environ {suitGain} de plus en moyenne sur les 78 combinaisons de deux rangs différents, de {suitMin} à {suitMax} selon la main. Cela compte, mais moins qu’il n’y paraît : les couleurs sont rares, et une main faible assortie reste une main faible.",
    "worstH2": "La pire main de départ",
    "worstP": "Contre une main aléatoire, trois-deux dépareillés est la plus faible de toutes, avec {w32}. Sept-deux dépareillés, souvent présenté comme la pire main du poker, gagne {w72} et se classe au rang {r72} sur 169 en tête-à-tête — mais contre six adversaires, c’est la toute dernière, car ses deux cartes sont trop éloignées pour former une quinte ensemble et trop basses pour gagner grand-chose d’autre.",
    "countH2": "À quelle fréquence vous recevez chaque type de main",
    "countP": "Sur les {combos} mains de deux cartes possibles, {pairCombos} sont des paires ({pairPct}), {suitedCombos} sont assorties ({suitedPct}) et {offCombos} sont dépareillées ({offPct}). Chaque paire peut être distribuée de 6 façons, chaque main assortie de 4 façons, chaque main dépareillée de 12 façons — c’est pourquoi vous voyez as-roi dépareillés trois fois plus souvent qu’as-roi assortis.",
    "useH2": "Comment utiliser un tel tableau",
    "useP": "Un tableau classe les mains selon leur force brute, avant que quiconque ait agi. À une vraie table, jouez moins de mains en début de parole, quand beaucoup de joueurs parlent après vous, et davantage depuis le bouton et le cut-off. Relancez plutôt que de suivre avec les mains que vous jouez, couchez celles du bas du tableau, et rappelez-vous que la valeur d’une main dépend aussi des tapis, des blindes et de vos adversaires. Dans un tournoi PokerTH, les blindes ne cessent de monter : l’éventail des mains jouables s’élargit à mesure que les tapis raccourcissent.",
    "faqH2": "Questions",
    "faq": [
      [
        "Quelle est la meilleure main de départ au Texas Hold’em ?",
        "La paire d’as servie. Elle gagne {aa1} contre une main aléatoire, et elle est favorite contre toutes les autres mains de départ."
      ],
      [
        "As-roi est-il meilleur qu’une paire de dames ?",
        "Non, mais c’est serré : les dames gagnent {qqak} contre as-roi dépareillés. Contre une main aléatoire, as-roi assortis gagne {aks1} et les dames {qq1}."
      ],
      [
        "Combien y a-t-il de mains de départ ?",
        "{combos} combinaisons de deux cartes, qui forment 169 mains de départ différentes : 13 paires, 78 assorties et 78 dépareillées."
      ],
      [
        "Combien vaut une main assortie ?",
        "En moyenne, environ {suitGain} de chances de gagner en plus que la même main dépareillée."
      ],
      [
        "Où m’entraîner à choisir mes mains de départ ?",
        "Dans le mode entraînement de PokerTH contre des adversaires gérés par l’ordinateur, avec l’onglet Chances qui affiche vos chances de gagner au fur et à mesure que les cartes sortent."
      ]
    ]
  },
  ga: {
    "title": "Cairt lámh tosaigh pócair — na 169 lámh ar fad rangaithe | PokerTH",
    "desc": "Na 169 lámh tosaigh Texas Hold’em i gcairt, rangaithe de réir seans buaite in aghaidh céile comhraic amháin, triúir agus seisir. Culaith, péirí, an lámh is measa.",
    "ldHeadline": "Cairt lámh tosaigh Texas Hold’em: na 169 lámh ar fad rangaithe",
    "ldDesc": "Na 169 lámh tosaigh Texas Hold’em, i gcairt agus rangaithe de réir a seans buaite in aghaidh lámh randamach amháin, trí lámh agus sé lámh randamacha.",
    "h1": "Lámha tosaigh Texas Hold’em: na 169 ar fad, rangaithe",
    "lead": "Is iad do dhá chárta póca an chéad chinneadh i ngach lámh. Tá {combos} bealach ann le dhá chárta a fháil, ach níl ach 169 lámh tosaigh éagsúla ann nuair a chuirtear na culaithe i leataobh. Léiríonn an leathanach seo iad uile i gcairt lena seans buaite, arna ríomh trí mhilliún déileáil a insamhladh do gach ceann acu.",
    "chartH2": "An chairt lámh tosaigh",
    "chartP": "Ritheann na péirí síos an trasnán. Os a chionn tá na lámha den chulaith chéanna (s, an dá chárta den chulaith chéanna), faoina bhun na lámha de chulaithe éagsúla (o). Seasann T do dheich. Is í an uimhir i ngach cearnóg an seans go mbuafaidh an lámh in aghaidh lámh randamach amháin nuair a dhéileáiltear na cúig chárta phobail ar fad, agus comhscór á chomhaireamh mar leathbhua; dá ghlaise an chearnóg, is ea is láidre an lámh.",
    "topH2": "Na lámha tosaigh is fearr",
    "topP": "Na fiche lámh is láidre in aghaidh céile comhraic amháin, agus conas a sheasann siad in aghaidh triúir agus seisir:",
    "cols": [
      "Rang",
      "Lámh",
      "In aghaidh 1",
      "In aghaidh 3",
      "In aghaidh 6"
    ],
    "multiH2": "Níos mó céilí comhraic, lámha eile",
    "multiP": "Buann gach lámh níos annamh de réir mar a théann imreoirí isteach sa phota, ach ní ar an ráta céanna, agus mar sin athraíonn an rangú. Fanann aonta póca ar barr: {aa1} heads-up, agus {aa6} fós in aghaidh seisir. Téann nascóirí den chulaith chéanna in airde, mar go ndéanann siad sruthanna agus dathanna a bhuann potaí móra: téann seacht-sé den chulaith chéanna ó rang {r76s1} heads-up go rang {r76s6} in aghaidh seisir, agus cuireata-deich den chulaith chéanna ó {rjts1} go {rjts6}. Titeann péirí láir — titeann seachtanna ó rang {r77_1} go {r77_6} — agus mar an gcéanna lámha de chulaithe éagsúla a bhfuil cárta ard amháin agus kicker lag acu, mar shampla rí-sé de chulaithe éagsúla, ó {rk6o1} go {rk6o6}.",
    "suitedH2": "Den chulaith chéanna nó de chulaithe éagsúla?",
    "suitedP": "Is fiú níos mó dhá chárta den chulaith chéanna ná na cártaí céanna de chulaithe éagsúla — thart ar {suitGain} níos mó ar an meán thar na 78 teaglaim de dhá luach éagsúla, idir {suitMin} agus {suitMax} ag brath ar an lámh. Is tábhachtach é, ach níos lú ná mar a fheictear: is annamh dath, agus is lámh lag fós í lámh lag den chulaith chéanna.",
    "worstH2": "An lámh tosaigh is measa",
    "worstP": "In aghaidh lámh randamach amháin, is í trí-dó de chulaithe éagsúla an lámh is laige ar fad, ag {w32}. Buann seacht-dó de chulaithe éagsúla, ar a dtugtar an lámh is measa sa phócar go minic, {w72} agus tá sí ag rang {r72} as 169 heads-up — ach in aghaidh seisir is í an ceann deireanach ar fad í, mar go bhfuil a dhá chárta rófhada óna chéile le sruth a dhéanamh le chéile agus ró-íseal le mórán eile a bhuachan.",
    "countH2": "Cé chomh minic a dhéileáiltear gach cineál duit",
    "countP": "As an {combos} lámh dhá chárta is féidir, is péirí iad {pairCombos} ({pairPct}), tá {suitedCombos} den chulaith chéanna ({suitedPct}) agus {offCombos} de chulaithe éagsúla ({offPct}). Is féidir gach péire a dhéileáil ar 6 bhealach, gach lámh den chulaith chéanna ar 4 bhealach, gach lámh de chulaithe éagsúla ar 12 bhealach — sin é an fáth a bhfeiceann tú aon-rí de chulaithe éagsúla trí huaire chomh minic le haon-rí den chulaith chéanna.",
    "useH2": "Conas cairt mar seo a úsáid",
    "useP": "Rangaíonn cairt lámha de réir a neart lom, sula ndearna aon duine gníomh. Ag bord fíor, imir níos lú lámh ó shuíomh luath, áit a ngníomhaíonn go leor imreoirí i do dhiaidh, agus níos mó ón gcnaipe agus ón cut-off. Ardaigh seachas glaoch leis na lámha a imríonn tú, caith uait na lámha ag bun na cairte, agus cuimhnigh go mbraitheann luach láimhe freisin ar na cruacha, ar na blinds agus ar do chéilí comhraic. I gcomórtas PokerTH ardaíonn na blinds i gcónaí, agus mar sin leathnaíonn raon na lámh is fiú a imirt de réir mar a ghiorraíonn na cruacha.",
    "faqH2": "Ceisteanna",
    "faq": [
      [
        "Cad é an lámh tosaigh is fearr in Texas Hold’em?",
        "Aonta póca. Buann siad {aa1} in aghaidh lámh randamach amháin, agus is iad is fabhraí in aghaidh gach lámh tosaigh eile."
      ],
      [
        "An fearr aon-rí ná péire banríonacha?",
        "Ní fearr, ach tá sé gar: buann banríonacha {qqak} in aghaidh aon-rí de chulaithe éagsúla. In aghaidh lámh randamach amháin buann aon-rí den chulaith chéanna {aks1} agus banríonacha {qq1}."
      ],
      [
        "Cé mhéad lámh tosaigh atá ann?",
        "{combos} teaglaim dhá chárta, a dhéanann 169 lámh tosaigh éagsúla: 13 péire, 78 den chulaith chéanna agus 78 de chulaithe éagsúla."
      ],
      [
        "Cé mhéad is fiú lámh den chulaith chéanna?",
        "Thart ar {suitGain} níos mó seans buaite ná an lámh chéanna de chulaithe éagsúla, ar an meán."
      ],
      [
        "Cá háit ar féidir liom roghnú lámh tosaigh a chleachtadh?",
        "I mód cleachtaidh PokerTH in aghaidh céilí comhraic ríomhaire, agus an cluaisín Seans ag taispeáint do sheans buaite de réir mar a nochtar na cártaí."
      ]
    ]
  },
  gd: {
    "title": "Clàr làmhan tòiseachaidh pòcair — na 169 an òrdugh | PokerTH",
    "desc": "Clàr nan 169 làmhan tòiseachaidh Texas Hold’em, a rèir an cothrom buannachadh an aghaidh 1, 3 is 6 luchd-dùbhlain. Aon dath no nach eil, paidhrichean, an làmh as miosa.",
    "ldHeadline": "Clàr làmhan tòiseachaidh Texas Hold’em: na 169 làmhan air an rangachadh",
    "ldDesc": "Na 169 làmhan tòiseachaidh aig Texas Hold’em, ann an clàr agus air an rangachadh a rèir an cothrom buannachadh an aghaidh aon, trì is sia làmhan air thuaiream.",
    "h1": "Làmhan tòiseachaidh Texas Hold’em: na 169 uile, air an rangachadh",
    "lead": "’S e do dhà chairt dhùinte a’ chiad cho-dhùnadh aig gach làimh. Tha {combos} dòighean ann air dà chairt fhaighinn, ach chan eil ach 169 làmhan tòiseachaidh eadar-dhealaichte ann ma chuirear na dathan an dàrna taobh. Tha an duilleag seo gan sealltainn uile ann an clàr le an cothrom buannachadh, air obrachadh a-mach le millean riarachadh air an samhlachadh airson gach tè.",
    "chartH2": "An clàr làmhan tòiseachaidh",
    "chartP": "Tha na paidhrichean a’ ruith sìos an trastain. Os a chionn tha na làmhan dhen aon dath (s, an dà chairt dhen aon dath), fodha na làmhan le dathan eadar-dhealaichte (o). Tha T a’ seasamh airson deich. ’S e an àireamh anns gach ceàrnag an cothrom gum buannaich an làmh an aghaidh aon làimh air thuaiream nuair a thèid na còig cairtean bùird uile a riarachadh, le co-ionannachd air a cunntadh mar leth-bhuaidh; mar as uaine a’ cheàrnag, ’s ann as làidire an làmh.",
    "topH2": "Na làmhan tòiseachaidh as fheàrr",
    "topP": "Na fichead làmhan as làidire an aghaidh aon neach-dùbhlain, agus mar a sheasas iad an aghaidh triùir is sianar:",
    "cols": [
      "Rang",
      "Làmh",
      "An aghaidh 1",
      "An aghaidh 3",
      "An aghaidh 6"
    ],
    "multiH2": "Barrachd luchd-dùbhlain, làmhan eile",
    "multiP": "Bidh gach làmh a’ buannachadh nas ainneamh mar a thig barrachd chluicheadairean a-steach dhan phota, ach chan ann aig an aon astar, agus mar sin atharraichidh an rangachadh. Fanaidh paidhir àsaichean aig a’ bharr: {aa1} fear an aghaidh fir, agus {aa6} fhathast an aghaidh sianar. Dìridh cairtean leantainneach dhen aon dath, oir nì iad sreathan is làmhan aon dath a bhuannaicheas potaichean mòra: thèid seachd-sia dhen aon dath bho rang {r76s1} fear an aghaidh fir gu rang {r76s6} an aghaidh sianar, is balach-deich dhen aon dath bho {rjts1} gu {rjts6}. Tuitidh paidhrichean meadhanach — tuitidh paidhir sheachdan bho rang {r77_1} gu {r77_6} — agus mar sin cuideachd làmhan le dathan eadar-dhealaichte aig a bheil aon chairt àrd is kicker lag, mar rìgh-sia le dathan eadar-dhealaichte, bho {rk6o1} gu {rk6o6}.",
    "suitedH2": "An aon dath no dathan eadar-dhealaichte?",
    "suitedP": "Is fhiach dà chairt dhen aon dath barrachd na na h-aon chairtean le dathan eadar-dhealaichte — mu {suitGain} a bharrachd an cuibheas thar nan 78 paidhrichean luachan uile, bho {suitMin} gu {suitMax} a rèir na làimhe. Tha e cudromach, ach nas lugha na shaoileadh tu: tha làmhan aon dath ainneamh, agus tha làmh lag dhen aon dath fhathast na làimh lag.",
    "worstH2": "An làmh tòiseachaidh as miosa",
    "worstP": "An aghaidh aon làimh air thuaiream, ’s e trì-dhà le dathan eadar-dhealaichte an tè as laige dhiubh uile aig {w32}. Buannaichidh seachd-dhà le dathan eadar-dhealaichte, ris an canar gu tric an làmh as miosa ann am pòcair, {w72}, agus tha i aig rang {r72} à 169 fear an aghaidh fir — ach an aghaidh sianar ’s i an tè mu dheireadh buileach, oir tha an dà chairt aice ro fhada bho chèile airson sreath a dhèanamh còmhla agus ro ìosal airson mòran eile a bhuannachadh.",
    "countH2": "Dè cho tric ’s a gheibh thu gach seòrsa",
    "countP": "Dhe na {combos} làmhan dà-chairt a ghabhas a bhith ann, tha {pairCombos} nam paidhrichean ({pairPct}), {suitedCombos} dhen aon dath ({suitedPct}) agus {offCombos} le dathan eadar-dhealaichte ({offPct}). Faodar gach paidhir a riarachadh ann an 6 dòighean, gach làmh dhen aon dath ann an 4 dòighean agus gach làmh le dathan eadar-dhealaichte ann an 12 dòighean — is sin as coireach gum faic thu às-rìgh le dathan eadar-dhealaichte trì tursan cho tric ri às-rìgh dhen aon dath.",
    "useH2": "Mar a chleachdas tu clàr mar seo",
    "useP": "Bidh clàr a’ rangachadh làmhan a rèir an neirt lom, mus do rinn duine gnìomh. Aig fìor bhòrd, cluich nas lugha de làmhan bho ionad tràth, far am bi mòran chluicheadairean ag obrachadh às do dhèidh, agus barrachd bho phutan an riarachaidh agus an cut-off. Dèan Raise seach Call leis na làmhan a chluicheas tu, dèan Fold le bonn a’ chlàir, agus cuimhnich gu bheil luach làimhe an urra cuideachd ris na stuic, na dallabhan agus do luchd-dùbhlain. Ann am farpais PokerTH bidh na dallabhan ag èirigh fad na h-ùine, agus mar sin fàsaidh an raon de làmhan as fhiach a chluich mar a dh’fhàsas na stuic goirid.",
    "faqH2": "Ceistean",
    "faq": [
      [
        "Dè an làmh tòiseachaidh as fheàrr ann an Texas Hold’em?",
        "Paidhir àsaichean. Buannaichidh iad {aa1} an aghaidh aon làimh air thuaiream, agus is iadsan as coltaiche buannachadh an aghaidh gach làimh tòiseachaidh eile."
      ],
      [
        "A bheil às-rìgh nas fheàrr na paidhir bhanrighrean?",
        "Chan eil, ach tha e dlùth: buannaichidh banrighrean {qqak} an aghaidh às-rìgh le dathan eadar-dhealaichte. An aghaidh aon làimh air thuaiream, buannaichidh às-rìgh dhen aon dath {aks1} agus banrighrean {qq1}."
      ],
      [
        "Cò mheud làmh tòiseachaidh a th’ ann?",
        "{combos} measgachaidhean dà-chairt, a nì 169 làmhan tòiseachaidh eadar-dhealaichte: 13 paidhrichean, 78 dhen aon dath agus 78 le dathan eadar-dhealaichte."
      ],
      [
        "Dè as fhiach làmh dhen aon dath?",
        "Mu {suitGain} a bharrachd cothrom buannachadh na an aon làmh le dathan eadar-dhealaichte, an cuibheas."
      ],
      [
        "Càite an urrainn dhomh taghadh làmhan tòiseachaidh a chleachdadh?",
        "Ann am modh trèanaidh PokerTH an aghaidh luchd-dùbhlain coimpiutair, leis an taba Cothroman a’ sealltainn do chothrom buannachadh fhad ’s a thig na cairtean a-mach."
      ]
    ]
  },
  gl: {
    "title": "Táboa de mans iniciais do póker — as 169 clasificadas | PokerTH",
    "desc": "As 169 mans iniciais do Texas Hold’em, ordenadas pola probabilidade de gañar contra 1, 3 e 6 rivais. Mesmo pau ou paus diferentes, parellas e a peor man.",
    "ldHeadline": "Táboa de mans iniciais do Texas Hold’em: as 169 mans clasificadas",
    "ldDesc": "As 169 mans iniciais do Texas Hold’em nunha táboa, clasificadas pola súa probabilidade de gañar contra unha, tres e seis mans ao chou.",
    "h1": "Mans iniciais do Texas Hold’em: as 169, clasificadas",
    "lead": "As túas dúas cartas tapadas son a primeira decisión de cada man. Hai {combos} xeitos de recibir dúas cartas, pero só 169 mans iniciais diferentes se deixamos de lado os paus. Esta páxina amósaas todas nunha táboa coa súa probabilidade de gañar, calculada simulando un millón de repartos para cada unha.",
    "chartH2": "A táboa de mans iniciais",
    "chartP": "As parellas van pola diagonal. Por riba dela están as mans do mesmo pau (s, as dúas cartas do mesmo pau), por debaixo as mans de paus diferentes (o). T significa dez. O número de cada cadro é a probabilidade de que a man gañe contra unha man ao chou cando saen as cinco cartas da mesa, contando os empates como media vitoria; canto máis verde o cadro, máis forte a man.",
    "topH2": "As mellores mans iniciais",
    "topP": "As vinte mans máis fortes contra un rival, e como aguantan contra tres e contra seis:",
    "cols": [
      "Posto",
      "Man",
      "1 rival",
      "3 rivais",
      "6 rivais"
    ],
    "multiH2": "Máis rivais, outras mans",
    "multiP": "Todas as mans gañan menos a miúdo a medida que entran xogadores no bote, pero non ao mesmo ritmo, así que a clasificación cambia. Os ases servidos seguen arriba: o {aa1} un contra un, aínda o {aa6} contra seis rivais. As cartas consecutivas do mesmo pau soben, porque fan escaleiras e cores que gañan botes grandes: sete-seis do mesmo pau pasa do posto {r76s1} un contra un ao posto {r76s6} contra seis, jota-dez do mesmo pau do {rjts1} ao {rjts6}. As parellas medias baixan — os setes caen do posto {r77_1} ao {r77_6} — e tamén as mans de paus diferentes cunha carta alta e un kicker feble, como rei-seis de paus diferentes, do {rk6o1} ao {rk6o6}.",
    "suitedH2": "Mesmo pau ou paus diferentes?",
    "suitedP": "Dúas cartas do mesmo pau valen máis cás mesmas cartas de paus diferentes — arredor dun {suitGain} máis de media sobre os 78 pares de valores, dende o {suitMin} ata o {suitMax} segundo a man. Importa, pero menos do que parece: as cores son raras, e unha man feble do mesmo pau segue a ser unha man feble.",
    "worstH2": "A peor man inicial",
    "worstP": "Contra unha man ao chou, tres-dous de paus diferentes é a máis feble de todas, co {w32}. Sete-dous de paus diferentes, a miúdo chamada a peor man do póker, gaña o {w72} e ocupa o posto {r72} de 169 un contra un — pero contra seis rivais é a última de todas, porque as súas dúas cartas están demasiado lonxe para facer escaleira xuntas e son demasiado baixas para gañar moito máis.",
    "countH2": "Con que frecuencia che toca cada tipo",
    "countP": "Das {combos} mans posibles de dúas cartas, {pairCombos} son parellas ({pairPct}), {suitedCombos} son do mesmo pau ({suitedPct}) e {offCombos} de paus diferentes ({offPct}). Cada parella pode saír de 6 xeitos, cada man do mesmo pau de 4 e cada man de paus diferentes de 12 — por iso ves ás-rei de paus diferentes tres veces máis a miúdo ca ás-rei do mesmo pau.",
    "useH2": "Como usar unha táboa coma esta",
    "useP": "Unha táboa clasifica as mans pola súa forza bruta, antes de que ninguén actúe. Nunha mesa real, xoga menos mans desde posición temperá, onde moitos xogadores actúan despois ca ti, e máis desde o botón e o cut-off. Sube en vez de igualar coas mans que xogas, retírate co fondo da táboa e lembra que o valor dunha man depende tamén das pilas, das cegas e dos teus rivais. Nun torneo de PokerTH as cegas non paran de subir, así que as mans que paga a pena xogar amplíanse a medida que as pilas se fan curtas.",
    "faqH2": "Preguntas",
    "faq": [
      [
        "Cal é a mellor man inicial no Texas Hold’em?",
        "Os ases servidos. Gañan o {aa1} contra unha man ao chou e son favoritos contra calquera outra man inicial."
      ],
      [
        "É mellor ás-rei ca unha parella de damas?",
        "Non, pero está igualado: as damas gañan o {qqak} contra ás-rei de paus diferentes. Contra unha man ao chou, ás-rei do mesmo pau gaña o {aks1} e as damas o {qq1}."
      ],
      [
        "Cantas mans iniciais hai?",
        "{combos} combinacións de dúas cartas, que dan 169 mans iniciais diferentes: 13 parellas, 78 do mesmo pau e 78 de paus diferentes."
      ],
      [
        "Canto vale unha man do mesmo pau?",
        "De media, arredor dun {suitGain} máis de probabilidade de gañar ca a mesma man de paus diferentes."
      ],
      [
        "Onde podo practicar a selección de mans iniciais?",
        "No modo adestramento de PokerTH contra rivais do ordenador, coa lapela Posibilidades amosando a túa probabilidade de gañar a medida que saen as cartas."
      ]
    ]
  },
  gu: {
    "title": "પોકર શરૂઆતના હેન્ડ્સ ચાર્ટ — બધા 169 હેન્ડ્સનો ક્રમ | PokerTH",
    "desc": "Texas Hold’em ના બધા 169 શરૂઆતના હેન્ડ્સ એક ચાર્ટમાં, એક, ત્રણ અને છ પ્રતિસ્પર્ધીઓ સામે જીતવાની શક્યતા મુજબ ક્રમમાં. સૂટેડ કે ઓફસૂટ, જોડીઓ અને સૌથી ખરાબ હેન્ડ.",
    "ldHeadline": "Texas Hold’em શરૂઆતના હેન્ડ્સ ચાર્ટ: બધા 169 હેન્ડ્સનો ક્રમ",
    "ldDesc": "Texas Hold’em ના 169 શરૂઆતના હેન્ડ્સ, ચાર્ટમાં અને એક, ત્રણ અને છ રેન્ડમ હેન્ડ્સ સામે જીતવાની શક્યતા મુજબ ક્રમમાં.",
    "h1": "Texas Hold’em ના શરૂઆતના હેન્ડ્સ: બધા 169, ક્રમમાં",
    "lead": "તમારાં બે હોલ કાર્ડ્સ દરેક હેન્ડનો પહેલો નિર્ણય છે. બે કાર્ડ્સ મળવાની {combos} રીતો છે, પણ સૂટ્સને બાજુએ રાખો તો ફક્ત 169 જુદા જુદા શરૂઆતના હેન્ડ્સ છે. આ પાનું એ બધાને તેમની જીતવાની શક્યતા સાથે ચાર્ટમાં બતાવે છે, જે દરેક માટે દસ લાખ ડીલ્સનું સિમ્યુલેશન કરીને ગણવામાં આવી છે.",
    "chartH2": "શરૂઆતના હેન્ડ્સનો ચાર્ટ",
    "chartP": "જોડીઓ વિકર્ણ પર ઉપરથી નીચે જાય છે. તેની ઉપર સૂટેડ હેન્ડ્સ છે (s, બંને કાર્ડ્સ એક જ સૂટનાં), અને નીચે ઓફસૂટ હેન્ડ્સ (o). T એટલે દસ. દરેક ખાનામાંનો આંકડો એ શક્યતા છે કે બોર્ડનાં પાંચેય કાર્ડ્સ વહેંચાય ત્યારે તે હેન્ડ એક રેન્ડમ હેન્ડ સામે જીતે, બરાબરીને અડધી જીત ગણીને; ખાનું જેટલું વધુ લીલું, હેન્ડ એટલો વધુ મજબૂત.",
    "topH2": "શ્રેષ્ઠ શરૂઆતના હેન્ડ્સ",
    "topP": "એક પ્રતિસ્પર્ધી સામે સૌથી મજબૂત વીસ હેન્ડ્સ, અને ત્રણ અને છ સામે તેઓ કેવા ટકે છે:",
    "cols": [
      "ક્રમ",
      "હેન્ડ",
      "1 પ્રતિસ્પર્ધી",
      "3 પ્રતિસ્પર્ધી",
      "6 પ્રતિસ્પર્ધી"
    ],
    "multiH2": "વધુ પ્રતિસ્પર્ધીઓ, જુદા હેન્ડ્સ",
    "multiP": "પોટમાં ખેલાડીઓ જોડાતા જાય તેમ દરેક હેન્ડ ઓછી વાર જીતે છે, પણ એક જ દરે નહીં, તેથી ક્રમ બદલાય છે. પોકેટ એક્કા ટોચ પર જ રહે છે: હેડ્સ-અપમાં {aa1}, અને છ પ્રતિસ્પર્ધીઓ સામે પણ {aa6}. સૂટેડ કનેક્ટર્સ ઉપર ચઢે છે, કારણ કે તે મોટા પોટ જીતતા સ્ટ્રેટ અને ફ્લશ બનાવે છે: સૂટેડ સાત-છ હેડ્સ-અપમાં ક્રમ {r76s1} પરથી છ સામે ક્રમ {r76s6} પર પહોંચે છે, સૂટેડ ગુલામ-દસ {rjts1} પરથી {rjts6} પર. મધ્યમ જોડીઓ નીચે ઊતરે છે — સાતની જોડી ક્રમ {r77_1} પરથી {r77_6} પર સરકે છે — અને એવું જ એક ઊંચા કાર્ડ અને નબળા કિકરવાળા ઓફસૂટ હેન્ડ્સનું થાય છે, જેમ કે ઓફસૂટ બાદશાહ-છ, {rk6o1} પરથી {rk6o6} પર.",
    "suitedH2": "સૂટેડ કે ઓફસૂટ?",
    "suitedP": "એક જ સૂટનાં બે કાર્ડ્સની કિંમત એ જ કાર્ડ્સ ઓફસૂટ હોય તેના કરતાં વધુ છે — રેન્કની બધી 78 જોડીઓમાં સરેરાશ આશરે {suitGain} વધુ, હેન્ડ મુજબ {suitMin} થી {suitMax}. ફરક પડે છે, પણ દેખાય છે તેના કરતાં ઓછો: ફ્લશ ભાગ્યે જ બને છે, અને નબળો સૂટેડ હેન્ડ પણ નબળો જ રહે છે.",
    "worstH2": "સૌથી ખરાબ શરૂઆતનો હેન્ડ",
    "worstP": "એક રેન્ડમ હેન્ડ સામે, ઓફસૂટ ત્રણ-બે {w32} સાથે બધામાં સૌથી નબળો છે. ઓફસૂટ સાત-બે, જેને ઘણી વાર પોકરનો સૌથી ખરાબ હેન્ડ કહેવાય છે, {w72} જીતે છે અને હેડ્સ-અપમાં 169 માંથી ક્રમ {r72} પર છે — પણ છ પ્રતિસ્પર્ધીઓ સામે તે એકદમ છેલ્લો છે, કારણ કે તેનાં બે કાર્ડ્સ સાથે મળીને સ્ટ્રેટ બનાવવા માટે એકબીજાથી ખૂબ દૂર છે અને બીજું કંઈ ખાસ જીતવા માટે ખૂબ નીચાં છે.",
    "countH2": "દરેક પ્રકાર તમને કેટલી વાર મળે છે",
    "countP": "બે કાર્ડ્સના {combos} શક્ય હેન્ડ્સમાંથી, {pairCombos} જોડીઓ છે ({pairPct}), {suitedCombos} સૂટેડ છે ({suitedPct}) અને {offCombos} ઓફસૂટ છે ({offPct}). દરેક જોડી 6 રીતે મળી શકે, દરેક સૂટેડ હેન્ડ 4 રીતે, દરેક ઓફસૂટ હેન્ડ 12 રીતે — એટલે જ તમને ઓફસૂટ એક્કો-બાદશાહ સૂટેડ એક્કો-બાદશાહ કરતાં ત્રણ ગણો વધુ વાર મળે છે.",
    "useH2": "આવો ચાર્ટ કેવી રીતે વાપરવો",
    "useP": "ચાર્ટ કોઈ ખેલાડી કંઈ કરે તે પહેલાં, હેન્ડ્સને તેમની કાચી તાકાત મુજબ ક્રમ આપે છે. સાચા ટેબલ પર, શરૂઆતની પોઝિશનમાંથી ઓછા હેન્ડ્સ રમો, જ્યાં ઘણા ખેલાડીઓ તમારા પછી રમે છે, અને બટન અને કટ-ઓફ પરથી વધુ. તમે જે હેન્ડ્સ રમો તેમાં Call ને બદલે Raise કરો, ચાર્ટના તળિયાના હેન્ડ્સ Fold કરો, અને યાદ રાખો કે હેન્ડની કિંમત સ્ટેક્સ, બ્લાઇન્ડ્સ અને તમારા પ્રતિસ્પર્ધીઓ પર પણ આધાર રાખે છે. PokerTH ટુર્નામેન્ટમાં બ્લાઇન્ડ્સ વધતા જ રહે છે, તેથી સ્ટેક્સ નાના થાય તેમ રમવા લાયક હેન્ડ્સ વધતા જાય છે.",
    "faqH2": "પ્રશ્નો",
    "faq": [
      [
        "Texas Hold’em માં શ્રેષ્ઠ શરૂઆતનો હેન્ડ કયો છે?",
        "પોકેટ એક્કા. તે એક રેન્ડમ હેન્ડ સામે {aa1} જીતે છે, અને બીજા દરેક શરૂઆતના હેન્ડ સામે ફેવરિટ છે."
      ],
      [
        "શું એક્કો-બાદશાહ રાણીની જોડી કરતાં સારો છે?",
        "ના, પણ ટક્કર નજીકની છે: રાણીની જોડી ઓફસૂટ એક્કો-બાદશાહ સામે {qqak} જીતે છે. એક રેન્ડમ હેન્ડ સામે સૂટેડ એક્કો-બાદશાહ {aks1} અને રાણીની જોડી {qq1} જીતે છે."
      ],
      [
        "કેટલા શરૂઆતના હેન્ડ્સ હોય છે?",
        "બે કાર્ડ્સનાં {combos} કોમ્બિનેશન, જે 169 જુદા જુદા શરૂઆતના હેન્ડ્સ બનાવે છે: 13 જોડીઓ, 78 સૂટેડ અને 78 ઓફસૂટ."
      ],
      [
        "સૂટેડ હેન્ડની કિંમત કેટલી?",
        "સરેરાશ, એ જ હેન્ડ ઓફસૂટ હોય તેના કરતાં જીતવાની આશરે {suitGain} વધુ શક્યતા."
      ],
      [
        "શરૂઆતના હેન્ડ્સની પસંદગીની પ્રેક્ટિસ ક્યાં કરી શકું?",
        "PokerTH ના પ્રેક્ટિસ મોડમાં કમ્પ્યુટર પ્રતિસ્પર્ધીઓ સામે, જ્યાં «ઓડ્સ» ટૅબ કાર્ડ્સ ખૂલતાં જાય તેમ તમારી જીતવાની શક્યતા બતાવે છે."
      ]
    ]
  },
  ha: {
    "title": "Taswirar hannayen farko na poker — duk hannaye 169 a jere | PokerTH",
    "desc": "Hannayen farko 169 na Texas Hold’em a taswira ɗaya, a jere bisa damar cin nasara a gaban abokin hamayya ɗaya, uku da shida. Suited ko offsuit, pairs da hannu mafi muni.",
    "ldHeadline": "Taswirar hannayen farko na Texas Hold’em: duk hannaye 169 a jere",
    "ldDesc": "Hannayen farko 169 na Texas Hold’em, a taswira kuma an jera su bisa damar cin nasara a gaban hannaye ɗaya, uku da shida na bazata.",
    "h1": "Hannayen farko na Texas Hold’em: duk 169, a jere",
    "lead": "Katunan aljihunka biyu su ne shawarar farko ta kowane hannu. Akwai hanyoyi {combos} na samun katuna biyu, amma hannayen farko daban-daban 169 ne kawai idan aka ajiye launuka a gefe. Wannan shafin yana nuna su duka a taswira tare da damarsu ta cin nasara, wadda aka lissafa ta hanyar kwaikwayon raba katuna miliyan ɗaya ga kowanne.",
    "chartH2": "Taswirar hannayen farko",
    "chartP": "Pairs suna gangarowa a kan layin kusurwa. A samansa akwai hannaye masu launi ɗaya (s, suited: katunan biyu launi ɗaya), a ƙasansa kuma hannaye masu launuka daban (o, offsuit). T yana nufin goma. Lambar da ke cikin kowane akwati ita ce damar hannun ya ci a gaban hannu ɗaya na bazata idan aka raba duk katunan board biyar, ana ƙirga kunnen doki a matsayin rabin nasara; yayin da akwatin ya ƙara kore, hannun ya fi ƙarfi.",
    "topH2": "Mafi kyawun hannayen farko",
    "topP": "Hannaye ashirin mafi ƙarfi a gaban abokin hamayya ɗaya, da yadda suke jurewa a gaban uku da shida:",
    "cols": [
      "Matsayi",
      "Hannu",
      "Abokin hamayya 1",
      "Abokan hamayya 3",
      "Abokan hamayya 6"
    ],
    "multiH2": "Ƙarin abokan hamayya, hannaye daban",
    "multiP": "Kowane hannu yana cin nasara ƙasa da haka yayin da 'yan wasa ke shiga pot, amma ba daidai gwargwado ba, don haka jerin yana canzawa. Pocket aces suna nan a sama: {aa1} a heads-up, har yanzu {aa6} a gaban abokan hamayya shida. Suited connectors suna hawa, saboda suna yin straights da flushes da ke cin manyan pots: seven-six suited yana tashi daga matsayi na {r76s1} a heads-up zuwa matsayi na {r76s6} a gaban shida, jack-ten suited daga {rjts1} zuwa {rjts6}. Pairs na tsakiya suna sauka — sevens suna faɗuwa daga matsayi na {r77_1} zuwa na {r77_6} — haka ma hannaye offsuit masu babban kati ɗaya da kicker mai rauni, kamar king-six offsuit, daga {rk6o1} zuwa {rk6o6}.",
    "suitedH2": "Suited ko offsuit?",
    "suitedP": "Katuna biyu masu launi ɗaya sun fi daraja fiye da katunan iri ɗaya masu launuka daban — kusan {suitGain} fiye a matsakaici a cikin duk haɗe-haɗen ƙima 78, daga {suitMin} zuwa {suitMax} gwargwadon hannun. Yana da muhimmanci, amma ƙasa da yadda yake gani: flushes ba su cika faruwa ba, kuma hannu mai rauni mai launi ɗaya har yanzu hannu ne mai rauni.",
    "worstH2": "Hannun farko mafi muni",
    "worstP": "A gaban hannu ɗaya na bazata, three-two offsuit ne mafi rauni duka da {w32}. Seven-two offsuit, wanda ake yawan kira hannu mafi muni a poker, yana cin {w72} kuma yana matsayi na {r72} cikin 169 a heads-up — amma a gaban abokan hamayya shida shi ne na ƙarshe gaba ɗaya, domin katunansa biyu sun yi nisa da juna sosai don su yi straight tare, kuma sun yi ƙasa sosai don cin wani abu dabam.",
    "countH2": "Sau nawa ake raba maka kowane irin hannu",
    "countP": "Daga cikin hannaye na katuna biyu {combos} da za su yiwu, {pairCombos} pairs ne ({pairPct}), {suitedCombos} suited ne ({suitedPct}) kuma {offCombos} offsuit ne ({offPct}). Ana iya raba kowane pair ta hanyoyi 6, kowane hannu suited ta hanyoyi 4, kowane hannu offsuit kuma ta hanyoyi 12 — shi ya sa kake ganin ace-king offsuit sau uku fiye da ace-king suited.",
    "useH2": "Yadda ake amfani da taswira irin wannan",
    "useP": "Taswira tana jera hannaye bisa ƙarfinsu na asali, kafin kowa ya yi wani mataki. A tebur na gaske, ka buga hannaye kaɗan daga matsayin farko, inda 'yan wasa da yawa ke magana bayanka, ka kuma buga fiye daga button da cut-off. Ka yi raise maimakon call da hannayen da kake bugawa, ka yi fold na ƙasan taswirar, kuma ka tuna cewa darajar hannu ta dogara kuma kan tarin chips, blinds da abokan hamayyarka. A gasar PokerTH blinds suna ci gaba da ƙaruwa, don haka hannayen da suka cancanci a buga suna ƙaruwa yayin da tarin chips ke raguwa.",
    "faqH2": "Tambayoyi",
    "faq": [
      [
        "Wane ne hannun farko mafi kyau a Texas Hold’em?",
        "Pocket aces. Suna cin {aa1} a gaban hannu ɗaya na bazata, kuma su ne ke da rinjaye a gaban kowane hannun farko."
      ],
      [
        "Shin ace-king ya fi pair na queens?",
        "A'a, amma kusa yake: queens suna cin {qqak} a gaban ace-king offsuit. A gaban hannu ɗaya na bazata ace-king suited yana cin {aks1}, queens kuma {qq1}."
      ],
      [
        "Hannayen farko nawa ne akwai?",
        "Haɗe-haɗen katuna biyu {combos}, waɗanda ke yin hannayen farko daban-daban 169: pairs 13, suited 78 da offsuit 78."
      ],
      [
        "Nawa ne darajar hannu suited?",
        "Kusan {suitGain} ƙarin damar cin nasara fiye da hannun iri ɗaya offsuit, a matsakaici."
      ],
      [
        "A ina zan iya koyon zaɓar hannayen farko?",
        "A yanayin horo na PokerTH da abokan hamayya na kwamfuta, tare da Shafin Dama da ke nuna damarka ta cin nasara yayin da katuna ke fitowa."
      ]
    ]
  },
  he: {
    "title": "טבלת ידיים פותחות בפוקר — כל 169 הידיים מדורגות | PokerTH",
    "desc": "כל 169 הידיים הפותחות ב־Texas Hold’em בטבלה אחת, מדורגות לפי הסיכוי לנצח מול יריב אחד, שלושה ושישה. מאותה סדרה או מסדרות שונות, זוגות, והיד הגרועה ביותר.",
    "ldHeadline": "טבלת הידיים הפותחות ב־Texas Hold’em: כל 169 הידיים מדורגות",
    "ldDesc": "169 הידיים הפותחות ב־Texas Hold’em, בטבלה ומדורגות לפי הסיכוי לנצח מול יד אקראית אחת, שלוש ושש.",
    "h1": "ידיים פותחות ב־Texas Hold’em: כל ה־169, מדורגות",
    "lead": "שני הקלפים הסגורים שלכם הם ההחלטה הראשונה בכל יד. יש {combos} דרכים לקבל שני קלפים, אבל רק 169 ידיים פותחות שונות כשמתעלמים מהסדרות. העמוד הזה מציג את כולן בטבלה עם הסיכוי שלהן לנצח, שחושב בסימולציה של מיליון חלוקות לכל יד.",
    "chartH2": "טבלת הידיים הפותחות",
    "chartP": "הזוגות עוברים לאורך האלכסון. מעליו נמצאות הידיים מאותה סדרה (s, שני הקלפים מאותה סדרה), ומתחתיו הידיים מסדרות שונות (o). T מסמן עשר. המספר בכל משבצת הוא הסיכוי שהיד תנצח יד אקראית אחת כשכל חמשת קלפי השולחן מחולקים, כשתיקו נספר כחצי ניצחון; ככל שהמשבצת ירוקה יותר, היד חזקה יותר.",
    "topH2": "הידיים הפותחות הטובות ביותר",
    "topP": "עשרים הידיים החזקות ביותר מול יריב אחד, ואיך הן מחזיקות מעמד מול שלושה ומול שישה:",
    "cols": [
      "דירוג",
      "יד",
      "1 יריב",
      "3 יריבים",
      "6 יריבים"
    ],
    "multiH2": "יותר יריבים, ידיים אחרות",
    "multiP": "כל יד מנצחת פחות ככל שמצטרפים שחקנים לקופה, אבל לא באותו קצב, ולכן הדירוג משתנה. זוג אסים ביד נשאר בראש: {aa1} ראש בראש, ועדיין {aa6} מול שישה יריבים. קלפים רצופים מאותה סדרה מטפסים, כי הם יוצרים סטרייטים ופלאשים שזוכים בקופות גדולות: שבע־שש מאותה סדרה עולה ממקום {r76s1} ראש בראש למקום {r76s6} מול שישה, ונסיך־עשר מאותה סדרה ממקום {rjts1} למקום {rjts6}. זוגות בינוניים יורדים — זוג שביעיות צונח ממקום {r77_1} למקום {r77_6} — וכך גם ידיים מסדרות שונות עם קלף גבוה אחד וקיקר חלש, כמו מלך־שש מסדרות שונות, ממקום {rk6o1} למקום {rk6o6}.",
    "suitedH2": "מאותה סדרה או מסדרות שונות?",
    "suitedP": "שני קלפים מאותה סדרה שווים יותר מאותם קלפים מסדרות שונות — בממוצע בערך {suitGain} יותר על פני כל 78 צמדי הערכים, בין {suitMin} ל־{suitMax} בהתאם ליד. זה משנה, אבל פחות ממה שנראה: פלאשים נדירים, ויד חלשה מאותה סדרה היא עדיין יד חלשה.",
    "worstH2": "היד הפותחת הגרועה ביותר",
    "worstP": "מול יד אקראית אחת, שלוש־שתיים מסדרות שונות היא החלשה מכולן, עם {w32}. שבע־שתיים מסדרות שונות, שמכונה לעתים קרובות היד הגרועה ביותר בפוקר, מנצחת ב־{w72} ומדורגת במקום {r72} מתוך 169 ראש בראש — אבל מול שישה יריבים היא האחרונה ממש, כי שני הקלפים שלה רחוקים מדי זה מזה כדי ליצור יחד סטרייט ונמוכים מדי כדי לנצח בהרבה דברים אחרים.",
    "countH2": "באיזו תדירות מקבלים כל סוג",
    "countP": "מתוך {combos} הידיים האפשריות של שני קלפים, {pairCombos} הן זוגות ({pairPct}), {suitedCombos} מאותה סדרה ({suitedPct}) ו־{offCombos} מסדרות שונות ({offPct}). כל זוג יכול להגיע ב־6 דרכים, כל יד מאותה סדרה ב־4 דרכים וכל יד מסדרות שונות ב־12 דרכים — ולכן תראו אס־מלך מסדרות שונות פי שלושה יותר מאס־מלך מאותה סדרה.",
    "useH2": "איך להשתמש בטבלה כזו",
    "useP": "טבלה מדרגת ידיים לפי החוזק הגולמי שלהן, לפני שמישהו פעל. בשולחן אמיתי, שחקו פחות ידיים מעמדה מוקדמת, שבה שחקנים רבים פועלים אחריכם, ויותר מהכפתור ומהקאט־אוף. עם הידיים שאתם משחקים, העדיפו Raise על פני Call, עשו Fold לתחתית הטבלה, וזכרו שערכה של יד תלוי גם בערימות, בעיוורים וביריבים שלכם. בטורניר PokerTH העיוורים ממשיכים לעלות, כך שטווח הידיים ששווה לשחק מתרחב ככל שהערימות מתקצרות.",
    "faqH2": "שאלות",
    "faq": [
      [
        "מהי היד הפותחת הטובה ביותר ב־Texas Hold’em?",
        "זוג אסים ביד. הוא מנצח ב־{aa1} מול יד אקראית אחת, והוא הפייבוריט מול כל יד פותחת אחרת."
      ],
      [
        "האם אס־מלך טוב יותר מזוג מלכות?",
        "לא, אבל זה צמוד: זוג מלכות מנצח ב־{qqak} מול אס־מלך מסדרות שונות. מול יד אקראית אחת, אס־מלך מאותה סדרה מנצח ב־{aks1} וזוג מלכות ב־{qq1}."
      ],
      [
        "כמה ידיים פותחות יש?",
        "{combos} צירופים של שני קלפים, שיוצרים 169 ידיים פותחות שונות: 13 זוגות, 78 מאותה סדרה ו־78 מסדרות שונות."
      ],
      [
        "כמה שווה יד מאותה סדרה?",
        "בממוצע בערך {suitGain} יותר סיכוי לנצח מאשר אותה יד מסדרות שונות."
      ],
      [
        "איפה אפשר לתרגל בחירת ידיים פותחות?",
        "במצב האימון של PokerTH מול יריבי מחשב, כשלשונית סיכויים מציגה את הסיכוי שלכם לנצח ככל שהקלפים יוצאים."
      ]
    ]
  },
  hi: {
    "title": "पोकर शुरुआती हाथ चार्ट — सभी 169 हाथों की रैंकिंग | PokerTH",
    "desc": "Texas Hold’em के सभी 169 शुरुआती हाथ एक चार्ट में, एक, तीन और छह विरोधियों के ख़िलाफ़ जीत की संभावना से रैंक किए गए। एक ही सूट या अलग, जोड़े, सबसे बुरा हाथ।",
    "ldHeadline": "Texas Hold’em शुरुआती हाथ चार्ट: सभी 169 हाथों की रैंकिंग",
    "ldDesc": "Texas Hold’em के 169 शुरुआती हाथ, एक चार्ट में, एक, तीन और छह बेतरतीब हाथों के ख़िलाफ़ जीत की संभावना के हिसाब से रैंक किए गए।",
    "h1": "Texas Hold’em के शुरुआती हाथ: सभी 169, रैंकिंग के साथ",
    "lead": "आपके दो निजी कार्ड हर हाथ का पहला फ़ैसला होते हैं। दो कार्ड मिलने के {combos} तरीक़े हैं, लेकिन सूट को अलग रख दें तो सिर्फ़ 169 अलग-अलग शुरुआती हाथ बचते हैं। यह पेज उन सबको उनकी जीत की संभावना के साथ एक चार्ट में दिखाता है, जो हर हाथ के लिए दस लाख डील का सिमुलेशन करके निकाली गई है।",
    "chartH2": "शुरुआती हाथों का चार्ट",
    "chartP": "जोड़े विकर्ण पर चलते हैं। उसके ऊपर एक ही सूट वाले हाथ हैं (s, दोनों कार्ड एक ही सूट के), नीचे अलग सूट वाले हाथ (o)। T का मतलब दस है। हर खाने की संख्या वह संभावना है कि बोर्ड के पाँचों कार्ड बँटने पर यह हाथ किसी एक बेतरतीब हाथ के ख़िलाफ़ जीतेगा, बराबरी को आधी जीत गिना गया है; खाना जितना हरा, हाथ उतना मज़बूत।",
    "topH2": "सबसे अच्छे शुरुआती हाथ",
    "topP": "एक विरोधी के ख़िलाफ़ बीस सबसे मज़बूत हाथ, और तीन और छह विरोधियों के ख़िलाफ़ वे कैसे टिकते हैं:",
    "cols": [
      "रैंक",
      "हाथ",
      "1 विरोधी",
      "3 विरोधी",
      "6 विरोधी"
    ],
    "multiH2": "ज़्यादा विरोधी, अलग हाथ",
    "multiP": "पॉट में खिलाड़ी जुड़ने के साथ हर हाथ कम बार जीतता है, पर एक ही दर से नहीं, इसलिए रैंकिंग बदल जाती है। हाथ में दो इक्के सबसे ऊपर रहते हैं: आमने-सामने {aa1}, और छह विरोधियों के ख़िलाफ़ भी {aa6}। एक ही सूट के लगातार कार्ड ऊपर चढ़ते हैं, क्योंकि वे स्ट्रेट और फ्लश बनाते हैं जो बड़े पॉट जीतते हैं: एक ही सूट का सत्ता-छक्का आमने-सामने रैंक {r76s1} से छह के ख़िलाफ़ रैंक {r76s6} पर पहुँचता है, एक ही सूट का गुलाम-दहला {rjts1} से {rjts6} पर। बीच के जोड़े नीचे गिरते हैं — दो सत्ते रैंक {r77_1} से {r77_6} पर आ जाते हैं — और यही होता है अलग सूट के उन हाथों के साथ जिनमें एक ऊँचा कार्ड और कमज़ोर किकर हो, जैसे अलग सूट का बादशाह-छक्का, {rk6o1} से {rk6o6} पर।",
    "suitedH2": "एक ही सूट या अलग सूट?",
    "suitedP": "एक ही सूट के दो कार्ड, अलग सूट के उन्हीं कार्डों से ज़्यादा क़ीमती होते हैं — दो अलग अंकों के सभी 78 मेलों में औसतन लगभग {suitGain} ज़्यादा, हाथ के हिसाब से {suitMin} से {suitMax} तक। फ़र्क़ पड़ता है, पर जितना दिखता है उससे कम: फ्लश कम ही बनते हैं, और एक ही सूट का कमज़ोर हाथ फिर भी कमज़ोर हाथ है।",
    "worstH2": "सबसे बुरा शुरुआती हाथ",
    "worstP": "किसी एक बेतरतीब हाथ के ख़िलाफ़, अलग सूट का तिक्की-दुक्की {w32} के साथ सबसे कमज़ोर है। अलग सूट का सत्ता-दुक्की, जिसे अक्सर पोकर का सबसे बुरा हाथ कहा जाता है, {w72} जीतता है और आमने-सामने 169 में से रैंक {r72} पर है — लेकिन छह विरोधियों के ख़िलाफ़ यह बिल्कुल आख़िरी है, क्योंकि इसके दोनों कार्ड एक-दूसरे से इतने दूर हैं कि मिलकर स्ट्रेट नहीं बना सकते, और इतने छोटे हैं कि कुछ और ख़ास नहीं जीत पाते।",
    "countH2": "हर तरह का हाथ आपको कितनी बार मिलता है",
    "countP": "दो कार्ड वाले {combos} संभावित हाथों में से {pairCombos} जोड़े हैं ({pairPct}), {suitedCombos} एक ही सूट के ({suitedPct}) और {offCombos} अलग सूट के ({offPct})। हर जोड़ा 6 तरीक़ों से बँट सकता है, एक ही सूट का हर हाथ 4 तरीक़ों से, अलग सूट का हर हाथ 12 तरीक़ों से — इसीलिए अलग सूट का इक्का-बादशाह आपको एक ही सूट वाले इक्का-बादशाह से तीन गुना ज़्यादा बार दिखता है।",
    "useH2": "ऐसे चार्ट का इस्तेमाल कैसे करें",
    "useP": "चार्ट हाथों को उनकी कच्ची ताक़त से रैंक करता है, किसी के चलने से पहले। असली मेज़ पर शुरुआती पोज़िशन से कम हाथ खेलें, जहाँ आपके बाद कई खिलाड़ी चलते हैं, और बटन और कट-ऑफ़ से ज़्यादा। जो हाथ आप खेलते हैं उनके साथ Call के बजाय Raise करें, चार्ट के निचले हिस्से के हाथ Fold करें, और याद रखें कि किसी हाथ की क़ीमत स्टैक, ब्लाइंड और आपके विरोधियों पर भी निर्भर करती है। PokerTH टूर्नामेंट में ब्लाइंड बढ़ते रहते हैं, इसलिए स्टैक छोटे होने पर खेलने लायक़ हाथों का दायरा बढ़ जाता है।",
    "faqH2": "सवाल",
    "faq": [
      [
        "Texas Hold’em में सबसे अच्छा शुरुआती हाथ कौन-सा है?",
        "हाथ में दो इक्के। ये किसी एक बेतरतीब हाथ के ख़िलाफ़ {aa1} जीतते हैं, और हर दूसरे शुरुआती हाथ के ख़िलाफ़ इनका पलड़ा भारी रहता है।"
      ],
      [
        "क्या इक्का-बादशाह दो बेगमों से बेहतर है?",
        "नहीं, पर मुक़ाबला क़रीबी है: अलग सूट के इक्का-बादशाह के ख़िलाफ़ दो बेगमें {qqak} जीतती हैं। किसी एक बेतरतीब हाथ के ख़िलाफ़ एक ही सूट का इक्का-बादशाह {aks1} जीतता है और दो बेगमें {qq1}।"
      ],
      [
        "कितने शुरुआती हाथ होते हैं?",
        "दो कार्ड के {combos} मेल, जिनसे 169 अलग-अलग शुरुआती हाथ बनते हैं: 13 जोड़े, 78 एक ही सूट के और 78 अलग सूट के।"
      ],
      [
        "एक ही सूट का हाथ कितना क़ीमती है?",
        "औसतन, उसी हाथ के अलग सूट वाले रूप से लगभग {suitGain} ज़्यादा जीत की संभावना।"
      ],
      [
        "मैं शुरुआती हाथ चुनने का अभ्यास कहाँ कर सकता हूँ?",
        "PokerTH के अभ्यास मोड में कंप्यूटर विरोधियों के ख़िलाफ़, जहाँ संभावनाएँ टैब कार्ड खुलते-खुलते आपकी जीत की संभावना दिखाता है।"
      ]
    ]
  },
  hr: {
    "title": "Tablica početnih ruku u pokeru — svih 169 po jačini | PokerTH",
    "desc": "Svih 169 početnih ruku Texas Hold’ema u tablici, poredanih po šansi za pobjedu protiv jednog, tri i šest protivnika. Iste ili različite boje, parovi, najgora ruka.",
    "ldHeadline": "Tablica početnih ruku u Texas Hold’emu: svih 169 ruku po jačini",
    "ldDesc": "169 početnih ruku Texas Hold’ema, prikazanih u tablici i poredanih po šansi za pobjedu protiv jedne, tri i šest nasumičnih ruku.",
    "h1": "Početne ruke u Texas Hold’emu: svih 169, po jačini",
    "lead": "Vaše dvije zatvorene karte prva su odluka u svakoj ruci. Postoji {combos} načina da dobijete dvije karte, ali samo 169 različitih početnih ruku kad se boje zanemare. Ova stranica sve ih prikazuje u tablici s njihovom šansom za pobjedu, izračunatom simulacijom milijun dijeljenja za svaku.",
    "chartH2": "Tablica početnih ruku",
    "chartP": "Parovi idu dijagonalom. Iznad nje su ruke iste boje (s, obje karte iste boje), ispod nje ruke različitih boja (o). T označava desetku. Broj u svakom polju je šansa da ruka pobijedi jednu nasumičnu ruku kad se podijeli svih pet karata na stolu, pri čemu se neriješeno računa kao pola pobjede; što je polje zelenije, ruka je jača.",
    "topH2": "Najbolje početne ruke",
    "topP": "Dvadeset najjačih ruku protiv jednog protivnika i kako se drže protiv tri i šest:",
    "cols": [
      "Rang",
      "Ruka",
      "1 protivnik",
      "3 protivnika",
      "6 protivnika"
    ],
    "multiH2": "Više protivnika, druge ruke",
    "multiP": "Svaka ruka pobjeđuje rjeđe kako se igrači pridružuju potu, ali ne jednakom brzinom, pa se poredak mijenja. Par asova ostaje na vrhu: {aa1} jedan na jedan, i dalje {aa6} protiv šest protivnika. Uzastopne karte iste boje penju se jer slažu skale i boje koje osvajaju velike potove: sedmica-šestica iste boje penje se s mjesta {r76s1} jedan na jedan na mjesto {r76s6} protiv šest, dečko-desetka iste boje s {rjts1} na {rjts6}. Srednji parovi padaju — sedmice padaju s mjesta {r77_1} na {r77_6} — a tako i ruke različitih boja s jednom visokom kartom i slabim kickerom, poput kralja-šestice različitih boja, s {rk6o1} na {rk6o6}.",
    "suitedH2": "Iste ili različite boje?",
    "suitedP": "Dvije karte iste boje vrijede više od istih karata različitih boja — u prosjeku oko {suitGain} više na svih 78 parova vrijednosti, od {suitMin} do {suitMax}, ovisno o ruci. To je važno, ali manje nego što se čini: boje su rijetke, a slaba ruka iste boje i dalje je slaba ruka.",
    "worstH2": "Najgora početna ruka",
    "worstP": "Protiv jedne nasumične ruke trojka-dvojka različitih boja najslabija je od svih, s {w32}. Sedmica-dvojka različitih boja, često nazivana najgorom rukom u pokeru, pobjeđuje u {w72} i jedan na jedan je na mjestu {r72} od 169 — ali protiv šest protivnika posljednja je od svih, jer su joj dvije karte predaleko jedna od druge da bi zajedno složile skalu i preniske da bi osvojile išta drugo.",
    "countH2": "Koliko često dobivate koju vrstu ruke",
    "countP": "Od {combos} mogućih ruku od dvije karte, {pairCombos} su parovi ({pairPct}), {suitedCombos} su iste boje ({suitedPct}), a {offCombos} različitih boja ({offPct}). Svaki par može se podijeliti na 6 načina, svaka ruka iste boje na 4 načina, svaka ruka različitih boja na 12 načina — zato as-kralja različitih boja vidite tri puta češće nego as-kralja iste boje.",
    "useH2": "Kako koristiti ovakvu tablicu",
    "useP": "Tablica rangira ruke po sirovoj snazi, prije nego što je itko odigrao. Za pravim stolom igrajte manje ruku iz rane pozicije, gdje mnogo igrača igra nakon vas, a više s gumba i cut-offa. S rukama koje igrate radije povisite nego platite, odustanite od ruku s dna tablice i zapamtite da vrijednost ruke ovisi i o stogovima, blindovima i vašim protivnicima. U PokerTH turniru blindovi stalno rastu, pa se raspon ruku vrijednih igranja širi kako stogovi postaju mali.",
    "faqH2": "Pitanja",
    "faq": [
      [
        "Koja je najbolja početna ruka u Texas Hold’emu?",
        "Par asova. Protiv jedne nasumične ruke pobjeđuje u {aa1} i favorit je protiv svake druge početne ruke."
      ],
      [
        "Je li as-kralj bolji od para dama?",
        "Nije, ali je blizu: dame pobjeđuju as-kralja različitih boja u {qqak}. Protiv jedne nasumične ruke as-kralj iste boje pobjeđuje u {aks1}, a dame u {qq1}."
      ],
      [
        "Koliko ima početnih ruku?",
        "{combos} kombinacija od dvije karte, koje čine 169 različitih početnih ruku: 13 parova, 78 iste boje i 78 različitih boja."
      ],
      [
        "Koliko vrijedi ruka iste boje?",
        "U prosjeku oko {suitGain} veću šansu za pobjedu od iste ruke različitih boja."
      ],
      [
        "Gdje mogu vježbati odabir početnih ruku?",
        "U načinu treninga u PokerTH-u protiv računalnih protivnika, s karticom Izgledi koja prikazuje vašu šansu za pobjedu kako karte izlaze."
      ]
    ]
  },
  hu: {
    "title": "Póker kezdőkezek táblázata — mind a 169 kéz rangsora | PokerTH",
    "desc": "Mind a 169 Texas Hold’em kezdőkéz táblázatban, nyerési esélyük szerint rangsorolva egy, három és hat ellenfél ellen. Azonos vagy eltérő szín, párok, legrosszabb kéz.",
    "ldHeadline": "Texas Hold’em kezdőkezek táblázata: mind a 169 kéz rangsorolva",
    "ldDesc": "A 169 Texas Hold’em kezdőkéz táblázatban, rangsorolva aszerint, mekkora eséllyel nyernek egy, három és hat véletlen kéz ellen.",
    "h1": "Texas Hold’em kezdőkezek: mind a 169, rangsorolva",
    "lead": "A két saját lapod minden leosztás első döntése. Két lapot {combos}-féleképpen kaphatsz, de ha a színeket figyelmen kívül hagyjuk, csak 169 különböző kezdőkéz van. Ez az oldal mindet táblázatba rendezi a nyerési esélyükkel együtt, amelyet kezenként egymillió leosztás szimulálásával számoltunk ki.",
    "chartH2": "A kezdőkezek táblázata",
    "chartP": "A párok az átlóban futnak. Fölötte az azonos színű kezek (s, mindkét lap ugyanabból a színből), alatta az eltérő színűek (o). A T a tízest jelöli. Az egyes mezőkben álló szám annak az esélye, hogy a kéz nyer egy véletlen kéz ellen, ha mind az öt közös lapot kiosztják, a döntetlent fél győzelemnek számolva; minél zöldebb a mező, annál erősebb a kéz.",
    "topH2": "A legjobb kezdőkezek",
    "topP": "A húsz legerősebb kéz egy ellenfél ellen, és hogyan állják meg a helyüket három és hat ellen:",
    "cols": [
      "Helyezés",
      "Kéz",
      "1 ellenfél",
      "3 ellenfél",
      "6 ellenfél"
    ],
    "multiH2": "Több ellenfél, más kezek",
    "multiP": "Minden kéz ritkábban nyer, ahogy újabb játékosok szállnak be a potba, de nem egyforma mértékben, ezért a rangsor változik. Az ászpár marad az élen: fej fej ellen {aa1}, hat ellenfél ellen még mindig {aa6}. Az azonos színű egymás utáni lapok feljebb kerülnek, mert sort és színt hoznak, amelyek nagy potokat nyernek: az azonos színű hetes-hatos fej fej ellen {r76s1}., hat ellen viszont {r76s6}. a rangsorban, az azonos színű bubi-tízes pedig {rjts1}. helyett {rjts6}. A közepes párok visszaesnek — a hetesek {r77_1}. helyett csak {r77_6}. —, és ugyanígy az egy magas lappal és gyenge kickerrel bíró eltérő színű kezek is, például az eltérő színű király-hatos, amely {rk6o1}. helyett {rk6o6}.",
    "suitedH2": "Azonos vagy eltérő színű?",
    "suitedP": "Két azonos színű lap többet ér, mint ugyanez a két lap eltérő színben — átlagosan körülbelül {suitGain} többet a 78 lehetséges értékpárosításon, kéztől függően {suitMin} és {suitMax} között. Számít, de kevésbé, mint amilyennek látszik: a szín ritka, és egy gyenge azonos színű kéz attól még gyenge kéz.",
    "worstH2": "A legrosszabb kezdőkéz",
    "worstP": "Egy véletlen kéz ellen az eltérő színű hármas-kettes a leggyengébb mind közül, {w32} eséllyel. Az eltérő színű hetes-kettes, amelyet gyakran a póker legrosszabb kezének neveznek, {w72} eséllyel nyer, és fej fej ellen {r72}. a 169-ből — hat ellenfél ellen viszont a legutolsó, mert a két lapja túl messze van egymástól ahhoz, hogy együtt sort alkosson, és túl alacsony ahhoz, hogy sok mással nyerjen.",
    "countH2": "Milyen gyakran kapod az egyes fajtákat",
    "countP": "A lehetséges {combos} kétlapos kéz közül {pairCombos} pár ({pairPct}), {suitedCombos} azonos színű ({suitedPct}) és {offCombos} eltérő színű ({offPct}). Minden pár 6-féleképpen osztható ki, minden azonos színű kéz 4-féleképpen, minden eltérő színű kéz 12-féleképpen — ezért látod háromszor olyan gyakran az eltérő színű ász-királyt, mint az azonos színűt.",
    "useH2": "Hogyan használd az ilyen táblázatot",
    "useP": "A táblázat a kezeket nyers erejük szerint rangsorolja, mielőtt bárki lépett volna. Valódi asztalnál korai pozícióból, ahol sok játékos utánad következik, kevesebb kezet játssz, az osztógombról és a cut-offról többet. A kezekkel, amelyeket játszol, inkább emelj, mint hogy megadj, a táblázat alját dobd el, és ne feledd, hogy egy kéz értéke a zsetonmennyiségeken, a vakokon és az ellenfeleiden is múlik. Egy PokerTH-versenyen a vakok folyamatosan emelkednek, így ahogy fogynak a zsetonok, egyre több kezet érdemes megjátszani.",
    "faqH2": "Kérdések",
    "faq": [
      [
        "Mi a legjobb kezdőkéz a Texas Hold’emben?",
        "Az ászpár. {aa1} eséllyel nyer egy véletlen kéz ellen, és minden más kezdőkézzel szemben ő a favorit."
      ],
      [
        "Jobb az ász-király, mint egy dámapár?",
        "Nem, de szoros: a dámák {qqak} eséllyel nyernek az eltérő színű ász-király ellen. Egy véletlen kéz ellen az azonos színű ász-király {aks1}, a dámák {qq1} eséllyel nyernek."
      ],
      [
        "Hány kezdőkéz van?",
        "{combos} kétlapos kombináció, amelyekből 169 különböző kezdőkéz áll össze: 13 pár, 78 azonos színű és 78 eltérő színű."
      ],
      [
        "Mennyit ér, ha egy kéz azonos színű?",
        "Átlagosan körülbelül {suitGain} több nyerési esélyt, mint ugyanez a kéz eltérő színben."
      ],
      [
        "Hol gyakorolhatom a kezdőkezek kiválasztását?",
        "A PokerTH gyakorlómódjában számítógépes ellenfelek ellen, ahol az Esélyek fül mutatja a nyerési esélyedet, ahogy jönnek a lapok."
      ]
    ]
  },
  hy: {
    "title": "Պոկերի մեկնարկային ձեռքերի աղյուսակ — բոլոր 169-ը ըստ ուժի | PokerTH",
    "desc": "Texas Hold’em-ի բոլոր 169 մեկնարկային ձեռքերը մեկ աղյուսակում՝ ըստ մեկ, երեք և վեց մրցակցի դեմ հաղթելու շանսի։ Սյութեդ թե օֆսյութ, զույգեր և ամենավատ ձեռքը։",
    "ldHeadline": "Texas Hold’em-ի մեկնարկային ձեռքերի աղյուսակ՝ բոլոր 169 ձեռքերը ըստ ուժի",
    "ldDesc": "Texas Hold’em-ի 169 մեկնարկային ձեռքերը աղյուսակում՝ դասավորված ըստ մեկ, երեք և վեց պատահական ձեռքի դեմ հաղթելու շանսի։",
    "h1": "Texas Hold’em-ի մեկնարկային ձեռքերը. բոլոր 169-ը՝ ըստ ուժի",
    "lead": "Ձեր երկու գրպանի խաղաթղթերը յուրաքանչյուր ձեռքի առաջին որոշումն են։ Երկու խաղաթուղթ ստանալու {combos} եղանակ կա, բայց եթե մաստերը մի կողմ դնենք, մնում է ընդամենը 169 տարբեր մեկնարկային ձեռք։ Այս էջը դրանք բոլորը ներկայացնում է աղյուսակում՝ իրենց հաղթելու շանսով, որը հաշվարկվել է յուրաքանչյուրի համար մեկ միլիոն բաժանում մոդելավորելով։",
    "chartH2": "Մեկնարկային ձեռքերի աղյուսակը",
    "chartP": "Զույգերը դասավորված են անկյունագծով։ Դրանից վերև նույն մաստի ձեռքերն են (s՝ սյութեդ, երկու խաղաթղթերն էլ նույն մաստի), ներքևում՝ տարբեր մաստերի ձեռքերը (o՝ օֆսյութ)։ T-ն նշանակում է տասնոց։ Յուրաքանչյուր վանդակի թիվն այն հավանականությունն է, որ ձեռքը կհաղթի մեկ պատահական ձեռքի դեմ, երբ բորդի բոլոր հինգ խաղաթղթերը բաժանված են, ընդ որում ոչ-ոքին հաշվվում է որպես կես հաղթանակ։ Որքան կանաչ է վանդակը, այնքան ուժեղ է ձեռքը։",
    "topH2": "Լավագույն մեկնարկային ձեռքերը",
    "topP": "Մեկ մրցակցի դեմ քսան ամենաուժեղ ձեռքերը և ինչպես են դրանք դիմանում երեք և վեց մրցակցի դեմ՝",
    "cols": [
      "Տեղ",
      "Ձեռք",
      "1 մրցակից",
      "3 մրցակից",
      "6 մրցակից"
    ],
    "multiH2": "Ավելի շատ մրցակիցներ՝ այլ ձեռքեր",
    "multiP": "Յուրաքանչյուր ձեռք ավելի հազվադեպ է հաղթում, երբ բանկին նոր խաղացողներ են միանում, բայց ոչ նույն տեմպով, ուստի դասակարգումը փոխվում է։ Գրպանի տուզերը մնում են առաջին տեղում՝ {aa1} մեկը մեկի դեմ և դեռ {aa6}՝ վեց մրցակցի դեմ։ Նույն մաստի կոնեկտորները բարձրանում են, քանի որ կազմում են սթրիթներ և ֆլեշներ, որոնք մեծ բանկեր են շահում. նույն մաստի յոթ-վեցը մեկը մեկի դեմ {r76s1}-րդ տեղից բարձրանում է {r76s6}-րդ տեղ վեց մրցակցի դեմ, նույն մաստի վալետ-տասը՝ {rjts1}-րդից {rjts6}-րդ։ Միջին զույգերն իջնում են — յոթնոցների զույգը {r77_1}-րդ տեղից ընկնում է {r77_6}-րդ — ինչպես նաև մեկ բարձր խաղաթղթով և թույլ կիկերով տարբեր մաստերի ձեռքերը, օրինակ՝ տարբեր մաստերի թագավոր-վեցը՝ {rk6o1}-րդից {rk6o6}-րդ։",
    "suitedH2": "Սյութեդ, թե՞ օֆսյութ",
    "suitedP": "Նույն մաստի երկու խաղաթուղթն արժեն ավելին, քան նույն խաղաթղթերը տարբեր մաստերով՝ բոլոր 78 արժեքազույգերի վրա միջինում մոտ {suitGain}-ով ավելի, ձեռքից կախված՝ {suitMin}-ից մինչև {suitMax}։ Դա կարևոր է, բայց ավելի քիչ, քան թվում է. ֆլեշները հազվադեպ են, իսկ թույլ նույն մաստի ձեռքը մնում է թույլ ձեռք։",
    "worstH2": "Ամենավատ մեկնարկային ձեռքը",
    "worstP": "Մեկ պատահական ձեռքի դեմ ամենաթույլը տարբեր մաստերի երեք-երկուսն է՝ {w32}։ Տարբեր մաստերի յոթ-երկուսը, որին հաճախ անվանում են պոկերի ամենավատ ձեռքը, հաղթում է {w72} դեպքում և մեկը մեկի դեմ 169-ից զբաղեցնում է {r72}-րդ տեղը — բայց վեց մրցակցի դեմ այն ամենավերջինն է, քանի որ նրա երկու խաղաթղթերը չափազանց հեռու են իրարից՝ միասին սթրիթ կազմելու համար, և չափազանց ցածր՝ ուրիշ բան շահելու համար։",
    "countH2": "Որքան հաճախ եք ստանում յուրաքանչյուր տեսակը",
    "countP": "{combos} հնարավոր երկխաղաթղթյա ձեռքերից {pairCombos}-ը զույգեր են ({pairPct}), {suitedCombos}-ը՝ նույն մաստի ({suitedPct}), և {offCombos}-ը՝ տարբեր մաստերի ({offPct})։ Յուրաքանչյուր զույգ կարող է բաժանվել 6 եղանակով, յուրաքանչյուր նույն մաստի ձեռք՝ 4, յուրաքանչյուր տարբեր մաստերի ձեռք՝ 12 եղանակով — ահա թե ինչու տարբեր մաստերի տուզ-թագավոր ստանում եք երեք անգամ ավելի հաճախ, քան նույն մաստի տուզ-թագավոր։",
    "useH2": "Ինչպես օգտագործել նման աղյուսակը",
    "useP": "Աղյուսակը դասավորում է ձեռքերը ըստ մաքուր ուժի՝ նախքան որևէ մեկի գործողությունը։ Իրական սեղանի շուրջ ավելի քիչ ձեռք խաղացեք վաղ դիրքից, որտեղ ձեզնից հետո շատ խաղացողներ են գործում, և ավելի շատ՝ բաթընից և cut-off-ից։ Ձեր խաղացած ձեռքերով արեք Raise, ոչ թե Call, Fold արեք աղյուսակի ստորին մասը և հիշեք, որ ձեռքի արժեքը կախված է նաև սթեքերից, բլայնդներից և ձեր մրցակիցներից։ PokerTH-ի մրցաշարում բլայնդներն անընդհատ աճում են, ուստի խաղալու արժանի ձեռքերի շրջանակն ընդլայնվում է, երբ սթեքերը կարճանում են։",
    "faqH2": "Հարցեր",
    "faq": [
      [
        "Ո՞րն է Texas Hold’em-ի լավագույն մեկնարկային ձեռքը։",
        "Գրպանի տուզերը։ Մեկ պատահական ձեռքի դեմ դրանք հաղթում են {aa1} դեպքում և ֆավորիտ են ցանկացած այլ մեկնարկային ձեռքի դեմ։"
      ],
      [
        "Տուզ-թագավորն ավելի լա՞վն է, քան դամաների զույգը։",
        "Ոչ, բայց տարբերությունը փոքր է՝ դամաները տարբեր մաստերի տուզ-թագավորի դեմ հաղթում են {qqak} դեպքում։ Մեկ պատահական ձեռքի դեմ նույն մաստի տուզ-թագավորը հաղթում է {aks1}, իսկ դամաները՝ {qq1} դեպքում։"
      ],
      [
        "Քանի՞ մեկնարկային ձեռք կա։",
        "{combos} երկխաղաթղթյա համակցություն, որոնք կազմում են 169 տարբեր մեկնարկային ձեռք՝ 13 զույգ, 78 նույն մաստի և 78 տարբեր մաստերի։"
      ],
      [
        "Որքա՞ն արժե նույն մաստի ձեռքը։",
        "Միջինում մոտ {suitGain}-ով ավելի բարձր հաղթելու շանս, քան նույն ձեռքը տարբեր մաստերով։"
      ],
      [
        "Որտե՞ղ կարող եմ մարզվել մեկնարկային ձեռքեր ընտրելու մեջ։",
        "PokerTH-ի մարզման ռեժիմում՝ համակարգչային մրցակիցների դեմ, որտեղ Հավանականություններ ներդիրը ցույց է տալիս ձեր հաղթելու շանսը, մինչ խաղաթղթերը բացվում են։"
      ]
    ]
  },
  id: {
    "title": "Tabel tangan awal poker — peringkat semua 169 tangan | PokerTH",
    "desc": "Semua 169 tangan awal Texas Hold’em dalam tabel, diurutkan menurut peluang menang melawan 1, 3, dan 6 lawan. Sejenis atau beda jenis, pasangan, dan tangan terburuk.",
    "ldHeadline": "Tabel tangan awal Texas Hold’em: peringkat semua 169 tangan",
    "ldDesc": "169 tangan awal Texas Hold’em dalam tabel, diurutkan menurut peluang menang melawan satu, tiga, dan enam tangan acak.",
    "h1": "Tangan awal Texas Hold’em: peringkat semua 169 tangan",
    "lead": "Dua kartu tertutup Anda adalah keputusan pertama di setiap permainan. Ada {combos} cara menerima dua kartu, tetapi hanya ada 169 tangan awal yang berbeda bila jenis kartu dikesampingkan. Halaman ini menampilkan semuanya dalam tabel beserta peluang menangnya, yang dihitung dengan menyimulasikan satu juta pembagian kartu untuk masing-masing tangan.",
    "chartH2": "Tabel tangan awal",
    "chartP": "Pasangan berjajar di sepanjang diagonal. Di atasnya ada tangan sejenis (s, kedua kartu dari jenis yang sama), di bawahnya tangan beda jenis (o). T berarti sepuluh. Angka di setiap kotak adalah peluang tangan itu menang melawan satu tangan acak bila kelima kartu meja dibagikan, dengan hasil seri dihitung setengah kemenangan; makin hijau kotaknya, makin kuat tangannya.",
    "topH2": "Tangan awal terbaik",
    "topP": "Dua puluh tangan terkuat melawan satu lawan, dan bagaimana ketahanannya melawan tiga dan enam lawan:",
    "cols": [
      "Peringkat",
      "Tangan",
      "1 lawan",
      "3 lawan",
      "6 lawan"
    ],
    "multiH2": "Lebih banyak lawan, tangan yang berbeda",
    "multiP": "Setiap tangan makin jarang menang saat makin banyak pemain masuk ke pot, tetapi tidak dengan laju yang sama, sehingga peringkatnya berubah. Pasangan as tetap teratas: {aa1} satu lawan satu, masih {aa6} melawan enam lawan. Kartu berurutan sejenis naik, karena membentuk straight dan flush yang memenangkan pot besar: tujuh-enam sejenis naik dari peringkat {r76s1} satu lawan satu ke peringkat {r76s6} melawan enam, jack-sepuluh sejenis dari {rjts1} ke {rjts6}. Pasangan menengah turun — pasangan tujuh jatuh dari peringkat {r77_1} ke {r77_6} — begitu pula tangan beda jenis dengan satu kartu tinggi dan kicker lemah, seperti king-enam beda jenis, dari {rk6o1} ke {rk6o6}.",
    "suitedH2": "Sejenis atau beda jenis?",
    "suitedP": "Dua kartu sejenis bernilai lebih daripada kartu yang sama tetapi beda jenis — rata-rata sekitar {suitGain} lebih tinggi di seluruh 78 pasangan nilai, dari {suitMin} sampai {suitMax} tergantung tangannya. Itu berpengaruh, tetapi tidak sebesar kelihatannya: flush jarang terjadi, dan tangan sejenis yang lemah tetaplah tangan yang lemah.",
    "worstH2": "Tangan awal terburuk",
    "worstP": "Melawan satu tangan acak, tiga-dua beda jenis adalah yang terlemah dari semuanya dengan {w32}. Tujuh-dua beda jenis, yang sering disebut tangan terburuk dalam poker, menang {w72} dan berada di peringkat {r72} dari 169 dalam satu lawan satu — tetapi melawan enam lawan ia benar-benar yang terakhir, karena kedua kartunya terlalu berjauhan untuk membentuk straight bersama dan terlalu rendah untuk memenangkan banyak hal lain.",
    "countH2": "Seberapa sering Anda mendapat tiap jenis tangan",
    "countP": "Dari {combos} kemungkinan tangan dua kartu, {pairCombos} adalah pasangan ({pairPct}), {suitedCombos} sejenis ({suitedPct}), dan {offCombos} beda jenis ({offPct}). Setiap pasangan dapat dibagikan dengan 6 cara, setiap tangan sejenis dengan 4 cara, setiap tangan beda jenis dengan 12 cara — itulah sebabnya Anda melihat as-king beda jenis tiga kali lebih sering daripada as-king sejenis.",
    "useH2": "Cara memakai tabel seperti ini",
    "useP": "Tabel mengurutkan tangan menurut kekuatan murninya, sebelum ada yang bertindak. Di meja sungguhan, mainkan lebih sedikit tangan dari posisi awal, tempat banyak pemain bertindak setelah Anda, dan lebih banyak dari tombol dealer dan cut-off. Naikkan alih-alih menyamakan dengan tangan yang Anda mainkan, buang tangan di dasar tabel, dan ingat bahwa nilai sebuah tangan juga bergantung pada tumpukan chip, blind, dan lawan Anda. Dalam turnamen PokerTH, blind terus naik, sehingga tangan yang layak dimainkan makin banyak saat tumpukan chip menipis.",
    "faqH2": "Pertanyaan",
    "faq": [
      [
        "Apa tangan awal terbaik dalam Texas Hold’em?",
        "Pasangan as. Tangan ini menang {aa1} melawan satu tangan acak dan diunggulkan melawan setiap tangan awal lainnya."
      ],
      [
        "Apakah as-king lebih baik daripada pasangan queen?",
        "Tidak, tetapi selisihnya tipis: pasangan queen menang {qqak} melawan as-king beda jenis. Melawan satu tangan acak, as-king sejenis menang {aks1} dan pasangan queen {qq1}."
      ],
      [
        "Ada berapa tangan awal?",
        "{combos} kombinasi dua kartu, yang membentuk 169 tangan awal berbeda: 13 pasangan, 78 sejenis, dan 78 beda jenis."
      ],
      [
        "Seberapa besar nilai tangan sejenis?",
        "Rata-rata peluang menangnya sekitar {suitGain} lebih besar daripada tangan yang sama tetapi beda jenis."
      ],
      [
        "Di mana saya bisa berlatih memilih tangan awal?",
        "Di mode latihan PokerTH melawan lawan komputer, dengan tab Peluang yang menampilkan peluang menang Anda seiring kartu dibuka."
      ]
    ]
  },
  is: {
    "title": "Tafla yfir byrjunarhendur í póker — allar 169 í röð | PokerTH",
    "desc": "Byrjunarhendurnar 169 í Texas Hold’em í einni töflu, raðaðar eftir líkum á sigri gegn einum, þremur og sex andstæðingum. Sama sort eða ólík, pör og versta höndin.",
    "ldHeadline": "Tafla yfir byrjunarhendur í Texas Hold’em: allar 169 í röð",
    "ldDesc": "Byrjunarhendurnar 169 í Texas Hold’em, settar upp í töflu og raðaðar eftir líkum á sigri gegn einni, þremur og sex handahófskenndum höndum.",
    "h1": "Byrjunarhendur í Texas Hold’em: allar 169, í röð",
    "lead": "Holuspilin þín tvö eru fyrsta ákvörðunin í hverri hönd. Það eru {combos} leiðir til að fá tvö spil, en aðeins 169 ólíkar byrjunarhendur þegar sortunum er sleppt. Þessi síða sýnir þær allar í töflu með líkum á sigri, reiknuðum með því að herma eftir milljón gjöfum fyrir hverja.",
    "chartH2": "Tafla yfir byrjunarhendur",
    "chartP": "Pörin liggja eftir hornalínunni. Fyrir ofan hana eru hendur í sömu sort (s, bæði spilin í sömu sort), fyrir neðan hendur í ólíkum sortum (o). T stendur fyrir tíu. Talan í hverjum reit er líkurnar á að höndin vinni eina handahófskennda hönd þegar öll fimm borðspilin hafa verið gefin, og jafntefli telst hálfur sigur; því grænni sem reiturinn er, því sterkari er höndin.",
    "topH2": "Bestu byrjunarhendurnar",
    "topP": "Tuttugu sterkustu hendurnar gegn einum andstæðingi, og hvernig þær standa sig gegn þremur og sex:",
    "cols": [
      "Sæti",
      "Hönd",
      "1 andstæðingur",
      "3 andstæðingar",
      "6 andstæðingar"
    ],
    "multiH2": "Fleiri andstæðingar, aðrar hendur",
    "multiP": "Hver hönd vinnur sjaldnar eftir því sem fleiri leikmenn koma inn í pottinn, en ekki jafnhratt, svo röðin breytist. Ásar á hendi halda toppsætinu: {aa1} einn á móti einum og enn {aa6} gegn sex andstæðingum. Samliggjandi spil í sömu sort klifra upp, því þau mynda raðir og liti sem vinna stóra potta: sjöa-sexa í sömu sort fer úr sæti {r76s1} einn á móti einum í sæti {r76s6} gegn sex, gosi-tía í sömu sort úr {rjts1} í {rjts6}. Miðlungspör falla — sjöurnar detta úr sæti {r77_1} í {r77_6} — og það gera líka hendur í ólíkum sortum með eitt hátt spil og veikan kicker, eins og kóngur-sexa í ólíkum sortum, úr {rk6o1} í {rk6o6}.",
    "suitedH2": "Sama sort eða ólíkar sortir?",
    "suitedP": "Tvö spil í sömu sort eru meira virði en sömu spil í ólíkum sortum — um {suitGain} meira að meðaltali yfir öll 78 gildapörin, frá {suitMin} upp í {suitMax} eftir höndum. Það skiptir máli, en minna en virðist: litir eru sjaldgæfir, og veik hönd í sömu sort er samt veik hönd.",
    "worstH2": "Versta byrjunarhöndin",
    "worstP": "Gegn einni handahófskenndri hönd er þrista-tvistur í ólíkum sortum veikust allra, með {w32}. Sjöa-tvistur í ólíkum sortum, oft kölluð versta höndin í póker, vinnur í {w72} tilvika og er í sæti {r72} af 169 einn á móti einum — en gegn sex andstæðingum er hún allra síðust, því spilin tvö eru of langt hvort frá öðru til að mynda röð saman og of lág til að vinna mikið annað.",
    "countH2": "Hve oft þú færð hverja tegund",
    "countP": "Af þeim {combos} tveggja spila höndum sem mögulegar eru eru {pairCombos} pör ({pairPct}), {suitedCombos} í sömu sort ({suitedPct}) og {offCombos} í ólíkum sortum ({offPct}). Hvert par má gefa á 6 vegu, hverja hönd í sömu sort á 4 vegu og hverja hönd í ólíkum sortum á 12 vegu — þess vegna sérðu ás-kóng í ólíkum sortum þrisvar sinnum oftar en ás-kóng í sömu sort.",
    "useH2": "Hvernig á að nota svona töflu",
    "useP": "Tafla raðar höndum eftir hreinum styrk, áður en nokkur hefur átt leik. Við alvöru borð skaltu spila færri hendur úr fremri stöðu, þar sem margir leikmenn eiga leik á eftir þér, og fleiri af hnappinum og úr cut-off. Hækkaðu frekar en að jafna með þeim höndum sem þú spilar, gefðu eftir neðri hluta töflunnar, og mundu að virði handar ræðst líka af stöflunum, blindunum og andstæðingunum. Í PokerTH-móti hækka blindirnir sífellt, svo hendurnar sem vert er að spila verða fleiri eftir því sem staflarnir styttast.",
    "faqH2": "Spurningar",
    "faq": [
      [
        "Hver er besta byrjunarhöndin í Texas Hold’em?",
        "Ásar á hendi. Þeir vinna í {aa1} tilvika gegn einni handahófskenndri hönd og eru sigurstranglegri en hver önnur byrjunarhönd."
      ],
      [
        "Er ás-kóngur betri en par af drottningum?",
        "Nei, en það munar litlu: drottningar vinna í {qqak} tilvika gegn ás-kóngi í ólíkum sortum. Gegn einni handahófskenndri hönd vinnur ás-kóngur í sömu sort í {aks1} tilvika og drottningar í {qq1}."
      ],
      [
        "Hve margar byrjunarhendur eru til?",
        "{combos} tveggja spila samsetningar, sem mynda 169 ólíkar byrjunarhendur: 13 pör, 78 í sömu sort og 78 í ólíkum sortum."
      ],
      [
        "Hve mikils virði er hönd í sömu sort?",
        "Að meðaltali um {suitGain} meiri líkur á sigri en sama hönd í ólíkum sortum."
      ],
      [
        "Hvar get ég æft val á byrjunarhöndum?",
        "Í æfingaham PokerTH gegn tölvustýrðum andstæðingum, þar sem flipinn Líkur sýnir líkurnar á að þú vinnir eftir því sem spilin koma upp."
      ]
    ]
  },
  it: {
    "title": "Tabella mani di partenza poker — le 169 mani in ordine | PokerTH",
    "desc": "Le 169 mani di partenza del Texas Hold’em in tabella, ordinate per probabilità di vincita contro uno, tre e sei avversari. Stesso seme o no, coppie e la mano peggiore.",
    "ldHeadline": "Tabella delle mani di partenza del Texas Hold’em: le 169 mani in classifica",
    "ldDesc": "Le 169 mani di partenza del Texas Hold’em, in tabella e in classifica secondo la probabilità di vincere contro una, tre e sei mani casuali.",
    "h1": "Mani di partenza del Texas Hold’em: tutte le 169, in classifica",
    "lead": "Le tue due carte coperte sono la prima decisione di ogni mano. Esistono {combos} modi di ricevere due carte, ma solo 169 mani di partenza diverse una volta messi da parte i semi. Questa pagina le riporta tutte in tabella con la loro probabilità di vincere, calcolata simulando un milione di distribuzioni per ciascuna.",
    "chartH2": "La tabella delle mani di partenza",
    "chartP": "Le coppie scendono lungo la diagonale. Sopra ci sono le mani dello stesso seme (s, entrambe le carte dello stesso seme), sotto le mani di semi diversi (o). T sta per dieci. Il numero in ogni casella è la probabilità che la mano vinca contro una mano casuale quando escono tutte e cinque le carte comuni, contando i pareggi come mezza vittoria; più la casella è verde, più la mano è forte.",
    "topH2": "Le migliori mani di partenza",
    "topP": "Le venti mani più forti contro un avversario, e come reggono contro tre e sei:",
    "cols": [
      "Pos.",
      "Mano",
      "1 avversario",
      "3 avversari",
      "6 avversari"
    ],
    "multiH2": "Più avversari, mani diverse",
    "multiP": "Ogni mano vince meno spesso man mano che altri giocatori entrano nel piatto, ma non nella stessa misura, quindi la classifica cambia. La coppia d’assi resta in cima: {aa1} testa a testa, ancora {aa6} contro sei avversari. I connettori dello stesso seme salgono, perché fanno scale e colori che vincono piatti grossi: sette-sei dello stesso seme passa dal posto {r76s1} testa a testa al posto {r76s6} contro sei, fante-dieci dello stesso seme dal {rjts1} al {rjts6}. Le coppie medie scendono — la coppia di sette cade dal posto {r77_1} al {r77_6} — e così le mani di semi diversi con una sola carta alta e un kicker debole, come re-sei di semi diversi, dal {rk6o1} al {rk6o6}.",
    "suitedH2": "Stesso seme o semi diversi?",
    "suitedP": "Due carte dello stesso seme valgono più delle stesse carte di semi diversi — in media circa {suitGain} in più su tutte le 78 coppie di valori, da {suitMin} a {suitMax} a seconda della mano. Conta, ma meno di quanto sembri: i colori sono rari, e una mano debole dello stesso seme resta una mano debole.",
    "worstH2": "La peggior mano di partenza",
    "worstP": "Contro una mano casuale, tre-due di semi diversi è la più debole di tutte con {w32}. Sette-due di semi diversi, spesso chiamata la peggior mano del poker, vince il {w72} ed è al posto {r72} su 169 testa a testa — ma contro sei avversari è proprio l’ultima, perché le sue due carte sono troppo distanti per fare scala insieme e troppo basse per vincere molto altro.",
    "countH2": "Quanto spesso ricevi ogni tipo di mano",
    "countP": "Delle {combos} possibili mani di due carte, {pairCombos} sono coppie ({pairPct}), {suitedCombos} sono dello stesso seme ({suitedPct}) e {offCombos} di semi diversi ({offPct}). Ogni coppia può essere servita in 6 modi, ogni mano dello stesso seme in 4 modi, ogni mano di semi diversi in 12 modi — ecco perché ricevi asso-re di semi diversi tre volte più spesso di asso-re dello stesso seme.",
    "useH2": "Come usare una tabella come questa",
    "useP": "Una tabella classifica le mani per forza pura, prima che chiunque abbia agito. A un tavolo vero, gioca meno mani dalle prime posizioni, dove molti giocatori parlano dopo di te, e di più dal bottone e dal cut-off. Rilancia invece di vedere con le mani che giochi, lascia quelle in fondo alla tabella, e ricorda che il valore di una mano dipende anche dagli stack, dai bui e dai tuoi avversari. In un torneo di PokerTH i bui continuano a salire, quindi le mani da giocare aumentano man mano che gli stack si accorciano.",
    "faqH2": "Domande",
    "faq": [
      [
        "Qual è la migliore mano di partenza nel Texas Hold’em?",
        "La coppia d’assi. Vince il {aa1} contro una mano casuale ed è favorita contro ogni altra mano di partenza."
      ],
      [
        "Asso-re è meglio di una coppia di donne?",
        "No, ma ci va vicino: le donne vincono il {qqak} contro asso-re di semi diversi. Contro una mano casuale asso-re dello stesso seme vince il {aks1} e le donne il {qq1}."
      ],
      [
        "Quante mani di partenza esistono?",
        "{combos} combinazioni di due carte, che formano 169 mani di partenza diverse: 13 coppie, 78 dello stesso seme e 78 di semi diversi."
      ],
      [
        "Quanto vale una mano dello stesso seme?",
        "In media circa {suitGain} di probabilità di vincere in più rispetto alla stessa mano di semi diversi."
      ],
      [
        "Dove posso esercitarmi nella scelta delle mani di partenza?",
        "Nella modalità allenamento di PokerTH contro avversari gestiti dal computer, con la scheda Probabilità che mostra la tua probabilità di vincere man mano che escono le carte."
      ]
    ]
  },
  ja: {
    "title": "ポーカー スターティングハンド表 — 全169ハンドのランキング | PokerTH",
    "desc": "Texas Hold’em の全169スターティングハンドを1つの表に。相手1人・3人・6人に対する勝率でランク付け。スーテッドとオフスート、ペア、最弱のハンドも解説。",
    "ldHeadline": "Texas Hold’em スターティングハンド表：全169ハンドのランキング",
    "ldDesc": "Texas Hold’em の169種類のスターティングハンドを表にまとめ、ランダムなハンド1つ・3つ・6つに対する勝率で順位付けしたもの。",
    "h1": "Texas Hold’em のスターティングハンド：全169種のランキング",
    "lead": "配られる2枚のホールカードは、毎ハンド最初の判断材料です。2枚のカードの配られ方は {combos} 通りありますが、スートを区別しなければ、異なるスターティングハンドは169種類しかありません。このページではそのすべてを勝率とともに表にしました。勝率はハンドごとに100万回の配布をシミュレーションして求めたものです。",
    "chartH2": "スターティングハンド表",
    "chartP": "ペアは対角線上に並びます。その上側がスーテッドのハンド（s、2枚とも同じスート）、下側がオフスートのハンド（o）です。T は10を表します。各マスの数字は、ボード5枚がすべて配られたときに、そのハンドがランダムなハンド1つに勝つ確率で、引き分けは半分の勝ちとして数えています。マスが緑に近いほど強いハンドです。",
    "topH2": "最強のスターティングハンド",
    "topP": "相手1人に対して最も強い20ハンドと、相手が3人・6人のときの持ちこたえ方：",
    "cols": [
      "順位",
      "ハンド",
      "相手1人",
      "相手3人",
      "相手6人"
    ],
    "multiH2": "相手が増えれば、強いハンドも変わる",
    "multiP": "ポットに参加するプレイヤーが増えるほど、どのハンドも勝つ頻度は下がりますが、その下がり方は同じではないので、順位が入れ替わります。ポケットエースは首位のままで、ヘッズアップでは {aa1}、相手6人でもまだ {aa6} です。スーテッドコネクターは順位を上げます。大きなポットを勝ち取るストレートやフラッシュを作れるからです。セブン・シックスのスーテッドはヘッズアップの {r76s1} 位から相手6人では {r76s6} 位に、ジャック・テンのスーテッドは {rjts1} 位から {rjts6} 位に上がります。ミドルペアは順位を下げ、7のペアは {r77_1} 位から {r77_6} 位に落ちます。高いカード1枚と弱いキッカーのオフスートのハンドも同様で、たとえばキング・シックスのオフスートは {rk6o1} 位から {rk6o6} 位になります。",
    "suitedH2": "スーテッドかオフスートか",
    "suitedP": "同じスートの2枚は、同じカードのオフスートより価値があります。78通りあるランクの組み合わせ全体の平均で約 {suitGain} 高く、ハンドによって {suitMin} から {suitMax} の幅があります。差はありますが、見た目ほど大きくはありません。フラッシュはめったにできず、弱いスーテッドハンドはやはり弱いハンドです。",
    "worstH2": "最弱のスターティングハンド",
    "worstP": "ランダムなハンド1つに対しては、スリー・ツーのオフスートが {w32} で最も弱いハンドです。ポーカーで最悪のハンドとよく言われるセブン・ツーのオフスートは、勝率 {w72}、ヘッズアップでは169ハンド中 {r72} 位ですが、相手6人ではまさに最下位になります。2枚のランクが離れすぎていて一緒にストレートを作れず、低すぎてほかの役でもほとんど勝てないからです。",
    "countH2": "それぞれの種類が配られる頻度",
    "countP": "2枚のハンドとして起こりうる {combos} 通りのうち、ペアは {pairCombos} 通り（{pairPct}）、スーテッドは {suitedCombos} 通り（{suitedPct}）、オフスートは {offCombos} 通り（{offPct}）です。各ペアは6通り、各スーテッドハンドは4通り、各オフスートハンドは12通りの配られ方があります。だからエース・キングのオフスートは、エース・キングのスーテッドの3倍の頻度で配られるのです。",
    "useH2": "この表の使い方",
    "useP": "この表は、誰もアクションを起こす前の純粋な強さでハンドを並べたものです。実際のテーブルでは、後ろに多くのプレイヤーが控えるアーリーポジションでは参加するハンドを絞り、ボタンやカットオフからはより多くのハンドで参加しましょう。プレイするハンドではコールよりレイズを選び、表の下位のハンドはフォールドし、ハンドの価値はスタック、ブラインド、そして相手によっても変わることを忘れないでください。PokerTH のトーナメントではブラインドが上がり続けるので、スタックが短くなるにつれて、プレイする価値のあるハンドの範囲は広がっていきます。",
    "faqH2": "よくある質問",
    "faq": [
      [
        "Texas Hold’em で最強のスターティングハンドは？",
        "ポケットエースです。ランダムなハンド1つに対して {aa1} 勝ち、ほかのどのスターティングハンドに対しても有利です。"
      ],
      [
        "エース・キングはクイーンのペアより強い？",
        "いいえ。ただし僅差です。クイーンのペアはエース・キングのオフスートに対して {qqak} 勝ちます。ランダムなハンド1つに対しては、エース・キングのスーテッドが {aks1}、クイーンのペアが {qq1} 勝ちます。"
      ],
      [
        "スターティングハンドは何種類ある？",
        "2枚の組み合わせは {combos} 通りで、異なるスターティングハンドとしては169種類です。内訳はペア13、スーテッド78、オフスート78です。"
      ],
      [
        "スーテッドはどれくらい有利？",
        "平均すると、同じハンドのオフスートより勝率が約 {suitGain} 高くなります。"
      ],
      [
        "スターティングハンドの選び方はどこで練習できる？",
        "PokerTH の練習モードでコンピューターを相手に練習できます。「勝率」タブが、カードが開かれるたびにあなたの勝つ確率を表示します。"
      ]
    ]
  },
  ka: {
    "title": "საწყისი ხელების ცხრილი — ყველა 169 ხელის რეიტინგი | PokerTH",
    "desc": "Texas Hold’em-ის ყველა 169 საწყისი ხელი ერთ ცხრილში, დალაგებული მოგების შანსით ერთ, სამ და ექვს მოწინააღმდეგესთან. ერთი მასტის თუ არა, წყვილები, ყველაზე ცუდი ხელი.",
    "ldHeadline": "Texas Hold’em-ის საწყისი ხელების ცხრილი: ყველა 169 ხელის რეიტინგი",
    "ldDesc": "Texas Hold’em-ის 169 საწყისი ხელი ცხრილში, დალაგებული მოგების შანსით ერთ, სამ და ექვს შემთხვევით ხელთან.",
    "h1": "Texas Hold’em-ის საწყისი ხელები: ყველა 169, რეიტინგის მიხედვით",
    "lead": "თქვენი ორი პირადი კარტი ყოველი დარიგების პირველი გადაწყვეტილებაა. ორი კარტის მიღების {combos} გზა არსებობს, მაგრამ თუ მასტებს არ გავითვალისწინებთ, მხოლოდ 169 განსხვავებული საწყისი ხელი რჩება. ეს გვერდი ყველა მათგანს ცხრილში აჩვენებს მოგების შანსთან ერთად, რომელიც თითოეულისთვის მილიონი დარიგების სიმულაციით არის გამოთვლილი.",
    "chartH2": "საწყისი ხელების ცხრილი",
    "chartP": "წყვილები დიაგონალზეა განლაგებული. მის ზემოთ ერთი მასტის ხელებია (s, ორივე კარტი ერთი მასტისაა), ქვემოთ — სხვადასხვა მასტის ხელები (o). T ათიანს ნიშნავს. თითოეულ უჯრაში მოცემული რიცხვი არის შანსი, რომ ხელი მოიგებს ერთ შემთხვევით ხელთან, როცა ბორდის ხუთივე კარტი დარიგდება, ფრე კი ნახევარ მოგებად ითვლება; რაც უფრო მწვანეა უჯრა, მით უფრო ძლიერია ხელი.",
    "topH2": "საუკეთესო საწყისი ხელები",
    "topP": "ოცი ყველაზე ძლიერი ხელი ერთ მოწინააღმდეგესთან და როგორ უძლებენ ისინი სამ და ექვს მოწინააღმდეგეს:",
    "cols": [
      "ადგილი",
      "ხელი",
      "1 მოწინააღმდეგე",
      "3 მოწინააღმდეგე",
      "6 მოწინააღმდეგე"
    ],
    "multiH2": "მეტი მოწინააღმდეგე, სხვა ხელები",
    "multiP": "ყოველი ხელი უფრო იშვიათად იგებს, როცა ბანკში მეტი მოთამაშე შედის, მაგრამ არა ერთნაირი ტემპით, ამიტომ რეიტინგი იცვლება. ტუზების წყვილი სათავეში რჩება: {aa1} ჰედს-აპში და კვლავ {aa6} ექვს მოწინააღმდეგესთან. ერთი მასტის კონექტორები მაღლა იწევს, რადგან ისინი ქმნიან სტრეიტებსა და ფლეშებს, რომლებიც დიდ ბანკებს იგებს: ერთი მასტის შვიდიანი-ექვსიანი ჰედს-აპში მე-{r76s1} ადგილიდან ექვს მოწინააღმდეგესთან მე-{r76s6} ადგილზე ადის, ერთი მასტის ვალეტი-ათიანი — მე-{rjts1}-დან მე-{rjts6}-ზე. საშუალო წყვილები ქვევით ეშვება — შვიდიანები მე-{r77_1} ადგილიდან მე-{r77_6}-ზე ეცემა — ისევე როგორც სხვადასხვა მასტის ხელები ერთი მაღალი კარტით და სუსტი კიკერით, მაგალითად სხვადასხვა მასტის მეფე-ექვსიანი, მე-{rk6o1}-დან მე-{rk6o6}-ზე.",
    "suitedH2": "ერთი მასტის თუ სხვადასხვა მასტის?",
    "suitedP": "ერთი მასტის ორი კარტი უფრო მეტი ღირს, ვიდრე იგივე კარტები სხვადასხვა მასტით — საშუალოდ დაახლოებით {suitGain}-ით მეტი ორი მნიშვნელობის ყველა 78 კომბინაციაში, ხელის მიხედვით {suitMin}-დან {suitMax}-მდე. ეს მნიშვნელოვანია, მაგრამ იმაზე ნაკლებად, ვიდრე ჩანს: ფლეში იშვიათია, ერთი მასტის სუსტი ხელი კი მაინც სუსტ ხელად რჩება.",
    "worstH2": "ყველაზე ცუდი საწყისი ხელი",
    "worstP": "ერთ შემთხვევით ხელთან სხვადასხვა მასტის სამიანი-ორიანი ყველაზე სუსტია {w32}-ით. სხვადასხვა მასტის შვიდიანი-ორიანი, რომელსაც ხშირად პოკერის ყველაზე ცუდ ხელს უწოდებენ, {w72}-ს იგებს და ჰედს-აპში 169-დან მე-{r72} ადგილზეა — მაგრამ ექვს მოწინააღმდეგესთან ის სულ ბოლოა, რადგან მისი ორი კარტი ერთმანეთისგან ზედმეტად შორსაა, რომ ერთად სტრეიტი შექმნან, და ზედმეტად დაბალია, რომ სხვა ბევრი რამ მოიგოს.",
    "countH2": "რამდენად ხშირად გხვდებათ თითოეული ტიპი",
    "countP": "{combos} შესაძლო ორკარტიანი ხელიდან {pairCombos} წყვილია ({pairPct}), {suitedCombos} ერთი მასტისაა ({suitedPct}) და {offCombos} — სხვადასხვა მასტის ({offPct}). თითოეული წყვილი შეიძლება 6 გზით დარიგდეს, თითოეული ერთი მასტის ხელი — 4 გზით, თითოეული სხვადასხვა მასტის ხელი — 12 გზით; სწორედ ამიტომ სხვადასხვა მასტის ტუზი-მეფე სამჯერ უფრო ხშირად გხვდებათ, ვიდრე ერთი მასტის ტუზი-მეფე.",
    "useH2": "როგორ გამოვიყენოთ ასეთი ცხრილი",
    "useP": "ცხრილი ხელებს სუფთა სიძლიერით ალაგებს, სანამ ვინმე იმოქმედებს. ნამდვილ მაგიდასთან ადრეული პოზიციიდან, სადაც თქვენ შემდეგ ბევრი მოთამაშე მოქმედებს, ნაკლები ხელი ითამაშეთ, Button-იდან და Cut-off-იდან კი — მეტი. ხელებით, რომლებსაც თამაშობთ, Call-ის ნაცვლად Raise გააკეთეთ, ცხრილის ქვედა ნაწილზე Fold გააკეთეთ და გახსოვდეთ, რომ ხელის ღირებულება სტეკებზე, ბლაინდებსა და თქვენს მოწინააღმდეგეებზეც არის დამოკიდებული. PokerTH-ის ტურნირში ბლაინდები გამუდმებით იზრდება, ამიტომ სათამაშოდ ღირებული ხელების წრე ფართოვდება, როცა სტეკები მცირდება.",
    "faqH2": "კითხვები",
    "faq": [
      [
        "რომელია საუკეთესო საწყისი ხელი Texas Hold’em-ში?",
        "ტუზების წყვილი. ერთ შემთხვევით ხელთან ის {aa1}-ს იგებს და ფავორიტია ყველა სხვა საწყისი ხელის წინააღმდეგ."
      ],
      [
        "ტუზი-მეფე ქალების წყვილზე უკეთესია?",
        "არა, თუმცა თითქმის თანაბარია: ქალები სხვადასხვა მასტის ტუზი-მეფის წინააღმდეგ {qqak}-ს იგებენ. ერთ შემთხვევით ხელთან ერთი მასტის ტუზი-მეფე {aks1}-ს იგებს, ქალები კი — {qq1}-ს."
      ],
      [
        "რამდენი საწყისი ხელი არსებობს?",
        "{combos} ორკარტიანი კომბინაცია, რომლებიც 169 განსხვავებულ საწყის ხელს ქმნის: 13 წყვილი, 78 ერთი მასტის და 78 სხვადასხვა მასტის."
      ],
      [
        "რამდენი ღირს ერთი მასტის ხელი?",
        "საშუალოდ დაახლოებით {suitGain}-ით მეტი მოგების შანსი, ვიდრე იმავე ხელს სხვადასხვა მასტით."
      ],
      [
        "სად შემიძლია საწყისი ხელების შერჩევაში ვარჯიში?",
        "PokerTH-ის სავარჯიშო რეჟიმში კომპიუტერულ მეტოქეებთან, ჩანართით ალბათობები, რომელიც კარტების გახსნისას თქვენი მოგების შანსს აჩვენებს."
      ]
    ]
  },
  kk: {
    "title": "Покер: бастапқы қолдар кестесі — 169 қолдың рейтингі | PokerTH",
    "desc": "Texas Hold’em-нің 169 бастапқы қолы бір кестеде: бір, үш және алты қарсыласқа қарсы ұту мүмкіндігі бойынша рейтинг. Бір масть не әртүрлі масть, жұптар, ең нашар қол.",
    "ldHeadline": "Texas Hold’em бастапқы қолдар кестесі: барлық 169 қолдың рейтингі",
    "ldDesc": "Texas Hold’em-нің 169 бастапқы қолы кестеге түсіріліп, бір, үш және алты кездейсоқ қолға қарсы ұту мүмкіндігі бойынша сұрыпталған.",
    "h1": "Texas Hold’em бастапқы қолдары: барлық 169, рейтинг бойынша",
    "lead": "Екі жеке картаңыз — әр таратудағы алғашқы шешім. Екі картаның түсуінің {combos} жолы бар, бірақ масть ескерілмесе, түрлі бастапқы қол небәрі 169. Бұл бет олардың бәрін ұту мүмкіндігімен бірге кестеде көрсетеді; әрқайсысы үшін бұл мүмкіндік миллион таратуды симуляциялау арқылы есептелген.",
    "chartH2": "Бастапқы қолдар кестесі",
    "chartP": "Жұптар диагональ бойымен орналасқан. Оның үстінде бір масть қолдар (s, екі карта да бір масть), астында әртүрлі масть қолдар (o). T ондықты білдіреді. Әр шаршыдағы сан — бордтың бес картасы түгел таратылғанда қолдың бір кездейсоқ қолды ұту мүмкіндігі, тең нәтиже жарты жеңіс ретінде есептеледі; шаршы неғұрлым жасыл болса, қол соғұрлым күшті.",
    "topH2": "Ең үздік бастапқы қолдар",
    "topP": "Бір қарсыласқа қарсы ең күшті жиырма қол және олардың үш және алты қарсыласқа қарсы көрсеткіштері:",
    "cols": [
      "Орын",
      "Қол",
      "1 қарсылас",
      "3 қарсылас",
      "6 қарсылас"
    ],
    "multiH2": "Қарсылас көбейсе, қолдар да өзгереді",
    "multiP": "Банкке ойыншылар қосылған сайын әр қол сирек ұтады, бірақ бірдей қарқынмен емес, сондықтан рейтинг өзгереді. Қалталық тұздар шыңда қалады: хедз-апта {aa1}, алты қарсыласқа қарсы да {aa6}. Бір масть коннекторлар жоғарылайды, өйткені олар үлкен банктерді ұтатын стрит пен флеш жинайды: бір масть жеті-алты хедз-апта {r76s1}-орыннан алты қарсыласқа қарсы {r76s6}-орынға көтеріледі, бір масть валет-ондық {rjts1}-орыннан {rjts6}-орынға. Орта жұптар төмендейді — жетілер {r77_1}-орыннан {r77_6}-орынға түседі — сондай-ақ бір үлкен картасы мен әлсіз кикері бар әртүрлі масть қолдар да, мысалы әртүрлі масть король-алты, {rk6o1}-орыннан {rk6o6}-орынға.",
    "suitedH2": "Бір масть па, әртүрлі масть па?",
    "suitedP": "Бір масть екі карта дәл сондай әртүрлі масть карталардан қымбат — барлық 78 дәреже жұбы бойынша орта есеппен шамамен {suitGain} артық, қолға қарай ең азы {suitMin}, ең көбі {suitMax}. Бұл маңызды, бірақ көрінгендей емес: флеш сирек жиналады, ал әлсіз бір масть қол бәрібір әлсіз қол.",
    "worstH2": "Ең нашар бастапқы қол",
    "worstP": "Бір кездейсоқ қолға қарсы әртүрлі масть үш-екі — бәрінен әлсізі, {w32}. Покердегі ең нашар қол деп жиі аталатын әртүрлі масть жеті-екі {w72} жағдайда ұтады және хедз-апта 169 қолдың ішінде {r72}-орында тұр — бірақ алты қарсыласқа қарсы ол ең соңғы, өйткені оның екі картасы бірге стрит жинау үшін бір-бірінен тым алыс, ал басқа нәрсені ұту үшін тым кіші.",
    "countH2": "Әр түрі қаншалықты жиі түседі",
    "countP": "Мүмкін {combos} екі карталы қолдың {pairCombos} — жұп ({pairPct}), {suitedCombos} — бір масть ({suitedPct}), {offCombos} — әртүрлі масть ({offPct}). Әр жұп 6 тәсілмен, әр бір масть қол 4 тәсілмен, әр әртүрлі масть қол 12 тәсілмен түсуі мүмкін — сондықтан әртүрлі масть тұз-корольді бір масть тұз-корольден үш есе жиі көресіз.",
    "useH2": "Мұндай кестені қалай пайдалану керек",
    "useP": "Кесте қолдарды ешкім әрекет етпей тұрып, таза күші бойынша сұрыптайды. Нақты үстелде сізден кейін көп ойыншы әрекет ететін ерте позициядан азырақ қол ойнаңыз, ал баттон мен кат-оффтан көбірек. Ойнайтын қолдарыңызбен Call емес, Raise жасаңыз, кестенің төменгі жағындағы қолдарға Fold жасаңыз және қолдың құны стектерге, блайндтарға және қарсыластарыңызға да байланысты екенін есте сақтаңыз. PokerTH турнирінде блайндтар үнемі көтеріледі, сондықтан стектер қысқарған сайын ойнауға тұрарлық қолдар ауқымы кеңейеді.",
    "faqH2": "Сұрақтар",
    "faq": [
      [
        "Texas Hold’em-дегі ең үздік бастапқы қол қандай?",
        "Қалталық тұздар. Олар бір кездейсоқ қолға қарсы {aa1} жағдайда ұтады және кез келген басқа бастапқы қолға қарсы фаворит."
      ],
      [
        "Тұз-король дамалар жұбынан күшті ме?",
        "Жоқ, бірақ айырмашылық аз: дамалар әртүрлі масть тұз-корольге қарсы {qqak} жағдайда ұтады. Бір кездейсоқ қолға қарсы бір масть тұз-король {aks1}, ал дамалар {qq1} жағдайда ұтады."
      ],
      [
        "Бастапқы қолдар қанша?",
        "{combos} екі карталы комбинация, олар 169 түрлі бастапқы қол құрайды: 13 жұп, 78 бір масть және 78 әртүрлі масть."
      ],
      [
        "Бір масть қол қаншалықты қымбат?",
        "Орта есеппен сол қолдың әртүрлі масть нұсқасынан ұту мүмкіндігі шамамен {suitGain} жоғары."
      ],
      [
        "Бастапқы қолды таңдауды қайда жаттықтыруға болады?",
        "PokerTH жаттығу режимінде компьютер қарсыластарына қарсы; «Ықтималдық» қойындысы карталар ашылған сайын ұту мүмкіндігіңізді көрсетіп тұрады."
      ]
    ]
  },
  km: {
    "title": "តារាងដៃចាប់ផ្ដើមបៀ — ចំណាត់ថ្នាក់ដៃទាំង 169 | PokerTH",
    "desc": "ដៃចាប់ផ្ដើម Texas Hold’em ទាំង 169 ក្នុងតារាងតែមួយ ចាត់ថ្នាក់តាមឱកាសឈ្នះទល់នឹងគូប្រកួតមួយ បី និងប្រាំមួយនាក់។ ពណ៌ដូចគ្នា ឬខុសគ្នា គូ និងដៃអាក្រក់បំផុត។",
    "ldHeadline": "តារាងដៃចាប់ផ្ដើម Texas Hold’em៖ ដៃទាំង 169 តាមចំណាត់ថ្នាក់",
    "ldDesc": "ដៃចាប់ផ្ដើម Texas Hold’em ទាំង 169 ក្នុងតារាង ចាត់ថ្នាក់តាមឱកាសឈ្នះទល់នឹងដៃចៃដន្យមួយ បី និងប្រាំមួយ។",
    "h1": "ដៃចាប់ផ្ដើម Texas Hold’em៖ ទាំង 169 តាមចំណាត់ថ្នាក់",
    "lead": "Hole cards ពីរសន្លឹករបស់អ្នក គឺជាការសម្រេចចិត្តដំបូងនៃគ្រប់ដៃ។ មាន {combos} របៀបក្នុងការទទួលបៀពីរសន្លឹក ប៉ុន្តែមានដៃចាប់ផ្ដើមខុសៗគ្នាតែ 169 ប៉ុណ្ណោះ នៅពេលមិនគិតពីពណ៌។ ទំព័រនេះបង្ហាញដៃទាំងអស់ក្នុងតារាង ជាមួយឱកាសឈ្នះរបស់វា ដែលគណនាដោយក្លែងធ្វើការចែកមួយលានដងសម្រាប់ដៃនីមួយៗ។",
    "chartH2": "តារាងដៃចាប់ផ្ដើម",
    "chartP": "គូរៀបតាមអង្កត់ទ្រូង។ ខាងលើវាជាដៃពណ៌ដូចគ្នា (s បៀទាំងពីរសន្លឹកពណ៌ដូចគ្នា) ខាងក្រោមវាជាដៃពណ៌ខុសគ្នា (o)។ T មានន័យថាដប់ (10)។ លេខក្នុងប្រអប់នីមួយៗ គឺជាឱកាសដែលដៃនោះឈ្នះទល់នឹងដៃចៃដន្យមួយ នៅពេលបៀក្ដារទាំងប្រាំសន្លឹកត្រូវបានចែក ដោយរាប់ការស្មើជាពាក់កណ្ដាលនៃការឈ្នះ។ ប្រអប់កាន់តែបៃតង ដៃកាន់តែខ្លាំង។",
    "topH2": "ដៃចាប់ផ្ដើមល្អបំផុត",
    "topP": "ដៃខ្លាំងបំផុតម្ភៃទល់នឹងគូប្រកួតម្នាក់ និងរបៀបដែលវាទប់ទល់នឹងគូប្រកួតបីនាក់ និងប្រាំមួយនាក់៖",
    "cols": [
      "ចំណាត់ថ្នាក់",
      "ដៃ",
      "គូប្រកួត 1",
      "គូប្រកួត 3",
      "គូប្រកួត 6"
    ],
    "multiH2": "គូប្រកួតកាន់តែច្រើន ដៃខ្លាំងខុសគ្នា",
    "multiP": "គ្រប់ដៃឈ្នះតិចជាងមុន នៅពេលអ្នកលេងចូលក្នុង pot កាន់តែច្រើន ប៉ុន្តែមិនក្នុងល្បឿនដូចគ្នាទេ ដូច្នេះចំណាត់ថ្នាក់ផ្លាស់ប្ដូរ។ គូ pocket AA នៅតែឈរលើគេ៖ {aa1} ក្នុង heads-up ហើយនៅតែ {aa6} ទល់នឹងគូប្រកួតប្រាំមួយនាក់។ ដៃតគ្នាពណ៌ដូចគ្នាឡើងចំណាត់ថ្នាក់ ព្រោះវាបង្កើត Straight និង Flush ដែលឈ្នះ pot ធំៗ៖ 7-6 ពណ៌ដូចគ្នាឡើងពីលំដាប់ទី {r76s1} ក្នុង heads-up ទៅលំដាប់ទី {r76s6} ទល់នឹងប្រាំមួយនាក់ ហើយ J-10 ពណ៌ដូចគ្នាពីលំដាប់ទី {rjts1} ទៅ {rjts6}។ គូកណ្ដាលធ្លាក់ចុះ — 77 ធ្លាក់ពីលំដាប់ទី {r77_1} ទៅ {r77_6} — ហើយដៃពណ៌ខុសគ្នាដែលមានសន្លឹកខ្ពស់មួយ និង kicker ខ្សោយក៏ដូចគ្នា ដូចជា K-6 ពណ៌ខុសគ្នា ពីលំដាប់ទី {rk6o1} ទៅ {rk6o6}។",
    "suitedH2": "ពណ៌ដូចគ្នា ឬពណ៌ខុសគ្នា?",
    "suitedP": "បៀពីរសន្លឹកពណ៌ដូចគ្នា មានតម្លៃជាងបៀដដែលពណ៌ខុសគ្នា — ជាមធ្យមប្រហែល {suitGain} ច្រើនជាង លើបន្សំចំណាត់ថ្នាក់ពីរខុសគ្នាទាំង 78 ពី {suitMin} ដល់ {suitMax} អាស្រ័យលើដៃ។ វាសំខាន់ ប៉ុន្តែតិចជាងអ្វីដែលមើលទៅ៖ Flush កម្រកើតមាន ហើយដៃខ្សោយពណ៌ដូចគ្នានៅតែជាដៃខ្សោយ។",
    "worstH2": "ដៃចាប់ផ្ដើមអាក្រក់បំផុត",
    "worstP": "ទល់នឹងដៃចៃដន្យមួយ 3-2 ពណ៌ខុសគ្នាគឺខ្សោយបំផុតក្នុងចំណោមទាំងអស់ ដោយ {w32}។ 7-2 ពណ៌ខុសគ្នា ដែលគេតែងហៅថាដៃអាក្រក់បំផុតក្នុងបៀ ឈ្នះ {w72} និងស្ថិតលំដាប់ទី {r72} ក្នុងចំណោម 169 ក្នុង heads-up — ប៉ុន្តែទល់នឹងគូប្រកួតប្រាំមួយនាក់ វាស្ថិតនៅចុងក្រោយបង្អស់ ព្រោះបៀពីរសន្លឹករបស់វានៅឆ្ងាយពីគ្នាពេក មិនអាចបង្កើត Straight ជាមួយគ្នាបាន ហើយទាបពេកមិនអាចឈ្នះដោយអ្វីផ្សេងបានច្រើន។",
    "countH2": "ញឹកញាប់ប៉ុណ្ណាដែលអ្នកទទួលបានប្រភេទនីមួយៗ",
    "countP": "ក្នុងចំណោមដៃពីរសន្លឹកដែលអាចមានទាំង {combos} មាន {pairCombos} ជាគូ ({pairPct}) {suitedCombos} ជាដៃពណ៌ដូចគ្នា ({suitedPct}) និង {offCombos} ជាដៃពណ៌ខុសគ្នា ({offPct})។ គូនីមួយៗអាចចែកបាន 6 របៀប ដៃពណ៌ដូចគ្នានីមួយៗ 4 របៀប ដៃពណ៌ខុសគ្នានីមួយៗ 12 របៀប — នេះហើយជាមូលហេតុដែលអ្នកឃើញ A-K ពណ៌ខុសគ្នាញឹកញាប់ជាង A-K ពណ៌ដូចគ្នាបីដង។",
    "useH2": "របៀបប្រើតារាងបែបនេះ",
    "useP": "តារាងចាត់ថ្នាក់ដៃតាមកម្លាំងសុទ្ធ មុនពេលនរណាម្នាក់ធ្វើសកម្មភាព។ នៅតុពិត ចូរលេងដៃតិចពីទីតាំងដំបូង ដែលអ្នកលេងជាច្រើនធ្វើសកម្មភាពក្រោយអ្នក ហើយលេងច្រើនពីប៊ូតុង និង cut-off។ ចូរ Raise ជាជាង Call ជាមួយដៃដែលអ្នកលេង ចូរ Fold ដៃនៅផ្នែកខាងក្រោមនៃតារាង ហើយចាំថាតម្លៃនៃដៃក៏អាស្រ័យលើស្តាក់ blind និងគូប្រកួតរបស់អ្នកដែរ។ ក្នុងការប្រកួត PokerTH blind កើនឡើងជានិច្ច ដូច្នេះដៃដែលគួរលេងកាន់តែទូលាយ នៅពេលស្តាក់កាន់តែខ្លី។",
    "faqH2": "សំណួរ",
    "faq": [
      [
        "តើដៃចាប់ផ្ដើមល្អបំផុតក្នុង Texas Hold’em ជាអ្វី?",
        "គូ pocket AA។ វាឈ្នះ {aa1} ទល់នឹងដៃចៃដន្យមួយ ហើយជាដៃដែលមានប្រៀបទល់នឹងដៃចាប់ផ្ដើមផ្សេងទៀតទាំងអស់។"
      ],
      [
        "តើ A-K ល្អជាងគូ QQ ទេ?",
        "ទេ ប៉ុន្តែជិតគ្នា៖ QQ ឈ្នះ {qqak} ទល់នឹង A-K ពណ៌ខុសគ្នា។ ទល់នឹងដៃចៃដន្យមួយ A-K ពណ៌ដូចគ្នាឈ្នះ {aks1} ហើយ QQ ឈ្នះ {qq1}។"
      ],
      [
        "តើមានដៃចាប់ផ្ដើមប៉ុន្មាន?",
        "បន្សំបៀពីរសន្លឹក {combos} ដែលបង្កើតបានជាដៃចាប់ផ្ដើមខុសៗគ្នា 169៖ គូ 13 ពណ៌ដូចគ្នា 78 និងពណ៌ខុសគ្នា 78។"
      ],
      [
        "តើដៃពណ៌ដូចគ្នាមានតម្លៃប៉ុណ្ណា?",
        "ជាមធ្យម ឱកាសឈ្នះច្រើនជាងដៃដដែលពណ៌ខុសគ្នាប្រហែល {suitGain}។"
      ],
      [
        "តើខ្ញុំអាចហ្វឹកហាត់ការជ្រើសដៃចាប់ផ្ដើមនៅឯណា?",
        "ក្នុងរបៀបហ្វឹកហាត់របស់ PokerTH ទល់នឹងគូប្រកួតកុំព្យូទ័រ ដោយផ្ទាំង “ឱកាស” បង្ហាញឱកាសឈ្នះរបស់អ្នក នៅពេលបៀចេញ។"
      ]
    ]
  },
  kn: {
    "title": "ಪೋಕರ್ ಆರಂಭಿಕ ಹ್ಯಾಂಡ್ ಚಾರ್ಟ್ — ಎಲ್ಲ 169 ಹ್ಯಾಂಡ್‌ಗಳ ಶ್ರೇಯಾಂಕ | PokerTH",
    "desc": "ಎಲ್ಲ 169 Texas Hold’em ಆರಂಭಿಕ ಹ್ಯಾಂಡ್‌ಗಳು ಒಂದೇ ಚಾರ್ಟ್‌ನಲ್ಲಿ, 1, 3 ಮತ್ತು 6 ಎದುರಾಳಿಗಳ ವಿರುದ್ಧ ಗೆಲುವಿನ ಸಾಧ್ಯತೆಯ ಪ್ರಕಾರ. ಸೂಟೆಡ್ ಅಥವಾ ಆಫ್‌ಸೂಟ್, ಜೋಡಿಗಳು, ಅತಿ ಕೆಟ್ಟ ಹ್ಯಾಂಡ್.",
    "ldHeadline": "Texas Hold’em ಆರಂಭಿಕ ಹ್ಯಾಂಡ್ ಚಾರ್ಟ್: ಎಲ್ಲ 169 ಹ್ಯಾಂಡ್‌ಗಳ ಶ್ರೇಯಾಂಕ",
    "ldDesc": "169 Texas Hold’em ಆರಂಭಿಕ ಹ್ಯಾಂಡ್‌ಗಳು, ಒಂದು, ಮೂರು ಮತ್ತು ಆರು ಯಾದೃಚ್ಛಿಕ ಹ್ಯಾಂಡ್‌ಗಳ ವಿರುದ್ಧ ಗೆಲ್ಲುವ ಸಾಧ್ಯತೆಯ ಪ್ರಕಾರ ಚಾರ್ಟ್ ಮಾಡಿ ಶ್ರೇಯಾಂಕಿಸಲಾಗಿದೆ.",
    "h1": "Texas Hold’em ಆರಂಭಿಕ ಹ್ಯಾಂಡ್‌ಗಳು: ಎಲ್ಲ 169, ಶ್ರೇಯಾಂಕದೊಂದಿಗೆ",
    "lead": "ನಿಮ್ಮ ಎರಡು ಹೋಲ್ ಕಾರ್ಡ್‌ಗಳು ಪ್ರತಿ ಹ್ಯಾಂಡ್‌ನ ಮೊದಲ ನಿರ್ಧಾರ. ಎರಡು ಕಾರ್ಡ್‌ಗಳನ್ನು ಪಡೆಯಲು {combos} ವಿಧಾನಗಳಿವೆ, ಆದರೆ ಸೂಟ್‌ಗಳನ್ನು ಬದಿಗಿಟ್ಟರೆ ಕೇವಲ 169 ವಿಭಿನ್ನ ಆರಂಭಿಕ ಹ್ಯಾಂಡ್‌ಗಳಿವೆ. ಈ ಪುಟ ಅವೆಲ್ಲವನ್ನೂ ಅವುಗಳ ಗೆಲುವಿನ ಸಾಧ್ಯತೆಯೊಂದಿಗೆ ಚಾರ್ಟ್‌ನಲ್ಲಿ ತೋರಿಸುತ್ತದೆ; ಪ್ರತಿಯೊಂದಕ್ಕೂ ಹತ್ತು ಲಕ್ಷ ಡೀಲ್‌ಗಳನ್ನು ಸಿಮ್ಯುಲೇಟ್ ಮಾಡಿ ಇದನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ.",
    "chartH2": "ಆರಂಭಿಕ ಹ್ಯಾಂಡ್ ಚಾರ್ಟ್",
    "chartP": "ಜೋಡಿಗಳು ಕರ್ಣದ ಉದ್ದಕ್ಕೂ ಇವೆ. ಅದರ ಮೇಲೆ ಸೂಟೆಡ್ ಹ್ಯಾಂಡ್‌ಗಳು (s, ಎರಡೂ ಕಾರ್ಡ್‌ಗಳು ಒಂದೇ ಸೂಟ್‌ನವು), ಕೆಳಗೆ ಆಫ್‌ಸೂಟ್ ಹ್ಯಾಂಡ್‌ಗಳು (o). T ಎಂದರೆ ಹತ್ತು. ಪ್ರತಿ ಚೌಕದಲ್ಲಿರುವ ಸಂಖ್ಯೆಯು, ಬೋರ್ಡ್‌ನ ಐದೂ ಕಾರ್ಡ್‌ಗಳನ್ನು ಹಂಚಿದಾಗ ಆ ಹ್ಯಾಂಡ್ ಒಂದು ಯಾದೃಚ್ಛಿಕ ಹ್ಯಾಂಡ್ ವಿರುದ್ಧ ಗೆಲ್ಲುವ ಸಾಧ್ಯತೆ; ಟೈ ಅನ್ನು ಅರ್ಧ ಗೆಲುವು ಎಂದು ಎಣಿಸಲಾಗಿದೆ. ಚೌಕ ಹೆಚ್ಚು ಹಸಿರಾಗಿದ್ದಷ್ಟೂ ಹ್ಯಾಂಡ್ ಹೆಚ್ಚು ಬಲಿಷ್ಠ.",
    "topH2": "ಅತ್ಯುತ್ತಮ ಆರಂಭಿಕ ಹ್ಯಾಂಡ್‌ಗಳು",
    "topP": "ಒಬ್ಬ ಎದುರಾಳಿಯ ವಿರುದ್ಧ ಇಪ್ಪತ್ತು ಅತ್ಯಂತ ಬಲಿಷ್ಠ ಹ್ಯಾಂಡ್‌ಗಳು, ಮತ್ತು ಮೂವರು ಹಾಗೂ ಆರು ಎದುರಾಳಿಗಳ ವಿರುದ್ಧ ಅವು ಹೇಗೆ ನಿಲ್ಲುತ್ತವೆ:",
    "cols": [
      "ಶ್ರೇಯಾಂಕ",
      "ಹ್ಯಾಂಡ್",
      "1 ಎದುರಾಳಿ",
      "3 ಎದುರಾಳಿಗಳು",
      "6 ಎದುರಾಳಿಗಳು"
    ],
    "multiH2": "ಹೆಚ್ಚು ಎದುರಾಳಿಗಳು, ಬೇರೆ ಹ್ಯಾಂಡ್‌ಗಳು",
    "multiP": "ಪಾಟ್‌ಗೆ ಆಟಗಾರರು ಸೇರಿದಂತೆ ಪ್ರತಿ ಹ್ಯಾಂಡ್ ಕಡಿಮೆ ಬಾರಿ ಗೆಲ್ಲುತ್ತದೆ, ಆದರೆ ಒಂದೇ ವೇಗದಲ್ಲಿ ಅಲ್ಲ, ಹೀಗಾಗಿ ಶ್ರೇಯಾಂಕ ಬದಲಾಗುತ್ತದೆ. ಪಾಕೆಟ್ ಏಸ್‌ಗಳು ಮೇಲೆಯೇ ಇರುತ್ತವೆ: ಹೆಡ್ಸ್-ಅಪ್‌ನಲ್ಲಿ {aa1}, ಆರು ಎದುರಾಳಿಗಳ ವಿರುದ್ಧವೂ {aa6}. ಸೂಟೆಡ್ ಕನೆಕ್ಟರ್‌ಗಳು ಮೇಲೇರುತ್ತವೆ, ಏಕೆಂದರೆ ಅವು ದೊಡ್ಡ ಪಾಟ್‌ಗಳನ್ನು ಗೆಲ್ಲುವ ಸ್ಟ್ರೈಟ್ ಮತ್ತು ಫ್ಲಶ್‌ಗಳನ್ನು ಮಾಡುತ್ತವೆ: ಸೂಟೆಡ್ ಸೆವೆನ್-ಸಿಕ್ಸ್ ಹೆಡ್ಸ್-ಅಪ್‌ನಲ್ಲಿನ {r76s1}ನೇ ಸ್ಥಾನದಿಂದ ಆರು ಎದುರಾಳಿಗಳ ವಿರುದ್ಧ {r76s6}ನೇ ಸ್ಥಾನಕ್ಕೆ ಏರುತ್ತದೆ, ಸೂಟೆಡ್ ಜ್ಯಾಕ್-ಟೆನ್ {rjts1}ನೇ ಸ್ಥಾನದಿಂದ {rjts6}ನೇ ಸ್ಥಾನಕ್ಕೆ. ಮಧ್ಯಮ ಜೋಡಿಗಳು ಕೆಳಗಿಳಿಯುತ್ತವೆ — ಸೆವೆನ್‌ಗಳ ಜೋಡಿ {r77_1}ನೇ ಸ್ಥಾನದಿಂದ {r77_6}ನೇ ಸ್ಥಾನಕ್ಕೆ ಇಳಿಯುತ್ತದೆ — ಹಾಗೆಯೇ ಒಂದು ಹೈ ಕಾರ್ಡ್ ಮತ್ತು ದುರ್ಬಲ ಕಿಕರ್ ಇರುವ ಆಫ್‌ಸೂಟ್ ಹ್ಯಾಂಡ್‌ಗಳೂ ಇಳಿಯುತ್ತವೆ, ಉದಾಹರಣೆಗೆ ಆಫ್‌ಸೂಟ್ ಕಿಂಗ್-ಸಿಕ್ಸ್ {rk6o1}ನೇ ಸ್ಥಾನದಿಂದ {rk6o6}ನೇ ಸ್ಥಾನಕ್ಕೆ.",
    "suitedH2": "ಸೂಟೆಡ್ ಅಥವಾ ಆಫ್‌ಸೂಟ್?",
    "suitedP": "ಒಂದೇ ಸೂಟ್‌ನ ಎರಡು ಕಾರ್ಡ್‌ಗಳು ಅವೇ ಕಾರ್ಡ್‌ಗಳ ಆಫ್‌ಸೂಟ್ ರೂಪಕ್ಕಿಂತ ಹೆಚ್ಚು ಮೌಲ್ಯದವು — ಎಲ್ಲ 78 ರ‍್ಯಾಂಕ್ ಜೋಡಿಗಳಲ್ಲಿ ಸರಾಸರಿ ಸುಮಾರು {suitGain} ಹೆಚ್ಚು, ಹ್ಯಾಂಡ್‌ಗೆ ಅನುಗುಣವಾಗಿ {suitMin} ರಿಂದ {suitMax} ವರೆಗೆ. ಇದು ಮುಖ್ಯ, ಆದರೆ ತೋರುವಷ್ಟು ಅಲ್ಲ: ಫ್ಲಶ್‌ಗಳು ಅಪರೂಪ, ಮತ್ತು ದುರ್ಬಲ ಸೂಟೆಡ್ ಹ್ಯಾಂಡ್ ಇನ್ನೂ ದುರ್ಬಲ ಹ್ಯಾಂಡ್ ಆಗಿಯೇ ಉಳಿಯುತ್ತದೆ.",
    "worstH2": "ಅತಿ ಕೆಟ್ಟ ಆರಂಭಿಕ ಹ್ಯಾಂಡ್",
    "worstP": "ಒಂದು ಯಾದೃಚ್ಛಿಕ ಹ್ಯಾಂಡ್ ವಿರುದ್ಧ, ಆಫ್‌ಸೂಟ್ ತ್ರೀ-ಟು {w32} ನೊಂದಿಗೆ ಎಲ್ಲಕ್ಕಿಂತ ದುರ್ಬಲ. ಪೋಕರ್‌ನ ಅತಿ ಕೆಟ್ಟ ಹ್ಯಾಂಡ್ ಎಂದು ಹೆಚ್ಚಾಗಿ ಕರೆಯಲಾಗುವ ಆಫ್‌ಸೂಟ್ ಸೆವೆನ್-ಟು {w72} ಗೆಲ್ಲುತ್ತದೆ ಮತ್ತು ಹೆಡ್ಸ್-ಅಪ್‌ನಲ್ಲಿ 169 ರಲ್ಲಿ {r72}ನೇ ಸ್ಥಾನದಲ್ಲಿದೆ — ಆದರೆ ಆರು ಎದುರಾಳಿಗಳ ವಿರುದ್ಧ ಅದು ಕೊಟ್ಟಕೊನೆಯದು, ಏಕೆಂದರೆ ಅದರ ಎರಡು ಕಾರ್ಡ್‌ಗಳು ಒಟ್ಟಿಗೆ ಸ್ಟ್ರೈಟ್ ಮಾಡಲು ತುಂಬಾ ದೂರದಲ್ಲಿವೆ ಮತ್ತು ಬೇರೆ ಹೆಚ್ಚೇನನ್ನೂ ಗೆಲ್ಲಲು ತುಂಬಾ ಚಿಕ್ಕವು.",
    "countH2": "ಪ್ರತಿ ಬಗೆಯ ಹ್ಯಾಂಡ್ ನಿಮಗೆ ಎಷ್ಟು ಬಾರಿ ಬರುತ್ತದೆ",
    "countP": "ಸಾಧ್ಯವಿರುವ {combos} ಎರಡು-ಕಾರ್ಡ್ ಹ್ಯಾಂಡ್‌ಗಳಲ್ಲಿ {pairCombos} ಜೋಡಿಗಳು ({pairPct}), {suitedCombos} ಸೂಟೆಡ್ ({suitedPct}) ಮತ್ತು {offCombos} ಆಫ್‌ಸೂಟ್ ({offPct}). ಪ್ರತಿ ಜೋಡಿಯನ್ನು 6 ವಿಧಗಳಲ್ಲಿ, ಪ್ರತಿ ಸೂಟೆಡ್ ಹ್ಯಾಂಡ್ ಅನ್ನು 4 ವಿಧಗಳಲ್ಲಿ, ಪ್ರತಿ ಆಫ್‌ಸೂಟ್ ಹ್ಯಾಂಡ್ ಅನ್ನು 12 ವಿಧಗಳಲ್ಲಿ ಹಂಚಬಹುದು — ಅದಕ್ಕೇ ಆಫ್‌ಸೂಟ್ ಏಸ್-ಕಿಂಗ್ ಸೂಟೆಡ್ ಏಸ್-ಕಿಂಗ್‌ಗಿಂತ ಮೂರು ಪಟ್ಟು ಹೆಚ್ಚು ಬಾರಿ ಬರುತ್ತದೆ.",
    "useH2": "ಇಂತಹ ಚಾರ್ಟ್ ಅನ್ನು ಹೇಗೆ ಬಳಸುವುದು",
    "useP": "ಚಾರ್ಟ್ ಯಾರೂ ಆಡುವ ಮೊದಲೇ, ಕೇವಲ ಮೂಲ ಬಲದ ಆಧಾರದ ಮೇಲೆ ಹ್ಯಾಂಡ್‌ಗಳಿಗೆ ಶ್ರೇಯಾಂಕ ನೀಡುತ್ತದೆ. ನಿಜವಾದ ಟೇಬಲ್‌ನಲ್ಲಿ, ನಿಮ್ಮ ನಂತರ ಅನೇಕ ಆಟಗಾರರು ಆಡುವ ಆರಂಭಿಕ ಸ್ಥಾನದಿಂದ ಕಡಿಮೆ ಹ್ಯಾಂಡ್‌ಗಳನ್ನು, ಬಟನ್ ಮತ್ತು ಕಟ್-ಆಫ್‌ನಿಂದ ಹೆಚ್ಚು ಹ್ಯಾಂಡ್‌ಗಳನ್ನು ಆಡಿ. ನೀವು ಆಡುವ ಹ್ಯಾಂಡ್‌ಗಳೊಂದಿಗೆ Call ಬದಲು Raise ಮಾಡಿ, ಚಾರ್ಟ್‌ನ ಕೆಳಭಾಗದ ಹ್ಯಾಂಡ್‌ಗಳನ್ನು Fold ಮಾಡಿ, ಮತ್ತು ಒಂದು ಹ್ಯಾಂಡ್‌ನ ಮೌಲ್ಯ ಸ್ಟ್ಯಾಕ್‌ಗಳು, ಬ್ಲೈಂಡ್‌ಗಳು ಮತ್ತು ನಿಮ್ಮ ಎದುರಾಳಿಗಳ ಮೇಲೂ ಅವಲಂಬಿಸಿದೆ ಎಂಬುದನ್ನು ನೆನಪಿಡಿ. PokerTH ಟೂರ್ನಮೆಂಟ್‌ನಲ್ಲಿ ಬ್ಲೈಂಡ್‌ಗಳು ಏರುತ್ತಲೇ ಇರುತ್ತವೆ, ಹೀಗಾಗಿ ಸ್ಟ್ಯಾಕ್‌ಗಳು ಚಿಕ್ಕದಾದಂತೆ ಆಡಲು ಯೋಗ್ಯವಾದ ಹ್ಯಾಂಡ್‌ಗಳ ವ್ಯಾಪ್ತಿ ವಿಸ್ತರಿಸುತ್ತದೆ.",
    "faqH2": "ಪ್ರಶ್ನೆಗಳು",
    "faq": [
      [
        "Texas Hold’em ನಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಆರಂಭಿಕ ಹ್ಯಾಂಡ್ ಯಾವುದು?",
        "ಪಾಕೆಟ್ ಏಸ್‌ಗಳು. ಅವು ಒಂದು ಯಾದೃಚ್ಛಿಕ ಹ್ಯಾಂಡ್ ವಿರುದ್ಧ {aa1} ಗೆಲ್ಲುತ್ತವೆ, ಮತ್ತು ಉಳಿದ ಪ್ರತಿಯೊಂದು ಆರಂಭಿಕ ಹ್ಯಾಂಡ್ ವಿರುದ್ಧವೂ ಮೇಲುಗೈ ಹೊಂದಿವೆ."
      ],
      [
        "ಏಸ್-ಕಿಂಗ್ ಕ್ವೀನ್‌ಗಳ ಜೋಡಿಗಿಂತ ಉತ್ತಮವೇ?",
        "ಇಲ್ಲ, ಆದರೆ ಅಂತರ ಕಡಿಮೆ: ಆಫ್‌ಸೂಟ್ ಏಸ್-ಕಿಂಗ್ ವಿರುದ್ಧ ಕ್ವೀನ್‌ಗಳು {qqak} ಗೆಲ್ಲುತ್ತವೆ. ಒಂದು ಯಾದೃಚ್ಛಿಕ ಹ್ಯಾಂಡ್ ವಿರುದ್ಧ ಸೂಟೆಡ್ ಏಸ್-ಕಿಂಗ್ {aks1} ಮತ್ತು ಕ್ವೀನ್‌ಗಳು {qq1} ಗೆಲ್ಲುತ್ತವೆ."
      ],
      [
        "ಎಷ್ಟು ಆರಂಭಿಕ ಹ್ಯಾಂಡ್‌ಗಳಿವೆ?",
        "{combos} ಎರಡು-ಕಾರ್ಡ್ ಸಂಯೋಜನೆಗಳು, ಇವು 169 ವಿಭಿನ್ನ ಆರಂಭಿಕ ಹ್ಯಾಂಡ್‌ಗಳಾಗುತ್ತವೆ: 13 ಜೋಡಿಗಳು, 78 ಸೂಟೆಡ್ ಮತ್ತು 78 ಆಫ್‌ಸೂಟ್."
      ],
      [
        "ಸೂಟೆಡ್ ಹ್ಯಾಂಡ್‌ಗೆ ಎಷ್ಟು ಹೆಚ್ಚು ಮೌಲ್ಯವಿದೆ?",
        "ಸರಾಸರಿಯಾಗಿ, ಅದೇ ಹ್ಯಾಂಡ್‌ನ ಆಫ್‌ಸೂಟ್ ರೂಪಕ್ಕಿಂತ ಸುಮಾರು {suitGain} ಹೆಚ್ಚು ಗೆಲುವಿನ ಸಾಧ್ಯತೆ."
      ],
      [
        "ಆರಂಭಿಕ ಹ್ಯಾಂಡ್ ಆಯ್ಕೆಯನ್ನು ಎಲ್ಲಿ ಅಭ್ಯಾಸ ಮಾಡಬಹುದು?",
        "PokerTH ನ ಅಭ್ಯಾಸ ಮೋಡ್‌ನಲ್ಲಿ ಕಂಪ್ಯೂಟರ್ ಎದುರಾಳಿಗಳ ವಿರುದ್ಧ; ಕಾರ್ಡ್‌ಗಳು ಬರುತ್ತಿದ್ದಂತೆ “ಆಡ್ಸ್” ಟ್ಯಾಬ್ ನಿಮ್ಮ ಗೆಲುವಿನ ಸಾಧ್ಯತೆಯನ್ನು ತೋರಿಸುತ್ತದೆ."
      ]
    ]
  },
  ko: {
    "title": "포커 스타팅 핸드 표 — 169개 핸드 전체 순위 | PokerTH",
    "desc": "텍사스 홀덤 스타팅 핸드 169개 전부를 한 표에 담아, 상대 1명·3명·6명을 상대로 한 승률로 순위를 매겼습니다. 수티드와 오프수트, 페어, 최악의 핸드까지.",
    "ldHeadline": "텍사스 홀덤 스타팅 핸드 표: 169개 핸드 전체 순위",
    "ldDesc": "텍사스 홀덤의 스타팅 핸드 169개를 표로 정리하고, 무작위 핸드 1개·3개·6개를 상대로 한 승률에 따라 순위를 매겼습니다.",
    "h1": "텍사스 홀덤 스타팅 핸드: 169개 전체 순위",
    "lead": "두 장의 홀 카드는 모든 핸드의 첫 번째 결정입니다. 카드 두 장을 받는 경우의 수는 {combos}가지이지만, 무늬를 따지지 않으면 서로 다른 스타팅 핸드는 169개뿐입니다. 이 페이지는 그 전부를 승률과 함께 표로 보여 주며, 승률은 핸드마다 백만 번의 딜을 시뮬레이션해 계산했습니다.",
    "chartH2": "스타팅 핸드 표",
    "chartP": "페어는 대각선을 따라 놓입니다. 대각선 위쪽은 수티드 핸드(s, 두 장의 무늬가 같음), 아래쪽은 오프수트 핸드(o)입니다. T는 10을 뜻합니다. 각 칸의 숫자는 보드 카드 다섯 장이 모두 깔렸을 때 그 핸드가 무작위 핸드 하나를 이길 확률이며, 무승부는 절반의 승리로 셉니다. 칸이 초록색일수록 강한 핸드입니다.",
    "topH2": "가장 좋은 스타팅 핸드",
    "topP": "상대 1명을 기준으로 가장 강한 핸드 20개와, 상대가 3명·6명일 때의 성적:",
    "cols": [
      "순위",
      "핸드",
      "상대 1명",
      "상대 3명",
      "상대 6명"
    ],
    "multiH2": "상대가 많아지면 달라지는 핸드",
    "multiP": "팟에 들어오는 플레이어가 늘수록 모든 핸드의 승률이 떨어지지만, 떨어지는 속도가 같지 않아 순위가 바뀝니다. 포켓 에이스는 정상을 지킵니다: 헤즈업에서 {aa1}, 상대 6명을 상대로도 {aa6}입니다. 수티드 커넥터는 큰 팟을 따내는 스트레이트와 플러시를 만들기 때문에 순위가 오릅니다: 세븐-식스 수티드는 헤즈업 {r76s1}위에서 상대 6명일 때 {r76s6}위로, 잭-텐 수티드는 {rjts1}위에서 {rjts6}위로 올라갑니다. 중간 페어는 떨어지고 — 7 페어는 {r77_1}위에서 {r77_6}위로 — 높은 카드 한 장에 키커가 약한 오프수트 핸드도 마찬가지여서, 예를 들어 킹-식스 오프수트는 {rk6o1}위에서 {rk6o6}위로 내려갑니다.",
    "suitedH2": "수티드냐 오프수트냐?",
    "suitedP": "무늬가 같은 두 장은 같은 카드의 오프수트보다 가치가 높습니다 — 78가지 숫자 조합 전체에서 평균 약 {suitGain} 더 높고, 핸드에 따라 {suitMin}에서 {suitMax}까지 차이가 납니다. 중요하긴 하지만 보기보다는 덜합니다: 플러시는 드물고, 약한 수티드 핸드는 여전히 약한 핸드입니다.",
    "worstH2": "최악의 스타팅 핸드",
    "worstP": "무작위 핸드 하나를 상대로 가장 약한 핸드는 쓰리-투 오프수트로, 승률은 {w32}입니다. 흔히 포커 최악의 핸드로 불리는 세븐-투 오프수트는 승률이 {w72}이고 헤즈업에서 169개 중 {r72}위입니다 — 하지만 상대 6명을 상대로는 맨 꼴찌인데, 두 카드가 너무 떨어져 있어 함께 스트레이트를 만들 수 없고, 너무 낮아서 다른 것으로도 이기기 어렵기 때문입니다.",
    "countH2": "각 종류를 받는 빈도",
    "countP": "가능한 두 장짜리 핸드 {combos}가지 중 {pairCombos}가지가 페어({pairPct}), {suitedCombos}가지가 수티드({suitedPct}), {offCombos}가지가 오프수트({offPct})입니다. 페어 하나는 6가지, 수티드 핸드 하나는 4가지, 오프수트 핸드 하나는 12가지 방법으로 받을 수 있습니다 — 그래서 에이스-킹 오프수트를 에이스-킹 수티드보다 세 배 자주 보게 됩니다.",
    "useH2": "이런 표를 활용하는 법",
    "useP": "표는 아무도 행동하기 전의 순수한 세기로 핸드를 줄 세웁니다. 실제 테이블에서는 뒤에 행동할 플레이어가 많은 얼리 포지션에서는 핸드를 적게, 버튼과 컷오프에서는 더 많이 플레이하세요. 플레이하는 핸드로는 콜보다 레이즈를 하고, 표의 하위 핸드는 폴드하며, 핸드의 가치는 스택, 블라인드, 상대에 따라서도 달라진다는 것을 기억하세요. PokerTH 토너먼트에서는 블라인드가 계속 오르므로, 스택이 짧아질수록 플레이할 만한 핸드의 범위가 넓어집니다.",
    "faqH2": "질문",
    "faq": [
      [
        "텍사스 홀덤에서 가장 좋은 스타팅 핸드는 무엇인가요?",
        "포켓 에이스입니다. 무작위 핸드 하나를 상대로 {aa1} 이기며, 다른 모든 스타팅 핸드를 상대로 우위에 있습니다."
      ],
      [
        "에이스-킹이 퀸 페어보다 좋은가요?",
        "아니요, 하지만 근소한 차이입니다: 퀸 페어는 에이스-킹 오프수트를 상대로 {qqak} 이깁니다. 무작위 핸드 하나를 상대로는 에이스-킹 수티드가 {aks1}, 퀸 페어가 {qq1} 이깁니다."
      ],
      [
        "스타팅 핸드는 몇 개인가요?",
        "두 장 조합 {combos}가지로, 서로 다른 스타팅 핸드 169개가 됩니다: 페어 13개, 수티드 78개, 오프수트 78개."
      ],
      [
        "수티드 핸드는 얼마나 더 가치가 있나요?",
        "평균적으로 같은 핸드의 오프수트보다 승률이 약 {suitGain} 더 높습니다."
      ],
      [
        "스타팅 핸드 선택은 어디서 연습할 수 있나요?",
        "PokerTH의 연습 모드에서 컴퓨터 상대와 플레이하면 됩니다. 「확률」 탭이 카드가 열릴 때마다 이길 확률을 보여 줍니다."
      ]
    ]
  },
  ky: {
    "title": "Покер: баштапкы колдор таблицасы — 169 колдун рейтинги | PokerTH",
    "desc": "Texas Hold’em'деги 169 баштапкы кол таблицада, бир, үч жана алты атаандашка каршы утуу мүмкүнчүлүгү боюнча иреттелген. Бир масть же жок, жуптар, эң начар кол.",
    "ldHeadline": "Texas Hold’em баштапкы колдор таблицасы: бардык 169 колдун рейтинги",
    "ldDesc": "Texas Hold’em'деги 169 баштапкы кол таблицада, бир, үч жана алты кокустук колго каршы утуу мүмкүнчүлүгү боюнча иреттелген.",
    "h1": "Texas Hold’em'деги баштапкы колдор: бардык 169 кол, рейтинг боюнча",
    "lead": "Сиздин эки жеке картаңыз — ар бир колдогу биринчи чечим. Эки карта алуунун {combos} жолу бар, бирок масттарды эске албаганда 169 гана ар түрдүү баштапкы кол бар. Бул бет алардын баарын утуу мүмкүнчүлүгү менен таблицага чогултат; мүмкүнчүлүк ар бири үчүн миллион таратууну симуляциялоо аркылуу эсептелген.",
    "chartH2": "Баштапкы колдор таблицасы",
    "chartP": "Жуптар диагональ боюнча ылдый жайгашкан. Анын үстүндө бир масттагы колдор (s, эки карта тең бир масттан), астында ар башка масттагы колдор (o). T онду билдирет. Ар бир чарчыдагы сан — борддун беш картасы тең таратылганда колдун бир кокустук колго каршы утуу мүмкүнчүлүгү, тең чыгуу жарым утуш катары эсептелет; чарчы канчалык жашыл болсо, кол ошончолук күчтүү.",
    "topH2": "Эң мыкты баштапкы колдор",
    "topP": "Бир атаандашка каршы эң күчтүү жыйырма кол жана алар үч жана алты атаандашка каршы кандай туруштук берет:",
    "cols": [
      "Орун",
      "Кол",
      "1 атаандаш",
      "3 атаандаш",
      "6 атаандаш"
    ],
    "multiH2": "Атаандаштар көбөйсө, колдор башкача",
    "multiP": "Банкка оюнчулар кошулган сайын ар бир кол азыраак утат, бирок бирдей ылдамдыкта эмес, ошондуктан рейтинг өзгөрөт. Чөнтөктөгү туздар биринчи орунда калат: хедз-апта {aa1}, алты атаандашка каршы дагы эле {aa6}. Бир масттагы коннекторлор жогорулайт, анткени алар чоң банктарды утуучу стрит жана флеш түзөт: бир масттагы жети-алты хедз-апта {r76s1}-орундан алты атаандашка каршы {r76s6}-орунга көтөрүлөт, бир масттагы валет-он {rjts1}-орундан {rjts6}-орунга. Орточо жуптар төмөндөйт — жетилер {r77_1}-орундан {r77_6}-орунга түшөт — ошондой эле бир жогорку картасы жана начар кикери бар ар башка масттагы колдор да, мисалы ар башка масттагы король-алты, {rk6o1}-орундан {rk6o6}-орунга.",
    "suitedH2": "Бир масттабы же ар башка масттабы?",
    "suitedP": "Бир масттагы эки карта ошол эле карталардын ар башка масттагысынан баалуураак — бардык 78 маани жубу боюнча орто эсеп менен болжол менен {suitGain} көбүрөөк, колго жараша {suitMin} менен {suitMax} ортосунда. Мунун мааниси бар, бирок көрүнгөндөн азыраак: флеш сейрек чыгат, ал эми бир масттагы начар кол баары бир начар кол бойдон калат.",
    "worstH2": "Эң начар баштапкы кол",
    "worstP": "Бир кокустук колго каршы ар башка масттагы үч-эки баарынан алсыз, {w32} менен. Көп учурда покердеги эң начар кол деп аталган ар башка масттагы жети-эки {w72} утат жана хедз-апта 169 колдун ичинен {r72}-орунда турат — бирок алты атаандашка каршы ал эң акыркы, анткени анын эки картасы бирге стрит түзүү үчүн бири-биринен өтө алыс, ал эми башка нерсе менен көп утуу үчүн өтө төмөн.",
    "countH2": "Ар бир түрү канча жолу түшөт",
    "countP": "Мүмкүн болгон {combos} эки карталык колдун {pairCombos} — жуптар ({pairPct}), {suitedCombos} — бир масттагы ({suitedPct}) жана {offCombos} — ар башка масттагы ({offPct}). Ар бир жуп 6 жол менен, ар бир бир масттагы кол 4 жол менен, ар бир ар башка масттагы кол 12 жол менен түшүшү мүмкүн — ошондуктан ар башка масттагы туз-король бир масттагы туз-королго караганда үч эсе көп түшөт.",
    "useH2": "Мындай таблицаны кантип колдонуу керек",
    "useP": "Таблица колдорду эч ким аракет кыла элекке чейин, таза күчү боюнча иреттейт. Чыныгы үстөлдө эрте позициядан азыраак кол ойноңуз, ал жерде сизден кийин көп оюнчу аракет кылат, ал эми баттондон жана катоффтон көбүрөөк. Ойногон колдоруңуз менен Call кылгандан көрө Raise кылыңыз, таблицанын төмөнкү бөлүгүн Fold кылыңыз жана колдун баасы стектерге, блайнддарга жана атаандаштарыңызга да байланыштуу экенин унутпаңыз. PokerTH турниринде блайнддар тынымсыз өсөт, ошондуктан стектер кыскарган сайын ойноого татыктуу колдордун чөйрөсү кеңейет.",
    "faqH2": "Суроолор",
    "faq": [
      [
        "Texas Hold’em'деги эң мыкты баштапкы кол кайсы?",
        "Чөнтөктөгү туздар. Алар бир кокустук колго каршы {aa1} утат жана башка ар бир баштапкы колго каршы фаворит болушат."
      ],
      [
        "Туз-король дамалар жубунан жакшыбы?",
        "Жок, бирок айырма аз: дамалар ар башка масттагы туз-королго каршы {qqak} утат. Бир кокустук колго каршы бир масттагы туз-король {aks1}, ал эми дамалар {qq1} утат."
      ],
      [
        "Баштапкы колдор канча?",
        "{combos} эки карталык айкалыш, алар 169 ар түрдүү баштапкы колду түзөт: 13 жуп, 78 бир масттагы жана 78 ар башка масттагы."
      ],
      [
        "Бир масттагы кол канчалык баалуу?",
        "Орто эсеп менен, ошол эле ар башка масттагы колго караганда утуу мүмкүнчүлүгү болжол менен {suitGain} жогору."
      ],
      [
        "Баштапкы колдорду тандоону кайда машыктырсам болот?",
        "PokerTH'тин машыгуу режиминде компьютер атаандаштарына каршы; «Мүмкүнчүлүктөр» өтмөгү карталар ачылган сайын утуу мүмкүнчүлүгүңүздү көрсөтөт."
      ]
    ]
  },
  lt: {
    "title": "Pokerio pradinių rankų lentelė — 169 rankų reitingas | PokerTH",
    "desc": "Visos 169 Texas Hold’em pradinės rankos vienoje lentelėje pagal šansą laimėti prieš vieną, tris ir šešis varžovus. Tos pačios rūšies ar ne, poros ir blogiausia ranka.",
    "ldHeadline": "Texas Hold’em pradinių rankų lentelė: visos 169 rankos pagal stiprumą",
    "ldDesc": "169 Texas Hold’em pradinės rankos lentelėje, surikiuotos pagal šansą laimėti prieš vieną, tris ir šešias atsitiktines rankas.",
    "h1": "Texas Hold’em pradinės rankos: visos 169 pagal stiprumą",
    "lead": "Dvi jūsų uždaros kortos — pirmas sprendimas kiekvienoje rankoje. Dvi kortas galite gauti {combos} būdais, bet neatsižvelgiant į rūšis yra tik 169 skirtingos pradinės rankos. Šiame puslapyje jos visos pateiktos lentelėje su šansu laimėti, apskaičiuotu kiekvienai sumodeliavus milijoną išdalijimų.",
    "chartH2": "Pradinių rankų lentelė",
    "chartP": "Poros eina įstrižaine. Virš jos — tos pačios rūšies rankos (s, abi kortos tos pačios rūšies), po ja — skirtingų rūšių rankos (o). T reiškia dešimtuką. Skaičius kiekviename langelyje — šansas, kad ranka laimės prieš vieną atsitiktinę ranką, kai išdalijamos visos penkios bendrosios kortos; lygiosios skaičiuojamos kaip pusė pergalės. Kuo žalesnis langelis, tuo stipresnė ranka.",
    "topH2": "Geriausios pradinės rankos",
    "topP": "Dvidešimt stipriausių rankų prieš vieną varžovą ir kaip jos laikosi prieš tris ir šešis:",
    "cols": [
      "Vieta",
      "Ranka",
      "1 varžovas",
      "3 varžovai",
      "6 varžovai"
    ],
    "multiH2": "Daugiau varžovų — kitos rankos",
    "multiP": "Kiekviena ranka laimi rečiau, kai į banką įsitraukia daugiau žaidėjų, bet ne vienodai, todėl eiliškumas keičiasi. Tūzų pora rankoje lieka viršuje: {aa1} vienas prieš vieną ir vis dar {aa6} prieš šešis varžovus. Tos pačios rūšies gretimos kortos kyla aukštyn, nes surenka eiles ir spalvas, laiminčias didelius bankus: tos pačios rūšies septyni-šeši pakyla nuo {r76s1} vietos vienas prieš vieną iki {r76s6} vietos prieš šešis, tos pačios rūšies valetas-dešimtukas — nuo {rjts1} iki {rjts6}. Vidutinės poros krenta — septynetai nukrenta nuo {r77_1} iki {r77_6} vietos, — kaip ir skirtingų rūšių rankos su viena aukšta korta ir silpnu kikeriu, pavyzdžiui, skirtingų rūšių karalius-šeši: nuo {rk6o1} iki {rk6o6}.",
    "suitedH2": "Tos pačios rūšies ar skirtingų rūšių?",
    "suitedP": "Dvi tos pačios rūšies kortos vertos daugiau nei tos pačios kortos skirtingų rūšių — vidutiniškai maždaug {suitGain} daugiau per visas 78 verčių poras, nuo {suitMin} iki {suitMax}, priklausomai nuo rankos. Tai svarbu, bet mažiau, nei atrodo: spalvos retos, o silpna tos pačios rūšies ranka vis tiek lieka silpna ranka.",
    "worstH2": "Blogiausia pradinė ranka",
    "worstP": "Prieš vieną atsitiktinę ranką silpniausia iš visų yra skirtingų rūšių trys-du su {w32}. Skirtingų rūšių septyni-du, dažnai vadinama blogiausia pokerio ranka, laimi {w72} ir vienas prieš vieną užima {r72} vietą iš 169 — tačiau prieš šešis varžovus ji pati paskutinė, nes jos dvi kortos per toli viena nuo kitos, kad kartu sudarytų eilę, ir per žemos, kad laimėtų daug ką kita.",
    "countH2": "Kaip dažnai gaunate kiekvieno tipo ranką",
    "countP": "Iš {combos} galimų dviejų kortų rankų {pairCombos} yra poros ({pairPct}), {suitedCombos} — tos pačios rūšies ({suitedPct}), o {offCombos} — skirtingų rūšių ({offPct}). Kiekvieną porą galima gauti 6 būdais, kiekvieną tos pačios rūšies ranką — 4 būdais, kiekvieną skirtingų rūšių ranką — 12 būdų, todėl skirtingų rūšių tūzą-karalių gaunate tris kartus dažniau nei tos pačios rūšies tūzą-karalių.",
    "useH2": "Kaip naudotis tokia lentele",
    "useP": "Lentelė rikiuoja rankas pagal gryną stiprumą, kol dar niekas nepradėjo veikti. Prie tikro stalo žaiskite mažiau rankų iš ankstyvos pozicijos, kur po jūsų veikia daug žaidėjų, ir daugiau — nuo dalytojo mygtuko ir cut-off. Užuot atsakę, kelkite statymą su rankomis, kurias žaidžiate, numeskite lentelės apačios rankas ir atminkite, kad rankos vertė priklauso ir nuo žetonų kiekio, akliųjų statymų bei varžovų. PokerTH turnyre aklieji statymai vis kyla, tad žetonams senkant žaisti verta vis daugiau rankų.",
    "faqH2": "Klausimai",
    "faq": [
      [
        "Kokia geriausia pradinė ranka Texas Hold’em?",
        "Tūzų pora rankoje. Ji laimi {aa1} prieš vieną atsitiktinę ranką ir yra favoritė prieš bet kurią kitą pradinę ranką."
      ],
      [
        "Ar tūzas-karalius geriau nei damų pora?",
        "Ne, bet skirtumas nedidelis: damos laimi {qqak} prieš skirtingų rūšių tūzą-karalių. Prieš vieną atsitiktinę ranką tos pačios rūšies tūzas-karalius laimi {aks1}, o damos — {qq1}."
      ],
      [
        "Kiek yra pradinių rankų?",
        "{combos} dviejų kortų deriniai, sudarantys 169 skirtingas pradines rankas: 13 porų, 78 tos pačios rūšies ir 78 skirtingų rūšių."
      ],
      [
        "Kiek verta tos pačios rūšies ranka?",
        "Vidutiniškai maždaug {suitGain} didesnis šansas laimėti nei tokios pačios rankos skirtingų rūšių."
      ],
      [
        "Kur galiu treniruotis rinktis pradines rankas?",
        "PokerTH treniruotės režime prieš kompiuterio varžovus, kur kortelė „Tikimybės“ rodo jūsų šansą laimėti, kai atverčiamos kortos."
      ]
    ]
  },
  lv: {
    "title": "Pokera sākuma kārtis — visu 169 kombināciju reitings | PokerTH",
    "desc": "Visas 169 Texas Hold’em sākuma kombinācijas tabulā, sakārtotas pēc uzvaras iespējas pret vienu, trim un sešiem pretiniekiem. Vienā mastā vai ne, pāri, sliktākās kārtis.",
    "ldHeadline": "Texas Hold’em sākuma kāršu tabula: visas 169 kombinācijas pēc ranga",
    "ldDesc": "169 Texas Hold’em sākuma kombinācijas tabulā, sakārtotas pēc uzvaras iespējas pret vienu, trim un sešām nejaušām kombinācijām.",
    "h1": "Texas Hold’em sākuma kārtis: visas 169, sakārtotas pēc ranga",
    "lead": "Tavas divas slēptās kārtis ir pirmais lēmums katrā partijā. Divas kārtis var saņemt {combos} veidos, bet, ja neņem vērā mastus, ir tikai 169 dažādas sākuma kombinācijas. Šajā lapā tās visas ir tabulā ar uzvaras iespēju, kas aprēķināta, katrai kombinācijai simulējot miljonu izdalīšanu.",
    "chartH2": "Sākuma kāršu tabula",
    "chartP": "Pāri iet pa diagonāli. Virs tās ir kombinācijas vienā mastā (s, abas kārtis viena masta), zem tās — dažādos mastos (o). T nozīmē desmitnieku. Skaitlis katrā rūtiņā ir iespēja, ka kombinācija uzvar pret vienu nejaušu kombināciju, kad izdalītas visas piecas galda kārtis, neizšķirtu skaitot kā pusi uzvaras; jo zaļāka rūtiņa, jo stiprāka kombinācija.",
    "topH2": "Labākās sākuma kārtis",
    "topP": "Divdesmit stiprākās kombinācijas pret vienu pretinieku un kā tās turas pret trim un sešiem:",
    "cols": [
      "Vieta",
      "Kārtis",
      "1 pretinieks",
      "3 pretinieki",
      "6 pretinieki"
    ],
    "multiH2": "Vairāk pretinieku — citas kombinācijas",
    "multiP": "Katra kombinācija uzvar retāk, kad bankā iesaistās vairāk spēlētāju, bet ne vienādā tempā, tāpēc secība mainās. Dūžu pāris rokā paliek pirmajā vietā: {aa1} divatā un joprojām {aa6} pret sešiem pretiniekiem. Viena masta savienotāji kāpj augstāk, jo tie veido rindas un krāsas, kas laimē lielas bankas: septītnieks-sešinieks vienā mastā pakāpjas no {r76s1}. vietas divatā uz {r76s6}. vietu pret sešiem, kalps-desmitnieks vienā mastā — no {rjts1}. uz {rjts6}. vietu. Vidēji pāri krīt — septītnieku pāris no {r77_1}. vietas uz {r77_6}. vietu —, tāpat kā dažādu mastu kombinācijas ar vienu augstu kārti un vāju kikeru, piemēram, kungs-sešinieks dažādos mastos, no {rk6o1}. uz {rk6o6}. vietu.",
    "suitedH2": "Vienā mastā vai dažādos?",
    "suitedP": "Divas viena masta kārtis ir vērtīgākas nekā tās pašas kārtis dažādos mastos — vidēji par aptuveni {suitGain} visos 78 rangu pāros, atkarībā no kombinācijas no {suitMin} līdz {suitMax}. Tam ir nozīme, bet mazāka, nekā šķiet: krāsas ir retas, un vāja viena masta kombinācija joprojām ir vāja kombinācija.",
    "worstH2": "Sliktākās sākuma kārtis",
    "worstP": "Pret vienu nejaušu kombināciju trijnieks-divnieks dažādos mastos ir visvājākais ar {w32}. Septītnieks-divnieks dažādos mastos, ko bieži sauc par sliktāko kombināciju pokerā, uzvar {w72} un divatā ieņem {r72}. vietu no 169 — taču pret sešiem pretiniekiem tas ir pats pēdējais, jo abas tā kārtis ir pārāk tālu viena no otras, lai kopā veidotu rindu, un pārāk zemas, lai daudz ko citu laimētu.",
    "countH2": "Cik bieži tev izdala katru veidu",
    "countP": "No {combos} iespējamām divu kāršu kombinācijām {pairCombos} ir pāri ({pairPct}), {suitedCombos} — vienā mastā ({suitedPct}) un {offCombos} — dažādos mastos ({offPct}). Katru pāri var izdalīt 6 veidos, katru viena masta kombināciju 4 veidos, katru dažādu mastu kombināciju 12 veidos — tāpēc dūzi-kungu dažādos mastos tu redzi trīs reizes biežāk nekā dūzi-kungu vienā mastā.",
    "useH2": "Kā izmantot šādu tabulu",
    "useP": "Tabula sakārto kombinācijas pēc tīra spēka, pirms kāds ir rīkojies. Pie īsta galda spēlē mazāk kombināciju no agrīnas pozīcijas, kur pēc tevis rīkojas daudzi spēlētāji, un vairāk no dalītāja pogas un cutoff pozīcijas. Ar kombinācijām, ko spēlē, labāk paaugstini, nevis izlīdzini, atmet tabulas apakšējās kombinācijas un atceries, ka kombinācijas vērtība ir atkarīga arī no žetonu apjomiem, aklajām likmēm un taviem pretiniekiem. PokerTH turnīrā aklās likmes nepārtraukti aug, tāpēc, žetonu apjomiem sarūkot, spēlēšanas vērto kombināciju loks paplašinās.",
    "faqH2": "Jautājumi",
    "faq": [
      [
        "Kādas ir labākās sākuma kārtis Texas Hold’em?",
        "Dūžu pāris rokā. Tas uzvar {aa1} pret vienu nejaušu kombināciju un ir favorīts pret jebkurām citām sākuma kārtīm."
      ],
      [
        "Vai dūzis-kungs ir labāks par dāmu pāri?",
        "Nē, bet tuvu: dāmas uzvar {qqak} pret dūzi-kungu dažādos mastos. Pret vienu nejaušu kombināciju dūzis-kungs vienā mastā uzvar {aks1}, bet dāmas {qq1}."
      ],
      [
        "Cik ir sākuma kombināciju?",
        "{combos} divu kāršu kombinācijas, kas veido 169 dažādas sākuma kombinācijas: 13 pāri, 78 vienā mastā un 78 dažādos mastos."
      ],
      [
        "Cik vērtīgas ir viena masta kārtis?",
        "Vidēji par aptuveni {suitGain} lielāka uzvaras iespēja nekā tām pašām kārtīm dažādos mastos."
      ],
      [
        "Kur var trenēties sākuma kāršu izvēlē?",
        "PokerTH treniņa režīmā pret datora pretiniekiem, kur cilne Izredzes rāda tavu uzvaras iespēju, kārtīm atklājoties."
      ]
    ]
  },
  mk: {
    "title": "Табела на почетни раце — рангирање на сите 169 | PokerTH",
    "desc": "Сите 169 почетни раце во Texas Hold’em во табела, рангирани по шансата за победа против еден, тројца и шестмина противници. Иста боја или не, парови, најлошата рака.",
    "ldHeadline": "Табела на почетни раце во Texas Hold’em: сите 169 раце рангирани",
    "ldDesc": "169-те почетни раце во Texas Hold’em во табела, рангирани според шансата за победа против една, три и шест случајни раце.",
    "h1": "Почетни раце во Texas Hold’em: сите 169, рангирани",
    "lead": "Твоите две скриени карти се првата одлука во секоја рака. Постојат {combos} начини да добиеш две карти, но само 169 различни почетни раце ако не се гледаат боите. Оваа страница ги прикажува сите во табела со нивната шанса за победа, пресметана со симулација на милион делења за секоја.",
    "chartH2": "Табелата на почетни раце",
    "chartP": "Паровите се по дијагоналата. Над неа се рацете во иста боја (s, двете карти во иста боја), под неа рацете во различни бои (o). T значи десетка. Бројот во секое поле е шансата раката да победи против една случајна рака кога ќе се поделат сите пет карти на масата, при што нерешеното се брои како половина победа; колку е позелено полето, толку е посилна раката.",
    "topH2": "Најдобрите почетни раце",
    "topP": "Дваесетте најсилни раце против еден противник, и како се држат против тројца и шестмина:",
    "cols": [
      "Ранг",
      "Рака",
      "1 противник",
      "3 противници",
      "6 противници"
    ],
    "multiH2": "Повеќе противници, други раце",
    "multiP": "Секоја рака победува поретко како што во потот влегуваат повеќе играчи, но не со иста брзина, па рангирањето се менува. Пар аси останува на врвот: {aa1} еден на еден, сè уште {aa6} против шестмина противници. Последователните карти во иста боја се искачуваат, бидејќи прават стритови и флашеви што добиваат големи потови: седум-шест во иста боја оди од место {r76s1} еден на еден до место {r76s6} против шестмина, џандар-десет во иста боја од {rjts1} до {rjts6}. Средните парови паѓаат — седумките паѓаат од место {r77_1} на {r77_6} — а исто и рацете во различни бои со една висока карта и слаб кикер, како крал-шест во различни бои, од {rk6o1} на {rk6o6}.",
    "suitedH2": "Иста боја или различни бои?",
    "suitedP": "Две карти во иста боја вредат повеќе од истите карти во различни бои — во просек околу {suitGain} повеќе низ сите 78 комбинации од две вредности, од {suitMin} до {suitMax} зависно од раката. Тоа е важно, но помалку отколку што изгледа: флашевите се ретки, а слаба рака во иста боја е сепак слаба рака.",
    "worstH2": "Најлошата почетна рака",
    "worstP": "Против една случајна рака, три-два во различни бои е најслабата од сите со {w32}. Седум-два во различни бои, често нарекувана најлошата рака во покерот, победува во {w72} и е на место {r72} од 169 еден на еден — но против шестмина противници е последна, бидејќи нејзините две карти се премногу оддалечени за заедно да направат стрит и премногу ниски за да добијат многу друго.",
    "countH2": "Колку често ти се паѓа секој вид",
    "countP": "Од {combos} можни раце од две карти, {pairCombos} се парови ({pairPct}), {suitedCombos} се во иста боја ({suitedPct}), а {offCombos} во различни бои ({offPct}). Секој пар може да се подели на 6 начини, секоја рака во иста боја на 4 начини, секоја рака во различни бои на 12 начини — затоа ас-крал во различни бои го гледаш трипати почесто од ас-крал во иста боја.",
    "useH2": "Како да користиш ваква табела",
    "useP": "Табелата ги рангира рацете според чистата јачина, пред некој да одиграл. На вистинска маса играј помалку раце од рана позиција, каде што многу играчи играат по тебе, а повеќе од копчето и кат-офот. Со рацете што ги играш подобро зголемувај отколку да плаќаш, фрлај ги рацете од дното на табелата и запомни дека вредноста на раката зависи и од стековите, блајндовите и твоите противници. На турнир во PokerTH блајндовите постојано растат, па кругот на раце вредни за играње се шири кога стековите се намалуваат.",
    "faqH2": "Прашања",
    "faq": [
      [
        "Која е најдобрата почетна рака во Texas Hold’em?",
        "Пар аси. Победуваат во {aa1} против една случајна рака и се фаворит против секоја друга почетна рака."
      ],
      [
        "Дали ас-крал е подобар од пар дами?",
        "Не, но е блиску: дамите победуваат во {qqak} против ас-крал во различни бои. Против една случајна рака ас-крал во иста боја победува во {aks1}, а дамите во {qq1}."
      ],
      [
        "Колку почетни раце има?",
        "{combos} комбинации од две карти, што даваат 169 различни почетни раце: 13 парови, 78 во иста боја и 78 во различни бои."
      ],
      [
        "Колку вреди рака во иста боја?",
        "Во просек околу {suitGain} повеќе шанса за победа од истата рака во различни бои."
      ],
      [
        "Каде можам да вежбам избор на почетни раце?",
        "Во режимот за тренинг на PokerTH против компјутерски противници, со јазичето Изгледи што ја покажува твојата шанса за победа додека излегуваат картите."
      ]
    ]
  },
  ml: {
    "title": "പോക്കർ സ്റ്റാർട്ടിംഗ് ഹാൻഡ് ചാർട്ട് — 169 ഹാൻഡ് റാങ്കിംഗ് | PokerTH",
    "desc": "Texas Hold’em-ലെ 169 സ്റ്റാർട്ടിംഗ് ഹാൻഡുകളും ഒരു ചാർട്ടിൽ, 1, 3, 6 എതിരാളികൾക്കെതിരായ ജയസാധ്യത പ്രകാരം. സ്യൂട്ടഡോ ഓഫ്സ്യൂട്ടോ, ജോടികൾ, ഏറ്റവും മോശം ഹാൻഡ്.",
    "ldHeadline": "Texas Hold’em സ്റ്റാർട്ടിംഗ് ഹാൻഡ് ചാർട്ട്: 169 ഹാൻഡുകളുടെയും റാങ്കിംഗ്",
    "ldDesc": "Texas Hold’em-ലെ 169 സ്റ്റാർട്ടിംഗ് ഹാൻഡുകൾ, ഒന്നും മൂന്നും ആറും റാൻഡം ഹാൻഡുകൾക്കെതിരെ ജയിക്കാനുള്ള സാധ്യത അനുസരിച്ച് ചാർട്ടിലാക്കി റാങ്ക് ചെയ്തത്.",
    "h1": "Texas Hold’em സ്റ്റാർട്ടിംഗ് ഹാൻഡുകൾ: 169-ഉം റാങ്ക് അനുസരിച്ച്",
    "lead": "നിങ്ങളുടെ രണ്ട് ഹോൾ കാർഡുകളാണ് ഓരോ ഹാൻഡിലെയും ആദ്യ തീരുമാനം. രണ്ട് കാർഡുകൾ കിട്ടാൻ {combos} വഴികളുണ്ട്, എന്നാൽ സ്യൂട്ടുകൾ മാറ്റിവെച്ചാൽ വ്യത്യസ്ത സ്റ്റാർട്ടിംഗ് ഹാൻഡുകൾ 169 മാത്രം. ഈ പേജ് അവയെല്ലാം ജയസാധ്യത സഹിതം ചാർട്ടിൽ കാണിക്കുന്നു; ഓരോന്നിനും പത്ത് ലക്ഷം ഡീലുകൾ സിമുലേറ്റ് ചെയ്താണ് ഇത് കണക്കാക്കിയത്.",
    "chartH2": "സ്റ്റാർട്ടിംഗ് ഹാൻഡ് ചാർട്ട്",
    "chartP": "ജോടികൾ കോണോടുകോൺ (ഡയഗണൽ) വരിയിലാണ്. അതിനു മുകളിൽ സ്യൂട്ടഡ് ഹാൻഡുകൾ (s, രണ്ട് കാർഡും ഒരേ സ്യൂട്ട്), താഴെ ഓഫ്സ്യൂട്ട് ഹാൻഡുകൾ (o). T എന്നാൽ പത്ത് (ടെൻ). ഓരോ കളത്തിലെയും സംഖ്യ, ബോർഡിലെ അഞ്ച് കാർഡുകളും വിതരണം ചെയ്യുമ്പോൾ ആ ഹാൻഡ് ഒരു റാൻഡം ഹാൻഡിനെതിരെ ജയിക്കാനുള്ള സാധ്യതയാണ്, സമനില പകുതി ജയമായി കണക്കാക്കി; കളം എത്ര പച്ചയാണോ, ഹാൻഡ് അത്ര ശക്തമാണ്.",
    "topH2": "ഏറ്റവും മികച്ച സ്റ്റാർട്ടിംഗ് ഹാൻഡുകൾ",
    "topP": "ഒരു എതിരാളിക്കെതിരെ ഏറ്റവും ശക്തമായ ഇരുപത് ഹാൻഡുകൾ, മൂന്നും ആറും എതിരാളികൾക്കെതിരെ അവ എങ്ങനെ പിടിച്ചുനിൽക്കുന്നു എന്നതും:",
    "cols": [
      "റാങ്ക്",
      "ഹാൻഡ്",
      "1 എതിരാളി",
      "3 എതിരാളികൾ",
      "6 എതിരാളികൾ"
    ],
    "multiH2": "കൂടുതൽ എതിരാളികൾ, വ്യത്യസ്ത ഹാൻഡുകൾ",
    "multiP": "കളിക്കാർ പോട്ടിൽ ചേരുന്തോറും എല്ലാ ഹാൻഡുകളും കുറച്ചേ ജയിക്കൂ, പക്ഷേ ഒരേ നിരക്കിലല്ല, അതിനാൽ റാങ്കിംഗ് മാറുന്നു. പോക്കറ്റ് ഏസുകൾ മുകളിൽ തന്നെ: ഹെഡ്സ്-അപ്പിൽ {aa1}, ആറ് എതിരാളികൾക്കെതിരെയും {aa6}. സ്യൂട്ടഡ് കണക്ടറുകൾ മുകളിലേക്ക് കയറുന്നു, കാരണം അവ വലിയ പോട്ടുകൾ ജയിക്കുന്ന Straight-ഉം Flush-ഉം ഉണ്ടാക്കുന്നു: സ്യൂട്ടഡ് സെവൻ-സിക്സ് ഹെഡ്സ്-അപ്പിലെ {r76s1}-ാം റാങ്കിൽ നിന്ന് ആറുപേർക്കെതിരെ {r76s6}-ാം റാങ്കിലേക്ക്, സ്യൂട്ടഡ് ജാക്ക്-ടെൻ {rjts1}-ൽ നിന്ന് {rjts6}-ലേക്ക്. ഇടത്തരം ജോടികൾ താഴേക്ക് പോകുന്നു — സെവൻസ് {r77_1}-ാം റാങ്കിൽ നിന്ന് {r77_6}-ലേക്ക് വീഴുന്നു — ഒരു ഉയർന്ന കാർഡും ദുർബലമായ കിക്കറുമുള്ള ഓഫ്സ്യൂട്ട് ഹാൻഡുകളും അങ്ങനെതന്നെ, ഉദാഹരണത്തിന് ഓഫ്സ്യൂട്ട് കിംഗ്-സിക്സ്, {rk6o1}-ൽ നിന്ന് {rk6o6}-ലേക്ക്.",
    "suitedH2": "സ്യൂട്ടഡോ ഓഫ്സ്യൂട്ടോ?",
    "suitedP": "ഒരേ സ്യൂട്ടിലുള്ള രണ്ട് കാർഡുകൾക്ക് അതേ കാർഡുകൾ ഓഫ്സ്യൂട്ട് ആകുന്നതിനേക്കാൾ മൂല്യമുണ്ട് — രണ്ട് വ്യത്യസ്ത റാങ്കുകളുടെ 78 കൂട്ടുകളിലും ശരാശരി ഏകദേശം {suitGain} കൂടുതൽ, ഹാൻഡ് അനുസരിച്ച് {suitMin} മുതൽ {suitMax} വരെ. അത് പ്രധാനമാണ്, പക്ഷേ തോന്നുന്നത്ര ഇല്ല: Flush അപൂർവമാണ്, ദുർബലമായ സ്യൂട്ടഡ് ഹാൻഡ് അപ്പോഴും ദുർബലമായ ഹാൻഡ് തന്നെ.",
    "worstH2": "ഏറ്റവും മോശം സ്റ്റാർട്ടിംഗ് ഹാൻഡ്",
    "worstP": "ഒരു റാൻഡം ഹാൻഡിനെതിരെ, ഓഫ്സ്യൂട്ട് ത്രീ-ടൂ ആണ് ഏറ്റവും ദുർബലം: {w32}. പോക്കറിലെ ഏറ്റവും മോശം ഹാൻഡ് എന്ന് പലപ്പോഴും വിളിക്കുന്ന ഓഫ്സ്യൂട്ട് സെവൻ-ടൂ {w72} ജയിക്കുന്നു, ഹെഡ്സ്-അപ്പിൽ 169-ൽ {r72}-ാം റാങ്കിലാണ് — പക്ഷേ ആറ് എതിരാളികൾക്കെതിരെ അത് ഏറ്റവും അവസാനമാണ്, കാരണം അതിന്റെ രണ്ട് കാർഡുകളും ഒരുമിച്ച് Straight ഉണ്ടാക്കാൻ കഴിയാത്തത്ര അകലെയാണ്, മറ്റെന്തെങ്കിലും ജയിക്കാൻ കഴിയാത്തത്ര താഴ്ന്നതും.",
    "countH2": "ഓരോ തരവും എത്ര തവണ കിട്ടും",
    "countP": "സാധ്യമായ {combos} രണ്ട്-കാർഡ് ഹാൻഡുകളിൽ {pairCombos} ജോടികളാണ് ({pairPct}), {suitedCombos} സ്യൂട്ടഡ് ({suitedPct}), {offCombos} ഓഫ്സ്യൂട്ട് ({offPct}). ഓരോ ജോടിയും 6 വിധത്തിൽ കിട്ടാം, ഓരോ സ്യൂട്ടഡ് ഹാൻഡും 4 വിധത്തിൽ, ഓരോ ഓഫ്സ്യൂട്ട് ഹാൻഡും 12 വിധത്തിൽ — അതുകൊണ്ടാണ് സ്യൂട്ടഡ് ഏസ്-കിംഗിനേക്കാൾ മൂന്നിരട്ടി തവണ ഓഫ്സ്യൂട്ട് ഏസ്-കിംഗ് നിങ്ങൾ കാണുന്നത്.",
    "useH2": "ഇത്തരമൊരു ചാർട്ട് എങ്ങനെ ഉപയോഗിക്കാം",
    "useP": "ആരും ഒന്നും ചെയ്യുന്നതിന് മുമ്പുള്ള അടിസ്ഥാന ശക്തി അനുസരിച്ചാണ് ചാർട്ട് ഹാൻഡുകളെ റാങ്ക് ചെയ്യുന്നത്. യഥാർത്ഥ ടേബിളിൽ, നിങ്ങൾക്ക് ശേഷം ഒരുപാട് കളിക്കാർ കളിക്കുന്ന നേരത്തെയുള്ള പൊസിഷനിൽ നിന്ന് കുറച്ച് ഹാൻഡുകളും, ബട്ടണിൽ നിന്നും കട്ട്-ഓഫിൽ നിന്നും കൂടുതലും കളിക്കുക. നിങ്ങൾ കളിക്കുന്ന ഹാൻഡുകളിൽ Call ചെയ്യുന്നതിനു പകരം Raise ചെയ്യുക, ചാർട്ടിന്റെ താഴെയുള്ളവ Fold ചെയ്യുക, ഒരു ഹാൻഡിന്റെ മൂല്യം സ്റ്റാക്കുകളെയും ബ്ലൈൻഡുകളെയും എതിരാളികളെയും കൂടി ആശ്രയിച്ചിരിക്കുന്നു എന്ന് ഓർക്കുക. PokerTH ടൂർണമെന്റിൽ ബ്ലൈൻഡുകൾ കൂടിക്കൊണ്ടേയിരിക്കും, അതിനാൽ സ്റ്റാക്കുകൾ ചുരുങ്ങുമ്പോൾ കളിക്കാൻ കൊള്ളാവുന്ന ഹാൻഡുകളുടെ എണ്ണം കൂടുന്നു.",
    "faqH2": "ചോദ്യങ്ങൾ",
    "faq": [
      [
        "Texas Hold’em-ലെ ഏറ്റവും മികച്ച സ്റ്റാർട്ടിംഗ് ഹാൻഡ് ഏതാണ്?",
        "പോക്കറ്റ് ഏസുകൾ. ഒരു റാൻഡം ഹാൻഡിനെതിരെ അവ {aa1} ജയിക്കും, മറ്റെല്ലാ സ്റ്റാർട്ടിംഗ് ഹാൻഡുകൾക്കെതിരെയും അവ തന്നെയാണ് ഫേവറിറ്റ്."
      ],
      [
        "ഏസ്-കിംഗ് ക്വീനുകളുടെ ജോടിയേക്കാൾ നല്ലതാണോ?",
        "അല്ല, പക്ഷേ വ്യത്യാസം ചെറുതാണ്: ഓഫ്സ്യൂട്ട് ഏസ്-കിംഗിനെതിരെ ക്വീനുകൾ {qqak} ജയിക്കും. ഒരു റാൻഡം ഹാൻഡിനെതിരെ സ്യൂട്ടഡ് ഏസ്-കിംഗ് {aks1} ജയിക്കും, ക്വീനുകൾ {qq1}."
      ],
      [
        "എത്ര സ്റ്റാർട്ടിംഗ് ഹാൻഡുകളുണ്ട്?",
        "{combos} രണ്ട്-കാർഡ് കോമ്പിനേഷനുകൾ, അവ 169 വ്യത്യസ്ത സ്റ്റാർട്ടിംഗ് ഹാൻഡുകളാകുന്നു: 13 ജോടികൾ, 78 സ്യൂട്ടഡ്, 78 ഓഫ്സ്യൂട്ട്."
      ],
      [
        "ഒരു സ്യൂട്ടഡ് ഹാൻഡിന് എത്ര മൂല്യം കൂടുതലാണ്?",
        "ശരാശരി, അതേ ഹാൻഡ് ഓഫ്സ്യൂട്ട് ആകുന്നതിനേക്കാൾ ഏകദേശം {suitGain} കൂടുതൽ ജയസാധ്യത."
      ],
      [
        "സ്റ്റാർട്ടിംഗ് ഹാൻഡ് തിരഞ്ഞെടുപ്പ് എവിടെ പരിശീലിക്കാം?",
        "PokerTH-ന്റെ പരിശീലന മോഡിൽ കമ്പ്യൂട്ടർ എതിരാളികൾക്കെതിരെ; കാർഡുകൾ വരുന്തോറും ഓഡ്സ് ടാബ് നിങ്ങളുടെ ജയസാധ്യത കാണിക്കും."
      ]
    ]
  },
  mn: {
    "title": "Покерын эхлэлийн гарын хүснэгт — 169 гарын эрэмбэ | PokerTH",
    "desc": "Texas Hold’em-ийн 169 эхлэлийн гарыг нэг хүснэгтэд, нэг, гурав, зургаан өрсөлдөгчийн эсрэг хожих магадлалаар нь эрэмбэлсэн. Нэг зүстэй эсэх, хосууд, хамгийн муу гар.",
    "ldHeadline": "Texas Hold’em-ийн эхлэлийн гарын хүснэгт: бүх 169 гарын эрэмбэ",
    "ldDesc": "Texas Hold’em-ийн 169 эхлэлийн гарыг хүснэгтэд, нэг, гурав, зургаан санамсаргүй гарын эсрэг хожих магадлалаар нь эрэмбэлсэн.",
    "h1": "Texas Hold’em-ийн эхлэлийн гар: бүх 169-ийн эрэмбэ",
    "lead": "Таны хоёр хувийн хөзөр бол гар бүрийн анхны шийдвэр. Хоёр хөзөр авах {combos} арга байдаг ч зүсийг тооцохгүй бол ердөө 169 өөр эхлэлийн гар бий. Энэ хуудас бүгдийг нь хожих магадлалын хамт хүснэгтэд харуулна; магадлалыг гар тус бүрд нэг сая тараалтыг симуляцилж тооцоолсон.",
    "chartH2": "Эхлэлийн гарын хүснэгт",
    "chartP": "Хосууд диагоналийн дагуу байрлана. Түүний дээд талд нэг зүстэй гарууд (s, хоёр хөзөр хоёулаа нэг зүстэй), доод талд өөр зүстэй гарууд (o). T нь арав гэсэн үг. Нүд бүрийн тоо нь бордын таван хөзрийг бүгдийг нь тараасан үед тухайн гар нэг санамсаргүй гарыг хожих магадлал бөгөөд тэнцээг хагас хожлоор тооцно; нүд хэдий чинээ ногоон байна, гар төдий чинээ хүчтэй.",
    "topH2": "Хамгийн сайн эхлэлийн гарууд",
    "topP": "Нэг өрсөлдөгчийн эсрэг хамгийн хүчтэй хорин гар болон тэдгээр гурав, зургаан өрсөлдөгчийн эсрэг хэр тэсдэг нь:",
    "cols": [
      "Байр",
      "Гар",
      "1 өрсөлдөгч",
      "3 өрсөлдөгч",
      "6 өрсөлдөгч"
    ],
    "multiH2": "Өрсөлдөгч олон байх тусам өөр гар",
    "multiP": "Банкинд тоглогч нэмэгдэх тусам гар бүр бага хожих боловч ижил хурдаар биш, тиймээс эрэмбэ өөрчлөгдөнө. Халаасны AA тэргүүн хэвээр: хедз-ап үед {aa1}, зургаан өрсөлдөгчийн эсрэг ч {aa6} хэвээр. Нэг зүстэй коннекторууд дээшилдэг, учир нь том банк хождог стрейт, флэш бүрдүүлдэг: нэг зүстэй 7-6 хедз-ап үеийн {r76s1}-р байраас зургаан өрсөлдөгчийн эсрэг {r76s6}-р байр руу, нэг зүстэй J-10 {rjts1}-р байраас {rjts6}-р байр руу дэвшинэ. Дунд хосууд унана — 77 {r77_1}-р байраас {r77_6}-р байр руу — мөн нэг өндөр хөзөртэй, сул кикертэй өөр зүстэй гарууд, жишээ нь өөр зүстэй K-6, {rk6o1}-р байраас {rk6o6}-р байр руу унана.",
    "suitedH2": "Нэг зүстэй юу, өөр зүстэй юу?",
    "suitedP": "Нэг зүстэй хоёр хөзөр нь ижил хөзрүүд өөр зүстэй байхаас илүү үнэтэй — хоёр өөр зэрэглэлийн бүх 78 хослолоор дунджаар {suitGain} орчим илүү, гараас хамаарч хамгийн багадаа {suitMin}, хамгийн ихдээ {suitMax}. Энэ чухал, гэхдээ харагдаж байгаагаас бага: флэш ховор, сул нэг зүстэй гар сул гар хэвээрээ.",
    "worstH2": "Хамгийн муу эхлэлийн гар",
    "worstP": "Нэг санамсаргүй гарын эсрэг өөр зүстэй 3-2 бүхнээс хамгийн сул нь, {w32}. Покерын хамгийн муу гар гэж ихэвчлэн нэрлэгддэг өөр зүстэй 7-2 {w72} хожиж, хедз-ап үед 169 гараас {r72}-р байрт ордог — харин зургаан өрсөлдөгчийн эсрэг яг хамгийн сүүлд, учир нь хоёр хөзөр нь хамтдаа стрейт бүрдүүлэхэд хэт хол, өөр зүйлээр их хожиход хэт бага.",
    "countH2": "Төрөл бүр танд хэр олон удаа ирдэг вэ",
    "countP": "Боломжит {combos} хоёр хөзрийн гараас {pairCombos} нь хос ({pairPct}), {suitedCombos} нь нэг зүстэй ({suitedPct}), {offCombos} нь өөр зүстэй ({offPct}). Хос бүр 6 янзаар, нэг зүстэй гар бүр 4 янзаар, өөр зүстэй гар бүр 12 янзаар ирж болно — тиймээс өөр зүстэй A-K нэг зүстэй A-K-аас гурав дахин олон таардаг.",
    "useH2": "Ийм хүснэгтийг хэрхэн ашиглах вэ",
    "useP": "Хүснэгт гаруудыг хэн ч үйлдэл хийхээс өмнөх цэвэр хүчээр нь эрэмбэлдэг. Жинхэнэ ширээнд олон тоглогч таны дараа үйлдэл хийдэг эрт байрлалаас цөөн гар, баттон болон кат-офф байрлалаас илүү олон гар тоглоорой. Тоглох гаруудаараа Call хийхийн оронд Raise хийж, хүснэгтийн доод хэсгийн гаруудыг Fold хийж, гарын үнэ цэнэ нь стек, блайнд болон өрсөлдөгчдөөс тань ч хамаардгийг санаарай. PokerTH-ийн тэмцээнд блайнд байнга өсдөг тул стек богиносох тусам тоглох нь зүйтэй гарын хүрээ өргөсдөг.",
    "faqH2": "Асуултууд",
    "faq": [
      [
        "Texas Hold’em-ийн хамгийн сайн эхлэлийн гар юу вэ?",
        "Халаасны AA. Нэг санамсаргүй гарын эсрэг {aa1} хождог бөгөөд бусад бүх эхлэлийн гарын эсрэг фаворит байдаг."
      ],
      [
        "A-K нь QQ хосоос илүү юү?",
        "Үгүй, гэхдээ ойрхон: QQ нь өөр зүстэй A-K-гийн эсрэг {qqak} хожно. Нэг санамсаргүй гарын эсрэг нэг зүстэй A-K {aks1}, QQ {qq1} хожно."
      ],
      [
        "Хэдэн эхлэлийн гар байдаг вэ?",
        "Хоёр хөзрийн {combos} хослол бөгөөд эдгээр нь 169 өөр эхлэлийн гар үүсгэнэ: 13 хос, 78 нэг зүстэй, 78 өөр зүстэй."
      ],
      [
        "Нэг зүстэй гар хэр үнэтэй вэ?",
        "Дунджаар ижил гар өөр зүстэй байхаас {suitGain} орчим илүү хожих магадлалтай."
      ],
      [
        "Эхлэлийн гар сонголтыг хаана дадлагажуулж болох вэ?",
        "PokerTH-ийн дадлагын горимд компьютерийн өрсөлдөгчдийн эсрэг; хөзөр нээгдэх тусам «Боломж» таб таны хожих магадлалыг харуулна."
      ]
    ]
  },
  mr: {
    "title": "पोकर सुरुवातीचे हँड्स चार्ट — सर्व 169 हँड्सची क्रमवारी | PokerTH",
    "desc": "Texas Hold’em चे सर्व 169 सुरुवातीचे हँड्स एका चार्टमध्ये, 1, 3 व 6 प्रतिस्पर्ध्यांविरुद्ध जिंकण्याच्या शक्यतेनुसार क्रमवार. सूटेड की ऑफसूट, जोड्या आणि सर्वात वाईट हँड.",
    "ldHeadline": "Texas Hold’em सुरुवातीच्या हँड्सचा चार्ट: सर्व 169 हँड्सची क्रमवारी",
    "ldDesc": "Texas Hold’em चे 169 सुरुवातीचे हँड्स, एक, तीन आणि सहा यादृच्छिक हँड्सविरुद्ध जिंकण्याच्या शक्यतेनुसार चार्टमध्ये क्रमवार मांडलेले.",
    "h1": "Texas Hold’em सुरुवातीचे हँड्स: सर्व 169, क्रमवार",
    "lead": "तुमची दोन होल कार्ड्स हा प्रत्येक हँडमधला पहिला निर्णय असतो. दोन कार्ड्स मिळण्याचे {combos} प्रकार आहेत, पण सूट्स बाजूला ठेवले तर फक्त 169 वेगवेगळे सुरुवातीचे हँड्स उरतात. हे पान त्या सर्वांना त्यांच्या जिंकण्याच्या शक्यतेसह चार्टमध्ये दाखवतं; प्रत्येकासाठी दहा लाख डील्सचं सिम्युलेशन करून ती मोजली आहे.",
    "chartH2": "सुरुवातीच्या हँड्सचा चार्ट",
    "chartP": "जोड्या कर्णरेषेवर आहेत. तिच्या वर सूटेड हँड्स (s, दोन्ही कार्ड्स एकाच सूटची), खाली ऑफसूट हँड्स (o). T म्हणजे दहा. प्रत्येक चौकोनातला आकडा म्हणजे बोर्डची पाचही कार्ड्स वाटल्यावर तो हँड एका यादृच्छिक हँडविरुद्ध जिंकण्याची शक्यता; टाय अर्धा विजय म्हणून मोजला आहे. चौकोन जितका हिरवा, तितका हँड मजबूत.",
    "topH2": "सर्वोत्तम सुरुवातीचे हँड्स",
    "topP": "एका प्रतिस्पर्ध्याविरुद्ध सर्वात मजबूत वीस हँड्स, आणि तीन व सहा प्रतिस्पर्ध्यांविरुद्ध ते कसे टिकतात:",
    "cols": [
      "क्रमांक",
      "हँड",
      "1 प्रतिस्पर्धी",
      "3 प्रतिस्पर्धी",
      "6 प्रतिस्पर्धी"
    ],
    "multiH2": "जास्त प्रतिस्पर्धी, वेगळे हँड्स",
    "multiP": "पॉटमध्ये खेळाडू वाढतात तसा प्रत्येक हँड कमी वेळा जिंकतो, पण सगळे एकाच वेगाने नाही, त्यामुळे क्रमवारी बदलते. पॉकेट एक्के सर्वात वरच राहतात: हेड्स-अपमध्ये {aa1}, सहा प्रतिस्पर्ध्यांविरुद्धही {aa6}. सूटेड कनेक्टर्स वर चढतात, कारण ते मोठे पॉट्स जिंकणारे स्ट्रेट आणि फ्लश बनवतात: सूटेड सेव्हन-सिक्स हेड्स-अपमधल्या {r76s1} व्या क्रमांकावरून सहा प्रतिस्पर्ध्यांविरुद्ध {r76s6} व्या क्रमांकावर जातो, सूटेड जॅक-टेन {rjts1} वरून {rjts6} वर. मध्यम जोड्या खाली येतात — सेव्हन्सची जोडी {r77_1} व्या क्रमांकावरून {r77_6} व्या क्रमांकावर घसरते — आणि एक मोठं कार्ड व कमकुवत किकर असलेले ऑफसूट हँड्सही, उदा. ऑफसूट किंग-सिक्स, {rk6o1} वरून {rk6o6} वर.",
    "suitedH2": "सूटेड की ऑफसूट?",
    "suitedP": "एकाच सूटची दोन कार्ड्स तीच कार्ड्स ऑफसूट असण्यापेक्षा जास्त मोलाची असतात — सर्व 78 रँक-जोड्यांमध्ये सरासरी सुमारे {suitGain} जास्त, हँडनुसार {suitMin} ते {suitMax}. याचा फरक पडतो, पण वाटतो तितका नाही: फ्लश क्वचितच लागतो, आणि कमकुवत सूटेड हँड तरीही कमकुवत हँडच असतो.",
    "worstH2": "सर्वात वाईट सुरुवातीचा हँड",
    "worstP": "एका यादृच्छिक हँडविरुद्ध ऑफसूट थ्री-टू {w32} सह सर्वांत कमकुवत आहे. पोकरमधला सर्वात वाईट हँड म्हणून अनेकदा ओळखला जाणारा ऑफसूट सेव्हन-टू {w72} जिंकतो आणि हेड्स-अपमध्ये 169 पैकी {r72} व्या क्रमांकावर आहे — पण सहा प्रतिस्पर्ध्यांविरुद्ध तो अगदी शेवटचा आहे, कारण त्याची दोन कार्ड्स एकत्र स्ट्रेट बनवण्यासाठी एकमेकांपासून खूप दूर आहेत आणि दुसरं काही फारसं जिंकण्यासाठी खूप लहान आहेत.",
    "countH2": "प्रत्येक प्रकार तुम्हाला किती वेळा मिळतो",
    "countP": "शक्य असलेल्या {combos} दोन-कार्ड हँड्सपैकी {pairCombos} जोड्या आहेत ({pairPct}), {suitedCombos} सूटेड ({suitedPct}) आणि {offCombos} ऑफसूट ({offPct}). प्रत्येक जोडी 6 प्रकारे, प्रत्येक सूटेड हँड 4 प्रकारे आणि प्रत्येक ऑफसूट हँड 12 प्रकारे मिळू शकतो — म्हणूनच ऑफसूट एक्का-किंग सूटेड एक्का-किंगपेक्षा तिप्पट वेळा येतो.",
    "useH2": "असा चार्ट कसा वापरायचा",
    "useP": "चार्ट कोणीही काही खेळण्याआधीच्या मूळ ताकदीनुसार हँड्सची क्रमवारी लावतो. खऱ्या टेबलवर, जिथे तुमच्यानंतर बरेच खेळाडू खेळतात त्या सुरुवातीच्या पोझिशनमधून कमी हँड्स खेळा, आणि बटण व कट-ऑफवरून जास्त. तुम्ही खेळता त्या हँड्ससोबत Call ऐवजी Raise करा, चार्टच्या तळाचे हँड्स Fold करा, आणि लक्षात ठेवा की हँडचं मूल्य स्टॅक्स, ब्लाइंड्स आणि तुमच्या प्रतिस्पर्ध्यांवरही अवलंबून असतं. PokerTH टूर्नामेंटमध्ये ब्लाइंड्स सतत वाढत राहतात, त्यामुळे स्टॅक्स लहान होतात तसतशी खेळण्यालायक हँड्सची व्याप्ती वाढते.",
    "faqH2": "प्रश्न",
    "faq": [
      [
        "Texas Hold’em मधला सर्वोत्तम सुरुवातीचा हँड कोणता?",
        "पॉकेट एक्के. ते एका यादृच्छिक हँडविरुद्ध {aa1} जिंकतात, आणि इतर प्रत्येक सुरुवातीच्या हँडविरुद्ध त्यांचं पारडं जड असतं."
      ],
      [
        "एक्का-किंग क्वीन्सच्या जोडीपेक्षा चांगला आहे का?",
        "नाही, पण फरक थोडाच आहे: ऑफसूट एक्का-किंगविरुद्ध क्वीन्स {qqak} जिंकतात. एका यादृच्छिक हँडविरुद्ध सूटेड एक्का-किंग {aks1} आणि क्वीन्स {qq1} जिंकतात."
      ],
      [
        "एकूण किती सुरुवातीचे हँड्स आहेत?",
        "{combos} दोन-कार्ड कॉम्बिनेशन्स, ज्यांपासून 169 वेगवेगळे सुरुवातीचे हँड्स बनतात: 13 जोड्या, 78 सूटेड आणि 78 ऑफसूट."
      ],
      [
        "सूटेड हँडचं मोल किती जास्त असतं?",
        "सरासरी, तोच हँड ऑफसूट असण्यापेक्षा जिंकण्याची सुमारे {suitGain} जास्त शक्यता."
      ],
      [
        "सुरुवातीचे हँड्स निवडण्याचा सराव कुठे करता येईल?",
        "PokerTH च्या सराव मोडमध्ये संगणक प्रतिस्पर्ध्यांविरुद्ध, कार्ड्स येतात तसं ऑड्स टॅब तुमची जिंकण्याची शक्यता दाखवत असताना."
      ]
    ]
  },
  ms: {
    "title": "Carta tangan permulaan poker — kedudukan 169 tangan | PokerTH",
    "desc": "Kesemua 169 tangan permulaan Texas Hold’em dalam carta, disusun ikut peluang menang menentang 1, 3 dan 6 lawan. Sekad atau berbeza kad, pasangan dan tangan terburuk.",
    "ldHeadline": "Carta tangan permulaan Texas Hold’em: kedudukan kesemua 169 tangan",
    "ldDesc": "169 tangan permulaan Texas Hold’em dalam carta, disusun mengikut peluang menang menentang satu, tiga dan enam tangan rawak.",
    "h1": "Tangan permulaan Texas Hold’em: kesemua 169, mengikut kedudukan",
    "lead": "Dua kad tertutup anda ialah keputusan pertama dalam setiap tangan. Terdapat {combos} cara untuk menerima dua kad, tetapi hanya 169 tangan permulaan yang berbeza apabila jenis kad diketepikan. Halaman ini memaparkan kesemuanya dalam carta bersama peluang menangnya, yang dikira dengan mensimulasikan sejuta edaran bagi setiap satu.",
    "chartH2": "Carta tangan permulaan",
    "chartP": "Pasangan terletak di sepanjang pepenjuru. Di atasnya ialah tangan sekad (s, kedua-dua kad daripada jenis yang sama), di bawahnya tangan berbeza kad (o). T bermaksud sepuluh. Angka dalam setiap petak ialah peluang tangan itu menang menentang satu tangan rawak apabila kesemua lima kad board diedarkan, dengan seri dikira sebagai separuh kemenangan; semakin hijau petaknya, semakin kuat tangannya.",
    "topH2": "Tangan permulaan terbaik",
    "topP": "Dua puluh tangan terkuat menentang seorang lawan, dan prestasinya menentang tiga dan enam:",
    "cols": [
      "Kedudukan",
      "Tangan",
      "1 lawan",
      "3 lawan",
      "6 lawan"
    ],
    "multiH2": "Lebih ramai lawan, tangan yang berbeza",
    "multiP": "Setiap tangan semakin jarang menang apabila lebih ramai pemain menyertai pot, tetapi tidak pada kadar yang sama, jadi kedudukannya berubah. Pocket ace kekal di atas: {aa1} secara head-to-head, masih {aa6} menentang enam lawan. Connector sekad naik, kerana ia membentuk straight dan flush yang memenangi pot besar: tujuh-enam sekad naik dari kedudukan {r76s1} secara head-to-head ke kedudukan {r76s6} menentang enam, jack-sepuluh sekad dari {rjts1} ke {rjts6}. Pasangan sederhana jatuh — pasangan tujuh merosot dari kedudukan {r77_1} ke {r77_6} — begitu juga tangan berbeza kad dengan satu kad tinggi dan kicker lemah, seperti king-enam berbeza kad, dari {rk6o1} ke {rk6o6}.",
    "suitedH2": "Sekad atau berbeza kad?",
    "suitedP": "Dua kad daripada jenis yang sama lebih bernilai daripada kad yang sama tetapi berbeza jenis — kira-kira {suitGain} lebih secara purata merentas kesemua 78 pasangan pangkat, dari {suitMin} hingga {suitMax} bergantung pada tangan. Ia penting, tetapi kurang daripada yang disangka: flush jarang berlaku, dan tangan sekad yang lemah tetap tangan yang lemah.",
    "worstH2": "Tangan permulaan terburuk",
    "worstP": "Menentang satu tangan rawak, tiga-dua berbeza kad ialah yang paling lemah dengan {w32}. Tujuh-dua berbeza kad, yang sering digelar tangan terburuk dalam poker, menang {w72} dan berada di kedudukan {r72} daripada 169 secara head-to-head — tetapi menentang enam lawan ia benar-benar yang terakhir, kerana dua kadnya terlalu jauh untuk membentuk straight bersama dan terlalu rendah untuk memenangi banyak perkara lain.",
    "countH2": "Berapa kerap anda menerima setiap jenis",
    "countP": "Daripada {combos} tangan dua kad yang mungkin, {pairCombos} ialah pasangan ({pairPct}), {suitedCombos} sekad ({suitedPct}) dan {offCombos} berbeza kad ({offPct}). Setiap pasangan boleh diedarkan dalam 6 cara, setiap tangan sekad dalam 4 cara, setiap tangan berbeza kad dalam 12 cara — sebab itulah anda melihat ace-king berbeza kad tiga kali lebih kerap daripada ace-king sekad.",
    "useH2": "Cara menggunakan carta seperti ini",
    "useP": "Carta menyusun tangan mengikut kekuatan mentah, sebelum sesiapa bertindak. Di meja sebenar, mainkan lebih sedikit tangan dari kedudukan awal, di mana ramai pemain bertindak selepas anda, dan lebih banyak dari butang dan cut-off. Raise dan bukan call dengan tangan yang anda mainkan, fold tangan di bahagian bawah carta, dan ingat bahawa nilai sesuatu tangan juga bergantung pada stack, blind dan lawan anda. Dalam kejohanan PokerTH blind terus naik, jadi tangan yang berbaloi dimainkan bertambah luas apabila stack semakin pendek.",
    "faqH2": "Soalan",
    "faq": [
      [
        "Apakah tangan permulaan terbaik dalam Texas Hold’em?",
        "Pocket ace. Ia menang {aa1} menentang satu tangan rawak, dan ia diunggulkan menentang setiap tangan permulaan lain."
      ],
      [
        "Adakah ace-king lebih baik daripada pasangan queen?",
        "Tidak, tetapi hampir: queen menang {qqak} menentang ace-king berbeza kad. Menentang satu tangan rawak, ace-king sekad menang {aks1} dan queen {qq1}."
      ],
      [
        "Berapa banyak tangan permulaan yang ada?",
        "{combos} kombinasi dua kad, yang membentuk 169 tangan permulaan berbeza: 13 pasangan, 78 sekad dan 78 berbeza kad."
      ],
      [
        "Berapakah nilai tangan sekad?",
        "Secara purata, kira-kira {suitGain} lebih peluang untuk menang berbanding tangan yang sama tetapi berbeza kad."
      ],
      [
        "Di mana saya boleh berlatih memilih tangan permulaan?",
        "Dalam mod latihan PokerTH menentang lawan komputer, dengan tab Peluang yang menunjukkan peluang anda untuk menang semasa kad keluar."
      ]
    ]
  },
  my: {
    "title": "ပိုကာ စတင်လက် ဇယား — လက် ၁၆၉ မျိုးလုံး အဆင့်စဉ် | PokerTH",
    "desc": "Texas Hold’em စတင်လက် ၁၆၉ မျိုးကို ပြိုင်ဘက် ၁၊ ၃၊ ၆ ဦးအပေါ် နိုင်ခြေအလိုက် ဇယားတွင် အဆင့်စဉ်ထားသည်။ suited လား offsuit လား၊ pair နှင့် အဆိုးဆုံးလက်။",
    "ldHeadline": "Texas Hold’em စတင်လက် ဇယား: လက် ၁၆၉ မျိုးလုံး အဆင့်စဉ်",
    "ldDesc": "Texas Hold’em စတင်လက် ၁၆၉ မျိုးကို ကျပန်းလက် တစ်ခု၊ သုံးခု နှင့် ခြောက်ခုအပေါ် နိုင်ခြေအလိုက် ဇယားဖြင့် အဆင့်စဉ်ထားသည်။",
    "h1": "Texas Hold’em စတင်လက်များ: ၁၆၉ မျိုးလုံး အဆင့်စဉ်",
    "lead": "သင့် hole cards နှစ်ချပ်သည် လက်တိုင်း၏ ပထမဆုံး ဆုံးဖြတ်ချက် ဖြစ်သည်။ ဖဲနှစ်ချပ် ဝေခံရနိုင်သော နည်း {combos} မျိုး ရှိသော်လည်း အပွင့်များကို ဘေးဖယ်ထားလျှင် မတူညီသော စတင်လက် ၁၆၉ မျိုးသာ ရှိသည်။ ဤစာမျက်နှာသည် ၎င်းတို့အားလုံးကို နိုင်ခြေနှင့်အတူ ဇယားဖြင့် ပြသထားပြီး တစ်ခုစီအတွက် ဖဲဝေမှု တစ်သန်းကို တုပစမ်းသပ်ခြင်းဖြင့် တွက်ချက်ထားသည်။",
    "chartH2": "စတင်လက် ဇယား",
    "chartP": "Pair များသည် ထောင့်ဖြတ်မျဉ်းအတိုင်း ဆင်းသွားသည်။ ၎င်း၏ အထက်တွင် suited လက်များ (s၊ ဖဲနှစ်ချပ်လုံး အပွင့်တူ)၊ အောက်တွင် offsuit လက်များ (o) ရှိသည်။ T သည် ဆယ် ကို ဆိုလိုသည်။ အကွက်တိုင်းရှိ ကိန်းဂဏန်းသည် စားပွဲဖဲ ငါးချပ်လုံး ဝေပြီးသောအခါ ထိုလက်က ကျပန်းလက် တစ်ခုကို နိုင်မည့် ဖြစ်နိုင်ခြေ ဖြစ်ပြီး သရေကို တစ်ဝက်နိုင်ဟု ရေတွက်သည်၊ အကွက် ပိုစိမ်းလေ လက် ပိုအားကောင်းလေ ဖြစ်သည်။",
    "topH2": "အကောင်းဆုံး စတင်လက်များ",
    "topP": "ပြိုင်ဘက် တစ်ဦးကို ယှဉ်လျှင် အားအကောင်းဆုံး လက် အနှစ်ဆယ်နှင့် ၎င်းတို့ ပြိုင်ဘက် သုံးဦးနှင့် ခြောက်ဦးကို မည်သို့ ခံနိုင်သည်:",
    "cols": [
      "အဆင့်",
      "လက်",
      "ပြိုင်ဘက် ၁",
      "ပြိုင်ဘက် ၃",
      "ပြိုင်ဘက် ၆"
    ],
    "multiH2": "ပြိုင်ဘက် ပိုများလေ လက်များ ပြောင်းလေ",
    "multiP": "ကစားသမားများ ပေါ့တ်ထဲ ဝင်လာသည်နှင့်အမျှ လက်တိုင်း နိုင်သည့်အကြိမ် နည်းလာသော်လည်း နှုန်းမတူသဖြင့် အဆင့်စဉ် ပြောင်းလဲသည်။ Pocket ace များ ထိပ်ဆုံးတွင် ရှိနေဆဲ: heads-up တွင် {aa1}၊ ပြိုင်ဘက် ခြောက်ဦးကိုပင် {aa6} ရှိသေးသည်။ Suited connectors များ အဆင့်တက်သည်၊ အကြောင်းမှာ ပေါ့တ်ကြီးများ နိုင်စေသော straight နှင့် flush များ ဖြစ်စေနိုင်သောကြောင့်ဖြစ်သည်: seven-six suited သည် heads-up တွင် အဆင့် {r76s1} မှ ပြိုင်ဘက် ခြောက်ဦးတွင် အဆင့် {r76s6} သို့၊ jack-ten suited သည် {rjts1} မှ {rjts6} သို့ တက်သည်။ အလယ်အလတ် pair များ ကျဆင်းသည် — seven pair သည် အဆင့် {r77_1} မှ {r77_6} သို့ ကျသည် — မြင့်သောဖဲ တစ်ချပ်နှင့် အားနည်းသော kicker ပါသည့် offsuit လက်များလည်း ထိုနည်းတူ ကျသည်၊ ဥပမာ king-six offsuit သည် {rk6o1} မှ {rk6o6} သို့။",
    "suitedH2": "Suited လား offsuit လား။",
    "suitedP": "အပွင့်တူ ဖဲနှစ်ချပ်သည် ထိုဖဲများ offsuit ဖြစ်သည်ထက် တန်ဖိုး ပိုရှိသည် — အဆင့်တွဲ ၇၈ မျိုးလုံးအပေါ် ပျမ်းမျှ {suitGain} ခန့် ပိုသည်၊ လက်ပေါ်မူတည်၍ {suitMin} မှ {suitMax} အထိ။ အရေးပါသော်လည်း ထင်သလောက် မဟုတ်ပါ: flush ရခဲပြီး အားနည်းသော suited လက်သည် အားနည်းသောလက်သာ ဖြစ်နေဆဲ။",
    "worstH2": "အဆိုးဆုံး စတင်လက်",
    "worstP": "ကျပန်းလက် တစ်ခုကို ယှဉ်လျှင် three-two offsuit သည် {w32} ဖြင့် အားလုံးထဲ အားအနည်းဆုံး ဖြစ်သည်။ ပိုကာ၏ အဆိုးဆုံးလက်ဟု မကြာခဏ ခေါ်ကြသော seven-two offsuit သည် {w72} နိုင်ပြီး heads-up တွင် ၁၆၉ ခုအနက် အဆင့် {r72} ဖြစ်သည် — သို့သော် ပြိုင်ဘက် ခြောက်ဦးကို ယှဉ်လျှင် လုံးဝ နောက်ဆုံး ဖြစ်သည်၊ အကြောင်းမှာ ၎င်း၏ ဖဲနှစ်ချပ်သည် အတူတကွ straight ဖြစ်ရန် အလွန်ဝေးကွာပြီး အခြားအရာဖြင့် များများ နိုင်ရန်လည်း အလွန်နိမ့်သောကြောင့် ဖြစ်သည်။",
    "countH2": "အမျိုးအစားတစ်ခုစီကို မည်မျှ မကြာခဏ ရသနည်း",
    "countP": "ဖြစ်နိုင်သော ဖဲနှစ်ချပ်လက် {combos} မျိုးအနက် {pairCombos} မျိုးသည် pair ({pairPct})၊ {suitedCombos} မျိုးသည် suited ({suitedPct}) နှင့် {offCombos} မျိုးသည် offsuit ({offPct}) ဖြစ်သည်။ Pair တစ်ခုစီကို နည်း ၆ မျိုး၊ suited လက်တစ်ခုစီကို နည်း ၄ မျိုး၊ offsuit လက်တစ်ခုစီကို နည်း ၁၂ မျိုးဖြင့် ဝေခံရနိုင်သည် — ထို့ကြောင့် ace-king offsuit ကို ace-king suited ထက် သုံးဆ ပိုမကြာခဏ တွေ့ရသည်။",
    "useH2": "ဤကဲ့သို့ ဇယားကို မည်သို့ အသုံးပြုမည်နည်း",
    "useP": "ဇယားသည် မည်သူမျှ မကစားမီ လက်များကို ၎င်းတို့၏ မူလ အားအလိုက် အဆင့်စဉ်သည်။ စားပွဲအစစ်တွင် သင့်နောက်တွင် ကစားသမား အများအပြား ကစားရမည့် အစောပိုင်း နေရာမှ လက် နည်းနည်းသာ ကစားပြီး ခလုတ်နှင့် cut-off မှ ပိုကစားပါ။ သင်ကစားသော လက်များဖြင့် Call ထက် Raise ကို ရွေးပါ၊ ဇယား၏ အောက်ခြေလက်များကို Fold လုပ်ပါ၊ လက်တစ်ခု၏ တန်ဖိုးသည် ချစ်ပ်ပမာဏ၊ ဘလိုင်း နှင့် သင့်ပြိုင်ဘက်များအပေါ်လည်း မူတည်ကြောင်း သတိရပါ။ PokerTH ပြိုင်ပွဲတွင် ဘလိုင်း ဆက်တိုက် မြင့်တက်နေသဖြင့် ချစ်ပ်ပမာဏ နည်းလာသည်နှင့်အမျှ ကစားထိုက်သော လက်များ ပိုကျယ်ပြန့်လာသည်။",
    "faqH2": "မေးခွန်းများ",
    "faq": [
      [
        "Texas Hold’em တွင် အကောင်းဆုံး စတင်လက်မှာ အဘယ်နည်း။",
        "Pocket ace များ။ ၎င်းတို့သည် ကျပန်းလက် တစ်ခုကို {aa1} နိုင်ပြီး အခြား စတင်လက် တိုင်းကို ယှဉ်လျှင် နိုင်ခြေ ပိုများသူ ဖြစ်သည်။"
      ],
      [
        "Ace-king သည် queen pair ထက် ပိုကောင်းသလား။",
        "မကောင်းပါ၊ သို့သော် နီးကပ်သည်: queen များက ace-king offsuit ကို {qqak} နိုင်သည်။ ကျပန်းလက် တစ်ခုကို ယှဉ်လျှင် ace-king suited က {aks1} နှင့် queen များက {qq1} နိုင်သည်။"
      ],
      [
        "စတင်လက် မည်မျှ ရှိသနည်း။",
        "ဖဲနှစ်ချပ် တွဲဖက်မှု {combos} မျိုး ရှိပြီး ၎င်းတို့က မတူညီသော စတင်လက် ၁၆၉ မျိုး ဖြစ်စေသည်: pair ၁၃ မျိုး၊ suited ၇၈ မျိုး နှင့် offsuit ၇၈ မျိုး။"
      ],
      [
        "Suited လက်သည် မည်မျှ တန်ဖိုးရှိသနည်း။",
        "ပျမ်းမျှအားဖြင့် တူညီသော offsuit လက်ထက် နိုင်ခြေ {suitGain} ခန့် ပိုရှိသည်။"
      ],
      [
        "စတင်လက် ရွေးချယ်ခြင်းကို မည်သည့်နေရာတွင် လေ့ကျင့်နိုင်သနည်း။",
        "PokerTH ၏ လေ့ကျင့်ရေးမုဒ်တွင် ကွန်ပျူတာပြိုင်ဘက်များနှင့် လေ့ကျင့်နိုင်ပြီး «ဖြစ်နိုင်ခြေ» တက်ဘ်က ဖဲများ ထွက်လာသည်နှင့်အမျှ သင့်နိုင်ခြေကို ပြသပေးသည်။"
      ]
    ]
  },
  nb: {
    "title": "Starthender i poker — alle 169 hender rangert | PokerTH",
    "desc": "Alle 169 starthender i Texas Hold’em i én tabell, rangert etter sjansen for å vinne mot én, tre og seks motstandere. Samme farge eller ikke, par og den dårligste hånden.",
    "ldHeadline": "Tabell over starthender i Texas Hold’em: alle 169 hender rangert",
    "ldDesc": "De 169 starthendene i Texas Hold’em, satt opp i en tabell og rangert etter sjansen for å vinne mot én, tre og seks tilfeldige hender.",
    "h1": "Starthender i Texas Hold’em: alle 169, rangert",
    "lead": "De to lukkede kortene dine er den første avgjørelsen i hver hånd. Det finnes {combos} måter å få utdelt to kort på, men bare 169 ulike starthender når man ser bort fra fargene. Denne siden viser dem alle i en tabell med sjansen deres for å vinne, beregnet ved å simulere en million utdelinger for hver.",
    "chartH2": "Tabellen over starthender",
    "chartP": "Parene går nedover diagonalen. Over den står hendene i samme farge (s, begge kortene i samme farge), under den hendene i ulike farger (o). T står for tier. Tallet i hver rute er sjansen for at hånden vinner mot én tilfeldig hånd når alle fem felleskortene er delt ut, der uavgjort teller som en halv seier; jo grønnere ruten er, desto sterkere er hånden.",
    "topH2": "De beste starthendene",
    "topP": "De tjue sterkeste hendene mot én motstander, og hvordan de holder seg mot tre og seks:",
    "cols": [
      "Plass",
      "Hånd",
      "1 motstander",
      "3 motstandere",
      "6 motstandere"
    ],
    "multiH2": "Flere motstandere, andre hender",
    "multiP": "Alle hender vinner sjeldnere jo flere spillere som blir med i potten, men ikke i samme takt, så rangeringen endrer seg. Et par ess blir liggende øverst: {aa1} heads-up, fortsatt {aa6} mot seks motstandere. Kort i rekke i samme farge klatrer, fordi de lager stiger og farger som vinner store potter: sju-seks i samme farge går fra plass {r76s1} heads-up til plass {r76s6} mot seks, knekt-tier i samme farge fra {rjts1} til {rjts6}. Middels par faller — sjuere faller fra plass {r77_1} til {r77_6} — og det gjør også hender i ulike farger med ett høyt kort og en svak kicker, som konge-seks i ulike farger, fra {rk6o1} til {rk6o6}.",
    "suitedH2": "Samme farge eller ulike farger?",
    "suitedP": "To kort i samme farge er verdt mer enn de samme kortene i ulike farger — i snitt omtrent {suitGain} mer over alle de 78 verdikombinasjonene, fra {suitMin} til {suitMax} avhengig av hånden. Det betyr noe, men mindre enn det ser ut til: farger er sjeldne, og en svak hånd i samme farge er fortsatt en svak hånd.",
    "worstH2": "Den dårligste starthånden",
    "worstP": "Mot én tilfeldig hånd er tre-to i ulike farger den svakeste av alle med {w32}. Sju-to i ulike farger, ofte kalt den dårligste hånden i poker, vinner {w72} og er nummer {r72} av 169 heads-up — men mot seks motstandere er den aller sist, fordi de to kortene ligger for langt fra hverandre til å lage en stige sammen og er for lave til å vinne stort annet.",
    "countH2": "Hvor ofte du får hver type hånd",
    "countP": "Av de {combos} mulige hendene med to kort er {pairCombos} par ({pairPct}), {suitedCombos} i samme farge ({suitedPct}) og {offCombos} i ulike farger ({offPct}). Hvert par kan deles ut på 6 måter, hver hånd i samme farge på 4 måter og hver hånd i ulike farger på 12 måter — derfor får du ess-konge i ulike farger tre ganger så ofte som ess-konge i samme farge.",
    "useH2": "Slik bruker du en tabell som denne",
    "useP": "En tabell rangerer hender etter rå styrke, før noen har handlet. Ved et ekte bord bør du spille færre hender fra tidlig posisjon, der mange spillere handler etter deg, og flere fra knappen og cut-off. Høyn heller enn å syne med hendene du spiller, kast hendene nederst i tabellen, og husk at verdien av en hånd også avhenger av stackene, blindene og motstanderne dine. I en PokerTH-turnering fortsetter blindene å stige, så flere hender blir verdt å spille etter hvert som stackene blir korte.",
    "faqH2": "Spørsmål",
    "faq": [
      [
        "Hva er den beste starthånden i Texas Hold’em?",
        "Et par ess. De vinner {aa1} mot én tilfeldig hånd og er favoritt mot alle andre starthender."
      ],
      [
        "Er ess-konge bedre enn et par damer?",
        "Nei, men det er jevnt: damer vinner {qqak} mot ess-konge i ulike farger. Mot én tilfeldig hånd vinner ess-konge i samme farge {aks1} og damer {qq1}."
      ],
      [
        "Hvor mange starthender finnes det?",
        "{combos} kombinasjoner av to kort, som gir 169 ulike starthender: 13 par, 78 i samme farge og 78 i ulike farger."
      ],
      [
        "Hvor mye er en hånd i samme farge verdt?",
        "I snitt omtrent {suitGain} større sjanse for å vinne enn den samme hånden i ulike farger."
      ],
      [
        "Hvor kan jeg øve på å velge starthender?",
        "I treningsmodusen i PokerTH mot datamotstandere, der fanen Sjanser viser sjansen din for å vinne etter hvert som kortene kommer."
      ]
    ]
  },
  ne: {
    "title": "पोकर सुरुआती ह्यान्ड चार्ट — सबै 169 ह्यान्डको क्रम | PokerTH",
    "desc": "Texas Hold’em का सबै 169 सुरुआती ह्यान्ड एउटै चार्टमा, 1, 3 र 6 प्रतिद्वन्द्वीविरुद्ध जित्ने सम्भावनाअनुसार क्रमबद्ध। सुटेड वा अफसुट, जोडी, र सबैभन्दा खराब ह्यान्ड।",
    "ldHeadline": "Texas Hold’em सुरुआती ह्यान्ड चार्ट: सबै 169 ह्यान्डको क्रम",
    "ldDesc": "Texas Hold’em का 169 सुरुआती ह्यान्ड, चार्टमा राखिएका र एक, तीन र छ वटा अनियमित ह्यान्डविरुद्ध जित्ने सम्भावनाअनुसार क्रमबद्ध।",
    "h1": "Texas Hold’em का सुरुआती ह्यान्ड: सबै 169, क्रमबद्ध",
    "lead": "तपाईंका दुई पकेट कार्ड हरेक ह्यान्डको पहिलो निर्णय हुन्। दुई कार्ड बाँडिने {combos} तरिका छन्, तर सूटलाई बेवास्ता गर्ने हो भने फरक सुरुआती ह्यान्ड 169 मात्र छन्। यो पृष्ठले ती सबैलाई जित्ने सम्भावनासहित चार्टमा देखाउँछ, जुन हरेक ह्यान्डका लागि 10 लाख पटक बाँडेर सिमुलेसन गरी निकालिएको हो।",
    "chartH2": "सुरुआती ह्यान्ड चार्ट",
    "chartP": "जोडीहरू विकर्णमा तलसम्म जान्छन्। त्यसमाथि सुटेड ह्यान्ड छन् (s, दुवै कार्ड एउटै सूटका), त्यसमुनि अफसुट ह्यान्ड (o)। T को अर्थ दस हो। हरेक कोठाको अङ्क बोर्डका पाँचै कार्ड बाँडिँदा त्यो ह्यान्डले एउटा अनियमित ह्यान्डलाई जित्ने सम्भावना हो, बराबरीलाई आधा जित गनेर; कोठा जति हरियो, ह्यान्ड उति बलियो।",
    "topH2": "सबैभन्दा राम्रा सुरुआती ह्यान्ड",
    "topP": "एक प्रतिद्वन्द्वीविरुद्ध सबैभन्दा बलिया 20 ह्यान्ड, र तीन तथा छ जनाविरुद्ध तिनीहरू कस्तो टिक्छन्:",
    "cols": [
      "क्रम",
      "ह्यान्ड",
      "1 प्रतिद्वन्द्वी",
      "3 प्रतिद्वन्द्वी",
      "6 प्रतिद्वन्द्वी"
    ],
    "multiH2": "बढी प्रतिद्वन्द्वी, फरक ह्यान्ड",
    "multiP": "पोटमा खेलाडी थपिँदै जाँदा हरेक ह्यान्डले कम पटक जित्छ, तर उही दरमा होइन, त्यसैले क्रम बदलिन्छ। पकेट एक्का माथि नै रहन्छन्: हेड्स-अपमा {aa1}, र छ जना प्रतिद्वन्द्वीविरुद्ध पनि {aa6}। सुटेड कनेक्टर माथि चढ्छन्, किनभने तिनले ठूला पोट जित्ने स्ट्रेट र फ्लस बनाउँछन्: सत्ता-छक्का सुटेड हेड्स-अपको स्थान {r76s1} बाट छ जनाविरुद्ध स्थान {r76s6} मा पुग्छ, गुलाम-दस सुटेड {rjts1} बाट {rjts6} मा। बीचका जोडी तल झर्छन् — सत्ताको जोडी स्थान {r77_1} बाट {r77_6} मा — र एउटा ठूलो कार्ड र कमजोर किकर भएका अफसुट ह्यान्ड पनि, जस्तै बादशाह-छक्का अफसुट, {rk6o1} बाट {rk6o6} मा।",
    "suitedH2": "सुटेड कि अफसुट?",
    "suitedP": "एउटै सूटका दुई कार्ड तिनै कार्ड अफसुट हुँदाभन्दा बढी मूल्यवान हुन्छन् — सबै 78 मान-जोडीमा औसतमा करिब {suitGain} बढी, ह्यान्डअनुसार {suitMin} देखि {suitMax} सम्म। यसको महत्त्व छ, तर देखिएजति होइन: फ्लस विरलै बन्छ, र कमजोर सुटेड ह्यान्ड पनि कमजोर ह्यान्ड नै हो।",
    "worstH2": "सबैभन्दा खराब सुरुआती ह्यान्ड",
    "worstP": "एउटा अनियमित ह्यान्डविरुद्ध, तिग्गी-दुरी अफसुट {w32} सहित सबैभन्दा कमजोर हो। पोकरको सबैभन्दा खराब ह्यान्ड भनेर प्रायः चिनिने सत्ता-दुरी अफसुटले {w72} जित्छ र हेड्स-अपमा 169 मध्ये स्थान {r72} मा पर्छ — तर छ जना प्रतिद्वन्द्वीविरुद्ध यो एकदमै अन्तिम हुन्छ, किनभने यसका दुई कार्ड सँगै स्ट्रेट बनाउन धेरै टाढा छन् र अरू धेरै कुरा जित्न धेरै साना छन्।",
    "countH2": "कुन प्रकारको ह्यान्ड कति पटक बाँडिन्छ",
    "countP": "सम्भावित {combos} दुई-कार्डे ह्यान्डमध्ये {pairCombos} जोडी ({pairPct}), {suitedCombos} सुटेड ({suitedPct}) र {offCombos} अफसुट ({offPct}) हुन्छन्। हरेक जोडी 6 तरिकाले, हरेक सुटेड ह्यान्ड 4 तरिकाले र हरेक अफसुट ह्यान्ड 12 तरिकाले बाँडिन सक्छ — त्यसैले तपाईं एक्का-बादशाह अफसुट एक्का-बादशाह सुटेडभन्दा तीन गुणा बढी देख्नुहुन्छ।",
    "useH2": "यस्तो चार्ट कसरी प्रयोग गर्ने",
    "useP": "चार्टले कसैले कदम चाल्नुअघि नै ह्यान्डलाई तिनको कच्चा बलअनुसार क्रमबद्ध गर्छ। वास्तविक टेबलमा, धेरै खेलाडी तपाईंपछि बोल्ने प्रारम्भिक पोजिसनबाट कम ह्यान्ड खेल्नुहोस्, र बटन तथा कट-अफबाट बढी। खेल्ने ह्यान्डमा Call भन्दा Raise गर्नुहोस्, चार्टको तल्लो भाग Fold गर्नुहोस्, र ह्यान्डको मूल्य स्ट्याक, ब्लाइन्ड र तपाईंका प्रतिद्वन्द्वीमा पनि भर पर्छ भन्ने सम्झनुहोस्। PokerTH प्रतियोगितामा ब्लाइन्ड बढ्दै जान्छन्, त्यसैले स्ट्याक छोटो हुँदै जाँदा खेल्न लायक ह्यान्डको दायरा फराकिलो हुन्छ।",
    "faqH2": "प्रश्नहरू",
    "faq": [
      [
        "Texas Hold’em मा सबैभन्दा राम्रो सुरुआती ह्यान्ड कुन हो?",
        "पकेट एक्का। यसले एउटा अनियमित ह्यान्डविरुद्ध {aa1} जित्छ, र अरू हरेक सुरुआती ह्यान्डविरुद्ध फेभरिट हुन्छ।"
      ],
      [
        "के एक्का-बादशाह बेगमको जोडीभन्दा राम्रो हो?",
        "होइन, तर नजिक छ: बेगमको जोडीले एक्का-बादशाह अफसुटविरुद्ध {qqak} जित्छ। एउटा अनियमित ह्यान्डविरुद्ध एक्का-बादशाह सुटेडले {aks1} र बेगमको जोडीले {qq1} जित्छ।"
      ],
      [
        "कति सुरुआती ह्यान्ड हुन्छन्?",
        "दुई कार्डका {combos} संयोजन, जसले 169 फरक सुरुआती ह्यान्ड बनाउँछन्: 13 जोडी, 78 सुटेड र 78 अफसुट।"
      ],
      [
        "सुटेड ह्यान्डको मूल्य कति हुन्छ?",
        "औसतमा, उही ह्यान्ड अफसुट हुँदाभन्दा करिब {suitGain} बढी जित्ने सम्भावना।"
      ],
      [
        "सुरुआती ह्यान्ड छनोट कहाँ अभ्यास गर्न सकिन्छ?",
        "PokerTH को अभ्यास मोडमा कम्प्युटर प्रतिद्वन्द्वीविरुद्ध, जहाँ सम्भावना ट्याबले कार्ड खुल्दै जाँदा तपाईंको जित्ने सम्भावना देखाउँछ।"
      ]
    ]
  },
  nl: {
    "title": "Starthandentabel poker — alle 169 handen gerangschikt | PokerTH",
    "desc": "Alle 169 starthanden van Texas Hold’em in één tabel, gerangschikt op winkans tegen één, drie en zes tegenstanders. Suited of offsuit, paren en de slechtste hand.",
    "ldHeadline": "Starthandentabel Texas Hold’em: alle 169 handen gerangschikt",
    "ldDesc": "De 169 starthanden van Texas Hold’em, in een tabel gezet en gerangschikt op hun winkans tegen één, drie en zes willekeurige handen.",
    "h1": "Starthanden bij Texas Hold’em: alle 169, gerangschikt",
    "lead": "Je twee eigen kaarten zijn de eerste beslissing van elke hand. Er zijn {combos} manieren om twee kaarten te krijgen, maar als je de kleuren buiten beschouwing laat, blijven er maar 169 verschillende starthanden over. Deze pagina zet ze allemaal in een tabel met hun winkans, berekend door voor elke hand een miljoen verdelingen te simuleren.",
    "chartH2": "De starthandentabel",
    "chartP": "De paren lopen langs de diagonaal. Daarboven staan de suited handen (s, beide kaarten van dezelfde kleur), daaronder de offsuit handen (o). T staat voor tien. Het getal in elk vakje is de kans dat de hand wint van één willekeurige hand als alle vijf bordkaarten zijn gedeeld, waarbij gelijkspel als halve winst telt; hoe groener het vakje, hoe sterker de hand.",
    "topH2": "De beste starthanden",
    "topP": "De twintig sterkste handen tegen één tegenstander, en hoe ze standhouden tegen drie en zes:",
    "cols": [
      "Rang",
      "Hand",
      "1 tegenstander",
      "3 tegenstanders",
      "6 tegenstanders"
    ],
    "multiH2": "Meer tegenstanders, andere handen",
    "multiP": "Elke hand wint minder vaak naarmate er meer spelers in de pot stappen, maar niet in hetzelfde tempo, dus de ranglijst verandert. Pocket azen blijven bovenaan: {aa1} heads-up, nog altijd {aa6} tegen zes tegenstanders. Suited connectors stijgen, omdat ze straten en flushes maken die grote potten winnen: zeven-zes suited gaat van rang {r76s1} heads-up naar rang {r76s6} tegen zes, boer-tien suited van {rjts1} naar {rjts6}. Middelhoge paren zakken — zevens vallen van rang {r77_1} naar {r77_6} — en dat geldt ook voor offsuit handen met één hoge kaart en een zwakke kicker, zoals heer-zes offsuit, van {rk6o1} naar {rk6o6}.",
    "suitedH2": "Suited of offsuit?",
    "suitedP": "Twee kaarten van dezelfde kleur zijn meer waard dan dezelfde kaarten offsuit — gemiddeld zo’n {suitGain} meer over alle 78 combinaties van twee waarden, van {suitMin} tot {suitMax} afhankelijk van de hand. Het telt, maar minder dan het lijkt: flushes zijn zeldzaam, en een zwakke suited hand blijft een zwakke hand.",
    "worstH2": "De slechtste starthand",
    "worstP": "Tegen één willekeurige hand is drie-twee offsuit met {w32} de zwakste van allemaal. Zeven-twee offsuit, vaak de slechtste hand in poker genoemd, wint {w72} en staat heads-up op rang {r72} van 169 — maar tegen zes tegenstanders is hij de allerlaatste, omdat zijn twee kaarten te ver uit elkaar liggen om samen een straat te maken en te laag zijn om veel anders te winnen.",
    "countH2": "Hoe vaak je elke soort krijgt",
    "countP": "Van de {combos} mogelijke handen van twee kaarten zijn er {pairCombos} paren ({pairPct}), {suitedCombos} suited ({suitedPct}) en {offCombos} offsuit ({offPct}). Elk paar kan op 6 manieren worden gedeeld, elke suited hand op 4 manieren, elke offsuit hand op 12 manieren — daarom zie je aas-heer offsuit drie keer zo vaak als aas-heer suited.",
    "useH2": "Zo gebruik je zo’n tabel",
    "useP": "Een tabel rangschikt handen op pure kracht, voordat iemand heeft gehandeld. Aan een echte tafel speel je minder handen vanuit vroege positie, waar veel spelers na jou handelen, en meer vanaf de button en de cut-off. Raise liever dan te callen met de handen die je speelt, fold de onderkant van de tabel, en onthoud dat de waarde van een hand ook afhangt van de stacks, de blinds en je tegenstanders. In een PokerTH-toernooi blijven de blinds stijgen, dus de handen die het spelen waard zijn worden ruimer naarmate de stacks kleiner worden.",
    "faqH2": "Vragen",
    "faq": [
      [
        "Wat is de beste starthand bij Texas Hold’em?",
        "Pocket azen. Ze winnen {aa1} tegen één willekeurige hand, en ze zijn favoriet tegen elke andere starthand."
      ],
      [
        "Is aas-heer beter dan een paar vrouwen?",
        "Nee, maar het scheelt weinig: vrouwen winnen {qqak} tegen aas-heer offsuit. Tegen één willekeurige hand wint aas-heer suited {aks1} en winnen vrouwen {qq1}."
      ],
      [
        "Hoeveel starthanden zijn er?",
        "{combos} combinaties van twee kaarten, die samen 169 verschillende starthanden vormen: 13 paren, 78 suited en 78 offsuit."
      ],
      [
        "Hoeveel is een suited hand waard?",
        "Gemiddeld ongeveer {suitGain} meer winkans dan dezelfde hand offsuit."
      ],
      [
        "Waar kan ik oefenen met het kiezen van starthanden?",
        "In de oefenmodus van PokerTH tegen computertegenstanders, met het tabblad Kansen dat je winkans toont terwijl de kaarten vallen."
      ]
    ]
  },
  pa: {
    "title": "ਪੋਕਰ ਸ਼ੁਰੂਆਤੀ ਹੱਥਾਂ ਦਾ ਚਾਰਟ — ਸਾਰੇ 169 ਹੱਥਾਂ ਦੀ ਰੈਂਕਿੰਗ | PokerTH",
    "desc": "Texas Hold’em ਦੇ ਸਾਰੇ 169 ਸ਼ੁਰੂਆਤੀ ਹੱਥ ਇੱਕ ਚਾਰਟ ਵਿੱਚ, ਇੱਕ, ਤਿੰਨ ਅਤੇ ਛੇ ਵਿਰੋਧੀਆਂ ਵਿਰੁੱਧ ਜਿੱਤਣ ਦੀ ਸੰਭਾਵਨਾ ਮੁਤਾਬਕ। ਸੂਟਿਡ ਜਾਂ ਆਫ਼ਸੂਟ, ਜੋੜੇ ਅਤੇ ਸਭ ਤੋਂ ਮਾੜਾ ਹੱਥ।",
    "ldHeadline": "Texas Hold’em ਸ਼ੁਰੂਆਤੀ ਹੱਥਾਂ ਦਾ ਚਾਰਟ: ਸਾਰੇ 169 ਹੱਥਾਂ ਦੀ ਰੈਂਕਿੰਗ",
    "ldDesc": "Texas Hold’em ਦੇ 169 ਸ਼ੁਰੂਆਤੀ ਹੱਥ, ਚਾਰਟ ਵਿੱਚ ਅਤੇ ਇੱਕ, ਤਿੰਨ ਅਤੇ ਛੇ ਬੇਤਰਤੀਬ ਹੱਥਾਂ ਵਿਰੁੱਧ ਜਿੱਤਣ ਦੀ ਸੰਭਾਵਨਾ ਮੁਤਾਬਕ ਦਰਜਾਬੰਦ।",
    "h1": "Texas Hold’em ਦੇ ਸ਼ੁਰੂਆਤੀ ਹੱਥ: ਸਾਰੇ 169, ਰੈਂਕਿੰਗ ਮੁਤਾਬਕ",
    "lead": "ਤੁਹਾਡੇ ਦੋ ਹੋਲ ਕਾਰਡ ਹਰ ਹੱਥ ਦਾ ਪਹਿਲਾ ਫ਼ੈਸਲਾ ਹਨ। ਦੋ ਪੱਤੇ ਮਿਲਣ ਦੇ {combos} ਤਰੀਕੇ ਹਨ, ਪਰ ਰੰਗਾਂ ਨੂੰ ਪਾਸੇ ਰੱਖੀਏ ਤਾਂ ਵੱਖ-ਵੱਖ ਸ਼ੁਰੂਆਤੀ ਹੱਥ ਸਿਰਫ਼ 169 ਹਨ। ਇਹ ਸਫ਼ਾ ਉਹਨਾਂ ਸਾਰਿਆਂ ਨੂੰ ਜਿੱਤਣ ਦੀ ਸੰਭਾਵਨਾ ਸਮੇਤ ਚਾਰਟ ਵਿੱਚ ਵਿਖਾਉਂਦਾ ਹੈ, ਜੋ ਹਰ ਇੱਕ ਲਈ ਦਸ ਲੱਖ ਵੰਡਾਂ ਦੀ ਸਿਮੂਲੇਸ਼ਨ ਕਰਕੇ ਕੱਢੀ ਗਈ ਹੈ।",
    "chartH2": "ਸ਼ੁਰੂਆਤੀ ਹੱਥਾਂ ਦਾ ਚਾਰਟ",
    "chartP": "ਜੋੜੇ ਤਿਰਛੀ ਲਕੀਰ (ਡਾਇਗਨਲ) ’ਤੇ ਹਨ। ਉਸ ਤੋਂ ਉੱਪਰ ਸੂਟਿਡ ਹੱਥ ਹਨ (s, ਦੋਵੇਂ ਪੱਤੇ ਇੱਕੋ ਰੰਗ ਦੇ), ਹੇਠਾਂ ਆਫ਼ਸੂਟ ਹੱਥ (o)। T ਦਾ ਮਤਲਬ ਦਹਿਲਾ (ਦਸ) ਹੈ। ਹਰ ਖ਼ਾਨੇ ਵਿਚਲਾ ਅੰਕ ਉਹ ਸੰਭਾਵਨਾ ਹੈ ਕਿ ਬੋਰਡ ਦੇ ਪੰਜੇ ਪੱਤੇ ਵੰਡੇ ਜਾਣ ’ਤੇ ਇਹ ਹੱਥ ਇੱਕ ਬੇਤਰਤੀਬ ਹੱਥ ਨੂੰ ਹਰਾਵੇ, ਬਰਾਬਰੀ ਨੂੰ ਅੱਧੀ ਜਿੱਤ ਗਿਣ ਕੇ; ਖ਼ਾਨਾ ਜਿੰਨਾ ਹਰਾ, ਹੱਥ ਓਨਾ ਮਜ਼ਬੂਤ।",
    "topH2": "ਸਭ ਤੋਂ ਵਧੀਆ ਸ਼ੁਰੂਆਤੀ ਹੱਥ",
    "topP": "ਇੱਕ ਵਿਰੋਧੀ ਵਿਰੁੱਧ ਵੀਹ ਸਭ ਤੋਂ ਮਜ਼ਬੂਤ ਹੱਥ, ਅਤੇ ਤਿੰਨ ਤੇ ਛੇ ਵਿਰੋਧੀਆਂ ਵਿਰੁੱਧ ਉਹ ਕਿਵੇਂ ਟਿਕਦੇ ਹਨ:",
    "cols": [
      "ਰੈਂਕ",
      "ਹੱਥ",
      "1 ਵਿਰੋਧੀ",
      "3 ਵਿਰੋਧੀ",
      "6 ਵਿਰੋਧੀ"
    ],
    "multiH2": "ਵੱਧ ਵਿਰੋਧੀ, ਵੱਖਰੇ ਹੱਥ",
    "multiP": "ਜਿਵੇਂ-ਜਿਵੇਂ ਖਿਡਾਰੀ ਪਾਟ ਵਿੱਚ ਸ਼ਾਮਲ ਹੁੰਦੇ ਹਨ, ਹਰ ਹੱਥ ਘੱਟ ਜਿੱਤਦਾ ਹੈ, ਪਰ ਇੱਕੋ ਦਰ ਨਾਲ ਨਹੀਂ, ਇਸ ਲਈ ਰੈਂਕਿੰਗ ਬਦਲ ਜਾਂਦੀ ਹੈ। ਪਾਕੇਟ ਯੱਕੇ ਸਿਖਰ ’ਤੇ ਰਹਿੰਦੇ ਹਨ: ਹੈਡਸ-ਅੱਪ ਵਿੱਚ {aa1}, ਛੇ ਵਿਰੋਧੀਆਂ ਵਿਰੁੱਧ ਵੀ {aa6}। ਸੂਟਿਡ ਕਨੈਕਟਰ ਉੱਪਰ ਚੜ੍ਹਦੇ ਹਨ, ਕਿਉਂਕਿ ਉਹ ਸਟ੍ਰੇਟ ਅਤੇ ਫਲੱਸ਼ ਬਣਾਉਂਦੇ ਹਨ ਜੋ ਵੱਡੇ ਪਾਟ ਜਿੱਤਦੇ ਹਨ: ਸੂਟਿਡ ਸੱਤਾ-ਛੱਕਾ ਹੈਡਸ-ਅੱਪ ਵਿੱਚ ਰੈਂਕ {r76s1} ਤੋਂ ਛੇ ਵਿਰੁੱਧ ਰੈਂਕ {r76s6} ’ਤੇ ਪਹੁੰਚਦਾ ਹੈ, ਸੂਟਿਡ ਗੁਲਾਮ-ਦਹਿਲਾ {rjts1} ਤੋਂ {rjts6} ’ਤੇ। ਵਿਚਕਾਰਲੇ ਜੋੜੇ ਹੇਠਾਂ ਆਉਂਦੇ ਹਨ — ਸੱਤਿਆਂ ਦਾ ਜੋੜਾ ਰੈਂਕ {r77_1} ਤੋਂ {r77_6} ’ਤੇ ਡਿੱਗਦਾ ਹੈ — ਅਤੇ ਇਸੇ ਤਰ੍ਹਾਂ ਇੱਕ ਉੱਚੇ ਪੱਤੇ ਅਤੇ ਕਮਜ਼ੋਰ ਕਿੱਕਰ ਵਾਲੇ ਆਫ਼ਸੂਟ ਹੱਥ ਵੀ, ਜਿਵੇਂ ਆਫ਼ਸੂਟ ਬਾਦਸ਼ਾਹ-ਛੱਕਾ, {rk6o1} ਤੋਂ {rk6o6} ’ਤੇ।",
    "suitedH2": "ਸੂਟਿਡ ਜਾਂ ਆਫ਼ਸੂਟ?",
    "suitedP": "ਇੱਕੋ ਰੰਗ ਦੇ ਦੋ ਪੱਤੇ ਉਹਨਾਂ ਹੀ ਪੱਤਿਆਂ ਦੇ ਆਫ਼ਸੂਟ ਹੋਣ ਨਾਲੋਂ ਵੱਧ ਕੀਮਤੀ ਹਨ — ਦਰਜਿਆਂ ਦੀਆਂ ਸਾਰੀਆਂ 78 ਜੋੜੀਆਂ ’ਤੇ ਔਸਤਨ ਲਗਭਗ {suitGain} ਵੱਧ, ਹੱਥ ਮੁਤਾਬਕ {suitMin} ਤੋਂ {suitMax} ਤੱਕ। ਇਹ ਮਾਇਨੇ ਰੱਖਦਾ ਹੈ, ਪਰ ਜਿੰਨਾ ਲੱਗਦਾ ਹੈ ਓਨਾ ਨਹੀਂ: ਫਲੱਸ਼ ਘੱਟ ਹੀ ਬਣਦੇ ਹਨ, ਅਤੇ ਕਮਜ਼ੋਰ ਸੂਟਿਡ ਹੱਥ ਫਿਰ ਵੀ ਕਮਜ਼ੋਰ ਹੱਥ ਹੀ ਹੈ।",
    "worstH2": "ਸਭ ਤੋਂ ਮਾੜਾ ਸ਼ੁਰੂਆਤੀ ਹੱਥ",
    "worstP": "ਇੱਕ ਬੇਤਰਤੀਬ ਹੱਥ ਵਿਰੁੱਧ ਆਫ਼ਸੂਟ ਤਿੱਕੀ-ਦੁੱਕੀ ਸਭ ਤੋਂ ਕਮਜ਼ੋਰ ਹੈ: {w32}। ਆਫ਼ਸੂਟ ਸੱਤਾ-ਦੁੱਕੀ, ਜਿਸ ਨੂੰ ਅਕਸਰ ਪੋਕਰ ਦਾ ਸਭ ਤੋਂ ਮਾੜਾ ਹੱਥ ਕਿਹਾ ਜਾਂਦਾ ਹੈ, {w72} ਜਿੱਤਦਾ ਹੈ ਅਤੇ ਹੈਡਸ-ਅੱਪ ਵਿੱਚ 169 ਵਿੱਚੋਂ ਰੈਂਕ {r72} ’ਤੇ ਹੈ — ਪਰ ਛੇ ਵਿਰੋਧੀਆਂ ਵਿਰੁੱਧ ਇਹ ਬਿਲਕੁਲ ਆਖ਼ਰੀ ਹੈ, ਕਿਉਂਕਿ ਇਸ ਦੇ ਦੋਵੇਂ ਪੱਤੇ ਮਿਲ ਕੇ ਸਟ੍ਰੇਟ ਬਣਾਉਣ ਲਈ ਬਹੁਤ ਦੂਰ ਹਨ ਅਤੇ ਹੋਰ ਕੁਝ ਜਿੱਤਣ ਲਈ ਬਹੁਤ ਛੋਟੇ।",
    "countH2": "ਹਰ ਕਿਸਮ ਕਿੰਨੀ ਵਾਰ ਮਿਲਦੀ ਹੈ",
    "countP": "ਦੋ ਪੱਤਿਆਂ ਵਾਲੇ {combos} ਸੰਭਵ ਹੱਥਾਂ ਵਿੱਚੋਂ {pairCombos} ਜੋੜੇ ਹਨ ({pairPct}), {suitedCombos} ਸੂਟਿਡ ({suitedPct}) ਅਤੇ {offCombos} ਆਫ਼ਸੂਟ ({offPct})। ਹਰ ਜੋੜਾ 6 ਤਰੀਕਿਆਂ ਨਾਲ ਮਿਲ ਸਕਦਾ ਹੈ, ਹਰ ਸੂਟਿਡ ਹੱਥ 4 ਤਰੀਕਿਆਂ ਨਾਲ, ਹਰ ਆਫ਼ਸੂਟ ਹੱਥ 12 ਤਰੀਕਿਆਂ ਨਾਲ — ਇਸੇ ਕਰਕੇ ਤੁਹਾਨੂੰ ਆਫ਼ਸੂਟ ਯੱਕਾ-ਬਾਦਸ਼ਾਹ ਸੂਟਿਡ ਯੱਕਾ-ਬਾਦਸ਼ਾਹ ਨਾਲੋਂ ਤਿੰਨ ਗੁਣਾ ਵੱਧ ਮਿਲਦਾ ਹੈ।",
    "useH2": "ਅਜਿਹਾ ਚਾਰਟ ਕਿਵੇਂ ਵਰਤੀਏ",
    "useP": "ਚਾਰਟ ਹੱਥਾਂ ਨੂੰ ਕੱਚੀ ਤਾਕਤ ਮੁਤਾਬਕ ਦਰਜਾ ਦਿੰਦਾ ਹੈ, ਕਿਸੇ ਦੇ ਵੀ ਕਾਰਵਾਈ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ। ਅਸਲ ਟੇਬਲ ’ਤੇ ਸ਼ੁਰੂਆਤੀ ਪੋਜ਼ੀਸ਼ਨ ਤੋਂ ਘੱਟ ਹੱਥ ਖੇਡੋ, ਜਿੱਥੇ ਤੁਹਾਡੇ ਤੋਂ ਬਾਅਦ ਕਈ ਖਿਡਾਰੀ ਕਾਰਵਾਈ ਕਰਦੇ ਹਨ, ਅਤੇ ਬਟਨ ਤੇ ਕੱਟ-ਆਫ਼ ਤੋਂ ਵੱਧ। ਜਿਹੜੇ ਹੱਥ ਤੁਸੀਂ ਖੇਡਦੇ ਹੋ ਉਹਨਾਂ ਨਾਲ Call ਦੀ ਬਜਾਏ Raise ਕਰੋ, ਚਾਰਟ ਦੇ ਹੇਠਲੇ ਹੱਥ Fold ਕਰੋ, ਅਤੇ ਯਾਦ ਰੱਖੋ ਕਿ ਹੱਥ ਦੀ ਕੀਮਤ ਸਟੈਕਾਂ, ਬਲਾਇੰਡਾਂ ਅਤੇ ਤੁਹਾਡੇ ਵਿਰੋਧੀਆਂ ’ਤੇ ਵੀ ਨਿਰਭਰ ਕਰਦੀ ਹੈ। PokerTH ਟੂਰਨਾਮੈਂਟ ਵਿੱਚ ਬਲਾਇੰਡ ਵਧਦੇ ਹੀ ਰਹਿੰਦੇ ਹਨ, ਇਸ ਲਈ ਸਟੈਕ ਛੋਟੇ ਹੋਣ ’ਤੇ ਖੇਡਣ ਯੋਗ ਹੱਥਾਂ ਦਾ ਘੇਰਾ ਵਧ ਜਾਂਦਾ ਹੈ।",
    "faqH2": "ਸਵਾਲ",
    "faq": [
      [
        "Texas Hold’em ਵਿੱਚ ਸਭ ਤੋਂ ਵਧੀਆ ਸ਼ੁਰੂਆਤੀ ਹੱਥ ਕਿਹੜਾ ਹੈ?",
        "ਪਾਕੇਟ ਯੱਕੇ। ਇਹ ਇੱਕ ਬੇਤਰਤੀਬ ਹੱਥ ਵਿਰੁੱਧ {aa1} ਜਿੱਤਦੇ ਹਨ, ਅਤੇ ਹਰ ਦੂਜੇ ਸ਼ੁਰੂਆਤੀ ਹੱਥ ਵਿਰੁੱਧ ਫ਼ੇਵਰਿਟ ਹਨ।"
      ],
      [
        "ਕੀ ਯੱਕਾ-ਬਾਦਸ਼ਾਹ ਬੇਗੀਆਂ ਦੇ ਜੋੜੇ ਨਾਲੋਂ ਵਧੀਆ ਹੈ?",
        "ਨਹੀਂ, ਪਰ ਫ਼ਰਕ ਥੋੜ੍ਹਾ ਹੈ: ਬੇਗੀਆਂ ਆਫ਼ਸੂਟ ਯੱਕਾ-ਬਾਦਸ਼ਾਹ ਵਿਰੁੱਧ {qqak} ਜਿੱਤਦੀਆਂ ਹਨ। ਇੱਕ ਬੇਤਰਤੀਬ ਹੱਥ ਵਿਰੁੱਧ ਸੂਟਿਡ ਯੱਕਾ-ਬਾਦਸ਼ਾਹ {aks1} ਜਿੱਤਦਾ ਹੈ ਅਤੇ ਬੇਗੀਆਂ {qq1}।"
      ],
      [
        "ਕੁੱਲ ਕਿੰਨੇ ਸ਼ੁਰੂਆਤੀ ਹੱਥ ਹਨ?",
        "ਦੋ ਪੱਤਿਆਂ ਦੇ {combos} ਮੇਲ, ਜੋ 169 ਵੱਖ-ਵੱਖ ਸ਼ੁਰੂਆਤੀ ਹੱਥ ਬਣਾਉਂਦੇ ਹਨ: 13 ਜੋੜੇ, 78 ਸੂਟਿਡ ਅਤੇ 78 ਆਫ਼ਸੂਟ।"
      ],
      [
        "ਸੂਟਿਡ ਹੱਥ ਦੀ ਕਿੰਨੀ ਵੱਧ ਕੀਮਤ ਹੈ?",
        "ਔਸਤਨ, ਉਸੇ ਹੱਥ ਦੇ ਆਫ਼ਸੂਟ ਰੂਪ ਨਾਲੋਂ ਜਿੱਤਣ ਦੀ ਲਗਭਗ {suitGain} ਵੱਧ ਸੰਭਾਵਨਾ।"
      ],
      [
        "ਸ਼ੁਰੂਆਤੀ ਹੱਥ ਚੁਣਨ ਦਾ ਅਭਿਆਸ ਕਿੱਥੇ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ?",
        "PokerTH ਦੇ ਅਭਿਆਸ ਮੋਡ ਵਿੱਚ ਕੰਪਿਊਟਰ ਵਿਰੋਧੀਆਂ ਵਿਰੁੱਧ, ਜਿੱਥੇ ਓਡਸ ਟੈਬ ਪੱਤੇ ਆਉਣ ਦੇ ਨਾਲ ਤੁਹਾਡੀ ਜਿੱਤਣ ਦੀ ਸੰਭਾਵਨਾ ਵਿਖਾਉਂਦਾ ਹੈ।"
      ]
    ]
  },
  pl: {
    "title": "Tabela rąk startowych w pokerze — ranking 169 rąk | PokerTH",
    "desc": "Wszystkie 169 rąk startowych Texas Hold’em w tabeli, według szansy na wygraną z jednym, trzema i sześcioma przeciwnikami. W kolorze czy nie, pary i najgorsza ręka.",
    "ldHeadline": "Tabela rąk startowych Texas Hold’em: ranking wszystkich 169 rąk",
    "ldDesc": "169 rąk startowych Texas Hold’em w tabeli, uszeregowanych według szansy na wygraną z jedną, trzema i sześcioma losowymi rękami.",
    "h1": "Ręce startowe w Texas Hold’em: wszystkie 169 w rankingu",
    "lead": "Twoje dwie karty własne to pierwsza decyzja w każdym rozdaniu. Dwie karty można dostać na {combos} sposobów, ale gdy pominąć kolory, różnych rąk startowych jest tylko 169. Ta strona pokazuje je wszystkie w tabeli wraz z szansą na wygraną, wyliczoną przez symulację miliona rozdań dla każdej z nich.",
    "chartH2": "Tabela rąk startowych",
    "chartP": "Pary biegną po przekątnej. Nad nią są ręce w jednym kolorze (s, obie karty tego samego koloru), pod nią ręce w różnych kolorach (o). T oznacza dziesiątkę. Liczba w każdym polu to szansa, że ręka wygra z jedną losową ręką, gdy wyłożone zostanie wszystkie pięć kart wspólnych, przy czym remis liczy się jako pół wygranej; im bardziej zielone pole, tym silniejsza ręka.",
    "topH2": "Najlepsze ręce startowe",
    "topP": "Dwadzieścia najsilniejszych rąk przeciwko jednemu przeciwnikowi i to, jak radzą sobie przeciwko trzem i sześciu:",
    "cols": [
      "Miejsce",
      "Ręka",
      "1 przeciwnik",
      "3 przeciwników",
      "6 przeciwników"
    ],
    "multiH2": "Więcej przeciwników, inne ręce",
    "multiP": "Każda ręka wygrywa rzadziej, gdy do puli dołączają kolejni gracze, ale nie w tym samym tempie, więc ranking się zmienia. Para asów pozostaje na szczycie: {aa1} jeden na jednego i wciąż {aa6} przeciwko sześciu przeciwnikom. Karty następujące po sobie w jednym kolorze idą w górę, bo tworzą strity i kolory, które wygrywają duże pule: siódemka-szóstka w kolorze awansuje z {r76s1}. miejsca jeden na jednego na {r76s6}. przeciwko sześciu, a walet-dziesiątka w kolorze z {rjts1}. na {rjts6}. Średnie pary spadają — siódemki z {r77_1}. miejsca na {r77_6}. — podobnie jak ręce w różnych kolorach z jedną wysoką kartą i słabym kickerem, takie jak król-szóstka w różnych kolorach, z {rk6o1}. na {rk6o6}.",
    "suitedH2": "W jednym kolorze czy w różnych?",
    "suitedP": "Dwie karty w jednym kolorze są warte więcej niż te same karty w różnych kolorach — średnio o około {suitGain} więcej we wszystkich 78 kombinacjach dwóch różnych wartości, od {suitMin} do {suitMax} zależnie od ręki. To ma znaczenie, ale mniejsze, niż się wydaje: kolor trafia się rzadko, a słaba ręka w jednym kolorze nadal jest słabą ręką.",
    "worstH2": "Najgorsza ręka startowa",
    "worstP": "Przeciwko jednej losowej ręce najsłabsza ze wszystkich jest trójka-dwójka w różnych kolorach: {w32}. Siódemka-dwójka w różnych kolorach, często nazywana najgorszą ręką w pokerze, wygrywa w {w72} przypadków i zajmuje {r72}. miejsce na 169 w grze jeden na jednego — ale przeciwko sześciu przeciwnikom jest na samym końcu, bo jej dwie karty są zbyt odległe, by razem utworzyć strita, i zbyt niskie, by często wygrać czymkolwiek innym.",
    "countH2": "Jak często dostajesz każdy rodzaj ręki",
    "countP": "Spośród {combos} możliwych rąk dwukartowych {pairCombos} to pary ({pairPct}), {suitedCombos} to ręce w jednym kolorze ({suitedPct}), a {offCombos} w różnych kolorach ({offPct}). Każdą parę można dostać na 6 sposobów, każdą rękę w jednym kolorze na 4, a każdą rękę w różnych kolorach na 12 — dlatego asa z królem w różnych kolorach widzisz trzy razy częściej niż asa z królem w jednym kolorze.",
    "useH2": "Jak korzystać z takiej tabeli",
    "useP": "Tabela szereguje ręce według ich surowej siły, zanim ktokolwiek wykona ruch. Przy prawdziwym stole graj mniej rąk z wczesnej pozycji, gdy po tobie działa wielu graczy, a więcej z pozycji rozdającego (buttona) i z cut-offa. Z rękami, które grasz, przebijaj zamiast sprawdzać, pasuj z rękami z dołu tabeli i pamiętaj, że wartość ręki zależy też od stacków, ciemnych i przeciwników. W turnieju PokerTH ciemne stale rosną, więc zakres rąk wartych gry poszerza się, gdy stacki się kurczą.",
    "faqH2": "Pytania",
    "faq": [
      [
        "Jaka jest najlepsza ręka startowa w Texas Hold’em?",
        "Para asów. Wygrywa w {aa1} przypadków z jedną losową ręką i jest faworytem przeciwko każdej innej ręce startowej."
      ],
      [
        "Czy as-król jest lepszy od pary dam?",
        "Nie, ale niewiele brakuje: damy wygrywają z as-królem w różnych kolorach w {qqak} przypadków. Przeciwko jednej losowej ręce as-król w jednym kolorze wygrywa w {aks1}, a damy w {qq1}."
      ],
      [
        "Ile jest rąk startowych?",
        "{combos} dwukartowych kombinacji, które dają 169 różnych rąk startowych: 13 par, 78 w jednym kolorze i 78 w różnych kolorach."
      ],
      [
        "Ile jest warta ręka w jednym kolorze?",
        "Średnio o około {suitGain} większą szansę na wygraną niż ta sama ręka w różnych kolorach."
      ],
      [
        "Gdzie mogę ćwiczyć dobór rąk startowych?",
        "W trybie treningowym PokerTH przeciwko przeciwnikom sterowanym przez komputer, z zakładką Szanse pokazującą twoją szansę na wygraną w miarę wychodzenia kart."
      ]
    ]
  },
  "pt-BR": {
    "title": "Tabela de mãos iniciais no pôquer — as 169 em ordem | PokerTH",
    "desc": "As 169 mãos iniciais do Texas Hold’em em uma tabela, ordenadas pela chance de vencer contra um, três e seis adversários. Mesmo naipe ou não, pares e a pior mão.",
    "ldHeadline": "Tabela de mãos iniciais do Texas Hold’em: as 169 mãos em ordem",
    "ldDesc": "As 169 mãos iniciais do Texas Hold’em, em uma tabela e ordenadas pela chance de vencer contra uma, três e seis mãos aleatórias.",
    "h1": "Mãos iniciais do Texas Hold’em: as 169, em ordem",
    "lead": "Suas duas cartas fechadas são a primeira decisão de cada mão. Existem {combos} maneiras de receber duas cartas, mas só 169 mãos iniciais diferentes quando os naipes são deixados de lado. Esta página mostra todas elas em uma tabela com a chance de vitória de cada uma, calculada simulando um milhão de distribuições para cada mão.",
    "chartH2": "A tabela de mãos iniciais",
    "chartP": "Os pares ficam na diagonal. Acima dela estão as mãos do mesmo naipe (s, de suited: as duas cartas do mesmo naipe), abaixo as de naipes diferentes (o, de offsuit). T significa dez. O número em cada casa é a chance de a mão vencer uma mão aleatória quando as cinco cartas da mesa são distribuídas, contando empates como meia vitória; quanto mais verde a casa, mais forte a mão.",
    "topH2": "As melhores mãos iniciais",
    "topP": "As vinte mãos mais fortes contra um adversário, e como elas se saem contra três e seis:",
    "cols": [
      "Posição",
      "Mão",
      "1 adversário",
      "3 adversários",
      "6 adversários"
    ],
    "multiH2": "Mais adversários, outras mãos",
    "multiP": "Toda mão vence com menos frequência conforme mais jogadores entram no pote, mas não no mesmo ritmo, e por isso a ordem muda. O par de ases continua no topo: {aa1} no mano a mano e ainda {aa6} contra seis adversários. Os conectores do mesmo naipe sobem, porque formam sequências e flushes que ganham potes grandes: sete-seis do mesmo naipe vai da posição {r76s1} no mano a mano para a {r76s6} contra seis, e valete-dez do mesmo naipe da {rjts1} para a {rjts6}. Os pares médios caem — o par de setes desce da posição {r77_1} para a {r77_6} — e o mesmo acontece com mãos de naipes diferentes com uma carta alta e um kicker fraco, como rei-seis de naipes diferentes, da {rk6o1} para a {rk6o6}.",
    "suitedH2": "Mesmo naipe ou naipes diferentes?",
    "suitedP": "Duas cartas do mesmo naipe valem mais do que as mesmas cartas de naipes diferentes — em média, cerca de {suitGain} a mais nas 78 combinações de dois valores, de {suitMin} a {suitMax} conforme a mão. Faz diferença, mas menos do que parece: flushes são raros, e uma mão fraca do mesmo naipe continua sendo uma mão fraca.",
    "worstH2": "A pior mão inicial",
    "worstP": "Contra uma mão aleatória, três-dois de naipes diferentes é a mais fraca de todas, com {w32}. Sete-dois de naipes diferentes, muitas vezes chamada de pior mão do pôquer, vence {w72} e fica na posição {r72} de 169 no mano a mano — mas contra seis adversários é a última de todas, porque suas duas cartas estão longe demais uma da outra para formar uma sequência juntas e são baixas demais para ganhar muita coisa além disso.",
    "countH2": "Com que frequência você recebe cada tipo",
    "countP": "Das {combos} mãos possíveis de duas cartas, {pairCombos} são pares ({pairPct}), {suitedCombos} são do mesmo naipe ({suitedPct}) e {offCombos} são de naipes diferentes ({offPct}). Cada par pode vir de 6 maneiras, cada mão do mesmo naipe de 4 maneiras e cada mão de naipes diferentes de 12 maneiras — é por isso que você recebe ás-rei de naipes diferentes três vezes mais do que ás-rei do mesmo naipe.",
    "useH2": "Como usar uma tabela como esta",
    "useP": "Uma tabela classifica as mãos pela força bruta, antes de qualquer ação. Numa mesa de verdade, jogue menos mãos em posição inicial, onde muitos jogadores agem depois de você, e mais no botão e no cut-off. Dê Raise em vez de Call com as mãos que jogar, dê Fold nas do fundo da tabela, e lembre que o valor de uma mão também depende das pilhas, dos blinds e dos seus adversários. Num torneio do PokerTH os blinds não param de subir, então as mãos que valem a pena jogar aumentam à medida que as pilhas ficam curtas.",
    "faqH2": "Perguntas",
    "faq": [
      [
        "Qual é a melhor mão inicial no Texas Hold’em?",
        "Um par de ases. Ele vence {aa1} contra uma mão aleatória e é favorito contra qualquer outra mão inicial."
      ],
      [
        "Ás-rei é melhor que um par de damas?",
        "Não, mas é equilibrado: o par de damas vence {qqak} contra ás-rei de naipes diferentes. Contra uma mão aleatória, ás-rei do mesmo naipe vence {aks1} e o par de damas {qq1}."
      ],
      [
        "Quantas mãos iniciais existem?",
        "{combos} combinações de duas cartas, que formam 169 mãos iniciais diferentes: 13 pares, 78 do mesmo naipe e 78 de naipes diferentes."
      ],
      [
        "Quanto vale uma mão do mesmo naipe?",
        "Em média, cerca de {suitGain} a mais de chance de vencer do que a mesma mão de naipes diferentes."
      ],
      [
        "Onde posso treinar a escolha de mãos iniciais?",
        "No modo de treino do PokerTH, contra adversários do computador, com a aba Chances mostrando a sua chance de vitória conforme as cartas saem."
      ]
    ]
  },
  "pt-PT": {
    "title": "Tabela de mãos iniciais do póquer — as 169 classificadas | PokerTH",
    "desc": "As 169 mãos iniciais do Texas Hold’em, ordenadas pela probabilidade de ganhar contra 1, 3 e 6 adversários. Mesmo naipe ou naipes diferentes, pares e a pior mão.",
    "ldHeadline": "Tabela de mãos iniciais do Texas Hold’em: as 169 mãos classificadas",
    "ldDesc": "As 169 mãos iniciais do Texas Hold’em numa tabela, classificadas pela probabilidade de ganhar contra uma, três e seis mãos aleatórias.",
    "h1": "Mãos iniciais do Texas Hold’em: as 169, classificadas",
    "lead": "As suas duas cartas fechadas são a primeira decisão de cada mão. Há {combos} maneiras de receber duas cartas, mas apenas 169 mãos iniciais diferentes quando se põem os naipes de parte. Esta página mostra-as todas numa tabela com a sua probabilidade de ganhar, calculada simulando um milhão de distribuições para cada uma.",
    "chartH2": "A tabela de mãos iniciais",
    "chartP": "Os pares seguem pela diagonal. Acima dela estão as mãos do mesmo naipe (s, as duas cartas do mesmo naipe), abaixo as mãos de naipes diferentes (o). T significa dez. O número em cada quadrado é a probabilidade de a mão ganhar contra uma mão aleatória quando saem as cinco cartas da mesa, contando os empates como meia vitória; quanto mais verde o quadrado, mais forte a mão.",
    "topH2": "As melhores mãos iniciais",
    "topP": "As vinte mãos mais fortes contra um adversário, e como se aguentam contra três e contra seis:",
    "cols": [
      "Posição",
      "Mão",
      "1 adversário",
      "3 adversários",
      "6 adversários"
    ],
    "multiH2": "Mais adversários, outras mãos",
    "multiP": "Todas as mãos ganham menos vezes à medida que entram jogadores no pote, mas não ao mesmo ritmo, por isso a classificação muda. O par de ases mantém-se no topo: {aa1} frente a frente, ainda {aa6} contra seis adversários. Os conectores do mesmo naipe sobem, porque fazem sequências e flushes que ganham potes grandes: sete-seis do mesmo naipe passa da posição {r76s1} frente a frente para a posição {r76s6} contra seis, valete-dez do mesmo naipe de {rjts1} para {rjts6}. Os pares médios descem — os setes caem da posição {r77_1} para a {r77_6} — e o mesmo acontece às mãos de naipes diferentes com uma carta alta e uma carta de desempate fraca, como rei-seis de naipes diferentes, de {rk6o1} para {rk6o6}.",
    "suitedH2": "Mesmo naipe ou naipes diferentes?",
    "suitedP": "Duas cartas do mesmo naipe valem mais do que as mesmas cartas de naipes diferentes — cerca de {suitGain} a mais, em média, nos 78 pares de valores, de {suitMin} a {suitMax} consoante a mão. Conta, mas menos do que parece: os flushes são raros, e uma mão fraca do mesmo naipe continua a ser uma mão fraca.",
    "worstH2": "A pior mão inicial",
    "worstP": "Contra uma mão aleatória, três-dois de naipes diferentes é a mais fraca de todas, com {w32}. Sete-dois de naipes diferentes, muitas vezes chamada a pior mão do póquer, ganha {w72} e fica na posição {r72} de 169 frente a frente — mas contra seis adversários é mesmo a última, porque as suas duas cartas estão demasiado afastadas para formarem juntas uma sequência e são demasiado baixas para ganharem muito mais.",
    "countH2": "Com que frequência recebe cada tipo",
    "countP": "Das {combos} mãos possíveis de duas cartas, {pairCombos} são pares ({pairPct}), {suitedCombos} são do mesmo naipe ({suitedPct}) e {offCombos} de naipes diferentes ({offPct}). Cada par pode sair de 6 maneiras, cada mão do mesmo naipe de 4 e cada mão de naipes diferentes de 12 — é por isso que vê ás-rei de naipes diferentes três vezes mais do que ás-rei do mesmo naipe.",
    "useH2": "Como usar uma tabela como esta",
    "useP": "Uma tabela classifica as mãos pela força bruta, antes de alguém agir. Numa mesa a sério, jogue menos mãos em posição inicial, onde muitos jogadores agem depois de si, e mais a partir do botão e do cut-off. Suba em vez de igualar com as mãos que joga, desista com o fundo da tabela e lembre-se de que o valor de uma mão depende também das pilhas, dos blinds e dos seus adversários. Num torneio do PokerTH os blinds não param de subir, por isso o leque de mãos que vale a pena jogar alarga-se à medida que as pilhas ficam curtas.",
    "faqH2": "Perguntas",
    "faq": [
      [
        "Qual é a melhor mão inicial no Texas Hold’em?",
        "O par de ases. Ganha {aa1} contra uma mão aleatória e é favorito contra todas as outras mãos iniciais."
      ],
      [
        "Ás-rei é melhor do que um par de damas?",
        "Não, mas é renhido: as damas ganham {qqak} contra ás-rei de naipes diferentes. Contra uma mão aleatória, ás-rei do mesmo naipe ganha {aks1} e as damas {qq1}."
      ],
      [
        "Quantas mãos iniciais existem?",
        "{combos} combinações de duas cartas, que dão 169 mãos iniciais diferentes: 13 pares, 78 do mesmo naipe e 78 de naipes diferentes."
      ],
      [
        "Quanto vale uma mão do mesmo naipe?",
        "Em média, cerca de {suitGain} mais de probabilidade de ganhar do que a mesma mão de naipes diferentes."
      ],
      [
        "Onde posso treinar a escolha das mãos iniciais?",
        "No modo de treino do PokerTH contra adversários do computador, com o separador Probabilidades a mostrar a sua probabilidade de ganhar à medida que as cartas saem."
      ]
    ]
  },
  ro: {
    "title": "Tabel mâini de start poker — toate cele 169, în ordine | PokerTH",
    "desc": "Tabelul celor 169 de mâini de start la Texas Hold’em, după șansa de câștig contra unui, trei și șase adversari. Aceeași culoare sau nu, perechi, cea mai slabă mână.",
    "ldHeadline": "Tabelul mâinilor de start la Texas Hold’em: toate cele 169, în ordine",
    "ldDesc": "Cele 169 de mâini de start la Texas Hold’em, puse într-un tabel și ordonate după șansa de câștig contra uneia, trei și șase mâini aleatorii.",
    "h1": "Mâini de start la Texas Hold’em: toate cele 169, în ordine",
    "lead": "Cele două cărți proprii sunt prima decizie din fiecare mână. Există {combos} de moduri de a primi două cărți, dar doar 169 de mâini de start diferite dacă lași culorile deoparte. Pagina aceasta le pune pe toate într-un tabel, cu șansa lor de câștig, calculată simulând un milion de împărțiri pentru fiecare.",
    "chartH2": "Tabelul mâinilor de start",
    "chartP": "Perechile coboară pe diagonală. Deasupra ei sunt mâinile de aceeași culoare (s, ambele cărți de aceeași culoare), dedesubt mâinile de culori diferite (o). T înseamnă zece. Numărul din fiecare pătrat este șansa ca mâna să câștige contra unei mâini aleatorii când toate cele cinci cărți comune sunt împărțite, egalitatea fiind numărată ca jumătate de câștig; cu cât pătratul e mai verde, cu atât mâna e mai puternică.",
    "topH2": "Cele mai bune mâini de start",
    "topP": "Cele douăzeci de mâini cele mai puternice contra unui adversar și cum rezistă contra a trei și a șase:",
    "cols": [
      "Loc",
      "Mână",
      "1 adversar",
      "3 adversari",
      "6 adversari"
    ],
    "multiH2": "Mai mulți adversari, alte mâini",
    "multiP": "Orice mână câștigă mai rar pe măsură ce jucătorii intră în pot, dar nu în același ritm, așa că ordinea se schimbă. Așii în mână rămân în frunte: {aa1} unu la unu, încă {aa6} contra a șase adversari. Cărțile consecutive de aceeași culoare urcă, pentru că fac chinte și culori care câștigă poturi mari: șapte-șase de aceeași culoare trece de pe locul {r76s1} unu la unu pe locul {r76s6} contra a șase, valet-zece de aceeași culoare de pe {rjts1} pe {rjts6}. Perechile mijlocii coboară — perechea de șeptari cade de pe locul {r77_1} pe {r77_6} — la fel și mâinile de culori diferite cu o singură carte mare și un kicker slab, cum ar fi rege-șase de culori diferite, de pe {rk6o1} pe {rk6o6}.",
    "suitedH2": "De aceeași culoare sau de culori diferite?",
    "suitedP": "Două cărți de aceeași culoare valorează mai mult decât aceleași cărți de culori diferite — în medie cu aproximativ {suitGain} mai mult pe toate cele 78 de perechi de valori, de la {suitMin} la {suitMax} în funcție de mână. Contează, dar mai puțin decât pare: culorile sunt rare, iar o mână slabă de aceeași culoare rămâne o mână slabă.",
    "worstH2": "Cea mai slabă mână de start",
    "worstP": "Contra unei mâini aleatorii, trei-doi de culori diferite este cea mai slabă dintre toate, cu {w32}. Șapte-doi de culori diferite, numită adesea cea mai proastă mână din poker, câștigă {w72} și e pe locul {r72} din 169 unu la unu — dar contra a șase adversari e chiar ultima, pentru că cele două cărți ale ei sunt prea departe una de alta ca să formeze împreună o chintă și prea mici ca să câștige mare lucru altceva.",
    "countH2": "Cât de des primești fiecare tip",
    "countP": "Din cele {combos} de mâini posibile din două cărți, {pairCombos} sunt perechi ({pairPct}), {suitedCombos} sunt de aceeași culoare ({suitedPct}) și {offCombos} de culori diferite ({offPct}). Fiecare pereche poate fi împărțită în 6 moduri, fiecare mână de aceeași culoare în 4 moduri, fiecare mână de culori diferite în 12 moduri — de aceea vezi as-rege de culori diferite de trei ori mai des decât as-rege de aceeași culoare.",
    "useH2": "Cum folosești un asemenea tabel",
    "useP": "Un tabel ordonează mâinile după forța lor brută, înainte ca cineva să fi acționat. La o masă reală, joacă mai puține mâini din poziție timpurie, unde mulți jucători acționează după tine, și mai multe de pe buton și din cut-off. Fă Raise în loc de Call cu mâinile pe care le joci, dă Fold la mâinile din josul tabelului și ține minte că valoarea unei mâini depinde și de stive, de blinduri și de adversari. Într-un turneu PokerTH blindurile cresc mereu, așa că mâinile care merită jucate se înmulțesc pe măsură ce stivele se scurtează.",
    "faqH2": "Întrebări",
    "faq": [
      [
        "Care este cea mai bună mână de start la Texas Hold’em?",
        "Perechea de ași. Câștigă {aa1} contra unei mâini aleatorii și e favorită contra oricărei alte mâini de start."
      ],
      [
        "E as-rege mai bun decât o pereche de dame?",
        "Nu, dar e strâns: damele câștigă {qqak} contra lui as-rege de culori diferite. Contra unei mâini aleatorii, as-rege de aceeași culoare câștigă {aks1}, iar damele {qq1}."
      ],
      [
        "Câte mâini de start există?",
        "{combos} de combinații de două cărți, care dau 169 de mâini de start diferite: 13 perechi, 78 de aceeași culoare și 78 de culori diferite."
      ],
      [
        "Cât valorează o mână de aceeași culoare?",
        "În medie, cu aproximativ {suitGain} mai multă șansă de câștig decât aceeași mână de culori diferite."
      ],
      [
        "Unde pot exersa alegerea mâinilor de start?",
        "În modul de antrenament din PokerTH, contra adversarilor controlați de calculator, cu fila Șanse care îți arată șansa de câștig pe măsură ce apar cărțile."
      ]
    ]
  },
  ru: {
    "title": "Таблица стартовых рук в покере — все 169 рук по силе | PokerTH",
    "desc": "Все 169 стартовых рук Texas Hold’em в одной таблице, по шансу на победу против одного, трёх и шести соперников. Одномастные и разномастные, пары и худшая рука.",
    "ldHeadline": "Таблица стартовых рук Texas Hold’em: все 169 рук по силе",
    "ldDesc": "169 стартовых рук Texas Hold’em в таблице, упорядоченные по шансу на победу против одной, трёх и шести случайных рук.",
    "h1": "Стартовые руки в Texas Hold’em: все 169 по силе",
    "lead": "Две ваши карманные карты — первое решение в каждой раздаче. Получить две карты можно {combos} способами, но различных стартовых рук, если не учитывать масти, всего 169. На этой странице все они сведены в таблицу с шансом на победу, рассчитанным по миллиону смоделированных раздач для каждой.",
    "chartH2": "Таблица стартовых рук",
    "chartP": "Пары идут по диагонали. Над ней — одномастные руки (s, обе карты одной масти), под ней — разномастные (o). T означает десятку. Число в каждой клетке — шанс, что рука выиграет у одной случайной руки, когда выложены все пять общих карт; ничья считается за половину победы. Чем зеленее клетка, тем сильнее рука.",
    "topH2": "Лучшие стартовые руки",
    "topP": "Двадцать самых сильных рук против одного соперника и то, как они держатся против трёх и шести:",
    "cols": [
      "Место",
      "Рука",
      "1 соперник",
      "3 соперника",
      "6 соперников"
    ],
    "multiH2": "Больше соперников — другие руки",
    "multiP": "Каждая рука выигрывает реже, когда в банк входят новые игроки, но не в одинаковой мере, поэтому порядок меняется. Карманные тузы остаются на вершине: {aa1} в хедз-апе и всё ещё {aa6} против шести соперников. Одномастные коннекторы поднимаются, потому что собирают стриты и флеши, выигрывающие крупные банки: одномастные семь-шесть поднимаются с {r76s1}-го места в хедз-апе на {r76s6}-е против шести, одномастные валет-десять — с {rjts1}-го на {rjts6}-е. Средние пары опускаются — семёрки падают с {r77_1}-го места на {r77_6}-е, — как и разномастные руки с одной старшей картой и слабым кикером, например разномастные король-шесть: с {rk6o1}-го на {rk6o6}-е.",
    "suitedH2": "Одномастные или разномастные?",
    "suitedP": "Две карты одной масти стоят больше, чем те же карты разных мастей, — в среднем примерно на {suitGain} по всем 78 сочетаниям номиналов, от {suitMin} до {suitMax} в зависимости от руки. Это важно, но меньше, чем кажется: флеши собираются редко, а слабая одномастная рука остаётся слабой рукой.",
    "worstH2": "Худшая стартовая рука",
    "worstP": "Против одной случайной руки самая слабая из всех — разномастные три-два с {w32}. Разномастные семь-два, которые часто называют худшей рукой в покере, выигрывают {w72} и занимают {r72}-е место из 169 в хедз-апе — но против шести соперников они на самом последнем месте: их карты слишком далеко друг от друга, чтобы вместе собрать стрит, и слишком младшие, чтобы выиграть чем-то ещё.",
    "countH2": "Как часто приходит каждый тип руки",
    "countP": "Из {combos} возможных рук из двух карт {pairCombos} — пары ({pairPct}), {suitedCombos} — одномастные ({suitedPct}) и {offCombos} — разномастные ({offPct}). Каждая пара может прийти 6 способами, каждая одномастная рука — 4, каждая разномастная — 12, — вот почему разномастные туз-король приходят втрое чаще одномастных.",
    "useH2": "Как пользоваться такой таблицей",
    "useP": "Таблица ранжирует руки по чистой силе, до того как кто-либо начал действовать. За настоящим столом играйте меньше рук с ранних позиций, где после вас действуют многие игроки, и больше — с баттона и катоффа. Рейзите, а не коллируйте с теми руками, которые играете, сбрасывайте низ таблицы и помните, что ценность руки зависит также от стеков, блайндов и ваших соперников. В турнире PokerTH блайнды постоянно растут, поэтому по мере уменьшения стеков круг рук, которые стоит играть, расширяется.",
    "faqH2": "Вопросы",
    "faq": [
      [
        "Какая стартовая рука лучшая в Texas Hold’em?",
        "Карманные тузы. Они выигрывают {aa1} против одной случайной руки и остаются фаворитом против любой другой стартовой руки."
      ],
      [
        "Туз-король лучше пары дам?",
        "Нет, но разница невелика: дамы выигрывают {qqak} против разномастных туза-короля. Против одной случайной руки одномастные туз-король выигрывают {aks1}, а дамы — {qq1}."
      ],
      [
        "Сколько всего стартовых рук?",
        "{combos} комбинаций из двух карт, которые дают 169 различных стартовых рук: 13 пар, 78 одномастных и 78 разномастных."
      ],
      [
        "Насколько ценнее одномастная рука?",
        "В среднем её шанс на победу примерно на {suitGain} выше, чем у той же разномастной руки."
      ],
      [
        "Где потренироваться в выборе стартовых рук?",
        "В тренировочном режиме PokerTH против компьютерных соперников: вкладка «Шансы» показывает ваш шанс на победу по мере выхода карт."
      ]
    ]
  },
  si: {
    "title": "පෝකර් ආරම්භක අත් වගුව — අත් 169 ම ශ්‍රේණිගතව | PokerTH",
    "desc": "Texas Hold’em ආරම්භක අත් 169 ම එක වගුවක, ප්‍රතිවාදීන් 1, 3 සහ 6 ට එරෙහිව දිනීමේ අවස්ථාව අනුව ශ්‍රේණිගත කර. Suited හෝ offsuit, යුගල, සහ නරකම අත.",
    "ldHeadline": "Texas Hold’em ආරම්භක අත් වගුව: අත් 169 ම ශ්‍රේණිගතව",
    "ldDesc": "Texas Hold’em ආරම්භක අත් 169, වගුවක දක්වා, අහඹු අත් එකකට, තුනකට සහ හයකට එරෙහිව දිනීමේ අවස්ථාව අනුව ශ්‍රේණිගත කර.",
    "h1": "Texas Hold’em ආරම්භක අත්: 169 ම, ශ්‍රේණිගතව",
    "lead": "ඔබේ hole cards දෙක සෑම අතකම පළමු තීරණයයි. කාඩ් දෙකක් ලැබිය හැකි ක්‍රම {combos} ක් ඇති නමුත්, කාඩ් වර්ග පසෙක තැබූ විට වෙනස් ආරම්භක අත් ඇත්තේ 169 ක් පමණි. මෙම පිටුව ඒ සියල්ල දිනීමේ අවස්ථාව සමඟ වගුවක පෙන්වයි; එය එක් එක් අත සඳහා බෙදීම් මිලියනයක් අනුකරණය කර ගණනය කළකි.",
    "chartH2": "ආරම්භක අත් වගුව",
    "chartP": "යුගල විකර්ණය දිගේ පහළට යයි. ඊට ඉහළින් suited අත් (s, කාඩ් දෙකම එකම වර්ගයේ), ඊට පහළින් offsuit අත් (o) ඇත. T යනු දහයයි. සෑම කොටුවකම ඇති අංකය, බෝඩ් කාඩ් පහම බෙදූ විට එම අත එක් අහඹු අතකට එරෙහිව දිනීමේ අවස්ථාවයි, සම තත්ත්වය ජයක භාගයක් ලෙස ගණන් කර; කොටුව වඩාත් කොළ පාට වන තරමට, අත වඩාත් ශක්තිමත්ය.",
    "topH2": "හොඳම ආරම්භක අත්",
    "topP": "එක් ප්‍රතිවාදියෙකුට එරෙහිව ශක්තිමත්ම අත් විස්ස, සහ ඒවා තිදෙනෙකුට සහ හයදෙනෙකුට එරෙහිව ඔරොත්තු දෙන ආකාරය:",
    "cols": [
      "ශ්‍රේණිය",
      "අත",
      "ප්‍රතිවාදී 1",
      "ප්‍රතිවාදීන් 3",
      "ප්‍රතිවාදීන් 6"
    ],
    "multiH2": "වැඩි ප්‍රතිවාදීන්, වෙනස් අත්",
    "multiP": "ක්‍රීඩකයන් පොට් එකට එක් වන විට සෑම අතක්ම දිනන්නේ අඩුවෙනි, නමුත් එකම වේගයෙන් නොවේ, එබැවින් ශ්‍රේණිගත කිරීම වෙනස් වේ. ඒස් pocket pair එක ඉහළින්ම සිටී: heads-up හි {aa1}, ප්‍රතිවාදීන් හයදෙනෙකුට එරෙහිවත් තවමත් {aa6}. Suited connectors ඉහළ නගී, මන්ද ඒවා විශාල පොට් දිනන Straight සහ Flush සාදයි: හත-හය suited heads-up හි {r76s1} වන ස්ථානයේ සිට හයදෙනෙකුට එරෙහිව {r76s6} වන ස්ථානයට යයි, ජැක්-දහය suited {rjts1} සිට {rjts6} දක්වා. මධ්‍යම යුගල පහළ වැටේ — හත යුගලය {r77_1} සිට {r77_6} දක්වා — එක් ඉහළ කාඩ් එකක් සහ දුර්වල kicker එකක් ඇති offsuit අත් ද එසේමය, උදාහරණයක් ලෙස කිං-හය offsuit, {rk6o1} සිට {rk6o6} දක්වා.",
    "suitedH2": "Suited ද offsuit ද?",
    "suitedP": "එකම වර්ගයේ කාඩ් දෙකක්, එම කාඩ්ම offsuit වූ විටට වඩා වටිනවා — ශ්‍රේණි යුගල 78 ම පුරා සාමාන්‍යයෙන් {suitGain} ක් පමණ වැඩියෙන්, අත අනුව {suitMin} සිට {suitMax} දක්වා. එය වැදගත් වුවත්, පෙනෙන තරම් නොවේ: Flush ලැබෙන්නේ කලාතුරකිනි, දුර්වල suited අතක් තවමත් දුර්වල අතකි.",
    "worstH2": "නරකම ආරම්භක අත",
    "worstP": "එක් අහඹු අතකට එරෙහිව, තුන-දෙක offsuit {w32} සමඟ සියල්ලටම වඩා දුර්වලයි. පෝකර්වල නරකම අත ලෙස බොහෝ විට හඳුන්වන හත-දෙක offsuit {w72} දිනන අතර heads-up හි 169 න් {r72} වන ස්ථානයේ සිටී — නමුත් ප්‍රතිවාදීන් හයදෙනෙකුට එරෙහිව එය සම්පූර්ණයෙන්ම අන්තිමයි, මන්ද එහි කාඩ් දෙක එකට Straight එකක් සෑදීමට නොහැකි තරම් එකිනෙකින් දුරස්ථ වන අතර, වෙනත් බොහෝ දේ දිනීමට නොහැකි තරම් පහත් ය.",
    "countH2": "එක් එක් වර්ගය ඔබට ලැබෙන වාර ගණන",
    "countP": "හැකි කාඩ් දෙකේ අත් {combos} න්, {pairCombos} ක් යුගල ({pairPct}), {suitedCombos} ක් suited ({suitedPct}) සහ {offCombos} ක් offsuit ({offPct}) වේ. සෑම යුගලයක්ම ක්‍රම 6 කින්, සෑම suited අතක්ම ක්‍රම 4 කින්, සෑම offsuit අතක්ම ක්‍රම 12 කින් බෙදිය හැක — ඒ නිසා ඔබට ඒස්-කිං offsuit ලැබෙන්නේ ඒස්-කිං suited මෙන් තුන් ගුණයක් වාරයකි.",
    "useH2": "මෙවැනි වගුවක් භාවිත කරන්නේ කෙසේද",
    "useP": "වගුවක් කිසිවෙකු ක්‍රියා කිරීමට පෙර, අමු ශක්තිය අනුව අත් ශ්‍රේණිගත කරයි. සැබෑ මේසයකදී, ඔබට පසුව බොහෝ ක්‍රීඩකයන් ක්‍රියා කරන මුල් ස්ථානයේ සිට අඩු අත් ප්‍රමාණයක් ද, බොත්තමේ සහ cut-off ස්ථානයේ සිට වැඩි අත් ප්‍රමාණයක් ද ක්‍රීඩා කරන්න. ඔබ ක්‍රීඩා කරන අත් සමඟ Call කරනවාට වඩා Raise කරන්න, වගුවේ පහළ කොටස Fold කරන්න, සහ අතක වටිනාකම ස්ටැක්, බ්ලයින්ඩ් සහ ඔබේ ප්‍රතිවාදීන් මත ද රඳා පවතින බව මතක තබා ගන්න. PokerTH තරඟාවලියක බ්ලයින්ඩ් දිගටම ඉහළ යන බැවින්, ස්ටැක් කෙටි වන විට ක්‍රීඩා කිරීමට වටින අත් පරාසය පුළුල් වේ.",
    "faqH2": "ප්‍රශ්න",
    "faq": [
      [
        "Texas Hold’em හි හොඳම ආරම්භක අත කුමක්ද?",
        "ඒස් pocket pair එක. එය එක් අහඹු අතකට එරෙහිව {aa1} දිනන අතර, අනෙක් සෑම ආරම්භක අතකටම එරෙහිව ජයග්‍රහණයට වැඩි ඉඩක් ඇත්තේ එයටයි."
      ],
      [
        "ඒස්-කිං ක්වීන් යුගලයකට වඩා හොඳද?",
        "නැත, නමුත් ඉතා සමීපයි: ක්වීන් යුගලය ඒස්-කිං offsuit එදිරිව {qqak} දිනයි. එක් අහඹු අතකට එරෙහිව ඒස්-කිං suited {aks1} ද ක්වීන් යුගලය {qq1} ද දිනයි."
      ],
      [
        "ආරම්භක අත් කීයක් තිබේද?",
        "කාඩ් දෙකේ සංයෝජන {combos} ක්, ඒවා වෙනස් ආරම්භක අත් 169 ක් සාදයි: යුගල 13 ක්, suited 78 ක් සහ offsuit 78 ක්."
      ],
      [
        "Suited අතක වටිනාකම කොපමණද?",
        "සාමාන්‍යයෙන්, එම අතම offsuit වූ විටට වඩා දිනීමේ අවස්ථාව {suitGain} ක් පමණ වැඩියි."
      ],
      [
        "ආරම්භක අත් තෝරාගැනීම පුහුණු විය හැක්කේ කොතැනද?",
        "පරිගණක ප්‍රතිවාදීන්ට එරෙහිව PokerTH හි පුහුණු ප්‍රකාරයේ; කාඩ් එළියට එන විට සම්භාවිතා ටැබය ඔබේ ජය ගැනීමේ අවස්ථාව පෙන්වයි."
      ]
    ]
  },
  sk: {
    "title": "Tabuľka štartovacích rúk — poradie všetkých 169 rúk | PokerTH",
    "desc": "Všetkých 169 štartovacích rúk Texas Hold’em v jednej tabuľke, zoradených podľa šance na výhru proti jednému, trom a šiestim súperom. Farby, páry a najhoršia ruka.",
    "ldHeadline": "Tabuľka štartovacích rúk Texas Hold’em: poradie všetkých 169 rúk",
    "ldDesc": "169 štartovacích rúk Texas Hold’em v tabuľke, zoradených podľa šance na výhru proti jednej, trom a šiestim náhodným rukám.",
    "h1": "Štartovacie ruky v Texas Hold’em: všetkých 169 podľa poradia",
    "lead": "Vaše dve vlastné karty sú prvým rozhodnutím každého rozdania. Dve karty môžete dostať {combos} spôsobmi, no ak odhliadneme od farieb, existuje len 169 rôznych štartovacích rúk. Táto stránka ich všetky zobrazuje v tabuľke so šancou na výhru, vypočítanou simuláciou milióna rozdaní pre každú z nich.",
    "chartH2": "Tabuľka štartovacích rúk",
    "chartP": "Páry vedú po uhlopriečke. Nad ňou sú ruky v rovnakej farbe (s, obe karty rovnakej farby), pod ňou ruky v rôznych farbách (o). T znamená desiatku. Číslo v každom políčku je šanca, že ruka vyhrá proti jednej náhodnej ruke, keď sa rozdá všetkých päť kariet na stôl, pričom remíza sa počíta ako polovičná výhra; čím zelenšie políčko, tým silnejšia ruka.",
    "topH2": "Najlepšie štartovacie ruky",
    "topP": "Dvadsať najsilnejších rúk proti jednému súperovi a ako obstoja proti trom a šiestim:",
    "cols": [
      "Poradie",
      "Ruka",
      "1 súper",
      "3 súperi",
      "6 súperov"
    ],
    "multiH2": "Viac súperov, iné ruky",
    "multiP": "Každá ruka vyhráva menej často, keď do banku vstupujú ďalší hráči, no nie rovnakým tempom, a tak sa poradie mení. Esá v ruke zostávajú na vrchole: {aa1} v hre jeden na jedného, stále {aa6} proti šiestim súperom. Nadväzujúce karty v rovnakej farbe stúpajú, pretože tvoria postupky a farby, ktoré vyhrávajú veľké banky: sedmička so šestkou v rovnakej farbe sa posunie z miesta {r76s1} v hre jeden na jedného na miesto {r76s6} proti šiestim, dolník s desiatkou v rovnakej farbe z {rjts1} na {rjts6}. Stredné páry klesajú — sedmičky padnú z miesta {r77_1} na {r77_6} — a rovnako aj ruky v rôznych farbách s jednou vysokou kartou a slabým kickerom, napríklad kráľ so šestkou v rôznych farbách, z {rk6o1} na {rk6o6}.",
    "suitedH2": "Rovnaká farba, alebo rôzne farby?",
    "suitedP": "Dve karty rovnakej farby majú vyššiu hodnotu než tie isté karty v rôznych farbách — v priemere približne o {suitGain} naprieč všetkými 78 dvojicami hodnôt, od {suitMin} do {suitMax} podľa ruky. Má to význam, ale menší, než sa zdá: farba ako kombinácia je zriedkavá a slabá ruka v rovnakej farbe je stále slabá ruka.",
    "worstH2": "Najhoršia štartovacia ruka",
    "worstP": "Proti jednej náhodnej ruke je trojka s dvojkou v rôznych farbách s výsledkom {w32} najslabšia zo všetkých. Sedmička s dvojkou v rôznych farbách, často označovaná za najhoršiu ruku v pokri, vyhráva {w72} a v hre jeden na jedného je na mieste {r72} zo 169 — no proti šiestim súperom je úplne posledná, pretože jej dve karty sú od seba príliš ďaleko, aby spolu vytvorili postupku, a príliš nízke na to, aby vyhrali veľa iného.",
    "countH2": "Ako často dostanete ktorý typ",
    "countP": "Z {combos} možných rúk z dvoch kariet je {pairCombos} párov ({pairPct}), {suitedCombos} v rovnakej farbe ({suitedPct}) a {offCombos} v rôznych farbách ({offPct}). Každý pár sa dá rozdať 6 spôsobmi, každá ruka v rovnakej farbe 4 spôsobmi a každá ruka v rôznych farbách 12 spôsobmi — preto vidíte eso s kráľom v rôznych farbách trikrát častejšie než eso s kráľom v rovnakej farbe.",
    "useH2": "Ako používať takúto tabuľku",
    "useP": "Tabuľka zoraďuje ruky podľa čistej sily, skôr než ktokoľvek konal. Pri skutočnom stole hrajte menej rúk zo skorej pozície, kde po vás koná veľa hráčov, a viac z buttonu a cut-offu. S rukami, ktoré hráte, radšej zvyšujte (Raise), než dorovnávajte (Call), ruky zo spodku tabuľky zahoďte (Fold) a pamätajte, že hodnota ruky závisí aj od stackov, blindov a vašich súperov. V turnaji PokerTH blindy stále rastú, takže okruh rúk, ktoré sa oplatí hrať, sa rozširuje, keď sa stacky zmenšujú.",
    "faqH2": "Otázky",
    "faq": [
      [
        "Aká je najlepšia štartovacia ruka v Texas Hold’em?",
        "Esá v ruke. Proti jednej náhodnej ruke vyhrávajú {aa1} a sú favoritom proti každej inej štartovacej ruke."
      ],
      [
        "Je eso s kráľom lepšie ako pár dám?",
        "Nie, ale je to tesné: dámy vyhrávajú {qqak} proti esu s kráľom v rôznych farbách. Proti jednej náhodnej ruke vyhráva eso s kráľom v rovnakej farbe {aks1} a dámy {qq1}."
      ],
      [
        "Koľko je štartovacích rúk?",
        "{combos} kombinácií dvoch kariet, ktoré tvoria 169 rôznych štartovacích rúk: 13 párov, 78 v rovnakej farbe a 78 v rôznych farbách."
      ],
      [
        "Akú hodnotu má ruka v rovnakej farbe?",
        "V priemere približne o {suitGain} vyššiu šancu na výhru než tá istá ruka v rôznych farbách."
      ],
      [
        "Kde si môžem precvičiť výber štartovacích rúk?",
        "V tréningovom režime PokerTH proti počítačovým súperom, s kartou Šance, ktorá ukazuje vašu šancu na výhru, ako prichádzajú karty."
      ]
    ]
  },
  sl: {
    "title": "Tabela začetnih rok v pokru — vseh 169 po moči | PokerTH",
    "desc": "Vseh 169 začetnih rok Texas Hold’ema v tabeli, razvrščenih po možnosti za zmago proti enemu, trem in šestim nasprotnikom. Iste ali mešane barve, pari, najslabša roka.",
    "ldHeadline": "Tabela začetnih rok v Texas Hold’emu: vseh 169 rok po moči",
    "ldDesc": "169 začetnih rok Texas Hold’ema, prikazanih v tabeli in razvrščenih po možnosti za zmago proti eni, trem in šestim naključnim rokam.",
    "h1": "Začetne roke v Texas Hold’emu: vseh 169 po moči",
    "lead": "Tvoji dve karti v žepu sta prva odločitev vsake roke. Dve karti lahko dobiš na {combos} načinov, a če barve odmisliš, je različnih začetnih rok le 169. Ta stran jih prikaže vse v tabeli z možnostjo za zmago, izračunano s simulacijo milijona delitev za vsako.",
    "chartH2": "Tabela začetnih rok",
    "chartP": "Pari tečejo po diagonali. Nad njo so roke iste barve (s, obe karti iste barve), pod njo roke mešanih barv (o). T pomeni desetko. Število v vsakem polju je možnost, da roka zmaga proti eni naključni roki, ko je razdeljenih vseh pet kart na mizi, pri čemer izenačenje šteje kot pol zmage; bolj ko je polje zeleno, močnejša je roka.",
    "topH2": "Najboljše začetne roke",
    "topP": "Dvajset najmočnejših rok proti enemu nasprotniku in kako se odrežejo proti trem in šestim:",
    "cols": [
      "Mesto",
      "Roka",
      "1 nasprotnik",
      "3 nasprotniki",
      "6 nasprotnikov"
    ],
    "multiH2": "Več nasprotnikov, druge roke",
    "multiP": "Vsaka roka zmaga redkeje, ko se banki pridružijo novi igralci, a ne enako hitro, zato se vrstni red spremeni. Par asov ostane na vrhu: {aa1} ena na ena, še vedno {aa6} proti šestim nasprotnikom. Zaporedniki iste barve se vzpnejo, ker sestavijo straighte in flushe, ki osvojijo velike banke: sedem-šest iste barve se z mesta {r76s1} ena na ena povzpne na mesto {r76s6} proti šestim, fant-deset iste barve z mesta {rjts1} na {rjts6}. Srednji pari zdrsnejo — sedmice padejo z mesta {r77_1} na {r77_6} — prav tako roke mešanih barv z eno visoko karto in šibkim kickerjem, kot je kralj-šest mešanih barv, z mesta {rk6o1} na {rk6o6}.",
    "suitedH2": "Iste ali mešane barve?",
    "suitedP": "Dve karti iste barve sta vredni več kot enaki karti mešanih barv — v povprečju za približno {suitGain} več na vseh 78 parih vrednosti, od {suitMin} do {suitMax}, odvisno od roke. To šteje, a manj, kot se zdi: flushi so redki in šibka roka iste barve je še vedno šibka roka.",
    "worstH2": "Najslabša začetna roka",
    "worstP": "Proti eni naključni roki je tri-dva mešanih barv najšibkejša od vseh: zmaga v {w32}. Sedem-dva mešanih barv, ki ji pogosto pravijo najslabša roka v pokru, zmaga v {w72} in je ena na ena na mestu {r72} od 169 — a proti šestim nasprotnikom je čisto zadnja, ker sta njeni karti predaleč narazen, da bi skupaj sestavili straight, in prenizki, da bi osvojili kaj drugega.",
    "countH2": "Kako pogosto dobiš posamezno vrsto rok",
    "countP": "Od {combos} možnih rok z dvema kartama je {pairCombos} parov ({pairPct}), {suitedCombos} rok iste barve ({suitedPct}) in {offCombos} rok mešanih barv ({offPct}). Vsak par je mogoče razdeliti na 6 načinov, vsako roko iste barve na 4 načine, vsako roko mešanih barv na 12 načinov — zato as-kralja mešanih barv vidiš trikrat pogosteje kot as-kralja iste barve.",
    "useH2": "Kako uporabljati takšno tabelo",
    "useP": "Tabela razvršča roke po goli moči, preden je kdor koli ukrepal. Za pravo mizo igraj manj rok iz zgodnjega položaja, kjer za tabo ukrepa veliko igralcev, in več z gumba in cut-offa. Z rokami, ki jih igraš, raje zvišaj kot plačaj, odstopi z rokami z dna tabele in ne pozabi, da je vrednost roke odvisna tudi od kupov žetonov, blindov in tvojih nasprotnikov. Na turnirju PokerTH se blindi ves čas zvišujejo, zato se nabor rok, vrednih igranja, širi, ko kupi žetonov kopnijo.",
    "faqH2": "Vprašanja",
    "faq": [
      [
        "Katera je najboljša začetna roka v Texas Hold’emu?",
        "Par asov. Proti eni naključni roki zmaga v {aa1} in je favorit proti vsaki drugi začetni roki."
      ],
      [
        "Je as-kralj boljši od para dam?",
        "Ne, a je tesno: dame zmagajo proti as-kralju mešanih barv v {qqak}. Proti eni naključni roki as-kralj iste barve zmaga v {aks1}, dame pa v {qq1}."
      ],
      [
        "Koliko je začetnih rok?",
        "{combos} kombinacij dveh kart, ki dajo 169 različnih začetnih rok: 13 parov, 78 rok iste barve in 78 rok mešanih barv."
      ],
      [
        "Koliko je vredna roka iste barve?",
        "V povprečju približno {suitGain} večjo možnost za zmago kot ista roka mešanih barv."
      ],
      [
        "Kje lahko vadim izbiro začetnih rok?",
        "V načinu vadbe v PokerTH proti računalniškim nasprotnikom, z zavihkom Kvote, ki prikazuje tvojo možnost za zmago, ko se karte razkrivajo."
      ]
    ]
  },
  sq: {
    "title": "Tabela e duarve fillestare në poker — renditja e 169 duarve | PokerTH",
    "desc": "Të 169 duart fillestare të Texas Hold’em në tabelë, të renditura sipas shansit për të fituar kundër një, tre e gjashtë kundërshtarëve. Boja, çiftet, dora më e keqe.",
    "ldHeadline": "Tabela e duarve fillestare në Texas Hold’em: të 169 duart të renditura",
    "ldDesc": "169 duart fillestare të Texas Hold’em, në tabelë dhe të renditura sipas shansit për të fituar kundër një, tre dhe gjashtë duarve të rastësishme.",
    "h1": "Duart fillestare në Texas Hold’em: të 169, të renditura",
    "lead": "Dy letrat e tua private janë vendimi i parë i çdo dore. Ka {combos} mënyra për të marrë dy letra, por vetëm 169 duar fillestare të ndryshme kur bojërat lihen mënjanë. Kjo faqe i paraqet të gjitha në tabelë me shansin e tyre për të fituar, të llogaritur duke simuluar një milion shpërndarje për secilën.",
    "chartH2": "Tabela e duarve fillestare",
    "chartP": "Çiftet zbresin përgjatë diagonales. Mbi të janë duart me të njëjtën bojë (s, të dyja letrat e së njëjtës bojë), poshtë saj duart me bojë të ndryshme (o). T do të thotë dhjetë. Numri në çdo kuti është shansi që dora të fitojë kundër një dore të rastësishme kur shpërndahen të pesë letrat e tavolinës, ku barazimi numërohet si gjysmë fitoreje; sa më e gjelbër kutia, aq më e fortë dora.",
    "topH2": "Duart fillestare më të mira",
    "topP": "Njëzet duart më të forta kundër një kundërshtari, dhe si qëndrojnë kundër tre dhe kundër gjashtë:",
    "cols": [
      "Renditja",
      "Dora",
      "1 kundërshtar",
      "3 kundërshtarë",
      "6 kundërshtarë"
    ],
    "multiH2": "Më shumë kundërshtarë, duar të tjera",
    "multiP": "Çdo dorë fiton më rrallë ndërsa lojtarët hyjnë në bankë, por jo me të njëjtin ritëm, prandaj renditja ndryshon. Çifti privat i asëve mbetet në krye: {aa1} një-me-një dhe ende {aa6} kundër gjashtë kundërshtarëve. Letrat e lidhura me të njëjtën bojë ngjiten, sepse bëjnë straight dhe flush që fitojnë banka të mëdha: shtatë-gjashtë me të njëjtën bojë kalon nga vendi {r76s1} një-me-një në vendin {r76s6} kundër gjashtë, fant-dhjetë me të njëjtën bojë nga {rjts1} në {rjts6}. Çiftet e mesme bien — shtatat zbresin nga vendi {r77_1} në {r77_6} — dhe po ashtu duart me bojë të ndryshme me një letër të lartë dhe kicker të dobët, si mbret-gjashtë me bojë të ndryshme, nga {rk6o1} në {rk6o6}.",
    "suitedH2": "E njëjta bojë apo bojë të ndryshme?",
    "suitedP": "Dy letra të së njëjtës bojë vlejnë më shumë se të njëjtat letra me bojë të ndryshme — mesatarisht rreth {suitGain} më shumë në të 78 kombinimet e dy vlerave të ndryshme, nga {suitMin} deri në {suitMax} sipas dorës. Ka rëndësi, por më pak nga ç’duket: flush-i është i rrallë, dhe një dorë e dobët me të njëjtën bojë mbetet dorë e dobët.",
    "worstH2": "Dora fillestare më e keqe",
    "worstP": "Kundër një dore të rastësishme, tre-dy me bojë të ndryshme është më e dobëta nga të gjitha, me {w32}. Shtatë-dy me bojë të ndryshme, që shpesh quhet dora më e keqe në poker, fiton {w72} dhe renditet në vendin {r72} nga 169 në lojë një-me-një — por kundër gjashtë kundërshtarëve është e fundit fare, sepse dy letrat e saj janë shumë larg njëra-tjetrës për të bërë bashkë një straight dhe shumë të ulëta për të fituar me shumë gjëra të tjera.",
    "countH2": "Sa shpesh të bie secili lloj",
    "countP": "Nga {combos} duart e mundshme me dy letra, {pairCombos} janë çifte ({pairPct}), {suitedCombos} janë me të njëjtën bojë ({suitedPct}) dhe {offCombos} me bojë të ndryshme ({offPct}). Çdo çift mund të të bjerë në 6 mënyra, çdo dorë me të njëjtën bojë në 4 mënyra, çdo dorë me bojë të ndryshme në 12 mënyra — prandaj as-mbretin me bojë të ndryshme e sheh tri herë më shpesh se as-mbretin me të njëjtën bojë.",
    "useH2": "Si ta përdorësh një tabelë të tillë",
    "useP": "Një tabelë i rendit duart sipas forcës së tyre të pastër, para se dikush të ketë vepruar. Në një tavolinë të vërtetë, luaj më pak duar nga pozicionet e hershme, ku shumë lojtarë veprojnë pas teje, dhe më shumë nga butoni dhe cut-off-i. Me duart që luan, rrit në vend që të paguash, braktis duart në fund të tabelës dhe mbaj mend se vlera e një dore varet edhe nga madhësia e stokut, blindet dhe kundërshtarët e tu. Në një turne PokerTH blindet rriten vazhdimisht, kështu që duart që ia vlen të luhen shtohen ndërsa stoku shkurtohet.",
    "faqH2": "Pyetje",
    "faq": [
      [
        "Cila është dora fillestare më e mirë në Texas Hold’em?",
        "Çifti privat i asëve. Fiton {aa1} kundër një dore të rastësishme dhe është favorit kundër çdo dore tjetër fillestare."
      ],
      [
        "A është as-mbret më i mirë se një çift damash?",
        "Jo, por është afër: damat fitojnë {qqak} kundër as-mbretit me bojë të ndryshme. Kundër një dore të rastësishme, as-mbret me të njëjtën bojë fiton {aks1} dhe damat {qq1}."
      ],
      [
        "Sa duar fillestare ka?",
        "{combos} kombinime me dy letra, që bëjnë 169 duar fillestare të ndryshme: 13 çifte, 78 me të njëjtën bojë dhe 78 me bojë të ndryshme."
      ],
      [
        "Sa vlen një dorë me të njëjtën bojë?",
        "Mesatarisht rreth {suitGain} më shumë shans për të fituar se e njëjta dorë me bojë të ndryshme."
      ],
      [
        "Ku mund ta praktikoj zgjedhjen e duarve fillestare?",
        "Në modalitetin e stërvitjes të PokerTH kundër kundërshtarëve të kompjuterit, me skedën Shanset që tregon shansin tënd për të fituar ndërsa dalin letrat."
      ]
    ]
  },
  sr: {
    "title": "Табела почетних руку у покеру — свих 169 по јачини | PokerTH",
    "desc": "Свих 169 почетних руку у Texas Hold’em-у у једној табели, поређаних по шанси за победу против једног, три и шест противника. Исте боје или не, парови и најгора рука.",
    "ldHeadline": "Табела почетних руку у Texas Hold’em-у: свих 169 руку по јачини",
    "ldDesc": "169 почетних руку у Texas Hold’em-у, у табели и поређаних по шанси за победу против једне, три и шест насумичних руку.",
    "h1": "Почетне руке у Texas Hold’em-у: свих 169, по јачини",
    "lead": "Ваше две затворене карте прва су одлука у свакој руци. Постоји {combos} начина да добијете две карте, али само 169 различитих почетних руку када се боје занемаре. Ова страница их све приказује у табели са шансом за победу, израчунатом симулацијом милион дељења за сваку.",
    "chartH2": "Табела почетних руку",
    "chartP": "Парови иду дуж дијагонале. Изнад ње су руке исте боје (s, обе карте исте боје), испод руке различитих боја (o). T значи десетка. Број у сваком пољу је шанса да рука победи једну насумичну руку када се поделе свих пет карата на столу, при чему се нерешено рачуна као пола победе; што је поље зеленије, рука је јача.",
    "topH2": "Најбоље почетне руке",
    "topP": "Двадесет најјачих руку против једног противника и како се држе против три и шест:",
    "cols": [
      "Ранг",
      "Рука",
      "1 противник",
      "3 противника",
      "6 противника"
    ],
    "multiH2": "Више противника, друге руке",
    "multiP": "Свака рука побеђује ређе како се играчи укључују у пот, али не истим темпом, па се поредак мења. Пар асова остаје на врху: {aa1} један на један, и даље {aa6} против шест противника. Узастопне карте исте боје напредују, јер праве кенте и флешеве који освајају велике потове: седам-шест исте боје иде са {r76s1}. места један на један на {r76s6}. место против шест противника, жандар-десет исте боје са {rjts1}. на {rjts6}. место. Средњи парови падају — седмице падају са {r77_1}. на {r77_6}. место — као и руке различитих боја са једном високом картом и слабим кикером, попут краљ-шест различитих боја, са {rk6o1}. на {rk6o6}. место.",
    "suitedH2": "Исте боје или различитих боја?",
    "suitedP": "Две карте исте боје вреде више од истих карата различитих боја — у просеку око {suitGain} више у свих 78 парова вредности, од {suitMin} до {suitMax} у зависности од руке. То је важно, али мање него што изгледа: флешеви су ретки, а слаба рука исте боје и даље је слаба рука.",
    "worstH2": "Најгора почетна рука",
    "worstP": "Против једне насумичне руке, три-два различитих боја најслабија је од свих, са {w32}. Седам-два различитих боја, која се често назива најгором руком у покеру, побеђује у {w72} случајева и један на један заузима {r72}. место од 169 — али против шест противника је сасвим последња, јер су јој две карте превише удаљене да би заједно направиле кенту и прениске да би освојиле много шта друго.",
    "countH2": "Колико често добијате коју врсту",
    "countP": "Од {combos} могућих руку од две карте, {pairCombos} су парови ({pairPct}), {suitedCombos} су исте боје ({suitedPct}), а {offCombos} различитих боја ({offPct}). Сваки пар може да се подели на 6 начина, свака рука исте боје на 4, а свака рука различитих боја на 12 начина — зато ас-краља различитих боја добијате три пута чешће него ас-краља исте боје.",
    "useH2": "Како користити овакву табелу",
    "useP": "Табела ређа руке по сировој снази, пре него што је ико одиграо потез. За правим столом играјте мање руку из ране позиције, где много играча игра после вас, а више са дугмета и кат-офа. Са рукама које играте радије играјте Raise него Call, руке са дна табеле одбаците са Fold, и запамтите да вредност руке зависи и од стекова, улога и ваших противника. На PokerTH турниру улози стално расту, па се круг руку које вреди играти шири како стекови постају кратки.",
    "faqH2": "Питања",
    "faq": [
      [
        "Која је најбоља почетна рука у Texas Hold’em-у?",
        "Пар асова у руци. Против једне насумичне руке побеђује у {aa1} случајева и фаворит је против сваке друге почетне руке."
      ],
      [
        "Да ли је ас-краљ бољи од пара дама?",
        "Није, али разлика је мала: даме побеђују у {qqak} случајева против ас-краља различитих боја. Против једне насумичне руке ас-краљ исте боје побеђује у {aks1}, а даме у {qq1} случајева."
      ],
      [
        "Колико има почетних руку?",
        "{combos} комбинација од две карте, које чине 169 различитих почетних руку: 13 парова, 78 исте боје и 78 различитих боја."
      ],
      [
        "Колико вреди рука исте боје?",
        "У просеку око {suitGain} већу шансу за победу од исте руке различитих боја."
      ],
      [
        "Где могу да вежбам избор почетних руку?",
        "У режиму вежбања у PokerTH-у против рачунарских противника, уз картицу Шансе која приказује вашу шансу за победу како карте излазе."
      ]
    ]
  },
  sv: {
    "title": "Starthandstabell i poker — alla 169 händer rankade | PokerTH",
    "desc": "Alla 169 starthänder i Texas Hold’em i en tabell, rankade efter vinstchans mot en, tre och sex motståndare. Samma färg eller olika färger, par och den sämsta handen.",
    "ldHeadline": "Starthandstabell för Texas Hold’em: alla 169 händer rankade",
    "ldDesc": "De 169 starthänderna i Texas Hold’em i en tabell, rankade efter sin chans att vinna mot en, tre och sex slumpmässiga händer.",
    "h1": "Starthänder i Texas Hold’em: alla 169, rankade",
    "lead": "Dina två hålkort är det första beslutet i varje hand. Det finns {combos} sätt att få två kort, men bara 169 olika starthänder när man bortser från färgerna. Den här sidan visar alla i en tabell med deras chans att vinna, uträknad genom att simulera en miljon givar för var och en.",
    "chartH2": "Tabellen över starthänder",
    "chartP": "Paren löper längs diagonalen. Ovanför den finns händerna i samma färg (s, båda korten i samma färg), nedanför händerna i olika färger (o). T står för tio. Talet i varje ruta är chansen att handen vinner mot en slumpmässig hand när alla fem bordskort delas ut, där delad pott räknas som en halv vinst; ju grönare ruta, desto starkare hand.",
    "topH2": "De bästa starthänderna",
    "topP": "De tjugo starkaste händerna mot en motståndare, och hur de klarar sig mot tre och sex:",
    "cols": [
      "Plats",
      "Hand",
      "1 motståndare",
      "3 motståndare",
      "6 motståndare"
    ],
    "multiH2": "Fler motståndare, andra händer",
    "multiP": "Varje hand vinner mer sällan när fler spelare går med i potten, men inte i samma takt, så rankningen ändras. Ett par ess ligger kvar i topp: {aa1} en mot en, fortfarande {aa6} mot sex motståndare. Kort i följd i samma färg klättrar, eftersom de ger stegar och färger som vinner stora pottar: sju-sex i samma färg går från plats {r76s1} en mot en till plats {r76s6} mot sex, knekt-tio i samma färg från {rjts1} till {rjts6}. Mellanpar faller — sjuor rasar från plats {r77_1} till {r77_6} — och det gör även händer i olika färger med ett högt kort och en svag kicker, som kung-sex i olika färger, från {rk6o1} till {rk6o6}.",
    "suitedH2": "Samma färg eller olika färger?",
    "suitedP": "Två kort i samma färg är värda mer än samma kort i olika färger — i genomsnitt ungefär {suitGain} mer över alla 78 valörpar, från {suitMin} till {suitMax} beroende på handen. Det spelar roll, men mindre än det verkar: färger är sällsynta, och en svag hand i samma färg är fortfarande en svag hand.",
    "worstH2": "Den sämsta starthanden",
    "worstP": "Mot en slumpmässig hand är tre-två i olika färger svagast av alla med {w32}. Sju-två i olika färger, ofta kallad den sämsta handen i poker, vinner {w72} och hamnar på plats {r72} av 169 en mot en — men mot sex motståndare är den allra sist, eftersom de två korten ligger för långt ifrån varandra för att bilda en stege tillsammans och är för låga för att vinna mycket annat.",
    "countH2": "Hur ofta du får varje sort",
    "countP": "Av de {combos} möjliga tvåkortshänderna är {pairCombos} par ({pairPct}), {suitedCombos} i samma färg ({suitedPct}) och {offCombos} i olika färger ({offPct}). Varje par kan delas ut på 6 sätt, varje hand i samma färg på 4 sätt och varje hand i olika färger på 12 sätt — därför får du ess-kung i olika färger tre gånger så ofta som ess-kung i samma färg.",
    "useH2": "Så använder du en sådan tabell",
    "useP": "En tabell rankar händer efter ren styrka, innan någon har agerat. Vid ett riktigt bord spelar du färre händer från tidig position, där många spelare agerar efter dig, och fler från knappen och cut-off. Höj hellre än syna med de händer du spelar, lägg dig med botten av tabellen, och kom ihåg att en hands värde också beror på stackarna, mörkarna och dina motståndare. I en PokerTH-turnering höjs mörkarna hela tiden, så fler händer blir värda att spela när stackarna krymper.",
    "faqH2": "Frågor",
    "faq": [
      [
        "Vilken är den bästa starthanden i Texas Hold’em?",
        "Ett par ess. De vinner {aa1} mot en slumpmässig hand och är favorit mot varje annan starthand."
      ],
      [
        "Är ess-kung bättre än ett par damer?",
        "Nej, men det är jämnt: damer vinner {qqak} mot ess-kung i olika färger. Mot en slumpmässig hand vinner ess-kung i samma färg {aks1} och damer {qq1}."
      ],
      [
        "Hur många starthänder finns det?",
        "{combos} tvåkortskombinationer, som ger 169 olika starthänder: 13 par, 78 i samma färg och 78 i olika färger."
      ],
      [
        "Hur mycket är en hand i samma färg värd?",
        "I genomsnitt ungefär {suitGain} högre vinstchans än samma hand i olika färger."
      ],
      [
        "Var kan jag öva på att välja starthänder?",
        "I PokerTH:s träningsläge mot datormotståndare, med fliken Chanser som visar din chans att vinna allteftersom korten kommer."
      ]
    ]
  },
  sw: {
    "title": "Jedwali la mikono ya kuanzia ya poka — yote 169 kwa daraja | PokerTH",
    "desc": "Mikono 169 ya kuanzia ya Texas Hold’em kwenye jedwali, kwa daraja la nafasi ya kushinda dhidi ya wapinzani 1, 3 na 6. Rangi moja au tofauti, jozi, mkono mbaya zaidi.",
    "ldHeadline": "Jedwali la mikono ya kuanzia ya Texas Hold’em: yote 169 kwa daraja",
    "ldDesc": "Mikono 169 ya kuanzia ya Texas Hold’em, katika jedwali na kwa daraja la nafasi ya kushinda dhidi ya mkono mmoja, mitatu na sita ya nasibu.",
    "h1": "Mikono ya kuanzia ya Texas Hold’em: yote 169, kwa daraja",
    "lead": "Karata zako mbili za siri ni uamuzi wa kwanza wa kila mkono. Kuna njia {combos} za kupewa karata mbili, lakini mikono 169 tu tofauti ya kuanzia ukiweka rangi kando. Ukurasa huu unaionyesha yote katika jedwali pamoja na nafasi yake ya kushinda, iliyokokotolewa kwa kuiga migawo milioni moja kwa kila mmoja.",
    "chartH2": "Jedwali la mikono ya kuanzia",
    "chartP": "Jozi zinashuka kwenye mshazari. Juu yake kuna mikono ya rangi moja (s, karata zote mbili za rangi moja), chini yake mikono ya rangi tofauti (o). T ina maana ya kumi. Namba katika kila kisanduku ni nafasi ya mkono huo kushinda dhidi ya mkono mmoja wa nasibu karata zote tano za mezani zikigawiwa, sare ikihesabiwa kama nusu ya ushindi; kadiri kisanduku kilivyo kijani zaidi, ndivyo mkono ulivyo na nguvu zaidi.",
    "topH2": "Mikono bora ya kuanzia",
    "topP": "Mikono ishirini yenye nguvu zaidi dhidi ya mpinzani mmoja, na jinsi inavyostahimili dhidi ya watatu na sita:",
    "cols": [
      "Daraja",
      "Mkono",
      "Mpinzani 1",
      "Wapinzani 3",
      "Wapinzani 6"
    ],
    "multiH2": "Wapinzani zaidi, mikono tofauti",
    "multiP": "Kila mkono hushinda mara chache zaidi wachezaji wanapojiunga na pot, lakini si kwa kasi ile ile, kwa hiyo daraja hubadilika. Jozi ya ace inabaki juu: {aa1} ana kwa ana, bado {aa6} dhidi ya wapinzani sita. Karata mfululizo za rangi moja hupanda, kwa sababu huunda straight na flush zinazoshinda pot kubwa: saba-sita za rangi moja hupanda kutoka daraja la {r76s1} ana kwa ana hadi daraja la {r76s6} dhidi ya sita, jack-kumi za rangi moja kutoka {rjts1} hadi {rjts6}. Jozi za kati hushuka — jozi ya saba huanguka kutoka daraja la {r77_1} hadi {r77_6} — na vivyo hivyo mikono ya rangi tofauti yenye karata moja ya juu na kicker dhaifu, kama king-sita za rangi tofauti, kutoka {rk6o1} hadi {rk6o6}.",
    "suitedH2": "Rangi moja au rangi tofauti?",
    "suitedP": "Karata mbili za rangi moja zina thamani zaidi kuliko karata hizo hizo za rangi tofauti — takriban {suitGain} zaidi kwa wastani katika jozi zote 78 za thamani, kuanzia {suitMin} hadi {suitMax} kutegemea mkono. Inajalisha, lakini chini ya inavyoonekana: flush ni nadra, na mkono dhaifu wa rangi moja bado ni mkono dhaifu.",
    "worstH2": "Mkono mbaya zaidi wa kuanzia",
    "worstP": "Dhidi ya mkono mmoja wa nasibu, tatu-mbili za rangi tofauti ndio dhaifu kuliko yote, kwa {w32}. Saba-mbili za rangi tofauti, ambao mara nyingi huitwa mkono mbaya zaidi katika poka, hushinda {w72} na uko daraja la {r72} kati ya 169 ana kwa ana — lakini dhidi ya wapinzani sita ndio wa mwisho kabisa, kwa sababu karata zake mbili ziko mbali mno kuweza kuunda straight pamoja, na ni ndogo mno kushinda kitu kingine kikubwa.",
    "countH2": "Ni mara ngapi unapewa kila aina",
    "countP": "Kati ya mikono {combos} inayowezekana ya karata mbili, {pairCombos} ni jozi ({pairPct}), {suitedCombos} ni za rangi moja ({suitedPct}) na {offCombos} ni za rangi tofauti ({offPct}). Kila jozi inaweza kugawiwa kwa njia 6, kila mkono wa rangi moja kwa njia 4, kila mkono wa rangi tofauti kwa njia 12 — ndiyo sababu unaona ace-king za rangi tofauti mara tatu zaidi ya ace-king za rangi moja.",
    "useH2": "Jinsi ya kutumia jedwali kama hili",
    "useP": "Jedwali hupanga mikono kwa nguvu yake ghafi, kabla mtu yeyote hajacheza. Kwenye meza halisi, cheza mikono michache zaidi ukiwa katika nafasi za mwanzo, ambapo wachezaji wengi hucheza baada yako, na zaidi ukiwa kwenye kitufe cha mgawaji na cut-off. Fanya Raise badala ya Call kwa mikono unayocheza, fanya Fold kwa mikono ya chini ya jedwali, na kumbuka kwamba thamani ya mkono pia inategemea chipu za wachezaji, madau ya kulazimishwa na wapinzani wako. Katika shindano la PokerTH madau ya kulazimishwa huendelea kupanda, kwa hiyo mikono inayofaa kuchezwa huongezeka chipu zinapopungua.",
    "faqH2": "Maswali",
    "faq": [
      [
        "Ni mkono gani bora wa kuanzia katika Texas Hold’em?",
        "Jozi ya ace. Hushinda {aa1} dhidi ya mkono mmoja wa nasibu, na ndio inayopewa nafasi kubwa dhidi ya kila mkono mwingine wa kuanzia."
      ],
      [
        "Je, ace-king ni bora kuliko jozi ya queen?",
        "Hapana, lakini inakaribia: queen hushinda {qqak} dhidi ya ace-king za rangi tofauti. Dhidi ya mkono mmoja wa nasibu ace-king za rangi moja hushinda {aks1} na queen {qq1}."
      ],
      [
        "Kuna mikono mingapi ya kuanzia?",
        "Michanganyiko {combos} ya karata mbili, inayounda mikono 169 tofauti ya kuanzia: jozi 13, 78 za rangi moja na 78 za rangi tofauti."
      ],
      [
        "Mkono wa rangi moja una thamani gani?",
        "Kwa wastani, takriban {suitGain} zaidi ya nafasi ya kushinda kuliko mkono huo huo wa rangi tofauti."
      ],
      [
        "Ninaweza kufanya mazoezi ya kuchagua mikono ya kuanzia wapi?",
        "Katika hali ya mazoezi ya PokerTH dhidi ya wapinzani wa kompyuta, huku kichupo cha Uwezekano kikionyesha nafasi yako ya kushinda karata zinapotoka."
      ]
    ]
  },
  ta: {
    "title": "போக்கர் தொடக்கக் கைகள் அட்டவணை — 169 கைகளின் தரவரிசை | PokerTH",
    "desc": "Texas Hold’em-இன் 169 தொடக்கக் கைகளும் ஓர் அட்டவணையில், ஒன்று, மூன்று, ஆறு எதிராளிகளுக்கு எதிரான வெற்றி வாய்ப்பின்படி. ஒரே நிறமா வெவ்வேறா, ஜோடிகள், மோசமான கை.",
    "ldHeadline": "Texas Hold’em தொடக்கக் கைகள் அட்டவணை: 169 கைகளின் தரவரிசை",
    "ldDesc": "Texas Hold’em-இன் 169 தொடக்கக் கைகள், ஒன்று, மூன்று, ஆறு சீரற்ற கைகளுக்கு எதிரான வெற்றி வாய்ப்பின்படி அட்டவணையில் தரவரிசைப்படுத்தப்பட்டுள்ளன.",
    "h1": "Texas Hold’em தொடக்கக் கைகள்: அனைத்து 169 கைகளும் தரவரிசையில்",
    "lead": "உங்கள் இரு மறைமுக சீட்டுகளே ஒவ்வொரு கையின் முதல் முடிவு. இரு சீட்டுகள் உங்களுக்கு வர {combos} வழிகள் உள்ளன, ஆனால் நிறங்களை ஒதுக்கிவைத்தால் 169 வெவ்வேறு தொடக்கக் கைகள் மட்டுமே. இந்தப் பக்கம் அவை அனைத்தையும் அவற்றின் வெற்றி வாய்ப்புடன் அட்டவணையில் காட்டுகிறது; ஒவ்வொன்றுக்கும் பத்து லட்சம் வழங்கல்களை உருவகப்படுத்தி அது கணக்கிடப்பட்டது.",
    "chartH2": "தொடக்கக் கைகள் அட்டவணை",
    "chartP": "ஜோடிகள் மூலைவிட்டத்தில் கீழிறங்குகின்றன. அதற்கு மேலே ஒரே நிறக் கைகள் (s, இரு சீட்டுகளும் ஒரே நிறம்), கீழே வெவ்வேறு நிறக் கைகள் (o). T என்பது பத்தைக் குறிக்கிறது. ஒவ்வொரு கட்டத்திலுள்ள எண், ஐந்து மேசைச் சீட்டுகளும் வழங்கப்படும்போது அந்தக் கை ஒரு சீரற்ற கையை வெல்லும் வாய்ப்பு; சமநிலை பாதி வெற்றியாகக் கணக்கிடப்படுகிறது. கட்டம் எவ்வளவு பச்சையாக உள்ளதோ, கை அவ்வளவு வலிமையானது.",
    "topH2": "சிறந்த தொடக்கக் கைகள்",
    "topP": "ஓர் எதிராளிக்கு எதிரான இருபது வலிமையான கைகள், மூன்று மற்றும் ஆறு எதிராளிகளுக்கு எதிராக அவை எப்படித் தாக்குப்பிடிக்கின்றன:",
    "cols": [
      "இடம்",
      "கை",
      "1 எதிராளி",
      "3 எதிராளிகள்",
      "6 எதிராளிகள்"
    ],
    "multiH2": "அதிக எதிராளிகள், வேறு கைகள்",
    "multiP": "பானையில் வீரர்கள் சேரச் சேர ஒவ்வொரு கையும் குறைவாகவே வெல்கிறது, ஆனால் ஒரே அளவில் அல்ல; எனவே தரவரிசை மாறுகிறது. கையில் ஏஸ் ஜோடி முதலிடத்திலேயே இருக்கிறது: நேருக்கு நேர் {aa1}, ஆறு எதிராளிகளுக்கு எதிராகவும் இன்னும் {aa6}. ஒரே நிறத் தொடர் சீட்டுகள் மேலேறுகின்றன, ஏனெனில் அவை பெரிய பானைகளை வெல்லும் வரிசைகளையும் ஒரே நிறக் கோர்வைகளையும் அமைக்கின்றன: ஒரே நிற ஏழு-ஆறு நேருக்கு நேர் {r76s1}-ஆம் இடத்திலிருந்து ஆறு பேருக்கு எதிராக {r76s6}-ஆம் இடத்துக்கு உயர்கிறது, ஒரே நிற ஜாக்-பத்து {rjts1}-ஆம் இடத்திலிருந்து {rjts6}-ஆம் இடத்துக்கு. நடுத்தர ஜோடிகள் இறங்குகின்றன — ஏழுகள் {r77_1}-ஆம் இடத்திலிருந்து {r77_6}-ஆம் இடத்துக்குச் சரிகின்றன — ஓர் உயர் சீட்டும் பலவீனமான கிக்கரும் கொண்ட வெவ்வேறு நிறக் கைகளும் அப்படியே, எடுத்துக்காட்டாக வெவ்வேறு நிற கிங்-ஆறு, {rk6o1}-ஆம் இடத்திலிருந்து {rk6o6}-ஆம் இடத்துக்கு.",
    "suitedH2": "ஒரே நிறமா, வெவ்வேறு நிறமா?",
    "suitedP": "ஒரே நிறத்து இரு சீட்டுகள், அதே சீட்டுகள் வெவ்வேறு நிறத்தில் இருப்பதைவிட அதிக மதிப்புடையவை — 78 மதிப்பு இணைகள் அனைத்திலும் சராசரியாக ஏறத்தாழ {suitGain} அதிகம், கையைப் பொறுத்து {suitMin} முதல் {suitMax} வரை. இது முக்கியம், ஆனால் தோன்றுவதைவிடக் குறைவு: ஒரே நிறக் கோர்வைகள் அரிதானவை, பலவீனமான ஒரே நிறக் கை இன்னும் பலவீனமான கையே.",
    "worstH2": "மிக மோசமான தொடக்கக் கை",
    "worstP": "ஒரு சீரற்ற கைக்கு எதிராக, வெவ்வேறு நிற மூன்று-இரண்டு {w32} உடன் எல்லாவற்றிலும் பலவீனமானது. போக்கரின் மிக மோசமான கை என்று அடிக்கடி அழைக்கப்படும் வெவ்வேறு நிற ஏழு-இரண்டு {w72} வெல்கிறது, நேருக்கு நேர் 169-இல் {r72}-ஆம் இடத்தில் உள்ளது — ஆனால் ஆறு எதிராளிகளுக்கு எதிராக அதுவே கடைசி, ஏனெனில் அதன் இரு சீட்டுகளும் சேர்ந்து வரிசை அமைக்க மிகத் தொலைவில் உள்ளன, வேறு எதையும் வெல்ல மிகக் குறைவானவை.",
    "countH2": "ஒவ்வொரு வகைக் கையும் எத்தனை முறை வரும்",
    "countP": "சாத்தியமான {combos} இரு-சீட்டுக் கைகளில், {pairCombos} ஜோடிகள் ({pairPct}), {suitedCombos} ஒரே நிறக் கைகள் ({suitedPct}), {offCombos} வெவ்வேறு நிறக் கைகள் ({offPct}). ஒவ்வொரு ஜோடியும் 6 வழிகளில், ஒவ்வொரு ஒரே நிறக் கையும் 4 வழிகளில், ஒவ்வொரு வெவ்வேறு நிறக் கையும் 12 வழிகளில் வரலாம் — அதனால்தான் வெவ்வேறு நிற ஏஸ்-கிங், ஒரே நிற ஏஸ்-கிங்கைவிட மூன்று மடங்கு அடிக்கடி வருகிறது.",
    "useH2": "இப்படிப்பட்ட அட்டவணையைப் பயன்படுத்துவது எப்படி",
    "useP": "யாரும் செயல்படுவதற்கு முன், கைகளை அவற்றின் அடிப்படை வலிமையின்படி அட்டவணை வரிசைப்படுத்துகிறது. உண்மையான மேசையில், உங்களுக்குப் பின் பல வீரர்கள் செயல்படும் தொடக்க இடங்களிலிருந்து குறைவான கைகளையும், வழங்குநர் பொத்தான் மற்றும் கட்-ஆஃப் இடங்களிலிருந்து அதிகக் கைகளையும் விளையாடுங்கள். நீங்கள் விளையாடும் கைகளுடன் சமன் செய்வதற்குப் பதிலாக உயர்த்துங்கள், அட்டவணையின் அடிப்பகுதிக் கைகளைக் கைவிடுங்கள், மேலும் ஒரு கையின் மதிப்பு காசுக் குவியல்கள், கட்டாயப் பணயங்கள், உங்கள் எதிராளிகள் ஆகியவற்றையும் சார்ந்தது என்பதை நினைவில் கொள்ளுங்கள். PokerTH போட்டியில் கட்டாயப் பணயங்கள் தொடர்ந்து உயர்கின்றன; எனவே காசுக் குவியல்கள் குறையக் குறைய விளையாடத் தகுந்த கைகள் அதிகரிக்கின்றன.",
    "faqH2": "கேள்விகள்",
    "faq": [
      [
        "Texas Hold’em-இல் சிறந்த தொடக்கக் கை எது?",
        "கையில் ஏஸ் ஜோடி. ஒரு சீரற்ற கைக்கு எதிராக அது {aa1} வெல்கிறது, மற்ற எல்லாத் தொடக்கக் கைகளுக்கும் எதிராக அதுவே முன்னிலையில் உள்ளது."
      ],
      [
        "குயின் ஜோடியை விட ஏஸ்-கிங் சிறந்ததா?",
        "இல்லை, ஆனால் நெருக்கமானது: வெவ்வேறு நிற ஏஸ்-கிங்குக்கு எதிராக குயின்கள் {qqak} வெல்கின்றன. ஒரு சீரற்ற கைக்கு எதிராக ஒரே நிற ஏஸ்-கிங் {aks1}, குயின்கள் {qq1} வெல்கின்றன."
      ],
      [
        "எத்தனை தொடக்கக் கைகள் உள்ளன?",
        "{combos} இரு-சீட்டுச் சேர்க்கைகள்; அவை 169 வெவ்வேறு தொடக்கக் கைகளாக அமைகின்றன: 13 ஜோடிகள், 78 ஒரே நிறக் கைகள், 78 வெவ்வேறு நிறக் கைகள்."
      ],
      [
        "ஒரே நிறக் கைக்கு எவ்வளவு மதிப்பு?",
        "சராசரியாக, அதே கை வெவ்வேறு நிறத்தில் இருப்பதைவிட ஏறத்தாழ {suitGain} அதிக வெற்றி வாய்ப்பு."
      ],
      [
        "தொடக்கக் கைத் தேர்வை எங்கே பயிற்சி செய்யலாம்?",
        "PokerTH-இன் பயிற்சி முறையில் கணினி எதிராளிகளுடன்; சீட்டுகள் வெளிவரும்போது வாய்ப்புகள் தாவல் உங்கள் வெற்றி வாய்ப்பைக் காட்டுகிறது."
      ]
    ]
  },
  te: {
    "title": "పోకర్ ప్రారంభ హ్యాండ్‌ల చార్ట్ — 169 హ్యాండ్‌ల ర్యాంకింగ్ | PokerTH",
    "desc": "Texas Hold’em లోని 169 ప్రారంభ హ్యాండ్‌లూ ఒకే చార్ట్‌లో, 1, 3, 6 ప్రత్యర్థులపై గెలుపు అవకాశం బట్టి ర్యాంక్ చేయబడ్డాయి. సూటెడ్, ఆఫ్‌సూట్, జతలు, అత్యంత బలహీన హ్యాండ్.",
    "ldHeadline": "Texas Hold’em ప్రారంభ హ్యాండ్‌ల చార్ట్: మొత్తం 169 హ్యాండ్‌ల ర్యాంకింగ్",
    "ldDesc": "Texas Hold’em లోని 169 ప్రారంభ హ్యాండ్‌లు, చార్ట్‌గా, ఒకటి, మూడు, ఆరు యాదృచ్ఛిక హ్యాండ్‌లపై గెలిచే అవకాశాన్ని బట్టి ర్యాంక్ చేయబడ్డాయి.",
    "h1": "Texas Hold’em ప్రారంభ హ్యాండ్‌లు: మొత్తం 169, ర్యాంక్ వారీగా",
    "lead": "మీ రెండు హోల్ కార్డులే ప్రతి హ్యాండ్‌లో మొదటి నిర్ణయం. రెండు కార్డులు పంచబడే విధానాలు {combos} ఉన్నాయి, కానీ సూట్‌లను పక్కన పెడితే వేర్వేరు ప్రారంభ హ్యాండ్‌లు 169 మాత్రమే. ఈ పేజీ వాటన్నిటినీ గెలిచే అవకాశంతో పాటు చార్ట్‌లో చూపిస్తుంది; ఒక్కో హ్యాండ్‌కు పది లక్షల పంపకాలను సిమ్యులేట్ చేసి ఆ అవకాశం లెక్కించబడింది.",
    "chartH2": "ప్రారంభ హ్యాండ్‌ల చార్ట్",
    "chartP": "జతలు కర్ణం వెంబడి ఉంటాయి. దానిపైన సూటెడ్ హ్యాండ్‌లు (s, రెండు కార్డులూ ఒకే సూట్), దాని కింద ఆఫ్‌సూట్ హ్యాండ్‌లు (o) ఉంటాయి. T అంటే పది. ప్రతి గడిలోని సంఖ్య, బోర్డుపై ఐదు కార్డులూ పంచినప్పుడు ఆ హ్యాండ్ ఒక యాదృచ్ఛిక హ్యాండ్‌పై గెలిచే అవకాశం, టైని సగం గెలుపుగా లెక్కించి; గడి ఎంత పచ్చగా ఉంటే, హ్యాండ్ అంత బలమైనది.",
    "topH2": "అత్యుత్తమ ప్రారంభ హ్యాండ్‌లు",
    "topP": "ఒక ప్రత్యర్థిపై అత్యంత బలమైన ఇరవై హ్యాండ్‌లు, అవి ముగ్గురు, ఆరుగురిపై ఎలా నిలుస్తాయి:",
    "cols": [
      "ర్యాంక్",
      "హ్యాండ్",
      "1 ప్రత్యర్థి",
      "3 ప్రత్యర్థులు",
      "6 ప్రత్యర్థులు"
    ],
    "multiH2": "ఎక్కువ ప్రత్యర్థులు, వేరే హ్యాండ్‌లు",
    "multiP": "పాట్‌లో ఆటగాళ్లు చేరే కొద్దీ ప్రతి హ్యాండ్ తక్కువసార్లు గెలుస్తుంది, కానీ ఒకే రేటులో కాదు, కాబట్టి ర్యాంకింగ్ మారుతుంది. పాకెట్ ఏస్‌లు అగ్రస్థానంలోనే ఉంటాయి: హెడ్స్-అప్‌లో {aa1}, ఆరుగురు ప్రత్యర్థులపై కూడా ఇంకా {aa6}. సూటెడ్ కనెక్టర్‌లు పైకి ఎక్కుతాయి, ఎందుకంటే అవి పెద్ద పాట్‌లను గెలిచే Straight లు, Flush లు చేస్తాయి: ఏడు-ఆరు సూటెడ్ హెడ్స్-అప్‌లో ర్యాంక్ {r76s1} నుండి ఆరుగురిపై ర్యాంక్ {r76s6} కి, జాక్-పది సూటెడ్ {rjts1} నుండి {rjts6} కి చేరుతాయి. మధ్యస్థ జతలు పడిపోతాయి — ఏడుల జత ర్యాంక్ {r77_1} నుండి {r77_6} కి — అలాగే ఒక పెద్ద కార్డు, బలహీనమైన కిక్కర్ ఉన్న ఆఫ్‌సూట్ హ్యాండ్‌లు కూడా, ఉదాహరణకు కింగ్-ఆరు ఆఫ్‌సూట్, {rk6o1} నుండి {rk6o6} కి.",
    "suitedH2": "సూటెడ్ లేదా ఆఫ్‌సూట్?",
    "suitedP": "ఒకే సూట్ గల రెండు కార్డులు, అవే కార్డులు ఆఫ్‌సూట్ అయినప్పటి కంటే ఎక్కువ విలువైనవి — మొత్తం 78 ర్యాంక్ జతలపై సగటున సుమారు {suitGain} ఎక్కువ, హ్యాండ్‌ను బట్టి {suitMin} నుండి {suitMax} వరకు. ఇది ముఖ్యమే, కానీ కనిపించినంత కాదు: Flush లు అరుదు, బలహీనమైన సూటెడ్ హ్యాండ్ ఇప్పటికీ బలహీనమైన హ్యాండే.",
    "worstH2": "అత్యంత బలహీనమైన ప్రారంభ హ్యాండ్",
    "worstP": "ఒక యాదృచ్ఛిక హ్యాండ్‌పై, మూడు-రెండు ఆఫ్‌సూట్ {w32} తో అన్నిటికంటే బలహీనమైనది. పోకర్‌లో అత్యంత చెడ్డ హ్యాండ్ అని తరచూ పిలిచే ఏడు-రెండు ఆఫ్‌సూట్ {w72} గెలుస్తుంది, హెడ్స్-అప్‌లో 169 లో ర్యాంక్ {r72} లో ఉంటుంది — కానీ ఆరుగురు ప్రత్యర్థులపై అది పూర్తిగా చివరిది, ఎందుకంటే దాని రెండు కార్డులు కలిసి Straight చేయలేనంత దూరంగా ఉన్నాయి, వేరే దేనితోనూ పెద్దగా గెలవలేనంత చిన్నవి.",
    "countH2": "ఒక్కో రకం మీకు ఎంత తరచుగా వస్తుంది",
    "countP": "సాధ్యమయ్యే {combos} రెండు-కార్డుల హ్యాండ్‌లలో {pairCombos} జతలు ({pairPct}), {suitedCombos} సూటెడ్ ({suitedPct}), {offCombos} ఆఫ్‌సూట్ ({offPct}). ప్రతి జత 6 విధాలుగా, ప్రతి సూటెడ్ హ్యాండ్ 4 విధాలుగా, ప్రతి ఆఫ్‌సూట్ హ్యాండ్ 12 విధాలుగా రావచ్చు — అందుకే ఏస్-కింగ్ ఆఫ్‌సూట్ మీకు ఏస్-కింగ్ సూటెడ్ కంటే మూడు రెట్లు ఎక్కువగా కనిపిస్తుంది.",
    "useH2": "ఇలాంటి చార్ట్‌ను ఎలా ఉపయోగించాలి",
    "useP": "చార్ట్ ఎవరూ ఆడకముందే, కేవలం బలాన్ని బట్టి హ్యాండ్‌లకు ర్యాంక్ ఇస్తుంది. నిజమైన టేబుల్ వద్ద, మీ తర్వాత చాలా మంది ఆటగాళ్లు ఆడే ఎర్లీ పొజిషన్ నుండి తక్కువ హ్యాండ్‌లు, బటన్, కట్-ఆఫ్ నుండి ఎక్కువ హ్యాండ్‌లు ఆడండి. మీరు ఆడే హ్యాండ్‌లతో Call కంటే Raise చేయండి, చార్ట్ దిగువ భాగాన్ని Fold చేయండి, ఒక హ్యాండ్ విలువ స్టాక్‌లు, బ్లైండ్‌లు, మీ ప్రత్యర్థులపై కూడా ఆధారపడి ఉంటుందని గుర్తుంచుకోండి. PokerTH టోర్నమెంట్‌లో బ్లైండ్‌లు పెరుగుతూనే ఉంటాయి, కాబట్టి స్టాక్‌లు తగ్గే కొద్దీ ఆడదగిన హ్యాండ్‌ల పరిధి విస్తరిస్తుంది.",
    "faqH2": "ప్రశ్నలు",
    "faq": [
      [
        "Texas Hold’em లో అత్యుత్తమ ప్రారంభ హ్యాండ్ ఏది?",
        "పాకెట్ ఏస్‌లు. అవి ఒక యాదృచ్ఛిక హ్యాండ్‌పై {aa1} గెలుస్తాయి, మిగతా ప్రతి ప్రారంభ హ్యాండ్‌పైనా ఫేవరెట్‌గా ఉంటాయి."
      ],
      [
        "ఏస్-కింగ్ క్వీన్‌ల జత కంటే మంచిదా?",
        "కాదు, కానీ దగ్గరగా ఉంటుంది: క్వీన్‌లు ఏస్-కింగ్ ఆఫ్‌సూట్‌పై {qqak} గెలుస్తాయి. ఒక యాదృచ్ఛిక హ్యాండ్‌పై ఏస్-కింగ్ సూటెడ్ {aks1}, క్వీన్‌లు {qq1} గెలుస్తాయి."
      ],
      [
        "ప్రారంభ హ్యాండ్‌లు ఎన్ని ఉన్నాయి?",
        "{combos} రెండు-కార్డుల కలయికలు, ఇవి 169 వేర్వేరు ప్రారంభ హ్యాండ్‌లుగా ఏర్పడతాయి: 13 జతలు, 78 సూటెడ్, 78 ఆఫ్‌సూట్."
      ],
      [
        "సూటెడ్ హ్యాండ్ విలువ ఎంత?",
        "సగటున, అదే హ్యాండ్ ఆఫ్‌సూట్ కంటే సుమారు {suitGain} ఎక్కువ గెలుపు అవకాశం."
      ],
      [
        "ప్రారంభ హ్యాండ్‌ల ఎంపికను ఎక్కడ సాధన చేయవచ్చు?",
        "PokerTH శిక్షణ మోడ్‌లో కంప్యూటర్ ప్రత్యర్థులతో; కార్డులు వచ్చే కొద్దీ ఆడ్స్ ట్యాబ్ మీ గెలుపు అవకాశాన్ని చూపిస్తుంది."
      ]
    ]
  },
  tg: {
    "title": "Ҷадвали дастҳои ибтидоӣ — рейтинги ҳамаи 169 даст | PokerTH",
    "desc": "Ҳамаи 169 дасти ибтидоии Texas Hold’em дар ҷадвал, мувофиқи имкони бурд бар зидди як, се ва шаш рақиб тартибдодашуда. Як либос ё гуногун, ҷуфтҳо, бадтарин даст.",
    "ldHeadline": "Ҷадвали дастҳои ибтидоии Texas Hold’em: рейтинги ҳамаи 169 даст",
    "ldDesc": "169 дасти ибтидоии Texas Hold’em дар ҷадвал, ки аз рӯи имкони бурд бар зидди як, се ва шаш дасти тасодуфӣ тартиб дода шудаанд.",
    "h1": "Дастҳои ибтидоӣ дар Texas Hold’em: ҳамаи 169, бо рейтинг",
    "lead": "Ду корти шахсии шумо аввалин қарори ҳар даст аст. Барои гирифтани ду корт {combos} роҳ ҳаст, вале агар либосҳоро ба назар нагирем, танҳо 169 дасти ибтидоии гуногун мемонад. Ин саҳифа ҳамаи онҳоро бо имкони бурдашон дар ҷадвал нишон медиҳад, ки барои ҳар яке бо моделсозии як миллион тақсим ҳисоб карда шудааст.",
    "chartH2": "Ҷадвали дастҳои ибтидоӣ",
    "chartP": "Ҷуфтҳо дар диагонал ҷойгиранд. Болои он дастҳои як либос (s, ҳарду корт аз як либос), поёни он дастҳои либосҳои гуногун (o) ҳастанд. T маънои даҳро дорад. Рақам дар ҳар хона имкони он аст, ки даст бар зидди як дасти тасодуфӣ бурд кунад, вақте ки ҳамаи панҷ корти борд тақсим мешаванд, ва баробарӣ ҳамчун нисфи бурд ҳисоб мешавад; хона ҳар қадар сабзтар бошад, даст ҳамон қадар қавитар аст.",
    "topH2": "Беҳтарин дастҳои ибтидоӣ",
    "topP": "Бист дасти қавитарин бар зидди як рақиб ва чӣ гуна онҳо бар зидди се ва шаш рақиб истодагарӣ мекунанд:",
    "cols": [
      "Ҷой",
      "Даст",
      "1 рақиб",
      "3 рақиб",
      "6 рақиб"
    ],
    "multiH2": "Рақибони бештар, дастҳои дигар",
    "multiP": "Ҳар даст ҳангоми ба банк ворид шудани бозингарони бештар камтар мебарад, вале на бо як суръат, бинобар ин рейтинг тағйир меёбад. Ҷуфти тузҳо дар боло мемонад: {aa1} дар ҳедз-ап ва ҳоло ҳам {aa6} бар зидди шаш рақиб. Коннекторҳои як либос боло мераванд, зеро онҳо стрит ва флеш месозанд, ки банкҳои калонро мебаранд: ҳафт-шаши як либос аз ҷойи {r76s1} дар ҳедз-ап ба ҷойи {r76s6} бар зидди шаш мебарояд, валет-даҳи як либос аз {rjts1} ба {rjts6}. Ҷуфтҳои миёна поён мераванд — ҳафтҳо аз ҷойи {r77_1} ба {r77_6} меафтанд — ва ҳамчунин дастҳои либосҳои гуногун бо як корти баланд ва кикери заиф, масалан шоҳ-шаши либосҳои гуногун, аз {rk6o1} ба {rk6o6}.",
    "suitedH2": "Як либос ё либосҳои гуногун?",
    "suitedP": "Ду корти як либос аз ҳамон кортҳо бо либосҳои гуногун арзишмандтаранд — ба ҳисоби миёна тақрибан {suitGain} зиёдтар дар ҳамаи 78 омезиши ду арзиш, вобаста ба даст аз {suitMin} то {suitMax}. Ин аҳамият дорад, вале камтар аз он ки ба назар мерасад: флеш кам меояд ва дасти заифи як либос ҳамоно дасти заиф аст.",
    "worstH2": "Бадтарин дасти ибтидоӣ",
    "worstP": "Бар зидди як дасти тасодуфӣ се-дуи либосҳои гуногун бо {w32} заифтарини ҳама аст. Ҳафт-дуи либосҳои гуногун, ки аксар вақт бадтарин дасти покер номида мешавад, {w72} мебарад ва дар ҳедз-ап аз 169 дар ҷойи {r72} аст — вале бар зидди шаш рақиб он комилан охирин аст, зеро ду корташ барои якҷоя сохтани стрит аз ҳамдигар хеле дуранд ва барои бурдани чизи дигар хеле пастанд.",
    "countH2": "Ҳар навъ чанд бор ба шумо меафтад",
    "countP": "Аз {combos} дасти имконпазири дукорта {pairCombos} ҷуфт ({pairPct}), {suitedCombos} як либос ({suitedPct}) ва {offCombos} либосҳои гуногун ({offPct}) мебошанд. Ҳар ҷуфт метавонад бо 6 роҳ, ҳар дасти як либос бо 4 роҳ ва ҳар дасти либосҳои гуногун бо 12 роҳ тақсим шавад — бинобар ин туз-шоҳи либосҳои гуногун назар ба туз-шоҳи як либос се баробар зиёдтар ба шумо меафтад.",
    "useH2": "Чӣ тавр аз чунин ҷадвал истифода бояд кард",
    "useP": "Ҷадвал дастҳоро аз рӯи қувваи соф, пеш аз он ки касе амал кунад, тартиб медиҳад. Дар сари мизи воқеӣ аз мавқеи барвақт, ки баъд аз шумо бозингарони зиёд амал мекунанд, дастҳои камтар ва аз баттон ва кат-офф бештар бозӣ кунед. Бо дастҳое, ки бозӣ мекунед, ба ҷои Call беҳтараш Raise кунед, дастҳои поёни ҷадвалро Fold кунед ва дар хотир доред, ки арзиши даст инчунин ба стекҳо, блайндҳо ва рақибони шумо вобаста аст. Дар турнири PokerTH блайндҳо пайваста баланд мешаванд, бинобар ин вақте ки стекҳо кӯтоҳ мешаванд, доираи дастҳои арзандаи бозӣ васеътар мегардад.",
    "faqH2": "Саволҳо",
    "faq": [
      [
        "Беҳтарин дасти ибтидоӣ дар Texas Hold’em кадом аст?",
        "Ҷуфти тузҳо. Онҳо бар зидди як дасти тасодуфӣ {aa1} мебаранд ва бар зидди ҳар дасти ибтидоии дигар фаворит мебошанд."
      ],
      [
        "Оё туз-шоҳ аз ҷуфти дамаҳо беҳтар аст?",
        "Не, вале фарқ кам аст: дамаҳо бар зидди туз-шоҳи либосҳои гуногун {qqak} мебаранд. Бар зидди як дасти тасодуфӣ туз-шоҳи як либос {aks1} ва дамаҳо {qq1} мебаранд."
      ],
      [
        "Чанд дасти ибтидоӣ вуҷуд дорад?",
        "{combos} омезиши дукорта, ки 169 дасти ибтидоии гуногунро ташкил медиҳанд: 13 ҷуфт, 78 як либос ва 78 либосҳои гуногун."
      ],
      [
        "Дасти як либос чӣ қадар арзиш дорад?",
        "Ба ҳисоби миёна тақрибан {suitGain} имкони бурди бештар нисбат ба ҳамон даст бо либосҳои гуногун."
      ],
      [
        "Интихоби дастҳои ибтидоиро дар куҷо машқ карда метавонам?",
        "Дар реҷаи машқи PokerTH бар зидди рақибони компютерӣ, бо панели «Имкониятҳо», ки ҳангоми кушода шудани кортҳо имкони бурди шуморо нишон медиҳад."
      ]
    ]
  },
  th: {
    "title": "ตารางไพ่เริ่มต้นโป๊กเกอร์ — จัดอันดับครบ 169 มือ | PokerTH",
    "desc": "ไพ่เริ่มต้น Texas Hold’em ครบ 169 มือในตารางเดียว จัดอันดับตามโอกาสชนะเมื่อเจอคู่แข่งหนึ่ง สาม และหกคน ดอกเดียวกันหรือคนละดอก ไพ่คู่ และมือที่แย่ที่สุด",
    "ldHeadline": "ตารางไพ่เริ่มต้น Texas Hold’em: จัดอันดับครบทั้ง 169 มือ",
    "ldDesc": "ไพ่เริ่มต้น Texas Hold’em ทั้ง 169 มือ แสดงเป็นตารางและจัดอันดับตามโอกาสชนะเมื่อเจอไพ่สุ่มหนึ่ง สาม และหกมือ",
    "h1": "ไพ่เริ่มต้น Texas Hold’em: ครบ 169 มือ เรียงตามอันดับ",
    "lead": "ไพ่ในมือสองใบของคุณคือการตัดสินใจแรกของทุกมือ การได้ไพ่สองใบเป็นไปได้ {combos} แบบ แต่ถ้าไม่นับดอก จะมีไพ่เริ่มต้นที่ต่างกันเพียง 169 แบบ หน้านี้แสดงทั้งหมดในตารางพร้อมโอกาสชนะ ซึ่งคำนวณจากการจำลองการแจกไพ่หนึ่งล้านครั้งต่อมือ",
    "chartH2": "ตารางไพ่เริ่มต้น",
    "chartP": "ไพ่คู่เรียงอยู่ตามแนวทแยง ด้านบนเป็นมือดอกเดียวกัน (s คือไพ่ทั้งสองใบเป็นดอกเดียวกัน) ด้านล่างเป็นมือคนละดอก (o) ส่วน T หมายถึงสิบ ตัวเลขในแต่ละช่องคือโอกาสที่มือนั้นจะชนะไพ่สุ่มหนึ่งมือเมื่อแจกไพ่กองกลางครบทั้งห้าใบ โดยนับการเสมอเป็นครึ่งหนึ่งของการชนะ ช่องยิ่งเขียว มือยิ่งแรง",
    "topH2": "ไพ่เริ่มต้นที่ดีที่สุด",
    "topP": "ยี่สิบมือที่แรงที่สุดเมื่อเจอคู่แข่งหนึ่งคน และผลเมื่อเจอสามและหกคน:",
    "cols": [
      "อันดับ",
      "มือ",
      "คู่แข่ง 1 คน",
      "คู่แข่ง 3 คน",
      "คู่แข่ง 6 คน"
    ],
    "multiH2": "คู่แข่งมากขึ้น มือที่ดีก็เปลี่ยนไป",
    "multiP": "ทุกมือชนะน้อยลงเมื่อมีผู้เล่นเข้ากองกลางมากขึ้น แต่ไม่ได้ลดลงในอัตราเดียวกัน อันดับจึงเปลี่ยน คู่เอซในมือยังอยู่บนสุด: {aa1} แบบตัวต่อตัว และยังได้ {aa6} เมื่อเจอคู่แข่งหกคน ไพ่เรียงติดกันดอกเดียวกันไต่อันดับขึ้น เพราะทำสเตรตและฟลัชที่ชนะกองกลางก้อนใหญ่ได้: เจ็ด-หกดอกเดียวกันขยับจากอันดับ {r76s1} แบบตัวต่อตัวเป็นอันดับ {r76s6} เมื่อเจอหกคน แจ็ค-สิบดอกเดียวกันจาก {rjts1} เป็น {rjts6} คู่กลางร่วงลง — คู่เจ็ดตกจากอันดับ {r77_1} ไป {r77_6} — มือคนละดอกที่มีไพ่สูงใบเดียวกับคิกเกอร์อ่อนก็เช่นกัน เช่น คิง-หกคนละดอก จาก {rk6o1} ไป {rk6o6}",
    "suitedH2": "ดอกเดียวกันหรือคนละดอก?",
    "suitedP": "ไพ่สองใบดอกเดียวกันมีค่ามากกว่าไพ่ชุดเดียวกันที่เป็นคนละดอก — โดยเฉลี่ยมากกว่าราว {suitGain} เมื่อดูครบทั้ง 78 คู่แต้ม ตั้งแต่ {suitMin} ถึง {suitMax} แล้วแต่มือ เรื่องนี้มีผล แต่น้อยกว่าที่เห็น: ฟลัชเกิดได้ยาก และมืออ่อนที่เป็นดอกเดียวกันก็ยังเป็นมืออ่อนอยู่ดี",
    "worstH2": "ไพ่เริ่มต้นที่แย่ที่สุด",
    "worstP": "เมื่อเจอไพ่สุ่มหนึ่งมือ สาม-สองคนละดอกอ่อนที่สุดในทั้งหมดที่ {w32} เจ็ด-สองคนละดอก ซึ่งมักถูกเรียกว่ามือที่แย่ที่สุดในโป๊กเกอร์ ชนะ {w72} และอยู่อันดับ {r72} จาก 169 แบบตัวต่อตัว — แต่เมื่อเจอคู่แข่งหกคนจะอยู่ท้ายสุด เพราะไพ่สองใบห่างกันเกินกว่าจะทำสเตรตด้วยกันได้ และต่ำเกินกว่าจะชนะด้วยอย่างอื่น",
    "countH2": "คุณได้ไพ่แต่ละแบบบ่อยแค่ไหน",
    "countP": "จากไพ่สองใบที่เป็นไปได้ {combos} แบบ มี {pairCombos} แบบเป็นไพ่คู่ ({pairPct}) {suitedCombos} แบบเป็นดอกเดียวกัน ({suitedPct}) และ {offCombos} แบบเป็นคนละดอก ({offPct}) ไพ่คู่แต่ละคู่แจกได้ 6 แบบ มือดอกเดียวกันแต่ละมือ 4 แบบ มือคนละดอกแต่ละมือ 12 แบบ — ด้วยเหตุนี้คุณจึงเห็นเอซ-คิงคนละดอกบ่อยกว่าเอซ-คิงดอกเดียวกันถึงสามเท่า",
    "useH2": "วิธีใช้ตารางแบบนี้",
    "useP": "ตารางจัดอันดับมือตามความแรงล้วน ๆ ก่อนที่ใครจะลงมือ ที่โต๊ะจริง ให้เล่นน้อยมือลงในตำแหน่งต้น ซึ่งมีผู้เล่นหลายคนลงมือหลังคุณ และเล่นมากขึ้นจากปุ่มดีลเลอร์และคัตออฟ มือที่คุณเลือกเล่นให้เพิ่มเดิมพันแทนการตาม หมอบมือท้ายตาราง และจำไว้ว่าค่าของมือยังขึ้นกับกองชิป ไพ่บังคับ และคู่แข่งของคุณด้วย ในทัวร์นาเมนต์ของ PokerTH ไพ่บังคับขึ้นไปเรื่อย ๆ มือที่น่าเล่นจึงกว้างขึ้นเมื่อชิปเหลือน้อยลง",
    "faqH2": "คำถาม",
    "faq": [
      [
        "ไพ่เริ่มต้นที่ดีที่สุดใน Texas Hold’em คืออะไร?",
        "คู่เอซในมือ ชนะไพ่สุ่มหนึ่งมือ {aa1} และเป็นต่อไพ่เริ่มต้นอื่นทุกมือ"
      ],
      [
        "เอซ-คิงดีกว่าคู่ควีนไหม?",
        "ไม่ แต่สูสี: คู่ควีนชนะเอซ-คิงคนละดอก {qqak} เมื่อเจอไพ่สุ่มหนึ่งมือ เอซ-คิงดอกเดียวกันชนะ {aks1} และคู่ควีน {qq1}"
      ],
      [
        "ไพ่เริ่มต้นมีกี่แบบ?",
        "ไพ่สองใบมี {combos} แบบ ซึ่งรวมเป็นไพ่เริ่มต้นต่างกัน 169 แบบ: ไพ่คู่ 13 แบบ ดอกเดียวกัน 78 แบบ และคนละดอก 78 แบบ"
      ],
      [
        "มือดอกเดียวกันมีค่าแค่ไหน?",
        "โดยเฉลี่ยมีโอกาสชนะมากกว่ามือเดียวกันที่เป็นคนละดอกราว {suitGain}"
      ],
      [
        "ฝึกเลือกไพ่เริ่มต้นได้ที่ไหน?",
        "ในโหมดฝึกซ้อมของ PokerTH ที่เล่นกับคู่แข่งคอมพิวเตอร์ โดยมีแท็บโอกาสแสดงโอกาสชนะของคุณเมื่อไพ่ทยอยเปิด"
      ]
    ]
  },
  tk: {
    "title": "Poker başlangyç elleri tablisasy — 169 eliň reýtingi | PokerTH",
    "desc": "Texas Hold’em-iň 169 başlangyç eliniň hemmesi bir tablisada, bir, üç we alty garşydaşa garşy utmak ähtimallygyna görä tertiplenen. Mastlar, jübütler we iň erbet el.",
    "ldHeadline": "Texas Hold’em başlangyç elleri tablisasy: 169 eliň hemmesi tertip boýunça",
    "ldDesc": "Texas Hold’em-iň 169 başlangyç eli tablisada, bir, üç we alty tötänleýin ele garşy utmak ähtimallygyna görä tertiplenen.",
    "h1": "Texas Hold’em başlangyç elleri: 169-synyň hemmesi tertip boýunça",
    "lead": "Iki şahsy kartyňyz her eliň ilkinji kararydyr. Iki kart almagyň {combos} usuly bar, ýöne mastlar hasaba alynmasa, bary-ýogy 169 dürli başlangyç el bar. Bu sahypa olaryň hemmesini utmak ähtimallygy bilen tablisada görkezýär; ähtimallyk her el üçin bir million paýlamany simulirlemek arkaly hasaplandy.",
    "chartH2": "Başlangyç elleriň tablisasy",
    "chartP": "Jübütler diagonal boýunça ýerleşýär. Onuň ýokarsynda bir mastly eller (s, iki karty hem bir mastdan), aşagynda dürli mastly eller (o). T onlugy aňladýar. Her öýjükdäki san bäş umumy kartyň hemmesi paýlananda eliň bir tötänleýin ele garşy utmak ähtimallygydyr, deňlik ýarym utuş hasaplanýar; öýjük näçe ýaşyl bolsa, el şonça güýçli.",
    "topH2": "Iň gowy başlangyç eller",
    "topP": "Bir garşydaşa garşy iň güýçli ýigrimi el we olaryň üç hem-de alty garşydaşa garşy nähili durýandygy:",
    "cols": [
      "Orun",
      "El",
      "1 garşydaş",
      "3 garşydaş",
      "6 garşydaş"
    ],
    "multiH2": "Köp garşydaş — başga eller",
    "multiP": "Banka oýunçy goşuldygyça her el seýrek utýar, ýöne birmeňzeş depginde däl, şonuň üçin reýting üýtgeýär. Tuz jübüti iň ýokarda galýar: heds-apda {aa1}, alty garşydaşa garşy hem henizem {aa6}. Bir mastly konnektorlar ýokary galýar, sebäbi olar uly banklary utýan strit we fleş ýygnaýar: bir mastly ýedilik-altylyk heds-apda {r76s1} belgili orundan alty garşydaşa garşy {r76s6} belgili orna çykýar, bir mastly walet-onluk bolsa {rjts1} belgili orundan {rjts6} belgili orna. Orta jübütler aşak düşýär — ýedilikler {r77_1} belgili orundan {r77_6} belgili orna — şeýle hem bir uly karty we gowşak kikeri bolan dürli mastly eller, mysal üçin dürli mastly korol-altylyk, {rk6o1} belgili orundan {rk6o6} belgili orna.",
    "suitedH2": "Bir mastly ýa-da dürli mastly?",
    "suitedP": "Bir mastly iki kart şol kartlaryň dürli mastly görnüşinden gymmatly — iki dürli bahanyň 78 utgaşmasynyň hemmesi boýunça ortaça takmynan {suitGain} köp, ele baglylykda {suitMin} bilen {suitMax} aralygynda. Bu möhüm, ýöne göründüginden az: fleş seýrek çykýar, gowşak bir mastly el bolsa barybir gowşak el bolup galýar.",
    "worstH2": "Iň erbet başlangyç el",
    "worstP": "Bir tötänleýin ele garşy dürli mastly üçlük-ikilik iň gowşagy: {w32}. Köplenç pokerdäki iň erbet el diýlip atlandyrylýan dürli mastly ýedilik-ikilik {w72} utýar we heds-apda 169 eliň arasynda {r72} belgili orny eýeleýär — ýöne alty garşydaşa garşy ol iň soňkudyr, sebäbi onuň iki karty bilelikde strit ýygnamak üçin biri-birinden gaty uzak, başga bir zat bilen köp utmak üçin bolsa gaty pes.",
    "countH2": "Her görnüş size näçe gezek düşýär",
    "countP": "Mümkin bolan {combos} iki kartly eliň arasynda jübütler {pairCombos} ({pairPct}), bir mastly eller {suitedCombos} ({suitedPct}), dürli mastly eller {offCombos} ({offPct}). Her jübüt 6 usulda, her bir mastly el 4 usulda, her dürli mastly el 12 usulda düşüp bilýär — şonuň üçin dürli mastly tuz-korol bir mastly tuz-koroldan üç esse ýygy görünýär.",
    "useH2": "Şeýle tablisany nädip ulanmaly",
    "useP": "Tablisa elleri hiç kim hereket etmänkä, olaryň arassa güýjüne görä tertipleýär. Hakyky stolda köp oýunçynyň sizden soň hereket edýän irki pozisiýasyndan az el oýnaň, batton we kat-off (cut-off) pozisiýalaryndan bolsa köp. Oýnaýan elleriňiz bilen Call etmegiň ýerine Raise ediň, tablisanyň aşagyndaky ellerde Fold ediň we eliň gymmatynyň stekler, blaýndlar we garşydaşlaryňyz bilen hem baglydygyny ýadyňyzda saklaň. PokerTH ýaryşynda blaýndlar hemişe ýokarlanýar, şonuň üçin stekler gysgaldygyça oýnamaga degýän eller köpelýär.",
    "faqH2": "Soraglar",
    "faq": [
      [
        "Texas Hold’em-de iň gowy başlangyç el haýsy?",
        "Tuz jübüti. Ol bir tötänleýin ele garşy {aa1} utýar we beýleki ähli başlangyç ellere garşy favorit bolup durýar."
      ],
      [
        "Tuz-korol dama jübütinden gowumy?",
        "Ýok, ýöne tapawut az: damalar dürli mastly tuz-korola garşy {qqak} utýar. Bir tötänleýin ele garşy bir mastly tuz-korol {aks1}, damalar bolsa {qq1} utýar."
      ],
      [
        "Näçe başlangyç el bar?",
        "{combos} iki kartly utgaşma, olar 169 dürli başlangyç eli emele getirýär: 13 jübüt, 78 bir mastly we 78 dürli mastly."
      ],
      [
        "Bir mastly el näçe gymmat?",
        "Ortaça şol eliň dürli mastly görnüşinden takmynan {suitGain} köp utmak ähtimallygy."
      ],
      [
        "Başlangyç elleri saýlamagy nirede türgenleşip bilerin?",
        "PokerTH-iň türgenleşik tertibinde kompýuter garşydaşlaryna garşy; kartlar açyldygyça «Mümkinçilikler» goýmasy utmak mümkinçiligiňizi görkezýär."
      ]
    ]
  },
  tr: {
    "title": "Poker başlangıç elleri tablosu — 169 elin sıralaması | PokerTH",
    "desc": "Texas Hold’em’in 169 başlangıç eli tek tabloda; bir, üç ve altı rakibe karşı kazanma şansına göre sıralı. Aynı sembol mü farklı mı, çiftler ve en kötü el.",
    "ldHeadline": "Texas Hold’em başlangıç elleri tablosu: 169 elin tamamı sıralı",
    "ldDesc": "Texas Hold’em’in 169 başlangıç eli, bir, üç ve altı rastgele ele karşı kazanma şansına göre tabloda sıralandı.",
    "h1": "Texas Hold’em başlangıç elleri: 169 elin tamamı, sıralı",
    "lead": "İki kapalı kartınız her elin ilk kararıdır. İki kartın dağıtılmasının {combos} yolu vardır, ama semboller bir kenara bırakıldığında yalnızca 169 farklı başlangıç eli kalır. Bu sayfa hepsini, her biri için bir milyon dağıtım simüle edilerek hesaplanan kazanma şanslarıyla birlikte bir tabloda gösterir.",
    "chartH2": "Başlangıç elleri tablosu",
    "chartP": "Çiftler köşegen boyunca dizilir. Köşegenin üstünde aynı sembollü eller (s, iki kart da aynı sembolden), altında farklı sembollü eller (o) yer alır. T, onlu anlamına gelir. Her karedeki sayı, masanın beş kartı da açıldığında elin rastgele bir ele karşı kazanma şansıdır; beraberlikler yarım galibiyet sayılır. Kare ne kadar yeşilse el o kadar güçlüdür.",
    "topH2": "En iyi başlangıç elleri",
    "topP": "Tek rakibe karşı en güçlü yirmi el ve üç ile altı rakibe karşı nasıl dayandıkları:",
    "cols": [
      "Sıra",
      "El",
      "1 rakip",
      "3 rakip",
      "6 rakip"
    ],
    "multiH2": "Daha çok rakip, farklı eller",
    "multiP": "Pota oyuncu katıldıkça her el daha seyrek kazanır, ama aynı hızda değil; bu yüzden sıralama değişir. Elde as çifti zirvede kalır: teke tekte {aa1}, altı rakibe karşı bile {aa6}. Aynı sembollü ardışık kartlar yükselir, çünkü büyük potları kazandıran kent ve floşlar yaparlar: aynı sembollü yedi-altı teke tekteki {r76s1}. sıradan altı rakibe karşı {r76s6}. sıraya, aynı sembollü vale-on {rjts1}. sıradan {rjts6}. sıraya çıkar. Orta çiftler geriler — yedili çift {r77_1}. sıradan {r77_6}. sıraya düşer — tek yüksek kartı ve zayıf kicker’ı olan farklı sembollü eller de öyle; örneğin farklı sembollü papaz-altı {rk6o1}. sıradan {rk6o6}. sıraya iner.",
    "suitedH2": "Aynı sembol mü, farklı sembol mü?",
    "suitedP": "Aynı sembolden iki kart, aynı kartların farklı sembollüsünden daha değerlidir — 78 değer çiftinin tamamında ortalama yaklaşık {suitGain} daha fazla, ele göre {suitMin} ile {suitMax} arasında. Bu önemlidir ama göründüğü kadar değil: floş nadir gelir ve zayıf bir aynı sembollü el yine de zayıf bir eldir.",
    "worstH2": "En kötü başlangıç eli",
    "worstP": "Rastgele bir ele karşı en zayıf el, {w32} ile farklı sembollü üç-ikidir. Çoğu zaman pokerin en kötü eli denen farklı sembollü yedi-iki {w72} kazanır ve teke tekte 169 el arasında {r72}. sıradadır — ama altı rakibe karşı en sondadır, çünkü iki kartı birlikte kent yapamayacak kadar birbirinden uzak ve başka pek bir şey kazanamayacak kadar düşüktür.",
    "countH2": "Her türden eli ne sıklıkla alırsınız",
    "countP": "Olası {combos} iki kartlık elin {pairCombos} tanesi çift ({pairPct}), {suitedCombos} tanesi aynı sembollü ({suitedPct}) ve {offCombos} tanesi farklı sembollüdür ({offPct}). Her çift 6, her aynı sembollü el 4, her farklı sembollü el 12 şekilde gelebilir — farklı sembollü as-papazı aynı sembollü as-papazdan üç kat daha sık görmenizin nedeni budur.",
    "useH2": "Böyle bir tablo nasıl kullanılır",
    "useP": "Bir tablo, elleri kimse hamle yapmadan önceki ham güçlerine göre sıralar. Gerçek bir masada, sizden sonra birçok oyuncunun konuştuğu erken pozisyonda daha az, dağıtıcı düğmesinde ve cut-off’ta daha çok el oynayın. Oynadığınız ellerle Call yerine Raise yapın, tablonun alt kısmındaki elleri Fold edin ve bir elin değerinin çip yığınlarına, körlere ve rakiplerinize de bağlı olduğunu unutmayın. Bir PokerTH turnuvasında körler sürekli yükselir; bu yüzden çipler azaldıkça oynamaya değer eller genişler.",
    "faqH2": "Sorular",
    "faq": [
      [
        "Texas Hold’em’de en iyi başlangıç eli hangisidir?",
        "Elde as çifti. Rastgele bir ele karşı {aa1} kazanır ve diğer her başlangıç eline karşı favoridir."
      ],
      [
        "As-papaz, kız çiftinden daha mı iyi?",
        "Hayır, ama fark az: kız çifti farklı sembollü as-papaza karşı {qqak} kazanır. Rastgele bir ele karşı aynı sembollü as-papaz {aks1}, kız çifti ise {qq1} kazanır."
      ],
      [
        "Kaç başlangıç eli vardır?",
        "{combos} iki kartlık kombinasyon; bunlar 169 farklı başlangıç eli oluşturur: 13 çift, 78 aynı sembollü ve 78 farklı sembollü el."
      ],
      [
        "Aynı sembollü bir el ne kadar değerlidir?",
        "Ortalama olarak, aynı elin farklı sembollüsüne göre yaklaşık {suitGain} daha fazla kazanma şansı."
      ],
      [
        "Başlangıç eli seçimini nerede çalışabilirim?",
        "PokerTH’nin antrenman modunda bilgisayar rakiplere karşı; kartlar açıldıkça Şanslar sekmesi kazanma şansınızı gösterir."
      ]
    ]
  },
  uk: {
    "title": "Таблиця стартових рук у покері — рейтинг усіх 169 | PokerTH",
    "desc": "Усі 169 стартових рук Texas Hold’em у таблиці, впорядковані за шансом на виграш проти 1, 3 і 6 суперників. Одномасні й різномасні, пари та найгірша рука.",
    "ldHeadline": "Таблиця стартових рук Texas Hold’em: рейтинг усіх 169 рук",
    "ldDesc": "169 стартових рук Texas Hold’em у таблиці, впорядкованих за шансом на виграш проти однієї, трьох і шести випадкових рук.",
    "h1": "Стартові руки в Texas Hold’em: усі 169 за рейтингом",
    "lead": "Дві ваші кишенькові карти — перше рішення в кожній роздачі. Отримати дві карти можна {combos} способами, але якщо не зважати на масті, різних стартових рук лише 169. Ця сторінка показує їх усі в таблиці разом із шансом на виграш, обчисленим шляхом симуляції мільйона роздач для кожної.",
    "chartH2": "Таблиця стартових рук",
    "chartP": "Пари йдуть по діагоналі. Над нею — одномасні руки (s, обидві карти однієї масті), під нею — різномасні (o). T означає десятку. Число в кожній клітинці — це шанс, що рука виграє проти однієї випадкової руки, коли роздано всі п’ять карт борду, причому нічия рахується як пів виграшу; що зеленіша клітинка, то сильніша рука.",
    "topH2": "Найкращі стартові руки",
    "topP": "Двадцять найсильніших рук проти одного суперника — і як вони тримаються проти трьох і шести:",
    "cols": [
      "Місце",
      "Рука",
      "1 суперник",
      "3 суперники",
      "6 суперників"
    ],
    "multiH2": "Більше суперників — інші руки",
    "multiP": "Кожна рука виграє рідше, коли до банку долучаються гравці, але не однаково швидко, тож рейтинг змінюється. Кишенькові тузи лишаються на вершині: {aa1} у хедз-апі й усе ще {aa6} проти шести суперників. Одномасні коннектори піднімаються, бо складають стрити й флеші, що виграють великі банки: одномасні сімка-шістка переходять із позиції {r76s1} у хедз-апі на позицію {r76s6} проти шести, одномасні валет-десятка — з {rjts1} на {rjts6}. Середні пари опускаються — сімки падають із позиції {r77_1} на {r77_6}, — як і різномасні руки з однією старшою картою та слабким кікером, наприклад різномасні король-шістка, з {rk6o1} на {rk6o6}.",
    "suitedH2": "Одномасні чи різномасні?",
    "suitedP": "Дві карти однієї масті вартують більше, ніж ті самі карти різних мастей, — у середньому приблизно на {suitGain} більше по всіх 78 парах номіналів, від {suitMin} до {suitMax} залежно від руки. Це важить, але менше, ніж здається: флеші трапляються рідко, а слабка одномасна рука — все одно слабка рука.",
    "worstH2": "Найгірша стартова рука",
    "worstP": "Проти однієї випадкової руки найслабша з усіх — різномасні трійка-двійка, {w32}. Різномасні сімка-двійка, яку часто називають найгіршою рукою в покері, виграють {w72} і в хедз-апі посідають місце {r72} зі 169 — але проти шести суперників це остання рука з усіх, бо дві її карти надто далекі одна від одної, щоб разом скласти стрит, і надто низькі, щоб виграти щось інше.",
    "countH2": "Як часто вам роздають кожен вид",
    "countP": "Із {combos} можливих рук із двох карт пари становлять {pairCombos} ({pairPct}), одномасні — {suitedCombos} ({suitedPct}), різномасні — {offCombos} ({offPct}). Кожну пару можна роздати 6 способами, кожну одномасну руку — 4, кожну різномасну — 12, — ось чому різномасні туз-король випадають утричі частіше, ніж одномасні.",
    "useH2": "Як користуватися такою таблицею",
    "useP": "Таблиця впорядковує руки за чистою силою, ще до того, як хтось зробив хід. За справжнім столом грайте менше рук із ранньої позиції, де після вас діє багато гравців, і більше — з батона та кат-офу. Із руками, які граєте, підвищуйте, а не коліть, скидайте низ таблиці й пам’ятайте, що цінність руки залежить також від стеків, блайндів і суперників. У турнірі PokerTH блайнди постійно зростають, тож коло рук, які варто грати, ширшає в міру того, як стеки коротшають.",
    "faqH2": "Запитання",
    "faq": [
      [
        "Яка найкраща стартова рука в Texas Hold’em?",
        "Кишенькові тузи. Вони виграють {aa1} проти однієї випадкової руки й мають перевагу над будь-якою іншою стартовою рукою."
      ],
      [
        "Чи туз-король кращий за пару дам?",
        "Ні, але різниця невелика: дами виграють {qqak} проти різномасних туза-короля. Проти однієї випадкової руки одномасні туз-король виграють {aks1}, а дами — {qq1}."
      ],
      [
        "Скільки існує стартових рук?",
        "{combos} комбінацій із двох карт, які дають 169 різних стартових рук: 13 пар, 78 одномасних і 78 різномасних."
      ],
      [
        "Наскільки цінніша одномасна рука?",
        "У середньому шанс на виграш приблизно на {suitGain} вищий, ніж у тієї самої руки різних мастей."
      ],
      [
        "Де потренуватися у виборі стартових рук?",
        "У режимі тренування PokerTH проти комп’ютерних суперників, де вкладка «Шанси» показує ваш шанс на виграш у міру виходу карт."
      ]
    ]
  },
  ur: {
    "title": "پوکر ابتدائی ہاتھوں کا چارٹ — تمام 169 ہاتھ درجہ وار | PokerTH",
    "desc": "Texas Hold’em کے تمام 169 ابتدائی ہاتھ ایک چارٹ میں، ایک، تین اور چھ حریفوں کے خلاف جیتنے کے امکان کے حساب سے درجہ وار۔ ایک رنگ یا مختلف رنگ، جوڑے، اور بدترین ہاتھ۔",
    "ldHeadline": "Texas Hold’em ابتدائی ہاتھوں کا چارٹ: تمام 169 ہاتھ درجہ وار",
    "ldDesc": "Texas Hold’em کے 169 ابتدائی ہاتھ، چارٹ میں اور ایک، تین اور چھ بے ترتیب ہاتھوں کے خلاف جیتنے کے امکان کے حساب سے درجہ وار۔",
    "h1": "Texas Hold’em کے ابتدائی ہاتھ: تمام 169، درجہ وار",
    "lead": "آپ کے دو بند کارڈ ہر ہاتھ کا پہلا فیصلہ ہیں۔ دو کارڈ ملنے کے {combos} طریقے ہیں، لیکن رنگوں کو ایک طرف رکھیں تو صرف 169 مختلف ابتدائی ہاتھ بنتے ہیں۔ یہ صفحہ ان سب کو ان کے جیتنے کے امکان کے ساتھ چارٹ میں دکھاتا ہے، جو ہر ایک کے لیے دس لاکھ بار بانٹنے کی نقل کر کے نکالا گیا ہے۔",
    "chartH2": "ابتدائی ہاتھوں کا چارٹ",
    "chartP": "جوڑے وتر پر اوپر سے نیچے چلتے ہیں۔ اس کے اوپر ایک رنگ والے ہاتھ ہیں (s، دونوں کارڈ ایک ہی رنگ کے)، اور نیچے مختلف رنگ والے ہاتھ (o)۔ T کا مطلب دہلا یعنی دس ہے۔ ہر خانے کا عدد اس بات کا امکان ہے کہ میز کے پانچوں کارڈ بانٹے جانے پر یہ ہاتھ ایک بے ترتیب ہاتھ سے جیت جائے، برابری کو آدھی جیت گن کر؛ خانہ جتنا زیادہ سبز، ہاتھ اتنا ہی مضبوط۔",
    "topH2": "بہترین ابتدائی ہاتھ",
    "topP": "ایک حریف کے خلاف سب سے مضبوط بیس ہاتھ، اور تین اور چھ حریفوں کے خلاف وہ کیسے ٹکتے ہیں:",
    "cols": [
      "درجہ",
      "ہاتھ",
      "1 حریف",
      "3 حریف",
      "6 حریف"
    ],
    "multiH2": "زیادہ حریف، مختلف ہاتھ",
    "multiP": "جیسے جیسے کھلاڑی پاٹ میں شامل ہوتے ہیں ہر ہاتھ کم بار جیتتا ہے، مگر ایک ہی شرح سے نہیں، اس لیے درجہ بندی بدل جاتی ہے۔ اِکّوں کا جوڑا سب سے اوپر رہتا ہے: آمنے سامنے {aa1}، اور چھ حریفوں کے خلاف بھی {aa6}۔ ایک رنگ کے ملحقہ کارڈ اوپر چڑھتے ہیں، کیونکہ وہ اسٹریٹ اور فلش بناتے ہیں جو بڑے پاٹ جیتتے ہیں: ایک رنگ کا سات-چھ آمنے سامنے درجہ {r76s1} سے چھ کے خلاف درجہ {r76s6} پر پہنچ جاتا ہے، اور ایک رنگ کا غلام-دہلا {rjts1} سے {rjts6} پر۔ درمیانے جوڑے نیچے آتے ہیں — ستّوں کا جوڑا درجہ {r77_1} سے {r77_6} پر گر جاتا ہے — اور یہی حال ان مختلف رنگ والے ہاتھوں کا ہے جن میں ایک اونچا کارڈ اور کمزور کِکر ہو، جیسے مختلف رنگ کا بادشاہ-چھ، {rk6o1} سے {rk6o6} پر۔",
    "suitedH2": "ایک رنگ یا مختلف رنگ؟",
    "suitedP": "ایک ہی رنگ کے دو کارڈ انہی کارڈوں سے زیادہ قیمتی ہیں جب وہ مختلف رنگ کے ہوں — قدروں کے تمام 78 جوڑوں پر اوسطاً تقریباً {suitGain} زیادہ، ہاتھ کے لحاظ سے {suitMin} سے {suitMax} تک۔ اس سے فرق پڑتا ہے، مگر جتنا لگتا ہے اس سے کم: فلش کم ہی بنتا ہے، اور ایک رنگ کا کمزور ہاتھ پھر بھی کمزور ہاتھ ہی رہتا ہے۔",
    "worstH2": "بدترین ابتدائی ہاتھ",
    "worstP": "ایک بے ترتیب ہاتھ کے خلاف، مختلف رنگ کا تین-دو {w32} کے ساتھ سب سے کمزور ہاتھ ہے۔ مختلف رنگ کا سات-دو، جسے اکثر پوکر کا بدترین ہاتھ کہا جاتا ہے، {w72} جیتتا ہے اور آمنے سامنے 169 میں سے درجہ {r72} پر ہے — لیکن چھ حریفوں کے خلاف یہ بالکل آخری ہے، کیونکہ اس کے دونوں کارڈ ایک دوسرے سے اتنے دور ہیں کہ مل کر اسٹریٹ نہیں بنا سکتے، اور اتنے چھوٹے کہ کچھ اور بھی خاص نہیں جیت سکتے۔",
    "countH2": "ہر قسم آپ کو کتنی بار ملتی ہے",
    "countP": "دو کارڈوں کے {combos} ممکنہ ہاتھوں میں سے {pairCombos} جوڑے ہیں ({pairPct})، {suitedCombos} ایک رنگ کے ({suitedPct}) اور {offCombos} مختلف رنگ کے ({offPct})۔ ہر جوڑا 6 طریقوں سے مل سکتا ہے، ہر ایک رنگ والا ہاتھ 4 طریقوں سے، ہر مختلف رنگ والا ہاتھ 12 طریقوں سے — اسی لیے مختلف رنگ کا اِکّا-بادشاہ آپ کو ایک رنگ کے اِکّا-بادشاہ سے تین گنا زیادہ ملتا ہے۔",
    "useH2": "ایسا چارٹ کیسے استعمال کریں",
    "useP": "چارٹ ہاتھوں کو کسی کے کچھ کرنے سے پہلے، ان کی خام طاقت کے حساب سے ترتیب دیتا ہے۔ اصل میز پر ابتدائی پوزیشن سے کم ہاتھ کھیلیں، جہاں بہت سے کھلاڑی آپ کے بعد بولتے ہیں، اور ڈیلر بٹن اور کٹ آف سے زیادہ۔ جو ہاتھ کھیلیں ان کے ساتھ کال کے بجائے ریز کریں، چارٹ کے نچلے حصے والے ہاتھ فولڈ کریں، اور یاد رکھیں کہ کسی ہاتھ کی قیمت چپس کے ڈھیروں، بلائنڈز اور آپ کے حریفوں پر بھی منحصر ہے۔ PokerTH ٹورنامنٹ میں بلائنڈز بڑھتے ہی رہتے ہیں، اس لیے چپس کم ہونے کے ساتھ کھیلنے کے لائق ہاتھوں کا دائرہ پھیلتا جاتا ہے۔",
    "faqH2": "سوالات",
    "faq": [
      [
        "Texas Hold’em میں بہترین ابتدائی ہاتھ کون سا ہے؟",
        "اِکّوں کا جوڑا۔ یہ ایک بے ترتیب ہاتھ کے خلاف {aa1} جیتتا ہے، اور ہر دوسرے ابتدائی ہاتھ کے خلاف فیورٹ ہوتا ہے۔"
      ],
      [
        "کیا اِکّا-بادشاہ بیگموں کے جوڑے سے بہتر ہے؟",
        "نہیں، مگر مقابلہ قریب ہے: بیگمیں مختلف رنگ کے اِکّا-بادشاہ کے خلاف {qqak} جیتتی ہیں۔ ایک بے ترتیب ہاتھ کے خلاف ایک رنگ کا اِکّا-بادشاہ {aks1} اور بیگمیں {qq1} جیتتی ہیں۔"
      ],
      [
        "کتنے ابتدائی ہاتھ ہوتے ہیں؟",
        "دو کارڈوں کے {combos} مجموعے، جن سے 169 مختلف ابتدائی ہاتھ بنتے ہیں: 13 جوڑے، 78 ایک رنگ کے اور 78 مختلف رنگ کے۔"
      ],
      [
        "ایک رنگ والا ہاتھ کتنا قیمتی ہے؟",
        "اوسطاً، اسی ہاتھ کے مختلف رنگ والے روپ سے جیتنے کا تقریباً {suitGain} زیادہ امکان۔"
      ],
      [
        "ابتدائی ہاتھوں کے انتخاب کی مشق کہاں کی جا سکتی ہے؟",
        "PokerTH کے مشق موڈ میں کمپیوٹر حریفوں کے خلاف، جہاں «امکانات» ٹیب کارڈ کھلنے کے ساتھ ساتھ آپ کے جیتنے کا امکان دکھاتا ہے۔"
      ]
    ]
  },
  uz: {
    "title": "Boshlangʻich qoʻllar jadvali — barcha 169 qoʻl reytingi | PokerTH",
    "desc": "Texas Hold’em’ning 169 boshlangʻich qoʻli bir jadvalda, bir, uch va olti raqibga qarshi yutish ehtimoli boʻyicha. Bir mastli yoki har xil, juftliklar va eng yomon qoʻl.",
    "ldHeadline": "Texas Hold’em boshlangʻich qoʻllar jadvali: barcha 169 qoʻl reytingi",
    "ldDesc": "Texas Hold’em’ning 169 boshlangʻich qoʻli jadvalda, bir, uch va olti tasodifiy qoʻlga qarshi yutish imkoniyati boʻyicha tartiblangan.",
    "h1": "Texas Hold’em’da boshlangʻich qoʻllar: barcha 169 qoʻl, kuchi boʻyicha",
    "lead": "Ikkita choʻntak kartangiz har bir qoʻldagi birinchi qarordir. Ikkita karta {combos} xil usulda tushishi mumkin, ammo mastlar hisobga olinmasa, faqat 169 ta turli boshlangʻich qoʻl bor. Bu sahifa ularning barchasini yutish imkoniyati bilan jadvalda koʻrsatadi; imkoniyat har biri uchun bir million tarqatishni simulyatsiya qilib hisoblangan.",
    "chartH2": "Boshlangʻich qoʻllar jadvali",
    "chartP": "Juftliklar diagonal boʻylab joylashgan. Undan yuqorida bir mastli qoʻllar (s, ikkala karta bir xil mastda), pastda esa har xil mastli qoʻllar (o). T oʻnlikni bildiradi. Har bir katakdagi son — stolning barcha beshta kartasi tarqatilganda qoʻlning bitta tasodifiy qoʻlga qarshi yutish imkoniyati, durang yarim gʻalaba sifatida hisoblanadi; katak qanchalik yashil boʻlsa, qoʻl shunchalik kuchli.",
    "topH2": "Eng yaxshi boshlangʻich qoʻllar",
    "topP": "Bitta raqibga qarshi eng kuchli yigirmata qoʻl va ular uch hamda olti raqibga qarshi qanday natija koʻrsatishi:",
    "cols": [
      "Oʻrin",
      "Qoʻl",
      "1 raqib",
      "3 raqib",
      "6 raqib"
    ],
    "multiH2": "Raqiblar koʻproq — qoʻllar boshqa",
    "multiP": "Bankka oʻyinchilar qoʻshilgan sari har bir qoʻl kamroq yutadi, lekin bir xil darajada emas, shuning uchun reyting oʻzgaradi. Choʻntak tuzlari birinchi oʻrinda qoladi: yakkama-yakka {aa1}, olti raqibga qarshi ham hali {aa6}. Bir mastli konnektorlar yuqoriga koʻtariladi, chunki ular katta banklarni yutadigan strit va fleshlar yigʻadi: bir mastli yetti-olti yakkama-yakka {r76s1}-oʻrindan olti raqibga qarshi {r76s6}-oʻringa chiqadi, bir mastli valet-oʻnlik {rjts1}-oʻrindan {rjts6}-oʻringa. Oʻrtacha juftliklar pastga tushadi — yettiliklar {r77_1}-oʻrindan {r77_6}-oʻringa tushadi — shuningdek, bitta yuqori karta va zaif kikerli har xil mastli qoʻllar ham, masalan, har xil mastli qirol-olti {rk6o1}-oʻrindan {rk6o6}-oʻringa.",
    "suitedH2": "Bir mastlimi yoki har xil mastlimi?",
    "suitedP": "Bir xil mastdagi ikkita karta xuddi shu kartalarning har xil mastli variantidan qimmatroq — barcha 78 ta daraja juftligi boʻyicha oʻrtacha taxminan {suitGain} koʻproq, qoʻlga qarab {suitMin} va {suitMax} oraligʻida. Bu muhim, lekin koʻringanchalik emas: fleshlar kam uchraydi, zaif bir mastli qoʻl esa baribir zaif qoʻl.",
    "worstH2": "Eng yomon boshlangʻich qoʻl",
    "worstP": "Bitta tasodifiy qoʻlga qarshi eng zaifi — {w32} bilan har xil mastli uch-ikki. Koʻpincha pokerdagi eng yomon qoʻl deb ataladigan har xil mastli yetti-ikki {w72} yutadi va yakkama-yakka 169 qoʻl orasida {r72}-oʻrinda turadi — ammo olti raqibga qarshi u eng oxirgi oʻrinda, chunki uning ikki kartasi birgalikda strit yigʻish uchun bir-biridan juda uzoq, boshqa narsani yutish uchun esa juda past.",
    "countH2": "Har bir turdagi qoʻl qanchalik tez-tez tushadi",
    "countP": "Mumkin boʻlgan {combos} ta ikki kartali qoʻldan {pairCombos} tasi juftlik ({pairPct}), {suitedCombos} tasi bir mastli ({suitedPct}) va {offCombos} tasi har xil mastli ({offPct}). Har bir juftlik 6 xil, har bir bir mastli qoʻl 4 xil, har bir har xil mastli qoʻl esa 12 xil usulda tushishi mumkin — shuning uchun har xil mastli tuz-qirol bir mastli tuz-qiroldan uch barobar koʻp tushadi.",
    "useH2": "Bunday jadvaldan qanday foydalanish kerak",
    "useP": "Jadval qoʻllarni hech kim harakat qilmasidan oldingi sof kuchiga qarab tartiblaydi. Haqiqiy stolda erta pozitsiyadan, ya’ni sizdan keyin koʻp oʻyinchi harakat qiladigan joydan kamroq, diler tugmasi va cut-off’dan esa koʻproq qoʻl oʻynang. Oʻynaydigan qoʻllaringiz bilan call emas, raise qiling, jadvalning pastki qismini fold qiling va qoʻlning qiymati steklar, blayndlar va raqiblaringizga ham bogʻliqligini unutmang. PokerTH turnirida blayndlar doimo oshib boradi, shuning uchun steklar qisqargan sari oʻynashga arziydigan qoʻllar doirasi kengayadi.",
    "faqH2": "Savollar",
    "faq": [
      [
        "Texas Hold’em’da eng yaxshi boshlangʻich qoʻl qaysi?",
        "Choʻntak tuzlari. Ular bitta tasodifiy qoʻlga qarshi {aa1} yutadi va boshqa har qanday boshlangʻich qoʻlga qarshi favorit hisoblanadi."
      ],
      [
        "Tuz-qirol malikalar juftligidan yaxshiroqmi?",
        "Yoʻq, lekin farq kichik: malikalar har xil mastli tuz-qirolga qarshi {qqak} yutadi. Bitta tasodifiy qoʻlga qarshi bir mastli tuz-qirol {aks1}, malikalar esa {qq1} yutadi."
      ],
      [
        "Nechta boshlangʻich qoʻl bor?",
        "{combos} ta ikki kartali kombinatsiya, ular 169 ta turli boshlangʻich qoʻlni tashkil qiladi: 13 ta juftlik, 78 ta bir mastli va 78 ta har xil mastli."
      ],
      [
        "Bir mastli qoʻl qanchalik qimmat?",
        "Oʻrtacha xuddi shu qoʻlning har xil mastli variantidan taxminan {suitGain} koʻproq yutish imkoniyati."
      ],
      [
        "Boshlangʻich qoʻl tanlashni qayerda mashq qilsam boʻladi?",
        "PokerTH’ning mashgʻulot rejimida kompyuter raqiblariga qarshi: Ehtimollar paneli kartalar ochilgan sari yutish imkoniyatingizni koʻrsatadi."
      ]
    ]
  },
  vi: {
    "title": "Bảng tay bài khởi đầu poker — xếp hạng đủ 169 tay | PokerTH",
    "desc": "Đủ 169 tay bài khởi đầu Texas Hold’em trong một bảng, xếp hạng theo khả năng thắng trước một, ba và sáu đối thủ. Cùng chất hay khác chất, các đôi, và tay bài tệ nhất.",
    "ldHeadline": "Bảng tay bài khởi đầu Texas Hold’em: xếp hạng đủ 169 tay",
    "ldDesc": "169 tay bài khởi đầu Texas Hold’em, trình bày thành bảng và xếp hạng theo khả năng thắng trước một, ba và sáu tay bài ngẫu nhiên.",
    "h1": "Tay bài khởi đầu Texas Hold’em: xếp hạng đủ 169 tay",
    "lead": "Hai lá tẩy của bạn là quyết định đầu tiên của mỗi ván. Có {combos} cách để được chia hai lá, nhưng chỉ có 169 tay bài khởi đầu khác nhau nếu bỏ qua chất. Trang này đưa tất cả vào một bảng cùng khả năng thắng của chúng, tính bằng cách mô phỏng một triệu lần chia bài cho mỗi tay.",
    "chartH2": "Bảng tay bài khởi đầu",
    "chartP": "Các đôi chạy dọc đường chéo. Phía trên là các tay cùng chất (s, hai lá cùng một chất), phía dưới là các tay khác chất (o). T là quân mười. Con số trong mỗi ô là khả năng tay bài đó thắng một tay ngẫu nhiên khi chia đủ năm lá bài chung, hòa được tính là nửa trận thắng; ô càng xanh, tay bài càng mạnh.",
    "topH2": "Những tay bài khởi đầu mạnh nhất",
    "topP": "Hai mươi tay mạnh nhất khi gặp một đối thủ, và sức trụ của chúng khi gặp ba và sáu đối thủ:",
    "cols": [
      "Hạng",
      "Tay bài",
      "1 đối thủ",
      "3 đối thủ",
      "6 đối thủ"
    ],
    "multiH2": "Nhiều đối thủ hơn, tay bài khác đi",
    "multiP": "Mọi tay bài đều thắng ít hơn khi có thêm người vào pot, nhưng không giảm cùng một mức, nên thứ hạng thay đổi. Đôi át trên tay vẫn đứng đầu: {aa1} khi một đối một, vẫn còn {aa6} khi gặp sáu đối thủ. Bài liền mạch cùng chất leo hạng, vì chúng tạo ra sảnh và thùng để thắng những pot lớn: bảy-sáu cùng chất đi từ hạng {r76s1} khi một đối một lên hạng {r76s6} khi gặp sáu đối thủ, bồi-mười cùng chất từ {rjts1} lên {rjts6}. Các đôi trung bình tụt hạng — đôi bảy rơi từ hạng {r77_1} xuống {r77_6} — và các tay khác chất có một lá cao cùng quân phụ yếu cũng vậy, như già-sáu khác chất, từ {rk6o1} xuống {rk6o6}.",
    "suitedH2": "Cùng chất hay khác chất?",
    "suitedP": "Hai lá cùng chất đáng giá hơn chính hai lá đó khi khác chất — trung bình hơn khoảng {suitGain} trên toàn bộ 78 cặp giá trị, từ {suitMin} đến {suitMax} tùy tay bài. Điều đó có ý nghĩa, nhưng ít hơn vẻ ngoài: thùng rất hiếm, và một tay cùng chất yếu vẫn là tay bài yếu.",
    "worstH2": "Tay bài khởi đầu tệ nhất",
    "worstP": "Khi gặp một tay ngẫu nhiên, ba-hai khác chất là yếu nhất với {w32}. Bảy-hai khác chất, thường được gọi là tay bài tệ nhất trong poker, thắng {w72} và xếp hạng {r72} trên 169 khi một đối một — nhưng khi gặp sáu đối thủ thì nó đứng chót, vì hai lá của nó cách nhau quá xa để cùng tạo sảnh và quá nhỏ để thắng được gì khác.",
    "countH2": "Bạn được chia mỗi loại thường xuyên đến đâu",
    "countP": "Trong {combos} tay hai lá có thể có, {pairCombos} là đôi ({pairPct}), {suitedCombos} là cùng chất ({suitedPct}) và {offCombos} là khác chất ({offPct}). Mỗi đôi có 6 cách chia, mỗi tay cùng chất có 4 cách, mỗi tay khác chất có 12 cách — đó là lý do bạn gặp át-già khác chất nhiều gấp ba lần át-già cùng chất.",
    "useH2": "Cách dùng một bảng như thế này",
    "useP": "Bảng xếp hạng tay bài theo sức mạnh thuần túy, trước khi có ai hành động. Ở bàn thật, hãy chơi ít tay hơn từ vị trí đầu, nơi nhiều người hành động sau bạn, và chơi nhiều tay hơn từ nút chia bài và vị trí cut-off. Với những tay bạn chơi, hãy Raise thay vì Call, Fold những tay cuối bảng, và nhớ rằng giá trị của một tay bài còn phụ thuộc vào lượng phỉnh, tiền cược mù và đối thủ của bạn. Trong giải đấu PokerTH, tiền cược mù liên tục tăng, nên khi phỉnh vơi dần, phạm vi tay bài đáng chơi sẽ rộng ra.",
    "faqH2": "Câu hỏi",
    "faq": [
      [
        "Tay bài khởi đầu mạnh nhất trong Texas Hold’em là gì?",
        "Đôi át trên tay. Nó thắng {aa1} trước một tay ngẫu nhiên, và là cửa trên trước mọi tay bài khởi đầu khác."
      ],
      [
        "Át-già có mạnh hơn đôi đầm không?",
        "Không, nhưng rất sát: đôi đầm thắng át-già khác chất {qqak}. Trước một tay ngẫu nhiên, át-già cùng chất thắng {aks1} và đôi đầm thắng {qq1}."
      ],
      [
        "Có bao nhiêu tay bài khởi đầu?",
        "{combos} tổ hợp hai lá, tạo thành 169 tay bài khởi đầu khác nhau: 13 đôi, 78 tay cùng chất và 78 tay khác chất."
      ],
      [
        "Tay cùng chất đáng giá hơn bao nhiêu?",
        "Trung bình, khả năng thắng cao hơn khoảng {suitGain} so với chính tay đó khi khác chất."
      ],
      [
        "Tôi có thể luyện chọn tay bài khởi đầu ở đâu?",
        "Trong chế độ luyện tập của PokerTH, đấu với đối thủ máy, với tab Cơ hội hiển thị khả năng thắng của bạn khi các lá được lật."
      ]
    ]
  },
  yo: {
    "title": "Àtẹ ọwọ́ ìbẹ̀rẹ̀ poker — ipò gbogbo ọwọ́ 169 | PokerTH",
    "desc": "Gbogbo ọwọ́ ìbẹ̀rẹ̀ 169 ti Texas Hold’em nínú àtẹ kan, ní ìtòlẹ́sẹẹsẹ àǹfààní láti borí alátakò kan, mẹ́ta àti mẹ́fà. Suited tàbí offsuit, pair, ọwọ́ tó burú jù.",
    "ldHeadline": "Àtẹ ọwọ́ ìbẹ̀rẹ̀ Texas Hold’em: ipò gbogbo ọwọ́ 169",
    "ldDesc": "Ọwọ́ ìbẹ̀rẹ̀ 169 ti Texas Hold’em nínú àtẹ, tí a tò ní ìbámu pẹ̀lú àǹfààní wọn láti borí ọwọ́ èyíkéyìí kan, mẹ́ta àti mẹ́fà.",
    "h1": "Ọwọ́ ìbẹ̀rẹ̀ Texas Hold’em: gbogbo 169, ní ìtòlẹ́sẹẹsẹ",
    "lead": "Káàdì àpò rẹ méjì ni ìpinnu àkọ́kọ́ nínú gbogbo ọwọ́. Ọ̀nà {combos} ló wà láti gba káàdì méjì, ṣùgbọ́n ọwọ́ ìbẹ̀rẹ̀ 169 tí ó yàtọ̀ síra nìkan ló wà tí a bá fi àwọ̀ káàdì sí apá kan. Ojú-ewé yìí fi gbogbo wọn hàn nínú àtẹ pẹ̀lú àǹfààní wọn láti borí, tí a ṣírò nípa ṣíṣe àfarawé pínpín káàdì mílíọ̀nù kan fún ọ̀kọ̀ọ̀kan.",
    "chartH2": "Àtẹ ọwọ́ ìbẹ̀rẹ̀",
    "chartP": "Àwọn pair wà lórí ìlà agbèbè (diagonal). Lókè rẹ̀ ni àwọn ọwọ́ suited wà (s, káàdì méjèèjì jẹ́ àwọ̀ kan náà), nísàlẹ̀ rẹ̀ ni àwọn ọwọ́ offsuit (o). T túmọ̀ sí mẹ́wàá. Nọ́ńbà inú àpótí kọ̀ọ̀kan ni àǹfààní pé ọwọ́ náà yóò borí ọwọ́ èyíkéyìí kan nígbà tí a bá pín gbogbo káàdì board márùn-ún, tí a ka ọ̀mì sí ìdajì ìborí; bí àpótí bá ṣe ní àwọ̀ ewé tó, bẹ́ẹ̀ ni ọwọ́ náà ṣe lágbára tó.",
    "topH2": "Àwọn ọwọ́ ìbẹ̀rẹ̀ tó dára jù",
    "topP": "Ogún ọwọ́ tó lágbára jù lòdì sí alátakò kan, àti bí wọ́n ṣe dúró lòdì sí mẹ́ta àti mẹ́fà:",
    "cols": [
      "Ipò",
      "Ọwọ́",
      "Alátakò 1",
      "Alátakò 3",
      "Alátakò 6"
    ],
    "multiH2": "Alátakò púpọ̀ sí i, ọwọ́ mìíràn",
    "multiP": "Gbogbo ọwọ́ ń borí ní ìgbà díẹ̀ ju ti tẹ́lẹ̀ lọ bí àwọn òṣèré ṣe ń wọ pot, ṣùgbọ́n kì í ṣe ní ìwọ̀n kan náà, nítorí náà ìtòlẹ́sẹẹsẹ ń yí padà. Pocket Ace ṣì wà lókè: {aa1} ní heads-up, ó sì ṣì jẹ́ {aa6} lòdì sí alátakò mẹ́fà. Àwọn suited connector ń gòkè, nítorí wọ́n ń ṣe Straight àti Flush tí ó ń borí pot ńlá: méje-mẹ́fà suited ń lọ láti ipò {r76s1} ní heads-up sí ipò {r76s6} lòdì sí mẹ́fà, Jack-mẹ́wàá suited láti {rjts1} sí {rjts6}. Àwọn pair àárín ń jábọ́ — pair méje ń ṣubú láti ipò {r77_1} sí {r77_6} — bẹ́ẹ̀ náà ni àwọn ọwọ́ offsuit tí ó ní káàdì gíga kan àti kicker aláìlágbára, bí Ọba-mẹ́fà offsuit, láti {rk6o1} sí {rk6o6}.",
    "suitedH2": "Suited tàbí offsuit?",
    "suitedP": "Káàdì méjì tí àwọ̀ wọn jẹ́ ọ̀kan níye lórí ju àwọn káàdì kan náà tí ó jẹ́ offsuit — ní nǹkan bí {suitGain} sí i ní àròpín lórí gbogbo àkópọ̀ iye méjì 78, láti {suitMin} sí {suitMax} ní ìbámu pẹ̀lú ọwọ́ náà. Ó ṣe pàtàkì, ṣùgbọ́n kò tó bí ó ṣe rí lójú: Flush ṣọ̀wọ́n, ọwọ́ suited aláìlágbára sì ṣì jẹ́ ọwọ́ aláìlágbára.",
    "worstH2": "Ọwọ́ ìbẹ̀rẹ̀ tó burú jù",
    "worstP": "Lòdì sí ọwọ́ èyíkéyìí kan, mẹ́ta-méjì offsuit ni ó lágbára kéré jù nínú gbogbo wọn pẹ̀lú {w32}. Méje-méjì offsuit, tí a sábà máa ń pè ní ọwọ́ tó burú jù nínú poker, ń borí {w72}, ó sì wà ní ipò {r72} nínú 169 ní heads-up — ṣùgbọ́n lòdì sí alátakò mẹ́fà, òun ni ó kẹ́yìn pátápátá, nítorí káàdì rẹ̀ méjì jìnnà jù síra wọn láti ṣe Straight papọ̀, wọ́n sì kéré jù láti borí nǹkan mìíràn púpọ̀.",
    "countH2": "Bí wọ́n ṣe ń pín irú kọ̀ọ̀kan fún ọ tó",
    "countP": "Nínú ọwọ́ olókàdì méjì {combos} tí ó ṣeé ṣe, {pairCombos} jẹ́ pair ({pairPct}), {suitedCombos} jẹ́ suited ({suitedPct}), {offCombos} sì jẹ́ offsuit ({offPct}). A lè pín pair kọ̀ọ̀kan ní ọ̀nà 6, ọwọ́ suited kọ̀ọ̀kan ní ọ̀nà 4, ọwọ́ offsuit kọ̀ọ̀kan ní ọ̀nà 12 — ìdí nìyẹn tí o fi ń rí Ace-Ọba offsuit ní ìlọ́po mẹ́ta ju Ace-Ọba suited lọ.",
    "useH2": "Bí a ṣe ń lo irú àtẹ yìí",
    "useP": "Àtẹ kan ń to àwọn ọwọ́ ní ìbámu pẹ̀lú agbára wọn gan-an, kí ẹnikẹ́ni tó ṣe ìgbésẹ̀. Ní tábìlì gidi, ṣe ọwọ́ díẹ̀ láti ipò ìbẹ̀rẹ̀, níbi tí ọ̀pọ̀ òṣèré ti ń ṣe ìgbésẹ̀ lẹ́yìn rẹ, kí o sì ṣe púpọ̀ sí i láti button àti cut-off. Ṣe Raise dípò Call pẹ̀lú àwọn ọwọ́ tí o ń ṣe, ṣe Fold sí àwọn ọwọ́ ìsàlẹ̀ àtẹ, kí o sì rántí pé iye ọwọ́ kan tún dá lórí àwọn stack, blinds àti àwọn alátakò rẹ. Nínú ìdíje PokerTH, blinds ń gòkè ṣáá, nítorí náà àwọn ọwọ́ tí ó yẹ láti ṣe ń pọ̀ sí i bí stack ṣe ń kéré.",
    "faqH2": "Ìbéèrè",
    "faq": [
      [
        "Kí ni ọwọ́ ìbẹ̀rẹ̀ tó dára jù nínú Texas Hold’em?",
        "Pocket Ace. Wọ́n ń borí {aa1} lòdì sí ọwọ́ èyíkéyìí kan, wọ́n sì ni ààyò lòdì sí gbogbo ọwọ́ ìbẹ̀rẹ̀ mìíràn."
      ],
      [
        "Ṣé Ace-Ọba dára ju pair Ayaba lọ?",
        "Rárá, ṣùgbọ́n ó sún mọ́ra: pair Ayaba ń borí {qqak} lòdì sí Ace-Ọba offsuit. Lòdì sí ọwọ́ èyíkéyìí kan, Ace-Ọba suited ń borí {aks1}, pair Ayaba sì ń borí {qq1}."
      ],
      [
        "Ọwọ́ ìbẹ̀rẹ̀ mélòó ló wà?",
        "Àkópọ̀ káàdì méjì {combos}, tí ó ń ṣe ọwọ́ ìbẹ̀rẹ̀ 169 tí ó yàtọ̀ síra: pair 13, suited 78 àti offsuit 78."
      ],
      [
        "Iye wo ni ọwọ́ suited jẹ́?",
        "Ní nǹkan bí {suitGain} àǹfààní ìborí sí i ju ọwọ́ kan náà tí ó jẹ́ offsuit, ní àròpín."
      ],
      [
        "Níbo ni mo ti lè ṣe ìdánrawò yíyan ọwọ́ ìbẹ̀rẹ̀?",
        "Nínú ipò ìdánrawò PokerTH lòdì sí àwọn alátakò kọ̀ǹpútà, pẹ̀lú táàbù Àǹfààní tí ó ń fi àǹfààní rẹ láti borí hàn bí àwọn káàdì ṣe ń jáde."
      ]
    ]
  },
  zh: {
    "title": "德州扑克起手牌表 — 全部 169 种起手牌排名 | PokerTH",
    "desc": "德州扑克全部 169 种起手牌汇于一张表，按对阵一名、三名和六名对手的胜率排名。同花还是杂色、对子，以及最差的起手牌。",
    "ldHeadline": "德州扑克起手牌表：全部 169 种起手牌排名",
    "ldDesc": "德州扑克的 169 种起手牌，制成表格，并按对阵一手、三手和六手随机牌的胜率排名。",
    "h1": "德州扑克起手牌：全部 169 种排名",
    "lead": "你的两张底牌是每一手牌的第一个决定。发到两张牌共有 {combos} 种方式，但不计花色时，不同的起手牌只有 169 种。本页把它们全部列在表中并标出胜率，每一种都通过模拟一百万次发牌算出。",
    "chartH2": "起手牌表",
    "chartP": "对子沿对角线排列。对角线上方是同花牌（s，两张牌花色相同），下方是杂色牌（o）。T 代表 10。每个方格中的数字是该手牌在五张公共牌全部发出时战胜一手随机牌的几率，平局按半次获胜计算；方格越绿，牌越强。",
    "topH2": "最好的起手牌",
    "topP": "对阵一名对手时最强的二十手牌，以及它们对阵三名和六名对手时的表现：",
    "cols": [
      "排名",
      "手牌",
      "1 名对手",
      "3 名对手",
      "6 名对手"
    ],
    "multiH2": "对手越多，强牌越不同",
    "multiP": "随着更多玩家入池，每手牌的胜率都会下降，但下降速度不同，因此排名会变化。口袋 A 始终居首：单挑时 {aa1}，对阵六名对手仍有 {aa6}。同花连牌排名上升，因为它们能做成赢下大底池的顺子和同花：同花 76 从单挑时的第 {r76s1} 名升到对阵六人时的第 {r76s6} 名，同花 JT 从第 {rjts1} 名升到第 {rjts6} 名。中对下滑——口袋 7 从第 {r77_1} 名跌到第 {r77_6} 名——只有一张大牌且踢脚牌偏弱的杂色牌也一样，例如杂色 K6，从第 {rk6o1} 名跌到第 {rk6o6} 名。",
    "suitedH2": "同花还是杂色？",
    "suitedP": "两张同花色的牌比同样点数的杂色牌更值钱——在全部 78 种点数组合上平均高出约 {suitGain}，视手牌不同在 {suitMin} 到 {suitMax} 之间。这有影响，但没有看上去那么大：同花很少见，弱的同花牌仍然是弱牌。",
    "worstH2": "最差的起手牌",
    "worstP": "对阵一手随机牌时，杂色 32 是所有牌中最弱的，胜率 {w32}。杂色 72 常被称为扑克中最差的牌，它的胜率为 {w72}，单挑时在 169 种中排第 {r72} 名——但对阵六名对手时它排在最后一名，因为两张牌相距太远，无法一起组成顺子，点数又太小，难以靠别的牌型取胜。",
    "countH2": "每类起手牌拿到的频率",
    "countP": "在 {combos} 种可能的两张牌组合中，{pairCombos} 种是对子（{pairPct}），{suitedCombos} 种是同花（{suitedPct}），{offCombos} 种是杂色（{offPct}）。每个对子有 6 种发法，每手同花牌有 4 种，每手杂色牌有 12 种——这就是为什么你拿到杂色 AK 的次数是同花 AK 的三倍。",
    "useH2": "如何使用这样的表",
    "useP": "起手牌表按纯粹的牌力给手牌排名，即任何人行动之前的强弱。在真实牌桌上，前位要少玩牌，因为很多玩家在你之后行动；在按钮位和关煞位则可以多玩。玩的牌宁可加注也不要跟注，表格底部的牌直接弃掉，并记住一手牌的价值还取决于筹码量、盲注和你的对手。在 PokerTH 锦标赛中盲注不断上涨，所以随着筹码变短，值得玩的牌范围会变宽。",
    "faqH2": "常见问题",
    "faq": [
      [
        "德州扑克中最好的起手牌是什么？",
        "口袋 A。对阵一手随机牌时胜率为 {aa1}，并且对阵其他任何起手牌都占优。"
      ],
      [
        "AK 比一对 Q 更好吗？",
        "不是，但很接近：QQ 对杂色 AK 的胜率是 {qqak}。对阵一手随机牌时，同花 AK 的胜率是 {aks1}，QQ 是 {qq1}。"
      ],
      [
        "一共有多少种起手牌？",
        "{combos} 种两张牌组合，构成 169 种不同的起手牌：13 种对子、78 种同花和 78 种杂色。"
      ],
      [
        "同花牌值多少？",
        "平均而言，比同样的杂色牌高出约 {suitGain} 的胜率。"
      ],
      [
        "在哪里可以练习起手牌选择？",
        "在 PokerTH 的训练模式中对战电脑对手，「胜率」标签页会随着牌发出显示你的获胜几率。"
      ]
    ]
  },
  "zh-HK": {
    "title": "撲克起手牌表 — 全部 169 手起手牌排名 | PokerTH",
    "desc": "一張表看清 Texas Hold’em 德州撲克全部 169 手起手牌，按對一個、三個及六個對手的勝率排名。同花還是雜色、對子，以及最差的起手牌。",
    "ldHeadline": "德州撲克起手牌表：全部 169 手起手牌排名",
    "ldDesc": "Texas Hold’em 的 169 手起手牌，製成圖表並按對一手、三手及六手隨機牌的勝率排名。",
    "h1": "德州撲克起手牌：全部 169 手排名",
    "lead": "你的兩張底牌是每一手牌的第一個決定。拿到兩張牌共有 {combos} 種方式，但撇開花色不計，不同的起手牌只有 169 手。本頁把它們全部製成圖表，並附上勝率——每一手都以模擬一百萬次發牌計算得出。",
    "chartH2": "起手牌表",
    "chartP": "對子沿對角線排列。對角線以上是同花手牌（s，兩張牌同一花色），以下是雜色手牌（o）。T 代表 10。每一格中的數字，是該手牌在五張公共牌全部發出時贏一手隨機牌的機會，和局當作半勝計算；格子越綠，牌越強。",
    "topH2": "最好的起手牌",
    "topP": "對一個對手時最強的二十手牌，以及它們對三個和六個對手時的表現：",
    "cols": [
      "排名",
      "手牌",
      "1 個對手",
      "3 個對手",
      "6 個對手"
    ],
    "multiH2": "對手越多，強牌越不同",
    "multiP": "隨著更多玩家入池，每手牌的勝率都會下降，但下降速度不一，所以排名會改變。一對 A 仍然穩居榜首：單挑時 {aa1}，對六個對手時仍有 {aa6}。同花連牌排名上升，因為它們能組成贏大底池的順子和同花：同花 76 由單挑時的第 {r76s1} 位升至對六個對手時的第 {r76s6} 位，同花 JT 由第 {rjts1} 位升至第 {rjts6} 位。中對排名下跌——一對 7 由第 {r77_1} 位跌至第 {r77_6} 位——帶一張大牌但踢腳牌弱的雜色手牌亦然，例如雜色 K6，由第 {rk6o1} 位跌至第 {rk6o6} 位。",
    "suitedH2": "同花還是雜色？",
    "suitedP": "兩張同花色的牌比同樣兩張雜色牌更值錢——在全部 78 種不同點數組合中平均多約 {suitGain}，視乎手牌由 {suitMin} 至 {suitMax} 不等。這有影響，但沒有看起來那麼大：同花很少出現，而弱的同花手牌依然是弱牌。",
    "worstH2": "最差的起手牌",
    "worstP": "對一手隨機牌時，雜色 32 是所有起手牌中最弱的，勝率 {w32}。雜色 72 常被稱為撲克中最差的牌，單挑時贏 {w72}，在 169 手中排第 {r72} 位——但對六個對手時它排在最後，因為兩張牌相距太遠，無法一起組成順子，點數又太小，難以靠其他牌型取勝。",
    "countH2": "每類起手牌拿到的頻率",
    "countP": "在 {combos} 種可能的兩張牌組合中，{pairCombos} 種是對子（{pairPct}），{suitedCombos} 種是同花（{suitedPct}），{offCombos} 種是雜色（{offPct}）。每個對子有 6 種發法，每手同花牌有 4 種，每手雜色牌有 12 種——所以你看到雜色 AK 的次數是同花 AK 的三倍。",
    "useH2": "如何使用這類起手牌表",
    "useP": "起手牌表按手牌的原始強度排名，即是在任何人行動之前。在真實牌桌上，前位要少玩牌，因為很多玩家在你之後行動；在莊家按鈕位和關煞位則可以多玩。玩得的牌要加注而不是跟注，表底的牌就棄牌，並記住一手牌的價值亦取決於籌碼量、盲注和你的對手。PokerTH 錦標賽的盲注會不斷上升，所以籌碼越短，值得玩的牌範圍就越闊。",
    "faqH2": "問題",
    "faq": [
      [
        "德州撲克最好的起手牌是甚麼？",
        "一對 A。對一手隨機牌勝率 {aa1}，對其他任何起手牌都佔優。"
      ],
      [
        "AK 比一對 Q 好嗎？",
        "不是，但很接近：一對 Q 對雜色 AK 的勝率是 {qqak}。對一手隨機牌時，同花 AK 贏 {aks1}，一對 Q 贏 {qq1}。"
      ],
      [
        "起手牌共有多少手？",
        "兩張牌的組合共 {combos} 種，構成 169 手不同的起手牌：13 個對子、78 手同花牌和 78 手雜色牌。"
      ],
      [
        "同花手牌值多少？",
        "平均而言，勝率比同一手雜色牌高約 {suitGain}。"
      ],
      [
        "在哪裡可以練習選擇起手牌？",
        "在 PokerTH 的練習模式中對戰電腦對手，「勝率」分頁會隨著牌逐張發出顯示你的獲勝機率。"
      ]
    ]
  },
  "zh-TW": {
    "title": "德州撲克起手牌表 — 全部 169 手起手牌排名 | PokerTH",
    "desc": "德州撲克全部 169 手起手牌一表看懂，依對抗一、三、六名對手的勝率排名。同花還是雜色、口袋對，以及最差的起手牌。",
    "ldHeadline": "德州撲克起手牌表：全部 169 手起手牌排名",
    "ldDesc": "德州撲克的 169 手起手牌，依對抗一、三、六手隨機牌的勝率製表排名。",
    "h1": "德州撲克起手牌：全部 169 手排名",
    "lead": "你的兩張底牌是每一手牌的第一個決定。發兩張牌共有 {combos} 種組合，但不計花色的話，只有 169 種不同的起手牌。本頁把它們全部列成一張表並附上勝率；每一手牌都模擬發牌一百萬次計算而來。",
    "chartH2": "起手牌表",
    "chartP": "對子沿對角線排列。對角線上方是同花牌（s，兩張牌同一花色），下方是雜色牌（o）。T 代表 10。每一格的數字是這手牌在五張公共牌全部發出時贏過一手隨機牌的機率，平手算半場勝利；格子越綠，牌越強。",
    "topH2": "最好的起手牌",
    "topP": "對抗一名對手時最強的二十手牌，以及它們對抗三名和六名對手的表現：",
    "cols": [
      "排名",
      "手牌",
      "1 名對手",
      "3 名對手",
      "6 名對手"
    ],
    "multiH2": "對手越多，強牌不同",
    "multiP": "隨著更多玩家入池，每手牌的勝率都會下降，但下降的速度不同，所以排名會改變。口袋 A 始終排第一：單挑時 {aa1}，對抗六名對手仍有 {aa6}。同花連牌的排名會上升，因為它們能做成贏得大底池的順子和同花：同花 76 從單挑的第 {r76s1} 名升到對抗六人時的第 {r76s6} 名，同花 JT 從第 {rjts1} 名升到第 {rjts6} 名。中對子則會下滑——一對 7 從第 {r77_1} 名跌到第 {r77_6} 名——只有一張大牌、踢腳牌又弱的雜色牌也一樣，例如雜色 K6 從第 {rk6o1} 名跌到第 {rk6o6} 名。",
    "suitedH2": "同花還是雜色？",
    "suitedP": "兩張同花色的牌比同樣點數的雜色牌更值錢——在全部 78 種點數組合中平均約多 {suitGain}，視牌而定，介於 {suitMin} 到 {suitMax} 之間。這有影響，但沒有看起來那麼大：同花很少成牌，而弱的同花牌依然是弱牌。",
    "worstH2": "最差的起手牌",
    "worstP": "對抗一手隨機牌時，雜色 32 是所有牌中最弱的，勝率 {w32}。常被稱為撲克最爛起手牌的雜色 72 勝率為 {w72}，單挑時在 169 手中排第 {r72} 名——但對抗六名對手時它是倒數第一，因為兩張牌相隔太遠，無法一起組成順子，點數又太小，很難靠別的牌型獲勝。",
    "countH2": "每種牌拿到的頻率",
    "countP": "在 {combos} 種可能的兩張牌組合中，{pairCombos} 種是對子（{pairPct}），{suitedCombos} 種是同花（{suitedPct}），{offCombos} 種是雜色（{offPct}）。每個對子有 6 種發法，每手同花牌有 4 種，每手雜色牌有 12 種——所以你拿到雜色 AK 的次數是同花 AK 的三倍。",
    "useH2": "如何使用這樣的起手牌表",
    "useP": "起手牌表只依原始牌力排名，也就是在任何人行動之前。在真正的牌桌上，前位要少玩一些牌，因為之後還有很多玩家要行動；在莊家按鈕位和關煞位（cut-off）則可以多玩。玩的牌要用 Raise 而不是 Call，表格最下方的牌就 Fold，並記得一手牌的價值也取決於籌碼量、盲注和你的對手。在 PokerTH 錦標賽中盲注會不斷上漲，所以當籌碼變短時，值得玩的牌也會變多。",
    "faqH2": "常見問題",
    "faq": [
      [
        "德州撲克最好的起手牌是什麼？",
        "口袋 A。對抗一手隨機牌的勝率為 {aa1}，對上任何其他起手牌都佔優勢。"
      ],
      [
        "AK 比一對 Q 強嗎？",
        "不會，但很接近：一對 Q 對上雜色 AK 的勝率是 {qqak}。對抗一手隨機牌時，同花 AK 的勝率是 {aks1}，一對 Q 是 {qq1}。"
      ],
      [
        "起手牌總共有幾種？",
        "{combos} 種兩張牌組合，構成 169 種不同的起手牌：13 種對子、78 種同花和 78 種雜色。"
      ],
      [
        "同花牌值多少？",
        "平均而言，比同一手雜色牌的勝率高約 {suitGain}。"
      ],
      [
        "哪裡可以練習起手牌選擇？",
        "在 PokerTH 的練習模式中對戰電腦對手，「勝率」分頁會隨著發牌顯示你的獲勝機率。"
      ]
    ]
  },
  zu: {
    "title": "Izandla zokuqala ze-poker — zonke ezingu-169 zihlelwe | PokerTH",
    "desc": "Izandla zokuqala ezingu-169 ze-Texas Hold’em, zihlelwe ngethuba lokuwina kubaphikisi abangu-1, 3 no-6. Umbala ofanayo noma ohlukene, ama-pair nesandla esibi kakhulu.",
    "ldHeadline": "Ithebula lezandla zokuqala ze-Texas Hold’em: zonke ezingu-169 zihlelwe",
    "ldDesc": "Izandla zokuqala ezingu-169 ze-Texas Hold’em ethebulweni, zihlelwe ngethuba lazo lokuwina ngokumelene nesandla esisodwa, ezintathu nezisithupha ezingahleliwe.",
    "h1": "Izandla zokuqala ze-Texas Hold’em: zonke ezingu-169, zihlelwe",
    "lead": "Amakhadi akho amabili ephakethe ayisinqumo sokuqala sesandla ngasinye. Kunezindlela ezingu-{combos} zokwabiwa amakhadi amabili, kodwa zingu-169 kuphela izandla zokuqala ezahlukene uma imibala ibekwa eceleni. Leli khasi lizibonisa zonke ethebulweni kanye nethuba lazo lokuwina, elibalwe ngokulingisa ukwaba okuyisigidi esisodwa kwesandla ngasinye.",
    "chartH2": "Ithebula lezandla zokuqala",
    "chartP": "Ama-pair ahamba ngomugqa ophambanayo (i-diagonal). Ngenhla kwawo kunezandla ezinombala ofanayo (s, womabili amakhadi anombala ofanayo), ngezansi kwawo izandla ezinemibala ehlukene (o). U-T usho ishumi. Inombolo esikweleni ngasinye yithuba lokuthi isandla siwine ngokumelene nesandla esisodwa esingahleliwe lapho wonke amakhadi amahlanu e-board esabiwe, ukulingana kubalwa njengengxenye yokuwina; uma isikwele siluhlaza okwesotshani kakhulu, isandla siqine kakhulu.",
    "topH2": "Izandla zokuqala ezingcono kakhulu",
    "topP": "Izandla ezingamashumi amabili eziqine kakhulu ngokumelene nomphikisi oyedwa, nokuthi zimelana kanjani nabathathu nabayisithupha:",
    "cols": [
      "Indawo",
      "Isandla",
      "Umphikisi o-1",
      "Abaphikisi aba-3",
      "Abaphikisi aba-6"
    ],
    "multiH2": "Abaphikisi abaningi, izandla ezahlukene",
    "multiP": "Isandla ngasinye siwina kancane njengoba abadlali bengena ku-pot, kodwa hhayi ngesivinini esifanayo, ngakho ukulandelana kuyashintsha. Ama-ace ephakethe ahlala phezulu: {aa1} ku-heads-up, futhi namanje {aa6} ngokumelene nabaphikisi abayisithupha. Ama-suited connectors ayakhuphuka, ngoba akha ama-Straight nama-Flush awina ama-pot amakhulu: i-seven-six enombala ofanayo isuka endaweni engu-{r76s1} ku-heads-up iye endaweni engu-{r76s6} ngokumelene nabayisithupha, i-jack-ten enombala ofanayo isuka ku-{rjts1} iye ku-{rjts6}. Ama-pair aphakathi ayehla — ama-seven awa esuka endaweni engu-{r77_1} aye ku-{r77_6} — kanjalo nezandla ezinemibala ehlukene ezinekhadi elilodwa eliphezulu ne-kicker ebuthakathaka, njenge-king-six enemibala ehlukene, isuka ku-{rk6o1} iye ku-{rk6o6}.",
    "suitedH2": "Umbala ofanayo noma imibala ehlukene?",
    "suitedP": "Amakhadi amabili anombala ofanayo abaluleke kakhulu kunamakhadi afanayo anemibala ehlukene — cishe ngo-{suitGain} ngaphezulu ngokwesilinganiso kuzo zonke izinhlanganisela ezingu-78 zamanani, kusukela ku-{suitMin} kuya ku-{suitMax} kuya ngesandla. Kubalulekile, kodwa kancane kunalokho okubonakalayo: ama-Flush ayavela kancane, futhi isandla esibuthakathaka esinombala ofanayo sisalokhu siyisandla esibuthakathaka.",
    "worstH2": "Isandla sokuqala esibi kakhulu",
    "worstP": "Ngokumelene nesandla esisodwa esingahleliwe, i-three-two enemibala ehlukene ibuthakathaka kunazo zonke ngo-{w32}. I-seven-two enemibala ehlukene, evame ukubizwa ngokuthi isandla esibi kakhulu ku-poker, iwina {w72} futhi isendaweni engu-{r72} kwezingu-169 ku-heads-up — kodwa ngokumelene nabaphikisi abayisithupha iyona yokugcina impela, ngoba amakhadi ayo amabili aqhelelene kakhulu ukuthi akhe i-Straight ndawonye futhi aphansi kakhulu ukuthi awine okunye okuningi.",
    "countH2": "Kangaki uthola uhlobo ngalunye",
    "countP": "Ezandleni ezingu-{combos} ezingenzeka zamakhadi amabili, ezingu-{pairCombos} ngama-pair ({pairPct}), ezingu-{suitedCombos} zinombala ofanayo ({suitedPct}) kanti ezingu-{offCombos} zinemibala ehlukene ({offPct}). I-pair ngayinye ingabiwa ngezindlela ezingu-6, isandla ngasinye esinombala ofanayo ngezindlela ezingu-4, isandla ngasinye esinemibala ehlukene ngezindlela ezingu-12 — yingakho ubona i-ace-king enemibala ehlukene kathathu kaningi kune-ace-king enombala ofanayo.",
    "useH2": "Indlela yokusebenzisa ithebula elinjengaleli",
    "useP": "Ithebula lihlela izandla ngamandla azo angahluziwe, ngaphambi kokuba noma ubani enze isinyathelo. Etafuleni langempela, dlala izandla ezimbalwa usendaweni yokuqala, lapho abadlali abaningi benza izinyathelo ngemuva kwakho, nezandla eziningi usenkinobhweni yomabi naku-cut-off. Yenza i-raise esikhundleni se-call ngezandla ozidlalayo, yenza i-fold ngezandla ezingezansi kwethebula, futhi ukhumbule ukuthi ukubaluleka kwesandla kuncike nakuzitaki, kuma-blinds nakubaphikisi bakho. Emqhudelwaneni we-PokerTH ama-blinds aqhubeka ekhuphuka, ngakho izandla okufanele zidlalwe ziyanda njengoba izitaki zincipha.",
    "faqH2": "Imibuzo",
    "faq": [
      [
        "Yisiphi isandla sokuqala esingcono kakhulu ku-Texas Hold’em?",
        "Ama-ace ephakethe. Awina {aa1} ngokumelene nesandla esisodwa esingahleliwe, futhi anethuba elingcono ngokumelene nanoma yisiphi esinye isandla sokuqala."
      ],
      [
        "Ingabe i-ace-king ingcono kune-pair yama-queen?",
        "Cha, kodwa kuseduze: ama-queen awina {qqak} ngokumelene ne-ace-king enemibala ehlukene. Ngokumelene nesandla esisodwa esingahleliwe, i-ace-king enombala ofanayo iwina {aks1} kanti ama-queen awina {qq1}."
      ],
      [
        "Zingaki izandla zokuqala ezikhona?",
        "Izinhlanganisela zamakhadi amabili ezingu-{combos}, ezakha izandla zokuqala ezingu-169 ezahlukene: ama-pair angu-13, ezingu-78 ezinombala ofanayo nezingu-78 ezinemibala ehlukene."
      ],
      [
        "Isandla esinombala ofanayo sibaluleke kangakanani?",
        "Ngokwesilinganiso, ithuba lokuwina eliphakeme cishe ngo-{suitGain} kunelesandla esifanayo esinemibala ehlukene."
      ],
      [
        "Ngingazijwayeza kuphi ukukhetha izandla zokuqala?",
        "Kumodi yokuziqeqesha ye-PokerTH ubhekene nabaphikisi bekhompyutha, lapho ithebhu elithi Amathuba ikubonisa ithuba lakho lokuwina njengoba amakhadi evezwa."
      ]
    ]
  }
};
