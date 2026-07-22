import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GeoPoint, MapCameraPosition } from '@mapconductor/js-sdk-core';
import { GoogleMapDesign } from '@mapconductor/reactnative-for-googlemaps';
import { MapLibreDesign } from '@mapconductor/reactnative-for-maplibre';
import {
  HeatmapOverlay,
  HeatmapPointState,
} from '@mapconductor/react-heatmap';

import postOfficesJson from '../../data/postoffice/postoffices.json';
import { MapViewContainer } from '../MapViewContainer';
import type { MapProvider } from '../../providers/types';

type PostOfficeRow = [number, number, string, string];

const POST_OFFICES = postOfficesJson as PostOfficeRow[];

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 35.68049, longitude: 139.76669, altitude: 0 }),
  zoom: 10,
  bearing: 0,
  tilt: 0,
});

export function HeatmapLayerPage({ provider }: { provider: MapProvider }) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(false);
  }, [provider]);

  const heatmapPoints = useMemo(
    () =>
      POST_OFFICES.map(
        ([latitude, longitude], index) =>
          new HeatmapPointState({
            id: `heatmap-post-office-${index}`,
            position: GeoPoint.from({ latitude, longitude, altitude: 0 }),
          })
      ),
    []
  );

  const heatmap = <HeatmapOverlay points={heatmapPoints} />;

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="heatmap-layer"
        designTypes={{
          maplibre: MapLibreDesign.MapTilerTonerEn,
          'google-maps': GoogleMapDesign.Hybrid,
        }}
        style={styles.map}
        onMapLoaded={() => setMapReady(true)}
      >
        {heatmap}
      </MapViewContainer>

      {!mapReady ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>
            郵便局データを読み込み中 ({POST_OFFICES.length.toLocaleString()}件)…
          </Text>
        </View>
      ) : null}

      <View style={styles.controlPanel}>
        <Text style={styles.controlPanelTitle}>
          Heatmap Layer ({POST_OFFICES.length.toLocaleString()}件)
        </Text>
        <Text style={styles.note}>郵便局データをヒートマップで表示しています。</Text>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  loadingText: {
    marginTop: 12,
    color: '#1f1d26',
    fontSize: 14,
    fontWeight: '600',
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
  controlPanelTitle: {
    marginBottom: 8,
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
});
