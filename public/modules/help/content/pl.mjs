// ── help/content/pl.mjs — Polski korpus pomocy (Partia 2) ───────────────────
// Tłumaczenie en.mjs (wzorzec). Struktura i identyfikatory identyczne; tylko
// t / b / list / keys (etykiety) / note są przetłumaczone. Terminy pokerowe
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) pozostają po
// angielsku, zgodnie z konwencją aplikacji.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Pierwsze kroki',
      sections: [
        { id: 'modes', t: 'Trzy sposoby gry',
          b: ['Na ekranie logowania wybierz, jak chcesz grać.'],
          list: [
            'Internet — graj online na oficjalnym serwerze pokerth.net, z rankingami. Wymagane jest konto pokerth.net; rejestracja na pokerth.net jest darmowa.',
            'Lokalnie / trening — graj offline przeciwko botom. Nic nie trzeba konfigurować, działa bez połączenia i odblokowuje trofea w miarę postępów.',
            'LAN / serwer dedykowany — połącz się z prywatnym serwerem PokerTH w sieci lokalnej lub na własnej maszynie.'] },
        { id: 'lan', t: 'LAN / serwer dedykowany',
          b: ['Trzeci tryb łączy się z dowolnym serwerem PokerTH prowadzonym przez ciebie lub znajomego — w sieci domowej, na prywatnym VPS-ie, gdziekolwiek. Wpisz adres i port serwera, zaznacz TLS, jeśli serwer używa szyfrowanego portu, i zaloguj się pseudonimem (dostęp gościa działa, jeśli serwer na to pozwala). Przy stole wszystko zachowuje się potem dokładnie tak jak na oficjalnym serwerze.'] },
        { id: 'famboard', t: 'Rodzinny ranking',
          b: ['Tylko na serwerach prywatnych i w grach LAN klient prowadzi statystyki długoterminowe dla każdego pseudonimu — rozegrane i wygrane ręce i partie, największa wygrana, najlepsza seria — i udostępnia je przez serwer, dzięki czemu każde urządzenie przy stole widzi ten sam ranking. Gry na pokerth.net nigdy nie są w ten sposób śledzone, a statystyki trybu treningowego pozostają całkowicie oddzielne.'] },
        { id: 'language', t: 'Język',
          b: ['Interfejs jest dostępny w 36 językach. Zmień go w każdej chwili w Opcjach zaawansowanych (menu z zębatką), kategoria Interfejs użytkownika. Pokerowe terminy akcji (Fold, Check, Call, Bet, Raise, All-In) pozostają po angielsku zgodnie z konwencją, dokładnie tak jak w kliencie desktopowym.'] },
        { id: 'pwa', t: 'Instalacja jako aplikacja',
          b: ['Ten klient to Progressive Web App: możesz go zainstalować z menu przeglądarki (lub przyciskiem instalacji w nagłówku), aby uzyskać pełnoekranową aplikację z własną ikoną. Po instalacji uruchamia się natychmiast, a tryb treningowy działa całkowicie offline.'],
          note: 'Na Androidzie i w desktopowym Chrome/Edge przycisk instalacji robi wszystko. Na iPhonie/iPadzie Apple pozwala na instalację tylko przez Safari: przycisk Udostępnij \u2192 \u201eDo ekranu początkowego\u201d — klient pokazuje te kroki, gdy trzeba. Przycisk znika po zainstalowaniu aplikacji.' },
        { id: 'platforms', t: 'Platformy i przeglądarki',
          b: ['Klient działa w każdej nowoczesnej przeglądarce na każdym systemie — Windows, macOS, Linux, Android, iOS. Kilka funkcji opiera się na nowszych API przeglądarek; gdy API brakuje, funkcja ukrywa się lub wyjaśnia, zamiast się psuć. Najważniejsze różnice:'],
          list: [
            'Chrome / Edge (desktop): wszystko działa, łącznie z zapisem dziennika .pdb do folderu.',
            'Firefox: wszystko oprócz zapisu .pdb do folderu (API jeszcze niedostępne).',
            'Safari / iOS: instalacja przez Udostępnij \u2192 \u201eDo ekranu początkowego\u201d; brak wibracji; pełny ekran ograniczony na iPhonie; dźwięk startuje po pierwszym dotknięciu.',
            'Android: pełne wsparcie w przeglądarkach Chromium, łącznie z wibracją i zachowaniem przycisku Wstecz.'] },
        { id: 'avatar', t: 'Pseudonim i awatar',
          b: ['Wybierz pseudonim i awatar na ekranie logowania przed połączeniem. Na pokerth.net twój pseudonim to nazwa konta; awatary są udostępniane innym graczom przez serwer awatarów.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Zasady pokera',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em w skrócie',
          b: ['PokerTH to No-Limit Texas Hold\u2019em. Każdy gracz dostaje dwie zakryte karty (hole cards). Następnie pięć kart wspólnych trafia odkrytych na środek stołu. Najlepsza pięciokartowa ręka złożona z dowolnej kombinacji twoich dwóch kart i pięciu wspólnych wygrywa pulę.'] },
        { id: 'blinds', t: 'Blindy i przycisk rozdającego',
          b: ['Przed każdą ręką dwie obowiązkowe stawki zasilają pulę: mała i duża w ciemno, wnoszone przez dwóch graczy na lewo od przycisku rozdającego. Przycisk przesuwa się o jedno miejsce zgodnie z ruchem wskazówek zegara po każdej ręce, więc wszyscy płacą blindy po kolei. Blindy rosną w regularnych odstępach w trakcie gry.',
              'Na stole przycisk i blindy oznaczone są żetonami: D (rozdający), SB (mała w ciemno), BB (duża w ciemno).'] },
        { id: 'streets', t: 'Cztery rundy licytacji',
          list: [
            'Pre-flop — po rozdaniu zakrytych kart pierwsza runda licytacji zaczyna się na lewo od dużej w ciemno.',
            'Flop — odkrywane są trzy karty wspólne, po nich runda licytacji.',
            'Turn — czwarta karta wspólna, potem kolejna runda licytacji.',
            'River — piąta i ostatnia karta wspólna, potem końcowa runda licytacji.'],
          b: ['Runda licytacji kończy się, gdy każdy gracz pozostający w ręce włożył do puli tę samą kwotę (lub jest all-in).'] },
        { id: 'actions', t: 'Co możesz zrobić w swojej kolejce',
          list: [
            'Fold — poddać rękę. Twoje karty odpadają i nie grasz już o pulę.',
            'Check — czekać bez stawiania. Możliwe tylko wtedy, gdy nie ma nic do wyrównania.',
            'Call — wyrównać bieżącą stawkę.',
            'Bet — otworzyć licytację, gdy nikt jeszcze nie postawił na tej ulicy.',
            'Raise — przebić istniejącą stawkę. Minimalne przebicie równa się poprzedniej stawce lub przebiciu.',
            'All-In — postawić cały swój stack. Zostajesz w ręce do wysokości pokrytej kwoty.'] },
        { id: 'showdown', t: 'Showdown i dzielone pule',
          b: ['Jeśli po rundzie licytacji na riverze zostaje kilku graczy, ręce są odkrywane i wygrywa najlepsza — zwycięska kombinacja jest pokazywana pod kartami wspólnymi. Gdy gracz jest all-in za mniej niż pełne stawki, powstają pule boczne: każdy gracz może wygrać tylko tę część puli, do której się dołożył. Równe ręce dzielą pulę.',
            'Nie wszyscy muszą pokazywać: zaczynając od ostatniego gracza, który postawił lub przebił, karty odkrywa się tylko wtedy, gdy biją to, co już leży odkryte. Kto może zrzucić, zostawia karty zakryte i dostaje przycisk Show, aby mimo to je pokazać.'] },
        { id: 'hands', t: 'Ranking rąk',
          b: ['Od najsłabszej do najsilniejszej:'],
          list: [
            '1. High Card — brak układu; decyduje najwyższa karta.',
            '2. Pair — dwie karty tej samej wysokości.',
            '3. Two Pair — dwie różne pary.',
            '4. Three of a Kind — trzy karty tej samej wysokości.',
            '5. Straight — pięć kolejnych kart (As liczy się jako wysoki lub niski).',
            '6. Flush — pięć kart w jednym kolorze.',
            '7. Full House — trójka plus para.',
            '8. Four of a Kind — cztery karty tej samej wysokości.',
            '9. Straight Flush — strit, w całości w jednym kolorze.',
            '10. Royal Flush — od Dziesiątki do Asa, w jednym kolorze. Najlepsza możliwa ręka.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Ekran gry',
      sections: [
        { id: 'actionbar', t: 'Pasek akcji',
          b: ['Gdy nadchodzi twoja kolej, pasek akcji na dole rozświetla się z maksymalnie czterema przyciskami: Fold (czerwony), Check / Call (niebieski), Bet / Raise (zielony — akcja główna, wyróżniona) i All-In (ciemnoczerwony). Przycisk Check / Call pokazuje dokładną kwotę do wyrównania; Bet / Raise pokazuje kwotę, którą zaraz postawisz. Po riverze All-In może stać się przyciskiem Show do pokazania kart.'] },
        { id: 'betctl', t: 'Wybór stawki',
          b: ['Ustaw kwotę przebicia polem liczbowym, suwakiem lub szybkimi przyciskami 1/3 \u00b7 1/2 \u00b7 Pot (ułamki bieżącej puli). Kwoty są automatycznie zaokrąglane i utrzymywane między minimalnym a maksymalnym dozwolonym przebiciem. Jeśli wolisz myśleć w dużych blindach, opcja pokazuje wszystkie kwoty w BB zamiast w żetonach.'] },
        { id: 'preselect', t: 'Wstępny wybór akcji',
          b: ['Przed swoją kolejką możesz uzbroić akcję z wyprzedzeniem: dotknij przycisku, a dostanie złotą ramkę z małą złotą kropką. Gdy przyjdzie twoja kolej, akcja wykona się natychmiast. Uzbrojony Fold automatycznie zamienia się w Check, gdy check jest darmowy — nigdy nie pasujesz za darmo. Wstępne wybory zerują się przy każdej nowej ręce, zmianie ulicy i showdownie, a są anulowane, gdy sytuacja się zmienia (na przykład gdy zmienia się kwota do wyrównania).'] },
        { id: 'automodes', t: 'Tryby automatyczne',
          b: ['Lista rozwijana obok przycisków akcji oferuje trzy tryby gry: Ręczny, Auto Check/Call i Auto Check/Fold. Tryby automatyczne grają za ciebie, dopóki nie wrócisz — każde ręczne kliknięcie akcji natychmiast przywraca tryb Ręczny.'] },
        { id: 'readtable', t: 'Czytanie stołu',
          b: ['Każde pole gracza pokazuje awatar, nazwę, stack i bieżącą stawkę. Rozdający i blindy oznaczone są żetonami D / SB / BB. Kolorowa plakietka na polu wskazuje ostatnią akcję gracza; cienki niebieski pasek odlicza jego czas do namysłu. Pole gracza przy głosie się podświetla; twoje własne pole dostaje pulsującą złotą ramkę w twojej kolejce.',
              'Pasek stanu nad stołem pokazuje łączną pulę, stawki bieżącej ulicy, fazę (Pre-flop, Flop, Turn, River) oraz numery gry i ręki. Gracze, którzy spasowali, mają półprzezroczyste karty; wyeliminowani są przyciemnieni. Na koniec ręki okno zwycięzcy może podsumować, kto co wygrał — wyłącza się je w opcjach.'] },
        { id: 'seatlayout', t: 'Rozmieszczenie miejsc',
          b: ['Jako rozszerzenie webowe układ pól graczy wybiera się w Opcje zaawansowane \u2192 Miejsca: Automatyczny podąża za oficjalnym klientem (stałe sloty w pionie, wyliczana elipsa w poziomie), można też wymusić układ Pionowy lub Poziomy — a Własny pozwala rozmieścić każde miejsce samodzielnie: pojawia się tryb edycji, w którym przeciągasz każde pole dokładnie tam, gdzie chcesz, a układ jest zapisywany.'] },
        { id: 'zoom', t: 'Zoom stołu (telefony)',
          b: ['Na małych ekranach przyciski lupy powiększają stół (2\u00d7), a przesuwasz go palcem — twoje pole i pasek akcji pozostają nieruchome. Widok automatycznie podąża za aktywnym miejscem i oddala się przy showdownie dla pełnego obrazu. Wyłączalne w Opcjach zaawansowanych.'],
          note: 'Na telefonach i tabletach szczypanie przeglądarki jest domyślnie zablokowane, żeby gest zoomu nigdy nie odpalił się przypadkiem w środku ręki; włącz je z powrotem w Opcje zaawansowane \u2192 Interfejs użytkownika, jeśli wolisz.' },
        { id: 'protections', t: 'Ochrona przed podglądaniem i przypadkowym Call',
          b: ['Dwie opcjonalne ochrony: tryb antypodglądowy trzyma twoje karty zakryte, dopóki ich nie dotkniesz (przydatne, gdy ktoś widzi twój ekran), a ochrona przed przypadkowym Call na chwilę blokuje przycisk Call tuż po dużym przebiciu, żeby dotknięcie przeznaczone dla mniejszego Call nie trafiło przypadkiem w przebita kwotę. Obie są w Opcjach zaawansowanych.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Panel informacyjny',
      sections: [
        { id: 'open', t: 'Otwieranie panelu',
          b: ['Podczas gry panel informacyjny otwiera się z nagłówka (lub Alt+L / Alt+I) i ma trzy zakładki: Dziennik, Szanse i Statystyki. Na telefonie unosi się nad stołem; na większych ekranach to przesuwalne i skalowalne okno — złap uchwyt \u28ff, aby je przesunąć, krawędzie, aby zmienić rozmiar. Jego pozycja jest zapamiętywana.'] },
        { id: 'log', t: 'Dziennik gry',
          b: ['Zakładka Dziennik zapisuje całą grę ręka po ręce: blindy, każdą akcję z kwotami, odkryte karty i zwycięzców, wszystko w kolorach dla szybkiego czytania. Przycisk eksportu zapisuje dziennik do pliku, jeśli chcesz później przejrzeć sesję.'] },
        { id: 'odds', t: 'Szanse (monitor prawdopodobieństwa)',
          b: ['Zakładka Szanse pokazuje dla twojej bieżącej ręki prawdopodobieństwo na żywo zakończenia każdą z 10 kategorii rąk — od High Card do Royal Flush — każda z ikoną, procentem i paskiem. Wyświetlanie szarzeje, gdy tylko spasujesz. Używa wyłącznie twoich kart i kart wspólnych: nie widzi niczego, czego nie pokazują przeciwnicy.'] },
        { id: 'journal', t: 'Dzienniki rąk i okno \u201eLogi\u201d',
          b: ['Poza dziennikiem na żywo każda rozegrana ręka jest zapisywana lokalnie w przeglądarce, w tym samym formacie co pliki dziennika .pdb oficjalnego klienta. Okno Logi (Opcje zaawansowane \u2192 Komunikaty dziennika \u2192 Zarządzaj logami\u2026) wyświetla twoje sesje i pozwala z nimi pracować: podejrzeć sesję z wyszukiwaniem i podświetlaniem, filtrować po grze, eksportować do HTML lub zwykłego tekstu, zapisać surowy plik .pdb albo zaimportować .pdb nagrany przez klienta desktopowego. Sesje usuwa się pojedynczo lub wszystkie naraz (z potwierdzeniem), a automatyczna retencja może zachowywać tylko ostatnie 7, 30, 90, 180 lub 365 dni. Dzienniki zaimportowane przez Ciebie nigdy nie są usuwane automatycznie. Drugie ustawienie ogranicza liczbę zachowywanych sesji, a kolumnę z listą można poszerzyć przeciągnięciem.',
              'Przycisk Analizuj uruchamia analizę rąk na sesji i może wysłać dziennik do serwisu analiz pokerth.net. Wszystko zostaje na twoim urządzeniu, dopóki jawnie nie wyeksportujesz lub nie wyślesz.'] },
        { id: 'logopts', t: 'Opcje dziennika',
          b: ['W Opcjach zaawansowanych \u2192 Komunikaty dziennika możesz włączyć lub wyłączyć rejestrowanie i wybrać częstotliwość zapisu, z tymi samymi trzema ustawieniami co klient desktopowy: po każdej akcji, po każdym rozdaniu (domyślnie) lub po każdej grze. Inna opcja zapisuje plik .pdb do wybranego folderu i utrzymuje go w tym rytmie, a także jeszcze raz przy opuszczaniu strony, dzięki czemu inne narzędzie może śledzić grę na żywo.'],
          note: 'Zapis do lokalnego folderu wymaga API File System Access: tylko Chrome, Edge i Opera na komputerze. Gdzie indziej opcja sama się tłumaczy, a ręczny eksport z okna dzienników pozostaje dostępny. Przeglądarka może plik jedynie zastąpić, nigdy dopisać, więc narzędzie czytające .pdb powinno otwierać go ponownie po każdej zmianie.' },
        { id: 'assist', t: 'Asysta (siła ręki)',
          b: ['Na górze zakładki Szanse baner asysty czyta twoją rękę za ciebie. Przed flopem nazywa twoją rękę startową i ocenia ją gwiazdkami; od flopu pokazuje twoją bieżącą najlepszą kombinację i, po szybkiej symulacji, szacowaną szansę wygrania ręki w procentach, ze wskaźnikiem koloru od czerwieni (słabo) po zieleń (mocno). Jak monitor prawdopodobieństwa, korzysta tylko z informacji, które możesz zobaczyć.',
              'Dwa style wyświetlania są dostępne w Opcje zaawansowane \u2192 Miejsca: Segmenty (dziesięć bloków) albo klasyczny pasek postępu. Całą funkcję asysty wyłącza się w Opcje zaawansowane \u2192 Asysta.'] },
        { id: 'assistwin', t: 'Asysta jako pływający widżet',
          b: ['Blok asysty można oderwać od panelu do własnego małego okna zawsze na wierzchu: użyj przycisku odrywania na bloku, potem przesuwaj i skaluj je gdziekolwiek nad stołem — wygodne, by mieć siłę ręki na oku bez otwartego całego panelu. Przycisk dokowania przywraca go do zakładki Szanse, a pozycja jest zapamiętywana. W panelu uchwyt przeciągania między Asystą a szansami pozwala podzielić miejsce między nimi.'] },
        { id: 'stats', t: 'Statystyki',
          b: ['Zakładka Statystyki śledzi twoją sesję: rozegrane ręce, obejrzane flopy, showdowny, wskaźniki wygranych i więcej. Śledzenie statystyk wyłącza się w Opcjach zaawansowanych.'] },
        { id: 'hud', t: 'HUD statystyk przy miejscach (beta)',
          b: ['HUD dołącza małe okienko ze statystykami obok miejsca każdego gracza, zbudowane z rozdań zapisanych w twoich dziennikach: liczba obserwowanych rozdań, następnie VPIP (jak często dobrowolnie wkłada pieniądze pre-flop), PFR (podbicia pre-flop) i AF (współczynnik agresji), z kodem kolorystycznym od pasywnego do agresywnego. Poniżej odznaka podsumowuje gracza słowami \u2014 Ciasny-Pasywny, Luźny-Agresywny i tak dalej \u2014 obok małej tarczy, której podświetlona ćwiartka czyta się od lewej do prawej od ciasnego do luźnego, a od dołu do góry od pasywnego do agresywnego. Odznaka pojawia się od pierwszego rozdania, ale pozostaje przygaszona do 25 rozdań, od których staje się wiarygodna. Dotknij okienka, aby otworzyć szczegółowe okno ze wszystkimi liczbami (3-bet, continuation bet, fold na 3-bet, próby kradzieży, wskaźniki showdownu\u2026), i przeciągnij je, jeśli coś zasłania.',
              'HUD zna tylko to, co widziałeś przy własnych stołach — czyta twoje lokalne dzienniki rąk, więc zapisywanie musi być włączone, a liczby nabierają sensu po wystarczającej liczbie rąk. To funkcja beta, domyślnie wyłączona: włącz ją w Opcje zaawansowane \u2192 Asysta.'] },
        { id: 'handsbtn', t: 'Przegląd układów',
          b: ['Ikona rąk pokerowych na suknie otwiera w każdej chwili szybki przegląd 10 układów — przydatne podczas nauki. Ukrywa się ją w Opcjach zaawansowanych.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Czat i społeczność',
      sections: [
        { id: 'panels', t: 'Czat lobby i czat stołu',
          b: ['Jest czat w lobby i czat przy stole. Na telefonie czat stołu unosi się nad grą; na większych ekranach to przesuwalne i skalowalne okno. Plakietka na przycisku czatu liczy nieprzeczytane wiadomości.'] },
        { id: 'typing', t: 'Pomoce przy pisaniu',
          list: [
            'Tab uzupełnia pseudonim — naciśnij Tab ponownie, by przełączać dopasowania.',
            '\u2191 / \u2193 przeglądają historię twoich wiadomości.',
            'Przycisk emoji otwiera pełny wybór; wpisanie : podpowiada też emotki w trakcie pisania.'] },
        { id: 'emotes', t: 'Emotki i uśmieszki',
          b: ['Czat konwertuje kody emotek dokładnie tak jak oficjalny klient desktopowy: wpisz nazwę między dwukropkami, a stanie się emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 obsługiwanych jest ponad 1 900 kodów (pełny zestaw GitHuba). Klasyczne tekstowe uśmieszki też są konwertowane: :-) ;) :D xD :P <3 i około osiemdziesięciu innych.',
              'Wpisanie : otwiera okienko podpowiedzi, które uzupełnia kod w trakcie pisania (\u2191/\u2193 do wyboru, Tab lub Enter do zatwierdzenia). Konwersję emoji można całkiem wyłączyć w Opcje zaawansowane \u2192 Czat.'] },
        { id: 'commands', t: 'Polecenia czatu',
          b: ['Czat rozumie polecenia z ukośnikiem. Dwa są widoczne dla innych:'],
          keys: [
            ['/me <tekst>', 'Wiadomość akcji, wyświetlana jako \u201e* twójnick tekst\u201d'],
            ['/emoji <emoji>', 'Odtwarza reakcję emoji (to, co wysyła wybór reakcji)']] },
        { id: 'diagcmds', t: 'Polecenia diagnostyczne',
          b: ['Cała reszta jest lokalna: odpowiedzi widzisz tylko ty i nic nie trafia do stołu. Wpisz /help, aby wypisać wszystkie. Najprzydatniejsze:'],
          keys: [
            ['/help', 'Wypisz wszystkie polecenia'],
            ['/update', 'Sprawdź nową wersję i odśwież'],
            ['/lang <kod>', 'Zmień język (np. /lang pl)'],
            ['/sound on|off', 'Włącz/wycisz dźwięki gry'],
            ['/zoom', 'Przełącz lupę stołu'],
            ['/clear', 'Wyczyść czat lokalnie'],
            ['/table', 'Informacje o bieżącej grze (blindy, gracze, stacki)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostyka stanu klienta, sieci i płynności'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Zaawansowane debugowanie (karty, protokół, audio, pamięć, miejsca)'],
            ['/copy', 'Skopiuj ostatnią odpowiedź polecenia do schowka']] },
        { id: 'reactions', t: 'Reakcje emoji',
          b: ['Przycisk reakcji otwiera wybór 30 animowanych reakcji (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026), które odtwarzają się z efektem nad twoim miejscem, widoczne dla całego stołu — także dla graczy na kliencie desktopowym. Reakcje wyłącza się całkiem w Opcjach zaawansowanych.'] },
        { id: 'translate', t: 'Rozumieć wszystkich',
          b: ['Przy w\u0142\u0105czonym t\u0142umaczeniu czatu przycisk t\u0142umaczenia pojawia si\u0119 w wierszu pod wska\u017anikiem \u2014 lub w wierszu, kt\u00f3ry dotkniesz na ekranie dotykowym \u2014 i pokazuje wiadomo\u015b\u0107 w twoim j\u0119zyku przy u\u017cyciu t\u0142umacza przegl\u0105darki. Mo\u017cna go pokazywa\u0107 stale we wszystkich wierszach w Opcje zaawansowane \u2192 Czat, gdzie znajduje si\u0119 te\u017c podpowied\u017a obja\u015bniaj\u0105ca skr\u00f3ty przy stole (gg, nh, utg\u2026).'],
          note: 'Tłumaczenie korzysta z usługi Google Translate i działa w każdej przeglądarce — potrzebne jest tylko połączenie z internetem. Wiadomość trafia do usługi tłumaczenia tylko wtedy, gdy dotkniesz jej przycisku tłumaczenia, nigdy automatycznie.' },
        { id: 'social', t: 'Gracze: profil, zapraszanie, ignorowanie',
          b: ['Dotknij dowolnego gracza — przy stole lub na liście lobby — aby otworzyć jego kartę: profil i statystyki, zaproszenie do twojej gry albo ignorowanie (jego wiadomości na czacie są ukrywane; ignorowanie jest odwracalne w każdej chwili). Potwierdzenie przed zaproszeniem/ignorowaniem można włączyć w opcjach.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby i gry',
      sections: [
        { id: 'list', t: 'Lista gier',
          b: ['Lobby wyświetla wszystkie stoły serwera. Każdy wpis pokazuje liczbę graczy, typ gry, kłódkę, gdy wymagane jest hasło lub zaproszenie, oraz plakietkę stanu: \u201eOczekuje\u201d (zielona — gra się nie zaczęła, możesz dołączyć, jeśli jest wolne miejsce), \u201eW toku\u201d (ciepły kolor — do oglądania na żywo, gdy widzowie są dozwoleni) i \u201eZamknięta\u201d (przyciemniona). Pełny stół poznasz po prostu po pełnym liczniku, np. 10/10; kolory plakietek podążają za aktywnym motywem.',
              'Rozwijany filtr zawęża listę dokładnie tak jak klient desktopowy, każdy wybór surowszy od poprzedniego: tylko gry otwarte \u2192 ukrywając też pełne stoły \u2192 potem tylko nieprywatne, tylko prywatne albo tylko gry rankingowe. Twój wybór jest zapamiętywany. Pole wyszukiwania znajduje grę po nazwie, a plakietka graczy otwiera listę wszystkich online, przeszukiwalną i sortowalną.'] },
        { id: 'join', t: 'Dołączanie i oglądanie',
          b: ['Wybierz otwartą grę i dołącz — kłódka oznacza, że potrzebne jest hasło. Gry w toku, które dopuszczają widzów, można oglądać na żywo: widzisz stół i czat, ale zakryte karty pozostają ukryte i nie możesz działać.'] },
        { id: 'gameinfo', t: 'Informacje o grze',
          b: ['Przed dołączeniem karta informacji o grze pokazuje wszystko, co definiuje stół: typ gry, blindy i ich progresję (podwajanie lub lista ręczna), stack startowy, czas na akcję, przerwę między rękami oraz kto już siedzi.'] },
        { id: 'create', t: 'Tworzenie gry',
          b: ['Stwórz własny stół: nazwa, liczba graczy, stack startowy, pierwsza mała w ciemno i progresja podbić, czas na akcję oraz czy widzowie są dozwoleni. Istnieją cztery typy gier: Normalna (wszyscy), tylko zarejestrowani gracze, tylko na zaproszenie i Rankingowa (liczy się do oficjalnego rankingu — wtedy hasło jest niemożliwe). Ulubione ustawienia można zapisać i wczytać ponownie.'] },
        { id: 'invites', t: 'Zaproszenia',
          b: ['Gracze mogą cię zaprosić do swojego stołu; dostajesz powiadomienie, które możesz przyjąć lub odrzucić. Zaproszenie to jedyny sposób wejścia do gry tylko na zaproszenie.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Twoje konto',
          b: ['Oficjalny serwer internetowy to pokerth.net. Gra na nim wymaga darmowego konta pokerth.net — zarejestruj się na stronie, a potem zaloguj się tutaj tym samym pseudonimem i hasłem. Ten klient webowy łączy się z dokładnie tym samym serwerem co klient desktopowy: te same konta, te same stoły, te same rankingi, i możesz siedzieć przy stole z graczami klienta desktopowego.'] },
        { id: 'ranked', t: 'Gry rankingowe i sezony',
          b: ['Gry typu Rankingowa liczą się do oficjalnego rankingu sezonu. Twój profil w aplikacji pokazuje datę rejestracji, Rangę bieżącego sezonu, Wynik, średnią i rozegrane gry oraz ostatnie rezultaty. Zwykłe (nierankingowe) gry są tylko dla zabawy i niczego nie zmieniają.'] },
        { id: 'rankhow', t: 'Jak liczony jest ranking',
          b: ['W każdej grze rankingowej twoje miejsce daje punkty: 15 za pierwsze, potem 9, 6, 4, 3, 2 i 1 aż do siódmego; od ósmego do dziesiątego nic. Stół rozdaje więc łącznie 40 punktów.',
              'Twój Score to nie suma tych punktów, tylko twoja średnia na grę, przytłumiona współczynnikiem rosnącym wraz z liczbą rozegranych gier: kilka dobrych wyników nie wystarczy, by utrzymać się na szczycie, potrzeba też regularności — im więcej grasz, tym bliżej twój Score jest twojej prawdziwej średniej. Sezon trwa kwartał: przy zmianie wszystko trafia do archiwum, a liczniki ruszają od zera, przy czym minione sezony pozostają dostępne. W grze przycisk podium pokazuje ranking sezonu graczy przy twoim stole.'],
          note: 'Punktację i dokładny wzór ustala serwer rankingowy pokerth.net i mogą się one zmieniać; rozstrzygające są strony serwisu.' },
        { id: 'rankings', t: 'Strony rankingów',
          b: ['Wpis rankingu otwiera oficjalny ranking PokerTH, przeszukiwalny po graczach, oraz rankingi społeczności (BBC, WEC). Jeśli rankingi cię nie interesują, wpis ukrywa się w Opcje zaawansowane \u2192 Społeczność.'] },
        { id: 'cups', t: 'Puchary społeczności: BBC i WeCup',
          b: ['Dwie społeczności prowadzą na pokerth.net własne rozgrywki, każda z własną stroną i własnym rankingiem. Best Brainies Cup (BBC) to turniej etapowy powstały w 2013 roku: przechodzi się od Step 1 do Step 4, a nowy sezon zaczyna się po każdej grze Step 4, gdy puchar zostaje wręczony. WeCup (WEC) ma własną punktację, znacznie szerszą — 75 punktów za pierwsze miejsce, potem 45, 30, 20… — a jego score normalizuje twoją średnią względem liczby gier, które rozegrałeś w porównaniu z innymi członkami.',
              'Oba rankingi otwierasz przyciskiem pucharu, obok rankingu PokerTH. Ustawienia stołów tych rozgrywek są dostępne jako gotowe zestawy przy tworzeniu gry (BBC Step 1 do 4, WEC, WEC Monthly Final i WEC Grand Final), więc możesz trenować w tych samych warunkach. Udział wymaga rejestracji na stronie danego pucharu.'],
          note: 'Te treści ukryjesz za jednym razem w Opcjach zaawansowanych → Społeczność, jeśli puchary cię nie interesują.' },
        { id: 'forumcups', t: 'Puchary forum i wydarzenia',
          b: ['Forum pokerth.net gości także Monthly Cup, comiesięczną serię, w której gracze rozdzielani są na stoły Gold, Silver i Bronze, zanim wyłoniony zostanie mistrz miesiąca, a do tego pojedyncze puchary specjalne w ciągu roku.',
              'Zapisy, terminy, ustawienia stołów i wyniki publikowane są na forum, a gry toczą się na oficjalnym serwerze jak wszystkie inne. Do śledzenia wyników wystarczy konto pokerth.net; zapis na puchar odbywa się w odpowiednim wątku forum.'] },
        { id: 'avatars', t: 'Awatary i flagi',
          b: ['Na pokerth.net twój awatar jest rozprowadzany do innych graczy przez serwer awatarów, a mała flaga kraju może pojawiać się na polach graczy. Oba elementy są opcjonalne i konfigurowalne w opcjach.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Tryb treningowy',
      sections: [
        { id: 'what', t: 'Czym jest',
          b: ['Tryb Lokalny / treningowy to pełna gra przeciwko przeciwnikom sterowanym przez komputer: bez połączenia, bez konta, bez stawki. Po zainstalowaniu aplikacji (lub choćby jednorazowym odwiedzeniu) działa całkowicie offline — idealny do nauki gry, testowania interfejsu albo zabicia czasu w trybie samolotowym.'] },
        { id: 'setup', t: 'Ustawianie gry',
          b: ['Wybierz liczbę przeciwników, stack startowy, blindy i ich progresję oraz tempo gry. Skład i trudność botów ustawia się w Opcje zaawansowane \u2192 Gra lokalna — od łagodnych rywali po twardszy, zróżnicowany stół.'] },
        { id: 'trophies', t: 'Trofea',
          b: ['Tryb treningowy ma własny postęp: 28 trofeów w sześciu kategoriach (postęp, technika, styl, formaty, zabawa i jedna sekretna) odblokowuje się grając — rozegrane ręce, wygrane partie, wielkie blefy, wyjątkowe ręce i więcej. Postęp trofeów jest kumulacyjny i scala się między urządzeniami, gdy synchronizacja ustawień konta jest aktywna.'] },
        { id: 'learn', t: 'Dobre miejsce do nauki',
          b: ['Wszystko opisane w pozostałych rozdziałach działa też tutaj: monitor prawdopodobieństwa, wyświetlacz asysty, wstępny wybór, skróty klawiszowe. Tryb treningowy to najlepsze miejsce, by wypróbować je bez presji, zanim ruszysz na pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Styl i dźwięk',
      sections: [
        { id: 'themes', t: 'Motywy',
          b: ['Kategoria Styl w Opcjach zaawansowanych przebiera całego klienta. Presety ustawiają wszystko jednym dotknięciem (klasyczne zielone kasyno, oficjalny wygląd PokerTH\u2026); poniżej osobne osie dostrajają oddzielnie paletę kolorów, sukno stołu i awersy kart — zmień dowolną oś, a twoja mieszanka staje się własnym motywem. Tryb ciemny, jasny lub automatyczny wybiera się w Interfejsie użytkownika, a wybory działają natychmiast, na każdym ekranie, i są zapamiętywane.'] },
        { id: 'tablelook', t: 'Stoły, talie, miejsca',
          b: ['Poza motywem kilka elementów wymienia się niezależnie: tło stołu, talię kart, rewers kart (dopasowany do talii automatycznie albo zaimportuj własny obraz), żetony rozdającego i blindów, styl przycisków akcji oraz kompletne pakiety miejsc, które przebierają pola graczy. Wszystko wybierasz w Opcje zaawansowane \u2192 Styl; zmiany widać natychmiast przy stole.'] },
        { id: 'music', t: 'Odtwarzacz muzyki',
          b: ['Wpis muzyki w menu nagłówka otwiera mały odtwarzacz muzyki tła: wybierz utwór z playlisty, odtwarzaj/pauzuj, poprzedni/następny, losowo, oraz powtarzanie jednego utworu, całej playlisty albo niczego. Głośność, wybrany utwór i tryb powtarzania są zapamiętywane. Odtwarzanie nigdy nie startuje samo — przeglądarki wymagają dotknięcia — a odtwarzacz jest całkowicie niezależny od efektów dźwiękowych gry.'] },
        { id: 'sounds', t: 'Efekty dźwiękowe',
          b: ['Dźwięki gry są pogrupowane w cztery osobno przełączane kategorie, dokładnie jak w kliencie desktopowym: akcje gry (rozdane karty, Check, Call, Raise, twoja kolej\u2026), powiadomienie czatu lobby, powiadomienia gry sieciowej (gracz dołączył, gra gotowa) i powiadomienie o podniesieniu blindów. Jeden suwak głośności steruje wszystkimi, w Opcje zaawansowane \u2192 Dźwięk.'],
          note: 'Wszystkie przeglądarki — zwłaszcza iOS — odmawiają odtwarzania dźwięku, zanim raz dotkniesz strony. Jeśli gra startuje w ciszy, jedno dotknięcie gdziekolwiek budzi dźwięk; klient automatycznie naprawia też silnik audio, gdy iOS go zawiesi (połączenie przychodzące, tło\u2026).' },
        { id: 'voice', t: 'Głos i wibracje',
          b: ['Dwa dodatkowe kanały mogą informować cię bez patrzenia na ekran: zapowiedzi głosowe czytają na głos wydarzenia gry przez syntezę mowy urządzenia, a na telefonie krótka wibracja może oznaczać twoją kolej. Oba to rozszerzenia webowe, domyślnie włączone lub nie zależnie od urządzenia, w Opcje zaawansowane \u2192 Stawki i kolejka.'],
          note: 'Wibracje działają na Androidzie (przeglądarki Chromium); Apple nie udostępnia stronom API wibracji, więc iPhone\u2019y nie mogą wibrować. Zapowiedzi głosowe działają wszędzie, ale dostępne głosy i języki zależą od systemu — klient używa najlepszego dopasowania, jakie znajdzie.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opcje i skróty',
      sections: [
        { id: 'where', t: 'Gdzie mieszkają opcje',
          b: ['Opcje zaawansowane otwiera się wpisem z zębatką w dowolnym menu nagłówka. Są pogrupowane jak w kliencie desktopowym: Interfejs użytkownika, Styl, Dźwięk, Gra lokalna, Gra sieciowa, Gra internetowa, Pseudonimy / Awatary, Komunikaty dziennika oraz Przywróć domyślne. Każda funkcja specyficzna dla wersji webowej ma tam własny przełącznik, więc możesz wyłączyć wszystko, czego nie używasz.'] },
        { id: 'cfgxml', t: 'Wymiana ustawień z klientem desktopowym',
          b: ['Twoje ustawienia mogą podróżować między klientami: kategoria Komunikaty dziennika oferuje eksport/import oficjalnego pliku config.xml (tego \u007e/.pokerth/config.xml używanego przez klientów desktopowego i QML). Eksport zapisuje wspólne ustawienia — nazwę, opcje wyświetlania, dźwięki, preferencje stołu, blindy, style — a import stosuje tutaj plik z desktopu. Ustawienia, których ten klient nie zna, pozostają w pliku nietknięte.'] },
        { id: 'sync', t: 'Ustawienia, które za tobą podążają',
          b: ['Gdy grasz z kontem, twoje opcje, motyw, przypisania klawiszy, język i trofea treningowe są synchronizowane: zmień coś na jednym urządzeniu, a następne urządzenie, z którego się zalogujesz, to przejmie. Postęp trofeów jest scalany, nigdy nadpisywany, więc gra na dwóch urządzeniach zawsze zachowuje to, co najlepsze z obu.'] },
        { id: 'updates', t: 'Bycie na bieżąco',
          b: ['Klient aktualizuje się sam: gdy pojawia się nowa wersja, baner zaprasza do odświeżenia (albo wpisz /update na czacie, by sprawdzić ręcznie). Od czasu do czasu może pojawić się mała ankieta produktowa z pytaniem o opinię o funkcji — udział jest dobrowolny, a ankiety wyłącza się całkiem w Opcje zaawansowane \u2192 Społeczność.'] },
        { id: 'fkeys', t: 'Oficjalne skróty klawiszowe',
          b: ['Oficjalne klawisze funkcyjne PokerTH dzia\u0142aj\u0105 podczas gry \u2014 Alt+S dzia\u0142a wsz\u0119dzie:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (kolejność odwracalna w opcjach)'],
            ['F5', 'Pokaż swoje karty (gdy to możliwe)'],
            ['F6 / F7 / F8', 'Ręczny \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Ręczny \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Czat \u00b7 Dziennik \u00b7 Panel szans'],
            ['Alt+S', 'Ustawienia \u2014 wsz\u0119dzie w aplikacji, nie tylko w grze'],
            ['F11', 'Pełny ekran']],
          note: 'Skróty wymagają fizycznej klawiatury. Na Macu klawisze F domyślnie sterują multimediami: przytrzymaj Fn (albo włącz \u201eUżywaj klawiszy F1, F2 itd. jako standardowych klawiszy funkcyjnych\u201d w ustawieniach macOS). Na iPhonie pełny ekran jest ograniczony przez iOS — instalacja aplikacji jako PWA daje to samo pełnoekranowe doświadczenie.' },
        { id: 'webkeys', t: 'Webowe klawisze literowe',
          b: ['Rozszerzenie webowe: klawisze jednoliterowe oraz Alt+T r\u00f3wnie\u017c wyzwalaj\u0105 akcje i wszystkie mo\u017cna prze\u0142\u0105czy\u0107 w Opcje zaawansowane \u2192 Skr\u00f3ty klawiszowe:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Panel statystyk'],
            ['Esc', 'Zamknij wierzchnie okno (także przycisk Wstecz Androida)']],
          note: 'Na Androidzie systemowy przycisk/gest Wstecz zamyka okna jak Esc, zamiast opuszczać grę (konfigurowalne w opcjach). iOS nie ma odpowiednika — użyj \u2715 każdego okna.' }
      ]
    }
  ]
};
