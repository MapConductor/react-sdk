/**
 * Loads the polygons the Boston page draws.
 *
 * - `downtown`: Overture building footprints of downtown in three nested
 *   areas (`public/boston/boston-downtown.bin`).
 * - `buildings` / `parcels`: the whole city (`public/boston/boston-city-*.bin`):
 *   Overture buildings, and Analyze Boston Parcels 2025 joined with the FY2026
 *   Property Assessment land use.
 *
 * All three are bundled. `tools/boston/` builds them from the official sources
 * (see its README).
 *
 * The files carry no ids: this is a polygon demo, and a polygon's id on the
 * map is its index in the file.
 *
 * Binary layout, MCPG v2:
 *   'MCPG' u32 version=2 u32 count u8 fields u8 digits   (little-endian)
 *     fields: 1 = height, 2 = land use, 4 = area, 8 = name (what the file carries)
 *     digits: coordinates are integers of 10^-digits degree (buildings 6, parcels 5)
 *   per polygon, only the fields present, in this order:
 *     height    varint, 0 = unknown, else the height in 0.1 m plus 1
 *     land use  u8, the index in LAND_USES (family … unknown)
 *     area      u8, the smallest downtown area (0, 1 or 2) the building fits in
 *     name      varint byte length (0 = none), UTF-8
 *     varint ringCount, per ring: varint n, n x (svarint dLat, svarint dLng)
 *   varint is LEB128 (7 bits at a time, low first); svarint is a zigzag varint.
 *   Coordinates are integers of 10^-digits degree, each the difference from
 *   the previous vertex across the whole file. A ring's closing vertex (the same
 *   as its first) is not stored: n counts the others, and the reader closes
 *   the ring again.
 */
export type Dataset = 'downtown' | 'buildings' | 'parcels';

export interface Building {
  id: string;
  /** The smallest downtown area (0, 1 or 2) the building fits in; 0 for the city-wide sets. */
  l: number;
  h: number | null;
  n?: string;
  /** A parcel's land use, from the City of Boston's Property Assessment. */
  use?: LandUse;
  /** Rings as flat [lng, lat, lng, lat, ...]; the first is the outline, the rest holes. */
  rings: number[][];
}

/** The land uses, in the order the file stores them (a land use is its index here). */
export const LAND_USES = [
  'family',
  'apartment',
  'condo',
  'mixed',
  'commercial',
  'industrial',
  'exempt',
  'vacant',
  'unknown',
] as const;

export type LandUse = (typeof LAND_USES)[number];

/** Where loading has got to, for the overlay. */
export type LoadProgress =
  | { phase: 'download'; loaded: number; total: number | null }
  | { phase: 'decode' };

export interface BuildingsDoc {
  attribution: string;
  license: string;
  buildings: Building[];
}

const OVERTURE = {
  attribution: '© OpenStreetMap contributors, Esri Community Maps contributors, USGS, Microsoft — via Overture Maps Foundation',
  license: 'ODbL 1.0',
};

const SOURCES: Record<Dataset, { file: string; attribution: string; license: string }> = {
  downtown: { file: 'boston/boston-downtown.bin', ...OVERTURE },
  buildings: { file: 'boston/boston-city-buildings.bin', ...OVERTURE },
  parcels: {
    file: 'boston/boston-city-parcels.bin',
    attribution: 'City of Boston, Parcels 2025 and FY2026 Property Assessment (Analyze Boston)',
    license: 'ODC PDDL',
  },
};

export async function loadDataset(
  dataset: Dataset,
  onProgress: (progress: LoadProgress) => void = () => {},
): Promise<BuildingsDoc> {
  const source = SOURCES[dataset];
  const response = await fetch(`${import.meta.env.BASE_URL}${source.file}`);
  if (!response.ok) throw new Error(`${source.file}: ${response.status}`);
  const bytes = await readWithProgress(response, onProgress);
  onProgress({ phase: 'decode' });
  // Decoding blocks the main thread; let the overlay show the new phase first.
  await nextPaint();
  return { attribution: source.attribution, license: source.license, buildings: decodeMcpg(bytes, dataset) };
}

/** Resolves after the browser has painted, so a state change shows before blocking work. */
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

export async function readWithProgress(response: Response, onProgress: (progress: LoadProgress) => void): Promise<Uint8Array> {
  const header = response.headers.get('Content-Length');
  // A compressed response's Content-Length counts compressed bytes; fall back to a byte count.
  const total = header && !response.headers.get('Content-Encoding') ? Number(header) : null;
  if (!response.body) return new Uint8Array(await response.arrayBuffer());
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  onProgress({ phase: 'download', loaded, total });
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    onProgress({ phase: 'download', loaded, total });
  }
  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

const FIELD_HEIGHT = 1;
const FIELD_USE = 2;
const FIELD_AREA = 4;
const FIELD_NAME = 8;

/** Decodes an MCPG v2 file (see the top of this file); polygon `i` gets the id "<idPrefix>-<i>". */
export function decodeMcpg(bytes: Uint8Array, idPrefix: string): Building[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (magic !== 'MCPG' || view.getUint32(4, true) !== 2) throw new Error('not an MCPG v2 file');
  const count = view.getUint32(8, true);
  const fields = bytes[12];
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
  const buildings: Building[] = new Array(count);
  let lat = 0;
  let lng = 0;
  for (let i = 0; i < count; i++) {
    let h: number | null = null;
    let use: LandUse | undefined;
    let l = 0;
    let n: string | undefined;
    if (fields & FIELD_HEIGHT) {
      const height = varint();
      h = height === 0 ? null : (height - 1) / 10;
    }
    if (fields & FIELD_USE) use = LAND_USES[bytes[offset++]];
    if (fields & FIELD_AREA) l = bytes[offset++];
    if (fields & FIELD_NAME) {
      const length = varint();
      if (length > 0) n = text.decode(bytes.subarray(offset, offset + length));
      offset += length;
    }
    const ringCount = varint();
    const rings: number[][] = new Array(ringCount);
    for (let r = 0; r < ringCount; r++) {
      const vertices = varint();
      // The closing vertex is not stored; it is the first one again.
      const ring = new Array<number>((vertices + 1) * 2);
      for (let v = 0; v < vertices; v++) {
        lat += svarint();
        lng += svarint();
        ring[v * 2] = lng / scale;
        ring[v * 2 + 1] = lat / scale;
      }
      ring[vertices * 2] = ring[0];
      ring[vertices * 2 + 1] = ring[1];
      rings[r] = ring;
    }
    buildings[i] = { id: `${idPrefix}-${i}`, l, h, n, use, rings };
  }
  return buildings;
}
