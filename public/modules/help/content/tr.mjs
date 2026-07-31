// ── help/content/tr.mjs — Türkçe yardım külliyatı (3. parti) ────────────────
// en.mjs (referans) çevirisi. Yapı ve id'ler birebir aynı; yalnızca
// t / b / list / keys (etiketler) / note çevrildi. Poker terimleri
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) uygulamanın
// geleneği gereği İngilizce bırakıldı.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Başlarken',
      sections: [
        { id: 'modes', t: 'Üç oynama yolu',
          b: ['Giriş ekranında nasıl oynamak istediğini seç.'],
          list: [
            'İnternet — resmi pokerth.net sunucusunda, sıralamalarla çevrimiçi oyna. Bir pokerth.net hesabı gerekir; pokerth.net üzerinde kayıt ücretsizdir.',
            'Yerel / antrenman — botlara karşı çevrimdışı oyna. Ayarlanacak bir şey yok, bağlantısız çalışır ve ilerledikçe kupalar açılır.',
            'LAN / özel sunucu — yerel ağındaki ya da kendi makinendeki özel bir PokerTH sunucusuna bağlan.'] },
        { id: 'lan', t: 'LAN / özel sunucu',
          b: ['Üçüncü mod, senin veya bir arkadaşının çalıştırdığı herhangi bir PokerTH sunucusuna bağlanır — ev ağında, özel bir VPS\u2019te, nerede olursa. Sunucunun adresini ve portunu gir, sunucu şifreli port kullanıyorsa TLS\u2019yi işaretle ve bir takma adla giriş yap (sunucu izin veriyorsa misafir girişi de çalışır). Sonrasında masadaki her şey resmi sunucudakiyle tıpatıp aynı davranır.'] },
        { id: 'famboard', t: 'Aile sıralaması',
          b: ['Yalnızca özel sunucularda ve LAN oyunlarında istemci, takma ada göre birikimli istatistikler tutar — oynanan ve kazanılan eller ile oyunlar, en büyük kazanç, en iyi seri — ve bunları sunucu üzerinden paylaşır; böylece masadaki her cihaz aynı sıralamayı görür. pokerth.net oyunları asla bu şekilde izlenmez ve antrenman modu istatistikleri tamamen ayrı tutulur.'] },
        { id: 'language', t: 'Dil',
          b: ['Arayüz 36 dilde mevcut. İstediğin an Gelişmiş seçeneklerden (dişli menüsü), Kullanıcı arayüzü kategorisinden değiştirebilirsin. Poker aksiyon terimleri (Fold, Check, Call, Bet, Raise, All-In) gelenek gereği İngilizce kalır — masaüstü istemcideki gibi.'] },
        { id: 'pwa', t: 'Uygulama olarak yükleme',
          b: ['Bu istemci bir Progressive Web App: tarayıcı menüsünden (veya başlıktaki yükleme düğmesinden) yükleyerek kendi simgesi olan tam ekran bir uygulama elde edebilirsin. Yüklendikten sonra anında açılır ve antrenman modu tamamen çevrimdışı çalışır.'],
          note: 'Android\u2019de ve masaüstü Chrome/Edge\u2019de yükleme düğmesi her şeyi halleder. iPhone/iPad\u2019de Apple, yüklemeye yalnızca Safari üzerinden izin verir: Paylaş düğmesi \u2192 \u201cAna Ekrana Ekle\u201d — gerektiğinde istemci bu adımları gösterir. Uygulama yüklendikten sonra düğme kaybolur.' },
        { id: 'platforms', t: 'Platformlar ve tarayıcılar',
          b: ['İstemci her sistemdeki her modern tarayıcıda çalışır — Windows, macOS, Linux, Android, iOS. Birkaç özellik yeni tarayıcı API\u2019lerine dayanır; bir API yoksa özellik bozulmak yerine gizlenir ya da durumu açıklar. Bilinmesi gereken başlıca farklar:'],
          list: [
            'Chrome / Edge (masaüstü): .pdb günlüğünü bir klasöre yazma dahil her şey çalışır.',
            'Firefox: .pdb\u2019yi klasöre yazma dışında her şey (API henüz yok).',
            'Safari / iOS: yükleme Paylaş \u2192 \u201cAna Ekrana Ekle\u201d üzerinden; titreşim yok; iPhone\u2019da tam ekran sınırlı; ses ilk dokunuşundan sonra başlar.',
            'Android: Chromium tabanlı tarayıcılarda titreşim ve Geri tuşu davranışı dahil tam destek.'] },
        { id: 'avatar', t: 'Takma ad ve avatar',
          b: ['Bağlanmadan önce giriş ekranında takma adını ve avatarını seç. pokerth.net\u2019te takma adın hesap adındır; avatarlar, avatar sunucusu üzerinden diğer oyuncularla paylaşılır.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Poker kuralları',
      sections: [
        { id: 'basics', t: 'Kısaca Texas Hold\u2019em',
          b: ['PokerTH, No-Limit Texas Hold\u2019em oynar. Her oyuncuya iki kapalı kart (hole cards) dağıtılır. Ardından beş ortak kart masanın ortasına açık olarak konur. İki kartınla beş ortak kartın herhangi bir kombinasyonundan oluşan en iyi beş kartlık el potu kazanır.'] },
        { id: 'blinds', t: 'Blindler ve dağıtıcı düğmesi',
          b: ['Her elden önce iki zorunlu bahis potu besler: dağıtıcı düğmesinin solundaki iki oyuncunun koyduğu small blind ve big blind. Düğme her elden sonra saat yönünde bir koltuk ilerler; böylece herkes sırayla blind öder. Blindler oyun boyunca düzenli aralıklarla yükselir.',
              'Masada düğme ve blindler fişlerle işaretlenir: D (dağıtıcı), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Dört bahis turu',
          list: [
            'Pre-flop — kapalı kartlar dağıtıldıktan sonra ilk bahis turu big blind\u2019in solundan başlar.',
            'Flop — üç ortak kart açılır, ardından bir bahis turu gelir.',
            'Turn — dördüncü ortak kart, sonra bir bahis turu daha.',
            'River — beşinci ve son ortak kart, sonra son bahis turu.'],
          b: ['Elde kalan her oyuncu pota aynı miktarı koyduğunda (veya all-in olduğunda) bahis turu biter.'] },
        { id: 'actions', t: 'Sıran geldiğinde neler yapabilirsin',
          list: [
            'Fold — eli bırakmak. Kartların atılır ve potu artık kovalamazsın.',
            'Check — bahis koymadan geçmek. Yalnızca ödenecek bir şey yokken mümkündür.',
            'Call — mevcut bahsi görmek.',
            'Bet — bu sokakta henüz kimse bahis koymamışken bahsi açmak.',
            'Raise — mevcut bir bahsin üzerine yükseltmek. En küçük yükseltme, önceki bahse veya yükseltmeye eşittir.',
            'All-In — bütün yığınını koymak. Karşıladığın miktara kadar elde kalırsın.'] },
        { id: 'showdown', t: 'Showdown ve bölünen potlar',
          b: ['River bahis turundan sonra birden fazla oyuncu kaldıysa eller açılır ve en iyisi kazanır — kazanan kombinasyon ortak kartların altında gösterilir. Bir oyuncu tam bahislerden daha azıyla all-in olursa yan potlar oluşur: her oyuncu yalnızca katkıda bulunduğu pot dilimini kazanabilir. Berabere eller potu paylaşır.'] },
        { id: 'hands', t: 'El sıralaması',
          b: ['En zayıftan en güçlüye:'],
          list: [
            '1. High Card — kombinasyon yok; en yüksek kart belirler.',
            '2. Pair — aynı değerde iki kart.',
            '3. Two Pair — iki farklı çift.',
            '4. Three of a Kind — aynı değerde üç kart.',
            '5. Straight — ardışık beş kart (As en büyük veya en küçük sayılabilir).',
            '6. Flush — aynı türden beş kart.',
            '7. Full House — bir üçlü artı bir çift.',
            '8. Four of a Kind — aynı değerde dört kart.',
            '9. Straight Flush — tamamı aynı türden bir kent.',
            '10. Royal Flush — tek türde Ondan Asa. Olası en iyi el.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Oyun ekranı',
      sections: [
        { id: 'actionbar', t: 'Aksiyon çubuğu',
          b: ['Sıran geldiğinde alttaki aksiyon çubuğu en fazla dört düğmeyle yanar: Fold (kırmızı), Check / Call (mavi), Bet / Raise (yeşil — ana aksiyon, vurgulu) ve All-In (koyu kırmızı). Check / Call düğmesi görülmesi gereken tam tutarı, Bet / Raise ise koymak üzere olduğun tutarı gösterir. River\u2019dan sonra All-In, kartlarını göstermek için bir Show düğmesine dönüşebilir.'] },
        { id: 'betctl', t: 'Bahsini seçmek',
          b: ['Yükseltme tutarını sayı alanı, kaydırıcı veya hızlı düğmeler 1/3 \u00b7 1/2 \u00b7 Pot (mevcut potun kesirleri) ile ayarla. Tutarlar otomatik yuvarlanır ve izin verilen en küçük ile en büyük yükseltme arasında tutulur. Big blind cinsinden düşünmeyi seviyorsan, bir seçenek tüm tutarları fiş yerine BB olarak gösterir.'] },
        { id: 'preselect', t: 'Bir aksiyonu önceden seçmek',
          b: ['Sıran gelmeden önce bir aksiyonu kurabilirsin: bir düğmeye dokun, altın bir çerçeve ve küçük altın bir nokta alır. Sıran geldiğinde aksiyon anında gerçekleşir. Check bedavayken kurulu bir Fold otomatik olarak Check\u2019e dönüşür — asla boşuna pas etmezsin. Ön seçimler her yeni elde, her sokak değişiminde ve showdown\u2019da sıfırlanır; durum değişirse (örneğin görülecek tutar değişirse) iptal edilir.'] },
        { id: 'automodes', t: 'Otomatik modlar',
          b: ['Aksiyon düğmelerinin yanındaki açılır menü üç oyun modu sunar: Elle, Otomatik Check/Call ve Otomatik Check/Fold. Otomatik modlar sen geri dönene dek senin yerine oynar — bir aksiyona yapılan herhangi bir elle tıklama anında Elle moduna döndürür.'] },
        { id: 'readtable', t: 'Masayı okumak',
          b: ['Her oyuncu kutusu avatarı, adı, yığını ve mevcut bahsi gösterir. Dağıtıcı ve blindler D / SB / BB fişleriyle işaretlidir. Kutudaki renkli rozet oyuncunun son aksiyonunu belirtir; ince mavi bir çubuk düşünme süresini geriye sayar. Sırası gelen oyuncunun kutusu aydınlanır; sıran geldiğinde kendi kutun titreşen altın bir çerçeve alır.',
              'Masanın üstündeki durum çubuğu toplam potu, mevcut sokağın bahislerini, aşamayı (Pre-flop, Flop, Turn, River) ve oyun ile el numaralarını gösterir. Pas eden oyuncuların kartları yarı saydamdır; elenenler soluklaşır. El sonunda bir kazanan penceresi kimin ne kazandığını özetleyebilir — seçeneklerden kapatılabilir.'] },
        { id: 'seatlayout', t: 'Koltuk yerleşimi',
          b: ['Bir web eklentisi olarak oyuncu kutularının düzeni Gelişmiş seçenekler \u2192 Koltuklar\u2019dan seçilir: Otomatik resmi istemciyi izler (dikeyde sabit konumlar, yatayda hesaplanan elips), ya da Dikey veya Yatay düzeni zorlayabilirsin — Özel ise her koltuğu kendin yerleştirmeni sağlar: bir düzenleme modu belirir, her kutuyu tam istediğin yere sürüklersin ve düzen kaydedilir.'] },
        { id: 'zoom', t: 'Masa yakınlaştırma (telefonlar)',
          b: ['Küçük ekranlarda büyüteç düğmeleri masayı büyütür (2\u00d7) ve parmağınla kaydırabilirsin — kendi kutun ve aksiyon çubuğu sabit kalır. Görünüm etkin koltuğu otomatik izler ve showdown\u2019da genel bakış için uzaklaşır. Gelişmiş seçeneklerden kapatılabilir.'],
          note: 'Telefonlarda ve tabletlerde tarayıcının kendi kıstırarak yakınlaştırması varsayılan olarak engellidir; böylece bir yakınlaştırma hareketi elin ortasında kazara tetiklenmez. İstersen Gelişmiş seçenekler \u2192 Kullanıcı arayüzünden yeniden açabilirsin.' },
        { id: 'protections', t: 'Gizli bakış ve yanlışlıkla Call koruması',
          b: ['İki isteğe bağlı koruma: gizli bakış koruması, dokunana kadar kendi kartlarını kapalı tutar (birileri ekranını görebiliyorsa kullanışlı); yanlışlıkla Call koruması ise büyük bir yükseltmeden hemen sonra Call düğmesini kısa süre kilitler; böylece daha küçük bir Call için yapılan dokunuş kazara yükseltilmiş tutara denk gelmez. İkisi de Gelişmiş seçeneklerde.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Bilgi paneli',
      sections: [
        { id: 'open', t: 'Paneli açmak',
          b: ['Oyun sırasında bilgi paneli başlıktan (veya Alt+L / Alt+I ile) açılır ve üç sekmesi vardır: Günlük, Olasılıklar ve İstatistikler. Telefonda masanın üzerinde süzülür; büyük ekranlarda taşınabilir ve boyutlandırılabilir bir penceredir — taşımak için \u28ff tutamacını, boyutlandırmak için kenarları kavra. Konumu hatırlanır.'] },
        { id: 'log', t: 'Oyun günlüğü',
          b: ['Günlük sekmesi bütün oyunu el el kaydeder: blindler, tutarlarıyla her aksiyon, açılan kartlar ve kazananlar; hızlı okumak için hepsi renklidir. Bir oturumu sonra incelemek istersen dışa aktarma düğmesi günlüğü bir dosyaya kaydeder.'] },
        { id: 'odds', t: 'Olasılıklar (olasılık monitörü)',
          b: ['Olasılıklar sekmesi, mevcut elin için 10 el kategorisinden her biriyle bitirme olasılığını canlı gösterir — High Card\u2019dan Royal Flush\u2019a — her biri simgesi, yüzdesi ve çubuğuyla. Pas eder etmez görüntü soluklaşır. Yalnızca kendi kartlarını ve ortak kartları kullanır: rakiplerinin göstermediği hiçbir şeyi görmez.'] },
        { id: 'journal', t: 'El günlükleri ve \u201cGünlükler\u201d penceresi',
          b: ['Canlı günlüğün ötesinde, oynadığın her el resmi istemcinin .pdb günlük dosyalarıyla aynı biçimde tarayıcına yerel olarak kaydedilir. Günlükler penceresi (Gelişmiş seçenekler \u2192 Günlük mesajları \u2192 Günlükleri yönet\u2026) oturumlarını listeler ve onlarla çalışmanı sağlar: arama ve vurgulamayla bir oturumu önizlemek, oyuna göre süzmek, HTML veya düz metin olarak dışa aktarmak, ham .pdb dosyasını kaydetmek ya da masaüstü istemcinin kaydettiği bir .pdb\u2019yi içe aktarmak. Oturumlar tek tek veya hepsi birden silinir (onayla) ve otomatik saklama ayarı yalnızca son 7, 30, 90, 180 veya 365 günü tutabilir. Kendi içe aktardığınız kayıtlar asla otomatik olarak silinmez. İkinci bir ayar kaç oturumun saklanacağını sınırlar ve liste sütunu sürüklenerek genişletilebilir.',
              'Analiz düğmesi bir oturumda el analizi çalıştırır ve bir günlüğü pokerth.net analiz hizmetine gönderebilir. Açıkça dışa aktarmadıkça veya göndermedikçe her şey cihazında kalır.'] },
        { id: 'logopts', t: 'Günlük seçenekleri',
          b: ['Gelişmiş seçenekler \u2192 Günlük mesajları bölümünde günlüğü açıp kapatabilir ve yazma aralığını, masaüstü istemcisiyle aynı üç ayarla seçebilirsin: her faaliyetten sonra, her elden sonra (varsayılan) veya her oyundan sonra. Başka bir seçenek .pdb dosyasını seçtiğin bir klasöre yazar ve bu aralıkla güncel tutar, ayrıca sayfadan ayrılırken bir kez daha, böylece başka bir araç oyunu canlı izleyebilir.'],
          note: 'Yerel bir klasöre yazmak File System Access API gerektirir: yalnızca masaüstü Chrome, Edge ve Opera. Diğer yerlerde seçenek kendini açıklar ve Günlükler penceresinden elle dışa aktarma kullanılabilir kalır. Bir tarayıcı dosyayı yalnızca değiştirebilir, asla sonuna ekleyemez; bu yüzden .pdb dosyasını okuyan bir aracın her değişiklikten sonra dosyayı yeniden açması gerekir.' },
        { id: 'assist', t: 'Asistan (el gücü)',
          b: ['Olasılıklar sekmesinin en üstünde asistan afişi elini senin yerine okur. Floptan önce başlangıç elini adlandırır ve yıldızlarla puanlar; floptan itibaren mevcut en iyi kombinasyonunu ve hızlı bir simülasyondan sonra eli kazanma tahmini olasılığını yüzde olarak gösterir — kırmızıdan (zayıf) yeşile (güçlü) bir renk göstergesiyle. Olasılık monitörü gibi, yalnızca görebildiğin bilgiyi kullanır.',
              'Gelişmiş seçenekler \u2192 Koltuklar\u2019da iki görüntü stili vardır: Bölmeler (on blok) veya klasik bir ilerleme çubuğu. Asistan özelliğinin tamamı Gelişmiş seçenekler \u2192 Asistan\u2019dan kapatılabilir.'] },
        { id: 'assistwin', t: 'Yüzen araç olarak asistan',
          b: ['Asistan bloğu panelden ayrılıp hep üstte duran kendi küçük penceresine dönüşebilir: bloktaki ayırma düğmesini kullan, sonra masanın üzerinde istediğin yere taşı ve boyutlandır — bütün paneli açmadan el gücünü izlemek için pratik. Kenetleme düğmesi onu Olasılıklar sekmesine geri koyar ve konumu hatırlanır. Panelin içinde, Asistan ile olasılıklar arasındaki sürükleme tutamacı ikisi arasında alanı paylaştırmanı sağlar.'] },
        { id: 'stats', t: 'İstatistikler',
          b: ['İstatistikler sekmesi oturumunu izler: oynanan eller, görülen floplar, showdown\u2019lar, kazanma oranları ve dahası. İstatistik izleme Gelişmiş seçeneklerden kapatılabilir.'] },
        { id: 'hud', t: 'Koltuklarda istatistik HUD\u2019u (beta)',
          b: ['HUD, her oyuncunun koltuğunun yanına küçük bir istatistik kutusu iliştirir; kutu, günlüklerinde kaydettiğin ellerden oluşturulur: gözlenen el sayısı, ardından VPIP (pre-flop\u2019ta ne sıklıkta gönüllü para koyduğu), PFR (pre-flop yükseltmeleri) ve AF (agresiflik katsayısı), pasiften agresife renk kodlu. Altlarında bir rozet oyuncuyu kelimelerle özetler \u2014 Sıkı-Pasif, Gevşek-Agresif vb. \u2014 yanındaki küçük kadranın yanan çeyreği soldan sağa sıkıdan gevşeğe, aşağıdan yukarıya pasiften agresife okunur. Rozet daha ilk elden itibaren görünür ama 25 ele kadar soluk kalır; oradan sonra güvenilir olur. Tüm sayıları içeren ayrıntılı bir açılır pencere için bir kutuya dokun (3-bet, continuation bet, 3-bet\u2019e fold, çalma denemeleri, showdown oranları\u2026), bir şeyi kapatıyorsa kutuyu sürükle.',
              'HUD yalnızca kendi masalarında gördüklerini bilir — yerel el günlüklerini okur, dolayısıyla kayıt açık olmalı ve sayılar yeterince elden sonra anlam kazanır. Beta bir özelliktir, varsayılan olarak kapalı: Gelişmiş seçenekler \u2192 Asistan\u2019dan aç.'] },
        { id: 'handsbtn', t: 'Kombinasyonlara hızlı bakış',
          b: ['Masa örtüsündeki poker elleri simgesi, 10 kombinasyonun hızlı bir özetini her an açar — öğrenirken kullanışlı. Gelişmiş seçeneklerden gizlenebilir.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Sohbet ve sosyal',
      sections: [
        { id: 'panels', t: 'Lobi sohbeti ve masa sohbeti',
          b: ['Lobide bir, masada bir sohbet vardır. Telefonda masa sohbeti oyunun üzerinde süzülür; büyük ekranlarda taşınabilir ve boyutlandırılabilir bir penceredir. Sohbet düğmesindeki rozet okunmamış mesajları sayar.'] },
        { id: 'typing', t: 'Yazma yardımcıları',
          list: [
            'Tab bir takma adı tamamlar — eşleşmeler arasında dolaşmak için tekrar Tab\u2019a bas.',
            '\u2191 / \u2193 kendi mesaj geçmişinde gezinir.',
            'Emoji düğmesi tam bir seçici açar; : yazmak da yazarken emote önerir.'] },
        { id: 'emotes', t: 'Emote\u2019lar ve suratlar',
          b: ['Sohbet, emote kodlarını resmi masaüstü istemciyle birebir aynı biçimde çevirir: iki iki nokta arasına bir ad yaz, emojiye dönüşsün — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 1.900\u2019den fazla kod desteklenir (tam GitHub seti). Klasik metin suratları da çevrilir: :-) ;) :D xD :P <3 ve seksene yakın diğerleri.',
              ': yazmak, sen yazarken kodu tamamlayan bir öneri kutusu açar (seçmek için \u2191/\u2193, kabul için Tab veya Enter). Emoji çevirisi Gelişmiş seçenekler \u2192 Sohbet\u2019ten tamamen kapatılabilir.'] },
        { id: 'commands', t: 'Sohbet komutları',
          b: ['Sohbet, eğik çizgi komutlarını anlar. İkisi başkalarına görünür:'],
          keys: [
            ['/me <metin>', 'Aksiyon mesajı, \u201c* takmaadın metin\u201d olarak gösterilir'],
            ['/emoji <emoji>', 'Bir emoji tepkisi oynatır (tepki seçicisinin gönderdiğinin aynısı)']] },
        { id: 'diagcmds', t: 'Tanı komutları',
          b: ['Geri kalan her şey yereldir: yanıtları yalnızca sen görürsün ve masaya hiçbir şey gönderilmez. Hepsini listelemek için /help yaz. En yararlıları:'],
          keys: [
            ['/help', 'Tüm komutları listele'],
            ['/update', 'Yeni sürümü denetle ve yenile'],
            ['/lang <kod>', 'Dil değiştir (örn. /lang tr)'],
            ['/sound on|off', 'Oyun seslerini aç/sustur'],
            ['/zoom', 'Masa büyütecini aç/kapat'],
            ['/clear', 'Sohbeti yerel olarak temizle'],
            ['/table', 'Mevcut oyun bilgisi (blindler, oyuncular, yığınlar)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'İstemci durumu, ağ ve akıcılık tanıları'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'İleri hata ayıklama (kartlar, protokol, ses, depolama, koltuklar)'],
            ['/copy', 'Son komut yanıtını panoya kopyala']] },
        { id: 'reactions', t: 'Emoji tepkileri',
          b: ['Tepki düğmesi, koltuğunun üzerinde efektle oynayan ve bütün masaya görünen 30 animasyonlu tepkiden (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) oluşan bir seçici açar — masaüstü istemcideki oyuncular dahil. Tepkiler Gelişmiş seçeneklerden tamamen kapatılabilir.'] },
        { id: 'translate', t: 'Herkesi anlamak',
          b: ['Sohbet çevirisi açıkken çeviri düğmesi imlecin altındaki satırda — ya da dokunmatik ekranda dokunduğun satırda — belirir ve iletiyi tarayıcının çevirmeniyle kendi dilinde gösterir. Gelişmiş seçenekler → Sohbet altından tüm satırlarda kalıcı gösterilebilir; yaygın masa kısaltmalarını (gg, nh, utg…) açıklayan ipucu da oradadır.'],
          note: 'Çeviri, Google Translate hizmetini kullanır ve her tarayıcıda çalışır — yalnızca internet bağlantısı gerekir. Bir mesaj, ancak onun çeviri düğmesine dokunduğunda çeviri hizmetine gönderilir, asla otomatik olarak değil.' },
        { id: 'social', t: 'Oyuncular: profil, davet, yok sayma',
          b: ['Herhangi bir oyuncuya dokun — masada veya lobi listesinde — kartı açılsın: profil ve istatistikler, oyununa davet etmek ya da yok saymak (sohbet mesajları gizlenir; yok sayma her an geri alınabilir). Davet/yok sayma öncesi onay seçeneklerden açılabilir.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobi ve oyunlar',
      sections: [
        { id: 'list', t: 'Oyun listesi',
          b: ['Lobi, sunucudaki bütün masaları listeler. Her satır oyuncu sayısını, oyun türünü, parola veya davet gerektiğinde bir kilidi ve bir durum rozetini gösterir: \u201cBekliyor\u201d (yeşil — oyun başlamadı, boş koltuk varsa katılabilirsin), \u201cSürüyor\u201d (sıcak renk — izleyicilere izin varsa canlı izlenebilir) ve \u201cKapalı\u201d (soluk). Dolu bir masa 10/10 gibi dolu sayacından anlaşılır; rozet renkleri etkin temayı izler.',
              'Filtre açılır menüsü listeyi masaüstü istemciyle birebir aynı biçimde daraltır; her seçim öncekinden daha katıdır: yalnızca açık oyunlar \u2192 dolu masaları da gizleyerek \u2192 sonra yalnızca özel olmayanlar, yalnızca özeller ya da yalnızca dereceli oyunlar. Seçimin hatırlanır. Arama alanı bir oyunu adıyla bulur; oyuncu rozeti çevrimiçi herkesin aranabilir ve sıralanabilir listesini açar.'] },
        { id: 'join', t: 'Katılmak ve izlemek',
          b: ['Açık bir oyun seç ve katıl — kilit, parola gerektiğini gösterir. İzleyici kabul eden süren oyunlar canlı izlenebilir: masayı ve sohbeti görürsün ama kapalı kartlar gizli kalır ve aksiyon alamazsın.'] },
        { id: 'gameinfo', t: 'Oyun bilgisi',
          b: ['Katılmadan önce oyun bilgi kartı masayı tanımlayan her şeyi gösterir: oyun türü, blindler ve yükselme biçimi (ikiye katlama veya elle liste), başlangıç yığını, aksiyon süresi, eller arası duraklama ve kimlerin çoktan oturduğu.'] },
        { id: 'create', t: 'Oyun kurmak',
          b: ['Kendi masanı kur: ad, oyuncu sayısı, başlangıç yığını, ilk small blind ve yükseltme programı, aksiyon süresi ve izleyicilere izin verilip verilmeyeceği. Dört oyun türü vardır: Normal (herkes), yalnızca kayıtlı oyuncular, yalnızca davetle ve Dereceli (resmi sıralamaya sayılır — bu durumda parola konamaz). Beğendiğin ayarlar kaydedilip yeniden yüklenebilir.'] },
        { id: 'invites', t: 'Davetler',
          b: ['Oyuncular seni masalarına davet edebilir; kabul veya reddedebileceğin bir bildirim alırsın. Davet edilmek, yalnızca davetle oyunlara girmenin tek yoludur.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Hesabın',
          b: ['Resmi internet sunucusu pokerth.net\u2019tir. Orada oynamak ücretsiz bir pokerth.net hesabı gerektirir — sitede kaydol, sonra buraya aynı takma ad ve parolayla gir. Bu web istemcisi, masaüstü istemcinin bağlandığı sunucunun ta kendisine bağlanır: aynı hesaplar, aynı masalar, aynı sıralamalar; masaüstü istemcideki oyuncularla aynı masaya oturabilirsin.'] },
        { id: 'ranked', t: 'Dereceli oyunlar ve sezonlar',
          b: ['Dereceli türündeki oyunlar resmi sezon sıralamasına sayılır. Uygulamadaki profilin kayıt tarihini, geçerli sezondaki Sıranı, Puanını, ortalamanı ve oynadığın oyunları, ayrıca son sonuçlarını gösterir. Normal (derecesiz) oyunlar sadece eğlence içindir ve hiçbir şeyi değiştirmez.'] },
        { id: 'rankhow', t: 'Sıralama nasıl hesaplanır',
          b: ['Her dereceli oyunda bitirdiğin sıra puan kazandırır: birinciye 15, sonra 9, 6, 4, 3, 2 ve 1 ile yedinciye kadar; sekizinciden onuncuya hiçbir şey yok. Yani bir masa toplamda 40 puan dağıtır.',
              'Score\u2019un bu puanların toplamı değil, oyun başına ortalaman; üstelik oynanan oyun sayısıyla büyüyen bir katsayıyla yumuşatılır: birkaç iyi sonuç zirveye yerleşmeye yetmez, süreklilik de gerekir — ne kadar çok oynarsan Score\u2019un gerçek ortalamana o kadar yaklaşır. Sezonlar üç ay sürer: geçişte her şey arşivlenir ve sayaçlar sıfırdan başlar, geçmiş sezonlar görüntülenebilir kalır. Oyun içinde podyum düğmesi, masandaki oyuncuların sezon sıralamasını gösterir.'],
          note: 'Puan cetvelini ve tam formülü pokerth.net\u2019in sıralama sunucusu belirler ve bunlar değişebilir; ölçüt sitedeki sayfalardır.' },
        { id: 'rankings', t: 'Sıralama sayfaları',
          b: ['Sıralama girdisi, oyuncuya göre aranabilir resmi PokerTH sıralamasını ve topluluk sıralamalarını (BBC, WEC) açar. Sıralamalar ilgini çekmiyorsa girdi Gelişmiş seçenekler \u2192 Topluluk\u2019tan gizlenebilir.'] },
        { id: 'cups', t: 'Topluluk kupaları: BBC ve WeCup',
          b: ['İki topluluk pokerth.net üzerinde kendi turnuvalarını düzenler, her biri kendi sitesi ve kendi sıralamasıyla. Best Brainies Cup (BBC) 2013\u2019te doğmuş bir basamak turnuvasıdır: Step 1\u2019den Step 4\u2019e yükselirsin ve her Step 4 oyunundan sonra, kupa verildiğinde yeni bir sezon başlar. WeCup\u2019ın (WEC) kendi cetveli vardır, çok daha geniş yayılmış — birinciye 75 puan, sonra 45, 30, 20… — ve score\u2019u, diğer üyelerle karşılaştırıldığında oynadığın oyun sayısına göre ortalamanı normalleştirir.',
              'Her iki sıralama da PokerTH sıralamasının yanındaki kupa düğmesinden açılır. Bu turnuvaların masa ayarları, oyun oluştururken hazır ayar olarak gelir (BBC Step 1– 4, WEC, WEC Monthly Final ve WEC Grand Final), böylece aynı koşullarda çalışabilirsin. Katılmak için ilgili kupanın sitesine kaydolmak gerekir.'],
          note: 'Kupalar ilgini çekmiyorsa bu içerikleri Gelişmiş seçenekler → Topluluk\u2019tan tek seferde gizleyebilirsin.' },
        { id: 'forumcups', t: 'Forum kupaları ve etkinlikler',
          b: ['pokerth.net forumu ayrıca Monthly Cup\u2019a ev sahipliği yapar: oyuncuların Gold, Silver ve Bronze masalara dağıtıldığı ve ardından ayın şampiyonunun belirlendiği aylık bir seri, buna yıl boyunca tek seferlik özel kupalar eklenir.',
              'Kayıtlar, program, masa ayarları ve sonuçlar forumda yayımlanır, oyunlar ise diğerleri gibi resmi sunucuda oynanır. Sonuçları izlemek için bir pokerth.net hesabı yeterlidir; bir kupaya kaydolmak ilgili forum başlığından geçer.'] },
        { id: 'avatars', t: 'Avatarlar ve bayraklar',
          b: ['pokerth.net\u2019te avatarın, avatar sunucusu üzerinden diğer oyunculara dağıtılır ve oyuncu kutularında küçük bir ülke bayrağı gösterilebilir. İkisi de isteğe bağlıdır ve seçeneklerden yapılandırılır.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Antrenman modu',
      sections: [
        { id: 'what', t: 'Nedir',
          b: ['Yerel / antrenman modu, bilgisayarın yönettiği rakiplere karşı eksiksiz bir oyundur: bağlantı yok, hesap yok, riske atılan bir şey yok. Uygulama yüklendikten sonra (ya da yalnızca bir kez ziyaret edilse bile) tamamen çevrimdışı çalışır — oyunu öğrenmek, arayüzü denemek veya uçak modunda vakit geçirmek için birebir.'] },
        { id: 'setup', t: 'Oyun kurmak',
          b: ['Rakip sayısını, başlangıç yığınını, blindleri ve yükselme biçimini, oyun hızını seç. Botların bileşimi ve zorluğu Gelişmiş seçenekler \u2192 Yerel oyun\u2019dan ayarlanır — yumuşak rakiplerden daha sert ve çeşitli bir masaya kadar.'] },
        { id: 'trophies', t: 'Kupalar',
          b: ['Antrenman modunun kendi ilerlemesi vardır: altı kategoride 28 kupa (ilerleme, teknik, stil, biçimler, eğlence ve bir gizli) oynayarak açılır — oynanan eller, kazanılan oyunlar, büyük blöfler, özel eller ve dahası. Kupa ilerlemen birikimlidir ve hesap ayar eşitlemesi açıkken cihazlar arasında birleştirilir.'] },
        { id: 'learn', t: 'Öğrenmek için iyi bir yer',
          b: ['Diğer bölümlerde anlatılan her şey burada da çalışır: olasılık monitörü, asistan görünümü, ön seçim, klavye kısayolları. pokerth.net\u2019e atılmadan önce bunları baskısız denemenin en iyi yeri antrenman modudur.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stil ve ses',
      sections: [
        { id: 'themes', t: 'Temalar',
          b: ['Gelişmiş seçeneklerin Stil kategorisi bütün istemciyi giydirir. Hazır ayarlar her şeyi tek dokunuşla kurar (klasik yeşil kumarhane, resmi PokerTH görünümü\u2026); altındaki bağımsız eksenler renk paletini, masa örtüsünü ve kart yüzlerini ayrı ayrı ayarlar — herhangi bir ekseni değiştir, karışımın özel bir temaya dönüşsün. Koyu, açık veya otomatik mod Kullanıcı arayüzünden seçilir; seçimlerin anında, her ekranda geçerli olur ve hatırlanır.'] },
        { id: 'tablelook', t: 'Masalar, desteler, koltuklar',
          b: ['Temanın ötesinde birçok öğe bağımsız değiştirilebilir: masa arka planı, kart destesi, kart sırtı (desteyle otomatik uyumlu, ya da kendi görselini içe aktar), dağıtıcı ve blind fişleri, aksiyon düğmesi stili ve oyuncu kutularını baştan giydiren eksiksiz koltuk paketleri. Hepsini Gelişmiş seçenekler \u2192 Stil\u2019den seç; değişiklikler masada anında görünür.'] },
        { id: 'music', t: 'Müzik çalar',
          b: ['Başlık menülerindeki müzik girdisi küçük bir ortam müziği çaları açar: çalma listesinden parça seç, çal/duraklat, önceki/sonraki, karışık ve tek parça, tüm liste ya da hiç tekrarı. Ses düzeyi, seçili parça ve tekrar modu hatırlanır. Çalma asla kendiliğinden başlamaz — tarayıcılar bir dokunuş ister — ve çalar, oyun ses efektlerinden tamamen bağımsızdır.'] },
        { id: 'sounds', t: 'Ses efektleri',
          b: ['Oyun sesleri, masaüstü istemcideki gibi ayrı ayrı açılabilen dört kategoride toplanır: oyun aksiyonları (kart dağıtımı, Check, Call, Raise, sıran geldi\u2026), lobi sohbet bildirimi, ağ oyunu bildirimleri (oyuncu katıldı, oyun hazır) ve blind yükselme bildirimi. Tek bir ses düzeyi kaydırıcısı hepsini yönetir — Gelişmiş seçenekler \u2192 Ses\u2019te.'],
          note: 'Bütün tarayıcılar — özellikle iOS — sayfaya bir kez dokunmadan ses çalmayı reddeder. Bir oyun sessiz başlarsa, herhangi bir yere tek dokunuş sesi uyandırır; iOS ses motorunu askıya aldığında da (gelen arama, arka plan\u2026) istemci onu otomatik onarır.' },
        { id: 'voice', t: 'Ses ve titreşim',
          b: ['Ekrana bakmadan seni bilgilendirebilecek iki ek kanal vardır: sesli anonslar oyun olaylarını cihazının konuşma sentezleyicisiyle yüksek sesle okur ve telefonda kısa bir titreşim sıranın geldiğini bildirebilir. İkisi de web eklentisidir, cihaza göre varsayılan açık ya da kapalıdır — Gelişmiş seçenekler \u2192 Bahisler ve sıra\u2019da.'],
          note: 'Titreşim Android\u2019de çalışır (Chromium tabanlı tarayıcılar); Apple web sitelerine titreşim API\u2019si sunmadığı için iPhone\u2019lar titreyemez. Sesli anonslar her yerde çalışır ama kullanılabilir sesler ve diller sistemine bağlıdır — istemci bulduğu en iyi eşleşmeyi kullanır.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Seçenekler ve kısayollar',
      sections: [
        { id: 'where', t: 'Seçenekler nerede yaşar',
          b: ['Gelişmiş seçenekler, herhangi bir başlık menüsünün dişli girdisinden açılır. Masaüstü istemcideki gibi gruplanmıştır: Kullanıcı arayüzü, Stil, Ses, Yerel oyun, Ağ oyunu, İnternet oyunu, Takma adlar / Avatarlar, Günlük mesajları ve Varsayılanları geri yükle. Web\u2019e özgü her özelliğin orada kendi anahtarı vardır; kullanmadığın her şeyi kapatabilirsin.'] },
        { id: 'cfgxml', t: 'Masaüstü istemciyle ayar alışverişi',
          b: ['Ayarların istemciler arasında yolculuk edebilir: Günlük mesajları kategorisi resmi config.xml dosyasının (masaüstü ve QML istemcilerin kullandığı \u007e/.pokerth/config.xml) dışa/içe aktarımını sunar. Dışa aktarma ortak ayarları yazar — ad, görüntü seçenekleri, sesler, masa tercihleri, blindler, stiller — içe aktarma ise masaüstünden bir dosyayı buraya uygular. Bu istemcinin bilmediği ayarlar dosyada dokunulmadan korunur.'] },
        { id: 'sync', t: 'Seni izleyen ayarlar',
          b: ['Bir hesapla oynadığında seçeneklerin, teman, tuş atamaların, dilin ve antrenman kupaların eşitlenir: bir cihazda bir şeyi değiştir, giriş yaptığın sonraki cihaz onu devralsın. Kupa ilerlemesi birleştirilir, asla üzerine yazılmaz; iki cihazda oynamak her zaman ikisinin de en iyisini korur.'] },
        { id: 'updates', t: 'Güncel kalmak',
          b: ['İstemci kendini günceller: yeni bir sürüm yayımlandığında bir afiş yenilemeni önerir (ya da elle denetlemek için sohbete /update yaz). Ara sıra bir özellik hakkında görüşünü soran küçük bir ürün anketi çıkabilir — katılım isteğe bağlıdır ve anketler Gelişmiş seçenekler \u2192 Topluluk\u2019tan tamamen kapatılabilir.'] },
        { id: 'fkeys', t: 'Resmi klavye kısayolları',
          b: ['Resm\u00ee PokerTH i\u015flev tu\u015flar\u0131 oyun s\u0131ras\u0131nda \u00e7al\u0131\u015f\u0131r \u2014 Alt+S her yerde \u00e7al\u0131\u015f\u0131r:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (sıra seçeneklerden ters çevrilebilir)'],
            ['F5', 'Kartlarını göster (mümkün olduğunda)'],
            ['F6 / F7 / F8', 'Elle \u00b7 Otomatik Check/Fold \u00b7 Otomatik Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Elle \u00b7 Otomatik Check/Call \u00b7 Otomatik Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Sohbet \u00b7 Günlük \u00b7 Olasılık paneli'],
            ['Alt+S', 'Ayarlar — uygulamanın her yerinde, yalnızca oyun sırasında değil'],
            ['F11', 'Tam ekran']],
          note: 'Kısayollar fiziksel klavye ister. Mac\u2019te F tuşları varsayılan olarak medyayı yönetir: Fn\u2019yi basılı tut (veya macOS ayarlarında \u201cF1, F2 vb. tuşları standart işlev tuşları olarak kullan\u201d seçeneğini aç). iPhone\u2019da tam ekran iOS tarafından sınırlıdır — uygulamayı PWA olarak yüklemek aynı tam ekran deneyimini verir.' },
        { id: 'webkeys', t: 'Web harf tuşları',
          b: ['Web eklentisi: tek harfli tuşlar ve Alt+T de eylemleri tetikler ve hepsi Gelişmiş seçenekler → Klavye kısayolları altından yeniden atanabilir:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'İstatistik paneli'],
            ['Esc', 'En üstteki pencereyi kapat (Android Geri tuşu da öyle)']],
          note: 'Android\u2019de sistemin Geri tuşu/hareketi oyundan çıkmak yerine pencereleri Esc gibi kapatır (seçeneklerden ayarlanabilir). iOS\u2019ta eşdeğer bir sistem tuşu yoktur — her pencerenin \u2715 işaretini kullan.' }
      ]
    }
  ]
};
