import { Fragment } from 'react';
import { MapKitMapView, type MapKitViewStateInterface } from '@mapconductor/react-for-mapkit';
import type { SingletonMapContent } from './types';

export default function MapKitSingletonView({ state, content }: {
  state: MapKitViewStateInterface;
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
