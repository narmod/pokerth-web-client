// Spain Spanish → neutral Latin-American Spanish: the reviewed substitution
// list the es-419 catalogue, help corpus, notices and SEO entries were derived
// from. Order matters (article + noun before the bare noun). Every key added to
// es later has to go through it — scripts/test-es-419-derivation.mjs checks
// that es-419 is still exactly derive(es).
export const RULES = [
  [/\bdel ordenador\b/g, 'de la computadora'], [/\bal ordenador\b/g, 'a la computadora'],
  [/\bel ordenador\b/g, 'la computadora'], [/\bEl ordenador\b/g, 'La computadora'],
  [/\bun ordenador\b/g, 'una computadora'], [/\bUn ordenador\b/g, 'Una computadora'],
  [/\blos ordenadores\b/g, 'las computadoras'], [/\bordenadores\b/g, 'computadoras'],
  [/\bordenador\b/g, 'computadora'], [/\bOrdenador\b/g, 'Computadora'],
  [/\bmóviles\b/g, 'celulares'], [/(?<!dispositivo )(?<!dispositivos )\bmóvil\b/g, 'celular'], [/\bMóvil\b/g, 'Celular'],
  [/\bpulsarlo\b/g, 'presionarlo'], [/\bpulsar\b/g, 'presionar'], [/\bPulsar\b/g, 'Presionar'],
  [/\bpulsa\b/g, 'presiona'], [/\bPulsa\b/g, 'Presiona'], [/\bpulse\b/g, 'presione'], [/\bPulse\b/g, 'Presione'],
  [/\bel ratón\b/g, 'el mouse'], [/\bratón\b/g, 'mouse'],
  [/Vale, me pillaste esta vez\./g, 'Bueno, me atrapaste esta vez.'],
  [/ e Intro\b/g, ' y Enter'],
  [/\bIntro\b/g, 'Enter'],
  [/\bGafas\b/g, 'Lentes'], [/\bgafas\b/g, 'lentes'],
  [/barras \/ tarta/g, 'barras / circular'],
  [/\bejecutéis\b/g, 'ejecuten'],
  [/\bcuenta atrás\b/g, 'cuenta regresiva'],
  [/\bvídeos\b/g, 'videos'], [/\bvídeo\b/g, 'video'], [/\bVídeo\b/g, 'Video'],
  [/\bbotes\b/g, 'pozos'], [/\bBotes\b/g, 'Pozos'], [/\bbote\b/g, 'pozo'], [/\bBote\b/g, 'Pozo'],
  [/¡Patata!/g, '¡Whisky!'],
  [/\bfallos\b/g, 'errores'], [/\bun fallo\b/g, 'un error'], [/\bfallo\b/g, 'error'],
  // Events tab and avatar maker, reviewed as hand edits of es-419 and folded
  // back here so the catalogue stays exactly derive(es).
  [/\bEn la web:/g, 'En el sitio:'],
  [/\bNo se han podido cargar\b/g, 'No se pudieron cargar'],
  [/\bNo se ha encontrado ninguna cara\b/g, 'No se encontró ningún rostro'],
  [/\btu cara\b/g, 'tu rostro'],
  [/\bamplía la foto\b/g, 'acerca la foto'],
  [/\bHacer la foto\b/g, 'Tomar la foto'],
  [/^El Friki$/g, 'El Nerd'],
  [/^La Estrella del pop$/g, 'La Estrella pop'],
  // Mini-games (web.84–102), written by hand for es-419 and folded back here
  // the same way. « póker » is the form the rest of es-419 already used.
  [/videopóquer/g, 'video póker'], [/Videopóquer/g, 'Video póker'],
  [/póquer/g, 'póker'], [/Póquer/g, 'Póker'],
  [/\btu puntuación\b/g, 'tu puntaje'], [/\bmejores resultados\b/g, 'mejores puntajes'],
  [/\bTras (ganar|cada)\b/g, 'Después de $1'],
  [/\bcuanto más (arriesgada|rápido)\b/g, 'mientras más $1'],
  [/\bse acaba la partida\b/g, 'se termina la partida'],
  [/\bvolver a empezar\b/g, 'empezar de nuevo'], [/^Toca para volver a jugar\b/g, 'Toca para jugar de nuevo'],
  [/\bcorre por el tapete\b/g, 'corre por el paño'],
  [/\ben su sitio del castillo\b/g, 'en su lugar del castillo'], [/\bfuera de su sitio\b/g, 'fuera de su lugar'],
  [/\bdos tejados\b/g, 'dos techos'],
  [/\bdividen el tilt por dos\b/g, 'dividen el tilt a la mitad'], [/\blo pone a cero\b/g, 'lo deja en cero'],
  [/\bdoble pareja 5, pareja 2\b/g, 'doble par 5, par 2'],
  [/\buna pareja de jotas o superior\b/g, 'un par de jotas o más'], [/\bJotas o más\b/g, 'Jotas o mejor'],
  [/\bhasta la escalera real\b/g, 'hasta la flor imperial'],
  [/\blas que guardas\b/g, 'las que te quedas'], [/\bsustituye las demás\b/g, 'reemplaza las demás'],
  [/\bcréditos de inicio\b/g, 'créditos al inicio'], [/\bel As destapa\b/g, 'el As voltea'],
  [/\bmás alta dobla, igual mantiene\b/g, 'más alta duplica, igual se mantiene'],
  [/\bpaga a partir de jotas\b/g, 'paga desde jotas'],
  [/\bNo se ha podido preparar\b/g, 'No se pudo preparar'],
  [/\bPillar al As de farol\b/g, 'Atrapar al As blufeando'],
  [/^Has encontrado el juego oculto$/g, 'Encontraste el juego oculto'],
  [/^¡Todo se derrumba!$/g, '¡Todo se derrumbó!'],
  [/\bsi igualan\b/g, 'si quedan iguales'], [/^¡Demasiado lento!$/g, '¡Muy lento!'],
  [/\bel kicker decide los casos ajustados\b/g, 'el kicker define los casos parejos'],
  [/\bse agote la barra\b/g, 'se acabe la barra'],
  [/\bUna baraja en el zapato, que se baraja de nuevo\b/g, 'Un mazo en el zapato, que se vuelve a barajar'],
  [/\blas cartas ya salidas\b/g, 'las cartas que ya salieron'],
  [/^El farol del As$/g, 'El bluff del As'], [/¿va de farol\?/g, '¿está blufeando?'], [/^¡Farol!$/g, '¡Bluff!'],
  [/\bes un farol\b/g, 'es un bluff'], [/\bsi iba de farol\b/g, 'si blufeaba'], [/\bcuando va de farol\b/g, 'cuando blufea'],
  [/\bpierdes tu igualada\b/g, 'pierdes lo que igualaste'], [/\bAnte una apuesta\b/g, 'Frente a una apuesta'],
  [/\bgesto delator\b/g, 'gesto que lo delata'], [/\bNo siempre es fiable\b/g, 'No siempre es confiable'],
  // Login help, same review.
  [/\bpartidas Normal al momento\b/g, 'partidas Normal de inmediato'],
  [/\bque se añada el tuyo\b/g, 'que se agregue el tuyo'],
];
export function derive(text) {
  let t = String(text);
  for (const [re, to] of RULES) t = t.replace(re, to);
  return t;
}
