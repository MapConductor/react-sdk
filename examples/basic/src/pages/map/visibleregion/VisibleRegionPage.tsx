import { useState } from 'react';
import type { GeoPoint, MapCameraPosition } from '@mapconductor/js-sdk-core';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../i18n';

const INIT_CAMERA = { lat: 21.3069, lng: -157.8583, zoom: 10 };

function formatPoint(point: GeoPoint | null, unavailable: string): string {
  return point?.toUrlValue(5) ?? unavailable;
}

function VisibleRegionContent({ cameraPosition }: { cameraPosition: MapCameraPosition | null }) {
  const { t } = useSampleI18n();
  const visibleRegion = cameraPosition?.visibleRegion ?? null;
  const bounds = visibleRegion?.bounds ?? null;
  const unavailable = t('Unavailable', '取得できません');

  return (
    <ControlPanel title={t('Visible Region', '表示領域')}>
      <p className="control-panel-note">
        {t('Move the map to update the current camera and visible region.', '地図を動かすと現在のカメラと表示領域が更新されます。')}
      </p>
      <p className="control-panel-note">
        {t('Center', '中心')}: {formatPoint(cameraPosition?.position ?? null, unavailable)}
      </p>
      <p className="control-panel-note">
        {t('Zoom', 'ズーム')}: {cameraPosition?.zoom.toFixed(2) ?? unavailable}
      </p>
      <p className="control-panel-note">
        {t('Bearing', '方位')}: {cameraPosition?.bearing.toFixed(1) ?? unavailable} {t('deg', '度')}
      </p>
      <p className="control-panel-note">
        {t('Tilt', '傾き')}: {cameraPosition?.tilt.toFixed(1) ?? unavailable} {t('deg', '度')}
      </p>
      <p className="control-panel-note">
        {t('Bounds', '境界')}: {bounds?.toUrlValue(5) ?? unavailable}
      </p>
      <p className="control-panel-note">
        {t('Near Left', '手前左')}: {formatPoint(visibleRegion?.nearLeft ?? null, unavailable)}
      </p>
      <p className="control-panel-note">
        {t('Near Right', '手前右')}: {formatPoint(visibleRegion?.nearRight ?? null, unavailable)}
      </p>
      <p className="control-panel-note">
        {t('Far Left', '奥左')}: {formatPoint(visibleRegion?.farLeft ?? null, unavailable)}
      </p>
      <p className="control-panel-note">
        {t('Far Right', '奥右')}: {formatPoint(visibleRegion?.farRight ?? null, unavailable)}
      </p>
    </ControlPanel>
  );
}

export function VisibleRegionPage() {
  const [cameraPosition, setCameraPosition] = useState<MapCameraPosition | null>(null);

  return (
    <MapViewContainer initialCamera={INIT_CAMERA} onCameraMove={setCameraPosition}>
      <VisibleRegionContent cameraPosition={cameraPosition} />
    </MapViewContainer>
  );
}
