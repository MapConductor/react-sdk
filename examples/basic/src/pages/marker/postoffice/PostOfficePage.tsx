import { useCallback, useState } from 'react';
import {
  MarkerTilingOptions,
  createGeoPoint,
  createMapCameraPosition,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { useSampleI18n } from '../../../samples/i18n';
import { PostOfficeInfoBubble } from './PostOfficeInfoBubble';
import {
  PostOfficeMapProvider,
  type PostOfficeMapContentProps,
  type PostOfficeMapState,
} from './PostOfficeMapProvider';
import { browserPostOfficeDataSource, type PostOfficeDataSource } from './postOfficeData';
import { usePostOfficeMarkers } from './usePostOfficeMarkers';

const INITIAL_CAMERA = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.68049, longitude: 139.76669 }),
  zoom: 10,
});

const MARKER_TILING_OPTIONS: MarkerTilingOptions = {
  ...MarkerTilingOptions.Default,
  iconScaleCallback: (_state, zoom) => zoom > 10 ? 0.8 : zoom > 5 ? 0.5 : 0.2,
};

function PostOfficeContent({
  mapViewState,
  renderMapView,
  dataSource,
}: {
  mapViewState: PostOfficeMapState;
  renderMapView: PostOfficeMapContentProps['renderMapView'];
  dataSource: PostOfficeDataSource;
}) {
  const { t } = useSampleI18n();
  const [selected, setSelected] = useState<MarkerState | null>(null);
  const selectMarker = useCallback((marker: MarkerState) => setSelected(marker), []);
  const { error, markerStates, records } = usePostOfficeMarkers(dataSource, false, selectMarker);

  if (error) return <div style={{ padding: '2rem', textAlign: 'center' }}><p>データの読み込みに失敗しました: {error}</p></div>;

  return renderMapView(
    <>
      <Markers states={markerStates} />
      {selected && <PostOfficeInfoBubble marker={selected} mapViewState={mapViewState} />}
      <ControlPanel title={t(
        {
          en: 'Post Offices (24,526 markers)',
          ja: '郵便局（24,526件）',
          'es-419': 'Oficinas postales (24,526 marcadores)',
          de: 'Postfilialen (24.526 Marker)',
          th: 'ที่ทำการไปรษณีย์ (24,526 มาร์กเกอร์)',
          hi: 'डाकघर (24,526 मार्कर)',
        },
      )}>
        <p className="control-panel-note">
          {records
            ? t(
              {
                en: 'Click a marker to display postal-office information.',
                ja: 'マーカーをクリックすると郵便局情報が表示されます。',
                'es-419': 'Haz clic en un marcador para ver la información de la oficina postal.',
                de: 'Klicken Sie auf einen Marker, um die Angaben zur Postfiliale zu sehen.',
                th: 'คลิกมาร์กเกอร์เพื่อดูข้อมูลที่ทำการไปรษณีย์',
                hi: 'किसी मार्कर पर क्लिक करने से डाकघर की जानकारी दिखती है।',
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

export function PostOfficePage({
  dataSource = browserPostOfficeDataSource,
}: {
  dataSource?: PostOfficeDataSource;
}) {
  return (
    <PostOfficeMapProvider cameraPosition={INITIAL_CAMERA} markerTilingOptions={MARKER_TILING_OPTIONS}>
      {props => <PostOfficeContent {...props} dataSource={dataSource} />}
    </PostOfficeMapProvider>
  );
}
