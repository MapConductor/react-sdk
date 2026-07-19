import {
  type MapCameraPosition,
  type PolygonState,
  type PolylineState,
} from '@mapconductor/js-sdk-core';
import { Polygon, Polyline } from '@mapconductor/js-sdk-react';
import type { CameraSyncProviderAdapter } from './cameraSyncProviderRegistry';
import type { PaneProvider, PaneState } from './types';

function CameraInfoCard({
  label,
  position,
  altitude,
  mapSize,
}: {
  label: string;
  position: MapCameraPosition;
  altitude: number;
  mapSize: { width: number; height: number };
}) {
  return (
    <div className="camera-sync-info">
      <strong>{label}</strong>
      <span>Lat: {position.position.latitude.toFixed(5)}</span>
      <span>Zoom: {position.zoom}</span>
      <span>Alt: {altitude} m</span>
      <span>Map: {mapSize.width}px x {mapSize.height}px</span>
    </div>
  );
}

function mapDivSize(paneState: PaneState): { width: number; height: number } {
  const mapView = paneState.mapState.getMapViewHolder()?.mapView as HTMLElement | undefined;
  if (!mapView) return { width: 0, height: 0 };
  const rect = mapView.getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
}

export function CameraSyncMapPane({
  label,
  paneState,
  provider,
  providerOptions,
  selectedProvider,
  onProviderChange,
  cameraPosition,
  onCameraMove,
  onCameraMoveEnd,
  boundsPolylines,
  referenceRectangles,
  showOverlays,
}: {
  label: string;
  paneState: PaneState;
  provider: CameraSyncProviderAdapter;
  providerOptions: readonly CameraSyncProviderAdapter[];
  selectedProvider: PaneProvider;
  onProviderChange: (provider: PaneProvider) => void;
  cameraPosition: MapCameraPosition;
  onCameraMove: (position: MapCameraPosition) => void;
  onCameraMoveEnd: (position: MapCameraPosition) => void;
  boundsPolylines: PolylineState[];
  referenceRectangles: PolygonState[];
  showOverlays: boolean;
}) {
  const map = provider.render({
    paneState,
    onCameraMove,
    onCameraMoveEnd,
    children: <>
      {boundsPolylines.map(polyline => <Polyline key={polyline.id} state={polyline} />)}
      {referenceRectangles.map(polygon => <Polygon key={polygon.id} state={polygon} />)}
    </>,
  });

  return (
    <section className="camera-sync-pane">
      {map}

      {showOverlays && (
        <label className="camera-sync-provider">
          <span>{label}</span>
          <select value={selectedProvider} onChange={event => onProviderChange(event.target.value as PaneProvider)}>
            {providerOptions.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
      )}

      {showOverlays && (
        <CameraInfoCard
          label={label}
          position={cameraPosition}
          altitude={provider.altitude(paneState, cameraPosition)}
          mapSize={mapDivSize(paneState)}
        />
      )}
    </section>
  );
}
