import type {
  MapDesignTypeInterface,
  MapViewStateInterface,
  MarkerTilingOptions,
} from '@mapconductor/js-sdk-core';
import type { MapViewBaseProps } from '@mapconductor/js-sdk-react/native';
import {
  GoogleMapView,
  GoogleMapViewState,
} from '@mapconductor/reactnative-for-googlemaps';
import {
  MapLibreMapView,
  MapLibreViewState,
} from '@mapconductor/reactnative-for-maplibre';

type CommonMapViewState = MapViewStateInterface<MapDesignTypeInterface<unknown>>;
type MapViewContainerProps = MapViewBaseProps<CommonMapViewState> & {
  markerTilingOptions?: MarkerTilingOptions;
};

export function MapViewContainer({
  state,
  children,
  ...props
}: MapViewContainerProps) {
  if (state instanceof GoogleMapViewState) {
    return (
      <GoogleMapView state={state} {...props}>
        {children}
      </GoogleMapView>
    );
  }

  if (state instanceof MapLibreViewState) {
    return (
      <MapLibreMapView state={state} {...props}>
        {children}
      </MapLibreMapView>
    );
  }

  throw new Error('No container is available for specified provider');
}
