// ── help/content/de.mjs — Deutsches Hilfe-Korpus (Los 1) ────────────────────
// Übersetzung von en.mjs (Referenz). Struktur und ids identisch; nur
// t / b / list / keys (Beschriftungen) / note sind übersetzt. Pokerbegriffe
// (Fold, Check, Call, Bet, Raise, All-In, Flop, Turn, River …) bleiben
// englisch, gemäß der Konvention der Anwendung.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Erste Schritte',
      sections: [
        { id: 'modes', t: 'Drei Arten zu spielen',
          b: ['Wähle auf dem Anmeldebildschirm, wie du spielen möchtest.'],
          list: [
            'Internet — spiele online auf dem offiziellen pokerth.net-Server, mit Ranglisten. Ein pokerth.net-Konto ist erforderlich; die Registrierung auf pokerth.net ist kostenlos.',
            'Lokal / Training — spiele offline gegen Bots. Nichts einzurichten, funktioniert ohne Verbindung und schaltet mit deinem Fortschritt Trophäen frei.',
            'LAN / Dedizierter Server — verbinde dich mit einem privaten PokerTH-Server in deinem lokalen Netzwerk oder auf deinem eigenen Rechner.'] },
        { id: 'lan', t: 'LAN / Dedizierter Server',
          b: ['Der dritte Modus verbindet sich mit jedem PokerTH-Server, den du oder ein Freund betreibt — im Heimnetz, auf einem privaten VPS, wo auch immer. Gib Adresse und Port des Servers ein, hake TLS an, wenn der Server einen verschlüsselten Port nutzt, und melde dich mit einem Spitznamen an (Gastzugang funktioniert, wenn der Server ihn erlaubt). Am Tisch verhält sich dann alles genau wie auf dem offiziellen Server.'] },
        { id: 'famboard', t: 'Familien-Rangliste',
          b: ['Nur auf privaten Servern und in LAN-Spielen führt der Client Langzeitstatistiken pro Spitzname — gespielte und gewonnene Hände und Partien, größter Gewinn, beste Serie — und teilt sie über den Server, sodass jedes Gerät am Tisch dieselbe Rangliste sieht. pokerth.net-Spiele werden auf diese Weise nie erfasst, und die Statistiken des Trainingsmodus bleiben vollständig getrennt.'] },
        { id: 'language', t: 'Sprache',
          b: ['Die Oberfläche ist in 36 Sprachen verfügbar. Ändere sie jederzeit in den Erweiterten Optionen (Zahnrad-Menü) unter Benutzeroberfläche. Die Poker-Aktionsbegriffe (Fold, Check, Call, Bet, Raise, All-In) bleiben per Konvention englisch, genau wie im Desktop-Client.'] },
        { id: 'pwa', t: 'Als App installieren',
          b: ['Dieser Client ist eine Progressive Web App: Du kannst ihn über das Browser-Menü (oder den Installieren-Knopf im Header) installieren und bekommst eine Vollbild-App mit eigenem Symbol. Einmal installiert startet sie sofort, und der Trainingsmodus funktioniert vollständig offline.'],
          note: 'Auf Android und in Desktop-Chrome/Edge erledigt der Installieren-Knopf alles. Auf iPhone/iPad erlaubt Apple die Installation nur über Safari: Teilen-Knopf \u2192 \u201eZum Home-Bildschirm\u201c — der Client zeigt diese Schritte bei Bedarf an. Der Knopf verschwindet, sobald die App installiert ist.' },
        { id: 'platforms', t: 'Plattformen und Browser',
          b: ['Der Client läuft in jedem modernen Browser auf jedem System — Windows, macOS, Linux, Android, iOS. Einige Funktionen beruhen auf neueren Browser-APIs; fehlt eine API, blendet sich die Funktion aus oder erklärt sich, statt kaputtzugehen. Die wichtigsten Unterschiede:'],
          list: [
            'Chrome / Edge (Desktop): alles funktioniert, einschließlich des Schreibens des .pdb-Protokolls in einen Ordner.',
            'Firefox: alles außer dem Schreiben des .pdb in einen Ordner (API noch nicht verfügbar).',
            'Safari / iOS: Installation über Teilen \u2192 \u201eZum Home-Bildschirm\u201c; keine Vibration; Vollbild auf dem iPhone eingeschränkt; Ton startet nach deinem ersten Tippen.',
            'Android: volle Unterstützung in Chromium-Browsern, einschließlich Vibration und Zurück-Tasten-Verhalten.'] },
        { id: 'avatar', t: 'Spitzname und Avatar',
          b: ['Wähle Spitznamen und Avatar auf dem Anmeldebildschirm, bevor du dich verbindest. Auf pokerth.net ist dein Spitzname dein Kontoname; Avatare werden über den Avatar-Server mit anderen Spielern geteilt.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pokerregeln',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em in Kürze',
          b: ['PokerTH spielt No-Limit Texas Hold\u2019em. Jeder Spieler erhält zwei verdeckte Karten (die Hole Cards). Fünf Gemeinschaftskarten werden dann offen in die Tischmitte gelegt. Die beste Fünf-Karten-Hand aus einer beliebigen Kombination deiner zwei Karten und der fünf Gemeinschaftskarten gewinnt den Pot.'] },
        { id: 'blinds', t: 'Blinds und der Dealer-Button',
          b: ['Vor jeder Hand füllen zwei Pflichteinsätze den Pot: die Small Blind und die Big Blind, gesetzt von den beiden Spielern links vom Dealer-Button. Der Button wandert nach jeder Hand einen Platz im Uhrzeigersinn weiter, sodass alle reihum die Blinds zahlen. Die Blinds steigen im Spielverlauf in regelmäßigen Abständen.',
              'Auf dem Tisch sind Button und Blinds mit Chips markiert: D (Dealer), SB (Small Blind), BB (Big Blind).'] },
        { id: 'streets', t: 'Die vier Setzrunden',
          list: [
            'Pre-Flop — nach dem Austeilen der Hole Cards beginnt die erste Setzrunde links von der Big Blind.',
            'Flop — drei Gemeinschaftskarten werden aufgedeckt, gefolgt von einer Setzrunde.',
            'Turn — eine vierte Gemeinschaftskarte, dann eine weitere Setzrunde.',
            'River — die fünfte und letzte Gemeinschaftskarte, dann die letzte Setzrunde.'],
          b: ['Eine Setzrunde endet, wenn jeder noch beteiligte Spieler den gleichen Betrag in den Pot gelegt hat (oder All-in ist).'] },
        { id: 'actions', t: 'Was du an der Reihe tun kannst',
          list: [
            'Fold — die Hand aufgeben. Deine Karten werden abgelegt, du spielst nicht mehr um den Pot.',
            'Check — schieben, ohne zu setzen. Nur möglich, wenn nichts zu bezahlen ist.',
            'Call — den aktuellen Einsatz mitgehen.',
            'Bet — das Setzen eröffnen, wenn auf dieser Street noch niemand gesetzt hat.',
            'Raise — über einen bestehenden Einsatz erhöhen. Die Mindesterhöhung entspricht dem vorigen Einsatz oder der vorigen Erhöhung.',
            'All-In — den gesamten Stack setzen. Du bleibst bis zur Höhe deines gedeckten Betrags in der Hand.'] },
        { id: 'showdown', t: 'Showdown und geteilte Pots',
          b: ['Bleiben nach der River-Setzrunde mehrere Spieler übrig, werden die Hände aufgedeckt und die beste gewinnt — die Gewinnkombination wird unter den Gemeinschaftskarten angezeigt. Ist ein Spieler mit weniger als den vollen Einsätzen All-in, entstehen Side-Pots: Jeder Spieler kann nur den Teil des Pots gewinnen, zu dem er beigetragen hat. Gleichwertige Hände teilen sich den Pot.'] },
        { id: 'hands', t: 'Rangfolge der Hände',
          b: ['Von der schwächsten zur stärksten:'],
          list: [
            '1. High Card — keine Kombination; die höchste Karte entscheidet.',
            '2. Pair — zwei Karten gleichen Rangs.',
            '3. Two Pair — zwei verschiedene Paare.',
            '4. Three of a Kind — drei Karten gleichen Rangs.',
            '5. Straight — fünf Karten in Folge (das Ass zählt hoch oder niedrig).',
            '6. Flush — fünf Karten derselben Farbe.',
            '7. Full House — ein Drilling plus ein Paar.',
            '8. Four of a Kind — vier Karten gleichen Rangs.',
            '9. Straight Flush — eine Straße, komplett in einer Farbe.',
            '10. Royal Flush — Zehn bis Ass, in einer Farbe. Die bestmögliche Hand.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Der Spielbildschirm',
      sections: [
        { id: 'actionbar', t: 'Die Aktionsleiste',
          b: ['Wenn du an der Reihe bist, leuchtet die Aktionsleiste unten mit bis zu vier Schaltflächen auf: Fold (rot), Check / Call (blau), Bet / Raise (grün — die hervorgehobene Primäraktion) und All-In (dunkelrot). Die Check-/Call-Schaltfläche zeigt den genauen Betrag zum Mitgehen; Bet / Raise zeigt den Betrag, den du gleich setzt. Nach dem River kann All-In zu einer Show-Schaltfläche werden, um deine Karten zu zeigen.'] },
        { id: 'betctl', t: 'Deinen Einsatz wählen',
          b: ['Stelle den Erhöhungsbetrag über das Zahlenfeld, den Schieberegler oder die Schnelltasten 1/3 \u00b7 1/2 \u00b7 Pot (Anteile des aktuellen Pots) ein. Beträge werden automatisch gerundet und zwischen der minimal und maximal erlaubten Erhöhung gehalten. Wenn du lieber in Big Blinds denkst, zeigt eine Option alle Beträge in BB statt in Chips an.'] },
        { id: 'preselect', t: 'Eine Aktion vorwählen',
          b: ['Vor deinem Zug kannst du eine Aktion im Voraus scharfstellen: Tippe eine Schaltfläche an und sie erhält einen goldenen Rand mit einem kleinen goldenen Punkt. Wenn dein Zug kommt, wird die Aktion sofort ausgeführt. Ein vorgewähltes Fold wird automatisch zu einem Check, wenn Check gratis ist — du wirfst nie umsonst weg. Vorwahlen setzen sich bei jeder neuen Hand, jedem Street-Wechsel und jedem Showdown zurück und werden aufgehoben, wenn sich die Lage ändert (zum Beispiel wenn sich der Call-Betrag ändert).'] },
        { id: 'automodes', t: 'Auto-Modi',
          b: ['Das Auswahlmenü neben den Aktionsschaltflächen bietet drei Spielmodi: Manuell, Auto Check/Call und Auto Check/Fold. Die Auto-Modi spielen für dich, bis du zurückwechselst — jeder manuelle Klick auf eine Aktion kehrt sofort zu Manuell zurück.'] },
        { id: 'readtable', t: 'Den Tisch lesen',
          b: ['Jede Spielerbox zeigt Avatar, Name, Stack und aktuellen Einsatz. Dealer und Blinds sind mit D-/SB-/BB-Chips markiert. Ein farbiges Abzeichen auf der Box zeigt die letzte Aktion des Spielers; ein dünner blauer Balken zählt seine Bedenkzeit herunter. Die Box des Spielers am Zug leuchtet; deine eigene Box bekommt an deinem Zug einen pulsierenden goldenen Rahmen.',
              'Die Statusleiste über dem Tisch zeigt den Gesamtpot, die Einsätze der aktuellen Street, die Phase (Pre-Flop, Flop, Turn, River) sowie Spiel- und Handnummer. Ausgestiegene Spieler haben durchscheinende Karten; ausgeschiedene Spieler sind abgedunkelt. Am Ende einer Hand kann ein Gewinnerfenster zusammenfassen, wer was gewonnen hat — es lässt sich in den Optionen abschalten.'] },
        { id: 'seatlayout', t: 'Sitzplatzierung',
          b: ['Als Web-Erweiterung lässt sich die Anordnung der Spielerboxen in Erweiterte Optionen \u2192 Sitze wählen: Automatisch folgt dem offiziellen Client (feste Plätze im Hochformat, berechnete Ellipse im Querformat), oder erzwinge die Hochformat- bzw. Querformat-Anordnung — und Benutzerdefiniert lässt dich jeden Sitz selbst platzieren: Ein Bearbeitungsmodus erscheint, in dem du jede Box genau dorthin ziehst, wo du sie willst, und die Anordnung wird gespeichert.'] },
        { id: 'zoom', t: 'Tisch-Zoom (Telefone)',
          b: ['Auf kleinen Bildschirmen zoomen Lupen-Schaltflächen den Tisch (2\u00d7) und du kannst mit dem Finger schwenken — deine eigene Box und die Aktionsleiste bleiben fest. Die Ansicht folgt automatisch dem aktiven Sitz und zoomt beim Showdown für die Übersicht wieder heraus. Abschaltbar in den Erweiterten Optionen.'],
          note: 'Auf Telefonen und Tablets ist der Pinch-Zoom des Browsers selbst standardmäßig blockiert, damit eine Zoom-Geste nie versehentlich mitten in einer Hand auslöst; in Erweiterte Optionen \u2192 Benutzeroberfläche kannst du ihn wieder aktivieren.' },
        { id: 'protections', t: 'Anti-Spick- und Versehens-Call-Schutz',
          b: ['Zwei optionale Schutzfunktionen: Der Anti-Spick-Schutz hält deine eigenen Karten verdeckt, bis du sie antippst (nützlich, wenn jemand deinen Bildschirm sehen kann), und der Schutz vor versehentlichem Call blockiert die Call-Schaltfläche kurz nach einer großen Erhöhung, damit ein Tippen auf einen kleineren Call nicht versehentlich den erhöhten Betrag trifft. Beide finden sich in den Erweiterten Optionen.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Info-Panel',
      sections: [
        { id: 'open', t: 'Das Panel öffnen',
          b: ['Während eines Spiels öffnet sich das Info-Panel über den Header (oder Alt+L / Alt+I) und hat drei Reiter: Log, Chancen und Stats. Auf Telefonen schwebt es über dem Tisch; auf größeren Bildschirmen ist es ein verschieb- und größenveränderbares Fenster — greife den \u28ff-Griff zum Verschieben, die Ränder zum Vergrößern. Seine Position wird gemerkt.'] },
        { id: 'log', t: 'Spielprotokoll',
          b: ['Der Log-Reiter zeichnet das ganze Spiel Hand für Hand auf: Blinds, jede Aktion mit Beträgen, aufgedeckte Karten und Gewinner, farbcodiert zum schnellen Lesen. Die Export-Schaltfläche speichert das Protokoll als Datei, wenn du eine Sitzung später auswerten willst.'] },
        { id: 'odds', t: 'Chancen (Wahrscheinlichkeits-Monitor)',
          b: ['Der Chancen-Reiter zeigt für deine aktuelle Hand die Live-Wahrscheinlichkeit, mit jeder der 10 Handkategorien zu enden — von High Card bis Royal Flush — jeweils mit Symbol, Prozentwert und Balken. Die Anzeige wird ausgegraut, sobald du foldest. Sie nutzt ausschließlich deine eigenen Karten und die Gemeinschaftskarten: Sie sieht nichts, was deine Gegner nicht zeigen.'] },
        { id: 'journal', t: 'Hand-Protokolle und das Logs-Fenster',
          b: ['Über das Live-Log hinaus wird jede Hand, die du spielst, lokal im Browser aufgezeichnet, im selben Format wie die .pdb-Protokolldateien des offiziellen Clients. Das Logs-Fenster (Erweiterte Optionen \u2192 Log-Meldungen \u2192 Logs verwalten\u2026) listet deine Sitzungen und lässt dich damit arbeiten: eine Sitzung mit Suche und Hervorhebung ansehen, nach Spiel filtern, als HTML oder Klartext exportieren, die rohe .pdb-Datei speichern oder eine vom Desktop-Client aufgezeichnete .pdb importieren. Sitzungen lassen sich einzeln oder alle auf einmal löschen (mit Bestätigung), und eine automatische Aufbewahrung kann nur die letzten 7, 30, 90, 180 oder 365 Tage behalten. Selbst importierte Protokolle werden nie automatisch gelöscht. Eine zweite Einstellung begrenzt die Anzahl behaltener Sitzungen, und die Listenspalte lässt sich breiter ziehen.',
              'Die Analysieren-Schaltfläche führt eine Handanalyse über eine Sitzung aus und kann ein Protokoll an den Analysedienst von pokerth.net senden. Alles bleibt auf deinem Gerät, solange du nicht ausdrücklich exportierst oder hochlädst.'] },
        { id: 'logopts', t: 'Protokoll-Optionen',
          b: ['In Erweiterte Optionen \u2192 Log-Meldungen kannst du die Protokollierung ein- oder ausschalten und das Schreibintervall wählen (nach jeder Aktion oder einmal pro Hand), passend zu den Einstellungen des Desktop-Clients. Eine zusätzliche Option schreibt die .pdb-Datei direkt in einen Ordner deiner Wahl und aktualisiert sie nach jeder Hand — genau wie der Desktop-Client, damit andere Werkzeuge sie live lesen können.'],
          note: 'Das Schreiben in einen lokalen Ordner benötigt die File-System-Access-API: nur Desktop-Chrome und -Edge. Firefox, Safari und mobile Browser können es nicht — die Option zeigt dann eine kurze Erklärung, und der manuelle Export aus dem Logs-Fenster bleibt überall verfügbar.' },
        { id: 'assist', t: 'Assistenz (Handstärke)',
          b: ['Oben im Chancen-Reiter liest das Assistenz-Banner deine Hand für dich. Vor dem Flop benennt es deine Starthand und bewertet sie mit Sternen; ab dem Flop zeigt es deine aktuell beste Kombination und nach einer kurzen Simulation deine geschätzte Gewinnchance in Prozent, mit einer Farbskala von Rot (schwach) bis Grün (stark). Wie der Wahrscheinlichkeits-Monitor nutzt es nur Informationen, die du sehen kannst.',
              'Zwei Darstellungsstile stehen in Erweiterte Optionen \u2192 Sitze zur Wahl: Segmente (zehn Blöcke) oder ein klassischer Fortschrittsbalken. Die gesamte Assistenzfunktion lässt sich in Erweiterte Optionen \u2192 Assistenz abschalten.'] },
        { id: 'assistwin', t: 'Assistenz als schwebendes Widget',
          b: ['Der Assistenz-Block lässt sich aus dem Panel in ein eigenes kleines, immer im Vordergrund liegendes Fenster lösen: Nutze die Ablöse-Schaltfläche am Block, dann verschiebe und vergrößere es beliebig über dem Tisch — praktisch, um die Handstärke im Blick zu behalten, ohne das ganze Panel offen zu haben. Die Andock-Schaltfläche bringt ihn zurück in den Chancen-Reiter, und die Position wird gemerkt. Im Panel teilt ein Ziehgriff zwischen Assistenz und Chancen den Platz zwischen beiden auf.'] },
        { id: 'stats', t: 'Stats',
          b: ['Der Stats-Reiter verfolgt deine Sitzung: gespielte Hände, gesehene Flops, Showdowns, Gewinnraten und mehr. Die Statistikerfassung lässt sich in den Erweiterten Optionen abschalten.'] },
        { id: 'hud', t: 'Stats-HUD an den Sitzen (Beta)',
          b: ['Das HUD heftet eine kleine Statistikbox neben den Sitz jedes Spielers, aufgebaut aus den Händen, die du in deinen Protokollen aufgezeichnet hast: Zahl der beobachteten Hände, dann VPIP (wie oft er pre-flop freiwillig Geld einsetzt), PFR (Pre-Flop-Erhöhungen), AF (Aggressionsfaktor), 3B (3-Bet), CB (Continuation Bet) und F3B (Fold auf 3-Bet), farbcodiert von passiv bis aggressiv. Tippe eine Box für ein detailliertes Popover mit mehr Zahlen (Steal-Versuche, Fold auf Steal, Showdown-Quoten\u2026), und ziehe eine Box beiseite, wenn sie etwas verdeckt.',
              'Das HUD kennt nur, was du an deinen eigenen Tischen gesehen hast — es liest deine lokalen Hand-Protokolle, die Protokollierung muss also aktiv sein, und die Zahlen werden erst nach genügend Händen aussagekräftig. Es ist eine Beta-Funktion, standardmäßig aus: Aktiviere sie in Erweiterte Optionen \u2192 Assistenz.'] },
        { id: 'handsbtn', t: 'Übersicht der Kombinationen',
          b: ['Das Pokerhände-Symbol auf dem Filz öffnet jederzeit eine schnelle Übersicht der 10 Kombinationen — praktisch beim Lernen. Es lässt sich in den Erweiterten Optionen ausblenden.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat & Soziales',
      sections: [
        { id: 'panels', t: 'Lobby-Chat und Spiel-Chat',
          b: ['Es gibt einen Chat in der Lobby und einen am Tisch. Auf Telefonen schwebt der Spiel-Chat über dem Tisch; auf größeren Bildschirmen ist er ein verschieb- und größenveränderbares Fenster. Ein Abzeichen auf der Chat-Schaltfläche zählt ungelesene Nachrichten.'] },
        { id: 'typing', t: 'Tipp-Hilfen',
          list: [
            'Tab vervollständigt einen Spitznamen — drücke erneut Tab, um durch die Treffer zu wechseln.',
            '\u2191 / \u2193 blättern durch den Verlauf deiner eigenen Nachrichten.',
            'Die Emoji-Schaltfläche öffnet eine vollständige Auswahl; das Tippen von : schlägt außerdem Emotes während der Eingabe vor.'] },
        { id: 'emotes', t: 'Emotes und Smileys',
          b: ['Der Chat wandelt Emote-Kürzel genau wie der offizielle Desktop-Client um: Tippe einen Namen zwischen Doppelpunkten und er wird zum Emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 mehr als 1.900 Kürzel werden unterstützt (der komplette GitHub-Satz). Klassische Text-Smileys werden ebenfalls umgewandelt: :-) ;) :D xD :P <3 und rund achtzig weitere.',
              'Das Tippen von : öffnet ein Vorschlagsfenster, das das Kürzel während der Eingabe vervollständigt (\u2191/\u2193 zum Auswählen, Tab oder Enter zum Übernehmen). Die Emoji-Umwandlung lässt sich in Erweiterte Optionen \u2192 Chat komplett abschalten.'] },
        { id: 'commands', t: 'Chat-Befehle',
          b: ['Der Chat versteht Schrägstrich-Befehle. Zwei sind für andere sichtbar:'],
          keys: [
            ['/me <Text>', 'Aktionsnachricht, angezeigt als \u201e* deinname Text\u201c'],
            ['/emoji <Emoji>', 'Spielt eine Emoji-Reaktion ab (das, was die Reaktionsauswahl sendet)']] },
        { id: 'diagcmds', t: 'Diagnose-Befehle',
          b: ['Alles Übrige ist lokal: Die Antworten siehst nur du, und nichts wird an den Tisch gesendet. Tippe /help, um alle aufzulisten. Die nützlichsten:'],
          keys: [
            ['/help', 'Alle Befehle auflisten'],
            ['/update', 'Auf neue Version prüfen und aktualisieren'],
            ['/lang <Code>', 'Sprache wechseln (z. B. /lang de)'],
            ['/sound on|off', 'Spielsounds ein-/ausschalten'],
            ['/zoom', 'Die Tisch-Lupe umschalten'],
            ['/clear', 'Den Chat lokal leeren'],
            ['/table', 'Infos zum aktuellen Spiel (Blinds, Spieler, Stacks)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnose von Client-Zustand, Netzwerk und Bildrate'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Erweitertes Debugging (Karten, Protokoll, Audio, Speicher, Sitze)'],
            ['/copy', 'Die letzte Befehlsantwort in die Zwischenablage kopieren']] },
        { id: 'reactions', t: 'Emoji-Reaktionen',
          b: ['Die Reaktions-Schaltfläche öffnet eine Auswahl von 30 animierten Reaktionen (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026), die mit einem Effekt über deinem Sitz abgespielt werden, sichtbar für den ganzen Tisch — auch für Spieler am Desktop-Client. Reaktionen lassen sich in den Erweiterten Optionen komplett abschalten.'] },
        { id: 'translate', t: 'Alle verstehen',
          b: ['Mit aktivierter Chat-Übersetzung erhält jede Nachricht eine Übersetzen-Schaltfläche, die sie über den Übersetzer des Browsers in deiner Sprache anzeigt. Gängige Tisch-Abkürzungen (gg, nh, utg\u2026) werden beim Überfahren in einem Tooltip erklärt — beide Optionen finden sich in Erweiterte Optionen \u2192 Chat.'],
          note: 'Die Übersetzung nutzt den Google-Translate-Dienst und funktioniert in jedem Browser — sie braucht nur eine Internetverbindung. Eine Nachricht wird nur dann an den Übersetzungsdienst gesendet, wenn du ihre Übersetzen-Schaltfläche antippst, nie automatisch.' },
        { id: 'social', t: 'Spieler: Profil, Einladen, Ignorieren',
          b: ['Tippe einen beliebigen Spieler an — am Tisch oder in der Lobby-Liste — um seine Karte zu öffnen: Profil und Statistiken, ihn zu deinem Spiel einladen oder ihn ignorieren (seine Chat-Nachrichten werden ausgeblendet; Ignorieren ist jederzeit umkehrbar). Eine Bestätigung vor Einladen/Ignorieren lässt sich in den Optionen aktivieren.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby & Spiele',
      sections: [
        { id: 'list', t: 'Die Spieleliste',
          b: ['Die Lobby listet jeden Tisch des Servers. Jeder Eintrag zeigt die Spielerzahl, den Spieltyp, ein Vorhängeschloss, wenn ein Passwort oder eine Einladung nötig ist, und ein Status-Abzeichen: \u201eWartet\u201c (grün — das Spiel hat nicht begonnen, du kannst beitreten, wenn ein Platz frei ist), \u201eLäuft\u201c (warme Farbe — live verfolgbar, wenn Zuschauer erlaubt sind) und \u201eGeschlossen\u201c (abgedunkelt). Ein voller Tisch zeigt einfach einen vollen Zähler wie 10/10; die Abzeichenfarben folgen dem aktiven Theme.',
              'Das Filter-Auswahlmenü grenzt die Liste genau wie der Desktop-Client ein, jede Wahl strenger als die vorige: nur offene Spiele \u2192 zusätzlich ohne volle Tische \u2192 dann nur nicht-private, nur private oder nur gewertete Spiele. Deine Wahl wird gemerkt. Das Suchfeld findet ein Spiel per Name, und die Spieler-Anzeige öffnet die Liste aller Online-Spieler, durchsuch- und sortierbar.'] },
        { id: 'join', t: 'Beitreten und zuschauen',
          b: ['Wähle ein offenes Spiel und tritt bei — ein Vorhängeschloss bedeutet, dass ein Passwort nötig ist. Laufende Spiele, die Zuschauer erlauben, lassen sich live verfolgen: Du siehst Tisch und Chat, aber die Hole Cards bleiben verdeckt und du kannst nicht handeln.'] },
        { id: 'gameinfo', t: 'Spielinfos',
          b: ['Vor dem Beitreten zeigt die Spielinfo-Karte alles, was den Tisch definiert: Spieltyp, Blinds und ihre Steigerung (Verdopplung oder manuelle Liste), Start-Stack, Zeitlimit für Aktionen, Pause zwischen den Händen und wer bereits sitzt.'] },
        { id: 'create', t: 'Ein Spiel erstellen',
          b: ['Erstelle deinen eigenen Tisch: Name, Spielerzahl, Start-Stack, erste Small Blind und Erhöhungsplan, Zeitlimit für Aktionen und ob Zuschauer erlaubt sind. Vier Spieltypen gibt es: Normal (jeder), nur registrierte Spieler, nur auf Einladung und Gewertet (zählt für die offizielle Rangliste — dort ist kein Passwort erlaubt). Deine Lieblingseinstellungen lassen sich speichern und wieder laden.'] },
        { id: 'invites', t: 'Einladungen',
          b: ['Spieler können dich an ihren Tisch einladen; du bekommst eine Benachrichtigung, die du annehmen oder ablehnen kannst. Eingeladen zu werden ist der einzige Weg in ein Nur-auf-Einladung-Spiel.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Dein Konto',
          b: ['Der offizielle Internet-Server ist pokerth.net. Dort zu spielen erfordert ein kostenloses pokerth.net-Konto — registriere dich auf der Website und melde dich hier mit denselben Zugangsdaten an. Dieser Web-Client verbindet sich mit genau demselben Server wie der Desktop-Client: dieselben Konten, dieselben Tische, dieselben Ranglisten, und du kannst mit Desktop-Spielern an einem Tisch sitzen.'] },
        { id: 'ranked', t: 'Gewertete Spiele und Saisons',
          b: ['Spiele vom Typ Gewertet zählen für die offizielle Saisonrangliste. Dein Profil in der App zeigt dein Beitrittsdatum, Rang, Punktzahl, Durchschnitt und gespielte Spiele der laufenden Saison sowie deine letzten Ergebnisse. Normale (nicht gewertete) Spiele sind nur zum Spaß und ändern nichts.'] },
        { id: 'rankhow', t: 'Wie die Rangliste berechnet wird',
          b: ['In jedem gewerteten Spiel bringt dir dein Platz Punkte: 15 für den ersten, dann 9, 6, 4, 3, 2 und 1 bis zum siebten; vom achten bis zum zehnten gibt es nichts. Ein Tisch verteilt also insgesamt 40 Punkte.',
              'Dein Score ist nicht die Summe dieser Punkte, sondern dein Durchschnitt pro Spiel, gedämpft durch einen Faktor, der mit der Zahl der gespielten Spiele wächst: ein paar gute Ergebnisse reichen nicht, um sich oben festzusetzen, es braucht auch Beständigkeit — je mehr du spielst, desto näher kommt dein Score deinem echten Durchschnitt. Eine Saison dauert ein Quartal: beim Wechsel wird alles archiviert und die Zähler starten wieder bei null, vergangene Saisons bleiben abrufbar. Im Spiel zeigt die Podest-Schaltfläche die Saisonwertung der Spieler an deinem Tisch.'],
          note: 'Punkteschlüssel und genaue Formel legt der Ranglisten-Server von pokerth.net fest und können sich ändern; maßgeblich sind die Seiten der Website.' },
        { id: 'rankings', t: 'Ranglisten-Seiten',
          b: ['Der Ranglisten-Eintrag öffnet die offizielle PokerTH-Rangliste, durchsuchbar nach Spielern, sowie die Community-Ranglisten (BBC, WEC). Wenn dich Ranglisten nicht interessieren, lässt sich der Eintrag in Erweiterte Optionen \u2192 Community ausblenden.'] },
        { id: 'cups', t: 'Die Community-Cups: BBC und WeCup',
          b: ['Zwei Communitys veranstalten auf pokerth.net eigene Wettbewerbe, jede mit eigener Website und eigener Wertung. Der Best Brainies Cup (BBC) ist ein 2013 entstandenes Stufenturnier: man arbeitet sich von Step 1 bis Step 4 vor, und nach jedem Step-4-Spiel beginnt eine neue Saison, wenn der Cup vergeben wird. Der WeCup (WEC) hat einen eigenen, deutlich breiteren Schlüssel — 75 Punkte für den ersten Platz, dann 45, 30, 20… — und sein Score normiert deinen Durchschnitt anhand der Zahl deiner Spiele im Vergleich zu den anderen Mitgliedern.',
              'Beide Wertungen öffnest du über die Pokal-Schaltfläche, neben der PokerTH-Rangliste. Die Tischeinstellungen dieser Wettbewerbe liegen beim Erstellen eines Spiels als Voreinstellungen bereit (BBC Step 1 bis 4, WEC, WEC Monthly Final und WEC Grand Final), du kannst also unter denselben Bedingungen üben. Für die Teilnahme ist eine Anmeldung auf der Website des jeweiligen Cups nötig.'],
          note: 'Diese Inhalte lassen sich in Erweiterte Optionen → Community mit einem Griff ausblenden, wenn dich Cups nicht interessieren.' },
        { id: 'forumcups', t: 'Forum-Cups und Events',
          b: ['Im Forum von pokerth.net läuft außerdem der Monthly Cup, eine monatliche Serie, bei der sich die Spieler auf Gold-, Silber- und Bronze-Tische verteilen, bevor der Champion des Monats gekürt wird, dazu über das Jahr verteilt einzelne Sonder-Cups.',
              'Anmeldungen, Termine, Tischeinstellungen und Ergebnisse werden im Forum veröffentlicht, und die Spiele laufen wie alle anderen auf dem offiziellen Server. Ein pokerth.net-Konto genügt, um die Ergebnisse zu verfolgen; die Anmeldung zu einem Cup läuft über den passenden Forumsthread.'] },
        { id: 'avatars', t: 'Avatare und Flaggen',
          b: ['Auf pokerth.net wird dein Avatar über den Avatar-Server an andere Spieler verteilt, und eine kleine Landesflagge kann auf den Spielerboxen erscheinen. Beides ist optional und in den Optionen einstellbar.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Trainingsmodus',
      sections: [
        { id: 'what', t: 'Was das ist',
          b: ['Der Lokal-/Trainingsmodus ist ein vollständiges Spiel gegen Computergegner: keine Verbindung, kein Konto, nichts auf dem Spiel. Sobald die App installiert (oder nur einmal besucht) wurde, funktioniert er komplett offline — perfekt, um das Spiel zu lernen, die Oberfläche zu testen oder im Flugmodus die Zeit zu vertreiben.'] },
        { id: 'setup', t: 'Ein Spiel einrichten',
          b: ['Wähle Gegnerzahl, Start-Stack, Blinds und Erhöhungsplan sowie das Spieltempo. Zusammensetzung und Schwierigkeit der Bots stellst du in Erweiterte Optionen \u2192 Lokales Spiel ein — von sanften Gegnern bis zu einem härteren, gemischten Tisch.'] },
        { id: 'trophies', t: 'Trophäen',
          b: ['Der Trainingsmodus hat seinen eigenen Fortschritt: 28 Trophäen in sechs Kategorien (Fortschritt, Können, Stil, Formate, Spaß und eine geheime) werden beim Spielen freigeschaltet — gespielte Hände, gewonnene Partien, große Bluffs, besondere Hände und mehr. Dein Trophäenfortschritt ist kumulativ und wird zwischen Geräten zusammengeführt, wenn die Konto-Synchronisierung der Einstellungen aktiv ist.'] },
        { id: 'learn', t: 'Ein guter Ort zum Lernen',
          b: ['Alles aus den anderen Kapiteln funktioniert auch hier: der Wahrscheinlichkeits-Monitor, die Assistenzanzeige, die Vorwahl, die Tastaturkürzel. Der Trainingsmodus ist der beste Ort, sie ohne Druck auszuprobieren, bevor es auf pokerth.net geht.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Stil & Sound',
      sections: [
        { id: 'themes', t: 'Themes',
          b: ['Die Stil-Kategorie der Erweiterten Optionen gestaltet den ganzen Client um. Voreinstellungen setzen alles mit einem Fingertipp (das klassische grüne Casino, der offizielle PokerTH-Look\u2026); darunter lassen einzelne Achsen die Farbpalette, den Tischfilz und die Kartenbilder getrennt feinjustieren — ändere eine Achse und deine Mischung wird zu einem eigenen Theme. Dunkel, hell oder automatisch wählst du unter Benutzeroberfläche; deine Auswahl gilt sofort, auf jedem Bildschirm, und wird gemerkt.'] },
        { id: 'tablelook', t: 'Tische, Decks, Sitze',
          b: ['Über das Theme hinaus lassen sich mehrere Elemente unabhängig austauschen: der Tischhintergrund, das Kartendeck, die Kartenrückseite (automatisch passend zum Deck oder mit eigenem importiertem Bild), die Dealer- und Blind-Chips, der Stil der Aktionsschaltflächen und komplette Sitzpakete, die die Spielerboxen neu einkleiden. Wähle alles in Erweiterte Optionen \u2192 Stil; Änderungen sind sofort am Tisch sichtbar.'] },
        { id: 'music', t: 'Musikspieler',
          b: ['Der Musik-Eintrag in den Header-Menüs öffnet einen kleinen Lounge-Musikspieler: Wähle einen Titel aus der Playlist, Wiedergabe/Pause, vorheriger/nächster, Zufall und Wiederholung eines Titels, der ganzen Playlist oder gar nichts. Lautstärke, gewählter Titel und Wiederholmodus werden gemerkt. Die Wiedergabe startet nie von selbst — Browser verlangen ein Antippen — und der Spieler ist völlig unabhängig von den Soundeffekten des Spiels.'] },
        { id: 'sounds', t: 'Soundeffekte',
          b: ['Die Spielsounds sind in vier getrennt schaltbare Kategorien gruppiert, genau wie im Desktop-Client: Spielaktionen (ausgeteilte Karten, Check, Call, Raise, dein Zug\u2026), Lobby-Chat-Benachrichtigung, Netzwerkspiel-Benachrichtigungen (Spieler beigetreten, Spiel bereit) und die Blind-Erhöhungs-Benachrichtigung. Ein einziger Lautstärkeregler steuert sie alle, in Erweiterte Optionen \u2192 Sound.'],
          note: 'Alle Browser — besonders iOS — spielen keinen Ton ab, bevor du die Seite einmal berührt hast. Startet ein Spiel stumm, weckt ein einziges Tippen irgendwo den Ton; der Client repariert die Audio-Engine außerdem automatisch, wenn iOS sie unterbricht (eingehender Anruf, Hintergrund\u2026).' },
        { id: 'voice', t: 'Stimme und Vibration',
          b: ['Zwei zusätzliche Kanäle können dich informieren, ohne dass du hinschaust: Sprachansagen lesen die Spielereignisse über die Sprachausgabe deines Geräts vor, und auf Telefonen kann eine kurze Vibration deinen Zug markieren. Beides sind Web-Erweiterungen, je nach Gerät standardmäßig an oder aus, in Erweiterte Optionen \u2192 Einsatz & Zug.'],
          note: 'Vibration funktioniert auf Android (Chromium-Browser); Apple stellt Websites keine Vibrations-API bereit, iPhones können also nicht vibrieren. Sprachansagen funktionieren überall, aber die verfügbaren Stimmen und Sprachen hängen von deinem System ab — der Client nutzt die beste Übereinstimmung, die er findet.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Optionen & Tastenkürzel',
      sections: [
        { id: 'where', t: 'Wo die Optionen wohnen',
          b: ['Die Erweiterten Optionen öffnen sich über den Zahnrad-Eintrag jedes Header-Menüs. Sie sind wie im Desktop-Client gruppiert: Benutzeroberfläche, Stil, Sound, Lokales Spiel, Netzwerkspiel, Internetspiel, Spitznamen / Avatare, Log-Meldungen und Standardwerte wiederherstellen. Jede webspezifische Funktion hat dort ihren eigenen Schalter, damit du alles abschalten kannst, was du nicht nutzt.'] },
        { id: 'cfgxml', t: 'Einstellungen mit dem Desktop-Client austauschen',
          b: ['Deine Einstellungen können zwischen Clients reisen: Die Kategorie Log-Meldungen bietet Export/Import der offiziellen config.xml (die \u007e/.pokerth/config.xml der Desktop- und QML-Clients). Der Export schreibt die gemeinsamen Einstellungen — Name, Anzeigeoptionen, Sounds, Tischvorlieben, Blinds, Stile — und der Import wendet hier eine Desktop-Datei an. Einstellungen, die dieser Client nicht kennt, bleiben in der Datei unangetastet erhalten.'] },
        { id: 'sync', t: 'Einstellungen, die dir folgen',
          b: ['Wenn du mit einem Konto spielst, werden deine Optionen, dein Theme, deine Tastenbelegungen, deine Sprache und deine Trainings-Trophäen synchronisiert: Ändere etwas auf einem Gerät, und das nächste Gerät, auf dem du dich anmeldest, übernimmt es. Der Trophäenfortschritt wird zusammengeführt, nie überschrieben — auf zwei Geräten zu spielen behält also immer das Beste von beiden.'] },
        { id: 'updates', t: 'Auf dem Laufenden bleiben',
          b: ['Der Client aktualisiert sich selbst: Wird eine neue Version ausgerollt, lädt dich ein Banner zum Aktualisieren ein (oder tippe /update in den Chat, um manuell zu prüfen). Gelegentlich kann eine kleine Produktumfrage nach deiner Meinung zu einer Funktion fragen — die Teilnahme ist freiwillig, und Umfragen lassen sich in Erweiterte Optionen \u2192 Community komplett abschalten.'] },
        { id: 'fkeys', t: 'Offizielle Tastenkürzel',
          b: ['Die offiziellen PokerTH-Funktionstasten funktionieren während eines Spiels:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (Reihenfolge in den Optionen umkehrbar)'],
            ['F5', 'Deine Karten zeigen (wenn möglich)'],
            ['F6 / F7 / F8', 'Manuell \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manuell \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Spielprotokoll \u00b7 Chancen-Panel'],
            ['F11', 'Vollbild']],
          note: 'Tastenkürzel brauchen eine physische Tastatur. Auf dem Mac steuern die F-Tasten standardmäßig Medien: Halte Fn (oder aktiviere \u201eF1, F2 usw. als Standard-Funktionstasten verwenden\u201c in den macOS-Einstellungen). Auf dem iPhone ist Vollbild durch iOS eingeschränkt — die Installation als PWA liefert dieselbe Vollbild-Erfahrung.' },
        { id: 'webkeys', t: 'Web-Buchstabentasten',
          b: ['Als Web-Erweiterung lösen auch einzelne Buchstabentasten Aktionen aus und lassen sich in Erweiterte Optionen \u2192 Tastenkürzel neu belegen:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Esc', 'Das oberste Fenster schließen (auch die Android-Zurück-Taste)']],
          note: 'Auf Android schließt die System-Zurück-Taste/-Geste Fenster wie Escape, statt das Spiel zu verlassen (in den Optionen einstellbar). iOS hat keine vergleichbare Systemtaste — nutze das \u2715 jedes Fensters.' }
      ]
    }
  ]
};
