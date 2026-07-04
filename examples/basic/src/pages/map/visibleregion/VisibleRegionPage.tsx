import { useState } from 'react';
import { ControlPanel } from '../../../components/ControlPanel';
import { useCameraActions } from '../../common/sampleHelpers';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 21.3069, lng: -157.8583, zoom: 10 };

function VisibleRegionContent() {
  const { getBounds } = useCameraActions();
  const [summary, setSummary] = useState('Move the map, then read the visible region.');

  return (
    <ControlPanel title="Visible Region">
      <button onClick={() => {
        const bounds = getBounds();
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
      <VisibleRegionContent />
    </MapViewContainer>
  );
}
