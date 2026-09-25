// ── help/content/yo.mjs — Yoruba (Yorùbá) help corpus ────────────────────
//
// Same structure as en.mjs (reference): chapters[] → { id, icon, title,
// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.
// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand
// names of the rules chapter stay in English, as in the other help corpora.
export const help = {
  chapters: [
    {
      id: "start", icon: "🚀", title: "Bíbẹ̀rẹ̀",
      sections: [
        { id: "modes",
          t: "Ọ̀nà mẹ́ta láti ṣeré",
          b: [
            "Lórí ojú ìwọlé, yan bí o ṣe fẹ́ ṣeré."],
          list: [
            "Ayélujára — ṣeré lórí ayélujára lórí olùpín ìjọba pokerth.net pẹ̀lú ipò. O nílò àkáǹtì pokerth.net; forúkọ sílẹ̀ lọ́fẹ̀ẹ́ lórí pokerth.net.",
            "Agbègbè / ìdánrawò — ṣeré láìsí ayélujára pẹ̀lú àwọn bot. Kò sí nǹkan láti ṣètò, ó ń ṣiṣẹ́ láìsí ìsopọ̀, ó sì ń ṣí ife ẹ̀yẹ bí o ṣe ń tẹ̀síwájú.",
            "LAN / Olùpín àdáni — sopọ̀ mọ́ olùpín PokerTH àṣírí lórí nẹ́tíwọ̀ọ̀kì agbègbè rẹ tàbí lórí kọ̀ǹpútà rẹ."] },
        { id: "lan",
          t: "LAN / olùpín àdáni",
          b: [
            "Ọ̀nà kẹta ń sopọ̀ mọ́ olùpín PokerTH èyíkéyìí tí ìwọ tàbí ọ̀rẹ́ kan ń ṣiṣẹ́ — lórí nẹ́tíwọ̀ọ̀kì ilé, lórí VPS àṣírí, níbikíbi. Tẹ àdírẹ́sì àti ibùdó olùpín, sàmì sí TLS bí olùpín bá ń lo ibùdó tí a ti pa àṣírí mọ́, kí o sì wọlé pẹ̀lú orúkọ ìnagijẹ (ìwọlé àlejò ń ṣiṣẹ́ bí olùpín bá gbà á láàyè). Lẹ́yìn náà gbogbo nǹkan ní tábìlì ń ṣiṣẹ́ gẹ́gẹ́ bí ó ti rí lórí olùpín ìjọba."] },
        { id: "famboard",
          t: "Àkójọ olùborí ẹbí",
          b: [
            "Lórí olùpín àṣírí àti eré LAN nìkan, oníbàárà ń tọ́jú ìṣirò gbogbo ìgbà fún orúkọ ìnagijẹ kọ̀ọ̀kan — àwọn ọwọ́ àti eré tí a ṣe àti tí a borí, èrè tó pọ̀ jù, ìtẹ̀léra ìborí tó dára jù — ó sì ń pín wọn nípasẹ̀ olùpín kí gbogbo ẹ̀rọ tí ó yí tábìlì ká lè rí àkójọ kan náà. A kì í tọpinpin eré pokerth.net lọ́nà yìí rárá, a sì ń tọ́jú ìṣirò ọ̀nà ìdánrawò lọ́tọ̀ pátápátá.",
            "Nínú àwọn eré wọ̀nyí, bọ́tìnì ife ẹ̀yẹ ń ṣí fèrèsé ipò lórí ojú-ewé LAN rẹ̀: gbogbo àwọn òṣèré, tí a lè tò gẹ́gẹ́ bí ọ̀pọ̀ òṣùwọ̀n."] },
        { id: "language",
          t: "Èdè",
          b: [
            "Ojú olùlò wà ní èdè 81. Yí i padà nígbàkúùgbà nínú Àṣàyàn ìlọsíwájú (àkójọ gíà) lábẹ́ Ojú olùlò. Àwọn ọ̀rọ̀ ìgbésẹ̀ poker (Fold, Check, Call, Bet, Raise, All-In) máa ń wà ní èdè Gẹ̀ẹ́sì gẹ́gẹ́ bí àṣà, bí ó ti rí nínú oníbàárà kọ̀ǹpútà. Orúkọ àwọn ọwọ́ poker náà wà ní èdè Gẹ̀ẹ́sì."] },
        { id: "pwa",
          t: "Fi sórí ẹ̀rọ gẹ́gẹ́ bí ìṣàfilọ́lẹ̀",
          b: [
            "Oníbàárà yìí jẹ́ Progressive Web App: o lè fi sórí ẹ̀rọ láti inú àkójọ aṣàwákiri rẹ (tàbí bọ́tìnì ìfisórí ní orí ojú-ewé) láti ní ìṣàfilọ́lẹ̀ ojú kíkún pẹ̀lú àmì tirẹ̀. Nígbà tí o bá ti fi sórí ẹ̀rọ, ó ń ṣí lójú ẹsẹ̀, ọ̀nà ìdánrawò sì ń ṣiṣẹ́ láìsí ayélujára pátápátá."],
          note: "Lórí Android àti Chrome/Edge kọ̀ǹpútà, bọ́tìnì ìfisórí ń ṣe gbogbo rẹ̀. Lórí iPhone/iPad Apple gba ìfisórí láàyè nípasẹ̀ Safari nìkan: bọ́tìnì Pín → “Fi kún Ojú Ilé” — oníbàárà ń fi àwọn ìgbésẹ̀ wọ̀nyí hàn nígbà tí ó bá pọn dandan. Bọ́tìnì náà ń pòórá nígbà tí a bá ti fi ìṣàfilọ́lẹ̀ sórí ẹ̀rọ." },
        { id: "platforms",
          t: "Pẹpẹ àti aṣàwákiri",
          b: [
            "Oníbàárà ń ṣiṣẹ́ nínú aṣàwákiri òde-òní èyíkéyìí lórí ètò èyíkéyìí — Windows, macOS, Linux, Android, iOS. Àwọn ẹ̀yà díẹ̀ gbára lé API aṣàwákiri tuntun; nígbà tí API kan kò bá sí, ẹ̀yà náà ń fi ara rẹ̀ pamọ́ tàbí ṣàlàyé ìdí dípò kí ó bàjẹ́. Àwọn ìyàtọ̀ pàtàkì tí ó yẹ kí o mọ̀:"],
          list: [
            "Chrome / Edge (kọ̀ǹpútà): gbogbo nǹkan ń ṣiṣẹ́, títí kan kíkọ ìwé-àkọsílẹ̀ .pdb sínú fódà.",
            "Firefox: gbogbo nǹkan àfi kíkọ ìwé-àkọsílẹ̀ .pdb sínú fódà (API náà kò tíì sí).",
            "Safari / iOS: ìfisórí nípasẹ̀ Pín → Fi kún Ojú Ilé; kò sí ìgbọ̀nrìrì; ojú kíkún ní ìdíwọ́ lórí iPhone; ohùn ń bẹ̀rẹ̀ lẹ́yìn ìfọwọ́kàn rẹ àkọ́kọ́.",
            "Android: àtìlẹ́yìn kíkún nínú aṣàwákiri Chromium, títí kan ìgbọ̀nrìrì àti ìhùwàsí bọ́tìnì Padà."] },
        { id: "avatar",
          t: "Orúkọ ìnagijẹ àti afàtá",
          b: [
            "Yan orúkọ ìnagijẹ rẹ àti afàtá rẹ lórí ojú ìwọlé kí o tó sopọ̀. Lórí pokerth.net, orúkọ ìnagijẹ rẹ ni orúkọ àkáǹtì rẹ; a ń pín afàtá pẹ̀lú àwọn òṣèré mìíràn nípasẹ̀ olùpín afàtá.",
            "A ń fi afàtá rẹ ránṣẹ́ nígbà ìsopọ̀, gbogbo òṣèré sì ń rí èyí kan náà. Bí o bá yí i padà nígbà tí o ti sopọ̀, afàtá tuntun yóò bẹ̀rẹ̀ iṣẹ́ láti ìsopọ̀ rẹ tó kàn. A kì í fi lẹ́tà àkọ́kọ́ (Aa) ránṣẹ́: àwọn òṣèré mìíràn ń rí afàtá àkọ́kọ́."] }
      ]
    },
    {
      id: "rules", icon: "🃏", title: "Òfin poker",
      sections: [
        { id: "basics",
          t: "Texas Hold’em ní ṣókí",
          b: [
            "PokerTH ń ṣe No-Limit Texas Hold’em. Òṣèré kọ̀ọ̀kan ń gba káàdì àṣírí méjì (káàdì àpò). Lẹ́yìn náà a ń gbé káàdì gbangba márùn-ún kalẹ̀ ní ṣíṣí láàárín tábìlì. Ọwọ́ káàdì márùn-ún tó dára jù láti inú àkópọ̀ èyíkéyìí ti káàdì rẹ méjèèjì àti káàdì gbangba márààrún ló ń borí pot."] },
        { id: "blinds",
          t: "Blinds àti bọ́tìnì olùpín káàdì",
          b: [
            "Ṣáájú ọwọ́ kọ̀ọ̀kan, tẹ́tẹ́ dandan méjì ń bẹ̀rẹ̀ pot: blind kékeré àti blind ńlá, tí àwọn òṣèré méjì tí ó wà ní òsì bọ́tìnì olùpín káàdì ń gbé kalẹ̀. Bọ́tìnì náà ń lọ ìjókòó kan ní ìtọ́sọ́nà aago lẹ́yìn ọwọ́ kọ̀ọ̀kan, nítorí náà gbogbo ènìyàn ń san blinds ní àkókò tirẹ̀. Blinds ń ga sí i déédéé bí eré ṣe ń tẹ̀síwájú.",
            "Lórí tábìlì, a fi àwo sàmì sí bọ́tìnì àti blinds: D (olùpín káàdì), SB (blind kékeré), BB (blind ńlá)."] },
        { id: "streets",
          t: "Àwọn yíká tẹ́tẹ́ mẹ́rin",
          list: [
            "Pre-flop — lẹ́yìn pínpín káàdì àpò, yíká àkọ́kọ́ ń bẹ̀rẹ̀ ní òsì blind ńlá.",
            "Flop — a ń ṣí káàdì gbangba mẹ́ta, lẹ́yìn náà yíká tẹ́tẹ́.",
            "Turn — káàdì gbangba kẹrin, lẹ́yìn náà yíká tẹ́tẹ́ mìíràn.",
            "River — káàdì gbangba karùn-ún àti ìkẹyìn, lẹ́yìn náà yíká tẹ́tẹ́ ìkẹyìn."],
          b: [
            "Yíká tẹ́tẹ́ ń parí nígbà tí gbogbo òṣèré tí ó ṣì wà nínú ọwọ́ bá ti fi iye kan náà sínú pot (tàbí tí ó wà ní all-in)."] },
        { id: "actions",
          t: "Ohun tí o lè ṣe ní àkókò rẹ",
          list: [
            "Fold — fi ọwọ́ sílẹ̀. A ju káàdì rẹ sílẹ̀, o kò sì sí nínú ìdíje fún pot mọ́.",
            "Check — kọjá láìta tẹ́tẹ́. Ó ṣeé ṣe nígbà tí kò bá sí nǹkan láti ṣe call sí nìkan.",
            "Call — bá tẹ́tẹ́ lọ́wọ́lọ́wọ́ dọ́gba.",
            "Bet — ṣí tẹ́tẹ́ nígbà tí ẹnikẹ́ni kò tíì ta tẹ́tẹ́ ní yíká yìí.",
            "Raise — fi kún tẹ́tẹ́ tí ó wà. Raise tó kéré jù dọ́gba pẹ̀lú tẹ́tẹ́ tàbí raise tí ó ṣáájú.",
            "All-In — fi gbogbo àkójọ rẹ sí i. O wà nínú ọwọ́ títí dé iye tí o ti bò."] },
        { id: "showdown",
          t: "Showdown àti pot tí a pín",
          b: [
            "Bí ó bá ju òṣèré kan lọ tí ó kù lẹ́yìn yíká tẹ́tẹ́ river, a ń ṣí àwọn káàdì, ọwọ́ tó dára jù sì ń borí — a ń fi ọwọ́ olùborí hàn nísàlẹ̀ àwọn káàdì gbangba. Nígbà tí òṣèré kan bá wà ní all-in pẹ̀lú iye tí ó kéré sí tẹ́tẹ́ kíkún, a ń ṣẹ̀dá pot ẹ̀gbẹ́: òṣèré kọ̀ọ̀kan lè borí apá pot tí ó dá sí nìkan. Ọwọ́ tí ó dọ́gba ń pín pot.",
            "Kì í ṣe gbogbo ènìyàn ni ó gbọ́dọ̀ fi hàn: bẹ̀rẹ̀ láti ọ̀dọ̀ òṣèré tí ó ṣe tẹ́tẹ́ tàbí raise ìkẹyìn, a ń ṣí ọwọ́ kan nìkan bí ó bá borí ohun tí a ti fi hàn tẹ́lẹ̀. Ẹnikẹ́ni tí ó ní ẹ̀tọ́ láti ju káàdì rẹ̀ sílẹ̀ ń fi wọ́n pamọ́, ó sì ń gba bọ́tìnì Fi hàn láti ṣí wọn bí ó bá fẹ́."] },
        { id: "hands",
          t: "Ìtòlẹ́sẹẹsẹ ọwọ́",
          b: [
            "Láti aláìlágbára jù sí alágbára jù:"],
          list: [
            "1. High Card — kò sí àkópọ̀; káàdì tó ga jù ló ń pinnu.",
            "2. One Pair — káàdì méjì tí iye wọn jọra.",
            "3. Two Pair — pair méjì ọ̀tọ̀ọ̀tọ̀.",
            "4. Three of a Kind — káàdì mẹ́ta tí iye wọn jọra.",
            "5. Straight — káàdì márùn-ún tẹ̀léra (Ace lè ga tàbí kéré).",
            "6. Flush — káàdì márùn-ún àwọ̀ kan náà.",
            "7. Full House — Three of a Kind pẹ̀lú pair.",
            "8. Four of a Kind — káàdì mẹ́rin tí iye wọn jọra.",
            "9. Straight Flush — straight tí gbogbo rẹ̀ jẹ́ àwọ̀ kan náà.",
            "10. Royal Flush — láti Mẹ́wàá dé Ace, gbogbo rẹ̀ àwọ̀ kan náà. Ọwọ́ tó dára jù tí ó ṣeé ṣe."] }
      ]
    },
    {
      id: "game", icon: "🎮", title: "Ojú eré",
      sections: [
        { id: "actionbar",
          t: "Ọ̀pá ìgbésẹ̀",
          b: [
            "Nígbà tí ó bá kan ọ́, ọ̀pá ìgbésẹ̀ nísàlẹ̀ ń tàn pẹ̀lú bọ́tìnì tó tó mẹ́rin: Fold (pupa), Check / Call (búlúù), Bet / Raise (ewé — ìgbésẹ̀ àkọ́kọ́ tí a ṣe àfihàn rẹ̀) àti All-In (pupa dúdú). Bọ́tìnì Check / Call ń fi iye gangan láti ṣe call hàn; Bet / Raise ń fi iye tí o fẹ́ fi sí i hàn. Lẹ́yìn river, All-In lè di bọ́tìnì Fi hàn láti ṣí àwọn káàdì rẹ."] },
        { id: "betctl",
          t: "Yíyan tẹ́tẹ́ rẹ",
          b: [
            "Ṣètò iye raise pẹ̀lú àyè nọ́ńbà, ọ̀pá ìfàsẹ́yìn, tàbí bọ́tìnì kíákíá 1/3 · 1/2 · Pot (ìpín pot lọ́wọ́lọ́wọ́). A ń yí iye sí nọ́ńbà yíká fúnra rẹ̀, a sì ń pa á mọ́ láàárín raise tó kéré jù àti tó pọ̀ jù tí òfin gbà. Bí o bá fẹ́ràn láti ronú ní blind ńlá, àṣàyàn kan ń fi gbogbo iye hàn ní BB dípò chips."] },
        { id: "preselect",
          t: "Yíyan ìgbésẹ̀ ṣáájú",
          b: [
            "Ṣáájú àkókò rẹ, o lè pèsè ìgbésẹ̀ kan sílẹ̀: tẹ bọ́tìnì kan, yóò sì ní ààlà wúrà pẹ̀lú àmì wúrà kékeré. Nígbà tí àkókò rẹ bá dé, ìgbésẹ̀ náà ń ṣẹlẹ̀ lójú ẹsẹ̀. Fold tí a pèsè sílẹ̀ ń di Check fúnra rẹ̀ nígbà tí check bá jẹ́ ọ̀fẹ́ — o kì í ṣe fold lásán rárá. Àwọn yíyàn ṣáájú ń tún ara wọn tò ní ọwọ́ tuntun kọ̀ọ̀kan, ní ìyípadà yíká àti ní showdown, a sì ń fagi lé wọn bí ipò bá yí padà (fún àpẹẹrẹ bí iye call bá yí padà)."] },
        { id: "automodes",
          t: "Ọ̀nà aládàáṣiṣẹ́",
          b: [
            "Àkójọ lẹ́gbẹ̀ẹ́ bọ́tìnì ìgbésẹ̀ ní ọ̀nà eré mẹ́ta: Pẹ̀lú ọwọ́, Check/Call aládàáṣiṣẹ́ àti Check/Fold aládàáṣiṣẹ́. Ọ̀nà aládàáṣiṣẹ́ ń ṣeré fún ọ títí o fi padà — títẹ ìgbésẹ̀ èyíkéyìí pẹ̀lú ọwọ́ ń dá ọ padà sí Pẹ̀lú ọwọ́ lójú ẹsẹ̀."] },
        { id: "readtable",
          t: "Kíka tábìlì",
          b: [
            "Àpótí òṣèré kọ̀ọ̀kan ń fi afàtá, orúkọ, àkójọ àti tẹ́tẹ́ lọ́wọ́lọ́wọ́ hàn. A fi àwo D / SB / BB sàmì sí olùpín káàdì àti blinds. Àmì aláwọ̀ lórí àpótí ń fi ìgbésẹ̀ ìkẹyìn òṣèré hàn; ọ̀pá búlúù tín-ín-rín ń ka àkókò ìrònú rẹ̀ sẹ́yìn. Àpótí òṣèré tí ó kàn ń tàn; àpótí tìrẹ ń ní férémù wúrà tí ń lù nígbà tí ó bá kan ọ́.",
            "Ọ̀pá ipò lókè tábìlì ń fi àpapọ̀ pot hàn, àwọn tẹ́tẹ́ yíká lọ́wọ́lọ́wọ́, ìpele (Pre-flop, Flop, Turn, River) àti nọ́ńbà eré àti ọwọ́. Àwọn òṣèré tí ó ti ṣe fold ní káàdì tí ó ṣe kedere díẹ̀; àwọn tí ó ti jáde ti ṣókùnkùn. Ní òpin ọwọ́, fèrèsé olùborí lè ṣàkópọ̀ ẹni tí ó borí nǹkan — a lè pa á nínú àṣàyàn."] },
        { id: "seatlayout",
          t: "Ìtò ìjókòó",
          b: [
            "Gẹ́gẹ́ bí àfikún wẹ́ẹ̀bù, a lè yan ìtò àpótí àwọn òṣèré nínú Àṣàyàn ìlọsíwájú → Àwọn ìjókòó: Aládàáṣiṣẹ́ ń tẹ̀lé oníbàárà ìjọba (àyè tí ó dúró ní ìdúró, ìbùú tí a ṣírò ní ìdùbúlẹ̀), tàbí fipá mú ìtò Ìdúró tàbí Ìdùbúlẹ̀ — Tìrẹ sì ń jẹ́ kí o gbé ìjókòó kọ̀ọ̀kan fúnra rẹ: ọ̀nà àtúnṣe kan ń hàn níbi tí o ti ń fa àpótí kọ̀ọ̀kan sí ibi tí o fẹ́ gangan, a sì ń fi ìtò náà pamọ́."] },
        { id: "zoom",
          t: "Ìsúnmọ́ tábìlì (fóònù)",
          b: [
            "Lórí ojú kékeré, bọ́tìnì awòsánmọ̀ ń sún tábìlì mọ́ (2×), o sì lè gbé e pẹ̀lú ìka — ọ̀pá ìgbésẹ̀ nìkan ló dúró sí ibì kan; àpótí tìrẹ náà ń tóbi sí i, ìwòye sì ń padà sí i nígbà tí ó bá kan ọ́. Ìwòye ń tẹ̀lé ìjókòó tó ń ṣiṣẹ́ fúnra rẹ̀, ó sì ń jìnnà sẹ́yìn ní showdown fún ìwòye gbogbo. A lè pa èyí nínú Àṣàyàn ìlọsíwájú. Ní àkókò rẹ, bí káàdì gbangba kò bá hàn, ẹ̀dà kékeré wọn ń hàn ní òkè tábìlì; tẹ̀ ẹ́ láti fò sí àwọn káàdì kí o sì padà."],
          note: "Lórí fóònù àti tábìlẹ́ẹ̀tì, a dí ìsúnmọ́ fífún ti aṣàwákiri ní àkọ́kọ́ kí ìsúnmọ́ má bàa ṣẹlẹ̀ láìròtẹ́lẹ̀ láàárín ọwọ́; tún tàn án nínú Àṣàyàn ìlọsíwájú → Ojú olùlò bí o bá fẹ́." },
        { id: "protections",
          t: "Ààbò lọ́wọ́ wíwò àti Call àìròtẹ́lẹ̀",
          b: [
            "Ààbò àṣàyàn méjì: Ààbò wíwò ń pa káàdì rẹ mọ́ títí o fi fọwọ́ kàn wọ́n (ó wúlò nígbà tí ẹnìkan lè rí ojú rẹ), ààbò Call àìròtẹ́lẹ̀ sì ń dí bọ́tìnì Call fún ìgbà kúkúrú lẹ́yìn raise ńlá, kí ìfọwọ́kàn tí a pinnu fún call kékeré má bàa kan iye raise láìròtẹ́lẹ̀. Àwọn méjèèjì wà nínú Àṣàyàn ìlọsíwájú."] }
      ]
    },
    {
      id: "info", icon: "📊", title: "Pánẹ́lì ìsọfúnni",
      sections: [
        { id: "open",
          t: "Ṣíṣí pánẹ́lì",
          b: [
            "Nígbà eré, pánẹ́lì ìsọfúnni ń ṣí láti orí ojú-ewé (tàbí Alt+L / Alt+I), ó sì ní ojú-ewé mẹ́ta: Ìwé-àkọsílẹ̀, Àǹfààní àti Ìṣirò. Lórí fóònù ó ń léfòó lórí tábìlì; lórí ojú ńlá ó jẹ́ fèrèsé tí a lè fà àti yí ìwọ̀n rẹ̀ padà — di ìmúmú ⣿ mú láti gbé e, àwọn ẹ̀gbẹ́ láti yí ìwọ̀n padà. A ń rántí ipò rẹ̀."] },
        { id: "log",
          t: "Ìwé-àkọsílẹ̀ eré",
          b: [
            "Ojú-ewé Ìwé-àkọsílẹ̀ ń kọ gbogbo eré sílẹ̀ ní ọwọ́ kọ̀ọ̀kan: blinds, ìgbésẹ̀ kọ̀ọ̀kan pẹ̀lú iye, káàdì tí a ṣí àti àwọn olùborí, pẹ̀lú àwọ̀ fún kíka kíákíá. Bọ́tìnì ìkójáde ń fi ìwé-àkọsílẹ̀ pamọ́ gẹ́gẹ́ bí fáìlì bí o bá fẹ́ tún wo ìgbà eré kan lẹ́yìn náà."] },
        { id: "odds",
          t: "Àǹfààní (olùṣàbójútó àǹfààní)",
          b: [
            "Ojú-ewé Àǹfààní ń fi hàn, fún ọwọ́ rẹ lọ́wọ́lọ́wọ́, àǹfààní lójú ẹsẹ̀ láti parí pẹ̀lú ọ̀kọ̀ọ̀kan nínú ẹ̀ka ọwọ́ 10 — láti High Card dé Royal Flush — ọ̀kọ̀ọ̀kan pẹ̀lú àmì rẹ̀, ìdá-ọgọ́rùn-ún àti ọ̀pá. Ìfihàn ń di eérú nígbà tí o bá ṣe fold. Ó ń lo káàdì tìrẹ àti káàdì gbangba nìkan: kò rí nǹkan tí àwọn alátakò rẹ kò fi hàn."] },
        { id: "journal",
          t: "Ìwé-àkọsílẹ̀ ọwọ́ àti fèrèsé Ìwé-àkọsílẹ̀",
          b: [
            "Yàtọ̀ sí ìwé-àkọsílẹ̀ lójú ẹsẹ̀, a ń kọ ọwọ́ kọ̀ọ̀kan tí o ṣe sílẹ̀ nínú aṣàwákiri rẹ, ní ọ̀nà kan náà pẹ̀lú fáìlì ìwé-àkọsílẹ̀ .pdb ti oníbàárà ìjọba. Fèrèsé Ìwé-àkọsílẹ̀ (Àṣàyàn ìlọsíwájú → Ìfiránṣẹ́ ìwé-àkọsílẹ̀ → Ṣàkóso ìwé-àkọsílẹ̀…) ń ṣe àkójọ àwọn ìgbà eré rẹ, ó sì ń jẹ́ kí o ṣiṣẹ́ lórí wọn: wo ìgbà eré kan pẹ̀lú ìwádìí àti àfihàn, ṣe àlẹ̀mọ́ gẹ́gẹ́ bí eré, kó jáde gẹ́gẹ́ bí HTML tàbí ọ̀rọ̀ lásán, fi fáìlì .pdb àtilẹ̀wá pamọ́, tàbí kó .pdb tí oníbàárà kọ̀ǹpútà kọ sílẹ̀ wọlé. A lè pa ìgbà eré rẹ́ ní ọ̀kọ̀ọ̀kan tàbí gbogbo rẹ̀ lẹ́ẹ̀kan (pẹ̀lú ìmúdájú), ètò ìtọ́jú aládàáṣiṣẹ́ sì lè tọ́jú ọjọ́ 7, 30, 90, 180 tàbí 365 tó kẹ́yìn nìkan. A kì í yọ ìwé-àkọsílẹ̀ tí o kó wọlé fúnra rẹ kúrò láìfọwọ́kàn rárá. Ètò kejì ń ṣètò iye ìgbà eré tí a ń tọ́jú, a sì lè fa ọ̀wọ̀n àkójọ kí ó fẹ̀ sí i.",
            "Láti pa ọ̀pọ̀ ìgbà eré rẹ́ lẹ́ẹ̀kan, bọ́tìnì Yan… ń sọ àkójọ di àpótí àmì: sàmì sí àwọn tí o fẹ́ pa rẹ́, Pa rẹ́ sì ń yọ gbogbo wọn kúrò lẹ́yìn ìmúdájú kan ṣoṣo. Lórí kọ̀ǹpútà o tún lè lo Ctrl (⌘) + tẹ láti fi ìgbà eré kún un ní ọ̀kọ̀ọ̀kan, tàbí Shift + tẹ láti mú ìbú kan.",
            "Bọ́tìnì Ṣàyẹ̀wò ń ṣe àyẹ̀wò ọwọ́ lórí ìgbà eré kan, ó sì lè fi ìwé-àkọsílẹ̀ ránṣẹ́ sí iṣẹ́ àyẹ̀wò pokerth.net. Gbogbo nǹkan wà lórí ẹ̀rọ rẹ àfi bí o bá kó o jáde tàbí gbé e sókè ní gbangba."] },
        { id: "logopts",
          t: "Àṣàyàn ìwé-àkọsílẹ̀",
          b: [
            "Nínú Àṣàyàn ìlọsíwájú → Ìfiránṣẹ́ ìwé-àkọsílẹ̀ o lè tan tàbí pa ìkọsílẹ̀, kí o sì yan àlàfo kíkọ, pẹ̀lú ètò mẹ́ta kan náà bí oníbàárà kọ̀ǹpútà: lẹ́yìn ìgbésẹ̀ kọ̀ọ̀kan, lẹ́yìn ọwọ́ kọ̀ọ̀kan (àkọ́kọ́) tàbí lẹ́yìn eré kọ̀ọ̀kan. Àṣàyàn mìíràn ń kọ fáìlì .pdb sínú fódà tí o yàn, ó ń ṣe àtúnṣe rẹ̀ ní àlàfo yẹn, àti lẹ́ẹ̀kan sí i nígbà tí o bá kúrò ní ojú-ewé, kí irinṣẹ́ mìíràn lè tẹ̀lé eré lójú ẹsẹ̀."],
          note: "Kíkọ sínú fódà agbègbè nílò File System Access API: Chrome, Edge àti Opera kọ̀ǹpútà nìkan. Níbòmíràn, àṣàyàn náà ń ṣàlàyé ara rẹ̀, ìkójáde pẹ̀lú ọwọ́ láti fèrèsé Ìwé-àkọsílẹ̀ sì wà síbẹ̀. Aṣàwákiri lè rọ́pò fáìlì nìkan, kò lè fi kún un, nítorí náà irinṣẹ́ tí ń ka .pdb gbọ́dọ̀ tún un ṣí lẹ́yìn ìyípadà kọ̀ọ̀kan." },
        { id: "assist",
          t: "Olùrànlọ́wọ́ (agbára ọwọ́)",
          b: [
            "Ní òkè ojú-ewé Àǹfààní, àsíá olùrànlọ́wọ́ ń ka ọwọ́ rẹ fún ọ. Ṣáájú flop ó ń dárúkọ ọwọ́ ìbẹ̀rẹ̀ rẹ, ó sì ń fún un ní ìràwọ̀; láti flop lọ ó ń fi àkópọ̀ tó dára jù lọ́wọ́lọ́wọ́ hàn, àti lẹ́yìn ìṣàfarawé kíákíá, àǹfààní rẹ láti borí ọwọ́ ní ìdá-ọgọ́rùn-ún, pẹ̀lú ìwọ̀n àwọ̀ láti pupa (aláìlágbára) dé ewé (alágbára). Bí olùṣàbójútó àǹfààní, ó ń lo ìsọfúnni tí o lè rí nìkan.",
            "Ọ̀nà ìfihàn méjì wà nínú Àṣàyàn ìlọsíwájú → Àwọn ìjókòó: Àwọn apá (búlọ́ọ̀kù mẹ́wàá) tàbí ọ̀pá ìlọsíwájú àtijọ́. A lè pa gbogbo ẹ̀yà olùrànlọ́wọ́ nínú Àṣàyàn ìlọsíwájú → Olùrànlọ́wọ́."] },
        { id: "assistwin",
          t: "Olùrànlọ́wọ́ gẹ́gẹ́ bí fèrèsé tí ń léfòó",
          b: [
            "A lè yọ búlọ́ọ̀kù olùrànlọ́wọ́ kúrò nínú pánẹ́lì sínú fèrèsé kékeré tirẹ̀ tí ó máa ń wà lókè nígbà gbogbo: lo bọ́tìnì ìyọkúrò lórí búlọ́ọ̀kù náà, lẹ́yìn náà gbé e kí o sì yí ìwọ̀n rẹ̀ padà níbikíbi lórí tábìlì — ó wúlò láti máa wo agbára ọwọ́ rẹ láìṣí gbogbo pánẹ́lì. Bọ́tìnì ìdápadà ń dá a padà sínú ojú-ewé Àǹfààní, a sì ń rántí ipò rẹ̀. Nínú pánẹ́lì, ìmúmú kan láàárín Olùrànlọ́wọ́ àti àǹfààní ń jẹ́ kí o pín àyè láàárín wọn méjèèjì."] },
        { id: "stats",
          t: "Ìṣirò",
          b: [
            "Ojú-ewé Ìṣirò ń tọpinpin ìgbà eré rẹ: àwọn ọwọ́ tí a ṣe, flop tí a rí, showdown, ìwọ̀n ìborí àti bẹ́ẹ̀ bẹ́ẹ̀ lọ. A lè pa ìtọpinpin ìṣirò nínú Àṣàyàn ìlọsíwájú."] },
        { id: "hud",
          t: "HUD ìṣirò lórí àwọn ìjókòó",
          b: [
            "HUD ń so àpótí ìṣirò kékeré mọ́ ẹ̀gbẹ́ ìjókòó òṣèré kọ̀ọ̀kan, tí a kọ́ láti inú àwọn ọwọ́ tí o ti kọ sílẹ̀ nínú ìwé-àkọsílẹ̀ rẹ: iye ọwọ́ tí a ṣàkíyèsí, lẹ́yìn náà VPIP (bí ó ṣe máa ń fi owó sí i pre-flop fúnra rẹ̀ tó), PFR (raise pre-flop) àti AF (ìwọ̀n ìjàgídíjàgan), pẹ̀lú àwọ̀ láti onísùúrù dé oníjàgídíjàgan. Nísàlẹ̀ wọn, àmì kan ń ṣàkópọ̀ òṣèré náà ní ọ̀rọ̀ tí ó rọrùn — Afọkànbalẹ̀, onísùúrù; Aláìfarabalẹ̀, oníjàgídíjàgan àti bẹ́ẹ̀ bẹ́ẹ̀ lọ — lẹ́gbẹ̀ẹ́ àwo kékeré kan tí apá rẹ̀ tí ó tàn ń kà láti òsì sí ọ̀tún fún afọkànbalẹ̀ sí aláìfarabalẹ̀, àti láti ìsàlẹ̀ sí òkè fún onísùúrù sí oníjàgídíjàgan. Àmì náà ń hàn láti ọwọ́ àkọ́kọ́, ṣùgbọ́n ó ṣì ń ṣókùnkùn títí dé ọwọ́ 25, nígbà tí ó di ohun tí a lè gbẹ́kẹ̀lé. Tẹ àpótí kan fún fèrèsé àlàyé pẹ̀lú gbogbo nọ́ńbà (3-bet, continuation bet, fold sí 3-bet, ìgbìyànjú steal, ìwọ̀n showdown…), kí o sì fa àpótí kan láti gbé e bí ó bá bo nǹkan kan.",
            "HUD mọ ohun tí o ti rí ní tábìlì tìrẹ nìkan — ó ń ka ìwé-àkọsílẹ̀ ọwọ́ agbègbè rẹ, nítorí náà ìkọsílẹ̀ gbọ́dọ̀ wà ní títàn, nọ́ńbà sì ń ní ìtumọ̀ lẹ́yìn ọwọ́ tó pọ̀ tó. Ó wà ní pípa ní àkọ́kọ́: tàn án nínú Àṣàyàn ìlọsíwájú → Olùrànlọ́wọ́."] },
        { id: "handsbtn",
          t: "Ìwòye àkópọ̀ ọwọ́",
          b: [
            "Àmì àwọn ọwọ́ poker lórí aṣọ tábìlì ń ṣí ìwòye kíákíá ti àkópọ̀ 10 nígbàkúùgbà — ó wúlò nígbà tí o ń kẹ́kọ̀ọ́. A lè fi pamọ́ nínú Àṣàyàn ìlọsíwájú."] }
      ]
    },
    {
      id: "chat", icon: "💬", title: "Ìjíròrò àti àwùjọ",
      sections: [
        { id: "panels",
          t: "Ìjíròrò gbọ̀ngàn àti ìjíròrò eré",
          b: [
            "Ìjíròrò kan wà ní gbọ̀ngàn àti ọ̀kan ní tábìlì. Lórí fóònù, ìjíròrò eré ń léfòó lórí tábìlì; lórí ojú ńlá ó jẹ́ fèrèsé tí a lè fà àti yí ìwọ̀n rẹ̀ padà. Àmì kan lórí bọ́tìnì ìjíròrò ń ka àwọn ìfiránṣẹ́ tí a kò tíì kà."] },
        { id: "typing",
          t: "Olùrànlọ́wọ́ títẹ̀",
          list: [
            "Tab ń parí orúkọ ìnagijẹ — tẹ Tab lẹ́ẹ̀kan sí i láti lọ láàárín àwọn tí ó bá a mu.",
            "↑ / ↓ ń lọ láàárín ìtàn ìfiránṣẹ́ tìrẹ.",
            "Bọ́tìnì emoji ń ṣí aṣàyàn kíkún; títẹ : tún ń dábàá emote bí o ṣe ń tẹ̀."] },
        { id: "emotes",
          t: "Emote àti smiley",
          b: [
            "Ìjíròrò ń yí kóòdù kúkúrú emote padà gẹ́gẹ́ bí oníbàárà kọ̀ǹpútà ìjọba ṣe ń ṣe: tẹ orúkọ kan láàárín àmì kọ́lọ́nì, yóò sì di emoji — :sunny: → ☀, :+1: → 👍, :joy: → 😂, :four_leaf_clover: → 🍀… a ṣe àtìlẹ́yìn fún kóòdù tí ó ju 1,900 lọ (gbogbo àkójọ GitHub). A tún ń yí smiley ọ̀rọ̀ àtijọ́ padà: :-) ;) :D xD :P <3 àti nǹkan bí ọgọ́rin mìíràn.",
            "Títẹ : ń ṣí fèrèsé àbá tí ó ń parí kóòdù bí o ṣe ń tẹ̀ (↑/↓ láti yan, Tab tàbí Enter láti gbà). A lè pa ìyípadà emoji pátápátá nínú Àṣàyàn ìlọsíwájú → Ìjíròrò."] },
        { id: "commands",
          t: "Àṣẹ ìjíròrò",
          b: [
            "Ìjíròrò ń lóye àṣẹ tí ó bẹ̀rẹ̀ pẹ̀lú /. Àwọn ẹlòmíràn ń rí méjì:"],
          keys: [
            ["/me <text>", "Ìfiránṣẹ́ ìgbésẹ̀, tí a fi hàn bí “* orúkọrẹ ọ̀rọ̀”   ⟦/me <ọ̀rọ̀>⟧"],
            ["/emoji <emoji>", "Ń ṣe ìhùwàsí emoji (ohun tí aṣàyàn ìhùwàsí ń fi ránṣẹ́)   ⟦/emoji <emoji>⟧"]] },
        { id: "diagcmds",
          t: "Àṣẹ àyẹ̀wò",
          b: [
            "Gbogbo àwọn yòókù jẹ́ agbègbè: ìwọ nìkan ló ń rí ìdáhùn, a kò sì fi nǹkan kan ránṣẹ́ sí tábìlì. Tẹ /help láti rí gbogbo wọn. Àwọn tí ó wúlò jù:"],
          keys: [
            ["/help", "Fi gbogbo àṣẹ hàn   ⟦/help⟧"],
            ["/update", "Ṣàyẹ̀wò ẹ̀yà tuntun kí o sì sọ di tuntun   ⟦/update⟧"],
            ["/lang <code>", "Yí èdè padà (fún àpẹẹrẹ /lang fr)   ⟦/lang <code>⟧"],
            ["/sound on|off", "Tan / pa ohùn eré   ⟦/sound on|off⟧"],
            ["/zoom", "Tan / pa awòsánmọ̀ tábìlì   ⟦/zoom⟧"],
            ["/clear", "Pa ìjíròrò rẹ́ lórí ẹ̀rọ yìí   ⟦/clear⟧"],
            ["/table", "Ìsọfúnni eré lọ́wọ́lọ́wọ́ (blinds, òṣèré, àkójọ)   ⟦/table⟧"],
            ["/diag · /netdbg · /fps", "Àyẹ̀wò ipò oníbàárà, nẹ́tíwọ̀ọ̀kì àti ìwọ̀n férémù   ⟦/diag · /netdbg · /fps⟧"],
            ["/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg", "Àtúnṣe ìlọsíwájú (káàdì, ìlànà, ohùn, ibi ìpamọ́, ìjókòó)   ⟦/carddbg · /msglog · /audiodbg · /storage · /logdump · /seatdbg⟧"],
            ["/copy", "Da ìdáhùn àṣẹ ìkẹyìn kọ sí agekuru   ⟦/copy⟧"]] },
        { id: "privatemsg",
          t: "Ìfiránṣẹ́ àṣírí",
          b: [
            "Kọ̀wé sí òṣèré kan láìjẹ́ pé gbogbo gbọ̀ngàn ń kà á. Àpò lẹ́tà lẹ́gbẹ̀ẹ́ orúkọ kan nínú àkójọ òṣèré ń ṣí ìjíròrò pẹ̀lú rẹ̀; àpò lẹ́tà ní orí gbọ̀ngàn ń tún ìkẹyìn ṣí. A ń tọ́jú ìjíròrò lórí ẹ̀rọ yìí, wọ́n sì ṣì wà nígbà tí o bá padà, nítorí náà ìjíròrò tí o tún bẹ̀rẹ̀ lẹ́yìn ọjọ́ díẹ̀ ní ìtàn tirẹ̀ — nọ́ńbà pupa lórí àpò lẹ́tà ń fi ohun tí o kò tíì kà hàn, apẹ̀rẹ̀ ìdọ̀tí nínú àkọlé fèrèsé sì ń pa ìjíròrò rẹ́ pátápátá."],
          keys: [
            ["/msg <nickname> <text>", "Fi ìfiránṣẹ́ àṣírí ránṣẹ́ láti ìjíròrò gbọ̀ngàn   ⟦/msg <orúkọ ìnagijẹ> <ọ̀rọ̀>⟧"],
            ["/msg \"<nickname with spaces>\" <text>", "Bákan náà, nígbà tí orúkọ ìnagijẹ bá ní àlàfo   ⟦/msg \"<orúkọ ìnagijẹ pẹ̀lú àlàfo>\" <ọ̀rọ̀>⟧"]],
          note: "Ìfiránṣẹ́ kò lè ju lẹ́tà 128 lọ. Olùpín kì í fi ìfiránṣẹ́ àṣírí jíṣẹ́ fún òṣèré tí ó jókòó ní tábìlì tí ó ń ṣeré lọ́wọ́, a sì ń tọ́jú ìtàn nínú aṣàwákiri yìí nìkan — kò tẹ̀lé ọ lọ sí ẹ̀rọ mìíràn." },
        { id: "reactions",
          t: "Ìhùwàsí emoji",
          b: [
            "Bọ́tìnì ìhùwàsí ń ṣí aṣàyàn ìhùwàsí ìṣípòpadà 30 (🎉, 😂, 😱, 🔥…) tí ń ṣiṣẹ́ pẹ̀lú ipa kan lókè ìjókòó rẹ, tí gbogbo ènìyàn ní tábìlì ń rí — títí kan àwọn òṣèré lórí oníbàárà kọ̀ǹpútà. A lè pa ìhùwàsí pátápátá nínú Àṣàyàn ìlọsíwájú."] },
        { id: "translate",
          t: "Láti lóye gbogbo ènìyàn",
          b: [
            "Nígbà tí ìtúmọ̀ ìjíròrò bá wà ní títàn, bọ́tìnì ìtúmọ̀ ń hàn lórí ìlà tí eku rẹ wà — tàbí lórí ìlà tí o fọwọ́ kàn, lórí ojú ìfọwọ́kàn — ó sì ń fi ìfiránṣẹ́ náà hàn ní èdè rẹ. A lè fi í hàn nígbà gbogbo lórí ìlà kọ̀ọ̀kan nínú Àṣàyàn ìlọsíwájú → Ìjíròrò, níbi tí àlàyé àwọn ìkékúrú tábìlì tí ó wọ́pọ̀ (gg, nh, utg…) náà wà."],
          note: "Ìtúmọ̀ ń lo iṣẹ́ Google Translate, ó sì ń ṣiṣẹ́ nínú gbogbo aṣàwákiri — ó nílò ìsopọ̀ ayélujára nìkan. A ń fi ìfiránṣẹ́ ránṣẹ́ sí iṣẹ́ ìtúmọ̀ nígbà tí o bá tẹ bọ́tìnì ìtúmọ̀ rẹ̀ nìkan, kì í ṣe láìfọwọ́kàn rárá." },
        { id: "social",
          t: "Àwọn òṣèré: àkọsílẹ̀, ìpè, ìfojúfò",
          b: [
            "Tẹ òṣèré èyíkéyìí — ní tábìlì tàbí nínú àkójọ gbọ̀ngàn — láti ṣí káàdì rẹ̀: àkọsílẹ̀ àti ìṣirò, pè é sí eré rẹ, tàbí fojú fò ó (a ń fi ìfiránṣẹ́ ìjíròrò rẹ̀ pamọ́; a lè dá ìfojúfò padà nígbàkúùgbà). A lè tan ìmúdájú ṣáájú ìpè/ìfojúfò nínú àṣàyàn."] }
      ]
    },
    {
      id: "lobby", icon: "🏛️", title: "Gbọ̀ngàn àti eré",
      sections: [
        { id: "list",
          t: "Àkójọ eré",
          b: [
            "Gbọ̀ngàn ń ṣe àkójọ gbogbo tábìlì lórí olùpín. Ìwọlé kọ̀ọ̀kan ń fi iye òṣèré hàn, irú eré, àmì àgádágodo nígbà tí a bá nílò ọ̀rọ̀ aṣínà tàbí ìpè, àti àmì ipò: “Ó ń dúró” (ewé — eré kò tíì bẹ̀rẹ̀, o lè darapọ̀ bí ìjókòó bá wà), “Ó ń lọ lọ́wọ́” (àwọ̀ gbígbóná — a lè wò ó lójú ẹsẹ̀ bí a bá gba òǹwòran láàyè) àti “Ó ti tì” (ó ṣókùnkùn). Tábìlì tí ó kún ń fi iye kíkún hàn, bí 10/10; àwọ̀ àmì ń tẹ̀lé àkòrí tí ó ń ṣiṣẹ́.",
            "Àkójọ àlẹ̀mọ́ ń dín àkójọ kù gẹ́gẹ́ bí oníbàárà kọ̀ǹpútà, yíyàn kọ̀ọ̀kan le ju ti ìṣáájú lọ: eré ṣíṣí nìkan → tún fi tábìlì tí ó kún pamọ́ → lẹ́yìn náà èyí tí kì í ṣe àṣírí nìkan, àṣírí nìkan, tàbí eré ipò nìkan. A ń rántí yíyàn rẹ. Àyè ìwádìí ń rí eré nípasẹ̀ orúkọ, àmì àwọn òṣèré sì ń ṣí àkójọ gbogbo ènìyàn lórí ayélujára, tí a lè wá nínú rẹ̀ àti tò."] },
        { id: "join",
          t: "Dídarapọ̀ àti wíwò",
          b: [
            "Yan eré ṣíṣí kan kí o sì darapọ̀ — àgádágodo túmọ̀ sí pé a nílò ọ̀rọ̀ aṣínà. A lè wo eré tí ó ń lọ lọ́wọ́ tí ó gba òǹwòran láàyè lójú ẹsẹ̀: o ń rí tábìlì àti ìjíròrò, ṣùgbọ́n káàdì àpò ṣì farapamọ́, o kò sì lè gbé ìgbésẹ̀."] },
        { id: "gameinfo",
          t: "Ìsọfúnni eré",
          b: [
            "Ṣáájú kí o tó darapọ̀, káàdì ìsọfúnni eré ń fi gbogbo ohun tí ó ṣàpèjúwe tábìlì hàn: irú eré, blinds àti bí wọ́n ṣe ń ga sí i (ìlọ́po méjì tàbí àkójọ pẹ̀lú ọwọ́), owó ìbẹ̀rẹ̀, àkókò ìgbésẹ̀, ìdádúró láàárín ọwọ́, àti àwọn tí ó ti jókòó."] },
        { id: "create",
          t: "Ṣíṣẹ̀dá eré",
          b: [
            "Ṣẹ̀dá tábìlì tìrẹ: orúkọ, iye òṣèré, owó ìbẹ̀rẹ̀, blind kékeré àkọ́kọ́ àti ìtòlẹ́sẹẹsẹ ìgbésókè, àkókò ìgbésẹ̀, àti bóyá a gba òǹwòran láàyè. Irú eré mẹ́rin ló wà: Déédéé (ẹnikẹ́ni), àwọn tí a forúkọ wọn sílẹ̀ nìkan, pẹ̀lú ìpè nìkan, àti Ranking (ó kà fún ipò ìjọba — a kò gba ọ̀rọ̀ aṣínà láàyè níbẹ̀). A lè fi ètò tí o fẹ́ràn pamọ́ kí o sì tún gbé wọn."] },
        { id: "invites",
          t: "Ìpè",
          b: [
            "Àwọn òṣèré lè pè ọ́ sí tábìlì wọn; o ń gba ìkìlọ̀ tí o lè gbà tàbí kọ̀. Ìpè ni ọ̀nà kan ṣoṣo láti wọ eré tí ó jẹ́ pẹ̀lú ìpè nìkan."] }
      ]
    },
    {
      id: "pthnet", icon: "🌐", title: "pokerth.net",
      sections: [
        { id: "account",
          t: "Àkáǹtì rẹ",
          b: [
            "Olùpín ayélujára ìjọba ni pokerth.net. Láti ṣeré níbẹ̀ o nílò àkáǹtì pokerth.net ọ̀fẹ́ — forúkọ sílẹ̀ lórí ojú-òpó náà, lẹ́yìn náà wọlé níbí pẹ̀lú orúkọ ìnagijẹ àti ọ̀rọ̀ aṣínà kan náà. Oníbàárà wẹ́ẹ̀bù yìí ń sopọ̀ mọ́ olùpín kan náà pẹ̀lú oníbàárà kọ̀ǹpútà: àkáǹtì kan náà, tábìlì kan náà, ipò kan náà, o sì lè jókòó ní tábìlì pẹ̀lú àwọn òṣèré kọ̀ǹpútà."] },
        { id: "ranked",
          t: "Eré ipò àti sáà",
          b: [
            "Eré irú Ranking ń kà fún ipò sáà ìjọba. Àkọsílẹ̀ rẹ nínú ìṣàfilọ́lẹ̀ ń fi hàn ìgbà tí o darapọ̀, Ipò rẹ ní sáà lọ́wọ́lọ́wọ́, Àmì, àròpín àti eré tí o ṣe, pẹ̀lú àbájáde rẹ tuntun. Eré déédéé (tí kì í ṣe ti ipò) jẹ́ fún ìgbádùn nìkan, kò sì yí nǹkan kan padà."] },
        { id: "rankhow",
          t: "Bí a ṣe ń ṣírò ipò",
          b: [
            "Nínú eré ipò kọ̀ọ̀kan, ipò tí o parí sí ń mú àmì wá: 15 fún àkọ́kọ́, lẹ́yìn náà 9, 6, 4, 3, 2 àti 1 títí dé keje; ìkẹjọ dé ìkẹwàá kò gba nǹkan kan. Tábìlì kan ń pín àmì 40 lápapọ̀.",
            "Àmì rẹ kì í ṣe àròpọ̀ àwọn àmì wọ̀nyí ṣùgbọ́n àròpín rẹ fún eré kọ̀ọ̀kan, tí a ṣàtúnṣe pẹ̀lú ìwọ̀n kan tí ń pọ̀ sí i pẹ̀lú iye eré tí a ṣe: àbájáde rere díẹ̀ kò tó láti dúró lókè, ó tún nílò ìdúróṣinṣin — bí o ṣe ń ṣeré sí i, bẹ́ẹ̀ ni Àmì rẹ ń súnmọ́ àròpín rẹ gidi. Sáà kọ̀ọ̀kan ń gba oṣù mẹ́ta: ní ìyípadà a ń pamọ́ gbogbo nǹkan, àwọn ìkà sì ń bẹ̀rẹ̀ láti òdo, àwọn sáà àtẹ̀yìnwá sì ṣì wà. Nínú eré, bọ́tìnì pẹpẹ ìṣẹ́gun ń fi ipò sáà àwọn òṣèré tábìlì rẹ hàn."],
          note: "Olùpín ipò pokerth.net ló ń ṣètò ìwọ̀n àmì àti àgbékalẹ̀ gangan, wọ́n sì lè yí padà; àwọn ojú-ewé lórí ojú-òpó ni ìtọ́kasí." },
        { id: "rankings",
          t: "Àwọn ojú-ewé ipò",
          b: [
            "Ohun ipò ń ṣí ipò ìjọba PokerTH, tí a lè wá nípasẹ̀ òṣèré, pẹ̀lú àwọn ipò àwùjọ (BBC, WEC). Bí ipò kò bá ṣe pàtàkì sí ọ, a lè fi ohun náà pamọ́ nínú Àṣàyàn ìlọsíwájú → Àwùjọ."] },
        { id: "cups",
          t: "Àwọn ife àwùjọ: BBC àti WeCup",
          b: [
            "Àwùjọ méjì ń ṣe ìdíje tiwọn lórí pokerth.net, ọ̀kọ̀ọ̀kan pẹ̀lú ojú-òpó àti ipò tirẹ̀. Best Brainies Cup (BBC) jẹ́ ìdíje onípele tí a bí ní 2013: o ń gòkè láti Step 1 dé Step 4, sáà tuntun sì ń bẹ̀rẹ̀ lẹ́yìn eré Step 4 kọ̀ọ̀kan, nígbà tí a bá fún ẹnìkan ní ife. WeCup (WEC) ní ìwọ̀n tirẹ̀, tí ó tàn kálẹ̀ jù — àmì 75 fún ipò àkọ́kọ́, lẹ́yìn náà 45, 30, 20… — àmì rẹ̀ sì ń ṣàtúnṣe àròpín rẹ gẹ́gẹ́ bí iye eré tí o ti ṣe ní ìfiwéra pẹ̀lú àwọn ọmọ ẹgbẹ́ mìíràn.",
            "Àwọn ipò méjèèjì ń ṣí láti bọ́tìnì ife ẹ̀yẹ, lẹ́gbẹ̀ẹ́ ipò PokerTH. Ètò tábìlì àwọn ìdíje wọ̀nyí wà gẹ́gẹ́ bí àpẹẹrẹ nígbà tí o bá ń ṣẹ̀dá eré (BBC Step 1 dé 4, WEC, WEC Monthly Final àti WEC Grand Final), kí o lè ṣe ìdánrawò lábẹ́ ipò kan náà. Láti kópa, o gbọ́dọ̀ forúkọ sílẹ̀ lórí ojú-òpó ife tí ó kàn."],
          note: "A lè fi àwọn àkóónú wọ̀nyí pamọ́ lẹ́ẹ̀kan nínú Àṣàyàn ìlọsíwájú → Àwùjọ bí àwọn ife kò bá wù ọ́." },
        { id: "forumcups",
          t: "Ife àpéjọ àti ìṣẹ̀lẹ̀",
          b: [
            "Àpéjọ pokerth.net tún ń gbàlejò Monthly Cup, ìdíje oṣooṣù níbi tí a ti ń pín àwọn òṣèré sí tábìlì Gold, Silver àti Bronze kí a tó dé akọni oṣù náà ládé, pẹ̀lú ife pàtàkì lẹ́ẹ̀kọ̀ọ̀kan jálẹ̀ ọdún.",
            "A ń tẹ ìforúkọsílẹ̀, àkókò, ètò tábìlì àti àbájáde jáde lórí àpéjọ, a sì ń ṣe àwọn eré lórí olùpín ìjọba bí èyíkéyìí mìíràn. Àkáǹtì pokerth.net tó láti tẹ̀lé àbájáde; láti wọ ife kan, lo àkọlé àpéjọ tí ó bá a mu."] },
        { id: "forumnews",
          t: "Ìròyìn àpéjọ ní gbọ̀ngàn",
          b: [
            "Bọ́tìnì ìwé ìròyìn ní orí gbọ̀ngàn ń ṣí àwọn àròkọ tuntun láti àpéjọ pokerth.net, ìwọlé kan fún àkọlé kọ̀ọ̀kan, àpéjọ kọ̀ọ̀kan pẹ̀lú àwọ̀ tirẹ̀. Àmì lórí bọ́tìnì ń ka àwọn àròkọ tí a kò tíì kà; ṣíṣí àròkọ kan (ojú-ewé tuntun) ń sàmì sí i bí èyí tí a ti kà, “Sàmì sí gbogbo rẹ̀ bí èyí tí a ti kà” sì ń pa gbogbo rẹ̀ rẹ́ lẹ́ẹ̀kan.",
            "Àfikún wẹ́ẹ̀bù ni èyí: a lè fi bọ́tìnì pamọ́ nínú Àṣàyàn ìlọsíwájú (“Bọ́tìnì àpéjọ ní orí gbọ̀ngàn”).",
            "Ojú-ewé “Àwọn ìṣẹ̀lẹ̀” ń fi eré BBC tí ń bọ̀ hàn àti Monthly Cup tó kàn pẹ̀lú iye àwọn òṣèré tí ó ti forúkọ sílẹ̀, àti àwọn olùborí BBC, WEC àti Monthly Cup tuntun. Àkókò wà ní àkókò agbègbè rẹ, ìfọwọ́kàn sì ń ṣí ojú-òpó àwùjọ. Àṣàyàn “Fi àkóónú àwùjọ hàn (BBC / WEC)” ń fi ojú-ewé yìí pamọ́."] },
        { id: "avatars",
          t: "Afàtá àti àsíá",
          b: [
            "Lórí pokerth.net, a ń pín afàtá rẹ fún àwọn òṣèré mìíràn nípasẹ̀ olùpín afàtá, a sì lè fi àsíá orílẹ̀-èdè kékeré hàn lórí àpótí òṣèré. Àwọn méjèèjì jẹ́ àṣàyàn, a sì lè ṣètò wọn nínú àṣàyàn."] }
      ]
    },
    {
      id: "offline", icon: "🏋️", title: "Ọ̀nà ìdánrawò",
      sections: [
        { id: "what",
          t: "Kí ni ó jẹ́",
          b: [
            "Ọ̀nà agbègbè / ìdánrawò jẹ́ eré kíkún pẹ̀lú alátakò kọ̀ǹpútà: kò sí ìsopọ̀, kò sí àkáǹtì, kò sí ohun tí o lè pàdánù. Nígbà tí o bá ti fi ìṣàfilọ́lẹ̀ sórí ẹ̀rọ (tàbí tí o ti ṣèbẹ̀wò lẹ́ẹ̀kan), ó ń ṣiṣẹ́ láìsí ayélujára pátápátá — ó dára fún kíkọ́ eré, dídánwò ojú olùlò tàbí lílo àkókò ní ọ̀nà ọkọ̀ òfurufú."] },
        { id: "setup",
          t: "Ṣíṣètò eré",
          b: [
            "Yan iye alátakò, owó ìbẹ̀rẹ̀, blinds àti ìtòlẹ́sẹẹsẹ ìgbésókè, àti ìyára eré. A lè ṣàtúnṣe ìtò àwọn bot àti ìṣòro wọn nínú Àṣàyàn ìlọsíwájú → Eré agbègbè — láti alátakò pẹ̀lẹ́ dé tábìlì àdàpọ̀ tí ó le jù."] },
        { id: "trophies",
          t: "Àwọn ife ẹ̀yẹ",
          b: [
            "Ọ̀nà ìdánrawò ní ìlọsíwájú tirẹ̀: ife ẹ̀yẹ 28 ní ẹ̀ka mẹ́fà (ìlọsíwájú, ọgbọ́n, ọ̀nà eré, àwọn ọ̀nà, ìgbádùn àti àṣírí kan) ń ṣí bí o ṣe ń ṣeré — àwọn ọwọ́ tí a ṣe, eré tí a borí, bluff ńlá, ọwọ́ àrà àti bẹ́ẹ̀ bẹ́ẹ̀ lọ. Ìlọsíwájú ife ẹ̀yẹ rẹ ń kójọ pọ̀, ó sì ń dapọ̀ láàárín ẹ̀rọ nígbà tí ìmúṣọ̀kan ètò àkáǹtì bá ń ṣiṣẹ́."] },
        { id: "learn",
          t: "Ibi tó dára láti kẹ́kọ̀ọ́",
          b: [
            "Gbogbo ohun tí ó wà nínú àwọn orí yòókù ń ṣiṣẹ́ níbí náà: olùṣàbójútó àǹfààní, ìfihàn olùrànlọ́wọ́, yíyàn ṣáájú, ọ̀nà àbùjá kọ́kọ́rọ́. Ọ̀nà ìdánrawò ni ibi tó dára jù láti gbìyànjú wọn láìsí ìfúnpá kí o tó lọ sí pokerth.net."] }
      ]
    },
    {
      id: "style", icon: "🎨", title: "Ọ̀nà àti ohùn",
      sections: [
        { id: "themes",
          t: "Àwọn àkòrí",
          b: [
            "Ẹ̀ka Ọ̀nà nínú Àṣàyàn ìlọsíwájú ń yí ìrísí gbogbo oníbàárà padà. Àwọn àpẹẹrẹ ń ṣètò gbogbo nǹkan pẹ̀lú ìfọwọ́kàn kan (kasínò ewé àtijọ́, ìrísí ìjọba PokerTH…); nísàlẹ̀ wọn, àwọn apá ọ̀tọ̀ọ̀tọ̀ ń jẹ́ kí o ṣàtúnṣe àwọn àwọ̀, aṣọ tábìlì àti ojú káàdì lọ́tọ̀ọ̀tọ̀ — yí apá èyíkéyìí padà, àdàpọ̀ rẹ yóò sì di àkòrí tìrẹ. A ń yan ọ̀nà dúdú, ìmọ́lẹ̀ tàbí aládàáṣiṣẹ́ nínú Ojú olùlò, yíyàn rẹ sì ń ṣiṣẹ́ lójú ẹsẹ̀, lórí gbogbo ojú, a sì ń rántí wọn."] },
        { id: "tablelook",
          t: "Tábìlì, káàdì, ìjókòó",
          b: [
            "Yàtọ̀ sí àkòrí, a lè pàrọ̀ ọ̀pọ̀ nǹkan lọ́tọ̀ọ̀tọ̀: ìsàlẹ̀ tábìlì, àwọn káàdì, ẹ̀yìn káàdì (bá àwọn káàdì mu fúnra rẹ̀ tàbí kó àwòrán tìrẹ wọlé), àwo olùpín káàdì àti blinds, ọ̀nà bọ́tìnì ìgbésẹ̀, àti àpò ìjókòó pípé tí ń yí ìrísí àpótí òṣèré padà. Yan gbogbo nǹkan nínú Àṣàyàn ìlọsíwájú → Ọ̀nà; àwọn ìyípadà ń hàn lójú ẹsẹ̀ ní tábìlì."] },
        { id: "music",
          t: "Aṣeré orin",
          b: [
            "Ohun orin nínú àkójọ orí ojú-ewé ń ṣí aṣeré orin lounge kékeré: yan orin láti inú àkójọ orin, ṣe é/dá dúró, èyí tó ṣáájú/èyí tó kàn, dà á pọ̀, àti tún orin kan ṣe, gbogbo àkójọ tàbí kò sí. A ń rántí ìró, orin tí a yàn àti ọ̀nà àtúnṣe. Ìṣeré kì í bẹ̀rẹ̀ fúnra rẹ̀ rárá — aṣàwákiri nílò ìfọwọ́kàn — aṣeré náà sì dá dúró pátápátá yàtọ̀ sí ohùn eré.",
            "Àtàǹpàkò méjì nísàlẹ̀ orúkọ orin ń sọ bóyá o fẹ́ràn ohun tí ó ń dún. Ìbò àìlórúkọ kan fún ẹ̀rọ kọ̀ọ̀kan, títí kan rédíò, o sì lè yí i padà tàbí mú un padà nígbàkúùgbà; àfi bí alábòójútó bá ṣí àpapọ̀ payá, àtàǹpàkò tìrẹ nìkan ni o ń rí.",
            "Lórí iPhone àti iPad, aṣeré ń lo ìṣeré lásán ní àkọ́kọ́, kí orin lè máa bá a lọ pẹ̀lú CarPlay, Bluetooth tàbí ojú tí a tì; a ń ṣètò ìró pẹ̀lú bọ́tìnì ẹ̀rọ tàbí ọkọ̀. Àṣàyàn “Ìró nínú ìṣàfilọ́lẹ̀” ń dá ọ̀pá ìró, ìwọ̀ntúnwọ̀nsì àti mítà VU padà, ṣùgbọ́n ohùn lè máa dá dúró nínú ọkọ̀."] },
        { id: "sounds",
          t: "Ipa ohùn",
          b: [
            "A pín ohùn eré sí ẹ̀ka mẹ́rin tí a lè tan tàbí pa lọ́tọ̀ọ̀tọ̀, gẹ́gẹ́ bí oníbàárà kọ̀ǹpútà: ìgbésẹ̀ eré (pínpín káàdì, Check, Call, Raise, àkókò rẹ…), ìkìlọ̀ ìjíròrò gbọ̀ngàn, ìkìlọ̀ eré nẹ́tíwọ̀ọ̀kì (òṣèré darapọ̀, eré ti ṣetán) àti ìkìlọ̀ ìgbésókè blinds. Ọ̀pá ìró kan ṣoṣo ń darí gbogbo wọn, nínú Àṣàyàn ìlọsíwájú → Ohùn."],
          note: "Gbogbo aṣàwákiri — pàápàá iOS — kọ̀ láti ṣe ohùn kí o tó fọwọ́ kan ojú-ewé lẹ́ẹ̀kan. Bí eré bá bẹ̀rẹ̀ láìsí ohùn, ìfọwọ́kàn kan níbikíbi ń mú ohùn wá; oníbàárà tún ń tún ẹ̀rọ ohùn ṣe fúnra rẹ̀ nígbà tí iOS bá dá a dúró (ìpè tí ń wọlé, ìṣiṣẹ́ lẹ́yìn…)." },
        { id: "voice",
          t: "Ohùn àti ìgbọ̀nrìrì",
          b: [
            "Ọ̀nà àfikún méjì lè máa sọ fún ọ láìwo ojú: ìkéde ohùn ń ka àwọn ìṣẹ̀lẹ̀ eré sókè pẹ̀lú ẹ̀rọ ìsọ̀rọ̀ ẹ̀rọ rẹ, lórí fóònù ìgbọ̀nrìrì kúkúrú sì lè sàmì sí àkókò rẹ. Àwọn méjèèjì jẹ́ àfikún wẹ́ẹ̀bù, wọ́n wà ní pípa tàbí títàn ní àkọ́kọ́ gẹ́gẹ́ bí ẹ̀rọ, nínú Àṣàyàn ìlọsíwájú → Tẹ́tẹ́ àti àkókò."],
          note: "Ìgbọ̀nrìrì ń ṣiṣẹ́ lórí Android (aṣàwákiri Chromium); Apple kò fún àwọn ojú-òpó ní API ìgbọ̀nrìrì, nítorí náà iPhone kò lè gbọ̀n. Ìkéde ohùn ń ṣiṣẹ́ níbi gbogbo, ṣùgbọ́n àwọn ohùn àti èdè tí ó wà gbára lé ètò rẹ — oníbàárà ń lo èyí tí ó bá a mu jù tí ó rí." }
      ]
    },
    {
      id: "options", icon: "⚙️", title: "Àṣàyàn àti ọ̀nà àbùjá",
      sections: [
        { id: "where",
          t: "Ibi tí àṣàyàn wà",
          b: [
            "Àṣàyàn ìlọsíwájú ń ṣí láti ohun gíà nínú àkójọ orí ojú-ewé èyíkéyìí. A pín wọn gẹ́gẹ́ bí oníbàárà kọ̀ǹpútà: Ojú olùlò, Ọ̀nà, Ohùn, Eré agbègbè, Eré nẹ́tíwọ̀ọ̀kì, Eré orí ayélujára, Orúkọ ìnagijẹ / Afàtá, Ìfiránṣẹ́ ìwé-àkọsílẹ̀, àti Àfipamọ́ àti àtúntò. Ẹ̀yà wẹ́ẹ̀bù kọ̀ọ̀kan ní ìyípadà tirẹ̀ níbẹ̀, nítorí náà o lè pa ohunkóhun tí o kò lò."] },
        { id: "cfgxml",
          t: "Pàṣípààrọ̀ ètò pẹ̀lú oníbàárà kọ̀ǹpútà",
          b: [
            "Ètò rẹ lè rìnrìn àjò láàárín àwọn oníbàárà: ẹ̀ka Àfipamọ́ àti àtúntò ní ìkójáde/ìkówọlé ti fáìlì config.xml ìjọba (~/.pokerth/config.xml tí oníbàárà kọ̀ǹpútà àti QML ń lò). Ìkójáde ń kọ ètò tí a pín — orúkọ, àṣàyàn ìfihàn, ohùn, àṣàyàn tábìlì, blinds, ọ̀nà — ìkówọlé sì ń lo fáìlì kọ̀ǹpútà níbí. Ètò tí oníbàárà yìí kò mọ̀ wà láìfọwọ́kàn nínú fáìlì.",
            "Àkọsílẹ̀ rẹ nípa àwọn òṣèré náà ń bá fáìlì rìn — ọ̀rọ̀ àti ìdíwọ̀n ìràwọ̀, tí a kọ ní ọ̀nà tí oníbàárà kọ̀ǹpútà ń kà wọ́n. Àwọn àmì àwọ̀ wà nínú oníbàárà yìí: ọ̀nà ìjọba kò ní àyè fún wọn, nítorí náà ìkówọlé kì í fọwọ́ kan tìrẹ rárá."] },
        { id: "sync",
          t: "Ètò tí ń tẹ̀lé ọ",
          b: [
            "Nígbà tí o bá ń ṣeré pẹ̀lú àkáǹtì, a ń múṣọ̀kan àṣàyàn rẹ, àkòrí, ọ̀nà àbùjá kọ́kọ́rọ́, èdè àti ife ẹ̀yẹ ìdánrawò: yí nǹkan kan padà lórí ẹ̀rọ kan, ẹ̀rọ tó kàn tí o bá wọlé láti ọ̀dọ̀ rẹ̀ yóò sì gbà á. A ń dapọ̀ ìlọsíwájú ife ẹ̀yẹ, a kì í kọ ọ́ lé e lórí rárá, nítorí náà ṣíṣeré lórí ẹ̀rọ méjì máa ń tọ́jú èyí tó dára jù nínú méjèèjì."] },
        { id: "updates",
          t: "Wíwà ní ìmúdójúìwọ̀n",
          b: [
            "Oníbàárà ń ṣe àtúnṣe ara rẹ̀: nígbà tí a bá gbé ẹ̀yà tuntun jáde, àsíá kan ń pè ọ́ láti sọ di tuntun (tàbí tẹ /update nínú ìjíròrò láti ṣàyẹ̀wò pẹ̀lú ọwọ́). Nígbà mìíràn ìwádìí èrò kékeré lè hàn láti béèrè èrò rẹ lórí ẹ̀yà kan — kíkópa jẹ́ àṣàyàn, a sì lè pa ìwádìí èrò pátápátá nínú Àṣàyàn ìlọsíwájú → Àwùjọ."] },
        { id: "fkeys",
          t: "Ọ̀nà àbùjá kọ́kọ́rọ́ ìjọba",
          b: [
            "Kọ́kọ́rọ́ iṣẹ́ ìjọba PokerTH ń ṣiṣẹ́ nígbà eré — Alt+S ń ṣiṣẹ́ níbi gbogbo:"],
          keys: [
            ["F1 / F2 / F3 / F4", "Fold · Check/Call · Bet/Raise · All-In (a lè yí ìtòlẹ́sẹẹsẹ padà nínú àṣàyàn)   ⟦F1 / F2 / F3 / F4⟧"],
            ["F5", "Fi káàdì rẹ hàn (nígbà tí ó bá ṣeé ṣe)   ⟦F5⟧"],
            ["F6 / F7 / F8", "Pẹ̀lú ọwọ́ · Check/Fold aládàáṣiṣẹ́ · Check/Call aládàáṣiṣẹ́   ⟦F6 / F7 / F8⟧"],
            ["Alt+M / Alt+K / Alt+F", "Pẹ̀lú ọwọ́ · Check/Call aládàáṣiṣẹ́ · Check/Fold aládàáṣiṣẹ́   ⟦Alt+M / Alt+K / Alt+F⟧"],
            ["Alt+C / Alt+L / Alt+I", "Ìjíròrò · Ìwé-àkọsílẹ̀ eré · Pánẹ́lì àǹfààní   ⟦Alt+C / Alt+L / Alt+I⟧"],
            ["Alt+S", "Ètò — níbikíbi nínú ìṣàfilọ́lẹ̀, kì í ṣe nígbà eré nìkan   ⟦Alt+S⟧"],
            ["F11", "Ojú kíkún   ⟦F11⟧"]],
          note: "Ọ̀nà àbùjá nílò pátákó kọ́kọ́rọ́ gidi. Lórí Mac, kọ́kọ́rọ́ F ń darí ohun àfetígbọ́ ní àkọ́kọ́: di Fn mú (tàbí tan “Use F1, F2, etc. as standard function keys” nínú ètò macOS). Lórí iPhone, iOS dín ojú kíkún kù — fífi ìṣàfilọ́lẹ̀ sórí ẹ̀rọ gẹ́gẹ́ bí PWA ń fún ọ ní ìrírí ojú kíkún kan náà." },
        { id: "webkeys",
          t: "Kọ́kọ́rọ́ lẹ́tà wẹ́ẹ̀bù",
          b: [
            "Gẹ́gẹ́ bí àfikún wẹ́ẹ̀bù, kọ́kọ́rọ́ lẹ́tà kan àti Alt+T náà ń ṣe ìgbésẹ̀, a sì lè tún ọ̀kọ̀ọ̀kan wọn yàn nínú Àṣàyàn ìlọsíwájú → Ọ̀nà àbùjá kọ́kọ́rọ́:"],
          keys: [
            ["F", "Fold   ⟦F⟧"],
            ["C", "Check / Call   ⟦C⟧"],
            ["R", "Raise   ⟦R⟧"],
            ["A", "All-In   ⟦A⟧"],
            ["1 / 2 / 3", "Tẹ́tẹ́ 1/3 · 1/2 · Pot   ⟦1 / 2 / 3⟧"],
            ["Alt+T", "Pánẹ́lì ìṣirò   ⟦Alt+T⟧"],
            ["Esc", "Pa fèrèsé tó wà lókè jù dé (bọ́tìnì Padà Android náà)   ⟦Esc⟧"],
            ["↑ ↓ · ↵", "Àkójọ tábìlì gbọ̀ngàn (dé ọ̀dọ̀ rẹ̀ pẹ̀lú Tab): yan tábìlì · darapọ̀   ⟦↑ ↓ · ↵⟧"]],
          note: "Lórí Android, bọ́tìnì/ìfaraṣàpèjúwe Padà ti ètò ń pa fèrèsé dé bí Escape dípò kí ó kúrò nínú eré (a lè ṣètò rẹ̀ nínú àṣàyàn). iOS kò ní bọ́tìnì ètò tí ó jọ ọ́ — lo ✕ fèrèsé kọ̀ọ̀kan." }
      ]
    }
  ]
};
