/**
 * The roads file of the Boston roads page (`public/boston/boston-city-roads.bin`),
 * read without anything from the page so the tests can load it in Node.
 *
 * The file carries no ids: this is a polyline demo, and a road's id on the map
 * is its index in the file.
 *
 * Binary layout: MCPG v2 (see polygon/boston/bostonData.ts) with two more bits
 * in `fields`:
 *     16 = road class: u8 after the name, the index in ROAD_CLASSES
 *     32 = lines: each record's "ring" is an open polyline. Every vertex is
 *          stored (n >= 2) and the reader does not close it.
 *   The roads file has fields = 8 | 16 | 32 (name, class, lines), digits = 5,
 *   and one polyline per record:
 *     varint name length (0 = none), UTF-8 · u8 class · varint 1 · varint n ·
 *     n x (svarint dLat, svarint dLng)
 */

/** The road classes, in the order the file stores them (a class is its index here). */
export const ROAD_CLASSES = ['highway', 'primary', 'secondary', 'tertiary', 'local', 'service', 'path'] as const;

export type RoadClass = (typeof ROAD_CLASSES)[number];

export interface Road {
  id: string;
  cls: RoadClass;
  name?: string;
  /** The polyline as flat [lng, lat, lng, lat, ...], open. */
  path: number[];
}

const FIELD_HEIGHT = 1;
const FIELD_USE = 2;
const FIELD_AREA = 4;
const FIELD_NAME = 8;
const FIELD_CLASS = 16;
const FIELD_LINES = 32;

/** Decodes an MCPG v2 file of polylines (the lines bit set); road `i` gets the id "<idPrefix>-<i>". */
export function decodeRoads(bytes: Uint8Array, idPrefix: string): Road[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (magic !== 'MCPG' || view.getUint32(4, true) !== 2) throw new Error('not an MCPG v2 file');
  const count = view.getUint32(8, true);
  const fields = bytes[12];
  if (!(fields & FIELD_LINES)) throw new Error('not a file of polylines (no lines bit)');
  if (!(fields & FIELD_CLASS)) throw new Error('no road class in the file');
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
  const text = new TextDecoder();
  const roads: Road[] = [];
  let lat = 0;
  let lng = 0;
  for (let i = 0; i < count; i++) {
    // Fields a roads file does not carry are still skipped by their layout.
    if (fields & FIELD_HEIGHT) varint();
    if (fields & FIELD_USE) offset++;
    if (fields & FIELD_AREA) offset++;
    let name: string | undefined;
    if (fields & FIELD_NAME) {
      const length = varint();
      if (length > 0) name = text.decode(bytes.subarray(offset, offset + length));
      offset += length;
    }
    const cls = ROAD_CLASSES[bytes[offset++]];
    const pathCount = varint();
    for (let r = 0; r < pathCount; r++) {
      const vertices = varint();
      const path = new Array<number>(vertices * 2);
      for (let v = 0; v < vertices; v++) {
        lat += svarint();
        lng += svarint();
        path[v * 2] = lng / scale;
        path[v * 2 + 1] = lat / scale;
      }
      // One polyline per record in the roads file; were there more, each would be a road.
      roads.push({ id: `${idPrefix}-${pathCount === 1 ? i : `${i}.${r}`}`, cls, name, path });
    }
  }
  return roads;
}
