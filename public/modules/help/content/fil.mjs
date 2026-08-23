// ── help/content/fil.mjs — Filipino help corpus ─────────────────────────────
//
// Structure: chapters[] → { id, icon, title, sections[] }.
// Section: { id, t (title), b (paragraphs[]), list (bullets[]), keys ([kbd,
// label][]) }. Plain text only — the renderer escapes everything.
// Translated from en.mjs. Poker action terms (Fold, Check, Call, Bet, Raise,
// All-In) stay in English, as everywhere else.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Pagsisimula',
      sections: [
        { id: 'modes', t: 'Tatlong paraan ng paglalaro',
          b: ['Mula sa login screen, piliin kung paano mo gustong maglaro.'],
          list: [
            'Internet — maglaro online sa opisyal na server ng pokerth.net, may mga ranking. Kailangan ng pokerth.net account; magrehistro nang libre sa pokerth.net.',
            'Lokal / pagsasanay — maglaro offline laban sa mga bot. Walang kailangang i-setup, gumagana nang walang koneksyon, at nag-a-unlock ng mga tropeo habang umuusad ka.',
            'LAN / Dedicated server — kumonekta sa pribadong PokerTH server sa iyong lokal na network o sa sarili mong makina.'] },
        { id: 'lan', t: 'LAN / dedicated server',
          b: ['Ang ikatlong mode ay kumokonekta sa anumang PokerTH server na pinapatakbo mo o ng kaibigan \u2014 sa home network, pribadong VPS, kahit saan. Ilagay ang address at port ng server, i-tick ang TLS kung gumagamit ang server ng encrypted na port, at mag-log in gamit ang palayaw (gumagana ang guest access kung pinapayagan ng server). Pagkatapos, lahat sa mesa ay eksaktong gumagana tulad sa opisyal na server.'] },
        { id: 'famboard', t: 'Family leaderboard',
          b: ['Sa mga pribadong server at LAN game lang, ang client ay nag-iingat ng lifetime na istatistika bawat palayaw \u2014 mga kamay at larong nilaro at napanalunan, pinakamalaking panalo, pinakamahabang sunod na panalo \u2014 at ibinabahagi ito sa pamamagitan ng server para makita ng bawat device sa paligid ng mesa ang parehong leaderboard. Hindi kailanman sinusubaybayan nang ganito ang mga laro sa pokerth.net, at hiwalay na nakatago ang stats ng training mode.'] },
        { id: 'language', t: 'Wika',
          b: ['Available ang interface sa 45 wika. Palitan ito anumang oras sa Advanced options (gear menu) sa ilalim ng User interface. Ang mga terminong aksyon sa poker (Fold, Check, Call, Bet, Raise, All-In) ay nananatili sa Ingles ayon sa kaugalian, eksaktong tulad ng desktop client.'] },
        { id: 'pwa', t: 'I-install bilang app',
          b: ['Ang client na ito ay isang Progressive Web App: maaari mo itong i-install mula sa menu ng browser (o sa install button sa header) para makakuha ng full-screen app na may sariling icon. Kapag naka-install na, agad itong nagbubukas at ganap na gumagana offline ang training mode.'],
          note: 'Sa Android at desktop Chrome/Edge, ginagawa lahat ng install button. Sa iPhone/iPad, pinapayagan lang ng Apple ang pag-install sa pamamagitan ng Safari: Share button \u2192 \u201cAdd to Home Screen\u201d \u2014 ipinapakita ng client ang mga hakbang na ito kapag kailangan. Nawawala ang button kapag naka-install na ang app.' },
        { id: 'platforms', t: 'Mga platform at browser',
          b: ['Tumatakbo ang client sa anumang modernong browser sa anumang sistema \u2014 Windows, macOS, Linux, Android, iOS. Ilang feature ang umaasa sa mas bagong browser API; kapag nawawala ang isang API, nagtatago ang feature o nagpapaliwanag kung bakit sa halip na masira. Ang mga pangunahing pagkakaiba:'],
          list: [
            'Chrome / Edge (desktop): gumagana lahat, kasama ang pagsusulat ng .pdb log sa folder.',
            'Firefox: lahat maliban sa pagsusulat ng .pdb log sa folder (wala pang API).',
            'Safari / iOS: pag-install sa pamamagitan ng Share \u2192 Add to Home Screen; walang vibration; limitado ang fullscreen sa iPhone; nagsisimula ang tunog pagkatapos ng unang tap mo.',
            'Android: buong suporta sa mga Chromium browser, kasama ang vibration at ang gawi ng Back button.'] },
        { id: 'avatar', t: 'Palayaw at avatar',
          b: ['Piliin ang iyong palayaw at avatar sa login screen bago kumonekta. Sa pokerth.net, ang palayaw mo ang pangalan ng account mo; ibinabahagi ang mga avatar sa ibang manlalaro sa pamamagitan ng avatar server.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Mga patakaran ng poker',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em sa maikli',
          b: ['Ang PokerTH ay naglalaro ng No-Limit Texas Hold\u2019em. Bawat manlalaro ay tumatanggap ng dalawang pribadong baraha (ang hole cards). Limang community card ang ibinibigay nang nakabukas sa gitna ng mesa. Ang pinakamahusay na limang-barahang kamay mula sa anumang kombinasyon ng dalawang baraha mo at ng limang community card ang nananalo ng pot.'] },
        { id: 'blinds', t: 'Mga blind at ang dealer button',
          b: ['Bago ang bawat kamay, dalawang sapilitang taya ang nagpupuno sa pot: ang small blind at ang big blind, inilalagay ng dalawang manlalaro sa kaliwa ng dealer button. Lumilipat ang button ng isang upuan pakanan pagkatapos ng bawat kamay, kaya lahat ay nagbabayad ng mga blind nang salitan. Tumataas ang mga blind sa mga regular na agwat habang tumatagal ang laro.',
              'Sa mesa, minamarkahan ng mga puck ang button at mga blind: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Ang apat na round ng pagtaya',
          list: [
            'Pre-flop — pagkatapos ibigay ang hole cards, nagsisimula ang unang betting round sa kaliwa ng big blind.',
            'Flop — tatlong community card ang binubuksan, sinusundan ng betting round.',
            'Turn — ikaapat na community card, saka isa pang betting round.',
            'River — ang ikalima at huling community card, saka ang huling betting round.'],
          b: ['Natatapos ang isang betting round kapag lahat ng manlalarong nasa kamay pa ay naglagay ng parehong halaga sa pot (o all-in na).'] },
        { id: 'actions', t: 'Ang magagawa mo sa iyong turn',
          list: [
            'Fold — isuko ang kamay. Itinatapon ang mga baraha mo at hindi ka na nakikipagkumpitensya para sa pot.',
            'Check — magpalampas nang hindi tumataya. Posible lang kapag walang dapat i-call.',
            'Call — tapatan ang kasalukuyang taya.',
            'Bet — buksan ang pagtaya kapag wala pang tumaya sa street na ito.',
            'Raise — taasan ang umiiral na taya. Ang minimum na raise ay katumbas ng nakaraang bet o raise.',
            'All-In — ilagay ang buong stack mo. Nananatili ka sa kamay hanggang sa halagang sinaklaw mo.'] },
        { id: 'showdown', t: 'Showdown at hating pot',
          b: ['Kung higit sa isang manlalaro ang natitira pagkatapos ng river betting round, binubuksan ang mga kamay at nananalo ang pinakamahusay \u2014 ipinapakita ang nanalong kombinasyon sa ilalim ng mga community card. Kapag ang isang manlalaro ay all-in nang mas mababa sa buong taya, gumagawa ng mga side pot: bawat manlalaro ay maaari lang manalo ng bahagi ng pot na kanyang inambagan. Ang magkapantay na kamay ay naghahati ng pot.',
            'Hindi lahat kailangang magbukas: simula sa huling manlalarong nag-bet o nag-raise, binubuksan lang ang kamay kung tinatalo nito ang nakabukas na. Sinumang may karapatang magtapon ay maaaring itago ang kanyang mga baraha at makakakuha ng Show button para buksan pa rin ito.'] },
        { id: 'hands', t: 'Mga ranggo ng kamay',
          b: ['Mula sa pinakamahina hanggang sa pinakamalakas:'],
          list: [
            '1. High Card — walang kombinasyon; ang pinakamataas na baraha ang nagpapasya.',
            '2. Pair — dalawang barahang pareho ang ranggo.',
            '3. Two Pair — dalawang magkaibang pares.',
            '4. Three of a Kind — tatlong barahang pareho ang ranggo.',
            '5. Straight — limang barahang magkakasunod (ang Alas ay maaaring mataas o mababa).',
            '6. Flush — limang barahang iisang suit.',
            '7. Full House — three of a kind kasama ang isang pares.',
            '8. Four of a Kind — apat na barahang pareho ang ranggo.',
            '9. Straight Flush — isang straight, lahat sa iisang suit.',
            '10. Royal Flush — Sampu hanggang Alas, lahat sa iisang suit. Ang pinakamahusay na posibleng kamay.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Ang game screen',
      sections: [
        { id: 'actionbar', t: 'Ang action bar',
          b: ['Kapag turn mo na, lumiliwanag ang action bar sa ibaba na may hanggang apat na button: Fold (pula), Check / Call (asul), Bet / Raise (berde \u2014 ang naka-highlight na pangunahing aksyon) at All-In (madilim na pula). Ipinapakita ng Check / Call button ang eksaktong halagang dapat i-call; ipinapakita ng Bet / Raise ang halagang ilalagay mo. Pagkatapos ng river, maaaring maging Show button ang All-In para buksan ang mga baraha mo.'] },
        { id: 'betctl', t: 'Pagpili ng iyong taya',
          b: ['Itakda ang halaga ng raise gamit ang number field, ang slider, o ang mga quick button na 1/3 \u00b7 1/2 \u00b7 Pot (mga bahagi ng kasalukuyang pot). Awtomatikong ni-round ang mga halaga at pinapanatili sa pagitan ng minimum at maximum na legal na raise. Kung mas gusto mong mag-isip sa big blinds, may option na nagpapakita ng lahat ng halaga sa BB sa halip na chips.'] },
        { id: 'preselect', t: 'Pag-pre-select ng aksyon',
          b: ['Bago ang turn mo, maaari kang mag-arm ng aksyon nang maaga: i-tap ang isang button at makakakuha ito ng gintong border na may maliit na gintong tuldok. Pagdating ng turn mo, agad na nilalaro ang aksyon. Ang pre-armed na Fold ay awtomatikong nagiging Check kapag libre ang pag-check \u2014 hindi ka kailanman nag-fo-fold nang walang dahilan. Nagre-reset ang mga pre-selection sa bawat bagong kamay, pagbabago ng street at showdown, at kinakansela kapag nagbago ang sitwasyon (halimbawa nagbago ang halaga ng call).'] },
        { id: 'automodes', t: 'Mga auto mode',
          b: ['Ang dropdown sa tabi ng mga action button ay nag-aalok ng tatlong playing mode: Mano-mano, Auto Check/Call at Auto Check/Fold. Naglalaro para sa iyo ang mga auto mode hanggang lumipat ka pabalik \u2014 anumang mano-manong click sa isang aksyon ay agad na bumabalik sa Mano-mano.'] },
        { id: 'readtable', t: 'Pagbabasa ng mesa',
          b: ['Ipinapakita ng bawat player box ang avatar, pangalan, stack at kasalukuyang taya. Minamarkahan ng D / SB / BB na mga puck ang dealer at mga blind. Ipinapakita ng may kulay na badge sa box ang huling aksyon ng manlalaro; binibilang pababa ng manipis na asul na bar ang kanyang oras ng pag-iisip. Lumiliwanag ang box ng manlalarong may turn; ang sarili mong box ay nakakakuha ng kumikislap na gintong frame sa turn mo.',
              'Ipinapakita ng status bar sa itaas ng mesa ang kabuuang pot, ang mga taya ng kasalukuyang street, ang yugto (Pre-flop, Flop, Turn, River) at ang mga numero ng laro at kamay. May translucent na baraha ang mga nag-fold na manlalaro; dimmed ang mga natanggal. Sa dulo ng kamay, maaaring ibuod ng winner window kung sino ang nanalo ng ano \u2014 maaari itong i-off sa mga option.'] },
        { id: 'seatlayout', t: 'Pagkakalagay ng upuan',
          b: ['Bilang web extension, mapipili ang pagkakaayos ng mga player box sa Advanced options \u2192 Mga upuan: sinusunod ng Awtomatiko ang opisyal na client (fixed na mga slot sa portrait, computed na ellipse sa landscape), o ipilit ang Portrait o Landscape na pagkakaayos \u2014 at hinahayaan ka ng Custom na ilagay ang bawat upuan nang ikaw mismo: lumalabas ang edit mode kung saan dina-drag mo ang bawat box eksakto kung saan mo gusto, at naisa-save ang layout.'] },
        { id: 'zoom', t: 'Table zoom (mga phone)',
          b: ['Sa maliliit na screen, ang mga magnifier button ay nagzu-zoom sa mesa (2\u00d7) at maaari kang mag-pan gamit ang daliri \u2014 nananatiling nakapirmi ang sarili mong box at ang action bar. Awtomatikong sinusundan ng view ang aktibong upuan at nagzu-zoom pabalik sa showdown para sa overview. Maaari itong i-off sa Advanced options.'],
          note: 'Sa mga phone at tablet, naka-block by default ang sariling pinch-zoom ng browser para hindi kailanman aksidenteng mag-fire ang zoom gesture sa gitna ng kamay; i-enable muli sa Advanced options \u2192 User interface kung gusto mo.' },
        { id: 'protections', t: 'Anti-peek at proteksyon sa aksidenteng call',
          b: ['Dalawang opsyonal na proteksyon: pinapanatiling nakatago ng Anti-peek ang sarili mong mga baraha hanggang i-tap mo (kapaki-pakinabang kapag may nakakakita sa screen mo), at ang accidental-call guard ay panandaliang bina-block ang Call button pagkatapos ng malaking raise, para ang tap na para sa mas maliit na call ay hindi aksidenteng tumama sa itinaas na halaga. Parehong nasa Advanced options.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Info panel',
      sections: [
        { id: 'open', t: 'Pagbubukas ng panel',
          b: ['Habang naglalaro, nagbubukas ang info panel mula sa header (o Alt+L / Alt+I) at may tatlong tab: Log, Chances at Stats. Sa mga phone lumulutang ito sa ibabaw ng mesa; sa mas malalaking screen ito ay dina-drag at nire-resize na window \u2014 hawakan ang \u28ff grip para ilipat, ang mga gilid para i-resize. Naaalala ang posisyon nito.'] },
        { id: 'log', t: 'Game log',
          b: ['Naitatala ng Log tab ang buong laro kamay por kamay: mga blind, bawat aksyon na may mga halaga, mga binuksang baraha at mga nanalo, may color-code para mabilis basahin. Sine-save ng export button ang log bilang file kung gusto mong balikan ang session mamaya.'] },
        { id: 'odds', t: 'Chances (odds monitor)',
          b: ['Ipinapakita ng Chances tab, para sa kasalukuyang kamay mo, ang live na posibilidad na magtapos sa bawat isa sa 10 kategorya ng kamay \u2014 mula High Card hanggang Royal Flush \u2014 bawat isa may icon, porsyento at bar. Nagiging gray ang display kapag nag-fold ka. Ginagamit lang nito ang sarili mong mga baraha at ang mga community card: wala itong nakikitang hindi ipinapakita ng mga kalaban mo.'] },
        { id: 'journal', t: 'Mga hand log at ang Logs window',
          b: ['Bukod sa live log, bawat kamay na nilalaro mo ay naitatala nang lokal sa browser mo, sa parehong format ng .pdb log file ng opisyal na client. Ang Logs window (Advanced options \u2192 Mga log message \u2192 Pamahalaan ang mga log\u2026) ay naglilista ng mga session mo at hinahayaan kang gamitin ang mga ito: i-preview ang session na may paghahanap at pag-highlight, mag-filter ayon sa laro, mag-export bilang HTML o plain text, i-save ang raw na .pdb file, o mag-import ng .pdb na naitala ng desktop client. Maaaring burahin ang mga session isa-isa o lahat nang sabay-sabay (may kumpirmasyon), at ang automatic retention setting ay maaaring magtago lang ng huling 7, 30, 90, 180 o 365 araw. Hindi kailanman awtomatikong inaalis ang mga log na ikaw mismo ang nag-import. Nililimitahan ng pangalawang setting kung ilang session ang itinatago, at maaaring i-drag nang mas malawak ang column ng listahan.',
              'Para maglinis ng maraming session nang sabay, ipinapakita ng Pumili… ang isang checkbox sa bawat entry: tsekan ang gusto mong alisin at buburahin ng Burahin ang buong batch pagkatapos ng iisang kumpirmasyon. Sa computer, nagdaragdag ang Ctrl (⌘) + click ng session isa-isa, at kumukuha ang Shift + click ng buong saklaw.',
              'Ang Analyse button ay nagpapatakbo ng hand analysis sa isang session at maaaring magpadala ng log sa analysis service ng pokerth.net. Lahat ay nananatili sa device mo maliban kung tahasan mong i-export o i-upload.'] },
        { id: 'logopts', t: 'Mga option sa pag-log',
          b: ['Sa Advanced options \u2192 Mga log message maaari mong i-on o i-off ang pag-log at piliin ang write interval, na may parehong tatlong setting gaya ng desktop client: pagkatapos ng bawat aksyon, pagkatapos ng bawat kamay (ang default) o pagkatapos ng bawat laro. Isinusulat ng isa pang option ang .pdb file sa folder na pinili mo at pinapanatiling napapanahon sa interval na iyon, at isa pang beses kapag umalis ka sa page, para masundan ng ibang tool ang laro nang live.'],
          note: 'Ang pagsusulat sa lokal na folder ay nangangailangan ng File System Access API: desktop Chrome, Edge at Opera lang. Sa iba, nagpapaliwanag ang option at nananatiling available ang mano-manong export mula sa Logs window. Ang browser ay maaari lang magpalit ng file, hindi kailanman mag-append, kaya ang tool na nagbabasa ng .pdb ay dapat buksan muli ito pagkatapos ng bawat pagbabago.' },
        { id: 'assist', t: 'Tulong (lakas ng kamay)',
          b: ['Sa itaas ng Chances tab, binabasa para sa iyo ng assistance banner ang kamay mo. Bago ang flop, pinapangalanan nito ang starting hand mo at binibigyan ng mga bituin; mula sa flop, ipinapakita nito ang kasalukuyang pinakamahusay mong kombinasyon at, pagkatapos ng mabilisang simulation, ang tinatayang tsansa mong manalo ng kamay bilang porsyento, na may color gauge mula pula (mahina) hanggang berde (malakas). Tulad ng odds monitor, ginagamit lang nito ang impormasyong nakikita mo.',
              'Dalawang display style ang available sa Advanced options \u2192 Mga upuan: Mga segment (sampung block) o isang classic progress bar. Ang buong assistance feature ay maaaring i-off sa Advanced options \u2192 Tulong.'] },
        { id: 'assistwin', t: 'Tulong bilang lumulutang na widget',
          b: ['Maaaring ihiwalay ang assistance block mula sa panel patungo sa sarili nitong maliit na always-on-top na window: gamitin ang detach button sa block, saka ilipat at i-resize kahit saan sa ibabaw ng mesa \u2014 madali para bantayan ang lakas ng kamay mo nang hindi bukas ang buong panel. Ibinabalik ito ng dock button sa Chances tab, at naaalala ang posisyon nito. Sa loob ng panel, ang drag handle sa pagitan ng Tulong at ng odds ay hinahayaan kang hatiin ang espasyo sa dalawa.'] },
        { id: 'stats', t: 'Stats',
          b: ['Sinusubaybayan ng Stats tab ang session mo: mga kamay na nilaro, mga flop na nakita, mga showdown, win rate at iba pa. Maaaring i-off ang pagsubaybay ng istatistika sa Advanced options.'] },
        { id: 'hud', t: 'Stats HUD sa mga upuan (beta)',
          b: ['Ang HUD ay nagkakabit ng maliit na statistics box sa tabi ng upuan ng bawat manlalaro, binuo mula sa mga kamay na naitala mo sa mga log mo: bilang ng mga kamay na naobserbahan, saka VPIP (gaano kadalas silang kusang naglalagay ng pera pre-flop), PFR (mga pre-flop raise) at AF (aggression factor), may color-code mula passive hanggang aggressive. Sa ilalim nito, may badge na nagbubuod sa manlalaro sa simpleng salita \u2014 Tight-Passive, Loose-Aggressive at iba pa \u2014 sa tabi ng maliit na dial na ang lit quadrant ay binabasa kaliwa-pakanan para sa tight hanggang loose, at ibaba-pataas para sa passive hanggang aggressive. Lumalabas ang badge mula sa kauna-unahang kamay pero nananatiling dimmed hanggang 25 kamay, kung saan nagiging maaasahan. I-tap ang box para sa detalyadong popover na may buong set ng mga numero (3-bet, continuation bet, fold to 3-bet, mga steal attempt, showdown rate\u2026), at i-drag ang box para ilipat kung may natatakpan.',
              'Alam lang ng HUD ang nakita mo sa sarili mong mga mesa \u2014 binabasa nito ang lokal mong mga hand log, kaya dapat naka-enable ang pag-log at nagiging makabuluhan ang mga numero pagkatapos ng sapat na mga kamay. Ito ay beta feature, naka-off by default: i-enable sa Advanced options \u2192 Tulong.'] },
        { id: 'handsbtn', t: 'Overview ng mga kombinasyon ng kamay',
          b: ['Ang poker-hands icon sa felt ay nagbubukas ng mabilisang overview ng 10 kombinasyon anumang oras \u2014 madali habang natututo. Maaari itong itago sa Advanced options.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat at social',
      sections: [
        { id: 'panels', t: 'Lobby chat at game chat',
          b: ['May chat sa lobby at isa sa mesa. Sa mga phone, lumulutang ang game chat sa ibabaw ng mesa; sa mas malalaking screen ito ay dina-drag at nire-resize na window. Binibilang ng badge sa chat button ang mga hindi pa nabasang mensahe.'] },
        { id: 'typing', t: 'Mga tulong sa pag-type',
          list: [
            'Kinukumpleto ng Tab ang palayaw \u2014 pindutin muli ang Tab para mag-cycle sa mga tugma.',
            '\u2191 / \u2193 nagba-browse sa sarili mong message history.',
            'Ang emoji button ay nagbubukas ng buong picker; ang pag-type ng : ay nagmumungkahi rin ng mga emote habang nagta-type ka.'] },
        { id: 'emotes', t: 'Mga emote at smiley',
          b: ['Kino-convert ng chat ang mga emote shortcode eksaktong tulad ng opisyal na desktop client: mag-type ng pangalan sa pagitan ng mga colon at nagiging emoji ito \u2014 :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 mahigit 1,900 code ang suportado (ang buong GitHub set). Kino-convert din ang mga classic na text smiley: :-) ;) :D xD :P <3 at humigit-kumulang walumpu pa.',
              'Ang pag-type ng : ay nagbubukas ng suggestion popup na kinukumpleto ang code habang nagta-type ka (\u2191/\u2193 para pumili, Tab o Enter para tanggapin). Maaaring ganap na i-disable ang emoji conversion sa Advanced options \u2192 Chat.'] },
        { id: 'commands', t: 'Mga chat command',
          b: ['Naiintindihan ng chat ang mga slash command. Dalawa ang nakikita ng iba:'],
          keys: [
            ['/me <teksto>', 'Action message, ipinapakita bilang \u201c* pangalanmo teksto\u201d'],
            ['/emoji <emoji>', 'Nagpe-play ng emoji reaction (ang ipinapadala ng reaction picker)']] },
        { id: 'diagcmds', t: 'Mga diagnostic command',
          b: ['Ang lahat ng iba ay lokal: ang mga sagot ay ipinapakita lang sa iyo at walang ipinapadala sa mesa. I-type ang /help para ilista lahat. Ang pinakakapaki-pakinabang:'],
          keys: [
            ['/help', 'Ilista lahat ng command'],
            ['/update', 'Suriin kung may bagong bersyon at i-refresh'],
            ['/lang <code>', 'Magpalit ng wika (hal. /lang fil)'],
            ['/sound on|off', 'I-toggle ang mga tunog ng laro'],
            ['/zoom', 'I-toggle ang table magnifier'],
            ['/clear', 'Linisin ang chat nang lokal'],
            ['/table', 'Impormasyon ng kasalukuyang laro (mga blind, manlalaro, stack)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostics ng client state, network at framerate'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Advanced debugging (mga baraha, protocol, audio, storage, upuan)'],
            ['/copy', 'Kopyahin ang huling sagot ng command sa clipboard']] },
        { id: 'reactions', t: 'Mga emoji reaction',
          b: ['Ang reaction button ay nagbubukas ng picker ng 30 animated na reaksyon (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) na naglalaro nang may effect sa ibabaw ng upuan mo, nakikita ng lahat sa mesa \u2014 kasama ang mga manlalaro sa desktop client. Maaaring ganap na i-disable ang mga reaksyon sa Advanced options.'] },
        { id: 'translate', t: 'Pag-unawa sa lahat',
          b: ['Kapag naka-enable ang chat translation, lumalabas ang translate button sa linya sa ilalim ng pointer mo \u2014 o sa linyang na-tap mo, sa touch screen \u2014 at ipinapakita ang mensaheng iyon sa iyong wika gamit ang built-in na translator ng browser. Maaari itong ipakita nang permanente sa bawat linya sa Advanced options \u2192 Chat, kung saan naroroon din ang tooltip na nagpapaliwanag ng mga karaniwang daglat sa mesa (gg, nh, utg\u2026).'],
          note: 'Ginagamit ng translation ang Google Translate service at gumagana sa bawat browser \u2014 kailangan lang ng internet connection. Ang mensahe ay ipinapadala lang sa translation service kapag na-tap mo ang translate button nito, hindi kailanman awtomatiko.' },
        { id: 'social', t: 'Mga manlalaro: profile, imbita, ignore',
          b: ['I-tap ang sinumang manlalaro \u2014 sa mesa o sa lobby list \u2014 para buksan ang kanilang card: profile at stats, imbitahan sila sa laro mo, o i-ignore sila (nakatago ang kanilang mga chat message; nababawi ang pag-ignore anumang oras). Maaaring i-enable ang kumpirmasyon bago mag-imbita/mag-ignore sa mga option.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby at mga laro',
      sections: [
        { id: 'list', t: 'Ang listahan ng laro',
          b: ['Inililista ng lobby ang bawat mesa sa server. Ipinapakita ng bawat entry ang bilang ng manlalaro, ang uri ng laro, isang padlock kapag kailangan ng password o imbitasyon, at isang status badge: \u201cNaghihintay\u201d (berde \u2014 hindi pa nagsisimula ang laro, maaari kang sumali kung may bakanteng upuan), \u201cTumatakbo\u201d (mainit na kulay \u2014 mapapanood live kapag pinapayagan ang mga manonood) at \u201cSarado\u201d (dimmed). Ang punong mesa ay nagpapakita lang ng punong bilang, tulad ng 10/10; sinusunod ng mga kulay ng badge ang aktibong tema.',
              'Pinapaliit ng filter dropdown ang listahan eksaktong tulad ng desktop client, bawat pagpipilian mas mahigpit kaysa nauna: mga bukas na laro lang \u2192 itinatago rin ang mga punong mesa \u2192 saka mga hindi pribado lang, mga pribado lang, o mga ranking game lang. Naaalala ang pinili mo. Hinahanap ng search field ang laro ayon sa pangalan, at binubuksan ng players pill ang listahan ng lahat ng online, mahahanap at maaayos.'] },
        { id: 'join', t: 'Pagsali at panonood',
          b: ['Pumili ng bukas na laro at sumali \u2014 ang padlock ay nangangahulugang kailangan ng password. Ang mga tumatakbong larong pinapayagan ang mga manonood ay mapapanood live: nakikita mo ang mesa at chat, pero nakatago ang hole cards at hindi ka makakakilos.'] },
        { id: 'gameinfo', t: 'Impormasyon ng laro',
          b: ['Bago sumali, ipinapakita ng game info card ang lahat ng tumutukoy sa mesa: uri ng laro, mga blind at kung paano tumataas (pagdodoble o mano-manong listahan), panimulang pera, action timeout, pagkaantala sa pagitan ng mga kamay, at kung sino na ang nakaupo.'] },
        { id: 'create', t: 'Paggawa ng laro',
          b: ['Gumawa ng sarili mong mesa: pangalan, bilang ng manlalaro, panimulang pera, unang small blind at raise schedule, action timeout, at kung pinapayagan ang mga manonood. Apat na uri ng laro ang umiiral: Normal (kahit sino), mga rehistradong manlalaro lang, invite-only, at Ranking (nabibilang sa opisyal na ranking \u2014 walang password na pinapayagan doon). Maaaring i-save at i-reload ang mga paborito mong setting.'] },
        { id: 'invites', t: 'Mga imbitasyon',
          b: ['Maaaring imbitahan ka ng mga manlalaro sa kanilang mesa; makakakuha ka ng notification na maaari mong tanggapin o tanggihan. Ang pagiging inimbitahan ang tanging paraan papasok sa invite-only na laro.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Ang iyong account',
          b: ['Ang opisyal na Internet server ay pokerth.net. Ang paglalaro doon ay nangangailangan ng libreng pokerth.net account \u2014 magrehistro sa website, saka mag-log in dito gamit ang parehong palayaw at password. Ang web client na ito ay kumokonekta sa eksaktong parehong server ng desktop client: parehong mga account, parehong mga mesa, parehong mga ranking, at maaari kang umupo sa mesa kasama ang mga desktop player.'] },
        { id: 'ranked', t: 'Mga ranking game at season',
          b: ['Ang mga larong uri Ranking ay nabibilang sa opisyal na season ranking. Ipinapakita ng in-app profile mo kung kailan ka sumali, ang Rank, Score, average at mga larong nilaro ng kasalukuyang season, kasama ang mga pinakabago mong resulta. Ang mga regular (hindi ranking) na laro ay para lang sa saya at walang binabago.'] },
        { id: 'rankhow', t: 'Paano kinakalkula ang ranking',
          b: ['Sa bawat ranked game, ang huling pwesto mo ay kumikita ng mga puntos: 15 para sa una, saka 9, 6, 4, 3, 2 at 1 pababa hanggang ikapito; walang nakukuha ang ikawalo hanggang ikasampu. Kaya ang isang mesa ay namamahagi ng kabuuang 40 puntos.',
              'Ang Score mo ay hindi ang kabuuan ng mga puntos na iyon kundi ang average mo bawat laro, pinapabanayad ng factor na lumalaki kasabay ng bilang ng mga larong nilaro: hindi sapat ang ilang magagandang resulta para manatili sa itaas, kailangan din ng regularidad — habang mas marami kang laro, mas lumalapit ang Score mo sa tunay mong average. Isang quarter ang tagal ng mga season: sa paglipat, naaarchive lahat at nagsisimula muli mula sero ang mga counter, na makikita pa rin ang mga nakaraang season. Sa laro, ipinapakita ng podium button ang season ranking ng mga manlalaro sa mesa mo.'],
          note: 'Ang point scale at ang eksaktong formula ay itinatakda ng pokerth.net ranking server at maaaring magbago; ang mga pahina sa site ang reference.' },
        { id: 'rankings', t: 'Mga pahina ng ranking',
          b: ['Binubuksan ng ranking entry ang opisyal na PokerTH ranking, mahahanap ayon sa manlalaro, kasama ang mga community ranking (BBC, WEC). Kung wala kang pakialam sa mga ranking, maaaring itago ang entry sa Advanced options \u2192 Komunidad.'] },
        { id: 'cups', t: 'Ang mga community cup: BBC at WeCup',
          b: ['Dalawang komunidad ang nagpapatakbo ng sarili nilang mga kompetisyon sa pokerth.net, bawat isa may sariling site at ranking. Ang Best Brainies Cup (BBC) ay isang step tournament na isinilang noong 2013: umaakyat ka mula Step 1 hanggang Step 4, at nagsisimula ang bagong season pagkatapos ng bawat Step 4 game, kapag iginagawad ang cup. Ang WeCup (WEC) ay may sariling scale, mas malawak — 75 puntos para sa unang pwesto, saka 45, 30, 20… — at nino-normalize ng score nito ang average mo laban sa bilang ng mga larong nilaro mo kumpara sa ibang miyembro.',
              'Parehong ranking ay nagbubukas mula sa trophy button, sa tabi ng PokerTH ranking. Ang mga table setting ng mga kompetisyong ito ay kasama bilang mga preset kapag gumagawa ka ng laro (BBC Step 1 hanggang 4, WEC, WEC Monthly Final at WEC Grand Final), para makapagsanay ka sa parehong kondisyon. Ang pagsali ay nangangailangan ng pag-sign up sa site ng kinauukulang cup.'],
          note: 'Maaaring itago ang mga nilalamang ito nang sabay-sabay sa Advanced options → Komunidad kung hindi mo hilig ang mga cup.' },
        { id: 'forumcups', t: 'Mga forum cup at event',
          b: ['Ang pokerth.net forum ay nagho-host din ng Monthly Cup, isang buwanang serye kung saan hinahati ang mga manlalaro sa mga Gold, Silver at Bronze na mesa bago koronahan ang kampeon ng buwan, kasama ang mga one-off na special cup sa buong taon.',
              'Ang mga sign-up, iskedyul, table setting at resulta ay inilalathala sa forum, at ang mga laro ay nilalaro sa opisyal na server tulad ng iba. Sapat na ang pokerth.net account para sundan ang mga resulta; ang pagsali sa cup ay dumadaan sa katugmang forum thread.'] },
        { id: 'forumnews', t: 'Balita sa forum sa lobby',
          b: ['Ang newspaper button sa lobby header ay nagbubukas ng mga pinakabagong post mula sa pokerth.net forum, isang entry bawat topic, bawat forum may sariling kulay. Binibilang ng badge sa button ang mga hindi pa nabasang post; ang pagbubukas ng post (bagong tab) ay nagmamarka rito bilang nabasa, at nililinis ng “Markahan lahat na nabasa” ang lahat nang sabay-sabay.',
              'Ito ay web extra: maaaring itago ang button sa Advanced options (“Forum button sa lobby header”).'] },
        { id: 'avatars', t: 'Mga avatar at bandila',
          b: ['Sa pokerth.net, ang avatar mo ay ipinapamahagi sa ibang manlalaro sa pamamagitan ng avatar server, at maaaring ipakita ang maliit na bandila ng bansa sa mga player box. Parehong opsyonal at maaaring i-configure sa mga option.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Training mode',
      sections: [
        { id: 'what', t: 'Ano ito',
          b: ['Ang Lokal / training mode ay isang buong laro laban sa mga computer na kalaban: walang koneksyon, walang account, walang nakataya. Kapag naka-install na ang app (o basta nabisita nang isang beses), gumagana ito nang ganap na offline \u2014 perpekto para matuto ng laro, subukan ang interface o magpalipas ng oras sa airplane mode.'] },
        { id: 'setup', t: 'Pag-setup ng laro',
          b: ['Piliin ang bilang ng mga kalaban, panimulang pera, mga blind at raise schedule, at bilis ng laro. Ang line-up at hirap ng bot ay maaaring i-adjust sa Advanced options \u2192 Lokal na laro \u2014 mula sa mababait na kalaban hanggang sa mas mahirap, halo-halong mesa.'] },
        { id: 'trophies', t: 'Mga tropeo',
          b: ['May sariling progression ang training mode: 28 tropeo sa anim na kategorya (progreso, kasanayan, istilo, mga format, katuwaan at isang lihim) ang nag-a-unlock habang naglalaro ka \u2014 mga kamay na nilaro, mga larong napanalunan, malalaking bluff, mga espesyal na kamay at iba pa. Ang trophy progress mo ay cumulative at nagsasama sa mga device kapag aktibo ang account settings sync.'] },
        { id: 'learn', t: 'Magandang lugar para matuto',
          b: ['Lahat mula sa ibang mga kabanata ay gumagana rin dito: ang odds monitor, ang assistance display, ang pre-selection, ang mga keyboard shortcut. Ang training mode ang pinakamagandang lugar para subukan ang mga ito nang walang pressure bago pumunta sa pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Istilo at tunog',
      sections: [
        { id: 'themes', t: 'Mga tema',
          b: ['Ang Istilo na kategorya ng Advanced options ay nagbabago sa hitsura ng buong client. Ang mga preset ay nag-se-set ng lahat sa isang tap (ang classic na berdeng casino, ang opisyal na hitsura ng PokerTH\u2026); sa ibaba nito, hinahayaan ka ng mga indibidwal na axis na i-fine-tune nang hiwalay ang color palette, ang felt ng mesa at ang mga mukha ng baraha \u2014 baguhin ang anumang axis at magiging custom theme ang halo mo. Ang dark, light o automatic mode ay pinipili sa User interface, at agad na nalalapat ang mga pinili mo, sa bawat screen, at naaalala.'] },
        { id: 'tablelook', t: 'Mga mesa, deck, upuan',
          b: ['Bukod sa tema, maraming elemento ang maaaring palitan nang hiwalay: ang background ng mesa, ang deck ng baraha, ang likod ng baraha (itugma sa deck nang awtomatiko o mag-import ng sarili mong larawan), ang mga dealer at blind na puck, ang istilo ng action-button, at buong mga seat pack na nagpapalit ng hitsura ng mga player box. Piliin lahat sa Advanced options \u2192 Istilo; agad na nakikita ang mga pagbabago sa mesa.'] },
        { id: 'music', t: 'Music player',
          b: ['Ang music entry sa mga header menu ay nagbubukas ng maliit na lounge-music player: pumili ng track mula sa playlist, play/pause, previous/next, shuffle, at ulitin ang isang track, ang buong playlist o wala. Naaalala ang volume, napiling track at repeat mode. Hindi kailanman nagsisimula ang playback nang mag-isa \u2014 nangangailangan ng tap ang mga browser \u2014 at ang player ay ganap na independent sa mga sound effect ng laro.'] },
        { id: 'sounds', t: 'Mga sound effect',
          b: ['Ang mga tunog ng laro ay nakagrupo sa apat na kategoryang maaaring i-toggle nang hiwalay, eksaktong tulad ng desktop client: mga aksyon sa laro (mga barahang ibinigay, Check, Call, Raise, turn mo\u2026), notification ng lobby chat, mga notification ng network game (sumali ang manlalaro, handa na ang laro) at ang notification ng pagtaas ng blind. Isang volume slider ang kumokontrol sa lahat, sa Advanced options \u2192 Tunog.'],
          note: 'Lahat ng browser \u2014 lalo na ang iOS \u2014 ay tumatangging mag-play ng audio bago mo mahawakan ang page nang isang beses. Kung nagsimulang tahimik ang laro, isang tap kahit saan ang bubuhay sa tunog; awtomatiko ring inaayos ng client ang audio engine kapag sinuspinde ito ng iOS (papasok na tawag, pagpunta sa background\u2026).' },
        { id: 'voice', t: 'Boses at vibration',
          b: ['Dalawang karagdagang channel ang makakapagpaalam sa iyo nang hindi tumitingin sa screen: binabasa ng voice announcements ang mga pangyayari sa laro gamit ang speech synthesis ng device mo, at sa mga phone maaaring markahan ng maikling vibration ang turn mo. Parehong web extension, naka-off o naka-on by default depende sa device, sa Advanced options \u2192 Pagtaya at turn.'],
          note: 'Gumagana ang vibration sa Android (mga Chromium browser); hindi naglalabas ang Apple ng vibration API sa mga website, kaya hindi makaka-vibrate ang mga iPhone. Gumagana ang voice announcements kahit saan, pero ang mga available na boses at wika ay nakadepende sa sistema mo \u2014 ginagamit ng client ang pinakamahusay na tugmang mahanap nito.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Mga option at shortcut',
      sections: [
        { id: 'where', t: 'Saan naroroon ang mga option',
          b: ['Nagbubukas ang Advanced options mula sa gear entry ng anumang header menu. Nakagrupo ang mga ito tulad ng desktop client: User interface, Istilo, Tunog, Lokal na laro, Network na laro, Internet na laro, Mga palayaw / Avatar, Mga log message, at Ibalik sa default. Bawat web-specific na feature ay may sariling switch doon, kaya maaari mong i-off ang anumang hindi mo ginagamit.'] },
        { id: 'cfgxml', t: 'Pagpapalitan ng mga setting sa desktop client',
          b: ['Maaaring maglakbay ang mga setting mo sa pagitan ng mga client: ang kategoryang Mga log message ay nag-aalok ng export/import ng opisyal na config.xml file (ang \u007e/.pokerth/config.xml na ginagamit ng mga desktop at QML client). Isinusulat ng export ang mga ibinabahaging setting \u2014 pangalan, mga display option, tunog, mga kagustuhan sa mesa, mga blind, mga istilo \u2014 at inilalapat ng import ang desktop file dito. Ang mga setting na hindi kilala ng client na ito ay pinapanatili sa file nang hindi ginagalaw.'] },
        { id: 'sync', t: 'Mga setting na sumusunod sa iyo',
          b: ['Kapag naglalaro ka gamit ang account, naka-synchronize ang mga option, tema, key binding, wika at mga training trophy mo: baguhin ang isang bagay sa isang device at kukunin ito ng susunod na device na pag-lo-log-in-an mo. Ang trophy progress ay pinagsasama, hindi kailanman ino-overwrite, kaya ang paglalaro sa dalawang device ay laging nagpapanatili ng pinakamahusay sa dalawa.'] },
        { id: 'updates', t: 'Pananatiling napapanahon',
          b: ['Ina-update ng client ang sarili nito: kapag may na-deploy na bagong bersyon, may banner na nag-iimbita sa iyong mag-refresh (o i-type ang /update sa chat para mano-manong suriin). Paminsan-minsan may maliit na product poll na maaaring lumabas para tanungin ang opinyon mo tungkol sa isang feature \u2014 opsyonal ang pagsali at maaaring ganap na i-disable ang mga poll sa Advanced options \u2192 Komunidad.'] },
        { id: 'fkeys', t: 'Mga opisyal na keyboard shortcut',
          b: ['Gumagana ang mga opisyal na PokerTH function key habang naglalaro \u2014 gumagana ang Alt+S kahit saan:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (maaaring baligtarin ang pagkakasunod sa mga option)'],
            ['F5', 'Ipakita ang mga baraha mo (kapag posible)'],
            ['F6 / F7 / F8', 'Mano-mano \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Mano-mano \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Game log \u00b7 Odds panel'],
            ['Alt+S', 'Mga setting \u2014 kahit saan sa app, hindi lang habang naglalaro'],
            ['F11', 'Fullscreen']],
          note: 'Nangangailangan ng pisikal na keyboard ang mga shortcut. Sa Mac, ang mga F-key ay default na media control: hawakan ang Fn (o i-enable ang \u201cUse F1, F2, etc. as standard function keys\u201d sa mga setting ng macOS). Sa iPhone, limitado ng iOS ang fullscreen \u2014 ang pag-install ng app bilang PWA ay nagbibigay ng parehong full-screen na karanasan.' },
        { id: 'webkeys', t: 'Mga web letter key',
          b: ['Bilang web extension, ang mga single-letter key at Alt+T ay nagti-trigger din ng mga aksyon, at bawat isa sa mga ito ay maaaring i-rebind sa Advanced options \u2192 Mga keyboard shortcut:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Statistics panel'],
            ['Esc', 'Isara ang pinakaitaas na window (pati ang Android Back button)']],
          note: 'Sa Android, ang system Back button/gesture ay nagsasara ng mga window tulad ng Escape sa halip na umalis sa laro (naco-configure sa mga option). Walang katumbas na system button ang iOS \u2014 gamitin ang \u2715 ng bawat window.' }
      ]
    }
  ]
};
