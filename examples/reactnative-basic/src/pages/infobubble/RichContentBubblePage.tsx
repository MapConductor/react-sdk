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

interface LocationInfo extends Record<string, unknown> {
  name: string;
  description: string;
  rating: number;
}

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 37.7749, longitude: -122.4194, altitude: 0 }),
  zoom: 10,
  bearing: 0,
  tilt: 0,
});

export function RichContentBubblePage({ provider }: { provider: MapProvider }) {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>('golden-gate-park');

  const marker = useMemo(() => {
    const locationInfo: LocationInfo = {
      name: 'Golden Gate Park',
      description: 'A large urban park with gardens, museums, and recreational areas.',
      rating: 4.5,
    };
    return createMarkerState({
      id: 'golden-gate-park',
      position: GeoPoint.from({ latitude: 37.7694, longitude: -122.4862, altitude: 0 }),
      icon: new ColorDefaultIcon({ fillColor: '#22c55e', label: '🌳' }),
      extra: locationInfo,
      clickable: true,
      onClick: (state) => setSelectedMarkerId(state.id),
    });
  }, []);

  const info = marker.extra as LocationInfo;

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="info-bubble-rich"
        style={styles.map}
        onMapClick={() => setSelectedMarkerId(null)}
      >
        <Marker state={marker} />
        {selectedMarkerId === marker.id ? (
          <InfoBubble
            marker={marker}
            bubbleColor="#ffffff"
            borderColor="#000000"
            contentPadding={16}
            cornerRadius={12}
          >
            <View style={styles.richBubble}>
              <Text style={styles.richTitle}>{info.name}</Text>
              <Text style={styles.richDescription}>{info.description}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.stars}>
                  {Array.from({ length: 5 }, (_, index) =>
                    index < Math.floor(info.rating) ? '★' : '☆'
                  ).join('')}
                </Text>
                <Text style={styles.ratingValue}>{info.rating}/5</Text>
              </View>
            </View>
          </InfoBubble>
        ) : null}
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <Text style={styles.title}>Rich InfoBubble</Text>
        <Text style={styles.note}>
          吹き出しの中に任意のコンポーネントを置けます。ここでは説明文と評価を表示しています。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' },
  map: { flex: 1 },
  richBubble: { width: 240 },
  richTitle: { color: '#111827', fontSize: 15, fontWeight: '700' },
  richDescription: { marginTop: 6, color: '#374151', fontSize: 12, lineHeight: 17 },
  ratingRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  stars: { color: '#f59e0b', fontSize: 14 },
  ratingValue: { color: '#6b7280', fontSize: 12 },
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
