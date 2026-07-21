import { useEffect, useMemo, useState } from 'react';
import {
  ImageIcon,
  createGeoPoint,
  createMarkerState,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import type { PostOfficeDataSource, PostOfficeRecord } from './postOfficeData';

export interface PostOfficeExtra {
  name: string;
  address: string;
}

interface PostOfficeMarkerResult {
  error: string | null;
  markerStates: MarkerState[];
  records: PostOfficeRecord[] | null;
  clusterImage: HTMLImageElement | null;
}

export function usePostOfficeMarkers(
  dataSource: PostOfficeDataSource,
  includeClusterImage: boolean,
  onMarkerClick: (marker: MarkerState) => void,
  iconScale = 1,
): PostOfficeMarkerResult {
  const [records, setRecords] = useState<PostOfficeRecord[] | null>(null);
  const [icon, setIcon] = useState<ImageIcon | null>(null);
  const [clusterImage, setClusterImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    dataSource.load(includeClusterImage).then(assets => {
      if (!active) return;
      setRecords(assets.records);
      setIcon(new ImageIcon(assets.markerImage, { scale: iconScale }));
      setClusterImage(assets.clusterImage ?? null);
    }).catch(reason => {
      if (active) setError(String(reason));
    });
    return () => { active = false; };
  }, [dataSource, iconScale, includeClusterImage]);

  // #region markerStates
  const markerStates = useMemo(
    () => (records ?? []).map(([latitude, longitude, name, address], index) =>
      createMarkerState({
        id: `po-${index}`,
        position: createGeoPoint({ latitude, longitude }),
        extra: { name, address } satisfies PostOfficeExtra,
        icon,
        onClick: onMarkerClick,
      })),
    [icon, onMarkerClick, records],
  );
  // #endregion markerStates

  return { error, markerStates, records, clusterImage };
}
