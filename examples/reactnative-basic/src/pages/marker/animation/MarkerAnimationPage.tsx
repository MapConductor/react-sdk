import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GeoPoint,
  MapCameraPosition,
  MarkerAnimation,
  createMarkerState,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Marker } from '@mapconductor/js-sdk-react/native';
import { MapViewContainer } from '../../MapViewContainer';
import type { MapProvider } from '../../../providers/types';

const HONOLULU = GeoPoint.from({ latitude: 21.3825, longitude: -157.933, altitude: 0 });

const INIT_CAMERA = MapCameraPosition.from({
  position: HONOLULU,
  zoom: 14,
  bearing: 0,
  tilt: 0,
});

function triggerAnimation(marker: MarkerState, animation: MarkerAnimation) {
  marker.animate(animation);
  setTimeout(() => marker.animate(null), 900);
}

export function MarkerAnimationPage({ provider }: { provider: MapProvider }) {
  const [marker] = useState(
    () =>
      createMarkerState({
        id: 'animated-marker',
        position: HONOLULU,
        clickable: true,
        onClick: (state) => triggerAnimation(state, MarkerAnimation.Bounce),
      })
  );

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="marker-animation"
        style={styles.map}
      >
        <Marker state={marker} />
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <Text style={styles.controlPanelTitle}>Marker Animation</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.75}
            onPress={() => triggerAnimation(marker, MarkerAnimation.Drop)}
          >
            <Text style={styles.actionButtonText} numberOfLines={1}>
              Drop marker
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.75}
            onPress={() => triggerAnimation(marker, MarkerAnimation.Bounce)}
          >
            <Text style={styles.actionButtonText} numberOfLines={1}>
              Bounce marker
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.note}>Tap the marker or a button to trigger markerState.animate().</Text>
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
  controlPanelTitle: {
    marginBottom: 12,
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    minWidth: 128,
    minHeight: 36,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  note: {
    marginTop: 10,
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
});
