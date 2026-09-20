// ── help/content/uz.mjs — Uzbek (Oʻzbekcha) help corpus ────────────────────
//
// Same structure as en.mjs (reference): chapters[] → { id, icon, title,
// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand
// names of the rules chapter stay in English, as in the other help corpora.
export const help = {
  chapters: [
    {
      id: "start", icon: "🚀", title: "Ishni boshlash",
      sections: [
        { id: "modes",
          t: "Oʻynashning uch usuli",
          b: [
            "Kirish ekranida qanday oʻynashni tanlang."],
          list: [
            "Internet — rasmiy pokerth.net serverida reyting bilan onlayn oʻynang. pokerth.net hisobi talab qilinadi; pokerth.net saytida bepul roʻyxatdan oʻting.",
            "Lokal / mashgʻulot — botlarga qarshi oflayn oʻynang. Hech narsa sozlash shart emas, ulanishsiz ishlaydi va oʻsib borganingiz sari sovrinlar ochiladi.",
            "LAN / Maxsus server — lokal tarmogʻingizdagi yoki oʻz kompyuteringizdagi xususiy PokerTH serveriga ulaning."] },
        { id: "lan",
          t: "LAN / maxsus server",
          b: [
            "Uchinchi rejim siz yoki doʻstingiz ishga tushirgan istalgan PokerTH serveriga ulanadi — uy tarmogʻida, xususiy VPS’da, qayerda boʻlsa ham. Server manzili va portini kiriting, agar server shifrlangan portdan foydalansa TLS’ni belgilang va taxallus bilan kiring (server ruxsat bersa, mehmon sifatida kirish ham ishlaydi). Shundan soʻng stoldagi hamma narsa rasmiy serverdagidek ishlaydi."] },
        { id: "famboard",
          t: "Oilaviy reyting jadvali",
          b: [
            "Faqat xususiy serverlar va LAN oʻyinlarida mijoz har bir taxallus boʻyicha butun davr statistikasini yuritadi — oʻynalgan va yutilgan qoʻllar hamda oʻyinlar, eng katta yutuq, eng uzun seriya — va ularni server orqali ulashadi, shunda stol atrofidagi har bir qurilma bir xil reyting jadvalini koʻradi. pokerth.net oʻyinlari hech qachon bu tarzda hisobga olinmaydi, mashgʻulot rejimi statistikasi esa butunlay alohida saqlanadi.",
            "Bu oʻyinlarda sovrin tugmasi reyting oynasini LAN yorligʻida ochadi: barcha oʻyinchilar, bir nechta mezon boʻyicha saralash mumkin."] },
        { id: "language",
          t: "Til",
          b: [
            "Interfeys 64 tilda mavjud. Uni istalgan vaqtda Kengaytirilgan sozlamalar (tishli gʻildirak menyusi) dagi Foydalanuvchi interfeysi boʻlimida oʻzgartiring. Poker harakat atamalari (Fold, Check, Call, Bet, Raise, All-In) anʼanaga koʻra, xuddi desktop mijozdagidek, ingliz tilida qoladi."] },
        { id: "pwa",
          t: "Ilova sifatida oʻrnatish",
          b: [
            "Bu mijoz — Progressive Web App: uni brauzer menyusidan (yoki sarlavhadagi oʻrnatish tugmasi orqali) oʻrnatib, oʻz belgisiga ega toʻliq ekranli ilovaga ega boʻlishingiz mumkin. Oʻrnatilgach, u bir zumda ishga tushadi va mashgʻulot rejimi toʻliq oflayn ishlaydi."],
          note: "Android va kompyuterdagi Chrome/Edge’da oʻrnatish tugmasi hammasini oʻzi bajaradi. iPhone/iPad’da Apple faqat Safari orqali oʻrnatishga ruxsat beradi: Ulashish tugmasi → “Bosh ekranga qoʻshish” — kerak boʻlganda mijoz bu qadamlarni koʻrsatadi. Ilova oʻrnatilgach, tugma yoʻqoladi." },
        { id: "platforms",
          t: "Platformalar va brauzerlar",
          b: [
            "Mijoz istalgan tizimdagi istalgan zamonaviy brauzerda ishlaydi — Windows, macOS, Linux, Android, iOS. Bir nechta funksiya yangi brauzer API’lariga tayanadi; API mavjud boʻlmasa, funksiya buzilish oʻrniga oʻzini yashiradi yoki sababini tushuntiradi. Bilish kerak boʻlgan asosiy farqlar:"],
          list: [
            "Chrome / Edge (kompyuter): hammasi ishlaydi, shu jumladan .pdb jurnalini jildga yozish ham.",
            "Firefox: .pdb jurnalini jildga yozishdan tashqari hammasi (API hali mavjud emas).",
            "Safari / iOS: oʻrnatish Ulashish → Bosh ekranga qoʻshish orqali amalga oshadi; tebranish yoʻq; iPhone’da toʻliq ekran cheklangan; ovoz birinchi bosishingizdan keyin boshlanadi.",
            "Android: Chromium brauzerlarida toʻliq qoʻllab-quvvatlanadi, shu jumladan tebranish va «Orqaga» tugmasi xatti-harakati ham."] },
        { id: "avatar",
          t: "Taxallus va avatar",
          b: [
            "Ulanishdan oldin kirish ekranida taxallus va avataringizni tanlang. pokerth.net’da taxallusingiz — hisobingiz nomi; avatarlar avatar serveri orqali boshqa oʻyinchilar bilan ulashiladi.",
            "Avataringiz ulanganingizda yuboriladi va har bir oʻyinchi aynan oʻshani koʻradi. Agar uni ulangan holda oʻzgartirsangiz, yangi avatar keyingi ulanishingizdan boshlab qoʻllanadi. Bosh harf (Aa) yuborilmaydi: boshqa oʻyinchilar standart avatarni koʻradi."] }
      ]
    },
    {
      id: "rules", icon: "🃏", title: "Poker qoidalari",
      sections: [
        { id: "basics",
          t: "Texas Hold’em qisqacha",
          b: [
            "PokerTH’da limitsiz (No-Limit) Texas Hold’em oʻynaladi. Har bir oʻyinchi ikkita yopiq karta (choʻntak kartalari) oladi. Soʻng stol oʻrtasiga beshta umumiy karta ochiq holda tarqatiladi. Oʻzingizning ikki kartangiz va beshta umumiy kartaning istalgan kombinatsiyasidan tuzilgan eng yaxshi besh kartali qoʻl bankni yutadi."] },
        { id: "blinds",
          t: "Blayndlar va diler tugmasi",
          b: [
            "Har bir qoʻldan oldin ikkita majburiy stavka bankni shakllantiradi: kichik blaynd va katta blaynd, ularni diler tugmasidan chapdagi ikki oʻyinchi qoʻyadi. Tugma har bir qoʻldan keyin soat mili boʻylab bir oʻringa siljiydi, shuning uchun hamma navbat bilan blayndlarni toʻlaydi. Oʻyin davomida blayndlar muntazam oraliqlarda oshib boradi.",
            "Stolda tugma va blayndlar belgilar bilan koʻrsatiladi: D (diler), SB (kichik blaynd), BB (katta blaynd)."] },
        { id: "streets",
          t: "Toʻrtta savdo raundi",
          list: [
            "Pre-flop — choʻntak kartalari tarqatilgach, birinchi savdo raundi katta blaynddan chapdagi oʻyinchidan boshlanadi.",
            "Flop — uchta umumiy karta ochiladi, soʻng savdo raundi boʻladi.",
            "Turn — toʻrtinchi umumiy karta, soʻng yana bir savdo raundi.",
            "River — beshinchi va oxirgi umumiy karta, soʻng yakuniy savdo raundi."],
          b: [
            "Savdo raundi qoʻlda qolgan har bir oʻyinchi bankka bir xil miqdor qoʻyganda (yoki all-in boʻlganda) tugaydi."] },
        { id: "actions",
          t: "Navbatingizda nima qila olasiz",
          list: [
            "Fold — qoʻldan voz kechish. Kartalaringiz tashlanadi va siz endi bank uchun kurashmaysiz.",
            "Check — stavka qilmasdan oʻtkazib yuborish. Faqat call qilinadigan narsa boʻlmaganda mumkin.",
            "Call — joriy stavkani tenglashtirish.",
            "Bet — bu bosqichda hali hech kim stavka qilmagan boʻlsa, savdoni ochish.",
            "Raise — mavjud stavkani oshirish. Minimal raise oldingi stavka yoki raise’ga teng.",
            "All-In — butun stekingizni qoʻyish. Siz qoplagan miqdor doirasida qoʻlda qolasiz."] },
        { id: "showdown",
          t: "Shoudaun va boʻlingan banklar",
          b: [
            "Agar river savdo raundidan keyin bir nechta oʻyinchi qolsa, qoʻllar ochiladi va eng yaxshi qoʻl yutadi — gʻolib kombinatsiya umumiy kartalar ostida koʻrsatiladi. Oʻyinchi toʻliq stavkalardan kamroq miqdorga all-in boʻlganda yon banklar yaratiladi: har bir oʻyinchi bankning faqat oʻzi hissa qoʻshgan qismini yuta oladi. Teng qoʻllar bankni boʻlib oladi.",
            "Hamma ham kartasini ochishi shart emas: oxirgi bet yoki raise qilgan oʻyinchidan boshlab, qoʻl faqat allaqachon ochilgan qoʻldan kuchli boʻlsagina koʻrsatiladi. Kartalarni tashlash huquqiga ega boʻlgan har kim ularni yashirin saqlaydi va baribir ochish uchun «Koʻrsatish» tugmasini oladi."] },
        { id: "hands",
          t: "Kombinatsiyalar reytingi",
          b: [
            "Eng kuchsizidan eng kuchlisigacha:"],
          list: [
            "1. High Card — kombinatsiya yoʻq; eng katta karta hal qiladi.",
            "2. Pair — bir xil darajadagi ikkita karta.",
            "3. Two Pair — ikki xil juftlik.",
            "4. Three of a Kind — bir xil darajadagi uchta karta.",
            "5. Straight — ketma-ket beshta karta (tuz yuqori yoki past hisoblanadi).",
            "6. Flush — bir mastdagi beshta karta.",
            "7. Full House — uchlik va juftlik.",
            "8. Four of a Kind — bir xil darajadagi toʻrtta karta.",
            "9. Straight Flush — strit, hammasi bir mastda.",
            "10. Royal Flush — oʻnlikdan tuzgacha, hammasi bir mastda. Eng yaxshi qoʻl."] }
      ]
    },
    {
      id: "game", icon: "🎮", title: "Oʻyin ekrani",
      sections: [
        { id: "actionbar",
          t: "Harakatlar paneli",
          b: [
            "Navbat sizga kelganda pastdagi harakatlar paneli toʻrttagacha tugma bilan yonadi: Fold (qizil), Check / Call (koʻk), Bet / Raise (yashil — ajratib koʻrsatilgan asosiy harakat) va All-In (toʻq qizil). Check / Call tugmasi call qilish uchun aniq miqdorni koʻrsatadi; Bet / Raise siz qoʻymoqchi boʻlgan miqdorni koʻrsatadi. River’dan keyin All-In kartalaringizni ochish uchun «Koʻrsatish» tugmasiga aylanishi mumkin."] },
        { id: "betctl",
          t: "Stavkangizni tanlash",
          b: [
            "Raise miqdorini raqam maydoni, slayder yoki 1/3 · 1/2 · Pot tezkor tugmalari (joriy bankning ulushlari) bilan belgilang. Miqdorlar avtomatik yaxlitlanadi va ruxsat etilgan minimal hamda maksimal raise oraligʻida ushlab turiladi. Agar katta blayndlarda oʻylashni afzal koʻrsangiz, barcha miqdorlarni fishkalar oʻrniga BB’da koʻrsatadigan sozlama bor."] },
        { id: "preselect",
          t: "Harakatni oldindan tanlash",
          b: [
            "Navbatingizdan oldin harakatni oldindan belgilab qoʻyishingiz mumkin: tugmani bosing — u oltin hoshiya va kichik oltin nuqta oladi. Navbatingiz kelganda harakat bir zumda bajariladi. Oldindan belgilangan Fold, check qilish bepul boʻlsa, avtomatik ravishda Check’ga aylanadi — siz hech qachon bekorga fold qilmaysiz. Oldindan tanlovlar har bir yangi qoʻlda, bosqich almashganda va shoudaunda tozalanadi hamda vaziyat oʻzgarsa (masalan, call miqdori oʻzgarsa) bekor qilinadi."] },
        { id: "automodes",
          t: "Avto rejimlar",
          b: [
            "Harakat tugmalari yonidagi ochiluvchi roʻyxat uchta oʻyin rejimini taklif qiladi: Qoʻlda, Avto Check/Call va Avto Check/Fold. Avto rejimlar siz ortga qaytmaguningizcha siz uchun oʻynaydi — harakat tugmasiga qoʻlda bosish darhol Qoʻlda rejimiga qaytaradi."] },
        { id: "readtable",
          t: "Stolni oʻqish",
          b: [
            "Har bir oʻyinchi qutisida avatar, ism, stek va joriy stavka koʻrsatiladi. Diler va blayndlar D / SB / BB belgilari bilan koʻrsatiladi. Qutidagi rangli belgi oʻyinchining oxirgi harakatini koʻrsatadi; ingichka koʻk chiziq uning oʻylash vaqtini sanaydi. Navbati kelgan oʻyinchining qutisi yorishadi; navbat sizda boʻlganda oʻz qutingiz pulslanuvchi oltin hoshiya oladi.",
            "Stol ustidagi holat paneli umumiy bankni, joriy bosqich stavkalarini, bosqichni (Pre-flop, Flop, Turn, River) hamda oʻyin va qoʻl raqamlarini koʻrsatadi. Fold qilgan oʻyinchilarning kartalari yarim shaffof; chiqib ketgan oʻyinchilar xiralashtirilgan. Qoʻl oxirida gʻolib oynasi kim nima yutganini jamlab koʻrsatishi mumkin — uni sozlamalarda oʻchirish mumkin."] },
        { id: "seatlayout",
          t: "Oʻrinlar joylashuvi",
          b: [
            "Veb-qoʻshimcha sifatida oʻyinchi qutilarining joylashuvini Kengaytirilgan sozlamalar → Oʻrinlar boʻlimida tanlash mumkin: Avtomatik rasmiy mijozga ergashadi (portretda qatʼiy joylar, landshaftda hisoblangan ellips), yoki Portret yoxud Landshaft joylashuvini majburan tanlang — Maxsus esa har bir oʻrinni oʻzingiz joylashtirishga imkon beradi: tahrirlash rejimi paydo boʻladi, unda har bir qutini aynan xohlagan joyingizga surasiz va joylashuv saqlanadi."] },
        { id: "zoom",
          t: "Stol masshtabi (telefonlar)",
          b: [
            "Kichik ekranlarda lupa tugmalari stolni kattalashtiradi (2×) va siz uni barmoq bilan surishingiz mumkin — faqat harakatlar paneli joyida qoladi; oʻz qutingiz ham kattalashadi va navbat sizga kelganda koʻrinish unga qaytadi. Koʻrinish avtomatik ravishda faol oʻringa ergashadi va shoudaunda umumiy koʻrinish uchun yana kichrayadi. Buni Kengaytirilgan sozlamalarda oʻchirish mumkin. Navbat sizga kelganda umumiy kartalar koʻrinishdan tashqarida boʻlsa, stol tepasida ularning kichik nusxasi paydo boʻladi; kartalarga oʻtish va qaytish uchun uni bosing."],
          note: "Telefon va planshetlarda brauzerning oʻz ikki barmoqli masshtabi standart holatda bloklangan, shunda masshtab imo-ishorasi qoʻl oʻrtasida tasodifan ishga tushmaydi; xohlasangiz, uni Kengaytirilgan sozlamalar → Foydalanuvchi interfeysi boʻlimida qayta yoqing." },
        { id: "protections",
          t: "Moʻralashdan va tasodifiy call’dan himoya",
          b: [
            "Ikkita ixtiyoriy himoya: Moʻralashdan himoya oʻz kartalaringizni ularga bosmaguningizcha yashirin saqlaydi (kimdir ekraningizni koʻra olsa foydali), tasodifiy call’dan himoya esa katta raise’dan soʻng darhol Call tugmasini qisqa muddatga bloklaydi, shunda kichikroq call’ga moʻljallangan bosish tasodifan oshirilgan miqdorga tushmaydi. Ikkalasi ham Kengaytirilgan sozlamalarda joylashgan."] }
      ]
    },
    {
      id: "info", icon: "📊", title: "Maʼlumot paneli",
      sections: [
        { id: "open",
          t: "Panelni ochish",
          b: [
            "Oʻyin davomida maʼlumot paneli sarlavhadan (yoki Alt+L / Alt+I bilan) ochiladi va uchta yorliqqa ega: Jurnal, Imkoniyatlar va Statistika. Telefonlarda u stol ustida suzib turadi; kattaroq ekranlarda esa suriladigan, oʻlchami oʻzgartiriladigan oyna — koʻchirish uchun ⣿ tutqichidan, oʻlchamini oʻzgartirish uchun chetlaridan ushlang. Uning joylashuvi eslab qolinadi."] },
        { id: "log",
          t: "Oʻyin jurnali",
          b: [
            "Jurnal yorligʻi butun oʻyinni qoʻlma-qoʻl yozib boradi: blayndlar, miqdorlari bilan har bir harakat, ochilgan kartalar va gʻoliblar — tez oʻqish uchun ranglar bilan ajratilgan. Agar seansni keyinroq koʻrib chiqmoqchi boʻlsangiz, eksport tugmasi jurnalni fayl sifatida saqlaydi."] },
        { id: "odds",
          t: "Imkoniyatlar (ehtimollar monitori)",
          b: [
            "Imkoniyatlar yorligʻi joriy qoʻlingiz uchun 10 ta kombinatsiya toifasining har biri bilan yakunlash ehtimolini jonli koʻrsatadi — High Card’dan Royal Flush’gacha — har biri oʻz belgisi, foizi va chizigʻi bilan. Fold qilganingizdan soʻng koʻrinish kulrang tusga kiradi. U faqat oʻz kartalaringiz va umumiy kartalardan foydalanadi: raqiblaringiz koʻrsatmagan hech narsani koʻrmaydi."] },
        { id: "journal",
          t: "Qoʻl jurnallari va Jurnallar oynasi",
          b: [
            "Jonli jurnaldan tashqari, siz oʻynagan har bir qoʻl brauzeringizda lokal ravishda, rasmiy mijozning .pdb jurnal fayllari bilan bir xil formatda yozib boriladi. Jurnallar oynasi (Kengaytirilgan sozlamalar → Jurnal xabarlari → Jurnallarni boshqarish…) seanslaringiz roʻyxatini koʻrsatadi va ular bilan ishlashga imkon beradi: seansni qidiruv va ajratib koʻrsatish bilan koʻrib chiqish, oʻyin boʻyicha filtrlash, HTML yoki oddiy matn sifatida eksport qilish, xom .pdb faylini saqlash yoki desktop mijoz yozgan .pdb faylini import qilish. Seanslarni bittalab yoki hammasini birdan (tasdiqlash bilan) oʻchirish mumkin, avtomatik saqlash sozlamasi esa faqat oxirgi 7, 30, 90, 180 yoki 365 kunni saqlab qolishi mumkin. Oʻzingiz import qilgan jurnallar hech qachon avtomatik oʻchirilmaydi. Ikkinchi sozlama nechta seans saqlanishini cheklaydi, roʻyxat ustunini esa surib kengaytirish mumkin.",
            "Bir yoʻla bir nechta seansni tozalash uchun Tanlash… tugmasi roʻyxatni belgilash katakchalariga aylantiradi: keraksizlarini belgilang va Oʻchirish tugmasi bitta tasdiqlashdan soʻng butun toʻplamni oʻchiradi. Kompyuterda seanslarni bittalab qoʻshish uchun Ctrl (⌘) + bosish yoki butun oraliqni olish uchun Shift + bosishdan ham foydalanish mumkin.",
            "Tahlil tugmasi seans boʻyicha qoʻl tahlilini ishga tushiradi va jurnalni pokerth.net tahlil xizmatiga yuborishi mumkin. Siz aniq eksport qilmaguningizcha yoki yuklamaguningizcha hammasi qurilmangizda qoladi."] },
        { id: "logopts",
          t: "Jurnal yuritish sozlamalari",
          b: [
            "Kengaytirilgan sozlamalar → Jurnal xabarlari boʻlimida jurnal yuritishni yoqish yoki oʻchirish va yozish oraligʻini tanlash mumkin — desktop mijozdagi kabi uchta sozlama bilan: har bir harakatdan keyin, har bir qoʻldan keyin (standart) yoki har bir oʻyindan keyin. Yana bir sozlama .pdb faylini siz tanlagan jildga yozadi va uni shu oraliqda, shuningdek sahifadan chiqayotganingizda yana bir marta yangilab turadi, shunda boshqa vosita oʻyinni jonli kuzatishi mumkin."],
          note: "Lokal jildga yozish uchun File System Access API kerak: faqat kompyuterdagi Chrome, Edge va Opera. Boshqa joylarda sozlama oʻzini tushuntiradi va Jurnallar oynasidan qoʻlda eksport qilish imkoniyati saqlanib qoladi. Brauzer faylni faqat almashtira oladi, unga qoʻshib yoza olmaydi, shuning uchun .pdb faylini oʻqiyotgan vosita har bir oʻzgarishdan keyin uni qayta ochishi kerak." },
        { id: "assist",
          t: "Yordamchi (qoʻl kuchi)",
          b: [
            "Imkoniyatlar yorligʻining yuqorisida yordamchi banneri qoʻlingizni siz uchun oʻqiydi. Flopdan oldin u boshlangʻich qoʻlingizni nomlaydi va yulduzchalar bilan baholaydi; flopdan boshlab esa joriy eng yaxshi kombinatsiyangizni va tezkor simulyatsiyadan soʻng qoʻlni yutish ehtimolingizni foizda, qizildan (kuchsiz) yashilgacha (kuchli) rangli shkala bilan koʻrsatadi. Ehtimollar monitori kabi, u faqat siz koʻra oladigan maʼlumotlardan foydalanadi.",
            "Kengaytirilgan sozlamalar → Oʻrinlar boʻlimida ikkita koʻrinish uslubi mavjud: Segmentlar (oʻnta blok) yoki klassik jarayon chizigʻi. Butun yordamchi funksiyasini Kengaytirilgan sozlamalar → Yordamchi boʻlimida oʻchirish mumkin."] },
        { id: "assistwin",
          t: "Yordamchi suzuvchi vidjet sifatida",
          b: [
            "Yordamchi blokini paneldan ajratib, doim ustda turadigan alohida kichik oynaga chiqarish mumkin: blokdagi ajratish tugmasidan foydalaning, soʻng uni stol ustida istalgan joyga koʻchiring va oʻlchamini oʻzgartiring — toʻliq panelni ochmasdan qoʻlingiz kuchini kuzatib turish uchun qulay. Qaytarish tugmasi uni Imkoniyatlar yorligʻiga qaytaradi, joylashuvi esa eslab qolinadi. Panel ichida Yordamchi va ehtimollar orasidagi surish tutqichi joyni ikkalasi oʻrtasida taqsimlashga imkon beradi."] },
        { id: "stats",
          t: "Statistika",
          b: [
            "Statistika yorligʻi seansingizni kuzatib boradi: oʻynalgan qoʻllar, koʻrilgan floplar, shoudaunlar, gʻalaba ulushlari va boshqalar. Statistikani yuritishni Kengaytirilgan sozlamalarda oʻchirish mumkin."] },
        { id: "hud",
          t: "Oʻrinlardagi statistika HUD’i",
          b: [
            "HUD har bir oʻyinchi oʻrni yoniga jurnallaringizda yozib olingan qoʻllar asosida tuzilgan kichik statistika qutisini biriktiradi: kuzatilgan qoʻllar soni, soʻng VPIP (pre-flopda qanchalik tez-tez ixtiyoriy ravishda pul qoʻyishi), PFR (pre-flop raise’lari) va AF (agressiya koeffitsiyenti) — passivdan agressivgacha ranglar bilan ajratilgan. Ularning ostida belgi oʻyinchini oddiy soʻzlar bilan tavsiflaydi — Tayt-passiv, Luz-agressiv va hokazo — uning yonida kichik siferblat boʻlib, yongan choragi chapdan oʻngga taytdan luzgacha, pastdan yuqoriga esa passivdan agressivgacha oʻqiladi. Belgi birinchi qoʻldanoq koʻrinadi, lekin ishonchli boʻladigan 25 ta qoʻlgacha xira turadi. Toʻliq raqamlar toʻplami (3-bet, davomiy stavka, 3-betga fold, oʻgʻirlash urinishlari, shoudaun koʻrsatkichlari…) bilan batafsil qalqib chiquvchi oynani ochish uchun qutiga bosing, agar u biror narsani toʻsib qoʻysa, qutini surib koʻchiring.",
            "HUD faqat oʻz stollaringizda koʻrganlaringizni biladi — u lokal qoʻl jurnallaringizni oʻqiydi, shuning uchun jurnal yuritish yoqilgan boʻlishi kerak va raqamlar yetarlicha qoʻldan keyin maʼnoga ega boʻladi. U standart holatda oʻchirilgan: uni Kengaytirilgan sozlamalar → Yordamchi boʻlimida yoqing."] },
        { id: "handsbtn",
          t: "Kombinatsiyalar sharhi",
          b: [
            "Stol matosidagi poker kombinatsiyalari belgisi istalgan vaqtda 10 ta kombinatsiyaning tezkor sharhini ochadi — oʻrganish paytida qulay. Uni Kengaytirilgan sozlamalarda yashirish mumkin."] }
      ]
    },
    {
      id: "chat", icon: "💬", title: "Chat va muloqot",
      sections: [
        { id: "panels",
          t: "Lobbi chati va oʻyin chati",
          b: [
            "Lobbida bitta chat, stolda yana bittasi bor. Telefonlarda oʻyin chati stol ustida suzib turadi; kattaroq ekranlarda esa suriladigan, oʻlchami oʻzgartiriladigan oyna. Chat tugmasidagi belgi oʻqilmagan xabarlarni sanaydi."] },
        { id: "typing",
          t: "Yozishga yordamchilar",
          list: [
            "Tab taxallusni toʻldiradi — mos keluvchilar orasida aylanish uchun Tab’ni yana bosing.",
            "↑ / ↓ oʻz xabarlaringiz tarixini varaqlaydi.",
            "Emoji tugmasi toʻliq tanlagichni ochadi; : yozsangiz, yozish davomida emotlar ham taklif qilinadi."] },
        { id: "emotes",
          t: "Emotlar va smayliklar",
          b: [
            "Chat emot qisqa kodlarini rasmiy desktop mijoz bilan aynan bir xil tarzda oʻgiradi: ikki nuqta orasiga nom yozing — u emojiga aylanadi — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… 1 900 dan ortiq kod qoʻllab-quvvatlanadi (toʻliq GitHub toʻplami). Klassik matnli smayliklar ham oʻgiriladi: :-) ;) :D xD :P <3 va yana saksonga yaqini.",
            ": yozish kodni yozish davomida toʻldiradigan takliflar oynasini ochadi (tanlash uchun ↑/↓, qabul qilish uchun Tab yoki Enter). Emojiga oʻgirishni Kengaytirilgan sozlamalar → Chat boʻlimida butunlay oʻchirish mumkin."] },
        { id: "commands",
          t: "Chat buyruqlari",
          b: [
            "Chat slash-buyruqlarni tushunadi. Ulardan ikkitasi boshqalarga koʻrinadi:"],
          keys: [
            ["/me <text>", "Harakat xabari, “* ismingiz matn” koʻrinishida chiqadi"],
            ["/emoji <emoji>", "Emoji reaksiyasini ijro etadi (reaksiya tanlagichi aynan shuni yuboradi)"]] },
        { id: "diagcmds",
          t: "Diagnostika buyruqlari",
          b: [
            "Qolgan hammasi lokal: javoblar faqat sizga koʻrsatiladi va stolga hech narsa yuborilmaydi. Hammasini koʻrish uchun /help yozing. Eng foydalilari:"],
          keys: [
            ["/help", "Barcha buyruqlar roʻyxati"],
            ["/update", "Yangi versiyani tekshirish va yangilash"],
            ["/lang <code>", "Tilni almashtirish (masalan, /lang fr)"],
            ["/sound on|off", "Oʻyin ovozlarini yoqish/oʻchirish"],
            ["/zoom", "Stol lupasini yoqish/oʻchirish"],
            ["/clear", "Chatni lokal tozalash"],
            ["/table", "Joriy oʻyin haqida maʼlumot (blayndlar, oʻyinchilar, steklar)"],
            ["/diag · /netdbg · /fps", "Mijoz holati, tarmoq va kadrlar tezligi diagnostikasi"],
            ["/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg", "Kengaytirilgan nosozliklarni tuzatish (kartalar, protokol, audio, xotira, oʻrinlar)"],
            ["/copy", "Oxirgi buyruq javobini almashish buferiga nusxalash"]] },
        { id: "privatemsg",
          t: "Shaxsiy xabarlar",
          b: [
            "Butun lobbi oʻqib turmasdan bitta oʻyinchiga yozing. Oʻyinchilar roʻyxatidagi ism yonidagi konvert u bilan suhbatni ochadi; lobbi sarlavhasidagi konvert oxirgi suhbatni qayta ochadi. Suhbatlar shu qurilmada saqlanadi va qaytib kelganingizda ham joyida boʻladi, shuning uchun bir necha kundan keyin davom ettirilgan suhbat oʻz tarixini saqlaydi — konvertdagi qizil raqam hali oʻqimaganlaringizni koʻrsatadi, oyna sarlavhasidagi savat esa suhbatni butunlay oʻchiradi."],
          keys: [
            ["/msg <nickname> <text>", "Lobbi chatidan shaxsiy xabar yuborish"],
            ["/msg \"<nickname with spaces>\" <text>", "Xuddi shu, taxallusda boʻsh joylar boʻlganda"]],
          note: "Xabarlar 128 ta belgi bilan cheklangan. Server ishlab turgan stolda oʻtirgan oʻyinchiga shaxsiy xabarni yetkazmaydi, tarix esa faqat shu brauzerda saqlanadi — u siz bilan boshqa qurilmaga oʻtmaydi." },
        { id: "reactions",
          t: "Emoji reaksiyalari",
          b: [
            "Reaksiya tugmasi 30 ta animatsiyali reaksiya (🎉, 😂, 😱, 🔥…) tanlagichini ochadi, ular oʻrningiz ustida effekt bilan ijro etiladi va stoldagi hammaga koʻrinadi — desktop mijozdagi oʻyinchilarga ham. Reaksiyalarni Kengaytirilgan sozlamalarda butunlay oʻchirish mumkin."] },
        { id: "translate",
          t: "Hammani tushunish",
          b: [
            "Chat tarjimasi yoqilgan boʻlsa, kursoringiz ostidagi qatorda — yoki sensorli ekranda siz bosgan qatorda — tarjima tugmasi paydo boʻladi va u xabarni brauzerning ichki tarjimoni yordamida sizning tilingizda koʻrsatadi. Uni Kengaytirilgan sozlamalar → Chat boʻlimida har bir qatorda doimiy koʻrinadigan qilish mumkin, stolda koʻp uchraydigan qisqartmalarni (gg, nh, utg…) izohlaydigan maslahat ham shu yerda joylashgan."],
          note: "Tarjima Google Translate xizmatidan foydalanadi va har qanday brauzerda ishlaydi — faqat internet aloqasi kerak. Xabar tarjima xizmatiga faqat siz uning tarjima tugmasini bosganingizda yuboriladi, hech qachon avtomatik emas." },
        { id: "social",
          t: "Oʻyinchilar: profil, taklif, eʼtiborsiz qoldirish",
          b: [
            "Istalgan oʻyinchiga bosing — stolda yoki lobbi roʻyxatida — va uning kartochkasi ochiladi: profil va statistika, uni oʻyiningizga taklif qilish yoki eʼtiborsiz qoldirish (uning chat xabarlari yashiriladi; eʼtiborsiz qoldirishni istalgan vaqtda bekor qilish mumkin). Taklif qilish/eʼtiborsiz qoldirishdan oldin tasdiqlashni sozlamalarda yoqish mumkin."] }
      ]
    },
    {
      id: "lobby", icon: "🏛️", title: "Lobbi va oʻyinlar",
      sections: [
        { id: "list",
          t: "Oʻyinlar roʻyxati",
          b: [
            "Lobbi serverdagi har bir stolni koʻrsatadi. Har bir yozuvda oʻyinchilar soni, oʻyin turi, parol yoki taklif talab qilinsa qulf belgisi va holat belgisi koʻrsatiladi: “Kutilmoqda” (yashil — oʻyin boshlanmagan, boʻsh oʻrin boʻlsa qoʻshilishingiz mumkin), “Ketmoqda” (iliq rang — tomoshabinlarga ruxsat boʻlsa jonli kuzatish mumkin) va “Yopiq” (xira). Toʻla stol shunchaki toʻliq sonni koʻrsatadi, masalan 10/10; belgi ranglari faol mavzuga mos keladi.",
            "Filtr roʻyxati desktop mijozdagi kabi roʻyxatni toraytiradi, har bir tanlov oldingisidan qatʼiyroq: faqat ochiq oʻyinlar → toʻla stollarni ham yashirish → soʻng faqat parolsiz, faqat parolli yoki faqat reyting oʻyinlari. Tanlovingiz eslab qolinadi. Qidiruv maydoni oʻyinni nomi boʻyicha topadi, oʻyinchilar tugmasi esa onlayn boʻlgan barchaning roʻyxatini ochadi — unda qidirish va saralash mumkin."] },
        { id: "join",
          t: "Qoʻshilish va tomosha qilish",
          b: [
            "Ochiq oʻyinni tanlang va unga qoʻshiling — qulf belgisi parol talab qilinishini bildiradi. Tomoshabinlarga ruxsat beradigan ketayotgan oʻyinlarni jonli kuzatish mumkin: siz stol va chatni koʻrasiz, lekin choʻntak kartalari yashirin qoladi va siz harakat qila olmaysiz."] },
        { id: "gameinfo",
          t: "Oʻyin haqida",
          b: [
            "Qoʻshilishdan oldin oʻyin haqidagi kartochka stolni belgilaydigan hamma narsani koʻrsatadi: oʻyin turi, blayndlar va ularning qanday oshishi (ikki baravar yoki qoʻlda tuzilgan roʻyxat), boshlangʻich stek, harakat uchun vaqt, qoʻllar orasidagi tanaffus va kim allaqachon oʻtirgani."] },
        { id: "create",
          t: "Oʻyin yaratish",
          b: [
            "Oʻz stolingizni yarating: nom, oʻyinchilar soni, boshlangʻich stek, birinchi kichik blaynd va oshirish jadvali, harakat uchun vaqt hamda tomoshabinlarga ruxsat bor-yoʻqligi. Toʻrtta oʻyin turi mavjud: Oddiy (har kim), faqat roʻyxatdan oʻtgan oʻyinchilar, faqat taklif bilan va Reyting (rasmiy reytingga hisoblanadi — u yerda parolga ruxsat yoʻq). Sevimli sozlamalaringizni saqlash va qayta yuklash mumkin."] },
        { id: "invites",
          t: "Takliflar",
          b: [
            "Oʻyinchilar sizni oʻz stoliga taklif qilishi mumkin; siz qabul qilish yoki rad etish mumkin boʻlgan bildirishnoma olasiz. Taklif qilinish — faqat taklif bilan kiriladigan oʻyinga kirishning yagona yoʻli."] }
      ]
    },
    {
      id: "pthnet", icon: "🌐", title: "pokerth.net",
      sections: [
        { id: "account",
          t: "Hisobingiz",
          b: [
            "Rasmiy Internet serveri — pokerth.net. U yerda oʻynash uchun bepul pokerth.net hisobi kerak — saytda roʻyxatdan oʻting, soʻng bu yerga oʻsha taxallus va parol bilan kiring. Bu veb-mijoz desktop mijoz ulanadigan aynan oʻsha serverga ulanadi: oʻsha hisoblar, oʻsha stollar, oʻsha reytinglar — va siz desktop oʻyinchilari bilan bir stolda oʻtirishingiz mumkin."] },
        { id: "ranked",
          t: "Reyting oʻyinlari va mavsumlar",
          b: [
            "Reyting turidagi oʻyinlar rasmiy mavsum reytingiga hisoblanadi. Ilovadagi profilingiz qachon qoʻshilganingizni, joriy mavsumdagi Oʻrin, Hisob, oʻrtacha koʻrsatkich va oʻynalgan oʻyinlaringizni hamda soʻnggi natijalaringizni koʻrsatadi. Oddiy (reytingsiz) oʻyinlar shunchaki koʻngilochar va hech narsani oʻzgartirmaydi."] },
        { id: "rankhow",
          t: "Reyting qanday hisoblanadi",
          b: [
            "Har bir reyting oʻyinida egallagan oʻrningiz ochko keltiradi: birinchi oʻrin uchun 15, soʻng yettinchi oʻringacha 9, 6, 4, 3, 2 va 1; sakkizinchidan oʻninchigacha hech narsa olmaydi. Shunday qilib, bitta stol jami 40 ochko tarqatadi.",
            "Hisobingiz — bu ochkolar yigʻindisi emas, balki bir oʻyinga toʻgʻri keladigan oʻrtacha koʻrsatkichingiz boʻlib, u oʻynalgan oʻyinlar soni bilan oʻsib boradigan koeffitsiyent bilan muvozanatlanadi: choʻqqida qolish uchun bir hovuch yaxshi natija yetarli emas, muntazamlik ham kerak — qancha koʻp oʻynasangiz, Hisobingiz haqiqiy oʻrtacha koʻrsatkichingizga shuncha yaqinlashadi. Mavsumlar bir chorak davom etadi: almashish paytida hammasi arxivlanadi va hisoblagichlar noldan boshlanadi, oʻtgan mavsumlar esa mavjud boʻlib qoladi. Oʻyinda shohsupa tugmasi stolingizdagi oʻyinchilarning mavsum reytingini koʻrsatadi."],
          note: "Ochkolar shkalasi va aniq formula pokerth.net reyting serveri tomonidan belgilanadi va oʻzgarishi mumkin; saytdagi sahifalar asosiy manba hisoblanadi." },
        { id: "rankings",
          t: "Reyting sahifalari",
          b: [
            "Reyting bandi oʻyinchi boʻyicha qidirish mumkin boʻlgan rasmiy PokerTH reytingini hamjamiyat reytinglari (BBC, WEC) bilan birga ochadi. Agar reytinglar sizni qiziqtirmasa, bu bandni Kengaytirilgan sozlamalar → Hamjamiyat boʻlimida yashirish mumkin."] },
        { id: "cups",
          t: "Hamjamiyat kuboklari: BBC va WeCup",
          b: [
            "Ikki hamjamiyat pokerth.net’da oʻz musobaqalarini oʻtkazadi, har birining oʻz sayti va reytingi bor. Best Brainies Cup (BBC) — 2013-yilda paydo boʻlgan bosqichli turnir: siz 1-bosqichdan 4-bosqichgacha koʻtarilasiz va har bir 4-bosqich oʻyinidan soʻng, kubok topshirilgach, yangi mavsum boshlanadi. WeCup (WEC) oʻzining ancha keng yoyilgan shkalasiga ega — birinchi oʻrin uchun 75 ochko, soʻng 45, 30, 20… — va uning hisobi oʻrtacha koʻrsatkichingizni boshqa aʼzolarga nisbatan oʻynagan oʻyinlaringiz soniga qarab meʼyorlashtiradi.",
            "Ikkala reyting ham sovrin tugmasidan, PokerTH reytingi yonida ochiladi. Bu musobaqalarning stol sozlamalari oʻyin yaratishda tayyor shablonlar sifatida keladi (BBC 1–4-bosqich, WEC, WEC Monthly Final va WEC Grand Final), shuning uchun xuddi shunday sharoitda mashq qilishingiz mumkin. Qatnashish uchun tegishli kubok saytida roʻyxatdan oʻtish kerak."],
          note: "Agar kuboklar sizga qiziq boʻlmasa, bu kontentni Kengaytirilgan sozlamalar → Hamjamiyat boʻlimida bir yoʻla yashirish mumkin." },
        { id: "forumcups",
          t: "Forum kuboklari va tadbirlar",
          b: [
            "pokerth.net forumida Monthly Cup ham oʻtkaziladi — bu oylik seriya boʻlib, unda oy chempioni aniqlanishidan oldin oʻyinchilar Oltin, Kumush va Bronza stollariga taqsimlanadi; bundan tashqari yil davomida bir martalik maxsus kuboklar ham boʻladi.",
            "Roʻyxatga olish, jadvallar, stol sozlamalari va natijalar forumda eʼlon qilinadi, oʻyinlar esa boshqa har qanday oʻyin kabi rasmiy serverda oʻynaladi. Natijalarni kuzatish uchun pokerth.net hisobi yetarli; kubokka qoʻshilish tegishli forum mavzusi orqali amalga oshiriladi."] },
        { id: "forumnews",
          t: "Lobbida forum yangiliklari",
          b: [
            "Lobbi sarlavhasidagi gazeta tugmasi pokerth.net forumidagi eng soʻnggi postlarni ochadi — har bir mavzu uchun bitta yozuv, har bir forum oʻz rangida. Tugmadagi belgi oʻqilmagan postlarni sanaydi; postni ochish (yangi varaqda) uni oʻqilgan deb belgilaydi, “Hammasini oʻqilgan deb belgilash” esa hammasini birdan tozalaydi.",
            "Bu veb-qoʻshimcha: tugmani Kengaytirilgan sozlamalarda yashirish mumkin (“Lobbi sarlavhasida Forum tugmasi”)."] },
        { id: "avatars",
          t: "Avatarlar va bayroqlar",
          b: [
            "pokerth.net’da avataringiz boshqa oʻyinchilarga avatar serveri orqali tarqatiladi, oʻyinchi qutilarida esa kichik mamlakat bayrogʻi koʻrsatilishi mumkin. Ikkalasi ham ixtiyoriy va sozlamalarda sozlanadi."] }
      ]
    },
    {
      id: "offline", icon: "🏋️", title: "Mashgʻulot rejimi",
      sections: [
        { id: "what",
          t: "Bu nima",
          b: [
            "Lokal / mashgʻulot rejimi — kompyuter raqiblariga qarshi toʻliq oʻyin: ulanish yoʻq, hisob yoʻq, hech narsa tikilmaydi. Ilova oʻrnatilgach (yoki shunchaki bir marta ochilgach), u butunlay oflayn ishlaydi — oʻyinni oʻrganish, interfeysni sinab koʻrish yoki parvoz rejimida vaqt oʻtkazish uchun ayni muddao."] },
        { id: "setup",
          t: "Oʻyinni sozlash",
          b: [
            "Raqiblar sonini, boshlangʻich stekni, blayndlar va oshirish jadvalini hamda oʻyin tezligini tanlang. Botlar tarkibi va qiyinligini Kengaytirilgan sozlamalar → Lokal oʻyin boʻlimida sozlash mumkin — yumshoq raqiblardan tortib qiyinroq, aralash stolgacha."] },
        { id: "trophies",
          t: "Sovrinlar",
          b: [
            "Mashgʻulot rejimining oʻz rivojlanish tizimi bor: olti toifadagi (taraqqiyot, mahorat, uslub, formatlar, koʻngilochar va bitta sirli) 28 ta sovrin oʻynaganingiz sari ochiladi — oʻynalgan qoʻllar, yutilgan oʻyinlar, katta bleflar, maxsus qoʻllar va boshqalar. Sovrinlardagi taraqqiyotingiz jamlanib boradi va hisob sozlamalarini sinxronlash faol boʻlsa, qurilmalar oʻrtasida birlashtiriladi."] },
        { id: "learn",
          t: "Oʻrganish uchun yaxshi joy",
          b: [
            "Boshqa boblardagi hamma narsa bu yerda ham ishlaydi: ehtimollar monitori, yordamchi koʻrinishi, oldindan tanlash, klaviatura yorliq tugmalari. Mashgʻulot rejimi — pokerth.net’ga oʻtishdan oldin ularni bosimsiz sinab koʻrish uchun eng yaxshi joy."] }
      ]
    },
    {
      id: "style", icon: "🎨", title: "Uslub va ovoz",
      sections: [
        { id: "themes",
          t: "Mavzular",
          b: [
            "Kengaytirilgan sozlamalarning Uslub toifasi butun mijoz koʻrinishini oʻzgartiradi. Tayyor mavzular hammasini bir bosishda oʻrnatadi (klassik yashil kazino, rasmiy PokerTH koʻrinishi…); ularning ostida alohida yoʻnalishlar ranglar palitrasini, stol matosini va karta yuzlarini alohida-alohida nozik sozlashga imkon beradi — istalgan yoʻnalishni oʻzgartirsangiz, aralashmangiz maxsus mavzuga aylanadi. Toʻq, yorugʻ yoki avtomatik rejim Foydalanuvchi interfeysi boʻlimida tanlanadi, tanlovlaringiz esa darhol, har bir ekranda qoʻllanadi va eslab qolinadi."] },
        { id: "tablelook",
          t: "Stollar, kolodalar, oʻrinlar",
          b: [
            "Mavzudan tashqari, bir nechta elementni mustaqil almashtirish mumkin: stol foni, karta kolodasi, karta orqa tomoni (kolodaga avtomatik moslash yoki oʻz rasmingizni import qilish), diler va blaynd belgilari, harakat tugmalari uslubi hamda oʻyinchi qutilari koʻrinishini oʻzgartiradigan toʻliq oʻrinlar toʻplamlari. Hammasini Kengaytirilgan sozlamalar → Uslub boʻlimida tanlang; oʻzgarishlar stolda darhol koʻrinadi."] },
        { id: "music",
          t: "Musiqa pleyeri",
          b: [
            "Sarlavha menyularidagi musiqa bandi kichik lounge-musiqa pleyerini ochadi: pleylistdan trek tanlang, ijro/pauza, oldingi/keyingi, aralashtirish hamda bitta trekni, butun pleylistni takrorlash yoki takrorlamaslik. Balandlik, tanlangan trek va takrorlash rejimi eslab qolinadi. Ijro hech qachon oʻz-oʻzidan boshlanmaydi — brauzerlar bosishni talab qiladi — va pleyer oʻyin ovoz effektlaridan butunlay mustaqil.",
            "Trek nomi ostidagi ikkita bosh barmoq ijro etilayotgan narsa sizga yoqish-yoqmasligini bildiradi. Har bir qurilmadan bitta anonim ovoz, radiolar ham kiradi, va uni istalgan vaqtda oʻzgartirish yoki qaytarib olish mumkin; operator umumiy natijalarni ochmaguncha siz faqat oʻz ovozingizni koʻrasiz."] },
        { id: "sounds",
          t: "Ovoz effektlari",
          b: [
            "Oʻyin ovozlari, xuddi desktop mijozdagidek, alohida yoqib-oʻchiriladigan toʻrt toifaga guruhlangan: oʻyin harakatlari (kartalar tarqatildi, Check, Call, Raise, navbat sizda…), lobbi chati bildirishnomasi, tarmoq oʻyini bildirishnomalari (oʻyinchi qoʻshildi, oʻyin tayyor) va blaynd oshishi bildirishnomasi. Ularning hammasini Kengaytirilgan sozlamalar → Ovoz boʻlimidagi bitta balandlik slayderi boshqaradi."],
          note: "Barcha brauzerlar — ayniqsa iOS — siz sahifaga bir marta tegmaguningizcha audio ijro etishdan bosh tortadi. Agar oʻyin ovozsiz boshlansa, istalgan joyga bir marta bosish ovozni jonlantiradi; iOS audio dvigatelini toʻxtatib qoʻyganda ham (kiruvchi qoʻngʻiroq, fonga oʻtish…) mijoz uni avtomatik tiklaydi." },
        { id: "voice",
          t: "Ovozli eʼlonlar va tebranish",
          b: [
            "Ikkita qoʻshimcha kanal sizni ekranga qaramasdan xabardor qilib turishi mumkin: ovozli eʼlonlar qurilmangizning nutq sintezi yordamida oʻyin voqealarini oʻqib beradi, telefonlarda esa qisqa tebranish navbatingiz kelganini bildirishi mumkin. Ikkalasi ham veb-qoʻshimcha boʻlib, qurilmaga qarab standart holatda yoqilgan yoki oʻchirilgan; ular Kengaytirilgan sozlamalar → Stavkalar va navbat boʻlimida."],
          note: "Tebranish Android’da (Chromium brauzerlarida) ishlaydi; Apple veb-saytlarga tebranish API’sini bermaydi, shuning uchun iPhone’lar tebrana olmaydi. Ovozli eʼlonlar hamma joyda ishlaydi, lekin mavjud ovozlar va tillar tizimingizga bogʻliq — mijoz topgan eng mos variantdan foydalanadi." }
      ]
    },
    {
      id: "options", icon: "⚙️", title: "Sozlamalar va yorliq tugmalar",
      sections: [
        { id: "where",
          t: "Sozlamalar qayerda joylashgan",
          b: [
            "Kengaytirilgan sozlamalar istalgan sarlavha menyusidagi tishli gʻildirak bandidan ochiladi. Ular desktop mijozdagi kabi guruhlangan: Foydalanuvchi interfeysi, Uslub, Ovoz, Lokal oʻyin, Tarmoq oʻyini, Internet oʻyini, Taxalluslar / Avatarlar, Jurnal xabarlari hamda Zaxira va tiklash. Vebga xos har bir funksiyaning u yerda oʻz oʻchirgichi bor, shuning uchun foydalanmaydigan har qanday narsani oʻchirib qoʻyishingiz mumkin."] },
        { id: "cfgxml",
          t: "Desktop mijoz bilan sozlamalarni almashish",
          b: [
            "Sozlamalaringiz mijozlar oʻrtasida koʻcha oladi: Zaxira va tiklash toifasi rasmiy config.xml faylini (desktop va QML mijozlari foydalanadigan ~/.pokerth/config.xml) eksport/import qilishni taklif etadi. Eksport umumiy sozlamalarni yozadi — ism, koʻrinish sozlamalari, ovozlar, stol afzalliklari, blayndlar, uslublar — import esa desktop faylini shu yerda qoʻllaydi. Bu mijoz bilmaydigan sozlamalar faylda oʻzgarishsiz saqlanadi.",
            "Oʻyinchilar haqidagi eslatmalaringiz ham fayl bilan birga koʻchadi — matn va yulduzchali baho, desktop mijozlar oʻqiydigan shaklda yoziladi. Rangli yorliqlar shu mijozda qoladi: rasmiy formatda ular uchun maydon yoʻq, shuning uchun import siznikilarga hech qachon tegmaydi."] },
        { id: "sync",
          t: "Sizga ergashadigan sozlamalar",
          b: [
            "Hisob bilan oʻynaganingizda sozlamalaringiz, mavzu, tugma biriktirishlari, til va mashgʻulot sovrinlari sinxronlanadi: bir qurilmada biror narsani oʻzgartirsangiz, keyingi kirgan qurilmangiz uni qabul qiladi. Sovrinlardagi taraqqiyot birlashtiriladi, hech qachon ustidan yozilmaydi, shuning uchun ikki qurilmada oʻynash har doim ikkalasining eng yaxshisini saqlaydi."] },
        { id: "updates",
          t: "Yangilanib turish",
          b: [
            "Mijoz oʻzini oʻzi yangilaydi: yangi versiya joylashtirilganda banner sizni sahifani yangilashga taklif qiladi (yoki qoʻlda tekshirish uchun chatga /update yozing). Vaqti-vaqti bilan biror funksiya haqida fikringizni soʻrash uchun kichik mahsulot soʻrovnomasi paydo boʻlishi mumkin — qatnashish ixtiyoriy va soʻrovnomalarni Kengaytirilgan sozlamalar → Hamjamiyat boʻlimida butunlay oʻchirish mumkin."] },
        { id: "fkeys",
          t: "Rasmiy klaviatura yorliq tugmalari",
          b: [
            "Rasmiy PokerTH funksional tugmalari oʻyin davomida ishlaydi — Alt+S hamma joyda ishlaydi:"],
          keys: [
            ["F1 / F2 / F3 / F4", "Fold · Check/Call · Bet/Raise · All-In (tartibni sozlamalarda teskari qilish mumkin)"],
            ["F5", "Kartalaringizni koʻrsatish (imkoni boʻlganda)"],
            ["F6 / F7 / F8", "Qoʻlda · Avto Check/Fold · Avto Check/Call"],
            ["Alt+M / Alt+K / Alt+F", "Qoʻlda · Avto Check/Call · Avto Check/Fold"],
            ["Alt+C / Alt+L / Alt+I", "Chat · Oʻyin jurnali · Ehtimollar paneli"],
            ["Alt+S", "Sozlamalar — faqat oʻyin davomida emas, ilovaning istalgan joyida"],
            ["F11", "Toʻliq ekran"]],
          note: "Yorliq tugmalar uchun jismoniy klaviatura kerak. Mac’da F-tugmalar standart holatda media boshqaruviga moʻljallangan: Fn’ni bosib turing (yoki macOS sozlamalarida “F1, F2 va boshqa tugmalardan standart funksional tugmalar sifatida foydalanish”ni yoqing). iPhone’da toʻliq ekran iOS tomonidan cheklangan — ilovani PWA sifatida oʻrnatish xuddi shunday toʻliq ekranli tajribani beradi." },
        { id: "webkeys",
          t: "Veb harf tugmalari",
          b: [
            "Veb-qoʻshimcha sifatida bitta harfli tugmalar va Alt+T ham harakatlarni ishga tushiradi, ularning har birini Kengaytirilgan sozlamalar → Klaviatura yorliq tugmalari boʻlimida qayta biriktirish mumkin:"],
          keys: [
            ["F", "Fold"],
            ["C", "Check / Call"],
            ["R", "Raise"],
            ["A", "All-In"],
            ["1 / 2 / 3", "Bet 1/3 · 1/2 · Pot"],
            ["Alt+T", "Statistika paneli"],
            ["Esc", "Eng ustki oynani yopish (Android’dagi «Orqaga» tugmasi ham)"],
            ["↑ ↓ · ↵", "Lobbidagi stollar roʻyxati (unga Tab bilan oʻting): stol tanlash · unga qoʻshilish"]],
          note: "Android’da tizimning «Orqaga» tugmasi/imo-ishorasi oʻyindan chiqish oʻrniga Escape kabi oynalarni yopadi (sozlamalarda sozlanadi). iOS’da bunga teng tizim tugmasi yoʻq — har bir oynaning ✕ belgisidan foydalaning." }
      ]
    }
  ]
};
