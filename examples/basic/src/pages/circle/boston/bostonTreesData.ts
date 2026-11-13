/**
 * Loads the trees the Boston trees page draws (`public/boston/boston-city-trees.bin`):
 * every street and park tree in the City of Boston's tree inventory (Analyze
 * Boston, *BPRD Trees*), each a circle of its estimated crown. The file format
 * is in treesFile.ts; `tools/boston/` builds the file from the official source
 * (see its README).
 */
import { readWithProgress, nextPaint, type LoadProgress } from '../../polygon/boston/bostonData';
import { decodeTrees, type Tree } from './treesFile';

export { nextPaint, type LoadProgress };
export { TREE_GROUPS, type Tree, type TreeGroup } from './treesFile';

export interface TreesDoc {
  attribution: string;
  license: string;
  trees: Tree[];
}

const SOURCE = {
  file: 'boston/boston-city-trees.bin',
  attribution: 'Trees: City of Boston (BPRD Trees, PDDL)',
  license: 'ODC PDDL 1.0',
};

export async function loadTrees(onProgress: (progress: LoadProgress) => void = () => {}): Promise<TreesDoc> {
  const response = await fetch(`${import.meta.env.BASE_URL}${SOURCE.file}`);
  if (!response.ok) throw new Error(`${SOURCE.file}: ${response.status}`);
  const bytes = await readWithProgress(response, onProgress);
  onProgress({ phase: 'decode' });
  // Decoding blocks the main thread; let the overlay show the new phase first.
  await nextPaint();
  return { attribution: SOURCE.attribution, license: SOURCE.license, trees: decodeTrees(bytes, 'tree') };
}
