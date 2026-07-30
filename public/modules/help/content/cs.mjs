// ── help/content/cs.mjs — Český korpus nápovědy (4. dávka) ──────────────────
// Překlad en.mjs (vzor). Struktura a id shodné; přeloženy jen t / b / list /
// keys (popisky) / note. Pokerové termíny (Fold, Check, Call, Bet, Raise,
// All-In, flop, turn, river…) zůstávají anglicky dle konvence aplikace.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'První kroky',
      sections: [
        { id: 'modes', t: 'Tři způsoby hraní',
          b: ['Na přihlašovací obrazovce si vyber, jak chceš hrát.'],
          list: [
            'Internet — hraj online na oficiálním serveru pokerth.net, s žebříčky. Je potřeba účet pokerth.net; registrace na pokerth.net je zdarma.',
            'Místní hra / trénink — hraj offline proti botům. Nic se nenastavuje, funguje bez připojení a s pokroky odemykáš trofeje.',
            'LAN / vyhrazený server — připoj se k soukromému serveru PokerTH ve své místní síti nebo na vlastním stroji.'] },
        { id: 'lan', t: 'LAN / vyhrazený server',
          b: ['Třetí režim se připojí k libovolnému serveru PokerTH, který provozuješ ty nebo kamarád — v domácí síti, na soukromém VPS, kdekoli. Zadej adresu a port serveru, zaškrtni TLS, pokud server používá šifrovaný port, a přihlas se přezdívkou (hostovské přihlášení funguje, pokud ho server povoluje). U stolu se pak vše chová úplně stejně jako na oficiálním serveru.'] },
        { id: 'famboard', t: 'Rodinný žebříček',
          b: ['Jen na soukromých serverech a v LAN hrách si klient vede souhrnné statistiky podle přezdívek — odehrané a vyhrané ruce i partie, největší výhra, nejlepší série — a sdílí je přes server, takže každé zařízení u stolu vidí stejný žebříček. Hry na pokerth.net se takto nikdy nesledují a statistiky tréninkového režimu zůstávají zcela oddělené.'] },
        { id: 'language', t: 'Jazyk',
          b: ['Rozhraní je k dispozici ve 36 jazycích. Kdykoli ho změníš v Pokročilých možnostech (menu s ozubeným kolem), kategorie Uživatelské rozhraní. Pokerové akční termíny (Fold, Check, Call, Bet, Raise, All-In) zůstávají podle konvence anglicky, přesně jako v desktopovém klientu.'] },
        { id: 'pwa', t: 'Instalace jako aplikace',
          b: ['Tento klient je Progressive Web App: můžeš ho nainstalovat z menu prohlížeče (nebo tlačítkem instalace v záhlaví) a získat celoobrazovkovou aplikaci s vlastní ikonou. Po instalaci startuje okamžitě a tréninkový režim funguje zcela offline.'],
          note: 'Na Androidu a v desktopovém Chrome/Edge zařídí vše tlačítko instalace. Na iPhonu/iPadu Apple povoluje instalaci jen přes Safari: tlačítko Sdílet \u2192 \u201ePřidat na plochu\u201c — klient tyto kroky v případě potřeby zobrazí. Po instalaci aplikace tlačítko zmizí.' },
        { id: 'platforms', t: 'Platformy a prohlížeče',
          b: ['Klient běží v každém moderním prohlížeči na každém systému — Windows, macOS, Linux, Android, iOS. Několik funkcí spoléhá na novější API prohlížečů; když API chybí, funkce se schová nebo vysvětlí, místo aby se rozbila. Hlavní rozdíly, které stojí za to znát:'],
          list: [
            'Chrome / Edge (desktop): funguje vše, včetně zápisu logu .pdb do složky.',
            'Firefox: vše kromě zápisu .pdb do složky (API zatím není).',
            'Safari / iOS: instalace přes Sdílet \u2192 \u201ePřidat na plochu\u201c; bez vibrací; celá obrazovka na iPhonu omezená; zvuk začne po tvém prvním klepnutí.',
            'Android: plná podpora v prohlížečích Chromium, včetně vibrací a chování tlačítka Zpět.'] },
        { id: 'avatar', t: 'Přezdívka a avatar',
          b: ['Před připojením si na přihlašovací obrazovce vyber přezdívku a avatar. Na pokerth.net je přezdívka jménem tvého účtu; avatary se s ostatními hráči sdílejí přes avatarový server.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pravidla pokeru',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em v kostce',
          b: ['PokerTH se hraje jako No-Limit Texas Hold\u2019em. Každý hráč dostane dvě zavřené karty (hole cards). Poté se doprostřed stolu vyloží lícem nahoru pět společných karet. Nejlepší pětikaretní ruka složená z libovolné kombinace tvých dvou karet a pěti společných vyhrává bank.'] },
        { id: 'blinds', t: 'Blindy a tlačítko dealera',
          b: ['Před každou rukou plní bank dvě povinné sázky: small blind a big blind, které skládají dva hráči nalevo od tlačítka dealera. Tlačítko se po každé ruce posune o jedno místo po směru hodinových ručiček, takže blindy platí všichni postupně. Blindy během partie v pravidelných intervalech rostou.',
              'Na stole jsou tlačítko a blindy označeny žetony: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Čtyři sázkové kola',
          list: [
            'Pre-flop — po rozdání zavřených karet začíná první sázkové kolo nalevo od big blindu.',
            'Flop — odkryjí se tři společné karty, následuje sázkové kolo.',
            'Turn — čtvrtá společná karta, pak další sázkové kolo.',
            'River — pátá a poslední společná karta, poté závěrečné sázkové kolo.'],
          b: ['Sázkové kolo končí, když každý hráč, který v ruce zůstává, vložil do banku stejnou částku (nebo je all-in).'] },
        { id: 'actions', t: 'Co můžeš udělat, když jsi na tahu',
          list: [
            'Fold — složit ruku. Tvé karty jdou pryč a o bank už nehraješ.',
            'Check — pokračovat bez sázky. Jde to jen tehdy, když není co dorovnávat.',
            'Call — dorovnat probíhající sázku.',
            'Bet — otevřít sázení, když na této street ještě nikdo nesázel.',
            'Raise — navýšit nad stávající sázku. Minimální navýšení se rovná předchozí sázce nebo navýšení.',
            'All-In — vsadit celý svůj stack. V ruce zůstáváš do výše pokryté částky.'] },
        { id: 'showdown', t: 'Showdown a dělené banky',
          b: ['Pokud po sázkovém kole na riveru zůstane více hráčů, ruce se odkryjí a vyhrává nejlepší — vítězná kombinace se ukáže pod společnými kartami. Když je hráč all-in s méně, než činí plné sázky, vznikají vedlejší banky: každý hráč může vyhrát jen tu část banku, do které přispěl. Shodné ruce si bank dělí.'] },
        { id: 'hands', t: 'Pořadí rukou',
          b: ['Od nejslabší po nejsilnější:'],
          list: [
            '1. High Card — žádná kombinace; rozhoduje nejvyšší karta.',
            '2. Pair — dvě karty stejné hodnoty.',
            '3. Two Pair — dva různé páry.',
            '4. Three of a Kind — tři karty stejné hodnoty.',
            '5. Straight — pět karet v řadě (eso platí jako nejvyšší i nejnižší).',
            '6. Flush — pět karet stejné barvy.',
            '7. Full House — trojice plus pár.',
            '8. Four of a Kind — čtyři karty stejné hodnoty.',
            '9. Straight Flush — postupka celá v jedné barvě.',
            '10. Royal Flush — od desítky po eso v jedné barvě. Nejlepší možná ruka.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Herní obrazovka',
      sections: [
        { id: 'actionbar', t: 'Panel akcí',
          b: ['Když jsi na tahu, spodní panel akcí se rozsvítí a nabídne až čtyři tlačítka: Fold (červené), Check / Call (modré), Bet / Raise (zelené — hlavní akce, zvýrazněná) a All-In (tmavě červené). Tlačítko Check / Call ukazuje přesnou částku k dorovnání; Bet / Raise ukazuje částku, kterou se chystáš vložit. Po riveru se All-In může změnit na tlačítko Show pro odkrytí karet.'] },
        { id: 'betctl', t: 'Volba sázky',
          b: ['Částku navýšení nastavíš číselným polem, posuvníkem nebo rychlými tlačítky 1/3 \u00b7 1/2 \u00b7 Pot (zlomky aktuálního banku). Částky se automaticky zaokrouhlují a drží se mezi minimálním a maximálním povoleným navýšením. Pokud raději přemýšlíš v big blindech, volba zobrazí všechny částky v BB místo žetonů.'] },
        { id: 'preselect', t: 'Předvolba akce',
          b: ['Před svým tahem si můžeš akci nachystat dopředu: klepni na tlačítko a to dostane zlatý rámeček s malou zlatou tečkou. Až přijde tvůj tah, akce se provede okamžitě. Nachystaný Fold se automaticky změní na Check, když je check zdarma — nikdy nesložíš zbytečně. Předvolby se resetují s každou novou rukou, změnou street a showdownem a ruší se, pokud se situace změní (například se změní částka k dorovnání).'] },
        { id: 'automodes', t: 'Automatické režimy',
          b: ['Rozbalovací nabídka vedle akčních tlačítek nabízí tři herní režimy: Ruční, Auto Check/Call a Auto Check/Fold. Automatické režimy hrají za tebe, dokud se nevrátíš — jakékoli ruční kliknutí na akci okamžitě vrátí Ruční režim.'] },
        { id: 'readtable', t: 'Čtení stolu',
          b: ['Každý hráčský box zobrazuje avatar, jméno, stack a probíhající sázku. Dealer a blindy jsou označeny žetony D / SB / BB. Barevný odznak na boxu ukazuje poslední akci hráče; tenký modrý proužek odpočítává jeho čas na rozmyšlenou. Box hráče na tahu se rozsvítí; tvůj vlastní box dostane při tvém tahu pulzující zlatý rámeček.',
              'Stavový řádek nad stolem ukazuje celkový bank, sázky probíhající street, fázi (Pre-flop, Flop, Turn, River) a čísla hry a ruky. Hráči, kteří složili, mají průsvitné karty; vyřazení jsou ztmavení. Na konci ruky může okno vítěze shrnout, kdo co vyhrál — vypíná se v možnostech.'] },
        { id: 'seatlayout', t: 'Rozmístění míst',
          b: ['Jako webové rozšíření se rozložení hráčských boxů volí v Pokročilé možnosti \u2192 Místa: Automatické sleduje oficiálního klienta (pevné pozice na výšku, počítaná elipsa na šířku), nebo vynutíš rozložení Na výšku či Na šířku — a Vlastní ti nechá rozmístit každé místo ručně: objeví se režim úprav, ve kterém přetáhneš každý box přesně tam, kam chceš, a rozložení se uloží.'] },
        { id: 'zoom', t: 'Zoom stolu (telefony)',
          b: ['Na malých obrazovkách tlačítka lupy stůl zvětší (2\u00d7) a můžeš ho posouvat prstem — tvůj box a panel akcí zůstávají na místě. Pohled automaticky sleduje aktivní místo a při showdownu se oddálí pro celkový přehled. Vypíná se v Pokročilých možnostech.'],
          note: 'Na telefonech a tabletech je gesto přiblížení samotného prohlížeče ve výchozím stavu zablokované, aby se zoom nikdy omylem nespustil uprostřed ruky; pokud ti to vyhovuje jinak, zapni ho zpět v Pokročilé možnosti \u2192 Uživatelské rozhraní.' },
        { id: 'protections', t: 'Ochrana proti nakukování a náhodnému Callu',
          b: ['Dvě volitelné ochrany: ochrana proti nakukování drží tvé karty zakryté, dokud se jich nedotkneš (užitečné, když ti někdo vidí na obrazovku), a pojistka proti náhodnému Callu krátce zablokuje tlačítko Call hned po velkém navýšení, aby klepnutí mířené na menší Call nespadlo omylem na navýšenou částku. Obě najdeš v Pokročilých možnostech.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Informační panel',
      sections: [
        { id: 'open', t: 'Otevření panelu',
          b: ['Během hry se informační panel otevírá ze záhlaví (nebo Alt+L / Alt+I) a má tři záložky: Historie, Šance a Statistiky. Na telefonu se vznáší nad stolem; na větších obrazovkách je to přesouvatelné okno s měnitelnou velikostí — uchop úchyt \u28ff pro přesun, okraje pro změnu velikosti. Jeho poloha se pamatuje.'] },
        { id: 'log', t: 'Herní záznam',
          b: ['Záložka Historie zaznamenává celou partii ruku po ruce: blindy, každou akci s částkami, odkryté karty a vítěze, vše barevně pro rychlé čtení. Tlačítko exportu uloží záznam do souboru, pokud si chceš sezení projít později.'] },
        { id: 'odds', t: 'Šance (monitor pravděpodobností)',
          b: ['Záložka Šance ukazuje pro tvou aktuální ruku živou pravděpodobnost, že skončíš s každou z 10 kategorií rukou — od High Card po Royal Flush — každá s ikonou, procentem a proužkem. Jakmile složíš, zobrazení zešedne. Používá jen tvé karty a společné karty: nevidí nic, co soupeři neukážou.'] },
        { id: 'journal', t: 'Záznamy rukou a okno \u201eLogy\u201c',
          b: ['Kromě živé historie se každá odehraná ruka lokálně ukládá do prohlížeče, ve stejném formátu jako soubory logů .pdb oficiálního klienta. Okno Logy (Pokročilé možnosti \u2192 Zprávy logu \u2192 Spravovat logy\u2026) vypisuje tvá sezení a umožňuje s nimi pracovat: náhled sezení s vyhledáváním a zvýrazněním, filtrování podle hry, export do HTML nebo prostého textu, uložení surového souboru .pdb, nebo import .pdb nahraného desktopovým klientem. Sezení se mažou po jednom nebo všechna najednou (s potvrzením) a automatická retence může ponechat jen posledních 7, 30, 90, 180 nebo 365 dní. Záznamy, které si sami naimportujete, se nikdy nemažou automaticky. Druhé nastavení omezuje počet uchovávaných relací a sloupec se seznamem lze tažením rozšířit.',
              'Tlačítko Analyzovat spustí nad sezením analýzu rukou a může odeslat log do analytické služby pokerth.net. Vše zůstává na tvém zařízení, dokud výslovně neexportuješ nebo neodešleš.'] },
        { id: 'logopts', t: 'Možnosti záznamu',
          b: ['V Pokročilých nastaveních \u2192 Zprávy protokolu můžeš zapnout nebo vypnout zaznamenávání a zvolit interval zápisu se stejnými třemi možnostmi jako desktopový klient: po každé akci, po každém rozdání (výchozí) nebo po každé hře. Další volba zapisuje soubor .pdb do složky dle tvého výběru a udržuje jej v tomto intervalu aktuální, plus ještě jednou při opuštění stránky, aby jiný nástroj mohl hru sledovat živě.'],
          note: 'Zápis do místní složky vyžaduje File System Access API: pouze Chrome, Edge a Opera na počítači. Jinde se volba sama vysvětlí a ruční export z okna protokolů zůstává dostupný. Prohlížeč umí soubor pouze nahradit, nikdy do něj připojovat, takže nástroj čtoucí .pdb by jej měl po každé změně znovu otevřít.' },
        { id: 'assist', t: 'Asistence (síla ruky)',
          b: ['Nahoře na záložce Šance ti asistenční pruh čte ruku za tebe. Před flopem pojmenuje tvou startovní ruku a ohodnotí ji hvězdami; od flopu ukazuje tvou aktuální nejlepší kombinaci a po rychlé simulaci odhadovanou šanci na výhru ruky v procentech, s barevným ukazatelem od červené (slabá) po zelenou (silná). Stejně jako monitor pravděpodobností používá jen informace, které vidíš.',
              'Dva styly zobrazení najdeš v Pokročilé možnosti \u2192 Místa: Segmenty (deset bloků) nebo klasický ukazatel průběhu. Celou asistenci lze vypnout v Pokročilé možnosti \u2192 Asistence.'] },
        { id: 'assistwin', t: 'Asistence jako plovoucí widget',
          b: ['Blok asistence lze od panelu odtrhnout do vlastního okénka vždy navrchu: použij tlačítko odtržení na bloku, pak ho přesouvej a zvětšuj kdekoli nad stolem — praktické pro sledování síly ruky bez otevřeného celého panelu. Tlačítko ukotvení ho vrátí do záložky Šance a poloha se pamatuje. Uvnitř panelu ti úchyt mezi Asistencí a šancemi umožní rozdělit prostor mezi obě části.'] },
        { id: 'stats', t: 'Statistiky',
          b: ['Záložka Statistiky sleduje tvé sezení: odehrané ruce, viděné flopy, showdowny, úspěšnost a další. Sledování statistik lze vypnout v Pokročilých možnostech.'] },
        { id: 'hud', t: 'HUD statistik u míst (beta)',
          b: ['HUD připne vedle místa každého hráče malý statistický box sestavený z rukou zaznamenaných v tvých lozích: počet pozorovaných rukou, dále VPIP (jak často dobrovolně vkládá peníze pre-flop), PFR (pre-flop navýšení), AF (faktor agrese), 3B (3-bet), CB (continuation bet) a F3B (fold na 3-bet), s barevnou škálou od pasivního po agresivní. Klepnutím na box otevřeš podrobné okno s dalšími čísly (pokusy o steal, fold na steal, míry showdownů\u2026), a pokud něco zakrývá, přetáhni ho.',
              'HUD zná jen to, co jsi viděl u vlastních stolů — čte tvé místní záznamy rukou, takže záznam musí být zapnutý a čísla dávají smysl až po dostatku rukou. Je to beta funkce, ve výchozím stavu vypnutá: zapni ji v Pokročilé možnosti \u2192 Asistence.'] },
        { id: 'handsbtn', t: 'Přehled kombinací',
          b: ['Ikona pokerových rukou na plátně kdykoli otevře rychlý přehled 10 kombinací — šikovné při učení. Skrývá se v Pokročilých možnostech.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat a sociální funkce',
      sections: [
        { id: 'panels', t: 'Chat lobby a chat u stolu',
          b: ['Jeden chat je v lobby, druhý u stolu. Na telefonu se chat u stolu vznáší nad hrou; na větších obrazovkách je to přesouvatelné okno s měnitelnou velikostí. Odznak na tlačítku chatu počítá nepřečtené zprávy.'] },
        { id: 'typing', t: 'Pomůcky při psaní',
          list: [
            'Tab doplní přezdívku — dalším stiskem Tab procházíš shody.',
            '\u2191 / \u2193 listují historií tvých zpráv.',
            'Tlačítko emoji otevře úplný výběr; napsání : napovídá emotikony i během psaní.'] },
        { id: 'emotes', t: 'Emotikony a smajlíci',
          b: ['Chat převádí kódy emotikonů úplně stejně jako oficiální desktopový klient: napiš jméno mezi dvě dvojtečky a promění se v emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 podporováno je přes 1 900 kódů (kompletní sada GitHubu). Převádějí se i klasické textové smajlíky: :-) ;) :D xD :P <3 a asi osmdesát dalších.',
              'Napsání : otevře okno s návrhy, které kód doplňuje během psaní (\u2191/\u2193 pro výběr, Tab nebo Enter pro potvrzení). Převod emoji lze úplně vypnout v Pokročilé možnosti \u2192 Chat.'] },
        { id: 'commands', t: 'Příkazy chatu',
          b: ['Chat rozumí lomítkovým příkazům. Dva jsou viditelné ostatním:'],
          keys: [
            ['/me <text>', 'Akční zpráva, zobrazí se jako \u201e* tvojeprezdivka text\u201c'],
            ['/emoji <emoji>', 'Přehraje emoji reakci (totéž, co posílá výběr reakcí)']] },
        { id: 'diagcmds', t: 'Diagnostické příkazy',
          b: ['Vše ostatní je místní: odpovědi vidíš jen ty a ke stolu se nic neposílá. Napiš /help pro výpis všech. Nejužitečnější:'],
          keys: [
            ['/help', 'Vypsat všechny příkazy'],
            ['/update', 'Zkontrolovat novou verzi a obnovit'],
            ['/lang <kód>', 'Změnit jazyk (např. /lang cs)'],
            ['/sound on|off', 'Zapnout/ztlumit herní zvuky'],
            ['/zoom', 'Přepnout lupu stolu'],
            ['/clear', 'Vymazat chat místně'],
            ['/table', 'Informace o aktuální hře (blindy, hráči, stacky)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostika stavu klienta, sítě a plynulosti'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Pokročilé ladění (karty, protokol, zvuk, úložiště, místa)'],
            ['/copy', 'Zkopírovat poslední odpověď příkazu do schránky']] },
        { id: 'reactions', t: 'Emoji reakce',
          b: ['Tlačítko reakcí otevře výběr 30 animovaných reakcí (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026), které se s efektem přehrají nad tvým místem a vidí je celý stůl — včetně hráčů na desktopovém klientu. Reakce lze úplně vypnout v Pokročilých možnostech.'] },
        { id: 'translate', t: 'Rozumět všem',
          b: ['Se zapnutým překladem chatu se tlačítko překladu objeví na řádku pod ukazatelem — nebo na řádku, na který klepneš na dotykové obrazovce — a zobrazí zprávu ve tvém jazyce překladačem prohlížeče. Lze jej trvale zobrazit na všech řádcích v Pokročilých možnostech → Chat, kde bývá i nápověda k běžným stolovým zkratkám (gg, nh, utg…).'],
          note: 'Překlad používá službu Google Translate a funguje v každém prohlížeči — stačí připojení k internetu. Zpráva se do překladové služby odešle jen tehdy, když klepneš na její tlačítko překladu, nikdy automaticky.' },
        { id: 'social', t: 'Hráči: profil, pozvání, ignorování',
          b: ['Klepni na libovolného hráče — u stolu nebo v seznamu lobby — a otevře se jeho karta: profil a statistiky, pozvání do tvé hry, nebo ignorování (jeho zprávy v chatu se skryjí; ignorování lze kdykoli zrušit). Potvrzení před pozváním/ignorováním lze zapnout v možnostech.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby a hry',
      sections: [
        { id: 'list', t: 'Seznam her',
          b: ['Lobby vypisuje všechny stoly serveru. Každý řádek ukazuje počet hráčů, typ hry, zámek, když je vyžadováno heslo nebo pozvánka, a stavový odznak: \u201eČeká se\u201c (zelený — hra nezačala, můžeš se připojit, je-li volné místo), \u201eProbíhá\u201c (teplá barva — lze sledovat živě, pokud jsou povoleni diváci) a \u201eUzavřená\u201c (ztlumený). Plný stůl poznáš prostě podle plného počítadla, třeba 10/10; barvy odznaků sledují aktivní motiv.',
              'Rozbalovací filtr zužuje seznam úplně stejně jako desktopový klient, každá volba přísnější než předchozí: jen otevřené hry \u2192 navíc skrýt plné stoly \u2192 pak jen neveřejné, jen soukromé, nebo jen hodnocené hry. Tvá volba se pamatuje. Vyhledávací pole najde hru podle jména a odznak hráčů otevře seznam všech připojených, prohledávatelný a řaditelný.'] },
        { id: 'join', t: 'Připojení a sledování',
          b: ['Vyber otevřenou hru a připoj se — zámek značí, že je potřeba heslo. Probíhající hry, které povolují diváky, lze sledovat živě: vidíš stůl a chat, ale zavřené karty zůstávají skryté a nemůžeš jednat.'] },
        { id: 'gameinfo', t: 'Informace o hře',
          b: ['Před připojením ukáže karta informací o hře vše, co stůl definuje: typ hry, blindy a jejich růst (zdvojování nebo ruční seznam), počáteční stack, čas na akci, pauzu mezi rukama a kdo už sedí.'] },
        { id: 'create', t: 'Vytvoření hry',
          b: ['Vytvoř si vlastní stůl: jméno, počet hráčů, počáteční stack, první small blind a schéma navyšování, čas na akci a zda jsou povoleni diváci. Existují čtyři typy her: Normální (všichni), jen registrovaní hráči, jen na pozvání, a Hodnocená (počítá se do oficiálního žebříčku — heslo pak nelze nastavit). Oblíbená nastavení si můžeš uložit a znovu načíst.'] },
        { id: 'invites', t: 'Pozvánky',
          b: ['Hráči tě mohou pozvat ke svému stolu; dostaneš oznámení, které můžeš přijmout, nebo odmítnout. Pozvání je jediný způsob, jak vstoupit do hry jen na pozvání.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Tvůj účet',
          b: ['Oficiální internetový server je pokerth.net. Hraní na něm vyžaduje bezplatný účet pokerth.net — zaregistruj se na webu a pak se zde přihlas stejnou přezdívkou a heslem. Tento webový klient se připojuje k úplně stejnému serveru jako desktopový klient: stejné účty, stejné stoly, stejné žebříčky, a můžeš si sednout ke stolu s hráči desktopového klienta.'] },
        { id: 'ranked', t: 'Hodnocené hry a sezóny',
          b: ['Hry typu Hodnocená se počítají do oficiálního sezónního žebříčku. Tvůj profil v aplikaci ukazuje datum registrace, Rank aktuální sezóny, Skóre, průměr a odehrané hry, plus poslední výsledky. Normální (nehodnocené) hry jsou jen pro zábavu a nic nemění.'] },
        { id: 'rankhow', t: 'Jak se počítá žebříček',
          b: ['V každé hodnocené hře ti tvoje umístění přinese body: 15 za první, pak 9, 6, 4, 3, 2 a 1 až do sedmého; od osmého po desáté nic. Stůl tedy rozdá celkem 40 bodů.',
              'Tvoje Score není součet těchto bodů, ale tvůj průměr na hru, ztlumený koeficientem, který roste s počtem odehraných her: pár dobrých výsledků nestačí, aby ses usadil nahoře, je potřeba i pravidelnost — čím víc hraješ, tím blíž je tvoje Score tvému skutečnému průměru. Sezóna trvá čtvrtletí: při přechodu se vše archivuje a počitadla začínají od nuly, minulé sezóny zůstávají k nahlédnutí. Ve hře ukazuje tlačítko stupňů vítězů sezónní pořadí hráčů u tvého stolu.'],
          note: 'Bodovou stupnici i přesný vzorec určuje žebříčkový server pokerth.net a mohou se měnit; rozhodující jsou stránky webu.' },
        { id: 'rankings', t: 'Stránky žebříčků',
          b: ['Položka žebříčku otevře oficiální žebříček PokerTH, prohledávatelný podle hráčů, a také komunitní žebříčky (BBC, WEC). Pokud tě žebříčky nezajímají, položku skryješ v Pokročilé možnosti \u2192 Komunita.'] },
        { id: 'cups', t: 'Komunitní poháry: BBC a WeCup',
          b: ['Dvě komunity pořádají na pokerth.net vlastní soutěže, každá s vlastním webem a vlastním žebříčkem. Best Brainies Cup (BBC) je stupňový turnaj vzniklý v roce 2013: postupuje se od Step 1 ke Step 4 a nová sezóna začíná po každé hře Step 4, kdy se předává pohár. WeCup (WEC) má vlastní, mnohem rozprostřenější stupnici — 75 bodů za první místo, pak 45, 30, 20… — a jeho score normalizuje tvůj průměr podle počtu her, které jsi odehrál, ve srovnání s ostatními členy.',
              'Oba žebříčky otevřeš tlačítkem poháru vedle žebříčku PokerTH. Nastavení stolů těchto soutěží je k dispozici jako předvolby při vytváření hry (BBC Step 1 až 4, WEC, WEC Monthly Final a WEC Grand Final), takže můžeš trénovat za stejných podmínek. Účast vyžaduje registraci na webu příslušného poháru.'],
          note: 'Pokud tě poháry nezajímají, skryješ tento obsah naráz v Pokročilé možnosti → Komunita.' },
        { id: 'forumcups', t: 'Poháry fóra a události',
          b: ['Na fóru pokerth.net běží také Monthly Cup, měsíční série, v níž se hráči rozdělí ke stolům Gold, Silver a Bronze, než je korunován šampion měsíce, a k tomu jednotlivé zvláštní poháry během roku.',
              'Přihlášky, termíny, nastavení stolů a výsledky se zveřejňují na fóru a hry probíhají na oficiálním serveru jako každé jiné. Ke sledování výsledků stačí účet pokerth.net; přihlášení do poháru vede přes odpovídající vlákno fóra.'] },
        { id: 'avatars', t: 'Avatary a vlajky',
          b: ['Na pokerth.net se tvůj avatar rozesílá ostatním hráčům přes avatarový server a na hráčských boxech se může zobrazovat malá vlajka země. Obojí je volitelné a nastavitelné v možnostech.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Tréninkový režim',
      sections: [
        { id: 'what', t: 'Co to je',
          b: ['Režim Místní hra / trénink je plnohodnotná partie proti soupeřům řízeným počítačem: bez připojení, bez účtu, o nic nejde. Jakmile je aplikace nainstalovaná (nebo jen jednou navštívená), funguje zcela offline — ideální na učení hry, zkoušení rozhraní nebo krácení času v režimu letadlo.'] },
        { id: 'setup', t: 'Nastavení hry',
          b: ['Zvol počet soupeřů, počáteční stack, blindy a jejich růst a rychlost hry. Složení a obtížnost botů se ladí v Pokročilé možnosti \u2192 Místní hra — od mírných soupeřů po tvrdší a pestřejší stůl.'] },
        { id: 'trophies', t: 'Trofeje',
          b: ['Tréninkový režim má vlastní postup: 28 trofejí v šesti kategoriích (postup, technika, styl, formáty, zábava a jedna tajná) se odemyká hraním — odehrané ruce, vyhrané partie, velké bluffy, zvláštní ruce a další. Postup trofejí je kumulativní a při zapnuté synchronizaci nastavení účtu se slučuje mezi zařízeními.'] },
        { id: 'learn', t: 'Dobré místo k učení',
          b: ['Vše popsané v ostatních kapitolách funguje i tady: monitor pravděpodobností, asistenční zobrazení, předvolba, klávesové zkratky. Tréninkový režim je nejlepší místo, kde si je bez tlaku vyzkoušet, než vyrazíš na pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Styl a zvuk',
      sections: [
        { id: 'themes', t: 'Motivy',
          b: ['Kategorie Styl v Pokročilých možnostech obléká celého klienta. Předvolby nastaví vše jedním klepnutím (klasické zelené kasino, oficiální vzhled PokerTH\u2026); pod nimi jednotlivé osy zvlášť ladí barevnou paletu, plátno stolu a líce karet — změň libovolnou osu a tvá kombinace se stane vlastním motivem. Tmavý, světlý nebo automatický režim se volí v Uživatelském rozhraní a tvé volby platí okamžitě, na každé obrazovce, a pamatují se.'] },
        { id: 'tablelook', t: 'Stoly, balíčky, místa',
          b: ['Kromě motivu lze nezávisle měnit několik prvků: pozadí stolu, balíček karet, rub karet (automaticky sladěný s balíčkem, nebo importuj vlastní obrázek), žetony dealera a blindů, styl akčních tlačítek a kompletní balíčky míst, které převlékají hráčské boxy. Vše zvolíš v Pokročilé možnosti \u2192 Styl; změny jsou u stolu vidět okamžitě.'] },
        { id: 'music', t: 'Hudební přehrávač',
          b: ['Položka hudby v menu záhlaví otevře malý přehrávač hudby na pozadí: vyber skladbu z playlistu, přehrát/pauza, předchozí/další, náhodně a opakování jedné skladby, celého playlistu nebo ničeho. Hlasitost, vybraná skladba a režim opakování se pamatují. Přehrávání nikdy nezačne samo — prohlížeče vyžadují klepnutí — a přehrávač je zcela nezávislý na herních zvukových efektech.'] },
        { id: 'sounds', t: 'Zvukové efekty',
          b: ['Herní zvuky jsou seskupeny do čtyř samostatně zapínatelných kategorií, přesně jako v desktopovém klientu: herní akce (rozdané karty, Check, Call, Raise, tvůj tah\u2026), oznámení chatu lobby, oznámení síťové hry (hráč se připojil, hra připravena) a oznámení zvýšení blindů. Jediný posuvník hlasitosti řídí vše, v Pokročilé možnosti \u2192 Zvuk.'],
          note: 'Všechny prohlížeče — zvláště iOS — odmítají přehrát zvuk, dokud se stránky jednou nedotkneš. Pokud hra začne potichu, jediné klepnutí kamkoli zvuk probudí; klient také automaticky opraví zvukový engine, když ho iOS pozastaví (příchozí hovor, pozadí\u2026).' },
        { id: 'voice', t: 'Hlas a vibrace',
          b: ['Dva další kanály tě mohou informovat, aniž bys koukal na obrazovku: hlasová oznámení předčítají herní události pomocí syntézy řeči tvého zařízení a na telefonu může krátká vibrace označit tvůj tah. Obojí jsou webová rozšíření, ve výchozím stavu zapnutá či ne podle zařízení, v Pokročilé možnosti \u2192 Sázky a tah.'],
          note: 'Vibrace fungují na Androidu (prohlížeče Chromium); Apple webům API vibrací nezpřístupňuje, takže iPhony vibrovat nemohou. Hlasová oznámení fungují všude, ale dostupné hlasy a jazyky závisí na tvém systému — klient použije nejlepší nalezenou shodu.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Možnosti a zkratky',
      sections: [
        { id: 'where', t: 'Kde možnosti bydlí',
          b: ['Pokročilé možnosti otevřeš položkou s ozubeným kolem v libovolném menu záhlaví. Jsou seskupené jako v desktopovém klientu: Uživatelské rozhraní, Styl, Zvuk, Místní hra, Síťová hra, Internetová hra, Přezdívky / Avatary, Zprávy logu a Obnovit výchozí. Každá webová funkce tam má vlastní vypínač, takže si vypneš vše, co nepoužíváš.'] },
        { id: 'cfgxml', t: 'Výměna nastavení s desktopovým klientem',
          b: ['Tvá nastavení mohou cestovat mezi klienty: kategorie Zprávy logu nabízí export/import oficiálního souboru config.xml (onoho \u007e/.pokerth/config.xml, který používají desktopoví a QML klienti). Export zapíše sdílená nastavení — jméno, možnosti zobrazení, zvuky, předvolby stolu, blindy, styly — a import zde aplikuje soubor z desktopu. Nastavení, která tento klient nezná, zůstanou v souboru netknutá.'] },
        { id: 'sync', t: 'Nastavení, která tě následují',
          b: ['Když hraješ s účtem, tvé možnosti, motiv, přiřazení kláves, jazyk a tréninkové trofeje se synchronizují: změň něco na jednom zařízení a další zařízení, kde se přihlásíš, to převezme. Postup trofejí se slučuje, nikdy nepřepisuje, takže hraní na dvou zařízeních vždy zachová to nejlepší z obou.'] },
        { id: 'updates', t: 'Zůstat aktuální',
          b: ['Klient se aktualizuje sám: když je nasazena nová verze, banner tě vyzve k obnovení (nebo napiš /update do chatu pro ruční kontrolu). Občas se může objevit malý produktový dotazník na tvůj názor na některou funkci — účast je dobrovolná a dotazníky lze úplně vypnout v Pokročilé možnosti \u2192 Komunita.'] },
        { id: 'fkeys', t: 'Oficiální klávesové zkratky',
          b: ['Ofici\u00e1ln\u00ed funk\u010dn\u00ed kl\u00e1vesy PokerTH funguj\u00ed ve h\u0159e \u2014 Alt+S funguje kdekoli:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (pořadí lze v možnostech obrátit)'],
            ['F5', 'Ukázat své karty (když to jde)'],
            ['F6 / F7 / F8', 'Ruční \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Ruční \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Historie \u00b7 Panel šancí'],
            ['Alt+S', 'Nastavení — kdekoli v aplikaci, nejen ve hře'],
            ['F11', 'Celá obrazovka']],
          note: 'Zkratky vyžadují fyzickou klávesnici. Na Macu F klávesy ve výchozím stavu ovládají média: drž Fn (nebo v nastavení macOS zapni \u201ePoužívat klávesy F1, F2 atd. jako standardní funkční klávesy\u201c). Na iPhonu je celá obrazovka omezena systémem iOS — instalace aplikace jako PWA dá stejný celoobrazovkový zážitek.' },
        { id: 'webkeys', t: 'Webové písmenné klávesy',
          b: ['Webové rozšíření: jednopísmenné klávesy a Alt+T také spouštějí akce a všechny lze přemapovat v Pokročilých možnostech → Klávesové zkratky:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Panel statistik'],
            ['Esc', 'Zavřít vrchní okno (také tlačítko Zpět na Androidu)']],
          note: 'Na Androidu systémové tlačítko/gesto Zpět zavírá okna jako Esc, místo aby opustilo hru (nastavitelné v možnostech). iOS obdobné systémové tlačítko nemá — použij \u2715 každého okna.' }
      ]
    }
  ]
};
