// Avatar parts — starter characters (2.1.9-web.210).
//
// Ten archetypes shown as a gallery at the start of the Create tab: tapping
// one loads its whole recipe, then the player customises it. { id, label
// (i18n key), recipe (part ids; missing axes take the defaults), [unlock] }.
// Ids are stable. A preset with `unlock` is greyed out until the future
// rewards system reports it earned (see avLocked in the engine).

'use strict';

const PRESETS = [
  { id: 'godfather', label: 'avmPreGodfather', recipe: { sex: 0, face: 'm-square', skin: 'medium', hair: 'slicked', hairc: 'grey', beard: 'moustache', eyes: 'heavy', brows: 'thick', mouth: 'cigar', outfit: 'pinstripe', hat: 'fedora', bg: 'felt-burgundy', marks: 'cheek-scar' } },
  { id: 'cowboy', label: 'avmPreCowboy', recipe: { sex: 0, face: 'm-rugged', skin: 'tan', hair: 'short', hairc: 'brown', beard: 'stubble', eyes: 'narrowed', mouth: 'toothpick', outfit: 'plaid', hat: 'stetson', bg: 'cream' } },
  { id: 'diva', label: 'avmPreDiva', recipe: { sex: 1, face: 'f-heart', skin: 'light', hair: 'hollywood', hairc: 'blonde', eyes: 'almond', eyec: 'blue', brows: 'thin-arched', mouth: 'lipstick', glasses: 'cat-eye', ears: 'hoops', outfit: 'dress-strapless', bg: 'pink', marks: 'beauty-mark' } },
  { id: 'shark', label: 'avmPreShark', recipe: { sex: 0, face: 'm-long', skin: 'light', hair: 'undercut', hairc: 'black', beard: 'short', eyes: 'side-glance', brows: 'one-raised', mouth: 'smirk', glasses: 'aviators', outfit: 'suit-navy-tie', bg: 'neon', badge: 'stack' } },
  { id: 'dealer', label: 'avmPreDealer', recipe: { sex: 1, face: 'f-oval', skin: 'medium', hair: 'side-bun', hairc: 'dark-brown', eyes: 'round', mouth: 'smile', outfit: 'dealer-vest-f', hat: 'visor', bg: 'felt-green', badge: 'dealer' } },
  { id: 'pirate', label: 'avmPrePirate', recipe: { sex: 0, face: 'm-round', skin: 'tan', hair: 'ponytail-m', hairc: 'black', beard: 'full', glasses: 'eye-patch', mouth: 'gold-tooth', ears: 'skull-studs', outfit: 'shirt-open', hat: 'bandana', bg: 'blue', marks: 'cheek-scar' } },
  { id: 'rocker', label: 'avmPreRocker', recipe: { sex: 0, face: 'm-oval', skin: 'light', hair: 'mohawk', hairc: 'black', beard: 'goatee', mouth: 'tongue', glasses: 'sunglasses', ears: 'brow-ring', outfit: 'leather-jacket', bg: 'purple' } },
  { id: 'geek', label: 'avmPreGeek', recipe: { sex: 0, face: 'm-round', skin: 'porcelain', hair: 'curtain', hairc: 'auburn', eyes: 'wide', glasses: 'rect', mouth: 'grin', outfit: 'hoodie-zip', bg: 'sky', marks: 'freckles' } },
  { id: 'queen', label: 'avmPreQueen', recipe: { sex: 1, face: 'f-diamond', skin: 'dark', hair: 'box-braids', hairc: 'black', eyes: 'almond', eyec: 'brown', mouth: 'smile', ears: 'gold-studs', outfit: 'blazer', hat: 'crown', bg: 'felt-burgundy', badge: 'aces' } },
  { id: 'pro', label: 'avmPrePro', recipe: { sex: 1, face: 'f-slim', skin: 'light', hair: 'lob', hairc: 'auburn', glasses: 'aviators', hat: 'cap-spade', outfit: 'sweatshirt', outfitc: 'black', bg: 'felt-green', expression: 'bluff', badge: 'stack' } }
];

export { PRESETS };
