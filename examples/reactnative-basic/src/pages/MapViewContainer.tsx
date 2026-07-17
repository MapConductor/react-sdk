import type {
  MapDesignTypeInterface,
  MapViewStateInterface,
  MarkerTilingOptions,
} from '@mapconductor/js-sdk-core';
import type { MapViewBaseProps } from '@mapconductor/js-sdk-react/native';
import {
  GoogleMapView,
  GoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreView,
  MapLibreViewState,
} from '@mapconductor/react-for-maplibre';

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
      <MapLibreView state={state} {...props}>
        {children}
      </MapLibreView>
    );
  }

  throw new Error('No container is available for specified provider');
}
