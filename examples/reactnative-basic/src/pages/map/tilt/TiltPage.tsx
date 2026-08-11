import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';

/**
 * ほとんどのプロバイダは 60 度で頭打ちになるが、ArcGIS だけは 90 度近くまで実際に傾く。
 * その範囲を触れるようにするためスライダーは ±89 にしてある
 * （android-sdk の TiltMapPage.kt / ios-sdk の TiltMapPage.swift と同じ範囲）。
 */
const TILT_LIMIT = 89;

import {
  GeoPoint,
  MapCameraPosition,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import { MapLibreDesign } from '@mapconductor/reactnative-for-maplibre';
import { MapViewContainer } from '../../MapViewContainer';
import { useMapStateRef } from '../../../providers/useMapStateRef';
import type { MapProvider } from '../../../providers/types';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 21.3069, longitude: -157.8583, altitude: 0 }),
  zoom: 14,
  bearing: 0,
  tilt: 0,
});

const TILT_PRESETS = [-60, -30, 0, 30, 60];
const TILT_DURATION_MS = 400;

function moveTilt(
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>,
  cameraPosition: MapCameraPosition,
  tilt: number,
  durationMillis: number
) {
  const nextCameraPosition = cameraPosition.copy({ tilt });
  mapViewState.moveCameraTo(nextCameraPosition, durationMillis);
  return nextCameraPosition;
}

export function TiltPage({ provider }: { provider: MapProvider }) {
  const [tilt, setTilt] = useState(0);
  const cameraPositionRef = useRef(INIT_CAMERA);
  const { stateRef, onStateReady } = useMapStateRef();

  const setCameraTilt = (nextTilt: number, durationMillis = 0) => {
    const clampedTilt = Math.max(-60, Math.min(60, nextTilt));
    setTilt(clampedTilt);
    const mapViewState = stateRef.current;
    if (!mapViewState) return;
    cameraPositionRef.current = moveTilt(
      mapViewState,
      cameraPositionRef.current,
      clampedTilt,
      durationMillis
    );
  };

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="tilt"
        style={styles.map}
        designTypes={{ maplibre: MapLibreDesign.OsmBright }}
        onStateReady={onStateReady}
      />

      <View style={styles.controlPanel}>
        <Text style={styles.controlPanelTitle}>Tilt</Text>
        <View style={styles.valueRow}>
          <Text style={styles.tiltValue}>{tilt.toFixed(0)} deg</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={-TILT_LIMIT}
          maximumValue={TILT_LIMIT}
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
