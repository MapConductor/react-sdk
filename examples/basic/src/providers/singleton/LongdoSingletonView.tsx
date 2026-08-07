import { Fragment } from 'react';
import { LongdoMapView2D, type LongdoViewStateInterface } from '@mapconductor/react-for-longdo';
import type { SingletonMapContent } from './types';

export default function LongdoSingletonView({ state, content }: {
  state: LongdoViewStateInterface;
  content: SingletonMapContent | null;
}) {
  if (!state.apiKey) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_LONGDO to examples/basic/.env to load the Longdo map.
      </div>
    );
  }

  return (
    <LongdoMapView2D
      state={state}
      cameraRestriction={content?.cameraRestriction}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </LongdoMapView2D>
  );
}
