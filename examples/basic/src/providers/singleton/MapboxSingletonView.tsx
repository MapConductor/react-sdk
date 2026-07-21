import { Fragment } from 'react';
import { MapBoxMapView2D, type MapboxViewState } from '@mapconductor/react-for-mapbox';
import '@mapconductor/react-for-mapbox/style.css';
import type { SingletonMapContent } from './types';

export default function MapboxSingletonView({ state, content }: {
  state: MapboxViewState;
  content: SingletonMapContent | null;
}) {
  const style = state.mapDesignType.getValue();

  if (!state.accessToken && style.includes('mapbox://')) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_MAPBOX_ACCESS_TOKEN to examples/basic/.env, or choose a non-Mapbox style.
      </div>
    );
  }

  return (
    <MapBoxMapView2D
      state={state}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </MapBoxMapView2D>
  );
}
