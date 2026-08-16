import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GeoJSONLayer, GeoJSONLayerState, GeoJSONParser } from '@mapconductor/react-geojson';
import type { MapProvider } from '../../../providers/types';
import { MapViewContainer } from '../../MapViewContainer';
import { BASIC_GEOJSON, BASIC_INIT_CAMERA, GEOJSON_DESIGN_TYPES } from '../geojsonShared';

export function BasicGeoJSONPage({ provider }: { provider: MapProvider }) {
  const layerState = useMemo(
    () =>
      new GeoJSONLayerState({
        fillColor: 0x7f3bb2d0,
        strokeColor: 0xff1d7082 | 0,
        strokeWidth: 2,
      }),
    [],
  );
  const features = useMemo(() => GeoJSONParser.parseFeatures(BASIC_GEOJSON), []);

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={BASIC_INIT_CAMERA}
        mapId="geojson-basic"
        style={styles.map}
        designTypes={GEOJSON_DESIGN_TYPES}
      >
        <GeoJSONLayer state={layerState} features={features} />
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <Text style={styles.title}>Basic GeoJSON</Text>
        <Text style={styles.note}>Compose sample と同じポリゴンを GeoJSON layer として描画しています。</Text>
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
  title: {
    marginBottom: 8,
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
});
