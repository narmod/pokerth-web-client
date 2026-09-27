// Avatar parts — face shapes (2.1.9-web.209).
//
// Ten outlines, five per silhouette: { id, sex, slot, key }. `key` indexes
// the outline (_headD) and its landmarks (FACE_PTS) in helpers.mjs; `slot`
// is the position in the studio row — switching silhouette keeps the slot
// (square jaw ↔ heart, rugged ↔ soft diamond), as the former numeric face
// index did.
//
// Adding a shape: add its outline to _headD and its landmarks to FACE_PTS
// (helpers.mjs), then an entry here with the next free key.

'use strict';

const FACES = [
  { id: 'm-oval', sex: 0, slot: 0, key: 0 },    // masculine oval, firm jaw
  { id: 'm-round', sex: 0, slot: 1, key: 1 },   // round, flat chin
  { id: 'm-square', sex: 0, slot: 2, key: 2 },  // square jaw
  { id: 'm-long', sex: 0, slot: 3, key: 3 },    // long, rectangular
  { id: 'm-rugged', sex: 0, slot: 4, key: 4 },  // rugged: wide cheekbones, angular chin
  { id: 'f-oval', sex: 1, slot: 0, key: 5 },    // feminine oval, tapered chin
  { id: 'f-round', sex: 1, slot: 1, key: 6 },   // round
  { id: 'f-heart', sex: 1, slot: 2, key: 7 },   // heart
  { id: 'f-slim', sex: 1, slot: 3, key: 8 },    // long, slim
  { id: 'f-diamond', sex: 1, slot: 4, key: 9 }  // soft diamond: high cheekbones, small chin
];

export { FACES };
