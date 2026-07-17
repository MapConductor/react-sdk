import { useMemo, useState, useEffect } from 'react';
import {
  GeoJSONLayer,
  GeoJSONLayerState,
  GeoJSONParser,
  colorArgb,
} from '@mapconductor/react-geojson-layer';
import type { GeoJSONFeatureData } from '@mapconductor/react-geojson-layer';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../i18n';

const INIT_CAMERA = { lat: 25.255377, lng: 55.3089185, zoom: 13 };

const BASIC_GEOJSON = `{
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
}`;

export function BasicGeoJSONPage() {
  const { t } = useSampleI18n();
  const mapViewState = useSampleMapViewState(INIT_CAMERA);

  const layerState = useMemo(
    () =>
      new GeoJSONLayerState({
        fillColor: colorArgb(127, 0x3b, 0xb2, 0xd0),
        strokeColor: colorArgb(255, 0x1d, 0x70, 0x82),
        strokeWidth: 2,
      }),
    [],
  );

  const [features, setFeatures] = useState<GeoJSONFeatureData[]>([]);

  useEffect(() => {
    setFeatures(GeoJSONParser.parseFeatures(BASIC_GEOJSON));
  }, []);

  return (
    <MapViewContainer state={mapViewState}>
      <GeoJSONLayer state={layerState} features={features} />
      <ControlPanel title={t('GeoJSON Basic', 'GeoJSON 基本')}>
        <p className="control-panel-note">
          {t('A GeoJSON polygon with a hole is displayed.', 'GeoJSONポリゴン（穴付き）を表示しています。')}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
