// ── help/content/es.mjs — Corpus de ayuda en español (Lote 2) ───────────────
// Traducción de en.mjs (referencia). Estructura e ids idénticos; solo se
// traducen t / b / list / keys (etiquetas) / note. Los términos de póker
// (Fold, Check, Call, Bet, Raise, All-In, flop, turn, river…) permanecen en
// inglés, según la convención de la aplicación.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Primeros pasos',
      sections: [
        { id: 'modes', t: 'Tres formas de jugar',
          b: ['Desde la pantalla de conexión, elige cómo quieres jugar.'],
          list: [
            'Internet — juega en línea en el servidor oficial pokerth.net, con clasificaciones. Se necesita una cuenta de pokerth.net; el registro es gratuito en pokerth.net.',
            'Local / entrenamiento — juega sin conexión contra bots. Nada que configurar, funciona sin internet y desbloquea trofeos a medida que progresas.',
            'LAN / servidor dedicado — conéctate a un servidor PokerTH privado en tu red local o en tu propia máquina.'] },
        { id: 'lan', t: 'LAN / servidor dedicado',
          b: ['El tercer modo se conecta a cualquier servidor PokerTH que tú o un amigo ejecutéis — en una red doméstica, en un VPS privado, donde sea. Introduce la dirección y el puerto del servidor, marca TLS si el servidor usa un puerto cifrado, e inicia sesión con un apodo (el acceso como invitado funciona si el servidor lo permite). Después, todo en la mesa se comporta exactamente igual que en el servidor oficial.'] },
        { id: 'famboard', t: 'Clasificación familiar',
          b: ['Solo en servidores privados y partidas LAN, el cliente guarda estadísticas acumuladas por apodo — manos y partidas jugadas y ganadas, mayor ganancia, mejor racha — y las comparte a través del servidor para que cada dispositivo de la mesa vea la misma clasificación. Las partidas de pokerth.net nunca se registran de esta forma, y las estadísticas del modo entrenamiento se mantienen completamente separadas.'] },
        { id: 'language', t: 'Idioma',
          b: ['La interfaz está disponible en 36 idiomas. Cámbialo en cualquier momento en Opciones avanzadas (menú del engranaje), categoría Interfaz de usuario. Los términos de acción del póker (Fold, Check, Call, Bet, Raise, All-In) permanecen en inglés por convención, exactamente como en el cliente de escritorio.'] },
        { id: 'pwa', t: 'Instalar como aplicación',
          b: ['Este cliente es una Progressive Web App: puedes instalarlo desde el menú de tu navegador (o el botón de instalación de la cabecera) para obtener una aplicación a pantalla completa con su propio icono. Una vez instalada arranca al instante y el modo entrenamiento funciona completamente sin conexión.'],
          note: 'En Android y en Chrome/Edge de escritorio, el botón de instalación lo hace todo. En iPhone/iPad, Apple solo permite la instalación a través de Safari: botón Compartir \u2192 «Añadir a pantalla de inicio» — el cliente muestra estos pasos cuando hace falta. El botón desaparece una vez instalada la aplicación.' },
        { id: 'platforms', t: 'Plataformas y navegadores',
          b: ['El cliente funciona en cualquier navegador moderno de cualquier sistema — Windows, macOS, Linux, Android, iOS. Algunas funciones dependen de API recientes de los navegadores; cuando falta una API, la función se oculta o se explica en lugar de romperse. Las principales diferencias a conocer:'],
          list: [
            'Chrome / Edge (escritorio): todo funciona, incluida la escritura del registro .pdb en una carpeta.',
            'Firefox: todo, salvo la escritura del .pdb en una carpeta (API aún no disponible).',
            'Safari / iOS: la instalación pasa por Compartir \u2192 «Añadir a pantalla de inicio»; sin vibración; pantalla completa limitada en iPhone; el sonido empieza tras tu primer toque.',
            'Android: soporte completo en navegadores Chromium, incluidas la vibración y el comportamiento del botón Atrás.'] },
        { id: 'avatar', t: 'Apodo y avatar',
          b: ['Elige tu apodo y tu avatar en la pantalla de conexión antes de conectarte. En pokerth.net, tu apodo es el nombre de tu cuenta; los avatares se comparten con los demás jugadores a través del servidor de avatares.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Reglas del póker',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em en pocas palabras',
          b: ['PokerTH se juega al Texas Hold\u2019em No-Limit. Cada jugador recibe dos cartas privadas (las hole cards). Después se reparten cinco cartas comunitarias boca arriba en el centro de la mesa. La mejor mano de cinco cartas formada con cualquier combinación de tus dos cartas y las cinco comunitarias gana el bote.'] },
        { id: 'blinds', t: 'Las ciegas y el botón del repartidor',
          b: ['Antes de cada mano, dos apuestas obligatorias alimentan el bote: la ciega pequeña y la ciega grande, puestas por los dos jugadores a la izquierda del botón del repartidor. El botón avanza un asiento en el sentido horario tras cada mano, de modo que todos pagan las ciegas por turnos. Las ciegas suben a intervalos regulares a lo largo de la partida.',
              'En la mesa, el botón y las ciegas están marcados con fichas: D (repartidor), SB (ciega pequeña), BB (ciega grande).'] },
        { id: 'streets', t: 'Las cuatro rondas de apuestas',
          list: [
            'Pre-flop — tras repartir las cartas privadas, la primera ronda de apuestas empieza a la izquierda de la ciega grande.',
            'Flop — se revelan tres cartas comunitarias, seguidas de una ronda de apuestas.',
            'Turn — una cuarta carta comunitaria, luego otra ronda de apuestas.',
            'River — la quinta y última carta comunitaria, luego la ronda de apuestas final.'],
          b: ['Una ronda de apuestas termina cuando cada jugador que sigue en la mano ha puesto la misma cantidad en el bote (o está all-in).'] },
        { id: 'actions', t: 'Qué puedes hacer en tu turno',
          list: [
            'Fold — abandonar la mano. Tus cartas se descartan y dejas de optar al bote.',
            'Check — pasar sin apostar. Solo es posible cuando no hay nada que igualar.',
            'Call — igualar la apuesta en curso.',
            'Bet — abrir las apuestas cuando nadie ha apostado aún en esta calle.',
            'Raise — subir por encima de una apuesta existente. La subida mínima iguala la apuesta o la subida anterior.',
            'All-In — poner todas tus fichas. Sigues en la mano hasta el importe que has cubierto.'] },
        { id: 'showdown', t: 'Showdown y botes divididos',
          b: ['Si quedan varios jugadores tras la ronda de apuestas del river, las manos se revelan y gana la mejor — la combinación ganadora se muestra bajo las cartas comunitarias. Cuando un jugador va all-in por menos que las apuestas completas, se crean botes secundarios: cada jugador solo puede ganar la parte del bote a la que contribuyó. Las manos empatadas se reparten el bote.'] },
        { id: 'hands', t: 'Clasificación de las manos',
          b: ['De la más débil a la más fuerte:'],
          list: [
            '1. High Card — sin combinación; decide la carta más alta.',
            '2. Pair — dos cartas del mismo valor.',
            '3. Two Pair — dos parejas distintas.',
            '4. Three of a Kind — tres cartas del mismo valor.',
            '5. Straight — cinco cartas consecutivas (el As cuenta alto o bajo).',
            '6. Flush — cinco cartas del mismo palo.',
            '7. Full House — un trío más una pareja.',
            '8. Four of a Kind — cuatro cartas del mismo valor.',
            '9. Straight Flush — una escalera, toda del mismo palo.',
            '10. Royal Flush — del Diez al As, en un solo palo. La mejor mano posible.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'La pantalla de juego',
      sections: [
        { id: 'actionbar', t: 'La barra de acción',
          b: ['Cuando es tu turno, la barra de acción de abajo se ilumina con hasta cuatro botones: Fold (rojo), Check / Call (azul), Bet / Raise (verde — la acción principal, resaltada) y All-In (rojo oscuro). El botón Check / Call muestra la cantidad exacta a igualar; Bet / Raise muestra la cantidad que estás a punto de poner. Después del river, All-In puede convertirse en un botón Show para revelar tus cartas.'] },
        { id: 'betctl', t: 'Elegir tu apuesta',
          b: ['Ajusta el importe de la subida con el campo numérico, el deslizador o los botones rápidos 1/3 \u00b7 1/2 \u00b7 Pot (fracciones del bote actual). Los importes se redondean automáticamente y se mantienen entre la subida mínima y máxima legales. Si prefieres pensar en ciegas grandes, una opción muestra todos los importes en BB en lugar de fichas.'] },
        { id: 'preselect', t: 'Preseleccionar una acción',
          b: ['Antes de tu turno puedes armar una acción por adelantado: toca un botón y adquiere un borde dorado con un puntito dorado. Cuando llega tu turno, la acción se ejecuta al instante. Un Fold prearmado se convierte automáticamente en Check cuando el check es gratis — nunca te retiras por nada. Las preselecciones se reinician con cada mano nueva, cada cambio de calle y el showdown, y se anulan si la situación cambia (por ejemplo, si cambia el importe a igualar).'] },
        { id: 'automodes', t: 'Modos automáticos',
          b: ['El desplegable junto a los botones de acción ofrece tres modos de juego: Manual, Auto Check/Call y Auto Check/Fold. Los modos auto juegan por ti hasta que vuelvas atrás — cualquier clic manual en una acción regresa inmediatamente a Manual.'] },
        { id: 'readtable', t: 'Leer la mesa',
          b: ['Cada caja de jugador muestra el avatar, el nombre, las fichas y la apuesta en curso. El repartidor y las ciegas están marcados con fichas D / SB / BB. Una insignia de color en la caja indica la última acción del jugador; una fina barra azul descuenta su tiempo de reflexión. La caja del jugador al que le toca se ilumina; tu propia caja adquiere un marco dorado pulsante en tu turno.',
              'La barra de estado sobre la mesa muestra el bote total, las apuestas de la calle en curso, la fase (Pre-flop, Flop, Turn, River) y los números de partida y de mano. Los jugadores retirados tienen cartas translúcidas; los eliminados aparecen atenuados. Al final de una mano, una ventana del ganador puede resumir quién ganó qué — se desactiva en las opciones.'] },
        { id: 'seatlayout', t: 'Colocación de los asientos',
          b: ['Como extensión web, la disposición de las cajas de jugadores se elige en Opciones avanzadas \u2192 Asientos: Automática sigue al cliente oficial (posiciones fijas en vertical, elipse calculada en horizontal), o fuerza la disposición Vertical u Horizontal — y Personalizada te deja colocar cada asiento tú mismo: aparece un modo de edición donde arrastras cada caja exactamente adonde quieras, y la disposición se guarda.'] },
        { id: 'zoom', t: 'Zoom de mesa (teléfonos)',
          b: ['En pantallas pequeñas, los botones de lupa amplían la mesa (2\u00d7) y puedes desplazarla con el dedo — tu propia caja y la barra de acción permanecen fijas. La vista sigue automáticamente al asiento activo y se aleja en el showdown para la vista general. Se desactiva en las Opciones avanzadas.'],
          note: 'En teléfonos y tabletas, el zoom por pellizco del propio navegador está bloqueado por defecto para que un gesto de zoom nunca se dispare por accidente en mitad de una mano; reactívalo en Opciones avanzadas \u2192 Interfaz de usuario si lo prefieres.' },
        { id: 'protections', t: 'Anti-miradas y protección contra Call accidental',
          b: ['Dos protecciones opcionales: la anti-miradas mantiene tus propias cartas ocultas hasta que las tocas (útil cuando alguien puede ver tu pantalla), y la guarda contra Call accidental bloquea brevemente el botón Call justo después de una gran subida, para que un toque destinado a un Call más pequeño no caiga por accidente en el importe subido. Ambas viven en las Opciones avanzadas.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Panel de información',
      sections: [
        { id: 'open', t: 'Abrir el panel',
          b: ['Durante una partida, el panel de información se abre desde la cabecera (o Alt+L / Alt+I) y tiene tres pestañas: Historial, Probabilidades y Estadísticas. En el teléfono flota sobre la mesa; en pantallas más grandes es una ventana movible y redimensionable — agarra el asa \u28ff para moverla, los bordes para redimensionarla. Su posición se recuerda.'] },
        { id: 'log', t: 'Registro de partida',
          b: ['La pestaña Historial registra toda la partida mano a mano: ciegas, cada acción con importes, cartas reveladas y ganadores, todo en colores para leer rápido. El botón de exportación guarda el registro en un archivo si quieres repasar una sesión más tarde.'] },
        { id: 'odds', t: 'Probabilidades (monitor de probabilidades)',
          b: ['La pestaña Probabilidades muestra, para tu mano actual, la probabilidad en vivo de terminar con cada una de las 10 categorías de manos — de High Card a Royal Flush — cada una con su icono, su porcentaje y su barra. La pantalla se atenúa en cuanto te retiras. Solo usa tus propias cartas y las comunitarias: no ve nada que tus rivales no muestren.'] },
        { id: 'journal', t: 'Registros de manos y la ventana «Logs»',
          b: ['Más allá del historial en vivo, cada mano que juegas se graba localmente en tu navegador, en el mismo formato que los archivos de registro .pdb del cliente oficial. La ventana Logs (Opciones avanzadas \u2192 Mensajes de registro \u2192 Gestionar registros\u2026) lista tus sesiones y te permite trabajar con ellas: previsualizar una sesión con búsqueda y resaltado, filtrar por partida, exportar en HTML o texto plano, guardar el archivo .pdb en bruto, o importar un .pdb grabado por el cliente de escritorio. Las sesiones se borran una a una o todas de golpe (con confirmación), y un ajuste de retención automática puede conservar solo los últimos 7, 30, 90, 180 o 365 días. Los registros que importas tú mismo nunca se eliminan automáticamente. Un segundo ajuste limita cuántas sesiones se conservan, y la columna de la lista se puede ensanchar arrastrando.',
              'El botón Analizar ejecuta un análisis de manos sobre una sesión y puede enviar un registro al servicio de análisis de pokerth.net. Todo permanece en tu dispositivo mientras no exportes o envíes explícitamente.'] },
        { id: 'logopts', t: 'Opciones de registro',
          b: ['En Opciones avanzadas \u2192 Mensajes de registro puedes activar o desactivar el registro y elegir el intervalo de escritura (tras cada acción, o una vez por mano), igual que en los ajustes del cliente de escritorio. Una opción adicional escribe el archivo .pdb directamente en una carpeta de tu elección y lo actualiza tras cada mano — exactamente como hace el cliente de escritorio, para que otras herramientas puedan leerlo en directo.'],
          note: 'Escribir en una carpeta local requiere la API File System Access: solo Chrome y Edge de escritorio. Firefox, Safari y los navegadores móviles no pueden — la opción muestra entonces una breve explicación, y la exportación manual desde la ventana Logs sigue disponible en todas partes.' },
        { id: 'assist', t: 'Asistencia (fuerza de la mano)',
          b: ['En la parte superior de la pestaña Probabilidades, el banner de asistencia lee tu mano por ti. Antes del flop nombra tu mano inicial y la puntúa con estrellas; a partir del flop muestra tu mejor combinación actual y, tras una simulación rápida, tu probabilidad estimada de ganar la mano en porcentaje, con un indicador de color del rojo (débil) al verde (fuerte). Como el monitor de probabilidades, solo usa información que puedes ver.',
              'Hay dos estilos de visualización en Opciones avanzadas \u2192 Asientos: Segmentos (diez bloques) o una barra de progreso clásica. Toda la función de asistencia se desactiva en Opciones avanzadas \u2192 Asistencia.'] },
        { id: 'assistwin', t: 'La asistencia como widget flotante',
          b: ['El bloque de asistencia puede separarse del panel en su propia ventanita siempre en primer plano: usa el botón de separación del bloque, luego muévela y redimensiónala donde quieras sobre la mesa — práctico para vigilar la fuerza de tu mano sin el panel completo abierto. El botón de anclaje lo devuelve a la pestaña Probabilidades, y su posición se recuerda. Dentro del panel, un asa de arrastre entre Asistencia y las probabilidades te deja repartir el espacio entre ambas.'] },
        { id: 'stats', t: 'Estadísticas',
          b: ['La pestaña Estadísticas sigue tu sesión: manos jugadas, flops vistos, showdowns, tasas de victoria y más. El seguimiento estadístico se desactiva en las Opciones avanzadas.'] },
        { id: 'hud', t: 'HUD de estadísticas en los asientos (beta)',
          b: ['El HUD adjunta una cajita de estadísticas junto al asiento de cada jugador, construida a partir de las manos que has grabado en tus registros: número de manos observadas, luego VPIP (con qué frecuencia pone dinero voluntariamente pre-flop), PFR (subidas pre-flop), AF (factor de agresividad), 3B (3-bet), CB (continuation bet) y F3B (fold ante el 3-bet), con un código de color de pasivo a agresivo. Toca una caja para un desplegable detallado con más cifras (intentos de robo, fold ante el robo, tasas de showdown\u2026), y arrástrala si tapa algo.',
              'El HUD solo conoce lo que has visto en tus propias mesas — lee tus registros de manos locales, así que el registro debe estar activo y las cifras cobran sentido tras suficientes manos. Es una función beta, desactivada por defecto: actívala en Opciones avanzadas \u2192 Asistencia.'] },
        { id: 'handsbtn', t: 'Resumen de combinaciones',
          b: ['El icono de las manos de póker sobre el tapete abre en cualquier momento un resumen rápido de las 10 combinaciones — práctico mientras aprendes. Se oculta en las Opciones avanzadas.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Chat y social',
      sections: [
        { id: 'panels', t: 'Chat del lobby y chat de mesa',
          b: ['Hay un chat en el lobby y otro en la mesa. En el teléfono, el chat de mesa flota sobre el juego; en pantallas más grandes es una ventana movible y redimensionable. Una insignia en el botón del chat cuenta los mensajes sin leer.'] },
        { id: 'typing', t: 'Ayudas de escritura',
          list: [
            'Tab completa un apodo — pulsa Tab de nuevo para recorrer las coincidencias.',
            '\u2191 / \u2193 recorren el historial de tus propios mensajes.',
            'El botón de emoji abre un selector completo; escribir : también sugiere emoticonos mientras tecleas.'] },
        { id: 'emotes', t: 'Emoticonos y smileys',
          b: ['El chat convierte los códigos de emoticonos exactamente igual que el cliente de escritorio oficial: escribe un nombre entre dos puntos y se convierte en el emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 se admiten más de 1.900 códigos (el juego completo de GitHub). Los smileys de texto clásicos también se convierten: :-) ;) :D xD :P <3 y unos ochenta más.',
              'Escribir : abre un cuadro de sugerencias que completa el código mientras tecleas (\u2191/\u2193 para elegir, Tab o Intro para aceptar). La conversión de emojis se desactiva por completo en Opciones avanzadas \u2192 Chat.'] },
        { id: 'commands', t: 'Comandos del chat',
          b: ['El chat entiende comandos con barra. Dos son visibles para los demás:'],
          keys: [
            ['/me <texto>', 'Mensaje de acción, mostrado como «* tuapodo texto»'],
            ['/emoji <emoji>', 'Reproduce una reacción emoji (lo que envía el selector de reacciones)']] },
        { id: 'diagcmds', t: 'Comandos de diagnóstico',
          b: ['Todo lo demás es local: las respuestas solo las ves tú y nada se envía a la mesa. Escribe /help para listarlos todos. Los más útiles:'],
          keys: [
            ['/help', 'Listar todos los comandos'],
            ['/update', 'Comprobar si hay una versión nueva y actualizar'],
            ['/lang <código>', 'Cambiar de idioma (ej. /lang es)'],
            ['/sound on|off', 'Activar/silenciar los sonidos del juego'],
            ['/zoom', 'Alternar la lupa de mesa'],
            ['/clear', 'Vaciar el chat localmente'],
            ['/table', 'Información de la partida actual (ciegas, jugadores, fichas)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Diagnósticos del estado del cliente, la red y la fluidez'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Depuración avanzada (cartas, protocolo, audio, almacenamiento, asientos)'],
            ['/copy', 'Copiar la última respuesta de comando al portapapeles']] },
        { id: 'reactions', t: 'Reacciones emoji',
          b: ['El botón de reacción abre un selector de 30 reacciones animadas (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) que se reproducen con un efecto sobre tu asiento, visibles para toda la mesa — incluidos los jugadores del cliente de escritorio. Las reacciones se desactivan por completo en las Opciones avanzadas.'] },
        { id: 'translate', t: 'Entender a todos',
          b: ['Con la traducci\u00f3n del chat activada, aparece un bot\u00f3n de traducci\u00f3n en la l\u00ednea bajo el puntero \u2014 o en la que toques, en pantalla t\u00e1ctil \u2014 y muestra ese mensaje en tu idioma con el traductor del navegador. Puede mostrarse siempre en todas las l\u00edneas desde Opciones avanzadas \u2192 Chat, donde tambi\u00e9n vive la ayuda emergente que explica las abreviaturas de mesa (gg, nh, utg\u2026).'],
          note: 'La traducción usa el servicio Google Translate y funciona en todos los navegadores — solo necesita conexión a internet. Un mensaje solo se envía al servicio de traducción cuando tocas su botón de traducir, nunca automáticamente.' },
        { id: 'social', t: 'Jugadores: perfil, invitar, ignorar',
          b: ['Toca a cualquier jugador — en la mesa o en la lista del lobby — para abrir su ficha: perfil y estadísticas, invitarlo a tu partida, o ignorarlo (sus mensajes de chat se ocultan; ignorar es reversible en cualquier momento). Una confirmación antes de invitar/ignorar puede activarse en las opciones.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Lobby y partidas',
      sections: [
        { id: 'list', t: 'La lista de partidas',
          b: ['El lobby lista todas las mesas del servidor. Cada entrada muestra el número de jugadores, el tipo de partida, un candado cuando se requiere contraseña o invitación, y una insignia de estado: «En espera» (verde — la partida no ha empezado, puedes unirte si queda un asiento), «En curso» (color cálido — se puede ver en directo si se permiten espectadores) y «Cerrada» (atenuado). Una mesa llena simplemente se ve por su contador completo, como 10/10; los colores de las insignias siguen el tema activo.',
              'El desplegable de filtro reduce la lista exactamente igual que el cliente de escritorio, cada opción más estricta que la anterior: solo partidas abiertas \u2192 ocultando también las mesas llenas \u2192 luego solo las no privadas, solo las privadas, o solo las partidas clasificadas. Tu elección se recuerda. El campo de búsqueda encuentra una partida por su nombre, y la insignia de jugadores abre la lista de todos los conectados, buscable y ordenable.'] },
        { id: 'join', t: 'Unirse y observar',
          b: ['Selecciona una partida abierta y únete — un candado indica que se requiere contraseña. Las partidas en curso que admiten espectadores pueden verse en directo: ves la mesa y el chat, pero las cartas privadas permanecen ocultas y no puedes actuar.'] },
        { id: 'gameinfo', t: 'Información de la partida',
          b: ['Antes de unirte, la ficha de información de la partida muestra todo lo que define la mesa: tipo de partida, ciegas y su progresión (duplicación o lista manual), fichas iniciales, tiempo de acción, pausa entre manos, y quién está ya sentado.'] },
        { id: 'create', t: 'Crear una partida',
          b: ['Crea tu propia mesa: nombre, número de jugadores, fichas iniciales, primera ciega pequeña y progresión de subidas, tiempo de acción, y si se permiten espectadores. Existen cuatro tipos de partidas: Normal (todos), solo jugadores registrados, solo por invitación, y Clasificada (cuenta para la clasificación oficial — sin contraseña posible en ese caso). Tus ajustes favoritos pueden guardarse y recargarse.'] },
        { id: 'invites', t: 'Invitaciones',
          b: ['Los jugadores pueden invitarte a su mesa; recibes una notificación que puedes aceptar o rechazar. Ser invitado es la única forma de entrar en una partida solo por invitación.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Tu cuenta',
          b: ['El servidor oficial de Internet es pokerth.net. Jugar allí requiere una cuenta gratuita de pokerth.net — regístrate en el sitio web y luego inicia sesión aquí con el mismo apodo y contraseña. Este cliente web se conecta al mismo servidor que el cliente de escritorio: mismas cuentas, mismas mesas, mismas clasificaciones, y puedes sentarte a una mesa con jugadores del cliente de escritorio.'] },
        { id: 'ranked', t: 'Partidas clasificadas y temporadas',
          b: ['Las partidas de tipo Clasificada cuentan para la clasificación oficial de la temporada. Tu perfil en la aplicación muestra tu fecha de registro, tu Rango de la temporada actual, tu Puntuación, tu media y tus partidas jugadas, además de tus últimos resultados. Las partidas normales (no clasificadas) son solo por diversión y no cambian nada.'] },
        { id: 'rankhow', t: 'Cómo se calcula la clasificación',
          b: ['En cada partida clasificatoria tu puesto te da puntos: 15 por el primero, luego 9, 6, 4, 3, 2 y 1 hasta el séptimo; del octavo al décimo, nada. Una mesa reparte por tanto 40 puntos en total.',
              'Tu Score no es la suma de esos puntos, sino tu media por partida, atenuada por un factor que crece con el número de partidas jugadas: unos pocos buenos resultados no bastan para instalarse arriba, también hace falta regularidad — cuanto más juegas, más se acerca tu Score a tu media real. Las temporadas duran un trimestre: al cambiar, todo se archiva y los contadores vuelven a cero, y las temporadas pasadas siguen consultables. En partida, el botón del podio muestra la clasificación de temporada de los jugadores de tu mesa.'],
          note: 'El baremo y la fórmula exacta los fija el servidor de clasificación de pokerth.net y pueden cambiar; las páginas del sitio son la referencia.' },
        { id: 'rankings', t: 'Páginas de clasificación',
          b: ['La entrada de clasificación abre la clasificación oficial de PokerTH, buscable por jugador, así como las clasificaciones comunitarias (BBC, WEC). Si las clasificaciones no te interesan, la entrada se oculta en Opciones avanzadas \u2192 Comunidad.'] },
        { id: 'cups', t: 'Las copas de la comunidad: BBC y WeCup',
          b: ['Dos comunidades organizan sus propias competiciones en pokerth.net, cada una con su sitio y su clasificación. La Best Brainies Cup (BBC) es un torneo por etapas nacido en 2013: se progresa del Step 1 al Step 4, y una nueva temporada empieza tras cada partida de Step 4, cuando se entrega la copa. La WeCup (WEC) tiene su propio baremo, mucho más repartido — 75 puntos para el primer puesto, luego 45, 30, 20… — y su score normaliza tu media según el número de partidas que has jugado en comparación con los demás miembros.',
              'Ambas clasificaciones se abren desde el botón del trofeo, junto a la clasificación de PokerTH. Los ajustes de mesa de estas competiciones vienen como preajustes al crear una partida (BBC Step 1 a 4, WEC, WEC Monthly Final y WEC Grand Final), así que puedes entrenar en las mismas condiciones. Participar exige registrarse en el sitio de la copa correspondiente.'],
          note: 'Estos contenidos se ocultan de golpe en Opciones avanzadas → Comunidad si las copas no te interesan.' },
        { id: 'forumcups', t: 'Copas del foro y eventos',
          b: ['El foro de pokerth.net acoge además la Monthly Cup, una serie mensual en la que los jugadores se reparten en mesas Gold, Silver y Bronze antes de coronar al campeón del mes, más copas especiales puntuales a lo largo del año.',
              'Inscripciones, horarios, ajustes de mesa y resultados se publican en el foro, y las partidas se juegan en el servidor oficial como cualquier otra. Una cuenta de pokerth.net basta para seguir los resultados; apuntarse a una copa pasa por el hilo del foro correspondiente.'] },
        { id: 'avatars', t: 'Avatares y banderas',
          b: ['En pokerth.net, tu avatar se distribuye a los demás jugadores a través del servidor de avatares, y una pequeña bandera de país puede mostrarse en las cajas de jugadores. Ambos son opcionales y configurables en las opciones.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Modo entrenamiento',
      sections: [
        { id: 'what', t: 'Qué es',
          b: ['El modo Local / entrenamiento es una partida completa contra rivales controlados por el ordenador: sin conexión, sin cuenta, nada en juego. Una vez instalada la aplicación (o simplemente visitada una vez), funciona completamente sin conexión — perfecto para aprender el juego, probar la interfaz o pasar el rato en modo avión.'] },
        { id: 'setup', t: 'Configurar una partida',
          b: ['Elige el número de rivales, las fichas iniciales, las ciegas y su progresión, y la velocidad de juego. La composición y la dificultad de los bots se ajustan en Opciones avanzadas \u2192 Partida local — desde rivales suaves hasta una mesa más dura y variada.'] },
        { id: 'trophies', t: 'Trofeos',
          b: ['El modo entrenamiento tiene su propia progresión: 28 trofeos repartidos en seis categorías (progresión, técnica, estilo, formatos, diversión y una secreta) se desbloquean jugando — manos jugadas, partidas ganadas, grandes faroles, manos especiales y más. Tu progreso de trofeos es acumulativo y se fusiona entre dispositivos cuando la sincronización de ajustes de la cuenta está activa.'] },
        { id: 'learn', t: 'Un buen sitio para aprender',
          b: ['Todo lo descrito en los demás capítulos también funciona aquí: el monitor de probabilidades, la pantalla de asistencia, la preselección, los atajos de teclado. El modo entrenamiento es el mejor sitio para probarlos sin presión antes de lanzarte a pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Estilo y sonido',
      sections: [
        { id: 'themes', t: 'Temas',
          b: ['La categoría Estilo de las Opciones avanzadas reviste todo el cliente. Los preajustes lo configuran todo de un toque (el casino verde clásico, el aspecto oficial de PokerTH\u2026); debajo, ejes individuales afinan por separado la paleta de colores, el tapete de la mesa y las caras de las cartas — modifica cualquier eje y tu mezcla se convierte en un tema personalizado. El modo oscuro, claro o automático se elige en Interfaz de usuario, y tus elecciones se aplican al instante, en cada pantalla, y se recuerdan.'] },
        { id: 'tablelook', t: 'Mesas, barajas, asientos',
          b: ['Más allá del tema, varios elementos se cambian de forma independiente: el fondo de la mesa, la baraja, el dorso de las cartas (a juego con la baraja automáticamente, o importa tu propia imagen), las fichas de repartidor y de ciegas, el estilo de los botones de acción, y paquetes de asientos completos que revisten las cajas de jugadores. Elige todo en Opciones avanzadas \u2192 Estilo; los cambios son visibles inmediatamente en la mesa.'] },
        { id: 'music', t: 'Reproductor de música',
          b: ['La entrada de música de los menús de la cabecera abre un pequeño reproductor de música de ambiente: elige una pista de la lista, reproducir/pausar, anterior/siguiente, aleatorio, y repetición de una pista, de toda la lista o de nada. El volumen, la pista seleccionada y el modo de repetición se recuerdan. La reproducción nunca empieza sola — los navegadores exigen un toque — y el reproductor es totalmente independiente de los efectos de sonido del juego.'] },
        { id: 'sounds', t: 'Efectos de sonido',
          b: ['Los sonidos del juego se agrupan en cuatro categorías activables por separado, exactamente como en el cliente de escritorio: acciones de juego (cartas repartidas, Check, Call, Raise, tu turno\u2026), notificación del chat del lobby, notificaciones de partida en red (jugador conectado, partida lista) y notificación de subida de ciegas. Un único control de volumen los regula todos, en Opciones avanzadas \u2192 Sonido.'],
          note: 'Todos los navegadores — iOS en particular — se niegan a reproducir sonido antes de que hayas tocado la página una vez. Si una partida empieza en silencio, un solo toque en cualquier parte despierta el sonido; el cliente también repara automáticamente el motor de audio cuando iOS lo suspende (llamada entrante, segundo plano\u2026).' },
        { id: 'voice', t: 'Voz y vibración',
          b: ['Dos canales adicionales pueden mantenerte informado sin mirar la pantalla: los anuncios de voz leen en voz alta los eventos del juego mediante la síntesis de voz de tu dispositivo, y en el teléfono una breve vibración puede marcar tu turno. Ambos son extensiones web, activas o no por defecto según el dispositivo, en Opciones avanzadas \u2192 Apuestas y turno.'],
          note: 'La vibración funciona en Android (navegadores Chromium); Apple no expone una API de vibración a los sitios web, así que los iPhone no pueden vibrar. Los anuncios de voz funcionan en todas partes, pero las voces e idiomas disponibles dependen de tu sistema — el cliente usa la mejor coincidencia que encuentra.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Opciones y atajos',
      sections: [
        { id: 'where', t: 'Dónde viven las opciones',
          b: ['Las Opciones avanzadas se abren desde la entrada del engranaje de cualquier menú de cabecera. Están agrupadas como en el cliente de escritorio: Interfaz de usuario, Estilo, Sonido, Partida local, Partida en red, Partida por Internet, Apodos / Avatares, Mensajes de registro, y Restaurar valores predeterminados. Cada función específica de la web tiene allí su propio interruptor, para que puedas desactivar todo lo que no uses.'] },
        { id: 'cfgxml', t: 'Intercambiar ajustes con el cliente de escritorio',
          b: ['Tus ajustes pueden viajar entre clientes: la categoría Mensajes de registro ofrece exportar/importar el archivo config.xml oficial (el \u007e/.pokerth/config.xml que usan los clientes de escritorio y QML). La exportación escribe los ajustes compartidos — nombre, opciones de pantalla, sonidos, preferencias de mesa, ciegas, estilos — y la importación aplica aquí un archivo del escritorio. Los ajustes que este cliente no conoce se conservan intactos en el archivo.'] },
        { id: 'sync', t: 'Ajustes que te siguen',
          b: ['Cuando juegas con una cuenta, tus opciones, tu tema, tus atajos de teclado, tu idioma y tus trofeos de entrenamiento se sincronizan: cambia algo en un dispositivo y el siguiente dispositivo desde el que inicies sesión lo recoge. El progreso de los trofeos se fusiona, nunca se sobrescribe, así que jugar en dos dispositivos siempre conserva lo mejor de ambos.'] },
        { id: 'updates', t: 'Mantenerse al día',
          b: ['El cliente se actualiza solo: cuando se despliega una versión nueva, un aviso te invita a refrescar (o escribe /update en el chat para comprobarlo manualmente). De vez en cuando puede aparecer una pequeña encuesta de producto para pedir tu opinión sobre una función — participar es opcional y las encuestas se desactivan por completo en Opciones avanzadas \u2192 Comunidad.'] },
        { id: 'fkeys', t: 'Atajos de teclado oficiales',
          b: ['Las teclas de función oficiales de PokerTH funcionan durante una partida:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (orden invertible en las opciones)'],
            ['F5', 'Mostrar tus cartas (cuando sea posible)'],
            ['F6 / F7 / F8', 'Manual \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Manual \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Chat \u00b7 Historial \u00b7 Panel de probabilidades'],
            ['Alt+S', 'Ajustes \u2014 en cualquier parte de la aplicaci\u00f3n, no solo en partida'],
            ['F11', 'Pantalla completa']],
          note: 'Los atajos exigen un teclado físico. En Mac, las teclas F controlan los medios por defecto: mantén Fn (o activa «Usar las teclas F1, F2, etc. como teclas de función estándar» en los ajustes de macOS). En iPhone, la pantalla completa está limitada por iOS — instalar la aplicación como PWA da la misma experiencia de pantalla completa.' },
        { id: 'webkeys', t: 'Teclas de letra de la web',
          b: ['Extensi\u00f3n web: las teclas de una sola letra y Alt+T tambi\u00e9n activan acciones, y todas se pueden reasignar en Opciones avanzadas \u2192 Atajos de teclado:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Alt+T', 'Panel de estad\u00edsticas'],
            ['Esc', 'Cerrar la ventana en primer plano (también el botón Atrás de Android)']],
          note: 'En Android, el botón/gesto Atrás del sistema cierra las ventanas como Esc en lugar de abandonar la partida (configurable en las opciones). iOS no tiene un botón de sistema equivalente — usa el \u2715 de cada ventana.' }
      ]
    }
  ]
};
