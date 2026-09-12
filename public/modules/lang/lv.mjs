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
    hlPlayers:"Spēlētāji",
    hlAllF:"Visas",
    hlAllM:"Visi",
    hlHandSing:"partija",
    hlHandPlur:"partijas",
    // Boot splash (écran de chargement initial — parité login QML)
    bootLoading:"Ielādē…",
    bootReady:"Gatavs.",
    bootRetry:"Mēģināt vēlreiz",
    bootErrorMsg:"Nestabils savienojums — dažus failus neizdevās ielādēt.",
    bootMissing:"Trūkstoši faili: {n}",
    buttonsAuto:"Automātiski (galds)",
    buttonsFlat:"Plakanas",
    advRemoveGone:"Noņemt aizgājušos spēlētājus un pārsēdināt galdu",
    advConfirmSocial:"Prasīt apstiprinājumu, pirms uzaicināt vai ignorēt spēlētāju",
    advWinnerPopup:"Uzvarētāja logs partijas beigās",
    // PlayerWinnerOverlay (badge gagnant sur la boîte, parité QML)
    winnerBadge:'UZVARĒTĀJS',
    // GameStatusBar (bandeau d'info de jeu, parité QML §7)
    gsbTotal:'Kopā:', gsbBets:'Likmes:', gsbGame:'Spēle:', gsbHand:'Partija:',
  advUiGeneral:'Vispārīgi', advUiNetwork:'Tīkls', advShowTooltips:'Rādīt rīka padomus', advShowAppTitle:'Rādīt PokerTH nosaukumu pieteikšanās ekrānā', advDisableSplash:'Atspējot sākuma ekrānu palaišanas laikā', advDontTranslatePoker:'Netulkot pokera terminus (Check, Call, Raise)', advNA:'web', advLanguage:'Valoda', advDefCommunity:'Noklusējuma kopiena', advSecReactions:'Reakcijas', advDisableReactions:'Atspējot emocijzīmju reakcijas', advNetStateColor:'Rādīt tīkla statusa krāsu avatara stūrī',
  showPlayers: `Rādīt spēlētājus`,
  footJoin: `Pievienoties`,
  spectatingBadge: `Vēro`,
  reportGameTitle: `Ziņot par nepiemērotu spēles nosaukumu`, reportGameConfirm: `Ziņot`, reportGameMsg: `Vai tiešām vēlies ziņot par spēles nosaukumu "{name}" kā nepiemērotu?`, reportGameAccepted: `Serveris pieņēma ziņojumu par spēles nosaukumu. Paldies.`, reportGameDup: `Par šo spēles nosaukumu jau ir ziņojis cits spēlētājs.`, reportGameError: `Ziņojot par spēles nosaukumu, radās kļūda.`,
  reportAvatarTitle: `Ziņot par nepiemērotu avataru`, reportAvatarMsg: `Vai tiešām vēlies ziņot par spēlētāja "{name}" avataru kā nepiemērotu?`, reportAvatarAccepted: `Serveris pieņēma ziņojumu par avataru. Paldies.`, reportAvatarDup: `Par šo avataru jau ir ziņojis cits spēlētājs.`, reportAvatarError: `Ziņojot par avataru, radās kļūda.`, piReportAvatar: `Ziņot par avataru`,
  avImgNotImage: `Lūdzu, izvēlies attēla failu.`, avImgTooLarge: `Šis attēls ir par lielu. Lūdzu, izvēlies mazāku.`, avImgInvalid: `Nederīgs attēls.`, avImgFailed: `Šo attēlu neizdevās apstrādāt.`,
  buttonsPokerth: 'PokerTH',
  hdrWaitingPlayers:'Gaida spēlētājus', hdrSpectatingWait:'Vēro — gaida nākamo partiju', wpWaitingPlayers:'Gaida spēlētājus …', wpFillBots:'Aizpildīt ar datora spēlētājiem', wpStartGame:'Sākt spēli', wpLeaveGame:'Pamest spēli', wpInvite:'Uzaicināt draugus', advInviteLink:'Rādīt gaidīšanas telpā pogu “Uzaicināt draugus”', sharedTableNotFound:'🔗 Koplietotais galds nav atrasts — iespējams, tas jau ir beidzies.',
  assist:'Asistents',assistPopOut:'Atdalīt atsevišķā logā',assistDock:'Pievienot atpakaļ panelim',advCatUI:'Lietotāja saskarne',advCatStyle:'Stils',advCatSound:'Skaņa',advCatLocal:'Lokālā spēle',advCatNetwork:'Tīkla spēle',advCatInternet:'Interneta spēle',advCatAvatar:'Segvārdi / avatari',advCatLog:'Žurnāla ziņojumi',advCatReset:'Atjaunot noklusējumus',
  advStyleDesc:'Kāršu komplekti, galda audums, vietu apdare un krāsu motīvs.',advStyleOpen:'Atvērt motīvu izvēli',advSoundDesc:'Spēles skaņa, mūzikas skaļums un reakciju apklusināšana.',advSoundOpen:'Skaņas un skaļuma iestatījumi',advLocalDesc:'Trenējies pret botiem: aizpildi tukšās vietas pie sava galda.',advLocalOpen:'Aizpildīt vietas ar botiem',advNetworkDesc:'Rīko spēli savā lokālajā tīklā (LAN).',advSoonTag:'Drīzumā',advInternetDesc:'Tu esi savienots ar PokerTH serveri.',advSrvLabel:'Serveris',advInternetOpen:'Mainīt serveri / atvienoties',advSrvUnknown:'—', advSrvBridge:'Starpniekservera tilts',advAvatarDesc:'Tavs segvārds un avatara attēls.',advAvatarOpen:'Rediģēt segvārdu / avataru',advLogDesc:'Spēles žurnāls un tērzēšanas pārklājums.',advLogOpen:'Atvērt žurnālu',advJournalOpen:'Pārvaldīt žurnālus…',advSecJournal:'Sesiju žurnāli',advJournalDesc:'Pārlūko, eksportē, analizē un dzēs sesiju žurnālus, tāpat kā oficiālajā klientā.',jrTitle:'Žurnāli',jrGame:'Spēle:',jrGameN:'Spēle {n}',jrAllGames:'Visas spēles',jrPreview:'Priekšskatījums:',jrSearch:'Meklēt…',jrExportHtml:'Eksportēt kā HTML',jrExportTxt:'Eksportēt kā txt',jrSaveAs:'Saglabāt kā…',jrSelect: "Atlasīt…", jrSelectCancel: "Atcelt atlasi", jrSelectHint: "Izvēlies vairākus žurnālus, lai dzēstu tos uzreiz — Ctrl (⌘) + klikšķis pievieno vienu, Shift + klikšķis atlasa diapazonu, Shift + ↑/↓ no tastatūras", jrDeleteN: "Dzēst ({n})", jrConfirmDeleteN: "Vai dzēst {n} žurnālus? To nevar atsaukt.", jrDelete:'Dzēst',jrDeleteAll:'Dzēst visus',jrAnalyze:'Analizēt žurnāla failu…',jrAnalyzeLbl:'Partiju žurnāls:',jrBack:'Atpakaļ uz priekšskatījumu',jrHand:'Partija',jrEmpty:'Vēl nav žurnālu. Nospēlē partiju, un sesija parādīsies šeit.',jrConfirmDelete:'Vai dzēst šo žurnālu?',jrConfirmDeleteAll:'Vai dzēst VISUS žurnālus? To nevar atsaukt.',jrRetention:'Glabāt žurnālus',jrKeepForever:'Mūžīgi',jrKeepDays:'{n} dienas',jrCurrent:'pašreizējais',jrImported:'importēts',jrKeepMax:'Maksimums',jrKeepAll:'Bez ierobežojuma',jrKeepLogs:'{n} žurnāli',jrResizeList:'Mainīt saraksta izmēru',jrSaveAsPrompt:'Faila nosaukums',jrNoSql:'PDB eksports nav pieejams (sql.js nav ielādēts)',advResetDesc:'Rūpnīcas atiestatīšana: atjauno VISU — opcijas, stilus un motīvus, īsinājumtaustiņus, logus, statistiku un žurnālus — kā pavisam jaunam lietotājam. Segvārds, avatars, konts un serveris tiek saglabāti.',advCfgSync:'Automātiski sinhronizēt šos iestatījumus ar manu kontu (tikai reģistrētiem lietotājiem — glabājas šajā serverī)', cfgSyncApplied:'Iestatījumi sinhronizēti no tava konta', advCfgXmlSec:'PokerTH config.xml', advCfgXmlDesc:'Apmainies ar saviem iestatījumiem ar darbvirsmas un QML PokerTH klientiem (to fails ~/.pokerth/config.xml). Eksports ieraksta kopīgos iestatījumus (vārdu, attēlošanas opcijas, skaņas, galda izvēles, aklās likmes, stilus); imports piemēro tos šeit. Iestatījumi, ko tīmekļa klients nepazīst, failā paliek neskarti un tiek ierakstīti atpakaļ nākamajā eksportā.', advCfgExport:'Eksportēt config.xml', advCfgImport:'Importēt config.xml', cfgXmlExported:'config.xml eksportēts — ievieto to darbvirsmas klienta mapē ~/.pokerth/', cfgXmlImported:'config.xml importēts — kopīgie iestatījumi piemēroti', cfgXmlImportErr:'Imports neizdevās — šis nav derīgs PokerTH config.xml', cfgXmlReload:'Vai pārlādēt tūlīt, lai piemērotu visu (motīvus, kāršu komplektus, nosaukumus)?', advResetBtn:'Atjaunot noklusējumus',advResetConfirm:'Vai atjaunot visu uz rūpnīcas noklusējumiem (opcijas, stilus, īsinājumtaustiņus, statistiku)? Segvārds, avatars un konts tiek saglabāti. Lietotne tiks pārlādēta.',
  advFourColor:'4 krāsu komplekts (♦ zils, ♣ zaļš)',
  cardZoomToggle:'Palielināt manas kārtis',
  seatPokerth: 'PokerTH',
  sectionSeat: 'Vietas',    guestHint:'🌐 Viesa spēle pokerth.net — konts nav vajadzīgs.',
    srvOffline:'🏋️ Lokāli / treniņš', offlineHint:'🤖 Spēlē pret botiem — savienojums nav vajadzīgs.',
    srvPokerthNet:'🌐 Internets',
    // Wizard login (2 etapes)
    loginLead:'Kā tu vēlies spēlēt?',
    loginLeadSub:'Izvēlies režīmu, lai turpinātu.',
    loginNetTitle:'Internets',
    loginNetDesc:'Spēlē tiešsaistē, ar reitingu',
    loginOfflineTitle:'Lokāli / treniņš',
    loginOfflineDesc:'Viens pats pret botiem',
    loginLanTitle:'LAN / Dedicētais serveris',
    loginLanDesc:'Privāts serveris · lokālais tīkls',
    liveTables:'{n} aktīvi galdi', liveWaiting:'{n} spēlētāji gaida',
    liveOnline:'{n} spēlētāji tiešsaistē', liveToday:'{n} spēles šodien',
    loginChange:'Mainīt',
    srvSegNet:'Internets', srvSegOffline:'Treniņš', srvSegLan:'LAN',
    botDifficulty:'Botu grūtība', botEasy:'Viegli', botMixed:'Jaukti', botNormal:'Normāli', botHard:'Grūti',
    blindsNextTip:'pēc {n} partijas(-ām)', blindsEveryMin:'ik pēc {n} min', blindsUpHands:'{n} partijas', blindsUpMins:'{n} min',
    connect:'Savienoties', disconnect:'✕ Atvienoties', connecting:'Savienojas…',
    nickname:'Segvārds', password:'Parole', useTLS:'Lietot TLS',
    lan:'LAN / Privāts serveris (viesis)', privateGuest:'Privāts serveris — interneta viesis ✓',
    guest:'pokerth.net — interneta viesis', auth:'pokerth.net — reģistrēts konts',
    server:'PokerTH serveris', proxy:'WebSocket starpniekserveris', 
    quickGameBtn:'⚡ Pievienoties / ātrā spēle', configure:'⚙', createTable:'＋ Izveidot galdu',
};
