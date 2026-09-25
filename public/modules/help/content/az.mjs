// ── help/content/az.mjs — Azerbaijani (Azərbaycanca) help corpus ────────────────────
//
// Same structure as en.mjs (reference): chapters[] → { id, icon, title,
// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand
// names of the rules chapter stay in English, as in the other help corpora.
export const help = {
  chapters: [
    {
      id: "start", icon: "🚀", title: "Başlanğıc",
      sections: [
        { id: "modes",
          t: "Oynamağın üç yolu",
          b: [
            "Giriş ekranında necə oynamaq istədiyinizi seçin."],
          list: [
            "İnternet — rəsmi pokerth.net serverində reytinqlərlə onlayn oynayın. pokerth.net hesabı tələb olunur; pokerth.net-də pulsuz qeydiyyatdan keçin.",
            "Lokal / məşq — botlara qarşı oflayn oynayın. Heç nə quraşdırmaq lazım deyil, bağlantısız işləyir və irəlilədikcə kubokları açır.",
            "LAN / Xüsusi server — lokal şəbəkənizdəki və ya öz kompüterinizdəki şəxsi PokerTH serverinə qoşulun."] },
        { id: "lan",
          t: "LAN / xüsusi server",
          b: [
            "Üçüncü rejim sizin və ya dostunuzun işlətdiyi istənilən PokerTH serverinə qoşulur — ev şəbəkəsində, şəxsi VPS-də, istənilən yerdə. Serverin ünvanını və portunu daxil edin, server şifrələnmiş port istifadə edirsə TLS-i işarələyin və ləqəblə daxil olun (server icazə verirsə qonaq girişi işləyir). Bundan sonra masada hər şey rəsmi serverdəki kimi işləyir."] },
        { id: "famboard",
          t: "Ailə reytinq cədvəli",
          b: [
            "Yalnız şəxsi serverlərdə və LAN oyunlarında klient hər ləqəb üçün ümumi statistikanı saxlayır — oynanılan və qazanılan əllər və oyunlar, ən böyük qazanc, ən yaxşı seriya — və onu server vasitəsilə paylaşır ki, masa ətrafındakı hər cihaz eyni reytinq cədvəlini görsün. pokerth.net oyunları heç vaxt bu şəkildə izlənilmir, məşq rejiminin statistikası isə tamamilə ayrı saxlanılır.",
            "Bu oyunlarda kubok düyməsi reytinq pəncərəsini LAN vərəqində açır: bütün oyunçular, bir neçə meyara görə sıralana bilər."] },
        { id: "language",
          t: "Dil",
          b: [
            "İnterfeys 72 dildə mövcuddur. Onu istənilən vaxt Əlavə seçimlərdə (dişli çarx menyusu) İstifadəçi interfeysi bölməsində dəyişin. Poker hərəkət terminləri (Fold, Check, Call, Bet, Raise, All-In) masaüstü klientdə olduğu kimi ənənəyə görə ingiliscə qalır."] },
        { id: "pwa",
          t: "Tətbiq kimi quraşdırın",
          b: [
            "Bu klient Progressive Web App-dır: onu brauzer menyusundan (və ya başlıqdakı quraşdırma düyməsindən) quraşdıraraq öz ikonu olan tam ekran tətbiq əldə edə bilərsiniz. Quraşdırıldıqdan sonra dərhal açılır və məşq rejimi tamamilə oflayn işləyir."],
          note: "Android-də və masaüstü Chrome/Edge-də quraşdırma düyməsi hər şeyi edir. iPhone/iPad-də Apple quraşdırmaya yalnız Safari vasitəsilə icazə verir: Paylaş düyməsi → “Əsas ekrana əlavə et” — lazım olanda klient bu addımları göstərir. Tətbiq quraşdırıldıqdan sonra düymə yox olur." },
        { id: "platforms",
          t: "Platformalar və brauzerlər",
          b: [
            "Klient istənilən sistemdə istənilən müasir brauzerdə işləyir — Windows, macOS, Linux, Android, iOS. Bir neçə funksiya daha yeni brauzer API-lərinə əsaslanır; API olmadıqda funksiya sınmaq əvəzinə özünü gizlədir və ya səbəbini izah edir. Bilməli olduğunuz əsas fərqlər:"],
          list: [
            "Chrome / Edge (masaüstü): hər şey işləyir, .pdb jurnalının qovluğa yazılması da daxil.",
            "Firefox: .pdb jurnalının qovluğa yazılmasından başqa hər şey (API hələ mövcud deyil).",
            "Safari / iOS: quraşdırma Paylaş → Əsas ekrana əlavə et vasitəsilədir; vibrasiya yoxdur; iPhone-da tam ekran məhduddur; səs ilk toxunuşunuzdan sonra başlayır.",
            "Android: Chromium brauzerlərində tam dəstək, vibrasiya və Geri düyməsinin davranışı daxil."] },
        { id: "avatar",
          t: "Ləqəb və avatar",
          b: [
            "Qoşulmazdan əvvəl giriş ekranında ləqəbinizi və avatarınızı seçin. pokerth.net-də ləqəbiniz hesab adınızdır; avatarlar avatar serveri vasitəsilə digər oyunçularla paylaşılır.",
            "Avatarınız qoşulanda göndərilir və bütün oyunçular eyni avatarı görür. Qoşulu olarkən onu dəyişsəniz, yeni avatar növbəti qoşulmanızdan tətbiq olunur. Baş hərf (Aa) göndərilmir: digər oyunçular standart avatarı görür."] }
      ]
    },
    {
      id: "rules", icon: "🃏", title: "Poker qaydaları",
      sections: [
        { id: "basics",
          t: "Qısaca Texas Hold’em",
          b: [
            "PokerTH No-Limit Texas Hold’em oynayır. Hər oyunçu iki şəxsi kart (cib kartları) alır. Sonra masanın ortasına beş ümumi kart üzü yuxarı paylanır. İki kartınızın və beş ümumi kartın istənilən birləşməsindən düzələn ən yaxşı beş kartlıq kombinasiya bankı qazanır."] },
        { id: "blinds",
          t: "Blaindlər və diler düyməsi",
          b: [
            "Hər əldən əvvəl iki məcburi mərc bankı başladır: diler düyməsinin solundakı iki oyunçunun qoyduğu kiçik blaind və böyük blaind. Düymə hər əldən sonra saat əqrəbi istiqamətində bir yer irəliləyir, beləliklə hamı növbə ilə blaind ödəyir. Oyun davam etdikcə blaindlər müntəzəm aralıqlarla artır.",
            "Masada düymə və blaindlər fişkalarla işarələnir: D (diler), SB (kiçik blaind), BB (böyük blaind)."] },
        { id: "streets",
          t: "Dörd mərc raundu",
          list: [
            "Pre-flop — cib kartları paylandıqdan sonra ilk mərc raundu böyük blaindin solundan başlayır.",
            "Flop — üç ümumi kart açılır, ardınca mərc raundu gəlir.",
            "Turn — dördüncü ümumi kart, sonra daha bir mərc raundu.",
            "River — beşinci və sonuncu ümumi kart, sonra son mərc raundu."],
          b: [
            "Əldə qalan hər oyunçu banka eyni məbləğ qoyduqda (və ya all-in olduqda) mərc raundu bitir."] },
        { id: "actions",
          t: "Növbəniz gələndə nə edə bilərsiniz",
          list: [
            "Fold — əldən imtina edin. Kartlarınız atılır və artıq bank uğrunda mübarizə aparmırsınız.",
            "Check — mərc qoymadan keçin. Yalnız call ediləcək heç nə olmadıqda mümkündür.",
            "Call — cari mərcə bərabərləşdirin.",
            "Bet — bu küçədə hələ heç kim mərc qoymayıbsa, mərci açın.",
            "Raise — mövcud mərci artırın. Minimum raise əvvəlki mərcə və ya raise-ə bərabərdir.",
            "All-In — bütün stekinizi qoyun. Əhatə etdiyiniz məbləğə qədər əldə qalırsınız."] },
        { id: "showdown",
          t: "Showdown və bölünən banklar",
          b: [
            "River mərc raundundan sonra birdən çox oyunçu qalırsa, kartlar açılır və ən yaxşı kombinasiya qazanır — qalib kombinasiya ümumi kartların altında göstərilir. Oyunçu tam mərclərdən az məbləğə all-in olduqda yan banklar yaranır: hər oyunçu yalnız töhfə verdiyi bank hissəsini qazana bilər. Bərabər kombinasiyalar bankı bölür.",
            "Hamı kartlarını açmalı deyil: sonuncu mərc və ya raise edən oyunçudan başlayaraq, kart yalnız artıq açıq olanı üstələyirsə göstərilir. Kartlarını atmaq hüququ olan hər kəs onları gizli saxlayır və yenə də açmaq üçün Göstər düyməsi alır."] },
        { id: "hands",
          t: "Kombinasiyaların sıralaması",
          b: [
            "Ən zəifdən ən güclüyə:"],
          list: [
            "1. Yüksək kart — kombinasiya yoxdur; ən yüksək kart həll edir.",
            "2. Cüt — eyni dəyərli iki kart.",
            "3. İki cüt — iki fərqli cüt.",
            "4. Üçlük — eyni dəyərli üç kart.",
            "5. Streyt — ardıcıl beş kart (Tuz yüksək və ya aşağı sayılır).",
            "6. Flaş — eyni rəngdə beş kart.",
            "7. Full-hauz — üçlük üstəgəl cüt.",
            "8. Kare — eyni dəyərli dörd kart.",
            "9. Streyt flaş — hamısı eyni rəngdə olan streyt.",
            "10. Royal flaş — Ondan Tuza qədər, hamısı eyni rəngdə. Mümkün olan ən yaxşı kombinasiya."] }
      ]
    },
    {
      id: "game", icon: "🎮", title: "Oyun ekranı",
      sections: [
        { id: "actionbar",
          t: "Hərəkət paneli",
          b: [
            "Növbəniz gələndə aşağıdakı hərəkət paneli dörd düyməyə qədər işıqlanır: Fold (qırmızı), Check / Call (mavi), Bet / Raise (yaşıl — vurğulanan əsas hərəkət) və All-In (tünd qırmızı). Check / Call düyməsi call ediləcək dəqiq məbləği göstərir; Bet / Raise qoymaq üzrə olduğunuz məbləği göstərir. River-dən sonra All-In kartlarınızı açmaq üçün Göstər düyməsinə çevrilə bilər."] },
        { id: "betctl",
          t: "Mərcinizi seçmək",
          b: [
            "Raise məbləğini rəqəm sahəsi, sürüşdürücü və ya sürətli 1/3 · 1/2 · Bank düymələri (cari bankın hissələri) ilə təyin edin. Məbləğlər avtomatik yuvarlaqlaşdırılır və minimum ilə maksimum qanuni raise arasında saxlanılır. Böyük blaindlərlə düşünməyi üstün tutursunuzsa, bir seçim bütün məbləğləri fişkalar əvəzinə BB ilə göstərir."] },
        { id: "preselect",
          t: "Hərəkəti əvvəlcədən seçmək",
          b: [
            "Növbəniz gəlməzdən əvvəl hərəkəti əvvəlcədən hazırlaya bilərsiniz: düyməyə toxunun, o qızılı çərçivə və kiçik qızılı nöqtə alır. Növbəniz gələndə hərəkət dərhal icra olunur. Əvvəlcədən seçilmiş Fold, check pulsuz olduqda avtomatik Check-ə çevrilir — heç vaxt boşuna fold etmirsiniz. Əvvəlcədən seçimlər hər yeni əldə, küçə dəyişəndə və showdown-da sıfırlanır, vəziyyət dəyişdikdə isə (məsələn call məbləği dəyişəndə) ləğv olunur."] },
        { id: "automodes",
          t: "Avto rejimlər",
          b: [
            "Hərəkət düymələrinin yanındakı açılan siyahı üç oyun rejimi təklif edir: Əl ilə, Avto Check/Call və Avto Check/Fold. Avto rejimlər siz geri keçənə qədər sizin yerinizə oynayır — hərəkətə istənilən əl ilə klik dərhal Əl ilə rejiminə qaytarır."] },
        { id: "readtable",
          t: "Masanı oxumaq",
          b: [
            "Hər oyunçu qutusu avatarı, adı, steki və cari mərci göstərir. Diler və blaindlər D / SB / BB fişkaları ilə işarələnir. Qutudakı rəngli nişan oyunçunun son hərəkətini göstərir; nazik mavi zolaq onun düşünmə vaxtını geri sayır. Növbəsi olan oyunçunun qutusu parlayır; öz qutunuz isə növbəniz gələndə döyünən qızılı çərçivə alır.",
            "Masanın üstündəki vəziyyət zolağı ümumi bankı, cari küçənin mərclərini, mərhələni (Pre-flop, Flop, Turn, River), oyun və əl nömrələrini göstərir. Fold edən oyunçuların kartları yarımşəffafdır; çıxan oyunçular solğunlaşdırılır. Əlin sonunda qalib pəncərəsi kimin nə qazandığını yekunlaşdıra bilər — onu seçimlərdə söndürmək olar."] },
        { id: "seatlayout",
          t: "Oturacaqların yerləşməsi",
          b: [
            "Veb genişləndirməsi olaraq oyunçu qutularının düzülüşünü Əlavə seçimlər → Oturacaqlar bölməsində seçmək olar: Avtomatik rəsmi klienti izləyir (portretdə sabit yerlər, albomda hesablanmış ellips), ya da Portret və ya Albom düzülüşünü məcburi edin — Fərdi isə hər oturacağı özünüz yerləşdirməyə imkan verir: hər qutunu tam istədiyiniz yerə dartdığınız redaktə rejimi açılır və düzülüş saxlanılır."] },
        { id: "zoom",
          t: "Masanın yaxınlaşdırılması (telefonlar)",
          b: [
            "Kiçik ekranlarda böyüdücü düymələri masanı yaxınlaşdırır (2×) və barmaqla sürüşdürə bilərsiniz — yalnız hərəkət paneli sabit qalır; öz qutunuz da böyüdülür və növbəniz gələndə görünüş ona qayıdır. Görünüş avtomatik olaraq aktiv oturacağı izləyir və showdown-da ümumi görünüş üçün geri uzaqlaşır. Bunu Əlavə seçimlərdə söndürmək olar. Növbənizdə ümumi kartlar görünüşdən kənardadırsa, masanın yuxarısında onların kiçik surəti görünür; kartlara keçib qayıtmaq üçün ona toxunun."],
          note: "Telefon və planşetlərdə brauzerin öz iki barmaqla yaxınlaşdırması standart olaraq bloklanıb ki, yaxınlaşdırma jesti əlin ortasında təsadüfən işə düşməsin; istəsəniz onu Əlavə seçimlər → İstifadəçi interfeysi bölməsində yenidən aktivləşdirin." },
        { id: "protections",
          t: "Anti-peek və təsadüfi call-dan qoruma",
          b: [
            "İki istəyə bağlı qoruma: Anti-peek öz kartlarınızı onlara toxunana qədər gizli saxlayır (kimsə ekranınızı görə bildikdə faydalıdır), təsadüfi call qoruması isə böyük raise-dən dərhal sonra Call düyməsini qısa müddətə bloklayır ki, daha kiçik call-a yönəlmiş toxunuş təsadüfən artırılmış məbləğə düşməsin. Hər ikisi Əlavə seçimlərdədir."] }
      ]
    },
    {
      id: "info", icon: "📊", title: "Məlumat paneli",
      sections: [
        { id: "open",
          t: "Panelin açılması",
          b: [
            "Oyun zamanı məlumat paneli başlıqdan (və ya Alt+L / Alt+I ilə) açılır və üç vərəqi var: Jurnal, Şanslar və Statistika. Telefonlarda masanın üstündə üzür; daha böyük ekranlarda dartıla və ölçüsü dəyişdirilə bilən pəncərədir — köçürmək üçün ⣿ tutacağından, ölçüsünü dəyişmək üçün kənarlarından tutun. Onun mövqeyi yadda saxlanılır."] },
        { id: "log",
          t: "Oyun jurnalı",
          b: [
            "Jurnal vərəqi bütün oyunu əl-əl qeyd edir: blaindlər, məbləğləri ilə hər hərəkət, açılan kartlar və qaliblər, tez oxunması üçün rənglərlə kodlaşdırılıb. Sessiyanı sonra nəzərdən keçirmək istəsəniz, ixrac düyməsi jurnalı fayl kimi saxlayır."] },
        { id: "odds",
          t: "Şanslar (ehtimal monitoru)",
          b: [
            "Şanslar vərəqi cari əliniz üçün 10 kombinasiya kateqoriyasının hər biri ilə — Yüksək kartdan Royal flaşa qədər — başa çatmağın canlı ehtimalını göstərir, hər biri ikonu, faizi və zolağı ilə. Fold etdikdən sonra görüntü boz rəngə keçir. O, yalnız öz kartlarınızdan və ümumi kartlardan istifadə edir: rəqiblərinizin göstərmədiyi heç nəyi görmür."] },
        { id: "journal",
          t: "Əl jurnalları və Jurnallar pəncərəsi",
          b: [
            "Canlı jurnaldan əlavə, oynadığınız hər əl rəsmi klientin .pdb jurnal faylları ilə eyni formatda brauzerinizdə lokal olaraq qeyd olunur. Jurnallar pəncərəsi (Əlavə seçimlər → Jurnal mesajları → Jurnalları idarə et…) sessiyalarınızı siyahılayır və onlarla işləməyə imkan verir: axtarış və vurğulama ilə sessiyanı önizləyin, oyuna görə filtrləyin, HTML və ya sadə mətn kimi ixrac edin, xam .pdb faylını saxlayın və ya masaüstü klientin qeyd etdiyi .pdb-ni idxal edin. Sessiyalar bir-bir və ya hamısı birdən (təsdiqlə) silinə bilər, avtomatik saxlama parametri isə yalnız son 7, 30, 90, 180 və ya 365 günü saxlaya bilər. Özünüzün idxal etdiyi jurnallar heç vaxt avtomatik silinmir. İkinci parametr neçə sessiyanın saxlanılacağını məhdudlaşdırır və siyahı sütunu dartılaraq genişləndirilə bilər.",
            "Bir anda bir neçə sessiyanı silmək üçün Seç… düyməsi siyahını işarə qutularına çevirir: silmək istədiklərinizi işarələyin və Sil düyməsi bir təsdiqdən sonra bütün dəstəni silir. Kompüterdə sessiyaları bir-bir əlavə etmək üçün Ctrl (⌘) + klik, bütöv aralığı götürmək üçün isə Shift + klik də edə bilərsiniz.",
            "Təhlil düyməsi sessiya üzrə əl təhlili aparır və jurnalı pokerth.net təhlil xidmətinə göndərə bilər. Açıq şəkildə ixrac və ya yükləmədikcə hər şey cihazınızda qalır."] },
        { id: "logopts",
          t: "Jurnal seçimləri",
          b: [
            "Əlavə seçimlər → Jurnal mesajları bölməsində jurnalı aktivləşdirə və ya söndürə və yazma intervalını seçə bilərsiniz, masaüstü klientdəki eyni üç parametrlə: hər hərəkətdən sonra, hər əldən sonra (standart) və ya hər oyundan sonra. Başqa bir seçim .pdb faylını seçdiyiniz qovluğa yazır və onu həmin intervalda, səhifədən çıxanda isə bir daha yeniləyir ki, başqa alət oyunu canlı izləyə bilsin."],
          note: "Lokal qovluğa yazmaq File System Access API tələb edir: yalnız masaüstü Chrome, Edge və Opera. Başqa yerlərdə seçim səbəbini izah edir və Jurnallar pəncərəsindən əl ilə ixrac mövcud qalır. Brauzer faylı yalnız əvəz edə bilər, heç vaxt ona əlavə edə bilməz, ona görə .pdb-ni oxuyan alət hər dəyişiklikdən sonra onu yenidən açmalıdır." },
        { id: "assist",
          t: "Köməkçi (əlin gücü)",
          b: [
            "Şanslar vərəqinin yuxarısında köməkçi banneri əlinizi sizin üçün oxuyur. Flopdan əvvəl başlanğıc əlinizi adlandırır və ulduzlarla qiymətləndirir; flopdan etibarən cari ən yaxşı kombinasiyanızı və qısa simulyasiyadan sonra əli qazanma şansınızı faizlə göstərir, qırmızıdan (zəif) yaşıla (güclü) rəngli göstərici ilə. Ehtimal monitoru kimi, yalnız görə bildiyiniz məlumatdan istifadə edir.",
            "Əlavə seçimlər → Oturacaqlar bölməsində iki görünüş üslubu mövcuddur: Seqmentlər (on blok) və ya klassik irəliləyiş zolağı. Bütün köməkçi funksiyası Əlavə seçimlər → Köməkçi bölməsində söndürülə bilər."] },
        { id: "assistwin",
          t: "Üzən vidcet kimi köməkçi",
          b: [
            "Köməkçi bloku paneldən ayrılaraq həmişə üstdə olan öz kiçik pəncərəsinə çıxarıla bilər: blokdakı ayırma düyməsindən istifadə edin, sonra onu masanın üstündə istənilən yerə köçürün və ölçüsünü dəyişin — tam panel açıq olmadan əlinizin gücünü izləmək üçün əlverişlidir. Bərkitmə düyməsi onu Şanslar vərəqinə qaytarır və mövqeyi yadda saxlanılır. Panelin içində Köməkçi ilə ehtimallar arasındakı dartma tutacağı yeri ikisi arasında bölüşdürməyə imkan verir."] },
        { id: "stats",
          t: "Statistika",
          b: [
            "Statistika vərəqi sessiyanızı izləyir: oynanılan əllər, görülən floplar, showdown-lar, qələbə faizləri və s. Statistikanın izlənilməsi Əlavə seçimlərdə söndürülə bilər."] },
        { id: "hud",
          t: "Oturacaqlarda statistika HUD-u",
          b: [
            "HUD jurnallarınızda qeyd etdiyiniz əllərdən qurulan kiçik statistika qutusunu hər oyunçunun oturacağının yanına bərkidir: müşahidə edilən əllərin sayı, sonra VPIP (pre-flopda nə qədər tez-tez könüllü pul qoyur), PFR (pre-flop raise-lər) və AF (aqressivlik əmsalı), passivdən aqressivə rənglərlə kodlaşdırılıb. Onların altında nişan oyunçunu sadə sözlərlə yekunlaşdırır — Sıx-Passiv, Boş-Aqressiv və s. — yanında kiçik siferblat var, onun işıqlı dörddəbiri soldan sağa sıxdan boşa, aşağıdan yuxarıya passivdən aqressivə oxunur. Nişan ilk əldən göstərilir, lakin 25 ələ qədər solğun qalır, sonra etibarlı olur. Tam rəqəm dəsti (3-bet, continuation bet, 3-bet-ə fold, steal cəhdləri, showdown faizləri…) olan ətraflı pəncərə üçün qutuya toxunun, bir şeyi örtürsə qutunu dartıb köçürün.",
            "HUD yalnız öz masalarınızda gördüklərinizi bilir — lokal əl jurnallarınızı oxuyur, ona görə jurnal aktiv olmalıdır və rəqəmlər kifayət qədər əldən sonra mənalı olur. Standart olaraq deaktivdir: onu Əlavə seçimlər → Köməkçi bölməsində aktivləşdirin."] },
        { id: "handsbtn",
          t: "Kombinasiyaların icmalı",
          b: [
            "Masa örtüyündəki poker kombinasiyaları ikonu istənilən vaxt 10 kombinasiyanın qısa icmalını açır — öyrənərkən əlverişlidir. Onu Əlavə seçimlərdə gizlətmək olar."] }
      ]
    },
    {
      id: "chat", icon: "💬", title: "Çat və sosial",
      sections: [
        { id: "panels",
          t: "Lobbi çatı və oyun çatı",
          b: [
            "Lobbidə bir çat, masada isə başqa bir çat var. Telefonlarda oyun çatı masanın üstündə üzür; daha böyük ekranlarda dartıla və ölçüsü dəyişdirilə bilən pəncərədir. Çat düyməsindəki nişan oxunmamış mesajları sayır."] },
        { id: "typing",
          t: "Yazma köməkçiləri",
          list: [
            "Tab ləqəbi tamamlayır — uyğunluqlar arasında keçmək üçün Tab-ı yenidən basın.",
            "↑ / ↓ öz mesaj tarixçənizə baxır.",
            "Emoji düyməsi tam seçicini açır; : yazmaq da yazdıqca emotlar təklif edir."] },
        { id: "emotes",
          t: "Emotlar və smayliklər",
          b: [
            "Çat emot qısa kodlarını rəsmi masaüstü klientdə olduğu kimi çevirir: iki nöqtə arasında ad yazın, o emojiyə çevrilir — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… 1 900-dən çox kod dəstəklənir (tam GitHub dəsti). Klassik mətn smaylikləri də çevrilir: :-) ;) :D xD :P <3 və təxminən səksən başqası.",
            ": yazmaq yazdıqca kodu tamamlayan təklif pəncərəsini açır (seçmək üçün ↑/↓, qəbul etmək üçün Tab və ya Enter). Emoji çevrilməsi Əlavə seçimlər → Çat bölməsində tamamilə söndürülə bilər."] },
        { id: "commands",
          t: "Çat əmrləri",
          b: [
            "Çat slash əmrlərini başa düşür. İkisi başqalarına görünür:"],
          keys: [
            ["/me <text>", "“* adınız mətn” kimi göstərilən hərəkət mesajı   ⟦/me <mətn>⟧"],
            ["/emoji <emoji>", "Emoji reaksiyası oxudur (reaksiya seçicisinin göndərdiyi)   ⟦/emoji <emoji>⟧"]] },
        { id: "diagcmds",
          t: "Diaqnostika əmrləri",
          b: [
            "Qalan hər şey lokaldır: cavablar yalnız sizə göstərilir və masaya heç nə göndərilmir. Hamısını siyahılamaq üçün /help yazın. Ən faydalıları:"],
          keys: [
            ["/help", "Bütün əmrləri siyahıla   ⟦/help⟧"],
            ["/update", "Yeni versiyanı yoxla və yenilə   ⟦/update⟧"],
            ["/lang <code>", "Dili dəyiş (məs. /lang fr)   ⟦/lang <code>⟧"],
            ["/sound on|off", "Oyun səslərini aç/söndür   ⟦/sound on|off⟧"],
            ["/zoom", "Masa böyüdücüsünü aç/söndür   ⟦/zoom⟧"],
            ["/clear", "Çatı lokal olaraq təmizlə   ⟦/clear⟧"],
            ["/table", "Cari oyun məlumatı (blaindlər, oyunçular, steklər)   ⟦/table⟧"],
            ["/diag · /netdbg · /fps", "Klient vəziyyəti, şəbəkə və kadr tezliyi diaqnostikası   ⟦/diag · /netdbg · /fps⟧"],
            ["/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg", "Təkmil sazlama (kartlar, protokol, audio, yaddaş, oturacaqlar)   ⟦/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg⟧"],
            ["/copy", "Son əmrin cavabını mübadilə buferinə kopyala   ⟦/copy⟧"]] },
        { id: "privatemsg",
          t: "Şəxsi mesajlar",
          b: [
            "Bütün lobbi oxumadan bir oyunçuya yazın. Oyunçular siyahısında adın yanındakı zərf onunla yazışma açır; lobbi başlığındakı zərf isə sonuncunu yenidən açır. Yazışmalar bu cihazda saxlanılır və qayıdanda yerində olur, beləliklə günlər sonra davam etdirilən söhbət öz tarixçəsini daşıyır — zərfdəki qırmızı say hələ oxumadıqlarınızı göstərir, pəncərə başlığındakı zibil qutusu isə yazışmanı birdəfəlik silir."],
          keys: [
            ["/msg <nickname> <text>", "Lobbi çatından şəxsi mesaj göndər   ⟦/msg <ləqəb> <mətn>⟧"],
            ["/msg \"<nickname with spaces>\" <text>", "Eyni, ləqəbdə boşluq olduqda   ⟦/msg \"<boşluqlu ləqəb>\" <mətn>⟧"]],
          note: "Mesajlar 128 simvolla məhduddur. Server gedən masada oturan oyunçuya şəxsi mesaj çatdırmır və tarixçə yalnız bu brauzerdə saxlanılır — başqa cihaza sizinlə keçmir." },
        { id: "reactions",
          t: "Emoji reaksiyaları",
          b: [
            "Reaksiya düyməsi oturacağınızın üstündə effektlə oxunan 30 animasiyalı reaksiyadan (🎉, 😂, 😱, 🔥…) ibarət seçicini açır; bunu masadakı hamı görür — masaüstü klientdəki oyunçular da. Reaksiyalar Əlavə seçimlərdə tamamilə söndürülə bilər."] },
        { id: "translate",
          t: "Hamını başa düşmək",
          b: [
            "Çat tərcüməsi aktiv olduqda göstəricinizin altındakı sətirdə — sensor ekranda isə toxunduğunuz sətirdə — tərcümə düyməsi görünür və həmin mesajı brauzerin daxili tərcüməçisi ilə sizin dilinizdə göstərir. Onu Əlavə seçimlər → Çat bölməsində hər sətirdə daimi göstərmək olar; ümumi masa abreviaturalarını (gg, nh, utg…) izah edən ipucu da oradadır."],
          note: "Tərcümə Google Translate xidmətindən istifadə edir və hər brauzerdə işləyir — sadəcə internet bağlantısı lazımdır. Mesaj tərcümə xidmətinə yalnız onun tərcümə düyməsinə toxunduqda göndərilir, heç vaxt avtomatik deyil." },
        { id: "social",
          t: "Oyunçular: profil, dəvət, ignor",
          b: [
            "Kartını açmaq üçün istənilən oyunçuya — masada və ya lobbi siyahısında — toxunun: profil və statistika, onu oyununuza dəvət edin və ya ignor edin (onun çat mesajları gizlədilir; ignor istənilən vaxt geri qaytarıla bilər). Dəvət/ignordan əvvəl təsdiq seçimlərdə aktivləşdirilə bilər."] }
      ]
    },
    {
      id: "lobby", icon: "🏛️", title: "Lobbi və oyunlar",
      sections: [
        { id: "list",
          t: "Oyun siyahısı",
          b: [
            "Lobbi serverdəki bütün masaları siyahılayır. Hər qeyd oyunçu sayını, oyun növünü, parol və ya dəvət tələb olunduqda qıfılı və vəziyyət nişanını göstərir: “Gözləmə” (yaşıl — oyun başlamayıb, boş yer varsa qoşula bilərsiniz), “Davam edir” (isti rəng — izləyicilərə icazə verildikdə canlı izlənilə bilər) və “Bağlıdır” (solğun). Dolu masa sadəcə dolu say göstərir, məsələn 10/10; nişan rəngləri aktiv temanı izləyir.",
            "Filtr siyahısı masaüstü klientdə olduğu kimi siyahını daraldır, hər seçim əvvəlkindən sərtdir: yalnız açıq oyunlar → dolu masaları da gizlət → sonra yalnız şəxsi olmayan, yalnız şəxsi və ya yalnız reytinq oyunları. Seçiminiz yadda saxlanılır. Axtarış sahəsi oyunu ada görə tapır, oyunçular nişanı isə onlayn olan hər kəsin axtarıla və sıralana bilən siyahısını açır."] },
        { id: "join",
          t: "Qoşulmaq və izləmək",
          b: [
            "Açıq oyun seçin və ona qoşulun — qıfıl parolun tələb olunduğunu bildirir. İzləyicilərə icazə verən gedən oyunlar canlı izlənilə bilər: masanı və çatı görürsünüz, lakin cib kartları gizli qalır və hərəkət edə bilməzsiniz."] },
        { id: "gameinfo",
          t: "Oyun məlumatı",
          b: [
            "Qoşulmazdan əvvəl oyun məlumatı kartı masanı müəyyən edən hər şeyi göstərir: oyun növü, blaindlər və onların necə artdığı (ikiqat və ya əl ilə siyahı), başlanğıc pul, hərəkət vaxt limiti, əllər arası gecikmə və artıq kimin oturduğu."] },
        { id: "create",
          t: "Oyun yaratmaq",
          b: [
            "Öz masanızı yaradın: ad, oyunçu sayı, başlanğıc pul, ilk kiçik blaind və artım cədvəli, hərəkət vaxt limiti və izləyicilərə icazə verilib-verilmədiyi. Dörd oyun növü var: Normal (hər kəs), yalnız qeydiyyatlı oyunçular, yalnız dəvətlə və Ranking (rəsmi reytinqə sayılır — orada parola icazə yoxdur). Sevimli parametrləriniz saxlanıla və yenidən yüklənə bilər."] },
        { id: "invites",
          t: "Dəvətlər",
          b: [
            "Oyunçular sizi öz masalarına dəvət edə bilər; qəbul və ya rədd edə biləcəyiniz bildiriş alırsınız. Yalnız dəvətlə olan oyuna daxil olmağın yeganə yolu dəvət olunmaqdır."] }
      ]
    },
    {
      id: "pthnet", icon: "🌐", title: "pokerth.net",
      sections: [
        { id: "account",
          t: "Hesabınız",
          b: [
            "Rəsmi İnternet serveri pokerth.net-dir. Orada oynamaq pulsuz pokerth.net hesabı tələb edir — saytda qeydiyyatdan keçin, sonra burada eyni ləqəb və parolla daxil olun. Bu veb klient masaüstü klientlə tam eyni serverə qoşulur: eyni hesablar, eyni masalar, eyni reytinqlər və masaüstü oyunçularla bir masada otura bilərsiniz."] },
        { id: "ranked",
          t: "Reytinq oyunları və mövsümlər",
          b: [
            "Ranking növlü oyunlar rəsmi mövsüm reytinqinə sayılır. Tətbiqdaxili profiliniz nə vaxt qoşulduğunuzu, cari mövsümdəki Yerinizi, Nəticənizi, orta göstəricinizi və oynanılan oyunları, üstəgəl son nəticələrinizi göstərir. Adi (reytinqsiz) oyunlar sadəcə əyləncə üçündür və heç nəyi dəyişmir."] },
        { id: "rankhow",
          t: "Reytinq necə hesablanır",
          b: [
            "Hər reytinq oyununda tutduğunuz yer xal qazandırır: birinci yer üçün 15, sonra yeddinci yerə qədər 9, 6, 4, 3, 2 və 1; səkkizincidən onuncuya qədər heç nə almır. Beləliklə bir masa cəmi 40 xal paylayır.",
            "Nəticəniz bu xalların cəmi deyil, oyun başına ortanızdır və oynanılan oyunların sayı ilə artan əmsalla yumşaldılır: bir neçə yaxşı nəticə zirvədə yerləşmək üçün kifayət deyil, müntəzəmlik də lazımdır — nə qədər çox oynasanız, Nəticəniz həqiqi ortanıza bir o qədər yaxınlaşır. Mövsümlər rüb davam edir: keçiddə hər şey arxivləşdirilir və sayğaclar sıfırdan başlayır, keçmiş mövsümlər isə mövcud qalır. Oyunda podium düyməsi masanızdakı oyunçuların mövsüm reytinqini göstərir."],
          note: "Xal şkalası və dəqiq düstur pokerth.net reytinq serveri tərəfindən təyin olunur və dəyişə bilər; saytdakı səhifələr istinad mənbəyidir." },
        { id: "rankings",
          t: "Reytinq səhifələri",
          b: [
            "Reytinq bəndi oyunçuya görə axtarıla bilən rəsmi PokerTH reytinqini, icma reytinqləri (BBC, WEC) ilə birlikdə açır. Reytinqlər sizi maraqlandırmırsa, bəndi Əlavə seçimlər → İcma bölməsində gizlətmək olar."] },
        { id: "cups",
          t: "İcma kubokları: BBC və WeCup",
          b: [
            "İki icma pokerth.net-də öz yarışlarını keçirir, hər birinin öz saytı və reytinqi var. Best Brainies Cup (BBC) 2013-cü ildə yaranmış pilləli turnirdir: Step 1-dən Step 4-ə qədər irəliləyirsiniz və hər Step 4 oyunundan sonra, kubok təqdim olunanda yeni mövsüm başlayır. WeCup (WEC) öz şkalasına malikdir, daha geniş paylanmış — birinci yer üçün 75 xal, sonra 45, 30, 20… — və onun nəticəsi ortanızı digər üzvlərlə müqayisədə oynadığınız oyunların sayına görə normallaşdırır.",
            "Hər iki reytinq kubok düyməsindən, PokerTH reytinqinin yanından açılır. Bu yarışların masa parametrləri oyun yaradanda şablonlar kimi gəlir (BBC Step 1-dən 4-ə, WEC, WEC Monthly Final və WEC Grand Final), beləliklə eyni şərtlərdə məşq edə bilərsiniz. İştirak üçün müvafiq kubokun saytında qeydiyyat lazımdır."],
          note: "Kuboklar sizə maraqlı deyilsə, bu məzmun Əlavə seçimlər → İcma bölməsində birdəfəyə gizlədilə bilər." },
        { id: "forumcups",
          t: "Forum kubokları və tədbirlər",
          b: [
            "pokerth.net forumu həmçinin Monthly Cup-a ev sahibliyi edir — ayın çempionu müəyyən edilməzdən əvvəl oyunçuların Gold, Silver və Bronze masalarına bölündüyü aylıq seriya — üstəgəl il ərzində birdəfəlik xüsusi kuboklar.",
            "Qeydiyyatlar, cədvəllər, masa parametrləri və nəticələr forumda dərc olunur, oyunlar isə digərləri kimi rəsmi serverdə oynanılır. Nəticələri izləmək üçün pokerth.net hesabı kifayətdir; kubokda iştirak müvafiq forum mövzusu vasitəsilədir."] },
        { id: "forumnews",
          t: "Lobbidə forum xəbərləri",
          b: [
            "Lobbi başlığındakı qəzet düyməsi pokerth.net forumunun son yazılarını açır, hər mövzu üçün bir qeyd, hər forum öz rəngində. Düymədəki nişan oxunmamış yazıları sayır; yazını açmaq (yeni vərəqdə) onu oxunmuş kimi qeyd edir, “Hamısını oxunmuş kimi qeyd et” isə hər şeyi birdəfəyə təmizləyir.",
            "Bu, veb əlavəsidir: düymə Əlavə seçimlərdə gizlədilə bilər (“Lobbinin başlığında forum düyməsi”).",
            "“Tədbirlər” vərəqi qarşıdan gələn BBC oyunlarını və növbəti Monthly Cup-ı qeydiyyatdan keçmiş oyunçuların sayı ilə, həmçinin son BBC, WEC və Monthly Cup qaliblərini göstərir. Vaxtlar sizin yerli vaxtınızladır, toxunuş isə icma saytını açır. “İcma məzmununu göstər (BBC / WEC)” seçimi bu vərəqi gizlədir."] },
        { id: "avatars",
          t: "Avatarlar və bayraqlar",
          b: [
            "pokerth.net-də avatarınız avatar serveri vasitəsilə digər oyunçulara paylanır və oyunçu qutularında kiçik ölkə bayrağı göstərilə bilər. Hər ikisi istəyə bağlıdır və seçimlərdə tənzimlənir."] }
      ]
    },
    {
      id: "offline", icon: "🏋️", title: "Məşq rejimi",
      sections: [
        { id: "what",
          t: "Bu nədir",
          b: [
            "Lokal / məşq rejimi kompüter rəqiblərə qarşı tam oyundur: bağlantı yoxdur, hesab yoxdur, heç nə riskdə deyil. Tətbiq quraşdırıldıqdan (və ya sadəcə bir dəfə ziyarət edildikdən) sonra tamamilə oflayn işləyir — oyunu öyrənmək, interfeysi sınamaq və ya təyyarə rejimində vaxt keçirmək üçün mükəmməldir."] },
        { id: "setup",
          t: "Oyunu qurmaq",
          b: [
            "Rəqiblərin sayını, başlanğıc pulu, blaindləri və artım cədvəlini, oyun sürətini seçin. Botların tərkibi və çətinliyi Əlavə seçimlər → Lokal oyun bölməsində tənzimlənə bilər — mülayim rəqiblərdən daha sərt, qarışıq masaya qədər."] },
        { id: "trophies",
          t: "Kuboklar",
          b: [
            "Məşq rejiminin öz irəliləyişi var: altı kateqoriya (irəliləyiş, bacarıq, üslub, formatlar, əyləncə və bir gizli) üzrə 28 kubok oynadıqca açılır — oynanılan əllər, qazanılan oyunlar, böyük bleflər, xüsusi kombinasiyalar və s. Kubok irəliləyişiniz toplanır və hesab parametrlərinin sinxronlaşdırılması aktiv olduqda cihazlar arasında birləşir."] },
        { id: "learn",
          t: "Öyrənmək üçün yaxşı yer",
          b: [
            "Digər fəsillərdəki hər şey burada da işləyir: ehtimal monitoru, köməkçi görüntüsü, əvvəlcədən seçim, klaviatura qısayolları. Məşq rejimi pokerth.net-ə keçməzdən əvvəl onları təzyiqsiz sınamaq üçün ən yaxşı yerdir."] }
      ]
    },
    {
      id: "style", icon: "🎨", title: "Üslub və səs",
      sections: [
        { id: "themes",
          t: "Temalar",
          b: [
            "Əlavə seçimlərin Üslub kateqoriyası bütün klientin görünüşünü dəyişir. Şablonlar hər şeyi bir toxunuşla təyin edir (klassik yaşıl kazino, rəsmi PokerTH görünüşü…); onların altında ayrı-ayrı oxlar rəng palitrasını, masa örtüyünü və kart üzlərini ayrıca incə tənzimləməyə imkan verir — istənilən oxu dəyişin və qarışığınız fərdi temaya çevrilir. Tünd, açıq və ya avtomatik rejim İstifadəçi interfeysində seçilir, seçimləriniz dərhal, hər ekranda tətbiq olunur və yadda saxlanılır."] },
        { id: "tablelook",
          t: "Masalar, dəstələr, oturacaqlar",
          b: [
            "Temadan əlavə, bir neçə element müstəqil şəkildə dəyişdirilə bilər: masa fonu, kart dəstəsi, kartın arxası (dəstəyə avtomatik uyğunlaşdırın və ya öz şəklinizi idxal edin), diler və blaind fişkaları, hərəkət düymələrinin üslubu və oyunçu qutularının görünüşünü dəyişən tam oturacaq paketləri. Hər şeyi Əlavə seçimlər → Üslub bölməsində seçin; dəyişikliklər masada dərhal görünür."] },
        { id: "music",
          t: "Musiqi pleyeri",
          b: [
            "Başlıq menyularındakı musiqi bəndi kiçik lounge musiqi pleyerini açır: pleylistdən trek seçin, oxut/fasilə, əvvəlki/növbəti, qarışdır və bir treki, bütün pleylisti təkrarla və ya heç nəyi. Səs səviyyəsi, seçilmiş trek və təkrar rejimi yadda saxlanılır. Oxutma heç vaxt özü başlamır — brauzerlər toxunuş tələb edir — və pleyer oyun səs effektlərindən tamamilə müstəqildir.",
            "Trekin adının altındakı iki baş barmaq oxunanın xoşunuza gəlib-gəlmədiyini bildirir. Hər cihaz üçün bir anonim səs, radiolar da daxil, istənilən vaxt onu dəyişə və ya geri götürə bilərsiniz; operator cəmləri açmasa, yalnız öz barmağınızı görürsünüz.",
            "iPhone və iPad-də pleyer standart olaraq sadə oxutmadan istifadə edir, beləliklə musiqi CarPlay, Bluetooth və ya kilidli ekranla davam edir; səs səviyyəsi o zaman cihazın və ya avtomobilin düymələri ilə tənzimlənir. “Tətbiqdaxili səs səviyyəsi” seçimi səs sürüşdürücüsünü, balansı və VU-metri geri qaytarır, lakin avtomobildə səs kəsilə bilər."] },
        { id: "sounds",
          t: "Səs effektləri",
          b: [
            "Oyun səsləri masaüstü klientdə olduğu kimi ayrıca aça/söndürülə bilən dörd kateqoriyada qruplaşdırılıb: oyun hərəkətləri (paylanan kartlar, Check, Call, Raise, sizin növbəniz…), lobbi çatı bildirişi, şəbəkə oyunu bildirişləri (oyunçu qoşuldu, oyun hazırdır) və blaind artımı bildirişi. Tək səs sürüşdürücüsü hamısını idarə edir, Əlavə seçimlər → Səs bölməsində."],
          note: "Bütün brauzerlər — xüsusən iOS — səhifəyə bir dəfə toxunmazdan əvvəl audio oxutmaqdan imtina edir. Oyun səssiz başlayırsa, istənilən yerə bir toxunuş səsi canlandırır; klient həmçinin iOS audio mühərrikini dayandırdıqda (gələn zəng, arxa fona keçmə…) onu avtomatik bərpa edir." },
        { id: "voice",
          t: "Səsli bildiriş və vibrasiya",
          b: [
            "İki əlavə kanal ekrana baxmadan sizi məlumatlandıra bilər: səsli elanlar cihazınızın nitq sintezi ilə oyun hadisələrini oxuyur, telefonlarda isə qısa vibrasiya növbənizi bildirə bilər. Hər ikisi veb genişləndirmələridir, cihazdan asılı olaraq standart olaraq aktiv və ya deaktivdir, Əlavə seçimlər → Mərclər və növbə bölməsində."],
          note: "Vibrasiya Android-də (Chromium brauzerləri) işləyir; Apple vibrasiya API-sini saytlara açmır, ona görə iPhone-lar vibrasiya edə bilmir. Səsli elanlar hər yerdə işləyir, lakin mövcud səslər və dillər sisteminizdən asılıdır — klient tapdığı ən uyğun variantdan istifadə edir." }
      ]
    },
    {
      id: "options", icon: "⚙️", title: "Seçimlər və qısayollar",
      sections: [
        { id: "where",
          t: "Seçimlər haradadır",
          b: [
            "Əlavə seçimlər istənilən başlıq menyusunun dişli çarx bəndindən açılır. Onlar masaüstü klientdəki kimi qruplaşdırılıb: İstifadəçi interfeysi, Üslub, Səs, Lokal oyun, Şəbəkə oyunu, İnternet oyunu, Ləqəblər / Avatarlar, Jurnal mesajları və Ehtiyat nüsxə və sıfırlama. Hər vebə xas funksiyanın orada öz açarı var, beləliklə istifadə etmədiyiniz hər şeyi söndürə bilərsiniz."] },
        { id: "cfgxml",
          t: "Masaüstü klientlə parametr mübadiləsi",
          b: [
            "Parametrləriniz klientlər arasında keçə bilər: Ehtiyat nüsxə və sıfırlama kateqoriyası rəsmi config.xml faylının (masaüstü və QML klientlərinin istifadə etdiyi ~/.pokerth/config.xml) ixracı/idxalını təklif edir. İxrac ortaq parametrləri yazır — ad, görüntü seçimləri, səslər, masa seçimləri, blaindlər, üslublar — idxal isə masaüstü faylını burada tətbiq edir. Bu klientin tanımadığı parametrlər faylda toxunulmadan qorunur.",
            "Oyunçu qeydləriniz də faylla birlikdə keçir — mətn və ulduz qiyməti, masaüstü klientlərin oxuduğu şəkildə yazılır. Rəng etiketləri bu klientdə qalır: rəsmi formatda onlar üçün sahə yoxdur, ona görə idxal heç vaxt sizinkilərə toxunmur."] },
        { id: "sync",
          t: "Sizi izləyən parametrlər",
          b: [
            "Hesabla oynadığınız zaman seçimləriniz, temanız, düymə təyinatlarınız, diliniz və məşq kuboklarınız sinxronlaşdırılır: bir cihazda nəyisə dəyişin, daxil olduğunuz növbəti cihaz onu götürür. Kubok irəliləyişi birləşdirilir, heç vaxt üzərinə yazılmır, beləliklə iki cihazda oynamaq həmişə hər ikisinin ən yaxşısını saxlayır."] },
        { id: "updates",
          t: "Aktual qalmaq",
          b: [
            "Klient özünü yeniləyir: yeni versiya yerləşdirildikdə banner sizi səhifəni yeniləməyə dəvət edir (və ya əl ilə yoxlamaq üçün çatda /update yazın). Bəzən funksiya barədə fikrinizi soruşan kiçik məhsul sorğusu görünə bilər — iştirak istəyə bağlıdır və sorğular Əlavə seçimlər → İcma bölməsində tamamilə söndürülə bilər."] },
        { id: "fkeys",
          t: "Rəsmi klaviatura qısayolları",
          b: [
            "Rəsmi PokerTH funksiya düymələri oyun zamanı işləyir — Alt+S isə hər yerdə işləyir:"],
          keys: [
            ["F1 / F2 / F3 / F4", "Fold · Check/Call · Bet/Raise · All-In (sıra seçimlərdə tərsinə çevrilə bilər)   ⟦F1 / F2 / F3 / F4⟧"],
            ["F5", "Kartlarınızı göstərin (mümkün olduqda)   ⟦F5⟧"],
            ["F6 / F7 / F8", "Əl ilə · Avto Check/Fold · Avto Check/Call   ⟦F6 / F7 / F8⟧"],
            ["Alt+M / Alt+K / Alt+F", "Əl ilə · Avto Check/Call · Avto Check/Fold   ⟦Alt+M / Alt+K / Alt+F⟧"],
            ["Alt+C / Alt+L / Alt+I", "Çat · Oyun jurnalı · Ehtimallar paneli   ⟦Alt+C / Alt+L / Alt+I⟧"],
            ["Alt+S", "Parametrlər — təkcə oyun zamanı deyil, tətbiqin istənilən yerində   ⟦Alt+S⟧"],
            ["F11", "Tam ekran   ⟦F11⟧"]],
          note: "Qısayollar fiziki klaviatura tələb edir. Mac-də F düymələri standart olaraq media idarəetməsidir: Fn düyməsini basılı saxlayın (və ya macOS parametrlərində “F1, F2 və s. düymələrini standart funksiya düymələri kimi istifadə et” seçimini aktivləşdirin). iPhone-da tam ekran iOS tərəfindən məhdudlaşdırılır — tətbiqi PWA kimi quraşdırmaq eyni tam ekran təcrübəsini verir." },
        { id: "webkeys",
          t: "Veb hərf düymələri",
          b: [
            "Veb genişləndirməsi olaraq tək hərfli düymələr və Alt+T də hərəkətləri işə salır və onların hər biri Əlavə seçimlər → Klaviatura qısayolları bölməsində yenidən təyin edilə bilər:"],
          keys: [
            ["F", "Fold   ⟦F⟧"],
            ["C", "Check / Call   ⟦C⟧"],
            ["R", "Raise   ⟦R⟧"],
            ["A", "All-In   ⟦A⟧"],
            ["1 / 2 / 3", "Mərc 1/3 · 1/2 · Bank   ⟦1 / 2 / 3⟧"],
            ["Alt+T", "Statistika paneli   ⟦Alt+T⟧"],
            ["Esc", "Ən üstdəki pəncərəni bağla (həmçinin Android Geri düyməsi)   ⟦Esc⟧"],
            ["↑ ↓ · ↵", "Lobbinin masa siyahısı (Tab ilə çatın): masa seçin · ona qoşulun   ⟦↑ ↓ · ↵⟧"]],
          note: "Android-də sistemin Geri düyməsi/jesti oyundan çıxmaq əvəzinə Escape kimi pəncərələri bağlayır (seçimlərdə tənzimlənir). iOS-da ekvivalent sistem düyməsi yoxdur — hər pəncərənin ✕ düyməsindən istifadə edin." }
      ]
    }
  ]
};
