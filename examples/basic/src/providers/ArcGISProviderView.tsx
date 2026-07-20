import { useEffect } from 'react';
import {
  ArcGISDesign,
  ArcGISMapView,
  ArcGISMapView2D,
  useArcGISViewState,
} from '@mapconductor/react-for-arcgis';
import { useInitialCameraPosition } from './useInitialCameraPosition';
import type { ProviderViewProps } from './types';

interface ArcGISProviderViewProps extends ProviderViewProps {
  useSceneView: boolean;
}

export default function ArcGISProviderView({
  children,
  initialCamera,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  useSceneView,
  onStateReady,
}: ArcGISProviderViewProps) {
  const cameraPosition = useInitialCameraPosition(initialCamera);
  const state = useArcGISViewState({
    apiKey: import.meta.env.VITE_ARCGIS_API_KEY ?? '',
    mapDesignType: ArcGISDesign.Streets,
    cameraPosition,
  });
  const View = useSceneView ? ArcGISMapView : ArcGISMapView2D;

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <View
      state={state}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </View>
  );
}
