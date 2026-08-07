import { Fragment } from 'react';
import { MapKitMapView, type MapKitViewState } from '@mapconductor/react-for-mapkit';
import type { SingletonMapContent } from './types';

export default function MapKitSingletonView({ state, content }: {
  state: MapKitViewState;
  content: SingletonMapContent | null;
}) {
  return (
    <MapKitMapView
      state={state}
      cameraRestriction={content?.cameraRestriction}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </MapKitMapView>
  );
}
