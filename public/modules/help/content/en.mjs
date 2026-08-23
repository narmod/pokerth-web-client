// ── help/content/en.mjs — English help corpus (reference language) ──────────
//
// Structure: chapters[] → { id, icon, title, sections[] }.
// Section: { id, t (title), b (paragraphs[]), list (bullets[]), keys ([kbd,
// label][]) }. Plain text only — the renderer escapes everything.
// TO TRANSLATE: copy this file to <lang>.mjs and translate every t/b/list
// value and the keys[] labels (NOT the key names). Keep poker action terms
// (Fold, Check, Call, Bet, Raise, All-In) in English, as everywhere else.
// An empty sections[] shows the localized helpWip note (none currently).
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Getting started',
      sections: [
        { id: 'modes', t: 'Three ways to play',
          b: ['From the login screen, pick how you want to play.'],
          list: [
            'Internet — play online on the official pokerth.net server, with rankings. A pokerth.net account is required; register for free on pokerth.net.',
            'Local / training — play offline against bots. Nothing to set up, works without a connection, and unlocks trophies as you progress.',
            'LAN / Dedicated server — connect to a private PokerTH server on your local network or your own machine.'] },
        { id: 'lan', t: 'LAN / dedicated server',
          b: ['The third mode connects to any PokerTH server you or a friend runs \u2014 on a home network, a private VPS, anywhere. Enter the server\u2019s address and port, tick TLS if the server uses an encrypted port, and log in with a nickname (guest access works if the server allows it). Everything at the table then behaves exactly like on the official server.'] },
        { id: 'famboard', t: 'Family leaderboard',
          b: ['On private servers and LAN games only, the client keeps lifetime statistics per nickname \u2014 hands and games played and won, biggest win, best streak \u2014 and shares them through the server so every device around the table sees the same leaderboard. pokerth.net games are never tracked this way, and training-mode stats are kept completely separate.'] },
        { id: 'language', t: 'Language',
          b: ['The interface is available in 45 languages. Change it any time in Advanced options (gear menu) under User interface. Poker action terms (Fold, Check, Call, Bet, Raise, All-In) stay in English by convention, exactly like the desktop client.'] },
        { id: 'pwa', t: 'Install as an app',
          b: ['This client is a Progressive Web App: you can install it from your browser menu (or the install button in the header) to get a full-screen app with its own icon. Once installed it starts instantly and the training mode works fully offline.'],
          note: 'On Android and desktop Chrome/Edge, the install button does everything. On iPhone/iPad, Apple only allows installation through Safari: Share button \u2192 \u201cAdd to Home Screen\u201d \u2014 the client shows these steps when needed. The button disappears once the app is installed.' },
        { id: 'platforms', t: 'Platforms and browsers',
          b: ['The client runs in any modern browser on any system \u2014 Windows, macOS, Linux, Android, iOS. A few features rely on newer browser APIs; when an API is missing, the feature hides itself or explains why instead of breaking. The main differences to know:'],
          list: [
            'Chrome / Edge (desktop): everything works, including writing the .pdb log to a folder.',
            'Firefox: everything except writing the .pdb log to a folder (API not available yet).',
            'Safari / iOS: install goes through Share \u2192 Add to Home Screen; no vibration; fullscreen is limited on iPhone; sound starts after your first tap.',
            'Android: full support in Chromium browsers, including vibration and the Back-button behavior.'] },
        { id: 'avatar', t: 'Nickname and avatar',
          b: ['Pick your nickname and avatar on the login screen before connecting. On pokerth.net, your nickname is your account name; avatars are shared with other players through the avatar server.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Poker rules',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em in short',
          b: ['PokerTH plays No-Limit Texas Hold\u2019em. Each player receives two private cards (the hole cards). Five community cards are then dealt face up in the middle of the table. The best five-card hand made from any combination of your two cards and the five community cards wins the pot.'] },
        { id: 'blinds', t: 'Blinds and the dealer button',
          b: ['Before each hand, two forced bets seed the pot: the small blind and the big blind, posted by the two players left of the dealer button. The button moves one seat clockwise after every hand, so everyone pays the blinds in turn. Blinds increase at regular intervals as the game goes on.',
              'On the table, the button and blinds are marked with pucks: D (dealer), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'The four betting rounds',
          list: [
            'Pre-flop — after the hole cards are dealt, the first betting round starts left of the big blind.',
            'Flop — three community cards are revealed, followed by a betting round.',
            'Turn — a fourth community card, then another betting round.',
            'River — the fifth and last community card, then the final betting round.'],
          b: ['A betting round ends when every player still in the hand has put the same amount into the pot (or is all-in).'] },
        { id: 'actions', t: 'What you can do on your turn',
          list: [
            'Fold — give up the hand. Your cards are mucked and you no longer compete for the pot.',
            'Check — pass without betting. Only possible when nothing is to call.',
            'Call — match the current bet.',
            'Bet — open the betting when nobody has bet yet on this street.',
            'Raise — increase over an existing bet. The minimum raise equals the previous bet or raise.',
            'All-In — put your entire stack in. You stay in the hand up to the amount you covered.'] },
        { id: 'showdown', t: 'Showdown and split pots',
          b: ['If more than one player remains after the river betting round, hands are revealed and the best hand wins \u2014 the winning combination is shown under the community cards. When a player is all-in for less than the full bets, side pots are created: each player can only win the part of the pot they contributed to. Equal hands split the pot.',
            'Not everyone has to reveal: starting from the last player to bet or raise, a hand is only exposed if it beats what is already face up. Anyone entitled to muck keeps their cards hidden and gets a Show button to reveal them anyway.'] },
        { id: 'hands', t: 'Hand rankings',
          b: ['From weakest to strongest:'],
          list: [
            '1. High Card — no combination; the highest card decides.',
            '2. Pair — two cards of the same rank.',
            '3. Two Pair — two different pairs.',
            '4. Three of a Kind — three cards of the same rank.',
            '5. Straight — five cards in sequence (the Ace counts high or low).',
            '6. Flush — five cards of the same suit.',
            '7. Full House — three of a kind plus a pair.',
            '8. Four of a Kind — four cards of the same rank.',
            '9. Straight Flush — a straight, all in one suit.',
            '10. Royal Flush — Ten to Ace, all in one suit. The best possible hand.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'The game screen',
      sections: [
        { id: 'actionbar', t: 'The action bar',
          b: ['When it is your turn, the action bar at the bottom lights up with up to four buttons: Fold (red), Check / Call (blue), Bet / Raise (green \u2014 the highlighted primary action) and All-In (dark red). The Check / Call button shows the exact amount to call; Bet / Raise shows the amount you are about to put in. After the river, All-In can turn into a Show button to reveal your cards.'] },
        { id: 'betctl', t: 'Choosing your bet',
          b: ['Set the raise amount with the number field, the slider, or the quick buttons 1/3 \u00b7 1/2 \u00b7 Pot (fractions of the current pot). Amounts are automatically rounded and kept between the minimum and maximum legal raise. If you prefer thinking in big blinds, an option displays all amounts in BB instead of chips.'] },
        { id: 'preselect', t: 'Pre-selecting an action',
          b: ['Before your turn, you can arm an action in advance: tap a button and it gets a gold border with a small gold dot. When your turn comes, the action plays instantly. A pre-armed Fold automatically becomes a Check when checking is free \u2014 you never fold for nothing. Pre-selections reset at every new hand, street change and showdown, and are cancelled if the situation changes (for example the call amount changes).'] },
        { id: 'automodes', t: 'Auto modes',
          b: ['The dropdown next to the action buttons offers three playing modes: Manual, Auto Check/Call and Auto Check/Fold. The auto modes play for you until you switch back \u2014 any manual click on an action returns to Manual immediately.'] },
        { id: 'readtable', t: 'Reading the table',
          b: ['Each player box shows the avatar, name, stack and current bet. The dealer and blinds are marked with D / SB / BB pucks. A colored badge on the box shows the player\u2019s last action; a thin blue bar counts down their thinking time. The box of the player whose turn it is glows; your own box gets a pulsing gold frame on your turn.',
              'The status bar above the table shows the total pot, the bets of the current street, the phase (Pre-flop, Flop, Turn, River) and the game and hand numbers. Folded players have translucent cards; eliminated players are dimmed. At the end of a hand, a winner window can sum up who won what \u2014 it can be turned off in the options.'] },
        { id: 'seatlayout', t: 'Seat placement',
          b: ['As a web extension, the arrangement of the player boxes can be chosen in Advanced options \u2192 Seats: Automatic follows the official client (fixed slots in portrait, computed ellipse in landscape), or force the Portrait or Landscape arrangement \u2014 and Custom lets you place every seat yourself: an edit mode appears where you drag each box exactly where you want it, and the layout is saved.'] },
        { id: 'zoom', t: 'Table zoom (phones)',
          b: ['On small screens, magnifier buttons zoom the table (2\u00d7) and you can pan with a finger \u2014 your own box and the action bar stay fixed. The view follows the active seat automatically and zooms back out at showdown for the overview. This can be turned off in Advanced options.'],
          note: 'On phones and tablets, the browser\u2019s own pinch-zoom is blocked by default so a zoom gesture never fires mid-hand by accident; re-enable it in Advanced options \u2192 User interface if you prefer.' },
        { id: 'protections', t: 'Anti-peek and accidental-call protection',
          b: ['Two optional protections: Anti-peek keeps your own cards hidden until you tap them (useful when someone can see your screen), and the accidental-call guard briefly blocks the Call button right after a big raise, so a tap aimed at a smaller call cannot hit the raised amount by accident. Both live in Advanced options.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Info panel',
      sections: [
        { id: 'open', t: 'Opening the panel',
          b: ['During a game, the info panel opens from the header (or Alt+L / Alt+I) and has three tabs: Log, Chances and Stats. On phones it floats over the table; on larger screens it is a draggable, resizable window \u2014 grab the \u28ff grip to move it, the edges to resize. Its position is remembered.'] },
        { id: 'log', t: 'Game log',
          b: ['The Log tab records the whole game hand by hand: blinds, every action with amounts, revealed cards and winners, color-coded for quick reading. The export button saves the log as a file if you want to review a session later.'] },
        { id: 'odds', t: 'Chances (odds monitor)',
          b: ['The Chances tab shows, for your current hand, the live probability of ending up with each of the 10 hand categories \u2014 from High Card to Royal Flush \u2014 each with its icon, percentage and bar. The display grays out once you fold. It only ever uses your own cards and the community cards: it sees nothing your opponents don\u2019t show.'] },
        { id: 'journal', t: 'Hand logs and the Logs window',
          b: ['Beyond the live log, every hand you play is recorded locally in your browser, in the same format as the official client\u2019s .pdb log files. The Logs window (Advanced options \u2192 Log messages \u2192 Manage logs\u2026) lists your sessions and lets you work with them: preview a session with search and highlighting, filter by game, export as HTML or plain text, save the raw .pdb file, or import a .pdb recorded by the desktop client. Sessions can be deleted one by one or all at once (with confirmation), and an automatic retention setting can keep only the last 7, 30, 90, 180 or 365 days. Logs you import yourself are never removed automatically. A second setting caps how many sessions are kept, and the list column can be dragged wider.',
              'To clear out several sessions at once, the Select… button turns the list into tick boxes: tick the ones you want gone and Delete removes the whole batch after a single confirmation. On a computer you can also Ctrl (⌘) + click to add sessions one by one, or Shift + click to take a whole range.',
              'The Analyse button runs a hand analysis over a session and can send a log to the pokerth.net analysis service. Everything stays on your device unless you explicitly export or upload it.'] },
        { id: 'logopts', t: 'Logging options',
          b: ['In Advanced options \u2192 Log messages you can turn logging on or off and choose the write interval, with the same three settings as the desktop client: after every action, after every hand (the default) or after every game. Another option writes the .pdb file into a folder of your choice and keeps it up to date at that interval, and once more when you leave the page, so another tool can follow the game live.'],
          note: 'Writing into a local folder needs the File System Access API: desktop Chrome, Edge and Opera only. Elsewhere the option explains itself and manual export from the Logs window stays available. A browser can only replace a file, never append to it, so a tool reading the .pdb should reopen it after each change.' },
        { id: 'assist', t: 'Assistance (hand strength)',
          b: ['At the top of the Chances tab, the assistance banner reads your hand for you. Before the flop it names your starting hand and rates it with stars; from the flop on it shows your current best combination and, after a quick simulation, your estimated chance of winning the hand as a percentage, with a color gauge from red (weak) to green (strong). Like the odds monitor, it only uses information you can see.',
              'Two display styles are available in Advanced options \u2192 Seats: Segments (ten blocks) or a classic progress bar. The whole assistance feature can be switched off in Advanced options \u2192 Assistance.'] },
        { id: 'assistwin', t: 'Assistance as a floating widget',
          b: ['The assistance block can be detached from the panel into its own small always-on-top window: use the detach button on the block, then move and resize it anywhere over the table \u2014 handy to keep an eye on your hand strength without the full panel open. The dock button puts it back into the Chances tab, and its position is remembered. Inside the panel, a drag handle between Assistance and the odds lets you share the space between the two.'] },
        { id: 'stats', t: 'Stats',
          b: ['The Stats tab tracks your session: hands played, flops seen, showdowns, win rates and more. Statistics tracking can be turned off in Advanced options.'] },
        { id: 'hud', t: 'Stats HUD on the seats (beta)',
          b: ['The HUD attaches a small statistics box next to each player\u2019s seat, built from the hands you have recorded in your logs: number of hands observed, then VPIP (how often they voluntarily put money in pre-flop), PFR (pre-flop raises) and AF (aggression factor), color-coded from passive to aggressive. Under them a badge sums the player up in plain words \u2014 Tight-Passive, Loose-Aggressive and so on \u2014 next to a small dial whose lit quadrant reads left to right for tight to loose, and bottom to top for passive to aggressive. The badge shows from the very first hand but stays dimmed until 25 hands, where it becomes reliable. Tap a box for a detailed popover with the full set of numbers (3-bet, continuation bet, fold to 3-bet, steal attempts, showdown rates\u2026), and drag a box to move it if it covers something.',
              'The HUD only knows what you have seen at your own tables \u2014 it reads your local hand logs, so logging must be enabled and the numbers get meaningful after enough hands. It is a beta feature, off by default: enable it in Advanced options \u2192 Assistance.'] },
        { id: 'handsbtn', t: 'Hand combinations overview',
          b: ['The poker-hands icon on the felt opens a quick overview of the 10 combinations at any time \u2014 handy while learning. It can be hidden in Advanced options.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat & social',
      sections: [
        { id: 'panels', t: 'Lobby chat and game chat',
          b: ['There is a chat in the lobby and one at the table. On phones the game chat floats over the table; on larger screens it is a draggable, resizable window. A badge on the chat button counts unread messages.'] },
        { id: 'typing', t: 'Typing helpers',
          list: [
            'Tab completes a nickname \u2014 press Tab again to cycle through matches.',
            '\u2191 / \u2193 browse your own message history.',
            'The emoji button opens a full picker; typing : also suggests emotes as you type.'] },
        { id: 'emotes', t: 'Emotes and smileys',
          b: ['The chat converts emote shortcodes exactly like the official desktop client: type a name between colons and it becomes the emoji \u2014 :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 more than 1,900 codes are supported (the full GitHub set). Classic text smileys are converted too: :-) ;) :D xD :P <3 and about eighty others.',
              'Typing : opens a suggestion popup that completes the code as you type (\u2191/\u2193 to pick, Tab or Enter to accept). Emoji conversion can be disabled entirely in Advanced options \u2192 Chat.'] },
        { id: 'commands', t: 'Chat commands',
          b: ['The chat understands slash commands. Two are visible to others:'],
          keys: [
            ['/me <text>', 'Action message, shown as \u201c* yourname text\u201d'],
            ['/emoji <emoji>', 'Plays an emoji reaction (what the reaction picker sends)']] },
        { id: 'diagcmds', t: 'Diagnostic commands',
          b: ['Everything else is local: the replies are shown only to you and nothing is sent to the table. Type /help to list them all. The most useful ones:'],
          keys: [
            ['/help', 'List all commands'],
            ['/update', 'Check for a new version and refresh'],
            ['/lang <code>', 'Switch language (e.g. /lang fr)'],
            ['/sound on|off', 'Toggle game sounds'],
            ['/zoom', 'Toggle the table magnifier'],
            ['/clear', 'Clear the chat locally'],
            ['/table', 'Current game info (blinds, players, stacks)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Client state, network and framerate diagnostics'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Advanced debugging (cards, protocol, audio, storage, seats)'],
            ['/copy', 'Copy the last command reply to the clipboard']] },
        { id: 'reactions', t: 'Emoji reactions',
          b: ['The reaction button opens a picker of 30 animated reactions (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) that play with an effect above your seat, visible to everyone at the table \u2014 including players on the desktop client. Reactions can be disabled entirely in Advanced options.'] },
        { id: 'translate', t: 'Understanding everyone',
          b: ['With chat translation enabled, a translate button appears on the line under your pointer \u2014 or on the line you tap, on a touch screen \u2014 and renders that message in your language using the browser\u2019s built-in translator. It can be shown permanently on every line in Advanced options \u2192 Chat, where the tooltip explaining common table abbreviations (gg, nh, utg\u2026) also lives.'],
          note: 'Translation uses the Google Translate service and works in every browser \u2014 it just needs an internet connection. A message is only sent to the translation service when you tap its translate button, never automatically.' },
        { id: 'social', t: 'Players: profile, invite, ignore',
          b: ['Tap any player \u2014 at the table or in the lobby list \u2014 to open their card: profile and stats, invite them to your game, or ignore them (their chat messages are hidden; ignoring is reversible at any time). A confirmation before invite/ignore can be enabled in the options.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby & games',
      sections: [
        { id: 'list', t: 'The game list',
          b: ['The lobby lists every table on the server. Each entry shows the player count, the game type, a padlock when a password or an invitation is required, and a status badge: \u201cWaiting\u201d (green \u2014 the game has not started, you can join if a seat is free), \u201cIn progress\u201d (warm color \u2014 watchable live when spectators are allowed) and \u201cClosed\u201d (dimmed). A full table simply shows a full count, like 10/10; badge colors follow the active theme.',
              'The filter dropdown narrows the list exactly like the desktop client, each choice stricter than the previous one: open games only \u2192 also hiding full tables \u2192 then only non-private, only private, or only ranking games. Your choice is remembered. The search field finds a game by name, and the players pill opens the list of everyone online, searchable and sortable.'] },
        { id: 'join', t: 'Joining and spectating',
          b: ['Select an open game and join it \u2014 a padlock means a password is required. Running games that allow spectators can be watched live: you see the table and chat, but hole cards stay hidden and you cannot act.'] },
        { id: 'gameinfo', t: 'Game info',
          b: ['Before joining, the game info card shows everything that defines the table: game type, blinds and how they increase (doubling or a manual list), start cash, action timeout, delay between hands, and who is already seated.'] },
        { id: 'create', t: 'Creating a game',
          b: ['Create your own table: name, number of players, start cash, first small blind and raise schedule, action timeout, and whether spectators are allowed. Four game types exist: Normal (anyone), registered-players-only, invite-only, and Ranking (counts toward the official ranking \u2014 no password allowed there). Your favorite settings can be saved and reloaded.'] },
        { id: 'invites', t: 'Invitations',
          b: ['Players can invite you to their table; you get a notification you can accept or decline. Being invited is the only way into an invite-only game.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Your account',
          b: ['The official Internet server is pokerth.net. Playing there requires a free pokerth.net account \u2014 register on the website, then log in here with the same nickname and password. This web client connects to the very same server as the desktop client: same accounts, same tables, same rankings, and you can sit at a table with desktop players.'] },
        { id: 'ranked', t: 'Ranking games and seasons',
          b: ['Games of type Ranking count toward the official season ranking. Your in-app profile shows when you joined, your current season\u2019s Rank, Score, average and games played, plus your latest results. Regular (non-ranking) games are just for fun and change nothing.'] },
        { id: 'rankhow', t: 'How the ranking is calculated',
          b: ['In every ranked game your finishing place earns points: 15 for first, then 9, 6, 4, 3, 2 and 1 down to seventh; eighth to tenth get nothing. A table therefore hands out 40 points in total.',
              'Your Score is not the sum of those points but your average per game, tempered by a factor that grows with the number of games played: a handful of good results is not enough to settle at the top, it also takes regularity — the more you play, the closer your Score gets to your true average. Seasons last a quarter: at the switch everything is archived and the counters start again from zero, with past seasons still available. In game, the podium button shows the season ranking of the players at your table.'],
          note: 'The point scale and the exact formula are set by the pokerth.net ranking server and may change; the pages on the site are the reference.' },
        { id: 'rankings', t: 'Ranking pages',
          b: ['The ranking entry opens the official PokerTH ranking, searchable by player, along with the community rankings (BBC, WEC). If you don\u2019t care about rankings, the entry can be hidden in Advanced options \u2192 Community.'] },
        { id: 'cups', t: 'The community cups: BBC and WeCup',
          b: ['Two communities run their own competitions on pokerth.net, each with its own site and ranking. The Best Brainies Cup (BBC) is a step tournament born in 2013: you work your way from Step 1 to Step 4, and a new season starts after each Step 4 game, when the cup is awarded. The WeCup (WEC) has its own scale, far more spread out — 75 points for first place, then 45, 30, 20… — and its score normalises your average against the number of games you have played compared with the other members.',
              'Both rankings open from the trophy button, next to the PokerTH ranking. The table settings of these competitions ship as presets when you create a game (BBC Step 1 to 4, WEC, WEC Monthly Final and WEC Grand Final), so you can practise under the same conditions. Taking part requires signing up on the site of the cup concerned.'],
          note: 'These contents can be hidden in one go in Advanced options → Community if cups are not your thing.' },
        { id: 'forumcups', t: 'Forum cups and events',
          b: ['The pokerth.net forum also hosts the Monthly Cup, a monthly series where players are spread across Gold, Silver and Bronze tables before the champion of the month is crowned, plus one-off special cups through the year.',
              'Sign-ups, schedules, table settings and results are published on the forum, and the games are played on the official server like any other. A pokerth.net account is enough to follow the results; entering a cup goes through the matching forum thread.'] },
        { id: 'forumnews', t: 'Forum news in the lobby',
          b: ['The newspaper button in the lobby header opens the latest posts from the pokerth.net forum, one entry per topic, each forum with its own colour. The badge on the button counts unread posts; opening a post (new tab) marks it as read, and “Mark all as read” clears everything at once.',
              'This is a web extra: the button can be hidden in Advanced options (“Forum button in the lobby header”).'] },
        { id: 'avatars', t: 'Avatars and flags',
          b: ['On pokerth.net your avatar is distributed to other players through the avatar server, and a small country flag can be shown on player boxes. Both are optional and configurable in the options.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Training mode',
      sections: [
        { id: 'what', t: 'What it is',
          b: ['Local / training mode is a full game against computer opponents: no connection, no account, nothing at stake. Once the app is installed (or simply visited once), it works completely offline \u2014 perfect for learning the game, testing the interface or passing time in airplane mode.'] },
        { id: 'setup', t: 'Setting up a game',
          b: ['Choose the number of opponents, start cash, blinds and raise schedule, and game speed. The bot line-up and difficulty can be adjusted in Advanced options \u2192 Local game \u2014 from gentle opponents to a tougher, mixed table.'] },
        { id: 'trophies', t: 'Trophies',
          b: ['Training mode has its own progression: 28 trophies across six categories (progress, skill, style, formats, fun and a secret one) unlock as you play \u2014 hands played, games won, big bluffs, special hands and more. Your trophy progress is cumulative and merges across devices when account settings sync is active.'] },
        { id: 'learn', t: 'A good place to learn',
          b: ['Everything from the other chapters works here too: the odds monitor, the assistance display, pre-selection, keyboard shortcuts. Training mode is the best place to try them without pressure before heading to pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Style & sound',
      sections: [
        { id: 'themes', t: 'Themes',
          b: ['The Style category of Advanced options restyles the whole client. Presets set everything in one tap (the classic green casino, the official PokerTH look\u2026); below them, individual axes let you fine-tune the color palette, the table felt and the card faces separately \u2014 change any axis and your mix becomes a custom theme. Dark, light or automatic mode is chosen in User interface, and your choices apply instantly, on every screen, and are remembered.'] },
        { id: 'tablelook', t: 'Tables, decks, seats',
          b: ['Beyond the theme, several elements can be swapped independently: the table background, the card deck, the card back (match the deck automatically or import your own image), the dealer and blind pucks, the action-button style, and complete seat packs that reskin the player boxes. Pick everything in Advanced options \u2192 Style; changes are visible immediately at the table.'] },
        { id: 'music', t: 'Music player',
          b: ['The music entry in the header menus opens a small lounge-music player: pick a track from the playlist, play/pause, previous/next, shuffle, and repeat one track, the whole playlist or nothing. Volume, selected track and repeat mode are remembered. Playback never starts by itself \u2014 browsers require a tap \u2014 and the player is entirely independent from the game sound effects.'] },
        { id: 'sounds', t: 'Sound effects',
          b: ['Game sounds are grouped in four categories that can be toggled separately, exactly like the desktop client: game actions (cards dealt, Check, Call, Raise, your turn\u2026), lobby chat notification, network game notifications (player joined, game ready) and the blind-raise notification. A single volume slider controls them all, in Advanced options \u2192 Sound.'],
          note: 'All browsers \u2014 iOS especially \u2014 refuse to play audio before you have touched the page once. If a game starts silent, a single tap anywhere brings the sound to life; the client also repairs the audio engine automatically when iOS suspends it (incoming call, backgrounding\u2026).' },
        { id: 'voice', t: 'Voice and vibration',
          b: ['Two extra channels can keep you informed without looking at the screen: voice announcements read out the game events using your device\u2019s speech synthesis, and on phones a short vibration can mark your turn. Both are web extensions, off or on by default depending on the device, in Advanced options \u2192 Betting & turn.'],
          note: 'Vibration works on Android (Chromium browsers); Apple does not expose a vibration API to websites, so iPhones cannot vibrate. Voice announcements work everywhere, but the available voices and languages depend on your system \u2014 the client uses the best match it finds.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Options & shortcuts',
      sections: [
        { id: 'where', t: 'Where the options live',
          b: ['Advanced options open from the gear entry of any header menu. They are grouped like the desktop client: User interface, Style, Sound, Local game, Network game, Internet game, Nicknames / Avatars, Log messages, and Restore defaults. Every web-specific feature has its own switch there, so you can turn off anything you do not use.'] },
        { id: 'cfgxml', t: 'Exchanging settings with the desktop client',
          b: ['Your settings can travel between clients: the Log messages category offers an export/import of the official config.xml file (the \u007e/.pokerth/config.xml used by the desktop and QML clients). Export writes the shared settings \u2014 name, display options, sounds, table preferences, blinds, styles \u2014 and import applies a desktop file here. Settings this client does not know are preserved in the file untouched.'] },
        { id: 'sync', t: 'Settings that follow you',
          b: ['When you play with an account, your options, theme, key bindings, language and training trophies are synchronized: change something on one device and the next device you log in from picks it up. Trophy progress is merged, never overwritten, so playing on two devices always keeps the best of both.'] },
        { id: 'updates', t: 'Staying up to date',
          b: ['The client updates itself: when a new version is deployed, a banner invites you to refresh (or type /update in the chat to check manually). Occasionally a small product poll may appear to ask your opinion on a feature \u2014 taking part is optional and polls can be disabled entirely in Advanced options \u2192 Community.'] },
        { id: 'fkeys', t: 'Official keyboard shortcuts',
          b: ['The official PokerTH function keys work during a game \u2014 Alt+S works anywhere:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (order can be reversed in the options)'],
            ['F5', 'Show your cards (when possible)'],
            ['F6 / F7 / F8', 'Manual \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manual \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Game log \u00b7 Odds panel'],
            ['Alt+S', 'Settings \u2014 anywhere in the app, not only during a game'],
            ['F11', 'Fullscreen']],
          note: 'Shortcuts need a physical keyboard. On a Mac, the F-keys default to media controls: hold Fn (or enable \u201cUse F1, F2, etc. as standard function keys\u201d in macOS settings). On iPhone, fullscreen is limited by iOS \u2014 installing the app as a PWA gives the same full-screen experience.' },
        { id: 'webkeys', t: 'Web letter keys',
          b: ['As a web extension, single-letter keys and Alt+T also trigger actions, and every one of them can be re-bound in Advanced options \u2192 Keyboard shortcuts:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Statistics panel'],
            ['Esc', 'Close the topmost window (also the Android Back button)']],
          note: 'On Android, the system Back button/gesture closes windows like Escape instead of leaving the game (configurable in the options). iOS has no equivalent system button \u2014 use the \u2715 of each window.' }
      ]
    }
  ]
};
