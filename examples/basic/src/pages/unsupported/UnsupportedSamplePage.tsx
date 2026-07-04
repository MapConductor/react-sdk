import { ControlPanel } from '../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../MapViewContainer';

export function UnsupportedSamplePage({ title }: { title: string }) {
  const mapViewState = useSampleMapViewState();
  return (
    <MapViewContainer state={mapViewState}>
      <ControlPanel title={title}>
        <p className="control-panel-note">
          This Android sample depends on an extension package that is not present in this React SDK workspace yet.
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
