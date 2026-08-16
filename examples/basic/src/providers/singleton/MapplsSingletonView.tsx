import { Fragment } from 'react';
import { MapplsMapView2D, type MapplsViewStateInterface } from '@mapconductor/react-for-mappls';
import type { SingletonMapContent } from './types';

export default function MapplsSingletonView({ state, content }: {
  state: MapplsViewStateInterface;
  content: SingletonMapContent | null;
}) {
  if (!state.apiKey) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_MAPPLS_API_KEY to examples/basic/.env to load the Mappls map.
      </div>
    );
  }

  return (
    <MapplsMapView2D
      state={state}
      cameraRestriction={content?.cameraRestriction}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </MapplsMapView2D>
  );
}
