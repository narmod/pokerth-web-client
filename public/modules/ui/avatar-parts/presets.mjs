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
  { id: 'pro', label: 'avmPrePro', recipe: { sex: 1, face: 'f-slim', skin: 'light', hair: 'lob', hairc: 'auburn', glasses: 'aviators', hat: 'cap-spade', outfit: 'sweatshirt', outfitc: 'black', bg: 'felt-green', expression: 'bluff', badge: 'stack' } },
  // 2.1.9-web.211 — lot 2
  { id: 'detective', label: 'avmPreDetective', recipe: { sex: 0, face: 'm-oval', skin: 'light', hair: 'short', hairc: 'dark-brown', beard: 'stubble', brows: 'angry', eyes: 'side-glance', mouth: 'pipe', outfit: 'trench', hat: 'fedora', bg: 'grey' } },
  { id: 'magician', label: 'avmPreMagician', recipe: { sex: 0, face: 'm-oval', skin: 'porcelain', hair: 'slicked', hairc: 'black', beard: 'moustache', brows: 'one-raised', glasses: 'monocle', outfit: 'cape', hat: 'top-hat', bg: 'neon' } },
  { id: 'vampire', label: 'avmPreVampire', recipe: { sex: 0, face: 'm-long', skin: 'porcelain', hair: 'slicked', hairc: 'black', eyes: 'bloodshot', brows: 'angry', mouth: 'sneer', outfit: 'cape', bg: 'purple' } },
  { id: 'witch', label: 'avmPreWitch', recipe: { sex: 1, face: 'f-slim', skin: 'porcelain', hair: 'very-long', hairc: 'black', brows: 'thin-arched', eyes: 'narrowed', mouth: 'smirk', marks: 'wart', hat: 'witch-hat', outfit: 'turtleneck', outfitc: 'black', bg: 'felt-burgundy' } },
  { id: 'chef', label: 'avmPreChef', recipe: { sex: 0, face: 'm-round', skin: 'light', hair: 'short', hairc: 'brown', beard: 'moustache', marks: 'dimples', mouth: 'smile', hat: 'chef-toque', outfit: 'chef-jacket', bg: 'cream' } },
  { id: 'sailor', label: 'avmPreSailor', recipe: { sex: 0, face: 'm-square', skin: 'tan', hair: 'short', hairc: 'dark-brown', beard: 'full', marks: 'tattoo-temple', mouth: 'grin', hat: 'sailor-cap', outfit: 'breton', bg: 'blue' } },
  { id: 'popstar', label: 'avmPrePopstar', recipe: { sex: 1, face: 'f-heart', skin: 'medium', hair: 'long-wavy', hairc: 'pink', ears: 'hoops', hat: 'headset-mic', outfit: 'sequin-dress', expression: 'love', bg: 'neon' } },
  { id: 'rapper', label: 'avmPreRapper', recipe: { sex: 0, face: 'm-rugged', skin: 'dark', hair: 'buzz', hairc: 'black', beard: 'goatee', glasses: 'sunglasses', mouth: 'gold-tooth', hat: 'cap-back', outfit: 'tracksuit-chain', bg: 'card-back' } },
  { id: 'boxer', label: 'avmPreBoxer', recipe: { sex: 0, face: 'm-square', skin: 'medium', hair: 'buzz', hairc: 'black', beard: 'stubble', brows: 'angry', marks: 'black-eye', mouth: 'gritted', hat: 'bandana', outfit: 'boxing-robe', bg: 'grey' } },
  { id: 'streamer', label: 'avmPreStreamer', recipe: { sex: 1, face: 'f-oval', skin: 'light', hair: 'half-up', hairc: 'auburn', glasses: 'rect', eyes: 'side-glance', hat: 'headphones', outfit: 'sweatshirt', outfitc: 'purple', badge: 'stack', bg: 'neon' } },
  // 2.1.9-web.215 — lot 3: the fun ones
  { id: 'fish', label: 'avmPreFish', recipe: { sex: 0, face: 'm-round', skin: 'light', hair: 'curtain', hairc: 'light-brown', nose: 'button', expression: 'fear', outfit: 'tee', outfitc: 'green', badge: 'chip', bg: 'sky' } },
  { id: 'maniac', label: 'avmPreManiac', recipe: { sex: 0, face: 'm-long', skin: 'light', hair: 'bed-head', hairc: 'dark-brown', beard: 'stubble', expression: 'tilt', outfit: 'hoodie', outfitc: 'black', bg: 'neon' } },
  { id: 'surfer', label: 'avmPreSurfer', recipe: { sex: 0, face: 'm-oval', skin: 'tan', hair: 'surfer', hairc: 'blonde', marks: 'freckles', expression: 'playful', outfit: 'hawaiian', bg: 'sky' } },
  { id: 'granny', label: 'avmPreGranny', recipe: { sex: 1, face: 'f-round', skin: 'light', hair: 'braided-bun', hairc: 'white', glasses: 'gold-round', ears: 'pearl-studs', marks: 'age-lines', mouth: 'smile', outfit: 'cardigan', outfitc: 'purple', badge: 'aces', bg: 'cream' } },
  { id: 'grandpa', label: 'avmPreGrandpa', recipe: { sex: 0, face: 'm-square', skin: 'medium', hair: 'senior-sweep', hairc: 'grey', beard: 'moustache', glasses: 'gold-round', marks: 'age-lines', brows: 'thick', mouth: 'pipe', outfit: 'vest-tie', bg: 'felt-green' } },
  { id: 'tycoon', label: 'avmPreTycoon', recipe: { sex: 0, face: 'm-round', skin: 'light', hair: 'balding', hairc: 'grey', nose: 'bulb', glasses: 'monocle', brows: 'raised', eyes: 'heavy', mouth: 'cigar', outfit: 'tux', badge: 'stack', bg: 'felt-burgundy' } },
  { id: 'clown', label: 'avmPreClown', recipe: { sex: 0, face: 'm-round', skin: 'porcelain', hair: 'curls-m', hairc: 'blue', nose: 'clown', brows: 'raised', eyes: 'wide', mouth: 'laugh', outfit: 'clown-suit', bg: 'pink' } },
  { id: 'tourist', label: 'avmPreTourist', recipe: { sex: 0, face: 'm-round', skin: 'light', hair: 'bald', glasses: 'sunglasses', mouth: 'grin', hat: 'panama', outfit: 'hawaiian', badge: 'chip', bg: 'sky' } },
  { id: 'ninja', label: 'avmPreNinja', recipe: { sex: 0, face: 'm-oval', skin: 'medium', hair: 'short', hairc: 'black', eyes: 'narrowed', brows: 'angry', hat: 'balaclava', outfit: 'tee', outfitc: 'black', bg: 'grey' } },
  { id: 'king', label: 'avmPreKing', recipe: { sex: 0, face: 'm-oval', skin: 'light', hair: 'pompadour', hairc: 'black', glasses: 'sunglasses', mouth: 'smirk', brows: 'one-raised', outfit: 'vegas-jumpsuit', badge: 'dice', bg: 'neon' } }
];

export { PRESETS };
