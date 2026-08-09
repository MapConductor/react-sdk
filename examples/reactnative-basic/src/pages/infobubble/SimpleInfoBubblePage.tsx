import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ColorDefaultIcon,
  GeoPoint,
  MapCameraPosition,
  createMarkerState,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Marker } from '@mapconductor/js-sdk-react/native';

import { MapViewContainer } from '../MapViewContainer';
import type { MapProvider } from '../../providers/types';

const SAN_FRANCISCO = GeoPoint.from({ latitude: 37.7749, longitude: -122.4194, altitude: 0 });

const INIT_CAMERA = MapCameraPosition.from({
  position: SAN_FRANCISCO,
  zoom: 10,
  bearing: 0,
  tilt: 0,
});

export function SimpleInfoBubblePage({ provider }: { provider: MapProvider }) {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>('simple-text-bubble');

  const marker = useMemo(
    () =>
      createMarkerState({
        id: 'simple-text-bubble',
        position: SAN_FRANCISCO,
        icon: new ColorDefaultIcon({ fillColor: '#2563eb', label: 'SF', labelTextColor: '#ffffff' }),
        extra: 'San Francisco - The Golden Gate City',
        clickable: true,
        onClick: (state) => setSelectedMarkerId(state.id),
      }),
    []
  );

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="info-bubble-simple"
        style={styles.map}
        onMapClick={() => setSelectedMarkerId(null)}
      >
        <Marker state={marker} />
        {selectedMarkerId === marker.id ? (
          <InfoBubble marker={marker}>
            <Text style={styles.bubbleText}>{marker.extra as string}</Text>
          </InfoBubble>
        ) : null}
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <Text style={styles.title}>Simple InfoBubble</Text>
        <Text style={styles.note}>
          マーカーをタップすると吹き出しが開き、地図をタップすると閉じます。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' },
  map: { flex: 1 },
  bubbleText: { maxWidth: 220, color: '#111827', fontSize: 13, lineHeight: 18 },
  controlPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    maxWidth: 360,
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
  title: { marginBottom: 8, color: '#111827', fontSize: 16, fontWeight: '700' },
  note: { color: '#475569', fontSize: 13, lineHeight: 18 },
});
