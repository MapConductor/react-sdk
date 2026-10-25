/**
 * Tokyo's street trees: 144,183 of them, from the metropolitan government's
 * open data.
 *
 * A harder shape than the post office set. There are six times as many, they
 * sit inside one metropolitan area rather than spread over a country, and each
 * species draws its own colour — so the renderer cannot collapse two trees of
 * different species that land on the same pixel.
 *
 * Species with fewer than a hundred trees are folded into one bucket. The
 * distribution has a long tail: a hundred species cover 96% of the trees, and
 * the remaining three hundred would be indistinguishable colours nobody could
 * read off a legend. The bucket is still the fifth largest group, so it is not
 * a rounding error being hidden.
 */
export interface StreetTree {
  // MarkerState.extra is Serializable, which wants an index signature: the SDK
  // carries this across the marker abstraction without knowing what it is.
  [key: string]: unknown;
  latitude: number;
  longitude: number;
  species: string;
  speciesIndex: number;
  /** Height in metres, as recorded in the survey. */
  heightM: number;
  /** Trunk circumference in centimetres. */
  girthCm: number;
  ward: string;
  roadName: string;
}

export interface StreetTreeData {
  trees: StreetTree[];
  /** The species table the icon colours are indexed by. */
  species: string[];
}

/** Magic, then a version byte the reader checks by length rather than value. */
const MAGIC = 'TREE';
const HEADER_BYTES = 5;

/** lat, lon, species, height, girth, ward, road. */
const RECORD_BYTES = 20;

/**
 * Reads the packed asset: the magic, three string tables, then one fixed
 * record per tree, all little-endian.
 *
 * The source is a 12 MB Shift-JIS CSV. Parsing that in the browser would
 * measure CSV parsing rather than the map, and the packed form is 2.8 MB.
 * android-sdk and ios-sdk read the same bytes.
 */
export function decodeStreetTrees(buffer: ArrayBuffer): StreetTreeData {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const utf8 = new TextDecoder();
  let at = HEADER_BYTES;

  const magic = utf8.decode(bytes.subarray(0, MAGIC.length));
  if (magic !== MAGIC) throw new Error('unexpected street tree asset format');

  const table = (): string[] => {
    const count = view.getUint32(at, true);
    at += 4;
    const names: string[] = new Array(count);
    for (let index = 0; index < count; index++) {
      const length = view.getUint16(at, true);
      at += 2;
      names[index] = utf8.decode(bytes.subarray(at, at + length));
      at += length;
    }
    return names;
  };

  const species = table();
  const wards = table();
  const roads = table();

  const count = view.getUint32(at, true);
  at += 4;
  const trees: StreetTree[] = new Array(count);
  for (let index = 0; index < count; index++) {
    const speciesIndex = view.getUint16(at + 8, true);
    trees[index] = {
      latitude: view.getFloat32(at, true),
      longitude: view.getFloat32(at + 4, true),
      speciesIndex,
      species: species[speciesIndex],
      heightM: view.getFloat32(at + 10, true),
      girthCm: view.getUint16(at + 14, true),
      ward: wards[view.getUint16(at + 16, true)],
      roadName: roads[view.getUint16(at + 18, true)],
    };
    at += RECORD_BYTES;
  }
  return { trees, species };
}

export interface StreetTreeDataSource {
  load(): Promise<StreetTreeData>;
}

export function createStreetTreeDataSource(baseUrl: string): StreetTreeDataSource {
  return {
    async load() {
      const response = await fetch(`${baseUrl}streettree/tokyo-trees.bin`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return decodeStreetTrees(await response.arrayBuffer());
    },
  };
}

export const browserStreetTreeDataSource = createStreetTreeDataSource(import.meta.env.BASE_URL);
