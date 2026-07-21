import { Fragment } from 'react';
import { MapLibreMapView, MapLibreMapView2D, type MapLibreViewState } from '@mapconductor/react-for-maplibre';
import '@mapconductor/react-for-maplibre/style.css';
import type { SingletonMapContent } from './types';

export default function MapLibreSingletonView({ state, content, useGlobe }: {
  state: MapLibreViewState;
  content: SingletonMapContent | null;
  useGlobe: boolean;
}) {
  const MapView = useGlobe ? MapLibreMapView : MapLibreMapView2D;
  return (
    <MapView
      state={state}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </MapView>
  );
}
