import { useMemo, useState } from 'react';
import {
  createGeoPoint,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import { ControlPanel } from '../../components/ControlPanel';
import { ThreeMapObject } from '../../components/ThreeMapObject';
import { MapViewContainer } from '../../MapViewContainer';
import { useSampleI18n } from '../../i18n';

const TOKYO_STATION_CAMERA = {
  lat: 35.6812,
  lng: 139.7671,
  zoom: 16,
  tilt: 45,
};

export function ThreeJsObjectPage() {
  const { language } = useSampleI18n();
  const [mapViewState, setMapViewState] = useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
  const position = useMemo(() => createGeoPoint({
    latitude: TOKYO_STATION_CAMERA.lat,
    longitude: TOKYO_STATION_CAMERA.lng,
  }), []);

  return (
    <MapViewContainer initialCamera={TOKYO_STATION_CAMERA} onStateReady={setMapViewState}>
      {mapViewState && <ThreeMapObject mapViewState={mapViewState} position={position} />}
      <ControlPanel title="Three.js">
        <p>
          {language === 'ja'
            ? '回転する立体オブジェクトは東京駅の座標に固定されています。地図を移動・ズームして追従を確認してください。'
            : 'The rotating 3D object is anchored at Tokyo Station. Move and zoom the map to see it follow the coordinate.'}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
