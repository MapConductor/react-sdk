import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ColorDefaultIcon,
  MarkerAnimation,
  PolygonManager,
  createMarkerState,
  createPolygonEntity,
  createPolygonState,
  type GeoPoint,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Marker, Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { california } from './California';
import { useSampleI18n } from '../../../i18n';

const INIT_CAMERA = { lat: 37.2, lng: -119.6, zoom: 5 };

interface ClickedMarker {
  position: GeoPoint;
  message: string;
  sequence: number;
}

export function PolygonClickPage() {
  const { t } = useSampleI18n();
  const polygons = useMemo(
    () => california.map((points, index) =>
      createPolygonState({
        id: `california-${index}`,
        points,
        fillColor: 'rgba(37, 99, 235, 0.28)',
        strokeColor: '#2563eb',
        strokeWidth: 2,
        geodesic: true,
      }),
    ),
    [],
  );
  const polygonManager = useMemo(() => {
    const manager = new PolygonManager<null>();
    polygons.forEach((polygon) => {
      manager.registerEntity(createPolygonEntity({ polygon: null, state: polygon }));
    });
    return manager;
  }, [polygons]);
  const [clickedMarker, setClickedMarker] = useState<ClickedMarker | null>(null);
  const markerIcon = useMemo(
    () => new ColorDefaultIcon('#ef4444', { label: 'P', labelTextColor: '#ffffff' }),
    [],
  );
  const marker = useMemo(
    () => clickedMarker
      ? createMarkerState({
          id: `polygon-click-${clickedMarker.sequence}`,
          position: clickedMarker.position,
          icon: markerIcon,
          animation: MarkerAnimation.Drop,
          clickable: false,
        })
      : null,
    [clickedMarker, markerIcon],
  );
  const lastPolygonClickRef = useRef<{ point: GeoPoint; time: number } | null>(null);

  const showClickedMarker = useCallback((clicked: GeoPoint) => {
    const isInside = polygonManager.find(clicked) != null;
    setClickedMarker((current) => ({
      position: clicked,
      message: isInside ? `Inside\n${clicked.toUrlValue(5)}` : 'Outside',
      sequence: (current?.sequence ?? 0) + 1,
    }));
  }, [polygonManager]);
  const handleMapClick = useCallback((clicked: GeoPoint) => {
    const lastPolygonClick = lastPolygonClickRef.current;
    if (
      lastPolygonClick &&
      Date.now() - lastPolygonClick.time < 250 &&
      lastPolygonClick.point.equals(clicked)
    ) {
      return;
    }
    showClickedMarker(clicked);
  }, [showClickedMarker]);
  const handlePolygonClick = useCallback((clicked: GeoPoint) => {
    lastPolygonClickRef.current = { point: clicked, time: Date.now() };
    showClickedMarker(clicked);
  }, [showClickedMarker]);

  return (
    <MapViewContainer initialCamera={INIT_CAMERA} onMapClick={handleMapClick}>
      {polygons.map(polygon => (
        <Polygon
          key={polygon.id}
          state={polygon.copy({ onClick: event => handlePolygonClick(event.clicked) })}
        />
      ))}
      {marker && (
        <>
          <Marker state={marker} />
          <InfoBubble marker={marker}>
            <div className="bubble-content">{clickedMarker?.message}</div>
          </InfoBubble>
        </>
      )}
      <ControlPanel title={t('Polygon Click', 'ポリゴンのクリック')}>
        <p className="control-panel-note">
          {t('Tap inside or outside California.', 'カリフォルニア州の内側または外側をタップしてください。')}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
