import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createGeoPoint, createMapCameraPosition, type MarkerState } from '@mapconductor/js-sdk-core';
import { MarkerClusterGroup, type MarkerCluster } from '@mapconductor/react-marker-clustering';
import { ControlPanel } from '../../../components/ControlPanel';
import { useSampleI18n } from '../../../i18n';
import { PostOfficeInfoBubble } from '../postoffice/PostOfficeInfoBubble';
import {
  PostOfficeMapProvider,
  type PostOfficeMapContentProps,
  type PostOfficeMapState,
} from '../postoffice/PostOfficeMapProvider';
import { browserPostOfficeDataSource, type PostOfficeDataSource } from '../postoffice/postOfficeData';
import { usePostOfficeMarkers } from '../postoffice/usePostOfficeMarkers';
import { createClusterIconProvider } from './clusterIcons';

const INITIAL_CAMERA = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.68049, longitude: 139.76669 }),
  zoom: 10,
});

function useClusterClick(mapViewState: PostOfficeMapState, markerStates: MarkerState[]) {
  const markerMapRef = useRef(new Map<string, MarkerState>());
  useEffect(() => {
    markerMapRef.current = new Map(markerStates.map(marker => [marker.id, marker]));
  }, [markerStates]);
  return useCallback((cluster: MarkerCluster) => {
    const markers = cluster.markerIds.flatMap(id => {
      const marker = markerMapRef.current.get(id);
      return marker ? [marker] : [];
    });
    if (markers.length === 0) return;
    const latitude = markers.reduce((sum, marker) => sum + marker.position.latitude, 0) / markers.length;
    const longitude = markers.reduce((sum, marker) => sum + marker.position.longitude, 0) / markers.length;
    mapViewState.moveCameraTo(createMapCameraPosition({
      position: createGeoPoint({ latitude, longitude }),
      zoom: Math.min((mapViewState.cameraPosition?.zoom ?? 10) + 2, 18),
    }), 600);
  }, [mapViewState]);
}

function ClusterContent({
  mapViewState,
  renderMapView,
  dataSource,
}: PostOfficeMapContentProps & { dataSource: PostOfficeDataSource }) {
  const { t } = useSampleI18n();
  const [selected, setSelected] = useState<MarkerState | null>(null);
  const [debugHullPolygons, setDebugHullPolygons] = useState(false);
  const selectMarker = useCallback((marker: MarkerState) => setSelected(marker), []);
  const { error, markerStates, records, clusterImage } = usePostOfficeMarkers(dataSource, true, selectMarker, 0.5);
  const clusterIconProvider = useMemo(
    () => clusterImage ? createClusterIconProvider(clusterImage) : undefined,
    [clusterImage],
  );
  const handleClusterClick = useClusterClick(mapViewState, markerStates);

  if (error) return <div style={{ padding: '2rem', textAlign: 'center' }}><p>データの読み込みに失敗しました: {error}</p></div>;

  return renderMapView(
    <>
      <MarkerClusterGroup
        markers={markerStates}
        clusterIconProvider={clusterIconProvider}
        onClusterClick={handleClusterClick}
        minClusterSize={3}
        clusterRadiusPx={80}
        enableZoomAnimation
        enablePanAnimation
        debugHullPolygons={debugHullPolygons}
      />
      {selected && <PostOfficeInfoBubble marker={selected} mapViewState={mapViewState} />}
      <ControlPanel title={t('Post Office Clusters (24,526 markers)', '郵便局クラスタリング（24,526件）')}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
          <input type="checkbox" checked={debugHullPolygons} onChange={event => setDebugHullPolygons(event.target.checked)} />
          {t('Show debug hull polygons', 'デバッグ用の外周ポリゴンを表示')}
        </label>
        <p className="control-panel-note">
          {records
            ? t('Click a cluster to zoom in. Click an individual marker for details.', 'クラスターをクリックするとズームインし、個別マーカーで郵便局情報を表示します。')
            : t('Loading data…', 'データを読み込んでいます…')}
        </p>
      </ControlPanel>
    </>,
    () => setSelected(null),
  );
}

export function PostOfficeClusterPage({
  dataSource = browserPostOfficeDataSource,
}: {
  dataSource?: PostOfficeDataSource;
}) {
  return (
    <PostOfficeMapProvider cameraPosition={INITIAL_CAMERA}>
      {props => <ClusterContent {...props} dataSource={dataSource} />}
    </PostOfficeMapProvider>
  );
}
