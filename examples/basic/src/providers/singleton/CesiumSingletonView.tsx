import { Fragment } from 'react';
import { CesiumMapView, type CesiumMapViewState } from '@mapconductor/react-for-cesium';
import '@mapconductor/react-for-cesium/style.css';
import type { SingletonMapContent } from './types';

export default function CesiumSingletonView({ state, content }: {
  state: CesiumMapViewState;
  content: SingletonMapContent | null;
}) {
  return (
    <CesiumMapView
      state={state}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </CesiumMapView>
  );
}
