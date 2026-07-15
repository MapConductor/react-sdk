import React, { useState } from 'react';
import Slider from '@react-native-community/slider';
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

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 21.382314, longitude: -157.933097, altitude: 0 }),
  zoom: 12,
  bearing: 0,
  tilt: 0,
});
const OSM_SOURCE = RasterLayerSource.UrlTemplate({
  template: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileSize: 256,
});

export function RasterLayerPage({ provider }: { provider: MapProvider }) {
  const [opacity, setOpacity] = useState(1);
  const [rasterLayerState] = useState(
    () =>
      createRasterLayerState({
        id: 'rasterLayer',
        source: OSM_SOURCE,
        opacity: 1,
      })
  );
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

  const handleOpacityChange = (value: number) => {
    rasterLayerState.opacity = value;
    setOpacity(value);
  };

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={state} style={styles.map}>
        <RasterLayer state={rasterLayerState} />
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <View style={styles.titleRow}>
          <Text style={styles.controlPanelTitle}>Raster Layer Example</Text>
          <Text style={styles.opacityValue}>{opacity.toFixed(1)}</Text>
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
          onValueChange={handleOpacityChange}
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
    bottom: 20,
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
  slider: {
    width: '100%',
    height: 36,
  },
});
