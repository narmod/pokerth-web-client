// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lang/lv.mjs — Latvian catalogue (self-contained).
//
// Each language file exports `meta` (label / text-direction / flag) and
// `strings`. TO ADD A LANGUAGE: copy en.mjs, translate every value, then
// register the file in ../i18n.mjs (one import + one LANG_MODULES entry).
// Nothing else needs to change. When translating, keep {token} placeholders
// and the `||` line separators exactly as they appear.
//
// WORK IN PROGRESS: this catalogue is being translated in stages. It is not
// registered in ../i18n.mjs yet, so nothing loads it; keys still missing fall
// back to English through t() once it is registered.
// ─────────────────────────────────────────────────────────────────────────

export const meta = {
  label: 'Latviešu',
  dir: 'ltr',
  flag: '<svg class="lang-flag" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" aria-label="Latviešu"><rect width="60" height="12" y="0" fill="#9E3039"/><rect width="60" height="6" y="12" fill="#FFFFFF"/><rect width="60" height="12" y="18" fill="#9E3039"/></svg>',
};

export const strings = {
    // Notes de joueur + étiquettes (modules/notes, extra web)
    nvTitle:'Mana piezīme', nvRating:'Vērtējums', nvPlaceholder:'Izlīdzina jebkuru 3-bet…', nvSaved:'Saglabāts', nvTagNone:'Bez etiķetes', nvTagRed:'Bīstams', nvTagOrange:'Agresīvs', nvTagYellow:'Vērot', nvTagGreen:'Zivs', nvTagBlue:'Šaurs', nvTagPurple:'Viltīgs', nvLabelPh:'Etiķetes nosaukums', nvLabelTip:'Pārdēvē šo etiķeti — tā attiecas uz visiem šīs krāsas spēlētājiem',
    ppMyStats:'Mana statistika',
    ppLocalTab:'Lokāli / treniņš',
    // Session stats, behind a button on the player card.
    piShowStats:'Rādīt sesijas statistiku', piHideStats:'Slēpt sesijas statistiku',
    // Player profile window (parity: QML PokerthPlayerPage).
    rankingAvg:'Vid.', rankingLast5:'Pēdējās 5:', rankingRecentGames:'Nesenās spēles', rankingSeasons:'Sezonas', rankingLastLogin:'Pēdējā pieteikšanās', ppOpen:'Spēlētāja profils', ppTitle:'Spēlētāja profils',
    // Private messages (parity: QML "Messages prives", 2.1.7+).
    pmTitle:'Privātās ziņas', pmTooltip:'Privātās ziņas', pmBtn:'Privāta ziņa', pmSend:'Sūtīt', pmPlaceholder:'Ziņa…', pmDelete:'Dzēst šo sarunu', pmDeleteConfirm:'Vai dzēst sarunu ar {name}?', pmEmpty:'Vēl nav nevienas sarunas.', pmNoConv:'Izvēlies sarunu.', pmNoMsg:'Vēl nav ziņu.', pmMe:'Es', pmNotFound:'Spēlētājs nav atrasts', pmSelf:'Sev pašam privātu ziņu nosūtīt nevar.', pmOffline:'Nav savienojuma ar serveri', pmUsage:'Lietojums: /msg <segvārds> <ziņa>', pmAtTable:'Pie galda privātās ziņas nav pieejamas.', pmRejected:'Privāto ziņu nevarēja piegādāt.', pmOfflinePartner:'Šobrīd nav vestibilā', pmGuest:'Viesi nevar sūtīt tērzēšanas ziņas', pmNotInLobby:'nav vestibilā', pmPartnerGuest:'Viesi nevar saņemt privātās ziņas.',
    // Server timeout warning popup (parity: timeoutWarningPopup, pokerth.qml).
    timeoutWarnTitle:'Noildzes brīdinājums', timeoutWarnIdle:'Neaktivitātes dēļ tavs savienojums tiks pārtraukts pēc {s} sekundēm.', timeoutWarnAdmin:'Tu esi atvērtas spēles administrators, un spēlei iestāsies noildze pēc {s} sekundēm.', timeoutWarnAfk:'Tu pēdējā laikā spēlē neesi rīkojies. Pēc {s} sekundēm tu tiksi izņemts no spēles.', timeoutWarnExpired:'Iestājusies noildze. Savienojums tiks pārtraukts.', timeoutWarnExpiredGame:'Iestājusies noildze. Tu tiec izņemts no spēles.', timeoutWarnHint:'Lai apturētu atskaiti, noklikšķini uz “OK”!', timeoutWarnOk:'OK', connLostTitle:'Savienojums zaudēts',
  invScanQr: 'Skenē, lai pievienotos', invCopyLink: 'Kopēt saiti', invShareVia: 'Kopīgot…', invitedBanner: 'Tu esi uzaicināts pievienoties galdam',
  abClTabWeb: 'Tīmekļa klients',
  abClTabUpstream: 'Instalējamie klienti',
  abTabChangelog: 'Izmaiņu žurnāls',
  abClLoading: 'Ielādē…',
  abClNew: 'Jaunumi', abClImprovements: 'Uzlabojumi', abClBugfixes: 'Kļūdu labojumi', abClError: 'Izmaiņu žurnāls nav pieejams.',
  rkCalcTitle: 'Reitinga aprēķins:',
  rkCalcPoints: 'Vietas punkti:',
  rkCalcFormula: 'Formula:',
  gameAdminBadge: 'Admins',
  gameAdminTip: 'Spēles administrators: sāk spēli un var izmest spēlētājus',
  hlColHands: 'Nospēlētās partijas',
  hlComputing: 'Aprēķina…',
  helpTitle:'Palīdzība', helpSearchPh:'Meklēt palīdzībā…', helpWip:'Šī nodaļa vēl top.', helpNoResults:'Nav rezultātu', advHelpBtn:'Rādīt izvēlnēs palīdzības ierakstu',
  jrImport: 'Importēt .pdb…',
  jrImportDone: 'Imports: {ok} pievienotas · {dup} jau ir · {ko} nenolasāmas',

  jrUploadNet: 'Analizēt vietnē pokerth.net…',
  jrUploadFail: 'Augšupielāde uz pokerth.net neizdevās',

    advSecConn:'Savienojums', advNickRetry:'Automātiski mēģināt vēlreiz, kamēr segvārds vēl ir aizņemts', nickInUseRetry:'“{name}” vēl ir aizņemts — nākamais mēģinājums pēc {n} s ({a}/{max})…', nickInUseGiveUp:'“{name}” pēc {max} mēģinājumiem joprojām ir aizņemts. Serverī vēl ir atvērta iepriekšējā sesija — mēģini vēlreiz pēc dažām minūtēm vai izvēlies citu segvārdu.',
    // — i18n gap-fill (backup / trophies / back tooltip) —
    achTitle:'Trofejas', advBackupSec:'Pilna rezerves kopija (tīmekļa klients)', advBackupDesc:'Saglabā vienā failā visu, kas glabājas šajā pārlūkā: tīmekļa iestatījumus, motīvus, kāršu komplektus, pielāgotās vietas, avatara attēlu, sasniegumus un statistiku — arī to, kas ir par lielu, lai sinhronizētos ar kontu. Tava parole un sesija netiek iekļauta nekad, un imports sasniegumus apvieno, nevis aizstāj, tāpēc progress nepazūd.', advBackupExport:'Eksportēt rezerves kopiju', advBackupImport:'Importēt rezerves kopiju', advWinOpen:'Izcelt pogu zeltainu, kamēr tās logs ir atvērts', backTooltip:'Atpakaļ',
  advPolls: "Piedalīties produkta aptaujās",
  pollTitle: "Aptauja",
  pollThanks: "Paldies par atbildi!",
  pollAnswers: "{n} atbilde(s)",
  pollErr: "Neizdevās nosūtīt tavu atbildi.",
    // ── Stats / HUD / range (session) ──
    gipTabStats:"Statistika",
    advStatsTrack:"Ierakstīt partiju statistiku",
    advHudOn:"Rādīt statistikas HUD uz spēlētāju vietām",
    advSecStatsExport:"Statistikas eksports",
    advStatsExportDesc:"Eksportē ierakstītās partijas kā .pdb failu, ko var importēt PokerTH Tracker.",
    advStatsExportSession:"Eksportēt sesiju",
    advStatsExportAll:"Eksportēt visu vēsturi",
    advPdbAutoSec:"Automātisks .pdb fails",
    advPdbAutoDesc:"Raksti .pdb žurnālu mapē savā datorā un atjauno to pēc katras partijas, tāpat kā darbvirsmas klientā. Tikai darbvirsmas Chrome, Edge un Opera.",
    advPdbAuto:"Rakstīt .pdb failu automātiski",
    advPdbAutoPick:"Izvēlēties mapi…",
    advPdbAutoNoFs:"Šis pārlūks nevar rakstīt lokālā mapē.",
    advPdbAutoFolder:"Mape",
    hlSession:"Sesija",
    hlHistory:"Vēsture",
    hlExportPdbTip:"Eksportēt kā .pdb (importējams PokerTH Tracker)",
    hlNoData:"Datu vēl nav.",
    hlStatsTitle:"Statistika",
    hlWon:"Uzvarētas",
    hlTrend:"Tendence",
    hlScopeSession:"sesija",
    hlSeeRange:"Skatīt diapazonu ▸",
    hlStyle:"Stils",
    hlStyleVeryTight:"Ļoti šaurs",
    hlStyleTightPassive:"Šaurs-pasīvs",
    hlStyleTightAggr:"Šaurs-agresīvs",
    hlStyleLoosePassive:"Plašs-pasīvs",
    hlStyleLooseAggr:"Plašs-agresīvs",
    hlStyleHyperAggr:"Hiperagresīvs",
    hlStyleEstimate:"Aplēse — mazāk nekā 25 partijas",
    hlRangeLegend:"Diagonāle = pāri · augšā pa labi = vienā mastā · apakšā pa kreisi = dažādos mastos",
    hlRangeShowdown:"Kāršu atklāšanas diapazons",
    hlPosition:"Pozīcija",
};
