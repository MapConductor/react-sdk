import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createGeoPoint, createMapCameraPosition, type MarkerState } from '@mapconductor/js-sdk-core';
import { MarkerClusterGroup, type MarkerCluster } from '@mapconductor/react-marker-clustering';
import { ControlPanel } from '../../../components/ControlPanel';
import { useSampleI18n } from '../../../samples/i18n';
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
      <ControlPanel title={t(
        {
          en: 'Post Office Clusters (24,526 markers)',
          ja: '郵便局クラスタリング（24,526件）',
          'es-419': 'Grupos de oficinas postales (24,526 marcadores)',
          de: 'Postfilialen-Cluster (24.526 Marker)',
          th: 'กลุ่มที่ทำการไปรษณีย์ (24,526 มาร์กเกอร์)',
          hi: 'डाकघरों के क्लस्टर (24,526 मार्कर)',
        },
      )}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
          <input type="checkbox" checked={debugHullPolygons} onChange={event => setDebugHullPolygons(event.target.checked)} />
          {t(
            {
              en: 'Show debug hull polygons',
              ja: 'デバッグ用の外周ポリゴンを表示',
              'es-419': 'Mostrar polígonos de envolvente para depuración',
              de: 'Debug-Hüllpolygone anzeigen',
              th: 'แสดงโพลีกอนขอบเขตสำหรับดีบัก',
              hi: 'डीबग के लिए बाहरी पॉलीगॉन दिखाएँ',
            },
          )}
        </label>
        <p className="control-panel-note">
          {records
            ? t(
              {
                en: 'Click a cluster to zoom in. Click an individual marker for details.',
                ja: 'クラスターをクリックするとズームインし、個別マーカーで郵便局情報を表示します。',
                'es-419': 'Haz clic en un grupo para acercarte. Haz clic en un marcador individual para ver los detalles.',
                de: 'Klicken Sie auf einen Cluster, um hineinzuzoomen. Für Details klicken Sie einen einzelnen Marker an.',
                th: 'คลิกกลุ่มเพื่อซูมเข้า และคลิกมาร์กเกอร์เดี่ยวเพื่อดูรายละเอียด',
                hi: 'क्लस्टर पर क्लिक करने से ज़ूम होता है; अलग मार्कर पर क्लिक करने से ब्योरा दिखता है।',
              },
            )
            : t(
              {
                en: 'Loading data…',
                ja: 'データを読み込んでいます…',
                'es-419': 'Cargando datos…',
                de: 'Daten werden geladen…',
                th: 'กำลังโหลดข้อมูล…',
                hi: 'डेटा लोड हो रहा है…',
              },
            )}
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
