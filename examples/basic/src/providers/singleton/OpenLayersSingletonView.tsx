import { CircleTilingOptions, PolylineTilingOptions } from '@mapconductor/js-sdk-core';
import { Fragment } from 'react';
import { OpenLayersMapView, type OpenLayersMapViewStateInterface } from '@mapconductor/react-for-openlayers';
import '@mapconductor/react-for-openlayers/style.css';
import type { SingletonMapContent } from './types';

export default function OpenLayersSingletonView({ state, content }: {
  state: OpenLayersMapViewStateInterface;
  content: SingletonMapContent | null;
}) {
  return (
    <OpenLayersMapView
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
    </OpenLayersMapView>
  );
}
