'use strict';
// Translations for the /host-a-server page (the PokerTH server and the web
// client on your own machine: install paths, Raspberry Pi, HTTPS, admin
// panel, invitation links and the public server list).
//
// English lives in proxy.js (_SEO_HOST) and is the fallback; a language is
// advertised (hreflang, sitemap, nav link, IndexNow) the moment its entry
// lands here, never before. Same keys as _SEO_HOST: why[3], steps[3] and
// faq[5] are [title, text] pairs; guides[7] are link labels whose URLs live
// in proxy.js (_SEO_HOST_GUIDES), in the same order.
module.exports = {
  af: {
    "title": "Bedryf jou eie pokerbediener — gratis, self-gehuisves | PokerTH",
    "desc": "’n Privaat Texas Hold’em-bediener tuis, in ’n klub of skool: die gratis PokerTH-bediener en webkliënt, met een opdrag opgestel, met Docker of op ’n Raspberry Pi.",
    "ldHeadline": "Hoe om jou eie PokerTH-pokerbediener te bedryf",
    "ldDesc": "Stel ’n privaat, self-gehuisveste Texas Hold’em-bediener op met die toegewyde PokerTH-bediener en die PokerTH-webkliënt.",
    "h1": "Bedryf jou eie pokerbediener",
    "lead": "PokerTH is van begin tot einde gratis en oopbron: die spelbediener en hierdie webkliënt kan op jou eie masjien loop. ’n Rekenaar, ’n tuisbediener of ’n Raspberry Pi is genoeg vir ’n gesinspel, ’n klubaand, ’n kantoorliga of ’n skool, en elke foon, tablet of rekenaar op jou netwerk speel dan in sy blaaier met net ’n bynaam.",
    "whyH2": "Waarom jou eie bediener",
    "why": [
      [
        "Privaat",
        "Jou spelle bly op jou masjien en jou netwerk; spelers het geen rekening en geen e-posadres nodig nie, net ’n bynaam."
      ],
      [
        "Soos jy dit wil hê",
        "Gee die bediener sy eie naam, kies watter modusse die aanmeldskerm aanbied, plaas ’n welkomsboodskap en hou ’n gedeelde ranglys vir jou groep."
      ],
      [
        "Gratis",
        "Geen lisensie, geen intekening, geen advertensies nie: die PokerTH-bediener en die webkliënt is albei vrye sagteware."
      ]
    ],
    "partsH2": "Twee dele",
    "partsP": "’n PokerTH-spel het die toegewyde PokerTH-bediener nodig, wat die kaarte uitdeel en die tafels bestuur, en die webkliënt, wat die toep aan die blaaiers bedien en hulle met daardie bediener verbind. Albei kan op dieselfde masjien loop. Alles bly versoenbaar: die PokerTH-toepe koppel aan dieselfde bediener as die blaaiers — die QML-kliënt op Windows, macOS, Linux en Android, en die klassieke widget-kliënt op die rekenaar — sodat spelers blaaiers en toepe aan een tafel kan meng.",
    "stepsH2": "Stel dit in drie stappe op",
    "steps": [
      [
        "Installeer die PokerTH-bediener",
        "Bou pokerth_dedicated_server uit die PokerTH-bronkode — weergawe 2.1.10 of later — volgens die bedienergids van die PokerTH-projek: dit het Qt 6.7 of nuwer, CMake en ’n C++23-samesteller nodig. Die pakket pokerth-server van Linux-distribusies is ’n ouer weergawe. Die bediener luister op TCP-poort 7234."
      ],
      [
        "Installeer die webkliënt",
        "Op Debian, Ubuntu of Raspberry Pi OS stel die installasieskrip Node.js, die webkliënt en ’n diens wat saam met die masjien begin, met een opdrag op. Docker-gebruikers trek ’n gereedgemaakte beeld vir amd64, arm64 en armv7 af, en CasaOS voer dieselfde Compose-lêer as ’n toep in."
      ],
      [
        "Speel",
        "Maak op enige toestel op jou netwerk die adres van die masjien op poort 8080 oop, kies “LAN / Toegewyde bediener”, tik ’n bynaam in en skep ’n tafel. Spelers met die PokerTH QML- of widget-kliënt koppel aan dieselfde masjien op poort 7234 en sluit by dieselfde tafels aan."
      ]
    ],
    "piH2": "Op ’n Raspberry Pi",
    "piP": "PokerTH stuur klein boodskappe heen en weer en die spelers se toestelle doen al die tekenwerk, so ’n Raspberry Pi is volop genoeg: ’n Pi 4 met 2 GB is die ideale keuse, ’n Pi 5 is meer as genoeg. Vir ’n gladde aand tel die netwerk meer as die bord — koppel die Pi met ’n kabel aan die roeteerder, en gebruik ’n goeie Wi-Fi-toegangspunt vir die spelers.",
    "httpsH2": "HTTP op die LAN, HTTPS vir die ekstras",
    "httpsP": "Op jou eie netwerk werk die spel oor gewone HTTP. Om die toep op die tuisskerm te installeer, aflyn te speel en kennisgewings te ontvang, is HTTPS nodig, wat die gids met Nginx en ’n gratis Let’s Encrypt-sertifikaat opstel.",
    "adminH2": "’n Adminpaneel in die blaaier",
    "adminP": "’n Konsole by /admin, beskerm met ’n token, wys wie gekoppel is, dateer die webkliënt met een klik op en kan dit terugrol, stuur aankondigings aan die spelers, stel die ranglys terug, installeer kaartstelle, tafelstyle en musiek, lys die spelbedieners wat die kliënt mag bereik, en deel sleutels uit wat net sommige van sy afdelings ontsluit.",
    "shareH2": "Nooi spelers van buite",
    "shareP": "Uitnodigingskakels en QR-kodes werk op jou bediener net soos op pokerth.net: ’n vriend maak die skakel oop en kry ’n plek aan jou tafel. As jou bediener van die internet af bereikbaar is, kan jy dit ook vir die openbare bedienerlys van die webkliënt voorstel; dit verskyn daar sodra die admins van die webkliënt dit goedkeur.",
    "guidesH2": "Stap-vir-stap-gidse",
    "guides": [
      "Opstelgids vir die PokerTH-bediener",
      "Self-huisvesting en installasie met een opdrag",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Handmatige installasie en HTTPS",
      "Die adminpaneel"
    ],
    "faqH2": "Vrae",
    "faq": [
      [
        "Is dit gratis om ’n PokerTH-bediener te bedryf?",
        "Ja. Die PokerTH-bediener en die webkliënt is gratis oopbronsagteware; jy het net ’n masjien nodig om hulle op te laat loop."
      ],
      [
        "Watter hardeware het ek nodig?",
        "Baie min: enige rekenaar of tuisbediener wat Linux of Docker draai, of ’n Raspberry Pi 4 of 5. ’n Bedrade netwerkverbinding tel meer as verwerkingskrag."
      ],
      [
        "Moet die spelers iets installeer?",
        "Nee. Hulle maak die bediener se adres in ’n blaaier op hul foon, tablet of rekenaar oop. Wie ’n toep verkies, kan die PokerTH QML-kliënt of die klassieke widget-kliënt gebruik: dié koppel aan dieselfde bediener en speel aan dieselfde tafels."
      ],
      [
        "Is pokerth.net of ’n internetverbinding nodig?",
        "Nee. ’n Bediener op jou plaaslike netwerk werk op sy eie: die spelers koppel direk daaraan, met net ’n bynaam."
      ],
      [
        "Hoeveel spelers kan aansluit?",
        "Tot 10 spelers per tafel, plus toeskouers, en soveel tafels as wat jou groep nodig het."
      ]
    ]
  },
  am: {
    "title": "የራስዎን የፖከር አገልጋይ ያስተናግዱ — ነጻ፣ በራስዎ የሚተዳደር | PokerTH",
    "desc": "በቤት፣ በክለብ ወይም በትምህርት ቤት የግል የ Texas Hold’em አገልጋይ፦ ነጻው የ PokerTH አገልጋይ እና የድር ደንበኛ፣ በአንድ ትዕዛዝ፣ በ Docker ወይም በ Raspberry Pi ላይ ይጫናሉ።",
    "ldHeadline": "የራስዎን የ PokerTH የፖከር አገልጋይ እንዴት እንደሚያስተናግዱ",
    "ldDesc": "በ PokerTH የተወሰነ አገልጋይ እና በ PokerTH የድር ደንበኛ የግል፣ በራስዎ የሚተዳደር የ Texas Hold’em አገልጋይ ያዘጋጁ።",
    "h1": "የራስዎን የፖከር አገልጋይ ያስተናግዱ",
    "lead": "PokerTH ከጫፍ እስከ ጫፍ ነጻ እና ክፍት ምንጭ ነው፦ የጨዋታ አገልጋዩ እና ይህ የድር ደንበኛ በራስዎ ማሽን ላይ ሊሠሩ ይችላሉ። ለቤተሰብ ጨዋታ፣ ለክለብ ምሽት፣ ለቢሮ ሊግ ወይም ለትምህርት ቤት አንድ ፒሲ፣ የቤት አገልጋይ ወይም Raspberry Pi በቂ ነው፤ ከዚያም በአውታረ መረብዎ ላይ ያለ እያንዳንዱ ስልክ፣ ታብሌት ወይም ኮምፒውተር በቅጽል ስም ብቻ በአሳሹ ይጫወታል።",
    "whyH2": "ለምን የራስዎን",
    "why": [
      [
        "የግል",
        "ጨዋታዎችዎ በማሽንዎ እና በአውታረ መረብዎ ውስጥ ይቆያሉ፤ ተጫዋቾች መለያም ሆነ የኢሜይል አድራሻ አያስፈልጋቸውም፣ ቅጽል ስም ብቻ።"
      ],
      [
        "እንደፈለጉት የሚቀረጽ",
        "ለአገልጋዩ የራሱን ስም ይስጡት፣ የመግቢያ ማያው የትኞቹን ሁነታዎች እንደሚያቀርብ ይምረጡ፣ የእንኳን ደህና መጡ መልእክት ይለጥፉ፣ እና ለቡድንዎ የጋራ የደረጃ ሰሌዳ ይያዙ።"
      ],
      [
        "ነጻ",
        "ፈቃድ የለም፣ የደንበኝነት ምዝገባ የለም፣ ማስታወቂያ የለም፦ የ PokerTH አገልጋይም ሆነ የድር ደንበኛው ነጻ ሶፍትዌር ናቸው።"
      ]
    ],
    "partsH2": "ሁለት ክፍሎች",
    "partsP": "የ PokerTH ጨዋታ ካርዶቹን የሚያከፋፍለውን እና ጠረጴዛዎቹን የሚያስተዳድረውን የ PokerTH የተወሰነ አገልጋይ፣ እንዲሁም መተግበሪያውን ለአሳሾች የሚያቀርበውን እና ከዚያ አገልጋይ ጋር የሚያገናኛቸውን የድር ደንበኛ ይፈልጋል። ሁለቱም በአንድ ማሽን ላይ ሊሠሩ ይችላሉ። ሁሉም ነገር ተኳሃኝ ሆኖ ይቀጥላል፦ የ PokerTH መተግበሪያዎች — በ Windows፣ macOS፣ Linux እና Android ላይ ያለው የ QML ደንበኛ እና በዴስክቶፕ ላይ ያለው ክላሲክ widget ደንበኛ — አሳሾቹ ከሚገናኙበት ተመሳሳይ አገልጋይ ጋር ይገናኛሉ፣ ስለዚህ ተጫዋቾች በአንድ ጠረጴዛ ላይ አሳሾችን እና መተግበሪያዎችን ቀላቅለው መጫወት ይችላሉ።",
    "stepsH2": "በሦስት ደረጃዎች ያዘጋጁት",
    "steps": [
      [
        "የ PokerTH አገልጋዩን ይጫኑ",
        "የ PokerTH ፕሮጀክትን የአገልጋይ መመሪያ በመከተል pokerth_dedicated_server — ስሪት 2.1.10 ወይም ከዚያ በኋላ ያለውን — ከ PokerTH ምንጭ ኮድ ይገንቡ፦ Qt 6.7 ወይም ከዚያ አዲስ፣ CMake እና የ C++23 ኮምፓይለር ያስፈልገዋል። የ Linux ስርጭቶች የ pokerth-server ጥቅል የቆየ ስሪት ነው። አገልጋዩ በ TCP ወደብ 7234 ላይ ያዳምጣል።"
      ],
      [
        "የድር ደንበኛውን ይጫኑ",
        "በ Debian፣ Ubuntu ወይም Raspberry Pi OS ላይ የመጫኛ ስክሪፕቱ Node.jsን፣ የድር ደንበኛውን እና ከማሽኑ ጋር አብሮ የሚነሳ አገልግሎትን በአንድ ትዕዛዝ ያዘጋጃል። የ Docker ተጠቃሚዎች ለ amd64፣ arm64 እና armv7 ዝግጁ የሆነ ምስል ያወርዳሉ፤ CasaOS ደግሞ ያንኑ የ Compose ፋይል እንደ መተግበሪያ ያስገባል።"
      ],
      [
        "ይጫወቱ",
        "በአውታረ መረብዎ ላይ ባለ ማንኛውም መሣሪያ የማሽኑን አድራሻ በወደብ 8080 ይክፈቱ፣ LAN / የተወሰነ አገልጋይ የሚለውን ይምረጡ፣ ቅጽል ስም ይተይቡ እና ጠረጴዛ ይፍጠሩ። የ PokerTH QML ወይም widget ደንበኛ ያላቸው ተጫዋቾች ከተመሳሳዩ ማሽን ጋር በወደብ 7234 ይገናኛሉ እና ተመሳሳዮቹን ጠረጴዛዎች ይቀላቀላሉ።"
      ]
    ],
    "piH2": "በ Raspberry Pi ላይ",
    "piP": "PokerTH ትናንሽ መልእክቶችን ብቻ ይለዋወጣል፤ ሁሉንም ስዕል የሚሠሩት የተጫዋቾቹ መሣሪያዎች ናቸው፣ ስለዚህ Raspberry Pi በቂ ነው፦ 2 GB ያለው Pi 4 ምርጡ ምርጫ ነው፣ Pi 5 ደግሞ ከበቂ በላይ ነው። ለተስተካከለ ምሽት ከቦርዱ ይልቅ አውታረ መረቡ ይበልጥ አስፈላጊ ነው — Piን ከራውተሩ ጋር በኬብል ያገናኙ፣ ለተጫዋቾቹም ጥሩ የ Wi-Fi መዳረሻ ነጥብ ይጠቀሙ።",
    "httpsH2": "HTTP በ LAN ላይ፣ HTTPS ለተጨማሪዎቹ",
    "httpsP": "በራስዎ አውታረ መረብ ላይ ጨዋታው በተራ HTTP ይሠራል። መተግበሪያውን በመነሻ ማያ ላይ መጫን፣ ከመስመር ውጭ መጫወት እና ማሳወቂያዎችን መቀበል HTTPS ይፈልጋሉ፤ መመሪያው ይህንን በ Nginx እና በነጻ የ Let’s Encrypt ሰርተፊኬት ያዘጋጃል።",
    "adminH2": "በአሳሹ ውስጥ የአስተዳዳሪ ፓነል",
    "adminP": "በ /admin ላይ ያለው በቶከን የተጠበቀ ኮንሶል ማን እንደተገናኘ ያሳያል፣ የድር ደንበኛውን በአንድ ጠቅታ ያዘምናል እና ወደ ቀድሞው መመለስም ይችላል፣ ለተጫዋቾች ማስታወቂያዎችን ይልካል፣ የደረጃ ሰሌዳውን ዳግም ያስጀምራል፣ የካርድ ጥቅሎችን፣ የጠረጴዛ ቅጦችን እና ሙዚቃን ይጭናል፣ ደንበኛው ሊደርስባቸው የሚችላቸውን የጨዋታ አገልጋዮች ይዘረዝራል፣ እንዲሁም ከክፍሎቹ የተወሰኑትን ብቻ የሚከፍቱ ቁልፎችን ይሰጣል።",
    "shareH2": "ከውጭ ተጫዋቾችን ይጋብዙ",
    "shareP": "የግብዣ አገናኞች እና QR ኮዶች በአገልጋይዎ ላይ ልክ በ pokerth.net ላይ እንደሚሠሩት ይሠራሉ፦ ጓደኛ አገናኙን ይከፍታል እና ጠረጴዛዎ ላይ ይቀመጣል። አገልጋይዎ ከበይነመረብ የሚደረስ ከሆነ፣ ለድር ደንበኛው የሕዝብ አገልጋዮች ዝርዝርም ሊያቀርቡት ይችላሉ፤ የድር ደንበኛው አስተዳዳሪዎች ካጸደቁት በኋላ እዚያ ይታያል።",
    "guidesH2": "ደረጃ በደረጃ መመሪያዎች",
    "guides": [
      "የ PokerTH አገልጋይ ማዋቀሪያ መመሪያ",
      "በራስ ማስተናገድ እና በአንድ ትዕዛዝ መጫን",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "በእጅ መጫን እና HTTPS",
      "የአስተዳዳሪ ፓነሉ"
    ],
    "faqH2": "ጥያቄዎች",
    "faq": [
      [
        "የ PokerTH አገልጋይ ማስተናገድ ነጻ ነው?",
        "አዎ። የ PokerTH አገልጋይ እና የድር ደንበኛው ነጻ እና ክፍት ምንጭ ሶፍትዌር ናቸው፤ እነሱን የሚያሄድ ማሽን ብቻ ያስፈልግዎታል።"
      ],
      [
        "ምን ዓይነት ሃርድዌር ያስፈልገኛል?",
        "በጣም ትንሽ፦ Linux ወይም Docker የሚያሄድ ማንኛውም ፒሲ ወይም የቤት አገልጋይ፣ ወይም Raspberry Pi 4 ወይም 5። ከማቀናበሪያ አቅም ይልቅ በገመድ የተገናኘ የአውታረ መረብ ግንኙነት ይበልጥ አስፈላጊ ነው።"
      ],
      [
        "ተጫዋቾቹ ምንም ነገር መጫን ያስፈልጋቸዋል?",
        "አያስፈልጋቸውም። የአገልጋዩን አድራሻ በስልካቸው፣ በታብሌታቸው ወይም በኮምፒውተራቸው አሳሽ ይከፍታሉ። መተግበሪያ የሚመርጡ የ PokerTH QML ደንበኛን ወይም ክላሲኩን widget ደንበኛ መጠቀም ይችላሉ፤ ከተመሳሳዩ አገልጋይ ጋር ይገናኛሉ እና በተመሳሳዮቹ ጠረጴዛዎች ላይ ይጫወታሉ።"
      ],
      [
        "pokerth.net ወይም የበይነመረብ ግንኙነት ያስፈልገዋል?",
        "አያስፈልገውም። በአካባቢያዊ አውታረ መረብዎ ላይ ያለ አገልጋይ በራሱ ይሠራል፦ ተጫዋቾቹ በቅጽል ስም ብቻ በቀጥታ ከእሱ ጋር ይገናኛሉ።"
      ],
      [
        "ስንት ተጫዋቾች መቀላቀል ይችላሉ?",
        "በአንድ ጠረጴዛ እስከ 10 ተጫዋቾች፣ እንዲሁም ተመልካቾች፣ እና ቡድንዎ የሚፈልገውን ያህል ጠረጴዛዎች።"
      ]
    ]
  },
  ar: {
    "title": "استضف خادم بوكر خاصًا بك — مجاني وذاتي الاستضافة | PokerTH",
    "desc": "خادم Texas Hold’em خاص في المنزل أو في نادٍ أو مدرسة: خادم PokerTH وعميل الويب المجانيان، يُثبَّتان بأمر واحد، عبر Docker أو على Raspberry Pi.",
    "ldHeadline": "كيف تستضيف خادم بوكر PokerTH خاصًا بك",
    "ldDesc": "أعدّ خادم Texas Hold’em خاصًا ذاتي الاستضافة باستخدام خادم PokerTH المخصّص وعميل PokerTH على الويب.",
    "h1": "استضف خادم البوكر الخاص بك",
    "lead": "PokerTH مجاني ومفتوح المصدر من أوله إلى آخره: يمكن تشغيل خادم اللعبة وعميل الويب هذا على جهازك الخاص. يكفي حاسوب أو خادم منزلي أو Raspberry Pi للعبة عائلية أو سهرة في نادٍ أو دوري في المكتب أو مدرسة، ثم يلعب كل هاتف أو جهاز لوحي أو حاسوب متصل بشبكتك في متصفحه باسم مستعار فقط.",
    "whyH2": "لماذا تشغّل خادمك الخاص",
    "why": [
      [
        "خاص",
        "تبقى ألعابك على جهازك وشبكتك؛ ولا يحتاج اللاعبون إلى حساب ولا إلى عنوان بريد إلكتروني، بل إلى اسم مستعار فقط."
      ],
      [
        "على مقاسك",
        "امنح الخادم اسمًا خاصًا به، واختر الأوضاع التي تعرضها شاشة تسجيل الدخول، وانشر رسالة ترحيب، واحتفظ بلوحة صدارة مشتركة لمجموعتك."
      ],
      [
        "مجاني",
        "بلا ترخيص وبلا اشتراك وبلا إعلانات: خادم PokerTH وعميل الويب كلاهما برنامج حر."
      ]
    ],
    "partsH2": "مكوّنان",
    "partsP": "تحتاج لعبة PokerTH إلى خادم PokerTH المخصّص، الذي يوزّع الأوراق ويدير الطاولات، وإلى عميل الويب، الذي يقدّم التطبيق للمتصفحات ويصلها بذلك الخادم. ويمكن تشغيلهما على الجهاز نفسه. ويبقى كل شيء متوافقًا: تتصل تطبيقات PokerTH بالخادم نفسه الذي تتصل به المتصفحات — عميل QML على Windows و macOS و Linux و Android، وعميل widget الكلاسيكي على سطح المكتب — فيمكن للاعبين الجمع بين المتصفحات والتطبيقات على طاولة واحدة.",
    "stepsH2": "جهّزه في ثلاث خطوات",
    "steps": [
      [
        "ثبّت خادم PokerTH",
        "ابنِ pokerth_dedicated_server من مصادر PokerTH — الإصدار 2.1.10 أو أحدث — باتباع دليل الخادم في مشروع PokerTH: يتطلب Qt 6.7 أو أحدث وCMake ومترجم C++23. أما حزمة pokerth-server في توزيعات Linux فهي إصدار أقدم. يستمع الخادم على منفذ TCP رقم 7234."
      ],
      [
        "ثبّت عميل الويب",
        "على Debian أو Ubuntu أو Raspberry Pi OS، يُعدّ سكربت التثبيت Node.js وعميل الويب وخدمةً تبدأ مع تشغيل الجهاز، بأمر واحد. ويسحب مستخدمو Docker صورة جاهزة لمعماريات amd64 وarm64 وarmv7، ويستورد CasaOS ملف Compose نفسه كتطبيق."
      ],
      [
        "العب",
        "على أي جهاز متصل بشبكتك، افتح عنوان الجهاز على المنفذ 8080، واختر «LAN / خادم مخصّص»، واكتب اسمًا مستعارًا وأنشئ طاولة. ويتصل اللاعبون الذين يستخدمون عميل PokerTH QML أو عميل widget بالجهاز نفسه على المنفذ 7234 وينضمون إلى الطاولات نفسها."
      ]
    ],
    "piH2": "على Raspberry Pi",
    "piP": "يتبادل PokerTH رسائل صغيرة، وأجهزة اللاعبين هي التي تتولى كل الرسم، لذا فإن Raspberry Pi أكثر من كافٍ: Pi 4 بذاكرة 2 GB هو الخيار الأمثل، وPi 5 يفيض عن الحاجة. ولسهرة سلسة تهمّ الشبكة أكثر من اللوحة — صِل الـ Pi بالموجّه بكابل، واستخدم نقطة وصول Wi-Fi جيدة للاعبين.",
    "httpsH2": "HTTP على الشبكة المحلية، وHTTPS للميزات الإضافية",
    "httpsP": "على شبكتك الخاصة تعمل اللعبة عبر HTTP العادي. أما تثبيت التطبيق على الشاشة الرئيسية واللعب دون اتصال وتلقّي الإشعارات فتتطلب HTTPS، الذي يُعدّه الدليل باستخدام Nginx وشهادة Let’s Encrypt مجانية.",
    "adminH2": "لوحة إدارة في المتصفح",
    "adminP": "تعرض وحدة تحكم محمية برمز مميّز على /admin من هو متصل، وتحدّث عميل الويب بنقرة واحدة ويمكنها التراجع عن التحديث، وترسل إعلانات إلى اللاعبين، وتعيد ضبط لوحة الصدارة، وتثبّت مجموعات أوراق وأنماط طاولات وموسيقى، وتسرد خوادم اللعب التي يمكن للعميل الوصول إليها، وتمنح مفاتيح لا تفتح إلا بعض أقسامها.",
    "shareH2": "ادعُ لاعبين من الخارج",
    "shareP": "تعمل روابط الدعوة ورموز QR على خادمك تمامًا كما تعمل على pokerth.net: يفتح صديق الرابط فيجلس إلى طاولتك. وإن كان خادمك متاحًا من الإنترنت، يمكنك أيضًا اقتراحه لقائمة الخوادم العامة في عميل الويب؛ ويظهر فيها بعد أن يوافق عليه مشرفو عميل الويب.",
    "guidesH2": "أدلة خطوة بخطوة",
    "guides": [
      "دليل إعداد خادم PokerTH",
      "الاستضافة الذاتية والتثبيت بأمر واحد",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "التثبيت اليدوي وHTTPS",
      "لوحة الإدارة"
    ],
    "faqH2": "أسئلة",
    "faq": [
      [
        "هل استضافة خادم PokerTH مجانية؟",
        "نعم. خادم PokerTH وعميل الويب برنامجان مجانيان ومفتوحا المصدر؛ كل ما تحتاجه جهاز لتشغيلهما."
      ],
      [
        "ما العتاد الذي أحتاجه؟",
        "القليل جدًا: أي حاسوب أو خادم منزلي يعمل بنظام Linux أو Docker، أو Raspberry Pi 4 أو 5. والاتصال السلكي بالشبكة أهم من قوة المعالجة."
      ],
      [
        "هل يحتاج اللاعبون إلى تثبيت أي شيء؟",
        "لا. يفتحون عنوان الخادم في متصفح على هاتفهم أو جهازهم اللوحي أو حاسوبهم. ومن يفضّل تطبيقًا يمكنه استخدام عميل PokerTH QML أو عميل widget الكلاسيكي: فهما يتصلان بالخادم نفسه ويتيحان اللعب على الطاولات نفسها."
      ],
      [
        "هل يحتاج إلى pokerth.net أو إلى اتصال بالإنترنت؟",
        "لا. الخادم على شبكتك المحلية يعمل وحده: يتصل به اللاعبون مباشرة، باسم مستعار فقط."
      ],
      [
        "كم لاعبًا يمكنه الانضمام؟",
        "حتى 10 لاعبين في الطاولة الواحدة، إضافة إلى المتفرجين، وعدد الطاولات الذي تحتاجه مجموعتك."
      ]
    ]
  },
  az: {
    "title": "Öz poker serverinizi qurun — pulsuz, öz hostinqinizdə | PokerTH",
    "desc": "Evdə, klubda və ya məktəbdə şəxsi Texas Hold’em serveri: pulsuz PokerTH serveri və veb klienti bir əmrlə, Docker ilə və ya Raspberry Pi-də quraşdırılır.",
    "ldHeadline": "Öz PokerTH poker serverinizi necə qurmalı",
    "ldDesc": "PokerTH xüsusi serveri və PokerTH veb klienti ilə şəxsi, öz hostinqinizdə işləyən Texas Hold’em serveri qurun.",
    "h1": "Öz poker serverinizi qurun",
    "lead": "PokerTH başdan-başa pulsuz və açıq mənbəlidir: oyun serveri və bu veb klient öz kompüterinizdə işləyə bilər. Ailə oyunu, klub gecəsi, ofis liqası və ya məktəb üçün bir kompüter, ev serveri və ya Raspberry Pi kifayətdir, bundan sonra şəbəkənizdəki hər telefon, planşet və ya kompüter sadəcə ləqəblə brauzerdə oynayır.",
    "whyH2": "Niyə öz serveriniz",
    "why": [
      [
        "Şəxsi",
        "Oyunlarınız sizin kompüterinizdə və şəbəkənizdə qalır; oyunçulara nə hesab, nə də e-poçt ünvanı lazımdır, sadəcə ləqəb."
      ],
      [
        "İstədiyiniz kimi",
        "Serverə öz adını verin, giriş ekranının hansı rejimləri təklif etdiyini seçin, salamlama mesajı yerləşdirin və qrupunuz üçün ümumi reytinq aparın."
      ],
      [
        "Pulsuz",
        "Nə lisenziya, nə abunə, nə reklam: həm PokerTH serveri, həm də veb klient azad proqram təminatıdır."
      ]
    ],
    "partsH2": "İki hissə",
    "partsP": "PokerTH oyunu üçün kartları paylayan və masaları idarə edən PokerTH xüsusi serveri, həmçinin tətbiqi brauzerlərə təqdim edən və onları həmin serverə qoşan veb klient lazımdır. Hər ikisi eyni kompüterdə işləyə bilər. Hər şey uyğun qalır: PokerTH tətbiqləri — Windows, macOS, Linux və Android üçün QML klienti və masaüstü üçün klassik widget klienti — brauzerlərlə eyni serverə qoşulur, beləliklə oyunçular bir masada brauzerləri və tətbiqləri qarışdıra bilərlər.",
    "stepsH2": "Üç addımda qurun",
    "steps": [
      [
        "PokerTH serverini quraşdırın",
        "PokerTH layihəsinin server bələdçisinə əməl edərək pokerth_dedicated_server-i PokerTH mənbə kodundan — 2.1.10 və ya daha yeni versiya — yığın: bunun üçün Qt 6.7 və ya daha yeni versiya, CMake və C++23 kompilyatoru lazımdır. Linux distributivlərindəki pokerth-server paketi köhnə versiyadır. Server TCP 7234 portunu dinləyir."
      ],
      [
        "Veb klienti quraşdırın",
        "Debian, Ubuntu və ya Raspberry Pi OS-də quraşdırma skripti bir əmrlə Node.js-i, veb klienti və kompüterlə birlikdə başlayan xidməti qurur. Docker istifadəçiləri amd64, arm64 və armv7 üçün hazır obrazı yükləyir, CasaOS isə eyni Compose faylını tətbiq kimi idxal edir."
      ],
      [
        "Oynayın",
        "Şəbəkənizdəki istənilən cihazda kompüterin ünvanını 8080 portunda açın, «LAN / Xüsusi server» seçin, ləqəb yazın və masa yaradın. PokerTH QML və ya widget klienti olan oyunçular eyni kompüterə 7234 portunda qoşulur və eyni masalara qatılırlar."
      ]
    ],
    "piH2": "Raspberry Pi-də",
    "piP": "PokerTH kiçik mesajlar mübadiləsi aparır və bütün təsviri oyunçuların cihazları çəkir, ona görə də Raspberry Pi tamamilə kifayətdir: 2 GB yaddaşlı Pi 4 ən ideal seçimdir, Pi 5 isə artıqlaması ilə bəs edir. Rahat bir axşam üçün şəbəkə lövhədən daha vacibdir — Pi-ni routerə kabellə qoşun və oyunçular üçün yaxşı Wi-Fi giriş nöqtəsindən istifadə edin.",
    "httpsH2": "LAN-da HTTP, əlavələr üçün HTTPS",
    "httpsP": "Öz şəbəkənizdə oyun adi HTTP üzərindən işləyir. Tətbiqi əsas ekrana quraşdırmaq, oflayn oynamaq və bildirişlər almaq üçün HTTPS lazımdır; bələdçi onu Nginx və pulsuz Let’s Encrypt sertifikatı ilə qurur.",
    "adminH2": "Brauzerdə admin paneli",
    "adminP": "/admin ünvanındakı tokenlə qorunan konsol kimlərin qoşulduğunu göstərir, veb klienti bir kliklə yeniləyir və əvvəlki versiyaya qaytara bilir, oyunçulara elanlar göndərir, reytinqi sıfırlayır, kart dəstləri, masa üslubları və musiqi quraşdırır, klientin qoşula biləcəyi oyun serverlərini sadalayır və yalnız bəzi bölmələrini açan açarlar paylayır.",
    "shareH2": "Kənardan oyunçular dəvət edin",
    "shareP": "Dəvət linkləri və QR kodlar sizin serverinizdə də pokerth.net-də olduğu kimi işləyir: dost linki açır və masanıza oturdulur. Serveriniz internetdən əlçatandırsa, onu veb klientin ictimai server siyahısına da təklif edə bilərsiniz; veb klientin adminləri onu təsdiqlədikdən sonra orada görünür.",
    "guidesH2": "Addım-addım bələdçilər",
    "guides": [
      "PokerTH serverinin quraşdırma bələdçisi",
      "Öz hostinqiniz və bir əmrlə quraşdırma",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Əl ilə quraşdırma və HTTPS",
      "Admin paneli"
    ],
    "faqH2": "Suallar",
    "faq": [
      [
        "PokerTH serverini host etmək pulsuzdurmu?",
        "Bəli. PokerTH serveri və veb klient pulsuz və açıq mənbəli proqram təminatıdır; sizə yalnız onları işlətmək üçün bir kompüter lazımdır."
      ],
      [
        "Mənə hansı avadanlıq lazımdır?",
        "Çox az: Linux və ya Docker işlədən istənilən kompüter və ya ev serveri, yaxud Raspberry Pi 4 və ya 5. Kabelli şəbəkə bağlantısı hesablama gücündən daha vacibdir."
      ],
      [
        "Oyunçular nəsə quraşdırmalıdırmı?",
        "Xeyr. Onlar serverin ünvanını telefon, planşet və ya kompüterdəki brauzerdə açırlar. Tətbiqə üstünlük verənlər PokerTH QML klientindən və ya klassik widget klientindən istifadə edə bilərlər: onlar eyni serverə qoşulur və eyni masalarda oynayırlar."
      ],
      [
        "Bunun üçün pokerth.net və ya internet bağlantısı lazımdırmı?",
        "Xeyr. Lokal şəbəkənizdəki server müstəqil işləyir: oyunçular ona birbaşa, sadəcə ləqəblə qoşulur."
      ],
      [
        "Neçə oyunçu qoşula bilər?",
        "Hər masada 10 oyunçuya qədər, üstəlik izləyicilər, və qrupunuza lazım olan qədər masa."
      ]
    ]
  },
  be: {
    "title": "Свой покерны сервер — бясплатна, на ўласнай машыне | PokerTH",
    "desc": "Прыватны сервер Texas Hold’em дома, у клубе ці ў школе: бясплатныя сервер PokerTH і вэб-кліент, усталёўка адной камандай, праз Docker або на Raspberry Pi.",
    "ldHeadline": "Як запусціць уласны покерны сервер PokerTH",
    "ldDesc": "Наладзьце прыватны сервер Texas Hold’em на ўласнай машыне з выдзеленым серверам PokerTH і вэб-кліентам PokerTH.",
    "h1": "Запусціце свой покерны сервер",
    "lead": "PokerTH бясплатны і з адкрытым зыходным кодам ад пачатку да канца: гульнявы сервер і гэты вэб-кліент могуць працаваць на вашай уласнай машыне. ПК, хатняга сервера або Raspberry Pi дастаткова для сямейнай гульні, вечара ў клубе, офіснай лігі ці школы, і тады кожны тэлефон, планшэт або камп'ютар у вашай сетцы гуляе ў браўзеры, маючы толькі нікнэйм.",
    "whyH2": "Навошта свой сервер",
    "why": [
      [
        "Прыватнасць",
        "Вашы гульні застаюцца на вашай машыне і ў вашай сетцы; гульцам не патрэбныя ні ўліковы запіс, ні адрас электроннай пошты — толькі нікнэйм."
      ],
      [
        "Усё на ваш густ",
        "Дайце серверу ўласную назву, выберыце, якія рэжымы прапануе экран уваходу, размясціце прывітальнае паведамленне і вядзіце агульную табліцу лідараў для вашай кампаніі."
      ],
      [
        "Бясплатна",
        "Ніякай ліцэнзіі, падпіскі ці рэкламы: і сервер PokerTH, і вэб-кліент — свабоднае праграмнае забеспячэнне."
      ]
    ],
    "partsH2": "Дзве часткі",
    "partsP": "Для гульні ў PokerTH патрэбны выдзелены сервер PokerTH, які раздае карты і вядзе сталы, і вэб-кліент, які аддае праграму браўзерам і злучае іх з гэтым серверам. Яны могуць працаваць на адной машыне. Усё застаецца сумяшчальным: праграмы PokerTH падключаюцца да таго ж сервера, што і браўзеры, — QML-кліент для Windows, macOS, Linux і Android і класічны widget-кліент для настольных камп'ютараў, — так што за адным сталом можна спалучаць браўзеры і праграмы.",
    "stepsH2": "Наладка ў тры крокі",
    "steps": [
      [
        "Усталюйце сервер PokerTH",
        "Збярыце pokerth_dedicated_server з зыходнага кода PokerTH — версіі 2.1.10 або навейшай — паводле інструкцыі па серверы ад праекта PokerTH: спатрэбяцца Qt 6.7 або навейшы, CMake і кампілятар C++23. Пакет pokerth-server у дыстрыбутывах Linux — гэта старэйшая версія. Сервер слухае TCP-порт 7234."
      ],
      [
        "Усталюйце вэб-кліент",
        "На Debian, Ubuntu або Raspberry Pi OS скрыпт усталёўкі адной камандай ставіць Node.js, вэб-кліент і службу, якая запускаецца разам з машынай. Карыстальнікі Docker загружаюць гатовы вобраз для amd64, arm64 і armv7, а CasaOS імпартуе той жа файл Compose як праграму."
      ],
      [
        "Гуляйце",
        "На любой прыладзе ў вашай сетцы адкрыйце адрас машыны на порце 8080, выберыце «LAN / Выдзелены сервер», увядзіце нікнэйм і стварыце стол. Гульцы з QML- або widget-кліентам PokerTH падключаюцца да той жа машыны на порце 7234 і далучаюцца да тых жа сталоў."
      ]
    ],
    "piH2": "На Raspberry Pi",
    "piP": "PokerTH абменьваецца невялікімі паведамленнямі, а ўсю графіку малююць прылады гульцоў, таму Raspberry Pi цалкам дастаткова: Pi 4 з 2 ГБ — аптымальны выбар, Pi 5 — з запасам. Для гладкага вечара сетка важнейшая за плату — падключыце Pi да маршрутызатара кабелем і выкарыстоўвайце для гульцоў добры пункт доступу Wi-Fi.",
    "httpsH2": "HTTP у LAN, HTTPS для дадатковых магчымасцей",
    "httpsP": "У вашай уласнай сетцы гульня працуе праз звычайны HTTP. Для ўсталёўкі праграмы на галоўны экран, гульні афлайн і атрымання апавяшчэнняў патрэбны HTTPS, які інструкцыя наладжвае з Nginx і бясплатным сертыфікатам Let’s Encrypt.",
    "adminH2": "Панэль адміністратара ў браўзеры",
    "adminP": "Абароненая токенам кансоль па адрасе /admin паказвае, хто падключаны, абнаўляе вэб-кліент адным клікам і можа адкаціць абнаўленне, рассылае аб'явы гульцам, скідае табліцу лідараў, усталёўвае калоды карт, стылі стала і музыку, вызначае спіс гульнявых сервераў, да якіх можа падключацца кліент, і выдае ключы, якія адкрываюць толькі некаторыя яе раздзелы.",
    "shareH2": "Запрашайце гульцоў звонку",
    "shareP": "Спасылкі-запрашэнні і QR-коды працуюць на вашым серверы гэтак жа, як на pokerth.net: сябар адкрывае спасылку і сядае за ваш стол. Калі ваш сервер даступны з інтэрнэту, вы можаце таксама прапанаваць яго ў публічны спіс сервераў вэб-кліента; ён з'явіцца там, як толькі адміністратары вэб-кліента яго ўхваляць.",
    "guidesH2": "Пакрокавыя інструкцыі",
    "guides": [
      "Інструкцыя па наладцы сервера PokerTH",
      "Уласны хостынг і ўсталёўка адной камандай",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ручная ўсталёўка і HTTPS",
      "Панэль адміністратара"
    ],
    "faqH2": "Пытанні",
    "faq": [
      [
        "Ці бясплатна запусціць сервер PokerTH?",
        "Так. Сервер PokerTH і вэб-кліент — свабоднае праграмнае забеспячэнне з адкрытым зыходным кодам; вам патрэбна толькі машына, на якой яны будуць працаваць."
      ],
      [
        "Якое абсталяванне патрэбна?",
        "Зусім няшмат: любы ПК або хатні сервер з Linux ці Docker або Raspberry Pi 4 ці 5. Правадное падключэнне да сеткі важнейшае за вылічальную магутнасць."
      ],
      [
        "Ці трэба гульцам нешта ўсталёўваць?",
        "Не. Яны адкрываюць адрас сервера ў браўзеры на тэлефоне, планшэце або камп'ютары. Хто аддае перавагу праграме, можа карыстацца QML-кліентам PokerTH або класічным widget-кліентам: яны падключаюцца да таго ж сервера і дазваляюць гуляць за тымі ж сталамі."
      ],
      [
        "Ці патрэбны pokerth.net або падключэнне да інтэрнэту?",
        "Не. Сервер у вашай лакальнай сетцы працуе самастойна: гульцы падключаюцца да яго наўпрост, маючы толькі нікнэйм."
      ],
      [
        "Колькі гульцоў можа далучыцца?",
        "Да 10 гульцоў за сталом, плюс гледачы, і столькі сталоў, колькі трэба вашай кампаніі."
      ]
    ]
  },
  bg: {
    "title": "Собствен покер сървър — безплатен и самохостван | PokerTH",
    "desc": "Частен сървър за Texas Hold’em у дома, в клуб или училище: безплатният сървър и уеб клиент на PokerTH, с една команда, с Docker или на Raspberry Pi.",
    "ldHeadline": "Как да пуснете собствен покер сървър на PokerTH",
    "ldDesc": "Направете частен, самостоятелно хостван сървър за Texas Hold’em с отделния сървър на PokerTH и уеб клиента на PokerTH.",
    "h1": "Пуснете свой собствен покер сървър",
    "lead": "PokerTH е безплатен и с отворен код от край до край: игровият сървър и този уеб клиент могат да работят на ваша собствена машина. Компютър, домашен сървър или Raspberry Pi са достатъчни за семейна игра, вечер в клуба, офис лига или училище, а след това всеки телефон, таблет или компютър във вашата мрежа играе в браузъра си само с псевдоним.",
    "whyH2": "Защо собствен сървър",
    "why": [
      [
        "Частно",
        "Игрите ви остават на вашата машина и във вашата мрежа; играчите не се нуждаят нито от профил, нито от имейл адрес, а само от псевдоним."
      ],
      [
        "По ваш вкус",
        "Дайте собствено име на сървъра, изберете кои режими предлага екранът за вход, публикувайте приветствено съобщение и водете общо класиране за вашата група."
      ],
      [
        "Безплатно",
        "Без лиценз, без абонамент, без реклами: и сървърът на PokerTH, и уеб клиентът са свободен софтуер."
      ]
    ],
    "partsH2": "Две части",
    "partsP": "Една игра на PokerTH се нуждае от отделния сървър на PokerTH, който раздава картите и управлява масите, и от уеб клиента, който доставя приложението на браузърите и ги свързва с този сървър. Двете могат да работят на една и съща машина. Всичко остава съвместимо: приложенията на PokerTH — клиентът QML за Windows, macOS, Linux и Android и класическият клиент widget за настолни компютри — се свързват със същия сървър като браузърите, така че на една маса могат да играят заедно браузъри и приложения.",
    "stepsH2": "Инсталиране в три стъпки",
    "steps": [
      [
        "Инсталирайте сървъра на PokerTH",
        "Компилирайте pokerth_dedicated_server от изходния код на PokerTH — версия 2.1.10 или по-нова — според ръководството за сървъра на проекта PokerTH: нужни са Qt 6.7 или по-нова версия, CMake и компилатор за C++23. Пакетът pokerth-server в Linux дистрибуциите е по-стара версия. Сървърът слуша на TCP порт 7234."
      ],
      [
        "Инсталирайте уеб клиента",
        "В Debian, Ubuntu или Raspberry Pi OS инсталационният скрипт настройва с една команда Node.js, уеб клиента и услуга, която се стартира заедно с машината. Потребителите на Docker изтеглят готов образ за amd64, arm64 и armv7, а CasaOS импортира същия файл на Compose като приложение."
      ],
      [
        "Играйте",
        "На всяко устройство във вашата мрежа отворете адреса на машината на порт 8080, изберете LAN / Отделен сървър, въведете псевдоним и създайте маса. Играчите с клиента QML или widget на PokerTH се свързват със същата машина на порт 7234 и сядат на същите маси."
      ]
    ],
    "piH2": "На Raspberry Pi",
    "piP": "PokerTH обменя малки съобщения, а цялото рисуване се извършва от устройствата на играчите, така че Raspberry Pi е напълно достатъчен: Pi 4 с 2 GB е идеалният избор, а Pi 5 е повече от достатъчен. За гладка вечер мрежата е по-важна от платката — свържете Pi към рутера с кабел и осигурете добра Wi-Fi точка за достъп за играчите.",
    "httpsH2": "HTTP в LAN, HTTPS за допълненията",
    "httpsP": "Във вашата собствена мрежа играта работи през обикновен HTTP. Инсталирането на приложението на началния екран, играта офлайн и получаването на известия изискват HTTPS, който ръководството настройва с Nginx и безплатен сертификат от Let’s Encrypt.",
    "adminH2": "Администраторски панел в браузъра",
    "adminP": "Конзола на /admin, защитена с токен, показва кой е свързан, обновява уеб клиента с едно щракване и може да го върне към предишна версия, изпраща съобщения до играчите, нулира класирането, инсталира тестета карти, стилове на масата и музика, изброява игровите сървъри, до които клиентът има достъп, и раздава ключове, които отключват само някои от разделите ѝ.",
    "shareH2": "Поканете играчи отвън",
    "shareP": "Връзките за покана и QR кодовете работят на вашия сървър точно както в pokerth.net: приятел отваря връзката и сяда на вашата маса. Ако сървърът ви е достъпен от интернет, можете също да го предложите за публичния списък със сървъри на уеб клиента; той се появява там, след като администраторите на уеб клиента го одобрят.",
    "guidesH2": "Ръководства стъпка по стъпка",
    "guides": [
      "Ръководство за инсталиране на сървъра на PokerTH",
      "Собствен хостинг и инсталиране с една команда",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ръчно инсталиране и HTTPS",
      "Администраторският панел"
    ],
    "faqH2": "Въпроси",
    "faq": [
      [
        "Безплатно ли е да хоствам сървър на PokerTH?",
        "Да. Сървърът на PokerTH и уеб клиентът са безплатен софтуер с отворен код; нужна ви е само машина, на която да работят."
      ],
      [
        "Какъв хардуер ми трябва?",
        "Съвсем малко: всеки компютър или домашен сървър с Linux или Docker, или Raspberry Pi 4 или 5. Кабелната мрежова връзка е по-важна от изчислителната мощ."
      ],
      [
        "Трябва ли играчите да инсталират нещо?",
        "Не. Те отварят адреса на сървъра в браузъра на телефона, таблета или компютъра си. Тези, които предпочитат приложение, могат да използват клиента QML на PokerTH или класическия клиент widget: те се свързват със същия сървър и играят на същите маси."
      ],
      [
        "Нужни ли са pokerth.net или интернет връзка?",
        "Не. Сървър в локалната ви мрежа работи самостоятелно: играчите се свързват директно с него само с псевдоним."
      ],
      [
        "Колко играчи могат да участват?",
        "До 10 играчи на маса, плюс зрители, и толкова маси, колкото са нужни на вашата група."
      ]
    ]
  },
  bn: {
    "title": "নিজের পোকার সার্ভার হোস্ট করুন — বিনামূল্যে, সেলফ-হোস্টেড | PokerTH",
    "desc": "বাড়িতে, ক্লাবে বা স্কুলে ব্যক্তিগত Texas Hold’em সার্ভার: বিনামূল্যের PokerTH সার্ভার ও ওয়েব ক্লায়েন্ট, এক কমান্ডে সেটআপ, Docker দিয়ে বা Raspberry Pi-তে।",
    "ldHeadline": "কীভাবে নিজের PokerTH পোকার সার্ভার হোস্ট করবেন",
    "ldDesc": "PokerTH ডেডিকেটেড সার্ভার আর PokerTH ওয়েব ক্লায়েন্ট দিয়ে একটি ব্যক্তিগত, সেলফ-হোস্টেড Texas Hold’em সার্ভার চালু করুন।",
    "h1": "নিজের পোকার সার্ভার হোস্ট করুন",
    "lead": "PokerTH শুরু থেকে শেষ পর্যন্ত বিনামূল্যের ও ওপেন সোর্স: গেম সার্ভার আর এই ওয়েব ক্লায়েন্ট দুটোই আপনার নিজের মেশিনে চলতে পারে। পারিবারিক খেলা, ক্লাবের সন্ধ্যা, অফিস লিগ বা স্কুলের জন্য একটি পিসি, হোম সার্ভার বা Raspberry Pi-ই যথেষ্ট, আর তারপর আপনার নেটওয়ার্কের প্রতিটি ফোন, ট্যাবলেট বা কম্পিউটার শুধু একটি ডাকনাম দিয়ে ব্রাউজারেই খেলে।",
    "whyH2": "কেন নিজের সার্ভার চালাবেন",
    "why": [
      [
        "ব্যক্তিগত",
        "আপনার খেলা আপনার মেশিন আর আপনার নেটওয়ার্কেই থাকে; খেলোয়াড়দের কোনো অ্যাকাউন্ট বা ইমেল ঠিকানা লাগে না, শুধু একটি ডাকনাম।"
      ],
      [
        "নিজের মতো করে সাজান",
        "সার্ভারকে নিজস্ব একটি নাম দিন, লগইন স্ক্রিনে কোন কোন মোড থাকবে তা বেছে নিন, একটি স্বাগত বার্তা দিন, আর আপনার দলের জন্য একটি যৌথ র‍্যাংকিং রাখুন।"
      ],
      [
        "বিনামূল্যে",
        "লাইসেন্স নেই, সাবস্ক্রিপশন নেই, বিজ্ঞাপন নেই: PokerTH সার্ভার আর ওয়েব ক্লায়েন্ট দুটোই মুক্ত সফটওয়্যার।"
      ]
    ],
    "partsH2": "দুটি অংশ",
    "partsP": "একটি PokerTH খেলার জন্য দরকার PokerTH ডেডিকেটেড সার্ভার, যা তাস বাঁটে আর টেবিলগুলো চালায়, এবং ওয়েব ক্লায়েন্ট, যা ব্রাউজারগুলোকে অ্যাপটি সরবরাহ করে আর সেগুলোকে ওই সার্ভারের সঙ্গে যুক্ত করে। দুটো একই মেশিনে চলতে পারে। সবকিছু সামঞ্জস্যপূর্ণ থাকে: PokerTH অ্যাপগুলো — Windows, macOS, Linux ও Android-এর QML ক্লায়েন্ট এবং ডেস্কটপের ক্লাসিক widget ক্লায়েন্ট — ব্রাউজারগুলোর মতোই একই সার্ভারে যুক্ত হয়, তাই একই টেবিলে খেলোয়াড়েরা ব্রাউজার আর অ্যাপ মিশিয়ে খেলতে পারেন।",
    "stepsH2": "তিন ধাপে সেটআপ করুন",
    "steps": [
      [
        "PokerTH সার্ভার ইনস্টল করুন",
        "PokerTH প্রকল্পের সার্ভার নির্দেশিকা অনুসরণ করে PokerTH-এর সোর্স কোড থেকে pokerth_dedicated_server বিল্ড করুন — সংস্করণ 2.1.10 বা তার পরের: এর জন্য লাগবে Qt 6.7 বা নতুনতর, CMake এবং একটি C++23 কম্পাইলার। Linux ডিস্ট্রিবিউশনগুলোর pokerth-server প্যাকেজটি একটি পুরোনো সংস্করণ। সার্ভারটি TCP পোর্ট 7234-এ শোনে।"
      ],
      [
        "ওয়েব ক্লায়েন্ট ইনস্টল করুন",
        "Debian, Ubuntu বা Raspberry Pi OS-এ ইনস্টলেশন স্ক্রিপ্টটি এক কমান্ডেই Node.js, ওয়েব ক্লায়েন্ট আর মেশিন চালু হলেই চালু হওয়া একটি সার্ভিস সেট আপ করে। Docker ব্যবহারকারীরা amd64, arm64 ও armv7-এর জন্য একটি তৈরি ইমেজ নামিয়ে নেন, আর CasaOS একই Compose ফাইলটি একটি অ্যাপ হিসেবে ইমপোর্ট করে।"
      ],
      [
        "খেলুন",
        "আপনার নেটওয়ার্কের যেকোনো ডিভাইসে মেশিনটির ঠিকানা পোর্ট 8080-এ খুলুন, LAN / ডেডিকেটেড সার্ভার বেছে নিন, একটি ডাকনাম লিখুন আর একটি টেবিল তৈরি করুন। PokerTH QML বা widget ক্লায়েন্ট ব্যবহারকারী খেলোয়াড়েরা পোর্ট 7234-এ একই মেশিনে যুক্ত হন এবং একই টেবিলগুলোতে যোগ দেন।"
      ]
    ],
    "piH2": "Raspberry Pi-তে",
    "piP": "PokerTH শুধু ছোট ছোট বার্তা আদানপ্রদান করে আর সব আঁকার কাজ খেলোয়াড়দের ডিভাইসই করে, তাই একটি Raspberry Pi-ই যথেষ্ট: 2 GB-এর একটি Pi 4 সবচেয়ে উপযুক্ত, আর Pi 5 তো প্রয়োজনের চেয়েও বেশি। মসৃণ একটি সন্ধ্যার জন্য বোর্ডের চেয়ে নেটওয়ার্ক বেশি গুরুত্বপূর্ণ — Pi-টিকে কেবল দিয়ে রাউটারে যুক্ত করুন, আর খেলোয়াড়দের জন্য একটি ভালো Wi-Fi অ্যাক্সেস পয়েন্ট ব্যবহার করুন।",
    "httpsH2": "LAN-এ HTTP, বাড়তি সুবিধার জন্য HTTPS",
    "httpsP": "নিজের নেটওয়ার্কে খেলাটি সাধারণ HTTP-তেই চলে। হোম স্ক্রিনে অ্যাপটি ইনস্টল করা, অফলাইনে খেলা আর নোটিফিকেশন পাওয়ার জন্য HTTPS লাগে, যা নির্দেশিকাটি Nginx আর বিনামূল্যের একটি Let’s Encrypt সার্টিফিকেট দিয়ে সেট আপ করে।",
    "adminH2": "ব্রাউজারেই একটি অ্যাডমিন প্যানেল",
    "adminP": "/admin-এ একটি টোকেন-সুরক্ষিত কনসোল দেখায় কে কে যুক্ত আছে, এক ক্লিকে ওয়েব ক্লায়েন্ট আপডেট করে এবং আগের সংস্করণে ফিরিয়েও নিতে পারে, খেলোয়াড়দের ঘোষণা পাঠায়, র‍্যাংকিং রিসেট করে, তাসের ডেক, টেবিলের স্টাইল আর সংগীত ইনস্টল করে, ক্লায়েন্ট কোন কোন গেম সার্ভারে যেতে পারবে তার তালিকা দেখায়, আর এমন চাবি দেয় যা এর কেবল কিছু অংশ খোলে।",
    "shareH2": "বাইরে থেকে খেলোয়াড়দের আমন্ত্রণ জানান",
    "shareP": "আমন্ত্রণ লিঙ্ক আর QR কোড আপনার সার্ভারেও ঠিক pokerth.net-এর মতোই কাজ করে: একজন বন্ধু লিঙ্কটি খোলে আর আপনার টেবিলে বসে যায়। আপনার সার্ভারে ইন্টারনেট থেকে পৌঁছানো গেলে আপনি এটিকে ওয়েব ক্লায়েন্টের পাবলিক সার্ভার তালিকার জন্যও প্রস্তাব করতে পারেন; ওয়েব ক্লায়েন্টের অ্যাডমিনরা অনুমোদন করলে এটি সেখানে দেখা যায়।",
    "guidesH2": "ধাপে ধাপে নির্দেশিকা",
    "guides": [
      "PokerTH সার্ভার সেটআপ নির্দেশিকা",
      "সেলফ-হোস্টিং ও এক কমান্ডে ইনস্টল",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "ম্যানুয়াল ইনস্টলেশন ও HTTPS",
      "অ্যাডমিন প্যানেল"
    ],
    "faqH2": "প্রশ্নোত্তর",
    "faq": [
      [
        "PokerTH সার্ভার হোস্ট করা কি বিনামূল্যে?",
        "হ্যাঁ। PokerTH সার্ভার আর ওয়েব ক্লায়েন্ট বিনামূল্যের ও ওপেন সোর্স সফটওয়্যার; এগুলো চালানোর জন্য আপনার শুধু একটি মেশিন দরকার।"
      ],
      [
        "কী ধরনের হার্ডওয়্যার লাগবে?",
        "খুবই সামান্য: Linux বা Docker চলে এমন যেকোনো পিসি বা হোম সার্ভার, অথবা একটি Raspberry Pi 4 বা 5। প্রসেসিং ক্ষমতার চেয়ে তারযুক্ত নেটওয়ার্ক সংযোগ বেশি গুরুত্বপূর্ণ।"
      ],
      [
        "খেলোয়াড়দের কি কিছু ইনস্টল করতে হবে?",
        "না। তাঁরা নিজেদের ফোন, ট্যাবলেট বা কম্পিউটারের ব্রাউজারে সার্ভারের ঠিকানাটি খোলেন। যাঁরা অ্যাপ পছন্দ করেন, তাঁরা PokerTH QML ক্লায়েন্ট বা ক্লাসিক widget ক্লায়েন্ট ব্যবহার করতে পারেন: এগুলো একই সার্ভারে যুক্ত হয় এবং একই টেবিলগুলোতে খেলে।"
      ],
      [
        "এর জন্য কি pokerth.net বা ইন্টারনেট সংযোগ লাগে?",
        "না। আপনার লোকাল নেটওয়ার্কের একটি সার্ভার নিজে নিজেই চলে: খেলোয়াড়েরা শুধু একটি ডাকনাম দিয়ে সরাসরি সেটিতে যুক্ত হন।"
      ],
      [
        "কতজন খেলোয়াড় যোগ দিতে পারেন?",
        "প্রতি টেবিলে সর্বোচ্চ ১০ জন খেলোয়াড়, সঙ্গে দর্শকেরা, আর আপনার দলের যতগুলো দরকার ততগুলো টেবিল।"
      ]
    ]
  },
  bs: {
    "title": "Pokreni vlastiti poker server — besplatno, kod sebe | PokerTH",
    "desc": "Privatni Texas Hold’em server kod kuće, u klubu ili školi: besplatni PokerTH server i web klijent, postavljeni jednom komandom, uz Docker ili na Raspberry Pi.",
    "ldHeadline": "Kako pokrenuti vlastiti PokerTH poker server",
    "ldDesc": "Postavi privatni, samostalno hostovani Texas Hold’em server uz PokerTH namjenski server i PokerTH web klijent.",
    "h1": "Pokreni vlastiti poker server",
    "lead": "PokerTH je besplatan i otvorenog koda od početka do kraja: server igre i ovaj web klijent mogu raditi na tvom vlastitom računaru. PC, kućni server ili Raspberry Pi dovoljni su za porodičnu igru, klupsko veče, kancelarijsku ligu ili školu, a svaki telefon, tablet ili računar u tvojoj mreži onda igra u svom pregledaču samo s nadimkom.",
    "whyH2": "Zašto vlastiti server",
    "why": [
      [
        "Privatno",
        "Tvoje igre ostaju na tvom računaru i u tvojoj mreži; igračima ne treba ni račun ni adresa e-pošte, samo nadimak."
      ],
      [
        "Po tvojoj mjeri",
        "Daj serveru vlastito ime, izaberi koje načine nudi ekran za prijavu, objavi poruku dobrodošlice i vodi zajedničku rang-listu za svoju grupu."
      ],
      [
        "Besplatno",
        "Bez licence, bez pretplate, bez reklama: i PokerTH server i web klijent su slobodni softver."
      ]
    ],
    "partsH2": "Dva dijela",
    "partsP": "Za PokerTH igru potreban je PokerTH namjenski server, koji dijeli karte i vodi stolove, i web klijent, koji pregledačima isporučuje aplikaciju i povezuje ih s tim serverom. Oba mogu raditi na istom računaru. Sve ostaje kompatibilno: PokerTH aplikacije povezuju se na isti server kao i pregledači — QML klijent na Windowsu, macOS-u, Linuxu i Androidu i klasični widget klijent na desktopu — pa za jednim stolom igrači mogu kombinovati pregledače i aplikacije.",
    "stepsH2": "Postavi ga u tri koraka",
    "steps": [
      [
        "Instaliraj PokerTH server",
        "Izgradi pokerth_dedicated_server iz izvornog koda PokerTH-a — verzija 2.1.10 ili novija — prateći uputstvo za server projekta PokerTH: potrebni su Qt 6.7 ili noviji, CMake i C++23 kompajler. Paket pokerth-server iz Linux distribucija je starija verzija. Server sluša na TCP portu 7234."
      ],
      [
        "Instaliraj web klijent",
        "Na Debianu, Ubuntuu ili Raspberry Pi OS-u instalacijska skripta jednom komandom postavlja Node.js, web klijent i servis koji se pokreće zajedno s računarom. Korisnici Dockera preuzimaju gotovu sliku za amd64, arm64 i armv7, a CasaOS uvozi isti Compose fajl kao aplikaciju."
      ],
      [
        "Igraj",
        "Na bilo kojem uređaju u svojoj mreži otvori adresu računara na portu 8080, izaberi „LAN / Namjenski server“, upiši nadimak i napravi sto. Igrači s PokerTH QML ili widget klijentom povezuju se na isti računar na portu 7234 i pridružuju se istim stolovima."
      ]
    ],
    "piH2": "Na Raspberry Pi",
    "piP": "PokerTH razmjenjuje male poruke, a svo iscrtavanje rade uređaji igrača, pa je Raspberry Pi sasvim dovoljan: Pi 4 s 2 GB je idealan izbor, a Pi 5 je više nego dovoljan. Za glatko veče mreža je važnija od ploče — spoji Pi na ruter kablom i igračima obezbijedi dobru Wi-Fi pristupnu tačku.",
    "httpsH2": "HTTP u LAN-u, HTTPS za dodatke",
    "httpsP": "U tvojoj vlastitoj mreži igra radi preko običnog HTTP-a. Instaliranje aplikacije na početni ekran, igranje bez interneta i primanje obavještenja zahtijevaju HTTPS, koji uputstvo postavlja uz Nginx i besplatni Let’s Encrypt certifikat.",
    "adminH2": "Administratorski panel u pregledaču",
    "adminP": "Konzola zaštićena tokenom na /admin prikazuje ko je povezan, jednim klikom ažurira web klijent i može ga vratiti na prethodnu verziju, šalje obavještenja igračima, resetuje rang-listu, instalira špilove karata, stilove stola i muziku, navodi servere igre do kojih klijent smije doći i dijeli ključeve koji otključavaju samo neke njene dijelove.",
    "shareH2": "Pozovi igrače izvana",
    "shareP": "Linkovi s pozivom i QR kodovi rade na tvom serveru isto kao na pokerth.net: prijatelj otvori link i sjedne za tvoj sto. Ako je tvoj server dostupan s interneta, možeš ga i predložiti za javnu listu servera web klijenta; tamo se pojavljuje kad ga odobre administratori web klijenta.",
    "guidesH2": "Uputstva korak po korak",
    "guides": [
      "Uputstvo za postavljanje PokerTH servera",
      "Vlastiti hosting i instalacija jednom komandom",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ručna instalacija i HTTPS",
      "Administratorski panel"
    ],
    "faqH2": "Pitanja",
    "faq": [
      [
        "Je li hostovanje PokerTH servera besplatno?",
        "Da. PokerTH server i web klijent su besplatni softver otvorenog koda; treba ti samo računar na kojem će raditi."
      ],
      [
        "Koji hardver mi treba?",
        "Vrlo malo: bilo koji PC ili kućni server s Linuxom ili Dockerom, ili Raspberry Pi 4 ili 5. Žičana mrežna veza važnija je od procesorske snage."
      ],
      [
        "Trebaju li igrači išta instalirati?",
        "Ne. Otvore adresu servera u pregledaču na telefonu, tabletu ili računaru. Ko više voli aplikaciju, može koristiti PokerTH QML klijent ili klasični widget klijent: s njima se povezuje na isti server i igra za istim stolovima."
      ],
      [
        "Treba li pokerth.net ili internetska veza?",
        "Ne. Server u tvojoj lokalnoj mreži radi samostalno: igrači se na njega povezuju direktno, samo s nadimkom."
      ],
      [
        "Koliko igrača se može pridružiti?",
        "Do 10 igrača po stolu, plus gledaoci, i onoliko stolova koliko tvojoj grupi treba."
      ]
    ]
  },
  ca: {
    "title": "El teu propi servidor de pòquer — gratis, autoallotjat | PokerTH",
    "desc": "Servidor privat de Texas Hold’em a casa, al club o a l’escola: servidor PokerTH i client web gratuïts, instal·lats amb una ordre, amb Docker o en una Raspberry Pi.",
    "ldHeadline": "Com allotjar el teu propi servidor de pòquer PokerTH",
    "ldDesc": "Configura un servidor de Texas Hold’em privat i autoallotjat amb el servidor dedicat PokerTH i el client web de PokerTH.",
    "h1": "Allotja el teu propi servidor de pòquer",
    "lead": "PokerTH és gratuït i de codi obert de cap a peus: el servidor de joc i aquest client web poden funcionar a la teva pròpia màquina. N’hi ha prou amb un PC, un servidor domèstic o una Raspberry Pi per a una partida en família, una nit de club, una lliga d’oficina o una escola, i llavors cada mòbil, tauleta o ordinador de la teva xarxa juga al navegador només amb un sobrenom.",
    "whyH2": "Per què tenir-ne un de propi",
    "why": [
      [
        "Privat",
        "Les teves partides es queden a la teva màquina i a la teva xarxa; els jugadors no necessiten cap compte ni cap adreça de correu, només un sobrenom."
      ],
      [
        "A la teva manera",
        "Dona un nom propi al servidor, tria quins modes ofereix la pantalla d’inici de sessió, publica un missatge de benvinguda i mantén una classificació compartida per al teu grup."
      ],
      [
        "Gratuït",
        "Sense llicència, sense subscripció, sense anuncis: el servidor PokerTH i el client web són tots dos programari lliure."
      ]
    ],
    "partsH2": "Dues peces",
    "partsP": "Una partida de PokerTH necessita el servidor dedicat PokerTH, que reparteix les cartes i gestiona les taules, i el client web, que serveix l’aplicació als navegadors i els connecta a aquest servidor. Tots dos poden funcionar a la mateixa màquina. Tot continua sent compatible: les aplicacions de PokerTH es connecten al mateix servidor que els navegadors —el client QML a Windows, macOS, Linux i Android, i el client widget clàssic a l’escriptori—, de manera que a una mateixa taula hi poden jugar alhora navegadors i aplicacions.",
    "stepsH2": "Posa’l en marxa en tres passos",
    "steps": [
      [
        "Instal·la el servidor PokerTH",
        "Compila pokerth_dedicated_server a partir del codi font de PokerTH — versió 2.1.10 o posterior — seguint la guia del servidor del projecte PokerTH: cal Qt 6.7 o més recent, CMake i un compilador C++23. El paquet pokerth-server de les distribucions Linux és una versió anterior. El servidor escolta al port TCP 7234."
      ],
      [
        "Instal·la el client web",
        "A Debian, Ubuntu o Raspberry Pi OS, l’script d’instal·lació configura Node.js, el client web i un servei que s’inicia amb la màquina, amb una sola ordre. Els usuaris de Docker baixen una imatge preparada per a amd64, arm64 i armv7, i CasaOS importa el mateix fitxer Compose com a aplicació."
      ],
      [
        "Juga",
        "Des de qualsevol dispositiu de la teva xarxa, obre l’adreça de la màquina al port 8080, tria «LAN / Servidor dedicat», escriu un sobrenom i crea una taula. Els jugadors amb el client QML o widget de PokerTH es connecten a la mateixa màquina al port 7234 i s’uneixen a les mateixes taules."
      ]
    ],
    "piH2": "En una Raspberry Pi",
    "piP": "PokerTH intercanvia missatges petits i són els dispositius dels jugadors els que ho dibuixen tot, així que amb una Raspberry Pi n’hi ha de sobres: una Pi 4 amb 2 GB és l’opció ideal i una Pi 5 és més que suficient. Per a una vetllada fluida, la xarxa importa més que la placa: connecta la Pi al router amb un cable i fes servir un bon punt d’accés Wi-Fi per als jugadors.",
    "httpsH2": "HTTP a la xarxa local, HTTPS per als extres",
    "httpsP": "A la teva pròpia xarxa, el joc funciona amb HTTP normal. Instal·lar l’aplicació a la pantalla d’inici, jugar sense connexió i rebre notificacions requereix HTTPS, que la guia configura amb Nginx i un certificat gratuït de Let’s Encrypt.",
    "adminH2": "Un tauler d’administració al navegador",
    "adminP": "Una consola protegida per token a /admin mostra qui està connectat, actualitza el client web amb un clic i el pot tornar a la versió anterior, envia avisos als jugadors, reinicia la classificació, instal·la baralles, estils de taula i música, llista els servidors de joc als quals es pot connectar el client i reparteix claus que només desbloquegen algunes de les seves seccions.",
    "shareH2": "Convida jugadors de fora",
    "shareP": "Els enllaços d’invitació i els codis QR funcionen al teu servidor igual que a pokerth.net: un amic obre l’enllaç i seu a la teva taula. Si el teu servidor és accessible des d’internet, també el pots proposar per a la llista pública de servidors del client web; hi apareix un cop els administradors del client web l’aproven.",
    "guidesH2": "Guies pas a pas",
    "guides": [
      "Guia d’instal·lació del servidor PokerTH",
      "Autoallotjament i instal·lació amb una sola ordre",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Instal·lació manual i HTTPS",
      "El tauler d’administració"
    ],
    "faqH2": "Preguntes",
    "faq": [
      [
        "Allotjar un servidor PokerTH és gratuït?",
        "Sí. El servidor PokerTH i el client web són programari lliure i de codi obert; només et cal una màquina per fer-los funcionar."
      ],
      [
        "Quin maquinari necessito?",
        "Molt poc: qualsevol PC o servidor domèstic amb Linux o Docker, o una Raspberry Pi 4 o 5. Una connexió de xarxa per cable importa més que la potència de càlcul."
      ],
      [
        "Els jugadors han d’instal·lar res?",
        "No. Obren l’adreça del servidor en un navegador al mòbil, la tauleta o l’ordinador. Qui prefereixi una aplicació pot fer servir el client QML de PokerTH o el client widget clàssic: es connecten al mateix servidor i juguen a les mateixes taules."
      ],
      [
        "Cal pokerth.net o una connexió a internet?",
        "No. Un servidor a la teva xarxa local funciona de manera autònoma: els jugadors s’hi connecten directament, només amb un sobrenom."
      ],
      [
        "Quants jugadors hi poden entrar?",
        "Fins a 10 jugadors per taula, més espectadors, i tantes taules com necessiti el teu grup."
      ]
    ]
  },
  cs: {
    "title": "Vlastní pokerový server — zdarma, ve vlastní režii | PokerTH",
    "desc": "Soukromý server Texas Hold’em doma, v klubu nebo ve škole: bezplatný server PokerTH a webový klient, instalace jedním příkazem, s Dockerem nebo na Raspberry Pi.",
    "ldHeadline": "Jak provozovat vlastní pokerový server PokerTH",
    "ldDesc": "Zprovozněte soukromý server Texas Hold’em ve vlastní režii s vyhrazeným serverem PokerTH a webovým klientem PokerTH.",
    "h1": "Provozujte vlastní pokerový server",
    "lead": "PokerTH je zdarma a open source od začátku do konce: herní server i tento webový klient mohou běžet na vašem vlastním počítači. PC, domácí server nebo Raspberry Pi stačí pro rodinnou hru, klubový večer, firemní ligu nebo školu a každý telefon, tablet či počítač ve vaší síti pak hraje ve svém prohlížeči jen s přezdívkou.",
    "whyH2": "Proč vlastní server",
    "why": [
      [
        "Soukromí",
        "Vaše hry zůstávají na vašem počítači a ve vaší síti; hráči nepotřebují účet ani e-mailovou adresu, jen přezdívku."
      ],
      [
        "Podle vašich představ",
        "Pojmenujte server po svém, zvolte, které režimy nabídne přihlašovací obrazovka, zveřejněte uvítací zprávu a veďte pro svou skupinu společný žebříček."
      ],
      [
        "Zdarma",
        "Žádná licence, žádné předplatné, žádné reklamy: server PokerTH i webový klient jsou svobodný software."
      ]
    ],
    "partsH2": "Dvě části",
    "partsP": "Hra PokerTH potřebuje vyhrazený server PokerTH, který rozdává karty a řídí stoly, a webového klienta, který poskytuje aplikaci prohlížečům a připojuje je k tomuto serveru. Oba mohou běžet na stejném počítači. Vše zůstává kompatibilní: aplikace PokerTH se připojují ke stejnému serveru jako prohlížeče — QML klient pro Windows, macOS, Linux a Android i klasický widget klient pro desktop — takže u jednoho stolu mohou společně sedět hráči z prohlížečů i z aplikací.",
    "stepsH2": "Zprovoznění ve třech krocích",
    "steps": [
      [
        "Nainstalujte server PokerTH",
        "Sestavte pokerth_dedicated_server ze zdrojových kódů PokerTH — verze 2.1.10 nebo novější — podle návodu k serveru od projektu PokerTH: potřebuje Qt 6.7 nebo novější, CMake a kompilátor C++23. Balíček pokerth-server z distribucí Linuxu je starší verze. Server naslouchá na portu TCP 7234."
      ],
      [
        "Nainstalujte webového klienta",
        "Na Debianu, Ubuntu nebo Raspberry Pi OS nainstaluje instalační skript jediným příkazem Node.js, webového klienta a službu, která se spouští se startem počítače. Uživatelé Dockeru si stáhnou hotový obraz pro amd64, arm64 a armv7 a CasaOS importuje stejný soubor Compose jako aplikaci."
      ],
      [
        "Hrajte",
        "Na libovolném zařízení ve vaší síti otevřete adresu počítače na portu 8080, zvolte LAN / Vyhrazený server, zadejte přezdívku a vytvořte stůl. Hráči s QML nebo widget klientem PokerTH se připojí ke stejnému počítači na portu 7234 a přisednou ke stejným stolům."
      ]
    ],
    "piH2": "Na Raspberry Pi",
    "piP": "PokerTH si vyměňuje jen malé zprávy a veškeré vykreslování obstarávají zařízení hráčů, takže Raspberry Pi bohatě stačí: Pi 4 s 2 GB je ideální volba, Pi 5 je víc než dost. Pro plynulý večer záleží víc na síti než na desce — připojte Pi k routeru kabelem a pro hráče použijte dobrý přístupový bod Wi-Fi.",
    "httpsH2": "HTTP v LAN, HTTPS pro funkce navíc",
    "httpsP": "Ve vaší vlastní síti hra funguje přes obyčejné HTTP. Instalace aplikace na plochu, hraní offline a příjem oznámení vyžadují HTTPS, které návod nastaví pomocí Nginx a bezplatného certifikátu Let’s Encrypt.",
    "adminH2": "Administrace v prohlížeči",
    "adminP": "Konzole chráněná tokenem na adrese /admin ukazuje, kdo je připojen, jedním kliknutím aktualizuje webového klienta a umí ho vrátit zpět, posílá hráčům oznámení, nuluje žebříček, instaluje balíčky karet, styly stolů a hudbu, vypisuje herní servery, ke kterým se klient smí připojit, a rozdává klíče, které odemykají jen některé její sekce.",
    "shareH2": "Pozvěte hráče zvenčí",
    "shareP": "Odkazy s pozvánkou a QR kódy fungují na vašem serveru stejně jako na pokerth.net: přítel otevře odkaz a usedne k vašemu stolu. Pokud je váš server dostupný z internetu, můžete ho také navrhnout do veřejného seznamu serverů webového klienta; objeví se tam, jakmile ho administrátoři webového klienta schválí.",
    "guidesH2": "Návody krok za krokem",
    "guides": [
      "Návod k instalaci serveru PokerTH",
      "Vlastní hosting a instalace jedním příkazem",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ruční instalace a HTTPS",
      "Administrace"
    ],
    "faqH2": "Otázky",
    "faq": [
      [
        "Je provozování serveru PokerTH zdarma?",
        "Ano. Server PokerTH i webový klient jsou svobodný software s otevřeným zdrojovým kódem; potřebujete jen počítač, na kterém poběží."
      ],
      [
        "Jaký hardware potřebuji?",
        "Velmi málo: jakékoli PC nebo domácí server s Linuxem nebo Dockerem, případně Raspberry Pi 4 nebo 5. Kabelové připojení k síti je důležitější než výpočetní výkon."
      ],
      [
        "Musí hráči něco instalovat?",
        "Ne. Otevřou adresu serveru v prohlížeči na telefonu, tabletu nebo počítači. Kdo dává přednost aplikaci, může použít QML klienta PokerTH nebo klasického widget klienta: připojí se ke stejnému serveru a hraje u stejných stolů."
      ],
      [
        "Potřebuje to pokerth.net nebo připojení k internetu?",
        "Ne. Server ve vaší místní síti běží samostatně: hráči se k němu připojují přímo, jen s přezdívkou."
      ],
      [
        "Kolik hráčů se může připojit?",
        "Až 10 hráčů u stolu, plus diváci, a tolik stolů, kolik vaše skupina potřebuje."
      ]
    ]
  },
  cy: {
    "title": "Cynnal eich gweinydd pocer — am ddim, hunan-letya | PokerTH",
    "desc": "Gweinydd Texas Hold’em preifat gartref, mewn clwb neu ysgol: gweinydd PokerTH a'r cleient gwe am ddim, un gorchymyn i'w gosod, gyda Docker neu ar Raspberry Pi.",
    "ldHeadline": "Sut i gynnal eich gweinydd pocer PokerTH eich hun",
    "ldDesc": "Gosodwch weinydd Texas Hold’em preifat, hunan-letya gyda gweinydd pwrpasol PokerTH a chleient gwe PokerTH.",
    "h1": "Cynnal eich gweinydd pocer eich hun",
    "lead": "Mae PokerTH yn rhad ac am ddim ac yn god agored o'r dechrau i'r diwedd: gall gweinydd y gêm a'r cleient gwe hwn redeg ar eich peiriant eich hun. Mae cyfrifiadur personol, gweinydd cartref neu Raspberry Pi yn ddigon ar gyfer gêm deuluol, noson clwb, cynghrair swyddfa neu ysgol, ac yna mae pob ffôn, llechen neu gyfrifiadur ar eich rhwydwaith yn chwarae yn ei borwr gyda dim ond llysenw.",
    "whyH2": "Pam rhedeg eich un eich hun",
    "why": [
      [
        "Preifat",
        "Mae eich gemau'n aros ar eich peiriant a'ch rhwydwaith; nid oes angen cyfrif na chyfeiriad e-bost ar chwaraewyr, dim ond llysenw."
      ],
      [
        "At eich dant",
        "Rhowch ei enw ei hun i'r gweinydd, dewiswch pa foddau y mae'r sgrin mewngofnodi'n eu cynnig, postiwch neges groeso, a chadwch fwrdd arweinwyr a rennir i'ch grŵp."
      ],
      [
        "Am ddim",
        "Dim trwydded, dim tanysgrifiad, dim hysbysebion: mae gweinydd PokerTH a'r cleient gwe ill dau yn feddalwedd rydd."
      ]
    ],
    "partsH2": "Dwy ran",
    "partsP": "Mae gêm PokerTH angen gweinydd pwrpasol PokerTH, sy'n delio'r cardiau ac yn rhedeg y byrddau, a'r cleient gwe, sy'n gweini'r ap i'r porwyr ac yn eu cysylltu â'r gweinydd hwnnw. Gallant redeg ar yr un peiriant. Mae popeth yn aros yn gydnaws: mae apiau PokerTH yn cysylltu â'r un gweinydd â'r porwyr — y cleient QML ar Windows, macOS, Linux ac Android, a'r cleient widget clasurol ar y bwrdd gwaith — felly gall chwaraewyr gymysgu porwyr ac apiau wrth un bwrdd.",
    "stepsH2": "Ei osod mewn tri cham",
    "steps": [
      [
        "Gosodwch weinydd PokerTH",
        "Adeiladwch pokerth_dedicated_server o ffynonellau PokerTH — fersiwn 2.1.10 neu ddiweddarach — drwy ddilyn canllaw gweinydd prosiect PokerTH: mae angen Qt 6.7 neu fwy diweddar, CMake a chrynhoydd C++23 arno. Fersiwn hŷn yw pecyn pokerth-server dosbarthiadau Linux. Mae'r gweinydd yn gwrando ar borth TCP 7234."
      ],
      [
        "Gosodwch y cleient gwe",
        "Ar Debian, Ubuntu neu Raspberry Pi OS mae'r sgript gosod yn gosod Node.js, y cleient gwe a gwasanaeth sy'n cychwyn gyda'r peiriant, gydag un gorchymyn. Mae defnyddwyr Docker yn tynnu delwedd barod ar gyfer amd64, arm64 ac armv7, ac mae CasaOS yn mewnforio'r un ffeil Compose fel ap."
      ],
      [
        "Chwarae",
        "Ar unrhyw ddyfais ar eich rhwydwaith, agorwch gyfeiriad y peiriant ar borth 8080, dewiswch “LAN / Gweinydd pwrpasol”, teipiwch lysenw a chrëwch fwrdd. Mae chwaraewyr sydd â chleient QML neu widget PokerTH yn cysylltu â'r un peiriant ar borth 7234 ac yn ymuno â'r un byrddau."
      ]
    ],
    "piH2": "Ar Raspberry Pi",
    "piP": "Mae PokerTH yn cyfnewid negeseuon bach a dyfeisiau'r chwaraewyr sy'n gwneud yr holl waith lluniadu, felly mae Raspberry Pi yn hen ddigon: Pi 4 gyda 2 GB yw'r dewis delfrydol, ac mae Pi 5 yn fwy na digon. Am noson esmwyth mae'r rhwydwaith yn bwysicach na'r bwrdd cylched — cysylltwch y Pi â'r llwybrydd gyda chebl, a defnyddiwch bwynt mynediad Wi-Fi da i'r chwaraewyr.",
    "httpsH2": "HTTP ar y LAN, HTTPS ar gyfer y pethau ychwanegol",
    "httpsP": "Ar eich rhwydwaith eich hun mae'r gêm yn gweithio dros HTTP plaen. Mae gosod yr ap ar y sgrin gartref, chwarae all-lein a chael hysbysiadau angen HTTPS, y mae'r canllaw yn ei osod gyda Nginx a thystysgrif Let’s Encrypt am ddim.",
    "adminH2": "Panel gweinyddu yn y porwr",
    "adminP": "Mae consol wedi'i ddiogelu gan docyn yn /admin yn dangos pwy sydd wedi cysylltu, yn diweddaru'r cleient gwe gydag un clic ac yn gallu ei rolio'n ôl, yn anfon cyhoeddiadau i'r chwaraewyr, yn ailosod y bwrdd arweinwyr, yn gosod pecynnau cardiau, arddulliau bwrdd a cherddoriaeth, yn rhestru'r gweinyddion gêm y caiff y cleient eu cyrraedd, ac yn rhoi allweddi sy'n datgloi rhai o'i adrannau yn unig.",
    "shareH2": "Gwahodd chwaraewyr o'r tu allan",
    "shareP": "Mae dolenni gwahodd a chodau QR yn gweithio ar eich gweinydd yn union fel ar pokerth.net: mae ffrind yn agor y ddolen ac yn cael sedd wrth eich bwrdd. Os oes modd cyrraedd eich gweinydd o'r rhyngrwyd, gallwch hefyd ei gynnig ar gyfer rhestr gweinyddion cyhoeddus y cleient gwe; mae'n ymddangos yno unwaith y bydd gweinyddwyr y cleient gwe wedi'i gymeradwyo.",
    "guidesH2": "Canllawiau cam wrth gam",
    "guides": [
      "Canllaw gosod gweinydd PokerTH",
      "Hunan-letya a'r gosod gydag un gorchymyn",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Gosod â llaw a HTTPS",
      "Y panel gweinyddu"
    ],
    "faqH2": "Cwestiynau",
    "faq": [
      [
        "Ydy cynnal gweinydd PokerTH am ddim?",
        "Ydy. Mae gweinydd PokerTH a'r cleient gwe yn feddalwedd rydd a chod agored; dim ond peiriant i'w rhedeg sydd ei angen arnoch."
      ],
      [
        "Pa galedwedd sydd ei angen arnaf?",
        "Ychydig iawn: unrhyw gyfrifiadur personol neu weinydd cartref sy'n rhedeg Linux neu Docker, neu Raspberry Pi 4 neu 5. Mae cysylltiad rhwydwaith â gwifren yn bwysicach na phŵer prosesu."
      ],
      [
        "Oes angen i'r chwaraewyr osod unrhyw beth?",
        "Nac oes. Maen nhw'n agor cyfeiriad y gweinydd mewn porwr ar eu ffôn, eu llechen neu eu cyfrifiadur. Gall y rhai y mae'n well ganddynt ap ddefnyddio cleient QML PokerTH neu'r cleient widget clasurol: maen nhw'n cysylltu â'r un gweinydd ac yn chwarae wrth yr un byrddau."
      ],
      [
        "Oes angen pokerth.net neu gysylltiad rhyngrwyd arno?",
        "Nac oes. Mae gweinydd ar eich rhwydwaith lleol yn rhedeg ar ei ben ei hun: mae'r chwaraewyr yn cysylltu ag ef yn uniongyrchol, gyda dim ond llysenw."
      ],
      [
        "Faint o chwaraewyr all ymuno?",
        "Hyd at 10 chwaraewr fesul bwrdd, a gwylwyr hefyd, a chymaint o fyrddau ag sydd eu hangen ar eich grŵp."
      ]
    ]
  },
  da: {
    "title": "Host din egen pokerserver — gratis, selvhostet | PokerTH",
    "desc": "En privat Texas Hold’em-server derhjemme, i en klub eller på en skole: gratis PokerTH-server og webklient, sat op med én kommando, med Docker eller på Raspberry Pi.",
    "ldHeadline": "Sådan hoster du din egen PokerTH-pokerserver",
    "ldDesc": "Opsæt en privat, selvhostet Texas Hold’em-server med PokerTH’s dedikerede server og PokerTH’s webklient.",
    "h1": "Host din egen pokerserver",
    "lead": "PokerTH er gratis og open source hele vejen igennem: spilserveren og denne webklient kan køre på din egen maskine. En pc, en hjemmeserver eller en Raspberry Pi er nok til et familiespil, en klubaften, en kontorliga eller en skole, og så spiller hver telefon, tablet eller computer på dit netværk i browseren med blot et kaldenavn.",
    "whyH2": "Hvorfor køre din egen",
    "why": [
      [
        "Privat",
        "Dine spil bliver på din maskine og dit netværk; spillerne behøver hverken konto eller mailadresse, kun et kaldenavn."
      ],
      [
        "Din at forme",
        "Giv serveren sit eget navn, vælg hvilke tilstande login-skærmen tilbyder, slå en velkomstbesked op, og hold en fælles rangliste for din gruppe."
      ],
      [
        "Gratis",
        "Ingen licens, intet abonnement, ingen reklamer: PokerTH-serveren og webklienten er begge fri software."
      ]
    ],
    "partsH2": "To dele",
    "partsP": "Et PokerTH-spil kræver PokerTH’s dedikerede server, som deler kortene ud og styrer bordene, og webklienten, som leverer appen til browserne og forbinder dem med serveren. De kan køre på samme maskine. Alt forbliver kompatibelt: PokerTH’s apps – QML-klienten til Windows, macOS, Linux og Android og den klassiske widget-klient til desktop – forbinder til samme server som browserne, så spillerne kan blande browsere og apps ved ét bord.",
    "stepsH2": "Sæt den op i tre trin",
    "steps": [
      [
        "Installér PokerTH-serveren",
        "Byg pokerth_dedicated_server fra PokerTH’s kildekode — version 2.1.10 eller nyere — efter servervejledningen fra PokerTH-projektet: det kræver Qt 6.7 eller nyere, CMake og en C++23-compiler. Pakken pokerth-server i Linux-distributionerne er en ældre version. Serveren lytter på TCP-port 7234."
      ],
      [
        "Installér webklienten",
        "På Debian, Ubuntu eller Raspberry Pi OS sætter installationsscriptet Node.js, webklienten og en tjeneste, der starter med maskinen, op med én kommando. Docker-brugere henter et færdigt image til amd64, arm64 og armv7, og CasaOS importerer den samme Compose-fil som en app."
      ],
      [
        "Spil",
        "Åbn maskinens adresse på port 8080 fra en hvilken som helst enhed på dit netværk, vælg »LAN / Dedikeret server«, skriv et kaldenavn, og opret et bord. Spillere med PokerTH’s QML- eller widget-klient forbinder til samme maskine på port 7234 og sætter sig ved de samme borde."
      ]
    ],
    "piH2": "På en Raspberry Pi",
    "piP": "PokerTH udveksler små beskeder, og spillernes enheder står for al tegningen, så en Raspberry Pi er rigeligt: en Pi 4 med 2 GB er det optimale valg, en Pi 5 er mere end nok. For en glat aften betyder netværket mere end kortet — sæt Pi’en i routeren med et kabel, og brug et godt Wi-Fi-adgangspunkt til spillerne.",
    "httpsH2": "HTTP på LAN, HTTPS til ekstrafunktionerne",
    "httpsP": "På dit eget netværk virker spillet over almindelig HTTP. At installere appen på hjemmeskærmen, spille offline og modtage notifikationer kræver HTTPS, som vejledningen sætter op med Nginx og et gratis Let’s Encrypt-certifikat.",
    "adminH2": "Et adminpanel i browseren",
    "adminP": "En tokenbeskyttet konsol på /admin viser, hvem der er forbundet, opdaterer webklienten med ét klik og kan rulle den tilbage, sender meddelelser til spillerne, nulstiller ranglisten, installerer kortsæt, bordstile og musik, angiver hvilke spilservere klienten må nå, og udleverer nøgler, der kun låser nogle af dens sektioner op.",
    "shareH2": "Inviter spillere udefra",
    "shareP": "Invitationslinks og QR-koder virker på din server præcis som på pokerth.net: en ven åbner linket og får plads ved dit bord. Hvis din server kan nås fra internettet, kan du også foreslå den til webklientens offentlige serverliste; den vises der, når webklientens administratorer har godkendt den.",
    "guidesH2": "Trin-for-trin-vejledninger",
    "guides": [
      "Vejledning til opsætning af PokerTH-serveren",
      "Selvhosting og installation med én kommando",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Manuel installation og HTTPS",
      "Adminpanelet"
    ],
    "faqH2": "Spørgsmål",
    "faq": [
      [
        "Er det gratis at hoste en PokerTH-server?",
        "Ja. PokerTH-serveren og webklienten er gratis open source-software; du skal kun bruge en maskine at køre dem på."
      ],
      [
        "Hvilken hardware skal jeg bruge?",
        "Meget lidt: enhver pc eller hjemmeserver, der kører Linux eller Docker, eller en Raspberry Pi 4 eller 5. En kablet netværksforbindelse betyder mere end regnekraft."
      ],
      [
        "Skal spillerne installere noget?",
        "Nej. De åbner serverens adresse i en browser på deres telefon, tablet eller computer. Den, der foretrækker en app, kan bruge PokerTH’s QML-klient eller den klassiske widget-klient: de forbinder til samme server og spiller ved de samme borde."
      ],
      [
        "Kræver det pokerth.net eller en internetforbindelse?",
        "Nej. En server på dit lokale netværk kører helt for sig selv: spillerne forbinder direkte til den med blot et kaldenavn."
      ],
      [
        "Hvor mange spillere kan deltage?",
        "Op til 10 spillere pr. bord, plus tilskuere, og lige så mange borde, som din gruppe har brug for."
      ]
    ]
  },
  de: {
    "title": "Eigener Pokerserver — kostenlos, selbst gehostet | PokerTH",
    "desc": "Privater Server für Texas Hold’em – zu Hause, im Verein, in der Schule: kostenloser PokerTH-Server und Web-Client, mit einem Befehl, per Docker oder Raspberry Pi.",
    "ldHeadline": "So hosten Sie Ihren eigenen PokerTH-Pokerserver",
    "ldDesc": "Richten Sie mit dem dedizierten PokerTH-Server und dem PokerTH-Web-Client einen privaten, selbst gehosteten Server für Texas Hold’em ein.",
    "h1": "Eigenen Pokerserver hosten",
    "lead": "PokerTH ist von Anfang bis Ende kostenlos und Open Source: Der Spielserver und dieser Web-Client können auf Ihrem eigenen Rechner laufen. Ein PC, ein Heimserver oder ein Raspberry Pi genügt für eine Familienrunde, einen Vereinsabend, eine Büroliga oder eine Schule, und jedes Handy, Tablet oder jeder Computer in Ihrem Netzwerk spielt dann im Browser, nur mit einem Spitznamen.",
    "whyH2": "Warum ein eigener Server",
    "why": [
      [
        "Privat",
        "Ihre Spiele bleiben auf Ihrem Rechner und in Ihrem Netzwerk; die Spieler brauchen weder Konto noch E-Mail-Adresse, nur einen Spitznamen."
      ],
      [
        "Ganz nach Ihren Wünschen",
        "Geben Sie dem Server einen eigenen Namen, legen Sie fest, welche Modi der Anmeldebildschirm anbietet, veröffentlichen Sie eine Begrüßungsnachricht und führen Sie eine gemeinsame Rangliste für Ihre Runde."
      ],
      [
        "Kostenlos",
        "Keine Lizenz, kein Abo, keine Werbung: Der PokerTH-Server und der Web-Client sind beide freie Software."
      ]
    ],
    "partsH2": "Zwei Bausteine",
    "partsP": "Eine PokerTH-Partie braucht den dedizierten PokerTH-Server, der die Karten austeilt und die Tische verwaltet, und den Web-Client, der die App an die Browser ausliefert und sie mit diesem Server verbindet. Beide können auf demselben Rechner laufen. Alles bleibt kompatibel: Die PokerTH-Apps verbinden sich mit demselben Server wie die Browser – der QML-Client unter Windows, macOS, Linux und Android und der klassische Widget-Client auf dem Desktop –, sodass Spieler an einem Tisch Browser und Apps mischen können.",
    "stepsH2": "In drei Schritten eingerichtet",
    "steps": [
      [
        "PokerTH-Server installieren",
        "Bauen Sie pokerth_dedicated_server aus den PokerTH-Quellen — Version 2.1.10 oder neuer — nach der Server-Anleitung des PokerTH-Projekts: Dafür brauchen Sie Qt 6.7 oder neuer, CMake und einen C++23-Compiler. Das Paket pokerth-server der Linux-Distributionen ist eine ältere Version. Der Server lauscht auf TCP-Port 7234."
      ],
      [
        "Web-Client installieren",
        "Unter Debian, Ubuntu oder Raspberry Pi OS richtet das Installationsskript mit einem einzigen Befehl Node.js, den Web-Client und einen Dienst ein, der mit dem Rechner startet. Docker-Nutzer laden ein fertiges Image für amd64, arm64 und armv7, und CasaOS importiert dieselbe Compose-Datei als App."
      ],
      [
        "Spielen",
        "Öffnen Sie auf einem beliebigen Gerät in Ihrem Netzwerk die Adresse des Rechners auf Port 8080, wählen Sie „LAN / Dedizierter Server“, geben Sie einen Spitznamen ein und erstellen Sie einen Tisch. Spieler mit dem QML- oder Widget-Client von PokerTH verbinden sich mit demselben Rechner auf Port 7234 und setzen sich an dieselben Tische."
      ]
    ],
    "piH2": "Auf dem Raspberry Pi",
    "piP": "PokerTH tauscht nur kleine Nachrichten aus, und die Geräte der Spieler übernehmen die gesamte Darstellung, daher reicht ein Raspberry Pi völlig: Ein Pi 4 mit 2 GB ist ideal, ein Pi 5 mehr als genug. Für einen reibungslosen Abend zählt das Netzwerk mehr als die Platine — schließen Sie den Pi per Kabel an den Router an und sorgen Sie für einen guten Wi-Fi-Zugangspunkt für die Spieler.",
    "httpsH2": "HTTP im LAN, HTTPS für die Extras",
    "httpsP": "In Ihrem eigenen Netzwerk läuft das Spiel über einfaches HTTP. Um die App auf dem Home-Bildschirm zu installieren, offline zu spielen und Benachrichtigungen zu erhalten, ist HTTPS nötig; die Anleitung richtet es mit Nginx und einem kostenlosen Zertifikat von Let’s Encrypt ein.",
    "adminH2": "Ein Admin-Bereich im Browser",
    "adminP": "Eine per Token geschützte Konsole unter /admin zeigt, wer verbunden ist, aktualisiert den Web-Client mit einem Klick und kann das Update auch rückgängig machen, schickt Ankündigungen an die Spieler, setzt die Rangliste zurück, installiert Kartendecks, Tischstile und Musik, legt die Spielserver fest, die der Client erreichen darf, und vergibt Schlüssel, die nur einzelne ihrer Bereiche freischalten.",
    "shareH2": "Spieler von außerhalb einladen",
    "shareP": "Einladungslinks und QR-Codes funktionieren auf Ihrem Server genauso wie auf pokerth.net: Ein Freund öffnet den Link und sitzt an Ihrem Tisch. Ist Ihr Server aus dem Internet erreichbar, können Sie ihn außerdem für die öffentliche Serverliste des Web-Clients vorschlagen; dort erscheint er, sobald die Admins des Web-Clients ihn freigeben.",
    "guidesH2": "Schritt-für-Schritt-Anleitungen",
    "guides": [
      "Anleitung zur Einrichtung des PokerTH-Servers",
      "Selbst hosten und Installation mit einem Befehl",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Manuelle Installation und HTTPS",
      "Der Admin-Bereich"
    ],
    "faqH2": "Fragen",
    "faq": [
      [
        "Ist es kostenlos, einen PokerTH-Server zu hosten?",
        "Ja. Der PokerTH-Server und der Web-Client sind kostenlose Open-Source-Software; Sie brauchen nur einen Rechner, auf dem sie laufen."
      ],
      [
        "Welche Hardware brauche ich?",
        "Sehr wenig: einen beliebigen PC oder Heimserver mit Linux oder Docker oder einen Raspberry Pi 4 oder 5. Eine kabelgebundene Netzwerkverbindung zählt mehr als Rechenleistung."
      ],
      [
        "Müssen die Spieler etwas installieren?",
        "Nein. Sie öffnen die Adresse des Servers im Browser auf Handy, Tablet oder Computer. Wer lieber eine App nutzt, kann den QML-Client von PokerTH oder den klassischen Widget-Client verwenden: Beide verbinden sich mit demselben Server, und gespielt wird an denselben Tischen."
      ],
      [
        "Braucht man pokerth.net oder eine Internetverbindung?",
        "Nein. Ein Server in Ihrem lokalen Netzwerk läuft eigenständig: Die Spieler verbinden sich direkt mit ihm, nur mit einem Spitznamen."
      ],
      [
        "Wie viele Spieler können mitmachen?",
        "Bis zu 10 Spieler pro Tisch, dazu Zuschauer, und so viele Tische, wie Ihre Runde braucht."
      ]
    ]
  },
  el: {
    "title": "Δικός σας διακομιστής πόκερ — δωρεάν, στο σπίτι σας | PokerTH",
    "desc": "Ιδιωτικός διακομιστής Texas Hold’em στο σπίτι, σε σύλλογο ή σχολείο: δωρεάν διακομιστής και πελάτης ιστού PokerTH, με μία εντολή, με Docker ή σε Raspberry Pi.",
    "ldHeadline": "Πώς να στήσετε τον δικό σας διακομιστή πόκερ PokerTH",
    "ldDesc": "Στήστε έναν ιδιωτικό διακομιστή Texas Hold’em στο δικό σας μηχάνημα με τον αποκλειστικό διακομιστή του PokerTH και τον πελάτη ιστού του PokerTH.",
    "h1": "Στήστε τον δικό σας διακομιστή πόκερ",
    "lead": "Το PokerTH είναι δωρεάν και ανοιχτού κώδικα από άκρη σε άκρη: ο διακομιστής του παιχνιδιού και αυτός ο πελάτης ιστού μπορούν να τρέχουν στο δικό σας μηχάνημα. Ένας υπολογιστής, ένας οικιακός διακομιστής ή ένα Raspberry Pi αρκεί για ένα οικογενειακό παιχνίδι, μια βραδιά συλλόγου, ένα πρωτάθλημα γραφείου ή ένα σχολείο, και τότε κάθε κινητό, τάμπλετ ή υπολογιστής στο δίκτυό σας παίζει στον περιηγητή του μόνο με ένα ψευδώνυμο.",
    "whyH2": "Γιατί δικός σας διακομιστής",
    "why": [
      [
        "Ιδιωτικό",
        "Τα παιχνίδια σας μένουν στο μηχάνημα και στο δίκτυό σας· οι παίκτες δεν χρειάζονται ούτε λογαριασμό ούτε διεύθυνση email, μόνο ένα ψευδώνυμο."
      ],
      [
        "Όπως τον θέλετε",
        "Δώστε στον διακομιστή το δικό του όνομα, επιλέξτε ποιες λειτουργίες προσφέρει η οθόνη σύνδεσης, δημοσιεύστε ένα μήνυμα καλωσορίσματος και κρατήστε μια κοινή κατάταξη για την παρέα σας."
      ],
      [
        "Δωρεάν",
        "Χωρίς άδεια χρήσης, χωρίς συνδρομή, χωρίς διαφημίσεις: ο διακομιστής PokerTH και ο πελάτης ιστού είναι και οι δύο ελεύθερο λογισμικό."
      ]
    ],
    "partsH2": "Δύο κομμάτια",
    "partsP": "Ένα παιχνίδι PokerTH χρειάζεται τον αποκλειστικό διακομιστή του PokerTH, που μοιράζει τα φύλλα και διαχειρίζεται τα τραπέζια, και τον πελάτη ιστού, που σερβίρει την εφαρμογή στους περιηγητές και τους συνδέει με αυτόν τον διακομιστή. Μπορούν να τρέχουν στο ίδιο μηχάνημα. Όλα παραμένουν συμβατά: οι εφαρμογές PokerTH — ο πελάτης QML για Windows, macOS, Linux και Android και ο κλασικός πελάτης widget για υπολογιστή — συνδέονται στον ίδιο διακομιστή με τους περιηγητές, οπότε στο ίδιο τραπέζι μπορούν να κάθονται μαζί παίκτες από περιηγητή και από εφαρμογή.",
    "stepsH2": "Στήσιμο σε τρία βήματα",
    "steps": [
      [
        "Εγκαταστήστε τον διακομιστή PokerTH",
        "Μεταγλωττίστε το pokerth_dedicated_server από τον πηγαίο κώδικα του PokerTH — έκδοση 2.1.10 ή νεότερη — ακολουθώντας τον οδηγό διακομιστή του έργου PokerTH: χρειάζεται Qt 6.7 ή νεότερο, CMake και μεταγλωττιστή C++23. Το πακέτο pokerth-server των διανομών Linux είναι παλαιότερη έκδοση. Ο διακομιστής ακούει στη θύρα TCP 7234."
      ],
      [
        "Εγκαταστήστε τον πελάτη ιστού",
        "Σε Debian, Ubuntu ή Raspberry Pi OS, το σενάριο εγκατάστασης ρυθμίζει με μία μόνο εντολή το Node.js, τον πελάτη ιστού και μια υπηρεσία που ξεκινά μαζί με το μηχάνημα. Όσοι χρησιμοποιούν Docker κατεβάζουν έτοιμη εικόνα για amd64, arm64 και armv7, και το CasaOS εισάγει το ίδιο αρχείο Compose ως εφαρμογή."
      ],
      [
        "Παίξτε",
        "Σε οποιαδήποτε συσκευή του δικτύου σας, ανοίξτε τη διεύθυνση του μηχανήματος στη θύρα 8080, επιλέξτε LAN / Αποκλειστικός διακομιστής, πληκτρολογήστε ένα ψευδώνυμο και δημιουργήστε ένα τραπέζι. Οι παίκτες με τον πελάτη QML ή widget του PokerTH συνδέονται στο ίδιο μηχάνημα στη θύρα 7234 και μπαίνουν στα ίδια τραπέζια."
      ]
    ],
    "piH2": "Σε Raspberry Pi",
    "piP": "Το PokerTH ανταλλάσσει μικρά μηνύματα και όλη τη σχεδίαση την κάνουν οι συσκευές των παικτών, οπότε ένα Raspberry Pi αρκεί και περισσεύει: ένα Pi 4 με 2 GB είναι η ιδανική επιλογή, ένα Pi 5 είναι παραπάνω από αρκετό. Για μια βραδιά χωρίς κολλήματα, το δίκτυο μετράει περισσότερο από την πλακέτα — συνδέστε το Pi στον δρομολογητή με καλώδιο και χρησιμοποιήστε ένα καλό σημείο πρόσβασης Wi-Fi για τους παίκτες.",
    "httpsH2": "HTTP στο LAN, HTTPS για τα επιπλέον",
    "httpsP": "Στο δικό σας δίκτυο το παιχνίδι λειτουργεί με απλό HTTP. Η εγκατάσταση της εφαρμογής στην αρχική οθόνη, το παιχνίδι εκτός σύνδεσης και η λήψη ειδοποιήσεων χρειάζονται HTTPS, το οποίο ο οδηγός ρυθμίζει με Nginx και ένα δωρεάν πιστοποιητικό Let’s Encrypt.",
    "adminH2": "Πίνακας διαχείρισης στον περιηγητή",
    "adminP": "Μια κονσόλα στο /admin, προστατευμένη με token, δείχνει ποιος είναι συνδεδεμένος, ενημερώνει τον πελάτη ιστού με ένα κλικ και μπορεί να τον επαναφέρει στην προηγούμενη έκδοση, στέλνει ανακοινώσεις στους παίκτες, μηδενίζει την κατάταξη, εγκαθιστά τράπουλες, στιλ τραπεζιού και μουσική, απαριθμεί τους διακομιστές παιχνιδιού στους οποίους μπορεί να συνδεθεί ο πελάτης και μοιράζει κλειδιά που ξεκλειδώνουν μόνο ορισμένες από τις ενότητές της.",
    "shareH2": "Προσκαλέστε παίκτες απ’ έξω",
    "shareP": "Οι σύνδεσμοι πρόσκλησης και οι κωδικοί QR λειτουργούν στον διακομιστή σας ακριβώς όπως στο pokerth.net: ένας φίλος ανοίγει τον σύνδεσμο και κάθεται στο τραπέζι σας. Αν ο διακομιστής σας είναι προσβάσιμος από το διαδίκτυο, μπορείτε επίσης να τον προτείνετε για τη δημόσια λίστα διακομιστών του πελάτη ιστού· εμφανίζεται εκεί μόλις τον εγκρίνουν οι διαχειριστές του πελάτη ιστού.",
    "guidesH2": "Οδηγοί βήμα προς βήμα",
    "guides": [
      "Οδηγός εγκατάστασης διακομιστή PokerTH",
      "Αυτοφιλοξενία και εγκατάσταση με μία εντολή",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Χειροκίνητη εγκατάσταση και HTTPS",
      "Ο πίνακας διαχείρισης"
    ],
    "faqH2": "Ερωτήσεις",
    "faq": [
      [
        "Είναι δωρεάν να φιλοξενήσω διακομιστή PokerTH;",
        "Ναι. Ο διακομιστής PokerTH και ο πελάτης ιστού είναι δωρεάν λογισμικό ανοιχτού κώδικα· χρειάζεστε μόνο ένα μηχάνημα για να τα τρέξετε."
      ],
      [
        "Τι υλικό χρειάζομαι;",
        "Πολύ λίγο: οποιονδήποτε υπολογιστή ή οικιακό διακομιστή που τρέχει Linux ή Docker, ή ένα Raspberry Pi 4 ή 5. Μια ενσύρματη σύνδεση δικτύου μετράει περισσότερο από την υπολογιστική ισχύ."
      ],
      [
        "Πρέπει οι παίκτες να εγκαταστήσουν κάτι;",
        "Όχι. Ανοίγουν τη διεύθυνση του διακομιστή σε έναν περιηγητή στο κινητό, στο τάμπλετ ή στον υπολογιστή τους. Όσοι προτιμούν μια εφαρμογή μπορούν να χρησιμοποιήσουν τον πελάτη QML του PokerTH ή τον κλασικό πελάτη widget: συνδέονται στον ίδιο διακομιστή και παίζουν στα ίδια τραπέζια."
      ],
      [
        "Χρειάζεται το pokerth.net ή σύνδεση στο διαδίκτυο;",
        "Όχι. Ένας διακομιστής στο τοπικό σας δίκτυο λειτουργεί αυτόνομα: οι παίκτες συνδέονται απευθείας σε αυτόν, μόνο με ένα ψευδώνυμο."
      ],
      [
        "Πόσοι παίκτες μπορούν να μπουν;",
        "Έως 10 παίκτες ανά τραπέζι, συν θεατές, και όσα τραπέζια χρειάζεται η παρέα σας."
      ]
    ]
  },
  eo: {
    "title": "Gastigu propran pokeran servilon — senpage, memgastigite | PokerTH",
    "desc": "Privata Texas Hold’em-servilo hejme, en klubo aŭ lernejo: la senpaga servilo kaj retkliento de PokerTH, instalitaj per unu komando, per Docker aŭ sur Raspberry Pi.",
    "ldHeadline": "Kiel gastigi vian propran pokeran servilon PokerTH",
    "ldDesc": "Starigu privatan, memgastigatan Texas Hold’em-servilon per la dediĉita servilo de PokerTH kaj la retkliento de PokerTH.",
    "h1": "Gastigu vian propran pokeran servilon",
    "lead": "PokerTH estas senpaga kaj malfermitkoda de komenco ĝis fino: la ludservilo kaj ĉi tiu retkliento povas funkcii en via propra maŝino. Komputilo, hejma servilo aŭ Raspberry Pi sufiĉas por familia ludo, kluba vespero, oficeja ligo aŭ lernejo, kaj ĉiu telefono, tabulkomputilo aŭ komputilo en via reto tiam ludas en sia retumilo per nur kaŝnomo.",
    "whyH2": "Kial havi vian propran",
    "why": [
      [
        "Privata",
        "Viaj ludoj restas en via maŝino kaj via reto; ludantoj bezonas nek konton nek retpoŝtadreson, nur kaŝnomon."
      ],
      [
        "Laŭ via gusto",
        "Donu al la servilo propran nomon, elektu, kiujn reĝimojn proponas la ensaluta ekrano, afiŝu bonvenan mesaĝon kaj tenu komunan rangigon por via grupo."
      ],
      [
        "Senpaga",
        "Sen licenco, sen abono, sen reklamoj: la PokerTH-servilo kaj la retkliento estas ambaŭ libera programaro."
      ]
    ],
    "partsH2": "Du partoj",
    "partsP": "Ludo de PokerTH bezonas la dediĉitan servilon de PokerTH, kiu disdonas la kartojn kaj mastrumas la tablojn, kaj la retklienton, kiu liveras la aplikaĵon al la retumiloj kaj konektas ilin al tiu servilo. Ambaŭ povas funkcii en la sama maŝino. Ĉio restas kongrua: la aplikaĵoj de PokerTH konektiĝas al la sama servilo kiel la retumiloj — la QML-kliento en Windows, macOS, Linux kaj Android, kaj la klasika widget-kliento en labortablaj komputiloj — do ludantoj povas miksi retumilojn kaj aplikaĵojn ĉe unu tablo.",
    "stepsH2": "Starigu ĝin en tri paŝoj",
    "steps": [
      [
        "Instalu la PokerTH-servilon",
        "Kompilu pokerth_dedicated_server el la fontkodo de PokerTH — versio 2.1.10 aŭ posta — laŭ la servila gvidilo de la projekto PokerTH: ĝi bezonas Qt 6.7 aŭ pli novan, CMake kaj C++23-kompililon. La pakaĵo pokerth-server de Linux-distribuoj estas pli malnova versio. La servilo aŭskultas ĉe TCP-pordo 7234."
      ],
      [
        "Instalu la retklienton",
        "Ĉe Debian, Ubuntu aŭ Raspberry Pi OS la instala skripto starigas Node.js, la retklienton kaj servon, kiu startas kun la maŝino, per unu sola komando. Uzantoj de Docker elŝutas pretan bildon por amd64, arm64 kaj armv7, kaj CasaOS importas la saman Compose-dosieron kiel aplikaĵon."
      ],
      [
        "Ludu",
        "En iu ajn aparato en via reto, malfermu la adreson de la maŝino ĉe pordo 8080, elektu LAN / Dediĉita servilo, tajpu kaŝnomon kaj kreu tablon. Ludantoj kun la QML- aŭ widget-kliento de PokerTH konektiĝas al la sama maŝino ĉe pordo 7234 kaj aliĝas al la samaj tabloj."
      ]
    ],
    "piH2": "Sur Raspberry Pi",
    "piP": "PokerTH interŝanĝas malgrandajn mesaĝojn, kaj la aparatoj de la ludantoj faras la tutan desegnadon, do Raspberry Pi tute sufiĉas: Pi 4 kun 2 GB estas la ideala elekto, Pi 5 estas pli ol sufiĉa. Por glata vespero la reto gravas pli ol la plato — konektu la Pi al la enkursigilo per kablo, kaj uzu bonan Wi-Fi-alirpunkton por la ludantoj.",
    "httpsH2": "HTTP en la loka reto, HTTPS por la kromaĵoj",
    "httpsP": "En via propra reto la ludo funkcias per simpla HTTP. Instali la aplikaĵon sur la hejmekrano, ludi senkonekte kaj ricevi sciigojn bezonas HTTPS, kiun la gvidilo starigas per Nginx kaj senpaga atestilo de Let’s Encrypt.",
    "adminH2": "Administra panelo en la retumilo",
    "adminP": "Konzolo protektita per ĵetono ĉe /admin montras, kiu estas konektita, ĝisdatigas la retklienton per unu klako kaj povas malfari tion, sendas anoncojn al la ludantoj, nuligas la rangigon, instalas kartarojn, tablostilojn kaj muzikon, listigas la ludservilojn, kiujn la kliento rajtas atingi, kaj disdonas ŝlosilojn, kiuj malŝlosas nur kelkajn el ĝiaj sekcioj.",
    "shareH2": "Invitu ludantojn de ekstere",
    "shareP": "Invitaj ligiloj kaj QR-kodoj funkcias en via servilo same kiel ĉe pokerth.net: amiko malfermas la ligilon kaj sidiĝas ĉe via tablo. Se via servilo estas atingebla el la interreto, vi ankaŭ povas proponi ĝin por la publika servilolisto de la retkliento; ĝi aperas tie, kiam la administrantoj de la retkliento aprobas ĝin.",
    "guidesH2": "Gvidiloj paŝon post paŝo",
    "guides": [
      "Gvidilo por instali la PokerTH-servilon",
      "Memgastigado kaj instalo per unu komando",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Mana instalo kaj HTTPS",
      "La administra panelo"
    ],
    "faqH2": "Demandoj",
    "faq": [
      [
        "Ĉu gastigi PokerTH-servilon estas senpage?",
        "Jes. La PokerTH-servilo kaj la retkliento estas senpaga kaj malfermitkoda programaro; vi bezonas nur maŝinon por funkciigi ilin."
      ],
      [
        "Kian aparataron mi bezonas?",
        "Tre malmulte: ajna komputilo aŭ hejma servilo kun Linux aŭ Docker, aŭ Raspberry Pi 4 aŭ 5. Drata retkonekto gravas pli ol komputpovo."
      ],
      [
        "Ĉu la ludantoj devas instali ion?",
        "Ne. Ili malfermas la adreson de la servilo en la retumilo de sia telefono, tabulkomputilo aŭ komputilo. Kiuj preferas aplikaĵon, povas uzi la QML-klienton de PokerTH aŭ la klasikan widget-klienton: ili konektiĝas al la sama servilo kaj ludas ĉe la samaj tabloj."
      ],
      [
        "Ĉu necesas pokerth.net aŭ interreta konekto?",
        "Ne. Servilo en via loka reto funkcias memstare: la ludantoj konektiĝas rekte al ĝi, per nur kaŝnomo."
      ],
      [
        "Kiom da ludantoj povas aliĝi?",
        "Ĝis 10 ludantoj po tablo, plus spektantoj, kaj tiom da tabloj, kiom via grupo bezonas."
      ]
    ]
  },
  es: {
    "title": "Tu propio servidor de póker — gratis, autoalojado | PokerTH",
    "desc": "Servidor privado de Texas Hold’em en casa, en un club o en el colegio: el servidor y el cliente web gratis de PokerTH, con un comando, con Docker o en Raspberry Pi.",
    "ldHeadline": "Cómo montar tu propio servidor de póker PokerTH",
    "ldDesc": "Monta un servidor privado y autoalojado de Texas Hold’em con el servidor dedicado de PokerTH y el cliente web de PokerTH.",
    "h1": "Monta tu propio servidor de póker",
    "lead": "PokerTH es libre y de código abierto de principio a fin: el servidor de juego y este cliente web pueden funcionar en tu propia máquina. Un PC, un servidor doméstico o una Raspberry Pi bastan para una partida en familia, una noche de club, una liga de oficina o un colegio, y cualquier móvil, tableta u ordenador de tu red juega entonces en su navegador solo con un apodo.",
    "whyH2": "Por qué tener el tuyo",
    "why": [
      [
        "Privado",
        "Tus partidas se quedan en tu máquina y en tu red; los jugadores no necesitan cuenta ni dirección de correo, solo un apodo."
      ],
      [
        "A tu medida",
        "Ponle al servidor su propio nombre, elige qué modos ofrece la pantalla de inicio de sesión, publica un mensaje de bienvenida y lleva una clasificación compartida para tu grupo."
      ],
      [
        "Gratis",
        "Sin licencia, sin suscripción, sin anuncios: el servidor PokerTH y el cliente web son software libre."
      ]
    ],
    "partsH2": "Dos piezas",
    "partsP": "Una partida de PokerTH necesita el servidor dedicado de PokerTH, que reparte las cartas y gestiona las mesas, y el cliente web, que sirve la aplicación a los navegadores y los conecta con ese servidor. Ambos pueden funcionar en la misma máquina. Todo sigue siendo compatible: las aplicaciones de PokerTH se conectan al mismo servidor que los navegadores —el cliente QML en Windows, macOS, Linux y Android, y el clásico cliente widget de escritorio—, así que en una misma mesa pueden coincidir jugadores con navegadores y con aplicaciones.",
    "stepsH2": "Instálalo en tres pasos",
    "steps": [
      [
        "Instala el servidor PokerTH",
        "Compila pokerth_dedicated_server a partir de las fuentes de PokerTH — versión 2.1.10 o posterior — siguiendo la guía del servidor del proyecto PokerTH: necesita Qt 6.7 o más reciente, CMake y un compilador C++23. El paquete pokerth-server de las distribuciones Linux es una versión antigua. El servidor escucha en el puerto TCP 7234."
      ],
      [
        "Instala el cliente web",
        "En Debian, Ubuntu o Raspberry Pi OS, el script de instalación configura Node.js, el cliente web y un servicio que arranca con la máquina, todo con un solo comando. Quien use Docker descarga una imagen ya preparada para amd64, arm64 y armv7, y CasaOS importa el mismo archivo Compose como una aplicación."
      ],
      [
        "Juega",
        "En cualquier dispositivo de tu red, abre la dirección de la máquina en el puerto 8080, elige «LAN / Servidor dedicado», escribe un apodo y crea una mesa. Los jugadores con el cliente QML o widget de PokerTH se conectan a la misma máquina en el puerto 7234 y se unen a las mismas mesas."
      ]
    ],
    "piH2": "En una Raspberry Pi",
    "piP": "PokerTH intercambia mensajes pequeños y los dispositivos de los jugadores se encargan de todo el dibujo, así que una Raspberry Pi va sobrada: una Pi 4 con 2 GB es la opción ideal y una Pi 5 es más que suficiente. Para una velada fluida importa más la red que la placa: conecta la Pi al router con un cable y usa un buen punto de acceso Wi-Fi para los jugadores.",
    "httpsH2": "HTTP en la LAN, HTTPS para los extras",
    "httpsP": "En tu propia red, el juego funciona con HTTP sin más. Instalar la aplicación en la pantalla de inicio, jugar sin conexión y recibir notificaciones requieren HTTPS, que la guía configura con Nginx y un certificado gratuito de Let’s Encrypt.",
    "adminH2": "Un panel de administración en el navegador",
    "adminP": "Una consola protegida por token en /admin muestra quién está conectado, actualiza el cliente web con un clic y puede volver a la versión anterior, envía anuncios a los jugadores, reinicia la clasificación, instala barajas, estilos de mesa y música, enumera los servidores de juego a los que puede conectarse el cliente y reparte claves que solo desbloquean algunas de sus secciones.",
    "shareH2": "Invita a jugadores de fuera",
    "shareP": "Los enlaces de invitación y los códigos QR funcionan en tu servidor igual que en pokerth.net: un amigo abre el enlace y se sienta en tu mesa. Si tu servidor es accesible desde internet, también puedes proponerlo para la lista pública de servidores del cliente web; aparecerá en ella cuando los administradores del cliente web lo aprueben.",
    "guidesH2": "Guías paso a paso",
    "guides": [
      "Guía de instalación del servidor PokerTH",
      "Autoalojamiento e instalación con un solo comando",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Instalación manual y HTTPS",
      "El panel de administración"
    ],
    "faqH2": "Preguntas",
    "faq": [
      [
        "¿Es gratis alojar un servidor PokerTH?",
        "Sí. El servidor PokerTH y el cliente web son software libre y de código abierto; solo necesitas una máquina para ejecutarlos."
      ],
      [
        "¿Qué hardware necesito?",
        "Muy poco: cualquier PC o servidor doméstico con Linux o Docker, o una Raspberry Pi 4 o 5. Una conexión de red por cable importa más que la potencia de cálculo."
      ],
      [
        "¿Los jugadores tienen que instalar algo?",
        "No. Abren la dirección del servidor en un navegador de su móvil, tableta u ordenador. Quien prefiera una aplicación puede usar el cliente QML de PokerTH o el clásico cliente widget: se conectan al mismo servidor y juegan en las mismas mesas."
      ],
      [
        "¿Hace falta pokerth.net o una conexión a internet?",
        "No. Un servidor en tu red local funciona por sí solo: los jugadores se conectan a él directamente, solo con un apodo."
      ],
      [
        "¿Cuántos jugadores pueden unirse?",
        "Hasta 10 jugadores por mesa, más los espectadores, y tantas mesas como necesite tu grupo."
      ]
    ]
  },
  "es-419": {
    "title": "Crea tu propio servidor de póker — gratis y autoalojado | PokerTH",
    "desc": "Servidor privado de Texas Hold’em en casa, en un club o una escuela: servidor PokerTH y cliente web gratis, instalados con un comando, con Docker o en Raspberry Pi.",
    "ldHeadline": "Cómo alojar tu propio servidor de póker PokerTH",
    "ldDesc": "Configura un servidor de Texas Hold’em privado y autoalojado con el servidor dedicado de PokerTH y el cliente web de PokerTH.",
    "h1": "Aloja tu propio servidor de póker",
    "lead": "PokerTH es gratuito y de código abierto de principio a fin: el servidor de juego y este cliente web pueden funcionar en tu propia máquina. Basta con una PC, un servidor doméstico o una Raspberry Pi para una partida en familia, una noche de club, una liga de oficina o una escuela, y luego cada celular, tablet o computadora de tu red juega en su navegador solo con un apodo.",
    "whyH2": "Por qué tener el tuyo",
    "why": [
      [
        "Privado",
        "Tus partidas se quedan en tu máquina y en tu red; los jugadores no necesitan cuenta ni dirección de correo, solo un apodo."
      ],
      [
        "A tu medida",
        "Ponle al servidor su propio nombre, elige qué modos ofrece la pantalla de inicio de sesión, publica un mensaje de bienvenida y lleva una tabla de clasificación compartida para tu grupo."
      ],
      [
        "Gratis",
        "Sin licencia, sin suscripción, sin anuncios: el servidor PokerTH y el cliente web son software libre."
      ]
    ],
    "partsH2": "Dos piezas",
    "partsP": "Una partida de PokerTH necesita el servidor dedicado de PokerTH, que reparte las cartas y administra las mesas, y el cliente web, que sirve la app a los navegadores y los conecta con ese servidor. Ambos pueden funcionar en la misma máquina. Todo sigue siendo compatible: las apps de PokerTH se conectan al mismo servidor que los navegadores —el cliente QML en Windows, macOS, Linux y Android, y el cliente widget clásico en el escritorio—, así que en una misma mesa pueden jugar juntos navegadores y apps.",
    "stepsH2": "Ponlo en marcha en tres pasos",
    "steps": [
      [
        "Instala el servidor PokerTH",
        "Compila pokerth_dedicated_server a partir del código fuente de PokerTH — versión 2.1.10 o posterior — siguiendo la guía del servidor del proyecto PokerTH: requiere Qt 6.7 o más reciente, CMake y un compilador de C++23. El paquete pokerth-server de las distribuciones Linux es una versión anterior. El servidor escucha en el puerto TCP 7234."
      ],
      [
        "Instala el cliente web",
        "En Debian, Ubuntu o Raspberry Pi OS, el script de instalación configura Node.js, el cliente web y un servicio que arranca con la máquina, con un solo comando. Quienes usan Docker descargan una imagen lista para amd64, arm64 y armv7, y CasaOS importa el mismo archivo Compose como una app."
      ],
      [
        "Juega",
        "En cualquier dispositivo de tu red, abre la dirección de la máquina en el puerto 8080, elige “LAN / Servidor dedicado”, escribe un apodo y crea una mesa. Los jugadores con el cliente QML o widget de PokerTH se conectan a la misma máquina en el puerto 7234 y se unen a las mismas mesas."
      ]
    ],
    "piH2": "En una Raspberry Pi",
    "piP": "PokerTH intercambia mensajes pequeños y los dispositivos de los jugadores hacen todo el dibujo, así que una Raspberry Pi sobra: una Pi 4 con 2 GB es la opción ideal y una Pi 5 es más que suficiente. Para una noche sin tropiezos, la red importa más que la placa: conecta la Pi al router con un cable y usa un buen punto de acceso Wi-Fi para los jugadores.",
    "httpsH2": "HTTP en la LAN, HTTPS para los extras",
    "httpsP": "En tu propia red, el juego funciona con HTTP simple. Instalar la app en la pantalla de inicio, jugar sin conexión y recibir notificaciones requieren HTTPS, que la guía configura con Nginx y un certificado gratuito de Let’s Encrypt.",
    "adminH2": "Un panel de administración en el navegador",
    "adminP": "Una consola protegida con token en /admin muestra quién está conectado, actualiza el cliente web con un clic y puede revertirlo, envía avisos a los jugadores, reinicia la tabla de clasificación, instala barajas, estilos de mesa y música, enumera los servidores de juego a los que puede conectarse el cliente y entrega claves que solo desbloquean algunas de sus secciones.",
    "shareH2": "Invita jugadores de fuera",
    "shareP": "Los enlaces de invitación y los códigos QR funcionan en tu servidor igual que en pokerth.net: un amigo abre el enlace y se sienta a tu mesa. Si tu servidor es accesible desde internet, también puedes proponerlo para la lista pública de servidores del cliente web; aparece ahí en cuanto los administradores del cliente web lo aprueban.",
    "guidesH2": "Guías paso a paso",
    "guides": [
      "Guía de instalación del servidor PokerTH",
      "Autoalojamiento e instalación con un comando",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Instalación manual y HTTPS",
      "El panel de administración"
    ],
    "faqH2": "Preguntas",
    "faq": [
      [
        "¿Alojar un servidor PokerTH es gratis?",
        "Sí. El servidor PokerTH y el cliente web son software libre y de código abierto; solo necesitas una máquina para ejecutarlos."
      ],
      [
        "¿Qué hardware necesito?",
        "Muy poco: cualquier PC o servidor doméstico con Linux o Docker, o una Raspberry Pi 4 o 5. Una conexión de red por cable importa más que la potencia de procesamiento."
      ],
      [
        "¿Los jugadores tienen que instalar algo?",
        "No. Abren la dirección del servidor en el navegador de su celular, tablet o computadora. Quienes prefieran una app pueden usar el cliente QML de PokerTH o el cliente widget clásico: se conectan al mismo servidor y juegan en las mismas mesas."
      ],
      [
        "¿Hace falta pokerth.net o una conexión a internet?",
        "No. Un servidor en tu red local funciona por sí solo: los jugadores se conectan directamente a él, solo con un apodo."
      ],
      [
        "¿Cuántos jugadores pueden entrar?",
        "Hasta 10 jugadores por mesa, más espectadores, y tantas mesas como necesite tu grupo."
      ]
    ]
  },
  et: {
    "title": "Oma pokkeriserver — tasuta ja isemajutatav | PokerTH",
    "desc": "Privaatne Texas Hold’emi server kodus, klubis või koolis: tasuta PokerTH server ja veebiklient, paigaldatud ühe käsuga, Dockeriga või Raspberry Pi-l.",
    "ldHeadline": "Kuidas majutada oma PokerTH pokkeriserverit",
    "ldDesc": "Sea üles privaatne, isemajutatav Texas Hold’emi server PokerTH pühendatud serveri ja PokerTH veebikliendiga.",
    "h1": "Käivita oma pokkeriserver",
    "lead": "PokerTH on algusest lõpuni tasuta ja avatud lähtekoodiga: mänguserver ja see veebiklient võivad töötada sinu enda masinas. Perekonnamänguks, klubiõhtuks, kontoriliigaks või koolile piisab arvutist, koduserverist või Raspberry Pi-st ning siis mängib iga telefon, tahvelarvuti või arvuti sinu võrgus oma brauseris ainult hüüdnimega.",
    "whyH2": "Miks oma server",
    "why": [
      [
        "Privaatne",
        "Sinu mängud jäävad sinu masinasse ja sinu võrku; mängijad ei vaja kontot ega e-posti aadressi, ainult hüüdnime."
      ],
      [
        "Sinu järgi kujundatud",
        "Anna serverile oma nimi, vali, milliseid režiime sisselogimisekraan pakub, postita tervitussõnum ja pea oma seltskonnale ühist edetabelit."
      ],
      [
        "Tasuta",
        "Ei litsentsi, tellimust ega reklaame: nii PokerTH server kui ka veebiklient on vaba tarkvara."
      ]
    ],
    "partsH2": "Kaks osa",
    "partsP": "PokerTH mänguks on vaja PokerTH pühendatud serverit, mis jagab kaarte ja juhib laudu, ning veebiklienti, mis serveerib rakendust brauseritele ja ühendab need selle serveriga. Mõlemad võivad töötada samas masinas. Kõik jääb ühilduvaks: PokerTH rakendused — QML-klient opsüsteemidele Windows, macOS, Linux ja Android ning klassikaline widget-klient lauaarvutile — ühenduvad sama serveriga nagu brauserid, nii et ühe laua taga võivad koos mängida nii brauseri kui ka rakenduse kasutajad.",
    "stepsH2": "Seadista kolme sammuga",
    "steps": [
      [
        "Paigalda PokerTH server",
        "Ehita pokerth_dedicated_server PokerTH lähtekoodist — versioon 2.1.10 või uuem — PokerTH projekti serverijuhendi järgi: selleks on vaja Qt 6.7 või uuemat, CMake’i ja C++23 kompilaatorit. Linuxi distributsioonide pakett pokerth-server on vanem versioon. Server kuulab TCP-porti 7234."
      ],
      [
        "Paigalda veebiklient",
        "Debianis, Ubuntus või Raspberry Pi OS-is paigaldab paigaldusskript ühe käsuga Node.js-i, veebikliendi ja teenuse, mis käivitub koos masinaga. Dockeri kasutajad tõmbavad valmis tõmmise amd64, arm64 ja armv7 jaoks ning CasaOS impordib sama Compose’i faili rakendusena."
      ],
      [
        "Mängi",
        "Ava oma võrgu mis tahes seadmes masina aadress pordil 8080, vali LAN / pühendatud server, sisesta hüüdnimi ja loo laud. PokerTH QML- või widget-kliendiga mängijad ühenduvad sama masinaga pordil 7234 ja liituvad samade laudadega."
      ]
    ],
    "piH2": "Raspberry Pi-l",
    "piP": "PokerTH vahetab väikeseid sõnumeid ja kogu joonistamise teevad mängijate seadmed, nii et Raspberry Pi-st piisab küllaga: 2 GB mäluga Pi 4 on parim valik, Pi 5 on rohkemgi kui piisav. Sujuva õhtu jaoks on võrk tähtsam kui plaat — ühenda Pi ruuteriga kaabli abil ja kasuta mängijate jaoks head Wi-Fi pääsupunkti.",
    "httpsH2": "HTTP kohtvõrgus, HTTPS lisade jaoks",
    "httpsP": "Sinu enda võrgus töötab mäng tavalise HTTP kaudu. Rakenduse paigaldamiseks avakuvale, võrguühenduseta mängimiseks ja teavituste saamiseks on vaja HTTPS-i, mille juhend seadistab Nginxi ja tasuta Let’s Encrypti sertifikaadiga.",
    "adminH2": "Halduspaneel brauseris",
    "adminP": "Tokeniga kaitstud konsool aadressil /admin näitab, kes on ühendatud, uuendab veebiklienti ühe klõpsuga ja oskab selle tagasi pöörata, saadab mängijatele teadaandeid, lähtestab edetabeli, paigaldab kaardipakke, lauastiile ja muusikat, loetleb mänguservereid, millega klient tohib ühenduda, ning jagab võtmeid, mis avavad ainult osa selle jaotistest.",
    "shareH2": "Kutsu mängijaid väljastpoolt",
    "shareP": "Kutselingid ja QR-koodid töötavad sinu serveris samamoodi nagu pokerth.net-is: sõber avab lingi ja saab koha sinu laua taga. Kui su server on internetist kättesaadav, võid selle pakkuda ka veebikliendi avalikku serverite loendisse; see ilmub sinna, kui veebikliendi administraatorid on selle heaks kiitnud.",
    "guidesH2": "Samm-sammulised juhendid",
    "guides": [
      "PokerTH serveri seadistamise juhend",
      "Isemajutamine ja paigaldus ühe käsuga",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Käsitsi paigaldus ja HTTPS",
      "Halduspaneel"
    ],
    "faqH2": "Küsimused",
    "faq": [
      [
        "Kas PokerTH serveri majutamine on tasuta?",
        "Jah. PokerTH server ja veebiklient on tasuta ja avatud lähtekoodiga tarkvara; vajad ainult masinat, millel neid käitada."
      ],
      [
        "Millist riistvara mul vaja on?",
        "Väga vähe: mis tahes arvutit või koduserverit, kus töötab Linux või Docker, või Raspberry Pi 4 või 5. Juhtmega võrguühendus on tähtsam kui arvutusvõimsus."
      ],
      [
        "Kas mängijad peavad midagi paigaldama?",
        "Ei. Nad avavad serveri aadressi oma telefoni, tahvelarvuti või arvuti brauseris. Kes eelistavad rakendust, saavad kasutada PokerTH QML-klienti või klassikalist widget-klienti: nad ühenduvad sama serveriga ja mängivad samade laudade taga."
      ],
      [
        "Kas selleks on vaja pokerth.net-i või internetiühendust?",
        "Ei. Kohtvõrgus olev server töötab iseseisvalt: mängijad ühenduvad sellega otse, ainult hüüdnimega."
      ],
      [
        "Mitu mängijat saab liituda?",
        "Kuni 10 mängijat laua kohta, lisaks pealtvaatajad, ja nii palju laudu, kui su seltskond vajab."
      ]
    ]
  },
  eu: {
    "title": "Poker zerbitzari propioa — doan, zeuk ostatatua | PokerTH",
    "desc": "Texas Hold’em zerbitzari pribatua etxean, klubean edo eskolan: PokerTH zerbitzaria eta web-bezeroa doan, komando bakar batekin, Docker bidez edo Raspberry Pi batean.",
    "ldHeadline": "Nola ostatatu zure PokerTH poker zerbitzari propioa",
    "ldDesc": "Prestatu Texas Hold’em zerbitzari pribatu eta zeuk ostatatu bat PokerTH zerbitzari dedikatuarekin eta PokerTH web-bezeroarekin.",
    "h1": "Ostatatu zure poker zerbitzari propioa",
    "lead": "PokerTH doakoa eta kode irekikoa da hasieratik amaierara: joko-zerbitzaria eta web-bezero hau zure makinan exekuta daitezke. PC bat, etxeko zerbitzari bat edo Raspberry Pi bat nahikoa da familiako partida baterako, klubeko gau baterako, bulegoko liga baterako edo eskola baterako, eta ondoren zure sareko telefono, tableta edo ordenagailu bakoitzak bere nabigatzailean jokatzen du, ezizen batekin besterik gabe.",
    "whyH2": "Zergatik zeure zerbitzaria",
    "why": [
      [
        "Pribatua",
        "Zure partidak zure makinan eta zure sarean geratzen dira; jokalariek ez dute konturik ez helbide elektronikorik behar, ezizen bat besterik ez."
      ],
      [
        "Zure neurrira",
        "Eman zerbitzariari bere izena, aukeratu saio-hasierako pantailak zein modu eskaintzen dituen, argitaratu ongietorri-mezu bat eta izan zure taldearentzako sailkapen-taula partekatu bat."
      ],
      [
        "Doan",
        "Lizentziarik, harpidetzarik eta iragarkirik gabe: PokerTH zerbitzaria eta web-bezeroa software librea dira biak."
      ]
    ],
    "partsH2": "Bi pieza",
    "partsP": "PokerTH partida batek PokerTH zerbitzari dedikatua behar du, kartak banatu eta mahaiak kudeatzen dituena, eta web-bezeroa, aplikazioa nabigatzaileei zerbitzatu eta zerbitzari horretara konektatzen dituena. Biak makina berean exekuta daitezke. Dena bateragarri mantentzen da: PokerTH aplikazioak nabigatzaileen zerbitzari berera konektatzen dira — QML bezeroa Windows, macOS, Linux eta Android sistemetan, eta widget bezero klasikoa mahaigainean —, beraz jokalariek nabigatzaileak eta aplikazioak nahas ditzakete mahai berean.",
    "stepsH2": "Prestatu hiru urratsetan",
    "steps": [
      [
        "Instalatu PokerTH zerbitzaria",
        "Konpilatu pokerth_dedicated_server PokerTH-ren iturburuetatik — 2.1.10 bertsioa edo berriagoa — PokerTH proiektuaren zerbitzari-gidari jarraituz: Qt 6.7 edo berriagoa, CMake eta C++23 konpiladore bat behar ditu. Linux banaketetako pokerth-server paketea bertsio zaharragoa da. Zerbitzariak 7234 TCP atakan entzuten du."
      ],
      [
        "Instalatu web-bezeroa",
        "Debian, Ubuntu edo Raspberry Pi OS sistemetan, instalazio-scriptak Node.js, web-bezeroa eta makinarekin batera abiatzen den zerbitzu bat prestatzen ditu, komando bakar batekin. Docker erabiltzaileek amd64, arm64 eta armv7rako irudi prest bat deskargatzen dute, eta CasaOS-ek Compose fitxategi bera inportatzen du aplikazio gisa."
      ],
      [
        "Jokatu",
        "Zure sareko edozein gailutan, ireki makinaren helbidea 8080 atakan, aukeratu «LAN / Zerbitzari dedikatua», idatzi ezizen bat eta sortu mahai bat. PokerTH QML edo widget bezeroa duten jokalariak makina berera konektatzen dira 7234 atakan eta mahai berberetara batzen dira."
      ]
    ],
    "piH2": "Raspberry Pi batean",
    "piP": "PokerTH-k mezu txikiak trukatzen ditu eta jokalarien gailuek egiten dute marrazketa guztia, beraz Raspberry Pi bat soberan dago: 2 GB-ko Pi 4 bat da oreka onena, eta Pi 5 bat nahikoa baino gehiago da. Gau lasai baterako sareak plakak baino garrantzi handiagoa du — konektatu Pi-a bideratzailera kable batekin, eta erabili Wi-Fi sarbide-puntu on bat jokalarientzat.",
    "httpsH2": "HTTP LANean, HTTPS gehigarrietarako",
    "httpsP": "Zure sarean jokoak HTTP soilaren bidez funtzionatzen du. Aplikazioa hasierako pantailan instalatzeko, lineaz kanpo jokatzeko eta jakinarazpenak jasotzeko HTTPS behar da, eta gidak Nginx eta Let’s Encrypt ziurtagiri doako batekin prestatzen du.",
    "adminH2": "Administrazio-panel bat nabigatzailean",
    "adminP": "/admin helbideko tokenez babestutako kontsola batek erakusten du nor dagoen konektatuta, web-bezeroa klik bakar batean eguneratzen du eta atzera bota dezake, iragarpenak bidaltzen dizkie jokalariei, sailkapen-taula berrezartzen du, karta-sortak, mahai-estiloak eta musika instalatzen ditu, bezeroak eskura ditzakeen joko-zerbitzariak zerrendatzen ditu, eta bere atal batzuk bakarrik desblokeatzen dituzten gakoak banatzen ditu.",
    "shareH2": "Gonbidatu kanpoko jokalariak",
    "shareP": "Gonbidapen-estekek eta QR kodeek zure zerbitzarian pokerth.net-en bezala funtzionatzen dute: lagun batek esteka irekitzen du eta zure mahaian esertzen da. Zure zerbitzaria Internetetik eskuragarri badago, web-bezeroaren zerbitzari publikoen zerrendarako ere proposa dezakezu; web-bezeroaren administratzaileek onartzen dutenean agertzen da bertan.",
    "guidesH2": "Urratsez urratseko gidak",
    "guides": [
      "PokerTH zerbitzaria instalatzeko gida",
      "Norberak ostatatzea eta komando bakarreko instalazioa",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Eskuzko instalazioa eta HTTPS",
      "Administrazio-panela"
    ],
    "faqH2": "Galderak",
    "faq": [
      [
        "Doakoa al da PokerTH zerbitzari bat ostatatzea?",
        "Bai. PokerTH zerbitzaria eta web-bezeroa software doako eta kode irekikoa dira; makina bat besterik ez duzu behar horiek exekutatzeko."
      ],
      [
        "Zer hardware behar dut?",
        "Oso gutxi: Linux edo Docker exekutatzen duen edozein PC edo etxeko zerbitzari, edo Raspberry Pi 4 edo 5 bat. Kable bidezko sare-konexioak prozesatzeko ahalmenak baino garrantzi handiagoa du."
      ],
      [
        "Jokalariek zerbait instalatu behar al dute?",
        "Ez. Zerbitzariaren helbidea irekitzen dute nabigatzaile batean, telefonoan, tabletan edo ordenagailuan. Aplikazio bat nahiago dutenek PokerTH QML bezeroa edo widget bezero klasikoa erabil dezakete: zerbitzari berera konektatzen dira eta mahai berberetan jokatzen dute."
      ],
      [
        "pokerth.net edo Interneteko konexioa behar al du?",
        "Ez. Zure sare lokaleko zerbitzari batek bere kabuz funtzionatzen du: jokalariak zuzenean konektatzen dira harekin, ezizen batekin besterik gabe."
      ],
      [
        "Zenbat jokalari sar daitezke?",
        "Mahai bakoitzeko 10 jokalari gehienez, gehi ikusleak, eta zure taldeak behar adina mahai."
      ]
    ]
  },
  fa: {
    "title": "راه‌اندازی سرور پوکر شخصی — رایگان و خودمیزبان | PokerTH",
    "desc": "یک سرور خصوصی Texas Hold’em در خانه، باشگاه یا مدرسه: سرور و کلاینت وب رایگان PokerTH، راه‌اندازی با یک فرمان، با Docker یا روی Raspberry Pi.",
    "ldHeadline": "چگونه سرور پوکر PokerTH خودتان را راه بیندازید",
    "ldDesc": "یک سرور خصوصی و خودمیزبان Texas Hold’em با سرور اختصاصی PokerTH و کلاینت وب PokerTH راه‌اندازی کنید.",
    "h1": "سرور پوکر خودتان را راه بیندازید",
    "lead": "PokerTH از سر تا ته رایگان و متن‌باز است: سرور بازی و همین کلاینت وب می‌توانند روی دستگاه خودتان اجرا شوند. یک رایانهٔ شخصی، یک سرور خانگی یا یک Raspberry Pi برای بازی خانوادگی، شب باشگاه، لیگ اداری یا یک مدرسه کافی است و آن‌گاه هر گوشی، تبلت یا رایانه‌ای در شبکهٔ شما تنها با یک نام مستعار در مرورگرش بازی می‌کند.",
    "whyH2": "چرا سرور خودتان",
    "why": [
      [
        "خصوصی",
        "بازی‌های شما روی دستگاه و شبکهٔ خودتان می‌مانند؛ بازیکنان نه به حساب کاربری نیاز دارند و نه به نشانی ایمیل، فقط یک نام مستعار."
      ],
      [
        "به سلیقهٔ شما",
        "برای سرور نامی ویژه بگذارید، انتخاب کنید صفحهٔ ورود کدام حالت‌ها را پیشنهاد دهد، پیام خوش‌آمد بگذارید و برای گروهتان یک رتبه‌بندی مشترک نگه دارید."
      ],
      [
        "رایگان",
        "بدون مجوز، بدون اشتراک، بدون تبلیغ: سرور PokerTH و کلاینت وب هر دو نرم‌افزار آزادند."
      ]
    ],
    "partsH2": "دو بخش",
    "partsP": "یک بازی PokerTH به سرور اختصاصی PokerTH نیاز دارد که کارت‌ها را پخش می‌کند و میزها را می‌گرداند، و به کلاینت وب که برنامه را به مرورگرها می‌رساند و آن‌ها را به آن سرور وصل می‌کند. هر دو می‌توانند روی یک دستگاه اجرا شوند. همه‌چیز سازگار می‌ماند: برنامه‌های PokerTH — کلاینت QML برای Windows، macOS، Linux و Android، و کلاینت کلاسیک widget برای رایانهٔ رومیزی — به همان سروری وصل می‌شوند که مرورگرها به آن وصل می‌شوند، پس بازیکنانِ مرورگر و برنامه می‌توانند سر یک میز با هم بازی کنند.",
    "stepsH2": "راه‌اندازی در سه گام",
    "steps": [
      [
        "سرور PokerTH را نصب کنید",
        "pokerth_dedicated_server را از کد منبع PokerTH — نسخهٔ 2.1.10 یا بالاتر — با پیروی از راهنمای سرور پروژهٔ PokerTH بسازید: به Qt 6.7 یا جدیدتر، CMake و یک کامپایلر C++23 نیاز دارد. بستهٔ pokerth-server توزیع‌های Linux نسخهٔ قدیمی‌تری است. سرور روی درگاه TCP 7234 گوش می‌دهد."
      ],
      [
        "کلاینت وب را نصب کنید",
        "روی Debian، Ubuntu یا Raspberry Pi OS اسکریپت نصب با یک فرمان Node.js، کلاینت وب و سرویسی را که همراه دستگاه راه می‌افتد نصب می‌کند. کاربران Docker یک ایمیج آماده برای amd64، arm64 و armv7 دریافت می‌کنند و CasaOS همان فایل Compose را به‌عنوان یک برنامه وارد می‌کند."
      ],
      [
        "بازی کنید",
        "روی هر دستگاهی در شبکهٔ خود، نشانی دستگاه را روی درگاه 8080 باز کنید، «LAN / سرور اختصاصی» را برگزینید، یک نام مستعار بنویسید و یک میز بسازید. بازیکنانی که با کلاینت QML یا widget مربوط به PokerTH بازی می‌کنند، روی درگاه 7234 به همان دستگاه وصل می‌شوند و به همان میزها می‌پیوندند."
      ]
    ],
    "piH2": "روی Raspberry Pi",
    "piP": "PokerTH پیام‌های کوچکی رد و بدل می‌کند و همهٔ ترسیم را دستگاه‌های بازیکنان انجام می‌دهند، پس یک Raspberry Pi کاملاً کافی است: یک Pi 4 با 2 گیگابایت بهترین انتخاب است و یک Pi 5 بیش از اندازه کافی است. برای یک شب بی‌دردسر، شبکه از بُرد مهم‌تر است — Pi را با کابل به روتر وصل کنید و برای بازیکنان از یک نقطهٔ دسترسی Wi-Fi خوب استفاده کنید.",
    "httpsH2": "HTTP در شبکهٔ محلی، HTTPS برای امکانات بیشتر",
    "httpsP": "در شبکهٔ خودتان بازی با HTTP ساده کار می‌کند. نصب برنامه روی صفحهٔ اصلی، بازی آفلاین و دریافت اعلان‌ها به HTTPS نیاز دارند که راهنما آن را با Nginx و یک گواهی رایگان Let’s Encrypt راه‌اندازی می‌کند.",
    "adminH2": "پنل مدیریت در مرورگر",
    "adminP": "یک کنسول محافظت‌شده با توکن در /admin نشان می‌دهد چه کسانی وصل‌اند، کلاینت وب را با یک کلیک به‌روز می‌کند و می‌تواند آن را به نسخهٔ قبلی برگرداند، برای بازیکنان اطلاعیه می‌فرستد، رتبه‌بندی را از نو آغاز می‌کند، دسته‌کارت‌ها، سبک‌های میز و موسیقی نصب می‌کند، سرورهای بازی‌ای را که کلاینت می‌تواند به آن‌ها برسد فهرست می‌کند و کلیدهایی می‌دهد که فقط برخی از بخش‌هایش را باز می‌کنند.",
    "shareH2": "از بیرون بازیکن دعوت کنید",
    "shareP": "پیوندهای دعوت و کدهای QR روی سرور شما درست مثل pokerth.net کار می‌کنند: دوستی پیوند را باز می‌کند و سر میز شما می‌نشیند. اگر سرورتان از اینترنت در دسترس باشد، می‌توانید آن را برای فهرست سرورهای عمومی کلاینت وب هم پیشنهاد دهید؛ پس از تأیید مدیران کلاینت وب، در آن‌جا نمایش داده می‌شود.",
    "guidesH2": "راهنماهای گام‌به‌گام",
    "guides": [
      "راهنمای راه‌اندازی سرور PokerTH",
      "میزبانی شخصی و نصب با یک فرمان",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "نصب دستی و HTTPS",
      "پنل مدیریت"
    ],
    "faqH2": "پرسش‌ها",
    "faq": [
      [
        "آیا میزبانی یک سرور PokerTH رایگان است؟",
        "بله. سرور PokerTH و کلاینت وب نرم‌افزارهای رایگان و متن‌بازند؛ فقط به دستگاهی برای اجرای آن‌ها نیاز دارید."
      ],
      [
        "به چه سخت‌افزاری نیاز دارم؟",
        "خیلی کم: هر رایانهٔ شخصی یا سرور خانگی که Linux یا Docker را اجرا کند، یا یک Raspberry Pi 4 یا 5. اتصال شبکهٔ سیمی از توان پردازشی مهم‌تر است."
      ],
      [
        "آیا بازیکنان باید چیزی نصب کنند؟",
        "نه. آن‌ها نشانی سرور را در مرورگر گوشی، تبلت یا رایانهٔ خود باز می‌کنند. کسانی که برنامه را ترجیح می‌دهند می‌توانند از کلاینت QML مربوط به PokerTH یا کلاینت کلاسیک widget استفاده کنند: آن‌ها به همان سرور وصل می‌شوند و سر همان میزها بازی می‌کنند."
      ],
      [
        "آیا به pokerth.net یا اتصال اینترنت نیاز دارد؟",
        "نه. سروری که در شبکهٔ محلی شماست به‌تنهایی کار می‌کند: بازیکنان مستقیم و تنها با یک نام مستعار به آن وصل می‌شوند."
      ],
      [
        "چند بازیکن می‌توانند بپیوندند؟",
        "تا ۱۰ بازیکن سر هر میز، به‌علاوهٔ تماشاگران، و هر تعداد میزی که گروهتان نیاز دارد."
      ]
    ]
  },
  fi: {
    "title": "Oma pokeripalvelin — ilmainen, itse ylläpidetty | PokerTH",
    "desc": "Yksityinen Texas Hold’em -palvelin kotiin, kerhoon tai kouluun: ilmainen PokerTH-palvelin ja selainversio yhdellä komennolla, Dockerilla tai Raspberry Pi:llä.",
    "ldHeadline": "Näin perustat oman PokerTH-pokeripalvelimen",
    "ldDesc": "Pystytä yksityinen, itse ylläpidetty Texas Hold’em -palvelin PokerTH:n erillisellä palvelimella ja PokerTH:n selainversiolla.",
    "h1": "Perusta oma pokeripalvelin",
    "lead": "PokerTH on alusta loppuun ilmainen ja avointa lähdekoodia: pelipalvelin ja tämä selainversio voivat toimia omalla koneellasi. PC, kotipalvelin tai Raspberry Pi riittää perheen peli-iltaan, kerhoiltaan, toimiston liigaan tai kouluun, ja sen jälkeen jokainen verkkosi puhelin, tabletti tai tietokone pelaa selaimessa pelkällä nimimerkillä.",
    "whyH2": "Miksi oma palvelin",
    "why": [
      [
        "Yksityinen",
        "Pelisi pysyvät omalla koneellasi ja omassa verkossasi; pelaajat eivät tarvitse tiliä eivätkä sähköpostiosoitetta, pelkkä nimimerkki riittää."
      ],
      [
        "Sinun näköisesi",
        "Anna palvelimelle oma nimi, valitse, mitä tiloja kirjautumisnäkymä tarjoaa, julkaise tervetuloviesti ja pidä porukallesi yhteistä tulostaulua."
      ],
      [
        "Ilmainen",
        "Ei lisenssiä, ei tilausta, ei mainoksia: PokerTH-palvelin ja selainversio ovat kumpikin vapaita ohjelmistoja."
      ]
    ],
    "partsH2": "Kaksi osaa",
    "partsP": "PokerTH-peli tarvitsee PokerTH:n erillisen palvelimen, joka jakaa kortit ja pyörittää pöytiä, sekä selainversion, joka toimittaa sovelluksen selaimille ja yhdistää ne tähän palvelimeen. Ne voivat toimia samalla koneella. Kaikki pysyy yhteensopivana: PokerTH-sovellukset – QML-asiakasohjelma Windowsille, macOSille, Linuxille ja Androidille sekä perinteinen widget-asiakasohjelma työpöydälle – yhdistävät samaan palvelimeen kuin selaimet, joten samassa pöydässä voi pelata sekä selaimilla että sovelluksilla.",
    "stepsH2": "Käyttöön kolmessa vaiheessa",
    "steps": [
      [
        "Asenna PokerTH-palvelin",
        "Käännä pokerth_dedicated_server PokerTH:n lähdekoodista — versio 2.1.10 tai uudempi — PokerTH-projektin palvelinohjeen mukaan: vaatimuksina ovat Qt 6.7 tai uudempi, CMake ja C++23-kääntäjä. Linux-jakeluiden pokerth-server-paketti on vanhempi versio. Palvelin kuuntelee TCP-porttia 7234."
      ],
      [
        "Asenna selainversio",
        "Debianissa, Ubuntussa tai Raspberry Pi OS:ssä asennusskripti asentaa yhdellä komennolla Node.js:n, selainversion ja palvelun, joka käynnistyy koneen mukana. Dockerin käyttäjät hakevat valmiin imagen amd64-, arm64- ja armv7-alustoille, ja CasaOS tuo saman Compose-tiedoston sovelluksena."
      ],
      [
        "Pelaa",
        "Avaa millä tahansa verkkosi laitteella koneen osoite portissa 8080, valitse ”LAN / Oma palvelin”, kirjoita nimimerkki ja luo pöytä. PokerTH:n QML- tai widget-asiakasohjelmaa käyttävät pelaajat yhdistävät samaan koneeseen portissa 7234 ja liittyvät samoihin pöytiin."
      ]
    ],
    "piH2": "Raspberry Pi:llä",
    "piP": "PokerTH välittää vain pieniä viestejä, ja pelaajien laitteet hoitavat kaiken piirtämisen, joten Raspberry Pi riittää hyvin: 2 Gt:n Pi 4 on paras valinta, Pi 5 on enemmän kuin tarpeeksi. Sujuvan illan kannalta verkko on tärkeämpi kuin itse laite — kytke Pi reitittimeen kaapelilla ja käytä pelaajille hyvää Wi-Fi-tukiasemaa.",
    "httpsH2": "HTTP lähiverkossa, HTTPS lisäominaisuuksiin",
    "httpsP": "Omassa verkossasi peli toimii tavallisella HTTP-yhteydellä. Sovelluksen asentaminen aloitusnäytölle, offline-pelaaminen ja ilmoitusten vastaanottaminen vaativat HTTPS-yhteyden, jonka ohje ottaa käyttöön Nginxin ja ilmaisen Let’s Encrypt -varmenteen avulla.",
    "adminH2": "Hallintapaneeli selaimessa",
    "adminP": "Tunnisteella suojattu konsoli osoitteessa /admin näyttää, kuka on yhteydessä, päivittää selainversion yhdellä napsautuksella ja voi palauttaa edellisen version, lähettää pelaajille tiedotteita, nollaa tulostaulun, asentaa korttipakkoja, pöytätyylejä ja musiikkia, määrittää pelipalvelimet, joihin selainversio saa yhdistää, ja jakaa avaimia, jotka avaavat vain osan sen osioista.",
    "shareH2": "Kutsu pelaajia verkon ulkopuolelta",
    "shareP": "Kutsulinkit ja QR-koodit toimivat palvelimellasi samoin kuin pokerth.netissä: kaveri avaa linkin ja saa paikan pöydästäsi. Jos palvelimesi näkyy internetiin, voit myös ehdottaa sitä selainversion julkiselle palvelinlistalle; se tulee listalle, kun selainversion ylläpitäjät hyväksyvät sen.",
    "guidesH2": "Vaiheittaiset ohjeet",
    "guides": [
      "PokerTH-palvelimen asennusohje",
      "Oma palvelin ja asennus yhdellä komennolla",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Manuaalinen asennus ja HTTPS",
      "Hallintapaneeli"
    ],
    "faqH2": "Kysymyksiä",
    "faq": [
      [
        "Onko PokerTH-palvelimen ylläpito ilmaista?",
        "On. PokerTH-palvelin ja selainversio ovat ilmaisia avoimen lähdekoodin ohjelmistoja; tarvitset vain koneen, jolla ajaa niitä."
      ],
      [
        "Millaista laitteistoa tarvitsen?",
        "Hyvin vähän: minkä tahansa PC:n tai kotipalvelimen, jossa toimii Linux tai Docker, tai Raspberry Pi 4:n tai 5:n. Langallinen verkkoyhteys on tärkeämpi kuin laskentateho."
      ],
      [
        "Tarvitsevatko pelaajat asentaa mitään?",
        "Eivät. He avaavat palvelimen osoitteen selaimessa puhelimella, tabletilla tai tietokoneella. Sovellusta suosivat voivat käyttää PokerTH:n QML-asiakasohjelmaa tai perinteistä widget-asiakasohjelmaa: niillä yhdistetään samaan palvelimeen ja pelataan samoissa pöydissä."
      ],
      [
        "Tarvitaanko pokerth.netiä tai internetyhteyttä?",
        "Ei. Lähiverkkosi palvelin toimii itsenäisesti: pelaajat yhdistävät siihen suoraan pelkällä nimimerkillä."
      ],
      [
        "Montako pelaajaa voi liittyä?",
        "Enintään 10 pelaajaa pöytää kohden sekä katsojat, ja niin monta pöytää kuin porukkasi tarvitsee."
      ]
    ]
  },
  fil: {
    "title": "Sariling poker server — libre, self-hosted | PokerTH",
    "desc": "Pribadong Texas Hold’em server sa bahay, club o paaralan: libreng server at web client ng PokerTH, naka-set up sa isang command, sa Docker o sa Raspberry Pi.",
    "ldHeadline": "Paano mag-host ng sarili mong PokerTH poker server",
    "ldDesc": "Mag-set up ng pribado at self-hosted na Texas Hold’em server gamit ang PokerTH dedicated server at ang web client ng PokerTH.",
    "h1": "Mag-host ng sarili mong poker server",
    "lead": "Libre at open source ang PokerTH mula umpisa hanggang dulo: puwedeng tumakbo sa sarili mong makina ang game server at ang web client na ito. Sapat na ang isang PC, home server o Raspberry Pi para sa laro ng pamilya, gabi ng club, liga sa opisina o paaralan, at pagkatapos ay makakapaglaro ang bawat telepono, tablet o kompyuter sa network mo sa browser nito gamit lang ang palayaw.",
    "whyH2": "Bakit sariling server",
    "why": [
      [
        "Pribado",
        "Nananatili ang mga laro mo sa makina at network mo; hindi kailangan ng mga manlalaro ng account o email address, palayaw lang."
      ],
      [
        "Ikaw ang bahala",
        "Bigyan ng sariling pangalan ang server, piliin kung aling mga mode ang iaalok ng login screen, mag-post ng welcome message, at magtabi ng iisang leaderboard para sa grupo mo."
      ],
      [
        "Libre",
        "Walang lisensya, walang subscription, walang ads: parehong free software ang PokerTH server at ang web client."
      ]
    ],
    "partsH2": "Dalawang bahagi",
    "partsP": "Kailangan ng isang laro ng PokerTH ang PokerTH dedicated server, na namimigay ng baraha at nagpapatakbo ng mga mesa, at ang web client, na naghahatid ng app sa mga browser at nagkokonekta sa kanila sa server na iyon. Puwede silang tumakbo sa iisang makina. Nananatiling compatible ang lahat: kumokonekta sa parehong server ng mga browser ang mga app ng PokerTH — ang QML client sa Windows, macOS, Linux at Android, at ang klasikong widget client sa desktop — kaya puwedeng magsama sa iisang mesa ang mga naglalaro sa browser at sa app.",
    "stepsH2": "I-set up sa tatlong hakbang",
    "steps": [
      [
        "I-install ang PokerTH server",
        "I-build ang pokerth_dedicated_server mula sa source ng PokerTH — bersyon 2.1.10 o mas bago — ayon sa server guide ng proyektong PokerTH: kailangan nito ang Qt 6.7 o mas bago, CMake at isang C++23 compiler. Lumang bersyon ang pokerth-server package ng mga Linux distribution. Nakikinig ang server sa TCP port 7234."
      ],
      [
        "I-install ang web client",
        "Sa Debian, Ubuntu o Raspberry Pi OS, inihahanda ng installation script ang Node.js, ang web client at isang serbisyong kusang nagsisimula kasabay ng makina, sa isang command lang. Ang mga gumagamit ng Docker ay kumukuha ng handang image para sa amd64, arm64 at armv7, at ini-import ng CasaOS ang parehong Compose file bilang app."
      ],
      [
        "Maglaro",
        "Sa kahit anong device sa network mo, buksan ang address ng makina sa port 8080, piliin ang LAN / Dedicated server, mag-type ng palayaw at gumawa ng mesa. Kumokonekta ang mga manlalarong may PokerTH QML o widget client sa parehong makina sa port 7234 at sumasali sa parehong mga mesa."
      ]
    ],
    "piH2": "Sa Raspberry Pi",
    "piP": "Maliliit na mensahe lang ang ipinapasa ng PokerTH at ang mga device ng mga manlalaro ang gumagawa ng lahat ng pagguhit, kaya sobra-sobra na ang Raspberry Pi: ang Pi 4 na may 2 GB ang pinakaangkop, at higit pa sa sapat ang Pi 5. Para sa maayos na gabi, mas mahalaga ang network kaysa sa board — ikabit ang Pi sa router gamit ang kable, at gumamit ng magandang Wi-Fi access point para sa mga manlalaro.",
    "httpsH2": "HTTP sa LAN, HTTPS para sa mga dagdag",
    "httpsP": "Sa sarili mong network, gumagana ang laro sa simpleng HTTP. Kailangan ng HTTPS para ma-install ang app sa home screen, makapaglaro offline at makatanggap ng mga notification; inihahanda ito ng gabay gamit ang Nginx at isang libreng certificate ng Let’s Encrypt.",
    "adminH2": "Admin panel sa browser",
    "adminP": "Isang console sa /admin na protektado ng token ang nagpapakita kung sino ang nakakonekta, nag-a-update ng web client sa isang click at kayang ibalik ito sa dati, nagpapadala ng mga anunsyo sa mga manlalaro, nire-reset ang leaderboard, nag-i-install ng mga deck ng baraha, istilo ng mesa at musika, naglilista ng mga game server na puwedeng abutin ng client, at namimigay ng mga key na nagbubukas lang ng ilan sa mga seksyon nito.",
    "shareH2": "Mag-imbita ng mga manlalaro mula sa labas",
    "shareP": "Gumagana sa server mo ang mga link ng imbitasyon at QR code gaya ng sa pokerth.net: bubuksan ng kaibigan ang link at uupo siya sa mesa mo. Kung naaabot ang server mo mula sa internet, puwede mo rin itong imungkahi para sa pampublikong listahan ng server ng web client; lalabas ito roon kapag inaprubahan ito ng mga admin ng web client.",
    "guidesH2": "Mga gabay na hakbang-hakbang",
    "guides": [
      "Gabay sa pag-set up ng PokerTH server",
      "Self-hosting at ang install sa isang command",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Manual na pag-install at HTTPS",
      "Ang admin panel"
    ],
    "faqH2": "Mga tanong",
    "faq": [
      [
        "Libre bang mag-host ng PokerTH server?",
        "Oo. Libre at open-source na software ang PokerTH server at ang web client; makina lang ang kailangan mo para patakbuhin sila."
      ],
      [
        "Anong hardware ang kailangan ko?",
        "Kaunti lang: kahit anong PC o home server na nagpapatakbo ng Linux o Docker, o isang Raspberry Pi 4 o 5. Mas mahalaga ang naka-kableng koneksyon sa network kaysa sa lakas ng processor."
      ],
      [
        "Kailangan bang mag-install ng kahit ano ang mga manlalaro?",
        "Hindi. Bubuksan nila ang address ng server sa browser ng telepono, tablet o kompyuter nila. Puwedeng gamitin ng mga mas gusto ang app ang PokerTH QML client o ang klasikong widget client: kumokonekta sila sa parehong server at naglalaro sa parehong mga mesa."
      ],
      [
        "Kailangan ba nito ang pokerth.net o koneksyon sa internet?",
        "Hindi. Tumatakbo nang mag-isa ang server sa local network mo: direktang kumokonekta rito ang mga manlalaro, gamit lang ang palayaw."
      ],
      [
        "Ilang manlalaro ang puwedeng sumali?",
        "Hanggang 10 manlalaro bawat mesa, dagdag ang mga manonood, at kasindami ng mesang kailangan ng grupo mo."
      ]
    ]
  },
  fr: {
    "title": "Héberger son serveur de poker — gratuit, auto-hébergé | PokerTH",
    "desc": "Un serveur Texas Hold’em privé chez vous, en club ou à l’école : serveur et client web PokerTH gratuits, installés en une commande, avec Docker ou sur Raspberry Pi.",
    "ldHeadline": "Comment héberger votre propre serveur de poker PokerTH",
    "ldDesc": "Installez un serveur de Texas Hold’em privé et auto-hébergé avec le serveur dédié PokerTH et le client web PokerTH.",
    "h1": "Hébergez votre propre serveur de poker",
    "lead": "PokerTH est gratuit et open source de bout en bout : le serveur de jeu et ce client web peuvent tourner sur votre propre machine. Un PC, un serveur domestique ou un Raspberry Pi suffit pour une partie en famille, une soirée de club, un championnat au bureau ou une école, et chaque téléphone, tablette ou ordinateur de votre réseau joue alors dans son navigateur avec un simple pseudo.",
    "whyH2": "Pourquoi avoir le vôtre",
    "why": [
      [
        "Privé",
        "Vos parties restent sur votre machine et votre réseau ; les joueurs n’ont besoin ni de compte ni d’adresse e-mail, juste d’un pseudo."
      ],
      [
        "À votre image",
        "Donnez un nom à votre serveur, choisissez les modes proposés par l’écran de connexion, publiez un message d’accueil et tenez un classement commun pour votre groupe."
      ],
      [
        "Gratuit",
        "Pas de licence, pas d’abonnement, pas de publicité : le serveur PokerTH et le client web sont tous deux des logiciels libres."
      ]
    ],
    "partsH2": "Deux briques",
    "partsP": "Une partie PokerTH a besoin du serveur dédié PokerTH, qui distribue les cartes et fait tourner les tables, et du client web, qui sert l’application aux navigateurs et les relie à ce serveur. Les deux peuvent tourner sur la même machine. Tout reste compatible : les applications PokerTH se connectent au même serveur que les navigateurs — le client QML sous Windows, macOS, Linux et Android, et le client widget classique sur ordinateur —, si bien que navigateurs et applications peuvent se côtoyer à une même table.",
    "stepsH2": "L’installation en trois étapes",
    "steps": [
      [
        "Installez le serveur PokerTH",
        "Compilez pokerth_dedicated_server à partir des sources de PokerTH — version 2.1.10 ou ultérieure — en suivant le guide serveur du projet PokerTH : il faut Qt 6.7 ou plus récent, CMake et un compilateur C++23. Le paquet pokerth-server des distributions Linux est une version plus ancienne. Le serveur écoute sur le port TCP 7234."
      ],
      [
        "Installez le client web",
        "Sous Debian, Ubuntu ou Raspberry Pi OS, le script d’installation met en place Node.js, le client web et un service qui démarre avec la machine, en une seule commande. Avec Docker, récupérez une image toute prête pour amd64, arm64 et armv7 ; CasaOS importe le même fichier Compose comme une application."
      ],
      [
        "Jouez",
        "Sur n’importe quel appareil de votre réseau, ouvrez l’adresse de la machine sur le port 8080, choisissez LAN / Serveur dédié, saisissez un pseudo et créez une table. Les joueurs équipés du client PokerTH QML ou widget se connectent à la même machine sur le port 7234 et rejoignent les mêmes tables."
      ]
    ],
    "piH2": "Sur un Raspberry Pi",
    "piP": "PokerTH n’échange que de petits messages et ce sont les appareils des joueurs qui font tout l’affichage : un Raspberry Pi suffit largement. Un Pi 4 avec 2 Go est le bon compromis, un Pi 5 est plus que suffisant. Pour une soirée fluide, le réseau compte plus que la carte — branchez le Pi au routeur avec un câble et prévoyez un bon point d’accès Wi-Fi pour les joueurs.",
    "httpsH2": "HTTP sur le réseau local, HTTPS pour les extras",
    "httpsP": "Sur votre propre réseau, le jeu fonctionne en simple HTTP. Installer l’application sur l’écran d’accueil, jouer hors ligne et recevoir des notifications nécessitent HTTPS, que le guide met en place avec Nginx et un certificat Let’s Encrypt gratuit.",
    "adminH2": "Un panneau d’administration dans le navigateur",
    "adminP": "Une console protégée par jeton, sur /admin, montre qui est connecté, met à jour le client web en un clic et peut revenir à la version précédente, envoie des annonces aux joueurs, réinitialise le classement, installe des jeux de cartes, des styles de table et de la musique, liste les serveurs de jeu que le client peut joindre et distribue des clés qui ne débloquent que certaines de ses sections.",
    "shareH2": "Inviter des joueurs de l’extérieur",
    "shareP": "Les liens d’invitation et les QR codes fonctionnent sur votre serveur comme sur pokerth.net : un ami ouvre le lien et prend place à votre table. Si votre serveur est joignable depuis Internet, vous pouvez aussi le proposer pour la liste publique des serveurs du client web ; il y apparaît une fois approuvé par les administrateurs du client web.",
    "guidesH2": "Guides pas à pas",
    "guides": [
      "Guide d’installation du serveur PokerTH",
      "Auto-hébergement et installation en une commande",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Installation manuelle et HTTPS",
      "Le panneau d’administration"
    ],
    "faqH2": "Questions",
    "faq": [
      [
        "Héberger un serveur PokerTH est-il gratuit ?",
        "Oui. Le serveur PokerTH et le client web sont des logiciels gratuits et open source ; il vous faut seulement une machine pour les faire tourner."
      ],
      [
        "De quel matériel ai-je besoin ?",
        "De très peu : n’importe quel PC ou serveur domestique sous Linux ou Docker, ou un Raspberry Pi 4 ou 5. Une connexion réseau filaire compte plus que la puissance de calcul."
      ],
      [
        "Les joueurs doivent-ils installer quelque chose ?",
        "Non. Ils ouvrent l’adresse du serveur dans le navigateur de leur téléphone, tablette ou ordinateur. Ceux qui préfèrent une application peuvent utiliser le client PokerTH QML ou le client widget classique : ils se connectent au même serveur et jouent aux mêmes tables."
      ],
      [
        "Faut-il pokerth.net ou une connexion Internet ?",
        "Non. Un serveur sur votre réseau local fonctionne de façon autonome : les joueurs s’y connectent directement, avec un simple pseudo."
      ],
      [
        "Combien de joueurs peuvent participer ?",
        "Jusqu’à 10 joueurs par table, plus les spectateurs, et autant de tables que votre groupe en a besoin."
      ]
    ]
  },
  ga: {
    "title": "Do fhreastalaí pócair féin — saor in aisce, sa bhaile | PokerTH",
    "desc": "Freastalaí príobháideach Texas Hold’em sa bhaile, i gclub nó i scoil: freastalaí agus cliant gréasáin PokerTH in aisce, le hordú amháin, le Docker nó ar Raspberry Pi.",
    "ldHeadline": "Conas do fhreastalaí pócair PokerTH féin a óstáil",
    "ldDesc": "Socraigh freastalaí príobháideach féinóstáilte Texas Hold’em le freastalaí tiomnaithe PokerTH agus le cliant gréasáin PokerTH.",
    "h1": "Óstáil do fhreastalaí pócair féin",
    "lead": "Tá PokerTH saor in aisce agus foinse oscailte ó thús deireadh: is féidir le freastalaí an chluiche agus leis an gcliant gréasáin seo rith ar do mheaisín féin. Is leor ríomhaire, freastalaí baile nó Raspberry Pi do chluiche teaghlaigh, oíche chlub, sraith oifige nó scoil, agus ansin imríonn gach fón, taibléad nó ríomhaire ar do líonra ina bhrabhsálaí le leasainm amháin.",
    "whyH2": "Cén fáth do cheann féin a rith",
    "why": [
      [
        "Príobháideach",
        "Fanann do chluichí ar do mheaisín agus ar do líonra; ní theastaíonn cuntas ná seoladh ríomhphoist ó na himreoirí, leasainm amháin."
      ],
      [
        "Faoi do stiúir féin",
        "Tabhair a ainm féin don fhreastalaí, roghnaigh na móid a thairgeann an scáileán logála isteach, cuir teachtaireacht fáilte suas, agus coinnigh clár ceannairí comhroinnte do do ghrúpa."
      ],
      [
        "Saor in aisce",
        "Gan cheadúnas, gan síntiús, gan fógraí: is bogearraí saora iad freastalaí PokerTH agus an cliant gréasáin araon."
      ]
    ],
    "partsH2": "Dhá chuid",
    "partsP": "Teastaíonn dhá rud ó chluiche PokerTH: freastalaí tiomnaithe PokerTH, a dhéileálann na cártaí agus a ritheann na boird, agus an cliant gréasáin, a sholáthraíonn an aip do na brabhsálaithe agus a cheanglaíonn iad leis an bhfreastalaí sin. Is féidir leo rith ar an meaisín céanna. Fanann gach rud comhoiriúnach: ceanglaíonn aipeanna PokerTH leis an bhfreastalaí céanna leis na brabhsálaithe — an cliant QML ar Windows, macOS, Linux agus Android, agus an cliant widget clasaiceach do ríomhairí deisce — mar sin is féidir le himreoirí brabhsálaithe agus aipeanna a mheascadh ag an mbord céanna.",
    "stepsH2": "Socraigh é i dtrí chéim",
    "steps": [
      [
        "Suiteáil freastalaí PokerTH",
        "Tóg pokerth_dedicated_server ó fhoinsí PokerTH — leagan 2.1.10 nó níos déanaí — de réir threoir an fhreastalaí ó thionscadal PokerTH: teastaíonn Qt 6.7 nó níos nuaí, CMake agus tiomsaitheoir C++23. Is leagan níos sine é an pacáiste pokerth-server i ndáiltí Linux. Éisteann an freastalaí ar phort TCP 7234."
      ],
      [
        "Suiteáil an cliant gréasáin",
        "Ar Debian, Ubuntu nó Raspberry Pi OS, socraíonn an script suiteála Node.js, an cliant gréasáin agus seirbhís a thosaíonn leis an meaisín, le hordú amháin. Tarraingíonn úsáideoirí Docker íomhá réamhdhéanta do amd64, arm64 agus armv7, agus iompórtálann CasaOS an comhad Compose céanna mar aip."
      ],
      [
        "Imir",
        "Ar aon ghléas ar do líonra, oscail seoladh an mheaisín ar phort 8080, roghnaigh “LAN / Freastalaí tiomnaithe”, clóscríobh leasainm agus cruthaigh bord. Ceanglaíonn imreoirí a bhfuil cliant QML nó widget PokerTH acu leis an meaisín céanna ar phort 7234 agus téann siad isteach sna boird chéanna."
      ]
    ],
    "piH2": "Ar Raspberry Pi",
    "piP": "Malartaíonn PokerTH teachtaireachtaí beaga agus déanann gléasanna na n-imreoirí an líníocht ar fad, mar sin is leor go maith Raspberry Pi: is é Pi 4 le 2 GB an rogha is fearr, agus is leor agus is fuíoll Pi 5. Le haghaidh oíche réidh, is tábhachtaí an líonra ná an clár — ceangail an Pi leis an ródaire le cábla, agus úsáid pointe rochtana Wi-Fi maith do na himreoirí.",
    "httpsH2": "HTTP ar an LAN, HTTPS do na breiseáin",
    "httpsP": "Ar do líonra féin oibríonn an cluiche thar HTTP simplí. Teastaíonn HTTPS chun an aip a shuiteáil ar an scáileán baile, chun imirt as líne agus chun fógraí a fháil, agus socraíonn an treoir é le Nginx agus le teastas saor in aisce Let’s Encrypt.",
    "adminH2": "Painéal riaracháin sa bhrabhsálaí",
    "adminP": "Taispeánann consól ag /admin, atá cosanta le comhartha, cé atá ceangailte; nuashonraíonn sé an cliant gréasáin le cliceáil amháin agus is féidir leis é a chur siar, seolann sé fógraí chuig na himreoirí, athshocraíonn sé an clár ceannairí, suiteálann sé paca cártaí, stíleanna boird agus ceol, liostaíonn sé na freastalaithe cluiche ar féidir leis an gcliant teacht orthu, agus tugann sé amach eochracha nach ndíghlasálann ach cuid dá rannóga.",
    "shareH2": "Tabhair cuireadh d’imreoirí ón taobh amuigh",
    "shareP": "Oibríonn naisc chuiridh agus cóid QR ar do fhreastalaí díreach mar a oibríonn siad ar pokerth.net: osclaíonn cara an nasc agus suitear ag do bhord é. Más féidir teacht ar do fhreastalaí ón idirlíon, is féidir leat é a mholadh freisin do liosta poiblí freastalaithe an chliaint ghréasáin; feictear ann é nuair a cheadaíonn riarthóirí an chliaint ghréasáin é.",
    "guidesH2": "Treoracha céim ar chéim",
    "guides": [
      "Treoir socraithe fhreastalaí PokerTH",
      "Féinóstáil agus suiteáil le hordú amháin",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Suiteáil de láimh agus HTTPS",
      "An painéal riaracháin"
    ],
    "faqH2": "Ceisteanna",
    "faq": [
      [
        "An bhfuil sé saor in aisce freastalaí PokerTH a óstáil?",
        "Tá. Is bogearraí saor in aisce foinse oscailte iad freastalaí PokerTH agus an cliant gréasáin; níl uait ach meaisín chun iad a rith."
      ],
      [
        "Cén crua-earraí a theastaíonn uaim?",
        "Fíorbheagán: aon ríomhaire nó freastalaí baile a ritheann Linux nó Docker, nó Raspberry Pi 4 nó 5. Is tábhachtaí ceangal líonra sreangaithe ná cumhacht phróiseála."
      ],
      [
        "An gá do na himreoirí aon rud a shuiteáil?",
        "Ní gá. Osclaíonn siad seoladh an fhreastalaí i mbrabhsálaí ar a bhfón, ar a dtaibléad nó ar a ríomhaire. Is féidir leo siúd ar fearr leo aip cliant QML PokerTH nó an cliant widget clasaiceach a úsáid: ceanglaíonn siad leis an bhfreastalaí céanna agus imríonn siad ag na boird chéanna."
      ],
      [
        "An dteastaíonn pokerth.net nó ceangal idirlín?",
        "Ní theastaíonn. Ritheann freastalaí ar do líonra áitiúil leis féin: ceanglaíonn na himreoirí leis go díreach, le leasainm amháin."
      ],
      [
        "Cé mhéad imreoir is féidir páirt a ghlacadh?",
        "Suas le 10 n-imreoir ag gach bord, móide lucht féachana, agus an oiread bord agus a theastaíonn ó do ghrúpa."
      ]
    ]
  },
  gd: {
    "title": "Am frithealaiche pòcair agad — an-asgaidh, fèin-òstaichte | PokerTH",
    "desc": "Texas Hold’em prìobhaideach aig an taigh, ann an club no sgoil: frithealaiche PokerTH is cliant-lìn an-asgaidh, deiseil le aon àithne, le Docker no air Raspberry Pi.",
    "ldHeadline": "Mar a dh’òstaicheas tu am frithealaiche pòcair PokerTH agad fhèin",
    "ldDesc": "Cuir air dòigh frithealaiche Texas Hold’em prìobhaideach, fèin-òstaichte le frithealaiche sònraichte PokerTH agus cliant-lìn PokerTH.",
    "h1": "Òstaich do fhrithealaiche pòcair fhèin",
    "lead": "Tha PokerTH an-asgaidh agus le còd fosgailte o cheann gu ceann: faodaidh frithealaiche a’ gheama agus an cliant-lìn seo ruith air an inneal agad fhèin. Tha PC, frithealaiche dachaigh no Raspberry Pi gu leòr airson geama teaghlaich, oidhche cluba, lìog oifis no sgoil, agus an uairsin cluichidh gach fòn, tablaid no coimpiutair air an lìonra agad sa bhrabhsair aige le dìreach far-ainm.",
    "whyH2": "Carson a ruitheas tu am fear agad fhèin",
    "why": [
      [
        "Prìobhaideach",
        "Fuirichidh na geamannan agad air an inneal agad agus air an lìonra agad; chan fheum cluicheadairean cunntas no seòladh puist-d, dìreach far-ainm."
      ],
      [
        "Mar a thogras tu",
        "Thoir ainm fhèin don fhrithealaiche, tagh dè na modhan a nochdas air an sgrìn clàraidh a-steach, cuir teachdaireachd fàilte suas, agus cùm clàr-rangachaidh co-roinnte airson na buidhne agad."
      ],
      [
        "An-asgaidh",
        "Gun cheadachas, gun fho-sgrìobhadh, gun sanasan: tha frithealaiche PokerTH agus an cliant-lìn le chèile nam bathar-bog saor."
      ]
    ],
    "partsH2": "Dà phàirt",
    "partsP": "Feumaidh geama PokerTH frithealaiche sònraichte PokerTH, a roinneas na cairtean agus a ruitheas na bùird, agus an cliant-lìn, a bheir an aplacaid do na brabhsairean agus a cheanglas iad ris an fhrithealaiche sin. Faodaidh an dà chuid ruith air an aon inneal. Bidh a h-uile càil co-chòrdail: ceanglaidh aplacaidean PokerTH ris an aon fhrithealaiche ’s a cheanglas na brabhsairean ris — an cliant QML air Windows, macOS, Linux agus Android, agus an cliant widget clasaigeach air an deasg — agus mar sin faodaidh cluicheadairean brabhsairean is aplacaidean a mheasgachadh aig an aon bhòrd.",
    "stepsH2": "Cuir air dòigh e ann an trì ceumannan",
    "steps": [
      [
        "Stàlaich frithealaiche PokerTH",
        "Tog pokerth_dedicated_server o thùs-chòd PokerTH — tionndadh 2.1.10 no nas ùire — a’ leantainn stiùireadh an fhrithealaiche aig pròiseact PokerTH: feumaidh e Qt 6.7 no nas ùire, CMake agus trusaiche C++23. Tha a’ phacaid pokerth-server aig sgaoilidhean Linux na tionndadh nas sine. Bidh am frithealaiche ag èisteachd air port TCP 7234."
      ],
      [
        "Stàlaich an cliant-lìn",
        "Air Debian, Ubuntu no Raspberry Pi OS, cuiridh an sgriobt stàlaidh air dòigh Node.js, an cliant-lìn agus seirbheis a thòisicheas còmhla ris an inneal, le aon àithne. Luchdaichidh luchd-cleachdaidh Docker a-nuas ìomhaigh deiseil airson amd64, arm64 agus armv7, agus ion-phortaichidh CasaOS an aon fhaidhle Compose mar aplacaid."
      ],
      [
        "Cluich",
        "Air uidheam sam bith air an lìonra agad, fosgail seòladh an inneil air port 8080, tagh “LAN / Frithealadair sònraichte”, cuir a-steach far-ainm agus cruthaich bòrd. Ceanglaidh cluicheadairean aig a bheil cliant QML no widget PokerTH ris an aon inneal air port 7234 agus gabhaidh iad pàirt aig na h-aon bhùird."
      ]
    ],
    "piH2": "Air Raspberry Pi",
    "piP": "Bidh PokerTH a’ cur theachdaireachdan beaga a-null ’s a-nall agus nì uidheaman nan cluicheadairean an dealbhadh air fad, mar sin tha Raspberry Pi gu leòr is a chòrr: ’s e Pi 4 le 2 GB an roghainn as fheàrr, agus tha Pi 5 nas motha na gu leòr. Airson oidhche rèidh, tha an lìonra nas cudromaiche na am bòrd — ceangail am Pi ris an router le càball, agus cleachd puing-inntrigidh Wi-Fi mhath dha na cluicheadairean.",
    "httpsH2": "HTTP air an LAN, HTTPS airson nan rudan a bharrachd",
    "httpsP": "Air an lìonra agad fhèin, obraichidh an geama thar HTTP àbhaisteach. Airson an aplacaid a stàladh air an sgrìn-dhachaigh, cluich far loidhne agus brathan fhaighinn, feumar HTTPS, a chuireas an stiùireadh air dòigh le Nginx agus teisteanas Let’s Encrypt an-asgaidh.",
    "adminH2": "Panail rianachd sa bhrabhsair",
    "adminP": "Seallaidh consòl aig /admin, air a dhìon le tòcan, cò a tha ceangailte; ùraichidh e an cliant-lìn le aon bhriogadh agus is urrainn dha a thilleadh dhan tionndadh roimhe; cuiridh e brathan gu na cluicheadairean, ath-shuidhichidh e an clàr-rangachaidh, stàlaichidh e paicean chairtean, stoidhlichean bùird agus ceòl, liostaichidh e na frithealaichean geama ris an urrainn don chliant ceangal, agus bheir e seachad iuchraichean nach fhosgail ach cuid de na h-earrannan aige.",
    "shareH2": "Thoir cuireadh do chluicheadairean on taobh a-muigh",
    "shareP": "Obraichidh ceanglaichean cuiridh agus còdan QR air an fhrithealaiche agad dìreach mar air pokerth.net: fosglaidh caraid an ceangal agus gheibh e àite aig do bhòrd. Mas urrainnear am frithealaiche agad a ruigsinn on eadar-lìon, faodaidh tu a mholadh cuideachd airson liosta phoblach nam frithealaichean aig a’ chliant-lìn; nochdaidh e an sin cho luath ’s a bheir rianairean a’ chliant-lìn aonta dha.",
    "guidesH2": "Stiùiridhean ceum air cheum",
    "guides": [
      "Stiùireadh stàlaidh frithealaiche PokerTH",
      "Fèin-òstadh is stàladh le aon àithne",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Stàladh de làimh agus HTTPS",
      "Am panail rianachd"
    ],
    "faqH2": "Ceistean",
    "faq": [
      [
        "A bheil òstadh frithealaiche PokerTH an-asgaidh?",
        "Tha. Tha frithealaiche PokerTH agus an cliant-lìn nam bathar-bog saor le còd fosgailte; chan fheum thu ach inneal airson an ruith."
      ],
      [
        "Dè am bathar-cruaidh a dh’fheumas mi?",
        "Glè bheag: PC no frithealaiche dachaigh sam bith a ruitheas Linux no Docker, no Raspberry Pi 4 no 5. Tha ceangal lìonra le uèir nas cudromaiche na cumhachd pròiseasaidh."
      ],
      [
        "Am feum na cluicheadairean dad a stàladh?",
        "Chan fheum. Fosglaidh iad seòladh an fhrithealaiche ann am brabhsair air am fòn, an tablaid no an coimpiutair. Faodaidh an fheadhainn as fheàrr leotha aplacaid cliant QML PokerTH no an cliant widget clasaigeach a chleachdadh: ceanglaidh iad ris an aon fhrithealaiche agus cluichidh iad aig na h-aon bhùird."
      ],
      [
        "A bheil feum air pokerth.net no ceangal eadar-lìn?",
        "Chan eil. Ruithidh frithealaiche air an lìonra ionadail agad leis fhèin: ceanglaidh na cluicheadairean ris gu dìreach, le dìreach far-ainm."
      ],
      [
        "Co mheud cluicheadair as urrainn a dhol a-steach?",
        "Suas ri 10 cluicheadairean aig gach bòrd, a bharrachd air luchd-amhairc, agus na h-uimhir de bhùird ’s a dh’fheumas a’ bhuidheann agad."
      ]
    ]
  },
  gl: {
    "title": "Servidor de póker propio — de balde, autoaloxado | PokerTH",
    "desc": "Servidor privado de Texas Hold’em na casa, no club ou na escola: servidor PokerTH e cliente web de balde, instalados cun só comando, con Docker ou nunha Raspberry Pi.",
    "ldHeadline": "Como aloxar o teu propio servidor de póker PokerTH",
    "ldDesc": "Monta un servidor de Texas Hold’em privado e autoaloxado co servidor dedicado PokerTH e o cliente web de PokerTH.",
    "h1": "Aloxa o teu propio servidor de póker",
    "lead": "PokerTH é de balde e de código aberto de principio a fin: o servidor do xogo e este cliente web poden funcionar na túa propia máquina. Un PC, un servidor doméstico ou unha Raspberry Pi abondan para unha partida en familia, unha noite de club, unha liga na oficina ou unha escola, e entón cada móbil, tableta ou ordenador da túa rede xoga no seu navegador só cun alcume.",
    "whyH2": "Por que ter o teu",
    "why": [
      [
        "Privado",
        "As túas partidas quedan na túa máquina e na túa rede; os xogadores non precisan conta nin enderezo de correo, só un alcume."
      ],
      [
        "Ao teu xeito",
        "Dálle ao servidor o seu propio nome, escolle que modos ofrece a pantalla de inicio de sesión, publica unha mensaxe de benvida e mantén unha clasificación común para o teu grupo."
      ],
      [
        "De balde",
        "Sen licenza, sen subscrición, sen anuncios: o servidor PokerTH e o cliente web son ambos software libre."
      ]
    ],
    "partsH2": "Dúas pezas",
    "partsP": "Unha partida de PokerTH precisa o servidor dedicado PokerTH, que reparte as cartas e xestiona as mesas, e o cliente web, que serve a aplicación aos navegadores e os conecta a ese servidor. Poden funcionar na mesma máquina. Todo segue sendo compatible: as aplicacións PokerTH — o cliente QML en Windows, macOS, Linux e Android, e o clásico cliente widget no escritorio — conéctanse ao mesmo servidor ca os navegadores, así que nunha mesma mesa poden xuntarse xogadores con navegador e con aplicación.",
    "stepsH2": "Ponlo en marcha en tres pasos",
    "steps": [
      [
        "Instala o servidor PokerTH",
        "Compila pokerth_dedicated_server a partir das fontes de PokerTH — versión 2.1.10 ou posterior — seguindo a guía do servidor do proxecto PokerTH: precisa Qt 6.7 ou máis recente, CMake e un compilador C++23. O paquete pokerth-server das distribucións de Linux é unha versión máis antiga. O servidor escoita no porto TCP 7234."
      ],
      [
        "Instala o cliente web",
        "En Debian, Ubuntu ou Raspberry Pi OS, o script de instalación configura Node.js, o cliente web e un servizo que arrinca coa máquina, cun só comando. Quen use Docker descarga unha imaxe xa preparada para amd64, arm64 e armv7, e CasaOS importa o mesmo ficheiro Compose como unha aplicación."
      ],
      [
        "Xoga",
        "En calquera dispositivo da túa rede, abre o enderezo da máquina no porto 8080, escolle LAN / Servidor dedicado, escribe un alcume e crea unha mesa. Os xogadores co cliente QML ou widget de PokerTH conéctanse á mesma máquina no porto 7234 e únense ás mesmas mesas."
      ]
    ],
    "piH2": "Nunha Raspberry Pi",
    "piP": "PokerTH intercambia mensaxes pequenas e os dispositivos dos xogadores fan todo o debuxo, así que unha Raspberry Pi abonda de sobra: unha Pi 4 con 2 GB é o punto ideal e unha Pi 5 é máis que suficiente. Para unha velada fluída, a rede importa máis que a placa — conecta a Pi ao router cun cable e usa un bo punto de acceso Wi-Fi para os xogadores.",
    "httpsH2": "HTTP na LAN, HTTPS para os extras",
    "httpsP": "Na túa propia rede, o xogo funciona con HTTP simple. Instalar a aplicación na pantalla de inicio, xogar sen conexión e recibir notificacións require HTTPS, que a guía configura con Nginx e un certificado gratuíto de Let’s Encrypt.",
    "adminH2": "Un panel de administración no navegador",
    "adminP": "Unha consola protexida por token en /admin mostra quen está conectado, actualiza o cliente web cun clic e pode desfacer a actualización, envía avisos aos xogadores, restablece a clasificación, instala barallas, estilos de mesa e música, lista os servidores de xogo aos que pode acceder o cliente e reparte chaves que só desbloquean algunhas das súas seccións.",
    "shareH2": "Convida xogadores de fóra",
    "shareP": "As ligazóns de convite e os códigos QR funcionan no teu servidor igual que en pokerth.net: un amigo abre a ligazón e séntase na túa mesa. Se o teu servidor é accesible desde internet, tamén podes propoñelo para a lista pública de servidores do cliente web; aparecerá alí en canto os administradores do cliente web o aproben.",
    "guidesH2": "Guías paso a paso",
    "guides": [
      "Guía de instalación do servidor PokerTH",
      "Autoaloxamento e instalación cun só comando",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Instalación manual e HTTPS",
      "O panel de administración"
    ],
    "faqH2": "Preguntas",
    "faq": [
      [
        "Aloxar un servidor PokerTH é de balde?",
        "Si. O servidor PokerTH e o cliente web son software libre e de código aberto; só precisas unha máquina onde executalos."
      ],
      [
        "Que hardware preciso?",
        "Moi pouco: calquera PC ou servidor doméstico con Linux ou Docker, ou unha Raspberry Pi 4 ou 5. Unha conexión de rede por cable importa máis que a potencia de cálculo."
      ],
      [
        "Os xogadores teñen que instalar algo?",
        "Non. Abren o enderezo do servidor nun navegador no seu móbil, tableta ou ordenador. Quen prefira unha aplicación pode usar o cliente QML de PokerTH ou o clásico cliente widget: conéctanse ao mesmo servidor e xogan nas mesmas mesas."
      ],
      [
        "Precisa pokerth.net ou unha conexión a internet?",
        "Non. Un servidor na túa rede local funciona por si só: os xogadores conéctanse a el directamente, só cun alcume."
      ],
      [
        "Cantos xogadores poden unirse?",
        "Ata 10 xogadores por mesa, máis espectadores, e tantas mesas como precise o teu grupo."
      ]
    ]
  },
  gu: {
    "title": "પોતાનું પોકર સર્વર હોસ્ટ કરો — મફત, સેલ્ફ-હોસ્ટેડ | PokerTH",
    "desc": "ઘરે, ક્લબમાં કે શાળામાં ખાનગી Texas Hold’em સર્વર: મફત PokerTH સર્વર અને વેબ ક્લાયન્ટ, એક જ કમાન્ડથી સેટઅપ, Docker સાથે કે Raspberry Pi પર.",
    "ldHeadline": "તમારું પોતાનું PokerTH પોકર સર્વર કેવી રીતે હોસ્ટ કરવું",
    "ldDesc": "PokerTH ડેડિકેટેડ સર્વર અને PokerTH વેબ ક્લાયન્ટ સાથે ખાનગી, સેલ્ફ-હોસ્ટેડ Texas Hold’em સર્વર સેટ કરો.",
    "h1": "તમારું પોતાનું પોકર સર્વર હોસ્ટ કરો",
    "lead": "PokerTH શરૂઆતથી અંત સુધી મફત અને ઓપન સોર્સ છે: ગેમ સર્વર અને આ વેબ ક્લાયન્ટ તમારા પોતાના મશીન પર ચાલી શકે છે. કુટુંબની ગેમ, ક્લબની સાંજ, ઓફિસ લીગ કે શાળા માટે એક PC, હોમ સર્વર કે Raspberry Pi પૂરતું છે, અને પછી તમારા નેટવર્ક પરનો દરેક ફોન, ટેબ્લેટ કે કમ્પ્યુટર ફક્ત ઉપનામ સાથે પોતાના બ્રાઉઝરમાં રમે છે.",
    "whyH2": "પોતાનું સર્વર શા માટે ચલાવવું",
    "why": [
      [
        "ખાનગી",
        "તમારી ગેમ્સ તમારા મશીન અને તમારા નેટવર્ક પર જ રહે છે; ખેલાડીઓને ખાતા કે ઇમેઇલ સરનામાની જરૂર નથી, ફક્ત ઉપનામ."
      ],
      [
        "તમારી રીતે ગોઠવો",
        "સર્વરને પોતાનું નામ આપો, લોગિન સ્ક્રીન કયા મોડ આપે તે પસંદ કરો, સ્વાગત સંદેશ મૂકો, અને તમારા જૂથ માટે સહિયારું લીડરબોર્ડ રાખો."
      ],
      [
        "મફત",
        "લાઇસન્સ નહીં, સબ્સ્ક્રિપ્શન નહીં, જાહેરાતો નહીં: PokerTH સર્વર અને વેબ ક્લાયન્ટ બંને મુક્ત સોફ્ટવેર છે."
      ]
    ],
    "partsH2": "બે ભાગ",
    "partsP": "PokerTH ગેમ માટે PokerTH ડેડિકેટેડ સર્વર જોઈએ, જે પત્તાં વહેંચે છે અને ટેબલ ચલાવે છે, અને વેબ ક્લાયન્ટ જોઈએ, જે બ્રાઉઝર્સને એપ પૂરી પાડે છે અને તેમને એ સર્વર સાથે જોડે છે. બંને એક જ મશીન પર ચાલી શકે છે. બધું સુસંગત રહે છે: PokerTH એપ્સ બ્રાઉઝર્સ જેવા જ સર્વર સાથે જોડાય છે — Windows, macOS, Linux અને Android પર QML ક્લાયન્ટ, અને ડેસ્કટોપ પર ક્લાસિક widget ક્લાયન્ટ — તેથી ખેલાડીઓ એક જ ટેબલ પર બ્રાઉઝર અને એપ્સ સાથે મળીને રમી શકે છે.",
    "stepsH2": "ત્રણ પગલાંમાં સેટઅપ કરો",
    "steps": [
      [
        "PokerTH સર્વર ઇન્સ્ટોલ કરો",
        "PokerTH પ્રોજેક્ટની સર્વર માર્ગદર્શિકાને અનુસરીને PokerTH સોર્સમાંથી pokerth_dedicated_server બિલ્ડ કરો — વર્ઝન 2.1.10 કે તે પછીનું: તેને Qt 6.7 કે તેથી નવું, CMake અને C++23 કમ્પાઇલર જોઈએ. Linux વિતરણોનું pokerth-server પેકેજ જૂનું વર્ઝન છે. સર્વર TCP પોર્ટ 7234 પર સાંભળે છે."
      ],
      [
        "વેબ ક્લાયન્ટ ઇન્સ્ટોલ કરો",
        "Debian, Ubuntu કે Raspberry Pi OS પર ઇન્સ્ટોલેશન સ્ક્રિપ્ટ એક જ કમાન્ડમાં Node.js, વેબ ક્લાયન્ટ અને મશીન સાથે શરૂ થતી સર્વિસ સેટ કરે છે. Docker વપરાશકર્તાઓ amd64, arm64 અને armv7 માટે તૈયાર ઇમેજ ખેંચે છે, અને CasaOS એ જ Compose ફાઇલને એપ તરીકે ઇમ્પોર્ટ કરે છે."
      ],
      [
        "રમો",
        "તમારા નેટવર્ક પરના કોઈપણ ઉપકરણ પર, પોર્ટ 8080 પર મશીનનું સરનામું ખોલો, “LAN / ડેડિકેટેડ સર્વર” પસંદ કરો, ઉપનામ લખો અને ટેબલ બનાવો. PokerTH QML અથવા widget ક્લાયન્ટ ધરાવતા ખેલાડીઓ પોર્ટ 7234 પર એ જ મશીન સાથે જોડાય છે અને એ જ ટેબલ પર જોડાય છે."
      ]
    ],
    "piH2": "Raspberry Pi પર",
    "piP": "PokerTH નાના સંદેશાની આપ-લે કરે છે અને બધું ચિત્રણ ખેલાડીઓનાં ઉપકરણો કરે છે, તેથી Raspberry Pi પૂરતું છે: 2 GB સાથેનું Pi 4 શ્રેષ્ઠ પસંદગી છે, અને Pi 5 જરૂર કરતાં પણ વધુ છે. સરળ સાંજ માટે બોર્ડ કરતાં નેટવર્ક વધુ મહત્વનું છે — Pi ને કેબલથી રાઉટર સાથે જોડો, અને ખેલાડીઓ માટે સારો Wi-Fi ઍક્સેસ પૉઇન્ટ વાપરો.",
    "httpsH2": "LAN પર HTTP, વધારાની સુવિધાઓ માટે HTTPS",
    "httpsP": "તમારા પોતાના નેટવર્ક પર ગેમ સાદા HTTP પર ચાલે છે. એપને હોમ સ્ક્રીન પર ઇન્સ્ટોલ કરવા, ઓફલાઇન રમવા અને સૂચનાઓ મેળવવા માટે HTTPS જોઈએ, જે માર્ગદર્શિકા Nginx અને મફત Let’s Encrypt પ્રમાણપત્ર સાથે સેટ કરે છે.",
    "adminH2": "બ્રાઉઝરમાં એડમિન પેનલ",
    "adminP": "/admin પર ટોકનથી સુરક્ષિત કન્સોલ બતાવે છે કે કોણ જોડાયેલું છે, વેબ ક્લાયન્ટને એક ક્લિકમાં અપડેટ કરે છે અને પાછું પણ લાવી શકે છે, ખેલાડીઓને ઘોષણાઓ મોકલે છે, લીડરબોર્ડ રીસેટ કરે છે, પત્તાંના ડેક, ટેબલ સ્ટાઇલ અને સંગીત ઇન્સ્ટોલ કરે છે, ક્લાયન્ટ જે ગેમ સર્વર્સ સુધી પહોંચી શકે તેની સૂચિ રાખે છે, અને તેના ફક્ત અમુક વિભાગો ખોલતી કીઓ આપે છે.",
    "shareH2": "બહારથી ખેલાડીઓને આમંત્રિત કરો",
    "shareP": "આમંત્રણ લિંક્સ અને QR કોડ તમારા સર્વર પર pokerth.net જેવી જ રીતે કામ કરે છે: મિત્ર લિંક ખોલે છે અને તમારા ટેબલ પર બેસી જાય છે. જો તમારું સર્વર ઇન્ટરનેટ પરથી પહોંચી શકાય તેવું હોય, તો તમે તેને વેબ ક્લાયન્ટની જાહેર સર્વર સૂચિ માટે સૂચવી પણ શકો છો; વેબ ક્લાયન્ટના એડમિન મંજૂરી આપે એટલે તે ત્યાં દેખાય છે.",
    "guidesH2": "પગલું-દર-પગલું માર્ગદર્શિકાઓ",
    "guides": [
      "PokerTH સર્વર સેટઅપ માર્ગદર્શિકા",
      "સેલ્ફ-હોસ્ટિંગ અને એક-કમાન્ડ ઇન્સ્ટોલ",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "મેન્યુઅલ ઇન્સ્ટોલેશન અને HTTPS",
      "એડમિન પેનલ"
    ],
    "faqH2": "પ્રશ્નો",
    "faq": [
      [
        "શું PokerTH સર્વર હોસ્ટ કરવું મફત છે?",
        "હા. PokerTH સર્વર અને વેબ ક્લાયન્ટ મફત અને ઓપન સોર્સ સોફ્ટવેર છે; તમારે તેમને ચલાવવા માટે ફક્ત એક મશીનની જરૂર છે."
      ],
      [
        "મારે કયા હાર્ડવેરની જરૂર છે?",
        "બહુ ઓછા: Linux કે Docker ચલાવતું કોઈપણ PC કે હોમ સર્વર, અથવા Raspberry Pi 4 કે 5. પ્રોસેસિંગ પાવર કરતાં વાયર્ડ નેટવર્ક કનેક્શન વધુ મહત્વનું છે."
      ],
      [
        "શું ખેલાડીઓને કંઈ ઇન્સ્ટોલ કરવાની જરૂર છે?",
        "ના. તેઓ પોતાના ફોન, ટેબ્લેટ કે કમ્પ્યુટર પરના બ્રાઉઝરમાં સર્વરનું સરનામું ખોલે છે. જેમને એપ પસંદ હોય તેઓ PokerTH QML ક્લાયન્ટ અથવા ક્લાસિક widget ક્લાયન્ટ વાપરી શકે છે: તે એ જ સર્વર સાથે જોડાય છે અને એ જ ટેબલ પર રમે છે."
      ],
      [
        "શું તેને pokerth.net કે ઇન્ટરનેટ કનેક્શનની જરૂર છે?",
        "ના. તમારા સ્થાનિક નેટવર્ક પરનું સર્વર જાતે જ ચાલે છે: ખેલાડીઓ ફક્ત ઉપનામ સાથે સીધા તેની સાથે જોડાય છે."
      ],
      [
        "કેટલા ખેલાડીઓ જોડાઈ શકે?",
        "દરેક ટેબલ પર 10 ખેલાડીઓ સુધી, ઉપરાંત પ્રેક્ષકો, અને તમારા જૂથને જોઈએ તેટલાં ટેબલ."
      ]
    ]
  },
  ha: {
    "title": "Kafa sabar poker taka — kyauta, a kan na'urarka | PokerTH",
    "desc": "Sabar Texas Hold’em ta sirri a gida, a ƙungiya ko a makaranta: sabar PokerTH da abokin cinikin yanar gizo kyauta, kafawa da umarni ɗaya, da Docker ko a Raspberry Pi.",
    "ldHeadline": "Yadda za ka kafa sabar poker ta PokerTH taka",
    "ldDesc": "Kafa sabar Texas Hold’em ta sirri a kan na'urarka da keɓaɓɓiyar sabar PokerTH da abokin cinikin yanar gizo na PokerTH.",
    "h1": "Kafa sabar poker taka",
    "lead": "PokerTH kyauta ne kuma buɗaɗɗen tushe ne daga farko har ƙarshe: sabar wasan da wannan abokin cinikin yanar gizo na iya aiki a kan na'urarka. Kwamfuta, sabar gida ko Raspberry Pi ya isa don wasan iyali, daren ƙungiya, gasar ofis ko makaranta, sannan kowace waya, kwamfutar hannu ko kwamfuta a hanyar sadarwarka tana wasa a burauzarta da laƙabi kawai.",
    "whyH2": "Me ya sa za ka kafa taka",
    "why": [
      [
        "Na sirri",
        "Wasanninka suna zama a kan na'urarka da hanyar sadarwarka; 'yan wasa ba sa buƙatar asusu ko adireshin imel, laƙabi kawai."
      ],
      [
        "Yadda kake so",
        "Ba sabar sunanta na kanta, zaɓi yanayin da allon shiga zai bayar, saka saƙon maraba, kuma ka riƙe jadawalin Matsayi na bai ɗaya don ƙungiyarka."
      ],
      [
        "Kyauta",
        "Babu lasisi, babu biyan kuɗi na wata-wata, babu talla: sabar PokerTH da abokin cinikin yanar gizo duka manhajoji ne na kyauta."
      ]
    ],
    "partsH2": "Sassa biyu",
    "partsP": "Wasan PokerTH yana buƙatar keɓaɓɓiyar sabar PokerTH, wadda ke raba katunan kuma take tafiyar da teburan, da abokin cinikin yanar gizo, wanda ke ba burauzoyi manhajar kuma ya haɗa su da wannan sabar. Za su iya aiki a kan na'ura ɗaya. Komai yana ci gaba da dacewa: manhajojin PokerTH — abokin cinikin QML a kan Windows, macOS, Linux da Android, da abokin cinikin widget na gargajiya a kwamfutar tebur — suna haɗuwa da sabar da burauzoyi ke haɗuwa da ita, don haka 'yan wasa na iya haɗa burauzoyi da manhajoji a tebur ɗaya.",
    "stepsH2": "Kafa ta a matakai uku",
    "steps": [
      [
        "Sanya sabar PokerTH",
        "Gina pokerth_dedicated_server daga tushen lambar PokerTH — siga 2.1.10 ko sabuwa — ta bin jagoran sabar na aikin PokerTH: tana buƙatar Qt 6.7 ko sabuwa, CMake da mai harhaɗa lamba (compiler) na C++23. Kunshin pokerth-server na rarrabuwar Linux tsohuwar siga ce. Sabar tana sauraro a tashar TCP 7234."
      ],
      [
        "Sanya abokin cinikin yanar gizo",
        "A Debian, Ubuntu ko Raspberry Pi OS, rubutun shigarwa yana kafa Node.js, abokin cinikin yanar gizo da sabis da ke farawa tare da na'urar, da umarni ɗaya. Masu amfani da Docker suna saukar da hoton da aka shirya don amd64, arm64 da armv7, kuma CasaOS na shigo da wannan fayil ɗin Compose a matsayin manhaja."
      ],
      [
        "Yi wasa",
        "A kowace na'ura a hanyar sadarwarka, buɗe adireshin na'urar a tashar 8080, zaɓi “LAN / Keɓaɓɓiyar sabar”, rubuta laƙabi kuma ka ƙirƙiri tebur. 'Yan wasa masu abokin cinikin PokerTH na QML ko widget suna haɗuwa da wannan na'ura a tashar 7234 kuma suna shiga teburan iri ɗaya."
      ]
    ],
    "piH2": "A kan Raspberry Pi",
    "piP": "PokerTH na musayar ƙananan saƙonni kuma na'urorin 'yan wasa ne ke yin dukkan zane-zane, don haka Raspberry Pi ya wadatar: Pi 4 mai 2 GB shi ne mafi dacewa, Pi 5 ya fi isa. Don dare mai daɗi, hanyar sadarwa ta fi allon kwamfutar muhimmanci — haɗa Pi da router da waya, kuma ka yi amfani da wurin shiga Wi-Fi mai kyau don 'yan wasa.",
    "httpsH2": "HTTP a LAN, HTTPS don ƙarin abubuwa",
    "httpsP": "A hanyar sadarwarka, wasan yana aiki ta HTTP na yau da kullun. Sanya manhajar a allon gida, yin wasa ba tare da intanet ba da karɓar sanarwa suna buƙatar HTTPS, wanda jagoran ke kafawa da Nginx da takardar shaidar Let’s Encrypt kyauta.",
    "adminH2": "Kwamitin gudanarwa a cikin burauza",
    "adminP": "Shafin sarrafawa da token ke kare shi a /admin yana nuna waɗanda suka haɗu, yana sabunta abokin cinikin yanar gizo da danna ɗaya kuma yana iya mayar da shi baya, yana aika sanarwa ga 'yan wasa, yana sake saita Matsayi, yana sanya fakitin katuna, salon tebur da kiɗa, yana jera sabobin wasa da abokin cinikin zai iya kaiwa, kuma yana ba da maɓallai masu buɗe wasu sassansa kawai.",
    "shareH2": "Gayyaci 'yan wasa daga waje",
    "shareP": "Mahaɗan gayyata da lambobin QR suna aiki a sabarka kamar yadda suke yi a pokerth.net: aboki yana buɗe mahaɗin kuma a zaunar da shi a teburinka. Idan ana iya isa sabarka daga intanet, za ka iya kuma gabatar da ita don jerin sabobin jama'a na abokin cinikin yanar gizo; za ta bayyana a can da zarar masu gudanar da abokin cinikin yanar gizo sun amince da ita.",
    "guidesH2": "Jagorori mataki-mataki",
    "guides": [
      "Jagoran kafa sabar PokerTH",
      "Kafawa a kan na'urarka da shigarwa da umarni ɗaya",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Shigarwa da hannu da HTTPS",
      "Kwamitin gudanarwa"
    ],
    "faqH2": "Tambayoyi",
    "faq": [
      [
        "Kafa sabar PokerTH kyauta ne?",
        "Ee. Sabar PokerTH da abokin cinikin yanar gizo manhajoji ne na kyauta masu buɗaɗɗen tushe; kana buƙatar na'ura kawai da za ta gudanar da su."
      ],
      [
        "Wane irin kayan aiki nake buƙata?",
        "Kaɗan kaɗan: kowace kwamfuta ko sabar gida da ke gudanar da Linux ko Docker, ko Raspberry Pi 4 ko 5. Haɗin hanyar sadarwa da waya ya fi ƙarfin sarrafawa muhimmanci."
      ],
      [
        "Shin 'yan wasa za su sanya wani abu?",
        "A'a. Suna buɗe adireshin sabar a burauza a wayarsu, kwamfutar hannu ko kwamfuta. Waɗanda suka fi son manhaja za su iya amfani da abokin cinikin PokerTH na QML ko abokin cinikin widget na gargajiya: suna haɗuwa da wannan sabar kuma suna wasa a teburan iri ɗaya."
      ],
      [
        "Shin tana buƙatar pokerth.net ko haɗin intanet?",
        "A'a. Sabar a hanyar sadarwarka ta gida tana aiki da kanta: 'yan wasa suna haɗuwa da ita kai tsaye, da laƙabi kawai."
      ],
      [
        "'Yan wasa nawa ne za su iya shiga?",
        "Har zuwa 'yan wasa 10 a kowane tebur, tare da 'yan kallo, da teburai gwargwadon yadda ƙungiyarka ke buƙata."
      ]
    ]
  },
  he: {
    "title": "שרת פוקר משלכם — בחינם, באירוח עצמי | PokerTH",
    "desc": "שרת Texas Hold’em פרטי בבית, במועדון או בבית ספר: שרת PokerTH ולקוח הווב בחינם, מותקנים בפקודה אחת, עם Docker או על Raspberry Pi.",
    "ldHeadline": "איך להקים שרת פוקר PokerTH משלכם",
    "ldDesc": "הקימו שרת Texas Hold’em פרטי באירוח עצמי עם השרת הייעודי של PokerTH ולקוח הווב של PokerTH.",
    "h1": "להקים שרת פוקר משלכם",
    "lead": "PokerTH חינמי ובקוד פתוח מקצה לקצה: שרת המשחק ולקוח הווב הזה יכולים לרוץ על המחשב שלכם. מחשב, שרת ביתי או Raspberry Pi מספיקים למשחק משפחתי, לערב במועדון, לליגה במשרד או לבית ספר, ואז כל טלפון, טאבלט או מחשב ברשת שלכם משחק בדפדפן עם כינוי בלבד.",
    "whyH2": "למה שרת משלכם",
    "why": [
      [
        "פרטיות",
        "המשחקים נשארים על המחשב שלכם וברשת שלכם; השחקנים לא צריכים חשבון ולא כתובת דוא״ל, רק כינוי."
      ],
      [
        "בהתאמה אישית",
        "תנו לשרת שם משלו, בחרו אילו מצבים מסך הכניסה מציע, פרסמו הודעת פתיחה ונהלו טבלת מובילים משותפת לקבוצה שלכם."
      ],
      [
        "בחינם",
        "בלי רישיון, בלי מנוי, בלי פרסומות: שרת PokerTH ולקוח הווב הם שניהם תוכנה חופשית."
      ]
    ],
    "partsH2": "שני רכיבים",
    "partsP": "משחק PokerTH צריך את השרת הייעודי של PokerTH, שמחלק את הקלפים ומנהל את השולחנות, ואת לקוח הווב, שמגיש את האפליקציה לדפדפנים ומחבר אותם לשרת הזה. שניהם יכולים לרוץ על אותו מחשב. הכול נשאר תואם: אפליקציות PokerTH מתחברות לאותו שרת כמו הדפדפנים — לקוח ה-QML ל-Windows, macOS, Linux ו-Android, ולקוח ה-widget הקלאסי למחשב השולחני — כך שבשולחן אחד אפשר לשלב שחקנים בדפדפנים ובאפליקציות.",
    "stepsH2": "הקמה בשלושה צעדים",
    "steps": [
      [
        "מתקינים את שרת PokerTH",
        "בנו את pokerth_dedicated_server מקוד המקור של PokerTH — גרסה 2.1.10 ומעלה — לפי מדריך השרת של פרויקט PokerTH: נדרשים Qt 6.7 ומעלה, CMake ומהדר C++23. חבילת pokerth-server של הפצות Linux היא גרסה ישנה יותר. השרת מאזין בפורט TCP 7234."
      ],
      [
        "מתקינים את לקוח הווב",
        "ב־Debian, ב־Ubuntu או ב־Raspberry Pi OS סקריפט ההתקנה מתקין בפקודה אחת את Node.js, את לקוח הווב ושירות שעולה יחד עם המחשב. משתמשי Docker מורידים אימג׳ מוכן ל־amd64, ל־arm64 ול־armv7, ו־CasaOS מייבא את אותו קובץ Compose כאפליקציה."
      ],
      [
        "משחקים",
        "בכל מכשיר ברשת שלכם, פתחו את הכתובת של המחשב בפורט 8080, בחרו „LAN / שרת ייעודי”, הקלידו כינוי וצרו שולחן. שחקנים עם לקוח ה-QML או ה-widget של PokerTH מתחברים לאותו מחשב בפורט 7234 ומצטרפים לאותם שולחנות."
      ]
    ],
    "piH2": "על Raspberry Pi",
    "piP": "PokerTH מעביר הודעות קטנות, וכל הציור נעשה במכשירים של השחקנים, ולכן Raspberry Pi מספיק בהחלט: Pi 4 עם 2 GB הוא הבחירה המושלמת, ו־Pi 5 יותר ממספיק. לערב חלק, הרשת חשובה יותר מהלוח — חברו את ה־Pi לנתב בכבל, והשתמשו בנקודת גישה טובה של Wi-Fi לשחקנים.",
    "httpsH2": "HTTP ברשת המקומית, HTTPS לתוספות",
    "httpsP": "ברשת שלכם המשחק עובד ב־HTTP רגיל. התקנת האפליקציה במסך הבית, משחק אופליין וקבלת התראות דורשים HTTPS, שהמדריך מגדיר עם Nginx ותעודת Let’s Encrypt חינמית.",
    "adminH2": "לוח ניהול בדפדפן",
    "adminP": "קונסולה מוגנת בטוקן בכתובת /admin מראה מי מחובר, מעדכנת את לקוח הווב בלחיצה אחת ויכולה גם לבטל את העדכון, שולחת הודעות לשחקנים, מאפסת את טבלת המובילים, מתקינה חפיסות קלפים, סגנונות שולחן ומוזיקה, קובעת את רשימת שרתי המשחק שהלקוח רשאי להתחבר אליהם, ומחלקת מפתחות שפותחים רק חלק מהאזורים שלה.",
    "shareH2": "הזמינו שחקנים מבחוץ",
    "shareP": "קישורי הזמנה וקודי QR עובדים בשרת שלכם בדיוק כמו ב־pokerth.net: חבר פותח את הקישור ומקבל מושב בשולחן שלכם. אם השרת שלכם נגיש מהאינטרנט, אפשר גם להציע אותו לרשימת השרתים הציבורית של לקוח הווב; הוא יופיע שם ברגע שמנהלי לקוח הווב יאשרו אותו.",
    "guidesH2": "מדריכים צעד אחר צעד",
    "guides": [
      "מדריך הקמת שרת PokerTH",
      "אירוח עצמי והתקנה בפקודה אחת",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "התקנה ידנית ו־HTTPS",
      "לוח הניהול"
    ],
    "faqH2": "שאלות",
    "faq": [
      [
        "האם אירוח שרת PokerTH הוא בחינם?",
        "כן. שרת PokerTH ולקוח הווב הם תוכנה חופשית בקוד פתוח; צריך רק מחשב שיריץ אותם."
      ],
      [
        "איזו חומרה צריך?",
        "מעט מאוד: כל מחשב או שרת ביתי שמריץ Linux או Docker, או Raspberry Pi 4 או 5. חיבור רשת קווי חשוב יותר מכוח עיבוד."
      ],
      [
        "האם השחקנים צריכים להתקין משהו?",
        "לא. הם פותחים את כתובת השרת בדפדפן בטלפון, בטאבלט או במחשב. מי שמעדיפים אפליקציה יכולים להשתמש בלקוח ה-QML של PokerTH או בלקוח ה-widget הקלאסי: הם מתחברים לאותו שרת ומשחקים באותם שולחנות."
      ],
      [
        "האם צריך את pokerth.net או חיבור לאינטרנט?",
        "לא. שרת ברשת המקומית שלכם פועל באופן עצמאי: השחקנים מתחברים אליו ישירות, עם כינוי בלבד."
      ],
      [
        "כמה שחקנים יכולים להצטרף?",
        "עד 10 שחקנים בשולחן, ועוד צופים, וכמה שולחנות שהקבוצה שלכם צריכה."
      ]
    ]
  },
  hi: {
    "title": "अपना पोकर सर्वर होस्ट करें — मुफ़्त, सेल्फ़-होस्टेड | PokerTH",
    "desc": "घर, क्लब या स्कूल में निजी Texas Hold’em सर्वर: PokerTH का मुफ़्त सर्वर और वेब क्लाइंट, एक ही कमांड से सेट अप, Docker के साथ या Raspberry Pi पर।",
    "ldHeadline": "अपना PokerTH पोकर सर्वर कैसे होस्ट करें",
    "ldDesc": "PokerTH समर्पित सर्वर और PokerTH वेब क्लाइंट से एक निजी, सेल्फ़-होस्टेड Texas Hold’em सर्वर सेट अप कीजिए।",
    "h1": "अपना पोकर सर्वर ख़ुद होस्ट कीजिए",
    "lead": "PokerTH शुरू से आख़िर तक मुफ़्त और ओपन सोर्स है: गेम सर्वर और यह वेब क्लाइंट आपकी अपनी मशीन पर चल सकते हैं। परिवार के खेल, क्लब की शाम, दफ़्तर की लीग या स्कूल के लिए एक PC, होम सर्वर या Raspberry Pi काफ़ी है, और फिर आपके नेटवर्क पर हर फ़ोन, टैबलेट या कंप्यूटर सिर्फ़ एक उपनाम के साथ अपने ब्राउज़र में खेलता है।",
    "whyH2": "अपना सर्वर क्यों चलाएँ",
    "why": [
      [
        "निजी",
        "आपके खेल आपकी मशीन और आपके नेटवर्क पर ही रहते हैं; खिलाड़ियों को न खाते की ज़रूरत है, न ईमेल पते की, बस एक उपनाम।"
      ],
      [
        "आपकी मर्ज़ी से",
        "सर्वर को उसका अपना नाम दीजिए, चुनिए कि लॉगिन स्क्रीन कौन-से मोड दिखाए, स्वागत संदेश लगाइए, और अपने समूह के लिए एक साझा लीडरबोर्ड रखिए।"
      ],
      [
        "मुफ़्त",
        "न लाइसेंस, न सदस्यता, न विज्ञापन: PokerTH सर्वर और वेब क्लाइंट दोनों फ़्री सॉफ़्टवेयर हैं।"
      ]
    ],
    "partsH2": "दो हिस्से",
    "partsP": "PokerTH के खेल के लिए PokerTH समर्पित सर्वर चाहिए, जो पत्ते बाँटता है और मेज़ें चलाता है, और वेब क्लाइंट, जो ब्राउज़रों को ऐप पहुँचाता है और उन्हें उस सर्वर से जोड़ता है। दोनों एक ही मशीन पर चल सकते हैं। सब कुछ संगत रहता है: PokerTH ऐप — Windows, macOS, Linux और Android के लिए QML क्लाइंट, और डेस्कटॉप के लिए क्लासिक widget क्लाइंट — उसी सर्वर से जुड़ते हैं जिससे ब्राउज़र जुड़ते हैं, इसलिए एक ही मेज़ पर ब्राउज़र और ऐप वाले खिलाड़ी साथ खेल सकते हैं।",
    "stepsH2": "तीन चरणों में सेट अप",
    "steps": [
      [
        "PokerTH सर्वर इंस्टॉल कीजिए",
        "PokerTH प्रोजेक्ट की सर्वर गाइड का पालन करते हुए PokerTH के सोर्स से pokerth_dedicated_server बिल्ड कीजिए — संस्करण 2.1.10 या उससे नया: इसके लिए Qt 6.7 या उससे नया, CMake और एक C++23 कंपाइलर चाहिए। Linux वितरणों का pokerth-server पैकेज पुराना संस्करण है। सर्वर TCP पोर्ट 7234 पर सुनता है।"
      ],
      [
        "वेब क्लाइंट इंस्टॉल कीजिए",
        "Debian, Ubuntu या Raspberry Pi OS पर इंस्टॉलेशन स्क्रिप्ट एक ही कमांड में Node.js, वेब क्लाइंट और मशीन के साथ शुरू होने वाली एक सेवा सेट अप कर देती है। Docker इस्तेमाल करने वाले amd64, arm64 और armv7 के लिए तैयार इमेज डाउनलोड कर लेते हैं, और CasaOS उसी Compose फ़ाइल को ऐप के रूप में इम्पोर्ट करता है।"
      ],
      [
        "खेलिए",
        "अपने नेटवर्क के किसी भी डिवाइस पर पोर्ट 8080 पर मशीन का पता खोलिए, LAN / समर्पित सर्वर चुनिए, एक उपनाम लिखिए और एक मेज़ बनाइए। PokerTH के QML या widget क्लाइंट वाले खिलाड़ी पोर्ट 7234 पर उसी मशीन से जुड़ते हैं और उन्हीं मेज़ों पर शामिल होते हैं।"
      ]
    ],
    "piH2": "Raspberry Pi पर",
    "piP": "PokerTH छोटे-छोटे संदेशों का आदान-प्रदान करता है और सारी ड्रॉइंग खिलाड़ियों के डिवाइस करते हैं, इसलिए Raspberry Pi भरपूर है: 2 GB वाला Pi 4 सबसे सही विकल्प है, और Pi 5 ज़रूरत से ज़्यादा है। सहज शाम के लिए बोर्ड से ज़्यादा नेटवर्क मायने रखता है — Pi को केबल से राउटर में लगाइए, और खिलाड़ियों के लिए एक अच्छा Wi-Fi एक्सेस पॉइंट इस्तेमाल कीजिए।",
    "httpsH2": "LAN पर HTTP, अतिरिक्त सुविधाओं के लिए HTTPS",
    "httpsP": "आपके अपने नेटवर्क पर खेल सादे HTTP पर चलता है। ऐप को होम स्क्रीन पर इंस्टॉल करने, ऑफ़लाइन खेलने और सूचनाएँ पाने के लिए HTTPS चाहिए, जिसे गाइड Nginx और Let’s Encrypt के मुफ़्त प्रमाणपत्र के साथ सेट अप करती है।",
    "adminH2": "ब्राउज़र में एडमिन पैनल",
    "adminP": "/admin पर टोकन से सुरक्षित एक कंसोल दिखाता है कि कौन जुड़ा है, एक क्लिक में वेब क्लाइंट अपडेट करता है और उसे पिछले संस्करण पर लौटा सकता है, खिलाड़ियों को घोषणाएँ भेजता है, लीडरबोर्ड रीसेट करता है, ताश की गड्डियाँ, मेज़ की शैलियाँ और संगीत इंस्टॉल करता है, उन गेम सर्वरों की सूची रखता है जिन तक क्लाइंट पहुँच सकता है, और ऐसी कुंजियाँ देता है जो उसके केवल कुछ हिस्से खोलती हैं।",
    "shareH2": "बाहर के खिलाड़ियों को आमंत्रित कीजिए",
    "shareP": "आमंत्रण लिंक और QR कोड आपके सर्वर पर ठीक वैसे ही काम करते हैं जैसे pokerth.net पर: दोस्त लिंक खोलता है और आपकी मेज़ पर बैठ जाता है। अगर आपका सर्वर इंटरनेट से पहुँचा जा सकता है, तो आप उसे वेब क्लाइंट की सार्वजनिक सर्वर सूची के लिए प्रस्तावित भी कर सकते हैं; वेब क्लाइंट के एडमिन मंज़ूरी दे दें, तो वह वहाँ दिखने लगता है।",
    "guidesH2": "चरण-दर-चरण गाइड",
    "guides": [
      "PokerTH सर्वर सेटअप गाइड",
      "सेल्फ़-होस्टिंग और एक कमांड से इंस्टॉल",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "मैन्युअल इंस्टॉलेशन और HTTPS",
      "एडमिन पैनल"
    ],
    "faqH2": "सवाल",
    "faq": [
      [
        "क्या PokerTH सर्वर होस्ट करना मुफ़्त है?",
        "हाँ। PokerTH सर्वर और वेब क्लाइंट मुफ़्त और ओपन-सोर्स सॉफ़्टवेयर हैं; आपको बस उन्हें चलाने के लिए एक मशीन चाहिए।"
      ],
      [
        "मुझे कौन-सा हार्डवेयर चाहिए?",
        "बहुत कम: Linux या Docker चलाने वाला कोई भी PC या होम सर्वर, या एक Raspberry Pi 4 या 5। प्रोसेसिंग पावर से ज़्यादा तार वाला नेटवर्क कनेक्शन मायने रखता है।"
      ],
      [
        "क्या खिलाड़ियों को कुछ इंस्टॉल करना पड़ता है?",
        "नहीं। वे अपने फ़ोन, टैबलेट या कंप्यूटर के ब्राउज़र में सर्वर का पता खोलते हैं। जो ऐप पसंद करते हैं, वे PokerTH का QML क्लाइंट या क्लासिक widget क्लाइंट इस्तेमाल कर सकते हैं: वे उसी सर्वर से जुड़ते हैं और उन्हीं मेज़ों पर खेलते हैं।"
      ],
      [
        "क्या इसके लिए pokerth.net या इंटरनेट कनेक्शन चाहिए?",
        "नहीं। आपके लोकल नेटवर्क का सर्वर अपने-आप चलता है: खिलाड़ी बस एक उपनाम के साथ सीधे उससे जुड़ते हैं।"
      ],
      [
        "कितने खिलाड़ी जुड़ सकते हैं?",
        "हर मेज़ पर 10 खिलाड़ियों तक, साथ में दर्शक, और जितनी मेज़ें आपके समूह को चाहिए।"
      ]
    ]
  },
  hr: {
    "title": "Vlastiti poker poslužitelj — besplatno, na vašem računalu | PokerTH",
    "desc": "Privatni Texas Hold’em poslužitelj kod kuće, u klubu ili školi: besplatni PokerTH poslužitelj i web klijent u jednoj naredbi, s alatom Docker ili na Raspberry Pi.",
    "ldHeadline": "Kako pokrenuti vlastiti PokerTH poker poslužitelj",
    "ldDesc": "Postavite privatni Texas Hold’em poslužitelj na vlastitom računalu pomoću namjenskog PokerTH poslužitelja i PokerTH web klijenta.",
    "h1": "Pokrenite vlastiti poker poslužitelj",
    "lead": "PokerTH je besplatan i otvorenog koda od početka do kraja: poslužitelj igre i ovaj web klijent mogu raditi na vašem vlastitom računalu. PC, kućni poslužitelj ili Raspberry Pi dovoljni su za obiteljsku igru, klupsku večer, uredsku ligu ili školu, a svaki mobitel, tablet ili računalo u vašoj mreži tada igra u svom pregledniku samo s nadimkom.",
    "whyH2": "Zašto vlastiti poslužitelj",
    "why": [
      [
        "Privatno",
        "Vaše igre ostaju na vašem računalu i u vašoj mreži; igračima ne treba ni račun ni adresa e-pošte, samo nadimak."
      ],
      [
        "Po vašoj mjeri",
        "Dajte poslužitelju vlastito ime, odaberite koje načine nudi zaslon za prijavu, objavite poruku dobrodošlice i vodite zajedničku ljestvicu za svoju skupinu."
      ],
      [
        "Besplatno",
        "Bez licence, bez pretplate, bez oglasa: i PokerTH poslužitelj i web klijent slobodni su softver."
      ]
    ],
    "partsH2": "Dva dijela",
    "partsP": "Za igru PokerTH potreban je namjenski PokerTH poslužitelj, koji dijeli karte i vodi stolove, te web klijent, koji preglednicima isporučuje aplikaciju i povezuje ih s tim poslužiteljem. Oba mogu raditi na istom računalu. Sve ostaje kompatibilno: PokerTH aplikacije spajaju se na isti poslužitelj kao i preglednici — QML klijent na sustavima Windows, macOS, Linux i Android te klasični widget klijent na desktopu — pa za istim stolom mogu igrati i igrači u pregledniku i oni u aplikaciji.",
    "stepsH2": "Postavljanje u tri koraka",
    "steps": [
      [
        "Instalirajte PokerTH poslužitelj",
        "Izgradite pokerth_dedicated_server iz izvornog koda PokerTH-a — verzija 2.1.10 ili novija — prema vodiču za poslužitelj projekta PokerTH: potrebni su Qt 6.7 ili noviji, CMake i C++23 prevoditelj. Paket pokerth-server u Linux distribucijama starija je verzija. Poslužitelj sluša na TCP portu 7234."
      ],
      [
        "Instalirajte web klijent",
        "Na sustavima Debian, Ubuntu ili Raspberry Pi OS instalacijska skripta jednom naredbom postavlja Node.js, web klijent i servis koji se pokreće zajedno s računalom. Korisnici alata Docker preuzimaju gotovu sliku za amd64, arm64 i armv7, a CasaOS uvozi istu Compose datoteku kao aplikaciju."
      ],
      [
        "Igrajte",
        "Na bilo kojem uređaju u svojoj mreži otvorite adresu računala na portu 8080, odaberite LAN / Namjenski poslužitelj, upišite nadimak i stvorite stol. Igrači s PokerTH QML ili widget klijentom spajaju se na isto računalo na portu 7234 i pridružuju se istim stolovima."
      ]
    ],
    "piH2": "Na Raspberry Pi računalu",
    "piP": "PokerTH razmjenjuje male poruke, a sve iscrtavanje obavljaju uređaji igrača, pa je Raspberry Pi sasvim dovoljan: Pi 4 s 2 GB idealan je izbor, a Pi 5 više je nego dovoljan. Za glatku večer mreža je važnija od same pločice — spojite Pi kabelom na usmjerivač i igračima osigurajte dobru Wi-Fi pristupnu točku.",
    "httpsH2": "HTTP u lokalnoj mreži, HTTPS za dodatke",
    "httpsP": "U vašoj mreži igra radi preko običnog HTTP-a. Instaliranje aplikacije na početni zaslon, igranje offline i primanje obavijesti zahtijevaju HTTPS, koji vodič postavlja pomoću alata Nginx i besplatnog certifikata Let’s Encrypt.",
    "adminH2": "Administratorska ploča u pregledniku",
    "adminP": "Konzola zaštićena tokenom na /admin prikazuje tko je spojen, jednim klikom ažurira web klijent i može ga vratiti na prethodnu verziju, šalje obavijesti igračima, poništava ljestvicu, instalira špilove karata, stilove stola i glazbu, navodi poslužitelje igre do kojih klijent smije doći te dijeli ključeve koji otključavaju samo neke njezine odjeljke.",
    "shareH2": "Pozovite igrače izvana",
    "shareP": "Poveznice s pozivom i QR kodovi rade na vašem poslužitelju jednako kao na pokerth.net: prijatelj otvori poveznicu i sjedne za vaš stol. Ako je vaš poslužitelj dostupan s interneta, možete ga predložiti i za javni popis poslužitelja web klijenta; ondje se pojavljuje nakon što ga odobre administratori web klijenta.",
    "guidesH2": "Vodiči korak po korak",
    "guides": [
      "Vodič za postavljanje PokerTH poslužitelja",
      "Vlastiti poslužitelj i instalacija jednom naredbom",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ručna instalacija i HTTPS",
      "Administratorska ploča"
    ],
    "faqH2": "Pitanja",
    "faq": [
      [
        "Je li pokretanje PokerTH poslužitelja besplatno?",
        "Da. PokerTH poslužitelj i web klijent besplatan su softver otvorenog koda; potrebno vam je samo računalo na kojem će raditi."
      ],
      [
        "Kakav mi hardver treba?",
        "Vrlo malo: bilo koje računalo ili kućni poslužitelj na kojem radi Linux ili Docker, ili Raspberry Pi 4 ili 5. Žičana mrežna veza važnija je od procesorske snage."
      ],
      [
        "Moraju li igrači išta instalirati?",
        "Ne. Otvore adresu poslužitelja u pregledniku na mobitelu, tabletu ili računalu. Oni koji više vole aplikaciju mogu koristiti PokerTH QML klijent ili klasični widget klijent: spajaju se na isti poslužitelj i igraju za istim stolovima."
      ],
      [
        "Treba li za to pokerth.net ili internetska veza?",
        "Ne. Poslužitelj u vašoj lokalnoj mreži radi samostalno: igrači se na njega spajaju izravno, samo s nadimkom."
      ],
      [
        "Koliko se igrača može pridružiti?",
        "Do 10 igrača za stolom, uz gledatelje, i onoliko stolova koliko vašoj skupini treba."
      ]
    ]
  },
  hu: {
    "title": "Saját pókerszerver — ingyenes, saját üzemeltetésű | PokerTH",
    "desc": "Privát Texas Hold’em szerver otthon, klubban vagy iskolában: az ingyenes PokerTH szerver és webes kliens, egyetlen paranccsal, Dockerrel vagy Raspberry Pi-on.",
    "ldHeadline": "Hogyan üzemeltess saját PokerTH pókerszervert",
    "ldDesc": "Állíts be privát, saját üzemeltetésű Texas Hold’em szervert a PokerTH dedikált szerverrel és a PokerTH webes klienssel.",
    "h1": "Üzemeltess saját pókerszervert",
    "lead": "A PokerTH elejétől a végéig ingyenes és nyílt forráskódú: a játékszerver és ez a webes kliens a saját gépeden is futhat. Egy PC, egy otthoni szerver vagy egy Raspberry Pi elég egy családi játékhoz, egy klubesthez, egy irodai bajnoksághoz vagy egy iskolának, és ezután a hálózatodon minden telefon, táblagép vagy számítógép a böngészőjében játszik, csupán egy becenévvel.",
    "whyH2": "Miért érdemes sajátot futtatni",
    "why": [
      [
        "Privát",
        "A játékaid a saját gépeden és hálózatodon maradnak; a játékosoknak nem kell se fiók, se e-mail-cím, csak egy becenév."
      ],
      [
        "A te ízlésed szerint",
        "Adj saját nevet a szervernek, válaszd ki, mely módokat kínálja a bejelentkezési képernyő, tegyél ki üdvözlő üzenetet, és vezess közös ranglistát a társaságodnak."
      ],
      [
        "Ingyenes",
        "Se licenc, se előfizetés, se reklám: a PokerTH szerver és a webes kliens is szabad szoftver."
      ]
    ],
    "partsH2": "Két rész",
    "partsP": "Egy PokerTH-játékhoz kell a PokerTH dedikált szerver, amely osztja a lapokat és vezeti az asztalokat, valamint a webes kliens, amely kiszolgálja az alkalmazást a böngészőknek, és összeköti őket ezzel a szerverrel. A kettő futhat ugyanazon a gépen. Minden kompatibilis marad: a PokerTH-alkalmazások ugyanahhoz a szerverhez csatlakoznak, mint a böngészők – a QML-kliens Windowson, macOS-en, Linuxon és Androidon, valamint a klasszikus widget-kliens asztali gépen –, így egy asztalnál vegyesen ülhetnek böngészőből és alkalmazásból játszók.",
    "stepsH2": "Beállítás három lépésben",
    "steps": [
      [
        "Telepítsd a PokerTH szervert",
        "Fordítsd le a pokerth_dedicated_server programot a PokerTH forráskódjából — 2.1.10-es vagy újabb verzió — a PokerTH projekt szerverútmutatóját követve: Qt 6.7 vagy újabb, CMake és C++23 fordító kell hozzá. A Linux-disztribúciók pokerth-server csomagja régebbi verzió. A szerver a 7234-es TCP-porton figyel."
      ],
      [
        "Telepítsd a webes klienst",
        "Debianon, Ubuntun vagy Raspberry Pi OS-en a telepítőszkript egyetlen paranccsal beállítja a Node.js-t, a webes klienst és egy szolgáltatást, amely a géppel együtt indul. A Docker-felhasználók kész képfájlt töltenek le amd64, arm64 és armv7 architektúrára, a CasaOS pedig ugyanazt a Compose-fájlt importálja alkalmazásként."
      ],
      [
        "Játssz",
        "A hálózatod bármely eszközén nyisd meg a gép címét a 8080-as porton, válaszd a „LAN / Dedikált szerver” lehetőséget, írj be egy becenevet, és hozz létre egy asztalt. A PokerTH QML- vagy widget-kliensét használó játékosok ugyanahhoz a géphez csatlakoznak a 7234-es porton, és ugyanazokhoz az asztalokhoz ülnek le."
      ]
    ],
    "piH2": "Raspberry Pi-on",
    "piP": "A PokerTH kis üzeneteket küld, és minden rajzolást a játékosok eszközei végeznek, így egy Raspberry Pi bőven elég: egy 2 GB-os Pi 4 az ideális választás, egy Pi 5 pedig több mint elég. A gördülékeny estéhez a hálózat fontosabb, mint a lapka — kábellel kösd a Pi-t a routerhez, és a játékosoknak adj jó Wi-Fi hozzáférési pontot.",
    "httpsH2": "HTTP a LAN-on, HTTPS az extrákhoz",
    "httpsP": "A saját hálózatodon a játék sima HTTP-n is működik. Az alkalmazás kezdőképernyőre telepítéséhez, az offline játékhoz és az értesítésekhez HTTPS kell, ezt az útmutató Nginx-szel és egy ingyenes Let’s Encrypt tanúsítvánnyal állítja be.",
    "adminH2": "Adminpanel a böngészőben",
    "adminP": "A /admin címen elérhető, tokennel védett konzol megmutatja, ki csatlakozik, egy kattintással frissíti a webes klienst, és vissza is tudja állítani az előző verzióra, közleményeket küld a játékosoknak, nullázza a ranglistát, kártyapaklikat, asztalstílusokat és zenét telepít, felsorolja a játékszervereket, amelyekhez a kliens csatlakozhat, és olyan kulcsokat oszt ki, amelyek csak egyes részeit oldják fel.",
    "shareH2": "Hívj meg játékosokat kívülről",
    "shareP": "A meghívó linkek és QR-kódok a szervereden ugyanúgy működnek, mint a pokerth.net-en: egy barát megnyitja a linket, és leül az asztalodhoz. Ha a szervered elérhető az internetről, a webes kliens nyilvános szerverlistájára is javasolhatod; akkor jelenik meg rajta, amikor a webes kliens adminisztrátorai jóváhagyják.",
    "guidesH2": "Lépésről lépésre útmutatók",
    "guides": [
      "PokerTH szerver telepítési útmutató",
      "Saját üzemeltetés és telepítés egy paranccsal",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Kézi telepítés és HTTPS",
      "Az adminpanel"
    ],
    "faqH2": "Kérdések",
    "faq": [
      [
        "Ingyenes egy PokerTH szerver üzemeltetése?",
        "Igen. A PokerTH szerver és a webes kliens ingyenes, nyílt forráskódú szoftver; csak egy gép kell, amin futnak."
      ],
      [
        "Milyen hardver kell hozzá?",
        "Nagyon kevés: bármilyen PC vagy otthoni szerver, amelyen Linux vagy Docker fut, vagy egy Raspberry Pi 4 vagy 5. A vezetékes hálózati kapcsolat fontosabb, mint a számítási teljesítmény."
      ],
      [
        "Kell a játékosoknak bármit telepíteniük?",
        "Nem. Megnyitják a szerver címét a telefonjuk, táblagépük vagy számítógépük böngészőjében. Aki inkább alkalmazást használna, választhatja a PokerTH QML-kliensét vagy a klasszikus widget-klienst: ezek ugyanahhoz a szerverhez csatlakoznak, és ugyanazoknál az asztaloknál lehet velük játszani."
      ],
      [
        "Kell hozzá pokerth.net vagy internetkapcsolat?",
        "Nem. A helyi hálózatodon lévő szerver önállóan működik: a játékosok közvetlenül csatlakoznak hozzá, csupán egy becenévvel."
      ],
      [
        "Hány játékos csatlakozhat?",
        "Asztalonként legfeljebb 10 játékos, plusz nézők, és annyi asztal, amennyi a társaságodnak kell."
      ]
    ]
  },
  hy: {
    "title": "Ձեր սեփական պոկերի սերվերը — անվճար, ինքնահոսթինգով | PokerTH",
    "desc": "Մասնավոր Texas Hold’em սերվեր տանը, ակումբում կամ դպրոցում՝ անվճար PokerTH սերվեր և վեբ կլիենտ, որոնք տեղադրվում են մեկ հրամանով, Docker-ով կամ Raspberry Pi-ում։",
    "ldHeadline": "Ինչպես տեղակայել ձեր սեփական PokerTH պոկերի սերվերը",
    "ldDesc": "Տեղակայեք մասնավոր, ինքնահոսթինգով Texas Hold’em սերվեր PokerTH հատուկ սերվերով և PokerTH վեբ կլիենտով։",
    "h1": "Տեղակայեք ձեր սեփական պոկերի սերվերը",
    "lead": "PokerTH-ը սկզբից մինչև վերջ անվճար է և բաց կոդով՝ խաղային սերվերը և այս վեբ կլիենտը կարող են աշխատել ձեր սեփական սարքում։ Համակարգիչը, տնային սերվերը կամ Raspberry Pi-ն բավական է ընտանեկան խաղի, ակումբային երեկոյի, գրասենյակային լիգայի կամ դպրոցի համար, և այնուհետև ձեր ցանցի յուրաքանչյուր հեռախոս, պլանշետ կամ համակարգիչ խաղում է իր դիտարկիչում՝ միայն մականունով։",
    "whyH2": "Ինչու ունենալ սեփականը",
    "why": [
      [
        "Մասնավոր",
        "Ձեր խաղերը մնում են ձեր սարքում և ձեր ցանցում, իսկ խաղացողներին պետք չէ ոչ հաշիվ, ոչ էլ էլ. փոստի հասցե՝ միայն մականուն։"
      ],
      [
        "Ձեր ձևով",
        "Տվեք սերվերին իր անունը, ընտրեք, թե որ ռեժիմներն է առաջարկում մուտքի էկրանը, տեղադրեք ողջույնի հաղորդագրություն և վարեք ընդհանուր վարկանիշային աղյուսակ ձեր խմբի համար։"
      ],
      [
        "Անվճար",
        "Ոչ լիցենզիա, ոչ բաժանորդագրություն, ոչ գովազդ՝ PokerTH սերվերը և վեբ կլիենտը երկուսն էլ ազատ ծրագրեր են։"
      ]
    ],
    "partsH2": "Երկու բաղադրիչ",
    "partsP": "PokerTH խաղի համար անհրաժեշտ են PokerTH հատուկ սերվերը, որը բաժանում է խաղաքարտերը և վարում սեղանները, և վեբ կլիենտը, որը հավելվածը մատուցում է դիտարկիչներին և միացնում դրանք այդ սերվերին։ Երկուսն էլ կարող են աշխատել նույն սարքում։ Ամեն ինչ մնում է համատեղելի. PokerTH-ի հավելվածները միանում են նույն սերվերին, ինչ դիտարկիչները՝ QML կլիենտը Windows-ում, macOS-ում, Linux-ում և Android-ում, և դասական widget կլիենտը համակարգչում, այնպես որ նույն սեղանի շուրջ կարող են խաղալ և՛ դիտարկիչներից, և՛ հավելվածներից։",
    "stepsH2": "Կարգավորեք երեք քայլով",
    "steps": [
      [
        "Տեղադրեք PokerTH սերվերը",
        "Կառուցեք pokerth_dedicated_server-ը PokerTH-ի ելակետային կոդից՝ 2.1.10 կամ ավելի նոր տարբերակը, հետևելով PokerTH նախագծի սերվերի ուղեցույցին։ Դրա համար անհրաժեշտ են Qt 6.7 կամ ավելի նոր տարբերակ, CMake և C++23 կոմպիլյատոր։ Linux բաշխումների pokerth-server փաթեթը ավելի հին տարբերակ է։ Սերվերը լսում է TCP 7234 պորտը։"
      ],
      [
        "Տեղադրեք վեբ կլիենտը",
        "Debian-ում, Ubuntu-ում կամ Raspberry Pi OS-ում տեղադրման սկրիպտը մեկ հրամանով կարգավորում է Node.js-ը, վեբ կլիենտը և ծառայություն, որը մեկնարկում է սարքի հետ միասին։ Docker-ի օգտատերերը ներբեռնում են պատրաստի պատկեր amd64, arm64 և armv7 համար, իսկ CasaOS-ը նույն Compose ֆայլը ներմուծում է որպես հավելված։"
      ],
      [
        "Խաղացեք",
        "Ձեր ցանցի ցանկացած սարքում բացեք այդ համակարգչի հասցեն 8080 պորտով, ընտրեք «LAN / Հատուկ սերվեր», մուտքագրեք մականուն և ստեղծեք սեղան։ PokerTH-ի QML կամ widget կլիենտ ունեցող խաղացողները միանում են նույն համակարգչին 7234 պորտով և նստում նույն սեղանների շուրջ։"
      ]
    ],
    "piH2": "Raspberry Pi-ում",
    "piP": "PokerTH-ը փոխանակում է փոքր հաղորդագրություններ, իսկ ամբողջ պատկերումը կատարում են խաղացողների սարքերը, ուստի Raspberry Pi-ն միանգամայն բավական է՝ 2 GB-ով Pi 4-ը օպտիմալ ընտրություն է, իսկ Pi 5-ը՝ ավելի քան բավարար։ Սահուն երեկոյի համար ցանցն ավելի կարևոր է, քան տախտակը՝ միացրեք Pi-ն երթուղիչին մալուխով և խաղացողների համար օգտագործեք լավ Wi-Fi մուտքի կետ։",
    "httpsH2": "HTTP՝ LAN-ում, HTTPS՝ լրացուցիչ հնարավորությունների համար",
    "httpsP": "Ձեր սեփական ցանցում խաղն աշխատում է սովորական HTTP-ով։ Հավելվածը գլխավոր էկրանին տեղադրելու, առանց ցանցի խաղալու և ծանուցումներ ստանալու համար անհրաժեշտ է HTTPS, որը ուղեցույցը կարգավորում է Nginx-ով և անվճար Let’s Encrypt վկայականով։",
    "adminH2": "Ադմինիստրատորի վահանակ դիտարկիչում",
    "adminP": "/admin հասցեում տոկենով պաշտպանված վահանակը ցույց է տալիս, թե ով է միացված, մեկ սեղմումով թարմացնում է վեբ կլիենտը և կարող է այն վերադարձնել նախորդ տարբերակին, հայտարարություններ է ուղարկում խաղացողներին, զրոյացնում է վարկանիշային աղյուսակը, տեղադրում է խաղաքարտերի կապուկներ, սեղանի ոճեր և երաժշտություն, թվարկում է այն խաղային սերվերները, որոնց կարող է միանալ կլիենտը, և տրամադրում է բանալիներ, որոնք բացում են նրա բաժիններից միայն որոշները։",
    "shareH2": "Հրավիրեք խաղացողների դրսից",
    "shareP": "Հրավերի հղումները և QR կոդերը ձեր սերվերում աշխատում են ճիշտ այնպես, ինչպես pokerth.net-ում՝ ընկերը բացում է հղումը և նստում ձեր սեղանի շուրջ։ Եթե ձեր սերվերը հասանելի է ինտերնետից, կարող եք նաև առաջարկել այն վեբ կլիենտի սերվերների հանրային ցանկի համար։ Այն հայտնվում է այնտեղ, հենց որ վեբ կլիենտի ադմինիստրատորները հաստատում են այն։",
    "guidesH2": "Քայլ առ քայլ ուղեցույցներ",
    "guides": [
      "PokerTH սերվերի տեղադրման ուղեցույց",
      "Ինքնահոսթինգ և տեղադրում մեկ հրամանով",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ձեռքով տեղադրում և HTTPS",
      "Ադմինիստրատորի վահանակը"
    ],
    "faqH2": "Հարցեր",
    "faq": [
      [
        "PokerTH սերվեր տեղակայելն անվճա՞ր է",
        "Այո։ PokerTH սերվերը և վեբ կլիենտը անվճար և բաց կոդով ծրագրեր են՝ ձեզ անհրաժեշտ է միայն սարք դրանք գործարկելու համար։"
      ],
      [
        "Ի՞նչ սարքավորում է պետք",
        "Շատ քիչ՝ ցանկացած համակարգիչ կամ տնային սերվեր, որն աշխատում է Linux-ով կամ Docker-ով, կամ Raspberry Pi 4 կամ 5։ Լարային ցանցային միացումն ավելի կարևոր է, քան հաշվողական հզորությունը։"
      ],
      [
        "Խաղացողները պե՞տք է որևէ բան տեղադրեն",
        "Ոչ։ Նրանք բացում են սերվերի հասցեն իրենց հեռախոսի, պլանշետի կամ համակարգչի դիտարկիչում։ Ովքեր նախընտրում են հավելված, կարող են օգտագործել PokerTH-ի QML կլիենտը կամ դասական widget կլիենտը. դրանք միանում են նույն սերվերին, և խաղացողները խաղում են նույն սեղանների շուրջ։"
      ],
      [
        "Արդյո՞ք պետք է pokerth.net կամ ինտերնետ կապ",
        "Ոչ։ Ձեր տեղական ցանցի սերվերն աշխատում է ինքնուրույն՝ խաղացողները միանում են նրան ուղղակիորեն, միայն մականունով։"
      ],
      [
        "Քանի՞ խաղացող կարող է միանալ",
        "Մինչև 10 խաղացող մեկ սեղանի շուրջ, գումարած դիտորդներ, և այնքան սեղան, որքան պետք է ձեր խմբին։"
      ]
    ]
  },
  id: {
    "title": "Buat server poker sendiri — gratis, self-hosted | PokerTH",
    "desc": "Server Texas Hold’em pribadi di rumah, klub, atau sekolah: server dan klien web PokerTH gratis, dipasang dengan satu perintah, lewat Docker atau di Raspberry Pi.",
    "ldHeadline": "Cara menjalankan server poker PokerTH sendiri",
    "ldDesc": "Siapkan server Texas Hold’em pribadi yang di-host sendiri dengan server khusus PokerTH dan klien web PokerTH.",
    "h1": "Jalankan server poker Anda sendiri",
    "lead": "PokerTH gratis dan sumber terbuka dari ujung ke ujung: server permainan dan klien web ini bisa berjalan di mesin Anda sendiri. Sebuah PC, server rumahan, atau Raspberry Pi sudah cukup untuk main bersama keluarga, malam klub, liga kantor, atau sekolah, lalu setiap ponsel, tablet, atau komputer di jaringan Anda bisa bermain di perambannya hanya dengan nama panggilan.",
    "whyH2": "Mengapa menjalankan sendiri",
    "why": [
      [
        "Privat",
        "Permainan Anda tetap berada di mesin dan jaringan Anda; pemain tidak perlu akun maupun alamat surel, cukup nama panggilan."
      ],
      [
        "Sesuai keinginan Anda",
        "Beri server nama sendiri, pilih mode yang ditawarkan layar masuk, pasang pesan sambutan, dan kelola papan peringkat bersama untuk kelompok Anda."
      ],
      [
        "Gratis",
        "Tanpa lisensi, tanpa langganan, tanpa iklan: server PokerTH dan klien web sama-sama perangkat lunak bebas."
      ]
    ],
    "partsH2": "Dua bagian",
    "partsP": "Permainan PokerTH membutuhkan server khusus PokerTH, yang membagikan kartu dan menjalankan meja, serta klien web, yang menyajikan aplikasi ke peramban dan menghubungkannya ke server tersebut. Keduanya bisa berjalan di mesin yang sama. Semuanya tetap kompatibel: aplikasi PokerTH — klien QML di Windows, macOS, Linux, dan Android, serta klien widget klasik di desktop — terhubung ke server yang sama dengan peramban, jadi pemain di peramban dan di aplikasi bisa bercampur di satu meja.",
    "stepsH2": "Siapkan dalam tiga langkah",
    "steps": [
      [
        "Pasang server PokerTH",
        "Bangun pokerth_dedicated_server dari kode sumber PokerTH — versi 2.1.10 atau lebih baru — dengan mengikuti panduan server dari proyek PokerTH: dibutuhkan Qt 6.7 atau lebih baru, CMake, dan kompiler C++23. Paket pokerth-server di distribusi Linux adalah versi yang lebih lama. Server mendengarkan di port TCP 7234."
      ],
      [
        "Pasang klien web",
        "Di Debian, Ubuntu, atau Raspberry Pi OS, skrip instalasi memasang Node.js, klien web, dan layanan yang ikut menyala bersama mesin, dengan satu perintah. Pengguna Docker menarik image siap pakai untuk amd64, arm64, dan armv7, dan CasaOS mengimpor berkas Compose yang sama sebagai aplikasi."
      ],
      [
        "Mainkan",
        "Di perangkat mana pun di jaringan Anda, buka alamat mesin di port 8080, pilih LAN / Server khusus, ketik nama panggilan, dan buat meja. Pemain dengan klien QML atau widget PokerTH terhubung ke mesin yang sama di port 7234 dan bergabung ke meja yang sama."
      ]
    ],
    "piH2": "Di Raspberry Pi",
    "piP": "PokerTH hanya bertukar pesan kecil dan perangkat para pemainlah yang mengerjakan semua tampilan, jadi Raspberry Pi sudah lebih dari cukup: Pi 4 dengan 2 GB adalah pilihan paling pas, Pi 5 bahkan berlebih. Agar malam berjalan lancar, jaringan lebih penting daripada papannya — sambungkan Pi ke router dengan kabel, dan gunakan titik akses Wi-Fi yang bagus untuk para pemain.",
    "httpsH2": "HTTP di LAN, HTTPS untuk fitur tambahan",
    "httpsP": "Di jaringan Anda sendiri, permainan berjalan lewat HTTP biasa. Memasang aplikasi di layar utama, bermain offline, dan menerima notifikasi memerlukan HTTPS, yang disiapkan oleh panduan dengan Nginx dan sertifikat Let’s Encrypt gratis.",
    "adminH2": "Panel admin di peramban",
    "adminP": "Konsol yang dilindungi token di /admin menampilkan siapa saja yang terhubung, memperbarui klien web dengan satu klik dan dapat mengembalikannya ke versi sebelumnya, mengirim pengumuman ke para pemain, mengatur ulang papan peringkat, memasang dek kartu, gaya meja, dan musik, mencantumkan server permainan yang boleh dijangkau klien, serta membagikan kunci yang hanya membuka sebagian bagiannya.",
    "shareH2": "Undang pemain dari luar",
    "shareP": "Tautan undangan dan kode QR bekerja di server Anda sama seperti di pokerth.net: teman membuka tautan dan langsung duduk di meja Anda. Jika server Anda dapat dijangkau dari internet, Anda juga bisa mengusulkannya untuk daftar server publik klien web; server akan muncul di sana setelah disetujui admin klien web.",
    "guidesH2": "Panduan langkah demi langkah",
    "guides": [
      "Panduan penyiapan server PokerTH",
      "Self-hosting dan instalasi satu perintah",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Instalasi manual dan HTTPS",
      "Panel admin"
    ],
    "faqH2": "Pertanyaan",
    "faq": [
      [
        "Apakah hosting server PokerTH gratis?",
        "Ya. Server PokerTH dan klien web adalah perangkat lunak gratis dan sumber terbuka; Anda hanya perlu mesin untuk menjalankannya."
      ],
      [
        "Perangkat keras apa yang saya perlukan?",
        "Sangat sedikit: PC atau server rumahan apa pun yang menjalankan Linux atau Docker, atau Raspberry Pi 4 atau 5. Koneksi jaringan berkabel lebih penting daripada daya pemrosesan."
      ],
      [
        "Apakah pemain perlu memasang sesuatu?",
        "Tidak. Mereka membuka alamat server di peramban pada ponsel, tablet, atau komputer. Yang lebih suka aplikasi bisa memakai klien QML PokerTH atau klien widget klasik: mereka terhubung ke server yang sama dan bermain di meja yang sama."
      ],
      [
        "Apakah perlu pokerth.net atau koneksi internet?",
        "Tidak. Server di jaringan lokal Anda berjalan sendiri: para pemain terhubung langsung ke sana, hanya dengan nama panggilan."
      ],
      [
        "Berapa banyak pemain yang bisa bergabung?",
        "Hingga 10 pemain per meja, ditambah penonton, dan meja sebanyak yang dibutuhkan kelompok Anda."
      ]
    ]
  },
  is: {
    "title": "Hýstu eigin pókerþjón — ókeypis, sjálfhýstur | PokerTH",
    "desc": "Einkaþjónn fyrir Texas Hold’em heima, í klúbbi eða skóla: ókeypis PokerTH þjónn og vefbiðlari, settir upp með einni skipun, með Docker eða á Raspberry Pi.",
    "ldHeadline": "Hvernig á að hýsa eigin PokerTH pókerþjón",
    "ldDesc": "Settu upp lokaðan, sjálfhýstan Texas Hold’em þjón með PokerTH sérþjóninum og PokerTH vefbiðlaranum.",
    "h1": "Hýstu þinn eigin pókerþjón",
    "lead": "PokerTH er ókeypis og með opnum frumkóða frá upphafi til enda: leikjaþjónninn og þessi vefbiðlari geta keyrt á þinni eigin vél. PC-tölva, heimaþjónn eða Raspberry Pi duga fyrir fjölskylduleik, klúbbkvöld, skrifstofudeild eða skóla, og þá spilar hver sími, spjaldtölva eða tölva á netinu þínu í vafranum sínum með gælunafni einu saman.",
    "whyH2": "Af hverju eigin þjónn",
    "why": [
      [
        "Út af fyrir ykkur",
        "Leikirnir þínir verða eftir á vélinni þinni og netinu þínu; leikmenn þurfa hvorki aðgang né netfang, bara gælunafn."
      ],
      [
        "Eftir þínu höfði",
        "Gefðu þjóninum eigið nafn, veldu hvaða hami innskráningarskjárinn býður upp á, birtu kveðjuskilaboð og haltu sameiginlegri stigatöflu fyrir hópinn þinn."
      ],
      [
        "Ókeypis",
        "Engin leyfisgjöld, engin áskrift, engar auglýsingar: PokerTH þjónninn og vefbiðlarinn eru báðir frjáls hugbúnaður."
      ]
    ],
    "partsH2": "Tveir hlutar",
    "partsP": "PokerTH leikur þarf PokerTH sérþjóninn, sem gefur spilin og stýrir borðunum, og vefbiðlarann, sem afhendir vöfrunum forritið og tengir þá við þann þjón. Þeir geta keyrt á sömu vél. Allt helst samhæft: PokerTH forritin tengjast sama þjóni og vafrarnir — QML biðlarinn á Windows, macOS, Linux og Android, og klassíski widget biðlarinn á borðtölvu — svo leikmenn geta blandað saman vöfrum og forritum við eitt borð.",
    "stepsH2": "Settu þetta upp í þremur skrefum",
    "steps": [
      [
        "Settu upp PokerTH þjóninn",
        "Byggðu pokerth_dedicated_server úr frumkóða PokerTH — útgáfu 2.1.10 eða nýrri — samkvæmt þjónsleiðbeiningum PokerTH verkefnisins: hann þarf Qt 6.7 eða nýrra, CMake og C++23 þýðanda. Pakkinn pokerth-server í Linux dreifingum er eldri útgáfa. Þjónninn hlustar á TCP gátt 7234."
      ],
      [
        "Settu upp vefbiðlarann",
        "Á Debian, Ubuntu eða Raspberry Pi OS setur uppsetningarforskriftin upp Node.js, vefbiðlarann og þjónustu sem ræsist með vélinni, með einni skipun. Notendur Docker sækja tilbúna mynd fyrir amd64, arm64 og armv7, og CasaOS flytur sömu Compose skrá inn sem forrit."
      ],
      [
        "Spilaðu",
        "Á hvaða tæki sem er á netinu þínu opnarðu vistfang vélarinnar á gátt 8080, velur „LAN / sérþjónn“, slærð inn gælunafn og býrð til borð. Leikmenn með PokerTH QML eða widget biðlarann tengjast sömu vél á gátt 7234 og setjast við sömu borð."
      ]
    ],
    "piH2": "Á Raspberry Pi",
    "piP": "PokerTH sendir lítil skilaboð á milli og tæki leikmannanna sjá um alla teikningu, svo Raspberry Pi er meira en nóg: Pi 4 með 2 GB er kjörinn, Pi 5 er vel umfram þarfir. Fyrir hnökralaust kvöld skiptir netið meira máli en vélbúnaðurinn — tengdu Pi-inn við beininn með snúru og notaðu góðan Wi-Fi aðgangspunkt fyrir leikmennina.",
    "httpsH2": "HTTP á staðarnetinu, HTTPS fyrir aukahlutina",
    "httpsP": "Á þínu eigin neti virkar leikurinn yfir venjulegt HTTP. Til að setja forritið upp á heimaskjánum, spila án nettengingar og fá tilkynningar þarf HTTPS, sem leiðbeiningarnar setja upp með Nginx og ókeypis Let’s Encrypt skilríki.",
    "adminH2": "Stjórnborð í vafranum",
    "adminP": "Stjórnborð á /admin, varið með aðgangslykli, sýnir hverjir eru tengdir, uppfærir vefbiðlarann með einum smelli og getur fært hann aftur í fyrri útgáfu, sendir leikmönnum tilkynningar, endurstillir stigatöfluna, setur upp spilastokka, borðstíla og tónlist, listar leikjaþjónana sem biðlarinn má tengjast og úthlutar lyklum sem opna aðeins suma hluta þess.",
    "shareH2": "Bjóddu leikmönnum utan frá",
    "shareP": "Boðstenglar og QR-kóðar virka á þjóninum þínum alveg eins og á pokerth.net: vinur opnar tengilinn og fær sæti við borðið þitt. Ef hægt er að ná í þjóninn þinn af netinu geturðu líka lagt hann til fyrir almenna þjónalistann í vefbiðlaranum; hann birtist þar þegar stjórnendur vefbiðlarans hafa samþykkt hann.",
    "guidesH2": "Leiðbeiningar skref fyrir skref",
    "guides": [
      "Uppsetningarleiðbeiningar PokerTH þjónsins",
      "Sjálfhýsing og uppsetning með einni skipun",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Handvirk uppsetning og HTTPS",
      "Stjórnborðið"
    ],
    "faqH2": "Spurningar",
    "faq": [
      [
        "Er ókeypis að hýsa PokerTH þjón?",
        "Já. PokerTH þjónninn og vefbiðlarinn eru ókeypis hugbúnaður með opnum frumkóða; þú þarft bara vél til að keyra þá."
      ],
      [
        "Hvaða vélbúnað þarf ég?",
        "Mjög lítinn: hvaða PC-tölvu eða heimaþjón sem er sem keyrir Linux eða Docker, eða Raspberry Pi 4 eða 5. Nettenging með snúru skiptir meira máli en reiknigeta."
      ],
      [
        "Þurfa leikmennirnir að setja eitthvað upp?",
        "Nei. Þeir opna vistfang þjónsins í vafra í símanum, spjaldtölvunni eða tölvunni sinni. Þeir sem kjósa forrit geta notað PokerTH QML biðlarann eða klassíska widget biðlarann: þeir tengjast sama þjóni og spila við sömu borð."
      ],
      [
        "Þarf þetta pokerth.net eða nettengingu?",
        "Nei. Þjónn á staðarnetinu þínu keyrir sjálfstætt: leikmennirnir tengjast honum beint, með gælunafni einu saman."
      ],
      [
        "Hve margir leikmenn geta verið með?",
        "Allt að 10 leikmenn við hvert borð, auk áhorfenda, og eins mörg borð og hópurinn þinn þarf."
      ]
    ]
  },
  it: {
    "title": "Crea il tuo server di poker — gratis, self-hosted | PokerTH",
    "desc": "Un server Texas Hold’em privato a casa, in un circolo o a scuola: server PokerTH e client web gratuiti, installati con un comando, con Docker o su un Raspberry Pi.",
    "ldHeadline": "Come ospitare il tuo server di poker PokerTH",
    "ldDesc": "Configura un server Texas Hold’em privato e self-hosted con il server dedicato PokerTH e il client web PokerTH.",
    "h1": "Crea il tuo server di poker",
    "lead": "PokerTH è gratuito e open source dall’inizio alla fine: il server di gioco e questo client web possono girare sulla tua macchina. Un PC, un server domestico o un Raspberry Pi bastano per una partita in famiglia, una serata al circolo, un torneo in ufficio o una scuola, e ogni telefono, tablet o computer della tua rete gioca poi nel browser con un semplice nickname.",
    "whyH2": "Perché averne uno tuo",
    "why": [
      [
        "Privato",
        "Le tue partite restano sulla tua macchina e sulla tua rete; i giocatori non hanno bisogno né di un account né di un indirizzo email, basta un nickname."
      ],
      [
        "Su misura",
        "Dai al server un nome tutto suo, scegli quali modalità offre la schermata di accesso, pubblica un messaggio di benvenuto e tieni una classifica condivisa per il tuo gruppo."
      ],
      [
        "Gratuito",
        "Nessuna licenza, nessun abbonamento, nessuna pubblicità: il server PokerTH e il client web sono entrambi software libero."
      ]
    ],
    "partsH2": "Due componenti",
    "partsP": "Una partita PokerTH richiede il server dedicato PokerTH, che distribuisce le carte e gestisce i tavoli, e il client web, che fornisce l’app ai browser e li collega a quel server. Possono girare sulla stessa macchina. Tutto resta compatibile: le app PokerTH — il client QML per Windows, macOS, Linux e Android e il classico client widget per desktop — si collegano allo stesso server dei browser, così allo stesso tavolo si possono mescolare browser e app.",
    "stepsH2": "Configuralo in tre passaggi",
    "steps": [
      [
        "Installa il server PokerTH",
        "Compila pokerth_dedicated_server dai sorgenti di PokerTH — versione 2.1.10 o successiva — seguendo la guida al server del progetto PokerTH: servono Qt 6.7 o più recente, CMake e un compilatore C++23. Il pacchetto pokerth-server delle distribuzioni Linux è una versione più vecchia. Il server è in ascolto sulla porta TCP 7234."
      ],
      [
        "Installa il client web",
        "Su Debian, Ubuntu o Raspberry Pi OS lo script di installazione configura Node.js, il client web e un servizio che si avvia con la macchina, in un solo comando. Chi usa Docker scarica un’immagine pronta per amd64, arm64 e armv7, e CasaOS importa lo stesso file Compose come app."
      ],
      [
        "Gioca",
        "Da qualsiasi dispositivo della tua rete, apri l’indirizzo della macchina sulla porta 8080, scegli «LAN / Server dedicato», inserisci un nickname e crea un tavolo. I giocatori con il client QML o widget di PokerTH si collegano alla stessa macchina sulla porta 7234 e si siedono agli stessi tavoli."
      ]
    ],
    "piH2": "Su un Raspberry Pi",
    "piP": "PokerTH scambia messaggi piccoli e sono i dispositivi dei giocatori a fare tutto il disegno, quindi un Raspberry Pi basta e avanza: un Pi 4 con 2 GB è la scelta ideale, un Pi 5 è più che sufficiente. Per una serata senza intoppi conta più la rete che la scheda: collega il Pi al router con un cavo e usa un buon punto di accesso Wi-Fi per i giocatori.",
    "httpsH2": "HTTP in LAN, HTTPS per gli extra",
    "httpsP": "Sulla tua rete il gioco funziona in semplice HTTP. Installare l’app nella schermata Home, giocare offline e ricevere notifiche richiedono HTTPS, che la guida configura con Nginx e un certificato Let’s Encrypt gratuito.",
    "adminH2": "Un pannello di amministrazione nel browser",
    "adminP": "Una console protetta da token su /admin mostra chi è connesso, aggiorna il client web con un clic e può riportarlo alla versione precedente, invia annunci ai giocatori, azzera la classifica, installa mazzi di carte, stili di tavolo e musica, elenca i server di gioco che il client può raggiungere e distribuisce chiavi che sbloccano solo alcune delle sue sezioni.",
    "shareH2": "Invita giocatori dall’esterno",
    "shareP": "I link d’invito e i codici QR funzionano sul tuo server esattamente come su pokerth.net: un amico apre il link e si ritrova seduto al tuo tavolo. Se il tuo server è raggiungibile da internet, puoi anche proporlo per l’elenco dei server pubblici del client web; vi compare non appena gli amministratori del client web lo approvano.",
    "guidesH2": "Guide passo passo",
    "guides": [
      "Guida all’installazione del server PokerTH",
      "Self-hosting e installazione con un solo comando",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Installazione manuale e HTTPS",
      "Il pannello di amministrazione"
    ],
    "faqH2": "Domande",
    "faq": [
      [
        "Ospitare un server PokerTH è gratuito?",
        "Sì. Il server PokerTH e il client web sono software libero e open source; ti serve solo una macchina su cui farli girare."
      ],
      [
        "Di quale hardware ho bisogno?",
        "Pochissimo: qualsiasi PC o server domestico con Linux o Docker, oppure un Raspberry Pi 4 o 5. Una connessione di rete via cavo conta più della potenza di calcolo."
      ],
      [
        "I giocatori devono installare qualcosa?",
        "No. Aprono l’indirizzo del server in un browser sul telefono, sul tablet o sul computer. Chi preferisce un’app può usare il client QML di PokerTH o il classico client widget: si collegano allo stesso server e giocano agli stessi tavoli."
      ],
      [
        "Serve pokerth.net o una connessione a internet?",
        "No. Un server sulla tua rete locale funziona in autonomia: i giocatori vi si collegano direttamente, con un semplice nickname."
      ],
      [
        "Quanti giocatori possono partecipare?",
        "Fino a 10 giocatori per tavolo, più gli spettatori, e tutti i tavoli di cui il tuo gruppo ha bisogno."
      ]
    ]
  },
  ja: {
    "title": "自分のポーカーサーバーを立てる — 無料・セルフホスト | PokerTH",
    "desc": "自宅、クラブ、学校で使えるプライベートな Texas Hold’em サーバー。無料の PokerTH サーバーとウェブ版クライアントを、コマンド1つで、Docker や Raspberry Pi に導入できます。",
    "ldHeadline": "自分の PokerTH ポーカーサーバーを立てる方法",
    "ldDesc": "PokerTH 専用サーバーと PokerTH ウェブ版クライアントで、セルフホストのプライベートな Texas Hold’em サーバーを構築します。",
    "h1": "自分のポーカーサーバーを立てよう",
    "lead": "PokerTH は最初から最後まで無料のオープンソースです。ゲームサーバーもこのウェブ版クライアントも、あなた自身のマシンで動かせます。PC、ホームサーバー、Raspberry Pi が1台あれば、家族のゲーム、クラブの夜、職場のリーグ、学校に十分で、ネットワーク上のスマホ、タブレット、パソコンはすべて、ニックネームだけでブラウザから遊べます。",
    "whyH2": "自分で運用する理由",
    "why": [
      [
        "プライベート",
        "ゲームはあなたのマシンとネットワークの中にとどまります。プレイヤーにはアカウントもメールアドレスも不要で、ニックネームだけで遊べます。"
      ],
      [
        "自由にカスタマイズ",
        "サーバーに独自の名前を付け、ログイン画面に表示するモードを選び、歓迎メッセージを掲示し、仲間内で共有するランキングを運用できます。"
      ],
      [
        "無料",
        "ライセンス料も月額料金も広告もありません。PokerTH サーバーもウェブ版クライアントも、どちらもフリーソフトウェアです。"
      ]
    ],
    "partsH2": "2つの構成要素",
    "partsP": "PokerTH のゲームには、カードを配りテーブルを運営する PokerTH 専用サーバーと、ブラウザにアプリを配信してそのサーバーにつなぐウェブ版クライアントが必要です。両方を同じマシンで動かせます。互換性はそのまま保たれます。PokerTH のアプリ（Windows、macOS、Linux、Android 向けの QML クライアントと、デスクトップ向けの従来の widget クライアント）はブラウザと同じサーバーに接続するので、1つのテーブルでブラウザとアプリのプレイヤーが一緒に遊べます。",
    "stepsH2": "3ステップでセットアップ",
    "steps": [
      [
        "PokerTH サーバーをインストール",
        "PokerTH プロジェクトのサーバーガイドに従って、PokerTH のソースから pokerth_dedicated_server をビルドします（バージョン 2.1.10 以降）。Qt 6.7 以降、CMake、C++23 コンパイラーが必要です。Linux ディストリビューションの pokerth-server パッケージは古いバージョンです。サーバーは TCP ポート 7234 で待ち受けます。"
      ],
      [
        "ウェブ版クライアントをインストール",
        "Debian、Ubuntu、Raspberry Pi OS では、インストールスクリプトが Node.js、ウェブ版クライアント、マシンと一緒に起動するサービスをコマンド1つでセットアップします。Docker ユーザーは amd64、arm64、armv7 向けの既製イメージを取得でき、CasaOS は同じ Compose ファイルをアプリとして取り込みます。"
      ],
      [
        "プレイ",
        "ネットワーク上の任意の端末で、マシンのアドレスをポート 8080 で開き、「LAN / 専用サーバー」を選んで、ニックネームを入力し、テーブルを作成します。PokerTH の QML クライアントまたは widget クライアントを使うプレイヤーは、同じマシンのポート 7234 に接続して、同じテーブルに参加します。"
      ]
    ],
    "piH2": "Raspberry Pi で動かす",
    "piP": "PokerTH がやり取りするのは小さなメッセージだけで、描画はすべてプレイヤーの端末が行うため、Raspberry Pi で十分です。2 GB の Pi 4 がちょうどよく、Pi 5 なら余裕があります。快適な夜にはボードよりネットワークが大切です。Pi はルーターにケーブルで接続し、プレイヤー用には良い Wi-Fi アクセスポイントを使いましょう。",
    "httpsH2": "LAN では HTTP、追加機能には HTTPS",
    "httpsP": "自分のネットワーク内なら、ゲームは通常の HTTP で動きます。ホーム画面へのアプリのインストール、オフラインでのプレイ、通知の受信には HTTPS が必要で、ガイドでは Nginx と無料の Let’s Encrypt 証明書で設定します。",
    "adminH2": "ブラウザで使える管理パネル",
    "adminP": "/admin にあるトークンで保護されたコンソールでは、接続中のユーザーの確認、ワンクリックでのウェブ版クライアントの更新とロールバック、プレイヤーへのお知らせ送信、ランキングのリセット、カードデッキ・テーブルスタイル・音楽のインストール、クライアントが接続できるゲームサーバーの一覧設定、一部のセクションだけを開放するキーの発行ができます。",
    "shareH2": "外部からプレイヤーを招待",
    "shareP": "招待リンクと QR コードは、pokerth.net と同じようにあなたのサーバーでも使えます。友達がリンクを開けば、あなたのテーブルに着席します。サーバーがインターネットからアクセスできる場合は、ウェブ版クライアントの公開サーバーリストに推薦することもできます。ウェブ版クライアントの管理者が承認すると、リストに表示されます。",
    "guidesH2": "ステップバイステップガイド",
    "guides": [
      "PokerTH サーバー構築ガイド",
      "セルフホストとコマンド1つのインストール",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "手動インストールと HTTPS",
      "管理パネル"
    ],
    "faqH2": "質問",
    "faq": [
      [
        "PokerTH サーバーのホスティングは無料ですか？",
        "はい。PokerTH サーバーとウェブ版クライアントは無料のオープンソースソフトウェアです。必要なのは、それを動かすマシンだけです。"
      ],
      [
        "どんなハードウェアが必要ですか？",
        "ごくわずかです。Linux か Docker が動く PC やホームサーバー、または Raspberry Pi 4 か 5 があれば十分です。処理能力よりも有線のネットワーク接続のほうが重要です。"
      ],
      [
        "プレイヤーは何かをインストールする必要がありますか？",
        "いいえ。スマホ、タブレット、パソコンのブラウザでサーバーのアドレスを開くだけです。アプリを使いたい人は、PokerTH の QML クライアントか従来の widget クライアントを使えます。どちらも同じサーバーに接続し、同じテーブルで遊べます。"
      ],
      [
        "pokerth.net やインターネット接続は必要ですか？",
        "いいえ。ローカルネットワーク上のサーバーは単独で動きます。プレイヤーはニックネームだけで、そのサーバーに直接接続します。"
      ],
      [
        "何人まで参加できますか？",
        "1テーブル最大10人で、さらに観戦者も参加でき、テーブルは仲間に必要なだけ作れます。"
      ]
    ]
  },
  ka: {
    "title": "საკუთარი პოკერის სერვერი — უფასოდ, თვითჰოსტინგით | PokerTH",
    "desc": "კერძო Texas Hold’em სერვერი სახლში, კლუბში ან სკოლაში: PokerTH-ის უფასო სერვერი და ვებ-კლიენტი, ერთი ბრძანებით, Docker-ით ან Raspberry Pi-ზე.",
    "ldHeadline": "როგორ დააჰოსტოთ საკუთარი PokerTH პოკერის სერვერი",
    "ldDesc": "შექმენით კერძო, საკუთარ მანქანაზე განთავსებული Texas Hold’em სერვერი PokerTH-ის გამოყოფილი სერვერითა და PokerTH-ის ვებ-კლიენტით.",
    "h1": "დააჰოსტეთ საკუთარი პოკერის სერვერი",
    "lead": "PokerTH თავიდან ბოლომდე უფასო და ღია კოდისაა: სათამაშო სერვერი და ეს ვებ-კლიენტი შეიძლება თქვენს საკუთარ მანქანაზე მუშაობდეს. საოჯახო თამაშისთვის, კლუბის საღამოსთვის, საოფისე ლიგისთვის ან სკოლისთვის საკმარისია კომპიუტერი, სახლის სერვერი ან Raspberry Pi, და ამის შემდეგ თქვენს ქსელში ყოველი ტელეფონი, პლანშეტი თუ კომპიუტერი ბრაუზერში მხოლოდ მეტსახელით თამაშობს.",
    "whyH2": "რატომ საკუთარი სერვერი",
    "why": [
      [
        "კერძო",
        "თქვენი თამაშები თქვენს მანქანასა და ქსელში რჩება; მოთამაშეებს არც ანგარიში სჭირდებათ, არც ელფოსტის მისამართი, მხოლოდ მეტსახელი."
      ],
      [
        "თქვენი გემოვნებით",
        "დაარქვით სერვერს საკუთარი სახელი, აირჩიეთ, რომელ რეჟიმებს შესთავაზებს შესვლის ეკრანი, გამოაქვეყნეთ მისასალმებელი შეტყობინება და აწარმოეთ საერთო ლიდერბორდი თქვენი ჯგუფისთვის."
      ],
      [
        "უფასო",
        "არც ლიცენზია, არც გამოწერა, არც რეკლამა: PokerTH-ის სერვერიც და ვებ-კლიენტიც თავისუფალი პროგრამული უზრუნველყოფაა."
      ]
    ],
    "partsH2": "ორი ნაწილი",
    "partsP": "PokerTH-ის თამაშს სჭირდება PokerTH-ის გამოყოფილი სერვერი, რომელიც კარტს არიგებს და მაგიდებს მართავს, და ვებ-კლიენტი, რომელიც ბრაუზერებს აპს აწვდის და მათ ამ სერვერთან აკავშირებს. ორივე შეიძლება ერთსა და იმავე მანქანაზე მუშაობდეს. ყველაფერი თავსებადი რჩება: PokerTH-ის აპები — QML-კლიენტი Windows-ის, macOS-ის, Linux-ისა და Android-ისთვის და კლასიკური widget-კლიენტი დესკტოპისთვის — იმავე სერვერს უკავშირდება, რომელსაც ბრაუზერები, ასე რომ ერთ მაგიდასთან ბრაუზერისა და აპის მოთამაშეები შეიძლება ერთად ისხდნენ.",
    "stepsH2": "დაყენება სამ ნაბიჯად",
    "steps": [
      [
        "დააყენეთ PokerTH-ის სერვერი",
        "ააწყვეთ pokerth_dedicated_server PokerTH-ის საწყისი კოდიდან — ვერსია 2.1.10 ან უფრო ახალი — PokerTH პროექტის სერვერის სახელმძღვანელოს მიხედვით: საჭიროა Qt 6.7 ან უფრო ახალი, CMake და C++23 კომპილატორი. Linux დისტრიბუტივების pokerth-server პაკეტი ძველი ვერსიაა. სერვერი უსმენს TCP პორტს 7234."
      ],
      [
        "დააყენეთ ვებ-კლიენტი",
        "Debian-ზე, Ubuntu-ზე ან Raspberry Pi OS-ზე ინსტალაციის სკრიპტი ერთი ბრძანებით აყენებს Node.js-ს, ვებ-კლიენტს და სერვისს, რომელიც მანქანასთან ერთად ირთვება. Docker-ის მომხმარებლები ჩამოტვირთავენ მზა იმიჯს amd64, arm64 და armv7 არქიტექტურებისთვის, ხოლო CasaOS იმავე Compose ფაილს აპად შემოიტანს."
      ],
      [
        "ითამაშეთ",
        "თქვენი ქსელის ნებისმიერ მოწყობილობაზე გახსენით მანქანის მისამართი პორტზე 8080, აირჩიეთ LAN / გამოყოფილი სერვერი, შეიყვანეთ მეტსახელი და შექმენით მაგიდა. PokerTH-ის QML- ან widget-კლიენტის მქონე მოთამაშეები იმავე მანქანას პორტზე 7234 უკავშირდებიან და იმავე მაგიდებს უერთდებიან."
      ]
    ],
    "piH2": "Raspberry Pi-ზე",
    "piP": "PokerTH პატარა შეტყობინებებს ცვლის, ხოლო მთელ ხატვას მოთამაშეების მოწყობილობები აკეთებენ, ამიტომ Raspberry Pi სავსებით საკმარისია: Pi 4 2 GB მეხსიერებით ოპტიმალური არჩევანია, Pi 5 კი საჭიროზე მეტიცაა. მშვიდი საღამოსთვის ქსელი დაფაზე მნიშვნელოვანია — შეაერთეთ Pi როუტერთან კაბელით და მოთამაშეებისთვის გამოიყენეთ კარგი Wi-Fi წვდომის წერტილი.",
    "httpsH2": "HTTP LAN-ში, HTTPS დამატებითი ფუნქციებისთვის",
    "httpsP": "საკუთარ ქსელში თამაში უბრალო HTTP-ით მუშაობს. აპის მთავარ ეკრანზე დაყენებას, ოფლაინ თამაშსა და შეტყობინებების მიღებას HTTPS სჭირდება, რომელსაც სახელმძღვანელო აწყობს Nginx-ით და უფასო Let’s Encrypt სერტიფიკატით.",
    "adminH2": "ადმინისტრატორის პანელი ბრაუზერში",
    "adminP": "ტოკენით დაცული კონსოლი /admin მისამართზე აჩვენებს, ვინ არის დაკავშირებული, ერთი დაწკაპუნებით აახლებს ვებ-კლიენტს და შეუძლია წინა ვერსიაზე დაბრუნება, მოთამაშეებს უგზავნის განცხადებებს, ანულებს ლიდერბორდს, აყენებს კარტის დასტებს, მაგიდის სტილებსა და მუსიკას, ჩამოთვლის სათამაშო სერვერებს, რომლებთანაც კლიენტს წვდომა აქვს, და გასცემს გასაღებებს, რომლებიც მისი მხოლოდ ზოგიერთი განყოფილების გახსნის საშუალებას იძლევა.",
    "shareH2": "მოიწვიეთ მოთამაშეები გარედან",
    "shareP": "მოწვევის ბმულები და QR კოდები თქვენს სერვერზე ზუსტად ისე მუშაობს, როგორც pokerth.net-ზე: მეგობარი ხსნის ბმულს და ჯდება თქვენს მაგიდასთან. თუ თქვენი სერვერი ინტერნეტიდან ხელმისაწვდომია, შეგიძლიათ ის ვებ-კლიენტის საჯარო სერვერების სიისთვისაც შესთავაზოთ; ის იქ გამოჩნდება, როგორც კი ვებ-კლიენტის ადმინისტრატორები მას დაამტკიცებენ.",
    "guidesH2": "ნაბიჯ-ნაბიჯ სახელმძღვანელოები",
    "guides": [
      "PokerTH-ის სერვერის დაყენების სახელმძღვანელო",
      "თვითჰოსტინგი და ინსტალაცია ერთი ბრძანებით",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "ხელით ინსტალაცია და HTTPS",
      "ადმინისტრატორის პანელი"
    ],
    "faqH2": "კითხვები",
    "faq": [
      [
        "უფასოა თუ არა PokerTH-ის სერვერის ჰოსტინგი?",
        "დიახ. PokerTH-ის სერვერი და ვებ-კლიენტი უფასო და ღია კოდის პროგრამებია; მხოლოდ მანქანა გჭირდებათ მათ გასაშვებად."
      ],
      [
        "რა აპარატურა მჭირდება?",
        "ძალიან ცოტა: ნებისმიერი კომპიუტერი ან სახლის სერვერი Linux-ით ან Docker-ით, ან Raspberry Pi 4 ან 5. სადენიანი ქსელური კავშირი გამოთვლით სიმძლავრეზე მნიშვნელოვანია."
      ],
      [
        "სჭირდებათ თუ არა მოთამაშეებს რაიმეს დაყენება?",
        "არა. ისინი სერვერის მისამართს ხსნიან ტელეფონის, პლანშეტის ან კომპიუტერის ბრაუზერში. ვისაც აპი ურჩევნია, შეუძლია გამოიყენოს PokerTH-ის QML-კლიენტი ან კლასიკური widget-კლიენტი: ისინი იმავე სერვერს უკავშირდებიან და იმავე მაგიდებთან თამაშობენ."
      ],
      [
        "სჭირდება თუ არა pokerth.net ან ინტერნეტ-კავშირი?",
        "არა. ლოკალურ ქსელში მდგომი სერვერი დამოუკიდებლად მუშაობს: მოთამაშეები მას პირდაპირ უკავშირდებიან, მხოლოდ მეტსახელით."
      ],
      [
        "რამდენ მოთამაშეს შეუძლია შემოსვლა?",
        "ერთ მაგიდაზე 10 მოთამაშემდე, პლუს მაყურებლები, და იმდენი მაგიდა, რამდენიც თქვენს ჯგუფს სჭირდება."
      ]
    ]
  },
  kk: {
    "title": "Өз покер серверіңізді орнатыңыз — тегін, өз құрылғыңызда | PokerTH",
    "desc": "Үйде, клубта немесе мектепте жеке Texas Hold’em сервері: тегін PokerTH сервері мен веб-клиенті бір командамен, Docker арқылы немесе Raspberry Pi-да орнатылады.",
    "ldHeadline": "Өз PokerTH покер серверіңізді қалай орнатуға болады",
    "ldDesc": "PokerTH арнайы сервері мен PokerTH веб-клиенті арқылы өз құрылғыңызда жеке Texas Hold’em серверін іске қосыңыз.",
    "h1": "Өз покер серверіңізді орнатыңыз",
    "lead": "PokerTH басынан аяғына дейін тегін әрі ашық бастапқы кодты: ойын сервері де, осы веб-клиент те өз құрылғыңызда жұмыс істей алады. Отбасылық ойынға, клуб кешіне, кеңсе лигасына немесе мектепке ДК, үй сервері не Raspberry Pi жеткілікті, ал содан кейін желіңіздегі әр телефон, планшет не компьютер тек лақап атпен өз браузерінде ойнайды.",
    "whyH2": "Неліктен өз серверіңіз",
    "why": [
      [
        "Жеке",
        "Ойындарыңыз өз құрылғыңыз бен желіңізде қалады; ойыншыларға тіркелгі де, электрондық пошта мекенжайы да керек емес, тек лақап ат жеткілікті."
      ],
      [
        "Өзіңізге бейімдеп",
        "Серверге өз атауын беріңіз, кіру экраны қандай режимдерді ұсынатынын таңдаңыз, сәлемдесу хабарын жариялаңыз және тобыңыз үшін ортақ рейтинг жүргізіңіз."
      ],
      [
        "Тегін",
        "Лицензия да, жазылым да, жарнама да жоқ: PokerTH сервері де, веб-клиент те — еркін бағдарламалар."
      ]
    ],
    "partsH2": "Екі бөлік",
    "partsP": "PokerTH ойынына карталарды таратып, үстелдерді басқаратын PokerTH арнайы сервері және қолданбаны браузерлерге беріп, оларды сол серверге қосатын веб-клиент қажет. Екеуі бір құрылғыда жұмыс істей алады. Бәрі үйлесімді болып қалады: PokerTH қолданбалары — Windows, macOS, Linux және Android жүйелеріндегі QML клиенті мен компьютерге арналған классикалық widget клиенті — браузерлер қосылатын сол серверге қосылады, сондықтан бір үстелде браузердегі және қолданбадағы ойыншылар бірге ойнай алады.",
    "stepsH2": "Үш қадаммен орнату",
    "steps": [
      [
        "PokerTH серверін орнатыңыз",
        "pokerth_dedicated_server бағдарламасын PokerTH бастапқы кодынан — 2.1.10 немесе одан кейінгі нұсқа — PokerTH жобасының сервер нұсқаулығы бойынша құрастырыңыз: оған Qt 6.7 немесе жаңарақ, CMake және C++23 компиляторы қажет. Linux дистрибутивтеріндегі pokerth-server пакеті — ескі нұсқа. Сервер 7234 TCP портын тыңдайды."
      ],
      [
        "Веб-клиентті орнатыңыз",
        "Debian, Ubuntu немесе Raspberry Pi OS жүйесінде орнату скрипті Node.js-ті, веб-клиентті және құрылғымен бірге іске қосылатын қызметті бір командамен орнатады. Docker пайдаланушылары amd64, arm64 және armv7 үшін дайын бейнені жүктеп алады, ал CasaOS сол Compose файлын қолданба ретінде импорттайды."
      ],
      [
        "Ойнаңыз",
        "Желіңіздегі кез келген құрылғыда сервер компьютерінің мекенжайын 8080 портында ашып, LAN / Арнайы сервер режимін таңдаңыз, лақап ат енгізіп, үстел құрыңыз. PokerTH QML немесе widget клиенті бар ойыншылар сол сервер компьютеріне 7234 портында қосылып, сол үстелдерге кіреді."
      ]
    ],
    "piH2": "Raspberry Pi-да",
    "piP": "PokerTH шағын хабарлар ғана алмасады, ал барлық сызуды ойыншылардың құрылғылары атқарады, сондықтан Raspberry Pi әбден жеткілікті: 2 ГБ жады бар Pi 4 — ең оңтайлы таңдау, Pi 5 — артығымен жетеді. Кеш кедергісіз өтуі үшін тақтадан гөрі желі маңыздырақ — Pi-ды маршрутизаторға кабельмен қосып, ойыншылар үшін жақсы Wi-Fi кіру нүктесін пайдаланыңыз.",
    "httpsH2": "Жергілікті желіде HTTP, қосымша мүмкіндіктерге HTTPS",
    "httpsP": "Өз желіңізде ойын қарапайым HTTP арқылы жұмыс істейді. Қолданбаны басты экранға орнату, офлайн ойнау және хабарландырулар алу үшін HTTPS қажет, оны нұсқаулық Nginx пен тегін Let’s Encrypt сертификаты арқылы баптайды.",
    "adminH2": "Браузердегі әкімші панелі",
    "adminP": "/admin мекенжайындағы токенмен қорғалған консоль кімнің қосылғанын көрсетеді, веб-клиентті бір шертумен жаңартып, қажет болса бұрынғы нұсқасына қайтарады, ойыншыларға хабарландырулар жібереді, рейтингті тазалайды, карта колодаларын, үстел стильдерін және музыканы орнатады, клиент қосыла алатын ойын серверлерін тізімдейді және оның тек кейбір бөлімдерін ашатын кілттер береді.",
    "shareH2": "Сырттан ойыншыларды шақырыңыз",
    "shareP": "Шақыру сілтемелері мен QR-кодтар сіздің серверіңізде де pokerth.net-тегідей жұмыс істейді: досыңыз сілтемені ашады да, үстеліңізге отырады. Серверіңізге интернеттен кіруге болатын болса, оны веб-клиенттің ашық серверлер тізіміне де ұсына аласыз; веб-клиент әкімшілері мақұлдағаннан кейін ол сол тізімде пайда болады.",
    "guidesH2": "Қадамдық нұсқаулықтар",
    "guides": [
      "PokerTH серверін орнату нұсқаулығы",
      "Өз серверіңіз және бір командамен орнату",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Қолмен орнату және HTTPS",
      "Әкімші панелі"
    ],
    "faqH2": "Сұрақтар",
    "faq": [
      [
        "PokerTH серверін орнату тегін бе?",
        "Иә. PokerTH сервері мен веб-клиент — тегін әрі ашық бастапқы кодты бағдарламалар; оларды іске қосу үшін тек құрылғы қажет."
      ],
      [
        "Қандай жабдық керек?",
        "Өте аз: Linux немесе Docker жұмыс істейтін кез келген ДК не үй сервері, немесе Raspberry Pi 4 не 5. Сымды желі қосылымы есептеу қуатынан маңыздырақ."
      ],
      [
        "Ойыншылар бірдеңе орнатуы керек пе?",
        "Жоқ. Олар сервер мекенжайын телефонындағы, планшетіндегі немесе компьютеріндегі браузерде ашады. Қолданбаны қалайтындар PokerTH QML клиентін немесе классикалық widget клиентін пайдалана алады: олар сол серверге қосылып, сол үстелдерде ойнайды."
      ],
      [
        "Ол үшін pokerth.net немесе интернет қосылымы керек пе?",
        "Жоқ. Жергілікті желідегі сервер дербес жұмыс істейді: ойыншылар оған тек лақап атпен тікелей қосылады."
      ],
      [
        "Қанша ойыншы қосыла алады?",
        "Бір үстелге 10 ойыншыға дейін, оған қоса көрермендер, ал үстелдер тобыңызға қанша керек болса, сонша болады."
      ]
    ]
  },
  km: {
    "title": "ម៉ាស៊ីនមេបៀផ្ទាល់ខ្លួន — ឥតគិតថ្លៃ បង្ហោះដោយខ្លួនឯង | PokerTH",
    "desc": "ម៉ាស៊ីនមេ Texas Hold’em ឯកជននៅផ្ទះ ក្នុងក្លឹប ឬសាលារៀន៖ ម៉ាស៊ីនមេ និងកម្មវិធីវេប PokerTH ឥតគិតថ្លៃ ដំឡើងដោយពាក្យបញ្ជាតែមួយ ជាមួយ Docker ឬលើ Raspberry Pi។",
    "ldHeadline": "របៀបបង្ហោះម៉ាស៊ីនមេបៀ PokerTH ផ្ទាល់ខ្លួនរបស់អ្នក",
    "ldDesc": "រៀបចំម៉ាស៊ីនមេ Texas Hold’em ឯកជន ដែលបង្ហោះដោយខ្លួនឯង ជាមួយម៉ាស៊ីនមេឯកទេស PokerTH និងកម្មវិធីវេប PokerTH។",
    "h1": "បង្កើតម៉ាស៊ីនមេបៀផ្ទាល់ខ្លួនរបស់អ្នក",
    "lead": "PokerTH ឥតគិតថ្លៃ និងជាកូដចំហទាំងស្រុង៖ ម៉ាស៊ីនមេហ្គេម និងកម្មវិធីវេបនេះ អាចដំណើរការលើម៉ាស៊ីនរបស់អ្នកផ្ទាល់។ កុំព្យូទ័រ ម៉ាស៊ីនមេនៅផ្ទះ ឬ Raspberry Pi មួយ គឺគ្រប់គ្រាន់សម្រាប់ហ្គេមគ្រួសារ រាត្រីក្លឹប លីគការិយាល័យ ឬសាលារៀន ហើយបន្ទាប់មក ទូរស័ព្ទ ថេប្លេត ឬកុំព្យូទ័រនីមួយៗលើបណ្ដាញរបស់អ្នក លេងក្នុងកម្មវិធីរុករករបស់វា ដោយគ្រាន់តែមានឈ្មោះមួយ។",
    "whyH2": "ហេតុអ្វីដំណើរការម៉ាស៊ីនមេផ្ទាល់ខ្លួន",
    "why": [
      [
        "ឯកជន",
        "ហ្គេមរបស់អ្នកនៅតែលើម៉ាស៊ីន និងបណ្ដាញរបស់អ្នក អ្នកលេងមិនត្រូវការគណនី ឬអាសយដ្ឋានអ៊ីមែលទេ គ្រាន់តែឈ្មោះមួយប៉ុណ្ណោះ។"
      ],
      [
        "កែតាមចិត្តអ្នក",
        "ដាក់ឈ្មោះផ្ទាល់ខ្លួនឱ្យម៉ាស៊ីនមេ ជ្រើសរើសរបៀបដែលអេក្រង់ចូលផ្ដល់ជូន ផ្សាយសារស្វាគមន៍ និងរក្សាតារាងចំណាត់ថ្នាក់រួមសម្រាប់ក្រុមរបស់អ្នក។"
      ],
      [
        "ឥតគិតថ្លៃ",
        "គ្មានអាជ្ញាប័ណ្ណ គ្មានការជាវ គ្មានការផ្សាយពាណិជ្ជកម្ម៖ ម៉ាស៊ីនមេ PokerTH និងកម្មវិធីវេប ទាំងពីរជាកម្មវិធីសេរី។"
      ]
    ],
    "partsH2": "ផ្នែកពីរ",
    "partsP": "ហ្គេម PokerTH ត្រូវការម៉ាស៊ីនមេឯកទេស PokerTH ដែលចែកបៀ និងគ្រប់គ្រងតុ និងកម្មវិធីវេប ដែលផ្ដល់កម្មវិធីទៅកម្មវិធីរុករក ហើយភ្ជាប់ពួកវាទៅម៉ាស៊ីនមេនោះ។ ពួកវាអាចដំណើរការលើម៉ាស៊ីនតែមួយ។ អ្វីៗទាំងអស់នៅតែត្រូវគ្នា៖ កម្មវិធី PokerTH ភ្ជាប់ទៅម៉ាស៊ីនមេដដែលនឹងកម្មវិធីរុករក — កម្មវិធី QML លើ Windows, macOS, Linux និង Android និងកម្មវិធី widget បុរាណសម្រាប់កុំព្យូទ័រ — ដូច្នេះអ្នកលេងតាមកម្មវិធីរុករក និងតាមកម្មវិធី អាចលេងរួមគ្នានៅតុតែមួយ។",
    "stepsH2": "រៀបចំក្នុងបីជំហាន",
    "steps": [
      [
        "ដំឡើងម៉ាស៊ីនមេ PokerTH",
        "សង់ pokerth_dedicated_server ពីកូដប្រភព PokerTH — កំណែ 2.1.10 ឬថ្មីជាងនេះ — ដោយធ្វើតាមមគ្គុទ្ទេសក៍ម៉ាស៊ីនមេរបស់គម្រោង PokerTH៖ វាត្រូវការ Qt 6.7 ឬថ្មីជាងនេះ CMake និងកម្មវិធីចងក្រង C++23។ កញ្ចប់ pokerth-server ក្នុងការចែកចាយ Linux នានា គឺជាកំណែចាស់ជាង។ ម៉ាស៊ីនមេស្ដាប់លើច្រក TCP 7234។"
      ],
      [
        "ដំឡើងកម្មវិធីវេប",
        "លើ Debian, Ubuntu ឬ Raspberry Pi OS ស្គ្រីបដំឡើងរៀបចំ Node.js កម្មវិធីវេប និងសេវាដែលចាប់ផ្ដើមជាមួយម៉ាស៊ីន ដោយពាក្យបញ្ជាតែមួយ។ អ្នកប្រើ Docker ទាញយករូបភាព (image) ដែលរៀបចំរួចសម្រាប់ amd64, arm64 និង armv7 ហើយ CasaOS នាំចូលឯកសារ Compose ដដែលជាកម្មវិធីមួយ។"
      ],
      [
        "លេង",
        "លើឧបករណ៍ណាមួយក្នុងបណ្ដាញរបស់អ្នក បើកអាសយដ្ឋានរបស់ម៉ាស៊ីននៅច្រក 8080 ជ្រើស “LAN / ម៉ាស៊ីនមេឯកទេស” វាយឈ្មោះមួយ ហើយបង្កើតតុ។ អ្នកលេងដែលប្រើកម្មវិធី QML ឬ widget របស់ PokerTH ភ្ជាប់ទៅម៉ាស៊ីនដដែលនៅច្រក 7234 ហើយចូលរួមតុដដែល។"
      ]
    ],
    "piH2": "លើ Raspberry Pi",
    "piP": "PokerTH ផ្លាស់ប្ដូរតែសារតូចៗ ហើយឧបករណ៍របស់អ្នកលេងធ្វើការគូររូបទាំងអស់ ដូច្នេះ Raspberry Pi គឺគ្រប់គ្រាន់ហើយ៖ Pi 4 ដែលមាន 2 GB ល្អបំផុត ហើយ Pi 5 គឺលើសពីគ្រប់គ្រាន់។ សម្រាប់រាត្រីដែលរលូន បណ្ដាញសំខាន់ជាងបន្ទះកុំព្យូទ័រ — ភ្ជាប់ Pi ទៅរ៉ោតទ័រដោយខ្សែ ហើយប្រើចំណុចចូលប្រើ Wi-Fi ល្អមួយសម្រាប់អ្នកលេង។",
    "httpsH2": "HTTP លើ LAN, HTTPS សម្រាប់មុខងារបន្ថែម",
    "httpsP": "លើបណ្ដាញផ្ទាល់ខ្លួនរបស់អ្នក ហ្គេមដំណើរការតាម HTTP ធម្មតា។ ការដំឡើងកម្មវិធីលើអេក្រង់ដើម ការលេងក្រៅបណ្ដាញ និងការទទួលការជូនដំណឹង ត្រូវការ HTTPS ដែលមគ្គុទ្ទេសក៍រៀបចំជាមួយ Nginx និងវិញ្ញាបនបត្រ Let’s Encrypt ឥតគិតថ្លៃ។",
    "adminH2": "ផ្ទាំងគ្រប់គ្រងក្នុងកម្មវិធីរុករក",
    "adminP": "កុងសូលដែលការពារដោយ token នៅ /admin បង្ហាញអ្នកដែលកំពុងភ្ជាប់ ធ្វើបច្ចុប្បន្នភាពកម្មវិធីវេបដោយចុចតែម្ដង ហើយអាចត្រឡប់ទៅកំណែមុនវិញ ផ្ញើសេចក្ដីប្រកាសទៅអ្នកលេង កំណត់តារាងចំណាត់ថ្នាក់ឡើងវិញ ដំឡើងហ្វូងបៀ រចនាប័ទ្មតុ និងតន្ត្រី រាយម៉ាស៊ីនមេហ្គេមដែលកម្មវិធីអាចភ្ជាប់ទៅបាន និងចែកសោដែលដោះសោតែផ្នែកខ្លះរបស់វាប៉ុណ្ណោះ។",
    "shareH2": "អញ្ជើញអ្នកលេងពីខាងក្រៅ",
    "shareP": "តំណអញ្ជើញ និងកូដ QR ដំណើរការលើម៉ាស៊ីនមេរបស់អ្នក ដូចនៅលើ pokerth.net ដែរ៖ មិត្តម្នាក់បើកតំណ ហើយត្រូវបានដាក់ឱ្យអង្គុយនៅតុរបស់អ្នក។ បើម៉ាស៊ីនមេរបស់អ្នកអាចចូលដំណើរការពីអ៊ីនធឺណិតបាន អ្នកក៏អាចស្នើវាសម្រាប់បញ្ជីម៉ាស៊ីនមេសាធារណៈរបស់កម្មវិធីវេបដែរ វានឹងបង្ហាញនៅទីនោះ នៅពេលអ្នកគ្រប់គ្រងកម្មវិធីវេបយល់ព្រម។",
    "guidesH2": "មគ្គុទ្ទេសក៍មួយជំហានម្ដងៗ",
    "guides": [
      "មគ្គុទ្ទេសក៍រៀបចំម៉ាស៊ីនមេ PokerTH",
      "ការបង្ហោះដោយខ្លួនឯង និងការដំឡើងដោយពាក្យបញ្ជាតែមួយ",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "ការដំឡើងដោយដៃ និង HTTPS",
      "ផ្ទាំងគ្រប់គ្រង"
    ],
    "faqH2": "សំណួរ",
    "faq": [
      [
        "តើការបង្ហោះម៉ាស៊ីនមេ PokerTH ឥតគិតថ្លៃទេ?",
        "ពិតមែន។ ម៉ាស៊ីនមេ PokerTH និងកម្មវិធីវេប ជាកម្មវិធីឥតគិតថ្លៃ និងកូដចំហ អ្នកគ្រាន់តែត្រូវការម៉ាស៊ីនមួយដើម្បីដំណើរការពួកវា។"
      ],
      [
        "តើខ្ញុំត្រូវការផ្នែករឹងអ្វីខ្លះ?",
        "តិចតួចណាស់៖ កុំព្យូទ័រ ឬម៉ាស៊ីនមេនៅផ្ទះណាមួយដែលដំណើរការ Linux ឬ Docker ឬ Raspberry Pi 4 ឬ 5។ ការតភ្ជាប់បណ្ដាញតាមខ្សែ សំខាន់ជាងថាមពលដំណើរការ។"
      ],
      [
        "តើអ្នកលេងត្រូវដំឡើងអ្វីទេ?",
        "ទេ។ ពួកគេបើកអាសយដ្ឋានរបស់ម៉ាស៊ីនមេក្នុងកម្មវិធីរុករកលើទូរស័ព្ទ ថេប្លេត ឬកុំព្យូទ័ររបស់ពួកគេ។ អ្នកដែលចូលចិត្តកម្មវិធី អាចប្រើកម្មវិធី QML របស់ PokerTH ឬកម្មវិធី widget បុរាណ៖ ពួកវាភ្ជាប់ទៅម៉ាស៊ីនមេដដែល ហើយលេងនៅតុដដែល។"
      ],
      [
        "តើវាត្រូវការ pokerth.net ឬការតភ្ជាប់អ៊ីនធឺណិតទេ?",
        "ទេ។ ម៉ាស៊ីនមេលើបណ្ដាញមូលដ្ឋានរបស់អ្នកដំណើរការដោយខ្លួនឯង៖ អ្នកលេងភ្ជាប់ទៅវាដោយផ្ទាល់ ដោយគ្រាន់តែមានឈ្មោះមួយ។"
      ],
      [
        "តើអ្នកលេងប៉ុន្មាននាក់អាចចូលរួមបាន?",
        "រហូតដល់ 10 នាក់ក្នុងមួយតុ បូកនឹងអ្នកមើល និងតុច្រើនតាមដែលក្រុមរបស់អ្នកត្រូវការ។"
      ]
    ]
  },
  kn: {
    "title": "ನಿಮ್ಮದೇ ಪೋಕರ್ ಸರ್ವರ್ ಹೋಸ್ಟ್ ಮಾಡಿ — ಉಚಿತ, ಸೆಲ್ಫ್-ಹೋಸ್ಟೆಡ್ | PokerTH",
    "desc": "ಮನೆಯಲ್ಲಿ, ಕ್ಲಬ್‌ನಲ್ಲಿ ಅಥವಾ ಶಾಲೆಯಲ್ಲಿ ಖಾಸಗಿ Texas Hold’em ಸರ್ವರ್: ಉಚಿತ PokerTH ಸರ್ವರ್ ಮತ್ತು ವೆಬ್ ಕ್ಲೈಂಟ್, ಒಂದೇ ಕಮಾಂಡ್‌ನಲ್ಲಿ, Docker ಮೂಲಕ ಅಥವಾ Raspberry Pi ಮೇಲೆ ಸಿದ್ಧ.",
    "ldHeadline": "ನಿಮ್ಮದೇ PokerTH ಪೋಕರ್ ಸರ್ವರ್ ಅನ್ನು ಹೋಸ್ಟ್ ಮಾಡುವುದು ಹೇಗೆ",
    "ldDesc": "PokerTH ಡೆಡಿಕೇಟೆಡ್ ಸರ್ವರ್ ಮತ್ತು PokerTH ವೆಬ್ ಕ್ಲೈಂಟ್‌ನೊಂದಿಗೆ ಖಾಸಗಿ, ಸೆಲ್ಫ್-ಹೋಸ್ಟೆಡ್ Texas Hold’em ಸರ್ವರ್ ಸಿದ್ಧಪಡಿಸಿ.",
    "h1": "ನಿಮ್ಮದೇ ಪೋಕರ್ ಸರ್ವರ್ ಹೋಸ್ಟ್ ಮಾಡಿ",
    "lead": "PokerTH ಆರಂಭದಿಂದ ಕೊನೆಯವರೆಗೆ ಉಚಿತ ಮತ್ತು ಓಪನ್ ಸೋರ್ಸ್: ಗೇಮ್ ಸರ್ವರ್ ಮತ್ತು ಈ ವೆಬ್ ಕ್ಲೈಂಟ್ ನಿಮ್ಮದೇ ಯಂತ್ರದಲ್ಲಿ ಚಲಿಸಬಹುದು. ಕುಟುಂಬದ ಆಟ, ಕ್ಲಬ್ ರಾತ್ರಿ, ಕಚೇರಿ ಲೀಗ್ ಅಥವಾ ಶಾಲೆಗೆ ಒಂದು PC, ಹೋಮ್ ಸರ್ವರ್ ಅಥವಾ Raspberry Pi ಸಾಕು, ನಂತರ ನಿಮ್ಮ ನೆಟ್‌ವರ್ಕ್‌ನಲ್ಲಿರುವ ಪ್ರತಿಯೊಂದು ಫೋನ್, ಟ್ಯಾಬ್ಲೆಟ್ ಅಥವಾ ಕಂಪ್ಯೂಟರ್ ಕೇವಲ ಒಂದು ಅಡ್ಡಹೆಸರಿನೊಂದಿಗೆ ತನ್ನ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಆಡುತ್ತದೆ.",
    "whyH2": "ನಿಮ್ಮದೇ ಸರ್ವರ್ ಏಕೆ",
    "why": [
      [
        "ಖಾಸಗಿ",
        "ನಿಮ್ಮ ಆಟಗಳು ನಿಮ್ಮ ಯಂತ್ರ ಮತ್ತು ನಿಮ್ಮ ನೆಟ್‌ವರ್ಕ್‌ನಲ್ಲೇ ಉಳಿಯುತ್ತವೆ; ಆಟಗಾರರಿಗೆ ಖಾತೆಯಾಗಲಿ ಇಮೇಲ್ ವಿಳಾಸವಾಗಲಿ ಬೇಡ, ಕೇವಲ ಒಂದು ಅಡ್ಡಹೆಸರು ಸಾಕು."
      ],
      [
        "ನಿಮಗೆ ಬೇಕಾದಂತೆ",
        "ಸರ್ವರ್‌ಗೆ ತನ್ನದೇ ಹೆಸರು ನೀಡಿ, ಲಾಗಿನ್ ಪರದೆ ಯಾವ ಮೋಡ್‌ಗಳನ್ನು ತೋರಿಸಬೇಕು ಎಂದು ಆರಿಸಿ, ಸ್ವಾಗತ ಸಂದೇಶ ಹಾಕಿ, ಮತ್ತು ನಿಮ್ಮ ಗುಂಪಿಗಾಗಿ ಹಂಚಿಕೊಂಡ ಲೀಡರ್‌ಬೋರ್ಡ್ ಇಟ್ಟುಕೊಳ್ಳಿ."
      ],
      [
        "ಉಚಿತ",
        "ಲೈಸೆನ್ಸ್ ಇಲ್ಲ, ಚಂದಾದಾರಿಕೆ ಇಲ್ಲ, ಜಾಹೀರಾತುಗಳಿಲ್ಲ: PokerTH ಸರ್ವರ್ ಮತ್ತು ವೆಬ್ ಕ್ಲೈಂಟ್ ಎರಡೂ ಮುಕ್ತ ತಂತ್ರಾಂಶ."
      ]
    ],
    "partsH2": "ಎರಡು ಭಾಗಗಳು",
    "partsP": "PokerTH ಆಟಕ್ಕೆ ಕಾರ್ಡ್‌ಗಳನ್ನು ಹಂಚಿ ಟೇಬಲ್‌ಗಳನ್ನು ನಡೆಸುವ PokerTH ಡೆಡಿಕೇಟೆಡ್ ಸರ್ವರ್ ಮತ್ತು ಬ್ರೌಸರ್‌ಗಳಿಗೆ ಆ್ಯಪ್ ಒದಗಿಸಿ ಅವುಗಳನ್ನು ಆ ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸುವ ವೆಬ್ ಕ್ಲೈಂಟ್ ಬೇಕು. ಎರಡೂ ಒಂದೇ ಯಂತ್ರದಲ್ಲಿ ಚಲಿಸಬಹುದು. ಎಲ್ಲವೂ ಹೊಂದಾಣಿಕೆಯಾಗಿಯೇ ಉಳಿಯುತ್ತದೆ: PokerTH ಆ್ಯಪ್‌ಗಳು — Windows, macOS, Linux ಮತ್ತು Android ನಲ್ಲಿನ QML ಕ್ಲೈಂಟ್ ಮತ್ತು ಡೆಸ್ಕ್‌ಟಾಪ್‌ನಲ್ಲಿನ ಕ್ಲಾಸಿಕ್ widget ಕ್ಲೈಂಟ್ — ಬ್ರೌಸರ್‌ಗಳು ಸಂಪರ್ಕಿಸುವ ಅದೇ ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸುತ್ತವೆ, ಆದ್ದರಿಂದ ಆಟಗಾರರು ಒಂದೇ ಟೇಬಲ್‌ನಲ್ಲಿ ಬ್ರೌಸರ್‌ಗಳು ಮತ್ತು ಆ್ಯಪ್‌ಗಳನ್ನು ಬೆರೆಸಬಹುದು.",
    "stepsH2": "ಮೂರು ಹಂತಗಳಲ್ಲಿ ಸಿದ್ಧಪಡಿಸಿ",
    "steps": [
      [
        "PokerTH ಸರ್ವರ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ",
        "PokerTH ಪ್ರಾಜೆಕ್ಟ್‌ನ ಸರ್ವರ್ ಮಾರ್ಗದರ್ಶಿಯನ್ನು ಅನುಸರಿಸಿ, PokerTH ಸೋರ್ಸ್‌ನಿಂದ pokerth_dedicated_server ಅನ್ನು ಬಿಲ್ಡ್ ಮಾಡಿ — ಆವೃತ್ತಿ 2.1.10 ಅಥವಾ ನಂತರದ್ದು: ಇದಕ್ಕೆ Qt 6.7 ಅಥವಾ ಹೊಸದು, CMake ಮತ್ತು C++23 ಕಂಪೈಲರ್ ಬೇಕು. Linux ವಿತರಣೆಗಳ pokerth-server ಪ್ಯಾಕೇಜ್ ಹಳೆಯ ಆವೃತ್ತಿಯಾಗಿದೆ. ಸರ್ವರ್ TCP ಪೋರ್ಟ್ 7234 ನಲ್ಲಿ ಆಲಿಸುತ್ತದೆ."
      ],
      [
        "ವೆಬ್ ಕ್ಲೈಂಟ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ",
        "Debian, Ubuntu ಅಥವಾ Raspberry Pi OS ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲೇಶನ್ ಸ್ಕ್ರಿಪ್ಟ್ ಒಂದೇ ಕಮಾಂಡ್‌ನಲ್ಲಿ Node.js, ವೆಬ್ ಕ್ಲೈಂಟ್ ಮತ್ತು ಯಂತ್ರದೊಂದಿಗೆ ಆರಂಭವಾಗುವ ಸರ್ವೀಸ್ ಅನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತದೆ. Docker ಬಳಕೆದಾರರು amd64, arm64 ಮತ್ತು armv7 ಗಾಗಿ ಸಿದ್ಧ ಇಮೇಜ್ ಅನ್ನು ಪುಲ್ ಮಾಡುತ್ತಾರೆ, ಮತ್ತು CasaOS ಅದೇ Compose ಫೈಲ್ ಅನ್ನು ಆ್ಯಪ್ ಆಗಿ ಇಂಪೋರ್ಟ್ ಮಾಡುತ್ತದೆ."
      ],
      [
        "ಆಡಿ",
        "ನಿಮ್ಮ ನೆಟ್‌ವರ್ಕ್‌ನ ಯಾವುದೇ ಸಾಧನದಲ್ಲಿ ಆ ಯಂತ್ರದ ವಿಳಾಸವನ್ನು ಪೋರ್ಟ್ 8080 ನಲ್ಲಿ ತೆರೆಯಿರಿ, “LAN / ಡೆಡಿಕೇಟೆಡ್ ಸರ್ವರ್” ಆರಿಸಿ, ಒಂದು ಅಡ್ಡಹೆಸರು ಟೈಪ್ ಮಾಡಿ ಮತ್ತು ಟೇಬಲ್ ರಚಿಸಿ. PokerTH QML ಅಥವಾ widget ಕ್ಲೈಂಟ್ ಹೊಂದಿರುವ ಆಟಗಾರರು ಅದೇ ಯಂತ್ರಕ್ಕೆ ಪೋರ್ಟ್ 7234 ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ ಅದೇ ಟೇಬಲ್‌ಗಳಿಗೆ ಸೇರುತ್ತಾರೆ."
      ]
    ],
    "piH2": "Raspberry Pi ಮೇಲೆ",
    "piP": "PokerTH ಸಣ್ಣ ಸಂದೇಶಗಳನ್ನು ವಿನಿಮಯ ಮಾಡುತ್ತದೆ ಮತ್ತು ಎಲ್ಲ ಚಿತ್ರಣವನ್ನೂ ಆಟಗಾರರ ಸಾಧನಗಳೇ ಮಾಡುತ್ತವೆ, ಆದ್ದರಿಂದ Raspberry Pi ಧಾರಾಳವಾಗಿ ಸಾಕು: 2 GB ಇರುವ Pi 4 ಅತ್ಯುತ್ತಮ ಆಯ್ಕೆ, Pi 5 ಅಗತ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚೇ. ಸುಗಮ ಸಂಜೆಗೆ ಬೋರ್ಡ್‌ಗಿಂತ ನೆಟ್‌ವರ್ಕ್ ಮುಖ್ಯ — Pi ಅನ್ನು ಕೇಬಲ್ ಮೂಲಕ ರೂಟರ್‌ಗೆ ಸಂಪರ್ಕಿಸಿ, ಮತ್ತು ಆಟಗಾರರಿಗಾಗಿ ಉತ್ತಮ Wi-Fi ಆಕ್ಸೆಸ್ ಪಾಯಿಂಟ್ ಬಳಸಿ.",
    "httpsH2": "LAN ನಲ್ಲಿ HTTP, ಹೆಚ್ಚುವರಿ ಸೌಲಭ್ಯಗಳಿಗೆ HTTPS",
    "httpsP": "ನಿಮ್ಮದೇ ನೆಟ್‌ವರ್ಕ್‌ನಲ್ಲಿ ಆಟ ಸಾಮಾನ್ಯ HTTP ಮೇಲೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ. ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲು, ಆಫ್‌ಲೈನ್ ಆಡಲು ಮತ್ತು ಅಧಿಸೂಚನೆಗಳನ್ನು ಪಡೆಯಲು HTTPS ಬೇಕು; ಮಾರ್ಗದರ್ಶಿ ಅದನ್ನು Nginx ಮತ್ತು ಉಚಿತ Let’s Encrypt ಪ್ರಮಾಣಪತ್ರದೊಂದಿಗೆ ಸಿದ್ಧಪಡಿಸುತ್ತದೆ.",
    "adminH2": "ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಅಡ್ಮಿನ್ ಪ್ಯಾನೆಲ್",
    "adminP": "/admin ನಲ್ಲಿರುವ ಟೋಕನ್-ರಕ್ಷಿತ ಕನ್ಸೋಲ್ ಯಾರು ಸಂಪರ್ಕದಲ್ಲಿದ್ದಾರೆ ಎಂದು ತೋರಿಸುತ್ತದೆ, ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ವೆಬ್ ಕ್ಲೈಂಟ್ ಅನ್ನು ಅಪ್‌ಡೇಟ್ ಮಾಡುತ್ತದೆ ಮತ್ತು ಹಿಂದಿನ ಆವೃತ್ತಿಗೆ ಮರಳಿಸಬಲ್ಲದು, ಆಟಗಾರರಿಗೆ ಪ್ರಕಟಣೆಗಳನ್ನು ಕಳುಹಿಸುತ್ತದೆ, ಲೀಡರ್‌ಬೋರ್ಡ್ ಅನ್ನು ರೀಸೆಟ್ ಮಾಡುತ್ತದೆ, ಕಾರ್ಡ್ ಡೆಕ್‌ಗಳು, ಟೇಬಲ್ ಶೈಲಿಗಳು ಮತ್ತು ಸಂಗೀತವನ್ನು ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುತ್ತದೆ, ಕ್ಲೈಂಟ್ ತಲುಪಬಹುದಾದ ಗೇಮ್ ಸರ್ವರ್‌ಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡುತ್ತದೆ, ಮತ್ತು ಅದರ ಕೆಲವು ವಿಭಾಗಗಳನ್ನು ಮಾತ್ರ ತೆರೆಯುವ ಕೀಗಳನ್ನು ವಿತರಿಸುತ್ತದೆ.",
    "shareH2": "ಹೊರಗಿನ ಆಟಗಾರರನ್ನು ಆಹ್ವಾನಿಸಿ",
    "shareP": "ಆಹ್ವಾನ ಲಿಂಕ್‌ಗಳು ಮತ್ತು QR ಕೋಡ್‌ಗಳು ನಿಮ್ಮ ಸರ್ವರ್‌ನಲ್ಲಿಯೂ pokerth.net ನಲ್ಲಿರುವಂತೆಯೇ ಕೆಲಸ ಮಾಡುತ್ತವೆ: ಸ್ನೇಹಿತರು ಲಿಂಕ್ ತೆರೆದರೆ ನಿಮ್ಮ ಟೇಬಲ್‌ನಲ್ಲಿ ಕೂರುತ್ತಾರೆ. ನಿಮ್ಮ ಸರ್ವರ್ ಇಂಟರ್ನೆಟ್‌ನಿಂದ ತಲುಪುವಂತಿದ್ದರೆ, ವೆಬ್ ಕ್ಲೈಂಟ್‌ನ ಸಾರ್ವಜನಿಕ ಸರ್ವರ್ ಪಟ್ಟಿಗೆ ಅದನ್ನು ಪ್ರಸ್ತಾಪಿಸಲೂಬಹುದು; ವೆಬ್ ಕ್ಲೈಂಟ್‌ನ ಅಡ್ಮಿನ್‌ಗಳು ಅನುಮೋದಿಸಿದ ಕೂಡಲೇ ಅದು ಅಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.",
    "guidesH2": "ಹಂತ ಹಂತದ ಮಾರ್ಗದರ್ಶಿಗಳು",
    "guides": [
      "PokerTH ಸರ್ವರ್ ಸೆಟಪ್ ಮಾರ್ಗದರ್ಶಿ",
      "ಸೆಲ್ಫ್-ಹೋಸ್ಟಿಂಗ್ ಮತ್ತು ಒಂದೇ ಕಮಾಂಡ್‌ನ ಇನ್‌ಸ್ಟಾಲ್",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "ಮ್ಯಾನುವಲ್ ಇನ್‌ಸ್ಟಾಲೇಶನ್ ಮತ್ತು HTTPS",
      "ಅಡ್ಮಿನ್ ಪ್ಯಾನೆಲ್"
    ],
    "faqH2": "ಪ್ರಶ್ನೆಗಳು",
    "faq": [
      [
        "PokerTH ಸರ್ವರ್ ಹೋಸ್ಟ್ ಮಾಡುವುದು ಉಚಿತವೇ?",
        "ಹೌದು. PokerTH ಸರ್ವರ್ ಮತ್ತು ವೆಬ್ ಕ್ಲೈಂಟ್ ಉಚಿತ ಮತ್ತು ಓಪನ್ ಸೋರ್ಸ್ ತಂತ್ರಾಂಶ; ಅವುಗಳನ್ನು ಚಲಾಯಿಸಲು ನಿಮಗೆ ಒಂದು ಯಂತ್ರ ಮಾತ್ರ ಬೇಕು."
      ],
      [
        "ನನಗೆ ಯಾವ ಹಾರ್ಡ್‌ವೇರ್ ಬೇಕು?",
        "ತುಂಬಾ ಕಡಿಮೆ: Linux ಅಥವಾ Docker ಚಲಾಯಿಸುವ ಯಾವುದೇ PC ಅಥವಾ ಹೋಮ್ ಸರ್ವರ್, ಅಥವಾ Raspberry Pi 4 ಅಥವಾ 5. ಸಂಸ್ಕರಣಾ ಶಕ್ತಿಗಿಂತ ವೈರ್ಡ್ ನೆಟ್‌ವರ್ಕ್ ಸಂಪರ್ಕ ಹೆಚ್ಚು ಮುಖ್ಯ."
      ],
      [
        "ಆಟಗಾರರು ಏನನ್ನಾದರೂ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಬೇಕೇ?",
        "ಇಲ್ಲ. ಅವರು ತಮ್ಮ ಫೋನ್, ಟ್ಯಾಬ್ಲೆಟ್ ಅಥವಾ ಕಂಪ್ಯೂಟರ್‌ನ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸರ್ವರ್‌ನ ವಿಳಾಸ ತೆರೆಯುತ್ತಾರೆ. ಆ್ಯಪ್ ಇಷ್ಟಪಡುವವರು PokerTH QML ಕ್ಲೈಂಟ್ ಅಥವಾ ಕ್ಲಾಸಿಕ್ widget ಕ್ಲೈಂಟ್ ಬಳಸಬಹುದು: ಅವರು ಅದೇ ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಿ ಅದೇ ಟೇಬಲ್‌ಗಳಲ್ಲಿ ಆಡುತ್ತಾರೆ."
      ],
      [
        "ಇದಕ್ಕೆ pokerth.net ಅಥವಾ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಬೇಕೇ?",
        "ಇಲ್ಲ. ನಿಮ್ಮ ಲೋಕಲ್ ನೆಟ್‌ವರ್ಕ್‌ನಲ್ಲಿರುವ ಸರ್ವರ್ ಸ್ವತಂತ್ರವಾಗಿ ಚಲಿಸುತ್ತದೆ: ಆಟಗಾರರು ಕೇವಲ ಒಂದು ಅಡ್ಡಹೆಸರಿನೊಂದಿಗೆ ನೇರವಾಗಿ ಅದಕ್ಕೆ ಸಂಪರ್ಕಿಸುತ್ತಾರೆ."
      ],
      [
        "ಎಷ್ಟು ಆಟಗಾರರು ಸೇರಬಹುದು?",
        "ಪ್ರತಿ ಟೇಬಲ್‌ಗೆ 10 ಆಟಗಾರರವರೆಗೆ, ಜೊತೆಗೆ ವೀಕ್ಷಕರು, ಮತ್ತು ನಿಮ್ಮ ಗುಂಪಿಗೆ ಬೇಕಾದಷ್ಟು ಟೇಬಲ್‌ಗಳು."
      ]
    ]
  },
  ko: {
    "title": "나만의 포커 서버 호스팅 — 무료, 셀프 호스팅 | PokerTH",
    "desc": "집, 동호회, 학교에서 쓰는 비공개 Texas Hold’em 서버: 무료 PokerTH 서버와 웹 클라이언트를 명령 하나로, Docker로 또는 Raspberry Pi에 설치하세요.",
    "ldHeadline": "나만의 PokerTH 포커 서버를 호스팅하는 방법",
    "ldDesc": "PokerTH 전용 서버와 PokerTH 웹 클라이언트로 셀프 호스팅 비공개 Texas Hold’em 서버를 구축하세요.",
    "h1": "나만의 포커 서버 호스팅하기",
    "lead": "PokerTH는 처음부터 끝까지 무료 오픈 소스입니다. 게임 서버와 이 웹 클라이언트를 직접 가진 기기에서 실행할 수 있습니다. 가족 게임, 동호회 모임, 사내 리그, 학교에는 PC나 홈 서버, Raspberry Pi 하나면 충분하며, 그러면 네트워크의 모든 휴대폰, 태블릿, 컴퓨터가 닉네임만으로 브라우저에서 플레이합니다.",
    "whyH2": "직접 운영하는 이유",
    "why": [
      [
        "비공개",
        "게임은 내 기기와 내 네트워크 안에 머뭅니다. 플레이어는 계정도 이메일 주소도 필요 없이 닉네임만 있으면 됩니다."
      ],
      [
        "원하는 대로",
        "서버에 이름을 붙이고, 로그인 화면에서 제공할 모드를 고르고, 환영 메시지를 올리고, 그룹을 위한 공용 순위표를 운영하세요."
      ],
      [
        "무료",
        "라이선스도, 구독도, 광고도 없습니다. PokerTH 서버와 웹 클라이언트는 모두 자유 소프트웨어입니다."
      ]
    ],
    "partsH2": "두 가지 구성 요소",
    "partsP": "PokerTH 게임에는 카드를 돌리고 테이블을 운영하는 PokerTH 전용 서버와, 브라우저에 앱을 제공하고 그 서버에 연결해 주는 웹 클라이언트가 필요합니다. 둘은 같은 기기에서 실행할 수 있습니다. 모든 것이 그대로 호환됩니다. PokerTH 앱, 즉 Windows, macOS, Linux, Android용 QML 클라이언트와 데스크톱용 클래식 widget 클라이언트도 브라우저와 같은 서버에 접속하므로, 한 테이블에서 브라우저와 앱 플레이어가 함께 플레이할 수 있습니다.",
    "stepsH2": "세 단계로 설정하기",
    "steps": [
      [
        "PokerTH 서버 설치",
        "PokerTH 프로젝트의 서버 가이드에 따라 PokerTH 소스에서 pokerth_dedicated_server(버전 2.1.10 이상)를 빌드하세요. Qt 6.7 이상, CMake, C++23 컴파일러가 필요합니다. Linux 배포판의 pokerth-server 패키지는 이전 버전입니다. 서버는 TCP 포트 7234에서 대기합니다."
      ],
      [
        "웹 클라이언트 설치",
        "Debian, Ubuntu, Raspberry Pi OS에서는 설치 스크립트가 명령 하나로 Node.js, 웹 클라이언트, 그리고 기기와 함께 시작되는 서비스를 설정합니다. Docker 사용자는 amd64, arm64, armv7용으로 미리 만들어진 이미지를 받으면 되고, CasaOS는 같은 Compose 파일을 앱으로 가져옵니다."
      ],
      [
        "플레이",
        "네트워크에 연결된 아무 기기에서 포트 8080으로 그 기기의 주소를 열고, LAN / 전용 서버를 선택한 뒤 닉네임을 입력하고 테이블을 만드세요. PokerTH QML 또는 widget 클라이언트를 쓰는 플레이어는 포트 7234로 같은 기기에 접속해 같은 테이블에 참가합니다."
      ]
    ],
    "piH2": "Raspberry Pi에서",
    "piP": "PokerTH는 작은 메시지만 주고받고 화면 그리기는 모두 플레이어의 기기가 맡으므로 Raspberry Pi로도 충분합니다. 2 GB 메모리의 Pi 4가 가장 알맞고, Pi 5라면 차고 넘칩니다. 매끄러운 저녁을 위해서는 보드보다 네트워크가 더 중요합니다 — Pi는 라우터에 케이블로 연결하고, 플레이어용으로는 좋은 Wi-Fi 액세스 포인트를 쓰세요.",
    "httpsH2": "LAN에서는 HTTP, 추가 기능에는 HTTPS",
    "httpsP": "자체 네트워크에서는 게임이 일반 HTTP로 동작합니다. 홈 화면에 앱 설치, 오프라인 플레이, 알림 수신에는 HTTPS가 필요하며, 가이드에서 Nginx와 무료 Let’s Encrypt 인증서로 설정하는 방법을 안내합니다.",
    "adminH2": "브라우저 속 관리자 패널",
    "adminP": "/admin에 있는 토큰 보호 콘솔에서는 접속 중인 사람을 확인하고, 클릭 한 번으로 웹 클라이언트를 업데이트하거나 되돌리고, 플레이어에게 공지를 보내고, 순위표를 초기화하고, 카드 덱·테이블 스타일·음악을 설치하고, 클라이언트가 접속할 수 있는 게임 서버 목록을 관리하고, 일부 섹션만 여는 키를 나눠 줄 수 있습니다.",
    "shareH2": "외부 플레이어 초대하기",
    "shareP": "초대 링크와 QR 코드는 pokerth.net에서와 똑같이 내 서버에서도 작동합니다. 친구가 링크를 열면 내 테이블에 앉게 됩니다. 서버가 인터넷에서 접근 가능하다면 웹 클라이언트의 공개 서버 목록에 등록을 제안할 수도 있으며, 웹 클라이언트 관리자가 승인하면 목록에 표시됩니다.",
    "guidesH2": "단계별 가이드",
    "guides": [
      "PokerTH 서버 설정 가이드",
      "셀프 호스팅과 명령 한 줄 설치",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "수동 설치와 HTTPS",
      "관리자 패널"
    ],
    "faqH2": "질문",
    "faq": [
      [
        "PokerTH 서버 호스팅은 무료인가요?",
        "네. PokerTH 서버와 웹 클라이언트는 무료 오픈 소스 소프트웨어이며, 실행할 기기만 있으면 됩니다."
      ],
      [
        "어떤 하드웨어가 필요한가요?",
        "아주 적습니다. Linux나 Docker가 돌아가는 PC나 홈 서버, 또는 Raspberry Pi 4나 5면 됩니다. 처리 성능보다 유선 네트워크 연결이 더 중요합니다."
      ],
      [
        "플레이어가 무언가를 설치해야 하나요?",
        "아니요. 휴대폰, 태블릿, 컴퓨터의 브라우저에서 서버 주소를 열면 됩니다. 앱이 더 좋다면 PokerTH QML 클라이언트나 클래식 widget 클라이언트를 사용할 수 있습니다. 둘 다 같은 서버에 접속하며 같은 테이블에서 플레이합니다."
      ],
      [
        "pokerth.net이나 인터넷 연결이 필요한가요?",
        "아니요. 로컬 네트워크의 서버는 독립적으로 동작합니다. 플레이어는 닉네임만으로 서버에 직접 접속합니다."
      ],
      [
        "몇 명까지 참가할 수 있나요?",
        "테이블당 최대 10명에 관전자도 함께할 수 있으며, 테이블은 그룹에 필요한 만큼 만들 수 있습니다."
      ]
    ]
  },
  ky: {
    "title": "Өз покер сервериңизди орнотуңуз — акысыз, өзүңүздө | PokerTH",
    "desc": "Үйдө, клубда же мектепте жеке Texas Hold’em сервери: акысыз PokerTH сервери жана веб-клиенти бир буйрук менен, Docker аркылуу же Raspberry Pi'ге орнотулат.",
    "ldHeadline": "Өзүңүздүн PokerTH покер сервериңизди кантип орнотуу керек",
    "ldDesc": "PokerTH атайын сервери жана PokerTH веб-клиенти менен жеке, өзүңүздө жайгашкан Texas Hold’em серверин даярдаңыз.",
    "h1": "Өз покер сервериңизди орнотуңуз",
    "lead": "PokerTH башынан аягына чейин акысыз жана булак коду ачык: оюн сервери да, бул веб-клиент да өзүңүздүн машинаңызда иштей алат. Үй-бүлөлүк оюн, клубдагы кече, кеңседеги лига же мектеп үчүн бир компьютер, үй сервери же Raspberry Pi жетиштүү, андан кийин тармагыңыздагы ар бир телефон, планшет же компьютер өз браузеринде лакап ат менен эле ойнойт.",
    "whyH2": "Эмне үчүн өз сервериңиз",
    "why": [
      [
        "Жеке",
        "Оюндарыңыз машинаңызда жана тармагыңызда калат; оюнчуларга аккаунт да, электрондук почта дареги да керек эмес, лакап ат эле жетиштүү."
      ],
      [
        "Өзүңүзгө ылайыктап",
        "Серверге өз атын бериңиз, кирүү экраны кайсы режимдерди сунуштарын тандаңыз, саламдашуу билдирүүсүн жарыялаңыз жана тобуңуз үчүн жалпы рейтинг жүргүзүңүз."
      ],
      [
        "Акысыз",
        "Лицензия жок, жазылуу жок, жарнама жок: PokerTH сервери да, веб-клиент да эркин программа."
      ]
    ],
    "partsH2": "Эки бөлүк",
    "partsP": "PokerTH оюнуна карталарды таратып, үстөлдөрдү башкарган PokerTH атайын сервери жана браузерлерге колдонмону берип, аларды ошол серверге туташтырган веб-клиент керек. Экөө бир эле машинада иштей алат. Баары шайкеш бойдон калат: PokerTH колдонмолору браузерлер туташкан ошол эле серверге туташат — Windows, macOS, Linux жана Android үчүн QML клиенти, ошондой эле компьютер үчүн классикалык widget клиенти — ошондуктан оюнчулар бир үстөлдө браузерлерди жана колдонмолорду аралаштыра алышат.",
    "stepsH2": "Үч кадамда орнотуңуз",
    "steps": [
      [
        "PokerTH серверин орнотуңуз",
        "PokerTH долбоорунун сервер колдонмосун ээрчип, pokerth_dedicated_server программасын PokerTH булак кодунан куруңуз — 2.1.10 же андан кийинки версия: ага Qt 6.7 же жаңыраак, CMake жана C++23 компилятору керек. Linux дистрибутивдериндеги pokerth-server пакети — эски версия. Сервер TCP 7234 портун угат."
      ],
      [
        "Веб-клиентти орнотуңуз",
        "Debian, Ubuntu же Raspberry Pi OS системасында орнотуу скрипти Node.js, веб-клиентти жана машина менен кошо иштей баштаган кызматты бир буйрук менен даярдайт. Docker колдонуучулары amd64, arm64 жана armv7 үчүн даяр образды жүктөп алышат, ал эми CasaOS ошол эле Compose файлын колдонмо катары импорттойт."
      ],
      [
        "Ойноңуз",
        "Тармагыңыздагы каалаган түзмөктө машинанын дарегин 8080 портунда ачып, «LAN / Атайын сервер» тандаңыз, лакап ат жазып, үстөл түзүңүз. PokerTH QML же widget клиенти бар оюнчулар ошол эле машинага 7234 портунда туташып, ошол эле үстөлдөргө кошулушат."
      ]
    ],
    "piH2": "Raspberry Pi'де",
    "piP": "PokerTH кичинекей билдирүүлөр менен алмашат, ал эми бардык сүрөттү оюнчулардын түзмөктөрү тартат, ошондуктан Raspberry Pi толук жетиштүү: 2 GB эстутуму бар Pi 4 эң ылайыктуу, Pi 5 керектүүдөн да ашык. Кече тыкан өтүшү үчүн тактадан көрө тармак маанилүүрөөк — Pi'ни роутерге кабель менен туташтырып, оюнчулар үчүн жакшы Wi-Fi кирүү чекитин колдонуңуз.",
    "httpsH2": "LAN'да HTTP, кошумча мүмкүнчүлүктөр үчүн HTTPS",
    "httpsP": "Өз тармагыңызда оюн жөнөкөй HTTP аркылуу иштейт. Колдонмону башкы экранга орнотуу, оффлайн ойноо жана билдирмелерди алуу үчүн HTTPS керек, аны орнотуу колдонмосу Nginx жана акысыз Let’s Encrypt сертификаты менен жөндөйт.",
    "adminH2": "Браузердеги башкаруу панели",
    "adminP": "/admin дарегиндеги токен менен корголгон консоль ким туташып турганын көрсөтөт, веб-клиентти бир чыкылдатуу менен жаңыртат жана мурунку версияга кайтара алат, оюнчуларга кулактандыруу жөнөтөт, рейтингди тазалайт, карта колодаларын, үстөл стилдерин жана музыканы орнотот, клиент туташа ала турган оюн серверлеринин тизмесин жүргүзөт жана анын айрым бөлүмдөрүн гана ача турган ачкычтарды берет.",
    "shareH2": "Сырттан оюнчуларды чакырыңыз",
    "shareP": "Чакыруу шилтемелери жана QR коддор сиздин серверде да pokerth.net'тегидей эле иштейт: дос шилтемени ачат да, үстөлүңүзгө отурат. Эгер сервериңиз интернеттен жеткиликтүү болсо, аны веб-клиенттин ачык серверлер тизмесине да сунуштай аласыз; веб-клиенттин администраторлору бекиткенден кийин ал ошол жерде пайда болот.",
    "guidesH2": "Кадам-кадам колдонмолор",
    "guides": [
      "PokerTH серверин орнотуу колдонмосу",
      "Өзүңүздө жайгаштыруу жана бир буйрук менен орнотуу",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Кол менен орнотуу жана HTTPS",
      "Башкаруу панели"
    ],
    "faqH2": "Суроолор",
    "faq": [
      [
        "PokerTH серверин жайгаштыруу акысызбы?",
        "Ооба. PokerTH сервери жана веб-клиент — акысыз, булак коду ачык программалар; аларды иштетүү үчүн бир гана машина керек."
      ],
      [
        "Мага кандай жабдык керек?",
        "Абдан аз: Linux же Docker иштеткен каалаган компьютер же үй сервери, же Raspberry Pi 4 же 5. Иштетүү кубаттуулугунан көрө зымдуу тармак байланышы маанилүүрөөк."
      ],
      [
        "Оюнчулар бир нерсе орнотушу керекпи?",
        "Жок. Алар сервердин дарегин телефонундагы, планшетиндеги же компьютериндеги браузерде ачышат. Колдонмону жактыргандар PokerTH QML клиентин же классикалык widget клиентин колдоно алышат: алар ошол эле серверге туташып, ошол эле үстөлдөрдө ойношот."
      ],
      [
        "Ага pokerth.net же интернет байланышы керекпи?",
        "Жок. Жергиликтүү тармагыңыздагы сервер өз алдынча иштейт: оюнчулар ага лакап ат менен эле түз туташышат."
      ],
      [
        "Канча оюнчу кошула алат?",
        "Ар бир үстөлгө 10 оюнчуга чейин, көрүүчүлөр да, жана тобуңузга канча үстөл керек болсо, ошончо."
      ]
    ]
  },
  lt: {
    "title": "Savas pokerio serveris — nemokamai, jūsų kompiuteryje | PokerTH",
    "desc": "Privatus Texas Hold’em serveris namuose, klube ar mokykloje: nemokamas PokerTH serveris ir žiniatinklio klientas, įdiegiami viena komanda, su Docker arba Raspberry Pi.",
    "ldHeadline": "Kaip įsirengti savo PokerTH pokerio serverį",
    "ldDesc": "Įsirenkite privatų, savo kompiuteryje veikiantį Texas Hold’em serverį su PokerTH skirtuoju serveriu ir PokerTH žiniatinklio klientu.",
    "h1": "Įsirenkite savo pokerio serverį",
    "lead": "PokerTH yra nemokamas ir atvirojo kodo nuo pradžios iki galo: žaidimo serveris ir šis žiniatinklio klientas gali veikti jūsų pačių kompiuteryje. Kompiuterio, namų serverio ar Raspberry Pi pakanka šeimos žaidimui, klubo vakarui, biuro lygai ar mokyklai, o tada kiekvienas jūsų tinklo telefonas, planšetė ar kompiuteris žaidžia naršyklėje vien su slapyvardžiu.",
    "whyH2": "Kodėl verta turėti savo",
    "why": [
      [
        "Privatu",
        "Jūsų žaidimai lieka jūsų kompiuteryje ir tinkle; žaidėjams nereikia nei paskyros, nei el. pašto adreso — užtenka slapyvardžio."
      ],
      [
        "Pritaikote patys",
        "Suteikite serveriui savo pavadinimą, pasirinkite, kokius režimus siūlo prisijungimo ekranas, paskelbkite pasveikinimo žinutę ir veskite bendrą savo grupės reitingą."
      ],
      [
        "Nemokamai",
        "Jokios licencijos, jokios prenumeratos, jokių reklamų: ir PokerTH serveris, ir žiniatinklio klientas yra laisvoji programinė įranga."
      ]
    ],
    "partsH2": "Dvi dalys",
    "partsP": "PokerTH žaidimui reikia PokerTH skirtojo serverio, kuris dalija kortas ir valdo stalus, ir žiniatinklio kliento, kuris pateikia programėlę naršyklėms ir sujungia jas su tuo serveriu. Abu gali veikti tame pačiame kompiuteryje. Viskas išlieka suderinama: PokerTH programėlės — QML klientas, skirtas Windows, macOS, Linux ir Android, bei klasikinis widget klientas darbalaukiui — jungiasi prie to paties serverio kaip ir naršyklės, todėl prie vieno stalo gali žaisti ir naršyklių, ir programėlių naudotojai.",
    "stepsH2": "Įrenkite per tris žingsnius",
    "steps": [
      [
        "Įdiekite PokerTH serverį",
        "Sukompiliuokite pokerth_dedicated_server iš PokerTH išeities kodo — 2.1.10 ar naujesnę versiją — pagal PokerTH projekto serverio vadovą: reikia Qt 6.7 ar naujesnės, CMake ir C++23 kompiliatoriaus. Linux distribucijų paketas pokerth-server yra senesnė versija. Serveris klausosi TCP prievado 7234."
      ],
      [
        "Įdiekite žiniatinklio klientą",
        "Debian, Ubuntu ar Raspberry Pi OS sistemose diegimo scenarijus viena komanda įdiegia Node.js, žiniatinklio klientą ir paslaugą, kuri paleidžiama kartu su kompiuteriu. Docker naudotojai parsisiunčia paruoštą atvaizdą, skirtą amd64, arm64 ir armv7, o CasaOS importuoja tą patį Compose failą kaip programėlę."
      ],
      [
        "Žaiskite",
        "Bet kuriame savo tinklo įrenginyje atverkite kompiuterio adresą per prievadą 8080, pasirinkite „LAN / Skirtasis serveris“, įveskite slapyvardį ir sukurkite stalą. Žaidėjai su PokerTH QML ar widget klientu jungiasi prie to paties kompiuterio per prievadą 7234 ir sėda prie tų pačių stalų."
      ]
    ],
    "piH2": "Su Raspberry Pi",
    "piP": "PokerTH keičiasi nedidelėmis žinutėmis, o visą piešimą atlieka žaidėjų įrenginiai, todėl Raspberry Pi visiškai pakanka: Pi 4 su 2 GB yra optimalus pasirinkimas, o Pi 5 — daugiau nei pakankamas. Sklandžiam vakarui tinklas svarbesnis už plokštę — prijunkite Pi prie maršrutizatoriaus kabeliu, o žaidėjams naudokite gerą Wi-Fi prieigos tašką.",
    "httpsH2": "HTTP vietiniame tinkle, HTTPS papildomoms funkcijoms",
    "httpsP": "Jūsų tinkle žaidimas veikia per paprastą HTTP. Norint įdiegti programėlę pradžios ekrane, žaisti neprisijungus ir gauti pranešimus, reikia HTTPS, kurį vadovas sukonfigūruoja su Nginx ir nemokamu Let’s Encrypt sertifikatu.",
    "adminH2": "Administravimo skydelis naršyklėje",
    "adminP": "Prieigos raktu apsaugota konsolė adresu /admin rodo, kas prisijungęs, vienu spustelėjimu atnaujina žiniatinklio klientą ir gali grąžinti ankstesnę versiją, siunčia žaidėjams pranešimus, nustato reitingą iš naujo, įdiegia kortų kalades, stalų stilius ir muziką, nurodo, kuriuos žaidimo serverius klientas gali pasiekti, ir išduoda raktus, atrakinančius tik kai kurias jos dalis.",
    "shareH2": "Pakvieskite žaidėjus iš išorės",
    "shareP": "Pakvietimo nuorodos ir QR kodai jūsų serveryje veikia lygiai taip pat kaip pokerth.net: draugas atveria nuorodą ir yra susodinamas prie jūsų stalo. Jei jūsų serveris pasiekiamas iš interneto, galite jį pasiūlyti ir į viešą žiniatinklio kliento serverių sąrašą; jis ten atsiras, kai žiniatinklio kliento administratoriai jį patvirtins.",
    "guidesH2": "Žingsnis po žingsnio vadovai",
    "guides": [
      "PokerTH serverio diegimo vadovas",
      "Savarankiškas talpinimas ir diegimas viena komanda",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Rankinis diegimas ir HTTPS",
      "Administravimo skydelis"
    ],
    "faqH2": "Klausimai",
    "faq": [
      [
        "Ar PokerTH serverio talpinimas nemokamas?",
        "Taip. PokerTH serveris ir žiniatinklio klientas yra nemokama atvirojo kodo programinė įranga; jums tereikia kompiuterio, kuriame jie veiktų."
      ],
      [
        "Kokios įrangos man reikia?",
        "Labai nedaug: bet kurio kompiuterio ar namų serverio su Linux ar Docker arba Raspberry Pi 4 ar 5. Laidinis tinklo ryšys svarbesnis už skaičiavimo galią."
      ],
      [
        "Ar žaidėjams reikia ką nors diegti?",
        "Ne. Jie atveria serverio adresą naršyklėje savo telefone, planšetėje ar kompiuteryje. Kas renkasi programėlę, gali naudoti PokerTH QML klientą arba klasikinį widget klientą: jie jungiasi prie to paties serverio ir žaidžia prie tų pačių stalų."
      ],
      [
        "Ar reikia pokerth.net arba interneto ryšio?",
        "Ne. Serveris jūsų vietiniame tinkle veikia savarankiškai: žaidėjai jungiasi prie jo tiesiogiai, vien su slapyvardžiu."
      ],
      [
        "Kiek žaidėjų gali prisijungti?",
        "Iki 10 žaidėjų prie stalo, plius stebėtojai, ir tiek stalų, kiek reikia jūsų grupei."
      ]
    ]
  },
  lv: {
    "title": "Savs pokera serveris — bezmaksas, pašmitināts | PokerTH",
    "desc": "Privāts Texas Hold’em serveris mājās, klubā vai skolā: bezmaksas PokerTH serveris un tīmekļa klients, uzstādīts ar vienu komandu, ar Docker vai uz Raspberry Pi.",
    "ldHeadline": "Kā izveidot savu PokerTH pokera serveri",
    "ldDesc": "Uzstādi privātu, pašmitinātu Texas Hold’em serveri ar PokerTH dedicēto serveri un PokerTH tīmekļa klientu.",
    "h1": "Izveido savu pokera serveri",
    "lead": "PokerTH ir bezmaksas un ar atvērtu pirmkodu no sākuma līdz beigām: spēles serveris un šis tīmekļa klients var darboties tavā paša datorā. Ar datoru, mājas serveri vai Raspberry Pi pietiek ģimenes spēlei, kluba vakaram, biroja līgai vai skolai, un tad katrs telefons, planšete vai dators tavā tīklā spēlē pārlūkā, tikai ar segvārdu.",
    "whyH2": "Kāpēc savs serveris",
    "why": [
      [
        "Privāti",
        "Tavas spēles paliek tavā datorā un tavā tīklā; spēlētājiem nevajag ne kontu, ne e-pasta adresi, tikai segvārdu."
      ],
      [
        "Pielāgo pēc savas gaumes",
        "Dod serverim savu nosaukumu, izvēlies, kurus režīmus piedāvā pieslēgšanās ekrāns, publicē sveiciena ziņu un uzturi kopīgu rezultātu tabulu savai kompānijai."
      ],
      [
        "Bezmaksas",
        "Bez licences, bez abonementa, bez reklāmām: gan PokerTH serveris, gan tīmekļa klients ir brīvā programmatūra."
      ]
    ],
    "partsH2": "Divas daļas",
    "partsP": "PokerTH spēlei vajag PokerTH dedicēto serveri, kas dala kārtis un vada galdus, un tīmekļa klientu, kas pasniedz lietotni pārlūkiem un savieno tos ar šo serveri. Abi var darboties vienā datorā. Viss paliek saderīgs: PokerTH lietotnes pieslēdzas tam pašam serverim kā pārlūki — QML klients operētājsistēmām Windows, macOS, Linux un Android un klasiskais widget klients darbvirsmai —, tāpēc pie viena galda var spēlēt gan pārlūkos, gan lietotnēs.",
    "stepsH2": "Uzstādīšana trīs soļos",
    "steps": [
      [
        "Uzstādi PokerTH serveri",
        "Nokompilē pokerth_dedicated_server no PokerTH pirmkoda — versiju 2.1.10 vai jaunāku —, sekojot PokerTH projekta servera ceļvedim: vajag Qt 6.7 vai jaunāku, CMake un C++23 kompilatoru. Linux distribūciju pakotne pokerth-server ir vecāka versija. Serveris klausās TCP portā 7234."
      ],
      [
        "Uzstādi tīmekļa klientu",
        "Debian, Ubuntu vai Raspberry Pi OS sistēmā instalēšanas skripts ar vienu komandu uzstāda Node.js, tīmekļa klientu un servisu, kas startē kopā ar datoru. Docker lietotāji lejupielādē gatavu attēlu platformām amd64, arm64 un armv7, un CasaOS importē to pašu Compose failu kā lietotni."
      ],
      [
        "Spēlē",
        "Jebkurā ierīcē savā tīklā atver datora adresi portā 8080, izvēlies „LAN / Dedicētais serveris”, ievadi segvārdu un izveido galdu. Spēlētāji ar PokerTH QML vai widget klientu pieslēdzas tam pašam datoram portā 7234 un pievienojas tiem pašiem galdiem."
      ]
    ],
    "piH2": "Uz Raspberry Pi",
    "piP": "PokerTH apmainās ar nelielām ziņām, un visu zīmēšanu veic spēlētāju ierīces, tāpēc Raspberry Pi pilnīgi pietiek: Pi 4 ar 2 GB ir optimāls, Pi 5 — vairāk nekā pietiekams. Raitam vakaram tīkls ir svarīgāks par plati — pievieno Pi maršrutētājam ar kabeli un spēlētājiem izmanto labu Wi-Fi piekļuves punktu.",
    "httpsH2": "HTTP lokālajā tīklā, HTTPS papildiespējām",
    "httpsP": "Tavā paša tīklā spēle darbojas ar parastu HTTP. Lai uzstādītu lietotni sākuma ekrānā, spēlētu bezsaistē un saņemtu paziņojumus, vajag HTTPS, ko ceļvedis iestata ar Nginx un bezmaksas Let’s Encrypt sertifikātu.",
    "adminH2": "Administrēšanas panelis pārlūkā",
    "adminP": "Ar piekļuves marķieri aizsargāta konsole adresē /admin rāda, kas ir pieslēdzies, ar vienu klikšķi atjaunina tīmekļa klientu un var atgriezt iepriekšējo versiju, sūta paziņojumus spēlētājiem, atiestata rezultātu tabulu, uzstāda kāršu kavas, galda stilus un mūziku, nosaka spēļu serverus, kuriem klients drīkst pieslēgties, un izsniedz atslēgas, kas atver tikai dažas tās sadaļas.",
    "shareH2": "Uzaicini spēlētājus no ārpuses",
    "shareP": "Uzaicinājuma saites un QR kodi tavā serverī darbojas tieši tāpat kā pokerth.net: draugs atver saiti un tiek apsēdināts pie tava galda. Ja tavs serveris ir sasniedzams no interneta, vari to arī ieteikt tīmekļa klienta publiskajam serveru sarakstam; tas tur parādīsies, tiklīdz tīmekļa klienta administratori to apstiprinās.",
    "guidesH2": "Soli pa solim ceļveži",
    "guides": [
      "PokerTH servera uzstādīšanas ceļvedis",
      "Pašmitināšana un instalēšana ar vienu komandu",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Manuāla instalēšana un HTTPS",
      "Administrēšanas panelis"
    ],
    "faqH2": "Jautājumi",
    "faq": [
      [
        "Vai PokerTH servera mitināšana ir bezmaksas?",
        "Jā. PokerTH serveris un tīmekļa klients ir bezmaksas atvērtā pirmkoda programmatūra; tev vajag tikai datoru, kur tos darbināt."
      ],
      [
        "Kāda aparatūra man vajadzīga?",
        "Pavisam neliela: jebkurš dators vai mājas serveris ar Linux vai Docker, vai Raspberry Pi 4 vai 5. Vadu tīkla savienojums ir svarīgāks par skaitļošanas jaudu."
      ],
      [
        "Vai spēlētājiem kaut kas jāinstalē?",
        "Nē. Viņi atver servera adresi pārlūkā savā telefonā, planšetē vai datorā. Tie, kas dod priekšroku lietotnei, var izmantot PokerTH QML klientu vai klasisko widget klientu: ar tiem pieslēdzas tam pašam serverim un spēlē pie tiem pašiem galdiem."
      ],
      [
        "Vai vajag pokerth.net vai interneta savienojumu?",
        "Nē. Serveris tavā lokālajā tīklā darbojas patstāvīgi: spēlētāji pieslēdzas tam tieši, tikai ar segvārdu."
      ],
      [
        "Cik spēlētāju var pievienoties?",
        "Līdz 10 spēlētājiem pie galda, kā arī skatītāji, un tik galdu, cik vajag tavai kompānijai."
      ]
    ]
  },
  mk: {
    "title": "Сопствен покер сервер — бесплатен, самохостиран | PokerTH",
    "desc": "Приватен Texas Hold’em сервер дома, во клуб или училиште: бесплатниот сервер и веб-клиент на PokerTH, поставени со една команда, со Docker или на Raspberry Pi.",
    "ldHeadline": "Како да хостираш сопствен PokerTH покер сервер",
    "ldDesc": "Постави приватен, самохостиран Texas Hold’em сервер со наменскиот сервер на PokerTH и веб-клиентот на PokerTH.",
    "h1": "Хостирај сопствен покер сервер",
    "lead": "PokerTH е бесплатен и со отворен код од почеток до крај: серверот за игра и овој веб-клиент можат да работат на твојата сопствена машина. Компјутер, домашен сервер или Raspberry Pi се доволни за семејна игра, клупска вечер, канцелариска лига или училиште, а потоа секој телефон, таблет или компјутер на твојата мрежа игра во својот прелистувач само со прекар.",
    "whyH2": "Зошто сопствен сервер",
    "why": [
      [
        "Приватно",
        "Твоите игри остануваат на твојата машина и на твојата мрежа; на играчите не им треба ни сметка ни е-пошта адреса, само прекар."
      ],
      [
        "По твој вкус",
        "Дај му на серверот сопствено име, избери кои режими ги нуди екранот за најава, објави порака за добредојде и води заедничка ранг-листа за твојата група."
      ],
      [
        "Бесплатно",
        "Без лиценца, без претплата, без реклами: и серверот на PokerTH и веб-клиентот се слободен софтвер."
      ]
    ],
    "partsH2": "Два дела",
    "partsP": "За игра на PokerTH потребни се наменскиот сервер на PokerTH, кој ги дели картите и ги води масите, и веб-клиентот, кој ја служи апликацијата на прелистувачите и ги поврзува со тој сервер. Можат да работат на истата машина. Сè останува компатибилно: апликациите на PokerTH се поврзуваат на истиот сервер како и прелистувачите — QML-клиентот на Windows, macOS, Linux и Android и класичниот widget-клиент на десктоп — па на една маса можат заедно да седат играчи од прелистувачи и од апликации.",
    "stepsH2": "Постави го во три чекори",
    "steps": [
      [
        "Инсталирај го серверот на PokerTH",
        "Изгради го pokerth_dedicated_server од изворниот код на PokerTH — верзија 2.1.10 или понова — следејќи го упатството за серверот на проектот PokerTH: потребни се Qt 6.7 или понов, CMake и компајлер за C++23. Пакетот pokerth-server во Linux-дистрибуциите е постара верзија. Серверот слуша на TCP-портата 7234."
      ],
      [
        "Инсталирај го веб-клиентот",
        "На Debian, Ubuntu или Raspberry Pi OS инсталациската скрипта со една команда ги поставува Node.js, веб-клиентот и сервис што се стартува заедно со машината. Корисниците на Docker преземаат готова слика за amd64, arm64 и armv7, а CasaOS ја увезува истата Compose-датотека како апликација."
      ],
      [
        "Играј",
        "На кој било уред на твојата мрежа отвори ја адресата на машината на портата 8080, избери LAN / наменски сервер, внеси прекар и создај маса. Играчите со QML- или widget-клиентот на PokerTH се поврзуваат на истата машина на портата 7234 и се приклучуваат на истите маси."
      ]
    ],
    "piH2": "На Raspberry Pi",
    "piP": "PokerTH разменува мали пораки, а целото цртање го прават уредите на играчите, па Raspberry Pi е сосема доволен: Pi 4 со 2 GB е идеалната мерка, а Pi 5 е повеќе од доволен. За непречена вечер мрежата е поважна од плочката — поврзи го Pi со рутерот со кабел и користи добра Wi-Fi пристапна точка за играчите.",
    "httpsH2": "HTTP на LAN, HTTPS за додатоците",
    "httpsP": "На твојата сопствена мрежа играта работи преку обичен HTTP. За инсталирање на апликацијата на почетниот екран, играње офлајн и примање известувања потребен е HTTPS, кој упатството го поставува со Nginx и бесплатен сертификат од Let’s Encrypt.",
    "adminH2": "Администраторски панел во прелистувачот",
    "adminP": "Конзола на /admin, заштитена со токен, покажува кој е поврзан, го ажурира веб-клиентот со еден клик и може да го врати на претходната верзија, испраќа соопштенија до играчите, ја ресетира ранг-листата, инсталира шпилови карти, стилови на маса и музика, ги наведува серверите за игра до кои клиентот може да стигне и дели клучеви што отклучуваат само некои од нејзините делови.",
    "shareH2": "Покани играчи однадвор",
    "shareP": "Линковите со покана и QR-кодовите работат на твојот сервер исто како на pokerth.net: пријател го отвора линкот и седнува на твојата маса. Ако твојот сервер е достапен од интернет, можеш да го предложиш и за јавната листа на сервери на веб-клиентот; таму се појавува откако ќе го одобрат администраторите на веб-клиентот.",
    "guidesH2": "Упатства чекор по чекор",
    "guides": [
      "Упатство за поставување на серверот на PokerTH",
      "Самохостирање и инсталација со една команда",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Рачна инсталација и HTTPS",
      "Администраторскиот панел"
    ],
    "faqH2": "Прашања",
    "faq": [
      [
        "Дали хостирањето сервер на PokerTH е бесплатно?",
        "Да. Серверот на PokerTH и веб-клиентот се бесплатен софтвер со отворен код; ти треба само машина на која ќе работат."
      ],
      [
        "Каков хардвер ми треба?",
        "Многу малку: кој било компјутер или домашен сервер со Linux или Docker, или Raspberry Pi 4 или 5. Жичената мрежна врска е поважна од процесорската моќ."
      ],
      [
        "Дали играчите треба да инсталираат нешто?",
        "Не. Тие ја отвораат адресата на серверот во прелистувач на својот телефон, таблет или компјутер. Тие што претпочитаат апликација можат да го користат QML-клиентот на PokerTH или класичниот widget-клиент: тие се поврзуваат на истиот сервер и играат на истите маси."
      ],
      [
        "Дали е потребен pokerth.net или интернет-врска?",
        "Не. Сервер на твојата локална мрежа работи самостојно: играчите се поврзуваат директно на него, само со прекар."
      ],
      [
        "Колку играчи можат да се приклучат?",
        "До 10 играчи по маса, плус набљудувачи, и онолку маси колку што ѝ требаат на твојата група."
      ]
    ]
  },
  ml: {
    "title": "സ്വന്തം പോക്കർ സെർവർ ഒരുക്കൂ — സൗജന്യം, സെൽഫ്-ഹോസ്റ്റഡ് | PokerTH",
    "desc": "വീട്ടിലോ ക്ലബ്ബിലോ സ്കൂളിലോ ഒരു സ്വകാര്യ Texas Hold’em സെർവർ: സൗജന്യ PokerTH സെർവറും വെബ് ക്ലയന്റും, ഒറ്റ കമാൻഡിൽ, Docker ഉപയോഗിച്ചോ Raspberry Pi-ലോ.",
    "ldHeadline": "സ്വന്തം PokerTH പോക്കർ സെർവർ എങ്ങനെ ഹോസ്റ്റ് ചെയ്യാം",
    "ldDesc": "PokerTH ഡെഡിക്കേറ്റഡ് സെർവറും PokerTH വെബ് ക്ലയന്റും ഉപയോഗിച്ച് സ്വകാര്യവും സെൽഫ്-ഹോസ്റ്റഡുമായ ഒരു Texas Hold’em സെർവർ ഒരുക്കുക.",
    "h1": "സ്വന്തം പോക്കർ സെർവർ ഹോസ്റ്റ് ചെയ്യുക",
    "lead": "PokerTH തുടക്കം മുതൽ ഒടുക്കം വരെ സൗജന്യവും ഓപ്പൺ സോഴ്സുമാണ്: ഗെയിം സെർവറും ഈ വെബ് ക്ലയന്റും നിങ്ങളുടെ സ്വന്തം മെഷീനിൽ പ്രവർത്തിപ്പിക്കാം. കുടുംബത്തോടൊപ്പമുള്ള കളിക്കോ ക്ലബ്ബ് രാത്രിക്കോ ഓഫീസ് ലീഗിനോ സ്കൂളിനോ ഒരു പിസിയോ ഹോം സെർവറോ Raspberry Pi-ഓ മതി; പിന്നെ നിങ്ങളുടെ നെറ്റ്‌വർക്കിലെ ഓരോ ഫോണും ടാബ്‌ലെറ്റും കമ്പ്യൂട്ടറും ഒരു വിളിപ്പേര് മാത്രം ഉപയോഗിച്ച് ബ്രൗസറിൽ കളിക്കും.",
    "whyH2": "എന്തിന് സ്വന്തമായി ഒന്ന്",
    "why": [
      [
        "സ്വകാര്യം",
        "നിങ്ങളുടെ കളികൾ നിങ്ങളുടെ മെഷീനിലും നെറ്റ്‌വർക്കിലും തന്നെ നിൽക്കും; കളിക്കാർക്ക് അക്കൗണ്ടോ ഇമെയിൽ വിലാസമോ വേണ്ട, ഒരു വിളിപ്പേര് മാത്രം മതി."
      ],
      [
        "നിങ്ങളുടെ ഇഷ്ടം പോലെ",
        "സെർവറിന് സ്വന്തമായി ഒരു പേര് നൽകുക, ലോഗിൻ സ്ക്രീനിൽ ഏതൊക്കെ മോഡുകൾ വേണമെന്ന് തിരഞ്ഞെടുക്കുക, ഒരു സ്വാഗത സന്ദേശം ഇടുക, നിങ്ങളുടെ ഗ്രൂപ്പിനായി ഒരു പൊതു റാങ്കിംഗ് സൂക്ഷിക്കുക."
      ],
      [
        "സൗജന്യം",
        "ലൈസൻസില്ല, സബ്‌സ്ക്രിപ്ഷനില്ല, പരസ്യങ്ങളില്ല: PokerTH സെർവറും വെബ് ക്ലയന്റും സ്വതന്ത്ര സോഫ്റ്റ്‌വെയറാണ്."
      ]
    ],
    "partsH2": "രണ്ട് ഭാഗങ്ങൾ",
    "partsP": "ഒരു PokerTH ഗെയിമിന് രണ്ട് കാര്യങ്ങൾ വേണം: കാർഡുകൾ വിതരണം ചെയ്യുകയും ടേബിളുകൾ നടത്തുകയും ചെയ്യുന്ന PokerTH ഡെഡിക്കേറ്റഡ് സെർവർ, ബ്രൗസറുകൾക്ക് ആപ്പ് നൽകി അവയെ ആ സെർവറുമായി ബന്ധിപ്പിക്കുന്ന വെബ് ക്ലയന്റ്. രണ്ടും ഒരേ മെഷീനിൽ പ്രവർത്തിക്കാം. എല്ലാം അനുയോജ്യമായി തുടരും: PokerTH ആപ്പുകൾ — Windows, macOS, Linux, Android എന്നിവയിലെ QML ക്ലയന്റും ഡെസ്ക്ടോപ്പിലെ ക്ലാസിക് widget ക്ലയന്റും — ബ്രൗസറുകൾ കണക്റ്റ് ചെയ്യുന്ന അതേ സെർവറിലേക്ക് കണക്റ്റ് ചെയ്യുന്നതിനാൽ, ബ്രൗസറിലും ആപ്പിലുമുള്ള കളിക്കാർക്ക് ഒരേ ടേബിളിൽ ഒന്നിച്ച് കളിക്കാം.",
    "stepsH2": "മൂന്ന് ഘട്ടങ്ങളിൽ ഒരുക്കാം",
    "steps": [
      [
        "PokerTH സെർവർ ഇൻസ്റ്റാൾ ചെയ്യുക",
        "PokerTH പ്രോജക്റ്റിന്റെ സെർവർ ഗൈഡ് പിന്തുടർന്ന് PokerTH സോഴ്സ് കോഡിൽ നിന്ന് pokerth_dedicated_server ബിൽഡ് ചെയ്യുക — പതിപ്പ് 2.1.10 അല്ലെങ്കിൽ അതിനു ശേഷമുള്ളത്: ഇതിന് Qt 6.7 അല്ലെങ്കിൽ പുതിയത്, CMake, ഒരു C++23 കംപൈലർ എന്നിവ വേണം. Linux ഡിസ്ട്രിബ്യൂഷനുകളിലെ pokerth-server പാക്കേജ് ഒരു പഴയ പതിപ്പാണ്. സെർവർ TCP പോർട്ട് 7234-ൽ കണക്ഷനുകൾ സ്വീകരിക്കുന്നു."
      ],
      [
        "വെബ് ക്ലയന്റ് ഇൻസ്റ്റാൾ ചെയ്യുക",
        "Debian, Ubuntu അല്ലെങ്കിൽ Raspberry Pi OS-ൽ ഇൻസ്റ്റാളേഷൻ സ്ക്രിപ്റ്റ് ഒറ്റ കമാൻഡിൽ Node.js, വെബ് ക്ലയന്റ്, മെഷീനോടൊപ്പം തുടങ്ങുന്ന ഒരു സർവീസ് എന്നിവ ഒരുക്കുന്നു. Docker ഉപയോക്താക്കൾക്ക് amd64, arm64, armv7 എന്നിവയ്ക്കായി തയ്യാറാക്കിയ ഒരു ഇമേജ് പുൾ ചെയ്യാം; CasaOS അതേ Compose ഫയൽ ഒരു ആപ്പായി ഇംപോർട്ട് ചെയ്യുന്നു."
      ],
      [
        "കളിക്കുക",
        "നിങ്ങളുടെ നെറ്റ്‌വർക്കിലെ ഏത് ഉപകരണത്തിലും പോർട്ട് 8080-ൽ മെഷീന്റെ വിലാസം തുറന്ന്, LAN / ഡെഡിക്കേറ്റഡ് സെർവർ തിരഞ്ഞെടുത്ത്, ഒരു വിളിപ്പേര് ടൈപ്പ് ചെയ്ത് ഒരു ടേബിൾ സൃഷ്ടിക്കുക. PokerTH QML അല്ലെങ്കിൽ widget ക്ലയന്റ് ഉപയോഗിക്കുന്ന കളിക്കാർ പോർട്ട് 7234-ൽ അതേ മെഷീനിലേക്ക് കണക്റ്റ് ചെയ്ത് അതേ ടേബിളുകളിൽ ചേരുന്നു."
      ]
    ],
    "piH2": "Raspberry Pi-ൽ",
    "piP": "PokerTH ചെറിയ സന്ദേശങ്ങൾ മാത്രമേ കൈമാറുന്നുള്ളൂ, എല്ലാ വരയ്ക്കലും കളിക്കാരുടെ ഉപകരണങ്ങളാണ് ചെയ്യുന്നത്; അതിനാൽ ഒരു Raspberry Pi ധാരാളം: 2 GB ഉള്ള Pi 4 ഏറ്റവും അനുയോജ്യം, Pi 5 ആവശ്യത്തിലധികം. സുഗമമായ ഒരു സായാഹ്നത്തിന് ബോർഡിനേക്കാൾ പ്രധാനം നെറ്റ്‌വർക്കാണ് — Pi കേബിൾ വഴി റൂട്ടറിലേക്ക് ഘടിപ്പിക്കുക, കളിക്കാർക്കായി നല്ലൊരു Wi-Fi ആക്സസ് പോയിന്റ് ഉപയോഗിക്കുക.",
    "httpsH2": "LAN-ൽ HTTP, അധിക സൗകര്യങ്ങൾക്ക് HTTPS",
    "httpsP": "നിങ്ങളുടെ സ്വന്തം നെറ്റ്‌വർക്കിൽ സാധാരണ HTTP വഴി കളി പ്രവർത്തിക്കും. ഹോം സ്ക്രീനിൽ ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യാനും ഓഫ്‌ലൈനായി കളിക്കാനും അറിയിപ്പുകൾ ലഭിക്കാനും HTTPS വേണം; Nginx-ഉം സൗജന്യ Let’s Encrypt സർട്ടിഫിക്കറ്റും ഉപയോഗിച്ച് ഗൈഡ് അത് ഒരുക്കുന്നു.",
    "adminH2": "ബ്രൗസറിൽ ഒരു അഡ്മിൻ പാനൽ",
    "adminP": "/admin-ലെ ടോക്കൺ സംരക്ഷിത കൺസോൾ ആരൊക്കെ കണക്റ്റ് ചെയ്തിട്ടുണ്ടെന്ന് കാണിക്കുന്നു, ഒറ്റ ക്ലിക്കിൽ വെബ് ക്ലയന്റ് അപ്ഡേറ്റ് ചെയ്യുകയും ആവശ്യമെങ്കിൽ പഴയ പതിപ്പിലേക്ക് തിരികെ കൊണ്ടുപോകുകയും ചെയ്യുന്നു, കളിക്കാർക്ക് അറിയിപ്പുകൾ അയയ്ക്കുന്നു, റാങ്കിംഗ് പുനഃസജ്ജമാക്കുന്നു, കാർഡ് ഡെക്കുകളും ടേബിൾ ശൈലികളും സംഗീതവും ഇൻസ്റ്റാൾ ചെയ്യുന്നു, ക്ലയന്റിന് എത്താവുന്ന ഗെയിം സെർവറുകൾ പട്ടികപ്പെടുത്തുന്നു, അതിന്റെ ചില ഭാഗങ്ങൾ മാത്രം തുറക്കുന്ന കീകളും നൽകുന്നു.",
    "shareH2": "പുറത്തുനിന്നുള്ള കളിക്കാരെ ക്ഷണിക്കുക",
    "shareP": "ക്ഷണ ലിങ്കുകളും QR കോഡുകളും pokerth.net-ലെ പോലെ തന്നെ നിങ്ങളുടെ സെർവറിലും പ്രവർത്തിക്കും: ഒരു സുഹൃത്ത് ലിങ്ക് തുറന്നാൽ നിങ്ങളുടെ ടേബിളിൽ ഇരിക്കും. നിങ്ങളുടെ സെർവർ ഇന്റർനെറ്റിൽ നിന്ന് എത്തിച്ചേരാവുന്നതാണെങ്കിൽ, വെബ് ക്ലയന്റിന്റെ പൊതു സെർവർ ലിസ്റ്റിലേക്ക് അത് നിർദ്ദേശിക്കാനും കഴിയും; വെബ് ക്ലയന്റിന്റെ അഡ്മിൻമാർ അംഗീകരിച്ചാൽ അത് അവിടെ കാണാം.",
    "guidesH2": "ഘട്ടം ഘട്ടമായുള്ള ഗൈഡുകൾ",
    "guides": [
      "PokerTH സെർവർ സജ്ജീകരണ ഗൈഡ്",
      "സെൽഫ്-ഹോസ്റ്റിംഗും ഒറ്റ കമാൻഡ് ഇൻസ്റ്റാളും",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "മാനുവൽ ഇൻസ്റ്റാളേഷനും HTTPS-ഉം",
      "അഡ്മിൻ പാനൽ"
    ],
    "faqH2": "ചോദ്യങ്ങൾ",
    "faq": [
      [
        "PokerTH സെർവർ ഹോസ്റ്റ് ചെയ്യുന്നത് സൗജന്യമാണോ?",
        "അതെ. PokerTH സെർവറും വെബ് ക്ലയന്റും സൗജന്യ, ഓപ്പൺ സോഴ്സ് സോഫ്റ്റ്‌വെയറാണ്; അവ പ്രവർത്തിപ്പിക്കാൻ ഒരു മെഷീൻ മാത്രം മതി."
      ],
      [
        "എന്ത് ഹാർഡ്‌വെയർ വേണം?",
        "വളരെ കുറച്ച്: Linux അല്ലെങ്കിൽ Docker പ്രവർത്തിക്കുന്ന ഏത് പിസിയോ ഹോം സെർവറോ, അല്ലെങ്കിൽ ഒരു Raspberry Pi 4 അല്ലെങ്കിൽ 5. പ്രോസസിംഗ് ശേഷിയേക്കാൾ പ്രധാനം വയർഡ് നെറ്റ്‌വർക്ക് കണക്ഷനാണ്."
      ],
      [
        "കളിക്കാർ എന്തെങ്കിലും ഇൻസ്റ്റാൾ ചെയ്യണോ?",
        "വേണ്ട. അവർ ഫോണിലോ ടാബ്‌ലെറ്റിലോ കമ്പ്യൂട്ടറിലോ ഉള്ള ബ്രൗസറിൽ സെർവറിന്റെ വിലാസം തുറക്കുന്നു. ആപ്പ് ഇഷ്ടപ്പെടുന്നവർക്ക് PokerTH QML ക്ലയന്റോ ക്ലാസിക് widget ക്ലയന്റോ ഉപയോഗിക്കാം: അവ അതേ സെർവറിലേക്ക് കണക്റ്റ് ചെയ്ത് അതേ ടേബിളുകളിൽ കളിക്കുന്നു."
      ],
      [
        "ഇതിന് pokerth.net-ഓ ഇന്റർനെറ്റ് കണക്ഷനോ വേണോ?",
        "വേണ്ട. നിങ്ങളുടെ ലോക്കൽ നെറ്റ്‌വർക്കിലെ ഒരു സെർവർ സ്വതന്ത്രമായി പ്രവർത്തിക്കും: കളിക്കാർ ഒരു വിളിപ്പേര് മാത്രം ഉപയോഗിച്ച് അതിലേക്ക് നേരിട്ട് കണക്റ്റ് ചെയ്യുന്നു."
      ],
      [
        "എത്ര കളിക്കാർക്ക് ചേരാം?",
        "ഒരു ടേബിളിൽ 10 കളിക്കാർ വരെ, കൂടാതെ കാഴ്ചക്കാരും; നിങ്ങളുടെ ഗ്രൂപ്പിന് ആവശ്യമുള്ളത്ര ടേബിളുകളും."
      ]
    ]
  },
  mn: {
    "title": "Өөрийн покер сервер — үнэгүй, өөрөө байршуулах | PokerTH",
    "desc": "Гэртээ, клубт эсвэл сургуульд хувийн Texas Hold’em сервер: үнэгүй PokerTH сервер ба вэб клиентийг ганц командаар, Docker-оор эсвэл Raspberry Pi дээр суулгана.",
    "ldHeadline": "Өөрийн PokerTH покер серверийг хэрхэн байршуулах вэ",
    "ldDesc": "PokerTH тусгай сервер болон PokerTH вэб клиентээр хувийн, өөрөө байршуулсан Texas Hold’em сервер тохируулаарай.",
    "h1": "Өөрийн покер серверээ байршуулах",
    "lead": "PokerTH эхнээс нь дуустал үнэгүй, нээлттэй эхийн: тоглоомын сервер болон энэ вэб клиент таны өөрийн компьютер дээр ажиллаж чадна. Гэр бүлийн тоглолт, клубын үдэш, оффисын лиг эсвэл сургуульд PC, гэрийн сервер эсвэл Raspberry Pi хангалттай бөгөөд дараа нь таны сүлжээн дэх утас, таблет, компьютер бүр зөвхөн хочоор хөтөч дээрээ тоглоно.",
    "whyH2": "Яагаад өөрийн сервертэй байх вэ",
    "why": [
      [
        "Хувийн",
        "Таны тоглолтууд таны компьютер, сүлжээнд үлдэнэ; тоглогчдод бүртгэл ч, имэйл хаяг ч хэрэггүй, зөвхөн хоч."
      ],
      [
        "Өөрийнхөөрөө тохируулах",
        "Серверт өөрийн нэр өгч, нэвтрэх дэлгэц ямар горимуудыг санал болгохыг сонгож, мэндчилгээний мессеж нийтэлж, бүлэгтээ зориулсан нийтлэг тэргүүлэгчдийн самбар хөтлөөрэй."
      ],
      [
        "Үнэгүй",
        "Лиценз, захиалга, сурталчилгаа байхгүй: PokerTH сервер ч, вэб клиент ч чөлөөт програм хангамж."
      ]
    ],
    "partsH2": "Хоёр хэсэг",
    "partsP": "PokerTH тоглолтод хөзөр тарааж, ширээнүүдийг удирддаг PokerTH тусгай сервер, мөн програмыг хөтчүүдэд хүргэж, тэдгээрийг тэр серверт холбодог вэб клиент хэрэгтэй. Хоёулаа нэг компьютер дээр ажиллаж болно. Бүх зүйл нийцтэй хэвээр байна: PokerTH-ийн програмууд — Windows, macOS, Linux, Android-д зориулсан QML клиент болон ширээний компьютерт зориулсан сонгодог widget клиент — хөтчүүдтэй адил серверт холбогддог тул тоглогчид нэг ширээнд хөтөч болон програмыг хольж тоглож болно.",
    "stepsH2": "Гурван алхмаар тохируулах",
    "steps": [
      [
        "PokerTH серверийг суулгах",
        "PokerTH-ийн эх кодоос pokerth_dedicated_server-ийг — 2.1.10 эсвэл түүнээс хойшхи хувилбар — PokerTH төслийн серверийн зааврын дагуу бүтээгээрэй: үүнд Qt 6.7 буюу түүнээс шинэ, CMake болон C++23 хөрвүүлэгч хэрэгтэй. Linux түгээлтүүдийн pokerth-server багц нь хуучин хувилбар. Сервер TCP 7234 портыг сонсоно."
      ],
      [
        "Вэб клиентийг суулгах",
        "Debian, Ubuntu эсвэл Raspberry Pi OS дээр суулгах скрипт Node.js, вэб клиент болон компьютертэй хамт асдаг үйлчилгээг ганц командаар тохируулна. Docker хэрэглэгчид amd64, arm64, armv7-д зориулсан бэлэн дүрс (image) татаж авах ба CasaOS мөн адил Compose файлыг програм болгон импортолно."
      ],
      [
        "Тоглох",
        "Сүлжээн дэх дурын төхөөрөмж дээр компьютерийн хаягийг 8080 порт дээр нээж, “LAN / Тусгай сервер”-ийг сонгоод, хоч бичиж, ширээ үүсгээрэй. PokerTH-ийн QML эсвэл widget клиенттэй тоглогчид мөн адил компьютерт 7234 портоор холбогдож, мөн адил ширээнүүдэд нэгддэг."
      ]
    ],
    "piH2": "Raspberry Pi дээр",
    "piP": "PokerTH жижиг мессеж солилцдог бөгөөд бүх зурах ажлыг тоглогчдын төхөөрөмж хийдэг тул Raspberry Pi бүрэн хангалттай: 2 GB-тай Pi 4 хамгийн оновчтой, Pi 5 бол илүү ч хангалттай. Саадгүй үдшийн хувьд хавтангаас илүү сүлжээ чухал — Pi-г чиглүүлэгчид кабелиар холбож, тоглогчдод сайн Wi-Fi хандалтын цэг ашиглаарай.",
    "httpsH2": "LAN дээр HTTP, нэмэлт боломжуудад HTTPS",
    "httpsP": "Өөрийн сүлжээнд тоглоом энгийн HTTP-ээр ажиллана. Програмыг үндсэн дэлгэцэд суулгах, офлайн тоглох, мэдэгдэл хүлээн авахад HTTPS шаардлагатай бөгөөд заавар үүнийг Nginx болон үнэгүй Let’s Encrypt гэрчилгээгээр тохируулна.",
    "adminH2": "Хөтөч дээрх админ самбар",
    "adminP": "/admin дээрх токеноор хамгаалагдсан консол хэн холбогдсоныг харуулж, вэб клиентийг нэг товшилтоор шинэчилж, өмнөх хувилбар руу буцааж чадна, тоглогчдод зарлал илгээж, тэргүүлэгчдийн самбарыг тэглэж, хөзрийн багц, ширээний загвар, хөгжим суулгаж, клиентийн холбогдож болох тоглоомын серверүүдийн жагсаалтыг гаргаж, зөвхөн зарим хэсгийг нь нээх түлхүүрүүд олгоно.",
    "shareH2": "Гаднаас тоглогч урих",
    "shareP": "Урилгын холбоос болон QR код таны сервер дээр pokerth.net дээрхтэй яг адил ажиллана: найз холбоосыг нээгээд таны ширээнд сууна. Хэрэв таны сервер интернетээс хандах боломжтой бол түүнийг вэб клиентийн нийтийн серверийн жагсаалтад санал болгож болно; вэб клиентийн админууд зөвшөөрсний дараа тэнд гарч ирнэ.",
    "guidesH2": "Алхам алхмаар заавар",
    "guides": [
      "PokerTH сервер тохируулах заавар",
      "Өөрөө байршуулах ба ганц командаар суулгах",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Гараар суулгах ба HTTPS",
      "Админ самбар"
    ],
    "faqH2": "Асуулт",
    "faq": [
      [
        "PokerTH сервер байршуулах нь үнэгүй юу?",
        "Тийм. PokerTH сервер болон вэб клиент үнэгүй, нээлттэй эхийн програм хангамж; тэдгээрийг ажиллуулах компьютер л танд хэрэгтэй."
      ],
      [
        "Ямар тоног төхөөрөмж хэрэгтэй вэ?",
        "Маш бага: Linux эсвэл Docker ажилладаг дурын PC буюу гэрийн сервер, эсвэл Raspberry Pi 4 эсвэл 5. Утастай сүлжээний холболт тооцоолох хүчин чадлаас илүү чухал."
      ],
      [
        "Тоглогчид ямар нэг юм суулгах шаардлагатай юу?",
        "Үгүй. Тэд утас, таблет эсвэл компьютерийнхээ хөтөч дээр серверийн хаягийг нээнэ. Програм илүүд үздэг хүмүүс PokerTH-ийн QML клиент эсвэл сонгодог widget клиентийг ашиглаж болно: эдгээр нь мөн адил серверт холбогдож, мөн адил ширээнүүдэд тоглох боломж олгодог."
      ],
      [
        "pokerth.net эсвэл интернет холболт хэрэгтэй юу?",
        "Үгүй. Таны дотоод сүлжээн дэх сервер бие даан ажиллана: тоглогчид түүнд шууд, зөвхөн хочоор холбогдоно."
      ],
      [
        "Хэдэн тоглогч нэгдэж болох вэ?",
        "Нэг ширээнд 10 хүртэл тоглогч, нэмээд үзэгчид, мөн танай бүлэгт хэрэгтэй хэмжээгээр олон ширээ."
      ]
    ]
  },
  mr: {
    "title": "स्वतःचा पोकर सर्व्हर होस्ट करा — मोफत, सेल्फ-होस्टेड | PokerTH",
    "desc": "घरी, क्लबमध्ये किंवा शाळेत खाजगी Texas Hold’em सर्व्हर: मोफत PokerTH सर्व्हर आणि वेब क्लायंट, एकाच कमांडने, Docker वापरून किंवा Raspberry Pi वर सेट करा.",
    "ldHeadline": "स्वतःचा PokerTH पोकर सर्व्हर कसा होस्ट करायचा",
    "ldDesc": "PokerTH डेडिकेटेड सर्व्हर आणि PokerTH वेब क्लायंट वापरून खाजगी, सेल्फ-होस्टेड Texas Hold’em सर्व्हर सेट करा.",
    "h1": "स्वतःचा पोकर सर्व्हर होस्ट करा",
    "lead": "PokerTH सुरुवातीपासून शेवटपर्यंत मोफत आणि ओपन सोर्स आहे: गेम सर्व्हर आणि हा वेब क्लायंट तुमच्या स्वतःच्या मशीनवर चालू शकतात. कौटुंबिक गेम, क्लबची रात्र, ऑफिस लीग किंवा शाळेसाठी एक PC, होम सर्व्हर किंवा Raspberry Pi पुरेसा आहे, आणि मग तुमच्या नेटवर्कवरचा प्रत्येक फोन, टॅबलेट किंवा संगणक फक्त एका टोपणनावाने आपल्या ब्राउझरमध्ये खेळतो.",
    "whyH2": "स्वतःचा सर्व्हर का",
    "why": [
      [
        "खाजगी",
        "तुमचे गेम्स तुमच्या मशीनवर आणि तुमच्या नेटवर्कवरच राहतात; खेळाडूंना खातं किंवा ईमेल पत्ता लागत नाही, फक्त टोपणनाव."
      ],
      [
        "तुमच्या मनासारखा",
        "सर्व्हरला स्वतःचं नाव द्या, लॉगिन स्क्रीनवर कोणते मोड दिसावेत ते निवडा, स्वागत संदेश लावा आणि तुमच्या ग्रुपसाठी सामायिक लीडरबोर्ड ठेवा."
      ],
      [
        "मोफत",
        "लायसन्स नाही, सबस्क्रिप्शन नाही, जाहिराती नाहीत: PokerTH सर्व्हर आणि वेब क्लायंट दोन्ही फ्री सॉफ्टवेअर आहेत."
      ]
    ],
    "partsH2": "दोन भाग",
    "partsP": "PokerTH गेमसाठी पत्ते वाटणारा आणि टेबल्स चालवणारा PokerTH डेडिकेटेड सर्व्हर, आणि ब्राउझर्सना अ‍ॅप पुरवून त्यांना त्या सर्व्हरशी जोडणारा वेब क्लायंट लागतो. दोन्ही एकाच मशीनवर चालू शकतात. सर्व काही सुसंगत राहते: PokerTH अ‍ॅप्स — Windows, macOS, Linux आणि Android वरचा QML क्लायंट आणि डेस्कटॉपवरचा क्लासिक widget क्लायंट — ब्राउझर्स ज्या सर्व्हरशी जोडले जातात त्याच सर्व्हरशी जोडले जातात, त्यामुळे एकाच टेबलवर खेळाडू ब्राउझर्स आणि अ‍ॅप्स एकत्र वापरू शकतात.",
    "stepsH2": "तीन टप्प्यांत सेट करा",
    "steps": [
      [
        "PokerTH सर्व्हर इन्स्टॉल करा",
        "PokerTH प्रकल्पाच्या सर्व्हर मार्गदर्शकाचं पालन करून PokerTH च्या सोर्समधून pokerth_dedicated_server बिल्ड करा — आवृत्ती 2.1.10 किंवा त्यानंतरची: त्यासाठी Qt 6.7 किंवा नवीन, CMake आणि C++23 कंपायलर लागतो. Linux वितरणांमधलं pokerth-server पॅकेज जुनी आवृत्ती आहे. सर्व्हर TCP पोर्ट 7234 वर ऐकतो."
      ],
      [
        "वेब क्लायंट इन्स्टॉल करा",
        "Debian, Ubuntu किंवा Raspberry Pi OS वर इन्स्टॉलेशन स्क्रिप्ट एकाच कमांडने Node.js, वेब क्लायंट आणि मशीनसोबत सुरू होणारी सर्व्हिस सेट करते. Docker वापरणारे amd64, arm64 आणि armv7 साठी तयार इमेज पुल करतात, आणि CasaOS तीच Compose फाइल अ‍ॅप म्हणून इम्पोर्ट करतो."
      ],
      [
        "खेळा",
        "तुमच्या नेटवर्कवरच्या कोणत्याही डिव्हाइसवर त्या मशीनचा पत्ता पोर्ट 8080 वर उघडा, “LAN / डेडिकेटेड सर्व्हर” निवडा, टोपणनाव टाइप करा आणि टेबल तयार करा. PokerTH QML किंवा widget क्लायंट वापरणारे खेळाडू त्याच मशीनशी पोर्ट 7234 वर जोडले जातात आणि त्याच टेबल्सवर सामील होतात."
      ]
    ],
    "piH2": "Raspberry Pi वर",
    "piP": "PokerTH छोटे संदेश पाठवतो आणि सगळं चित्र खेळाडूंची डिव्हाइसेसच काढतात, त्यामुळे Raspberry Pi भरपूर आहे: 2 GB असलेला Pi 4 सर्वोत्तम पर्याय आहे, Pi 5 तर गरजेपेक्षा जास्त. सुरळीत संध्याकाळसाठी बोर्डपेक्षा नेटवर्क जास्त महत्त्वाचं — Pi राउटरला केबलने जोडा, आणि खेळाडूंसाठी चांगला Wi-Fi अ‍ॅक्सेस पॉइंट वापरा.",
    "httpsH2": "LAN वर HTTP, अतिरिक्त सुविधांसाठी HTTPS",
    "httpsP": "तुमच्या स्वतःच्या नेटवर्कवर गेम साध्या HTTP वर चालतो. होम स्क्रीनवर अ‍ॅप इन्स्टॉल करणं, ऑफलाइन खेळणं आणि सूचना मिळवणं यासाठी HTTPS लागतं, जे मार्गदर्शक Nginx आणि मोफत Let’s Encrypt प्रमाणपत्रासह सेट करतो.",
    "adminH2": "ब्राउझरमध्ये अ‍ॅडमिन पॅनल",
    "adminP": "/admin वरचं टोकनने संरक्षित कन्सोल कोण कनेक्ट आहे ते दाखवतं, एका क्लिकमध्ये वेब क्लायंट अपडेट करतं आणि मागील आवृत्तीवर परत नेऊ शकतं, खेळाडूंना घोषणा पाठवतं, लीडरबोर्ड रीसेट करतं, पत्त्यांचे डेक, टेबल स्टाइल्स आणि संगीत इन्स्टॉल करतं, क्लायंट कोणत्या गेम सर्व्हर्सपर्यंत पोहोचू शकतो त्यांची यादी करतं, आणि त्याचे फक्त काही विभाग उघडणाऱ्या कीज देतं.",
    "shareH2": "बाहेरच्या खेळाडूंना आमंत्रित करा",
    "shareP": "आमंत्रण लिंक्स आणि QR कोड तुमच्या सर्व्हरवरही pokerth.net प्रमाणेच काम करतात: मित्र लिंक उघडतो आणि तुमच्या टेबलवर बसतो. तुमचा सर्व्हर इंटरनेटवरून पोहोचण्याजोगा असेल, तर तुम्ही तो वेब क्लायंटच्या सार्वजनिक सर्व्हर यादीसाठी सुचवूही शकता; वेब क्लायंटच्या अ‍ॅडमिन्सनी मान्यता दिली की तो तिथे दिसतो.",
    "guidesH2": "टप्प्याटप्प्याने मार्गदर्शक",
    "guides": [
      "PokerTH सर्व्हर सेटअप मार्गदर्शक",
      "सेल्फ-होस्टिंग आणि एका कमांडने इन्स्टॉल",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "मॅन्युअल इन्स्टॉलेशन आणि HTTPS",
      "अ‍ॅडमिन पॅनल"
    ],
    "faqH2": "प्रश्न",
    "faq": [
      [
        "PokerTH सर्व्हर होस्ट करणं मोफत आहे का?",
        "हो. PokerTH सर्व्हर आणि वेब क्लायंट मोफत आणि ओपन सोर्स सॉफ्टवेअर आहेत; ते चालवण्यासाठी तुम्हाला फक्त एक मशीन लागते."
      ],
      [
        "मला कोणतं हार्डवेअर लागेल?",
        "अगदी थोडं: Linux किंवा Docker चालवणारा कोणताही PC किंवा होम सर्व्हर, किंवा Raspberry Pi 4 किंवा 5. प्रोसेसिंग पॉवरपेक्षा वायर्ड नेटवर्क कनेक्शन जास्त महत्त्वाचं आहे."
      ],
      [
        "खेळाडूंना काही इन्स्टॉल करावं लागतं का?",
        "नाही. ते आपल्या फोन, टॅबलेट किंवा संगणकाच्या ब्राउझरमध्ये सर्व्हरचा पत्ता उघडतात. ज्यांना अ‍ॅप आवडतं ते PokerTH QML क्लायंट किंवा क्लासिक widget क्लायंट वापरू शकतात: ते त्याच सर्व्हरशी जोडले जातात आणि त्याच टेबल्सवर खेळतात."
      ],
      [
        "यासाठी pokerth.net किंवा इंटरनेट कनेक्शन लागतं का?",
        "नाही. तुमच्या लोकल नेटवर्कवरचा सर्व्हर स्वतंत्रपणे चालतो: खेळाडू फक्त टोपणनावाने थेट त्याच्याशी जोडले जातात."
      ],
      [
        "किती खेळाडू सामील होऊ शकतात?",
        "प्रत्येक टेबलवर 10 खेळाडूंपर्यंत, शिवाय प्रेक्षक, आणि तुमच्या ग्रुपला लागतील तितकी टेबल्स."
      ]
    ]
  },
  ms: {
    "title": "Pelayan poker sendiri — percuma, dihos sendiri | PokerTH",
    "desc": "Pelayan Texas Hold’em peribadi di rumah, kelab atau sekolah: pelayan dan klien web PokerTH percuma, dipasang dengan satu arahan, dengan Docker atau pada Raspberry Pi.",
    "ldHeadline": "Cara mengehos pelayan poker PokerTH anda sendiri",
    "ldDesc": "Sediakan pelayan Texas Hold’em peribadi yang dihos sendiri dengan pelayan khusus PokerTH dan klien web PokerTH.",
    "h1": "Hos pelayan poker anda sendiri",
    "lead": "PokerTH percuma dan sumber terbuka dari hujung ke hujung: pelayan permainan dan klien web ini boleh berjalan pada mesin anda sendiri. Sebuah PC, pelayan rumah atau Raspberry Pi sudah memadai untuk permainan keluarga, malam kelab, liga pejabat atau sekolah, dan setiap telefon, tablet atau komputer dalam rangkaian anda kemudian bermain dalam pelayarnya hanya dengan nama panggilan.",
    "whyH2": "Mengapa hos sendiri",
    "why": [
      [
        "Peribadi",
        "Permainan anda kekal pada mesin dan rangkaian anda; pemain tidak memerlukan akaun atau alamat e-mel, hanya nama panggilan."
      ],
      [
        "Ikut citarasa anda",
        "Beri pelayan namanya sendiri, pilih mod yang ditawarkan skrin log masuk, siarkan mesej alu-aluan dan kekalkan papan peringkat bersama untuk kumpulan anda."
      ],
      [
        "Percuma",
        "Tiada lesen, tiada langganan, tiada iklan: pelayan PokerTH dan klien web kedua-duanya perisian bebas."
      ]
    ],
    "partsH2": "Dua bahagian",
    "partsP": "Permainan PokerTH memerlukan pelayan khusus PokerTH, yang mengedarkan kad dan mengendalikan meja, serta klien web, yang menyampaikan aplikasi kepada pelayar dan menyambungkannya ke pelayan tersebut. Kedua-duanya boleh berjalan pada mesin yang sama. Semuanya kekal serasi: aplikasi PokerTH — klien QML pada Windows, macOS, Linux dan Android, serta klien widget klasik pada desktop — bersambung ke pelayan yang sama seperti pelayar, jadi pemain boleh mencampurkan pelayar dan aplikasi di satu meja.",
    "stepsH2": "Sediakan dalam tiga langkah",
    "steps": [
      [
        "Pasang pelayan PokerTH",
        "Bina pokerth_dedicated_server daripada sumber PokerTH — versi 2.1.10 atau lebih baharu — dengan mengikut panduan pelayan projek PokerTH: ia memerlukan Qt 6.7 atau lebih baharu, CMake dan pengkompil C++23. Pakej pokerth-server dalam distribusi Linux ialah versi yang lebih lama. Pelayan mendengar pada port TCP 7234."
      ],
      [
        "Pasang klien web",
        "Pada Debian, Ubuntu atau Raspberry Pi OS, skrip pemasangan menyediakan Node.js, klien web dan perkhidmatan yang bermula bersama mesin, dengan satu arahan. Pengguna Docker menarik imej siap sedia untuk amd64, arm64 dan armv7, dan CasaOS mengimport fail Compose yang sama sebagai aplikasi."
      ],
      [
        "Main",
        "Pada mana-mana peranti dalam rangkaian anda, buka alamat mesin pada port 8080, pilih LAN / Server khusus, taip nama panggilan dan cipta meja. Pemain yang menggunakan klien QML atau widget PokerTH bersambung ke mesin yang sama pada port 7234 dan menyertai meja yang sama."
      ]
    ],
    "piH2": "Pada Raspberry Pi",
    "piP": "PokerTH hanya bertukar mesej kecil dan peranti pemain melakukan semua lukisan, jadi Raspberry Pi sudah lebih daripada cukup: Pi 4 dengan 2 GB ialah pilihan terbaik, Pi 5 malah berlebihan. Untuk malam yang lancar, rangkaian lebih penting daripada papan — sambungkan Pi ke penghala dengan kabel dan gunakan titik capaian Wi-Fi yang baik untuk pemain.",
    "httpsH2": "HTTP dalam LAN, HTTPS untuk ciri tambahan",
    "httpsP": "Dalam rangkaian anda sendiri, permainan berfungsi melalui HTTP biasa. Memasang aplikasi pada skrin utama, bermain di luar talian dan menerima pemberitahuan memerlukan HTTPS, yang disediakan oleh panduan dengan Nginx dan sijil Let’s Encrypt percuma.",
    "adminH2": "Panel pentadbir dalam pelayar",
    "adminP": "Konsol yang dilindungi token di /admin menunjukkan siapa yang bersambung, mengemas kini klien web dengan satu klik dan boleh mengembalikannya, menghantar pengumuman kepada pemain, menetapkan semula papan peringkat, memasang dek kad, gaya meja dan muzik, menyenaraikan pelayan permainan yang boleh dicapai oleh klien, dan memberikan kunci yang hanya membuka sebahagian daripada bahagiannya.",
    "shareH2": "Jemput pemain dari luar",
    "shareP": "Pautan jemputan dan kod QR berfungsi pada pelayan anda sama seperti di pokerth.net: rakan membuka pautan dan terus duduk di meja anda. Jika pelayan anda boleh dicapai dari internet, anda juga boleh mencadangkannya untuk senarai pelayan awam klien web; ia akan muncul di sana sebaik sahaja pentadbir klien web meluluskannya.",
    "guidesH2": "Panduan langkah demi langkah",
    "guides": [
      "Panduan persediaan pelayan PokerTH",
      "Hos sendiri dan pemasangan satu arahan",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Pemasangan manual dan HTTPS",
      "Panel pentadbir"
    ],
    "faqH2": "Soalan",
    "faq": [
      [
        "Adakah mengehos pelayan PokerTH percuma?",
        "Ya. Pelayan PokerTH dan klien web ialah perisian percuma dan sumber terbuka; anda hanya memerlukan mesin untuk menjalankannya."
      ],
      [
        "Perkakasan apa yang saya perlukan?",
        "Sangat sedikit: mana-mana PC atau pelayan rumah yang menjalankan Linux atau Docker, atau Raspberry Pi 4 atau 5. Sambungan rangkaian berwayar lebih penting daripada kuasa pemprosesan."
      ],
      [
        "Adakah pemain perlu memasang apa-apa?",
        "Tidak. Mereka membuka alamat pelayan dalam pelayar pada telefon, tablet atau komputer mereka. Mereka yang lebih suka aplikasi boleh menggunakan klien QML PokerTH atau klien widget klasik: mereka bersambung ke pelayan yang sama dan bermain di meja yang sama."
      ],
      [
        "Adakah ia memerlukan pokerth.net atau sambungan internet?",
        "Tidak. Pelayan dalam rangkaian setempat anda berjalan sendiri: pemain bersambung terus kepadanya, hanya dengan nama panggilan."
      ],
      [
        "Berapa ramai pemain boleh menyertai?",
        "Sehingga 10 pemain bagi setiap meja, serta penonton, dan seberapa banyak meja yang diperlukan oleh kumpulan anda."
      ]
    ]
  },
  my: {
    "title": "ကိုယ်ပိုင် ပိုကာဆာဗာ — အခမဲ့၊ ကိုယ်တိုင် လည်ပတ် | PokerTH",
    "desc": "အိမ်၊ ကလပ်၊ ကျောင်းအတွက် သီးသန့် Texas Hold’em ဆာဗာ: အခမဲ့ PokerTH ဆာဗာနှင့် ဝဘ်ကလိုင်းယင့်၊ အမိန့်တစ်ကြောင်းဖြင့် ထည့်သွင်း၊ Docker သို့မဟုတ် Raspberry Pi ပေါ်တွင်။",
    "ldHeadline": "ကိုယ်ပိုင် PokerTH ပိုကာဆာဗာ လည်ပတ်နည်း",
    "ldDesc": "PokerTH သီးသန့်ဆာဗာနှင့် PokerTH ဝဘ်ကလိုင်းယင့်ဖြင့် ကိုယ်တိုင်လည်ပတ်သော သီးသန့် Texas Hold’em ဆာဗာတစ်ခု တည်ဆောက်ပါ။",
    "h1": "ကိုယ်ပိုင် ပိုကာဆာဗာ လည်ပတ်ပါ",
    "lead": "PokerTH သည် အစမှအဆုံး အခမဲ့ဖြစ်ပြီး ရင်းမြစ်ကုဒ် ဖွင့်ထားသည်: ဂိမ်းဆာဗာနှင့် ဤဝဘ်ကလိုင်းယင့်ကို သင့်ကိုယ်ပိုင်စက်ပေါ်တွင် လည်ပတ်နိုင်သည်။ မိသားစုဂိမ်း၊ ကလပ်ညတစ်ည၊ ရုံးလိဂ် သို့မဟုတ် ကျောင်းအတွက် PC၊ အိမ်သုံးဆာဗာ သို့မဟုတ် Raspberry Pi တစ်လုံးဖြင့် လုံလောက်ပြီး ထို့နောက် သင့်ကွန်ရက်ပေါ်ရှိ ဖုန်း၊ တက်ဘလက် သို့မဟုတ် ကွန်ပျူတာတိုင်းသည် အမည်ပြောင်တစ်ခုတည်းဖြင့် မိမိဘရောက်ဇာတွင် ကစားနိုင်သည်။",
    "whyH2": "ကိုယ်ပိုင်ဆာဗာ ဘာကြောင့် လည်ပတ်သင့်သလဲ",
    "why": [
      [
        "သီးသန့်",
        "သင့်ဂိမ်းများသည် သင့်စက်နှင့် သင့်ကွန်ရက်ပေါ်တွင်သာ ရှိနေသည်၊ ကစားသမားများ အကောင့် သို့မဟုတ် အီးမေးလ်လိပ်စာ မလိုဘဲ အမည်ပြောင်တစ်ခုသာ လိုသည်။"
      ],
      [
        "စိတ်ကြိုက် ပြင်ဆင်နိုင်",
        "ဆာဗာကို ကိုယ်ပိုင်အမည် ပေးပါ၊ ဝင်ရောက်မျက်နှာပြင်တွင် မည်သည့်မုဒ်များ ပြမည်ကို ရွေးပါ၊ ကြိုဆိုစာ တင်ပါ၊ သင့်အဖွဲ့အတွက် မျှဝေသုံး အဆင့်ဇယား ထားပါ။"
      ],
      [
        "အခမဲ့",
        "လိုင်စင်ခ မရှိ၊ စာရင်းသွင်းကြေး မရှိ၊ ကြော်ငြာ မရှိ: PokerTH ဆာဗာနှင့် ဝဘ်ကလိုင်းယင့် နှစ်ခုစလုံးသည် လွတ်လပ်သော ဆော့ဖ်ဝဲ ဖြစ်သည်။"
      ]
    ],
    "partsH2": "အစိတ်အပိုင်း နှစ်ခု",
    "partsP": "PokerTH ဂိမ်းတစ်ခုတွင် ဖဲဝေပြီး စားပွဲများကို လည်ပတ်ပေးသော PokerTH သီးသန့်ဆာဗာနှင့် ဘရောက်ဇာများသို့ အက်ပ်ကို ပေးပို့ပြီး ၎င်းတို့ကို ထိုဆာဗာနှင့် ချိတ်ဆက်ပေးသော ဝဘ်ကလိုင်းယင့် လိုအပ်သည်။ နှစ်ခုစလုံးကို စက်တစ်လုံးတည်းတွင် လည်ပတ်နိုင်သည်။ အားလုံး လိုက်ဖက်ညီမှု ရှိနေဆဲဖြစ်သည် - PokerTH အက်ပ်များသည် ဘရောက်ဇာများနှင့် တူညီသော ဆာဗာသို့ ချိတ်ဆက်သည် — Windows၊ macOS၊ Linux နှင့် Android ပေါ်ရှိ QML ကလိုင်းယင့်နှင့် ဒက်စ်တော့ပေါ်ရှိ ဂန္ထဝင် widget ကလိုင်းယင့် — ထို့ကြောင့် ကစားသမားများသည် စားပွဲတစ်ခုတည်းတွင် ဘရောက်ဇာနှင့် အက်ပ်များကို ရောနှော ကစားနိုင်သည်။",
    "stepsH2": "အဆင့်သုံးဆင့်ဖြင့် တည်ဆောက်ပါ",
    "steps": [
      [
        "PokerTH ဆာဗာကို ထည့်သွင်းပါ",
        "PokerTH ပရောဂျက်၏ ဆာဗာလမ်းညွှန်အတိုင်း PokerTH ရင်းမြစ်ကုဒ်မှ pokerth_dedicated_server ကို ကွန်ပိုင်းလုပ်ပါ — ဗားရှင်း 2.1.10 သို့မဟုတ် နောက်ပိုင်း: ၎င်းအတွက် Qt 6.7 သို့မဟုတ် ပိုသစ်သော ဗားရှင်း၊ CMake နှင့် C++23 ကွန်ပိုင်လာ လိုအပ်သည်။ Linux ဖြန့်ချိမှုများရှိ pokerth-server ပက်ကေ့ဂျ်သည် ဗားရှင်းဟောင်း ဖြစ်သည်။ ဆာဗာသည် TCP ပို့တ် 7234 ကို နားထောင်သည်။"
      ],
      [
        "ဝဘ်ကလိုင်းယင့်ကို ထည့်သွင်းပါ",
        "Debian၊ Ubuntu သို့မဟုတ် Raspberry Pi OS ပေါ်တွင် ထည့်သွင်းရေး script သည် Node.js၊ ဝဘ်ကလိုင်းယင့်နှင့် စက်နှင့်အတူ စတင်သော ဝန်ဆောင်မှုတစ်ခုကို အမိန့်တစ်ကြောင်းတည်းဖြင့် တပ်ဆင်ပေးသည်။ Docker အသုံးပြုသူများသည် amd64၊ arm64 နှင့် armv7 အတွက် အသင့်လုပ်ထားသော image ကို ဆွဲယူနိုင်ပြီး CasaOS သည် တူညီသော Compose ဖိုင်ကို အက်ပ်တစ်ခုအဖြစ် တင်သွင်းသည်။"
      ],
      [
        "ကစားပါ",
        "သင့်ကွန်ရက်ပေါ်ရှိ မည်သည့်စက်ပစ္စည်းတွင်မဆို စက်၏လိပ်စာကို ပို့တ် 8080 ဖြင့် ဖွင့်ပါ၊ “LAN / သီးသန့်ဆာဗာ” ကို ရွေးပါ၊ အမည်ပြောင်တစ်ခု ရိုက်ထည့်ပြီး စားပွဲတစ်ခု ဖန်တီးပါ။ PokerTH QML သို့မဟုတ် widget ကလိုင်းယင့်ကို သုံးသော ကစားသမားများသည် ထိုစက်တည်းသို့ ပို့တ် 7234 ဖြင့် ချိတ်ဆက်ပြီး တူညီသော စားပွဲများသို့ ဝင်ရောက်ကြသည်။"
      ]
    ],
    "piH2": "Raspberry Pi ပေါ်တွင်",
    "piP": "PokerTH သည် သေးငယ်သော မက်ဆေ့ချ်များကိုသာ ဖလှယ်ပြီး ပုံဆွဲခြင်းအားလုံးကို ကစားသမားများ၏ စက်များက လုပ်ဆောင်သဖြင့် Raspberry Pi တစ်လုံးဖြင့် အလုံအလောက် ဖြစ်သည်: 2 GB ပါသော Pi 4 သည် အကောင်းဆုံး ရွေးချယ်မှုဖြစ်ပြီး Pi 5 မှာ လိုသည်ထက် ပိုသည်။ ချောမွေ့သော ညတစ်ညအတွက် ဘုတ်ထက် ကွန်ရက်က ပိုအရေးကြီးသည် — Pi ကို ကြိုးဖြင့် router နှင့် ချိတ်ပြီး ကစားသမားများအတွက် ကောင်းမွန်သော Wi-Fi access point တစ်ခုကို သုံးပါ။",
    "httpsH2": "LAN တွင် HTTP၊ အပိုလုပ်ဆောင်ချက်များအတွက် HTTPS",
    "httpsP": "သင့်ကိုယ်ပိုင်ကွန်ရက်ပေါ်တွင် ဂိမ်းသည် ရိုးရိုး HTTP ဖြင့် အလုပ်လုပ်သည်။ အက်ပ်ကို ပင်မမျက်နှာပြင်တွင် ထည့်သွင်းခြင်း၊ အော့ဖ်လိုင်း ကစားခြင်းနှင့် အသိပေးချက်များ လက်ခံခြင်းတို့အတွက် HTTPS လိုအပ်ပြီး လမ်းညွှန်က ၎င်းကို Nginx နှင့် အခမဲ့ Let’s Encrypt လက်မှတ်ဖြင့် တပ်ဆင်ပေးသည်။",
    "adminH2": "ဘရောက်ဇာထဲရှိ အက်ဒမင်ပန်နယ်",
    "adminP": "/admin ရှိ token ဖြင့် ကာကွယ်ထားသော ကွန်ဆိုးလ်သည် မည်သူ ချိတ်ဆက်ထားသည်ကို ပြသည်၊ ဝဘ်ကလိုင်းယင့်ကို တစ်ချက်နှိပ်ရုံဖြင့် အပ်ဒိတ်လုပ်ပြီး ယခင်ဗားရှင်းသို့ ပြန်ပြောင်းနိုင်သည်၊ ကစားသမားများထံ ကြေညာချက်များ ပို့သည်၊ အဆင့်ဇယားကို ပြန်လည်သတ်မှတ်သည်၊ ဖဲထုပ်များ၊ စားပွဲပုံစံများနှင့် ဂီတကို ထည့်သွင်းသည်၊ ကလိုင်းယင့် ချိတ်ဆက်ခွင့်ရှိသော ဂိမ်းဆာဗာများကို စာရင်းပြုစုသည်၊ ၎င်း၏ အပိုင်းအချို့ကိုသာ ဖွင့်ပေးသော ကီးများကို ထုတ်ပေးသည်။",
    "shareH2": "ပြင်ပမှ ကစားသမားများကို ဖိတ်ပါ",
    "shareP": "ဖိတ်ကြားလင့်ခ်များနှင့် QR ကုဒ်များသည် သင့်ဆာဗာပေါ်တွင် pokerth.net ပေါ်ကဲ့သို့ပင် အလုပ်လုပ်သည်: သူငယ်ချင်းတစ်ယောက်က လင့်ခ်ကို ဖွင့်လိုက်သည်နှင့် သင့်စားပွဲတွင် နေရာရသည်။ သင့်ဆာဗာကို အင်တာနက်မှ ချိတ်ဆက်နိုင်လျှင် ဝဘ်ကလိုင်းယင့်၏ အများသုံးဆာဗာစာရင်းအတွက်လည်း အဆိုပြုနိုင်သည်၊ ဝဘ်ကလိုင်းယင့်၏ အက်ဒမင်များက အတည်ပြုပြီးသည်နှင့် ထိုစာရင်းတွင် ပေါ်လာမည်။",
    "guidesH2": "အဆင့်ဆင့် လမ်းညွှန်များ",
    "guides": [
      "PokerTH ဆာဗာ တပ်ဆင်ရေး လမ်းညွှန်",
      "ကိုယ်တိုင်လည်ပတ်ခြင်းနှင့် အမိန့်တစ်ကြောင်းတည်းဖြင့် ထည့်သွင်းခြင်း",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "ကိုယ်တိုင်ထည့်သွင်းခြင်းနှင့် HTTPS",
      "အက်ဒမင်ပန်နယ်"
    ],
    "faqH2": "မေးခွန်းများ",
    "faq": [
      [
        "PokerTH ဆာဗာ လည်ပတ်ခြင်းသည် အခမဲ့လား?",
        "ဟုတ်ကဲ့။ PokerTH ဆာဗာနှင့် ဝဘ်ကလိုင်းယင့်သည် အခမဲ့ ရင်းမြစ်ဖွင့် ဆော့ဖ်ဝဲများ ဖြစ်သည်၊ ၎င်းတို့ကို လည်ပတ်ရန် စက်တစ်လုံးသာ လိုသည်။"
      ],
      [
        "ဘယ်လို ဟာ့ဒ်ဝဲ လိုအပ်သလဲ?",
        "အနည်းငယ်သာ: Linux သို့မဟုတ် Docker လည်ပတ်နိုင်သော မည်သည့် PC သို့မဟုတ် အိမ်သုံးဆာဗာမဆို၊ သို့မဟုတ် Raspberry Pi 4 သို့မဟုတ် 5။ ကြိုးဖြင့်ချိတ်သော ကွန်ရက်ချိတ်ဆက်မှုသည် ပရိုဆက်ဆင် စွမ်းအားထက် ပိုအရေးကြီးသည်။"
      ],
      [
        "ကစားသမားများ တစ်ခုခု ထည့်သွင်းရန် လိုပါသလား?",
        "မလိုပါ။ ၎င်းတို့သည် မိမိဖုန်း၊ တက်ဘလက် သို့မဟုတ် ကွန်ပျူတာရှိ ဘရောက်ဇာတွင် ဆာဗာလိပ်စာကို ဖွင့်ရုံသာ ဖြစ်သည်။ အက်ပ်ကို ပိုနှစ်သက်သူများသည် PokerTH QML ကလိုင်းယင့် သို့မဟုတ် ဂန္ထဝင် widget ကလိုင်းယင့်ကို သုံးနိုင်သည် - ၎င်းတို့သည် တူညီသော ဆာဗာသို့ ချိတ်ဆက်ပြီး တူညီသော စားပွဲများတွင် ကစားကြသည်။"
      ],
      [
        "pokerth.net သို့မဟုတ် အင်တာနက်ချိတ်ဆက်မှု လိုပါသလား?",
        "မလိုပါ။ သင့်ဒေသတွင်းကွန်ရက်ပေါ်ရှိ ဆာဗာသည် သီးခြား လည်ပတ်သည်: ကစားသမားများသည် အမည်ပြောင်တစ်ခုတည်းဖြင့် ၎င်းနှင့် တိုက်ရိုက် ချိတ်ဆက်ကြသည်။"
      ],
      [
        "ကစားသမား ဘယ်နှစ်ဦး ဝင်နိုင်သလဲ?",
        "စားပွဲတစ်ခုလျှင် ကစားသမား ၁၀ ဦးအထိ၊ ကြည့်ရှုသူများ ထပ်ပေါင်း၍ သင့်အဖွဲ့ လိုသလောက် စားပွဲများ။"
      ]
    ]
  },
  nb: {
    "title": "Kjør din egen pokerserver — gratis, selvhostet | PokerTH",
    "desc": "En privat Texas Hold’em-server hjemme, i en klubb eller på en skole: gratis PokerTH-server og nettklient, satt opp med én kommando, med Docker eller på Raspberry Pi.",
    "ldHeadline": "Slik kjører du din egen PokerTH-pokerserver",
    "ldDesc": "Sett opp en privat, selvhostet Texas Hold’em-server med den dedikerte PokerTH-serveren og PokerTH-nettklienten.",
    "h1": "Kjør din egen pokerserver",
    "lead": "PokerTH er gratis og åpen kildekode fra ende til annen: spillserveren og denne nettklienten kan kjøre på din egen maskin. En PC, en hjemmeserver eller en Raspberry Pi holder for et familiespill, en klubbkveld, en kontorliga eller en skole, og da spiller hver telefon, hvert nettbrett og hver datamaskin på nettverket ditt i nettleseren med bare et kallenavn.",
    "whyH2": "Hvorfor ha din egen",
    "why": [
      [
        "Privat",
        "Spillene dine blir på din maskin og ditt nettverk; spillerne trenger verken konto eller e-postadresse, bare et kallenavn."
      ],
      [
        "Formet etter deg",
        "Gi serveren et eget navn, velg hvilke moduser innloggingsskjermen tilbyr, legg ut en velkomstmelding, og hold en felles rangering for gruppen din."
      ],
      [
        "Gratis",
        "Ingen lisens, intet abonnement, ingen reklame: PokerTH-serveren og nettklienten er begge fri programvare."
      ]
    ],
    "partsH2": "To deler",
    "partsP": "Et PokerTH-spill trenger den dedikerte PokerTH-serveren, som deler ut kortene og styrer bordene, og nettklienten, som leverer appen til nettleserne og kobler dem til den serveren. De kan kjøre på samme maskin. Alt forblir kompatibelt: PokerTH-appene – QML-klienten for Windows, macOS, Linux og Android og den klassiske widget-klienten for skrivebordet – kobler seg til den samme serveren som nettleserne, så spillerne kan blande nettlesere og apper ved ett bord.",
    "stepsH2": "Sett det opp i tre trinn",
    "steps": [
      [
        "Installer PokerTH-serveren",
        "Bygg pokerth_dedicated_server fra PokerTH-kildekoden — versjon 2.1.10 eller nyere — ved å følge serverveiledningen til PokerTH-prosjektet: den krever Qt 6.7 eller nyere, CMake og en C++23-kompilator. Pakken pokerth-server i Linux-distribusjonene er en eldre versjon. Serveren lytter på TCP-port 7234."
      ],
      [
        "Installer nettklienten",
        "På Debian, Ubuntu eller Raspberry Pi OS setter installasjonsskriptet opp Node.js, nettklienten og en tjeneste som starter med maskinen, med én kommando. Docker-brukere henter et ferdig image for amd64, arm64 og armv7, og CasaOS importerer den samme Compose-filen som en app."
      ],
      [
        "Spill",
        "Åpne maskinens adresse på port 8080 fra en hvilken som helst enhet på nettverket ditt, velg «LAN / Dedikert server», skriv inn et kallenavn og opprett et bord. Spillere med QML- eller widget-klienten til PokerTH kobler seg til den samme maskinen på port 7234 og blir med ved de samme bordene."
      ]
    ],
    "piH2": "På en Raspberry Pi",
    "piP": "PokerTH utveksler små meldinger, og spillernes enheter tar seg av all tegningen, så en Raspberry Pi holder i massevis: en Pi 4 med 2 GB er det perfekte valget, en Pi 5 er mer enn nok. For en knirkefri kveld betyr nettverket mer enn kortet — koble Pi-en til ruteren med kabel, og bruk et godt Wi-Fi-tilgangspunkt for spillerne.",
    "httpsH2": "HTTP på LAN, HTTPS for ekstrafunksjonene",
    "httpsP": "På ditt eget nettverk fungerer spillet over vanlig HTTP. Å installere appen på startskjermen, spille frakoblet og motta varsler krever HTTPS, som veiledningen setter opp med Nginx og et gratis Let’s Encrypt-sertifikat.",
    "adminH2": "Et administrasjonspanel i nettleseren",
    "adminP": "En tokenbeskyttet konsoll på /admin viser hvem som er tilkoblet, oppdaterer nettklienten med ett klikk og kan rulle den tilbake, sender kunngjøringer til spillerne, nullstiller rangeringen, installerer kortstokker, bordstiler og musikk, lister opp spillserverne klienten får nå, og deler ut nøkler som bare låser opp noen av seksjonene.",
    "shareH2": "Inviter spillere utenfra",
    "shareP": "Invitasjonslenker og QR-koder fungerer på serveren din akkurat som på pokerth.net: en venn åpner lenken og får plass ved bordet ditt. Hvis serveren din kan nås fra internett, kan du også foreslå den til nettklientens offentlige serverliste; den dukker opp der når administratorene av nettklienten godkjenner den.",
    "guidesH2": "Trinnvise veiledninger",
    "guides": [
      "Veiledning for oppsett av PokerTH-serveren",
      "Selvhosting og installasjon med én kommando",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Manuell installasjon og HTTPS",
      "Administrasjonspanelet"
    ],
    "faqH2": "Spørsmål",
    "faq": [
      [
        "Er det gratis å kjøre en PokerTH-server?",
        "Ja. PokerTH-serveren og nettklienten er gratis programvare med åpen kildekode; du trenger bare en maskin å kjøre dem på."
      ],
      [
        "Hvilken maskinvare trenger jeg?",
        "Svært lite: en hvilken som helst PC eller hjemmeserver som kjører Linux eller Docker, eller en Raspberry Pi 4 eller 5. En kablet nettverkstilkobling betyr mer enn regnekraft."
      ],
      [
        "Må spillerne installere noe?",
        "Nei. De åpner serverens adresse i en nettleser på telefonen, nettbrettet eller datamaskinen. De som foretrekker en app, kan bruke QML-klienten til PokerTH eller den klassiske widget-klienten: de kobler seg til den samme serveren og spiller ved de samme bordene."
      ],
      [
        "Trenger den pokerth.net eller en internettforbindelse?",
        "Nei. En server på ditt lokale nettverk klarer seg selv: spillerne kobler seg direkte til den med bare et kallenavn."
      ],
      [
        "Hvor mange spillere kan bli med?",
        "Opptil 10 spillere per bord, pluss tilskuere, og så mange bord som gruppen din trenger."
      ]
    ]
  },
  ne: {
    "title": "आफ्नै पोकर सर्भर — निःशुल्क, सेल्फ-होस्टेड | PokerTH",
    "desc": "घर, क्लब वा विद्यालयमा निजी Texas Hold’em सर्भर: निःशुल्क PokerTH सर्भर र वेब क्लाइन्ट, एउटै कमान्डमा सेटअप, Docker बाट वा Raspberry Pi मा।",
    "ldHeadline": "आफ्नै PokerTH पोकर सर्भर कसरी होस्ट गर्ने",
    "ldDesc": "PokerTH समर्पित सर्भर र PokerTH वेब क्लाइन्टसँग निजी, सेल्फ-होस्टेड Texas Hold’em सर्भर सेटअप गर्नुहोस्।",
    "h1": "आफ्नै पोकर सर्भर होस्ट गर्नुहोस्",
    "lead": "PokerTH सुरुदेखि अन्त्यसम्म निःशुल्क र खुला स्रोत हो: खेल सर्भर र यो वेब क्लाइन्ट तपाईंकै मेसिनमा चल्न सक्छन्। परिवारको खेल, क्लबको साँझ, कार्यालयको लिग वा विद्यालयका लागि एउटा PC, होम सर्भर वा Raspberry Pi पर्याप्त हुन्छ, र त्यसपछि तपाईंको नेटवर्कमा भएका हरेक फोन, ट्याब्लेट वा कम्प्युटरले उपनाम मात्र राखेर ब्राउजरमा खेल्छ।",
    "whyH2": "आफ्नै सर्भर किन",
    "why": [
      [
        "निजी",
        "तपाईंका खेलहरू तपाईंकै मेसिन र नेटवर्कमा रहन्छन्; खेलाडीलाई खाता वा इमेल ठेगाना चाहिँदैन, उपनाम मात्र पुग्छ।"
      ],
      [
        "आफ्नै अनुसार",
        "सर्भरलाई आफ्नै नाम दिनुहोस्, लग इन स्क्रिनले कुन मोडहरू देखाउने छान्नुहोस्, स्वागत सन्देश राख्नुहोस्, र आफ्नो समूहका लागि साझा लिडरबोर्ड राख्नुहोस्।"
      ],
      [
        "निःशुल्क",
        "लाइसेन्स छैन, सदस्यता छैन, विज्ञापन छैन: PokerTH सर्भर र वेब क्लाइन्ट दुवै स्वतन्त्र सफ्टवेयर हुन्।"
      ]
    ],
    "partsH2": "दुई भाग",
    "partsP": "PokerTH खेलका लागि PokerTH समर्पित सर्भर चाहिन्छ, जसले पत्ती बाँड्छ र टेबलहरू चलाउँछ, र वेब क्लाइन्ट चाहिन्छ, जसले ब्राउजरहरूलाई एप दिन्छ र तिनलाई त्यो सर्भरसँग जोड्छ। दुवै एउटै मेसिनमा चल्न सक्छन्। सबै कुरा अनुकूल नै रहन्छ: PokerTH एपहरू ब्राउजरहरू जस्तै त्यही सर्भरमा जोडिन्छन् — Windows, macOS, Linux र Android का लागि QML क्लाइन्ट, र डेस्कटपका लागि क्लासिक widget क्लाइन्ट — त्यसैले एउटै टेबलमा खेलाडीहरूले ब्राउजर र एप मिसाएर खेल्न सक्छन्।",
    "stepsH2": "तीन चरणमा सेटअप",
    "steps": [
      [
        "PokerTH सर्भर इन्स्टल गर्नुहोस्",
        "PokerTH परियोजनाको सर्भर गाइड पछ्याउँदै PokerTH को स्रोत कोडबाट pokerth_dedicated_server बिल्ड गर्नुहोस् — संस्करण 2.1.10 वा त्योभन्दा नयाँ: यसका लागि Qt 6.7 वा नयाँ, CMake र C++23 कम्पाइलर चाहिन्छ। Linux वितरणहरूको pokerth-server प्याकेज पुरानो संस्करण हो। सर्भरले TCP पोर्ट 7234 मा सुन्छ।"
      ],
      [
        "वेब क्लाइन्ट इन्स्टल गर्नुहोस्",
        "Debian, Ubuntu वा Raspberry Pi OS मा इन्स्टलेसन स्क्रिप्टले एउटै कमान्डमा Node.js, वेब क्लाइन्ट र मेसिनसँगै सुरु हुने सेवा सेटअप गर्छ। Docker प्रयोगकर्ताहरूले amd64, arm64 र armv7 का लागि तयारी इमेज पुल गर्छन्, र CasaOS ले त्यही Compose फाइललाई एपको रूपमा आयात गर्छ।"
      ],
      [
        "खेल्नुहोस्",
        "तपाईंको नेटवर्कको जुनसुकै उपकरणमा पोर्ट 8080 मा मेसिनको ठेगाना खोल्नुहोस्, ‘LAN / समर्पित सर्भर’ छान्नुहोस्, उपनाम टाइप गर्नुहोस् र टेबल बनाउनुहोस्। PokerTH QML वा widget क्लाइन्ट भएका खेलाडीहरू पोर्ट 7234 मा त्यही मेसिनसँग जोडिन्छन् र उही टेबलहरूमा सामेल हुन्छन्।"
      ]
    ],
    "piH2": "Raspberry Pi मा",
    "piP": "PokerTH ले साना सन्देश मात्र आदानप्रदान गर्छ र सबै चित्र खेलाडीका उपकरणले नै बनाउँछन्, त्यसैले Raspberry Pi प्रशस्त हुन्छ: 2 GB को Pi 4 उत्तम छनोट हो, Pi 5 आवश्यकताभन्दा बढी हो। सहज साँझका लागि बोर्डभन्दा नेटवर्क महत्त्वपूर्ण हुन्छ — Pi लाई केबलले राउटरमा जोड्नुहोस्, र खेलाडीका लागि राम्रो Wi-Fi एक्सेस पोइन्ट प्रयोग गर्नुहोस्।",
    "httpsH2": "LAN मा HTTP, थप सुविधाका लागि HTTPS",
    "httpsP": "तपाईंकै नेटवर्कमा खेल साधारण HTTP मा चल्छ। होम स्क्रिनमा एप इन्स्टल गर्न, अफलाइन खेल्न र सूचना पाउन HTTPS चाहिन्छ, जुन गाइडले Nginx र निःशुल्क Let’s Encrypt प्रमाणपत्रसँग सेटअप गर्छ।",
    "adminH2": "ब्राउजरमै एडमिन प्यानल",
    "adminP": "/admin मा रहेको टोकनले सुरक्षित कन्सोलले को जोडिएको छ देखाउँछ, एक क्लिकमा वेब क्लाइन्ट अपडेट गर्छ र पहिलेको संस्करणमा फर्काउन पनि सक्छ, खेलाडीहरूलाई घोषणा पठाउँछ, लिडरबोर्ड रिसेट गर्छ, कार्ड डेक, टेबल शैली र संगीत इन्स्टल गर्छ, क्लाइन्टले पुग्न सक्ने खेल सर्भरहरूको सूची तय गर्छ, र यसका केही खण्ड मात्र खोल्ने कुञ्जीहरू दिन्छ।",
    "shareH2": "बाहिरका खेलाडीलाई निम्तो दिनुहोस्",
    "shareP": "निम्तो लिङ्क र QR कोड तपाईंको सर्भरमा पनि pokerth.net मा जस्तै काम गर्छन्: साथीले लिङ्क खोल्छ र तपाईंको टेबलमा बस्छ। तपाईंको सर्भर इन्टरनेटबाट पहुँचयोग्य छ भने, तपाईं यसलाई वेब क्लाइन्टको सार्वजनिक सर्भर सूचीका लागि प्रस्ताव पनि गर्न सक्नुहुन्छ; वेब क्लाइन्टका एडमिनहरूले स्वीकृत गरेपछि यो त्यहाँ देखिन्छ।",
    "guidesH2": "चरणबद्ध गाइडहरू",
    "guides": [
      "PokerTH सर्भर सेटअप गाइड",
      "सेल्फ-होस्टिङ र एउटै कमान्डमा इन्स्टल",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "म्यानुअल इन्स्टलेसन र HTTPS",
      "एडमिन प्यानल"
    ],
    "faqH2": "प्रश्नहरू",
    "faq": [
      [
        "PokerTH सर्भर होस्ट गर्न निःशुल्क छ?",
        "छ। PokerTH सर्भर र वेब क्लाइन्ट निःशुल्क र खुला स्रोत सफ्टवेयर हुन्; तिनलाई चलाउन एउटा मेसिन मात्र चाहिन्छ।"
      ],
      [
        "मलाई कस्तो हार्डवेयर चाहिन्छ?",
        "धेरै थोरै: Linux वा Docker चल्ने जुनसुकै PC वा होम सर्भर, वा Raspberry Pi 4 वा 5। प्रोसेसिङ क्षमताभन्दा तारवाला नेटवर्क जडान बढी महत्त्वपूर्ण हुन्छ।"
      ],
      [
        "खेलाडीले केही इन्स्टल गर्नुपर्छ?",
        "पर्दैन। उनीहरूले आफ्नो फोन, ट्याब्लेट वा कम्प्युटरको ब्राउजरमा सर्भरको ठेगाना खोल्छन्। एप रुचाउनेहरूले PokerTH QML क्लाइन्ट वा क्लासिक widget क्लाइन्ट प्रयोग गर्न सक्छन्: ती त्यही सर्भरमा जोडिन्छन् र तिनबाट उही टेबलहरूमा खेल्न सकिन्छ।"
      ],
      [
        "यसका लागि pokerth.net वा इन्टरनेट जडान चाहिन्छ?",
        "चाहिँदैन। तपाईंको स्थानीय नेटवर्कको सर्भर आफैँ चल्छ: खेलाडीहरू उपनाम मात्र राखेर सीधै त्यसमा जोडिन्छन्।"
      ],
      [
        "कति खेलाडी सामेल हुन सक्छन्?",
        "एउटा टेबलमा बढीमा 10 खेलाडी, साथै दर्शकहरू, र तपाईंको समूहलाई चाहिने जति टेबल।"
      ]
    ]
  },
  nl: {
    "title": "Je eigen pokerserver hosten — gratis, self-hosted | PokerTH",
    "desc": "Een privé Texas Hold’em-server thuis, in een club of op school: de gratis PokerTH-server en webclient, opgezet met één commando, met Docker of op een Raspberry Pi.",
    "ldHeadline": "Zo host je je eigen PokerTH-pokerserver",
    "ldDesc": "Zet een privé, zelf gehoste Texas Hold’em-server op met de dedicated server van PokerTH en de PokerTH-webclient.",
    "h1": "Host je eigen pokerserver",
    "lead": "PokerTH is van begin tot eind gratis en open source: de gameserver en deze webclient kunnen op je eigen machine draaien. Een pc, een thuisserver of een Raspberry Pi is genoeg voor een spelletje met het gezin, een clubavond, een kantoorcompetitie of een school, en daarna speelt elke telefoon, tablet of computer op je netwerk in de browser met alleen een bijnaam.",
    "whyH2": "Waarom een eigen server",
    "why": [
      [
        "Privé",
        "Je spellen blijven op je eigen machine en je eigen netwerk; spelers hebben geen account en geen e-mailadres nodig, alleen een bijnaam."
      ],
      [
        "Naar jouw hand",
        "Geef de server een eigen naam, kies welke modi het inlogscherm aanbiedt, plaats een welkomstbericht en houd een gedeelde ranglijst bij voor je groep."
      ],
      [
        "Gratis",
        "Geen licentie, geen abonnement, geen advertenties: de PokerTH-server en de webclient zijn allebei vrije software."
      ]
    ],
    "partsH2": "Twee onderdelen",
    "partsP": "Een PokerTH-spel heeft de dedicated server van PokerTH nodig, die de kaarten deelt en de tafels beheert, en de webclient, die de app aan de browsers levert en ze met die server verbindt. Ze kunnen op dezelfde machine draaien. Alles blijft compatibel: de PokerTH-apps verbinden met dezelfde server als de browsers — de QML-client op Windows, macOS, Linux en Android, en de klassieke widget-client op de desktop — zodat spelers browsers en apps aan één tafel kunnen mengen.",
    "stepsH2": "Opzetten in drie stappen",
    "steps": [
      [
        "Installeer de PokerTH-server",
        "Bouw pokerth_dedicated_server uit de broncode van PokerTH — versie 2.1.10 of later — volgens de serverhandleiding van het PokerTH-project: daarvoor heb je Qt 6.7 of nieuwer, CMake en een C++23-compiler nodig. Het pakket pokerth-server van Linux-distributies is een oudere versie. De server luistert op TCP-poort 7234."
      ],
      [
        "Installeer de webclient",
        "Op Debian, Ubuntu of Raspberry Pi OS installeert het installatiescript met één commando Node.js, de webclient en een dienst die met de machine opstart. Docker-gebruikers halen een kant-en-klare image op voor amd64, arm64 en armv7, en CasaOS importeert hetzelfde Compose-bestand als app."
      ],
      [
        "Speel",
        "Open op elk apparaat in je netwerk het adres van de machine op poort 8080, kies LAN / Toegewijde server, typ een bijnaam en maak een tafel. Spelers met de QML- of widget-client van PokerTH verbinden met dezelfde machine op poort 7234 en schuiven aan bij dezelfde tafels."
      ]
    ],
    "piH2": "Op een Raspberry Pi",
    "piP": "PokerTH wisselt kleine berichten uit en de apparaten van de spelers doen al het tekenwerk, dus een Raspberry Pi is ruim voldoende: een Pi 4 met 2 GB is de ideale keuze, een Pi 5 is meer dan genoeg. Voor een soepele avond is het netwerk belangrijker dan het bordje — sluit de Pi met een kabel aan op de router en gebruik een goed Wi-Fi-toegangspunt voor de spelers.",
    "httpsH2": "HTTP op het LAN, HTTPS voor de extra’s",
    "httpsP": "Op je eigen netwerk werkt het spel via gewone HTTP. Voor het installeren van de app op het beginscherm, offline spelen en meldingen ontvangen is HTTPS nodig; de handleiding zet dat op met Nginx en een gratis certificaat van Let’s Encrypt.",
    "adminH2": "Een beheerpaneel in de browser",
    "adminP": "Een met een token beveiligde console op /admin laat zien wie er verbonden is, werkt de webclient met één klik bij en kan hem terugzetten, stuurt mededelingen naar de spelers, zet de ranglijst op nul, installeert kaartspellen, tafelstijlen en muziek, houdt de lijst bij van gameservers die de client mag bereiken, en geeft sleutels uit die maar een deel van de onderdelen ontgrendelen.",
    "shareH2": "Spelers van buitenaf uitnodigen",
    "shareP": "Uitnodigingslinks en QR-codes werken op je server precies zoals op pokerth.net: een vriend opent de link en komt aan jouw tafel. Is je server bereikbaar vanaf internet, dan kun je hem ook voordragen voor de openbare serverlijst van de webclient; hij verschijnt daar zodra de beheerders van de webclient hem goedkeuren.",
    "guidesH2": "Stap-voor-staphandleidingen",
    "guides": [
      "Handleiding voor de PokerTH-server",
      "Zelf hosten en installeren met één commando",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Handmatige installatie en HTTPS",
      "Het beheerpaneel"
    ],
    "faqH2": "Vragen",
    "faq": [
      [
        "Is het gratis om een PokerTH-server te hosten?",
        "Ja. De PokerTH-server en de webclient zijn gratis en open-source software; je hebt alleen een machine nodig om ze te draaien."
      ],
      [
        "Welke hardware heb ik nodig?",
        "Heel weinig: elke pc of thuisserver met Linux of Docker, of een Raspberry Pi 4 of 5. Een bekabelde netwerkverbinding is belangrijker dan rekenkracht."
      ],
      [
        "Moeten de spelers iets installeren?",
        "Nee. Ze openen het adres van de server in een browser op hun telefoon, tablet of computer. Wie liever een app gebruikt, kan de QML-client van PokerTH of de klassieke widget-client nemen: die verbinden met dezelfde server en spelen aan dezelfde tafels."
      ],
      [
        "Is pokerth.net of een internetverbinding nodig?",
        "Nee. Een server op je lokale netwerk draait zelfstandig: de spelers verbinden er rechtstreeks mee, met alleen een bijnaam."
      ],
      [
        "Hoeveel spelers kunnen meedoen?",
        "Maximaal 10 spelers per tafel, plus toeschouwers, en zoveel tafels als je groep nodig heeft."
      ]
    ]
  },
  pa: {
    "title": "ਆਪਣਾ ਪੋਕਰ ਸਰਵਰ ਹੋਸਟ ਕਰੋ — ਮੁਫ਼ਤ, ਸੈਲਫ਼-ਹੋਸਟਡ | PokerTH",
    "desc": "ਘਰ, ਕਲੱਬ ਜਾਂ ਸਕੂਲ ਵਿੱਚ ਨਿੱਜੀ Texas Hold’em ਸਰਵਰ: ਮੁਫ਼ਤ PokerTH ਸਰਵਰ ਅਤੇ ਵੈੱਬ ਕਲਾਇਂਟ, ਇੱਕੋ ਕਮਾਂਡ ਨਾਲ ਸੈੱਟਅੱਪ, Docker ਨਾਲ ਜਾਂ Raspberry Pi ’ਤੇ।",
    "ldHeadline": "ਆਪਣਾ PokerTH ਪੋਕਰ ਸਰਵਰ ਕਿਵੇਂ ਹੋਸਟ ਕਰੀਏ",
    "ldDesc": "PokerTH ਸਮਰਪਿਤ ਸਰਵਰ ਅਤੇ PokerTH ਵੈੱਬ ਕਲਾਇਂਟ ਨਾਲ ਇੱਕ ਨਿੱਜੀ, ਸੈਲਫ਼-ਹੋਸਟਡ Texas Hold’em ਸਰਵਰ ਸੈੱਟ ਕਰੋ।",
    "h1": "ਆਪਣਾ ਪੋਕਰ ਸਰਵਰ ਹੋਸਟ ਕਰੋ",
    "lead": "PokerTH ਸ਼ੁਰੂ ਤੋਂ ਅਖੀਰ ਤੱਕ ਮੁਫ਼ਤ ਅਤੇ ਓਪਨ ਸੋਰਸ ਹੈ: ਗੇਮ ਸਰਵਰ ਅਤੇ ਇਹ ਵੈੱਬ ਕਲਾਇਂਟ ਤੁਹਾਡੀ ਆਪਣੀ ਮਸ਼ੀਨ ’ਤੇ ਚੱਲ ਸਕਦੇ ਹਨ। ਪਰਿਵਾਰਕ ਖੇਡ, ਕਲੱਬ ਦੀ ਸ਼ਾਮ, ਦਫ਼ਤਰ ਦੀ ਲੀਗ ਜਾਂ ਸਕੂਲ ਲਈ ਇੱਕ ਪੀਸੀ, ਘਰੇਲੂ ਸਰਵਰ ਜਾਂ Raspberry Pi ਕਾਫ਼ੀ ਹੈ, ਅਤੇ ਫਿਰ ਤੁਹਾਡੇ ਨੈੱਟਵਰਕ ’ਤੇ ਹਰ ਫੋਨ, ਟੈਬਲੇਟ ਜਾਂ ਕੰਪਿਊਟਰ ਸਿਰਫ਼ ਇੱਕ ਉਪਨਾਮ ਨਾਲ ਆਪਣੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਖੇਡਦਾ ਹੈ।",
    "whyH2": "ਆਪਣਾ ਸਰਵਰ ਕਿਉਂ ਚਲਾਈਏ",
    "why": [
      [
        "ਨਿੱਜੀ",
        "ਤੁਹਾਡੀਆਂ ਖੇਡਾਂ ਤੁਹਾਡੀ ਮਸ਼ੀਨ ਅਤੇ ਤੁਹਾਡੇ ਨੈੱਟਵਰਕ ’ਤੇ ਹੀ ਰਹਿੰਦੀਆਂ ਹਨ; ਖਿਡਾਰੀਆਂ ਨੂੰ ਨਾ ਖਾਤੇ ਦੀ ਲੋੜ ਹੈ ਨਾ ਈਮੇਲ ਪਤੇ ਦੀ, ਸਿਰਫ਼ ਇੱਕ ਉਪਨਾਮ ਦੀ।"
      ],
      [
        "ਤੁਹਾਡੀ ਮਰਜ਼ੀ ਮੁਤਾਬਕ",
        "ਸਰਵਰ ਨੂੰ ਆਪਣਾ ਨਾਮ ਦਿਓ, ਚੁਣੋ ਕਿ ਲੌਗਇਨ ਸਕ੍ਰੀਨ ਕਿਹੜੇ ਮੋਡ ਦਿਖਾਵੇ, ਸੁਆਗਤ ਸੁਨੇਹਾ ਲਗਾਓ, ਅਤੇ ਆਪਣੇ ਗਰੁੱਪ ਲਈ ਸਾਂਝੀ ਰੈਂਕਿੰਗ ਰੱਖੋ।"
      ],
      [
        "ਮੁਫ਼ਤ",
        "ਨਾ ਲਾਇਸੈਂਸ, ਨਾ ਸਬਸਕ੍ਰਿਪਸ਼ਨ, ਨਾ ਇਸ਼ਤਿਹਾਰ: PokerTH ਸਰਵਰ ਅਤੇ ਵੈੱਬ ਕਲਾਇਂਟ ਦੋਵੇਂ ਮੁਕਤ ਸੌਫਟਵੇਅਰ ਹਨ।"
      ]
    ],
    "partsH2": "ਦੋ ਹਿੱਸੇ",
    "partsP": "PokerTH ਦੀ ਖੇਡ ਲਈ PokerTH ਸਮਰਪਿਤ ਸਰਵਰ ਚਾਹੀਦਾ ਹੈ, ਜੋ ਪੱਤੇ ਵੰਡਦਾ ਹੈ ਅਤੇ ਟੇਬਲ ਚਲਾਉਂਦਾ ਹੈ, ਅਤੇ ਵੈੱਬ ਕਲਾਇਂਟ, ਜੋ ਬ੍ਰਾਊਜ਼ਰਾਂ ਨੂੰ ਐਪ ਦਿੰਦਾ ਹੈ ਅਤੇ ਉਨ੍ਹਾਂ ਨੂੰ ਉਸ ਸਰਵਰ ਨਾਲ ਜੋੜਦਾ ਹੈ। ਦੋਵੇਂ ਇੱਕੋ ਮਸ਼ੀਨ ’ਤੇ ਚੱਲ ਸਕਦੇ ਹਨ। ਸਭ ਕੁਝ ਅਨੁਕੂਲ ਰਹਿੰਦਾ ਹੈ: PokerTH ਐਪਾਂ — Windows, macOS, Linux ਅਤੇ Android ’ਤੇ QML ਕਲਾਇਂਟ, ਅਤੇ ਡੈਸਕਟਾਪ ’ਤੇ ਕਲਾਸਿਕ widget ਕਲਾਇਂਟ — ਬ੍ਰਾਊਜ਼ਰਾਂ ਵਾਲੇ ਉਸੇ ਸਰਵਰ ਨਾਲ ਜੁੜਦੀਆਂ ਹਨ, ਇਸ ਲਈ ਇੱਕ ਟੇਬਲ ’ਤੇ ਬ੍ਰਾਊਜ਼ਰ ਅਤੇ ਐਪ ਵਾਲੇ ਖਿਡਾਰੀ ਇਕੱਠੇ ਖੇਡ ਸਕਦੇ ਹਨ।",
    "stepsH2": "ਤਿੰਨ ਕਦਮਾਂ ਵਿੱਚ ਸੈੱਟਅੱਪ",
    "steps": [
      [
        "PokerTH ਸਰਵਰ ਇੰਸਟਾਲ ਕਰੋ",
        "PokerTH ਪ੍ਰੋਜੈਕਟ ਦੀ ਸਰਵਰ ਗਾਈਡ ਮੁਤਾਬਕ PokerTH ਦੇ ਸੋਰਸ ਕੋਡ ਤੋਂ pokerth_dedicated_server ਬਿਲਡ ਕਰੋ — ਵਰਜਨ 2.1.10 ਜਾਂ ਉਸ ਤੋਂ ਬਾਅਦ ਦਾ: ਇਸ ਲਈ Qt 6.7 ਜਾਂ ਨਵਾਂ, CMake ਅਤੇ ਇੱਕ C++23 ਕੰਪਾਈਲਰ ਚਾਹੀਦਾ ਹੈ। Linux ਡਿਸਟ੍ਰੀਬਿਊਸ਼ਨਾਂ ਦਾ pokerth-server ਪੈਕੇਜ ਇੱਕ ਪੁਰਾਣਾ ਵਰਜਨ ਹੈ। ਸਰਵਰ TCP ਪੋਰਟ 7234 ’ਤੇ ਸੁਣਦਾ ਹੈ।"
      ],
      [
        "ਵੈੱਬ ਕਲਾਇਂਟ ਇੰਸਟਾਲ ਕਰੋ",
        "Debian, Ubuntu ਜਾਂ Raspberry Pi OS ’ਤੇ ਇੰਸਟਾਲੇਸ਼ਨ ਸਕ੍ਰਿਪਟ ਇੱਕੋ ਕਮਾਂਡ ਨਾਲ Node.js, ਵੈੱਬ ਕਲਾਇਂਟ ਅਤੇ ਮਸ਼ੀਨ ਦੇ ਨਾਲ ਹੀ ਚਾਲੂ ਹੋਣ ਵਾਲੀ ਇੱਕ ਸਰਵਿਸ ਸੈੱਟ ਕਰ ਦਿੰਦੀ ਹੈ। Docker ਵਰਤਣ ਵਾਲੇ amd64, arm64 ਅਤੇ armv7 ਲਈ ਤਿਆਰ ਇਮੇਜ ਡਾਊਨਲੋਡ ਕਰ ਲੈਂਦੇ ਹਨ, ਅਤੇ CasaOS ਉਹੀ Compose ਫ਼ਾਈਲ ਇੱਕ ਐਪ ਵਜੋਂ ਇੰਪੋਰਟ ਕਰਦਾ ਹੈ।"
      ],
      [
        "ਖੇਡੋ",
        "ਆਪਣੇ ਨੈੱਟਵਰਕ ਦੇ ਕਿਸੇ ਵੀ ਡਿਵਾਈਸ ’ਤੇ ਪੋਰਟ 8080 ’ਤੇ ਮਸ਼ੀਨ ਦਾ ਪਤਾ ਖੋਲ੍ਹੋ, LAN / ਸਮਰਪਿਤ ਸਰਵਰ ਚੁਣੋ, ਇੱਕ ਉਪਨਾਮ ਲਿਖੋ ਅਤੇ ਇੱਕ ਟੇਬਲ ਬਣਾਓ। PokerTH QML ਜਾਂ widget ਕਲਾਇਂਟ ਵਾਲੇ ਖਿਡਾਰੀ ਪੋਰਟ 7234 ’ਤੇ ਉਸੇ ਮਸ਼ੀਨ ਨਾਲ ਜੁੜਦੇ ਹਨ ਅਤੇ ਉਨ੍ਹਾਂ ਹੀ ਟੇਬਲਾਂ ’ਤੇ ਸ਼ਾਮਲ ਹੁੰਦੇ ਹਨ।"
      ]
    ],
    "piH2": "Raspberry Pi ’ਤੇ",
    "piP": "PokerTH ਛੋਟੇ-ਛੋਟੇ ਸੁਨੇਹੇ ਭੇਜਦਾ-ਲੈਂਦਾ ਹੈ ਅਤੇ ਸਾਰੀ ਡਰਾਇੰਗ ਖਿਡਾਰੀਆਂ ਦੇ ਡਿਵਾਈਸ ਕਰਦੇ ਹਨ, ਇਸ ਲਈ ਇੱਕ Raspberry Pi ਕਾਫ਼ੀ ਹੈ: 2 GB ਵਾਲਾ Pi 4 ਸਭ ਤੋਂ ਢੁਕਵਾਂ ਹੈ, Pi 5 ਲੋੜ ਤੋਂ ਵੀ ਵੱਧ ਹੈ। ਬਿਨਾਂ ਰੁਕਾਵਟ ਵਾਲੀ ਸ਼ਾਮ ਲਈ ਬੋਰਡ ਨਾਲੋਂ ਨੈੱਟਵਰਕ ਵੱਧ ਮਾਇਨੇ ਰੱਖਦਾ ਹੈ — Pi ਨੂੰ ਕੇਬਲ ਨਾਲ ਰਾਊਟਰ ਨਾਲ ਜੋੜੋ, ਅਤੇ ਖਿਡਾਰੀਆਂ ਲਈ ਇੱਕ ਚੰਗਾ Wi-Fi ਐਕਸੈੱਸ ਪੁਆਇੰਟ ਵਰਤੋ।",
    "httpsH2": "LAN ’ਤੇ HTTP, ਵਾਧੂ ਸਹੂਲਤਾਂ ਲਈ HTTPS",
    "httpsP": "ਆਪਣੇ ਨੈੱਟਵਰਕ ’ਤੇ ਖੇਡ ਸਾਦੇ HTTP ’ਤੇ ਚੱਲਦੀ ਹੈ। ਹੋਮ ਸਕ੍ਰੀਨ ’ਤੇ ਐਪ ਇੰਸਟਾਲ ਕਰਨ, ਆਫ਼ਲਾਈਨ ਖੇਡਣ ਅਤੇ ਸੂਚਨਾਵਾਂ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ HTTPS ਚਾਹੀਦਾ ਹੈ, ਜਿਸਨੂੰ ਗਾਈਡ Nginx ਅਤੇ ਇੱਕ ਮੁਫ਼ਤ Let’s Encrypt ਸਰਟੀਫ਼ਿਕੇਟ ਨਾਲ ਸੈੱਟ ਕਰਦੀ ਹੈ।",
    "adminH2": "ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਐਡਮਿਨ ਪੈਨਲ",
    "adminP": "/admin ’ਤੇ ਟੋਕਨ ਨਾਲ ਸੁਰੱਖਿਅਤ ਕੰਸੋਲ ਦਿਖਾਉਂਦਾ ਹੈ ਕਿ ਕੌਣ ਜੁੜਿਆ ਹੋਇਆ ਹੈ, ਇੱਕ ਕਲਿੱਕ ਨਾਲ ਵੈੱਬ ਕਲਾਇਂਟ ਅੱਪਡੇਟ ਕਰਦਾ ਹੈ ਅਤੇ ਉਸਨੂੰ ਪਿਛਲੇ ਵਰਜਨ ’ਤੇ ਵਾਪਸ ਵੀ ਲਿਜਾ ਸਕਦਾ ਹੈ, ਖਿਡਾਰੀਆਂ ਨੂੰ ਐਲਾਨ ਭੇਜਦਾ ਹੈ, ਰੈਂਕਿੰਗ ਰੀਸੈੱਟ ਕਰਦਾ ਹੈ, ਤਾਸ਼ ਦੇ ਡੈੱਕ, ਟੇਬਲ ਸਟਾਈਲ ਅਤੇ ਸੰਗੀਤ ਇੰਸਟਾਲ ਕਰਦਾ ਹੈ, ਉਨ੍ਹਾਂ ਗੇਮ ਸਰਵਰਾਂ ਦੀ ਸੂਚੀ ਦਿਖਾਉਂਦਾ ਹੈ ਜਿਨ੍ਹਾਂ ਤੱਕ ਕਲਾਇਂਟ ਪਹੁੰਚ ਸਕਦਾ ਹੈ, ਅਤੇ ਅਜਿਹੀਆਂ ਕੁੰਜੀਆਂ ਦਿੰਦਾ ਹੈ ਜੋ ਇਸਦੇ ਸਿਰਫ਼ ਕੁਝ ਹਿੱਸੇ ਖੋਲ੍ਹਦੀਆਂ ਹਨ।",
    "shareH2": "ਬਾਹਰੋਂ ਖਿਡਾਰੀਆਂ ਨੂੰ ਸੱਦਾ ਦਿਓ",
    "shareP": "ਸੱਦਾ ਲਿੰਕ ਅਤੇ QR ਕੋਡ ਤੁਹਾਡੇ ਸਰਵਰ ’ਤੇ ਵੀ ਬਿਲਕੁਲ pokerth.net ਵਾਂਗ ਕੰਮ ਕਰਦੇ ਹਨ: ਦੋਸਤ ਲਿੰਕ ਖੋਲ੍ਹਦਾ ਹੈ ਅਤੇ ਤੁਹਾਡੇ ਟੇਬਲ ’ਤੇ ਬੈਠ ਜਾਂਦਾ ਹੈ। ਜੇ ਤੁਹਾਡਾ ਸਰਵਰ ਇੰਟਰਨੈੱਟ ਤੋਂ ਪਹੁੰਚਯੋਗ ਹੈ, ਤਾਂ ਤੁਸੀਂ ਇਸਨੂੰ ਵੈੱਬ ਕਲਾਇਂਟ ਦੀ ਜਨਤਕ ਸਰਵਰ ਸੂਚੀ ਲਈ ਵੀ ਪ੍ਰਸਤਾਵਿਤ ਕਰ ਸਕਦੇ ਹੋ; ਵੈੱਬ ਕਲਾਇਂਟ ਦੇ ਐਡਮਿਨਾਂ ਦੀ ਮਨਜ਼ੂਰੀ ਮਿਲਣ ’ਤੇ ਇਹ ਉੱਥੇ ਦਿਖਾਈ ਦਿੰਦਾ ਹੈ।",
    "guidesH2": "ਕਦਮ-ਦਰ-ਕਦਮ ਗਾਈਡਾਂ",
    "guides": [
      "PokerTH ਸਰਵਰ ਸੈੱਟਅੱਪ ਗਾਈਡ",
      "ਸੈਲਫ਼-ਹੋਸਟਿੰਗ ਅਤੇ ਇੱਕ ਕਮਾਂਡ ਨਾਲ ਇੰਸਟਾਲ",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "ਮੈਨੁਅਲ ਇੰਸਟਾਲੇਸ਼ਨ ਅਤੇ HTTPS",
      "ਐਡਮਿਨ ਪੈਨਲ"
    ],
    "faqH2": "ਸਵਾਲ",
    "faq": [
      [
        "ਕੀ PokerTH ਸਰਵਰ ਹੋਸਟ ਕਰਨਾ ਮੁਫ਼ਤ ਹੈ?",
        "ਹਾਂ। PokerTH ਸਰਵਰ ਅਤੇ ਵੈੱਬ ਕਲਾਇਂਟ ਮੁਫ਼ਤ ਅਤੇ ਓਪਨ ਸੋਰਸ ਸੌਫਟਵੇਅਰ ਹਨ; ਇਨ੍ਹਾਂ ਨੂੰ ਚਲਾਉਣ ਲਈ ਤੁਹਾਨੂੰ ਸਿਰਫ਼ ਇੱਕ ਮਸ਼ੀਨ ਚਾਹੀਦੀ ਹੈ।"
      ],
      [
        "ਮੈਨੂੰ ਕਿਹੜਾ ਹਾਰਡਵੇਅਰ ਚਾਹੀਦਾ ਹੈ?",
        "ਬਹੁਤ ਥੋੜ੍ਹਾ: Linux ਜਾਂ Docker ਚਲਾਉਣ ਵਾਲਾ ਕੋਈ ਵੀ ਪੀਸੀ ਜਾਂ ਘਰੇਲੂ ਸਰਵਰ, ਜਾਂ ਇੱਕ Raspberry Pi 4 ਜਾਂ 5। ਪ੍ਰੋਸੈਸਿੰਗ ਤਾਕਤ ਨਾਲੋਂ ਤਾਰ ਵਾਲਾ ਨੈੱਟਵਰਕ ਕਨੈਕਸ਼ਨ ਵੱਧ ਮਾਇਨੇ ਰੱਖਦਾ ਹੈ।"
      ],
      [
        "ਕੀ ਖਿਡਾਰੀਆਂ ਨੂੰ ਕੁਝ ਇੰਸਟਾਲ ਕਰਨਾ ਪੈਂਦਾ ਹੈ?",
        "ਨਹੀਂ। ਉਹ ਆਪਣੇ ਫੋਨ, ਟੈਬਲੇਟ ਜਾਂ ਕੰਪਿਊਟਰ ਦੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਸਰਵਰ ਦਾ ਪਤਾ ਖੋਲ੍ਹਦੇ ਹਨ। ਜਿਨ੍ਹਾਂ ਨੂੰ ਐਪ ਪਸੰਦ ਹੈ, ਉਹ PokerTH QML ਕਲਾਇਂਟ ਜਾਂ ਕਲਾਸਿਕ widget ਕਲਾਇਂਟ ਵਰਤ ਸਕਦੇ ਹਨ: ਇਹ ਉਸੇ ਸਰਵਰ ਨਾਲ ਜੁੜਦੇ ਹਨ ਅਤੇ ਉਨ੍ਹਾਂ ਹੀ ਟੇਬਲਾਂ ’ਤੇ ਖੇਡਦੇ ਹਨ।"
      ],
      [
        "ਕੀ ਇਸ ਲਈ pokerth.net ਜਾਂ ਇੰਟਰਨੈੱਟ ਕਨੈਕਸ਼ਨ ਦੀ ਲੋੜ ਹੈ?",
        "ਨਹੀਂ। ਤੁਹਾਡੇ ਲੋਕਲ ਨੈੱਟਵਰਕ ’ਤੇ ਸਰਵਰ ਆਪਣੇ-ਆਪ ਚੱਲਦਾ ਹੈ: ਖਿਡਾਰੀ ਸਿਰਫ਼ ਇੱਕ ਉਪਨਾਮ ਨਾਲ ਸਿੱਧੇ ਇਸ ਨਾਲ ਜੁੜਦੇ ਹਨ।"
      ],
      [
        "ਕਿੰਨੇ ਖਿਡਾਰੀ ਸ਼ਾਮਲ ਹੋ ਸਕਦੇ ਹਨ?",
        "ਹਰ ਟੇਬਲ ’ਤੇ 10 ਖਿਡਾਰੀਆਂ ਤੱਕ, ਨਾਲ ਦਰਸ਼ਕ ਵੀ, ਅਤੇ ਜਿੰਨੇ ਟੇਬਲ ਤੁਹਾਡੇ ਗਰੁੱਪ ਨੂੰ ਚਾਹੀਦੇ ਹੋਣ।"
      ]
    ]
  },
  pl: {
    "title": "Postaw własny serwer pokerowy — za darmo, u siebie | PokerTH",
    "desc": "Prywatny serwer Texas Hold’em w domu, w klubie lub w szkole: darmowy serwer i klient webowy PokerTH, instalowane jednym poleceniem, z Dockerem lub na Raspberry Pi.",
    "ldHeadline": "Jak postawić własny serwer pokerowy PokerTH",
    "ldDesc": "Uruchom prywatny, samodzielnie hostowany serwer Texas Hold’em z serwerem dedykowanym PokerTH i klientem webowym PokerTH.",
    "h1": "Postaw własny serwer pokerowy",
    "lead": "PokerTH jest darmowy i otwartoźródłowy od początku do końca: serwer gry i ten klient webowy mogą działać na twoim własnym sprzęcie. Komputer, serwer domowy lub Raspberry Pi wystarczą na rodzinną grę, klubowy wieczór, biurową ligę czy szkołę, a każdy telefon, tablet lub komputer w twojej sieci gra potem w przeglądarce, wystarczy mu pseudonim.",
    "whyH2": "Dlaczego własny serwer",
    "why": [
      [
        "Prywatność",
        "Twoje gry zostają na twoim sprzęcie i w twojej sieci; gracze nie potrzebują konta ani adresu e-mail, wystarczy pseudonim."
      ],
      [
        "Na twoją miarę",
        "Nadaj serwerowi własną nazwę, wybierz tryby dostępne na ekranie logowania, opublikuj wiadomość powitalną i prowadź wspólną tabelę wyników dla swojej grupy."
      ],
      [
        "Za darmo",
        "Bez licencji, bez abonamentu, bez reklam: serwer PokerTH i klient webowy to wolne oprogramowanie."
      ]
    ],
    "partsH2": "Dwa elementy",
    "partsP": "Gra w PokerTH potrzebuje serwera dedykowanego PokerTH, który rozdaje karty i prowadzi stoły, oraz klienta webowego, który udostępnia aplikację przeglądarkom i łączy je z tym serwerem. Oba mogą działać na tym samym komputerze. Wszystko pozostaje zgodne: aplikacje PokerTH łączą się z tym samym serwerem co przeglądarki — klient QML na Windows, macOS, Linux i Android oraz klasyczny desktopowy klient widget — więc przy jednym stole gracze mogą łączyć przeglądarki i aplikacje.",
    "stepsH2": "Uruchom go w trzech krokach",
    "steps": [
      [
        "Zainstaluj serwer PokerTH",
        "Zbuduj pokerth_dedicated_server ze źródeł PokerTH — w wersji 2.1.10 lub nowszej — według instrukcji serwera projektu PokerTH: potrzebne są Qt 6.7 lub nowsze, CMake i kompilator C++23. Pakiet pokerth-server dostępny w dystrybucjach systemu Linux to starsza wersja. Serwer nasłuchuje na porcie TCP 7234."
      ],
      [
        "Zainstaluj klienta webowego",
        "W systemach Debian, Ubuntu i Raspberry Pi OS skrypt instalacyjny konfiguruje jednym poleceniem Node.js, klienta webowego i usługę uruchamianą razem z komputerem. Użytkownicy Dockera pobierają gotowy obraz dla amd64, arm64 i armv7, a CasaOS importuje ten sam plik Compose jako aplikację."
      ],
      [
        "Graj",
        "Na dowolnym urządzeniu w twojej sieci otwórz adres komputera na porcie 8080, wybierz „LAN / Serwer dedykowany”, wpisz pseudonim i utwórz stół. Gracze z klientem QML lub widget PokerTH łączą się z tym samym komputerem na porcie 7234 i dołączają do tych samych stołów."
      ]
    ],
    "piH2": "Na Raspberry Pi",
    "piP": "PokerTH wymienia małe wiadomości, a całe rysowanie wykonują urządzenia graczy, więc Raspberry Pi w zupełności wystarczy: Pi 4 z 2 GB to złoty środek, a Pi 5 to aż nadto. Dla płynnego wieczoru sieć liczy się bardziej niż płytka — podłącz Pi do routera kablem i zapewnij graczom dobry punkt dostępowy Wi-Fi.",
    "httpsH2": "HTTP w sieci LAN, HTTPS dla dodatków",
    "httpsP": "We własnej sieci gra działa przez zwykły HTTP. Instalacja aplikacji na ekranie głównym, gra offline i otrzymywanie powiadomień wymagają HTTPS, który instrukcja konfiguruje za pomocą Nginx i darmowego certyfikatu Let’s Encrypt.",
    "adminH2": "Panel administracyjny w przeglądarce",
    "adminP": "Chroniona tokenem konsola pod adresem /admin pokazuje, kto jest połączony, aktualizuje klienta webowego jednym kliknięciem i potrafi przywrócić poprzednią wersję, wysyła ogłoszenia do graczy, zeruje tabelę wyników, instaluje talie kart, style stołu i muzykę, wyświetla listę serwerów gry, z którymi klient może się łączyć, i wydaje klucze odblokowujące tylko niektóre jej sekcje.",
    "shareH2": "Zaproś graczy z zewnątrz",
    "shareP": "Linki z zaproszeniem i kody QR działają na twoim serwerze tak samo jak na pokerth.net: znajomy otwiera link i siada przy twoim stole. Jeśli twój serwer jest dostępny z internetu, możesz też zgłosić go do publicznej listy serwerów klienta webowego; pojawi się na niej, gdy zatwierdzą go administratorzy klienta webowego.",
    "guidesH2": "Instrukcje krok po kroku",
    "guides": [
      "Instrukcja instalacji serwera PokerTH",
      "Hosting u siebie i instalacja jednym poleceniem",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Instalacja ręczna i HTTPS",
      "Panel administracyjny"
    ],
    "faqH2": "Pytania",
    "faq": [
      [
        "Czy hostowanie serwera PokerTH jest darmowe?",
        "Tak. Serwer PokerTH i klient webowy to darmowe oprogramowanie open source; potrzebujesz tylko komputera, na którym będą działać."
      ],
      [
        "Jakiego sprzętu potrzebuję?",
        "Niewiele: dowolnego komputera lub serwera domowego z systemem Linux albo z Dockerem, lub Raspberry Pi 4 albo 5. Przewodowe połączenie sieciowe ma większe znaczenie niż moc obliczeniowa."
      ],
      [
        "Czy gracze muszą coś instalować?",
        "Nie. Otwierają adres serwera w przeglądarce na telefonie, tablecie lub komputerze. Kto woli aplikację, może użyć klienta QML PokerTH lub klasycznego klienta widget: dzięki nim łączy się z tym samym serwerem i gra przy tych samych stołach."
      ],
      [
        "Czy potrzebne jest pokerth.net albo połączenie z internetem?",
        "Nie. Serwer w twojej sieci lokalnej działa samodzielnie: gracze łączą się z nim bezpośrednio, wystarczy im pseudonim."
      ],
      [
        "Ilu graczy może dołączyć?",
        "Do 10 graczy przy stole, plus obserwatorzy, i tyle stołów, ile potrzebuje twoja grupa."
      ]
    ]
  },
  "pt-BR": {
    "title": "Seu próprio servidor de pôquer — grátis, auto-hospedado | PokerTH",
    "desc": "Servidor privado de Texas Hold’em em casa, num clube ou numa escola: servidor PokerTH e cliente web grátis, instalados com um comando, com Docker ou num Raspberry Pi.",
    "ldHeadline": "Como hospedar seu próprio servidor de pôquer PokerTH",
    "ldDesc": "Monte um servidor de Texas Hold’em privado e auto-hospedado com o servidor dedicado do PokerTH e o cliente web do PokerTH.",
    "h1": "Hospede seu próprio servidor de pôquer",
    "lead": "O PokerTH é gratuito e de código aberto de ponta a ponta: o servidor de jogo e este cliente web podem rodar na sua própria máquina. Um PC, um servidor doméstico ou um Raspberry Pi basta para um jogo em família, uma noite no clube, uma liga no escritório ou uma escola, e aí todo celular, tablet ou computador da sua rede joga no navegador só com um apelido.",
    "whyH2": "Por que ter o seu",
    "why": [
      [
        "Privado",
        "Suas partidas ficam na sua máquina e na sua rede; os jogadores não precisam de conta nem de e-mail, só de um apelido."
      ],
      [
        "Do seu jeito",
        "Dê um nome próprio ao servidor, escolha quais modos a tela de login oferece, publique uma mensagem de boas-vindas e mantenha um ranking compartilhado para o seu grupo."
      ],
      [
        "Grátis",
        "Sem licença, sem assinatura, sem anúncios: o servidor PokerTH e o cliente web são software livre."
      ]
    ],
    "partsH2": "Duas peças",
    "partsP": "Uma partida de PokerTH precisa do servidor dedicado do PokerTH, que distribui as cartas e gerencia as mesas, e do cliente web, que entrega o app aos navegadores e os conecta a esse servidor. Os dois podem rodar na mesma máquina. Tudo continua compatível: os apps do PokerTH se conectam ao mesmo servidor que os navegadores — o cliente QML no Windows, macOS, Linux e Android, e o cliente widget clássico no desktop —, então os jogadores podem misturar navegadores e apps na mesma mesa.",
    "stepsH2": "Monte em três passos",
    "steps": [
      [
        "Instale o servidor PokerTH",
        "Compile o pokerth_dedicated_server a partir do código-fonte do PokerTH — versão 2.1.10 ou posterior — seguindo o guia do servidor do projeto PokerTH: ele exige Qt 6.7 ou mais recente, CMake e um compilador C++23. O pacote pokerth-server das distribuições Linux é uma versão mais antiga. O servidor escuta na porta TCP 7234."
      ],
      [
        "Instale o cliente web",
        "No Debian, Ubuntu ou Raspberry Pi OS, o script de instalação configura o Node.js, o cliente web e um serviço que inicia junto com a máquina, com um único comando. Quem usa Docker baixa uma imagem pronta para amd64, arm64 e armv7, e o CasaOS importa o mesmo arquivo Compose como um app."
      ],
      [
        "Jogue",
        "Em qualquer dispositivo da sua rede, abra o endereço da máquina na porta 8080, escolha “LAN / Servidor dedicado”, digite um apelido e crie uma mesa. Jogadores com o cliente QML ou widget do PokerTH se conectam à mesma máquina na porta 7234 e entram nas mesmas mesas."
      ]
    ],
    "piH2": "Num Raspberry Pi",
    "piP": "O PokerTH troca mensagens pequenas e os aparelhos dos jogadores fazem todo o desenho, então um Raspberry Pi dá e sobra: um Pi 4 com 2 GB é o ponto ideal, e um Pi 5 é mais que suficiente. Para uma noite sem engasgos, a rede importa mais que a placa — ligue o Pi ao roteador com um cabo e use um bom ponto de acesso Wi-Fi para os jogadores.",
    "httpsH2": "HTTP na LAN, HTTPS para os extras",
    "httpsP": "Na sua própria rede, o jogo funciona com HTTP simples. Instalar o app na tela inicial, jogar offline e receber notificações exigem HTTPS, que o guia configura com Nginx e um certificado gratuito Let’s Encrypt.",
    "adminH2": "Um painel de administração no navegador",
    "adminP": "Um console protegido por token em /admin mostra quem está conectado, atualiza o cliente web com um clique e pode voltar à versão anterior, envia avisos aos jogadores, zera o ranking, instala baralhos, estilos de mesa e músicas, lista os servidores de jogo que o cliente pode acessar e distribui chaves que liberam só algumas das suas seções.",
    "shareH2": "Convide jogadores de fora",
    "shareP": "Links de convite e QR codes funcionam no seu servidor do mesmo jeito que no pokerth.net: um amigo abre o link e é colocado na sua mesa. Se o seu servidor puder ser acessado pela internet, você também pode sugeri-lo para a lista pública de servidores do cliente web; ele aparece lá assim que os administradores do cliente web o aprovarem.",
    "guidesH2": "Guias passo a passo",
    "guides": [
      "Guia de instalação do servidor PokerTH",
      "Auto-hospedagem e instalação com um comando",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Instalação manual e HTTPS",
      "O painel de administração"
    ],
    "faqH2": "Perguntas",
    "faq": [
      [
        "Hospedar um servidor PokerTH é grátis?",
        "Sim. O servidor PokerTH e o cliente web são software livre e de código aberto; você só precisa de uma máquina para rodá-los."
      ],
      [
        "De que hardware eu preciso?",
        "Muito pouco: qualquer PC ou servidor doméstico que rode Linux ou Docker, ou um Raspberry Pi 4 ou 5. Uma conexão de rede cabeada importa mais que poder de processamento."
      ],
      [
        "Os jogadores precisam instalar alguma coisa?",
        "Não. Eles abrem o endereço do servidor num navegador no celular, tablet ou computador. Quem prefere um app pode usar o cliente QML do PokerTH ou o cliente widget clássico: eles se conectam ao mesmo servidor e jogam nas mesmas mesas."
      ],
      [
        "Precisa do pokerth.net ou de conexão com a internet?",
        "Não. Um servidor na sua rede local funciona sozinho: os jogadores se conectam direto a ele, só com um apelido."
      ],
      [
        "Quantos jogadores podem entrar?",
        "Até 10 jogadores por mesa, mais espectadores, e quantas mesas o seu grupo precisar."
      ]
    ]
  },
  "pt-PT": {
    "title": "Servidor de póquer próprio — grátis e autoalojado | PokerTH",
    "desc": "Servidor privado de Texas Hold’em em casa, no clube ou na escola: servidor PokerTH e cliente web grátis, instalados num só comando, com Docker ou num Raspberry Pi.",
    "ldHeadline": "Como alojar o seu próprio servidor de póquer PokerTH",
    "ldDesc": "Instale um servidor de Texas Hold’em privado e autoalojado com o servidor dedicado PokerTH e o cliente web PokerTH.",
    "h1": "Aloje o seu próprio servidor de póquer",
    "lead": "O PokerTH é gratuito e de código aberto do princípio ao fim: o servidor de jogo e este cliente web podem funcionar na sua própria máquina. Um PC, um servidor doméstico ou um Raspberry Pi chegam para um jogo em família, uma noite de clube, uma liga no escritório ou uma escola, e todos os telemóveis, tablets ou computadores da sua rede passam a jogar no navegador apenas com uma alcunha.",
    "whyH2": "Porquê ter o seu",
    "why": [
      [
        "Privado",
        "Os seus jogos ficam na sua máquina e na sua rede; os jogadores não precisam de conta nem de endereço de email, apenas de uma alcunha."
      ],
      [
        "À sua medida",
        "Dê ao servidor um nome próprio, escolha os modos que o ecrã de início de sessão oferece, publique uma mensagem de boas-vindas e mantenha uma classificação partilhada para o seu grupo."
      ],
      [
        "Grátis",
        "Sem licença, sem subscrição, sem anúncios: o servidor PokerTH e o cliente web são ambos software livre."
      ]
    ],
    "partsH2": "Duas peças",
    "partsP": "Um jogo de PokerTH precisa do servidor dedicado PokerTH, que distribui as cartas e gere as mesas, e do cliente web, que serve a aplicação aos navegadores e os liga a esse servidor. Podem funcionar na mesma máquina. Tudo continua compatível: as aplicações PokerTH — o cliente QML para Windows, macOS, Linux e Android, e o clássico cliente widget para computador — ligam-se ao mesmo servidor que os navegadores, por isso os jogadores podem misturar navegadores e aplicações na mesma mesa.",
    "stepsH2": "Instale em três passos",
    "steps": [
      [
        "Instale o servidor PokerTH",
        "Compile o pokerth_dedicated_server a partir do código-fonte do PokerTH — versão 2.1.10 ou posterior — seguindo o guia do servidor do projeto PokerTH: precisa de Qt 6.7 ou mais recente, CMake e um compilador C++23. O pacote pokerth-server das distribuições Linux é uma versão mais antiga. O servidor escuta na porta TCP 7234."
      ],
      [
        "Instale o cliente web",
        "No Debian, Ubuntu ou Raspberry Pi OS, o script de instalação configura o Node.js, o cliente web e um serviço que arranca com a máquina, com um único comando. Quem usa Docker descarrega uma imagem pronta para amd64, arm64 e armv7, e o CasaOS importa o mesmo ficheiro Compose como uma aplicação."
      ],
      [
        "Jogue",
        "Em qualquer dispositivo da sua rede, abra o endereço da máquina na porta 8080, escolha LAN / Servidor dedicado, escreva uma alcunha e crie uma mesa. Os jogadores com o cliente QML ou widget do PokerTH ligam-se à mesma máquina na porta 7234 e juntam-se às mesmas mesas."
      ]
    ],
    "piH2": "Num Raspberry Pi",
    "piP": "O PokerTH troca mensagens pequenas e são os dispositivos dos jogadores que fazem todo o desenho, por isso um Raspberry Pi chega perfeitamente: um Pi 4 com 2 GB é a escolha ideal, um Pi 5 é mais do que suficiente. Para uma noite sem falhas, a rede conta mais do que a placa — ligue o Pi ao router por cabo e use um bom ponto de acesso Wi-Fi para os jogadores.",
    "httpsH2": "HTTP na LAN, HTTPS para os extras",
    "httpsP": "Na sua própria rede, o jogo funciona por HTTP simples. Instalar a aplicação no ecrã principal, jogar offline e receber notificações requer HTTPS, que o guia configura com Nginx e um certificado gratuito Let’s Encrypt.",
    "adminH2": "Um painel de administração no navegador",
    "adminP": "Uma consola protegida por token em /admin mostra quem está ligado, atualiza o cliente web com um clique e pode revertê-lo, envia anúncios aos jogadores, repõe a classificação, instala baralhos, estilos de mesa e música, lista os servidores de jogo a que o cliente pode aceder e distribui chaves que desbloqueiam apenas algumas das suas secções.",
    "shareH2": "Convide jogadores de fora",
    "shareP": "As ligações de convite e os códigos QR funcionam no seu servidor tal como no pokerth.net: um amigo abre a ligação e fica sentado na sua mesa. Se o seu servidor estiver acessível a partir da Internet, também o pode propor para a lista pública de servidores do cliente web; passa a aparecer lá assim que os administradores do cliente web o aprovarem.",
    "guidesH2": "Guias passo a passo",
    "guides": [
      "Guia de configuração do servidor PokerTH",
      "Autoalojamento e instalação com um só comando",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Instalação manual e HTTPS",
      "O painel de administração"
    ],
    "faqH2": "Perguntas",
    "faq": [
      [
        "Alojar um servidor PokerTH é grátis?",
        "Sim. O servidor PokerTH e o cliente web são software livre e de código aberto; só precisa de uma máquina para os executar."
      ],
      [
        "De que hardware preciso?",
        "Muito pouco: qualquer PC ou servidor doméstico com Linux ou Docker, ou um Raspberry Pi 4 ou 5. Uma ligação de rede por cabo conta mais do que a capacidade de processamento."
      ],
      [
        "Os jogadores precisam de instalar alguma coisa?",
        "Não. Abrem o endereço do servidor num navegador no telemóvel, tablet ou computador. Quem preferir uma aplicação pode usar o cliente QML do PokerTH ou o clássico cliente widget: ligam-se ao mesmo servidor e jogam nas mesmas mesas."
      ],
      [
        "É preciso o pokerth.net ou uma ligação à Internet?",
        "Não. Um servidor na sua rede local funciona de forma autónoma: os jogadores ligam-se diretamente a ele, apenas com uma alcunha."
      ],
      [
        "Quantos jogadores podem entrar?",
        "Até 10 jogadores por mesa, mais espetadores, e tantas mesas quantas o seu grupo precisar."
      ]
    ]
  },
  ro: {
    "title": "Server de poker propriu — gratuit, găzduit de tine | PokerTH",
    "desc": "Un server privat de Texas Hold’em acasă, la club sau la școală: serverul PokerTH și clientul web gratuite, instalate cu o comandă, cu Docker sau pe Raspberry Pi.",
    "ldHeadline": "Cum să-ți găzduiești propriul server de poker PokerTH",
    "ldDesc": "Configurează un server Texas Hold’em privat, găzduit de tine, cu serverul dedicat PokerTH și clientul web PokerTH.",
    "h1": "Găzduiește-ți propriul server de poker",
    "lead": "PokerTH este gratuit și open source de la un capăt la altul: serverul de joc și acest client web pot rula pe propria ta mașină. Un PC, un server de acasă sau un Raspberry Pi ajunge pentru un joc în familie, o seară la club, o ligă la birou sau o școală, iar apoi fiecare telefon, tabletă sau calculator din rețeaua ta joacă în browser doar cu un pseudonim.",
    "whyH2": "De ce să ai serverul tău",
    "why": [
      [
        "Privat",
        "Jocurile tale rămân pe mașina și în rețeaua ta; jucătorii nu au nevoie de cont și nici de adresă de e-mail, doar de un pseudonim."
      ],
      [
        "Pe gustul tău",
        "Dă-i serverului propriul nume, alege ce moduri oferă ecranul de autentificare, publică un mesaj de bun venit și păstrează un clasament comun pentru grupul tău."
      ],
      [
        "Gratuit",
        "Fără licență, fără abonament, fără reclame: serverul PokerTH și clientul web sunt amândouă software liber."
      ]
    ],
    "partsH2": "Două componente",
    "partsP": "Un joc PokerTH are nevoie de serverul dedicat PokerTH, care împarte cărțile și gestionează mesele, și de clientul web, care livrează aplicația către browsere și le conectează la acel server. Pot rula pe aceeași mașină. Totul rămâne compatibil: aplicațiile PokerTH se conectează la același server ca browserele — clientul QML pe Windows, macOS, Linux și Android și clientul clasic widget pe desktop —, astfel că jucătorii pot combina browsere și aplicații la aceeași masă.",
    "stepsH2": "Configurare în trei pași",
    "steps": [
      [
        "Instalează serverul PokerTH",
        "Compilează pokerth_dedicated_server din sursele PokerTH — versiunea 2.1.10 sau mai nouă — urmând ghidul de server al proiectului PokerTH: are nevoie de Qt 6.7 sau mai nou, CMake și un compilator C++23. Pachetul pokerth-server din distribuțiile Linux este o versiune mai veche. Serverul ascultă pe portul TCP 7234."
      ],
      [
        "Instalează clientul web",
        "Pe Debian, Ubuntu sau Raspberry Pi OS, scriptul de instalare configurează Node.js, clientul web și un serviciu care pornește odată cu mașina, cu o singură comandă. Utilizatorii Docker descarcă o imagine gata făcută pentru amd64, arm64 și armv7, iar CasaOS importă același fișier Compose ca aplicație."
      ],
      [
        "Joacă",
        "Pe orice dispozitiv din rețeaua ta, deschide adresa mașinii pe portul 8080, alege „LAN / Server dedicat”, scrie un pseudonim și creează o masă. Jucătorii cu clientul PokerTH QML sau widget se conectează la aceeași mașină pe portul 7234 și intră la aceleași mese."
      ]
    ],
    "piH2": "Pe un Raspberry Pi",
    "piP": "PokerTH schimbă mesaje mici, iar tot desenul îl fac dispozitivele jucătorilor, așa că un Raspberry Pi ajunge din plin: un Pi 4 cu 2 GB este alegerea ideală, un Pi 5 este mai mult decât suficient. Pentru o seară fără sincope, rețeaua contează mai mult decât placa — conectează Pi-ul la router cu un cablu și folosește un punct de acces Wi-Fi bun pentru jucători.",
    "httpsH2": "HTTP în LAN, HTTPS pentru extra",
    "httpsP": "În propria rețea, jocul funcționează prin HTTP simplu. Instalarea aplicației pe ecranul principal, jocul offline și primirea notificărilor au nevoie de HTTPS, pe care ghidul îl configurează cu Nginx și un certificat Let’s Encrypt gratuit.",
    "adminH2": "Un panou de administrare în browser",
    "adminP": "O consolă protejată prin token la /admin arată cine este conectat, actualizează clientul web dintr-un clic și poate reveni la versiunea anterioară, trimite anunțuri jucătorilor, resetează clasamentul, instalează pachete de cărți, stiluri de masă și muzică, listează serverele de joc la care se poate conecta clientul și oferă chei care deblochează doar unele dintre secțiunile sale.",
    "shareH2": "Invită jucători din afară",
    "shareP": "Linkurile de invitație și codurile QR funcționează pe serverul tău exact ca pe pokerth.net: un prieten deschide linkul și este așezat la masa ta. Dacă serverul tău este accesibil de pe internet, îl poți propune și pentru lista publică de servere a clientului web; apare acolo după ce administratorii clientului web îl aprobă.",
    "guidesH2": "Ghiduri pas cu pas",
    "guides": [
      "Ghidul de configurare a serverului PokerTH",
      "Găzduire proprie și instalarea cu o singură comandă",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Instalare manuală și HTTPS",
      "Panoul de administrare"
    ],
    "faqH2": "Întrebări",
    "faq": [
      [
        "Găzduirea unui server PokerTH este gratuită?",
        "Da. Serverul PokerTH și clientul web sunt software gratuit și open source; ai nevoie doar de o mașină pe care să le rulezi."
      ],
      [
        "De ce hardware am nevoie?",
        "Foarte puțin: orice PC sau server de acasă care rulează Linux sau Docker, ori un Raspberry Pi 4 sau 5. O conexiune la rețea prin cablu contează mai mult decât puterea de procesare."
      ],
      [
        "Jucătorii trebuie să instaleze ceva?",
        "Nu. Deschid adresa serverului într-un browser pe telefon, tabletă sau calculator. Cei care preferă o aplicație pot folosi clientul PokerTH QML sau clientul clasic widget: se conectează la același server și joacă la aceleași mese."
      ],
      [
        "Are nevoie de pokerth.net sau de o conexiune la internet?",
        "Nu. Un server din rețeaua ta locală funcționează singur: jucătorii se conectează direct la el, doar cu un pseudonim."
      ],
      [
        "Câți jucători pot intra?",
        "Până la 10 jucători la o masă, plus spectatori, și câte mese are nevoie grupul tău."
      ]
    ]
  },
  ru: {
    "title": "Свой покерный сервер — бесплатно, на своём железе | PokerTH",
    "desc": "Приватный сервер Texas Hold’em дома, в клубе или в школе: бесплатные сервер PokerTH и веб-клиент, установка одной командой, через Docker или на Raspberry Pi.",
    "ldHeadline": "Как запустить свой покерный сервер PokerTH",
    "ldDesc": "Разверните приватный сервер Texas Hold’em на своём оборудовании с выделенным сервером PokerTH и веб-клиентом PokerTH.",
    "h1": "Запустите свой покерный сервер",
    "lead": "PokerTH бесплатен и открыт от начала до конца: игровой сервер и этот веб-клиент можно запустить на собственной машине. ПК, домашнего сервера или Raspberry Pi достаточно для семейной игры, вечера в клубе, офисной лиги или школы, и тогда любой телефон, планшет или компьютер в вашей сети играет в браузере — нужен лишь никнейм.",
    "whyH2": "Зачем свой сервер",
    "why": [
      [
        "Приватность",
        "Ваши игры остаются на вашей машине и в вашей сети; игрокам не нужны ни аккаунт, ни адрес электронной почты — только никнейм."
      ],
      [
        "Всё под вас",
        "Дайте серверу собственное имя, выберите, какие режимы предлагает экран входа, разместите приветственное сообщение и ведите общий рейтинг для своей компании."
      ],
      [
        "Бесплатно",
        "Ни лицензий, ни подписки, ни рекламы: и сервер PokerTH, и веб-клиент — свободные программы."
      ]
    ],
    "partsH2": "Две части",
    "partsP": "Для игры в PokerTH нужны выделенный сервер PokerTH, который раздаёт карты и ведёт столы, и веб-клиент, который отдаёт приложение браузерам и подключает их к этому серверу. Оба могут работать на одной машине. Всё остаётся совместимым: приложения PokerTH — клиент QML для Windows, macOS, Linux и Android и классический клиент widget для настольных компьютеров — подключаются к тому же серверу, что и браузеры, так что за одним столом могут сидеть игроки и из браузера, и из приложения.",
    "stepsH2": "Настройка в три шага",
    "steps": [
      [
        "Установите сервер PokerTH",
        "Соберите pokerth_dedicated_server из исходников PokerTH — версии 2.1.10 или новее — по руководству по серверу проекта PokerTH: нужны Qt 6.7 или новее, CMake и компилятор C++23. Пакет pokerth-server в дистрибутивах Linux — более старая версия. Сервер слушает TCP-порт 7234."
      ],
      [
        "Установите веб-клиент",
        "На Debian, Ubuntu или Raspberry Pi OS установочный скрипт одной командой ставит Node.js, веб-клиент и службу, которая запускается вместе с машиной. Пользователи Docker скачивают готовый образ для amd64, arm64 и armv7, а CasaOS импортирует тот же файл Compose как приложение."
      ],
      [
        "Играйте",
        "На любом устройстве в вашей сети откройте адрес машины на порту 8080, выберите «LAN / Выделенный сервер», введите никнейм и создайте стол. Игроки с клиентом PokerTH QML или widget подключаются к той же машине на порту 7234 и садятся за те же столы."
      ]
    ],
    "piH2": "На Raspberry Pi",
    "piP": "PokerTH обменивается короткими сообщениями, а всю отрисовку берут на себя устройства игроков, так что Raspberry Pi хватает с запасом: Pi 4 с 2 ГБ — оптимальный выбор, Pi 5 — более чем достаточно. Для спокойного вечера сеть важнее платы — подключите Pi к роутеру кабелем и дайте игрокам хорошую точку доступа Wi-Fi.",
    "httpsH2": "HTTP в локальной сети, HTTPS для дополнительных возможностей",
    "httpsP": "В вашей собственной сети игра работает по обычному HTTP. Для установки приложения на главный экран, игры офлайн и получения уведомлений нужен HTTPS, который руководство настраивает с Nginx и бесплатным сертификатом Let’s Encrypt.",
    "adminH2": "Панель администратора в браузере",
    "adminP": "Защищённая токеном консоль по адресу /admin показывает, кто подключён, обновляет веб-клиент в один клик и умеет откатить его назад, рассылает объявления игрокам, сбрасывает рейтинг, устанавливает колоды карт, стили стола и музыку, задаёт список игровых серверов, доступных клиенту, и выдаёт ключи, открывающие лишь некоторые её разделы.",
    "shareH2": "Приглашайте игроков извне",
    "shareP": "Ссылки-приглашения и QR-коды работают на вашем сервере так же, как на pokerth.net: друг открывает ссылку и садится за ваш стол. Если ваш сервер доступен из интернета, вы также можете предложить его в публичный список серверов веб-клиента; он появится там, как только его одобрят администраторы веб-клиента.",
    "guidesH2": "Пошаговые руководства",
    "guides": [
      "Руководство по установке сервера PokerTH",
      "Самостоятельный хостинг и установка одной командой",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ручная установка и HTTPS",
      "Панель администратора"
    ],
    "faqH2": "Вопросы",
    "faq": [
      [
        "Бесплатно ли держать свой сервер PokerTH?",
        "Да. Сервер PokerTH и веб-клиент — свободные программы с открытым исходным кодом; нужна только машина, на которой они будут работать."
      ],
      [
        "Какое оборудование нужно?",
        "Совсем немного: любой ПК или домашний сервер с Linux или Docker либо Raspberry Pi 4 или 5. Проводное подключение к сети важнее вычислительной мощности."
      ],
      [
        "Нужно ли игрокам что-то устанавливать?",
        "Нет. Они открывают адрес сервера в браузере на телефоне, планшете или компьютере. Те, кто предпочитает приложение, могут использовать клиент PokerTH QML или классический клиент widget: они подключаются к тому же серверу и играют за теми же столами."
      ],
      [
        "Нужен ли pokerth.net или подключение к интернету?",
        "Нет. Сервер в вашей локальной сети работает автономно: игроки подключаются к нему напрямую, с одним лишь никнеймом."
      ],
      [
        "Сколько игроков может присоединиться?",
        "До 10 игроков за столом, плюс зрители, и столько столов, сколько нужно вашей компании."
      ]
    ]
  },
  si: {
    "title": "ඔබේම පෝකර් සේවාදායකය — නොමිලේ, ස්වයං-සත්කාරක | PokerTH",
    "desc": "නිවසේ, සමාජයක හෝ පාසලක පෞද්ගලික Texas Hold’em සේවාදායකයක්: නොමිලේ PokerTH සේවාදායකය සහ වෙබ් සේවාලාභියා, එක් විධානයකින්, Docker සමඟ හෝ Raspberry Pi මත.",
    "ldHeadline": "ඔබේම PokerTH පෝකර් සේවාදායකයක් සත්කාරකත්වය කරන්නේ කෙසේද",
    "ldDesc": "PokerTH කැපවූ සේවාදායකය සහ PokerTH වෙබ් සේවාලාභියා සමඟ පෞද්ගලික, ස්වයං-සත්කාරක Texas Hold’em සේවාදායකයක් සකසන්න.",
    "h1": "ඔබේම පෝකර් සේවාදායකයක් ධාවනය කරන්න",
    "lead": "PokerTH මුල සිට අගටම නොමිලේ සහ විවෘත මූලාශ්‍ර වේ: ක්‍රීඩා සේවාදායකය සහ මෙම වෙබ් සේවාලාභියා ඔබේම යන්ත්‍රයේ ධාවනය කළ හැක. පවුලේ ක්‍රීඩාවකට, සමාජ රාත්‍රියකට, කාර්යාල ලීගයකට හෝ පාසලකට පරිගණකයක්, නිවසේ සේවාදායකයක් හෝ Raspberry Pi එකක් ප්‍රමාණවත් වන අතර, ඉන්පසු ඔබේ ජාලයේ සෑම දුරකථනයක්ම, ටැබ්ලටයක්ම හෝ පරිගණකයක්ම අන්වර්ථ නාමයක් පමණක් සමඟ බ්‍රවුසරයේ ක්‍රීඩා කරයි.",
    "whyH2": "ඔබේම සේවාදායකයක් ඇයි",
    "why": [
      [
        "පෞද්ගලික",
        "ඔබේ ක්‍රීඩා ඔබේ යන්ත්‍රයේ සහ ඔබේ ජාලයේම රැඳේ; ක්‍රීඩකයන්ට ගිණුමක් හෝ විද්‍යුත් තැපැල් ලිපිනයක් අවශ්‍ය නැත, අන්වර්ථ නාමයක් පමණක් ප්‍රමාණවත්."
      ],
      [
        "ඔබේ අභිමතය පරිදි",
        "සේවාදායකයට තමන්ගේම නමක් දෙන්න, පිවිසුම් තිරය පිරිනමන ප්‍රකාර තෝරන්න, පිළිගැනීමේ පණිවිඩයක් පළ කරන්න, සහ ඔබේ කණ්ඩායම සඳහා හවුල් ප්‍රමුඛ පුවරුවක් පවත්වාගන්න."
      ],
      [
        "නොමිලේ",
        "බලපත්‍රයක් නැත, දායකත්වයක් නැත, දැන්වීම් නැත: PokerTH සේවාදායකය සහ වෙබ් සේවාලාභියා යන දෙකම නිදහස් මෘදුකාංග වේ."
      ]
    ],
    "partsH2": "කොටස් දෙකක්",
    "partsP": "PokerTH ක්‍රීඩාවකට, කාඩ්පත් බෙදන සහ මේස පවත්වාගෙන යන PokerTH කැපවූ සේවාදායකය සහ, බ්‍රවුසරවලට යෙදුම සපයා ඒවා එම සේවාදායකයට සම්බන්ධ කරන වෙබ් සේවාලාභියා අවශ්‍ය වේ. ඒවා එකම යන්ත්‍රයේ ධාවනය කළ හැක. සියල්ල ගැළපෙන ලෙසම පවතී: PokerTH යෙදුම් — Windows, macOS, Linux සහ Android සඳහා QML සේවාලාභියා සහ ඩෙස්ක්ටොප් සඳහා සම්ප්‍රදායික widget සේවාලාභියා — බ්‍රවුසර සම්බන්ධ වන එම සේවාදායකයටම සම්බන්ධ වන බැවින්, එක් මේසයක ක්‍රීඩකයන්ට බ්‍රවුසර සහ යෙදුම් මිශ්‍ර කර ක්‍රීඩා කළ හැක.",
    "stepsH2": "පියවර තුනකින් සකසන්න",
    "steps": [
      [
        "PokerTH සේවාදායකය ස්ථාපනය කරන්න",
        "PokerTH ව්‍යාපෘතියේ සේවාදායක මාර්ගෝපදේශය අනුගමනය කරමින් PokerTH මූලාශ්‍රවලින් pokerth_dedicated_server ගොඩනගන්න — 2.1.10 අනුවාදය හෝ ඊට පසු: ඒ සඳහා Qt 6.7 හෝ ඊට නවතම, CMake සහ C++23 සම්පාදකයක් අවශ්‍ය වේ. Linux බෙදාහැරීම්වල pokerth-server පැකේජය පැරණි අනුවාදයකි. සේවාදායකය TCP තොට 7234 හි සවන් දෙයි."
      ],
      [
        "වෙබ් සේවාලාභියා ස්ථාපනය කරන්න",
        "Debian, Ubuntu හෝ Raspberry Pi OS මත ස්ථාපන ස්ක්‍රිප්ටය එක් විධානයකින් Node.js, වෙබ් සේවාලාභියා සහ යන්ත්‍රය සමඟම ආරම්භ වන සේවාවක් සකසයි. Docker භාවිත කරන්නන් amd64, arm64 සහ armv7 සඳහා සූදානම් කළ රූපයක් ලබාගන්නා අතර, CasaOS එම Compose ගොනුවම යෙදුමක් ලෙස ආයාත කරයි."
      ],
      [
        "ක්‍රීඩා කරන්න",
        "ඔබේ ජාලයේ ඕනෑම උපාංගයක, තොට 8080 හි යන්ත්‍රයේ ලිපිනය විවෘත කර, ‘LAN / කැපවූ සේවාදායකය’ තෝරා, අන්වර්ථ නාමයක් ටයිප් කර මේසයක් සාදන්න. PokerTH QML හෝ widget සේවාලාභියා භාවිත කරන ක්‍රීඩකයන් තොට 7234 හරහා එම යන්ත්‍රයටම සම්බන්ධ වී එම මේසවලටම එක් වේ."
      ]
    ],
    "piH2": "Raspberry Pi එකක් මත",
    "piP": "PokerTH කුඩා පණිවිඩ පමණක් හුවමාරු කරන අතර සියලු ඇඳීම් ක්‍රීඩකයන්ගේ උපාංග විසින්ම සිදු කරයි, එබැවින් Raspberry Pi එකක් හොඳටම ප්‍රමාණවත්: 2 GB සහිත Pi 4 හොඳම තේරීමයි, Pi 5 අවශ්‍යතාවට වඩා වැඩිය. සුමට රාත්‍රියක් සඳහා පුවරුවට වඩා ජාලය වැදගත් වේ — Pi එක කේබලයකින් රවුටරයට සම්බන්ධ කර, ක්‍රීඩකයන් සඳහා හොඳ Wi-Fi ප්‍රවේශ ස්ථානයක් භාවිත කරන්න.",
    "httpsH2": "LAN තුළ HTTP, අමතර විශේෂාංග සඳහා HTTPS",
    "httpsP": "ඔබේම ජාලය තුළ ක්‍රීඩාව සාමාන්‍ය HTTP හරහා ක්‍රියා කරයි. මුල් තිරයට යෙදුම ස්ථාපනය කිරීම, ඕෆ්ලයින් ක්‍රීඩා කිරීම සහ දැනුම්දීම් ලැබීම සඳහා HTTPS අවශ්‍ය වන අතර, මාර්ගෝපදේශය එය Nginx සහ නොමිලේ Let’s Encrypt සහතිකයක් සමඟ සකසයි.",
    "adminH2": "බ්‍රවුසරයේම පරිපාලන පුවරුවක්",
    "adminP": "/admin හි ඇති ටෝකනයකින් ආරක්ෂිත කොන්සෝලය සම්බන්ධ වී සිටින්නේ කවුදැයි පෙන්වයි, එක් ක්ලික් කිරීමකින් වෙබ් සේවාලාභියා යාවත්කාලීන කර එය පෙර අනුවාදයට ආපසු හැරවිය හැක, ක්‍රීඩකයන්ට නිවේදන යවයි, ප්‍රමුඛ පුවරුව යළි සකසයි, කාඩ් කට්ටල, මේස විලාස සහ සංගීතය ස්ථාපනය කරයි, සේවාලාභියාට ළඟා විය හැකි ක්‍රීඩා සේවාදායක ලැයිස්තුගත කරයි, සහ එහි සමහර කොටස් පමණක් විවෘත කරන යතුරු ලබා දෙයි.",
    "shareH2": "පිටතින් ක්‍රීඩකයන්ට ආරාධනා කරන්න",
    "shareP": "ආරාධනා සබැඳි සහ QR කේත ඔබේ සේවාදායකයේද pokerth.net හි මෙන්ම ක්‍රියා කරයි: මිතුරෙකු සබැඳිය විවෘත කළ විට ඔබේ මේසයේ හිඳගනී. ඔබේ සේවාදායකයට අන්තර්ජාලයෙන් ළඟා විය හැකි නම්, වෙබ් සේවාලාභියාගේ පොදු සේවාදායක ලැයිස්තුවට එය යෝජනා කිරීමටද ඔබට හැක; වෙබ් සේවාලාභියාගේ පරිපාලකයින් එය අනුමත කළ පසු එය එහි දිස් වේ.",
    "guidesH2": "පියවරෙන් පියවර මාර්ගෝපදේශ",
    "guides": [
      "PokerTH සේවාදායක සැකසුම් මාර්ගෝපදේශය",
      "ස්වයං-සත්කාරකත්වය සහ එක් විධානයකින් ස්ථාපනය",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "අතින් ස්ථාපනය සහ HTTPS",
      "පරිපාලන පුවරුව"
    ],
    "faqH2": "ප්‍රශ්න",
    "faq": [
      [
        "PokerTH සේවාදායකයක් සත්කාරකත්වය කිරීම නොමිලේද?",
        "ඔව්. PokerTH සේවාදායකය සහ වෙබ් සේවාලාභියා නොමිලේ සහ විවෘත මූලාශ්‍ර මෘදුකාංග වේ; ඒවා ධාවනය කිරීමට ඔබට අවශ්‍ය වන්නේ යන්ත්‍රයක් පමණි."
      ],
      [
        "මට කුමන දෘඩාංග අවශ්‍යද?",
        "ඉතා සුළු ප්‍රමාණයක්: Linux හෝ Docker ධාවනය වන ඕනෑම පරිගණකයක් හෝ නිවසේ සේවාදායකයක්, නැතහොත් Raspberry Pi 4 හෝ 5. සැකසුම් බලයට වඩා රැහැන්ගත ජාල සම්බන්ධතාවක් වැදගත් වේ."
      ],
      [
        "ක්‍රීඩකයන්ට කිසිවක් ස්ථාපනය කිරීමට අවශ්‍යද?",
        "නැත. ඔවුන් තම දුරකථනයේ, ටැබ්ලටයේ හෝ පරිගණකයේ බ්‍රවුසරයක සේවාදායකයේ ලිපිනය විවෘත කරයි. යෙදුමකට කැමති අයට PokerTH QML සේවාලාභියා හෝ සම්ප්‍රදායික widget සේවාලාභියා භාවිත කළ හැක: ඒවායින් එම සේවාදායකයටම සම්බන්ධ වී එම මේසවලම ක්‍රීඩා කළ හැක."
      ],
      [
        "එයට pokerth.net හෝ අන්තර්ජාල සම්බන්ධතාවක් අවශ්‍යද?",
        "නැත. ඔබේ ස්ථානීය ජාලයේ සේවාදායකයක් තනිවම ක්‍රියා කරයි: ක්‍රීඩකයන් අන්වර්ථ නාමයක් පමණක් සමඟ එයට සෘජුවම සම්බන්ධ වේ."
      ],
      [
        "ක්‍රීඩකයන් කී දෙනෙකුට එක්විය හැකිද?",
        "එක් මේසයකට ක්‍රීඩකයන් 10 දක්වා, නරඹන්නන්ද සමඟ, සහ ඔබේ කණ්ඩායමට අවශ්‍ය තරම් මේස."
      ]
    ]
  },
  sk: {
    "title": "Vlastný pokerový server — zadarmo, vo vlastnej réžii | PokerTH",
    "desc": "Súkromný Texas Hold’em server doma, v klube či v škole: bezplatný server a webový klient PokerTH, nastavené jedným príkazom, cez Docker alebo na Raspberry Pi.",
    "ldHeadline": "Ako hostovať vlastný pokerový server PokerTH",
    "ldDesc": "Nastavte si súkromný Texas Hold’em server vo vlastnej réžii s vyhradeným serverom PokerTH a webovým klientom PokerTH.",
    "h1": "Hostujte vlastný pokerový server",
    "lead": "PokerTH je od začiatku do konca bezplatný a s otvoreným zdrojovým kódom: herný server aj tento webový klient môžu bežať na vašom vlastnom stroji. Na rodinnú hru, klubový večer, firemnú ligu či školu stačí PC, domáci server alebo Raspberry Pi a potom každý telefón, tablet alebo počítač vo vašej sieti hrá vo svojom prehliadači len s prezývkou.",
    "whyH2": "Prečo vlastný server",
    "why": [
      [
        "Súkromne",
        "Vaše hry zostávajú na vašom stroji a vo vašej sieti; hráči nepotrebujú účet ani e-mailovú adresu, len prezývku."
      ],
      [
        "Podľa vás",
        "Dajte serveru vlastný názov, vyberte, ktoré režimy ponúkne prihlasovacia obrazovka, zverejnite uvítaciu správu a veďte spoločný rebríček pre svoju skupinu."
      ],
      [
        "Zadarmo",
        "Žiadna licencia, žiadne predplatné, žiadne reklamy: server PokerTH aj webový klient sú slobodný softvér."
      ]
    ],
    "partsH2": "Dve časti",
    "partsP": "Hra PokerTH potrebuje vyhradený server PokerTH, ktorý rozdáva karty a riadi stoly, a webového klienta, ktorý doručuje aplikáciu prehliadačom a pripája ich k tomuto serveru. Môžu bežať na tom istom stroji. Všetko zostáva kompatibilné: aplikácie PokerTH sa pripájajú k tomu istému serveru ako prehliadače — QML klient pre Windows, macOS, Linux a Android a klasický widget klient pre desktop — takže pri jednom stole môžu hráči kombinovať prehliadače a aplikácie.",
    "stepsH2": "Nastavenie v troch krokoch",
    "steps": [
      [
        "Nainštalujte server PokerTH",
        "Zostavte pokerth_dedicated_server zo zdrojového kódu PokerTH — verzia 2.1.10 alebo novšia — podľa návodu na server projektu PokerTH: potrebuje Qt 6.7 alebo novšie, CMake a kompilátor C++23. Balík pokerth-server v distribúciách Linux je staršia verzia. Server počúva na porte TCP 7234."
      ],
      [
        "Nainštalujte webového klienta",
        "V systémoch Debian, Ubuntu alebo Raspberry Pi OS inštalačný skript jedným príkazom nastaví Node.js, webového klienta a službu, ktorá sa spúšťa spolu so strojom. Kto používa Docker, stiahne hotový obraz pre amd64, arm64 a armv7, a CasaOS importuje ten istý súbor Compose ako aplikáciu."
      ],
      [
        "Hrajte",
        "Na ľubovoľnom zariadení vo vašej sieti otvorte adresu stroja na porte 8080, zvoľte LAN / Vyhradený server, zadajte prezývku a vytvorte stôl. Hráči s QML alebo widget klientom PokerTH sa pripájajú k tomu istému stroju na porte 7234 a prisadnú si k tým istým stolom."
      ]
    ],
    "piH2": "Na Raspberry Pi",
    "piP": "PokerTH si vymieňa malé správy a všetko vykresľovanie robia zariadenia hráčov, takže Raspberry Pi úplne stačí: Pi 4 s 2 GB je ideálna voľba, Pi 5 je viac než dosť. Pre plynulý večer je sieť dôležitejšia ako doska — pripojte Pi k routeru káblom a pre hráčov použite dobrý prístupový bod Wi-Fi.",
    "httpsH2": "HTTP v LAN, HTTPS pre extra funkcie",
    "httpsP": "Vo vašej vlastnej sieti hra funguje cez obyčajné HTTP. Inštalácia aplikácie na domovskú obrazovku, hranie offline a prijímanie upozornení vyžadujú HTTPS, ktoré návod nastaví pomocou Nginx a bezplatného certifikátu Let’s Encrypt.",
    "adminH2": "Správcovský panel v prehliadači",
    "adminP": "Konzola na /admin chránená tokenom ukazuje, kto je pripojený, jedným kliknutím aktualizuje webového klienta a vie ho vrátiť na predchádzajúcu verziu, posiela hráčom oznámenia, vynuluje rebríček, inštaluje balíčky kariet, štýly stola a hudbu, vedie zoznam herných serverov, ku ktorým sa klient smie pripojiť, a rozdáva kľúče, ktoré odomykajú len niektoré jej sekcie.",
    "shareH2": "Pozvite hráčov zvonku",
    "shareP": "Odkazy s pozvánkou a QR kódy fungujú na vašom serveri rovnako ako na pokerth.net: priateľ otvorí odkaz a sadne si k vášmu stolu. Ak je váš server dostupný z internetu, môžete ho aj navrhnúť do verejného zoznamu serverov webového klienta; objaví sa tam, keď ho správcovia webového klienta schvália.",
    "guidesH2": "Návody krok za krokom",
    "guides": [
      "Návod na nastavenie servera PokerTH",
      "Vlastný hosting a inštalácia jedným príkazom",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ručná inštalácia a HTTPS",
      "Správcovský panel"
    ],
    "faqH2": "Otázky",
    "faq": [
      [
        "Je hosting servera PokerTH zadarmo?",
        "Áno. Server PokerTH aj webový klient sú bezplatný softvér s otvoreným zdrojovým kódom; potrebujete len stroj, na ktorom pobežia."
      ],
      [
        "Aký hardvér potrebujem?",
        "Veľmi málo: akékoľvek PC alebo domáci server, na ktorom beží Linux alebo Docker, alebo Raspberry Pi 4 či 5. Káblové sieťové pripojenie je dôležitejšie ako výpočtový výkon."
      ],
      [
        "Musia si hráči niečo inštalovať?",
        "Nie. Otvoria adresu servera v prehliadači na svojom telefóne, tablete alebo počítači. Kto uprednostňuje aplikáciu, môže použiť QML klienta PokerTH alebo klasického widget klienta: pripájajú sa k tomu istému serveru a hrá sa pri tých istých stoloch."
      ],
      [
        "Potrebuje pokerth.net alebo pripojenie na internet?",
        "Nie. Server vo vašej lokálnej sieti beží samostatne: hráči sa k nemu pripájajú priamo, len s prezývkou."
      ],
      [
        "Koľko hráčov sa môže pripojiť?",
        "Až 10 hráčov pri stole, plus diváci, a toľko stolov, koľko vaša skupina potrebuje."
      ]
    ]
  },
  sl: {
    "title": "Lasten poker strežnik — brezplačno, na tvoji opremi | PokerTH",
    "desc": "Zasebni Texas Hold’em strežnik doma, v klubu ali šoli: brezplačni strežnik in spletni odjemalec PokerTH, nameščena z enim ukazom, z orodjem Docker ali na Raspberry Pi.",
    "ldHeadline": "Kako postaviti lasten poker strežnik PokerTH",
    "ldDesc": "Postavi zasebni strežnik za Texas Hold’em na lastni opremi z namenskim strežnikom PokerTH in spletnim odjemalcem PokerTH.",
    "h1": "Postavi lasten poker strežnik",
    "lead": "PokerTH je od začetka do konca brezplačen in odprtokoden: igralni strežnik in ta spletni odjemalec lahko tečeta na tvoji lastni napravi. Osebni računalnik, domači strežnik ali Raspberry Pi zadošča za družinsko igro, klubski večer, pisarniško ligo ali šolo, nato pa vsak telefon, tablica ali računalnik v tvojem omrežju igra v brskalniku samo z vzdevkom.",
    "whyH2": "Zakaj lasten strežnik",
    "why": [
      [
        "Zasebno",
        "Tvoje igre ostanejo na tvoji napravi in v tvojem omrežju; igralci ne potrebujejo ne računa ne e-poštnega naslova, le vzdevek."
      ],
      [
        "Po tvoji meri",
        "Daj strežniku lastno ime, izberi, katere načine ponuja prijavni zaslon, objavi pozdravno sporočilo in vodi skupno lestvico za svojo skupino."
      ],
      [
        "Brezplačno",
        "Brez licence, brez naročnine, brez oglasov: strežnik PokerTH in spletni odjemalec sta oba prosto programje."
      ]
    ],
    "partsH2": "Dva dela",
    "partsP": "Za igro PokerTH potrebuješ namenski strežnik PokerTH, ki deli karte in vodi mize, ter spletni odjemalec, ki brskalnikom streže aplikacijo in jih poveže s tem strežnikom. Oba lahko tečeta na isti napravi. Vse ostaja združljivo: aplikacije PokerTH se povežejo na isti strežnik kot brskalniki — odjemalec QML za Windows, macOS, Linux in Android ter klasični odjemalec widget za namizje — zato lahko za isto mizo sedejo igralci v brskalnikih in v aplikacijah.",
    "stepsH2": "Namestitev v treh korakih",
    "steps": [
      [
        "Namesti strežnik PokerTH",
        "Prevedi pokerth_dedicated_server iz izvorne kode PokerTH — različica 2.1.10 ali novejša — po navodilih za strežnik projekta PokerTH: potrebuješ Qt 6.7 ali novejši, CMake in prevajalnik za C++23. Paket pokerth-server v distribucijah Linux je starejša različica. Strežnik posluša na vratih TCP 7234."
      ],
      [
        "Namesti spletni odjemalec",
        "Na sistemih Debian, Ubuntu ali Raspberry Pi OS namestitveni skript z enim samim ukazom namesti Node.js, spletni odjemalec in storitev, ki se zažene skupaj z napravo. Uporabniki orodja Docker prenesejo pripravljeno sliko za amd64, arm64 in armv7, CasaOS pa isto datoteko Compose uvozi kot aplikacijo."
      ],
      [
        "Igraj",
        "Na kateri koli napravi v svojem omrežju odpri naslov računalnika na vratih 8080, izberi LAN / lastni strežnik, vpiši vzdevek in ustvari mizo. Igralci z odjemalcem PokerTH QML ali widget se povežejo na isti računalnik na vratih 7234 in se pridružijo istim mizam."
      ]
    ],
    "piH2": "Na Raspberry Pi",
    "piP": "PokerTH izmenjuje majhna sporočila, vse izrisovanje pa opravijo naprave igralcev, zato Raspberry Pi povsem zadošča: Pi 4 z 2 GB je najboljša izbira, Pi 5 je več kot dovolj. Za tekoč večer je omrežje pomembnejše od plošče — Pi s kablom priključi na usmerjevalnik, za igralce pa uporabi dobro dostopno točko Wi-Fi.",
    "httpsH2": "HTTP v lokalnem omrežju, HTTPS za dodatke",
    "httpsP": "V tvojem omrežju igra deluje prek navadnega HTTP. Namestitev aplikacije na domači zaslon, igranje brez povezave in prejemanje obvestil zahtevajo HTTPS, ki ga navodila nastavijo z Nginx in brezplačnim potrdilom Let’s Encrypt.",
    "adminH2": "Skrbniška plošča v brskalniku",
    "adminP": "Konzola na /admin, zaščitena z dostopnim žetonom, pokaže, kdo je povezan, z enim klikom posodobi spletni odjemalec in ga lahko povrne na prejšnjo različico, pošilja obvestila igralcem, ponastavi lestvico, namešča komplete kart, sloge miz in glasbo, navaja igralne strežnike, ki jih odjemalec sme doseči, in deli ključe, ki odklenejo le nekatere njene razdelke.",
    "shareH2": "Povabi igralce od zunaj",
    "shareP": "Povabilne povezave in QR kode delujejo na tvojem strežniku enako kot na pokerth.net: prijatelj odpre povezavo in sede za tvojo mizo. Če je tvoj strežnik dosegljiv z interneta, ga lahko predlagaš tudi za javni seznam strežnikov spletnega odjemalca; tam se prikaže, ko ga odobrijo skrbniki spletnega odjemalca.",
    "guidesH2": "Navodila po korakih",
    "guides": [
      "Navodila za namestitev strežnika PokerTH",
      "Lastno gostovanje in namestitev z enim ukazom",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ročna namestitev in HTTPS",
      "Skrbniška plošča"
    ],
    "faqH2": "Vprašanja",
    "faq": [
      [
        "Je gostovanje strežnika PokerTH brezplačno?",
        "Da. Strežnik PokerTH in spletni odjemalec sta brezplačna in odprtokodna programska oprema; potrebuješ le napravo, na kateri tečeta."
      ],
      [
        "Kakšno strojno opremo potrebujem?",
        "Zelo malo: kateri koli osebni računalnik ali domači strežnik s sistemom Linux ali orodjem Docker ali pa Raspberry Pi 4 ali 5. Žična omrežna povezava je pomembnejša od procesorske moči."
      ],
      [
        "Morajo igralci kaj namestiti?",
        "Ne. Naslov strežnika odprejo v brskalniku na telefonu, tablici ali računalniku. Kdor ima raje aplikacijo, lahko uporablja odjemalec PokerTH QML ali klasični odjemalec widget: oba se povežeta na isti strežnik in igrata za istimi mizami."
      ],
      [
        "Ali potrebujem pokerth.net ali internetno povezavo?",
        "Ne. Strežnik v tvojem lokalnem omrežju deluje samostojno: igralci se nanj povežejo neposredno, samo z vzdevkom."
      ],
      [
        "Koliko igralcev se lahko pridruži?",
        "Do 10 igralcev za mizo, poleg tega še opazovalci, in toliko miz, kolikor jih tvoja skupina potrebuje."
      ]
    ]
  },
  sq: {
    "title": "Serveri yt i pokerit — falas dhe i vetëstrehuar | PokerTH",
    "desc": "Një server privat Texas Hold’em në shtëpi, në klub ose në shkollë: serveri dhe klienti web falas i PokerTH, me një komandë, me Docker ose në një Raspberry Pi.",
    "ldHeadline": "Si ta strehosh vetë serverin tënd të pokerit PokerTH",
    "ldDesc": "Ngri një server privat Texas Hold’em, të strehuar vetë, me serverin e dedikuar PokerTH dhe klientin web PokerTH.",
    "h1": "Strehoje vetë serverin tënd të pokerit",
    "lead": "PokerTH është falas dhe me kod të hapur nga fillimi në fund: serveri i lojës dhe ky klient web mund të punojnë në kompjuterin tënd. Një PC, një server shtëpiak ose një Raspberry Pi mjafton për një lojë familjare, një mbrëmje klubi, një ligë zyre ose një shkollë, dhe pastaj çdo telefon, tablet ose kompjuter në rrjetin tënd luan në shfletuesin e vet vetëm me një pseudonim.",
    "whyH2": "Pse të kesh serverin tënd",
    "why": [
      [
        "Privat",
        "Lojërat e tua mbeten në kompjuterin dhe në rrjetin tënd; lojtarëve nuk u duhet as llogari, as adresë email-i, vetëm një pseudonim."
      ],
      [
        "Sipas dëshirës tënde",
        "Jepi serverit një emër të vetin, zgjidh cilat modalitete ofron ekrani i hyrjes, publiko një mesazh mirëseardhjeje dhe mbaj një renditje të përbashkët për grupin tënd."
      ],
      [
        "Falas",
        "Pa licencë, pa abonim, pa reklama: serveri PokerTH dhe klienti web janë të dy softuer i lirë."
      ]
    ],
    "partsH2": "Dy pjesë",
    "partsP": "Një lojë PokerTH ka nevojë për serverin e dedikuar PokerTH, që shpërndan letrat dhe drejton tavolinat, dhe për klientin web, që u shërben aplikacionin shfletuesve dhe i lidh ata me atë server. Të dy mund të punojnë në të njëjtin kompjuter. Gjithçka mbetet e përputhshme: aplikacionet PokerTH lidhen me të njëjtin server si shfletuesit — klienti QML në Windows, macOS, Linux dhe Android, dhe klienti klasik widget për desktop — kështu që lojtarët mund të përziejnë shfletues dhe aplikacione në një tavolinë.",
    "stepsH2": "Ngrije në tre hapa",
    "steps": [
      [
        "Instalo serverin PokerTH",
        "Ndërto pokerth_dedicated_server nga kodi burimor i PokerTH — versioni 2.1.10 ose më i ri — duke ndjekur udhëzuesin e serverit të projektit PokerTH: kërkon Qt 6.7 ose më të ri, CMake dhe një përpilues C++23. Paketa pokerth-server e shpërndarjeve Linux është një version më i vjetër. Serveri dëgjon në portën TCP 7234."
      ],
      [
        "Instalo klientin web",
        "Në Debian, Ubuntu ose Raspberry Pi OS, skripti i instalimit konfiguron me një komandë Node.js, klientin web dhe një shërbim që niset bashkë me kompjuterin. Përdoruesit e Docker shkarkojnë një imazh të gatshëm për amd64, arm64 dhe armv7, dhe CasaOS importon të njëjtin skedar Compose si aplikacion."
      ],
      [
        "Luaj",
        "Në çdo pajisje në rrjetin tënd, hap adresën e kompjuterit në portën 8080, zgjidh “LAN / server i dedikuar”, shkruaj një pseudonim dhe krijo një tavolinë. Lojtarët me klientin QML ose widget të PokerTH lidhen me të njëjtin kompjuter në portën 7234 dhe hyjnë në të njëjtat tavolina."
      ]
    ],
    "piH2": "Në një Raspberry Pi",
    "piP": "PokerTH shkëmben mesazhe të vogla dhe gjithë vizatimin e bëjnë pajisjet e lojtarëve, ndaj një Raspberry Pi mjafton me tepri: një Pi 4 me 2 GB është zgjedhja ideale, një Pi 5 është më se i mjaftueshëm. Për një mbrëmje pa ngecje, rrjeti ka më shumë rëndësi se pllaka — lidhe Pi-n me ruterin me kabllo dhe përdor një pikë të mirë aksesi Wi-Fi për lojtarët.",
    "httpsH2": "HTTP në LAN, HTTPS për shtesat",
    "httpsP": "Në rrjetin tënd loja funksionon me HTTP të thjeshtë. Instalimi i aplikacionit në ekranin fillestar, loja pa lidhje dhe marrja e njoftimeve kërkojnë HTTPS, të cilin udhëzuesi e konfiguron me Nginx dhe një certifikatë falas Let’s Encrypt.",
    "adminH2": "Një panel administrimi në shfletues",
    "adminP": "Një konsolë e mbrojtur me token në /admin tregon kush është i lidhur, përditëson klientin web me një klikim dhe mund ta kthejë në versionin e mëparshëm, u dërgon njoftime lojtarëve, rivendos renditjen, instalon pako letrash, stile tavoline dhe muzikë, liston serverat e lojës që klienti mund të arrijë dhe shpërndan çelësa që hapin vetëm disa nga seksionet e saj.",
    "shareH2": "Fto lojtarë nga jashtë",
    "shareP": "Lidhjet e ftesës dhe kodet QR funksionojnë në serverin tënd njësoj si në pokerth.net: një mik hap lidhjen dhe ulet në tavolinën tënde. Nëse serveri yt arrihet nga interneti, mund ta propozosh edhe për listën publike të serverave të klientit web; ai shfaqet aty sapo ta miratojnë administratorët e klientit web.",
    "guidesH2": "Udhëzues hap pas hapi",
    "guides": [
      "Udhëzuesi i konfigurimit të serverit PokerTH",
      "Vetëstrehimi dhe instalimi me një komandë",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Instalimi manual dhe HTTPS",
      "Paneli i administrimit"
    ],
    "faqH2": "Pyetje",
    "faq": [
      [
        "A është falas strehimi i një serveri PokerTH?",
        "Po. Serveri PokerTH dhe klienti web janë softuer falas dhe me kod të hapur; të duhet vetëm një kompjuter për t’i ekzekutuar."
      ],
      [
        "Çfarë hardueri më duhet?",
        "Shumë pak: çdo PC ose server shtëpiak me Linux ose Docker, ose një Raspberry Pi 4 ose 5. Një lidhje rrjeti me kabllo ka më shumë rëndësi se fuqia përpunuese."
      ],
      [
        "A duhet që lojtarët të instalojnë diçka?",
        "Jo. Ata hapin adresën e serverit në një shfletues në telefon, tablet ose kompjuter. Kush preferon një aplikacion mund të përdorë klientin QML të PokerTH ose klientin klasik widget: ata lidhen me të njëjtin server dhe luajnë në të njëjtat tavolina."
      ],
      [
        "A ka nevojë për pokerth.net ose për lidhje interneti?",
        "Jo. Një server në rrjetin tënd lokal punon më vete: lojtarët lidhen drejtpërdrejt me të, vetëm me një pseudonim."
      ],
      [
        "Sa lojtarë mund të bashkohen?",
        "Deri në 10 lojtarë për tavolinë, plus vëzhgues, dhe aq tavolina sa i duhen grupit tënd."
      ]
    ]
  },
  sr: {
    "title": "Хостујте свој покер сервер — бесплатно, самостално | PokerTH",
    "desc": "Приватни Texas Hold’em сервер код куће, у клубу или школи: бесплатан PokerTH сервер и веб клијент, подешени једном командом, преко Docker-а или на Raspberry Pi уређају.",
    "ldHeadline": "Како да хостујете свој PokerTH покер сервер",
    "ldDesc": "Подесите приватни, самостално хостован Texas Hold’em сервер уз PokerTH наменски сервер и PokerTH веб клијент.",
    "h1": "Хостујте свој покер сервер",
    "lead": "PokerTH је бесплатан и отвореног кода од почетка до краја: сервер игре и овај веб клијент могу да раде на вашем сопственом уређају. За породичну игру, клупско вече, канцеларијску лигу или школу довољан је PC, кућни сервер или Raspberry Pi, а онда сваки телефон, таблет или рачунар на вашој мрежи игра у прегледачу само уз надимак.",
    "whyH2": "Зашто сопствени сервер",
    "why": [
      [
        "Приватно",
        "Ваше игре остају на вашем уређају и вашој мрежи; играчима не треба ни налог ни имејл адреса, само надимак."
      ],
      [
        "По вашој мери",
        "Дајте серверу сопствено име, изаберите које режиме нуди екран за пријаву, поставите поруку добродошлице и водите заједничку ранг-листу за своју групу."
      ],
      [
        "Бесплатно",
        "Без лиценце, без претплате, без реклама: и PokerTH сервер и веб клијент су слободан софтвер."
      ]
    ],
    "partsH2": "Два дела",
    "partsP": "За PokerTH игру потребни су PokerTH наменски сервер, који дели карте и води столове, и веб клијент, који прегледачима испоручује апликацију и повезује их са тим сервером. Оба могу да раде на истом уређају. Све остаје компатибилно: PokerTH апликације се повезују на исти сервер као и прегледачи — QML клијент на Windows, macOS, Linux и Android системима и класични widget клијент на десктопу — тако да за истим столом могу да седе и играчи у прегледачу и они у апликацији.",
    "stepsH2": "Подешавање у три корака",
    "steps": [
      [
        "Инсталирајте PokerTH сервер",
        "Компајлирајте pokerth_dedicated_server из изворног кода PokerTH-а — верзија 2.1.10 или новија — према упутству за сервер пројекта PokerTH: потребни су Qt 6.7 или новији, CMake и C++23 компајлер. Пакет pokerth-server у Linux дистрибуцијама је старија верзија. Сервер ослушкује на TCP порту 7234."
      ],
      [
        "Инсталирајте веб клијент",
        "На Debian, Ubuntu или Raspberry Pi OS систему инсталациона скрипта једном командом подешава Node.js, веб клијент и сервис који се покреће са уређајем. Корисници Docker-а преузимају готову слику за amd64, arm64 и armv7, а CasaOS увози исту Compose датотеку као апликацију."
      ],
      [
        "Играјте",
        "На било ком уређају на вашој мрежи отворите адресу тог рачунара на порту 8080, изаберите „LAN / Наменски сервер“, унесите надимак и направите сто. Играчи са PokerTH QML или widget клијентом повезују се на исти рачунар на порту 7234 и придружују се истим столовима."
      ]
    ],
    "piH2": "На Raspberry Pi уређају",
    "piP": "PokerTH размењује мале поруке, а сво исцртавање обављају уређаји играча, па је Raspberry Pi сасвим довољан: Pi 4 са 2 GB је идеалан избор, а Pi 5 је и више него довољан. За глатко вече мрежа је важнија од плоче — повежите Pi са рутером каблом и користите добру Wi-Fi приступну тачку за играче.",
    "httpsH2": "HTTP на LAN мрежи, HTTPS за додатке",
    "httpsP": "На вашој мрежи игра ради преко обичног HTTP-а. За инсталирање апликације на почетни екран, игру без мреже и примање обавештења потребан је HTTPS, који упутство подешава уз Nginx и бесплатан Let’s Encrypt сертификат.",
    "adminH2": "Админ панел у прегледачу",
    "adminP": "Конзола заштићена токеном на /admin приказује ко је повезан, једним кликом ажурира веб клијент и може да га врати на претходну верзију, шаље обавештења играчима, ресетује ранг-листу, инсталира шпилове карата, стилове стола и музику, наводи сервере игре до којих клијент сме да стигне и додељује кључеве који откључавају само неке њене одељке.",
    "shareH2": "Позовите играче споља",
    "shareP": "Линкови за позив и QR кодови на вашем серверу раде исто као на pokerth.net: пријатељ отвори линк и седне за ваш сто. Ако је ваш сервер доступан са интернета, можете да га предложите и за јавну листу сервера веб клијента; на њој се појављује чим га администратори веб клијента одобре.",
    "guidesH2": "Упутства корак по корак",
    "guides": [
      "Упутство за подешавање PokerTH сервера",
      "Самостални хостинг и инсталација једном командом",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ручна инсталација и HTTPS",
      "Админ панел"
    ],
    "faqH2": "Питања",
    "faq": [
      [
        "Да ли је хостовање PokerTH сервера бесплатно?",
        "Да. PokerTH сервер и веб клијент су бесплатан софтвер отвореног кода; потребан вам је само уређај на коме ће радити."
      ],
      [
        "Који хардвер ми треба?",
        "Врло мало: било који PC или кућни сервер са Linux-ом или Docker-ом, или Raspberry Pi 4 или 5. Жична мрежна веза је важнија од процесорске снаге."
      ],
      [
        "Да ли играчи морају нешто да инсталирају?",
        "Не. Отворе адресу сервера у прегледачу на телефону, таблету или рачунару. Они који више воле апликацију могу да користе PokerTH QML клијент или класични widget клијент: повезују се на исти сервер и играју за истим столовима."
      ],
      [
        "Да ли су потребни pokerth.net или интернет веза?",
        "Не. Сервер на вашој локалној мрежи ради самостално: играчи се повезују директно на њега, само уз надимак."
      ],
      [
        "Колико играча може да се придружи?",
        "До 10 играча по столу, плус гледаоци, и онолико столова колико вашој групи треба."
      ]
    ]
  },
  sv: {
    "title": "Kör din egen pokerserver — gratis, självhostad | PokerTH",
    "desc": "Privat Texas Hold’em-server hemma, i klubben eller skolan: PokerTH-servern och webbklienten, gratis, installerade med ett kommando, med Docker eller på Raspberry Pi.",
    "ldHeadline": "Så kör du din egen PokerTH-pokerserver",
    "ldDesc": "Sätt upp en privat, självhostad Texas Hold’em-server med den dedikerade PokerTH-servern och PokerTH-webbklienten.",
    "h1": "Kör din egen pokerserver",
    "lead": "PokerTH är gratis och öppen källkod från början till slut: spelservern och den här webbklienten kan köras på din egen dator. En PC, en hemserver eller en Raspberry Pi räcker för familjespel, en klubbkväll, en kontorsliga eller en skola, och varje mobil, surfplatta eller dator i ditt nätverk spelar sedan i webbläsaren med bara ett smeknamn.",
    "whyH2": "Varför köra en egen",
    "why": [
      [
        "Privat",
        "Dina spel stannar på din dator och i ditt nätverk; spelarna behöver inget konto och ingen e-postadress, bara ett smeknamn."
      ],
      [
        "Som du vill ha det",
        "Ge servern ett eget namn, välj vilka lägen inloggningsskärmen erbjuder, lägg upp ett välkomstmeddelande och för en gemensam topplista för din grupp."
      ],
      [
        "Gratis",
        "Ingen licens, inget abonnemang, ingen reklam: både PokerTH-servern och webbklienten är fri programvara."
      ]
    ],
    "partsH2": "Två delar",
    "partsP": "Ett PokerTH-spel behöver den dedikerade PokerTH-servern, som delar ut korten och sköter borden, och webbklienten, som levererar appen till webbläsarna och ansluter dem till servern. Båda kan köras på samma dator. Allt förblir kompatibelt: PokerTH-apparna – QML-klienten för Windows, macOS, Linux och Android och den klassiska widget-klienten för skrivbordet – ansluter till samma server som webbläsarna, så spelarna kan blanda webbläsare och appar vid ett och samma bord.",
    "stepsH2": "Kom igång i tre steg",
    "steps": [
      [
        "Installera PokerTH-servern",
        "Bygg pokerth_dedicated_server från PokerTH:s källkod — version 2.1.10 eller senare — enligt serverguiden från PokerTH-projektet: den kräver Qt 6.7 eller nyare, CMake och en C++23-kompilator. Paketet pokerth-server i Linux-distributionerna är en äldre version. Servern lyssnar på TCP-port 7234."
      ],
      [
        "Installera webbklienten",
        "På Debian, Ubuntu eller Raspberry Pi OS installerar installationsskriptet Node.js, webbklienten och en tjänst som startar med datorn, med ett enda kommando. Docker-användare hämtar en färdig avbild för amd64, arm64 och armv7, och CasaOS importerar samma Compose-fil som en app."
      ],
      [
        "Spela",
        "Öppna datorns adress på port 8080 från valfri enhet i ditt nätverk, välj LAN / Dedikerad server, skriv ett smeknamn och skapa ett bord. Spelare med PokerTH:s QML- eller widget-klient ansluter till samma dator på port 7234 och sätter sig vid samma bord."
      ]
    ],
    "piH2": "På en Raspberry Pi",
    "piP": "PokerTH skickar små meddelanden och spelarnas enheter sköter all grafik, så en Raspberry Pi räcker gott: en Pi 4 med 2 GB är det bästa valet, en Pi 5 är mer än nog. För en smidig kväll betyder nätverket mer än kortet — anslut Pi:n till routern med kabel och använd en bra Wi-Fi-åtkomstpunkt för spelarna.",
    "httpsH2": "HTTP i LAN:et, HTTPS för extrafunktionerna",
    "httpsP": "I ditt eget nätverk fungerar spelet över vanlig HTTP. För att installera appen på hemskärmen, spela offline och få aviseringar krävs HTTPS, som guiden sätter upp med Nginx och ett gratis certifikat från Let’s Encrypt.",
    "adminH2": "En adminpanel i webbläsaren",
    "adminP": "En tokenskyddad konsol på /admin visar vem som är ansluten, uppdaterar webbklienten med ett klick och kan rulla tillbaka den, skickar meddelanden till spelarna, nollställer topplistan, installerar kortlekar, bordsstilar och musik, listar de spelservrar klienten får nå och delar ut nycklar som bara låser upp vissa av dess avsnitt.",
    "shareH2": "Bjud in spelare utifrån",
    "shareP": "Inbjudningslänkar och QR-koder fungerar på din server precis som på pokerth.net: en vän öppnar länken och får en plats vid ditt bord. Om din server går att nå från internet kan du också föreslå den för webbklientens publika serverlista; den visas där när webbklientens administratörer har godkänt den.",
    "guidesH2": "Steg-för-steg-guider",
    "guides": [
      "Guide för att sätta upp PokerTH-servern",
      "Självhosting och installation med ett kommando",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Manuell installation och HTTPS",
      "Adminpanelen"
    ],
    "faqH2": "Frågor",
    "faq": [
      [
        "Är det gratis att köra en PokerTH-server?",
        "Ja. PokerTH-servern och webbklienten är fri programvara med öppen källkod; du behöver bara en dator att köra dem på."
      ],
      [
        "Vilken hårdvara behöver jag?",
        "Väldigt lite: valfri PC eller hemserver som kör Linux eller Docker, eller en Raspberry Pi 4 eller 5. En trådbunden nätverksanslutning betyder mer än processorkraft."
      ],
      [
        "Behöver spelarna installera något?",
        "Nej. De öppnar serverns adress i en webbläsare på mobilen, surfplattan eller datorn. Den som föredrar en app kan använda PokerTH:s QML-klient eller den klassiska widget-klienten: de ansluter till samma server och spelar vid samma bord."
      ],
      [
        "Behövs pokerth.net eller en internetanslutning?",
        "Nej. En server i ditt lokala nätverk klarar sig på egen hand: spelarna ansluter direkt till den, med bara ett smeknamn."
      ],
      [
        "Hur många spelare kan vara med?",
        "Upp till 10 spelare per bord, plus åskådare, och så många bord som din grupp behöver."
      ]
    ]
  },
  sw: {
    "title": "Endesha seva yako ya poka — bure, kwa mashine yako | PokerTH",
    "desc": "Seva binafsi ya Texas Hold’em nyumbani, klabuni au shuleni: seva ya PokerTH na programu ya wavuti bure, husakinishwa kwa amri moja, kwa Docker au Raspberry Pi.",
    "ldHeadline": "Jinsi ya kuendesha seva yako mwenyewe ya poka ya PokerTH",
    "ldDesc": "Andaa seva binafsi ya Texas Hold’em unayoiendesha mwenyewe, kwa seva maalum ya PokerTH na programu ya wavuti ya PokerTH.",
    "h1": "Endesha seva yako mwenyewe ya poka",
    "lead": "PokerTH ni bure na ya chanzo huria kuanzia mwanzo hadi mwisho: seva ya mchezo na programu hii ya wavuti zinaweza kuendeshwa kwenye mashine yako mwenyewe. PC, seva ya nyumbani au Raspberry Pi inatosha kwa mchezo wa familia, usiku wa klabu, ligi ya ofisini au shule, kisha kila simu, kompyuta kibao au kompyuta kwenye mtandao wako hucheza kwenye kivinjari chake kwa jina la utani tu.",
    "whyH2": "Kwa nini uwe na yako mwenyewe",
    "why": [
      [
        "Faragha",
        "Michezo yako hubaki kwenye mashine yako na mtandao wako; wachezaji hawahitaji akaunti wala anwani ya barua pepe, jina la utani tu."
      ],
      [
        "Kwa mtindo wako",
        "Ipe seva jina lake, chagua hali za mchezo ambazo skrini ya kuingia inatoa, weka ujumbe wa kukaribisha, na uwe na ubao wa viongozi wa pamoja kwa kikundi chako."
      ],
      [
        "Bure",
        "Hakuna leseni, hakuna usajili wa kulipia, hakuna matangazo: seva ya PokerTH na programu ya wavuti zote ni programu huria."
      ]
    ],
    "partsH2": "Sehemu mbili",
    "partsP": "Mchezo wa PokerTH unahitaji seva maalum ya PokerTH, inayogawa karata na kuendesha meza, na programu ya wavuti, inayopeleka programu kwa vivinjari na kuviunganisha na seva hiyo. Zinaweza kuendeshwa kwenye mashine moja. Kila kitu kinabaki kuoana: programu za PokerTH huunganishwa na seva ile ile kama vivinjari — programu ya QML kwenye Windows, macOS, Linux na Android, na programu ya kawaida ya widget kwenye kompyuta ya mezani — hivyo wachezaji wanaweza kuchanganya vivinjari na programu kwenye meza moja.",
    "stepsH2": "Iandae kwa hatua tatu",
    "steps": [
      [
        "Sakinisha seva ya PokerTH",
        "Jenga pokerth_dedicated_server kutoka kwa msimbo chanzo wa PokerTH — toleo 2.1.10 au jipya zaidi — kwa kufuata mwongozo wa seva wa mradi wa PokerTH: inahitaji Qt 6.7 au jipya zaidi, CMake na kikusanyaji cha C++23. Kifurushi cha pokerth-server cha usambazaji wa Linux ni toleo la zamani. Seva husikiliza kwenye mlango wa TCP 7234."
      ],
      [
        "Sakinisha programu ya wavuti",
        "Kwenye Debian, Ubuntu au Raspberry Pi OS, hati ya usakinishaji huandaa Node.js, programu ya wavuti na huduma inayoanza pamoja na mashine, kwa amri moja. Watumiaji wa Docker hupakua picha iliyo tayari kwa amd64, arm64 na armv7, na CasaOS huingiza faili ile ile ya Compose kama programu."
      ],
      [
        "Cheza",
        "Kwenye kifaa chochote katika mtandao wako, fungua anwani ya mashine kwenye mlango 8080, chagua “LAN / Seva maalum”, andika jina la utani na utengeneze meza. Wachezaji wenye programu ya PokerTH QML au widget huunganishwa na mashine hiyo hiyo kwenye mlango 7234 na kujiunga na meza zile zile."
      ]
    ],
    "piH2": "Kwenye Raspberry Pi",
    "piP": "PokerTH hubadilishana jumbe ndogo na vifaa vya wachezaji ndivyo huchora kila kitu, kwa hiyo Raspberry Pi inatosha kabisa: Pi 4 yenye 2 GB ndiyo chaguo bora, na Pi 5 ni zaidi ya kutosha. Kwa jioni isiyo na kwikwi, mtandao ni muhimu kuliko bodi — unganisha Pi na ruta kwa kebo, na tumia kituo kizuri cha Wi-Fi kwa wachezaji.",
    "httpsH2": "HTTP kwenye LAN, HTTPS kwa ziada",
    "httpsP": "Kwenye mtandao wako mwenyewe mchezo hufanya kazi kupitia HTTP ya kawaida. Kusakinisha programu kwenye skrini ya kwanza, kucheza nje ya mtandao na kupokea arifa kunahitaji HTTPS, ambayo mwongozo huiandaa kwa Nginx na cheti cha bure cha Let’s Encrypt.",
    "adminH2": "Paneli ya usimamizi kwenye kivinjari",
    "adminP": "Kiweko kinacholindwa kwa tokeni kwenye /admin huonyesha nani ameunganishwa, husasisha programu ya wavuti kwa mbofyo mmoja na kinaweza kuirudisha kwenye toleo la awali, hutuma taarifa kwa wachezaji, huweka upya ubao wa viongozi, husakinisha seti za karata, mitindo ya meza na muziki, huorodhesha seva za mchezo ambazo programu inaweza kufikia, na hutoa funguo zinazofungua baadhi tu ya sehemu zake.",
    "shareH2": "Alika wachezaji kutoka nje",
    "shareP": "Viungo vya mwaliko na misimbo ya QR hufanya kazi kwenye seva yako kama vile kwenye pokerth.net: rafiki hufungua kiungo na kuketishwa kwenye meza yako. Ikiwa seva yako inafikiwa kutoka intaneti, unaweza pia kuipendekeza kwa orodha ya seva za umma ya programu ya wavuti; huonekana humo mara wasimamizi wa programu ya wavuti watakapoiidhinisha.",
    "guidesH2": "Miongozo ya hatua kwa hatua",
    "guides": [
      "Mwongozo wa kusanidi seva ya PokerTH",
      "Kujiendeshea seva na usakinishaji kwa amri moja",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Usakinishaji wa mkono na HTTPS",
      "Paneli ya usimamizi"
    ],
    "faqH2": "Maswali",
    "faq": [
      [
        "Je, ni bure kuendesha seva ya PokerTH?",
        "Ndiyo. Seva ya PokerTH na programu ya wavuti ni programu bure za chanzo huria; unahitaji tu mashine ya kuziendesha."
      ],
      [
        "Ninahitaji vifaa gani?",
        "Vichache sana: PC yoyote au seva ya nyumbani inayoendesha Linux au Docker, au Raspberry Pi 4 au 5. Muunganisho wa mtandao kwa waya ni muhimu kuliko nguvu ya uchakataji."
      ],
      [
        "Je, wachezaji wanahitaji kusakinisha chochote?",
        "Hapana. Wanafungua anwani ya seva kwenye kivinjari cha simu, kompyuta kibao au kompyuta yao. Wanaopendelea programu wanaweza kutumia programu ya PokerTH QML au programu ya kawaida ya widget: huunganishwa na seva ile ile na kucheza kwenye meza zile zile."
      ],
      [
        "Je, inahitaji pokerth.net au muunganisho wa intaneti?",
        "Hapana. Seva kwenye mtandao wako wa ndani hujiendesha yenyewe: wachezaji huunganishwa nayo moja kwa moja, kwa jina la utani tu."
      ],
      [
        "Wachezaji wangapi wanaweza kujiunga?",
        "Hadi wachezaji 10 kwa kila meza, pamoja na watazamaji, na meza nyingi kadiri kikundi chako kinavyohitaji."
      ]
    ]
  },
  ta: {
    "title": "சொந்த போக்கர் சேவையகம் — இலவசம், சுய-ஹோஸ்ட் | PokerTH",
    "desc": "வீட்டில், கழகத்தில் அல்லது பள்ளியில் தனிப்பட்ட Texas Hold’em சேவையகம்: இலவச PokerTH சேவையகமும் வலை செயலியும், ஒரே கட்டளையில், Docker அல்லது Raspberry Pi-இல்.",
    "ldHeadline": "உங்கள் சொந்த PokerTH போக்கர் சேவையகத்தை அமைப்பது எப்படி",
    "ldDesc": "PokerTH பிரத்யேக சேவையகம் மற்றும் PokerTH வலை செயலி மூலம் தனிப்பட்ட, சுயமாக இயக்கப்படும் Texas Hold’em சேவையகத்தை அமையுங்கள்.",
    "h1": "உங்கள் சொந்த போக்கர் சேவையகத்தை அமையுங்கள்",
    "lead": "PokerTH முழுக்க முழுக்க இலவசமும் திறந்த மூலமும் ஆனது: ஆட்ட சேவையகமும் இந்த வலை செயலியும் உங்கள் சொந்தக் கணினியில் இயங்க முடியும். குடும்ப ஆட்டம், கழக இரவு, அலுவலகப் போட்டித் தொடர் அல்லது ஒரு பள்ளிக்கு ஒரு கணினி, வீட்டுச் சேவையகம் அல்லது Raspberry Pi போதும்; அதன் பிறகு உங்கள் வலையமைப்பில் உள்ள ஒவ்வொரு தொலைபேசியும் டேப்லெட்டும் கணினியும் ஒரு புனைப்பெயருடன் மட்டுமே தன் உலாவியில் விளையாடும்.",
    "whyH2": "ஏன் சொந்தமாக இயக்க வேண்டும்",
    "why": [
      [
        "தனிப்பட்டது",
        "உங்கள் ஆட்டங்கள் உங்கள் கணினியிலும் வலையமைப்பிலுமே இருக்கும்; வீரர்களுக்குக் கணக்கோ மின்னஞ்சல் முகவரியோ தேவையில்லை, ஒரு புனைப்பெயர் போதும்."
      ],
      [
        "உங்கள் விருப்பப்படி",
        "சேவையகத்திற்குத் தனிப் பெயர் வையுங்கள், உள்நுழைவுத் திரை எந்த முறைகளை வழங்க வேண்டும் எனத் தேர்ந்தெடுங்கள், வரவேற்புச் செய்தியை இடுங்கள், உங்கள் குழுவுக்குப் பொதுவான தரவரிசையைப் பராமரியுங்கள்."
      ],
      [
        "இலவசம்",
        "உரிமக் கட்டணம் இல்லை, சந்தா இல்லை, விளம்பரம் இல்லை: PokerTH சேவையகமும் வலை செயலியும் இரண்டுமே கட்டற்ற மென்பொருள்."
      ]
    ],
    "partsH2": "இரண்டு பகுதிகள்",
    "partsP": "ஒரு PokerTH ஆட்டத்திற்கு, சீட்டுகளை விநியோகித்து மேசைகளை நடத்தும் PokerTH பிரத்யேக சேவையகமும், உலாவிகளுக்குச் செயலியை வழங்கி அவற்றை அந்தச் சேவையகத்துடன் இணைக்கும் வலை செயலியும் தேவை. இரண்டும் ஒரே கணினியில் இயங்கலாம். அனைத்தும் இணக்கமாகவே இருக்கும்: PokerTH செயலிகள் — Windows, macOS, Linux, Android ஆகியவற்றுக்கான QML செயலியும், டெஸ்க்டாப்பிற்கான பாரம்பரிய widget செயலியும் — உலாவிகள் இணையும் அதே சேவையகத்துடன் இணைகின்றன, எனவே ஒரே மேசையில் உலாவியில் விளையாடுபவர்களும் செயலியில் விளையாடுபவர்களும் சேர்ந்து விளையாடலாம்.",
    "stepsH2": "மூன்று படிகளில் அமையுங்கள்",
    "steps": [
      [
        "PokerTH சேவையகத்தை நிறுவுங்கள்",
        "PokerTH திட்டத்தின் சேவையக வழிகாட்டியைப் பின்பற்றி, PokerTH மூலக் குறியீட்டிலிருந்து pokerth_dedicated_server-ஐ உருவாக்குங்கள் — பதிப்பு 2.1.10 அல்லது அதற்குப் பிந்தையது: இதற்கு Qt 6.7 அல்லது புதியது, CMake மற்றும் ஒரு C++23 தொகுப்பி தேவை. Linux விநியோகங்களில் உள்ள pokerth-server தொகுப்பு பழைய பதிப்பு. சேவையகம் TCP போர்ட் 7234-இல் கேட்கிறது."
      ],
      [
        "வலை செயலியை நிறுவுங்கள்",
        "Debian, Ubuntu அல்லது Raspberry Pi OS-இல், நிறுவல் ஸ்கிரிப்ட் ஒரே கட்டளையில் Node.js-ஐயும், வலை செயலியையும், கணினியுடன் சேர்ந்து தொடங்கும் ஒரு சேவையையும் அமைக்கிறது. Docker பயனர்கள் amd64, arm64, armv7 ஆகியவற்றுக்கான தயார் இமேஜைப் பெறுகிறார்கள்; CasaOS அதே Compose கோப்பை ஒரு செயலியாக இறக்குமதி செய்கிறது."
      ],
      [
        "விளையாடுங்கள்",
        "உங்கள் வலையமைப்பில் உள்ள எந்தச் சாதனத்திலும், கணினியின் முகவரியை போர்ட் 8080-இல் திறந்து, ‘LAN / பிரத்யேக சேவையகம்’ என்பதைத் தேர்ந்தெடுத்து, ஒரு புனைப்பெயரைத் தட்டச்சு செய்து, ஒரு மேசையை உருவாக்குங்கள். PokerTH QML அல்லது widget செயலியைப் பயன்படுத்தும் வீரர்கள் அதே கணினியுடன் போர்ட் 7234-இல் இணைந்து அதே மேசைகளில் சேர்கிறார்கள்."
      ]
    ],
    "piH2": "Raspberry Pi-இல்",
    "piP": "PokerTH சிறிய செய்திகளையே பரிமாறுகிறது, வரைதல் அனைத்தையும் வீரர்களின் சாதனங்களே செய்கின்றன; எனவே Raspberry Pi தாராளமாகப் போதும்: 2 GB கொண்ட Pi 4 சிறந்த தேர்வு, Pi 5 தேவைக்கு மேலேயே. தடையற்ற ஒரு மாலைக்கு, போர்டை விட வலையமைப்பே முக்கியம் — Pi-ஐ ரவுட்டருடன் கேபிளால் இணையுங்கள், வீரர்களுக்கு நல்ல Wi-Fi அணுகல் புள்ளியைப் பயன்படுத்துங்கள்.",
    "httpsH2": "LAN-இல் HTTP, கூடுதல் வசதிகளுக்கு HTTPS",
    "httpsP": "உங்கள் சொந்த வலையமைப்பில் ஆட்டம் சாதாரண HTTP மூலமே இயங்கும். செயலியை முகப்புத் திரையில் நிறுவுதல், இணைப்பின்றி விளையாடுதல், அறிவிப்புகளைப் பெறுதல் ஆகியவற்றுக்கு HTTPS தேவை; வழிகாட்டி அதை Nginx மற்றும் இலவச Let’s Encrypt சான்றிதழுடன் அமைக்கிறது.",
    "adminH2": "உலாவியில் ஒரு நிர்வாகப் பலகம்",
    "adminP": "/admin-இல் உள்ள டோக்கனால் பாதுகாக்கப்பட்ட கன்சோல் யார் இணைந்துள்ளனர் என்பதைக் காட்டுகிறது, வலை செயலியை ஒரே சொடுக்கில் புதுப்பிக்கிறது, முந்தைய பதிப்புக்குத் திருப்பவும் முடியும், வீரர்களுக்கு அறிவிப்புகளை அனுப்புகிறது, தரவரிசையை மீட்டமைக்கிறது, சீட்டுக் கட்டுகள், மேசை பாணிகள், இசை ஆகியவற்றை நிறுவுகிறது, செயலி அணுகக்கூடிய ஆட்ட சேவையகங்களைப் பட்டியலிடுகிறது, அதன் சில பகுதிகளை மட்டும் திறக்கும் சாவிகளை வழங்குகிறது.",
    "shareH2": "வெளியிலிருந்து வீரர்களை அழையுங்கள்",
    "shareP": "அழைப்பு இணைப்புகளும் QR குறியீடுகளும் உங்கள் சேவையகத்திலும் pokerth.net-இல் போலவே செயல்படும்: ஒரு நண்பர் இணைப்பைத் திறந்தால் உங்கள் மேசையில் அமர்த்தப்படுவார். உங்கள் சேவையகத்தை இணையத்திலிருந்து அணுக முடிந்தால், வலை செயலியின் பொதுச் சேவையகப் பட்டியலுக்கும் அதைப் பரிந்துரைக்கலாம்; வலை செயலியின் நிர்வாகிகள் ஒப்புதல் அளித்ததும் அது அங்கே தோன்றும்.",
    "guidesH2": "படிப்படியான வழிகாட்டிகள்",
    "guides": [
      "PokerTH சேவையக அமைப்பு வழிகாட்டி",
      "சுய ஹோஸ்டிங்கும் ஒரே கட்டளை நிறுவலும்",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "கைமுறை நிறுவலும் HTTPS-உம்",
      "நிர்வாகப் பலகம்"
    ],
    "faqH2": "கேள்விகள்",
    "faq": [
      [
        "PokerTH சேவையகத்தை இயக்குவது இலவசமா?",
        "ஆம். PokerTH சேவையகமும் வலை செயலியும் இலவச, திறந்த மூல மென்பொருள்; அவற்றை இயக்க ஒரு கணினி மட்டுமே தேவை."
      ],
      [
        "எனக்கு என்ன வன்பொருள் தேவை?",
        "மிகக் குறைவு: Linux அல்லது Docker இயங்கும் எந்தக் கணினியும் வீட்டுச் சேவையகமும், அல்லது ஒரு Raspberry Pi 4 அல்லது 5. செயலாக்கத் திறனை விட கம்பி வழி வலையமைப்பு இணைப்பே முக்கியம்."
      ],
      [
        "வீரர்கள் எதையாவது நிறுவ வேண்டுமா?",
        "இல்லை. அவர்கள் தங்கள் தொலைபேசி, டேப்லெட் அல்லது கணினியின் உலாவியில் சேவையகத்தின் முகவரியைத் திறக்கிறார்கள். செயலியை விரும்புபவர்கள் PokerTH QML செயலியையோ பாரம்பரிய widget செயலியையோ பயன்படுத்தலாம்: அவர்கள் அதே சேவையகத்துடன் இணைந்து அதே மேசைகளில் விளையாடுகிறார்கள்."
      ],
      [
        "இதற்கு pokerth.net அல்லது இணைய இணைப்பு தேவையா?",
        "இல்லை. உங்கள் உள்ளூர் வலையமைப்பில் உள்ள சேவையகம் தனித்தே இயங்கும்: வீரர்கள் ஒரு புனைப்பெயருடன் மட்டுமே அதனுடன் நேரடியாக இணைகிறார்கள்."
      ],
      [
        "எத்தனை வீரர்கள் சேரலாம்?",
        "ஒரு மேசைக்கு 10 வீரர்கள் வரை, அத்துடன் பார்வையாளர்கள்; உங்கள் குழுவுக்குத் தேவையான அளவு மேசைகளை உருவாக்கலாம்."
      ]
    ]
  },
  te: {
    "title": "మీ సొంత పోకర్ సర్వర్ — ఉచితం, సెల్ఫ్-హోస్టెడ్ | PokerTH",
    "desc": "ఇంట్లో, క్లబ్‌లో లేదా పాఠశాలలో ప్రైవేట్ Texas Hold’em సర్వర్: ఉచిత PokerTH సర్వర్, వెబ్ క్లయింట్, ఒకే కమాండ్‌తో సెటప్, Docker తో లేదా Raspberry Pi పై.",
    "ldHeadline": "మీ సొంత PokerTH పోకర్ సర్వర్‌ను ఎలా హోస్ట్ చేయాలి",
    "ldDesc": "PokerTH డెడికేటెడ్ సర్వర్, PokerTH వెబ్ క్లయింట్‌తో ప్రైవేట్, సెల్ఫ్-హోస్టెడ్ Texas Hold’em సర్వర్‌ను సెటప్ చేయండి.",
    "h1": "మీ సొంత పోకర్ సర్వర్ హోస్ట్ చేయండి",
    "lead": "PokerTH మొదటి నుంచి చివరి వరకు ఉచితం, ఓపెన్ సోర్స్: గేమ్ సర్వర్, ఈ వెబ్ క్లయింట్ మీ సొంత మెషీన్‌పైనే నడవగలవు. కుటుంబ ఆటకు, క్లబ్ సాయంత్రానికి, ఆఫీస్ లీగ్‌కు లేదా పాఠశాలకు ఒక PC, హోమ్ సర్వర్ లేదా Raspberry Pi సరిపోతుంది, ఆపై మీ నెట్‌వర్క్‌లోని ప్రతి ఫోన్, టాబ్లెట్ లేదా కంప్యూటర్ కేవలం మారుపేరుతో బ్రౌజర్‌లో ఆడుతుంది.",
    "whyH2": "సొంత సర్వర్ ఎందుకు",
    "why": [
      [
        "ప్రైవేట్",
        "మీ ఆటలు మీ మెషీన్‌లోనే, మీ నెట్‌వర్క్‌లోనే ఉంటాయి; ఆటగాళ్లకు ఖాతా గానీ ఇమెయిల్ చిరునామా గానీ అవసరం లేదు, మారుపేరు చాలు."
      ],
      [
        "మీకు నచ్చినట్లు",
        "సర్వర్‌కు సొంత పేరు పెట్టండి, లాగిన్ స్క్రీన్ ఏ మోడ్‌లను చూపాలో ఎంచుకోండి, స్వాగత సందేశం పెట్టండి, మీ బృందం కోసం ఉమ్మడి లీడర్‌బోర్డ్ నిర్వహించండి."
      ],
      [
        "ఉచితం",
        "లైసెన్స్ లేదు, సబ్‌స్క్రిప్షన్ లేదు, ప్రకటనలు లేవు: PokerTH సర్వర్, వెబ్ క్లయింట్ రెండూ ఉచిత సాఫ్ట్‌వేర్."
      ]
    ],
    "partsH2": "రెండు భాగాలు",
    "partsP": "PokerTH ఆటకు కార్డులు పంచి టేబుల్‌లను నడిపే PokerTH డెడికేటెడ్ సర్వర్, బ్రౌజర్‌లకు యాప్‌ను అందించి వాటిని ఆ సర్వర్‌కు కలిపే వెబ్ క్లయింట్ అవసరం. రెండూ ఒకే మెషీన్‌పై నడవగలవు. అన్నీ అనుకూలంగానే ఉంటాయి: PokerTH యాప్‌లు — Windows, macOS, Linux, Android కోసం QML క్లయింట్, డెస్క్‌టాప్ కోసం క్లాసిక్ widget క్లయింట్ — బ్రౌజర్‌లు కనెక్ట్ అయ్యే అదే సర్వర్‌కు కనెక్ట్ అవుతాయి, కాబట్టి ఒకే టేబుల్ వద్ద ఆటగాళ్లు బ్రౌజర్‌లు, యాప్‌లు కలిపి ఆడవచ్చు.",
    "stepsH2": "మూడు దశల్లో సెటప్",
    "steps": [
      [
        "PokerTH సర్వర్ ఇన్‌స్టాల్ చేయండి",
        "PokerTH ప్రాజెక్ట్ సర్వర్ గైడ్‌ను అనుసరించి PokerTH సోర్స్‌ల నుంచి pokerth_dedicated_server ను బిల్డ్ చేయండి — వెర్షన్ 2.1.10 లేదా ఆ తర్వాతిది: దీనికి Qt 6.7 లేదా కొత్తది, CMake, C++23 కంపైలర్ అవసరం. Linux డిస్ట్రిబ్యూషన్‌ల pokerth-server ప్యాకేజీ పాత వెర్షన్. సర్వర్ TCP పోర్ట్ 7234 పై వింటుంది."
      ],
      [
        "వెబ్ క్లయింట్ ఇన్‌స్టాల్ చేయండి",
        "Debian, Ubuntu లేదా Raspberry Pi OS పై ఇన్‌స్టాలేషన్ స్క్రిప్ట్ ఒకే కమాండ్‌తో Node.js, వెబ్ క్లయింట్, మెషీన్‌తో పాటే ప్రారంభమయ్యే సర్వీస్‌ను సెటప్ చేస్తుంది. Docker వాడేవారు amd64, arm64, armv7 కోసం సిద్ధంగా ఉన్న ఇమేజ్‌ను పుల్ చేస్తారు, CasaOS అదే Compose ఫైల్‌ను యాప్‌గా దిగుమతి చేస్తుంది."
      ],
      [
        "ఆడండి",
        "మీ నెట్‌వర్క్‌లోని ఏ పరికరంలోనైనా పోర్ట్ 8080 పై మెషీన్ చిరునామాను తెరిచి, ‘LAN / డెడికేటెడ్ సర్వర్’ ఎంచుకుని, మారుపేరు టైప్ చేసి టేబుల్ సృష్టించండి. PokerTH QML లేదా widget క్లయింట్ ఉన్న ఆటగాళ్లు పోర్ట్ 7234 పై అదే మెషీన్‌కు కనెక్ట్ అయి అవే టేబుల్‌లలో చేరతారు."
      ]
    ],
    "piH2": "Raspberry Pi పై",
    "piP": "PokerTH చిన్న సందేశాలను మాత్రమే మార్పిడి చేస్తుంది, బొమ్మలన్నీ ఆటగాళ్ల పరికరాలే గీస్తాయి, కాబట్టి Raspberry Pi సరిపోతుంది: 2 GB ఉన్న Pi 4 సరైన ఎంపిక, Pi 5 అవసరానికి మించినది. సాఫీగా సాగే సాయంత్రానికి బోర్డు కంటే నెట్‌వర్క్ ముఖ్యం — Pi ని కేబుల్‌తో రౌటర్‌కు కలపండి, ఆటగాళ్ల కోసం మంచి Wi-Fi యాక్సెస్ పాయింట్ వాడండి.",
    "httpsH2": "LAN లో HTTP, అదనపు ఫీచర్లకు HTTPS",
    "httpsP": "మీ సొంత నెట్‌వర్క్‌లో ఆట సాధారణ HTTP పై పనిచేస్తుంది. యాప్‌ను హోమ్ స్క్రీన్‌పై ఇన్‌స్టాల్ చేయడానికి, ఆఫ్‌లైన్‌లో ఆడటానికి, నోటిఫికేషన్‌లు పొందడానికి HTTPS అవసరం, దీన్ని గైడ్ Nginx, ఉచిత Let’s Encrypt సర్టిఫికెట్‌తో సెటప్ చేస్తుంది.",
    "adminH2": "బ్రౌజర్‌లోనే అడ్మిన్ ప్యానెల్",
    "adminP": "/admin వద్ద టోకెన్‌తో రక్షించిన కన్సోల్ ఎవరు కనెక్ట్ అయ్యారో చూపిస్తుంది, ఒక్క క్లిక్‌తో వెబ్ క్లయింట్‌ను అప్‌డేట్ చేసి అవసరమైతే వెనక్కి తీసుకెళ్లగలదు, ఆటగాళ్లకు ప్రకటనలు పంపుతుంది, లీడర్‌బోర్డ్‌ను రీసెట్ చేస్తుంది, కార్డ్ డెక్‌లు, టేబుల్ స్టైల్‌లు, సంగీతాన్ని ఇన్‌స్టాల్ చేస్తుంది, క్లయింట్ చేరగల గేమ్ సర్వర్‌ల జాబితాను నిర్ణయిస్తుంది, దానిలోని కొన్ని విభాగాలను మాత్రమే తెరిచే కీలను అందిస్తుంది.",
    "shareH2": "బయటి నుంచి ఆటగాళ్లను ఆహ్వానించండి",
    "shareP": "ఆహ్వాన లింక్‌లు, QR కోడ్‌లు pokerth.net లో లాగే మీ సర్వర్‌లోనూ పనిచేస్తాయి: స్నేహితుడు లింక్ తెరిస్తే మీ టేబుల్ వద్ద కూర్చుంటాడు. మీ సర్వర్ ఇంటర్నెట్ నుంచి చేరుకోగలిగేలా ఉంటే, వెబ్ క్లయింట్ పబ్లిక్ సర్వర్ జాబితా కోసం దాన్ని ప్రతిపాదించవచ్చు కూడా; వెబ్ క్లయింట్ అడ్మిన్‌లు ఆమోదించిన తర్వాత అది అక్కడ కనిపిస్తుంది.",
    "guidesH2": "దశలవారీ గైడ్‌లు",
    "guides": [
      "PokerTH సర్వర్ సెటప్ గైడ్",
      "సెల్ఫ్-హోస్టింగ్, ఒకే కమాండ్‌తో ఇన్‌స్టాల్",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "మాన్యువల్ ఇన్‌స్టాలేషన్, HTTPS",
      "అడ్మిన్ ప్యానెల్"
    ],
    "faqH2": "ప్రశ్నలు",
    "faq": [
      [
        "PokerTH సర్వర్ హోస్ట్ చేయడం ఉచితమా?",
        "అవును. PokerTH సర్వర్, వెబ్ క్లయింట్ ఉచిత, ఓపెన్ సోర్స్ సాఫ్ట్‌వేర్; వాటిని నడపడానికి మీకు ఒక మెషీన్ మాత్రమే కావాలి."
      ],
      [
        "నాకు ఎలాంటి హార్డ్‌వేర్ కావాలి?",
        "చాలా తక్కువ: Linux లేదా Docker నడిచే ఏ PC లేదా హోమ్ సర్వర్ అయినా, లేదా Raspberry Pi 4 లేదా 5. ప్రాసెసింగ్ శక్తి కంటే వైర్డ్ నెట్‌వర్క్ కనెక్షన్ ముఖ్యం."
      ],
      [
        "ఆటగాళ్లు ఏదైనా ఇన్‌స్టాల్ చేయాలా?",
        "అవసరం లేదు. వారు తమ ఫోన్, టాబ్లెట్ లేదా కంప్యూటర్‌లోని బ్రౌజర్‌లో సర్వర్ చిరునామాను తెరుస్తారు. యాప్‌ను ఇష్టపడేవారు PokerTH QML క్లయింట్ లేదా క్లాసిక్ widget క్లయింట్ ఉపయోగించవచ్చు: వాటితో అదే సర్వర్‌కు కనెక్ట్ అయి అవే టేబుల్‌లలో ఆడవచ్చు."
      ],
      [
        "దీనికి pokerth.net లేదా ఇంటర్నెట్ కనెక్షన్ అవసరమా?",
        "లేదు. మీ లోకల్ నెట్‌వర్క్‌లోని సర్వర్ స్వతంత్రంగా నడుస్తుంది: ఆటగాళ్లు కేవలం మారుపేరుతో నేరుగా దానికి కనెక్ట్ అవుతారు."
      ],
      [
        "ఎంత మంది ఆటగాళ్లు చేరవచ్చు?",
        "ఒక టేబుల్‌కు 10 మంది ఆటగాళ్ల వరకు, ప్రేక్షకులు కూడా, మీ బృందానికి కావలసినన్ని టేబుల్‌లు."
      ]
    ]
  },
  tg: {
    "title": "Сервери шахсии покер — ройгон, дар дастгоҳи худ | PokerTH",
    "desc": "Сервери хусусии Texas Hold’em дар хона, клуб ё мактаб: сервер ва муштарии веби ройгони PokerTH, бо як фармон, бо Docker ё дар Raspberry Pi насб мешавад.",
    "ldHeadline": "Чӣ тавр сервери покери PokerTH-и худро барпо кунед",
    "ldDesc": "Бо сервери махсуси PokerTH ва муштарии веби PokerTH сервери хусусии Texas Hold’em-ро дар дастгоҳи худ барпо кунед.",
    "h1": "Сервери покери худро барпо кунед",
    "lead": "PokerTH аз аввал то охир ройгон ва кушодакод аст: сервери бозӣ ва ин муштарии веб метавонанд дар дастгоҳи худи шумо кор кунанд. Барои бозии оилавӣ, шоми клуб, лигаи идора ё мактаб як компютер, сервери хонагӣ ё Raspberry Pi кифоя аст ва баъд ҳар телефон, планшет ё компютер дар шабакаи шумо танҳо бо лақаб дар браузери худ бозӣ мекунад.",
    "whyH2": "Чаро сервери худ",
    "why": [
      [
        "Хусусӣ",
        "Бозиҳои шумо дар дастгоҳ ва шабакаи шумо мемонанд; бозингарон на ҳисоб лозим доранд, на суроғаи почтаи электронӣ, танҳо лақаб."
      ],
      [
        "Бо салиқаи шумо",
        "Ба сервер номи худашро диҳед, интихоб кунед, ки экрани воридшавӣ кадом реҷаҳоро пешниҳод кунад, паёми хушомадгӯӣ гузоред ва барои гурӯҳи худ рӯйхати умумии ғолибонро пеш баред."
      ],
      [
        "Ройгон",
        "На иҷозатнома, на обуна, на реклама: сервери PokerTH ва муштарии веб ҳарду нармафзори озод мебошанд."
      ]
    ],
    "partsH2": "Ду ҷузъ",
    "partsP": "Бозии PokerTH ба сервери махсуси PokerTH, ки қартаҳоро тақсим мекунад ва мизҳоро идора мекунад, ва ба муштарии веб, ки барномаро ба браузерҳо мерасонад ва онҳоро ба ҳамон сервер мепайвандад, ниёз дорад. Онҳо метавонанд дар як дастгоҳ кор кунанд. Ҳама чиз мувофиқ боқӣ мемонад: барномаҳои PokerTH — муштарии QML дар Windows, macOS, Linux ва Android ва муштарии классикии widget дар компютер — ба ҳамон сервере пайваст мешаванд, ки браузерҳо, бинобар ин бозингарон метавонанд сари як миз браузерҳо ва барномаҳоро якҷоя истифода баранд.",
    "stepsH2": "Барпо кардан дар се қадам",
    "steps": [
      [
        "Сервери PokerTH-ро насб кунед",
        "pokerth_dedicated_server-ро аз коди манбаи PokerTH — версияи 2.1.10 ё навтар — тибқи дастури сервери лоиҳаи PokerTH созед: ба он Qt 6.7 ё навтар, CMake ва компилятори C++23 лозим аст. Бастаи pokerth-server дар дистрибутивҳои Linux версияи кӯҳна аст. Сервер дар порти TCP 7234 гӯш мекунад."
      ],
      [
        "Муштарии вебро насб кунед",
        "Дар Debian, Ubuntu ё Raspberry Pi OS скрипти насб бо як фармон Node.js, муштарии веб ва хидматеро, ки ҳамроҳи дастгоҳ оғоз мешавад, насб мекунад. Корбарони Docker тасвири тайёрро барои amd64, arm64 ва armv7 мегиранд ва CasaOS ҳамон файли Compose-ро ҳамчун барнома ворид мекунад."
      ],
      [
        "Бозӣ кунед",
        "Дар ҳар дастгоҳи шабакаи худ суроғаи дастгоҳро дар порти 8080 кушоед, «LAN / Сервери махсус»-ро интихоб кунед, лақаб нависед ва миз созед. Бозингароне, ки муштарии QML ё widget-и PokerTH доранд, ба ҳамон дастгоҳ дар порти 7234 пайваст мешаванд ва ба ҳамон мизҳо ҳамроҳ мешаванд."
      ]
    ],
    "piH2": "Дар Raspberry Pi",
    "piP": "PokerTH паёмҳои хурд мубодила мекунад ва ҳамаи тасвиркаширо дастгоҳҳои бозингарон иҷро мекунанд, бинобар ин Raspberry Pi комилан басанда аст: Pi 4 бо 2 GB интихоби беҳтарин аст, Pi 5 бошад, аз кифоя зиёд. Барои шоми бемамоният шабака аз плата муҳимтар аст — Pi-ро бо кабел ба роутер пайваст кунед ва барои бозингарон нуқтаи дастрасии хуби Wi-Fi истифода баред.",
    "httpsH2": "HTTP дар LAN, HTTPS барои имкониятҳои иловагӣ",
    "httpsP": "Дар шабакаи худатон бозӣ тавассути HTTP-и оддӣ кор мекунад. Насби барнома дар экрани асосӣ, бозии офлайн ва гирифтани огоҳиномаҳо HTTPS-ро талаб мекунанд, ки дастур онро бо Nginx ва сертификати ройгони Let’s Encrypt танзим мекунад.",
    "adminH2": "Лавҳаи маъмурӣ дар браузер",
    "adminP": "Консоли бо токен ҳифзшуда дар /admin нишон медиҳад, ки кӣ пайваст аст, муштарии вебро бо як клик навсозӣ мекунад ва метавонад онро ба версияи қаблӣ баргардонад, ба бозингарон эълонҳо мефиристад, рӯйхати ғолибонро аз нав оғоз мекунад, дастаҳои қарта, услубҳои миз ва мусиқӣ насб мекунад, серверҳои бозиеро, ки муштарӣ метавонад ба онҳо пайваст шавад, номбар мекунад ва калидҳое медиҳад, ки танҳо баъзе бахшҳои онро мекушоянд.",
    "shareH2": "Бозингаронро аз берун даъват кунед",
    "shareP": "Пайвандҳои даъват ва QR-кодҳо дар сервери шумо айнан мисли pokerth.net кор мекунанд: дӯст пайвандро мекушояд ва сари мизи шумо менишинад. Агар сервери шумо аз интернет дастрас бошад, шумо метавонед онро барои рӯйхати ҷамъиятии серверҳои муштарии веб низ пешниҳод кунед; он баъд аз тасдиқи маъмурони муштарии веб дар он ҷо пайдо мешавад.",
    "guidesH2": "Дастурҳои қадам ба қадам",
    "guides": [
      "Дастури танзими сервери PokerTH",
      "Ҷойгиркунии мустақил ва насб бо як фармон",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Насби дастӣ ва HTTPS",
      "Лавҳаи маъмурӣ"
    ],
    "faqH2": "Саволҳо",
    "faq": [
      [
        "Оё ҷойгир кардани сервери PokerTH ройгон аст?",
        "Бале. Сервери PokerTH ва муштарии веб нармафзори ройгон ва кушодакод мебошанд; ба шумо танҳо дастгоҳе лозим аст, ки онҳоро кор фармояд."
      ],
      [
        "Ба ман кадом сахтафзор лозим аст?",
        "Хеле кам: ҳар компютер ё сервери хонагӣ, ки дар он Linux ё Docker кор мекунад, ё Raspberry Pi 4 ё 5. Пайвасти симии шабака аз қудрати коркард муҳимтар аст."
      ],
      [
        "Оё бозингарон бояд чизе насб кунанд?",
        "Не. Онҳо суроғаи серверро дар браузери телефон, планшет ё компютери худ мекушоянд. Касоне, ки барномаро афзал медонанд, метавонанд муштарии QML-и PokerTH ё муштарии классикии widget-ро истифода баранд: онҳо ба ҳамон сервер пайваст мешаванд ва сари ҳамон мизҳо бозӣ мекунанд."
      ],
      [
        "Оё ба pokerth.net ё пайвасти интернет ниёз дорад?",
        "Не. Сервер дар шабакаи маҳаллии шумо мустақилона кор мекунад: бозингарон бевосита ба он пайваст мешаванд, танҳо бо лақаб."
      ],
      [
        "Чанд бозингар ҳамроҳ шуда метавонад?",
        "То 10 бозингар дар як миз, ба илова тамошобинон, ва ҳамон қадар миз, ки гурӯҳи шумо лозим дорад."
      ]
    ]
  },
  th: {
    "title": "ตั้งเซิร์ฟเวอร์โป๊กเกอร์ของคุณเอง — ฟรี โฮสต์เอง | PokerTH",
    "desc": "เซิร์ฟเวอร์ Texas Hold’em ส่วนตัวที่บ้าน ชมรม หรือโรงเรียน ด้วยเซิร์ฟเวอร์และไคลเอนต์เว็บ PokerTH ฟรี ติดตั้งด้วยคำสั่งเดียว ผ่าน Docker หรือบน Raspberry Pi",
    "ldHeadline": "วิธีตั้งเซิร์ฟเวอร์โป๊กเกอร์ PokerTH ของคุณเอง",
    "ldDesc": "ตั้งเซิร์ฟเวอร์ Texas Hold’em ส่วนตัวที่โฮสต์เอง ด้วยเซิร์ฟเวอร์เฉพาะของ PokerTH และไคลเอนต์เว็บ PokerTH",
    "h1": "ตั้งเซิร์ฟเวอร์โป๊กเกอร์ของคุณเอง",
    "lead": "PokerTH ฟรีและเป็นโอเพนซอร์สตั้งแต่ต้นจนจบ ทั้งเซิร์ฟเวอร์เกมและไคลเอนต์เว็บนี้รันบนเครื่องของคุณเองได้ พีซี โฮมเซิร์ฟเวอร์ หรือ Raspberry Pi สักเครื่องก็พอสำหรับการเล่นในครอบครัว คืนของชมรม ลีกในออฟฟิศ หรือโรงเรียน จากนั้นมือถือ แท็บเล็ต หรือคอมพิวเตอร์ทุกเครื่องในเครือข่ายของคุณก็เล่นในเบราว์เซอร์ได้ด้วยชื่อเล่นอย่างเดียว",
    "whyH2": "ทำไมต้องมีเซิร์ฟเวอร์ของตัวเอง",
    "why": [
      [
        "เป็นส่วนตัว",
        "เกมของคุณอยู่บนเครื่องและเครือข่ายของคุณเท่านั้น ผู้เล่นไม่ต้องมีบัญชีหรืออีเมล แค่มีชื่อเล่นก็พอ"
      ],
      [
        "ปรับแต่งได้ตามใจ",
        "ตั้งชื่อเซิร์ฟเวอร์เอง เลือกว่าหน้าจอเข้าสู่ระบบจะมีโหมดอะไรบ้าง โพสต์ข้อความต้อนรับ และเก็บอันดับร่วมกันสำหรับกลุ่มของคุณ"
      ],
      [
        "ฟรี",
        "ไม่มีค่าไลเซนส์ ไม่มีค่าสมาชิก ไม่มีโฆษณา ทั้งเซิร์ฟเวอร์ PokerTH และไคลเอนต์เว็บเป็นซอฟต์แวร์เสรี"
      ]
    ],
    "partsH2": "สองส่วนประกอบ",
    "partsP": "เกม PokerTH ต้องใช้เซิร์ฟเวอร์เฉพาะของ PokerTH ซึ่งแจกไพ่และดูแลโต๊ะ กับไคลเอนต์เว็บ ซึ่งส่งแอปไปยังเบราว์เซอร์และเชื่อมเบราว์เซอร์เหล่านั้นเข้ากับเซิร์ฟเวอร์ ทั้งสองส่วนรันบนเครื่องเดียวกันได้ ทุกอย่างยังเข้ากันได้ แอป PokerTH ได้แก่ ไคลเอนต์ QML บน Windows, macOS, Linux และ Android และไคลเอนต์ widget แบบคลาสสิกบนเดสก์ท็อป ก็เชื่อมต่อกับเซิร์ฟเวอร์เดียวกับเบราว์เซอร์ ผู้เล่นจากเบราว์เซอร์และแอปจึงเล่นร่วมโต๊ะเดียวกันได้",
    "stepsH2": "ตั้งค่าในสามขั้นตอน",
    "steps": [
      [
        "ติดตั้งเซิร์ฟเวอร์ PokerTH",
        "คอมไพล์ pokerth_dedicated_server จากซอร์สโค้ดของ PokerTH — เวอร์ชัน 2.1.10 ขึ้นไป — ตามคู่มือเซิร์ฟเวอร์ของโปรเจกต์ PokerTH ซึ่งต้องใช้ Qt 6.7 ขึ้นไป, CMake และคอมไพเลอร์ C++23 แพ็กเกจ pokerth-server ของดิสทริบิวชัน Linux เป็นเวอร์ชันเก่ากว่า เซิร์ฟเวอร์รอรับการเชื่อมต่อที่พอร์ต TCP 7234"
      ],
      [
        "ติดตั้งไคลเอนต์เว็บ",
        "บน Debian, Ubuntu หรือ Raspberry Pi OS สคริปต์ติดตั้งจะตั้งค่า Node.js ไคลเอนต์เว็บ และบริการที่เริ่มทำงานพร้อมเครื่องให้ในคำสั่งเดียว ผู้ใช้ Docker ดึงอิมเมจสำเร็จรูปสำหรับ amd64, arm64 และ armv7 ได้เลย ส่วน CasaOS นำเข้าไฟล์ Compose เดียวกันเป็นแอป"
      ],
      [
        "เล่น",
        "บนอุปกรณ์ใดก็ได้ในเครือข่ายของคุณ เปิดที่อยู่ของเครื่องที่พอร์ต 8080 เลือก LAN / เซิร์ฟเวอร์เฉพาะ พิมพ์ชื่อเล่น แล้วสร้างโต๊ะ ผู้เล่นที่ใช้ไคลเอนต์ PokerTH QML หรือ widget เชื่อมต่อกับเครื่องเดียวกันที่พอร์ต 7234 และเข้าร่วมโต๊ะเดียวกันได้"
      ]
    ],
    "piH2": "บน Raspberry Pi",
    "piP": "PokerTH รับส่งแค่ข้อความขนาดเล็ก และอุปกรณ์ของผู้เล่นเป็นผู้วาดภาพทั้งหมด Raspberry Pi จึงเหลือเฟือ Pi 4 แรม 2 GB คือตัวเลือกที่ลงตัวที่สุด ส่วน Pi 5 ก็เกินพอ ถ้าอยากให้ค่ำคืนลื่นไหล เครือข่ายสำคัญกว่าบอร์ด ต่อ Pi เข้ากับเราเตอร์ด้วยสายแลน และใช้แอคเซสพอยต์ Wi-Fi ดี ๆ สำหรับผู้เล่น",
    "httpsH2": "HTTP ใน LAN และ HTTPS สำหรับฟีเจอร์เสริม",
    "httpsP": "ในเครือข่ายของคุณเอง เกมทำงานผ่าน HTTP ธรรมดาได้ การติดตั้งแอปบนหน้าจอโฮม การเล่นออฟไลน์ และการรับการแจ้งเตือนต้องใช้ HTTPS ซึ่งคู่มือจะตั้งค่าด้วย Nginx และใบรับรอง Let’s Encrypt ฟรี",
    "adminH2": "แผงผู้ดูแลในเบราว์เซอร์",
    "adminP": "คอนโซลที่ /admin ซึ่งป้องกันด้วยโทเคน แสดงว่าใครเชื่อมต่ออยู่ อัปเดตไคลเอนต์เว็บได้ในคลิกเดียวและย้อนกลับได้ ส่งประกาศถึงผู้เล่น รีเซ็ตอันดับ ติดตั้งสำรับไพ่ สไตล์โต๊ะ และเพลง แสดงรายการเซิร์ฟเวอร์เกมที่ไคลเอนต์เข้าถึงได้ และแจกคีย์ที่ปลดล็อกได้เฉพาะบางส่วนของคอนโซล",
    "shareH2": "เชิญผู้เล่นจากภายนอก",
    "shareP": "ลิงก์เชิญและ QR code ใช้งานบนเซิร์ฟเวอร์ของคุณได้เหมือนบน pokerth.net เพื่อนเปิดลิงก์แล้วก็ได้นั่งที่โต๊ะของคุณ ถ้าเซิร์ฟเวอร์ของคุณเข้าถึงได้จากอินเทอร์เน็ต คุณยังเสนอให้อยู่ในรายชื่อเซิร์ฟเวอร์สาธารณะของไคลเอนต์เว็บได้ด้วย เซิร์ฟเวอร์จะปรากฏในรายชื่อเมื่อผู้ดูแลไคลเอนต์เว็บอนุมัติ",
    "guidesH2": "คู่มือทีละขั้นตอน",
    "guides": [
      "คู่มือตั้งค่าเซิร์ฟเวอร์ PokerTH",
      "โฮสต์เองและติดตั้งด้วยคำสั่งเดียว",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "ติดตั้งด้วยตนเองและ HTTPS",
      "แผงผู้ดูแล"
    ],
    "faqH2": "คำถามที่พบบ่อย",
    "faq": [
      [
        "ตั้งเซิร์ฟเวอร์ PokerTH ฟรีไหม",
        "ฟรี เซิร์ฟเวอร์ PokerTH และไคลเอนต์เว็บเป็นซอฟต์แวร์ฟรีและโอเพนซอร์ส คุณแค่ต้องมีเครื่องไว้รันเท่านั้น"
      ],
      [
        "ต้องใช้ฮาร์ดแวร์อะไรบ้าง",
        "น้อยมาก พีซีหรือโฮมเซิร์ฟเวอร์เครื่องไหนก็ได้ที่รัน Linux หรือ Docker หรือ Raspberry Pi 4 หรือ 5 การเชื่อมต่อเครือข่ายแบบใช้สายสำคัญกว่าพลังประมวลผล"
      ],
      [
        "ผู้เล่นต้องติดตั้งอะไรไหม",
        "ไม่ต้อง แค่เปิดที่อยู่ของเซิร์ฟเวอร์ในเบราว์เซอร์บนมือถือ แท็บเล็ต หรือคอมพิวเตอร์ ส่วนผู้ที่ชอบใช้แอปสามารถใช้ไคลเอนต์ PokerTH QML หรือไคลเอนต์ widget แบบคลาสสิก ซึ่งเชื่อมต่อกับเซิร์ฟเวอร์เดียวกันและเล่นที่โต๊ะเดียวกัน"
      ],
      [
        "ต้องใช้ pokerth.net หรืออินเทอร์เน็ตไหม",
        "ไม่ต้อง เซิร์ฟเวอร์ในเครือข่ายท้องถิ่นของคุณทำงานได้ด้วยตัวเอง ผู้เล่นเชื่อมต่อกับเซิร์ฟเวอร์โดยตรงด้วยชื่อเล่นอย่างเดียว"
      ],
      [
        "เข้าร่วมได้กี่คน",
        "สูงสุด 10 คนต่อโต๊ะ บวกผู้ชม และเปิดได้หลายโต๊ะเท่าที่กลุ่มของคุณต้องการ"
      ]
    ]
  },
  tk: {
    "title": "Öz poker serweriňizi guruň — mugt, öz enjamyňyzda | PokerTH",
    "desc": "Öýde, klubda ýa-da mekdepde hususy Texas Hold’em serweri: mugt PokerTH serweri we web müşderisi bir buýruk bilen, Docker bilen ýa-da Raspberry Pi-de gurnalýar.",
    "ldHeadline": "Öz PokerTH poker serweriňizi nädip gurmaly",
    "ldDesc": "PokerTH aýratyn serweri we PokerTH web müşderisi bilen hususy, öz enjamyňyzda ýerleşdirilen Texas Hold’em serwerini guruň.",
    "h1": "Öz poker serweriňizi guruň",
    "lead": "PokerTH başdan-aýak mugt we açyk çeşmeli: oýun serweri we bu web müşderisi öz kompýuteriňizde işläp biler. Maşgala oýny, klub agşamy, ofis ligasy ýa-da mekdep üçin bir kompýuter, öý serweri ýa-da Raspberry Pi ýeterlik, soňra toruňyzdaky her telefon, planşet ýa-da kompýuter diňe lakam bilen öz brauzerinde oýnaýar.",
    "whyH2": "Näme üçin öz serweriňiz",
    "why": [
      [
        "Hususy",
        "Oýunlaryňyz öz kompýuteriňizde we toruňyzda galýar; oýunçylara hasap hem, e-poçta salgysy hem gerek däl, diňe lakam."
      ],
      [
        "Isleýşiňiz ýaly",
        "Serwere öz adyny beriň, giriş ekranynda haýsy tertipleriň hödürlenjekdigini saýlaň, hoş geldiňiz habaryny ýerleşdiriň we toparyňyz üçin umumy reýting tablisasyny alyp baryň."
      ],
      [
        "Mugt",
        "Ygtyýarnama ýok, abuna ýok, mahabat ýok: PokerTH serweri hem, web müşderisi hem erkin programma üpjünçiligidir."
      ]
    ],
    "partsH2": "Iki bölek",
    "partsP": "PokerTH oýny üçin kartlary paýlaýan we stollary dolandyrýan PokerTH aýratyn serweri hem-de programmany brauzerlere berýän we olary şol serwere birikdirýän web müşderisi gerek. Olar bir kompýuterde işläp bilerler. Hemme zat gabat gelmegini saklaýar: PokerTH programmalary — Windows, macOS, Linux we Android üçin QML müşderisi hem-de iş stoly üçin nusgawy widget müşderisi — brauzerler bilen şol bir serwere birikýär, şonuň üçin oýunçylar bir stolda brauzerleri we programmalary garyşdyryp bilerler.",
    "stepsH2": "Üç ädimde guruň",
    "steps": [
      [
        "PokerTH serwerini gurnaň",
        "pokerth_dedicated_server-i PokerTH çeşme kodundan — 2.1.10 ýa-da has täze wersiýa — PokerTH taslamasynyň serwer gollanmasyna eýerip ýygnaň: oňa Qt 6.7 ýa-da has täzesi, CMake we C++23 kompilýatory gerek. Linux paýlamalarynyň pokerth-server bukjasy köne wersiýadyr. Serwer TCP 7234 portunda diňleýär."
      ],
      [
        "Web müşderisini gurnaň",
        "Debian, Ubuntu ýa-da Raspberry Pi OS-da gurnama skripti bir buýruk bilen Node.js-i, web müşderisini we kompýuter bilen bile başlaýan hyzmaty sazlaýar. Docker ulanyjylary amd64, arm64 we armv7 üçin taýýar obrazy göçürip alýarlar, CasaOS bolsa şol bir Compose faýlyny programma hökmünde import edýär."
      ],
      [
        "Oýnaň",
        "Toruňyzdaky islendik enjamda kompýuteriň salgysyny 8080 portunda açyň, “LAN / Aýratyn serwer” saýlaň, lakam ýazyň we stol dörediň. PokerTH QML ýa-da widget müşderisi bolan oýunçylar şol kompýutere 7234 portunda birikýärler we şol stollara goşulýarlar."
      ]
    ],
    "piH2": "Raspberry Pi-de",
    "piP": "PokerTH kiçijik habarlar alyşýar, ähli çekişi bolsa oýunçylaryň enjamlary edýär, şonuň üçin Raspberry Pi doly ýeterlik: 2 GB-ly Pi 4 iň amatly saýlaw, Pi 5 bolsa ýeterlikden hem artyk. Rahat agşam üçin tor platadan has möhüm — Pi-ni routere kabel bilen birikdiriň we oýunçylar üçin gowy Wi-Fi giriş nokadyny ulanyň.",
    "httpsH2": "LAN-da HTTP, goşmaçalar üçin HTTPS",
    "httpsP": "Öz toruňyzda oýun ýönekeý HTTP arkaly işleýär. Programmany baş ekrana gurnamak, oflaýn oýnamak we bildirişleri almak üçin HTTPS gerek, gollanma ony Nginx we mugt Let’s Encrypt sertifikaty bilen sazlaýar.",
    "adminH2": "Brauzerde dolandyryş paneli",
    "adminP": "/admin salgysyndaky token bilen goralýan konsol kimiň birikendigini görkezýär, web müşderisini bir basyşda täzeleýär we öňki wersiýa gaýtaryp bilýär, oýunçylara bildirişler iberýär, reýting tablisasyny nola getirýär, kart desselerini, stol stillerini we aýdym-sazy gurnaýar, müşderiniň baryp bilýän oýun serwerleriniň sanawyny görkezýär we diňe käbir bölümlerini açýan açarlary paýlaýar.",
    "shareH2": "Daşardan oýunçylary çagyryň",
    "shareP": "Çakylyk salgylary we QR kodlar serweriňizde edil pokerth.net-däki ýaly işleýär: dost salgyny açýar we stoluňyza oturýar. Serweriňize internetden girip bolýan bolsa, ony web müşderisiniň köpçülikleýin serwer sanawyna hem teklip edip bilersiňiz; web müşderisiniň administratorlary tassyklandan soň ol şol ýerde peýda bolýar.",
    "guidesH2": "Ädimme-ädim gollanmalar",
    "guides": [
      "PokerTH serwerini gurnamak gollanmasy",
      "Öz enjamyňda ýerleşdirmek we bir buýruk bilen gurnamak",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "El bilen gurnamak we HTTPS",
      "Dolandyryş paneli"
    ],
    "faqH2": "Soraglar",
    "faq": [
      [
        "PokerTH serwerini ýerleşdirmek mugtmy?",
        "Hawa. PokerTH serweri we web müşderisi mugt, açyk çeşmeli programma üpjünçiligidir; olary işletmek üçin size diňe bir kompýuter gerek."
      ],
      [
        "Maňa nähili enjam gerek?",
        "Örän az: Linux ýa-da Docker işleýän islendik kompýuter ýa-da öý serweri, ýa-da Raspberry Pi 4 ýa-da 5. Simli tor birikmesi hasaplaýyş güýjünden has möhüm."
      ],
      [
        "Oýunçylar bir zat gurnamalymy?",
        "Ýok. Olar serweriň salgysyny telefonlaryndaky, planşetlerindäki ýa-da kompýuterlerindäki brauzerde açýarlar. Programmany halaýanlar PokerTH QML müşderisini ýa-da nusgawy widget müşderisini ulanyp bilerler: olar şol serwere birikýär we şol stollarda oýnamaga mümkinçilik berýär."
      ],
      [
        "Oňa pokerth.net ýa-da internet birikmesi gerekmi?",
        "Ýok. Ýerli toruňyzdaky serwer özbaşdak işleýär: oýunçylar oňa göni, diňe lakam bilen birikýärler."
      ],
      [
        "Näçe oýunçy goşulyp biler?",
        "Her stolda 10 oýunça çenli, üstesine tomaşaçylar, we toparyňyza näçe stol gerek bolsa, şonça stol."
      ]
    ]
  },
  tr: {
    "title": "Kendi poker sunucunu kur — ücretsiz, kendi donanımında | PokerTH",
    "desc": "Evde, kulüpte ya da okulda özel bir Texas Hold’em sunucusu: ücretsiz PokerTH sunucusu ve web istemcisi, tek komutla, Docker ile ya da Raspberry Pi üzerinde kurulur.",
    "ldHeadline": "Kendi PokerTH poker sunucunuzu nasıl barındırırsınız",
    "ldDesc": "PokerTH adanmış sunucusu ve PokerTH web istemcisiyle kendi barındırdığınız özel bir Texas Hold’em sunucusu kurun.",
    "h1": "Kendi poker sunucunuzu barındırın",
    "lead": "PokerTH baştan sona ücretsiz ve açık kaynaklıdır: oyun sunucusu da bu web istemcisi de kendi makinenizde çalışabilir. Bir aile oyunu, bir kulüp gecesi, bir ofis ligi ya da bir okul için bir PC, bir ev sunucusu veya bir Raspberry Pi yeterlidir; ağınızdaki her telefon, tablet ya da bilgisayar da yalnızca bir takma adla kendi tarayıcısında oynar.",
    "whyH2": "Neden kendi sunucunuz",
    "why": [
      [
        "Özel",
        "Oyunlarınız kendi makinenizde ve ağınızda kalır; oyuncuların hesaba ya da e-posta adresine ihtiyacı yoktur, bir takma ad yeterlidir."
      ],
      [
        "Size göre",
        "Sunucuya kendi adını verin, giriş ekranının hangi modları sunacağını seçin, bir hoş geldin mesajı yayınlayın ve grubunuz için ortak bir sıralama tablosu tutun."
      ],
      [
        "Ücretsiz",
        "Lisans yok, abonelik yok, reklam yok: PokerTH sunucusu da web istemcisi de özgür yazılımdır."
      ]
    ],
    "partsH2": "İki parça",
    "partsP": "Bir PokerTH oyunu için kartları dağıtan ve masaları yöneten PokerTH adanmış sunucusu ile uygulamayı tarayıcılara sunup onları bu sunucuya bağlayan web istemcisi gerekir. İkisi aynı makinede çalışabilir. Her şey uyumlu kalır: PokerTH uygulamaları — Windows, macOS, Linux ve Android’deki QML istemcisi ile masaüstündeki klasik widget istemcisi — tarayıcılarla aynı sunucuya bağlanır; böylece oyuncular aynı masada tarayıcıları ve uygulamaları bir arada kullanabilir.",
    "stepsH2": "Üç adımda kurun",
    "steps": [
      [
        "PokerTH sunucusunu kurun",
        "PokerTH projesinin sunucu kılavuzunu izleyerek pokerth_dedicated_server’ı PokerTH kaynak kodundan derleyin — sürüm 2.1.10 veya üzeri. Bunun için Qt 6.7 veya daha yenisi, CMake ve bir C++23 derleyicisi gerekir. Linux dağıtımlarındaki pokerth-server paketi daha eski bir sürümdür. Sunucu, 7234 numaralı TCP portunu dinler."
      ],
      [
        "Web istemcisini kurun",
        "Debian, Ubuntu veya Raspberry Pi OS’ta kurulum betiği tek komutla Node.js’i, web istemcisini ve makineyle birlikte başlayan bir hizmeti kurar. Docker kullananlar amd64, arm64 ve armv7 için hazır bir imajı çeker; CasaOS da aynı Compose dosyasını bir uygulama olarak içe aktarır."
      ],
      [
        "Oynayın",
        "Ağınızdaki herhangi bir cihazda makinenin adresini 8080 portunda açın, “LAN / Özel sunucu” seçeneğini seçin, bir takma ad yazın ve bir masa kurun. PokerTH QML ya da widget istemcisini kullanan oyuncular aynı makineye 7234 portundan bağlanır ve aynı masalara katılır."
      ]
    ],
    "piH2": "Raspberry Pi üzerinde",
    "piP": "PokerTH küçük mesajlar alıp verir ve tüm çizimi oyuncuların cihazları yapar; bu yüzden bir Raspberry Pi fazlasıyla yeterlidir: 2 GB’lık bir Pi 4 ideal seçimdir, bir Pi 5 ise gereğinden bile fazladır. Sorunsuz bir akşam için ağ, karttan daha önemlidir — Pi’yi yönlendiriciye kabloyla bağlayın ve oyuncular için iyi bir Wi-Fi erişim noktası kullanın.",
    "httpsH2": "LAN’da HTTP, ekstralar için HTTPS",
    "httpsP": "Kendi ağınızda oyun düz HTTP üzerinden çalışır. Uygulamayı ana ekrana yüklemek, çevrimdışı oynamak ve bildirim almak için HTTPS gerekir; kılavuz bunu Nginx ve ücretsiz bir Let’s Encrypt sertifikasıyla kurar.",
    "adminH2": "Tarayıcıda bir yönetim paneli",
    "adminP": "/admin adresindeki, token ile korunan konsol kimlerin bağlı olduğunu gösterir, web istemcisini tek tıkla günceller ve önceki sürüme geri alabilir, oyunculara duyuru gönderir, sıralama tablosunu sıfırlar, kart desteleri, masa stilleri ve müzik yükler, istemcinin erişebileceği oyun sunucularını listeler ve bölümlerinden yalnızca bazılarını açan anahtarlar dağıtır.",
    "shareH2": "Dışarıdan oyuncu davet edin",
    "shareP": "Davet bağlantıları ve QR kodlar sunucunuzda da pokerth.net’teki gibi çalışır: bir arkadaşınız bağlantıyı açar ve masanıza oturur. Sunucunuza internetten erişilebiliyorsa, onu web istemcisinin herkese açık sunucu listesine de önerebilirsiniz; web istemcisinin yöneticileri onayladığında orada görünür.",
    "guidesH2": "Adım adım kılavuzlar",
    "guides": [
      "PokerTH sunucu kurulum kılavuzu",
      "Kendi sunucunda barındırma ve tek komutla kurulum",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Elle kurulum ve HTTPS",
      "Yönetim paneli"
    ],
    "faqH2": "Sorular",
    "faq": [
      [
        "PokerTH sunucusu barındırmak ücretsiz mi?",
        "Evet. PokerTH sunucusu ve web istemcisi ücretsiz ve açık kaynaklı yazılımlardır; bunları çalıştırmak için yalnızca bir makineye ihtiyacınız var."
      ],
      [
        "Hangi donanıma ihtiyacım var?",
        "Çok az: Linux ya da Docker çalıştıran herhangi bir PC veya ev sunucusu ya da bir Raspberry Pi 4 veya 5. Kablolu ağ bağlantısı, işlem gücünden daha önemlidir."
      ],
      [
        "Oyuncuların bir şey yüklemesi gerekir mi?",
        "Hayır. Sunucunun adresini telefonlarında, tabletlerinde ya da bilgisayarlarında bir tarayıcıda açarlar. Uygulama tercih edenler PokerTH QML istemcisini ya da klasik widget istemcisini kullanabilir: bunlar aynı sunucuya bağlanır ve oyuncular aynı masalarda oynar."
      ],
      [
        "Bunun için pokerth.net’e ya da internet bağlantısına gerek var mı?",
        "Hayır. Yerel ağınızdaki bir sunucu kendi başına çalışır: oyuncular ona doğrudan, yalnızca bir takma adla bağlanır."
      ],
      [
        "Kaç oyuncu katılabilir?",
        "Masa başına en fazla 10 oyuncu, ayrıca izleyiciler; grubunuzun ihtiyaç duyduğu kadar da masa."
      ]
    ]
  },
  uk: {
    "title": "Власний покерний сервер — безкоштовний, self-hosted | PokerTH",
    "desc": "Приватний сервер Texas Hold’em удома, у клубі чи школі: безкоштовні сервер PokerTH і вебклієнт, встановлення однією командою, через Docker або на Raspberry Pi.",
    "ldHeadline": "Як розгорнути власний покерний сервер PokerTH",
    "ldDesc": "Розгорніть приватний сервер Texas Hold’em на власному хостингу з виділеним сервером PokerTH і вебклієнтом PokerTH.",
    "h1": "Розгорніть власний покерний сервер",
    "lead": "PokerTH безкоштовний і з відкритим кодом від початку до кінця: ігровий сервер і цей вебклієнт можуть працювати на вашій власній машині. ПК, домашнього сервера чи Raspberry Pi досить для сімейної гри, вечора в клубі, офісної ліги чи школи, і тоді кожен телефон, планшет чи комп’ютер у вашій мережі грає у своєму браузері лише з псевдонімом.",
    "whyH2": "Навіщо свій сервер",
    "why": [
      [
        "Приватність",
        "Ваші ігри лишаються на вашій машині й у вашій мережі; гравцям не потрібні ні акаунт, ні адреса пошти — лише псевдонім."
      ],
      [
        "Усе на ваш смак",
        "Дайте серверу власну назву, оберіть, які режими пропонує екран входу, опублікуйте вітальне повідомлення й ведіть спільну таблицю лідерів для своєї компанії."
      ],
      [
        "Безкоштовно",
        "Жодної ліцензії, підписки чи реклами: і сервер PokerTH, і вебклієнт — вільне програмне забезпечення."
      ]
    ],
    "partsH2": "Дві складові",
    "partsP": "Для гри в PokerTH потрібні виділений сервер PokerTH, який роздає карти й веде столи, і вебклієнт, який віддає застосунок браузерам і з’єднує їх із цим сервером. Обидва можуть працювати на одній машині. Усе залишається сумісним: застосунки PokerTH — клієнт QML для Windows, macOS, Linux і Android та класичний клієнт widget для настільних комп’ютерів — під’єднуються до того самого сервера, що й браузери, тож за одним столом можуть разом грати гравці з браузерів і із застосунків.",
    "stepsH2": "Налаштування у три кроки",
    "steps": [
      [
        "Встановіть сервер PokerTH",
        "Зберіть pokerth_dedicated_server із вихідного коду PokerTH — версії 2.1.10 або новішої — за інструкцією до сервера від проєкту PokerTH: потрібні Qt 6.7 або новіший, CMake і компілятор C++23. Пакет pokerth-server у дистрибутивах Linux — старіша версія. Сервер слухає TCP-порт 7234."
      ],
      [
        "Встановіть вебклієнт",
        "У Debian, Ubuntu чи Raspberry Pi OS інсталяційний скрипт однією командою встановлює Node.js, вебклієнт і службу, що запускається разом із машиною. Користувачі Docker завантажують готовий образ для amd64, arm64 і armv7, а CasaOS імпортує той самий файл Compose як застосунок."
      ],
      [
        "Грайте",
        "На будь-якому пристрої у вашій мережі відкрийте адресу машини на порту 8080, оберіть LAN / Виділений сервер, введіть псевдонім і створіть стіл. Гравці з клієнтом PokerTH QML або widget під’єднуються до тієї самої машини на порту 7234 і сідають за ті самі столи."
      ]
    ],
    "piH2": "На Raspberry Pi",
    "piP": "PokerTH обмінюється невеликими повідомленнями, а все малювання виконують пристрої гравців, тож Raspberry Pi цілком вистачає: Pi 4 з 2 ГБ — оптимальний вибір, Pi 5 — із запасом. Для плавного вечора мережа важить більше, ніж плата: під’єднайте Pi до роутера кабелем і використовуйте для гравців хорошу точку доступу Wi-Fi.",
    "httpsH2": "HTTP у LAN, HTTPS для додаткових можливостей",
    "httpsP": "У вашій власній мережі гра працює через звичайний HTTP. Для встановлення застосунку на головний екран, гри офлайн і отримання сповіщень потрібен HTTPS, який інструкція налаштовує за допомогою Nginx і безкоштовного сертифіката Let’s Encrypt.",
    "adminH2": "Панель адміністратора в браузері",
    "adminP": "Захищена токеном консоль за адресою /admin показує, хто під’єднаний, оновлює вебклієнт одним кліком і вміє відкотити його, надсилає гравцям оголошення, скидає таблицю лідерів, встановлює колоди карт, стилі столів і музику, містить список ігрових серверів, до яких може під’єднуватися клієнт, і видає ключі, що відкривають лише деякі її розділи.",
    "shareH2": "Запрошуйте гравців ззовні",
    "shareP": "Посилання-запрошення та QR-коди працюють на вашому сервері так само, як на pokerth.net: друг відкриває посилання й сідає за ваш стіл. Якщо ваш сервер доступний з інтернету, ви також можете запропонувати його до публічного списку серверів вебклієнта; він з’явиться там, щойно адміністратори вебклієнта його схвалять.",
    "guidesH2": "Покрокові інструкції",
    "guides": [
      "Інструкція з налаштування сервера PokerTH",
      "Власний хостинг і встановлення однією командою",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Встановлення вручну та HTTPS",
      "Панель адміністратора"
    ],
    "faqH2": "Запитання",
    "faq": [
      [
        "Чи безкоштовно розгорнути сервер PokerTH?",
        "Так. Сервер PokerTH і вебклієнт — безкоштовне програмне забезпечення з відкритим кодом; вам потрібна лише машина, на якій вони працюватимуть."
      ],
      [
        "Яке обладнання мені потрібне?",
        "Зовсім небагато: будь-який ПК чи домашній сервер із Linux або Docker, або Raspberry Pi 4 чи 5. Дротове мережеве з’єднання важить більше, ніж обчислювальна потужність."
      ],
      [
        "Чи потрібно гравцям щось встановлювати?",
        "Ні. Вони відкривають адресу сервера в браузері на телефоні, планшеті чи комп’ютері. Хто віддає перевагу застосунку, може скористатися клієнтом PokerTH QML або класичним клієнтом widget: вони під’єднуються до того самого сервера й грають за тими самими столами."
      ],
      [
        "Чи потрібні pokerth.net або підключення до інтернету?",
        "Ні. Сервер у вашій локальній мережі працює самостійно: гравці під’єднуються до нього напряму, лише з псевдонімом."
      ],
      [
        "Скільки гравців може приєднатися?",
        "До 10 гравців за столом, а також глядачі, і стільки столів, скільки потрібно вашій компанії."
      ]
    ]
  },
  ur: {
    "title": "اپنا پوکر سرور خود چلائیں — مفت، سیلف ہوسٹڈ | PokerTH",
    "desc": "گھر، کلب یا اسکول میں نجی Texas Hold’em سرور: مفت PokerTH سرور اور ویب کلائنٹ، ایک ہی کمانڈ سے انسٹال، Docker کے ساتھ یا Raspberry Pi پر۔",
    "ldHeadline": "اپنا PokerTH پوکر سرور خود کیسے ہوسٹ کریں",
    "ldDesc": "PokerTH مخصوص سرور اور PokerTH ویب کلائنٹ کے ساتھ ایک نجی، سیلف ہوسٹڈ Texas Hold’em سرور تیار کریں۔",
    "h1": "اپنا پوکر سرور خود ہوسٹ کریں",
    "lead": "PokerTH شروع سے آخر تک مفت اور اوپن سورس ہے: گیم سرور اور یہ ویب کلائنٹ آپ کی اپنی مشین پر چل سکتے ہیں۔ خاندانی کھیل، کلب کی شام، دفتر کی لیگ یا اسکول کے لیے ایک PC، ہوم سرور یا Raspberry Pi کافی ہے، اور پھر آپ کے نیٹ ورک پر ہر فون، ٹیبلٹ یا کمپیوٹر صرف ایک نام کے ساتھ اپنے براؤزر میں کھیلتا ہے۔",
    "whyH2": "اپنا سرور کیوں چلائیں",
    "why": [
      [
        "نجی",
        "آپ کے کھیل آپ کی مشین اور آپ کے نیٹ ورک پر ہی رہتے ہیں؛ کھلاڑیوں کو نہ اکاؤنٹ چاہیے نہ ای میل پتہ، صرف ایک نام۔"
      ],
      [
        "آپ کی مرضی کے مطابق",
        "سرور کو اس کا اپنا نام دیں، چنیں کہ لاگ ان اسکرین کون سے موڈ پیش کرے، خوش آمدید کا پیغام لگائیں، اور اپنے گروپ کے لیے مشترکہ لیڈر بورڈ رکھیں۔"
      ],
      [
        "مفت",
        "نہ لائسنس، نہ سبسکرپشن، نہ اشتہارات: PokerTH سرور اور ویب کلائنٹ دونوں آزاد سافٹ ویئر ہیں۔"
      ]
    ],
    "partsH2": "دو حصے",
    "partsP": "PokerTH کے کھیل کو PokerTH مخصوص سرور کی ضرورت ہوتی ہے، جو پتے بانٹتا اور میزیں چلاتا ہے، اور ویب کلائنٹ کی، جو براؤزرز کو ایپ فراہم کرتا اور انہیں اس سرور سے جوڑتا ہے۔ دونوں ایک ہی مشین پر چل سکتے ہیں۔ سب کچھ ہم آہنگ رہتا ہے: PokerTH ایپس — Windows، macOS، Linux اور Android پر QML کلائنٹ، اور ڈیسک ٹاپ پر کلاسک widget کلائنٹ — بھی اسی سرور سے جڑتی ہیں جس سے براؤزرز جڑتے ہیں، اس لیے کھلاڑی ایک ہی میز پر براؤزر اور ایپس ملا جلا کر کھیل سکتے ہیں۔",
    "stepsH2": "تین مراحل میں تیار کریں",
    "steps": [
      [
        "PokerTH سرور انسٹال کریں",
        "PokerTH منصوبے کی سرور گائیڈ پر عمل کرتے ہوئے PokerTH کے سورس سے pokerth_dedicated_server بنائیں — ورژن 2.1.10 یا اس کے بعد کا: اس کے لیے Qt 6.7 یا اس سے نیا، CMake اور C++23 کمپائلر درکار ہے۔ Linux ڈسٹری بیوشنز کا pokerth-server پیکج پرانا ورژن ہے۔ سرور TCP پورٹ 7234 پر سنتا ہے۔"
      ],
      [
        "ویب کلائنٹ انسٹال کریں",
        "Debian، Ubuntu یا Raspberry Pi OS پر انسٹالیشن اسکرپٹ ایک ہی کمانڈ میں Node.js، ویب کلائنٹ اور مشین کے ساتھ شروع ہونے والی سروس سیٹ کر دیتا ہے۔ Docker استعمال کرنے والے amd64، arm64 اور armv7 کے لیے تیار امیج کھینچ لیتے ہیں، اور CasaOS اسی Compose فائل کو ایپ کے طور پر امپورٹ کرتا ہے۔"
      ],
      [
        "کھیلیں",
        "اپنے نیٹ ورک کے کسی بھی ڈیوائس پر مشین کا پتہ پورٹ 8080 پر کھولیں، «LAN / مخصوص سرور» چنیں، ایک نام لکھیں اور میز بنائیں۔ PokerTH کے QML یا widget کلائنٹ والے کھلاڑی اسی مشین سے پورٹ 7234 پر جڑتے ہیں اور انہی میزوں میں شامل ہوتے ہیں۔"
      ]
    ],
    "piH2": "Raspberry Pi پر",
    "piP": "PokerTH چھوٹے پیغامات کا تبادلہ کرتا ہے اور ساری ڈرائنگ کھلاڑیوں کے آلات کرتے ہیں، اس لیے Raspberry Pi کافی سے زیادہ ہے: 2 GB والا Pi 4 بہترین انتخاب ہے، اور Pi 5 ضرورت سے بھی زیادہ ہے۔ ہموار شام کے لیے بورڈ سے زیادہ نیٹ ورک اہم ہے — Pi کو کیبل سے راؤٹر سے جوڑیں، اور کھلاڑیوں کے لیے اچھا Wi-Fi ایکسیس پوائنٹ استعمال کریں۔",
    "httpsH2": "LAN پر HTTP، اضافی سہولتوں کے لیے HTTPS",
    "httpsP": "آپ کے اپنے نیٹ ورک پر کھیل سادہ HTTP پر چلتا ہے۔ ایپ کو ہوم اسکرین پر انسٹال کرنے، آف لائن کھیلنے اور اطلاعات پانے کے لیے HTTPS درکار ہے، جسے گائیڈ Nginx اور مفت Let’s Encrypt سرٹیفکیٹ کے ساتھ سیٹ کرتی ہے۔",
    "adminH2": "براؤزر میں ایڈمن پینل",
    "adminP": "/admin پر ٹوکن سے محفوظ کنسول دکھاتا ہے کہ کون جڑا ہوا ہے، ویب کلائنٹ کو ایک کلک میں اپ ڈیٹ کرتا ہے اور اسے پچھلے ورژن پر واپس بھی لا سکتا ہے، کھلاڑیوں کو اعلانات بھیجتا ہے، لیڈر بورڈ ری سیٹ کرتا ہے، تاش کے ڈیک، میز کے انداز اور موسیقی انسٹال کرتا ہے، ان گیم سرورز کی فہرست رکھتا ہے جن تک کلائنٹ پہنچ سکتا ہے، اور ایسی کلیدیں دیتا ہے جو اس کے صرف کچھ حصے کھولتی ہیں۔",
    "shareH2": "باہر سے کھلاڑیوں کو مدعو کریں",
    "shareP": "دعوتی لنک اور QR کوڈ آپ کے سرور پر بالکل ویسے ہی کام کرتے ہیں جیسے pokerth.net پر: دوست لنک کھولتا ہے اور آپ کی میز پر بٹھا دیا جاتا ہے۔ اگر آپ کا سرور انٹرنیٹ سے قابل رسائی ہے تو آپ اسے ویب کلائنٹ کی عوامی سرور فہرست کے لیے تجویز بھی کر سکتے ہیں؛ ویب کلائنٹ کے ایڈمنز کی منظوری کے بعد یہ وہاں نظر آتا ہے۔",
    "guidesH2": "مرحلہ وار گائیڈز",
    "guides": [
      "PokerTH سرور سیٹ اپ گائیڈ",
      "سیلف ہوسٹنگ اور ایک کمانڈ سے انسٹالیشن",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "دستی انسٹالیشن اور HTTPS",
      "ایڈمن پینل"
    ],
    "faqH2": "سوالات",
    "faq": [
      [
        "کیا PokerTH سرور ہوسٹ کرنا مفت ہے؟",
        "جی ہاں۔ PokerTH سرور اور ویب کلائنٹ مفت اور اوپن سورس سافٹ ویئر ہیں؛ آپ کو انہیں چلانے کے لیے صرف ایک مشین چاہیے۔"
      ],
      [
        "مجھے کون سا ہارڈویئر چاہیے؟",
        "بہت کم: کوئی بھی PC یا ہوم سرور جو Linux یا Docker چلاتا ہو، یا Raspberry Pi 4 یا 5۔ پروسیسنگ طاقت سے زیادہ تار والا نیٹ ورک کنکشن اہم ہے۔"
      ],
      [
        "کیا کھلاڑیوں کو کچھ انسٹال کرنا پڑتا ہے؟",
        "نہیں۔ وہ اپنے فون، ٹیبلٹ یا کمپیوٹر کے براؤزر میں سرور کا پتہ کھولتے ہیں۔ جو ایپ کو ترجیح دیتے ہیں وہ PokerTH کا QML کلائنٹ یا کلاسک widget کلائنٹ استعمال کر سکتے ہیں: یہ اسی سرور سے جڑتے ہیں اور انہی میزوں پر کھیلتے ہیں۔"
      ],
      [
        "کیا اس کے لیے pokerth.net یا انٹرنیٹ کنکشن ضروری ہے؟",
        "نہیں۔ آپ کے مقامی نیٹ ورک پر سرور خود ہی چلتا ہے: کھلاڑی صرف ایک نام کے ساتھ براہِ راست اس سے جڑتے ہیں۔"
      ],
      [
        "کتنے کھلاڑی شامل ہو سکتے ہیں؟",
        "ہر میز پر زیادہ سے زیادہ 10 کھلاڑی، ساتھ میں تماشائی، اور جتنی میزیں آپ کے گروپ کو چاہییں۔"
      ]
    ]
  },
  uz: {
    "title": "Oʻz poker serveringiz — bepul, oʻzingizda joylashgan | PokerTH",
    "desc": "Uyda, klubda yoki maktabda shaxsiy Texas Hold’em serveri: bepul PokerTH serveri va veb-mijozi bitta buyruq bilan, Docker yordamida yoki Raspberry Pi’da oʻrnatiladi.",
    "ldHeadline": "Oʻz PokerTH poker serveringizni qanday ishga tushirish mumkin",
    "ldDesc": "PokerTH maxsus serveri va PokerTH veb-mijozi yordamida shaxsiy, oʻzingizda joylashgan Texas Hold’em serverini sozlang.",
    "h1": "Oʻz poker serveringizni ishga tushiring",
    "lead": "PokerTH boshidan oxirigacha bepul va ochiq manbali: oʻyin serveri ham, bu veb-mijoz ham oʻz kompyuteringizda ishlay oladi. Oilaviy oʻyin, klub kechasi, ofis ligasi yoki maktab uchun kompyuter, uy serveri yoki Raspberry Pi kifoya, shundan soʻng tarmogʻingizdagi har bir telefon, planshet yoki kompyuter brauzerda faqat taxallus bilan oʻynaydi.",
    "whyH2": "Nega oʻz serveringiz",
    "why": [
      [
        "Shaxsiy",
        "Oʻyinlaringiz oʻz kompyuteringiz va tarmogʻingizda qoladi; oʻyinchilarga na hisob, na elektron pochta manzili kerak, faqat taxallus."
      ],
      [
        "Oʻzingizga moslang",
        "Serverga oʻz nomini bering, kirish ekrani qaysi rejimlarni taklif qilishini tanlang, xush kelibsiz xabarini joylang va guruhingiz uchun umumiy reyting yuriting."
      ],
      [
        "Bepul",
        "Na litsenziya, na obuna, na reklama: PokerTH serveri ham, veb-mijoz ham erkin dasturiy taʼminotdir."
      ]
    ],
    "partsH2": "Ikki qism",
    "partsP": "PokerTH oʻyini uchun kartalarni tarqatadigan va stollarni boshqaradigan PokerTH maxsus serveri hamda ilovani brauzerlarga yetkazib, ularni shu serverga ulaydigan veb-mijoz kerak. Ikkalasi bitta kompyuterda ishlashi mumkin. Hammasi mos boʻlib qoladi: PokerTH ilovalari — Windows, macOS, Linux va Android uchun QML mijozi hamda kompyuter uchun klassik widget mijozi — brauzerlar ulanadigan shu serverga ulanadi, shuning uchun bitta stolda brauzerdan va ilovadan oʻynayotganlar birga oʻtira oladi.",
    "stepsH2": "Uch qadamda sozlang",
    "steps": [
      [
        "PokerTH serverini oʻrnating",
        "PokerTH loyihasining server qoʻllanmasiga amal qilib, pokerth_dedicated_server’ni PokerTH manba kodidan yigʻing — 2.1.10 yoki undan yangi versiya: buning uchun Qt 6.7 yoki yangiroq, CMake va C++23 kompilyatori kerak. Linux distributivlaridagi pokerth-server paketi eskiroq versiyadir. Server TCP 7234-portni tinglaydi."
      ],
      [
        "Veb-mijozni oʻrnating",
        "Debian, Ubuntu yoki Raspberry Pi OS’da oʻrnatish skripti bitta buyruq bilan Node.js’ni, veb-mijozni va kompyuter bilan birga ishga tushadigan xizmatni oʻrnatadi. Docker foydalanuvchilari amd64, arm64 va armv7 uchun tayyor obrazni yuklab oladi, CasaOS esa xuddi shu Compose faylini ilova sifatida import qiladi."
      ],
      [
        "Oʻynang",
        "Tarmogʻingizdagi istalgan qurilmada kompyuter manzilini 8080-portda oching, «LAN / Maxsus server» ni tanlang, taxallus kiriting va stol yarating. PokerTH QML yoki widget mijozidan foydalanadigan oʻyinchilar shu kompyuterga 7234-portda ulanadi va oʻsha stollarga qoʻshiladi."
      ]
    ],
    "piH2": "Raspberry Pi’da",
    "piP": "PokerTH kichik xabarlar almashadi, barcha chizishni esa oʻyinchilarning qurilmalari bajaradi, shuning uchun Raspberry Pi bemalol yetadi: 2 GB xotirali Pi 4 eng maqbul tanlov, Pi 5 esa keragidan ham ortiq. Bir tekis oʻtadigan kecha uchun tarmoq platadan muhimroq — Pi’ni routerga kabel bilan ulang va oʻyinchilar uchun yaxshi Wi-Fi kirish nuqtasidan foydalaning.",
    "httpsH2": "LAN’da HTTP, qoʻshimcha imkoniyatlar uchun HTTPS",
    "httpsP": "Oʻz tarmogʻingizda oʻyin oddiy HTTP orqali ishlaydi. Ilovani bosh ekranga oʻrnatish, oflayn oʻynash va bildirishnomalar olish uchun HTTPS kerak; qoʻllanma uni Nginx va bepul Let’s Encrypt sertifikati bilan sozlaydi.",
    "adminH2": "Brauzerdagi boshqaruv paneli",
    "adminP": "/admin manzilidagi token bilan himoyalangan konsol kim ulanganini koʻrsatadi, veb-mijozni bir bosishda yangilaydi va oldingi versiyaga qaytara oladi, oʻyinchilarga eʼlonlar yuboradi, reytingni nolga tushiradi, karta toʻplamlari, stol uslublari va musiqa oʻrnatadi, mijoz ulana oladigan oʻyin serverlari roʻyxatini yuritadi hamda uning faqat ayrim boʻlimlarini ochadigan kalitlar beradi.",
    "shareH2": "Tashqaridan oʻyinchilarni taklif qiling",
    "shareP": "Taklif havolalari va QR kodlar serveringizda ham pokerth.net’dagidek ishlaydi: doʻst havolani ochadi va stolingizga oʻtqaziladi. Agar serveringiz internetdan ochiq boʻlsa, uni veb-mijozning ommaviy serverlar roʻyxatiga ham taklif qilishingiz mumkin; veb-mijoz administratorlari tasdiqlagach, u oʻsha yerda paydo boʻladi.",
    "guidesH2": "Qadamma-qadam qoʻllanmalar",
    "guides": [
      "PokerTH serverini sozlash qoʻllanmasi",
      "Oʻzingizda joylashtirish va bitta buyruq bilan oʻrnatish",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Qoʻlda oʻrnatish va HTTPS",
      "Boshqaruv paneli"
    ],
    "faqH2": "Savollar",
    "faq": [
      [
        "PokerTH serverini joylashtirish bepulmi?",
        "Ha. PokerTH serveri va veb-mijoz bepul va ochiq manbali dasturlardir; sizga faqat ularni ishga tushiradigan kompyuter kerak."
      ],
      [
        "Menga qanday uskuna kerak?",
        "Juda oz: Linux yoki Docker ishlaydigan istalgan kompyuter yoki uy serveri, yoxud Raspberry Pi 4 yoki 5. Simli tarmoq ulanishi hisoblash quvvatidan muhimroq."
      ],
      [
        "Oʻyinchilar biror narsa oʻrnatishi kerakmi?",
        "Yoʻq. Ular server manzilini telefon, planshet yoki kompyuterdagi brauzerda ochadi. Ilovani afzal koʻrganlar PokerTH QML mijozi yoki klassik widget mijozidan foydalanishi mumkin: ular shu serverga ulanadi va oʻsha stollarda oʻynaydi."
      ],
      [
        "Buning uchun pokerth.net yoki internet ulanishi kerakmi?",
        "Yoʻq. Mahalliy tarmogʻingizdagi server mustaqil ishlaydi: oʻyinchilar unga toʻgʻridan-toʻgʻri, faqat taxallus bilan ulanadi."
      ],
      [
        "Nechta oʻyinchi qoʻshila oladi?",
        "Har bir stolda 10 tagacha oʻyinchi, qoʻshimcha ravishda tomoshabinlar, va guruhingizga qancha kerak boʻlsa, shuncha stol."
      ]
    ]
  },
  vi: {
    "title": "Tự dựng máy chủ poker riêng — miễn phí, tự host | PokerTH",
    "desc": "Máy chủ Texas Hold’em riêng tại nhà, câu lạc bộ hay trường học: máy chủ PokerTH và ứng dụng web miễn phí, cài bằng một lệnh, qua Docker hoặc trên Raspberry Pi.",
    "ldHeadline": "Cách tự dựng máy chủ poker PokerTH của riêng bạn",
    "ldDesc": "Dựng một máy chủ Texas Hold’em riêng, tự lưu trữ, với máy chủ chuyên dụng PokerTH và ứng dụng web PokerTH.",
    "h1": "Tự dựng máy chủ poker của riêng bạn",
    "lead": "PokerTH miễn phí và mã nguồn mở từ đầu đến cuối: máy chủ trò chơi và ứng dụng web này có thể chạy trên chính máy của bạn. Một PC, một máy chủ gia đình hoặc một Raspberry Pi là đủ cho một ván chơi gia đình, một buổi tối ở câu lạc bộ, một giải đấu ở văn phòng hay một trường học, và khi đó mọi điện thoại, máy tính bảng hay máy tính trong mạng của bạn đều chơi trên trình duyệt chỉ với một biệt danh.",
    "whyH2": "Vì sao nên có máy chủ riêng",
    "why": [
      [
        "Riêng tư",
        "Các ván chơi của bạn nằm trên máy và trong mạng của bạn; người chơi không cần tài khoản, không cần địa chỉ email, chỉ cần một biệt danh."
      ],
      [
        "Tùy biến theo ý bạn",
        "Đặt tên riêng cho máy chủ, chọn các chế độ mà màn hình đăng nhập cung cấp, đăng lời chào mừng và duy trì một bảng xếp hạng chung cho nhóm của bạn."
      ],
      [
        "Miễn phí",
        "Không giấy phép, không thuê bao, không quảng cáo: máy chủ PokerTH và ứng dụng web đều là phần mềm tự do."
      ]
    ],
    "partsH2": "Hai thành phần",
    "partsP": "Một ván PokerTH cần máy chủ chuyên dụng PokerTH, nơi chia bài và điều hành các bàn, và ứng dụng web, nơi phục vụ ứng dụng cho trình duyệt và kết nối chúng với máy chủ đó. Cả hai có thể chạy trên cùng một máy. Mọi thứ vẫn tương thích: các ứng dụng PokerTH — ứng dụng QML trên Windows, macOS, Linux và Android, và ứng dụng widget cổ điển trên máy tính để bàn — kết nối tới cùng máy chủ với trình duyệt, nên người chơi có thể kết hợp trình duyệt và ứng dụng tại cùng một bàn.",
    "stepsH2": "Cài đặt trong ba bước",
    "steps": [
      [
        "Cài máy chủ PokerTH",
        "Biên dịch pokerth_dedicated_server từ mã nguồn PokerTH — phiên bản 2.1.10 trở lên — theo hướng dẫn máy chủ của dự án PokerTH: cần Qt 6.7 trở lên, CMake và một trình biên dịch C++23. Gói pokerth-server của các bản phân phối Linux là phiên bản cũ hơn. Máy chủ lắng nghe trên cổng TCP 7234."
      ],
      [
        "Cài ứng dụng web",
        "Trên Debian, Ubuntu hoặc Raspberry Pi OS, tập lệnh cài đặt thiết lập Node.js, ứng dụng web và một dịch vụ khởi động cùng máy, chỉ bằng một lệnh. Người dùng Docker kéo về một image dựng sẵn cho amd64, arm64 và armv7, còn CasaOS nhập cùng tệp Compose đó như một ứng dụng."
      ],
      [
        "Chơi",
        "Trên bất kỳ thiết bị nào trong mạng của bạn, mở địa chỉ của máy ở cổng 8080, chọn “LAN / Máy chủ riêng”, nhập biệt danh và tạo bàn. Người chơi dùng ứng dụng QML hoặc widget của PokerTH kết nối tới cùng máy đó ở cổng 7234 và vào cùng các bàn."
      ]
    ],
    "piH2": "Trên Raspberry Pi",
    "piP": "PokerTH chỉ trao đổi những tin nhắn nhỏ và mọi việc hiển thị đều do thiết bị của người chơi đảm nhận, nên Raspberry Pi là quá đủ: Pi 4 bản 2 GB là lựa chọn lý tưởng, Pi 5 thì dư sức. Để buổi tối suôn sẻ, mạng quan trọng hơn bo mạch — hãy cắm dây Pi vào router và dùng một điểm truy cập Wi-Fi tốt cho người chơi.",
    "httpsH2": "HTTP trong mạng LAN, HTTPS cho các tính năng thêm",
    "httpsP": "Trong mạng của riêng bạn, trò chơi chạy qua HTTP thông thường. Việc cài ứng dụng lên màn hình chính, chơi offline và nhận thông báo cần HTTPS, mà hướng dẫn thiết lập bằng Nginx và một chứng chỉ Let’s Encrypt miễn phí.",
    "adminH2": "Bảng quản trị ngay trên trình duyệt",
    "adminP": "Một bảng điều khiển được bảo vệ bằng token tại /admin cho biết ai đang kết nối, cập nhật ứng dụng web chỉ bằng một cú nhấp và có thể quay lại bản trước, gửi thông báo cho người chơi, đặt lại bảng xếp hạng, cài bộ bài, kiểu bàn và nhạc, liệt kê các máy chủ trò chơi mà ứng dụng được phép kết nối, và cấp các khóa chỉ mở một số mục của nó.",
    "shareH2": "Mời người chơi từ bên ngoài",
    "shareP": "Liên kết mời và mã QR hoạt động trên máy chủ của bạn y như trên pokerth.net: một người bạn mở liên kết là được xếp vào bàn của bạn. Nếu máy chủ của bạn truy cập được từ internet, bạn cũng có thể đề xuất nó vào danh sách máy chủ công khai của ứng dụng web; nó sẽ xuất hiện ở đó khi quản trị viên của ứng dụng web phê duyệt.",
    "guidesH2": "Hướng dẫn từng bước",
    "guides": [
      "Hướng dẫn cài đặt máy chủ PokerTH",
      "Tự lưu trữ và cài đặt bằng một lệnh",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Cài đặt thủ công và HTTPS",
      "Bảng quản trị"
    ],
    "faqH2": "Câu hỏi",
    "faq": [
      [
        "Tự dựng máy chủ PokerTH có miễn phí không?",
        "Có. Máy chủ PokerTH và ứng dụng web là phần mềm miễn phí, mã nguồn mở; bạn chỉ cần một máy để chạy chúng."
      ],
      [
        "Tôi cần phần cứng gì?",
        "Rất ít: bất kỳ PC hay máy chủ gia đình nào chạy Linux hoặc Docker, hoặc một Raspberry Pi 4 hay 5. Kết nối mạng có dây quan trọng hơn sức mạnh xử lý."
      ],
      [
        "Người chơi có phải cài gì không?",
        "Không. Họ mở địa chỉ máy chủ trên trình duyệt của điện thoại, máy tính bảng hoặc máy tính. Ai thích dùng ứng dụng có thể dùng ứng dụng QML của PokerTH hoặc ứng dụng widget cổ điển: các ứng dụng này kết nối tới cùng máy chủ và chơi ở cùng các bàn."
      ],
      [
        "Có cần pokerth.net hay kết nối internet không?",
        "Không. Máy chủ trong mạng nội bộ của bạn tự hoạt động: người chơi kết nối thẳng tới nó, chỉ với một biệt danh."
      ],
      [
        "Có thể có bao nhiêu người chơi?",
        "Tối đa 10 người chơi mỗi bàn, cộng thêm người xem, và bao nhiêu bàn tùy nhóm của bạn cần."
      ]
    ]
  },
  yo: {
    "title": "Gbé olùpín poker tìrẹ kalẹ̀ — ọ̀fẹ́, lórí ẹ̀rọ rẹ | PokerTH",
    "desc": "Olùpín Texas Hold’em aládàáni nílé, ní ẹgbẹ́ tàbí ilé-ìwé: olùpín àti oníbàárà wẹ́ẹ̀bù PokerTH ọ̀fẹ́, pẹ̀lú àṣẹ kan, pẹ̀lú Docker tàbí lórí Raspberry Pi.",
    "ldHeadline": "Bí o ṣe lè gbé olùpín poker PokerTH tìrẹ kalẹ̀",
    "ldDesc": "Ṣètò olùpín Texas Hold’em aládàáni lórí ẹ̀rọ tìrẹ pẹ̀lú olùpín àdáni PokerTH àti oníbàárà wẹ́ẹ̀bù PokerTH.",
    "h1": "Gbé olùpín poker tìrẹ kalẹ̀",
    "lead": "PokerTH jẹ́ ọ̀fẹ́ àti orísun ṣíṣí láti ìbẹ̀rẹ̀ dé òpin: olùpín eré àti oníbàárà wẹ́ẹ̀bù yìí lè ṣiṣẹ́ lórí ẹ̀rọ tìrẹ. PC kan, olùpín ilé tàbí Raspberry Pi ti tó fún eré ẹbí, alẹ́ ẹgbẹ́, ìdíje ọ́fíìsì tàbí ilé-ìwé, lẹ́yìn náà gbogbo fóònù, tábúlẹ́ẹ̀tì tàbí kọ̀ǹpútà lórí nẹ́tíwọ̀ọ̀kì rẹ yóò ṣeré nínú aṣàwákiri rẹ̀ pẹ̀lú orúkọ ìnagijẹ nìkan.",
    "whyH2": "Ìdí tí o fi máa ní tìrẹ",
    "why": [
      [
        "Aládàáni",
        "Àwọn eré rẹ wà lórí ẹ̀rọ rẹ àti nẹ́tíwọ̀ọ̀kì rẹ; àwọn òṣèré kò nílò àkáǹtì tàbí àdírẹ́sì ímeèlì, orúkọ ìnagijẹ nìkan ni wọ́n nílò."
      ],
      [
        "Bí o ṣe fẹ́",
        "Fún olùpín náà ní orúkọ tirẹ̀, yan àwọn ọ̀nà eré tí ojú-ìwé ìwọlé yóò fúnni, fi ọ̀rọ̀ ìkíni sílẹ̀, kí o sì tọ́jú àkójọ olùborí kan náà fún ẹgbẹ́ rẹ."
      ],
      [
        "Ọ̀fẹ́",
        "Kò sí ìwé-àṣẹ, kò sí owó ìforúkọsílẹ̀, kò sí ìpolówó: olùpín PokerTH àti oníbàárà wẹ́ẹ̀bù jẹ́ sọ́fítíwọ̀ ọ̀fẹ́ méjèèjì."
      ]
    ],
    "partsH2": "Apá méjì",
    "partsP": "Eré PokerTH nílò olùpín àdáni PokerTH, tí ń pín káàdì tí ó sì ń ṣàkóso àwọn tábìlì, àti oníbàárà wẹ́ẹ̀bù, tí ń fi áàpù ránṣẹ́ sí àwọn aṣàwákiri tí ó sì ń so wọ́n mọ́ olùpín náà. Wọ́n lè ṣiṣẹ́ lórí ẹ̀rọ kan náà. Gbogbo rẹ̀ ṣì bá ara wọn mu: àwọn áàpù PokerTH ń sopọ̀ mọ́ olùpín kan náà bí àwọn aṣàwákiri — oníbàárà QML lórí Windows, macOS, Linux àti Android, àti oníbàárà widget àtijọ́ lórí kọ̀ǹpútà — nítorí náà àwọn òṣèré lè da aṣàwákiri àti áàpù pọ̀ ní tábìlì kan.",
    "stepsH2": "Ṣètò rẹ̀ ní ìgbésẹ̀ mẹ́ta",
    "steps": [
      [
        "Fi olùpín PokerTH sórí ẹ̀rọ",
        "Kọ́ pokerth_dedicated_server láti inú orísun PokerTH — ẹ̀yà 2.1.10 tàbí èyí tó tuntun jù — nípa títẹ̀lé ìtọ́sọ́nà olùpín ti iṣẹ́ akanṣe PokerTH: ó nílò Qt 6.7 tàbí èyí tó tuntun jù, CMake àti olùkójọ C++23 kan. Àpò pokerth-server ti àwọn ìpínkiri Linux jẹ́ ẹ̀yà àtijọ́. Olùpín náà ń tẹ́tí sí pọ́ọ̀tù TCP 7234."
      ],
      [
        "Fi oníbàárà wẹ́ẹ̀bù sórí ẹ̀rọ",
        "Lórí Debian, Ubuntu tàbí Raspberry Pi OS, skríìpù ìfisórí ẹ̀rọ ń ṣètò Node.js, oníbàárà wẹ́ẹ̀bù àti iṣẹ́ kan tí ń bẹ̀rẹ̀ pẹ̀lú ẹ̀rọ náà, pẹ̀lú àṣẹ kan ṣoṣo. Àwọn tó ń lo Docker ń gba àwòrán tí a ti ṣe tán fún amd64, arm64 àti armv7, CasaOS sì ń gbé fáìlì Compose kan náà wọlé gẹ́gẹ́ bí áàpù."
      ],
      [
        "Ṣeré",
        "Lórí ẹ̀rọ èyíkéyìí nínú nẹ́tíwọ̀ọ̀kì rẹ, ṣí àdírẹ́sì ẹ̀rọ náà lórí pọ́ọ̀tù 8080, yan LAN / Olùpín àdáni, tẹ orúkọ ìnagijẹ kan kí o sì ṣẹ̀dá tábìlì. Àwọn òṣèré tí ń lo oníbàárà QML tàbí widget ti PokerTH ń sopọ̀ mọ́ ẹ̀rọ kan náà lórí pọ́ọ̀tù 7234, wọ́n sì ń darapọ̀ mọ́ àwọn tábìlì kan náà."
      ]
    ],
    "piH2": "Lórí Raspberry Pi",
    "piP": "PokerTH ń pàṣípààrọ̀ àwọn ìfiránṣẹ́ kékeré, àwọn ẹ̀rọ àwọn òṣèré sì ni wọ́n ń ya gbogbo àwòrán, nítorí náà Raspberry Pi ti tó dáadáa: Pi 4 pẹ̀lú 2 GB ni ó dára jù, Pi 5 sì ju ohun tí a nílò lọ. Fún alẹ́ tí kò ní ìdíwọ́, nẹ́tíwọ̀ọ̀kì ṣe pàtàkì ju bọ́ọ̀dù lọ — fi wáyà so Pi mọ́ ráútà, kí o sì lo ibi ìwọlé Wi-Fi tó dára fún àwọn òṣèré.",
    "httpsH2": "HTTP lórí LAN, HTTPS fún àwọn àfikún",
    "httpsP": "Lórí nẹ́tíwọ̀ọ̀kì tìrẹ, eré náà ń ṣiṣẹ́ lórí HTTP lásán. Fífi áàpù sí ojú-ìwé àkọ́kọ́, ṣíṣeré láìsí ìsopọ̀ àti gbígba àwọn ìfitónilétí nílò HTTPS, èyí tí ìtọ́sọ́nà náà ń ṣètò pẹ̀lú Nginx àti ìwé-ẹ̀rí Let’s Encrypt ọ̀fẹ́.",
    "adminH2": "Pánẹ́ẹ̀lì alábòójútó nínú aṣàwákiri",
    "adminP": "Kọ́ńsólù kan ní /admin tí tókìnì ń dáàbò bò ń fi ẹni tí ó ti sopọ̀ hàn, ó ń ṣe àtúnṣe oníbàárà wẹ́ẹ̀bù pẹ̀lú títẹ̀ kan, ó sì lè dá a padà sí ẹ̀yà ti tẹ́lẹ̀, ó ń fi ìkéde ránṣẹ́ sí àwọn òṣèré, ó ń tún àkójọ olùborí bẹ̀rẹ̀ láti òdo, ó ń fi àwọn àkójọ káàdì, àwọn àṣà tábìlì àti orin sórí ẹ̀rọ, ó ń ṣe àkójọ àwọn olùpín eré tí oníbàárà lè dé, ó sì ń pín àwọn kọ́kọ́rọ́ tí ń ṣí díẹ̀ nínú àwọn apá rẹ̀ nìkan.",
    "shareH2": "Pe àwọn òṣèré láti òde",
    "shareP": "Àwọn ìjápọ̀ ìpè àti QR code ń ṣiṣẹ́ lórí olùpín rẹ gẹ́gẹ́ bí wọ́n ṣe ń ṣiṣẹ́ lórí pokerth.net: ọ̀rẹ́ kan ṣí ìjápọ̀ náà, ó sì jókòó sí tábìlì rẹ. Bí a bá lè dé olùpín rẹ láti orí ayélujára, o tún lè dábàá rẹ̀ fún àkójọ olùpín gbangba ti oníbàárà wẹ́ẹ̀bù; yóò fara hàn níbẹ̀ nígbà tí àwọn alábòójútó oníbàárà wẹ́ẹ̀bù bá fọwọ́ sí i.",
    "guidesH2": "Àwọn ìtọ́sọ́nà ìgbésẹ̀-sí-ìgbésẹ̀",
    "guides": [
      "Ìtọ́sọ́nà ìṣètò olùpín PokerTH",
      "Gbígbàlejò fúnra rẹ àti ìfisórí ẹ̀rọ pẹ̀lú àṣẹ kan",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ìfisórí ẹ̀rọ pẹ̀lú ọwọ́ àti HTTPS",
      "Pánẹ́ẹ̀lì alábòójútó"
    ],
    "faqH2": "Àwọn ìbéèrè",
    "faq": [
      [
        "Ṣé ọ̀fẹ́ ni láti gbé olùpín PokerTH kalẹ̀?",
        "Bẹ́ẹ̀ ni. Olùpín PokerTH àti oníbàárà wẹ́ẹ̀bù jẹ́ sọ́fítíwọ̀ ọ̀fẹ́ àti orísun ṣíṣí; ẹ̀rọ kan láti ṣiṣẹ́ wọn nìkan ni o nílò."
      ],
      [
        "Ohun èlò wo ni mo nílò?",
        "Díẹ̀ ni: PC èyíkéyìí tàbí olùpín ilé tí ń ṣiṣẹ́ Linux tàbí Docker, tàbí Raspberry Pi 4 tàbí 5. Ìsopọ̀ nẹ́tíwọ̀ọ̀kì oníwáyà ṣe pàtàkì ju agbára ìṣiṣẹ́ lọ."
      ],
      [
        "Ṣé àwọn òṣèré ní láti fi nǹkan kan sórí ẹ̀rọ?",
        "Rárá. Wọ́n á ṣí àdírẹ́sì olùpín náà nínú aṣàwákiri lórí fóònù, tábúlẹ́ẹ̀tì tàbí kọ̀ǹpútà wọn. Àwọn tí ó fẹ́ áàpù lè lo oníbàárà QML ti PokerTH tàbí oníbàárà widget àtijọ́: wọ́n ń sopọ̀ mọ́ olùpín kan náà, wọ́n sì ń ṣeré ní àwọn tábìlì kan náà."
      ],
      [
        "Ṣé ó nílò pokerth.net tàbí ìsopọ̀ ayélujára?",
        "Rárá. Olùpín kan lórí nẹ́tíwọ̀ọ̀kì agbègbè rẹ ń ṣiṣẹ́ fúnra rẹ̀: àwọn òṣèré ń sopọ̀ mọ́ ọn tààrà, pẹ̀lú orúkọ ìnagijẹ nìkan."
      ],
      [
        "Òṣèré mélòó ló lè darapọ̀?",
        "Títí dé òṣèré 10 ní tábìlì kọ̀ọ̀kan, pẹ̀lú àwọn òǹwòran, àti iye tábìlì tí ẹgbẹ́ rẹ bá nílò."
      ]
    ]
  },
  zh: {
    "title": "搭建自己的德州扑克服务器 — 免费自托管 | PokerTH",
    "desc": "在家、俱乐部或学校搭建私人德州扑克服务器：免费的 PokerTH 服务器和网页版客户端，一条命令即可部署，可用 Docker 或装在 Raspberry Pi 上。",
    "ldHeadline": "如何搭建自己的 PokerTH 扑克服务器",
    "ldDesc": "使用 PokerTH 专用服务器和 PokerTH 网页版客户端，搭建一台私有、自托管的德州扑克服务器。",
    "h1": "搭建自己的扑克服务器",
    "lead": "PokerTH 从头到尾都是免费开源的：游戏服务器和这个网页版客户端都可以运行在你自己的机器上。一台电脑、家用服务器或 Raspberry Pi 就足以应付家庭牌局、俱乐部之夜、办公室联赛或学校使用，之后你网络中的每部手机、平板或电脑只需一个昵称就能在浏览器里玩。",
    "whyH2": "为什么要自己架设",
    "why": [
      [
        "私密",
        "牌局只留在你的机器和你的网络里；玩家不需要账号，也不需要电子邮箱，只要一个昵称。"
      ],
      [
        "随你定制",
        "给服务器起个名字，选择登录界面提供哪些模式，发布欢迎消息，并为你的圈子保留一份共享排行榜。"
      ],
      [
        "免费",
        "没有许可费，没有订阅，没有广告：PokerTH 服务器和网页版客户端都是自由软件。"
      ]
    ],
    "partsH2": "两个组成部分",
    "partsP": "一局 PokerTH 需要两样东西：PokerTH 专用服务器，负责发牌和运行牌桌；以及网页版客户端，负责向浏览器提供应用，并把它们连接到该服务器。两者可以运行在同一台机器上。一切保持兼容：PokerTH 应用——Windows、macOS、Linux 和 Android 上的 QML 客户端，以及桌面上的经典 widget 客户端——与浏览器连接同一台服务器，因此同一张牌桌上可以同时有浏览器玩家和应用玩家。",
    "stepsH2": "三步完成搭建",
    "steps": [
      [
        "安装 PokerTH 服务器",
        "按照 PokerTH 项目的服务器指南，从 PokerTH 源代码编译 pokerth_dedicated_server（2.1.10 或更高版本）：需要 Qt 6.7 或更新版本、CMake 以及支持 C++23 的编译器。Linux 发行版中的 pokerth-server 软件包是较旧的版本。服务器监听 TCP 端口 7234。"
      ],
      [
        "安装网页版客户端",
        "在 Debian、Ubuntu 或 Raspberry Pi OS 上，安装脚本只需一条命令即可装好 Node.js、网页版客户端以及一个随开机启动的服务。Docker 用户可以拉取适用于 amd64、arm64 和 armv7 的现成镜像，CasaOS 则可将同一个 Compose 文件作为应用导入。"
      ],
      [
        "开始玩",
        "在你网络中的任意设备上，打开这台机器的地址（端口 8080），选择局域网 / 专用服务器，输入昵称并创建牌桌。使用 PokerTH QML 或 widget 客户端的玩家通过端口 7234 连接到同一台机器，并加入相同的牌桌。"
      ]
    ],
    "piH2": "在 Raspberry Pi 上",
    "piP": "PokerTH 只交换很小的消息，所有画面都由玩家的设备绘制，所以一台 Raspberry Pi 完全够用：2 GB 内存的 Pi 4 是最佳选择，Pi 5 更是绰绰有余。想让牌局流畅，网络比主板更重要——用网线把 Pi 接到路由器上，并为玩家准备一个好的 Wi-Fi 接入点。",
    "httpsH2": "局域网用 HTTP，附加功能用 HTTPS",
    "httpsP": "在你自己的网络中，游戏通过普通 HTTP 即可运行。把应用安装到主屏幕、离线游玩和接收通知需要 HTTPS，指南会用 Nginx 和免费的 Let’s Encrypt 证书来配置。",
    "adminH2": "浏览器中的管理面板",
    "adminP": "位于 /admin 的令牌保护控制台可以显示谁已连接，一键更新网页版客户端并可回滚，向玩家发送公告，重置排行榜，安装牌面、牌桌样式和音乐，列出客户端可以连接的游戏服务器，还能分发只解锁部分功能区的密钥。",
    "shareH2": "邀请外部玩家",
    "shareP": "邀请链接和二维码在你的服务器上和在 pokerth.net 上一样有效：朋友打开链接就会坐到你的牌桌上。如果你的服务器可以从互联网访问，你还可以申请将它加入网页版客户端的公共服务器列表；网页版客户端的管理员批准后，它就会出现在列表中。",
    "guidesH2": "分步指南",
    "guides": [
      "PokerTH 服务器搭建指南",
      "自托管与一条命令安装",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "手动安装与 HTTPS",
      "管理面板"
    ],
    "faqH2": "常见问题",
    "faq": [
      [
        "搭建 PokerTH 服务器免费吗？",
        "免费。PokerTH 服务器和网页版客户端都是免费开源软件；你只需要一台机器来运行它们。"
      ],
      [
        "需要什么硬件？",
        "要求很低：任何运行 Linux 或 Docker 的电脑或家用服务器，或者一台 Raspberry Pi 4 或 5。有线网络连接比处理器性能更重要。"
      ],
      [
        "玩家需要安装什么吗？",
        "不需要。他们在手机、平板或电脑的浏览器中打开服务器地址即可。喜欢应用的玩家可以使用 PokerTH QML 客户端或经典 widget 客户端：它们连接同一台服务器，在相同的牌桌上游戏。"
      ],
      [
        "需要 pokerth.net 或互联网连接吗？",
        "不需要。局域网中的服务器可以独立运行：玩家只需一个昵称即可直接连接。"
      ],
      [
        "最多可以有多少玩家加入？",
        "每桌最多 10 名玩家，另加观众；牌桌数量按你的圈子需要随意开。"
      ]
    ]
  },
  "zh-HK": {
    "title": "架設自己的撲克伺服器 — 免費、自行託管 | PokerTH",
    "desc": "在家、社團或學校架設私人 Texas Hold’em 德州撲克伺服器：免費的 PokerTH 伺服器和網頁版客戶端，一條指令即可安裝，可用 Docker 或在 Raspberry Pi 上運行。",
    "ldHeadline": "如何架設你自己的 PokerTH 撲克伺服器",
    "ldDesc": "用 PokerTH 專用伺服器和 PokerTH 網頁版客戶端，架設一個私人、自行託管的 Texas Hold’em 德州撲克伺服器。",
    "h1": "架設你自己的撲克伺服器",
    "lead": "PokerTH 由頭到尾都是免費的開源軟件：遊戲伺服器和這個網頁版客戶端都可以在你自己的機器上運行。一部電腦、一台家用伺服器或一部 Raspberry Pi，就足以應付家庭牌局、社團聚會、辦公室聯賽或學校使用，之後你網絡上的每部手機、平板電腦或電腦，只需一個暱稱就能在瀏覽器裡玩。",
    "whyH2": "為何要自己架設",
    "why": [
      [
        "私隱",
        "你的牌局只留在你的機器和網絡上；玩家無須帳戶，也無須電郵地址，只需一個暱稱。"
      ],
      [
        "由你作主",
        "為伺服器起一個專屬名稱，選擇登入畫面提供哪些模式，發佈歡迎訊息，並為你的圈子保留一個共用排行榜。"
      ],
      [
        "免費",
        "無須授權費、無須訂閱、沒有廣告：PokerTH 伺服器和網頁版客戶端都是自由軟件。"
      ]
    ],
    "partsH2": "兩個部分",
    "partsP": "一局 PokerTH 需要 PokerTH 專用伺服器負責發牌和管理牌桌，也需要網頁版客戶端把應用程式提供給瀏覽器，並把它們連接到該伺服器。兩者可以在同一部機器上運行。一切保持相容：PokerTH 應用程式——Windows、macOS、Linux 和 Android 上的 QML 客戶端，以及桌面版的經典 widget 客戶端——都會連接到與瀏覽器相同的伺服器，因此同一張牌桌上可以同時有用瀏覽器和用應用程式的玩家。",
    "stepsH2": "三個步驟完成架設",
    "steps": [
      [
        "安裝 PokerTH 伺服器",
        "按照 PokerTH 項目的伺服器指南，從 PokerTH 原始碼編譯 pokerth_dedicated_server（2.1.10 或更新版本）：需要 Qt 6.7 或更新版本、CMake 和 C++23 編譯器。Linux 發行版的 pokerth-server 套件是較舊的版本。伺服器在 TCP 7234 端口監聽。"
      ],
      [
        "安裝網頁版客戶端",
        "在 Debian、Ubuntu 或 Raspberry Pi OS 上，安裝腳本只需一條指令，就會設定好 Node.js、網頁版客戶端和一個隨機器啟動的服務。Docker 用戶可拉取適用於 amd64、arm64 和 armv7 的現成映像檔，CasaOS 則會把同一個 Compose 檔案匯入為應用程式。"
      ],
      [
        "開始玩",
        "在你網絡上的任何裝置，打開該機器 8080 端口的地址，選擇「區域網絡 / 專用伺服器」，輸入暱稱，然後開一張牌桌。使用 PokerTH QML 或 widget 客戶端的玩家，會經 7234 端口連接到同一部機器，並加入相同的牌桌。"
      ]
    ],
    "piH2": "在 Raspberry Pi 上",
    "piP": "PokerTH 只交換細小的訊息，所有畫面都由玩家的裝置繪製，所以一部 Raspberry Pi 已經足夠：2 GB 的 Pi 4 是最佳選擇，Pi 5 更是綽綽有餘。想整晚玩得順暢，網絡比主機板更重要——用網線把 Pi 接到路由器，並為玩家準備一個好的 Wi-Fi 接入點。",
    "httpsH2": "區域網絡用 HTTP，額外功能用 HTTPS",
    "httpsP": "在你自己的網絡上，遊戲用普通 HTTP 就能運作。把應用程式安裝到主畫面、離線遊玩和接收通知則需要 HTTPS，指南會用 Nginx 和免費的 Let’s Encrypt 證書來設定。",
    "adminH2": "瀏覽器裡的管理面板",
    "adminP": "位於 /admin、以權杖保護的控制台會顯示誰在線上，一按即可更新網頁版客戶端，也可以回復到先前版本；它還能向玩家發送公告、重設排行榜、安裝撲克牌組、牌桌樣式和音樂、列出客戶端可以連接的遊戲伺服器，並發出只能解鎖部分功能區的金鑰。",
    "shareH2": "邀請外面的玩家",
    "shareP": "邀請連結和 QR 碼在你的伺服器上的用法和在 pokerth.net 上完全一樣：朋友打開連結，就會坐到你的牌桌。如果你的伺服器可以從互聯網連接，你也可以把它提交到網頁版客戶端的公開伺服器列表；網頁版客戶端的管理員批准後，它就會出現在列表上。",
    "guidesH2": "逐步指南",
    "guides": [
      "PokerTH 伺服器設定指南",
      "自行託管及一條指令安裝",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "手動安裝及 HTTPS",
      "管理面板"
    ],
    "faqH2": "問題",
    "faq": [
      [
        "架設 PokerTH 伺服器是免費的嗎？",
        "是的。PokerTH 伺服器和網頁版客戶端都是免費的開源軟件；你只需要一部機器來運行它們。"
      ],
      [
        "我需要甚麼硬件？",
        "很少：任何運行 Linux 或 Docker 的電腦或家用伺服器，或一部 Raspberry Pi 4 或 5。有線網絡連接比運算能力更重要。"
      ],
      [
        "玩家需要安裝任何東西嗎？",
        "不需要。他們在手機、平板電腦或電腦的瀏覽器中打開伺服器的地址即可。偏好應用程式的人可以使用 PokerTH QML 客戶端或經典 widget 客戶端：它們連接到同一個伺服器，可在相同的牌桌上遊戲。"
      ],
      [
        "需要 pokerth.net 或互聯網連接嗎？",
        "不需要。區域網絡上的伺服器可以獨立運作：玩家只需一個暱稱，就能直接連接到它。"
      ],
      [
        "最多可以有多少位玩家加入？",
        "每桌最多 10 位玩家，另加觀眾，牌桌數量則按你的圈子所需而定。"
      ]
    ]
  },
  "zh-TW": {
    "title": "架設自己的撲克伺服器 — 免費、自架 | PokerTH",
    "desc": "在家裡、社團或學校架設私人德州撲克伺服器：免費的 PokerTH 伺服器和網頁版，一行指令就能安裝，可以用 Docker，也能裝在 Raspberry Pi 上。",
    "ldHeadline": "如何架設自己的 PokerTH 撲克伺服器",
    "ldDesc": "用 PokerTH 專用伺服器和 PokerTH 網頁版，架設一台私人、自架的德州撲克伺服器。",
    "h1": "架設自己的撲克伺服器",
    "lead": "PokerTH 從頭到尾都是免費的開放原始碼軟體：遊戲伺服器和這個網頁版都能在你自己的機器上執行。一台電腦、一台家用伺服器或一片 Raspberry Pi，就足以應付家庭牌局、社團聚會、辦公室聯賽或學校使用；之後你網路上的每支手機、每台平板或電腦，只要一個暱稱就能在瀏覽器裡玩。",
    "whyH2": "為什麼要自己架",
    "why": [
      [
        "私密",
        "牌局只留在你的機器和你的網路上；玩家不需要帳號，也不需要電子郵件地址，只要一個暱稱。"
      ],
      [
        "隨你打造",
        "幫伺服器取個專屬名稱、選擇登入畫面要提供哪些模式、發布歡迎訊息，並為你的團體保留一份共用的排行榜。"
      ],
      [
        "免費",
        "不用授權費、不用訂閱、沒有廣告：PokerTH 伺服器和網頁版都是自由軟體。"
      ]
    ],
    "partsH2": "兩個部分",
    "partsP": "一場 PokerTH 牌局需要 PokerTH 專用伺服器負責發牌和管理牌桌，也需要網頁版把應用程式提供給瀏覽器，並讓瀏覽器連上這台伺服器。兩者可以在同一台機器上執行。一切都保持相容：PokerTH 應用程式和瀏覽器連上同一台伺服器——包括 Windows、macOS、Linux 和 Android 上的 QML 用戶端，以及桌面上的經典 widget 用戶端——所以同一張牌桌上可以同時有用瀏覽器和用應用程式的玩家。",
    "stepsH2": "三個步驟完成架設",
    "steps": [
      [
        "安裝 PokerTH 伺服器",
        "依照 PokerTH 專案的伺服器指南，從 PokerTH 原始碼建置 pokerth_dedicated_server——版本須為 2.1.10 或更新：需要 Qt 6.7 或更新版本、CMake 和 C++23 編譯器。Linux 發行版的 pokerth-server 套件是較舊的版本。伺服器監聽 TCP 連接埠 7234。"
      ],
      [
        "安裝網頁版",
        "在 Debian、Ubuntu 或 Raspberry Pi OS 上，安裝腳本只要一行指令，就會設定好 Node.js、網頁版，以及隨機器開機啟動的服務。Docker 使用者可以拉取適用於 amd64、arm64 和 armv7 的現成映像檔，CasaOS 則能把同一個 Compose 檔案匯入為應用程式。"
      ],
      [
        "開始玩",
        "在你網路上的任何裝置上，用 8080 連接埠打開那台機器的位址，選擇「區域網路 / 專用伺服器」，輸入暱稱，然後開一桌。使用 PokerTH QML 或 widget 用戶端的玩家，透過 7234 連接埠連上同一台機器，加入同樣的牌桌。"
      ]
    ],
    "piH2": "在 Raspberry Pi 上",
    "piP": "PokerTH 只交換很小的訊息，所有畫面都由玩家的裝置繪製，所以一片 Raspberry Pi 綽綽有餘：2 GB 的 Pi 4 是最理想的選擇，Pi 5 更是遊刃有餘。想要整晚順暢，網路比主機板更重要——用網路線把 Pi 接到路由器，並為玩家準備一個好的 Wi-Fi 基地台。",
    "httpsH2": "區域網路用 HTTP，額外功能用 HTTPS",
    "httpsP": "在你自己的網路上，遊戲用一般的 HTTP 就能運作。把應用程式安裝到主畫面、離線遊玩和接收通知則需要 HTTPS，指南會用 Nginx 和免費的 Let’s Encrypt 憑證幫你設定好。",
    "adminH2": "瀏覽器裡的管理面板",
    "adminP": "位於 /admin、以權杖保護的主控台可以顯示誰在線上、一鍵更新網頁版並可還原到前一版、向玩家發送公告、重設排行榜、安裝牌組、牌桌風格和音樂、列出用戶端可以連線的遊戲伺服器，還能發放只解鎖部分區塊的金鑰。",
    "shareH2": "邀請外面的玩家",
    "shareP": "邀請連結和 QR 碼在你的伺服器上和在 pokerth.net 上一樣好用：朋友打開連結，就會坐到你的牌桌上。如果你的伺服器可以從網際網路連線，你也可以把它推薦到網頁版的公開伺服器清單；網頁版的管理員核准後，它就會出現在清單上。",
    "guidesH2": "逐步指南",
    "guides": [
      "PokerTH 伺服器架設指南",
      "自架與一行指令安裝",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "手動安裝與 HTTPS",
      "管理面板"
    ],
    "faqH2": "常見問題",
    "faq": [
      [
        "架設 PokerTH 伺服器要錢嗎？",
        "不用。PokerTH 伺服器和網頁版都是免費的開放原始碼軟體；你只需要一台機器來執行它們。"
      ],
      [
        "需要什麼硬體？",
        "很少：任何能執行 Linux 或 Docker 的電腦或家用伺服器，或是一片 Raspberry Pi 4 或 5。有線網路連線比處理效能更重要。"
      ],
      [
        "玩家需要安裝任何東西嗎？",
        "不需要。他們只要在手機、平板或電腦的瀏覽器中打開伺服器的位址即可。偏好應用程式的人可以使用 PokerTH QML 用戶端或經典 widget 用戶端：它們連上同一台伺服器，玩家可在同樣的牌桌上遊玩。"
      ],
      [
        "需要 pokerth.net 或網際網路連線嗎？",
        "不需要。區域網路上的伺服器可以獨立運作：玩家只要一個暱稱，就能直接連上它。"
      ],
      [
        "最多可以有幾位玩家加入？",
        "每桌最多 10 位玩家，另外還可以有觀眾，牌桌則是你的團體需要幾桌就能開幾桌。"
      ]
    ]
  },
  zu: {
    "title": "Iseva yakho ye-poker — mahhala, isingathwa nguwe | PokerTH",
    "desc": "Iseva ye-Texas Hold’em yangasese ekhaya, eklabhini noma esikoleni: iseva ye-PokerTH neklayenti lewebhu mahhala, kufakwa ngomyalo owodwa, nge-Docker noma ku-Raspberry Pi.",
    "ldHeadline": "Indlela yokusingatha iseva yakho ye-poker ye-PokerTH",
    "ldDesc": "Setha iseva ye-Texas Hold’em yangasese oyisingatha ngokwakho, usebenzisa iseva ezinikele ye-PokerTH neklayenti lewebhu le-PokerTH.",
    "h1": "Singatha iseva yakho ye-poker",
    "lead": "I-PokerTH imahhala futhi ingumthombo ovulekile kusukela ekuqaleni kuze kube sekugcineni: iseva yomdlalo naleli klayenti lewebhu kungasebenza emshinini wakho. I-PC, iseva yasekhaya noma i-Raspberry Pi yanele umdlalo womndeni, ubusuku beklabhu, iligi yasehhovisi noma isikole, bese yonke ifoni, ithebhulethi noma ikhompyutha kunethiwekhi yakho idlala esipheqululini sayo ngesiteketiso kuphela.",
    "whyH2": "Kungani uzisingathela",
    "why": [
      [
        "Okwangasese",
        "Imidlalo yakho ihlala emshinini wakho nakunethiwekhi yakho; abadlali abadingi i-akhawunti noma ikheli le-imeyili, isiteketiso kuphela."
      ],
      [
        "Kwenze ngendlela yakho",
        "Nikeza iseva igama layo, khetha ukuthi yiziphi izindlela isikrini sokungena esizinikezayo, thumela umlayezo wokwamukela, futhi ugcine uhlu lwabanqobi oluhlanganyelwe lweqembu lakho."
      ],
      [
        "Mahhala",
        "Ayikho ilayisensi, akukho ukubhalisela, azikho izikhangiso: iseva ye-PokerTH neklayenti lewebhu kokubili kuyisofthiwe yamahhala."
      ]
    ],
    "partsH2": "Izingxenye ezimbili",
    "partsP": "Umdlalo we-PokerTH udinga iseva ezinikele ye-PokerTH, eyaba amakhadi futhi iphathe amatafula, kanye neklayenti lewebhu, elinikeza iziphequluli uhlelo futhi lizixhumanise naleyo seva. Kokubili kungasebenza emshinini ofanayo. Konke kuhlala kuhambisana: izinhlelo ze-PokerTH — iklayenti le-QML ku-Windows, macOS, Linux ne-Android, kanye neklayenti le-widget elijwayelekile kudeskithophu — zixhumana neseva efanayo neziphequluli, ngakho abadlali bangaxuba iziphequluli nezinhlelo etafuleni elilodwa.",
    "stepsH2": "Kusethe ngezinyathelo ezintathu",
    "steps": [
      [
        "Faka iseva ye-PokerTH",
        "Yakha i-pokerth_dedicated_server emthonjeni we-PokerTH — inguqulo 2.1.10 noma entsha — ngokulandela umhlahlandlela weseva wephrojekthi ye-PokerTH: idinga i-Qt 6.7 noma entsha, i-CMake kanye nesihlanganisi se-C++23. Iphakheji ye-pokerth-server etholakala kuma-distribution e-Linux iyinguqulo endala. Iseva ilalele kuphothi ye-TCP 7234."
      ],
      [
        "Faka iklayenti lewebhu",
        "Ku-Debian, ku-Ubuntu noma ku-Raspberry Pi OS, iskripthi sokufaka sisetha i-Node.js, iklayenti lewebhu nesevisi eqala nomshini, ngomyalo owodwa. Abasebenzisi be-Docker badonsa isithombe esilungile se-amd64, i-arm64 ne-armv7, kanti i-CasaOS ingenisa ifayela le-Compose elifanayo njengohlelo."
      ],
      [
        "Dlala",
        "Kunoma iyiphi idivayisi kunethiwekhi yakho, vula ikheli lomshini kuphothi 8080, khetha okuthi LAN / Iseva ezinikele, thayipha isiteketiso bese udala itafula. Abadlali abasebenzisa iklayenti le-PokerTH le-QML noma le-widget baxhumana nomshini ofanayo kuphothi 7234 futhi bajoyine amatafula afanayo."
      ]
    ],
    "piH2": "Ku-Raspberry Pi",
    "piP": "I-PokerTH ishintshana ngemilayezo emincane futhi amadivayisi abadlali enza konke ukudweba, ngakho i-Raspberry Pi yanele kakhulu: i-Pi 4 ene-2 GB iyona ekhetheke kakhulu, i-Pi 5 yeqile ngokwanele. Ukuze ubusuku buhambe kahle, inethiwekhi ibaluleke ngaphezu kwebhodi — xhuma i-Pi ku-router ngekhebula, futhi usebenzise iphoyinti lokufinyelela le-Wi-Fi elihle labadlali.",
    "httpsH2": "I-HTTP ku-LAN, i-HTTPS yezinto ezengeziwe",
    "httpsP": "Kunethiwekhi yakho, umdlalo usebenza nge-HTTP evamile. Ukufaka uhlelo esikrinini sasekhaya, ukudlala ungaxhunyiwe ku-inthanethi nokuthola izaziso kudinga i-HTTPS, umhlahlandlela eyisetha nge-Nginx nesitifiketi samahhala se-Let’s Encrypt.",
    "adminH2": "Iphaneli yomlawuli esipheqululini",
    "adminP": "Ikhonsoli evikelwe ngethokheni ku-/admin ikhombisa ukuthi ngubani oxhunyiwe, ibuyekeza iklayenti lewebhu ngokuchofoza okukodwa futhi ingalibuyisela emuva, ithumela izimemezelo kubadlali, isetha kabusha uhlu lwabanqobi, ifaka amaphakethe amakhadi, izitayela zamatafula nomculo, ibala amaseva emidlalo iklayenti elivunyelwe ukuwafinyelela, futhi inikeze okhiye abavula ezinye kuphela zezigaba zayo.",
    "shareH2": "Mema abadlali bangaphandle",
    "shareP": "Izixhumanisi zesimemo namakhodi e-QR asebenza kuseva yakho njengoba esebenza ku-pokerth.net: umngane uvula isixhumanisi bese ehlaliswa etafuleni lakho. Uma iseva yakho ifinyeleleka ku-inthanethi, ungayiphakamisela nohlu lwamaseva omphakathi lweklayenti lewebhu; izovela khona uma abalawuli beklayenti lewebhu beyivumile.",
    "guidesH2": "Imihlahlandlela yesinyathelo ngesinyathelo",
    "guides": [
      "Umhlahlandlela wokusetha iseva ye-PokerTH",
      "Ukuzisingathela nokufaka ngomyalo owodwa",
      "Docker",
      "CasaOS",
      "Raspberry Pi",
      "Ukufaka ngesandla ne-HTTPS",
      "Iphaneli yomlawuli"
    ],
    "faqH2": "Imibuzo",
    "faq": [
      [
        "Ingabe kumahhala ukusingatha iseva ye-PokerTH?",
        "Yebo. Iseva ye-PokerTH neklayenti lewebhu kuyisofthiwe yamahhala nomthombo ovulekile; udinga nje umshini wokukusebenzisa."
      ],
      [
        "Ngidinga ihadiwe enjani?",
        "Encane kakhulu: noma iyiphi i-PC noma iseva yasekhaya esebenzisa i-Linux noma i-Docker, noma i-Raspberry Pi 4 noma 5. Ukuxhumeka kwenethiwekhi ngekhebula kubaluleke ngaphezu kwamandla okucubungula."
      ],
      [
        "Ingabe abadlali kudingeka bafake okuthile?",
        "Cha. Bavula ikheli leseva esipheqululini efonini, kuthebhulethi noma kukhompyutha yabo. Labo abathanda uhlelo bangasebenzisa iklayenti le-PokerTH le-QML noma iklayenti le-widget elijwayelekile: baxhumana neseva efanayo futhi badlala ematafuleni afanayo."
      ],
      [
        "Ingabe kudingeka i-pokerth.net noma ukuxhumeka ku-inthanethi?",
        "Cha. Iseva kunethiwekhi yakho yendawo isebenza iyodwa: abadlali baxhumeka kuyo ngqo, ngesiteketiso kuphela."
      ],
      [
        "Bangaki abadlali abangajoyina?",
        "Kufika kubadlali abangu-10 etafuleni ngalinye, kanye nababukeli, namatafula amaningi njengoba iqembu lakho lidinga."
      ]
    ]
  }
};
