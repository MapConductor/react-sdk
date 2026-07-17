import { GeoPoint, MapCameraPosition } from '@mapconductor/js-sdk-core';
import { GoogleMapDesign, useGoogleMapViewState } from '@mapconductor/react-for-googlemaps';
import { MapLibreDesign, useMapLibreViewState } from '@mapconductor/react-for-maplibre';
import type { MapProvider } from '../../screens/MapScreen';

export const BASIC_GEOJSON = `
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [55.30122473231012, 25.26476622289597],
            [55.29743486255916, 25.25827212207261],
            [55.28978863411328, 25.251356725509737],
            [55.300027931336984, 25.246425506635504],
            [55.307474692951274, 25.244200378933655],
            [55.31212891895635, 25.256408010450187],
            [55.30774064871093, 25.26266169122738],
            [55.301357710197806, 25.264946609615492],
            [55.30122473231012, 25.26476622289597]
          ],
          [
            [55.30084858315658, 25.256531695820797],
            [55.298280197635705, 25.252243254705405],
            [55.30163885563897, 25.250501032248863],
            [55.304059065092645, 25.254700192612702],
            [55.30084858315658, 25.256531695820797]
          ],
          [
            [55.30173763969924, 25.262517391695198],
            [55.301095543307355, 25.26122200491396],
            [55.30396028103232, 25.259479911263526],
            [55.30489872958182, 25.261132667394975],
            [55.30173763969924, 25.262517391695198]
          ]
        ]
      },
      "properties": {}
    }
  ]
}
`.trim();

export const BASIC_INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 25.255377, longitude: 55.3089185, altitude: 0 }),
  zoom: 13,
  bearing: 0,
  tilt: 0,
});

export const LAYER_INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 35.68, longitude: 139.77, altitude: 0 }),
  zoom: 13,
  bearing: 0,
  tilt: 0,
});

export function useGeoJSONMapStates(idPrefix: string, initCamera: MapCameraPosition) {
  const mapLibreState = useMapLibreViewState({
    id: `${idPrefix}-maplibre`,
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: initCamera,
  });
  const googleState = useGoogleMapViewState({
    id: `${idPrefix}-google`,
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: initCamera,
  });

  return { mapLibreState, googleState };
}

export function resolveGeoJSONMapState(
  provider: MapProvider,
  states: ReturnType<typeof useGeoJSONMapStates>,
) {
  return provider === 'google-maps' ? states.googleState : states.mapLibreState;
}
