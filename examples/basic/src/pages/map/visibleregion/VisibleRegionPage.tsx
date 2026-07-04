import { useState } from 'react';
import type { GeoPoint, MapCameraPosition } from '@mapconductor/js-sdk-core';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 21.3069, lng: -157.8583, zoom: 10 };

function formatPoint(point: GeoPoint | null): string {
  return point?.toUrlValue(5) ?? 'Unavailable';
}

function VisibleRegionContent({ cameraPosition }: { cameraPosition: MapCameraPosition | null }) {
  const visibleRegion = cameraPosition?.visibleRegion ?? null;
  const bounds = visibleRegion?.bounds ?? null;

  return (
    <ControlPanel title="Visible Region">
      <p className="control-panel-note">
        Move the map to update the current camera and visible region.
      </p>
      <p className="control-panel-note">
        Center: {formatPoint(cameraPosition?.position ?? null)}
      </p>
      <p className="control-panel-note">
        Zoom: {cameraPosition?.zoom.toFixed(2) ?? 'Unavailable'}
      </p>
      <p className="control-panel-note">
        Bearing: {cameraPosition?.bearing.toFixed(1) ?? 'Unavailable'} deg
      </p>
      <p className="control-panel-note">
        Tilt: {cameraPosition?.tilt.toFixed(1) ?? 'Unavailable'} deg
      </p>
      <p className="control-panel-note">
        Bounds: {bounds?.toUrlValue(5) ?? 'Unavailable'}
      </p>
      <p className="control-panel-note">
        Near Left: {formatPoint(visibleRegion?.nearLeft ?? null)}
      </p>
      <p className="control-panel-note">
        Near Right: {formatPoint(visibleRegion?.nearRight ?? null)}
      </p>
      <p className="control-panel-note">
        Far Left: {formatPoint(visibleRegion?.farLeft ?? null)}
      </p>
      <p className="control-panel-note">
        Far Right: {formatPoint(visibleRegion?.farRight ?? null)}
      </p>
    </ControlPanel>
  );
}

export function VisibleRegionPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [cameraPosition, setCameraPosition] = useState<MapCameraPosition | null>(null);

  return (
    <MapViewContainer state={mapViewState} onCameraMove={setCameraPosition}>
      <VisibleRegionContent cameraPosition={cameraPosition} />
    </MapViewContainer>
  );
}
