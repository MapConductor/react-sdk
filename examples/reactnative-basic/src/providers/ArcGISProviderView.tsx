import React, { useEffect } from 'react';
import {
  ArcGISDesign,
  ArcGISMapView,
  ArcGISMapView2D,
  useArcGISViewState,
  type ArcGISDesignType,
} from '@mapconductor/reactnative-for-arcgis';
import type { ProviderViewProps } from './types';

interface ArcGISProviderViewProps extends ProviderViewProps {
  mapDesignType?: ArcGISDesignType;
  /** true なら 3D（`ArcGISMapView`）。既定は 2D（`ArcGISMapView2D`）。 */
  useSceneView?: boolean;
}

const ARCGIS_API_KEY = process.env.EXPO_PUBLIC_ARCGIS_API_KEY;

export function ArcGISProviderView({
  children,
  style,
  mapId,
  cameraPosition,
  mapDesignType,
  useSceneView = false,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  onMapLoaded,
  markerTilingOptions,
  cameraRestriction,
  onStateReady,
}: ArcGISProviderViewProps) {
  const MapView = useSceneView ? ArcGISMapView : ArcGISMapView2D;
  const state = useArcGISViewState({
    id: mapId,
    apiKey: ARCGIS_API_KEY,
    mapDesignType: mapDesignType ?? ArcGISDesign.Streets,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <MapView
      state={state}
      style={style}
      markerTilingOptions={markerTilingOptions}
      cameraRestriction={cameraRestriction}
      onMapLoaded={onMapLoaded}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </MapView>
  );
}
