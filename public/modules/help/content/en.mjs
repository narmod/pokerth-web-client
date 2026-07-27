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
        { id: 'language', t: 'Language',
          b: ['The interface is available in 36 languages. Change it any time in Advanced options (gear menu) under User interface. Poker action terms (Fold, Check, Call, Bet, Raise, All-In) stay in English by convention, exactly like the desktop client.'] },
        { id: 'pwa', t: 'Install as an app',
          b: ['This client is a Progressive Web App: you can install it from your browser menu (or the install button in the header) to get a full-screen app with its own icon. Once installed it starts instantly and the training mode works fully offline.'] },
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
          b: ['If more than one player remains after the river betting round, hands are revealed and the best hand wins \u2014 the winning combination is shown under the community cards. When a player is all-in for less than the full bets, side pots are created: each player can only win the part of the pot they contributed to. Equal hands split the pot.'] },
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
          b: ['Set the raise amount with the number field, the slider, or the quick buttons 1/3 \u00b7 1/2 \u00b7 Pot (fractions of the current pot). Amounts are automatically rounded and kept between the minimum and maximum legal raise.'] },
        { id: 'preselect', t: 'Pre-selecting an action',
          b: ['Before your turn, you can arm an action in advance: tap a button and it gets a gold border with a small gold dot. When your turn comes, the action plays instantly. A pre-armed Fold automatically becomes a Check when checking is free \u2014 you never fold for nothing. Pre-selections reset at every new hand, street change and showdown, and are cancelled if the situation changes (for example the call amount changes).'] },
        { id: 'automodes', t: 'Auto modes',
          b: ['The dropdown next to the action buttons offers three playing modes: Manual, Auto Check/Call and Auto Check/Fold. The auto modes play for you until you switch back \u2014 any manual click on an action returns to Manual immediately.'] },
        { id: 'readtable', t: 'Reading the table',
          b: ['Each player box shows the avatar, name, stack and current bet. The dealer and blinds are marked with D / SB / BB pucks. A colored badge on the box shows the player\u2019s last action; a thin blue bar counts down their thinking time. The box of the player whose turn it is glows; your own box gets a pulsing gold frame on your turn.',
              'The status bar above the table shows the total pot, the bets of the current street, the phase (Pre-flop, Flop, Turn, River) and the game and hand numbers. Folded players have translucent cards; eliminated players are dimmed.'] },
        { id: 'zoom', t: 'Table zoom (phones)',
          b: ['On small screens, magnifier buttons zoom the table (2\u00d7) and you can pan with a finger \u2014 your own box and the action bar stay fixed. The view follows the active seat automatically and zooms back out at showdown for the overview. This can be turned off in Advanced options.'] },
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
        { id: 'stats', t: 'Stats',
          b: ['The Stats tab tracks your session: hands played, flops seen, showdowns, win rates and more. Statistics tracking can be turned off in Advanced options.'] },
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
        { id: 'reactions', t: 'Emoji reactions',
          b: ['The reaction button opens a picker of 30 animated reactions (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) that play with an effect above your seat, visible to everyone at the table \u2014 including players on the desktop client. Reactions can be disabled entirely in Advanced options.'] },
        { id: 'translate', t: 'Understanding everyone',
          b: ['With chat translation enabled, each message gets a translate button that renders it in your language (uses the browser\u2019s built-in translator; a recent Chrome or Edge is required). Common table abbreviations (gg, nh, utg\u2026) are explained in a tooltip when you hover them \u2014 both options live in Advanced options \u2192 Chat.'] },
        { id: 'social', t: 'Players: profile, invite, ignore',
          b: ['Tap any player \u2014 at the table or in the lobby list \u2014 to open their card: profile and stats, invite them to your game, or ignore them (their chat messages are hidden; ignoring is reversible at any time). A confirmation before invite/ignore can be enabled in the options.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby & games',
      sections: [
        { id: 'list', t: 'The game list',
          b: ['The lobby lists every table on the server with its status color: green = open (you can join), orange = running, yellow = full, red = closed. Filters narrow the list (open, no password, live, ranked) and the search field finds a game by name. The players pill opens the list of everyone online, searchable and sortable.'] },
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
        { id: 'rankings', t: 'Ranking pages',
          b: ['The ranking entry opens the official PokerTH ranking, searchable by player, along with the community rankings (BBC, WEC). If you don\u2019t care about rankings, the entry can be hidden in Advanced options \u2192 Community.'] },
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
      id: 'options', icon: '\u2699\uFE0F', title: 'Options & shortcuts',
      sections: [
        { id: 'where', t: 'Where the options live',
          b: ['Advanced options open from the gear entry of any header menu. They are grouped like the desktop client: User interface, Style, Sound, Local game, Network game, Internet game, Nicknames / Avatars, Log messages, and Restore defaults. Every web-specific feature has its own switch there, so you can turn off anything you do not use.'] },
        { id: 'fkeys', t: 'Official keyboard shortcuts',
          b: ['The official PokerTH function keys work during a game:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (order can be reversed in the options)'],
            ['F5', 'Show your cards (when possible)'],
            ['F6 / F7 / F8', 'Manual \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manual \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Game log \u00b7 Odds panel'],
            ['F11', 'Fullscreen']] },
        { id: 'webkeys', t: 'Web letter keys',
          b: ['As a web extension, single-letter keys also trigger actions and can be re-bound in Advanced options \u2192 Keyboard shortcuts:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Esc', 'Close the topmost window (also the Android Back button)']] }
      ]
    }
  ]
};
