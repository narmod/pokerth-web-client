// ── help/content/id.mjs — Indonesian help corpus ────────────────────────────
//
// Structure: chapters[] → { id, icon, title, sections[] }.
// Section: { id, t (title), b (paragraphs[]), list (bullets[]), keys ([kbd,
// label][]) }. Plain text only — the renderer escapes everything.
// Translated from en.mjs. Poker action terms (Fold, Check, Call, Bet, Raise,
// All-In) stay in English, as everywhere else.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Memulai',
      sections: [
        { id: 'modes', t: 'Tiga cara bermain',
          b: ['Dari layar masuk, pilih cara Anda ingin bermain.'],
          list: [
            'Internet — bermain daring di server resmi pokerth.net, dengan peringkat. Akun pokerth.net diperlukan; daftar gratis di pokerth.net.',
            'Lokal / latihan — bermain offline melawan bot. Tanpa persiapan, berfungsi tanpa koneksi, dan membuka trofi seiring kemajuan Anda.',
            'LAN / Server khusus — sambungkan ke server PokerTH pribadi di jaringan lokal Anda atau di mesin Anda sendiri.'] },
        { id: 'lan', t: 'LAN / server khusus',
          b: ['Mode ketiga menyambungkan ke server PokerTH mana pun yang Anda atau teman jalankan \u2014 di jaringan rumah, VPS pribadi, di mana saja. Masukkan alamat dan port server, centang TLS jika server memakai port terenkripsi, dan masuk dengan nama panggilan (akses tamu berfungsi jika server mengizinkannya). Semua hal di meja kemudian berperilaku persis seperti di server resmi.'] },
        { id: 'famboard', t: 'Papan peringkat keluarga',
          b: ['Hanya di server pribadi dan permainan LAN, klien menyimpan statistik seumur hidup per nama panggilan \u2014 tangan dan permainan yang dimainkan dan dimenangkan, kemenangan terbesar, rentetan terbaik \u2014 dan membagikannya lewat server sehingga setiap perangkat di sekitar meja melihat papan peringkat yang sama. Permainan pokerth.net tidak pernah dilacak seperti ini, dan statistik mode latihan disimpan sepenuhnya terpisah.'] },
        { id: 'language', t: 'Bahasa',
          b: ['Antarmuka tersedia dalam 41 bahasa. Ubah kapan saja di Opsi lanjutan (menu roda gigi) di bawah Antarmuka pengguna. Istilah aksi poker (Fold, Check, Call, Bet, Raise, All-In) tetap dalam bahasa Inggris sesuai konvensi, persis seperti klien desktop.'] },
        { id: 'pwa', t: 'Instal sebagai aplikasi',
          b: ['Klien ini adalah Progressive Web App: Anda dapat menginstalnya dari menu peramban (atau tombol instal di kepala halaman) untuk mendapatkan aplikasi layar penuh dengan ikonnya sendiri. Setelah terinstal, aplikasi langsung terbuka dan mode latihan berfungsi sepenuhnya offline.'],
          note: 'Di Android dan Chrome/Edge desktop, tombol instal melakukan semuanya. Di iPhone/iPad, Apple hanya mengizinkan instalasi lewat Safari: tombol Bagikan \u2192 \u201cTambah ke Layar Utama\u201d \u2014 klien menampilkan langkah-langkah ini saat diperlukan. Tombol hilang setelah aplikasi terinstal.' },
        { id: 'platforms', t: 'Platform dan peramban',
          b: ['Klien berjalan di peramban modern mana pun di sistem apa pun \u2014 Windows, macOS, Linux, Android, iOS. Beberapa fitur bergantung pada API peramban yang lebih baru; saat sebuah API tidak ada, fiturnya menyembunyikan diri atau menjelaskan alasannya alih-alih rusak. Perbedaan utama yang perlu diketahui:'],
          list: [
            'Chrome / Edge (desktop): semuanya berfungsi, termasuk menulis log .pdb ke sebuah folder.',
            'Firefox: semuanya kecuali menulis log .pdb ke folder (API belum tersedia).',
            'Safari / iOS: instalasi lewat Bagikan \u2192 Tambah ke Layar Utama; tanpa getaran; layar penuh terbatas di iPhone; suara mulai setelah ketukan pertama Anda.',
            'Android: dukungan penuh di peramban Chromium, termasuk getaran dan perilaku tombol Kembali.'] },
        { id: 'avatar', t: 'Nama panggilan dan avatar',
          b: ['Pilih nama panggilan dan avatar Anda di layar masuk sebelum menyambungkan. Di pokerth.net, nama panggilan Anda adalah nama akun Anda; avatar dibagikan dengan pemain lain lewat server avatar.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Aturan poker',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em secara singkat',
          b: ['PokerTH memainkan No-Limit Texas Hold\u2019em. Setiap pemain menerima dua kartu pribadi (hole cards). Lima kartu komunitas kemudian dibagikan terbuka di tengah meja. Tangan lima kartu terbaik yang dibentuk dari kombinasi apa pun antara dua kartu Anda dan lima kartu komunitas memenangkan pot.'] },
        { id: 'blinds', t: 'Blind dan tombol dealer',
          b: ['Sebelum setiap tangan, dua taruhan wajib mengisi pot: small blind dan big blind, dipasang oleh dua pemain di kiri tombol dealer. Tombol bergerak satu kursi searah jarum jam setelah setiap tangan, sehingga semua orang membayar blind secara bergiliran. Blind naik pada interval teratur seiring permainan berlangsung.',
              'Di meja, tombol dan blind ditandai dengan keping: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Empat ronde taruhan',
          list: [
            'Pre-flop — setelah hole cards dibagikan, ronde taruhan pertama dimulai di kiri big blind.',
            'Flop — tiga kartu komunitas dibuka, diikuti ronde taruhan.',
            'Turn — kartu komunitas keempat, lalu ronde taruhan lagi.',
            'River — kartu komunitas kelima dan terakhir, lalu ronde taruhan final.'],
          b: ['Sebuah ronde taruhan berakhir saat setiap pemain yang masih dalam tangan telah memasukkan jumlah yang sama ke pot (atau sudah all-in).'] },
        { id: 'actions', t: 'Yang bisa Anda lakukan pada giliran Anda',
          list: [
            'Fold — menyerah dari tangan. Kartu Anda dibuang dan Anda tidak lagi bersaing memperebutkan pot.',
            'Check — lewat tanpa bertaruh. Hanya mungkin saat tidak ada yang perlu di-call.',
            'Call — samakan taruhan saat ini.',
            'Bet — buka taruhan saat belum ada yang bertaruh pada street ini.',
            'Raise — tingkatkan di atas taruhan yang ada. Raise minimum sama dengan bet atau raise sebelumnya.',
            'All-In — masukkan seluruh stack Anda. Anda tetap dalam tangan hingga jumlah yang Anda tanggung.'] },
        { id: 'showdown', t: 'Showdown dan pot terbagi',
          b: ['Jika lebih dari satu pemain tersisa setelah ronde taruhan river, kartu dibuka dan tangan terbaik menang \u2014 kombinasi pemenang ditampilkan di bawah kartu komunitas. Saat seorang pemain all-in kurang dari taruhan penuh, side pot dibuat: setiap pemain hanya dapat memenangkan bagian pot yang ia kontribusikan. Tangan yang setara membagi pot.',
            'Tidak semua orang harus membuka: mulai dari pemain terakhir yang bet atau raise, sebuah tangan hanya diperlihatkan jika mengalahkan yang sudah terbuka. Siapa pun yang berhak membuang kartunya bisa tetap menyembunyikannya dan mendapat tombol Show untuk memperlihatkannya jika mau.'] },
        { id: 'hands', t: 'Peringkat tangan',
          b: ['Dari terlemah ke terkuat:'],
          list: [
            '1. High Card — tanpa kombinasi; kartu tertinggi yang menentukan.',
            '2. Pair — dua kartu bernilai sama.',
            '3. Two Pair — dua pasangan berbeda.',
            '4. Three of a Kind — tiga kartu bernilai sama.',
            '5. Straight — lima kartu berurutan (As terhitung tinggi atau rendah).',
            '6. Flush — lima kartu sekartu (satu jenis).',
            '7. Full House — tiga kartu sama plus sepasang.',
            '8. Four of a Kind — empat kartu bernilai sama.',
            '9. Straight Flush — straight yang seluruhnya satu jenis.',
            '10. Royal Flush — Sepuluh sampai As, satu jenis. Tangan terbaik yang mungkin.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Layar permainan',
      sections: [
        { id: 'actionbar', t: 'Bilah aksi',
          b: ['Saat giliran Anda, bilah aksi di bawah menyala dengan hingga empat tombol: Fold (merah), Check / Call (biru), Bet / Raise (hijau \u2014 aksi utama yang disorot) dan All-In (merah gelap). Tombol Check / Call menampilkan jumlah persis yang harus di-call; Bet / Raise menampilkan jumlah yang akan Anda masukkan. Setelah river, All-In dapat berubah menjadi tombol Show untuk memperlihatkan kartu Anda.'] },
        { id: 'betctl', t: 'Memilih taruhan Anda',
          b: ['Atur jumlah raise dengan kolom angka, penggeser, atau tombol cepat 1/3 \u00b7 1/2 \u00b7 Pot (pecahan dari pot saat ini). Jumlah dibulatkan otomatis dan dijaga antara raise minimum dan maksimum yang sah. Jika Anda lebih suka berpikir dalam big blind, sebuah opsi menampilkan semua jumlah dalam BB alih-alih chip.'] },
        { id: 'preselect', t: 'Pra-pilih aksi',
          b: ['Sebelum giliran Anda, Anda dapat menyiapkan aksi lebih dulu: ketuk sebuah tombol dan tombol itu mendapat bingkai emas dengan titik emas kecil. Saat giliran Anda tiba, aksi langsung dimainkan. Fold yang sudah disiapkan otomatis menjadi Check saat check gratis \u2014 Anda tidak pernah fold sia-sia. Pra-pilihan direset di setiap tangan baru, pergantian street, dan showdown, dan dibatalkan jika situasi berubah (misalnya jumlah call berubah).'] },
        { id: 'automodes', t: 'Mode otomatis',
          b: ['Menu tarik-turun di sebelah tombol aksi menawarkan tiga mode bermain: Manual, Auto Check/Call, dan Auto Check/Fold. Mode otomatis bermain untuk Anda sampai Anda beralih kembali \u2014 klik manual apa pun pada sebuah aksi segera mengembalikan ke Manual.'] },
        { id: 'readtable', t: 'Membaca meja',
          b: ['Setiap kotak pemain menampilkan avatar, nama, stack, dan taruhan saat ini. Dealer dan blind ditandai dengan keping D / SB / BB. Lencana berwarna pada kotak menunjukkan aksi terakhir pemain; bilah biru tipis menghitung mundur waktu berpikirnya. Kotak pemain yang gilirannya menyala; kotak Anda sendiri mendapat bingkai emas berdenyut saat giliran Anda.',
              'Bilah status di atas meja menampilkan total pot, taruhan street saat ini, fase (Pre-flop, Flop, Turn, River), serta nomor permainan dan tangan. Pemain yang fold berkartu tembus pandang; pemain yang tersingkir diredupkan. Di akhir tangan, jendela pemenang dapat merangkum siapa memenangkan apa \u2014 bisa dimatikan di opsi.'] },
        { id: 'seatlayout', t: 'Penempatan kursi',
          b: ['Sebagai tambahan web, susunan kotak pemain dapat dipilih di Opsi lanjutan \u2192 Kursi: Otomatis mengikuti klien resmi (slot tetap dalam potret, elips terhitung dalam lanskap), atau paksa susunan Potret atau Lanskap \u2014 dan Kustom memungkinkan Anda menempatkan setiap kursi sendiri: mode ubah muncul di mana Anda menyeret setiap kotak persis ke tempat yang Anda inginkan, dan tata letaknya disimpan.'] },
        { id: 'zoom', t: 'Zoom meja (ponsel)',
          b: ['Di layar kecil, tombol pembesar memperbesar meja (2\u00d7) dan Anda dapat menggeser dengan jari \u2014 kotak Anda sendiri dan bilah aksi tetap diam. Tampilan mengikuti kursi aktif secara otomatis dan memperkecil kembali saat showdown untuk tampilan menyeluruh. Ini bisa dimatikan di Opsi lanjutan.'],
          note: 'Di ponsel dan tablet, zoom cubit bawaan peramban diblokir secara bawaan agar gestur zoom tidak pernah terjadi tanpa sengaja di tengah tangan; aktifkan kembali di Opsi lanjutan \u2192 Antarmuka pengguna jika Anda mau.' },
        { id: 'protections', t: 'Anti-intip dan perlindungan call tak sengaja',
          b: ['Dua perlindungan opsional: Anti-intip menjaga kartu Anda tetap tersembunyi sampai Anda mengetuknya (berguna saat seseorang bisa melihat layar Anda), dan penjaga call tak sengaja memblokir sebentar tombol Call tepat setelah raise besar, sehingga ketukan yang ditujukan untuk call kecil tidak dapat mengenai jumlah yang dinaikkan secara tidak sengaja. Keduanya ada di Opsi lanjutan.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Panel info',
      sections: [
        { id: 'open', t: 'Membuka panel',
          b: ['Selama permainan, panel info dibuka dari kepala halaman (atau Alt+L / Alt+I) dan memiliki tiga tab: Log, Peluang, dan Statistik. Di ponsel, panel mengambang di atas meja; di layar lebih besar, panel berupa jendela yang dapat diseret dan diubah ukurannya \u2014 pegang gagang \u28ff untuk memindahkan, tepiannya untuk mengubah ukuran. Posisinya diingat.'] },
        { id: 'log', t: 'Log permainan',
          b: ['Tab Log merekam seluruh permainan tangan demi tangan: blind, setiap aksi dengan jumlahnya, kartu yang dibuka dan pemenang, diberi kode warna agar mudah dibaca cepat. Tombol ekspor menyimpan log sebagai berkas jika Anda ingin meninjau sesi nanti.'] },
        { id: 'odds', t: 'Peluang (monitor peluang)',
          b: ['Tab Peluang menampilkan, untuk tangan Anda saat ini, probabilitas langsung berakhir dengan masing-masing dari 10 kategori tangan \u2014 dari High Card hingga Royal Flush \u2014 masing-masing dengan ikon, persentase, dan bilahnya. Tampilan menjadi abu-abu setelah Anda fold. Ia hanya memakai kartu Anda sendiri dan kartu komunitas: ia tidak melihat apa pun yang tidak diperlihatkan lawan Anda.'] },
        { id: 'journal', t: 'Log tangan dan jendela Log',
          b: ['Di luar log langsung, setiap tangan yang Anda mainkan direkam secara lokal di peramban, dalam format yang sama dengan berkas log .pdb klien resmi. Jendela Log (Opsi lanjutan \u2192 Pesan log \u2192 Kelola log\u2026) mencantumkan sesi Anda dan memungkinkan Anda mengelolanya: pratinjau sesi dengan pencarian dan penyorotan, filter per permainan, ekspor sebagai HTML atau teks polos, simpan berkas .pdb mentah, atau impor .pdb yang direkam klien desktop. Sesi dapat dihapus satu per satu atau sekaligus (dengan konfirmasi), dan pengaturan retensi otomatis dapat menyimpan hanya 7, 30, 90, 180, atau 365 hari terakhir. Log yang Anda impor sendiri tidak pernah dihapus otomatis. Pengaturan kedua membatasi jumlah sesi yang disimpan, dan kolom daftar dapat diseret lebih lebar.',
              'Tombol Analisis menjalankan analisis tangan atas sebuah sesi dan dapat mengirim log ke layanan analisis pokerth.net. Semuanya tetap di perangkat Anda kecuali Anda mengekspor atau mengunggahnya secara eksplisit.'] },
        { id: 'logopts', t: 'Opsi pencatatan',
          b: ['Di Opsi lanjutan \u2192 Pesan log Anda dapat mengaktifkan atau mematikan pencatatan dan memilih interval penulisan, dengan tiga pengaturan yang sama seperti klien desktop: setelah setiap aksi, setelah setiap tangan (bawaan), atau setelah setiap permainan. Opsi lain menulis berkas .pdb ke folder pilihan Anda dan menjaganya tetap mutakhir pada interval itu, dan sekali lagi saat Anda meninggalkan halaman, sehingga alat lain dapat mengikuti permainan secara langsung.'],
          note: 'Menulis ke folder lokal memerlukan File System Access API: hanya Chrome, Edge, dan Opera desktop. Di tempat lain, opsi ini menjelaskan dirinya sendiri dan ekspor manual dari jendela Log tetap tersedia. Peramban hanya bisa mengganti berkas, tidak pernah menambahkan; jadi alat yang membaca .pdb harus membukanya kembali setelah setiap perubahan.' },
        { id: 'assist', t: 'Bantuan (kekuatan tangan)',
          b: ['Di atas tab Peluang, spanduk bantuan membaca tangan Anda untuk Anda. Sebelum flop, ia menamai tangan awal Anda dan menilainya dengan bintang; sejak flop, ia menampilkan kombinasi terbaik Anda saat ini dan, setelah simulasi cepat, perkiraan peluang Anda memenangkan tangan dalam persentase, dengan indikator warna dari merah (lemah) ke hijau (kuat). Seperti monitor peluang, ia hanya memakai informasi yang dapat Anda lihat.',
              'Dua gaya tampilan tersedia di Opsi lanjutan \u2192 Kursi: Segmen (sepuluh blok) atau bilah kemajuan klasik. Seluruh fitur bantuan dapat dimatikan di Opsi lanjutan \u2192 Bantuan.'] },
        { id: 'assistwin', t: 'Bantuan sebagai widget mengambang',
          b: ['Blok bantuan dapat dilepas dari panel ke jendela kecilnya sendiri yang selalu di atas: pakai tombol lepas pada blok, lalu pindahkan dan ubah ukurannya di mana saja di atas meja \u2014 praktis untuk memantau kekuatan tangan tanpa membuka panel penuh. Tombol pasang mengembalikannya ke tab Peluang, dan posisinya diingat. Di dalam panel, gagang seret antara Bantuan dan peluang memungkinkan Anda membagi ruang antara keduanya.'] },
        { id: 'stats', t: 'Statistik',
          b: ['Tab Statistik melacak sesi Anda: tangan dimainkan, flop dilihat, showdown, tingkat kemenangan, dan lainnya. Pelacakan statistik dapat dimatikan di Opsi lanjutan.'] },
        { id: 'hud', t: 'HUD statistik di kursi (beta)',
          b: ['HUD menempelkan kotak statistik kecil di sebelah kursi setiap pemain, dibangun dari tangan-tangan yang Anda rekam di log Anda: jumlah tangan yang diamati, lalu VPIP (seberapa sering mereka memasukkan uang secara sukarela pre-flop), PFR (raise pre-flop), dan AF (faktor agresi), diberi kode warna dari pasif hingga agresif. Di bawahnya, sebuah lencana merangkum pemain dengan kata-kata sederhana \u2014 Ketat-Pasif, Longgar-Agresif, dan seterusnya \u2014 di sebelah cakram kecil yang kuadran menyalanya terbaca kiri-ke-kanan untuk ketat ke longgar, dan bawah-ke-atas untuk pasif ke agresif. Lencana tampil sejak tangan pertama tetapi tetap redup sampai 25 tangan, saat mulai andal. Ketuk sebuah kotak untuk popover terperinci dengan set angka lengkap (3-bet, continuation bet, fold to 3-bet, upaya steal, tingkat showdown\u2026), dan seret kotak untuk memindahkannya jika menutupi sesuatu.',
              'HUD hanya tahu apa yang Anda lihat di meja Anda sendiri \u2014 ia membaca log tangan lokal Anda, jadi pencatatan harus aktif dan angkanya menjadi bermakna setelah cukup banyak tangan. Ini fitur beta, mati secara bawaan: aktifkan di Opsi lanjutan \u2192 Bantuan.'] },
        { id: 'handsbtn', t: 'Ikhtisar kombinasi tangan',
          b: ['Ikon tangan poker di meja membuka ikhtisar cepat 10 kombinasi kapan saja \u2014 praktis saat belajar. Bisa disembunyikan di Opsi lanjutan.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Obrolan & sosial',
      sections: [
        { id: 'panels', t: 'Obrolan lobi dan obrolan permainan',
          b: ['Ada obrolan di lobi dan satu lagi di meja. Di ponsel, obrolan permainan mengambang di atas meja; di layar lebih besar, ia berupa jendela yang dapat diseret dan diubah ukurannya. Lencana pada tombol obrolan menghitung pesan yang belum dibaca.'] },
        { id: 'typing', t: 'Bantuan pengetikan',
          list: [
            'Tab melengkapi nama panggilan \u2014 tekan Tab lagi untuk menelusuri kecocokan.',
            '\u2191 / \u2193 menelusuri riwayat pesan Anda sendiri.',
            'Tombol emoji membuka pemilih lengkap; mengetik : juga menyarankan emote saat Anda mengetik.'] },
        { id: 'emotes', t: 'Emote dan smiley',
          b: ['Obrolan mengubah kode emote persis seperti klien desktop resmi: ketik sebuah nama di antara titik dua dan ia menjadi emoji \u2014 :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 lebih dari 1.900 kode didukung (set GitHub lengkap). Smiley teks klasik juga diubah: :-) ;) :D xD :P <3 dan sekitar delapan puluh lainnya.',
              'Mengetik : membuka popup saran yang melengkapi kode saat Anda mengetik (\u2191/\u2193 untuk memilih, Tab atau Enter untuk menerima). Konversi emoji dapat dinonaktifkan sepenuhnya di Opsi lanjutan \u2192 Obrolan.'] },
        { id: 'commands', t: 'Perintah obrolan',
          b: ['Obrolan memahami perintah garis miring. Dua di antaranya terlihat oleh orang lain:'],
          keys: [
            ['/me <teks>', 'Pesan aksi, ditampilkan sebagai \u201c* namaanda teks\u201d'],
            ['/emoji <emoji>', 'Memainkan reaksi emoji (yang dikirim pemilih reaksi)']] },
        { id: 'diagcmds', t: 'Perintah diagnostik',
          b: ['Sisanya bersifat lokal: balasannya hanya ditampilkan kepada Anda dan tidak ada yang dikirim ke meja. Ketik /help untuk melihat semuanya. Yang paling berguna:'],
          keys: [
            ['/help', 'Daftar semua perintah'],
            ['/update', 'Periksa versi baru dan segarkan'],
            ['/lang <kode>', 'Ganti bahasa (mis. /lang id)'],
            ['/sound on|off', 'Nyalakan/matikan suara permainan'],
            ['/zoom', 'Nyalakan/matikan pembesar meja'],
            ['/clear', 'Bersihkan obrolan secara lokal'],
            ['/table', 'Info permainan saat ini (blind, pemain, stack)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostik status klien, jaringan, dan framerate'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Debug lanjutan (kartu, protokol, audio, penyimpanan, kursi)'],
            ['/copy', 'Salin balasan perintah terakhir ke papan klip']] },
        { id: 'reactions', t: 'Reaksi emoji',
          b: ['Tombol reaksi membuka pemilih 30 reaksi beranimasi (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) yang dimainkan dengan efek di atas kursi Anda, terlihat oleh semua orang di meja \u2014 termasuk pemain di klien desktop. Reaksi dapat dinonaktifkan sepenuhnya di Opsi lanjutan.'] },
        { id: 'translate', t: 'Memahami semua orang',
          b: ['Dengan terjemahan obrolan aktif, tombol terjemahan muncul pada baris di bawah penunjuk Anda \u2014 atau pada baris yang Anda ketuk, di layar sentuh \u2014 dan menampilkan pesan itu dalam bahasa Anda memakai penerjemah bawaan peramban. Ia dapat ditampilkan permanen di setiap baris di Opsi lanjutan \u2192 Obrolan, tempat tooltip yang menjelaskan singkatan meja umum (gg, nh, utg\u2026) juga berada.'],
          note: 'Terjemahan memakai layanan Google Translate dan berfungsi di setiap peramban \u2014 hanya perlu koneksi internet. Sebuah pesan hanya dikirim ke layanan terjemahan saat Anda mengetuk tombol terjemahannya, tidak pernah otomatis.' },
        { id: 'social', t: 'Pemain: profil, undang, abaikan',
          b: ['Ketuk pemain mana pun \u2014 di meja atau di daftar lobi \u2014 untuk membuka kartunya: profil dan statistik, undang mereka ke permainan Anda, atau abaikan mereka (pesan obrolan mereka disembunyikan; pengabaian dapat dibatalkan kapan saja). Konfirmasi sebelum undang/abaikan dapat diaktifkan di opsi.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobi & permainan',
      sections: [
        { id: 'list', t: 'Daftar permainan',
          b: ['Lobi mencantumkan setiap meja di server. Setiap entri menampilkan jumlah pemain, tipe permainan, gembok saat kata sandi atau undangan diperlukan, dan lencana status: \u201cMenunggu\u201d (hijau \u2014 permainan belum dimulai, Anda bisa bergabung jika ada kursi kosong), \u201cBerlangsung\u201d (warna hangat \u2014 bisa ditonton langsung saat penonton diizinkan) dan \u201cDitutup\u201d (redup). Meja penuh cukup menampilkan hitungan penuh, seperti 10/10; warna lencana mengikuti tema aktif.',
              'Menu filter mempersempit daftar persis seperti klien desktop, setiap pilihan lebih ketat dari sebelumnya: hanya permainan terbuka \u2192 juga menyembunyikan meja penuh \u2192 lalu hanya non-pribadi, hanya pribadi, atau hanya permainan ranking. Pilihan Anda diingat. Kolom pencarian menemukan permainan berdasarkan nama, dan pil pemain membuka daftar semua yang daring, dapat dicari dan diurutkan.'] },
        { id: 'join', t: 'Bergabung dan menonton',
          b: ['Pilih permainan terbuka dan bergabunglah \u2014 gembok berarti kata sandi diperlukan. Permainan yang sedang berjalan dan mengizinkan penonton dapat ditonton langsung: Anda melihat meja dan obrolan, tetapi hole cards tetap tersembunyi dan Anda tidak dapat beraksi.'] },
        { id: 'gameinfo', t: 'Info permainan',
          b: ['Sebelum bergabung, kartu info permainan menampilkan segala yang mendefinisikan meja: tipe permainan, blind dan cara naiknya (menggandakan atau daftar manual), uang awal, batas waktu aksi, jeda antar tangan, dan siapa yang sudah duduk.'] },
        { id: 'create', t: 'Membuat permainan',
          b: ['Buat meja Anda sendiri: nama, jumlah pemain, uang awal, small blind pertama dan jadwal kenaikan, batas waktu aksi, dan apakah penonton diizinkan. Ada empat tipe permainan: Normal (siapa saja), hanya pemain terdaftar, hanya undangan, dan Ranking (dihitung ke peringkat resmi \u2014 tanpa kata sandi di sana). Pengaturan favorit Anda dapat disimpan dan dimuat ulang.'] },
        { id: 'invites', t: 'Undangan',
          b: ['Pemain dapat mengundang Anda ke meja mereka; Anda mendapat notifikasi yang bisa diterima atau ditolak. Diundang adalah satu-satunya jalan masuk ke permainan khusus undangan.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Akun Anda',
          b: ['Server Internet resmi adalah pokerth.net. Bermain di sana memerlukan akun pokerth.net gratis \u2014 daftar di situs web, lalu masuk di sini dengan nama panggilan dan kata sandi yang sama. Klien web ini tersambung ke server yang persis sama dengan klien desktop: akun sama, meja sama, peringkat sama, dan Anda bisa duduk semeja dengan pemain desktop.'] },
        { id: 'ranked', t: 'Permainan ranking dan musim',
          b: ['Permainan bertipe Ranking dihitung ke peringkat musim resmi. Profil dalam aplikasi Anda menampilkan kapan Anda bergabung, Rank, Score, rata-rata dan jumlah permainan musim berjalan, plus hasil terbaru Anda. Permainan biasa (non-ranking) hanya untuk bersenang-senang dan tidak mengubah apa pun.'] },
        { id: 'rankhow', t: 'Cara peringkat dihitung',
          b: ['Di setiap permainan berperingkat, posisi akhir Anda menghasilkan poin: 15 untuk pertama, lalu 9, 6, 4, 3, 2, dan 1 hingga ketujuh; kedelapan sampai kesepuluh tidak mendapat apa-apa. Satu meja dengan demikian membagikan total 40 poin.',
              'Score Anda bukan jumlah poin itu melainkan rata-rata per permainan, diredam oleh faktor yang tumbuh seiring jumlah permainan: segelintir hasil bagus tidak cukup untuk menetap di puncak, dibutuhkan juga keteraturan — semakin banyak Anda bermain, semakin dekat Score Anda ke rata-rata sejati Anda. Musim berlangsung satu kuartal: saat pergantian, semuanya diarsipkan dan penghitung mulai lagi dari nol, dengan musim-musim lalu tetap tersedia. Dalam permainan, tombol podium menampilkan peringkat musim para pemain di meja Anda.'],
          note: 'Skala poin dan rumus persisnya ditetapkan server peringkat pokerth.net dan dapat berubah; halaman di situs adalah referensinya.' },
        { id: 'rankings', t: 'Halaman peringkat',
          b: ['Entri peringkat membuka peringkat resmi PokerTH, dapat dicari per pemain, bersama peringkat komunitas (BBC, WEC). Jika Anda tidak peduli peringkat, entrinya bisa disembunyikan di Opsi lanjutan \u2192 Komunitas.'] },
        { id: 'cups', t: 'Piala komunitas: BBC dan WeCup',
          b: ['Dua komunitas menjalankan kompetisi mereka sendiri di pokerth.net, masing-masing dengan situs dan peringkatnya sendiri. Best Brainies Cup (BBC) adalah turnamen bertahap yang lahir tahun 2013: Anda naik dari Step 1 ke Step 4, dan musim baru dimulai setelah setiap permainan Step 4, saat piala diberikan. WeCup (WEC) punya skalanya sendiri, jauh lebih terbentang — 75 poin untuk juara pertama, lalu 45, 30, 20… — dan skornya menormalkan rata-rata Anda terhadap jumlah permainan yang Anda mainkan dibandingkan anggota lain.',
              'Kedua peringkat dibuka dari tombol trofi, di sebelah peringkat PokerTH. Pengaturan meja kompetisi-kompetisi ini tersedia sebagai preset saat Anda membuat permainan (BBC Step 1 sampai 4, WEC, WEC Monthly Final dan WEC Grand Final), sehingga Anda bisa berlatih dalam kondisi yang sama. Ikut serta memerlukan pendaftaran di situs piala yang bersangkutan.'],
          note: 'Konten ini dapat disembunyikan sekaligus di Opsi lanjutan → Komunitas jika piala bukan minat Anda.' },
        { id: 'forumcups', t: 'Piala forum dan acara',
          b: ['Forum pokerth.net juga menjadi tuan rumah Monthly Cup, seri bulanan di mana pemain dibagi ke meja Emas, Perak, dan Perunggu sebelum juara bulan dimahkotai, plus piala khusus sekali jalan sepanjang tahun.',
              'Pendaftaran, jadwal, pengaturan meja, dan hasil dipublikasikan di forum, dan permainannya dimainkan di server resmi seperti lainnya. Akun pokerth.net cukup untuk mengikuti hasil; mengikuti piala dilakukan lewat utas forum yang sesuai.'] },
        { id: 'forumnews', t: 'Berita forum di lobi',
          b: ['Tombol koran di kepala lobi membuka postingan terbaru dari forum pokerth.net, satu entri per topik, setiap forum dengan warnanya sendiri. Lencana pada tombol menghitung postingan belum dibaca; membuka postingan (tab baru) menandainya telah dibaca, dan “Tandai semua telah dibaca” membersihkan semuanya sekaligus.',
              'Ini tambahan web: tombolnya bisa disembunyikan di Opsi lanjutan (“Tombol forum di kepala lobi”).'] },
        { id: 'avatars', t: 'Avatar dan bendera',
          b: ['Di pokerth.net, avatar Anda didistribusikan ke pemain lain lewat server avatar, dan bendera negara kecil dapat ditampilkan di kotak pemain. Keduanya opsional dan dapat dikonfigurasi di opsi.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Mode latihan',
      sections: [
        { id: 'what', t: 'Apa itu',
          b: ['Mode Lokal / latihan adalah permainan lengkap melawan lawan komputer: tanpa koneksi, tanpa akun, tanpa taruhan apa pun. Setelah aplikasi terinstal (atau sekadar dikunjungi sekali), ia berfungsi sepenuhnya offline \u2014 sempurna untuk belajar permainan, menguji antarmuka, atau mengisi waktu dalam mode pesawat.'] },
        { id: 'setup', t: 'Menyiapkan permainan',
          b: ['Pilih jumlah lawan, uang awal, blind dan jadwal kenaikan, serta kecepatan permainan. Susunan dan kesulitan bot dapat disesuaikan di Opsi lanjutan \u2192 Permainan lokal \u2014 dari lawan yang lembut hingga meja campuran yang lebih tangguh.'] },
        { id: 'trophies', t: 'Trofi',
          b: ['Mode latihan punya progresinya sendiri: 28 trofi dalam enam kategori (kemajuan, keahlian, gaya, format, seru-seruan, dan satu rahasia) terbuka seiring Anda bermain \u2014 tangan dimainkan, permainan dimenangkan, gertakan besar, tangan spesial, dan lainnya. Kemajuan trofi Anda bersifat kumulatif dan digabung antar perangkat saat sinkronisasi pengaturan akun aktif.'] },
        { id: 'learn', t: 'Tempat yang baik untuk belajar',
          b: ['Semua dari bab lain juga berfungsi di sini: monitor peluang, tampilan bantuan, pra-pilih, pintasan keyboard. Mode latihan adalah tempat terbaik untuk mencobanya tanpa tekanan sebelum menuju pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Gaya & suara',
      sections: [
        { id: 'themes', t: 'Tema',
          b: ['Kategori Gaya di Opsi lanjutan mengubah tampilan seluruh klien. Preset mengatur semuanya sekali ketuk (kasino hijau klasik, tampilan resmi PokerTH\u2026); di bawahnya, sumbu individual memungkinkan Anda menyempurnakan palet warna, alas meja, dan muka kartu secara terpisah \u2014 ubah sumbu mana pun dan campuran Anda menjadi tema kustom. Mode gelap, terang, atau otomatis dipilih di Antarmuka pengguna, dan pilihan Anda berlaku seketika, di setiap layar, dan diingat.'] },
        { id: 'tablelook', t: 'Meja, dek, kursi',
          b: ['Di luar tema, beberapa elemen dapat ditukar secara independen: latar meja, dek kartu, punggung kartu (sesuaikan dengan dek otomatis atau impor gambar Anda sendiri), keping dealer dan blind, gaya tombol aksi, dan paket kursi lengkap yang mengubah tampilan kotak pemain. Pilih semuanya di Opsi lanjutan \u2192 Gaya; perubahan langsung terlihat di meja.'] },
        { id: 'music', t: 'Pemutar musik',
          b: ['Entri musik di menu kepala halaman membuka pemutar musik lounge kecil: pilih trek dari daftar putar, putar/jeda, sebelumnya/berikutnya, acak, dan ulangi satu trek, seluruh daftar putar, atau tidak sama sekali. Volume, trek terpilih, dan mode ulang diingat. Pemutaran tidak pernah mulai sendiri \u2014 peramban memerlukan ketukan \u2014 dan pemutar sepenuhnya independen dari efek suara permainan.'] },
        { id: 'sounds', t: 'Efek suara',
          b: ['Suara permainan dikelompokkan dalam empat kategori yang dapat diaktifkan terpisah, persis seperti klien desktop: aksi permainan (kartu dibagikan, Check, Call, Raise, giliran Anda\u2026), notifikasi obrolan lobi, notifikasi permainan jaringan (pemain bergabung, permainan siap), dan notifikasi kenaikan blind. Satu penggeser volume mengendalikan semuanya, di Opsi lanjutan \u2192 Suara.'],
          note: 'Semua peramban \u2014 terutama iOS \u2014 menolak memutar audio sebelum Anda menyentuh halaman sekali. Jika permainan mulai tanpa suara, satu ketukan di mana saja menghidupkan suaranya; klien juga memperbaiki mesin audio secara otomatis saat iOS menangguhkannya (panggilan masuk, ke latar belakang\u2026).' },
        { id: 'voice', t: 'Suara dan getaran',
          b: ['Dua saluran tambahan dapat menjaga Anda tetap terinformasi tanpa melihat layar: pengumuman suara membacakan peristiwa permainan memakai sintesis ucapan perangkat Anda, dan di ponsel getaran singkat dapat menandai giliran Anda. Keduanya adalah tambahan web, mati atau aktif secara bawaan tergantung perangkat, di Opsi lanjutan \u2192 Taruhan & giliran.'],
          note: 'Getaran berfungsi di Android (peramban Chromium); Apple tidak menyediakan API getaran untuk situs web, jadi iPhone tidak dapat bergetar. Pengumuman suara berfungsi di mana saja, tetapi suara dan bahasa yang tersedia bergantung pada sistem Anda \u2014 klien memakai yang paling cocok yang ditemukannya.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opsi & pintasan',
      sections: [
        { id: 'where', t: 'Di mana opsi berada',
          b: ['Opsi lanjutan dibuka dari entri roda gigi di menu kepala halaman mana pun. Opsi dikelompokkan seperti klien desktop: Antarmuka pengguna, Gaya, Suara, Permainan lokal, Permainan jaringan, Permainan internet, Nama panggilan / Avatar, Pesan log, dan Pulihkan bawaan. Setiap fitur khusus web punya sakelarnya sendiri di sana, jadi Anda dapat mematikan apa pun yang tidak Anda pakai.'] },
        { id: 'cfgxml', t: 'Bertukar pengaturan dengan klien desktop',
          b: ['Pengaturan Anda dapat berpindah antar klien: kategori Pesan log menawarkan ekspor/impor berkas config.xml resmi (\u007e/.pokerth/config.xml yang dipakai klien desktop dan QML). Ekspor menulis pengaturan bersama \u2014 nama, opsi tampilan, suara, preferensi meja, blind, gaya \u2014 dan impor menerapkan berkas desktop di sini. Pengaturan yang tidak dikenal klien ini tetap utuh dalam berkas.'] },
        { id: 'sync', t: 'Pengaturan yang mengikuti Anda',
          b: ['Saat Anda bermain dengan akun, opsi, tema, penetapan tombol, bahasa, dan trofi latihan Anda disinkronkan: ubah sesuatu di satu perangkat dan perangkat berikutnya tempat Anda masuk akan mengambilnya. Kemajuan trofi digabung, tidak pernah ditimpa, jadi bermain di dua perangkat selalu mempertahankan yang terbaik dari keduanya.'] },
        { id: 'updates', t: 'Tetap mutakhir',
          b: ['Klien memperbarui dirinya sendiri: saat versi baru diterapkan, spanduk mengundang Anda untuk menyegarkan (atau ketik /update di obrolan untuk memeriksa manual). Sesekali jajak pendapat produk kecil mungkin muncul menanyakan pendapat Anda tentang sebuah fitur \u2014 ikut serta bersifat opsional dan jajak pendapat dapat dinonaktifkan sepenuhnya di Opsi lanjutan \u2192 Komunitas.'] },
        { id: 'fkeys', t: 'Pintasan keyboard resmi',
          b: ['Tombol fungsi PokerTH resmi berfungsi selama permainan \u2014 Alt+S berfungsi di mana saja:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (urutan dapat dibalik di opsi)'],
            ['F5', 'Perlihatkan kartu Anda (bila memungkinkan)'],
            ['F6 / F7 / F8', 'Manual \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manual \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Obrolan \u00b7 Log permainan \u00b7 Panel peluang'],
            ['Alt+S', 'Pengaturan \u2014 di mana saja dalam aplikasi, tidak hanya selama permainan'],
            ['F11', 'Layar penuh']],
          note: 'Pintasan memerlukan keyboard fisik. Di Mac, tombol F secara bawaan menjadi kontrol media: tahan Fn (atau aktifkan \u201cUse F1, F2, etc. as standard function keys\u201d di pengaturan macOS). Di iPhone, layar penuh dibatasi iOS \u2014 menginstal aplikasi sebagai PWA memberi pengalaman layar penuh yang sama.' },
        { id: 'webkeys', t: 'Tombol huruf web',
          b: ['Sebagai tambahan web, tombol satu huruf dan Alt+T juga memicu aksi, dan setiap tombol dapat ditetapkan ulang di Opsi lanjutan \u2192 Pintasan keyboard:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Panel statistik'],
            ['Esc', 'Tutup jendela teratas (juga tombol Kembali Android)']],
          note: 'Di Android, tombol/gestur Kembali sistem menutup jendela seperti Escape alih-alih meninggalkan permainan (dapat dikonfigurasi di opsi). iOS tidak punya tombol sistem setara \u2014 pakai \u2715 di setiap jendela.' }
      ]
    }
  ]
};
