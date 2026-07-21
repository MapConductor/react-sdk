import { Fragment } from 'react';
import { LeafletMapView, type LeafletMapViewState } from '@mapconductor/react-for-leaflet';
import '@mapconductor/react-for-leaflet/style.css';
import type { SingletonMapContent } from './types';

export default function LeafletSingletonView({ state, content }: {
  state: LeafletMapViewState;
  content: SingletonMapContent | null;
}) {
  return (
    <LeafletMapView
      state={state}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </LeafletMapView>
  );
}
