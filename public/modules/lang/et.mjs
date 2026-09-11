// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lang/et.mjs — Estonian catalogue (self-contained).
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
  label: 'Eesti',
  dir: 'ltr',
  flag: '<svg class="lang-flag" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-label="Eesti"><rect width="60" height="13.33" y="0" fill="#0072CE"/><rect width="60" height="13.33" y="13.33" fill="#000000"/><rect width="60" height="13.34" y="26.67" fill="#FFFFFF"/></svg>',
};

export const strings = {
    // Notes de joueur + étiquettes (modules/notes, extra web)
    nvTitle:'Minu märkus', nvRating:'Hinnang', nvPlaceholder:'Maksab iga 3-beti…', nvSaved:'Salvestatud', nvTagNone:'Sildita', nvTagRed:'Ohtlik', nvTagOrange:'Agressiivne', nvTagYellow:'Jälgi', nvTagGreen:'Kala', nvTagBlue:'Kitsas', nvTagPurple:'Kaval', nvLabelPh:'Sildi nimi', nvLabelTip:'Nimeta see silt ümber — kehtib kõigile selle värviga mängijatele',
    ppMyStats:'Minu statistika',
    ppLocalTab:'Kohalik / treening',
    // Session stats, behind a button on the player card.
    piShowStats:'Näita sessiooni statistikat', piHideStats:'Peida sessiooni statistika',
    // Player profile window (parity: QML PokerthPlayerPage).
    rankingAvg:'Keskm.', rankingLast5:'Viimased 5:', rankingRecentGames:'Hiljutised mängud', rankingSeasons:'Hooajad', rankingLastLogin:'Viimane sisselogimine', ppOpen:'Mängija profiil', ppTitle:'Mängija profiil',
    // Private messages (parity: QML "Messages prives", 2.1.7+).
    pmTitle:'Privaatsõnumid', pmTooltip:'Privaatsõnumid', pmBtn:'Privaatsõnum', pmSend:'Saada', pmPlaceholder:'Sõnum…', pmDelete:'Kustuta see vestlus', pmDeleteConfirm:'Kas kustutada vestlus mängijaga {name}?', pmEmpty:'Vestlusi veel ei ole.', pmNoConv:'Vali vestlus.', pmNoMsg:'Sõnumeid veel ei ole.', pmMe:'Mina', pmNotFound:'Mängijat ei leitud', pmSelf:'Iseendale ei saa privaatsõnumit saata.', pmOffline:'Serveriga pole ühendust', pmUsage:'Kasutus: /msg <hüüdnimi> <sõnum>', pmAtTable:'Privaatsõnumid ei ole lauas saadaval.', pmRejected:'Privaatsõnumit ei õnnestunud kohale toimetada.', pmOfflinePartner:'Ei ole hetkel fuajees', pmGuest:'Külalised ei saa vestlussõnumeid saata', pmNotInLobby:'ei ole fuajees', pmPartnerGuest:'Külalised ei saa privaatsõnumeid vastu võtta.',
    // Server timeout warning popup (parity: timeoutWarningPopup, pokerth.qml).
    timeoutWarnTitle:'Ajalõpu hoiatus', timeoutWarnIdle:'Sinu ühendus katkeb tegevusetuse tõttu {s} sekundi pärast.', timeoutWarnAdmin:'Sa oled avatud mängu administraator ja mäng aegub {s} sekundi pärast.', timeoutWarnAfk:'Sa ei ole viimasel ajal mängus tegutsenud. Sind eemaldatakse mängust {s} sekundi pärast.', timeoutWarnExpired:'Ajalõpp saabus. Ühendus katkestatakse.', timeoutWarnExpiredGame:'Ajalõpp saabus. Sind eemaldatakse mängust.', timeoutWarnHint:'Loenduse peatamiseks klõpsa \u201cOK\u201d!', timeoutWarnOk:'OK', connLostTitle:'Ühendus katkes',
  invScanQr: 'Skanni liitumiseks', invCopyLink: 'Kopeeri link', invShareVia: 'Jaga…', invitedBanner: 'Sind on kutsutud lauda liituma',
  abClTabWeb: 'Veebiklient',
  abClTabUpstream: 'Paigaldatavad kliendid',
  abTabChangelog: 'Muudatuste logi',
  abClLoading: 'Laadimine…',
  abClNew: 'Uut', abClImprovements: 'Täiustused', abClBugfixes: 'Veaparandused', abClError: 'Muudatuste logi ei ole saadaval.',
  rkCalcTitle: 'Edetabeli arvutus:',
  rkCalcPoints: 'Koha punktid:',
  rkCalcFormula: 'Valem:',
  gameAdminBadge: 'Admin',
  gameAdminTip: 'Mängu administraator: alustab mängu ja saab mängijaid välja visata',
  hlColHands: 'Mängitud käed',
  hlComputing: 'Arvutamine…',
  helpTitle:'Abi', helpSearchPh:'Otsi abist…', helpWip:'See peatükk on kirjutamisel.', helpNoResults:'Tulemusi ei ole', advHelpBtn:'Näita menüüdes abi kirjet',
  jrImport: 'Impordi .pdb…',
  jrImportDone: 'Import: {ok} lisatud · {dup} juba olemas · {ko} loetamatu',

  jrUploadNet: 'Analüüsi pokerth.net-is\u2026',
  jrUploadFail: 'Üleslaadimine pokerth.net-i ebaõnnestus',

    advSecConn:'Ühendus', advNickRetry:'Proovi automaatselt uuesti, kui hüüdnimi on veel kasutusel', nickInUseRetry:'„{name}“ on veel kasutusel — uus katse {n} s pärast ({a}/{max})…', nickInUseGiveUp:'„{name}“ on pärast {max} katset endiselt kasutusel. Serveris on veel avatud varasem sessioon — proovi mõne minuti pärast uuesti või vali teine hüüdnimi.',
    // — i18n gap-fill (backup / trophies / back tooltip) —
    achTitle:'Auhinnad', advBackupSec:'Täielik varukoopia (veebiklient)', advBackupDesc:'Salvesta kõik, mis selles brauseris on, ühte faili: veebiseaded, teemad, kaardipakid, kohandatud istekohad, avataripilt, saavutused ja statistika — sealhulgas see, mis on kontoga sünkroonimiseks liiga suur. Sinu parooli ja sessiooni ei kaasata kunagi ning importimine liidab saavutused asendamise asemel, nii et edenemine ei lähe kaotsi.', advBackupExport:'Ekspordi varukoopia', advBackupImport:'Impordi varukoopia', advWinOpen:'Tõsta nupp kuldsena esile, kui selle aken on avatud', backTooltip:'Tagasi',
  advPolls: "Osale tooteküsitlustes",
  pollTitle: "Küsitlus",
  pollThanks: "Aitäh vastuse eest!",
  pollAnswers: "{n} vastus(t)",
  pollErr: "Vastust ei õnnestunud saata.",
    // ── Stats / HUD / range (session) ──
    gipTabStats:"Statistika",
    advStatsTrack:"Salvesta käte statistika",
    advHudOn:"Näita istekohtadel statistika HUD-i",
    advSecStatsExport:"Statistika eksport",
    advStatsExportDesc:"Ekspordi salvestatud käed .pdb-failina, mille saab importida PokerTH Trackerisse.",
    advStatsExportSession:"Ekspordi sessioon",
    advStatsExportAll:"Ekspordi kogu ajalugu",
    advPdbAutoSec:"Automaatne .pdb-fail",
    advPdbAutoDesc:"Kirjuta .pdb-logi arvutis olevasse kausta ja uuenda seda pärast iga kätt, nagu töölauakliendis. Ainult töölaua Chrome, Edge ja Opera.",
    advPdbAuto:"Kirjuta .pdb-fail automaatselt",
    advPdbAutoPick:"Vali kaust…",
    advPdbAutoNoFs:"See brauser ei saa kohalikku kausta kirjutada.",
    advPdbAutoFolder:"Kaust",
    hlSession:"Sessioon",
    hlHistory:"Ajalugu",
    hlExportPdbTip:"Ekspordi .pdb-na (imporditav PokerTH Trackerisse)",
    hlNoData:"Andmeid veel ei ole.",
    hlStatsTitle:"Statistika",
    hlWon:"Võidetud",
    hlTrend:"Trend",
    hlScopeSession:"sessioon",
    hlSeeRange:"Vaata vahemikku ▸",
    hlStyle:"Stiil",
    hlStyleVeryTight:"Väga kitsas",
    hlStyleTightPassive:"Kitsas-passiivne",
    hlStyleTightAggr:"Kitsas-agressiivne",
    hlStyleLoosePassive:"Lai-passiivne",
    hlStyleLooseAggr:"Lai-agressiivne",
    hlStyleHyperAggr:"Ülimalt agressiivne",
    hlStyleEstimate:"Hinnang — vähem kui 25 kätt",
    hlRangeLegend:"Diagonaal = paarid · üleval paremal = sama masti · all vasakul = eri masti",
    hlRangeShowdown:"Showdown'i vahemik",
    hlPosition:"Positsioon",
    hlPlayers:"Mängijad",
    hlAllF:"Kõik",
    hlAllM:"Kõik",
    hlHandSing:"käsi",
    hlHandPlur:"kätt",
    // Boot splash (écran de chargement initial — parité login QML)
    bootLoading:"Laadimine…",
    bootReady:"Valmis.",
    bootRetry:"Proovi uuesti",
    bootErrorMsg:"Ebastabiilne ühendus — mõnda faili ei õnnestunud laadida.",
    bootMissing:"Puuduvad failid: {n}",
    buttonsAuto:"Automaatne (laud)",
    buttonsFlat:"Lame",
    advRemoveGone:"Eemalda lahkunud mängijad ja korralda lauakohad ümber",
    advConfirmSocial:"Küsi kinnitust enne mängija kutsumist või eiramist",
    advWinnerPopup:"Võitja aken käe lõpus",
    // PlayerWinnerOverlay (badge gagnant sur la boîte, parité QML)
    winnerBadge:'VÕITJA',
    // GameStatusBar (bandeau d'info de jeu, parité QML §7)
    gsbTotal:'Kokku:', gsbBets:'Panused:', gsbGame:'Mäng:', gsbHand:'Käsi:',
  advUiGeneral:'Üldine', advUiNetwork:'Võrk', advShowTooltips:'Näita kohtspikreid', advShowAppTitle:'Näita sisselogimisekraanil PokerTH pealkirja', advDisableSplash:'Keela käivitusel avaekraan', advDontTranslatePoker:'Ära tõlgi pokkeritermineid (Check, Call, Raise)', advNA:'veeb', advLanguage:'Keel', advDefCommunity:'Vaikimisi kogukond', advSecReactions:'Reaktsioonid', advDisableReactions:'Keela emoji-reaktsioonid', advNetStateColor:'Näita avatari nurgas võrgu oleku värvi',
  showPlayers: `Näita mängijaid`,
  footJoin: `Liitu`,
  spectatingBadge: `Jälgimine`,
  reportGameTitle: `Teata sobimatust mängu nimest`, reportGameConfirm: `Teata`, reportGameMsg: `Kas soovid kindlasti teatada mängu nimest „{name}“ kui sobimatust?`, reportGameAccepted: `Server võttis mängu nime kohta teate vastu. Aitäh.`, reportGameDup: `Sellest mängu nimest on juba teine mängija teatanud.`, reportGameError: `Mängu nimest teatamisel tekkis viga.`,
  reportAvatarTitle: `Teata sobimatust avatarist`, reportAvatarMsg: `Kas soovid kindlasti teatada mängija „{name}“ avatarist kui sobimatust?`, reportAvatarAccepted: `Server võttis avatari kohta teate vastu. Aitäh.`, reportAvatarDup: `Sellest avatarist on juba teine mängija teatanud.`, reportAvatarError: `Avatarist teatamisel tekkis viga.`, piReportAvatar: `Teata avatarist`,
  avImgNotImage: `Palun vali pildifail.`, avImgTooLarge: `See pilt on liiga suur. Palun vali väiksem.`, avImgInvalid: `Vigane pilt.`, avImgFailed: `Seda pilti ei õnnestunud töödelda.`,
  buttonsPokerth: 'PokerTH',
  hdrWaitingPlayers:'Ootan mängijaid', hdrSpectatingWait:'Jälgimine \u2014 ootan järgmist kätt', wpWaitingPlayers:'Ootan mängijaid …', wpFillBots:'Täida arvutimängijatega', wpStartGame:'Alusta mängu', wpLeaveGame:'Lahku mängust', wpInvite:'Kutsu sõpru', advInviteLink:'Näita ooteruumis nuppu „Kutsu sõpru“', sharedTableNotFound:'🔗 Jagatud lauda ei leitud — see võis juba lõppeda.',
  assist:'Abi',assistPopOut:'Eralda omaette aknasse',assistDock:'Dokk tagasi paneeli',advCatUI:'Kasutajaliides',advCatStyle:'Stiil',advCatSound:'Heli',advCatLocal:'Kohalik mäng',advCatNetwork:'Võrgumäng',advCatInternet:'Internetimäng',advCatAvatar:'Hüüdnimed / avatarid',advCatLog:'Logisõnumid',advCatReset:'Taasta vaikeseaded',
  advStyleDesc:'Kaardipakid, laua kalev, istekohtade kujundus ja värviteema.',advStyleOpen:'Ava teemavalija',advSoundDesc:'Mängu heli, muusika helitugevus ja reaktsioonide vaigistus.',advSoundOpen:'Heli ja helitugevuse seaded',advLocalDesc:'Harjuta bottide vastu: täida oma lauas tühjad kohad.',advLocalOpen:'Täida kohad bottidega',advNetworkDesc:'Võõrusta mängu oma kohtvõrgus (LAN).',advSoonTag:'Varsti tulekul',advInternetDesc:'Sa oled ühendatud PokerTH serveriga.',advSrvLabel:'Server',advInternetOpen:'Vaheta serverit / katkesta ühendus',advSrvUnknown:'\u2014', advSrvBridge:'Puhvermasina sild',advAvatarDesc:'Sinu hüüdnimi ja avataripilt.',advAvatarOpen:'Muuda hüüdnime / avatari',advLogDesc:'Mängusisene logi ja vestluse ülekate.',advLogOpen:'Ava logi',advJournalOpen:'Halda logisid\u2026',advSecJournal:'Sessiooni logid',advJournalDesc:'Sirvi, ekspordi, analüüsi ja kustuta sessiooni logisid nagu ametlikus kliendis.',jrTitle:'Logid',jrGame:'Mäng:',jrGameN:'Mäng {n}',jrAllGames:'Kõik mängud',jrPreview:'Eelvaade:',jrSearch:'Otsi\u2026',jrExportHtml:'Ekspordi HTML-ina',jrExportTxt:'Ekspordi txt-na',jrSaveAs:'Salvesta kui\u2026',jrSelect: "Vali…", jrSelectCancel: "Tühista valik", jrSelectHint: "Vali korraga mitu kustutatavat logi — Ctrl (⌘) + klõps lisab ühe, Shift + klõps valib vahemiku, klaviatuuril Shift + ↑/↓", jrDeleteN: "Kustuta ({n})", jrConfirmDeleteN: "Kas kustutada {n} logi? Seda ei saa tagasi võtta.", jrDelete:'Kustuta',jrDeleteAll:'Kustuta kõik',jrAnalyze:'Analüüsi logifaili\u2026',jrAnalyzeLbl:'Käte logi:',jrBack:'Tagasi eelvaatesse',jrHand:'Käsi',jrEmpty:'Logisid veel ei ole. Mängi üks käsi ja sessioon ilmub siia.',jrConfirmDelete:'Kas kustutada see logi?',jrConfirmDeleteAll:'Kas kustutada KÕIK logid? Seda ei saa tagasi võtta.',jrRetention:'Säilita logisid',jrKeepForever:'Igavesti',jrKeepDays:'{n} päeva',jrCurrent:'praegune',jrImported:'imporditud',jrKeepMax:'Maksimum',jrKeepAll:'Piiranguta',jrKeepLogs:'{n} logi',jrResizeList:'Muuda loendi suurust',jrSaveAsPrompt:'Faili nimi',jrNoSql:'PDB eksport ei ole saadaval (sql.js ei ole laaditud)',advResetDesc:'Tehaseseadete taastamine: taastab KÕIK — valikud, stiilid ja teemad, kiirklahvid, aknad, statistika ja logid — nagu täiesti uuel kasutajal. Hüüdnimi, avatar, konto ja server säilivad.',advCfgSync:'Sünkrooni need seaded automaatselt minu kontoga (ainult registreeritud sisselogimine — hoitakse selles serveris)', cfgSyncApplied:'Seaded sünkrooniti sinu kontolt', advCfgXmlSec:'PokerTH config.xml', advCfgXmlDesc:'Vaheta oma seadeid töölaua ja QML PokerTH klientidega (nende fail ~/.pokerth/config.xml). Eksport kirjutab ühised seaded (nimi, kuvamisvalikud, helid, laua eelistused, blindid, stiilid); import rakendab need siin. Seaded, mida veebiklient ei tunne, jäävad failis puutumata ja kirjutatakse järgmisel ekspordil tagasi.', advCfgExport:'Ekspordi config.xml', advCfgImport:'Impordi config.xml', cfgXmlExported:'config.xml eksporditud — aseta see töölauakliendi kausta ~/.pokerth/', cfgXmlImported:'config.xml imporditud — ühised seaded rakendatud', cfgXmlImportErr:'Import ebaõnnestus — see ei ole korrektne PokerTH config.xml', cfgXmlReload:'Kas laadida kohe uuesti, et kõik rakenduks (teemad, pakid, nimed)?', advResetBtn:'Taasta vaikeseaded',advResetConfirm:'Kas taastada kõik tehaseseaded (valikud, stiilid, kiirklahvid, statistika)? Hüüdnimi, avatar ja konto säilivad. Rakendus laaditakse uuesti.',
  advFourColor:'4-värviline pakk (\u2666 sinine, \u2663 roheline)',
  cardZoomToggle:'Suurenda minu kaarte',
  seatPokerth: 'PokerTH',
};

export default { meta, strings };
