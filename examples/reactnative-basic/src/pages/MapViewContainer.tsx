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
import {
  HereMapView,
  HereViewState,
} from '@mapconductor/reactnative-for-here';

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

  if (state instanceof HereViewState) {
    // accessKeyId/accessKeySecret aren't passed here: on Android, HereMapViewControllerStore
    // reads HERE_ACCESS_KEY_ID/HERE_ACCESS_KEY_SECRET from AndroidManifest.xml meta-data instead
    // (see reactnative-for-here/android/build.gradle's manifestPlaceholders injection). iOS has
    // no manifest equivalent and would need these two props supplied here.
    return (
      <HereMapView state={state} {...props}>
        {children}
      </HereMapView>
    );
  }

  throw new Error('No container is available for specified provider');
}
