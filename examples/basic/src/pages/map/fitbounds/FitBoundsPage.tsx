import { useCallback, useMemo, useRef, useState } from 'react';
import {
  createGeoPoint,
  createGeoRectBounds,
  createMarkerState,
  createPolygonState,
  type GeoPointInterface,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type MarkerState,
  type PolygonState,
} from '@mapconductor/js-sdk-core';
import { Marker, Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

// android / ios の FitBounds サンプルと同一仕様:
// マーカーをドラッグすると開始点→現在点の矩形が赤いポリゴンで表示され、
// ドロップすると その範囲へ fitBounds し、1.5 秒後に矩形が消える。
const INITIAL_POSITION = { latitude: 35.68, longitude: 139.76 };
const INIT_CAMERA = { lat: INITIAL_POSITION.latitude, lng: INITIAL_POSITION.longitude, zoom: 10 };

function buildRectPolygon(a: GeoPointInterface, b: GeoPointInterface): PolygonState {
  const minLat = Math.min(a.latitude, b.latitude);
  const maxLat = Math.max(a.latitude, b.latitude);
  const minLng = Math.min(a.longitude, b.longitude);
  const maxLng = Math.max(a.longitude, b.longitude);
  return createPolygonState({
    id: 'fitbounds_polygon',
    points: [
      createGeoPoint({ latitude: minLat, longitude: minLng }),
      createGeoPoint({ latitude: minLat, longitude: maxLng }),
      createGeoPoint({ latitude: maxLat, longitude: maxLng }),
      createGeoPoint({ latitude: maxLat, longitude: minLng }),
    ],
    strokeColor: '#ff0000',
    strokeWidth: 2,
    fillColor: 'rgba(255, 0, 0, 0.3)',
  });
}

function FitBoundsContent({ mapViewState }: { mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>> }) {
  const { t } = useSampleI18n();
  const [boundsPolygon, setBoundsPolygon] = useState<PolygonState | null>(null);
  const dragStartRef = useRef<GeoPointInterface | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onDragStart = useCallback((state: MarkerState) => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    dragStartRef.current = createGeoPoint({
      latitude: state.position.latitude,
      longitude: state.position.longitude,
    });
  }, []);

  const onDrag = useCallback((state: MarkerState) => {
    const start = dragStartRef.current;
    if (!start) return;
    setBoundsPolygon(buildRectPolygon(start, state.position));
  }, []);

  const onDragEnd = useCallback((state: MarkerState) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start) return;
    const bounds = createGeoRectBounds({});
    bounds.extend(start);
    bounds.extend(createGeoPoint({
      latitude: state.position.latitude,
      longitude: state.position.longitude,
    }));
    mapViewState.fitBounds(bounds);
    clearTimerRef.current = setTimeout(() => {
      setBoundsPolygon(null);
      clearTimerRef.current = null;
    }, 1500);
  }, [mapViewState]);

  const marker = useMemo(
    () => createMarkerState({
      id: 'fitbounds_marker',
      position: createGeoPoint(INITIAL_POSITION),
      draggable: true,
      onDragStart,
      onDrag,
      onDragEnd,
    }),
    [onDragStart, onDrag, onDragEnd],
  );

  return (
    <>
      <Marker state={marker} />
      {boundsPolygon && <Polygon state={boundsPolygon} />}
      <ControlPanel title={t(
        {
          en: 'Fit Bounds',
          ja: '範囲にフィット',
          'es-419': 'Ajustar a límites',
          de: 'An Bereich anpassen',
          th: 'ปรับให้พอดีขอบเขต',
          hi: 'सीमा में फ़िट करें',
        },
      )}>
        <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          {t(
            {
              en: 'Drag the marker to define a rectangle, then drop it — the map fits to that bounds.',
              ja: 'マーカーをドラッグして範囲を指定し、ドロップすると fitBounds で地図が移動します。',
              'es-419': 'Arrastra el marcador para definir un rectángulo y suéltalo: el mapa se ajusta a esos límites.',
              de: 'Ziehen Sie den Marker, um ein Rechteck aufzuspannen, und lassen Sie los — die Karte passt sich diesem Bereich an.',
              th: 'ลากมาร์กเกอร์เพื่อกำหนดสี่เหลี่ยม แล้วปล่อย แผนที่จะปรับให้พอดีกับขอบเขตนั้น',
              hi: 'मार्कर खींचकर आयत तय करें और छोड़ दें — मैप उसी सीमा में फ़िट हो जाएगा।',
            },
          )}
        </p>
      </ControlPanel>
    </>
  );
}

export function FitBoundsPage() {
  const [mapViewState, setMapViewState] = useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
  return (
    <MapViewContainer initialCamera={INIT_CAMERA} onStateReady={setMapViewState}>
      {mapViewState && <FitBoundsContent mapViewState={mapViewState} />}
    </MapViewContainer>
  );
}
