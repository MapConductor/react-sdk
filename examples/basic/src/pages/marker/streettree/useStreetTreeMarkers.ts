import { useEffect, useMemo, useState } from 'react';
import {
  createGeoPoint,
  createMarkerState,
  type ImageIcon,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { createSpeciesIcons } from './treeIcons';
import type { StreetTree, StreetTreeDataSource } from './streetTreeData';

interface StreetTreeMarkerResult {
  error: string | null;
  markerStates: MarkerState[];
  trees: StreetTree[] | null;
  species: string[] | null;
  isLoading: boolean;
}

export function useStreetTreeMarkers(
  dataSource: StreetTreeDataSource,
  onMarkerClick: (marker: MarkerState) => void,
): StreetTreeMarkerResult {
  const [trees, setTrees] = useState<StreetTree[] | null>(null);
  const [species, setSpecies] = useState<string[] | null>(null);
  const [icons, setIcons] = useState<ImageIcon[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    dataSource.load().then(data => {
      if (!active) return;
      setTrees(data.trees);
      setSpecies(data.species);
      setIcons(createSpeciesIcons(data.species.length));
    }).catch(reason => {
      if (active) setError(String(reason));
    });
    return () => { active = false; };
  }, [dataSource]);

  const markerStates = useMemo(
    () => (trees ?? []).map((tree, index) =>
      createMarkerState({
        id: String(index),
        position: createGeoPoint({ latitude: tree.latitude, longitude: tree.longitude }),
        extra: tree,
        icon: icons?.[tree.speciesIndex] ?? null,
        onClick: onMarkerClick,
      })),
    [icons, onMarkerClick, trees],
  );

  return { error, markerStates, trees, species, isLoading: trees === null && error === null };
}
