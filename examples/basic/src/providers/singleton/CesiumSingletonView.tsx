import { CircleTilingOptions, PolylineTilingOptions } from '@mapconductor/js-sdk-core';
import { Fragment } from 'react';
import { CesiumMapView, type CesiumMapViewStateInterface } from '@mapconductor/react-for-cesium';
import '@mapconductor/react-for-cesium/style.css';
import type { SingletonMapContent } from './types';

export default function CesiumSingletonView({ state, content }: {
  state: CesiumMapViewStateInterface;
  content: SingletonMapContent | null;
}) {
  return (
    <CesiumMapView
      state={state}
      cameraRestriction={content?.cameraRestriction}
      mapStyle={content?.mapStyle}
      onStyleDiagnostics={content?.onStyleDiagnostics}
      polylineTilingOptions={content?.polylineTilingOptions ?? PolylineTilingOptions.Default}
      circleTilingOptions={content?.circleTilingOptions ?? CircleTilingOptions.Default}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </CesiumMapView>
  );
}
