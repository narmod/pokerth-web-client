'use strict';
// Translations for the /play-against-computer page (training mode against
// the bots: difficulty levels, playing styles, formats, trophies, offline).
//
// English lives in proxy.js (_SEO_BOTS) and is the fallback; a language is
// advertised (hreflang, sitemap, nav link, IndexNow) the moment its entry
// lands here, never before. Same keys as _SEO_BOTS: steps[3], levels[4],
// styles[5] and faq[5] are [title, text] pairs in the English order.
module.exports = {
  af: {
    "title": "Speel poker teen die rekenaar — gratis, aflyn | PokerTH",
    "desc": "Gratis Texas Hold’em teen rekenaarteenstanders: tot 9 bots aan jou tafel, van maklik tot moeilik. Geen rekening, geen geld, en dit werk aflyn op foon en PC.",
    "ldHeadline": "Speel Texas Hold’em-poker teen die rekenaar, gratis en aflyn",
    "ldDesc": "Oefenmodus van die PokerTH-webkliënt: Texas Hold’em teen rekenaarteenstanders, met moeilikheidsvlakke, speelstyle en trofeë.",
    "h1": "Speel poker teen die rekenaar, gratis en aflyn",
    "lead": "Die oefenmodus van PokerTH deel volledige Texas Hold’em-toernooie teen rekenaarteenstanders, reg in jou blaaier. Geen rekening nie, geen verbinding sodra die webwerf oopgemaak is nie, en niks op die spel nie: die plek om die spel te leer, ’n nuwe strategie te probeer, of ’n vinnige spel op die trein te speel.",
    "stepsH2": "Begin ’n spel in drie stappe",
    "steps": [
      [
        "Maak PokerTH oop en kies Plaaslik / oefening",
        "Maak hierdie webwerf oop en kies Plaaslik / oefening op die eerste skerm. Daar is geen aanmelding en niks om af te laai nie; sodra die webwerf oopgemaak is, werk die modus ook sonder ’n verbinding."
      ],
      [
        "Stel jou tafel op",
        "Kies tot 9 rekenaarteenstanders, die beginstapel, hoe vinnig die blindes styg en die spelspoed, of begin met ’n gereedgemaakte formaat. Kies die bots se moeilikheidsgraad in dieselfde venster."
      ],
      [
        "Begin die spel",
        "Druk Begin: die leë plekke word deur rekenaarspelers gevul en die kaarte word uitgedeel. Die spel duur totdat een speler al die fiches het."
      ]
    ],
    "levelsH2": "Vier moeilikheidsvlakke",
    "levels": [
      [
        "Maklik",
        "Bots wat hul hande verkeerd beoordeel en selde bluf: die regte teenstanders vir ’n eerste spel."
      ],
      [
        "Normaal",
        "Soliede teenstanders wat hul kanse goed lees en korrek speel wanneer hul stapel kort word."
      ],
      [
        "Moeilik",
        "Die sterkste bots: presiese handlees, skerp spel met ’n kort stapel en meer bluf."
      ],
      [
        "Gemeng",
        "’n Gevarieerde tafel, die verstek: gemiddeld drie maklike bots, vyf normale en twee moeilike uit elke tien."
      ]
    ],
    "brainH2": "Hoe die bots dink",
    "brainP": "Elke bot bereken sy werklike kans om die hand te wen deur die oorblywende kaarte baie kere uit te deel, teen die aantal spelers wat nog in die pot is. Hy speel strenger in ’n vroeë posisie en steel uit ’n laat posisie, maak ’n vervolgweddenskap (continuation bet) nadat hy voor die flop verhoog het, semi-bluf met sterk trekke en skakel, vanaf die normale vlak, oor na All-In-of-Fold-spel wanneer sy stapel kort word.",
    "stylesH2": "Vyf speelstyle",
    "stylesP": "Die moeilikheidsgraad bepaal hoe goed ’n bot die spel lees; sy styl bepaal hoe hy speel. Elke nuwe tafel meng:",
    "styles": [
      [
        "Rock",
        "baie tight en versigtig, gaan in min potte in en bluf selde."
      ],
      [
        "Tight-aggressive (TAG)",
        "kies goeie hande en wed hulle hard."
      ],
      [
        "Loose-aggressive (LAG)",
        "speel baie hande en sit jou onder druk."
      ],
      [
        "Calling station",
        "maak veels te dikwels gelyk en verhoog selde."
      ],
      [
        "Maniac",
        "verhoog en bluf aanhoudend."
      ]
    ],
    "formatsH2": "Oefen die regte formate",
    "formatsP": "Gereedgemaakte instellings laat jou ’n spel op Kalm, Normaal of Vinnig begin, of oefen onder die toestande van die pokerth.net-kompetisies: die amptelike Ranking-tempo, die We Cup en die BBC met sy tydgebaseerde blindes. Jou eie instellings kan as ’n eie formaat gestoor word.",
    "trophiesH2": "Trofeë en statistieke",
    "trophiesP": "Die oefenmodus het sy eie vordering: meer as dertig trofeë in ses kategorieë — hande gespeel, spelle gewen, wenreekse, ’n oorwinning teen nege moeilike bots, bluf, en ’n paar geheime. Statistieke teen die bots word apart van jou aanlyn spelle gehou, en wanneer jy met ’n pokerth.net-rekening aanmeld, volg jou trofeë jou na jou ander toestelle.",
    "learnH2": "Die beste plek om te leer",
    "learnP": "Elke hulpmiddel van die webkliënt werk hier sonder druk: die Kanse-oortjie met jou kans om te wen soos die kaarte uitkom, die handsterkte-aanwyser, vooraf gekose aksies en sleutelbordkortpaaie. Wanneer jy gereed voel, wag dieselfde tafel op pokerth.net vir jou teen regte spelers.",
    "offlineH2": "Aflyn, op elke toestel",
    "offlineP": "PokerTH is ’n webtoepassing: dit loop in die blaaier op iPhone, Android, Windows, macOS en Linux, en kan soos ’n toep by die tuisskerm gevoeg word. Sodra dit oopgemaak is, het die oefenmodus glad geen verbinding nodig nie — in vliegtuigmodus, in die moltrein of enige plek sonder sein.",
    "faqH2": "Vrae",
    "faq": [
      [
        "Kan ek gratis poker teen die rekenaar speel?",
        "Ja. PokerTH is gratis oopbronsagteware, sonder advertensies en sonder aankope in die toep. Fiches is net speelgeld."
      ],
      [
        "Het ek ’n rekening of ’n verbinding nodig?",
        "Nee. Die oefenmodus het geen rekening nodig nie, en sodra die webwerf oopgemaak is, werk dit sonder ’n verbinding."
      ],
      [
        "Teen hoeveel rekenaarteenstanders kan ek speel?",
        "Tot 9, vir ’n vol tafel van 10 spelers, of net een vir ’n spel een teen een."
      ],
      [
        "Is die bots goed?",
        "Dit hang van jou af: maklike bots maak foute, moeilike bots lees hul kanse presies en bluf meer, en die gemengde tafel meng die drie vlakke met vyf speelstyle."
      ],
      [
        "Kan ek met vriende en bots aan dieselfde tafel speel?",
        "Ja. Wanneer jy ’n tafel op jou eie PokerTH-bediener aanbied, op ’n LAN of op die internet, kan die wagkamer die leë plekke met rekenaarspelers vul."
      ]
    ]
  },
  am: {
    "title": "ከኮምፒውተር ጋር ፖከር ይጫወቱ — ነጻ፣ ከመስመር ውጭ | PokerTH",
    "desc": "ነጻ Texas Hold’em ከኮምፒውተር ተቃዋሚዎች ጋር፣ በጠረጴዛዎ እስከ 9 ቦቶች፣ ከቀላል እስከ ከባድ። መለያ የለም፣ ገንዘብ የለም፣ እና በስልክና በኮምፒውተር ከመስመር ውጭ ይሠራል።",
    "ldHeadline": "ከኮምፒውተር ጋር Texas Hold’em ፖከር ይጫወቱ፣ በነጻ እና ከመስመር ውጭ",
    "ldDesc": "የ PokerTH ድር ደንበኛ የልምምድ ሁነታ፦ Texas Hold’em ከኮምፒውተር ተቃዋሚዎች ጋር፣ ከችግር ደረጃዎች፣ ከጨዋታ ዘይቤዎች እና ከዋንጫዎች ጋር።",
    "h1": "ከኮምፒውተር ጋር ፖከር ይጫወቱ፣ በነጻ እና ከመስመር ውጭ",
    "lead": "የ PokerTH የልምምድ ሁነታ ሙሉ የ Texas Hold’em ውድድሮችን ከኮምፒውተር ተቃዋሚዎች ጋር በቀጥታ በአሳሽዎ ውስጥ ያከፋፍላል። መለያ አያስፈልግም፣ ጣቢያው አንዴ ከተከፈተ በኋላ ግንኙነት አያስፈልግም፣ እና ምንም ነገር አደጋ ላይ አይደለም፦ ጨዋታውን ለመማር፣ አዲስ ስልት ለመሞከር ወይም በባቡር ላይ ፈጣን ጨዋታ ለመጫወት ተስማሚው ቦታ።",
    "stepsH2": "ጨዋታን በሦስት ደረጃዎች ይጀምሩ",
    "steps": [
      [
        "PokerTHን ይክፈቱ እና አካባቢያዊ / ልምምድ ይምረጡ",
        "ይህን ጣቢያ ይክፈቱ እና በመጀመሪያው ማያ ላይ አካባቢያዊ / ልምምድ ይምረጡ። መግቢያም ማውረድም የለም፤ ጣቢያው አንዴ ከተከፈተ በኋላ ሁነታው ያለ ግንኙነትም ይሠራል።"
      ],
      [
        "ጠረጴዛዎን ያዘጋጁ",
        "እስከ 9 የኮምፒውተር ተቃዋሚዎችን፣ የመነሻ ስታክን፣ ብላይንዶች ምን ያህል በፍጥነት እንደሚጨምሩ እና የጨዋታውን ፍጥነት ይምረጡ፣ ወይም ከተዘጋጀ ቅርጸት ይጀምሩ። የቦቶቹን የችግር ደረጃ በዚያው መስኮት ይምረጡ።"
      ],
      [
        "ጨዋታውን ይጀምሩ",
        "ጀምር የሚለውን ይጫኑ፦ ባዶ መቀመጫዎች በኮምፒውተር ተጫዋቾች ይሞላሉ እና ካርታዎቹ ይከፋፈላሉ። ጨዋታው አንድ ተጫዋች ሁሉንም ቺፖች እስኪይዝ ድረስ ይቀጥላል።"
      ]
    ],
    "levelsH2": "አራት የችግር ደረጃዎች",
    "levels": [
      [
        "ቀላል",
        "እጃቸውን በተሳሳተ መንገድ የሚገመግሙ እና እምብዛም ብሉፍ የማያደርጉ ቦቶች፦ ለመጀመሪያ ጨዋታ ትክክለኛዎቹ ተቃዋሚዎች።"
      ],
      [
        "መደበኛ",
        "ዕድላቸውን በደንብ የሚያነቡ እና ስታካቸው ሲያጥር በትክክል የሚጫወቱ ጠንካራ ተቃዋሚዎች።"
      ],
      [
        "ከባድ",
        "በጣም ጠንካራዎቹ ቦቶች፦ ትክክለኛ የእጅ ንባብ፣ በአጭር ስታክ ስለታም ጨዋታ እና ተጨማሪ ብሉፎች።"
      ],
      [
        "ድብልቅ",
        "የተለያየ ጠረጴዛ፣ ነባሪው ምርጫ፦ በአማካይ ከእያንዳንዱ አሥር ቦቶች ውስጥ ሦስት ቀላል፣ አምስት መደበኛ እና ሁለት ከባድ።"
      ]
    ],
    "brainH2": "ቦቶቹ እንዴት እንደሚያስቡ",
    "brainP": "እያንዳንዱ ቦት የቀሩትን ካርታዎች ብዙ ጊዜ በማከፋፈል፣ በፖቱ ውስጥ አሁንም ካሉት ተጫዋቾች ብዛት አንጻር፣ እጁን የማሸነፍ እውነተኛ ዕድሉን ያሰላል። በመጀመሪያ ቦታ ላይ ይበልጥ ጠበቅ ብሎ ይጫወታል፣ ከመጨረሻ ቦታ ደግሞ ይሰርቃል (steal)፤ ከፍሎፕ በፊት Raise ካደረገ በኋላ continuation bet ያደርጋል፣ በጠንካራ draw ሴሚ-ብሉፍ ያደርጋል፣ እና ከመደበኛ ደረጃ ጀምሮ ስታኩ ሲያጥር ወደ all-in ወይም Fold ጨዋታ ይቀየራል።",
    "stylesH2": "አምስት የጨዋታ ዘይቤዎች",
    "stylesP": "የችግር ደረጃው ቦቱ ጨዋታውን ምን ያህል በደንብ እንደሚያነብ ይወስናል፤ ዘይቤው ደግሞ እንዴት እንደሚጫወት ይወስናል። እያንዳንዱ አዲስ ጠረጴዛ የሚከተሉትን ያቀላቅላል፦",
    "styles": [
      [
        "Rock",
        "በጣም ጠባብ እና ጥንቁቅ፣ ወደ ጥቂት ፖቶች ብቻ ይገባል እና እምብዛም ብሉፍ አያደርግም።"
      ],
      [
        "Tight-aggressive (TAG)",
        "ጥሩ እጆችን መርጦ በእነሱ በጠንካራ ሁኔታ ይወራረዳል።"
      ],
      [
        "Loose-aggressive (LAG)",
        "ብዙ እጆችን ይጫወታል እና ጫና ያሳድርብዎታል።"
      ],
      [
        "Calling station",
        "በጣም ብዙ ጊዜ Call ያደርጋል እና እምብዛም Raise አያደርግም።"
      ],
      [
        "Maniac",
        "ያለማቋረጥ Raise እና ብሉፍ ያደርጋል።"
      ]
    ],
    "formatsH2": "እውነተኛዎቹን ቅርጸቶች ይለማመዱ",
    "formatsP": "የተዘጋጁ ቅንብሮች “ዘና ያለ”፣ “መደበኛ” ወይም “ፈጣን” ጨዋታ እንዲጀምሩ፣ ወይም በ pokerth.net ውድድሮች ሁኔታ እንዲለማመዱ ያስችሉዎታል፦ ኦፊሴላዊው የ“ደረጃ” ፍጥነት፣ We Cup እና በጊዜ ላይ የተመሠረቱ ብላይንዶች ያሉት BBC። የራስዎን ቅንብሮች እንደ የራስዎ ቅርጸት ማስቀመጥ ይችላሉ።",
    "trophiesH2": "ዋንጫዎች እና ስታቲስቲክስ",
    "trophiesP": "የልምምድ ሁነታ የራሱ እድገት አለው፦ በስድስት ምድቦች ከሠላሳ በላይ ዋንጫዎች — የተጫወቱ እጆች፣ ያሸነፉ ጨዋታዎች፣ ተከታታይ ድሎች፣ በዘጠኝ ከባድ ቦቶች ላይ የተገኘ ድል፣ ብሉፎች እና ጥቂት ሚስጥሮች። ከቦቶች ጋር ያለው ስታቲስቲክስ ከመስመር ላይ ጨዋታዎችዎ ተለይቶ ይቀመጣል፣ እና በ pokerth.net መለያ ሲገቡ ዋንጫዎችዎ ወደ ሌሎች መሣሪያዎችዎ ይከተሉዎታል።",
    "learnH2": "ለመማር ምርጡ ቦታ",
    "learnP": "የድር ደንበኛው እያንዳንዱ እገዛ እዚህ ያለ ጫና ይሠራል፦ ካርታዎች ሲወጡ የማሸነፍ ዕድልዎን የሚያሳየው የ“ዕድሎች” ትር፣ የእጅ ጥንካሬ ማሳያ፣ አስቀድመው የሚመረጡ እርምጃዎች እና የቁልፍ ሰሌዳ አቋራጮች። ዝግጁ እንደሆኑ ሲሰማዎት፣ ያው ጠረጴዛ በ pokerth.net ላይ ከእውነተኛ ተጫዋቾች ጋር ይጠብቅዎታል።",
    "offlineH2": "ከመስመር ውጭ፣ በማንኛውም መሣሪያ",
    "offlineP": "PokerTH የድር መተግበሪያ ነው፦ በ iPhone፣ Android፣ Windows፣ macOS እና Linux ላይ በአሳሹ ውስጥ ይሠራል፣ እና እንደ መተግበሪያ ወደ መነሻ ማያ ሊታከል ይችላል። አንዴ ከተከፈተ በኋላ የልምምድ ሁነታ ምንም ግንኙነት አያስፈልገውም — በአውሮፕላን ሁነታ፣ በሜትሮ ውስጥ ወይም ምልክት በሌለበት በማንኛውም ቦታ።",
    "faqH2": "ጥያቄዎች",
    "faq": [
      [
        "ከኮምፒውተር ጋር ፖከርን በነጻ መጫወት እችላለሁ?",
        "አዎ። PokerTH ነጻ እና ክፍት ምንጭ ሶፍትዌር ነው፣ ማስታወቂያም ሆነ በመተግበሪያ ውስጥ ግዢ የለውም። ቺፖቹ የጨዋታ ገንዘብ ብቻ ናቸው።"
      ],
      [
        "መለያ ወይም ግንኙነት ያስፈልገኛል?",
        "አያስፈልግም። የልምምድ ሁነታ መለያ አያስፈልገውም፣ እና ጣቢያው አንዴ ከተከፈተ በኋላ ያለ ግንኙነት ይሠራል።"
      ],
      [
        "ከስንት የኮምፒውተር ተቃዋሚዎች ጋር መጫወት እችላለሁ?",
        "እስከ 9 ድረስ፣ ለ 10 ተጫዋቾች ሙሉ ጠረጴዛ፣ ወይም ራስ-ለ-ራስ ለመጫወት ከአንዱ ብቻ ጋር።"
      ],
      [
        "ቦቶቹ ጎበዝ ናቸው?",
        "ያ በእርስዎ ምርጫ ይወሰናል፦ ቀላል ቦቶች ስህተት ይሠራሉ፣ ከባድ ቦቶች ዕድላቸውን በትክክል ያነባሉ እና የበለጠ ብሉፍ ያደርጋሉ፣ ድብልቅ ጠረጴዛውም ሦስቱን ደረጃዎች ከአምስት የጨዋታ ዘይቤዎች ጋር ያቀላቅላል።"
      ],
      [
        "ከጓደኞች እና ከቦቶች ጋር በአንድ ጠረጴዛ መጫወት እችላለሁ?",
        "አዎ። በራስዎ PokerTH አገልጋይ ላይ፣ በ LAN ወይም በኢንተርኔት ጠረጴዛ ሲያስተናግዱ፣ የመጠበቂያ ክፍሉ ባዶ መቀመጫዎችን በኮምፒውተር ተጫዋቾች ሊሞላ ይችላል።"
      ]
    ]
  },
  ar: {
    "title": "العب البوكر ضد الكمبيوتر — مجانًا وبلا إنترنت | PokerTH",
    "desc": "Texas Hold’em مجانًا ضد خصوم يديرهم الكمبيوتر، حتى 9 روبوتات على طاولتك، من السهل إلى الصعب. بلا حساب وبلا مال، ويعمل دون اتصال على الهاتف والحاسوب.",
    "ldHeadline": "العب بوكر Texas Hold’em ضد الكمبيوتر، مجانًا ودون اتصال",
    "ldDesc": "وضع التدريب في عميل PokerTH على الويب: Texas Hold’em ضد خصوم يديرهم الحاسوب، مع مستويات صعوبة وأساليب لعب وجوائز.",
    "h1": "العب البوكر ضد الكمبيوتر، مجانًا وبلا إنترنت",
    "lead": "يوزّع وضع التدريب في PokerTH بطولات Texas Hold’em كاملة ضد خصوم يديرهم الحاسوب، مباشرة في متصفحك. بلا حساب، وبلا اتصال بعد فتح الموقع مرة، ولا شيء على المحك: المكان المناسب لتعلّم اللعبة، أو تجربة استراتيجية جديدة، أو لعب مباراة سريعة في القطار.",
    "stepsH2": "ابدأ مباراة في ثلاث خطوات",
    "steps": [
      [
        "افتح PokerTH واختر «محلي / تدريب»",
        "افتح هذا الموقع واختر «محلي / تدريب» في الشاشة الأولى. لا تسجيل دخول ولا تنزيل؛ وبعد فتح الموقع مرة، يعمل هذا الوضع أيضًا دون اتصال."
      ],
      [
        "جهّز طاولتك",
        "اختر حتى 9 خصوم يديرهم الحاسوب، ورصيد البداية، وسرعة ارتفاع الرهانات العمياء، وسرعة اللعب، أو ابدأ من صيغة جاهزة. واختر صعوبة الروبوتات في النافذة نفسها."
      ],
      [
        "ابدأ المباراة",
        "اضغط «ابدأ»: تمتلئ المقاعد الشاغرة بلاعبين يديرهم الحاسوب وتُوزَّع الأوراق. وتستمر المباراة حتى يجمع لاعب واحد كل الرقائق."
      ]
    ],
    "levelsH2": "أربعة مستويات صعوبة",
    "levels": [
      [
        "سهل",
        "روبوتات تُخطئ في تقدير أيديها ونادرًا ما تخادع: الخصوم المناسبون لأول مباراة."
      ],
      [
        "عادي",
        "خصوم متمكّنون يقرؤون فرصهم جيدًا ويلعبون بشكل صحيح حين يتقلّص رصيدهم."
      ],
      [
        "صعب",
        "أقوى الروبوتات: قراءة دقيقة للأيدي، ولعب حادّ برصيد قصير، ومزيد من الخداع."
      ],
      [
        "مختلط",
        "طاولة متنوّعة، وهي الإعداد الافتراضي: في المتوسط ثلاثة روبوتات سهلة وخمسة عادية واثنان صعبان من كل عشرة."
      ]
    ],
    "brainH2": "كيف تفكّر الروبوتات",
    "brainP": "يحسب كل روبوت فرصته الحقيقية في الفوز باليد بتوزيع الأوراق المتبقية مرات كثيرة، أمام عدد اللاعبين الذين ما زالوا في القدر. يلعب بتحفّظ أكبر في المراكز المبكرة ويسرق من المراكز المتأخرة، ويراهن رهان استمرار (continuation bet) بعد الزيادة قبل الفلوب، ويخادع خداعًا جزئيًا بالمشاريع القوية، ومن المستوى العادي فصاعدًا ينتقل إلى لعب All-In أو Fold حين يتقلّص رصيده.",
    "stylesH2": "خمسة أساليب لعب",
    "stylesP": "الصعوبة تحدّد مدى جودة قراءة الروبوت للعبة؛ وأسلوبه يحدّد طريقة لعبه. تمزج كل طاولة جديدة بين:",
    "styles": [
      [
        "الصخرة",
        "متحفّظ وحذر جدًا، يدخل قدورًا قليلة ونادرًا ما يخادع."
      ],
      [
        "المتحفّظ العدواني",
        "ينتقي أيديًا جيدة ويراهن بها بقوة."
      ],
      [
        "المنفتح العدواني",
        "يلعب أيديًا كثيرة ويضغط عليك."
      ],
      [
        "محطة المجاراة",
        "يجاري كثيرًا جدًا ونادرًا ما يزيد."
      ],
      [
        "المتهوّر",
        "يزيد ويخادع باستمرار."
      ]
    ],
    "formatsH2": "تدرّب على الصيغ الحقيقية",
    "formatsP": "تتيح لك الإعدادات الجاهزة بدء مباراة «هادئ» أو «عادي» أو «سريع»، أو التدرّب في ظروف مسابقات pokerth.net: الإيقاع الرسمي «تصنيف»، وWe Cup، وBBC برهاناتها العمياء الزمنية. ويمكن حفظ إعداداتك كصيغة خاصة بك.",
    "trophiesH2": "الجوائز والإحصاءات",
    "trophiesP": "لوضع التدريب تقدّمه الخاص: أكثر من ثلاثين جائزة في ست فئات — الأيدي الملعوبة، والمباريات المكسوبة، وسلاسل الانتصارات، والفوز على تسعة روبوتات صعبة، والخداع، وبعض الأسرار. وتُحفظ الإحصاءات ضد الروبوتات منفصلة عن مبارياتك على الإنترنت، وحين تسجّل الدخول بحساب pokerth.net تتبعك جوائزك إلى أجهزتك الأخرى.",
    "learnH2": "أفضل مكان للتعلّم",
    "learnP": "تعمل كل أدوات المساعدة في عميل الويب هنا دون ضغط: تبويب «الاحتمالات» مع فرصتك في الفوز كلما ظهرت الأوراق، وعرض قوة اليد، والإجراءات المحدّدة مسبقًا، واختصارات لوحة المفاتيح. وحين تشعر بأنك مستعد، تنتظرك الطاولة نفسها على pokerth.net أمام لاعبين حقيقيين.",
    "offlineH2": "دون اتصال، على كل جهاز",
    "offlineP": "PokerTH تطبيق ويب: يعمل في المتصفح على iPhone وAndroid وWindows وmacOS وLinux، ويمكن إضافته إلى الشاشة الرئيسية كتطبيق. وبعد فتحه، لا يحتاج وضع التدريب إلى أي اتصال — في وضع الطيران، أو في المترو، أو في أي مكان بلا إشارة.",
    "faqH2": "أسئلة",
    "faq": [
      [
        "هل يمكنني لعب البوكر ضد الكمبيوتر مجانًا؟",
        "نعم. PokerTH برنامج مجاني ومفتوح المصدر، بلا إعلانات وبلا مشتريات داخل التطبيق. الرقائق للعب فقط."
      ],
      [
        "هل أحتاج إلى حساب أو اتصال؟",
        "لا. وضع التدريب لا يحتاج إلى حساب، وبعد فتح الموقع مرة يعمل دون اتصال."
      ],
      [
        "ضد كم خصمًا يديره الحاسوب يمكنني اللعب؟",
        "حتى 9، لطاولة كاملة من 10 لاعبين، أو خصم واحد فقط للعب وجهًا لوجه (heads-up)."
      ],
      [
        "هل الروبوتات جيدة؟",
        "الأمر يعود إليك: الروبوتات السهلة ترتكب أخطاء، والصعبة تقرأ فرصها بدقة وتخادع أكثر، والطاولة المختلطة تمزج المستويات الثلاثة مع خمسة أساليب لعب."
      ],
      [
        "هل يمكنني اللعب مع أصدقائي والروبوتات على الطاولة نفسها؟",
        "نعم. حين تستضيف طاولة على خادم PokerTH الخاص بك، على شبكة محلية أو على الإنترنت، يمكن لغرفة الانتظار ملء المقاعد الشاغرة بلاعبين يديرهم الحاسوب."
      ]
    ]
  },
  az: {
    "title": "Kompüterə qarşı poker oynayın — pulsuz, oflayn | PokerTH",
    "desc": "Kompüter rəqiblərə qarşı pulsuz Texas Hold’em: masanızda 9 bota qədər, asandan çətinə. Hesab yox, pul yox, telefonda və kompüterdə oflayn işləyir.",
    "ldHeadline": "Kompüterə qarşı Texas Hold’em poker oynayın, pulsuz və oflayn",
    "ldDesc": "PokerTH veb klientinin məşq rejimi: kompüter rəqiblərə qarşı Texas Hold’em, çətinlik səviyyələri, oyun üslubları və kuboklarla.",
    "h1": "Kompüterə qarşı poker oynayın, pulsuz və oflayn",
    "lead": "PokerTH-in məşq rejimi kompüter rəqiblərə qarşı tam Texas Hold’em turnirləri paylayır, birbaşa brauzerinizdə. Hesab yoxdur, sayt bir dəfə açıldıqdan sonra bağlantı lazım deyil və heç nə risk altında deyil: oyunu öyrənmək, yeni strategiya sınamaq və ya qatarda tez bir oyun oynamaq üçün yer.",
    "stepsH2": "Üç addımda oyuna başlayın",
    "steps": [
      [
        "PokerTH-i açın və Lokal / məşq seçin",
        "Bu saytı açın və ilk ekranda Lokal / məşq seçin. Giriş də, yükləmə də yoxdur; sayt bir dəfə açıldıqdan sonra rejim bağlantı olmadan da işləyir."
      ],
      [
        "Masanızı qurun",
        "9-a qədər kompüter rəqib, başlanğıc stek, blaindlərin nə qədər sürətlə artdığını və oyun sürətini seçin və ya hazır formatdan başlayın. Botların çətinliyini eyni pəncərədə seçin."
      ],
      [
        "Oyuna başlayın",
        "Başla düyməsini basın: boş yerlər kompüter oyunçularla dolur və kartlar paylanır. Oyun bir oyunçu bütün fişkaları toplayana qədər davam edir."
      ]
    ],
    "levelsH2": "Dörd çətinlik səviyyəsi",
    "levels": [
      [
        "Asan",
        "Əllərini səhv qiymətləndirən və nadir hallarda blef edən botlar: ilk oyun üçün doğru rəqiblər."
      ],
      [
        "Normal",
        "Şanslarını yaxşı qiymətləndirən və stekləri qısalanda düzgün oynayan möhkəm rəqiblər."
      ],
      [
        "Çətin",
        "Ən güclü botlar: əllərin dəqiq oxunması, qısa steklə kəskin oyun və daha çox blef."
      ],
      [
        "Qarışıq",
        "Rəngarəng masa, standart seçim: orta hesabla hər on botdan üçü asan, beşi normal, ikisi çətin."
      ]
    ],
    "brainH2": "Botlar necə düşünür",
    "brainP": "Hər bot qalan kartları dəfələrlə paylayaraq, bankda hələ qalan oyunçuların sayına qarşı əli qazanmaq üçün real şansını hesablayır. Erkən mövqedə daha sıx oynayır və gec mövqedən oğurlayır (steal), flopdan əvvəl raise etdikdən sonra davam mərci (continuation bet) qoyur, güclü drolarla yarımblef edir və normal səviyyədən başlayaraq steki qısalanda all-in-ya-fold oyununa keçir.",
    "stylesH2": "Beş oyun üslubu",
    "stylesP": "Çətinlik botun oyunu nə qədər yaxşı oxuduğunu, üslub isə necə oynadığını müəyyən edir. Hər yeni masa bunları qarışdırır:",
    "styles": [
      [
        "Rok",
        "çox sıx və ehtiyatlı, az banka girir və nadir hallarda blef edir."
      ],
      [
        "Tayt-aqressiv (TAG)",
        "yaxşı əllər seçir və onlarla sərt mərc qoyur."
      ],
      [
        "Luz-aqressiv (LAG)",
        "çox əl oynayır və sizə təzyiq göstərir."
      ],
      [
        "Kollinq steyşn",
        "həddindən artıq tez-tez call edir və nadir hallarda raise edir."
      ],
      [
        "Manyak",
        "daim raise edir və blef edir."
      ]
    ],
    "formatsH2": "Real formatlarda məşq edin",
    "formatsP": "Hazır ayarlar Sakit, Normal və ya Sürətli oyuna başlamağa, yaxud pokerth.net yarışlarının şərtləri ilə məşq etməyə imkan verir: rəsmi Ranking tempi, We Cup və vaxta əsaslanan blaindləri ilə BBC. Öz ayarlarınızı şəxsi format kimi saxlaya bilərsiniz.",
    "trophiesH2": "Kuboklar və statistika",
    "trophiesP": "Məşq rejiminin öz irəliləyişi var: altı kateqoriyada otuzdan çox kubok — oynanılan əllər, qazanılan oyunlar, qələbə seriyaları, doqquz çətin bota qarşı qələbə, bleflər və bir neçə sirr. Botlara qarşı statistika onlayn oyunlarınızdan ayrı saxlanılır və pokerth.net hesabı ilə daxil olduqda kuboklarınız sizi digər cihazlarınıza da izləyir.",
    "learnH2": "Öyrənmək üçün ən yaxşı yer",
    "learnP": "Veb klientin bütün köməkçi vasitələri burada təzyiqsiz işləyir: kartlar açıldıqca qazanma şansınızı göstərən Ehtimallar tabı, əlin gücü göstəricisi, əvvəlcədən seçilmiş hərəkətlər və klaviatura qısayolları. Hazır olduğunuzu hiss edəndə eyni masa pokerth.net-də real oyunçulara qarşı sizi gözləyir.",
    "offlineH2": "Oflayn, hər cihazda",
    "offlineP": "PokerTH veb tətbiqdir: iPhone, Android, Windows, macOS və Linux-da brauzerdə işləyir və tətbiq kimi əsas ekrana əlavə edilə bilər. Bir dəfə açıldıqdan sonra məşq rejiminə heç bir bağlantı lazım deyil — təyyarə rejimində, metroda və ya siqnal olmayan hər yerdə.",
    "faqH2": "Suallar",
    "faq": [
      [
        "Kompüterə qarşı pulsuz poker oynaya bilərəmmi?",
        "Bəli. PokerTH reklamsız və tətbiqdaxili alışlarsız pulsuz və açıq mənbəli proqramdır. Fişkalar yalnız oyun pullarıdır."
      ],
      [
        "Hesab və ya bağlantı lazımdırmı?",
        "Xeyr. Məşq rejimi hesab tələb etmir və sayt bir dəfə açıldıqdan sonra bağlantı olmadan işləyir."
      ],
      [
        "Neçə kompüter rəqibə qarşı oynaya bilərəm?",
        "9-a qədər — 10 oyunçuluq tam masa üçün — və ya heads-up üçün yalnız birinə qarşı."
      ],
      [
        "Botlar yaxşı oynayırmı?",
        "Bu sizdən asılıdır: asan botlar səhv edir, çətin botlar şanslarını dəqiq qiymətləndirir və daha çox blef edir, qarışıq masa isə üç səviyyəni beş oyun üslubu ilə birləşdirir."
      ],
      [
        "Dostlar və botlarla eyni masada oynaya bilərəmmi?",
        "Bəli. Öz PokerTH serverinizdə, LAN-da və ya internetdə masa açdığınız zaman gözləmə otağı boş yerləri kompüter oyunçularla doldura bilər."
      ]
    ]
  },
  be: {
    "title": "Покер супраць камп'ютара — бясплатна, афлайн | PokerTH",
    "desc": "Бясплатны Texas Hold’em супраць камп'ютарных супернікаў, да 9 ботаў за сталом, ад лёгкіх да складаных. Без уліковага запісу і грошай, працуе афлайн на тэлефоне і ПК.",
    "ldHeadline": "Гуляйце ў покер Texas Hold’em супраць камп'ютара, бясплатна і афлайн",
    "ldDesc": "Трэніровачны рэжым вэб-кліента PokerTH: Texas Hold’em супраць камп'ютарных супернікаў, з узроўнямі складанасці, стылямі гульні і трафеямі.",
    "h1": "Гуляйце ў покер супраць камп'ютара, бясплатна і афлайн",
    "lead": "Трэніровачны рэжым PokerTH раздае поўныя турніры па Texas Hold’em супраць камп'ютарных супернікаў проста ў вашым браўзеры. Без уліковага запісу, без злучэння пасля таго, як сайт быў адкрыты, і нічога не пастаўлена на кон: месца, каб вывучыць гульню, паспрабаваць новую стратэгію або згуляць хуткую партыю ў цягніку.",
    "stepsH2": "Пачніце гульню за тры крокі",
    "steps": [
      [
        "Адкрыйце PokerTH і выберыце Лакальна / трэніроўка",
        "Адкрыйце гэты сайт і на першым экране выберыце Лакальна / трэніроўка. Не трэба ні ўваходзіць, ні нічога спампоўваць; пасля таго як сайт быў адкрыты, рэжым працуе і без злучэння."
      ],
      [
        "Наладзьце свой стол",
        "Выберыце да 9 камп'ютарных супернікаў, пачатковы стэк, хуткасць росту блайндаў і хуткасць гульні або пачніце з гатовага фармату. Складанасць ботаў выбіраецца ў тым жа акне."
      ],
      [
        "Пачніце гульню",
        "Націсніце Пачаць: вольныя месцы запаўняюцца камп'ютарнымі гульцамі, і карты раздаюцца. Гульня ідзе, пакуль адзін гулец не збярэ ўсе фішкі."
      ]
    ],
    "levelsH2": "Чатыры ўзроўні складанасці",
    "levels": [
      [
        "Лёгка",
        "Боты, якія няправільна ацэньваюць свае рукі і рэдка блефуюць: якраз супернікі для першай гульні."
      ],
      [
        "Звычайна",
        "Надзейныя супернікі, якія добра ацэньваюць свае шанцы і правільна гуляюць, калі іх стэк становіцца кароткім."
      ],
      [
        "Складана",
        "Наймацнейшыя боты: дакладнае чытанне рук, вострая гульня з кароткім стэкам і больш блефу."
      ],
      [
        "Змяшана",
        "Разнастайны стол, стандартна: у сярэднім тры лёгкія боты, пяць звычайных і два складаныя на кожныя дзесяць."
      ]
    ],
    "brainH2": "Як думаюць боты",
    "brainP": "Кожны бот вылічвае свой рэальны шанец выйграць раздачу, шмат разоў раздаючы астатнія карты, супраць колькасці гульцоў, што яшчэ засталіся ў банку. Ён гуляе тайтавей у ранняй пазіцыі і робіць стылы з позняй, ставіць кантынюэйшн-бэт пасля рэйзу да флопа, паўблефуе з моцнымі дро і, пачынаючы са звычайнага ўзроўню, пераходзіць на гульню all-in або фолд, калі яго стэк становіцца кароткім.",
    "stylesH2": "Пяць стыляў гульні",
    "stylesP": "Складанасць вызначае, наколькі добра бот чытае гульню; стыль — як ён гуляе. Кожны новы стол змешвае:",
    "styles": [
      [
        "Рок",
        "вельмі тайтавы і асцярожны, уваходзіць у мала банкаў і рэдка блефуе."
      ],
      [
        "Тайт-агрэсіўны",
        "выбірае добрыя рукі і моцна з імі ставіць."
      ],
      [
        "Луз-агрэсіўны",
        "гуляе шмат рук і цісне на вас."
      ],
      [
        "Колінг-стэйшн",
        "занадта часта робіць Call і рэдка робіць Raise."
      ],
      [
        "Маньяк",
        "увесь час рэйзіць і блефуе."
      ]
    ],
    "formatsH2": "Трэніруйцеся ў сапраўдных фарматах",
    "formatsP": "Гатовыя налады дазваляюць пачаць гульню ў фармаце Спакойны, Звычайны або Хуткі ці трэніравацца ва ўмовах спаборніцтваў pokerth.net: афіцыйны тэмп Ranking, We Cup і BBC з блайндамі па часе. Уласныя налады можна захаваць як свой фармат.",
    "trophiesH2": "Трафеі і статыстыка",
    "trophiesP": "У трэніровачнага рэжыму свой прагрэс: больш за трыццаць трафеяў у шасці катэгорыях — згуляныя раздачы, выйграныя гульні, серыі перамог, перамога над дзевяццю складанымі ботамі, блефы і некалькі сакрэтаў. Статыстыка супраць ботаў вядзецца асобна ад вашых анлайн-гульняў, а калі вы ўваходзіце з уліковым запісам pokerth.net, вашы трафеі пераходзяць з вамі на іншыя прылады.",
    "learnH2": "Лепшае месца, каб навучыцца",
    "learnP": "Усе падказкі вэб-кліента працуюць тут без ціску: укладка «Шанцы» з вашым шанцам на перамогу па меры адкрыцця карт, паказ сілы рукі, папярэдне выбраныя дзеянні і спалучэнні клавіш. Калі адчуеце, што гатовыя, такі ж стол чакае вас на pokerth.net супраць сапраўдных гульцоў.",
    "offlineH2": "Афлайн, на любой прыладзе",
    "offlineP": "PokerTH — вэб-праграма: яна працуе ў браўзеры на iPhone, Android, Windows, macOS і Linux, і яе можна дадаць на галоўны экран як праграму. Пасля адкрыцця трэніровачнаму рэжыму зусім не патрэбна злучэнне — у рэжыме палёту, у метро або дзе заўгодна без сігналу.",
    "faqH2": "Пытанні",
    "faq": [
      [
        "Ці можна бясплатна гуляць у покер супраць камп'ютара?",
        "Так. PokerTH — бясплатнае праграмнае забеспячэнне з адкрытым зыходным кодам, без рэкламы і без убудаваных пакупак. Фішкі — толькі гульнявыя грошы."
      ],
      [
        "Ці патрэбны ўліковы запіс або злучэнне?",
        "Не. Трэніровачнаму рэжыму не патрэбны ўліковы запіс, а пасля таго як сайт быў адкрыты, ён працуе без злучэння."
      ],
      [
        "Супраць колькіх камп'ютарных супернікаў можна гуляць?",
        "Да 9, каб стол быў поўны на 10 гульцоў, або супраць аднаго ў хэдз-апе."
      ],
      [
        "Ці добра гуляюць боты?",
        "Гэта залежыць ад вас: лёгкія боты памыляюцца, складаныя дакладна ацэньваюць свае шанцы і больш блефуюць, а змяшаны стол спалучае тры ўзроўні з пяццю стылямі гульні."
      ],
      [
        "Ці можна гуляць з сябрамі і ботамі за адным сталом?",
        "Так. Калі вы ствараеце стол на ўласным серверы PokerTH, у лакальнай сетцы або ў інтэрнэце, пакой чакання можа запоўніць вольныя месцы камп'ютарнымі гульцамі."
      ]
    ]
  },
  bg: {
    "title": "Покер срещу компютъра — безплатно, офлайн | PokerTH",
    "desc": "Безплатен Texas Hold’em срещу компютърни противници, до 9 бота на масата ви, от лесни до трудни. Без профил, без пари, работи офлайн на телефон и компютър.",
    "ldHeadline": "Играйте Texas Hold’em покер срещу компютъра, безплатно и офлайн",
    "ldDesc": "Тренировъчният режим на уеб клиента PokerTH: Texas Hold’em срещу компютърни противници, с нива на трудност, стилове на игра и трофеи.",
    "h1": "Играйте покер срещу компютъра, безплатно и офлайн",
    "lead": "Тренировъчният режим на PokerTH раздава пълни турнири по Texas Hold’em срещу компютърни противници, направо в браузъра ви. Без профил, без връзка, след като сайтът веднъж е отворен, и без нищо заложено: мястото, където да научите играта, да изпробвате нова стратегия или да изиграете бърза игра във влака.",
    "stepsH2": "Започнете игра в три стъпки",
    "steps": [
      [
        "Отворете PokerTH и изберете Локална / тренировка",
        "Отворете този сайт и изберете Локална / тренировка на първия екран. Няма вход и няма нищо за изтегляне; след като сайтът веднъж е отворен, режимът работи и без връзка."
      ],
      [
        "Настройте масата си",
        "Изберете до 9 компютърни противници, началния стек, колко бързо растат блайндовете и скоростта на играта, или започнете от готов формат. В същия прозорец изберете трудността на ботовете."
      ],
      [
        "Започнете играта",
        "Натиснете Старт: празните места се заемат от компютърни играчи и картите се раздават. Играта продължава, докато един играч не събере всички чипове."
      ]
    ],
    "levelsH2": "Четири нива на трудност",
    "levels": [
      [
        "Лесно",
        "Ботове, които грешат в преценката на ръцете си и рядко блъфират: подходящите противници за първа игра."
      ],
      [
        "Нормално",
        "Солидни противници, които добре преценяват шансовете си и играят правилно, когато стекът им се скъси."
      ],
      [
        "Трудно",
        "Най-силните ботове: точно разчитане на ръцете, остра игра с къс стек и повече блъфове."
      ],
      [
        "Смесено",
        "Разнообразна маса, по подразбиране: средно три лесни бота, пет нормални и два трудни на всеки десет."
      ]
    ],
    "brainH2": "Как мислят ботовете",
    "brainP": "Всеки бот изчислява реалния си шанс да спечели ръката, като раздава оставащите карти много пъти, срещу броя на играчите, които са още в пота. Играе по-стегнато от ранна позиция и краде от късна позиция, прави продължаващ залог (c-bet), след като е направил Raise преди флопа, полублъфира със силни проекти и от нормалното ниво нагоре преминава към игра all-in или fold, когато стекът му се скъси.",
    "stylesH2": "Пет стила на игра",
    "stylesP": "Трудността определя колко добре ботът разчита играта; стилът му определя как играе. Всяка нова маса смесва:",
    "styles": [
      [
        "Рок",
        "много стегнат и предпазлив, влиза в малко потове и рядко блъфира."
      ],
      [
        "Тайт-агресивен (TAG)",
        "подбира добри ръце и залага силно с тях."
      ],
      [
        "Луз-агресивен (LAG)",
        "играе много ръце и ви държи под натиск."
      ],
      [
        "Калинг стейшън",
        "прави Call твърде често и рядко Raise."
      ],
      [
        "Маниак",
        "непрекъснато прави Raise и блъфира."
      ]
    ],
    "formatsH2": "Тренирайте истинските формати",
    "formatsP": "Готовите настройки ви позволяват да започнете игра във формат Спокоен, Нормален или Бърз, или да тренирате при условията на състезанията на pokerth.net: официалното темпо Класиране, We Cup и BBC с блайндове, които растат по време. Собствените си настройки можете да запазите като свой формат.",
    "trophiesH2": "Трофеи и статистика",
    "trophiesP": "Тренировъчният режим има собствен напредък: над трийсет трофея в шест категории — изиграни ръце, спечелени игри, поредици от победи, победа срещу девет трудни бота, блъфове и няколко тайни. Статистиката срещу ботовете се води отделно от онлайн игрите ви, а когато влезете с профил в pokerth.net, трофеите ви ви следват и на другите ви устройства.",
    "learnH2": "Най-доброто място за учене",
    "learnP": "Всяка помощ на уеб клиента работи тук без напрежение: разделът Шансове с шанса ви за победа, докато картите излизат, показателят за силата на ръката, предварително избраните действия и клавишните комбинации. Когато се почувствате готови, същата маса ви очаква на pokerth.net срещу истински играчи.",
    "offlineH2": "Офлайн, на всяко устройство",
    "offlineP": "PokerTH е уеб приложение: работи в браузъра на iPhone, Android, Windows, macOS и Linux и може да се добави на началния екран като приложение. След като веднъж е отворен, тренировъчният режим изобщо не се нуждае от връзка — в самолетен режим, в метрото или навсякъде без сигнал.",
    "faqH2": "Въпроси",
    "faq": [
      [
        "Мога ли да играя покер срещу компютъра безплатно?",
        "Да. PokerTH е безплатен софтуер с отворен код, без реклами и без покупки в приложението. Чиповете са само игрални пари."
      ],
      [
        "Нужни ли са ми профил или връзка?",
        "Не. Тренировъчният режим не изисква профил, а след като сайтът веднъж е отворен, работи без връзка."
      ],
      [
        "Срещу колко компютърни противници мога да играя?",
        "До 9, за пълна маса от 10 играчи, или само срещу един за игра един срещу един."
      ],
      [
        "Добри ли са ботовете?",
        "Зависи от вас: лесните ботове правят грешки, трудните точно преценяват шансовете си и блъфират повече, а смесената маса съчетава трите нива с пет стила на игра."
      ],
      [
        "Мога ли да играя с приятели и ботове на една маса?",
        "Да. Когато сте домакин на маса на собствен сървър на PokerTH, в LAN или в интернет, чакалнята може да запълни празните места с компютърни играчи."
      ]
    ]
  },
  bn: {
    "title": "কম্পিউটারের বিরুদ্ধে পোকার — বিনামূল্যে, অফলাইনে | PokerTH",
    "desc": "কম্পিউটার প্রতিপক্ষের বিরুদ্ধে বিনামূল্যে Texas Hold’em, আপনার টেবিলে সর্বোচ্চ ৯টি বট, সহজ থেকে কঠিন। অ্যাকাউন্ট নেই, টাকা নেই, ফোন ও পিসিতে অফলাইনেও চলে।",
    "ldHeadline": "কম্পিউটারের বিরুদ্ধে Texas Hold’em পোকার খেলুন, বিনামূল্যে ও অফলাইনে",
    "ldDesc": "PokerTH ওয়েব ক্লায়েন্টের অনুশীলন মোড: কম্পিউটার প্রতিপক্ষের বিরুদ্ধে Texas Hold’em, কঠিনতার স্তর, খেলার ধরন আর ট্রফিসহ।",
    "h1": "কম্পিউটারের বিরুদ্ধে পোকার খেলুন, বিনামূল্যে ও অফলাইনে",
    "lead": "PokerTH-এর অনুশীলন মোড সরাসরি আপনার ব্রাউজারেই কম্পিউটার প্রতিপক্ষের বিরুদ্ধে পূর্ণাঙ্গ Texas Hold’em টুর্নামেন্টের তাস বাঁটে। অ্যাকাউন্ট নেই, সাইটটি একবার খোলার পর সংযোগও লাগে না, আর বাজিতে কিছুই নেই: খেলা শেখার, নতুন কৌশল পরখ করার বা ট্রেনে ঝটপট একটা খেলা সেরে নেওয়ার জায়গা।",
    "stepsH2": "তিন ধাপে একটি খেলা শুরু করুন",
    "steps": [
      [
        "PokerTH খুলে স্থানীয় / অনুশীলন বেছে নিন",
        "এই সাইটটি খুলে প্রথম পর্দায় স্থানীয় / অনুশীলন বেছে নিন। লগ ইন নেই, ডাউনলোডও নেই; সাইটটি একবার খোলার পর এই মোড সংযোগ ছাড়াও চলে।"
      ],
      [
        "আপনার টেবিল সাজান",
        "সর্বোচ্চ ৯টি কম্পিউটার প্রতিপক্ষ, শুরুর চিপ, ব্লাইন্ড কত দ্রুত বাড়বে আর খেলার গতি বেছে নিন, অথবা কোনো তৈরি ফরম্যাট থেকে শুরু করুন। একই উইন্ডোতে বটের কঠিনতাও বেছে নিন।"
      ],
      [
        "খেলা শুরু করুন",
        "শুরু চাপুন: খালি আসনগুলো কম্পিউটার খেলোয়াড়ে ভরে যায় আর তাস বাঁটা হয়। একজন খেলোয়াড়ের হাতে সব চিপ না আসা পর্যন্ত খেলা চলে।"
      ]
    ],
    "levelsH2": "চারটি কঠিনতার স্তর",
    "levels": [
      [
        "সহজ",
        "যে বটগুলো নিজেদের হাত ভুল বিচার করে আর কদাচিৎ ব্লাফ করে: প্রথম খেলার জন্য উপযুক্ত প্রতিপক্ষ।"
      ],
      [
        "সাধারণ",
        "মজবুত প্রতিপক্ষ, যারা নিজেদের সম্ভাবনা ভালোভাবে বোঝে আর চিপ কমে এলে ঠিকঠাক খেলে।"
      ],
      [
        "কঠিন",
        "সবচেয়ে শক্তিশালী বট: নিখুঁতভাবে হাত পড়া, অল্প চিপে ধারালো খেলা আর বেশি ব্লাফ।"
      ],
      [
        "মিশ্র",
        "বৈচিত্র্যময় টেবিল, ডিফল্ট সেটিং: গড়ে প্রতি দশটিতে তিনটি সহজ, পাঁচটি সাধারণ আর দুটি কঠিন বট।"
      ]
    ],
    "brainH2": "বটগুলো কীভাবে ভাবে",
    "brainP": "প্রতিটি বট বাকি তাসগুলো বহুবার বেঁটে, পটে তখনও থাকা খেলোয়াড়দের সংখ্যার বিপরীতে, হাতটি জেতার আসল সম্ভাবনা হিসাব করে। আগের পজিশনে আরও টাইট খেলে আর শেষের পজিশন থেকে চুরি করে, ফ্লপের আগে Raise করার পর কন্টিনিউয়েশন বেট দেয়, জোরালো অপেক্ষার হাতে সেমি-ব্লাফ করে এবং সাধারণ স্তর থেকে ওপরে, চিপ কমে এলে all-in বা fold খেলায় চলে যায়।",
    "stylesH2": "খেলার পাঁচটি ধরন",
    "stylesP": "কঠিনতা ঠিক করে একটি বট খেলা কতটা ভালো পড়ে; তার ধরন ঠিক করে সে কীভাবে খেলে। প্রতিটি নতুন টেবিলে মেশানো থাকে:",
    "styles": [
      [
        "রক",
        "খুব টাইট ও সতর্ক, অল্প পটে ঢোকে আর কদাচিৎ ব্লাফ করে।"
      ],
      [
        "টাইট-আক্রমণাত্মক",
        "ভালো হাত বেছে নেয় আর তাতে জোরালো বাজি ধরে।"
      ],
      [
        "লুজ-আক্রমণাত্মক",
        "অনেক হাত খেলে আর আপনার ওপর চাপ সৃষ্টি করে।"
      ],
      [
        "কলিং স্টেশন",
        "অনেক বেশি Call করে আর কদাচিৎ Raise করে।"
      ],
      [
        "ম্যানিয়াক",
        "অবিরাম Raise আর ব্লাফ করে।"
      ]
    ],
    "formatsH2": "আসল ফরম্যাটে অনুশীলন করুন",
    "formatsP": "তৈরি সেটিং দিয়ে শান্ত, সাধারণ বা দ্রুত খেলা শুরু করতে পারেন, অথবা pokerth.net প্রতিযোগিতার শর্তে অনুশীলন করতে পারেন: Ranking-এর সরকারি গতি, We Cup আর সময়ভিত্তিক ব্লাইন্ডসহ BBC। নিজের সেটিং আপনার নিজস্ব ফরম্যাট হিসেবে সংরক্ষণ করা যায়।",
    "trophiesH2": "ট্রফি ও পরিসংখ্যান",
    "trophiesP": "অনুশীলন মোডের নিজস্ব অগ্রগতি আছে: ছয় শ্রেণিতে ত্রিশটিরও বেশি ট্রফি — খেলা হাত, জেতা খেলা, টানা জয়, নয়টি কঠিন বটের বিরুদ্ধে জয়, ব্লাফ, আর কয়েকটি গোপন চমক। বটের বিরুদ্ধে পরিসংখ্যান আপনার অনলাইন খেলা থেকে আলাদা রাখা হয়, আর pokerth.net অ্যাকাউন্ট দিয়ে লগ ইন করলে আপনার ট্রফি আপনার অন্য ডিভাইসেও সঙ্গে যায়।",
    "learnH2": "শেখার সেরা জায়গা",
    "learnP": "ওয়েব ক্লায়েন্টের প্রতিটি সহায়তা এখানে কোনো চাপ ছাড়াই কাজ করে: তাস খুলতে খুলতে আপনার জেতার সম্ভাবনা দেখানো Odds ট্যাব, হাতের শক্তির প্রদর্শন, আগে থেকে বাছাই করা চাল আর কীবোর্ড শর্টকাট। প্রস্তুত মনে হলে, একই টেবিল pokerth.net-এ সত্যিকারের খেলোয়াড়দের বিরুদ্ধে আপনার অপেক্ষায় আছে।",
    "offlineH2": "অফলাইনে, প্রতিটি ডিভাইসে",
    "offlineP": "PokerTH একটি ওয়েব অ্যাপ: এটি iPhone, Android, Windows, macOS ও Linux-এ ব্রাউজারে চলে, আর অ্যাপের মতো হোম স্ক্রিনে যোগ করা যায়। একবার খোলার পর অনুশীলন মোডে কোনো সংযোগই লাগে না — এয়ারপ্লেন মোডে, মেট্রোতে বা সিগন্যাল নেই এমন যেকোনো জায়গায়।",
    "faqH2": "প্রশ্নোত্তর",
    "faq": [
      [
        "আমি কি বিনামূল্যে কম্পিউটারের বিরুদ্ধে পোকার খেলতে পারি?",
        "হ্যাঁ। PokerTH বিনামূল্যের ও ওপেন সোর্স সফটওয়্যার — কোনো বিজ্ঞাপন নেই, অ্যাপের ভেতরে কেনাকাটাও নেই। চিপ কেবল খেলার টাকা।"
      ],
      [
        "অ্যাকাউন্ট বা সংযোগ কি লাগবে?",
        "না। অনুশীলন মোডে কোনো অ্যাকাউন্ট লাগে না, আর সাইটটি একবার খোলার পর এটি সংযোগ ছাড়াই চলে।"
      ],
      [
        "কতগুলো কম্পিউটার প্রতিপক্ষের বিরুদ্ধে খেলতে পারি?",
        "সর্বোচ্চ ৯টি, ১০ জন খেলোয়াড়ের পূর্ণ টেবিলের জন্য, অথবা মুখোমুখি খেলার জন্য মাত্র একটি।"
      ],
      [
        "বটগুলো কি ভালো খেলে?",
        "সেটা আপনার ওপর: সহজ বট ভুল করে, কঠিন বট নিজেদের সম্ভাবনা নিখুঁতভাবে বোঝে আর বেশি ব্লাফ করে, আর মিশ্র টেবিলে তিনটি স্তর পাঁচটি খেলার ধরনের সঙ্গে মিশে থাকে।"
      ],
      [
        "একই টেবিলে কি বন্ধু আর বটদের সঙ্গে একসাথে খেলতে পারি?",
        "হ্যাঁ। আপনি যখন নিজের PokerTH সার্ভারে, LAN-এ বা ইন্টারনেটে টেবিল হোস্ট করেন, অপেক্ষা কক্ষ খালি আসনগুলো কম্পিউটার খেলোয়াড় দিয়ে পূরণ করতে পারে।"
      ]
    ]
  },
  bs: {
    "title": "Poker protiv računara — besplatno, bez interneta | PokerTH",
    "desc": "Besplatni Texas Hold’em protiv računara, do 9 botova za tvojim stolom, od lakih do teških. Bez računa i novca, radi i bez interneta na telefonu i PC-u.",
    "ldHeadline": "Igraj Texas Hold’em poker protiv računara, besplatno i bez interneta",
    "ldDesc": "Trening način PokerTH web klijenta: Texas Hold’em protiv protivnika kojima upravlja računar, s nivoima težine, stilovima igre i trofejima.",
    "h1": "Igraj poker protiv računara, besplatno i bez interneta",
    "lead": "Trening način PokerTH-a dijeli kompletne Texas Hold’em turnire protiv protivnika kojima upravlja računar, direktno u tvom pregledaču. Bez računa, bez veze s internetom nakon što je stranica jednom otvorena i bez ikakvog uloga: mjesto da naučiš igru, isprobaš novu strategiju ili odigraš brzu partiju u vozu.",
    "stepsH2": "Započni igru u tri koraka",
    "steps": [
      [
        "Otvori PokerTH i izaberi Lokalno / trening",
        "Otvori ovu stranicu i na prvom ekranu izaberi Lokalno / trening. Nema prijave ni preuzimanja; kad je stranica jednom otvorena, ovaj način radi i bez veze."
      ],
      [
        "Postavi svoj sto",
        "Izaberi do 9 protivnika kojima upravlja računar, početni stek, koliko brzo rastu blindovi i brzinu igre, ili kreni od gotovog formata. U istom prozoru izaberi težinu botova."
      ],
      [
        "Pokreni igru",
        "Pritisni Početak: prazna mjesta popune igrači kojima upravlja računar i karte se podijele. Igra traje dok jedan igrač ne osvoji sve žetone."
      ]
    ],
    "levelsH2": "Četiri nivoa težine",
    "levels": [
      [
        "Lako",
        "Botovi koji pogrešno procjenjuju svoje ruke i rijetko blefiraju: pravi protivnici za prvu igru."
      ],
      [
        "Normalno",
        "Solidni protivnici koji dobro procjenjuju svoje šanse i igraju ispravno kad im stek postane mali."
      ],
      [
        "Teško",
        "Najjači botovi: precizno čitanje ruku, oštra igra s malim stekom i više blefova."
      ],
      [
        "Mješovito",
        "Raznolik sto, zadana postavka: u prosjeku tri laka bota, pet normalnih i dva teška na svakih deset."
      ]
    ],
    "brainH2": "Kako botovi razmišljaju",
    "brainP": "Svaki bot izračunava svoju stvarnu šansu da dobije ruku tako što mnogo puta podijeli preostale karte, uzimajući u obzir broj igrača koji su još u potu. Igra uže na ranim pozicijama i krade s kasnih, nakon povišice prije flopa nastavlja kontinuacijskim ulogom (c-bet), polublefira s jakim čekanjima i, od normalnog nivoa naviše, prelazi na igru All-In ili Fold kad mu stek postane mali.",
    "stylesH2": "Pet stilova igre",
    "stylesP": "Težina određuje koliko dobro bot čita igru; stil određuje kako igra. Svaki novi sto miješa:",
    "styles": [
      [
        "Rock",
        "vrlo uzak i oprezan, ulazi u malo potova i rijetko blefira."
      ],
      [
        "Tight-agresivan (TAG)",
        "bira dobre ruke i snažno ih ulaže."
      ],
      [
        "Loose-agresivan (LAG)",
        "igra mnogo ruku i vrši pritisak na tebe."
      ],
      [
        "Calling station",
        "plaća mnogo prečesto i rijetko povisuje."
      ],
      [
        "Manijak",
        "neprestano povisuje i blefira."
      ]
    ],
    "formatsH2": "Vježbaj prave formate",
    "formatsP": "Gotove postavke ti omogućavaju da pokreneš igru u formatu Mirna, Normalna ili Brza, ili da vježbaš u uslovima takmičenja na pokerth.net: Rang-lista sa službenim tempom, We Cup i BBC s blindovima po vremenu. Vlastite postavke možeš sačuvati kao svoj format.",
    "trophiesH2": "Trofeji i statistika",
    "trophiesP": "Trening način ima vlastiti napredak: više od trideset trofeja u šest kategorija — odigrane ruke, dobijene igre, nizovi pobjeda, pobjeda protiv devet teških botova, blefovi i nekoliko tajni. Statistika protiv botova vodi se odvojeno od tvojih online igara, a kad se prijaviš s pokerth.net računom, trofeji te prate na tvoje druge uređaje.",
    "learnH2": "Najbolje mjesto za učenje",
    "learnP": "Svaka pomoć web klijenta ovdje radi bez pritiska: kartica „Izgledi” s tvojom šansom za pobjedu kako karte izlaze, prikaz jačine ruke, unaprijed odabrane akcije i prečice na tastaturi. Kad se osjetiš spremnim, isti sto te čeka na pokerth.net protiv pravih igrača.",
    "offlineH2": "Bez interneta, na svakom uređaju",
    "offlineP": "PokerTH je web aplikacija: radi u pregledaču na iPhoneu, Androidu, Windowsu, macOS-u i Linuxu, a može se dodati na početni ekran kao aplikacija. Kad je jednom otvoren, trening način uopće ne treba vezu — u avionskom načinu, u metrou ili bilo gdje bez signala.",
    "faqH2": "Pitanja",
    "faq": [
      [
        "Mogu li besplatno igrati poker protiv računara?",
        "Da. PokerTH je besplatan softver otvorenog koda, bez reklama i bez kupovine u aplikaciji. Žetoni su samo igrački novac."
      ],
      [
        "Trebam li račun ili vezu s internetom?",
        "Ne. Trening način ne treba račun, a kad je stranica jednom otvorena, radi bez veze."
      ],
      [
        "Protiv koliko protivnika kojima upravlja računar mogu igrati?",
        "Do 9, za pun sto od 10 igrača, ili protiv samo jednog za igru jedan na jedan."
      ],
      [
        "Jesu li botovi dobri?",
        "To ovisi o tebi: laki botovi griješe, teški precizno procjenjuju svoje šanse i više blefiraju, a mješoviti sto kombinuje tri nivoa s pet stilova igre."
      ],
      [
        "Mogu li igrati s prijateljima i botovima za istim stolom?",
        "Da. Kad otvoriš sto na vlastitom PokerTH serveru, u LAN mreži ili na internetu, čekaonica može popuniti prazna mjesta igračima kojima upravlja računar."
      ]
    ]
  },
  ca: {
    "title": "Pòquer contra l’ordinador — gratis i sense connexió | PokerTH",
    "desc": "Texas Hold’em gratis contra l’ordinador: fins a 9 bots a la taula, de fàcil a difícil. Sense compte ni diners, i funciona sense connexió al mòbil i al PC.",
    "ldHeadline": "Juga al pòquer Texas Hold’em contra l’ordinador, gratis i sense connexió",
    "ldDesc": "Mode d’entrenament del client web de PokerTH: Texas Hold’em contra rivals de l’ordinador, amb nivells de dificultat, estils de joc i trofeus.",
    "h1": "Juga al pòquer contra l’ordinador, gratis i sense connexió",
    "lead": "El mode d’entrenament de PokerTH reparteix tornejos complets de Texas Hold’em contra rivals de l’ordinador, directament al navegador. Sense compte, sense connexió un cop obert el web i sense res en joc: el lloc ideal per aprendre el joc, provar una estratègia nova o fer una partida ràpida al tren.",
    "stepsH2": "Comença una partida en tres passos",
    "steps": [
      [
        "Obre PokerTH i tria Local / entrenament",
        "Obre aquest web i tria Local / entrenament a la primera pantalla. No cal iniciar sessió ni baixar res; un cop obert el web, el mode també funciona sense connexió."
      ],
      [
        "Prepara la taula",
        "Tria fins a 9 rivals de l’ordinador, la pila inicial, la rapidesa amb què pugen les cegues i la velocitat del joc, o comença amb un format predefinit. Tria la dificultat dels bots a la mateixa finestra."
      ],
      [
        "Comença la partida",
        "Prem Inici: els seients buits s’omplen de jugadors de l’ordinador i es reparteixen les cartes. La partida continua fins que un jugador té totes les fitxes."
      ]
    ],
    "levelsH2": "Quatre nivells de dificultat",
    "levels": [
      [
        "Fàcil",
        "Bots que valoren malament les seves mans i rarament fan farols: els rivals ideals per a una primera partida."
      ],
      [
        "Normal",
        "Rivals sòlids que llegeixen bé les seves probabilitats i juguen correctament quan la seva pila s’escurça."
      ],
      [
        "Difícil",
        "Els bots més forts: lectura precisa de les mans, joc afinat amb pila curta i més farols."
      ],
      [
        "Mixt",
        "Una taula variada, l’opció per defecte: de mitjana tres bots fàcils, cinc de normals i dos de difícils de cada deu."
      ]
    ],
    "brainH2": "Com pensen els bots",
    "brainP": "Cada bot calcula la seva probabilitat real de guanyar la mà repartint moltes vegades les cartes que falten, segons el nombre de jugadors que encara són al pot. Juga més tancat en posició primerenca i roba des de posició tardana, fa una aposta de continuació després de pujar abans del flop, fa semifarols amb projectes forts i, a partir del nivell normal, passa a jugar a All-In o Fold quan la pila se li escurça.",
    "stylesH2": "Cinc estils de joc",
    "stylesP": "La dificultat determina com de bé llegeix el joc un bot; el seu estil, com juga. Cada taula nova barreja:",
    "styles": [
      [
        "Roca",
        "molt tancat i prudent, entra en pocs pots i rarament fa farols."
      ],
      [
        "Tight-agressiu (TAG)",
        "tria bones mans i les aposta amb força."
      ],
      [
        "Loose-agressiu (LAG)",
        "juga moltes mans i et posa pressió."
      ],
      [
        "Calling station",
        "iguala massa sovint i rarament puja."
      ],
      [
        "Maníac",
        "puja i fa farols constantment."
      ]
    ],
    "formatsH2": "Practica els formats reals",
    "formatsP": "Uns ajustos predefinits et permeten començar una partida «Tranquil», «Normal» o «Ràpid», o practicar en les condicions de les competicions de pokerth.net: el ritme oficial de Ranking, la We Cup i la BBC amb les seves cegues per temps. Pots desar els teus propis ajustos com un format propi.",
    "trophiesH2": "Trofeus i estadístiques",
    "trophiesP": "El mode d’entrenament té la seva pròpia progressió: més de trenta trofeus en sis categories — mans jugades, partides guanyades, ratxes de victòries, una victòria contra nou bots difícils, farols i uns quants secrets. Les estadístiques contra els bots es guarden a part de les teves partides en línia, i quan inicies sessió amb un compte de pokerth.net els teus trofeus et segueixen als altres dispositius.",
    "learnH2": "El millor lloc per aprendre",
    "learnP": "Totes les ajudes del client web funcionen aquí sense pressió: la pestanya «Probabilitats» amb la teva probabilitat de guanyar a mesura que surten les cartes, l’indicador de força de la mà, les accions preseleccionades i les dreceres de teclat. Quan et sentis preparat, la mateixa taula t’espera a pokerth.net contra jugadors reals.",
    "offlineH2": "Sense connexió, a tots els dispositius",
    "offlineP": "PokerTH és una aplicació web: funciona al navegador a iPhone, Android, Windows, macOS i Linux, i es pot afegir a la pantalla d’inici com una aplicació. Un cop obert, el mode d’entrenament no necessita cap connexió — en mode avió, al metro o a qualsevol lloc sense cobertura.",
    "faqH2": "Preguntes",
    "faq": [
      [
        "Puc jugar al pòquer contra l’ordinador gratis?",
        "Sí. PokerTH és programari gratuït i de codi obert, sense anuncis ni compres dins l’aplicació. Les fitxes són només diners de joc."
      ],
      [
        "Necessito un compte o connexió?",
        "No. El mode d’entrenament no necessita cap compte i, un cop obert el web, funciona sense connexió."
      ],
      [
        "Contra quants rivals de l’ordinador puc jugar?",
        "Fins a 9, per a una taula completa de 10 jugadors, o només un per jugar un contra un."
      ],
      [
        "Els bots són bons?",
        "Depèn de tu: els bots fàcils s’equivoquen, els difícils llegeixen les seves probabilitats amb precisió i fan més farols, i la taula mixta combina els tres nivells amb cinc estils de joc."
      ],
      [
        "Puc jugar amb amics i bots a la mateixa taula?",
        "Sí. Quan obres una taula al teu propi servidor PokerTH, en una LAN o a internet, la sala d’espera pot omplir els seients buits amb jugadors de l’ordinador."
      ]
    ]
  },
  cs: {
    "title": "Poker proti počítači — zdarma a offline | PokerTH",
    "desc": "Texas Hold’em zdarma proti počítačovým soupeřům, až 9 botů u stolu, od snadných po těžké. Bez účtu, bez peněz a funguje offline na mobilu i PC.",
    "ldHeadline": "Hrajte poker Texas Hold’em proti počítači, zdarma a offline",
    "ldDesc": "Tréninkový režim webového klienta PokerTH: Texas Hold’em proti počítačovým soupeřům, s úrovněmi obtížnosti, herními styly a trofejemi.",
    "h1": "Hrajte poker proti počítači, zdarma a offline",
    "lead": "Tréninkový režim PokerTH rozdává kompletní turnaje Texas Hold’em proti počítačovým soupeřům, přímo ve vašem prohlížeči. Bez účtu, bez připojení, jakmile web jednou otevřete, a o nic se nehraje: místo, kde se naučit hru, vyzkoušet novou strategii nebo si zahrát rychlou hru ve vlaku.",
    "stepsH2": "Spusťte hru ve třech krocích",
    "steps": [
      [
        "Otevřete PokerTH a zvolte Místní / trénink",
        "Otevřete tento web a na první obrazovce vyberte Místní / trénink. Žádné přihlášení ani stahování; jakmile web jednou otevřete, režim funguje i bez připojení."
      ],
      [
        "Nastavte si stůl",
        "Zvolte až 9 počítačových soupeřů, počáteční stack, jak rychle rostou blindy a rychlost hry, nebo začněte od připraveného formátu. Ve stejném okně vyberte obtížnost botů."
      ],
      [
        "Spusťte hru",
        "Stiskněte Start: prázdná místa se zaplní počítačovými hráči a rozdají se karty. Hra běží, dokud jeden hráč nemá všechny žetony."
      ]
    ],
    "levelsH2": "Čtyři úrovně obtížnosti",
    "levels": [
      [
        "Snadná",
        "Boti, kteří špatně odhadují své karty a málokdy blafují: ti správní soupeři pro první hru."
      ],
      [
        "Normální",
        "Solidní soupeři, kteří dobře odhadují své šance a hrají správně, když se jim stack zkrátí."
      ],
      [
        "Těžká",
        "Nejsilnější boti: přesné čtení rukou, ostrá hra s krátkým stackem a více blafů."
      ],
      [
        "Smíšená",
        "Pestrý stůl, výchozí volba: v průměru tři snadní boti, pět normálních a dva těžcí z každých deseti."
      ]
    ],
    "brainH2": "Jak boti přemýšlejí",
    "brainP": "Každý bot si spočítá svou skutečnou šanci vyhrát rozdání tak, že mnohokrát rozdá zbývající karty proti počtu hráčů, kteří jsou ještě ve hře o bank. Na časné pozici hraje těsněji a z pozdní pozice krade, po navýšení před flopem pokračuje sázkou (continuation bet), se silnými dotaženími semi-blafuje a od normální úrovně výš přechází na hru all-in, nebo Fold, když se mu stack zkrátí.",
    "stylesH2": "Pět herních stylů",
    "stylesP": "Obtížnost určuje, jak dobře bot čte hru; styl určuje, jak hraje. Každý nový stůl mísí:",
    "styles": [
      [
        "Rock",
        "velmi tight a opatrný, hraje málo banků a málokdy blafuje."
      ],
      [
        "Tight-agresivní (TAG)",
        "vybírá si dobré karty a sází s nimi tvrdě."
      ],
      [
        "Loose-agresivní (LAG)",
        "hraje hodně rukou a vyvíjí na vás tlak."
      ],
      [
        "Calling station",
        "dorovnává příliš často a málokdy navyšuje."
      ],
      [
        "Maniak",
        "neustále navyšuje a blafuje."
      ]
    ],
    "formatsH2": "Trénujte skutečné formáty",
    "formatsP": "Připravená nastavení vám umožní spustit hru Klidná, Normální nebo Rychlá, nebo trénovat v podmínkách soutěží na pokerth.net: oficiální tempo Žebříček, We Cup a BBC s blindy podle času. Vlastní nastavení si můžete uložit jako svůj vlastní formát.",
    "trophiesH2": "Trofeje a statistiky",
    "trophiesP": "Tréninkový režim má vlastní postup: přes třicet trofejí v šesti kategoriích — odehraná rozdání, vyhrané hry, série výher, vítězství proti devíti těžkým botům, blafy a pár tajných. Statistiky proti botům se vedou odděleně od vašich online her, a když se přihlásíte účtem pokerth.net, trofeje vás následují i na vaše další zařízení.",
    "learnH2": "Nejlepší místo, kde se učit",
    "learnP": "Všechny pomůcky webového klienta tu fungují bez tlaku: karta „Šance“ s vaší šancí na výhru, jak přicházejí karty, ukazatel síly ruky, předvolené akce a klávesové zkratky. Až se budete cítit připraveni, stejný stůl na vás čeká na pokerth.net proti skutečným hráčům.",
    "offlineH2": "Offline, na každém zařízení",
    "offlineP": "PokerTH je webová aplikace: běží v prohlížeči na iPhonu, Androidu, Windows, macOS i Linuxu a dá se přidat na plochu jako aplikace. Jakmile ho jednou otevřete, tréninkový režim nepotřebuje vůbec žádné připojení — v režimu letadla, v metru nebo kdekoli bez signálu.",
    "faqH2": "Otázky",
    "faq": [
      [
        "Můžu hrát poker proti počítači zdarma?",
        "Ano. PokerTH je bezplatný software s otevřeným zdrojovým kódem, bez reklam a bez nákupů v aplikaci. Žetony jsou jen herní peníze."
      ],
      [
        "Potřebuji účet nebo připojení?",
        "Ne. Tréninkový režim nepotřebuje účet, a jakmile web jednou otevřete, funguje bez připojení."
      ],
      [
        "Proti kolika počítačovým soupeřům můžu hrát?",
        "Až proti 9, tedy plný stůl 10 hráčů, nebo proti jedinému pro hru jeden na jednoho."
      ],
      [
        "Jsou boti dobří?",
        "To je na vás: snadní boti dělají chyby, těžcí boti přesně odhadují své šance a víc blafují a smíšený stůl kombinuje tři úrovně s pěti herními styly."
      ],
      [
        "Můžu hrát s přáteli a boty u jednoho stolu?",
        "Ano. Když hostujete stůl na vlastním serveru PokerTH, v síti LAN nebo na internetu, čekárna může prázdná místa zaplnit počítačovými hráči."
      ]
    ]
  },
  cy: {
    "title": "Pocer yn erbyn y cyfrifiadur — am ddim, all-lein | PokerTH",
    "desc": "Texas Hold’em am ddim yn erbyn y cyfrifiadur, hyd at 9 bot wrth eich bwrdd, o hawdd i anodd. Dim cyfrif, dim arian, ac mae'n gweithio all-lein ar ffôn a PC.",
    "ldHeadline": "Chwarae pocer Texas Hold’em yn erbyn y cyfrifiadur, am ddim ac all-lein",
    "ldDesc": "Modd ymarfer cleient gwe PokerTH: Texas Hold’em yn erbyn gwrthwynebwyr cyfrifiadur, gyda lefelau anhawster, arddulliau chwarae a thlysau.",
    "h1": "Chwarae pocer yn erbyn y cyfrifiadur, am ddim ac all-lein",
    "lead": "Mae modd ymarfer PokerTH yn delio twrnameintiau Texas Hold’em llawn yn erbyn gwrthwynebwyr cyfrifiadur, yn syth yn eich porwr. Dim cyfrif, dim cysylltiad ar ôl i'r wefan gael ei hagor, a dim byd yn y fantol: y lle i ddysgu'r gêm, i roi cynnig ar strategaeth newydd, neu i chwarae gêm sydyn ar y trên.",
    "stepsH2": "Dechrau gêm mewn tri cham",
    "steps": [
      [
        "Agorwch PokerTH a dewis Lleol / ymarfer",
        "Agorwch y wefan hon a dewiswch Lleol / ymarfer ar y sgrin gyntaf. Does dim mewngofnodi a dim lawrlwytho; ar ôl i'r wefan gael ei hagor, mae'r modd yn gweithio heb gysylltiad hefyd."
      ],
      [
        "Paratowch eich bwrdd",
        "Dewiswch hyd at 9 gwrthwynebydd cyfrifiadur, y stac cychwynnol, pa mor gyflym mae'r blinds yn codi a chyflymder y gêm, neu dechreuwch o fformat parod. Dewiswch anhawster y botiaid yn yr un ffenestr."
      ],
      [
        "Dechreuwch y gêm",
        "Pwyswch Dechrau: mae'r seddi gwag yn llenwi â chwaraewyr cyfrifiadur ac mae'r cardiau'n cael eu delio. Mae'r gêm yn parhau nes bod un chwaraewr yn dal pob sglodyn."
      ]
    ],
    "levelsH2": "Pedair lefel anhawster",
    "levels": [
      [
        "Hawdd",
        "Botiaid sy'n camfarnu eu dwylo ac yn anaml yn bluffio: y gwrthwynebwyr iawn ar gyfer gêm gyntaf."
      ],
      [
        "Arferol",
        "Gwrthwynebwyr cadarn sy'n darllen eu siawns yn dda ac yn chwarae'n gywir pan fydd eu stac yn mynd yn fyr."
      ],
      [
        "Anodd",
        "Y botiaid cryfaf: darllen dwylo'n fanwl gywir, chwarae miniog gyda stac byr a mwy o bluffs."
      ],
      [
        "Cymysg",
        "Bwrdd amrywiol, y rhagosodiad: ar gyfartaledd tri bot hawdd, pump arferol a dau anodd ym mhob deg."
      ]
    ],
    "brainH2": "Sut mae'r botiaid yn meddwl",
    "brainP": "Mae pob bot yn cyfrifo ei wir siawns o ennill y llaw drwy ddelio'r cardiau sy'n weddill lawer gwaith, yn erbyn nifer y chwaraewyr sy'n dal yn y pot. Mae'n chwarae'n dynnach mewn safle cynnar ac yn dwyn o safle hwyr, yn gwneud continuation bet ar ôl codi cyn y flop, yn semi-bluffio gyda draws cryf ac, o'r lefel arferol i fyny, yn newid i chwarae All-In neu Fold pan fydd ei stac yn mynd yn fyr.",
    "stylesH2": "Pum arddull chwarae",
    "stylesP": "Mae'r anhawster yn pennu pa mor dda mae bot yn darllen y gêm; ei arddull sy'n pennu sut mae'n chwarae. Mae pob bwrdd newydd yn cymysgu:",
    "styles": [
      [
        "Rock",
        "tynn a gofalus iawn, yn mynd i mewn i ychydig o botiau ac yn anaml yn bluffio."
      ],
      [
        "Tight-aggressive",
        "yn dewis dwylo da ac yn betio'n galed gyda nhw."
      ],
      [
        "Loose-aggressive",
        "yn chwarae llawer o ddwylo ac yn rhoi pwysau arnoch chi."
      ],
      [
        "Calling station",
        "yn gwneud Call yn llawer rhy aml ac yn anaml yn gwneud Raise."
      ],
      [
        "Maniac",
        "yn gwneud Raise ac yn bluffio drwy'r amser."
      ]
    ],
    "formatsH2": "Ymarfer y fformatau go iawn",
    "formatsP": "Mae gosodiadau parod yn gadael i chi ddechrau gêm Hamddenol, Arferol neu Cyflym, neu ymarfer o dan amodau cystadlaethau pokerth.net: cyflymder swyddogol Ranking, y We Cup a'r BBC gyda'i blinds yn ôl amser. Gellir cadw eich gosodiadau eich hun fel fformat personol.",
    "trophiesH2": "Tlysau ac ystadegau",
    "trophiesP": "Mae gan y modd ymarfer ei ddilyniant ei hun: mwy na deg ar hugain o dlysau mewn chwe chategori — dwylo a chwaraewyd, gemau a enillwyd, rhediadau buddugol, buddugoliaeth yn erbyn naw bot anodd, bluffs, ac ambell gyfrinach. Cedwir ystadegau yn erbyn y botiaid ar wahân i'ch gemau ar-lein, a phan fyddwch yn mewngofnodi gyda chyfrif pokerth.net mae eich tlysau'n eich dilyn i'ch dyfeisiau eraill.",
    "learnH2": "Y lle gorau i ddysgu",
    "learnP": "Mae pob cymorth yn y cleient gwe'n gweithio yma heb bwysau: y tab Siawns gyda'ch siawns o ennill wrth i'r cardiau ddod allan, y dangosydd cryfder llaw, gweithredoedd wedi'u rhagddewis a llwybrau byr bysellfwrdd. Pan fyddwch chi'n teimlo'n barod, mae'r un bwrdd yn eich disgwyl ar pokerth.net yn erbyn chwaraewyr go iawn.",
    "offlineH2": "All-lein, ar bob dyfais",
    "offlineP": "Ap gwe yw PokerTH: mae'n rhedeg yn y porwr ar iPhone, Android, Windows, macOS a Linux, a gellir ei ychwanegu at y sgrin gartref fel ap. Unwaith y bydd wedi'i agor, nid oes angen cysylltiad o gwbl ar y modd ymarfer — yn y modd awyren, ar y metro neu unrhyw le heb signal.",
    "faqH2": "Cwestiynau",
    "faq": [
      [
        "Alla i chwarae pocer yn erbyn y cyfrifiadur am ddim?",
        "Gallwch. Meddalwedd rydd a chod agored yw PokerTH, heb hysbysebion a heb bryniannau mewn-ap. Arian chwarae yn unig yw'r sglodion."
      ],
      [
        "Oes angen cyfrif neu gysylltiad arna i?",
        "Nac oes. Does dim angen cyfrif ar gyfer y modd ymarfer, ac ar ôl i'r wefan gael ei hagor mae'n gweithio heb gysylltiad."
      ],
      [
        "Yn erbyn faint o wrthwynebwyr cyfrifiadur alla i chwarae?",
        "Hyd at 9, ar gyfer bwrdd llawn o 10 chwaraewr, neu un yn unig ar gyfer heads-up."
      ],
      [
        "Ydy'r botiaid yn dda?",
        "Chi sy'n penderfynu: mae botiaid hawdd yn gwneud camgymeriadau, mae botiaid anodd yn darllen eu siawns yn fanwl gywir ac yn bluffio mwy, ac mae'r bwrdd cymysg yn cyfuno'r tair lefel â phum arddull chwarae."
      ],
      [
        "Alla i chwarae gyda ffrindiau a botiaid wrth yr un bwrdd?",
        "Gallwch. Pan fyddwch yn cynnal bwrdd ar eich gweinydd PokerTH eich hun, ar LAN neu ar y rhyngrwyd, gall yr ystafell aros lenwi'r seddi gwag â chwaraewyr cyfrifiadur."
      ]
    ]
  },
  da: {
    "title": "Spil poker mod computeren — gratis, offline | PokerTH",
    "desc": "Gratis Texas Hold’em mod computermodstandere, op til 9 bots ved dit bord, fra lette til svære. Ingen konto, ingen penge, og det virker offline på telefon og pc.",
    "ldHeadline": "Spil Texas Hold’em-poker mod computeren, gratis og offline",
    "ldDesc": "Træningstilstanden i PokerTH’s webklient: Texas Hold’em mod computermodstandere, med sværhedsgrader, spillestile og trofæer.",
    "h1": "Spil poker mod computeren, gratis og offline",
    "lead": "Træningstilstanden i PokerTH deler hele Texas Hold’em-turneringer ud mod computermodstandere, direkte i din browser. Ingen konto, ingen forbindelse, når siden først har været åbnet, og intet på spil: stedet, hvor du lærer spillet, afprøver en ny strategi eller tager et hurtigt spil i toget.",
    "stepsH2": "Start et spil i tre trin",
    "steps": [
      [
        "Åbn PokerTH, og vælg Lokal / træning",
        "Åbn denne side, og vælg Lokal / træning på det første skærmbillede. Der er intet login og ingen download; når siden først har været åbnet, virker tilstanden også uden forbindelse."
      ],
      [
        "Sæt dit bord op",
        "Vælg op til 9 computermodstandere, startstakken, hvor hurtigt blinds stiger, og spilhastigheden, eller tag udgangspunkt i et færdigt format. Vælg bottenes sværhedsgrad i samme vindue."
      ],
      [
        "Start spillet",
        "Tryk på Start: de tomme pladser fyldes med computerspillere, og kortene deles ud. Spillet fortsætter, indtil én spiller har alle jetonerne."
      ]
    ],
    "levelsH2": "Fire sværhedsgrader",
    "levels": [
      [
        "Let",
        "Bots, der fejlvurderer deres hænder og sjældent bluffer: de rette modstandere til et første spil."
      ],
      [
        "Normal",
        "Solide modstandere, der vurderer deres chancer godt og spiller korrekt, når stakken bliver kort."
      ],
      [
        "Svær",
        "De stærkeste bots: præcis håndlæsning, skarpt spil med kort stak og flere bluffs."
      ],
      [
        "Blandet",
        "Et varieret bord, standardvalget: i gennemsnit tre lette bots, fem normale og to svære ud af hver ti."
      ]
    ],
    "brainH2": "Sådan tænker bottene",
    "brainP": "Hver bot regner sin reelle chance for at vinde hånden ud ved at dele de resterende kort ud mange gange, mod det antal spillere, der stadig er med i puljen. Den spiller strammere i tidlig position og stjæler fra sen position, laver continuation bets efter at have hævet før floppen, semi-bluffer med stærke trækninger og skifter, fra normalt niveau og op, til all-in-eller-fold-spil, når stakken bliver kort.",
    "stylesH2": "Fem spillestile",
    "stylesP": "Sværhedsgraden bestemmer, hvor godt en bot læser spillet; stilen bestemmer, hvordan den spiller. Hvert nyt bord blander:",
    "styles": [
      [
        "Rock",
        "meget stram og forsigtig, går med i få puljer og bluffer sjældent."
      ],
      [
        "Tight-aggressiv",
        "vælger gode hænder og satser hårdt med dem."
      ],
      [
        "Loose-aggressiv",
        "spiller mange hænder og lægger pres på dig."
      ],
      [
        "Calling station",
        "betaler alt for ofte og hæver sjældent."
      ],
      [
        "Maniac",
        "hæver og bluffer konstant."
      ]
    ],
    "formatsH2": "Øv dig i de rigtige formater",
    "formatsP": "Færdige indstillinger lader dig starte et spil i formatet Afslappet, Normal eller Hurtig, eller øve dig under betingelserne fra pokerth.net-konkurrencerne: det officielle Ranking-tempo, We Cup og BBC med sine tidsbaserede blinds. Dine egne indstillinger kan gemmes som dit eget format.",
    "trophiesH2": "Trofæer og statistik",
    "trophiesP": "Træningstilstanden har sin egen progression: mere end tredive trofæer i seks kategorier — spillede hænder, vundne spil, sejrsstimer, en sejr mod ni svære bots, bluffs og et par hemmeligheder. Statistikken mod bottene holdes adskilt fra dine onlinespil, og når du logger ind med en pokerth.net-konto, følger dine trofæer med dig til dine andre enheder.",
    "learnH2": "Det bedste sted at lære",
    "learnP": "Alle webklientens hjælpemidler virker her uden pres: fanen Chancer med din chance for at vinde, efterhånden som kortene kommer, visningen af håndstyrke, forvalgte handlinger og tastaturgenveje. Når du føler dig klar, venter det samme bord på dig på pokerth.net mod rigtige spillere.",
    "offlineH2": "Offline, på alle enheder",
    "offlineP": "PokerTH er en webapp: den kører i browseren på iPhone, Android, Windows, macOS og Linux og kan føjes til hjemmeskærmen som en app. Når den først har været åbnet, behøver træningstilstanden slet ingen forbindelse — i flytilstand, i metroen eller hvor som helst uden signal.",
    "faqH2": "Spørgsmål",
    "faq": [
      [
        "Kan jeg spille poker mod computeren gratis?",
        "Ja. PokerTH er gratis open source-software uden reklamer og uden køb i appen. Jetonerne er kun legepenge."
      ],
      [
        "Skal jeg have en konto eller en forbindelse?",
        "Nej. Træningstilstanden kræver ingen konto, og når siden først har været åbnet, virker den uden forbindelse."
      ],
      [
        "Hvor mange computermodstandere kan jeg spille mod?",
        "Op til 9, til et fuldt bord med 10 spillere, eller kun én, hvis du vil spille heads-up."
      ],
      [
        "Er bottene gode?",
        "Det bestemmer du: lette bots laver fejl, svære bots vurderer deres chancer præcist og bluffer mere, og det blandede bord blander de tre niveauer med fem spillestile."
      ],
      [
        "Kan jeg spille med venner og bots ved samme bord?",
        "Ja. Når du er vært for et bord på din egen PokerTH-server, på et LAN eller på internettet, kan venteværelset fylde de tomme pladser med computerspillere."
      ]
    ]
  },
  de: {
    "title": "Poker gegen den Computer spielen — kostenlos, offline | PokerTH",
    "desc": "Kostenlos Texas Hold’em gegen Computergegner, bis zu 9 Bots am Tisch, von einfach bis schwer. Ohne Konto, ohne Geld, und es läuft offline auf Handy und PC.",
    "ldHeadline": "Texas-Hold’em-Poker gegen den Computer spielen, kostenlos und offline",
    "ldDesc": "Der Trainingsmodus des PokerTH-Web-Clients: Texas Hold’em gegen Computergegner, mit Schwierigkeitsstufen, Spielstilen und Trophäen.",
    "h1": "Poker gegen den Computer spielen, kostenlos und offline",
    "lead": "Der Trainingsmodus von PokerTH teilt komplette Texas-Hold’em-Turniere gegen Computergegner aus, direkt in Ihrem Browser. Kein Konto, keine Verbindung, sobald die Seite einmal geöffnet wurde, und nichts steht auf dem Spiel: der richtige Ort, um das Spiel zu lernen, eine neue Strategie auszuprobieren oder im Zug schnell eine Partie zu spielen.",
    "stepsH2": "Ein Spiel in drei Schritten starten",
    "steps": [
      [
        "PokerTH öffnen und Lokal / Training wählen",
        "Öffnen Sie diese Seite und wählen Sie auf dem ersten Bildschirm Lokal / Training. Es gibt keine Anmeldung und keinen Download; sobald die Seite einmal geöffnet wurde, funktioniert der Modus auch ohne Verbindung."
      ],
      [
        "Tisch einrichten",
        "Wählen Sie bis zu 9 Computergegner, den Startstack, wie schnell die Blinds steigen, und das Spieltempo, oder starten Sie mit einem fertigen Format. Die Schwierigkeit der Bots wählen Sie im selben Fenster."
      ],
      [
        "Spiel starten",
        "Drücken Sie auf Start: Die freien Plätze füllen sich mit Computerspielern, und die Karten werden ausgeteilt. Das Spiel läuft, bis ein Spieler alle Chips besitzt."
      ]
    ],
    "levelsH2": "Vier Schwierigkeitsstufen",
    "levels": [
      [
        "Einfach",
        "Bots, die ihre Hände falsch einschätzen und selten bluffen: die richtigen Gegner für ein erstes Spiel."
      ],
      [
        "Normal",
        "Solide Gegner, die ihre Chancen gut einschätzen und richtig spielen, wenn ihr Stack knapp wird."
      ],
      [
        "Schwer",
        "Die stärksten Bots: präzises Lesen der Hände, scharfes Short-Stack-Spiel und mehr Bluffs."
      ],
      [
        "Gemischt",
        "Ein abwechslungsreicher Tisch, die Voreinstellung: im Schnitt drei einfache, fünf normale und zwei schwere Bots von zehn."
      ]
    ],
    "brainH2": "Wie die Bots denken",
    "brainP": "Jeder Bot berechnet seine tatsächliche Gewinnchance für die Hand, indem er die restlichen Karten viele Male austeilt, gegen die Zahl der Spieler, die noch im Pot sind. Er spielt in früher Position enger und stiehlt aus später Position, setzt nach einer Erhöhung vor dem Flop eine Continuation Bet, semi-blufft mit starken Draws und wechselt ab der Stufe Normal zu einem All-In-oder-Fold-Spiel, wenn sein Stack knapp wird.",
    "stylesH2": "Fünf Spielstile",
    "stylesP": "Die Schwierigkeit bestimmt, wie gut ein Bot das Spiel liest; sein Stil bestimmt, wie er spielt. Jeder neue Tisch mischt:",
    "styles": [
      [
        "Rock",
        "sehr tight und vorsichtig, spielt wenige Pots und blufft selten."
      ],
      [
        "Tight-aggressiv",
        "wählt gute Hände aus und setzt sie kräftig."
      ],
      [
        "Loose-aggressiv",
        "spielt viele Hände und setzt Sie unter Druck."
      ],
      [
        "Calling Station",
        "callt viel zu oft und erhöht selten."
      ],
      [
        "Maniac",
        "erhöht und blufft ständig."
      ]
    ],
    "formatsH2": "Die echten Formate üben",
    "formatsP": "Mit fertigen Einstellungen starten Sie ein Spiel Entspannt, Normal oder Schnell oder üben unter den Bedingungen der Wettbewerbe von pokerth.net: das offizielle Ranking-Tempo, den We Cup und den BBC mit seinen zeitbasierten Blinds. Ihre eigenen Einstellungen lassen sich als eigenes Format speichern.",
    "trophiesH2": "Trophäen und Statistiken",
    "trophiesP": "Der Trainingsmodus hat seinen eigenen Fortschritt: mehr als dreißig Trophäen in sechs Kategorien — gespielte Hände, gewonnene Spiele, Siegesserien, ein Sieg gegen neun schwere Bots, Bluffs und ein paar Geheimnisse. Die Statistiken gegen die Bots werden getrennt von Ihren Online-Spielen geführt, und wenn Sie sich mit einem pokerth.net-Konto anmelden, folgen Ihnen Ihre Trophäen auf Ihre anderen Geräte.",
    "learnH2": "Der beste Ort zum Lernen",
    "learnP": "Jede Hilfe des Web-Clients funktioniert hier ohne Druck: der Reiter Chancen mit Ihrer Gewinnchance, während die Karten kommen, die Anzeige der Handstärke, vorgewählte Aktionen und Tastenkürzel. Wenn Sie sich bereit fühlen, wartet derselbe Tisch auf pokerth.net auf Sie, gegen echte Spieler.",
    "offlineH2": "Offline, auf jedem Gerät",
    "offlineP": "PokerTH ist eine Web-App: Sie läuft im Browser auf iPhone, Android, Windows, macOS und Linux und lässt sich wie eine App zum Startbildschirm hinzufügen. Einmal geöffnet, braucht der Trainingsmodus überhaupt keine Verbindung — im Flugmodus, in der U-Bahn oder überall ohne Empfang.",
    "faqH2": "Fragen",
    "faq": [
      [
        "Kann ich kostenlos Poker gegen den Computer spielen?",
        "Ja. PokerTH ist kostenlose Open-Source-Software, ohne Werbung und ohne In-App-Käufe. Die Chips sind reines Spielgeld."
      ],
      [
        "Brauche ich ein Konto oder eine Verbindung?",
        "Nein. Der Trainingsmodus braucht kein Konto, und sobald die Seite einmal geöffnet wurde, funktioniert er ohne Verbindung."
      ],
      [
        "Gegen wie viele Computergegner kann ich spielen?",
        "Gegen bis zu 9, für einen vollen Tisch mit 10 Spielern, oder gegen einen einzigen im Heads-up."
      ],
      [
        "Sind die Bots gut?",
        "Das entscheiden Sie: Einfache Bots machen Fehler, schwere Bots schätzen ihre Chancen genau ein und bluffen mehr, und der gemischte Tisch kombiniert die drei Stufen mit fünf Spielstilen."
      ],
      [
        "Kann ich mit Freunden und Bots am selben Tisch spielen?",
        "Ja. Wenn Sie einen Tisch auf Ihrem eigenen PokerTH-Server eröffnen, im LAN oder im Internet, kann der Warteraum die freien Plätze mit Computerspielern füllen."
      ]
    ]
  },
  el: {
    "title": "Πόκερ εναντίον υπολογιστή — δωρεάν, offline | PokerTH",
    "desc": "Δωρεάν Texas Hold’em εναντίον αντιπάλων υπολογιστή, έως 9 μποτ στο τραπέζι, από εύκολα έως δύσκολα. Χωρίς λογαριασμό, χωρίς χρήματα, offline σε κινητό και PC.",
    "ldHeadline": "Παίξτε πόκερ Texas Hold’em εναντίον του υπολογιστή, δωρεάν και offline",
    "ldDesc": "Η λειτουργία εξάσκησης της web εφαρμογής PokerTH: Texas Hold’em εναντίον αντιπάλων υπολογιστή, με επίπεδα δυσκολίας, στυλ παιχνιδιού και τρόπαια.",
    "h1": "Παίξτε πόκερ εναντίον του υπολογιστή, δωρεάν και offline",
    "lead": "Η λειτουργία εξάσκησης του PokerTH μοιράζει ολόκληρα τουρνουά Texas Hold’em εναντίον αντιπάλων υπολογιστή, απευθείας στον περιηγητή σας. Χωρίς λογαριασμό, χωρίς σύνδεση αφού ανοίξει μία φορά ο ιστότοπος, και χωρίς τίποτα να διακυβεύεται: το μέρος για να μάθετε το παιχνίδι, να δοκιμάσετε μια νέα στρατηγική ή να παίξετε μια γρήγορη παρτίδα στο τρένο.",
    "stepsH2": "Ξεκινήστε μια παρτίδα σε τρία βήματα",
    "steps": [
      [
        "Ανοίξτε το PokerTH και επιλέξτε Τοπικό / εξάσκηση",
        "Ανοίξτε αυτόν τον ιστότοπο και επιλέξτε Τοπικό / εξάσκηση στην πρώτη οθόνη. Δεν χρειάζεται σύνδεση λογαριασμού ούτε λήψη· αφού ανοίξει μία φορά ο ιστότοπος, η λειτουργία δουλεύει και χωρίς σύνδεση."
      ],
      [
        "Στήστε το τραπέζι σας",
        "Επιλέξτε έως 9 αντιπάλους υπολογιστή, το αρχικό κεφάλαιο, πόσο γρήγορα ανεβαίνουν τα τυφλά και την ταχύτητα του παιχνιδιού, ή ξεκινήστε από ένα έτοιμο φορμά. Τη δυσκολία των μποτ την επιλέγετε στο ίδιο παράθυρο."
      ],
      [
        "Ξεκινήστε την παρτίδα",
        "Πατήστε Έναρξη: οι άδειες θέσεις γεμίζουν με παίκτες υπολογιστή και μοιράζονται τα φύλλα. Η παρτίδα συνεχίζεται μέχρι ένας παίκτης να έχει όλες τις μάρκες."
      ]
    ],
    "levelsH2": "Τέσσερα επίπεδα δυσκολίας",
    "levels": [
      [
        "Εύκολο",
        "Μποτ που κρίνουν λάθος τα χέρια τους και σπάνια μπλοφάρουν: οι κατάλληλοι αντίπαλοι για μια πρώτη παρτίδα."
      ],
      [
        "Κανονικό",
        "Σταθεροί αντίπαλοι που εκτιμούν σωστά τις πιθανότητές τους και παίζουν σωστά όταν το κεφάλαιό τους λιγοστεύει."
      ],
      [
        "Δύσκολο",
        "Τα πιο δυνατά μποτ: ακριβής ανάγνωση χεριών, κοφτερό παιχνίδι με κοντό κεφάλαιο και περισσότερες μπλόφες."
      ],
      [
        "Μικτό",
        "Ένα ποικίλο τραπέζι, η προεπιλογή: κατά μέσο όρο τρία εύκολα μποτ, πέντε κανονικά και δύο δύσκολα σε κάθε δέκα."
      ]
    ],
    "brainH2": "Πώς σκέφτονται τα μποτ",
    "brainP": "Κάθε μποτ υπολογίζει την πραγματική του πιθανότητα να κερδίσει το χέρι μοιράζοντας πολλές φορές τα φύλλα που απομένουν, απέναντι στον αριθμό των παικτών που είναι ακόμη στο πότ. Παίζει πιο σφιχτά από πρώτες θέσεις και κλέβει από τελευταίες θέσεις, κάνει continuation bet αφού έχει κάνει Raise πριν το φλοπ, κάνει ημι-μπλόφα με δυνατά σχέδια και, από το κανονικό επίπεδο και πάνω, περνά σε παιχνίδι all-in ή fold όταν το κεφάλαιό του λιγοστεύει.",
    "stylesH2": "Πέντε στυλ παιχνιδιού",
    "stylesP": "Η δυσκολία ορίζει πόσο καλά διαβάζει ένα μποτ το παιχνίδι· το στυλ του ορίζει πώς παίζει. Κάθε νέο τραπέζι αναμειγνύει:",
    "styles": [
      [
        "Βράχος (Rock)",
        "πολύ σφιχτός και προσεκτικός, μπαίνει σε λίγα πότ και σπάνια μπλοφάρει."
      ],
      [
        "Σφιχτός-επιθετικός (TAG)",
        "διαλέγει καλά χέρια και ποντάρει δυνατά με αυτά."
      ],
      [
        "Χαλαρός-επιθετικός (LAG)",
        "παίζει πολλά χέρια και σας πιέζει."
      ],
      [
        "Calling station",
        "κάνει Call πολύ συχνά και σπάνια Raise."
      ],
      [
        "Μανιακός",
        "κάνει Raise και μπλοφάρει ασταμάτητα."
      ]
    ],
    "formatsH2": "Εξασκηθείτε στα πραγματικά φορμά",
    "formatsP": "Έτοιμες ρυθμίσεις σάς επιτρέπουν να ξεκινήσετε μια παρτίδα σε φορμά Χαλαρό, Κανονικό ή Γρήγορο, ή να εξασκηθείτε στις συνθήκες των διοργανώσεων του pokerth.net: τον επίσημο ρυθμό Κατάταξη, το We Cup και το BBC με τα τυφλά του που ανεβαίνουν με βάση τον χρόνο. Τις δικές σας ρυθμίσεις μπορείτε να τις αποθηκεύσετε ως δικό σας φορμά.",
    "trophiesH2": "Τρόπαια και στατιστικά",
    "trophiesP": "Η λειτουργία εξάσκησης έχει τη δική της πρόοδο: περισσότερα από τριάντα τρόπαια σε έξι κατηγορίες — χέρια που παίχτηκαν, παρτίδες που κερδήθηκαν, σερί νικών, μια νίκη απέναντι σε εννέα δύσκολα μποτ, μπλόφες και μερικά μυστικά. Τα στατιστικά απέναντι στα μποτ κρατιούνται χωριστά από τις online παρτίδες σας, και όταν συνδέεστε με λογαριασμό pokerth.net τα τρόπαιά σας σάς ακολουθούν και στις άλλες συσκευές σας.",
    "learnH2": "Το καλύτερο μέρος για να μάθετε",
    "learnP": "Κάθε βοήθημα της web εφαρμογής λειτουργεί εδώ χωρίς πίεση: η καρτέλα Πιθανότητες με την πιθανότητα νίκης σας καθώς βγαίνουν τα φύλλα, η ένδειξη της δύναμης του χεριού, οι προεπιλεγμένες ενέργειες και οι συντομεύσεις πληκτρολογίου. Όταν νιώσετε έτοιμοι, το ίδιο τραπέζι σάς περιμένει στο pokerth.net απέναντι σε αληθινούς παίκτες.",
    "offlineH2": "Offline, σε κάθε συσκευή",
    "offlineP": "Το PokerTH είναι web εφαρμογή: τρέχει στον περιηγητή σε iPhone, Android, Windows, macOS και Linux και μπορεί να προστεθεί στην αρχική οθόνη σαν εφαρμογή. Αφού ανοίξει μία φορά, η λειτουργία εξάσκησης δεν χρειάζεται καθόλου σύνδεση — σε λειτουργία πτήσης, στο μετρό ή οπουδήποτε χωρίς σήμα.",
    "faqH2": "Ερωτήσεις",
    "faq": [
      [
        "Μπορώ να παίξω πόκερ εναντίον του υπολογιστή δωρεάν;",
        "Ναι. Το PokerTH είναι δωρεάν λογισμικό ανοιχτού κώδικα, χωρίς διαφημίσεις και χωρίς αγορές μέσα στην εφαρμογή. Οι μάρκες είναι μόνο εικονικά χρήματα."
      ],
      [
        "Χρειάζομαι λογαριασμό ή σύνδεση;",
        "Όχι. Η λειτουργία εξάσκησης δεν χρειάζεται λογαριασμό, και αφού ανοίξει μία φορά ο ιστότοπος λειτουργεί χωρίς σύνδεση."
      ],
      [
        "Απέναντι σε πόσους αντιπάλους υπολογιστή μπορώ να παίξω;",
        "Έως 9, για ένα γεμάτο τραπέζι 10 παικτών, ή μόνο έναν, για παιχνίδι ένας εναντίον ενός."
      ],
      [
        "Είναι καλά τα μποτ;",
        "Εξαρτάται από εσάς: τα εύκολα μποτ κάνουν λάθη, τα δύσκολα εκτιμούν με ακρίβεια τις πιθανότητές τους και μπλοφάρουν περισσότερο, και το μικτό τραπέζι συνδυάζει τα τρία επίπεδα με πέντε στυλ παιχνιδιού."
      ],
      [
        "Μπορώ να παίξω με φίλους και μποτ στο ίδιο τραπέζι;",
        "Ναι. Όταν φιλοξενείτε ένα τραπέζι στον δικό σας διακομιστή PokerTH, σε LAN ή στο διαδίκτυο, η αίθουσα αναμονής μπορεί να γεμίσει τις άδειες θέσεις με παίκτες υπολογιστή."
      ]
    ]
  },
  eo: {
    "title": "Ludu pokeron kontraŭ komputilo — senpage, senkonekte | PokerTH",
    "desc": "Senpaga Texas Hold’em kontraŭ la komputilo, ĝis 9 robotoj ĉe via tablo, de facila ĝis malfacila. Sen konto, sen mono, kaj senkonekte en telefono kaj komputilo.",
    "ldHeadline": "Ludu Texas Hold’em pokeron kontraŭ komputilo, senpage kaj senkonekte",
    "ldDesc": "Trejna reĝimo de la PokerTH-retkliento: Texas Hold’em kontraŭ komputilaj kontraŭuloj, kun malfacilecaj niveloj, ludstiloj kaj trofeoj.",
    "h1": "Ludu pokeron kontraŭ komputilo, senpage kaj senkonekte",
    "lead": "La trejna reĝimo de PokerTH disdonas kompletajn Texas Hold’em-turnirojn kontraŭ komputilaj kontraŭuloj, rekte en via retumilo. Sen konto, sen konekto post kiam la retejo estis malfermita, kaj nenio en risko: la loko por lerni la ludon, provi novan strategion aŭ ludi rapidan partion en la trajno.",
    "stepsH2": "Komencu ludon en tri paŝoj",
    "steps": [
      [
        "Malfermu PokerTH kaj elektu Loka / trejnado",
        "Malfermu ĉi tiun retejon kaj elektu Loka / trejnado sur la unua ekrano. Ne necesas ensaluti nek elŝuti; post kiam la retejo estis malfermita, la reĝimo funkcias ankaŭ sen konekto."
      ],
      [
        "Agordu vian tablon",
        "Elektu ĝis 9 komputilajn kontraŭulojn, la komencan stakon, kiom rapide la blindoj altiĝas kaj la ludrapidon, aŭ komencu de preta formato. Elektu la malfacilecon de la robotoj en la sama fenestro."
      ],
      [
        "Komencu la ludon",
        "Premu Komenci: la malplenaj sidlokoj pleniĝas per komputilaj ludantoj kaj la kartoj estas disdonataj. La ludo daŭras, ĝis unu ludanto havas ĉiujn ĵetonojn."
      ]
    ],
    "levelsH2": "Kvar malfacilecaj niveloj",
    "levels": [
      [
        "Facila",
        "Robotoj, kiuj misjuĝas siajn manojn kaj malofte blufas: la ĝustaj kontraŭuloj por unua ludo."
      ],
      [
        "Normala",
        "Solidaj kontraŭuloj, kiuj bone taksas siajn ŝancojn kaj ludas ĝuste, kiam ilia stako mallongiĝas."
      ],
      [
        "Malfacila",
        "La plej fortaj robotoj: preciza legado de manoj, akra ludo kun mallonga stako kaj pli da blufoj."
      ],
      [
        "Miksita",
        "Varia tablo, la defaŭlto: averaĝe tri facilaj robotoj, kvin normalaj kaj du malfacilaj el ĉiuj dek."
      ]
    ],
    "brainH2": "Kiel la robotoj pensas",
    "brainP": "Ĉiu roboto kalkulas sian veran ŝancon gajni la manon, disdonante la restantajn kartojn multajn fojojn, kontraŭ la nombro de ludantoj ankoraŭ en la poto. Ĝi ludas pli strete en frua pozicio kaj ŝtelas el malfrua pozicio, faras daŭrigan veton (continuation bet) post altigo antaŭ la flop, duonblufas per fortaj draws kaj, ekde la normala nivelo, ŝanĝas al ludo all-in-aŭ-fold, kiam ĝia stako mallongiĝas.",
    "stylesH2": "Kvin ludstiloj",
    "stylesP": "La malfacileco determinas, kiom bone roboto legas la ludon; ĝia stilo determinas, kiel ĝi ludas. Ĉiu nova tablo miksas:",
    "styles": [
      [
        "Roko",
        "tre streta kaj singarda, eniras malmultajn potojn kaj malofte blufas."
      ],
      [
        "Streta-agresema",
        "elektas bonajn manojn kaj forte vetas per ili."
      ],
      [
        "Malstreta-agresema",
        "ludas multajn manojn kaj premas vin."
      ],
      [
        "Calling station",
        "sekvas multe tro ofte kaj malofte altigas."
      ],
      [
        "Maniulo",
        "senĉese altigas kaj blufas."
      ]
    ],
    "formatsH2": "Trejnu la verajn formatojn",
    "formatsP": "Pretaj agordoj ebligas komenci ludon laŭ la formato Trankvila, Normala aŭ Rapida, aŭ trejni laŭ la kondiĉoj de la pokerth.net-konkursoj: la oficiala ritmo de Ranking, la We Cup kaj la BBC kun ĝiaj tempobazitaj blindoj. Viajn proprajn agordojn vi povas konservi kiel propran formaton.",
    "trophiesH2": "Trofeoj kaj statistikoj",
    "trophiesP": "La trejna reĝimo havas sian propran progreson: pli ol tridek trofeoj en ses kategorioj — luditaj manoj, gajnitaj ludoj, venkoserioj, venko kontraŭ naŭ malfacilaj robotoj, blufoj kaj kelkaj sekretoj. Statistikoj kontraŭ la robotoj estas konservataj aparte de viaj retaj ludoj, kaj kiam vi ensalutas per pokerth.net-konto, viaj trofeoj sekvas vin al viaj aliaj aparatoj.",
    "learnH2": "La plej bona loko por lerni",
    "learnP": "Ĉiu helpilo de la retkliento funkcias ĉi tie sen premo: la langeto Ŝancoj kun via ŝanco gajni dum la kartoj aperas, la montrilo de manforto, antaŭelektitaj agoj kaj fulmoklavoj. Kiam vi sentas vin preta, la sama tablo atendas vin ĉe pokerth.net kontraŭ veraj ludantoj.",
    "offlineH2": "Senkonekte, en ĉiu aparato",
    "offlineP": "PokerTH estas retaplikaĵo: ĝi funkcias en la retumilo ĉe iPhone, Android, Windows, macOS kaj Linux, kaj aldoneblas al la hejmekrano kiel aplikaĵo. Post la unua malfermo, la trejna reĝimo bezonas neniun konekton — en aviadila reĝimo, en la metroo aŭ ie ajn sen signalo.",
    "faqH2": "Demandoj",
    "faq": [
      [
        "Ĉu mi povas senpage ludi pokeron kontraŭ komputilo?",
        "Jes. PokerTH estas senpaga kaj malfermitkoda programaro sen reklamoj kaj sen enaplikaj aĉetoj. La ĵetonoj estas nur ludmono."
      ],
      [
        "Ĉu mi bezonas konton aŭ konekton?",
        "Ne. La trejna reĝimo bezonas neniun konton, kaj post kiam la retejo estis malfermita, ĝi funkcias sen konekto."
      ],
      [
        "Kontraŭ kiom da komputilaj kontraŭuloj mi povas ludi?",
        "Ĝis 9, por plena tablo de 10 ludantoj, aŭ kontraŭ nur unu por heads-up."
      ],
      [
        "Ĉu la robotoj estas bonaj?",
        "Tion vi decidas: facilaj robotoj eraras, malfacilaj robotoj precize taksas siajn ŝancojn kaj pli ofte blufas, kaj la miksita tablo kunigas la tri nivelojn kun kvin ludstiloj."
      ],
      [
        "Ĉu mi povas ludi kun amikoj kaj robotoj ĉe la sama tablo?",
        "Jes. Kiam vi gastigas tablon en via propra PokerTH-servilo, en LAN aŭ en la interreto, la atendejo povas plenigi la malplenajn sidlokojn per komputilaj ludantoj."
      ]
    ]
  },
  es: {
    "title": "Póker contra el ordenador — gratis y sin conexión | PokerTH",
    "desc": "Texas Hold’em gratis contra el ordenador: hasta 9 bots en tu mesa, de fácil a difícil. Sin cuenta ni dinero, y funciona sin conexión en móvil y PC.",
    "ldHeadline": "Jugar al póker Texas Hold’em contra el ordenador, gratis y sin conexión",
    "ldDesc": "Modo de entrenamiento del cliente web de PokerTH: Texas Hold’em contra rivales controlados por el ordenador, con niveles de dificultad, estilos de juego y trofeos.",
    "h1": "Juega al póker contra el ordenador, gratis y sin conexión",
    "lead": "El modo de entrenamiento de PokerTH reparte torneos completos de Texas Hold’em contra rivales controlados por el ordenador, directamente en tu navegador. Sin cuenta, sin conexión una vez abierto el sitio y sin nada en juego: el lugar para aprender a jugar, probar una estrategia nueva o echar una partida rápida en el tren.",
    "stepsH2": "Empieza una partida en tres pasos",
    "steps": [
      [
        "Abre PokerTH y elige Local / entrenamiento",
        "Abre este sitio y elige Local / entrenamiento en la primera pantalla. No hay que iniciar sesión ni descargar nada; una vez abierto el sitio, el modo funciona también sin conexión."
      ],
      [
        "Prepara tu mesa",
        "Elige hasta 9 rivales controlados por el ordenador, la pila inicial, la rapidez con la que suben las ciegas y la velocidad de juego, o parte de un formato ya preparado. Elige la dificultad de los bots en la misma ventana."
      ],
      [
        "Empieza la partida",
        "Pulsa Empezar: los asientos vacíos se llenan con jugadores controlados por el ordenador y se reparten las cartas. La partida dura hasta que un jugador tiene todas las fichas."
      ]
    ],
    "levelsH2": "Cuatro niveles de dificultad",
    "levels": [
      [
        "Fácil",
        "Bots que valoran mal sus manos y rara vez farolean: los rivales ideales para una primera partida."
      ],
      [
        "Normal",
        "Rivales sólidos que calculan bien sus probabilidades y juegan correctamente cuando su pila se queda corta."
      ],
      [
        "Difícil",
        "Los bots más fuertes: lectura precisa de las manos, juego afinado con pila corta y más faroles."
      ],
      [
        "Mixta",
        "Una mesa variada, la opción por defecto: de media, tres bots fáciles, cinco normales y dos difíciles de cada diez."
      ]
    ],
    "brainH2": "Cómo piensan los bots",
    "brainP": "Cada bot calcula su probabilidad real de ganar la mano repartiendo muchas veces las cartas que faltan, frente al número de jugadores que siguen en el bote. Juega más cerrado en posiciones tempranas y roba desde posiciones tardías, hace una apuesta de continuación (c-bet) tras subir antes del flop, semifarolea con proyectos fuertes y, a partir del nivel normal, pasa a un juego de All-In o Fold cuando su pila se queda corta.",
    "stylesH2": "Cinco estilos de juego",
    "stylesP": "La dificultad determina lo bien que un bot lee la partida; su estilo, cómo juega. Cada mesa nueva mezcla:",
    "styles": [
      [
        "Roca",
        "muy cerrado y prudente, entra en pocos botes y rara vez farolea."
      ],
      [
        "Tight-agresivo (TAG)",
        "elige buenas manos y las apuesta con fuerza."
      ],
      [
        "Loose-agresivo (LAG)",
        "juega muchas manos y te mete presión."
      ],
      [
        "Calling station",
        "iguala demasiado a menudo y rara vez sube."
      ],
      [
        "Maníaco",
        "sube y farolea sin parar."
      ]
    ],
    "formatsH2": "Practica los formatos reales",
    "formatsP": "Los ajustes ya preparados te permiten empezar una partida en formato Relajado, Normal o Rápido, o practicar en las condiciones de las competiciones de pokerth.net: el ritmo oficial Ranking, la We Cup y la BBC con sus ciegas por tiempo. Tus propios ajustes se pueden guardar como un formato propio.",
    "trophiesH2": "Trofeos y estadísticas",
    "trophiesP": "El modo de entrenamiento tiene su propia progresión: más de treinta trofeos en seis categorías — manos jugadas, partidas ganadas, rachas de victorias, una victoria contra nueve bots difíciles, faroles y algunos secretos. Las estadísticas contra los bots se guardan aparte de tus partidas online y, cuando inicias sesión con una cuenta de pokerth.net, tus trofeos te siguen a tus otros dispositivos.",
    "learnH2": "El mejor sitio para aprender",
    "learnP": "Todas las ayudas del cliente web funcionan aquí sin presión: la pestaña Probabilidades con tu probabilidad de ganar según van saliendo las cartas, la indicación de la fuerza de tu mano, las acciones preseleccionadas y los atajos de teclado. Cuando te sientas preparado, la misma mesa te espera en pokerth.net contra jugadores reales.",
    "offlineH2": "Sin conexión, en todos tus dispositivos",
    "offlineP": "PokerTH es una aplicación web: funciona en el navegador en iPhone, Android, Windows, macOS y Linux, y se puede añadir a la pantalla de inicio como una aplicación. Una vez abierto, el modo de entrenamiento no necesita ninguna conexión — en modo avión, en el metro o en cualquier lugar sin cobertura.",
    "faqH2": "Preguntas",
    "faq": [
      [
        "¿Puedo jugar al póker contra el ordenador gratis?",
        "Sí. PokerTH es software libre y de código abierto, sin anuncios ni compras dentro de la aplicación. Las fichas son solo dinero ficticio."
      ],
      [
        "¿Necesito una cuenta o conexión?",
        "No. El modo de entrenamiento no necesita cuenta y, una vez abierto el sitio, funciona sin conexión."
      ],
      [
        "¿Contra cuántos rivales controlados por el ordenador puedo jugar?",
        "Hasta 9, para una mesa completa de 10 jugadores, o contra uno solo para jugar un mano a mano."
      ],
      [
        "¿Son buenos los bots?",
        "Eso depende de ti: los bots fáciles cometen errores, los difíciles calculan sus probabilidades con precisión y farolean más, y la mesa mixta combina los tres niveles con cinco estilos de juego."
      ],
      [
        "¿Puedo jugar con amigos y bots en la misma mesa?",
        "Sí. Cuando abres una mesa en tu propio servidor PokerTH, en una LAN o en internet, la sala de espera puede llenar los asientos vacíos con jugadores controlados por el ordenador."
      ]
    ]
  },
  "es-419": {
    "title": "Jugar póker contra la computadora — gratis, sin conexión | PokerTH",
    "desc": "Texas Hold’em gratis contra la computadora: hasta 9 bots en tu mesa, de fácil a difícil. Sin cuenta ni dinero, y funciona sin conexión en el celular y la PC.",
    "ldHeadline": "Juega póker Texas Hold’em contra la computadora, gratis y sin conexión",
    "ldDesc": "Modo de entrenamiento del cliente web de PokerTH: Texas Hold’em contra rivales de la computadora, con niveles de dificultad, estilos de juego y trofeos.",
    "h1": "Juega póker contra la computadora, gratis y sin conexión",
    "lead": "El modo de entrenamiento de PokerTH reparte torneos completos de Texas Hold’em contra rivales de la computadora, directamente en tu navegador. Sin cuenta, sin conexión una vez abierto el sitio y sin nada en juego: el lugar para aprender el juego, probar una estrategia nueva o echarte una partida rápida en el tren.",
    "stepsH2": "Empieza una partida en tres pasos",
    "steps": [
      [
        "Abre PokerTH y elige Local / entrenamiento",
        "Abre este sitio y elige Local / entrenamiento en la primera pantalla. No hay que iniciar sesión ni descargar nada; una vez abierto el sitio, el modo también funciona sin conexión."
      ],
      [
        "Arma tu mesa",
        "Elige hasta 9 rivales de la computadora, la pila inicial, qué tan rápido suben las ciegas y la velocidad del juego, o empieza con un formato predefinido. Elige la dificultad de los bots en la misma ventana."
      ],
      [
        "Empieza la partida",
        "Presiona Empezar: los asientos vacíos se llenan con jugadores de la computadora y se reparten las cartas. La partida sigue hasta que un jugador tiene todas las fichas."
      ]
    ],
    "levelsH2": "Cuatro niveles de dificultad",
    "levels": [
      [
        "Fácil",
        "Bots que juzgan mal sus manos y rara vez hacen bluff: los rivales ideales para una primera partida."
      ],
      [
        "Normal",
        "Rivales sólidos que leen bien sus probabilidades y juegan correctamente cuando su pila se queda corta."
      ],
      [
        "Difícil",
        "Los bots más fuertes: lectura precisa de manos, juego fino con pila corta y más bluffs."
      ],
      [
        "Mixta",
        "Una mesa variada, la opción predeterminada: en promedio tres bots fáciles, cinco normales y dos difíciles de cada diez."
      ]
    ],
    "brainH2": "Cómo piensan los bots",
    "brainP": "Cada bot calcula su probabilidad real de ganar la mano repartiendo muchas veces las cartas que faltan, según el número de jugadores que siguen en el pozo. Juega más cerrado en posición temprana y roba desde posición tardía, hace apuesta de continuación después de subir antes del flop, hace semibluff con proyectos fuertes y, a partir del nivel normal, pasa a jugar All-In o Fold cuando su pila se queda corta.",
    "stylesH2": "Cinco estilos de juego",
    "stylesP": "La dificultad define qué tan bien lee el juego un bot; su estilo, cómo juega. Cada mesa nueva mezcla:",
    "styles": [
      [
        "Roca",
        "muy cerrado y cuidadoso, entra en pocos pozos y rara vez hace bluff."
      ],
      [
        "Tight-agresivo (TAG)",
        "elige buenas manos y las apuesta con fuerza."
      ],
      [
        "Loose-agresivo (LAG)",
        "juega muchas manos y te mete presión."
      ],
      [
        "Calling station",
        "iguala demasiado seguido y rara vez sube."
      ],
      [
        "Maníaco",
        "sube y hace bluff todo el tiempo."
      ]
    ],
    "formatsH2": "Practica los formatos reales",
    "formatsP": "Los ajustes predefinidos te permiten empezar una partida en formato Relajado, Normal o Rápido, o practicar en las condiciones de las competencias de pokerth.net: el ritmo oficial de Ranking, la We Cup y la BBC con sus ciegas por tiempo. Puedes guardar tus propios ajustes como un formato propio.",
    "trophiesH2": "Trofeos y estadísticas",
    "trophiesP": "El modo de entrenamiento tiene su propia progresión: más de treinta trofeos en seis categorías — manos jugadas, partidas ganadas, rachas de victorias, una victoria contra nueve bots difíciles, bluffs y algunos secretos. Las estadísticas contra los bots se guardan aparte de tus partidas online, y cuando inicias sesión con una cuenta de pokerth.net tus trofeos te siguen a tus otros dispositivos.",
    "learnH2": "El mejor lugar para aprender",
    "learnP": "Todas las ayudas del cliente web funcionan aquí sin presión: la pestaña Probabilidades con tu probabilidad de ganar a medida que salen las cartas, el indicador de fuerza de la mano, las acciones preseleccionadas y los atajos de teclado. Cuando te sientas listo, la misma mesa te espera en pokerth.net contra jugadores reales.",
    "offlineH2": "Sin conexión, en cualquier dispositivo",
    "offlineP": "PokerTH es una app web: funciona en el navegador en iPhone, Android, Windows, macOS y Linux, y se puede agregar a la pantalla de inicio como una app. Una vez abierto, el modo de entrenamiento no necesita ninguna conexión — en modo avión, en el metro o en cualquier lugar sin señal.",
    "faqH2": "Preguntas",
    "faq": [
      [
        "¿Puedo jugar póker contra la computadora gratis?",
        "Sí. PokerTH es software gratuito y de código abierto, sin anuncios ni compras dentro de la app. Las fichas son solo dinero de juego."
      ],
      [
        "¿Necesito una cuenta o conexión?",
        "No. El modo de entrenamiento no necesita cuenta y, una vez abierto el sitio, funciona sin conexión."
      ],
      [
        "¿Contra cuántos rivales de la computadora puedo jugar?",
        "Hasta 9, para una mesa completa de 10 jugadores, o uno solo para jugar mano a mano."
      ],
      [
        "¿Los bots juegan bien?",
        "Depende de ti: los bots fáciles cometen errores, los difíciles leen sus probabilidades con precisión y hacen más bluffs, y la mesa mixta combina los tres niveles con cinco estilos de juego."
      ],
      [
        "¿Puedo jugar con amigos y bots en la misma mesa?",
        "Sí. Cuando abres una mesa en tu propio servidor de PokerTH, en una LAN o en internet, la sala de espera puede llenar los asientos vacíos con jugadores de la computadora."
      ]
    ]
  },
  et: {
    "title": "Mängi pokkerit arvuti vastu — tasuta, offline | PokerTH",
    "desc": "Tasuta Texas Hold’em arvutivastaste vastu, kuni 9 botti laua taga, lihtsast raskeni. Ilma kontota, ilma rahata ning töötab offline telefonis ja arvutis.",
    "ldHeadline": "Mängi Texas Hold’emi pokkerit arvuti vastu, tasuta ja offline",
    "ldDesc": "PokerTH veebikliendi treeningrežiim: Texas Hold’em arvutivastaste vastu, raskusastmete, mängustiilide ja trofeedega.",
    "h1": "Mängi pokkerit arvuti vastu, tasuta ja offline",
    "lead": "PokerTH treeningrežiim jagab täispikki Texas Hold’emi turniire arvutivastaste vastu otse sinu brauseris. Ilma kontota, ilma ühenduseta, kui sait on korra avatud, ja ilma panuseta: koht, kus mängu õppida, uut strateegiat proovida või rongis kiire mäng teha.",
    "stepsH2": "Alusta mängu kolme sammuga",
    "steps": [
      [
        "Ava PokerTH ja vali Kohalik / treening",
        "Ava see sait ja vali esimesel ekraanil Kohalik / treening. Sisselogimist ega allalaadimist pole; kui sait on korra avatud, töötab režiim ka ilma ühenduseta."
      ],
      [
        "Seadista oma laud",
        "Vali kuni 9 arvutivastast, algne žetoonivaru, kui kiiresti blindid tõusevad ja mängu kiirus, või alusta valmis formaadist. Samas aknas vali ka bottide raskusaste."
      ],
      [
        "Alusta mängu",
        "Vajuta Alusta: tühjad kohad täituvad arvutimängijatega ja kaardid jagatakse. Mäng kestab, kuni ühel mängijal on kõik žetoonid."
      ]
    ],
    "levelsH2": "Neli raskusastet",
    "levels": [
      [
        "Lihtne",
        "Botid, kes hindavad oma kätt valesti ja bluffivad harva: õiged vastased esimeseks mänguks."
      ],
      [
        "Tavaline",
        "Kindlad vastased, kes hindavad oma võimalusi hästi ja mängivad õigesti, kui nende žetoonivaru jääb lühikeseks."
      ],
      [
        "Raske",
        "Kõige tugevamad botid: täpne käte lugemine, terav mäng lühikese žetoonivaruga ja rohkem bluffe."
      ],
      [
        "Segatud",
        "Mitmekesine laud, vaikimisi valik: keskmiselt kolm lihtsat, viis tavalist ja kaks rasket botti iga kümne kohta."
      ]
    ],
    "brainH2": "Kuidas botid mõtlevad",
    "brainP": "Iga bot arvutab oma tegeliku võiduvõimaluse, jagades järelejäänud kaarte palju kordi läbi, arvestades potis veel olevate mängijate arvu. Varases positsioonis mängib ta tihedamalt ja hilisest positsioonist varastab, pärast enne floppi tõstmist teeb jätkupanuse (continuation bet), semibluffib tugevate väljavaadetega ja alates tavalisest tasemest läheb lühikese žetoonivaru korral üle mängule all-in või Fold.",
    "stylesH2": "Viis mängustiili",
    "stylesP": "Raskusaste määrab, kui hästi bot mängu loeb; stiil määrab, kuidas ta mängib. Iga uus laud segab:",
    "styles": [
      [
        "Rock",
        "väga tihe ja ettevaatlik, osaleb vähestes pottides ja bluffib harva."
      ],
      [
        "Tight-agressiivne (TAG)",
        "valib head käed ja panustab nendega jõuliselt."
      ],
      [
        "Loose-agressiivne (LAG)",
        "mängib palju käsi ja avaldab sulle survet."
      ],
      [
        "Calling station",
        "maksab liiga tihti ja tõstab harva."
      ],
      [
        "Maniakk",
        "tõstab ja bluffib pidevalt."
      ]
    ],
    "formatsH2": "Harjuta päris formaate",
    "formatsP": "Valmisseaded lasevad alustada mängu Rahulik, Tavaline või Kiire või harjutada pokerth.net võistluste tingimustes: ametlik Ranking-tempo, We Cup ja BBC oma ajapõhiste blindidega. Oma seaded saad salvestada omaenda formaadina.",
    "trophiesH2": "Trofeed ja statistika",
    "trophiesP": "Treeningrežiimil on oma areng: üle kolmekümne trofee kuues kategoorias — mängitud käed, võidetud mängud, võiduseeriad, võit üheksa raske boti vastu, bluffid ja mõned saladused. Bottide vastu kogutud statistikat hoitakse sinu veebimängudest eraldi ning kui logid sisse pokerth.net kontoga, liiguvad su trofeed kaasa ka teistesse seadmetesse.",
    "learnH2": "Parim koht õppimiseks",
    "learnP": "Kõik veebikliendi abivahendid töötavad siin ilma surveta: vahekaart Šansid sinu võiduvõimalusega kaartide avanedes, käe tugevuse näidik, eelvalitud tegevused ja kiirklahvid. Kui tunned end valmis olevat, ootab sama laud sind pokerth.net-is päris mängijate vastu.",
    "offlineH2": "Offline, igas seadmes",
    "offlineP": "PokerTH on veebirakendus: see töötab brauseris iPhone’is, Androidis, Windowsis, macOS-is ja Linuxis ning selle saab lisada avaekraanile nagu rakenduse. Kui see on korra avatud, ei vaja treeningrežiim üldse ühendust — lennukirežiimis, metroos või kus tahes ilma levita.",
    "faqH2": "Küsimused",
    "faq": [
      [
        "Kas saan arvuti vastu pokkerit tasuta mängida?",
        "Jah. PokerTH on tasuta ja avatud lähtekoodiga tarkvara, ilma reklaamide ja rakendusesiseste ostudeta. Žetoonid on ainult mänguraha."
      ],
      [
        "Kas mul on vaja kontot või ühendust?",
        "Ei. Treeningrežiim ei vaja kontot ning kui sait on korra avatud, töötab see ilma ühenduseta."
      ],
      [
        "Mitme arvutivastase vastu saan mängida?",
        "Kuni 9 vastu, et laud oleks 10 mängijaga täis, või ainult ühe vastu, et mängida kahekesi."
      ],
      [
        "Kas botid on head?",
        "See sõltub sinust: lihtsad botid teevad vigu, rasked botid hindavad oma võimalusi täpselt ja bluffivad rohkem ning segatud laud ühendab kolm taset viie mängustiiliga."
      ],
      [
        "Kas saan sõprade ja bottidega ühes lauas mängida?",
        "Jah. Kui korraldad laua oma PokerTH serveris, kohtvõrgus või internetis, võib ooteruum tühjad kohad arvutimängijatega täita."
      ]
    ]
  },
  eu: {
    "title": "Pokerra ordenagailuaren aurka — doan, lineaz kanpo | PokerTH",
    "desc": "Texas Hold’em doan ordenagailuko aurkarien aurka, mahaian 9 bot arte, errazetik zailera. Konturik eta dirurik gabe, eta lineaz kanpo dabil telefonoan eta PCan.",
    "ldHeadline": "Jokatu Texas Hold’em pokerrean ordenagailuaren aurka, doan eta lineaz kanpo",
    "ldDesc": "PokerTH web-bezeroaren entrenamendu modua: Texas Hold’em ordenagailuko aurkarien aurka, zailtasun mailekin, joko estiloekin eta garaikurrekin.",
    "h1": "Jokatu pokerrean ordenagailuaren aurka, doan eta lineaz kanpo",
    "lead": "PokerTH-ren entrenamendu moduak Texas Hold’em txapelketa osoak banatzen ditu ordenagailuko aurkarien aurka, zuzenean zure nabigatzailean. Konturik ez, konexiorik ez webgunea behin irekita, eta ezer ez jokoan: jokoa ikasteko, estrategia berri bat probatzeko edo trenean partida azkar bat jokatzeko tokia.",
    "stepsH2": "Hasi partida bat hiru urratsetan",
    "steps": [
      [
        "Ireki PokerTH eta aukeratu Lokala / entrenamendua",
        "Ireki webgune hau eta aukeratu Lokala / entrenamendua lehen pantailan. Ez dago saioa hasi beharrik, ezta ezer deskargatu beharrik ere; webgunea behin irekita, moduak konexiorik gabe ere funtzionatzen du."
      ],
      [
        "Prestatu zure mahaia",
        "Aukeratu ordenagailuko 9 aurkari arte, hasierako txipak, blindak zein azkar igotzen diren eta jokoaren abiadura, edo hasi aurrez prestatutako formatu batetik. Leiho berean aukeratu boten zailtasuna."
      ],
      [
        "Hasi partida",
        "Sakatu Hasi: eserleku hutsak ordenagailuko jokalariz betetzen dira eta kartak banatzen dira. Partidak jokalari batek txip guztiak izan arte irauten du."
      ]
    ],
    "levelsH2": "Lau zailtasun maila",
    "levels": [
      [
        "Erraza",
        "Beren eskuak gaizki baloratzen dituzten eta gutxitan faroa egiten duten botak: lehen partida baterako aurkari egokiak."
      ],
      [
        "Arrunta",
        "Aurkari sendoak, beren aukerak ondo irakurtzen dituztenak eta txipak gutxitzen zaizkienean zuzen jokatzen dutenak."
      ],
      [
        "Zaila",
        "Bot indartsuenak: eskuen irakurketa zehatza, joko zorrotza txip gutxirekin eta faro gehiago."
      ],
      [
        "Nahasia",
        "Mahai askotarikoa, lehenetsitakoa: batez beste, hamarretik hiru bot erraz, bost arrunt eta bi zail."
      ]
    ],
    "brainH2": "Nola pentsatzen duten botek",
    "brainP": "Bot bakoitzak eskua irabazteko benetako aukera kalkulatzen du geratzen diren kartak askotan banatuz, potean oraindik dauden jokalarien kopuruaren aurka. Estuago jokatzen du hasierako posizioan eta lapurretak egiten ditu azken posizioetatik, continuation bet egiten du flop aurretik igo ondoren, semi-faroa egiten du proiektu indartsuekin eta, maila arruntetik gora, All-In edo Fold jokora pasatzen da txipak gutxitzen zaizkionean.",
    "stylesH2": "Bost joko estilo",
    "stylesP": "Zailtasunak zehazten du bot batek jokoa zein ondo irakurtzen duen; estiloak, nola jokatzen duen. Mahai berri bakoitzak nahasten ditu:",
    "styles": [
      [
        "Rock",
        "oso estua eta zuhurra, pote gutxitan sartzen da eta gutxitan egiten du faroa."
      ],
      [
        "Tight-agresiboa",
        "esku onak aukeratzen ditu eta gogor apustu egiten du haiekin."
      ],
      [
        "Loose-agresiboa",
        "esku asko jokatzen ditu eta presioa egiten dizu."
      ],
      [
        "Calling station",
        "askoz gehiegitan egiten du Call eta gutxitan Raise."
      ],
      [
        "Maniac",
        "etengabe egiten du Raise eta faroa."
      ]
    ],
    "formatsH2": "Landu benetako formatuak",
    "formatsP": "Aurrez prestatutako ezarpenekin Lasaia, Arrunta edo Azkarra partida bat has dezakezu, edo pokerth.net-eko lehiaketen baldintzetan entrenatu: Ranking erritmo ofiziala, We Cup eta BBC, denboran oinarritutako blindekin. Zure ezarpenak zeure formatu gisa gorde daitezke.",
    "trophiesH2": "Garaikurrak eta estatistikak",
    "trophiesP": "Entrenamendu moduak bere aurrerapen propioa du: hogeita hamar garaikur baino gehiago sei kategoriatan — jokatutako eskuak, irabazitako partidak, garaipen-segidak, bederatzi bot zailen aurkako garaipen bat, faroak eta sekretu batzuk. Boten aurkako estatistikak zure lineako partidetatik bereizita gordetzen dira, eta pokerth.net kontu batekin saioa hasten duzunean garaikurrek zure beste gailuetara jarraitzen zaituzte.",
    "learnH2": "Ikasteko tokirik onena",
    "learnP": "Web-bezeroaren laguntza guztiek presiorik gabe funtzionatzen dute hemen: Aukerak fitxa, kartak ateratzen diren heinean irabazteko duzun aukerarekin, eskuaren indarraren adierazlea, aurrez hautatutako ekintzak eta teklatuko lasterbideak. Prest sentitzen zarenean, mahai bera zain duzu pokerth.net-en, benetako jokalarien aurka.",
    "offlineH2": "Lineaz kanpo, gailu guztietan",
    "offlineP": "PokerTH web-aplikazio bat da: nabigatzailean dabil iPhone, Android, Windows, macOS eta Linux sistemetan, eta hasierako pantailan gehi daiteke aplikazio bat bezala. Behin irekita, entrenamendu moduak ez du inolako konexiorik behar — hegaldi moduan, metroan edo seinalerik gabeko edozein tokitan.",
    "faqH2": "Galderak",
    "faq": [
      [
        "Doan joka al dezaket pokerrean ordenagailuaren aurka?",
        "Bai. PokerTH software doako eta kode irekikoa da, iragarkirik eta aplikazio barneko erosketarik gabe. Txipak joko-dirua baino ez dira."
      ],
      [
        "Kontu edo konexio bat behar al dut?",
        "Ez. Entrenamendu moduak ez du konturik behar, eta webgunea behin irekita konexiorik gabe dabil."
      ],
      [
        "Ordenagailuko zenbat aurkariren aurka joka dezaket?",
        "9 arte, 10 jokalariko mahai osorako, edo bakar baten aurka heads-up jokatzeko."
      ],
      [
        "Onak al dira botak?",
        "Zure esku dago: bot errazek akatsak egiten dituzte, bot zailek beren aukerak zehatz irakurtzen dituzte eta faro gehiago egiten dute, eta mahai nahasiak hiru mailak bost joko estilorekin konbinatzen ditu."
      ],
      [
        "Lagunekin eta botekin mahai berean joka dezaket?",
        "Bai. Zure PokerTH zerbitzarian mahai bat antolatzen duzunean, LANean edo interneten, itxarongelak eserleku hutsak ordenagailuko jokalariz bete ditzake."
      ]
    ]
  },
  fa: {
    "title": "بازی پوکر با کامپیوتر — رایگان، آفلاین | PokerTH",
    "desc": "Texas Hold’em رایگان در برابر حریفان رایانه‌ای، تا ۹ ربات سر میز شما، از آسان تا سخت. بدون حساب، بدون پول، و آفلاین روی گوشی و رایانه کار می‌کند.",
    "ldHeadline": "پوکر Texas Hold’em را با کامپیوتر بازی کنید، رایگان و آفلاین",
    "ldDesc": "حالت تمرین کلاینت وب PokerTH: Texas Hold’em در برابر حریفان رایانه‌ای، با سطوح دشواری، سبک‌های بازی و جام‌ها.",
    "h1": "با کامپیوتر پوکر بازی کنید، رایگان و آفلاین",
    "lead": "حالت تمرین PokerTH تورنمنت‌های کامل Texas Hold’em را در برابر حریفان رایانه‌ای، درست در مرورگر شما پخش می‌کند. بدون حساب، بدون نیاز به اتصال پس از یک بار باز شدن سایت، و بی‌آنکه چیزی در خطر باشد: جایی برای یاد گرفتن بازی، امتحان یک استراتژی تازه یا یک بازی سریع در قطار.",
    "stepsH2": "در سه گام بازی را شروع کنید",
    "steps": [
      [
        "PokerTH را باز کنید و «محلی / تمرین» را برگزینید",
        "این سایت را باز کنید و در صفحهٔ نخست «محلی / تمرین» را انتخاب کنید. نه ورودی لازم است و نه دانلودی؛ پس از یک بار باز شدن سایت، این حالت بدون اتصال هم کار می‌کند."
      ],
      [
        "میزتان را آماده کنید",
        "تا ۹ حریف رایانه‌ای، موجودی آغازین، سرعت بالا رفتن بلایندها و سرعت بازی را انتخاب کنید، یا از یک قالب آماده شروع کنید. سطح دشواری ربات‌ها را در همان پنجره برگزینید."
      ],
      [
        "بازی را شروع کنید",
        "«شروع» را بزنید: صندلی‌های خالی با بازیکنان رایانه‌ای پر می‌شوند و کارت‌ها پخش می‌شوند. بازی تا وقتی ادامه دارد که یک بازیکن همهٔ ژتون‌ها را در دست داشته باشد."
      ]
    ],
    "levelsH2": "چهار سطح دشواری",
    "levels": [
      [
        "آسان",
        "ربات‌هایی که دستشان را اشتباه ارزیابی می‌کنند و به‌ندرت بلوف می‌زنند: حریفان مناسب برای نخستین بازی."
      ],
      [
        "معمولی",
        "حریفانی محکم که شانس خود را خوب می‌سنجند و وقتی ژتونشان کم می‌شود درست بازی می‌کنند."
      ],
      [
        "سخت",
        "قوی‌ترین ربات‌ها: خواندن دقیق دست، بازی تیز با ژتون کم و بلوف بیشتر."
      ],
      [
        "ترکیبی",
        "میزی متنوع، گزینهٔ پیش‌فرض: به‌طور میانگین از هر ده ربات، سه آسان، پنج معمولی و دو سخت."
      ]
    ],
    "brainH2": "ربات‌ها چگونه فکر می‌کنند",
    "brainP": "هر ربات شانس واقعی خود برای بردن دست را با چندین بار پخش کردن کارت‌های باقی‌مانده، در برابر تعداد بازیکنانی که هنوز در پات هستند، محاسبه می‌کند. در موقعیت‌های اول محتاط‌تر بازی می‌کند و از موقعیت‌های آخر دزدی می‌کند، پس از رِیز پیش از فلاپ شرط ادامه (continuation bet) می‌بندد، با درآهای قوی نیمه‌بلوف می‌زند و از سطح معمولی به بالا، وقتی ژتونش کم می‌شود، به بازی «همه‌چیز وسط یا فولد» روی می‌آورد.",
    "stylesH2": "پنج سبک بازی",
    "stylesP": "سطح دشواری تعیین می‌کند ربات چقدر خوب بازی را می‌خواند؛ سبک، شیوهٔ بازی‌اش را. هر میز تازه این‌ها را با هم می‌آمیزد:",
    "styles": [
      [
        "راک",
        "بسیار محتاط و سخت‌گیر، وارد پات‌های کمی می‌شود و به‌ندرت بلوف می‌زند."
      ],
      [
        "تایت-اگرسیو (TAG)",
        "دست‌های خوب را برمی‌گزیند و با آن‌ها محکم شرط می‌بندد."
      ],
      [
        "لوز-اگرسیو (LAG)",
        "دست‌های زیادی بازی می‌کند و به شما فشار می‌آورد."
      ],
      [
        "کالینگ استیشن",
        "بیش از حد کال می‌کند و به‌ندرت رِیز می‌دهد."
      ],
      [
        "مانیاک",
        "پیوسته رِیز می‌دهد و بلوف می‌زند."
      ]
    ],
    "formatsH2": "قالب‌های واقعی را تمرین کنید",
    "formatsP": "تنظیمات آماده به شما امکان می‌دهند بازی «آرام»، «معمولی» یا «سریع» را شروع کنید، یا در شرایط مسابقه‌های pokerth.net تمرین کنید: آهنگ رسمی «رتبه‌بندی»، We Cup و BBC با بلایندهای زمانی‌اش. تنظیمات خودتان را هم می‌توانید به‌عنوان قالبی شخصی ذخیره کنید.",
    "trophiesH2": "جام‌ها و آمار",
    "trophiesP": "حالت تمرین پیشرفت خاص خودش را دارد: بیش از سی جام در شش دسته — دست‌های بازی‌شده، بازی‌های بُرده، پیروزی‌های پیاپی، پیروزی در برابر نه ربات سخت، بلوف‌ها و چند راز. آمار بازی با ربات‌ها جدا از بازی‌های آنلاین شما نگه داشته می‌شود و وقتی با حساب pokerth.net وارد شوید، جام‌هایتان روی دستگاه‌های دیگرتان هم همراهتان می‌آیند.",
    "learnH2": "بهترین جا برای یادگیری",
    "learnP": "همهٔ ابزارهای کمکی کلاینت وب اینجا بدون فشار کار می‌کنند: زبانهٔ «شانس‌ها» با شانس بردتان همزمان با آمدن کارت‌ها، نمایش قدرت دست، کنش‌های ازپیش‌انتخاب‌شده و میان‌برهای صفحه‌کلید. وقتی احساس کردید آماده‌اید، همین میز در pokerth.net با بازیکنان واقعی منتظر شماست.",
    "offlineH2": "آفلاین، روی هر دستگاهی",
    "offlineP": "PokerTH یک برنامهٔ وب است: در مرورگر روی iPhone، Android، Windows، macOS و Linux اجرا می‌شود و می‌توان آن را مثل یک برنامه به صفحهٔ اصلی افزود. پس از یک بار باز شدن، حالت تمرین اصلاً به اتصال نیاز ندارد — در حالت هواپیما، در مترو یا هر جای بی‌آنتن.",
    "faqH2": "پرسش‌ها",
    "faq": [
      [
        "آیا می‌توانم رایگان با کامپیوتر پوکر بازی کنم؟",
        "بله. PokerTH نرم‌افزاری رایگان و متن‌باز است، بدون تبلیغ و بدون خرید درون‌برنامه‌ای. ژتون‌ها فقط پول بازی‌اند."
      ],
      [
        "آیا به حساب کاربری یا اتصال نیاز دارم؟",
        "نه. حالت تمرین به حساب نیازی ندارد و پس از یک بار باز شدن سایت، بدون اتصال کار می‌کند."
      ],
      [
        "با چند حریف رایانه‌ای می‌توانم بازی کنم؟",
        "تا ۹ حریف، برای یک میز کامل ۱۰ نفره، یا فقط یکی برای بازی رودررو."
      ],
      [
        "آیا ربات‌ها خوب بازی می‌کنند؟",
        "بستگی به خودتان دارد: ربات‌های آسان اشتباه می‌کنند، ربات‌های سخت شانس خود را دقیق می‌سنجند و بیشتر بلوف می‌زنند، و میز ترکیبی سه سطح را با پنج سبک بازی درهم می‌آمیزد."
      ],
      [
        "آیا می‌توانم با دوستان و ربات‌ها سر یک میز بازی کنم؟",
        "بله. وقتی روی سرور PokerTH خودتان، در شبکهٔ محلی یا در اینترنت، میزی برپا می‌کنید، اتاق انتظار می‌تواند صندلی‌های خالی را با بازیکنان رایانه‌ای پر کند."
      ]
    ]
  },
  fi: {
    "title": "Pelaa pokeria tietokonetta vastaan — ilmainen, offline | PokerTH",
    "desc": "Ilmaista Texas Hold’emia tietokonevastustajia vastaan, jopa 9 bottia pöydässä, helposta vaikeaan. Ei tiliä, ei rahaa, ja toimii offline puhelimella ja PC:llä.",
    "ldHeadline": "Pelaa Texas Hold’em -pokeria tietokonetta vastaan, ilmaiseksi ja offline",
    "ldDesc": "PokerTH-selainversion harjoittelutila: Texas Hold’em tietokonevastustajia vastaan, vaikeustasoineen, pelityyleineen ja palkintoineen.",
    "h1": "Pelaa pokeria tietokonetta vastaan, ilmaiseksi ja offline",
    "lead": "PokerTH:n harjoittelutila jakaa kokonaisia Texas Hold’em -turnauksia tietokonevastustajia vastaan suoraan selaimessasi. Ei tiliä, ei yhteyttä sen jälkeen, kun sivusto on kerran avattu, eikä mitään panoksena: paikka oppia peli, kokeilla uutta strategiaa tai pelata nopea peli junassa.",
    "stepsH2": "Aloita peli kolmessa vaiheessa",
    "steps": [
      [
        "Avaa PokerTH ja valitse Paikallinen / harjoittelu",
        "Avaa tämä sivusto ja valitse ensimmäisellä näytöllä Paikallinen / harjoittelu. Kirjautumista tai latausta ei tarvita; kun sivusto on kerran avattu, tila toimii myös ilman yhteyttä."
      ],
      [
        "Määritä pöytäsi",
        "Valitse enintään 9 tietokonevastustajaa, aloituspino, kuinka nopeasti blindit nousevat ja pelinopeus, tai aloita valmiista formaatista. Valitse bottien vaikeustaso samassa ikkunassa."
      ],
      [
        "Aloita peli",
        "Paina Aloita: tyhjät paikat täyttyvät tietokonepelaajilla ja kortit jaetaan. Peli jatkuu, kunnes yhdellä pelaajalla on kaikki pelimerkit."
      ]
    ],
    "levelsH2": "Neljä vaikeustasoa",
    "levels": [
      [
        "Helppo",
        "Botit, jotka arvioivat kätensä väärin ja bluffaavat harvoin: sopivat vastustajat ensimmäiseen peliin."
      ],
      [
        "Normaali",
        "Vankkoja vastustajia, jotka arvioivat mahdollisuutensa hyvin ja pelaavat oikein, kun pino käy lyhyeksi."
      ],
      [
        "Vaikea",
        "Vahvimmat botit: tarkka käsien lukeminen, terävä lyhyen pinon peli ja enemmän bluffeja."
      ],
      [
        "Sekoitettu",
        "Monipuolinen pöytä ja oletusvalinta: keskimäärin kolme helppoa, viisi normaalia ja kaksi vaikeaa bottia kymmenestä."
      ]
    ],
    "brainH2": "Miten botit ajattelevat",
    "brainP": "Jokainen botti laskee todellisen mahdollisuutensa voittaa käsi jakamalla jäljellä olevat kortit monta kertaa, potissa vielä mukana olevien pelaajien määrää vastaan. Se pelaa tiukemmin aikaisessa positiossa ja varastaa myöhäisestä positiosta, tekee jatkopanoksen korotettuaan ennen floppia, semibluffaa vahvoilla vedoilla ja siirtyy normaalitasosta ylöspäin all-in-tai-fold-peliin, kun sen pino käy lyhyeksi.",
    "stylesH2": "Viisi pelityyliä",
    "stylesP": "Vaikeustaso määrää, kuinka hyvin botti lukee peliä; tyyli määrää, miten se pelaa. Jokaisessa uudessa pöydässä on sekaisin:",
    "styles": [
      [
        "Rock",
        "hyvin tiukka ja varovainen, osallistuu harvoihin potteihin ja bluffaa harvoin."
      ],
      [
        "Tiukka-aggressiivinen",
        "valitsee hyvät kädet ja panostaa niillä kovaa."
      ],
      [
        "Löysä-aggressiivinen",
        "pelaa paljon käsiä ja painostaa sinua."
      ],
      [
        "Calling station",
        "callaa aivan liian usein ja korottaa harvoin."
      ],
      [
        "Maanikko",
        "korottaa ja bluffaa jatkuvasti."
      ]
    ],
    "formatsH2": "Harjoittele oikeita formaatteja",
    "formatsP": "Valmiilla asetuksilla voit aloittaa Rauhallinen-, Normaali- tai Nopea-pelin tai harjoitella pokerth.net-kilpailujen oloissa: virallinen Ranking-tahti, We Cup ja BBC aikaan perustuvine blindeineen. Omat asetuksesi voit tallentaa omaksi formaatiksesi.",
    "trophiesH2": "Palkinnot ja tilastot",
    "trophiesP": "Harjoittelutilalla on oma etenemisensä: yli kolmekymmentä palkintoa kuudessa luokassa — pelatut kädet, voitetut pelit, voittoputket, voitto yhdeksää vaikeaa bottia vastaan, bluffit ja muutama salaisuus. Tilastot botteja vastaan pidetään erillään nettipeleistäsi, ja kun kirjaudut pokerth.net-tilillä, palkintosi seuraavat sinua muille laitteillesi.",
    "learnH2": "Paras paikka oppia",
    "learnP": "Kaikki selainversion apuvälineet toimivat täällä ilman paineita: Mahdollisuudet-välilehti, joka näyttää voittomahdollisuutesi korttien tullessa, käden vahvuuden näyttö, ennalta valitut toiminnot ja pikanäppäimet. Kun tunnet olevasi valmis, sama pöytä odottaa sinua pokerth.netissä oikeita pelaajia vastaan.",
    "offlineH2": "Offline, kaikilla laitteilla",
    "offlineP": "PokerTH on verkkosovellus: se toimii selaimessa iPhonella, Androidilla, Windowsilla, macOS:llä ja Linuxilla, ja sen voi lisätä aloitusnäytölle kuin sovelluksen. Kerran avattuna harjoittelutila ei tarvitse yhteyttä lainkaan — lentotilassa, metrossa tai missä tahansa ilman kenttää.",
    "faqH2": "Kysymyksiä",
    "faq": [
      [
        "Voinko pelata pokeria tietokonetta vastaan ilmaiseksi?",
        "Voit. PokerTH on ilmainen avoimen lähdekoodin ohjelmisto ilman mainoksia ja sovelluksen sisäisiä ostoja. Pelimerkit ovat pelkkää leikkirahaa."
      ],
      [
        "Tarvitsenko tilin tai yhteyden?",
        "Et. Harjoittelutila ei vaadi tiliä, ja kun sivusto on kerran avattu, se toimii ilman yhteyttä."
      ],
      [
        "Kuinka montaa tietokonevastustajaa vastaan voin pelata?",
        "Enintään 9:ää, jolloin pöydässä on täydet 10 pelaajaa, tai vain yhtä kaksinpelissä."
      ],
      [
        "Ovatko botit hyviä?",
        "Se on sinun päätettävissäsi: helpot botit tekevät virheitä, vaikeat botit arvioivat mahdollisuutensa tarkasti ja bluffaavat enemmän, ja sekoitettu pöytä yhdistää kolme tasoa viiteen pelityyliin."
      ],
      [
        "Voinko pelata kavereiden ja bottien kanssa samassa pöydässä?",
        "Voit. Kun avaat pöydän omalla PokerTH-palvelimellasi, lähiverkossa tai internetissä, odotushuone voi täyttää tyhjät paikat tietokonepelaajilla."
      ]
    ]
  },
  fil: {
    "title": "Poker laban sa kompyuter — libre, offline | PokerTH",
    "desc": "Libreng Texas Hold’em laban sa kompyuter, hanggang 9 na bot sa mesa, mula madali hanggang mahirap. Walang account o pera; gumagana offline sa telepono at PC.",
    "ldHeadline": "Maglaro ng Texas Hold’em poker laban sa kompyuter, libre at offline",
    "ldDesc": "Ang mode na pagsasanay ng PokerTH web client: Texas Hold’em laban sa mga kalabang kompyuter, may mga antas ng hirap, istilo ng paglalaro at tropeo.",
    "h1": "Maglaro ng poker laban sa kompyuter, libre at offline",
    "lead": "Ang mode na pagsasanay ng PokerTH ay nagpapatakbo ng buong torneo ng Texas Hold’em laban sa mga kalabang kompyuter, mismo sa browser mo. Walang account, walang kailangang koneksyon kapag nabuksan na ang site, at walang nakataya: dito mo matututunan ang laro, masusubukan ang bagong estratehiya, o makakapaglaro ng mabilisang laban sa tren.",
    "stepsH2": "Magsimula ng laro sa tatlong hakbang",
    "steps": [
      [
        "Buksan ang PokerTH at piliin ang Lokal / pagsasanay",
        "Buksan ang site na ito at piliin ang Lokal / pagsasanay sa unang screen. Walang login at walang download; kapag nabuksan na ang site, gumagana rin ang mode kahit walang koneksyon."
      ],
      [
        "Ihanda ang mesa mo",
        "Pumili ng hanggang 9 na kalabang kompyuter, ang panimulang tumpok ng chips, kung gaano kabilis tumaas ang blind at ang bilis ng laro, o magsimula sa isang handang format. Piliin ang hirap ng mga bot sa parehong window."
      ],
      [
        "Simulan ang laro",
        "Pindutin ang Simulan: mapupuno ng mga manlalarong kompyuter ang mga bakanteng upuan at ibibigay ang mga baraha. Tuloy ang laro hanggang hawak na ng isang manlalaro ang lahat ng chips."
      ]
    ],
    "levelsH2": "Apat na antas ng hirap",
    "levels": [
      [
        "Madali",
        "Mga bot na mali ang pagtantya sa kamay nila at bihirang mag-bluff: tamang kalaban para sa unang laro."
      ],
      [
        "Normal",
        "Matatag na kalaban na mahusay tumantya ng tsansa nila at tama ang laro kapag kumokonti na ang chips nila."
      ],
      [
        "Mahirap",
        "Ang pinakamalalakas na bot: tumpak na pagbasa ng kamay, matalas na laro kapag kaunti na ang chips, at mas maraming bluff."
      ],
      [
        "Halo-halo",
        "Iba-ibang mesa, ang default: sa karaniwan, tatlong madaling bot, limang normal at dalawang mahirap sa bawat sampu."
      ]
    ],
    "brainH2": "Paano mag-isip ang mga bot",
    "brainP": "Kinukuwenta ng bawat bot ang tunay nitong tsansang manalo sa kamay sa paulit-ulit na pagbibigay ng natitirang mga baraha, laban sa bilang ng mga manlalarong nasa pot pa. Mas mahigpit itong maglaro mula sa maagang posisyon at nagnanakaw mula sa huling posisyon, nagko-continuation bet matapos mag-Raise bago ang flop, nagse-semi-bluff sa malalakas na draw, at mula sa normal na antas pataas, lumilipat sa larong all-in o fold kapag kaunti na ang chips nito.",
    "stylesH2": "Limang istilo ng paglalaro",
    "stylesP": "Itinatakda ng hirap kung gaano kahusay basahin ng bot ang laro; itinatakda ng istilo nito kung paano ito maglaro. Bawat bagong mesa ay naghahalo ng:",
    "styles": [
      [
        "Rock",
        "napakahigpit at maingat, kakaunting pot ang sinasalihan at bihirang mag-bluff."
      ],
      [
        "Tight-aggressive",
        "pumipili ng magagandang kamay at malakas tumaya sa mga ito."
      ],
      [
        "Loose-aggressive",
        "maraming kamay ang nilalaro at pinipressure ka."
      ],
      [
        "Calling station",
        "masyadong madalas mag-Call at bihirang mag-Raise."
      ],
      [
        "Maniac",
        "walang tigil na nagre-Raise at nagbu-bluff."
      ]
    ],
    "formatsH2": "Sanayin ang mga totoong format",
    "formatsP": "Sa mga handang setting, makakapagsimula ka ng larong Relaks, Normal o Mabilis, o makakapagsanay sa mga kondisyon ng mga kompetisyon ng pokerth.net: ang opisyal na bilis ng Ranking, ang We Cup at ang BBC na tumataas ang blind ayon sa oras. Maaari mong i-save ang sarili mong mga setting bilang sarili mong format.",
    "trophiesH2": "Mga tropeo at istatistika",
    "trophiesP": "May sariling progreso ang mode na pagsasanay: mahigit tatlumpung tropeo sa anim na kategorya — mga kamay na nilaro, mga larong napanalunan, sunod-sunod na panalo, panalo laban sa siyam na mahirap na bot, mga bluff, at ilang sikreto. Hiwalay ang istatistika laban sa mga bot sa mga online na laro mo, at kapag nag-log in ka gamit ang pokerth.net account, susundan ka ng mga tropeo mo sa iba mo pang device.",
    "learnH2": "Ang pinakamagandang lugar para matuto",
    "learnP": "Gumagana rito nang walang pressure ang bawat tulong ng web client: ang tab na Odds na may tsansa mong manalo habang lumalabas ang mga baraha, ang pagpapakita ng lakas ng kamay, mga paunang napiling aksyon at mga keyboard shortcut. Kapag handa ka na, naghihintay sa iyo ang parehong mesa sa pokerth.net laban sa totoong mga manlalaro.",
    "offlineH2": "Offline, sa bawat device",
    "offlineP": "Web app ang PokerTH: tumatakbo ito sa browser sa iPhone, Android, Windows, macOS at Linux, at maaaring idagdag sa home screen na parang app. Kapag nabuksan na, hindi na kailangan ng koneksyon ang mode na pagsasanay — naka-airplane mode, nasa metro, o kahit saan na walang signal.",
    "faqH2": "Mga tanong",
    "faq": [
      [
        "Puwede ba akong maglaro ng poker laban sa kompyuter nang libre?",
        "Oo. Ang PokerTH ay libre at open-source na software, walang ads at walang in-app purchase. Pang-laro lang na pera ang mga chips."
      ],
      [
        "Kailangan ko ba ng account o koneksyon?",
        "Hindi. Walang kailangang account ang mode na pagsasanay, at kapag nabuksan na ang site, gumagana ito kahit walang koneksyon."
      ],
      [
        "Ilang kalabang kompyuter ang puwede kong labanan?",
        "Hanggang 9, para sa punong mesa ng 10 manlalaro, o isa lang para sa heads-up."
      ],
      [
        "Magaling ba ang mga bot?",
        "Ikaw ang bahala: nagkakamali ang madadaling bot, tumpak tumantya ng tsansa at mas madalas mag-bluff ang mahihirap na bot, at pinaghahalo ng halo-halong mesa ang tatlong antas at limang istilo ng paglalaro."
      ],
      [
        "Puwede ba akong maglaro kasama ang mga kaibigan at bot sa iisang mesa?",
        "Oo. Kapag nagho-host ka ng mesa sa sarili mong PokerTH server, sa LAN o sa internet, mapupuno ng waiting room ang mga bakanteng upuan ng mga manlalarong kompyuter."
      ]
    ]
  },
  fr: {
    "title": "Poker contre l’ordinateur — gratuit, hors ligne | PokerTH",
    "desc": "Texas Hold’em gratuit contre l’ordinateur, jusqu’à 9 bots à votre table, du niveau facile au difficile. Sans compte ni argent, et hors ligne sur mobile et PC.",
    "ldHeadline": "Jouer au poker Texas Hold’em contre l’ordinateur, gratuitement et hors ligne",
    "ldDesc": "Mode entraînement du client web PokerTH : Texas Hold’em contre des adversaires gérés par l’ordinateur, avec niveaux de difficulté, styles de jeu et trophées.",
    "h1": "Jouer au poker contre l’ordinateur, gratuitement et hors ligne",
    "lead": "Le mode entraînement de PokerTH distribue des tournois complets de Texas Hold’em contre des adversaires gérés par l’ordinateur, directement dans votre navigateur. Pas de compte, pas de connexion une fois le site ouvert, et rien en jeu : l’endroit idéal pour apprendre le jeu, tester une nouvelle stratégie ou faire une partie rapide dans le train.",
    "stepsH2": "Lancer une partie en trois étapes",
    "steps": [
      [
        "Ouvrez PokerTH et choisissez Local / entraînement",
        "Ouvrez ce site et choisissez Local / entraînement sur le premier écran. Aucune identification, aucun téléchargement ; une fois le site ouvert, ce mode fonctionne aussi sans connexion."
      ],
      [
        "Réglez votre table",
        "Choisissez jusqu’à 9 adversaires ordinateur, le tapis de départ, la vitesse de montée des blindes et la vitesse de jeu, ou partez d’un format tout prêt. Le niveau des bots se choisit dans la même fenêtre."
      ],
      [
        "Lancez la partie",
        "Appuyez sur Démarrer : les sièges vides se remplissent de joueurs ordinateur et les cartes sont distribuées. La partie continue jusqu’à ce qu’un joueur détienne tous les jetons."
      ]
    ],
    "levelsH2": "Quatre niveaux de difficulté",
    "levels": [
      [
        "Facile",
        "Des bots qui jugent mal leur main et bluffent rarement : les adversaires qu’il faut pour une première partie."
      ],
      [
        "Normale",
        "Des adversaires solides qui évaluent bien leurs chances et jouent juste quand leur tapis devient court."
      ],
      [
        "Difficile",
        "Les bots les plus forts : lecture précise des mains, jeu à tapis court affûté et davantage de bluffs."
      ],
      [
        "Mixte",
        "Une table variée, le réglage par défaut : en moyenne trois bots faciles, cinq normaux et deux difficiles sur dix."
      ]
    ],
    "brainH2": "Comment pensent les bots",
    "brainP": "Chaque bot calcule sa vraie probabilité de remporter le coup en distribuant de nombreuses fois les cartes restantes, face au nombre de joueurs encore dans le pot. Il joue plus serré en début de parole et tente des vols en fin de parole, fait un continuation bet après avoir relancé avant le flop, semi-bluffe ses gros tirages et, à partir du niveau normal, ne joue plus que tapis ou se couche quand son tapis devient court.",
    "stylesH2": "Cinq styles de jeu",
    "stylesP": "La difficulté détermine à quel point un bot lit bien le jeu ; son style détermine sa façon de jouer. Chaque nouvelle table mélange :",
    "styles": [
      [
        "Rock",
        "très serré et prudent, entre dans peu de pots et bluffe rarement."
      ],
      [
        "Serré-agressif",
        "choisit de bonnes mains et mise fort avec."
      ],
      [
        "Large-agressif",
        "joue beaucoup de mains et vous met la pression."
      ],
      [
        "Calling station",
        "suit bien trop souvent et relance rarement."
      ],
      [
        "Maniac",
        "relance et bluffe sans arrêt."
      ]
    ],
    "formatsH2": "Entraînez-vous sur les vrais formats",
    "formatsP": "Des réglages tout prêts permettent de lancer une partie Tranquille, Normale ou Rapide, ou de s’entraîner dans les conditions des compétitions de pokerth.net : le rythme officiel des parties Classement, la We Cup et la BBC avec ses blindes qui montent avec le temps. Vos propres réglages peuvent être enregistrés comme un format bien à vous.",
    "trophiesH2": "Trophées et statistiques",
    "trophiesP": "Le mode entraînement a sa propre progression : plus de trente trophées en six catégories — mains jouées, parties gagnées, séries de victoires, une victoire contre neuf bots difficiles, bluffs et quelques secrets. Les statistiques contre les bots sont tenues à part de vos parties en ligne, et quand vous vous connectez avec un compte pokerth.net, vos trophées vous suivent sur vos autres appareils.",
    "learnH2": "Le meilleur endroit pour apprendre",
    "learnP": "Toutes les aides du client web fonctionnent ici sans pression : l’onglet Chances avec votre probabilité de gagner à mesure que les cartes sortent, l’affichage de la force de la main, les actions présélectionnées et les raccourcis clavier. Quand vous vous sentez prêt, la même table vous attend sur pokerth.net face à de vrais joueurs.",
    "offlineH2": "Hors ligne, sur tous les appareils",
    "offlineP": "PokerTH est une application web : elle tourne dans le navigateur sur iPhone, Android, Windows, macOS et Linux, et peut être ajoutée à l’écran d’accueil comme une application. Une fois le site ouvert, le mode entraînement ne demande plus aucune connexion — en mode avion, dans le métro ou partout où il n’y a pas de réseau.",
    "faqH2": "Questions",
    "faq": [
      [
        "Peut-on jouer au poker contre l’ordinateur gratuitement ?",
        "Oui. PokerTH est un logiciel gratuit et open source, sans publicité ni achats intégrés. Les jetons sont uniquement fictifs."
      ],
      [
        "Faut-il un compte ou une connexion ?",
        "Non. Le mode entraînement ne demande aucun compte et, une fois le site ouvert, il fonctionne sans connexion."
      ],
      [
        "Contre combien d’adversaires ordinateur peut-on jouer ?",
        "Jusqu’à 9, pour une table complète de 10 joueurs, ou un seul pour un tête-à-tête."
      ],
      [
        "Les bots sont-ils bons ?",
        "C’est vous qui choisissez : les bots faciles font des erreurs, les bots difficiles évaluent précisément leurs chances et bluffent davantage, et la table mixte mêle les trois niveaux à cinq styles de jeu."
      ],
      [
        "Peut-on jouer avec des amis et des bots à la même table ?",
        "Oui. Quand vous hébergez une table sur votre propre serveur PokerTH, en LAN ou sur Internet, le salon d’attente peut remplir les sièges vides avec des joueurs ordinateur."
      ]
    ]
  },
  ga: {
    "title": "Pócar in aghaidh an ríomhaire — saor in aisce, as líne | PokerTH",
    "desc": "Texas Hold’em saor in aisce in aghaidh an ríomhaire, suas le 9 róbónna ag do bhord, ó éasca go deacair. Gan chuntas ná airgead, oibríonn sé as líne ar fhón is ar PC.",
    "ldHeadline": "Imir pócar Texas Hold’em in aghaidh an ríomhaire, saor in aisce agus as líne",
    "ldDesc": "Mód cleachtaidh chliant gréasáin PokerTH: Texas Hold’em in aghaidh céilí comhraic ríomhaire, le leibhéil deacrachta, stíleanna imeartha agus trófaithe.",
    "h1": "Imir pócar in aghaidh an ríomhaire, saor in aisce agus as líne",
    "lead": "Déileálann mód cleachtaidh PokerTH comórtais iomlána Texas Hold’em in aghaidh céilí comhraic ríomhaire, díreach i do bhrabhsálaí. Gan chuntas, gan cheangal nuair a bheidh an suíomh oscailte uair amháin, agus gan aon rud i gceist: an áit chun an cluiche a fhoghlaim, straitéis nua a thriail, nó cluiche tapa a imirt ar an traein.",
    "stepsH2": "Tosaigh cluiche i dtrí chéim",
    "steps": [
      [
        "Oscail PokerTH agus roghnaigh Áitiúil / cleachtadh",
        "Oscail an suíomh seo agus roghnaigh Áitiúil / cleachtadh ar an gcéad scáileán. Níl logáil isteach ná íoslódáil ann; nuair a bheidh an suíomh oscailte uair amháin, oibríonn an mód gan cheangal freisin."
      ],
      [
        "Socraigh do bhord",
        "Roghnaigh suas le 9 gcéile comhraic ríomhaire, an chruach tosaigh, cé chomh tapa a ardaítear na blinds agus luas an chluiche, nó tosaigh ó fhormáid réamhshocraithe. Roghnaigh deacracht na róbónna san fhuinneog chéanna."
      ],
      [
        "Tosaigh an cluiche",
        "Brúigh Tosaigh: líontar na suíocháin fholmha le himreoirí ríomhaire agus déileáiltear na cártaí. Leanann an cluiche ar aghaidh go dtí go mbíonn na sceallóga ar fad ag imreoir amháin."
      ]
    ],
    "levelsH2": "Ceithre leibhéal deacrachta",
    "levels": [
      [
        "Éasca",
        "Róbónna a mheasann a lámha go mícheart agus is annamh a dhéanann bluff: na céilí comhraic cearta don chéad chluiche."
      ],
      [
        "Gnáth",
        "Céilí comhraic láidre a mheasann a seansanna go maith agus a imríonn i gceart nuair a éiríonn a gcruach gearr."
      ],
      [
        "Deacair",
        "Na róbónna is láidre: léamh beacht ar lámha, imirt ghéar le cruach ghearr agus níos mó bluffanna."
      ],
      [
        "Measctha",
        "Bord éagsúil, an réamhshocrú: ar an meán, as gach deich róbó, bíonn trí cinn ar leibhéal Éasca, cúig cinn ar leibhéal Gnáth agus dhá cheann ar leibhéal Deacair."
      ]
    ],
    "brainH2": "Conas a smaoiníonn na róbónna",
    "brainP": "Oibríonn gach róbó amach a fhíorsheans an lámh a bhuachan trí na cártaí atá fágtha a dhéileáil arís is arís eile, i gcoinne líon na n-imreoirí atá fós sa phota. Imríonn sé níos daingne i suíomh luath agus goideann sé ó shuíomh déanach, déanann sé geall leanúnachais (c-bet) tar éis ardú roimh an flop, déanann sé leathbhluff le draws láidre agus, ón leibhéal Gnáth suas, aistríonn sé go himirt All-In nó Fold nuair a éiríonn a chruach gearr.",
    "stylesH2": "Cúig stíl imeartha",
    "stylesP": "Socraíonn an deacracht cé chomh maith is a léann róbó an cluiche; socraíonn a stíl conas a imríonn sé. Meascann gach bord nua:",
    "styles": [
      [
        "Rock",
        "an-daingean agus cúramach, téann isteach i mbeagán potaí agus is annamh a dhéanann bluff."
      ],
      [
        "Tight-aggressive (TAG)",
        "roghnaíonn sé lámha maithe agus cuireann sé geallta láidre orthu."
      ],
      [
        "Loose-aggressive (LAG)",
        "imríonn sé go leor lámha agus cuireann sé brú ort."
      ],
      [
        "Calling station",
        "déanann sé Call i bhfad ró-mhinic agus is annamh a ardaíonn sé."
      ],
      [
        "Maniac",
        "ardaíonn sé agus déanann sé bluff gan stad."
      ]
    ],
    "formatsH2": "Cleacht na fíorfhormáidí",
    "formatsP": "Le socruithe réamhdhéanta is féidir leat cluiche Suaimhneach, Gnáth nó Tapa a thosú, nó cleachtadh faoi choinníollacha chomórtais pokerth.net: luas oifigiúil Ranking, an We Cup agus an BBC lena blinds de réir ama. Is féidir do shocruithe féin a shábháil mar fhormáid de do chuid féin.",
    "trophiesH2": "Trófaithe agus staitisticí",
    "trophiesP": "Tá a dhul chun cinn féin ag an mód cleachtaidh: níos mó ná tríocha trófaí i sé chatagóir — lámha imeartha, cluichí buaite, sraitheanna buanna, bua in aghaidh naoi róbó ar an leibhéal Deacair, bluffanna, agus cúpla rún. Coinnítear na staitisticí in aghaidh na róbónna ar leith ó do chluichí ar líne, agus nuair a logálann tú isteach le cuntas pokerth.net leanann do thrófaithe thú chuig do ghléasanna eile.",
    "learnH2": "An áit is fearr le foghlaim",
    "learnP": "Oibríonn gach cúnamh atá sa chliant gréasáin anseo gan bhrú: an cluaisín Seans le do sheans buaite de réir mar a nochtar na cártaí, taispeáint neart na láimhe, gníomhartha réamhroghnaithe agus aicearraí méarchláir. Nuair a bhraitheann tú réidh, tá an bord céanna ag fanacht leat ar pokerth.net in aghaidh fíorimreoirí.",
    "offlineH2": "As líne, ar gach gléas",
    "offlineP": "Is aip ghréasáin é PokerTH: ritheann sé sa bhrabhsálaí ar iPhone, Android, Windows, macOS agus Linux, agus is féidir é a chur leis an scáileán baile cosúil le haip. Nuair a bheidh sé oscailte, ní theastaíonn ceangal ar bith ón mód cleachtaidh — i mód eitleáin, ar an meitreo nó áit ar bith gan chomhartha.",
    "faqH2": "Ceisteanna",
    "faq": [
      [
        "An féidir liom pócar a imirt in aghaidh an ríomhaire saor in aisce?",
        "Is féidir. Is bogearraí saor in aisce foinse oscailte é PokerTH, gan fógraí agus gan ceannacháin san aip. Is airgead cluiche amháin iad na sceallóga."
      ],
      [
        "An dteastaíonn cuntas nó ceangal uaim?",
        "Ní theastaíonn. Ní theastaíonn cuntas ón mód cleachtaidh, agus nuair a bheidh an suíomh oscailte uair amháin oibríonn sé gan cheangal."
      ],
      [
        "Cé mhéad céile comhraic ríomhaire is féidir liom a imirt ina n-aghaidh?",
        "Suas le 9, le haghaidh bord iomlán de 10 n-imreoir, nó céile comhraic amháin le haghaidh heads-up."
      ],
      [
        "An bhfuil na róbónna go maith?",
        "Is fútsa atá sé: déanann róbónna éasca botúin, léann róbónna deacra a seansanna go beacht agus déanann siad níos mó bluffanna, agus meascann an bord measctha na trí leibhéal le cúig stíl imeartha."
      ],
      [
        "An féidir liom imirt le cairde agus róbónna ag an mbord céanna?",
        "Is féidir. Nuair a óstálann tú bord ar do fhreastalaí PokerTH féin, ar LAN nó ar an idirlíon, is féidir leis an seomra feithimh na suíocháin fholmha a líonadh le himreoirí ríomhaire."
      ]
    ]
  },
  gd: {
    "title": "Pòcair an aghaidh coimpiutair — an-asgaidh, far-loidhne | PokerTH",
    "desc": "Texas Hold’em an-asgaidh an aghaidh coimpiutair: suas ri 9 bots aig do bhòrd, furasta gu doirbh. Gun chunntas no airgead, is obraichidh e far-loidhne air fòn is PC.",
    "ldHeadline": "Cluich pòcair Texas Hold’em an aghaidh a’ choimpiutair, an-asgaidh is far-loidhne",
    "ldDesc": "Modh trèanaidh cliant-lìn PokerTH: Texas Hold’em an aghaidh luchd-dùbhlain coimpiutair, le ìrean duilgheadais, stoidhlichean cluiche is duaisean.",
    "h1": "Cluich pòcair an aghaidh a’ choimpiutair, an-asgaidh is far-loidhne",
    "lead": "Bidh modh trèanaidh PokerTH a’ roinn co-fharpaisean slàna Texas Hold’em an aghaidh luchd-dùbhlain coimpiutair, dìreach sa bhrabhsair agad. Gun chunntas, gun cheangal aon uair ’s gun deach an làrach fhosgladh, is gun dad an geall: an t-àite airson an geama ionnsachadh, ro-innleachd ùr fheuchainn, no geama luath a chluich air an trèana.",
    "stepsH2": "Tòisich geama ann an trì ceumannan",
    "steps": [
      [
        "Fosgail PokerTH is tagh Ionadail / trèanadh",
        "Fosgail an làrach seo is tagh Ionadail / trèanadh air a’ chiad sgrìn. Chan fheum thu clàradh a-steach no dad a luchdachadh a-nuas; aon uair ’s gun deach an làrach fhosgladh, obraichidh am modh gun cheangal cuideachd."
      ],
      [
        "Cuir do bhòrd air dòigh",
        "Tagh suas ri 9 luchd-dùbhlain coimpiutair, an stoc tòiseachaidh, cho luath ’s a dh’èireas na dallabhan agus astar a’ gheama, no tòisich le cruth deiseil. Tagh duilgheadas nam bots san aon uinneag."
      ],
      [
        "Tòisich an geama",
        "Brùth “Toiseach”: lìonaidh cluicheadairean coimpiutair na suidheachain falamh agus thèid na cairtean a roinn. Leanaidh an geama gus am bi a h-uile chip aig aon chluicheadair."
      ]
    ],
    "levelsH2": "Ceithir ìrean duilgheadais",
    "levels": [
      [
        "Furasta",
        "Bots a bheir droch bhreith air na làmhan aca ’s nach dèan bluff ach ainneamh: na co-fharpaisich cheart airson a’ chiad gheama."
      ],
      [
        "Àbhaisteach",
        "Luchd-dùbhlain làidir a leughas an cothroman gu math is a chluicheas gu ceart nuair a dh’fhàsas an stoc aca goirid."
      ],
      [
        "Doirbh",
        "Na bots as treasa: leughadh làmhan pongail, cluich gheur le stoc goirid agus barrachd bluff."
      ],
      [
        "Measgaichte",
        "Bòrd measgaichte, an roghainn bhunaiteach: sa chumantas, trì bots furasta, còig àbhaisteach is dhà doirbh as gach deich."
      ]
    ],
    "brainH2": "Mar a smaoinicheas na bots",
    "brainP": "Obraichidh gach bot a-mach a chothrom fìor an làmh a bhuannachadh le bhith a’ roinn nan cairtean a tha air fhàgail iomadh turas, a rèir na h-àireimh de chluicheadairean a tha fhathast sa phota. Cluichidh e nas teinne ann an suidheachadh tràth agus goididh e o shuidheachadh anmoch, nì e geall leantainneach (continuation bet) às dèidh àrdachadh ron fhlop, nì e leth-bhluff le tarraingean làidir agus, on ìre àbhaisteach suas, atharraichidh e gu cluich All-In no Fold nuair a dh’fhàsas an stoc aige goirid.",
    "stylesH2": "Còig stoidhlichean cluiche",
    "stylesP": "Suidhichidh an duilgheadas cho math ’s a leughas bot an geama; suidhichidh an stoidhle aige mar a chluicheas e. Measgaichidh gach bòrd ùr:",
    "styles": [
      [
        "Rock",
        "glè theann is faiceallach, thèid e a-steach do bheagan photaichean is cha dèan e bluff ach ainneamh."
      ],
      [
        "Tight-aggressive (TAG)",
        "taghaidh e làmhan math is cuiridh e geall làidir orra."
      ],
      [
        "Loose-aggressive (LAG)",
        "cluichidh e mòran làmhan is cuiridh e cuideam ort."
      ],
      [
        "Calling station",
        "nì e Call fada ro thric is cha dèan e Raise ach ainneamh."
      ],
      [
        "Maniac",
        "nì e Raise is bluff fad na h-ùine."
      ]
    ],
    "formatsH2": "Cleachd na fìor chruthan",
    "formatsP": "Le roghainnean deiseil, ’s urrainn dhut geama Sàmhach, Àbhaisteach no Luath a thòiseachadh, no cleachdadh fo chumhachan farpaisean pokerth.net: astar oifigeil Rangachadh, an We Cup agus am BBC le na dallabhan aige a rèir ùine. Gabhaidh na roghainnean agad fhèin sàbhaladh mar chruth dhut fhèin.",
    "trophiesH2": "Duaisean is staitistearachd",
    "trophiesP": "Tha adhartas fhèin aig a’ mhodh trèanaidh: còrr is trithead duais ann an sia roinnean — làmhan air an cluich, geamannan air am buannachadh, sreathan bhuannachdan, buaidh an aghaidh naoi bots doirbh, bluffs, agus beagan dìomhaireachdan. Thèid an staitistearachd an aghaidh nam bots a chumail air leth o na geamannan air-loidhne agad, agus nuair a chlàraicheas tu a-steach le cunntas pokerth.net, leanaidh na duaisean agad thu gu na h-uidheaman eile agad.",
    "learnH2": "An t-àite as fheàrr airson ionnsachadh",
    "learnP": "Obraichidh gach taic a th’ aig a’ chliant-lìn an seo gun chuideam: an taba Cothroman le do chothrom buannachadh fhad ’s a thig na cairtean a-mach, taisbeanadh neart na làimhe, gnìomhan ro-thaghte agus ath-ghoiridean meur-chlàir. Nuair a bhios tu deiseil, tha an aon bhòrd a’ feitheamh ort air pokerth.net an aghaidh fìor chluicheadairean.",
    "offlineH2": "Far-loidhne, air gach uidheam",
    "offlineP": "’S e aplacaid-lìn a th’ ann am PokerTH: ruithidh e sa bhrabhsair air iPhone, Android, Windows, macOS is Linux, agus gabhaidh a chur ris an sgrìn-dachaigh mar aplacaid. Aon uair ’s gun deach fhosgladh, chan fheum am modh trèanaidh ceangal sam bith — ann am modh itealain, air an fho-thalamh no àite sam bith gun chomharra.",
    "faqH2": "Ceistean",
    "faq": [
      [
        "An urrainn dhomh pòcair a chluich an aghaidh a’ choimpiutair an-asgaidh?",
        "’S urrainn. Tha PokerTH na bhathar-bog an-asgaidh le còd fosgailte, gun sanasachd is gun cheannach am broinn na h-aplacaid. Chan eil sna chips ach airgead cluiche."
      ],
      [
        "A bheil feum agam air cunntas no ceangal?",
        "Chan eil. Chan fheum am modh trèanaidh cunntas, agus aon uair ’s gun deach an làrach fhosgladh, obraichidh e gun cheangal."
      ],
      [
        "Cò mheud neach-dùbhlain coimpiutair as urrainn dhomh cluich nan aghaidh?",
        "Suas ri 9, airson bòrd làn de 10 cluicheadairean, no dìreach aon airson cluich fear an aghaidh fir."
      ],
      [
        "A bheil na bots math?",
        "Tha sin an urra riut fhèin: nì bots furasta mearachdan, leughaidh bots doirbh an cothroman gu pongail is nì iad barrachd bluff, agus measgaichidh am bòrd measgaichte na trì ìrean le còig stoidhlichean cluiche."
      ],
      [
        "An urrainn dhomh cluich le caraidean is bots aig an aon bhòrd?",
        "’S urrainn. Nuair a chuireas tu bòrd air bhonn air an fhrithealaiche PokerTH agad fhèin, air LAN no air an eadar-lìon, ’s urrainn don t-seòmar-feitheimh na suidheachain falamh a lìonadh le cluicheadairean coimpiutair."
      ]
    ]
  },
  gl: {
    "title": "Póker contra o ordenador — de balde e sen conexión | PokerTH",
    "desc": "Texas Hold’em de balde contra rivais do ordenador, ata 9 bots na túa mesa, de doado a difícil. Sen conta, sen cartos e funciona sen conexión no móbil e no PC.",
    "ldHeadline": "Xoga ao póker Texas Hold’em contra o ordenador, de balde e sen conexión",
    "ldDesc": "Modo adestramento do cliente web de PokerTH: Texas Hold’em contra rivais controlados polo ordenador, con niveis de dificultade, estilos de xogo e trofeos.",
    "h1": "Xoga ao póker contra o ordenador, de balde e sen conexión",
    "lead": "O modo adestramento de PokerTH reparte torneos completos de Texas Hold’em contra rivais controlados polo ordenador, directamente no teu navegador. Sen conta, sen conexión unha vez aberto o sitio e sen nada en xogo: o lugar para aprender o xogo, probar unha estratexia nova ou botar unha partida rápida no tren.",
    "stepsH2": "Comeza unha partida en tres pasos",
    "steps": [
      [
        "Abre PokerTH e escolle Local / adestramento",
        "Abre este sitio e escolle Local / adestramento na primeira pantalla. Non hai inicio de sesión nin descarga; unha vez aberto o sitio, o modo tamén funciona sen conexión."
      ],
      [
        "Configura a túa mesa",
        "Escolle ata 9 rivais do ordenador, a pila inicial, a rapidez coa que soben as cegas e a velocidade de xogo, ou parte dun formato xa preparado. Escolle a dificultade dos bots na mesma xanela."
      ],
      [
        "Comeza a partida",
        "Preme Inicio: os asentos baleiros énchense con xogadores do ordenador e repártense as cartas. A partida continúa ata que un xogador ten todas as fichas."
      ]
    ],
    "levelsH2": "Catro niveis de dificultade",
    "levels": [
      [
        "Doado",
        "Bots que xulgan mal as súas mans e rara vez fan farol: os rivais axeitados para unha primeira partida."
      ],
      [
        "Normal",
        "Rivais sólidos que len ben as súas posibilidades e xogan correctamente cando a súa pila se fai curta."
      ],
      [
        "Difícil",
        "Os bots máis fortes: lectura precisa das mans, xogo afiado con pila curta e máis farois."
      ],
      [
        "Mixta",
        "Unha mesa variada, a opción predeterminada: de media, tres bots doados, cinco normais e dous difíciles de cada dez."
      ]
    ],
    "brainH2": "Como pensan os bots",
    "brainP": "Cada bot calcula a súa probabilidade real de gañar a man repartindo moitas veces as cartas que quedan, contra o número de xogadores que seguen no bote. Xoga máis pechado en posición temperá e rouba desde posición tardía, fai unha aposta de continuación despois de subir antes do flop, fai semifarol cos proxectos fortes e, a partir do nivel normal, pasa a xogar all-in ou Fold cando a súa pila se fai curta.",
    "stylesH2": "Cinco estilos de xogo",
    "stylesP": "A dificultade determina o ben que un bot le a partida; o seu estilo, como xoga. Cada mesa nova mestura:",
    "styles": [
      [
        "Roca",
        "moi pechado e prudente, entra en poucos botes e rara vez fai farol."
      ],
      [
        "Tight-agresivo (TAG)",
        "escolle boas mans e aposta forte con elas."
      ],
      [
        "Loose-agresivo (LAG)",
        "xoga moitas mans e ponche presión."
      ],
      [
        "Calling station",
        "iguala demasiado a miúdo e rara vez sobe."
      ],
      [
        "Maníaco",
        "sobe e fai farol constantemente."
      ]
    ],
    "formatsH2": "Practica os formatos reais",
    "formatsP": "Os axustes xa preparados permiten comezar unha partida Tranquilo, Normal ou Rápido, ou practicar nas condicións das competicións de pokerth.net: o ritmo oficial Ranking, a We Cup e a BBC coas súas cegas por tempo. Os teus propios axustes pódense gardar como un formato propio.",
    "trophiesH2": "Trofeos e estatísticas",
    "trophiesP": "O modo adestramento ten a súa propia progresión: máis de trinta trofeos en seis categorías — mans xogadas, partidas gañadas, rachas de vitorias, unha vitoria contra nove bots difíciles, farois e algúns segredos. As estatísticas contra os bots gárdanse á parte das túas partidas en liña e, cando inicias sesión cunha conta de pokerth.net, os teus trofeos seguen contigo nos teus outros dispositivos.",
    "learnH2": "O mellor lugar para aprender",
    "learnP": "Todas as axudas do cliente web funcionan aquí sen presión: a lapela Posibilidades coa túa probabilidade de gañar a medida que saen as cartas, o indicador da forza da man, as accións preseleccionadas e os atallos de teclado. Cando te sintas preparado, a mesma mesa agárdate en pokerth.net contra xogadores reais.",
    "offlineH2": "Sen conexión, en calquera dispositivo",
    "offlineP": "PokerTH é unha aplicación web: funciona no navegador en iPhone, Android, Windows, macOS e Linux, e pódese engadir á pantalla de inicio como unha aplicación. Unha vez aberto, o modo adestramento non necesita conexión ningunha — en modo avión, no metro ou en calquera lugar sen cobertura.",
    "faqH2": "Preguntas",
    "faq": [
      [
        "Podo xogar ao póker contra o ordenador de balde?",
        "Si. PokerTH é software de balde e de código aberto, sen anuncios nin compras dentro da aplicación. As fichas son só cartos de xogo."
      ],
      [
        "Necesito unha conta ou conexión?",
        "Non. O modo adestramento non necesita conta e, unha vez aberto o sitio, funciona sen conexión."
      ],
      [
        "Contra cantos rivais do ordenador podo xogar?",
        "Ata 9, para unha mesa completa de 10 xogadores, ou un só para xogar un contra un."
      ],
      [
        "Son bos os bots?",
        "Depende de ti: os bots doados cometen erros, os difíciles len as súas posibilidades con precisión e fan máis farol, e a mesa mixta combina os tres niveis con cinco estilos de xogo."
      ],
      [
        "Podo xogar con amigos e bots na mesma mesa?",
        "Si. Cando aloxas unha mesa no teu propio servidor PokerTH, nunha LAN ou en internet, a sala de espera pode encher os asentos baleiros con xogadores do ordenador."
      ]
    ]
  },
  gu: {
    "title": "કમ્પ્યુટર સામે પોકર રમો — મફત, ઓફલાઇન | PokerTH",
    "desc": "કમ્પ્યુટર પ્રતિસ્પર્ધીઓ સામે મફત Texas Hold’em, તમારા ટેબલ પર 9 બોટ્સ સુધી, સહેલાથી અઘરા સુધી. ખાતું નહીં, પૈસા નહીં, અને ફોન તથા PC પર ઓફલાઇન ચાલે છે.",
    "ldHeadline": "કમ્પ્યુટર સામે Texas Hold’em પોકર રમો, મફત અને ઓફલાઇન",
    "ldDesc": "PokerTH વેબ ક્લાયન્ટનો પ્રેક્ટિસ મોડ: કમ્પ્યુટર પ્રતિસ્પર્ધીઓ સામે Texas Hold’em, મુશ્કેલીના સ્તરો, રમવાની શૈલીઓ અને ટ્રોફીઝ સાથે.",
    "h1": "કમ્પ્યુટર સામે પોકર રમો, મફત અને ઓફલાઇન",
    "lead": "PokerTH નો પ્રેક્ટિસ મોડ કમ્પ્યુટર પ્રતિસ્પર્ધીઓ સામે પૂરી Texas Hold’em ટુર્નામેન્ટ્સ રમાડે છે, સીધું તમારા બ્રાઉઝરમાં. ખાતું નહીં, સાઇટ એક વાર ખૂલી જાય પછી કનેક્શન નહીં, અને દાવ પર કશું નહીં: રમત શીખવા, નવી વ્યૂહરચના અજમાવવા કે ટ્રેનમાં ઝડપી ગેમ રમવા માટેની જગ્યા.",
    "stepsH2": "ત્રણ પગલાંમાં ગેમ શરૂ કરો",
    "steps": [
      [
        "PokerTH ખોલો અને «લોકલ / પ્રેક્ટિસ» પસંદ કરો",
        "આ સાઇટ ખોલો અને પહેલી સ્ક્રીન પર «લોકલ / પ્રેક્ટિસ» પસંદ કરો. લોગિન નહીં, ડાઉનલોડ નહીં; સાઇટ એક વાર ખૂલી જાય પછી, આ મોડ કનેક્શન વગર પણ ચાલે છે."
      ],
      [
        "તમારું ટેબલ તૈયાર કરો",
        "9 સુધી કમ્પ્યુટર પ્રતિસ્પર્ધીઓ, શરૂઆતનો સ્ટેક, બ્લાઇન્ડ્સ કેટલી ઝડપે વધે અને ગેમની ઝડપ પસંદ કરો, અથવા તૈયાર ફોર્મેટથી શરૂ કરો. બોટ્સની મુશ્કેલી એ જ વિન્ડોમાં પસંદ કરો."
      ],
      [
        "ગેમ શરૂ કરો",
        "«શરૂ કરો» દબાવો: ખાલી સીટ્સ કમ્પ્યુટર ખેલાડીઓથી ભરાઈ જાય છે અને કાર્ડ્સ વહેંચાય છે. એક ખેલાડી પાસે બધી ચિપ્સ આવે ત્યાં સુધી ગેમ ચાલે છે."
      ]
    ],
    "levelsH2": "મુશ્કેલીના ચાર સ્તર",
    "levels": [
      [
        "સહેલી",
        "પોતાના હેન્ડનો ખોટો અંદાજ લગાવતા અને ભાગ્યે જ બ્લફ કરતા બોટ્સ: પહેલી ગેમ માટે યોગ્ય પ્રતિસ્પર્ધીઓ."
      ],
      [
        "સામાન્ય",
        "મજબૂત પ્રતિસ્પર્ધીઓ, જે પોતાની શક્યતાઓ સારી રીતે વાંચે છે અને સ્ટેક નાનો થાય ત્યારે સાચું રમે છે."
      ],
      [
        "અઘરી",
        "સૌથી મજબૂત બોટ્સ: હેન્ડનું ચોક્કસ વાંચન, નાના સ્ટેક સાથે ધારદાર રમત અને વધુ બ્લફ."
      ],
      [
        "મિશ્ર",
        "વૈવિધ્યસભર ટેબલ, ડિફોલ્ટ: સરેરાશ દર દસમાંથી ત્રણ સહેલા બોટ્સ, પાંચ સામાન્ય અને બે અઘરા."
      ]
    ],
    "brainH2": "બોટ્સ કેવી રીતે વિચારે છે",
    "brainP": "દરેક બોટ બાકી કાર્ડ્સ અનેક વાર વહેંચીને, પોટમાં હજી રહેલા ખેલાડીઓની સંખ્યા સામે, હેન્ડ જીતવાની પોતાની સાચી શક્યતા ગણે છે. તે શરૂઆતની પોઝિશનમાં વધુ ટાઇટ રમે છે અને મોડી પોઝિશનથી સ્ટીલ કરે છે, ફ્લોપ પહેલાં Raise કર્યા પછી continuation bet લગાવે છે, મજબૂત ડ્રો સાથે સેમી-બ્લફ કરે છે અને, સામાન્ય સ્તરથી ઉપર, સ્ટેક નાનો થાય ત્યારે All-In અથવા Fold રમત પર આવી જાય છે.",
    "stylesH2": "રમવાની પાંચ શૈલીઓ",
    "stylesP": "મુશ્કેલી નક્કી કરે છે કે બોટ રમતને કેટલી સારી રીતે વાંચે છે; તેની શૈલી નક્કી કરે છે કે તે કેવી રીતે રમે છે. દરેક નવા ટેબલ પર મિશ્રણ હોય છે:",
    "styles": [
      [
        "રૉક",
        "ખૂબ ટાઇટ અને સાવચેત, ઓછા પોટમાં ઊતરે છે અને ભાગ્યે જ બ્લફ કરે છે."
      ],
      [
        "ટાઇટ-એગ્રેસિવ",
        "સારા હેન્ડ પસંદ કરે છે અને તેના પર જોરથી દાવ લગાવે છે."
      ],
      [
        "લૂઝ-એગ્રેસિવ",
        "ઘણા હેન્ડ રમે છે અને તમારા પર દબાણ લાવે છે."
      ],
      [
        "કોલિંગ સ્ટેશન",
        "જરૂર કરતાં ઘણી વધુ વાર Call કરે છે અને ભાગ્યે જ Raise કરે છે."
      ],
      [
        "મેનિયાક",
        "સતત Raise અને બ્લફ કરે છે."
      ]
    ],
    "formatsH2": "સાચા ફોર્મેટ્સની પ્રેક્ટિસ કરો",
    "formatsP": "તૈયાર સેટિંગ્સથી તમે «શાંત», «સામાન્ય» કે «ઝડપી» ગેમ શરૂ કરી શકો છો, અથવા pokerth.net સ્પર્ધાઓની શરતોમાં પ્રેક્ટિસ કરી શકો છો: અધિકૃત «રેન્કિંગ» ઝડપ, We Cup અને સમય આધારિત બ્લાઇન્ડ્સવાળી BBC. તમારાં પોતાનાં સેટિંગ્સ તમારા પોતાના ફોર્મેટ તરીકે સાચવી શકાય છે.",
    "trophiesH2": "ટ્રોફીઝ અને આંકડા",
    "trophiesP": "પ્રેક્ટિસ મોડની પોતાની પ્રગતિ છે: છ શ્રેણીઓમાં ત્રીસથી વધુ ટ્રોફીઝ — રમેલા હેન્ડ, જીતેલી ગેમ્સ, જીતની હારમાળા, નવ અઘરા બોટ્સ સામે એક જીત, બ્લફ અને થોડાં રહસ્યો. બોટ્સ સામેના આંકડા તમારી ઓનલાઇન ગેમ્સથી અલગ રખાય છે, અને pokerth.net ખાતાથી લોગિન કરો ત્યારે તમારી ટ્રોફીઝ તમારાં બીજાં ઉપકરણો પર પણ સાથે આવે છે.",
    "learnH2": "શીખવા માટેની શ્રેષ્ઠ જગ્યા",
    "learnP": "વેબ ક્લાયન્ટની દરેક મદદ અહીં દબાણ વગર કામ કરે છે: કાર્ડ્સ ખૂલતાં જાય તેમ તમારી જીતવાની શક્યતા બતાવતું «ઓડ્સ» ટૅબ, હેન્ડની તાકાતનું પ્રદર્શન, પહેલેથી પસંદ કરેલી ચાલ અને કીબોર્ડ શોર્ટકટ્સ. તમે તૈયાર હો ત્યારે, એ જ ટેબલ pokerth.net પર સાચા ખેલાડીઓ સામે તમારી રાહ જુએ છે.",
    "offlineH2": "ઓફલાઇન, દરેક ઉપકરણ પર",
    "offlineP": "PokerTH એક વેબ એપ છે: તે iPhone, Android, Windows, macOS અને Linux પર બ્રાઉઝરમાં ચાલે છે, અને એપની જેમ હોમ સ્ક્રીન પર ઉમેરી શકાય છે. એક વાર ખૂલ્યા પછી પ્રેક્ટિસ મોડને કોઈ કનેક્શનની જરૂર નથી — એરપ્લેન મોડમાં, મેટ્રોમાં કે સિગ્નલ વગરની કોઈ પણ જગ્યાએ.",
    "faqH2": "પ્રશ્નો",
    "faq": [
      [
        "શું હું કમ્પ્યુટર સામે મફતમાં પોકર રમી શકું?",
        "હા. PokerTH મફત અને ઓપન સોર્સ સોફ્ટવેર છે, જાહેરાતો વગર અને એપમાં ખરીદી વગર. ચિપ્સ ફક્ત રમતના પૈસા છે."
      ],
      [
        "શું મારે ખાતું કે કનેક્શન જોઈએ?",
        "ના. પ્રેક્ટિસ મોડને ખાતાની જરૂર નથી, અને સાઇટ એક વાર ખૂલી જાય પછી તે કનેક્શન વગર ચાલે છે."
      ],
      [
        "હું કેટલા કમ્પ્યુટર પ્રતિસ્પર્ધીઓ સામે રમી શકું?",
        "9 સુધી, 10 ખેલાડીઓના પૂરા ટેબલ માટે, અથવા હેડ્સ-અપ માટે ફક્ત એક."
      ],
      [
        "શું બોટ્સ સારા છે?",
        "એ તમારા પર છે: સહેલા બોટ્સ ભૂલો કરે છે, અઘરા બોટ્સ પોતાની શક્યતાઓ ચોક્કસ વાંચે છે અને વધુ બ્લફ કરે છે, અને મિશ્ર ટેબલ ત્રણેય સ્તરોને રમવાની પાંચ શૈલીઓ સાથે ભેળવે છે."
      ],
      [
        "શું હું મિત્રો અને બોટ્સ સાથે એક જ ટેબલ પર રમી શકું?",
        "હા. જ્યારે તમે તમારા પોતાના PokerTH સર્વર પર, LAN પર કે ઇન્ટરનેટ પર ટેબલ હોસ્ટ કરો છો, ત્યારે વેઇટિંગ રૂમ ખાલી સીટ્સ કમ્પ્યુટર ખેલાડીઓથી ભરી શકે છે."
      ]
    ]
  },
  ha: {
    "title": "Buga poker da kwamfuta — kyauta, ba tare da intanet | PokerTH",
    "desc": "Texas Hold’em kyauta da abokan hamayya na kwamfuta: har bots 9 a teburinka, daga mai sauƙi zuwa mai wahala. Babu asusu ko kuɗi, yana aiki ba intanet a waya da PC.",
    "ldHeadline": "Buga poker Texas Hold’em da kwamfuta, kyauta kuma ba tare da intanet ba",
    "ldDesc": "Yanayin horo na abokin cinikin yanar gizo na PokerTH: Texas Hold’em da abokan hamayya na kwamfuta, tare da matakan wahala, salon wasa da kofuna.",
    "h1": "Buga poker da kwamfuta, kyauta kuma ba tare da intanet ba",
    "lead": "Yanayin horo na PokerTH yana raba cikakkun gasannin Texas Hold’em da abokan hamayya na kwamfuta, kai tsaye a burauzarka. Babu asusu, babu buƙatar haɗi da zarar an buɗe shafin, kuma babu abin da ke cikin haɗari: wurin koyon wasan, gwada sabuwar dabara, ko buga wasa mai sauri a cikin jirgin ƙasa.",
    "stepsH2": "Fara wasa a matakai uku",
    "steps": [
      [
        "Buɗe PokerTH ka zaɓi Na gida / horo",
        "Buɗe wannan shafin ka zaɓi Na gida / horo a allon farko. Babu shiga, babu saukewa; da zarar an buɗe shafin, yanayin yana aiki ko da babu haɗi."
      ],
      [
        "Shirya teburinka",
        "Zaɓi har zuwa abokan hamayya na kwamfuta 9, tarin farko, saurin hawan blinds da saurin wasa, ko ka fara daga tsarin da aka riga aka shirya. Zaɓi matakin wahalar bots a taga ɗaya."
      ],
      [
        "Fara wasan",
        "Danna Fara: kujerun da babu kowa suna cika da 'yan wasan kwamfuta kuma ana raba katuna. Wasan yana ci gaba har sai ɗan wasa ɗaya ya mallaki duk chips."
      ]
    ],
    "levelsH2": "Matakan wahala huɗu",
    "levels": [
      [
        "Mai sauƙi",
        "Bots da ke kuskuren kimanta hannayensu kuma ba safai suke bluff ba: abokan hamayya da suka dace da wasan farko."
      ],
      [
        "Na al'ada",
        "Abokan hamayya masu ƙarfi da ke kimanta damarsu da kyau kuma suke wasa daidai idan tarinsu ya ragu."
      ],
      [
        "Mai wahala",
        "Bots mafi ƙarfi: karanta hannaye daidai, wasa mai kaifi da ƙaramin tari da ƙarin bluff."
      ],
      [
        "Gauraye",
        "Tebur mai iri-iri, zaɓin asali: a matsakaici bots uku masu sauƙi, biyar na al'ada da biyu masu wahala cikin kowane goma."
      ]
    ],
    "brainH2": "Yadda bots ke tunani",
    "brainP": "Kowane bot yana lissafa ainihin damarsa ta cin hannun ta hanyar raba sauran katunan sau da yawa, idan aka kwatanta da yawan 'yan wasan da har yanzu suke cikin pot. Yana wasa a tsanake a matsayi na farko kuma yana sata daga matsayi na ƙarshe, yana yin continuation bet bayan ya yi raise kafin flop, yana semi-bluff da draws masu ƙarfi kuma, daga matakin na al'ada zuwa sama, yana komawa wasan All-In ko Fold idan tarinsa ya ragu.",
    "stylesH2": "Salon wasa biyar",
    "stylesP": "Matakin wahala yana ƙayyade yadda bot ke karanta wasan; salonsa yana ƙayyade yadda yake wasa. Kowane sabon tebur yana gauraya:",
    "styles": [
      [
        "Rock",
        "mai tsanani da taka-tsantsan sosai, yana shiga pots kaɗan kuma ba safai yake bluff ba."
      ],
      [
        "Tight-aggressive",
        "yana zaɓar hannaye masu kyau kuma yana caca da su da ƙarfi."
      ],
      [
        "Loose-aggressive",
        "yana wasa hannaye da yawa kuma yana matsa maka lamba."
      ],
      [
        "Calling station",
        "yana Call sau da yawa fiye da kima kuma ba safai yake Raise ba."
      ],
      [
        "Maniac",
        "yana Raise da bluff ba tsayawa."
      ]
    ],
    "formatsH2": "Yi horo a kan tsare-tsaren gaske",
    "formatsP": "Saitunan da aka riga aka shirya suna ba ka damar fara wasan Natsuwa, Na al'ada ko Mai sauri, ko kuma ka yi horo a yanayin gasannin pokerth.net: gudun Ranking na hukuma, We Cup da BBC tare da blinds ɗinta bisa lokaci. Ana iya ajiye saitunanka a matsayin tsarinka na kanka.",
    "trophiesH2": "Kofuna da ƙididdiga",
    "trophiesP": "Yanayin horo yana da nasa ci gaba: fiye da kofuna talatin a rukunoni shida — hannayen da aka buga, wasannin da aka ci, jerin nasarori, nasara a kan bots masu wahala tara, bluffs, da wasu sirrika. Ana ajiye ƙididdigar wasa da bots daban da wasanninka na intanet, kuma idan ka shiga da asusun pokerth.net, kofunanka suna bin ka zuwa sauran na'urorinka.",
    "learnH2": "Wuri mafi kyau don koyo",
    "learnP": "Duk taimakon abokin cinikin yanar gizo yana aiki a nan ba tare da matsi ba: Shafin Dama tare da damarka ta cin nasara yayin da katuna ke fitowa, nunin ƙarfin hannu, ayyukan da aka zaɓa tun farko da gajerun hanyoyin madannai. Idan ka ji ka shirya, tebur ɗin nan yana jiran ka a pokerth.net da 'yan wasa na gaske.",
    "offlineH2": "Ba tare da intanet ba, a kowace na'ura",
    "offlineP": "PokerTH manhajar yanar gizo ce: tana aiki a burauza a iPhone, Android, Windows, macOS da Linux, kuma ana iya ƙara ta zuwa allon gida kamar manhaja. Da zarar an buɗe ta, yanayin horo ba ya buƙatar kowane haɗi — a yanayin jirgin sama, a cikin jirgin ƙasa na ƙarƙashin ƙasa ko duk inda babu sigina.",
    "faqH2": "Tambayoyi",
    "faq": [
      [
        "Zan iya buga poker da kwamfuta kyauta?",
        "Ee. PokerTH manhaja ce kyauta mai buɗaɗɗen tushe, babu talla kuma babu sayayya a cikin manhaja. Chips kuɗin wasa ne kawai."
      ],
      [
        "Ina buƙatar asusu ko haɗi?",
        "A'a. Yanayin horo ba ya buƙatar asusu, kuma da zarar an buɗe shafin yana aiki ba tare da haɗi ba."
      ],
      [
        "Abokan hamayya na kwamfuta nawa zan iya karawa da su?",
        "Har zuwa 9, don cikakken tebur na 'yan wasa 10, ko ɗaya kawai don heads-up."
      ],
      [
        "Shin bots ɗin suna da ƙwarewa?",
        "Wannan ya rage naka: bots masu sauƙi suna yin kuskure, bots masu wahala suna kimanta damarsu daidai kuma suna ƙara bluff, kuma tebur mai gauraye yana haɗa matakai uku da salon wasa biyar."
      ],
      [
        "Zan iya wasa da abokai da bots a tebur ɗaya?",
        "Ee. Idan ka karɓi baƙuncin tebur a sabar PokerTH ɗinka, a LAN ko a intanet, ɗakin jira zai iya cika kujerun da babu kowa da 'yan wasan kwamfuta."
      ]
    ]
  },
  he: {
    "title": "לשחק פוקר נגד המחשב — בחינם, אופליין | PokerTH",
    "desc": "Texas Hold’em בחינם נגד יריבי מחשב, עד 9 בוטים בשולחן, מקל ועד קשה. בלי חשבון, בלי כסף, ועובד אופליין בטלפון ובמחשב.",
    "ldHeadline": "לשחק פוקר Texas Hold’em נגד המחשב, בחינם ואופליין",
    "ldDesc": "מצב האימון של לקוח הווב של PokerTH: Texas Hold’em נגד יריבי מחשב, עם רמות קושי, סגנונות משחק וגביעים.",
    "h1": "לשחק פוקר נגד המחשב, בחינם ואופליין",
    "lead": "מצב האימון של PokerTH מחלק טורנירי Texas Hold’em מלאים נגד יריבי מחשב, ישירות בדפדפן שלכם. בלי חשבון, בלי חיבור אחרי שהאתר נפתח פעם אחת, ובלי שום דבר על הכף: המקום ללמוד את המשחק, לנסות אסטרטגיה חדשה או לשחק משחק מהיר ברכבת.",
    "stepsH2": "מתחילים משחק בשלושה צעדים",
    "steps": [
      [
        "פותחים את PokerTH ובוחרים מקומי / אימון",
        "פתחו את האתר הזה ובחרו מקומי / אימון במסך הראשון. אין כניסה ואין הורדה; אחרי שהאתר נפתח פעם אחת, המצב עובד גם בלי חיבור."
      ],
      [
        "מגדירים את השולחן",
        "בחרו עד 9 יריבי מחשב, את הערימה ההתחלתית, את קצב עליית העיוורים ואת מהירות המשחק, או התחילו מפורמט מוכן. את רמת הקושי של הבוטים בוחרים באותו חלון."
      ],
      [
        "מתחילים את המשחק",
        "לחצו על התחלה: המושבים הריקים מתמלאים בשחקני מחשב והקלפים מחולקים. המשחק נמשך עד ששחקן אחד מחזיק את כל הז׳טונים."
      ]
    ],
    "levelsH2": "ארבע רמות קושי",
    "levels": [
      [
        "קל",
        "בוטים שמעריכים לא נכון את הידיים שלהם ומבלפים לעיתים רחוקות: היריבים המתאימים למשחק ראשון."
      ],
      [
        "רגיל",
        "יריבים יציבים שמעריכים היטב את הסיכויים שלהם ומשחקים נכון כשהערימה שלהם מתקצרת."
      ],
      [
        "קשה",
        "הבוטים החזקים ביותר: קריאת ידיים מדויקת, משחק חד עם ערימה קצרה ויותר בלופים."
      ],
      [
        "מעורב",
        "שולחן מגוון, ברירת המחדל: בממוצע שלושה בוטים קלים, חמישה רגילים ושניים קשים מכל עשרה."
      ]
    ],
    "brainH2": "איך הבוטים חושבים",
    "brainP": "כל בוט מחשב את הסיכוי האמיתי שלו לזכות ביד על ידי חלוקת הקלפים הנותרים פעמים רבות, מול מספר השחקנים שעדיין בקופה. הוא משחק הדוק יותר בעמדה מוקדמת וגונב מעמדה מאוחרת, מהמר המשך (continuation bet) אחרי העלאה לפני הפלופ, עושה חצי־בלוף עם השלמות חזקות, ומהרמה הרגילה ומעלה עובר למשחק של אול־אין או פולד כשהערימה שלו מתקצרת.",
    "stylesH2": "חמישה סגנונות משחק",
    "stylesP": "רמת הקושי קובעת כמה טוב בוט קורא את המשחק; הסגנון שלו קובע איך הוא משחק. כל שולחן חדש משלב:",
    "styles": [
      [
        "רוק",
        "הדוק וזהיר מאוד, נכנס למעט קופות ומבלף לעיתים רחוקות."
      ],
      [
        "הדוק־אגרסיבי",
        "בוחר ידיים טובות ומהמר עליהן בחוזקה."
      ],
      [
        "רופף־אגרסיבי",
        "משחק ידיים רבות ומפעיל עליכם לחץ."
      ],
      [
        "קולינג סטיישן",
        "עושה Call הרבה יותר מדי ומעלה לעיתים רחוקות."
      ],
      [
        "מניאק",
        "מעלה ומבלף כל הזמן."
      ]
    ],
    "formatsH2": "מתאמנים על הפורמטים האמיתיים",
    "formatsP": "הגדרות מוכנות מאפשרות להתחיל משחק רגוע, רגיל או מהיר, או להתאמן בתנאים של התחרויות של pokerth.net: קצב הדירוג הרשמי, ה־We Cup וה־BBC עם העיוורים מבוססי הזמן שלו. את ההגדרות שלכם אפשר לשמור כפורמט משלכם.",
    "trophiesH2": "גביעים וסטטיסטיקות",
    "trophiesP": "למצב האימון יש התקדמות משלו: יותר משלושים גביעים בשש קטגוריות — ידיים ששוחקו, משחקים שנוצחו, רצפי ניצחונות, ניצחון מול תשעה בוטים קשים, בלופים וכמה סודות. הסטטיסטיקות מול הבוטים נשמרות בנפרד מהמשחקים המקוונים שלכם, וכשאתם נכנסים עם חשבון pokerth.net, הגביעים שלכם עוברים איתכם למכשירים האחרים.",
    "learnH2": "המקום הטוב ביותר ללמוד",
    "learnP": "כל העזרים של לקוח הווב עובדים כאן בלי לחץ: לשונית סיכויים עם סיכויי הניצחון שלכם ככל שהקלפים יוצאים, תצוגת חוזק היד, פעולות שנבחרו מראש וקיצורי מקלדת. כשתרגישו מוכנים, אותו שולחן מחכה לכם ב־pokerth.net מול שחקנים אמיתיים.",
    "offlineH2": "אופליין, בכל מכשיר",
    "offlineP": "PokerTH היא אפליקציית ווב: היא רצה בדפדפן ב־iPhone, Android, Windows, macOS ו־Linux, ואפשר להוסיף אותה למסך הבית כמו אפליקציה. אחרי שנפתח פעם אחת, מצב האימון לא צריך חיבור בכלל — במצב טיסה, ברכבת התחתית או בכל מקום בלי קליטה.",
    "faqH2": "שאלות",
    "faq": [
      [
        "אפשר לשחק פוקר נגד המחשב בחינם?",
        "כן. PokerTH היא תוכנה חינמית בקוד פתוח, בלי פרסומות ובלי רכישות בתוך האפליקציה. הז׳טונים הם כסף משחק בלבד."
      ],
      [
        "צריך חשבון או חיבור?",
        "לא. מצב האימון לא דורש חשבון, ואחרי שהאתר נפתח פעם אחת הוא עובד בלי חיבור."
      ],
      [
        "נגד כמה יריבי מחשב אפשר לשחק?",
        "עד 9, לשולחן מלא של 10 שחקנים, או נגד יריב אחד בלבד, ראש בראש."
      ],
      [
        "הבוטים טובים?",
        "זה תלוי בכם: הבוטים הקלים טועים, הבוטים הקשים מעריכים את הסיכויים שלהם במדויק ומבלפים יותר, והשולחן המעורב משלב את שלוש הרמות עם חמישה סגנונות משחק."
      ],
      [
        "אפשר לשחק עם חברים ובוטים באותו שולחן?",
        "כן. כשאתם מארחים שולחן בשרת PokerTH משלכם, ברשת מקומית (LAN) או באינטרנט, חדר ההמתנה יכול למלא את המושבים הריקים בשחקני מחשב."
      ]
    ]
  },
  hi: {
    "title": "कंप्यूटर के ख़िलाफ़ पोकर — मुफ़्त, ऑफ़लाइन | PokerTH",
    "desc": "कंप्यूटर विरोधियों के ख़िलाफ़ मुफ़्त Texas Hold’em, आपकी मेज़ पर 9 बॉट तक, आसान से कठिन तक। न खाता, न पैसा, और फ़ोन व PC पर ऑफ़लाइन भी चलता है।",
    "ldHeadline": "कंप्यूटर के ख़िलाफ़ Texas Hold’em पोकर खेलें, मुफ़्त और ऑफ़लाइन",
    "ldDesc": "PokerTH वेब क्लाइंट का अभ्यास मोड: कंप्यूटर विरोधियों के ख़िलाफ़ Texas Hold’em, कठिनाई स्तरों, खेलने की शैलियों और ट्रॉफ़ियों के साथ।",
    "h1": "कंप्यूटर के ख़िलाफ़ पोकर खेलें, मुफ़्त और ऑफ़लाइन",
    "lead": "PokerTH का अभ्यास मोड कंप्यूटर विरोधियों के ख़िलाफ़ पूरे Texas Hold’em टूर्नामेंट खिलाता है, सीधे आपके ब्राउज़र में। न खाता, साइट एक बार खुल जाने के बाद न कनेक्शन, और दाँव पर कुछ नहीं: खेल सीखने, कोई नई रणनीति आज़माने या ट्रेन में एक झटपट गेम खेलने की सही जगह।",
    "stepsH2": "तीन चरणों में गेम शुरू करें",
    "steps": [
      [
        "PokerTH खोलें और लोकल / अभ्यास चुनें",
        "यह साइट खोलें और पहली स्क्रीन पर लोकल / अभ्यास चुनें। न लॉगिन, न डाउनलोड; साइट एक बार खुल जाने के बाद यह मोड बिना कनेक्शन के भी चलता है।"
      ],
      [
        "अपनी मेज़ तैयार करें",
        "9 तक कंप्यूटर विरोधी, शुरुआती चिप्स, ब्लाइंड कितनी तेज़ी से बढ़ें और खेल की गति चुनें, या किसी तैयार फ़ॉर्मेट से शुरू करें। उसी विंडो में बॉट्स की कठिनाई चुनें।"
      ],
      [
        "गेम शुरू करें",
        "शुरू दबाएँ: ख़ाली सीटें कंप्यूटर खिलाड़ियों से भर जाती हैं और पत्ते बँट जाते हैं। गेम तब तक चलता है जब तक सारे चिप्स एक खिलाड़ी के पास न आ जाएँ।"
      ]
    ],
    "levelsH2": "कठिनाई के चार स्तर",
    "levels": [
      [
        "आसान",
        "ऐसे बॉट जो अपने हाथ को ग़लत आँकते हैं और कम ही ब्लफ़ करते हैं: पहले गेम के लिए सही विरोधी।"
      ],
      [
        "सामान्य",
        "मज़बूत विरोधी जो अपनी संभावनाएँ अच्छी तरह आँकते हैं और चिप्स कम होने पर सही खेलते हैं।"
      ],
      [
        "कठिन",
        "सबसे ताक़तवर बॉट: हाथों की सटीक पढ़ाई, कम चिप्स के साथ पैना खेल और ज़्यादा ब्लफ़।"
      ],
      [
        "मिश्रित",
        "एक विविध मेज़, डिफ़ॉल्ट रूप से: औसतन हर दस में तीन आसान, पाँच सामान्य और दो कठिन बॉट।"
      ]
    ],
    "brainH2": "बॉट कैसे सोचते हैं",
    "brainP": "हर बॉट बाक़ी पत्तों को कई बार बाँटकर, पॉट में अभी भी मौजूद खिलाड़ियों की संख्या के हिसाब से, हाथ जीतने की अपनी असली संभावना निकालता है। शुरुआती पोज़िशन से वह ज़्यादा टाइट खेलता है और आख़िरी पोज़िशन से स्टील करता है, फ़्लॉप से पहले Raise करने के बाद कंटिन्युएशन बेट लगाता है, मज़बूत ड्रॉ पर सेमी-ब्लफ़ करता है और सामान्य स्तर से ऊपर, चिप्स कम होने पर all-in या fold वाले खेल पर आ जाता है।",
    "stylesH2": "खेलने की पाँच शैलियाँ",
    "stylesP": "कठिनाई तय करती है कि बॉट खेल को कितनी अच्छी तरह पढ़ता है; उसकी शैली तय करती है कि वह कैसे खेलता है। हर नई मेज़ पर मिले-जुले होते हैं:",
    "styles": [
      [
        "रॉक (Rock)",
        "बहुत टाइट और सावधान, कम पॉट में उतरता है और कम ही ब्लफ़ करता है।"
      ],
      [
        "टाइट-एग्रेसिव (TAG)",
        "अच्छे हाथ चुनता है और उन पर ज़ोरदार दाँव लगाता है।"
      ],
      [
        "लूज़-एग्रेसिव (LAG)",
        "बहुत सारे हाथ खेलता है और आप पर दबाव बनाता है।"
      ],
      [
        "कॉलिंग स्टेशन",
        "बहुत ज़्यादा बार Call करता है और कम ही Raise करता है।"
      ],
      [
        "मैनियक",
        "लगातार Raise और ब्लफ़ करता है।"
      ]
    ],
    "formatsH2": "असली फ़ॉर्मेट का अभ्यास करें",
    "formatsP": "तैयार सेटिंग्स से आप आरामदायक, सामान्य या तेज़ गेम शुरू कर सकते हैं, या pokerth.net की प्रतियोगिताओं की शर्तों में अभ्यास कर सकते हैं: आधिकारिक रैंकिंग गति, We Cup और समय के हिसाब से बढ़ने वाले ब्लाइंड वाला BBC। अपनी सेटिंग्स को आप अपने ख़ुद के फ़ॉर्मेट के रूप में सहेज सकते हैं।",
    "trophiesH2": "ट्रॉफ़ियाँ और आँकड़े",
    "trophiesP": "अभ्यास मोड की अपनी प्रगति है: छह श्रेणियों में तीस से ज़्यादा ट्रॉफ़ियाँ — खेले गए हाथ, जीते गए गेम, लगातार जीत, नौ कठिन बॉट के ख़िलाफ़ एक जीत, ब्लफ़ और कुछ रहस्य। बॉट्स के ख़िलाफ़ आँकड़े आपके ऑनलाइन गेम से अलग रखे जाते हैं, और जब आप pokerth.net खाते से लॉग इन करते हैं तो आपकी ट्रॉफ़ियाँ आपके दूसरे डिवाइसों पर भी आपके साथ जाती हैं।",
    "learnH2": "सीखने की सबसे अच्छी जगह",
    "learnP": "वेब क्लाइंट की हर मदद यहाँ बिना दबाव के काम करती है: संभावनाएँ टैब, जो पत्ते खुलते-खुलते आपकी जीत की संभावना दिखाता है, हाथ की ताक़त का डिस्प्ले, पहले से चुनी गई चालें और कीबोर्ड शॉर्टकट। जब आप तैयार महसूस करें, वही मेज़ pokerth.net पर असली खिलाड़ियों के साथ आपका इंतज़ार कर रही है।",
    "offlineH2": "ऑफ़लाइन, हर डिवाइस पर",
    "offlineP": "PokerTH एक वेब ऐप है: यह iPhone, Android, Windows, macOS और Linux पर ब्राउज़र में चलता है, और इसे ऐप की तरह होम स्क्रीन पर जोड़ा जा सकता है। एक बार खुल जाने के बाद अभ्यास मोड को किसी कनेक्शन की ज़रूरत नहीं — एयरप्लेन मोड में, मेट्रो में या कहीं भी जहाँ सिग्नल न हो।",
    "faqH2": "सवाल",
    "faq": [
      [
        "क्या मैं कंप्यूटर के ख़िलाफ़ मुफ़्त में पोकर खेल सकता हूँ?",
        "हाँ। PokerTH मुफ़्त और ओपन-सोर्स सॉफ़्टवेयर है, बिना विज्ञापन और बिना इन-ऐप ख़रीदारी के। चिप्स सिर्फ़ खेल के पैसे हैं।"
      ],
      [
        "क्या मुझे खाते या कनेक्शन की ज़रूरत है?",
        "नहीं। अभ्यास मोड के लिए किसी खाते की ज़रूरत नहीं, और साइट एक बार खुल जाने के बाद यह बिना कनेक्शन के चलता है।"
      ],
      [
        "मैं कितने कंप्यूटर विरोधियों के ख़िलाफ़ खेल सकता हूँ?",
        "9 तक, यानी 10 खिलाड़ियों की पूरी मेज़, या आमने-सामने के खेल के लिए सिर्फ़ एक।"
      ],
      [
        "क्या बॉट अच्छे हैं?",
        "यह आप पर है: आसान बॉट ग़लतियाँ करते हैं, कठिन बॉट अपनी संभावनाएँ सटीक आँकते हैं और ज़्यादा ब्लफ़ करते हैं, और मिश्रित मेज़ तीनों स्तरों को खेलने की पाँच शैलियों के साथ मिलाती है।"
      ],
      [
        "क्या मैं दोस्तों और बॉट्स के साथ एक ही मेज़ पर खेल सकता हूँ?",
        "हाँ। जब आप अपने ख़ुद के PokerTH सर्वर पर, LAN पर या इंटरनेट पर कोई मेज़ होस्ट करते हैं, तो वेटिंग रूम ख़ाली सीटों को कंप्यूटर खिलाड़ियों से भर सकता है।"
      ]
    ]
  },
  hr: {
    "title": "Poker protiv računala — besplatno, offline | PokerTH",
    "desc": "Besplatan Texas Hold’em protiv računala, do 9 botova za vašim stolom, od lakih do teških. Bez računa i novca, a radi i offline na mobitelu i računalu.",
    "ldHeadline": "Igrajte Texas Hold’em poker protiv računala, besplatno i offline",
    "ldDesc": "Način treninga u PokerTH web klijentu: Texas Hold’em protiv računalnih protivnika, s razinama težine, stilovima igre i trofejima.",
    "h1": "Igrajte poker protiv računala, besplatno i offline",
    "lead": "Način treninga u PokerTH-u dijeli cijele Texas Hold’em turnire protiv računalnih protivnika, izravno u vašem pregledniku. Bez računa, bez veze nakon što se stranica jednom otvori i bez ikakvog uloga: mjesto za učenje igre, isprobavanje nove strategije ili brzu partiju u vlaku.",
    "stepsH2": "Pokrenite igru u tri koraka",
    "steps": [
      [
        "Otvorite PokerTH i odaberite Lokalno / trening",
        "Otvorite ovu stranicu i na prvom zaslonu odaberite Lokalno / trening. Nema prijave ni preuzimanja; nakon što se stranica jednom otvori, ovaj način radi i bez veze."
      ],
      [
        "Postavite svoj stol",
        "Odaberite do 9 računalnih protivnika, početni stog, koliko brzo rastu ulozi i brzinu igre ili krenite od gotovog formata. Težinu botova birate u istom prozoru."
      ],
      [
        "Pokrenite igru",
        "Pritisnite Početak: prazna mjesta popunjavaju se računalnim igračima i karte se dijele. Igra traje dok jedan igrač ne drži sve žetone."
      ]
    ],
    "levelsH2": "Četiri razine težine",
    "levels": [
      [
        "Lako",
        "Botovi koji krivo procjenjuju svoje ruke i rijetko blefiraju: pravi protivnici za prvu igru."
      ],
      [
        "Normalno",
        "Čvrsti protivnici koji dobro procjenjuju svoje izglede i igraju ispravno kad im stog postane malen."
      ],
      [
        "Teško",
        "Najjači botovi: precizno čitanje ruku, oštra igra s malim stogom i više blefova."
      ],
      [
        "Mješovito",
        "Raznolik stol, zadana postavka: u prosjeku tri laka bota, pet normalnih i dva teška na svakih deset."
      ]
    ],
    "brainH2": "Kako botovi razmišljaju",
    "brainP": "Svaki bot izračunava svoju stvarnu šansu za dobitak ruke tako da mnogo puta podijeli preostale karte, s obzirom na broj igrača koji su još u potu. U ranoj poziciji igra tješnje, iz kasne pozicije krade, nakon raisea prije flopa nastavlja s continuation betom, polublefira s jakim čekanjima i, od normalne razine naviše, prelazi na igru all-in ili fold kad mu stog postane malen.",
    "stylesH2": "Pet stilova igre",
    "stylesP": "Težina određuje koliko dobro bot čita igru; njegov stil određuje kako igra. Svaki novi stol miješa:",
    "styles": [
      [
        "Rock",
        "vrlo tijesan i oprezan, ulazi u malo potova i rijetko blefira."
      ],
      [
        "Tijesan-agresivan",
        "bira dobre ruke i s njima snažno ulaže."
      ],
      [
        "Labav-agresivan",
        "igra mnogo ruku i vrši pritisak na vas."
      ],
      [
        "Calling station",
        "daleko prečesto plaća i rijetko diže."
      ],
      [
        "Manijak",
        "neprestano diže i blefira."
      ]
    ],
    "formatsH2": "Vježbajte prave formate",
    "formatsP": "Gotove postavke omogućuju pokretanje igre Mirna, Normalna ili Brza, ili vježbanje u uvjetima natjecanja na pokerth.net: službeni tempo igara Rang-lista, We Cup i BBC s ulozima koji rastu po vremenu. Vlastite postavke možete spremiti kao svoj format.",
    "trophiesH2": "Trofeji i statistika",
    "trophiesP": "Način treninga ima vlastiti napredak: više od trideset trofeja u šest kategorija — odigrane ruke, dobivene igre, nizovi pobjeda, pobjeda protiv devet teških botova, blefovi i nekoliko tajni. Statistika protiv botova vodi se odvojeno od vaših online igara, a kad se prijavite pokerth.net računom, trofeji vas prate i na drugim uređajima.",
    "learnH2": "Najbolje mjesto za učenje",
    "learnP": "Sva pomagala web klijenta ovdje rade bez pritiska: kartica Izgledi s vašom šansom za pobjedu kako karte izlaze, prikaz jačine ruke, unaprijed odabrani potezi i tipkovni prečaci. Kad se osjećate spremno, isti vas stol čeka na pokerth.net protiv pravih igrača.",
    "offlineH2": "Offline, na svakom uređaju",
    "offlineP": "PokerTH je web aplikacija: radi u pregledniku na iPhone, Android, Windows, macOS i Linux uređajima i može se dodati na početni zaslon kao aplikacija. Kad se jednom otvori, način treninga uopće ne treba vezu — u načinu rada u zrakoplovu, u metrou ili bilo gdje bez signala.",
    "faqH2": "Pitanja",
    "faq": [
      [
        "Mogu li besplatno igrati poker protiv računala?",
        "Da. PokerTH je besplatan softver otvorenog koda, bez oglasa i bez kupnji u aplikaciji. Žetoni su samo igrački novac."
      ],
      [
        "Trebam li račun ili vezu?",
        "Ne. Način treninga ne traži račun, a nakon što se stranica jednom otvori, radi bez veze."
      ],
      [
        "Protiv koliko računalnih protivnika mogu igrati?",
        "Do 9, za pun stol od 10 igrača, ili protiv samo jednog za igru jedan na jedan."
      ],
      [
        "Jesu li botovi dobri?",
        "To ovisi o vama: laki botovi griješe, teški botovi precizno procjenjuju svoje izglede i više blefiraju, a mješoviti stol kombinira tri razine s pet stilova igre."
      ],
      [
        "Mogu li za istim stolom igrati s prijateljima i botovima?",
        "Da. Kad postavite stol na vlastitom PokerTH poslužitelju, u LAN-u ili na internetu, čekaonica može popuniti prazna mjesta računalnim igračima."
      ]
    ]
  },
  hu: {
    "title": "Pókerezz a számítógép ellen — ingyen, offline | PokerTH",
    "desc": "Ingyenes Texas Hold’em számítógépes ellenfelek ellen, akár 9 bottal az asztalodnál, a könnyűtől a nehézig. Fiók és pénz nélkül, offline is működik telefonon és PC-n.",
    "ldHeadline": "Texas Hold’em póker a számítógép ellen, ingyen és offline",
    "ldDesc": "A PokerTH webes kliensének gyakorlómódja: Texas Hold’em számítógépes ellenfelek ellen, nehézségi szintekkel, játékstílusokkal és trófeákkal.",
    "h1": "Pókerezz a számítógép ellen, ingyen és offline",
    "lead": "A PokerTH gyakorlómódja teljes Texas Hold’em versenyeket oszt számítógépes ellenfelek ellen, közvetlenül a böngésződben. Nincs fiók, nem kell kapcsolat, miután egyszer megnyitottad az oldalt, és nincs semmi tét: itt megtanulhatod a játékot, kipróbálhatsz egy új stratégiát, vagy lejátszhatsz egy gyors partit a vonaton.",
    "stepsH2": "Indíts játékot három lépésben",
    "steps": [
      [
        "Nyisd meg a PokerTH-t, és válaszd a Helyi / gyakorlás lehetőséget",
        "Nyisd meg ezt az oldalt, és az első képernyőn válaszd a Helyi / gyakorlás lehetőséget. Nincs bejelentkezés és nincs letöltés; miután egyszer megnyitottad az oldalt, ez a mód kapcsolat nélkül is működik."
      ],
      [
        "Állítsd be az asztalt",
        "Válassz legfeljebb 9 számítógépes ellenfelet, a kezdő zsetonmennyiséget, a vakok emelkedésének ütemét és a játék sebességét, vagy indulj egy kész formátumból. Ugyanabban az ablakban választhatod ki a botok nehézségét is."
      ],
      [
        "Indítsd a játékot",
        "Nyomd meg az Indítás gombot: az üres helyeket számítógépes játékosok töltik fel, és kiosztják a lapokat. A játék addig tart, amíg egy játékosnál nincs az összes zseton."
      ]
    ],
    "levelsH2": "Négy nehézségi szint",
    "levels": [
      [
        "Könnyű",
        "Botok, amelyek rosszul ítélik meg a kezüket, és ritkán blöffölnek: ideális ellenfelek az első játékhoz."
      ],
      [
        "Normál",
        "Megbízható ellenfelek, amelyek jól felmérik az esélyeiket, és helyesen játszanak, amikor rövid lesz a zsetonmennyiségük."
      ],
      [
        "Nehéz",
        "A legerősebb botok: pontos kézolvasás, éles játék rövid zsetonmennyiséggel és több blöff."
      ],
      [
        "Vegyes",
        "Változatos asztal, ez az alapértelmezés: átlagosan minden tízből három könnyű, öt normál és két nehéz bot."
      ]
    ],
    "brainH2": "Hogyan gondolkodnak a botok",
    "brainP": "Minden bot úgy számolja ki valódi esélyét a leosztás megnyerésére, hogy sokszor kiosztja a hátralévő lapokat, a potban még bent lévő játékosok számát figyelembe véve. Korai pozícióban szorosabban játszik, késői pozícióból lop, ha flop előtt emelt, folytatólagos tétet (c-bet) tesz, erős lehívásokkal félblöfföl, és a normál szinttől felfelé All-In vagy Fold játékra vált, amikor rövid lesz a zsetonmennyisége.",
    "stylesH2": "Öt játékstílus",
    "stylesP": "A nehézség azt határozza meg, mennyire jól olvassa a bot a játékot; a stílusa azt, hogyan játszik. Minden új asztal keveri:",
    "styles": [
      [
        "Rock",
        "nagyon szoros és óvatos, kevés potba száll be, és ritkán blöfföl."
      ],
      [
        "Tight-agresszív (TAG)",
        "jó kezeket válogat, és keményen licitál velük."
      ],
      [
        "Loose-agresszív (LAG)",
        "sok kezet játszik, és nyomás alatt tart."
      ],
      [
        "Calling station",
        "túl gyakran megadja a tétet, és ritkán emel."
      ],
      [
        "Mániákus",
        "folyamatosan emel és blöfföl."
      ]
    ],
    "formatsH2": "Gyakorold a valódi formátumokat",
    "formatsP": "Kész beállításokkal Nyugodt, Normál vagy Gyors játékot indíthatsz, vagy a pokerth.net versenyeinek feltételei között gyakorolhatsz: a hivatalos Ranglista-tempóval, a We Cuppal és az időalapú vakokkal játszott BBC-vel. A saját beállításaidat saját formátumként mentheted el.",
    "trophiesH2": "Trófeák és statisztikák",
    "trophiesP": "A gyakorlómódnak saját előrehaladása van: több mint harminc trófea hat kategóriában — lejátszott leosztások, megnyert játékok, győzelmi sorozatok, győzelem kilenc nehéz bot ellen, blöffök és néhány titok. A botok elleni statisztikák külön maradnak az online játékaidtól, és ha pokerth.net-fiókkal jelentkezel be, a trófeáid a többi eszközödre is követnek.",
    "learnH2": "A legjobb hely a tanuláshoz",
    "learnP": "A webes kliens minden segítsége nyomás nélkül működik itt: az Esélyek fül a nyerési esélyeddel, ahogy jönnek a lapok, a kézerősség-kijelzés, az előre kiválasztott lépések és a billentyűparancsok. Ha késznek érzed magad, ugyanez az asztal vár a pokerth.net-en valódi játékosok ellen.",
    "offlineH2": "Offline, minden eszközön",
    "offlineP": "A PokerTH webalkalmazás: böngészőben fut iPhone-on, Androidon, Windowson, macOS-en és Linuxon, és alkalmazásként felvehető a kezdőképernyőre. Egyszeri megnyitás után a gyakorlómódnak egyáltalán nincs szüksége kapcsolatra — repülőgépes módban, a metrón vagy bárhol, ahol nincs térerő.",
    "faqH2": "Kérdések",
    "faq": [
      [
        "Ingyen pókerezhetek a számítógép ellen?",
        "Igen. A PokerTH ingyenes, nyílt forráskódú szoftver, reklámok és alkalmazáson belüli vásárlások nélkül. A zsetonok csak játékpénzt jelentenek."
      ],
      [
        "Kell fiók vagy internetkapcsolat?",
        "Nem. A gyakorlómódhoz nem kell fiók, és miután egyszer megnyitottad az oldalt, kapcsolat nélkül is működik."
      ],
      [
        "Hány számítógépes ellenfél ellen játszhatok?",
        "Legfeljebb 9 ellen, egy 10 fős teli asztalhoz, vagy egyetlen ellen, fej fej elleni játékhoz."
      ],
      [
        "Jók a botok?",
        "Ez rajtad múlik: a könnyű botok hibáznak, a nehezek pontosan felmérik az esélyeiket és többet blöffölnek, a vegyes asztal pedig a három szintet öt játékstílussal keveri."
      ],
      [
        "Játszhatok barátokkal és botokkal ugyanannál az asztalnál?",
        "Igen. Ha a saját PokerTH-szervereden nyitsz asztalt, LAN-on vagy az interneten, a várószoba számítógépes játékosokkal töltheti fel az üres helyeket."
      ]
    ]
  },
  hy: {
    "title": "Պոկեր համակարգչի դեմ — անվճար, օֆլայն | PokerTH",
    "desc": "Անվճար Texas Hold’em համակարգչի դեմ՝ մինչև 9 բոտ ձեր սեղանի շուրջ, հեշտից մինչև դժվար։ Առանց հաշվի, առանց փողի, և աշխատում է օֆլայն՝ հեռախոսում և համակարգչում։",
    "ldHeadline": "Խաղացեք Texas Hold’em պոկեր համակարգչի դեմ՝ անվճար և օֆլայն",
    "ldDesc": "PokerTH վեբ-կլիենտի մարզման ռեժիմը՝ Texas Hold’em համակարգչային մրցակիցների դեմ, բարդության մակարդակներով, խաղաոճերով և գավաթներով։",
    "h1": "Խաղացեք պոկեր համակարգչի դեմ՝ անվճար և օֆլայն",
    "lead": "PokerTH-ի մարզման ռեժիմը Texas Hold’em-ի ամբողջական մրցաշարեր է բաժանում համակարգչային մրցակիցների դեմ՝ անմիջապես ձեր դիտարկիչում։ Առանց հաշվի, առանց կապի, երբ կայքն արդեն բացվել է, և առանց որևէ խաղադրույքի. սա այն վայրն է, որտեղ կարող եք սովորել խաղը, փորձել նոր ռազմավարություն կամ գնացքում արագ մի խաղ խաղալ։",
    "stepsH2": "Սկսեք խաղը երեք քայլով",
    "steps": [
      [
        "Բացեք PokerTH-ը և ընտրեք Տեղային / մարզում",
        "Բացեք այս կայքը և առաջին էկրանին ընտրեք Տեղային / մարզում։ Մուտք գործել կամ ներբեռնել պետք չէ. երբ կայքն արդեն բացվել է, ռեժիմն աշխատում է նաև առանց կապի։"
      ],
      [
        "Կարգավորեք ձեր սեղանը",
        "Ընտրեք մինչև 9 համակարգչային մրցակից, սկզբնական սթեքը, թե որքան արագ են աճում բլայնդները և խաղի արագությունը, կամ սկսեք պատրաստի ձևաչափից։ Բոտերի բարդությունն ընտրեք նույն պատուհանում։"
      ],
      [
        "Սկսեք խաղը",
        "Սեղմեք «Սկսել». դատարկ տեղերը լրացվում են համակարգչային խաղացողներով, և խաղաթղթերը բաժանվում են։ Խաղը շարունակվում է այնքան, մինչև բոլոր ֆիշկաները հավաքվեն մեկ խաղացողի մոտ։"
      ]
    ],
    "levelsH2": "Բարդության չորս մակարդակ",
    "levels": [
      [
        "Հեշտ",
        "Բոտեր, որոնք սխալ են գնահատում իրենց ձեռքերը և հազվադեպ են բլեֆ անում՝ ճիշտ մրցակիցներ առաջին խաղի համար։"
      ],
      [
        "Սովորական",
        "Ամուր մրցակիցներ, որոնք լավ են գնահատում իրենց շանսերը և ճիշտ են խաղում, երբ սթեքը կարճանում է։"
      ],
      [
        "Դժվար",
        "Ամենաուժեղ բոտերը՝ ձեռքերի ճշգրիտ ընթերցում, կարճ սթեքով սուր խաղ և ավելի շատ բլեֆ։"
      ],
      [
        "Խառը",
        "Բազմազան սեղան, լռելյայն ընտրությունը՝ յուրաքանչյուր տասից միջինում երեք հեշտ, հինգ սովորական և երկու դժվար բոտ։"
      ]
    ],
    "brainH2": "Ինչպես են մտածում բոտերը",
    "brainP": "Յուրաքանչյուր բոտ հաշվարկում է ձեռքը հաղթելու իր իրական շանսը՝ մնացած խաղաթղթերը բազմաթիվ անգամ բաժանելով՝ ըստ բանկում դեռ մնացած խաղացողների քանակի։ Վաղ դիրքում այն ավելի զուսպ է խաղում, ուշ դիրքից գողանում է բլայնդները, ֆլոփից առաջ ռեյզից հետո անում է շարունակական խաղադրույք (continuation bet), ուժեղ դրոներով կիսաբլեֆ է անում և, սովորական մակարդակից սկսած, կարճ սթեքի դեպքում անցնում է All-In կամ Fold խաղի։",
    "stylesH2": "Խաղի հինգ ոճ",
    "stylesP": "Բարդությունը որոշում է, թե բոտը որքան լավ է կարդում խաղը, իսկ ոճը՝ թե ինչպես է խաղում։ Յուրաքանչյուր նոր սեղանում խառնված են՝",
    "styles": [
      [
        "Ռոք (Rock)",
        "շատ զուսպ և զգույշ, քիչ բանկերի է մասնակցում և հազվադեպ է բլեֆ անում։"
      ],
      [
        "TAG (թայթ-ագրեսիվ)",
        "ընտրում է լավ ձեռքեր և դրանցով ուժեղ խաղադրույքներ անում։"
      ],
      [
        "LAG (լուզ-ագրեսիվ)",
        "խաղում է շատ ձեռքեր և ճնշում է գործադրում ձեզ վրա։"
      ],
      [
        "Calling station",
        "չափազանց հաճախ է անում Call և հազվադեպ՝ Raise։"
      ],
      [
        "Մանյակ (Maniac)",
        "անընդհատ Raise և բլեֆ է անում։"
      ]
    ],
    "formatsH2": "Մարզվեք իրական ձևաչափերով",
    "formatsP": "Պատրաստի կարգավորումները թույլ են տալիս սկսել «Հանգիստ», «Սովորական» կամ «Արագ» խաղ, կամ մարզվել pokerth.net-ի մրցույթների պայմաններում՝ Ranking-ի պաշտոնական տեմպը, We Cup-ը և BBC-ն՝ ժամանակով աճող բլայնդներով։ Ձեր սեփական կարգավորումները կարող եք պահպանել որպես ձեր սեփական ձևաչափ։",
    "trophiesH2": "Գավաթներ և վիճակագրություն",
    "trophiesP": "Մարզման ռեժիմն ունի իր սեփական առաջընթացը՝ ավելի քան երեսուն գավաթ վեց կատեգորիայում՝ խաղացած ձեռքեր, հաղթած խաղեր, հաղթանակների շարքեր, հաղթանակ ինը դժվար բոտի դեմ, բլեֆներ և մի քանի գաղտնիք։ Բոտերի դեմ վիճակագրությունը պահվում է ձեր առցանց խաղերից առանձին, և երբ մուտք եք գործում pokerth.net հաշվով, ձեր գավաթները ձեզ հետ անցնում են ձեր մյուս սարքերին։",
    "learnH2": "Սովորելու լավագույն վայրը",
    "learnP": "Վեբ-կլիենտի բոլոր օգնականներն այստեղ աշխատում են առանց ճնշման՝ Հավանականություններ ներդիրը՝ հաղթելու ձեր հավանականությամբ, մինչ խաղաթղթերը բացվում են, ձեռքի ուժի ցուցիչը, նախապես ընտրված գործողությունները և ստեղնաշարի դյուրանցումները։ Երբ պատրաստ զգաք, նույն սեղանը ձեզ սպասում է pokerth.net-ում՝ իրական խաղացողների դեմ։",
    "offlineH2": "Օֆլայն՝ ցանկացած սարքում",
    "offlineP": "PokerTH-ը վեբ հավելված է՝ աշխատում է դիտարկիչում iPhone-ում, Android-ում, Windows-ում, macOS-ում և Linux-ում, և կարելի է այն ավելացնել գլխավոր էկրանին որպես հավելված։ Բացելուց հետո մարզման ռեժիմին ընդհանրապես կապ պետք չէ՝ ինքնաթիռի ռեժիմում, մետրոյում կամ ցանկացած վայրում, որտեղ ազդանշան չկա։",
    "faqH2": "Հարցեր",
    "faq": [
      [
        "Կարո՞ղ եմ անվճար պոկեր խաղալ համակարգչի դեմ։",
        "Այո։ PokerTH-ը անվճար և բաց կոդով ծրագիր է՝ առանց գովազդի և առանց ներհավելվածային գնումների։ Ֆիշկաները միայն խաղային փող են։"
      ],
      [
        "Ինձ հաշիվ կամ կապ պե՞տք է։",
        "Ոչ։ Մարզման ռեժիմին հաշիվ պետք չէ, և երբ կայքն արդեն բացվել է, այն աշխատում է առանց կապի։"
      ],
      [
        "Քանի՞ համակարգչային մրցակցի դեմ կարող եմ խաղալ։",
        "Մինչև 9-ի՝ 10 խաղացողի լիարժեք սեղանի համար, կամ միայն մեկի՝ մեկը մեկի դեմ խաղի համար։"
      ],
      [
        "Բոտերը լա՞վ են խաղում։",
        "Դա կախված է ձեզնից՝ հեշտ բոտերը սխալվում են, դժվար բոտերը ճշգրիտ են գնահատում իրենց շանսերը և ավելի հաճախ են բլեֆ անում, իսկ խառը սեղանը համադրում է երեք մակարդակները խաղի հինգ ոճերի հետ։"
      ],
      [
        "Կարո՞ղ եմ ընկերների և բոտերի հետ խաղալ նույն սեղանի շուրջ։",
        "Այո։ Երբ սեղան եք բացում ձեր սեփական PokerTH սերվերում՝ LAN-ում կամ ինտերնետում, սպասասրահը կարող է դատարկ տեղերը լրացնել համակարգչային խաղացողներով։"
      ]
    ]
  },
  id: {
    "title": "Main Poker Lawan Komputer — Gratis, Offline | PokerTH",
    "desc": "Texas Hold’em gratis melawan lawan komputer, hingga 9 bot di meja Anda, dari mudah sampai sulit. Tanpa akun, tanpa uang, dan bisa offline di ponsel maupun PC.",
    "ldHeadline": "Main poker Texas Hold’em melawan komputer, gratis dan offline",
    "ldDesc": "Mode latihan klien web PokerTH: Texas Hold’em melawan lawan komputer, dengan tingkat kesulitan, gaya bermain, dan trofi.",
    "h1": "Main poker melawan komputer, gratis dan offline",
    "lead": "Mode latihan PokerTH membagikan turnamen Texas Hold’em lengkap melawan lawan komputer, langsung di peramban Anda. Tanpa akun, tanpa koneksi setelah situs pernah dibuka, dan tanpa ada yang dipertaruhkan: tempat untuk mempelajari permainan, mencoba strategi baru, atau main sebentar di kereta.",
    "stepsH2": "Mulai permainan dalam tiga langkah",
    "steps": [
      [
        "Buka PokerTH dan pilih Lokal / latihan",
        "Buka situs ini dan pilih Lokal / latihan di layar pertama. Tidak perlu masuk akun atau mengunduh apa pun; setelah situs pernah dibuka, mode ini juga berjalan tanpa koneksi."
      ],
      [
        "Atur meja Anda",
        "Pilih hingga 9 lawan komputer, chip awal, seberapa cepat blind naik, dan kecepatan permainan, atau mulai dari format siap pakai. Pilih tingkat kesulitan bot di jendela yang sama."
      ],
      [
        "Mulai permainan",
        "Tekan Mulai: kursi kosong terisi pemain komputer dan kartu dibagikan. Permainan berlangsung sampai satu pemain memegang semua chip."
      ]
    ],
    "levelsH2": "Empat tingkat kesulitan",
    "levels": [
      [
        "Mudah",
        "Bot yang salah menilai kartunya dan jarang menggertak: lawan yang pas untuk permainan pertama."
      ],
      [
        "Normal",
        "Lawan yang solid, membaca peluangnya dengan baik dan bermain dengan benar saat chip-nya menipis."
      ],
      [
        "Sulit",
        "Bot terkuat: membaca tangan dengan tepat, tajam saat chip tipis, dan lebih sering menggertak."
      ],
      [
        "Campuran",
        "Meja yang beragam, pilihan bawaan: rata-rata tiga bot mudah, lima normal, dan dua sulit dari setiap sepuluh."
      ]
    ],
    "brainH2": "Cara bot berpikir",
    "brainP": "Setiap bot menghitung peluang nyatanya untuk memenangkan tangan itu dengan membagikan sisa kartu berkali-kali, melawan jumlah pemain yang masih ada di pot. Bot bermain lebih ketat di posisi awal dan mencuri dari posisi akhir, melakukan continuation bet setelah Raise sebelum flop, melakukan semi-bluff dengan peluang yang kuat, dan mulai level normal ke atas beralih ke permainan all-in atau Fold saat chip-nya menipis.",
    "stylesH2": "Lima gaya bermain",
    "stylesP": "Tingkat kesulitan menentukan seberapa baik bot membaca permainan; gayanya menentukan cara ia bermain. Setiap meja baru mencampur:",
    "styles": [
      [
        "Rock",
        "sangat ketat dan hati-hati, jarang ikut pot dan jarang menggertak."
      ],
      [
        "Tight-agresif (TAG)",
        "memilih tangan yang bagus lalu bertaruh besar dengannya."
      ],
      [
        "Loose-agresif (LAG)",
        "memainkan banyak tangan dan terus menekan Anda."
      ],
      [
        "Calling station",
        "terlalu sering Call dan jarang Raise."
      ],
      [
        "Maniac",
        "terus-menerus Raise dan menggertak."
      ]
    ],
    "formatsH2": "Latih format sungguhan",
    "formatsP": "Pengaturan siap pakai memungkinkan Anda memulai permainan Santai, Normal, atau Cepat, atau berlatih dengan kondisi kompetisi pokerth.net: tempo resmi Ranking, We Cup, dan BBC dengan blind berbasis waktunya. Pengaturan Anda sendiri bisa disimpan sebagai format milik Anda.",
    "trophiesH2": "Trofi dan statistik",
    "trophiesP": "Mode latihan punya progresnya sendiri: lebih dari tiga puluh trofi dalam enam kategori — tangan yang dimainkan, permainan yang dimenangkan, rentetan kemenangan, kemenangan melawan sembilan bot sulit, gertakan, dan beberapa rahasia. Statistik melawan bot disimpan terpisah dari permainan online Anda, dan saat Anda masuk dengan akun pokerth.net, trofi Anda ikut ke perangkat Anda yang lain.",
    "learnH2": "Tempat terbaik untuk belajar",
    "learnP": "Semua alat bantu klien web berjalan di sini tanpa tekanan: tab Peluang dengan peluang menang Anda seiring kartu dibuka, tampilan kekuatan tangan, aksi yang bisa dipilih lebih dulu, dan pintasan keyboard. Saat Anda merasa siap, meja yang sama menunggu Anda di pokerth.net melawan pemain sungguhan.",
    "offlineH2": "Offline, di semua perangkat",
    "offlineP": "PokerTH adalah aplikasi web: berjalan di peramban pada iPhone, Android, Windows, macOS, dan Linux, dan bisa ditambahkan ke layar utama seperti aplikasi. Setelah pernah dibuka, mode latihan sama sekali tidak butuh koneksi — dalam mode pesawat, di kereta bawah tanah, atau di mana pun tanpa sinyal.",
    "faqH2": "Pertanyaan",
    "faq": [
      [
        "Bisakah saya main poker melawan komputer secara gratis?",
        "Ya. PokerTH adalah perangkat lunak gratis dan sumber terbuka, tanpa iklan dan tanpa pembelian dalam aplikasi. Chip hanya uang mainan."
      ],
      [
        "Apakah saya perlu akun atau koneksi?",
        "Tidak. Mode latihan tidak memerlukan akun, dan setelah situs pernah dibuka, mode ini berjalan tanpa koneksi."
      ],
      [
        "Berapa banyak lawan komputer yang bisa saya hadapi?",
        "Hingga 9, untuk meja penuh berisi 10 pemain, atau satu saja untuk bermain satu lawan satu."
      ],
      [
        "Apakah bot-nya bagus?",
        "Terserah Anda: bot mudah membuat kesalahan, bot sulit membaca peluangnya dengan tepat dan lebih sering menggertak, dan meja campuran memadukan ketiga tingkat dengan lima gaya bermain."
      ],
      [
        "Bisakah saya bermain dengan teman dan bot di meja yang sama?",
        "Ya. Saat Anda menjadi host meja di server PokerTH Anda sendiri, di LAN atau di internet, ruang tunggu bisa mengisi kursi kosong dengan pemain komputer."
      ]
    ]
  },
  is: {
    "title": "Póker gegn tölvunni — ókeypis, án nettengingar | PokerTH",
    "desc": "Ókeypis Texas Hold’em gegn tölvunni, allt að 9 bottar við borðið, frá auðveldum til erfiðra. Enginn aðgangur, engir peningar og virkar án nets í síma og tölvu.",
    "ldHeadline": "Spilaðu Texas Hold’em póker gegn tölvunni, ókeypis og án nettengingar",
    "ldDesc": "Æfingahamur PokerTH vefbiðlarans: Texas Hold’em gegn tölvustýrðum andstæðingum, með erfiðleikastigum, leikstílum og verðlaunum.",
    "h1": "Spilaðu póker gegn tölvunni, ókeypis og án nettengingar",
    "lead": "Æfingahamur PokerTH gefur heil Texas Hold’em mót gegn tölvustýrðum andstæðingum, beint í vafranum þínum. Enginn aðgangur, engin tenging eftir að síðan hefur verið opnuð og ekkert í húfi: staðurinn til að læra leikinn, prófa nýja leikaðferð eða taka snöggan leik í lestinni.",
    "stepsH2": "Byrjaðu leik í þremur skrefum",
    "steps": [
      [
        "Opnaðu PokerTH og veldu Staðbundið / æfing",
        "Opnaðu þessa síðu og veldu Staðbundið / æfing á fyrsta skjánum. Engin innskráning og ekkert niðurhal; eftir að síðan hefur verið opnuð virkar hamurinn líka án tengingar."
      ],
      [
        "Settu upp borðið þitt",
        "Veldu allt að 9 tölvustýrða andstæðinga, upphafsstaflann, hve hratt blindarnir hækka og leikhraðann, eða byrjaðu á tilbúnu sniði. Veldu erfiðleikastig bottanna í sama glugga."
      ],
      [
        "Byrjaðu leikinn",
        "Ýttu á Byrja: auðu sætin fyllast af tölvuspilurum og spilin eru gefin. Leikurinn heldur áfram þar til einn leikmaður á alla spilapeningana."
      ]
    ],
    "levelsH2": "Fjögur erfiðleikastig",
    "levels": [
      [
        "Auðvelt",
        "Bottar sem meta hendur sínar rangt og blekkja sjaldan: réttu andstæðingarnir í fyrsta leik."
      ],
      [
        "Venjulegt",
        "Traustir andstæðingar sem lesa líkur sínar vel og spila rétt þegar staflinn styttist."
      ],
      [
        "Erfitt",
        "Sterkustu bottarnir: nákvæmur handalestur, beitt spil með stuttan stafla og fleiri blekkingar."
      ],
      [
        "Blandað",
        "Fjölbreytt borð, sjálfgefið: að meðaltali þrír auðveldir bottar, fimm venjulegir og tveir erfiðir af hverjum tíu."
      ]
    ],
    "brainH2": "Hvernig bottarnir hugsa",
    "brainP": "Hver botti reiknar út raunverulegar líkur sínar á að vinna höndina með því að gefa spilin sem eftir eru mörgum sinnum, miðað við fjölda leikmanna sem enn eru í pottinum. Hann spilar þéttar í fremri stöðu og stelur úr seinni stöðu, gerir continuation bet eftir að hafa hækkað fyrir flop, hálfblekkir með sterkum dráttum og, frá venjulega stiginu og upp úr, skiptir yfir í All-In eða Fold þegar staflinn styttist.",
    "stylesH2": "Fimm leikstílar",
    "stylesP": "Erfiðleikastigið ræður hve vel botti les leikinn; stíllinn ræður hvernig hann spilar. Hvert nýtt borð blandar saman:",
    "styles": [
      [
        "Rock",
        "mjög þéttur og varkár, fer í fáa potta og blekkir sjaldan."
      ],
      [
        "Tight-aggressive",
        "velur góðar hendur og veðjar fast á þær."
      ],
      [
        "Loose-aggressive",
        "spilar margar hendur og setur pressu á þig."
      ],
      [
        "Calling station",
        "jafnar allt of oft og hækkar sjaldan."
      ],
      [
        "Maniac",
        "hækkar og blekkir í sífellu."
      ]
    ],
    "formatsH2": "Æfðu raunverulegu sniðin",
    "formatsP": "Tilbúnar stillingar leyfa þér að byrja leik í sniðinu Rólegt, Venjulegt eða Hratt, eða æfa við aðstæður keppnanna á pokerth.net: opinbera hraðann í Stigaleikur, We Cup og BBC með tímastýrðum blindum. Eigin stillingar má vista sem þitt eigið snið.",
    "trophiesH2": "Verðlaun og tölfræði",
    "trophiesP": "Æfingahamurinn hefur sína eigin framvindu: yfir þrjátíu verðlaun í sex flokkum — spilaðar hendur, unnir leikir, sigurhrinur, sigur gegn níu erfiðum bottum, blekkingar og nokkur leyndarmál. Tölfræði gegn bottunum er haldið aðskildri frá netleikjunum þínum, og þegar þú skráir þig inn með pokerth.net aðgangi fylgja verðlaunin þér í önnur tæki.",
    "learnH2": "Besti staðurinn til að læra",
    "learnP": "Öll hjálpartæki vefbiðlarans virka hér án pressu: flipinn Líkur með vinningslíkum þínum eftir því sem spilin koma, vísir um styrk handar, forvaldar aðgerðir og flýtilyklar. Þegar þú treystir þér til bíður sama borðið þín á pokerth.net, gegn alvöru leikmönnum.",
    "offlineH2": "Án nettengingar, á öllum tækjum",
    "offlineP": "PokerTH er vefforrit: það keyrir í vafranum á iPhone, Android, Windows, macOS og Linux og hægt er að bæta því á heimaskjáinn eins og forriti. Þegar búið er að opna það þarf æfingahamurinn enga tengingu — í flugstillingu, í neðanjarðarlest eða hvar sem ekkert samband er.",
    "faqH2": "Spurningar",
    "faq": [
      [
        "Get ég spilað póker gegn tölvunni ókeypis?",
        "Já. PokerTH er ókeypis hugbúnaður með opnum frumkóða, án auglýsinga og án kaupa í forriti. Spilapeningarnir eru eingöngu leikfé."
      ],
      [
        "Þarf ég aðgang eða nettengingu?",
        "Nei. Æfingahamurinn þarf engan aðgang og eftir að síðan hefur verið opnuð virkar hann án tengingar."
      ],
      [
        "Gegn hve mörgum tölvustýrðum andstæðingum get ég spilað?",
        "Allt að 9, fyrir fullt borð með 10 leikmönnum, eða aðeins einum fyrir heads-up."
      ],
      [
        "Eru bottarnir góðir?",
        "Það er undir þér komið: auðveldir bottar gera mistök, erfiðir bottar lesa líkur sínar nákvæmlega og blekkja meira, og blandaða borðið blandar stigunum þremur saman við fimm leikstíla."
      ],
      [
        "Get ég spilað með vinum og bottum við sama borð?",
        "Já. Þegar þú hýsir borð á eigin PokerTH þjóni, á staðarneti eða á netinu, getur biðsalurinn fyllt auðu sætin með tölvuspilurum."
      ]
    ]
  },
  it: {
    "title": "Gioca a poker contro il computer — gratis, offline | PokerTH",
    "desc": "Texas Hold’em gratis contro avversari virtuali, fino a 9 bot al tuo tavolo, da facili a difficili. Niente account, niente soldi, e funziona offline su telefono e PC.",
    "ldHeadline": "Gioca a poker Texas Hold’em contro il computer, gratis e offline",
    "ldDesc": "La modalità allenamento del client web di PokerTH: Texas Hold’em contro avversari gestiti dal computer, con livelli di difficoltà, stili di gioco e trofei.",
    "h1": "Gioca a poker contro il computer, gratis e offline",
    "lead": "La modalità allenamento di PokerTH distribuisce tornei completi di Texas Hold’em contro avversari gestiti dal computer, direttamente nel tuo browser. Niente account, nessuna connessione una volta aperto il sito, e niente in palio: il posto giusto per imparare il gioco, provare una nuova strategia o fare una partita veloce in treno.",
    "stepsH2": "Inizia una partita in tre passi",
    "steps": [
      [
        "Apri PokerTH e scegli Locale / allenamento",
        "Apri questo sito e scegli Locale / allenamento nella prima schermata. Nessun login e nessun download; una volta aperto il sito, la modalità funziona anche senza connessione."
      ],
      [
        "Prepara il tuo tavolo",
        "Scegli fino a 9 avversari gestiti dal computer, lo stack iniziale, la velocità con cui salgono i bui e la velocità di gioco, oppure parti da un formato già pronto. Nella stessa finestra scegli la difficoltà dei bot."
      ],
      [
        "Avvia la partita",
        "Premi Inizia: i posti vuoti si riempiono di giocatori gestiti dal computer e le carte vengono distribuite. La partita continua finché un solo giocatore ha tutte le fiche."
      ]
    ],
    "levelsH2": "Quattro livelli di difficoltà",
    "levels": [
      [
        "Facile",
        "Bot che valutano male le proprie mani e bluffano di rado: gli avversari giusti per una prima partita."
      ],
      [
        "Normale",
        "Avversari solidi che valutano bene le proprie probabilità e giocano correttamente quando il loro stack si accorcia."
      ],
      [
        "Difficile",
        "I bot più forti: lettura precisa delle mani, gioco affilato a stack corto e più bluff."
      ],
      [
        "Mista",
        "Un tavolo vario, l’impostazione predefinita: in media tre bot facili, cinque normali e due difficili ogni dieci."
      ]
    ],
    "brainH2": "Come ragionano i bot",
    "brainP": "Ogni bot calcola la sua reale probabilità di vincere la mano distribuendo molte volte le carte rimanenti, contro il numero di giocatori ancora nel piatto. Gioca più stretto in prima posizione e ruba dalle ultime posizioni, fa continuation bet dopo aver rilanciato prima del flop, semi-bluffa con i progetti forti e, dal livello normale in su, passa a un gioco all-in o fold quando il suo stack si accorcia.",
    "stylesH2": "Cinque stili di gioco",
    "stylesP": "La difficoltà stabilisce quanto bene un bot legge il gioco; lo stile stabilisce come gioca. Ogni nuovo tavolo mescola:",
    "styles": [
      [
        "Rock",
        "molto stretto e prudente, entra in pochi piatti e bluffa di rado."
      ],
      [
        "Tight-aggressivo",
        "sceglie buone mani e le punta con decisione."
      ],
      [
        "Loose-aggressivo",
        "gioca molte mani e ti mette sotto pressione."
      ],
      [
        "Calling station",
        "vede troppo spesso e rilancia di rado."
      ],
      [
        "Maniac",
        "rilancia e bluffa in continuazione."
      ]
    ],
    "formatsH2": "Allenati sui formati veri",
    "formatsP": "Le impostazioni già pronte ti permettono di avviare una partita in formato Rilassato, Normale o Veloce, oppure di allenarti nelle condizioni delle competizioni di pokerth.net: il ritmo ufficiale Ranking, la We Cup e la BBC con i suoi bui a tempo. Le tue impostazioni possono essere salvate come un formato tutto tuo.",
    "trophiesH2": "Trofei e statistiche",
    "trophiesP": "La modalità allenamento ha una sua progressione: più di trenta trofei in sei categorie — mani giocate, partite vinte, serie di vittorie, una vittoria contro nove bot difficili, bluff e qualche segreto. Le statistiche contro i bot sono tenute separate dalle tue partite online e, quando accedi con un account pokerth.net, i tuoi trofei ti seguono sugli altri dispositivi.",
    "learnH2": "Il posto migliore per imparare",
    "learnP": "Ogni aiuto del client web funziona qui senza pressione: la scheda Probabilità con la tua probabilità di vincere man mano che escono le carte, l’indicatore della forza della mano, le azioni preselezionate e le scorciatoie da tastiera. Quando ti senti pronto, lo stesso tavolo ti aspetta su pokerth.net contro giocatori veri.",
    "offlineH2": "Offline, su ogni dispositivo",
    "offlineP": "PokerTH è un’app web: gira nel browser su iPhone, Android, Windows, macOS e Linux e si può aggiungere alla schermata Home come un’app. Una volta aperta, la modalità allenamento non ha bisogno di alcuna connessione — in modalità aereo, in metropolitana o ovunque non ci sia segnale.",
    "faqH2": "Domande",
    "faq": [
      [
        "Posso giocare a poker contro il computer gratis?",
        "Sì. PokerTH è software libero e open source, senza pubblicità né acquisti in-app. Le fiche sono solo denaro finto."
      ],
      [
        "Mi servono un account o una connessione?",
        "No. La modalità allenamento non richiede alcun account e, una volta aperto il sito, funziona senza connessione."
      ],
      [
        "Contro quanti avversari gestiti dal computer posso giocare?",
        "Fino a 9, per un tavolo completo di 10 giocatori, oppure uno solo per il testa a testa."
      ],
      [
        "I bot sono bravi?",
        "Dipende da te: i bot facili commettono errori, quelli difficili valutano con precisione le proprie probabilità e bluffano di più, e il tavolo misto combina i tre livelli con cinque stili di gioco."
      ],
      [
        "Posso giocare con amici e bot allo stesso tavolo?",
        "Sì. Quando ospiti un tavolo sul tuo server PokerTH, in LAN o su internet, la sala d’attesa può riempire i posti vuoti con giocatori gestiti dal computer."
      ]
    ]
  },
  ja: {
    "title": "コンピューター（CPU）対戦ポーカー — 無料・オフライン | PokerTH",
    "desc": "コンピューター相手に無料で Texas Hold’em。テーブルに最大9体のボット、やさしいからむずかしいまで。アカウントもお金も不要で、スマホでもPCでもオフラインで遊べます。",
    "ldHeadline": "コンピューターと Texas Hold’em ポーカー対戦、無料・オフライン",
    "ldDesc": "PokerTH ウェブ版クライアントの練習モード：コンピューター相手の Texas Hold’em。難易度、プレイスタイル、トロフィー付き。",
    "h1": "無料・オフラインでコンピューターとポーカー対戦",
    "lead": "PokerTH の練習モードでは、コンピューター相手の本格的な Texas Hold’em トーナメントがブラウザの中でそのまま配られます。アカウントは不要、一度サイトを開けば接続も不要で、何も賭けません。ゲームを覚えたり、新しい戦略を試したり、電車の中でさっと1ゲーム遊んだりするのにぴったりの場所です。",
    "stepsH2": "3ステップでゲーム開始",
    "steps": [
      [
        "PokerTH を開いて「ローカル / 練習」を選択",
        "このサイトを開き、最初の画面で「ローカル / 練習」を選びます。ログインもダウンロードも不要です。一度サイトを開けば、このモードは接続がなくても動作します。"
      ],
      [
        "テーブルを設定",
        "最大9人のコンピューター対戦相手、開始スタック、ブラインドの上がる速さ、ゲームの速さを選ぶか、用意されたフォーマットから始めます。ボットの難易度も同じウィンドウで選べます。"
      ],
      [
        "ゲームを開始",
        "「開始」を押すと、空いた席がコンピュータープレイヤーで埋まり、カードが配られます。ゲームは1人のプレイヤーがすべてのチップを手にするまで続きます。"
      ]
    ],
    "levelsH2": "4つの難易度",
    "levels": [
      [
        "やさしい",
        "自分のハンドを見誤り、めったにブラフしないボット。最初のゲームにちょうどいい相手です。"
      ],
      [
        "ふつう",
        "勝つ確率をよく読み、スタックが少なくなっても正しくプレイする手堅い相手です。"
      ],
      [
        "むずかしい",
        "最強のボット。正確なハンドリーディング、鋭いショートスタックのプレイ、そしてより多くのブラフ。"
      ],
      [
        "ミックス",
        "変化に富んだテーブルで、これが初期設定です。10体のうち平均して、やさしいが3体、ふつうが5体、むずかしいが2体です。"
      ]
    ],
    "brainH2": "ボットの考え方",
    "brainP": "各ボットは、残りのカードを何度も配ってみることで、まだポットに残っているプレイヤーの人数を相手に、そのハンドに勝つ本当の確率を割り出します。アーリーポジションではよりタイトにプレイし、レイトポジションからはスチールを仕掛け、プリフロップでレイズした後はコンティニュエーションベットを打ち、強いドローではセミブラフをし、ふつう以上のレベルでは、スタックが少なくなるとオールインかフォールドかのプレイに切り替えます。",
    "stylesH2": "5つのプレイスタイル",
    "stylesP": "難易度はボットがゲームをどれだけうまく読むかを、スタイルはどうプレイするかを決めます。新しいテーブルにはそれぞれ次のスタイルが混ざります。",
    "styles": [
      [
        "ロック",
        "非常にタイトで慎重。参加するポットは少なく、めったにブラフしません。"
      ],
      [
        "タイトアグレッシブ",
        "良いハンドを選び、強気にベットします。"
      ],
      [
        "ルースアグレッシブ",
        "多くのハンドをプレイし、あなたにプレッシャーをかけます。"
      ],
      [
        "コーリングステーション",
        "あまりにも頻繁にコールし、めったにレイズしません。"
      ],
      [
        "マニアック",
        "絶えずレイズとブラフを繰り返します。"
      ]
    ],
    "formatsH2": "本番のフォーマットで練習",
    "formatsP": "用意された設定で「ゆったり」「通常」「高速」のゲームを始めたり、pokerth.net の大会と同じ条件で練習したりできます。公式「ランキング」のペース、We Cup、そして時間制ブラインドの BBC です。自分の設定は独自のフォーマットとして保存できます。",
    "trophiesH2": "トロフィーと統計",
    "trophiesP": "練習モードには独自の成長要素があります。6つのカテゴリーに30以上のトロフィー——プレイしたハンド数、勝ったゲーム、連勝、むずかしいボット9体への勝利、ブラフ、そしていくつかのシークレット。ボット戦の統計はオンラインゲームとは別に記録され、pokerth.net アカウントでログインすれば、トロフィーは他のデバイスにも引き継がれます。",
    "learnH2": "練習に最適な場所",
    "learnP": "ウェブ版クライアントのあらゆるサポート機能が、ここではプレッシャーなしで使えます。カードが開かれるたびに勝つ確率を表示する「勝率」タブ、ハンドの強さ表示、アクションの事前選択、キーボードショートカット。準備ができたと感じたら、同じテーブルが pokerth.net で本物のプレイヤーとともにあなたを待っています。",
    "offlineH2": "オフラインで、どのデバイスでも",
    "offlineP": "PokerTH はウェブアプリです。iPhone、Android、Windows、macOS、Linux のブラウザで動作し、アプリのようにホーム画面に追加できます。一度開けば、練習モードは接続をまったく必要としません——機内モードでも、地下鉄でも、電波の届かないどこでも。",
    "faqH2": "質問",
    "faq": [
      [
        "コンピューター相手に無料でポーカーできますか？",
        "はい。PokerTH は広告もアプリ内課金もない、無料のオープンソースソフトウェアです。チップは遊び用のみです。"
      ],
      [
        "アカウントや接続は必要ですか？",
        "いいえ。練習モードにアカウントは不要で、一度サイトを開けば接続なしで動作します。"
      ],
      [
        "コンピューターの対戦相手は何人まで選べますか？",
        "最大9人で、10人のフルテーブルになります。1人だけを相手にヘッズアップもできます。"
      ],
      [
        "ボットは強いですか？",
        "それはあなた次第です。やさしいボットはミスをし、むずかしいボットは勝つ確率を正確に読んでより多くブラフします。ミックスのテーブルは3つのレベルと5つのプレイスタイルを組み合わせます。"
      ],
      [
        "友達とボットが同じテーブルで遊べますか？",
        "はい。自分の PokerTH サーバーでテーブルを開けば、LAN でもインターネットでも、待機室が空いた席をコンピュータープレイヤーで埋めてくれます。"
      ]
    ]
  },
  ka: {
    "title": "პოკერი კომპიუტერთან — უფასოდ, ოფლაინ | PokerTH",
    "desc": "უფასო Texas Hold’em კომპიუტერულ მეტოქეებთან, მაგიდაზე 9 ბოტამდე, მარტივიდან რთულამდე. ანგარიშისა და ფულის გარეშე, მუშაობს ოფლაინ ტელეფონსა და კომპიუტერზე.",
    "ldHeadline": "ითამაშეთ Texas Hold’em პოკერი კომპიუტერთან, უფასოდ და ოფლაინ",
    "ldDesc": "PokerTH-ის ვებკლიენტის სავარჯიშო რეჟიმი: Texas Hold’em კომპიუტერულ მეტოქეებთან, სირთულის დონეებით, თამაშის სტილებითა და ტროფეებით.",
    "h1": "ითამაშეთ პოკერი კომპიუტერთან, უფასოდ და ოფლაინ",
    "lead": "PokerTH-ის სავარჯიშო რეჟიმი სრულ Texas Hold’em ტურნირებს ათამაშებს კომპიუტერულ მეტოქეებთან, პირდაპირ თქვენს ბრაუზერში. არც ანგარიში, არც კავშირი მას შემდეგ, რაც საიტი ერთხელ გაიხსნება, და არაფერია ფსონზე: ადგილი, სადაც ისწავლით თამაშს, გამოცდით ახალ სტრატეგიას ან ითამაშებთ სწრაფ პარტიას მატარებელში.",
    "stepsH2": "დაიწყეთ თამაში სამ ნაბიჯად",
    "steps": [
      [
        "გახსენით PokerTH და აირჩიეთ ლოკალური / სავარჯიშო",
        "გახსენით ეს საიტი და პირველ ეკრანზე აირჩიეთ ლოკალური / სავარჯიშო. არც შესვლაა საჭირო, არც ჩამოტვირთვა; მას შემდეგ, რაც საიტი ერთხელ გაიხსნება, რეჟიმი კავშირის გარეშეც მუშაობს."
      ],
      [
        "მოამზადეთ მაგიდა",
        "აირჩიეთ 9-მდე კომპიუტერული მეტოქე, საწყისი სტეკი, რამდენად სწრაფად იზრდება ბლაინდები და თამაშის სიჩქარე, ან დაიწყეთ მზა ფორმატიდან. ბოტების სირთულეს იმავე ფანჯარაში აირჩევთ."
      ],
      [
        "დაიწყეთ თამაში",
        "დააჭირეთ ღილაკს დაწყება: ცარიელ ადგილებს კომპიუტერული მოთამაშეები იკავებენ და კარტები ირიგება. თამაში გრძელდება, სანამ ყველა ჩიპი ერთ მოთამაშეს არ ექნება."
      ]
    ],
    "levelsH2": "სირთულის ოთხი დონე",
    "levels": [
      [
        "მარტივი",
        "ბოტები, რომლებიც არასწორად აფასებენ თავიანთ ხელებს და იშვიათად ბლეფავენ: სწორი მეტოქეები პირველი თამაშისთვის."
      ],
      [
        "ნორმალური",
        "მყარი მეტოქეები, რომლებიც კარგად აფასებენ თავიანთ შანსებს და სწორად თამაშობენ, როცა სტეკი უმოკლდებათ."
      ],
      [
        "რთული",
        "ყველაზე ძლიერი ბოტები: ხელების ზუსტი წაკითხვა, მკვეთრი თამაში მოკლე სტეკით და მეტი ბლეფი."
      ],
      [
        "შერეული",
        "მრავალფეროვანი მაგიდა, ნაგულისხმევად: საშუალოდ ყოველ ათში სამი მარტივი ბოტი, ხუთი ნორმალური და ორი რთული."
      ]
    ],
    "brainH2": "როგორ ფიქრობენ ბოტები",
    "brainP": "თითოეული ბოტი ხელის მოგების რეალურ შანსს ითვლის დარჩენილი კარტების მრავალჯერ დარიგებით, ბანკში ჯერ კიდევ დარჩენილი მოთამაშეების რაოდენობის გათვალისწინებით. ადრეული პოზიციიდან უფრო მჭიდროდ თამაშობს და გვიანი პოზიციიდან იპარავს, ფლოპამდე Raise-ის შემდეგ აკეთებს კონტინიუეიშენ-ბეთს, ძლიერ დროუებზე ნახევრად ბლეფავს და, ნორმალური დონიდან მოყოლებული, როცა სტეკი უმოკლდება, გადადის all-in-ან-fold თამაშზე.",
    "stylesH2": "თამაშის ხუთი სტილი",
    "stylesP": "სირთულე განსაზღვრავს, რამდენად კარგად კითხულობს ბოტი თამაშს; სტილი კი — როგორ თამაშობს. ყოველ ახალ მაგიდაზე შერეულია:",
    "styles": [
      [
        "როკი (Rock)",
        "ძალიან მჭიდრო და ფრთხილი, ცოტა ბანკში ერთვება და იშვიათად ბლეფავს."
      ],
      [
        "ტაიტ-აგრესიული (TAG)",
        "არჩევს კარგ ხელებს და მათზე ძლიერად დებს ფსონს."
      ],
      [
        "ლუზ-აგრესიული (LAG)",
        "ბევრ ხელს თამაშობს და ზეწოლას გიწევთ."
      ],
      [
        "კოლინგ-სტეიშენი (Calling station)",
        "ზედმეტად ხშირად აკეთებს Call-ს და იშვიათად Raise-ს."
      ],
      [
        "მანიაკი (Maniac)",
        "გამუდმებით აკეთებს Raise-ს და ბლეფავს."
      ]
    ],
    "formatsH2": "ივარჯიშეთ ნამდვილ ფორმატებში",
    "formatsP": "მზა პარამეტრებით შეგიძლიათ დაიწყოთ თამაში ფორმატით მშვიდი, ნორმალური ან სწრაფი, ან ივარჯიშოთ pokerth.net-ის შეჯიბრებების პირობებში: ოფიციალური Ranking ტემპი, We Cup და BBC დროის მიხედვით მზარდი ბლაინდებით. საკუთარი პარამეტრები შეგიძლიათ შეინახოთ საკუთარ ფორმატად.",
    "trophiesH2": "ტროფეები და სტატისტიკა",
    "trophiesP": "სავარჯიშო რეჟიმს საკუთარი პროგრესი აქვს: ოცდაათზე მეტი ტროფეი ექვს კატეგორიაში — ნათამაშები ხელები, მოგებული თამაშები, მოგებების სერიები, გამარჯვება ცხრა რთული ბოტის წინააღმდეგ, ბლეფები და რამდენიმე საიდუმლო. ბოტებთან სტატისტიკა თქვენი ონლაინ თამაშებისგან ცალკე ინახება, და როცა pokerth.net-ის ანგარიშით შედიხართ, ტროფეები თქვენს სხვა მოწყობილობებზეც გამოგყვებათ.",
    "learnH2": "სწავლის საუკეთესო ადგილი",
    "learnP": "ვებკლიენტის ყველა დამხმარე საშუალება აქ ზეწოლის გარეშე მუშაობს: ჩანართი ალბათობები, რომელიც კარტების გახსნისას მოგების შანსს გიჩვენებთ, ხელის სიძლიერის მაჩვენებელი, წინასწარ არჩეული მოქმედებები და კლავიატურის მალსახმობები. როცა მზად იგრძნობთ თავს, იგივე მაგიდა pokerth.net-ზე ნამდვილ მოთამაშეებთან გელოდებათ.",
    "offlineH2": "ოფლაინ, ყველა მოწყობილობაზე",
    "offlineP": "PokerTH ვებაპლიკაციაა: ის ბრაუზერში მუშაობს iPhone-ზე, Android-ზე, Windows-ზე, macOS-სა და Linux-ზე, და მისი დამატება შეიძლება მთავარ ეკრანზე, როგორც აპლიკაციისა. ერთხელ გახსნის შემდეგ სავარჯიშო რეჟიმს საერთოდ არ სჭირდება კავშირი — ფრენის რეჟიმში, მეტროში ან ნებისმიერ ადგილას სიგნალის გარეშე.",
    "faqH2": "კითხვები",
    "faq": [
      [
        "შემიძლია კომპიუტერთან პოკერის თამაში უფასოდ?",
        "დიახ. PokerTH უფასო და ღია კოდის პროგრამაა, რეკლამისა და აპლიკაციაში შესყიდვების გარეშე. ჩიპები მხოლოდ სათამაშო ფულია."
      ],
      [
        "მჭირდება ანგარიში ან კავშირი?",
        "არა. სავარჯიშო რეჟიმს ანგარიში არ სჭირდება, და მას შემდეგ, რაც საიტი ერთხელ გაიხსნება, კავშირის გარეშე მუშაობს."
      ],
      [
        "რამდენ კომპიუტერულ მეტოქესთან შემიძლია თამაში?",
        "9-მდე, სრული მაგიდისთვის 10 მოთამაშით, ან მხოლოდ ერთთან ჰედს-აპისთვის."
      ],
      [
        "რამდენად კარგები არიან ბოტები?",
        "ეს თქვენზეა: მარტივი ბოტები შეცდომებს უშვებენ, რთულები ზუსტად აფასებენ შანსებს და მეტს ბლეფავენ, შერეული მაგიდა კი სამ დონეს თამაშის ხუთ სტილთან აერთიანებს."
      ],
      [
        "შემიძლია მეგობრებთან და ბოტებთან ერთად ერთ მაგიდაზე თამაში?",
        "დიახ. როცა მაგიდას მასპინძლობთ საკუთარ PokerTH სერვერზე, LAN-ში ან ინტერნეტში, მოსაცდელ ოთახს შეუძლია ცარიელი ადგილები კომპიუტერული მოთამაშეებით შეავსოს."
      ]
    ]
  },
  kk: {
    "title": "Компьютерге қарсы покер — тегін, офлайн | PokerTH",
    "desc": "Компьютерге қарсы тегін Texas Hold’em: үстеліңізде 9 ботқа дейін, оңайдан қиынға дейін. Тіркелгісіз, ақшасыз, телефон мен ДК-де офлайн жұмыс істейді.",
    "ldHeadline": "Компьютерге қарсы Texas Hold’em покерін тегін және офлайн ойнаңыз",
    "ldDesc": "PokerTH веб-клиентінің жаттығу режимі: компьютер қарсыластарына қарсы Texas Hold’em, қиындық деңгейлері, ойын стильдері және трофейлер.",
    "h1": "Компьютерге қарсы покер ойнаңыз — тегін және офлайн",
    "lead": "PokerTH жаттығу режимі компьютер қарсыластарына қарсы толыққанды Texas Hold’em турнирлерін тікелей браузеріңізде таратады. Тіркелгі жоқ, сайт бір рет ашылған соң қосылым қажет емес, ештеңе тәуекелге тігілмейді: ойынды үйренуге, жаңа стратегияны сынауға немесе пойызда жылдам ойнап алуға арналған орын.",
    "stepsH2": "Ойынды үш қадамда бастаңыз",
    "steps": [
      [
        "PokerTH-ті ашып, «Жергілікті / жаттығу» режимін таңдаңыз",
        "Бұл сайтты ашып, бірінші экранда «Жергілікті / жаттығу» режимін таңдаңыз. Кіру де, жүктеу де қажет емес; сайт бір рет ашылғаннан кейін бұл режим қосылымсыз да жұмыс істейді."
      ],
      [
        "Үстеліңізді баптаңыз",
        "9-ға дейін компьютер қарсыласын, бастапқы стекті, блайндтардың қаншалықты жылдам көтерілетінін және ойын жылдамдығын таңдаңыз немесе дайын форматтан бастаңыз. Боттардың қиындығы сол терезеде таңдалады."
      ],
      [
        "Ойынды бастаңыз",
        "«Бастау» түймесін басыңыз: бос орындар компьютер ойыншыларымен толады да, карталар таратылады. Ойын бір ойыншы барлық фишканы жинағанша жалғасады."
      ]
    ],
    "levelsH2": "Төрт қиындық деңгейі",
    "levels": [
      [
        "Оңай",
        "Қолын қате бағалайтын және сирек блефтейтін боттар: алғашқы ойынға лайық қарсыластар."
      ],
      [
        "Қалыпты",
        "Мүмкіндіктерін жақсы бағалайтын және стегі қысқарғанда дұрыс ойнайтын мықты қарсыластар."
      ],
      [
        "Қиын",
        "Ең күшті боттар: қолды дәл оқу, қысқа стекпен шебер ойын және көбірек блеф."
      ],
      [
        "Аралас",
        "Әртүрлі үстел, әдепкі баптау: орташа есеппен әр онның үшеуі оңай, бесеуі қалыпты және екеуі қиын бот."
      ]
    ],
    "brainH2": "Боттар қалай ойлайды",
    "brainP": "Әр бот қалған карталарды көп рет таратып, банкте әлі қалған ойыншылар санын ескере отырып, қолды ұтудың нақты мүмкіндігін есептейді. Ерте позицияда тайтырақ ойнайды, кеш позициядан ұрлайды, флопқа дейін Raise жасағаннан кейін continuation bet жасайды, күшті дролармен жартылай блеф жасайды және қалыпты деңгейден бастап стегі қысқарғанда all-in немесе fold ойынына көшеді.",
    "stylesH2": "Бес ойын стилі",
    "stylesP": "Қиындық боттың ойынды қаншалықты жақсы оқитынын анықтайды; стилі оның қалай ойнайтынын анықтайды. Әр жаңа үстел мыналарды араластырады:",
    "styles": [
      [
        "Рок",
        "өте тайт әрі сақ, аз банкке кіреді және сирек блефтейді."
      ],
      [
        "Тайт-агрессивті",
        "жақсы қолдарды таңдап, оларға батыл ставка жасайды."
      ],
      [
        "Луз-агрессивті",
        "көп қол ойнап, сізге қысым жасайды."
      ],
      [
        "Колл-станция",
        "тым жиі Call жасайды да, сирек Raise жасайды."
      ],
      [
        "Маньяк",
        "үнемі Raise жасап, блефтейді."
      ]
    ],
    "formatsH2": "Нақты форматтарда жаттығыңыз",
    "formatsP": "Дайын баптаулар «Жайбарақат», «Қалыпты» немесе «Жылдам» ойынды бастауға не pokerth.net жарыстарының жағдайында жаттығуға мүмкіндік береді: ресми «Рейтинг» қарқыны, We Cup және блайндтары уақыт бойынша көтерілетін BBC. Өз баптауларыңызды жеке формат ретінде сақтай аласыз.",
    "trophiesH2": "Трофейлер мен статистика",
    "trophiesP": "Жаттығу режимінің өз прогресі бар: алты санаттағы отыздан астам трофей — ойналған қолдар, жеңген ойындар, жеңістер сериясы, тоғыз қиын ботты жеңу, блефтер және бірнеше құпия. Боттарға қарсы статистика онлайн ойындарыңыздан бөлек сақталады, ал pokerth.net тіркелгісімен кірсеңіз, трофейлеріңіз басқа құрылғыларыңызға да ілесіп барады.",
    "learnH2": "Үйренуге ең жақсы орын",
    "learnP": "Веб-клиенттің барлық көмекшісі мұнда қысымсыз жұмыс істейді: карталар ашылған сайын ұту мүмкіндігіңізді көрсететін «Ықтималдық» қойындысы, қол күшінің көрсеткіші, алдын ала таңдалған әрекеттер және пернелер тіркесімдері. Дайынмын деп сезінгенде, дәл сол үстел pokerth.net-те нақты ойыншыларға қарсы сізді күтіп тұр.",
    "offlineH2": "Офлайн, кез келген құрылғыда",
    "offlineP": "PokerTH — веб-қолданба: ол iPhone, Android, Windows, macOS және Linux жүйелерінде браузерде жұмыс істейді және басты экранға қолданба сияқты қосыла алады. Бір рет ашылғаннан кейін жаттығу режиміне қосылым мүлде қажет емес — ұшақ режимінде, метрода немесе сигнал жоқ кез келген жерде.",
    "faqH2": "Сұрақтар",
    "faq": [
      [
        "Компьютерге қарсы покерді тегін ойнауға бола ма?",
        "Иә. PokerTH — жарнамасыз және қолданба ішіндегі сатып алуларсыз тегін, ашық бастапқы кодты бағдарлама. Фишкалар тек ойын ақшасы."
      ],
      [
        "Тіркелгі немесе қосылым керек пе?",
        "Жоқ. Жаттығу режиміне тіркелгі қажет емес, ал сайт бір рет ашылғаннан кейін ол қосылымсыз жұмыс істейді."
      ],
      [
        "Қанша компьютер қарсыласына қарсы ойнай аламын?",
        "9-ға дейін — 10 ойыншылық толық үстел үшін, немесе хедз-ап үшін біреуіне ғана."
      ],
      [
        "Боттар мықты ма?",
        "Бұл өзіңізге байланысты: оңай боттар қателеседі, қиын боттар мүмкіндіктерін дәл бағалап, жиірек блефтейді, ал аралас үстел үш деңгейді бес ойын стилімен біріктіреді."
      ],
      [
        "Достармен және боттармен бір үстелде ойнай аламын ба?",
        "Иә. Өз PokerTH серверіңізде, LAN желісінде немесе интернетте үстел ашқанда, күту бөлмесі бос орындарды компьютер ойыншыларымен толтыра алады."
      ]
    ]
  },
  km: {
    "title": "លេងបៀជាមួយកុំព្យូទ័រ — ឥតគិតថ្លៃ ក្រៅបណ្ដាញ | PokerTH",
    "desc": "Texas Hold’em ឥតគិតថ្លៃ ទល់នឹងគូប្រកួតកុំព្យូទ័រ រហូតដល់ 9 បូតនៅតុរបស់អ្នក ពីងាយដល់ពិបាក។ គ្មានគណនី គ្មានលុយ ហើយលេងក្រៅបណ្ដាញបានលើទូរស័ព្ទ និងកុំព្យូទ័រ។",
    "ldHeadline": "លេងបៀ Texas Hold’em ជាមួយកុំព្យូទ័រ ឥតគិតថ្លៃ និងក្រៅបណ្ដាញ",
    "ldDesc": "របៀបហ្វឹកហាត់នៃកម្មវិធីវេប PokerTH៖ Texas Hold’em ទល់នឹងគូប្រកួតកុំព្យូទ័រ មានកម្រិតលំបាក រចនាប័ទ្មលេង និងពានរង្វាន់។",
    "h1": "លេងបៀជាមួយកុំព្យូទ័រ ឥតគិតថ្លៃ និងក្រៅបណ្ដាញ",
    "lead": "របៀបហ្វឹកហាត់របស់ PokerTH ចែកការប្រកួត Texas Hold’em ពេញលេញ ទល់នឹងគូប្រកួតកុំព្យូទ័រ ដោយផ្ទាល់ក្នុងកម្មវិធីរុករករបស់អ្នក។ គ្មានគណនី មិនត្រូវការការតភ្ជាប់ទេ បន្ទាប់ពីបើកគេហទំព័រម្ដងរួច ហើយគ្មានអ្វីត្រូវប្រថុយ៖ ជាកន្លែងសម្រាប់រៀនលេង សាកល្បងយុទ្ធសាស្ត្រថ្មី ឬលេងមួយហ្គេមរហ័សលើរថភ្លើង។",
    "stepsH2": "ចាប់ផ្ដើមហ្គេមក្នុងបីជំហាន",
    "steps": [
      [
        "បើក PokerTH ហើយជ្រើសរបៀប ក្នុងម៉ាស៊ីន / ហ្វឹកហាត់",
        "បើកគេហទំព័រនេះ ហើយជ្រើស “ក្នុងម៉ាស៊ីន / ហ្វឹកហាត់” នៅអេក្រង់ទីមួយ។ មិនចាំបាច់ចូលគណនី ឬទាញយកអ្វីទេ បន្ទាប់ពីបើកគេហទំព័រម្ដងរួច របៀបនេះក៏ដំណើរការដោយគ្មានការតភ្ជាប់ដែរ។"
      ],
      [
        "រៀបចំតុរបស់អ្នក",
        "ជ្រើសគូប្រកួតកុំព្យូទ័ររហូតដល់ 9 នាក់ ស្តាក់ចាប់ផ្ដើម ល្បឿនកើនឡើង blind និងល្បឿនហ្គេម ឬចាប់ផ្ដើមពីទម្រង់ដែលរៀបចំរួច។ ជ្រើសកម្រិតលំបាករបស់បូតនៅក្នុងបង្អួចតែមួយនោះ។"
      ],
      [
        "ចាប់ផ្ដើមហ្គេម",
        "ចុច “ចាប់ផ្ដើម”៖ កៅអីទំនេរត្រូវបានបំពេញដោយអ្នកលេងកុំព្យូទ័រ ហើយបៀត្រូវបានចែក។ ហ្គេមបន្តរហូតដល់អ្នកលេងម្នាក់កាន់ស៊ីបទាំងអស់។"
      ]
    ],
    "levelsH2": "កម្រិតលំបាកបួន",
    "levels": [
      [
        "ងាយ",
        "បូតដែលវាយតម្លៃដៃរបស់ខ្លួនខុស ហើយកម្រ bluff៖ គូប្រកួតត្រឹមត្រូវសម្រាប់ហ្គេមដំបូង។"
      ],
      [
        "ធម្មតា",
        "គូប្រកួតរឹងមាំ ដែលអានឱកាសរបស់ខ្លួនបានល្អ ហើយលេងត្រឹមត្រូវនៅពេលស្តាក់របស់ខ្លួនខ្លី។"
      ],
      [
        "ពិបាក",
        "បូតខ្លាំងបំផុត៖ អានដៃបានច្បាស់លាស់ លេងស្តាក់ខ្លីយ៉ាងមុតស្រួច និង bluff ច្រើនជាង។"
      ],
      [
        "ចម្រុះ",
        "តុចម្រុះ ជាការកំណត់លំនាំដើម៖ ជាមធ្យម ក្នុងដប់ មានបូតងាយបី ធម្មតាប្រាំ និងពិបាកពីរ។"
      ]
    ],
    "brainH2": "របៀបដែលបូតគិត",
    "brainP": "បូតនីមួយៗគណនាឱកាសពិតប្រាកដរបស់ខ្លួនក្នុងការឈ្នះដៃ ដោយចែកបៀដែលនៅសល់ម្ដងហើយម្ដងទៀត ទល់នឹងចំនួនអ្នកលេងដែលនៅក្នុង pot។ វាលេងតឹងជាងនៅទីតាំងដំបូង ហើយលួច (steal) ពីទីតាំងចុងក្រោយ ភ្នាល់បន្ត (c-bet) បន្ទាប់ពី Raise មុន flop ធ្វើ semi-bluff ជាមួយ draw ខ្លាំង ហើយចាប់ពីកម្រិតធម្មតាឡើងទៅ វាប្ដូរទៅលេងតែ All-In ឬ Fold នៅពេលស្តាក់របស់វាខ្លី។",
    "stylesH2": "រចនាប័ទ្មលេងប្រាំ",
    "stylesP": "កម្រិតលំបាកកំណត់ថាបូតអានហ្គេមបានល្អប៉ុណ្ណា រចនាប័ទ្មរបស់វាកំណត់ថាវាលេងដូចម្ដេច។ តុថ្មីនីមួយៗលាយបញ្ចូលគ្នា៖",
    "styles": [
      [
        "Rock",
        "តឹងណាស់ និងប្រុងប្រយ័ត្ន ចូល pot តិច ហើយកម្រ bluff។"
      ],
      [
        "Tight-aggressive (TAG)",
        "ជ្រើសដៃល្អ ហើយភ្នាល់វាយ៉ាងខ្លាំង។"
      ],
      [
        "Loose-aggressive (LAG)",
        "លេងដៃច្រើន ហើយដាក់សម្ពាធលើអ្នក។"
      ],
      [
        "Calling station",
        "Call ញឹកញាប់ពេក ហើយកម្រ Raise។"
      ],
      [
        "Maniac",
        "Raise និង bluff ជាប់ជានិច្ច។"
      ]
    ],
    "formatsH2": "ហ្វឹកហាត់ទម្រង់ពិតប្រាកដ",
    "formatsP": "ការកំណត់ដែលរៀបចំរួចអនុញ្ញាតឱ្យអ្នកចាប់ផ្ដើមហ្គេម “ស្ងប់ស្ងាត់” “ធម្មតា” ឬ “លឿន” ឬហ្វឹកហាត់ក្នុងលក្ខខណ្ឌនៃការប្រកួតរបស់ pokerth.net៖ ល្បឿនផ្លូវការ “ចំណាត់ថ្នាក់” We Cup និង BBC ជាមួយ blind តាមពេលវេលា។ ការកំណត់ផ្ទាល់ខ្លួនរបស់អ្នកអាចរក្សាទុកជាទម្រង់ផ្ទាល់ខ្លួនបាន។",
    "trophiesH2": "ពានរង្វាន់ និងស្ថិតិ",
    "trophiesP": "របៀបហ្វឹកហាត់មានការរីកចម្រើនផ្ទាល់ខ្លួន៖ ពានរង្វាន់ជាងសាមសិប ក្នុងប្រាំមួយប្រភេទ — ដៃដែលបានលេង ហ្គេមដែលបានឈ្នះ ការឈ្នះជាប់ៗគ្នា ជ័យជម្នះលើបូតពិបាកប្រាំបួន ការ bluff និងអាថ៌កំបាំងមួយចំនួន។ ស្ថិតិទល់នឹងបូតត្រូវបានរក្សាទុកដាច់ដោយឡែកពីហ្គេមអនឡាញរបស់អ្នក ហើយនៅពេលអ្នកចូលដោយគណនី pokerth.net ពានរង្វាន់របស់អ្នកនឹងតាមអ្នកទៅឧបករណ៍ផ្សេងទៀតរបស់អ្នក។",
    "learnH2": "កន្លែងល្អបំផុតដើម្បីរៀន",
    "learnP": "ជំនួយទាំងអស់របស់កម្មវិធីវេបដំណើរការនៅទីនេះដោយគ្មានសម្ពាធ៖ ផ្ទាំង “ឱកាស” ជាមួយឱកាសឈ្នះរបស់អ្នក នៅពេលបៀចេញ ការបង្ហាញកម្លាំងដៃ សកម្មភាពដែលបានជ្រើសទុកមុន និងផ្លូវកាត់ក្ដារចុច។ នៅពេលអ្នកមានអារម្មណ៍ថាត្រៀមខ្លួនរួច តុដដែលនេះកំពុងរង់ចាំអ្នកនៅលើ pokerth.net ទល់នឹងអ្នកលេងពិតៗ។",
    "offlineH2": "ក្រៅបណ្ដាញ លើគ្រប់ឧបករណ៍",
    "offlineP": "PokerTH ជាកម្មវិធីវេប៖ វាដំណើរការក្នុងកម្មវិធីរុករកលើ iPhone, Android, Windows, macOS និង Linux ហើយអាចបន្ថែមទៅអេក្រង់ដើមដូចកម្មវិធីមួយ។ បន្ទាប់ពីបើកម្ដងរួច របៀបហ្វឹកហាត់មិនត្រូវការការតភ្ជាប់អ្វីទាំងអស់ — ក្នុងរបៀបយន្តហោះ ក្នុងរថភ្លើងក្រោមដី ឬកន្លែងណាដែលគ្មានសញ្ញា។",
    "faqH2": "សំណួរ",
    "faq": [
      [
        "តើខ្ញុំអាចលេងបៀជាមួយកុំព្យូទ័រដោយឥតគិតថ្លៃបានទេ?",
        "បាន។ PokerTH ជាកម្មវិធីឥតគិតថ្លៃ និងកូដចំហ គ្មានការផ្សាយពាណិជ្ជកម្ម និងគ្មានការទិញក្នុងកម្មវិធី។ ស៊ីបគ្រាន់តែជាលុយហ្គេមប៉ុណ្ណោះ។"
      ],
      [
        "តើខ្ញុំត្រូវការគណនី ឬការតភ្ជាប់ទេ?",
        "ទេ។ របៀបហ្វឹកហាត់មិនត្រូវការគណនីទេ ហើយបន្ទាប់ពីបើកគេហទំព័រម្ដងរួច វាដំណើរការដោយគ្មានការតភ្ជាប់។"
      ],
      [
        "តើខ្ញុំអាចលេងទល់នឹងគូប្រកួតកុំព្យូទ័របានប៉ុន្មាននាក់?",
        "រហូតដល់ 9 នាក់ សម្រាប់តុពេញ 10 នាក់ ឬតែម្នាក់សម្រាប់ heads-up។"
      ],
      [
        "តើបូតពូកែទេ?",
        "អាស្រ័យលើអ្នក៖ បូតងាយធ្វើកំហុស បូតពិបាកអានឱកាសរបស់ខ្លួនបានច្បាស់លាស់ ហើយ bluff ច្រើនជាង ហើយតុចម្រុះលាយកម្រិតទាំងបីជាមួយរចនាប័ទ្មលេងប្រាំ។"
      ],
      [
        "តើខ្ញុំអាចលេងជាមួយមិត្តភក្តិ និងបូតនៅតុតែមួយបានទេ?",
        "បាន។ នៅពេលអ្នកបើកតុលើម៉ាស៊ីនមេ PokerTH ផ្ទាល់ខ្លួនរបស់អ្នក លើ LAN ឬលើអ៊ីនធឺណិត បន្ទប់រង់ចាំអាចបំពេញកៅអីទំនេរដោយអ្នកលេងកុំព្យូទ័រ។"
      ]
    ]
  },
  kn: {
    "title": "ಕಂಪ್ಯೂಟರ್ ವಿರುದ್ಧ ಪೋಕರ್ ಆಡಿ — ಉಚಿತ, ಆಫ್‌ಲೈನ್ | PokerTH",
    "desc": "ಕಂಪ್ಯೂಟರ್ ವಿರುದ್ಧ ಉಚಿತ Texas Hold’em: ನಿಮ್ಮ ಟೇಬಲ್‌ನಲ್ಲಿ 9 ಬಾಟ್‌ಗಳವರೆಗೆ, ಸುಲಭದಿಂದ ಕಠಿಣದವರೆಗೆ. ಖಾತೆ ಬೇಡ, ಹಣ ಬೇಡ, ಫೋನ್ ಮತ್ತು PC ಯಲ್ಲಿ ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ.",
    "ldHeadline": "ಕಂಪ್ಯೂಟರ್ ವಿರುದ್ಧ Texas Hold’em ಪೋಕರ್ ಆಡಿ, ಉಚಿತ ಮತ್ತು ಆಫ್‌ಲೈನ್",
    "ldDesc": "PokerTH ವೆಬ್ ಕ್ಲೈಂಟ್‌ನ ಅಭ್ಯಾಸ ಮೋಡ್: ಕಷ್ಟದ ಹಂತಗಳು, ಆಟದ ಶೈಲಿಗಳು ಮತ್ತು ಟ್ರೋಫಿಗಳೊಂದಿಗೆ ಕಂಪ್ಯೂಟರ್ ಎದುರಾಳಿಗಳ ವಿರುದ್ಧ Texas Hold’em.",
    "h1": "ಕಂಪ್ಯೂಟರ್ ವಿರುದ್ಧ ಪೋಕರ್ ಆಡಿ, ಉಚಿತ ಮತ್ತು ಆಫ್‌ಲೈನ್",
    "lead": "PokerTH ನ ಅಭ್ಯಾಸ ಮೋಡ್ ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಕಂಪ್ಯೂಟರ್ ಎದುರಾಳಿಗಳ ವಿರುದ್ಧ ಸಂಪೂರ್ಣ Texas Hold’em ಟೂರ್ನಮೆಂಟ್‌ಗಳನ್ನು ಹಂಚುತ್ತದೆ. ಖಾತೆ ಬೇಡ, ಸೈಟ್ ಒಮ್ಮೆ ತೆರೆದ ಮೇಲೆ ಸಂಪರ್ಕ ಬೇಡ, ಮತ್ತು ಪಣಕ್ಕೆ ಏನೂ ಇಲ್ಲ: ಆಟವನ್ನು ಕಲಿಯಲು, ಹೊಸ ತಂತ್ರವನ್ನು ಪ್ರಯತ್ನಿಸಲು ಅಥವಾ ರೈಲಿನಲ್ಲಿ ಒಂದು ತ್ವರಿತ ಆಟ ಆಡಲು ಇದೇ ಸರಿಯಾದ ಜಾಗ.",
    "stepsH2": "ಮೂರು ಹಂತಗಳಲ್ಲಿ ಆಟ ಪ್ರಾರಂಭಿಸಿ",
    "steps": [
      [
        "PokerTH ತೆರೆದು ಲೋಕಲ್ / ಅಭ್ಯಾಸ ಆರಿಸಿ",
        "ಈ ಸೈಟ್ ತೆರೆದು ಮೊದಲ ಪರದೆಯಲ್ಲಿ ಲೋಕಲ್ / ಅಭ್ಯಾಸ ಆರಿಸಿ. ಲಾಗಿನ್ ಇಲ್ಲ, ಡೌನ್‌ಲೋಡ್ ಇಲ್ಲ; ಸೈಟ್ ಒಮ್ಮೆ ತೆರೆದ ಮೇಲೆ ಈ ಮೋಡ್ ಸಂಪರ್ಕವಿಲ್ಲದೆಯೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ."
      ],
      [
        "ನಿಮ್ಮ ಟೇಬಲ್ ಸಿದ್ಧಪಡಿಸಿ",
        "9 ರವರೆಗೆ ಕಂಪ್ಯೂಟರ್ ಎದುರಾಳಿಗಳು, ಆರಂಭಿಕ ಸ್ಟ್ಯಾಕ್, ಬ್ಲೈಂಡ್‌ಗಳು ಎಷ್ಟು ವೇಗವಾಗಿ ಹೆಚ್ಚುತ್ತವೆ ಮತ್ತು ಆಟದ ವೇಗವನ್ನು ಆರಿಸಿ, ಅಥವಾ ಸಿದ್ಧ ಫಾರ್ಮ್ಯಾಟ್‌ನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಬಾಟ್‌ಗಳ ಕಷ್ಟದ ಮಟ್ಟವನ್ನು ಅದೇ ವಿಂಡೋದಲ್ಲಿ ಆರಿಸಿ."
      ],
      [
        "ಆಟ ಪ್ರಾರಂಭಿಸಿ",
        "“ಪ್ರಾರಂಭಿಸಿ” ಒತ್ತಿ: ಖಾಲಿ ಸೀಟ್‌ಗಳು ಕಂಪ್ಯೂಟರ್ ಆಟಗಾರರಿಂದ ತುಂಬುತ್ತವೆ ಮತ್ತು ಕಾರ್ಡ್‌ಗಳನ್ನು ಹಂಚಲಾಗುತ್ತದೆ. ಒಬ್ಬ ಆಟಗಾರನ ಬಳಿ ಎಲ್ಲ ಚಿಪ್‌ಗಳು ಸೇರುವವರೆಗೆ ಆಟ ಮುಂದುವರಿಯುತ್ತದೆ."
      ]
    ],
    "levelsH2": "ನಾಲ್ಕು ಕಷ್ಟದ ಹಂತಗಳು",
    "levels": [
      [
        "ಸುಲಭ",
        "ತಮ್ಮ ಹ್ಯಾಂಡ್‌ಗಳನ್ನು ತಪ್ಪಾಗಿ ಅಂದಾಜಿಸುವ ಮತ್ತು ಅಪರೂಪಕ್ಕೆ ಬ್ಲಫ್ ಮಾಡುವ ಬಾಟ್‌ಗಳು: ಮೊದಲ ಆಟಕ್ಕೆ ಸರಿಯಾದ ಎದುರಾಳಿಗಳು."
      ],
      [
        "ಸಾಮಾನ್ಯ",
        "ತಮ್ಮ ಸಾಧ್ಯತೆಗಳನ್ನು ಚೆನ್ನಾಗಿ ಓದುವ ಮತ್ತು ಸ್ಟ್ಯಾಕ್ ಚಿಕ್ಕದಾದಾಗ ಸರಿಯಾಗಿ ಆಡುವ ಗಟ್ಟಿ ಎದುರಾಳಿಗಳು."
      ],
      [
        "ಕಠಿಣ",
        "ಅತ್ಯಂತ ಬಲಿಷ್ಠ ಬಾಟ್‌ಗಳು: ನಿಖರವಾದ ಹ್ಯಾಂಡ್ ಓದುವಿಕೆ, ಶಾರ್ಟ್ ಸ್ಟ್ಯಾಕ್‌ನೊಂದಿಗೆ ಚುರುಕಾದ ಆಟ ಮತ್ತು ಹೆಚ್ಚು ಬ್ಲಫ್‌ಗಳು."
      ],
      [
        "ಮಿಶ್ರ",
        "ವೈವಿಧ್ಯಮಯ ಟೇಬಲ್, ಡೀಫಾಲ್ಟ್ ಆಯ್ಕೆ: ಪ್ರತಿ ಹತ್ತರಲ್ಲಿ ಸರಾಸರಿ ಮೂರು ಸುಲಭ ಬಾಟ್‌ಗಳು, ಐದು ಸಾಮಾನ್ಯ ಮತ್ತು ಎರಡು ಕಠಿಣ."
      ]
    ],
    "brainH2": "ಬಾಟ್‌ಗಳು ಹೇಗೆ ಯೋಚಿಸುತ್ತವೆ",
    "brainP": "ಪ್ರತಿ ಬಾಟ್, ಪಾಟ್‌ನಲ್ಲಿ ಇನ್ನೂ ಉಳಿದಿರುವ ಆಟಗಾರರ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಗಣಿಸಿ, ಉಳಿದ ಕಾರ್ಡ್‌ಗಳನ್ನು ಅನೇಕ ಬಾರಿ ಹಂಚಿ ನೋಡುವ ಮೂಲಕ ಹ್ಯಾಂಡ್ ಗೆಲ್ಲುವ ತನ್ನ ನಿಜವಾದ ಸಾಧ್ಯತೆಯನ್ನು ಲೆಕ್ಕ ಹಾಕುತ್ತದೆ. ಅದು ಆರಂಭಿಕ ಪೊಸಿಷನ್‌ನಲ್ಲಿ ಹೆಚ್ಚು ಬಿಗಿಯಾಗಿ ಆಡುತ್ತದೆ ಮತ್ತು ಕೊನೆಯ ಪೊಸಿಷನ್‌ನಿಂದ ಸ್ಟೀಲ್ ಮಾಡುತ್ತದೆ, ಫ್ಲಾಪ್‌ಗೆ ಮುನ್ನ ರೇಸ್ ಮಾಡಿದ ನಂತರ ಕಂಟಿನ್ಯುಯೇಷನ್ ಬೆಟ್ ಮಾಡುತ್ತದೆ, ಬಲವಾದ ಡ್ರಾಗಳೊಂದಿಗೆ ಸೆಮಿ-ಬ್ಲಫ್ ಮಾಡುತ್ತದೆ ಮತ್ತು, ಸಾಮಾನ್ಯ ಹಂತದಿಂದ ಮೇಲೆ, ಸ್ಟ್ಯಾಕ್ ಚಿಕ್ಕದಾದಾಗ All-In ಅಥವಾ Fold ಆಟಕ್ಕೆ ಬದಲಾಗುತ್ತದೆ.",
    "stylesH2": "ಐದು ಆಟದ ಶೈಲಿಗಳು",
    "stylesP": "ಬಾಟ್ ಆಟವನ್ನು ಎಷ್ಟು ಚೆನ್ನಾಗಿ ಓದುತ್ತದೆ ಎಂಬುದನ್ನು ಕಷ್ಟದ ಮಟ್ಟ ನಿರ್ಧರಿಸುತ್ತದೆ; ಅದು ಹೇಗೆ ಆಡುತ್ತದೆ ಎಂಬುದನ್ನು ಅದರ ಶೈಲಿ ನಿರ್ಧರಿಸುತ್ತದೆ. ಪ್ರತಿ ಹೊಸ ಟೇಬಲ್‌ನಲ್ಲಿ ಇವು ಬೆರೆತಿರುತ್ತವೆ:",
    "styles": [
      [
        "ರಾಕ್ (Rock)",
        "ತುಂಬಾ ಬಿಗಿ ಮತ್ತು ಎಚ್ಚರಿಕೆಯ ಆಟ, ಕೆಲವೇ ಪಾಟ್‌ಗಳಿಗೆ ಪ್ರವೇಶಿಸುತ್ತದೆ ಮತ್ತು ಅಪರೂಪಕ್ಕೆ ಬ್ಲಫ್ ಮಾಡುತ್ತದೆ."
      ],
      [
        "TAG (ಟೈಟ್-ಅಗ್ರೆಸಿವ್)",
        "ಒಳ್ಳೆಯ ಹ್ಯಾಂಡ್‌ಗಳನ್ನು ಆರಿಸಿ ಅವುಗಳ ಮೇಲೆ ಜೋರಾಗಿ ಬೆಟ್ ಮಾಡುತ್ತದೆ."
      ],
      [
        "LAG (ಲೂಸ್-ಅಗ್ರೆಸಿವ್)",
        "ಅನೇಕ ಹ್ಯಾಂಡ್‌ಗಳನ್ನು ಆಡುತ್ತದೆ ಮತ್ತು ನಿಮ್ಮ ಮೇಲೆ ಒತ್ತಡ ಹೇರುತ್ತದೆ."
      ],
      [
        "ಕಾಲಿಂಗ್ ಸ್ಟೇಷನ್",
        "ತುಂಬಾ ಹೆಚ್ಚಾಗಿ Call ಮಾಡುತ್ತದೆ ಮತ್ತು ಅಪರೂಪಕ್ಕೆ Raise ಮಾಡುತ್ತದೆ."
      ],
      [
        "ಮ್ಯಾನಿಯಾಕ್ (Maniac)",
        "ನಿರಂತರವಾಗಿ Raise ಮತ್ತು ಬ್ಲಫ್ ಮಾಡುತ್ತದೆ."
      ]
    ],
    "formatsH2": "ನಿಜವಾದ ಫಾರ್ಮ್ಯಾಟ್‌ಗಳಲ್ಲಿ ಅಭ್ಯಾಸ ಮಾಡಿ",
    "formatsP": "ಸಿದ್ಧ ಸೆಟ್ಟಿಂಗ್‌ಗಳ ಮೂಲಕ “ಶಾಂತ”, “ಸಾಮಾನ್ಯ” ಅಥವಾ “ವೇಗ” ಆಟವನ್ನು ಪ್ರಾರಂಭಿಸಬಹುದು, ಅಥವಾ pokerth.net ಸ್ಪರ್ಧೆಗಳ ಪರಿಸ್ಥಿತಿಗಳಲ್ಲಿ ಅಭ್ಯಾಸ ಮಾಡಬಹುದು: ಅಧಿಕೃತ “ರ‍್ಯಾಂಕಿಂಗ್” ವೇಗ, We Cup ಮತ್ತು ಸಮಯ ಆಧಾರಿತ ಬ್ಲೈಂಡ್‌ಗಳಿರುವ BBC. ನಿಮ್ಮದೇ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ನಿಮ್ಮ ಸ್ವಂತ ಫಾರ್ಮ್ಯಾಟ್ ಆಗಿ ಉಳಿಸಬಹುದು.",
    "trophiesH2": "ಟ್ರೋಫಿಗಳು ಮತ್ತು ಅಂಕಿಅಂಶಗಳು",
    "trophiesP": "ಅಭ್ಯಾಸ ಮೋಡ್‌ಗೆ ತನ್ನದೇ ಆದ ಪ್ರಗತಿ ಇದೆ: ಆರು ವಿಭಾಗಗಳಲ್ಲಿ ಮೂವತ್ತಕ್ಕೂ ಹೆಚ್ಚು ಟ್ರೋಫಿಗಳು — ಆಡಿದ ಹ್ಯಾಂಡ್‌ಗಳು, ಗೆದ್ದ ಆಟಗಳು, ಸತತ ಗೆಲುವುಗಳು, ಒಂಬತ್ತು ಕಠಿಣ ಬಾಟ್‌ಗಳ ವಿರುದ್ಧ ಒಂದು ಗೆಲುವು, ಬ್ಲಫ್‌ಗಳು ಮತ್ತು ಕೆಲವು ರಹಸ್ಯಗಳು. ಬಾಟ್‌ಗಳ ವಿರುದ್ಧದ ಅಂಕಿಅಂಶಗಳನ್ನು ನಿಮ್ಮ ಆನ್‌ಲೈನ್ ಆಟಗಳಿಂದ ಪ್ರತ್ಯೇಕವಾಗಿ ಇಡಲಾಗುತ್ತದೆ, ಮತ್ತು pokerth.net ಖಾತೆಯೊಂದಿಗೆ ಲಾಗಿನ್ ಮಾಡಿದಾಗ ನಿಮ್ಮ ಟ್ರೋಫಿಗಳು ನಿಮ್ಮ ಇತರ ಸಾಧನಗಳಿಗೂ ನಿಮ್ಮೊಂದಿಗೆ ಬರುತ್ತವೆ.",
    "learnH2": "ಕಲಿಯಲು ಅತ್ಯುತ್ತಮ ಸ್ಥಳ",
    "learnP": "ವೆಬ್ ಕ್ಲೈಂಟ್‌ನ ಪ್ರತಿಯೊಂದು ಸಹಾಯಕ ಸಾಧನವೂ ಇಲ್ಲಿ ಯಾವುದೇ ಒತ್ತಡವಿಲ್ಲದೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ: ಕಾರ್ಡ್‌ಗಳು ಬರುತ್ತಿದ್ದಂತೆ ನಿಮ್ಮ ಗೆಲುವಿನ ಸಾಧ್ಯತೆಯನ್ನು ತೋರಿಸುವ “ಆಡ್ಸ್” ಟ್ಯಾಬ್, ಹ್ಯಾಂಡ್ ಬಲದ ಸೂಚಕ, ಮುಂಚಿತವಾಗಿ ಆಯ್ದ ಕ್ರಿಯೆಗಳು ಮತ್ತು ಕೀಬೋರ್ಡ್ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳು. ನೀವು ಸಿದ್ಧರೆನಿಸಿದಾಗ, ಅದೇ ಟೇಬಲ್ pokerth.net ನಲ್ಲಿ ನಿಜವಾದ ಆಟಗಾರರ ವಿರುದ್ಧ ನಿಮಗಾಗಿ ಕಾಯುತ್ತಿದೆ.",
    "offlineH2": "ಆಫ್‌ಲೈನ್, ಪ್ರತಿಯೊಂದು ಸಾಧನದಲ್ಲೂ",
    "offlineP": "PokerTH ಒಂದು ವೆಬ್ ಆ್ಯಪ್: ಇದು iPhone, Android, Windows, macOS ಮತ್ತು Linux ನಲ್ಲಿ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಚಲಿಸುತ್ತದೆ, ಮತ್ತು ಆ್ಯಪ್‌ನಂತೆ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಬಹುದು. ಒಮ್ಮೆ ತೆರೆದ ಮೇಲೆ, ಅಭ್ಯಾಸ ಮೋಡ್‌ಗೆ ಯಾವುದೇ ಸಂಪರ್ಕ ಬೇಕಾಗಿಲ್ಲ — ಏರ್‌ಪ್ಲೇನ್ ಮೋಡ್‌ನಲ್ಲಿ, ಮೆಟ್ರೋದಲ್ಲಿ ಅಥವಾ ಸಿಗ್ನಲ್ ಇಲ್ಲದ ಯಾವುದೇ ಸ್ಥಳದಲ್ಲಿ.",
    "faqH2": "ಪ್ರಶ್ನೆಗಳು",
    "faq": [
      [
        "ಕಂಪ್ಯೂಟರ್ ವಿರುದ್ಧ ಉಚಿತವಾಗಿ ಪೋಕರ್ ಆಡಬಹುದೇ?",
        "ಹೌದು. PokerTH ಉಚಿತ ಮತ್ತು ಓಪನ್-ಸೋರ್ಸ್ ಸಾಫ್ಟ್‌ವೇರ್; ಜಾಹೀರಾತುಗಳಿಲ್ಲ, ಆ್ಯಪ್‌ನೊಳಗಿನ ಖರೀದಿಗಳಿಲ್ಲ. ಚಿಪ್‌ಗಳು ಕೇವಲ ಆಟದ ಹಣ."
      ],
      [
        "ನನಗೆ ಖಾತೆ ಅಥವಾ ಸಂಪರ್ಕ ಬೇಕೇ?",
        "ಇಲ್ಲ. ಅಭ್ಯಾಸ ಮೋಡ್‌ಗೆ ಖಾತೆ ಬೇಕಾಗಿಲ್ಲ, ಮತ್ತು ಸೈಟ್ ಒಮ್ಮೆ ತೆರೆದ ಮೇಲೆ ಅದು ಸಂಪರ್ಕವಿಲ್ಲದೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ."
      ],
      [
        "ಎಷ್ಟು ಕಂಪ್ಯೂಟರ್ ಎದುರಾಳಿಗಳ ವಿರುದ್ಧ ಆಡಬಹುದು?",
        "10 ಆಟಗಾರರ ಪೂರ್ಣ ಟೇಬಲ್‌ಗಾಗಿ 9 ರವರೆಗೆ, ಅಥವಾ ಹೆಡ್ಸ್-ಅಪ್‌ಗಾಗಿ ಒಬ್ಬರೇ."
      ],
      [
        "ಬಾಟ್‌ಗಳು ಚೆನ್ನಾಗಿ ಆಡುತ್ತವೆಯೇ?",
        "ಅದು ನಿಮ್ಮ ಆಯ್ಕೆ: ಸುಲಭ ಬಾಟ್‌ಗಳು ತಪ್ಪುಗಳನ್ನು ಮಾಡುತ್ತವೆ, ಕಠಿಣ ಬಾಟ್‌ಗಳು ತಮ್ಮ ಸಾಧ್ಯತೆಗಳನ್ನು ನಿಖರವಾಗಿ ಓದುತ್ತವೆ ಮತ್ತು ಹೆಚ್ಚು ಬ್ಲಫ್ ಮಾಡುತ್ತವೆ, ಮತ್ತು ಮಿಶ್ರ ಟೇಬಲ್ ಮೂರು ಹಂತಗಳನ್ನು ಐದು ಆಟದ ಶೈಲಿಗಳೊಂದಿಗೆ ಬೆರೆಸುತ್ತದೆ."
      ],
      [
        "ಸ್ನೇಹಿತರು ಮತ್ತು ಬಾಟ್‌ಗಳೊಂದಿಗೆ ಒಂದೇ ಟೇಬಲ್‌ನಲ್ಲಿ ಆಡಬಹುದೇ?",
        "ಹೌದು. ನಿಮ್ಮದೇ PokerTH ಸರ್ವರ್‌ನಲ್ಲಿ, LAN ನಲ್ಲಿ ಅಥವಾ ಇಂಟರ್ನೆಟ್‌ನಲ್ಲಿ ಟೇಬಲ್ ಆಯೋಜಿಸಿದಾಗ, ಕಾಯುವ ಕೊಠಡಿ ಖಾಲಿ ಸೀಟ್‌ಗಳನ್ನು ಕಂಪ್ಯೂಟರ್ ಆಟಗಾರರಿಂದ ತುಂಬಿಸಬಹುದು."
      ]
    ]
  },
  ko: {
    "title": "컴퓨터 상대 포커 — 무료, 오프라인 플레이 | PokerTH",
    "desc": "컴퓨터 상대와 즐기는 무료 Texas Hold’em. 한 테이블에 봇 최대 9명, 쉬움부터 어려움까지. 계정도 돈도 필요 없고, 휴대폰과 PC에서 오프라인으로 플레이할 수 있습니다.",
    "ldHeadline": "컴퓨터 상대로 Texas Hold’em 포커를 무료로, 오프라인에서",
    "ldDesc": "PokerTH 웹 클라이언트의 연습 모드: 컴퓨터 상대와 하는 Texas Hold’em, 난이도와 플레이 스타일, 트로피까지.",
    "h1": "컴퓨터 상대로 즐기는 무료 오프라인 포커",
    "lead": "PokerTH의 연습 모드는 컴퓨터 상대와의 완전한 Texas Hold’em 토너먼트를 브라우저에서 바로 진행합니다. 계정이 필요 없고, 사이트를 한 번 열어 두면 연결도 필요 없으며, 걸린 것도 없습니다. 게임을 배우고, 새 전략을 시험해 보고, 기차 안에서 짧게 한 판 즐기기에 딱 맞는 곳입니다.",
    "stepsH2": "세 단계로 게임 시작",
    "steps": [
      [
        "PokerTH를 열고 로컬 / 연습 선택",
        "이 사이트를 열고 첫 화면에서 로컬 / 연습을 고르세요. 로그인도 다운로드도 없으며, 사이트를 한 번 열어 두면 이 모드는 연결 없이도 동작합니다."
      ],
      [
        "테이블 설정",
        "컴퓨터 상대를 최대 9명까지, 시작 칩, 블라인드가 오르는 속도, 게임 속도를 고르거나 미리 준비된 형식에서 시작하세요. 봇의 난이도도 같은 창에서 고릅니다."
      ],
      [
        "게임 시작",
        "시작을 누르면 빈 자리가 컴퓨터 플레이어로 채워지고 카드가 돌아갑니다. 게임은 한 플레이어가 모든 칩을 가질 때까지 이어집니다."
      ]
    ],
    "levelsH2": "네 가지 난이도",
    "levels": [
      [
        "쉬움",
        "자기 핸드를 잘못 판단하고 블러핑은 거의 하지 않는 봇: 첫 게임에 딱 맞는 상대입니다."
      ],
      [
        "보통",
        "자신의 확률을 잘 읽고, 스택이 짧아져도 정확하게 플레이하는 탄탄한 상대입니다."
      ],
      [
        "어려움",
        "가장 강한 봇: 정확한 핸드 리딩, 날카로운 숏 스택 플레이, 더 많은 블러핑."
      ],
      [
        "혼합",
        "다양한 테이블, 기본 설정: 평균적으로 열 명 중 쉬움 셋, 보통 다섯, 어려움 둘입니다."
      ]
    ],
    "brainH2": "봇은 어떻게 생각할까",
    "brainP": "각 봇은 아직 팟에 남아 있는 플레이어 수를 상대로 남은 카드를 여러 번 돌려 보며, 그 핸드를 이길 실제 확률을 계산합니다. 얼리 포지션에서는 더 타이트하게 플레이하고 레이트 포지션에서는 스틸을 하며, 프리플롭 레이즈 뒤에는 컨티뉴에이션 베팅을 하고, 강한 드로로는 세미 블러핑을 하며, 보통 난이도부터는 스택이 짧아지면 All-In 아니면 Fold 플레이로 바꿉니다.",
    "stylesH2": "다섯 가지 플레이 스타일",
    "stylesP": "난이도는 봇이 게임을 얼마나 잘 읽는지를, 스타일은 어떻게 플레이하는지를 정합니다. 새 테이블마다 다음 스타일이 섞입니다:",
    "styles": [
      [
        "락(Rock)",
        "매우 타이트하고 신중하며, 들어가는 팟이 적고 블러핑은 드뭅니다."
      ],
      [
        "타이트 어그레시브(TAG)",
        "좋은 핸드만 골라 강하게 베팅합니다."
      ],
      [
        "루즈 어그레시브(LAG)",
        "많은 핸드를 플레이하며 당신을 압박합니다."
      ],
      [
        "콜링 스테이션",
        "너무 자주 콜하고 레이즈는 거의 하지 않습니다."
      ],
      [
        "매니악",
        "끊임없이 레이즈하고 블러핑합니다."
      ]
    ],
    "formatsH2": "실전 형식으로 연습",
    "formatsP": "준비된 설정으로 「여유」, 「일반」, 「빠름」 게임을 바로 시작하거나, pokerth.net 대회 조건에서 연습할 수 있습니다: 공식 「랭킹」 속도, We Cup, 그리고 시간 기준 블라인드를 쓰는 BBC. 직접 만든 설정은 나만의 형식으로 저장할 수 있습니다.",
    "trophiesH2": "트로피와 통계",
    "trophiesP": "연습 모드에는 자체 성장 요소가 있습니다: 여섯 가지 분야에 걸친 서른 개가 넘는 트로피 — 플레이한 핸드, 이긴 게임, 연승, 어려움 봇 아홉 명을 상대로 한 승리, 블러핑, 그리고 몇 가지 비밀. 봇 상대 통계는 온라인 게임과 따로 기록되며, pokerth.net 계정으로 로그인하면 트로피가 다른 기기에서도 함께합니다.",
    "learnH2": "배우기에 가장 좋은 곳",
    "learnP": "웹 클라이언트의 모든 도움 기능이 이곳에서 부담 없이 동작합니다: 카드가 열릴 때마다 이길 확률을 보여 주는 「확률」 탭, 핸드 강도 표시, 미리 선택하는 액션, 키보드 단축키. 준비가 되었다고 느껴지면, 같은 테이블이 pokerth.net에서 실제 플레이어들과 함께 당신을 기다립니다.",
    "offlineH2": "어떤 기기에서도 오프라인으로",
    "offlineP": "PokerTH는 웹 앱입니다: iPhone, Android, Windows, macOS, Linux의 브라우저에서 돌아가며, 앱처럼 홈 화면에 추가할 수 있습니다. 한 번 열고 나면 연습 모드는 연결이 전혀 필요 없습니다 — 비행기 모드에서도, 지하철에서도, 신호가 없는 어디에서도.",
    "faqH2": "질문",
    "faq": [
      [
        "컴퓨터와 포커를 무료로 할 수 있나요?",
        "네. PokerTH는 무료 오픈 소스 소프트웨어로, 광고도 인앱 결제도 없습니다. 칩은 게임용 가상 머니일 뿐입니다."
      ],
      [
        "계정이나 연결이 필요한가요?",
        "아니요. 연습 모드는 계정이 필요 없고, 사이트를 한 번 열어 두면 연결 없이 동작합니다."
      ],
      [
        "컴퓨터 상대는 몇 명까지 둘 수 있나요?",
        "최대 9명으로 10인 풀 테이블을 만들 수 있고, 한 명만 두고 헤즈업을 할 수도 있습니다."
      ],
      [
        "봇은 잘하나요?",
        "선택하기 나름입니다: 쉬움 봇은 실수를 하고, 어려움 봇은 확률을 정확히 읽으며 블러핑을 더 하고, 혼합 테이블은 세 난이도와 다섯 플레이 스타일을 섞습니다."
      ],
      [
        "친구와 봇이 같은 테이블에서 플레이할 수 있나요?",
        "네. 직접 운영하는 PokerTH 서버에서 LAN이나 인터넷으로 테이블을 열면, 대기실에서 빈 자리를 컴퓨터 플레이어로 채울 수 있습니다."
      ]
    ]
  },
  ky: {
    "title": "Компьютерге каршы покер — акысыз, оффлайн | PokerTH",
    "desc": "Компьютер атаандаштарына каршы акысыз Texas Hold’em, үстөлдө 9 ботко чейин, жеңилден татаалга чейин. Аккаунтсуз, акчасыз, телефондо жана ПКда оффлайн иштейт.",
    "ldHeadline": "Компьютерге каршы Texas Hold’em покерин ойноңуз, акысыз жана оффлайн",
    "ldDesc": "PokerTH веб-клиентинин машыгуу режими: компьютер атаандаштарына каршы Texas Hold’em, татаалдык деңгээлдери, оюн стилдери жана сыйлыктар менен.",
    "h1": "Компьютерге каршы покер ойноңуз, акысыз жана оффлайн",
    "lead": "PokerTH'тин машыгуу режими компьютер атаандаштарына каршы толук Texas Hold’em турнирлерин түз эле браузериңизде таратат. Аккаунт жок, сайт бир жолу ачылгандан кийин байланыш керек эмес, эч нерсе тобокелде эмес: оюнду үйрөнүү, жаңы стратегияны сынап көрүү же поездде тез бир оюн ойноо үчүн ылайыктуу жер.",
    "stepsH2": "Оюнду үч кадамда баштаңыз",
    "steps": [
      [
        "PokerTH'ти ачып, «Локалдык / машыгуу» тандаңыз",
        "Бул сайтты ачып, биринчи экрандан «Локалдык / машыгуу» тандаңыз. Кирүү да, жүктөө да жок; сайт бир жолу ачылгандан кийин режим байланышсыз да иштейт."
      ],
      [
        "Үстөлүңүздү даярдаңыз",
        "9га чейин компьютер атаандашын, баштапкы стекти, блайнддар канчалык тез өсөрүн жана оюндун ылдамдыгын тандаңыз же даяр форматтан баштаңыз. Боттордун татаалдыгын ошол эле терезеден тандаңыз."
      ],
      [
        "Оюнду баштаңыз",
        "«Баштоо» баскычын басыңыз: бош орундар компьютер оюнчулары менен толуп, карталар таратылат. Оюн бир оюнчу бардык чиптерди колго алганча уланат."
      ]
    ],
    "levelsH2": "Төрт татаалдык деңгээли",
    "levels": [
      [
        "Жеңил",
        "Колдорун туура эмес баалаган жана сейрек блеф кылган боттор: биринчи оюн үчүн ылайыктуу атаандаштар."
      ],
      [
        "Кадимки",
        "Мүмкүнчүлүктөрүн жакшы окуган жана стеги кыскарганда туура ойногон бекем атаандаштар."
      ],
      [
        "Татаал",
        "Эң күчтүү боттор: колдорду так окуу, кыска стек менен курч оюн жана көбүрөөк блеф."
      ],
      [
        "Аралаш",
        "Ар түрдүү үстөл, демейки боюнча: орто эсеп менен ар бир ондон үч жеңил, беш кадимки жана эки татаал бот."
      ]
    ],
    "brainH2": "Боттор кантип ой жүгүртөт",
    "brainP": "Ар бир бот калган карталарды көп жолу таратып, банкта дагы эле калган оюнчулардын санына каршы колду утуунун чыныгы мүмкүнчүлүгүн эсептейт. Ал эрте позицияда тыгызыраак ойнойт жана кеч позициядан уурдайт, флоптон мурун Raise кылгандан кийин continuation bet жасайт, күчтүү дро менен жарым блеф кылат жана кадимки деңгээлден баштап стеги кыскарганда All-In же Fold оюнуна өтөт.",
    "stylesH2": "Беш оюн стили",
    "stylesP": "Татаалдык боттун оюнду канчалык жакшы окуй турганын аныктайт; стили болсо анын кантип ойной турганын аныктайт. Ар бир жаңы үстөлдө аралашат:",
    "styles": [
      [
        "Рок",
        "абдан тыгыз жана этият, аз банкка кирет жана сейрек блеф кылат."
      ],
      [
        "Тайт-агрессивдүү",
        "жакшы колдорду тандап, аларга катуу ставка коёт."
      ],
      [
        "Лууз-агрессивдүү",
        "көп кол ойноп, сизге басым жасайт."
      ],
      [
        "Коллинг-стейшн",
        "өтө көп Call кылат жана сейрек Raise кылат."
      ],
      [
        "Маньяк",
        "тынымсыз Raise жана блеф кылат."
      ]
    ],
    "formatsH2": "Чыныгы форматтарда машыгыңыз",
    "formatsP": "Даяр жөндөөлөр «Тынч», «Кадимки» же «Тез» оюнун баштоого, же pokerth.net мелдештеринин шарттарында машыгууга мүмкүндүк берет: расмий Ranking ылдамдыгы, We Cup жана убакытка негизделген блайнддары бар BBC. Өз жөндөөлөрүңүздү жеке формат катары сактай аласыз.",
    "trophiesH2": "Сыйлыктар жана статистика",
    "trophiesP": "Машыгуу режиминин өз прогресси бар: алты категорияда отуздан ашык сыйлык — ойнолгон колдор, утулган оюндар, жеңиштердин сериялары, тогуз татаал ботко каршы жеңиш, блефтер жана бир нече сыр. Ботторго каршы статистика онлайн оюндарыңыздан өзүнчө сакталат, ал эми pokerth.net аккаунту менен киргенде сыйлыктарыңыз башка түзмөктөрүңүзгө да ээрчип барат.",
    "learnH2": "Үйрөнүү үчүн эң жакшы жер",
    "learnP": "Веб-клиенттин бардык жардамчы куралдары бул жерде басымсыз иштейт: карталар ачылган сайын утуу мүмкүнчүлүгүңүздү көрсөткөн «Мүмкүнчүлүктөр» өтмөгү, колдун күчүн көрсөтүү, алдын ала тандалган аракеттер жана тез баскычтар. Даяр экениңизди сезгенде, ошол эле үстөл pokerth.net сайтында чыныгы оюнчуларга каршы сизди күтүп турат.",
    "offlineH2": "Оффлайн, ар бир түзмөктө",
    "offlineP": "PokerTH — веб-колдонмо: ал iPhone, Android, Windows, macOS жана Linux түзмөктөрүндөгү браузерде иштейт жана башкы экранга колдонмодой кошулат. Бир жолу ачылгандан кийин машыгуу режимине эч кандай байланыш керек эмес — учак режиминде, метродо же сигнал жок каалаган жерде.",
    "faqH2": "Суроолор",
    "faq": [
      [
        "Компьютерге каршы покерди акысыз ойносом болобу?",
        "Ооба. PokerTH — жарнамасыз жана колдонмо ичиндеги сатып алууларсыз акысыз, булак коду ачык программа. Чиптер оюн акчасы гана."
      ],
      [
        "Аккаунт же байланыш керекпи?",
        "Жок. Машыгуу режимине аккаунт керек эмес, ал эми сайт бир жолу ачылгандан кийин байланышсыз иштейт."
      ],
      [
        "Канча компьютер атаандашына каршы ойной алам?",
        "9га чейин — 10 оюнчудан турган толук үстөл үчүн, же heads-up үчүн бир гана."
      ],
      [
        "Боттор жакшы ойнойбу?",
        "Бул сизге байланыштуу: жеңил боттор ката кетирет, татаал боттор мүмкүнчүлүктөрүн так окуп, көбүрөөк блеф кылат, ал эми аралаш үстөл үч деңгээлди беш оюн стили менен айкалыштырат."
      ],
      [
        "Достор жана боттор менен бир үстөлдө ойносом болобу?",
        "Ооба. Өзүңүздүн PokerTH сервериңизде, LAN тармагында же интернетте үстөл ачканыңызда, күтүү бөлмөсү бош орундарды компьютер оюнчулары менен толтура алат."
      ]
    ]
  },
  lt: {
    "title": "Pokeris prieš kompiuterį — nemokamai, be interneto | PokerTH",
    "desc": "Nemokamas Texas Hold’em prieš kompiuterio varžovus: iki 9 botų prie stalo, nuo lengvų iki sunkių. Be paskyros ir pinigų, veikia be interneto telefone ir kompiuteryje.",
    "ldHeadline": "Žaiskite Texas Hold’em pokerį prieš kompiuterį nemokamai ir be interneto",
    "ldDesc": "PokerTH žiniatinklio kliento treniruotės režimas: Texas Hold’em prieš kompiuterio varžovus su sunkumo lygiais, žaidimo stiliais ir trofėjais.",
    "h1": "Žaiskite pokerį prieš kompiuterį nemokamai ir be interneto",
    "lead": "PokerTH treniruotės režimas dalija pilnus Texas Hold’em turnyrus prieš kompiuterio varžovus tiesiog jūsų naršyklėje. Jokios paskyros, jokio ryšio, kai svetainė jau buvo atidaryta, ir nieko nerizikuojant: vieta išmokti žaidimą, išbandyti naują strategiją ar sužaisti greitą partiją traukinyje.",
    "stepsH2": "Pradėkite žaidimą trimis žingsniais",
    "steps": [
      [
        "Atidarykite PokerTH ir pasirinkite „Vietinis / treniruotė“",
        "Atidarykite šią svetainę ir pirmame ekrane pasirinkite „Vietinis / treniruotė“. Nereikia nei prisijungti, nei ką nors atsisiųsti; kai svetainė jau buvo atidaryta, režimas veikia ir be ryšio."
      ],
      [
        "Paruoškite savo stalą",
        "Pasirinkite iki 9 kompiuterio varžovų, pradinį žetonų kiekį, kaip greitai kyla aklieji statymai ir žaidimo greitį arba pradėkite nuo paruošto formato. Tame pačiame lange pasirinkite botų sunkumą."
      ],
      [
        "Pradėkite žaidimą",
        "Paspauskite „Pradžia“: tuščias vietas užima kompiuterio žaidėjai ir išdalijamos kortos. Žaidimas tęsiasi, kol vienas žaidėjas surenka visus žetonus."
      ]
    ],
    "levelsH2": "Keturi sunkumo lygiai",
    "levels": [
      [
        "Lengvas",
        "Botai, kurie neteisingai įvertina savo rankas ir retai blefuoja: tinkami varžovai pirmajam žaidimui."
      ],
      [
        "Normalus",
        "Tvirti varžovai, kurie gerai įvertina savo šansus ir teisingai žaidžia, kai jų žetonų lieka nedaug."
      ],
      [
        "Sunkus",
        "Stipriausi botai: tikslus rankų skaitymas, aštrus žaidimas su mažu žetonų kiekiu ir daugiau blefų."
      ],
      [
        "Mišrus",
        "Įvairus stalas, numatytasis pasirinkimas: vidutiniškai trys lengvi botai, penki normalūs ir du sunkūs iš kiekvienos dešimties."
      ]
    ],
    "brainH2": "Kaip mąsto botai",
    "brainP": "Kiekvienas botas apskaičiuoja savo tikrąjį šansą laimėti ranką, daugybę kartų išdalydamas likusias kortas, atsižvelgdamas į žaidėjų, vis dar dalyvaujančių banke, skaičių. Ankstyvoje pozicijoje jis žaidžia griežčiau, iš vėlyvos pozicijos vagia, po kėlimo prieš flopą daro tęstinį statymą (continuation bet), pusiau blefuoja su stipriais laukimais ir, pradedant nuo normalaus lygio, pereina prie žaidimo „viskas vidun arba pasitraukimas“, kai jo žetonų lieka nedaug.",
    "stylesH2": "Penki žaidimo stiliai",
    "stylesP": "Sunkumas lemia, kaip gerai botas skaito žaidimą; stilius lemia, kaip jis žaidžia. Kiekvienas naujas stalas sumaišo:",
    "styles": [
      [
        "Rock",
        "labai griežtas ir atsargus, įsitraukia į nedaug bankų ir retai blefuoja."
      ],
      [
        "Griežtas agresyvus (TAG)",
        "renkasi geras rankas ir su jomis stato stipriai."
      ],
      [
        "Laisvas agresyvus (LAG)",
        "žaidžia daug rankų ir daro jums spaudimą."
      ],
      [
        "Calling station",
        "atsako per dažnai ir retai kelia."
      ],
      [
        "Maniakas",
        "nuolat kelia ir blefuoja."
      ]
    ],
    "formatsH2": "Treniruokitės tikruose formatuose",
    "formatsP": "Paruošti nustatymai leidžia pradėti „Ramus“, „Įprastas“ ar „Greitas“ žaidimą arba treniruotis pokerth.net varžybų sąlygomis: oficialiu „Reitingas“ tempu, We Cup ir BBC su laiku grįstais akliaisiais statymais. Savo nustatymus galite išsaugoti kaip nuosavą formatą.",
    "trophiesH2": "Trofėjai ir statistika",
    "trophiesP": "Treniruotės režimas turi savo pažangą: daugiau nei trisdešimt trofėjų šešiose kategorijose — sužaistos rankos, laimėti žaidimai, pergalių serijos, pergalė prieš devynis sunkius botus, blefai ir keletas paslapčių. Statistika prieš botus laikoma atskirai nuo jūsų žaidimų internete, o prisijungus su pokerth.net paskyra trofėjai keliauja su jumis į kitus jūsų įrenginius.",
    "learnH2": "Geriausia vieta mokytis",
    "learnP": "Visos žiniatinklio kliento pagalbinės priemonės čia veikia be spaudimo: kortelė „Tikimybės“ su jūsų šansu laimėti, kai atverčiamos kortos, rankos stiprumo rodinys, iš anksto pasirinkti veiksmai ir spartieji klavišai. Kai pasijusite pasirengę, tas pats stalas laukia jūsų pokerth.net prieš tikrus žaidėjus.",
    "offlineH2": "Be interneto, bet kuriame įrenginyje",
    "offlineP": "PokerTH yra žiniatinklio programėlė: ji veikia naršyklėje iPhone, Android, Windows, macOS ir Linux įrenginiuose ir gali būti pridėta į pradžios ekraną kaip programėlė. Kartą atidarytam treniruotės režimui ryšio visai nereikia — lėktuvo režimu, metro ar bet kur, kur nėra signalo.",
    "faqH2": "Klausimai",
    "faq": [
      [
        "Ar galiu nemokamai žaisti pokerį prieš kompiuterį?",
        "Taip. PokerTH yra nemokama atvirojo kodo programinė įranga be reklamų ir be pirkinių programėlėje. Žetonai yra tik žaidimo pinigai."
      ],
      [
        "Ar man reikia paskyros ar ryšio?",
        "Ne. Treniruotės režimui paskyros nereikia, o kai svetainė jau buvo atidaryta, jis veikia be ryšio."
      ],
      [
        "Prieš kiek kompiuterio varžovų galiu žaisti?",
        "Iki 9 — pilnam 10 žaidėjų stalui — arba prieš vieną, žaidžiant vienas prieš vieną."
      ],
      [
        "Ar botai žaidžia gerai?",
        "Tai priklauso nuo jūsų: lengvi botai klysta, sunkūs tiksliai įvertina savo šansus ir daugiau blefuoja, o mišrus stalas sujungia tris lygius su penkiais žaidimo stiliais."
      ],
      [
        "Ar galiu žaisti su draugais ir botais prie to paties stalo?",
        "Taip. Kai kuriate stalą savo PokerTH serveryje, vietiniame tinkle (LAN) ar internete, laukimo kambarys gali užpildyti tuščias vietas kompiuterio žaidėjais."
      ]
    ]
  },
  lv: {
    "title": "Spēlē pokeru pret datoru — bez maksas, bezsaistē | PokerTH",
    "desc": "Bezmaksas Texas Hold’em pret datora pretiniekiem, līdz 9 botiem pie galda, no viegliem līdz grūtiem. Bez konta, bez naudas, darbojas bezsaistē telefonā un datorā.",
    "ldHeadline": "Spēlē Texas Hold’em pokeru pret datoru, bez maksas un bezsaistē",
    "ldDesc": "PokerTH tīmekļa klienta treniņa režīms: Texas Hold’em pret datora pretiniekiem, ar grūtības līmeņiem, spēles stiliem un trofejām.",
    "h1": "Spēlē pokeru pret datoru, bez maksas un bezsaistē",
    "lead": "PokerTH treniņa režīms izdala pilnus Texas Hold’em turnīrus pret datora pretiniekiem tieši tavā pārlūkā. Bez konta, bez savienojuma, kad vietne reiz ir atvērta, un nekas nav likts uz spēles: vieta, kur iemācīties spēli, izmēģināt jaunu stratēģiju vai ātri uzspēlēt vilcienā.",
    "stepsH2": "Sāc spēli trīs soļos",
    "steps": [
      [
        "Atver PokerTH un izvēlies Lokāli / treniņš",
        "Atver šo vietni un pirmajā ekrānā izvēlies Lokāli / treniņš. Nav ne pieslēgšanās, ne lejupielādes; kad vietne reiz ir atvērta, režīms darbojas arī bez savienojuma."
      ],
      [
        "Iestati savu galdu",
        "Izvēlies līdz 9 datora pretiniekiem, sākuma žetonus, cik ātri pieaug aklās likmes, un spēles ātrumu, vai sāc ar gatavu formātu. Botu grūtību izvēlies tajā pašā logā."
      ],
      [
        "Sāc spēli",
        "Nospied Sākt: brīvās vietas aizpildās ar datora spēlētājiem, un kārtis tiek izdalītas. Spēle turpinās, līdz vienam spēlētājam ir visi žetoni."
      ]
    ],
    "levelsH2": "Četri grūtības līmeņi",
    "levels": [
      [
        "Viegli",
        "Boti, kas nepareizi novērtē savas kārtis un reti blefo: īstie pretinieki pirmajai spēlei."
      ],
      [
        "Normāli",
        "Stabili pretinieki, kas labi novērtē savas izredzes un spēlē pareizi, kad žetonu paliek maz."
      ],
      [
        "Grūti",
        "Spēcīgākie boti: precīza kombināciju nolasīšana, asa spēle ar mazu žetonu apjomu un vairāk blefa."
      ],
      [
        "Jaukti",
        "Daudzveidīgs galds, noklusējums: vidēji trīs viegli, pieci normāli un divi grūti boti no katriem desmit."
      ]
    ],
    "brainH2": "Kā boti domā",
    "brainP": "Katrs bots aprēķina savas patiesās izredzes uzvarēt partijā, daudzkārt izdalot atlikušās kārtis, pret to spēlētāju skaitu, kas vēl ir bankā. Agrīnā pozīcijā tas spēlē šaurāk un no vēlās pozīcijas zog, pēc paaugstinājuma pirms flopa izdara turpinājuma likmi, ar spēcīgām nepabeigtām kombinācijām pusblefo un, sākot no normālā līmeņa, pāriet uz spēli all-in vai fold, kad žetonu paliek maz.",
    "stylesH2": "Pieci spēles stili",
    "stylesP": "Grūtība nosaka, cik labi bots lasa spēli; stils nosaka, kā tas spēlē. Katrā jaunā galdā sajaukti:",
    "styles": [
      [
        "Rock",
        "ļoti šaurs un piesardzīgs, iesaistās nedaudzās bankās un reti blefo."
      ],
      [
        "Šauri agresīvs",
        "izvēlas labas kārtis un ar tām liek spēcīgi."
      ],
      [
        "Plaši agresīvs",
        "spēlē daudz kāršu un izdara uz tevi spiedienu."
      ],
      [
        "Calling station",
        "pārāk bieži izlīdzina un reti paaugstina."
      ],
      [
        "Maniaks",
        "nemitīgi paaugstina un blefo."
      ]
    ],
    "formatsH2": "Trenējies īstos formātos",
    "formatsP": "Gatavi iestatījumi ļauj sākt spēli Mierīgs, Normāls vai Ātrs, vai trenēties pokerth.net sacensību apstākļos: oficiālais Ranking temps, We Cup un BBC ar uz laiku balstītām aklajām likmēm. Savus iestatījumus vari saglabāt kā savu formātu.",
    "trophiesH2": "Trofejas un statistika",
    "trophiesP": "Treniņa režīmam ir savs progress: vairāk nekā trīsdesmit trofeju sešās kategorijās — izspēlētās partijas, uzvarētās spēles, uzvaru sērijas, uzvara pret deviņiem grūtiem botiem, blefi un daži noslēpumi. Statistika pret botiem tiek glabāta atsevišķi no tavām tiešsaistes spēlēm, un, kad pieslēdzies ar pokerth.net kontu, tavas trofejas seko tev uz citām ierīcēm.",
    "learnH2": "Labākā vieta, kur mācīties",
    "learnP": "Visi tīmekļa klienta palīglīdzekļi šeit darbojas bez spiediena: cilne Izredzes ar tavām uzvaras izredzēm, kārtīm atklājoties, kombinācijas stipruma rādītājs, iepriekš izvēlētas darbības un īsinājumtaustiņi. Kad jūties gatavs, tas pats galds tevi gaida pokerth.net pret īstiem spēlētājiem.",
    "offlineH2": "Bezsaistē, jebkurā ierīcē",
    "offlineP": "PokerTH ir tīmekļa lietotne: tā darbojas pārlūkā iPhone, Android, Windows, macOS un Linux ierīcēs, un to var pievienot sākuma ekrānam kā lietotni. Kad treniņa režīms reiz ir atvērts, savienojums tam vairs nav vajadzīgs — lidojuma režīmā, metro vai jebkur bez signāla.",
    "faqH2": "Jautājumi",
    "faq": [
      [
        "Vai varu bez maksas spēlēt pokeru pret datoru?",
        "Jā. PokerTH ir bezmaksas atvērtā pirmkoda programmatūra bez reklāmām un bez pirkumiem lietotnē. Žetoni ir tikai spēles nauda."
      ],
      [
        "Vai vajag kontu vai savienojumu?",
        "Nē. Treniņa režīmam konts nav vajadzīgs, un, kad vietne reiz ir atvērta, tas darbojas bez savienojuma."
      ],
      [
        "Pret cik datora pretiniekiem var spēlēt?",
        "Līdz 9, lai pie galda būtu pilni 10 spēlētāji, vai pret vienu pašu divatā."
      ],
      [
        "Vai boti ir labi?",
        "Tas atkarīgs no tevis: vieglie boti kļūdās, grūtie boti precīzi novērtē savas izredzes un vairāk blefo, bet jauktais galds apvieno trīs līmeņus ar pieciem spēles stiliem."
      ],
      [
        "Vai varu spēlēt ar draugiem un botiem pie viena galda?",
        "Jā. Kad izveido galdu savā PokerTH serverī, LAN tīklā vai internetā, gaidīšanas telpa var aizpildīt brīvās vietas ar datora spēlētājiem."
      ]
    ]
  },
  mk: {
    "title": "Покер против компјутер — бесплатно, офлајн | PokerTH",
    "desc": "Бесплатен Texas Hold’em против компјутерски противници, до 9 ботови на масата, од лесни до тешки. Без сметка, без пари, работи офлајн на телефон и компјутер.",
    "ldHeadline": "Играј Texas Hold’em покер против компјутер, бесплатно и офлајн",
    "ldDesc": "Режимот за тренинг на веб-клиентот PokerTH: Texas Hold’em против компјутерски противници, со нивоа на тежина, стилови на игра и трофеи.",
    "h1": "Играј покер против компјутер, бесплатно и офлајн",
    "lead": "Режимот за тренинг на PokerTH дели цели турнири во Texas Hold’em против компјутерски противници, директно во твојот прелистувач. Без сметка, без врска откако сајтот еднаш ќе се отвори, и без ништо на коцка: место да ја научиш играта, да пробаш нова стратегија или да одиграш брза партија во возот.",
    "stepsH2": "Започни игра во три чекори",
    "steps": [
      [
        "Отвори PokerTH и избери Локално / тренинг",
        "Отвори го овој сајт и избери Локално / тренинг на првиот екран. Нема најава и нема преземање; откако сајтот еднаш ќе се отвори, режимот работи и без врска."
      ],
      [
        "Постави ја својата маса",
        "Избери до 9 компјутерски противници, почетниот стек, колку брзо растат блајндовите и брзината на играта, или почни од готов формат. Тежината на ботовите ја избираш во истиот прозорец."
      ],
      [
        "Започни ја играта",
        "Притисни Започни: празните места се пополнуваат со компјутерски играчи и картите се делат. Играта трае сè додека еден играч не ги собере сите жетони."
      ]
    ],
    "levelsH2": "Четири нивоа на тежина",
    "levels": [
      [
        "Лесно",
        "Ботови што погрешно ги проценуваат своите раце и ретко блефираат: вистинските противници за прва игра."
      ],
      [
        "Нормално",
        "Солидни противници што добро ги проценуваат своите шанси и играат правилно кога стекот им се намалува."
      ],
      [
        "Тешко",
        "Најсилните ботови: прецизно читање раце, остра игра со мал стек и повеќе блефови."
      ],
      [
        "Мешано",
        "Разновидна маса, стандардно: во просек три лесни бота, пет нормални и два тешки на секои десет."
      ]
    ],
    "brainH2": "Како размислуваат ботовите",
    "brainP": "Секој бот ја пресметува својата вистинска шанса да ја добие раката така што ги дели преостанатите карти многу пати, наспроти бројот на играчи што сè уште се во потот. Игра потесно од рана позиција и краде од доцна позиција, прави продолжен облог (c-bet) откако направил Raise пред флопот, полублефира со силни изгледи и, од нормалното ниво нагоре, преминува на игра all-in или fold кога стекот му се намалува.",
    "stylesH2": "Пет стилови на игра",
    "stylesP": "Тежината одредува колку добро ботот ја чита играта; неговиот стил одредува како игра. Секоја нова маса меша:",
    "styles": [
      [
        "Рок",
        "многу тесен и внимателен, влегува во малку потови и ретко блефира."
      ],
      [
        "Тајт-агресивен (TAG)",
        "избира добри раце и силно облажува со нив."
      ],
      [
        "Луз-агресивен (LAG)",
        "игра многу раце и те става под притисок."
      ],
      [
        "Калинг стејшн",
        "прави Call премногу често и ретко Raise."
      ],
      [
        "Манијак",
        "постојано прави Raise и блефира."
      ]
    ],
    "formatsH2": "Вежбај ги вистинските формати",
    "formatsP": "Готовите поставки ти овозможуваат да започнеш игра во формат Опуштено, Нормално или Брзо, или да вежбаш во условите на натпреварите на pokerth.net: официјалното темпо Рангирање, We Cup и BBC со блајндови што растат според времето. Своите поставки можеш да ги зачуваш како сопствен формат.",
    "trophiesH2": "Трофеи и статистика",
    "trophiesP": "Режимот за тренинг има сопствен напредок: повеќе од триесет трофеи во шест категории — одиграни раце, добиени игри, низи победи, победа против девет тешки ботови, блефови и неколку тајни. Статистиката против ботовите се води одделно од твоите онлајн игри, а кога ќе се најавиш со сметка на pokerth.net, трофеите те следат и на другите уреди.",
    "learnH2": "Најдоброто место за учење",
    "learnP": "Секое помагало на веб-клиентот тука работи без притисок: јазичето Изгледи со твојата шанса за победа додека излегуваат картите, приказот на јачината на раката, однапред избраните потези и кратенките на тастатурата. Кога ќе се почувствуваш подготвен, истата маса те чека на pokerth.net против вистински играчи.",
    "offlineH2": "Офлајн, на секој уред",
    "offlineP": "PokerTH е веб-апликација: работи во прелистувачот на iPhone, Android, Windows, macOS и Linux и може да се додаде на почетниот екран како апликација. Откако еднаш ќе се отвори, режимот за тренинг воопшто нема потреба од врска — во авионски режим, во метро или каде било без сигнал.",
    "faqH2": "Прашања",
    "faq": [
      [
        "Може ли бесплатно да играм покер против компјутер?",
        "Да. PokerTH е бесплатен софтвер со отворен код, без реклами и без купувања во апликацијата. Жетоните се само пари за игра."
      ],
      [
        "Ми треба ли сметка или врска?",
        "Не. За режимот за тренинг не ти треба сметка, а откако сајтот еднаш ќе се отвори, работи без врска."
      ],
      [
        "Против колку компјутерски противници можам да играм?",
        "До 9, за полна маса од 10 играчи, или само еден за игра еден на еден."
      ],
      [
        "Дали ботовите се добри?",
        "Тоа зависи од тебе: лесните ботови прават грешки, тешките прецизно ги проценуваат шансите и блефираат повеќе, а мешаната маса ги комбинира трите нивоа со пет стилови на игра."
      ],
      [
        "Може ли да играм со пријатели и ботови на иста маса?",
        "Да. Кога си домаќин на маса на сопствен PokerTH-сервер, во LAN или на интернет, чекалната може да ги пополни празните места со компјутерски играчи."
      ]
    ]
  },
  ml: {
    "title": "കമ്പ്യൂട്ടറിനെതിരെ പോക്കർ — സൗജന്യം, ഓഫ്‌ലൈൻ | PokerTH",
    "desc": "കമ്പ്യൂട്ടറിനെതിരെ സൗജന്യ Texas Hold’em, ടേബിളിൽ 9 ബോട്ടുകൾ വരെ, എളുപ്പം മുതൽ കഠിനം വരെ. അക്കൗണ്ടും പണവും വേണ്ട, ഫോണിലും പിസിയിലും ഓഫ്‌ലൈനായും കളിക്കാം.",
    "ldHeadline": "കമ്പ്യൂട്ടറിനെതിരെ Texas Hold’em പോക്കർ കളിക്കൂ, സൗജന്യമായി, ഓഫ്‌ലൈനായി",
    "ldDesc": "PokerTH വെബ് ക്ലയന്റിന്റെ പരിശീലന മോഡ്: കമ്പ്യൂട്ടർ എതിരാളികൾക്കെതിരെ Texas Hold’em, കാഠിന്യ നിലകളും കളി ശൈലികളും ട്രോഫികളും സഹിതം.",
    "h1": "കമ്പ്യൂട്ടറിനെതിരെ പോക്കർ കളിക്കൂ, സൗജന്യമായി, ഓഫ്‌ലൈനായി",
    "lead": "PokerTH-ന്റെ പരിശീലന മോഡ് കമ്പ്യൂട്ടർ എതിരാളികൾക്കെതിരെ സമ്പൂർണ Texas Hold’em ടൂർണമെന്റുകൾ നേരിട്ട് നിങ്ങളുടെ ബ്രൗസറിൽ ഒരുക്കുന്നു. അക്കൗണ്ട് വേണ്ട, സൈറ്റ് ഒരിക്കൽ തുറന്നുകഴിഞ്ഞാൽ കണക്ഷനും വേണ്ട, ഒന്നും പണയത്തിലുമില്ല: കളി പഠിക്കാനും പുതിയൊരു തന്ത്രം പരീക്ഷിക്കാനും ട്രെയിനിൽ ഒരു വേഗക്കളി കളിക്കാനുമുള്ള ഇടം.",
    "stepsH2": "മൂന്ന് ഘട്ടങ്ങളിൽ ഒരു ഗെയിം തുടങ്ങുക",
    "steps": [
      [
        "PokerTH തുറന്ന് ലോക്കൽ / പരിശീലനം തിരഞ്ഞെടുക്കുക",
        "ഈ സൈറ്റ് തുറന്ന് ആദ്യ സ്ക്രീനിൽ ലോക്കൽ / പരിശീലനം തിരഞ്ഞെടുക്കുക. ലോഗിനും ഡൗൺലോഡും ഇല്ല; സൈറ്റ് ഒരിക്കൽ തുറന്നുകഴിഞ്ഞാൽ ഈ മോഡ് കണക്ഷനില്ലാതെയും പ്രവർത്തിക്കും."
      ],
      [
        "നിങ്ങളുടെ ടേബിൾ ഒരുക്കുക",
        "9 വരെ കമ്പ്യൂട്ടർ എതിരാളികൾ, തുടക്ക സ്റ്റാക്ക്, ബ്ലൈൻഡുകൾ കൂടുന്ന വേഗത, കളിയുടെ വേഗത എന്നിവ തിരഞ്ഞെടുക്കുക, അല്ലെങ്കിൽ തയ്യാറാക്കിയ ഒരു ഫോർമാറ്റിൽ നിന്ന് തുടങ്ങുക. ബോട്ടുകളുടെ കാഠിന്യം അതേ വിൻഡോയിൽ തിരഞ്ഞെടുക്കാം."
      ],
      [
        "ഗെയിം തുടങ്ങുക",
        "തുടങ്ങുക അമർത്തുക: ഒഴിഞ്ഞ സീറ്റുകൾ കമ്പ്യൂട്ടർ കളിക്കാരെക്കൊണ്ട് നിറയും, കാർഡുകൾ വിതരണം ചെയ്യപ്പെടും. ഒരു കളിക്കാരന്റെ കൈയിൽ എല്ലാ ചിപ്പുകളും എത്തുന്നതുവരെ കളി തുടരും."
      ]
    ],
    "levelsH2": "നാല് കാഠിന്യ നിലകൾ",
    "levels": [
      [
        "എളുപ്പം",
        "സ്വന്തം ഹാൻഡ് തെറ്റായി വിലയിരുത്തുകയും അപൂർവമായി മാത്രം ബ്ലഫ് ചെയ്യുകയും ചെയ്യുന്ന ബോട്ടുകൾ: ആദ്യ ഗെയിമിന് പറ്റിയ എതിരാളികൾ."
      ],
      [
        "സാധാരണ",
        "സ്വന്തം സാധ്യതകൾ നന്നായി വിലയിരുത്തുകയും സ്റ്റാക്ക് ചുരുങ്ങുമ്പോൾ ശരിയായി കളിക്കുകയും ചെയ്യുന്ന ഉറച്ച എതിരാളികൾ."
      ],
      [
        "കഠിനം",
        "ഏറ്റവും ശക്തരായ ബോട്ടുകൾ: കൃത്യമായ ഹാൻഡ് റീഡിംഗ്, ഷോർട്ട് സ്റ്റാക്കിൽ മൂർച്ചയുള്ള കളി, കൂടുതൽ ബ്ലഫുകൾ."
      ],
      [
        "മിശ്രിതം",
        "വൈവിധ്യമുള്ള ടേബിൾ, ഡിഫോൾട്ട്: ശരാശരി ഓരോ പത്തിലും മൂന്ന് എളുപ്പ ബോട്ടുകൾ, അഞ്ച് സാധാരണ, രണ്ട് കഠിനം."
      ]
    ],
    "brainH2": "ബോട്ടുകൾ എങ്ങനെ ചിന്തിക്കുന്നു",
    "brainP": "ഓരോ ബോട്ടും ബാക്കിയുള്ള കാർഡുകൾ പലതവണ വിതരണം ചെയ്ത്, പോട്ടിൽ ഇപ്പോഴും ഉള്ള കളിക്കാരുടെ എണ്ണത്തിനെതിരെ, ഹാൻഡ് ജയിക്കാനുള്ള യഥാർത്ഥ സാധ്യത കണക്കാക്കുന്നു. നേരത്തെയുള്ള പൊസിഷനിൽ കൂടുതൽ ടൈറ്റായി കളിക്കുന്നു, വൈകിയ പൊസിഷനിൽ നിന്ന് സ്റ്റീൽ ചെയ്യുന്നു, ഫ്ലോപ്പിന് മുമ്പ് Raise ചെയ്തശേഷം കണ്ടിന്യുവേഷൻ ബെറ്റ് വെക്കുന്നു, ശക്തമായ ഡ്രോകളിൽ സെമി-ബ്ലഫ് ചെയ്യുന്നു, സാധാരണ നില മുതൽ മുകളിലേക്ക് സ്റ്റാക്ക് ചുരുങ്ങുമ്പോൾ all-in അല്ലെങ്കിൽ fold കളിയിലേക്ക് മാറുന്നു.",
    "stylesH2": "അഞ്ച് കളി ശൈലികൾ",
    "stylesP": "ഒരു ബോട്ട് കളി എത്ര നന്നായി വായിക്കുന്നു എന്ന് കാഠിന്യം നിശ്ചയിക്കുന്നു; അത് എങ്ങനെ കളിക്കുന്നു എന്ന് അതിന്റെ ശൈലിയും. ഓരോ പുതിയ ടേബിളിലും ഇവ കലർന്നിരിക്കും:",
    "styles": [
      [
        "റോക്ക്",
        "വളരെ ടൈറ്റും ശ്രദ്ധാലുവും, കുറച്ച് പോട്ടുകളിൽ മാത്രം കയറുന്നു, അപൂർവമായി ബ്ലഫ് ചെയ്യുന്നു."
      ],
      [
        "ടൈറ്റ്-അഗ്രസീവ്",
        "നല്ല ഹാൻഡുകൾ തിരഞ്ഞെടുത്ത് അവയിൽ ശക്തമായി ബെറ്റ് ചെയ്യുന്നു."
      ],
      [
        "ലൂസ്-അഗ്രസീവ്",
        "ധാരാളം ഹാൻഡുകൾ കളിച്ച് നിങ്ങളിൽ സമ്മർദ്ദം ചെലുത്തുന്നു."
      ],
      [
        "കോളിംഗ് സ്റ്റേഷൻ",
        "വളരെക്കൂടുതൽ തവണ Call ചെയ്യുന്നു, അപൂർവമായേ Raise ചെയ്യൂ."
      ],
      [
        "മാനിയാക്ക്",
        "നിരന്തരം Raise ചെയ്യുകയും ബ്ലഫ് ചെയ്യുകയും ചെയ്യുന്നു."
      ]
    ],
    "formatsH2": "യഥാർത്ഥ ഫോർമാറ്റുകൾ പരിശീലിക്കുക",
    "formatsP": "തയ്യാറാക്കിയ ക്രമീകരണങ്ങൾ ഉപയോഗിച്ച് ശാന്തം, സാധാരണ, വേഗം എന്നിവയിലൊരു ഗെയിം തുടങ്ങാം, അല്ലെങ്കിൽ pokerth.net മത്സരങ്ങളുടെ സാഹചര്യങ്ങളിൽ പരിശീലിക്കാം: ഔദ്യോഗിക റാങ്കിംഗ് വേഗത, We Cup, സമയാധിഷ്ഠിത ബ്ലൈൻഡുകളുള്ള BBC. നിങ്ങളുടെ സ്വന്തം ക്രമീകരണങ്ങൾ സ്വന്തമായൊരു ഫോർമാറ്റായി സേവ് ചെയ്യാം.",
    "trophiesH2": "ട്രോഫികളും സ്ഥിതിവിവരക്കണക്കുകളും",
    "trophiesP": "പരിശീലന മോഡിന് സ്വന്തം പുരോഗതിയുണ്ട്: ആറ് വിഭാഗങ്ങളിലായി മുപ്പതിലധികം ട്രോഫികൾ — കളിച്ച ഹാൻഡുകൾ, ജയിച്ച ഗെയിമുകൾ, തുടർവിജയങ്ങൾ, ഒമ്പത് കഠിന ബോട്ടുകൾക്കെതിരായ വിജയം, ബ്ലഫുകൾ, പിന്നെ കുറച്ച് രഹസ്യങ്ങളും. ബോട്ടുകൾക്കെതിരായ കണക്കുകൾ നിങ്ങളുടെ ഓൺലൈൻ ഗെയിമുകളിൽ നിന്ന് വേറിട്ട് സൂക്ഷിക്കുന്നു, pokerth.net അക്കൗണ്ട് ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുമ്പോൾ നിങ്ങളുടെ ട്രോഫികൾ മറ്റ് ഉപകരണങ്ങളിലേക്കും നിങ്ങളെ പിന്തുടരും.",
    "learnH2": "പഠിക്കാൻ ഏറ്റവും നല്ല ഇടം",
    "learnP": "വെബ് ക്ലയന്റിലെ എല്ലാ സഹായങ്ങളും ഇവിടെ സമ്മർദ്ദമില്ലാതെ പ്രവർത്തിക്കുന്നു: കാർഡുകൾ വരുന്തോറും നിങ്ങളുടെ ജയസാധ്യത കാണിക്കുന്ന ഓഡ്സ് ടാബ്, ഹാൻഡിന്റെ ശക്തി കാണിക്കുന്ന ഡിസ്പ്ലേ, മുൻകൂട്ടി തിരഞ്ഞെടുക്കാവുന്ന നീക്കങ്ങൾ, കീബോർഡ് ഷോർട്ട്കട്ടുകൾ. തയ്യാറാണെന്ന് തോന്നുമ്പോൾ, അതേ ടേബിൾ pokerth.net-ൽ യഥാർത്ഥ കളിക്കാർക്കെതിരെ നിങ്ങളെ കാത്തിരിക്കുന്നു.",
    "offlineH2": "ഓഫ്‌ലൈനിൽ, എല്ലാ ഉപകരണങ്ങളിലും",
    "offlineP": "PokerTH ഒരു വെബ് ആപ്പാണ്: iPhone, Android, Windows, macOS, Linux എന്നിവയിൽ ബ്രൗസറിൽ പ്രവർത്തിക്കുന്നു, ഒരു ആപ്പ് പോലെ ഹോം സ്ക്രീനിൽ ചേർക്കാനും കഴിയും. ഒരിക്കൽ തുറന്നുകഴിഞ്ഞാൽ, പരിശീലന മോഡിന് ഒരു കണക്ഷനും വേണ്ട — എയർപ്ലെയിൻ മോഡിലും മെട്രോയിലും സിഗ്നൽ ഇല്ലാത്ത എവിടെയും.",
    "faqH2": "ചോദ്യങ്ങൾ",
    "faq": [
      [
        "കമ്പ്യൂട്ടറിനെതിരെ സൗജന്യമായി പോക്കർ കളിക്കാമോ?",
        "അതെ. PokerTH പരസ്യങ്ങളോ ആപ്പിനുള്ളിലെ വാങ്ങലുകളോ ഇല്ലാത്ത സൗജന്യ, ഓപ്പൺ സോഴ്സ് സോഫ്റ്റ്‌വെയറാണ്. ചിപ്പുകൾ കളിപ്പണം മാത്രമാണ്."
      ],
      [
        "അക്കൗണ്ടോ കണക്ഷനോ വേണോ?",
        "വേണ്ട. പരിശീലന മോഡിന് അക്കൗണ്ട് ആവശ്യമില്ല, സൈറ്റ് ഒരിക്കൽ തുറന്നുകഴിഞ്ഞാൽ അത് കണക്ഷനില്ലാതെ പ്രവർത്തിക്കും."
      ],
      [
        "എത്ര കമ്പ്യൂട്ടർ എതിരാളികൾക്കെതിരെ കളിക്കാം?",
        "9 വരെ, 10 കളിക്കാരുടെ നിറഞ്ഞ ടേബിളിനായി, അല്ലെങ്കിൽ ഹെഡ്സ്-അപ്പിനായി ഒരാൾ മാത്രം."
      ],
      [
        "ബോട്ടുകൾ നല്ലതാണോ?",
        "അത് നിങ്ങൾക്ക് തീരുമാനിക്കാം: എളുപ്പ ബോട്ടുകൾ തെറ്റുകൾ വരുത്തും, കഠിന ബോട്ടുകൾ സാധ്യതകൾ കൃത്യമായി വിലയിരുത്തി കൂടുതൽ ബ്ലഫ് ചെയ്യും, മിശ്രിത ടേബിൾ മൂന്ന് നിലകളും അഞ്ച് കളി ശൈലികളും കൂട്ടിച്ചേർക്കുന്നു."
      ],
      [
        "ഒരേ ടേബിളിൽ സുഹൃത്തുക്കളോടും ബോട്ടുകളോടും ഒപ്പം കളിക്കാമോ?",
        "അതെ. സ്വന്തം PokerTH സെർവറിൽ, LAN-ലോ ഇന്റർനെറ്റിലോ, നിങ്ങൾ ഒരു ടേബിൾ ഹോസ്റ്റ് ചെയ്യുമ്പോൾ, കാത്തിരിപ്പ് മുറിക്ക് ഒഴിഞ്ഞ സീറ്റുകൾ കമ്പ്യൂട്ടർ കളിക്കാരെക്കൊണ്ട് നിറയ്ക്കാം."
      ]
    ]
  },
  mn: {
    "title": "Компьютертэй покер тоглох — үнэгүй, офлайн | PokerTH",
    "desc": "Компьютерийн өрсөлдөгчдийн эсрэг үнэгүй Texas Hold’em, ширээнд тань 9 хүртэл бот, хялбараас хэцүү хүртэл. Бүртгэлгүй, мөнгөгүй, утас болон PC дээр офлайн ажиллана.",
    "ldHeadline": "Компьютерийн эсрэг Texas Hold’em покер үнэгүй, офлайн тоглоорой",
    "ldDesc": "PokerTH вэб клиентийн дадлагын горим: компьютерийн өрсөлдөгчдийн эсрэг Texas Hold’em, хүндрэлийн түвшин, тоглох хэв маяг, цомуудтай.",
    "h1": "Компьютертэй покер үнэгүй, офлайн тоглоорой",
    "lead": "PokerTH-ийн дадлагын горим компьютерийн өрсөлдөгчдийн эсрэг бүрэн Texas Hold’em тэмцээнүүдийг шууд таны хөтөч дээр тараана. Бүртгэл шаардлагагүй, сайтыг нэг удаа нээсний дараа холболт хэрэггүй, юу ч эрсдэлд орохгүй: тоглоомд суралцах, шинэ стратеги туршиж үзэх, эсвэл галт тэргэнд хурдан нэг тоглолт хийх газар.",
    "stepsH2": "Гурван алхмаар тоглолт эхлүүлэх",
    "steps": [
      [
        "PokerTH-ийг нээж, «Дотоод / дадлага» горимыг сонгох",
        "Энэ сайтыг нээгээд эхний дэлгэцээс «Дотоод / дадлага» горимыг сонгоно уу. Нэвтрэх, татах шаардлагагүй; сайтыг нэг удаа нээсний дараа энэ горим холболтгүйгээр ч ажиллана."
      ],
      [
        "Ширээгээ тохируулах",
        "Компьютерийн 9 хүртэл өрсөлдөгч, эхлэлийн стек, блайнд хэр хурдан өсөх болон тоглолтын хурдыг сонгох эсвэл бэлэн форматаас эхлэнэ үү. Ботуудын хүндрэлийг мөн тэр цонхонд сонгоно."
      ],
      [
        "Тоглолтоо эхлүүлэх",
        "«Эхлэх» товчийг дарна уу: хоосон суудлуудыг компьютерийн тоглогчид дүүргэж, хөзөр тараагдана. Тоглолт нэг тоглогч бүх чипийг эзэмших хүртэл үргэлжилнэ."
      ]
    ],
    "levelsH2": "Хүндрэлийн дөрвөн түвшин",
    "levels": [
      [
        "Хялбар",
        "Гараа буруу үнэлдэг, ховор блөф хийдэг ботууд: анхны тоглолтод тохирох өрсөлдөгчид."
      ],
      [
        "Энгийн",
        "Магадлалаа сайн тооцоолж, стек нь богиносоход зөв тоглодог найдвартай өрсөлдөгчид."
      ],
      [
        "Хэцүү",
        "Хамгийн хүчтэй ботууд: гарыг нарийн уншдаг, богино стекээр хурц тоглодог, илүү олон блөф хийдэг."
      ],
      [
        "Холимог",
        "Олон янзын ширээ, анхдагч тохиргоо: дунджаар арав тутмаас гурав нь хялбар, тав нь энгийн, хоёр нь хэцүү бот."
      ]
    ],
    "brainH2": "Ботууд хэрхэн боддог вэ",
    "brainP": "Бот бүр үлдсэн хөзрүүдийг олон дахин тарааж, банкинд үлдсэн тоглогчдын тоог харгалзан гараа хожих бодит магадлалаа тооцоолдог. Эрт байрлалд илүү хатуу тоглож, хожуу байрлалаас хулгай хийдэг, флопоос өмнө өсгөсний дараа үргэлжлүүлэх бооцоо (c-bet) тавьдаг, хүчтэй дро-оор хагас блөф хийдэг бөгөөд энгийн түвшнээс дээш стек нь богиносоход зөвхөн All-In эсвэл Fold тоглолт руу шилждэг.",
    "stylesH2": "Тоглох таван хэв маяг",
    "stylesP": "Хүндрэл нь бот тоглоомыг хэр сайн уншихыг, хэв маяг нь хэрхэн тоглохыг тодорхойлно. Шинэ ширээ бүр эдгээрийг холино:",
    "styles": [
      [
        "Рок (Rock)",
        "маш хатуу, болгоомжтой, цөөн банкинд орж, ховор блөф хийдэг."
      ],
      [
        "Тайт-агрессив (TAG)",
        "сайн гар сонгож, түүгээрээ хүчтэй бооцоо тавьдаг."
      ],
      [
        "Лүүз-агрессив (LAG)",
        "олон гар тоглож, танд дарамт учруулдаг."
      ],
      [
        "Коллинг стейшн (Calling station)",
        "хэт олон удаа Call хийж, ховор Raise хийдэг."
      ],
      [
        "Маньяк (Maniac)",
        "тасралтгүй Raise, блөф хийдэг."
      ]
    ],
    "formatsH2": "Жинхэнэ форматуудаар дадлага хийх",
    "formatsP": "Бэлэн тохиргоогоор Тайван, Энгийн эсвэл Хурдан тоглолт эхлүүлэх, эсвэл pokerth.net-ийн тэмцээний нөхцөлд дадлага хийх боломжтой: Ranking-ийн албан ёсны хурд, We Cup болон хугацаанд суурилсан блайндтай BBC. Өөрийн тохиргоог өөрийн формат болгон хадгалж болно.",
    "trophiesH2": "Цом ба статистик",
    "trophiesP": "Дадлагын горим өөрийн гэсэн ахиц дэвшилтэй: зургаан ангиллын гуч гаруй цом — тоглосон гар, хожсон тоглолт, дараалсан ялалт, хэцүү есөн ботын эсрэг ялалт, блөф, мөн хэдэн нууц. Ботын эсрэг статистик таны онлайн тоглолтоос тусдаа хадгалагдах бөгөөд pokerth.net бүртгэлээр нэвтрэхэд цомууд тань бусад төхөөрөмж рүү тань дагаж очно.",
    "learnH2": "Суралцах хамгийн сайн газар",
    "learnP": "Вэб клиентийн бүх туслах хэрэгсэл энд дарамтгүй ажиллана: хөзөр нээгдэх тусам хожих магадлалыг тань харуулах «Боломж» таб, гарын хүчний үзүүлэлт, урьдчилан сонгосон үйлдлүүд, гарын товчлол. Бэлэн болсон гэж санагдвал яг ийм ширээ pokerth.net дээр жинхэнэ тоглогчидтой таныг хүлээж байна.",
    "offlineH2": "Офлайн, бүх төхөөрөмж дээр",
    "offlineP": "PokerTH бол вэб програм: iPhone, Android, Windows, macOS, Linux дээр хөтчөөр ажилладаг бөгөөд програм шиг үндсэн дэлгэцэд нэмж болно. Нэг удаа нээсний дараа дадлагын горимд ямар ч холболт хэрэггүй — нислэгийн горимд, метронд эсвэл дохиогүй хаана ч.",
    "faqH2": "Асуулт",
    "faq": [
      [
        "Компьютертэй үнэгүй покер тоглож болох уу?",
        "Тийм. PokerTH бол сурталчилгаагүй, програм доторх худалдан авалтгүй, үнэгүй, нээлттэй эхийн програм хангамж. Чип бол зөвхөн тоглоомын мөнгө."
      ],
      [
        "Бүртгэл эсвэл холболт хэрэгтэй юу?",
        "Үгүй. Дадлагын горимд бүртгэл хэрэггүй бөгөөд сайтыг нэг удаа нээсний дараа холболтгүйгээр ажиллана."
      ],
      [
        "Компьютерийн хэдэн өрсөлдөгчтэй тоглож болох вэ?",
        "9 хүртэл, 10 тоглогчтой дүүрэн ширээгээр, эсвэл хедз-ап тоглохоор ганцхантай нь."
      ],
      [
        "Ботууд сайн уу?",
        "Энэ нь танаас шалтгаална: хялбар ботууд алдаа гаргадаг, хэцүү ботууд магадлалаа нарийн тооцоолж илүү их блөф хийдэг, холимог ширээ гурван түвшнийг таван хэв маягтай хослуулдаг."
      ],
      [
        "Найзууд болон ботуудтай нэг ширээнд тоглож болох уу?",
        "Тийм. Та өөрийн PokerTH сервер дээр, LAN эсвэл интернетэд ширээ нээх үед хүлээлгийн өрөө хоосон суудлуудыг компьютерийн тоглогчдоор дүүргэж чадна."
      ]
    ]
  },
  mr: {
    "title": "संगणकाविरुद्ध पोकर खेळा — मोफत, ऑफलाइन | PokerTH",
    "desc": "संगणकाविरुद्ध मोफत Texas Hold’em: तुमच्या टेबलवर 9 पर्यंत बॉट्स, सोप्यापासून कठीणपर्यंत. खातं नाही, पैसे नाहीत, आणि फोन व PC वर ऑफलाइनही चालतं.",
    "ldHeadline": "संगणकाविरुद्ध Texas Hold’em पोकर खेळा, मोफत आणि ऑफलाइन",
    "ldDesc": "PokerTH वेब क्लायंटचा सराव मोड: अडचणीच्या पातळ्या, खेळण्याच्या शैली आणि ट्रॉफीजसह संगणक प्रतिस्पर्ध्यांविरुद्ध Texas Hold’em.",
    "h1": "संगणकाविरुद्ध पोकर खेळा, मोफत आणि ऑफलाइन",
    "lead": "PokerTH चा सराव मोड थेट तुमच्या ब्राउझरमध्ये संगणक प्रतिस्पर्ध्यांविरुद्ध पूर्ण Texas Hold’em टूर्नामेंट्स वाटतो. खातं नाही, साइट एकदा उघडल्यावर कनेक्शन नाही, आणि पणाला काहीच नाही: खेळ शिकण्यासाठी, नवी रणनीती आजमावण्यासाठी किंवा ट्रेनमध्ये झटपट एक गेम खेळण्यासाठी हीच योग्य जागा.",
    "stepsH2": "तीन पायऱ्यांत गेम सुरू करा",
    "steps": [
      [
        "PokerTH उघडा आणि लोकल / सराव निवडा",
        "ही साइट उघडा आणि पहिल्या स्क्रीनवर लोकल / सराव निवडा. लॉग इन नाही, डाउनलोड नाही; साइट एकदा उघडल्यावर हा मोड कनेक्शनशिवायही चालतो."
      ],
      [
        "तुमचं टेबल तयार करा",
        "9 पर्यंत संगणक प्रतिस्पर्धी, सुरुवातीचा स्टॅक, ब्लाइंड्स किती वेगाने वाढतात आणि खेळाचा वेग निवडा, किंवा तयार फॉरमॅटपासून सुरुवात करा. बॉट्सची अडचण त्याच विंडोमध्ये निवडा."
      ],
      [
        "गेम सुरू करा",
        "“सुरू करा” दाबा: रिकाम्या सीट्स संगणक खेळाडूंनी भरतात आणि पत्ते वाटले जातात. एका खेळाडूकडे सगळ्या चिप्स येईपर्यंत गेम चालू राहतो."
      ]
    ],
    "levelsH2": "अडचणीच्या चार पातळ्या",
    "levels": [
      [
        "सोपी",
        "आपल्या हँड्सचा चुकीचा अंदाज घेणारे आणि क्वचितच ब्लफ करणारे बॉट्स: पहिल्या गेमसाठी योग्य प्रतिस्पर्धी."
      ],
      [
        "सामान्य",
        "आपल्या शक्यता नीट ओळखणारे आणि स्टॅक कमी झाल्यावर अचूक खेळणारे भक्कम प्रतिस्पर्धी."
      ],
      [
        "कठीण",
        "सर्वात ताकदवान बॉट्स: अचूक हँड रीडिंग, शॉर्ट स्टॅकवर धारदार खेळ आणि जास्त ब्लफ."
      ],
      [
        "मिश्र",
        "वैविध्यपूर्ण टेबल, डीफॉल्ट पर्याय: दर दहामागे सरासरी तीन सोपे बॉट्स, पाच सामान्य आणि दोन कठीण."
      ]
    ],
    "brainH2": "बॉट्स कसा विचार करतात",
    "brainP": "प्रत्येक बॉट उरलेले पत्ते अनेक वेळा वाटून पाहतो आणि पॉटमध्ये अजून किती खेळाडू आहेत त्यानुसार हँड जिंकण्याची आपली खरी शक्यता काढतो. तो सुरुवातीच्या पोझिशनमध्ये जास्त टाइट खेळतो आणि शेवटच्या पोझिशनमधून स्टील करतो, फ्लॉपआधी रेझ केल्यानंतर कंटिन्युएशन बेट लावतो, मजबूत ड्रॉसोबत सेमी-ब्लफ करतो आणि, सामान्य पातळीपासून पुढे, स्टॅक कमी झाल्यावर All-In किंवा Fold खेळाकडे वळतो.",
    "stylesH2": "खेळण्याच्या पाच शैली",
    "stylesP": "बॉट खेळ किती चांगला वाचतो ते अडचण ठरवते; तो कसा खेळतो ते त्याची शैली ठरवते. प्रत्येक नव्या टेबलवर यांचं मिश्रण असतं:",
    "styles": [
      [
        "रॉक (Rock)",
        "खूप टाइट आणि सावध, मोजक्याच पॉट्समध्ये उतरतो आणि क्वचितच ब्लफ करतो."
      ],
      [
        "TAG (टाइट-ॲग्रेसिव्ह)",
        "चांगले हँड्स निवडतो आणि त्यांवर जोरदार बेट लावतो."
      ],
      [
        "LAG (लूज-ॲग्रेसिव्ह)",
        "बरेच हँड्स खेळतो आणि तुमच्यावर दबाव आणतो."
      ],
      [
        "कॉलिंग स्टेशन",
        "खूप जास्त वेळा Call करतो आणि क्वचितच Raise करतो."
      ],
      [
        "मॅनियाक (Maniac)",
        "सतत Raise आणि ब्लफ करतो."
      ]
    ],
    "formatsH2": "खऱ्या फॉरमॅट्समध्ये सराव करा",
    "formatsP": "तयार सेटिंग्जमुळे तुम्ही “शांत”, “सामान्य” किंवा “वेगवान” गेम सुरू करू शकता, किंवा pokerth.net स्पर्धांच्या परिस्थितीत सराव करू शकता: अधिकृत “रँकिंग” वेग, We Cup आणि वेळेनुसार वाढणाऱ्या ब्लाइंड्सचा BBC. तुमची स्वतःची सेटिंग्ज तुमचा स्वतःचा फॉरमॅट म्हणून सेव्ह करता येतात.",
    "trophiesH2": "ट्रॉफीज आणि आकडेवारी",
    "trophiesP": "सराव मोडची स्वतःची प्रगती आहे: सहा प्रकारांत तीसहून अधिक ट्रॉफीज — खेळलेले हँड्स, जिंकलेले गेम्स, सलग विजय, नऊ कठीण बॉट्सविरुद्ध एक विजय, ब्लफ आणि काही गुपितं. बॉट्सविरुद्धची आकडेवारी तुमच्या ऑनलाइन गेम्सपासून वेगळी ठेवली जाते, आणि pokerth.net खात्याने लॉग इन केल्यावर तुमच्या ट्रॉफीज तुमच्या इतर डिव्हाइसेसवरही तुमच्यासोबत येतात.",
    "learnH2": "शिकण्यासाठी सर्वोत्तम जागा",
    "learnP": "वेब क्लायंटची प्रत्येक मदत इथे कोणत्याही दबावाशिवाय चालते: कार्ड्स येतात तसं जिंकण्याची शक्यता दाखवणारा ऑड्स टॅब, हँडच्या ताकदीचा निर्देशक, आधीच निवडलेल्या खेळी आणि कीबोर्ड शॉर्टकट्स. तुम्हाला तयार वाटलं की तेच टेबल pokerth.net वर खऱ्या खेळाडूंविरुद्ध तुमची वाट पाहत आहे.",
    "offlineH2": "ऑफलाइन, प्रत्येक डिव्हाइसवर",
    "offlineP": "PokerTH हे वेब ॲप आहे: ते iPhone, Android, Windows, macOS आणि Linux वर ब्राउझरमध्ये चालतं, आणि ॲपसारखं होम स्क्रीनवर जोडता येतं. एकदा उघडल्यावर सराव मोडला कोणत्याही कनेक्शनची गरज नसते — एअरप्लेन मोडमध्ये, मेट्रोत किंवा सिग्नल नसलेल्या कुठल्याही ठिकाणी.",
    "faqH2": "प्रश्न",
    "faq": [
      [
        "संगणकाविरुद्ध मोफत पोकर खेळता येतं का?",
        "हो. PokerTH हे मोफत आणि ओपन-सोर्स सॉफ्टवेअर आहे; जाहिराती नाहीत आणि ॲपमधील खरेदी नाही. चिप्स फक्त खेळातले पैसे आहेत."
      ],
      [
        "मला खातं किंवा कनेक्शन लागतं का?",
        "नाही. सराव मोडला खातं लागत नाही, आणि साइट एकदा उघडल्यावर तो कनेक्शनशिवाय चालतो."
      ],
      [
        "किती संगणक प्रतिस्पर्ध्यांविरुद्ध खेळता येतं?",
        "10 खेळाडूंच्या पूर्ण टेबलसाठी 9 पर्यंत, किंवा हेड्स-अपसाठी फक्त एक."
      ],
      [
        "बॉट्स चांगले खेळतात का?",
        "ते तुमच्यावर अवलंबून आहे: सोपे बॉट्स चुका करतात, कठीण बॉट्स आपल्या शक्यता अचूक ओळखतात आणि जास्त ब्लफ करतात, आणि मिश्र टेबल तिन्ही पातळ्या खेळण्याच्या पाच शैलींसोबत मिसळतो."
      ],
      [
        "मित्र आणि बॉट्ससोबत एकाच टेबलवर खेळता येतं का?",
        "हो. तुमच्या स्वतःच्या PokerTH सर्व्हरवर, LAN वर किंवा इंटरनेटवर टेबल होस्ट केल्यावर, वेटिंग रूम रिकाम्या सीट्स संगणक खेळाडूंनी भरू शकते."
      ]
    ]
  },
  ms: {
    "title": "Main Poker Lawan Komputer — Percuma, Luar Talian | PokerTH",
    "desc": "Texas Hold’em percuma menentang lawan komputer, sehingga 9 bot di meja anda, dari mudah hingga sukar. Tanpa akaun, tanpa wang, berfungsi luar talian di telefon dan PC.",
    "ldHeadline": "Main poker Texas Hold’em menentang komputer, percuma dan luar talian",
    "ldDesc": "Mod latihan klien web PokerTH: Texas Hold’em menentang lawan komputer, dengan tahap kesukaran, gaya permainan dan trofi.",
    "h1": "Main poker menentang komputer, percuma dan luar talian",
    "lead": "Mod latihan PokerTH mengagihkan kejohanan Texas Hold’em penuh menentang lawan komputer, terus dalam pelayar anda. Tanpa akaun, tanpa sambungan selepas laman dibuka sekali, dan tiada apa-apa dipertaruhkan: tempat untuk belajar permainan, mencuba strategi baharu atau bermain sekejap di dalam kereta api.",
    "stepsH2": "Mulakan permainan dalam tiga langkah",
    "steps": [
      [
        "Buka PokerTH dan pilih Lokal / latihan",
        "Buka laman ini dan pilih Lokal / latihan di skrin pertama. Tiada log masuk dan tiada muat turun; selepas laman dibuka sekali, mod ini juga berfungsi tanpa sambungan."
      ],
      [
        "Sediakan meja anda",
        "Pilih sehingga 9 lawan komputer, stack permulaan, kelajuan blind naik dan kelajuan permainan, atau mulakan daripada format sedia ada. Pilih tahap kesukaran bot dalam tetingkap yang sama."
      ],
      [
        "Mulakan permainan",
        "Tekan Mulai: tempat duduk kosong diisi pemain komputer dan kad diagihkan. Permainan berterusan sehingga seorang pemain memegang semua cip."
      ]
    ],
    "levelsH2": "Empat tahap kesukaran",
    "levels": [
      [
        "Mudah",
        "Bot yang tersilap menilai tangan mereka dan jarang bluff: lawan yang sesuai untuk permainan pertama."
      ],
      [
        "Normal",
        "Lawan yang mantap, membaca peluang dengan baik dan bermain dengan betul apabila stack mereka semakin pendek."
      ],
      [
        "Sulit",
        "Bot paling kuat: membaca tangan dengan tepat, tajam bermain dengan short stack dan lebih banyak bluff."
      ],
      [
        "Campuran",
        "Meja yang pelbagai, pilihan lalai: secara purata tiga bot Mudah, lima Normal dan dua Sulit bagi setiap sepuluh."
      ]
    ],
    "brainH2": "Cara bot berfikir",
    "brainP": "Setiap bot mengira peluang sebenar untuk memenangi tangan itu dengan mengagihkan baki kad berkali-kali, berdasarkan bilangan pemain yang masih dalam pot. Ia bermain lebih ketat di posisi awal dan mencuri dari posisi lewat, membuat continuation bet selepas Raise sebelum flop, melakukan semi-bluff dengan draw yang kuat dan, dari tahap Normal ke atas, beralih kepada permainan all-in atau Fold apabila stack-nya semakin pendek.",
    "stylesH2": "Lima gaya permainan",
    "stylesP": "Tahap kesukaran menentukan sejauh mana bot membaca permainan; gayanya menentukan cara ia bermain. Setiap meja baharu mencampurkan:",
    "styles": [
      [
        "Rock",
        "sangat ketat dan berhati-hati, jarang masuk pot dan jarang bluff."
      ],
      [
        "Tight-agresif (TAG)",
        "memilih tangan yang baik dan bertaruh besar dengannya."
      ],
      [
        "Loose-agresif (LAG)",
        "bermain banyak tangan dan memberi tekanan kepada anda."
      ],
      [
        "Calling station",
        "terlalu kerap Call dan jarang Raise."
      ],
      [
        "Maniac",
        "sentiasa Raise dan bluff."
      ]
    ],
    "formatsH2": "Berlatih format sebenar",
    "formatsP": "Tetapan sedia ada membolehkan anda memulakan permainan Santai, Normal atau Cepat, atau berlatih dalam keadaan pertandingan pokerth.net: tempo rasmi Ranking, We Cup dan BBC dengan blind berasaskan masanya. Tetapan anda sendiri boleh disimpan sebagai format anda sendiri.",
    "trophiesH2": "Trofi dan statistik",
    "trophiesP": "Mod latihan mempunyai kemajuannya sendiri: lebih daripada tiga puluh trofi dalam enam kategori — tangan dimainkan, permainan dimenangi, kemenangan berturut-turut, kemenangan menentang sembilan bot Sulit, bluff dan beberapa rahsia. Statistik menentang bot disimpan berasingan daripada permainan dalam talian anda, dan apabila anda log masuk dengan akaun pokerth.net, trofi anda mengikut anda ke peranti anda yang lain.",
    "learnH2": "Tempat terbaik untuk belajar",
    "learnP": "Setiap bantuan klien web berfungsi di sini tanpa tekanan: tab Peluang dengan peluang anda untuk menang semasa kad keluar, paparan kekuatan tangan, tindakan pra-pilih dan pintasan papan kekunci. Apabila anda rasa sudah bersedia, meja yang sama menanti anda di pokerth.net menentang pemain sebenar.",
    "offlineH2": "Luar talian, di setiap peranti",
    "offlineP": "PokerTH ialah aplikasi web: ia berjalan dalam pelayar di iPhone, Android, Windows, macOS dan Linux, dan boleh ditambah ke skrin utama seperti aplikasi. Selepas dibuka sekali, mod latihan langsung tidak memerlukan sambungan — dalam mod pesawat, di dalam MRT atau di mana-mana tanpa isyarat.",
    "faqH2": "Soalan",
    "faq": [
      [
        "Bolehkah saya main poker menentang komputer secara percuma?",
        "Ya. PokerTH ialah perisian percuma dan sumber terbuka, tanpa iklan dan tanpa pembelian dalam aplikasi. Cip hanyalah wang permainan."
      ],
      [
        "Adakah saya perlukan akaun atau sambungan?",
        "Tidak. Mod latihan tidak memerlukan akaun, dan selepas laman dibuka sekali, ia berfungsi tanpa sambungan."
      ],
      [
        "Berapa ramai lawan komputer yang boleh saya tentang?",
        "Sehingga 9, untuk meja penuh 10 pemain, atau seorang sahaja untuk bermain head-to-head."
      ],
      [
        "Adakah bot itu bagus?",
        "Terpulang kepada anda: bot Mudah membuat kesilapan, bot Sulit membaca peluang dengan tepat dan lebih kerap bluff, dan meja Campuran menggabungkan ketiga-tiga tahap dengan lima gaya permainan."
      ],
      [
        "Bolehkah saya bermain dengan rakan dan bot di meja yang sama?",
        "Ya. Apabila anda menganjurkan meja di pelayan PokerTH anda sendiri, di LAN atau di internet, bilik menunggu boleh mengisi tempat duduk kosong dengan pemain komputer."
      ]
    ]
  },
  my: {
    "title": "ကွန်ပျူတာနှင့် ပိုကာ ကစားရန် — အခမဲ့၊ အော့ဖ်လိုင်း | PokerTH",
    "desc": "ကွန်ပျူတာပြိုင်ဘက်များနှင့် အခမဲ့ Texas Hold’em၊ သင့်စားပွဲတွင် ဘော့ ၉ ခုအထိ၊ လွယ်မှ ခက်အထိ။ အကောင့်မလို၊ ငွေမလို၊ ဖုန်းနှင့် PC တွင် အော့ဖ်လိုင်း ကစားနိုင်သည်။",
    "ldHeadline": "ကွန်ပျူတာနှင့် Texas Hold’em ပိုကာ ကစားပါ၊ အခမဲ့နှင့် အော့ဖ်လိုင်း",
    "ldDesc": "PokerTH ဝဘ်ကလိုင်းယင့်၏ လေ့ကျင့်ရေးမုဒ်: ကွန်ပျူတာပြိုင်ဘက်များနှင့် Texas Hold’em၊ အခက်အခဲအဆင့်များ၊ ကစားပုံစံများနှင့် ဆုတံဆိပ်များ ပါဝင်သည်။",
    "h1": "ကွန်ပျူတာနှင့် ပိုကာ ကစားပါ၊ အခမဲ့နှင့် အော့ဖ်လိုင်း",
    "lead": "PokerTH ၏ လေ့ကျင့်ရေးမုဒ်သည် ကွန်ပျူတာပြိုင်ဘက်များနှင့် Texas Hold’em ပြိုင်ပွဲအပြည့်အစုံကို သင့်ဘရောက်ဇာထဲတွင် တိုက်ရိုက် ဖဲဝေပေးသည်။ အကောင့်မလို၊ ဆိုက်ကို တစ်ကြိမ် ဖွင့်ပြီးနောက် ချိတ်ဆက်မှုမလို၊ လောင်းကြေးလည်း မရှိပါ: ဂိမ်းကို လေ့လာရန်၊ မဟာဗျူဟာအသစ် စမ်းကြည့်ရန် သို့မဟုတ် ရထားပေါ်တွင် အမြန်ဂိမ်းတစ်ပွဲ ကစားရန် နေရာဖြစ်သည်။",
    "stepsH2": "အဆင့် သုံးဆင့်ဖြင့် ဂိမ်းစတင်ပါ",
    "steps": [
      [
        "PokerTH ကိုဖွင့်ပြီး «ဒေသတွင်း / လေ့ကျင့်ရေး» ကို ရွေးပါ",
        "ဤဆိုက်ကို ဖွင့်ပြီး ပထမမျက်နှာပြင်တွင် «ဒေသတွင်း / လေ့ကျင့်ရေး» ကို ရွေးပါ။ လော့ဂ်အင် မလို၊ ဒေါင်းလုဒ် မလိုပါ၊ ဆိုက်ကို တစ်ကြိမ် ဖွင့်ပြီးနောက် ဤမုဒ်သည် ချိတ်ဆက်မှုမရှိဘဲလည်း အလုပ်လုပ်သည်။"
      ],
      [
        "သင့်စားပွဲကို ပြင်ဆင်ပါ",
        "ကွန်ပျူတာပြိုင်ဘက် ၉ ဦးအထိ၊ အစ ချစ်ပ်ပမာဏ၊ ဘလိုင်းများ မည်မျှမြန်မြန် တိုးမည်နှင့် ဂိမ်းအမြန်နှုန်းကို ရွေးပါ သို့မဟုတ် အသင့်ပြင်ထားသော ဖော်မတ်တစ်ခုမှ စတင်ပါ။ ဘော့များ၏ အခက်အခဲကို တူညီသော ဝင်းဒိုးထဲတွင် ရွေးပါ။"
      ],
      [
        "ဂိမ်းကို စတင်ပါ",
        "«စတင်ရန်» ကို နှိပ်ပါ: လွတ်နေသော ထိုင်ခုံများကို ကွန်ပျူတာကစားသမားများဖြင့် ဖြည့်ပြီး ဖဲများ ဝေသည်။ ကစားသမားတစ်ဦးက ချစ်ပ်အားလုံး ကိုင်သည်အထိ ဂိမ်း ဆက်လက်ကစားသည်။"
      ]
    ],
    "levelsH2": "အခက်အခဲ အဆင့် လေးဆင့်",
    "levels": [
      [
        "လွယ်ကူ",
        "မိမိလက်ဖဲကို မှားယွင်းစွာ အကဲဖြတ်ပြီး ဘလပ် ခဏခဏ မလုပ်သော ဘော့များ: ပထမဆုံးဂိမ်းအတွက် သင့်တော်သော ပြိုင်ဘက်များ။"
      ],
      [
        "ပုံမှန်",
        "မိမိနိုင်ခြေကို ကောင်းစွာ ဖတ်ပြီး ချစ်ပ်နည်းလာသောအခါ မှန်ကန်စွာ ကစားသော ခိုင်မာသည့် ပြိုင်ဘက်များ။"
      ],
      [
        "ခက်ခဲ",
        "အအားကောင်းဆုံး ဘော့များ: လက်ဖဲကို တိကျစွာ ဖတ်ခြင်း၊ ချစ်ပ်နည်းချိန်တွင် ထက်မြက်သော ကစားပုံနှင့် ဘလပ် ပိုများခြင်း။"
      ],
      [
        "ရောနှော",
        "မတူကွဲပြားသော စားပွဲ၊ မူလသတ်မှတ်ချက်: ပျမ်းမျှအားဖြင့် ဆယ်ခုတိုင်းတွင် လွယ်သော ဘော့ သုံးခု၊ ပုံမှန် ငါးခုနှင့် ခက်သော နှစ်ခု။"
      ]
    ],
    "brainH2": "ဘော့များ မည်သို့ စဉ်းစားသနည်း",
    "brainP": "ဘော့တိုင်းသည် ကျန်ရှိသော ဖဲများကို အကြိမ်များစွာ ဝေကြည့်ခြင်းဖြင့် ပေါ့တ်ထဲတွင် ကျန်နေသေးသော ကစားသမားအရေအတွက်နှင့် ယှဉ်၍ လက်ကို နိုင်မည့် အမှန်တကယ် နိုင်ခြေကို တွက်ချက်သည်။ အစောပိုင်း နေရာတွင် ပိုတင်းကျပ်စွာ ကစားပြီး နောက်ပိုင်း နေရာမှ ခိုးယူသည်၊ flop မတိုင်မီ Raise လုပ်ပြီးနောက် continuation bet ထိုးသည်၊ အားကောင်းသော draw များဖြင့် semi-bluff လုပ်သည်၊ ပုံမှန်အဆင့်မှ အထက်တွင် ချစ်ပ်နည်းလာသောအခါ All-In သို့မဟုတ် Fold ကစားပုံသို့ ပြောင်းသည်။",
    "stylesH2": "ကစားပုံစံ ငါးမျိုး",
    "stylesP": "အခက်အခဲက ဘော့တစ်ခု ဂိမ်းကို မည်မျှ ကောင်းစွာ ဖတ်သည်ကို သတ်မှတ်ပြီး ၎င်း၏ပုံစံက မည်သို့ ကစားသည်ကို သတ်မှတ်သည်။ စားပွဲအသစ်တိုင်းတွင် ရောနှောပါဝင်သည်:",
    "styles": [
      [
        "Rock",
        "အလွန် တင်းကျပ်ပြီး သတိကြီးသည်၊ ပေါ့တ် အနည်းငယ်သာ ဝင်ပြီး ဘလပ် ခဏခဏ မလုပ်ပါ။"
      ],
      [
        "Tight-aggressive",
        "ကောင်းသော လက်များကို ရွေးပြီး ပြင်းပြင်းထန်ထန် လောင်းသည်။"
      ],
      [
        "Loose-aggressive",
        "လက်များစွာ ကစားပြီး သင့်ကို ဖိအားပေးသည်။"
      ],
      [
        "Calling station",
        "Call အလွန်အကျွံ လုပ်ပြီး Raise ခဏခဏ မလုပ်ပါ။"
      ],
      [
        "Maniac",
        "အဆက်မပြတ် Raise နှင့် ဘလပ် လုပ်သည်။"
      ]
    ],
    "formatsH2": "တကယ့် ဖော်မတ်များကို လေ့ကျင့်ပါ",
    "formatsP": "အသင့်ပြင်ထားသော ဆက်တင်များဖြင့် «အေးဆေး»၊ «ပုံမှန်» သို့မဟုတ် «အမြန်» ဂိမ်းကို စတင်နိုင်သည်၊ သို့မဟုတ် pokerth.net ယှဉ်ပြိုင်မှုများ၏ အခြေအနေအတိုင်း လေ့ကျင့်နိုင်သည်: တရားဝင် «အဆင့်သတ်မှတ်» အရှိန်၊ We Cup နှင့် အချိန်အလိုက် ဘလိုင်းများပါသော BBC။ သင့်ကိုယ်ပိုင် ဆက်တင်များကို ကိုယ်ပိုင်ဖော်မတ်အဖြစ် သိမ်းဆည်းနိုင်သည်။",
    "trophiesH2": "ဆုတံဆိပ်များနှင့် စာရင်းအင်း",
    "trophiesP": "လေ့ကျင့်ရေးမုဒ်တွင် ကိုယ်ပိုင် တိုးတက်မှုစနစ် ရှိသည်: အမျိုးအစား ခြောက်မျိုးတွင် ဆုတံဆိပ် သုံးဆယ်ကျော် — ကစားခဲ့သော လက်များ၊ နိုင်ခဲ့သော ဂိမ်းများ၊ ဆက်တိုက်အနိုင်ရမှုများ၊ ခက်ခဲသော ဘော့ ကိုးခုကို အနိုင်ရခြင်း၊ ဘလပ်များနှင့် လျှို့ဝှက်ချက် အချို့။ ဘော့များနှင့် ကစားသော စာရင်းအင်းကို သင့်အွန်လိုင်းဂိမ်းများနှင့် သီးခြား ထားရှိပြီး pokerth.net အကောင့်ဖြင့် ဝင်ရောက်သောအခါ သင့်ဆုတံဆိပ်များသည် သင့်အခြားစက်များသို့ လိုက်ပါလာသည်။",
    "learnH2": "လေ့လာရန် အကောင်းဆုံးနေရာ",
    "learnP": "ဝဘ်ကလိုင်းယင့်၏ အကူအညီတိုင်းသည် ဤနေရာတွင် ဖိအားမရှိဘဲ အလုပ်လုပ်သည်: ဖဲများ ထွက်လာသည်နှင့်အမျှ သင့်နိုင်ခြေကို ပြသော «ဖြစ်နိုင်ခြေ» တက်ဘ်၊ လက်ဖဲ အားကောင်းမှု ပြသချက်၊ ကြိုတင်ရွေးထားသော လုပ်ဆောင်ချက်များနှင့် ကီးဘုတ် ဖြတ်လမ်းခလုတ်များ။ အသင့်ဖြစ်ပြီဟု ခံစားရသောအခါ တူညီသော စားပွဲက pokerth.net တွင် ကစားသမားအစစ်များနှင့်အတူ သင့်ကို စောင့်နေသည်။",
    "offlineH2": "အော့ဖ်လိုင်း၊ စက်တိုင်းတွင်",
    "offlineP": "PokerTH သည် ဝဘ်အက်ပ်တစ်ခု ဖြစ်သည်: iPhone၊ Android၊ Windows၊ macOS နှင့် Linux ပေါ်ရှိ ဘရောက်ဇာတွင် အလုပ်လုပ်ပြီး အက်ပ်တစ်ခုကဲ့သို့ ပင်မမျက်နှာပြင်သို့ ထည့်နိုင်သည်။ တစ်ကြိမ် ဖွင့်ပြီးသည်နှင့် လေ့ကျင့်ရေးမုဒ်သည် ချိတ်ဆက်မှု လုံးဝ မလိုပါ — လေယာဉ်မုဒ်တွင်၊ မြေအောက်ရထားပေါ်တွင် သို့မဟုတ် လိုင်းမမိသော မည်သည့်နေရာတွင်မဆို။",
    "faqH2": "မေးခွန်းများ",
    "faq": [
      [
        "ကွန်ပျူတာနှင့် ပိုကာကို အခမဲ့ ကစားနိုင်သလား။",
        "ကစားနိုင်ပါသည်။ PokerTH သည် ကြော်ငြာမပါ၊ အက်ပ်အတွင်း ဝယ်ယူမှုမရှိသော အခမဲ့ ရင်းမြစ်ဖွင့် ဆော့ဖ်ဝဲဖြစ်သည်။ ချစ်ပ်များသည် ကစားငွေသာ ဖြစ်သည်။"
      ],
      [
        "အကောင့် သို့မဟုတ် ချိတ်ဆက်မှု လိုအပ်သလား။",
        "မလိုပါ။ လေ့ကျင့်ရေးမုဒ်သည် အကောင့်မလိုဘဲ ဆိုက်ကို တစ်ကြိမ် ဖွင့်ပြီးနောက် ချိတ်ဆက်မှုမရှိဘဲ အလုပ်လုပ်သည်။"
      ],
      [
        "ကွန်ပျူတာပြိုင်ဘက် မည်မျှနှင့် ကစားနိုင်သနည်း။",
        "၉ ဦးအထိ ကစားနိုင်ပြီး ကစားသမား ၁၀ ဦး ပြည့်သော စားပွဲ ဖြစ်စေသည်၊ သို့မဟုတ် heads-up အတွက် တစ်ဦးတည်းနှင့်လည်း ကစားနိုင်သည်။"
      ],
      [
        "ဘော့များ တော်သလား။",
        "သင့်အပေါ် မူတည်သည်: လွယ်သော ဘော့များ အမှားလုပ်တတ်ပြီး ခက်သော ဘော့များသည် မိမိနိုင်ခြေကို တိကျစွာ ဖတ်ကာ ဘလပ် ပိုလုပ်သည်၊ ရောနှောစားပွဲသည် အဆင့် သုံးဆင့်ကို ကစားပုံစံ ငါးမျိုးနှင့် ပေါင်းစပ်ထားသည်။"
      ],
      [
        "သူငယ်ချင်းများနှင့် ဘော့များကို စားပွဲတစ်ခုတည်းတွင် ကစားနိုင်သလား။",
        "ကစားနိုင်ပါသည်။ သင့်ကိုယ်ပိုင် PokerTH ဆာဗာပေါ်တွင်၊ LAN ပေါ်တွင် သို့မဟုတ် အင်တာနက်ပေါ်တွင် စားပွဲတစ်ခု ဖွင့်သောအခါ စောင့်ဆိုင်းခန်းက လွတ်နေသော ထိုင်ခုံများကို ကွန်ပျူတာကစားသမားများဖြင့် ဖြည့်ပေးနိုင်သည်။"
      ]
    ]
  },
  nb: {
    "title": "Spill poker mot datamaskinen — gratis, offline | PokerTH",
    "desc": "Gratis Texas Hold’em mot datamotstandere, opptil 9 boter ved bordet ditt, fra lette til vanskelige. Ingen konto, ingen penger, og det fungerer offline på mobil og PC.",
    "ldHeadline": "Spill Texas Hold’em-poker mot datamaskinen, gratis og offline",
    "ldDesc": "Treningsmodusen i PokerTHs nettklient: Texas Hold’em mot datamotstandere, med vanskelighetsgrader, spillestiler og trofeer.",
    "h1": "Spill poker mot datamaskinen, gratis og offline",
    "lead": "Treningsmodusen i PokerTH deler ut hele Texas Hold’em-turneringer mot datamotstandere, rett i nettleseren din. Ingen konto, ingen forbindelse når nettstedet først er åpnet, og ingenting står på spill: stedet for å lære spillet, prøve en ny strategi eller ta et raskt spill på toget.",
    "stepsH2": "Start et spill i tre trinn",
    "steps": [
      [
        "Åpne PokerTH og velg Lokal / trening",
        "Åpne dette nettstedet og velg Lokal / trening på det første skjermbildet. Det er ingen innlogging og ingen nedlasting; når nettstedet først er åpnet, fungerer modusen også uten forbindelse."
      ],
      [
        "Sett opp bordet ditt",
        "Velg opptil 9 datamotstandere, startstacken, hvor raskt blindene stiger og spillhastigheten, eller start fra et ferdig format. Velg botenes vanskelighetsgrad i samme vindu."
      ],
      [
        "Start spillet",
        "Trykk på Start: de tomme plassene fylles med dataspillere, og kortene deles ut. Spillet varer til én spiller sitter med alle sjetongene."
      ]
    ],
    "levelsH2": "Fire vanskelighetsgrader",
    "levels": [
      [
        "Lett",
        "Boter som feilvurderer hendene sine og sjelden bløffer: de rette motstanderne for et første spill."
      ],
      [
        "Normal",
        "Solide motstandere som vurderer sjansene sine godt og spiller riktig når stacken blir kort."
      ],
      [
        "Vanskelig",
        "De sterkeste botene: presis håndlesing, skarpt spill med kort stack og flere bløffer."
      ],
      [
        "Blandet",
        "Et variert bord, standardvalget: i snitt tre lette boter, fem normale og to vanskelige av hver ti."
      ]
    ],
    "brainH2": "Slik tenker botene",
    "brainP": "Hver bot regner ut sin reelle sjanse til å vinne hånden ved å dele ut de gjenværende kortene mange ganger, mot antallet spillere som fortsatt er med i potten. Den spiller strammere i tidlig posisjon og stjeler fra sen posisjon, gjør continuation bets etter å ha høynet før floppen, semi-bløffer med sterke trekninger og går, fra normalt nivå og oppover, over til all-in-eller-fold-spill når stacken blir kort.",
    "stylesH2": "Fem spillestiler",
    "stylesP": "Vanskelighetsgraden avgjør hvor godt en bot leser spillet; stilen avgjør hvordan den spiller. Hvert nytt bord blander:",
    "styles": [
      [
        "Rock",
        "svært stram og forsiktig, går inn i få potter og bløffer sjelden."
      ],
      [
        "Tight-aggressiv",
        "velger gode hender og satser hardt med dem."
      ],
      [
        "Loose-aggressiv",
        "spiller mange hender og legger press på deg."
      ],
      [
        "Calling station",
        "syner altfor ofte og høyner sjelden."
      ],
      [
        "Maniac",
        "høyner og bløffer hele tiden."
      ]
    ],
    "formatsH2": "Øv på de ekte formatene",
    "formatsP": "Ferdige innstillinger lar deg starte et spill i formatet Avslappet, Normal eller Rask, eller øve under forholdene i pokerth.net-konkurransene: det offisielle Ranking-tempoet, We Cup og BBC med sine tidsbaserte blinder. Dine egne innstillinger kan lagres som ditt eget format.",
    "trophiesH2": "Trofeer og statistikk",
    "trophiesP": "Treningsmodusen har sin egen progresjon: mer enn tretti trofeer i seks kategorier — spilte hender, vunne spill, seiersrekker, en seier mot ni vanskelige boter, bløffer og noen hemmeligheter. Statistikken mot botene holdes adskilt fra nettspillene dine, og når du logger inn med en pokerth.net-konto, følger trofeene deg til de andre enhetene dine.",
    "learnH2": "Det beste stedet å lære",
    "learnP": "Alle hjelpemidlene i nettklienten fungerer her uten press: fanen Sjanser med sjansen din for å vinne etter hvert som kortene kommer, visningen av håndstyrke, forhåndsvalgte handlinger og hurtigtaster. Når du føler deg klar, venter det samme bordet på deg på pokerth.net mot ekte spillere.",
    "offlineH2": "Offline, på alle enheter",
    "offlineP": "PokerTH er en nettapp: den kjører i nettleseren på iPhone, Android, Windows, macOS og Linux og kan legges til på startskjermen som en app. Når den først er åpnet, trenger treningsmodusen ingen forbindelse i det hele tatt — i flymodus, på T-banen eller hvor som helst uten dekning.",
    "faqH2": "Spørsmål",
    "faq": [
      [
        "Kan jeg spille poker mot datamaskinen gratis?",
        "Ja. PokerTH er gratis programvare med åpen kildekode, uten reklame og uten kjøp i appen. Sjetongene er bare lekepenger."
      ],
      [
        "Trenger jeg en konto eller en forbindelse?",
        "Nei. Treningsmodusen krever ingen konto, og når nettstedet først er åpnet, fungerer den uten forbindelse."
      ],
      [
        "Hvor mange datamotstandere kan jeg spille mot?",
        "Opptil 9, for et fullt bord med 10 spillere, eller bare én for heads-up."
      ],
      [
        "Er botene gode?",
        "Det bestemmer du: lette boter gjør feil, vanskelige boter vurderer sjansene sine presist og bløffer mer, og det blandede bordet blander de tre nivåene med fem spillestiler."
      ],
      [
        "Kan jeg spille med venner og boter ved samme bord?",
        "Ja. Når du er vert for et bord på din egen PokerTH-server, på et LAN eller på internett, kan venterommet fylle de tomme plassene med dataspillere."
      ]
    ]
  },
  ne: {
    "title": "कम्प्युटरसँग पोकर खेल्नुहोस् — निःशुल्क, अफलाइन | PokerTH",
    "desc": "कम्प्युटर प्रतिद्वन्द्वीविरुद्ध निःशुल्क Texas Hold’em, टेबलमा बढीमा 9 बोट, सजिलोदेखि कठिनसम्म। खाता चाहिँदैन, पैसा लाग्दैन, फोन र PC मा अफलाइन चल्छ।",
    "ldHeadline": "कम्प्युटरसँग Texas Hold’em पोकर खेल्नुहोस्, निःशुल्क र अफलाइन",
    "ldDesc": "PokerTH वेब क्लाइन्टको अभ्यास मोड: कम्प्युटर प्रतिद्वन्द्वीविरुद्ध Texas Hold’em, कठिनाइ स्तर, खेल्ने शैली र ट्रफीसहित।",
    "h1": "कम्प्युटरसँग पोकर खेल्नुहोस्, निःशुल्क र अफलाइन",
    "lead": "PokerTH को अभ्यास मोडले कम्प्युटर प्रतिद्वन्द्वीविरुद्ध पूरा Texas Hold’em प्रतियोगिताहरू सिधै तपाईंको ब्राउजरमा बाँड्छ। खाता चाहिँदैन, साइट एकपटक खोलेपछि जडान चाहिँदैन, र केही पनि दाउमा हुँदैन: खेल सिक्ने, नयाँ रणनीति आजमाउने वा रेलमा छिटो एउटा खेल खेल्ने ठाउँ।",
    "stepsH2": "तीन चरणमा खेल सुरु गर्नुहोस्",
    "steps": [
      [
        "PokerTH खोल्नुहोस् र स्थानीय / अभ्यास छान्नुहोस्",
        "यो साइट खोल्नुहोस् र पहिलो स्क्रिनमा स्थानीय / अभ्यास छान्नुहोस्। लग इन छैन, डाउनलोड छैन; साइट एकपटक खोलेपछि यो मोड जडानबिना पनि चल्छ।"
      ],
      [
        "आफ्नो टेबल मिलाउनुहोस्",
        "बढीमा 9 कम्प्युटर प्रतिद्वन्द्वी, सुरुको स्ट्याक, ब्लाइन्ड कति छिटो बढ्छन् र खेलको गति छान्नुहोस्, वा तयारी ढाँचाबाट सुरु गर्नुहोस्। बोटहरूको कठिनाइ पनि उही विन्डोमा छान्नुहोस्।"
      ],
      [
        "खेल सुरु गर्नुहोस्",
        "सुरु गर्नुहोस् थिच्नुहोस्: खाली सिटहरू कम्प्युटर खेलाडीले भरिन्छन् र कार्ड बाँडिन्छन्। एउटै खेलाडीसँग सबै चिप्स नआउन्जेल खेल चल्छ।"
      ]
    ],
    "levelsH2": "चार कठिनाइ स्तर",
    "levels": [
      [
        "सजिलो",
        "आफ्नो ह्यान्ड गलत आँक्ने र कमै ब्लफ गर्ने बोटहरू: पहिलो खेलका लागि सुहाउँदा प्रतिद्वन्द्वी।"
      ],
      [
        "सामान्य",
        "आफ्नो सम्भावना राम्रोसँग बुझ्ने र स्ट्याक छोटो हुँदा सही खेल्ने भरपर्दा प्रतिद्वन्द्वी।"
      ],
      [
        "कठिन",
        "सबैभन्दा बलिया बोटहरू: ह्यान्डको सटीक पढाइ, सर्ट स्ट्याकमा धारिलो खेल र धेरै ब्लफ।"
      ],
      [
        "मिश्रित",
        "विविध टेबल, पूर्वनिर्धारित: औसतमा हरेक 10 मध्ये 3 सजिला, 5 सामान्य र 2 कठिन बोट।"
      ]
    ],
    "brainH2": "बोटहरू कसरी सोच्छन्",
    "brainP": "हरेक बोटले बाँकी कार्डहरू धेरैपटक बाँडेर, पोटमा अझै रहेका खेलाडीको सङ्ख्याविरुद्ध ह्यान्ड जित्ने आफ्नो वास्तविक सम्भावना निकाल्छ। यो सुरुको पोजिसनमा अझ कसिलो खेल्छ र पछिल्लो पोजिसनबाट स्टिल गर्छ, फ्लपअघि रेज गरेपछि कन्टिन्युएसन बेट लगाउँछ, बलियो ड्रमा सेमी-ब्लफ गर्छ, र सामान्य स्तरदेखि माथि, स्ट्याक छोटो हुँदा All-In वा Fold को खेलमा सर्छ।",
    "stylesH2": "पाँच खेल्ने शैली",
    "stylesP": "कठिनाइले बोटले खेल कति राम्रोसँग पढ्छ भन्ने तय गर्छ; शैलीले यो कसरी खेल्छ भन्ने। हरेक नयाँ टेबलमा यी मिसिन्छन्:",
    "styles": [
      [
        "रक",
        "धेरै कसिलो र सतर्क, थोरै पोटमा पस्छ र कमै ब्लफ गर्छ।"
      ],
      [
        "टाइट-एग्रेसिभ",
        "राम्रा ह्यान्ड छान्छ र तिनमा कडा बाजी लगाउँछ।"
      ],
      [
        "लुज-एग्रेसिभ",
        "धेरै ह्यान्ड खेल्छ र तपाईंमाथि दबाब दिन्छ।"
      ],
      [
        "कलिङ स्टेसन",
        "धेरै नै बढी Call गर्छ र कमै Raise गर्छ।"
      ],
      [
        "म्यानियाक",
        "लगातार रेज र ब्लफ गरिरहन्छ।"
      ]
    ],
    "formatsH2": "वास्तविक ढाँचाहरूको अभ्यास गर्नुहोस्",
    "formatsP": "तयारी सेटिङले तपाईंलाई शान्त, सामान्य वा छिटो खेल सुरु गर्न, वा pokerth.net प्रतियोगिताका सर्तमा अभ्यास गर्न दिन्छ: आधिकारिक Ranking गति, We Cup र समयमा आधारित ब्लाइन्ड भएको BBC। आफ्नै सेटिङलाई आफ्नै ढाँचाको रूपमा सेभ गर्न सकिन्छ।",
    "trophiesH2": "ट्रफी र तथ्याङ्क",
    "trophiesP": "अभ्यास मोडको आफ्नै प्रगति छ: 6 श्रेणीमा 30 भन्दा बढी ट्रफी — खेलिएका ह्यान्ड, जितिएका खेल, लगातार जित, 9 कठिन बोटविरुद्धको जित, ब्लफ, र केही गोप्य कुरा। बोटविरुद्धको तथ्याङ्क तपाईंका अनलाइन खेलबाट अलग राखिन्छ, र pokerth.net खाताबाट लग इन गर्दा तपाईंका ट्रफी तपाईंसँगै अरू उपकरणमा पनि पुग्छन्।",
    "learnH2": "सिक्ने सबैभन्दा राम्रो ठाउँ",
    "learnP": "वेब क्लाइन्टका सबै सहायता यहाँ दबाबबिना चल्छन्: कार्ड खुल्दै जाँदा तपाईंको जित्ने सम्भावना देखाउने सम्भावना ट्याब, ह्यान्डको बल देखाउने सुविधा, पहिल्यै छानिएका चालहरू र किबोर्ड सर्टकट। तयार भएको महसुस गर्दा, उही टेबल pokerth.net मा वास्तविक खेलाडीहरूविरुद्ध तपाईंलाई पर्खिरहेको छ।",
    "offlineH2": "अफलाइन, हरेक उपकरणमा",
    "offlineP": "PokerTH एउटा वेब एप हो: यो iPhone, Android, Windows, macOS र Linux मा ब्राउजरमै चल्छ, र एपजस्तै होम स्क्रिनमा थप्न सकिन्छ। एकपटक खोलेपछि अभ्यास मोडलाई कुनै जडान चाहिँदैन — एयरप्लेन मोडमा, मेट्रोमा वा सिग्नल नभएको जुनसुकै ठाउँमा।",
    "faqH2": "प्रश्नहरू",
    "faq": [
      [
        "के म कम्प्युटरसँग निःशुल्क पोकर खेल्न सक्छु?",
        "सक्नुहुन्छ। PokerTH विज्ञापन र एपभित्रको खरिदबिनाको निःशुल्क, खुला स्रोत सफ्टवेयर हो। चिप्स खेलकै पैसा मात्र हुन्।"
      ],
      [
        "खाता वा जडान चाहिन्छ?",
        "चाहिँदैन। अभ्यास मोडलाई खाता चाहिँदैन, र साइट एकपटक खोलेपछि यो जडानबिना चल्छ।"
      ],
      [
        "कति कम्प्युटर प्रतिद्वन्द्वीविरुद्ध खेल्न सकिन्छ?",
        "बढीमा 9, 10 खेलाडीको पूरा टेबलका लागि, वा हेड्स-अपका लागि एउटा मात्र।"
      ],
      [
        "बोटहरू राम्रा छन्?",
        "त्यो तपाईंमै भर पर्छ: सजिला बोटले गल्ती गर्छन्, कठिन बोटले आफ्नो सम्भावना सटीक रूपमा पढ्छन् र धेरै ब्लफ गर्छन्, र मिश्रित टेबलले तीनै स्तरलाई पाँच खेल्ने शैलीसँग मिसाउँछ।"
      ],
      [
        "के म साथीहरू र बोटहरूसँग एउटै टेबलमा खेल्न सक्छु?",
        "सक्नुहुन्छ। आफ्नै PokerTH सर्भरमा, LAN मा वा इन्टरनेटमा टेबल होस्ट गर्दा, प्रतीक्षा कोठाले खाली सिटहरू कम्प्युटर खेलाडीले भर्न सक्छ।"
      ]
    ]
  },
  nl: {
    "title": "Poker tegen de computer — gratis, offline | PokerTH",
    "desc": "Gratis Texas Hold’em tegen computertegenstanders, tot 9 bots aan je tafel, van makkelijk tot moeilijk. Geen account, geen geld, werkt offline op telefoon en pc.",
    "ldHeadline": "Texas Hold’em poker spelen tegen de computer, gratis en offline",
    "ldDesc": "De oefenmodus van de PokerTH-webclient: Texas Hold’em tegen computertegenstanders, met moeilijkheidsniveaus, speelstijlen en trofeeën.",
    "h1": "Poker spelen tegen de computer, gratis en offline",
    "lead": "De oefenmodus van PokerTH deelt volledige Texas Hold’em-toernooien tegen computertegenstanders, gewoon in je browser. Geen account, geen verbinding nodig zodra de site eenmaal geopend is, en er staat niets op het spel: dé plek om het spel te leren, een nieuwe strategie uit te proberen of snel een potje te spelen in de trein.",
    "stepsH2": "Begin een spel in drie stappen",
    "steps": [
      [
        "Open PokerTH en kies Lokaal / oefenen",
        "Open deze site en kies Lokaal / oefenen op het eerste scherm. Je hoeft niet in te loggen en niets te downloaden; zodra de site eenmaal geopend is, werkt de modus ook zonder verbinding."
      ],
      [
        "Stel je tafel in",
        "Kies tot 9 computertegenstanders, de startstack, hoe snel de blinds stijgen en de spelsnelheid, of begin met een kant-en-klaar format. In hetzelfde venster kies je de moeilijkheid van de bots."
      ],
      [
        "Start het spel",
        "Druk op Start: de lege plaatsen vullen zich met computerspelers en de kaarten worden gedeeld. Het spel gaat door tot één speler alle fiches heeft."
      ]
    ],
    "levelsH2": "Vier moeilijkheidsniveaus",
    "levels": [
      [
        "Makkelijk",
        "Bots die hun handen verkeerd inschatten en zelden bluffen: de juiste tegenstanders voor een eerste spel."
      ],
      [
        "Normaal",
        "Degelijke tegenstanders die hun kansen goed inschatten en correct spelen wanneer hun stack kort wordt."
      ],
      [
        "Moeilijk",
        "De sterkste bots: nauwkeurig handlezen, scherp spel met een korte stack en meer bluffs."
      ],
      [
        "Gemengd",
        "Een gevarieerde tafel, de standaard: gemiddeld drie makkelijke bots, vijf normale en twee moeilijke op elke tien."
      ]
    ],
    "brainH2": "Hoe de bots denken",
    "brainP": "Elke bot berekent zijn echte kans om de hand te winnen door de resterende kaarten vele keren uit te delen, tegen het aantal spelers dat nog in de pot zit. Hij speelt strakker vanuit vroege positie en steelt vanuit late positie, maakt een continuation bet na een Raise vóór de flop, semi-bluft met sterke draws en schakelt vanaf het normale niveau over op all-in-of-fold-spel wanneer zijn stack kort wordt.",
    "stylesH2": "Vijf speelstijlen",
    "stylesP": "De moeilijkheid bepaalt hoe goed een bot het spel leest; zijn stijl bepaalt hoe hij speelt. Elke nieuwe tafel mengt:",
    "styles": [
      [
        "Rock",
        "heel tight en voorzichtig, speelt weinig potten en bluft zelden."
      ],
      [
        "Tight-agressief (TAG)",
        "kiest goede handen en zet daar stevig mee in."
      ],
      [
        "Loose-agressief (LAG)",
        "speelt veel handen en zet je onder druk."
      ],
      [
        "Calling station",
        "doet veel te vaak Call en zelden Raise."
      ],
      [
        "Maniak",
        "doet aan één stuk door Raise en bluft."
      ]
    ],
    "formatsH2": "Oefen de echte formats",
    "formatsP": "Met kant-en-klare instellingen start je een Ontspannen, Normaal of Snel spel, of oefen je onder de omstandigheden van de pokerth.net-competities: het officiële Ranking-tempo, de We Cup en de BBC met zijn blinds die op tijd stijgen. Je eigen instellingen kun je bewaren als een eigen format.",
    "trophiesH2": "Trofeeën en statistieken",
    "trophiesP": "De oefenmodus heeft zijn eigen voortgang: meer dan dertig trofeeën in zes categorieën — gespeelde handen, gewonnen spellen, winstreeksen, een overwinning tegen negen moeilijke bots, bluffs en een paar geheimen. De statistieken tegen de bots worden apart van je online spellen bijgehouden, en als je inlogt met een pokerth.net-account, reizen je trofeeën mee naar je andere apparaten.",
    "learnH2": "De beste plek om te leren",
    "learnP": "Elk hulpmiddel van de webclient werkt hier zonder druk: het tabblad Kansen met je winkans terwijl de kaarten vallen, de weergave van je handsterkte, vooraf gekozen acties en sneltoetsen. Voel je je er klaar voor, dan wacht dezelfde tafel op je op pokerth.net, tegen echte spelers.",
    "offlineH2": "Offline, op elk apparaat",
    "offlineP": "PokerTH is een webapp: hij draait in de browser op iPhone, Android, Windows, macOS en Linux, en je kunt hem net als een app op je beginscherm zetten. Eenmaal geopend heeft de oefenmodus helemaal geen verbinding nodig — in vliegtuigmodus, in de metro of overal zonder bereik.",
    "faqH2": "Vragen",
    "faq": [
      [
        "Kan ik gratis poker spelen tegen de computer?",
        "Ja. PokerTH is gratis opensourcesoftware, zonder advertenties en zonder in-app-aankopen. Fiches zijn alleen speelgeld."
      ],
      [
        "Heb ik een account of verbinding nodig?",
        "Nee. De oefenmodus heeft geen account nodig, en zodra de site eenmaal geopend is, werkt hij zonder verbinding."
      ],
      [
        "Tegen hoeveel computertegenstanders kan ik spelen?",
        "Tot 9, voor een volle tafel van 10 spelers, of één enkele voor heads-up."
      ],
      [
        "Zijn de bots goed?",
        "Dat bepaal je zelf: makkelijke bots maken fouten, moeilijke bots schatten hun kansen nauwkeurig in en bluffen meer, en de gemengde tafel combineert de drie niveaus met vijf speelstijlen."
      ],
      [
        "Kan ik met vrienden en bots aan dezelfde tafel spelen?",
        "Ja. Als je een tafel host op je eigen PokerTH-server, in een LAN of op internet, kan de wachtkamer de lege plaatsen vullen met computerspelers."
      ]
    ]
  },
  pa: {
    "title": "ਕੰਪਿਊਟਰ ਵਿਰੁੱਧ ਪੋਕਰ ਖੇਡੋ — ਮੁਫ਼ਤ, ਆਫਲਾਈਨ | PokerTH",
    "desc": "ਕੰਪਿਊਟਰ ਵਿਰੋਧੀਆਂ ਵਿਰੁੱਧ ਮੁਫ਼ਤ Texas Hold’em, ਤੁਹਾਡੇ ਟੇਬਲ ’ਤੇ 9 ਬੋਟਾਂ ਤੱਕ, ਆਸਾਨ ਤੋਂ ਸਖ਼ਤ ਤੱਕ। ਨਾ ਖਾਤਾ, ਨਾ ਪੈਸਾ, ਅਤੇ ਫੋਨ ਤੇ ਪੀਸੀ ’ਤੇ ਆਫਲਾਈਨ ਵੀ ਚੱਲਦਾ ਹੈ।",
    "ldHeadline": "ਕੰਪਿਊਟਰ ਵਿਰੁੱਧ Texas Hold’em ਪੋਕਰ ਖੇਡੋ, ਮੁਫ਼ਤ ਅਤੇ ਆਫਲਾਈਨ",
    "ldDesc": "PokerTH ਵੈੱਬ ਕਲਾਇਂਟ ਦਾ ਅਭਿਆਸ ਮੋਡ: ਕੰਪਿਊਟਰ ਵਿਰੋਧੀਆਂ ਵਿਰੁੱਧ Texas Hold’em, ਮੁਸ਼ਕਲ ਦੇ ਪੱਧਰਾਂ, ਖੇਡਣ ਦੇ ਅੰਦਾਜ਼ਾਂ ਅਤੇ ਟਰਾਫੀਆਂ ਨਾਲ।",
    "h1": "ਕੰਪਿਊਟਰ ਵਿਰੁੱਧ ਪੋਕਰ ਖੇਡੋ, ਮੁਫ਼ਤ ਅਤੇ ਆਫਲਾਈਨ",
    "lead": "PokerTH ਦਾ ਅਭਿਆਸ ਮੋਡ ਸਿੱਧਾ ਤੁਹਾਡੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਕੰਪਿਊਟਰ ਵਿਰੋਧੀਆਂ ਵਿਰੁੱਧ ਪੂਰੇ Texas Hold’em ਟੂਰਨਾਮੈਂਟਾਂ ਦੇ ਪੱਤੇ ਵੰਡਦਾ ਹੈ। ਨਾ ਕੋਈ ਖਾਤਾ, ਸਾਈਟ ਇੱਕ ਵਾਰ ਖੁੱਲ੍ਹਣ ਤੋਂ ਬਾਅਦ ਨਾ ਕੋਈ ਕਨੈਕਸ਼ਨ, ਅਤੇ ਦਾਅ ’ਤੇ ਕੁਝ ਵੀ ਨਹੀਂ: ਖੇਡ ਸਿੱਖਣ, ਨਵੀਂ ਰਣਨੀਤੀ ਅਜ਼ਮਾਉਣ ਜਾਂ ਰੇਲਗੱਡੀ ਵਿੱਚ ਇੱਕ ਤੇਜ਼ ਖੇਡ ਖੇਡਣ ਦੀ ਥਾਂ।",
    "stepsH2": "ਤਿੰਨ ਕਦਮਾਂ ਵਿੱਚ ਖੇਡ ਸ਼ੁਰੂ ਕਰੋ",
    "steps": [
      [
        "PokerTH ਖੋਲ੍ਹੋ ਅਤੇ ਲੋਕਲ / ਅਭਿਆਸ ਚੁਣੋ",
        "ਇਹ ਸਾਈਟ ਖੋਲ੍ਹੋ ਅਤੇ ਪਹਿਲੀ ਸਕ੍ਰੀਨ ’ਤੇ ਲੋਕਲ / ਅਭਿਆਸ ਚੁਣੋ। ਨਾ ਲੌਗ ਇਨ, ਨਾ ਡਾਊਨਲੋਡ; ਸਾਈਟ ਇੱਕ ਵਾਰ ਖੁੱਲ੍ਹਣ ਤੋਂ ਬਾਅਦ ਇਹ ਮੋਡ ਬਿਨਾਂ ਕਨੈਕਸ਼ਨ ਵੀ ਚੱਲਦਾ ਹੈ।"
      ],
      [
        "ਆਪਣਾ ਟੇਬਲ ਤਿਆਰ ਕਰੋ",
        "9 ਤੱਕ ਕੰਪਿਊਟਰ ਵਿਰੋਧੀ, ਸ਼ੁਰੂਆਤੀ ਸਟੈਕ, ਬਲਾਇੰਡ ਕਿੰਨੀ ਤੇਜ਼ੀ ਨਾਲ ਵਧਣ ਅਤੇ ਖੇਡ ਦੀ ਰਫ਼ਤਾਰ ਚੁਣੋ, ਜਾਂ ਕਿਸੇ ਤਿਆਰ ਫਾਰਮੈਟ ਤੋਂ ਸ਼ੁਰੂ ਕਰੋ। ਉਸੇ ਵਿੰਡੋ ਵਿੱਚ ਬੋਟਾਂ ਦੀ ਮੁਸ਼ਕਲ ਚੁਣੋ।"
      ],
      [
        "ਖੇਡ ਸ਼ੁਰੂ ਕਰੋ",
        "ਸ਼ੁਰੂ ਕਰੋ ਦਬਾਓ: ਖਾਲੀ ਸੀਟਾਂ ਕੰਪਿਊਟਰ ਖਿਡਾਰੀਆਂ ਨਾਲ ਭਰ ਜਾਂਦੀਆਂ ਹਨ ਅਤੇ ਪੱਤੇ ਵੰਡੇ ਜਾਂਦੇ ਹਨ। ਖੇਡ ਉਦੋਂ ਤੱਕ ਚੱਲਦੀ ਹੈ ਜਦੋਂ ਤੱਕ ਇੱਕ ਖਿਡਾਰੀ ਕੋਲ ਸਾਰੇ ਚਿਪਸ ਨਾ ਆ ਜਾਣ।"
      ]
    ],
    "levelsH2": "ਮੁਸ਼ਕਲ ਦੇ ਚਾਰ ਪੱਧਰ",
    "levels": [
      [
        "ਆਸਾਨ",
        "ਬੋਟ ਜੋ ਆਪਣੇ ਹੱਥਾਂ ਦਾ ਗਲਤ ਅੰਦਾਜ਼ਾ ਲਾਉਂਦੇ ਹਨ ਅਤੇ ਘੱਟ ਹੀ ਬਲਫ਼ ਕਰਦੇ ਹਨ: ਪਹਿਲੀ ਖੇਡ ਲਈ ਸਹੀ ਵਿਰੋਧੀ।"
      ],
      [
        "ਸਧਾਰਨ",
        "ਪੱਕੇ ਵਿਰੋਧੀ ਜੋ ਆਪਣੀਆਂ ਸੰਭਾਵਨਾਵਾਂ ਚੰਗੀ ਤਰ੍ਹਾਂ ਸਮਝਦੇ ਹਨ ਅਤੇ ਸਟੈਕ ਛੋਟਾ ਹੋਣ ’ਤੇ ਸਹੀ ਖੇਡਦੇ ਹਨ।"
      ],
      [
        "ਸਖ਼ਤ",
        "ਸਭ ਤੋਂ ਤਾਕਤਵਰ ਬੋਟ: ਹੱਥਾਂ ਦੀ ਸਟੀਕ ਪੜ੍ਹਤ, ਛੋਟੇ ਸਟੈਕ ਨਾਲ ਤਿੱਖੀ ਖੇਡ ਅਤੇ ਵੱਧ ਬਲਫ਼।"
      ],
      [
        "ਮਿਲਿਆ-ਜੁਲਿਆ",
        "ਵੰਨ-ਸੁਵੰਨਾ ਟੇਬਲ, ਡਿਫੌਲਟ: ਔਸਤਨ ਹਰ ਦਸ ਵਿੱਚੋਂ ਤਿੰਨ ਆਸਾਨ ਬੋਟ, ਪੰਜ ਸਧਾਰਨ ਅਤੇ ਦੋ ਸਖ਼ਤ।"
      ]
    ],
    "brainH2": "ਬੋਟ ਕਿਵੇਂ ਸੋਚਦੇ ਹਨ",
    "brainP": "ਹਰ ਬੋਟ ਬਾਕੀ ਪੱਤੇ ਕਈ ਵਾਰ ਵੰਡ ਕੇ, ਪਾਟ ਵਿੱਚ ਅਜੇ ਵੀ ਮੌਜੂਦ ਖਿਡਾਰੀਆਂ ਦੀ ਗਿਣਤੀ ਦੇ ਮੁਕਾਬਲੇ, ਹੱਥ ਜਿੱਤਣ ਦੀ ਆਪਣੀ ਅਸਲ ਸੰਭਾਵਨਾ ਕੱਢਦਾ ਹੈ। ਇਹ ਸ਼ੁਰੂਆਤੀ ਪੋਜ਼ੀਸ਼ਨ ਵਿੱਚ ਵਧੇਰੇ ਟਾਈਟ ਖੇਡਦਾ ਹੈ ਅਤੇ ਆਖ਼ਰੀ ਪੋਜ਼ੀਸ਼ਨ ਤੋਂ ਸਟੀਲ ਕਰਦਾ ਹੈ, ਫਲਾਪ ਤੋਂ ਪਹਿਲਾਂ Raise ਕਰਨ ਤੋਂ ਬਾਅਦ ਕੰਟੀਨਿਊਏਸ਼ਨ ਬੈੱਟ ਲਾਉਂਦਾ ਹੈ, ਮਜ਼ਬੂਤ ਡਰਾਅ ਨਾਲ ਸੈਮੀ-ਬਲਫ਼ ਕਰਦਾ ਹੈ ਅਤੇ, ਸਧਾਰਨ ਪੱਧਰ ਤੋਂ ਉੱਪਰ, ਸਟੈਕ ਛੋਟਾ ਹੋਣ ’ਤੇ all-in ਜਾਂ fold ਵਾਲੀ ਖੇਡ ਵੱਲ ਬਦਲ ਜਾਂਦਾ ਹੈ।",
    "stylesH2": "ਖੇਡਣ ਦੇ ਪੰਜ ਅੰਦਾਜ਼",
    "stylesP": "ਮੁਸ਼ਕਲ ਇਹ ਤੈਅ ਕਰਦੀ ਹੈ ਕਿ ਬੋਟ ਖੇਡ ਨੂੰ ਕਿੰਨੀ ਚੰਗੀ ਤਰ੍ਹਾਂ ਪੜ੍ਹਦਾ ਹੈ; ਉਸਦਾ ਅੰਦਾਜ਼ ਤੈਅ ਕਰਦਾ ਹੈ ਕਿ ਉਹ ਕਿਵੇਂ ਖੇਡਦਾ ਹੈ। ਹਰ ਨਵੇਂ ਟੇਬਲ ’ਤੇ ਇਹ ਰਲੇ ਹੁੰਦੇ ਹਨ:",
    "styles": [
      [
        "ਰੌਕ",
        "ਬਹੁਤ ਸਖ਼ਤ ਅਤੇ ਸਾਵਧਾਨ, ਘੱਟ ਪਾਟਾਂ ਵਿੱਚ ਉਤਰਦਾ ਹੈ ਅਤੇ ਘੱਟ ਹੀ ਬਲਫ਼ ਕਰਦਾ ਹੈ।"
      ],
      [
        "ਸਖ਼ਤ-ਹਮਲਾਵਰ",
        "ਚੰਗੇ ਹੱਥ ਚੁਣਦਾ ਹੈ ਅਤੇ ਉਨ੍ਹਾਂ ’ਤੇ ਜ਼ੋਰਦਾਰ ਬੈੱਟ ਲਾਉਂਦਾ ਹੈ।"
      ],
      [
        "ਢਿੱਲਾ-ਹਮਲਾਵਰ",
        "ਬਹੁਤ ਸਾਰੇ ਹੱਥ ਖੇਡਦਾ ਹੈ ਅਤੇ ਤੁਹਾਡੇ ’ਤੇ ਦਬਾਅ ਪਾਉਂਦਾ ਹੈ।"
      ],
      [
        "ਕਾਲਿੰਗ ਸਟੇਸ਼ਨ",
        "ਬਹੁਤ ਜ਼ਿਆਦਾ ਵਾਰ Call ਕਰਦਾ ਹੈ ਅਤੇ ਘੱਟ ਹੀ Raise ਕਰਦਾ ਹੈ।"
      ],
      [
        "ਮੈਨੀਐਕ",
        "ਲਗਾਤਾਰ Raise ਅਤੇ ਬਲਫ਼ ਕਰਦਾ ਹੈ।"
      ]
    ],
    "formatsH2": "ਅਸਲੀ ਫਾਰਮੈਟਾਂ ਦਾ ਅਭਿਆਸ ਕਰੋ",
    "formatsP": "ਤਿਆਰ ਸੈਟਿੰਗਾਂ ਨਾਲ ਤੁਸੀਂ ਆਰਾਮਦਾਇਕ, ਸਧਾਰਨ ਜਾਂ ਤੇਜ਼ ਖੇਡ ਸ਼ੁਰੂ ਕਰ ਸਕਦੇ ਹੋ, ਜਾਂ pokerth.net ਮੁਕਾਬਲਿਆਂ ਦੀਆਂ ਸ਼ਰਤਾਂ ਹੇਠ ਅਭਿਆਸ ਕਰ ਸਕਦੇ ਹੋ: ਅਧਿਕਾਰਤ ਰੈਂਕਿੰਗ ਰਫ਼ਤਾਰ, We Cup ਅਤੇ ਸਮੇਂ ਨਾਲ ਵਧਦੇ ਬਲਾਇੰਡਾਂ ਵਾਲਾ BBC। ਤੁਹਾਡੀਆਂ ਆਪਣੀਆਂ ਸੈਟਿੰਗਾਂ ਤੁਹਾਡੇ ਆਪਣੇ ਫਾਰਮੈਟ ਵਜੋਂ ਸੇਵ ਕੀਤੀਆਂ ਜਾ ਸਕਦੀਆਂ ਹਨ।",
    "trophiesH2": "ਟਰਾਫੀਆਂ ਅਤੇ ਅੰਕੜੇ",
    "trophiesP": "ਅਭਿਆਸ ਮੋਡ ਦੀ ਆਪਣੀ ਤਰੱਕੀ ਹੈ: ਛੇ ਸ਼੍ਰੇਣੀਆਂ ਵਿੱਚ ਤੀਹ ਤੋਂ ਵੱਧ ਟਰਾਫੀਆਂ — ਖੇਡੇ ਹੱਥ, ਜਿੱਤੀਆਂ ਖੇਡਾਂ, ਲਗਾਤਾਰ ਜਿੱਤਾਂ, ਨੌਂ ਸਖ਼ਤ ਬੋਟਾਂ ਵਿਰੁੱਧ ਜਿੱਤ, ਬਲਫ਼, ਅਤੇ ਕੁਝ ਭੇਤ। ਬੋਟਾਂ ਵਿਰੁੱਧ ਅੰਕੜੇ ਤੁਹਾਡੀਆਂ ਆਨਲਾਈਨ ਖੇਡਾਂ ਤੋਂ ਵੱਖਰੇ ਰੱਖੇ ਜਾਂਦੇ ਹਨ, ਅਤੇ ਜਦੋਂ ਤੁਸੀਂ pokerth.net ਖਾਤੇ ਨਾਲ ਲੌਗ ਇਨ ਕਰਦੇ ਹੋ ਤਾਂ ਤੁਹਾਡੀਆਂ ਟਰਾਫੀਆਂ ਤੁਹਾਡੇ ਹੋਰ ਡਿਵਾਈਸਾਂ ’ਤੇ ਵੀ ਤੁਹਾਡੇ ਨਾਲ ਜਾਂਦੀਆਂ ਹਨ।",
    "learnH2": "ਸਿੱਖਣ ਦੀ ਸਭ ਤੋਂ ਵਧੀਆ ਥਾਂ",
    "learnP": "ਵੈੱਬ ਕਲਾਇਂਟ ਦੀ ਹਰ ਮਦਦ ਇੱਥੇ ਬਿਨਾਂ ਦਬਾਅ ਦੇ ਕੰਮ ਕਰਦੀ ਹੈ: ਪੱਤੇ ਆਉਣ ਦੇ ਨਾਲ ਤੁਹਾਡੀ ਜਿੱਤਣ ਦੀ ਸੰਭਾਵਨਾ ਵਿਖਾਉਂਦਾ ਓਡਸ ਟੈਬ, ਹੱਥ ਦੀ ਤਾਕਤ ਦਾ ਡਿਸਪਲੇ, ਪਹਿਲਾਂ ਤੋਂ ਚੁਣੀਆਂ ਕਾਰਵਾਈਆਂ ਅਤੇ ਕੀਬੋਰਡ ਸ਼ਾਰਟਕੱਟ। ਜਦੋਂ ਤੁਸੀਂ ਤਿਆਰ ਮਹਿਸੂਸ ਕਰੋ, ਉਹੀ ਟੇਬਲ pokerth.net ’ਤੇ ਅਸਲੀ ਖਿਡਾਰੀਆਂ ਦੇ ਵਿਰੁੱਧ ਤੁਹਾਡੀ ਉਡੀਕ ਕਰ ਰਿਹਾ ਹੈ।",
    "offlineH2": "ਆਫਲਾਈਨ, ਹਰ ਡਿਵਾਈਸ ’ਤੇ",
    "offlineP": "PokerTH ਇੱਕ ਵੈੱਬ ਐਪ ਹੈ: ਇਹ iPhone, Android, Windows, macOS ਅਤੇ Linux ’ਤੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਚੱਲਦਾ ਹੈ, ਅਤੇ ਐਪ ਵਾਂਗ ਹੋਮ ਸਕ੍ਰੀਨ ’ਤੇ ਸ਼ਾਮਲ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ। ਇੱਕ ਵਾਰ ਖੁੱਲ੍ਹਣ ਤੋਂ ਬਾਅਦ, ਅਭਿਆਸ ਮੋਡ ਨੂੰ ਕਿਸੇ ਕਨੈਕਸ਼ਨ ਦੀ ਲੋੜ ਨਹੀਂ — ਏਅਰਪਲੇਨ ਮੋਡ ਵਿੱਚ, ਮੈਟਰੋ ਵਿੱਚ ਜਾਂ ਬਿਨਾਂ ਸਿਗਨਲ ਵਾਲੀ ਕਿਸੇ ਵੀ ਥਾਂ।",
    "faqH2": "ਸਵਾਲ",
    "faq": [
      [
        "ਕੀ ਮੈਂ ਕੰਪਿਊਟਰ ਵਿਰੁੱਧ ਮੁਫ਼ਤ ਪੋਕਰ ਖੇਡ ਸਕਦਾ ਹਾਂ?",
        "ਹਾਂ। PokerTH ਮੁਫ਼ਤ ਅਤੇ ਓਪਨ ਸੋਰਸ ਸੌਫਟਵੇਅਰ ਹੈ, ਬਿਨਾਂ ਇਸ਼ਤਿਹਾਰਾਂ ਅਤੇ ਬਿਨਾਂ ਐਪ-ਅੰਦਰ ਖ਼ਰੀਦਾਂ ਦੇ। ਚਿਪਸ ਸਿਰਫ਼ ਖੇਡ ਦਾ ਪੈਸਾ ਹਨ।"
      ],
      [
        "ਕੀ ਮੈਨੂੰ ਖਾਤੇ ਜਾਂ ਕਨੈਕਸ਼ਨ ਦੀ ਲੋੜ ਹੈ?",
        "ਨਹੀਂ। ਅਭਿਆਸ ਮੋਡ ਨੂੰ ਕਿਸੇ ਖਾਤੇ ਦੀ ਲੋੜ ਨਹੀਂ, ਅਤੇ ਸਾਈਟ ਇੱਕ ਵਾਰ ਖੁੱਲ੍ਹਣ ਤੋਂ ਬਾਅਦ ਇਹ ਬਿਨਾਂ ਕਨੈਕਸ਼ਨ ਚੱਲਦਾ ਹੈ।"
      ],
      [
        "ਮੈਂ ਕਿੰਨੇ ਕੰਪਿਊਟਰ ਵਿਰੋਧੀਆਂ ਵਿਰੁੱਧ ਖੇਡ ਸਕਦਾ ਹਾਂ?",
        "9 ਤੱਕ, 10 ਖਿਡਾਰੀਆਂ ਦੇ ਪੂਰੇ ਟੇਬਲ ਲਈ, ਜਾਂ ਹੈਡਸ-ਅੱਪ ਲਈ ਸਿਰਫ਼ ਇੱਕ।"
      ],
      [
        "ਕੀ ਬੋਟ ਚੰਗੇ ਹਨ?",
        "ਇਹ ਤੁਹਾਡੇ ’ਤੇ ਨਿਰਭਰ ਹੈ: ਆਸਾਨ ਬੋਟ ਗਲਤੀਆਂ ਕਰਦੇ ਹਨ, ਸਖ਼ਤ ਬੋਟ ਆਪਣੀਆਂ ਸੰਭਾਵਨਾਵਾਂ ਸਟੀਕ ਢੰਗ ਨਾਲ ਪਰਖਦੇ ਹਨ ਅਤੇ ਵੱਧ ਬਲਫ਼ ਕਰਦੇ ਹਨ, ਅਤੇ ਮਿਲਿਆ-ਜੁਲਿਆ ਟੇਬਲ ਤਿੰਨਾਂ ਪੱਧਰਾਂ ਨੂੰ ਖੇਡਣ ਦੇ ਪੰਜ ਅੰਦਾਜ਼ਾਂ ਨਾਲ ਮਿਲਾਉਂਦਾ ਹੈ।"
      ],
      [
        "ਕੀ ਮੈਂ ਇੱਕੋ ਟੇਬਲ ’ਤੇ ਦੋਸਤਾਂ ਅਤੇ ਬੋਟਾਂ ਨਾਲ ਖੇਡ ਸਕਦਾ ਹਾਂ?",
        "ਹਾਂ। ਜਦੋਂ ਤੁਸੀਂ ਆਪਣੇ PokerTH ਸਰਵਰ ’ਤੇ, LAN ’ਤੇ ਜਾਂ ਇੰਟਰਨੈੱਟ ’ਤੇ ਟੇਬਲ ਹੋਸਟ ਕਰਦੇ ਹੋ, ਉਡੀਕ ਕਮਰਾ ਖਾਲੀ ਸੀਟਾਂ ਨੂੰ ਕੰਪਿਊਟਰ ਖਿਡਾਰੀਆਂ ਨਾਲ ਭਰ ਸਕਦਾ ਹੈ।"
      ]
    ]
  },
  pl: {
    "title": "Graj w pokera z komputerem — za darmo, offline | PokerTH",
    "desc": "Darmowy Texas Hold’em z komputerem, do 9 botów przy twoim stole, od łatwych po trudne. Bez konta i pieniędzy, działa offline na telefonie i PC.",
    "ldHeadline": "Graj w pokera Texas Hold’em z komputerem, za darmo i offline",
    "ldDesc": "Tryb treningowy klienta webowego PokerTH: Texas Hold’em z przeciwnikami sterowanymi przez komputer, z poziomami trudności, stylami gry i trofeami.",
    "h1": "Graj w pokera z komputerem, za darmo i offline",
    "lead": "Tryb treningowy PokerTH rozdaje pełne turnieje Texas Hold’em z przeciwnikami sterowanymi przez komputer, prosto w twojej przeglądarce. Bez konta, bez połączenia po otwarciu strony i bez żadnej stawki: miejsce, by nauczyć się gry, wypróbować nową strategię albo zagrać szybką partię w pociągu.",
    "stepsH2": "Rozpocznij grę w trzech krokach",
    "steps": [
      [
        "Otwórz PokerTH i wybierz Lokalna / trening",
        "Otwórz tę stronę i na pierwszym ekranie wybierz Lokalna / trening. Nie trzeba się logować ani niczego pobierać; po otwarciu strony ten tryb działa także bez połączenia."
      ],
      [
        "Przygotuj stół",
        "Wybierz do 9 przeciwników sterowanych przez komputer, stack początkowy, tempo wzrostu ciemnych i szybkość gry albo zacznij od gotowego formatu. W tym samym oknie wybierz poziom botów."
      ],
      [
        "Rozpocznij grę",
        "Naciśnij Start: wolne miejsca zajmują gracze sterowani przez komputer i karty zostają rozdane. Gra trwa, aż jeden gracz zdobędzie wszystkie żetony."
      ]
    ],
    "levelsH2": "Cztery poziomy trudności",
    "levels": [
      [
        "Łatwy",
        "Boty, które źle oceniają swoje ręce i rzadko blefują: odpowiedni przeciwnicy na pierwszą grę."
      ],
      [
        "Normalny",
        "Solidni przeciwnicy, którzy dobrze oceniają swoje szanse i grają poprawnie, gdy ich stack robi się krótki."
      ],
      [
        "Trudny",
        "Najsilniejsze boty: precyzyjne czytanie rąk, ostra gra krótkim stackiem i więcej blefów."
      ],
      [
        "Mieszany",
        "Zróżnicowany stół, ustawienie domyślne: średnio na każde dziesięć trzy boty łatwe, pięć normalnych i dwa trudne."
      ]
    ],
    "brainH2": "Jak myślą boty",
    "brainP": "Każdy bot oblicza swoją rzeczywistą szansę na wygranie rozdania, wielokrotnie rozdając pozostałe karty, z uwzględnieniem liczby graczy, którzy są jeszcze w puli. Gra ciaśniej na wczesnych pozycjach i kradnie z późnych, po podbiciu przed flopem stawia zakład kontynuacyjny (c-bet), półblefuje z mocnymi drawami i od poziomu normalnego wzwyż przechodzi na grę All-In albo Fold, gdy jego stack robi się krótki.",
    "stylesH2": "Pięć stylów gry",
    "stylesP": "Poziom trudności decyduje, jak dobrze bot czyta grę; styl — jak gra. Każdy nowy stół miesza:",
    "styles": [
      [
        "Rock",
        "bardzo ciasny i ostrożny, wchodzi do niewielu pul i rzadko blefuje."
      ],
      [
        "Tight-agresywny (TAG)",
        "wybiera dobre ręce i mocno je obstawia."
      ],
      [
        "Loose-agresywny (LAG)",
        "gra wiele rąk i wywiera na ciebie presję."
      ],
      [
        "Calling station",
        "sprawdza zdecydowanie za często i rzadko podbija."
      ],
      [
        "Maniak",
        "bez przerwy podbija i blefuje."
      ]
    ],
    "formatsH2": "Ćwicz prawdziwe formaty",
    "formatsP": "Gotowe ustawienia pozwalają rozpocząć grę w trybie Spokojny, Normalny lub Szybki albo ćwiczyć w warunkach zawodów pokerth.net: oficjalne tempo Ranking, We Cup i BBC z ciemnymi rosnącymi w czasie. Własne ustawienia możesz zapisać jako swój format.",
    "trophiesH2": "Trofea i statystyki",
    "trophiesP": "Tryb treningowy ma własny system postępów: ponad trzydzieści trofeów w sześciu kategoriach — rozegrane rozdania, wygrane gry, serie zwycięstw, zwycięstwo z dziewięcioma trudnymi botami, blefy i kilka sekretów. Statystyki gier z botami są przechowywane osobno od twoich gier online, a gdy zalogujesz się kontem pokerth.net, twoje trofea podążają za tobą na inne urządzenia.",
    "learnH2": "Najlepsze miejsce do nauki",
    "learnP": "Wszystkie pomoce klienta webowego działają tu bez presji: zakładka Szanse z twoją szansą na wygraną w miarę wychodzenia kart, wskaźnik siły ręki, wstępnie wybrane akcje i skróty klawiszowe. Gdy poczujesz się gotowy, ten sam stół czeka na ciebie na pokerth.net z prawdziwymi graczami.",
    "offlineH2": "Offline, na każdym urządzeniu",
    "offlineP": "PokerTH to aplikacja webowa: działa w przeglądarce na iPhonie i Androidzie oraz w systemach Windows, macOS i Linux, a do ekranu głównego można ją dodać jak aplikację. Po otwarciu tryb treningowy w ogóle nie potrzebuje połączenia — w trybie samolotowym, w metrze czy gdziekolwiek bez zasięgu.",
    "faqH2": "Pytania",
    "faq": [
      [
        "Czy mogę za darmo grać w pokera z komputerem?",
        "Tak. PokerTH to darmowe oprogramowanie open source, bez reklam i bez zakupów w aplikacji. Żetony to wyłącznie wirtualne pieniądze."
      ],
      [
        "Czy potrzebuję konta lub połączenia?",
        "Nie. Tryb treningowy nie wymaga konta, a po otwarciu strony działa bez połączenia."
      ],
      [
        "Z iloma przeciwnikami sterowanymi przez komputer mogę grać?",
        "Maksymalnie z 9, co daje pełny stół 10 graczy, albo tylko z jednym, grając jeden na jednego."
      ],
      [
        "Czy boty są dobre?",
        "To zależy od ciebie: łatwe boty popełniają błędy, trudne precyzyjnie oceniają swoje szanse i częściej blefują, a mieszany stół łączy trzy poziomy z pięcioma stylami gry."
      ],
      [
        "Czy mogę grać ze znajomymi i botami przy jednym stole?",
        "Tak. Gdy zakładasz stół na własnym serwerze PokerTH, w sieci LAN lub w internecie, poczekalnia może zapełnić wolne miejsca graczami sterowanymi przez komputer."
      ]
    ]
  },
  "pt-BR": {
    "title": "Jogar pôquer contra o computador — grátis, offline | PokerTH",
    "desc": "Texas Hold’em grátis contra o computador: até 9 bots na sua mesa, do fácil ao difícil. Sem cadastro, sem dinheiro, e funciona offline no celular e no PC.",
    "ldHeadline": "Jogue pôquer Texas Hold’em contra o computador, grátis e offline",
    "ldDesc": "Modo de treino do cliente web do PokerTH: Texas Hold’em contra adversários do computador, com níveis de dificuldade, estilos de jogo e troféus.",
    "h1": "Jogue pôquer contra o computador, grátis e offline",
    "lead": "O modo de treino do PokerTH distribui torneios completos de Texas Hold’em contra adversários do computador, direto no seu navegador. Sem cadastro, sem conexão depois que o site foi aberto e nada em jogo: o lugar certo para aprender o jogo, testar uma estratégia nova ou jogar uma partida rápida no trem.",
    "stepsH2": "Comece uma partida em três passos",
    "steps": [
      [
        "Abra o PokerTH e escolha Local / treino",
        "Abra este site e escolha Local / treino na primeira tela. Não tem login nem download; depois que o site foi aberto, o modo também funciona sem conexão."
      ],
      [
        "Monte sua mesa",
        "Escolha até 9 adversários do computador, a pilha inicial, a rapidez com que os blinds sobem e a velocidade do jogo, ou comece com um formato pronto. Escolha a dificuldade dos bots na mesma janela."
      ],
      [
        "Comece a partida",
        "Aperte Começar: os lugares vazios são preenchidos por jogadores do computador e as cartas são distribuídas. A partida continua até um jogador ficar com todas as fichas."
      ]
    ],
    "levelsH2": "Quatro níveis de dificuldade",
    "levels": [
      [
        "Fácil",
        "Bots que avaliam mal suas mãos e raramente blefam: os adversários certos para uma primeira partida."
      ],
      [
        "Normal",
        "Adversários sólidos que leem bem suas chances e jogam corretamente quando a pilha fica curta."
      ],
      [
        "Difícil",
        "Os bots mais fortes: leitura precisa de mãos, jogo afiado com pilha curta e mais blefes."
      ],
      [
        "Misto",
        "Uma mesa variada, o padrão: em média três bots fáceis, cinco normais e dois difíceis a cada dez."
      ]
    ],
    "brainH2": "Como os bots pensam",
    "brainP": "Cada bot calcula sua chance real de ganhar a mão distribuindo muitas vezes as cartas restantes, de acordo com o número de jogadores ainda no pote. Joga mais fechado em posição inicial e rouba de posição final, faz aposta de continuação depois de aumentar antes do flop, faz semiblefe com projetos fortes e, a partir do nível normal, passa a jogar All-In ou Fold quando sua pilha fica curta.",
    "stylesH2": "Cinco estilos de jogo",
    "stylesP": "A dificuldade define o quanto um bot lê bem o jogo; o estilo define como ele joga. Cada mesa nova mistura:",
    "styles": [
      [
        "Rock",
        "muito fechado e cuidadoso, entra em poucos potes e raramente blefa."
      ],
      [
        "TAG (tight-agressivo)",
        "escolhe boas mãos e aposta forte com elas."
      ],
      [
        "LAG (loose-agressivo)",
        "joga muitas mãos e coloca você sob pressão."
      ],
      [
        "Calling station",
        "paga demais e raramente aumenta."
      ],
      [
        "Maníaco",
        "aumenta e blefa o tempo todo."
      ]
    ],
    "formatsH2": "Treine nos formatos reais",
    "formatsP": "Configurações prontas permitem começar uma partida no formato Relaxado, Normal ou Rápido, ou treinar nas condições das competições do pokerth.net: o ritmo oficial do Ranking, a We Cup e a BBC com seus blinds por tempo. Suas próprias configurações podem ser salvas como um formato seu.",
    "trophiesH2": "Troféus e estatísticas",
    "trophiesP": "O modo de treino tem sua própria progressão: mais de trinta troféus em seis categorias — mãos jogadas, partidas vencidas, sequências de vitórias, uma vitória contra nove bots difíceis, blefes e alguns segredos. As estatísticas contra os bots ficam separadas das suas partidas online, e quando você entra com uma conta do pokerth.net seus troféus vão junto para os seus outros aparelhos.",
    "learnH2": "O melhor lugar para aprender",
    "learnP": "Todos os recursos de ajuda do cliente web funcionam aqui sem pressão: a aba Chances com a sua chance de vitória conforme as cartas saem, o indicador de força da mão, as ações pré-selecionadas e os atalhos de teclado. Quando se sentir pronto, a mesma mesa espera por você no pokerth.net contra jogadores de verdade.",
    "offlineH2": "Offline, em qualquer aparelho",
    "offlineP": "O PokerTH é um app web: roda no navegador no iPhone, Android, Windows, macOS e Linux, e pode ser adicionado à tela de início como um app. Depois de aberto, o modo de treino não precisa de nenhuma conexão — no modo avião, no metrô ou em qualquer lugar sem sinal.",
    "faqH2": "Perguntas",
    "faq": [
      [
        "Dá para jogar pôquer contra o computador de graça?",
        "Sim. O PokerTH é um software gratuito e de código aberto, sem anúncios e sem compras no app. As fichas são só dinheiro fictício."
      ],
      [
        "Preciso de conta ou de conexão?",
        "Não. O modo de treino não precisa de conta e, depois que o site foi aberto, funciona sem conexão."
      ],
      [
        "Contra quantos adversários do computador posso jogar?",
        "Até 9, para uma mesa completa de 10 jogadores, ou só um para jogar mano a mano."
      ],
      [
        "Os bots são bons?",
        "Depende de você: os bots fáceis erram, os difíceis leem suas chances com precisão e blefam mais, e a mesa mista combina os três níveis com cinco estilos de jogo."
      ],
      [
        "Posso jogar com amigos e bots na mesma mesa?",
        "Sim. Quando você abre uma mesa no seu próprio servidor PokerTH, numa LAN ou na internet, a sala de espera pode preencher os lugares vazios com jogadores do computador."
      ]
    ]
  },
  "pt-PT": {
    "title": "Póquer contra o computador — grátis e offline | PokerTH",
    "desc": "Texas Hold’em grátis contra adversários do computador, até 9 bots à sua mesa, do fácil ao difícil. Sem conta, sem dinheiro e funciona offline no telemóvel e no PC.",
    "ldHeadline": "Jogar póquer Texas Hold’em contra o computador, grátis e offline",
    "ldDesc": "Modo de treino do cliente web PokerTH: Texas Hold’em contra adversários controlados pelo computador, com níveis de dificuldade, estilos de jogo e troféus.",
    "h1": "Jogue póquer contra o computador, grátis e offline",
    "lead": "O modo de treino do PokerTH dá torneios completos de Texas Hold’em contra adversários controlados pelo computador, directamente no seu navegador. Sem conta, sem ligação depois de o site ter sido aberto uma vez, e sem nada em jogo: o sítio para aprender o jogo, experimentar uma nova estratégia ou jogar uma partida rápida no comboio.",
    "stepsH2": "Comece um jogo em três passos",
    "steps": [
      [
        "Abra o PokerTH e escolha Local / treino",
        "Abra este site e escolha Local / treino no primeiro ecrã. Não é preciso iniciar sessão nem transferir nada; depois de o site ter sido aberto uma vez, o modo funciona também sem ligação."
      ],
      [
        "Configure a sua mesa",
        "Escolha até 9 adversários do computador, as fichas iniciais, a rapidez com que os blinds sobem e a velocidade do jogo, ou parta de um formato já pronto. Escolha a dificuldade dos bots na mesma janela."
      ],
      [
        "Comece o jogo",
        "Carregue em Começar: os lugares vazios enchem-se de jogadores do computador e as cartas são dadas. O jogo continua até um jogador ficar com todas as fichas."
      ]
    ],
    "levelsH2": "Quatro níveis de dificuldade",
    "levels": [
      [
        "Fácil",
        "Bots que avaliam mal as suas mãos e raramente fazem bluff: os adversários certos para um primeiro jogo."
      ],
      [
        "Normal",
        "Adversários sólidos que avaliam bem as suas hipóteses e jogam correctamente quando a pilha fica curta."
      ],
      [
        "Difícil",
        "Os bots mais fortes: leitura precisa das mãos, jogo afiado com pilha curta e mais bluffs."
      ],
      [
        "Misto",
        "Uma mesa variada, a opção predefinida: em média, três bots fáceis, cinco normais e dois difíceis em cada dez."
      ]
    ],
    "brainH2": "Como pensam os bots",
    "brainP": "Cada bot calcula a sua verdadeira probabilidade de ganhar a mão distribuindo muitas vezes as cartas restantes, contra o número de jogadores ainda no pote. Joga mais fechado em posição inicial e rouba a partir de posição tardia, faz uma aposta de continuação depois de subir antes do flop, faz semi-bluff com projectos fortes e, a partir do nível normal, passa a jogar all-in ou Fold quando a pilha fica curta.",
    "stylesH2": "Cinco estilos de jogo",
    "stylesP": "A dificuldade define até que ponto um bot lê bem o jogo; o estilo define como joga. Cada nova mesa mistura:",
    "styles": [
      [
        "Rock",
        "muito fechado e cauteloso, entra em poucos potes e raramente faz bluff."
      ],
      [
        "Tight-agressivo (TAG)",
        "escolhe boas mãos e aposta forte com elas."
      ],
      [
        "Loose-agressivo (LAG)",
        "joga muitas mãos e põe-lhe pressão."
      ],
      [
        "Calling station",
        "iguala vezes demais e raramente sobe."
      ],
      [
        "Maníaco",
        "sobe e faz bluff constantemente."
      ]
    ],
    "formatsH2": "Pratique os formatos reais",
    "formatsP": "As definições prontas permitem começar um jogo Relaxado, Normal ou Rápido, ou praticar nas condições das competições do pokerth.net: o ritmo oficial Ranking, a We Cup e a BBC com os seus blinds por tempo. As suas próprias definições podem ser guardadas como um formato seu.",
    "trophiesH2": "Troféus e estatísticas",
    "trophiesP": "O modo de treino tem a sua própria progressão: mais de trinta troféus em seis categorias — mãos jogadas, jogos ganhos, séries de vitórias, uma vitória contra nove bots difíceis, bluffs e alguns segredos. As estatísticas contra os bots são guardadas à parte dos seus jogos online e, quando inicia sessão com uma conta pokerth.net, os seus troféus acompanham-no nos seus outros dispositivos.",
    "learnH2": "O melhor sítio para aprender",
    "learnP": "Todas as ajudas do cliente web funcionam aqui sem pressão: o separador Probabilidades com a sua probabilidade de ganhar à medida que as cartas saem, a indicação da força da mão, as acções pré-seleccionadas e os atalhos de teclado. Quando se sentir preparado, a mesma mesa espera por si no pokerth.net contra jogadores reais.",
    "offlineH2": "Offline, em qualquer dispositivo",
    "offlineP": "O PokerTH é uma aplicação web: corre no navegador no iPhone, Android, Windows, macOS e Linux, e pode ser adicionado ao ecrã principal como uma aplicação. Depois de aberto, o modo de treino não precisa de ligação nenhuma — em modo de avião, no metro ou em qualquer lugar sem rede.",
    "faqH2": "Perguntas",
    "faq": [
      [
        "Posso jogar póquer contra o computador de graça?",
        "Sim. O PokerTH é software gratuito e de código aberto, sem anúncios nem compras na aplicação. As fichas são apenas dinheiro de jogo."
      ],
      [
        "Preciso de conta ou de ligação?",
        "Não. O modo de treino não precisa de conta e, depois de o site ter sido aberto uma vez, funciona sem ligação."
      ],
      [
        "Contra quantos adversários do computador posso jogar?",
        "Até 9, para uma mesa completa de 10 jogadores, ou apenas um para um frente a frente."
      ],
      [
        "Os bots são bons?",
        "Depende de si: os bots fáceis cometem erros, os difíceis avaliam as suas hipóteses com precisão e fazem mais bluff, e a mesa mista combina os três níveis com cinco estilos de jogo."
      ],
      [
        "Posso jogar com amigos e bots na mesma mesa?",
        "Sim. Quando aloja uma mesa no seu próprio servidor PokerTH, numa LAN ou na internet, a sala de espera pode preencher os lugares vazios com jogadores do computador."
      ]
    ]
  },
  ro: {
    "title": "Joacă poker contra calculatorului — gratis, offline | PokerTH",
    "desc": "Texas Hold’em gratis contra calculatorului, până la 9 boți la masă, de la ușor la greu. Fără cont, fără bani, și merge offline pe telefon și PC.",
    "ldHeadline": "Joacă poker Texas Hold’em contra calculatorului, gratis și offline",
    "ldDesc": "Modul de antrenament al clientului web PokerTH: Texas Hold’em contra adversarilor controlați de calculator, cu niveluri de dificultate, stiluri de joc și trofee.",
    "h1": "Joacă poker contra calculatorului, gratis și offline",
    "lead": "Modul de antrenament din PokerTH împarte turnee complete de Texas Hold’em contra adversarilor controlați de calculator, direct în browser. Fără cont, fără conexiune după ce site-ul a fost deschis și fără nicio miză: locul potrivit pentru a învăța jocul, a încerca o strategie nouă sau a juca o partidă rapidă în tren.",
    "stepsH2": "Pornește o partidă în trei pași",
    "steps": [
      [
        "Deschide PokerTH și alege Local / antrenament",
        "Deschide acest site și alege Local / antrenament pe primul ecran. Nu e nevoie de autentificare și nici de descărcare; după ce site-ul a fost deschis, modul funcționează și fără conexiune."
      ],
      [
        "Configurează-ți masa",
        "Alege până la 9 adversari controlați de calculator, stiva de start, cât de repede cresc blindurile și viteza jocului, sau pornește de la un format gata făcut. Dificultatea boților o alegi în aceeași fereastră."
      ],
      [
        "Începe partida",
        "Apasă Start: locurile libere se ocupă cu jucători controlați de calculator și se împart cărțile. Partida durează până când un singur jucător are toate jetoanele."
      ]
    ],
    "levelsH2": "Patru niveluri de dificultate",
    "levels": [
      [
        "Ușor",
        "Boți care își evaluează greșit mâinile și recurg rar la cacealma: adversarii potriviți pentru prima partidă."
      ],
      [
        "Normal",
        "Adversari solizi, care își citesc bine șansele și joacă corect când stiva li se scurtează."
      ],
      [
        "Greu",
        "Cei mai puternici boți: citire precisă a mâinilor, joc ascuțit cu stivă scurtă și mai multe cacealmale."
      ],
      [
        "Mixt",
        "O masă variată, setarea implicită: în medie trei boți ușori, cinci normali și doi grei din fiecare zece."
      ]
    ],
    "brainH2": "Cum gândesc boții",
    "brainP": "Fiecare bot își calculează șansa reală de a câștiga mâna împărțind de multe ori cărțile rămase, în funcție de numărul de jucători încă în pot. Joacă mai strâns din poziție timpurie și fură din poziție târzie, face continuation bet după ce a mărit înainte de flop, joacă semi-bluff cu proiectele puternice și, de la nivelul normal în sus, trece la jocul All-In sau Fold când stiva i se scurtează.",
    "stylesH2": "Cinci stiluri de joc",
    "stylesP": "Dificultatea stabilește cât de bine citește un bot jocul; stilul stabilește cum joacă. Fiecare masă nouă amestecă:",
    "styles": [
      [
        "Rock",
        "foarte strâns și prudent, intră în puține poturi și recurge rar la cacealma."
      ],
      [
        "Tight-agresiv",
        "alege mâini bune și pariază puternic cu ele."
      ],
      [
        "Loose-agresiv",
        "joacă multe mâini și pune presiune pe tine."
      ],
      [
        "Calling station",
        "plătește mult prea des și mărește rar."
      ],
      [
        "Maniac",
        "mărește și dă cacealmale tot timpul."
      ]
    ],
    "formatsH2": "Exersează formatele reale",
    "formatsP": "Setările gata făcute îți permit să pornești o partidă Relaxat, Normal sau Rapid, ori să exersezi în condițiile competițiilor de pe pokerth.net: ritmul oficial Clasament, We Cup și BBC cu blindurile sale bazate pe timp. Propriile setări pot fi salvate ca format personal.",
    "trophiesH2": "Trofee și statistici",
    "trophiesP": "Modul de antrenament are propria progresie: peste treizeci de trofee în șase categorii — mâini jucate, partide câștigate, serii de victorii, o victorie contra a nouă boți grei, cacealmale și câteva secrete. Statisticile contra boților sunt ținute separat de partidele tale online, iar când te autentifici cu un cont pokerth.net, trofeele te urmează pe celelalte dispozitive.",
    "learnH2": "Cel mai bun loc pentru a învăța",
    "learnP": "Toate ajutoarele clientului web funcționează aici fără presiune: fila Șanse cu șansa ta de câștig pe măsură ce apar cărțile, afișarea puterii mâinii, acțiunile preselectate și scurtăturile de tastatură. Când te simți pregătit, aceeași masă te așteaptă pe pokerth.net, contra unor jucători reali.",
    "offlineH2": "Offline, pe orice dispozitiv",
    "offlineP": "PokerTH este o aplicație web: rulează în browser pe iPhone, Android, Windows, macOS și Linux și poate fi adăugată pe ecranul principal ca o aplicație. Odată deschis, modul de antrenament nu are nevoie de nicio conexiune — în modul avion, la metrou sau oriunde fără semnal.",
    "faqH2": "Întrebări",
    "faq": [
      [
        "Pot juca poker contra calculatorului gratis?",
        "Da. PokerTH este software gratuit și open source, fără reclame și fără achiziții în aplicație. Jetoanele sunt doar bani de joc."
      ],
      [
        "Am nevoie de cont sau de conexiune?",
        "Nu. Modul de antrenament nu cere cont, iar după ce site-ul a fost deschis funcționează fără conexiune."
      ],
      [
        "Contra câtor adversari controlați de calculator pot juca?",
        "Până la 9, pentru o masă completă de 10 jucători, sau unul singur, pentru heads-up."
      ],
      [
        "Sunt buni boții?",
        "Depinde de tine: boții ușori greșesc, boții grei își citesc precis șansele și recurg mai des la cacealma, iar masa mixtă combină cele trei niveluri cu cinci stiluri de joc."
      ],
      [
        "Pot juca cu prieteni și boți la aceeași masă?",
        "Da. Când găzduiești o masă pe propriul server PokerTH, în LAN sau pe internet, sala de așteptare poate completa locurile libere cu jucători controlați de calculator."
      ]
    ]
  },
  ru: {
    "title": "Играть в покер с компьютером — бесплатно, офлайн | PokerTH",
    "desc": "Бесплатный Texas Hold’em против компьютерных соперников: до 9 ботов за вашим столом, от лёгких до сложных. Без аккаунта и денег, работает офлайн на телефоне и ПК.",
    "ldHeadline": "Играйте в покер Texas Hold’em против компьютера бесплатно и офлайн",
    "ldDesc": "Тренировочный режим веб-клиента PokerTH: Texas Hold’em против компьютерных соперников, с уровнями сложности, стилями игры и трофеями.",
    "h1": "Играйте в покер с компьютером бесплатно и офлайн",
    "lead": "Тренировочный режим PokerTH раздаёт полноценные турниры по Texas Hold’em против компьютерных соперников прямо в вашем браузере. Ни аккаунта, ни соединения после того, как сайт однажды открыт, и ничего на кону: место, чтобы освоить игру, опробовать новую стратегию или сыграть быструю партию в поезде.",
    "stepsH2": "Начните игру в три шага",
    "steps": [
      [
        "Откройте PokerTH и выберите «Локальная / тренировка»",
        "Откройте этот сайт и на первом экране выберите «Локальная / тренировка». Ни входа, ни скачивания; после того как сайт однажды открыт, режим работает и без соединения."
      ],
      [
        "Настройте свой стол",
        "Выберите до 9 компьютерных соперников, стартовый стек, скорость роста блайндов и скорость игры или начните с готового формата. Сложность ботов выбирается в том же окне."
      ],
      [
        "Начните игру",
        "Нажмите «Старт»: свободные места займут компьютерные игроки, и карты будут розданы. Игра идёт, пока у одного игрока не окажутся все фишки."
      ]
    ],
    "levelsH2": "Четыре уровня сложности",
    "levels": [
      [
        "Лёгкий",
        "Боты, которые неверно оценивают свои руки и редко блефуют: подходящие соперники для первой игры."
      ],
      [
        "Обычный",
        "Крепкие соперники, которые хорошо оценивают свои шансы и правильно играют, когда их стек становится коротким."
      ],
      [
        "Сложный",
        "Самые сильные боты: точное чтение рук, острая игра с коротким стеком и больше блефа."
      ],
      [
        "Смешанный",
        "Разнообразный стол, вариант по умолчанию: в среднем три лёгких бота, пять обычных и два сложных на каждые десять."
      ]
    ],
    "brainH2": "Как думают боты",
    "brainP": "Каждый бот вычисляет свой реальный шанс выиграть раздачу, много раз раздавая оставшиеся карты против числа игроков, ещё остающихся в банке. Он играет плотнее на ранней позиции и ворует с поздней, делает контбет после рейза на префлопе, полублефует с сильными дро и, начиная с обычного уровня, переходит на игру «ва-банк или фолд», когда его стек становится коротким.",
    "stylesH2": "Пять стилей игры",
    "stylesP": "Сложность определяет, насколько хорошо бот читает игру; стиль — то, как он играет. Каждый новый стол смешивает:",
    "styles": [
      [
        "Рок",
        "очень тайтовый и осторожный, разыгрывает мало банков и редко блефует."
      ],
      [
        "Тайтово-агрессивный (TAG)",
        "выбирает хорошие руки и ставит с ними жёстко."
      ],
      [
        "Лузово-агрессивный (LAG)",
        "играет много рук и давит на вас."
      ],
      [
        "Колл-станция",
        "коллирует слишком часто и редко рейзит."
      ],
      [
        "Маньяк",
        "постоянно рейзит и блефует."
      ]
    ],
    "formatsH2": "Тренируйтесь в настоящих форматах",
    "formatsP": "Готовые настройки позволяют начать игру в формате «Спокойный», «Обычный» или «Быстрый» либо потренироваться в условиях соревнований pokerth.net: официальный темп «Рейтинг», We Cup и BBC с блайндами по времени. Собственные настройки можно сохранить как свой формат.",
    "trophiesH2": "Трофеи и статистика",
    "trophiesP": "У тренировочного режима своя система прогресса: более тридцати трофеев в шести категориях — сыгранные раздачи, выигранные игры, серии побед, победа над девятью сложными ботами, блефы и несколько секретов. Статистика против ботов ведётся отдельно от ваших онлайн-игр, а когда вы входите с аккаунтом pokerth.net, трофеи следуют за вами на другие устройства.",
    "learnH2": "Лучшее место для обучения",
    "learnP": "Все подсказки веб-клиента работают здесь без давления: вкладка «Шансы» с вашим шансом на победу по мере выхода карт, индикатор силы руки, предварительный выбор действий и горячие клавиши. Когда почувствуете, что готовы, тот же стол ждёт вас на pokerth.net — против живых игроков.",
    "offlineH2": "Офлайн, на любом устройстве",
    "offlineP": "PokerTH — веб-приложение: оно работает в браузере на iPhone, Android, Windows, macOS и Linux, и его можно добавить на главный экран как приложение. После первого открытия тренировочному режиму соединение вообще не нужно — в авиарежиме, в метро или там, где нет сигнала.",
    "faqH2": "Вопросы",
    "faq": [
      [
        "Можно ли играть в покер с компьютером бесплатно?",
        "Да. PokerTH — свободная программа с открытым исходным кодом, без рекламы и встроенных покупок. Фишки только игровые."
      ],
      [
        "Нужен ли аккаунт или соединение?",
        "Нет. Тренировочному режиму не нужен аккаунт, а после того как сайт однажды открыт, он работает без соединения."
      ],
      [
        "Против скольких компьютерных соперников можно играть?",
        "До 9 — для полного стола из 10 игроков — или против одного, в хедз-ап."
      ],
      [
        "Хорошо ли играют боты?",
        "Это зависит от вас: лёгкие боты ошибаются, сложные точно оценивают свои шансы и чаще блефуют, а смешанный стол сочетает три уровня с пятью стилями игры."
      ],
      [
        "Можно ли играть с друзьями и ботами за одним столом?",
        "Да. Когда вы создаёте стол на собственном сервере PokerTH, в локальной сети или в интернете, комната ожидания может заполнить свободные места компьютерными игроками."
      ]
    ]
  },
  si: {
    "title": "පරිගණකය සමඟ පෝකර් ක්‍රීඩා කරන්න — නොමිලේ, ඕෆ්ලයින් | PokerTH",
    "desc": "පරිගණක ප්‍රතිවාදීන්ට එරෙහිව නොමිලේ Texas Hold’em, මේසයේ බොට් 9 දක්වා, පහසු සිට අමාරු දක්වා. ගිණුමක් නැත, මුදල් නැත, දුරකථනයේ සහ PC එකේ ඕෆ්ලයින් ක්‍රියා කරයි.",
    "ldHeadline": "පරිගණකයට එරෙහිව Texas Hold’em පෝකර් ක්‍රීඩා කරන්න, නොමිලේ සහ ඕෆ්ලයින්",
    "ldDesc": "PokerTH වෙබ් සේවාලාභියාගේ පුහුණු ප්‍රකාරය: පරිගණක ප්‍රතිවාදීන්ට එරෙහිව Texas Hold’em, දුෂ්කරතා මට්ටම්, ක්‍රීඩා විලාස සහ කුසලාන සමඟ.",
    "h1": "පරිගණකයට එරෙහිව පෝකර් ක්‍රීඩා කරන්න, නොමිලේ සහ ඕෆ්ලයින්",
    "lead": "PokerTH හි පුහුණු ප්‍රකාරය පරිගණක ප්‍රතිවාදීන්ට එරෙහිව සම්පූර්ණ Texas Hold’em තරඟාවලි ඔබේ බ්‍රවුසරයේම බෙදා දෙයි. ගිණුමක් නැත, වෙබ් අඩවිය වරක් විවෘත කළ පසු සම්බන්ධතාවක් අවශ්‍ය නැත, කිසිවක් අවදානමේ නැත: ක්‍රීඩාව ඉගෙන ගැනීමට, නව උපාය මාර්ගයක් අත්හදා බැලීමට හෝ දුම්රියේදී ඉක්මන් ක්‍රීඩාවක් කිරීමට ඇති තැන.",
    "stepsH2": "පියවර තුනකින් ක්‍රීඩාවක් අරඹන්න",
    "steps": [
      [
        "PokerTH විවෘත කර දේශීය / පුහුණුව තෝරන්න",
        "මෙම වෙබ් අඩවිය විවෘත කර පළමු තිරයේ දේශීය / පුහුණුව තෝරන්න. පිවිසීමක් හෝ බාගැනීමක් නැත; වෙබ් අඩවිය වරක් විවෘත කළ පසු, මෙම ප්‍රකාරය සම්බන්ධතාවකින් තොරවද ක්‍රියා කරයි."
      ],
      [
        "ඔබේ මේසය සකසන්න",
        "පරිගණක ප්‍රතිවාදීන් 9 දක්වා, ආරම්භක ස්ටැක් එක, බ්ලයින්ඩ් ඉහළ යන වේගය සහ ක්‍රීඩා වේගය තෝරන්න, නැතහොත් සූදානම් ආකෘතියකින් අරඹන්න. බොට්වරුන්ගේ දුෂ්කරතාවද එම කවුළුවේම තෝරන්න."
      ],
      [
        "ක්‍රීඩාව අරඹන්න",
        "ආරම්භය ඔබන්න: හිස් ආසන පරිගණක ක්‍රීඩකයන්ගෙන් පිරී කාඩ්පත් බෙදා දෙනු ලැබේ. එක් ක්‍රීඩකයෙකු සියලු චිප්ස් අත්පත් කර ගන්නා තෙක් ක්‍රීඩාව පවතී."
      ]
    ],
    "levelsH2": "දුෂ්කරතා මට්ටම් හතරක්",
    "levels": [
      [
        "පහසු",
        "තම අත් වැරදියට තක්සේරු කරන සහ කලාතුරකින් බ්ලෆ් කරන බොට්: පළමු ක්‍රීඩාවකට සුදුසු ප්‍රතිවාදීන්."
      ],
      [
        "සාමාන්‍ය",
        "තම අවස්ථා හොඳින් තක්සේරු කරන සහ ස්ටැක් එක කෙටි වූ විට නිවැරදිව ක්‍රීඩා කරන ස්ථාවර ප්‍රතිවාදීන්."
      ],
      [
        "අමාරු",
        "ශක්තිමත්ම බොට්: නිවැරදි අත් කියවීම, කෙටි ස්ටැක් සමඟ තියුණු ක්‍රීඩාව සහ වැඩි බ්ලෆ්."
      ],
      [
        "මිශ්‍ර",
        "විවිධාකාර මේසයක්, පෙරනිමිය: සාමාන්‍යයෙන් සෑම දහයකින්ම පහසු බොට් තුනක්, සාමාන්‍ය පහක් සහ අමාරු දෙකක්."
      ]
    ],
    "brainH2": "බොට් සිතන ආකාරය",
    "brainP": "සෑම බොට් එකක්ම ඉතිරි කාඩ්පත් බොහෝ වාරයක් බෙදා බලමින්, පොට් එකේ තවමත් සිටින ක්‍රීඩකයන් ගණනට එරෙහිව, අත දිනීමේ තම සැබෑ අවස්ථාව ගණනය කරයි. එය මුල් ස්ථානයේදී වඩා tight ලෙස ක්‍රීඩා කරන අතර පසු ස්ථානයේ සිට steal කරයි, ෆ්ලොප් එකට පෙර Raise කිරීමෙන් පසු continuation bet එකක් තබයි, ශක්තිමත් draw සමඟ semi-bluff කරයි, සහ සාමාන්‍ය මට්ටමේ සිට ඉහළට, ස්ටැක් එක කෙටි වූ විට All-In හෝ Fold ක්‍රීඩාවට මාරු වෙයි.",
    "stylesH2": "ක්‍රීඩා විලාස පහක්",
    "stylesP": "බොට් එකක් ක්‍රීඩාව කෙතරම් හොඳින් කියවනවාද යන්න දුෂ්කරතාව තීරණය කරයි; එය ක්‍රීඩා කරන ආකාරය එහි විලාසය තීරණය කරයි. සෑම නව මේසයකම මිශ්‍ර වන්නේ:",
    "styles": [
      [
        "Rock",
        "ඉතා tight සහ ප්‍රවේශම්, පොට් කිහිපයකට පමණක් ඇතුළු වන අතර කලාතුරකින් බ්ලෆ් කරයි."
      ],
      [
        "Tight-aggressive",
        "හොඳ අත් තෝරා ඒවා සමඟ තදින් ඔට්ටු අල්ලයි."
      ],
      [
        "Loose-aggressive",
        "බොහෝ අත් ක්‍රීඩා කරන අතර ඔබට පීඩනය එල්ල කරයි."
      ],
      [
        "Calling station",
        "ඕනෑවට වඩා Call කරන අතර කලාතුරකින් Raise කරයි."
      ],
      [
        "Maniac",
        "නොකඩවා Raise සහ බ්ලෆ් කරයි."
      ]
    ],
    "formatsH2": "සැබෑ ආකෘති පුහුණු වන්න",
    "formatsP": "සූදානම් සැකසුම් ඔබට සැහැල්ලු, සාමාන්‍ය හෝ වේගවත් ක්‍රීඩාවක් ආරම්භ කිරීමට, නැතහොත් pokerth.net තරඟවල කොන්දේසි යටතේ පුහුණු වීමට ඉඩ දෙයි: නිල Ranking රිද්මය, We Cup සහ කාලය මත පදනම් බ්ලයින්ඩ් සහිත BBC. ඔබේම සැකසුම් ඔබේම ආකෘතියක් ලෙස සුරැකිය හැක.",
    "trophiesH2": "කුසලාන සහ සංඛ්‍යාලේඛන",
    "trophiesP": "පුහුණු ප්‍රකාරයට තමන්ගේම ප්‍රගතියක් ඇත: කාණ්ඩ හයක කුසලාන තිහකට වඩා — ක්‍රීඩා කළ අත්, දිනූ ක්‍රීඩා, ජයග්‍රහණ මාලා, අමාරු බොට් නවයකට එරෙහි ජයක්, බ්ලෆ්, සහ රහස් කිහිපයක්. බොට්වරුන්ට එරෙහි සංඛ්‍යාලේඛන ඔබේ මාර්ගගත ක්‍රීඩාවලින් වෙන්ව තබා ඇති අතර, ඔබ pokerth.net ගිණුමකින් පිවිසෙන විට ඔබේ කුසලාන ඔබේ අනෙකුත් උපාංගවලටද ඔබ සමඟ පැමිණේ.",
    "learnH2": "ඉගෙනීමට හොඳම තැන",
    "learnP": "වෙබ් සේවාලාභියාගේ සෑම ආධාරයක්ම මෙහි පීඩනයකින් තොරව ක්‍රියා කරයි: කාඩ් එළියට එන විට ඔබේ ජය අවස්ථාව පෙන්වන සම්භාවිතා ටැබය, අතේ ශක්තිය පෙන්වීම, පෙර තෝරාගත් ක්‍රියා සහ යතුරුපුවරු කෙටිමං. ඔබ සූදානම් යැයි හැඟෙන විට, එම මේසයම pokerth.net හි සැබෑ ක්‍රීඩකයන්ට එරෙහිව ඔබ එනතුරු බලා සිටී.",
    "offlineH2": "ඕෆ්ලයින්, සෑම උපාංගයකම",
    "offlineP": "PokerTH යනු වෙබ් යෙදුමකි: එය iPhone, Android, Windows, macOS සහ Linux හි බ්‍රවුසරයේ ක්‍රියා කරන අතර, යෙදුමක් මෙන් මුල් තිරයට එක් කළ හැක. වරක් විවෘත කළ පසු, පුහුණු ප්‍රකාරයට කිසිදු සම්බන්ධතාවක් අවශ්‍ය නැත — ගුවන් යානා ප්‍රකාරයේ, මෙට්‍රෝවේ හෝ සංඥා නැති ඕනෑම තැනක.",
    "faqH2": "ප්‍රශ්න",
    "faq": [
      [
        "පරිගණකයට එරෙහිව නොමිලේ පෝකර් ක්‍රීඩා කළ හැකිද?",
        "ඔව්. PokerTH යනු දැන්වීම් සහ යෙදුම තුළ මිලදී ගැනීම් නොමැති නොමිලේ, විවෘත මූලාශ්‍ර මෘදුකාංගයකි. චිප්ස් ක්‍රීඩා මුදල් පමණි."
      ],
      [
        "මට ගිණුමක් හෝ සම්බන්ධතාවක් අවශ්‍යද?",
        "නැත. පුහුණු ප්‍රකාරයට ගිණුමක් අවශ්‍ය නැති අතර, වෙබ් අඩවිය වරක් විවෘත කළ පසු එය සම්බන්ධතාවකින් තොරව ක්‍රියා කරයි."
      ],
      [
        "පරිගණක ප්‍රතිවාදීන් කී දෙනෙකුට එරෙහිව ක්‍රීඩා කළ හැකිද?",
        "9 දක්වා, ක්‍රීඩකයන් 10 දෙනෙකුගේ සම්පූර්ණ මේසයක් සඳහා, නැතහොත් heads-up සඳහා එක් අයෙකු පමණි."
      ],
      [
        "බොට් හොඳද?",
        "එය ඔබ මත රඳා පවතී: පහසු බොට් වැරදි කරයි, අමාරු බොට් තම අවස්ථා නිවැරදිව කියවා වැඩිපුර බ්ලෆ් කරයි, සහ මිශ්‍ර මේසය මට්ටම් තුන ක්‍රීඩා විලාස පහක් සමඟ මිශ්‍ර කරයි."
      ],
      [
        "මිතුරන් සහ බොට් සමඟ එකම මේසයේ ක්‍රීඩා කළ හැකිද?",
        "ඔව්. ඔබ ඔබේම PokerTH සේවාදායකයක, LAN ජාලයක හෝ අන්තර්ජාලයේ මේසයක් සත්කාරකත්වය දෙන විට, රැඳී සිටීමේ කාමරයට හිස් ආසන පරිගණක ක්‍රීඩකයන්ගෙන් පිරවිය හැක."
      ]
    ]
  },
  sk: {
    "title": "Poker proti počítaču — zadarmo, offline | PokerTH",
    "desc": "Texas Hold’em zadarmo proti počítačovým súperom, až 9 botov pri vašom stole, od ľahkých po ťažkých. Bez účtu, bez peňazí a funguje offline na mobile aj PC.",
    "ldHeadline": "Hrajte Texas Hold’em poker proti počítaču, zadarmo a offline",
    "ldDesc": "Tréningový režim webového klienta PokerTH: Texas Hold’em proti počítačovým súperom, s úrovňami obtiažnosti, hernými štýlmi a trofejami.",
    "h1": "Hrajte poker proti počítaču, zadarmo a offline",
    "lead": "Tréningový režim PokerTH rozdáva celé turnaje v Texas Hold’em proti počítačovým súperom priamo vo vašom prehliadači. Bez účtu, bez pripojenia, keď už stránku raz otvoríte, a nič nie je v stávke: miesto, kde sa naučíte hru, vyskúšate novú stratégiu alebo si zahráte rýchlu partiu vo vlaku.",
    "stepsH2": "Spustite hru v troch krokoch",
    "steps": [
      [
        "Otvorte PokerTH a vyberte Lokálne / tréning",
        "Otvorte túto stránku a na prvej obrazovke vyberte Lokálne / tréning. Žiadne prihlásenie ani sťahovanie; keď už stránku raz otvoríte, režim funguje aj bez pripojenia."
      ],
      [
        "Pripravte si stôl",
        "Vyberte až 9 počítačových súperov, počiatočný stack, ako rýchlo rastú blindy a rýchlosť hry, alebo začnite z hotového formátu. V tom istom okne vyberte obtiažnosť botov."
      ],
      [
        "Spustite hru",
        "Stlačte Štart: prázdne miesta obsadia počítačoví hráči a rozdajú sa karty. Hra pokračuje, kým jeden hráč nemá všetky žetóny."
      ]
    ],
    "levelsH2": "Štyri úrovne obtiažnosti",
    "levels": [
      [
        "Ľahká",
        "Boti, ktorí zle odhadujú svoje karty a zriedka blafujú: tí správni súperi na prvú hru."
      ],
      [
        "Normálna",
        "Solídni súperi, ktorí dobre odhadujú svoje šance a hrajú správne, keď sa im stack skracuje."
      ],
      [
        "Ťažká",
        "Najsilnejší boti: presné čítanie kariet súpera, ostrá hra s krátkym stackom a viac blufov."
      ],
      [
        "Zmiešaná",
        "Pestrý stôl, predvolený: v priemere na každých desať tri ľahkí boti, piati normálni a dvaja ťažkí."
      ]
    ],
    "brainH2": "Ako boti uvažujú",
    "brainP": "Každý bot si vypočíta svoju skutočnú šancu vyhrať rozdanie tak, že zostávajúce karty mnohokrát rozdá, proti počtu hráčov, ktorí sú ešte v banku. Z ranej pozície hrá tesnejšie a z neskorej pozície kradne, po Raise pred flopom robí pokračovaciu stávku (c-bet), so silnými dotiahnutiami robí semi-bluf a od normálnej úrovne vyššie prechádza pri krátkom stacku na hru all-in alebo fold.",
    "stylesH2": "Päť herných štýlov",
    "stylesP": "Obtiažnosť určuje, ako dobre bot číta hru; jeho štýl určuje, ako hrá. Každý nový stôl mieša:",
    "styles": [
      [
        "Rock",
        "veľmi tesný a opatrný, vstupuje do málo bankov a zriedka blafuje."
      ],
      [
        "Tight-agresívny (TAG)",
        "vyberá si dobré karty a stavia na ne vysoko."
      ],
      [
        "Loose-agresívny (LAG)",
        "hrá veľa rozdaní a tlačí na vás."
      ],
      [
        "Calling station",
        "dáva Call príliš často a Raise zriedka."
      ],
      [
        "Maniak",
        "neustále dáva Raise a blafuje."
      ]
    ],
    "formatsH2": "Trénujte skutočné formáty",
    "formatsP": "Hotové nastavenia vám umožnia spustiť hru typu Pokojná, Normálna alebo Rýchla, alebo trénovať v podmienkach súťaží pokerth.net: oficiálne tempo Rebríček, We Cup a BBC s blindami, ktoré rastú podľa času. Vlastné nastavenia si môžete uložiť ako vlastný formát.",
    "trophiesH2": "Trofeje a štatistiky",
    "trophiesP": "Tréningový režim má vlastný postup: viac ako tridsať trofejí v šiestich kategóriách — odohrané rozdania, vyhraté hry, série víťazstiev, víťazstvo proti deviatim ťažkým botom, blufy a pár tajomstiev. Štatistiky proti botom sa vedú oddelene od vašich online hier, a keď sa prihlásite s účtom pokerth.net, trofeje vás nasledujú aj na ďalšie zariadenia.",
    "learnH2": "Najlepšie miesto na učenie",
    "learnP": "Každá pomôcka webového klienta tu funguje bez tlaku: karta Šance s vašou šancou na výhru, ako prichádzajú karty, zobrazenie sily kombinácie, vopred zvolené akcie a klávesové skratky. Keď sa budete cítiť pripravení, ten istý stôl vás čaká na pokerth.net proti skutočným hráčom.",
    "offlineH2": "Offline, na každom zariadení",
    "offlineP": "PokerTH je webová aplikácia: beží v prehliadači na iPhone, Android, Windows, macOS a Linux a dá sa pridať na plochu ako aplikácia. Keď ju raz otvoríte, tréningový režim nepotrebuje vôbec žiadne pripojenie — v režime lietadla, v metre alebo kdekoľvek bez signálu.",
    "faqH2": "Otázky",
    "faq": [
      [
        "Môžem hrať poker proti počítaču zadarmo?",
        "Áno. PokerTH je bezplatný softvér s otvoreným zdrojovým kódom, bez reklám a bez nákupov v aplikácii. Žetóny sú len herné peniaze."
      ],
      [
        "Potrebujem účet alebo pripojenie?",
        "Nie. Tréningový režim nepotrebuje účet, a keď už stránku raz otvoríte, funguje bez pripojenia."
      ],
      [
        "Proti koľkým počítačovým súperom môžem hrať?",
        "Až proti 9, pre plný stôl 10 hráčov, alebo len proti jednému na hru jeden na jedného."
      ],
      [
        "Sú boti dobrí?",
        "Záleží na vás: ľahkí boti robia chyby, ťažkí presne odhadujú svoje šance a viac blafujú a zmiešaný stôl kombinuje tri úrovne s piatimi hernými štýlmi."
      ],
      [
        "Môžem hrať s priateľmi a botmi pri jednom stole?",
        "Áno. Keď hostíte stôl na vlastnom serveri PokerTH, v sieti LAN alebo na internete, čakáreň môže prázdne miesta zaplniť počítačovými hráčmi."
      ]
    ]
  },
  sl: {
    "title": "Poker proti računalniku — brezplačno, brez povezave | PokerTH",
    "desc": "Brezplačen Texas Hold’em proti računalniku, do 9 botov za tvojo mizo, od lahkih do težkih. Brez računa in denarja; deluje brez povezave na telefonu in PC-ju.",
    "ldHeadline": "Igraj Texas Hold’em poker proti računalniku, brezplačno in brez povezave",
    "ldDesc": "Način vadbe spletnega odjemalca PokerTH: Texas Hold’em proti računalniškim nasprotnikom, s stopnjami težavnosti, slogi igre in trofejami.",
    "h1": "Igraj poker proti računalniku, brezplačno in brez povezave",
    "lead": "Način vadbe v PokerTH deli celotne turnirje Texas Hold’em proti računalniškim nasprotnikom, kar v tvojem brskalniku. Brez računa, brez povezave, ko je stran enkrat odprta, in brez vložka: kraj, kjer se naučiš igre, preizkusiš novo strategijo ali odigraš hitro igro na vlaku.",
    "stepsH2": "Začni igro v treh korakih",
    "steps": [
      [
        "Odpri PokerTH in izberi Lokalno / vadba",
        "Odpri to stran in na prvem zaslonu izberi Lokalno / vadba. Ni prijave in ni prenosa; ko je stran enkrat odprta, način deluje tudi brez povezave."
      ],
      [
        "Nastavi svojo mizo",
        "Izberi do 9 računalniških nasprotnikov, začetne žetone, kako hitro se zvišujejo blindi, in hitrost igre ali pa začni iz pripravljenega formata. Težavnost botov izbereš v istem oknu."
      ],
      [
        "Začni igro",
        "Pritisni Začni: prazna mesta se zapolnijo z računalniškimi igralci in karte se razdelijo. Igra teče, dokler en igralec nima vseh žetonov."
      ]
    ],
    "levelsH2": "Štiri stopnje težavnosti",
    "levels": [
      [
        "Lahko",
        "Boti, ki napačno ocenjujejo svoje roke in redko blefirajo: pravi nasprotniki za prvo igro."
      ],
      [
        "Običajno",
        "Trdni nasprotniki, ki dobro ocenijo svoje možnosti in pravilno igrajo, ko jim zmanjkuje žetonov."
      ],
      [
        "Težko",
        "Najmočnejši boti: natančno branje rok, ostra igra z malo žetoni in več blefov."
      ],
      [
        "Mešano",
        "Raznolika miza, privzeta nastavitev: v povprečju trije lahki boti, pet običajnih in dva težka na vsakih deset."
      ]
    ],
    "brainH2": "Kako razmišljajo boti",
    "brainP": "Vsak bot izračuna svojo dejansko možnost za zmago v roki tako, da preostale karte razdeli velikokrat, glede na število igralcev, ki so še v igri za banko. V zgodnjem položaju igra trdneje, iz poznega položaja krade, po dvigu pred flopom nadaljuje s continuation betom, z močnimi nedokončanimi rokami polblefira in od običajne stopnje naprej preide na igro all-in ali fold, ko mu zmanjkuje žetonov.",
    "stylesH2": "Pet slogov igre",
    "stylesP": "Težavnost določa, kako dobro bot bere igro; slog določa, kako igra. Vsaka nova miza meša:",
    "styles": [
      [
        "Rock",
        "zelo trden in previden, vstopi v malo bank in redko blefira."
      ],
      [
        "Trdno-agresiven",
        "izbira dobre roke in z njimi močno stavi."
      ],
      [
        "Ohlapno-agresiven",
        "igra veliko rok in te spravlja pod pritisk."
      ],
      [
        "Calling station",
        "veliko prepogosto izenači in redko dvigne."
      ],
      [
        "Manijak",
        "nenehno dviguje in blefira."
      ]
    ],
    "formatsH2": "Vadi prave formate",
    "formatsP": "Pripravljene nastavitve ti omogočijo začeti igro Sproščeno, Običajno ali Hitro ali pa vaditi v pogojih tekmovanj na pokerth.net: uradni tempo iger Uvrstitev, We Cup in BBC z blindi, ki rastejo s časom. Svoje nastavitve lahko shraniš kot lasten format.",
    "trophiesH2": "Trofeje in statistika",
    "trophiesP": "Način vadbe ima svoje napredovanje: več kot trideset trofej v šestih kategorijah — odigrane roke, dobljene igre, nizi zmag, zmaga proti devetim težkim botom, blefi in nekaj skrivnosti. Statistika proti botom se vodi ločeno od tvojih spletnih iger, in ko se prijaviš z računom pokerth.net, te trofeje spremljajo tudi na drugih napravah.",
    "learnH2": "Najboljši kraj za učenje",
    "learnP": "Vsi pripomočki spletnega odjemalca tu delujejo brez pritiska: zavihek Kvote s tvojo možnostjo za zmago, ko se karte razkrivajo, prikaz moči roke, vnaprej izbrane poteze in tipkovne bližnjice. Ko se počutiš pripravljenega, te ista miza čaka na pokerth.net proti pravim igralcem.",
    "offlineH2": "Brez povezave, na vsaki napravi",
    "offlineP": "PokerTH je spletna aplikacija: deluje v brskalniku na napravah iPhone in Android ter v sistemih Windows, macOS in Linux, na domači zaslon pa jo lahko dodaš kot aplikacijo. Ko je enkrat odprt, način vadbe sploh ne potrebuje povezave — v letalskem načinu, na podzemni železnici ali kjer koli brez signala.",
    "faqH2": "Vprašanja",
    "faq": [
      [
        "Ali lahko brezplačno igram poker proti računalniku?",
        "Da. PokerTH je brezplačna in odprtokodna programska oprema brez oglasov in nakupov v aplikaciji. Žetoni so le za igro."
      ],
      [
        "Ali potrebujem račun ali povezavo?",
        "Ne. Način vadbe ne potrebuje računa, in ko je stran enkrat odprta, deluje brez povezave."
      ],
      [
        "Proti koliko računalniškim nasprotnikom lahko igram?",
        "Do 9, za polno mizo 10 igralcev, ali proti enemu samemu za igro ena na ena."
      ],
      [
        "Ali so boti dobri?",
        "To je odvisno od tebe: lahki boti delajo napake, težki boti natančno ocenijo svoje možnosti in pogosteje blefirajo, mešana miza pa združuje tri stopnje s petimi slogi igre."
      ],
      [
        "Ali lahko za isto mizo igram s prijatelji in boti?",
        "Da. Ko gostiš mizo na svojem strežniku PokerTH, v LAN-u ali na internetu, lahko čakalnica prazna mesta zapolni z računalniškimi igralci."
      ]
    ]
  },
  sq: {
    "title": "Luaj poker kundër kompjuterit — falas, offline | PokerTH",
    "desc": "Texas Hold’em falas kundër kompjuterit, deri në 9 botë në tavolinën tënde, nga të lehtët te të vështirët. Pa llogari, pa para, funksionon offline në telefon e PC.",
    "ldHeadline": "Luaj poker Texas Hold’em kundër kompjuterit, falas dhe offline",
    "ldDesc": "Modaliteti i stërvitjes i klientit web të PokerTH: Texas Hold’em kundër kundërshtarëve të kompjuterit, me nivele vështirësie, stile loje dhe trofe.",
    "h1": "Luaj poker kundër kompjuterit, falas dhe offline",
    "lead": "Modaliteti i stërvitjes i PokerTH shpërndan turne të plota Texas Hold’em kundër kundërshtarëve të kompjuterit, drejtpërdrejt në shfletuesin tënd. Pa llogari, pa lidhje pasi faqja është hapur një herë, dhe pa asgjë në lojë: vendi për të mësuar lojën, për të provuar një strategji të re ose për të luajtur një lojë të shpejtë në tren.",
    "stepsH2": "Nis një lojë në tri hapa",
    "steps": [
      [
        "Hap PokerTH dhe zgjidh Lokal / stërvitje",
        "Hap këtë faqe dhe zgjidh Lokal / stërvitje në ekranin e parë. Nuk ka hyrje me llogari dhe as shkarkim; pasi faqja është hapur një herë, modaliteti funksionon edhe pa lidhje."
      ],
      [
        "Përgatit tavolinën",
        "Zgjidh deri në 9 kundërshtarë të kompjuterit, stokun fillestar, sa shpejt rriten blindet dhe shpejtësinë e lojës, ose nis nga një format i gatshëm. Zgjidh vështirësinë e botëve në të njëjtën dritare."
      ],
      [
        "Nis lojën",
        "Shtyp Nis: vendet bosh mbushen me lojtarë të kompjuterit dhe letrat shpërndahen. Loja vazhdon derisa një lojtar t’i ketë të gjithë zhetonët."
      ]
    ],
    "levelsH2": "Katër nivele vështirësie",
    "levels": [
      [
        "E lehtë",
        "Botë që i vlerësojnë keq duart e tyre dhe rrallë blufojnë: kundërshtarët e duhur për një lojë të parë."
      ],
      [
        "Normale",
        "Kundërshtarë të qëndrueshëm që i lexojnë mirë shanset e tyre dhe luajnë saktë kur stoku u bëhet i vogël."
      ],
      [
        "E vështirë",
        "Botët më të fortë: lexim i saktë i duarve, lojë e mprehtë me stok të vogël dhe më shumë blufe."
      ],
      [
        "E përzier",
        "Një tavolinë e larmishme, parazgjedhja: mesatarisht tre botë të lehtë, pesë normalë dhe dy të vështirë në çdo dhjetë."
      ]
    ],
    "brainH2": "Si mendojnë botët",
    "brainP": "Çdo bot llogarit shansin e vet real për ta fituar dorën duke shpërndarë shumë herë letrat që mbeten, kundrejt numrit të lojtarëve që janë ende në bankë. Luan më ngushtë në pozicionet e hershme dhe vjedh nga pozicionet e vona, bën bast vazhdimi (c-bet) pasi ka ngritur para flopit, bën gjysmë-bluf me draw të fortë dhe, që nga niveli normal e lart, kalon në lojë All-In ose Fold kur stoku i bëhet i vogël.",
    "stylesH2": "Pesë stile loje",
    "stylesP": "Vështirësia përcakton sa mirë e lexon një bot lojën; stili i tij përcakton si luan. Çdo tavolinë e re përzien:",
    "styles": [
      [
        "Rock",
        "shumë i ngushtë dhe i kujdesshëm, hyn në pak banka dhe rrallë blufon."
      ],
      [
        "Tight-agresiv (TAG)",
        "zgjedh duar të mira dhe vë baste të forta me to."
      ],
      [
        "Loose-agresiv (LAG)",
        "luan shumë duar dhe të vë nën presion."
      ],
      [
        "Calling station",
        "bën Call tepër shpesh dhe rrallë ngre."
      ],
      [
        "Maniak",
        "ngre dhe blufon pa pushim."
      ]
    ],
    "formatsH2": "Ushtrohu në formatet e vërteta",
    "formatsP": "Cilësimet e gatshme të lejojnë të nisësh një lojë me formatin I qetë, Normale ose E shpejtë, ose të ushtrohesh në kushtet e garave të pokerth.net: ritmi zyrtar Renditje, We Cup dhe BBC me blindet e saj bazuar në kohë. Cilësimet e tua mund t’i ruash si një format tëndin.",
    "trophiesH2": "Trofe dhe statistika",
    "trophiesP": "Modaliteti i stërvitjes ka progresin e vet: më shumë se tridhjetë trofe në gjashtë kategori — duar të luajtura, lojëra të fituara, seri fitoresh, një fitore kundër nëntë botëve të vështirë, blufe dhe disa sekrete. Statistikat kundër botëve mbahen veçmas nga lojërat e tua online, dhe kur hyn me një llogari pokerth.net, trofetë të ndjekin në pajisjet e tua të tjera.",
    "learnH2": "Vendi më i mirë për të mësuar",
    "learnP": "Çdo ndihmë e klientit web funksionon këtu pa presion: skeda Shanset me shansin tënd për të fituar ndërsa dalin letrat, treguesi i forcës së dorës, veprimet e parazgjedhura dhe shkurtoret e tastierës. Kur të ndihesh gati, e njëjta tavolinë të pret në pokerth.net kundër lojtarëve të vërtetë.",
    "offlineH2": "Offline, në çdo pajisje",
    "offlineP": "PokerTH është një aplikacion web: funksionon në shfletues në iPhone, Android, Windows, macOS dhe Linux, dhe mund të shtohet në ekranin fillestar si aplikacion. Pasi hapet, modaliteti i stërvitjes nuk ka nevojë fare për lidhje — në modalitetin e aeroplanit, në metro ose kudo pa sinjal.",
    "faqH2": "Pyetje",
    "faq": [
      [
        "A mund të luaj poker kundër kompjuterit falas?",
        "Po. PokerTH është softuer falas dhe me kod të hapur, pa reklama dhe pa blerje brenda aplikacionit. Zhetonët janë vetëm para loje."
      ],
      [
        "A më duhet llogari apo lidhje?",
        "Jo. Modaliteti i stërvitjes nuk kërkon llogari dhe, pasi faqja është hapur një herë, funksionon pa lidhje."
      ],
      [
        "Kundër sa kundërshtarëve të kompjuterit mund të luaj?",
        "Deri në 9, për një tavolinë të plotë me 10 lojtarë, ose kundër vetëm një për lojë një-me-një."
      ],
      [
        "A janë të mirë botët?",
        "Kjo varet nga ti: botët e lehtë bëjnë gabime, të vështirët i lexojnë saktë shanset e tyre dhe blufojnë më shumë, ndërsa tavolina e përzier i kombinon tri nivelet me pesë stile loje."
      ],
      [
        "A mund të luaj me miqtë dhe me botë në të njëjtën tavolinë?",
        "Po. Kur hap një tavolinë në serverin tënd PokerTH, në LAN ose në internet, dhoma e pritjes mund t’i mbushë vendet bosh me lojtarë të kompjuterit."
      ]
    ]
  },
  sr: {
    "title": "Играј покер против рачунара — бесплатно, офлајн | PokerTH",
    "desc": "Бесплатан Texas Hold’em против рачунара: до 9 ботова за вашим столом, од лаких до тешких. Без налога, без новца, и ради офлајн на телефону и рачунару.",
    "ldHeadline": "Играјте Texas Hold’em покер против рачунара, бесплатно и офлајн",
    "ldDesc": "Режим вежбања PokerTH веб клијента: Texas Hold’em против рачунарских противника, са нивоима тежине, стиловима игре и трофејима.",
    "h1": "Играјте покер против рачунара, бесплатно и офлајн",
    "lead": "Режим вежбања у PokerTH-у дели потпуне Texas Hold’em турнире против рачунарских противника, директно у вашем прегледачу. Без налога, без везе када се сајт једном отвори и без ичега на улогу: право место да научите игру, испробате нову стратегију или одиграте брзу партију у возу.",
    "stepsH2": "Почните партију у три корака",
    "steps": [
      [
        "Отворите PokerTH и изаберите Локално / вежбање",
        "Отворите овај сајт и на првом екрану изаберите Локално / вежбање. Нема пријављивања ни преузимања; када се сајт једном отвори, режим ради и без везе."
      ],
      [
        "Поставите свој сто",
        "Изаберите до 9 рачунарских противника, почетни стек, колико брзо расту блајндови и брзину игре, или почните од готовог формата. Тежину ботова изаберите у истом прозору."
      ],
      [
        "Почните игру",
        "Притисните „Početak“: празна места попуњавају рачунарски играчи и карте се деле. Игра траје док један играч не освоји све жетоне."
      ]
    ],
    "levelsH2": "Четири нивоа тежине",
    "levels": [
      [
        "Lako",
        "Ботови који погрешно процењују своје руке и ретко блефирају: прави противници за прву партију."
      ],
      [
        "Normalno",
        "Солидни противници који добро читају своје шансе и играју исправно када им стек постане мали."
      ],
      [
        "Teško",
        "Најјачи ботови: прецизно читање руку, оштра игра са малим стеком и више блефова."
      ],
      [
        "Mešano",
        "Разноврстан сто, подразумевано: у просеку три лака бота, пет нормалних и два тешка на сваких десет."
      ]
    ],
    "brainH2": "Како ботови размишљају",
    "brainP": "Сваки бот израчунава своју стварну шансу да добије руку тако што много пута подели преостале карте, према броју играча који су још у поту. Игра чвршће са ране позиције и краде са касне, после повишења пре флопа наставља улогом (continuation bet), полублефира са јаким чекањима и, од нормалног нивоа навише, прелази на игру All-In или Fold када му стек постане мали.",
    "stylesH2": "Пет стилова игре",
    "stylesP": "Тежина одређује колико добро бот чита игру; стил одређује како игра. Сваки нови сто меша:",
    "styles": [
      [
        "Рок (Rock)",
        "веома чврст и опрезан, улази у мало потова и ретко блефира."
      ],
      [
        "TAG (тајт-агресиван)",
        "бира добре руке и снажно их игра."
      ],
      [
        "LAG (лузе-агресиван)",
        "игра много руку и врши притисак на вас."
      ],
      [
        "Calling station",
        "плаћа пречесто и ретко повишава."
      ],
      [
        "Манијак",
        "стално повишава и блефира."
      ]
    ],
    "formatsH2": "Вежбајте праве формате",
    "formatsP": "Готова подешавања вам омогућавају да почнете партију у формату „Mirna“, „Normalna“ или „Brza“, или да вежбате у условима такмичења на pokerth.net: званични темпо „Ранг-листа“, We Cup и BBC са блајндовима по времену. Своја подешавања можете да сачувате као сопствени формат.",
    "trophiesH2": "Трофеји и статистика",
    "trophiesP": "Режим вежбања има сопствени напредак: више од тридесет трофеја у шест категорија — одигране руке, добијене партије, низови победа, победа против девет тешких ботова, блефови и неколико тајни. Статистика против ботова води се одвојено од ваших онлајн партија, а када се пријавите pokerth.net налогом, трофеји вас прате на другим уређајима.",
    "learnH2": "Најбоље место за учење",
    "learnP": "Свака помоћ веб клијента овде ради без притиска: картица Шансе са вашом шансом за победу како карте излазе, приказ јачине руке, унапред изабране акције и пречице тастатуре. Када се осетите спремним, исти сто вас чека на pokerth.net против правих играча.",
    "offlineH2": "Офлајн, на сваком уређају",
    "offlineP": "PokerTH је веб апликација: ради у прегледачу на iPhone, Android, Windows, macOS и Linux уређајима и може да се дода на почетни екран као апликација. Када се једном отвори, режиму вежбања уопште није потребна веза — у режиму рада у авиону, у метроу или било где без сигнала.",
    "faqH2": "Питања",
    "faq": [
      [
        "Да ли могу бесплатно да играм покер против рачунара?",
        "Да. PokerTH је бесплатан софтвер отвореног кода, без реклама и без куповина у апликацији. Жетони су само новац за игру."
      ],
      [
        "Да ли ми треба налог или веза?",
        "Не. Режиму вежбања не треба налог, а када се сајт једном отвори, ради без везе."
      ],
      [
        "Против колико рачунарских противника могу да играм?",
        "До 9, за пун сто од 10 играча, или само против једног, један на један."
      ],
      [
        "Да ли су ботови добри?",
        "То зависи од вас: лаки ботови греше, тешки прецизно читају своје шансе и више блефирају, а мешани сто комбинује три нивоа са пет стилова игре."
      ],
      [
        "Могу ли да играм са пријатељима и ботовима за истим столом?",
        "Да. Када отворите сто на сопственом PokerTH серверу, на LAN мрежи или на интернету, чекаоница може да попуни празна места рачунарским играчима."
      ]
    ]
  },
  sv: {
    "title": "Spela poker mot datorn — gratis och offline | PokerTH",
    "desc": "Gratis Texas Hold’em mot datormotståndare, upp till 9 botar vid ditt bord, från lätta till svåra. Inget konto, inga pengar, och det fungerar offline på mobil och dator.",
    "ldHeadline": "Spela Texas Hold’em-poker mot datorn, gratis och offline",
    "ldDesc": "Träningsläget i PokerTH:s webbklient: Texas Hold’em mot datormotståndare, med svårighetsnivåer, spelstilar och troféer.",
    "h1": "Spela poker mot datorn, gratis och offline",
    "lead": "Träningsläget i PokerTH delar ut kompletta Texas Hold’em-turneringar mot datormotståndare, direkt i webbläsaren. Inget konto, ingen uppkoppling när sajten väl har öppnats, och ingenting på spel: platsen där du lär dig spelet, provar en ny strategi eller tar en snabb runda på tåget.",
    "stepsH2": "Starta ett spel i tre steg",
    "steps": [
      [
        "Öppna PokerTH och välj Lokal / träning",
        "Öppna den här sajten och välj Lokal / träning på första skärmen. Ingen inloggning och ingen nedladdning; när sajten väl har öppnats fungerar läget även utan uppkoppling."
      ],
      [
        "Ställ in ditt bord",
        "Välj upp till 9 datormotståndare, startstacken, hur snabbt mörkarna höjs och spelhastigheten, eller utgå från ett färdigt format. Välj botarnas svårighetsgrad i samma fönster."
      ],
      [
        "Starta spelet",
        "Tryck på Starta: de tomma platserna fylls med datorspelare och korten delas ut. Spelet pågår tills en spelare har alla marker."
      ]
    ],
    "levelsH2": "Fyra svårighetsnivåer",
    "levels": [
      [
        "Lätt",
        "Botar som felbedömer sina händer och sällan bluffar: rätt motståndare för ett första spel."
      ],
      [
        "Normal",
        "Stabila motståndare som bedömer sina chanser väl och spelar rätt när stacken blir kort."
      ],
      [
        "Svår",
        "De starkaste botarna: exakt handläsning, skarpt spel med kort stack och fler bluffar."
      ],
      [
        "Blandad",
        "Ett varierat bord, standardvalet: i snitt tre lätta botar, fem normala och två svåra av tio."
      ]
    ],
    "brainH2": "Hur botarna tänker",
    "brainP": "Varje bot räknar ut sin verkliga chans att vinna handen genom att dela ut de återstående korten många gånger, mot det antal spelare som fortfarande är kvar i potten. Den spelar tightare i tidig position och stjäl från sen position, c-bettar (continuation bet) efter en höjning före floppen, semibluffar med starka dragningar och går från normal nivå och uppåt över till all-in eller Fold när stacken blir kort.",
    "stylesH2": "Fem spelstilar",
    "stylesP": "Svårighetsgraden avgör hur väl en bot läser spelet; stilen avgör hur den spelar. Varje nytt bord blandar:",
    "styles": [
      [
        "Rock",
        "mycket tight och försiktig, går in i få pottar och bluffar sällan."
      ],
      [
        "Tight-aggressiv (TAG)",
        "väljer bra händer och satsar hårt med dem."
      ],
      [
        "Loose-aggressiv (LAG)",
        "spelar många händer och sätter press på dig."
      ],
      [
        "Calling station",
        "synar alldeles för ofta och höjer sällan."
      ],
      [
        "Maniac",
        "höjer och bluffar hela tiden."
      ]
    ],
    "formatsH2": "Öva på de riktiga formaten",
    "formatsP": "Färdiga inställningar låter dig starta ett Avslappnad-, Normal- eller Snabb-spel, eller öva under samma villkor som tävlingarna på pokerth.net: det officiella Ranking-tempot, We Cup och BBC med sina tidsbaserade mörkar. Dina egna inställningar kan sparas som ett eget format.",
    "trophiesH2": "Troféer och statistik",
    "trophiesP": "Träningsläget har en egen progression: över trettio troféer i sex kategorier — spelade händer, vunna spel, vinstsviter, en seger mot nio svåra botar, bluffar och några hemligheter. Statistiken mot botarna hålls åtskild från dina onlinespel, och när du loggar in med ett pokerth.net-konto följer dina troféer med till dina andra enheter.",
    "learnH2": "Det bästa stället att lära sig",
    "learnP": "Alla hjälpmedel i webbklienten fungerar här utan press: fliken Chanser med din chans att vinna allteftersom korten kommer, visningen av handstyrka, förvalda åtgärder och kortkommandon. När du känner dig redo väntar samma bord på dig på pokerth.net mot riktiga spelare.",
    "offlineH2": "Offline, på alla enheter",
    "offlineP": "PokerTH är en webbapp: den körs i webbläsaren på iPhone, Android, Windows, macOS och Linux och kan läggas till på hemskärmen som en app. När den väl har öppnats behöver träningsläget ingen uppkoppling alls — i flygplansläge, i tunnelbanan eller var som helst utan täckning.",
    "faqH2": "Frågor",
    "faq": [
      [
        "Kan jag spela poker mot datorn gratis?",
        "Ja. PokerTH är gratis programvara med öppen källkod, utan reklam och utan köp i appen. Markerna är bara låtsaspengar."
      ],
      [
        "Behöver jag ett konto eller en uppkoppling?",
        "Nej. Träningsläget kräver inget konto, och när sajten väl har öppnats fungerar det utan uppkoppling."
      ],
      [
        "Hur många datormotståndare kan jag spela mot?",
        "Upp till 9, för ett fullt bord med 10 spelare, eller en enda för att spela en mot en."
      ],
      [
        "Är botarna bra?",
        "Det bestämmer du: lätta botar gör misstag, svåra botar bedömer sina chanser exakt och bluffar mer, och det blandade bordet kombinerar de tre nivåerna med fem spelstilar."
      ],
      [
        "Kan jag spela med vänner och botar vid samma bord?",
        "Ja. När du är värd för ett bord på din egen PokerTH-server, i ett LAN eller på internet, kan väntrummet fylla de tomma platserna med datorspelare."
      ]
    ]
  },
  sw: {
    "title": "Cheza poka dhidi ya kompyuta — bure, bila mtandao | PokerTH",
    "desc": "Texas Hold’em bure dhidi ya kompyuta, hadi boti 9 kwenye meza yako, kuanzia rahisi hadi ngumu. Bila akaunti, bila pesa, na hufanya kazi bila mtandao kwa simu na PC.",
    "ldHeadline": "Cheza poka ya Texas Hold’em dhidi ya kompyuta, bure na bila mtandao",
    "ldDesc": "Hali ya mazoezi ya programu ya wavuti ya PokerTH: Texas Hold’em dhidi ya wapinzani wa kompyuta, yenye viwango vya ugumu, mitindo ya uchezaji na vikombe.",
    "h1": "Cheza poka dhidi ya kompyuta, bure na bila mtandao",
    "lead": "Hali ya mazoezi ya PokerTH hugawa mashindano kamili ya Texas Hold’em dhidi ya wapinzani wa kompyuta, moja kwa moja kwenye kivinjari chako. Bila akaunti, bila muunganisho baada ya tovuti kufunguliwa mara moja, na bila chochote hatarini: mahali pa kujifunza mchezo, kujaribu mkakati mpya, au kucheza mchezo wa haraka ukiwa kwenye treni.",
    "stepsH2": "Anza mchezo kwa hatua tatu",
    "steps": [
      [
        "Fungua PokerTH na uchague Ndani / mazoezi",
        "Fungua tovuti hii na uchague Ndani / mazoezi kwenye skrini ya kwanza. Hakuna kuingia wala kupakua; tovuti ikishafunguliwa mara moja, hali hii hufanya kazi pia bila muunganisho."
      ],
      [
        "Andaa meza yako",
        "Chagua hadi wapinzani 9 wa kompyuta, chipu za kuanzia, kasi ya kupanda kwa dau la kulazimishwa na kasi ya mchezo, au anza kutoka muundo ulio tayari. Chagua ugumu wa boti katika dirisha hilo hilo."
      ],
      [
        "Anza mchezo",
        "Bonyeza Anza: viti vilivyo wazi hujazwa na wachezaji wa kompyuta na karata hugawiwa. Mchezo huendelea hadi mchezaji mmoja ashike chipu zote."
      ]
    ],
    "levelsH2": "Viwango vinne vya ugumu",
    "levels": [
      [
        "Rahisi",
        "Boti wanaokadiria vibaya mikono yao na mara chache huhadaa: wapinzani wanaofaa kwa mchezo wa kwanza."
      ],
      [
        "Kawaida",
        "Wapinzani imara wanaosoma nafasi zao vizuri na kucheza kwa usahihi chipu zao zinapopungua."
      ],
      [
        "Ngumu",
        "Boti wenye nguvu zaidi: kusoma mikono kwa usahihi, uchezaji makini wakiwa na chipu chache na kuhadaa zaidi."
      ],
      [
        "Mchanganyiko",
        "Meza ya aina mbalimbali, chaguo-msingi: kwa wastani boti watatu rahisi, watano wa kawaida na wawili wagumu katika kila kumi."
      ]
    ],
    "brainH2": "Jinsi boti wanavyofikiri",
    "brainP": "Kila boti hukokotoa nafasi yake halisi ya kushinda mkono kwa kugawa karata zilizosalia mara nyingi, dhidi ya idadi ya wachezaji ambao bado wako kwenye pot. Hucheza kwa kubana zaidi akiwa katika nafasi za mwanzo na huiba kutoka nafasi za mwisho, hufanya continuation bet baada ya kupandisha kabla ya flop, hufanya semi-bluff akiwa na msubiri imara na, kuanzia kiwango cha kawaida kwenda juu, hubadili kucheza All-In au Fold chipu zake zinapopungua.",
    "stylesH2": "Mitindo mitano ya uchezaji",
    "stylesP": "Ugumu huamua jinsi boti anavyousoma mchezo vizuri; mtindo wake huamua jinsi anavyocheza. Kila meza mpya huchanganya:",
    "styles": [
      [
        "Rock",
        "mbana sana na mwangalifu, huingia pot chache na mara chache huhadaa."
      ],
      [
        "Tight-aggressive",
        "huchagua mikono mizuri na kuiwekea dau kwa nguvu."
      ],
      [
        "Loose-aggressive",
        "hucheza mikono mingi na kukuwekea shinikizo."
      ],
      [
        "Calling station",
        "hufanya Call mara nyingi mno na mara chache hufanya Raise."
      ],
      [
        "Maniac",
        "hufanya Raise na kuhadaa bila kukoma."
      ]
    ],
    "formatsH2": "Fanya mazoezi ya miundo halisi",
    "formatsP": "Mipangilio iliyo tayari hukuwezesha kuanza mchezo wa Tulivu, Kawaida au Haraka, au kufanya mazoezi katika masharti ya mashindano ya pokerth.net: mwendo rasmi wa Ranking, We Cup na BBC yenye dau la kulazimishwa linalopanda kwa muda. Mipangilio yako mwenyewe inaweza kuhifadhiwa kama muundo wako binafsi.",
    "trophiesH2": "Vikombe na takwimu",
    "trophiesP": "Hali ya mazoezi ina maendeleo yake yenyewe: zaidi ya vikombe thelathini katika makundi sita — mikono uliyocheza, michezo uliyoshinda, mfululizo wa ushindi, ushindi dhidi ya boti tisa wagumu, kuhadaa, na siri chache. Takwimu dhidi ya boti huwekwa kando na michezo yako ya mtandaoni, na ukiingia kwa akaunti ya pokerth.net vikombe vyako hukufuata kwenye vifaa vyako vingine.",
    "learnH2": "Mahali bora pa kujifunza",
    "learnP": "Kila msaada wa programu ya wavuti hufanya kazi hapa bila shinikizo: kichupo cha Uwezekano chenye nafasi yako ya kushinda karata zinapotoka, kionyeshi cha nguvu ya mkono, vitendo vilivyochaguliwa mapema na njia za mkato za kibodi. Ukijihisi uko tayari, meza ile ile inakusubiri kwenye pokerth.net dhidi ya wachezaji halisi.",
    "offlineH2": "Bila mtandao, kwenye kila kifaa",
    "offlineP": "PokerTH ni programu ya wavuti: hufanya kazi kwenye kivinjari kwenye iPhone, Android, Windows, macOS na Linux, na inaweza kuongezwa kwenye skrini ya kwanza kama programu. Ikishafunguliwa, hali ya mazoezi haihitaji muunganisho wowote — katika hali ya ndegeni, kwenye treni ya chini ya ardhi au mahali popote pasipo na mtandao.",
    "faqH2": "Maswali",
    "faq": [
      [
        "Je, naweza kucheza poka dhidi ya kompyuta bure?",
        "Ndiyo. PokerTH ni programu bure ya chanzo huria, bila matangazo na bila ununuzi ndani ya programu. Chipu ni pesa za mchezo tu."
      ],
      [
        "Je, ninahitaji akaunti au muunganisho?",
        "Hapana. Hali ya mazoezi haihitaji akaunti, na tovuti ikishafunguliwa mara moja hufanya kazi bila muunganisho."
      ],
      [
        "Ninaweza kucheza dhidi ya wapinzani wangapi wa kompyuta?",
        "Hadi 9, kwa meza kamili ya wachezaji 10, au mmoja tu kwa heads-up."
      ],
      [
        "Je, boti ni wazuri?",
        "Ni juu yako: boti rahisi hufanya makosa, boti wagumu husoma nafasi zao kwa usahihi na kuhadaa zaidi, na meza ya mchanganyiko huchanganya viwango vitatu na mitindo mitano ya uchezaji."
      ],
      [
        "Je, naweza kucheza na marafiki na boti kwenye meza moja?",
        "Ndiyo. Unapoandaa meza kwenye seva yako mwenyewe ya PokerTH, kwenye LAN au kwenye intaneti, chumba cha kusubiri kinaweza kujaza viti vilivyo wazi kwa wachezaji wa kompyuta."
      ]
    ]
  },
  ta: {
    "title": "கணினியுடன் போக்கர் விளையாடுங்கள் — இலவசம், ஆஃப்லைன் | PokerTH",
    "desc": "கணினி எதிராளிகளுடன் இலவச Texas Hold’em: உங்கள் மேசையில் 9 பாட்கள் வரை, எளிதிலிருந்து கடினம் வரை. கணக்கும் பணமும் இல்லை; தொலைபேசியிலும் கணினியிலும் ஆஃப்லைனில் இயங்கும்.",
    "ldHeadline": "கணினியுடன் Texas Hold’em போக்கர் விளையாடுங்கள், இலவசமாக, ஆஃப்லைனில்",
    "ldDesc": "PokerTH வலை செயலியின் பயிற்சி முறை: கணினி எதிராளிகளுடன் Texas Hold’em, சிரம நிலைகள், ஆட்ட பாணிகள், கோப்பைகளுடன்.",
    "h1": "கணினியுடன் போக்கர் விளையாடுங்கள், இலவசமாக, ஆஃப்லைனில்",
    "lead": "PokerTH-இன் பயிற்சி முறை கணினி எதிராளிகளுடன் முழுமையான Texas Hold’em போட்டிகளை உங்கள் உலாவியிலேயே நடத்துகிறது. கணக்கு தேவையில்லை, தளத்தை ஒருமுறை திறந்த பிறகு இணைப்பும் தேவையில்லை, பணயத்தில் எதுவும் இல்லை: ஆட்டத்தைக் கற்க, புதிய உத்தியை முயல, அல்லது ரயிலில் ஒரு விரைவு ஆட்டம் ஆட ஏற்ற இடம்.",
    "stepsH2": "மூன்று படிகளில் ஆட்டத்தைத் தொடங்குங்கள்",
    "steps": [
      [
        "PokerTH-ஐத் திறந்து உள்ளூர் / பயிற்சி என்பதைத் தேர்வுசெய்யுங்கள்",
        "இந்தத் தளத்தைத் திறந்து, முதல் திரையில் உள்ளூர் / பயிற்சி என்பதைத் தேர்ந்தெடுங்கள். உள்நுழைவும் இல்லை, பதிவிறக்கமும் இல்லை; தளத்தை ஒருமுறை திறந்த பிறகு, இந்த முறை இணைப்பு இல்லாமலும் இயங்கும்."
      ],
      [
        "உங்கள் மேசையை அமையுங்கள்",
        "9 வரையிலான கணினி எதிராளிகள், தொடக்கக் காசுகள், கட்டாயப் பணயம் எவ்வளவு வேகமாக உயர்கிறது, ஆட்ட வேகம் ஆகியவற்றைத் தேர்வுசெய்யுங்கள், அல்லது ஆயத்த வடிவத்திலிருந்து தொடங்குங்கள். பாட்களின் சிரமத்தையும் அதே சாளரத்தில் தேர்ந்தெடுங்கள்."
      ],
      [
        "ஆட்டத்தைத் தொடங்குங்கள்",
        "தொடக்கம் என்பதை அழுத்துங்கள்: காலி இருக்கைகள் கணினி வீரர்களால் நிரம்பும், சீட்டுகள் பகிரப்படும். ஒரு வீரரிடம் அனைத்துக் காசுகளும் சேரும் வரை ஆட்டம் தொடரும்."
      ]
    ],
    "levelsH2": "நான்கு சிரம நிலைகள்",
    "levels": [
      [
        "எளிது",
        "தங்கள் கைகளைத் தவறாக மதிப்பிடும், அரிதாகவே பிளஃப் செய்யும் பாட்கள்: முதல் ஆட்டத்துக்கு ஏற்ற எதிராளிகள்."
      ],
      [
        "சாதாரண",
        "தங்கள் வாய்ப்புகளை நன்கு மதிப்பிடும், காசுகள் குறையும்போது சரியாக ஆடும் உறுதியான எதிராளிகள்."
      ],
      [
        "கடினம்",
        "மிக வலுவான பாட்கள்: கைகளைத் துல்லியமாகப் படித்தல், குறைந்த காசுகளுடன் கூர்மையான ஆட்டம், அதிக பிளஃப்."
      ],
      [
        "கலப்பு",
        "பலவகை மேசை, இயல்புநிலைத் தேர்வு: சராசரியாக ஒவ்வொரு பத்துக்கும் மூன்று எளிய பாட்கள், ஐந்து சாதாரண, இரண்டு கடினமானவை."
      ]
    ],
    "brainH2": "பாட்கள் எப்படிச் சிந்திக்கின்றன",
    "brainP": "பாட்கள் ஒவ்வொன்றும் மீதமுள்ள சீட்டுகளைப் பலமுறை பகிர்ந்து பார்த்து, பானையில் இன்னும் இருக்கும் வீரர்களின் எண்ணிக்கைக்கு எதிராக, அந்தக் கையை வெல்லும் தனது உண்மையான வாய்ப்பைக் கணக்கிடுகிறது. முன் நிலைகளில் இறுக்கமாக ஆடுகிறது, பின் நிலைகளிலிருந்து திருடுகிறது, ஃப்ளாப்புக்கு முன் உயர்த்திய பிறகு தொடர் பணயம் (continuation bet) வைக்கிறது, வலுவான காத்திருப்புகளுடன் அரை-பிளஃப் செய்கிறது, சாதாரண நிலையிலிருந்து மேல், காசுகள் குறையும்போது அனைத்தையும் பணயம் அல்லது கைவிடல் என்ற ஆட்டத்துக்கு மாறுகிறது.",
    "stylesH2": "ஐந்து ஆட்ட பாணிகள்",
    "stylesP": "ஒரு பாட் ஆட்டத்தை எவ்வளவு நன்றாகப் படிக்கிறது என்பதைச் சிரமம் தீர்மானிக்கிறது; அது எப்படி ஆடுகிறது என்பதை அதன் பாணி தீர்மானிக்கிறது. ஒவ்வொரு புதிய மேசையும் இவற்றைக் கலக்கிறது:",
    "styles": [
      [
        "ராக் (Rock)",
        "மிக இறுக்கமான, எச்சரிக்கையான ஆட்டம்; சில பானைகளில் மட்டுமே நுழையும், அரிதாகவே பிளஃப் செய்யும்."
      ],
      [
        "டைட்-அக்ரசிவ் (TAG)",
        "நல்ல கைகளைத் தேர்ந்தெடுத்து அவற்றுடன் கடுமையாகப் பணயம் வைக்கும்."
      ],
      [
        "லூஸ்-அக்ரசிவ் (LAG)",
        "பல கைகளை ஆடி உங்களுக்கு அழுத்தம் கொடுக்கும்."
      ],
      [
        "காலிங் ஸ்டேஷன்",
        "அளவுக்கு மீறி Call செய்யும், அரிதாகவே Raise செய்யும்."
      ],
      [
        "மேனியாக்",
        "இடைவிடாமல் Raise செய்யும், பிளஃப் செய்யும்."
      ]
    ],
    "formatsH2": "உண்மையான வடிவங்களில் பயிற்சி செய்யுங்கள்",
    "formatsP": "ஆயத்த அமைப்புகள் மூலம் ‘அமைதி’, ‘சாதாரண’ அல்லது ‘வேகம்’ ஆட்டத்தைத் தொடங்கலாம், அல்லது pokerth.net போட்டிகளின் நிபந்தனைகளில் பயிற்சி செய்யலாம்: அதிகாரப்பூர்வ ‘தரவரிசை’ வேகம், We Cup, நேர அடிப்படையிலான கட்டாயப் பணயத்துடன் BBC. உங்கள் சொந்த அமைப்புகளை உங்களுக்கே உரிய வடிவமாகச் சேமிக்கலாம்.",
    "trophiesH2": "கோப்பைகளும் புள்ளிவிவரங்களும்",
    "trophiesP": "பயிற்சி முறைக்குத் தனி முன்னேற்றம் உண்டு: ஆறு வகைகளில் முப்பதுக்கும் மேற்பட்ட கோப்பைகள் — ஆடிய கைகள், வென்ற ஆட்டங்கள், தொடர் வெற்றிகள், ஒன்பது கடினப் பாட்களுக்கு எதிரான வெற்றி, பிளஃப்கள், சில ரகசியங்கள். பாட்களுக்கு எதிரான புள்ளிவிவரங்கள் உங்கள் ஆன்லைன் ஆட்டங்களிலிருந்து தனியாக வைக்கப்படுகின்றன; pokerth.net கணக்குடன் உள்நுழைந்தால், உங்கள் கோப்பைகள் உங்கள் பிற சாதனங்களுக்கும் உங்களைப் பின்தொடரும்.",
    "learnH2": "கற்றுக்கொள்ளச் சிறந்த இடம்",
    "learnP": "வலை செயலியின் ஒவ்வொரு உதவியும் இங்கே அழுத்தமின்றிச் செயல்படுகிறது: சீட்டுகள் வெளிவரும்போது உங்கள் வெற்றி வாய்ப்பைக் காட்டும் வாய்ப்புகள் தாவல், கையின் வலிமைக் காட்டி, முன்கூட்டியே தேர்ந்தெடுக்கும் செயல்கள், விசைப்பலகைக் குறுக்குவழிகள். நீங்கள் தயார் என உணரும்போது, அதே மேசை pokerth.net-இல் உண்மையான வீரர்களுடன் உங்களுக்காகக் காத்திருக்கிறது.",
    "offlineH2": "ஆஃப்லைனில், எல்லாச் சாதனங்களிலும்",
    "offlineP": "PokerTH ஒரு வலைச் செயலி: iPhone, Android, Windows, macOS, Linux ஆகியவற்றில் உலாவியில் இயங்குகிறது, ஒரு செயலியைப் போல முகப்புத் திரையில் சேர்க்கலாம். ஒருமுறை திறந்த பிறகு, பயிற்சி முறைக்கு இணைப்பே தேவையில்லை — விமானப் பயன்முறையில், மெட்ரோவில், அல்லது சிக்னல் இல்லாத எந்த இடத்திலும்.",
    "faqH2": "கேள்விகள்",
    "faq": [
      [
        "கணினியுடன் இலவசமாகப் போக்கர் விளையாட முடியுமா?",
        "ஆம். PokerTH இலவச, திறந்த மூல மென்பொருள்; விளம்பரங்களோ செயலிக்குள் வாங்குதல்களோ இல்லை. காசுகள் விளையாட்டுப் பணம் மட்டுமே."
      ],
      [
        "கணக்கு அல்லது இணைப்பு தேவையா?",
        "இல்லை. பயிற்சி முறைக்குக் கணக்கு தேவையில்லை, தளத்தை ஒருமுறை திறந்த பிறகு இணைப்பு இல்லாமலும் இயங்கும்."
      ],
      [
        "எத்தனை கணினி எதிராளிகளுடன் விளையாடலாம்?",
        "10 வீரர்கள் கொண்ட முழு மேசைக்கு 9 வரை, அல்லது நேருக்கு நேர் ஆட்டத்துக்கு ஒருவர் மட்டும்."
      ],
      [
        "பாட்கள் நன்றாக ஆடுமா?",
        "அது உங்கள் கையில்: எளிய பாட்கள் தவறு செய்யும், கடினப் பாட்கள் தங்கள் வாய்ப்புகளைத் துல்லியமாக மதிப்பிட்டு அதிகம் பிளஃப் செய்யும், கலப்பு மேசை மூன்று நிலைகளையும் ஐந்து ஆட்ட பாணிகளுடன் கலக்கிறது."
      ],
      [
        "நண்பர்களுடனும் பாட்களுடனும் ஒரே மேசையில் விளையாட முடியுமா?",
        "ஆம். உங்கள் சொந்த PokerTH சேவையகத்தில், LAN-இல் அல்லது இணையத்தில் நீங்கள் மேசையை நடத்தும்போது, காத்திருப்பு அறை காலி இருக்கைகளைக் கணினி வீரர்களால் நிரப்பலாம்."
      ]
    ]
  },
  te: {
    "title": "కంప్యూటర్‌తో పోకర్ ఆడండి — ఉచితం, ఆఫ్‌లైన్ | PokerTH",
    "desc": "కంప్యూటర్ ప్రత్యర్థులతో ఉచిత Texas Hold’em, టేబుల్ వద్ద 9 బాట్‌ల వరకు, సులభం నుంచి కఠినం వరకు. ఖాతా లేదు, డబ్బు లేదు, ఫోన్ మరియు PC లో ఆఫ్‌లైన్‌లో పనిచేస్తుంది.",
    "ldHeadline": "కంప్యూటర్‌తో Texas Hold’em పోకర్ ఆడండి, ఉచితంగా మరియు ఆఫ్‌లైన్‌లో",
    "ldDesc": "PokerTH వెబ్ క్లయింట్ శిక్షణ మోడ్: కంప్యూటర్ ప్రత్యర్థులతో Texas Hold’em, కష్టత స్థాయిలు, ఆట శైలులు మరియు ట్రోఫీలతో.",
    "h1": "కంప్యూటర్‌తో పోకర్ ఆడండి, ఉచితంగా మరియు ఆఫ్‌లైన్‌లో",
    "lead": "PokerTH శిక్షణ మోడ్ కంప్యూటర్ ప్రత్యర్థులతో పూర్తి Texas Hold’em టోర్నమెంట్‌లను నేరుగా మీ బ్రౌజర్‌లోనే పంచుతుంది. ఖాతా లేదు, సైట్ ఒకసారి తెరిచాక కనెక్షన్ అవసరం లేదు, పణంగా ఏమీ లేదు: ఆట నేర్చుకోవడానికి, కొత్త వ్యూహాన్ని ప్రయత్నించడానికి లేదా రైలులో త్వరగా ఒక ఆట ఆడటానికి సరైన చోటు.",
    "stepsH2": "మూడు దశల్లో ఆట ప్రారంభించండి",
    "steps": [
      [
        "PokerTH తెరిచి లోకల్ / శిక్షణ ఎంచుకోండి",
        "ఈ సైట్‌ను తెరిచి మొదటి స్క్రీన్‌లో లోకల్ / శిక్షణ ఎంచుకోండి. లాగిన్ లేదు, డౌన్‌లోడ్ లేదు; సైట్ ఒకసారి తెరిచాక, ఈ మోడ్ కనెక్షన్ లేకుండా కూడా పనిచేస్తుంది."
      ],
      [
        "మీ టేబుల్ సెట్ చేయండి",
        "9 వరకు కంప్యూటర్ ప్రత్యర్థులు, ప్రారంభ స్టాక్, బ్లైండ్‌లు పెరిగే వేగం, ఆట వేగం ఎంచుకోండి, లేదా సిద్ధంగా ఉన్న ఫార్మాట్‌తో ప్రారంభించండి. బాట్‌ల కష్టతను అదే విండోలో ఎంచుకోండి."
      ],
      [
        "ఆట ప్రారంభించండి",
        "ప్రారంభించు నొక్కండి: ఖాళీ సీట్లు కంప్యూటర్ ఆటగాళ్లతో నిండుతాయి, కార్డులు పంచబడతాయి. ఒక ఆటగాడి వద్ద అన్ని చిప్స్ చేరే వరకు ఆట కొనసాగుతుంది."
      ]
    ],
    "levelsH2": "నాలుగు కష్టత స్థాయిలు",
    "levels": [
      [
        "సులభం",
        "తమ హ్యాండ్‌లను తప్పుగా అంచనా వేసే, అరుదుగా బ్లఫ్ చేసే బాట్‌లు: మొదటి ఆటకు సరైన ప్రత్యర్థులు."
      ],
      [
        "సాధారణం",
        "తమ అవకాశాలను బాగా అంచనా వేసి, స్టాక్ తగ్గినప్పుడు సరిగ్గా ఆడే నిలకడైన ప్రత్యర్థులు."
      ],
      [
        "కఠినం",
        "అత్యంత బలమైన బాట్‌లు: ఖచ్చితమైన హ్యాండ్ రీడింగ్, పదునైన షార్ట్ స్టాక్ ఆట, మరిన్ని బ్లఫ్‌లు."
      ],
      [
        "మిశ్రమం",
        "వైవిధ్యమైన టేబుల్, డిఫాల్ట్: సగటున ప్రతి పదిలో మూడు సులభమైన బాట్‌లు, ఐదు సాధారణ, రెండు కఠినమైనవి."
      ]
    ],
    "brainH2": "బాట్‌లు ఎలా ఆలోచిస్తాయి",
    "brainP": "ప్రతి బాట్ మిగిలిన కార్డులను ఎన్నోసార్లు పంచి చూసి, పాట్‌లో ఇంకా ఉన్న ఆటగాళ్ల సంఖ్యకు ఎదురుగా, హ్యాండ్ గెలిచే తన నిజమైన అవకాశాన్ని లెక్కిస్తుంది. ఇది ముందు పొజిషన్‌లో మరింత టైట్‌గా ఆడుతుంది, చివరి పొజిషన్ నుంచి స్టీల్ చేస్తుంది, ఫ్లాప్‌కు ముందు రైజ్ చేశాక కంటిన్యుయేషన్ బెట్ వేస్తుంది, బలమైన డ్రాలతో సెమీ-బ్లఫ్ చేస్తుంది, మరియు సాధారణం స్థాయి నుంచి పైకి, స్టాక్ తగ్గినప్పుడు All-In లేదా Fold ఆటకు మారుతుంది.",
    "stylesH2": "ఐదు ఆట శైలులు",
    "stylesP": "బాట్ ఆటను ఎంత బాగా చదువుతుందో కష్టత నిర్ణయిస్తుంది; అది ఎలా ఆడుతుందో దాని శైలి నిర్ణయిస్తుంది. ప్రతి కొత్త టేబుల్ వీటిని కలుపుతుంది:",
    "styles": [
      [
        "రాక్",
        "చాలా టైట్‌గా, జాగ్రత్తగా ఆడుతుంది, కొన్ని పాట్‌లలోనే చేరుతుంది, అరుదుగా బ్లఫ్ చేస్తుంది."
      ],
      [
        "టైట్-అగ్రెసివ్",
        "మంచి హ్యాండ్‌లను ఎంచుకుని వాటితో గట్టిగా బెట్ చేస్తుంది."
      ],
      [
        "లూజ్-అగ్రెసివ్",
        "చాలా హ్యాండ్‌లు ఆడి మీపై ఒత్తిడి పెడుతుంది."
      ],
      [
        "కాలింగ్ స్టేషన్",
        "మరీ ఎక్కువగా Call చేస్తుంది, అరుదుగా Raise చేస్తుంది."
      ],
      [
        "మేనియాక్",
        "నిరంతరం Raise చేస్తూ బ్లఫ్ చేస్తుంది."
      ]
    ],
    "formatsH2": "నిజమైన ఫార్మాట్‌లను సాధన చేయండి",
    "formatsP": "సిద్ధంగా ఉన్న సెట్టింగ్‌లతో ప్రశాంతం, సాధారణం లేదా వేగం ఆటను ప్రారంభించవచ్చు, లేదా pokerth.net పోటీల పరిస్థితుల్లో సాధన చేయవచ్చు: అధికారిక ర్యాంకింగ్ వేగం, We Cup, సమయ ఆధారిత బ్లైండ్‌లతో BBC. మీ సొంత సెట్టింగ్‌లను మీ సొంత ఫార్మాట్‌గా సేవ్ చేసుకోవచ్చు.",
    "trophiesH2": "ట్రోఫీలు మరియు గణాంకాలు",
    "trophiesP": "శిక్షణ మోడ్‌కు సొంత పురోగతి ఉంది: ఆరు విభాగాల్లో ముప్పైకి పైగా ట్రోఫీలు — ఆడిన హ్యాండ్‌లు, గెలిచిన ఆటలు, వరుస విజయాలు, తొమ్మిది కఠినమైన బాట్‌లపై విజయం, బ్లఫ్‌లు, కొన్ని రహస్యాలు. బాట్‌లతో గణాంకాలు మీ ఆన్‌లైన్ ఆటల నుంచి వేరుగా ఉంచబడతాయి, మరియు pokerth.net ఖాతాతో లాగిన్ అయినప్పుడు మీ ట్రోఫీలు మీ ఇతర పరికరాలకు కూడా మీతో వస్తాయి.",
    "learnH2": "నేర్చుకోవడానికి ఉత్తమ చోటు",
    "learnP": "వెబ్ క్లయింట్‌లోని ప్రతి సహాయం ఇక్కడ ఒత్తిడి లేకుండా పనిచేస్తుంది: కార్డులు వచ్చే కొద్దీ మీ గెలుపు అవకాశాన్ని చూపే ఆడ్స్ ట్యాబ్, హ్యాండ్ బలం ప్రదర్శన, ముందుగా ఎంచుకున్న చర్యలు, కీబోర్డ్ షార్ట్‌కట్‌లు. మీరు సిద్ధంగా ఉన్నారని అనిపించినప్పుడు, అదే టేబుల్ pokerth.net లో నిజమైన ఆటగాళ్లతో మీ కోసం ఎదురుచూస్తోంది.",
    "offlineH2": "ఆఫ్‌లైన్‌లో, ప్రతి పరికరంలో",
    "offlineP": "PokerTH ఒక వెబ్ యాప్: ఇది iPhone, Android, Windows, macOS, Linux లలో బ్రౌజర్‌లో నడుస్తుంది, మరియు యాప్‌లాగా హోమ్ స్క్రీన్‌కు జోడించవచ్చు. ఒకసారి తెరిచాక, శిక్షణ మోడ్‌కు ఏ కనెక్షన్ అవసరం లేదు — ఎయిర్‌ప్లేన్ మోడ్‌లో, మెట్రోలో లేదా సిగ్నల్ లేని ఎక్కడైనా.",
    "faqH2": "ప్రశ్నలు",
    "faq": [
      [
        "కంప్యూటర్‌తో ఉచితంగా పోకర్ ఆడవచ్చా?",
        "అవును. PokerTH ప్రకటనలు, యాప్‌లో కొనుగోళ్లు లేని ఉచిత, ఓపెన్ సోర్స్ సాఫ్ట్‌వేర్. చిప్స్ కేవలం ఆట డబ్బు మాత్రమే."
      ],
      [
        "ఖాతా లేదా కనెక్షన్ అవసరమా?",
        "లేదు. శిక్షణ మోడ్‌కు ఖాతా అవసరం లేదు, సైట్ ఒకసారి తెరిచాక అది కనెక్షన్ లేకుండా పనిచేస్తుంది."
      ],
      [
        "ఎంత మంది కంప్యూటర్ ప్రత్యర్థులతో ఆడవచ్చు?",
        "9 వరకు, 10 మంది ఆటగాళ్ల పూర్తి టేబుల్ కోసం, లేదా హెడ్స్-అప్ కోసం ఒక్కరితో మాత్రమే."
      ],
      [
        "బాట్‌లు బాగా ఆడతాయా?",
        "అది మీ ఇష్టం: సులభమైన బాట్‌లు తప్పులు చేస్తాయి, కఠినమైన బాట్‌లు తమ అవకాశాలను ఖచ్చితంగా అంచనా వేసి ఎక్కువగా బ్లఫ్ చేస్తాయి, మిశ్రమ టేబుల్ మూడు స్థాయిలను ఐదు ఆట శైలులతో కలుపుతుంది."
      ],
      [
        "స్నేహితులు, బాట్‌లతో ఒకే టేబుల్ వద్ద ఆడవచ్చా?",
        "అవును. మీ సొంత PokerTH సర్వర్‌లో, LAN లో లేదా ఇంటర్నెట్‌లో టేబుల్ హోస్ట్ చేసినప్పుడు, వెయిటింగ్ రూమ్ ఖాళీ సీట్లను కంప్యూటర్ ఆటగాళ్లతో నింపగలదు."
      ]
    ]
  },
  tg: {
    "title": "Покер бо компютер — ройгон, офлайн | PokerTH",
    "desc": "Texas Hold’em-и ройгон бо рақибони компютерӣ, то 9 бот дар мизи шумо, аз осон то душвор. Бе ҳисоб, бе пул ва дар телефон ва компютер офлайн кор мекунад.",
    "ldHeadline": "Бо компютер Texas Hold’em покер бозӣ кунед, ройгон ва офлайн",
    "ldDesc": "Реҷаи машқи веб-клиенти PokerTH: Texas Hold’em бо рақибони компютерӣ, бо сатҳҳои душворӣ, услубҳои бозӣ ва ҷоизаҳо.",
    "h1": "Бо компютер покер бозӣ кунед, ройгон ва офлайн",
    "lead": "Реҷаи машқи PokerTH турнирҳои пурраи Texas Hold’em-ро бо рақибони компютерӣ мустақиман дар браузери шумо мегузаронад. Бе ҳисоб, баъди як бор кушодани сайт бе пайваст ва бе ҳеҷ чизи дар гарав: ҷойе барои омӯхтани бозӣ, озмудани стратегияи нав ё як бозии зуд дар қатора.",
    "stepsH2": "Бозиро дар се қадам оғоз кунед",
    "steps": [
      [
        "PokerTH-ро кушоед ва «Маҳаллӣ / машқ»-ро интихоб кунед",
        "Ин сайтро кушоед ва дар экрани аввал «Маҳаллӣ / машқ»-ро интихоб кунед. На воридшавӣ лозим аст, на боргирӣ; баъди як бор кушодани сайт, ин реҷа бе пайваст ҳам кор мекунад."
      ],
      [
        "Мизи худро танзим кунед",
        "То 9 рақиби компютерӣ, стеки ибтидоӣ, суръати баландшавии блайндҳо ва суръати бозиро интихоб кунед, ё аз формати тайёр оғоз кунед. Душвории ботҳоро дар ҳамон равзана интихоб кунед."
      ],
      [
        "Бозиро оғоз кунед",
        "«Оғоз»-ро пахш кунед: ҷойҳои холӣ бо бозингарони компютерӣ пур мешаванд ва кортҳо тақсим мешаванд. Бозӣ то он даме идома меёбад, ки ҳамаи чипҳо ба як бозингар гузаранд."
      ]
    ],
    "levelsH2": "Чор сатҳи душворӣ",
    "levels": [
      [
        "Осон",
        "Ботҳое, ки дастҳои худро нодуруст арзёбӣ мекунанд ва кам блеф мекунанд: рақибони мувофиқ барои бозии аввал."
      ],
      [
        "Муқаррарӣ",
        "Рақибони устувор, ки имкониятҳои худро хуб арзёбӣ мекунанд ва ҳангоми кӯтоҳ шудани стекашон дуруст бозӣ мекунанд."
      ],
      [
        "Душвор",
        "Пурзӯртарин ботҳо: хондани дақиқи дастҳо, бозии тез бо стеки кӯтоҳ ва блефи бештар."
      ],
      [
        "Омехта",
        "Мизи гуногун, пешфарз: ба ҳисоби миёна аз ҳар даҳ се боти осон, панҷ муқаррарӣ ва ду душвор."
      ]
    ],
    "brainH2": "Ботҳо чӣ тавр фикр мекунанд",
    "brainP": "Ҳар бот имкони воқеии бурдани дастро бо борҳо тақсим кардани кортҳои боқимонда, нисбат ба шумораи бозингароне, ки ҳанӯз дар банк ҳастанд, ҳисоб мекунад. Аз мавқеи барвақт қатъитар бозӣ мекунад ва аз мавқеи дер медуздад, пас аз Raise пеш аз флоп ставкаи давомдиҳанда (c-bet) мегузорад, бо дроҳои қавӣ нимблеф мекунад ва аз сатҳи муқаррарӣ боло, вақте стекаш кӯтоҳ мешавад, ба бозии all-in ё fold мегузарад.",
    "stylesH2": "Панҷ услуби бозӣ",
    "stylesP": "Душворӣ муайян мекунад, ки бот бозиро то чӣ андоза хуб мехонад; услубаш муайян мекунад, ки чӣ тавр бозӣ мекунад. Ҳар мизи нав инҳоро омехта мекунад:",
    "styles": [
      [
        "Рок (Rock)",
        "хеле қатъӣ ва эҳтиёткор, ба банкҳои кам ворид мешавад ва кам блеф мекунад."
      ],
      [
        "Тайт-агрессивӣ (TAG)",
        "дастҳои хубро интихоб мекунад ва бо онҳо сахт ставка мегузорад."
      ],
      [
        "Луз-агрессивӣ (LAG)",
        "дастҳои зиёд бозӣ мекунад ва ба шумо фишор меорад."
      ],
      [
        "Коллинг-стейшн (Calling station)",
        "аз ҳад зиёд Call мекунад ва кам Raise мекунад."
      ],
      [
        "Маньяк (Maniac)",
        "пайваста Raise ва блеф мекунад."
      ]
    ],
    "formatsH2": "Форматҳои воқеиро машқ кунед",
    "formatsP": "Танзимоти тайёр ба шумо имкон медиҳанд бозии «Ором», «Муқаррарӣ» ё «Зуд»-ро оғоз кунед, ё дар шароити мусобиқаҳои pokerth.net машқ кунед: суръати расмии Ranking, We Cup ва BBC бо блайндҳое, ки аз рӯи вақт баланд мешаванд. Танзимоти худро метавонед ҳамчун формати шахсӣ захира кунед.",
    "trophiesH2": "Ҷоизаҳо ва омор",
    "trophiesP": "Реҷаи машқ пешрафти худро дорад: зиёда аз сӣ ҷоиза дар шаш категория — дастҳои бозидашуда, бозиҳои бурдашуда, силсилаи ғалабаҳо, ғалаба бар нӯҳ боти душвор, блефҳо ва якчанд сирр. Омори бозӣ бо ботҳо аз бозиҳои онлайни шумо ҷудо нигоҳ дошта мешавад ва вақте бо ҳисоби pokerth.net ворид мешавед, ҷоизаҳоятон ба дигар дастгоҳҳоятон ҳам ҳамроҳ мешаванд.",
    "learnH2": "Беҳтарин ҷой барои омӯхтан",
    "learnP": "Ҳар ёрии веб-клиент дар ин ҷо бе фишор кор мекунад: панели «Имкониятҳо» бо имкони бурди шумо ҳангоми кушода шудани кортҳо, нишондиҳандаи қувваи даст, амалҳои пешакӣ интихобшуда ва миёнбурҳои клавиатура. Вақте худро омода ҳис кунед, ҳамон миз дар pokerth.net бо бозингарони воқеӣ шуморо интизор аст.",
    "offlineH2": "Офлайн, дар ҳар дастгоҳ",
    "offlineP": "PokerTH веб-барнома аст: дар браузер дар iPhone, Android, Windows, macOS ва Linux кор мекунад ва мисли барнома ба экрани асосӣ илова карда мешавад. Баъди як бор кушодан, реҷаи машқ ба пайваст умуман ниёз надорад — дар реҷаи ҳавопаймо, дар метро ё ҳар ҷое, ки сигнал нест.",
    "faqH2": "Саволҳо",
    "faq": [
      [
        "Оё ман метавонам бо компютер ройгон покер бозӣ кунам?",
        "Ҳа. PokerTH нармафзори ройгон ва бо коди кушода аст, бе реклама ва бе харидҳо дар дохили барнома. Чипҳо танҳо пули бозӣ мебошанд."
      ],
      [
        "Оё ба ман ҳисоб ё пайваст лозим аст?",
        "Не. Реҷаи машқ ҳисоб талаб намекунад ва баъди як бор кушодани сайт бе пайваст кор мекунад."
      ],
      [
        "Бо чанд рақиби компютерӣ бозӣ карда метавонам?",
        "То 9, барои мизи пурраи 10 бозингар, ё танҳо бо як рақиб барои ҳедз-ап."
      ],
      [
        "Оё ботҳо хуб бозӣ мекунанд?",
        "Ин ба шумо вобаста аст: ботҳои осон хато мекунанд, ботҳои душвор имкониятҳои худро дақиқ арзёбӣ мекунанд ва бештар блеф мекунанд, мизи омехта бошад се сатҳро бо панҷ услуби бозӣ якҷоя мекунад."
      ],
      [
        "Оё ман метавонам бо дӯстон ва ботҳо дар як миз бозӣ кунам?",
        "Ҳа. Вақте ки шумо дар сервери худии PokerTH, дар LAN ё дар интернет миз ташкил мекунед, толори интизорӣ метавонад ҷойҳои холиро бо бозингарони компютерӣ пур кунад."
      ]
    ]
  },
  th: {
    "title": "เล่นโป๊กเกอร์กับคอมพิวเตอร์ — ฟรี เล่นออฟไลน์ได้ | PokerTH",
    "desc": "Texas Hold’em ฟรีกับคู่แข่งคอมพิวเตอร์ บอตสูงสุด 9 ตัวที่โต๊ะของคุณ ตั้งแต่ง่ายถึงยาก ไม่ต้องมีบัญชี ไม่ใช้เงิน และเล่นออฟไลน์ได้ทั้งบนมือถือและพีซี",
    "ldHeadline": "เล่นโป๊กเกอร์ Texas Hold’em กับคอมพิวเตอร์ ฟรีและออฟไลน์",
    "ldDesc": "โหมดฝึกซ้อมของไคลเอนต์เว็บ PokerTH: Texas Hold’em กับคู่แข่งคอมพิวเตอร์ พร้อมระดับความยาก สไตล์การเล่น และถ้วยรางวัล",
    "h1": "เล่นโป๊กเกอร์กับคอมพิวเตอร์ ฟรีและออฟไลน์",
    "lead": "โหมดฝึกซ้อมของ PokerTH แจกไพ่ทัวร์นาเมนต์ Texas Hold’em เต็มรูปแบบกับคู่แข่งคอมพิวเตอร์ได้ในเบราว์เซอร์ของคุณเลย ไม่ต้องมีบัญชี ไม่ต้องเชื่อมต่อเมื่อเปิดเว็บไซต์ไปแล้วครั้งหนึ่ง และไม่มีอะไรต้องเสีย เป็นที่สำหรับหัดเล่น ลองกลยุทธ์ใหม่ หรือเล่นเกมสั้น ๆ บนรถไฟ",
    "stepsH2": "เริ่มเกมในสามขั้นตอน",
    "steps": [
      [
        "เปิด PokerTH แล้วเลือก ในเครื่อง / ฝึกซ้อม",
        "เปิดเว็บไซต์นี้แล้วเลือก ในเครื่อง / ฝึกซ้อม ที่หน้าจอแรก ไม่ต้องเข้าสู่ระบบและไม่ต้องดาวน์โหลด เมื่อเปิดเว็บไซต์ไปแล้วครั้งหนึ่ง โหมดนี้ก็ใช้งานได้แม้ไม่มีการเชื่อมต่อ"
      ],
      [
        "ตั้งค่าโต๊ะของคุณ",
        "เลือกคู่แข่งคอมพิวเตอร์ได้สูงสุด 9 ตัว ชิปเริ่มต้น ความเร็วในการขึ้นของไพ่บังคับ และความเร็วเกม หรือเริ่มจากรูปแบบสำเร็จรูป ความยากของบอตเลือกได้ในหน้าต่างเดียวกัน"
      ],
      [
        "เริ่มเกม",
        "กด เริ่ม แล้วที่นั่งว่างจะเต็มไปด้วยผู้เล่นคอมพิวเตอร์และไพ่จะถูกแจก เกมดำเนินไปจนกว่าผู้เล่นคนเดียวจะได้ชิปทั้งหมด"
      ]
    ],
    "levelsH2": "ความยากสี่ระดับ",
    "levels": [
      [
        "ง่าย",
        "บอตที่ประเมินมือตัวเองผิดและแทบไม่บลัฟ เหมาะเป็นคู่แข่งสำหรับเกมแรก"
      ],
      [
        "ปกติ",
        "คู่แข่งที่มั่นคง อ่านโอกาสของตัวเองได้ดีและเล่นได้ถูกต้องเมื่อชิปเหลือน้อย"
      ],
      [
        "ยาก",
        "บอตที่เก่งที่สุด อ่านมือได้แม่นยำ เล่นตอนชิปน้อยได้เฉียบคม และบลัฟบ่อยกว่า"
      ],
      [
        "ผสม",
        "โต๊ะที่หลากหลาย เป็นค่าเริ่มต้น โดยเฉลี่ยในทุกสิบตัวจะมีบอตง่ายสามตัว ปกติห้าตัว และยากสองตัว"
      ]
    ],
    "brainH2": "บอตคิดอย่างไร",
    "brainP": "บอตแต่ละตัวคำนวณโอกาสชนะมือนั้นจริง ๆ ด้วยการแจกไพ่ที่เหลือซ้ำหลายครั้ง โดยเทียบกับจำนวนผู้เล่นที่ยังอยู่ในกองกลาง มันเล่นไทต์ขึ้นในตำแหน่งต้นและขโมยจากตำแหน่งท้าย ลงเดิมพันต่อเนื่อง (continuation bet) หลังจาก Raise ก่อนฟลอป เซมิบลัฟด้วยไพ่รอที่แข็งแรง และตั้งแต่ระดับปกติขึ้นไป จะเปลี่ยนไปเล่นแบบ all-in หรือ fold เมื่อชิปเหลือน้อย",
    "stylesH2": "สไตล์การเล่นห้าแบบ",
    "stylesP": "ความยากกำหนดว่าบอตอ่านเกมได้ดีแค่ไหน ส่วนสไตล์กำหนดว่ามันเล่นอย่างไร ทุกโต๊ะใหม่จะผสมกันระหว่าง:",
    "styles": [
      [
        "ร็อก",
        "ไทต์และระมัดระวังมาก เข้าเล่นในกองกลางน้อยและแทบไม่บลัฟ"
      ],
      [
        "ไทต์-แอกเกรสซีฟ",
        "เลือกเล่นแต่มือดีและเดิมพันหนัก"
      ],
      [
        "ลูส-แอกเกรสซีฟ",
        "เล่นหลายมือและกดดันคุณ"
      ],
      [
        "คอลลิงสเตชัน",
        "Call บ่อยเกินไปมากและไม่ค่อย Raise"
      ],
      [
        "แมเนียก",
        "Raise และบลัฟอยู่ตลอดเวลา"
      ]
    ],
    "formatsH2": "ฝึกกับรูปแบบจริง",
    "formatsP": "การตั้งค่าสำเร็จรูปให้คุณเริ่มเกมแบบ สบาย ๆ ปกติ หรือ เร็ว หรือฝึกในเงื่อนไขของการแข่งขันบน pokerth.net ได้ ทั้งจังหวะทางการของเกม Ranking, We Cup และ BBC ที่ไพ่บังคับขึ้นตามเวลา การตั้งค่าของคุณเองก็บันทึกเป็นรูปแบบส่วนตัวได้",
    "trophiesH2": "ถ้วยรางวัลและสถิติ",
    "trophiesP": "โหมดฝึกซ้อมมีความก้าวหน้าของตัวเอง ถ้วยรางวัลกว่าสามสิบใบในหกหมวด — มือที่เล่น เกมที่ชนะ การชนะติดต่อกัน ชัยชนะเหนือบอตระดับยากเก้าตัว การบลัฟ และความลับอีกจำนวนหนึ่ง สถิติที่เล่นกับบอตจะเก็บแยกจากเกมออนไลน์ของคุณ และเมื่อเข้าสู่ระบบด้วยบัญชี pokerth.net ถ้วยรางวัลของคุณจะตามไปยังอุปกรณ์อื่นของคุณด้วย",
    "learnH2": "ที่ที่ดีที่สุดสำหรับหัดเล่น",
    "learnP": "ตัวช่วยทุกอย่างของไคลเอนต์เว็บใช้งานได้ที่นี่โดยไม่มีแรงกดดัน ทั้งแท็บโอกาสที่แสดงโอกาสชนะของคุณเมื่อไพ่ทยอยเปิด การแสดงความแข็งแกร่งของมือ การเลือกแอ็กชันล่วงหน้า และปุ่มลัดคีย์บอร์ด เมื่อรู้สึกพร้อมแล้ว โต๊ะเดียวกันนี้รอคุณอยู่บน pokerth.net กับผู้เล่นจริง",
    "offlineH2": "ออฟไลน์ บนทุกอุปกรณ์",
    "offlineP": "PokerTH เป็นเว็บแอป ทำงานในเบราว์เซอร์บน iPhone, Android, Windows, macOS และ Linux และเพิ่มไว้บนหน้าจอโฮมได้เหมือนแอป เมื่อเปิดแล้วครั้งหนึ่ง โหมดฝึกซ้อมก็ไม่ต้องใช้การเชื่อมต่อเลย — ในโหมดเครื่องบิน บนรถไฟฟ้าใต้ดิน หรือที่ไหนก็ได้ที่ไม่มีสัญญาณ",
    "faqH2": "คำถามที่พบบ่อย",
    "faq": [
      [
        "เล่นโป๊กเกอร์กับคอมพิวเตอร์ฟรีได้ไหม",
        "ได้ PokerTH เป็นซอฟต์แวร์ฟรีและโอเพนซอร์ส ไม่มีโฆษณาและไม่มีการซื้อในแอป ชิปเป็นเพียงเงินสมมติ"
      ],
      [
        "ต้องมีบัญชีหรือการเชื่อมต่อไหม",
        "ไม่ต้อง โหมดฝึกซ้อมไม่ต้องใช้บัญชี และเมื่อเปิดเว็บไซต์ไปแล้วครั้งหนึ่ง ก็ใช้งานได้โดยไม่ต้องเชื่อมต่อ"
      ],
      [
        "เล่นกับคู่แข่งคอมพิวเตอร์ได้กี่ตัว",
        "สูงสุด 9 ตัว ได้โต๊ะเต็ม 10 คน หรือตัวเดียวสำหรับเล่นตัวต่อตัว"
      ],
      [
        "บอตเก่งไหม",
        "ขึ้นอยู่กับคุณ บอตง่ายทำพลาด บอตยากอ่านโอกาสได้แม่นยำและบลัฟบ่อยกว่า ส่วนโต๊ะผสมรวมทั้งสามระดับเข้ากับสไตล์การเล่นห้าแบบ"
      ],
      [
        "เล่นกับเพื่อนและบอตที่โต๊ะเดียวกันได้ไหม",
        "ได้ เมื่อคุณเปิดโต๊ะบนเซิร์ฟเวอร์ PokerTH ของคุณเอง ทั้งบน LAN หรือบนอินเทอร์เน็ต ห้องรอสามารถเติมที่นั่งว่างด้วยผู้เล่นคอมพิวเตอร์ได้"
      ]
    ]
  },
  tk: {
    "title": "Kompýutere garşy poker oýnaň — mugt, internetsiz | PokerTH",
    "desc": "Kompýuter garşydaşlaryna garşy mugt Texas Hold’em, stoluňyzda 9 bota çenli, aňsatdan kyna çenli. Hasapsyz, pulsuz, telefonda we PC-de internetsiz hem işleýär.",
    "ldHeadline": "Kompýutere garşy Texas Hold’em poker oýnaň, mugt we internetsiz",
    "ldDesc": "PokerTH web müşderisiniň türgenleşik tertibi: kompýuter garşydaşlaryna garşy Texas Hold’em, kynlyk derejeleri, oýun stilleri we baýraklar bilen.",
    "h1": "Kompýutere garşy poker oýnaň, mugt we internetsiz",
    "lead": "PokerTH-iň türgenleşik tertibi kompýuter garşydaşlaryna garşy doly Texas Hold’em ýaryşlaryny göni brauzeriňizde paýlaýar. Hasap gerek däl, sahypa bir gezek açylandan soň birikme gerek däl, howp astynda hiç zat ýok: oýny öwrenmek, täze strategiýany synap görmek ýa-da otluda çalt bir oýun oýnamak üçin ýer.",
    "stepsH2": "Üç ädimde oýun başlaň",
    "steps": [
      [
        "PokerTH-i açyň we «Ýerli / türgenleşik» tertibini saýlaň",
        "Bu sahypany açyň we ilkinji ekranda «Ýerli / türgenleşik» saýlaň. Giriş we ýükleme gerek däl; sahypa bir gezek açylandan soň, bu tertip birikmesiz hem işleýär."
      ],
      [
        "Stoluňyzy sazlaň",
        "Kompýuter garşydaşlaryndan 9-a çenli, başlangyç stegi, blaýndlaryň näçe çalt ýokarlanýandygyny we oýnuň tizligini saýlaň ýa-da taýýar formatdan başlaň. Botlaryň kynlygyny şol bir penjirede saýlaň."
      ],
      [
        "Oýny başlaň",
        "«Başla» düwmesine basyň: boş orunlar kompýuter oýunçylary bilen dolýar we kartlar paýlanýar. Oýun bir oýunçy ähli çipleri eýeleýänçä dowam edýär."
      ]
    ],
    "levelsH2": "Dört kynlyk derejesi",
    "levels": [
      [
        "Aňsat",
        "Ellerine ýalňyş baha berýän we seýrek blef edýän botlar: ilkinji oýun üçin dogry garşydaşlar."
      ],
      [
        "Adaty",
        "Mümkinçiliklerine gowy baha berýän we stegi gysgalanda dogry oýnaýan berk garşydaşlar."
      ],
      [
        "Kyn",
        "Iň güýçli botlar: elleri takyk okamak, gysga stek bilen ussat oýun we has köp blef."
      ],
      [
        "Garyşyk",
        "Dürli stol, deslapky sazlama: ortaça her ondan üçüsi aňsat, bäşisi adaty we ikisi kyn bot."
      ]
    ],
    "brainH2": "Botlar nähili pikirlenýär",
    "brainP": "Her bot galan kartlary köp gezek paýlap, bankda henizem bar bolan oýunçylaryň sanyna garşy eli utmagyň hakyky mümkinçiligini hasaplaýar. Ol irki pozisiýada has berk oýnaýar we giçki pozisiýadan ogurlaýar, flopdan öň ýokarlandyrandan soň dowamly stawka (c-bet) goýýar, güýçli drolar bilen ýarym blef edýär we adaty derejeden ýokarda stegi gysgalanda diňe All-In ýa-da Fold oýnuna geçýär.",
    "stylesH2": "Bäş oýun stili",
    "stylesP": "Kynlyk botuň oýny näderejede gowy okaýandygyny, stili bolsa onuň nähili oýnaýandygyny kesgitleýär. Her täze stol şulary garyşdyrýar:",
    "styles": [
      [
        "Rok (Rock)",
        "örän berk we seresap, az banka girýär we seýrek blef edýär."
      ],
      [
        "Taýt-agressiw (TAG)",
        "gowy elleri saýlaýar we olar bilen güýçli stawka edýär."
      ],
      [
        "Lus-agressiw (LAG)",
        "köp el oýnaýar we size basyş edýär."
      ],
      [
        "Kolling-steýşn (Calling station)",
        "aşa köp Call edýär we seýrek Raise edýär."
      ],
      [
        "Manýak (Maniac)",
        "yzygiderli Raise we blef edýär."
      ]
    ],
    "formatsH2": "Hakyky formatlarda türgenleşiň",
    "formatsP": "Taýýar sazlamalar Asuda, Adaty ýa-da Çalt oýny başlamaga ýa-da pokerth.net ýaryşlarynyň şertlerinde türgenleşmäge mümkinçilik berýär: resmi Ranking tizligi, We Cup we wagta esaslanýan blaýndlary bilen BBC. Öz sazlamalaryňyzy öz formatyňyz hökmünde ýatda saklap bilersiňiz.",
    "trophiesH2": "Baýraklar we statistika",
    "trophiesP": "Türgenleşik tertibiniň öz ösüşi bar: alty kategoriýada otuzdan gowrak baýrak — oýnalan eller, utulan oýunlar, yzygiderli ýeňişler, dokuz kyn bota garşy ýeňiş, blefler we birnäçe syr. Botlara garşy statistika onlaýn oýunlaryňyzdan aýratyn saklanýar, pokerth.net hasaby bilen girseňiz bolsa, baýraklaryňyz beýleki enjamlaryňyza hem geçýär.",
    "learnH2": "Öwrenmek üçin iň gowy ýer",
    "learnP": "Web müşderisiniň ähli kömekçileri bu ýerde basyşsyz işleýär: kartlar açyldygyça utmak mümkinçiligiňizi görkezýän «Mümkinçilikler» goýmasy, eliň güýjüniň görkezijisi, öňünden saýlanan hereketler we klawiatura gysga ýollary. Taýýardygyňyzy duýanyňyzda, şol stol pokerth.net-de hakyky oýunçylar bilen size garaşýar.",
    "offlineH2": "Internetsiz, ähli enjamlarda",
    "offlineP": "PokerTH web programmasydyr: ol iPhone, Android, Windows, macOS we Linux-da brauzerde işleýär we programma ýaly baş ekrana goşulyp bilner. Bir gezek açylandan soň, türgenleşik tertibine hiç hili birikme gerek däl — uçar tertibinde, metroda ýa-da signal ýok islendik ýerde.",
    "faqH2": "Soraglar",
    "faq": [
      [
        "Kompýutere garşy mugt poker oýnap bilerinmi?",
        "Hawa. PokerTH mahabatsyz we programma içindäki satyn almalarsyz mugt, açyk çeşmeli programma üpjünçiligidir. Çipler diňe oýun puludyr."
      ],
      [
        "Maňa hasap ýa-da birikme gerekmi?",
        "Ýok. Türgenleşik tertibine hasap gerek däl, sahypa bir gezek açylandan soň bolsa birikmesiz işleýär."
      ],
      [
        "Näçe kompýuter garşydaşyna garşy oýnap bilerin?",
        "9-a çenli, 10 oýunçyly doly stol üçin, ýa-da heds-ap üçin diňe birine garşy."
      ],
      [
        "Botlar gowumy?",
        "Bu size bagly: aňsat botlar ýalňyşlyk goýberýär, kyn botlar mümkinçiliklerini takyk okaýar we köp blef edýär, garyşyk stol bolsa üç derejäni bäş oýun stili bilen garyşdyrýar."
      ],
      [
        "Dostlar we botlar bilen bir stolda oýnap bilerinmi?",
        "Hawa. Öz PokerTH serweriňizde, LAN-da ýa-da internetde stol açanyňyzda, garaşylýan otag boş orunlary kompýuter oýunçylary bilen doldurup biler."
      ]
    ]
  },
  tr: {
    "title": "Bilgisayara karşı poker oyna — ücretsiz, çevrimdışı | PokerTH",
    "desc": "Bilgisayara karşı ücretsiz Texas Hold’em: masanızda 9 bota kadar, kolaydan zora. Hesap yok, para yok; telefonda ve bilgisayarda çevrimdışı da çalışır.",
    "ldHeadline": "Bilgisayara karşı ücretsiz ve çevrimdışı Texas Hold’em poker oynayın",
    "ldDesc": "PokerTH web istemcisinin antrenman modu: zorluk seviyeleri, oyun stilleri ve kupalarla bilgisayar rakiplere karşı Texas Hold’em.",
    "h1": "Bilgisayara karşı ücretsiz ve çevrimdışı poker oynayın",
    "lead": "PokerTH’nin antrenman modu, doğrudan tarayıcınızda bilgisayar rakiplere karşı eksiksiz Texas Hold’em turnuvaları dağıtır. Hesap yok, site bir kez açıldıktan sonra bağlantı gerekmez ve ortada kaybedecek hiçbir şey yok: oyunu öğrenmek, yeni bir strateji denemek ya da trende hızlı bir oyun oynamak için ideal yer.",
    "stepsH2": "Üç adımda oyuna başlayın",
    "steps": [
      [
        "PokerTH’yi açıp Yerel / antrenman seçeneğini seçin",
        "Bu siteyi açın ve ilk ekranda Yerel / antrenman seçeneğini seçin. Giriş yapmak ya da bir şey indirmek gerekmez; site bir kez açıldıktan sonra mod bağlantı olmadan da çalışır."
      ],
      [
        "Masanızı kurun",
        "En fazla 9 bilgisayar rakip, başlangıç çipi, körlerin ne kadar hızlı artacağı ve oyun hızını seçin ya da hazır bir formatla başlayın. Botların zorluğunu aynı pencereden seçin."
      ],
      [
        "Oyunu başlatın",
        "Başlat’a basın: boş koltuklar bilgisayar oyuncularıyla dolar ve kartlar dağıtılır. Oyun, bir oyuncu tüm çipleri toplayana kadar sürer."
      ]
    ],
    "levelsH2": "Dört zorluk seviyesi",
    "levels": [
      [
        "Kolay",
        "Ellerini yanlış değerlendiren ve nadiren blöf yapan botlar: ilk oyun için doğru rakipler."
      ],
      [
        "Normal",
        "Şanslarını iyi okuyan ve çipleri azaldığında doğru oynayan sağlam rakipler."
      ],
      [
        "Zor",
        "En güçlü botlar: isabetli el okuma, kısa çiple keskin oyun ve daha fazla blöf."
      ],
      [
        "Karışık",
        "Çeşitli bir masa, varsayılan seçenek: her on botta ortalama üç kolay, beş normal ve iki zor bot."
      ]
    ],
    "brainH2": "Botlar nasıl düşünür",
    "brainP": "Her bot, kalan kartları defalarca dağıtarak, potta hâlâ kalan oyuncu sayısına göre eli kazanma konusundaki gerçek şansını hesaplar. Erken pozisyonda daha sıkı oynar ve geç pozisyondan çalma yapar, flop öncesi artırdıktan sonra devam bahsi (continuation bet) yapar, güçlü bekleyişlerle yarı blöf yapar ve normal seviyeden itibaren çipleri azaldığında All-In ya da Fold oyununa geçer.",
    "stylesH2": "Beş oyun stili",
    "stylesP": "Zorluk, bir botun oyunu ne kadar iyi okuduğunu belirler; stili ise nasıl oynadığını. Her yeni masada şunlar karışır:",
    "styles": [
      [
        "Rock",
        "çok sıkı ve temkinli, az pota girer ve nadiren blöf yapar."
      ],
      [
        "TAG (tight-agresif)",
        "iyi elleri seçer ve onlarla sert bahis yapar."
      ],
      [
        "LAG (loose-agresif)",
        "çok el oynar ve size baskı yapar."
      ],
      [
        "Calling station",
        "çok sık görür ve nadiren artırır."
      ],
      [
        "Maniac",
        "sürekli artırır ve blöf yapar."
      ]
    ],
    "formatsH2": "Gerçek formatlarda pratik yapın",
    "formatsP": "Hazır ayarlarla Rahat, Normal ya da Hızlı bir oyun başlatabilir veya pokerth.net yarışmalarının koşullarında pratik yapabilirsiniz: resmî Sıralama temposu, We Cup ve süreye bağlı körleriyle BBC. Kendi ayarlarınızı da kendi formatınız olarak kaydedebilirsiniz.",
    "trophiesH2": "Kupalar ve istatistikler",
    "trophiesP": "Antrenman modunun kendi ilerleme sistemi var: altı kategoride otuzdan fazla kupa — oynanan eller, kazanılan oyunlar, galibiyet serileri, dokuz zor bota karşı bir zafer, blöfler ve birkaç sır. Botlara karşı istatistikler çevrimiçi oyunlarınızdan ayrı tutulur ve bir pokerth.net hesabıyla giriş yaptığınızda kupalarınız diğer cihazlarınıza da sizinle gelir.",
    "learnH2": "Öğrenmek için en iyi yer",
    "learnP": "Web istemcisinin tüm yardımları burada baskı olmadan çalışır: kartlar açıldıkça kazanma şansınızı gösteren Şanslar sekmesi, el gücü göstergesi, önceden seçilen hamleler ve klavye kısayolları. Kendinizi hazır hissettiğinizde aynı masa sizi pokerth.net’te gerçek oyunculara karşı bekliyor.",
    "offlineH2": "Çevrimdışı, her cihazda",
    "offlineP": "PokerTH bir web uygulamasıdır: iPhone, Android, Windows, macOS ve Linux’ta tarayıcıda çalışır ve bir uygulama gibi ana ekrana eklenebilir. Bir kez açıldıktan sonra antrenman modu hiçbir bağlantıya ihtiyaç duymaz — uçak modunda, metroda ya da sinyalin olmadığı her yerde.",
    "faqH2": "Sorular",
    "faq": [
      [
        "Bilgisayara karşı ücretsiz poker oynayabilir miyim?",
        "Evet. PokerTH ücretsiz ve açık kaynaklı bir yazılımdır; reklam ve uygulama içi satın alma yoktur. Çipler yalnızca oyun parasıdır."
      ],
      [
        "Hesap ya da bağlantı gerekir mi?",
        "Hayır. Antrenman modu hesap gerektirmez ve site bir kez açıldıktan sonra bağlantı olmadan çalışır."
      ],
      [
        "Kaç bilgisayar rakibe karşı oynayabilirim?",
        "10 oyunculuk tam bir masa için en fazla 9, ya da teke tek oynamak için yalnızca bir."
      ],
      [
        "Botlar iyi mi?",
        "Size kalmış: kolay botlar hata yapar, zor botlar şanslarını isabetle okur ve daha çok blöf yapar, karışık masa ise üç seviyeyi beş oyun stiliyle harmanlar."
      ],
      [
        "Arkadaşlarla ve botlarla aynı masada oynayabilir miyim?",
        "Evet. Kendi PokerTH sunucunuzda, bir LAN’da ya da internette masa açtığınızda bekleme odası boş koltukları bilgisayar oyuncularıyla doldurabilir."
      ]
    ]
  },
  uk: {
    "title": "Покер проти комп’ютера — безкоштовно, офлайн | PokerTH",
    "desc": "Безкоштовний Texas Hold’em проти комп’ютерних суперників, до 9 ботів за вашим столом, від легких до складних. Без акаунта, без грошей, працює офлайн на телефоні й ПК.",
    "ldHeadline": "Грайте в покер Texas Hold’em проти комп’ютера, безкоштовно й офлайн",
    "ldDesc": "Режим тренування вебклієнта PokerTH: Texas Hold’em проти комп’ютерних суперників, з рівнями складності, стилями гри та трофеями.",
    "h1": "Грайте в покер проти комп’ютера, безкоштовно й офлайн",
    "lead": "Режим тренування PokerTH роздає повноцінні турніри Texas Hold’em проти комп’ютерних суперників просто у вашому браузері. Без акаунта, без з’єднання після першого відкриття сайту і без жодних ставок: місце, щоб навчитися гри, випробувати нову стратегію чи зіграти швидку партію в поїзді.",
    "stepsH2": "Почніть гру за три кроки",
    "steps": [
      [
        "Відкрийте PokerTH і виберіть Локальна / тренування",
        "Відкрийте цей сайт і на першому екрані виберіть Локальна / тренування. Без входу й без завантаження; після першого відкриття сайту режим працює й без з’єднання."
      ],
      [
        "Налаштуйте свій стіл",
        "Виберіть до 9 комп’ютерних суперників, стартовий стек, швидкість зростання блайндів і темп гри або почніть із готового формату. Складність ботів вибирається в тому самому вікні."
      ],
      [
        "Почніть гру",
        "Натисніть Старт: порожні місця займуть комп’ютерні гравці, і карти буде роздано. Гра триває, доки в одного гравця не опиняться всі фішки."
      ]
    ],
    "levelsH2": "Чотири рівні складності",
    "levels": [
      [
        "Легкий",
        "Боти, які неправильно оцінюють свої руки й рідко блефують: саме ті суперники, що потрібні для першої гри."
      ],
      [
        "Звичайний",
        "Надійні суперники, які добре оцінюють свої шанси й грають правильно, коли їхній стек стає коротким."
      ],
      [
        "Складний",
        "Найсильніші боти: точне читання рук, гостра гра з коротким стеком і більше блефу."
      ],
      [
        "Змішаний",
        "Різноманітний стіл, варіант за замовчуванням: у середньому три легкі боти, п’ять звичайних і два складні з кожних десяти."
      ]
    ],
    "brainH2": "Як думають боти",
    "brainP": "Кожен бот обчислює свій реальний шанс виграти роздачу, багато разів розкладаючи решту карт з урахуванням кількості гравців, які ще в банку. Він грає тайтовіше в ранній позиції та краде з пізньої, робить продовжувальну ставку (континуейшн-бет) після рейзу до флопу, напівблефує із сильними дро і, починаючи зі звичайного рівня, переходить на гру all-in або Fold, коли його стек стає коротким.",
    "stylesH2": "П’ять стилів гри",
    "stylesP": "Складність визначає, наскільки добре бот читає гру; стиль — як він грає. Кожен новий стіл поєднує:",
    "styles": [
      [
        "Рок",
        "дуже тайтовий і обережний, заходить у небагато банків і рідко блефує."
      ],
      [
        "Тайт-агресивний (TAG)",
        "обирає добрі руки й агресивно ставить із ними."
      ],
      [
        "Лус-агресивний (LAG)",
        "грає багато рук і тисне на вас."
      ],
      [
        "Колінг-стейшн",
        "зрівнює надто часто й рідко підвищує."
      ],
      [
        "Маніяк",
        "постійно підвищує й блефує."
      ]
    ],
    "formatsH2": "Тренуйтеся у справжніх форматах",
    "formatsP": "Готові налаштування дають змогу почати гру «Спокійний», «Звичайний» чи «Швидкий» або тренуватися в умовах змагань pokerth.net: офіційний темп «Рейтинг», We Cup і BBC з блайндами за часом. Власні налаштування можна зберегти як свій формат.",
    "trophiesH2": "Трофеї та статистика",
    "trophiesP": "Режим тренування має власний поступ: понад тридцять трофеїв у шести категоріях — зіграні роздачі, виграні ігри, серії перемог, перемога над дев’ятьма складними ботами, блефи і кілька секретних. Статистика проти ботів ведеться окремо від ваших онлайн-ігор, а коли ви входите з акаунтом pokerth.net, ваші трофеї переходять із вами на інші пристрої.",
    "learnH2": "Найкраще місце, щоб навчитися",
    "learnP": "Усі помічники вебклієнта працюють тут без тиску: вкладка «Шанси» з вашими шансами на виграш у міру виходу карт, індикатор сили руки, попередньо вибрані дії та гарячі клавіші. Коли відчуєте, що готові, той самий стіл чекає на вас на pokerth.net проти живих гравців.",
    "offlineH2": "Офлайн, на будь-якому пристрої",
    "offlineP": "PokerTH — це вебзастосунок: він працює в браузері на iPhone, Android, Windows, macOS і Linux, і його можна додати на головний екран як застосунок. Після першого відкриття режим тренування взагалі не потребує з’єднання — у режимі польоту, у метро чи будь-де без сигналу.",
    "faqH2": "Запитання",
    "faq": [
      [
        "Чи можна грати в покер проти комп’ютера безкоштовно?",
        "Так. PokerTH — безкоштовна програма з відкритим кодом, без реклами й без покупок у застосунку. Фішки — лише умовні гроші."
      ],
      [
        "Чи потрібен акаунт або з’єднання?",
        "Ні. Режим тренування не потребує акаунта, а після першого відкриття сайту працює без з’єднання."
      ],
      [
        "Проти скількох комп’ютерних суперників можна грати?",
        "До 9, тобто повний стіл на 10 гравців, або проти одного — для гри хедз-ап."
      ],
      [
        "Чи добре грають боти?",
        "Це залежить від вас: легкі боти помиляються, складні точно оцінюють свої шанси й частіше блефують, а змішаний стіл поєднує три рівні з п’ятьма стилями гри."
      ],
      [
        "Чи можна грати з друзями й ботами за одним столом?",
        "Так. Коли ви створюєте стіл на власному сервері PokerTH, у локальній мережі чи в інтернеті, кімната очікування може заповнити порожні місця комп’ютерними гравцями."
      ]
    ]
  },
  ur: {
    "title": "کمپیوٹر کے خلاف پوکر کھیلیں — مفت، آف لائن | PokerTH",
    "desc": "کمپیوٹر حریفوں کے خلاف مفت Texas Hold’em، آپ کی میز پر زیادہ سے زیادہ 9 بوٹس، آسان سے مشکل تک۔ نہ اکاؤنٹ، نہ پیسہ، اور فون اور PC پر آف لائن چلتا ہے۔",
    "ldHeadline": "کمپیوٹر کے خلاف Texas Hold’em پوکر کھیلیں، مفت اور آف لائن",
    "ldDesc": "PokerTH ویب کلائنٹ کا مشق موڈ: کمپیوٹر حریفوں کے خلاف Texas Hold’em، مشکل کی سطحوں، کھیل کے اندازوں اور ٹرافیوں کے ساتھ۔",
    "h1": "کمپیوٹر کے خلاف پوکر کھیلیں، مفت اور آف لائن",
    "lead": "PokerTH کا مشق موڈ کمپیوٹر حریفوں کے خلاف مکمل Texas Hold’em ٹورنامنٹ کھلاتا ہے، سیدھا آپ کے براؤزر میں۔ نہ اکاؤنٹ، سائٹ ایک بار کھل جانے کے بعد نہ کنیکشن، اور داؤ پر کچھ نہیں: کھیل سیکھنے، کوئی نئی حکمتِ عملی آزمانے، یا ٹرین میں جلدی سے ایک گیم کھیلنے کی جگہ۔",
    "stepsH2": "تین قدموں میں گیم شروع کریں",
    "steps": [
      [
        "PokerTH کھولیں اور «مقامی / مشق» چنیں",
        "یہ سائٹ کھولیں اور پہلی اسکرین پر «مقامی / مشق» چنیں۔ نہ لاگ اِن، نہ ڈاؤن لوڈ؛ سائٹ ایک بار کھل جانے کے بعد یہ موڈ کنیکشن کے بغیر بھی چلتا ہے۔"
      ],
      [
        "اپنی میز تیار کریں",
        "زیادہ سے زیادہ 9 کمپیوٹر حریف، ابتدائی چپس، بلائنڈز کے بڑھنے کی رفتار اور کھیل کی رفتار چنیں، یا کسی تیار فارمیٹ سے شروع کریں۔ بوٹس کی مشکل اسی ونڈو میں چنیں۔"
      ],
      [
        "گیم شروع کریں",
        "«شروع» دبائیں: خالی نشستیں کمپیوٹر کھلاڑیوں سے بھر جاتی ہیں اور کارڈ بانٹے جاتے ہیں۔ گیم تب تک چلتی ہے جب تک سارے چپس ایک کھلاڑی کے پاس نہ آ جائیں۔"
      ]
    ],
    "levelsH2": "مشکل کی چار سطحیں",
    "levels": [
      [
        "آسان",
        "ایسے بوٹس جو اپنے ہاتھ کا غلط اندازہ لگاتے ہیں اور کم ہی بلف کرتے ہیں: پہلی گیم کے لیے موزوں حریف۔"
      ],
      [
        "عام",
        "مضبوط حریف جو اپنے امکانات اچھی طرح پڑھتے ہیں اور چپس کم ہونے پر درست کھیلتے ہیں۔"
      ],
      [
        "مشکل",
        "سب سے طاقتور بوٹس: ہاتھوں کی درست پڑھائی، کم چپس کے ساتھ تیز کھیل اور زیادہ بلف۔"
      ],
      [
        "ملا جلا",
        "متنوع میز، طے شدہ انتخاب: اوسطاً ہر دس میں تین آسان بوٹس، پانچ عام اور دو مشکل۔"
      ]
    ],
    "brainH2": "بوٹس کیسے سوچتے ہیں",
    "brainP": "ہر بوٹ باقی کارڈ بہت بار بانٹ کر ہاتھ جیتنے کا اپنا اصل امکان نکالتا ہے، پاٹ میں ابھی موجود کھلاڑیوں کی تعداد کے مقابلے میں۔ وہ ابتدائی پوزیشن میں زیادہ محتاط کھیلتا ہے اور آخری پوزیشن سے چوری کرتا ہے، فلاپ سے پہلے ریز کرنے کے بعد continuation bet لگاتا ہے، مضبوط ڈرا کے ساتھ سیمی بلف کرتا ہے، اور عام سطح سے اوپر، چپس کم ہونے پر All-In یا Fold والے کھیل پر آ جاتا ہے۔",
    "stylesH2": "کھیل کے پانچ انداز",
    "stylesP": "مشکل طے کرتی ہے کہ بوٹ کھیل کو کتنا اچھا پڑھتا ہے؛ اس کا انداز طے کرتا ہے کہ وہ کیسے کھیلتا ہے۔ ہر نئی میز میں یہ ملے جلے ہوتے ہیں:",
    "styles": [
      [
        "راک",
        "بہت ٹائٹ اور محتاط، کم ہی پاٹ میں داخل ہوتا ہے اور کم ہی بلف کرتا ہے۔"
      ],
      [
        "ٹائٹ ایگریسو",
        "اچھے ہاتھ چنتا ہے اور ان پر زور سے شرط لگاتا ہے۔"
      ],
      [
        "لوز ایگریسو",
        "بہت سے ہاتھ کھیلتا ہے اور آپ پر دباؤ ڈالتا ہے۔"
      ],
      [
        "کالنگ اسٹیشن",
        "حد سے زیادہ کال کرتا ہے اور کم ہی ریز کرتا ہے۔"
      ],
      [
        "مینیاک",
        "مسلسل ریز اور بلف کرتا ہے۔"
      ]
    ],
    "formatsH2": "اصل فارمیٹس کی مشق کریں",
    "formatsP": "تیار سیٹنگز سے آپ «پرسکون»، «عام» یا «تیز» گیم شروع کر سکتے ہیں، یا pokerth.net کے مقابلوں کی شرائط میں مشق کر سکتے ہیں: «درجہ بندی» کی سرکاری رفتار، We Cup اور وقت پر مبنی بلائنڈز والا BBC۔ اپنی سیٹنگز کو اپنے ذاتی فارمیٹ کے طور پر محفوظ کیا جا سکتا ہے۔",
    "trophiesH2": "ٹرافیاں اور اعداد و شمار",
    "trophiesP": "مشق موڈ کی اپنی پیش رفت ہے: چھ زمروں میں تیس سے زیادہ ٹرافیاں — کھیلے گئے ہاتھ، جیتی گئی گیمز، جیت کے سلسلے، نو مشکل بوٹس کے خلاف ایک فتح، بلف، اور کچھ راز۔ بوٹس کے خلاف اعداد و شمار آپ کی آن لائن گیمز سے الگ رکھے جاتے ہیں، اور جب آپ pokerth.net اکاؤنٹ سے لاگ اِن کرتے ہیں تو آپ کی ٹرافیاں آپ کے دوسرے آلات تک ساتھ جاتی ہیں۔",
    "learnH2": "سیکھنے کی بہترین جگہ",
    "learnP": "ویب کلائنٹ کی ہر مدد یہاں بغیر دباؤ کے کام کرتی ہے: «امکانات» ٹیب جو کارڈ کھلنے کے ساتھ ساتھ آپ کے جیتنے کا امکان دکھاتا ہے، ہاتھ کی طاقت کا ڈسپلے، پہلے سے چنی گئی چالیں اور کی بورڈ شارٹ کٹس۔ جب آپ خود کو تیار محسوس کریں، وہی میز pokerth.net پر اصلی کھلاڑیوں کے خلاف آپ کی منتظر ہے۔",
    "offlineH2": "آف لائن، ہر ڈیوائس پر",
    "offlineP": "PokerTH ایک ویب ایپ ہے: یہ iPhone، Android، Windows، macOS اور Linux پر براؤزر میں چلتی ہے، اور ایپ کی طرح ہوم اسکرین پر شامل کی جا سکتی ہے۔ ایک بار کھل جانے کے بعد مشق موڈ کو کسی کنیکشن کی ضرورت نہیں — ہوائی جہاز موڈ میں، میٹرو میں یا کہیں بھی جہاں سگنل نہ ہو۔",
    "faqH2": "سوالات",
    "faq": [
      [
        "کیا کمپیوٹر کے خلاف مفت پوکر کھیلا جا سکتا ہے؟",
        "جی ہاں۔ PokerTH مفت اور اوپن سورس سافٹ ویئر ہے، نہ اشتہارات نہ ایپ کے اندر خریداری۔ چپس صرف کھیل کے پیسے ہیں۔"
      ],
      [
        "کیا اکاؤنٹ یا کنیکشن ضروری ہے؟",
        "نہیں۔ مشق موڈ کے لیے اکاؤنٹ کی ضرورت نہیں، اور سائٹ ایک بار کھل جانے کے بعد یہ کنیکشن کے بغیر چلتا ہے۔"
      ],
      [
        "کتنے کمپیوٹر حریفوں کے خلاف کھیلا جا سکتا ہے؟",
        "زیادہ سے زیادہ 9، 10 کھلاڑیوں کی مکمل میز کے لیے، یا آمنے سامنے (ہیڈز اپ) کھیل کے لیے صرف ایک۔"
      ],
      [
        "کیا بوٹس اچھا کھیلتے ہیں؟",
        "یہ آپ پر ہے: آسان بوٹس غلطیاں کرتے ہیں، مشکل بوٹس اپنے امکانات درست پڑھتے ہیں اور زیادہ بلف کرتے ہیں، اور ملی جلی میز تینوں سطحوں کو کھیل کے پانچ اندازوں کے ساتھ ملاتی ہے۔"
      ],
      [
        "کیا ایک ہی میز پر دوستوں اور بوٹس کے ساتھ کھیلا جا سکتا ہے؟",
        "جی ہاں۔ جب آپ اپنے PokerTH سرور پر، LAN پر یا انٹرنیٹ پر میز کی میزبانی کرتے ہیں، تو انتظار گاہ خالی نشستوں کو کمپیوٹر کھلاڑیوں سے بھر سکتی ہے۔"
      ]
    ]
  },
  uz: {
    "title": "Kompyuterga qarshi poker oʻynang — bepul, oflayn | PokerTH",
    "desc": "Kompyuter raqiblariga qarshi bepul Texas Hold’em: stolingizda 9 tagacha bot, osondan qiyingacha. Hisobsiz, pulsiz, telefon va kompyuterda oflayn ishlaydi.",
    "ldHeadline": "Kompyuterga qarshi Texas Hold’em poker oʻynang, bepul va oflayn",
    "ldDesc": "PokerTH veb-mijozining mashgʻulot rejimi: kompyuter raqiblariga qarshi Texas Hold’em, qiyinlik darajalari, oʻyin uslublari va kuboklar bilan.",
    "h1": "Kompyuterga qarshi poker oʻynang, bepul va oflayn",
    "lead": "PokerTH’ning mashgʻulot rejimi kompyuter raqiblariga qarshi toʻliq Texas Hold’em turnirlarini toʻgʻridan-toʻgʻri brauzeringizda tarqatadi. Hisob kerak emas, sayt bir marta ochilgandan keyin ulanish kerak emas va hech narsa xavf ostida emas: oʻyinni oʻrganish, yangi strategiyani sinab koʻrish yoki poyezdda tezkor oʻyin oʻynash uchun joy.",
    "stepsH2": "Oʻyinni uch qadamda boshlang",
    "steps": [
      [
        "PokerTH’ni oching va “Lokal / mashgʻulot” rejimini tanlang",
        "Ushbu saytni oching va birinchi ekranda “Lokal / mashgʻulot” rejimini tanlang. Kirish ham, yuklab olish ham yoʻq; sayt bir marta ochilgandan keyin rejim ulanishsiz ham ishlaydi."
      ],
      [
        "Stolingizni sozlang",
        "9 tagacha kompyuter raqibi, boshlangʻich stek, blayndlar qanchalik tez oshishi va oʻyin tezligini tanlang yoki tayyor formatdan boshlang. Botlarning qiyinligini oʻsha oynada tanlang."
      ],
      [
        "Oʻyinni boshlang",
        "“Boshlash” tugmasini bosing: boʻsh joylar kompyuter oʻyinchilari bilan toʻladi va kartalar tarqatiladi. Oʻyin bitta oʻyinchi barcha fishkalarni yigʻib olguncha davom etadi."
      ]
    ],
    "levelsH2": "Toʻrt qiyinlik darajasi",
    "levels": [
      [
        "Oson",
        "Qoʻllarini notoʻgʻri baholaydigan va kamdan-kam blef qiladigan botlar: birinchi oʻyin uchun mos raqiblar."
      ],
      [
        "Oʻrtacha",
        "Imkoniyatlarini yaxshi baholaydigan va steki qisqarganda toʻgʻri oʻynaydigan mustahkam raqiblar."
      ],
      [
        "Qiyin",
        "Eng kuchli botlar: qoʻllarni aniq oʻqish, qisqa stek bilan oʻtkir oʻyin va koʻproq blef."
      ],
      [
        "Aralash",
        "Turli-tuman stol, standart tanlov: har oʻnta botdan oʻrtacha uchtasi oson, beshtasi oʻrtacha va ikkitasi qiyin."
      ]
    ],
    "brainH2": "Botlar qanday fikrlaydi",
    "brainP": "Har bir bot qolgan kartalarni koʻp marta tarqatib, bankda hali qolgan oʻyinchilar soniga qarshi qoʻlni yutishning haqiqiy imkoniyatini hisoblab chiqadi. U erta pozitsiyada qattiqroq oʻynaydi va kech pozitsiyadan oʻgʻirlaydi, flopdan oldin oshirgandan keyin davomiy stavka (continuation bet) qiladi, kuchli drolar bilan yarim blef qiladi va oʻrtacha darajadan boshlab, steki qisqarganda “ol-in yoki tashlash” oʻyiniga oʻtadi.",
    "stylesH2": "Beshta oʻyin uslubi",
    "stylesP": "Qiyinlik botning oʻyinni qanchalik yaxshi oʻqishini, uslub esa qanday oʻynashini belgilaydi. Har bir yangi stol quyidagilarni aralashtiradi:",
    "styles": [
      [
        "Rok",
        "juda qattiq va ehtiyotkor, kam bankka kiradi va kamdan-kam blef qiladi."
      ],
      [
        "Tayt-agressiv (TAG)",
        "yaxshi qoʻllarni tanlaydi va ular bilan qattiq stavka qiladi."
      ],
      [
        "Lus-agressiv (LAG)",
        "koʻp qoʻl oʻynaydi va sizga bosim oʻtkazadi."
      ],
      [
        "Kolling-steyshn",
        "haddan tashqari tez-tez tenglashtiradi va kamdan-kam oshiradi."
      ],
      [
        "Manyak",
        "doimiy ravishda oshiradi va blef qiladi."
      ]
    ],
    "formatsH2": "Haqiqiy formatlarda mashq qiling",
    "formatsP": "Tayyor sozlamalar “Xotirjam”, “Oddiy” yoki “Tez” oʻyinni boshlash yoxud pokerth.net musobaqalari sharoitida mashq qilish imkonini beradi: rasmiy “Reyting” surʼati, We Cup va vaqtga asoslangan blayndlari bilan BBC. Oʻz sozlamalaringizni shaxsiy format sifatida saqlashingiz mumkin.",
    "trophiesH2": "Kuboklar va statistika",
    "trophiesP": "Mashgʻulot rejimining oʻz rivojlanish tizimi bor: oltita toifada oʻttizdan ortiq kubok — oʻynalgan qoʻllar, yutilgan oʻyinlar, gʻalabalar seriyasi, toʻqqizta qiyin botga qarshi gʻalaba, bleflar va bir nechta sir. Botlarga qarshi statistika onlayn oʻyinlaringizdan alohida saqlanadi, pokerth.net hisobi bilan kirganingizda esa kuboklaringiz boshqa qurilmalaringizga ham oʻtadi.",
    "learnH2": "Oʻrganish uchun eng yaxshi joy",
    "learnP": "Veb-mijozning barcha yordamchi vositalari bu yerda bosimsiz ishlaydi: kartalar ochilgan sari yutish imkoniyatingizni koʻrsatadigan Ehtimollar paneli, qoʻl kuchi koʻrsatkichi, oldindan tanlangan harakatlar va klaviatura yorliqlari. Tayyor ekaningizni his qilganingizda, xuddi shu stol sizni pokerth.net’da haqiqiy oʻyinchilarga qarshi kutmoqda.",
    "offlineH2": "Oflayn, har qanday qurilmada",
    "offlineP": "PokerTH — veb-ilova: u iPhone, Android, Windows, macOS va Linux’da brauzerda ishlaydi va ilova kabi bosh ekranga qoʻshilishi mumkin. Bir marta ochilgandan keyin mashgʻulot rejimi umuman ulanishni talab qilmaydi — parvoz rejimida, metroda yoki signal boʻlmagan har qanday joyda.",
    "faqH2": "Savollar",
    "faq": [
      [
        "Kompyuterga qarshi bepul poker oʻynasam boʻladimi?",
        "Ha. PokerTH — reklamasiz va ilova ichidagi xaridlarsiz bepul, ochiq manbali dastur. Fishkalar faqat oʻyin puli."
      ],
      [
        "Menga hisob yoki ulanish kerakmi?",
        "Yoʻq. Mashgʻulot rejimi hisob talab qilmaydi va sayt bir marta ochilgandan keyin ulanishsiz ishlaydi."
      ],
      [
        "Nechta kompyuter raqibiga qarshi oʻynashim mumkin?",
        "9 tagacha — 10 oʻyinchilik toʻliq stol uchun — yoki yakkama-yakka oʻyin uchun faqat bittasiga qarshi."
      ],
      [
        "Botlar yaxshi oʻynaydimi?",
        "Bu sizga bogʻliq: oson botlar xato qiladi, qiyin botlar imkoniyatlarini aniq baholaydi va koʻproq blef qiladi, aralash stol esa uchta darajani beshta oʻyin uslubi bilan birlashtiradi."
      ],
      [
        "Doʻstlar va botlar bilan bitta stolda oʻynasam boʻladimi?",
        "Ha. Oʻz PokerTH serveringizda, LAN’da yoki internetda stol ochganingizda, kutish xonasi boʻsh joylarni kompyuter oʻyinchilari bilan toʻldirishi mumkin."
      ]
    ]
  },
  vi: {
    "title": "Chơi poker với máy tính — miễn phí, offline | PokerTH",
    "desc": "Texas Hold’em miễn phí đấu với máy, tối đa 9 bot trong bàn, từ dễ đến khó. Không cần tài khoản, không dùng tiền, chơi offline được trên điện thoại và PC.",
    "ldHeadline": "Chơi poker Texas Hold’em với máy tính, miễn phí và offline",
    "ldDesc": "Chế độ luyện tập của ứng dụng web PokerTH: Texas Hold’em đấu với đối thủ máy, có các mức độ khó, phong cách chơi và cúp.",
    "h1": "Chơi poker với máy tính, miễn phí và offline",
    "lead": "Chế độ luyện tập của PokerTH chia bài những giải Texas Hold’em trọn vẹn đấu với đối thủ máy, ngay trên trình duyệt của bạn. Không cần tài khoản, không cần kết nối khi đã mở trang một lần, và không có gì phải đặt cược: nơi để học chơi, thử một chiến thuật mới hay chơi nhanh một ván trên tàu.",
    "stepsH2": "Bắt đầu ván chơi trong ba bước",
    "steps": [
      [
        "Mở PokerTH và chọn Cục bộ / luyện tập",
        "Mở trang này và chọn Cục bộ / luyện tập ở màn hình đầu tiên. Không cần đăng nhập, không cần tải về; khi đã mở trang một lần, chế độ này vẫn chạy được mà không cần kết nối."
      ],
      [
        "Thiết lập bàn của bạn",
        "Chọn tối đa 9 đối thủ máy, số chip khởi đầu, tốc độ tăng tiền cược mù và tốc độ ván chơi, hoặc bắt đầu từ một thể thức có sẵn. Chọn độ khó của bot ngay trong cùng cửa sổ."
      ],
      [
        "Bắt đầu ván chơi",
        "Nhấn Bắt đầu: các ghế trống được lấp bằng người chơi máy và bài được chia. Ván chơi kéo dài cho đến khi một người nắm giữ toàn bộ chip."
      ]
    ],
    "levelsH2": "Bốn mức độ khó",
    "levels": [
      [
        "Dễ",
        "Bot đánh giá sai bài của mình và hiếm khi tháu cáy: đối thủ phù hợp cho ván đầu tiên."
      ],
      [
        "Bình thường",
        "Đối thủ vững vàng, đọc tốt cơ hội của mình và chơi đúng khi chip còn ít."
      ],
      [
        "Khó",
        "Những bot mạnh nhất: đọc bài chính xác, chơi sắc bén khi chip mỏng và tháu cáy nhiều hơn."
      ],
      [
        "Hỗn hợp",
        "Một bàn đa dạng, mặc định: trung bình cứ mười bot thì có ba bot dễ, năm bình thường và hai khó."
      ]
    ],
    "brainH2": "Bot suy nghĩ thế nào",
    "brainP": "Mỗi bot tính ra cơ hội thắng thật sự của mình trong ván bằng cách chia thử các lá còn lại rất nhiều lần, so với số người chơi vẫn còn trong pot. Nó chơi chặt hơn ở vị trí đầu và cướp pot từ vị trí cuối, đặt cược tiếp diễn (continuation bet) sau khi tố trước flop, bán tháu cáy với bài chờ mạnh, và từ mức bình thường trở lên, chuyển sang lối chơi All-In hoặc Fold khi chip còn ít.",
    "stylesH2": "Năm phong cách chơi",
    "stylesP": "Độ khó quyết định bot đọc ván chơi giỏi đến đâu; phong cách quyết định nó chơi ra sao. Mỗi bàn mới pha trộn:",
    "styles": [
      [
        "Rock",
        "rất chặt và thận trọng, ít vào pot và hiếm khi tháu cáy."
      ],
      [
        "Tight-aggressive",
        "chọn bài tốt và cược mạnh với chúng."
      ],
      [
        "Loose-aggressive",
        "chơi nhiều tay bài và gây áp lực lên bạn."
      ],
      [
        "Calling station",
        "Call quá thường xuyên và hiếm khi Raise."
      ],
      [
        "Maniac",
        "liên tục Raise và tháu cáy."
      ]
    ],
    "formatsH2": "Luyện các thể thức thật",
    "formatsP": "Các thiết lập có sẵn cho phép bạn bắt đầu một ván Thư thái, Thường hoặc Nhanh, hoặc luyện tập trong điều kiện của các giải đấu trên pokerth.net: nhịp độ Xếp hạng chính thức, We Cup và BBC với blind theo thời gian. Thiết lập của bạn có thể lưu lại thành một thể thức của riêng bạn.",
    "trophiesH2": "Cúp và thống kê",
    "trophiesP": "Chế độ luyện tập có tiến trình riêng: hơn ba mươi cúp trong sáu hạng mục — số tay bài đã chơi, số ván đã thắng, chuỗi thắng, một chiến thắng trước chín bot khó, tháu cáy, và vài bí mật. Thống kê khi đấu với bot được lưu riêng với các ván online của bạn, và khi bạn đăng nhập bằng tài khoản pokerth.net, cúp của bạn sẽ theo bạn sang các thiết bị khác.",
    "learnH2": "Nơi tốt nhất để học",
    "learnP": "Mọi công cụ hỗ trợ của ứng dụng web đều hoạt động ở đây mà không có áp lực: tab Cơ hội với khả năng thắng của bạn khi các lá được lật, phần hiển thị sức mạnh tay bài, hành động chọn trước và phím tắt. Khi thấy mình đã sẵn sàng, chính chiếc bàn ấy đang chờ bạn trên pokerth.net với người chơi thật.",
    "offlineH2": "Offline, trên mọi thiết bị",
    "offlineP": "PokerTH là ứng dụng web: nó chạy trên trình duyệt của iPhone, Android, Windows, macOS và Linux, và có thể thêm vào màn hình chính như một ứng dụng. Khi đã mở một lần, chế độ luyện tập không cần kết nối nào cả — ở chế độ máy bay, trên tàu điện ngầm hay bất cứ nơi nào không có sóng.",
    "faqH2": "Câu hỏi",
    "faq": [
      [
        "Tôi có thể chơi poker với máy miễn phí không?",
        "Có. PokerTH là phần mềm miễn phí, mã nguồn mở, không quảng cáo và không mua hàng trong ứng dụng. Chip chỉ là tiền ảo để chơi."
      ],
      [
        "Tôi có cần tài khoản hay kết nối không?",
        "Không. Chế độ luyện tập không cần tài khoản, và khi đã mở trang một lần, nó chạy mà không cần kết nối."
      ],
      [
        "Tôi có thể đấu với bao nhiêu đối thủ máy?",
        "Tối đa 9, cho một bàn đủ 10 người chơi, hoặc chỉ một đối thủ để chơi một đối một."
      ],
      [
        "Bot có giỏi không?",
        "Tùy bạn chọn: bot dễ hay mắc lỗi, bot khó đọc cơ hội chính xác và tháu cáy nhiều hơn, còn bàn hỗn hợp kết hợp ba mức với năm phong cách chơi."
      ],
      [
        "Tôi có thể chơi cùng bạn bè và bot trong một bàn không?",
        "Có. Khi bạn mở bàn trên máy chủ PokerTH của riêng mình, trong mạng LAN hay trên internet, phòng chờ có thể lấp các ghế trống bằng người chơi máy."
      ]
    ]
  },
  yo: {
    "title": "Poker lòdì sí kọ̀ǹpútà — ọ̀fẹ́, offline | PokerTH",
    "desc": "Texas Hold’em ọ̀fẹ́ lòdì sí alátakò kọ̀ǹpútà, títí dé bot 9 ní tábìlì rẹ, láti rọrùn dé le. Kò sí àkáǹtì, kò sí owó, ó ń ṣiṣẹ́ offline lórí fóònù àti kọ̀ǹpútà.",
    "ldHeadline": "Ṣe poker Texas Hold’em lòdì sí kọ̀ǹpútà, lọ́fẹ̀ẹ́ àti offline",
    "ldDesc": "Ipò ìdánrawò ti oníbàárà wẹ́ẹ̀bù PokerTH: Texas Hold’em lòdì sí àwọn alátakò kọ̀ǹpútà, pẹ̀lú ìpele ìṣòro, ọ̀nà ìṣeré àti àmì-ẹ̀yẹ.",
    "h1": "Ṣe poker lòdì sí kọ̀ǹpútà, lọ́fẹ̀ẹ́ àti offline",
    "lead": "Ipò ìdánrawò PokerTH ń pín àwọn ìdíje Texas Hold’em pípé lòdì sí àwọn alátakò kọ̀ǹpútà, ní tààrà nínú aṣàwákiri rẹ. Kò sí àkáǹtì, kò sí ìsopọ̀ lẹ́yìn tí o bá ti ṣí ojú-òpó náà lẹ́ẹ̀kan, kò sì sí nǹkan tí a fi wewu: ibi láti kọ́ eré náà, láti dán ọgbọ́n tuntun wò, tàbí láti ṣe eré kíákíá nínú ọkọ̀ ojú-irin.",
    "stepsH2": "Bẹ̀rẹ̀ eré ní ìgbésẹ̀ mẹ́ta",
    "steps": [
      [
        "Ṣí PokerTH kí o yan Agbègbè / ìdánrawò",
        "Ṣí ojú-òpó yìí kí o yan Agbègbè / ìdánrawò ní ojú-ìwé àkọ́kọ́. Kò sí wíwọlé, kò sì sí gbígbàsílẹ̀; lẹ́yìn tí o bá ti ṣí ojú-òpó náà lẹ́ẹ̀kan, ipò yìí ń ṣiṣẹ́ láìsí ìsopọ̀ pẹ̀lú."
      ],
      [
        "Ṣètò tábìlì rẹ",
        "Yan títí dé alátakò kọ̀ǹpútà 9, stack ìbẹ̀rẹ̀, bí blinds ṣe ń gòkè kíákíá tó àti ìyára eré, tàbí bẹ̀rẹ̀ láti fọ́mààtì tí a ti ṣètò tẹ́lẹ̀. Yan ìṣòro àwọn bot nínú fèrèsé kan náà."
      ],
      [
        "Bẹ̀rẹ̀ eré náà",
        "Tẹ Bẹ̀rẹ̀: àwọn òṣèré kọ̀ǹpútà yóò kún àwọn ìjókòó òfo, a ó sì pín àwọn káàdì. Eré náà ń bá a lọ títí òṣèré kan yóò fi ní gbogbo chips."
      ]
    ],
    "levelsH2": "Ìpele ìṣòro mẹ́rin",
    "levels": [
      [
        "Rọrùn",
        "Àwọn bot tí kò mọ agbára ọwọ́ wọn dáadáa, tí wọn kì í sì í bluff púpọ̀: àwọn alátakò tó yẹ fún eré àkọ́kọ́."
      ],
      [
        "Déédéé",
        "Àwọn alátakò tó dúró ṣinṣin, tí wọ́n mọ àǹfààní wọn dáadáa, tí wọ́n sì ń ṣeré bó ti tọ́ nígbà tí stack wọn bá ń kúrú."
      ],
      [
        "Le",
        "Àwọn bot tó lágbára jù lọ: kíka ọwọ́ ní pàtó, eré mímú pẹ̀lú stack kúkúrú, àti bluff púpọ̀ sí i."
      ],
      [
        "Àdàpọ̀",
        "Tábìlì oríṣiríṣi, èyí tí a yàn tẹ́lẹ̀: ní ìpíndọ́gba, bot rírọrùn mẹ́ta, déédéé márùn-ún àti líle méjì nínú mẹ́wàá kọ̀ọ̀kan."
      ]
    ],
    "brainH2": "Bí àwọn bot ṣe ń ronú",
    "brainP": "Bot kọ̀ọ̀kan ń ṣírò àǹfààní gidi rẹ̀ láti borí ọwọ́ náà nípa pípín àwọn káàdì tó kù ní ọ̀pọ̀ ìgbà, ní ìbámu pẹ̀lú iye òṣèré tó ṣì wà nínú pot. Ó ń ṣeré pẹ̀lú ìṣọ́ra ní ipò ìbẹ̀rẹ̀, ó sì ń jí láti ipò ẹ̀yìn, ó ń ṣe continuation bet lẹ́yìn tí ó bá ti Raise ṣáájú flop, ó ń semi-bluff pẹ̀lú àwọn draw tó lágbára, àti láti ìpele déédéé sókè, ó ń yípadà sí eré all-in tàbí fold nígbà tí stack rẹ̀ bá kúrú.",
    "stylesH2": "Ọ̀nà ìṣeré márùn-ún",
    "stylesP": "Ìṣòro ń pinnu bí bot ṣe ń ka eré náà dáadáa tó; ọ̀nà rẹ̀ ń pinnu bí ó ṣe ń ṣeré. Tábìlì tuntun kọ̀ọ̀kan ń da àwọn wọ̀nyí pọ̀:",
    "styles": [
      [
        "Rock",
        "ó há gidigidi, ó sì ṣọ́ra, ó ń wọ pot díẹ̀, kì í sì í bluff púpọ̀."
      ],
      [
        "Tight-aggressive",
        "ó ń yan ọwọ́ tó dára, ó sì ń tẹ́tẹ́ lé wọn lágbára."
      ],
      [
        "Loose-aggressive",
        "ó ń ṣe ọ̀pọ̀ ọwọ́, ó sì ń fi ìfúnpá sí ọ."
      ],
      [
        "Calling station",
        "ó ń Call jù, kì í sì í Raise púpọ̀."
      ],
      [
        "Maniac",
        "ó ń Raise, ó sì ń bluff láìdúró."
      ]
    ],
    "formatsH2": "Ṣe ìdánrawò àwọn fọ́mààtì gidi",
    "formatsP": "Àwọn ètò tí a ti ṣe tẹ́lẹ̀ jẹ́ kí o bẹ̀rẹ̀ eré Pẹ̀lẹ́, Déédéé tàbí Kíákíá, tàbí kí o ṣe ìdánrawò lábẹ́ àwọn ipò ìdíje pokerth.net: ìyára Ranking ti ìjọba, We Cup àti BBC pẹ̀lú blinds rẹ̀ tó ń gòkè ní ìbámu pẹ̀lú àkókò. O lè fi àwọn ètò tìrẹ pamọ́ gẹ́gẹ́ bí fọ́mààtì tìrẹ.",
    "trophiesH2": "Àmì-ẹ̀yẹ àti ìṣirò",
    "trophiesP": "Ipò ìdánrawò ní ìlọsíwájú tirẹ̀: ó ju àmì-ẹ̀yẹ ọgbọ̀n lọ ní ẹ̀ka mẹ́fà — ọwọ́ tí o ti ṣe, eré tí o ti borí, ìtẹ̀léra ìṣẹ́gun, ìṣẹ́gun kan lòdì sí bot líle mẹ́sàn-án, bluff, àti àwọn àṣírí díẹ̀. Ìṣirò lòdì sí àwọn bot wà lọ́tọ̀ sí eré orí ayélujára rẹ, nígbà tí o bá sì wọlé pẹ̀lú àkáǹtì pokerth.net, àwọn àmì-ẹ̀yẹ rẹ yóò tẹ̀lé ọ lọ sí àwọn ẹ̀rọ rẹ mìíràn.",
    "learnH2": "Ibi tó dára jù lọ láti kẹ́kọ̀ọ́",
    "learnP": "Gbogbo ìrànlọ́wọ́ oníbàárà wẹ́ẹ̀bù ń ṣiṣẹ́ níbí láìsí ìfúnpá: táàbù Àǹfààní pẹ̀lú àǹfààní rẹ láti borí bí àwọn káàdì ṣe ń jáde, àfihàn agbára ọwọ́, àwọn ìgbésẹ̀ tí a yàn ṣáájú àti àwọn ọ̀nà-àbùjá kíbọ́ọ̀dù. Nígbà tí o bá ti múra, tábìlì kan náà ń dúró dè ọ́ lórí pokerth.net lòdì sí àwọn òṣèré gidi.",
    "offlineH2": "Offline, lórí gbogbo ẹ̀rọ",
    "offlineP": "PokerTH jẹ́ áàpù wẹ́ẹ̀bù: ó ń ṣiṣẹ́ nínú aṣàwákiri lórí iPhone, Android, Windows, macOS àti Linux, a sì lè fi kún ojú-ìbojú ilé bí áàpù. Lẹ́yìn tí o bá ti ṣí i lẹ́ẹ̀kan, ipò ìdánrawò kò nílò ìsopọ̀ rárá — ní ipò ọkọ̀ òfurufú, nínú ọkọ̀ ojú-irin abẹ́lẹ̀, tàbí níbikíbi tí kò sí àmì nẹ́tíwọ́ọ̀kì.",
    "faqH2": "Àwọn ìbéèrè",
    "faq": [
      [
        "Ṣé mo lè ṣe poker lòdì sí kọ̀ǹpútà lọ́fẹ̀ẹ́?",
        "Bẹ́ẹ̀ ni. PokerTH jẹ́ sọ́fítíwía ọ̀fẹ́ àti orísun ṣíṣí, láìsí ìpolówó àti láìsí ríra nǹkan nínú áàpù. Chips jẹ́ owó eré nìkan."
      ],
      [
        "Ṣé mo nílò àkáǹtì tàbí ìsopọ̀?",
        "Rárá. Ipò ìdánrawò kò nílò àkáǹtì, lẹ́yìn tí o bá sì ti ṣí ojú-òpó náà lẹ́ẹ̀kan, ó ń ṣiṣẹ́ láìsí ìsopọ̀."
      ],
      [
        "Alátakò kọ̀ǹpútà mélòó ni mo lè bá ṣeré?",
        "Títí dé 9, fún tábìlì kíkún ti òṣèré 10, tàbí ẹyọ kan ṣoṣo fún heads-up."
      ],
      [
        "Ṣé àwọn bot dára?",
        "Ó wà lọ́wọ́ rẹ: àwọn bot rírọrùn ń ṣe àṣìṣe, àwọn bot líle ń mọ àǹfààní wọn ní pàtó, wọ́n sì ń bluff jù, tábìlì àdàpọ̀ sì ń da ìpele mẹ́ta náà pọ̀ mọ́ ọ̀nà ìṣeré márùn-ún."
      ],
      [
        "Ṣé mo lè ṣeré pẹ̀lú ọ̀rẹ́ àti bot ní tábìlì kan náà?",
        "Bẹ́ẹ̀ ni. Nígbà tí o bá gbàlejò tábìlì kan lórí olùpín PokerTH tìrẹ, lórí LAN tàbí lórí íntánẹ́ẹ̀tì, yàrá ìdúró lè fi àwọn òṣèré kọ̀ǹpútà kún àwọn ìjókòó òfo."
      ]
    ]
  },
  zh: {
    "title": "和电脑对战德州扑克 — 免费，可离线畅玩 | PokerTH",
    "desc": "免费与电脑对手玩德州扑克，每桌最多 9 个机器人，难度从简单到困难。无需账号，不涉及金钱，手机和电脑上都能离线玩。",
    "ldHeadline": "免费离线与电脑对战德州扑克",
    "ldDesc": "PokerTH 网页版客户端的训练模式：与电脑对手玩德州扑克，含难度等级、打法风格和奖杯。",
    "h1": "免费与电脑对战扑克，支持离线",
    "lead": "PokerTH 的训练模式直接在你的浏览器里，与电脑对手进行完整的德州扑克锦标赛。无需账号，网站打开过一次后无需联网，也不涉及任何赌注：这里是学习玩法、尝试新策略，或在火车上快速来一局的好地方。",
    "stepsH2": "三步开始一局游戏",
    "steps": [
      [
        "打开 PokerTH 并选择「本地 / 训练」模式",
        "打开本网站，在第一个界面选择「本地 / 训练」。无需登录，无需下载；网站打开过一次后，该模式在没有网络时也能使用。"
      ],
      [
        "设置你的牌桌",
        "选择最多 9 个电脑对手、起始筹码、盲注上涨的速度和游戏速度，或者从现成的格式开始。机器人难度在同一窗口中选择。"
      ],
      [
        "开始游戏",
        "点击「开始」：空座位会由电脑玩家补齐，随即开始发牌。游戏一直进行到一名玩家赢得全部筹码。"
      ]
    ],
    "levelsH2": "四个难度等级",
    "levels": [
      [
        "简单",
        "常常误判自己的牌、很少诈唬的机器人：第一局的理想对手。"
      ],
      [
        "普通",
        "稳健的对手，能准确判断自己的胜算，筹码变短时也能打得正确。"
      ],
      [
        "困难",
        "最强的机器人：读牌精准，短筹码阶段打法犀利，诈唬也更多。"
      ],
      [
        "混合",
        "多样化的牌桌，默认选项：平均每十个机器人中有三个简单、五个普通、两个困难。"
      ]
    ],
    "brainH2": "机器人如何思考",
    "brainP": "每个机器人会把剩余的牌反复模拟发出许多次，结合仍留在底池中的玩家人数，算出自己赢下这手牌的真实几率。它在前位打得更紧，在后位偷盲，翻牌前加注后会持续下注，用强听牌做半诈唬，并且从普通难度起，在筹码变短时切换为全下或弃牌的打法。",
    "stylesH2": "五种打法风格",
    "stylesP": "难度决定机器人读懂牌局的程度；风格决定它怎么打。每张新牌桌都会混合以下风格：",
    "styles": [
      [
        "岩石型",
        "非常紧且谨慎，很少入池，很少诈唬。"
      ],
      [
        "紧凶",
        "精选好牌，并且下注凶狠。"
      ],
      [
        "松凶",
        "玩很多手牌，不断给你施压。"
      ],
      [
        "跟注站",
        "跟注过于频繁，很少加注。"
      ],
      [
        "疯子型",
        "不停地加注和诈唬。"
      ]
    ],
    "formatsH2": "练习真实赛制",
    "formatsP": "现成的设置让你可以开始「轻松」、「普通」或「快速」牌局，也可以按 pokerth.net 比赛的条件练习：官方「排名」节奏、We Cup，以及按时间涨盲的 BBC。你自己的设置可以保存为专属格式。",
    "trophiesH2": "奖杯和统计",
    "trophiesP": "训练模式有自己的成长体系：六大类共三十多个奖杯——打过的手牌、赢下的牌局、连胜、战胜九个困难机器人、诈唬，还有一些隐藏奖杯。对战机器人的统计与你的在线牌局分开记录；用 pokerth.net 账号登录后，你的奖杯会跟随你同步到其他设备。",
    "learnH2": "学习的最佳场所",
    "learnP": "网页版客户端的所有辅助功能在这里都能毫无压力地使用：「胜率」标签页随着牌发出显示你的获胜几率，还有牌力显示、预选操作和键盘快捷键。当你觉得准备好了，同样的牌桌就在 pokerth.net 上等你与真人玩家对战。",
    "offlineH2": "离线可玩，适用所有设备",
    "offlineP": "PokerTH 是一款网页应用：它在 iPhone、Android、Windows、macOS 和 Linux 的浏览器中运行，并可以像应用一样添加到主屏幕。打开过一次后，训练模式完全不需要联网——飞行模式下、地铁里，或任何没有信号的地方都能玩。",
    "faqH2": "常见问题",
    "faq": [
      [
        "可以免费和电脑玩扑克吗？",
        "可以。PokerTH 是免费开源软件，没有广告，也没有应用内购买。筹码只是游戏币。"
      ],
      [
        "需要账号或联网吗？",
        "不需要。训练模式无需账号，网站打开过一次后即可在没有网络的情况下运行。"
      ],
      [
        "最多可以和多少个电脑对手对战？",
        "最多 9 个，凑满一桌 10 名玩家；也可以只设一个，进行单挑。"
      ],
      [
        "机器人厉害吗？",
        "这由你决定：简单机器人会犯错，困难机器人能精准判断胜算并更多地诈唬，混合牌桌则把三个难度与五种打法风格结合在一起。"
      ],
      [
        "可以在同一张牌桌上和朋友以及机器人一起玩吗？",
        "可以。当你在自己的 PokerTH 服务器上（局域网或互联网）开设牌桌时，等候室可以用电脑玩家补齐空座位。"
      ]
    ]
  },
  "zh-HK": {
    "title": "和電腦玩撲克 — 免費、離線也能玩 | PokerTH",
    "desc": "免費和電腦對手玩 Texas Hold’em 德州撲克，你的牌桌最多 9 個機器人，由簡單到困難。無須帳戶，不涉金錢，在手機和電腦上都可離線玩。",
    "ldHeadline": "和電腦玩 Texas Hold’em 德州撲克，免費又可離線",
    "ldDesc": "PokerTH 網頁版客戶端的練習模式：和電腦對手玩 Texas Hold’em 德州撲克，設有難度等級、打法風格和獎盃。",
    "h1": "和電腦玩撲克，免費又可離線",
    "lead": "PokerTH 的練習模式直接在你的瀏覽器裡，和電腦對手發牌進行完整的 Texas Hold’em 錦標賽。無須帳戶，網站打開過一次後就不用連線，也沒有任何輸贏代價：這裡適合學習打牌、試驗新策略，或者在火車上快快玩一局。",
    "stepsH2": "三步開始一局",
    "steps": [
      [
        "打開 PokerTH，選擇「本機 / 練習」模式",
        "打開這個網站，在第一個畫面選擇「本機 / 練習」。無須登入，也無須下載；網站打開過一次後，這個模式在沒有連線時也能用。"
      ],
      [
        "設定你的牌桌",
        "選擇最多 9 個電腦對手、起始籌碼、盲注上漲的速度和遊戲速度，或者從現成的格式開始。在同一個視窗裡選擇機器人的難度。"
      ],
      [
        "開始遊戲",
        "按「開始」：空位會由電腦玩家補上，然後發牌。遊戲一直進行，直到一位玩家贏得所有籌碼。"
      ]
    ],
    "levelsH2": "四個難度等級",
    "levels": [
      [
        "簡單",
        "會錯判自己手牌、很少詐唬的機器人：第一局的合適對手。"
      ],
      [
        "普通",
        "穩健的對手，能準確判斷自己的勝算，籌碼量變短時也打得正確。"
      ],
      [
        "困難",
        "最強的機器人：精準讀牌、短籌碼打法凌厲，詐唬也更多。"
      ],
      [
        "混合",
        "多樣化的牌桌，也是預設選項：平均每十個機器人中，有三個簡單、五個普通、兩個困難。"
      ]
    ],
    "brainH2": "機器人怎樣思考",
    "brainP": "每個機器人都會把剩下的牌反覆發很多次，按仍留在底池中的玩家人數，計算出自己贏這手牌的真實機率。它在前位打得更緊，在後位偷盲，翻牌前加注後會打持續下注（c-bet），拿強聽牌半詐唬；由普通難度起，當籌碼量變短時，它會轉為只打 All-In 或 Fold。",
    "stylesH2": "五種打法風格",
    "stylesP": "難度決定機器人讀局有多準；風格決定它怎樣打。每張新牌桌都會混合：",
    "styles": [
      [
        "岩石型（Rock）",
        "打得非常緊又謹慎，很少入池，也很少詐唬。"
      ],
      [
        "緊兇型（TAG）",
        "精選好牌，並大力下注。"
      ],
      [
        "鬆兇型（LAG）",
        "玩很多手牌，不停向你施壓。"
      ],
      [
        "跟注站（Calling station）",
        "太常跟注，很少加注。"
      ],
      [
        "瘋子型（Maniac）",
        "不停加注和詐唬。"
      ]
    ],
    "formatsH2": "練習真實的比賽格式",
    "formatsP": "現成的設定讓你開始「輕鬆」、「普通」或「快速」牌局，或者按 pokerth.net 比賽的條件練習：官方「排名」節奏、We Cup，以及依時間調升盲注的 BBC。你自己的設定可以儲存為你的專屬格式。",
    "trophiesH2": "獎盃和統計",
    "trophiesP": "練習模式有自己的進度：六個類別共三十多個獎盃——玩過的手牌、贏過的遊戲、連勝、擊敗九個困難機器人的勝利、詐唬，還有幾個隱藏秘密。對戰機器人的統計與你的網上遊戲分開保存；用 pokerth.net 帳戶登入時，你的獎盃會跟隨你到其他裝置。",
    "learnH2": "學習的最佳地方",
    "learnP": "網頁版客戶端的所有輔助功能在這裡都可以毫無壓力地使用：「勝率」分頁隨著牌逐張發出顯示你的獲勝機率，還有牌力顯示、預選動作和鍵盤快捷鍵。當你覺得準備好了，同一張牌桌就在 pokerth.net 上等你，對手是真人玩家。",
    "offlineH2": "離線玩，所有裝置都支援",
    "offlineP": "PokerTH 是網頁應用程式：可在 iPhone、Android、Windows、macOS 和 Linux 的瀏覽器中執行，也可以像應用程式一樣加到主畫面。打開過一次後，練習模式完全不需要連線——在飛航模式、在地鐵上，或任何沒有訊號的地方都可以玩。",
    "faqH2": "問題",
    "faq": [
      [
        "可以免費和電腦玩撲克嗎？",
        "可以。PokerTH 是免費的開源軟件，沒有廣告，也沒有應用程式內購買。籌碼只是遊戲幣。"
      ],
      [
        "需要帳戶或連線嗎？",
        "不需要。練習模式無須帳戶，網站打開過一次後，沒有連線也能用。"
      ],
      [
        "最多可以和多少個電腦對手玩？",
        "最多 9 個，湊成 10 人滿桌；也可以只對一個，打單挑。"
      ],
      [
        "機器人厲害嗎？",
        "由你決定：簡單機器人會犯錯，困難機器人能精準判斷勝算、詐唬也更多，混合牌桌則把三個難度和五種打法風格混在一起。"
      ],
      [
        "可以和朋友及機器人同桌玩嗎？",
        "可以。當你在自己的 PokerTH 伺服器上開桌，無論在區域網絡還是互聯網上，等候室都可以用電腦玩家補上空位。"
      ]
    ]
  },
  "zh-TW": {
    "title": "和電腦玩德州撲克 — 免費、可離線遊玩 | PokerTH",
    "desc": "免費和電腦玩 Texas Hold’em（德州撲克），你的牌桌最多 9 個機器人，難度從簡單到困難。不用帳號、不涉及金錢，手機和電腦都能離線玩。",
    "ldHeadline": "和電腦玩 Texas Hold’em 撲克，免費又能離線",
    "ldDesc": "PokerTH 網頁版的練習模式：和電腦對手玩 Texas Hold’em，提供難度等級、打法風格和獎盃。",
    "h1": "和電腦玩撲克，免費又能離線",
    "lead": "PokerTH 的練習模式直接在你的瀏覽器裡，和電腦對手打完整的 Texas Hold’em 錦標賽。不用帳號，網站開啟過一次後不需連線，也沒有任何賭注：是學習這個遊戲、嘗試新策略，或在火車上快速玩一局的好地方。",
    "stepsH2": "三個步驟開始牌局",
    "steps": [
      [
        "開啟 PokerTH，選擇「本機 / 練習」",
        "開啟這個網站，在第一個畫面選擇「本機 / 練習」。不需要登入，也不用下載；網站開啟過一次後，這個模式在沒有連線時也能用。"
      ],
      [
        "設定你的牌桌",
        "選擇最多 9 個電腦對手、起始籌碼、盲注上漲的速度和遊戲速度，或從現成的賽制開始。在同一個視窗裡選擇機器人的難度。"
      ],
      [
        "開始牌局",
        "按下「開始」：空座位會由電腦玩家補上，然後開始發牌。牌局一直進行到有一位玩家贏得所有籌碼為止。"
      ]
    ],
    "levelsH2": "四種難度",
    "levels": [
      [
        "簡單",
        "會誤判自己手牌、很少詐唬的機器人：第一局的最佳對手。"
      ],
      [
        "普通",
        "穩健的對手，能準確判讀自己的勝率，籌碼變短時也打得正確。"
      ],
      [
        "困難",
        "最強的機器人：精準讀牌、短籌碼時打法犀利，詐唬也更多。"
      ],
      [
        "混合",
        "多樣化的牌桌，也是預設值：平均每十個機器人中有三個簡單、五個普通、兩個困難。"
      ]
    ],
    "brainH2": "機器人如何思考",
    "brainP": "每個機器人都會把剩下的牌模擬發出很多次，依照底池中還剩幾位玩家，算出自己贏下這手牌的真實機率。它在前段位置打得更緊，在後段位置偷盲，翻牌前加注後會做持續下注，拿強聽牌半詐唬，而且從普通難度起，籌碼變短時會改成 All-In 或 Fold 的打法。",
    "stylesH2": "五種打法風格",
    "stylesP": "難度決定機器人讀牌的能力；風格決定它怎麼打。每張新牌桌都會混合：",
    "styles": [
      [
        "岩石型（Rock）",
        "非常緊、非常謹慎，很少入池，也很少詐唬。"
      ],
      [
        "緊兇（TAG）",
        "挑好牌入局，並且下重注。"
      ],
      [
        "鬆兇（LAG）",
        "玩很多手牌，給你施加壓力。"
      ],
      [
        "跟注站",
        "跟注太過頻繁，很少加注。"
      ],
      [
        "瘋子（Maniac）",
        "不停加注和詐唬。"
      ]
    ],
    "formatsH2": "練習真正的賽制",
    "formatsP": "現成設定讓你開始一局「輕鬆」、「普通」或「快速」牌局，或在 pokerth.net 比賽的條件下練習：官方「排名」的節奏、We Cup，以及盲注依時間上漲的 BBC。你自己的設定也能存成專屬賽制。",
    "trophiesH2": "獎盃與統計",
    "trophiesP": "練習模式有自己的成長進度：六大類共三十多個獎盃——玩過的手牌、贏得的牌局、連勝、擊敗九個困難機器人的一場勝利、詐唬，以及幾個祕密。和機器人對戰的統計與你的線上牌局分開保存；用 pokerth.net 帳號登入時，你的獎盃會跟著你到其他裝置。",
    "learnH2": "最好的學習場所",
    "learnP": "網頁版的每一項輔助在這裡都能毫無壓力地使用：隨著發牌顯示獲勝機率的「勝率」分頁、牌力顯示、預選動作和鍵盤快速鍵。等你準備好了，pokerth.net 上同樣的牌桌正等著你和真人玩家對戰。",
    "offlineH2": "離線也能玩，所有裝置都支援",
    "offlineP": "PokerTH 是網頁應用程式：在 iPhone、Android、Windows、macOS 和 Linux 的瀏覽器裡都能執行，也能像 App 一樣加到主畫面。開啟過一次後，練習模式完全不需要連線——開著飛航模式、在捷運上，或任何沒有訊號的地方都行。",
    "faqH2": "常見問題",
    "faq": [
      [
        "可以免費和電腦玩撲克嗎？",
        "可以。PokerTH 是免費的開放原始碼軟體，沒有廣告，也沒有 App 內購。籌碼只是遊戲幣。"
      ],
      [
        "需要帳號或連線嗎？",
        "不需要。練習模式不需要帳號，網站開啟過一次後，沒有連線也能玩。"
      ],
      [
        "最多可以和幾個電腦對手玩？",
        "最多 9 個，湊成 10 人滿桌；也可以只放 1 個來單挑。"
      ],
      [
        "機器人厲害嗎？",
        "由你決定：簡單機器人會犯錯，困難機器人能精準判讀勝率、也更常詐唬，混合牌桌則把三種難度和五種打法風格混在一起。"
      ],
      [
        "可以和朋友及機器人同桌玩嗎？",
        "可以。在你自己的 PokerTH 伺服器上開桌時，不論是在區域網路（LAN）還是網際網路上，等候室都能用電腦玩家補滿空座位。"
      ]
    ]
  },
  zu: {
    "title": "Dlala i-poker ubhekene nekhompyutha — mahhala, offline | PokerTH",
    "desc": "I-Texas Hold’em yamahhala nekhompyutha: ama-bot afika ku-9 etafuleni, kusuka kokulula kuya kokunzima. Akudingi i-akhawunti noma imali, isebenza offline efonini naku-PC.",
    "ldHeadline": "Dlala i-poker ye-Texas Hold’em ubhekene nekhompyutha, mahhala futhi ungaxhunyiwe",
    "ldDesc": "Imodi yokuziqeqesha yeklayenti lewebhu le-PokerTH: i-Texas Hold’em ubhekene nabaphikisi bekhompyutha, enamazinga obunzima, izitayela zokudlala nezindondo.",
    "h1": "Dlala i-poker ubhekene nekhompyutha, mahhala futhi ungaxhunyiwe",
    "lead": "Imodi yokuziqeqesha ye-PokerTH yaba imiqhudelwano ephelele ye-Texas Hold’em ubhekene nabaphikisi bekhompyutha, khona esipheqululini sakho. Ayikho i-akhawunti, akudingeki uxhumano uma isayithi selike lavulwa, futhi akukho okusengcupheni: indawo yokufunda umdlalo, ukuzama isu elisha, noma ukudlala umdlalo osheshayo usesitimeleni.",
    "stepsH2": "Qala umdlalo ngezinyathelo ezintathu",
    "steps": [
      [
        "Vula i-PokerTH bese ukhetha Okwasendaweni / ukuziqeqesha",
        "Vula le sayithi bese ukhetha Okwasendaweni / ukuziqeqesha esikrinini sokuqala. Akukho ukungena futhi akukho ukulanda; uma isayithi selike lavulwa, imodi isebenza nangaphandle koxhumano."
      ],
      [
        "Setha itafula lakho",
        "Khetha abaphikisi bekhompyutha abafika ku-9, isitaki sokuqala, ukuthi ama-blinds akhuphuka ngokushesha kangakanani nesivinini somdlalo, noma uqale ngefomethi esilungile. Khetha ubunzima bama-bot ewindini elifanayo."
      ],
      [
        "Qala umdlalo",
        "Cindezela okuthi Qala: izihlalo ezingenalutho zigcwaliswa ngabadlali bekhompyutha futhi amakhadi ayabiwa. Umdlalo uqhubeka kuze kube umdlali oyedwa uphethe wonke ama-chip."
      ]
    ],
    "levelsH2": "Amazinga amane obunzima",
    "levels": [
      [
        "Kulula",
        "Ama-bot ahlulela kabi izandla zawo futhi angavamile ukwenza i-bluff: abaphikisi abafanele umdlalo wokuqala."
      ],
      [
        "Okujwayelekile",
        "Abaphikisi abaqinile abafunda kahle amathuba abo futhi badlale ngendlela efanele lapho isitaki sabo siba sifushane."
      ],
      [
        "Kunzima",
        "Ama-bot anamandla kakhulu: ukufunda izandla ngokunembile, ukudlala okubukhali ngesitaki esifushane nama-bluff amaningi."
      ],
      [
        "Kuxubile",
        "Itafula elihlukahlukene, okuzenzakalelayo: ngokwesilinganiso, kuma-bot ayishumi, amathathu alula, amahlanu ajwayelekile namabili anzima."
      ]
    ],
    "brainH2": "Ama-bot acabanga kanjani",
    "brainP": "I-bot ngayinye ithola ithuba layo langempela lokuwina isandla ngokwaba amakhadi asele izikhathi eziningi, ibhekene nenani labadlali abasesekhona ku-pot. Idlala ngokuqinile endaweni yokuqala futhi intshontsha isendaweni yakamuva, yenza i-continuation bet ngemuva kokwenza i-Raise ngaphambi kwe-flop, yenza i-semi-bluff ngama-draw aqinile futhi, kusukela ezingeni elijwayelekile kuya phezulu, ishintshela ekudlaleni i-all-in noma i-Fold lapho isitaki sayo sesifushane.",
    "stylesH2": "Izitayela ezinhlanu zokudlala",
    "stylesP": "Ubunzima bunquma ukuthi i-bot iwufunda kahle kangakanani umdlalo; isitayela sayo sinquma ukuthi idlala kanjani. Itafula ngalinye elisha lixuba:",
    "styles": [
      [
        "Rock",
        "iqinile kakhulu futhi iyaqaphela, ingena kuma-pot ambalwa futhi ayivamile ukwenza i-bluff."
      ],
      [
        "Tight-aggressive (TAG)",
        "ikhetha izandla ezinhle bese ibheja ngamandla ngazo."
      ],
      [
        "Loose-aggressive (LAG)",
        "idlala izandla eziningi futhi ikufake ingcindezi."
      ],
      [
        "Calling station",
        "yenza i-Call kaningi kakhulu futhi ayivamile ukwenza i-Raise."
      ],
      [
        "Maniac",
        "yenza i-Raise ne-bluff ngaso sonke isikhathi."
      ]
    ],
    "formatsH2": "Zijwayeze amafomethi angempela",
    "formatsP": "Izilungiselelo ezilungile zikuvumela ukuthi uqale umdlalo othi Kuzolile, Okujwayelekile noma Kuyashesha, noma uzijwayeze ngaphansi kwezimo zemincintiswano ye-pokerth.net: isivinini esisemthethweni se-Ranking, i-We Cup ne-BBC enama-blinds asekelwe esikhathini. Izilungiselelo zakho ungazigcina njengefomethi yakho.",
    "trophiesH2": "Izindondo nezibalo",
    "trophiesP": "Imodi yokuziqeqesha inenqubekelaphambili yayo: izindondo ezingaphezu kwamashumi amathathu ezigabeni eziyisithupha — izandla ezidlaliwe, imidlalo ewinwe, ukuwina ngokulandelana, ukunqoba ama-bot ayisishiyagalolunye anzima, ama-bluff, nezimfihlo ezimbalwa. Izibalo zama-bot zigcinwa zihlukene nemidlalo yakho ye-inthanethi, futhi uma ungena nge-akhawunti ye-pokerth.net, izindondo zakho zikulandela kwamanye amadivayisi akho.",
    "learnH2": "Indawo engcono kakhulu yokufunda",
    "learnP": "Lonke usizo lweklayenti lewebhu lusebenza lapha ngaphandle kwengcindezi: ithebhu elithi Amathuba enethuba lakho lokuwina njengoba amakhadi evezwa, ukubonisa amandla esandla, izenzo ezikhethwe kusenesikhathi nezinqamuleli zekhibhodi. Uma uzizwa ukulungele, itafula elifanayo likulindile ku-pokerth.net ubhekene nabadlali bangempela.",
    "offlineH2": "Ungaxhunyiwe, kunoma iyiphi idivayisi",
    "offlineP": "I-PokerTH iwuhlelo lokusebenza lwewebhu: isebenza esipheqululini ku-iPhone, Android, Windows, macOS naku-Linux, futhi ingengezwa esikrinini sasekhaya njengohlelo. Uma isivuliwe, imodi yokuziqeqesha ayidingi uxhumano nhlobo — kumodi yendiza, esitimeleni esingaphansi komhlaba noma noma kuphi lapho kungekho siginali.",
    "faqH2": "Imibuzo",
    "faq": [
      [
        "Ngingayidlala yini i-poker ngibhekene nekhompyutha mahhala?",
        "Yebo. I-PokerTH iyisofthiwe yamahhala nomthombo ovulekile, engenazikhangiso futhi engenakho ukuthenga ngaphakathi kohlelo. Ama-chip ayimali yokudlala kuphela."
      ],
      [
        "Ngidinga i-akhawunti noma uxhumano?",
        "Cha. Imodi yokuziqeqesha ayidingi i-akhawunti, futhi uma isayithi selike lavulwa isebenza ngaphandle koxhumano."
      ],
      [
        "Ngingadlala ngibhekene nabaphikisi bekhompyutha abangaki?",
        "Kufika ku-9, etafuleni eligcwele labadlali abayi-10, noma oyedwa kuphela ukuze nidlale nobabili kuphela."
      ],
      [
        "Ingabe ama-bot mahle?",
        "Kuncike kuwe: ama-bot alula enza amaphutha, ama-bot anzima afunda amathuba awo ngokunembile futhi enza i-bluff kakhulu, kanti itafula elixubile lihlanganisa amazinga amathathu nezitayela ezinhlanu zokudlala."
      ],
      [
        "Ngingadlala nabangani nama-bot etafuleni elilodwa?",
        "Yebo. Uma usingatha itafula kuseva yakho ye-PokerTH, ku-LAN noma ku-inthanethi, igumbi lokulinda lingagcwalisa izihlalo ezingenalutho ngabadlali bekhompyutha."
      ]
    ]
  }
};
