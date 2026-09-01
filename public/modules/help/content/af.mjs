// ── help/content/af.mjs — Afrikaanse hulpkorpus ─────────────────────────────
// Vertaling van en.mjs (verwysing). Struktuur en id's identies; slegs
// t / b / list / keys (etikette) / note word vertaal. Pokerterme
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) bly Engels
// volgens die program se konvensie. Aanspreekvorm: jy.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Om te begin',
      sections: [
        { id: 'modes', t: 'Drie maniere om te speel',
          b: ['Kies op die aanmeldskerm hoe jy wil speel.'],
          list: [
            'Internet — speel aanlyn op die amptelike pokerth.net-bediener, met ranglyste. \u2019n pokerth.net-rekening is nodig; registrasie op pokerth.net is gratis.',
            'Plaaslik / oefening — speel vanlyn teen bots. Niks om op te stel nie, werk sonder verbinding en ontsluit trofeë soos jy vorder.',
            'LAN / eie bediener — koppel aan \u2019n private PokerTH-bediener op jou plaaslike netwerk of op jou eie masjien.'] },
        { id: 'lan', t: 'LAN / eie bediener',
          b: ['Die derde modus koppel aan enige PokerTH-bediener wat jy of \u2019n vriend laat loop — op \u2019n tuisnetwerk, \u2019n private VPS, waar ook al. Tik die bediener se adres en poort in, merk TLS as die bediener \u2019n geënkripteerde poort gebruik, en meld aan met \u2019n bynaam (gasaanmelding werk as die bediener dit toelaat). By die tafel gedra alles hom daarna presies soos op die amptelike bediener.'] },
        { id: 'famboard', t: 'Gesinsranglys',
          b: ['Slegs op private bedieners en in LAN-spelle hou die kliënt saamgestelde statistieke per bynaam — hande en spelle wat gespeel en gewen is, grootste wins, beste reeks — en deel dit deur die bediener, sodat elke toestel om die tafel dieselfde ranglys sien. pokerth.net-spelle word nooit so nagespoor nie, en die oefenmodus se statistieke bly heeltemal apart.'] },
        { id: 'language', t: 'Taal',
          b: ['Die koppelvlak is in 45 tale beskikbaar. Verander dit enige tyd in Gevorderde opsies (die ratkieslys), kategorie Gebruikerskoppelvlak. Poker se aksieterme (Fold, Check, Call, Bet, Raise, All-In) bly volgens konvensie Engels, presies soos in die werkskermkliënt.'] },
        { id: 'pwa', t: 'Installeer as \u2019n program',
          b: ['Hierdie kliënt is \u2019n Progressive Web App: jy kan dit vanuit die blaaier se kieslys installeer (of met die installeerknoppie in die kopstuk) en \u2019n volskermprogram met sy eie ikoon kry. Nadat dit geïnstalleer is, begin dit onmiddellik, en die oefenmodus werk heeltemal vanlyn.'],
          note: 'Op Android en op werkskerm-Chrome/Edge doen die installeerknoppie alles. Op iPhone/iPad laat Apple installasie slegs deur Safari toe: Deel-knoppie \u2192 \u201cVoeg by tuisskerm\u201d — die kliënt wys hierdie stappe wanneer nodig. Die knoppie verdwyn sodra die program geïnstalleer is.' },
        { id: 'platforms', t: 'Platforms en blaaiers',
          b: ['Die kliënt loop in enige moderne blaaier op enige stelsel — Windows, macOS, Linux, Android, iOS. \u2019n Paar funksies steun op nuwer blaaier-API\u2019s; wanneer \u2019n API ontbreek, versteek die funksie hom of verduidelik dit, in plaas daarvan om te breek. Die vernaamste verskille om te weet:'],
          list: [
            'Chrome / Edge (werkskerm): alles werk, insluitend om die .pdb-log na \u2019n vouer te skryf.',
            'Firefox: alles behalwe om die .pdb na \u2019n vouer te skryf (API nog nie beskikbaar nie).',
            'Safari / iOS: installasie loop deur Deel \u2192 \u201cVoeg by tuisskerm\u201d; geen vibrasie nie; volskerm beperk op iPhone; klank begin ná jou eerste tik.',
            'Android: volle ondersteuning in Chromium-blaaiers, insluitend vibrasie en die Terug-knoppie se gedrag.'] },
        { id: 'avatar', t: 'Bynaam en avatar',
          b: ['Kies jou bynaam en avatar op die aanmeldskerm voordat jy koppel. Op pokerth.net is jou bynaam jou rekeningnaam; avatars word deur die avatarbediener met ander spelers gedeel.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Pokerreëls',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em in \u2019n neutedop',
          b: ['PokerTH word as No-Limit Texas Hold\u2019em gespeel. Elke speler kry twee toe kaarte (hole cards). Daarna word vyf gemeenskaplike kaarte met die prentkant boontoe in die middel van die tafel gelê. Die beste hand van vyf kaarte, gevorm uit enige kombinasie van jou twee kaarte en die vyf gemeenskaplikes, wen die pot.'] },
        { id: 'blinds', t: 'Die blinds en die delerknoppie',
          b: ['Voor elke hand voed twee verpligte insette die pot: die small blind en die big blind, geplaas deur die twee spelers links van die delerknoppie. Die knoppie skuif ná elke hand een plek kloksgewys aan, sodat almal om die beurt blinds betaal. Blinds styg met gereelde tussenposes deur die spel.',
              'Op die tafel word die knoppie en die blinds met fiches gemerk: D (deler), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Die vier insetrondtes',
          list: [
            'Pre-flop — nadat die toe kaarte uitgedeel is, begin die eerste insetrondte links van die big blind.',
            'Flop — drie gemeenskaplike kaarte word onthul, gevolg deur \u2019n insetrondte.',
            'Turn — \u2019n vierde gemeenskaplike kaart, dan nog \u2019n insetrondte.',
            'River — die vyfde en laaste gemeenskaplike kaart, dan die finale insetrondte.'],
          b: ['\u2019n Insetrondte eindig wanneer elke speler wat nog in die hand is dieselfde bedrag in die pot geplaas het (of all-in is).'] },
        { id: 'actions', t: 'Wat jy kan doen wanneer dit jou beurt is',
          list: [
            'Fold — gee die hand op. Jou kaarte gaan uit en jy ding nie meer om die pot mee nie.',
            'Check — gaan voort sonder om in te sit. Slegs moontlik wanneer daar niks te betaal is nie.',
            'Call — pas by die huidige inset aan.',
            'Bet — open die insette wanneer niemand nog op hierdie street ingesit het nie.',
            'Raise — verhoog bo-op \u2019n bestaande inset. Die kleinste verhoging is gelyk aan die vorige inset of verhoging.',
            'All-In — sit jou hele stapel in. Jy bly in die hand tot by die bedrag wat jy gedek het.'] },
        { id: 'showdown', t: 'Showdown en verdeelde potte',
          b: ['As verskeie spelers ná die insetrondte op die river oorbly, word die hande gewys en die beste wen — die wenkombinasie verskyn onder die gemeenskaplike kaarte. Wanneer \u2019n speler all-in is vir minder as die volle insette, ontstaan sypotte: elke speler kan slegs die deel van die pot wen waartoe hy bygedra het. Gelykop hande deel die pot.',
            'Nie almal moet wys nie: vanaf die laaste speler wat gewed of verhoog het, word \u2019n hand net oopgemaak as dit klop wat reeds oop lê. Wie mag muck, hou sy kaarte toe en kry \u2019n Show-knoppie om hulle tog te wys.'] },
        { id: 'hands', t: 'Rangorde van hande',
          b: ['Van die swakste tot die sterkste:'],
          list: [
            '1. High Card — geen kombinasie nie; die hoogste kaart beslis.',
            '2. Pair — twee kaarte van dieselfde waarde.',
            '3. Two Pair — twee verskillende pare.',
            '4. Three of a Kind — drie kaarte van dieselfde waarde.',
            '5. Straight — vyf opeenvolgende kaarte (die aas tel hoog of laag).',
            '6. Flush — vyf kaarte van dieselfde kleur.',
            '7. Full House — \u2019n drietal plus \u2019n paar.',
            '8. Four of a Kind — vier kaarte van dieselfde waarde.',
            '9. Straight Flush — \u2019n reeks, alles in een kleur.',
            '10. Royal Flush — van tien tot aas in een kleur. Die beste moontlike hand.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Die spelskerm',
      sections: [
        { id: 'actionbar', t: 'Die aksiebalk',
          b: ['Wanneer dit jou beurt is, gaan die onderste aksiebalk aan met tot vier knoppies: Fold (rooi), Check / Call (blou), Bet / Raise (groen — die hoofaksie, uitgelig) en All-In (donkerrooi). Die Check / Call-knoppie wys die presiese bedrag om te betaal; Bet / Raise wys die bedrag wat jy op die punt is om in te sit. Ná die river kan All-In in \u2019n Show-knoppie verander om jou kaarte te wys.'] },
        { id: 'betctl', t: 'Kies jou inset',
          b: ['Stel die verhogingsbedrag met die syferveld, die skuifbalk of die kitsknoppies 1/3 \u00b7 1/2 \u00b7 Pot (breuke van die huidige pot). Bedrae word outomaties afgerond en tussen die kleinste en grootste toegelate verhoging gehou. As jy eerder in big blinds dink, wys \u2019n opsie alle bedrae in BB in plaas van fiches.'] },
        { id: 'preselect', t: 'Kies \u2019n aksie vooraf',
          b: ['Voor jou beurt kan jy \u2019n aksie vooraf laai: tik \u2019n knoppie en dit kry \u2019n goue rand met \u2019n klein goue kolletjie. Wanneer jou beurt kom, word die aksie dadelik uitgevoer. \u2019n Gelaaide Fold word outomaties \u2019n Check wanneer check gratis is — jy gee nooit verniet op nie. Voorafkeuses word met elke nuwe hand, elke streetwissel en showdown teruggestel, en word gekanselleer as die situasie verander (byvoorbeeld as die bedrag om te betaal verander).'] },
        { id: 'automodes', t: 'Outomatiese modusse',
          b: ['Die aftreklys langs die aksieknoppies bied drie speelmodusse: Handmatig, Auto Check/Call en Auto Check/Fold. Die outomatiese modusse speel vir jou totdat jy terugskakel — enige handmatige klik op \u2019n aksie keer dadelik na Handmatig terug.'] },
        { id: 'readtable', t: 'Lees die tafel',
          b: ['Elke spelerblokkie wys die avatar, die naam, die stapel en die huidige inset. Die deler en die blinds word met D-/SB-/BB-fiches gemerk. \u2019n Gekleurde kentekentjie op die blokkie dui die speler se jongste aksie aan; \u2019n dun blou balkie tel sy dinktyd af. Die blokkie van die speler aan die beurt lig op; jou eie blokkie kry \u2019n kloppende goue raam wanneer dit jou beurt is.',
              'Die statusbalk bo die tafel wys die totale pot, die insette van die huidige street, die fase (Pre-flop, Flop, Turn, River) en die spel- en handnommers. Spelers wat gefold het se kaarte is deurskynend; uitgeskakelde spelers is verdof. Aan die einde van \u2019n hand kan \u2019n wenvenster opsom wie wat gewen het — in die opsies afskakelbaar.'] },
        { id: 'seatlayout', t: 'Uitleg van die sitplekke',
          b: ['As \u2019n webuitbreiding word die uitleg van die spelerblokkies in Gevorderde opsies \u2192 Sitplekke gekies: Outomaties volg die amptelike kliënt (vaste posisies regop, berekende ellips dwars), of dwing die Regop- of Dwarsuitleg af — en Pasgemaak laat jou elke sitplek self plaas: \u2019n redigeermodus verskyn waarin jy elke blokkie presies sleep waar jy wil, en die uitleg word gestoor.'] },
        { id: 'zoom', t: 'Tafelzoem (fone)',
          b: ['Op klein skerms vergroot die vergrootglasknoppies die tafel (2\u00d7) en jy kan dit met jou vinger sleep — jou eie blokkie en die aksiebalk bly staan. Die aansig volg die aktiewe sitplek outomaties en zoem by showdown uit vir die oorsig. In Gevorderde opsies afskakelbaar.'],
          note: 'Op fone en tablette is die blaaier se eie knypzoem by verstek geblokkeer sodat \u2019n zoembeweging nooit per ongeluk middel-in \u2019n hand afgaan nie; skakel dit weer aan in Gevorderde opsies \u2192 Gebruikerskoppelvlak as jy dit so verkies.' },
        { id: 'protections', t: 'Loerbeskerming en toevallige-Call-beskerming',
          b: ['Twee opsionele beskermings: die loerbeskerming hou jou eie kaarte toe totdat jy hulle raak (nuttig wanneer iemand jou skerm kan sien), en die toevallige-Call-wag sluit die Call-knoppie kortliks net ná \u2019n groot verhoging, sodat \u2019n tik wat vir \u2019n kleiner Call bedoel is nie per ongeluk op die verhoogde bedrag val nie. Albei is in Gevorderde opsies.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Die inligtingspaneel',
      sections: [
        { id: 'open', t: 'Maak die paneel oop',
          b: ['Tydens \u2019n spel word die inligtingspaneel vanuit die kopstuk oopgemaak (of Alt+L / Alt+I) en het drie oortjies: Log, Kanse en Statistieke. Op die foon sweef dit bo die tafel; op groter skerms is dit \u2019n skuifbare venster met verstelbare grootte — gryp die \u28ff-handvatsel om dit te skuif, die rande om die grootte te verander. Die posisie word onthou.'] },
        { id: 'log', t: 'Spellog',
          b: ['Die Log-oortjie teken die hele spel hand vir hand aan: die blinds, elke aksie met bedrae, gewysde kaarte en wenners, alles gekleur vir vinnige lees. Die uitvoerknoppie stoor die log in \u2019n lêer as jy \u2019n sessie later wil deurgaan.'] },
        { id: 'odds', t: 'Kanse (waarskynlikheidsmonitor)',
          b: ['Die Kanse-oortjie wys vir jou huidige hand die lewendige waarskynlikheid om met elk van die 10 handkategorieë te eindig — van High Card tot Royal Flush — elk met \u2019n ikoon, \u2019n persentasie en \u2019n balkie. Die vertoning verdof sodra jy fold. Dit gebruik slegs jou eie kaarte en die gemeenskaplikes: dit sien niks wat jou teenstanders nie wys nie.'] },
        { id: 'journal', t: 'Handlogboeke en die \u201cLogs\u201d-venster',
          b: ['Benewens die lewendige log word elke hand wat jy speel plaaslik in jou blaaier opgeneem, in dieselfde formaat as die amptelike kliënt se .pdb-loglêers. Die Logs-venster (Gevorderde opsies \u2192 Logboodskappe \u2192 Bestuur logs\u2026) lys jou sessies en laat jou daarmee werk: \u2019n sessie voorskou met soek en uitlig, per spel filter, na HTML of gewone teks uitvoer, die rou .pdb-lêer stoor, of \u2019n .pdb invoer wat die werkskermkliënt opgeneem het. Sessies word een vir een of almal tegelyk uitgevee (met bevestiging), en \u2019n outomatiese bewaring kan slegs die laaste 7, 30, 90, 180 of 365 dae hou. Logs wat jy self invoer, word nooit outomaties verwyder nie. ’n Tweede instelling beperk hoeveel sessies bewaar word, en die lyskolom kan breër gesleep word.',
              'Om verskeie sessies gelyktydig op te ruim, wys die Kies…-knoppie ’n merkblokkie by elke inskrywing: merk dié wat weg moet en Skrap verwyder die hele klomp ná een bevestiging. Op ’n rekenaar voeg Ctrl (⌘) + klik sessies een vir een by, en Shift + klik neem ’n hele reeks.',
              'Die Ontleed-knoppie voer \u2019n handontleding op \u2019n sessie uit en kan \u2019n log na pokerth.net se ontleedingsdiens stuur. Alles bly op jou toestel totdat jy uitdruklik uitvoer of stuur.'] },
        { id: 'logopts', t: 'Logopsies',
          b: ['Onder Gevorderde opsies \u2192 Logboodskappe kan jy aantekening aan- of afskakel en die skryfinterval kies, met dieselfde drie instellings as die werkskermkliënt: na elke aksie, na elke hand (verstek) of na elke spel. \u2019n Ander opsie skryf die .pdb-lêer na \u2019n vouer van jou keuse en hou dit op daardie interval op datum, plus nog een keer wanneer jy die bladsy verlaat, sodat \u2019n ander program die spel lewendig kan volg.'],
          note: 'Skryf na \u2019n plaaslike vouer benodig die File System Access API: net Chrome, Edge en Opera op die werkskerm. Elders verduidelik die opsie homself en handmatige uitvoer uit die Logs-venster bly beskikbaar. \u2019n Blaaier kan \u2019n lêer net vervang, nooit byvoeg nie, so \u2019n program wat die .pdb lees moet dit na elke verandering weer oopmaak.' },
        { id: 'assist', t: 'Hulp (handsterkte)',
          b: ['Bo-aan die Kanse-oortjie lees die hulpbanier jou hand vir jou. Voor die flop noem dit jou beginhand en gradeer dit met sterre; van die flop af wys dit jou huidige beste kombinasie en, ná \u2019n vinnige simulasie, jou geskatte kans om die hand te wen as \u2019n persentasie, met \u2019n kleuraanwyser van rooi (swak) tot groen (sterk). Soos die waarskynlikheidsmonitor gebruik dit slegs inligting wat jy kan sien.',
              'Twee vertoonstyle is in Gevorderde opsies \u2192 Sitplekke: Segmente (tien blokke) of \u2019n klassieke vorderingsbalk. Die hele hulpfunksie kan in Gevorderde opsies \u2192 Hulp afgeskakel word.'] },
        { id: 'assistwin', t: 'Die hulp as \u2019n swewende venstertjie',
          b: ['Die hulpblok kan van die paneel losgetrek word in sy eie klein venster wat altyd bo bly: gebruik die lostrekknoppie op die blok, skuif en skaal dit dan enige plek oor die tafel — handig om die handsterkte dop te hou sonder die hele paneel oop. Die dokknoppie sit dit terug in die Kanse-oortjie, en die posisie word onthou. Binne die paneel laat \u2019n sleephandvatsel tussen Hulp en die kanse jou die ruimte tussen die twee verdeel.'] },
        { id: 'stats', t: 'Statistieke',
          b: ['Die Statistieke-oortjie volg jou sessie: hande gespeel, flops gesien, showdowns, wenkoerse en meer. Statistiekopvolging kan in Gevorderde opsies afgeskakel word.'] },
        { id: 'hud', t: 'Statistiek-HUD by die sitplekke',
          b: ['Die HUD heg \u2019n klein statistiekkassie langs elke speler se sitplek, gebou uit die hande wat jy in jou logs opgeteken het: aantal hande waargeneem, dan VPIP (hoe gereeld hy pre-flop vrywillig geld insit), PFR (pre-flop verhogings) en AF (aggressiefaktor), met \u2019n kleurkode van passief tot aggressief. Daaronder som \u2019n kenteken die speler in woorde op \u2014 Styf-Passief, Los-Aggressief ensovoorts \u2014 langs \u2019n klein wyserplaat waarvan die verligte kwadrant van links na regs styf tot los lees, en van onder na bo passief tot aggressief. Die kenteken verskyn vanaf die heel eerste hand maar bly verdof tot 25 hande, waarvandaan dit betroubaar word. Tik op \u2019n kassie vir \u2019n gedetailleerde popover met al die syfers (3-bet, continuation bet, fold op 3-bet, steelpogings, showdown-koerse\u2026), en sleep dit weg as dit iets bedek.',
              'Die HUD ken slegs wat jy by jou eie tafels gesien het — dit lees jou plaaslike handlogs, dus moet opname aan wees, en die syfers word eers ná genoeg hande sinvol. Dit is by verstek af: skakel dit aan in Gevorderde opsies \u2192 Hulp.'] },
        { id: 'handsbtn', t: 'Oorsig van die kombinasies',
          b: ['Die pokerhand-ikoon op die tafeldoek maak enige tyd \u2019n vinnige oorsig van die 10 kombinasies oop — handig terwyl jy leer. Kan in Gevorderde opsies versteek word.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Klets en sosiaal',
      sections: [
        { id: 'panels', t: 'Voorportaalklets en tafelklets',
          b: ['Daar is een klets in die voorportaal en een by die tafel. Op die foon sweef die tafelklets oor die spel; op groter skerms is dit \u2019n skuifbare venster met verstelbare grootte. \u2019n Kentekentjie op die kletsknoppie tel ongeleesde boodskappe.'] },
        { id: 'typing', t: 'Tikhulpmiddels',
          list: [
            'Tab voltooi \u2019n bynaam — druk weer Tab om deur die passings te blaai.',
            '\u2191 / \u2193 blaai deur jou eie boodskapgeskiedenis.',
            'Die emoji-knoppie maak \u2019n volledige kieser oop; om : te tik stel ook emotes voor terwyl jy tik.'] },
        { id: 'emotes', t: 'Emotes en gesiggies',
          b: ['Die klets skakel emote-kodes presies soos die amptelike werkskermkliënt om: skryf \u2019n naam tussen twee dubbelpunte en dit word die emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 meer as 1 900 kodes word ondersteun (die volle GitHub-stel). Klassieke teksgesiggies word ook omgeskakel: :-) ;) :D xD :P <3 en sowat tagtig ander.',
              'Om : te tik maak \u2019n voorstelkassie oop wat die kode voltooi terwyl jy tik (\u2191/\u2193 om te kies, Tab of Enter om te aanvaar). Die emoji-omskakeling kan heeltemal afgeskakel word in Gevorderde opsies \u2192 Klets.'] },
        { id: 'commands', t: 'Kletsopdragte',
          b: ['Die klets verstaan skuinsstreepopdragte. Twee is vir ander sigbaar:'],
          keys: [
            ['/me <teks>', 'Aksieboodskap, vertoon as \u201c* joubynaam teks\u201d'],
            ['/emoji <emoji>', 'Speel \u2019n emoji-reaksie (dieselfde wat die reaksiekieser stuur)']] },
        { id: 'diagcmds', t: 'Diagnostiese opdragte',
          b: ['Al die res is plaaslik: net jy sien die antwoorde en niks word na die tafel gestuur nie. Tik /help om almal te lys. Die nuttigstes:'],
          keys: [
            ['/help', 'Lys alle opdragte'],
            ['/update', 'Kyk vir \u2019n nuwe weergawe en herlaai'],
            ['/lang <kode>', 'Verander taal (bv. /lang af)'],
            ['/sound on|off', 'Skakel spelklanke aan/stil'],
            ['/zoom', 'Wissel die tafelvergrootglas'],
            ['/clear', 'Maak die klets plaaslik skoon'],
            ['/table', 'Inligting oor die huidige spel (blinds, spelers, stapels)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnostiek van kliëntstatus, netwerk en vloeiendheid'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Gevorderde ontfouting (kaarte, protokol, klank, berging, sitplekke)'],
            ['/copy', 'Kopieer die laaste opdragantwoord na die knipbord']] },
        { id: 'reactions', t: 'Emoji-reaksies',
          b: ['Die reaksieknoppie maak \u2019n kieser met 30 geanimeerde reaksies oop (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) wat met \u2019n effek bo jou sitplek speel, sigbaar vir die hele tafel — ook vir spelers op die werkskermkliënt. Reaksies kan heeltemal in Gevorderde opsies afgeskakel word.'] },
        { id: 'translate', t: 'Verstaan almal',
          b: ['Met kletsvertaling aan verskyn ’n vertaalknoppie op die reël onder die wyser — of op die reël wat jy tik, op ’n raakskerm — en wys daardie boodskap in jou taal met die blaaier se vertaler. Dit kan permanent op alle reëls gewys word in Gevorderde opsies → Klets, waar die wenk wat die gewone tafelafkortings (gg, nh, utg…) verduidelik ook woon.'],
          note: 'Die vertaling gebruik die Google Translate-diens en werk in enige blaaier — al wat nodig is, is \u2019n internetverbinding. \u2019n Boodskap word slegs na die vertaaldiens gestuur wanneer jy sy vertaalknoppie tik, nooit outomaties nie.' },
        { id: 'social', t: 'Spelers: profiel, nooi, ignoreer',
          b: ['Tik enige speler — by die tafel of in die voorportaallys — om sy kaartjie oop te maak: profiel en statistieke, nooi hom na jou spel, of ignoreer hom (sy kletsboodskappe word versteek; ignoreer kan altyd ongedaan gemaak word). \u2019n Bevestiging voor nooi/ignoreer kan in die opsies aangeskakel word.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Voorportaal en spelle',
      sections: [
        { id: 'list', t: 'Die spellys',
          b: ['Die voorportaal lys al die bediener se tafels. Elke inskrywing wys die aantal spelers, die speltipe, \u2019n slot wanneer \u2019n wagwoord of uitnodiging nodig is, en \u2019n statuskentekentjie: \u201cWag\u201d (groen — die spel het nie begin nie, jy kan aansluit as daar \u2019n oop plek is), \u201cAan die gang\u201d (warm kleur — lewendig kykbaar wanneer toeskouers toegelaat word) en \u201cGesluit\u201d (verdof). \u2019n Vol tafel word eenvoudig aan sy vol teller herken, soos 10/10; die kentekenkleure volg die aktiewe tema.',
              'Die filteraftreklys vernou die lys presies soos die werkskermkliënt, met elke keuse strenger as die vorige: net oop spelle \u2192 met vol tafels ook versteek \u2192 dan net nie-private, net private, of net ranglysspelle. Jou keuse word onthou. Die soekveld vind \u2019n spel op naam, en die spelerkenteken maak die lys van almal aanlyn oop, deursoekbaar en sorteerbaar.'] },
        { id: 'join', t: 'Sluit aan en kyk',
          b: ['Kies \u2019n oop spel en sluit aan — \u2019n slot dui aan dat \u2019n wagwoord nodig is. Spelle wat aan die gang is en toeskouers toelaat, kan lewendig gekyk word: jy sien die tafel en die klets, maar die toe kaarte bly versteek en jy kan nie optree nie.'] },
        { id: 'gameinfo', t: 'Spelinligting',
          b: ['Voordat jy aansluit, wys die spelinligtingskaartjie alles wat die tafel bepaal: speltipe, blinds en hulle styging (verdubbeling of handmatige lys), beginstapel, aksietyd, ruskans tussen hande, en wie reeds sit.'] },
        { id: 'create', t: 'Skep \u2019n spel',
          b: ['Skep jou eie tafel: naam, aantal spelers, beginstapel, eerste small blind en verhogingskedule, aksietyd, en of toeskouers toegelaat word. Daar is vier speltipes: Normaal (almal), net geregistreerde spelers, net op uitnodiging, en Ranglys (tel vir die amptelike ranglys — geen wagwoord moontlik in daardie geval nie). Jou gunstelinginstellings kan gestoor en herlaai word.'] },
        { id: 'invites', t: 'Uitnodigings',
          b: ['Spelers kan jou na hulle tafel nooi; jy kry \u2019n kennisgewing wat jy kan aanvaar of weier. Om genooi te word, is die enigste manier om by \u2019n net-op-uitnodiging-spel in te kom.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Jou rekening',
          b: ['Die amptelike internetbediener is pokerth.net. Om daar te speel, vereis \u2019n gratis pokerth.net-rekening — registreer op die webwerf en meld dan hier aan met dieselfde bynaam en wagwoord. Hierdie webkliënt koppel aan presies dieselfde bediener as die werkskermkliënt: dieselfde rekeninge, dieselfde tafels, dieselfde ranglyste, en jy kan aan \u2019n tafel sit saam met spelers van die werkskermkliënt.'] },
        { id: 'ranked', t: 'Ranglysspelle en seisoene',
          b: ['Spelle van die tipe Ranglys tel vir die amptelike seisoenranglys. Jou profiel in die program wys jou registrasiedatum, jou Rank vir die huidige seisoen, jou Score, jou gemiddeld en jou gespeelde spelle, plus jou jongste uitslae. Normale (nie-ranglys) spelle is net vir die plesier en verander niks.'] },
        { id: 'rankhow', t: 'Hoe die ranglys bereken word',
          b: ['In elke gerangskikte spel verdien jou plek punte: 15 vir die eerste, dan 9, 6, 4, 3, 2 en 1 tot by die sewende; van die agtste tot die tiende niks. \u2019n Tafel deel dus altesaam 40 punte uit.',
              'Jou Score is nie die som van daardie punte nie, maar jou gemiddeld per spel, getemper deur \u2019n faktor wat groei met die aantal spele wat jy gespeel het: \u2019n handvol goeie uitslae is nie genoeg om bo te bly nie, dit verg ook gereeldheid — hoe meer jy speel, hoe nader kom jou Score aan jou werklike gemiddeld. \u2019n Seisoen duur \u2019n kwartaal: met die oorgang word alles geargiveer en die tellers begin weer op nul, terwyl vorige seisoene steeds besigtig kan word. In die spel wys die podium-knoppie die seisoenrangorde van die spelers aan jou tafel.'],
          note: 'Die puntskaal en die presiese formule word deur pokerth.net se ranglysbediener bepaal en kan verander; die bladsye op die webwerf geld.' },
        { id: 'rankings', t: 'Ranglysbladsye',
          b: ['Die ranglysinskrywing maak die amptelike PokerTH-ranglys oop, deursoekbaar per speler, sowel as die gemeenskapsranglyste (BBC, WEC). As ranglyste jou nie interesseer nie, kan die inskrywing in Gevorderde opsies \u2192 Gemeenskap versteek word.'] },
        { id: 'cups', t: 'Die gemeenskapsbekers: BBC en WeCup',
          b: ['Twee gemeenskappe hou hul eie kompetisies op pokerth.net, elk met sy eie webwerf en sy eie ranglys. Die Best Brainies Cup (BBC) is \u2019n trapkompetisie wat in 2013 ontstaan het: mens werk jou van Step 1 tot Step 4 op, en \u2019n nuwe seisoen begin ná elke Step 4-spel, wanneer die beker oorhandig word. Die WeCup (WEC) het sy eie, veel wyer skaal — 75 punte vir die eerste plek, dan 45, 30, 20… — en sy telling normaliseer jou gemiddeld aan die hand van hoeveel spele jy gespeel het in vergelyking met die ander lede.',
              'Albei ranglyste open by die beker-knoppie, langs die PokerTH-ranglys. Die tafelinstellings van hierdie kompetisies kom as voorafinstellings wanneer jy \u2019n spel skep (BBC Step 1 tot 4, WEC, WEC Monthly Final en WEC Grand Final), sodat jy onder dieselfde toestande kan oefen. Deelname verg registrasie op die webwerf van die betrokke beker.'],
          note: 'Interesseer bekers jou nie, versteek jy die hele inhoud met een greep in Gevorderde opsies → Gemeenskap.' },
        { id: 'forumcups', t: 'Forumbekers en geleenthede',
          b: ['Die forum van pokerth.net huisves ook die Monthly Cup, \u2019n maandelikse reeks waar spelers oor Gold-, Silver- en Bronze-tafels versprei word voordat die kampioen van die maand gekroon word, plus los spesiale bekers deur die jaar.',
              'Inskrywings, tye, tafelinstellings en uitslae word op die forum gepubliseer, en die spele word soos enige ander op die amptelike bediener gespeel. \u2019n pokerth.net-rekening is genoeg om die uitslae te volg; om vir \u2019n beker in te skryf, loop deur die ooreenstemmende forumdraad.'] },
        { id: 'forumnews', t: 'Forumnuus in die lobby',
          b: ['Die koerantknoppie in die lobby-kopstuk maak die nuutste plasings van die pokerth.net-forum oop, een inskrywing per onderwerp, elke forum met sy eie kleur. Die kenteken op die knoppie tel die ongeleeste plasings; om \'n plasing oop te maak (nuwe oortjie) merk dit as gelees, en “Merk alles as gelees” vee alles in een slag uit.',
              'Dit is \'n web-ekstra: die knoppie kan in Gevorderde opsies versteek word (“Forum-knoppie in die lobby-kopstuk”).'] },
        { id: 'avatars', t: 'Avatars en vlae',
          b: ['Op pokerth.net word jou avatar deur die avatarbediener aan ander spelers versprei, en \u2019n klein landsvlag kan op die spelerblokkies verskyn. Albei is opsioneel en in die opsies instelbaar.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Oefenmodus',
      sections: [
        { id: 'what', t: 'Wat dit is',
          b: ['Die Plaaslik / oefening-modus is \u2019n volwaardige spel teen rekenaarbeheerde teenstanders: geen verbinding, geen rekening, niks op die spel nie. Sodra die program geïnstalleer is (of selfs net een keer besoek is), werk dit heeltemal vanlyn — perfek om die spel te leer, die koppelvlak te toets of die tyd in vliegtuigmodus om te kry.'] },
        { id: 'setup', t: 'Stel \u2019n spel op',
          b: ['Kies die aantal teenstanders, die beginstapel, die blinds en hulle styging, en die spelspoed. Die bots se samestelling en moeilikheidsgraad word in Gevorderde opsies \u2192 Plaaslike spel verstel — van sagte teenstanders tot \u2019n taaier en meer wisselende tafel.'] },
        { id: 'trophies', t: 'Trofeë',
          b: ['Die oefenmodus het sy eie vordering: 28 trofeë in ses kategorieë (vordering, tegniek, styl, formate, pret en een geheime) word deur te speel ontsluit — hande gespeel, spelle gewen, groot bluf, spesiale hande en meer. Jou trofeëvordering is kumulatief en word tussen toestelle saamgevoeg wanneer die rekening se instellingsinchronisasie aan is.'] },
        { id: 'learn', t: '\u2019n Goeie plek om te leer',
          b: ['Alles wat in die ander hoofstukke beskryf word, werk ook hier: die waarskynlikheidsmonitor, die hulpvertoning, die voorafkeuse, die sleutelbordkortpaaie. Die oefenmodus is die beste plek om hulle sonder druk te probeer voordat jy jou op pokerth.net werp.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Styl en klank',
      sections: [
        { id: 'themes', t: 'Temas',
          b: ['Die Styl-kategorie van Gevorderde opsies klee die hele kliënt aan. Voorafinstellings stel alles met een tik op (die klassieke groen casino, die amptelike PokerTH-voorkoms\u2026); daaronder verstel afsonderlike asse elk apart die kleurpalet, die tafeldoek en die kaartvoorkante — verander enige as en jou mengsel word \u2019n pasgemaakte tema. Donker, lig of outomaties word in Gebruikerskoppelvlak gekies, en jou keuses geld dadelik, op elke skerm, en word onthou.'] },
        { id: 'tablelook', t: 'Tafels, pakke, sitplekke',
          b: ['Benewens die tema kan verskeie elemente onafhanklik verruil word: die tafelagtergrond, die kaartpak, die kaartrug (pas outomaties by die pak, of voer jou eie prent in), die deler- en blindfiches, die styl van die aksieknoppies, en volledige sitplekpakkette wat die spelerblokkies oortrek. Kies alles in Gevorderde opsies \u2192 Styl; die veranderinge is dadelik by die tafel sigbaar.'] },
        { id: 'music', t: 'Musiekspeler',
          b: ['Die musiekinskrywing in die kopstukkieslyste maak \u2019n klein agtergrondmusiekspeler oop: kies \u2019n snit uit die speellys, speel/wag, vorige/volgende, skommel, en herhaal een snit, die hele lys of niks. Volume, gekose snit en herhaalmodus word onthou. Die weergawe begin nooit vanself nie — blaaiers vereis \u2019n tik — en die speler is heeltemal onafhanklik van die spel se klankeffekte.'] },
        { id: 'sounds', t: 'Klankeffekte',
          b: ['Die spelklanke is in vier afsonderlik skakelbare kategorieë gegroepeer, presies soos in die werkskermkliënt: spelaksies (kaarte uitgedeel, Check, Call, Raise, jou beurt\u2026), voorportaalkletskennisgewing, netwerkspelkennisgewings (speler het gekoppel, spel gereed) en blindstygingskennisgewing. Een volumeskuifbalk beheer almal, in Gevorderde opsies \u2192 Klank.'],
          note: 'Alle blaaiers — veral iOS — weier om klank te speel voordat jy die bladsy een keer geraak het. As \u2019n spel stil begin, wek een tik enige plek die klank; die kliënt herstel ook die klankenjin outomaties wanneer iOS dit opskort (inkomende oproep, agtergrond\u2026).' },
        { id: 'voice', t: 'Stem en vibrasie',
          b: ['Twee ekstra kanale kan jou ingelig hou sonder om na die skerm te kyk: stemaankondigings lees spelgebeure hardop deur jou toestel se spraaksintese, en op die foon kan \u2019n kort vibrasie jou beurt merk. Albei is webuitbreidings, by verstek aan of af na gelang van die toestel, in Gevorderde opsies \u2192 Insette en beurt.'],
          note: 'Vibrasie werk op Android (Chromium-blaaiers); Apple stel nie \u2019n vibrasie-API aan webwerwe beskikbaar nie, dus kan iPhones nie vibreer nie. Stemaankondigings werk oral, maar die beskikbare stemme en tale hang van jou stelsel af — die kliënt gebruik die beste passing wat dit vind.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opsies en kortpaaie',
      sections: [
        { id: 'where', t: 'Waar die opsies bly',
          b: ['Gevorderde opsies word deur die ratinskrywing in enige kopstukkieslys oopgemaak. Hulle is soos in die werkskermkliënt gegroepeer: Gebruikerskoppelvlak, Styl, Klank, Plaaslike spel, Netwerkspel, Internetspel, Byname / Avatars, Logboodskappe, en Herstel verstek. Elke webspesifieke funksie het daar sy eie skakelaar, sodat jy alles kan afskakel wat jy nie gebruik nie.'] },
        { id: 'cfgxml', t: 'Ruil instellings met die werkskermkliënt',
          b: ['Jou instellings kan tussen kliënte reis: die Logboodskappe-kategorie bied uitvoer/invoer van die amptelike config.xml-lêer (daardie \u007e/.pokerth/config.xml wat die werkskerm- en QML-kliënte gebruik). Die uitvoer skryf die gedeelde instellings — naam, vertoonopsies, klanke, tafelvoorkeure, blinds, style — en die invoer pas \u2019n lêer van die werkskerm hier toe. Instellings wat hierdie kliënt nie ken nie, bly onaangeraak in die lêer.'] },
        { id: 'sync', t: 'Instellings wat jou volg',
          b: ['Wanneer jy met \u2019n rekening speel, word jou opsies, jou tema, jou sleutelbindings, jou taal en jou oefentrofeë gesinchroniseer: verander iets op een toestel en die volgende toestel waarop jy aanmeld, tel dit op. Trofeëvordering word saamgevoeg, nooit oorgeskryf nie, dus behou speel op twee toestelle altyd die beste van albei.'] },
        { id: 'updates', t: 'Bly op datum',
          b: ['Die kliënt werk homself by: wanneer \u2019n nuwe weergawe uitgerol word, nooi \u2019n banier jou om te herlaai (of tik /update in die klets om handmatig te kyk). Van tyd tot tyd kan \u2019n klein produkopname verskyn wat jou mening oor \u2019n funksie vra — deelname is opsioneel, en opnames kan heeltemal in Gevorderde opsies \u2192 Gemeenskap afgeskakel word.'] },
        { id: 'fkeys', t: 'Amptelike sleutelbordkortpaaie',
          b: ['Die amptelike PokerTH-funksiesleutels werk tydens \u2019n spel \u2014 Alt+S werk oral:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (volgorde kan in die opsies omgekeer word)'],
            ['F5', 'Wys jou kaarte (wanneer moontlik)'],
            ['F6 / F7 / F8', 'Handmatig \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Handmatig \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Klets \u00b7 Log \u00b7 Kansepaneel'],
            ['Alt+S', 'Instellings — oral in die toepassing, nie net tydens ’n spel nie'],
            ['F11', 'Volskerm']],
          note: 'Die kortpaaie vereis \u2019n fisiese sleutelbord. Op Mac beheer die F-sleutels by verstek die media: hou Fn in (of skakel \u201cGebruik F1-, F2-sleutels ens. as standaardfunksiesleutels\u201d in die macOS-instellings aan). Op iPhone word volskerm deur iOS beperk — om die program as \u2019n PWA te installeer, gee dieselfde volskermervaring.' },
        { id: 'webkeys', t: 'Webletterselsleutels',
          b: ['Webuitbreiding: enkelletter-sleutels en Alt+T voer ook aksies uit, en almal kan in Gevorderde opsies → Sleutelbordkortpaaie hertoegeken word:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Statistiekpaneel'],
            ['Esc', 'Maak die voorste venster toe (ook Android se Terug-knoppie)']],
          note: 'Op Android maak die stelsel se Terug-knoppie/gebaar vensters toe soos Esc, eerder as om die spel te verlaat (in die opsies instelbaar). iOS het geen ekwivalente stelselknoppie nie — gebruik elke venster se \u2715.' }
      ]
    }
  ]
};
