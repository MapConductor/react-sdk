/**
 * Loads the roads the Boston roads page draws (`public/boston/boston-city-roads.bin`):
 * every road of the City of Boston from Overture Maps (`transportation/segment`,
 * road subtype), cut at the city boundary. The file format is in roadsFile.ts;
 * `tools/boston/` builds the file from the official sources (see its README).
 */
import { readWithProgress, nextPaint, type LoadProgress } from '../../polygon/boston/bostonData';
import { decodeRoads, type Road } from './roadsFile';

export { nextPaint, type LoadProgress };
export { ROAD_CLASSES, type Road, type RoadClass } from './roadsFile';

export interface RoadsDoc {
  attribution: string;
  license: string;
  roads: Road[];
}

const SOURCE = {
  file: 'boston/boston-city-roads.bin',
  attribution: '© OpenStreetMap contributors, TomTom — via Overture Maps Foundation',
  license: 'ODbL 1.0',
};

export async function loadRoads(onProgress: (progress: LoadProgress) => void = () => {}): Promise<RoadsDoc> {
  const response = await fetch(`${import.meta.env.BASE_URL}${SOURCE.file}`);
  if (!response.ok) throw new Error(`${SOURCE.file}: ${response.status}`);
  const bytes = await readWithProgress(response, onProgress);
  onProgress({ phase: 'decode' });
  // Decoding blocks the main thread; let the overlay show the new phase first.
  await nextPaint();
  return { attribution: SOURCE.attribution, license: SOURCE.license, roads: decodeRoads(bytes, 'road') };
}

