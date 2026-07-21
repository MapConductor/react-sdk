import { Fragment } from 'react';
import { ArcGISMapView, ArcGISMapView2D, type ArcGISViewState } from '@mapconductor/react-for-arcgis';
import type { SingletonMapContent } from './types';

export default function ArcGISSingletonView({ state, content, useSceneView }: {
  state: ArcGISViewState;
  content: SingletonMapContent | null;
  useSceneView: boolean;
}) {
  const View = useSceneView ? ArcGISMapView : ArcGISMapView2D;
  return (
    <View
      state={state}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </View>
  );
}
