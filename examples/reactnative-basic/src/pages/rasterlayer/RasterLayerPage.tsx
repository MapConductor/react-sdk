import React, { useState } from 'react';
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import {
  GeoPoint,
  MapCameraPosition,
  RasterLayerSource,
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
  position: GeoPoint.from({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
  zoom: 5,
  bearing: 0,
  tilt: 0,
});
const OSM_SOURCE = RasterLayerSource.UrlTemplate({
  template: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileSize: 256,
  attribution: '© OpenStreetMap contributors',
});

export function RasterLayerPage({ provider }: { provider: MapProvider }) {
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

  const rasterLayer = (
    <RasterLayer
      id="osm-raster"
      source={OSM_SOURCE}
      opacity={opacity}
    />
  );
  const state = provider === 'google-maps' ? googleState : mapLibreState;

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={state} style={styles.map}>
        {rasterLayer}
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <View style={styles.titleRow}>
          <Text style={styles.controlPanelTitle}>Raster Layer</Text>
          <Text style={styles.opacityValue}>{opacity.toFixed(2)}</Text>
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
        <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
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
  attribution: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'right',
  },
});
