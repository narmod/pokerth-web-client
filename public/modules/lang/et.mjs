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
};

export default { meta, strings };
