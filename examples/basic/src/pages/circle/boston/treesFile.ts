/**
 * The circle file of the Boston trees page (`public/boston/boston-city-trees.bin`),
 * read without anything from the page so the tests can load it in Node.
 *
 * The file carries no ids: this is a circle demo, and a tree's id on the map
 * is its index in the file. Nor does it carry species, addresses or dates:
 * only where a tree stands, the estimated radius of its crown and its group.
 *
 * Binary layout: MCPG v2 (see polygon/boston/bostonData.ts) with two more bits
 * in `fields`:
 *     64  = circles: each record is one circle, `varint radius` (0.1 m, at
 *           least 1) and its centre as one `svarint dLat, svarint dLng` of the
 *           file's difference series; no ring count.
 *     128 = tree group: u8 after the road class's place, the index in TREE_GROUPS.
 *   The trees file has fields = 64 | 128, digits = 5, records in Hilbert-curve
 *   order of their centres:
 *     u8 group · varint radius · svarint dLat · svarint dLng
 */

/** The tree groups, in the order the file stores them (a group is its index here). */
export const TREE_GROUPS = ['maple', 'oak', 'honeylocust', 'linden', 'elm', 'flowering', 'conifer', 'other'] as const;

export type TreeGroup = (typeof TREE_GROUPS)[number];

export interface Tree {
  id: string;
  group: TreeGroup;
  latitude: number;
  longitude: number;
  /** The estimated crown radius on the ground, in metres (0.1 m steps). */
  radiusMeters: number;
}

const FIELD_HEIGHT = 1;
const FIELD_USE = 2;
const FIELD_AREA = 4;
const FIELD_NAME = 8;
const FIELD_CLASS = 16;
const FIELD_LINES = 32;
const FIELD_CIRCLES = 64;
const FIELD_TREE = 128;

/** Decodes an MCPG v2 file of circles (the circles bit set); tree `i` gets the id "<idPrefix>-<i>". */
export function decodeTrees(bytes: Uint8Array, idPrefix: string): Tree[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (magic !== 'MCPG' || view.getUint32(4, true) !== 2) throw new Error('not an MCPG v2 file');
  const count = view.getUint32(8, true);
  const fields = bytes[12];
  if (!(fields & FIELD_CIRCLES)) throw new Error('not a file of circles (no circles bit)');
  if (fields & FIELD_LINES) throw new Error('a file of circles cannot also be one of polylines');
  if (!(fields & FIELD_TREE)) throw new Error('no tree group in the file');
  const scale = 10 ** bytes[13];
  let offset = 14;
  // Values stay below 2^31 here, so the shifts and the zigzag work on 32-bit ints.
  const varint = (): number => {
    let value = 0;
    let shift = 0;
    for (;;) {
      const b = bytes[offset++];
      value |= (b & 0x7f) << shift;
      if (b < 0x80) return value >>> 0;
      shift += 7;
    }
  };
  const svarint = (): number => {
    const v = varint();
    return (v >>> 1) ^ -(v & 1);
  };
  const trees: Tree[] = new Array(count);
  let lat = 0;
  let lng = 0;
  for (let i = 0; i < count; i++) {
    // Fields a trees file does not carry are still skipped by their layout.
    if (fields & FIELD_HEIGHT) varint();
    if (fields & FIELD_USE) offset++;
    if (fields & FIELD_AREA) offset++;
    if (fields & FIELD_NAME) offset += varint();
    if (fields & FIELD_CLASS) offset++;
    const group = TREE_GROUPS[bytes[offset++]];
    if (group === undefined) throw new Error(`tree ${i}: unknown group ${bytes[offset - 1]}`);
    const radius = varint();
    lat += svarint();
    lng += svarint();
    trees[i] = { id: `${idPrefix}-${i}`, group, latitude: lat / scale, longitude: lng / scale, radiusMeters: radius / 10 };
  }
  return trees;
}
