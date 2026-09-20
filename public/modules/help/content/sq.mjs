// ── help/content/sq.mjs — Korpusi shqip i ndihmës ───────────────────────────
//
// Structure: chapters[] → { id, icon, title, sections[] }.
// Section: { id, t (title), b (paragraphs[]), list (bullets[]), keys ([kbd,
// label][]) }. Plain text only — the renderer escapes everything.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) stay in English,
// as everywhere else in this client.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Hapat e parë',
      sections: [
        { id: 'modes', t: 'Tri mënyra për të luajtur',
          b: ['Në ekranin e hyrjes, zgjidh se si dëshiron të luash.'],
          list: [
            'Internet — luaj online në serverin zyrtar pokerth.net, me renditje. Nevojitet një llogari pokerth.net; regjistrimi në pokerth.net është falas.',
            'Lokal / stërvitje — luaj offline kundër botëve. Asgjë për t\u2019u përgatitur, funksionon pa lidhje dhe zhbllokon trofe ndërsa përparon.',
            'LAN / server i dedikuar — lidhu me një server privat PokerTH në rrjetin tënd lokal ose në kompjuterin tënd.'] },
        { id: 'lan', t: 'LAN / server i dedikuar',
          b: ['Mënyra e tretë lidhet me çdo server PokerTH që ti ose një mik e drejton — në rrjetin e shtëpisë, në një VPS privat, kudo qoftë. Shkruaj adresën dhe portën e serverit, shëno TLS nëse serveri përdor një portë të koduar, dhe hyr me një pseudonim (aksesi si vizitor funksionon nëse serveri e lejon). Çdo gjë te tavolina më pas sillet saktësisht si te serveri zyrtar.'] },
        { id: 'famboard', t: 'Renditja familjare',
          b: ['Vetëm në serverë privatë dhe lojëra LAN, klienti ruan statistikat e përgjithshme sipas pseudonimit — duar dhe lojëra të luajtura e të fituara, fitorja më e madhe, seria më e mirë — dhe i ndan përmes serverit, kështu që çdo pajisje rreth tavolinës sheh të njëjtën renditje. Lojërat e pokerth.net nuk gjurmohen kurrë kështu, dhe statistikat e modalitetit të stërvitjes mbahen krejtësisht të veçanta.', 'Në këto lojëra, butoni i trofeut hap dritaren e renditjes te skeda LAN: të gjithë lojtarët, të renditshëm sipas disa kritereve.'] },
        { id: 'language', t: 'Gjuha',
          b: ['Ndërfaqja është e disponueshme në 64 gjuhë. Ndryshoje kur të duash te Opsionet e avancuara (menyja me ingranazh) te Ndërfaqja e përdoruesit. Termat e veprimeve të pokerit (Fold, Check, Call, Bet, Raise, All-In) mbeten në anglisht sipas konventës, saktësisht si te klienti desktop.'] },
        { id: 'pwa', t: 'Instalo si aplikacion',
          b: ['Ky klient është një Progressive Web App: mund ta instalosh nga menyja e shfletuesit (ose butoni i instalimit në krye) për të pasur një aplikacion me ekran të plotë me ikonën e vet. Pasi të instalohet, hapet menjëherë dhe modaliteti i stërvitjes funksionon plotësisht offline.'],
          note: 'Në Android dhe në Chrome/Edge desktop, butoni i instalimit bën gjithçka. Në iPhone/iPad, Apple lejon instalimin vetëm përmes Safari-t: butoni Shpërndaje → “Shto në ekranin fillestar” — klienti i tregon këto hapa kur nevojitet. Butoni zhduket sapo aplikacioni instalohet.' },
        { id: 'platforms', t: 'Platformat dhe shfletuesit',
          b: ['Klienti funksionon në çdo shfletues modern në çdo sistem — Windows, macOS, Linux, Android, iOS. Disa funksione mbështeten te API-të më të reja të shfletuesit; kur një API mungon, funksioni fshihet ose shpjegon arsyen në vend që të prishet. Dallimet kryesore që duhen njohur:'],
          list: [
            'Chrome / Edge (desktop): gjithçka funksionon, përfshirë shkrimin e regjistrit .pdb në një dosje.',
            'Firefox: gjithçka përveç shkrimit të regjistrit .pdb në dosje (API ende s\u2019është i disponueshëm).',
            'Safari / iOS: instalimi bëhet përmes Shpërndaje → Shto në ekranin fillestar; pa vibrim; ekrani i plotë është i kufizuar në iPhone; zëri fillon pas prekjes së parë.',
            'Android: mbështetje e plotë në shfletuesit Chromium, përfshirë vibrimin dhe sjelljen e butonit Prapa.'] },
        { id: 'avatar', t: 'Pseudonimi dhe avatari',
          b: ['Zgjidh pseudonimin dhe avatarin tënd në ekranin e hyrjes para se të lidhesh. Në pokerth.net, pseudonimi yt është emri i llogarisë tënde; avatarët ndahen me lojtarët e tjerë përmes serverit të avatarëve.', 'Avatari yt dërgohet kur lidhesh, dhe të gjithë lojtarët shohin të njëjtin avatar. Nëse e ndryshon ndërkohë që je i lidhur, avatari i ri vlen nga lidhja tjetër. Shkronja fillestare (Aa) nuk dërgohet: lojtarët e tjerë shohin avatarin e parazgjedhur.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Rregullat e pokerit',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em shkurtimisht',
          b: ['PokerTH luhet si No-Limit Texas Hold\u2019em. Çdo lojtar merr dy letra private (hole cards). Pastaj pesë letra komuniteti ndahen të hapura në mes të tavolinës. Dora prej pesë letrash më e mirë, e formuar nga çdo kombinim i dy letrave të tua dhe pesë letrave të komunitetit, e fiton bankën.'] },
        { id: 'blinds', t: 'Blindet dhe butoni i dhënësit',
          b: ['Para çdo dore, dy baste të detyrueshme e mbushin bankën: blindi i vogël dhe blindi i madh, të vendosur nga dy lojtarët në të majtë të butonit të dhënësit. Butoni lëviz një vend në drejtim të akrepave të orës pas çdo dore, kështu që të gjithë i paguajnë blindet me radhë. Blindet rriten në intervale të rregullta ndërsa loja vazhdon.',
              'Në tavolinë, butoni dhe blindet shënohen me zhetonë: D (dhënësi), SB (blindi i vogël), BB (blindi i madh).'] },
        { id: 'streets', t: 'Katër raundet e bastit',
          list: [
            'Para-flop — pasi ndahen letrat private, raundi i parë i bastit fillon në të majtë të blindit të madh.',
            'Flop — tri letra komuniteti zbulohen, e ndjekur nga një raund basti.',
            'Turn — letra e katërt e komunitetit, pastaj një raund tjetër basti.',
            'River — letra e pestë dhe e fundit e komunitetit, pastaj raundi final i bastit.'],
          b: ['Një raund basti përfundon kur çdo lojtar që është ende në dorë ka vendosur të njëjtën shumë në bankë (ose është all-in).'] },
        { id: 'actions', t: 'Çfarë mund të bësh në radhën tënde',
          list: [
            'Fold — heq dorë nga dora. Letrat e tua hidhen dhe nuk konkurron më për bankën.',
            'Check — kalon pa vënë bast. E mundur vetëm kur s\u2019ka asgjë për të paguar (call).',
            'Call — barazon bastin aktual.',
            'Bet — hap bastin kur askush ende s\u2019ka vënë bast në këtë raund.',
            'Raise — rrit mbi bastin ekzistues. Rritja minimale është e barabartë me bastin ose rritjen e mëparshme.',
            'All-In — vendos gjithë stokun tënd. Mbetesh në dorë deri në shumën që ke mbuluar.'] },
        { id: 'showdown', t: 'Showdown dhe bankat e ndara',
          b: ['Nëse mbetet më shumë se një lojtar pas raundit të bastit të river-it, letrat zbulohen dhe dora më e mirë fiton — kombinimi fitues shfaqet nën letrat e komunitetit. Kur një lojtar është all-in për më pak se bastet e plota, krijohen banka anësore (side pot): çdo lojtar mund të fitojë vetëm pjesën e bankës që ka kontribuar. Duart e barabarta ndajnë bankën.',
            'Nuk duhet të gjithë të zbulojnë: duke filluar nga lojtari i fundit që ka vënë bast ose ka rritur, një dorë zbulohet vetëm nëse mund kombinimin që tashmë është i hapur. Kushdo që ka të drejtë të hedhë letrat i mban ato të fshehta dhe merr një buton Show për t\u2019i treguar sido që të jetë.'] },
        { id: 'hands', t: 'Renditja e duarve',
          b: ['Nga më e dobëta te më e forta:'],
          list: [
            '1. Letra më e lartë — asnjë kombinim; vendos letra më e lartë.',
            '2. Çift — dy letra me të njëjtën vlerë.',
            '3. Dy çifte — dy çifte të ndryshme.',
            '4. Treshja — tri letra me të njëjtën vlerë.',
            '5. Straight — pesë letra rresht (asi vlen lart ose poshtë).',
            '6. Flush — pesë letra e njëjta bojë.',
            '7. Full House — treshe plus çift.',
            '8. Katërshja — katër letra me të njëjtën vlerë.',
            '9. Straight Flush — një straight, i tëri në një bojë.',
            '10. Royal Flush — nga dhjetëshja te asi, i tëri në një bojë. Dora më e mirë e mundshme.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Ekrani i lojës',
      sections: [
        { id: 'actionbar', t: 'Shiriti i veprimeve',
          b: ['Kur je në radhë, shiriti i veprimeve poshtë ndizet me deri katër butona: Fold (i kuq), Check / Call (blu), Bet / Raise (jeshil — veprimi kryesor i theksuar) dhe All-In (kuqe e errët). Butoni Check / Call tregon shumën e saktë për t\u2019u paguar; Bet / Raise tregon shumën që je gati të vendosësh. Pas river-it, All-In mund të bëhet buton Show për të treguar letrat e tua.'] },
        { id: 'betctl', t: 'Zgjedhja e bastit tënd',
          b: ['Cakto shumën e rritjes me fushën numerike, rrëshqitësin, ose butonat e shpejtë 1/3 · 1/2 · Pot (fraksione të bankës aktuale). Shumat rrumbullakosen automatikisht dhe mbahen mes rritjes minimale dhe maksimale të lejuar. Nëse preferon të mendosh në blinde të mëdha, një opsion i tregon të gjitha shumat në BB në vend të zhetonëve.'] },
        { id: 'preselect', t: 'Para-zgjedhja e veprimit',
          b: ['Para radhës tënde, mund të përgatitësh një veprim paraprakisht: prek një buton dhe ai merr një kornizë ari me një pikë të vogël ari. Kur vjen radha jote, veprimi luhet menjëherë. Një Fold i para-përgatitur bëhet automatikisht Check kur check-u është falas — nuk fold-on kurrë kot. Para-zgjedhjet rivendosen në çdo dorë të re, ndryshim raundi dhe showdown, dhe anulohen nëse situata ndryshon (për shembull, nëse shuma për call ndryshon).'] },
        { id: 'automodes', t: 'Modalitetet automatike',
          b: ['Menyja rënëse pranë butonave të veprimit ofron tri modalitete loje: Manual, Check/Call automatik dhe Check/Fold automatik. Modalitetet automatike luajnë në vendin tënd derisa të kalosh sërish në manual — çdo klik manual mbi një veprim kthehet menjëherë te Manual.'] },
        { id: 'readtable', t: 'Leximi i tavolinës',
          b: ['Çdo kuti lojtari tregon avatarin, emrin, stokun dhe bastin aktual. Dhënësi dhe blindet shënohen me zhetonë D / SB / BB. Një shenjë me ngjyrë te kutia tregon veprimin e fundit të lojtarit; një shirit blu i hollë numëron mbrapsht kohën e tij të mendimit. Kutia e lojtarit që është në radhë ndizet; kutia jote merr një kornizë ari që pulson kur je ti në radhë.',
              'Shiriti i statusit mbi tavolinë tregon bankën totale, bastet e raundit aktual, fazën (Para-flop, Flop, Turn, River) dhe numrat e lojës dhe dorës. Lojtarët që kanë bërë fold kanë letra transparente; lojtarët e eliminuar janë të errësuar. Në fund të dorës, një dritare fituesi mund të përmbledhë kush fitoi çfarë — mund të çaktivizohet te opsionet.'] },
        { id: 'seatlayout', t: 'Vendosja e vendeve',
          b: ['Si shtesë web, rregullimi i kutive të lojtarëve mund të zgjidhet te Opsionet e avancuara → Vendet: Automatik ndjek klientin zyrtar (vende fikse në portret, elips i llogaritur në peizazh), ose imponon rregullimin Portret ose Peizazh — dhe I personalizuar të lejon të vendosësh çdo vend vetë: shfaqet një modalitet redaktimi ku çdo kuti tërhiqet saktësisht atje ku dëshiron, dhe rregullimi ruhet.'] },
        { id: 'zoom', t: 'Zmadhimi i tavolinës (telefonat)',
          b: ['Në ekranet e vogla, butonat e lupës e zmadhojnë tavolinën (2×) dhe mund të lëvizësh me gisht — kutia jote dhe shiriti i veprimeve mbeten fikse. Pamja ndjek automatikisht vendin aktiv dhe zvogëlohet sërish në showdown për pamjen e përgjithshme. Kjo mund të çaktivizohet te Opsionet e avancuara.'],
          note: 'Në telefonë dhe tableta, zmadhimi me shtrëngim i vetë shfletuesit bllokohet si parazgjedhje, kështu që një gjest zmadhimi kurrë s\u2019aktivizohet aksidentalisht në mes të një dore; riaktivizoje te Opsionet e avancuara → Ndërfaqja e përdoruesit nëse preferon kështu.' },
        { id: 'protections', t: 'Mbrojtje kundër vëzhgimit dhe call-it aksidental',
          b: ['Dy mbrojtje opsionale: Mbrojtja kundër vëzhgimit i mban letrat e tua të fshehta derisa t\u2019i prekësh (e dobishme kur dikush mund të shohë ekranin tënd), dhe mbrojtja e call-it aksidental bllokon shkurtimisht butonin Call menjëherë pas një rritjeje të madhe, kështu që një prekje e synuar për një call më të vogël nuk mund të bjerë aksidentalisht mbi shumën e rritur. Të dyja gjenden te Opsionet e avancuara.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Paneli i informacionit',
      sections: [
        { id: 'open', t: 'Hapja e panelit',
          b: ['Gjatë një loje, paneli i informacionit hapet nga koka e faqes (ose Alt+L / Alt+I) dhe ka tri skeda: Regjistri, Shanset dhe Statistikat. Në telefonë, paneli noton mbi tavolinë; në ekranet më të mëdha, është një dritare e tërheqshme dhe që ndryshon madhësi — kap dorezën \u28ff për ta lëvizur, skajet për t\u2019i ndryshuar madhësinë. Pozicioni i tij mbahet mend.'] },
        { id: 'log', t: 'Regjistri i lojës',
          b: ['Skeda Regjistri regjistron gjithë lojën dorë pas dore: blindet, çdo veprim me shumat e tij, letrat e zbuluara dhe fituesit, të gjitha me kod ngjyrash për lexim të shpejtë. Butoni i eksportimit e ruan regjistrin si skedar nëse dëshiron ta rishikosh seancën më vonë.'] },
        { id: 'odds', t: 'Shanset (monitori i shanseve)',
          b: ['Skeda Shanset tregon, për dorën tënde aktuale, probabilitetin e drejtpërdrejtë për të përfunduar me secilën nga 10 kategoritë e duarve — nga Letra më e lartë te Royal Flush — secila me ikonën, përqindjen dhe shiritin e vet. Shfaqja bëhet e përhime pasi bën fold. Përdor vetëm letrat e tua dhe letrat e komunitetit: nuk sheh asgjë që kundërshtarët nuk e tregojnë.'] },
        { id: 'journal', t: 'Regjistrat e duarve dhe dritarja e Regjistrave',
          b: ['Përveç regjistrit të drejtpërdrejtë, çdo dorë që luan regjistrohet lokalisht në shfletuesin tënd, në të njëjtin format si skedarët e regjistrit .pdb të klientit zyrtar. Dritarja Regjistrat (Opsionet e avancuara → Mesazhet e regjistrit → Menaxho regjistrat…) i liston seancat e tua dhe të lejon të punosh me to: parashiko një seancë me kërkim dhe theksim, filtro sipas lojës, eksporto si HTML ose tekst i thjeshtë, ruaj skedarin e papërpunuar .pdb, ose importo një .pdb të regjistruar nga klienti desktop. Seancat mund të fshihen një nga një ose të gjitha njëherësh (me konfirmim), dhe një cilësim ruajtjeje automatike mund të mbajë vetëm 7, 30, 90, 180 ose 365 ditët e fundit. Regjistrat që i importon vetë nuk hiqen kurrë automatikisht. Një cilësim tjetër kufizon sa seanca ruhen, dhe kolona e listës mund të zgjerohet duke e tërhequr.',
              'Për të pastruar disa seanca njëherësh, butoni Zgjidh… e kthen listën në kutiza shënimi: shëno ato që dëshiron t\u2019i heqësh dhe Fshi e heq të gjithë grupin pas një konfirmimi të vetëm. Në kompjuter, mund të bësh gjithashtu Ctrl (⌘) + klik për të shtuar seanca një nga një, ose Shift + klik për të marrë një diapazon të tërë.',
              'Butoni Analizo kryen një analizë të duarve mbi një seancë dhe mund t\u2019i dërgojë një regjistër shërbimit të analizës së pokerth.net. Gjithçka mbetet në pajisjen tënde nëse nuk e eksporton ose ngarkon shprehimisht.'] },
        { id: 'logopts', t: 'Opsionet e regjistrimit',
          b: ['Te Opsionet e avancuara → Mesazhet e regjistrit mund të aktivizosh ose çaktivizosh regjistrimin dhe të zgjedhësh intervalin e shkrimit, me tri cilësimet e njëjta si klienti desktop: pas çdo veprimi, pas çdo dore (parazgjedhje), ose pas çdo loje. Një opsion tjetër e shkruan skedarin .pdb në një dosje sipas zgjedhjes tënde dhe e mban të përditësuar në atë interval, dhe edhe një herë kur largohesh nga faqja, kështu që një mjet tjetër mund ta ndjekë lojën në kohë reale.'],
          note: 'Shkrimi në një dosje lokale kërkon File System Access API: vetëm Chrome, Edge dhe Opera në desktop. Kudo tjetër, opsioni shpjegohet vetë dhe eksportimi manual nga dritarja Regjistrat mbetet i disponueshëm. Një shfletues mund vetëm ta zëvendësojë skedarin, kurrë ta shtojë; kështu që një mjet që lexon .pdb duhet ta rihapë pas çdo ndryshimi.' },
        { id: 'assist', t: 'Ndihma (forca e dorës)',
          b: ['Në krye të skedës Shanset, banderola e ndihmës e lexon dorën tënde për ty. Para flopit, emërton dorën tënde fillestare dhe e vlerëson me yje; nga flopi e tutje, tregon kombinimin tënd më të mirë aktual dhe, pas një simulimi të shpejtë, shansin tënd të vlerësuar për të fituar dorën në përqindje, me një tregues me ngjyrë nga e kuqja (dobët) te e gjelbra (fort). Ashtu si monitori i shanseve, përdor vetëm informacionin që mund të shohësh.',
              'Dy stile shfaqjeje janë të disponueshme te Opsionet e avancuara → Vendet: Segmente (dhjetë blloqe) ose një shirit klasik përparimi. E gjithë veçoria e ndihmës mund të çaktivizohet te Opsionet e avancuara → Ndihma.'] },
        { id: 'assistwin', t: 'Ndihma si vegël lëvizëse',
          b: ['Blloku i ndihmës mund të shkëputet nga paneli në dritaren e vet të vogël gjithmonë sipër: përdor butonin e shkëputjes te blloku, pastaj lëviz dhe ndrysho madhësinë e tij kudo mbi tavolinë — i dobishëm për të vëzhguar forcën e dorës pa pasur nevojë të hapësh gjithë panelin. Butoni i rikapitjes e kthen te skeda Shanset, dhe pozicioni i tij mbahet mend. Brenda panelit, një dorezë tërheqjeje mes Ndihmës dhe shanseve të lejon të ndash hapësirën mes tyre.'] },
        { id: 'stats', t: 'Statistikat',
          b: ['Skeda Statistikat gjurmon seancën tënde: duar të luajtura, flope të parë, showdown-e, përqindje fitoresh dhe më shumë. Gjurmimi i statistikave mund të çaktivizohet te Opsionet e avancuara.'] },
        { id: 'hud', t: 'HUD me statistika te vendet',
          b: ['HUD-i i ngjit një kuti të vogël statistikash pranë vendit të çdo lojtari, e ndërtuar nga duart që ke regjistruar në regjistrat e tu: numri i duarve të vëzhguara, pastaj VPIP (sa shpesh vendos para vullnetarisht para flopit), PFR (rritje para flopit) dhe AF (faktori i agresivitetit), me kod ngjyrash nga pasiv te agresiv. Poshtë tyre, një shenjë e përmbledh lojtarin me fjalë të thjeshta — I ngushtë-Pasiv, I lirshëm-Agresiv e kështu me radhë — pranë një kuadranti të vogël, ndriçimi i të cilit lexohet nga e majta në të djathtë për të ngushtë deri të lirshëm, dhe nga poshtë lart për pasiv deri agresiv. Shenja shfaqet që nga dora e parë por mbetet e zbehtë deri në 25 duar, kur bëhet e besueshme. Prek një kuti për një dritare kërcyese të detajuar me tërë grupin e numrave (3-bet, continuation bet, fold ndaj 3-bet, përpjekje vjedhjeje, përqindje showdown-i…), dhe tërhiqe një kuti nëse mbulon diçka.',
              'HUD-i di vetëm atë që ke parë në tavolinat e tua — lexon regjistrat e tu lokalë të duarve, kështu që regjistrimi duhet të jetë aktiv dhe numrat marrin kuptim vetëm pas mjaftueshëm duarsh. Është i çaktivizuar si parazgjedhje: aktivizoje te Opsionet e avancuara → Ndihma.'] },
        { id: 'handsbtn', t: 'Përmbledhja e kombinimeve të duarve',
          b: ['Ikona e duarve të pokerit te mbulesa hap një përmbledhje të shpejtë të 10 kombinimeve në çdo kohë — e dobishme kur mëson. Mund të fshihet te Opsionet e avancuara.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Biseda dhe funksionet sociale',
      sections: [
        { id: 'panels', t: 'Biseda e lobit dhe biseda e lojës',
          b: ['Ka një bisedë në lobi dhe një tjetër te tavolina. Në telefonë, biseda e lojës noton mbi tavolinë; në ekranet më të mëdha, është një dritare e tërheqshme dhe që ndryshon madhësi. Një shenjë te butoni i bisedës numëron mesazhet e palexuara.'] },
        { id: 'typing', t: 'Ndihmesa gjatë shkrimit',
          list: [
            'Tab plotëson një pseudonim — shtyp Tab sërish për të kaluar nëpër përputhjet.',
            '↑ / ↓ shfletojnë historikun e mesazheve të tua.',
            'Butoni i emoji-t hap një zgjedhës të plotë; shkrimi i : gjithashtu sugjeron emote ndërkohë që shkruan.'] },
        { id: 'emotes', t: 'Emote dhe smiley',
          b: ['Biseda i shndërron kodet e emote-ve saktësisht si klienti zyrtar desktop: shkruaj një emër mes dy pikave dhe bëhet emoji — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… mbështeten mbi 1.900 kode (grupi i plotë i GitHub-it). Smiley-t klasikë tekstualë gjithashtu shndërrohen: :-) ;) :D xD :P <3 dhe rreth tetëdhjetë të tjerë.',
              'Shkrimi i : hap një dritare sugjerimesh që plotëson kodin ndërsa shkruan (↑/↓ për të zgjedhur, Tab ose Enter për të pranuar). Shndërrimi i emoji-ve mund të çaktivizohet plotësisht te Opsionet e avancuara → Biseda.'] },
        { id: 'commands', t: 'Komandat e bisedës',
          b: ['Biseda kupton komanda me vizë të pjerrët. Dy prej tyre janë të dukshme për të tjerët:'],
          keys: [
            ['/me <tekst>', 'Mesazh veprimi, i shfaqur si “* emriyt tekst”'],
            ['/emoji <emoji>', 'Luan një reagim emoji (i njëjti që dërgon zgjedhësi i reagimeve)']] },
        { id: 'diagcmds', t: 'Komandat diagnostikuese',
          b: ['Gjithçka tjetër është lokale: përgjigjet i sheh vetëm ti dhe asgjë s\u2019dërgohet te tavolina. Shkruaj /help për t\u2019i listuar të gjitha. Më të dobishmet:'],
          keys: [
            ['/help', 'Liston të gjitha komandat'],
            ['/update', 'Kontrollo për version të ri dhe rifresko'],
            ['/lang <kod>', 'Ndrysho gjuhën (p.sh. /lang sq)'],
            ['/sound on|off', 'Ndez/fik zërat e lojës'],
            ['/zoom', 'Ndez/fik lupën e tavolinës'],
            ['/clear', 'Pastro bisedën lokalisht'],
            ['/table', 'Informacione për lojën aktuale (blinde, lojtarë, stoke)'],
            ['/diag · /netdbg · /fps', 'Diagnostikim i gjendjes së klientit, rrjetit dhe kuadrove'],
            ['/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg', 'Korrigjim i avancuar (letra, protokoll, audio, ruajtje, vende)'],
            ['/copy', 'Kopjo përgjigjen e fundit të komandës në kujtesën e fragmenteve']] },
        { id: 'privatemsg', t: 'Mesazhet private',
          b: ['Shkruaji një lojtari të vetëm pa e lexuar gjithë lobi bashkë me ty. Zarfi pranë një emri te lista e lojtarëve hap një bisedë me të; zarfi te koka e lobit rihap bisedën e fundit. Bisedat ruhen në këtë pajisje dhe janë ende aty kur kthehesh, kështu që një bisedë e vazhduar pas ditësh mbart historikun e vet — një numër i kuq te zarfi tregon çfarë s\u2019ke lexuar ende, dhe koshi te titulli i dritares e fshin bisedën përfundimisht.'],
          keys: [
            ['/msg <pseudonimi> <tekst>', 'Dërgo një mesazh privat nga biseda e lobit'],
            ['/msg "<pseudonimi me hapësira>" <tekst>', 'Njësoj, kur pseudonimi përmban hapësira']],
          note: 'Mesazhet janë të kufizuara në 128 karaktere. Serveri nuk e dorëzon një mesazh privat te një lojtar që është ulur në një tavolinë të zhvillimit e sipër, dhe historiku ruhet vetëm në këtë shfletues — nuk të ndjek në një pajisje tjetër.' },
        { id: 'reactions', t: 'Reagimet emoji',
          b: ['Butoni i reagimeve hap një zgjedhës me 30 reagime të animuara (🎉, 😂, 😱, 🔥…) që luhen me një efekt mbi vendin tënd, të dukshëm për të gjithë tavolinën — përfshirë lojtarët e klientit desktop. Reagimet mund të çaktivizohen plotësisht te Opsionet e avancuara.'] },
        { id: 'translate', t: 'Kupto të gjithë',
          b: ['Me përkthimin e bisedës të aktivizuar, një buton përkthimi shfaqet te rreshti nën kursorin tënd — ose te rreshti që prek, në ekran me prekje — dhe e shfaq atë mesazh në gjuhën tënde duke përdorur përkthyesin e brendshëm të shfletuesit. Mund të shfaqet përgjithmonë te çdo rresht te Opsionet e avancuara → Biseda, ku gjendet edhe këshilla që shpjegon shkurtesat e zakonshme të tavolinës (gg, nh, utg…).'],
          note: 'Përkthimi përdor shërbimin Google Translate dhe funksionon në çdo shfletues — nevojitet vetëm lidhje interneti. Një mesazh dërgohet te shërbimi i përkthimit vetëm kur prek butonin e tij të përkthimit, kurrë automatikisht.' },
        { id: 'social', t: 'Lojtarët: profili, ftesa, injorimi',
          b: ['Prek çdo lojtar — te tavolina ose te lista e lobit — për të hapur kartën e tij: profili dhe statistikat, fto në lojën tënde, ose injoro (mesazhet e tij në bisedë fshihen; injorimi mund të anulohet kurdo). Konfirmimi para ftesës/injorimit mund të aktivizohet te opsionet.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobi dhe lojërat',
      sections: [
        { id: 'list', t: 'Lista e lojërave',
          b: ['Lobi liston çdo tavolinë të serverit. Çdo hyrje tregon numrin e lojtarëve, llojin e lojës, një dry kur nevojitet fjalëkalim ose ftesë, dhe një shenjë statusi: “Në pritje” (jeshile — loja nuk ka filluar, mund të bashkohesh nëse ka vend të lirë), “Në zhvillim e sipër” (ngjyrë e ngrohtë — mund të shikohet drejtpërdrejt kur vëzhguesit lejohen) dhe “E mbyllur” (e errësuar). Një tavolinë e plotë thjesht tregon një numër të plotë, si 10/10; ngjyrat e shenjave ndjekin temën aktive.',
              'Menyja e filtrit e ngushton listën saktësisht si klienti desktop, çdo zgjedhje më e rreptë se e mëparshmja: vetëm lojëra të hapura → duke fshehur edhe tavolinat e plota → pastaj vetëm jopublike, vetëm private, ose vetëm lojëra me renditje. Zgjedhja jote mbahet mend. Fusha e kërkimit gjen një lojë sipas emrit, dhe pulla e lojtarëve hap listën e të gjithëve online, të kërkueshme dhe të renditshme.'] },
        { id: 'join', t: 'Bashkimi dhe vëzhgimi',
          b: ['Zgjidh një lojë të hapur dhe bashkohu — një dry do të thotë se nevojitet fjalëkalim. Lojërat në zhvillim e sipër që lejojnë vëzhgues mund të shihen drejtpërdrejt: sheh tavolinën dhe bisedën, por letrat private mbeten të fshehta dhe nuk mund të veprosh.'] },
        { id: 'gameinfo', t: 'Informacionet e lojës',
          b: ['Para se të bashkohesh, karta e informacioneve të lojës tregon gjithçka që përcakton tavolinën: lloji i lojës, blindet dhe si rriten (dyfishim ose listë manuale), stoku fillestar, kufiri kohor i veprimit, pauza mes duarve, dhe kush është ulur tashmë.'] },
        { id: 'create', t: 'Krijimi i një loje',
          b: ['Krijo tavolinën tënde: emri, numri i lojtarëve, stoku fillestar, blindi i parë i vogël dhe orari i rritjes, kufiri kohor i veprimit, dhe nëse vëzhguesit lejohen. Ekzistojnë katër lloje lojërash: Normale (kushdo), vetëm lojtarë të regjistruar, vetëm me ftesë, dhe Renditje (llogaritet për renditjen zyrtare — atje fjalëkalimi nuk lejohet). Cilësimet e tua të preferuara mund të ruhen dhe rihapen.'] },
        { id: 'invites', t: 'Ftesat',
          b: ['Lojtarët mund të të ftojnë në tavolinën e tyre; merr një njoftim që mund ta pranosh ose refuzosh. Të jesh i ftuar është mënyra e vetme për të hyrë në një lojë vetëm me ftesë.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Llogaria jote',
          b: ['Serveri zyrtar i internetit është pokerth.net. Të luash atje kërkon një llogari falas pokerth.net — regjistrohu në faqen e internetit, pastaj hyr këtu me të njëjtin pseudonim dhe fjalëkalim. Ky klient web lidhet me të njëjtin server saktësisht si klienti desktop: të njëjtat llogari, të njëjtat tavolina, të njëjtat renditje, dhe mund të ulesh te një tavolinë me lojtarë të klientit desktop.'] },
        { id: 'ranked', t: 'Lojërat me renditje dhe sezonet',
          b: ['Lojërat e llojit Renditje llogariten për renditjen zyrtare sezonale. Profili yt në aplikacion tregon kur je bashkuar, Renditjen tënde aktuale sezonale, Rezultatin, mesataren dhe lojërat e luajtura, plus rezultatet e tua më të fundit. Lojërat normale (jo me renditje) janë vetëm për argëtim dhe s\u2019ndryshojnë asgjë.'] },
        { id: 'rankhow', t: 'Si llogaritet renditja',
          b: ['Në çdo lojë me renditje, vendi yt përfundimtar fiton pikë: 15 për të parin, pastaj 9, 6, 4, 3, 2 dhe 1 deri te i shtati; i teti deri i dhjeti s\u2019marrin asgjë. Një tavolinë pra shpërndan gjithsej 40 pikë.',
              'Rezultati yt nuk është shuma e atyre pikëve, por mesatarja jote për lojë, e zbutur nga një faktor që rritet me numrin e lojërave të luajtura: disa rezultate të mira nuk mjaftojnë për të qëndruar në krye, nevojitet edhe rregullsi — sa më shumë të luash, aq më afër është Rezultati yt me mesataren tënde të vërtetë. Sezonet zgjasin një tremujor: në ndryshim, gjithçka arkivohet dhe numëruesit fillojnë sërish nga zero, ndërsa sezonet e kaluara mbeten të disponueshme. Gjatë lojës, butoni i podiumit tregon renditjen sezonale të lojtarëve në tavolinën tënde.'],
          note: 'Shkalla e pikëve dhe formula e saktë përcaktohen nga serveri i renditjes së pokerth.net dhe mund të ndryshojnë; faqet e sajtit janë referenca.' },
        { id: 'rankings', t: 'Faqet e renditjes',
          b: ['Hyrja Renditje hap renditjen zyrtare të PokerTH, të kërkueshme sipas lojtarit, së bashku me renditjet e komunitetit (BBC, WEC). Nëse renditjet s\u2019të interesojnë, hyrja mund të fshihet te Opsionet e avancuara → Komuniteti.'] },
        { id: 'cups', t: 'Kupat e komunitetit: BBC dhe WeCup',
          b: ['Dy komunitete drejtojnë konkurset e veta në pokerth.net, secili me sajtin dhe renditjen e vet. Best Brainies Cup (BBC) është një turne me hapa i lindur më 2013: përparon nga Hapi 1 te Hapi 4, dhe një sezon i ri fillon pas çdo loje të Hapit 4, kur kupa jepet. WeCup (WEC) ka shkallën e vet, shumë më të shtrirë — 75 pikë për vendin e parë, pastaj 45, 30, 20… — dhe rezultati i tij e normalizon mesataren tënde në raport me numrin e lojërave që ke luajtur krahasuar me anëtarët e tjerë.',
              'Të dyja renditjet hapen nga butoni i kupës, pranë renditjes së PokerTH. Cilësimet e tavolinës për këto konkurse vijnë si modele kur krijon një lojë (BBC Hapi 1 deri 4, WEC, WEC Final Mujor dhe WEC Final i Madh), kështu që mund të stërvitesh në të njëjtat kushte. Pjesëmarrja kërkon regjistrim në sajtin e kupës përkatëse.'],
          note: 'Kjo përmbajtje mund të fshihet njëherësh te Opsionet e avancuara → Komuniteti nëse kupat s\u2019të interesojnë.' },
        { id: 'forumcups', t: 'Kupat dhe ngjarjet e forumit',
          b: ['Forumi i pokerth.net gjithashtu organizon Kupën Mujore, një seri mujore ku lojtarët ndahen në tavolina Ari, Argjendi dhe Bronzi para se kampioni i muajit të kurorëzohet, plus kupa të veçanta një-herëshe gjatë vitit.',
              'Regjistrimet, oraret, cilësimet e tavolinës dhe rezultatet publikohen në forum, dhe lojërat luhen në serverin zyrtar si çdo tjetër. Një llogari pokerth.net mjafton për të ndjekur rezultatet; regjistrimi në një kupë bëhet përmes temës përkatëse në forum.'] },
        { id: 'forumnews', t: 'Lajmet e forumit në lobi',
          b: ['Butoni i gazetës te koka e lobit hap postimet më të fundit të forumit të pokerth.net, një hyrje për temë, çdo forum me ngjyrën e vet. Shenja te butoni numëron postimet e palexuara; hapja e një postimi (skedë e re) e shënon si të lexuar, dhe “Shëno të gjitha si të lexuara” i pastron të gjitha njëherësh.',
              'Kjo është një shtesë web: butoni mund të fshihet te Opsionet e avancuara (“Butoni i forumit te koka e lobit”).'] },
        { id: 'avatars', t: 'Avatarët dhe flamujt',
          b: ['Në pokerth.net, avatari yt shpërndahet te lojtarët e tjerë përmes serverit të avatarëve, dhe një flamur i vogël vendi mund të shfaqet te kutitë e lojtarëve. Të dyja janë opsionale dhe të konfigurueshme te opsionet.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Modaliteti i stërvitjes',
      sections: [
        { id: 'what', t: 'Çfarë është',
          b: ['Modaliteti Lokal / stërvitje është një lojë e plotë kundër kundërshtarëve kompjuterikë: pa lidhje, pa llogari, asgjë në rrezik. Sapo aplikacioni instalohet (ose thjesht vizitohet një herë), funksionon plotësisht offline — i përsosur për të mësuar lojën, për të provuar ndërfaqen, ose për të kaluar kohën në modalitetin e aeroplanit.'] },
        { id: 'setup', t: 'Vendosja e një loje',
          b: ['Zgjidh numrin e kundërshtarëve, stokun fillestar, blindet dhe orarin e rritjes, dhe shpejtësinë e lojës. Përbërja dhe vështirësia e botëve mund të përshtaten te Opsionet e avancuara → Lojë lokale — nga kundërshtarë të butë deri te një tavolinë e përzier dhe më e vështirë.'] },
        { id: 'trophies', t: 'Trofetë',
          b: ['Modaliteti i stërvitjes ka përparimin e vet: 28 trofe në gjashtë kategori (përparim, aftësi, stil, formate, argëtim dhe një i fshehtë) zhbllokohen ndërsa luan — duar të luajtura, lojëra të fituara, blufe të mëdha, duar speciale dhe më shumë. Përparimi yt i trofeve është kumulativ dhe bashkohet mes pajisjeve kur sinkronizimi i cilësimeve të llogarisë është aktiv.'] },
        { id: 'learn', t: 'Vend i mirë për të mësuar',
          b: ['Gjithçka nga kapitujt e tjerë funksionon edhe këtu: monitori i shanseve, shfaqja e ndihmës, para-zgjedhja, shkurtoret e tastierës. Modaliteti i stërvitjes është vendi më i mirë për t\u2019i provuar pa presion para se të kalosh te pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stili dhe zëri',
      sections: [
        { id: 'themes', t: 'Temat',
          b: ['Kategoria Stili te Opsionet e avancuara e ristilizon gjithë klientin. Modelet i vendosin të gjitha me një prekje (kazino klasike jeshile, pamja zyrtare e PokerTH…); poshtë tyre, boshte individuale të lejojnë të përsosësh paletën e ngjyrave, mbulesën e tavolinës dhe fytyrat e letrave veçmas — ndrysho çdo bosht dhe përzierja jote bëhet një temë e personalizuar. Modaliteti i errët, i çelët ose automatik zgjidhet te Ndërfaqja e përdoruesit, dhe zgjedhjet e tua zbatohen menjëherë, në çdo ekran, dhe mbahen mend.'] },
        { id: 'tablelook', t: 'Tavolinat, deka, vendet',
          b: ['Përveç temës, disa elemente mund të ndryshohen në mënyrë të pavarur: sfondi i tavolinës, deka e letrave, ana e pasme e letrave (përputh automatikisht me dekën ose importo imazhin tënd), zhetonët e dhënësit dhe blindeve, stili i butonave të veprimit, dhe paketa të plota vendesh që ristilizojnë kutitë e lojtarëve. Zgjidh gjithçka te Opsionet e avancuara → Stili; ndryshimet janë të dukshme menjëherë te tavolina.'] },
        { id: 'music', t: 'Lexuesi i muzikës',
          b: ['Hyrja e muzikës te menytë e kokës hap një lexues të vogël muzike lounge: zgjidh një pjesë nga lista, luaj/pauzo, e mëparshmja/tjetra, rastësisht, dhe përsërit një pjesë të vetme, gjithë listën, ose asgjë. Volumi, pjesa e zgjedhur dhe modaliteti i përsëritjes mbahen mend. Luajtja kurrë nuk fillon vetë — shfletuesit kërkojnë një prekje — dhe lexuesi është plotësisht i pavarur nga efektet e zërit të lojës.', 'Dy gishtat e mëdhenj nën titullin e pjesës tregojnë nëse të pëlqen ajo që po luhet. Një votë anonime për pajisje, përfshirë radiot, dhe mund ta ndryshosh ose tërheqësh kurdo; përveç nëse operatori i zbulon totalet, sheh vetëm gishtin tënd.'] },
        { id: 'sounds', t: 'Efektet e zërit',
          b: ['Zërat e lojës grupohen në katër kategori që mund të aktivizohen/çaktivizohen veçmas, saktësisht si klienti desktop: veprimet e lojës (letra të ndara, Check, Call, Raise, radha jote…), njoftimi i bisedës së lobit, njoftimet e lojës në rrjet (lojtar u lidh, loja gati) dhe njoftimi i rritjes së blindit. Një rrëshqitës i vetëm volumi i kontrollon të gjitha, te Opsionet e avancuara → Zëri.'],
          note: 'Të gjithë shfletuesit — veçanërisht iOS — refuzojnë të luajnë audio para se ta preksh faqen një herë. Nëse loja fillon pa zë, një prekje kudo e sjell zërin në jetë; klienti gjithashtu e riparon automatikisht motorin e audios kur iOS e pezullon (thirrje hyrëse, kalim në sfond…).' },
        { id: 'voice', t: 'Zëri dhe vibrimi',
          b: ['Dy kanale shtesë mund të të mbajnë të informuar pa parë ekranin: njoftimet me zë i lexojnë me zë ngjarjet e lojës duke përdorur sintezën e të folurit të pajisjes tënde, dhe në telefonë, një vibrim i shkurtër mund të shënojë radhën tënde. Të dyja janë shtesa web, të aktivizuara ose jo si parazgjedhje sipas pajisjes, te Opsionet e avancuara → Bastet dhe radha.'],
          note: 'Vibrimi funksionon në Android (shfletues Chromium); Apple nuk ekspozon një API vibrimi për faqet e internetit, kështu që iPhone-t nuk mund të vibrojnë. Njoftimet me zë funksionojnë kudo, por zërat dhe gjuhët e disponueshme varen nga sistemi yt — klienti përdor përputhjen më të mirë që gjen.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opsionet dhe shkurtoret',
      sections: [
        { id: 'where', t: 'Ku ndodhen opsionet',
          b: ['Opsionet e avancuara hapen nga hyrja me ingranazh në çdo meny të kokës. Grupohen si klienti desktop: Ndërfaqja e përdoruesit, Stili, Zëri, Lojë lokale, Lojë në rrjet, Lojë interneti, Pseudonime / Avatarë, Mesazhet e regjistrit, dhe Kopje rezervë dhe rivendosje. Çdo veçori specifike për web ka çelësin e vet aty, kështu që mund të çaktivizosh çfarëdo që nuk përdor.'] },
        { id: 'cfgxml', t: 'Shkëmbimi i cilësimeve me klientin desktop',
          b: ['Cilësimet e tua mund të udhëtojnë mes klientëve: kategoria Kopje rezervë dhe rivendosje ofron eksport/import të skedarit zyrtar config.xml (skedari ~/.pokerth/config.xml që përdorin klientët desktop dhe QML). Eksportimi shkruan cilësimet e përbashkëta — emri, opsionet e shfaqjes, zërat, preferencat e tavolinës, blindet, stilet; importimi i zbaton këtu nga një skedar desktop. Cilësimet që ky klient nuk i njeh mbeten të paprekura në skedar.', 'Shënimet e tua për lojtarët gjithashtu udhëtojnë me skedarin — teksti dhe vlerësimi me yje, të shkruara ashtu siç i lexojnë klientët desktop. Etiketat me ngjyra mbeten në këtë klient: formati zyrtar s\u2019ka fushë për to, kështu që importimi kurrë nuk i prek ato.'] },
        { id: 'sync', t: 'Cilësimet që të ndjekin',
          b: ['Kur luan me një llogari, opsionet, tema, lidhjet e tastierës, gjuha dhe trofetë e stërvitjes sinkronizohen: ndrysho diçka në një pajisje dhe pajisja tjetër ku hyn e merr atë. Përparimi i trofeve bashkohet, kurrë s\u2019mbivendoset, kështu që të luash në dy pajisje gjithmonë ruan më të mirën e të dyjave.'] },
        { id: 'updates', t: 'Qëndrimi i përditësuar',
          b: ['Klienti përditësohet vetë: kur një version i ri vendoset, një banderolë të fton të rifreskosh (ose shkruaj /update në bisedë për kontroll manual). Herë pas here, një anketë e vogël produkti mund të shfaqet duke pyetur për mendimin tënd mbi një veçori — pjesëmarrja është opsionale dhe anketat mund të çaktivizohen plotësisht te Opsionet e avancuara → Komuniteti.'] },
        { id: 'fkeys', t: 'Shkurtoret zyrtare të tastierës',
          b: ['Tastet zyrtare të funksionit të PokerTH funksionojnë gjatë një loje — Alt+S funksionon kudo:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold · Check/Call · Bet/Raise · All-In (renditja mund të kthehet te opsionet)'],
            ['F5', 'Trego letrat e tua (kur është e mundur)'],
            ['F6 / F7 / F8', 'Manual · Check/Fold automatik · Check/Call automatik'],
            ['Alt+M / Alt+K / Alt+F', 'Manual · Check/Call automatik · Check/Fold automatik'],
            ['Alt+C / Alt+L / Alt+I', 'Biseda · Regjistri i lojës · Paneli i shanseve'],
            ['Alt+S', 'Opsionet — kudo në aplikacion, jo vetëm gjatë një loje'],
            ['F11', 'Ekran i plotë']],
          note: 'Shkurtoret kërkojnë një tastierë fizike. Në Mac, tastet F si parazgjedhje bëhen kontrolle mediash: mbaj Fn (ose aktivizo “Use F1, F2, etc. as standard function keys” te cilësimet e macOS). Në iPhone, ekrani i plotë kufizohet nga iOS — instalimi i aplikacionit si PWA jep të njëjtën përvojë ekrani të plotë.' },
        { id: 'webkeys', t: 'Tastet e shkronjave web',
          b: ['Si shtesë web, tastet e një shkronjë të vetme dhe Alt+T gjithashtu aktivizojnë veprime, dhe secili prej tyre mund të ri-caktohet te Opsionet e avancuara → Shkurtoret e tastierës:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 · 1/2 · Pot'],
            ['Alt+T', 'Paneli i statistikave'],
            ['Esc', 'Mbyll dritaren më të sipërme (edhe butoni Prapa i Android-it)'],
            ['↑ ↓ · ↵', 'Lista e tavolinave në lobi (arrihet me Tab): zgjidh një tavolinë · bashkohu']],
          note: 'Në Android, butoni/gjesti i sistemit Prapa mbyll dritaret si Escape, në vend që të lërë lojën (i konfigurueshëm te opsionet). iOS s\u2019ka një buton ekuivalent sistemi — përdor ✕ e çdo dritareje.' }
      ]
    }
  ]
};
