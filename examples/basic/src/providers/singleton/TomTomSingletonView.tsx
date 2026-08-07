import { Fragment } from 'react';
import { TomTomMapView2D, type TomTomViewStateInterface } from '@mapconductor/react-for-tomtom';
import type { SingletonMapContent } from './types';

export default function TomTomSingletonView({ state, content }: {
  state: TomTomViewStateInterface;
  content: SingletonMapContent | null;
}) {
  if (!state.apiKey) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_TOMTOM_API_KEY to examples/basic/.env to load the TomTom map.
      </div>
    );
  }

  return (
    <TomTomMapView2D
      state={state}
      cameraRestriction={content?.cameraRestriction}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </TomTomMapView2D>
  );
}
