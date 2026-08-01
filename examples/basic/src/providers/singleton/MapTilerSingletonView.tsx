import { Fragment } from 'react';
import { MapTilerMapView2D, type MapTilerViewState } from '@mapconductor/react-for-maptiler';
import '@mapconductor/react-for-maptiler/style.css';
import type { SingletonMapContent } from './types';

export default function MapTilerSingletonView({ state, content }: {
  state: MapTilerViewState;
  content: SingletonMapContent | null;
}) {
  if (!state.apiKey) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_MAPTILER to examples/basic/.env to load the MapTiler map.
      </div>
    );
  }

  return (
    <MapTilerMapView2D
      state={state}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </MapTilerMapView2D>
  );
}
