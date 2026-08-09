import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  ColorDefaultIcon,
  GeoPoint,
  MapCameraPosition,
  createMarkerState,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Markers } from '@mapconductor/js-sdk-react/native';

import { MapViewContainer } from '../MapViewContainer';
import type { MapProvider } from '../../providers/types';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 37.7749, longitude: -122.4194, altitude: 0 }),
  zoom: 15,
  bearing: 0,
  tilt: 45,
});

const PLACES = [
  { latitude: 37.7749, longitude: -122.4194, name: 'Restaurant A', color: '#ef4444' },
  { latitude: 37.7849, longitude: -122.4094, name: 'Hotel B', color: '#2563eb' },
  { latitude: 37.7649, longitude: -122.4294, name: 'Shop C', color: '#22c55e' },
];

export function MultipleBubblesPage({ provider }: { provider: MapProvider }) {
  const [selectedMarkerIds, setSelectedMarkerIds] = useState<Set<string>>(
    () => new Set(['marker_0', 'marker_1', 'marker_2'])
  );

  const toggle = (id: string) =>
    setSelectedMarkerIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const markers = useMemo(
    () =>
      PLACES.map((place, index) =>
        createMarkerState({
          id: `marker_${index}`,
          position: GeoPoint.from({
            latitude: place.latitude,
            longitude: place.longitude,
            altitude: 0,
          }),
          icon: new ColorDefaultIcon({
            fillColor: place.color,
            label: `${index + 1}`,
            labelTextColor: '#ffffff',
          }),
          extra: place.name,
          clickable: true,
          onClick: (state) => toggle(state.id),
        })
      ),
    []
  );

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="info-bubble-multiple"
        style={styles.map}
        onMapClick={() => setSelectedMarkerIds(new Set())}
      >
        <Markers states={markers} />
        {markers.map((marker) =>
          selectedMarkerIds.has(marker.id) ? (
            <InfoBubble key={marker.id} marker={marker} bubbleColor="#ffffff" borderColor="#000000">
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() =>
                  setSelectedMarkerIds((previous) => {
                    const next = new Set(previous);
                    next.delete(marker.id);
                    return next;
                  })
                }
              >
                <Text style={styles.bubbleTitle}>{marker.extra as string}</Text>
                <Text style={styles.bubbleHint}>Tap to close</Text>
              </TouchableOpacity>
            </InfoBubble>
          ) : null
        )}
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <Text style={styles.title}>Multiple InfoBubbles</Text>
        <Text style={styles.note}>
          複数の吹き出しを同時に表示します。マーカーで開閉、地図タップで全て閉じます。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' },
  map: { flex: 1 },
  bubbleTitle: { color: '#111827', fontSize: 13, fontWeight: '700' },
  bubbleHint: { marginTop: 2, color: '#6b7280', fontSize: 11 },
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
