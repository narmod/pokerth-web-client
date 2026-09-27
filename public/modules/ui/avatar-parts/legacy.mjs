// Avatar parts — migration of recipes saved before 2.1.9-web.209.
//
// Recipes v1 (no `v`) and v2 stored numeric option indices; from v3 they
// store part ids. These tables freeze the v2 index order of every axis so
// the catalogue can be reordered, trimmed or extended without ever
// breaking a saved portrait. Never edit an existing row — append to the
// part lists instead.

'use strict';

// v1 → v2 skin remap (the ten-tone palette of web.207 and before).
const V1_SKIN = [1, 1, 2, 3, 4, 5, 0, 6, 6, 6];

const V2 = {
  bg: ['green', 'blue', 'pink', 'purple', 'grey', 'teal', 'peach', 'white', 'offwhite', 'cream', 'sky', 'felt-green', 'felt-burgundy', 'card-back', 'neon'],
  outfit: ['suit-charcoal', 'suit-navy-tie', 'vest-tie', 'sweater-collar', 'tux', 'shirt-open', 'blouse-v', 'turtleneck', 'dinner-jacket', 'dress-strapless',
    'leather-jacket', 'hoodie', 'dress-v', 'dress-halter', 'top-necklace', 'shirt-collar', 'blazer-scarf', 'tee', 'polo', 'plaid', 'sweater-crew',
    'denim-jacket', 'bomber', 'jersey', 'hoodie-zip', 'blouse-floral', 'dress-strap', 'blouse-bow', 'blazer', 'cardigan', 'sweatshirt', 'swimsuit',
    'tee-scoop', 'dealer-vest', 'dealer-vest-f', 'tee-royal-flush', 'tee-royal-flush-f', 'shirt-suits', 'blouse-suits', 'pinstripe', 'pinstripe-f',
    'biker-vest', 'biker-vest-f'],
  outfitc: ['auto', 'red', 'blue', 'green', 'yellow', 'purple', 'black', 'white', 'pink'],
  skin: ['porcelain', 'light', 'medium', 'tan', 'brown', 'dark', 'deep'],
  marks: ['none', 'freckles', 'beauty-mark', 'age-lines', 'brow-scar', 'dimples', 'cheek-scar', 'nose-scar', 'black-eye', 'tattoo-temple'],
  hair: ['bald', 'short', 'slicked', 'ponytail-high', 'curly', 'bob', 'senior-sweep', 'bun', 'long-middle', 'undercut', 'afro', 'side-braid', 'pixie',
    'close-curls', 'long-wavy', 'dreadlocks', 'balding', 'mohawk', 'surfer', 'pigtails', 'box-braids', 'side-bun', 'asym-bob', 'big-curls',
    'ponytail-low', 'hollywood', 'side-part', 'mid-tucked', 'ponytail-m', 'buzz', 'long-curly-m', 'curtain', 'short-bob', 'crown-braid',
    'fringe-long', 'very-long', 'cropped', 'messy-bun', 'locs', 'curls-m', 'pompadour', 'flat-top', 'man-bun', 'long-straight-m',
    'curly-ponytail', 'lob', 'long-curls-fringe', 'braided-bun', 'afro-short', 'half-up', 'bed-head', 'bed-head-f'],
  hairc: ['black', 'dark-brown', 'brown', 'auburn', 'blonde', 'grey', 'light-blonde', 'white', 'light-brown', 'light-red', 'blue', 'pink'],
  beard: ['none', 'moustache', 'goatee', 'short', 'full', 'stubble', 'long'],
  eyes: ['round', 'almond', 'closed', 'wink', 'wide', 'heavy', 'narrowed', 'scarred', 'bloodshot', 'side-glance'],
  eyec: ['brown', 'blue', 'green', 'grey', 'hazel', 'black'],
  brows: ['neutral', 'angry', 'one-raised', 'thick', 'thin-arched'],
  nose: ['bulb', 'long', 'button', 'wide', 'aquiline'],
  mouth: ['smile', 'grin', 'neutral', 'lipstick', 'smirk', 'pout', 'laugh', 'small-o', 'frown', 'tongue', 'cigar', 'sneer', 'gritted', 'toothpick', 'gold-tooth'],
  glasses: ['none', 'round', 'rect', 'cat-eye', 'gold-round', 'sunglasses', 'eye-patch', 'monocle', 'aviators'],
  shoulder: ['none', 'none', 'none', 'none', 'none'],
  ears: ['none', 'pearl-studs', 'gold-studs', 'hoops', 'hoop-left', 'hoop-right', 'skull-studs', 'brow-ring'],
  hat: ['none', 'cap', 'fedora', 'visor', 'bowler', 'panama', 'bandana', 'flat-cap', 'cap-back', 'beanie', 'hood', 'stetson', 'top-hat', 'cap-spade', 'fedora-ace', 'crown'],
  badge: ['none', 'dealer', 'chip', 'aces', 'dice', 'stack']
};
// face: numeric slot per silhouette
const V2_FACE = [['m-oval', 'm-round', 'm-square', 'm-long', 'm-rugged'], ['f-oval', 'f-round', 'f-heart', 'f-slim', 'f-diamond']];

export { V1_SKIN, V2, V2_FACE };
