/**
 * Loads the polygons the Boston page draws.
 *
 * - `downtown`: the bundled Overture extract (JSON), three nested areas.
 * - `buildings` / `parcels`: the whole city, from `public/boston/full/*.bin`.
 *   Those files are too large for the repository; they are built from the
 *   official sources (Overture buildings, Analyze Boston Parcels 2025 joined
 *   with the FY2026 Property Assessment land use) and are not committed.
 *   A parcel's label is "<GIS_ID>|<land use>".
 *
 * Binary layout (little-endian):
 *   'MCPG' u32 version=1 u32 count
 *   per polygon: u8 labelLen, label (UTF-8), u16 height (0.1 m, 0xFFFF unknown),
 *                u16 ringCount, per ring: u32 n, n x (i32 dLat, i32 dLng)
 *   Coordinates are 1e-6 degree integers, each the difference from the
 *   previous vertex across the whole file.
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

export type LandUse =
  | 'family'
  | 'apartment'
  | 'condo'
  | 'mixed'
  | 'commercial'
  | 'industrial'
  | 'exempt'
  | 'vacant'
  | 'unknown';

/** Where loading has got to, for the overlay. */
export type LoadProgress =
  | { phase: 'download'; loaded: number; total: number | null }
  | { phase: 'decode' };

export interface BuildingsDoc {
  attribution: string;
  license: string;
  buildings: Building[];
}

const CITY_SOURCES: Record<Exclude<Dataset, 'downtown'>, { file: string; attribution: string; license: string }> = {
  buildings: {
    file: 'boston/full/boston-buildings-city.bin',
    attribution: '© OpenStreetMap contributors, Esri Community Maps contributors, USGS, Microsoft — via Overture Maps Foundation',
    license: 'ODbL 1.0',
  },
  parcels: {
    file: 'boston/full/boston-parcels.bin',
    attribution: 'City of Boston, Parcels 2025 and FY2026 Property Assessment (Analyze Boston)',
    license: 'ODC PDDL',
  },
};

export async function loadDataset(
  dataset: Dataset,
  onProgress: (progress: LoadProgress) => void = () => {},
): Promise<BuildingsDoc> {
  if (dataset === 'downtown') {
    const response = await fetch(`${import.meta.env.BASE_URL}boston/boston-buildings.json`);
    const bytes = await readWithProgress(response, onProgress);
    onProgress({ phase: 'decode' });
    await nextPaint();
    return JSON.parse(new TextDecoder().decode(bytes)) as BuildingsDoc;
  }
  const source = CITY_SOURCES[dataset];
  const response = await fetch(`${import.meta.env.BASE_URL}${source.file}`);
  if (!response.ok) throw new Error(`${source.file}: ${response.status}`);
  const bytes = await readWithProgress(response, onProgress);
  onProgress({ phase: 'decode' });
  // Decoding blocks the main thread; let the overlay show the new phase first.
  await nextPaint();
  return { attribution: source.attribution, license: source.license, buildings: decode(bytes.buffer as ArrayBuffer, dataset) };
}

/** Resolves after the browser has painted, so a state change shows before blocking work. */
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

async function readWithProgress(response: Response, onProgress: (progress: LoadProgress) => void): Promise<Uint8Array> {
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

function decode(buffer: ArrayBuffer, dataset: string): Building[] {
  const view = new DataView(buffer);
  const magic = String.fromCharCode(...new Uint8Array(buffer, 0, 4));
  if (magic !== 'MCPG' || view.getUint32(4, true) !== 1) throw new Error('not an MCPG v1 file');
  const count = view.getUint32(8, true);
  const text = new TextDecoder();
  const buildings: Building[] = new Array(count);
  const seen = new Set<string>();
  let offset = 12;
  let lat = 0;
  let lng = 0;
  for (let i = 0; i < count; i++) {
    const labelLength = view.getUint8(offset);
    const label = text.decode(new Uint8Array(buffer, offset + 1, labelLength));
    offset += 1 + labelLength;
    const height = view.getUint16(offset, true);
    const ringCount = view.getUint16(offset + 2, true);
    offset += 4;
    const rings: number[][] = [];
    for (let r = 0; r < ringCount; r++) {
      const n = view.getUint32(offset, true);
      offset += 4;
      const ring = new Array<number>(n * 2);
      for (let v = 0; v < n; v++) {
        lat += view.getInt32(offset, true);
        lng += view.getInt32(offset + 4, true);
        offset += 8;
        ring[v * 2] = lng / 1e6;
        ring[v * 2 + 1] = lat / 1e6;
      }
      rings.push(ring);
    }
    // A building's label is its Overture id; a parcel's is "<parcel id>|<land use>".
    // Parts of a multipolygon share the label, so a repeat gets the index appended.
    const [key, use] = dataset === 'parcels' ? label.split('|') : [label, undefined];
    let id = key || `${dataset}-${i}`;
    if (seen.has(id)) id = `${id}#${i}`;
    seen.add(id);
    buildings[i] = {
      id,
      l: 0,
      h: height === 0xffff ? null : height / 10,
      n: dataset === 'parcels' && key ? `Parcel ${key}` : undefined,
      use: dataset === 'parcels' ? ((use as LandUse | undefined) ?? 'unknown') : undefined,
      rings,
    };
  }
  return buildings;
}
