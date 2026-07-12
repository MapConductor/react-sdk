import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';

import {
  GeoPoint,
  MapCameraPosition,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import {
  GoogleMapDesign,
  GoogleMapView,
  useGoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreDesign,
  MapLibreView,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';

type MapProvider = 'maplibre' | 'google-maps';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 21.3069, longitude: -157.8583, altitude: 0 }),
  zoom: 14,
  bearing: 0,
  tilt: 0,
});

const TILT_PRESETS = [-60, -30, 0, 30, 60];
const TILT_DURATION_MS = 400;

function TiltMap({
  provider,
  mapLibreState,
  googleState,
}: {
  provider: MapProvider;
  mapLibreState: ReturnType<typeof useMapLibreViewState>;
  googleState: ReturnType<typeof useGoogleMapViewState>;
}) {
  if (provider === 'google-maps') {
    return <GoogleMapView state={googleState} style={styles.map} />;
  }

  return <MapLibreView state={mapLibreState} style={styles.map} />;
}

function moveTilt(
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>,
  tilt: number,
  durationMillis: number
) {
  mapViewState.moveCameraTo(
    mapViewState.cameraPosition.copy({ tilt }),
    durationMillis
  );
}

export function TiltPage({ provider }: { provider: MapProvider }) {
  const [tilt, setTilt] = useState(0);

  const mapLibreState = useMapLibreViewState({
    id: 'tilt-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'tilt-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  const currentState = (
    provider === 'google-maps' ? googleState : mapLibreState
  ) as MapViewStateInterface<MapDesignTypeInterface<unknown>>;

  const setCameraTilt = (nextTilt: number, durationMillis = 0) => {
    const clampedTilt = Math.max(-60, Math.min(60, nextTilt));
    setTilt(clampedTilt);
    moveTilt(currentState, clampedTilt, durationMillis);
  };

  return (
    <View style={styles.mapContainer}>
      <TiltMap provider={provider} mapLibreState={mapLibreState} googleState={googleState} />

      <View style={styles.controlPanel}>
        <Text style={styles.controlPanelTitle}>Tilt</Text>
        <View style={styles.valueRow}>
          <Text style={styles.tiltValue}>{tilt.toFixed(0)} deg</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={-60}
          maximumValue={60}
          step={1}
          value={tilt}
          minimumTrackTintColor="#2563eb"
          maximumTrackTintColor="#cbd5e1"
          thumbTintColor="#2563eb"
          onValueChange={setCameraTilt}
          onSlidingComplete={(value) => setCameraTilt(value, 0)}
        />
        <View style={styles.presetRow}>
          {TILT_PRESETS.map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.presetButton, tilt === value && styles.presetButtonActive]}
              activeOpacity={0.75}
              onPress={() => setCameraTilt(value, TILT_DURATION_MS)}
            >
              <Text
                style={[styles.presetButtonText, tilt === value && styles.presetButtonTextActive]}
                numberOfLines={1}
              >
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiltValue: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 42,
    marginTop: 6,
  },
  presetRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    width: 48,
    minHeight: 34,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  presetButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  presetButtonTextActive: {
    color: '#1d4ed8',
  },
});
