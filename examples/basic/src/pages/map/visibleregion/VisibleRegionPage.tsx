import { useState } from 'react';
import type { MapDesignTypeInterface, MapViewStateInterface } from '@mapconductor/js-sdk-core';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 21.3069, lng: -157.8583, zoom: 10 };

function VisibleRegionContent({ mapViewState }: { mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>> }) {
  const [summary, setSummary] = useState('Move the map, then read the visible region.');

  return (
    <ControlPanel title="Visible Region">
      <button onClick={() => {
        const bounds = mapViewState.cameraPosition.visibleRegion?.bounds ?? null;
        setSummary(bounds?.toUrlValue(5) ?? 'Visible region is not available yet.');
      }}>
        Read visible region
      </button>
      <p className="control-panel-note">{summary}</p>
    </ControlPanel>
  );
}

export function VisibleRegionPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  return (
    <MapViewContainer state={mapViewState}>
      <VisibleRegionContent mapViewState={mapViewState} />
    </MapViewContainer>
  );
}
