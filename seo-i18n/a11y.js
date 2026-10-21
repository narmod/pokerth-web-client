'use strict';
// Translations for the /accessibility page (interface size, high contrast,
// 4-colour deck, magnifier, keyboard, gamepad and TV remote, voice and
// vibration, reduced motion, what is not supported yet).
//
// English lives in proxy.js (_SEO_A11Y) and is the fallback; a language is
// advertised (hreflang, sitemap, nav link, IndexNow) the moment its entry
// lands here, never before. Same keys as _SEO_A11Y: see[5] and faq[5] are
// [title, text] pairs in the English order; {langs} is filled at render time.
module.exports = {
  af: {
    "title": "Toeganklike poker — groot teks, sleutelbord, spelbeheerder | PokerTH",
    "desc": "Gratis Texas Hold’em met groter teks, hoë kontras, vierkleur-kaartstelle, ’n tafelvergrootglas, stemaankondigings en volle spel met sleutelbord, spelbeheerder of TV.",
    "ldHeadline": "Toeganklike aanlyn poker: groot teks, hoë kontras, sleutelbord en spelbeheerder",
    "ldDesc": "Die toeganklikheidsfunksies van die PokerTH-webkliënt: koppelvlakgrootte, hoë kontras, vierkleur-kaartstelle, vergrootglas, stemaankondigings, sleutelbord, spelbeheerder en TV-afstandbeheer.",
    "h1": "Toeganklike poker: speel op jou manier",
    "lead": "PokerTH is gratis Texas Hold’em in die blaaier, en dit pas aan by hoe jy sien en speel: groter teks en knoppies, sterker kontras, kaartstelle wat die kaartsoorte met kleur van mekaar onderskei, ’n vergrootglas vir klein skerms, stemaankondigings, en volle beheer met ’n sleutelbord, ’n spelbeheerder of ’n TV-afstandbeheer.",
    "findH2": "Waar om dit te vind",
    "findP": "Die Toeganklikheid-knoppie — die persoon-ikoon bo-aan elke skerm, van die aanmeldskerm tot by die tafel — maak die hoofinstellings enige tyd oop, selfs midde-in ’n hand. Alles anders is in Gevorderde opsies. Jou keuses word op die toestel onthou en volg jou, wanneer jy met ’n pokerth.net-rekening aanmeld, na jou ander toestelle.",
    "seeH2": "Die tafel sien",
    "see": [
      [
        "Koppelvlakgrootte",
        "Standaard, Groot of Ekstra groot: teks, kaarte, fiches en knoppies word saam groter, op die aanmeldskerm, in die voorportaal en by die tafel, en die uitleg pas aan om op ’n foon bruikbaar te bly."
      ],
      [
        "Hoë kontras",
        "’n Palet met sterker kontras oor die hele koppelvlak, van die kieslyste tot by die tafel, by elke koppelvlakgrootte."
      ],
      [
        "Vierkleur-kaartstelle",
        "Kaartstelle wat elke kaartsoort sy eie kleur gee, sodat harte en ruitens, of skoppens en klawers, nooit net aan hul vorm uitgeken hoef te word nie. Kies een in Gevorderde opsies → Styl."
      ],
      [
        "Tafelvergrootglas",
        "Op ’n foon zoem die tafel in tot twee keer sy grootte en skuif jy dit met jou vinger rond; die aansig keer na jou sitplek terug wanneer dit jou beurt is. Blaaierzoem met knyp kan ook toegelaat word."
      ],
      [
        "Lig, donker of outomaties",
        "Die hele kliënt volg jou keuse of dié van jou stelsel, met temas, kaartstelle en tafelkleure wat by jou oë pas."
      ]
    ],
    "keysH2": "Sleutelbord",
    "keysP": "Elke aksie het ’n sleutel. Die amptelike PokerTH-funksiesleutels werk by die tafel — F1 tot F4 vir Fold, Check/Call, Bet/Raise en All-In, F5 om jou kaarte te wys, F6 tot F8 vir die speelmodusse — en die webkliënt voeg enkelletters by (F, C, R, A, en 1, 2, 3 vir ’n derde van die pot, die helfte van die pot of die pot), wat almal herbind kan word. Esc maak die boonste venster toe, Tab en die pyltjiesleutels beweeg deur die voorportaal se tafellys, en Alt+S maak die instellings van oral af oop.",
    "padH2": "Spelbeheerder en TV-afstandbeheer",
    "padP": "’n Spelbeheerder — Xbox, PlayStation, Switch Pro en die meeste Bluetooth-beheerders — speel die hele spel: knoppies vir elke aksie, snellers om die inset te stel, en ’n navigasiemodus om deur die skerms, die klets en die kieslyste te beweeg. Dit vibreer wanneer dit jou beurt is. Op Android TV en Google TV werk die afstandbeheer op dieselfde manier, en afstandbeheerders met die vier kleursleutels gebruik dit vir Fold, Check/Call, Bet/Raise en All-In.",
    "hearH2": "Die spel hoor en voel",
    "hearP": "Stemaankondigings lees die spelgebeure hardop met jou toestel se eie stemme, in jou taal waar die stelsel een het. Op Android-fone merk ’n kort vibrasie jou beurt. Spelklanke kom in vier groepe — aksies, klets, netwerkkennisgewings en blindeverhogings — wat elk afsonderlik aan- of afgeskakel kan word, met een volumeskuif.",
    "calmH2": "Minder verrassings",
    "calmP": "Wanneer jou stelsel om minder beweging vra, demp die kliënt sy animasies. Die loerbeskerming hou jou eie kaarte toe totdat jy daarop tik, en die toevallige-Call-wag sluit die Call-knoppie kortliks net ná ’n groot verhoging, sodat ’n tik wat vir ’n kleiner Call bedoel is nie per ongeluk die verhoogde bedrag kan betaal nie.",
    "langH2": "In jou taal, met ’n gids",
    "langP": "Die koppelvlak is in {langs} tale beskikbaar, van regs na links waar nodig. Die Aas se Hulp, die webkliënt se gelukbringer, verduidelik elke skerm terwyl jy aangaan as jy dit wil hê, en “Wat is dit?” sê vir jou wat enigiets op die skerm doen.",
    "faqH2": "Vrae",
    "faq": [
      [
        "Kan ek die kaarte en teks groter maak?",
        "Ja. Kies Groot of Ekstra groot in die Toeganklikheid-venster; kaarte, teks en knoppies word saam groter op elke skerm, ook by die tafel."
      ],
      [
        "Is daar ’n hoëkontrasmodus?",
        "Ja, in die Toeganklikheid-venster. Dit werk by elke koppelvlakgrootte."
      ],
      [
        "Kan ek sonder ’n muis of raakskerm speel?",
        "Ja, heeltemal met die sleutelbord, met ’n spelbeheerder of met ’n Android TV-afstandbeheer."
      ],
      [
        "Werk dit met ’n skermleser?",
        "Nog nie heeltemal nie. Stemaankondigings lees die spelgebeure hardop en die kieslyste het etikette, maar die pokertafel self is ’n visuele koppelvlak en kan nog nie met net ’n skermleser gespeel word nie."
      ],
      [
        "Is dit gratis?",
        "Ja. PokerTH is gratis oopbronsagteware, sonder advertensies en sonder aankope in die toep; alle fiches is speelgeld."
      ]
    ]
  },
  am: {
    "title": "ተደራሽ ፖከር — ትልቅ ጽሑፍ፣ ቁልፍ ሰሌዳ፣ የጨዋታ መቆጣጠሪያ | PokerTH",
    "desc": "ነጻ Texas Hold’em፦ ትልቅ ጽሑፍ፣ ከፍተኛ ንፅፅር፣ ባለ አራት ቀለም የካርታ ስብስቦች፣ የጠረጴዛ ማጉያ፣ የድምጽ ማስታወቂያዎች፣ እና ሙሉ ጨዋታ በቁልፍ ሰሌዳ፣ በጨዋታ መቆጣጠሪያ እና በቲቪ ሪሞት።",
    "ldHeadline": "ተደራሽ የመስመር ላይ ፖከር፦ ትልቅ ጽሑፍ፣ ከፍተኛ ንፅፅር፣ የቁልፍ ሰሌዳ እና የጨዋታ መቆጣጠሪያ",
    "ldDesc": "የ PokerTH ዌብ ደንበኛ የተደራሽነት ባህሪያት፦ የበይነገጽ መጠን፣ ከፍተኛ ንፅፅር፣ ባለ አራት ቀለም የካርታ ስብስቦች፣ ማጉያ፣ የድምጽ ማስታወቂያዎች፣ የቁልፍ ሰሌዳ፣ የጨዋታ መቆጣጠሪያ እና የቲቪ ሪሞት።",
    "h1": "ተደራሽ ፖከር፦ በራስዎ መንገድ ይጫወቱ",
    "lead": "PokerTH በአሳሽዎ ውስጥ የሚጫወቱት ነጻ Texas Hold’em ነው፣ እና እርስዎ በሚያዩበትና በሚጫወቱበት መንገድ ራሱን ያስተካክላል፦ ትልቅ ጽሑፍና አዝራሮች፣ ጠንካራ ንፅፅር፣ የካርታ ዓይነቶችን በቀለም የሚለዩ የካርታ ስብስቦች፣ ለትንንሽ ማያዎች ማጉያ፣ የድምጽ ማስታወቂያዎች፣ እና በቁልፍ ሰሌዳ፣ በጨዋታ መቆጣጠሪያ ወይም በቲቪ ሪሞት ሙሉ ቁጥጥር።",
    "findH2": "የት ያገኙታል",
    "findP": "“ተደራሽነት” የሚለው አዝራር — ከመግቢያ ማያ ገጹ እስከ ጠረጴዛው ድረስ በእያንዳንዱ ማያ አናት ላይ ያለው የሰው ምልክት — ዋናዎቹን ቅንብሮች በማንኛውም ጊዜ ይከፍታል፣ በእጅ ጨዋታ መካከልም ቢሆን። የተቀረው ሁሉ በላቁ አማራጮች ውስጥ ነው። ምርጫዎችዎ በመሣሪያው ላይ ይታወሳሉ፣ እና በ pokerth.net መለያ ሲገቡ ወደ ሌሎች መሣሪያዎችዎም ይከተሉዎታል።",
    "seeH2": "ጠረጴዛውን በግልጽ ማየት",
    "see": [
      [
        "የበይነገጽ መጠን",
        "መደበኛ፣ ትልቅ ወይም በጣም ትልቅ፦ ጽሑፍ፣ ካርታዎች፣ ቺፖች እና አዝራሮች በመግቢያ ማያ ገጹ፣ በሎቢው እና በጠረጴዛው ላይ አብረው ያድጋሉ፣ አቀማመጡም በስልክ ላይ ምቹ ሆኖ እንዲቀጥል ራሱን ያስተካክላል።"
      ],
      [
        "ከፍተኛ ንፅፅር",
        "ከምናሌዎቹ እስከ ጠረጴዛው ድረስ በመላው በይነገጽ ላይ ጠንካራ ንፅፅር ያለው ቤተ-ቀለም፣ በሁሉም የበይነገጽ መጠኖች።"
      ],
      [
        "ባለ አራት ቀለም የካርታ ስብስቦች",
        "ለእያንዳንዱ የካርታ ዓይነት የራሱን ቀለም የሚሰጡ የካርታ ስብስቦች፤ ስለዚህ ሁለቱ ቀይ ዓይነቶች (ልብ እና አልማዝ) ወይም ሁለቱ ጥቁር ዓይነቶች በቅርጽ ብቻ ፈጽሞ አይለዩም። በላቁ አማራጮች → ዘይቤ ውስጥ አንዱን ይምረጡ።"
      ],
      [
        "የጠረጴዛ ማጉያ",
        "በስልክ ላይ ጠረጴዛው እጥፍ መጠን ይጎላል እና በጣት ይንቀሳቀሳል፤ ተራዎ ሲደርስ እይታው ወደ መቀመጫዎ ይመለሳል። የአሳሹን ቆንጥጦ-ማጉላትም መፍቀድ ይቻላል።"
      ],
      [
        "ብርሃን፣ ጨለማ ወይም ራስ-ሰር",
        "ሙሉው ደንበኛ የእርስዎን ምርጫ ወይም የስርዓትዎን ምርጫ ይከተላል፣ ለዓይንዎ በሚስማሙ ገጽታዎች፣ የካርታ ስብስቦች እና የጠረጴዛ ቀለሞች።"
      ]
    ],
    "keysH2": "የቁልፍ ሰሌዳ",
    "keysP": "እያንዳንዱ እርምጃ የራሱ ቁልፍ አለው። ኦፊሴላዊው የ PokerTH ተግባር ቁልፎች በጠረጴዛው ላይ ይሠራሉ — F1 እስከ F4 ለ Fold፣ Check/Call፣ Bet/Raise እና All-In፣ F5 ካርታዎችዎን ለማሳየት፣ F6 እስከ F8 ለጨዋታ ሁነታዎቹ — የዌብ ደንበኛውም ነጠላ ፊደሎችን ያክላል (F፣ C፣ R፣ A፣ እንዲሁም 1፣ 2፣ 3 ለፖቱ አንድ ሦስተኛ፣ ለግማሽ ፖት ወይም ለሙሉ ፖት)፤ ሁሉም እንደገና ሊታሰሩ ይችላሉ። Escape ከላይ ያለውን መስኮት ይዘጋል፣ Tab እና የቀስት ቁልፎች በሎቢው የጠረጴዛ ዝርዝር ውስጥ ያንቀሳቅሳሉ፣ Alt+S ደግሞ ቅንብሮቹን ከየትኛውም ቦታ ይከፍታል።",
    "padH2": "የጨዋታ መቆጣጠሪያ እና የቲቪ ሪሞት",
    "padP": "የጨዋታ መቆጣጠሪያ — Xbox፣ PlayStation፣ Switch Pro እና አብዛኛዎቹ የ Bluetooth መቆጣጠሪያዎች — ሙሉውን ጨዋታ ይጫወታል፦ ለእያንዳንዱ እርምጃ አዝራሮች፣ ውርርዱን ለማስተካከል ትሪገሮች፣ እና በማያዎቹ፣ በውይይቱ እና በምናሌዎቹ ውስጥ ለመንቀሳቀስ የአሰሳ ሁነታ። ተራዎ ሲደርስ ይንዘረዘራል። በ Android TV እና በ Google TV ላይ ሪሞቱ በተመሳሳይ መንገድ ይሠራል፣ አራቱ የቀለም ቁልፎች ያሏቸው ሪሞቶችም ለ Fold፣ Check/Call፣ Bet/Raise እና All-In ይጠቀሙባቸዋል።",
    "hearH2": "ጨዋታውን መስማትና መሰማት",
    "hearP": "የድምጽ ማስታወቂያዎች የጨዋታ ክስተቶችን በመሣሪያዎ የራሱ ድምጾች ጮክ ብለው ያነባሉ፣ ስርዓቱ ቋንቋዎን የሚደግፍ ከሆነ በቋንቋዎ። በ Android ስልኮች ላይ አጭር ንዝረት ተራዎን ያመለክታል። የጨዋታ ድምጾች በአራት ቡድኖች ይመጣሉ — እርምጃዎች፣ ውይይት፣ የአውታረ መረብ ማሳወቂያዎች እና የብላይንድ ጭማሪዎች — እያንዳንዳቸው በተናጠል ሊበሩ ወይም ሊጠፉ ይችላሉ፣ በአንድ የድምጽ መጠን ተንሸራታች።",
    "calmH2": "ያነሱ ድንገተኛ ነገሮች",
    "calmP": "ስርዓትዎ የተቀነሰ እንቅስቃሴ ሲጠይቅ ደንበኛው አኒሜሽኖቹን ያለዝባል። ጸረ-ማየት እስኪነኩ ድረስ የራስዎን ካርታዎች ተደብቀው ያቆያል፣ የአጋጣሚ-Call ጥበቃም ከትልቅ raise በኋላ ወዲያውኑ የ Call አዝራሩን ለአጭር ጊዜ ያግዳል፣ ለትንሽ call የታሰበ ንክኪ በስህተት የጨመረውን መጠን እንዳይከፍል።",
    "langH2": "በቋንቋዎ፣ ከመሪ ጋር",
    "langP": "በይነገጹ በ {langs} ቋንቋዎች ይገኛል፣ በሚያስፈልግበት ቦታ ከቀኝ ወደ ግራ። የኤሱ እገዛ — ኤሱ የዌብ ደንበኛው ተንቀሳቃሽ ምልክት ነው — ከፈለጉ እያንዳንዱን ማያ እየሄዱ ያብራራል፣ “ይህ ምንድን ነው?” ደግሞ በማያው ላይ ያለ ማንኛውም ነገር ምን እንደሚያደርግ ይነግርዎታል።",
    "faqH2": "ጥያቄዎች",
    "faq": [
      [
        "ካርታዎቹን እና ጽሑፉን ማሳደግ እችላለሁ?",
        "አዎ። በ“ተደራሽነት” መስኮት ውስጥ ትልቅ ወይም በጣም ትልቅ ይምረጡ፤ ካርታዎች፣ ጽሑፍ እና አዝራሮች ጠረጴዛውን ጨምሮ በሁሉም ማያ ላይ አብረው ያድጋሉ።"
      ],
      [
        "ከፍተኛ ንፅፅር ሁነታ አለ?",
        "አዎ፣ በ“ተደራሽነት” መስኮት ውስጥ። ከሁሉም የበይነገጽ መጠኖች ጋር ይሠራል።"
      ],
      [
        "ያለ መዳፊት ወይም ያለ ንክኪ ማያ መጫወት እችላለሁ?",
        "አዎ፣ ሙሉ በሙሉ በቁልፍ ሰሌዳ፣ በጨዋታ መቆጣጠሪያ ወይም በ Android TV ሪሞት።"
      ],
      [
        "ከማያ ገጽ አንባቢ ጋር ይሠራል?",
        "ገና ሙሉ በሙሉ አይደለም። የድምጽ ማስታወቂያዎች የጨዋታ ክስተቶችን ጮክ ብለው ያነባሉ፣ ምናሌዎቹም መለያዎች አሏቸው፣ ነገር ግን የፖከር ጠረጴዛው ራሱ የእይታ በይነገጽ ነው፣ እና ገና በማያ ገጽ አንባቢ ብቻ ሊጫወት አይችልም።"
      ],
      [
        "ነጻ ነው?",
        "አዎ። PokerTH ነጻ እና ክፍት ምንጭ ሶፍትዌር ነው፣ ማስታወቂያም ሆነ በመተግበሪያ ውስጥ ግዢ የለውም፤ ሁሉም ቺፖች የጨዋታ ገንዘብ ብቻ ናቸው።"
      ]
    ]
  },
  ar: {
    "title": "بوكر سهل الوصول — نص كبير ولوحة مفاتيح ويد تحكم | PokerTH",
    "desc": "Texas Hold’em مجانًا بنص أكبر وتباين عالٍ وأوراق بأربعة ألوان ومكبّر للطاولة وإعلانات صوتية، ولعب كامل بلوحة المفاتيح ويد التحكم وجهاز تحكم التلفاز.",
    "ldHeadline": "بوكر عبر الإنترنت سهل الوصول: نص كبير وتباين عالٍ ولوحة مفاتيح ويد تحكم",
    "ldDesc": "ميزات إمكانية الوصول في عميل PokerTH على الويب: حجم الواجهة، والتباين العالي، والأوراق بأربعة ألوان، والمكبّر، والإعلانات الصوتية، ولوحة المفاتيح، ويد التحكم، وجهاز التحكم عن بُعد للتلفاز.",
    "h1": "بوكر سهل الوصول: العب على طريقتك",
    "lead": "PokerTH هو Texas Hold’em مجاني في المتصفح، يتكيّف مع طريقتك في الرؤية واللعب: نص وأزرار أكبر، وتباين أقوى، وأوراق تميّز بين الأنواع بالألوان، ومكبّر للشاشات الصغيرة، وإعلانات صوتية، وتحكّم كامل بلوحة المفاتيح أو يد التحكم أو جهاز التحكم عن بُعد للتلفاز.",
    "findH2": "أين تجدها",
    "findP": "زر إمكانية الوصول — أيقونة الشخص في أعلى كل شاشة، من شاشة الدخول إلى الطاولة — يفتح الإعدادات الرئيسية في أي وقت، حتى في منتصف اليد. وكل ما عدا ذلك موجود في الخيارات المتقدمة. تُحفظ اختياراتك على الجهاز، وعندما تسجّل الدخول بحساب pokerth.net تتبعك إلى أجهزتك الأخرى.",
    "seeH2": "رؤية الطاولة",
    "see": [
      [
        "حجم الواجهة",
        "قياسي أو كبير أو كبير جدًا: يكبر النص والأوراق والرقائق والأزرار معًا، في شاشة الدخول وفي الردهة وعلى الطاولة، ويُعاد ترتيب العرض ليبقى سهل الاستخدام على الهاتف."
      ],
      [
        "تباين عالٍ",
        "لوحة ألوان أقوى تباينًا في الواجهة كلها، من القوائم إلى الطاولة، وبكل أحجام الواجهة."
      ],
      [
        "أوراق بأربعة ألوان",
        "مجموعات أوراق تمنح كل نوع لونه الخاص، فلا يُفرَّق أبدًا بين الكبة ♥ والديناري ♦، أو بين البستوني ♠ والسباتي ♣، بالشكل وحده. اختر واحدة من الخيارات المتقدمة ← المظهر."
      ],
      [
        "مكبّر الطاولة",
        "على الهاتف، تُكبَّر الطاولة إلى ضعف حجمها وتُحرَّك بالإصبع، ويعود العرض إلى مقعدك عندما يحين دورك. ويمكن أيضًا السماح بتكبير المتصفح بإصبعين."
      ],
      [
        "فاتح أو داكن أو تلقائي",
        "يتبع العميل كله اختيارك أو اختيار نظامك، مع سمات وأوراق وألوان طاولة تريح عينيك."
      ]
    ],
    "keysH2": "لوحة المفاتيح",
    "keysP": "لكل حركة مفتاح. تعمل مفاتيح PokerTH الوظيفية الرسمية على الطاولة — من F1 إلى F4 لـ Fold وCheck/Call وBet/Raise وAll-In، وF5 لإظهار أوراقك، ومن F6 إلى F8 لأوضاع اللعب — ويضيف عميل الويب أحرفًا مفردة (F وC وR وA، و1 و2 و3 لثلث القدر أو نصفه أو القدر كاملًا)، ويمكن إعادة تعيينها كلها. يغلق Escape النافذة العليا، ويتنقّل Tab والأسهم في قائمة طاولات الردهة، ويفتح Alt+S الإعدادات من أي مكان.",
    "padH2": "يد التحكم وجهاز التحكم عن بُعد للتلفاز",
    "padP": "يد تحكم الألعاب — Xbox وPlayStation وSwitch Pro ومعظم أيادي التحكم بتقنية Bluetooth — تكفي للعبة كلها: أزرار لكل حركة، وزنادات لضبط الرهان، ووضع تنقّل للتحرّك بين الشاشات والدردشة والقوائم. وتهتز عندما يحين دورك. على Android TV وGoogle TV يعمل جهاز التحكم عن بُعد بالطريقة نفسها، وأجهزة التحكم التي تحمل المفاتيح الملونة الأربعة تستخدمها لـ Fold وCheck/Call وBet/Raise وAll-In.",
    "hearH2": "سماع اللعبة والإحساس بها",
    "hearP": "تقرأ الإعلانات الصوتية أحداث اللعبة بصوت عالٍ بأصوات جهازك نفسه، وبلغتك إن كان النظام يوفّرها. على هواتف Android يعلن اهتزاز قصير عن دورك. وتأتي أصوات اللعبة في أربع مجموعات — الحركات، والدردشة، وتنبيهات الشبكة، وارتفاع الرهانات العمياء — يمكن تفعيل كل منها أو إيقافه على حدة، مع شريط واحد لمستوى الصوت.",
    "calmH2": "مفاجآت أقل",
    "calmP": "عندما يطلب نظامك تقليل الحركة، يخفّف العميل رسومه المتحركة. ويبقي منع التلصص أوراقك مخفية حتى تنقر عليها، ويحجب حارس المتابعة العرضية زر Call لحظات بعد رفع كبير، حتى لا تدفع نقرةٌ موجّهة لمتابعة أصغر المبلغَ المرفوع بالخطأ.",
    "langH2": "بلغتك، ومعك مرشد",
    "langP": "الواجهة متاحة بـ{langs} لغة، ومن اليمين إلى اليسار حيث يلزم. مساعدة الآص، تميمة عميل الويب، تشرح لك كل شاشة أثناء تنقّلك إن أردت ذلك، و«ما هذا؟» يخبرك بما يفعله أي عنصر على الشاشة.",
    "faqH2": "أسئلة",
    "faq": [
      [
        "هل يمكنني تكبير الأوراق والنص؟",
        "نعم. اختر كبير أو كبير جدًا في نافذة إمكانية الوصول؛ تكبر الأوراق والنص والأزرار معًا في كل الشاشات، ومنها الطاولة."
      ],
      [
        "هل يوجد وضع تباين عالٍ؟",
        "نعم، في نافذة إمكانية الوصول. ويعمل مع كل أحجام الواجهة."
      ],
      [
        "هل يمكنني اللعب دون فأرة أو شاشة لمس؟",
        "نعم، بالكامل بلوحة المفاتيح، أو بيد التحكم، أو بجهاز التحكم عن بُعد لـ Android TV."
      ],
      [
        "هل يعمل مع قارئ الشاشة؟",
        "ليس بالكامل بعد. تقرأ الإعلانات الصوتية أحداث اللعبة بصوت عالٍ وتحمل القوائم تسميات، لكن طاولة البوكر نفسها واجهة مرئية ولا يمكن بعدُ لعبها بقارئ الشاشة وحده."
      ],
      [
        "هل هو مجاني؟",
        "نعم. PokerTH برنامج مجاني ومفتوح المصدر، بلا إعلانات وبلا مشتريات داخل التطبيق؛ وكل الرقائق للعب فقط."
      ]
    ]
  },
  az: {
    "title": "Əlçatan poker — böyük mətn, klaviatura, geympad | PokerTH",
    "desc": "Böyük mətn, yüksək kontrast, 4 rəngli dəstələr, masa böyüdücüsü, səsli elanlar və tam klaviatura, oyun pultu və TV pultu idarəsi ilə pulsuz Texas Hold’em.",
    "ldHeadline": "Əlçatan onlayn poker: böyük mətn, yüksək kontrast, klaviatura və oyun pultu",
    "ldDesc": "PokerTH veb-klientinin əlçatanlıq imkanları: interfeys ölçüsü, yüksək kontrast, 4 rəngli dəstələr, böyüdücü, səsli elanlar, klaviatura, oyun pultu və televizor pultu.",
    "h1": "Əlçatan poker: öz üsulunuzla oynayın",
    "lead": "PokerTH brauzerdə pulsuz Texas Hold’em-dir və sizin görmə və oynama tərzinizə uyğunlaşır: daha böyük mətn və düymələr, daha güclü kontrast, kart növlərini rənglə fərqləndirən dəstələr, kiçik ekranlar üçün böyüdücü, səsli elanlar, həmçinin klaviatura, oyun pultu və ya televizor pultu ilə tam idarəetmə.",
    "findH2": "Harada tapmaq olar",
    "findP": "Əlçatanlıq düyməsi — giriş ekranından masaya qədər hər ekranın yuxarısındakı insan simgəsi — əsas parametrləri istənilən vaxt, hətta əlin ortasında da açır. Qalan hər şey Əlavə seçimlərdədir. Seçimləriniz cihazda yadda saxlanılır və pokerth.net hesabı ilə daxil olduqda digər cihazlarınıza da keçir.",
    "seeH2": "Masanı görmək",
    "see": [
      [
        "İnterfeys ölçüsü",
        "Standart, Böyük və ya Çox böyük: mətn, kartlar, fişkalar və düymələr birlikdə böyüyür — giriş ekranında, lobbidə və masada — düzülüş isə telefonda da rahat qalmaq üçün yenidən qurulur."
      ],
      [
        "Yüksək kontrast",
        "Menyulardan masaya qədər bütün interfeysdə daha güclü kontrastlı palitra, istənilən interfeys ölçüsündə."
      ],
      [
        "4 rəngli dəstələr",
        "Hər kart növünə öz rəngini verən dəstələr: beləliklə ♥ ilə ♦, yaxud ♠ ilə ♣ heç vaxt yalnız formasına görə ayırd edilmir. Birini Əlavə seçimlər → Üslub bölməsində seçin."
      ],
      [
        "Masa böyüdücüsü",
        "Telefonda masa iki dəfə böyüyür və barmaqla sürüşdürülür; növbəniz gələndə görünüş öz yerinizə qayıdır. Brauzerin iki barmaqla yaxınlaşdırmasına da icazə vermək olar."
      ],
      [
        "Açıq, tünd və ya avtomatik",
        "Bütün klient sizin və ya sisteminizin seçiminə uyğunlaşır; gözlərinizə uyğun temalar, dəstələr və masa rəngləri ilə."
      ]
    ],
    "keysH2": "Klaviatura",
    "keysP": "Hər hərəkətin öz düyməsi var. Rəsmi PokerTH funksiya düymələri masada işləyir — F1–F4 Fold, Check/Call, Bet/Raise və All-In üçün, F5 kartlarınızı göstərmək üçün, F6–F8 oyun rejimləri üçün — veb-klient isə tək hərflər əlavə edir (F, C, R, A, həmçinin bankın üçdə biri, yarısı və ya tam bank üçün 1, 2, 3); onların hamısını yenidən təyin etmək olar. Escape ən üstdəki pəncərəni bağlayır, Tab və ox düymələri lobbinin masa siyahısında hərəkət edir, Alt+S isə parametrləri istənilən yerdən açır.",
    "padH2": "Oyun pultu və televizor pultu",
    "padP": "Oyun pultu — Xbox, PlayStation, Switch Pro və əksər Bluetooth pultları — bütün oyunu idarə edir: hər hərəkət üçün düymələr, mərci təyin etmək üçün tətiklər və ekranlar, çat və menyular arasında hərəkət etmək üçün naviqasiya rejimi. Növbəniz gələndə o titrəyir. Android TV və Google TV-də televizor pultu eyni şəkildə işləyir, dörd rəngli düyməsi olan pultlar isə onları Fold, Check/Call, Bet/Raise və All-In üçün istifadə edir.",
    "hearH2": "Oyunu eşitmək və hiss etmək",
    "hearP": "Səsli elanlar oyun hadisələrini cihazınızın öz səsləri ilə, sistemdə varsa öz dilinizdə ucadan oxuyur. Android telefonlarda qısa vibrasiya növbənizi bildirir. Oyun səsləri dörd qrupa bölünür — hərəkətlər, çat, şəbəkə bildirişləri və blaind artımları — onları ayrı-ayrılıqda aça və ya söndürə bilərsiniz, hamısı üçün tək səs sürüşdürücüsü var.",
    "calmH2": "Daha az sürpriz",
    "calmP": "Sisteminiz azaldılmış hərəkət istədikdə klient animasiyalarını yumşaldır. Anti-peek öz kartlarınızı onlara toxunana qədər gizli saxlayır, təsadüfi call qoruması isə böyük raise-dən dərhal sonra Call düyməsini qısa müddətə bloklayır ki, daha kiçik call üçün nəzərdə tutulmuş toxunuş səhvən artırılmış məbləği ödəməsin.",
    "langH2": "Öz dilinizdə, bələdçi ilə",
    "langP": "İnterfeys {langs} dildə mövcuddur, lazım olan yerdə sağdan sola. Tuzun köməyi ilə veb-klientin maskotu Tuz, istəsəniz, hər ekranı siz irəlilədikcə izah edir, “Bu nədir?” isə ekrandakı istənilən şeyin nə etdiyini deyir.",
    "faqH2": "Suallar",
    "faq": [
      [
        "Kartları və mətni böyüdə bilərəmmi?",
        "Bəli. Əlçatanlıq pəncərəsində Böyük və ya Çox böyük seçin; kartlar, mətn və düymələr masa da daxil olmaqla hər ekranda birlikdə böyüyür."
      ],
      [
        "Yüksək kontrast rejimi varmı?",
        "Bəli, Əlçatanlıq pəncərəsində. O, istənilən interfeys ölçüsü ilə işləyir."
      ],
      [
        "Siçan və ya sensor ekran olmadan oynaya bilərəmmi?",
        "Bəli, tamamilə klaviatura, oyun pultu və ya Android TV pultu ilə."
      ],
      [
        "Ekran oxuyucusu ilə işləyirmi?",
        "Hələ tam yox. Səsli elanlar oyun hadisələrini ucadan oxuyur və menyuların etiketləri var, lakin poker masasının özü vizual interfeysdir və hələ yalnız ekran oxuyucusu ilə oynanıla bilməz."
      ],
      [
        "Pulsuzdurmu?",
        "Bəli. PokerTH reklamsız və tətbiqdaxili alışlarsız pulsuz və açıq mənbəli proqramdır; bütün fişkalar oyun pullarıdır."
      ]
    ]
  },
  be: {
    "title": "Даступны покер — буйны шрыфт, клавіятура, геймпад | PokerTH",
    "desc": "Бясплатны Texas Hold’em з большым тэкстам, высокім кантрастам, 4-колернымі калодамі, лупай, галасавымі аб'явамі і поўным кіраваннем з клавіятуры, геймпада і пульта ТБ.",
    "ldHeadline": "Даступны анлайн-покер: буйны тэкст, высокі кантраст, клавіятура і геймпад",
    "ldDesc": "Функцыі даступнасці вэб-кліента PokerTH: памер інтэрфейсу, высокі кантраст, 4-колерныя калоды, лупа, галасавыя аб'явы, клавіятура, геймпад і пульт ТБ.",
    "h1": "Даступны покер: гуляйце па-свойму",
    "lead": "PokerTH — гэта бясплатны Texas Hold’em у браўзеры, і ён падладжваецца пад тое, як вы бачыце і гуляеце: большы тэкст і кнопкі, мацнейшы кантраст, калоды, у якіх масці адрозніваюцца колерам, лупа для малых экранаў, галасавыя аб'явы і поўнае кіраванне з клавіятуры, геймпада або пульта ТБ.",
    "findH2": "Дзе гэта знайсці",
    "findP": "Кнопка «Даступнасць» — значок чалавечка ўверсе кожнага экрана, ад экрана ўваходу да стала, — у любы момант адкрывае асноўныя налады, нават пасярод раздачы. Усё астатняе — у Дадатковых параметрах. Ваш выбар захоўваецца на прыладзе, а калі вы ўваходзіце з уліковым запісам pokerth.net, ён пераходзіць разам з вамі на іншыя вашы прылады.",
    "seeH2": "Добра бачыць стол",
    "see": [
      [
        "Памер інтэрфейсу",
        "Стандартны, Вялікі або Вельмі вялікі: тэкст, карты, фішкі і кнопкі павялічваюцца разам — на экране ўваходу, у лобі і за сталом, — а макет перабудоўваецца, каб заставацца зручным на тэлефоне."
      ],
      [
        "Высокі кантраст",
        "Больш кантрасная палітра для ўсяго інтэрфейсу, ад меню да стала, пры любым памеры інтэрфейсу."
      ],
      [
        "4-колерныя калоды",
        "Калоды карт, у якіх кожная масць мае свой колер, так што чырвы і бубны, ці пікі і трэфы, ніколі не даводзіцца адрозніваць толькі па форме. Выберыце адну ў Дадатковыя параметры → Стыль."
      ],
      [
        "Лупа для стала",
        "На тэлефоне стол павялічваецца ўдвая і перасоўваецца пальцам; калі надыходзіць ваш ход, выгляд вяртаецца да вашага месца. Можна таксама дазволіць маштабаванне браўзера шчыпком."
      ],
      [
        "Светлы, цёмны або аўтаматычна",
        "Увесь кліент выконвае ваш выбар або выбар вашай сістэмы, з тэмамі, калодамі і колерамі стала, зручнымі для вашых вачэй."
      ]
    ],
    "keysH2": "Клавіятура",
    "keysP": "Для кожнага дзеяння ёсць клавіша. За сталом працуюць афіцыйныя функцыянальныя клавішы PokerTH — ад F1 да F4 для Fold, Check/Call, Bet/Raise і All-In, F5, каб паказаць свае карты, ад F6 да F8 для рэжымаў гульні, — а вэб-кліент дадае асобныя літары (F, C, R, A, а таксама 1, 2, 3 для трэці банка, паловы банка або ўсяго банка), і ўсе іх можна перапрызначыць. Escape закрывае верхняе акно, Tab і клавішы са стрэлкамі перамяшчаюць па спісе сталоў у лобі, а Alt+S адкрывае налады з любога месца.",
    "padH2": "Геймпад і пульт ТБ",
    "padP": "З геймпадам — Xbox, PlayStation, Switch Pro і большасцю Bluetooth-геймпадаў — можна гуляць ад пачатку да канца: кнопкі для кожнага дзеяння, трыгеры, каб задаць стаўку, і рэжым навігацыі, каб перамяшчацца па экранах, чаце і меню. Калі надыходзіць ваш ход, ён вібруе. На Android TV і Google TV пульт працуе гэтак жа, а пульты з чатырма каляровымі клавішамі выкарыстоўваюць іх для Fold, Check/Call, Bet/Raise і All-In.",
    "hearH2": "Чуць і адчуваць гульню",
    "hearP": "Галасавыя аб'явы зачытваюць гульнявыя падзеі ўласнымі галасамі вашай прылады, на вашай мове, калі ў сістэме ёсць такі голас. На тэлефонах з Android кароткая вібрацыя пазначае ваш ход. Гукі гульні падзелены на чатыры групы — дзеянні, чат, сеткавыя апавяшчэнні і павышэнне блайндаў, — якія можна ўключаць і выключаць асобна, з адным паўзунком гучнасці.",
    "calmH2": "Менш нечаканасцей",
    "calmP": "Калі ваша сістэма просіць паменшыць рух, кліент змякчае свае анімацыі. Anti-peek трымае вашы карты закрытымі, пакуль вы да іх не дакранецеся, а абарона ад выпадковага call ненадоўга блакуе кнопку Call адразу пасля вялікага raise, каб дотык, прызначаны для меншага call, не мог памылкова заплаціць павышаную суму.",
    "langH2": "На вашай мове, з гідам",
    "langP": "Інтэрфейс даступны на {langs} мовах, дзе трэба — справа налева. Дапамога туза — туз, талісман вэб-кліента, — калі хочаце, тлумачыць кожны экран па ходзе справы, а «Што гэта?» падкажа, што робіць любы элемент на экране.",
    "faqH2": "Пытанні",
    "faq": [
      [
        "Ці можна павялічыць карты і тэкст?",
        "Так. Выберыце Вялікі або Вельмі вялікі ў акне «Даступнасць»; карты, тэкст і кнопкі павялічваюцца разам на кожным экране, у тым ліку за сталом."
      ],
      [
        "Ці ёсць рэжым высокага кантрасту?",
        "Так, у акне «Даступнасць». Ён працуе з любым памерам інтэрфейсу."
      ],
      [
        "Ці можна гуляць без мышы або сэнсарнага экрана?",
        "Так, цалкам з клавіятуры, з геймпада або з пульта Android TV."
      ],
      [
        "Ці працуе гэта з праграмай чытання з экрана?",
        "Пакуль не цалкам. Галасавыя аб'явы зачытваюць гульнявыя падзеі, а меню маюць подпісы, але сам покерны стол — гэта візуальны інтэрфейс, і ў яго пакуль нельга гуляць толькі з праграмай чытання з экрана."
      ],
      [
        "Гэта бясплатна?",
        "Так. PokerTH — бясплатнае праграмнае забеспячэнне з адкрытым зыходным кодам, без рэкламы і без пакупак у праграме; усе фішкі — гульнявыя грошы."
      ]
    ]
  },
  bg: {
    "title": "Достъпен покер — голям текст, клавиатура, геймпад | PokerTH",
    "desc": "Безплатен Texas Hold’em с по-голям текст, висок контраст, тестета с 4 цвята, лупа за масата, гласови обявления и пълна игра с клавиатура, геймпад и ТВ дистанционно.",
    "ldHeadline": "Достъпен онлайн покер: голям текст, висок контраст, клавиатура и геймпад",
    "ldDesc": "Функциите за достъпност на уеб клиента PokerTH: размер на интерфейса, висок контраст, тестета с 4 цвята, лупа, гласови обявления, клавиатура, геймпад и ТВ дистанционно.",
    "h1": "Достъпен покер: играйте по своя начин",
    "lead": "PokerTH е безплатен Texas Hold’em в браузъра, който се съобразява с начина, по който виждате и играете: по-голям текст и бутони, по-силен контраст, тестета, в които всяка боя има свой цвят, лупа за малки екрани, гласови обявления и пълно управление с клавиатура, геймпад или телевизионно дистанционно.",
    "findH2": "Къде да го намерите",
    "findP": "Бутонът Достъпност — иконата с човече горе на всеки екран, от екрана за вход до масата — отваря основните настройки по всяко време, дори по средата на ръка. Всичко останало е в Разширени опции. Изборът ви се запомня на устройството, а когато влезете с профил в pokerth.net, ви следва и на другите ви устройства.",
    "seeH2": "Добре видима маса",
    "see": [
      [
        "Размер на интерфейса",
        "Стандартен, Голям или Много голям: текстът, картите, чиповете и бутоните растат заедно — на екрана за вход, в лобито и на масата, — а оформлението се пренарежда, за да остане удобно и на телефон."
      ],
      [
        "Висок контраст",
        "Палитра с по-силен контраст в целия интерфейс, от менютата до масата, при всеки размер на интерфейса."
      ],
      [
        "Тестета с 4 цвята",
        "Тестета карти, в които всяка боя има собствен цвят, така че купите и карите или пиките и спатиите никога не се различават само по формата. Изберете едно в Разширени опции → Стил."
      ],
      [
        "Лупа за масата",
        "На телефон масата се увеличава двойно и се мести с пръст; изгледът се връща към вашето място, когато е ваш ред. Може да се разреши и мащабирането с щипване на браузъра."
      ],
      [
        "Светъл, тъмен или автоматичен режим",
        "Целият клиент следва вашия избор или този на системата ви, с теми, тестета и цветове на масата, удобни за очите ви."
      ]
    ],
    "keysH2": "Клавиатура",
    "keysP": "Всяко действие има клавиш. Официалните функционални клавиши на PokerTH работят на масата — F1 до F4 за Fold, Check/Call, Bet/Raise и All-In, F5 за показване на картите ви, F6 до F8 за режимите на игра, — а уеб клиентът добавя единични букви (F, C, R, A и 1, 2, 3 за една трета от пота, половин пот или цял пот), като всички могат да се пренастроят. Esc затваря най-горния прозорец, Tab и стрелките се движат по списъка с маси в лобито, а Alt+S отваря настройките отвсякъде.",
    "padH2": "Геймпад и ТВ дистанционно",
    "padP": "Геймпадът — Xbox, PlayStation, Switch Pro и повечето Bluetooth контролери — играе цялата игра: бутони за всяко действие, тригери за размера на залога и режим Навигация за движение по екраните, чата и менютата. Той вибрира, когато дойде вашият ред. На Android TV и Google TV дистанционното работи по същия начин, а дистанционните с четирите цветни бутона ги използват за Fold, Check/Call, Bet/Raise и All-In.",
    "hearH2": "Да чувате и усещате играта",
    "hearP": "Гласовите обявления четат на глас игровите събития с гласовете на самото ви устройство, на вашия език, ако системата има такъв глас. На телефони с Android кратка вибрация отбелязва вашия ред. Звуците на играта са в четири групи — действия, чат, мрежови известия и вдигане на блайндовете, — които се включват и изключват поотделно, с един плъзгач за сила на звука.",
    "calmH2": "По-малко изненади",
    "calmP": "Когато системата ви изисква намалено движение, клиентът смекчава анимациите си. Защитата от надничане държи вашите карти скрити, докато не ги докоснете, а защитата от случаен Call за кратко заключва бутона Call веднага след голямо вдигане, така че докосване, предназначено за по-малък Call, да не плати по погрешка вдигнатата сума.",
    "langH2": "На вашия език, с водач",
    "langP": "Интерфейсът е достъпен на {langs} езика, отдясно наляво, където е нужно. С Помощ от асото асото — талисманът на уеб клиента — обяснява всеки екран, докато играете, ако желаете, а „Какво е това?“ ви казва какво прави всеки елемент на екрана.",
    "faqH2": "Въпроси",
    "faq": [
      [
        "Мога ли да уголемя картите и текста?",
        "Да. Изберете Голям или Много голям в прозореца Достъпност; картите, текстът и бутоните растат заедно на всеки екран, включително на масата."
      ],
      [
        "Има ли режим с висок контраст?",
        "Да, в прозореца Достъпност. Работи с всеки размер на интерфейса."
      ],
      [
        "Мога ли да играя без мишка или сензорен екран?",
        "Да, изцяло с клавиатура, с геймпад или с дистанционно за Android TV."
      ],
      [
        "Работи ли с екранен четец?",
        "Все още не напълно. Гласовите обявления четат на глас игровите събития и менютата имат етикети, но самата покер маса е визуален интерфейс и все още не може да се играе само с екранен четец."
      ],
      [
        "Безплатно ли е?",
        "Да. PokerTH е безплатен софтуер с отворен код, без реклами и без покупки в приложението; всички чипове са само за игра."
      ]
    ]
  },
  bn: {
    "title": "অ্যাক্সেসিবল পোকার — বড় লেখা, কীবোর্ড, গেমপ্যাড | PokerTH",
    "desc": "বিনামূল্যে Texas Hold’em: বড় লেখা, উচ্চ কনট্রাস্ট, চার-রঙা ডেক, টেবিল ম্যাগনিফায়ার, কণ্ঠ ঘোষণা আর কীবোর্ড, গেমপ্যাড ও টিভি রিমোটে পুরো খেলা।",
    "ldHeadline": "অ্যাক্সেসিবল অনলাইন পোকার: বড় লেখা, উচ্চ কনট্রাস্ট, কীবোর্ড ও গেমপ্যাড",
    "ldDesc": "PokerTH ওয়েব ক্লায়েন্টের অ্যাক্সেসিবিলিটি ফিচার: ইন্টারফেসের আকার, উচ্চ কনট্রাস্ট, চার-রঙা ডেক, ম্যাগনিফায়ার, কণ্ঠ ঘোষণা, কীবোর্ড, গেমপ্যাড ও টিভি রিমোট।",
    "h1": "অ্যাক্সেসিবল পোকার: নিজের মতো করে খেলুন",
    "lead": "PokerTH হলো ব্রাউজারে বিনামূল্যের Texas Hold’em, আর এটি আপনার দেখা ও খেলার ধরন অনুযায়ী মানিয়ে নেয়: আরও বড় লেখা ও বোতাম, আরও জোরালো কনট্রাস্ট, রঙ দিয়ে সুট আলাদা করা ডেক, ছোট স্ক্রিনের জন্য ম্যাগনিফায়ার, কণ্ঠ ঘোষণা, এবং কীবোর্ড, গেমপ্যাড বা টিভি রিমোট দিয়ে সম্পূর্ণ নিয়ন্ত্রণ।",
    "findH2": "কোথায় পাবেন",
    "findP": "অ্যাক্সেসিবিলিটি বোতাম — লগইন স্ক্রিন থেকে টেবিল পর্যন্ত প্রতিটি স্ক্রিনের ওপরে থাকা মানুষের আইকন — যেকোনো সময় মূল সেটিংস খোলে, এমনকি হাতের মাঝখানেও। বাকি সবকিছু উন্নত অপশনে আছে। আপনার পছন্দগুলো ডিভাইসে মনে রাখা হয় এবং pokerth.net অ্যাকাউন্টে লগইন করলে আপনার অন্য ডিভাইসেও আপনার সঙ্গে যায়।",
    "seeH2": "টেবিল দেখা",
    "see": [
      [
        "ইন্টারফেসের আকার",
        "স্ট্যান্ডার্ড, বড় বা অতিরিক্ত বড়: লেখা, কার্ড, চিপস ও বোতাম একসঙ্গে বড় হয় — লগইন স্ক্রিনে, লবিতে এবং টেবিলে — আর ফোনেও ব্যবহারযোগ্য থাকতে লেআউট নতুন করে সাজে।"
      ],
      [
        "উচ্চ কনট্রাস্ট",
        "মেনু থেকে টেবিল পর্যন্ত পুরো ইন্টারফেসে আরও জোরালো কনট্রাস্টের রঙ, প্রতিটি ইন্টারফেস আকারে।"
      ],
      [
        "চার-রঙা ডেক",
        "এমন কার্ড ডেক যা প্রতিটি সুটকে নিজস্ব রঙ দেয়, যাতে হরতন আর রুইতন, কিংবা ইস্কাপন আর চিড়িতন কখনো শুধু আকার দেখে আলাদা করতে না হয়। উন্নত অপশন → স্টাইল থেকে একটি বেছে নিন।"
      ],
      [
        "টেবিল ম্যাগনিফায়ার",
        "ফোনে টেবিল দ্বিগুণ আকারে জুম হয় এবং আঙুল দিয়ে সরানো যায়; আপনার পালা এলে দৃশ্য আপনার আসনে ফিরে আসে। ব্রাউজারের পিঞ্চ-জুমও চালু করা যায়।"
      ],
      [
        "লাইট, ডার্ক বা স্বয়ংক্রিয়",
        "পুরো ক্লায়েন্ট আপনার বা আপনার সিস্টেমের পছন্দ অনুসরণ করে, সঙ্গে আপনার চোখের উপযোগী থিম, ডেক ও টেবিলের রঙ।"
      ]
    ],
    "keysH2": "কীবোর্ড",
    "keysP": "প্রতিটি অ্যাকশনের একটি কী আছে। অফিসিয়াল PokerTH ফাংশন কী টেবিলে কাজ করে — Fold, Check/Call, Bet/Raise ও All-In-এর জন্য F1 থেকে F4, নিজের কার্ড দেখাতে F5, খেলার মোডের জন্য F6 থেকে F8 — আর ওয়েব ক্লায়েন্ট একক অক্ষরও যোগ করে (F, C, R, A, এবং পটের এক-তৃতীয়াংশ, অর্ধেক পট বা পুরো পটের জন্য 1, 2, 3), যেগুলোর সবই নতুন করে সেট করা যায়। Esc সবচেয়ে ওপরের উইন্ডো বন্ধ করে, Tab ও তীর কী দিয়ে লবির টেবিল তালিকায় চলাফেরা করা যায়, আর Alt+S যেকোনো জায়গা থেকে সেটিংস খোলে।",
    "padH2": "গেমপ্যাড ও টিভি রিমোট",
    "padP": "একটি গেম কন্ট্রোলার — Xbox, PlayStation, Switch Pro এবং বেশিরভাগ Bluetooth প্যাড — দিয়ে পুরো খেলাটাই খেলা যায়: প্রতিটি অ্যাকশনের জন্য বোতাম, বাজির পরিমাণ ঠিক করতে ট্রিগার, আর স্ক্রিন, চ্যাট ও মেনুতে চলাফেরার জন্য নেভিগেশন মোড। আপনার পালা এলে এটি কেঁপে ওঠে। Android TV ও Google TV-তে রিমোট একইভাবে কাজ করে, আর চারটি রঙিন কী থাকা রিমোটে সেগুলো Fold, Check/Call, Bet/Raise ও All-In-এর জন্য ব্যবহৃত হয়।",
    "hearH2": "খেলা শোনা ও অনুভব করা",
    "hearP": "কণ্ঠ ঘোষণা আপনার ডিভাইসের নিজস্ব কণ্ঠে খেলার ঘটনাগুলো জোরে পড়ে শোনায়, সিস্টেমে থাকলে আপনার ভাষাতেই। Android ফোনে একটি ছোট কম্পন আপনার পালা জানায়। খেলার শব্দ চারটি দলে ভাগ করা — অ্যাকশন, চ্যাট, নেটওয়ার্ক বিজ্ঞপ্তি আর ব্লাইন্ড বাড়া — যেগুলো আলাদাভাবে চালু বা বন্ধ করা যায়, একটিমাত্র ভলিউম স্লাইডারসহ।",
    "calmH2": "কম চমক",
    "calmP": "আপনার সিস্টেম কম মোশন চাইলে ক্লায়েন্ট তার অ্যানিমেশন কমিয়ে দেয়। উঁকি-বিরোধী আপনার নিজের কার্ড ট্যাপ না করা পর্যন্ত লুকিয়ে রাখে, আর দুর্ঘটনাজনিত-call রক্ষক বড় raise-এর ঠিক পরে Call বোতাম অল্প সময়ের জন্য আটকে রাখে, যাতে ছোট call-এর উদ্দেশ্যে করা ট্যাপ ভুল করে বাড়ানো পরিমাণ পরিশোধ না করে।",
    "langH2": "আপনার ভাষায়, সঙ্গে একজন গাইড",
    "langP": "ইন্টারফেসটি {langs}টি ভাষায় পাওয়া যায়, প্রয়োজনে ডান থেকে বাঁয়ে। চাইলে ওয়েব ক্লায়েন্টের মাসকট টেক্কার সহায়তা আপনি এগোনোর সঙ্গে সঙ্গে প্রতিটি স্ক্রিন বুঝিয়ে দেয়, আর “এটা কী?” জানিয়ে দেয় স্ক্রিনের যেকোনো জিনিস কী করে।",
    "faqH2": "প্রশ্নোত্তর",
    "faq": [
      [
        "কার্ড ও লেখা কি বড় করা যায়?",
        "হ্যাঁ। অ্যাক্সেসিবিলিটি উইন্ডোতে বড় বা অতিরিক্ত বড় বেছে নিন; টেবিলসহ প্রতিটি স্ক্রিনে কার্ড, লেখা ও বোতাম একসঙ্গে বড় হয়।"
      ],
      [
        "উচ্চ কনট্রাস্ট মোড আছে কি?",
        "হ্যাঁ, অ্যাক্সেসিবিলিটি উইন্ডোতে। এটি প্রতিটি ইন্টারফেস আকারের সঙ্গে কাজ করে।"
      ],
      [
        "মাউস বা টাচস্ক্রিন ছাড়া খেলা যায় কি?",
        "হ্যাঁ, পুরোপুরি কীবোর্ড, গেমপ্যাড বা Android TV রিমোট দিয়ে।"
      ],
      [
        "স্ক্রিন রিডারের সঙ্গে কাজ করে কি?",
        "এখনও পুরোপুরি নয়। কণ্ঠ ঘোষণা খেলার ঘটনাগুলো জোরে পড়ে শোনায় এবং মেনুগুলোতে লেবেল আছে, কিন্তু পোকার টেবিলটি নিজেই একটি দৃশ্যমান ইন্টারফেস এবং এখনও শুধু স্ক্রিন রিডার দিয়ে খেলা যায় না।"
      ],
      [
        "এটি কি বিনামূল্যে?",
        "হ্যাঁ। PokerTH বিনামূল্যের ওপেন-সোর্স সফটওয়্যার, কোনো বিজ্ঞাপন বা অ্যাপের ভেতরে কেনাকাটা নেই; সব চিপসই খেলার টাকা।"
      ]
    ]
  },
  bs: {
    "title": "Pristupačan poker — veliki tekst, tastatura, gamepad | PokerTH",
    "desc": "Besplatni Texas Hold’em s većim tekstom, visokim kontrastom, špilovima u četiri boje, povećalom, glasovnim najavama i igrom tastaturom, gamepadom i daljinskim.",
    "ldHeadline": "Pristupačan online poker: veliki tekst, visoki kontrast, tastatura i gamepad",
    "ldDesc": "Funkcije pristupačnosti PokerTH web klijenta: veličina interfejsa, visoki kontrast, špilovi u četiri boje, povećalo, glasovne najave, tastatura, gamepad i TV daljinski upravljač.",
    "h1": "Pristupačan poker: igraj na svoj način",
    "lead": "PokerTH je besplatni Texas Hold’em u pregledniku koji se prilagođava načinu na koji vidiš i igraš: veći tekst i dugmad, jači kontrast, špilovi koji znakove karata razlikuju po boji, povećalo za male ekrane, glasovne najave i potpuna kontrola tastaturom, gamepadom ili TV daljinskim upravljačem.",
    "findH2": "Gdje se nalazi",
    "findP": "Dugme Pristupačnost — ikona osobe na vrhu svakog ekrana, od ekrana za prijavu do stola — otvara glavne postavke u bilo kojem trenutku, čak i usred ruke. Sve ostalo je u Naprednim opcijama. Tvoji izbori pamte se na uređaju, a kad se prijaviš računom na pokerth.net, prate te i na tvojim drugim uređajima.",
    "seeH2": "Kako vidiš sto",
    "see": [
      [
        "Veličina interfejsa",
        "Standardno, Veliko ili Vrlo veliko: tekst, karte, žetoni i dugmad rastu zajedno, na ekranu za prijavu, u predvorju i za stolom, a raspored se prilagođava da ostane upotrebljiv i na telefonu."
      ],
      [
        "Visoki kontrast",
        "Paleta jačeg kontrasta u cijelom interfejsu, od menija do stola, uz svaku veličinu interfejsa."
      ],
      [
        "Špilovi u četiri boje",
        "Špilovi karata u kojima svaki znak ima svoju boju, pa se herc i karo, ili pik i tref, nikad ne razlikuju samo po obliku. Odaberi jedan u Napredne opcije → Stil."
      ],
      [
        "Povećalo stola",
        "Na telefonu se sto povećava dvostruko i pomiče prstom; prikaz se vraća na tvoje mjesto kad si na potezu. Može se dozvoliti i zumiranje štipanjem u pregledniku."
      ],
      [
        "Svijetlo, tamno ili automatski",
        "Cijeli klijent prati tvoj izbor ili izbor tvog sistema, s temama, špilovima i bojama stola po mjeri tvojih očiju."
      ]
    ],
    "keysH2": "Tastatura",
    "keysP": "Svaka radnja ima svoju tipku. Službene funkcijske tipke PokerTH-a rade za stolom — F1 do F4 za Fold, Check/Call, Bet/Raise i All-In, F5 da pokažeš svoje karte, F6 do F8 za načine igre — a web klijent dodaje pojedinačna slova (F, C, R, A te 1, 2, 3 za trećinu pota, pola pota ili cijeli pot), koja se sva mogu preraspodijeliti. Escape zatvara prozor na vrhu, Tab i strelice kreću se kroz popis stolova u predvorju, a Alt+S otvara postavke odakle god.",
    "padH2": "Gamepad i TV daljinski upravljač",
    "padP": "Kontroler za igre — Xbox, PlayStation, Switch Pro i većina Bluetooth kontrolera — igra cijelu igru: dugmad za svaku radnju, okidači za podešavanje uloga i način navigacije za kretanje kroz ekrane, chat i menije. Zavibrira kad dođe tvoj red. Na Android TV-u i Google TV-u daljinski upravljač radi na isti način, a daljinski s četiri tipke u boji koriste ih za Fold, Check/Call, Bet/Raise i All-In.",
    "hearH2": "Slušaj i osjeti igru",
    "hearP": "Glasovne najave naglas čitaju događaje igre glasovima tvog uređaja, na tvom jeziku ako ga sistem ima. Na Android telefonima kratka vibracija označava tvoj potez. Zvukovi igre dijele se u četiri grupe — radnje, chat, mrežna obavještenja i povećanja blindova — koje se uključuju ili isključuju zasebno, uz jedan klizač jačine zvuka.",
    "calmH2": "Manje iznenađenja",
    "calmP": "Kad sistem traži smanjeno kretanje, klijent ublažava svoje animacije. Zaštita od virenja drži tvoje karte skrivenima dok ih ne dodirneš, a zaštita od slučajnog Calla nakratko zaključava dugme Call odmah nakon velikog povišenja, da dodir namijenjen manjem Callu ne bi greškom platio povišeni iznos.",
    "langH2": "Na tvom jeziku, s vodičem",
    "langP": "Interfejs je dostupan na {langs} jezika, zdesna nalijevo gdje je potrebno. Uz Pomoć asa, as — maskota web klijenta — usput ti objašnjava svaki ekran ako to želiš, a „Šta je ovo?“ kaže ti šta radi bilo šta na ekranu.",
    "faqH2": "Pitanja",
    "faq": [
      [
        "Mogu li povećati karte i tekst?",
        "Da. Odaberi Veliko ili Vrlo veliko u prozoru Pristupačnost; karte, tekst i dugmad rastu zajedno na svakom ekranu, uključujući sto."
      ],
      [
        "Postoji li način visokog kontrasta?",
        "Da, u prozoru Pristupačnost. Radi uz svaku veličinu interfejsa."
      ],
      [
        "Mogu li igrati bez miša ili ekrana osjetljivog na dodir?",
        "Da, potpuno tastaturom, gamepadom ili daljinskim upravljačem za Android TV."
      ],
      [
        "Radi li s čitačem ekrana?",
        "Još ne u potpunosti. Glasovne najave naglas čitaju događaje igre, a meniji imaju oznake, ali sam poker sto je vizuelni interfejs i još se ne može igrati samo uz čitač ekrana."
      ],
      [
        "Je li besplatno?",
        "Da. PokerTH je besplatan softver otvorenog koda, bez reklama i bez kupovine u aplikaciji; svi žetoni su samo igrački novac."
      ]
    ]
  },
  ca: {
    "title": "Pòquer accessible — text gran, teclat, comandament | PokerTH",
    "desc": "Texas Hold’em gratis amb text més gran, contrast alt, baralles de quatre colors, lupa de taula, anuncis de veu i joc complet amb teclat, comandament o control de TV.",
    "ldHeadline": "Pòquer en línia accessible: text gran, contrast alt, teclat i comandament",
    "ldDesc": "Les funcions d’accessibilitat del client web de PokerTH: mida de la interfície, contrast alt, baralles de quatre colors, lupa, anuncis de veu, teclat, comandament i comandament a distància de la TV.",
    "h1": "Pòquer accessible: juga a la teva manera",
    "lead": "PokerTH és Texas Hold’em gratis al navegador, i s’adapta a la manera com veus i jugues: text i botons més grans, més contrast, baralles que distingeixen els pals pel color, una lupa per a pantalles petites, anuncis de veu i control complet amb teclat, comandament de joc o comandament a distància de la TV.",
    "findH2": "On trobar-ho",
    "findP": "El botó Accessibilitat — la icona de persona a la part superior de cada pantalla, des de la pantalla d’inici de sessió fins a la taula — obre els ajustos principals en qualsevol moment, fins i tot enmig d’una mà. Tota la resta és a les Opcions avançades. Les teves tries es recorden al dispositiu i, quan inicies sessió amb un compte de pokerth.net, et segueixen als altres dispositius.",
    "seeH2": "Veure bé la taula",
    "see": [
      [
        "Mida de la interfície",
        "Estàndard, Gran o Molt gran: el text, les cartes, les fitxes i els botons creixen alhora, a la pantalla d’inici de sessió, al vestíbul i a la taula, i la disposició es reorganitza perquè continuï sent còmoda al mòbil."
      ],
      [
        "Contrast alt",
        "Una paleta de contrast més fort a tota la interfície, des dels menús fins a la taula, amb qualsevol mida de la interfície."
      ],
      [
        "Baralles de quatre colors",
        "Baralles que donen a cada pal el seu propi color, de manera que cors i diamants, o piques i trèvols, mai no s’hagin de distingir només per la forma. Tria’n una a Opcions avançades → Estil."
      ],
      [
        "Lupa de la taula",
        "Al mòbil, la taula s’amplia al doble de mida i la pots desplaçar amb el dit; la vista torna al teu seient quan és el teu torn. També es pot permetre el zoom del navegador amb dos dits."
      ],
      [
        "Clar, fosc o automàtic",
        "Tot el client segueix la teva tria o la del sistema, amb temes, baralles i colors de taula a la mida dels teus ulls."
      ]
    ],
    "keysH2": "Teclat",
    "keysP": "Cada acció té una tecla. Les tecles de funció oficials de PokerTH funcionen a la taula — de F1 a F4 per a Fold, Check/Call, Bet/Raise i All-In, F5 per mostrar les teves cartes, de F6 a F8 per als modes de joc — i el client web hi afegeix lletres soles (F, C, R, A, i 1, 2, 3 per a un terç del pot, la meitat del pot o el pot), totes reassignables. Esc tanca la finestra de sobre, Tab i les fletxes recorren la llista de taules del vestíbul, i Alt+S obre la configuració des de qualsevol lloc.",
    "padH2": "Comandament de joc i comandament de la TV",
    "padP": "Un comandament de joc — Xbox, PlayStation, Switch Pro i la majoria de comandaments Bluetooth — permet jugar tota la partida: botons per a cada acció, gatells per fixar l’aposta i un mode de navegació per moure’s per les pantalles, el xat i els menús. Vibra quan et toca. A Android TV i Google TV el comandament a distància funciona igual, i els comandaments amb les quatre tecles de colors les fan servir per a Fold, Check/Call, Bet/Raise i All-In.",
    "hearH2": "Sentir i notar el joc",
    "hearP": "Els anuncis de veu llegeixen en veu alta els esdeveniments del joc amb les veus del teu dispositiu, en el teu idioma si el sistema en té. Als mòbils Android, una vibració curta marca el teu torn. Els sons del joc es divideixen en quatre grups — accions, xat, avisos de xarxa i pujades de cegues — que es poden activar o desactivar per separat, amb un sol control de volum.",
    "calmH2": "Menys sorpreses",
    "calmP": "Quan el sistema demana menys moviment, el client suavitza les animacions. La protecció antiespieta manté les teves cartes tapades fins que les toques, i la protecció anti-Call accidental bloqueja un moment el botó Call just després d’una pujada gran, perquè un toc pensat per a un Call més petit no pugui pagar per error la quantitat pujada.",
    "langH2": "En el teu idioma, amb un guia",
    "langP": "La interfície està disponible en {langs} idiomes, de dreta a esquerra quan cal. L’Ajuda de l’As, la mascota del client web, t’explica cada pantalla a mesura que avances, si vols, i «Què és això?» et diu què fa qualsevol element de la pantalla.",
    "faqH2": "Preguntes",
    "faq": [
      [
        "Puc fer més grans les cartes i el text?",
        "Sí. Tria Gran o Molt gran a la finestra Accessibilitat; les cartes, el text i els botons creixen alhora a totes les pantalles, també a la taula."
      ],
      [
        "Hi ha un mode de contrast alt?",
        "Sí, a la finestra Accessibilitat. Funciona amb qualsevol mida de la interfície."
      ],
      [
        "Puc jugar sense ratolí ni pantalla tàctil?",
        "Sí, completament amb el teclat, amb un comandament de joc o amb el comandament a distància d’Android TV."
      ],
      [
        "Funciona amb un lector de pantalla?",
        "Encara no del tot. Els anuncis de veu llegeixen en veu alta els esdeveniments del joc i els menús tenen etiquetes, però la taula de pòquer és en si una interfície visual i encara no s’hi pot jugar només amb un lector de pantalla."
      ],
      [
        "És gratis?",
        "Sí. PokerTH és programari gratuït i de codi obert, sense anuncis ni compres dins l’aplicació; totes les fitxes són diners de joc."
      ]
    ]
  },
  cs: {
    "title": "Přístupný poker — velké písmo, klávesnice, gamepad | PokerTH",
    "desc": "Texas Hold’em zdarma: větší písmo, vysoký kontrast, čtyřbarevné balíčky, lupa stolu, hlasová oznámení a hra klávesnicí, gamepadem i dálkovým ovladačem TV.",
    "ldHeadline": "Přístupný online poker: velké písmo, vysoký kontrast, klávesnice a gamepad",
    "ldDesc": "Funkce přístupnosti webového klienta PokerTH: velikost rozhraní, vysoký kontrast, čtyřbarevné balíčky, lupa, hlasová oznámení, klávesnice, gamepad a dálkový ovladač TV.",
    "h1": "Přístupný poker: hrajte po svém",
    "lead": "PokerTH je Texas Hold’em zdarma v prohlížeči a přizpůsobí se tomu, jak vidíte a hrajete: větší písmo a tlačítka, silnější kontrast, balíčky, v nichž má každá barva karet vlastní odstín, lupa pro malé obrazovky, hlasová oznámení a úplné ovládání klávesnicí, gamepadem nebo dálkovým ovladačem televize.",
    "findH2": "Kde to najdete",
    "findP": "Tlačítko Přístupnost — ikona postavy nahoře na každé obrazovce, od přihlašovací obrazovky až po stůl — kdykoli otevře hlavní nastavení, i uprostřed rozdání. Vše ostatní je v Pokročilých možnostech. Vaše volby si zařízení zapamatuje, a když se přihlásíte účtem pokerth.net, přenesou se i na vaše další zařízení.",
    "seeH2": "Dobře vidět na stůl",
    "see": [
      [
        "Velikost rozhraní",
        "Standardní, Velké nebo Velmi velké: písmo, karty, žetony i tlačítka rostou společně na přihlašovací obrazovce, v lobby i u stolu a rozvržení se přeskládá, aby zůstalo použitelné i na telefonu."
      ],
      [
        "Vysoký kontrast",
        "Paleta se silnějším kontrastem v celém rozhraní, od nabídek až po stůl, při každé velikosti rozhraní."
      ],
      [
        "Čtyřbarevné balíčky",
        "Balíčky karet, v nichž má každá barva vlastní odstín, takže srdce od kárů ani piky od křížů nikdy nerozlišujete jen podle tvaru. Vyberte si jeden v Pokročilé možnosti → Styl."
      ],
      [
        "Lupa stolu",
        "Na telefonu se stůl zvětší na dvojnásobek a posouváte ho prstem; když jste na tahu, pohled se vrátí k vašemu místu. Povolit lze i přiblížení prohlížeče sevřením prstů."
      ],
      [
        "Světlý, tmavý nebo automatický",
        "Celý klient se řídí vaší volbou nebo nastavením systému, s motivy, balíčky a barvami stolu, které sednou vašim očím."
      ]
    ],
    "keysH2": "Klávesnice",
    "keysP": "Každá akce má svou klávesu. U stolu fungují oficiální funkční klávesy PokerTH — F1 až F4 pro Fold, Check/Call, Bet/Raise a All-In, F5 pro ukázání karet, F6 až F8 pro herní režimy — a webový klient přidává jednotlivá písmena (F, C, R, A a 1, 2, 3 pro třetinu banku, polovinu banku nebo celý bank), která lze všechna přemapovat. Escape zavře vrchní okno, Tab a šipky procházejí seznam stolů v lobby a Alt+S odkudkoli otevře nastavení.",
    "padH2": "Gamepad a dálkový ovladač TV",
    "padP": "Herní ovladač — Xbox, PlayStation, Switch Pro a většina Bluetooth ovladačů — zvládne celou hru: tlačítka pro každou akci, triggery pro nastavení sázky a režim navigace pro pohyb po obrazovkách, chatu a nabídkách. Když jste na tahu, zavibruje. Na Android TV a Google TV funguje stejně dálkový ovladač a ovladače se čtyřmi barevnými tlačítky jimi provádějí Fold, Check/Call, Bet/Raise a All-In.",
    "hearH2": "Hru slyšet i cítit",
    "hearP": "Hlasová oznámení předčítají herní události nahlas hlasy vašeho zařízení, ve vašem jazyce, pokud ho systém má. Na telefonech s Androidem označí váš tah krátká vibrace. Herní zvuky jsou rozdělené do čtyř skupin — akce, chat, síťová oznámení a zvýšení blindů —, které lze zapnout či vypnout zvlášť, s jedním posuvníkem hlasitosti.",
    "calmH2": "Méně překvapení",
    "calmP": "Když systém žádá omezení pohybu, klient ztlumí své animace. Ochrana proti nakukování drží vaše karty zakryté, dokud se jich nedotknete, a pojistka proti náhodnému Callu krátce zablokuje tlačítko Call hned po velkém navýšení, aby klepnutí mířené na menší Call nezaplatilo omylem navýšenou částku.",
    "langH2": "Ve vašem jazyce, s průvodcem",
    "langP": "Rozhraní je k dispozici v {langs} jazycích, kde je potřeba, i zprava doleva. Nápověda od esa — eso je maskot webového klienta — vám, pokud chcete, průběžně vysvětlí každou obrazovku a „Co je to?“ vám řekne, k čemu slouží cokoli na obrazovce.",
    "faqH2": "Otázky",
    "faq": [
      [
        "Můžu zvětšit karty a písmo?",
        "Ano. V okně Přístupnost zvolte Velké nebo Velmi velké; karty, písmo i tlačítka se zvětší společně na každé obrazovce, včetně stolu."
      ],
      [
        "Je k dispozici režim vysokého kontrastu?",
        "Ano, v okně Přístupnost. Funguje při každé velikosti rozhraní."
      ],
      [
        "Můžu hrát bez myši nebo dotykové obrazovky?",
        "Ano, úplně klávesnicí, gamepadem nebo dálkovým ovladačem Android TV."
      ],
      [
        "Funguje to se čtečkou obrazovky?",
        "Zatím ne úplně. Hlasová oznámení předčítají herní události nahlas a nabídky mají popisky, ale samotný pokerový stůl je vizuální rozhraní a zatím se na něm nedá hrát jen se čtečkou obrazovky."
      ],
      [
        "Je to zdarma?",
        "Ano. PokerTH je bezplatný software s otevřeným zdrojovým kódem, bez reklam a bez nákupů v aplikaci; všechny žetony jsou jen herní peníze."
      ]
    ]
  },
  cy: {
    "title": "Pocer hygyrch — testun mawr, bysellfwrdd, pad gêm | PokerTH",
    "desc": "Texas Hold’em am ddim: testun mwy, cyferbyniad uchel, pecynnau 4 lliw, chwyddwydr, cyhoeddiadau llais a chwarae llawn â bysellfwrdd, pad gêm a theclyn teledu.",
    "ldHeadline": "Pocer ar-lein hygyrch: testun mawr, cyferbyniad uchel, bysellfwrdd a phad gêm",
    "ldDesc": "Nodweddion hygyrchedd cleient gwe PokerTH: maint y rhyngwyneb, cyferbyniad uchel, pecynnau 4 lliw, chwyddwydr, cyhoeddiadau llais, bysellfwrdd, pad gêm a theclyn rheoli o bell y teledu.",
    "h1": "Pocer hygyrch: chwaraewch eich ffordd chi",
    "lead": "Texas Hold’em am ddim yn y porwr yw PokerTH, ac mae'n addasu i'r ffordd rydych chi'n gweld ac yn chwarae: testun a botymau mwy, cyferbyniad cryfach, pecynnau cardiau sy'n gwahaniaethu'r siwtiau â lliw, chwyddwydr ar gyfer sgriniau bach, cyhoeddiadau llais, a rheolaeth lawn o fysellfwrdd, pad gêm neu declyn rheoli o bell y teledu.",
    "findH2": "Ble i'w gael",
    "findP": "Mae'r botwm Hygyrchedd — eicon y person ar frig pob sgrin, o'r sgrin mewngofnodi i'r bwrdd — yn agor y prif osodiadau unrhyw bryd, hyd yn oed yng nghanol llaw. Mae popeth arall yn y Dewisiadau uwch. Caiff eich dewisiadau eu cofio ar y ddyfais ac, wrth i chi fewngofnodi â chyfrif pokerth.net, maen nhw'n eich dilyn i'ch dyfeisiau eraill.",
    "seeH2": "Gweld y bwrdd",
    "see": [
      [
        "Maint y rhyngwyneb",
        "Safonol, Mawr neu Mawr iawn: mae'r testun, y cardiau, y sglodion a'r botymau'n tyfu gyda'i gilydd, ar y sgrin mewngofnodi, yn y lobi ac wrth y bwrdd, ac mae'r cynllun yn ad-drefnu er mwyn aros yn hwylus ar ffôn."
      ],
      [
        "Cyferbyniad uchel",
        "Palet â chyferbyniad cryfach ar draws y rhyngwyneb cyfan, o'r dewislenni i'r bwrdd, ar bob maint rhyngwyneb."
      ],
      [
        "Pecynnau pedwar lliw",
        "Pecynnau cardiau sy'n rhoi ei liw ei hun i bob siwt, fel na fydd calonnau ♥ a diemwntau ♦, na rhawiau ♠ a chlybiau ♣, byth yn cael eu gwahaniaethu yn ôl eu siâp yn unig. Dewiswch un yn Dewisiadau uwch → Arddull."
      ],
      [
        "Chwyddwydr y bwrdd",
        "Ar ffôn, mae'r bwrdd yn chwyddo i ddwywaith ei faint ac yn symud â'ch bys; mae'r olwg yn dychwelyd at eich sedd pan ddaw eich tro. Gellir caniatáu chwyddo pinsio'r porwr hefyd."
      ],
      [
        "Golau, tywyll neu awtomatig",
        "Mae'r cleient cyfan yn dilyn eich dewis chi neu ddewis eich system, gyda themâu, pecynnau a lliwiau bwrdd i siwtio'ch llygaid."
      ]
    ],
    "keysH2": "Bysellfwrdd",
    "keysP": "Mae gan bob gweithred ei bysell. Mae bysellau ffwythiant swyddogol PokerTH yn gweithio wrth y bwrdd — F1 i F4 ar gyfer Fold, Check/Call, Bet/Raise ac All-In, F5 i ddangos eich cardiau, F6 i F8 ar gyfer y moddau chwarae — ac mae'r cleient gwe yn ychwanegu llythrennau unigol (F, C, R, A, ac 1, 2, 3 ar gyfer traean y pot, hanner y pot neu'r pot cyfan), a gellir ailbennu pob un ohonynt. Mae Escape yn cau'r ffenestr uchaf, mae Tab a'r bysellau saeth yn symud drwy restr byrddau'r lobi, ac mae Alt+S yn agor y gosodiadau o unrhyw le.",
    "padH2": "Pad gêm a theclyn rheoli o bell y teledu",
    "padP": "Mae rheolydd gêm — Xbox, PlayStation, Switch Pro a'r rhan fwyaf o badiau Bluetooth — yn chwarae'r gêm gyfan: botymau ar gyfer pob gweithred, sbardunau i osod y bet, a modd llywio i symud drwy'r sgriniau, y sgwrs a'r dewislenni. Mae'n dirgrynu pan ddaw eich tro. Ar Android TV a Google TV mae'r teclyn rheoli o bell yn gweithio yn yr un ffordd, ac mae teclynnau sydd â'r pedair bysell liw yn eu defnyddio ar gyfer Fold, Check/Call, Bet/Raise ac All-In.",
    "hearH2": "Clywed a theimlo'r gêm",
    "hearP": "Mae cyhoeddiadau llais yn darllen digwyddiadau'r gêm yn uchel gyda lleisiau eich dyfais ei hun, yn eich iaith chi lle mae gan y system un. Ar ffonau Android mae dirgryniad byr yn nodi eich tro. Daw synau'r gêm mewn pedwar grŵp — gweithredoedd, sgwrs, hysbysiadau rhwydwaith a chodiadau'r blinds — y gellir eu troi ymlaen neu i ffwrdd ar wahân, gydag un llithrydd sain.",
    "calmH2": "Llai o syrpréis",
    "calmP": "Pan fydd eich system yn gofyn am lai o symud, mae'r cleient yn lleddfu ei animeiddiadau. Mae Anti-peek yn cadw'ch cardiau eich hun yn gudd nes i chi eu tapio, ac mae'r gwarchod rhag call damweiniol yn rhwystro'r botwm Call am ennyd yn syth ar ôl raise mawr, fel na all tap a fwriadwyd ar gyfer call llai dalu'r swm uwch drwy gamgymeriad.",
    "langH2": "Yn eich iaith chi, gyda thywysydd",
    "langP": "Mae'r rhyngwyneb ar gael mewn {langs} o ieithoedd, o'r dde i'r chwith lle bo angen. Mae Cymorth yr As, masgot y cleient gwe, yn esbonio pob sgrin wrth i chi fynd os dymunwch, ac mae “Beth yw hwn?” yn dweud wrthych beth mae unrhyw beth ar y sgrin yn ei wneud.",
    "faqH2": "Cwestiynau",
    "faq": [
      [
        "Alla i wneud y cardiau a'r testun yn fwy?",
        "Gallwch. Dewiswch Mawr neu Mawr iawn yn y ffenestr Hygyrchedd; mae'r cardiau, y testun a'r botymau'n tyfu gyda'i gilydd ar bob sgrin, gan gynnwys y bwrdd."
      ],
      [
        "Oes modd cyferbyniad uchel?",
        "Oes, yn y ffenestr Hygyrchedd. Mae'n gweithio gyda phob maint rhyngwyneb."
      ],
      [
        "Alla i chwarae heb lygoden na sgrin gyffwrdd?",
        "Gallwch, yn gyfan gwbl â'r bysellfwrdd, â phad gêm, neu â theclyn rheoli o bell Android TV."
      ],
      [
        "Ydy e'n gweithio gyda darllenydd sgrin?",
        "Ddim yn llawn eto. Mae cyhoeddiadau llais yn darllen digwyddiadau'r gêm yn uchel ac mae labeli ar y dewislenni, ond rhyngwyneb gweledol yw'r bwrdd pocer ei hun ac ni ellir ei chwarae â darllenydd sgrin yn unig eto."
      ],
      [
        "Ydy e am ddim?",
        "Ydy. Meddalwedd rydd a chod agored yw PokerTH, heb hysbysebion a heb bryniannau mewn-ap; arian chwarae yn unig yw'r holl sglodion."
      ]
    ]
  },
  da: {
    "title": "Tilgængelig poker — stor tekst, tastatur, gamepad | PokerTH",
    "desc": "Gratis Texas Hold’em med større tekst, høj kontrast, 4-farvede kortspil, bordlup, stemmeannonceringer og fuld styring med tastatur, gamepad og tv-fjernbetjening.",
    "ldHeadline": "Tilgængelig onlinepoker: stor tekst, høj kontrast, tastatur og gamepad",
    "ldDesc": "Tilgængelighedsfunktionerne i PokerTH-webklienten: størrelse på brugerflade, høj kontrast, 4-farvede kortspil, lup, stemmeannonceringer, tastatur, gamepad og tv-fjernbetjening.",
    "h1": "Tilgængelig poker: spil på din måde",
    "lead": "PokerTH er gratis Texas Hold’em i browseren, og det tilpasser sig den måde, du ser og spiller på: større tekst og knapper, stærkere kontrast, kortspil, der skelner kulørerne med farver, en lup til små skærme, stemmeannonceringer og fuld styring fra et tastatur, en gamepad eller en tv-fjernbetjening.",
    "findH2": "Hvor du finder det",
    "findP": "Knappen Tilgængelighed — person-ikonet øverst på alle skærme, fra loginskærmen til bordet — åbner de vigtigste indstillinger når som helst, også midt i en hånd. Alt andet ligger i Avancerede indstillinger. Dine valg huskes på enheden og følger dig til dine andre enheder, når du logger ind med en pokerth.net-konto.",
    "seeH2": "Se bordet",
    "see": [
      [
        "Størrelse på brugerflade",
        "Standard, Stor eller Ekstra stor: tekst, kort, jetoner og knapper vokser sammen — på loginskærmen, i lobbyen og ved bordet — og layoutet tilpasser sig, så det stadig er nemt at bruge på en telefon."
      ],
      [
        "Høj kontrast",
        "En palet med stærkere kontrast i hele brugerfladen, fra menuerne til bordet, ved alle størrelser på brugerfladen."
      ],
      [
        "4-farvede kortspil",
        "Kortspil, der giver hver kulør sin egen farve, så hjerter og ruder eller spar og klør aldrig kun skal skelnes på formen. Vælg et i Avancerede indstillinger → Stil."
      ],
      [
        "Bordlup",
        "På en telefon zoomer bordet til dobbelt størrelse og kan flyttes med en finger; visningen vender tilbage til din plads, når det er din tur. Browserens knibezoom kan også tillades."
      ],
      [
        "Lys, mørk eller automatisk",
        "Hele klienten følger dit valg eller dit systems, med temaer, kortspil og bordfarver, der passer til dine øjne."
      ]
    ],
    "keysH2": "Tastatur",
    "keysP": "Hver handling har sin tast. De officielle PokerTH-funktionstaster virker ved bordet — F1 til F4 for Fold, Check/Call, Bet/Raise og All-In, F5 for at vise dine kort, F6 til F8 for spilletilstandene — og webklienten tilføjer enkelte bogstaver (F, C, R, A samt 1, 2, 3 for en tredjedel af potten, halvdelen af potten eller hele potten), som alle kan omdefineres. Escape lukker det øverste vindue, Tab og piletasterne bevæger sig gennem lobbyens bordliste, og Alt+S åbner indstillingerne hvor som helst fra.",
    "padH2": "Gamepad og tv-fjernbetjening",
    "padP": "En spillecontroller — Xbox, PlayStation, Switch Pro og de fleste Bluetooth-controllere — styrer hele spillet: knapper til alle handlinger, triggere til at indstille indsatsen og en navigationstilstand til at bevæge sig rundt i skærmene, chatten og menuerne. Den vibrerer, når det bliver din tur. På Android TV og Google TV fungerer fjernbetjeningen på samme måde, og fjernbetjeninger med de fire farvede taster bruger dem til Fold, Check/Call, Bet/Raise og All-In.",
    "hearH2": "Hør og mærk spillet",
    "hearP": "Stemmeannonceringer læser spilbegivenhederne højt med enhedens egne stemmer, på dit sprog, hvis systemet har en stemme til det. På Android-telefoner markerer en kort vibration din tur. Spillydene er delt i fire grupper — handlinger, chat, netværksnotifikationer og blindforhøjelser — som kan slås til og fra hver for sig, med én lydstyrkeskyder.",
    "calmH2": "Færre overraskelser",
    "calmP": "Når dit system beder om reduceret bevægelse, dæmper klienten sine animationer. Kigge-beskyttelsen holder dine egne kort skjult, indtil du trykker på dem, og værnet mod utilsigtet Call låser kortvarigt Call-knappen lige efter en stor forhøjelse, så et tryk ment til et mindre Call ikke ved en fejl betaler det forhøjede beløb.",
    "langH2": "På dit sprog, med en guide",
    "langP": "Brugerfladen findes på {langs} sprog, fra højre mod venstre hvor det er nødvendigt. Med Essets hjælp forklarer esset, webklientens maskot, hver skærm undervejs, hvis du ønsker det, og »Hvad er det?« fortæller dig, hvad alt på skærmen gør.",
    "faqH2": "Spørgsmål",
    "faq": [
      [
        "Kan jeg gøre kortene og teksten større?",
        "Ja. Vælg Stor eller Ekstra stor i vinduet Tilgængelighed; kort, tekst og knapper vokser sammen på alle skærme, også ved bordet."
      ],
      [
        "Findes der en tilstand med høj kontrast?",
        "Ja, i vinduet Tilgængelighed. Den virker med alle størrelser på brugerfladen."
      ],
      [
        "Kan jeg spille uden mus eller berøringsskærm?",
        "Ja, helt med tastaturet, med en gamepad eller med en Android TV-fjernbetjening."
      ],
      [
        "Virker det med en skærmlæser?",
        "Ikke fuldt ud endnu. Stemmeannonceringer læser spilbegivenhederne højt, og menuerne har etiketter, men selve pokerbordet er en visuel brugerflade og kan endnu ikke spilles med en skærmlæser alene."
      ],
      [
        "Er det gratis?",
        "Ja. PokerTH er gratis open source-software uden reklamer og uden køb i appen; alle jetoner er legepenge."
      ]
    ]
  },
  de: {
    "title": "Barrierefreies Poker — große Schrift, Tastatur, Gamepad | PokerTH",
    "desc": "Kostenloses Texas Hold’em: größere Schrift, hoher Kontrast, 4-Farben-Decks, Tisch-Lupe, Sprachansagen und volle Steuerung per Tastatur, Gamepad und TV-Fernbedienung.",
    "ldHeadline": "Barrierefreies Online-Poker: große Schrift, hoher Kontrast, Tastatur und Gamepad",
    "ldDesc": "Die Barrierefreiheitsfunktionen des PokerTH-Webclients: Größe der Benutzeroberfläche, hoher Kontrast, 4-Farben-Decks, Lupe, Sprachansagen, Tastatur, Gamepad und TV-Fernbedienung.",
    "h1": "Barrierefreies Poker: spielen Sie auf Ihre Art",
    "lead": "PokerTH ist kostenloses Texas Hold’em im Browser und passt sich daran an, wie Sie sehen und spielen: größere Schrift und Schaltflächen, stärkerer Kontrast, Decks, die die Kartenfarben auch farblich unterscheiden, eine Lupe für kleine Bildschirme, Sprachansagen und vollständige Steuerung per Tastatur, Gamepad oder TV-Fernbedienung.",
    "findH2": "Wo Sie es finden",
    "findP": "Die Schaltfläche „Barrierefreiheit“ — das Personensymbol oben auf jedem Bildschirm, vom Anmeldebildschirm bis zum Tisch — öffnet die wichtigsten Einstellungen jederzeit, sogar mitten in einer Hand. Alles Weitere finden Sie in den Erweiterten Optionen. Ihre Auswahl wird auf dem Gerät gespeichert und folgt Ihnen, wenn Sie sich mit einem pokerth.net-Konto anmelden, auf Ihre anderen Geräte.",
    "seeH2": "Den Tisch gut sehen",
    "see": [
      [
        "Größe der Benutzeroberfläche",
        "Standard, Groß oder Sehr groß: Schrift, Karten, Chips und Schaltflächen wachsen gemeinsam, auf dem Anmeldebildschirm, in der Lobby und am Tisch, und das Layout ordnet sich neu an, damit es auch auf dem Handy bedienbar bleibt."
      ],
      [
        "Hoher Kontrast",
        "Eine kontrastreichere Farbpalette für die gesamte Oberfläche, von den Menüs bis zum Tisch, in jeder Größe der Benutzeroberfläche."
      ],
      [
        "4-Farben-Decks",
        "Kartendecks, in denen jede Kartenfarbe ihre eigene Farbe hat, sodass Sie Herz und Karo oder Pik und Kreuz nie allein an der Form unterscheiden müssen. Wählen Sie eines unter Erweiterte Optionen → Stil."
      ],
      [
        "Tisch-Lupe",
        "Auf dem Handy wird der Tisch auf doppelte Größe gezoomt und lässt sich mit dem Finger verschieben; die Ansicht kehrt zu Ihrem Platz zurück, wenn Sie am Zug sind. Auch der Pinch-Zoom des Browsers lässt sich erlauben."
      ],
      [
        "Hell, dunkel oder automatisch",
        "Der ganze Client folgt Ihrer Wahl oder der Ihres Systems, mit Themes, Decks und Tischfarben, die Ihren Augen guttun."
      ]
    ],
    "keysH2": "Tastatur",
    "keysP": "Jede Aktion hat eine Taste. Die offiziellen PokerTH-Funktionstasten funktionieren am Tisch — F1 bis F4 für Fold, Check/Call, Bet/Raise und All-In, F5, um Ihre Karten zu zeigen, F6 bis F8 für die Spielmodi —, und der Webclient ergänzt einzelne Buchstaben (F, C, R, A sowie 1, 2, 3 für ein Drittel des Pots, den halben Pot oder den Pot), die sich alle neu belegen lassen. Escape schließt das oberste Fenster, Tab und die Pfeiltasten bewegen sich durch die Spieleliste der Lobby, und Alt+S öffnet die Einstellungen von überall.",
    "padH2": "Gamepad und TV-Fernbedienung",
    "padP": "Mit einem Controller — Xbox, PlayStation, Switch Pro und die meisten Bluetooth-Controller — spielen Sie das ganze Spiel: Tasten für jede Aktion, Trigger zum Einstellen des Einsatzes und ein Navigationsmodus, um sich durch die Bildschirme, den Chat und die Menüs zu bewegen. Er vibriert, wenn Sie an der Reihe sind. Auf Android TV und Google TV funktioniert die Fernbedienung genauso, und Fernbedienungen mit den vier Farbtasten nutzen diese für Fold, Check/Call, Bet/Raise und All-In.",
    "hearH2": "Das Spiel hören und spüren",
    "hearP": "Sprachansagen lesen die Spielereignisse mit den Stimmen Ihres Geräts vor, in Ihrer Sprache, sofern das System eine solche Stimme hat. Auf Android-Handys zeigt eine kurze Vibration an, dass Sie am Zug sind. Die Spielsounds sind in vier Gruppen eingeteilt — Aktionen, Chat, Netzwerkhinweise und Blind-Erhöhungen —, die sich einzeln ein- und ausschalten lassen, mit einem einzigen Lautstärkeregler.",
    "calmH2": "Weniger Überraschungen",
    "calmP": "Wenn Ihr System reduzierte Bewegung anfordert, schwächt der Client seine Animationen ab. Der Anti-Spick-Schutz hält Ihre eigenen Karten verdeckt, bis Sie sie antippen, und der Schutz vor versehentlichem Call sperrt die Call-Schaltfläche kurz nach einer großen Erhöhung, damit ein Tippen, das einem kleineren Call galt, nicht versehentlich den erhöhten Betrag bezahlt.",
    "langH2": "In Ihrer Sprache, mit einem Begleiter",
    "langP": "Die Oberfläche gibt es in {langs} Sprachen, wo nötig von rechts nach links. Die Ass-Hilfe — das Ass ist das Maskottchen des Webclients — erklärt Ihnen auf Wunsch jeden Bildschirm, während Sie spielen, und „Was ist das?“ sagt Ihnen, wozu jedes Element auf dem Bildschirm dient.",
    "faqH2": "Fragen",
    "faq": [
      [
        "Kann ich Karten und Schrift vergrößern?",
        "Ja. Wählen Sie Groß oder Sehr groß im Fenster Barrierefreiheit; Karten, Schrift und Schaltflächen wachsen auf jedem Bildschirm gemeinsam, auch am Tisch."
      ],
      [
        "Gibt es einen Modus mit hohem Kontrast?",
        "Ja, im Fenster Barrierefreiheit. Er funktioniert mit jeder Größe der Benutzeroberfläche."
      ],
      [
        "Kann ich ohne Maus oder Touchscreen spielen?",
        "Ja, vollständig mit der Tastatur, mit einem Gamepad oder mit einer Android-TV-Fernbedienung."
      ],
      [
        "Funktioniert es mit einem Screenreader?",
        "Noch nicht vollständig. Sprachansagen lesen die Spielereignisse vor, und die Menüs sind beschriftet, aber der Pokertisch selbst ist eine visuelle Oberfläche und lässt sich noch nicht allein mit einem Screenreader spielen."
      ],
      [
        "Ist es kostenlos?",
        "Ja. PokerTH ist freie Open-Source-Software, ohne Werbung und ohne In-App-Käufe; alle Chips sind Spielgeld."
      ]
    ]
  },
  el: {
    "title": "Προσβάσιμο πόκερ — μεγάλα γράμματα, πληκτρολόγιο, gamepad | PokerTH",
    "desc": "Δωρεάν Texas Hold’em: μεγάλα γράμματα, υψηλή αντίθεση, τράπουλες 4 χρωμάτων, μεγεθυντικός φακός, φωνητικές ανακοινώσεις, πληκτρολόγιο, χειριστήριο και τηλεχειριστήριο.",
    "ldHeadline": "Προσβάσιμο online πόκερ: μεγάλα γράμματα, υψηλή αντίθεση, πληκτρολόγιο και χειριστήριο",
    "ldDesc": "Οι λειτουργίες προσβασιμότητας της web εφαρμογής PokerTH: μέγεθος διεπαφής, υψηλή αντίθεση, τράπουλες 4 χρωμάτων, μεγεθυντικός φακός, φωνητικές ανακοινώσεις, πληκτρολόγιο, χειριστήριο και τηλεχειριστήριο τηλεόρασης.",
    "h1": "Προσβάσιμο πόκερ: παίξτε με τον δικό σας τρόπο",
    "lead": "Το PokerTH είναι δωρεάν Texas Hold’em στον περιηγητή και προσαρμόζεται στον τρόπο που βλέπετε και παίζετε: μεγαλύτερα γράμματα και κουμπιά, πιο έντονη αντίθεση, τράπουλες που δίνουν σε κάθε σύμβολο το δικό του χρώμα, μεγεθυντικός φακός για μικρές οθόνες, φωνητικές ανακοινώσεις και πλήρης έλεγχος από πληκτρολόγιο, χειριστήριο ή τηλεχειριστήριο τηλεόρασης.",
    "findH2": "Πού θα το βρείτε",
    "findP": "Το κουμπί Προσβασιμότητα — το εικονίδιο με το ανθρωπάκι στο πάνω μέρος κάθε οθόνης, από την οθόνη σύνδεσης ως το τραπέζι — ανοίγει τις βασικές ρυθμίσεις οποιαδήποτε στιγμή, ακόμη και στη μέση ενός χεριού. Όλα τα υπόλοιπα βρίσκονται στις Σύνθετες επιλογές. Οι επιλογές σας αποθηκεύονται στη συσκευή και, όταν συνδέεστε με λογαριασμό pokerth.net, σας ακολουθούν και στις άλλες συσκευές σας.",
    "seeH2": "Βλέποντας το τραπέζι",
    "see": [
      [
        "Μέγεθος διεπαφής",
        "Τυπικό, Μεγάλο ή Πολύ μεγάλο: γράμματα, φύλλα, μάρκες και κουμπιά μεγαλώνουν μαζί, στην οθόνη σύνδεσης, στο λόμπι και στο τραπέζι, και η διάταξη αναδιατάσσεται ώστε να μένει εύχρηστη και σε κινητό."
      ],
      [
        "Υψηλή αντίθεση",
        "Μια παλέτα με πιο έντονη αντίθεση σε όλη τη διεπαφή, από τα μενού ως το τραπέζι, σε κάθε μέγεθος διεπαφής."
      ],
      [
        "Τράπουλες 4 χρωμάτων",
        "Τράπουλες που δίνουν σε κάθε σύμβολο το δικό του χρώμα, ώστε κούπες και καρά, ή μπαστούνια και σπαθιά, να μην ξεχωρίζουν ποτέ μόνο από το σχήμα. Διαλέξτε μία στις Σύνθετες επιλογές → Στυλ."
      ],
      [
        "Μεγεθυντικός φακός τραπεζιού",
        "Σε κινητό, το τραπέζι μεγεθύνεται στο διπλάσιο και μετακινείται με το δάχτυλο· η προβολή επιστρέφει στη θέση σας όταν είναι η σειρά σας. Μπορεί επίσης να επιτραπεί το ζουμ με τσίμπημα του περιηγητή."
      ],
      [
        "Φωτεινό, σκοτεινό ή αυτόματο",
        "Όλη η εφαρμογή ακολουθεί τη δική σας επιλογή ή του συστήματός σας, με θέματα, τράπουλες και χρώματα τραπεζιού που ταιριάζουν στα μάτια σας."
      ]
    ],
    "keysH2": "Πληκτρολόγιο",
    "keysP": "Κάθε ενέργεια έχει το πλήκτρο της. Τα επίσημα πλήκτρα λειτουργιών του PokerTH δουλεύουν στο τραπέζι — F1 έως F4 για Fold, Check/Call, Bet/Raise και All-In, F5 για να δείξετε τα φύλλα σας, F6 έως F8 για τις λειτουργίες παιχνιδιού — και η web εφαρμογή προσθέτει μεμονωμένα γράμματα (F, C, R, A, και 1, 2, 3 για το ένα τρίτο του πότ, το μισό πότ ή ολόκληρο το πότ), που όλα μπορούν να αντιστοιχιστούν ξανά. Το Esc κλείνει το παράθυρο που βρίσκεται από πάνω, το Tab και τα βέλη κινούνται στη λίστα τραπεζιών του λόμπι, και το Alt+S ανοίγει τις ρυθμίσεις από παντού.",
    "padH2": "Χειριστήριο και τηλεχειριστήριο τηλεόρασης",
    "padP": "Ένα χειριστήριο παιχνιδιών — Xbox, PlayStation, Switch Pro και τα περισσότερα χειριστήρια Bluetooth — παίζει όλο το παιχνίδι: κουμπιά για κάθε ενέργεια, σκανδάλες για το ποσό του πονταρίσματος και λειτουργία Πλοήγησης για να κινείστε στις οθόνες, στη συνομιλία και στα μενού. Δονείται όταν έρχεται η σειρά σας. Σε Android TV και Google TV το τηλεχειριστήριο λειτουργεί με τον ίδιο τρόπο, και τα τηλεχειριστήρια με τα τέσσερα χρωματιστά πλήκτρα τα χρησιμοποιούν για Fold, Check/Call, Bet/Raise και All-In.",
    "hearH2": "Ακούστε και νιώστε το παιχνίδι",
    "hearP": "Οι φωνητικές ανακοινώσεις διαβάζουν δυνατά τα γεγονότα του παιχνιδιού με τις φωνές της ίδιας της συσκευής σας, στη γλώσσα σας όταν το σύστημα διαθέτει φωνή γι’ αυτήν. Σε κινητά Android μια σύντομη δόνηση σημαίνει τη σειρά σας. Οι ήχοι του παιχνιδιού χωρίζονται σε τέσσερις ομάδες — ενέργειες, συνομιλία, ειδοποιήσεις δικτύου και αυξήσεις των blinds — που ενεργοποιούνται ή απενεργοποιούνται χωριστά, με ένα ρυθμιστικό έντασης.",
    "calmH2": "Λιγότερες εκπλήξεις",
    "calmP": "Όταν το σύστημά σας ζητά μειωμένη κίνηση, η εφαρμογή περιορίζει τα κινούμενα εφέ της. Η προστασία από κρυφοκοίταγμα κρατά τα φύλλα σας κρυμμένα ώσπου να τα αγγίξετε, και η προστασία από τυχαίο Call κλειδώνει για λίγο το κουμπί Call αμέσως μετά από μεγάλο ανέβασμα, ώστε ένα άγγιγμα προορισμένο για μικρότερο Call να μην πληρώσει κατά λάθος το ανεβασμένο ποσό.",
    "langH2": "Στη γλώσσα σας, με οδηγό",
    "langP": "Η διεπαφή είναι διαθέσιμη σε {langs} γλώσσες, από τα δεξιά προς τα αριστερά όπου χρειάζεται. Με τη Βοήθεια του Άσου, ο Άσος — η μασκότ της web εφαρμογής — εξηγεί κάθε οθόνη καθώς προχωράτε, αν το θέλετε, και το «Τι είναι αυτό;» σας λέει τι κάνει οτιδήποτε βρίσκεται στην οθόνη.",
    "faqH2": "Ερωτήσεις",
    "faq": [
      [
        "Μπορώ να μεγαλώσω τα φύλλα και τα γράμματα;",
        "Ναι. Επιλέξτε Μεγάλο ή Πολύ μεγάλο στο παράθυρο Προσβασιμότητα· φύλλα, γράμματα και κουμπιά μεγαλώνουν μαζί σε κάθε οθόνη, και στο τραπέζι."
      ],
      [
        "Υπάρχει λειτουργία υψηλής αντίθεσης;",
        "Ναι, στο παράθυρο Προσβασιμότητα. Λειτουργεί με κάθε μέγεθος διεπαφής."
      ],
      [
        "Μπορώ να παίξω χωρίς ποντίκι ή οθόνη αφής;",
        "Ναι, αποκλειστικά με πληκτρολόγιο, με χειριστήριο ή με τηλεχειριστήριο Android TV."
      ],
      [
        "Λειτουργεί με αναγνώστη οθόνης;",
        "Όχι πλήρως ακόμη. Οι φωνητικές ανακοινώσεις διαβάζουν δυνατά τα γεγονότα του παιχνιδιού και τα μενού έχουν ετικέτες, αλλά το ίδιο το τραπέζι του πόκερ είναι οπτική διεπαφή και δεν μπορεί ακόμη να παιχτεί μόνο με αναγνώστη οθόνης."
      ],
      [
        "Είναι δωρεάν;",
        "Ναι. Το PokerTH είναι δωρεάν λογισμικό ανοιχτού κώδικα, χωρίς διαφημίσεις και χωρίς αγορές εντός εφαρμογής· όλες οι μάρκες είναι εικονικές."
      ]
    ]
  },
  eo: {
    "title": "Alirebla pokero — granda teksto, klavaro, ludregilo | PokerTH",
    "desc": "Senpaga Texas Hold’em: pli granda teksto, alta kontrasto, kvarkoloraj kartaroj, lupeo, voĉaj anoncoj kaj plena ludado per klavaro, ludregilo kaj teleregilo.",
    "ldHeadline": "Alirebla reta pokero: granda teksto, alta kontrasto, klavaro kaj ludregilo",
    "ldDesc": "La alireblecaj funkcioj de la retkliento PokerTH: grando de la interfaco, alta kontrasto, kvarkoloraj kartaroj, lupeo, voĉaj anoncoj, klavaro, ludregilo kaj televida teleregilo.",
    "h1": "Alirebla pokero: ludu laŭ via maniero",
    "lead": "PokerTH estas senpaga Texas Hold’em en la retumilo, kaj ĝi adaptiĝas al la maniero, kiel vi vidas kaj ludas: pli granda teksto kaj butonoj, pli forta kontrasto, kartaroj kiuj distingas la kartkolorojn per koloro, lupeo por malgrandaj ekranoj, voĉaj anoncoj, kaj plena regado per klavaro, ludregilo aŭ televida teleregilo.",
    "findH2": "Kie trovi ĝin",
    "findP": "La butono Alirebleco — la persona piktogramo supre de ĉiu ekrano, de la ensaluta ekrano ĝis la tablo — malfermas la ĉefajn agordojn iam ajn, eĉ meze de mano. Ĉio alia troviĝas en la Altnivelaj opcioj. Viaj elektoj estas memorataj en la aparato kaj, kiam vi ensalutas per konto de pokerth.net, sekvas vin al viaj aliaj aparatoj.",
    "seeH2": "Vidi la tablon",
    "see": [
      [
        "Grando de la interfaco",
        "Norma, Granda aŭ Tre granda: teksto, kartoj, ĵetonoj kaj butonoj kreskas kune, sur la ensaluta ekrano, en la vestiblo kaj ĉe la tablo, kaj la aranĝo reordiĝas por resti uzebla en telefono."
      ],
      [
        "Alta kontrasto",
        "Pli kontrasta paletro tra la tuta interfaco, de la menuoj ĝis la tablo, ĉe ĉiu grando de la interfaco."
      ],
      [
        "Kvarkoloraj kartaroj",
        "Kartaroj, kiuj donas al ĉiu kartkoloro sian propran koloron, tiel ke keroj kaj karooj, aŭ pikoj kaj trefoj, neniam distingiĝas nur per formo. Elektu unu en Altnivelaj opcioj → Stilo."
      ],
      [
        "Tabla lupeo",
        "En telefono, la tablo zomiĝas al duobla grando kaj ŝoviĝas per fingro; la vido revenas al via sidloko kiam estas via vico. Ankaŭ la pinĉa zomo de la retumilo povas esti permesita."
      ],
      [
        "Hela, malhela aŭ aŭtomata",
        "La tuta kliento sekvas vian elekton aŭ tiun de via sistemo, kun etosoj, kartaroj kaj tablokoloroj laŭ viaj okuloj."
      ]
    ],
    "keysH2": "Klavaro",
    "keysP": "Ĉiu ago havas klavon. La oficialaj funkciklavoj de PokerTH funkcias ĉe la tablo — F1 ĝis F4 por Fold, Check/Call, Bet/Raise kaj All-In, F5 por montri viajn kartojn, F6 ĝis F8 por la ludreĝimoj — kaj la retkliento aldonas unuopajn literojn (F, C, R, A, kaj 1, 2, 3 por triono de la poto, duono de la poto aŭ la tuta poto), ĉiuj reasigneblaj. Esc fermas la supran fenestron, Tab kaj la sagoklavoj trairas la tabloliston de la vestiblo, kaj Alt+S malfermas la agordojn de ie ajn.",
    "padH2": "Ludregilo kaj televida teleregilo",
    "padP": "Ludregilo — Xbox, PlayStation, Switch Pro kaj la plej multaj Bluetooth-regiloj — ludas la tutan ludon: butonoj por ĉiu ago, ellasiloj por agordi la veton, kaj navigada reĝimo por moviĝi tra la ekranoj, la babilado kaj la menuoj. Ĝi vibras kiam venas via vico. Ĉe Android TV kaj Google TV la teleregilo funkcias same, kaj teleregiloj kun la kvar koloraj klavoj uzas ilin por Fold, Check/Call, Bet/Raise kaj All-In.",
    "hearH2": "Aŭdi kaj senti la ludon",
    "hearP": "Voĉaj anoncoj laŭtlegas la ludokazaĵojn per la propraj voĉoj de via aparato, en via lingvo kiam la sistemo havas tian. Ĉe Android-telefonoj mallonga vibrado signalas vian vicon. La ludsonoj estas en kvar grupoj — agoj, babilado, retaj sciigoj kaj plialtigoj de blindoj — kiujn oni povas ŝalti aŭ malŝalti aparte, kun unu laŭteca ŝovilo.",
    "calmH2": "Malpli da surprizoj",
    "calmP": "Kiam via sistemo petas malpli da movado, la kliento mildigas siajn animaciojn. Anti-peek tenas viajn proprajn kartojn kaŝitaj ĝis vi tuŝas ilin, kaj la protekto kontraŭ hazarda call momente blokas la butonon Call tuj post granda raise, por ke tuŝo celita al pli malgranda call ne erare pagu la plialtigitan sumon.",
    "langH2": "En via lingvo, kun gvidanto",
    "langP": "La interfaco haveblas en {langs} lingvoj, de dekstre maldekstren kie necese. Helpo de la Aso, la maskoto de la retkliento, klarigas ĉiun ekranon dum vi progresas, se vi deziras, kaj “Kio estas tio?” diras al vi, kion faras io ajn sur la ekrano.",
    "faqH2": "Demandoj",
    "faq": [
      [
        "Ĉu mi povas pligrandigi la kartojn kaj la tekston?",
        "Jes. Elektu Granda aŭ Tre granda en la fenestro Alirebleco; kartoj, teksto kaj butonoj kreskas kune sur ĉiu ekrano, inkluzive de la tablo."
      ],
      [
        "Ĉu ekzistas alt-kontrasta reĝimo?",
        "Jes, en la fenestro Alirebleco. Ĝi funkcias kun ĉiu grando de la interfaco."
      ],
      [
        "Ĉu mi povas ludi sen muso aŭ tuŝekrano?",
        "Jes, tute per la klavaro, per ludregilo aŭ per teleregilo de Android TV."
      ],
      [
        "Ĉu ĝi funkcias kun ekranlegilo?",
        "Ankoraŭ ne plene. Voĉaj anoncoj laŭtlegas la ludokazaĵojn kaj la menuoj havas etikedojn, sed la pokera tablo mem estas vida interfaco kaj ankoraŭ ne ludeblas per ekranlegilo sola."
      ],
      [
        "Ĉu ĝi estas senpaga?",
        "Jes. PokerTH estas libera kaj malfermitkoda programo, sen reklamoj kaj sen enaplikaj aĉetoj; ĉiuj ĵetonoj estas ludmono."
      ]
    ]
  },
  es: {
    "title": "Póker accesible — letra grande, teclado y mando | PokerTH",
    "desc": "Texas Hold’em gratis con letra más grande, contraste alto, barajas de cuatro colores, lupa, anuncios de voz y control total con teclado, mando o mando de la TV.",
    "ldHeadline": "Póker online accesible: letra grande, contraste alto, teclado y mando",
    "ldDesc": "Las funciones de accesibilidad del cliente web de PokerTH: tamaño de la interfaz, contraste alto, barajas de cuatro colores, lupa, anuncios de voz, teclado, mando y mando a distancia de la TV.",
    "h1": "Póker accesible: juega a tu manera",
    "lead": "PokerTH es Texas Hold’em gratis en el navegador, y se adapta a tu forma de ver y de jugar: textos y botones más grandes, más contraste, barajas que distinguen los palos por color, una lupa para pantallas pequeñas, anuncios de voz y control total con el teclado, un mando o el mando a distancia de la TV.",
    "findH2": "Dónde encontrarlo",
    "findP": "El botón Accesibilidad — el icono de persona en la parte superior de cada pantalla, desde la pantalla de conexión hasta la mesa — abre los ajustes principales en cualquier momento, incluso en mitad de una mano. Todo lo demás está en las Opciones avanzadas. Tus elecciones se guardan en el dispositivo y, cuando inicias sesión con una cuenta de pokerth.net, te siguen a tus otros dispositivos.",
    "seeH2": "Ver la mesa",
    "see": [
      [
        "Tamaño de la interfaz",
        "Estándar, Grande o Extragrande: textos, cartas, fichas y botones crecen a la vez, en la pantalla de conexión, en el lobby y en la mesa, y el diseño se reorganiza para seguir siendo cómodo en un teléfono."
      ],
      [
        "Contraste alto",
        "Una paleta con más contraste en toda la interfaz, de los menús a la mesa, con cualquier tamaño de la interfaz."
      ],
      [
        "Barajas de cuatro colores",
        "Barajas que dan a cada palo su propio color, para que corazones y diamantes, o picas y tréboles, nunca se distingan solo por la forma. Elige una en Opciones avanzadas → Estilo."
      ],
      [
        "Lupa de la mesa",
        "En el teléfono, la mesa se amplía al doble y se desplaza con el dedo; la vista vuelve a tu asiento cuando es tu turno. También se puede permitir el zoom por pellizco del navegador."
      ],
      [
        "Claro, oscuro o automático",
        "Todo el cliente sigue tu elección o la de tu sistema, con temas, barajas y colores de mesa a la medida de tu vista."
      ]
    ],
    "keysH2": "Teclado",
    "keysP": "Cada acción tiene su tecla. Las teclas de función oficiales de PokerTH funcionan en la mesa — F1 a F4 para Fold, Check/Call, Bet/Raise y All-In, F5 para mostrar tus cartas, F6 a F8 para los modos de juego — y el cliente web añade letras sueltas (F, C, R, A, y 1, 2, 3 para un tercio del bote, medio bote o el bote), todas reasignables. Escape cierra la ventana en primer plano, Tab y las flechas recorren la lista de mesas del lobby, y Alt+S abre los ajustes desde cualquier parte.",
    "padH2": "Mando y mando a distancia de la TV",
    "padP": "Un mando de juego — Xbox, PlayStation, Switch Pro y la mayoría de los mandos Bluetooth — controla toda la partida: botones para cada acción, gatillos para ajustar la apuesta y un modo de navegación para moverse por las pantallas, el chat y los menús. Vibra cuando llega tu turno. En Android TV y Google TV el mando a distancia funciona igual, y los mandos con las cuatro teclas de color las usan para Fold, Check/Call, Bet/Raise y All-In.",
    "hearH2": "Oír y sentir la partida",
    "hearP": "Los anuncios de voz leen en voz alta los eventos del juego con las voces de tu propio dispositivo, en tu idioma si el sistema dispone de él. En los teléfonos Android, una breve vibración marca tu turno. Los sonidos del juego se dividen en cuatro grupos — acciones, chat, avisos de red y subidas de ciegas — que se activan o desactivan por separado, con un único control de volumen.",
    "calmH2": "Menos sobresaltos",
    "calmP": "Cuando tu sistema pide reducir el movimiento, el cliente suaviza sus animaciones. La anti-miradas mantiene tus propias cartas ocultas hasta que las tocas, y la guarda contra Call accidental bloquea brevemente el botón Call justo después de una gran subida, para que un toque pensado para un Call más pequeño no pague por error el importe subido.",
    "langH2": "En tu idioma, con un guía",
    "langP": "La interfaz está disponible en {langs} idiomas, de derecha a izquierda cuando hace falta. Con la Ayuda del As, el As — la mascota del cliente web — te explica cada pantalla sobre la marcha si lo deseas, y «¿Qué es esto?» te dice para qué sirve cualquier cosa de la pantalla.",
    "faqH2": "Preguntas",
    "faq": [
      [
        "¿Puedo agrandar las cartas y el texto?",
        "Sí. Elige Grande o Extragrande en la ventana Accesibilidad; cartas, texto y botones crecen a la vez en todas las pantallas, incluida la mesa."
      ],
      [
        "¿Hay un modo de contraste alto?",
        "Sí, en la ventana Accesibilidad. Funciona con cualquier tamaño de la interfaz."
      ],
      [
        "¿Puedo jugar sin ratón ni pantalla táctil?",
        "Sí, por completo con el teclado, con un mando o con el mando a distancia de una Android TV."
      ],
      [
        "¿Funciona con un lector de pantalla?",
        "Todavía no del todo. Los anuncios de voz leen en voz alta los eventos del juego y los menús llevan etiquetas, pero la mesa de póker en sí es una interfaz visual y todavía no se puede jugar solo con un lector de pantalla."
      ],
      [
        "¿Es gratis?",
        "Sí. PokerTH es software libre y de código abierto, sin anuncios ni compras dentro de la aplicación; todas las fichas son dinero ficticio."
      ]
    ]
  },
  "es-419": {
    "title": "Póker accesible — letra grande, teclado, mando | PokerTH",
    "desc": "Texas Hold’em gratis con letra más grande, contraste alto, barajas de cuatro colores, lupa de mesa, anuncios de voz y juego completo con teclado, mando o control de TV.",
    "ldHeadline": "Póker en línea accesible: letra grande, contraste alto, teclado y mando",
    "ldDesc": "Las funciones de accesibilidad del cliente web de PokerTH: tamaño de la interfaz, contraste alto, barajas de cuatro colores, lupa, anuncios de voz, teclado, mando y mando a distancia de TV.",
    "h1": "Póker accesible: juega a tu manera",
    "lead": "PokerTH es Texas Hold’em gratis en el navegador, y se adapta a tu forma de ver y de jugar: textos y botones más grandes, más contraste, barajas que distinguen los palos por color, una lupa para pantallas pequeñas, anuncios de voz y control completo con teclado, mando de juego o mando a distancia de TV.",
    "findH2": "Dónde encontrarlo",
    "findP": "El botón Accesibilidad — el ícono de persona en la parte superior de cada pantalla, desde la pantalla de conexión hasta la mesa — abre los ajustes principales en cualquier momento, incluso en medio de una mano. Todo lo demás está en Opciones avanzadas. Tus elecciones se recuerdan en el dispositivo y, cuando inicias sesión con una cuenta de pokerth.net, te siguen a tus otros dispositivos.",
    "seeH2": "Ver bien la mesa",
    "see": [
      [
        "Tamaño de la interfaz",
        "Estándar, Grande o Extragrande: texto, cartas, fichas y botones crecen juntos, en la pantalla de conexión, en el lobby y en la mesa, y el diseño se reacomoda para seguir siendo cómodo en el celular."
      ],
      [
        "Contraste alto",
        "Una paleta de mayor contraste en toda la interfaz, desde los menús hasta la mesa, con cualquier tamaño de la interfaz."
      ],
      [
        "Barajas de cuatro colores",
        "Barajas que dan a cada palo su propio color, para que corazones y diamantes, o picas y tréboles, nunca tengan que distinguirse solo por la forma. Elige una en Opciones avanzadas → Estilo."
      ],
      [
        "Lupa de la mesa",
        "En el celular, la mesa se amplía al doble de su tamaño y se desplaza con el dedo; la vista vuelve a tu asiento cuando es tu turno. También se puede permitir el zoom del navegador con dos dedos."
      ],
      [
        "Claro, oscuro o automático",
        "Todo el cliente sigue tu elección o la de tu sistema, con temas, barajas y colores de mesa a la medida de tus ojos."
      ]
    ],
    "keysH2": "Teclado",
    "keysP": "Cada acción tiene su tecla. Las teclas de función oficiales de PokerTH funcionan en la mesa — de F1 a F4 para Fold, Check/Call, Bet/Raise y All-In, F5 para mostrar tus cartas, de F6 a F8 para los modos de juego — y el cliente web agrega letras sueltas (F, C, R, A, y 1, 2, 3 para un tercio del pozo, la mitad del pozo o el pozo), todas reasignables. Esc cierra la ventana de arriba, Tab y las flechas recorren la lista de mesas del lobby, y Alt+S abre los ajustes desde cualquier lugar.",
    "padH2": "Mando de juego y mando a distancia de TV",
    "padP": "Un mando de juego — Xbox, PlayStation, Switch Pro y la mayoría de mandos Bluetooth — permite jugar la partida entera: botones para cada acción, gatillos para fijar la apuesta y un modo de navegación para moverte por las pantallas, el chat y los menús. Vibra cuando llega tu turno. En Android TV y Google TV el mando a distancia funciona igual, y los mandos con las cuatro teclas de colores las usan para Fold, Check/Call, Bet/Raise y All-In.",
    "hearH2": "Oír y sentir el juego",
    "hearP": "Los anuncios de voz leen en voz alta los eventos del juego con las voces de tu propio dispositivo, en tu idioma si el sistema tiene una. En los teléfonos Android, una breve vibración marca tu turno. Los sonidos del juego se dividen en cuatro grupos — acciones, chat, avisos de red y subidas de ciegas — que se pueden activar o desactivar por separado, con un solo control de volumen.",
    "calmH2": "Menos sorpresas",
    "calmP": "Cuando tu sistema pide reducir el movimiento, el cliente suaviza sus animaciones. La anti-miradas mantiene tus propias cartas ocultas hasta que las tocas, y la guarda contra Call accidental bloquea brevemente el botón Call justo después de una subida grande, para que un toque destinado a un Call más pequeño no pueda pagar por error el importe subido.",
    "langH2": "En tu idioma, con un guía",
    "langP": "La interfaz está disponible en {langs} idiomas, de derecha a izquierda cuando hace falta. La Ayuda del As, la mascota del cliente web, te explica cada pantalla sobre la marcha si quieres, y «¿Qué es esto?» te dice para qué sirve cualquier cosa de la pantalla.",
    "faqH2": "Preguntas",
    "faq": [
      [
        "¿Puedo agrandar las cartas y el texto?",
        "Sí. Elige Grande o Extragrande en la ventana Accesibilidad; cartas, texto y botones crecen juntos en todas las pantallas, incluida la mesa."
      ],
      [
        "¿Hay un modo de contraste alto?",
        "Sí, en la ventana Accesibilidad. Funciona con cualquier tamaño de la interfaz."
      ],
      [
        "¿Puedo jugar sin mouse ni pantalla táctil?",
        "Sí, por completo con el teclado, con un mando de juego o con el mando a distancia de Android TV."
      ],
      [
        "¿Funciona con un lector de pantalla?",
        "Todavía no del todo. Los anuncios de voz leen en voz alta los eventos del juego y los menús tienen etiquetas, pero la mesa de póker en sí es una interfaz visual y todavía no se puede jugar solo con un lector de pantalla."
      ],
      [
        "¿Es gratis?",
        "Sí. PokerTH es software gratuito y de código abierto, sin anuncios ni compras dentro de la app; todas las fichas son dinero de juego."
      ]
    ]
  },
  et: {
    "title": "Juurdepääsetav pokker — suur tekst, klaviatuur, mängupult | PokerTH",
    "desc": "Tasuta Texas Hold’em: suurem tekst, kõrge kontrast, neljavärvilised kaardipakid, laua suurendus, hääleteated ning mäng klaviatuuri, mängupuldi või teleripuldiga.",
    "ldHeadline": "Juurdepääsetav online-pokker: suur tekst, kõrge kontrast, klaviatuur ja mängupult",
    "ldDesc": "PokerTH veebikliendi juurdepääsetavuse funktsioonid: liidese suurus, kõrge kontrast, neljavärvilised kaardipakid, suurendus, hääleteated, klaviatuur, mängupult ja teleri kaugjuhtimispult.",
    "h1": "Juurdepääsetav pokker: mängi omal moel",
    "lead": "PokerTH on tasuta Texas Hold’em brauseris ja see kohandub sellega, kuidas sa näed ja mängid: suurem tekst ja nupud, tugevam kontrast, kaardipakid, mis eristavad maste värvi järgi, suurendus väikestele ekraanidele, hääleteated ning täielik juhtimine klaviatuuri, mängupuldi või teleri kaugjuhtimispuldiga.",
    "findH2": "Kust see leida",
    "findP": "Nupp Juurdepääsetavus — inimese ikoon iga ekraani ülaosas, sisselogimise ekraanist kuni lauani — avab põhiseaded igal ajal, isegi keset kätt. Kõik muu on menüüs Täpsemad valikud. Sinu valikud jäetakse seadmes meelde ja kui logid sisse pokerth.net kontoga, järgnevad need sulle ka teistesse seadmetesse.",
    "seeH2": "Laud hästi näha",
    "see": [
      [
        "Liidese suurus",
        "Tavaline, Suur või Väga suur: tekst, kaardid, žetoonid ja nupud kasvavad koos sisselogimise ekraanil, fuajees ja laua taga ning paigutus kohandub, et jääda ka telefonis kasutatavaks."
      ],
      [
        "Kõrge kontrast",
        "Tugevama kontrastiga palett kogu liideses, menüüdest lauani, iga liidese suuruse juures."
      ],
      [
        "Neljavärvilised kaardipakid",
        "Kaardipakid, kus igal mastil on oma värv, nii et ärtut ja ruutu või potti ja risti ei pea kunagi eristama ainult kuju järgi. Vali üks menüüs Täpsemad valikud → Stiil."
      ],
      [
        "Laua suurendus",
        "Telefonis suurendatakse lauda kaks korda ja seda saab sõrmega liigutada; kui on sinu kord, naaseb vaade sinu istekohale. Lubada saab ka brauseri näpistussuumi."
      ],
      [
        "Hele, tume või automaatne",
        "Kogu klient järgib sinu või süsteemi valikut, teemade, kaardipakkide ja lauavärvidega, mis sobivad sinu silmadele."
      ]
    ],
    "keysH2": "Klaviatuur",
    "keysP": "Igal käigul on oma klahv. Laua taga töötavad ametlikud PokerTH funktsiooniklahvid — F1 kuni F4 Fold, Check/Call, Bet/Raise ja All-In jaoks, F5 oma kaartide näitamiseks, F6 kuni F8 mänguviiside jaoks — ning veebiklient lisab üksiktähed (F, C, R, A ning 1, 2, 3 kolmandiku poti, poole poti või terve poti jaoks), mida kõiki saab ümber seadistada. Escape sulgeb pealmise akna, Tab ja nooleklahvid liiguvad fuajee laudade loendis ning Alt+S avab seaded kõikjalt.",
    "padH2": "Mängupult ja teleripult",
    "padP": "Mängupult — Xbox, PlayStation, Switch Pro ja enamik Bluetoothi pulte — mängib kogu mängu: nupud iga käigu jaoks, päästikud panuse seadmiseks ja navigeerimisrežiim ekraanidel, vestluses ja menüüdes liikumiseks. Kui tuleb sinu kord, see vibreerib. Android TV-s ja Google TV-s töötab kaugjuhtimispult samamoodi ning nelja värvilise nupuga puldid kasutavad neid Fold, Check/Call, Bet/Raise ja All-In jaoks.",
    "hearH2": "Mängu kuulda ja tunda",
    "hearP": "Hääleteated loevad mängusündmused ette sinu seadme enda häältega, sinu keeles, kui süsteemis see olemas on. Android-telefonides märgib lühike vibratsioon sinu käiku. Mänguhelid on neljas rühmas — käigud, vestlus, võrguteated ja blindide tõus —, mida saab eraldi sisse või välja lülitada, ühe helitugevuse liuguriga.",
    "calmH2": "Vähem üllatusi",
    "calmP": "Kui süsteem palub liikumist vähendada, tõmbab klient oma animatsioonid tagasi. Piilumisvastane kaitse hoiab sinu enda kaardid varjatuna, kuni neid puudutad, ja juhusliku Call’i kaitse blokeerib nupu Call korraks kohe pärast suurt tõstmist, nii et väiksemale Call’ile mõeldud puudutus ei saa kogemata tõstetud summat maksta.",
    "langH2": "Sinu keeles, koos giidiga",
    "langP": "Liides on saadaval {langs} keeles, vajaduse korral paremalt vasakule. Ässa abi — veebikliendi maskott äss — selgitab soovi korral iga ekraani jooksvalt ja „Mis see on?“ ütleb, mida mis tahes asi ekraanil teeb.",
    "faqH2": "Küsimused",
    "faq": [
      [
        "Kas kaarte ja teksti saab suuremaks teha?",
        "Jah. Vali aknas Juurdepääsetavus Suur või Väga suur; kaardid, tekst ja nupud kasvavad koos igal ekraanil, ka laua taga."
      ],
      [
        "Kas kõrge kontrasti režiim on olemas?",
        "Jah, aknas Juurdepääsetavus. See töötab iga liidese suurusega."
      ],
      [
        "Kas saan mängida ilma hiire või puuteekraanita?",
        "Jah, täielikult klaviatuuri, mängupuldi või Android TV kaugjuhtimispuldiga."
      ],
      [
        "Kas see töötab ekraanilugejaga?",
        "Veel mitte täielikult. Hääleteated loevad mängusündmused ette ja menüüdel on sildid, kuid pokkerilaud ise on visuaalne liides ja seda ei saa veel mängida ainult ekraanilugejaga."
      ],
      [
        "Kas see on tasuta?",
        "Jah. PokerTH on tasuta ja avatud lähtekoodiga tarkvara, ilma reklaamide ja rakendusesiseste ostudeta; kõik žetoonid on ainult mänguraha."
      ]
    ]
  },
  eu: {
    "title": "Poker irisgarria — letra handia, teklatua, gamepada | PokerTH",
    "desc": "Texas Hold’em doan: letra handiagoa, kontraste handia, 4 koloreko sortak, lupa, ahots-iragarpenak eta joko osoa teklatuz, kontrolagailuz edo telebistako agintez.",
    "ldHeadline": "Lineako poker irisgarria: letra handia, kontraste handia, teklatua eta kontrolagailua",
    "ldDesc": "PokerTH web-bezeroaren irisgarritasun-funtzioak: interfazearen tamaina, kontraste handia, 4 koloreko sortak, lupa, ahots-iragarpenak, teklatua, kontrolagailua eta telebistaren urruneko agintea.",
    "h1": "Poker irisgarria: jokatu zure erara",
    "lead": "PokerTH Texas Hold’em doakoa da nabigatzailean, eta zuk ikusteko eta jokatzeko duzun modura egokitzen da: testu eta botoi handiagoak, kontraste sendoagoa, paloak kolorez bereizten dituzten sortak, pantaila txikietarako lupa, ahots-iragarpenak eta kontrol osoa teklatutik, kontrolagailutik edo telebistaren urruneko agintetik.",
    "findH2": "Non aurkitu",
    "findP": "Irisgarritasuna botoiak — pantaila guztien goialdeko pertsona-ikonoak, saio-hasierako pantailatik mahairaino — ezarpen nagusiak irekitzen ditu edonoiz, baita esku baten erdian ere. Gainerako guztia Aukera aurreratuetan dago. Zure aukerak gailuan gordetzen dira eta, pokerth.net kontu batekin saioa hasten duzunean, zure beste gailuetara jarraitzen zaituzte.",
    "seeH2": "Mahaia ikustea",
    "see": [
      [
        "Interfazearen tamaina",
        "Estandarra, Handia edo Oso handia: testua, kartak, txipak eta botoiak batera handitzen dira, saio-hasierako pantailan, atondoan eta mahaian, eta diseinua berrantolatu egiten da telefonoan erabilgarri izan dadin."
      ],
      [
        "Kontraste handia",
        "Kontraste sendoagoko paleta interfaze osoan, menuetatik mahairaino, interfazearen tamaina guztietan."
      ],
      [
        "4 koloreko sortak",
        "Palo bakoitzari bere kolorea ematen dioten karta-sortak, bihotzak ♥ eta diamanteak ♦, edo pikak ♠ eta hirustak ♣, inoiz formagatik soilik bereizi behar ez izateko. Aukeratu bat Aukera aurreratuak → Estiloa atalean."
      ],
      [
        "Mahaiaren lupa",
        "Telefonoan, mahaia bere tamainaren bikoitzera handitzen da eta hatzarekin mugitzen da; ikuspegia zure eserlekura itzultzen da zure txanda denean. Nabigatzailearen bi hatzeko zooma ere baimen daiteke."
      ],
      [
        "Argia, iluna edo automatikoa",
        "Bezero osoak zure aukera edo zure sistemarena jarraitzen du, zure begietara egokitutako gai, sorta eta mahai-koloreekin."
      ]
    ],
    "keysH2": "Teklatua",
    "keysP": "Ekintza bakoitzak bere tekla du. PokerTH-ren funtzio-tekla ofizialek mahaian funtzionatzen dute — F1etik F4ra Fold, Check/Call, Bet/Raise eta All-In egiteko, F5 zure kartak erakusteko, F6tik F8ra joko-moduetarako — eta web-bezeroak letra bakarreko teklak gehitzen ditu (F, C, R, A, eta 1, 2, 3 potearen herena, potearen erdia edo pote osoa jokatzeko), eta guztiak berresleitu daitezke. Escape-k gaineko leihoa ixten du, Tab-ek eta gezi-teklek atondoko mahai-zerrendan mugitzen dute, eta Alt+S-k ezarpenak irekitzen ditu edonondik.",
    "padH2": "Kontrolagailua eta telebistaren urruneko agintea",
    "padP": "Joko-kontrolagailu batekin — Xbox, PlayStation, Switch Pro eta Bluetooth kontrolagailu gehienak — joko osoa jokatzen da: botoiak ekintza bakoitzerako, katuak apustua ezartzeko, eta nabigazio-modu bat pantailetan, txatean eta menuetan mugitzeko. Dar-dar egiten du zure txanda iristen denean. Android TV eta Google TV-n urruneko agintea modu berean dabil, eta lau kolore-tekla dituzten aginteek Fold, Check/Call, Bet/Raise eta All-In egiteko erabiltzen dituzte.",
    "hearH2": "Jokoa entzun eta sentitu",
    "hearP": "Ahots-iragarpenek jokoaren gertaerak ozen irakurtzen dituzte zure gailuaren ahotsekin, zure hizkuntzan sistemak hizkuntza horretako ahotsa duenean. Android telefonoetan bibrazio labur batek zure txanda adierazten du. Jokoaren soinuak lau taldetan datoz — ekintzak, txata, sareko oharrak eta blinden igoerak —, eta bakoitza bere aldetik aktibatu edo desaktiba daiteke, bolumen-graduatzaile bakarrarekin.",
    "calmH2": "Ezusteko gutxiago",
    "calmP": "Zure sistemak mugimendu gutxiago eskatzen duenean, bezeroak bere animazioak leuntzen ditu. Anti-peek-ek zure kartak ezkutuan mantentzen ditu ukitu arte, eta nahi gabeko call-aren babesak Call botoia blokeatzen du une batez raise handi baten ondoren, call txikiago baterako ukitu batek ezin dezan kopuru igoa nahi gabe ordaindu.",
    "langH2": "Zure hizkuntzan, gidari batekin",
    "langP": "Interfazea {langs} hizkuntzatan dago eskuragarri, eskuinetik ezkerrera behar denean. Batekoaren laguntzak, web-bezeroaren maskotak, pantaila bakoitza azaltzen dizu aurrera egin ahala, nahi baduzu, eta «Zer da hau?» aukerak pantailako edozerk zer egiten duen esaten dizu.",
    "faqH2": "Galderak",
    "faq": [
      [
        "Kartak eta testua handitu ditzaket?",
        "Bai. Aukeratu Handia edo Oso handia Irisgarritasuna leihoan; kartak, testua eta botoiak batera handitzen dira pantaila guztietan, mahaian barne."
      ],
      [
        "Ba al dago kontraste handiko modurik?",
        "Bai, Irisgarritasuna leihoan. Interfazearen tamaina guztiekin dabil."
      ],
      [
        "Sagurik edo ukipen-pantailarik gabe joka dezaket?",
        "Bai, osorik teklatuarekin, kontrolagailu batekin edo Android TV-ko urruneko agintearekin."
      ],
      [
        "Pantaila-irakurgailu batekin dabil?",
        "Oraindik ez guztiz. Ahots-iragarpenek jokoaren gertaerak ozen irakurtzen dituzte eta menuek etiketak dituzte, baina poker-mahaia bera interfaze bisuala da, eta oraindik ezin da pantaila-irakurgailu batekin bakarrik jokatu."
      ],
      [
        "Doakoa al da?",
        "Bai. PokerTH software doako eta kode irekikoa da, iragarkirik eta aplikazio barneko erosketarik gabe; txip guztiak joko-dirua dira."
      ]
    ]
  },
  fa: {
    "title": "پوکر دسترس‌پذیر — متن درشت، صفحه‌کلید، گیم‌پد | PokerTH",
    "desc": "Texas Hold’em رایگان با متن بزرگ‌تر، کنتراست بالا، دسته‌های چهاررنگ، ذره‌بین میز، اعلام‌های گفتاری و کنترل کامل با صفحه‌کلید، دستهٔ بازی و کنترل تلویزیون.",
    "ldHeadline": "پوکر آنلاین دسترس‌پذیر: متن بزرگ، کنتراست بالا، صفحه‌کلید و دستهٔ بازی",
    "ldDesc": "قابلیت‌های دسترس‌پذیری کلاینت وب PokerTH: اندازه رابط کاربری، کنتراست بالا، دسته‌های چهاررنگ، ذره‌بین، اعلام‌های گفتاری، صفحه‌کلید، دستهٔ بازی و کنترل از راه دور تلویزیون.",
    "h1": "پوکر دسترس‌پذیر: به روش خودتان بازی کنید",
    "lead": "PokerTH همان Texas Hold’em رایگان در مرورگر است و خودش را با شیوهٔ دیدن و بازی کردن شما وفق می‌دهد: متن و دکمه‌های بزرگ‌تر، کنتراست قوی‌تر، دسته‌هایی که خال‌ها را با رنگ از هم جدا می‌کنند، ذره‌بینی برای صفحه‌های کوچک، اعلام‌های گفتاری، و کنترل کامل با صفحه‌کلید، دستهٔ بازی یا کنترل از راه دور تلویزیون.",
    "findH2": "کجا پیدایش کنید",
    "findP": "دکمهٔ دسترس‌پذیری — نماد آدمک بالای هر صفحه، از صفحهٔ ورود تا میز — تنظیمات اصلی را هر زمان، حتی وسط یک دست، باز می‌کند. بقیهٔ چیزها در گزینه‌های پیشرفته است. انتخاب‌های شما روی دستگاه به خاطر سپرده می‌شوند و وقتی با حساب pokerth.net وارد شوید، همراه شما به دستگاه‌های دیگرتان می‌آیند.",
    "seeH2": "دیدن میز",
    "see": [
      [
        "اندازه رابط کاربری",
        "استاندارد، بزرگ یا بسیار بزرگ: متن، کارت‌ها، ژتون‌ها و دکمه‌ها با هم بزرگ می‌شوند — در صفحهٔ ورود، در لابی و سر میز — و چیدمان دوباره مرتب می‌شود تا روی گوشی هم راحت بماند."
      ],
      [
        "کنتراست بالا",
        "پالتی با کنتراست قوی‌تر در کل رابط کاربری، از منوها تا میز، در هر اندازهٔ رابط کاربری."
      ],
      [
        "دسته‌های چهاررنگ",
        "دسته‌کارت‌هایی که به هر خال رنگ خودش را می‌دهند، تا دل و خشت، یا پیک و گشنیز، هرگز فقط از روی شکل از هم تشخیص داده نشوند. یکی را در گزینه‌های پیشرفته ← ظاهر انتخاب کنید."
      ],
      [
        "ذره‌بین میز",
        "روی گوشی، میز تا دو برابر بزرگ می‌شود و با انگشت جابه‌جا می‌شود؛ وقتی نوبت شما می‌رسد، نما به صندلی شما برمی‌گردد. بزرگ‌نمایی دوانگشتی خود مرورگر را هم می‌توان مجاز کرد."
      ],
      [
        "روشن، تیره یا خودکار",
        "کل کلاینت از انتخاب شما یا انتخاب سیستمتان پیروی می‌کند، با پوسته‌ها، دسته‌ها و رنگ‌های میزی که به چشمانتان بخورد."
      ]
    ],
    "keysH2": "صفحه‌کلید",
    "keysP": "هر حرکت کلید خودش را دارد. کلیدهای تابعی رسمی PokerTH سر میز کار می‌کنند — F1 تا F4 برای Fold، Check/Call، Bet/Raise و All-In، F5 برای نشان دادن کارت‌هایتان، F6 تا F8 برای حالت‌های بازی — و کلاینت وب حروف تکی هم اضافه می‌کند (F، C، R، A، و 1، 2، 3 برای یک‌سوم پات، نصف پات یا کل پات) که همه را می‌توان دوباره تعیین کرد. Escape بالاترین پنجره را می‌بندد، Tab و کلیدهای جهت‌نما در فهرست میزهای لابی حرکت می‌کنند، و Alt+S از هر جا تنظیمات را باز می‌کند.",
    "padH2": "دستهٔ بازی و کنترل تلویزیون",
    "padP": "یک دستهٔ بازی — Xbox، PlayStation، Switch Pro و بیشتر دسته‌های Bluetooth — کل بازی را پیش می‌برد: دکمه برای هر حرکت، ماشه‌ها برای تنظیم مبلغ شرط، و حالت پیمایش برای جابه‌جایی میان صفحه‌ها، گفتگو و منوها. وقتی نوبتتان برسد می‌لرزد. روی Android TV و Google TV کنترل از راه دور هم همین‌طور کار می‌کند، و کنترل‌هایی که چهار کلید رنگی دارند از آن‌ها برای Fold، Check/Call، Bet/Raise و All-In استفاده می‌کنند.",
    "hearH2": "شنیدن و حس کردن بازی",
    "hearP": "اعلام‌های گفتاری رویدادهای بازی را با صداهای خود دستگاهتان بلند می‌خوانند، به زبان شما اگر سیستم آن را داشته باشد. روی گوشی‌های اندرویدی، لرزشی کوتاه نوبت شما را نشان می‌دهد. صداهای بازی در چهار گروه‌اند — حرکات، گفتگو، اعلان‌های شبکه و افزایش بلایند — که جداگانه روشن یا خاموش می‌شوند، با یک لغزندهٔ بلندی صدا.",
    "calmH2": "غافلگیری کمتر",
    "calmP": "وقتی سیستم شما درخواست کاهش حرکت دارد، کلاینت انیمیشن‌هایش را ملایم‌تر می‌کند. ضد دید کارت‌هایتان را تا وقتی رویشان نزنید پنهان نگه می‌دارد، و محافظ کال ناخواسته درست پس از افزایشی بزرگ دکمهٔ Call را لحظه‌ای می‌بندد تا ضربه‌ای که برای کالی کوچک‌تر بود به اشتباه مبلغ افزایش‌یافته را نپردازد.",
    "langH2": "به زبان شما، با یک راهنما",
    "langP": "رابط کاربری به {langs} زبان در دسترس است، و هر جا لازم باشد راست‌به‌چپ. با راهنمای آس، آس — طلسم کلاینت وب — اگر بخواهید هر صفحه را همان‌طور که پیش می‌روید توضیح می‌دهد، و «این چیست؟» می‌گوید هر چیزی روی صفحه چه کاری می‌کند.",
    "faqH2": "پرسش‌ها",
    "faq": [
      [
        "می‌توانم کارت‌ها و متن را بزرگ‌تر کنم؟",
        "بله. در پنجرهٔ دسترس‌پذیری «بزرگ» یا «بسیار بزرگ» را انتخاب کنید؛ کارت‌ها، متن و دکمه‌ها در همهٔ صفحه‌ها، از جمله میز، با هم بزرگ می‌شوند."
      ],
      [
        "حالت کنتراست بالا دارد؟",
        "بله، در پنجرهٔ دسترس‌پذیری. با همهٔ اندازه‌های رابط کاربری کار می‌کند."
      ],
      [
        "می‌توانم بدون موس یا صفحهٔ لمسی بازی کنم؟",
        "بله، کاملاً با صفحه‌کلید، با دستهٔ بازی یا با کنترل از راه دور Android TV."
      ],
      [
        "با صفحه‌خوان کار می‌کند؟",
        "هنوز به‌طور کامل نه. اعلام‌های گفتاری رویدادهای بازی را بلند می‌خوانند و منوها برچسب دارند، اما خود میز پوکر یک رابط دیداری است و هنوز نمی‌توان فقط با صفحه‌خوان با آن بازی کرد."
      ],
      [
        "رایگان است؟",
        "بله. PokerTH نرم‌افزاری رایگان و متن‌باز است، بدون تبلیغ و بدون خرید درون‌برنامه‌ای؛ همهٔ ژتون‌ها پول بازی‌اند."
      ]
    ]
  },
  fi: {
    "title": "Saavutettava pokeri — iso teksti, näppäimistö, peliohjain | PokerTH",
    "desc": "Ilmainen Texas Hold’em: isompi teksti, suuri kontrasti, 4-väriset pakat, suurennus, puheilmoitukset ja täysi ohjaus näppäimistöllä, peliohjaimella tai TV-kaukosäätimellä.",
    "ldHeadline": "Saavutettava nettipokeri: iso teksti, suuri kontrasti, näppäimistö ja peliohjain",
    "ldDesc": "PokerTH-verkkoasiakkaan saavutettavuusominaisuudet: käyttöliittymän koko, suuri kontrasti, 4-väriset pakat, suurennus, puheilmoitukset, näppäimistö, peliohjain ja TV:n kaukosäädin.",
    "h1": "Saavutettava pokeri: pelaa omalla tavallasi",
    "lead": "PokerTH on ilmainen Texas Hold’em selaimessa, ja se mukautuu siihen, miten näet ja pelaat: isompi teksti ja painikkeet, voimakkaampi kontrasti, pakat, joissa maat erottaa väristä, suurennus pienille näytöille, puheilmoitukset sekä täysi ohjaus näppäimistöllä, peliohjaimella tai TV:n kaukosäätimellä.",
    "findH2": "Mistä sen löytää",
    "findP": "Saavutettavuus-painike — henkilökuvake jokaisen ruudun yläreunassa kirjautumisruudusta pöytään — avaa tärkeimmät asetukset milloin tahansa, jopa kesken käden. Kaikki muu löytyy Lisäasetuksista. Valintasi tallennetaan laitteelle, ja kun kirjaudut pokerth.net-tilillä, ne seuraavat sinua muille laitteillesi.",
    "seeH2": "Pöydän näkeminen",
    "see": [
      [
        "Käyttöliittymän koko",
        "Vakio, Suuri tai Erittäin suuri: teksti, kortit, pelimerkit ja painikkeet kasvavat yhdessä kirjautumisruudussa, aulassa ja pöydässä, ja asettelu mukautuu pysyäkseen käytettävänä puhelimella."
      ],
      [
        "Suuri kontrasti",
        "Voimakkaampikontrastinen paletti koko käyttöliittymässä valikoista pöytään, jokaisella käyttöliittymän koolla."
      ],
      [
        "4-väriset pakat",
        "Korttipakat, joissa jokaisella maalla on oma värinsä, joten herttoja ja ruutuja tai patoja ja ristejä ei koskaan tarvitse erottaa pelkän muodon perusteella. Valitse sellainen kohdasta Lisäasetukset → Tyyli."
      ],
      [
        "Pöydän suurennus",
        "Puhelimella pöytä suurenee kaksinkertaiseksi ja sitä voi siirtää sormella; näkymä palaa paikallesi, kun on sinun vuorosi. Myös selaimen nipistyszoomauksen voi sallia."
      ],
      [
        "Vaalea, tumma tai automaattinen",
        "Koko asiakasohjelma noudattaa omaa valintaasi tai järjestelmäsi valintaa, ja teemat, pakat ja pöydän värit voi valita silmillesi sopiviksi."
      ]
    ],
    "keysH2": "Näppäimistö",
    "keysP": "Jokaisella toiminnolla on näppäin. PokerTH:n viralliset toimintonäppäimet toimivat pöydässä — F1–F4 Fold, Check/Call, Bet/Raise ja All-In, F5 näyttää korttisi, F6–F8 vaihtavat pelitilaa — ja verkkoasiakas lisää yksittäiset kirjaimet (F, C, R, A sekä 1, 2, 3: kolmannes potista, puolikas potti tai potin kokoinen panos), ja kaikki ne voi määrittää uudelleen. Escape sulkee päällimmäisen ikkunan, Tab ja nuolinäppäimet liikkuvat aulan pöytälistalla, ja Alt+S avaa asetukset mistä tahansa.",
    "padH2": "Peliohjain ja TV:n kaukosäädin",
    "padP": "Peliohjaimella — Xbox, PlayStation, Switch Pro ja useimmat Bluetooth-ohjaimet — pelaat koko pelin: painikkeet jokaiselle toiminnolle, liipaisimet panoksen säätämiseen ja navigointitila, jolla liikut ruuduissa, chatissa ja valikoissa. Ohjain värisee, kun vuorosi tulee. Android TV:ssä ja Google TV:ssä kaukosäädin toimii samoin, ja kaukosäätimissä, joissa on neljä värinäppäintä, ne toimivat Fold-, Check/Call-, Bet/Raise- ja All-In-näppäiminä.",
    "hearH2": "Kuule ja tunne peli",
    "hearP": "Puheilmoitukset lukevat pelitapahtumat ääneen laitteesi omilla äänillä, omalla kielelläsi, jos järjestelmässä sellainen on. Android-puhelimissa lyhyt värinä kertoo, että on sinun vuorosi. Pelin äänet jakautuvat neljään ryhmään — toiminnot, chat, verkkoilmoitukset ja blindien nostot — jotka voi kytkeä päälle tai pois erikseen, ja niillä on yksi yhteinen äänenvoimakkuussäädin.",
    "calmH2": "Vähemmän yllätyksiä",
    "calmP": "Kun järjestelmäsi pyytää vähentämään liikettä, asiakasohjelma hillitsee animaatioitaan. Kurkkimissuoja pitää omat korttisi piilossa, kunnes napautat niitä, ja vahinko-Callin esto lukitsee Call-painikkeen hetkeksi heti suuren korotuksen jälkeen, jotta pienempään Calliin tarkoitettu napautus ei voi vahingossa maksaa korotettua summaa.",
    "langH2": "Omalla kielelläsi, oppaan kanssa",
    "langP": "Käyttöliittymä on saatavilla {langs} kielellä, tarvittaessa oikealta vasemmalle. Ässän apu — ässä, verkkoasiakkaan maskotti — selittää halutessasi jokaisen ruudun sitä mukaa kuin etenet, ja ”Mikä tämä on?” kertoo, mitä mikä tahansa ruudun kohde tekee.",
    "faqH2": "Kysymyksiä",
    "faq": [
      [
        "Voinko suurentaa kortteja ja tekstiä?",
        "Kyllä. Valitse Suuri tai Erittäin suuri Saavutettavuus-ikkunassa; kortit, teksti ja painikkeet kasvavat yhdessä jokaisessa ruudussa, myös pöydässä."
      ],
      [
        "Onko suuren kontrastin tilaa?",
        "Kyllä, Saavutettavuus-ikkunassa. Se toimii jokaisella käyttöliittymän koolla."
      ],
      [
        "Voinko pelata ilman hiirtä tai kosketusnäyttöä?",
        "Kyllä, kokonaan näppäimistöllä, peliohjaimella tai Android TV:n kaukosäätimellä."
      ],
      [
        "Toimiiko se ruudunlukijan kanssa?",
        "Ei vielä täysin. Puheilmoitukset lukevat pelitapahtumat ääneen ja valikoissa on tekstitunnisteet, mutta itse pokeripöytä on visuaalinen käyttöliittymä, eikä sitä voi vielä pelata pelkällä ruudunlukijalla."
      ],
      [
        "Onko se ilmainen?",
        "Kyllä. PokerTH on ilmainen avoimen lähdekoodin ohjelma ilman mainoksia ja sovelluksen sisäisiä ostoja; kaikki pelimerkit ovat leikkirahaa."
      ]
    ]
  },
  fil: {
    "title": "Accessible na poker — malalaking letra, keyboard, gamepad | PokerTH",
    "desc": "Libreng Texas Hold’em: malalaking letra, mataas na contrast, 4-kulay na deck, magnifier ng mesa, voice announcements at buong kontrol sa keyboard, gamepad o TV remote.",
    "ldHeadline": "Accessible na online poker: malalaking letra, mataas na contrast, keyboard at gamepad",
    "ldDesc": "Ang mga accessibility feature ng PokerTH web client: laki ng interface, mataas na contrast, 4-kulay na deck, magnifier, voice announcements, keyboard, gamepad at TV remote.",
    "h1": "Accessible na poker: maglaro sa paraang gusto mo",
    "lead": "Ang PokerTH ay libreng Texas Hold’em sa browser, at umaangkop ito sa paraan ng iyong pagtingin at paglalaro: mas malalaking letra at button, mas matapang na contrast, mga deck na may sariling kulay ang bawat palo, magnifier para sa maliliit na screen, voice announcements, at buong kontrol mula sa keyboard, gamepad o TV remote.",
    "findH2": "Saan ito makikita",
    "findP": "Ang button na Accessibility — ang icon na tao sa itaas ng bawat screen, mula sa login screen hanggang sa mesa — ay nagbubukas ng mga pangunahing setting anumang oras, kahit sa gitna ng kamay. Lahat ng iba pa ay nasa Mga advanced na option. Naaalala ang mga pinili mo sa device at, kapag nag-log in ka gamit ang pokerth.net account, sumusunod ang mga ito sa iba mo pang device.",
    "seeH2": "Pagtingin sa mesa",
    "see": [
      [
        "Laki ng interface",
        "Karaniwan, Malaki o Napakalaki: sabay-sabay na lumalaki ang text, mga baraha, chips at button, sa login screen, sa lobby at sa mesa, at umaayos ang layout para manatiling magagamit sa telepono."
      ],
      [
        "Mataas na contrast",
        "Isang palette na mas matapang ang contrast sa buong interface, mula sa mga menu hanggang sa mesa, sa bawat laki ng interface."
      ],
      [
        "4-kulay na deck",
        "Mga deck ng baraha na may sariling kulay ang bawat palo, kaya hindi mo kailanman kailangang kilalanin ang hearts at diamonds, o spades at clubs, sa hugis lamang. Pumili ng isa sa Mga advanced na option → Istilo."
      ],
      [
        "Magnifier ng mesa",
        "Sa telepono, dumodoble ang laki ng mesa at naigagalaw ito gamit ang daliri; bumabalik ang view sa upuan mo kapag turn mo na. Maaari ring payagan ang pinch-zoom ng browser."
      ],
      [
        "Light, dark o awtomatiko",
        "Sinusunod ng buong client ang pinili mo o ng iyong sistema, may mga tema, deck at kulay ng mesa na angkop sa iyong mga mata."
      ]
    ],
    "keysH2": "Keyboard",
    "keysP": "May key ang bawat aksyon. Gumagana sa mesa ang mga opisyal na PokerTH function key — F1 hanggang F4 para sa Fold, Check/Call, Bet/Raise at All-In, F5 para ipakita ang mga baraha mo, F6 hanggang F8 para sa mga playing mode — at nagdadagdag ang web client ng mga solong letra (F, C, R, A, at 1, 2, 3 para sa ikatlo ng pot, kalahati ng pot o buong pot), na lahat ay maaaring i-rebind. Isinasara ng Esc ang window na nasa ibabaw, gumagalaw ang Tab at ang mga arrow key sa listahan ng mga mesa sa lobby, at binubuksan ng Alt+S ang mga setting kahit saan.",
    "padH2": "Gamepad at TV remote",
    "padP": "Kayang laruin ng game controller — Xbox, PlayStation, Switch Pro at karamihan ng Bluetooth pad — ang buong laro: mga button para sa bawat aksyon, mga trigger para itakda ang taya, at Navigation mode para gumalaw sa mga screen, sa chat at sa mga menu. Nagva-vibrate ito kapag turn mo na. Sa Android TV at Google TV, ganoon din gumagana ang remote, at ginagamit ng mga remote na may apat na de-kulay na key ang mga ito para sa Fold, Check/Call, Bet/Raise at All-In.",
    "hearH2": "Pakinggan at damhin ang laro",
    "hearP": "Binabasa nang malakas ng voice announcements ang mga pangyayari sa laro gamit ang mga boses ng sarili mong device, sa iyong wika kung mayroon nito ang sistema. Sa mga Android phone, minamarkahan ng maikling vibration ang turn mo. Nahahati ang mga tunog ng laro sa apat na grupo — mga aksyon, chat, abiso ng network at pagtaas ng blinds — na maaaring i-on o i-off nang hiwalay, na may iisang volume slider.",
    "calmH2": "Mas kaunting sorpresa",
    "calmP": "Kapag humiling ang sistema mo ng reduced motion, pinahihina ng client ang mga animation nito. Pinapanatiling nakatago ng Anti-peek ang sarili mong mga baraha hanggang i-tap mo ang mga ito, at panandaliang bina-block ng accidental-call guard ang Call button pagkatapos ng malaking raise, para ang tap na para sa mas maliit na call ay hindi aksidenteng makabayad ng itinaas na halaga.",
    "langH2": "Sa iyong wika, may gabay",
    "langP": "Available ang interface sa {langs} wika, mula kanan pakaliwa kung kailangan. Sa Tulong ng Alas, ipinapaliwanag ng Alas — ang mascot ng web client — ang bawat screen habang naglalaro ka, kung gusto mo, at sinasabi sa iyo ng “Ano ito?” kung ano ang ginagawa ng anumang nasa screen.",
    "faqH2": "Mga tanong",
    "faq": [
      [
        "Puwede ko bang palakihin ang mga baraha at text?",
        "Oo. Piliin ang Malaki o Napakalaki sa window na Accessibility; sabay na lumalaki ang mga baraha, text at button sa bawat screen, kasama ang mesa."
      ],
      [
        "May high-contrast mode ba?",
        "Oo, sa window na Accessibility. Gumagana ito sa bawat laki ng interface."
      ],
      [
        "Puwede ba akong maglaro nang walang mouse o touch screen?",
        "Oo, buong-buo gamit ang keyboard, gamepad o Android TV remote."
      ],
      [
        "Gumagana ba ito sa screen reader?",
        "Hindi pa nang buo. Binabasa nang malakas ng voice announcements ang mga pangyayari sa laro at may mga label ang mga menu, pero ang mesa ng poker mismo ay visual na interface at hindi pa malalaro gamit ang screen reader lamang."
      ],
      [
        "Libre ba ito?",
        "Oo. Ang PokerTH ay libre at open-source na software, walang ad at walang in-app purchase; pang-larong pera lamang ang lahat ng chips."
      ]
    ]
  },
  fr: {
    "title": "Poker accessible — gros caractères, clavier, manette | PokerTH",
    "desc": "Texas Hold’em gratuit : texte agrandi, contraste élevé, paquets 4 couleurs, loupe, annonces vocales et jeu complet au clavier, à la manette ou à la télécommande.",
    "ldHeadline": "Poker en ligne accessible : gros caractères, contraste élevé, clavier et manette",
    "ldDesc": "Les fonctions d’accessibilité du client web PokerTH : taille de l’interface, contraste élevé, paquets quatre couleurs, loupe, annonces vocales, clavier, manette et télécommande TV.",
    "h1": "Poker accessible : jouez à votre façon",
    "lead": "PokerTH, c’est du Texas Hold’em gratuit dans le navigateur, qui s’adapte à votre façon de voir et de jouer : texte et boutons plus grands, contraste renforcé, paquets qui distinguent les couleurs par la teinte, loupe pour les petits écrans, annonces vocales, et contrôle complet au clavier, à la manette ou à la télécommande TV.",
    "findH2": "Où le trouver",
    "findP": "Le bouton Accessibilité — l’icône de personnage en haut de chaque écran, de l’écran de connexion à la table — ouvre les réglages principaux à tout moment, même en pleine main. Tout le reste se trouve dans les Options avancées. Vos choix sont mémorisés sur l’appareil et, si vous vous connectez avec un compte pokerth.net, vous suivent sur vos autres appareils.",
    "seeH2": "Bien voir la table",
    "see": [
      [
        "Taille de l’interface",
        "Standard, Grande ou Très grande : texte, cartes, jetons et boutons grandissent ensemble, sur l’écran de connexion, dans le lobby et à la table, et la mise en page se réorganise pour rester utilisable sur un téléphone."
      ],
      [
        "Contraste élevé",
        "Une palette plus contrastée sur toute l’interface, des menus à la table, quelle que soit la taille de l’interface."
      ],
      [
        "Paquets quatre couleurs",
        "Des paquets de cartes qui donnent à chaque couleur sa propre teinte, pour que cœurs et carreaux, ou piques et trèfles, ne se distinguent jamais par la seule forme. Choisissez-en un dans Options avancées → Style."
      ],
      [
        "Loupe de table",
        "Sur téléphone, la table se zoome au double de sa taille et se déplace au doigt ; la vue revient à votre place quand c’est votre tour. Le zoom par pincement du navigateur peut aussi être autorisé."
      ],
      [
        "Clair, sombre ou automatique",
        "Tout le client suit votre choix ou celui de votre système, avec des thèmes, des paquets et des couleurs de table adaptés à vos yeux."
      ]
    ],
    "keysH2": "Clavier",
    "keysP": "Chaque action a sa touche. Les touches de fonction officielles de PokerTH fonctionnent à la table — F1 à F4 pour Fold, Check/Call, Bet/Raise et All-In, F5 pour montrer vos cartes, F6 à F8 pour les modes de jeu — et le client web y ajoute des lettres simples (F, C, R, A, et 1, 2, 3 pour un tiers du pot, la moitié du pot ou le pot), toutes réassignables. Échap ferme la fenêtre du dessus, Tab et les flèches parcourent la liste des tables du lobby, et Alt+S ouvre les réglages de n’importe où.",
    "padH2": "Manette et télécommande TV",
    "padP": "Une manette de jeu — Xbox, PlayStation, Switch Pro et la plupart des manettes Bluetooth — permet de jouer toute la partie : un bouton pour chaque action, les gâchettes pour régler la mise, et un mode Navigation pour parcourir les écrans, le chat et les menus. Elle vibre quand votre tour arrive. Sur Android TV et Google TV, la télécommande fonctionne de la même façon, et les télécommandes dotées des quatre touches de couleur s’en servent pour Fold, Check/Call, Bet/Raise et All-In.",
    "hearH2": "Entendre et ressentir la partie",
    "hearP": "Les annonces vocales lisent à voix haute les événements du jeu avec les voix de votre appareil, dans votre langue si votre système en possède une. Sur les téléphones Android, une courte vibration signale votre tour. Les sons du jeu se répartissent en quatre groupes — actions, chat, notifications réseau et hausses des blindes — activables séparément, avec un seul curseur de volume.",
    "calmH2": "Moins de surprises",
    "calmP": "Quand votre système demande de réduire les animations, le client atténue les siennes. L’anti-regard garde vos propres cartes masquées jusqu’à ce que vous les touchiez, et la garde anti-Call accidentel bloque brièvement le bouton Call juste après une grosse relance, pour qu’un appui destiné à un Call plus petit ne paie pas par erreur le montant relancé.",
    "langH2": "Dans votre langue, avec un guide",
    "langP": "L’interface est disponible en {langs} langues, de droite à gauche quand il le faut. L’Aide de l’As, la mascotte du client web, vous explique chaque écran au fil de votre progression si vous le souhaitez, et « C’est quoi ? » vous dit à quoi sert n’importe quel élément de l’écran.",
    "faqH2": "Questions",
    "faq": [
      [
        "Puis-je agrandir les cartes et le texte ?",
        "Oui. Choisissez Grande ou Très grande dans la fenêtre Accessibilité ; cartes, texte et boutons grandissent ensemble sur tous les écrans, table comprise."
      ],
      [
        "Existe-t-il un mode à contraste élevé ?",
        "Oui, dans la fenêtre Accessibilité. Il fonctionne avec toutes les tailles d’interface."
      ],
      [
        "Puis-je jouer sans souris ni écran tactile ?",
        "Oui, entièrement au clavier, à la manette ou avec une télécommande Android TV."
      ],
      [
        "Fonctionne-t-il avec un lecteur d’écran ?",
        "Pas encore complètement. Les annonces vocales lisent à voix haute les événements du jeu et les menus portent des libellés, mais la table de poker elle-même est une interface visuelle et ne peut pas encore se jouer avec un lecteur d’écran seul."
      ],
      [
        "Est-ce gratuit ?",
        "Oui. PokerTH est un logiciel libre et open source, sans publicité ni achats intégrés ; tous les jetons sont fictifs."
      ]
    ]
  },
  ga: {
    "title": "Pócar inrochtana — téacs mór, méarchlár, rialaitheoir | PokerTH",
    "desc": "Texas Hold’em saor in aisce le téacs níos mó, ardchodarsnacht, pacaí ceithre dhath, formhéadaitheoir, fógraí gutha agus imirt iomlán le méarchlár nó rialaitheoir.",
    "ldHeadline": "Pócar ar líne inrochtana: téacs mór, ardchodarsnacht, méarchlár agus rialaitheoir cluichí",
    "ldDesc": "Gnéithe inrochtaineachta chliant gréasáin PokerTH: méid an chomhéadain, ardchodarsnacht, pacaí ceithre dhath, formhéadaitheoir, fógraí gutha, méarchlár, rialaitheoir cluichí agus cianrialtán teilifíse.",
    "h1": "Pócar inrochtana: imir mar is mian leat",
    "lead": "Is Texas Hold’em saor in aisce sa bhrabhsálaí é PokerTH, agus cuireann sé é féin in oiriúint don chaoi a bhfeiceann agus a n-imríonn tú: téacs agus cnaipí níos mó, codarsnacht níos láidre, pacaí a dhéanann idirdhealú idir na cultacha de réir datha, formhéadaitheoir do scáileáin bheaga, fógraí gutha, agus smacht iomlán ó mhéarchlár, ó rialaitheoir cluichí nó ó chianrialtán teilifíse.",
    "findH2": "Cá bhfaighidh tú é",
    "findP": "Osclaíonn an cnaipe Inrochtaineacht — deilbhín an duine ag barr gach scáileáin, ón scáileán logála isteach go dtí an bord — na príomhshocruithe am ar bith, fiú i lár láimhe. Tá gach rud eile sna hArdroghanna. Cuimhnítear ar do roghanna ar an ngléas agus, nuair a logálann tú isteach le cuntas pokerth.net, leanann siad thú chuig do ghléasanna eile.",
    "seeH2": "An bord a fheiceáil",
    "see": [
      [
        "Méid an chomhéadain",
        "Caighdeánach, Mór nó An-mhór: fásann téacs, cártaí, sceallóga agus cnaipí le chéile, ar an scáileán logála isteach, sa stocaireacht agus ag an mbord, agus athshocraítear an leagan amach ionas go bhfanann sé inúsáidte ar fhón."
      ],
      [
        "Ardchodarsnacht",
        "Pailéad le codarsnacht níos láidre ar fud an chomhéadain ar fad, ó na roghchláir go dtí an bord, ag gach méid comhéadain."
      ],
      [
        "Pacaí ceithre dhath",
        "Pacaí cártaí a thugann a dath féin do gach culaith, ionas nach n-aithnítear hairt ó mhuileata, ná spéireataí ó thriufanna, de réir crutha amháin. Roghnaigh ceann in Ardroghanna → Stíl."
      ],
      [
        "Formhéadaitheoir an bhoird",
        "Ar fhón, méadaítear an bord faoi dhó agus bogtar é le do mhéar; filleann an t-amharc ar do shuíochán nuair is é do shealsa é. Is féidir súmáil pinseála an bhrabhsálaí a cheadú freisin."
      ],
      [
        "Geal, dorcha nó uathoibríoch",
        "Leanann an cliant ar fad do rogha féin nó rogha do chórais, le téamaí, pacaí agus dathanna boird a oireann do do shúile."
      ]
    ],
    "keysH2": "Méarchlár",
    "keysP": "Tá eochair ag gach beart. Oibríonn eochracha feidhme oifigiúla PokerTH ag an mbord — F1 go F4 le haghaidh Fold, Check/Call, Bet/Raise agus All-In, F5 chun do chártaí a thaispeáint, F6 go F8 do na móid imeartha — agus cuireann an cliant gréasáin litreacha aonair leo (F, C, R, A, agus 1, 2, 3 do thrian den phota, leath an phota nó an pota ar fad), agus is féidir gach ceann acu a athshannadh. Dúnann Escape an fhuinneog is airde, bogann Tab agus na saigheada trí liosta boird na stocaireachta, agus osclaíonn Alt+S na socruithe ó áit ar bith.",
    "padH2": "Rialaitheoir cluichí agus cianrialtán teilifíse",
    "padP": "Imríonn rialaitheoir cluichí — Xbox, PlayStation, Switch Pro agus formhór na rialaitheoirí Bluetooth — an cluiche ar fad: cnaipí do gach beart, truicir chun an geall a shocrú, agus mód nascleanúna chun bogadh trí na scáileáin, an comhrá agus na roghchláir. Creathann sé nuair a thagann do shealsa. Ar Android TV agus Google TV oibríonn an cianrialtán ar an mbealach céanna, agus úsáideann cianrialtáin a bhfuil na ceithre eochair datha orthu iad le haghaidh Fold, Check/Call, Bet/Raise agus All-In.",
    "hearH2": "An cluiche a chloisteáil agus a mhothú",
    "hearP": "Léann fógraí gutha imeachtaí an chluiche os ard le guthanna do ghléis féin, i do theanga féin má tá ceann ag an gcóras. Ar fhóin Android, cuireann creathadh gairid do shealsa in iúl. Tagann fuaimeanna an chluiche i gceithre ghrúpa — bearta, comhrá, fógraí líonra agus ardú na blinds — ar féidir iad a chur ar siúl nó a mhúchadh ar leith, le sleamhnán fuaime amháin.",
    "calmH2": "Níos lú iontas",
    "calmP": "Nuair a iarrann do chóras gluaiseacht laghdaithe, maolaíonn an cliant a bheochana. Coinníonn Anti-peek do chártaí féin folaithe go dtí go dtapálann tú iad, agus blocálann an chosaint ar call de thaisme an cnaipe Call ar feadh nóiméid díreach tar éis raise mhóir, ionas nach féidir le tapáil a bhí beartaithe do call níos lú an méid ardaithe a íoc de thaisme.",
    "langH2": "I do theanga féin, le treoraí",
    "langP": "Tá an comhéadan ar fáil i {langs} teanga, ó dheis go clé nuair is gá. Le Cabhair an Aoin, míníonn an tAon — suaitheantas an chliaint gréasáin — gach scáileán duit de réir a chéile más mian leat, agus insíonn “Cad é seo?” duit cad a dhéanann aon rud ar an scáileán.",
    "faqH2": "Ceisteanna",
    "faq": [
      [
        "An féidir liom na cártaí agus an téacs a mhéadú?",
        "Is féidir. Roghnaigh Mór nó An-mhór san fhuinneog Inrochtaineacht; fásann cártaí, téacs agus cnaipí le chéile ar gach scáileán, an bord san áireamh."
      ],
      [
        "An bhfuil mód ardchodarsnachta ann?",
        "Tá, san fhuinneog Inrochtaineacht. Oibríonn sé le gach méid comhéadain."
      ],
      [
        "An féidir liom imirt gan luch ná scáileán tadhaill?",
        "Is féidir, go hiomlán leis an méarchlár, le rialaitheoir cluichí nó le cianrialtán Android TV."
      ],
      [
        "An oibríonn sé le léitheoir scáileáin?",
        "Ní go hiomlán fós. Léann fógraí gutha imeachtaí an chluiche os ard agus tá lipéid ar na roghchláir, ach is comhéadan amhairc é an bord pócair féin agus ní féidir é a imirt fós le léitheoir scáileáin amháin."
      ],
      [
        "An bhfuil sé saor in aisce?",
        "Tá. Is bogearraí saor in aisce foinse oscailte é PokerTH, gan fógraí agus gan ceannacháin san aip; is airgead cluiche amháin iad na sceallóga ar fad."
      ]
    ]
  },
  gd: {
    "title": "Pòcair ruigsinneach — teacsa mòr, meur-chlàr, pad geama | PokerTH",
    "desc": "Texas Hold’em an-asgaidh le teacsa nas motha, iomsgaradh àrd, pacaidean 4 dathan, glainne-mheudachaidh, innsidhean guth is cluich slàn le meur-chlàr, pad geama no TBh.",
    "ldHeadline": "Pòcair air loidhne ruigsinneach: teacsa mòr, iomsgaradh àrd, meur-chlàr is pad geama",
    "ldDesc": "Feartan ruigsinneachd cliant-lìn PokerTH: meud na h-eadar-aghaidh, iomsgaradh àrd, pacaidean ceithir dathan, glainne-mheudachaidh, innsidhean guth, meur-chlàr, pad geama is smachd-iomallach TBh.",
    "h1": "Pòcair ruigsinneach: cluich mar a thogras tu",
    "lead": "’S e Texas Hold’em an-asgaidh sa bhrabhsair a th’ ann am PokerTH, agus atharraichidh e a rèir mar a chì is a chluicheas tu: teacsa is putanan nas motha, iomsgaradh nas làidire, pacaidean a bheir dath fa leth do gach seòrsa cairt, glainne-mheudachaidh do sgrìnichean beaga, innsidhean guth, agus làn-smachd le meur-chlàr, pad geama no smachd-iomallach TBh.",
    "findH2": "Càite a bheil e",
    "findP": "Fosglaidh am putan Ruigsinneachd — ìomhaigheag an duine aig mullach gach sgrìn, o sgrìn a’ chlàraidh a-steach chun a’ bhùird — na prìomh roghainnean uair sam bith, fiù ’s am meadhan làimhe. Tha a h-uile càil eile ann an Roghainnean adhartach. Thèid na roghainnean agad a chuimhneachadh air an uidheam agus, nuair a chlàraicheas tu a-steach le cunntas pokerth.net, leanaidh iad thu gu na h-uidheaman eile agad.",
    "seeH2": "Am bòrd fhaicinn",
    "see": [
      [
        "Meud na h-eadar-aghaidh",
        "Coitcheann, Mòr no Glè mhòr: fàsaidh an teacsa, na cairtean, na chips is na putanan còmhla, air sgrìn a’ chlàraidh a-steach, san lobaidh is aig a’ bhòrd, agus ath-shuidhichidh an co-dhealbhachd i fhèin gus am bi i fhathast feumail air fòn."
      ],
      [
        "Iomsgaradh àrd",
        "Pailead le iomsgaradh nas làidire air feadh na h-eadar-aghaidh gu lèir, o na clàran-taice chun a’ bhùird, aig gach meud eadar-aghaidh."
      ],
      [
        "Pacaidean ceithir dathan",
        "Pacaidean chairtean a bheir a dhath fhèin do gach seòrsa, air chor ’s nach fheum thu cridheachan is daoimeanan, no spaidean is cluban, aithneachadh o chèile a-rèir an cruth a-mhàin. Tagh fear ann an Roghainnean adhartach → Stoidhle."
      ],
      [
        "Glainne-mheudachaidh a’ bhùird",
        "Air fòn, sùmaidh am bòrd gu dà uiread a mheud agus gluaisidh tu e le do mheur; tillidh an sealladh chun an t-suidheachain agad nuair a thig do chuairt. Gabhaidh sùm a’ bhrabhsair le gramachadh a cheadachadh cuideachd."
      ],
      [
        "Soilleir, dorcha no fèin-obrachail",
        "Leanaidh an cliant gu lèir do roghainn fhèin no roghainn an t-siostaim agad, le ùrlaran, pacaidean is dathan bùird a fhreagras air do shùilean."
      ]
    ],
    "keysH2": "Meur-chlàr",
    "keysP": "Tha iuchair aig gach gnìomh. Obraichidh iuchraichean gnìomh oifigeil PokerTH aig a’ bhòrd — F1 gu F4 airson Fold, Check/Call, Bet/Raise is All-In, F5 gus na cairtean agad a shealltainn, F6 gu F8 airson nam modhan cluiche — agus cuiridh an cliant-lìn litrichean singilte ris (F, C, R, A, agus 1, 2, 3 airson trian dhen phota, leth a’ phota no am pota), is gabhaidh iad uile ath-shònrachadh. Dùinidh Esc an uinneag as àirde, gluaisidh Tab is na saighdean tro liosta nam bòrd san lobaidh, agus fosglaidh Alt+S na roghainnean o àite sam bith.",
    "padH2": "Pad geama is smachd-iomallach TBh",
    "padP": "Cluichidh pad geama — Xbox, PlayStation, Switch Pro is a’ mhòr-chuid de phadaichean Bluetooth — an geama gu lèir: putanan airson gach gnìomh, na putanan-losgaidh gus an geall a shuidheachadh, agus modh seòladaireachd gus gluasad tro na sgrìnichean, a’ chabadaich is na clàran-taice. Critheachaidh e nuair a thig do chuairt. Air Android TV is Google TV obraichidh an smachd-iomallach san aon dòigh, agus cleachdaidh smachdan-iomallach aig a bheil na ceithir iuchraichean dathte iad airson Fold, Check/Call, Bet/Raise is All-In.",
    "hearH2": "An geama a chluinntinn ’s a mhothachadh",
    "hearP": "Leughaidh na h-innsidhean guth tachartasan a’ gheama a-mach àrd le guthan an uidheim agad fhèin, nad chànan fhèin far a bheil fear aig an t-siostam. Air fònaichean Android, comharraichidh crith ghoirid do chuairt. Tha fuaimean a’ gheama ann an ceithir buidhnean — gnìomhan, cabadaich, brathan lìonraidh is àrdachadh nan dallabhan — a ghabhas cur air no dheth fa leth, le aon sleamhnachan àirde-fhuaim.",
    "calmH2": "Nas lugha de dh’iongnaidhean",
    "calmP": "Nuair a dh’iarras an siostam agad gluasad nas lugha, ìslichidh an cliant na beòthachaidhean aige. Cumaidh an dìon o phriobadh na cairtean agad fhèin dùinte gus an toir thu gnogag orra, agus glasaidh an dìon o Call tubaisteach am putan Call greis bheag dìreach às dèidh àrdachadh mòr, gus nach urrainn do ghnogag a bha an dùil airson Call nas lugha an t-suim àrdaichte a phàigheadh le mearachd.",
    "langH2": "Nad chànan fhèin, le iùl",
    "langP": "Tha an eadar-aghaidh ri fhaighinn ann an {langs} cànanan, o dheas gu clì far a bheil feum air. Mìnichidh Cobhair an Aoin, suaichnean a’ chliant-lìn, gach sgrìn fhad ’s a thèid thu air adhart ma thogras tu, agus innsidh “Dè tha seo?” dhut dè a nì rud sam bith air an sgrìn.",
    "faqH2": "Ceistean",
    "faq": [
      [
        "An urrainn dhomh na cairtean is an teacsa a dhèanamh nas motha?",
        "’S urrainn. Tagh Mòr no Glè mhòr ann an uinneag na Ruigsinneachd; fàsaidh na cairtean, an teacsa is na putanan còmhla air gach sgrìn, agus aig a’ bhòrd cuideachd."
      ],
      [
        "A bheil modh iomsgaraidh àird ann?",
        "Tha, ann an uinneag na Ruigsinneachd. Obraichidh e le gach meud eadar-aghaidh."
      ],
      [
        "An urrainn dhomh cluich gun luchag no sgrìn-suathaidh?",
        "’S urrainn, gu tur leis a’ mheur-chlàr, le pad geama no le smachd-iomallach Android TV."
      ],
      [
        "An obraich e le leughadair-sgrìn?",
        "Chan obraich buileach fhathast. Leughaidh na h-innsidhean guth tachartasan a’ gheama a-mach àrd agus tha leubailean air na clàran-taice, ach ’s e eadar-aghaidh lèirsinneach a th’ anns a’ bhòrd pòcair fhèin agus cha ghabh a chluich le leughadair-sgrìn a-mhàin fhathast."
      ],
      [
        "A bheil e an-asgaidh?",
        "Tha. Tha PokerTH na bhathar-bog an-asgaidh le còd fosgailte, gun sanasachd is gun cheannach am broinn na h-aplacaid; chan eil sna chips uile ach airgead cluiche."
      ]
    ]
  },
  gl: {
    "title": "Póker accesible — letra grande, teclado, mando | PokerTH",
    "desc": "Texas Hold’em de balde con letra máis grande, contraste alto, barallas de catro cores, lupa da mesa, anuncios de voz e xogo completo con teclado, mando ou mando da TV.",
    "ldHeadline": "Póker en liña accesible: letra grande, contraste alto, teclado e mando",
    "ldDesc": "As funcións de accesibilidade do cliente web de PokerTH: tamaño da interface, contraste alto, barallas de catro cores, lupa, anuncios de voz, teclado, mando e mando a distancia da TV.",
    "h1": "Póker accesible: xoga ao teu xeito",
    "lead": "PokerTH é Texas Hold’em de balde no navegador, e adáptase á túa maneira de ver e de xogar: letra e botóns máis grandes, contraste máis forte, barallas que distinguen os paus pola cor, unha lupa para pantallas pequenas, anuncios de voz e control completo desde un teclado, un mando de xogos ou un mando a distancia da TV.",
    "findH2": "Onde atopalo",
    "findP": "O botón Accesibilidade — a icona dunha persoa na parte superior de cada pantalla, desde a pantalla de acceso ata a mesa — abre a configuración principal en calquera momento, mesmo no medio dunha man. Todo o demais está nas Opcións avanzadas. As túas escollas lémbranse no dispositivo e, cando entras cunha conta de pokerth.net, acompáñante nos teus outros dispositivos.",
    "seeH2": "Ver ben a mesa",
    "see": [
      [
        "Tamaño da interface",
        "Estándar, Grande ou Moi grande: texto, cartas, fichas e botóns medran xuntos, na pantalla de acceso, no vestíbulo e na mesa, e a disposición reorganízase para seguir sendo cómoda nun móbil."
      ],
      [
        "Contraste alto",
        "Unha paleta de contraste máis forte en toda a interface, dos menús á mesa, en calquera tamaño da interface."
      ],
      [
        "Barallas de catro cores",
        "Barallas que lle dan a cada pau a súa propia cor, para que corazóns e diamantes, ou picas e trevos, nunca se distingan só pola forma. Escolle unha en Opcións avanzadas → Estilo."
      ],
      [
        "Lupa da mesa",
        "Nun móbil, a mesa amplíase ao dobre do seu tamaño e desprázase co dedo; a vista volve ao teu asento cando é a túa quenda. Tamén se pode permitir o zoom do navegador co belisco."
      ],
      [
        "Claro, escuro ou automático",
        "Todo o cliente segue a túa escolla ou a do teu sistema, con temas, barallas e cores de mesa ao gusto dos teus ollos."
      ]
    ],
    "keysH2": "Teclado",
    "keysP": "Cada acción ten a súa tecla. As teclas de función oficiais de PokerTH funcionan na mesa — de F1 a F4 para Fold, Check/Call, Bet/Raise e All-In, F5 para amosar as túas cartas, de F6 a F8 para os modos de xogo — e o cliente web engade letras soltas (F, C, R, A, e 1, 2, 3 para un terzo do bote, medio bote ou o bote), todas reasignables. Escape pecha a xanela da fronte, Tab e as frechas percorren a lista de mesas do vestíbulo, e Alt+S abre a configuración desde calquera parte.",
    "padH2": "Mando de xogos e mando da TV",
    "padP": "Un mando de xogos — Xbox, PlayStation, Switch Pro e a maioría dos mandos Bluetooth — xoga a partida enteira: botóns para cada acción, gatillos para fixar a aposta e un modo de navegación para moverse polas pantallas, o chat e os menús. Vibra cando chega a túa quenda. En Android TV e Google TV o mando a distancia funciona igual, e os mandos coas catro teclas de cores úsanas para Fold, Check/Call, Bet/Raise e All-In.",
    "hearH2": "Oír e sentir a partida",
    "hearP": "Os anuncios de voz len en alto os acontecementos do xogo coas voces do teu propio dispositivo, na túa lingua se o sistema ten unha. Nos móbiles Android unha vibración curta marca a túa quenda. Os sons do xogo veñen en catro grupos — accións, chat, avisos de rede e subas de cegas — que se poden activar ou desactivar por separado, cun único control de volume.",
    "calmH2": "Menos sorpresas",
    "calmP": "Cando o teu sistema pide movemento reducido, o cliente suaviza as súas animacións. A protección antiespía mantén as túas cartas tapadas ata que as tocas, e a protección anti-Call accidental bloquea un momento o botón Call xusto tras unha suba grande, para que un toque pensado para un Call máis pequeno non pague por erro a cantidade subida.",
    "langH2": "Na túa lingua, cun guía",
    "langP": "A interface está dispoñible en {langs} linguas, de dereita a esquerda cando cómpre. A Axuda do Ás — o Ás é a mascota do cliente web — explícache cada pantalla sobre a marcha se queres, e «Que é isto?» cóntache que fai calquera cousa da pantalla.",
    "faqH2": "Preguntas",
    "faq": [
      [
        "Podo facer máis grandes as cartas e o texto?",
        "Si. Escolle Grande ou Moi grande na xanela Accesibilidade; cartas, texto e botóns medran xuntos en todas as pantallas, mesa incluída."
      ],
      [
        "Hai un modo de contraste alto?",
        "Si, na xanela Accesibilidade. Funciona con calquera tamaño da interface."
      ],
      [
        "Podo xogar sen rato nin pantalla táctil?",
        "Si, completamente co teclado, cun mando de xogos ou co mando a distancia dunha Android TV."
      ],
      [
        "Funciona cun lector de pantalla?",
        "Aínda non por completo. Os anuncios de voz len en alto os acontecementos do xogo e os menús levan etiquetas, pero a propia mesa de póker é unha interface visual e aínda non se pode xogar só cun lector de pantalla."
      ],
      [
        "É de balde?",
        "Si. PokerTH é software de balde e de código aberto, sen anuncios nin compras dentro da aplicación; todas as fichas son cartos de xogo."
      ]
    ]
  },
  gu: {
    "title": "સુલભ પોકર — મોટા અક્ષરો, કીબોર્ડ, ગેમપેડ | PokerTH",
    "desc": "મફત Texas Hold’em: મોટું લખાણ, ઉચ્ચ કોન્ટ્રાસ્ટ, 4-રંગી ડેક, ટેબલ બૃહદદર્શક, અવાજ દ્વારા જાહેરાતો અને કીબોર્ડ, ગેમપેડ તથા ટીવી રિમોટથી પૂરી રમત.",
    "ldHeadline": "સુલભ ઓનલાઇન પોકર: મોટું લખાણ, ઉચ્ચ કોન્ટ્રાસ્ટ, કીબોર્ડ અને ગેમપેડ",
    "ldDesc": "PokerTH વેબ ક્લાયન્ટની સુલભતા સુવિધાઓ: ઇન્ટરફેસનું કદ, ઉચ્ચ કોન્ટ્રાસ્ટ, 4-રંગી ડેક, બૃહદદર્શક, અવાજ દ્વારા જાહેરાતો, કીબોર્ડ, ગેમપેડ અને ટીવી રિમોટ.",
    "h1": "સુલભ પોકર: તમારી રીતે રમો",
    "lead": "PokerTH બ્રાઉઝરમાં મફત Texas Hold’em છે, અને તમે જે રીતે જુઓ છો અને રમો છો તેને તે અનુરૂપ બને છે: મોટું લખાણ અને મોટાં બટનો, વધુ મજબૂત કોન્ટ્રાસ્ટ, રંગ વડે સૂટ અલગ પાડતાં ડેક, નાની સ્ક્રીન માટે બૃહદદર્શક, અવાજ દ્વારા જાહેરાતો, અને કીબોર્ડ, ગેમપેડ કે ટીવી રિમોટથી સંપૂર્ણ નિયંત્રણ.",
    "findH2": "તે ક્યાં મળે",
    "findP": "સુલભતા બટન — લોગિન સ્ક્રીનથી લઈને ટેબલ સુધી દરેક સ્ક્રીનની ઉપર રહેલું વ્યક્તિનું આઇકન — મુખ્ય સેટિંગ્સ ગમે ત્યારે ખોલે છે, હેન્ડની વચ્ચે પણ. બાકીનું બધું એડવાન્સ્ડ વિકલ્પોમાં છે. તમારી પસંદગીઓ ઉપકરણ પર યાદ રહે છે અને, જ્યારે તમે pokerth.net ખાતાથી લોગિન કરો ત્યારે, તમારાં બીજાં ઉપકરણો પર પણ તમારી સાથે આવે છે.",
    "seeH2": "ટેબલ જોવું",
    "see": [
      [
        "ઇન્ટરફેસનું કદ",
        "સામાન્ય, મોટું કે ખૂબ મોટું: લખાણ, કાર્ડ્સ, ચિપ્સ અને બટનો એકસાથે મોટાં થાય છે, લોગિન સ્ક્રીન પર, લૉબીમાં અને ટેબલ પર, અને ફોન પર સરળતાથી વાપરી શકાય એ માટે લેઆઉટ ફરી ગોઠવાય છે."
      ],
      [
        "ઉચ્ચ કોન્ટ્રાસ્ટ",
        "મેનૂથી લઈને ટેબલ સુધી આખા ઇન્ટરફેસમાં વધુ મજબૂત કોન્ટ્રાસ્ટવાળી રંગ પેલેટ, ઇન્ટરફેસના દરેક કદ પર."
      ],
      [
        "4-રંગી ડેક",
        "એવા કાર્ડ ડેક જે દરેક સૂટને પોતાનો રંગ આપે છે, જેથી લાલ પાન ♥ અને ચોકટ ♦, કે કાળી પાન ♠ અને ફલ્લી ♣ ક્યારેય ફક્ત આકારથી અલગ ન પાડવાં પડે. એડવાન્સ્ડ વિકલ્પો → શૈલીમાં એક પસંદ કરો."
      ],
      [
        "ટેબલ બૃહદદર્શક",
        "ફોન પર, ટેબલ બમણા કદ સુધી ઝૂમ થાય છે અને આંગળીથી ખસે છે; તમારો વારો આવે ત્યારે દૃશ્ય તમારી સીટ પર પાછું આવે છે. બ્રાઉઝરનું પિન્ચ-ઝૂમ પણ મંજૂર કરી શકાય છે."
      ],
      [
        "લાઇટ, ડાર્ક કે સ્વચાલિત",
        "આખો ક્લાયન્ટ તમારી પસંદગી કે તમારી સિસ્ટમની પસંદગીને અનુસરે છે, તમારી આંખોને અનુકૂળ થીમ્સ, ડેક અને ટેબલના રંગો સાથે."
      ]
    ],
    "keysH2": "કીબોર્ડ",
    "keysP": "દરેક ક્રિયા માટે એક કી છે. અધિકૃત PokerTH ફંક્શન કીઝ ટેબલ પર કામ કરે છે — Fold, Check/Call, Bet/Raise અને All-In માટે F1 થી F4, તમારાં કાર્ડ્સ બતાવવા F5, રમવાના મોડ માટે F6 થી F8 — અને વેબ ક્લાયન્ટ એક-અક્ષરની કીઝ ઉમેરે છે (F, C, R, A, અને પોટના ત્રીજા ભાગ, અડધા પોટ કે આખા પોટ માટે 1, 2, 3), અને તે બધી ફરીથી સોંપી શકાય છે. Escape સૌથી ઉપરની વિન્ડો બંધ કરે છે, Tab અને તીર કીઝ લૉબીની ટેબલ યાદીમાં ફરે છે, અને Alt+S ગમે ત્યાંથી સેટિંગ્સ ખોલે છે.",
    "padH2": "ગેમપેડ અને ટીવી રિમોટ",
    "padP": "ગેમ કંટ્રોલર — Xbox, PlayStation, Switch Pro અને મોટાભાગના Bluetooth પેડ — થી આખી ગેમ રમી શકાય છે: દરેક ક્રિયા માટે બટનો, બેટ નક્કી કરવા ટ્રિગર્સ, અને સ્ક્રીન, ચેટ અને મેનૂમાં ફરવા માટે નેવિગેશન મોડ. તમારો વારો આવે ત્યારે તે વાઇબ્રેટ થાય છે. Android TV અને Google TV પર રિમોટ એ જ રીતે કામ કરે છે, અને ચાર રંગીન કીઝવાળાં રિમોટ તેનો ઉપયોગ Fold, Check/Call, Bet/Raise અને All-In માટે કરે છે.",
    "hearH2": "ગેમ સાંભળો અને અનુભવો",
    "hearP": "અવાજ દ્વારા જાહેરાતો તમારા ઉપકરણના પોતાના અવાજોથી ગેમની ઘટનાઓ મોટેથી વાંચે છે, અને સિસ્ટમમાં તમારી ભાષાનો અવાજ હોય ત્યાં તમારી ભાષામાં. Android ફોન પર ટૂંકું વાઇબ્રેશન તમારો વારો સૂચવે છે. ગેમના અવાજો ચાર જૂથમાં આવે છે — ક્રિયાઓ, ચેટ, નેટવર્ક સૂચનાઓ અને બ્લાઇન્ડ્સનો વધારો — જેને એક જ વૉલ્યુમ સ્લાઇડર સાથે અલગ અલગ ચાલુ કે બંધ કરી શકાય છે.",
    "calmH2": "ઓછાં આશ્ચર્ય",
    "calmP": "જ્યારે તમારી સિસ્ટમ ઓછી ગતિ માગે ત્યારે ક્લાયન્ટ તેનાં એનિમેશન હળવાં કરે છે. ડોકિયાં સામે રક્ષણ તમે ટૅપ કરો ત્યાં સુધી તમારાં પોતાનાં કાર્ડ્સ છુપાવી રાખે છે, અને ભૂલથી થતા Call સામે રક્ષણ મોટા Raise પછી તરત Call બટનને થોડી વાર માટે બ્લોક કરે છે, જેથી નાના Call માટે કરેલો ટૅપ ભૂલથી વધારેલી રકમ ન ચૂકવી દે.",
    "langH2": "તમારી ભાષામાં, માર્ગદર્શક સાથે",
    "langP": "ઇન્ટરફેસ {langs} ભાષાઓમાં ઉપલબ્ધ છે, જરૂર હોય ત્યાં જમણેથી ડાબે. એક્કાની મદદ, વેબ ક્લાયન્ટનો માસ્કોટ, તમે ઇચ્છો તો તમે આગળ વધો તેમ દરેક સ્ક્રીન સમજાવે છે, અને “આ શું છે?” તમને જણાવે છે કે સ્ક્રીન પરની કોઈ પણ વસ્તુ શું કરે છે.",
    "faqH2": "પ્રશ્નો",
    "faq": [
      [
        "શું હું કાર્ડ્સ અને લખાણ મોટાં કરી શકું?",
        "હા. સુલભતા વિન્ડોમાં મોટું કે ખૂબ મોટું પસંદ કરો; કાર્ડ્સ, લખાણ અને બટનો ટેબલ સહિત દરેક સ્ક્રીન પર એકસાથે મોટાં થાય છે."
      ],
      [
        "શું ઉચ્ચ કોન્ટ્રાસ્ટ મોડ છે?",
        "હા, સુલભતા વિન્ડોમાં. તે ઇન્ટરફેસના દરેક કદ સાથે કામ કરે છે."
      ],
      [
        "શું હું માઉસ કે ટચ સ્ક્રીન વગર રમી શકું?",
        "હા, સંપૂર્ણપણે કીબોર્ડથી, ગેમપેડથી કે Android TV રિમોટથી."
      ],
      [
        "શું તે સ્ક્રીન રીડર સાથે કામ કરે છે?",
        "હજી પૂરેપૂરું નહીં. અવાજ દ્વારા જાહેરાતો ગેમની ઘટનાઓ મોટેથી વાંચે છે અને મેનૂ પર લેબલ છે, પણ પોકર ટેબલ પોતે દૃશ્ય ઇન્ટરફેસ છે અને હજી ફક્ત સ્ક્રીન રીડરથી રમી શકાતું નથી."
      ],
      [
        "શું તે મફત છે?",
        "હા. PokerTH મફત અને ઓપન સોર્સ સોફ્ટવેર છે, જાહેરાતો વગર અને એપમાં ખરીદી વગર; બધી ચિપ્સ ફક્ત રમતના પૈસા છે."
      ]
    ]
  },
  ha: {
    "title": "Poker ga kowa — babban rubutu, madannai, gamepad | PokerTH",
    "desc": "Texas Hold’em kyauta da babban rubutu, babban bambanci, katunan launi 4, madubin girma, sanarwar murya, da cikakken iko da madannai, gamepad ko rimot na TV.",
    "ldHeadline": "Poker na yanar gizo ga kowa: babban rubutu, babban bambanci, madannai da gamepad",
    "ldDesc": "Fasalolin samun dama na manhajar yanar gizo ta PokerTH: girman fuska, babban bambanci, katunan launi 4, madubin girma, sanarwar murya, madannai, gamepad da rimot na TV.",
    "h1": "Poker ga kowa: yi wasa yadda kake so",
    "lead": "PokerTH Texas Hold’em ne kyauta a burauza, kuma yana daidaita kansa da yadda kake gani da wasa: babban rubutu da maɓallai, bambanci mai ƙarfi, katunan da kowane nau'insu (♥ ♦ ♠ ♣) ke da launinsa, madubin girma don ƙananan allo, sanarwar murya, da cikakken iko daga madannai, gamepad ko rimot na TV.",
    "findH2": "Inda za ka same shi",
    "findP": "Maɓallin Samun dama — alamar mutum a saman kowane allo, daga allon shiga zuwa tebur — yana buɗe manyan saituna a kowane lokaci, ko da a tsakiyar hannu. Sauran komai yana cikin Zaɓuɓɓuka na ci gaba. Ana tuna zaɓuɓɓukanka a na'urar, kuma idan ka shiga da asusun pokerth.net, suna bin ka zuwa sauran na'urorinka.",
    "seeH2": "Ganin tebur",
    "see": [
      [
        "Girman fuska",
        "Na yau da kullum, Babba ko Babba sosai: rubutu, katuna, chips da maɓallai suna girma tare — a allon shiga, a zaure da a tebur — kuma tsarin shafi yana sake daidaita kansa don ya ci gaba da zama mai sauƙin amfani a waya."
      ],
      [
        "Babban bambanci",
        "Launuka masu bambanci mai ƙarfi a dukan fuskar manhaja, daga menu zuwa tebur, a kowane girman fuska."
      ],
      [
        "Katunan launi 4",
        "Katunan da ke ba kowane nau'i launinsa, don kada a taɓa bambanta ♥ da ♦, ko ♠ da ♣, ta siffa kawai. Zaɓi ɗaya a Zaɓuɓɓuka na ci gaba → Salo."
      ],
      [
        "Madubin girma na tebur",
        "A waya, tebur yana girma ninki biyu kuma ana matsar da shi da yatsa; kallo yana komawa kujerarka idan lokacinka ya yi. Ana kuma iya ba da izinin zuƙowa ta tsunkule ta burauza."
      ],
      [
        "Haske, duhu ko kai tsaye",
        "Dukan manhajar tana bin zaɓinka ko na tsarinka, tare da jigogi, katuna da launukan tebur da suka dace da idanunka."
      ]
    ],
    "keysH2": "Madannai",
    "keysP": "Kowane motsi yana da maɓallinsa. Maɓallan aiki na hukuma na PokerTH suna aiki a tebur — F1 zuwa F4 don Fold, Check/Call, Bet/Raise da All-In, F5 don nuna katunanka, F6 zuwa F8 don yanayin wasa — kuma manhajar yanar gizo tana ƙara haruffa guda ɗaya (F, C, R, A, da 1, 2, 3 don sulusin pot, rabin pot ko dukan pot), waɗanda duka za a iya sake sanya su. Escape yana rufe taga mafi sama, Tab da maɓallan kibiya suna motsawa cikin jerin teburori na zaure, kuma Alt+S yana buɗe saituna daga ko'ina.",
    "padH2": "Gamepad da rimot na TV",
    "padP": "Mai sarrafa wasa — Xbox, PlayStation, Switch Pro da yawancin gamepad na Bluetooth — yana buga dukan wasan: maɓallai don kowane motsi, maɓallan trigger don saita adadin caca, da yanayin Kewayawa don motsawa cikin allo, hira da menu. Yana girgiza idan lokacinka ya yi. A Android TV da Google TV rimot yana aiki haka nan, kuma rimot masu maɓallan launi huɗu suna amfani da su don Fold, Check/Call, Bet/Raise da All-In.",
    "hearH2": "Saurara da jin wasa",
    "hearP": "Sanarwar murya tana karanta abubuwan da ke faruwa a wasa da babbar murya, da muryoyin na'urarka, a harshenka idan tsarin yana da shi. A wayoyin Android ɗan girgiza yana nuna lokacinka. Sautukan wasa suna cikin rukunoni huɗu — motsi, hira, sanarwar hanyar sadarwa da ƙarin blinds — da ake iya kunna ko kashe su daban, tare da madaidaicin ƙara ɗaya.",
    "calmH2": "Ƙarancin abubuwan mamaki",
    "calmP": "Idan tsarinka ya nemi rage motsi, manhajar tana rage rayarwarta. Anti-peek yana ɓoye katunanka har sai ka taɓa su, kuma kariya daga call na bazata tana toshe maɓallin Call na ɗan lokaci nan da nan bayan babban raise, don kada taɓawa da aka nufa don ƙaramin call ta biya adadin da aka ƙara bisa kuskure.",
    "langH2": "A harshenka, tare da jagora",
    "langP": "Ana samun fuskar manhajar a harsuna {langs}, daga dama zuwa hagu inda ake buƙata. Da Taimakon Aas, Aas — alamar manhajar yanar gizo — yana bayyana kowane allo yayin da kake ci gaba idan kana so, kuma “Mene ne wannan?” yana gaya maka abin da kowane abu a allo yake yi.",
    "faqH2": "Tambayoyi",
    "faq": [
      [
        "Zan iya ƙara girman katuna da rubutu?",
        "Ee. Zaɓi Babba ko Babba sosai a tagar Samun dama; katuna, rubutu da maɓallai suna girma tare a kowane allo, har da tebur."
      ],
      [
        "Akwai yanayin babban bambanci?",
        "Ee, a tagar Samun dama. Yana aiki da kowane girman fuska."
      ],
      [
        "Zan iya yin wasa ba tare da linzamin kwamfuta ko allon taɓawa ba?",
        "Ee, gaba ɗaya da madannai, da gamepad, ko da rimot na Android TV."
      ],
      [
        "Yana aiki da mai karanta allo?",
        "Ba gaba ɗaya ba tukuna. Sanarwar murya tana karanta abubuwan wasa da babbar murya kuma menu suna da lakabi, amma teburin poker kansa fuska ce ta gani kuma har yanzu ba za a iya buga shi da mai karanta allo kaɗai ba."
      ],
      [
        "Kyauta ne?",
        "Ee. PokerTH manhaja ce kyauta mai buɗaɗɗen tushe, babu talla kuma babu sayayya a cikin manhaja; duk chips kuɗin wasa ne."
      ]
    ]
  },
  he: {
    "title": "פוקר נגיש — טקסט גדול, מקלדת, גיימפד | PokerTH",
    "desc": "Texas Hold’em בחינם עם טקסט גדול יותר, ניגודיות גבוהה, חפיסות בארבעה צבעים, מגדלת לשולחן, הכרזות קוליות ומשחק מלא במקלדת, בגיימפד ובשלט הטלוויזיה.",
    "ldHeadline": "פוקר אונליין נגיש: טקסט גדול, ניגודיות גבוהה, מקלדת וגיימפד",
    "ldDesc": "תכונות הנגישות של לקוח הווב של PokerTH: גודל הממשק, ניגודיות גבוהה, חפיסות בארבעה צבעים, מגדלת, הכרזות קוליות, מקלדת, גיימפד ושלט טלוויזיה.",
    "h1": "פוקר נגיש: שחקו בדרך שלכם",
    "lead": "PokerTH הוא Texas Hold’em חינמי בדפדפן, והוא מתאים את עצמו לדרך שבה אתם רואים ומשחקים: טקסט וכפתורים גדולים יותר, ניגודיות חזקה יותר, חפיסות שמבדילות בין הסדרות בעזרת צבע, מגדלת למסכים קטנים, הכרזות קוליות ושליטה מלאה ממקלדת, מגיימפד או משלט טלוויזיה.",
    "findH2": "איפה זה נמצא",
    "findP": "הכפתור “נגישות” — סמל הדמות בראש כל מסך, ממסך הכניסה ועד השולחן — פותח את ההגדרות העיקריות בכל רגע, גם באמצע יד. כל השאר נמצא באפשרויות המתקדמות. הבחירות שלכם נשמרות במכשיר, וכשאתם מתחברים עם חשבון pokerth.net הן עוברות איתכם גם למכשירים האחרים שלכם.",
    "seeH2": "לראות את השולחן",
    "see": [
      [
        "גודל הממשק",
        "רגיל, גדול או גדול במיוחד: טקסט, קלפים, צ’יפים וכפתורים גדלים יחד, במסך הכניסה, בלובי ובשולחן, והפריסה מתארגנת מחדש כדי להישאר נוחה לשימוש בטלפון."
      ],
      [
        "ניגודיות גבוהה",
        "פלטה בניגודיות חזקה יותר בכל הממשק, מהתפריטים ועד השולחן, בכל גודל ממשק."
      ],
      [
        "חפיסות בארבעה צבעים",
        "חפיסות קלפים שבהן לכל סדרה יש צבע משלה, כך שאף פעם לא צריך להבדיל בין לבבות ליהלומים, או בין עלים לתלתנים, רק לפי הצורה. בחרו אחת באפשרויות מתקדמות ← סגנון."
      ],
      [
        "מגדלת לשולחן",
        "בטלפון, השולחן מוגדל פי שניים וזז באצבע; התצוגה חוזרת למושב שלכם כשמגיע תורכם. אפשר גם להתיר את זום הצביטה של הדפדפן."
      ],
      [
        "בהיר, כהה או אוטומטי",
        "כל הלקוח עוקב אחרי הבחירה שלכם או של המערכת, עם ערכות נושא, חפיסות וצבעי שולחן שנוחים לעיניים שלכם."
      ]
    ],
    "keysH2": "מקלדת",
    "keysP": "לכל פעולה יש מקש. מקשי הפונקציה הרשמיים של PokerTH פועלים בשולחן — F1 עד F4 ל-Fold, Check/Call, Bet/Raise ו-All-In, F5 להצגת הקלפים שלכם, F6 עד F8 למצבי המשחק — ולקוח הווב מוסיף אותיות בודדות (F, C, R, A, וגם 1, 2, 3 לשליש קופה, חצי קופה או קופה מלאה), שאת כולן אפשר להקצות מחדש. Escape סוגר את החלון העליון, Tab ומקשי החצים עוברים ברשימת השולחנות בלובי, ו-Alt+S פותח את ההגדרות מכל מקום.",
    "padH2": "גיימפד ושלט טלוויזיה",
    "padP": "בעזרת בקר משחק — Xbox, PlayStation, Switch Pro ורוב הבקרים מסוג Bluetooth — אפשר לשחק את כל המשחק: כפתורים לכל פעולה, הדקים לקביעת ההימור ומצב ניווט כדי לעבור בין המסכים, הצ’אט והתפריטים. הבקר רוטט כשמגיע תורכם. ב-Android TV וב-Google TV השלט עובד באותה דרך, ושלטים עם ארבעת מקשי הצבע משתמשים בהם ל-Fold, Check/Call, Bet/Raise ו-All-In.",
    "hearH2": "לשמוע ולהרגיש את המשחק",
    "hearP": "הכרזות קוליות מקריאות את אירועי המשחק בקולות של המכשיר שלכם, בשפה שלכם אם יש למערכת קול כזה. בטלפוני Android רטט קצר מסמן את תורכם. צלילי המשחק מחולקים לארבע קבוצות — פעולות, צ’אט, הודעות רשת ועליית בליינדים — שאפשר להפעיל או לכבות כל אחת בנפרד, עם מחוון עוצמה אחד.",
    "calmH2": "פחות הפתעות",
    "calmP": "כשהמערכת שלכם מבקשת להפחית תנועה, הלקוח מרכך את האנימציות שלו. מניעת הצצה שומרת את הקלפים שלכם מוסתרים עד שתקישו עליהם, ומגן ה-Call בשוגג חוסם לרגע את כפתור ה-Call מיד אחרי העלאה גדולה, כך שהקשה שכוונה ל-Call קטן יותר לא תשלם בטעות את הסכום המועלה.",
    "langH2": "בשפה שלכם, עם מדריך",
    "langP": "הממשק זמין ב-{langs} שפות, מימין לשמאל כשצריך. עזרת האס: האס, הקמע של לקוח הווב, מסביר כל מסך תוך כדי, אם תרצו, ו“מה זה?” אומר לכם מה עושה כל דבר על המסך.",
    "faqH2": "שאלות",
    "faq": [
      [
        "אפשר להגדיל את הקלפים ואת הטקסט?",
        "כן. בחרו גדול או גדול במיוחד בחלון הנגישות; קלפים, טקסט וכפתורים גדלים יחד בכל מסך, כולל השולחן."
      ],
      [
        "יש מצב ניגודיות גבוהה?",
        "כן, בחלון הנגישות. הוא עובד עם כל גודל ממשק."
      ],
      [
        "אפשר לשחק בלי עכבר או מסך מגע?",
        "כן, לגמרי במקלדת, בגיימפד או בשלט של Android TV."
      ],
      [
        "זה עובד עם קורא מסך?",
        "עדיין לא באופן מלא. הכרזות קוליות מקריאות את אירועי המשחק והתפריטים כוללים תוויות, אבל שולחן הפוקר עצמו הוא ממשק חזותי ועדיין אי אפשר לשחק בו בעזרת קורא מסך בלבד."
      ],
      [
        "זה בחינם?",
        "כן. PokerTH היא תוכנה חופשית בקוד פתוח, בלי פרסומות ובלי רכישות בתוך האפליקציה; כל הצ’יפים הם כסף משחק."
      ]
    ]
  },
  hi: {
    "title": "सुलभ पोकर — बड़ा टेक्स्ट, कीबोर्ड, गेमपैड | PokerTH",
    "desc": "मुफ़्त Texas Hold’em: बड़ा टेक्स्ट, उच्च कंट्रास्ट, 4-रंग की गड्डियाँ, मेज़ आवर्धक, आवाज़ की घोषणाएँ और कीबोर्ड, गेमपैड या टीवी रिमोट से पूरा नियंत्रण।",
    "ldHeadline": "सुलभ ऑनलाइन पोकर: बड़ा टेक्स्ट, उच्च कंट्रास्ट, कीबोर्ड और गेमपैड",
    "ldDesc": "PokerTH वेब क्लाइंट की सुलभता सुविधाएँ: इंटरफ़ेस का आकार, उच्च कंट्रास्ट, 4-रंग की गड्डियाँ, आवर्धक, आवाज़ की घोषणाएँ, कीबोर्ड, गेमपैड और टीवी रिमोट।",
    "h1": "सुलभ पोकर: अपने तरीक़े से खेलें",
    "lead": "PokerTH ब्राउज़र में मुफ़्त Texas Hold’em है, और यह आपके देखने और खेलने के तरीक़े के अनुसार ढल जाता है: बड़ा टेक्स्ट और बटन, ज़्यादा गहरा कंट्रास्ट, ऐसी गड्डियाँ जिनमें हर सूट का अपना रंग है, छोटी स्क्रीन के लिए आवर्धक, आवाज़ की घोषणाएँ, और कीबोर्ड, गेमपैड या टीवी रिमोट से पूरा नियंत्रण।",
    "findH2": "यह कहाँ मिलेगा",
    "findP": "सुलभता बटन — हर स्क्रीन के ऊपर व्यक्ति वाला आइकन, लॉगिन स्क्रीन से लेकर मेज़ तक — मुख्य सेटिंग्स किसी भी समय खोलता है, हाथ के बीच में भी। बाक़ी सब कुछ उन्नत विकल्प में है। आपके चुनाव उपकरण पर याद रखे जाते हैं और, जब आप pokerth.net खाते से लॉग इन करते हैं, तो आपके दूसरे उपकरणों पर भी आपके साथ जाते हैं।",
    "seeH2": "मेज़ को साफ़ देखना",
    "see": [
      [
        "इंटरफ़ेस का आकार",
        "मानक, बड़ा या बहुत बड़ा: टेक्स्ट, पत्ते, चिप्स और बटन एक साथ बड़े होते हैं, लॉगिन स्क्रीन पर, लॉबी में और मेज़ पर, और लेआउट ख़ुद को फिर से सजाता है ताकि फ़ोन पर भी इस्तेमाल लायक़ रहे।"
      ],
      [
        "उच्च कंट्रास्ट",
        "पूरे इंटरफ़ेस में ज़्यादा गहरे कंट्रास्ट वाली रंग-पट्टिका, मेन्यू से लेकर मेज़ तक, हर इंटरफ़ेस आकार पर।"
      ],
      [
        "4-रंग की गड्डियाँ",
        "ऐसी ताश की गड्डियाँ जो हर सूट को उसका अपना रंग देती हैं, ताकि पान और ईंट, या हुकुम और चिड़ी, को कभी सिर्फ़ आकार से न पहचानना पड़े। उन्नत विकल्प → शैली में कोई एक चुनें।"
      ],
      [
        "मेज़ आवर्धक",
        "फ़ोन पर मेज़ दोगुने आकार तक ज़ूम होती है और उँगली से खिसकती है; आपकी बारी आने पर दृश्य आपकी सीट पर लौट आता है। ब्राउज़र का पिंच-ज़ूम भी चालू किया जा सकता है।"
      ],
      [
        "हल्का, गहरा या स्वचालित",
        "पूरा क्लाइंट आपकी या आपके सिस्टम की पसंद का पालन करता है, आपकी आँखों के अनुकूल थीम, गड्डियों और मेज़ के रंगों के साथ।"
      ]
    ],
    "keysH2": "कीबोर्ड",
    "keysP": "हर क्रिया के लिए एक कुंजी है। PokerTH की आधिकारिक फ़ंक्शन कुंजियाँ मेज़ पर काम करती हैं — Fold, Check/Call, Bet/Raise और All-In के लिए F1 से F4, अपने पत्ते दिखाने के लिए F5, खेल मोड के लिए F6 से F8 — और वेब क्लाइंट अकेले अक्षर जोड़ता है (F, C, R, A, और पॉट के एक-तिहाई, आधे पॉट या पूरे पॉट के लिए 1, 2, 3), जिन सभी को बदला जा सकता है। Esc सबसे ऊपर की विंडो बंद करता है, Tab और तीर कुंजियाँ लॉबी की मेज़-सूची में घूमती हैं, और Alt+S कहीं से भी सेटिंग्स खोलता है।",
    "padH2": "गेमपैड और टीवी रिमोट",
    "padP": "गेम कंट्रोलर — Xbox, PlayStation, Switch Pro और अधिकांश Bluetooth पैड — पूरा खेल खेलता है: हर क्रिया के लिए बटन, दाँव तय करने के लिए ट्रिगर, और स्क्रीन, चैट और मेन्यू में घूमने के लिए नेविगेशन मोड। आपकी बारी आने पर यह कंपन करता है। Android TV और Google TV पर रिमोट इसी तरह काम करता है, और चार रंगीन कुंजियों वाले रिमोट उन्हें Fold, Check/Call, Bet/Raise और All-In के लिए इस्तेमाल करते हैं।",
    "hearH2": "खेल को सुनें और महसूस करें",
    "hearP": "आवाज़ की घोषणाएँ आपके उपकरण की अपनी आवाज़ों से खेल की घटनाएँ ऊँची आवाज़ में पढ़ती हैं, आपकी भाषा में, अगर सिस्टम में वह उपलब्ध हो। Android फ़ोन पर एक छोटा कंपन आपकी बारी बताता है। खेल की ध्वनियाँ चार समूहों में हैं — क्रियाएँ, चैट, नेटवर्क सूचनाएँ और ब्लाइंड बढ़ना — जिन्हें अलग-अलग चालू या बंद किया जा सकता है, एक ही वॉल्यूम स्लाइडर के साथ।",
    "calmH2": "कम चौंकाने वाली बातें",
    "calmP": "जब आपका सिस्टम कम गति की माँग करता है, तो क्लाइंट अपने एनिमेशन हल्के कर देता है। झाँकने से सुरक्षा आपके अपने पत्तों को तब तक छिपाए रखती है जब तक आप उन्हें छू न लें, और आकस्मिक Call से सुरक्षा किसी बड़ी बढ़त के तुरंत बाद Call बटन को थोड़ी देर के लिए बंद कर देती है, ताकि छोटे Call के लिए किया गया स्पर्श गलती से बढ़ी हुई राशि न चुका दे।",
    "langH2": "आपकी भाषा में, एक गाइड के साथ",
    "langP": "इंटरफ़ेस {langs} भाषाओं में उपलब्ध है, ज़रूरत हो तो दाएँ से बाएँ। इक्के की सहायता के साथ इक्का — वेब क्लाइंट का शुभंकर — अगर आप चाहें तो हर स्क्रीन को साथ-साथ समझाता है, और “यह क्या है?” बताता है कि स्क्रीन पर कोई भी चीज़ क्या करती है।",
    "faqH2": "सवाल",
    "faq": [
      [
        "क्या मैं पत्ते और टेक्स्ट बड़े कर सकता हूँ?",
        "हाँ। सुलभता विंडो में बड़ा या बहुत बड़ा चुनें; पत्ते, टेक्स्ट और बटन हर स्क्रीन पर एक साथ बड़े होते हैं, मेज़ पर भी।"
      ],
      [
        "क्या उच्च कंट्रास्ट मोड है?",
        "हाँ, सुलभता विंडो में। यह हर इंटरफ़ेस आकार के साथ काम करता है।"
      ],
      [
        "क्या मैं माउस या टच स्क्रीन के बिना खेल सकता हूँ?",
        "हाँ, पूरी तरह कीबोर्ड से, गेमपैड से या Android TV रिमोट से।"
      ],
      [
        "क्या यह स्क्रीन रीडर के साथ काम करता है?",
        "अभी पूरी तरह नहीं। आवाज़ की घोषणाएँ खेल की घटनाएँ ऊँची आवाज़ में पढ़ती हैं और मेन्यू पर लेबल हैं, लेकिन पोकर की मेज़ अपने आप में एक दृश्य इंटरफ़ेस है और अभी केवल स्क्रीन रीडर के सहारे नहीं खेली जा सकती।"
      ],
      [
        "क्या यह मुफ़्त है?",
        "हाँ। PokerTH मुफ़्त और ओपन सोर्स सॉफ़्टवेयर है, न विज्ञापन, न इन-ऐप ख़रीद; सभी चिप्स केवल खेल के हैं।"
      ]
    ]
  },
  hr: {
    "title": "Pristupačan poker — veliki tekst, tipkovnica, kontroler | PokerTH",
    "desc": "Besplatan Texas Hold’em: veći tekst, visoki kontrast, špilovi u četiri boje, povećalo, glasovne najave te potpuna igra tipkovnicom, kontrolerom i TV daljinskim.",
    "ldHeadline": "Pristupačan online poker: veliki tekst, visoki kontrast, tipkovnica i kontroler",
    "ldDesc": "Značajke pristupačnosti PokerTH web-klijenta: veličina sučelja, visoki kontrast, špilovi u četiri boje, povećalo, glasovne najave, tipkovnica, kontroler i TV daljinski upravljač.",
    "h1": "Pristupačan poker: igrajte na svoj način",
    "lead": "PokerTH je besplatan Texas Hold’em u pregledniku koji se prilagođava načinu na koji vidite i igrate: veći tekst i gumbi, jači kontrast, špilovi koji boje karata razlikuju i nijansom, povećalo za male zaslone, glasovne najave te potpuno upravljanje tipkovnicom, kontrolerom ili TV daljinskim upravljačem.",
    "findH2": "Gdje se nalazi",
    "findP": "Gumb Pristupačnost — ikona osobe na vrhu svakog zaslona, od zaslona za prijavu do stola — u svakom trenutku otvara glavne postavke, čak i usred ruke. Sve ostalo nalazi se u Naprednim opcijama. Vaši izbori pamte se na uređaju i, kad se prijavite s pokerth.net računom, prate vas na vaše druge uređaje.",
    "seeH2": "Pregled stola",
    "see": [
      [
        "Veličina sučelja",
        "Standardno, Veliko ili Vrlo veliko: tekst, karte, žetoni i gumbi rastu zajedno, na zaslonu za prijavu, u predvorju i za stolom, a raspored se prilagođava kako bi ostao upotrebljiv na telefonu."
      ],
      [
        "Visoki kontrast",
        "Kontrastnija paleta u cijelom sučelju, od izbornika do stola, pri svakoj veličini sučelja."
      ],
      [
        "Špilovi u četiri boje",
        "Špilovi karata koji svakoj boji daju vlastitu nijansu, tako da se herc i karo, ili pik i tref, nikad ne razlikuju samo po obliku. Odaberite jedan u Napredne opcije → Stil."
      ],
      [
        "Povećalo stola",
        "Na telefonu se stol zumira na dvostruku veličinu i pomiče prstom; prikaz se vraća na vaše mjesto kad ste na potezu. Može se dopustiti i zumiranje štipanjem u pregledniku."
      ],
      [
        "Svijetlo, tamno ili automatski",
        "Cijeli klijent prati vaš izbor ili izbor vašeg sustava, s temama, špilovima i bojama stola prilagođenima vašim očima."
      ]
    ],
    "keysH2": "Tipkovnica",
    "keysP": "Svaka radnja ima svoju tipku. Službene funkcijske tipke PokerTH-a rade za stolom — F1 do F4 za Fold, Check/Call, Bet/Raise i All-In, F5 za pokazivanje vaših karata, F6 do F8 za načine igre — a web-klijent dodaje pojedinačna slova (F, C, R, A te 1, 2, 3 za trećinu pota, pola pota ili cijeli pot), koja se sva mogu preraspodijeliti. Esc zatvara gornji prozor, Tab i strelice kreću se popisom stolova u predvorju, a Alt+S otvara postavke s bilo kojeg mjesta.",
    "padH2": "Kontroler i TV daljinski upravljač",
    "padP": "Kontrolerom za igre — Xbox, PlayStation, Switch Pro i većinom Bluetooth kontrolera — igra se cijela igra: gumbi za svaku radnju, okidači za podešavanje uloga i način Navigacija za kretanje po zaslonima, chatu i izbornicima. Kontroler zavibrira kad dođete na potez. Na Android TV-u i Google TV-u daljinski upravljač radi na isti način, a daljinski s četiri tipke u boji koriste ih za Fold, Check/Call, Bet/Raise i All-In.",
    "hearH2": "Čuti i osjetiti igru",
    "hearP": "Glasovne najave naglas čitaju događaje u igri glasovima vašeg uređaja, na vašem jeziku ako ga sustav ima. Na Android telefonima kratka vibracija označava vaš potez. Zvukovi igre podijeljeni su u četiri skupine — radnje, chat, mrežne obavijesti i povećanja blindova — koje se mogu zasebno uključiti ili isključiti, uz jedan klizač glasnoće.",
    "calmH2": "Manje iznenađenja",
    "calmP": "Kad vaš sustav zatraži smanjeno kretanje, klijent ublažava svoje animacije. Zaštita od virenja drži vaše karte skrivenima dok ih ne dodirnete, a zaštita od slučajnog Calla nakratko zaključava gumb Call odmah nakon velikog povišenja, kako dodir namijenjen manjem Callu ne bi greškom platio povišeni iznos.",
    "langH2": "Na vašem jeziku, s vodičem",
    "langP": "Sučelje je dostupno na {langs} jezika, zdesna nalijevo gdje je potrebno. Pomoć asa, maskota web-klijenta, objašnjava vam svaki zaslon dok napredujete, ako to želite, a „Što je ovo?“ govori vam čemu služi bilo što na zaslonu.",
    "faqH2": "Pitanja",
    "faq": [
      [
        "Mogu li povećati karte i tekst?",
        "Da. U prozoru Pristupačnost odaberite Veliko ili Vrlo veliko; karte, tekst i gumbi rastu zajedno na svakom zaslonu, uključujući stol."
      ],
      [
        "Postoji li način visokog kontrasta?",
        "Da, u prozoru Pristupačnost. Radi uz svaku veličinu sučelja."
      ],
      [
        "Mogu li igrati bez miša ili zaslona osjetljivog na dodir?",
        "Da, u potpunosti tipkovnicom, kontrolerom ili daljinskim upravljačem za Android TV."
      ],
      [
        "Radi li s čitačem zaslona?",
        "Još ne u potpunosti. Glasovne najave naglas čitaju događaje u igri i izbornici imaju oznake, ali sam pokerski stol je vizualno sučelje i još se ne može igrati samo s čitačem zaslona."
      ],
      [
        "Je li besplatan?",
        "Da. PokerTH je slobodan softver otvorenog koda, bez oglasa i kupnji unutar aplikacije; svi su žetoni igraći novac."
      ]
    ]
  },
  hu: {
    "title": "Akadálymentes póker — nagy betű, billentyűzet, kontroller | PokerTH",
    "desc": "Ingyenes Texas Hold’em nagyobb betűkkel, magas kontraszttal, négyszínű paklikkal, nagyítóval, hangbemondással és teljes billentyűzetes vagy kontrolleres irányítással.",
    "ldHeadline": "Akadálymentes online póker: nagy betű, magas kontraszt, billentyűzet és kontroller",
    "ldDesc": "A PokerTH webkliens akadálymentességi funkciói: felület mérete, magas kontraszt, négyszínű paklik, nagyító, hangbemondás, billentyűzet, kontroller és TV-távirányító.",
    "h1": "Akadálymentes póker: játssz a magad módján",
    "lead": "A PokerTH ingyenes Texas Hold’em a böngészőben, és alkalmazkodik ahhoz, ahogyan látsz és játszol: nagyobb szöveg és gombok, erősebb kontraszt, paklik, amelyek a kártyaszíneket színnel is megkülönböztetik, nagyító kis képernyőkhöz, hangbemondás, valamint teljes irányítás billentyűzettel, kontrollerrel vagy TV-távirányítóval.",
    "findH2": "Hol találod",
    "findP": "Az Akadálymentesség gomb — a személyt ábrázoló ikon minden képernyő tetején, a bejelentkezési képernyőtől az asztalig — bármikor megnyitja a fő beállításokat, akár egy leosztás közepén is. Minden más a Speciális beállításokban van. A választásaidat az eszköz megjegyzi, és ha pokerth.net-fiókkal jelentkezel be, a többi eszközödre is követnek.",
    "seeH2": "Az asztal látványa",
    "see": [
      [
        "Felület mérete",
        "Normál, Nagy vagy Extra nagy: a szöveg, a lapok, a zsetonok és a gombok együtt nőnek a bejelentkezési képernyőn, az előtérben és az asztalnál, az elrendezés pedig átrendeződik, hogy telefonon is kényelmesen használható maradjon."
      ],
      [
        "Magas kontraszt",
        "Erősebb kontrasztú paletta az egész felületen, a menüktől az asztalig, minden felületméretnél."
      ],
      [
        "Négyszínű paklik",
        "Kártyapaklik, amelyekben minden színnek saját színe van, így a kőr és a káró, vagy a pikk és a treff sosem csak a formájáról ismerhető fel. Válassz egyet a Speciális beállítások → Stílus alatt."
      ],
      [
        "Asztalnagyító",
        "Telefonon az asztal kétszeresére nagyítható és ujjal mozgatható; a nézet visszatér a helyedre, amikor te következel. A böngésző csippentéses nagyítása is engedélyezhető."
      ],
      [
        "Világos, sötét vagy automatikus",
        "Az egész kliens a te választásodat vagy a rendszeredét követi, a szemednek megfelelő témákkal, paklikkal és asztalszínekkel."
      ]
    ],
    "keysH2": "Billentyűzet",
    "keysP": "Minden akciónak van billentyűje. A hivatalos PokerTH funkcióbillentyűk működnek az asztalnál — F1–F4: Fold, Check/Call, Bet/Raise és All-In, F5: a lapjaid megmutatása, F6–F8: a játékmódok —, a webkliens pedig egybetűs billentyűkkel egészíti ki őket (F, C, R, A, valamint 1, 2, 3 a pot harmadához, feléhez vagy egészéhez), és mindegyik átrendelhető. Az Escape bezárja a legfelső ablakot, a Tab és a nyílbillentyűk az előtér asztallistáján mozognak, az Alt+S pedig bárhonnan megnyitja a beállításokat.",
    "padH2": "Kontroller és TV-távirányító",
    "padP": "Egy játékkontroller — Xbox, PlayStation, Switch Pro és a legtöbb Bluetooth-kontroller — az egész játékot vezérli: gombok minden akcióhoz, ravaszok a tét beállításához, és navigációs mód a képernyők, a csevegés és a menük bejárásához. Rezeg, amikor te következel. Android TV-n és Google TV-n a távirányító ugyanígy működik, a négy színes gombbal rendelkező távirányítók pedig ezeket használják a Fold, Check/Call, Bet/Raise és All-In műveletekhez.",
    "hearH2": "Halld és érezd a játékot",
    "hearP": "A hangbemondás az eszközöd saját hangjaival felolvassa a játékeseményeket, a te nyelveden, ha a rendszerben van ilyen hang. Android telefonokon egy rövid rezgés jelzi, hogy te következel. A játékhangok négy csoportba tartoznak — akciók, csevegés, hálózati értesítések és vakemelések —, amelyek külön-külön kapcsolhatók be és ki, egyetlen hangerőcsúszkával.",
    "calmH2": "Kevesebb meglepetés",
    "calmP": "Ha a rendszered csökkentett mozgást kér, a kliens visszafogja az animációit. A leskelődés elleni védelem addig rejtve tartja a saját lapjaidat, amíg meg nem érinted őket, a véletlen Call elleni védelem pedig egy nagy emelés után rövid időre zárolja a Call gombot, hogy egy kisebb Callnak szánt érintés ne fizethesse ki tévedésből a megemelt összeget.",
    "langH2": "A te nyelveden, idegenvezetővel",
    "langP": "A felület {langs} nyelven érhető el, ahol kell, jobbról balra. Az ász súgójával az ász, a webkliens kabalája, ha szeretnéd, menet közben elmagyaráz minden képernyőt, a „Mi ez?” pedig megmondja, mire való bármi a képernyőn.",
    "faqH2": "Kérdések",
    "faq": [
      [
        "Nagyobbra állíthatom a lapokat és a szöveget?",
        "Igen. Válaszd a Nagy vagy az Extra nagy méretet az Akadálymentesség ablakban; a lapok, a szöveg és a gombok együtt nőnek minden képernyőn, az asztalt is beleértve."
      ],
      [
        "Van magas kontrasztú mód?",
        "Igen, az Akadálymentesség ablakban. Minden felületmérettel működik."
      ],
      [
        "Játszhatok egér és érintőképernyő nélkül?",
        "Igen, teljes egészében billentyűzettel, kontrollerrel vagy Android TV-távirányítóval."
      ],
      [
        "Működik képernyőolvasóval?",
        "Még nem teljesen. A hangbemondás felolvassa a játékeseményeket, és a menük címkékkel vannak ellátva, de maga a pókerasztal vizuális felület, és egyedül képernyőolvasóval még nem lehet rajta játszani."
      ],
      [
        "Ingyenes?",
        "Igen. A PokerTH ingyenes, nyílt forráskódú szoftver, reklámok és alkalmazáson belüli vásárlások nélkül; minden zseton csak játékpénz."
      ]
    ]
  },
  hy: {
    "title": "Մատչելի պոկեր — մեծ տեքստ, ստեղնաշար, գեյմփեդ | PokerTH",
    "desc": "Անվճար Texas Hold’em՝ մեծ տեքստ, բարձր կոնտրաստ, 4 գույնի կապուկներ, սեղանի խոշորացույց, ձայնային ուղեկցում և լիարժեք խաղ ստեղնաշարով, գեյմփեդով կամ հեռակառավարիչով։",
    "ldHeadline": "Մատչելի առցանց պոկեր՝ մեծ տեքստ, բարձր կոնտրաստ, ստեղնաշար և գեյմփեդ",
    "ldDesc": "PokerTH վեբ-կլիենտի մատչելիության գործառույթները՝ ինտերֆեյսի չափ, բարձր կոնտրաստ, չորս գույնի կապուկներ, խոշորացույց, ձայնային հայտարարություններ, ստեղնաշար, խաղային կարգավար և հեռուստացույցի հեռակառավարիչ։",
    "h1": "Մատչելի պոկեր՝ խաղացեք ձեր ձևով",
    "lead": "PokerTH-ը անվճար Texas Hold’em է դիտարկիչում, և այն հարմարվում է նրան, թե ինչպես եք տեսնում և խաղում՝ ավելի մեծ տեքստ և կոճակներ, ավելի ուժեղ կոնտրաստ, կապուկներ, որոնք խաղաթղթերի տեսակները տարբերում են գույնով, խոշորացույց փոքր էկրանների համար, ձայնային հայտարարություններ և ամբողջական կառավարում ստեղնաշարով, խաղային կարգավարով կամ հեռուստացույցի հեռակառավարիչով։",
    "findH2": "Որտեղ գտնել",
    "findP": "Մատչելիություն կոճակը — մարդու պատկերակը յուրաքանչյուր էկրանի վերևում՝ մուտքի էկրանից մինչև սեղան — ցանկացած պահի բացում է հիմնական կարգավորումները, նույնիսկ ձեռքի ընթացքում։ Մնացած ամեն ինչ Լրացուցիչ ընտրանքներում է։ Ձեր ընտրությունները հիշվում են սարքում, իսկ pokerth.net հաշվով մուտք գործելիս ձեզ հետ անցնում են նաև ձեր մյուս սարքերին։",
    "seeH2": "Սեղանը լավ տեսնել",
    "see": [
      [
        "Ինտերֆեյսի չափ",
        "Ստանդարտ, Մեծ կամ Շատ մեծ՝ տեքստը, խաղաթղթերը, ֆիշկաները և կոճակները մեծանում են միասին՝ մուտքի էկրանին, լոբբիում և սեղանի մոտ, իսկ դասավորությունը վերադասավորվում է, որպեսզի հեռախոսում էլ հարմար մնա։"
      ],
      [
        "Բարձր կոնտրաստ",
        "Ավելի ուժեղ կոնտրաստով գունապնակ ամբողջ ինտերֆեյսում՝ ընտրացանկերից մինչև սեղան, ինտերֆեյսի ցանկացած չափի դեպքում։"
      ],
      [
        "Չորս գույնի կապուկներ",
        "Կապուկներ, որոնցում խաղաթղթերի յուրաքանչյուր տեսակ ունի իր գույնը, այնպես որ ♥-ն ու ♦-ն, կամ ♠-ն ու ♣-ն, երբեք պետք չէ տարբերել միայն ձևով։ Ընտրեք մեկը Լրացուցիչ ընտրանքներ → Ոճ բաժնում։"
      ],
      [
        "Սեղանի խոշորացույց",
        "Հեռախոսում սեղանը մեծանում է երկու անգամ և տեղաշարժվում է մատով. երբ ձեր հերթն է, տեսքը վերադառնում է ձեր նստատեղին։ Կարելի է թույլատրել նաև դիտարկիչի մասշտաբավորումը երկու մատով։"
      ],
      [
        "Բաց, մուգ կամ ավտոմատ",
        "Ամբողջ կլիենտը հետևում է ձեր կամ ձեր համակարգի ընտրությանը՝ ձեր աչքերին հարմար թեմաներով, կապուկներով և սեղանի գույներով։"
      ]
    ],
    "keysH2": "Ստեղնաշար",
    "keysP": "Յուրաքանչյուր գործողություն ունի իր ստեղնը։ PokerTH-ի պաշտոնական ֆունկցիոնալ ստեղներն աշխատում են սեղանի մոտ — F1-ից F4՝ Fold, Check/Call, Bet/Raise և All-In, F5՝ ձեր խաղաթղթերը ցույց տալու համար, F6-ից F8՝ խաղի ռեժիմների համար — իսկ վեբ-կլիենտն ավելացնում է առանձին տառեր (F, C, R, A, և 1, 2, 3՝ բանկի մեկ երրորդի, բանկի կեսի կամ ամբողջ բանկի համար), որոնք բոլորը կարելի է վերանշանակել։ Esc-ը փակում է վերևի պատուհանը, Tab-ը և սլաքները շարժվում են լոբբիի սեղանների ցանկով, իսկ Alt+S-ը բացում է կարգավորումները ցանկացած տեղից։",
    "padH2": "Խաղային կարգավար և հեռուստացույցի հեռակառավարիչ",
    "padP": "Խաղային կարգավարով — Xbox, PlayStation, Switch Pro և Bluetooth կարգավարների մեծ մասը — կարելի է խաղալ ամբողջ խաղը՝ կոճակներ յուրաքանչյուր գործողության համար, ձգաններ՝ խաղադրույքը սահմանելու համար, և նավարկման ռեժիմ՝ էկրաններով, չատով և ընտրացանկերով շարժվելու համար։ Այն թրթռում է, երբ գալիս է ձեր հերթը։ Android TV-ում և Google TV-ում հեռակառավարիչն աշխատում է նույն կերպ, իսկ չորս գունավոր ստեղներ ունեցող հեռակառավարիչներն օգտագործում են դրանք Fold, Check/Call, Bet/Raise և All-In-ի համար։",
    "hearH2": "Լսել և զգալ խաղը",
    "hearP": "Ձայնային հայտարարությունները բարձրաձայն կարդում են խաղի իրադարձությունները ձեր սարքի սեփական ձայներով՝ ձեր լեզվով, եթե համակարգն այն ունի։ Android հեռախոսներում կարճ թրթռոցը նշում է ձեր հերթը։ Խաղի ձայները բաժանված են չորս խմբի — գործողություններ, չատ, ցանցային ծանուցումներ և բլայնդների բարձրացում — որոնք կարելի է միացնել կամ անջատել առանձին, ձայնի ուժգնության մեկ սահիչով։",
    "calmH2": "Ավելի քիչ անակնկալներ",
    "calmP": "Երբ ձեր համակարգը խնդրում է նվազեցնել շարժումը, կլիենտը մեղմացնում է իր անիմացիաները։ Anti-peek-ը ձեր սեփական խաղաթղթերը փակ է պահում, մինչև դրանց չհպեք, իսկ պատահական call-ի պաշտպանությունը մեծ raise-ից անմիջապես հետո կարճ ժամանակով արգելափակում է Call կոճակը, որպեսզի ավելի փոքր call-ի համար նախատեսված հպումը սխալմամբ չվճարի բարձրացված գումարը։",
    "langH2": "Ձեր լեզվով, ուղեկցորդով",
    "langP": "Ինտերֆեյսը հասանելի է {langs} լեզուներով, անհրաժեշտության դեպքում՝ աջից ձախ։ Տուզի օգնությունը՝ վեբ-կլիենտի թալիսմանը, ցանկության դեպքում բացատրում է յուրաքանչյուր էկրան ձեր առաջընթացին զուգընթաց, իսկ «Ի՞նչ է սա»-ն ասում է, թե ինչ է անում էկրանի ցանկացած տարր։",
    "faqH2": "Հարցեր",
    "faq": [
      [
        "Կարո՞ղ եմ մեծացնել խաղաթղթերը և տեքստը։",
        "Այո։ Մատչելիություն պատուհանում ընտրեք Մեծ կամ Շատ մեծ. խաղաթղթերը, տեքստը և կոճակները մեծանում են միասին բոլոր էկրաններում, այդ թվում՝ սեղանի մոտ։"
      ],
      [
        "Կա՞ բարձր կոնտրաստի ռեժիմ։",
        "Այո, Մատչելիություն պատուհանում։ Այն աշխատում է ինտերֆեյսի ցանկացած չափի հետ։"
      ],
      [
        "Կարո՞ղ եմ խաղալ առանց մկնիկի կամ սենսորային էկրանի։",
        "Այո, ամբողջությամբ ստեղնաշարով, խաղային կարգավարով կամ Android TV-ի հեռակառավարիչով։"
      ],
      [
        "Աշխատո՞ւմ է էկրանի ընթերցիչի հետ։",
        "Դեռ ոչ ամբողջությամբ։ Ձայնային հայտարարությունները բարձրաձայն կարդում են խաղի իրադարձությունները, և ընտրացանկերն ունեն պիտակներ, բայց պոկերի սեղանն ինքնին տեսողական ինտերֆեյս է, և դեռ հնարավոր չէ խաղալ միայն էկրանի ընթերցիչով։"
      ],
      [
        "Անվճա՞ր է։",
        "Այո։ PokerTH-ը անվճար և բաց կոդով ծրագիր է՝ առանց գովազդի և առանց ներհավելվածային գնումների. բոլոր ֆիշկաները խաղային փող են։"
      ]
    ]
  },
  id: {
    "title": "Poker Aksesibel — Teks Besar, Keyboard, Gamepad | PokerTH",
    "desc": "Texas Hold’em gratis: teks lebih besar, kontras tinggi, dek empat warna, kaca pembesar meja, pengumuman suara, dan main penuh dengan keyboard, gamepad, atau remote TV.",
    "ldHeadline": "Poker online yang mudah diakses: teks besar, kontras tinggi, keyboard, dan gamepad",
    "ldDesc": "Fitur aksesibilitas klien web PokerTH: ukuran antarmuka, kontras tinggi, dek empat warna, kaca pembesar, pengumuman suara, keyboard, gamepad, dan remote TV.",
    "h1": "Poker yang mudah diakses: main dengan cara Anda",
    "lead": "PokerTH adalah Texas Hold’em gratis di peramban, dan menyesuaikan diri dengan cara Anda melihat dan bermain: teks dan tombol lebih besar, kontras lebih kuat, dek yang membedakan jenis kartu dengan warna, kaca pembesar untuk layar kecil, pengumuman suara, serta kendali penuh dari keyboard, gamepad, atau remote TV.",
    "findH2": "Di mana menemukannya",
    "findP": "Tombol Aksesibilitas — ikon orang di bagian atas setiap layar, dari layar masuk hingga meja — membuka pengaturan utama kapan saja, bahkan saat satu putaran sedang berlangsung. Semua yang lain ada di Opsi lanjutan. Pilihan Anda diingat di perangkat dan, saat Anda masuk dengan akun pokerth.net, ikut ke perangkat Anda yang lain.",
    "seeH2": "Melihat meja dengan jelas",
    "see": [
      [
        "Ukuran antarmuka",
        "Standar, Besar, atau Sangat besar: teks, kartu, chip, dan tombol membesar bersama, di layar masuk, di lobi, dan di meja, dan tata letaknya menyesuaikan agar tetap nyaman dipakai di ponsel."
      ],
      [
        "Kontras tinggi",
        "Palet dengan kontras lebih kuat di seluruh antarmuka, dari menu hingga meja, di setiap ukuran antarmuka."
      ],
      [
        "Dek empat warna",
        "Dek kartu yang memberi setiap jenis kartu warnanya sendiri, sehingga hati dan wajik, atau sekop dan keriting, tidak pernah dibedakan hanya dari bentuknya. Pilih salah satunya di Opsi lanjutan → Gaya."
      ],
      [
        "Kaca pembesar meja",
        "Di ponsel, meja diperbesar dua kali lipat dan dapat digeser dengan jari; tampilan kembali ke kursi Anda saat giliran Anda. Zoom cubit peramban juga dapat diizinkan."
      ],
      [
        "Terang, gelap, atau otomatis",
        "Seluruh klien mengikuti pilihan Anda atau pilihan sistem Anda, dengan tema, dek, dan warna meja yang nyaman di mata Anda."
      ]
    ],
    "keysH2": "Keyboard",
    "keysP": "Setiap aksi punya tombolnya. Tombol fungsi PokerTH resmi berfungsi di meja — F1 sampai F4 untuk Fold, Check/Call, Bet/Raise, dan All-In, F5 untuk memperlihatkan kartu Anda, F6 sampai F8 untuk mode bermain — dan klien web menambahkan huruf tunggal (F, C, R, A, serta 1, 2, 3 untuk sepertiga pot, setengah pot, atau satu pot), yang semuanya dapat ditetapkan ulang. Escape menutup jendela teratas, Tab dan tombol panah menelusuri daftar meja di lobi, dan Alt+S membuka pengaturan dari mana saja.",
    "padH2": "Gamepad dan remote TV",
    "padP": "Pengontrol game — Xbox, PlayStation, Switch Pro, dan sebagian besar pad Bluetooth — memainkan seluruh permainan: tombol untuk setiap aksi, pemicu untuk mengatur taruhan, dan mode navigasi untuk bergerak di layar, obrolan, dan menu. Pengontrol bergetar saat giliran Anda tiba. Di Android TV dan Google TV, remote bekerja dengan cara yang sama, dan remote yang memiliki empat tombol warna memakainya untuk Fold, Check/Call, Bet/Raise, dan All-In.",
    "hearH2": "Mendengar dan merasakan permainan",
    "hearP": "Pengumuman suara membacakan peristiwa permainan dengan suara bawaan perangkat Anda, dalam bahasa Anda bila sistem menyediakannya. Di ponsel Android, getaran singkat menandai giliran Anda. Suara permainan terbagi dalam empat kelompok — aksi, obrolan, pemberitahuan jaringan, dan kenaikan blind — yang dapat diaktifkan atau dimatikan secara terpisah, dengan satu penggeser volume.",
    "calmH2": "Lebih sedikit kejutan",
    "calmP": "Saat sistem Anda meminta gerakan dikurangi, klien meredam animasinya. Anti-intip menjaga kartu Anda tetap tersembunyi sampai Anda mengetuknya, dan penjaga call tak sengaja memblokir sebentar tombol Call tepat setelah raise besar, sehingga ketukan yang dimaksudkan untuk call yang lebih kecil tidak bisa membayar jumlah yang dinaikkan secara tidak sengaja.",
    "langH2": "Dalam bahasa Anda, dengan pemandu",
    "langP": "Antarmuka tersedia dalam {langs} bahasa, dari kanan ke kiri bila perlu. Bantuan si As — si As adalah maskot klien web — menjelaskan setiap layar sambil Anda bermain bila Anda mau, dan “Apa ini?” memberi tahu Anda fungsi apa pun di layar.",
    "faqH2": "Pertanyaan",
    "faq": [
      [
        "Bisakah saya memperbesar kartu dan teks?",
        "Ya. Pilih Besar atau Sangat besar di jendela Aksesibilitas; kartu, teks, dan tombol membesar bersama di setiap layar, termasuk meja."
      ],
      [
        "Apakah ada mode kontras tinggi?",
        "Ya, di jendela Aksesibilitas. Mode ini berfungsi di setiap ukuran antarmuka."
      ],
      [
        "Bisakah saya bermain tanpa mouse atau layar sentuh?",
        "Ya, sepenuhnya dengan keyboard, gamepad, atau remote Android TV."
      ],
      [
        "Apakah bisa dipakai dengan pembaca layar?",
        "Belum sepenuhnya. Pengumuman suara membacakan peristiwa permainan dan menu memiliki label, tetapi meja poker itu sendiri adalah antarmuka visual dan belum bisa dimainkan hanya dengan pembaca layar."
      ],
      [
        "Apakah gratis?",
        "Ya. PokerTH adalah perangkat lunak gratis dan sumber terbuka, tanpa iklan dan tanpa pembelian dalam aplikasi; semua chip hanya uang mainan."
      ]
    ]
  },
  is: {
    "title": "Aðgengilegur póker — stórt letur, lyklaborð, stýripinni | PokerTH",
    "desc": "Ókeypis Texas Hold’em: stærra letur, mikil birtuskil, 4 lita stokkar, stækkunargler, raddtilkynningar og full stjórn með lyklaborði, stýripinna og fjarstýringu.",
    "ldHeadline": "Aðgengilegur netpóker: stórt letur, mikil birtuskil, lyklaborð og stýripinni",
    "ldDesc": "Aðgengiseiginleikar PokerTH vefbiðlarans: stærð viðmóts, mikil birtuskil, fjögurra lita stokkar, stækkunargler, raddtilkynningar, lyklaborð, leikjastýripinni og sjónvarpsfjarstýring.",
    "h1": "Aðgengilegur póker: spilaðu á þinn hátt",
    "lead": "PokerTH er ókeypis Texas Hold’em í vafranum og lagar sig að því hvernig þú sérð og spilar: stærra letur og stærri hnappar, sterkari birtuskil, stokkar sem greina sortirnar sundur með lit, stækkunargler fyrir litla skjái, raddtilkynningar og full stjórn með lyklaborði, leikjastýripinna eða sjónvarpsfjarstýringu.",
    "findH2": "Hvar það er að finna",
    "findP": "Hnappurinn Aðgengi — persónutáknið efst á hverjum skjá, frá innskráningarskjánum að borðinu — opnar helstu stillingarnar hvenær sem er, jafnvel í miðri hönd. Allt annað er í Ítarlegum valkostum. Valið þitt er munað á tækinu og, þegar þú skráir þig inn með pokerth.net aðgangi, fylgir það þér á hin tækin þín.",
    "seeH2": "Að sjá borðið",
    "see": [
      [
        "Stærð viðmóts",
        "Venjuleg, Stór eða Mjög stór: texti, spil, spilapeningar og hnappar stækka saman, á innskráningarskjánum, í anddyrinu og við borðið, og uppsetningin raðast upp á nýtt svo hún haldist nothæf í síma."
      ],
      [
        "Mikil birtuskil",
        "Litaspjald með sterkari birtuskilum í öllu viðmótinu, frá valmyndunum að borðinu, í öllum stærðum viðmóts."
      ],
      [
        "Fjögurra lita stokkar",
        "Spilastokkar sem gefa hverri sort sinn eigin lit, svo aldrei þarf að greina hjörtu ♥ frá tíglum ♦, eða spaða ♠ frá laufum ♣, eftir löguninni einni. Veldu einn í Ítarlegir valkostir → Útlit."
      ],
      [
        "Stækkunargler borðsins",
        "Í síma stækkar borðið í tvöfalda stærð og færist til með fingri; sýnin fer aftur að sætinu þínu þegar þú átt leik. Einnig má leyfa klípuaðdrátt vafrans."
      ],
      [
        "Ljóst, dökkt eða sjálfvirkt",
        "Allur biðlarinn fylgir þínu vali eða vali kerfisins, með þemum, stokkum og borðlitum sem henta augunum þínum."
      ]
    ],
    "keysH2": "Lyklaborð",
    "keysP": "Hver aðgerð hefur sinn lykil. Opinberu PokerTH aðgerðalyklarnir virka við borðið — F1 til F4 fyrir Fold, Check/Call, Bet/Raise og All-In, F5 til að sýna spilin þín, F6 til F8 fyrir spilahamina — og vefbiðlarinn bætir við stökum bókstöfum (F, C, R, A, og 1, 2, 3 fyrir þriðjung pottsins, hálfan pottinn eða allan pottinn), og alla má endurskilgreina. Escape lokar efsta glugganum, Tab og örvalyklarnir fara um borðalistann í anddyrinu og Alt+S opnar stillingarnar hvaðan sem er.",
    "padH2": "Leikjastýripinni og sjónvarpsfjarstýring",
    "padP": "Með leikjastýripinna — Xbox, PlayStation, Switch Pro og flestum Bluetooth-pinnum — er hægt að spila allan leikinn: hnappar fyrir hverja aðgerð, gikkir til að stilla veðmálið og leiðsagnarhamur til að fara um skjáina, spjallið og valmyndirnar. Hann titrar þegar þú átt leik. Á Android TV og Google TV virkar fjarstýringin á sama hátt, og fjarstýringar með litahnöppunum fjórum nota þá fyrir Fold, Check/Call, Bet/Raise og All-In.",
    "hearH2": "Að heyra og finna leikinn",
    "hearP": "Raddtilkynningar lesa atburði leiksins upphátt með röddum tækisins sjálfs, á þínu tungumáli þar sem kerfið hefur rödd fyrir það. Í Android-símum gefur stuttur titringur til kynna að þú eigir leik. Hljóð leiksins skiptast í fjóra flokka — aðgerðir, spjall, nettilkynningar og hækkanir blindanna — og kveikja má eða slökkva á hverjum fyrir sig, með einum hljóðstyrkssleða.",
    "calmH2": "Færri óvæntar uppákomur",
    "calmP": "Þegar kerfið þitt biður um minni hreyfingu dregur biðlarinn úr hreyfimyndum sínum. Gægjuvörnin heldur þínum eigin spilum földum þar til þú ýtir á þau, og vörnin gegn Call af slysni lokar Call-hnappinum stutta stund strax eftir stórt Raise, svo snerting sem ætluð var minna Call geti ekki greitt hækkuðu upphæðina fyrir mistök.",
    "langH2": "Á þínu tungumáli, með leiðsögn",
    "langP": "Viðmótið er til á {langs} tungumálum, frá hægri til vinstri þar sem þarf. Hjálp ássins, lukkudýr vefbiðlarans, útskýrir hvern skjá jafnóðum ef þú vilt, og „Hvað er þetta?“ segir þér hvað hvaðeina á skjánum gerir.",
    "faqH2": "Spurningar",
    "faq": [
      [
        "Get ég stækkað spilin og textann?",
        "Já. Veldu Stór eða Mjög stór í glugganum Aðgengi; spil, texti og hnappar stækka saman á öllum skjám, líka við borðið."
      ],
      [
        "Er til hamur með miklum birtuskilum?",
        "Já, í glugganum Aðgengi. Hann virkar með öllum stærðum viðmóts."
      ],
      [
        "Get ég spilað án músar eða snertiskjás?",
        "Já, alfarið með lyklaborðinu, með leikjastýripinna eða með Android TV fjarstýringu."
      ],
      [
        "Virkar það með skjálesara?",
        "Ekki að fullu enn. Raddtilkynningar lesa atburði leiksins upphátt og valmyndirnar eru merktar, en pókerborðið sjálft er sjónrænt viðmót og enn er ekki hægt að spila við það með skjálesara einum saman."
      ],
      [
        "Er það ókeypis?",
        "Já. PokerTH er ókeypis hugbúnaður með opnum frumkóða, án auglýsinga og án kaupa í forriti; allir spilapeningar eru leikfé."
      ]
    ]
  },
  it: {
    "title": "Poker accessibile — testo grande, tastiera, controller | PokerTH",
    "desc": "Texas Hold’em gratis con testo più grande, contrasto elevato, mazzi a 4 colori, lente, annunci vocali e gioco completo con tastiera, controller e telecomando TV.",
    "ldHeadline": "Poker online accessibile: testo grande, contrasto elevato, tastiera e controller",
    "ldDesc": "Le funzioni di accessibilità del client web di PokerTH: dimensione interfaccia, contrasto elevato, mazzi a 4 colori, lente, annunci vocali, tastiera, controller e telecomando TV.",
    "h1": "Poker accessibile: gioca a modo tuo",
    "lead": "PokerTH è Texas Hold’em gratis nel browser, e si adatta al modo in cui vedi e giochi: testo e pulsanti più grandi, contrasto più forte, mazzi che distinguono i semi con i colori, una lente per gli schermi piccoli, annunci vocali e il controllo completo da tastiera, controller o telecomando TV.",
    "findH2": "Dove trovarlo",
    "findP": "Il pulsante Accessibilità — l’icona a forma di persona in alto in ogni schermata, dalla schermata di accesso al tavolo — apre le impostazioni principali in qualsiasi momento, anche a metà di una mano. Tutto il resto è nelle Opzioni avanzate. Le tue scelte vengono ricordate sul dispositivo e, quando accedi con un account pokerth.net, ti seguono sugli altri tuoi dispositivi.",
    "seeH2": "Vedere il tavolo",
    "see": [
      [
        "Dimensione interfaccia",
        "Standard, Grande o Molto grande: testo, carte, fiche e pulsanti crescono insieme, nella schermata di accesso, nella lobby e al tavolo, e il layout si riorganizza per restare comodo anche su un telefono."
      ],
      [
        "Contrasto elevato",
        "Una tavolozza a contrasto più forte su tutta l’interfaccia, dai menu al tavolo, con ogni dimensione dell’interfaccia."
      ],
      [
        "Mazzi a 4 colori",
        "Mazzi che danno a ogni seme il suo colore, così cuori e quadri, o picche e fiori, non si distinguono mai solo dalla forma. Scegline uno in Opzioni avanzate → Stile."
      ],
      [
        "Lente del tavolo",
        "Su un telefono il tavolo si ingrandisce al doppio e si sposta con un dito; la vista torna al tuo posto quando è il tuo turno. Si può anche consentire lo zoom a pizzico del browser."
      ],
      [
        "Chiaro, scuro o automatico",
        "Tutto il client segue la tua scelta o quella del sistema, con temi, mazzi e colori del tavolo adatti ai tuoi occhi."
      ]
    ],
    "keysH2": "Tastiera",
    "keysP": "Ogni azione ha il suo tasto. I tasti funzione ufficiali di PokerTH funzionano al tavolo — da F1 a F4 per Fold, Check/Call, Bet/Raise e All-In, F5 per mostrare le tue carte, da F6 a F8 per le modalità di gioco — e il client web aggiunge lettere singole (F, C, R, A, e 1, 2, 3 per un terzo del piatto, metà piatto o il piatto intero), tutte riassegnabili. Esc chiude la finestra in primo piano, Tab e le frecce scorrono l’elenco dei tavoli della lobby, e Alt+S apre le impostazioni da qualsiasi punto.",
    "padH2": "Controller e telecomando TV",
    "padP": "Un controller — Xbox, PlayStation, Switch Pro e la maggior parte dei controller Bluetooth — gestisce l’intera partita: pulsanti per ogni azione, grilletti per regolare la puntata e una modalità di navigazione per muoversi tra le schermate, la chat e i menu. Vibra quando arriva il tuo turno. Su Android TV e Google TV il telecomando funziona allo stesso modo, e i telecomandi con i quattro tasti colorati li usano per Fold, Check/Call, Bet/Raise e All-In.",
    "hearH2": "Sentire e percepire il gioco",
    "hearP": "Gli annunci vocali leggono ad alta voce gli eventi di gioco con le voci del tuo dispositivo, nella tua lingua se il sistema ne ha una. Sui telefoni Android una breve vibrazione segnala il tuo turno. I suoni di gioco sono divisi in quattro gruppi — azioni, chat, notifiche di rete e aumento dei bui — attivabili separatamente, con un unico cursore del volume.",
    "calmH2": "Meno sorprese",
    "calmP": "Quando il sistema chiede di ridurre il movimento, il client attenua le sue animazioni. L’anti-sbirciata tiene coperte le tue carte finché non le tocchi, e la guardia anti-Call accidentale blocca brevemente il pulsante Call subito dopo un grosso rilancio, così un tocco pensato per un Call più piccolo non può pagare per sbaglio l’importo rilanciato.",
    "langH2": "Nella tua lingua, con una guida",
    "langP": "L’interfaccia è disponibile in {langs} lingue, da destra a sinistra dove serve. Con l’Aiuto dell’Asso, l’Asso, mascotte del client web, ti spiega ogni schermata man mano, se lo desideri, e «Cos’è?» ti dice a cosa serve qualsiasi cosa sullo schermo.",
    "faqH2": "Domande",
    "faq": [
      [
        "Posso ingrandire le carte e il testo?",
        "Sì. Scegli Grande o Molto grande nella finestra Accessibilità; carte, testo e pulsanti crescono insieme in ogni schermata, tavolo compreso."
      ],
      [
        "C’è una modalità a contrasto elevato?",
        "Sì, nella finestra Accessibilità. Funziona con ogni dimensione dell’interfaccia."
      ],
      [
        "Posso giocare senza mouse né touchscreen?",
        "Sì, interamente con la tastiera, con un controller o con un telecomando Android TV."
      ],
      [
        "Funziona con uno screen reader?",
        "Non ancora del tutto. Gli annunci vocali leggono ad alta voce gli eventi di gioco e i menu hanno etichette, ma il tavolo da poker in sé è un’interfaccia visiva e non si può ancora giocare con il solo screen reader."
      ],
      [
        "È gratis?",
        "Sì. PokerTH è software libero e open source, senza pubblicità né acquisti in-app; tutte le fiche sono denaro finto."
      ]
    ]
  },
  ja: {
    "title": "誰でも遊べるポーカー — 大きな文字・キーボード・ゲームパッド | PokerTH",
    "desc": "無料の Texas Hold’em。大きな文字、ハイコントラスト、4色デッキ、テーブル拡大、音声アナウンス、キーボード・ゲームパッド・テレビのリモコンでの完全操作に対応。",
    "ldHeadline": "アクセシビリティ対応のオンラインポーカー：大きな文字、ハイコントラスト、キーボード、ゲームパッド",
    "ldDesc": "PokerTH ウェブクライアントのアクセシビリティ機能：インターフェースのサイズ、ハイコントラスト、4色デッキ、拡大鏡、音声アナウンス、キーボード、ゲームパッド、テレビのリモコン。",
    "h1": "アクセシビリティ対応ポーカー：自分に合ったスタイルで",
    "lead": "PokerTH はブラウザで遊べる無料の Texas Hold’em で、あなたの見え方や遊び方に合わせられます。大きな文字とボタン、より強いコントラスト、スートを色で見分けられるデッキ、小さな画面向けの拡大鏡、音声アナウンス、そしてキーボード、ゲームパッド、テレビのリモコンによる完全な操作。",
    "findH2": "設定の場所",
    "findP": "アクセシビリティボタン（ログイン画面からテーブルまで、すべての画面の上部にある人のアイコン）を押すと、ハンドの最中でもいつでも主な設定が開きます。それ以外の設定はすべて詳細オプションにあります。選択内容は端末に記憶され、pokerth.net のアカウントでログインすれば、ほかの端末にも引き継がれます。",
    "seeH2": "テーブルを見やすく",
    "see": [
      [
        "インターフェースのサイズ",
        "標準・大・特大：ログイン画面でもロビーでもテーブルでも、文字、カード、チップ、ボタンがそろって大きくなり、スマートフォンでも使いやすいようにレイアウトが組み替わります。"
      ],
      [
        "ハイコントラスト",
        "メニューからテーブルまで、インターフェース全体をよりコントラストの強い配色に。どのインターフェースのサイズでも使えます。"
      ],
      [
        "4色デッキ",
        "スートごとに色を分けたカードデッキ。ハートとダイヤ、スペードとクラブを形だけで見分ける必要がありません。詳細オプション → スタイルで選べます。"
      ],
      [
        "テーブル拡大鏡",
        "スマートフォンではテーブルを2倍に拡大して指で動かせ、自分の番になるとビューが自分の席に戻ります。ブラウザのピンチズームを許可することもできます。"
      ],
      [
        "ライト・ダーク・自動",
        "クライアント全体があなたの選択またはシステムの設定に従い、目に合ったテーマ、デッキ、テーブルの色を選べます。"
      ]
    ],
    "keysH2": "キーボード",
    "keysP": "すべてのアクションにキーがあります。PokerTH 公式のファンクションキーがテーブルで使えます — F1〜F4 で Fold、Check/Call、Bet/Raise、All-In、F5 で自分のカードを見せ、F6〜F8 でプレイモードを切り替え — さらにウェブクライアントでは1文字のキー（F、C、R、A、そしてポットの3分の1・ハーフポット・ポットの 1、2、3）が加わり、どれも割り当てを変更できます。Escape で最前面のウィンドウを閉じ、Tab と矢印キーでロビーのテーブル一覧を移動し、Alt+S でどこからでも設定を開けます。",
    "padH2": "ゲームパッドとテレビのリモコン",
    "padP": "ゲームコントローラー（Xbox、PlayStation、Switch Pro、ほとんどの Bluetooth パッド）でゲーム全体をプレイできます。すべてのアクションにボタンがあり、トリガーでベット額を調整し、ナビゲーションモードで画面、チャット、メニューを移動します。自分の番になると振動します。Android TV と Google TV ではリモコンも同じように使え、4つのカラーボタンがあるリモコンでは、それらが Fold、Check/Call、Bet/Raise、All-In になります。",
    "hearH2": "ゲームを聞く・感じる",
    "hearP": "音声アナウンスは、端末に入っている音声でゲームの出来事を読み上げます。システムにあなたの言語の音声があれば、その言語で読み上げます。Android スマートフォンでは、短い振動で自分の番を知らせます。ゲーム音はアクション、チャット、ネットワーク通知、ブラインド上昇の4グループに分かれ、それぞれ個別にオン・オフでき、音量は1つのスライダーで調整します。",
    "calmH2": "驚きを少なく",
    "calmP": "システムで「視差効果を減らす」などの動きを減らす設定がオンになっていると、クライアントはアニメーションを控えめにします。のぞき見防止は、タップするまで自分のカードを伏せたままにします。誤コール防止は大きなレイズの直後に Call ボタンを一時的にロックするので、小さいコールのつもりのタップでレイズ後の額を誤って払うことはありません。",
    "langH2": "あなたの言語で、ガイド付き",
    "langP": "インターフェースは {langs} 言語に対応し、必要に応じて右から左にも表示されます。エースのヘルプでは、ウェブクライアントのマスコットのエースが、望めば各画面を順に説明してくれます。「これは何？」を使えば、画面上のどんなものでも何をするのかを教えてくれます。",
    "faqH2": "よくある質問",
    "faq": [
      [
        "カードや文字を大きくできますか？",
        "はい。アクセシビリティウィンドウで大または特大を選んでください。テーブルを含むすべての画面で、カード、文字、ボタンがそろって大きくなります。"
      ],
      [
        "ハイコントラストモードはありますか？",
        "はい、アクセシビリティウィンドウにあります。どのインターフェースのサイズでも使えます。"
      ],
      [
        "マウスやタッチスクリーンなしで遊べますか？",
        "はい。キーボードだけ、ゲームパッド、または Android TV のリモコンですべて操作できます。"
      ],
      [
        "スクリーンリーダーで使えますか？",
        "まだ完全には対応していません。音声アナウンスがゲームの出来事を読み上げ、メニューにはラベルが付いていますが、ポーカーテーブル自体は視覚的なインターフェースで、スクリーンリーダーだけではまだプレイできません。"
      ],
      [
        "無料ですか？",
        "はい。PokerTH は広告もアプリ内課金もない、無料のオープンソースソフトウェアです。チップはすべてプレイマネーです。"
      ]
    ]
  },
  ka: {
    "title": "ხელმისაწვდომი პოკერი — დიდი ტექსტი, კლავიატურა, გეიმპადი | PokerTH",
    "desc": "უფასო Texas Hold’em დიდი ტექსტით, მაღალი კონტრასტით, 4-ფერიანი დასტებით, მაგიდის გამადიდებლით, ხმოვანი განცხადებებით და სრული მართვით კლავიატურით, გეიმპადით ან პულტით.",
    "ldHeadline": "ხელმისაწვდომი ონლაინ პოკერი: დიდი ტექსტი, მაღალი კონტრასტი, კლავიატურა და გეიმპადი",
    "ldDesc": "PokerTH-ის ვებკლიენტის ხელმისაწვდომობის ფუნქციები: ინტერფეისის ზომა, მაღალი კონტრასტი, 4-ფერიანი დასტები, გამადიდებელი, ხმოვანი განცხადებები, კლავიატურა, გეიმპადი და ტელევიზორის პულტი.",
    "h1": "ხელმისაწვდომი პოკერი: ითამაშეთ თქვენებურად",
    "lead": "PokerTH არის უფასო Texas Hold’em ბრაუზერში, რომელიც ერგება იმას, თუ როგორ ხედავთ და თამაშობთ: უფრო დიდი ტექსტი და ღილაკები, უფრო ძლიერი კონტრასტი, დასტები, სადაც ყოველ მასტს თავისი ფერი აქვს, გამადიდებელი პატარა ეკრანებისთვის, ხმოვანი განცხადებები და სრული მართვა კლავიატურით, გეიმპადით ან ტელევიზორის პულტით.",
    "findH2": "სად ვიპოვოთ",
    "findP": "ღილაკი „ხელმისაწვდომობა“ — ადამიანის ხატულა ყველა ეკრანის ზედა ნაწილში, შესვლის ეკრანიდან მაგიდამდე — ძირითად პარამეტრებს ნებისმიერ დროს ხსნის, ხელის შუაშიც კი. დანარჩენი ყველაფერი „გაფართოებული პარამეტრები“-შია. თქვენი არჩევანი მოწყობილობაზე ინახება და, როცა pokerth.net-ის ანგარიშით შედიხართ, თქვენს სხვა მოწყობილობებზეც გადადის.",
    "seeH2": "მაგიდის კარგად დანახვა",
    "see": [
      [
        "ინტერფეისის ზომა",
        "სტანდარტული, დიდი ან ძალიან დიდი: ტექსტი, კარტები, ჩიპები და ღილაკები ერთად იზრდება შესვლის ეკრანზე, ლობიში და მაგიდასთან, განლაგება კი ისე გადაეწყობა, რომ ტელეფონზეც მოსახერხებელი დარჩეს."
      ],
      [
        "მაღალი კონტრასტი",
        "უფრო ძლიერი კონტრასტის პალიტრა მთელ ინტერფეისში, მენიუებიდან მაგიდამდე, ინტერფეისის ყველა ზომაზე."
      ],
      [
        "4-ფერიანი დასტები",
        "კარტის დასტები, სადაც ყოველ მასტს თავისი ფერი აქვს, ასე რომ გულისა და აგურის, ან ყვავისა და ჯვრის გარჩევა მხოლოდ ფორმით არასოდეს გიწევთ. აირჩიეთ ერთ-ერთი: „გაფართოებული პარამეტრები“ → „სტილი“."
      ],
      [
        "მაგიდის გამადიდებელი",
        "ტელეფონზე მაგიდა ორჯერ დიდდება და თითით გადაადგილდება; თქვენი სვლისას ხედი თქვენს ადგილს უბრუნდება. ბრაუზერის თითებით მასშტაბირების დაშვებაც შეიძლება."
      ],
      [
        "ღია, მუქი ან ავტომატური",
        "მთელი კლიენტი თქვენს ან თქვენი სისტემის არჩევანს მიჰყვება, თემებით, დასტებითა და მაგიდის ფერებით, რომლებიც თქვენს თვალებს მოერგება."
      ]
    ],
    "keysH2": "კლავიატურა",
    "keysP": "ყველა მოქმედებას თავისი ღილაკი აქვს. PokerTH-ის ოფიციალური ფუნქციური ღილაკები მაგიდასთან მუშაობს — F1-დან F4-მდე Fold-ისთვის, Check/Call-ისთვის, Bet/Raise-ისა და All-In-ისთვის, F5 კარტების საჩვენებლად, F6-დან F8-მდე თამაშის რეჟიმებისთვის — ვებკლიენტი კი ცალკეულ ასოებს ამატებს (F, C, R, A და 1, 2, 3 ბანკის მესამედისთვის, ნახევარი ბანკისთვის ან მთელი ბანკისთვის), რომელთა ყველა გადანიშვნაც შეიძლება. Esc ზედა ფანჯარას ხურავს, Tab და ისრები ლობიის მაგიდების სიაში გადაადგილდება, Alt+S კი პარამეტრებს ნებისმიერი ადგილიდან ხსნის.",
    "padH2": "გეიმპადი და ტელევიზორის პულტი",
    "padP": "სათამაშო კონტროლერი — Xbox, PlayStation, Switch Pro და Bluetooth-კონტროლერების უმეტესობა — მთელ თამაშს თამაშობს: ღილაკები ყველა მოქმედებისთვის, ტრიგერები ფსონის დასაყენებლად და ნავიგაციის რეჟიმი ეკრანებში, ჩატსა და მენიუებში გადასაადგილებლად. თქვენი სვლისას ის ვიბრირებს. Android TV-სა და Google TV-ზე პულტი იმავენაირად მუშაობს, ხოლო ოთხი ფერადი ღილაკის მქონე პულტები მათ Fold-ისთვის, Check/Call-ისთვის, Bet/Raise-ისა და All-In-ისთვის იყენებს.",
    "hearH2": "თამაშის მოსმენა და შეგრძნება",
    "hearP": "ხმოვანი განცხადებები თამაშის მოვლენებს ხმამაღლა კითხულობს თქვენი მოწყობილობის საკუთარი ხმებით, თქვენს ენაზე, თუ სისტემას ასეთი ხმა აქვს. Android ტელეფონებზე თქვენს სვლას მოკლე ვიბრაცია აღნიშნავს. თამაშის ხმები ოთხ ჯგუფადაა დაყოფილი — მოქმედებები, ჩატი, ქსელის შეტყობინებები და ბლაინდების ზრდა — რომელთა ჩართვა ან გამორთვა ცალ-ცალკე შეიძლება, ხმის ერთი სლაიდერით.",
    "calmH2": "ნაკლები მოულოდნელობა",
    "calmP": "როცა თქვენი სისტემა შემცირებულ მოძრაობას ითხოვს, კლიენტი ანიმაციებს ამცირებს. Anti-peek თქვენს კარტებს დამალულს ტოვებს, სანამ მათ არ შეეხებით, ხოლო შემთხვევითი Call-ის დაცვა დიდი Raise-ის შემდეგ Call ღილაკს მცირე ხნით ბლოკავს, რათა მცირე Call-ზე გათვლილმა შეხებამ შეცდომით გაზრდილი თანხა არ გადაიხადოს.",
    "langH2": "თქვენს ენაზე, მეგზურით",
    "langP": "ინტერფეისი {langs} ენაზეა ხელმისაწვდომი, საჭიროების შემთხვევაში მარჯვნიდან მარცხნივ. „ტუზის დახმარებით“ ტუზი — ვებკლიენტის თილისმა — თუ გსურთ, თამაშისას ყოველ ეკრანს აგიხსნით, ხოლო „ეს რა არის?“ გეტყვით, რას აკეთებს ეკრანზე ნებისმიერი რამ.",
    "faqH2": "კითხვები",
    "faq": [
      [
        "შემიძლია კარტებისა და ტექსტის გადიდება?",
        "დიახ. აირჩიეთ „დიდი“ ან „ძალიან დიდი“ ფანჯარაში „ხელმისაწვდომობა“; კარტები, ტექსტი და ღილაკები ერთად იზრდება ყველა ეკრანზე, მაგიდის ჩათვლით."
      ],
      [
        "არის მაღალი კონტრასტის რეჟიმი?",
        "დიახ, ფანჯარაში „ხელმისაწვდომობა“. ის ინტერფეისის ყველა ზომასთან მუშაობს."
      ],
      [
        "შემიძლია ვითამაშო მაუსისა და სენსორული ეკრანის გარეშე?",
        "დიახ, მთლიანად კლავიატურით, გეიმპადით ან Android TV-ის პულტით."
      ],
      [
        "მუშაობს თუ არა ეკრანის წამკითხველთან?",
        "ჯერ სრულად არა. ხმოვანი განცხადებები თამაშის მოვლენებს ხმამაღლა კითხულობს და მენიუებს წარწერები აქვს, მაგრამ თავად პოკერის მაგიდა ვიზუალური ინტერფეისია და მხოლოდ ეკრანის წამკითხველით მისი თამაში ჯერ შეუძლებელია."
      ],
      [
        "უფასოა?",
        "დიახ. PokerTH უფასო და ღია კოდის პროგრამაა, რეკლამისა და აპში შესყიდვების გარეშე; ყველა ჩიპი სათამაშოა."
      ]
    ]
  },
  kk: {
    "title": "Қолжетімді покер — үлкен мәтін, пернетақта, геймпад | PokerTH",
    "desc": "Тегін Texas Hold’em: үлкен мәтін, жоғары контраст, төрт түсті колодалар, лупа, дауыстық хабарландырулар, пернетақта, геймпад пен теледидар пультімен толық ойын.",
    "ldHeadline": "Қолжетімді онлайн покер: үлкен мәтін, жоғары контраст, пернетақта және геймпад",
    "ldDesc": "PokerTH веб-клиентінің арнайы мүмкіндіктері: интерфейс өлшемі, жоғары контраст, төрт түсті колодалар, лупа, дауыстық хабарландырулар, пернетақта, геймпад және теледидар пульті.",
    "h1": "Қолжетімді покер: өзіңізге ыңғайлы ойнаңыз",
    "lead": "PokerTH — браузердегі тегін Texas Hold’em, ол сіздің көру және ойнау тәсіліңізге бейімделеді: үлкенірек мәтін мен түймелер, күштірек контраст, масттарды түсімен ажырататын колодалар, кіші экрандарға арналған лупа, дауыстық хабарландырулар және пернетақта, геймпад не теледидар пульті арқылы толық басқару.",
    "findH2": "Қайдан табуға болады",
    "findP": "«Арнайы мүмкіндіктер» түймесі — кіру экранынан үстелге дейін әр экранның жоғарғы жағындағы адам белгішесі — негізгі баптауларды кез келген уақытта, тіпті тарату ортасында да ашады. Қалғанының бәрі «Кеңейтілген баптаулар» ішінде. Таңдауларыңыз құрылғыда сақталады, ал pokerth.net тіркелгісімен кірсеңіз, басқа құрылғыларыңызға да ілесіп жүреді.",
    "seeH2": "Үстелді анық көру",
    "see": [
      [
        "Интерфейс өлшемі",
        "Стандартты, Үлкен немесе Өте үлкен: мәтін, карталар, фишкалар және түймелер кіру экранында, лоббиде және үстел басында бірге үлкейеді, ал телефонда да ыңғайлы болуы үшін орналасу қайта реттеледі."
      ],
      [
        "Жоғары контраст",
        "Мәзірлерден үстелге дейін бүкіл интерфейсте контрасты күштірек палитра, кез келген интерфейс өлшемінде."
      ],
      [
        "Төрт түсті колодалар",
        "Әр мастқа өз түсін беретін карта колодалары: осылайша черви мен бубнаны, не пика мен трефаны ешқашан тек пішінімен ажыратуға тура келмейді. Біреуін «Кеңейтілген баптаулар» → «Стиль» ішінен таңдаңыз."
      ],
      [
        "Үстел лупасы",
        "Телефонда үстел екі есе үлкейеді және саусақпен жылжиды; кезегіңіз келгенде көрініс өз орныңызға оралады. Браузердің шымшу масштабына да рұқсат беруге болады."
      ],
      [
        "Ашық, күңгірт немесе автоматты",
        "Бүкіл клиент сіздің немесе жүйеңіздің таңдауына ілеседі, көзіңізге лайық тақырыптар, колодалар және үстел түстері бар."
      ]
    ],
    "keysH2": "Пернетақта",
    "keysP": "Әр әрекеттің өз пернесі бар. PokerTH-тің ресми функционалдық пернелері үстел басында жұмыс істейді — Fold, Check/Call, Bet/Raise және All-In үшін F1–F4, карталарыңызды көрсету үшін F5, ойын режимдері үшін F6–F8 — ал веб-клиент жеке әріптерді қосады (F, C, R, A, сондай-ақ банктің үштен бірі, жартысы немесе толық банк үшін 1, 2, 3), олардың бәрін қайта тағайындауға болады. Esc ең үстіңгі терезені жабады, Tab пен көрсеткі пернелері лоббидегі үстелдер тізімі бойынша жылжиды, ал Alt+S баптауларды кез келген жерден ашады.",
    "padH2": "Геймпад және теледидар пульті",
    "padP": "Ойын контроллерімен — Xbox, PlayStation, Switch Pro және Bluetooth пульттерінің көбімен — бүкіл ойынды ойнауға болады: әр әрекетке арналған батырмалар, ставканы орнататын триггерлер және экрандар, чат пен мәзірлер бойынша жылжуға арналған Навигация режимі. Кезегіңіз келгенде ол дірілдейді. Android TV мен Google TV-де пульт дәл солай жұмыс істейді, ал төрт түсті пернесі бар пульттер оларды Fold, Check/Call, Bet/Raise және All-In үшін қолданады.",
    "hearH2": "Ойынды есту және сезу",
    "hearP": "Дауыстық хабарландырулар ойын оқиғаларын құрылғыңыздың өз дауыстарымен, жүйеде болса, өз тіліңізде дауыстап оқиды. Android телефондарында қысқа діріл кезегіңізді білдіреді. Ойын дыбыстары төрт топқа бөлінген — әрекеттер, чат, желілік хабарландырулар және блайндтың көтерілуі — оларды бөлек қосуға не өшіруге болады, дыбыс деңгейінің бір жүгірткісімен.",
    "calmH2": "Тосын жағдайлар азырақ",
    "calmP": "Жүйеңіз қозғалысты азайтуды сұраса, клиент анимацияларын бәсеңдетеді. Сығалаудан қорғау өз карталарыңызды оларды түрткенше жасырын ұстайды, ал кездейсоқ Call-дан қорғау үлкен Raise-ден кейін бірден Call түймесін қысқа уақытқа бұғаттайды, сонда кішірек Call-ға арналған түрту көтерілген соманы байқаусызда төлеп жібермейді.",
    "langH2": "Өз тіліңізде, нұсқаушымен",
    "langP": "Интерфейс {langs} тілде қолжетімді, қажет жерде оңнан солға қарай. Веб-клиенттің талисманы — Тұздың көмегі, қаласаңыз, әр экранды жол-жөнекей түсіндіреді, ал «Бұл не?» экрандағы кез келген нәрсенің не істейтінін айтады.",
    "faqH2": "Сұрақтар",
    "faq": [
      [
        "Карталар мен мәтінді үлкейтуге бола ма?",
        "Иә. «Арнайы мүмкіндіктер» терезесінде «Үлкен» немесе «Өте үлкен» таңдаңыз; карталар, мәтін және түймелер әр экранда, соның ішінде үстел басында да бірге үлкейеді."
      ],
      [
        "Жоғары контраст режимі бар ма?",
        "Иә, «Арнайы мүмкіндіктер» терезесінде. Ол кез келген интерфейс өлшемімен жұмыс істейді."
      ],
      [
        "Тінтуірсіз немесе сенсорлы экрансыз ойнауға бола ма?",
        "Иә, толығымен пернетақтамен, геймпадпен немесе Android TV пультімен."
      ],
      [
        "Экран оқу құралымен жұмыс істей ме?",
        "Әзірге толық емес. Дауыстық хабарландырулар ойын оқиғаларын дауыстап оқиды және мәзірлерде белгілер бар, бірақ покер үстелінің өзі визуалды интерфейс, оны әзірге тек экран оқу құралымен ойнау мүмкін емес."
      ],
      [
        "Бұл тегін бе?",
        "Иә. PokerTH — жарнамасыз және қолданба ішіндегі сатып алуларсыз тегін әрі ашық бастапқы кодты бағдарлама; барлық фишкалар — ойын ақшасы."
      ]
    ]
  },
  km: {
    "title": "បៀដែលងាយស្រួលប្រើ — អក្សរធំ ក្ដារចុច ហ្គេមផេដ | PokerTH",
    "desc": "Texas Hold’em ឥតគិតថ្លៃ មានអក្សរធំជាង កម្រិតពណ៌ខ្ពស់ ឈុតបៀបួនពណ៌ កែវពង្រីក ការប្រកាសសំឡេង និងលេងបានពេញលេញដោយក្ដារចុច ហ្គេមផេដ ឬរីម៉ូតទូរទស្សន៍។",
    "ldHeadline": "បៀអនឡាញដែលងាយស្រួលប្រើ៖ អក្សរធំ កម្រិតពណ៌ខ្ពស់ ក្ដារចុច និងហ្គេមផេដ",
    "ldDesc": "មុខងារភាពងាយស្រួលប្រើរបស់កម្មវិធីវេប PokerTH៖ ទំហំចំណុចប្រទាក់ កម្រិតពណ៌ខ្ពស់ ឈុតបៀបួនពណ៌ កែវពង្រីក ការប្រកាសសំឡេង ក្ដារចុច ហ្គេមផេដ និងរីម៉ូតទូរទស្សន៍។",
    "h1": "បៀដែលងាយស្រួលប្រើ៖ លេងតាមរបៀបរបស់អ្នក",
    "lead": "PokerTH គឺជា Texas Hold’em ឥតគិតថ្លៃនៅក្នុងកម្មវិធីរុករក ហើយវាសម្របទៅនឹងរបៀបដែលអ្នកមើល និងលេង៖ អក្សរ និងប៊ូតុងធំជាង កម្រិតពណ៌ខ្លាំងជាង ឈុតបៀដែលបែងចែកប្រភេទបៀតាមពណ៌ កែវពង្រីកសម្រាប់អេក្រង់តូច ការប្រកាសសំឡេង និងការបញ្ជាពេញលេញពីក្ដារចុច ហ្គេមផេដ ឬរីម៉ូតទូរទស្សន៍។",
    "findH2": "រកវាឃើញនៅឯណា",
    "findP": "ប៊ូតុង ភាពងាយស្រួលប្រើ — រូបតំណាងមនុស្សនៅផ្នែកខាងលើនៃគ្រប់អេក្រង់ ចាប់ពីអេក្រង់ចូលរហូតដល់តុ — បើកការកំណត់សំខាន់ៗបានគ្រប់ពេល សូម្បីតែពាក់កណ្ដាលដៃបៀ។ អ្វីៗផ្សេងទៀតមាននៅក្នុងជម្រើសកម្រិតខ្ពស់។ ជម្រើសរបស់អ្នកត្រូវបានចងចាំនៅលើឧបករណ៍ ហើយនៅពេលអ្នកចូលដោយគណនី pokerth.net វាតាមអ្នកទៅឧបករណ៍ផ្សេងទៀតរបស់អ្នក។",
    "seeH2": "មើលតុ",
    "see": [
      [
        "ទំហំចំណុចប្រទាក់",
        "ស្តង់ដារ ធំ ឬធំបំផុត៖ អក្សរ បៀ ស៊ីប និងប៊ូតុងធំឡើងជាមួយគ្នា នៅលើអេក្រង់ចូល ក្នុងឡប់ប៊ី និងនៅតុ ហើយប្លង់រៀបចំខ្លួនឡើងវិញដើម្បីនៅតែងាយប្រើលើទូរស័ព្ទ។"
      ],
      [
        "កម្រិតពណ៌ខ្ពស់",
        "ក្ដារលាយពណ៌ដែលមានកម្រិតពណ៌ខ្លាំងជាងនៅទូទាំងចំណុចប្រទាក់ ចាប់ពីម៉ឺនុយរហូតដល់តុ ក្នុងគ្រប់ទំហំចំណុចប្រទាក់។"
      ],
      [
        "ឈុតបៀបួនពណ៌",
        "ឈុតបៀដែលផ្ដល់ពណ៌ផ្ទាល់ខ្លួនដល់ប្រភេទបៀនីមួយៗ ដូច្នេះប្រភេទបៀក្រហមទាំងពីរ ឬប្រភេទបៀខ្មៅទាំងពីរ មិនដែលត្រូវបែងចែកតែតាមរូបរាងប៉ុណ្ណោះទេ។ ជ្រើសរើសមួយក្នុង ជម្រើសកម្រិតខ្ពស់ → រចនាប័ទ្ម។"
      ],
      [
        "កែវពង្រីកតុ",
        "នៅលើទូរស័ព្ទ តុពង្រីកទ្វេដង ហើយអាចអូសដោយម្រាមដៃ ទិដ្ឋភាពត្រឡប់មកកៅអីរបស់អ្នកវិញនៅពេលដល់វេនអ្នក។ ក៏អាចអនុញ្ញាតការពង្រីកច្បិចរបស់កម្មវិធីរុករកបានដែរ។"
      ],
      [
        "ភ្លឺ ងងឹត ឬស្វ័យប្រវត្តិ",
        "កម្មវិធីទាំងមូលធ្វើតាមជម្រើសរបស់អ្នក ឬរបស់ប្រព័ន្ធ ជាមួយស្បែក ឈុតបៀ និងពណ៌តុដែលសមនឹងភ្នែករបស់អ្នក។"
      ]
    ],
    "keysH2": "ក្ដារចុច",
    "keysP": "សកម្មភាពនីមួយៗមានគ្រាប់ចុចរបស់វា។ គ្រាប់ចុចមុខងារផ្លូវការរបស់ PokerTH ដំណើរការនៅតុ — F1 ដល់ F4 សម្រាប់ Fold, Check/Call, Bet/Raise និង All-In, F5 ដើម្បីបង្ហាញបៀរបស់អ្នក, F6 ដល់ F8 សម្រាប់របៀបលេង — ហើយកម្មវិធីវេបបន្ថែមអក្សរតែមួយ (F, C, R, A និង 1, 2, 3 សម្រាប់មួយភាគបីនៃ pot ពាក់កណ្ដាល pot ឬ pot ទាំងមូល) ដែលអាចកំណត់ឡើងវិញបានទាំងអស់។ Escape បិទបង្អួចខាងលើ, Tab និងគ្រាប់ចុចព្រួញផ្លាស់ទីក្នុងបញ្ជីតុនៃឡប់ប៊ី ហើយ Alt+S បើកការកំណត់ពីគ្រប់ទីកន្លែង។",
    "padH2": "ហ្គេមផេដ និងរីម៉ូតទូរទស្សន៍",
    "padP": "ឧបករណ៍បញ្ជាហ្គេម — Xbox, PlayStation, Switch Pro និងផេដ Bluetooth ភាគច្រើន — លេងហ្គេមទាំងមូលបាន៖ ប៊ូតុងសម្រាប់សកម្មភាពនីមួយៗ ប៊ូតុងកៃសម្រាប់កំណត់ការភ្នាល់ និងរបៀបរុករកដើម្បីផ្លាស់ទីតាមអេក្រង់ ការជជែក និងម៉ឺនុយ។ វាញ័រនៅពេលដល់វេនអ្នក។ នៅលើ Android TV និង Google TV រីម៉ូតដំណើរការដូចគ្នា ហើយរីម៉ូតដែលមានគ្រាប់ចុចពណ៌ទាំងបួនប្រើវាសម្រាប់ Fold, Check/Call, Bet/Raise និង All-In។",
    "hearH2": "ស្ដាប់ និងមានអារម្មណ៍ពីហ្គេម",
    "hearP": "ការប្រកាសសំឡេងអានព្រឹត្តិការណ៍ហ្គេមឮៗ ដោយប្រើសំឡេងរបស់ឧបករណ៍អ្នកផ្ទាល់ ជាភាសារបស់អ្នក ប្រសិនបើប្រព័ន្ធមាន។ នៅលើទូរស័ព្ទ Android រំញ័រខ្លីមួយសម្គាល់វេនរបស់អ្នក។ សំឡេងហ្គេមចែកជាបួនក្រុម — សកម្មភាព ការជជែក ការជូនដំណឹងបណ្ដាញ និងការដំឡើង blind — ដែលអាចបើក ឬបិទដោយឡែកពីគ្នា ជាមួយរបាររំកិលកម្រិតសំឡេងតែមួយ។",
    "calmH2": "ការភ្ញាក់ផ្អើលតិចជាង",
    "calmP": "នៅពេលប្រព័ន្ធរបស់អ្នកស្នើឱ្យកាត់បន្ថយចលនា កម្មវិធីបន្ថយចលនាគំនូរជីវចលរបស់វា។ ការការពារលួចមើលរក្សាបៀផ្ទាល់ខ្លួនរបស់អ្នកឱ្យលាក់ រហូតដល់អ្នកចុចលើវា ហើយការការពារ Call ចៃដន្យរាំងខ្ទប់ប៊ូតុង Call មួយភ្លែតភ្លាមៗបន្ទាប់ពី raise ធំ ដើម្បីកុំឱ្យការចុចសម្រាប់ call តូចជាង បង់ចំនួនដែលបាន raise ដោយច្រឡំ។",
    "langH2": "ជាភាសារបស់អ្នក ជាមួយអ្នកណែនាំ",
    "langP": "ចំណុចប្រទាក់មានជា {langs} ភាសា ពីស្ដាំទៅឆ្វេងនៅពេលចាំបាច់។ ជាមួយ ជំនួយរបស់អាត់ អាត់ — សញ្ញាសំណាងរបស់កម្មវិធីវេប — ពន្យល់អេក្រង់នីមួយៗតាមផ្លូវ ប្រសិនបើអ្នកចង់ ហើយ “នេះជាអ្វី?” ប្រាប់អ្នកថាអ្វីៗនៅលើអេក្រង់ធ្វើអ្វី។",
    "faqH2": "សំណួរ",
    "faq": [
      [
        "តើខ្ញុំអាចធ្វើឱ្យបៀ និងអក្សរធំជាងនេះបានទេ?",
        "បាន។ ជ្រើសរើស ធំ ឬ ធំបំផុត ក្នុងបង្អួច ភាពងាយស្រួលប្រើ; បៀ អក្សរ និងប៊ូតុងធំឡើងជាមួយគ្នានៅលើគ្រប់អេក្រង់ រួមទាំងតុផង។"
      ],
      [
        "តើមានរបៀបកម្រិតពណ៌ខ្ពស់ទេ?",
        "មាន នៅក្នុងបង្អួច ភាពងាយស្រួលប្រើ។ វាដំណើរការជាមួយគ្រប់ទំហំចំណុចប្រទាក់។"
      ],
      [
        "តើខ្ញុំអាចលេងដោយគ្មានកណ្ដុរ ឬអេក្រង់ប៉ះបានទេ?",
        "បាន ទាំងស្រុងដោយក្ដារចុច ហ្គេមផេដ ឬរីម៉ូត Android TV។"
      ],
      [
        "តើវាដំណើរការជាមួយកម្មវិធីអានអេក្រង់ទេ?",
        "មិនទាន់ពេញលេញនៅឡើយទេ។ ការប្រកាសសំឡេងអានព្រឹត្តិការណ៍ហ្គេមឮៗ ហើយម៉ឺនុយមានស្លាក ប៉ុន្តែតុបៀខ្លួនវាជាចំណុចប្រទាក់សម្រាប់មើល ហើយមិនទាន់អាចលេងដោយប្រើតែកម្មវិធីអានអេក្រង់បាននៅឡើយទេ។"
      ],
      [
        "តើវាឥតគិតថ្លៃទេ?",
        "ឥតគិតថ្លៃ។ PokerTH ជាកម្មវិធីឥតគិតថ្លៃ និងកូដចំហ គ្មានការផ្សាយពាណិជ្ជកម្ម និងគ្មានការទិញក្នុងកម្មវិធី; ស៊ីបទាំងអស់គ្រាន់តែជាលុយហ្គេមប៉ុណ្ណោះ។"
      ]
    ]
  },
  kn: {
    "title": "ಪ್ರವೇಶಸಾಧ್ಯ ಪೋಕರ್ — ದೊಡ್ಡ ಅಕ್ಷರ, ಕೀಬೋರ್ಡ್, ಗೇಮ್‌ಪ್ಯಾಡ್ | PokerTH",
    "desc": "ದೊಡ್ಡ ಅಕ್ಷರ, ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್, 4-ಬಣ್ಣದ ಡೆಕ್‌ಗಳು, ಟೇಬಲ್ ಭೂತಗನ್ನಡಿ, ಧ್ವನಿ ಘೋಷಣೆಗಳು ಮತ್ತು ಕೀಬೋರ್ಡ್, ಗೇಮ್‌ಪ್ಯಾಡ್ ಅಥವಾ ಟಿವಿ ರಿಮೋಟ್‌ನಿಂದ ಪೂರ್ಣ ಆಟ — ಉಚಿತ Texas Hold’em.",
    "ldHeadline": "ಪ್ರವೇಶಸಾಧ್ಯ ಆನ್‌ಲೈನ್ ಪೋಕರ್: ದೊಡ್ಡ ಅಕ್ಷರ, ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್, ಕೀಬೋರ್ಡ್ ಮತ್ತು ಗೇಮ್‌ಪ್ಯಾಡ್",
    "ldDesc": "PokerTH ವೆಬ್ ಕ್ಲೈಂಟ್‌ನ ಪ್ರವೇಶಸಾಧ್ಯತೆ ವೈಶಿಷ್ಟ್ಯಗಳು: ಇಂಟರ್‌ಫೇಸ್ ಗಾತ್ರ, ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್, 4-ಬಣ್ಣದ ಡೆಕ್‌ಗಳು, ಭೂತಗನ್ನಡಿ, ಧ್ವನಿ ಘೋಷಣೆಗಳು, ಕೀಬೋರ್ಡ್, ಗೇಮ್‌ಪ್ಯಾಡ್ ಮತ್ತು ಟಿವಿ ರಿಮೋಟ್.",
    "h1": "ಪ್ರವೇಶಸಾಧ್ಯ ಪೋಕರ್: ನಿಮ್ಮದೇ ರೀತಿಯಲ್ಲಿ ಆಡಿ",
    "lead": "PokerTH ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಉಚಿತ Texas Hold’em, ಮತ್ತು ಅದು ನೀವು ನೋಡುವ ಮತ್ತು ಆಡುವ ರೀತಿಗೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ: ದೊಡ್ಡ ಅಕ್ಷರ ಮತ್ತು ಬಟನ್‌ಗಳು, ಹೆಚ್ಚು ಕಾಂಟ್ರಾಸ್ಟ್, ಸೂಟ್‌ಗಳನ್ನು ಬಣ್ಣದಿಂದ ಬೇರ್ಪಡಿಸುವ ಡೆಕ್‌ಗಳು, ಚಿಕ್ಕ ಪರದೆಗಳಿಗೆ ಭೂತಗನ್ನಡಿ, ಧ್ವನಿ ಘೋಷಣೆಗಳು, ಮತ್ತು ಕೀಬೋರ್ಡ್, ಗೇಮ್‌ಪ್ಯಾಡ್ ಅಥವಾ ಟಿವಿ ರಿಮೋಟ್‌ನಿಂದ ಸಂಪೂರ್ಣ ನಿಯಂತ್ರಣ.",
    "findH2": "ಇದು ಎಲ್ಲಿದೆ",
    "findP": "ಪ್ರವೇಶಸಾಧ್ಯತೆ ಬಟನ್ — ಲಾಗಿನ್ ಪರದೆಯಿಂದ ಟೇಬಲ್‌ವರೆಗೆ ಪ್ರತಿ ಪರದೆಯ ಮೇಲ್ಭಾಗದಲ್ಲಿರುವ ವ್ಯಕ್ತಿಯ ಐಕಾನ್ — ಯಾವಾಗ ಬೇಕಾದರೂ, ಹ್ಯಾಂಡ್ ನಡೆಯುತ್ತಿರುವಾಗಲೂ, ಮುಖ್ಯ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ತೆರೆಯುತ್ತದೆ. ಉಳಿದೆಲ್ಲವೂ ಸುಧಾರಿತ ಆಯ್ಕೆಗಳಲ್ಲಿವೆ. ನಿಮ್ಮ ಆಯ್ಕೆಗಳು ಸಾಧನದಲ್ಲಿ ನೆನಪಿನಲ್ಲಿರುತ್ತವೆ, ಮತ್ತು ನೀವು pokerth.net ಖಾತೆಯಿಂದ ಲಾಗಿನ್ ಆದಾಗ ನಿಮ್ಮ ಇತರ ಸಾಧನಗಳಿಗೂ ನಿಮ್ಮನ್ನು ಹಿಂಬಾಲಿಸುತ್ತವೆ.",
    "seeH2": "ಟೇಬಲ್ ಅನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ನೋಡುವುದು",
    "see": [
      [
        "ಇಂಟರ್‌ಫೇಸ್ ಗಾತ್ರ",
        "ಸಾಮಾನ್ಯ, ದೊಡ್ಡದು ಅಥವಾ ತುಂಬಾ ದೊಡ್ಡದು: ಲಾಗಿನ್ ಪರದೆ, ಲಾಬಿ ಮತ್ತು ಟೇಬಲ್‌ನಲ್ಲಿ ಅಕ್ಷರ, ಕಾರ್ಡ್‌ಗಳು, ಚಿಪ್‌ಗಳು ಮತ್ತು ಬಟನ್‌ಗಳು ಒಟ್ಟಿಗೆ ದೊಡ್ಡದಾಗುತ್ತವೆ, ಮತ್ತು ಫೋನ್‌ನಲ್ಲೂ ಬಳಸಲು ಅನುಕೂಲವಾಗಿರುವಂತೆ ವಿನ್ಯಾಸ ಮರುಜೋಡಣೆಯಾಗುತ್ತದೆ."
      ],
      [
        "ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್",
        "ಮೆನುಗಳಿಂದ ಟೇಬಲ್‌ವರೆಗೆ ಇಡೀ ಇಂಟರ್‌ಫೇಸ್‌ನಲ್ಲಿ, ಯಾವುದೇ ಇಂಟರ್‌ಫೇಸ್ ಗಾತ್ರದಲ್ಲಿ, ಹೆಚ್ಚು ಕಾಂಟ್ರಾಸ್ಟ್ ಇರುವ ಬಣ್ಣಗಳ ಪ್ಯಾಲೆಟ್."
      ],
      [
        "4-ಬಣ್ಣದ ಡೆಕ್‌ಗಳು",
        "ಪ್ರತಿ ಸೂಟ್‌ಗೆ ತನ್ನದೇ ಬಣ್ಣ ನೀಡುವ ಕಾರ್ಡ್ ಡೆಕ್‌ಗಳು; ಹೀಗಾಗಿ ♥ ಮತ್ತು ♦, ಅಥವಾ ♠ ಮತ್ತು ♣ ಅನ್ನು ಎಂದಿಗೂ ಕೇವಲ ಆಕಾರದಿಂದ ಗುರುತಿಸಬೇಕಾಗಿಲ್ಲ. ಸುಧಾರಿತ ಆಯ್ಕೆಗಳು → ಶೈಲಿ ಯಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ."
      ],
      [
        "ಟೇಬಲ್ ಭೂತಗನ್ನಡಿ",
        "ಫೋನ್‌ನಲ್ಲಿ ಟೇಬಲ್ ಎರಡು ಪಟ್ಟು ಗಾತ್ರಕ್ಕೆ ಜೂಮ್ ಆಗುತ್ತದೆ ಮತ್ತು ಬೆರಳಿನಿಂದ ಸರಿಸಬಹುದು; ನಿಮ್ಮ ಸರದಿ ಬಂದಾಗ ನೋಟವು ನಿಮ್ಮ ಸೀಟ್‌ಗೆ ಮರಳುತ್ತದೆ. ಬ್ರೌಸರ್‌ನ ಪಿಂಚ್ ಜೂಮ್‌ಗೂ ಅನುಮತಿ ನೀಡಬಹುದು."
      ],
      [
        "ಲೈಟ್, ಡಾರ್ಕ್ ಅಥವಾ ಸ್ವಯಂಚಾಲಿತ",
        "ಇಡೀ ಕ್ಲೈಂಟ್ ನಿಮ್ಮ ಆಯ್ಕೆಯನ್ನು ಅಥವಾ ನಿಮ್ಮ ಸಿಸ್ಟಂನ ಆಯ್ಕೆಯನ್ನು ಅನುಸರಿಸುತ್ತದೆ, ನಿಮ್ಮ ಕಣ್ಣುಗಳಿಗೆ ಹೊಂದುವ ಥೀಮ್‌ಗಳು, ಡೆಕ್‌ಗಳು ಮತ್ತು ಟೇಬಲ್ ಬಣ್ಣಗಳೊಂದಿಗೆ."
      ]
    ],
    "keysH2": "ಕೀಬೋರ್ಡ್",
    "keysP": "ಪ್ರತಿ ಕ್ರಿಯೆಗೂ ಒಂದು ಕೀ ಇದೆ. ಅಧಿಕೃತ PokerTH ಫಂಕ್ಷನ್ ಕೀಗಳು ಟೇಬಲ್‌ನಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತವೆ — Fold, Check/Call, Bet/Raise ಮತ್ತು All-In ಗಾಗಿ F1 ರಿಂದ F4, ನಿಮ್ಮ ಕಾರ್ಡ್‌ಗಳನ್ನು ತೋರಿಸಲು F5, ಆಟದ ಮೋಡ್‌ಗಳಿಗೆ F6 ರಿಂದ F8 — ಮತ್ತು ವೆಬ್ ಕ್ಲೈಂಟ್ ಒಂದೇ ಅಕ್ಷರದ ಕೀಗಳನ್ನು ಸೇರಿಸುತ್ತದೆ (F, C, R, A, ಮತ್ತು ಪಾಟ್‌ನ ಮೂರನೇ ಒಂದು ಭಾಗ, ಅರ್ಧ ಪಾಟ್ ಅಥವಾ ಪೂರ್ಣ ಪಾಟ್‌ಗಾಗಿ 1, 2, 3); ಇವೆಲ್ಲವನ್ನೂ ಬೇರೆ ಕೀಗಳಿಗೆ ಬದಲಿಸಬಹುದು. Esc ಮೇಲಿನ ವಿಂಡೋವನ್ನು ಮುಚ್ಚುತ್ತದೆ, Tab ಮತ್ತು ಬಾಣದ ಕೀಗಳು ಲಾಬಿಯ ಟೇಬಲ್ ಪಟ್ಟಿಯಲ್ಲಿ ಚಲಿಸುತ್ತವೆ, ಮತ್ತು Alt+S ಎಲ್ಲಿಂದ ಬೇಕಾದರೂ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ತೆರೆಯುತ್ತದೆ.",
    "padH2": "ಗೇಮ್‌ಪ್ಯಾಡ್ ಮತ್ತು ಟಿವಿ ರಿಮೋಟ್",
    "padP": "ಗೇಮ್ ಕಂಟ್ರೋಲರ್‌ನಿಂದ — Xbox, PlayStation, Switch Pro ಮತ್ತು ಹೆಚ್ಚಿನ Bluetooth ಪ್ಯಾಡ್‌ಗಳು — ಇಡೀ ಆಟವನ್ನು ಆಡಬಹುದು: ಪ್ರತಿ ಕ್ರಿಯೆಗೆ ಬಟನ್‌ಗಳು, ಬೆಟ್ ಹೊಂದಿಸಲು ಟ್ರಿಗರ್‌ಗಳು, ಮತ್ತು ಪರದೆಗಳು, ಚಾಟ್ ಮತ್ತು ಮೆನುಗಳಲ್ಲಿ ಚಲಿಸಲು ನ್ಯಾವಿಗೇಶನ್ ಮೋಡ್. ನಿಮ್ಮ ಸರದಿ ಬಂದಾಗ ಅದು ಕಂಪಿಸುತ್ತದೆ. Android TV ಮತ್ತು Google TV ಯಲ್ಲಿ ರಿಮೋಟ್ ಇದೇ ರೀತಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ, ಮತ್ತು ನಾಲ್ಕು ಬಣ್ಣದ ಕೀಗಳಿರುವ ರಿಮೋಟ್‌ಗಳು ಅವುಗಳನ್ನು Fold, Check/Call, Bet/Raise ಮತ್ತು All-In ಗಾಗಿ ಬಳಸುತ್ತವೆ.",
    "hearH2": "ಆಟವನ್ನು ಕೇಳುವುದು ಮತ್ತು ಅನುಭವಿಸುವುದು",
    "hearP": "ಧ್ವನಿ ಘೋಷಣೆಗಳು ನಿಮ್ಮ ಸಾಧನದ ಸ್ವಂತ ಧ್ವನಿಗಳಿಂದ ಆಟದ ಘಟನೆಗಳನ್ನು ಜೋರಾಗಿ ಓದುತ್ತವೆ, ಸಿಸ್ಟಂನಲ್ಲಿ ನಿಮ್ಮ ಭಾಷೆಯ ಧ್ವನಿ ಇದ್ದರೆ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲೇ. Android ಫೋನ್‌ಗಳಲ್ಲಿ ಒಂದು ಚಿಕ್ಕ ವೈಬ್ರೇಶನ್ ನಿಮ್ಮ ಸರದಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಆಟದ ಶಬ್ದಗಳು ನಾಲ್ಕು ಗುಂಪುಗಳಲ್ಲಿವೆ — ಕ್ರಿಯೆಗಳು, ಚಾಟ್, ನೆಟ್‌ವರ್ಕ್ ಸೂಚನೆಗಳು ಮತ್ತು ಬ್ಲೈಂಡ್ ಏರಿಕೆಗಳು — ಇವುಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಆನ್ ಅಥವಾ ಆಫ್ ಮಾಡಬಹುದು, ಒಂದೇ ವಾಲ್ಯೂಮ್ ಸ್ಲೈಡರ್‌ನೊಂದಿಗೆ.",
    "calmH2": "ಕಡಿಮೆ ಅಚ್ಚರಿಗಳು",
    "calmP": "ನಿಮ್ಮ ಸಿಸ್ಟಂ ಕಡಿಮೆ ಚಲನೆಯನ್ನು ಕೇಳಿದಾಗ, ಕ್ಲೈಂಟ್ ತನ್ನ ಅನಿಮೇಶನ್‌ಗಳನ್ನು ತಗ್ಗಿಸುತ್ತದೆ. ಇಣುಕುನೋಟ ತಡೆ ನೀವು ಟ್ಯಾಪ್ ಮಾಡುವವರೆಗೆ ನಿಮ್ಮ ಸ್ವಂತ ಕಾರ್ಡ್‌ಗಳನ್ನು ಮರೆಯಲ್ಲಿಡುತ್ತದೆ, ಮತ್ತು ಆಕಸ್ಮಿಕ Call ರಕ್ಷಣೆ ದೊಡ್ಡ Raise ನಂತರ ತಕ್ಷಣ Call ಬಟನ್ ಅನ್ನು ಸ್ವಲ್ಪ ಹೊತ್ತು ನಿರ್ಬಂಧಿಸುತ್ತದೆ; ಹೀಗೆ ಚಿಕ್ಕ Call ಗಾಗಿ ಮಾಡಿದ ಟ್ಯಾಪ್ ತಪ್ಪಾಗಿ ಹೆಚ್ಚಿಸಿದ ಮೊತ್ತವನ್ನು ಪಾವತಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.",
    "langH2": "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ, ಮಾರ್ಗದರ್ಶಿಯೊಂದಿಗೆ",
    "langP": "ಇಂಟರ್‌ಫೇಸ್ {langs} ಭಾಷೆಗಳಲ್ಲಿ ಲಭ್ಯವಿದೆ, ಅಗತ್ಯವಿದ್ದಲ್ಲಿ ಬಲದಿಂದ ಎಡಕ್ಕೆ. ವೆಬ್ ಕ್ಲೈಂಟ್‌ನ ಮ್ಯಾಸ್ಕಾಟ್ ಆದ ಎಕ್ಕದ ಸಹಾಯ, ನೀವು ಬಯಸಿದರೆ, ನೀವು ಮುಂದುವರಿದಂತೆ ಪ್ರತಿ ಪರದೆಯನ್ನು ವಿವರಿಸುತ್ತದೆ, ಮತ್ತು “ಇದೇನು?” ಪರದೆಯ ಮೇಲಿನ ಯಾವುದೇ ವಸ್ತು ಏನು ಮಾಡುತ್ತದೆ ಎಂದು ತಿಳಿಸುತ್ತದೆ.",
    "faqH2": "ಪ್ರಶ್ನೆಗಳು",
    "faq": [
      [
        "ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ಅಕ್ಷರಗಳನ್ನು ದೊಡ್ಡದಾಗಿಸಬಹುದೇ?",
        "ಹೌದು. ಪ್ರವೇಶಸಾಧ್ಯತೆ ವಿಂಡೋದಲ್ಲಿ ದೊಡ್ಡದು ಅಥವಾ ತುಂಬಾ ದೊಡ್ಡದು ಆರಿಸಿ; ಟೇಬಲ್ ಸೇರಿದಂತೆ ಪ್ರತಿ ಪರದೆಯಲ್ಲೂ ಕಾರ್ಡ್‌ಗಳು, ಅಕ್ಷರ ಮತ್ತು ಬಟನ್‌ಗಳು ಒಟ್ಟಿಗೆ ದೊಡ್ಡದಾಗುತ್ತವೆ."
      ],
      [
        "ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್ ಮೋಡ್ ಇದೆಯೇ?",
        "ಹೌದು, ಪ್ರವೇಶಸಾಧ್ಯತೆ ವಿಂಡೋದಲ್ಲಿ. ಇದು ಯಾವುದೇ ಇಂಟರ್‌ಫೇಸ್ ಗಾತ್ರದೊಂದಿಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ."
      ],
      [
        "ಮೌಸ್ ಅಥವಾ ಟಚ್ ಸ್ಕ್ರೀನ್ ಇಲ್ಲದೆ ಆಡಬಹುದೇ?",
        "ಹೌದು, ಸಂಪೂರ್ಣವಾಗಿ ಕೀಬೋರ್ಡ್, ಗೇಮ್‌ಪ್ಯಾಡ್ ಅಥವಾ Android TV ರಿಮೋಟ್‌ನಿಂದ."
      ],
      [
        "ಸ್ಕ್ರೀನ್ ರೀಡರ್‌ನೊಂದಿಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆಯೇ?",
        "ಇನ್ನೂ ಸಂಪೂರ್ಣವಾಗಿ ಇಲ್ಲ. ಧ್ವನಿ ಘೋಷಣೆಗಳು ಆಟದ ಘಟನೆಗಳನ್ನು ಜೋರಾಗಿ ಓದುತ್ತವೆ ಮತ್ತು ಮೆನುಗಳಿಗೆ ಲೇಬಲ್‌ಗಳಿವೆ, ಆದರೆ ಪೋಕರ್ ಟೇಬಲ್ ಸ್ವತಃ ದೃಶ್ಯ ಇಂಟರ್‌ಫೇಸ್ ಆಗಿದ್ದು, ಕೇವಲ ಸ್ಕ್ರೀನ್ ರೀಡರ್‌ನಿಂದ ಅದನ್ನು ಇನ್ನೂ ಆಡಲು ಸಾಧ್ಯವಿಲ್ಲ."
      ],
      [
        "ಇದು ಉಚಿತವೇ?",
        "ಹೌದು. PokerTH ಉಚಿತ ಮತ್ತು ಓಪನ್-ಸೋರ್ಸ್ ಸಾಫ್ಟ್‌ವೇರ್; ಜಾಹೀರಾತುಗಳಿಲ್ಲ, ಆ್ಯಪ್‌ನೊಳಗಿನ ಖರೀದಿಗಳಿಲ್ಲ; ಎಲ್ಲ ಚಿಪ್‌ಗಳು ಕೇವಲ ಆಟದ ಹಣ."
      ]
    ]
  },
  ko: {
    "title": "접근성 높은 포커 — 큰 글씨, 키보드, 게임패드 | PokerTH",
    "desc": "무료 Texas Hold’em. 더 큰 글씨, 고대비, 4색 덱, 테이블 돋보기, 음성 안내를 갖추고, 키보드·게임패드·TV 리모컨만으로도 끝까지 플레이할 수 있습니다.",
    "ldHeadline": "접근성 높은 온라인 포커: 큰 글씨, 고대비, 키보드와 게임패드",
    "ldDesc": "PokerTH 웹 클라이언트의 접근성 기능: 인터페이스 크기, 고대비, 4색 덱, 돋보기, 음성 안내, 키보드, 게임패드, TV 리모컨.",
    "h1": "접근성 높은 포커: 나에게 맞게 플레이하세요",
    "lead": "PokerTH는 브라우저에서 즐기는 무료 Texas Hold’em으로, 보는 방식과 플레이하는 방식에 맞춰 바뀝니다. 더 큰 글씨와 버튼, 더 강한 대비, 무늬를 색으로 구분하는 덱, 작은 화면을 위한 돋보기, 음성 안내, 그리고 키보드, 게임패드, TV 리모컨으로 하는 완전한 조작까지 지원합니다.",
    "findH2": "어디에서 찾나요",
    "findP": "접근성 버튼 — 로그인 화면부터 테이블까지 모든 화면 위쪽에 있는 사람 모양 아이콘 — 을 누르면 언제든, 핸드 도중에도 주요 설정이 열립니다. 나머지는 모두 고급 옵션에 있습니다. 선택한 설정은 기기에 기억되며, pokerth.net 계정으로 로그인하면 다른 기기에서도 그대로 이어집니다.",
    "seeH2": "테이블을 잘 보이게",
    "see": [
      [
        "인터페이스 크기",
        "표준, 크게, 매우 크게: 로그인 화면, 로비, 테이블에서 글씨, 카드, 칩, 버튼이 함께 커지고, 휴대폰에서도 쓰기 편하도록 레이아웃이 다시 배치됩니다."
      ],
      [
        "고대비",
        "메뉴부터 테이블까지 인터페이스 전체에 대비가 더 강한 팔레트를 적용하며, 모든 인터페이스 크기에서 작동합니다."
      ],
      [
        "4색 덱",
        "무늬마다 고유한 색을 주는 카드 덱이라, 하트와 다이아몬드, 스페이드와 클럽을 모양만으로 구분할 일이 없습니다. 고급 옵션 → 스타일에서 고르세요."
      ],
      [
        "테이블 돋보기",
        "휴대폰에서는 테이블이 두 배로 확대되고 손가락으로 움직일 수 있으며, 내 차례가 되면 화면이 내 좌석으로 돌아옵니다. 브라우저의 핀치 확대도 허용할 수 있습니다."
      ],
      [
        "라이트, 다크 또는 자동",
        "클라이언트 전체가 내 선택이나 시스템 설정을 따르며, 눈에 맞는 테마, 덱, 테이블 색을 고를 수 있습니다."
      ]
    ],
    "keysH2": "키보드",
    "keysP": "모든 액션에 키가 있습니다. 테이블에서는 공식 PokerTH 기능 키가 작동합니다 — F1~F4는 Fold, Check/Call, Bet/Raise, All-In, F5는 내 카드 보여주기, F6~F8은 플레이 모드 — 그리고 웹 클라이언트가 한 글자 키를 더합니다(F, C, R, A, 그리고 팟의 1/3, 절반, 팟 전체를 위한 1, 2, 3). 모두 재할당할 수 있습니다. Escape는 맨 위 창을 닫고, Tab과 방향키로 로비의 테이블 목록을 이동하며, Alt+S는 어디서든 설정을 엽니다.",
    "padH2": "게임패드와 TV 리모컨",
    "padP": "게임 컨트롤러 — Xbox, PlayStation, Switch Pro 및 대부분의 Bluetooth 패드 — 로 게임 전체를 플레이할 수 있습니다. 모든 액션에 버튼이 있고, 트리거로 베팅 금액을 정하며, 탐색 모드로 화면, 채팅, 메뉴 사이를 이동합니다. 내 차례가 오면 진동합니다. Android TV와 Google TV에서는 리모컨이 같은 방식으로 작동하며, 네 가지 색 버튼이 있는 리모컨은 이를 Fold, Check/Call, Bet/Raise, All-In에 사용합니다.",
    "hearH2": "게임을 듣고 느끼기",
    "hearP": "음성 안내는 기기 자체의 음성으로 게임 이벤트를 소리 내어 읽어 주며, 시스템에 해당 언어의 음성이 있으면 내 언어로 읽습니다. Android 휴대폰에서는 짧은 진동이 내 차례를 알립니다. 게임 소리는 액션, 채팅, 네트워크 알림, 블라인드 인상의 네 그룹으로 나뉘어 각각 켜고 끌 수 있으며, 음량 슬라이더 하나로 조절합니다.",
    "calmH2": "놀랄 일은 줄이고",
    "calmP": "시스템에서 동작 줄이기를 요청하면 클라이언트가 애니메이션을 줄입니다. 훔쳐보기 방지는 터치할 때까지 내 카드를 덮어 두고, 실수 Call 보호는 큰 레이즈 직후 Call 버튼을 잠깐 잠가서, 작은 콜을 하려던 탭이 레이즈된 금액을 실수로 지불하지 않게 합니다.",
    "langH2": "내 언어로, 안내와 함께",
    "langP": "인터페이스는 {langs}개 언어로 제공되며, 필요한 경우 오른쪽에서 왼쪽으로 표시됩니다. 에이스 도움말을 켜면 웹 클라이언트의 마스코트 에이스가 화면마다 그때그때 설명해 주고, “이게 뭐예요?”는 화면의 무엇이든 어떤 기능인지 알려 줍니다.",
    "faqH2": "질문",
    "faq": [
      [
        "카드와 글씨를 더 크게 할 수 있나요?",
        "네. 접근성 창에서 크게 또는 매우 크게를 고르세요. 테이블을 포함한 모든 화면에서 카드, 글씨, 버튼이 함께 커집니다."
      ],
      [
        "고대비 모드가 있나요?",
        "네, 접근성 창에 있습니다. 모든 인터페이스 크기에서 작동합니다."
      ],
      [
        "마우스나 터치스크린 없이 플레이할 수 있나요?",
        "네, 키보드, 게임패드 또는 Android TV 리모컨만으로 완전히 플레이할 수 있습니다."
      ],
      [
        "스크린 리더로 쓸 수 있나요?",
        "아직 완전하지는 않습니다. 음성 안내가 게임 이벤트를 소리 내어 읽고 메뉴에는 레이블이 붙어 있지만, 포커 테이블 자체는 시각적 인터페이스라서 아직 스크린 리더만으로는 플레이할 수 없습니다."
      ],
      [
        "무료인가요?",
        "네. PokerTH는 무료 오픈 소스 소프트웨어로, 광고도 인앱 결제도 없으며, 모든 칩은 게임용 가상 머니입니다."
      ]
    ]
  },
  ky: {
    "title": "Жеткиликтүү покер — чоң текст, клавиатура, геймпад | PokerTH",
    "desc": "Акысыз Texas Hold’em: чоңураак текст, жогорку контраст, төрт түстүү карталар, лупа, үн менен кабарлоо жана клавиатура, геймпад же ТВ пульту менен толук оюн.",
    "ldHeadline": "Жеткиликтүү онлайн покер: чоң текст, жогорку контраст, клавиатура жана геймпад",
    "ldDesc": "PokerTH веб-кардарынын жеткиликтүүлүк мүмкүнчүлүктөрү: интерфейстин өлчөмү, жогорку контраст, төрт түстүү карталар, лупа, үн менен кабарлоо, клавиатура, геймпад жана ТВ пульту.",
    "h1": "Жеткиликтүү покер: өзүңүзгө ыңгайлуу ойноңуз",
    "lead": "PokerTH — браузердеги акысыз Texas Hold’em, ал сиздин көрүү жана ойноо ыкмаңызга ыңгайлашат: чоңураак текст жана баскычтар, күчтүүрөөк контраст, масттарды түсү менен айырмалаган карталар, кичи экрандар үчүн лупа, үн менен кабарлоо, ошондой эле клавиатура, геймпад же ТВ пульту менен толук башкаруу.",
    "findH2": "Кайдан табасыз",
    "findP": "Жеткиликтүүлүк баскычы — кирүү экранынан үстөлгө чейин ар бир экрандын жогору жагындагы адам сүрөтчөсү — негизги жөндөөлөрдү каалаган убакта, ал тургай кол ортосунда да ачат. Калганынын баары Кошумча параметрлерде. Тандооңуз түзмөктө эстелип калат жана pokerth.net аккаунту менен киргениңизде башка түзмөктөрүңүзгө да өтөт.",
    "seeH2": "Үстөлдү көрүү",
    "see": [
      [
        "Интерфейстин өлчөмү",
        "Стандарттуу, Чоң же Өтө чоң: текст, карталар, чиптер жана баскычтар кирүү экранында, лоббиде жана үстөлдө чогуу чоңоёт, ал эми телефондо ыңгайлуу бойдон калышы үчүн жайгашуу кайра түзүлөт."
      ],
      [
        "Жогорку контраст",
        "Менюлардан үстөлгө чейин бүт интерфейсте күчтүүрөөк контрасттуу палитра, интерфейстин ар бир өлчөмүндө."
      ],
      [
        "Төрт түстүү карталар",
        "Ар бир мастка өз түсүн берген карта топтомдору, ошондуктан черви ♥ менен бубна ♦, же пика ♠ менен крести ♣ эч качан формасы боюнча гана айырмаланбайт. Бирин Кошумча параметрлер → Стиль бөлүмүнөн тандаңыз."
      ],
      [
        "Үстөл лупасы",
        "Телефондо үстөл эки эсе чоңоёт жана манжа менен жылат; кезегиңиз келгенде көрүнүш ордуңузга кайтат. Браузердин эки манжа менен чоңойтуусуна да уруксат берсе болот."
      ],
      [
        "Жарык, караңгы же автоматтык",
        "Бүт кардар сиздин же системаңыздын тандоосун ээрчийт, көзүңүзгө ылайыктуу темалар, карталар жана үстөл түстөрү менен."
      ]
    ],
    "keysH2": "Клавиатура",
    "keysP": "Ар бир аракеттин өз баскычы бар. PokerTH'тин расмий функциялык баскычтары үстөлдө иштейт — F1ден F4кө чейин Fold, Check/Call, Bet/Raise жана All-In үчүн, F5 карталарыңызды көрсөтүү үчүн, F6дан F8ге чейин оюн режимдери үчүн — ал эми веб-кардар жалгыз тамгаларды кошот (F, C, R, A, жана банктын үчтөн бири, жарымы же толук банк үчүн 1, 2, 3), алардын баарын кайра дайындаса болот. Escape эң үстүңкү терезени жабат, Tab жана жебе баскычтары лоббидеги үстөлдөр тизмеси боюнча жылдырат, ал эми Alt+S жөндөөлөрдү каалаган жерден ачат.",
    "padH2": "Геймпад жана ТВ пульту",
    "padP": "Оюн контроллери — Xbox, PlayStation, Switch Pro жана көпчүлүк Bluetooth геймпаддар — менен бүт оюнду ойносо болот: ар бир аракет үчүн баскычтар, ставканы коюу үчүн триггерлер жана экрандар, чат жана менюлар боюнча жылуу үчүн навигация режими. Кезегиңиз келгенде ал титирейт. Android TV жана Google TV'де пульт ушундай эле иштейт, ал эми төрт түстүү баскычы бар пульттар аларды Fold, Check/Call, Bet/Raise жана All-In үчүн колдонот.",
    "hearH2": "Оюнду угуу жана сезүү",
    "hearP": "Үн менен кабарлоо оюн окуяларын түзмөгүңүздүн өз үндөрү менен, система колдосо сиздин тилиңизде үн чыгарып окуйт. Android телефондорунда кыска титирөө кезегиңизди билдирет. Оюн үндөрү төрт топко бөлүнөт — аракеттер, чат, тармак билдирүүлөрү жана блайнддардын көтөрүлүшү — аларды бир үн көлөмү сыдырмасы менен өз-өзүнчө күйгүзүп же өчүрсө болот.",
    "calmH2": "Күтүлбөгөн нерселер азыраак",
    "calmP": "Системаңыз кыймылды азайтууну сураганда, кардар анимацияларын басаңдатат. «Карап коюудан коргоо» өз карталарыңызды аларды басканыңызга чейин жашырып турат, ал эми кокустан call'дан коргоо чоң raise'тен кийин дароо Call баскычын кыска убакытка бөгөттөйт, кичи call үчүн болгон басуу көтөрүлгөн сумманы жаңылыштык менен төлөп салбашы үчүн.",
    "langH2": "Өз тилиңизде, жол көрсөткүч менен",
    "langP": "Интерфейс {langs} тилде жеткиликтүү, керек болгон жерде оңдон солго. Туздун жардамы, веб-кардардын талисманы, кааласаңыз, ар бир экранды жол-жөнүндө түшүндүрүп берет, ал эми «Бул эмне?» экрандагы ар бир нерсе эмне кыларын айтып берет.",
    "faqH2": "Суроолор",
    "faq": [
      [
        "Карталарды жана текстти чоңойтсо болобу?",
        "Ооба. Жеткиликтүүлүк терезесинде Чоң же Өтө чоң тандаңыз; карталар, текст жана баскычтар ар бир экранда, үстөлдө да чогуу чоңоёт."
      ],
      [
        "Жогорку контраст режими барбы?",
        "Ооба, Жеткиликтүүлүк терезесинде. Ал интерфейстин ар бир өлчөмү менен иштейт."
      ],
      [
        "Чычкансыз же сенсордук экрансыз ойносо болобу?",
        "Ооба, толугу менен клавиатура, геймпад же Android TV пульту менен."
      ],
      [
        "Экран окугуч менен иштейби?",
        "Азырынча толук эмес. Үн менен кабарлоо оюн окуяларын үн чыгарып окуйт жана менюлардын белгилери бар, бирок покер үстөлүнүн өзү визуалдык интерфейс, аны азырынча экран окугуч менен гана ойноого болбойт."
      ],
      [
        "Акысызбы?",
        "Ооба. PokerTH — жарнамасыз жана колдонмо ичиндеги сатып алууларсыз акысыз, булак коду ачык программа; бардык чиптер оюн акчасы гана."
      ]
    ]
  },
  lt: {
    "title": "Prieinamas pokeris — didelis tekstas, klaviatūra, pultelis | PokerTH",
    "desc": "Nemokamas Texas Hold’em su didesniu tekstu, dideliu kontrastu, 4 spalvų kaladėmis, didinamuoju stiklu, balso pranešimais ir valdymu klaviatūra, pulteliu ar TV pultu.",
    "ldHeadline": "Prieinamas internetinis pokeris: didelis tekstas, didelis kontrastas, klaviatūra ir žaidimų pultelis",
    "ldDesc": "PokerTH žiniatinklio kliento pritaikymo neįgaliesiems funkcijos: sąsajos dydis, didelis kontrastas, 4 spalvų kaladės, didinamasis stiklas, balso pranešimai, klaviatūra, žaidimų pultelis ir TV pultas.",
    "h1": "Prieinamas pokeris: žaiskite savaip",
    "lead": "PokerTH — tai nemokamas Texas Hold’em naršyklėje, prisitaikantis prie to, kaip matote ir žaidžiate: didesnis tekstas ir mygtukai, stipresnis kontrastas, kaladės, kuriose rūšys skiriasi spalvomis, didinamasis stiklas mažiems ekranams, balso pranešimai ir visiškas valdymas klaviatūra, žaidimų pulteliu ar TV pultu.",
    "findH2": "Kur tai rasti",
    "findP": "Mygtukas Pritaikymas neįgaliesiems — žmogaus piktograma kiekvieno ekrano viršuje, nuo prisijungimo ekrano iki stalo, — bet kada atveria pagrindinius nustatymus, net rankos viduryje. Visa kita yra Išplėstinėse parinktyse. Jūsų pasirinkimai įsimenami įrenginyje, o prisijungus su pokerth.net paskyra keliauja kartu su jumis į kitus jūsų įrenginius.",
    "seeH2": "Stalo matymas",
    "see": [
      [
        "Sąsajos dydis",
        "Standartinis, Didelis arba Labai didelis: tekstas, kortos, žetonai ir mygtukai didėja kartu — prisijungimo ekrane, fojė ir prie stalo, — o išdėstymas persitvarko, kad juo būtų patogu naudotis ir telefone."
      ],
      [
        "Didelis kontrastas",
        "Stipresnio kontrasto paletė visoje sąsajoje, nuo meniu iki stalo, esant bet kokiam sąsajos dydžiui."
      ],
      [
        "4 spalvų kaladės",
        "Kaladės, kuriose kiekviena rūšis turi savo spalvą, todėl širdžių ir būgnų ar vynų ir kryžių niekada nereikia atskirti vien pagal formą. Pasirinkite vieną skiltyje Išplėstinės parinktys → Stilius."
      ],
      [
        "Stalo didinamasis stiklas",
        "Telefone stalas padidinamas dvigubai ir stumdomas pirštu; kai ateina jūsų eilė, vaizdas grįžta prie jūsų vietos. Taip pat galima leisti naršyklės mastelio keitimą suspaudžiant pirštais."
      ],
      [
        "Šviesus, tamsus ar automatinis",
        "Visas klientas seka jūsų arba jūsų sistemos pasirinkimą, su temomis, kaladėmis ir stalo spalvomis, tinkančiomis jūsų akims."
      ]
    ],
    "keysH2": "Klaviatūra",
    "keysP": "Kiekvienas veiksmas turi savo klavišą. Oficialūs PokerTH funkciniai klavišai veikia prie stalo — F1–F4 skirti Fold, Check/Call, Bet/Raise ir All-In, F5 parodo jūsų kortas, F6–F8 perjungia žaidimo režimus, — o žiniatinklio klientas prideda pavienes raides (F, C, R, A ir 1, 2, 3 trečdaliui banko, pusei banko ar visam bankui), kurias visas galima priskirti iš naujo. Escape uždaro viršutinį langą, Tab ir rodyklių klavišai leidžia judėti fojė stalų sąraše, o Alt+S iš bet kur atveria nustatymus.",
    "padH2": "Žaidimų pultelis ir TV pultas",
    "padP": "Žaidimų pultelis — Xbox, PlayStation, Switch Pro ir dauguma Bluetooth pultelių — valdo visą žaidimą: mygtukai kiekvienam veiksmui, gaidukai statymui nustatyti ir naršymo režimas judėti po ekranus, pokalbius ir meniu. Kai ateina jūsų eilė, jis suvibruoja. Android TV ir Google TV pultas veikia taip pat, o pultai su keturiais spalvotais klavišais naudoja juos Fold, Check/Call, Bet/Raise ir All-In.",
    "hearH2": "Girdėti ir jausti žaidimą",
    "hearP": "Balso pranešimai garsiai skaito žaidimo įvykius jūsų įrenginio balsais, jūsų kalba, jei sistema ją turi. Android telefonuose trumpa vibracija pažymi jūsų eilę. Žaidimo garsai suskirstyti į keturias grupes — veiksmai, pokalbiai, tinklo pranešimai ir blindų kilimas, — kurias galima įjungti ar išjungti atskirai, su vienu garsumo šliaužikliu.",
    "calmH2": "Mažiau staigmenų",
    "calmP": "Kai jūsų sistema prašo sumažinti judesį, klientas prislopina animacijas. Apsauga nuo žvilgčiojimo laiko jūsų kortas uždengtas, kol jų nepaliečiate, o apsauga nuo atsitiktinio Call trumpam užrakina mygtuką Call iškart po didelio kėlimo, kad mažesniam Call skirtas palietimas per klaidą nesumokėtų pakeltos sumos.",
    "langH2": "Jūsų kalba, su gidu",
    "langP": "Sąsaja pasiekiama {langs} kalbomis, prireikus — iš dešinės į kairę. Su Tūzo pagalba tūzas, žiniatinklio kliento talismanas, jei norite, paaiškina kiekvieną ekraną eigoje, o „Kas tai?“ pasako, ką daro bet kuris ekrano elementas.",
    "faqH2": "Klausimai",
    "faq": [
      [
        "Ar galiu padidinti kortas ir tekstą?",
        "Taip. Lange Pritaikymas neįgaliesiems pasirinkite Didelis arba Labai didelis; kortos, tekstas ir mygtukai didėja kartu kiekviename ekrane, taip pat ir prie stalo."
      ],
      [
        "Ar yra didelio kontrasto režimas?",
        "Taip, lange Pritaikymas neįgaliesiems. Jis veikia su bet kokiu sąsajos dydžiu."
      ],
      [
        "Ar galiu žaisti be pelės ar jutiklinio ekrano?",
        "Taip, vien klaviatūra, žaidimų pulteliu arba Android TV pultu."
      ],
      [
        "Ar veikia su ekrano skaitytuvu?",
        "Kol kas ne visiškai. Balso pranešimai garsiai skaito žaidimo įvykius, o meniu turi etiketes, tačiau pats pokerio stalas yra vizuali sąsaja, ir jo kol kas negalima žaisti vien su ekrano skaitytuvu."
      ],
      [
        "Ar tai nemokama?",
        "Taip. PokerTH yra nemokama atvirojo kodo programinė įranga be reklamų ir be pirkinių programėlėje; visi žetonai yra žaidimo pinigai."
      ]
    ]
  },
  lv: {
    "title": "Pieejams pokers — liels teksts, tastatūra, spēļu pults | PokerTH",
    "desc": "Bezmaksas Texas Hold’em ar lielāku tekstu, augstu kontrastu, 4 krāsu kārtīm, galda lupu, balss paziņojumiem un pilnu vadību ar tastatūru, spēļu pulti un TV pulti.",
    "ldHeadline": "Pieejams tiešsaistes pokers: liels teksts, augsts kontrasts, tastatūra un spēļu pults",
    "ldDesc": "PokerTH tīmekļa klienta pieejamības funkcijas: saskarnes izmērs, augsts kontrasts, 4 krāsu kāršu komplekti, lupa, balss paziņojumi, tastatūra, spēļu pults un TV pults.",
    "h1": "Pieejams pokers: spēlē savā veidā",
    "lead": "PokerTH ir bezmaksas Texas Hold’em pārlūkā, un tas pielāgojas tam, kā tu redzi un spēlē: lielāks teksts un pogas, spēcīgāks kontrasts, kāršu komplekti, kuros mastus atšķir pēc krāsas, lupa maziem ekrāniem, balss paziņojumi un pilnīga vadība ar tastatūru, spēļu pulti vai TV pulti.",
    "findH2": "Kur to atrast",
    "findP": "Poga „Pieejamība” — cilvēka ikona katra ekrāna augšdaļā, no pieteikšanās ekrāna līdz galdam — jebkurā brīdī atver galvenos iestatījumus, pat partijas vidū. Viss pārējais ir sadaļā Papildu opcijas. Tavas izvēles tiek saglabātas ierīcē un, ja piesakies ar pokerth.net kontu, seko tev uz citām tavām ierīcēm.",
    "seeH2": "Labi redzēt galdu",
    "see": [
      [
        "Saskarnes izmērs",
        "Standarta, Liels vai Ļoti liels: teksts, kārtis, žetoni un pogas palielinās kopā — pieteikšanās ekrānā, vestibilā un pie galda —, un izkārtojums pārkārtojas, lai paliktu ērti lietojams telefonā."
      ],
      [
        "Augsts kontrasts",
        "Kontrastaināka palete visā saskarnē, no izvēlnēm līdz galdam, pie jebkura saskarnes izmēra."
      ],
      [
        "4 krāsu kāršu komplekti",
        "Kāršu komplekti, kuros katram mastam ir sava krāsa, tāpēc ercenus un kāravus vai pīķus un kreičus nekad nav jāatšķir tikai pēc formas. Izvēlies kādu sadaļā Papildu opcijas → Stils."
      ],
      [
        "Galda lupa",
        "Telefonā galds tiek pietuvināts divreiz un pārvietojams ar pirkstu; kad pienāk tava kārta, skats atgriežas pie tavas vietas. Var atļaut arī pārlūka savilkšanas tālummaiņu."
      ],
      [
        "Gaišs, tumšs vai automātisks",
        "Viss klients seko tavai vai tavas sistēmas izvēlei, ar motīviem, kāršu komplektiem un galda krāsām, kas der tavām acīm."
      ]
    ],
    "keysH2": "Tastatūra",
    "keysP": "Katrai darbībai ir savs taustiņš. Pie galda darbojas oficiālie PokerTH funkciju taustiņi — no F1 līdz F4: Fold, Check/Call, Bet/Raise un All-In, F5 — parādīt savas kārtis, no F6 līdz F8 — spēles režīmi —, un tīmekļa klients pievieno atsevišķus burtus (F, C, R, A, kā arī 1, 2, 3 — trešdaļa banka, puse banka vai viss banks), un tos visus var piešķirt no jauna. Escape aizver augšējo logu, Tab un bultiņu taustiņi pārvietojas pa vestibila galdu sarakstu, un Alt+S atver iestatījumus no jebkuras vietas.",
    "padH2": "Spēļu pults un TV pults",
    "padP": "Ar spēļu pulti — Xbox, PlayStation, Switch Pro un lielāko daļu Bluetooth pultu — var nospēlēt visu spēli: pogas katrai darbībai, trigeri likmes iestatīšanai un navigācijas režīms, lai pārvietotos pa ekrāniem, tērzēšanu un izvēlnēm. Kad pienāk tavs gājiens, pults novibrē. Android TV un Google TV pults darbojas tāpat, un pultis ar četriem krāsainajiem taustiņiem izmanto tos Fold, Check/Call, Bet/Raise un All-In.",
    "hearH2": "Dzirdēt un sajust spēli",
    "hearP": "Balss paziņojumi nolasa spēles notikumus ar tavas ierīces balsīm, tavā valodā, ja sistēmā tāda ir. Android telefonos īsa vibrācija atzīmē tavu gājienu. Spēles skaņas ir sadalītas četrās grupās — darbības, tērzēšana, tīkla paziņojumi un aklo likmju paaugstināšana —, ko var ieslēgt vai izslēgt atsevišķi, ar vienu skaļuma slīdni.",
    "calmH2": "Mazāk pārsteigumu",
    "calmP": "Ja tava sistēma pieprasa samazinātu kustību, klients mazina savas animācijas. Aizsardzība pret ieskatīšanos patur tavas kārtis slēptas, līdz tām pieskaries, bet nejauša Call aizsardzība uz brīdi bloķē pogu Call tūlīt pēc liela paaugstinājuma, lai pieskāriens, kas bija domāts mazākam Call, nejauši nesamaksātu paaugstināto summu.",
    "langH2": "Tavā valodā, ar gidu",
    "langP": "Saskarne ir pieejama {langs} valodās, vajadzības gadījumā no labās uz kreiso. Dūža palīdzība — dūzis ir tīmekļa klienta talismans — ja vēlies, paskaidro katru ekrānu pa ceļam, un „Kas tas ir?” pasaka, ko dara jebkas uz ekrāna.",
    "faqH2": "Jautājumi",
    "faq": [
      [
        "Vai varu palielināt kārtis un tekstu?",
        "Jā. Logā „Pieejamība” izvēlies Liels vai Ļoti liels; kārtis, teksts un pogas palielinās kopā katrā ekrānā, arī pie galda."
      ],
      [
        "Vai ir augsta kontrasta režīms?",
        "Jā, logā „Pieejamība”. Tas darbojas ar jebkuru saskarnes izmēru."
      ],
      [
        "Vai varu spēlēt bez peles vai skārienekrāna?",
        "Jā, pilnībā ar tastatūru, ar spēļu pulti vai ar Android TV pulti."
      ],
      [
        "Vai tas darbojas ar ekrāna lasītāju?",
        "Vēl ne pilnībā. Balss paziņojumi nolasa spēles notikumus, un izvēlnēm ir etiķetes, taču pats pokera galds ir vizuāla saskarne, un to vēl nevar spēlēt tikai ar ekrāna lasītāju."
      ],
      [
        "Vai tas ir bez maksas?",
        "Jā. PokerTH ir bezmaksas atvērtā pirmkoda programmatūra bez reklāmām un bez pirkumiem lietotnē; visi žetoni ir spēles nauda."
      ]
    ]
  },
  mk: {
    "title": "Пристапен покер — голем текст, тастатура, гејмпед | PokerTH",
    "desc": "Бесплатен Texas Hold’em со поголем текст, висок контраст, шпилови со 4 бои, лупа за масата, гласовни најави и целосна игра со тастатура, гејмпед и ТВ далечински.",
    "ldHeadline": "Пристапен онлајн покер: голем текст, висок контраст, тастатура и гејмпед",
    "ldDesc": "Функциите за пристапност на веб-клиентот PokerTH: големина на интерфејсот, висок контраст, шпилови со 4 бои, лупа, гласовни најави, тастатура, гејмпед и ТВ далечински.",
    "h1": "Пристапен покер: играј на свој начин",
    "lead": "PokerTH е бесплатен Texas Hold’em во прелистувачот и се прилагодува на начинот на кој гледаш и играш: поголем текст и копчиња, посилен контраст, шпилови во кои секој знак има своја боја, лупа за мали екрани, гласовни најави и целосна контрола со тастатура, гејмпед или ТВ далечински.",
    "findH2": "Каде да го најдеш",
    "findP": "Копчето Пристапност — иконата со човече на врвот од секој екран, од екранот за најава до масата — ги отвора главните поставки во секое време, дури и среде рака. Сè друго е во Напредни поставки. Твоите избори се паметат на уредот и, кога ќе се најавиш со сметка на pokerth.net, те следат и на другите уреди.",
    "seeH2": "Јасен поглед на масата",
    "see": [
      [
        "Големина на интерфејсот",
        "Стандардна, Голема или Многу голема: текстот, картите, жетоните и копчињата растат заедно, на екранот за најава, во предворјето и на масата, а распоредот се прилагодува за да остане употреблив и на телефон."
      ],
      [
        "Висок контраст",
        "Палета со посилен контраст низ целиот интерфејс, од менијата до масата, при секоја големина на интерфејсот."
      ],
      [
        "Шпилови со 4 бои",
        "Шпилови карти во кои секој знак има своја боја, така што срце и каро, или пик и треф, никогаш не се разликуваат само по облик. Избери еден во Напредни поставки → Стил."
      ],
      [
        "Лупа за масата",
        "На телефон масата се зумира двојно и се движи со прст; погледот се враќа на твоето место кога си на потег. Може да се дозволи и зумирањето со штипење на прелистувачот."
      ],
      [
        "Светол, темен или автоматски",
        "Целиот клиент го следи твојот избор или изборот на системот, со теми, шпилови и бои на масата што им одговараат на твоите очи."
      ]
    ],
    "keysH2": "Тастатура",
    "keysP": "Секој потег има копче. Официјалните функциски копчиња на PokerTH работат на масата — F1 до F4 за Fold, Check/Call, Bet/Raise и All-In, F5 за да ги покажеш картите, F6 до F8 за режимите на игра — а веб-клиентот додава поединечни букви (F, C, R, A и 1, 2, 3 за третина од потот, половина пот или цел пот), кои сите можат да се преназначат. Esc го затвора најгорниот прозорец, Tab и стрелките се движат низ списокот маси во предворјето, а Alt+S ги отвора поставките од секаде.",
    "padH2": "Гејмпед и ТВ далечински",
    "padP": "Контролер за игри — Xbox, PlayStation, Switch Pro и повеќето Bluetooth гејмпедови — ја игра целата игра: копчиња за секој потег, тригери за висината на влогот и режим Навигација за движење низ екраните, разговорот и менијата. Вибрира кога ќе дојде твојот ред. На Android TV и Google TV далечинскиот работи на ист начин, а далечинските со четирите копчиња во боја ги користат за Fold, Check/Call, Bet/Raise и All-In.",
    "hearH2": "Слушни ја и почувствувај ја играта",
    "hearP": "Гласовните најави на глас ги читаат настаните од играта со гласовите на самиот уред, на твојот јазик ако системот има таков глас. На Android телефони кратка вибрација го означува твојот потег. Звуците од играта се поделени во четири групи — потези, разговор, мрежни известувања и зголемување на блајндовите — што може посебно да се вклучат или исклучат, со еден лизгач за јачина.",
    "calmH2": "Помалку изненадувања",
    "calmP": "Кога системот бара намалено движење, клиентот ги ублажува своите анимации. Заштитата од шпионирање ги држи твоите карти скриени додека не ги допреш, а заштитата од случаен Call накратко го блокира копчето Call веднаш по големо зголемување, така што допир наменет за помал Call не може по грешка да го плати зголемениот износ.",
    "langH2": "На твојот јазик, со водич",
    "langP": "Интерфејсот е достапен на {langs} јазици, од десно кон лево каде што треба. Со Помош од кецот, кецот — маскотата на веб-клиентот — ти го објаснува секој екран додека играш, ако сакаш, а „Што е ова?“ ти кажува што прави секој дел од екранот.",
    "faqH2": "Прашања",
    "faq": [
      [
        "Може ли да ги зголемам картите и текстот?",
        "Да. Избери Голема или Многу голема во прозорецот Пристапност; картите, текстот и копчињата растат заедно на секој екран, вклучително и на масата."
      ],
      [
        "Има ли режим со висок контраст?",
        "Да, во прозорецот Пристапност. Работи со секоја големина на интерфејсот."
      ],
      [
        "Може ли да играм без глушец или екран на допир?",
        "Да, целосно со тастатура, со гејмпед или со далечински за Android TV."
      ],
      [
        "Дали работи со читач на екран?",
        "Сè уште не целосно. Гласовните најави на глас ги читаат настаните од играта и менијата имаат ознаки, но самата покер-маса е визуелен интерфејс и сè уште не може да се игра само со читач на екран."
      ],
      [
        "Дали е бесплатно?",
        "Да. PokerTH е бесплатен софтвер со отворен код, без реклами и без купувања во апликацијата; сите жетони се само за игра."
      ]
    ]
  },
  ml: {
    "title": "പ്രവേശനക്ഷമതയുള്ള പോക്കർ — വലിയ അക്ഷരം, കീബോർഡ്, ഗെയിംപാഡ് | PokerTH",
    "desc": "സൗജന്യ Texas Hold’em: വലിയ അക്ഷരങ്ങൾ, ഉയർന്ന കോൺട്രാസ്റ്റ്, നാലു-നിറ ഡെക്കുകൾ, ഭൂതക്കണ്ണാടി, ശബ്ദ അറിയിപ്പുകൾ, കീബോർഡ്, ഗെയിംപാഡ്, ടിവി റിമോട്ട് വഴി പൂർണ്ണ കളി.",
    "ldHeadline": "പ്രവേശനക്ഷമതയുള്ള ഓൺലൈൻ പോക്കർ: വലിയ അക്ഷരങ്ങൾ, ഉയർന്ന കോൺട്രാസ്റ്റ്, കീബോർഡ്, ഗെയിംപാഡ്",
    "ldDesc": "PokerTH വെബ് ക്ലയന്റിന്റെ പ്രവേശനക്ഷമത സവിശേഷതകൾ: ഇന്റർഫേസ് വലുപ്പം, ഉയർന്ന കോൺട്രാസ്റ്റ്, നാലു-നിറ ഡെക്കുകൾ, ഭൂതക്കണ്ണാടി, ശബ്ദ അറിയിപ്പുകൾ, കീബോർഡ്, ഗെയിംപാഡ്, ടിവി റിമോട്ട്.",
    "h1": "പ്രവേശനക്ഷമതയുള്ള പോക്കർ: നിങ്ങളുടെ രീതിയിൽ കളിക്കൂ",
    "lead": "PokerTH ബ്രൗസറിലെ സൗജന്യ Texas Hold’em ആണ്, നിങ്ങൾ കാണുന്നതിനും കളിക്കുന്നതിനും അനുസരിച്ച് അത് ഇണങ്ങുന്നു: വലിയ അക്ഷരങ്ങളും ബട്ടണുകളും, കൂടുതൽ കോൺട്രാസ്റ്റ്, സ്യൂട്ടുകളെ നിറം കൊണ്ട് വേർതിരിക്കുന്ന ഡെക്കുകൾ, ചെറിയ സ്ക്രീനുകൾക്ക് ഭൂതക്കണ്ണാടി, ശബ്ദ അറിയിപ്പുകൾ, കീബോർഡ്, ഗെയിംപാഡ് അല്ലെങ്കിൽ ടിവി റിമോട്ട് വഴി പൂർണ്ണ നിയന്ത്രണം.",
    "findH2": "എവിടെ കണ്ടെത്താം",
    "findP": "പ്രവേശനക്ഷമത ബട്ടൺ — ലോഗിൻ സ്ക്രീൻ മുതൽ ടേബിൾ വരെ എല്ലാ സ്ക്രീനിന്റെയും മുകളിലുള്ള വ്യക്തിയുടെ ഐക്കൺ — ഏത് സമയത്തും, ഒരു ഹാൻഡിന്റെ നടുവിൽ പോലും, പ്രധാന ക്രമീകരണങ്ങൾ തുറക്കുന്നു. ബാക്കിയെല്ലാം വിപുലമായ ഓപ്ഷനുകളിലാണ്. നിങ്ങളുടെ തിരഞ്ഞെടുപ്പുകൾ ഉപകരണത്തിൽ ഓർമ്മിക്കപ്പെടും, pokerth.net അക്കൗണ്ട് ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുമ്പോൾ നിങ്ങളുടെ മറ്റ് ഉപകരണങ്ങളിലേക്കും ഒപ്പം വരും.",
    "seeH2": "ടേബിൾ വ്യക്തമായി കാണാൻ",
    "see": [
      [
        "ഇന്റർഫേസ് വലുപ്പം",
        "സാധാരണ, വലുത് അല്ലെങ്കിൽ വളരെ വലുത്: ലോഗിൻ സ്ക്രീനിലും ലോബിയിലും ടേബിളിലും അക്ഷരങ്ങൾ, കാർഡുകൾ, ചിപ്പുകൾ, ബട്ടണുകൾ എന്നിവ ഒരുമിച്ച് വലുതാകുന്നു, ഫോണിലും ഉപയോഗയോഗ്യമായി തുടരാൻ ലേഔട്ട് പുനഃക്രമീകരിക്കപ്പെടുന്നു."
      ],
      [
        "ഉയർന്ന കോൺട്രാസ്റ്റ്",
        "മെനുകൾ മുതൽ ടേബിൾ വരെ മുഴുവൻ ഇന്റർഫേസിലും കൂടുതൽ കോൺട്രാസ്റ്റുള്ള നിറക്കൂട്ട്, ഏത് ഇന്റർഫേസ് വലുപ്പത്തിലും."
      ],
      [
        "നാലു-നിറ ഡെക്കുകൾ",
        "ഓരോ സ്യൂട്ടിനും സ്വന്തം നിറം നൽകുന്ന കാർഡ് ഡെക്കുകൾ; അതിനാൽ ഹാർട്ടും ഡയമണ്ടും, സ്പേഡും ക്ലബ്ബും ഒരിക്കലും ആകൃതി മാത്രം നോക്കി തിരിച്ചറിയേണ്ടി വരില്ല. വിപുലമായ ഓപ്ഷനുകൾ → ശൈലി എന്നതിൽ നിന്ന് ഒന്ന് തിരഞ്ഞെടുക്കുക."
      ],
      [
        "ടേബിൾ ഭൂതക്കണ്ണാടി",
        "ഫോണിൽ ടേബിൾ ഇരട്ടി വലുപ്പത്തിലേക്ക് സൂം ചെയ്യുകയും വിരൽ കൊണ്ട് നീക്കാനാവുകയും ചെയ്യും; നിങ്ങളുടെ ഊഴം വരുമ്പോൾ കാഴ്ച നിങ്ങളുടെ സീറ്റിലേക്ക് മടങ്ങും. ബ്രൗസറിന്റെ പിഞ്ച്-സൂമും അനുവദിക്കാം."
      ],
      [
        "ലൈറ്റ്, ഡാർക്ക് അല്ലെങ്കിൽ ഓട്ടോമാറ്റിക്",
        "മുഴുവൻ ക്ലയന്റും നിങ്ങളുടെയോ സിസ്റ്റത്തിന്റെയോ തിരഞ്ഞെടുപ്പ് പിന്തുടരുന്നു, നിങ്ങളുടെ കണ്ണുകൾക്ക് ഇണങ്ങുന്ന തീമുകളും ഡെക്കുകളും ടേബിൾ നിറങ്ങളും സഹിതം."
      ]
    ],
    "keysH2": "കീബോർഡ്",
    "keysP": "ഓരോ പ്രവൃത്തിക്കും ഒരു കീ ഉണ്ട്. ഔദ്യോഗിക PokerTH ഫംഗ്ഷൻ കീകൾ ടേബിളിൽ പ്രവർത്തിക്കും — Fold, Check/Call, Bet/Raise, All-In എന്നിവയ്ക്ക് F1 മുതൽ F4 വരെ, നിങ്ങളുടെ കാർഡുകൾ കാണിക്കാൻ F5, കളി മോഡുകൾക്ക് F6 മുതൽ F8 വരെ — കൂടാതെ വെബ് ക്ലയന്റ് ഒറ്റ അക്ഷരങ്ങളും ചേർക്കുന്നു (F, C, R, A, പോട്ടിന്റെ മൂന്നിലൊന്ന്, പകുതി പോട്ട്, മുഴുവൻ പോട്ട് എന്നിവയ്ക്ക് 1, 2, 3), ഇവയെല്ലാം മാറ്റി നിശ്ചയിക്കാം. Esc ഏറ്റവും മുകളിലെ വിൻഡോ അടയ്ക്കുന്നു, Tab ഉം ആരോ കീകളും ലോബിയിലെ ടേബിൾ പട്ടികയിലൂടെ നീങ്ങുന്നു, Alt+S എവിടെ നിന്നും ക്രമീകരണങ്ങൾ തുറക്കുന്നു.",
    "padH2": "ഗെയിംപാഡും ടിവി റിമോട്ടും",
    "padP": "ഒരു ഗെയിം കൺട്രോളർ — Xbox, PlayStation, Switch Pro, മിക്ക Bluetooth പാഡുകളും — കൊണ്ട് മുഴുവൻ കളിയും കളിക്കാം: ഓരോ പ്രവൃത്തിക്കും ബട്ടണുകൾ, ബെറ്റ് തുക നിശ്ചയിക്കാൻ ട്രിഗറുകൾ, സ്ക്രീനുകളിലൂടെയും ചാറ്റിലൂടെയും മെനുകളിലൂടെയും നീങ്ങാൻ ഒരു നാവിഗേഷൻ മോഡ്. നിങ്ങളുടെ ഊഴം വരുമ്പോൾ അത് വൈബ്രേറ്റ് ചെയ്യും. Android TV യിലും Google TV യിലും റിമോട്ട് ഇതേ രീതിയിൽ പ്രവർത്തിക്കുന്നു, നാല് നിറ കീകളുള്ള റിമോട്ടുകൾ അവ Fold, Check/Call, Bet/Raise, All-In എന്നിവയ്ക്കായി ഉപയോഗിക്കുന്നു.",
    "hearH2": "കളി കേൾക്കാനും അനുഭവിക്കാനും",
    "hearP": "ശബ്ദ അറിയിപ്പുകൾ നിങ്ങളുടെ ഉപകരണത്തിന്റെ സ്വന്തം ശബ്ദങ്ങൾ ഉപയോഗിച്ച് ഗെയിം സംഭവങ്ങൾ ഉറക്കെ വായിക്കുന്നു, സിസ്റ്റത്തിൽ ഉണ്ടെങ്കിൽ നിങ്ങളുടെ ഭാഷയിൽ. Android ഫോണുകളിൽ ഒരു ചെറിയ വൈബ്രേഷൻ നിങ്ങളുടെ ഊഴം അറിയിക്കുന്നു. ഗെയിം ശബ്ദങ്ങൾ നാല് ഗ്രൂപ്പുകളിലാണ് — പ്രവൃത്തികൾ, ചാറ്റ്, നെറ്റ്‌വർക്ക് അറിയിപ്പുകൾ, ബ്ലൈൻഡ് വർദ്ധന — ഇവ വെവ്വേറെ ഓണാക്കുകയോ ഓഫാക്കുകയോ ചെയ്യാം, ഒരൊറ്റ വോളിയം സ്ലൈഡറോടെ.",
    "calmH2": "അപ്രതീക്ഷിതങ്ങൾ കുറവ്",
    "calmP": "നിങ്ങളുടെ സിസ്റ്റം കുറഞ്ഞ ചലനം ആവശ്യപ്പെടുമ്പോൾ ക്ലയന്റ് അതിന്റെ ആനിമേഷനുകൾ മയപ്പെടുത്തുന്നു. ഒളിഞ്ഞുനോട്ട തടയൽ നിങ്ങൾ തൊടുന്നത് വരെ നിങ്ങളുടെ സ്വന്തം കാർഡുകൾ മറച്ചുവെക്കുന്നു, അബദ്ധ Call സംരക്ഷണം ഒരു വലിയ Raise ന് തൊട്ടുപിന്നാലെ Call ബട്ടൺ അൽപനേരം തടയുന്നു, അതിനാൽ ചെറിയ ഒരു Call നായി ഉദ്ദേശിച്ച ടാപ്പ് അബദ്ധത്തിൽ ഉയർത്തിയ തുക അടയ്ക്കില്ല.",
    "langH2": "നിങ്ങളുടെ ഭാഷയിൽ, ഒരു വഴികാട്ടിയോടൊപ്പം",
    "langP": "ഇന്റർഫേസ് {langs} ഭാഷകളിൽ ലഭ്യമാണ്, ആവശ്യമുള്ളിടത്ത് വലത്തുനിന്ന് ഇടത്തോട്ടും. വെബ് ക്ലയന്റിന്റെ ഭാഗ്യചിഹ്നമായ എയ്സിന്റെ സഹായം, നിങ്ങൾ ആഗ്രഹിക്കുന്നുവെങ്കിൽ, നിങ്ങൾ മുന്നോട്ട് പോകുമ്പോൾ ഓരോ സ്ക്രീനും വിശദീകരിക്കും, “ഇതെന്താണ്?” സ്ക്രീനിലെ ഏതൊരു കാര്യവും എന്ത് ചെയ്യുന്നുവെന്ന് പറഞ്ഞുതരും.",
    "faqH2": "ചോദ്യങ്ങൾ",
    "faq": [
      [
        "കാർഡുകളും അക്ഷരങ്ങളും വലുതാക്കാൻ കഴിയുമോ?",
        "കഴിയും. പ്രവേശനക്ഷമത വിൻഡോയിൽ വലുത് അല്ലെങ്കിൽ വളരെ വലുത് തിരഞ്ഞെടുക്കുക; ടേബിൾ ഉൾപ്പെടെ എല്ലാ സ്ക്രീനിലും കാർഡുകളും അക്ഷരങ്ങളും ബട്ടണുകളും ഒരുമിച്ച് വലുതാകും."
      ],
      [
        "ഉയർന്ന കോൺട്രാസ്റ്റ് മോഡ് ഉണ്ടോ?",
        "ഉണ്ട്, പ്രവേശനക്ഷമത വിൻഡോയിൽ. ഏത് ഇന്റർഫേസ് വലുപ്പത്തിലും അത് പ്രവർത്തിക്കും."
      ],
      [
        "മൗസോ ടച്ച് സ്ക്രീനോ ഇല്ലാതെ കളിക്കാമോ?",
        "കളിക്കാം, പൂർണ്ണമായും കീബോർഡ്, ഗെയിംപാഡ് അല്ലെങ്കിൽ Android TV റിമോട്ട് ഉപയോഗിച്ച്."
      ],
      [
        "സ്ക്രീൻ റീഡറിനൊപ്പം പ്രവർത്തിക്കുമോ?",
        "ഇതുവരെ പൂർണ്ണമായില്ല. ശബ്ദ അറിയിപ്പുകൾ ഗെയിം സംഭവങ്ങൾ ഉറക്കെ വായിക്കുന്നു, മെനുകൾക്ക് ലേബലുകളുമുണ്ട്, പക്ഷേ പോക്കർ ടേബിൾ തന്നെ ഒരു ദൃശ്യ ഇന്റർഫേസാണ്, സ്ക്രീൻ റീഡർ മാത്രം ഉപയോഗിച്ച് ഇപ്പോഴും അത് കളിക്കാനാവില്ല."
      ],
      [
        "ഇത് സൗജന്യമാണോ?",
        "അതെ. PokerTH പരസ്യങ്ങളോ ആപ്പിനുള്ളിലെ വാങ്ങലുകളോ ഇല്ലാത്ത സൗജന്യ ഓപ്പൺ സോഴ്സ് സോഫ്റ്റ്‌വെയറാണ്; എല്ലാ ചിപ്പുകളും കളിപ്പണമാണ്."
      ]
    ]
  },
  mn: {
    "title": "Хүртээмжтэй покер — том бичиг, гар, геймпад | PokerTH",
    "desc": "Үнэгүй Texas Hold’em: том бичиг, өндөр контраст, дөрвөн өнгийн хөзөр, томруулагч, дуут мэдэгдэл, гар, геймпад эсвэл ТВ-ийн удирдлагаар бүрэн тоглох боломж.",
    "ldHeadline": "Хүртээмжтэй онлайн покер: том бичиг, өндөр контраст, гар ба геймпад",
    "ldDesc": "PokerTH вэб клиентийн хүртээмжийн боломжууд: интерфейсийн хэмжээ, өндөр контраст, дөрвөн өнгийн хөзрийн багц, томруулагч, дуут мэдэгдэл, гар, геймпад болон ТВ-ийн алсын удирдлага.",
    "h1": "Хүртээмжтэй покер: өөрийнхөөрөө тоглоорой",
    "lead": "PokerTH бол хөтөч дээрх үнэгүй Texas Hold’em бөгөөд таны харах, тоглох арга барилд тохирно: илүү том бичиг ба товч, илүү хүчтэй контраст, хөзрийн дүрсийг өнгөөр нь ялгадаг багц, жижиг дэлгэцэд зориулсан томруулагч, дуут мэдэгдэл, мөн гар, геймпад эсвэл ТВ-ийн алсын удирдлагаар бүрэн удирдах боломж.",
    "findH2": "Хаанаас олох вэ",
    "findP": "Хүртээмж товч — нэвтрэх дэлгэцээс эхлээд ширээ хүртэл дэлгэц бүрийн дээд хэсэгт байх хүний дүрс — үндсэн тохиргоог хэзээ ч, тэр байтугай гарын дундуур ч нээнэ. Бусад бүх зүйл Нэмэлт тохиргоонд байна. Таны сонголтыг төхөөрөмж санах бөгөөд pokerth.net бүртгэлээр нэвтэрвэл бусад төхөөрөмж рүү тань дагаж очно.",
    "seeH2": "Ширээг харах",
    "see": [
      [
        "Интерфейсийн хэмжээ",
        "Стандарт, Том эсвэл Маш том: бичиг, хөзөр, чип, товчнууд нэвтрэх дэлгэц, лобби, ширээн дээр хамт томорч, утсан дээр ч ашиглахад тохиромжтой байхаар байрлал нь өөрчлөгдөнө."
      ],
      [
        "Өндөр контраст",
        "Цэснээс ширээ хүртэл бүх интерфейсэд илүү хүчтэй контрасттай палитр, интерфейсийн аль ч хэмжээнд."
      ],
      [
        "Дөрвөн өнгийн хөзрийн багц",
        "Дүрс бүрт өөрийн өнгө өгдөг хөзрийн багц тул хоёр улаан дүрс, эсвэл хоёр хар дүрсийг хэзээ ч зөвхөн хэлбэрээр нь ялгах шаардлагагүй. Нэмэлт тохиргоо → Хэв маяг хэсгээс нэгийг сонгоно уу."
      ],
      [
        "Ширээний томруулагч",
        "Утсан дээр ширээ хоёр дахин томорч, хуруугаар зөөгдөнө; таны ээлж ирэхэд харагдац таны суудал руу буцна. Хөтчийн чимхэж томруулахыг ч зөвшөөрч болно."
      ],
      [
        "Цайвар, бараан эсвэл автомат",
        "Клиент бүхэлдээ таны эсвэл системийн сонголтыг дагаж, нүдэнд тань тохирох загвар, хөзрийн багц, ширээний өнгөтэй."
      ]
    ],
    "keysH2": "Гар",
    "keysP": "Үйлдэл бүр өөрийн товчтой. PokerTH-ийн албан ёсны функц товчнууд ширээнд ажиллана — F1–F4 нь Fold, Check/Call, Bet/Raise болон All-In, F5 хөзрөө харуулах, F6–F8 тоглох горимууд — вэб клиент нэг үсэгт товчнуудыг нэмдэг (F, C, R, A, мөн банкны гуравны нэг, хагас эсвэл бүтэн банкинд 1, 2, 3), бүгдийг нь дахин оноож болно. Escape хамгийн дээд цонхыг хааж, Tab болон сум товчнууд лоббигийн ширээний жагсаалтаар шилжиж, Alt+S хаанаас ч тохиргоог нээнэ.",
    "padH2": "Геймпад ба ТВ-ийн алсын удирдлага",
    "padP": "Тоглоомын удирдлага — Xbox, PlayStation, Switch Pro болон ихэнх Bluetooth геймпад — тоглоомыг бүхэлд нь тоглуулна: үйлдэл бүрт товч, бооцоо тохируулах гохууд, дэлгэц, чат, цэсээр шилжих навигацийн горим. Таны ээлж ирэхэд чичирнэ. Android TV болон Google TV дээр алсын удирдлага яг адил ажиллах ба дөрвөн өнгөт товчтой удирдлагууд тэдгээрийг Fold, Check/Call, Bet/Raise болон All-In-д ашиглана.",
    "hearH2": "Тоглолтыг сонсож, мэдрэх",
    "hearP": "Дуут мэдэгдэл тоглолтын үйл явдлыг таны төхөөрөмжийн өөрийн дуу хоолойгоор, систем дэмжвэл таны хэлээр чангаар уншина. Android утсан дээр богино чичиргээ таны ээлжийг тэмдэглэнэ. Тоглоомын дуу дөрвөн бүлэгт хуваагдана — үйлдэл, чат, сүлжээний мэдэгдэл, блайндын өсөлт — тус бүрийг тусад нь асааж, унтрааж болох ба нэг дууны түвшний гулсууртай.",
    "calmH2": "Гэнэтийн зүйл бага",
    "calmP": "Систем тань хөдөлгөөнийг багасгахыг хүсвэл клиент хөдөлгөөнт дүрсээ зөөлрүүлнэ. «Харахаас хамгаалах» нь таны хөзрийг хүрэх хүртэл нууж, санамсаргүй call-аас хамгаалах нь том raise-ийн дараа Call товчийг богино хугацаанд хаадаг тул бага call хийх гэсэн хүрэлт өсгөсөн дүнг андуурч төлөхгүй.",
    "langH2": "Таны хэлээр, хөтөчтэй",
    "langP": "Интерфейс {langs} хэлээр бэлэн бөгөөд шаардлагатай үед баруунаас зүүн тийш харагдана. Тамгын тусламжаар вэб клиентийн сахиус болох тамга хүсвэл дэлгэц бүрийг явцын дунд тайлбарлаж, «Энэ юу вэ?» дэлгэц дээрх аливаа зүйл юу хийдгийг хэлж өгнө.",
    "faqH2": "Асуулт",
    "faq": [
      [
        "Хөзөр, бичгийг томруулж болох уу?",
        "Тийм. Хүртээмж цонхноос Том эсвэл Маш том-ыг сонгоно уу; хөзөр, бичиг, товчнууд ширээг оролцуулаад бүх дэлгэц дээр хамт томорно."
      ],
      [
        "Өндөр контрастын горим бий юу?",
        "Тийм, Хүртээмж цонхонд бий. Интерфейсийн бүх хэмжээнд ажиллана."
      ],
      [
        "Хулгана, мэдрэгчтэй дэлгэцгүйгээр тоглож болох уу?",
        "Тийм, бүхэлд нь гар, геймпад эсвэл Android TV-ийн алсын удирдлагаар."
      ],
      [
        "Дэлгэц уншигчтай ажилладаг уу?",
        "Одоогоор бүрэн биш. Дуут мэдэгдэл тоглолтын үйл явдлыг чангаар уншиж, цэсүүд шошготой ч покерын ширээ өөрөө харааны интерфейс тул одоохондоо зөвхөн дэлгэц уншигчаар тоглох боломжгүй."
      ],
      [
        "Үнэгүй юу?",
        "Тийм. PokerTH бол сурталчилгаагүй, програм доторх худалдан авалтгүй, үнэгүй, нээлттэй эхийн програм хангамж; бүх чип зөвхөн тоглоомын мөнгө."
      ]
    ]
  },
  mr: {
    "title": "सुलभ पोकर — मोठी अक्षरं, कीबोर्ड, गेमपॅड | PokerTH",
    "desc": "मोठी अक्षरं, उच्च कॉन्ट्रास्ट, 4-रंगी डेक, टेबल भिंग, आवाजी घोषणा आणि कीबोर्ड, गेमपॅड किंवा टीव्ही रिमोटने पूर्ण खेळ — मोफत Texas Hold’em.",
    "ldHeadline": "सुलभ ऑनलाइन पोकर: मोठी अक्षरं, उच्च कॉन्ट्रास्ट, कीबोर्ड आणि गेमपॅड",
    "ldDesc": "PokerTH वेब क्लायंटची सुलभता वैशिष्ट्यं: इंटरफेसचा आकार, उच्च कॉन्ट्रास्ट, 4-रंगी डेक, भिंग, आवाजी घोषणा, कीबोर्ड, गेमपॅड आणि टीव्ही रिमोट.",
    "h1": "सुलभ पोकर: तुमच्या पद्धतीने खेळा",
    "lead": "PokerTH हे ब्राउझरमधलं मोफत Texas Hold’em आहे, आणि ते तुम्ही कसं पाहता आणि खेळता त्यानुसार जुळवून घेतं: मोठी अक्षरं आणि बटणं, अधिक ठळक कॉन्ट्रास्ट, सूट्स रंगाने वेगळे करणारे डेक, लहान स्क्रीनसाठी भिंग, आवाजी घोषणा, आणि कीबोर्ड, गेमपॅड किंवा टीव्ही रिमोटने संपूर्ण नियंत्रण.",
    "findH2": "हे कुठे मिळेल",
    "findP": "सुलभता बटण — लॉगिन स्क्रीनपासून टेबलपर्यंत प्रत्येक स्क्रीनच्या वरच्या बाजूला असलेला व्यक्तीचा आयकॉन — मुख्य सेटिंग्ज कधीही उघडतं, अगदी हँड चालू असतानाही. बाकी सगळं प्रगत पर्यायांमध्ये आहे. तुमच्या निवडी उपकरणावर लक्षात ठेवल्या जातात, आणि तुम्ही pokerth.net खात्याने लॉगिन केल्यावर तुमच्या इतर उपकरणांवरही तुमच्यासोबत येतात.",
    "seeH2": "टेबल स्पष्ट दिसणं",
    "see": [
      [
        "इंटरफेसचा आकार",
        "सामान्य, मोठा किंवा खूप मोठा: लॉगिन स्क्रीनवर, लॉबीमध्ये आणि टेबलवर अक्षरं, कार्ड्स, चिप्स आणि बटणं एकत्र मोठी होतात, आणि फोनवरही वापरता यावं म्हणून मांडणी पुन्हा जुळवली जाते."
      ],
      [
        "उच्च कॉन्ट्रास्ट",
        "मेनूंपासून टेबलपर्यंत संपूर्ण इंटरफेसमध्ये, प्रत्येक इंटरफेस आकारात, अधिक ठळक कॉन्ट्रास्टचं रंगपॅलेट."
      ],
      [
        "4-रंगी डेक",
        "प्रत्येक सूटला स्वतःचा रंग देणारे कार्ड डेक, त्यामुळे बदाम आणि चौकट, किंवा इस्पिक आणि किलवर, कधीही फक्त आकारावरून ओळखावे लागत नाहीत. प्रगत पर्याय → शैली मध्ये एक निवडा."
      ],
      [
        "टेबल भिंग",
        "फोनवर टेबल दुप्पट आकारात झूम होतं आणि बोटाने सरकवता येतं; तुमची पाळी आली की दृश्य तुमच्या सीटकडे परत येतं. ब्राउझरचा पिंच-झूमही चालू करता येतो."
      ],
      [
        "लाइट, डार्क किंवा स्वयंचलित",
        "संपूर्ण क्लायंट तुमची किंवा तुमच्या सिस्टमची निवड पाळतो, तुमच्या डोळ्यांना सोयीच्या थीम्स, डेक आणि टेबलच्या रंगांसह."
      ]
    ],
    "keysH2": "कीबोर्ड",
    "keysP": "प्रत्येक कृतीसाठी एक की आहे. अधिकृत PokerTH फंक्शन कीज टेबलवर चालतात — Fold, Check/Call, Bet/Raise आणि All-In साठी F1 ते F4, तुमची कार्ड्स दाखवण्यासाठी F5, खेळ मोडसाठी F6 ते F8 — आणि वेब क्लायंट एकेरी अक्षरं जोडतो (F, C, R, A, आणि पॉटचा एक तृतीयांश, अर्धा पॉट किंवा पूर्ण पॉटसाठी 1, 2, 3); या सगळ्या कीज बदलता येतात. Esc सर्वात वरची विंडो बंद करतो, Tab आणि बाणांच्या कीज लॉबीतील टेबलांच्या यादीत फिरतात, आणि Alt+S कुठूनही सेटिंग्ज उघडतं.",
    "padH2": "गेमपॅड आणि टीव्ही रिमोट",
    "padP": "गेम कंट्रोलर — Xbox, PlayStation, Switch Pro आणि बहुतेक Bluetooth पॅड — संपूर्ण खेळ खेळू देतो: प्रत्येक कृतीसाठी बटणं, बेट ठरवण्यासाठी ट्रिगर्स, आणि स्क्रीन, चॅट आणि मेनूंमध्ये फिरण्यासाठी नेव्हिगेशन मोड. तुमची पाळी आली की तो व्हायब्रेट होतो. Android TV आणि Google TV वर रिमोट याच पद्धतीने चालतो, आणि चार रंगीत कीज असलेले रिमोट त्या Fold, Check/Call, Bet/Raise आणि All-In साठी वापरतात.",
    "hearH2": "खेळ ऐकणं आणि अनुभवणं",
    "hearP": "आवाजी घोषणा तुमच्या उपकरणाच्या स्वतःच्या आवाजांनी खेळातल्या घटना मोठ्याने वाचतात, सिस्टममध्ये तुमच्या भाषेचा आवाज असेल तर तुमच्या भाषेत. Android फोनवर एक लहान व्हायब्रेशन तुमची पाळी दर्शवतं. खेळाचे आवाज चार गटांत आहेत — कृती, चॅट, नेटवर्क सूचना आणि ब्लाइंड्सची वाढ — जे वेगवेगळे चालू किंवा बंद करता येतात, एकाच व्हॉल्यूम स्लायडरसह.",
    "calmH2": "कमी अनपेक्षित धक्के",
    "calmP": "तुमची सिस्टम कमी हालचाल मागते तेव्हा क्लायंट आपले ॲनिमेशन सौम्य करतो. डोकावण्यापासून संरक्षण तुम्ही टॅप करेपर्यंत तुमची स्वतःची कार्ड्स लपवून ठेवतं, आणि चुकीच्या Call पासून संरक्षण मोठ्या Raise नंतर लगेच Call बटण थोड्या वेळासाठी ब्लॉक करतं, जेणेकरून लहान Call साठी केलेला टॅप चुकून वाढवलेली रक्कम भरू शकत नाही.",
    "langH2": "तुमच्या भाषेत, मार्गदर्शकासह",
    "langP": "इंटरफेस {langs} भाषांमध्ये उपलब्ध आहे, गरज असेल तिथे उजवीकडून डावीकडे. एक्क्याची मदत — वेब क्लायंटचा शुभंकर एक्का — तुम्हाला हवं असल्यास तुम्ही पुढे जाल तसं प्रत्येक स्क्रीन समजावून सांगतो, आणि “हे काय आहे?” स्क्रीनवरची कोणतीही गोष्ट काय करते ते सांगतं.",
    "faqH2": "प्रश्न",
    "faq": [
      [
        "कार्ड्स आणि अक्षरं मोठी करता येतात का?",
        "हो. सुलभता विंडोमध्ये मोठा किंवा खूप मोठा निवडा; टेबलसह प्रत्येक स्क्रीनवर कार्ड्स, अक्षरं आणि बटणं एकत्र मोठी होतात."
      ],
      [
        "उच्च कॉन्ट्रास्ट मोड आहे का?",
        "हो, सुलभता विंडोमध्ये. तो प्रत्येक इंटरफेस आकारासोबत चालतो."
      ],
      [
        "माउस किंवा टच स्क्रीनशिवाय खेळता येतं का?",
        "हो, पूर्णपणे कीबोर्डने, गेमपॅडने किंवा Android TV रिमोटने."
      ],
      [
        "स्क्रीन रीडरसोबत चालतं का?",
        "अजून पूर्णपणे नाही. आवाजी घोषणा खेळातल्या घटना मोठ्याने वाचतात आणि मेनूंना लेबल्स आहेत, पण पोकर टेबल स्वतः एक दृश्य इंटरफेस आहे आणि ते अजून फक्त स्क्रीन रीडरने खेळता येत नाही."
      ],
      [
        "हे मोफत आहे का?",
        "हो. PokerTH हे मोफत आणि ओपन-सोर्स सॉफ्टवेअर आहे; जाहिराती नाहीत आणि ॲपमधील खरेदी नाही; सर्व चिप्स फक्त खेळातले पैसे आहेत."
      ]
    ]
  },
  ms: {
    "title": "Poker Mesra OKU — Teks Besar, Papan Kekunci, Gamepad | PokerTH",
    "desc": "Texas Hold’em percuma: teks lebih besar, kontras tinggi, dek empat warna, kaca pembesar, pengumuman suara, dan main dengan papan kekunci, gamepad atau alat kawalan TV.",
    "ldHeadline": "Poker dalam talian mesra OKU: teks besar, kontras tinggi, papan kekunci dan gamepad",
    "ldDesc": "Ciri Aksesibilitas klien web PokerTH: ukuran antarmuka, kontras tinggi, dek empat warna, kaca pembesar, pengumuman suara, papan kekunci, gamepad dan alat kawalan jauh TV.",
    "h1": "Poker mesra OKU: main mengikut cara anda",
    "lead": "PokerTH ialah Texas Hold’em percuma dalam pelayar, dan ia menyesuaikan diri dengan cara anda melihat dan bermain: teks dan butang lebih besar, kontras lebih kuat, dek yang membezakan jenis kad dengan warna, kaca pembesar untuk skrin kecil, pengumuman suara, dan kawalan penuh daripada papan kekunci, gamepad atau alat kawalan jauh TV.",
    "findH2": "Di mana untuk mencarinya",
    "findP": "Butang Aksesibilitas — ikon orang di bahagian atas setiap skrin, dari skrin log masuk hingga ke meja — membuka tetapan utama pada bila-bila masa, malah di tengah-tengah satu pusingan. Selebihnya ada dalam Opsi lanjutan. Pilihan anda diingati pada peranti dan, apabila anda log masuk dengan akaun pokerth.net, ia mengikut anda ke peranti anda yang lain.",
    "seeH2": "Melihat meja dengan jelas",
    "see": [
      [
        "Ukuran antarmuka",
        "Standar, Besar atau Sangat besar: teks, kad, cip dan butang membesar bersama, pada skrin log masuk, di lobi dan di meja, dan susun atur menyesuaikan diri supaya tetap mudah digunakan pada telefon."
      ],
      [
        "Kontras tinggi",
        "Palet dengan kontras lebih kuat di seluruh antarmuka, dari menu hingga ke meja, pada setiap ukuran antarmuka."
      ],
      [
        "Dek empat warna",
        "Dek kad yang memberi setiap jenis kad warnanya sendiri, supaya hati dan wajik, atau sped dan kelawar, tidak pernah dibezakan melalui bentuk sahaja. Pilih satu dalam Opsi lanjutan → Gaya."
      ],
      [
        "Kaca pembesar meja",
        "Pada telefon, meja dibesarkan dua kali ganda dan boleh dianjak dengan jari; paparan kembali ke tempat duduk anda apabila tiba giliran anda. Zum cubit pelayar juga boleh dibenarkan."
      ],
      [
        "Cerah, gelap atau automatik",
        "Seluruh klien mengikut pilihan anda atau pilihan sistem anda, dengan tema, dek dan warna meja yang selesa untuk mata anda."
      ]
    ],
    "keysH2": "Papan kekunci",
    "keysP": "Setiap tindakan ada kekuncinya. Kekunci fungsi rasmi PokerTH berfungsi di meja — F1 hingga F4 untuk Fold, Check/Call, Bet/Raise dan All-In, F5 untuk menunjukkan kad anda, F6 hingga F8 untuk mod permainan — dan klien web menambah huruf tunggal (F, C, R, A, serta 1, 2, 3 untuk satu pertiga pot, separuh pot atau satu pot), yang semuanya boleh ditetapkan semula. Escape menutup tetingkap teratas, Tab dan kekunci anak panah bergerak melalui senarai meja di lobi, dan Alt+S membuka tetapan dari mana-mana sahaja.",
    "padH2": "Gamepad dan alat kawalan jauh TV",
    "padP": "Pengawal permainan — Xbox, PlayStation, Switch Pro dan kebanyakan pad Bluetooth — boleh memainkan seluruh permainan: butang untuk setiap tindakan, picu untuk menetapkan taruhan, dan mod navigasi untuk bergerak melalui skrin, sembang dan menu. Ia bergetar apabila tiba giliran anda. Pada Android TV dan Google TV, alat kawalan jauh berfungsi dengan cara yang sama, dan alat kawalan jauh yang mempunyai empat kekunci warna menggunakannya untuk Fold, Check/Call, Bet/Raise dan All-In.",
    "hearH2": "Mendengar dan merasai permainan",
    "hearP": "Pengumuman suara membacakan peristiwa permainan dengan suara peranti anda sendiri, dalam bahasa anda jika sistem menyediakannya. Pada telefon Android, getaran pendek menandakan giliran anda. Bunyi permainan terbahagi kepada empat kumpulan — tindakan, sembang, notis rangkaian dan kenaikan blind — yang boleh dihidupkan atau dimatikan secara berasingan, dengan satu peluncur kelantangan.",
    "calmH2": "Kurang kejutan",
    "calmP": "Apabila sistem anda meminta gerakan dikurangkan, klien mengurangkan animasinya. Anti-intip menyembunyikan kad anda sendiri sehingga anda mengetuknya, dan penjaga call tak sengaja menyekat butang Call seketika sejurus selepas raise besar, supaya ketukan untuk call yang lebih kecil tidak tersilap membayar jumlah yang dinaikkan.",
    "langH2": "Dalam bahasa anda, dengan pemandu",
    "langP": "Antarmuka tersedia dalam {langs} bahasa, dari kanan ke kiri apabila perlu. Bantuan si Sat — si Sat ialah maskot klien web — menerangkan setiap skrin sambil anda bermain jika anda mahu, dan “Apakah ini?” memberitahu anda fungsi apa sahaja pada skrin.",
    "faqH2": "Soalan",
    "faq": [
      [
        "Bolehkah saya membesarkan kad dan teks?",
        "Ya. Pilih Besar atau Sangat besar dalam tetingkap Aksesibilitas; kad, teks dan butang membesar bersama pada setiap skrin, termasuk meja."
      ],
      [
        "Adakah mod kontras tinggi?",
        "Ya, dalam tetingkap Aksesibilitas. Ia berfungsi dengan setiap ukuran antarmuka."
      ],
      [
        "Bolehkah saya bermain tanpa tetikus atau skrin sentuh?",
        "Ya, sepenuhnya dengan papan kekunci, gamepad atau alat kawalan jauh Android TV."
      ],
      [
        "Adakah ia berfungsi dengan pembaca skrin?",
        "Belum sepenuhnya. Pengumuman suara membacakan peristiwa permainan dan menu mempunyai label, tetapi meja poker itu sendiri ialah antarmuka visual dan belum boleh dimainkan dengan pembaca skrin sahaja."
      ],
      [
        "Adakah ia percuma?",
        "Ya. PokerTH ialah perisian percuma dan sumber terbuka, tanpa iklan dan tanpa pembelian dalam aplikasi; semua cip hanyalah wang permainan."
      ]
    ]
  },
  my: {
    "title": "အသုံးပြုရလွယ်ကူသော ပိုကာ — စာလုံးကြီး၊ ကီးဘုတ်၊ ဂိမ်းပက်ဒ် | PokerTH",
    "desc": "အခမဲ့ Texas Hold’em — စာလုံးကြီး၊ အရောင်ခြားနားမှု မြင့်၊ အရောင် ၄ မျိုး ဖဲထုပ်၊ မှန်ဘီလူး၊ အသံထွက်ကြေညာချက်၊ ကီးဘုတ်၊ ဂိမ်းပက်ဒ်၊ တီဗီ အဝေးထိန်း။",
    "ldHeadline": "အသုံးပြုရလွယ်ကူသော အွန်လိုင်း ပိုကာ: စာလုံးကြီး၊ အရောင်ခြားနားမှု မြင့်၊ ကီးဘုတ်နှင့် ဂိမ်းပက်ဒ်",
    "ldDesc": "PokerTH ဝဘ်ကလိုင်းယင့်၏ အသုံးပြုရလွယ်ကူမှု လုပ်ဆောင်ချက်များ: မျက်နှာပြင် အရွယ်အစား၊ အရောင်ခြားနားမှု မြင့်၊ အရောင် ၄ မျိုး ဖဲထုပ်များ၊ မှန်ဘီလူး၊ အသံထွက်ကြေညာချက်များ၊ ကီးဘုတ်၊ ဂိမ်းပက်ဒ်နှင့် တီဗီ အဝေးထိန်း။",
    "h1": "အသုံးပြုရလွယ်ကူသော ပိုကာ: သင့်နည်းဖြင့် ကစားပါ",
    "lead": "PokerTH သည် ဘရောက်ဇာထဲတွင် ကစားနိုင်သော အခမဲ့ Texas Hold’em ဖြစ်ပြီး သင် မြင်ပုံနှင့် ကစားပုံအတိုင်း လိုက်လျောညီထွေ ပြောင်းလဲပေးသည်: ပိုကြီးသော စာသားနှင့် ခလုတ်များ၊ ပိုပြင်းသော အရောင်ခြားနားမှု၊ အပွင့်များကို အရောင်ဖြင့် ခွဲခြားပေးသော ဖဲထုပ်များ၊ မျက်နှာပြင်ငယ်များအတွက် မှန်ဘီလူး၊ အသံထွက်ကြေညာချက်များနှင့် ကီးဘုတ်၊ ဂိမ်းပက်ဒ် သို့မဟုတ် တီဗီ အဝေးထိန်းဖြင့် အပြည့်အဝ ထိန်းချုပ်နိုင်မှု။",
    "findH2": "ဘယ်မှာ ရှာရမလဲ",
    "findP": "အသုံးပြုရလွယ်ကူမှု ခလုတ် — ဝင်ရောက်ရေးမျက်နှာပြင်မှ စားပွဲအထိ မျက်နှာပြင်တိုင်း၏ ထိပ်ရှိ လူပုံသင်္ကေတ — သည် ပင်မဆက်တင်များကို မည်သည့်အချိန်မဆို ဖွင့်ပေးသည်၊ လက်တစ်ပွဲ ကစားနေစဉ် အလယ်တွင်ပင်။ ကျန်အရာအားလုံး အဆင့်မြင့် ရွေးချယ်စရာများတွင် ရှိသည်။ သင့်ရွေးချယ်မှုများကို စက်ပေါ်တွင် မှတ်ထားပြီး pokerth.net အကောင့်ဖြင့် ဝင်ရောက်သည့်အခါ သင့်အခြားစက်များသို့လည်း လိုက်ပါသွားသည်။",
    "seeH2": "စားပွဲကို မြင်ခြင်း",
    "see": [
      [
        "မျက်နှာပြင် အရွယ်အစား",
        "စံ၊ ကြီး သို့မဟုတ် အလွန်ကြီး: စာသား၊ ဖဲများ၊ ချစ်ပ်များနှင့် ခလုတ်များသည် ဝင်ရောက်ရေးမျက်နှာပြင်၊ လော်ဘီနှင့် စားပွဲတွင် အတူတကွ ကြီးလာပြီး ဖုန်းပေါ်တွင် အသုံးပြုရလွယ်ကူစေရန် အပြင်အဆင်ကို ပြန်စီပေးသည်။"
      ],
      [
        "အရောင်ခြားနားမှု မြင့်",
        "မီနူးများမှ စားပွဲအထိ မျက်နှာပြင်တစ်ခုလုံးတွင် ပိုပြင်းသော အရောင်ခြားနားမှုရှိသည့် အရောင်တွဲ၊ မျက်နှာပြင် အရွယ်အစားတိုင်းတွင်။"
      ],
      [
        "အရောင် ၄ မျိုး ဖဲထုပ်များ",
        "အပွင့်တစ်ခုစီကို ကိုယ်ပိုင်အရောင် ပေးထားသော ဖဲထုပ်များ ဖြစ်၍ ဟတ် ♥ နှင့် ဒိုင်းမွန် ♦၊ သို့မဟုတ် စပိတ် ♠ နှင့် ကလပ် ♣ ကို ပုံသဏ္ဌာန်တစ်ခုတည်းဖြင့် ဘယ်တော့မှ ခွဲခြားရန် မလိုပါ။ အဆင့်မြင့် ရွေးချယ်စရာများ → စတိုင် တွင် တစ်ခု ရွေးပါ။"
      ],
      [
        "စားပွဲ မှန်ဘီလူး",
        "ဖုန်းပေါ်တွင် စားပွဲကို နှစ်ဆ ချဲ့ပြီး လက်ချောင်းဖြင့် ရွှေ့နိုင်သည်; သင့်အလှည့်ရောက်သောအခါ မြင်ကွင်းသည် သင့်ထိုင်ခုံသို့ ပြန်လာသည်။ ဘရောက်ဇာ၏ လက်နှစ်ချောင်းဖြင့် ချဲ့ခြင်းကိုလည်း ခွင့်ပြုနိုင်သည်။"
      ],
      [
        "အလင်း၊ အမှောင် သို့မဟုတ် အလိုအလျောက်",
        "ကလိုင်းယင့်တစ်ခုလုံးသည် သင့်ရွေးချယ်မှု သို့မဟုတ် သင့်စနစ်၏ ရွေးချယ်မှုအတိုင်း လိုက်ပြီး သင့်မျက်စိနှင့် ကိုက်ညီသော သင်မ်များ၊ ဖဲထုပ်များနှင့် စားပွဲအရောင်များ ပါရှိသည်။"
      ]
    ],
    "keysH2": "ကီးဘုတ်",
    "keysP": "လုပ်ဆောင်ချက်တိုင်းတွင် ခလုတ်တစ်ခု ရှိသည်။ တရားဝင် PokerTH function ခလုတ်များသည် စားပွဲတွင် အလုပ်လုပ်သည် — Fold, Check/Call, Bet/Raise နှင့် All-In အတွက် F1 မှ F4၊ သင့်ဖဲများကို ပြရန် F5၊ ကစားပုံစံများအတွက် F6 မှ F8 — ဝဘ်ကလိုင်းယင့်က စာလုံးတစ်လုံးတည်း ခလုတ်များ ထပ်ထည့်ပေးသည် (F, C, R, A နှင့် ပေါ့တ်၏ သုံးပုံတစ်ပုံ၊ ပေါ့တ်တစ်ဝက် သို့မဟုတ် ပေါ့တ်အပြည့်အတွက် 1, 2, 3)၊ ၎င်းတို့အားလုံးကို ပြန်လည်သတ်မှတ်နိုင်သည်။ Escape သည် အပေါ်ဆုံးဝင်းဒိုးကို ပိတ်သည်၊ Tab နှင့် မြှားခလုတ်များသည် လော်ဘီ၏ စားပွဲစာရင်းအတွင်း ရွှေ့ပေးပြီး Alt+S သည် မည်သည့်နေရာမှမဆို ဆက်တင်များကို ဖွင့်ပေးသည်။",
    "padH2": "ဂိမ်းပက်ဒ်နှင့် တီဗီ အဝေးထိန်း",
    "padP": "ဂိမ်းထိန်းချုပ်ကိရိယာ — Xbox, PlayStation, Switch Pro နှင့် Bluetooth ပက်ဒ်အများစု — ဖြင့် ဂိမ်းတစ်ခုလုံး ကစားနိုင်သည်: လုပ်ဆောင်ချက်တိုင်းအတွက် ခလုတ်များ၊ လောင်းကြေး သတ်မှတ်ရန် trigger များနှင့် မျက်နှာပြင်များ၊ ချတ်နှင့် မီနူးများအတွင်း ရွှေ့ရန် လမ်းညွှန်မုဒ်။ သင့်အလှည့်ရောက်သောအခါ တုန်ခါသည်။ Android TV နှင့် Google TV တွင် အဝေးထိန်းသည် ထိုနည်းအတိုင်း အလုပ်လုပ်ပြီး အရောင်ခလုတ် လေးခုပါသော အဝေးထိန်းများသည် ၎င်းတို့ကို Fold, Check/Call, Bet/Raise နှင့် All-In အတွက် အသုံးပြုသည်။",
    "hearH2": "ဂိမ်းကို ကြားခြင်းနှင့် ခံစားခြင်း",
    "hearP": "အသံထွက်ကြေညာချက်များသည် ဂိမ်းဖြစ်ရပ်များကို သင့်စက်၏ ကိုယ်ပိုင်အသံများဖြင့် အသံထွက် ဖတ်ပြပြီး စနစ်တွင် သင့်ဘာသာစကား အသံရှိလျှင် သင့်ဘာသာစကားဖြင့် ဖတ်သည်။ Android ဖုန်းများတွင် တုန်ခါမှုတိုတစ်ခုက သင့်အလှည့်ကို အမှတ်အသားပြုသည်။ ဂိမ်းအသံများကို အုပ်စု လေးခု — လုပ်ဆောင်ချက်များ၊ ချတ်၊ ကွန်ရက် အသိပေးချက်များနှင့် ဘလိုင်း မြှင့်ခြင်း — ခွဲထားပြီး တစ်ခုချင်း ဖွင့်ပိတ်နိုင်ကာ အသံအတိုးအကျယ် ဆလိုက်ဒါ တစ်ခုတည်း ရှိသည်။",
    "calmH2": "အံ့အားသင့်စရာ နည်းစေရန်",
    "calmP": "သင့်စနစ်က လှုပ်ရှားမှု လျှော့ချရန် တောင်းဆိုသည့်အခါ ကလိုင်းယင့်သည် ၎င်း၏ လှုပ်ရှားသက်ဝင်ပုံများကို လျှော့ပေးသည်။ ခိုးကြည့်ကာကွယ်ရေးသည် သင် မနှိပ်မချင်း သင့်ကိုယ်ပိုင်ဖဲများကို ဝှက်ထားပြီး မတော်တဆ call ကာကွယ်ရေးသည် raise အကြီးတစ်ခုအပြီး ချက်ချင်း Call ခလုတ်ကို ခဏ ပိတ်ထားသဖြင့် ပိုသေးသော call အတွက် ရည်ရွယ်သော နှိပ်ချက်က တိုးထားသော ပမာဏကို မတော်တဆ မပေးမိနိုင်ပါ။",
    "langH2": "သင့်ဘာသာစကားဖြင့်၊ လမ်းပြနှင့်အတူ",
    "langP": "မျက်နှာပြင်ကို ဘာသာစကား {langs} မျိုးဖြင့် ရရှိနိုင်ပြီး လိုအပ်သည့်နေရာတွင် ညာမှဘယ်သို့ ပြသည်။ ဝဘ်ကလိုင်းယင့်၏ မက်စကော့ဖြစ်သော တစ်ကွက်၏ အကူအညီသည် သင် လိုလျှင် မျက်နှာပြင်တိုင်းကို သွားရင်းလာရင်း ရှင်းပြပေးပြီး “ဒါဘာလဲ။” က မျက်နှာပြင်ပေါ်ရှိ မည်သည့်အရာမဆို ဘာလုပ်သည်ကို ပြောပြသည်။",
    "faqH2": "မေးခွန်းများ",
    "faq": [
      [
        "ဖဲများနှင့် စာသားကို ပိုကြီးအောင် လုပ်နိုင်သလား။",
        "လုပ်နိုင်ပါသည်။ အသုံးပြုရလွယ်ကူမှု ဝင်းဒိုးတွင် ကြီး သို့မဟုတ် အလွန်ကြီး ကို ရွေးပါ; ဖဲများ၊ စာသားနှင့် ခလုတ်များသည် စားပွဲအပါအဝင် မျက်နှာပြင်တိုင်းတွင် အတူတကွ ကြီးလာသည်။"
      ],
      [
        "အရောင်ခြားနားမှု မြင့် မုဒ် ရှိသလား။",
        "ရှိပါသည်၊ အသုံးပြုရလွယ်ကူမှု ဝင်းဒိုးတွင်။ မျက်နှာပြင် အရွယ်အစားတိုင်းနှင့် အလုပ်လုပ်သည်။"
      ],
      [
        "မောက်စ် သို့မဟုတ် ထိတွေ့မျက်နှာပြင် မပါဘဲ ကစားနိုင်သလား။",
        "ကစားနိုင်ပါသည်၊ ကီးဘုတ်၊ ဂိမ်းပက်ဒ် သို့မဟုတ် Android TV အဝေးထိန်းဖြင့် လုံးဝ ကစားနိုင်သည်။"
      ],
      [
        "မျက်နှာပြင်ဖတ်စနစ် (screen reader) ဖြင့် အလုပ်လုပ်သလား။",
        "အပြည့်အဝ မလုပ်သေးပါ။ အသံထွက်ကြေညာချက်များသည် ဂိမ်းဖြစ်ရပ်များကို အသံထွက် ဖတ်ပြပြီး မီနူးများတွင် တံဆိပ်များ ပါရှိသော်လည်း ပိုကာစားပွဲကိုယ်တိုင်မှာ မြင်ကွင်းအခြေပြု မျက်နှာပြင် ဖြစ်သဖြင့် မျက်နှာပြင်ဖတ်စနစ် တစ်ခုတည်းဖြင့် မကစားနိုင်သေးပါ။"
      ],
      [
        "အခမဲ့လား။",
        "ဟုတ်ပါသည်။ PokerTH သည် ကြော်ငြာမပါ၊ အက်ပ်အတွင်း ဝယ်ယူမှုမရှိသော အခမဲ့ ရင်းမြစ်ဖွင့် ဆော့ဖ်ဝဲ ဖြစ်သည်; ချစ်ပ်အားလုံးသည် ကစားငွေသာ ဖြစ်သည်။"
      ]
    ]
  },
  nb: {
    "title": "Tilgjengelig poker — stor tekst, tastatur, kontroller | PokerTH",
    "desc": "Gratis Texas Hold’em med større tekst, høy kontrast, 4-fargers kortstokker, bordlupe, stemmeannonseringer og full styring med tastatur, kontroller og TV-fjernkontroll.",
    "ldHeadline": "Tilgjengelig nettpoker: stor tekst, høy kontrast, tastatur og spillkontroller",
    "ldDesc": "Tilgjengelighetsfunksjonene i PokerTH-webklienten: grensesnittstørrelse, høy kontrast, 4-fargers kortstokker, lupe, stemmeannonseringer, tastatur, spillkontroller og TV-fjernkontroll.",
    "h1": "Tilgjengelig poker: spill på din måte",
    "lead": "PokerTH er gratis Texas Hold’em i nettleseren, og det tilpasser seg måten du ser og spiller på: større tekst og knapper, sterkere kontrast, kortstokker som skiller hjerter, ruter, spar og kløver med egne farger, en lupe for små skjermer, stemmeannonseringer og full styring fra tastatur, spillkontroller eller TV-fjernkontroll.",
    "findH2": "Hvor du finner det",
    "findP": "Tilgjengelighet-knappen — personikonet øverst på hver skjerm, fra innloggingsskjermen til bordet — åpner hovedinnstillingene når som helst, også midt i en hånd. Alt annet finnes under Avanserte alternativer. Valgene dine huskes på enheten og følger deg til de andre enhetene dine når du logger inn med en pokerth.net-konto.",
    "seeH2": "Se bordet",
    "see": [
      [
        "Grensesnittstørrelse",
        "Standard, Stor eller Ekstra stor: tekst, kort, sjetonger og knapper vokser sammen — på innloggingsskjermen, i lobbyen og ved bordet — og oppsettet tilpasser seg slik at det fortsatt er lett å bruke på mobil."
      ],
      [
        "Høy kontrast",
        "En palett med sterkere kontrast i hele grensesnittet, fra menyene til bordet, i alle grensesnittstørrelser."
      ],
      [
        "4-fargers kortstokker",
        "Kortstokker som gir hver kortfarge sin egen farge, slik at hjerter og ruter, eller spar og kløver, aldri må skilles bare på formen. Velg en under Avanserte alternativer → Stil."
      ],
      [
        "Bordlupe",
        "På mobil zoomer bordet til dobbel størrelse og kan flyttes med en finger; visningen går tilbake til plassen din når det er din tur. Nettleserens knipezoom kan også tillates."
      ],
      [
        "Lys, mørk eller automatisk",
        "Hele klienten følger ditt valg eller systemets, med temaer, kortstokker og bordfarger som passer øynene dine."
      ]
    ],
    "keysH2": "Tastatur",
    "keysP": "Hver handling har en tast. De offisielle PokerTH-funksjonstastene virker ved bordet — F1 til F4 for Fold, Check/Call, Bet/Raise og All-In, F5 for å vise kortene dine, F6 til F8 for spillmodusene — og webklienten legger til enkeltbokstaver (F, C, R, A, og 1, 2, 3 for en tredjedel av potten, halve potten eller hele potten), som alle kan tilordnes på nytt. Escape lukker det øverste vinduet, Tab og piltastene flytter deg gjennom bordlisten i lobbyen, og Alt+S åpner innstillingene fra hvor som helst.",
    "padH2": "Spillkontroller og TV-fjernkontroll",
    "padP": "En spillkontroller — Xbox, PlayStation, Switch Pro og de fleste Bluetooth-kontrollere — styrer hele spillet: knapper for hver handling, avtrekkere for å stille inn innsatsen, og en navigasjonsmodus for å bevege seg gjennom skjermene, chatten og menyene. Den vibrerer når det blir din tur. På Android TV og Google TV fungerer fjernkontrollen på samme måte, og fjernkontroller med de fire fargetastene bruker dem til Fold, Check/Call, Bet/Raise og All-In.",
    "hearH2": "Hør og kjenn spillet",
    "hearP": "Stemmeannonseringer leser spillhendelsene høyt med enhetens egne stemmer, på ditt språk der systemet har en slik stemme. På Android-telefoner markerer en kort vibrasjon turen din. Spillydene er delt i fire grupper — handlinger, chat, nettverksvarsler og blindhøyninger — som kan slås på og av hver for seg, med én volumglidebryter.",
    "calmH2": "Færre overraskelser",
    "calmP": "Når systemet ditt ber om redusert bevegelse, demper klienten animasjonene sine. Kikkebeskyttelsen holder dine egne kort skjult til du trykker på dem, og vernet mot utilsiktet Call låser Call-knappen et øyeblikk rett etter en stor høyning, slik at et trykk ment for en mindre Call ikke ved et uhell betaler det høynede beløpet.",
    "langH2": "På ditt språk, med en guide",
    "langP": "Grensesnittet finnes på {langs} språk, fra høyre mot venstre der det trengs. Med Essets hjelp forklarer esset, webklientens maskot, hver skjerm underveis hvis du vil, og «Hva er dette?» forteller deg hva alt på skjermen gjør.",
    "faqH2": "Spørsmål",
    "faq": [
      [
        "Kan jeg gjøre kortene og teksten større?",
        "Ja. Velg Stor eller Ekstra stor i Tilgjengelighet-vinduet; kort, tekst og knapper vokser sammen på alle skjermer, også ved bordet."
      ],
      [
        "Finnes det en modus med høy kontrast?",
        "Ja, i Tilgjengelighet-vinduet. Den fungerer med alle grensesnittstørrelser."
      ],
      [
        "Kan jeg spille uten mus eller berøringsskjerm?",
        "Ja, helt med tastaturet, med en spillkontroller eller med en Android TV-fjernkontroll."
      ],
      [
        "Fungerer det med skjermleser?",
        "Ikke fullt ut ennå. Stemmeannonseringer leser spillhendelsene høyt og menyene har etiketter, men selve pokerbordet er et visuelt grensesnitt og kan ennå ikke spilles med bare en skjermleser."
      ],
      [
        "Er det gratis?",
        "Ja. PokerTH er gratis programvare med åpen kildekode, uten reklame og uten kjøp i appen; alle sjetongene er lekepenger."
      ]
    ]
  },
  ne: {
    "title": "पहुँचयोग्य पोकर — ठूलो अक्षर, किबोर्ड, गेमप्याड | PokerTH",
    "desc": "ठूलो अक्षर, उच्च कन्ट्रास्ट, ४ रङका डेक, टेबल म्याग्निफायर, आवाज घोषणा र किबोर्ड, गेमप्याड तथा टिभी रिमोटबाट पूरा नियन्त्रणसहित निःशुल्क Texas Hold’em।",
    "ldHeadline": "पहुँचयोग्य अनलाइन पोकर: ठूलो अक्षर, उच्च कन्ट्रास्ट, किबोर्ड र गेमप्याड",
    "ldDesc": "PokerTH वेब क्लाइन्टका पहुँचयोग्यता सुविधाहरू: इन्टरफेसको आकार, उच्च कन्ट्रास्ट, ४ रङका डेक, म्याग्निफायर, आवाज घोषणा, किबोर्ड, गेमप्याड र टिभी रिमोट।",
    "h1": "पहुँचयोग्य पोकर: आफ्नै तरिकाले खेल्नुहोस्",
    "lead": "PokerTH ब्राउजरमा खेलिने निःशुल्क Texas Hold’em हो, र यो तपाईं जसरी हेर्नुहुन्छ र खेल्नुहुन्छ त्यसैअनुसार मिल्छ: ठूला अक्षर र बटन, बलियो कन्ट्रास्ट, रङले सुट छुट्याउने डेक, साना स्क्रिनका लागि म्याग्निफायर, आवाज घोषणा, र किबोर्ड, गेमप्याड वा टिभी रिमोटबाट पूरा नियन्त्रण।",
    "findH2": "कहाँ भेट्ने",
    "findP": "पहुँचयोग्यता बटन — लगइन स्क्रिनदेखि टेबलसम्म हरेक स्क्रिनको माथि रहेको व्यक्तिको आइकन — ले जुनसुकै बेला, ह्यान्डको बीचमा पनि, मुख्य सेटिङहरू खोल्छ। बाँकी सबै उन्नत विकल्पहरूमा छ। तपाईंका छनोटहरू उपकरणमा सम्झिइन्छन् र pokerth.net खाताबाट लगइन गर्दा तपाईंका अन्य उपकरणहरूमा पनि साथै जान्छन्।",
    "seeH2": "टेबल राम्ररी हेर्ने",
    "see": [
      [
        "इन्टरफेसको आकार",
        "मानक, ठूलो वा धेरै ठूलो: अक्षर, कार्ड, चिप र बटन सँगै ठूला हुन्छन् — लगइन स्क्रिनमा, लबीमा र टेबलमा — र फोनमा पनि प्रयोग गर्न सजिलो रहन लेआउट आफैँ मिलिन्छ।"
      ],
      [
        "उच्च कन्ट्रास्ट",
        "मेनुदेखि टेबलसम्म सम्पूर्ण इन्टरफेसमा बलियो कन्ट्रास्टको रङ प्यालेट, इन्टरफेसको हरेक आकारमा।"
      ],
      [
        "४ रङका डेक",
        "हरेक सुटलाई आफ्नै रङ दिने कार्ड डेक, जसले गर्दा हार्ट र डायमन्ड, वा स्पेड र क्लबलाई आकारले मात्र छुट्याउनु पर्दैन। उन्नत विकल्पहरू → शैलीमा एउटा छान्नुहोस्।"
      ],
      [
        "टेबल म्याग्निफायर",
        "फोनमा टेबल दोब्बर ठूलो हुन्छ र औंलाले सार्न सकिन्छ; तपाईंको पालो आउँदा दृश्य तपाईंको सिटमा फर्कन्छ। ब्राउजरको चिम्टी-जुम पनि अनुमति दिन सकिन्छ।"
      ],
      [
        "उज्यालो, गाढा वा स्वचालित",
        "सम्पूर्ण क्लाइन्टले तपाईंको वा तपाईंको प्रणालीको छनोट पछ्याउँछ, आँखालाई सुहाउने थिम, डेक र टेबलका रङसहित।"
      ]
    ],
    "keysH2": "किबोर्ड",
    "keysP": "हरेक चालको एउटा की छ। आधिकारिक PokerTH फङ्सन कीहरू टेबलमा चल्छन् — Fold, Check/Call, Bet/Raise र All-In का लागि F1 देखि F4, आफ्ना कार्ड देखाउन F5, खेल मोडका लागि F6 देखि F8 — र वेब क्लाइन्टले एकल अक्षरहरू थप्छ (F, C, R, A, अनि पोटको एक तिहाइ, आधा पोट वा पूरा पोटका लागि 1, 2, 3), जुन सबै फेरि तोक्न सकिन्छ। Escape ले सबैभन्दा माथिको झ्याल बन्द गर्छ, Tab र एरो कीहरूले लबीको टेबल सूचीमा सार्छन्, र Alt+S ले जहाँबाट पनि सेटिङ खोल्छ।",
    "padH2": "गेमप्याड र टिभी रिमोट",
    "padP": "गेम कन्ट्रोलर — Xbox, PlayStation, Switch Pro र अधिकांश Bluetooth प्याड — बाट पूरा खेल खेल्न सकिन्छ: हरेक चालका लागि बटन, बाजी मिलाउन ट्रिगर, र स्क्रिन, च्याट र मेनुहरूमा घुम्न नेभिगेसन मोड। तपाईंको पालो आउँदा यो कम्पन हुन्छ। Android TV र Google TV मा रिमोटले पनि यसरी नै काम गर्छ, र चार रङका की भएका रिमोटले तिनलाई Fold, Check/Call, Bet/Raise र All-In का लागि प्रयोग गर्छन्।",
    "hearH2": "खेल सुन्ने र महसुस गर्ने",
    "hearP": "आवाज घोषणाले तपाईंको उपकरणकै आवाजमा खेलका घटनाहरू ठूलो स्वरमा पढ्छ, प्रणालीमा तपाईंको भाषाको आवाज भए त्यही भाषामा। Android फोनमा छोटो कम्पनले तपाईंको पालो जनाउँछ। खेलका आवाजहरू चार समूहमा छन् — चाल, च्याट, नेटवर्क सूचना र ब्लाइन्ड वृद्धि — जसलाई छुट्टाछुट्टै खोल्न वा बन्द गर्न सकिन्छ, एउटै भोल्युम स्लाइडरसहित।",
    "calmH2": "कम आश्चर्य",
    "calmP": "तपाईंको प्रणालीले कम गति माग्दा क्लाइन्टले आफ्ना एनिमेसन घटाउँछ। Anti-peek ले तपाईंका कार्ड तपाईंले नछोएसम्म लुकाएर राख्छ, र गल्तीको call बाट सुरक्षाले ठूलो raise लगत्तै केही बेर Call बटन रोक्छ, ताकि सानो call का लागि गरिएको छुवाइले गल्तीले बढेको रकम तिर्न नसकोस्।",
    "langH2": "तपाईंको भाषामा, मार्गदर्शकसहित",
    "langP": "इन्टरफेस {langs} भाषामा उपलब्ध छ, आवश्यक परे दायाँबाट बायाँ। एक्काको मद्दत — वेब क्लाइन्टको शुभंकर एक्का — ले तपाईं चाहनुहुन्छ भने अघि बढ्दै जाँदा हरेक स्क्रिन बुझाउँछ, र “यो के हो?” ले स्क्रिनमा जुनसुकै कुराले के गर्छ भनेर बताउँछ।",
    "faqH2": "प्रश्नहरू",
    "faq": [
      [
        "के म कार्ड र अक्षर ठूला बनाउन सक्छु?",
        "सक्नुहुन्छ। पहुँचयोग्यता झ्यालमा ठूलो वा धेरै ठूलो छान्नुहोस्; टेबलसहित हरेक स्क्रिनमा कार्ड, अक्षर र बटन सँगै ठूला हुन्छन्।"
      ],
      [
        "के उच्च कन्ट्रास्ट मोड छ?",
        "छ, पहुँचयोग्यता झ्यालमा। यो इन्टरफेसको हरेक आकारसँग चल्छ।"
      ],
      [
        "के म माउस वा टच स्क्रिनबिना खेल्न सक्छु?",
        "सक्नुहुन्छ, पूरै किबोर्डबाट, गेमप्याडबाट वा Android TV रिमोटबाट।"
      ],
      [
        "के यो स्क्रिन रिडरसँग चल्छ?",
        "अहिलेसम्म पूर्ण रूपमा चल्दैन। आवाज घोषणाले खेलका घटनाहरू ठूलो स्वरमा पढ्छ र मेनुहरूमा लेबल छन्, तर पोकर टेबल आफैँ दृश्य इन्टरफेस हो र अझै स्क्रिन रिडरको मात्र भरमा खेल्न सकिँदैन।"
      ],
      [
        "के यो निःशुल्क हो?",
        "हो। PokerTH निःशुल्क र खुला स्रोत सफ्टवेयर हो, विज्ञापन र एपभित्रको खरिदबिना; सबै चिप खेलको पैसा हुन्।"
      ]
    ]
  },
  nl: {
    "title": "Toegankelijk poker — grote tekst, toetsenbord, gamepad | PokerTH",
    "desc": "Gratis Texas Hold’em: grote tekst, hoog contrast, vierkleurendecks, tafelloep, gesproken aankondigingen en alles bedienen met toetsenbord, gamepad of afstandsbediening.",
    "ldHeadline": "Toegankelijk online poker: grote tekst, hoog contrast, toetsenbord en gamepad",
    "ldDesc": "De toegankelijkheidsfuncties van de PokerTH-webclient: interfacegrootte, hoog contrast, vierkleurendecks, loep, gesproken aankondigingen, toetsenbord, gamepad en tv-afstandsbediening.",
    "h1": "Toegankelijk poker: speel op jouw manier",
    "lead": "PokerTH is gratis Texas Hold’em in de browser, en het past zich aan aan hoe je kijkt en speelt: grotere tekst en knoppen, sterker contrast, kaartdecks die elk kaartsymbool een eigen kleur geven, een loep voor kleine schermen, gesproken aankondigingen en volledige bediening met toetsenbord, gamepad of tv-afstandsbediening.",
    "findH2": "Waar je het vindt",
    "findP": "De knop Toegankelijkheid — het poppetje bovenaan elk scherm, van het inlogscherm tot aan de tafel — opent op elk moment de belangrijkste instellingen, zelfs midden in een hand. Al het andere staat in de Geavanceerde opties. Je keuzes worden op het apparaat onthouden en volgen je, als je inlogt met een pokerth.net-account, ook naar je andere apparaten.",
    "seeH2": "De tafel goed zien",
    "see": [
      [
        "Interfacegrootte",
        "Standaard, Groot of Extra groot: tekst, kaarten, fiches en knoppen groeien samen mee, op het inlogscherm, in de lobby en aan tafel, en de indeling past zich aan zodat alles op een telefoon bruikbaar blijft."
      ],
      [
        "Hoog contrast",
        "Een kleurenpalet met sterker contrast in de hele interface, van de menu’s tot de tafel, bij elke interfacegrootte."
      ],
      [
        "Vierkleurendecks",
        "Kaartdecks die elk symbool een eigen kleur geven, zodat je harten en ruiten, of schoppen en klaveren, nooit alleen aan de vorm hoeft te herkennen. Kies er een in Geavanceerde opties → Stijl."
      ],
      [
        "Tafelloep",
        "Op een telefoon zoomt de tafel in tot twee keer zijn grootte en schuif je hem met je vinger; het beeld keert terug naar je stoel als je aan de beurt bent. Ook de knijpzoom van de browser kan worden toegestaan."
      ],
      [
        "Licht, donker of automatisch",
        "De hele client volgt jouw keuze of die van je systeem, met thema’s, decks en tafelkleuren die bij je ogen passen."
      ]
    ],
    "keysH2": "Toetsenbord",
    "keysP": "Elke actie heeft een toets. De officiële PokerTH-functietoetsen werken aan tafel — F1 tot F4 voor Fold, Check/Call, Bet/Raise en All-In, F5 om je kaarten te tonen, F6 tot F8 voor de speelmodi — en de webclient voegt losse letters toe (F, C, R, A, en 1, 2, 3 voor een derde van de pot, de halve pot of de hele pot), die je allemaal anders kunt toewijzen. Esc sluit het bovenste venster, Tab en de pijltjestoetsen lopen door de tafellijst van de lobby, en Alt+S opent overal de instellingen.",
    "padH2": "Gamepad en tv-afstandsbediening",
    "padP": "Een gamecontroller — Xbox, PlayStation, Switch Pro en de meeste Bluetooth-controllers — speelt het hele spel: knoppen voor elke actie, triggers om de inzet te bepalen, en een navigatiemodus om door de schermen, de chat en de menu’s te gaan. Hij trilt als je aan de beurt bent. Op Android TV en Google TV werkt de afstandsbediening op dezelfde manier, en afstandsbedieningen met de vier gekleurde toetsen gebruiken die voor Fold, Check/Call, Bet/Raise en All-In.",
    "hearH2": "Het spel horen en voelen",
    "hearP": "Gesproken aankondigingen lezen de spelgebeurtenissen voor met de stemmen van je eigen apparaat, in je eigen taal als het systeem die heeft. Op Android-telefoons markeert een korte trilling je beurt. De spelgeluiden zijn verdeeld in vier groepen — acties, chat, netwerkmeldingen en blindverhogingen — die je apart aan of uit kunt zetten, met één volumeschuif.",
    "calmH2": "Minder verrassingen",
    "calmP": "Als je systeem om minder beweging vraagt, tempert de client zijn animaties. De anti-gluurmodus houdt je eigen kaarten verborgen tot je ze aanraakt, en de bescherming tegen een per-ongeluk-Call blokkeert de Call-knop kort na een grote verhoging, zodat een tik bedoeld voor een kleinere Call niet per ongeluk het verhoogde bedrag betaalt.",
    "langH2": "In je eigen taal, met een gids",
    "langP": "De interface is beschikbaar in {langs} talen, van rechts naar links waar nodig. Met Hulp van de Aas legt de Aas, de mascotte van de webclient, elk scherm uit terwijl je speelt, als je dat wilt, en “Wat is dit?” vertelt je wat alles op het scherm doet.",
    "faqH2": "Vragen",
    "faq": [
      [
        "Kan ik de kaarten en de tekst groter maken?",
        "Ja. Kies Groot of Extra groot in het venster Toegankelijkheid; kaarten, tekst en knoppen groeien samen mee op elk scherm, ook aan tafel."
      ],
      [
        "Is er een modus met hoog contrast?",
        "Ja, in het venster Toegankelijkheid. Hij werkt bij elke interfacegrootte."
      ],
      [
        "Kan ik spelen zonder muis of touchscreen?",
        "Ja, helemaal met het toetsenbord, met een gamepad of met een afstandsbediening van Android TV."
      ],
      [
        "Werkt het met een schermlezer?",
        "Nog niet volledig. Gesproken aankondigingen lezen de spelgebeurtenissen voor en de menu’s hebben labels, maar de pokertafel zelf is een visuele interface en kan nog niet met alleen een schermlezer worden gespeeld."
      ],
      [
        "Is het gratis?",
        "Ja. PokerTH is gratis opensourcesoftware, zonder advertenties en zonder in-app-aankopen; alle fiches zijn speelgeld."
      ]
    ]
  },
  pa: {
    "title": "ਪਹੁੰਚਯੋਗ ਪੋਕਰ — ਵੱਡੇ ਅੱਖਰ, ਕੀਬੋਰਡ, ਗੇਮਪੈਡ | PokerTH",
    "desc": "ਮੁਫ਼ਤ Texas Hold’em: ਵੱਡੇ ਅੱਖਰ, ਵੱਧ ਕੰਟ੍ਰਾਸਟ, ਚਾਰ-ਰੰਗੀ ਡੈੱਕ, ਟੇਬਲ ਵੱਡਦਰਸ਼ਕ, ਆਵਾਜ਼ ਐਲਾਨ ਅਤੇ ਕੀਬੋਰਡ, ਗੇਮਪੈਡ ਤੇ ਟੀਵੀ ਰਿਮੋਟ ਨਾਲ ਪੂਰੀ ਖੇਡ।",
    "ldHeadline": "ਪਹੁੰਚਯੋਗ ਔਨਲਾਈਨ ਪੋਕਰ: ਵੱਡੇ ਅੱਖਰ, ਵੱਧ ਕੰਟ੍ਰਾਸਟ, ਕੀਬੋਰਡ ਅਤੇ ਗੇਮਪੈਡ",
    "ldDesc": "PokerTH ਵੈੱਬ ਕਲਾਇਂਟ ਦੀਆਂ ਪਹੁੰਚਯੋਗਤਾ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ: ਇੰਟਰਫੇਸ ਦਾ ਆਕਾਰ, ਵੱਧ ਕੰਟ੍ਰਾਸਟ, ਚਾਰ-ਰੰਗੀ ਡੈੱਕ, ਵੱਡਦਰਸ਼ਕ, ਆਵਾਜ਼ ਐਲਾਨ, ਕੀਬੋਰਡ, ਗੇਮਪੈਡ ਅਤੇ ਟੀਵੀ ਰਿਮੋਟ।",
    "h1": "ਪਹੁੰਚਯੋਗ ਪੋਕਰ: ਆਪਣੇ ਢੰਗ ਨਾਲ ਖੇਡੋ",
    "lead": "PokerTH ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਮੁਫ਼ਤ Texas Hold’em ਹੈ, ਅਤੇ ਇਹ ਤੁਹਾਡੇ ਵੇਖਣ ਅਤੇ ਖੇਡਣ ਦੇ ਢੰਗ ਮੁਤਾਬਕ ਢਲ ਜਾਂਦਾ ਹੈ: ਵੱਡੇ ਅੱਖਰ ਅਤੇ ਬਟਨ, ਵਧੇਰੇ ਤਿੱਖਾ ਕੰਟ੍ਰਾਸਟ, ਰੰਗ ਨਾਲ ਸੂਟ ਵੱਖ ਕਰਨ ਵਾਲੇ ਡੈੱਕ, ਛੋਟੀਆਂ ਸਕ੍ਰੀਨਾਂ ਲਈ ਵੱਡਦਰਸ਼ਕ, ਆਵਾਜ਼ ਐਲਾਨ, ਅਤੇ ਕੀਬੋਰਡ, ਗੇਮਪੈਡ ਜਾਂ ਟੀਵੀ ਰਿਮੋਟ ਨਾਲ ਪੂਰਾ ਕੰਟਰੋਲ।",
    "findH2": "ਇਹ ਕਿੱਥੇ ਮਿਲਦਾ ਹੈ",
    "findP": "ਪਹੁੰਚਯੋਗਤਾ ਬਟਨ — ਲੌਗਇਨ ਸਕ੍ਰੀਨ ਤੋਂ ਟੇਬਲ ਤੱਕ ਹਰ ਸਕ੍ਰੀਨ ਦੇ ਉੱਪਰ ਵਿਅਕਤੀ ਵਾਲਾ ਆਈਕਨ — ਕਿਸੇ ਵੀ ਵੇਲੇ, ਹੱਥ ਦੇ ਵਿਚਕਾਰ ਵੀ, ਮੁੱਖ ਸੈਟਿੰਗਾਂ ਖੋਲ੍ਹਦਾ ਹੈ। ਬਾਕੀ ਸਭ ਕੁਝ ਉੱਨਤ ਵਿਕਲਪਾਂ ਵਿੱਚ ਹੈ। ਤੁਹਾਡੀਆਂ ਚੋਣਾਂ ਯੰਤਰ ’ਤੇ ਯਾਦ ਰੱਖੀਆਂ ਜਾਂਦੀਆਂ ਹਨ ਅਤੇ, ਜਦੋਂ ਤੁਸੀਂ pokerth.net ਖਾਤੇ ਨਾਲ ਲੌਗਇਨ ਕਰਦੇ ਹੋ, ਤੁਹਾਡੇ ਹੋਰ ਯੰਤਰਾਂ ’ਤੇ ਵੀ ਤੁਹਾਡੇ ਨਾਲ ਜਾਂਦੀਆਂ ਹਨ।",
    "seeH2": "ਟੇਬਲ ਨੂੰ ਸਾਫ਼ ਵੇਖਣਾ",
    "see": [
      [
        "ਇੰਟਰਫੇਸ ਦਾ ਆਕਾਰ",
        "ਮਿਆਰੀ, ਵੱਡਾ ਜਾਂ ਬਹੁਤ ਵੱਡਾ: ਲੌਗਇਨ ਸਕ੍ਰੀਨ, ਲਾਬੀ ਅਤੇ ਟੇਬਲ ’ਤੇ ਅੱਖਰ, ਪੱਤੇ, ਚਿਪਸ ਅਤੇ ਬਟਨ ਇਕੱਠੇ ਵੱਡੇ ਹੁੰਦੇ ਹਨ, ਅਤੇ ਲੇਆਉਟ ਮੁੜ ਵਿਵਸਥਿਤ ਹੁੰਦਾ ਹੈ ਤਾਂ ਜੋ ਫੋਨ ’ਤੇ ਵੀ ਵਰਤਣਯੋਗ ਰਹੇ।"
      ],
      [
        "ਵੱਧ ਕੰਟ੍ਰਾਸਟ",
        "ਮੀਨੂ ਤੋਂ ਟੇਬਲ ਤੱਕ ਪੂਰੇ ਇੰਟਰਫੇਸ ਵਿੱਚ ਵਧੇਰੇ ਕੰਟ੍ਰਾਸਟ ਵਾਲੀ ਰੰਗ-ਪੱਟੀ, ਹਰ ਇੰਟਰਫੇਸ ਆਕਾਰ ’ਤੇ।"
      ],
      [
        "ਚਾਰ-ਰੰਗੀ ਡੈੱਕ",
        "ਅਜਿਹੇ ਪੱਤਿਆਂ ਦੇ ਡੈੱਕ ਜੋ ਹਰ ਸੂਟ ਨੂੰ ਆਪਣਾ ਰੰਗ ਦਿੰਦੇ ਹਨ, ਤਾਂ ਜੋ ਪਾਨ ਅਤੇ ਇੱਟ, ਜਾਂ ਹੁਕਮ ਅਤੇ ਚਿੜੀ ਕਦੇ ਸਿਰਫ਼ ਸ਼ਕਲ ਨਾਲ ਵੱਖ ਨਾ ਕਰਨੇ ਪੈਣ। ਉੱਨਤ ਵਿਕਲਪ → ਸ਼ੈਲੀ ਵਿੱਚੋਂ ਇੱਕ ਚੁਣੋ।"
      ],
      [
        "ਟੇਬਲ ਵੱਡਦਰਸ਼ਕ",
        "ਫੋਨ ’ਤੇ ਟੇਬਲ ਦੁੱਗਣੇ ਆਕਾਰ ਤੱਕ ਜ਼ੂਮ ਹੁੰਦਾ ਹੈ ਅਤੇ ਉਂਗਲ ਨਾਲ ਸਰਕਾਇਆ ਜਾ ਸਕਦਾ ਹੈ; ਤੁਹਾਡੀ ਵਾਰੀ ਆਉਣ ’ਤੇ ਦ੍ਰਿਸ਼ ਤੁਹਾਡੀ ਸੀਟ ’ਤੇ ਵਾਪਸ ਆ ਜਾਂਦਾ ਹੈ। ਬ੍ਰਾਊਜ਼ਰ ਦਾ ਪਿੰਚ-ਜ਼ੂਮ ਵੀ ਚਾਲੂ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ।"
      ],
      [
        "ਹਲਕਾ, ਗੂੜ੍ਹਾ ਜਾਂ ਆਟੋਮੈਟਿਕ",
        "ਪੂਰਾ ਕਲਾਇਂਟ ਤੁਹਾਡੀ ਜਾਂ ਤੁਹਾਡੇ ਸਿਸਟਮ ਦੀ ਚੋਣ ਮੁਤਾਬਕ ਚੱਲਦਾ ਹੈ, ਤੁਹਾਡੀਆਂ ਅੱਖਾਂ ਮੁਤਾਬਕ ਥੀਮਾਂ, ਡੈੱਕਾਂ ਅਤੇ ਟੇਬਲ ਰੰਗਾਂ ਨਾਲ।"
      ]
    ],
    "keysH2": "ਕੀਬੋਰਡ",
    "keysP": "ਹਰ ਕਾਰਵਾਈ ਲਈ ਇੱਕ ਕੁੰਜੀ ਹੈ। PokerTH ਦੀਆਂ ਅਧਿਕਾਰਤ ਫੰਕਸ਼ਨ ਕੁੰਜੀਆਂ ਟੇਬਲ ’ਤੇ ਕੰਮ ਕਰਦੀਆਂ ਹਨ — Fold, Check/Call, Bet/Raise ਅਤੇ All-In ਲਈ F1 ਤੋਂ F4, ਆਪਣੇ ਪੱਤੇ ਵਿਖਾਉਣ ਲਈ F5, ਖੇਡ ਮੋਡਾਂ ਲਈ F6 ਤੋਂ F8 — ਅਤੇ ਵੈੱਬ ਕਲਾਇਂਟ ਇਕੱਲੇ ਅੱਖਰ ਵੀ ਜੋੜਦਾ ਹੈ (F, C, R, A, ਅਤੇ ਪਾਟ ਦੇ ਤੀਜੇ ਹਿੱਸੇ, ਅੱਧੇ ਪਾਟ ਜਾਂ ਪੂਰੇ ਪਾਟ ਲਈ 1, 2, 3), ਜਿਨ੍ਹਾਂ ਸਭ ਨੂੰ ਮੁੜ-ਨਿਰਧਾਰਤ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ। Esc ਸਭ ਤੋਂ ਉੱਪਰਲੀ ਵਿੰਡੋ ਬੰਦ ਕਰਦਾ ਹੈ, Tab ਅਤੇ ਤੀਰ ਕੁੰਜੀਆਂ ਲਾਬੀ ਦੀ ਟੇਬਲ ਸੂਚੀ ਵਿੱਚ ਘੁੰਮਾਉਂਦੀਆਂ ਹਨ, ਅਤੇ Alt+S ਕਿਤੋਂ ਵੀ ਸੈਟਿੰਗਾਂ ਖੋਲ੍ਹਦਾ ਹੈ।",
    "padH2": "ਗੇਮਪੈਡ ਅਤੇ ਟੀਵੀ ਰਿਮੋਟ",
    "padP": "ਗੇਮ ਕੰਟਰੋਲਰ — Xbox, PlayStation, Switch Pro ਅਤੇ ਜ਼ਿਆਦਾਤਰ Bluetooth ਪੈਡ — ਨਾਲ ਪੂਰੀ ਖੇਡ ਖੇਡੀ ਜਾ ਸਕਦੀ ਹੈ: ਹਰ ਕਾਰਵਾਈ ਲਈ ਬਟਨ, ਦਾਅ ਤੈਅ ਕਰਨ ਲਈ ਟ੍ਰਿਗਰ, ਅਤੇ ਸਕ੍ਰੀਨਾਂ, ਗੱਲਬਾਤ ਤੇ ਮੀਨੂਆਂ ਵਿੱਚ ਘੁੰਮਣ ਲਈ ਨੈਵੀਗੇਸ਼ਨ ਮੋਡ। ਤੁਹਾਡੀ ਵਾਰੀ ਆਉਣ ’ਤੇ ਇਹ ਵਾਈਬ੍ਰੇਟ ਕਰਦਾ ਹੈ। Android TV ਅਤੇ Google TV ’ਤੇ ਰਿਮੋਟ ਇਸੇ ਤਰ੍ਹਾਂ ਕੰਮ ਕਰਦਾ ਹੈ, ਅਤੇ ਚਾਰ ਰੰਗੀਨ ਕੁੰਜੀਆਂ ਵਾਲੇ ਰਿਮੋਟ ਉਹਨਾਂ ਨੂੰ Fold, Check/Call, Bet/Raise ਅਤੇ All-In ਲਈ ਵਰਤਦੇ ਹਨ।",
    "hearH2": "ਖੇਡ ਨੂੰ ਸੁਣਨਾ ਅਤੇ ਮਹਿਸੂਸ ਕਰਨਾ",
    "hearP": "ਆਵਾਜ਼ ਐਲਾਨ ਤੁਹਾਡੇ ਯੰਤਰ ਦੀਆਂ ਆਪਣੀਆਂ ਆਵਾਜ਼ਾਂ ਨਾਲ ਖੇਡ ਦੀਆਂ ਘਟਨਾਵਾਂ ਉੱਚੀ ਪੜ੍ਹਦੇ ਹਨ, ਜੇ ਸਿਸਟਮ ਵਿੱਚ ਹੋਵੇ ਤਾਂ ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਵਿੱਚ। Android ਫੋਨਾਂ ’ਤੇ ਇੱਕ ਛੋਟੀ ਵਾਈਬ੍ਰੇਸ਼ਨ ਤੁਹਾਡੀ ਵਾਰੀ ਦੱਸਦੀ ਹੈ। ਖੇਡ ਦੀਆਂ ਆਵਾਜ਼ਾਂ ਚਾਰ ਸਮੂਹਾਂ ਵਿੱਚ ਹਨ — ਕਾਰਵਾਈਆਂ, ਗੱਲਬਾਤ, ਨੈੱਟਵਰਕ ਸੂਚਨਾਵਾਂ ਅਤੇ ਬਲਾਇੰਡ ਵਾਧਾ — ਜਿਨ੍ਹਾਂ ਨੂੰ ਵੱਖ-ਵੱਖ ਚਾਲੂ ਜਾਂ ਬੰਦ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ, ਇੱਕੋ ਵਾਲੀਅਮ ਸਲਾਈਡਰ ਨਾਲ।",
    "calmH2": "ਘੱਟ ਹੈਰਾਨੀਆਂ",
    "calmP": "ਜਦੋਂ ਤੁਹਾਡਾ ਸਿਸਟਮ ਘੱਟ ਹਿਲਜੁਲ ਮੰਗਦਾ ਹੈ, ਤਾਂ ਕਲਾਇਂਟ ਆਪਣੀਆਂ ਐਨੀਮੇਸ਼ਨਾਂ ਹਲਕੀਆਂ ਕਰ ਦਿੰਦਾ ਹੈ। ਐਂਟੀ-ਪੀਕ ਤੁਹਾਡੇ ਆਪਣੇ ਪੱਤੇ ਉਦੋਂ ਤੱਕ ਲੁਕਾ ਕੇ ਰੱਖਦਾ ਹੈ ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਉਹਨਾਂ ਨੂੰ ਟੈਪ ਨਾ ਕਰੋ, ਅਤੇ ਗ਼ਲਤੀ-ਨਾਲ-Call ਗਾਰਡ ਵੱਡੇ ਰੇਜ਼ ਤੋਂ ਤੁਰੰਤ ਬਾਅਦ Call ਬਟਨ ਨੂੰ ਥੋੜ੍ਹੀ ਦੇਰ ਲਈ ਬਲੌਕ ਕਰਦਾ ਹੈ, ਤਾਂ ਜੋ ਛੋਟੇ call ਲਈ ਕੀਤਾ ਟੈਪ ਗ਼ਲਤੀ ਨਾਲ ਵਧੀ ਹੋਈ ਰਕਮ ਨਾ ਭਰ ਦੇਵੇ।",
    "langH2": "ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਵਿੱਚ, ਇੱਕ ਗਾਈਡ ਨਾਲ",
    "langP": "ਇੰਟਰਫੇਸ {langs} ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਉਪਲਬਧ ਹੈ, ਜਿੱਥੇ ਲੋੜ ਹੋਵੇ ਉੱਥੇ ਸੱਜੇ ਤੋਂ ਖੱਬੇ। ਵੈੱਬ ਕਲਾਇਂਟ ਦਾ ਮਾਸਕੌਟ, ਯੱਕੇ ਦੀ ਮਦਦ, ਜੇ ਤੁਸੀਂ ਚਾਹੋ ਤਾਂ ਤੁਹਾਡੇ ਅੱਗੇ ਵਧਦਿਆਂ ਹਰ ਸਕ੍ਰੀਨ ਸਮਝਾਉਂਦਾ ਹੈ, ਅਤੇ “ਇਹ ਕੀ ਹੈ?” ਤੁਹਾਨੂੰ ਦੱਸਦਾ ਹੈ ਕਿ ਸਕ੍ਰੀਨ ’ਤੇ ਕੋਈ ਵੀ ਚੀਜ਼ ਕੀ ਕਰਦੀ ਹੈ।",
    "faqH2": "ਸਵਾਲ",
    "faq": [
      [
        "ਕੀ ਪੱਤੇ ਅਤੇ ਅੱਖਰ ਵੱਡੇ ਕੀਤੇ ਜਾ ਸਕਦੇ ਹਨ?",
        "ਹਾਂ। ਪਹੁੰਚਯੋਗਤਾ ਵਿੰਡੋ ਵਿੱਚ ਵੱਡਾ ਜਾਂ ਬਹੁਤ ਵੱਡਾ ਚੁਣੋ; ਟੇਬਲ ਸਮੇਤ ਹਰ ਸਕ੍ਰੀਨ ’ਤੇ ਪੱਤੇ, ਅੱਖਰ ਅਤੇ ਬਟਨ ਇਕੱਠੇ ਵੱਡੇ ਹੁੰਦੇ ਹਨ।"
      ],
      [
        "ਕੀ ਵੱਧ ਕੰਟ੍ਰਾਸਟ ਮੋਡ ਹੈ?",
        "ਹਾਂ, ਪਹੁੰਚਯੋਗਤਾ ਵਿੰਡੋ ਵਿੱਚ। ਇਹ ਹਰ ਇੰਟਰਫੇਸ ਆਕਾਰ ਨਾਲ ਕੰਮ ਕਰਦਾ ਹੈ।"
      ],
      [
        "ਕੀ ਮਾਊਸ ਜਾਂ ਟੱਚ ਸਕ੍ਰੀਨ ਤੋਂ ਬਿਨਾਂ ਖੇਡਿਆ ਜਾ ਸਕਦਾ ਹੈ?",
        "ਹਾਂ, ਪੂਰੀ ਤਰ੍ਹਾਂ ਕੀਬੋਰਡ, ਗੇਮਪੈਡ ਜਾਂ Android TV ਰਿਮੋਟ ਨਾਲ।"
      ],
      [
        "ਕੀ ਇਹ ਸਕ੍ਰੀਨ ਰੀਡਰ ਨਾਲ ਕੰਮ ਕਰਦਾ ਹੈ?",
        "ਅਜੇ ਪੂਰੀ ਤਰ੍ਹਾਂ ਨਹੀਂ। ਆਵਾਜ਼ ਐਲਾਨ ਖੇਡ ਦੀਆਂ ਘਟਨਾਵਾਂ ਉੱਚੀ ਪੜ੍ਹਦੇ ਹਨ ਅਤੇ ਮੀਨੂਆਂ ’ਤੇ ਲੇਬਲ ਹਨ, ਪਰ ਪੋਕਰ ਟੇਬਲ ਆਪਣੇ ਆਪ ਵਿੱਚ ਇੱਕ ਦ੍ਰਿਸ਼ਟੀਗਤ ਇੰਟਰਫੇਸ ਹੈ ਅਤੇ ਅਜੇ ਸਿਰਫ਼ ਸਕ੍ਰੀਨ ਰੀਡਰ ਨਾਲ ਨਹੀਂ ਖੇਡਿਆ ਜਾ ਸਕਦਾ।"
      ],
      [
        "ਕੀ ਇਹ ਮੁਫ਼ਤ ਹੈ?",
        "ਹਾਂ। PokerTH ਮੁਫ਼ਤ ਅਤੇ ਓਪਨ-ਸੋਰਸ ਸਾਫਟਵੇਅਰ ਹੈ, ਬਿਨਾਂ ਇਸ਼ਤਿਹਾਰਾਂ ਅਤੇ ਬਿਨਾਂ ਇਨ-ਐਪ ਖਰੀਦਾਂ ਦੇ; ਸਾਰੇ ਚਿਪਸ ਖੇਡ ਵਾਲੇ ਪੈਸੇ ਹਨ।"
      ]
    ]
  },
  pl: {
    "title": "Dostępny poker — duży tekst, klawiatura, pad | PokerTH",
    "desc": "Darmowy Texas Hold’em z większym tekstem, wysokim kontrastem, taliami czterokolorowymi, lupą, zapowiedziami głosowymi i pełną obsługą klawiaturą, padem i pilotem.",
    "ldHeadline": "Dostępny poker online: duży tekst, wysoki kontrast, klawiatura i pad",
    "ldDesc": "Ułatwienia dostępu klienta webowego PokerTH: rozmiar interfejsu, wysoki kontrast, talie czterokolorowe, lupa, zapowiedzi głosowe, klawiatura, pad i pilot TV.",
    "h1": "Dostępny poker: graj po swojemu",
    "lead": "PokerTH to darmowy Texas Hold’em w przeglądarce, który dopasowuje się do tego, jak widzisz i grasz: większy tekst i przyciski, mocniejszy kontrast, talie rozróżniające kolory kart barwą, lupa na małe ekrany, zapowiedzi głosowe oraz pełne sterowanie klawiaturą, padem lub pilotem TV.",
    "findH2": "Gdzie to znaleźć",
    "findP": "Przycisk Ułatwienia dostępu — ikona postaci u góry każdego ekranu, od ekranu logowania po stół — w każdej chwili otwiera główne ustawienia, nawet w środku rozdania. Wszystko inne znajdziesz w Opcjach zaawansowanych. Twoje wybory są zapamiętywane na urządzeniu, a gdy logujesz się kontem pokerth.net, podążają za tobą na inne urządzenia.",
    "seeH2": "Jak widzisz stół",
    "see": [
      [
        "Rozmiar interfejsu",
        "Standardowy, Duży lub Bardzo duży: tekst, karty, żetony i przyciski rosną razem — na ekranie logowania, w lobby i przy stole — a układ dopasowuje się, by pozostać wygodnym na telefonie."
      ],
      [
        "Wysoki kontrast",
        "Paleta o mocniejszym kontraście w całym interfejsie, od menu po stół, przy każdym rozmiarze interfejsu."
      ],
      [
        "Talie czterokolorowe",
        "Talie kart, w których każdy kolor ma własną barwę, więc kier i karo czy pik i trefl nigdy nie różnią się tylko kształtem. Wybierz jedną w Opcje zaawansowane → Styl."
      ],
      [
        "Lupa stołu",
        "Na telefonie stół powiększa się dwukrotnie i przesuwa palcem; widok wraca do twojego miejsca, gdy przychodzi twoja kolej. Można też zezwolić na powiększanie szczypaniem w przeglądarce."
      ],
      [
        "Jasny, ciemny lub automatyczny",
        "Cały klient podąża za twoim wyborem lub za ustawieniem systemu, z motywami, taliami i kolorami stołu dopasowanymi do twoich oczu."
      ]
    ],
    "keysH2": "Klawiatura",
    "keysP": "Każda akcja ma swój klawisz. Oficjalne klawisze funkcyjne PokerTH działają przy stole — F1 do F4 to Fold, Check/Call, Bet/Raise i All-In, F5 pokazuje twoje karty, F6 do F8 wybiera tryby gry — a klient webowy dodaje pojedyncze litery (F, C, R, A oraz 1, 2, 3 dla jednej trzeciej puli, połowy puli lub całej puli); wszystkie można przypisać na nowo. Escape zamyka wierzchnie okno, Tab i strzałki poruszają się po liście stołów w lobby, a Alt+S otwiera ustawienia z każdego miejsca.",
    "padH2": "Pad i pilot TV",
    "padP": "Kontroler do gier — Xbox, PlayStation, Switch Pro i większość padów Bluetooth — obsługuje całą grę: przyciski do każdej akcji, spusty do ustawiania stawki i tryb nawigacji do poruszania się po ekranach, czacie i menu. Wibruje, gdy nadchodzi twoja kolej. Na Android TV i Google TV pilot działa tak samo, a piloty z czterema kolorowymi przyciskami używają ich do Fold, Check/Call, Bet/Raise i All-In.",
    "hearH2": "Słyszeć i czuć grę",
    "hearP": "Zapowiedzi głosowe czytają na głos wydarzenia gry głosami twojego urządzenia, w twoim języku, jeśli system go ma. Na telefonach z Androidem krótka wibracja oznacza twoją kolej. Dźwięki gry dzielą się na cztery grupy — akcje, czat, komunikaty sieciowe i podnoszenie ciemnych — które można włączać i wyłączać osobno, z jednym suwakiem głośności.",
    "calmH2": "Mniej niespodzianek",
    "calmP": "Gdy system prosi o ograniczenie ruchu, klient wycisza swoje animacje. Tryb antypodglądowy trzyma twoje karty zakryte, dopóki ich nie dotkniesz, a ochrona przed przypadkowym Call na chwilę blokuje przycisk Call tuż po dużym przebiciu, żeby dotknięcie przeznaczone dla mniejszego Call nie zapłaciło przez pomyłkę przebitej kwoty.",
    "langH2": "W twoim języku, z przewodnikiem",
    "langP": "Interfejs jest dostępny w {langs} językach, w razie potrzeby od prawej do lewej. Dzięki Pomocy Asa As — maskotka klienta webowego — objaśnia na bieżąco każdy ekran, jeśli tego chcesz, a „Co to jest?” mówi, do czego służy wszystko na ekranie.",
    "faqH2": "Pytania",
    "faq": [
      [
        "Czy mogę powiększyć karty i tekst?",
        "Tak. Wybierz Duży lub Bardzo duży w oknie Ułatwienia dostępu; karty, tekst i przyciski rosną razem na każdym ekranie, także przy stole."
      ],
      [
        "Czy jest tryb wysokiego kontrastu?",
        "Tak, w oknie Ułatwienia dostępu. Działa przy każdym rozmiarze interfejsu."
      ],
      [
        "Czy mogę grać bez myszy i ekranu dotykowego?",
        "Tak, w całości klawiaturą, padem albo pilotem Android TV."
      ],
      [
        "Czy działa z czytnikiem ekranu?",
        "Jeszcze nie w pełni. Zapowiedzi głosowe czytają na głos wydarzenia gry, a menu mają etykiety, ale sam stół pokerowy jest interfejsem wizualnym i nie da się jeszcze przy nim grać wyłącznie z czytnikiem ekranu."
      ],
      [
        "Czy to jest darmowe?",
        "Tak. PokerTH to darmowe oprogramowanie open source, bez reklam i bez zakupów w aplikacji; wszystkie żetony to wirtualne pieniądze."
      ]
    ]
  },
  "pt-BR": {
    "title": "Pôquer acessível — letra grande, teclado, controle | PokerTH",
    "desc": "Texas Hold’em grátis com letra maior, alto contraste, baralhos de quatro cores, lupa da mesa, anúncios de voz e jogo completo por teclado, controle de jogo ou da TV.",
    "ldHeadline": "Pôquer online acessível: letra grande, alto contraste, teclado e controle",
    "ldDesc": "Os recursos de acessibilidade do cliente web do PokerTH: tamanho da interface, alto contraste, baralhos de quatro cores, lupa, anúncios de voz, teclado, controle e controle remoto da TV.",
    "h1": "Pôquer acessível: jogue do seu jeito",
    "lead": "O PokerTH é Texas Hold’em grátis no navegador, e ele se adapta ao jeito como você vê e joga: textos e botões maiores, contraste mais forte, baralhos que diferenciam os naipes pela cor, uma lupa para telas pequenas, anúncios de voz e controle completo pelo teclado, por um controle de jogo ou pelo controle remoto da TV.",
    "findH2": "Onde encontrar",
    "findP": "O botão Acessibilidade — o ícone de pessoa no topo de todas as telas, da tela de conexão até a mesa — abre as configurações principais a qualquer momento, até no meio de uma mão. Todo o resto fica nas Opções avançadas. Suas escolhas ficam memorizadas no dispositivo e, quando você entra com uma conta do pokerth.net, acompanham você nos seus outros dispositivos.",
    "seeH2": "Enxergar bem a mesa",
    "see": [
      [
        "Tamanho da interface",
        "Padrão, Grande ou Extragrande: texto, cartas, fichas e botões crescem juntos, na tela de conexão, no lobby e na mesa, e o layout se reorganiza para continuar confortável no celular."
      ],
      [
        "Alto contraste",
        "Uma paleta de contraste mais forte em toda a interface, dos menus à mesa, em qualquer tamanho da interface."
      ],
      [
        "Baralhos de quatro cores",
        "Baralhos que dão a cada naipe a sua própria cor, para que copas e ouros, ou espadas e paus, nunca precisem ser distinguidos só pelo formato. Escolha um em Opções avançadas → Estilo."
      ],
      [
        "Lupa da mesa",
        "No celular, a mesa é ampliada para o dobro do tamanho e você a desloca com o dedo; a vista volta para o seu assento quando é a sua vez. O zoom do navegador com pinça também pode ser permitido."
      ],
      [
        "Claro, escuro ou automático",
        "O cliente inteiro segue a sua escolha ou a do sistema, com temas, baralhos e cores de mesa do jeito que for melhor para os seus olhos."
      ]
    ],
    "keysH2": "Teclado",
    "keysP": "Cada ação tem uma tecla. As teclas de função oficiais do PokerTH funcionam na mesa — F1 a F4 para Fold, Check/Call, Bet/Raise e All-In, F5 para mostrar suas cartas, F6 a F8 para os modos de jogo — e o cliente web acrescenta letras simples (F, C, R, A, e 1, 2, 3 para um terço do pote, metade do pote ou o pote), todas reconfiguráveis. Esc fecha a janela da frente, Tab e as setas percorrem a lista de mesas do lobby, e Alt+S abre as configurações de qualquer lugar.",
    "padH2": "Controle e controle remoto da TV",
    "padP": "Um controle de jogo — Xbox, PlayStation, Switch Pro e a maioria dos controles Bluetooth — joga a partida inteira: botões para cada ação, gatilhos para definir a aposta e um modo de navegação para percorrer as telas, o chat e os menus. Ele vibra quando chega a sua vez. No Android TV e no Google TV o controle remoto funciona do mesmo jeito, e os controles com as quatro teclas coloridas as usam para Fold, Check/Call, Bet/Raise e All-In.",
    "hearH2": "Ouvir e sentir o jogo",
    "hearP": "Os anúncios de voz leem em voz alta os eventos do jogo com as vozes do próprio dispositivo, no seu idioma quando o sistema tem uma. Em celulares Android, uma vibração curta marca a sua vez. Os sons do jogo vêm em quatro grupos — ações, chat, avisos de rede e aumentos dos blinds — que podem ser ligados ou desligados separadamente, com um único controle de volume.",
    "calmH2": "Menos surpresas",
    "calmP": "Quando o sistema pede movimento reduzido, o cliente suaviza as animações. A antiespiada mantém suas cartas escondidas até você tocá-las, e a guarda contra Call acidental bloqueia por um instante o botão Call logo após um aumento grande, para que um toque destinado a um Call menor não possa pagar por engano o valor aumentado.",
    "langH2": "No seu idioma, com um guia",
    "langP": "A interface está disponível em {langs} idiomas, da direita para a esquerda quando necessário. A Ajuda do Ás, o mascote do cliente web, explica cada tela conforme você avança, se você quiser, e “O que é isto?” diz para que serve qualquer coisa na tela.",
    "faqH2": "Perguntas",
    "faq": [
      [
        "Posso aumentar as cartas e o texto?",
        "Sim. Escolha Grande ou Extragrande na janela Acessibilidade; cartas, texto e botões crescem juntos em todas as telas, inclusive na mesa."
      ],
      [
        "Existe um modo de alto contraste?",
        "Sim, na janela Acessibilidade. Ele funciona com qualquer tamanho da interface."
      ],
      [
        "Posso jogar sem mouse nem tela sensível ao toque?",
        "Sim, inteiramente pelo teclado, com um controle de jogo ou com o controle remoto do Android TV."
      ],
      [
        "Funciona com leitor de tela?",
        "Ainda não totalmente. Os anúncios de voz leem em voz alta os eventos do jogo e os menus têm rótulos, mas a mesa de pôquer em si é uma interface visual e ainda não pode ser jogada só com um leitor de tela."
      ],
      [
        "É grátis?",
        "Sim. O PokerTH é um software gratuito e de código aberto, sem anúncios e sem compras no app; todas as fichas são dinheiro fictício."
      ]
    ]
  },
  "pt-PT": {
    "title": "Póquer acessível — letra grande, teclado, comando | PokerTH",
    "desc": "Texas Hold’em grátis com letra maior, alto contraste, baralhos de quatro cores, lupa da mesa, anúncios de voz e jogo completo com teclado, comando ou comando da TV.",
    "ldHeadline": "Póquer online acessível: letra grande, alto contraste, teclado e comando",
    "ldDesc": "As funcionalidades de acessibilidade do cliente web do PokerTH: tamanho da interface, alto contraste, baralhos de quatro cores, lupa, anúncios de voz, teclado, comando de jogo e comando da TV.",
    "h1": "Póquer acessível: jogue à sua maneira",
    "lead": "O PokerTH é Texas Hold’em grátis no navegador, e adapta-se à forma como vê e joga: letra e botões maiores, contraste mais forte, baralhos que distinguem os naipes pela cor, uma lupa para ecrãs pequenos, anúncios de voz e controlo total a partir de um teclado, de um comando de jogo ou de um comando da TV.",
    "findH2": "Onde encontrar",
    "findP": "O botão Acessibilidade — o ícone de uma pessoa no topo de todos os ecrãs, do ecrã de ligação à mesa — abre as definições principais a qualquer momento, mesmo a meio de uma mão. Tudo o resto está nas Opções avançadas. As suas escolhas ficam memorizadas no dispositivo e, quando entra com uma conta pokerth.net, acompanham-no nos seus outros dispositivos.",
    "seeH2": "Ver bem a mesa",
    "see": [
      [
        "Tamanho da interface",
        "Padrão, Grande ou Muito grande: texto, cartas, fichas e botões crescem em conjunto, no ecrã de ligação, no lobby e na mesa, e a disposição reorganiza-se para continuar utilizável num telemóvel."
      ],
      [
        "Alto contraste",
        "Uma paleta de contraste mais forte em toda a interface, dos menus à mesa, em qualquer tamanho da interface."
      ],
      [
        "Baralhos de quatro cores",
        "Baralhos que dão a cada naipe a sua própria cor, para que copas e ouros, ou espadas e paus, nunca se distingam apenas pela forma. Escolha um em Opções avançadas → Estilo."
      ],
      [
        "Lupa da mesa",
        "No telemóvel, a mesa amplia-se para o dobro do tamanho e desloca-se com o dedo; a vista volta ao seu lugar quando é a sua vez. Também pode permitir o zoom do navegador em pinça."
      ],
      [
        "Claro, escuro ou automático",
        "Todo o cliente segue a sua escolha ou a do sistema, com temas, baralhos e cores de mesa à medida dos seus olhos."
      ]
    ],
    "keysH2": "Teclado",
    "keysP": "Cada ação tem a sua tecla. As teclas de função oficiais do PokerTH funcionam na mesa — F1 a F4 para Fold, Check/Call, Bet/Raise e All-In, F5 para mostrar as suas cartas, F6 a F8 para os modos de jogo — e o cliente web acrescenta letras simples (F, C, R, A, e 1, 2, 3 para um terço do pote, meio pote ou o pote), todas reatribuíveis. Escape fecha a janela da frente, Tab e as setas percorrem a lista de mesas do lobby, e Alt+S abre as definições a partir de qualquer lado.",
    "padH2": "Comando de jogo e comando da TV",
    "padP": "Um comando de jogo — Xbox, PlayStation, Switch Pro e a maioria dos comandos Bluetooth — joga a partida inteira: botões para cada ação, gatilhos para definir a aposta e um modo de navegação para percorrer os ecrãs, o chat e os menus. Vibra quando chega a sua vez. No Android TV e no Google TV o comando da TV funciona da mesma forma, e os comandos com as quatro teclas coloridas usam-nas para Fold, Check/Call, Bet/Raise e All-In.",
    "hearH2": "Ouvir e sentir o jogo",
    "hearP": "Os anúncios de voz leem em voz alta os eventos do jogo com as vozes do próprio dispositivo, na sua língua quando o sistema a tem. Nos telemóveis Android, uma vibração curta assinala a sua vez. Os sons do jogo dividem-se em quatro grupos — ações, chat, avisos de rede e subidas de blinds — que se ligam ou desligam em separado, com um único cursor de volume.",
    "calmH2": "Menos surpresas",
    "calmP": "Quando o sistema pede movimento reduzido, o cliente suaviza as animações. A antiespreitadela mantém as suas cartas tapadas até lhes tocar, e a guarda contra Call acidental bloqueia por instantes o botão Call logo após uma grande subida, para que um toque destinado a um Call mais pequeno não pague por engano o montante subido.",
    "langH2": "Na sua língua, com um guia",
    "langP": "A interface está disponível em {langs} línguas, da direita para a esquerda quando necessário. A Ajuda do Ás — o Ás é a mascote do cliente web — explica cada ecrã à medida que avança, se quiser, e «O que é isto?» diz-lhe o que faz qualquer coisa no ecrã.",
    "faqH2": "Perguntas",
    "faq": [
      [
        "Posso aumentar as cartas e o texto?",
        "Sim. Escolha Grande ou Muito grande na janela Acessibilidade; cartas, texto e botões crescem em conjunto em todos os ecrãs, incluindo a mesa."
      ],
      [
        "Há um modo de alto contraste?",
        "Sim, na janela Acessibilidade. Funciona com qualquer tamanho da interface."
      ],
      [
        "Posso jogar sem rato nem ecrã tátil?",
        "Sim, inteiramente com o teclado, com um comando de jogo ou com o comando de uma Android TV."
      ],
      [
        "Funciona com um leitor de ecrã?",
        "Ainda não totalmente. Os anúncios de voz leem em voz alta os eventos do jogo e os menus têm etiquetas, mas a mesa de póquer em si é uma interface visual e ainda não pode ser jogada só com um leitor de ecrã."
      ],
      [
        "É grátis?",
        "Sim. O PokerTH é software gratuito e de código aberto, sem anúncios nem compras na aplicação; todas as fichas são dinheiro de jogo."
      ]
    ]
  },
  ro: {
    "title": "Poker accesibil — text mare, tastatură, gamepad | PokerTH",
    "desc": "Texas Hold’em gratuit: text mai mare, contrast ridicat, pachete în 4 culori, lupă, anunțuri vocale și joc complet din tastatură, gamepad sau telecomandă TV.",
    "ldHeadline": "Poker online accesibil: text mare, contrast ridicat, tastatură și gamepad",
    "ldDesc": "Funcțiile de accesibilitate ale clientului web PokerTH: dimensiunea interfeței, contrast ridicat, pachete în 4 culori, lupă, anunțuri vocale, tastatură, gamepad și telecomandă TV.",
    "h1": "Poker accesibil: joacă în felul tău",
    "lead": "PokerTH este Texas Hold’em gratuit în browser și se adaptează felului în care vezi și joci: text și butoane mai mari, contrast mai puternic, pachete care deosebesc culorile cărților prin colorit, o lupă pentru ecranele mici, anunțuri vocale și control complet din tastatură, gamepad sau telecomanda televizorului.",
    "findH2": "Unde le găsești",
    "findP": "Butonul Accesibilitate — pictograma în formă de persoană din partea de sus a fiecărui ecran, de la ecranul de conectare până la masă — deschide oricând setările principale, chiar și în mijlocul unei mâini. Tot restul se află în Opțiuni avansate. Alegerile tale sunt memorate pe dispozitiv și, când te conectezi cu un cont pokerth.net, te urmează pe celelalte dispozitive.",
    "seeH2": "Să vezi masa",
    "see": [
      [
        "Dimensiunea interfeței",
        "Standard, Mare sau Foarte mare: textul, cărțile, jetoanele și butoanele cresc împreună, pe ecranul de conectare, în lobby și la masă, iar aranjamentul se reorganizează ca să rămână ușor de folosit pe telefon."
      ],
      [
        "Contrast ridicat",
        "O paletă cu contrast mai puternic în toată interfața, de la meniuri până la masă, la orice dimensiune a interfeței."
      ],
      [
        "Pachete în patru culori",
        "Pachete de cărți care dau fiecărei culori propriul colorit, astfel încât inima roșie ♥ și caroul ♦, sau pica ♠ și trefla ♣, să nu mai fie deosebite niciodată doar după formă. Alege unul în Opțiuni avansate → Stil."
      ],
      [
        "Lupa pentru masă",
        "Pe telefon, masa se mărește la dublul dimensiunii și se deplasează cu degetul; vederea revine la locul tău când e rândul tău. Poate fi permis și zoomul cu două degete al browserului."
      ],
      [
        "Luminos, întunecat sau automat",
        "Întregul client urmează alegerea ta sau pe cea a sistemului, cu teme, pachete și culori ale mesei potrivite pentru ochii tăi."
      ]
    ],
    "keysH2": "Tastatura",
    "keysP": "Fiecare acțiune are o tastă. Tastele funcționale oficiale PokerTH funcționează la masă — F1 până la F4 pentru Fold, Check/Call, Bet/Raise și All-In, F5 ca să-ți arăți cărțile, F6 până la F8 pentru modurile de joc — iar clientul web adaugă litere simple (F, C, R, A, și 1, 2, 3 pentru o treime din pot, jumătate din pot sau tot potul), toate putând fi reatribuite. Escape închide fereastra de deasupra, Tab și săgețile parcurg lista de mese din lobby, iar Alt+S deschide setările de oriunde.",
    "padH2": "Gamepad și telecomandă TV",
    "padP": "Un controler de joc — Xbox, PlayStation, Switch Pro și majoritatea gamepadurilor Bluetooth — joacă tot jocul: butoane pentru fiecare acțiune, trăgaciuri pentru a stabili miza și un mod de navigare pentru a te deplasa prin ecrane, chat și meniuri. Vibrează când îți vine rândul. Pe Android TV și Google TV telecomanda funcționează la fel, iar telecomenzile cu cele patru taste colorate le folosesc pentru Fold, Check/Call, Bet/Raise și All-In.",
    "hearH2": "Să auzi și să simți jocul",
    "hearP": "Anunțurile vocale citesc cu voce tare evenimentele jocului cu vocile propriului dispozitiv, în limba ta acolo unde sistemul are una. Pe telefoanele Android, o vibrație scurtă îți marchează rândul. Sunetele jocului sunt împărțite în patru grupuri — acțiuni, chat, notificări de rețea și creșterea blindurilor — care pot fi pornite sau oprite separat, cu un singur cursor de volum.",
    "calmH2": "Mai puține surprize",
    "calmP": "Când sistemul tău cere mișcare redusă, clientul își atenuează animațiile. Protecția anti-tras cu ochiul îți ține cărțile acoperite până le atingi, iar protecția anti-Call accidental blochează pentru o clipă butonul Call imediat după o mărire mare, ca o atingere destinată unui Call mai mic să nu poată plăti din greșeală suma mărită.",
    "langH2": "În limba ta, cu un ghid",
    "langP": "Interfața este disponibilă în {langs} de limbi, de la dreapta la stânga acolo unde e nevoie. Ajutorul Asului, mascota clientului web, îți explică fiecare ecran pe măsură ce avansezi, dacă vrei, iar „Ce e asta?” îți spune ce face orice element de pe ecran.",
    "faqH2": "Întrebări",
    "faq": [
      [
        "Pot mări cărțile și textul?",
        "Da. Alege Mare sau Foarte mare în fereastra Accesibilitate; cărțile, textul și butoanele cresc împreună pe fiecare ecran, inclusiv la masă."
      ],
      [
        "Există un mod cu contrast ridicat?",
        "Da, în fereastra Accesibilitate. Funcționează cu orice dimensiune a interfeței."
      ],
      [
        "Pot juca fără mouse sau ecran tactil?",
        "Da, în întregime cu tastatura, cu un gamepad sau cu o telecomandă Android TV."
      ],
      [
        "Funcționează cu un cititor de ecran?",
        "Nu complet, încă. Anunțurile vocale citesc cu voce tare evenimentele jocului, iar meniurile au etichete, dar masa de poker în sine este o interfață vizuală și încă nu poate fi jucată doar cu un cititor de ecran."
      ],
      [
        "Este gratuit?",
        "Da. PokerTH este software gratuit și open source, fără reclame și fără achiziții în aplicație; toate jetoanele sunt bani de joc."
      ]
    ]
  },
  ru: {
    "title": "Доступный покер — крупный шрифт, клавиатура, геймпад | PokerTH",
    "desc": "Бесплатный Texas Hold’em с крупным текстом, высокой контрастностью, колодами 4 цветов, лупой, голосовыми объявлениями и управлением с клавиатуры, геймпада и пульта ТВ.",
    "ldHeadline": "Доступный онлайн-покер: крупный текст, высокая контрастность, клавиатура и геймпад",
    "ldDesc": "Специальные возможности веб-клиента PokerTH: размер интерфейса, высокая контрастность, колоды 4 цветов, лупа, голосовые объявления, клавиатура, геймпад и пульт ТВ.",
    "h1": "Доступный покер: играйте по-своему",
    "lead": "PokerTH — это бесплатный Texas Hold’em в браузере, который подстраивается под то, как вы видите и играете: крупнее текст и кнопки, сильнее контраст, колоды, где масти различаются цветом, лупа для маленьких экранов, голосовые объявления и полное управление с клавиатуры, геймпада или пульта ТВ.",
    "findH2": "Где это найти",
    "findP": "Кнопка «Специальные возможности» — значок человечка вверху каждого экрана, от экрана входа до стола, — в любой момент открывает основные настройки, даже посреди раздачи. Всё остальное — в Расширенных настройках. Ваш выбор запоминается на устройстве, а при входе с аккаунтом pokerth.net переходит вместе с вами на другие ваши устройства.",
    "seeH2": "Видеть стол",
    "see": [
      [
        "Размер интерфейса",
        "Стандартный, Большой или Очень большой: текст, карты, фишки и кнопки увеличиваются вместе — на экране входа, в лобби и за столом, — а раскладка перестраивается, чтобы оставаться удобной на телефоне."
      ],
      [
        "Высокая контрастность",
        "Более контрастная палитра во всём интерфейсе, от меню до стола, при любом размере интерфейса."
      ],
      [
        "Колоды 4 цветов",
        "Колоды, в которых у каждой масти свой цвет, так что черви и бубны или пики и трефы никогда не приходится различать только по форме. Выберите колоду в Расширенные настройки → Стиль."
      ],
      [
        "Лупа для стола",
        "На телефоне стол увеличивается вдвое и сдвигается пальцем; когда наступает ваш ход, вид возвращается к вашему месту. Можно также разрешить масштабирование браузера щипком."
      ],
      [
        "Светлый, тёмный или автоматический режим",
        "Весь клиент следует вашему выбору или выбору системы, с темами, колодами и цветами стола, удобными для ваших глаз."
      ]
    ],
    "keysH2": "Клавиатура",
    "keysP": "У каждого действия есть своя клавиша. Официальные функциональные клавиши PokerTH работают за столом — F1–F4 для Fold, Check/Call, Bet/Raise и All-In, F5, чтобы показать свои карты, F6–F8 для режимов игры, — а веб-клиент добавляет одиночные буквы (F, C, R, A, а также 1, 2, 3 для трети банка, половины банка или всего банка), и все их можно переназначить. Escape закрывает верхнее окно, Tab и стрелки перемещают по списку столов в лобби, а Alt+S открывает настройки откуда угодно.",
    "padH2": "Геймпад и пульт ТВ",
    "padP": "Игровой контроллер — Xbox, PlayStation, Switch Pro и большинство Bluetooth-геймпадов — управляет всей игрой: кнопки для каждого действия, триггеры для выбора ставки и режим навигации для перемещения по экранам, чату и меню. Он вибрирует, когда наступает ваш ход. На Android TV и Google TV пульт работает так же, а пульты с четырьмя цветными кнопками используют их для Fold, Check/Call, Bet/Raise и All-In.",
    "hearH2": "Слышать и чувствовать игру",
    "hearP": "Голосовые объявления читают вслух события игры голосами вашего устройства — на вашем языке, если он есть в системе. На телефонах Android короткая вибрация отмечает ваш ход. Звуки игры делятся на четыре группы — действия, чат, сетевые уведомления и повышение блайндов, — которые включаются и выключаются отдельно, с одним ползунком громкости.",
    "calmH2": "Меньше неожиданностей",
    "calmP": "Когда система просит уменьшить движение, клиент приглушает анимации. Защита от подглядывания держит ваши карты закрытыми, пока вы их не коснётесь, а защита от случайного Call ненадолго блокирует кнопку Call сразу после крупного повышения, чтобы касание, предназначенное для меньшего Call, не оплатило по ошибке повышенную сумму.",
    "langH2": "На вашем языке, с гидом",
    "langP": "Интерфейс доступен на {langs} языках, при необходимости — справа налево. Если хотите, туз — талисман веб-клиента — в режиме «Помощь туза» объясняет каждый экран по ходу дела, а «Что это?» подскажет, что делает любой элемент на экране.",
    "faqH2": "Вопросы",
    "faq": [
      [
        "Можно ли увеличить карты и текст?",
        "Да. Выберите Большой или Очень большой в окне «Специальные возможности»; карты, текст и кнопки увеличиваются вместе на каждом экране, включая стол."
      ],
      [
        "Есть ли режим высокой контрастности?",
        "Да, в окне «Специальные возможности». Он работает при любом размере интерфейса."
      ],
      [
        "Можно ли играть без мыши и сенсорного экрана?",
        "Да, полностью с клавиатуры, с геймпада или с пульта Android TV."
      ],
      [
        "Работает ли он со скринридером?",
        "Пока не полностью. Голосовые объявления читают события игры вслух, а у меню есть подписи, но сам покерный стол — визуальный интерфейс, и играть за ним только со скринридером пока нельзя."
      ],
      [
        "Это бесплатно?",
        "Да. PokerTH — бесплатная программа с открытым исходным кодом, без рекламы и встроенных покупок; все фишки игровые."
      ]
    ]
  },
  si: {
    "title": "ප්‍රවේශ්‍ය පෝකර් — විශාල අකුරු, යතුරුපුවරුව, ගේම්පෑඩ් | PokerTH",
    "desc": "විශාල අකුරු, ඉහළ ප්‍රතිවිරෝධය, වර්ණ 4 කාඩ් කට්ටල, මේස විශාලකය, හඬ නිවේදන සහ යතුරුපුවරුව, ගේම්පෑඩ් හා TV දුරස්ථ පාලකයෙන් පූර්ණ පාලනය සහිත නොමිලේ Texas Hold’em.",
    "ldHeadline": "ප්‍රවේශ්‍ය ඔන්ලයින් පෝකර්: විශාල අකුරු, ඉහළ ප්‍රතිවිරෝධය, යතුරුපුවරුව සහ ගේම්පෑඩ්",
    "ldDesc": "PokerTH වෙබ් සේවාලාභියේ ප්‍රවේශ්‍යතා විශේෂාංග: අතුරුමුහුණතේ ප්‍රමාණය, ඉහළ ප්‍රතිවිරෝධය, වර්ණ 4 කාඩ් කට්ටල, විශාලකය, හඬ නිවේදන, යතුරුපුවරුව, ගේම්පෑඩ් සහ TV දුරස්ථ පාලකය.",
    "h1": "ප්‍රවේශ්‍ය පෝකර්: ඔබට ගැළපෙන ලෙස ක්‍රීඩා කරන්න",
    "lead": "PokerTH යනු බ්‍රවුසරයේ ක්‍රීඩා කරන නොමිලේ Texas Hold’em වන අතර, එය ඔබ දකින හා ක්‍රීඩා කරන ආකාරයට ගැළපේ: විශාල අකුරු සහ බොත්තම්, වඩා ප්‍රබල ප්‍රතිවිරෝධය, කාඩ් වර්ග වර්ණයෙන් වෙන්කර හඳුනාගත හැකි කාඩ් කට්ටල, කුඩා තිර සඳහා විශාලකයක්, හඬ නිවේදන, සහ යතුරුපුවරුවෙන්, ගේම්පෑඩ් එකකින් හෝ TV දුරස්ථ පාලකයකින් සම්පූර්ණ පාලනය.",
    "findH2": "එය සොයාගත හැකි තැන",
    "findP": "ප්‍රවේශ්‍යතාව බොත්තම — පිවිසුම් තිරයේ සිට මේසය දක්වා සෑම තිරයකම ඉහළින් ඇති පුද්ගල අයිකනය — ඕනෑම වේලාවක, අතක් මැද වුවද, ප්‍රධාන සැකසුම් විවෘත කරයි. අනෙක් සියල්ල උසස් විකල්ප තුළ ඇත. ඔබේ තේරීම් උපාංගයේ මතක තබාගන්නා අතර, pokerth.net ගිණුමකින් පිවිසෙන විට ඒවා ඔබේ අනෙක් උපාංග වෙතද ඔබ සමඟ පැමිණේ.",
    "seeH2": "මේසය පැහැදිලිව දැකීම",
    "see": [
      [
        "අතුරුමුහුණතේ ප්‍රමාණය",
        "සම්මත, විශාල හෝ ඉතා විශාල: අකුරු, කාඩ්, චිප් සහ බොත්තම් එකට විශාල වේ — පිවිසුම් තිරයේ, ලොබියේ සහ මේසයේ — සහ දුරකථනයකද භාවිතයට පහසු ලෙස පිරිසැලසුම නැවත සකස් වේ."
      ],
      [
        "ඉහළ ප්‍රතිවිරෝධය",
        "මෙනුවල සිට මේසය දක්වා සම්පූර්ණ අතුරුමුහුණත පුරා වඩා ප්‍රබල ප්‍රතිවිරෝධයක් සහිත වර්ණ තලයක්, සෑම අතුරුමුහුණත් ප්‍රමාණයකදීම."
      ],
      [
        "වර්ණ 4 කාඩ් කට්ටල",
        "සෑම කාඩ් වර්ගයකටම තමන්ගේම වර්ණයක් දෙන කාඩ් කට්ටල; එබැවින් හාට් සහ ඩයමන්ඩ්, හෝ ස්පේඩ් සහ ක්ලබ්, කිසිවිටෙක හැඩයෙන් පමණක් වෙන්කර හඳුනාගත යුතු නැත. උසස් විකල්ප → ශෛලිය තුළ එකක් තෝරන්න."
      ],
      [
        "මේස විශාලකය",
        "දුරකථනයක, මේසය දෙගුණයක් විශාල වී ඇඟිල්ලකින් එහා මෙහා ගෙනයා හැක; ඔබේ වාරය පැමිණි විට දසුන ඔබේ ආසනයට ආපසු පැමිණේ. බ්‍රවුසරයේ pinch-zoom සඳහාද ඉඩ දිය හැක."
      ],
      [
        "ආලෝකමත්, අඳුරු හෝ ස්වයංක්‍රීය",
        "සම්පූර්ණ සේවාලාභියාම ඔබේ හෝ ඔබේ පද්ධතියේ තේරීම අනුගමනය කරයි, ඔබේ ඇස්වලට ගැළපෙන තේමා, කාඩ් කට්ටල සහ මේස වර්ණ සමඟ."
      ]
    ],
    "keysH2": "යතුරුපුවරුව",
    "keysP": "සෑම ක්‍රියාවකටම යතුරක් ඇත. නිල PokerTH ක්‍රියාකාරී යතුරු මේසයේදී ක්‍රියා කරයි — Fold, Check/Call, Bet/Raise සහ All-In සඳහා F1 සිට F4, ඔබේ කාඩ් පෙන්වීමට F5, ක්‍රීඩා ප්‍රකාර සඳහා F6 සිට F8 — සහ වෙබ් සේවාලාභියා තනි අකුරු එක් කරයි (F, C, R, A, සහ පොට් එකෙන් තුනෙන් එකක්, පොට් එකෙන් අඩක් හෝ සම්පූර්ණ පොට් එක සඳහා 1, 2, 3), ඒ සියල්ල නැවත පැවරිය හැක. Escape ඉහළම කවුළුව වසයි, Tab සහ ඊතල යතුරු ලොබියේ මේස ලැයිස්තුව හරහා ගමන් කරයි, සහ Alt+S ඕනෑම තැනක සිට සැකසුම් විවෘත කරයි.",
    "padH2": "ගේම්පෑඩ් සහ TV දුරස්ථ පාලකය",
    "padP": "ක්‍රීඩා පාලකයකින් — Xbox, PlayStation, Switch Pro සහ බොහෝ Bluetooth පෑඩ් — සම්පූර්ණ ක්‍රීඩාවම ක්‍රීඩා කළ හැක: සෑම ක්‍රියාවකටම බොත්තම්, ඔට්ටුව සැකසීමට ට්‍රිගර්, සහ තිර, චැට් සහ මෙනු හරහා ගමන් කිරීමට සංචලන ප්‍රකාරයක්. ඔබේ වාරය පැමිණි විට එය කම්පනය වේ. Android TV සහ Google TV මත දුරස්ථ පාලකයද එලෙසම ක්‍රියා කරන අතර, වර්ණ යතුරු හතර ඇති දුරස්ථ පාලක ඒවා Fold, Check/Call, Bet/Raise සහ All-In සඳහා භාවිත කරයි.",
    "hearH2": "ක්‍රීඩාව ඇසීම සහ දැනීම",
    "hearP": "හඬ නිවේදන ඔබේ උපාංගයේම හඬවලින් ක්‍රීඩා සිදුවීම් හඬ නගා කියවයි, පද්ධතියේ ඔබේ භාෂාවෙන් හඬක් ඇත්නම් එම භාෂාවෙන්. Android දුරකථනවල කෙටි කම්පනයක් ඔබේ වාරය සලකුණු කරයි. ක්‍රීඩා ශබ්ද කාණ්ඩ හතරකට බෙදී ඇත — ක්‍රියා, චැට්, ජාල දැනුම්දීම් සහ බ්ලයින්ඩ් ඉහළ නැංවීම් — ඒවා වෙන වෙනම සක්‍රිය හෝ අක්‍රිය කළ හැකි අතර, එක් හඬ පරිමා ස්ලයිඩරයක් ඇත.",
    "calmH2": "අනපේක්ෂිත දේ අඩුවෙන්",
    "calmP": "ඔබේ පද්ධතිය අඩු චලනයක් ඉල්ලන විට, සේවාලාභියා එහි සජීවිකරණ මෘදු කරයි. එබී බැලීම් විරෝධී ආරක්ෂාව ඔබ තට්ටු කරන තුරු ඔබේම කාඩ් සඟවා තබයි, සහ අහම්බෙන් Call වීමේ ආරක්ෂකය විශාල Raise එකකට පසු වහාම Call බොත්තම මොහොතකට අවහිර කරයි; එවිට කුඩා Call එකක් සඳහා කළ තට්ටුවකින් වැඩි කළ මුදල අහම්බෙන් ගෙවිය නොහැක.",
    "langH2": "ඔබේ භාෂාවෙන්, මඟපෙන්වන්නෙකු සමඟ",
    "langP": "අතුරුමුහුණත භාෂා {langs}කින් ලබාගත හැකි අතර, අවශ්‍ය තැන්වල දකුණේ සිට වමට පෙන්වයි. ඒස්ගේ උදව් — වෙබ් සේවාලාභියේ සුරතලා වන ඒස් — ඔබ කැමති නම් ඔබ ඉදිරියට යන විට සෑම තිරයක්ම පැහැදිලි කරයි, සහ “මේ මොකක්ද?” තිරයේ ඕනෑම දෙයක් කරන්නේ කුමක්දැයි ඔබට කියයි.",
    "faqH2": "ප්‍රශ්න",
    "faq": [
      [
        "මට කාඩ් සහ අකුරු විශාල කළ හැකිද?",
        "ඔව්. ප්‍රවේශ්‍යතාව කවුළුවේ විශාල හෝ ඉතා විශාල තෝරන්න; මේසය ඇතුළුව සෑම තිරයකම කාඩ්, අකුරු සහ බොත්තම් එකට විශාල වේ."
      ],
      [
        "ඉහළ ප්‍රතිවිරෝධ ප්‍රකාරයක් තිබේද?",
        "ඔව්, ප්‍රවේශ්‍යතාව කවුළුවේ. එය සෑම අතුරුමුහුණත් ප්‍රමාණයක් සමඟම ක්‍රියා කරයි."
      ],
      [
        "මූසිකයක් හෝ ස්පර්ශ තිරයක් නොමැතිව ක්‍රීඩා කළ හැකිද?",
        "ඔව්, සම්පූර්ණයෙන්ම යතුරුපුවරුවෙන්, ගේම්පෑඩ් එකකින් හෝ Android TV දුරස්ථ පාලකයකින්."
      ],
      [
        "එය තිර කියවනයක් සමඟ ක්‍රියා කරයිද?",
        "තවමත් සම්පූර්ණයෙන් නොවේ. හඬ නිවේදන ක්‍රීඩා සිදුවීම් හඬ නගා කියවන අතර මෙනුවලට ලේබල ඇත, නමුත් පෝකර් මේසයම දෘශ්‍ය අතුරුමුහුණතක් වන අතර තවමත් තිර කියවනයකින් පමණක් ක්‍රීඩා කළ නොහැක."
      ],
      [
        "එය නොමිලේද?",
        "ඔව්. PokerTH යනු දැන්වීම් සහ යෙදුම තුළ මිලදී ගැනීම් නොමැති නොමිලේ, විවෘත මූලාශ්‍ර මෘදුකාංගයකි; සියලුම චිප් ක්‍රීඩා මුදල් වේ."
      ]
    ]
  },
  sk: {
    "title": "Prístupný poker — veľké písmo, klávesnica, gamepad | PokerTH",
    "desc": "Texas Hold’em zadarmo: väčšie písmo, vysoký kontrast, štvorfarebné balíčky, lupa stola, hlasové oznámenia a plné ovládanie z klávesnice, gamepadu aj ovládača TV.",
    "ldHeadline": "Prístupný online poker: veľké písmo, vysoký kontrast, klávesnica a gamepad",
    "ldDesc": "Funkcie prístupnosti webového klienta PokerTH: veľkosť rozhrania, vysoký kontrast, štvorfarebné balíčky, lupa, hlasové oznámenia, klávesnica, gamepad a diaľkový ovládač TV.",
    "h1": "Prístupný poker: hrajte po svojom",
    "lead": "PokerTH je Texas Hold’em zadarmo v prehliadači a prispôsobí sa tomu, ako vidíte a hráte: väčšie písmo a tlačidlá, silnejší kontrast, balíčky, v ktorých má každá farba kariet vlastný odtieň, lupa pre malé obrazovky, hlasové oznámenia a úplné ovládanie z klávesnice, gamepadu alebo diaľkového ovládača TV.",
    "findH2": "Kde to nájdete",
    "findP": "Tlačidlo Prístupnosť — ikona postavičky hore na každej obrazovke, od prihlasovacej obrazovky až po stôl — kedykoľvek otvorí hlavné nastavenia, aj uprostred ruky. Všetko ostatné je v Pokročilých možnostiach. Vaše voľby si zariadenie zapamätá a keď sa prihlásite účtom pokerth.net, prenesú sa aj na vaše ďalšie zariadenia.",
    "seeH2": "Dobre vidieť stôl",
    "see": [
      [
        "Veľkosť rozhrania",
        "Štandardná, Veľká alebo Veľmi veľká: text, karty, žetóny a tlačidlá rastú spolu, na prihlasovacej obrazovke, v lobby aj pri stole, a rozloženie sa prispôsobí, aby zostalo použiteľné aj na telefóne."
      ],
      [
        "Vysoký kontrast",
        "Paleta so silnejším kontrastom v celom rozhraní, od menu až po stôl, pri každej veľkosti rozhrania."
      ],
      [
        "Štvorfarebné balíčky",
        "Balíčky kariet, v ktorých má každá farba vlastný odtieň, takže srdcia a kára, ani piky a krížiky nikdy nerozlišujete len podľa tvaru. Vyberte si jeden v Pokročilé možnosti → Štýl."
      ],
      [
        "Lupa stola",
        "Na telefóne sa stôl priblíži na dvojnásobok a posúva sa prstom; keď ste na ťahu, pohľad sa vráti k vášmu miestu. Povoliť sa dá aj priblíženie prstami v prehliadači."
      ],
      [
        "Svetlý, tmavý alebo automatický",
        "Celý klient sa riadi vašou voľbou alebo voľbou systému, s motívmi, balíčkami a farbami stola, ktoré vyhovujú vašim očiam."
      ]
    ],
    "keysH2": "Klávesnica",
    "keysP": "Každá akcia má svoj kláves. Oficiálne funkčné klávesy PokerTH fungujú pri stole — F1 až F4 pre Fold, Check/Call, Bet/Raise a All-In, F5 na ukázanie kariet, F6 až F8 pre herné režimy — a webový klient pridáva jednotlivé písmená (F, C, R, A a 1, 2, 3 pre tretinu banku, polovicu banku alebo celý bank), pričom všetky sa dajú premapovať. Esc zatvorí vrchné okno, Tab a šípky sa pohybujú po zozname stolov v lobby a Alt+S otvorí nastavenia odkiaľkoľvek.",
    "padH2": "Gamepad a diaľkový ovládač TV",
    "padP": "Herný ovládač — Xbox, PlayStation, Switch Pro a väčšina Bluetooth ovládačov — zvládne celú hru: tlačidlá pre každú akciu, spúšte na nastavenie stávky a režim Navigácia na pohyb po obrazovkách, chate a menu. Keď prídete na ťah, zavibruje. Na Android TV a Google TV funguje diaľkový ovládač rovnako a ovládače so štyrmi farebnými tlačidlami ich používajú na Fold, Check/Call, Bet/Raise a All-In.",
    "hearH2": "Počuť a cítiť hru",
    "hearP": "Hlasové oznámenia predčítavajú herné udalosti hlasmi vášho zariadenia, vo vašom jazyku, ak ho systém má. Na telefónoch s Androidom označí váš ťah krátka vibrácia. Herné zvuky sú v štyroch skupinách — akcie, chat, sieťové upozornenia a zvyšovanie blindov —, ktoré sa dajú zapnúť alebo vypnúť samostatne, s jedným posuvníkom hlasitosti.",
    "calmH2": "Menej prekvapení",
    "calmP": "Keď váš systém žiada obmedzený pohyb, klient stlmí svoje animácie. Ochrana proti nakúkaniu drží vaše karty zakryté, kým sa ich nedotknete, a poistka proti náhodnému Callu krátko zablokuje tlačidlo Call hneď po veľkom navýšení, aby ťuknutie mierené na menší Call nemohlo omylom zaplatiť navýšenú sumu.",
    "langH2": "Vo vašom jazyku, so sprievodcom",
    "langP": "Rozhranie je dostupné v {langs} jazykoch, podľa potreby aj sprava doľava. S Pomocou od esa vám eso — maskot webového klienta — vysvetlí každú obrazovku priebežne, ak chcete, a „Čo je to?“ vám povie, na čo slúži čokoľvek na obrazovke.",
    "faqH2": "Otázky",
    "faq": [
      [
        "Môžem si zväčšiť karty a text?",
        "Áno. V okne Prístupnosť zvoľte Veľká alebo Veľmi veľká; karty, text a tlačidlá rastú spolu na každej obrazovke vrátane stola."
      ],
      [
        "Je k dispozícii režim vysokého kontrastu?",
        "Áno, v okne Prístupnosť. Funguje pri každej veľkosti rozhrania."
      ],
      [
        "Dá sa hrať bez myši alebo dotykovej obrazovky?",
        "Áno, úplne cez klávesnicu, gamepad alebo diaľkový ovládač Android TV."
      ],
      [
        "Funguje to s čítačkou obrazovky?",
        "Zatiaľ nie úplne. Hlasové oznámenia predčítavajú herné udalosti a menu majú popisy, ale samotný pokrový stôl je vizuálne rozhranie a zatiaľ sa nedá hrať iba s čítačkou obrazovky."
      ],
      [
        "Je to zadarmo?",
        "Áno. PokerTH je bezplatný softvér s otvoreným zdrojovým kódom, bez reklám a bez nákupov v aplikácii; všetky žetóny sú iba herné peniaze."
      ]
    ]
  },
  sl: {
    "title": "Dostopen poker — velika pisava, tipkovnica, plošček | PokerTH",
    "desc": "Brezplačen Texas Hold’em: večje besedilo, visok kontrast, štiribarvni kupčki, povečevalo, glasovna obvestila in igra s tipkovnico, ploščkom ali TV-upravljalnikom.",
    "ldHeadline": "Dostopen spletni poker: velika pisava, visok kontrast, tipkovnica in igralni plošček",
    "ldDesc": "Funkcije dostopnosti spletnega odjemalca PokerTH: velikost vmesnika, visok kontrast, štiribarvni kupčki kart, povečevalo, glasovna obvestila, tipkovnica, igralni plošček in daljinski upravljalnik TV.",
    "h1": "Dostopen poker: igraj po svoje",
    "lead": "PokerTH je brezplačen Texas Hold’em v brskalniku, ki se prilagodi temu, kako vidiš in igraš: večje besedilo in gumbi, močnejši kontrast, kupčki kart, ki barve ločijo tudi z odtenkom, povečevalo za majhne zaslone, glasovna obvestila ter popoln nadzor s tipkovnico, igralnim ploščkom ali daljinskim upravljalnikom TV.",
    "findH2": "Kje to najdeš",
    "findP": "Gumb Dostopnost — ikona osebe na vrhu vsakega zaslona, od prijavnega zaslona do mize — kadar koli odpre glavne nastavitve, tudi sredi roke. Vse drugo je v Naprednih možnostih. Tvoje izbire si naprava zapomni in, ko se prijaviš z računom pokerth.net, te spremljajo tudi na drugih napravah.",
    "seeH2": "Jasen pogled na mizo",
    "see": [
      [
        "Velikost vmesnika",
        "Standardna, Velika ali Zelo velika: besedilo, karte, žetoni in gumbi rastejo skupaj, na prijavnem zaslonu, v preddverju in za mizo, postavitev pa se prerazporedi, da ostane uporabna tudi na telefonu."
      ],
      [
        "Visok kontrast",
        "Bolj kontrastna paleta v celotnem vmesniku, od menijev do mize, pri vsaki velikosti vmesnika."
      ],
      [
        "Štiribarvni kupčki",
        "Kupčki kart, ki vsaki barvi dajo svoj odtenek, tako da srca od karov ali pike od križev nikoli ne ločuješ le po obliki. Izberi enega v Napredne možnosti → Slog."
      ],
      [
        "Povečevalo mize",
        "Na telefonu se miza poveča na dvojno velikost in jo premikaš s prstom; pogled se vrne na tvoje mesto, ko si na potezi. Dovoliš lahko tudi povečavo brskalnika s ščipanjem."
      ],
      [
        "Svetlo, temno ali samodejno",
        "Ves odjemalec sledi tvoji izbiri ali izbiri sistema, s temami, kupčki in barvami mize po meri tvojih oči."
      ]
    ],
    "keysH2": "Tipkovnica",
    "keysP": "Vsaka poteza ima svojo tipko. Uradne funkcijske tipke PokerTH delujejo za mizo — F1 do F4 za Fold, Check/Call, Bet/Raise in All-In, F5 za prikaz tvojih kart, F6 do F8 za načine igranja — spletni odjemalec pa doda posamezne črke (F, C, R, A ter 1, 2, 3 za tretjino banke, pol banke ali celo banko), ki jih lahko vse prerazporediš. Esc zapre zgornje okno, Tab in puščične tipke se premikajo po seznamu miz v preddverju, Alt+S pa od koder koli odpre nastavitve.",
    "padH2": "Igralni plošček in daljinski upravljalnik TV",
    "padP": "Z igralnim ploščkom — Xbox, PlayStation, Switch Pro in večina ploščkov Bluetooth — odigraš celotno igro: gumbi za vsako potezo, sprožilci za nastavitev stave in način Navigacija za premikanje po zaslonih, klepetu in menijih. Ko pride tvoja poteza, zavibrira. Na Android TV in Google TV daljinski upravljalnik deluje enako, upravljalniki s štirimi barvnimi tipkami pa jih uporabijo za Fold, Check/Call, Bet/Raise in All-In.",
    "hearH2": "Slišati in čutiti igro",
    "hearP": "Glasovna obvestila na glas preberejo dogodke igre z lastnimi glasovi tvoje naprave, v tvojem jeziku, če ga sistem ima. Na telefonih Android kratko vibriranje označi tvojo potezo. Zvoki igre so v štirih skupinah — poteze, klepet, omrežna obvestila in zvišanja blindov — ki jih lahko ločeno vklopiš ali izklopiš, z enim drsnikom za glasnost.",
    "calmH2": "Manj presenečenj",
    "calmP": "Ko tvoj sistem zahteva manj gibanja, odjemalec umiri svoje animacije. Zaščita pred pokukanjem skrije tvoje karte, dokler jih ne tapneš, zaščita pred nenamernim klicem pa za kratek čas blokira gumb Call takoj po veliki zvišani stavi, da tap, namenjen manjšemu klicu, po pomoti ne plača zvišanega zneska.",
    "langH2": "V tvojem jeziku, z vodnikom",
    "langP": "Vmesnik je na voljo v {langs} jezikih, kjer je treba, tudi od desne proti levi. Pomoč asa, maskota spletnega odjemalca, ti sproti razloži vsak zaslon, če želiš, „Kaj je to?“ pa ti pove, čemu služi kar koli na zaslonu.",
    "faqH2": "Vprašanja",
    "faq": [
      [
        "Ali lahko povečam karte in besedilo?",
        "Da. V oknu Dostopnost izberi Velika ali Zelo velika; karte, besedilo in gumbi rastejo skupaj na vsakem zaslonu, tudi za mizo."
      ],
      [
        "Ali obstaja način z visokim kontrastom?",
        "Da, v oknu Dostopnost. Deluje pri vsaki velikosti vmesnika."
      ],
      [
        "Ali lahko igram brez miške ali zaslona na dotik?",
        "Da, v celoti s tipkovnico, z igralnim ploščkom ali z daljinskim upravljalnikom Android TV."
      ],
      [
        "Ali deluje z bralnikom zaslona?",
        "Še ne v celoti. Glasovna obvestila na glas preberejo dogodke igre in meniji imajo oznake, vendar je sama poker miza vizualni vmesnik in je še ni mogoče igrati samo z bralnikom zaslona."
      ],
      [
        "Ali je brezplačno?",
        "Da. PokerTH je brezplačna in odprtokodna programska oprema, brez oglasov in nakupov v aplikaciji; vsi žetoni so navidezni denar."
      ]
    ]
  },
  sq: {
    "title": "Poker i aksesueshëm — tekst i madh, tastierë, kontroller | PokerTH",
    "desc": "Texas Hold’em falas me tekst më të madh, kontrast të lartë, deka me katër ngjyra, lupë, njoftime me zë dhe lojë të plotë me tastierë, kontroller ose telekomandë.",
    "ldHeadline": "Poker online i aksesueshëm: tekst i madh, kontrast i lartë, tastierë dhe kontroller",
    "ldDesc": "Veçoritë e aksesueshmërisë së klientit web të PokerTH: madhësia e ndërfaqes, kontrast i lartë, deka me katër ngjyra, lupa, njoftimet me zë, tastiera, kontrolleri i lojës dhe telekomanda e TV-së.",
    "h1": "Poker i aksesueshëm: luaj si të duash",
    "lead": "PokerTH është Texas Hold’em falas në shfletues, dhe përshtatet me mënyrën si sheh dhe luan: tekst e butona më të mëdhenj, kontrast më i fortë, deka që i dallojnë simbolet me ngjyrë, një lupë për ekranet e vogla, njoftime me zë dhe kontroll të plotë nga tastiera, një kontroller loje ose telekomanda e TV-së.",
    "findH2": "Ku ta gjesh",
    "findP": "Butoni Aksesueshmëria — ikona e personit në krye të çdo ekrani, nga ekrani i hyrjes deri te tavolina — hap cilësimet kryesore në çdo kohë, edhe në mes të një dore. Gjithçka tjetër është te Opsionet e avancuara. Zgjedhjet e tua ruhen në pajisje dhe, kur hyn me një llogari pokerth.net, të ndjekin edhe në pajisjet e tjera.",
    "seeH2": "Si e sheh tavolinën",
    "see": [
      [
        "Madhësia e ndërfaqes",
        "Standarde, E madhe ose Shumë e madhe: teksti, letrat, zhetonët dhe butonat rriten bashkë, në ekranin e hyrjes, në lobi dhe te tavolina, dhe faqosja riorganizohet që të mbetet e përdorshme në telefon."
      ],
      [
        "Kontrast i lartë",
        "Një paletë me kontrast më të fortë në gjithë ndërfaqen, nga menytë te tavolina, në çdo madhësi të ndërfaqes."
      ],
      [
        "Deka me katër ngjyra",
        "Deka letrash që i japin çdo simboli ngjyrën e vet, që kupa e karo, ose maç e spathi, të mos dallohen kurrë vetëm nga forma. Zgjidh një te Opsionet e avancuara → Stili."
      ],
      [
        "Lupa e tavolinës",
        "Në telefon, tavolina zmadhohet dyfish dhe lëviz me gisht; pamja kthehet te vendi yt kur vjen radha jote. Mund të lejohet edhe zmadhimi me shtrëngim i shfletuesit."
      ],
      [
        "E çelët, e errët ose automatike",
        "I gjithë klienti ndjek zgjedhjen tënde ose atë të sistemit, me tema, deka dhe ngjyra tavoline që u përshtaten syve të tu."
      ]
    ],
    "keysH2": "Tastiera",
    "keysP": "Çdo veprim ka tastin e vet. Tastet zyrtare të funksioneve të PokerTH punojnë te tavolina — F1 deri F4 për Fold, Check/Call, Bet/Raise dhe All-In, F5 për të treguar letrat e tua, F6 deri F8 për modalitetet e lojës — dhe klienti web shton shkronja të vetme (F, C, R, A, si dhe 1, 2, 3 për një të tretën e potit, gjysmën e potit ose gjithë potin), që të gjitha mund të ri-caktohen. Escape mbyll dritaren më të sipërme, Tab dhe shigjetat lëvizin nëpër listën e tavolinave në lobi, dhe Alt+S hap cilësimet nga kudo.",
    "padH2": "Kontrolleri i lojës dhe telekomanda e TV-së",
    "padP": "Një kontroller loje — Xbox, PlayStation, Switch Pro dhe shumica e kontrollerëve Bluetooth — luan gjithë lojën: butona për çdo veprim, këmbëza për të caktuar bastin, dhe një mënyrë navigimi për të lëvizur nëpër ekrane, bisedë dhe meny. Dridhet kur të vjen radha. Në Android TV dhe Google TV telekomanda punon njësoj, dhe telekomandat me katër tastet me ngjyra i përdorin ato për Fold, Check/Call, Bet/Raise dhe All-In.",
    "hearH2": "Ta dëgjosh dhe ta ndiesh lojën",
    "hearP": "Njoftimet me zë i lexojnë me zë ngjarjet e lojës me zërat e vetë pajisjes tënde, në gjuhën tënde kur sistemi e ka. Në telefonat Android një vibrim i shkurtër shënon radhën tënde. Tingujt e lojës ndahen në katër grupe — veprimet, biseda, njoftimet e rrjetit dhe rritjet e blindeve — që aktivizohen ose çaktivizohen veçmas, me një rrëshqitës të vetëm volumi.",
    "calmH2": "Më pak befasi",
    "calmP": "Kur sistemi yt kërkon lëvizje të reduktuar, klienti i zbut animacionet e veta. Mbrojtja kundër vëzhgimit i mban letrat e tua të fshehta derisa t’i prekësh, dhe mbrojtja e call-it aksidental bllokon shkurtimisht butonin Call menjëherë pas një rritjeje të madhe, që një prekje e menduar për një call më të vogël të mos paguajë gabimisht shumën e rritur.",
    "langH2": "Në gjuhën tënde, me një udhërrëfyes",
    "langP": "Ndërfaqja është e disponueshme në {langs} gjuhë, nga e djathta në të majtë kur duhet. Me Ndihmën e Asit, Asi — maskota e klientit web — ta shpjegon çdo ekran ndërsa ecën, nëse e dëshiron, dhe «Çfarë është kjo?» të tregon çfarë bën çdo gjë në ekran.",
    "faqH2": "Pyetje",
    "faq": [
      [
        "A mund t’i zmadhoj letrat dhe tekstin?",
        "Po. Zgjidh E madhe ose Shumë e madhe te dritarja Aksesueshmëria; letrat, teksti dhe butonat rriten bashkë në çdo ekran, përfshirë tavolinën."
      ],
      [
        "A ka modalitet me kontrast të lartë?",
        "Po, te dritarja Aksesueshmëria. Funksionon me çdo madhësi të ndërfaqes."
      ],
      [
        "A mund të luaj pa maus apo ekran me prekje?",
        "Po, tërësisht me tastierë, me kontroller loje ose me telekomandën e një Android TV."
      ],
      [
        "A funksionon me lexues ekrani?",
        "Jo plotësisht ende. Njoftimet me zë i lexojnë me zë ngjarjet e lojës dhe menytë kanë etiketa, por vetë tavolina e pokerit është një ndërfaqe vizuale dhe ende nuk mund të luhet vetëm me një lexues ekrani."
      ],
      [
        "A është falas?",
        "Po. PokerTH është softuer falas dhe me kod të hapur, pa reklama dhe pa blerje brenda aplikacionit; të gjithë zhetonët janë vetëm para loje."
      ]
    ]
  },
  sr: {
    "title": "Приступачан покер — велика слова, тастатура, гејмпед | PokerTH",
    "desc": "Бесплатан Texas Hold’em са већим словима, високим контрастом, шпиловима у четири боје, лупом за сто, гласовним најавама и игром тастатуром, гејмпедом или ТВ даљинским.",
    "ldHeadline": "Приступачан онлајн покер: велика слова, високи контраст, тастатура и гејмпед",
    "ldDesc": "Функције приступачности веб-клијента PokerTH: величина интерфејса, високи контраст, шпилови у четири боје, лупа, гласовне најаве, тастатура, гејмпед и ТВ даљински.",
    "h1": "Приступачан покер: играјте на свој начин",
    "lead": "PokerTH је бесплатан Texas Hold’em у прегледачу и прилагођава се начину на који видите и играте: већи текст и дугмад, јачи контраст, шпилови који сваком знаку дају посебну боју, лупа за мале екране, гласовне најаве и потпуна контрола тастатуром, гејмпедом или ТВ даљинским.",
    "findH2": "Где се налази",
    "findP": "Дугме Приступачност — иконица особе на врху сваког екрана, од екрана за пријаву до стола — у сваком тренутку отвара главна подешавања, чак и усред руке. Све остало је у Напредним опцијама. Ваши избори се памте на уређају и, када се пријавите налогом са pokerth.net, прате вас и на другим уређајима.",
    "seeH2": "Добро видети сто",
    "see": [
      [
        "Величина интерфејса",
        "Стандардна, Велика или Веома велика: текст, карте, жетони и дугмад расту заједно, на екрану за пријаву, у лобију и за столом, а распоред се прилагођава да би остао употребљив на телефону."
      ],
      [
        "Високи контраст",
        "Палета јачег контраста у целом интерфејсу, од менија до стола, уз сваку величину интерфејса."
      ],
      [
        "Шпилови у четири боје",
        "Шпилови који сваком знаку дају посебну боју, па срце и каро, или пик и треф, никада не морате разликовати само по облику. Изаберите један у Напредне опције → Стил."
      ],
      [
        "Лупа за сто",
        "На телефону се сто увећава на двоструку величину и помера прстом; приказ се враћа на ваше место када сте на потезу. Може се дозволити и зумирање прегледача штипањем."
      ],
      [
        "Светло, тамно или аутоматски",
        "Цео клијент прати ваш избор или избор система, уз теме, шпилове и боје стола по мери ваших очију."
      ]
    ],
    "keysH2": "Тастатура",
    "keysP": "Свака радња има свој тастер. Званични функцијски тастери PokerTH-а раде за столом — F1 до F4 за Fold, Check/Call, Bet/Raise и All-In, F5 за показивање ваших карата, F6 до F8 за режиме играња — а веб-клијент додаје појединачна слова (F, C, R, A, и 1, 2, 3 за трећину пота, пола пота или цео пот), која се сва могу доделити другим тастерима. Esc затвара прозор на врху, Tab и стрелице померају се кроз листу столова у лобију, а Alt+S отвара подешавања одасвуд.",
    "padH2": "Гејмпед и ТВ даљински",
    "padP": "Гејмпедом — Xbox, PlayStation, Switch Pro и већина Bluetooth гејмпедова — игра се цела игра: дугмад за сваку радњу, окидачи за подешавање улога и режим навигације за кретање кроз екране, ћаскање и меније. Завибрира када дођете на потез. На Android TV и Google TV даљински ради на исти начин, а даљински са четири тастера у боји користе их за Fold, Check/Call, Bet/Raise и All-In.",
    "hearH2": "Чути и осетити игру",
    "hearP": "Гласовне најаве наглас читају догађаје у игри гласовима вашег уређаја, на вашем језику где га систем има. На Android телефонима кратка вибрација означава ваш потез. Звуци игре подељени су у четири групе — радње, ћаскање, мрежна обавештења и раст блајндова — које се могу засебно укључити или искључити, уз један клизач за јачину звука.",
    "calmH2": "Мање изненађења",
    "calmP": "Када систем тражи смањено кретање, клијент ублажава своје анимације. Заштита од вирења држи ваше карте затвореним док их не додирнете, а заштита од случајног Call-а накратко закључава дугме Call одмах после великог повишења, тако да додир намењен мањем Call-у не може грешком да плати повишени износ.",
    "langH2": "На вашем језику, уз водича",
    "langP": "Интерфејс је доступан на {langs} језика, здесна налево где је потребно. Помоћ кеца — кец, маскота веб-клијента — објашњава сваки екран док напредујете, ако то желите, а „Шта је ово?“ вам каже чему служи било шта на екрану.",
    "faqH2": "Питања",
    "faq": [
      [
        "Могу ли да повећам карте и текст?",
        "Да. Изаберите Велика или Веома велика у прозору Приступачност; карте, текст и дугмад расту заједно на сваком екрану, укључујући сто."
      ],
      [
        "Постоји ли режим високог контраста?",
        "Да, у прозору Приступачност. Ради уз сваку величину интерфејса."
      ],
      [
        "Могу ли да играм без миша или екрана осетљивог на додир?",
        "Да, у потпуности тастатуром, гејмпедом или даљинским за Android TV."
      ],
      [
        "Да ли ради са читачем екрана?",
        "Још не у потпуности. Гласовне најаве наглас читају догађаје у игри и менији имају ознаке, али сам покер сто је визуелни интерфејс и још се не може играти само уз читач екрана."
      ],
      [
        "Да ли је бесплатно?",
        "Да. PokerTH је бесплатан софтвер отвореног кода, без реклама и без куповина у апликацији; сви жетони су новац за игру."
      ]
    ]
  },
  sv: {
    "title": "Tillgänglig poker — stor text, tangentbord, handkontroll | PokerTH",
    "desc": "Gratis Texas Hold’em med större text, hög kontrast, fyrfärgade kortlekar, bordsförstoring, röstmeddelanden och spel med tangentbord, handkontroll eller TV-fjärrkontroll.",
    "ldHeadline": "Tillgänglig onlinepoker: stor text, hög kontrast, tangentbord och handkontroll",
    "ldDesc": "Tillgänglighetsfunktionerna i PokerTH:s webbklient: gränssnittsstorlek, hög kontrast, fyrfärgade kortlekar, förstoring, röstmeddelanden, tangentbord, handkontroll och TV-fjärrkontroll.",
    "h1": "Tillgänglig poker: spela på ditt sätt",
    "lead": "PokerTH är gratis Texas Hold’em i webbläsaren, och det anpassar sig efter hur du ser och spelar: större text och knappar, starkare kontrast, kortlekar som skiljer färgerna åt med egna färgtoner, förstoring för små skärmar, röstmeddelanden och full kontroll från tangentbord, handkontroll eller TV-fjärrkontroll.",
    "findH2": "Var du hittar det",
    "findP": "Knappen Tillgänglighet — personikonen överst på varje skärm, från inloggningsskärmen till bordet — öppnar huvudinställningarna när som helst, även mitt i en hand. Allt annat finns i Avancerade alternativ. Dina val sparas på enheten och följer med dig till dina andra enheter när du loggar in med ett pokerth.net-konto.",
    "seeH2": "Se bordet tydligt",
    "see": [
      [
        "Gränssnittsstorlek",
        "Standard, Stor eller Extra stor: text, kort, marker och knappar växer tillsammans, på inloggningsskärmen, i lobbyn och vid bordet, och layouten anpassas så att den förblir användbar på en telefon."
      ],
      [
        "Hög kontrast",
        "En palett med starkare kontrast i hela gränssnittet, från menyerna till bordet, i alla gränssnittsstorlekar."
      ],
      [
        "Fyrfärgade kortlekar",
        "Kortlekar som ger varje färg en egen färgton, så att hjärter och ruter, eller spader och klöver, aldrig behöver skiljas åt enbart på formen. Välj en i Avancerade alternativ → Stil."
      ],
      [
        "Bordsförstoring",
        "På en telefon förstoras bordet till dubbel storlek och kan flyttas med fingret; vyn går tillbaka till din plats när det är din tur. Webbläsarens nypzoom kan också tillåtas."
      ],
      [
        "Ljust, mörkt eller automatiskt",
        "Hela klienten följer ditt val eller systemets, med teman, kortlekar och bordsfärger som passar dina ögon."
      ]
    ],
    "keysH2": "Tangentbord",
    "keysP": "Varje handling har en tangent. PokerTH:s officiella funktionstangenter fungerar vid bordet — F1 till F4 för Fold, Check/Call, Bet/Raise och All-In, F5 för att visa dina kort, F6 till F8 för spellägena — och webbklienten lägger till enskilda bokstäver (F, C, R, A samt 1, 2, 3 för en tredjedels pott, halva potten eller hela potten), som alla kan bindas om. Escape stänger det översta fönstret, Tab och piltangenterna flyttar genom lobbyns bordslista och Alt+S öppnar inställningarna varifrån som helst.",
    "padH2": "Handkontroll och TV-fjärrkontroll",
    "padP": "En handkontroll — Xbox, PlayStation, Switch Pro och de flesta Bluetooth-kontroller — spelar hela spelet: knappar för varje handling, avtryckare för att ställa in insatsen och ett navigeringsläge för att röra dig mellan skärmarna, chatten och menyerna. Den vibrerar när det blir din tur. På Android TV och Google TV fungerar fjärrkontrollen på samma sätt, och fjärrkontroller med de fyra färgknapparna använder dem för Fold, Check/Call, Bet/Raise och All-In.",
    "hearH2": "Höra och känna spelet",
    "hearP": "Röstmeddelanden läser upp spelhändelserna med enhetens egna röster, på ditt språk om systemet har en sådan röst. På Android-telefoner markerar en kort vibration din tur. Spelljuden är indelade i fyra grupper — handlingar, chatt, nätverksaviseringar och mörkhöjningar — som kan slås på eller av var för sig, med ett enda volymreglage.",
    "calmH2": "Färre överraskningar",
    "calmP": "När systemet ber om minskad rörelse tonar klienten ner sina animationer. Tjuvkiksskyddet håller dina egna kort dolda tills du trycker på dem, och skyddet mot oavsiktlig Call låser Call-knappen ett kort ögonblick direkt efter en stor höjning, så att en tryckning avsedd för en mindre Call inte råkar betala det höjda beloppet.",
    "langH2": "På ditt språk, med en guide",
    "langP": "Gränssnittet finns på {langs} språk, från höger till vänster där det behövs. Essets hjälp — esset är webbklientens maskot — förklarar varje skärm medan du spelar om du vill, och ”Vad är det här?” berättar vad allt på skärmen gör.",
    "faqH2": "Frågor",
    "faq": [
      [
        "Kan jag göra korten och texten större?",
        "Ja. Välj Stor eller Extra stor i fönstret Tillgänglighet; kort, text och knappar växer tillsammans på alla skärmar, även vid bordet."
      ],
      [
        "Finns det ett läge med hög kontrast?",
        "Ja, i fönstret Tillgänglighet. Det fungerar med alla gränssnittsstorlekar."
      ],
      [
        "Kan jag spela utan mus eller pekskärm?",
        "Ja, helt och hållet med tangentbord, handkontroll eller en Android TV-fjärrkontroll."
      ],
      [
        "Fungerar det med en skärmläsare?",
        "Inte fullt ut ännu. Röstmeddelanden läser upp spelhändelserna och menyerna har etiketter, men själva pokerbordet är ett visuellt gränssnitt och kan ännu inte spelas med enbart en skärmläsare."
      ],
      [
        "Är det gratis?",
        "Ja. PokerTH är gratis programvara med öppen källkod, utan reklam och utan köp i appen; alla marker är låtsaspengar."
      ]
    ]
  },
  sw: {
    "title": "Poka inayofikika — maandishi makubwa, kibodi, kidhibiti | PokerTH",
    "desc": "Texas Hold’em bure: maandishi makubwa, utofautishaji wa juu, deki za rangi 4, kikuza, matangazo ya sauti, na mchezo kamili kwa kibodi, kidhibiti au rimoti ya TV.",
    "ldHeadline": "Poka ya mtandaoni inayofikika: maandishi makubwa, utofautishaji wa juu, kibodi na kidhibiti cha mchezo",
    "ldDesc": "Vipengele vya ufikivu vya mteja wa wavuti wa PokerTH: ukubwa wa kiolesura, utofautishaji wa juu, deki za rangi 4, kikuza, matangazo ya sauti, kibodi, kidhibiti cha mchezo na rimoti ya TV.",
    "h1": "Poka inayofikika: cheza kwa njia yako",
    "lead": "PokerTH ni Texas Hold’em bure kwenye kivinjari, na hujirekebisha kulingana na jinsi unavyoona na kucheza: maandishi na vitufe vikubwa zaidi, utofautishaji imara zaidi, deki zinazotofautisha aina za karata kwa rangi, kikuza kwa skrini ndogo, matangazo ya sauti, na udhibiti kamili kwa kibodi, kidhibiti cha mchezo au rimoti ya TV.",
    "findH2": "Mahali pa kuvipata",
    "findP": "Kitufe cha Ufikivu — aikoni ya mtu iliyo juu ya kila skrini, kuanzia skrini ya kuingia hadi mezani — hufungua mipangilio mikuu wakati wowote, hata katikati ya mkono. Kila kitu kingine kiko kwenye Chaguo za kina. Chaguo zako hukumbukwa kwenye kifaa na, ukiingia kwa akaunti ya pokerth.net, hukufuata kwenye vifaa vyako vingine.",
    "seeH2": "Kuiona meza",
    "see": [
      [
        "Ukubwa wa kiolesura",
        "Kawaida, Kubwa au Kubwa sana: maandishi, karata, chipu na vitufe hukua pamoja, kwenye skrini ya kuingia, ukumbini na mezani, na mpangilio hujipanga upya ili ubaki rahisi kutumia kwenye simu."
      ],
      [
        "Utofautishaji wa juu",
        "Paleti yenye utofautishaji imara zaidi katika kiolesura chote, kuanzia menyu hadi meza, katika kila ukubwa wa kiolesura."
      ],
      [
        "Deki za rangi nne",
        "Deki za karata zinazoipa kila aina rangi yake, ili kopa ♥ na uru ♦, au shupaza ♠ na karanga ♣, zisitofautishwe kamwe kwa umbo pekee. Chagua moja katika Chaguo za kina → Mtindo."
      ],
      [
        "Kikuza meza",
        "Kwenye simu, meza hukuzwa hadi mara mbili ya ukubwa wake na husogezwa kwa kidole; mwonekano hurudi kwenye kiti chako zamu yako inapofika. Kukuza kwa vidole viwili kwenye kivinjari pia kunaweza kuruhusiwa."
      ],
      [
        "Mwanga, giza au otomatiki",
        "Programu yote hufuata chaguo lako au la mfumo wako, ikiwa na mandhari, deki na rangi za meza zinazofaa macho yako."
      ]
    ],
    "keysH2": "Kibodi",
    "keysP": "Kila hatua ina kitufe chake. Vitufe rasmi vya kazi vya PokerTH hufanya kazi mezani — F1 hadi F4 kwa Fold, Check/Call, Bet/Raise na All-In, F5 kuonyesha karata zako, F6 hadi F8 kwa hali za kucheza — na mteja wa wavuti huongeza herufi moja moja (F, C, R, A, na 1, 2, 3 kwa theluthi ya pot, nusu ya pot au pot nzima), na zote zinaweza kupangiwa vitufe vingine. Escape hufunga dirisha lililo juu, Tab na vitufe vya mishale husogea kwenye orodha ya meza za ukumbi, na Alt+S hufungua mipangilio ukiwa popote.",
    "padH2": "Kidhibiti cha mchezo na rimoti ya TV",
    "padP": "Kidhibiti cha mchezo — Xbox, PlayStation, Switch Pro na vidhibiti vingi vya Bluetooth — huendesha mchezo mzima: vitufe kwa kila hatua, vifyatulio vya kuweka dau, na hali ya uelekezaji ya kusogea kwenye skrini, chati na menyu. Hutetemeka zamu yako inapofika. Kwenye Android TV na Google TV rimoti hufanya kazi kwa njia ileile, na rimoti zenye vitufe vinne vya rangi huvitumia kwa Fold, Check/Call, Bet/Raise na All-In.",
    "hearH2": "Kuusikia na kuuhisi mchezo",
    "hearP": "Matangazo ya sauti husoma kwa sauti matukio ya mchezo kwa sauti za kifaa chako chenyewe, kwa lugha yako pale mfumo una sauti ya lugha hiyo. Kwenye simu za Android, mtetemo mfupi huashiria zamu yako. Sauti za mchezo ziko katika makundi manne — hatua, chati, taarifa za mtandao na kupanda kwa dau za kulazimishwa — yanayoweza kuwashwa au kuzimwa kila moja peke yake, kwa kitelezi kimoja cha sauti.",
    "calmH2": "Mishangao michache",
    "calmP": "Mfumo wako unapoomba mwendo uliopunguzwa, programu hupunguza michoro yake inayosonga. Kinga ya kuchungulia huficha karata zako mwenyewe hadi uziguse, na kizuizi cha call ya bahati mbaya huzuia kitufe cha Call kwa muda mfupi mara tu baada ya raise kubwa, ili kugusa kulikokusudiwa call ndogo kusiweze kulipa kiasi kilichopandishwa kwa bahati mbaya.",
    "langH2": "Kwa lugha yako, pamoja na kiongozi",
    "langP": "Kiolesura kinapatikana katika lugha {langs}, kutoka kulia kwenda kushoto inapohitajika. Msaada wa Ekaa, kinyago cha mteja wa wavuti, hueleza kila skrini unapoendelea ukitaka, na “Hiki ni nini?” hukueleza kitu chochote kwenye skrini kinafanya nini.",
    "faqH2": "Maswali",
    "faq": [
      [
        "Je, naweza kuzifanya karata na maandishi kuwa makubwa zaidi?",
        "Ndiyo. Chagua Kubwa au Kubwa sana kwenye dirisha la Ufikivu; karata, maandishi na vitufe hukua pamoja kwenye kila skrini, ikiwemo meza."
      ],
      [
        "Je, kuna hali ya utofautishaji wa juu?",
        "Ndiyo, kwenye dirisha la Ufikivu. Hufanya kazi na kila ukubwa wa kiolesura."
      ],
      [
        "Je, naweza kucheza bila kipanya wala skrini ya kugusa?",
        "Ndiyo, kikamilifu kwa kibodi, kwa kidhibiti cha mchezo au kwa rimoti ya Android TV."
      ],
      [
        "Je, inafanya kazi na kisoma skrini?",
        "Bado si kikamilifu. Matangazo ya sauti husoma kwa sauti matukio ya mchezo na menyu zina lebo, lakini meza ya poka yenyewe ni kiolesura cha kuona na bado haiwezi kuchezwa kwa kisoma skrini pekee."
      ],
      [
        "Je, ni bure?",
        "Ndiyo. PokerTH ni programu bure ya chanzo huria, bila matangazo na bila ununuzi ndani ya programu; chipu zote ni pesa za mchezo."
      ]
    ]
  },
  ta: {
    "title": "அணுகக்கூடிய போக்கர் — பெரிய எழுத்து, விசைப்பலகை, கேம்பேட் | PokerTH",
    "desc": "பெரிய எழுத்து, உயர் மாறுபாடு, 4-நிற சீட்டுக்கட்டுகள், பெரிதாக்கி, குரல் அறிவிப்புகள், விசைப்பலகை, கேம்பேட், டிவி ரிமோட் கட்டுப்பாட்டுடன் இலவச Texas Hold’em.",
    "ldHeadline": "அணுகக்கூடிய ஆன்லைன் போக்கர்: பெரிய எழுத்து, உயர் மாறுபாடு, விசைப்பலகை, கேம்பேட்",
    "ldDesc": "PokerTH வெப் கிளையண்டின் அணுகல்தன்மை வசதிகள்: இடைமுக அளவு, உயர் மாறுபாடு, 4-நிற சீட்டுக்கட்டுகள், பெரிதாக்கி, குரல் அறிவிப்புகள், விசைப்பலகை, கேம்பேட், டிவி ரிமோட்.",
    "h1": "அணுகக்கூடிய போக்கர்: உங்கள் வழியில் விளையாடுங்கள்",
    "lead": "PokerTH என்பது உலாவியில் இலவச Texas Hold’em; நீங்கள் பார்க்கும், விளையாடும் விதத்திற்கு ஏற்ப அது தன்னை மாற்றிக்கொள்கிறது: பெரிய எழுத்தும் பொத்தான்களும், வலுவான மாறுபாடு, சீட்டு வகைகளை நிறத்தால் வேறுபடுத்தும் சீட்டுக்கட்டுகள், சிறிய திரைகளுக்கான பெரிதாக்கி, குரல் அறிவிப்புகள், மேலும் விசைப்பலகை, கேம்பேட் அல்லது டிவி ரிமோட் மூலம் முழுக் கட்டுப்பாடு.",
    "findH2": "எங்கே கண்டுபிடிப்பது",
    "findP": "அணுகல்தன்மை பொத்தான் — உள்நுழைவுத் திரையிலிருந்து மேசை வரை ஒவ்வொரு திரையின் மேலும் உள்ள மனித உருவ ஐகான் — முதன்மை அமைப்புகளை எப்போது வேண்டுமானாலும், ஒரு கையின் நடுவிலும் கூடத் திறக்கும். மற்ற அனைத்தும் மேம்பட்ட விருப்பங்களில் உள்ளன. உங்கள் தேர்வுகள் சாதனத்தில் நினைவில் வைக்கப்படும்; pokerth.net கணக்குடன் உள்நுழைந்தால், அவை உங்கள் மற்ற சாதனங்களுக்கும் உங்களைப் பின்தொடரும்.",
    "seeH2": "மேசையைப் பார்த்தல்",
    "see": [
      [
        "இடைமுக அளவு",
        "இயல்பான, பெரிய அல்லது மிகப் பெரிய: எழுத்து, சீட்டுகள், காசுகள், பொத்தான்கள் அனைத்தும் சேர்ந்து பெரிதாகும் — உள்நுழைவுத் திரையிலும், லாபியிலும், மேசையிலும் — கைபேசியிலும் வசதியாகப் பயன்படுத்தும்படி தளவமைப்பு தன்னைச் சீரமைத்துக்கொள்ளும்."
      ],
      [
        "உயர் மாறுபாடு",
        "மெனுக்களிலிருந்து மேசை வரை முழு இடைமுகத்திலும், எந்த இடைமுக அளவிலும், வலுவான மாறுபாடு கொண்ட வண்ணத்தட்டு."
      ],
      [
        "4-நிற சீட்டுக்கட்டுகள்",
        "ஒவ்வொரு சீட்டு வகைக்கும் தனி நிறம் தரும் சீட்டுக்கட்டுகள்; இதனால் ♥, ♦ அல்லது ♠, ♣ ஆகியவற்றை வடிவத்தை மட்டும் வைத்து ஒருபோதும் வேறுபடுத்த வேண்டியதில்லை. மேம்பட்ட விருப்பங்கள் → பாணி பகுதியில் ஒன்றைத் தேர்ந்தெடுங்கள்."
      ],
      [
        "மேசைப் பெரிதாக்கி",
        "கைபேசியில் மேசை இரு மடங்கு பெரிதாகி விரலால் நகர்த்தலாம்; உங்கள் முறை வரும்போது காட்சி உங்கள் இருக்கைக்குத் திரும்பும். உலாவியின் கிள்ளல் பெரிதாக்கத்தையும் அனுமதிக்கலாம்."
      ],
      [
        "ஒளி, இருள் அல்லது தானியங்கி",
        "முழு கிளையண்டும் உங்கள் தேர்வையோ உங்கள் அமைப்பின் தேர்வையோ பின்பற்றும்; உங்கள் கண்களுக்கு ஏற்ற தோற்றங்கள், சீட்டுக்கட்டுகள், மேசை நிறங்களுடன்."
      ]
    ],
    "keysH2": "விசைப்பலகை",
    "keysP": "ஒவ்வொரு செயலுக்கும் ஒரு விசை உண்டு. அதிகாரப்பூர்வ PokerTH செயல்பாட்டு விசைகள் மேசையில் இயங்கும் — Fold, Check/Call, Bet/Raise, All-In ஆகியவற்றுக்கு F1 முதல் F4, உங்கள் சீட்டுகளைக் காட்ட F5, ஆட்ட முறைகளுக்கு F6 முதல் F8 — வெப் கிளையண்ட் ஒற்றை எழுத்துகளையும் சேர்க்கிறது (F, C, R, A, மேலும் பாட்டின் மூன்றில் ஒரு பங்கு, பாதி பாட் அல்லது முழு பாட்டுக்கு 1, 2, 3); இவை அனைத்தையும் மாற்றியமைக்கலாம். Escape மேலே உள்ள சாளரத்தை மூடும், Tab மற்றும் அம்பு விசைகள் லாபியின் மேசைப் பட்டியலில் நகரும், Alt+S எங்கிருந்தும் அமைப்புகளைத் திறக்கும்.",
    "padH2": "கேம்பேடும் டிவி ரிமோட்டும்",
    "padP": "ஒரு விளையாட்டுக் கட்டுப்படுத்தி — Xbox, PlayStation, Switch Pro மற்றும் பெரும்பாலான Bluetooth கேம்பேடுகள் — முழு ஆட்டத்தையும் விளையாடும்: ஒவ்வொரு செயலுக்கும் பொத்தான்கள், பந்தயத் தொகையை அமைக்க ட்ரிகர்கள், திரைகள், அரட்டை, மெனுக்களில் நகர ஒரு வழிசெலுத்தல் முறைமை. உங்கள் முறை வரும்போது அது அதிரும். Android TV, Google TV-யில் ரிமோட்டும் அதே போல இயங்கும்; நான்கு வண்ண விசைகள் உள்ள ரிமோட்டுகள் அவற்றை Fold, Check/Call, Bet/Raise, All-In ஆகியவற்றுக்குப் பயன்படுத்தும்.",
    "hearH2": "ஆட்டத்தைக் கேட்டல், உணர்தல்",
    "hearP": "குரல் அறிவிப்புகள் உங்கள் சாதனத்தின் சொந்தக் குரல்களில், அமைப்பில் உங்கள் மொழி இருந்தால் அந்த மொழியில், ஆட்ட நிகழ்வுகளை உரக்கப் படிக்கும். Android கைபேசிகளில் ஒரு குறுகிய அதிர்வு உங்கள் முறையைக் குறிக்கும். ஆட்ட ஒலிகள் நான்கு குழுக்களாக உள்ளன — செயல்கள், அரட்டை, வலையமைப்பு அறிவிப்புகள், பிளைண்டு உயர்வுகள் — அவற்றைத் தனித்தனியே இயக்கவோ அணைக்கவோ முடியும், ஒரே ஒலியளவு நழுவியுடன்.",
    "calmH2": "குறைவான திடீர் நிகழ்வுகள்",
    "calmP": "உங்கள் அமைப்பு குறைந்த இயக்கத்தைக் கோரும்போது, கிளையண்ட் தன் அசைவூட்டங்களைக் குறைக்கும். எட்டிப்பார்ப்புப் பாதுகாப்பு நீங்கள் தொடும் வரை உங்கள் சீட்டுகளை மூடியே வைக்கும்; தற்செயல் Call பாதுகாப்பு பெரிய உயர்வுக்குப் பிறகு உடனே Call பொத்தானைச் சிறிது நேரம் பூட்டும், அதனால் சிறிய Call-க்காகச் செய்த தொடுதல் தவறுதலாக உயர்த்தப்பட்ட தொகையைச் செலுத்தாது.",
    "langH2": "உங்கள் மொழியில், ஒரு வழிகாட்டியுடன்",
    "langP": "இடைமுகம் {langs} மொழிகளில் கிடைக்கிறது, தேவையான இடங்களில் வலமிருந்து இடமாக. ஏஸின் உதவி மூலம், வெப் கிளையண்டின் சின்னமான ஏஸ், நீங்கள் விரும்பினால், நீங்கள் முன்னேறும்போது ஒவ்வொரு திரையையும் விளக்கும்; “இது என்ன?” திரையில் உள்ள எதுவும் என்ன செய்கிறது என்று சொல்லும்.",
    "faqH2": "கேள்விகள்",
    "faq": [
      [
        "சீட்டுகளையும் எழுத்தையும் பெரிதாக்க முடியுமா?",
        "ஆம். அணுகல்தன்மை சாளரத்தில் பெரிய அல்லது மிகப் பெரிய என்பதைத் தேர்ந்தெடுங்கள்; மேசை உட்பட ஒவ்வொரு திரையிலும் சீட்டுகள், எழுத்து, பொத்தான்கள் சேர்ந்து பெரிதாகும்."
      ],
      [
        "உயர் மாறுபாடு முறை உள்ளதா?",
        "ஆம், அணுகல்தன்மை சாளரத்தில். இது எந்த இடைமுக அளவுடனும் இயங்கும்."
      ],
      [
        "சுட்டி அல்லது தொடுதிரை இல்லாமல் விளையாட முடியுமா?",
        "ஆம், முழுவதும் விசைப்பலகை, கேம்பேட் அல்லது Android TV ரிமோட் மூலம்."
      ],
      [
        "திரை வாசிப்பானுடன் இது இயங்குமா?",
        "இன்னும் முழுமையாக இல்லை. குரல் அறிவிப்புகள் ஆட்ட நிகழ்வுகளை உரக்கப் படிக்கின்றன, மெனுக்களுக்கு லேபிள்கள் உள்ளன; ஆனால் போக்கர் மேசையே ஒரு காட்சி இடைமுகம், அதைத் திரை வாசிப்பான் மட்டும் கொண்டு இன்னும் விளையாட முடியாது."
      ],
      [
        "இது இலவசமா?",
        "ஆம். PokerTH இலவச, திறந்த மூல மென்பொருள்; விளம்பரங்களோ செயலிக்குள் வாங்குதல்களோ இல்லை; எல்லாக் காசுகளும் விளையாட்டுப் பணமே."
      ]
    ]
  },
  te: {
    "title": "యాక్సెసిబుల్ పోకర్ — పెద్ద అక్షరాలు, కీబోర్డ్, గేమ్‌ప్యాడ్ | PokerTH",
    "desc": "పెద్ద అక్షరాలు, అధిక కాంట్రాస్ట్, 4-రంగుల డెక్‌లు, టేబుల్ భూతద్దం, వాయిస్ ప్రకటనలు, కీబోర్డ్, గేమ్‌ప్యాడ్, టీవీ రిమోట్‌తో పూర్తి నియంత్రణ గల ఉచిత Texas Hold’em.",
    "ldHeadline": "యాక్సెసిబుల్ ఆన్‌లైన్ పోకర్: పెద్ద అక్షరాలు, అధిక కాంట్రాస్ట్, కీబోర్డ్ మరియు గేమ్‌ప్యాడ్",
    "ldDesc": "PokerTH వెబ్ క్లయింట్ యాక్సెసిబిలిటీ ఫీచర్‌లు: ఇంటర్‌ఫేస్ పరిమాణం, అధిక కాంట్రాస్ట్, 4-రంగుల డెక్‌లు, భూతద్దం, వాయిస్ ప్రకటనలు, కీబోర్డ్, గేమ్‌ప్యాడ్ మరియు టీవీ రిమోట్.",
    "h1": "యాక్సెసిబుల్ పోకర్: మీకు నచ్చిన విధంగా ఆడండి",
    "lead": "PokerTH బ్రౌజర్‌లో ఆడే ఉచిత Texas Hold’em, మీరు చూసే, ఆడే విధానానికి ఇది అనుగుణంగా మారుతుంది: పెద్ద అక్షరాలు, బటన్‌లు, బలమైన కాంట్రాస్ట్, సూట్‌లను రంగుతో వేరుచేసే డెక్‌లు, చిన్న స్క్రీన్‌ల కోసం భూతద్దం, వాయిస్ ప్రకటనలు, కీబోర్డ్, గేమ్‌ప్యాడ్ లేదా టీవీ రిమోట్‌తో పూర్తి నియంత్రణ.",
    "findH2": "ఎక్కడ దొరుకుతుంది",
    "findP": "యాక్సెసిబిలిటీ బటన్ — లాగిన్ స్క్రీన్ నుంచి టేబుల్ వరకు ప్రతి స్క్రీన్ పైభాగంలో ఉన్న వ్యక్తి ఐకాన్ — హ్యాండ్ మధ్యలో కూడా, ఎప్పుడైనా ప్రధాన సెట్టింగ్‌లను తెరుస్తుంది. మిగతావన్నీ అధునాతన ఎంపికలలో ఉన్నాయి. మీ ఎంపికలు పరికరంలో గుర్తుంచుకోబడతాయి, pokerth.net ఖాతాతో లాగిన్ అయినప్పుడు మీ ఇతర పరికరాలకూ మీతో పాటు వస్తాయి.",
    "seeH2": "టేబుల్‌ను స్పష్టంగా చూడటం",
    "see": [
      [
        "ఇంటర్‌ఫేస్ పరిమాణం",
        "ప్రామాణికం, పెద్దది లేదా అతి పెద్దది: అక్షరాలు, కార్డులు, చిప్స్, బటన్‌లు కలిసి పెద్దవవుతాయి — లాగిన్ స్క్రీన్‌లో, లాబీలో, టేబుల్ వద్ద — ఫోన్‌లో కూడా వాడుకోవడానికి వీలుగా లేఅవుట్ తిరిగి అమరుతుంది."
      ],
      [
        "అధిక కాంట్రాస్ట్",
        "మెనూల నుంచి టేబుల్ వరకు మొత్తం ఇంటర్‌ఫేస్‌లో మరింత బలమైన కాంట్రాస్ట్ ఉన్న రంగుల ప్యాలెట్, ప్రతి ఇంటర్‌ఫేస్ పరిమాణంలోనూ."
      ],
      [
        "4-రంగుల డెక్‌లు",
        "ప్రతి సూట్‌కు దాని సొంత రంగు ఇచ్చే కార్డ్ డెక్‌లు, కాబట్టి హార్ట్స్ మరియు డైమండ్స్‌ను, లేదా స్పేడ్స్ మరియు క్లబ్స్‌ను ఎప్పుడూ ఆకారంతో మాత్రమే గుర్తించాల్సిన అవసరం లేదు. అధునాతన ఎంపికలు → శైలి లో ఒకదాన్ని ఎంచుకోండి."
      ],
      [
        "టేబుల్ భూతద్దం",
        "ఫోన్‌లో టేబుల్ రెండు రెట్లు పెద్దదవుతుంది, వేలితో జరపవచ్చు; మీ వంతు వచ్చినప్పుడు వీక్షణ మీ సీటు వద్దకు తిరిగి వస్తుంది. బ్రౌజర్ పించ్-జూమ్‌ను కూడా అనుమతించవచ్చు."
      ],
      [
        "లైట్, డార్క్ లేదా స్వయంచాలకం",
        "మొత్తం క్లయింట్ మీ ఎంపికను లేదా మీ సిస్టమ్ ఎంపికను అనుసరిస్తుంది, మీ కళ్లకు సరిపడే థీమ్‌లు, డెక్‌లు, టేబుల్ రంగులతో."
      ]
    ],
    "keysH2": "కీబోర్డ్",
    "keysP": "ప్రతి చర్యకు ఒక కీ ఉంది. అధికారిక PokerTH ఫంక్షన్ కీలు టేబుల్ వద్ద పనిచేస్తాయి — Fold, Check/Call, Bet/Raise, All-In కోసం F1 నుంచి F4, మీ కార్డులు చూపించడానికి F5, ఆట మోడ్‌ల కోసం F6 నుంచి F8 — వెబ్ క్లయింట్ ఒక్కో అక్షరం కీలను జోడిస్తుంది (F, C, R, A, అలాగే పాట్‌లో మూడో వంతు, సగం పాట్ లేదా పూర్తి పాట్ కోసం 1, 2, 3), వీటన్నింటినీ మళ్లీ కేటాయించవచ్చు. Escape పైన ఉన్న విండోను మూసివేస్తుంది, Tab మరియు బాణం కీలు లాబీలోని టేబుల్ జాబితాలో కదులుతాయి, Alt+S ఎక్కడి నుంచైనా సెట్టింగ్‌లను తెరుస్తుంది.",
    "padH2": "గేమ్‌ప్యాడ్ మరియు టీవీ రిమోట్",
    "padP": "గేమ్ కంట్రోలర్‌తో — Xbox, PlayStation, Switch Pro మరియు చాలా Bluetooth ప్యాడ్‌లు — మొత్తం ఆటను ఆడవచ్చు: ప్రతి చర్యకు బటన్‌లు, బెట్ మొత్తాన్ని సెట్ చేయడానికి ట్రిగ్గర్‌లు, స్క్రీన్‌లు, చాట్, మెనూల గుండా కదలడానికి నావిగేషన్ మోడ్. మీ వంతు వచ్చినప్పుడు అది వైబ్రేట్ అవుతుంది. Android TV మరియు Google TV లో రిమోట్ కూడా అదే విధంగా పనిచేస్తుంది, నాలుగు రంగుల కీలు ఉన్న రిమోట్‌లు వాటిని Fold, Check/Call, Bet/Raise, All-In కోసం వాడతాయి.",
    "hearH2": "ఆటను వినడం, అనుభూతి చెందడం",
    "hearP": "వాయిస్ ప్రకటనలు మీ పరికరం సొంత గొంతులతో ఆట సంఘటనలను చదివి వినిపిస్తాయి, సిస్టమ్‌లో మీ భాష గొంతు ఉంటే మీ భాషలోనే. Android ఫోన్‌లలో ఒక చిన్న వైబ్రేషన్ మీ వంతును సూచిస్తుంది. ఆట ధ్వనులు నాలుగు సమూహాలుగా ఉంటాయి — చర్యలు, చాట్, నెట్‌వర్క్ నోటిఫికేషన్‌లు, బ్లైండ్ పెంపులు — వాటిని విడివిడిగా ఆన్ లేదా ఆఫ్ చేయవచ్చు, ఒకే వాల్యూమ్ స్లైడర్‌తో.",
    "calmH2": "తక్కువ ఆశ్చర్యాలు",
    "calmP": "మీ సిస్టమ్ తగ్గిన కదలికను కోరినప్పుడు, క్లయింట్ తన యానిమేషన్‌లను తగ్గిస్తుంది. తొంగిచూపు నిరోధం మీరు నొక్కే వరకు మీ సొంత కార్డులను దాచి ఉంచుతుంది, పొరపాటు Call రక్షణ పెద్ద Raise వచ్చిన వెంటనే Call బటన్‌ను కొద్దిసేపు బ్లాక్ చేస్తుంది, తద్వారా చిన్న Call కోసం ఉద్దేశించిన ట్యాప్ పొరపాటున పెరిగిన మొత్తాన్ని చెల్లించదు.",
    "langH2": "మీ భాషలో, ఒక గైడ్‌తో",
    "langP": "ఇంటర్‌ఫేస్ {langs} భాషల్లో అందుబాటులో ఉంది, అవసరమైన చోట కుడి నుంచి ఎడమకు. ఏస్ సహాయం — వెబ్ క్లయింట్ మస్కట్ అయిన ఏస్ — మీరు కోరుకుంటే మీరు ముందుకు సాగుతున్న కొద్దీ ప్రతి స్క్రీన్‌ను వివరిస్తుంది, “ఇది ఏమిటి?” స్క్రీన్‌పై ఏది ఏమి చేస్తుందో మీకు చెబుతుంది.",
    "faqH2": "ప్రశ్నలు",
    "faq": [
      [
        "కార్డులు, అక్షరాలను పెద్దవి చేయవచ్చా?",
        "అవును. యాక్సెసిబిలిటీ విండోలో పెద్దది లేదా అతి పెద్దది ఎంచుకోండి; టేబుల్‌తో సహా ప్రతి స్క్రీన్‌లో కార్డులు, అక్షరాలు, బటన్‌లు కలిసి పెద్దవవుతాయి."
      ],
      [
        "అధిక కాంట్రాస్ట్ మోడ్ ఉందా?",
        "అవును, యాక్సెసిబిలిటీ విండోలో. ఇది ప్రతి ఇంటర్‌ఫేస్ పరిమాణంతోనూ పనిచేస్తుంది."
      ],
      [
        "మౌస్ లేదా టచ్ స్క్రీన్ లేకుండా ఆడవచ్చా?",
        "అవును, పూర్తిగా కీబోర్డ్‌తో, గేమ్‌ప్యాడ్‌తో లేదా Android TV రిమోట్‌తో."
      ],
      [
        "ఇది స్క్రీన్ రీడర్‌తో పనిచేస్తుందా?",
        "ఇంకా పూర్తిగా కాదు. వాయిస్ ప్రకటనలు ఆట సంఘటనలను చదివి వినిపిస్తాయి, మెనూలకు లేబుల్‌లు ఉన్నాయి, కానీ పోకర్ టేబుల్ స్వయంగా దృశ్య ఇంటర్‌ఫేస్, దీన్ని ఇంకా స్క్రీన్ రీడర్‌తో మాత్రమే ఆడలేరు."
      ],
      [
        "ఇది ఉచితమా?",
        "అవును. PokerTH ప్రకటనలు, యాప్‌లో కొనుగోళ్లు లేని ఉచిత, ఓపెన్-సోర్స్ సాఫ్ట్‌వేర్; అన్ని చిప్స్ ఆట డబ్బే."
      ]
    ]
  },
  tg: {
    "title": "Покери дастрас — матни калон, клавиатура, геймпад | PokerTH",
    "desc": "Texas Hold’em-и ройгон бо матни калонтар, контрасти баланд, кортҳои чорранга, лупаи миз, эълонҳои овозӣ ва идоракунии пурра бо клавиатура, геймпад ва пульти телевизор.",
    "ldHeadline": "Покери онлайни дастрас: матни калон, контрасти баланд, клавиатура ва геймпад",
    "ldDesc": "Имкониятҳои дастрасии веб-клиенти PokerTH: андозаи интерфейс, контрасти баланд, кортҳои чорранга, лупа, эълонҳои овозӣ, клавиатура, геймпад ва пульти телевизор.",
    "h1": "Покери дастрас: бо тарзи худ бозӣ кунед",
    "lead": "PokerTH — Texas Hold’em-и ройгон дар браузер аст ва ба тарзи дидан ва бозӣ кардани шумо мутобиқ мешавад: матн ва тугмаҳои калонтар, контрасти қавитар, дастаҳои корт, ки дар онҳо ҳар либос ранги худро дорад, лупа барои экранҳои хурд, эълонҳои овозӣ ва идоракунии пурра бо клавиатура, геймпад ё пульти телевизор.",
    "findH2": "Онро аз куҷо ёбед",
    "findP": "Тугмаи Дастрасӣ — нишонаи одамча дар болои ҳар экран, аз экрани воридшавӣ то миз — танзимоти асосиро дар ҳар вақт, ҳатто дар миёнаи даст, мекушояд. Ҳамаи чизҳои дигар дар Имконоти иловагӣ ҳастанд. Интихоби шумо дар дастгоҳ дар ёд мемонад ва вақте ки бо ҳисоби pokerth.net ворид мешавед, ба дигар дастгоҳҳои шумо низ мегузарад.",
    "seeH2": "Мизро равшан дидан",
    "see": [
      [
        "Андозаи интерфейс",
        "Стандартӣ, Калон ё Хеле калон: матн, кортҳо, чипҳо ва тугмаҳо якҷоя калон мешаванд, дар экрани воридшавӣ, дар лобби ва сари миз, ва тарҳбандӣ аз нав ҷобаҷо мешавад, то дар телефон ҳам қулай монад."
      ],
      [
        "Контрасти баланд",
        "Палитраи контрасташ қавитар дар тамоми интерфейс, аз менюҳо то миз, дар ҳар андозаи интерфейс."
      ],
      [
        "Кортҳои чорранга",
        "Дастаҳои корт, ки ба ҳар либос ранги алоҳида медиҳанд, то дил ва хиштро, ё пик ва гашнизро ҳеҷ гоҳ танҳо аз рӯи шакл фарқ накунед. Яке аз онҳоро дар Имконоти иловагӣ → Услуб интихоб кунед."
      ],
      [
        "Лупаи миз",
        "Дар телефон миз ду баробар калон мешавад ва бо ангушт ҳаракат мекунад; вақте ки навбати шумост, намо ба ҷои шумо бармегардад. Калонкунии браузерро бо ду ангушт низ иҷозат додан мумкин аст."
      ],
      [
        "Равшан, торик ё худкор",
        "Тамоми клиент интихоби шумо ё системаи шуморо пайравӣ мекунад, бо мавзӯъҳо, кортҳо ва рангҳои миз, ки ба чашмони шумо мувофиқанд."
      ]
    ],
    "keysH2": "Клавиатура",
    "keysP": "Ҳар амал тугмаи худро дорад. Тугмаҳои функсионалии расмии PokerTH сари миз кор мекунанд — F1 то F4 барои Fold, Check/Call, Bet/Raise ва All-In, F5 барои нишон додани кортҳоятон, F6 то F8 барои реҷаҳои бозӣ — ва веб-клиент ҳарфҳои ягона илова мекунад (F, C, R, A ва 1, 2, 3 барои сеяки банк, нисфи банк ё тамоми банк), ки ҳамаашонро аз нав таъин кардан мумкин аст. Esc равзанаи болоиро мебандад, Tab ва тирчаҳо дар рӯйхати мизҳои лобби ҳаракат мекунанд, ва Alt+S танзимотро аз ҳар ҷо мекушояд.",
    "padH2": "Геймпад ва пульти телевизор",
    "padP": "Контроллери бозӣ — Xbox, PlayStation, Switch Pro ва аксари геймпадҳои Bluetooth — тамоми бозиро пеш мебарад: тугмаҳо барои ҳар амал, триггерҳо барои муайян кардани гарав ва реҷаи Паймоиш барои ҳаракат дар экранҳо, чат ва менюҳо. Вақте навбати шумо мерасад, он меларзад. Дар Android TV ва Google TV пульт ҳамин тавр кор мекунад ва пультҳое, ки чор тугмаи ранга доранд, онҳоро барои Fold, Check/Call, Bet/Raise ва All-In истифода мебаранд.",
    "hearH2": "Шунидан ва ҳис кардани бозӣ",
    "hearP": "Эълонҳои овозӣ рӯйдодҳои бозиро бо овозҳои худи дастгоҳатон баланд мехонанд, ба забони шумо, агар система чунин овоз дошта бошад. Дар телефонҳои Android ларзиши кӯтоҳ навбати шуморо қайд мекунад. Садоҳои бозӣ ба чор гурӯҳ тақсим шудаанд — амалҳо, чат, огоҳиҳои шабака ва баландшавии блайндҳо — ки онҳоро ҷудогона фаъол ё хомӯш кардан мумкин аст, бо як лағжандаи баландии садо.",
    "calmH2": "Ногаҳониҳои камтар",
    "calmP": "Вақте ки системаи шумо ҳаракати камтарро талаб мекунад, клиент аниматсияҳояшро коҳиш медиҳад. «Ҳифз аз дидан» кортҳои шуморо то ламс кардан пинҳон нигоҳ медорад, ва ҳифз аз call-и тасодуфӣ тугмаи Call-ро пас аз raise-и калон кӯтоҳмуддат мебандад, то ламсе, ки барои call-и хурдтар буд, тасодуфан маблағи raise-ро напардозад.",
    "langH2": "Ба забони шумо, бо роҳнамо",
    "langP": "Интерфейс ба {langs} забон дастрас аст, дар ҳолати зарурӣ аз рост ба чап. Бо Кӯмаки туз, туз — маскоти веб-клиент — агар хоҳед, ҳар экранро ҳангоми бозӣ шарҳ медиҳад, ва «Ин чист?» мегӯяд, ки ҳар чизи экран чӣ кор мекунад.",
    "faqH2": "Саволҳо",
    "faq": [
      [
        "Оё метавонам кортҳо ва матнро калонтар кунам?",
        "Ҳа. Дар равзанаи Дастрасӣ Калон ё Хеле калонро интихоб кунед; кортҳо, матн ва тугмаҳо дар ҳар экран, аз ҷумла сари миз, якҷоя калон мешаванд."
      ],
      [
        "Оё реҷаи контрасти баланд ҳаст?",
        "Ҳа, дар равзанаи Дастрасӣ. Он бо ҳар андозаи интерфейс кор мекунад."
      ],
      [
        "Оё бе муш ё экрани ламсӣ бозӣ карда метавонам?",
        "Ҳа, пурра бо клавиатура, бо геймпад ё бо пульти Android TV."
      ],
      [
        "Оё бо хонандаи экран кор мекунад?",
        "Ҳоло пурра не. Эълонҳои овозӣ рӯйдодҳои бозиро баланд мехонанд ва менюҳо тамға доранд, аммо худи мизи покер интерфейси визуалӣ аст ва ҳоло танҳо бо хонандаи экран бозӣ кардани он имконнопазир аст."
      ],
      [
        "Оё ройгон аст?",
        "Ҳа. PokerTH нармафзори ройгон ва кушодаманба аст, бе реклама ва бе харидҳо дар дохили барнома; ҳамаи чипҳо пули бозӣ мебошанд."
      ]
    ]
  },
  th: {
    "title": "โป๊กเกอร์ที่เข้าถึงได้ — ตัวอักษรใหญ่ คีย์บอร์ด เกมแพด | PokerTH",
    "desc": "Texas Hold’em ฟรี พร้อมตัวอักษรใหญ่ขึ้น คอนทราสต์สูง สำรับไพ่สี่สี แว่นขยายโต๊ะ ประกาศเสียง และเล่นได้เต็มรูปแบบด้วยคีย์บอร์ด เกมแพด และรีโมททีวี",
    "ldHeadline": "โป๊กเกอร์ออนไลน์ที่เข้าถึงได้: ตัวอักษรใหญ่ คอนทราสต์สูง คีย์บอร์ดและเกมแพด",
    "ldDesc": "ฟีเจอร์การช่วยการเข้าถึงของเว็บไคลเอนต์ PokerTH: ขนาดอินเทอร์เฟซ คอนทราสต์สูง สำรับไพ่สี่สี แว่นขยาย ประกาศเสียง คีย์บอร์ด เกมแพด และรีโมททีวี",
    "h1": "โป๊กเกอร์ที่เข้าถึงได้: เล่นในแบบของคุณ",
    "lead": "PokerTH คือ Texas Hold’em ฟรีในเบราว์เซอร์ ที่ปรับตัวตามวิธีที่คุณมองเห็นและเล่น: ตัวอักษรและปุ่มที่ใหญ่ขึ้น คอนทราสต์ที่ชัดขึ้น สำรับไพ่ที่แยกดอกด้วยสี แว่นขยายสำหรับจอเล็ก ประกาศเสียง และควบคุมได้ครบถ้วนด้วยคีย์บอร์ด เกมแพด หรือรีโมททีวี",
    "findH2": "หาได้ที่ไหน",
    "findP": "ปุ่มการช่วยการเข้าถึง — ไอคอนรูปคนที่ด้านบนของทุกหน้าจอ ตั้งแต่หน้าจอเข้าสู่ระบบจนถึงโต๊ะ — เปิดการตั้งค่าหลักได้ทุกเมื่อ แม้อยู่กลางมือ ส่วนที่เหลือทั้งหมดอยู่ในตัวเลือกขั้นสูง ตัวเลือกของคุณจะถูกจดจำไว้ในอุปกรณ์ และเมื่อคุณเข้าสู่ระบบด้วยบัญชี pokerth.net ก็จะตามคุณไปยังอุปกรณ์อื่นด้วย",
    "seeH2": "มองเห็นโต๊ะได้ชัด",
    "see": [
      [
        "ขนาดอินเทอร์เฟซ",
        "มาตรฐาน ใหญ่ หรือใหญ่มาก: ข้อความ ไพ่ ชิป และปุ่มขยายไปพร้อมกัน ทั้งที่หน้าจอเข้าสู่ระบบ ในล็อบบี้ และที่โต๊ะ และเลย์เอาต์จะจัดใหม่ให้ยังใช้งานได้บนมือถือ"
      ],
      [
        "คอนทราสต์สูง",
        "ชุดสีที่ตัดกันชัดขึ้นทั่วทั้งอินเทอร์เฟซ ตั้งแต่เมนูจนถึงโต๊ะ ในทุกขนาดอินเทอร์เฟซ"
      ],
      [
        "สำรับไพ่สี่สี",
        "สำรับไพ่ที่ให้แต่ละดอกมีสีของตัวเอง เพื่อไม่ต้องแยกโพแดงกับข้าวหลามตัด หรือโพดำกับดอกจิก ด้วยรูปร่างเพียงอย่างเดียว เลือกได้ในตัวเลือกขั้นสูง → สไตล์"
      ],
      [
        "แว่นขยายโต๊ะ",
        "บนมือถือ โต๊ะจะซูมเป็นสองเท่าและเลื่อนด้วยนิ้วได้ มุมมองจะกลับมาที่ที่นั่งของคุณเมื่อถึงตาคุณ และยังอนุญาตให้ใช้การซูมบีบนิ้วของเบราว์เซอร์ได้ด้วย"
      ],
      [
        "สว่าง มืด หรืออัตโนมัติ",
        "ทั้งไคลเอนต์จะทำตามที่คุณเลือกหรือตามระบบของคุณ พร้อมธีม สำรับไพ่ และสีโต๊ะให้เลือกตามความสบายตา"
      ]
    ],
    "keysH2": "คีย์บอร์ด",
    "keysP": "ทุกการกระทำมีปุ่มของตัวเอง ปุ่มฟังก์ชันทางการของ PokerTH ใช้ได้ที่โต๊ะ — F1 ถึง F4 สำหรับ Fold, Check/Call, Bet/Raise และ All-In, F5 เพื่อเปิดไพ่ของคุณ, F6 ถึง F8 สำหรับโหมดการเล่น — และเว็บไคลเอนต์ยังเพิ่มปุ่มตัวอักษรเดี่ยว (F, C, R, A และ 1, 2, 3 สำหรับหนึ่งในสามของกองกลาง ครึ่งกองกลาง หรือเต็มกองกลาง) ซึ่งกำหนดปุ่มใหม่ได้ทั้งหมด Esc ปิดหน้าต่างที่อยู่บนสุด Tab และปุ่มลูกศรเลื่อนไปตามรายการโต๊ะในล็อบบี้ และ Alt+S เปิดการตั้งค่าได้จากทุกที่",
    "padH2": "เกมแพดและรีโมททีวี",
    "padP": "จอยเกม — Xbox, PlayStation, Switch Pro และแพด Bluetooth ส่วนใหญ่ — เล่นได้ตลอดทั้งเกม: มีปุ่มสำหรับทุกการกระทำ ไกสำหรับกำหนดเดิมพัน และโหมดนำทางสำหรับเลื่อนไปตามหน้าจอ แชท และเมนู จอยจะสั่นเมื่อถึงตาคุณ บน Android TV และ Google TV รีโมทใช้งานได้แบบเดียวกัน และรีโมทที่มีปุ่มสีสี่ปุ่มจะใช้ปุ่มเหล่านั้นสำหรับ Fold, Check/Call, Bet/Raise และ All-In",
    "hearH2": "ได้ยินและรู้สึกถึงเกม",
    "hearP": "ประกาศเสียงอ่านเหตุการณ์ในเกมออกเสียงด้วยเสียงพูดของอุปกรณ์คุณเอง เป็นภาษาของคุณหากระบบมี บนมือถือ Android การสั่นสั้น ๆ จะบอกว่าถึงตาคุณ เสียงในเกมแบ่งเป็นสี่กลุ่ม — การกระทำ แชท การแจ้งเตือนเครือข่าย และการเพิ่มบลายน์ — ซึ่งเปิดหรือปิดแยกกันได้ โดยมีแถบปรับระดับเสียงเพียงแถบเดียว",
    "calmH2": "ลดเรื่องไม่คาดคิด",
    "calmP": "เมื่อระบบของคุณขอให้ลดการเคลื่อนไหว ไคลเอนต์จะลดแอนิเมชันลง กันแอบดูจะซ่อนไพ่ของคุณไว้จนกว่าคุณจะแตะ และตัวกัน call พลาดจะบล็อกปุ่ม Call ชั่วครู่ทันทีหลัง raise ใหญ่ เพื่อไม่ให้การแตะที่ตั้งใจจะ call จำนวนน้อยกว่าไปจ่ายจำนวนที่ถูกเพิ่มโดยไม่ตั้งใจ",
    "langH2": "ในภาษาของคุณ พร้อมผู้ช่วยนำทาง",
    "langP": "อินเทอร์เฟซมีให้ใช้ใน {langs} ภาษา รวมถึงการแสดงผลจากขวาไปซ้ายเมื่อจำเป็น ตัวช่วยไพ่เอซ มาสคอตของเว็บไคลเอนต์ จะอธิบายแต่ละหน้าจอระหว่างที่คุณใช้งานหากคุณต้องการ และ “นี่คืออะไร?” จะบอกคุณว่าสิ่งใดบนหน้าจอทำหน้าที่อะไร",
    "faqH2": "คำถาม",
    "faq": [
      [
        "ขยายไพ่และตัวอักษรให้ใหญ่ขึ้นได้ไหม?",
        "ได้ เลือก “ใหญ่” หรือ “ใหญ่มาก” ในหน้าต่างการช่วยการเข้าถึง ไพ่ ตัวอักษร และปุ่มจะขยายไปพร้อมกันในทุกหน้าจอ รวมถึงที่โต๊ะ"
      ],
      [
        "มีโหมดคอนทราสต์สูงไหม?",
        "มี อยู่ในหน้าต่างการช่วยการเข้าถึง ใช้ได้กับทุกขนาดอินเทอร์เฟซ"
      ],
      [
        "เล่นโดยไม่ใช้เมาส์หรือหน้าจอสัมผัสได้ไหม?",
        "ได้ เล่นได้ทั้งหมดด้วยคีย์บอร์ด เกมแพด หรือรีโมท Android TV"
      ],
      [
        "ใช้กับโปรแกรมอ่านหน้าจอได้ไหม?",
        "ยังไม่สมบูรณ์ ประกาศเสียงจะอ่านเหตุการณ์ในเกมออกเสียงและเมนูมีป้ายกำกับ แต่ตัวโต๊ะโป๊กเกอร์เองเป็นอินเทอร์เฟซแบบภาพ และยังไม่สามารถเล่นด้วยโปรแกรมอ่านหน้าจอเพียงอย่างเดียวได้"
      ],
      [
        "ฟรีไหม?",
        "ฟรี PokerTH เป็นซอฟต์แวร์ฟรีและโอเพนซอร์ส ไม่มีโฆษณาและไม่มีการซื้อในแอป ชิปทั้งหมดเป็นเงินสมมติ"
      ]
    ]
  },
  tk: {
    "title": "Elýeterli poker — uly ýazgy, klawiatura, geýmpad | PokerTH",
    "desc": "Mugt Texas Hold’em: has uly ýazgy, ýokary kontrast, dört reňkli kart desteleri, lupa, ses bilen habar bermek we klawiatura, geýmpad ýa-da pult bilen doly oýun.",
    "ldHeadline": "Elýeterli onlaýn poker: uly ýazgy, ýokary kontrast, klawiatura we geýmpad",
    "ldDesc": "PokerTH web müşderisiniň elýeterlilik mümkinçilikleri: interfeýsiň ölçegi, ýokary kontrast, dört reňkli kart desteleri, lupa, ses bilen habar bermek, klawiatura, geýmpad we telewizor pulty.",
    "h1": "Elýeterli poker: öz usulyňyzda oýnaň",
    "lead": "PokerTH brauzerdäki mugt Texas Hold’em bolup, siziň görşüňize we oýnaýşyňyza uýgunlaşýar: has uly ýazgy we düwmeler, has güýçli kontrast, kart nyşanlaryny reňk boýunça tapawutlandyrýan desteler, kiçi ekranlar üçin lupa, ses bilen habar bermek we klawiatura, geýmpad ýa-da telewizor pulty bilen doly dolandyryş.",
    "findH2": "Ony nireden tapmaly",
    "findP": "Elýeterlilik düwmesi — giriş ekranyndan stola çenli her ekranyň ýokarsyndaky adam nyşany — esasy sazlamalary islän wagtyňyz, hatda eliň ortasynda hem açýar. Galan hemme zat Giňişleýin sazlamalarda. Saýlawlaryňyz enjamda ýatda saklanýar we pokerth.net hasaby bilen girseňiz, beýleki enjamlaryňyza hem geçýär.",
    "seeH2": "Stoly görmek",
    "see": [
      [
        "Interfeýsiň ölçegi",
        "Standart, Uly ýa-da Örän uly: ýazgy, kartlar, çipler we düwmeler giriş ekranynda, lobbide we stolda bilelikde ulalýar, ýerleşiş bolsa telefonda-da amatly bolar ýaly täzeden düzülýär."
      ],
      [
        "Ýokary kontrast",
        "Menýulardan stola çenli tutuş interfeýsde has güýçli kontrastly palitra, interfeýsiň islendik ölçeginde."
      ],
      [
        "Dört reňkli kart desteleri",
        "Her nyşana öz reňkini berýän kart desteleri, şonuň üçin iki gyzyl nyşan ýa-da iki gara nyşan hiç haçan diňe şekli boýunça tapawutlandyrylmaýar. Birini Giňişleýin sazlamalar → Stil bölüminde saýlaň."
      ],
      [
        "Stol lupasy",
        "Telefonda stol iki esse ulalýar we barmak bilen süýşýär; nobatyňyz gelende görnüş siziň ornuňyza dolanýar. Brauzeriň çümdikläp ulaltmagyna hem rugsat berip bolýar."
      ],
      [
        "Ýagty, garaňky ýa-da awtomatik",
        "Tutuş müşderi siziň ýa-da ulgamyňyzyň saýlawyna eýerýär, gözüňize laýyk temalar, desteler we stol reňkleri bilen."
      ]
    ],
    "keysH2": "Klawiatura",
    "keysP": "Her hereketiň öz düwmesi bar. PokerTH-iň resmi funksiýa düwmeleri stolda işleýär — F1-den F4-e çenli Fold, Check/Call, Bet/Raise we All-In, F5 kartlaryňyzy görkezmek üçin, F6-dan F8-e çenli oýun režimleri — web müşderi bolsa ýeke harplary goşýar (F, C, R, A, şeýle hem bankyň üçden biri, ýarysy ýa-da tutuş bank üçin 1, 2, 3), olaryň hemmesini täzeden bellemek bolýar. Escape iň ýokarky penjiräni ýapýar, Tab we ok düwmeleri lobbidäki stollaryň sanawynda hereket edýär, Alt+S bolsa sazlamalary islendik ýerden açýar.",
    "padH2": "Geýmpad we telewizor pulty",
    "padP": "Oýun kontrolleri — Xbox, PlayStation, Switch Pro we Bluetooth geýmpadlaryň köpüsi — tutuş oýny oýnaýar: her hereket üçin düwmeler, stawkany bellemek üçin tetikler we ekranlarda, çatda we menýularda hereket etmek üçin nawigasiýa tertibi. Nobatyňyz gelende titreýär. Android TV we Google TV-de pult edil şonuň ýaly işleýär, dört reňkli düwmesi bolan pultlar bolsa olary Fold, Check/Call, Bet/Raise we All-In üçin ulanýar.",
    "hearH2": "Oýny eşitmek we duýmak",
    "hearP": "Ses bilen habar bermek oýun wakalaryny enjamyňyzyň öz sesleri bilen, ulgamda bar bolsa siziň diliňizde gaty okaýar. Android telefonlarynda gysga titreme nobatyňyzy belleýär. Oýun sesleri dört topara bölünýär — hereketler, çat, tor habarnamalary we blaýndlaryň ýokarlanmagy — olary aýratynlykda açyp ýa-da öçürip bolýar, bir ses güýji süýşgüji bilen.",
    "calmH2": "Az garaşylmadyk ýagdaý",
    "calmP": "Ulgamyňyz hereketi azaltmagy soranda, müşderi animasiýalaryny ýuwaşadýar. «Göz aýlamakdan gorag» kartlaryňyzy olara degýänçäňiz gizleýär, tötänleýin call-dan gorag bolsa uly raise-den soň Call düwmesini gysga wagtlyk petikleýär, kiçi call üçin niýetlenen degme ýokarlandyrylan mukdary ýalňyşlyk bilen tölemez ýaly.",
    "langH2": "Öz diliňizde, ýol görkeziji bilen",
    "langP": "Interfeýs {langs} dilde elýeterli, gerek ýerinde sagdan çepe. Tuzuň kömegi bilen web müşderiniň maskoty Tuz isleseňiz her ekrany ýoluň ugrunda düşündirýär, «Bu näme?» bolsa ekrandaky islendik zadyň näme edýändigini aýdýar.",
    "faqH2": "Soraglar",
    "faq": [
      [
        "Kartlary we ýazgyny ulaldyp bilerinmi?",
        "Hawa. Elýeterlilik penjiresinde Uly ýa-da Örän uly saýlaň; kartlar, ýazgy we düwmeler her ekranda, şol sanda stolda bilelikde ulalýar."
      ],
      [
        "Ýokary kontrast režimi barmy?",
        "Hawa, Elýeterlilik penjiresinde. Ol interfeýsiň islendik ölçegi bilen işleýär."
      ],
      [
        "Syçansyz ýa-da sensor ekransyz oýnap bilerinmi?",
        "Hawa, doly klawiatura, geýmpad ýa-da Android TV pulty bilen."
      ],
      [
        "Ekran okaýjy bilen işleýärmi?",
        "Entek doly däl. Ses bilen habar bermek oýun wakalaryny gaty okaýar we menýularyň bellikleri bar, ýöne poker stolunyň özi wizual interfeýsdir we ony entek diňe ekran okaýjy bilen oýnap bolmaýar."
      ],
      [
        "Mugtmy?",
        "Hawa. PokerTH mahabatsyz we programma içindäki satyn almalarsyz mugt, açyk çeşmeli programma üpjünçiligidir; ähli çipler diňe oýun puludyr."
      ]
    ]
  },
  tr: {
    "title": "Erişilebilir poker — büyük yazı, klavye, oyun kumandası | PokerTH",
    "desc": "Büyük yazı, yüksek kontrast, dört renkli desteler, masa büyüteci, sesli anonslar ve klavye, oyun kumandası ya da TV kumandasıyla tam kontrol sunan ücretsiz Texas Hold’em.",
    "ldHeadline": "Erişilebilir çevrimiçi poker: büyük yazı, yüksek kontrast, klavye ve oyun kumandası",
    "ldDesc": "PokerTH web istemcisinin erişilebilirlik özellikleri: arayüz boyutu, yüksek kontrast, dört renkli desteler, büyüteç, sesli anonslar, klavye, oyun kumandası ve TV kumandası.",
    "h1": "Erişilebilir poker: kendi tarzınızda oynayın",
    "lead": "PokerTH tarayıcıda ücretsiz Texas Hold’em’dir ve görme ve oynama biçiminize uyum sağlar: daha büyük yazı ve düğmeler, daha güçlü kontrast, sembolleri renkle ayıran desteler, küçük ekranlar için bir büyüteç, sesli anonslar ve klavye, oyun kumandası ya da TV kumandasıyla eksiksiz kontrol.",
    "findH2": "Nerede bulunur",
    "findP": "Erişilebilirlik düğmesi — giriş ekranından masaya kadar her ekranın üstündeki kişi simgesi — ana ayarları her an, bir elin ortasında bile açar. Geri kalan her şey Gelişmiş seçeneklerdedir. Seçimleriniz cihazda hatırlanır ve bir pokerth.net hesabıyla giriş yaptığınızda diğer cihazlarınızda da sizi izler.",
    "seeH2": "Masayı rahat görmek",
    "see": [
      [
        "Arayüz boyutu",
        "Standart, Büyük veya Çok büyük: yazılar, kartlar, çipler ve düğmeler giriş ekranında, lobide ve masada birlikte büyür; düzen de telefonda rahat kullanılabilsin diye kendini yeniden yerleştirir."
      ],
      [
        "Yüksek kontrast",
        "Menülerden masaya kadar tüm arayüzde, her arayüz boyutunda daha güçlü kontrastlı bir palet."
      ],
      [
        "Dört renkli desteler",
        "Her sembole kendi rengini veren desteler; böylece kupa ile karo ya da maça ile sinek asla yalnızca şekilden ayırt edilmek zorunda kalmaz. Gelişmiş seçenekler → Stil bölümünden birini seçin."
      ],
      [
        "Masa büyüteci",
        "Telefonda masa iki katı boyuta yakınlaşır ve parmakla kaydırılır; sıra size geldiğinde görünüm koltuğunuza döner. Tarayıcının iki parmakla yakınlaştırmasına da izin verilebilir."
      ],
      [
        "Açık, koyu veya otomatik",
        "Tüm istemci sizin ya da sisteminizin seçimini izler; temalar, desteler ve masa renkleri gözlerinize göre ayarlanabilir."
      ]
    ],
    "keysH2": "Klavye",
    "keysP": "Her eylemin bir tuşu vardır. Resmi PokerTH işlev tuşları masada çalışır — Fold, Check/Call, Bet/Raise ve All-In için F1 ila F4, kartlarınızı göstermek için F5, oynama modları için F6 ila F8 — ve web istemcisi tek harfler ekler (F, C, R, A ve potun üçte biri, yarısı ya da tamamı için 1, 2, 3); bunların hepsi yeniden atanabilir. Esc en üstteki pencereyi kapatır, Tab ve ok tuşları lobideki masa listesinde gezinir, Alt+S ise ayarları her yerden açar.",
    "padH2": "Oyun kumandası ve TV kumandası",
    "padP": "Bir oyun kumandasıyla — Xbox, PlayStation, Switch Pro ve çoğu Bluetooth kumanda — oyunun tamamı oynanır: her eylem için düğmeler, bahsi ayarlamak için tetikler ve ekranlar, sohbet ve menüler arasında dolaşmak için bir gezinme modu. Sıra size geldiğinde kumanda titrer. Android TV ve Google TV’de kumanda aynı şekilde çalışır; dört renkli tuşu olan kumandalar bunları Fold, Check/Call, Bet/Raise ve All-In için kullanır.",
    "hearH2": "Oyunu duymak ve hissetmek",
    "hearP": "Sesli anonslar oyun olaylarını cihazınızın kendi sesleriyle, sistemde varsa kendi dilinizde yüksek sesle okur. Android telefonlarda kısa bir titreşim sıranızı bildirir. Oyun sesleri dört gruba ayrılır — eylemler, sohbet, ağ bildirimleri ve kör artışları — ve her biri ayrı ayrı açılıp kapatılabilir; ses düzeyi için tek bir kaydırıcı vardır.",
    "calmH2": "Daha az sürpriz",
    "calmP": "Sisteminiz hareketin azaltılmasını istediğinde istemci animasyonlarını yumuşatır. Gizli bakış koruması kendi kartlarınızı siz dokunana kadar kapalı tutar; yanlışlıkla Call koruması da büyük bir yükseltmenin hemen ardından Call düğmesini kısa süre kilitler, böylece daha küçük bir Call için yapılan dokunuş yükseltilmiş tutarı yanlışlıkla ödeyemez.",
    "langH2": "Kendi dilinizde, bir rehberle",
    "langP": "Arayüz {langs} dilde kullanılabilir, gerektiğinde sağdan sola. As’ın yardımı ile web istemcisinin maskotu As, isterseniz siz ilerledikçe her ekranı açıklar; “Bu ne?” ise ekrandaki herhangi bir şeyin ne işe yaradığını söyler.",
    "faqH2": "Sorular",
    "faq": [
      [
        "Kartları ve yazıları büyütebilir miyim?",
        "Evet. Erişilebilirlik penceresinde Büyük veya Çok büyük seçin; kartlar, yazılar ve düğmeler masa dahil her ekranda birlikte büyür."
      ],
      [
        "Yüksek kontrast modu var mı?",
        "Evet, Erişilebilirlik penceresinde. Her arayüz boyutuyla çalışır."
      ],
      [
        "Fare ya da dokunmatik ekran olmadan oynayabilir miyim?",
        "Evet, tamamen klavyeyle, bir oyun kumandasıyla ya da Android TV kumandasıyla."
      ],
      [
        "Ekran okuyucuyla çalışıyor mu?",
        "Henüz tam olarak değil. Sesli anonslar oyun olaylarını yüksek sesle okur ve menülerde etiketler vardır, ancak poker masasının kendisi görsel bir arayüzdür ve henüz yalnızca bir ekran okuyucuyla oynanamaz."
      ],
      [
        "Ücretsiz mi?",
        "Evet. PokerTH reklamsız ve uygulama içi satın alması olmayan, ücretsiz ve açık kaynaklı bir yazılımdır; tüm çipler oyun parasıdır."
      ]
    ]
  },
  uk: {
    "title": "Доступний покер — великий шрифт, клавіатура, геймпад | PokerTH",
    "desc": "Безкоштовний Texas Hold’em: більший шрифт, висока контрастність, чотириколірні колоди, лупа столу, голосові оголошення та гра з клавіатури, геймпада чи пульта ТБ.",
    "ldHeadline": "Доступний онлайн-покер: великий шрифт, висока контрастність, клавіатура й геймпад",
    "ldDesc": "Спеціальні можливості вебклієнта PokerTH: розмір інтерфейсу, висока контрастність, чотириколірні колоди, лупа, голосові оголошення, клавіатура, геймпад і пульт ТБ.",
    "h1": "Доступний покер: грайте по-своєму",
    "lead": "PokerTH — це безкоштовний Texas Hold’em у браузері, і він підлаштовується під те, як ви бачите та граєте: більший шрифт і кнопки, сильніша контрастність, колоди, що розрізняють масті кольором, лупа для малих екранів, голосові оголошення та повне керування з клавіатури, геймпада або пульта ТБ.",
    "findH2": "Де це знайти",
    "findP": "Кнопка «Спеціальні можливості» — значок людини вгорі кожного екрана, від екрана входу до столу, — будь-коли відкриває основні налаштування, навіть посеред роздачі. Усе інше — у Розширених параметрах. Ваш вибір запам’ятовується на пристрої, а коли ви входите з акаунтом pokerth.net, він переходить і на ваші інші пристрої.",
    "seeH2": "Добре бачити стіл",
    "see": [
      [
        "Розмір інтерфейсу",
        "Стандартний, Великий або Дуже великий: текст, карти, фішки й кнопки збільшуються разом — на екрані входу, у лобі та за столом, — а розкладка перебудовується, щоб нею було зручно користуватися й на телефоні."
      ],
      [
        "Висока контрастність",
        "Палітра з сильнішою контрастністю в усьому інтерфейсі, від меню до столу, за будь-якого розміру інтерфейсу."
      ],
      [
        "Чотириколірні колоди",
        "Колоди, у яких кожна масть має власний колір, тож чирви й бубни або піки й трефи ніколи не доводиться розрізняти лише за формою. Виберіть колоду в Розширені параметри → Стиль."
      ],
      [
        "Лупа столу",
        "На телефоні стіл збільшується вдвічі й переміщується пальцем; коли настає ваш хід, вигляд повертається до вашого місця. Можна також дозволити масштабування браузера щипком."
      ],
      [
        "Світлий, темний або автоматичний",
        "Увесь клієнт дотримується вашого вибору або вибору системи, з темами, колодами й кольорами столу, що пасують вашим очам."
      ]
    ],
    "keysH2": "Клавіатура",
    "keysP": "Кожна дія має свою клавішу. За столом працюють офіційні функціональні клавіші PokerTH — від F1 до F4 для Fold, Check/Call, Bet/Raise і All-In, F5, щоб показати свої карти, від F6 до F8 для режимів гри, — а вебклієнт додає окремі літери (F, C, R, A, а також 1, 2, 3 для третини банку, половини банку чи всього банку), і всі їх можна перепризначити. Escape закриває верхнє вікно, Tab і клавіші зі стрілками переміщують списком столів у лобі, а Alt+S відкриває налаштування звідусіль.",
    "padH2": "Геймпад і пульт ТБ",
    "padP": "Ігровий контролер — Xbox, PlayStation, Switch Pro та більшість Bluetooth-геймпадів — дає змогу зіграти всю гру: кнопки для кожної дії, тригери для вибору ставки та режим навігації для переміщення екранами, чатом і меню. Коли настає ваш хід, він вібрує. На Android TV і Google TV пульт працює так само, а пульти з чотирма кольоровими кнопками використовують їх для Fold, Check/Call, Bet/Raise і All-In.",
    "hearH2": "Чути й відчувати гру",
    "hearP": "Голосові оголошення читають ігрові події вголос власними голосами вашого пристрою — вашою мовою, якщо вона є в системі. На телефонах Android коротка вібрація позначає ваш хід. Звуки гри поділено на чотири групи — дії, чат, мережеві сповіщення та зростання блайндів, — які можна вмикати й вимикати окремо, з одним повзунком гучності.",
    "calmH2": "Менше несподіванок",
    "calmP": "Коли система просить зменшити рух, клієнт приглушує анімації. Захист від підглядання тримає ваші карти закритими, доки ви їх не торкнетеся, а захист від випадкового Call на мить блокує кнопку Call одразу після великого підвищення, щоб дотик, призначений меншому Call, не сплатив помилково підвищену суму.",
    "langH2": "Вашою мовою, з провідником",
    "langP": "Інтерфейс доступний {langs} мовами, де потрібно — справа наліво. Допомога туза — туз є талісманом вебклієнта — за бажанням пояснює кожен екран по ходу гри, а «Що це?» підкаже, що робить будь-який елемент на екрані.",
    "faqH2": "Запитання",
    "faq": [
      [
        "Чи можна збільшити карти й текст?",
        "Так. Виберіть Великий або Дуже великий у вікні «Спеціальні можливості»; карти, текст і кнопки збільшуються разом на кожному екрані, зокрема за столом."
      ],
      [
        "Чи є режим високої контрастності?",
        "Так, у вікні «Спеціальні можливості». Він працює з будь-яким розміром інтерфейсу."
      ],
      [
        "Чи можна грати без миші чи сенсорного екрана?",
        "Так, повністю з клавіатури, з геймпада або з пульта Android TV."
      ],
      [
        "Чи працює це з програмою зчитування з екрана?",
        "Поки що не повністю. Голосові оголошення читають ігрові події вголос, а меню мають підписи, але сам покерний стіл — це візуальний інтерфейс, і грати на ньому лише за допомогою програми зчитування з екрана поки що неможливо."
      ],
      [
        "Це безкоштовно?",
        "Так. PokerTH — безкоштовна програма з відкритим кодом, без реклами й без покупок у застосунку; усі фішки — лише умовні гроші."
      ]
    ]
  },
  ur: {
    "title": "قابلِ رسائی پوکر — بڑا متن، کی بورڈ، گیم پیڈ | PokerTH",
    "desc": "مفت Texas Hold’em: بڑا متن، زیادہ کنٹراسٹ، چار رنگوں کے ڈیک، میز کا مکبر، صوتی اعلانات، اور کی بورڈ، گیم پیڈ اور ٹی وی ریموٹ سے مکمل کھیل۔",
    "ldHeadline": "قابلِ رسائی آن لائن پوکر: بڑا متن، زیادہ کنٹراسٹ، کی بورڈ اور گیم پیڈ",
    "ldDesc": "PokerTH ویب کلائنٹ کی رسائی کی خصوصیات: انٹرفیس کا سائز، زیادہ کنٹراسٹ، چار رنگوں کے ڈیک، مکبر، صوتی اعلانات، کی بورڈ، گیم پیڈ اور ٹی وی ریموٹ۔",
    "h1": "قابلِ رسائی پوکر: اپنے انداز میں کھیلیں",
    "lead": "PokerTH براؤزر میں مفت Texas Hold’em ہے، اور یہ آپ کے دیکھنے اور کھیلنے کے انداز کے مطابق ڈھل جاتا ہے: بڑا متن اور بڑے بٹن، زیادہ واضح کنٹراسٹ، ایسے ڈیک جن میں ہر رنگ کی الگ رنگت ہوتی ہے، چھوٹی اسکرینوں کے لیے مکبر، صوتی اعلانات، اور کی بورڈ، گیم پیڈ یا ٹی وی ریموٹ سے مکمل کنٹرول۔",
    "findH2": "یہ کہاں ملے گا",
    "findP": "رسائی بٹن — لاگ اِن اسکرین سے میز تک ہر اسکرین کے اوپر موجود انسان کا آئیکن — مرکزی ترتیبات کسی بھی وقت کھول دیتا ہے، ہاتھ کے بیچ میں بھی۔ باقی سب کچھ اعلیٰ اختیارات میں ہے۔ آپ کے انتخاب آلے پر یاد رکھے جاتے ہیں اور جب آپ pokerth.net اکاؤنٹ سے لاگ اِن کرتے ہیں تو آپ کے دوسرے آلات پر بھی آپ کے ساتھ جاتے ہیں۔",
    "seeH2": "میز کو دیکھنا",
    "see": [
      [
        "انٹرفیس کا سائز",
        "معیاری، بڑا یا بہت بڑا: متن، کارڈ، چپس اور بٹن ایک ساتھ بڑے ہوتے ہیں، لاگ اِن اسکرین پر، لابی میں اور میز پر، اور ترتیب نئے سرے سے سج جاتی ہے تاکہ فون پر بھی آسانی سے استعمال ہو سکے۔"
      ],
      [
        "زیادہ کنٹراسٹ",
        "مینو سے میز تک پورے انٹرفیس میں زیادہ کنٹراسٹ والی رنگوں کی پٹی، انٹرفیس کے ہر سائز پر۔"
      ],
      [
        "چار رنگوں کے ڈیک",
        "ایسے کارڈ ڈیک جو ہر رنگ کو اس کی اپنی رنگت دیتے ہیں، تاکہ پان ♥ اور اینٹ ♦، یا حکم ♠ اور چڑیا ♣ کو کبھی صرف شکل سے نہ پہچاننا پڑے۔ اعلیٰ اختیارات ← انداز میں ایک چنیں۔"
      ],
      [
        "میز کا مکبر",
        "فون پر میز دگنے سائز تک بڑی ہو جاتی ہے اور انگلی سے کھسکتی ہے؛ آپ کی باری آنے پر منظر آپ کی نشست پر واپس آ جاتا ہے۔ براؤزر کا دو انگلیوں والا زوم بھی آن کیا جا سکتا ہے۔"
      ],
      [
        "ہلکا، گہرا یا خودکار",
        "پورا کلائنٹ آپ کے یا آپ کے سسٹم کے انتخاب پر چلتا ہے، آپ کی آنکھوں کے موافق تھیمز، ڈیک اور میز کے رنگوں کے ساتھ۔"
      ]
    ],
    "keysH2": "کی بورڈ",
    "keysP": "ہر حرکت کی ایک کلید ہے۔ PokerTH کی سرکاری فنکشن کلیدیں میز پر چلتی ہیں — Fold، Check/Call، Bet/Raise اور All-In کے لیے F1 سے F4، اپنے کارڈ دکھانے کے لیے F5، کھیلنے کے موڈز کے لیے F6 سے F8 — اور ویب کلائنٹ ایک حرفی کلیدیں شامل کرتا ہے (F، C، R، A، اور پاٹ کے تہائی، آدھے پاٹ یا پورے پاٹ کے لیے 1، 2، 3)، اور ان سب کو بدلا جا سکتا ہے۔ Escape سب سے اوپر والی ونڈو بند کرتا ہے، Tab اور تیر کی کلیدیں لابی کی میزوں کی فہرست میں چلتی ہیں، اور Alt+S کہیں سے بھی ترتیبات کھول دیتا ہے۔",
    "padH2": "گیم پیڈ اور ٹی وی ریموٹ",
    "padP": "گیم کنٹرولر — Xbox، PlayStation، Switch Pro اور زیادہ تر Bluetooth پیڈ — سے پورا کھیل کھیلا جا سکتا ہے: ہر حرکت کے لیے بٹن، شرط طے کرنے کے لیے ٹریگر، اور اسکرینوں، چیٹ اور مینوز میں گھومنے کے لیے نیویگیشن موڈ۔ آپ کی باری آنے پر یہ وائبریٹ کرتا ہے۔ Android TV اور Google TV پر ریموٹ اسی طرح کام کرتا ہے، اور جن ریموٹس پر چار رنگین کلیدیں ہوں وہ انہیں Fold، Check/Call، Bet/Raise اور All-In کے لیے استعمال کرتے ہیں۔",
    "hearH2": "کھیل کو سننا اور محسوس کرنا",
    "hearP": "صوتی اعلانات آپ کے آلے کی اپنی آوازوں سے کھیل کے واقعات بلند آواز میں پڑھتے ہیں، اور جہاں سسٹم میں آپ کی زبان کی آواز ہو وہاں آپ کی زبان میں۔ Android فونز پر ایک مختصر وائبریشن آپ کی باری کی نشان دہی کرتی ہے۔ کھیل کی آوازیں چار گروپوں میں ہیں — حرکات، چیٹ، نیٹ ورک اطلاعات اور بلائنڈز میں اضافہ — جنہیں ایک ہی والیوم سلائیڈر کے ساتھ الگ الگ آن یا آف کیا جا سکتا ہے۔",
    "calmH2": "کم حیرانیاں",
    "calmP": "جب آپ کا سسٹم کم حرکت کی درخواست کرتا ہے تو کلائنٹ اپنی اینیمیشنز دھیمی کر دیتا ہے۔ اینٹی پِیک آپ کے اپنے کارڈ اس وقت تک چھپائے رکھتا ہے جب تک آپ ان پر ٹیپ نہ کریں، اور غلط کال کا محافظ بڑے اضافے کے فوراً بعد Call بٹن کو لمحہ بھر روک دیتا ہے، تاکہ چھوٹی کال کے لیے کی گئی ٹیپ غلطی سے بڑھی ہوئی رقم ادا نہ کر دے۔",
    "langH2": "آپ کی زبان میں، رہنما کے ساتھ",
    "langP": "انٹرفیس {langs} زبانوں میں دستیاب ہے، جہاں ضرورت ہو دائیں سے بائیں۔ اِکے کی مدد، ویب کلائنٹ کا میسکوٹ، آپ چاہیں تو آگے بڑھتے ہوئے ہر اسکرین سمجھاتی ہے، اور «یہ کیا ہے؟» آپ کو بتاتا ہے کہ اسکرین پر کوئی بھی چیز کیا کرتی ہے۔",
    "faqH2": "سوالات",
    "faq": [
      [
        "کیا کارڈ اور متن بڑے کیے جا سکتے ہیں؟",
        "جی ہاں۔ رسائی ونڈو میں بڑا یا بہت بڑا چنیں؛ کارڈ، متن اور بٹن میز سمیت ہر اسکرین پر ایک ساتھ بڑے ہوتے ہیں۔"
      ],
      [
        "کیا زیادہ کنٹراسٹ موڈ ہے؟",
        "جی ہاں، رسائی ونڈو میں۔ یہ انٹرفیس کے ہر سائز کے ساتھ کام کرتا ہے۔"
      ],
      [
        "کیا ماؤس یا ٹچ اسکرین کے بغیر کھیلا جا سکتا ہے؟",
        "جی ہاں، پوری طرح کی بورڈ، گیم پیڈ یا Android TV ریموٹ سے۔"
      ],
      [
        "کیا یہ اسکرین ریڈر کے ساتھ کام کرتا ہے؟",
        "ابھی پوری طرح نہیں۔ صوتی اعلانات کھیل کے واقعات بلند آواز میں پڑھتے ہیں اور مینوز پر لیبل ہیں، لیکن پوکر کی میز خود ایک بصری انٹرفیس ہے اور ابھی صرف اسکرین ریڈر سے نہیں کھیلی جا سکتی۔"
      ],
      [
        "کیا یہ مفت ہے؟",
        "جی ہاں۔ PokerTH مفت اور اوپن سورس سافٹ ویئر ہے، نہ اشتہارات نہ ایپ کے اندر خریداری؛ تمام چپس صرف کھیل کے پیسے ہیں۔"
      ]
    ]
  },
  uz: {
    "title": "Maxsus imkoniyatli poker — katta matn, klaviatura, geympad | PokerTH",
    "desc": "Katta matn, yuqori kontrast, 4 rangli kolodalar, stol lupasi, ovozli eʼlonlar hamda klaviatura, geympad va televizor pulti bilan boshqariladigan bepul Texas Hold’em.",
    "ldHeadline": "Maxsus imkoniyatli onlayn poker: katta matn, yuqori kontrast, klaviatura va geympad",
    "ldDesc": "PokerTH veb-mijozining maxsus imkoniyatlari: interfeys oʻlchami, yuqori kontrast, 4 rangli kolodalar, lupa, ovozli eʼlonlar, klaviatura, geympad va televizor pulti.",
    "h1": "Maxsus imkoniyatli poker: oʻzingizga qulay tarzda oʻynang",
    "lead": "PokerTH — brauzerdagi bepul Texas Hold’em, u sizning koʻrish va oʻynash usulingizga moslashadi: kattaroq matn va tugmalar, kuchliroq kontrast, mastlarni rang bilan ajratadigan kolodalar, kichik ekranlar uchun lupa, ovozli eʼlonlar hamda klaviatura, geympad yoki televizor pulti orqali toʻliq boshqaruv.",
    "findH2": "Uni qayerdan topish mumkin",
    "findP": "Maxsus imkoniyatlar tugmasi — kirish ekranidan stolgacha har bir ekran tepasidagi odamcha belgisi — asosiy sozlamalarni istalgan vaqtda, hatto qoʻl oʻrtasida ham ochadi. Qolgan hammasi Kengaytirilgan sozlamalarda. Tanlovlaringiz qurilmada eslab qolinadi va pokerth.net hisobi bilan kirsangiz, boshqa qurilmalaringizga ham oʻtadi.",
    "seeH2": "Stolni koʻrish",
    "see": [
      [
        "Interfeys oʻlchami",
        "Standart, Katta yoki Juda katta: matn, kartalar, fishkalar va tugmalar birgalikda kattalashadi — kirish ekranida, lobbida va stolda — joylashuv esa telefonda ham qulay boʻlib qolishi uchun qayta tuziladi."
      ],
      [
        "Yuqori kontrast",
        "Menyulardan stolgacha butun interfeys boʻylab kuchliroq kontrastli palitra, istalgan interfeys oʻlchamida."
      ],
      [
        "4 rangli kolodalar",
        "Har bir mastga oʻz rangini beradigan kolodalar, shunda ♥ va ♦ yoki ♠ va ♣ hech qachon faqat shakliga qarab ajratilmaydi. Birini Kengaytirilgan sozlamalar → Uslub boʻlimida tanlang."
      ],
      [
        "Stol lupasi",
        "Telefonda stol ikki baravar kattalashadi va barmoq bilan suriladi; navbat sizga kelganda koʻrinish oʻrningizga qaytadi. Brauzerning ikki barmoqli masshtabiga ham ruxsat berish mumkin."
      ],
      [
        "Yorugʻ, toʻq yoki avtomatik",
        "Butun mijoz sizning yoki tizimingizning tanloviga ergashadi; koʻzingizga mos mavzular, kolodalar va stol ranglari bilan."
      ]
    ],
    "keysH2": "Klaviatura",
    "keysP": "Har bir harakatning oʻz tugmasi bor. Rasmiy PokerTH funksiya tugmalari stolda ishlaydi — F1–F4 Fold, Check/Call, Bet/Raise va All-In uchun, F5 kartalaringizni koʻrsatish uchun, F6–F8 oʻyin rejimlari uchun — veb-mijoz esa yakka harflarni qoʻshadi (F, C, R, A, shuningdek bankning uchdan biri, yarmi yoki butun bank uchun 1, 2, 3), ularning hammasini qayta tayinlash mumkin. Escape eng ustki oynani yopadi, Tab va strelka tugmalari lobbidagi stollar roʻyxati boʻylab harakatlantiradi, Alt+S esa sozlamalarni istalgan joydan ochadi.",
    "padH2": "Geympad va televizor pulti",
    "padP": "Oʻyin kontrolleri — Xbox, PlayStation, Switch Pro va aksariyat Bluetooth geympadlar — butun oʻyinni boshqaradi: har bir harakat uchun tugmalar, stavkani belgilash uchun triggerlar va ekranlar, chat hamda menyular boʻylab harakatlanish uchun navigatsiya rejimi. Navbatingiz kelganda u tebranadi. Android TV va Google TV da pult xuddi shunday ishlaydi, toʻrtta rangli tugmasi bor pultlar esa ulardan Fold, Check/Call, Bet/Raise va All-In uchun foydalanadi.",
    "hearH2": "Oʻyinni eshitish va his qilish",
    "hearP": "Ovozli eʼlonlar oʻyin voqealarini qurilmangizning oʻz ovozlari bilan, tizimda boʻlsa, oʻz tilingizda ovoz chiqarib oʻqib beradi. Android telefonlarda qisqa tebranish navbatingizni bildiradi. Oʻyin ovozlari toʻrt guruhga boʻlingan — harakatlar, chat, tarmoq bildirishnomalari va blaynd oshishi — ularni alohida yoqish yoki oʻchirish mumkin, hammasi uchun bitta balandlik slayderi bor.",
    "calmH2": "Kamroq kutilmagan holatlar",
    "calmP": "Tizimingiz harakatni kamaytirishni soʻrasa, mijoz animatsiyalarini yumshatadi. Moʻralashdan himoya oʻz kartalaringizni ularga bosmaguningizcha yashirin saqlaydi, tasodifiy call’dan himoya esa katta raise’dan soʻng darhol Call tugmasini qisqa muddatga bloklaydi, shunda kichikroq call’ga moʻljallangan bosish xato bilan oshirilgan miqdorni toʻlab yubormaydi.",
    "langH2": "Oʻz tilingizda, yoʻlboshchi bilan",
    "langP": "Interfeys {langs} tilda mavjud, kerak boʻlgan joyda oʻngdan chapga. Tuzning yordami bilan veb-mijozning maskoti Tuz, xohlasangiz, har bir ekranni siz oldinga borganingiz sari tushuntiradi, «Bu nima?» esa ekrandagi istalgan narsa nima qilishini aytadi.",
    "faqH2": "Savollar",
    "faq": [
      [
        "Kartalar va matnni kattalashtirsam boʻladimi?",
        "Ha. Maxsus imkoniyatlar oynasida «Katta» yoki «Juda katta»ni tanlang; kartalar, matn va tugmalar har bir ekranda, jumladan stolda ham birgalikda kattalashadi."
      ],
      [
        "Yuqori kontrast rejimi bormi?",
        "Ha, Maxsus imkoniyatlar oynasida. U istalgan interfeys oʻlchami bilan ishlaydi."
      ],
      [
        "Sichqoncha yoki sensorli ekransiz oʻynasam boʻladimi?",
        "Ha, butunlay klaviatura, geympad yoki Android TV pulti bilan."
      ],
      [
        "Ekran oʻquvchi dastur bilan ishlaydimi?",
        "Hozircha toʻliq emas. Ovozli eʼlonlar oʻyin voqealarini ovoz chiqarib oʻqiydi va menyularda yorliqlar bor, lekin poker stolining oʻzi vizual interfeys boʻlib, uni hozircha faqat ekran oʻquvchi dastur bilan oʻynab boʻlmaydi."
      ],
      [
        "Bu bepulmi?",
        "Ha. PokerTH — reklamasiz va ilova ichidagi xaridlarsiz bepul, ochiq manbali dastur; barcha fishkalar oʻyin puli."
      ]
    ]
  },
  vi: {
    "title": "Poker trợ năng — chữ lớn, bàn phím, tay cầm | PokerTH",
    "desc": "Texas Hold’em miễn phí: chữ to hơn, độ tương phản cao, bộ bài 4 màu, kính lúp, thông báo bằng giọng nói và điều khiển hoàn toàn bằng bàn phím, tay cầm, điều khiển TV.",
    "ldHeadline": "Poker trực tuyến trợ năng: chữ lớn, độ tương phản cao, bàn phím và tay cầm",
    "ldDesc": "Các tính năng trợ năng của ứng dụng web PokerTH: kích thước giao diện, độ tương phản cao, bộ bài 4 màu, kính lúp, thông báo bằng giọng nói, bàn phím, tay cầm và điều khiển TV.",
    "h1": "Poker trợ năng: chơi theo cách của bạn",
    "lead": "PokerTH là Texas Hold’em miễn phí trên trình duyệt, và nó thích ứng với cách bạn nhìn và chơi: chữ và nút to hơn, độ tương phản mạnh hơn, bộ bài phân biệt các chất bằng màu, kính lúp cho màn hình nhỏ, thông báo bằng giọng nói, và điều khiển hoàn toàn bằng bàn phím, tay cầm hoặc điều khiển TV.",
    "findH2": "Tìm ở đâu",
    "findP": "Nút Trợ năng — biểu tượng hình người ở đầu mỗi màn hình, từ màn hình đăng nhập đến bàn chơi — mở các cài đặt chính bất cứ lúc nào, kể cả giữa ván bài. Mọi thứ khác nằm trong Tùy chọn nâng cao. Lựa chọn của bạn được ghi nhớ trên thiết bị và, khi bạn đăng nhập bằng tài khoản pokerth.net, sẽ theo bạn sang các thiết bị khác.",
    "seeH2": "Nhìn rõ bàn chơi",
    "see": [
      [
        "Kích thước giao diện",
        "Tiêu chuẩn, Lớn hoặc Rất lớn: chữ, lá bài, chip và nút cùng to lên, trên màn hình đăng nhập, trong sảnh và tại bàn, và bố cục tự sắp xếp lại để vẫn dễ dùng trên điện thoại."
      ],
      [
        "Độ tương phản cao",
        "Bảng màu tương phản mạnh hơn trên toàn bộ giao diện, từ menu đến bàn chơi, ở mọi kích thước giao diện."
      ],
      [
        "Bộ bài 4 màu",
        "Các bộ bài cho mỗi chất một màu riêng, nên không bao giờ phải phân biệt cơ với rô, hay bích với chuồn, chỉ bằng hình dạng. Chọn một bộ trong Tùy chọn nâng cao → Kiểu dáng."
      ],
      [
        "Kính lúp cho bàn",
        "Trên điện thoại, bàn chơi phóng to gấp đôi và kéo được bằng ngón tay; khung nhìn quay về chỗ ngồi của bạn khi đến lượt bạn. Cũng có thể cho phép thao tác chụm để phóng to của trình duyệt."
      ],
      [
        "Sáng, tối hoặc tự động",
        "Toàn bộ ứng dụng theo lựa chọn của bạn hoặc của hệ thống, với chủ đề, bộ bài và màu bàn hợp với mắt bạn."
      ]
    ],
    "keysH2": "Bàn phím",
    "keysP": "Mỗi hành động đều có một phím. Các phím chức năng chính thức của PokerTH hoạt động tại bàn — F1 đến F4 cho Fold, Check/Call, Bet/Raise và All-In, F5 để lật bài của bạn, F6 đến F8 cho các chế độ chơi — và ứng dụng web thêm các phím chữ đơn (F, C, R, A, cùng 1, 2, 3 cho một phần ba pot, nửa pot hoặc cả pot), tất cả đều gán lại được. Escape đóng cửa sổ trên cùng, Tab và các phím mũi tên di chuyển trong danh sách bàn ở sảnh, và Alt+S mở cài đặt từ bất cứ đâu.",
    "padH2": "Tay cầm và điều khiển TV",
    "padP": "Với một tay cầm chơi game — Xbox, PlayStation, Switch Pro và hầu hết tay cầm Bluetooth — bạn chơi được toàn bộ ván đấu: nút cho mọi hành động, cò để đặt mức cược, và một chế độ điều hướng để di chuyển qua các màn hình, khung trò chuyện và menu. Tay cầm rung khi đến lượt bạn. Trên Android TV và Google TV, điều khiển từ xa hoạt động theo cùng cách, và những điều khiển có bốn phím màu dùng chúng cho Fold, Check/Call, Bet/Raise và All-In.",
    "hearH2": "Nghe và cảm nhận ván bài",
    "hearP": "Thông báo bằng giọng nói đọc to các sự kiện trong ván bằng chính giọng đọc của thiết bị, bằng ngôn ngữ của bạn nếu hệ thống có. Trên điện thoại Android, một rung ngắn báo đến lượt bạn. Âm thanh trong ván chia thành bốn nhóm — hành động, trò chuyện, thông báo mạng và blind tăng — có thể bật tắt riêng, với một thanh trượt âm lượng duy nhất.",
    "calmH2": "Ít bất ngờ hơn",
    "calmP": "Khi hệ thống của bạn yêu cầu giảm chuyển động, ứng dụng sẽ làm dịu các hiệu ứng động. Chống nhìn trộm giữ bài của bạn úp cho đến khi bạn chạm vào, còn chống Call nhầm khóa nút Call trong chốc lát ngay sau một lần nâng lớn, để cú chạm định dành cho một Call nhỏ hơn không thể vô tình trả số tiền đã nâng.",
    "langH2": "Bằng ngôn ngữ của bạn, có người hướng dẫn",
    "langP": "Giao diện có sẵn bằng {langs} ngôn ngữ, hiển thị từ phải sang trái khi cần. Trợ giúp của quân Át — quân Át là linh vật của ứng dụng web — giải thích từng màn hình trong lúc bạn dùng nếu bạn muốn, và “Đây là gì?” cho bạn biết bất cứ thứ gì trên màn hình dùng để làm gì.",
    "faqH2": "Câu hỏi",
    "faq": [
      [
        "Tôi có thể làm lá bài và chữ to hơn không?",
        "Có. Chọn Lớn hoặc Rất lớn trong cửa sổ Trợ năng; lá bài, chữ và nút cùng to lên trên mọi màn hình, kể cả bàn chơi."
      ],
      [
        "Có chế độ độ tương phản cao không?",
        "Có, trong cửa sổ Trợ năng. Chế độ này dùng được với mọi kích thước giao diện."
      ],
      [
        "Tôi có thể chơi mà không cần chuột hay màn hình cảm ứng không?",
        "Có, hoàn toàn bằng bàn phím, bằng tay cầm hoặc bằng điều khiển Android TV."
      ],
      [
        "Có dùng được với trình đọc màn hình không?",
        "Chưa hoàn toàn. Thông báo bằng giọng nói đọc to các sự kiện trong ván và các menu đều có nhãn, nhưng bản thân bàn poker là giao diện trực quan và hiện chưa thể chơi chỉ bằng trình đọc màn hình."
      ],
      [
        "Có miễn phí không?",
        "Có. PokerTH là phần mềm miễn phí, mã nguồn mở, không quảng cáo và không mua hàng trong ứng dụng; mọi chip đều là tiền ảo."
      ]
    ]
  },
  yo: {
    "title": "Poker tó rọrùn láti lò — ọ̀rọ̀ ńlá, kíbọ́ọ̀dù, gamepad | PokerTH",
    "desc": "Texas Hold’em ọ̀fẹ́ pẹ̀lú ọ̀rọ̀ tó tóbi, ìyàtọ̀ àwọ̀ gíga, káàdì àwọ̀ mẹ́rin, awòsánmọ̀ tábìlì, ìkéde ohùn àti ìdarí pípé pẹ̀lú kíbọ́ọ̀dù, gamepad tàbí rìmóòtù TV.",
    "ldHeadline": "Poker orí ayélujára tó rọrùn láti lò: ọ̀rọ̀ ńlá, ìyàtọ̀ àwọ̀ gíga, kíbọ́ọ̀dù àti gamepad",
    "ldDesc": "Àwọn ẹ̀yà ìráyèsí oníbàárà wẹ́ẹ̀bù PokerTH: ìwọ̀n ojú olùlò, ìyàtọ̀ àwọ̀ gíga, káàdì àwọ̀ mẹ́rin, awòsánmọ̀, ìkéde ohùn, kíbọ́ọ̀dù, ẹ̀rọ ìdarí eré àti rìmóòtù TV.",
    "h1": "Poker tó rọrùn láti lò: ṣeré lọ́nà tìrẹ",
    "lead": "PokerTH jẹ́ Texas Hold’em ọ̀fẹ́ nínú aṣàwákiri, ó sì ń bá ọ̀nà tí o ń gbà ríran àti ṣeré mu: ọ̀rọ̀ àti bọ́tìnì tó tóbi sí i, ìyàtọ̀ àwọ̀ tó lágbára sí i, káàdì tí àmì kọ̀ọ̀kan ní àwọ̀ tirẹ̀, awòsánmọ̀ fún ojú kékeré, ìkéde ohùn, àti ìdarí pípé láti kíbọ́ọ̀dù, ẹ̀rọ ìdarí eré tàbí rìmóòtù TV.",
    "findH2": "Ibi tí o ti lè rí i",
    "findP": "Bọ́tìnì Ìráyèsí — àmì ènìyàn ní òkè gbogbo ojú, láti ojú ìwọlé dé tábìlì — ń ṣí àwọn ètò pàtàkì nígbàkígbà, kódà láàárín ọwọ́ kan. Gbogbo nǹkan yòókù wà nínú Àṣàyàn ìlọsíwájú. A ń rántí yíyàn rẹ lórí ẹ̀rọ náà, nígbà tí o bá sì wọlé pẹ̀lú àkáǹtì pokerth.net, wọ́n ń tẹ̀lé ọ lọ sí àwọn ẹ̀rọ rẹ mìíràn.",
    "seeH2": "Rírí tábìlì dáadáa",
    "see": [
      [
        "Ìwọ̀n ojú olùlò",
        "Àfiwé, Ńlá tàbí Ńlá gan-an: ọ̀rọ̀, káàdì, chips àti bọ́tìnì ń tóbi pọ̀, lójú ìwọlé, nínú gbọ̀ngàn àti ní tábìlì, ìṣètò ojú-ìwé sì ń tún ara rẹ̀ tò kí ó lè ṣeé lò lórí fóònù."
      ],
      [
        "Ìyàtọ̀ àwọ̀ gíga",
        "Àwọ̀ tó ní ìyàtọ̀ tó lágbára sí i káàkiri gbogbo ojú olùlò, láti àwọn àkójọ dé tábìlì, ní gbogbo ìwọ̀n ojú olùlò."
      ],
      [
        "Káàdì àwọ̀ mẹ́rin",
        "Àwọn káàdì tí ó fún àmì kọ̀ọ̀kan ní àwọ̀ tirẹ̀, kí o má bàa fi ìrísí nìkan ṣe ìyàtọ̀ láàárín hearts àti diamonds, tàbí spades àti clubs. Yan ọ̀kan nínú Àṣàyàn ìlọsíwájú → Ọ̀nà."
      ],
      [
        "Awòsánmọ̀ tábìlì",
        "Lórí fóònù, tábìlì ń sún mọ́ dé ìlọ́po méjì ìwọ̀n rẹ̀, o sì lè gbé e kiri pẹ̀lú ìka; ìwòye ń padà sí ìjókòó rẹ nígbà tí ó bá kàn ọ́. A tún lè gba ìsúnmọ́ aṣàwákiri pẹ̀lú ìka méjì láàyè."
      ],
      [
        "Ìmọ́lẹ̀, dúdú tàbí aládàáṣiṣẹ́",
        "Gbogbo oníbàárà ń tẹ̀lé yíyàn rẹ tàbí ti ètò rẹ, pẹ̀lú àwọn àkòrí, káàdì àti àwọ̀ tábìlì tí ó bá ojú rẹ mu."
      ]
    ],
    "keysH2": "Kíbọ́ọ̀dù",
    "keysP": "Ìgbésẹ̀ kọ̀ọ̀kan ní kọ́kọ́rọ́ tirẹ̀. Kọ́kọ́rọ́ iṣẹ́ ìjọba PokerTH ń ṣiṣẹ́ ní tábìlì — F1 sí F4 fún Fold, Check/Call, Bet/Raise àti All-In, F5 láti fi káàdì rẹ hàn, F6 sí F8 fún àwọn ipò ṣíṣeré — oníbàárà wẹ́ẹ̀bù sì ń fi lẹ́tà kan ṣoṣo kún un (F, C, R, A, àti 1, 2, 3 fún ìdámẹ́ta pot, ìdajì pot tàbí gbogbo pot), gbogbo wọn sì ṣeé yàn sí kọ́kọ́rọ́ mìíràn. Esc ń pa fèrèsé tó wà lókè, Tab àti àwọn kọ́kọ́rọ́ ọfà ń rìn nínú àkójọ tábìlì gbọ̀ngàn, Alt+S sì ń ṣí àwọn ètò láti ibikíbi.",
    "padH2": "Ẹ̀rọ ìdarí eré àti rìmóòtù TV",
    "padP": "Ẹ̀rọ ìdarí eré — Xbox, PlayStation, Switch Pro àti ọ̀pọ̀ ẹ̀rọ ìdarí Bluetooth — ń ṣe gbogbo eré náà: bọ́tìnì fún ìgbésẹ̀ kọ̀ọ̀kan, trigger láti ṣètò tẹ́tẹ́, àti ipò Ìrìnkiri láti rìn kiri nínú àwọn ojú, ìjíròrò àti àwọn àkójọ. Ó ń gbọ̀n nígbà tí ó bá kàn ọ́. Lórí Android TV àti Google TV, rìmóòtù ń ṣiṣẹ́ lọ́nà kan náà, àwọn rìmóòtù tó ní kọ́kọ́rọ́ àwọ̀ mẹ́rin sì ń lò wọ́n fún Fold, Check/Call, Bet/Raise àti All-In.",
    "hearH2": "Gbígbọ́ àti mímọ̀ eré lára",
    "hearP": "Ìkéde ohùn ń ka àwọn ìṣẹ̀lẹ̀ eré sókè pẹ̀lú àwọn ohùn ẹ̀rọ rẹ fúnra rẹ̀, ní èdè rẹ bí ètò náà bá ní i. Lórí fóònù Android, ìgbọ̀nrìrì kúkúrú ń sàmì sí àkókò rẹ. Ohùn eré pín sí ẹgbẹ́ mẹ́rin — ìgbésẹ̀, ìjíròrò, ìkìlọ̀ nẹ́tíwọ̀ọ̀kì àti ìgbéga blind — tí a lè tàn tàbí pa lọ́tọ̀ọ̀tọ̀, pẹ̀lú atọ́ka ìwọ̀n ohùn kan ṣoṣo.",
    "calmH2": "Ìyàlẹ́nu díẹ̀",
    "calmP": "Nígbà tí ètò rẹ bá béèrè fún ìṣípòpadà díẹ̀, oníbàárà ń dín ìṣípòpadà àwòrán rẹ̀ kù. Ààbò wíwò ń pa káàdì rẹ mọ́ títí o fi fọwọ́ kàn wọ́n, ààbò Call àìròtẹ́lẹ̀ sì ń dí bọ́tìnì Call fún ìgbà kúkúrú lẹ́yìn raise ńlá, kí ìfọwọ́kàn tí a pinnu fún call kékeré má bàa san iye raise náà láìròtẹ́lẹ̀.",
    "langH2": "Ní èdè rẹ, pẹ̀lú amọ̀nà",
    "langP": "Ojú olùlò wà ní èdè {langs}, láti ọ̀tún sí òsì níbi tí ó bá yẹ. Pẹ̀lú Ìrànlọ́wọ́ Ace, Ace — àmì-ìdánimọ̀ oníbàárà wẹ́ẹ̀bù — ń ṣàlàyé ojú kọ̀ọ̀kan bí o ṣe ń lọ, bí o bá fẹ́, “Kí ni èyí?” sì ń sọ ohun tí ohunkóhun lójú ìbòjú ń ṣe fún ọ.",
    "faqH2": "Àwọn ìbéèrè",
    "faq": [
      [
        "Ṣé mo lè mú káàdì àti ọ̀rọ̀ tóbi sí i?",
        "Bẹ́ẹ̀ ni. Yan Ńlá tàbí Ńlá gan-an nínú fèrèsé Ìráyèsí; káàdì, ọ̀rọ̀ àti bọ́tìnì ń tóbi pọ̀ lórí gbogbo ojú, títí kan tábìlì."
      ],
      [
        "Ṣé ipò ìyàtọ̀ àwọ̀ gíga wà?",
        "Bẹ́ẹ̀ ni, nínú fèrèsé Ìráyèsí. Ó ń ṣiṣẹ́ pẹ̀lú gbogbo ìwọ̀n ojú olùlò."
      ],
      [
        "Ṣé mo lè ṣeré láìsí eku kọ̀ǹpútà tàbí ojú ìfọwọ́kàn?",
        "Bẹ́ẹ̀ ni, pẹ̀lú kíbọ́ọ̀dù nìkan, pẹ̀lú ẹ̀rọ ìdarí eré, tàbí pẹ̀lú rìmóòtù Android TV."
      ],
      [
        "Ṣé ó ń ṣiṣẹ́ pẹ̀lú ẹ̀rọ olùkàwé ojú-ìbòjú?",
        "Kì í ṣe pátápátá síbẹ̀. Ìkéde ohùn ń ka àwọn ìṣẹ̀lẹ̀ eré sókè, àwọn àkójọ sì ní àmì-orúkọ, ṣùgbọ́n tábìlì poker fúnra rẹ̀ jẹ́ ojú olùlò tí a ń fi ojú rí, a kò sì tíì lè ṣe é pẹ̀lú ẹ̀rọ olùkàwé ojú-ìbòjú nìkan."
      ],
      [
        "Ṣé ọ̀fẹ́ ni?",
        "Bẹ́ẹ̀ ni. PokerTH jẹ́ sọ́fítíwọ̀ ọ̀fẹ́ orísun ṣíṣí, kò sí ìpolówó, kò sì sí ríra nínú ìṣàfilọ́lẹ̀; gbogbo chips jẹ́ owó eré."
      ]
    ]
  },
  zh: {
    "title": "无障碍德州扑克 — 大字体、键盘、游戏手柄 | PokerTH",
    "desc": "免费德州扑克：更大的字体、高对比度、四色牌组、牌桌放大镜、语音播报，并可完全用键盘、游戏手柄或电视遥控器操作。",
    "ldHeadline": "无障碍在线扑克：大字体、高对比度、键盘和游戏手柄",
    "ldDesc": "PokerTH 网页客户端的无障碍功能：界面大小、高对比度、四色牌组、放大镜、语音播报、键盘、游戏手柄和电视遥控器。",
    "h1": "无障碍扑克：按你的方式玩",
    "lead": "PokerTH 是在浏览器中免费玩的德州扑克，它会适应你观看和游玩的方式：更大的文字和按钮、更强的对比度、用颜色区分花色的牌组、适合小屏幕的放大镜、语音播报，以及用键盘、游戏手柄或电视遥控器完整操控。",
    "findH2": "在哪里找到",
    "findP": "“无障碍功能”按钮 — 每个界面顶部的人形图标，从登录界面到牌桌都有 — 可随时打开主要设置，即使在一手牌进行中也可以。其余所有选项都在高级选项中。你的选择会保存在设备上；用 pokerth.net 账号登录时，还会跟随你到其他设备上。",
    "seeH2": "看清牌桌",
    "see": [
      [
        "界面大小",
        "标准、大或特大：文字、纸牌、筹码和按钮一起放大，登录界面、大厅和牌桌皆然，布局也会重新排列，在手机上依然好用。"
      ],
      [
        "高对比度",
        "整个界面采用对比更强的配色，从菜单到牌桌，在任何界面大小下都有效。"
      ],
      [
        "四色牌组",
        "为每种花色赋予独立颜色的牌组，让红心与方块、黑桃与梅花不必只靠形状区分。可在高级选项 → 风格中选择。"
      ],
      [
        "牌桌放大镜",
        "在手机上，牌桌可放大到两倍并用手指拖动；轮到你时视图会回到你的座位。也可以允许浏览器的双指缩放。"
      ],
      [
        "浅色、深色或自动",
        "整个客户端遵循你的选择或系统设置，并有主题、牌组和牌桌颜色可按你的视觉需要挑选。"
      ]
    ],
    "keysH2": "键盘",
    "keysP": "每个动作都有对应按键。PokerTH 官方功能键在牌桌上有效 — F1 到 F4 对应 Fold、Check/Call、Bet/Raise 和 All-In，F5 亮出你的牌，F6 到 F8 切换打法模式 — 网页客户端还增加了单字母键（F、C、R、A，以及 1、2、3 分别对应三分之一底池、半个底池和整个底池），全部可以重新绑定。Esc 关闭最上层窗口，Tab 和方向键可在大厅的牌桌列表中移动，Alt+S 在任何地方都能打开设置。",
    "padH2": "游戏手柄和电视遥控器",
    "padP": "游戏手柄 — Xbox、PlayStation、Switch Pro 以及大多数 Bluetooth 手柄 — 可以玩完整个游戏：每个动作都有按键，扳机键调整下注额，导航模式可在各个界面、聊天和菜单之间移动。轮到你时手柄会震动。在 Android TV 和 Google TV 上，遥控器的用法相同，带四个彩色键的遥控器会用它们执行 Fold、Check/Call、Bet/Raise 和 All-In。",
    "hearH2": "听见并感受牌局",
    "hearP": "语音播报用你设备自带的语音朗读游戏事件，系统支持时使用你的语言。在 Android 手机上，一次短振动提示轮到你。游戏音效分为四组 — 动作、聊天、网络通知和盲注提升 — 可分别开关，并共用一个音量滑块。",
    "calmH2": "减少意外",
    "calmP": "当你的系统要求减少动态效果时，客户端会减弱自己的动画。防偷看让你自己的牌保持盖住，直到你点按它们；防误跟注保护会在大幅加注后短暂锁定 Call 按钮，避免本想跟小注的点按误付加注后的金额。",
    "langH2": "用你的语言，还有向导",
    "langP": "界面提供 {langs} 种语言，需要时支持从右到左显示。如果你愿意，网页客户端的吉祥物 A 牌小助手会随着你的操作讲解每个界面，“这是什么？”则会告诉你屏幕上任何东西的作用。",
    "faqH2": "常见问题",
    "faq": [
      [
        "能把纸牌和文字调大吗？",
        "可以。在无障碍功能窗口中选择“大”或“特大”；纸牌、文字和按钮会在每个界面上一起放大，牌桌也不例外。"
      ],
      [
        "有高对比度模式吗？",
        "有，在无障碍功能窗口中。它适用于所有界面大小。"
      ],
      [
        "不用鼠标或触摸屏也能玩吗？",
        "可以，完全可以用键盘、游戏手柄或 Android TV 遥控器来玩。"
      ],
      [
        "支持屏幕阅读器吗？",
        "尚未完全支持。语音播报会朗读游戏事件，菜单也带有标签，但扑克牌桌本身是可视化界面，目前还无法仅靠屏幕阅读器来玩。"
      ],
      [
        "免费吗？",
        "是的。PokerTH 是免费的开源软件，没有广告，也没有应用内购买；所有筹码都是游戏币。"
      ]
    ]
  },
  "zh-HK": {
    "title": "無障礙撲克 — 大字體、鍵盤、遊戲手掣 | PokerTH",
    "desc": "免費德州撲克：更大字體、高對比、四色牌組、牌桌放大鏡、語音播報，並可完全用鍵盤、遊戲手掣或電視遙控遊玩。",
    "ldHeadline": "無障礙網上撲克：大字體、高對比、鍵盤與遊戲手掣",
    "ldDesc": "PokerTH 網頁版客戶端的無障礙功能：介面大小、高對比、四色牌組、放大鏡、語音播報、鍵盤、遊戲手掣和電視遙控。",
    "h1": "無障礙撲克：用你的方式玩",
    "lead": "PokerTH 是在瀏覽器中免費玩的 Texas Hold’em 德州撲克，並會配合你看牌和打牌的方式：更大的文字和按鈕、更強的對比、以顏色區分花色的牌組、小屏幕用的放大鏡、語音播報，以及用鍵盤、遊戲手掣或電視遙控完全操控。",
    "findH2": "在哪裡找到",
    "findP": "無障礙功能按鈕 — 每個畫面頂部的人形圖示，從登入畫面到牌桌都有 — 隨時開啟主要設定，即使在一手牌中途也可以。其他一切都在進階選項中。你的選擇會記在裝置上；如果你用 pokerth.net 帳戶登入，它們還會跟隨你到其他裝置。",
    "seeH2": "看清牌桌",
    "see": [
      [
        "介面大小",
        "標準、大或特大：文字、牌、籌碼和按鈕在登入畫面、大堂和牌桌上一起放大，版面亦會重新排列，在手機上依然好用。"
      ],
      [
        "高對比",
        "整個介面由選單到牌桌都採用對比更強的配色，適用於每種介面大小。"
      ],
      [
        "四色牌組",
        "每種花色各有自己顏色的牌組，紅心和方塊、黑桃和梅花永遠不必只靠形狀來分辨。可在進階選項 → 風格中挑選。"
      ],
      [
        "牌桌放大鏡",
        "在手機上，牌桌可放大至兩倍並用手指拖動；輪到你時，視圖會回到你的座位。亦可允許使用瀏覽器的雙指縮放。"
      ],
      [
        "淺色、深色或自動",
        "整個客戶端跟隨你或系統的選擇，主題、牌組和牌桌顏色都可配合你的眼睛。"
      ]
    ],
    "keysH2": "鍵盤",
    "keysP": "每個動作都有按鍵。PokerTH 官方功能鍵在牌桌上可用 — F1 至 F4 對應 Fold、Check/Call、Bet/Raise 和 All-In，F5 亮出你的牌，F6 至 F8 切換遊戲模式 — 網頁版客戶端另加單字母鍵（F、C、R、A，以及 1、2、3 分別下注三分之一底池、半個底池或整個底池），全部都可重新指定。Escape 關閉最上層視窗，Tab 和方向鍵可在大堂的牌桌清單中移動，Alt+S 則可在任何地方開啟設定。",
    "padH2": "遊戲手掣與電視遙控",
    "padP": "遊戲手掣 — Xbox、PlayStation、Switch Pro 及大部分 Bluetooth 手掣 — 可以玩整個遊戲：每個動作都有按鈕，用扳機鍵調整注額，還有導覽模式在畫面、聊天和選單之間移動。輪到你時它會震動。在 Android TV 和 Google TV 上，遙控的用法相同，有四個顏色鍵的遙控會用它們來 Fold、Check/Call、Bet/Raise 和 All-In。",
    "hearH2": "聽到和感受牌局",
    "hearP": "語音播報用你裝置本身的語音朗讀遊戲事件，系統有你的語言時就用你的語言。在 Android 手機上，一次短震動提示輪到你。遊戲音效分為四組 — 動作、聊天、網絡通知和盲注上升 — 可分別開關，並共用一個音量滑桿。",
    "calmH2": "更少意外",
    "calmP": "當你的系統要求減少動態效果時，客戶端會減弱動畫。防偷看讓你自己的牌保持蓋住，直到你點按它們；防誤跟注保護會在大幅加注後短暫鎖定 Call 按鈕，避免本想跟小注的點按誤付加注後的金額。",
    "langH2": "用你的語言，還有嚮導",
    "langP": "介面提供 {langs} 種語言，需要時由右至左顯示。透過 A 牌小幫手，網頁版客戶端的吉祥物 A 牌會在你使用時逐一解釋每個畫面（只要你願意）；「這是甚麼？」則告訴你畫面上任何東西的作用。",
    "faqH2": "問題",
    "faq": [
      [
        "可以把牌和文字放大嗎？",
        "可以。在無障礙功能視窗中選擇「大」或「特大」；牌、文字和按鈕會在每個畫面一起放大，包括牌桌。"
      ],
      [
        "有高對比模式嗎？",
        "有，在無障礙功能視窗中。它適用於每種介面大小。"
      ],
      [
        "可以不用滑鼠或觸控屏幕玩嗎？",
        "可以，完全用鍵盤、遊戲手掣或 Android TV 遙控都行。"
      ],
      [
        "可以配合屏幕閱讀器使用嗎？",
        "暫時未完全可以。語音播報會朗讀遊戲事件，選單也有標籤，但撲克牌桌本身是視覺介面，目前還不能只靠屏幕閱讀器來玩。"
      ],
      [
        "是免費的嗎？",
        "是。PokerTH 是免費的開源軟件，沒有廣告，也沒有應用程式內購買；所有籌碼都只是遊戲幣。"
      ]
    ]
  },
  "zh-TW": {
    "title": "無障礙撲克 — 大字體、鍵盤、遊戲手把 | PokerTH",
    "desc": "免費 Texas Hold’em（德州撲克），提供大字體、高對比、四色牌組、牌桌放大鏡與語音播報，並可完全用鍵盤、遊戲手把或電視遙控器遊玩。",
    "ldHeadline": "無障礙線上撲克：大字體、高對比、鍵盤與遊戲手把",
    "ldDesc": "PokerTH 網頁用戶端的無障礙功能：介面大小、高對比、四色牌組、放大鏡、語音播報、鍵盤、遊戲手把與電視遙控器。",
    "h1": "無障礙撲克：用你的方式玩",
    "lead": "PokerTH 是在瀏覽器裡免費玩的 Texas Hold’em（德州撲克），能配合你看牌和玩牌的方式調整：更大的文字和按鈕、更強的對比、以顏色區分花色的牌組、適合小螢幕的放大鏡、語音播報，還能完全用鍵盤、遊戲手把或電視遙控器操作。",
    "findH2": "在哪裡找到",
    "findP": "「無障礙功能」按鈕——每個畫面頂端的人形圖示，從登入畫面到牌桌都有——隨時都能開啟主要設定，即使一手牌正在進行也可以。其他所有設定都在進階選項中。你的選擇會記在裝置上；用 pokerth.net 帳號登入時，還會跟著你到其他裝置。",
    "seeH2": "看清牌桌",
    "see": [
      [
        "介面大小",
        "標準、大或特大：文字、牌、籌碼和按鈕會一起放大，登入畫面、大廳和牌桌都一樣，版面也會重新排列，在手機上依然好用。"
      ],
      [
        "高對比",
        "整個介面從選單到牌桌都改用對比更強的配色，任何介面大小都適用。"
      ],
      [
        "四色牌組",
        "每種花色都有自己顏色的牌組，紅心和方塊、黑桃和梅花再也不必只靠形狀分辨。可在進階選項 → 風格中選擇。"
      ],
      [
        "牌桌放大鏡",
        "在手機上，牌桌可放大到兩倍並用手指拖動；輪到你時，畫面會回到你的座位。也可以允許瀏覽器的雙指縮放。"
      ],
      [
        "淺色、深色或自動",
        "整個用戶端會依照你的選擇或系統設定，搭配適合你眼睛的主題、牌組和牌桌顏色。"
      ]
    ],
    "keysH2": "鍵盤",
    "keysP": "每個動作都有對應按鍵。PokerTH 官方功能鍵在牌桌上都能用——F1 到 F4 分別是 Fold、Check/Call、Bet/Raise 和 All-In，F5 亮出你的牌，F6 到 F8 切換打法模式——網頁用戶端另外加上單一字母鍵（F、C、R、A，以及 1、2、3 分別代表三分之一底池、半個底池或整個底池），全都可以重新設定。Esc 關閉最上層的視窗，Tab 和方向鍵可在大廳的牌桌列表中移動，Alt+S 則能在任何地方開啟設定。",
    "padH2": "遊戲手把與電視遙控器",
    "padP": "遊戲手把——Xbox、PlayStation、Switch Pro 及大多數 Bluetooth 手把——可以玩完整場遊戲：每個動作都有按鈕，用扳機鍵設定下注金額，還有導覽模式可在各畫面、聊天和選單間移動。輪到你時手把會震動。在 Android TV 和 Google TV 上，遙控器的用法相同；有四個彩色按鍵的遙控器會用它們來 Fold、Check/Call、Bet/Raise 和 All-In。",
    "hearH2": "聽見與感受牌局",
    "hearP": "語音播報會用你裝置本身的語音朗讀遊戲事件，系統有你的語言時就用你的語言。在 Android 手機上，一次短震動會提示輪到你。遊戲音效分成四組——動作、聊天、網路通知和盲注上升——可分別開關，並共用一個音量滑桿。",
    "calmH2": "減少意外",
    "calmP": "當系統要求減少動態效果時，用戶端會減弱動畫。防偷看讓你自己的牌保持蓋住，直到你點按它們；防誤跟注保護會在大幅加注後短暫鎖定 Call 按鈕，避免本想跟小注的點按誤付加注後的金額。",
    "langH2": "用你的語言，還有嚮導",
    "langP": "介面提供 {langs} 種語言，需要時支援由右至左書寫。A 牌小幫手——網頁用戶端的吉祥物 A 牌——會依你的意願，隨著你的操作說明每個畫面，「這是什麼？」則告訴你畫面上任何東西的作用。",
    "faqH2": "常見問題",
    "faq": [
      [
        "可以把牌和文字放大嗎？",
        "可以。在「無障礙功能」視窗中選擇「大」或「特大」；牌、文字和按鈕會在每個畫面一起放大，牌桌也一樣。"
      ],
      [
        "有高對比模式嗎？",
        "有，在「無障礙功能」視窗中。任何介面大小都能使用。"
      ],
      [
        "不用滑鼠或觸控螢幕也能玩嗎？",
        "可以，完全用鍵盤、遊戲手把或 Android TV 遙控器就能玩。"
      ],
      [
        "能搭配螢幕閱讀器使用嗎？",
        "目前還不能完全支援。語音播報會朗讀遊戲事件，選單也有標籤，但撲克牌桌本身是視覺介面，目前還無法只靠螢幕閱讀器來玩。"
      ],
      [
        "免費嗎？",
        "是的。PokerTH 是免費的開放原始碼軟體，沒有廣告，也沒有 App 內購；所有籌碼都只是遊戲幣。"
      ]
    ]
  },
  zu: {
    "title": "I-poker efinyelelekayo — umbhalo omkhulu, ikhibhodi, gamepad | PokerTH",
    "desc": "I-Texas Hold’em yamahhala: umbhalo omkhulu, umehluko ophezulu, amakhadi anemibala emine, ingilazi ekhulisayo, izimemezelo zezwi, ikhibhodi, i-gamepad nerimothi ye-TV.",
    "ldHeadline": "I-poker ye-inthanethi efinyelelekayo: umbhalo omkhulu, umehluko ophezulu, ikhibhodi nesilawuli somdlalo",
    "ldDesc": "Izici zokufinyeleleka zeklayenti lewebhu le-PokerTH: usayizi wesixhumi esibonakalayo, umehluko ophezulu, amakhadi anemibala emine, ingilazi ekhulisayo, izimemezelo zezwi, ikhibhodi, isilawuli somdlalo nerimothi ye-TV.",
    "h1": "I-poker efinyelelekayo: dlala ngendlela yakho",
    "lead": "I-PokerTH iyi-Texas Hold’em yamahhala esipheqululini, futhi izivumelanisa nendlela obona ngayo nodlala ngayo: umbhalo nezinkinobho ezinkulu, umehluko oqinile, amakhadi ahlukanisa izinhlobo zawo ngombala, ingilazi ekhulisayo yezikrini ezincane, izimemezelo zezwi, nokulawula okugcwele ngekhibhodi, ngesilawuli somdlalo noma ngerimothi ye-TV.",
    "findH2": "Ungakuthola kuphi",
    "findP": "Inkinobho ethi Ukufinyeleleka — isithonjana somuntu phezulu kuso sonke isikrini, kusukela esikrinini sokungena kuya etafuleni — ivula izilungiselelo eziyinhloko noma nini, ngisho naphakathi nesandla. Konke okunye kuku-Izinketho ezithuthukisiwe. Ukukhetha kwakho kukhunjulwa kudivayisi futhi, uma ungena nge-akhawunti ye-pokerth.net, kukulandela kwamanye amadivayisi akho.",
    "seeH2": "Ukubona itafula kahle",
    "see": [
      [
        "Usayizi wesixhumi esibonakalayo",
        "Okujwayelekile, Kukhulu noma Kukhulu kakhulu: umbhalo, amakhadi, ama-chip nezinkinobho kukhula ndawonye, esikrinini sokungena, elobhi nasetafuleni, futhi ukuhlelwa kwesikrini kuyazilungisa ukuze kuhlale kusebenziseka efonini."
      ],
      [
        "Umehluko ophezulu",
        "Imibala enomehluko oqinile kuso sonke isixhumi esibonakalayo, kusukela kumamenyu kuya etafuleni, kuwo wonke usayizi wesixhumi esibonakalayo."
      ],
      [
        "Amakhadi anemibala emine",
        "Amaphakethe amakhadi anika uhlobo ngalunye umbala walo, ukuze izinhliziyo namadayimane, noma ama-spade nama-club, angalokothi ahlukaniswe ngesimo kuphela. Khetha elilodwa ku-Izinketho ezithuthukisiwe → Isitayela."
      ],
      [
        "Ingilazi ekhulisayo yetafula",
        "Efonini, itafula likhuliswa liphindwe kabili futhi lihanjiswa ngomunwe; ukubuka kubuyela esihlalweni sakho lapho kuyithuba lakho. Ukusondeza kwesiphequluli ngokuncinza nakho kungavunyelwa."
      ],
      [
        "Imodi ekhanyayo, emnyama noma ezenzakalelayo",
        "Iklayenti lonke lilandela ukukhetha kwakho noma okwesistimu yakho, ngamatimu, amakhadi nemibala yetafula evumelana namehlo akho."
      ]
    ],
    "keysH2": "Ikhibhodi",
    "keysP": "Isenzo ngasinye sinokhiye waso. Okhiye bemisebenzi abasemthethweni be-PokerTH bayasebenza etafuleni — F1 kuya ku-F4 we-Fold, Check/Call, Bet/Raise ne-All-In, F5 ukubonisa amakhadi akho, F6 kuya ku-F8 wamamodi okudlala — futhi iklayenti lewebhu lengeza izinhlamvu ezizodwa (F, C, R, A, kanye no-1, 2, 3 wengxenye yesithathu ye-pot, uhhafu we-pot noma i-pot yonke), zonke ezingabelwa kabusha. I-Escape ivala iwindi eliphezulu, i-Tab nokhiye bemicibisholo bahamba ohlwini lwamatafula elobhi, futhi i-Alt+S ivula izilungiselelo noma kuphi.",
    "padH2": "I-gamepad nerimothi ye-TV",
    "padP": "Isilawuli somdlalo — Xbox, PlayStation, Switch Pro neziningi izilawuli ze-Bluetooth — sidlala umdlalo wonke: izinkinobho zesenzo ngasinye, ama-trigger okusetha ukubheja, nemodi yokuzulazula ukuze uhambe ezikrinini, engxoxweni nasemamenyu. Siyadlidliza lapho kufika ithuba lakho. Ku-Android TV naku-Google TV irimothi isebenza ngendlela efanayo, futhi amarimothi anokhiye abanemibala emine abasebenzisela i-Fold, Check/Call, Bet/Raise ne-All-In.",
    "hearH2": "Ukuzwa nokuzizwa umdlalo",
    "hearP": "Izimemezelo zezwi zifunda izehlakalo zomdlalo ngokuzwakalayo ngamazwi edivayisi yakho, ngolimi lwakho uma isistimu inalo. Kumafoni e-Android ukudlidliza okufushane kumaka ithuba lakho. Imisindo yomdlalo iza ngamaqembu amane — izenzo, ingxoxo, izaziso zenethiwekhi nokukhushulwa kwama-blinds — angavulwa noma avalwe ngokwehlukana, ngesilayida sevolumu esisodwa.",
    "calmH2": "Izimanga ezimbalwa",
    "calmP": "Uma isistimu yakho icela ukunciphisa ukunyakaza, iklayenti linciphisa opopayi balo. Ukuvikela ekulunguzeni kugcina amakhadi akho efihliwe uze uwathephe, futhi ukuvikela i-call engahlosiwe kuvimba inkinobho ethi Call isikhashana ngemuva kwe-raise enkulu, ukuze ukuthepha okuhloselwe i-call encane kungakhokhi inani le-raise ngephutha.",
    "langH2": "Ngolimi lwakho, nomhlahlandlela",
    "langP": "Isixhumi esibonakalayo sitholakala ngezilimi ezingu-{langs}, kusukela kwesokudla kuya kwesokunxele lapho kudingeka. Usizo luka-Ace — i-Ace iwuphawu lweklayenti lewebhu — luchaza isikrini ngasinye njengoba uqhubeka uma ufuna, futhi “Kuyini lokhu?” ikutshela ukuthi yini eyenziwa yinoma yini esesikrinini.",
    "faqH2": "Imibuzo",
    "faq": [
      [
        "Ngingawakhulisa yini amakhadi nombhalo?",
        "Yebo. Khetha Kukhulu noma Kukhulu kakhulu ewindini elithi Ukufinyeleleka; amakhadi, umbhalo nezinkinobho kukhula ndawonye kuso sonke isikrini, kuhlanganise netafula."
      ],
      [
        "Ingabe ikhona imodi yomehluko ophezulu?",
        "Yebo, ewindini elithi Ukufinyeleleka. Isebenza nawo wonke usayizi wesixhumi esibonakalayo."
      ],
      [
        "Ngingadlala yini ngaphandle kwegundane noma isikrini sokuthinta?",
        "Yebo, ngokuphelele ngekhibhodi, ngesilawuli somdlalo noma ngerimothi ye-Android TV."
      ],
      [
        "Ingabe iyasebenza nesifundi sesikrini?",
        "Hhayi ngokuphelele okwamanje. Izimemezelo zezwi zifunda izehlakalo zomdlalo ngokuzwakalayo futhi amamenyu anamalebula, kodwa itafula le-poker ngokwalo liyisixhumi esibonakalayo esibukwayo futhi alikakwazi ukudlalwa ngesifundi sesikrini sodwa."
      ],
      [
        "Ingabe imahhala?",
        "Yebo. I-PokerTH iyisofthiwe yamahhala nomthombo ovulekile, engenazikhangiso futhi engenakho ukuthenga ngaphakathi kohlelo; wonke ama-chip ayimali yokudlala."
      ]
    ]
  }
};
