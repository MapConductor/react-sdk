import { useCallback, useState } from 'react';
import {
  createGeoPoint,
  createGeoRectBounds,
  createMapCameraPosition,
  createPolygonState,
  type CameraRestriction,
  type MapCameraPosition,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import { Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

// ios の CameraRestrictionPage / android の CameraRestrictionMapPage と同一仕様:
// 許可矩形（東京駅周辺）を赤いポリゴンで可視化し、ボタンで「許可されない場所」への
// 移動を要求する。ネイティブに制限 API を持つプロバイダは移動自体を拒否し、
// クランプ方式のプロバイダは動いた後で引き戻される。どちらでも最終的に
// 読み出しが制限内に収まっていれば正しい。
const SOUTH = 35.63;
const WEST = 139.70;
const NORTH = 35.75;
const EAST = 139.85;
const MIN_ZOOM = 12;
const MAX_ZOOM = 16;

const START = { latitude: 35.681236, longitude: 139.767125 };
const INIT_CAMERA = { lat: START.latitude, lng: START.longitude, zoom: 14 };

const RESTRICTION: CameraRestriction = {
  bounds: createGeoRectBounds({
    southWest: createGeoPoint({ latitude: SOUTH, longitude: WEST }),
    northEast: createGeoPoint({ latitude: NORTH, longitude: EAST }),
  }),
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
};

const BOUNDS_POLYGON = createPolygonState({
  id: 'camera-restriction-bounds',
  points: [
    createGeoPoint({ latitude: SOUTH, longitude: WEST }),
    createGeoPoint({ latitude: SOUTH, longitude: EAST }),
    createGeoPoint({ latitude: NORTH, longitude: EAST }),
    createGeoPoint({ latitude: NORTH, longitude: WEST }),
  ],
  strokeColor: '#ff0000',
  strokeWidth: 3,
  fillColor: 'rgba(255, 0, 0, 0.1)',
  geodesic: false,
});

const LIMITS_TEXT =
  `limits lat ${SOUTH.toFixed(2)}..${NORTH.toFixed(2)} lng ${WEST.toFixed(2)}..${EAST.toFixed(2)} zoom ${MIN_ZOOM}..${MAX_ZOOM}`;

export function CameraRestrictionPage() {
  const [mapViewState, setMapViewState] = useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [cameraText, setCameraText] = useState('?');
  const { t } = useSampleI18n();

  const onCamera = useCallback((camera: MapCameraPosition) => {
    setCameraText(`${camera.position.latitude.toFixed(5)},${camera.position.longitude.toFixed(5)},${camera.zoom.toFixed(2)}`);
  }, []);

  const moveCamera = useCallback((latitude: number, longitude: number, zoom: number) => {
    mapViewState?.moveCameraTo(createMapCameraPosition({
      position: createGeoPoint({ latitude, longitude }),
      zoom,
    }));
  }, [mapViewState]);

  return (
    <MapViewContainer
      initialCamera={INIT_CAMERA}
      cameraRestriction={enabled ? RESTRICTION : null}
      onCameraMove={onCamera}
      onCameraMoveEnd={onCamera}
      onStateReady={setMapViewState}
    >
      <Polygon state={BOUNDS_POLYGON} />
      <ControlPanel title={t('Camera Restriction', 'カメラ制限')}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8 }}>
          <input
            type="checkbox"
            data-testid="restrictionToggle"
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
          />
          {t('restriction', '制限')}
        </label>
        <div className="button-grid" style={{ marginBottom: 8 }}>
          <button data-testid="moveOutside" onClick={() => {
            // 矩形の北東よりさらに外側へ。
            moveCamera(36.20, 140.40, mapViewState?.cameraPosition.zoom ?? 14);
          }}>
            {t('Move outside', '範囲外へ移動')}
          </button>
          <button data-testid="zoomOverMax" onClick={() => moveCamera(START.latitude, START.longitude, 20)}>
            {'Zoom > max'}
          </button>
          <button data-testid="zoomUnderMin" onClick={() => moveCamera(START.latitude, START.longitude, 8)}>
            {'Zoom < min'}
          </button>
          <button data-testid="resetCamera" onClick={() => moveCamera(START.latitude, START.longitude, 14)}>
            {t('Reset', 'リセット')}
          </button>
        </div>
        <div data-testid="cameraReadout" style={{ fontSize: 12, fontFamily: 'monospace' }}>{cameraText}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{LIMITS_TEXT}</div>
      </ControlPanel>
    </MapViewContainer>
  );
}
