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
import {
  GoogleMapDesign,
  useGoogleMapViewState,
} from '@mapconductor/reactnative-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
} from '@mapconductor/reactnative-for-maplibre';
import { MapViewContainer } from '../../MapViewContainer';

type MapProvider = 'maplibre' | 'google-maps' | 'here';

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

function MarkerAnimationMap({
  provider,
  mapLibreState,
  googleState,
  marker,
}: {
  provider: MapProvider;
  mapLibreState: ReturnType<typeof useMapLibreViewState>;
  googleState: ReturnType<typeof useGoogleMapViewState>;
  marker: MarkerState;
}) {
  const state = provider === 'google-maps' ? googleState : mapLibreState;
  return (
    <MapViewContainer state={state} style={styles.map}>
      <Marker state={marker} />
    </MapViewContainer>
  );
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

  const mapLibreState = useMapLibreViewState({
    id: 'marker-animation-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'marker-animation-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  return (
    <View style={styles.mapContainer}>
      <MarkerAnimationMap
        provider={provider}
        mapLibreState={mapLibreState}
        googleState={googleState}
        marker={marker}
      />

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
