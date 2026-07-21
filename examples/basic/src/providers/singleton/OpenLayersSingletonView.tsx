import { Fragment } from 'react';
import { OpenLayersMapView, type OpenLayersMapViewState } from '@mapconductor/react-for-openlayers';
import '@mapconductor/react-for-openlayers/style.css';
import type { SingletonMapContent } from './types';

export default function OpenLayersSingletonView({ state, content }: {
  state: OpenLayersMapViewState;
  content: SingletonMapContent | null;
}) {
  return (
    <OpenLayersMapView
      state={state}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </OpenLayersMapView>
  );
}
