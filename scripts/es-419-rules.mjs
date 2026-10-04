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
];
export function derive(text) {
  let t = String(text);
  for (const [re, to] of RULES) t = t.replace(re, to);
  return t;
}
