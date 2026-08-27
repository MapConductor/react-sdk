import { useMemo, useState } from 'react';
import {
  ColorDefaultIcon,
  GeoPoint,
  MarkerAnimation,
  createMarkerState,
  createPolygonState,
  type GeoPoint as GeoPointType,
  type PolygonEvent,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Marker, Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

const INIT_CAMERA = { lat: 30.0, lng: 20.0, zoom: 2 };

interface ClickedPolygon {
  position: GeoPointType;
  label: string;
  markerColor: string;
  sequence: number;
}

export function PolygonGeodesicPage() {
  const { t } = useSampleI18n();
  const [clickedPolygon, setClickedPolygon] = useState<ClickedPolygon | null>(null);
  const points = useMemo(() => [
    GeoPoint.fromLongLat(23.66, 56.42, 5000),
    GeoPoint.fromLongLat(13.39, 2.95, 5000),
    GeoPoint.fromLongLat(-87.82, 38.58, 5000),
    GeoPoint.fromLongLat(23.66, 56.42, 5000),
  ], []);
  const handlePolygonClick = (label: string) => (event: PolygonEvent) => {
    setClickedPolygon((current) => ({
      position: event.clicked,
      label,
      markerColor: event.state.strokeColor,
      sequence: (current?.sequence ?? 0) + 1,
    }));
  };
  const polygons = useMemo(() => [
    createPolygonState({
      id: 'linear-triangle',
      points,
      fillColor: 'rgba(37, 99, 235, 0.5)',
      strokeColor: '#2563eb',
      strokeWidth: 2,
      geodesic: false,
      onClick: handlePolygonClick('Linear Triangle'),
    }),
    createPolygonState({
      id: 'geodesic-triangle',
      points,
      fillColor: 'rgba(245, 158, 11, 0.5)',
      strokeColor: '#f59e0b',
      strokeWidth: 2,
      geodesic: true,
      zIndex: 3,
      onClick: handlePolygonClick('Geodesic Triangle'),
    }),
  ], [points]);
  const marker = useMemo(
    () => clickedPolygon
      ? createMarkerState({
          id: `polygon-geodesic-click-${clickedPolygon.sequence}`,
          position: clickedPolygon.position,
          icon: new ColorDefaultIcon({ fillColor: clickedPolygon.markerColor, label: 'P',
            labelTextColor: '#ffffff',
          }),
          animation: MarkerAnimation.Drop,
        })
      : null,
    [clickedPolygon],
  );

  return (
    <MapViewContainer initialCamera={INIT_CAMERA}>
      {polygons.map(polygon => <Polygon key={polygon.id} state={polygon} />)}
      {marker && (
        <>
          <Marker state={marker} />
          <InfoBubble marker={marker}>
            <div className="bubble-content">{clickedPolygon?.label}</div>
          </InfoBubble>
        </>
      )}
      <ControlPanel title={t(
        {
          en: 'Polygon Geodesic',
          ja: '測地線ポリゴン',
          'es-419': 'Polígono geodésico',
          de: 'Geodätisches Polygon',
          th: 'โพลีกอนแบบเส้นจีโอเดสิก',
          hi: 'जियोडेसिक पॉलीगॉन',
        },
      )}>
        <p className="control-panel-note">
          {t(
            {
              en: 'Blue uses straight screen-space edges. Orange uses geodesic interpolation.',
              ja: '青は画面上の直線、オレンジは測地線補間を使用します。',
              'es-419': 'El azul usa bordes rectos en el espacio de pantalla; el naranja usa interpolación geodésica.',
              de: 'Blau nutzt gerade Kanten im Bildschirmraum, Orange geodätische Interpolation.',
              th: 'สีน้ำเงินใช้ขอบตรงบนพิกัดหน้าจอ ส่วนสีส้มใช้การประมาณค่าตามเส้นจีโอเดสิก',
              hi: 'नीला स्क्रीन पर सीधी भुजाएँ लेता है; नारंगी जियोडेसिक इंटरपोलेशन।',
            },
          )}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
