import React, { useMemo, useState } from 'react';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, View } from 'react-native';

import {
  GeoPoint,
  MapCameraPosition,
  RasterLayerSource,
  createRasterLayerState,
} from '@mapconductor/js-sdk-core';
import { RasterLayer } from '@mapconductor/js-sdk-react/native';
import {
  GoogleMapDesign,
  useGoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';

import type { MapProvider } from '../../screens/MapScreen';
import { MapViewContainer } from '../MapViewContainer';
import {
  GSI_RELIEF_ATTRIBUTION_RULES,
  GSI_STANDARD_ATTRIBUTION_RULES,
} from '../../gsiAttributions';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
  zoom: 5,
  bearing: 0,
  tilt: 0,
});
const TILE_SIZE = 256;

type GsiLayer = 'relief' | 'standard';

export function RasterLayerPage({ provider }: { provider: MapProvider }) {
  const [selectedLayer, setSelectedLayer] = useState<GsiLayer>('relief');
  const [opacity, setOpacity] = useState(0.75);
  const mapLibreState = useMapLibreViewState({
    id: 'raster-layer-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'raster-layer-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  const state = provider === 'google-maps' ? googleState : mapLibreState;
  const rasterLayerState = useMemo(() => createRasterLayerState({
    id: 'gsi-raster',
    source: selectedLayer === 'relief'
      ? RasterLayerSource.UrlTemplate({
          template: 'https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
          tileSize: TILE_SIZE,
          minZoom: 5,
          maxZoom: 15,
          attributionRules: [...GSI_RELIEF_ATTRIBUTION_RULES],
        })
      : RasterLayerSource.UrlTemplate({
          template: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
          tileSize: TILE_SIZE,
          minZoom: 5,
          maxZoom: 18,
          attributionRules: [...GSI_STANDARD_ATTRIBUTION_RULES],
        }),
    opacity,
  }), [opacity, selectedLayer]);

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={state} style={styles.map}>
        <RasterLayer state={rasterLayerState} />
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <View style={styles.titleRow}>
          <Text style={styles.controlPanelTitle}>Raster Layer</Text>
          <Text style={styles.opacityValue}>{opacity.toFixed(1)}</Text>
        </View>
        <Text style={styles.label}>GSI layer / 国土地理院レイヤー</Text>
        <View style={styles.pickerContainer}>
          <Picker<GsiLayer>
            selectedValue={selectedLayer}
            onValueChange={setSelectedLayer}
            style={styles.picker}
            dropdownIconColor="#111827"
            mode="dropdown"
          >
            <Picker.Item label="Relief map / 色別標高図" value="relief" />
            <Picker.Item label="Standard map / 標準地図" value="standard" />
          </Picker>
        </View>
        <Text style={styles.label}>Opacity</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={opacity}
          minimumTrackTintColor="#2563eb"
          maximumTrackTintColor="#cbd5e1"
          thumbTintColor="#2563eb"
          onValueChange={setOpacity}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  controlPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 20,
    maxWidth: 380,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlPanelTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  opacityValue: {
    color: '#475569',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 10,
    color: '#475569',
    fontSize: 13,
  },
  pickerContainer: {
    marginTop: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
    color: '#111827',
  },
  slider: {
    width: '100%',
    height: 36,
  },
});
