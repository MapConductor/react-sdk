import { useMemo } from 'react';
import {
  createMapCameraPosition,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import { Markers } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { cityMarker } from '../../common/sampleHelpers';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 35.0, lng: 0.0, zoom: 3 };

function FlyToContent({ mapViewState }: { mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>> }) {
  const markers = useMemo(() => [
    cityMarker('tokyo', 'Tokyo', 35.6812, 139.7671),
    cityMarker('sapporo', 'Sapporo', 43.0642, 141.3469),
    cityMarker('honolulu', 'Honolulu', 21.3069, -157.8583),
    cityMarker('new-york', 'NY', 40.7128, -74.006),
  ], []);

  return (
    <>
      <Markers states={markers} />
      <ControlPanel title="Fly To">
        <div className="button-grid">
          {markers.map(marker => (
            <button
              key={marker.id}
              onClick={() => mapViewState.moveCameraTo(
                createMapCameraPosition({ position: marker.position, zoom: 13 }),
                1600,
              )}
            >
              {marker.extra as string}
            </button>
          ))}
        </div>
      </ControlPanel>
    </>
  );
}

export function FlyToPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  return (
    <MapViewContainer state={mapViewState}>
      <FlyToContent mapViewState={mapViewState} />
    </MapViewContainer>
  );
}
